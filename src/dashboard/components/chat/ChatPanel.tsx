'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, X, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    municipality_id?: string;
    microregion_id?: string;
  };
}

export function ChatPanel({ isOpen, onClose, context }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll para o fim quando novas mensagens chegam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mutation para enviar mensagem
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await api.sendChatMessage({
        session_id: sessionId || undefined,
        message,
        context
      });
      return response;
    },
    onSuccess: (data) => {
      setSessionId(data.session_id);
      // Convert ChatMessage to local Message format
      const newMessage: Message = {
        id: data.message.id,
        role: data.message.role,
        content: data.message.content,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      setSuggestions(data.suggestions || []);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    sendMessage.mutate(input.trim());
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!isOpen) return null;

  return (
    <aside className="w-96 bg-white border-l flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-tocantins-blue to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Assistente IA</h3>
              <p className="text-xs text-white/70">Pergunte sobre qualquer município</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-tocantins-blue/50 mb-4" />
            <h4 className="font-medium text-gray-800 mb-2">
              Como posso ajudar?
            </h4>
            <p className="text-sm text-gray-500 mb-6">
              Pergunte sobre indicadores, compare municípios ou solicite análises.
            </p>

            {/* Sugestões iniciais */}
            <div className="space-y-2">
              {[
                'Como está a educação em Palmas?',
                'Compare Araguaína e Gurupi',
                'Quais os principais desafios do Bico do Papagaio?'
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="block w-full px-4 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.role} animate-fade-in`}
            >
              <div className={`
                flex gap-3
                ${message.role === 'user' ? 'flex-row-reverse' : ''}
              `}>
                {/* Avatar */}
                <div className={`
                  w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                  ${message.role === 'user'
                    ? 'bg-tocantins-blue text-white'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message bubble */}
                <div className={`
                  max-w-[80%] rounded-2xl px-4 py-2.5
                  ${message.role === 'user'
                    ? 'bg-tocantins-blue text-white rounded-tr-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }
                `}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {sendMessage.isPending && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot className="h-4 w-4 text-gray-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          </div>
        )}

        {/* Sugestões de follow-up */}
        {suggestions.length > 0 && !sendMessage.isPending && (
          <div className="pt-2 space-y-2">
            <p className="text-xs text-gray-500 font-medium">Sugestões:</p>
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="block w-full px-3 py-2 text-xs text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-tocantins-blue/50"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sendMessage.isPending}
            className="p-2 bg-tocantins-blue text-white rounded-full hover:bg-tocantins-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </aside>
  );
}
