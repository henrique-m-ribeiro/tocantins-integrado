/**
 * Serviço de Transcrição de Áudio
 * Tocantins Integrado - MVP v1.0
 */

import OpenAI from 'openai';
import axios from 'axios';
import { createWriteStream, unlinkSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { AudioTranscription } from '../../shared/types';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada. A transcrição de áudio não está disponível.');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
}

const TEMP_DIR = '/tmp/tocantins-audio';

// Garantir que o diretório temporário existe
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Transcreve áudio de uma URL usando OpenAI Whisper
 */
export async function transcribeAudio(audioUrl: string): Promise<AudioTranscription> {
  const client = getOpenAIClient();
  const tempFile = join(TEMP_DIR, `${uuidv4()}.ogg`);

  try {
    // Download do áudio
    const response = await axios({
      method: 'GET',
      url: audioUrl,
      responseType: 'stream'
    });

    // Salvar temporariamente
    const writer = createWriteStream(tempFile);
    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Transcrever com Whisper
    const transcription = await client.audio.transcriptions.create({
      file: await import('fs').then(fs =>
        fs.createReadStream(tempFile)
      ),
      model: 'whisper-1',
      language: 'pt',
      response_format: 'verbose_json'
    });

    // Limpar arquivo temporário
    if (existsSync(tempFile)) {
      unlinkSync(tempFile);
    }

    return {
      text: transcription.text,
      duration_seconds: transcription.duration || 0,
      language: transcription.language || 'pt',
      confidence: 0.9 // Whisper não retorna confidence, usar valor padrão
    };

  } catch (error) {
    // Limpar arquivo temporário em caso de erro
    if (existsSync(tempFile)) {
      unlinkSync(tempFile);
    }

    console.error('Erro na transcrição:', error);
    throw new Error(`Falha ao transcrever áudio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Verifica se o serviço de transcrição está disponível
 */
export async function checkTranscriptionService(): Promise<boolean> {
  try {
    // Verificar se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return false;
    }

    const client = getOpenAIClient();
    // Tentar listar modelos para verificar conectividade
    await client.models.retrieve('whisper-1');
    return true;
  } catch {
    return false;
  }
}
