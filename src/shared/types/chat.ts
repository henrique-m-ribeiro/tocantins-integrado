/**
 * Tipos relacionados ao Chat e Conversação
 */

import type { VisualizationData } from './agents';

// Canal de comunicação
export type ChatChannel = 'dashboard' | 'whatsapp';

// Tipo de mensagem
export type MessageType = 'text' | 'audio' | 'image' | 'document';

// Role da mensagem
export type MessageRole = 'user' | 'assistant' | 'system';

// Sessão de chat
export interface ChatSession {
  id: string;
  user_id?: string;
  channel: ChatChannel;
  whatsapp_number?: string;
  started_at: Date;
  last_activity_at: Date;
  is_active: boolean;
  context: SessionContext;
}

// Contexto da sessão
export interface SessionContext {
  current_municipality_id?: string;
  current_microregion_id?: string;
  last_query_type?: string;
  conversation_summary?: string;
  preferences?: {
    language: 'pt-BR';
    detail_level: 'summary' | 'detailed' | 'technical';
  };
}

// Mensagem de chat
export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  audio_url?: string;
  audio_duration_seconds?: number;
  attachments?: MessageAttachment[];
  visualizations?: VisualizationData[];
  metadata?: MessageMetadata;
  created_at: Date;
}

// Anexo de mensagem
export interface MessageAttachment {
  id: string;
  type: 'pdf' | 'image' | 'csv';
  name: string;
  url: string;
  size_bytes: number;
}

// Metadados da mensagem
export interface MessageMetadata {
  processing_time_ms?: number;
  agents_used?: string[];
  tokens_used?: number;
  model?: string;
  was_transcribed?: boolean;
}

// Requisição de chat do dashboard
export interface DashboardChatRequest {
  session_id?: string;
  message: string;
  context?: {
    municipality_id?: string;
    microregion_id?: string;
  };
}

// Resposta de chat do dashboard
export interface DashboardChatResponse {
  session_id: string;
  message: ChatMessage;
  suggestions?: string[];
}

// Webhook do WhatsApp (Evolution API)
export interface WhatsAppWebhookPayload {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    pushName?: string;
    message?: {
      conversation?: string;
      extendedTextMessage?: {
        text: string;
      };
      audioMessage?: {
        url: string;
        mimetype: string;
        seconds: number;
      };
    };
    messageType: string;
    messageTimestamp: number;
  };
}

// Mensagem para enviar via WhatsApp
export interface WhatsAppOutgoingMessage {
  number: string;
  text?: string;
  media?: {
    type: 'audio' | 'image' | 'document';
    url: string;
    caption?: string;
    fileName?: string;
  };
}

// Resposta de transcrição de áudio
export interface AudioTranscription {
  text: string;
  duration_seconds: number;
  language: string;
  confidence: number;
}
