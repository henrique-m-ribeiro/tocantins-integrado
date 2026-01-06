/**
 * Rotas de Chat - API Tocantins Integrado
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getOrchestrator } from '../../agents';
import { getServiceClient } from '../../database/client';
import type { DashboardChatRequest, ChatMessage } from '../../shared/types';

const router = Router();
const supabase = getServiceClient();

/**
 * POST /api/chat
 * Envia uma mensagem e recebe a resposta do assistente
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as DashboardChatRequest;

    if (!body.message || typeof body.message !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Campo "message" é obrigatório'
      });
    }

    // Criar ou recuperar sessão
    let sessionId = body.session_id;

    if (!sessionId) {
      // Criar nova sessão
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          channel: 'dashboard',
          context: body.context || {}
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      sessionId = session.id;
    }

    // Salvar mensagem do usuário
    const { data: userMessage, error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        type: 'text',
        content: body.message
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // Processar com o Orchestrator
    const orchestrator = getOrchestrator();
    const response = await orchestrator.query(body.message, 'dashboard');

    // Salvar resposta do assistente
    const assistantMessage: Partial<ChatMessage> = {
      session_id: sessionId,
      role: 'assistant',
      type: 'text',
      content: response.response.text,
      visualizations: response.response.visualizations,
      metadata: {
        processing_time_ms: response.metadata.processing_time_ms,
        agents_used: response.agents_used,
        model: response.metadata.model_used
      }
    };

    const { data: savedMessage, error: saveError } = await supabase
      .from('chat_messages')
      .insert(assistantMessage)
      .select()
      .single();

    if (saveError) throw saveError;

    // Gerar sugestões de perguntas relacionadas
    const suggestions = generateSuggestions(body.message, response.agents_used);

    res.json({
      session_id: sessionId,
      message: savedMessage,
      suggestions
    });

  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao processar mensagem'
    });
  }
});

/**
 * GET /api/chat/sessions/:sessionId
 * Recupera histórico de uma sessão
 */
router.get('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({
      session_id: sessionId,
      messages
    });

  } catch (error) {
    console.error('Erro ao recuperar sessão:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao recuperar sessão'
    });
  }
});

/**
 * POST /api/chat/sessions/:sessionId/feedback
 * Envia feedback sobre uma mensagem
 */
router.post('/sessions/:sessionId/feedback', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { message_id, rating, feedback_text, was_helpful } = req.body;

    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        message_id,
        rating,
        feedback_text,
        was_helpful
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      feedback_id: data.id
    });

  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao salvar feedback'
    });
  }
});

/**
 * DELETE /api/chat/sessions/:sessionId
 * Encerra uma sessão de chat
 */
router.delete('/sessions/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const { error } = await supabase
      .from('chat_sessions')
      .update({
        is_active: false,
        ended_at: new Date()
      })
      .eq('id', sessionId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Sessão encerrada'
    });

  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Erro ao encerrar sessão'
    });
  }
});

/**
 * Gera sugestões de perguntas relacionadas
 */
function generateSuggestions(query: string, agentsUsed: string[]): string[] {
  const suggestions: string[] = [];

  // Sugestões baseadas nas dimensões usadas
  if (agentsUsed.includes('ECON')) {
    suggestions.push('Qual o PIB per capita deste município?');
    suggestions.push('Compare a economia com a média estadual');
  }

  if (agentsUsed.includes('SOCIAL')) {
    suggestions.push('Como está a educação neste município?');
    suggestions.push('Qual a taxa de mortalidade infantil?');
  }

  if (agentsUsed.includes('TERRA')) {
    suggestions.push('Qual a cobertura de saneamento básico?');
    suggestions.push('Como está a infraestrutura urbana?');
  }

  if (agentsUsed.includes('AMBIENT')) {
    suggestions.push('Qual a cobertura vegetal nativa?');
    suggestions.push('Existem áreas de conservação?');
  }

  // Sugestões gerais
  suggestions.push('Compare com outros municípios da região');
  suggestions.push('Mostre a evolução nos últimos anos');

  // Retornar até 4 sugestões
  return suggestions.slice(0, 4);
}

export { router as chatRouter };
