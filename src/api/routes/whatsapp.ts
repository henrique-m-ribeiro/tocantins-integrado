/**
 * Rotas de WhatsApp - API Tocantins Integrado
 * Integração com Evolution API
 */

import { Router, Request, Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getOrchestrator } from '../../agents';
import { getServiceClient } from '../../database/client';
import { transcribeAudio } from '../services/transcription';
import type { WhatsAppWebhookPayload, ChatMessage } from '../../shared/types';

const router = Router();
const supabase = getServiceClient();

// Configuração da Evolution API
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE_NAME;

/**
 * POST /api/whatsapp/webhook
 * Recebe mensagens do WhatsApp via Evolution API
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body as WhatsAppWebhookPayload;

    // Verificar se é uma mensagem recebida
    if (payload.event !== 'messages.upsert' || payload.data.key.fromMe) {
      return res.status(200).json({ status: 'ignored' });
    }

    const { data } = payload;
    const phoneNumber = data.key.remoteJid.replace('@s.whatsapp.net', '');
    const messageType = data.messageType;

    // Buscar ou criar sessão
    let session = await findOrCreateSession(phoneNumber);

    let messageContent = '';
    let wasTranscribed = false;

    // Processar diferentes tipos de mensagem
    if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
      messageContent = data.message?.conversation ||
                       data.message?.extendedTextMessage?.text || '';
    } else if (messageType === 'audioMessage') {
      // Transcrever áudio
      const audioUrl = data.message?.audioMessage?.url || '';
      if (audioUrl) {
        const transcription = await transcribeAudio(audioUrl);
        messageContent = transcription.text;
        wasTranscribed = true;

        // Salvar mensagem de áudio
        await saveMessage(session.id, {
          role: 'user',
          type: 'audio',
          content: messageContent,
          audio_url: audioUrl,
          audio_duration_seconds: data.message?.audioMessage?.seconds,
          was_transcribed: true
        });
      }
    } else {
      // Tipo de mensagem não suportado
      await sendWhatsAppMessage(phoneNumber,
        '🤖 Desculpe, no momento só consigo processar mensagens de texto e áudio. Por favor, envie sua pergunta em texto ou áudio.'
      );
      return res.status(200).json({ status: 'unsupported_type' });
    }

    if (!messageContent.trim()) {
      return res.status(200).json({ status: 'empty_message' });
    }

    // Salvar mensagem do usuário (se não foi áudio já salvo)
    if (!wasTranscribed) {
      await saveMessage(session.id, {
        role: 'user',
        type: 'text',
        content: messageContent
      });
    }

    // Enviar indicador de "digitando..."
    await sendTypingIndicator(phoneNumber);

    // Processar com o Orchestrator
    const orchestrator = getOrchestrator();
    const response = await orchestrator.query(messageContent, 'whatsapp');

    // Formatar resposta para WhatsApp
    const formattedResponse = formatForWhatsApp(response.response.text);

    // Enviar resposta
    await sendWhatsAppMessage(phoneNumber, formattedResponse);

    // Salvar resposta do assistente
    await saveMessage(session.id, {
      role: 'assistant',
      type: 'text',
      content: response.response.text,
      metadata: {
        processing_time_ms: response.metadata.processing_time_ms,
        agents_used: response.agents_used
      }
    });

    res.status(200).json({ status: 'processed' });

  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao processar webhook'
    });
  }
});

/**
 * POST /api/whatsapp/send
 * Envia mensagem para um número (uso interno)
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { number, message } = req.body;

    if (!number || !message) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Campos "number" e "message" são obrigatórios'
      });
    }

    await sendWhatsAppMessage(number, message);

    res.json({ success: true });

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao enviar mensagem'
    });
  }
});

/**
 * GET /api/whatsapp/status
 * Verifica status da conexão WhatsApp
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
      return res.json({
        connected: false,
        message: 'Configuração da Evolution API incompleta'
      });
    }

    const response = await axios.get(
      `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`,
      {
        headers: {
          'apikey': EVOLUTION_API_KEY
        }
      }
    );

    res.json({
      connected: response.data?.state === 'open',
      state: response.data?.state,
      instance: EVOLUTION_INSTANCE
    });

  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Erro ao verificar status'
    });
  }
});

/**
 * Funções auxiliares
 */

async function findOrCreateSession(phoneNumber: string) {
  // Buscar sessão ativa
  const { data: existingSession } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('channel', 'whatsapp')
    .eq('whatsapp_number', phoneNumber)
    .eq('is_active', true)
    .order('last_activity_at', { ascending: false })
    .limit(1)
    .single();

  if (existingSession) {
    return existingSession;
  }

  // Criar nova sessão
  const { data: newSession, error } = await supabase
    .from('chat_sessions')
    .insert({
      channel: 'whatsapp',
      whatsapp_number: phoneNumber,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return newSession;
}

async function saveMessage(sessionId: string, message: Partial<ChatMessage>) {
  const { error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      ...message
    });

  if (error) {
    console.error('Erro ao salvar mensagem:', error);
  }
}

async function sendWhatsAppMessage(number: string, text: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.error('Evolution API não configurada');
    return;
  }

  try {
    await axios.post(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        number: number,
        text: text
      },
      {
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    throw error;
  }
}

async function sendTypingIndicator(number: string) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    return;
  }

  try {
    await axios.post(
      `${EVOLUTION_API_URL}/chat/updatePresence/${EVOLUTION_INSTANCE}`,
      {
        number: number,
        presence: 'composing'
      },
      {
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    // Silently fail - não é crítico
  }
}

function formatForWhatsApp(text: string): string {
  // Limitar tamanho da mensagem (WhatsApp tem limite de ~65000 caracteres)
  const maxLength = 4000;

  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '\n\n... (resposta truncada)';
  }

  // Converter markdown básico para formatação WhatsApp
  text = text
    .replace(/\*\*(.*?)\*\*/g, '*$1*')  // Bold
    .replace(/__(.*?)__/g, '_$1_')      // Italic
    .replace(/```(.*?)```/gs, '```$1```') // Code blocks

  return text;
}

export { router as whatsappRouter };
