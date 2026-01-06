-- ============================================
-- Migration 003: Criação das tabelas de chat e sessões
-- Tocantins Integrado - MVP v1.0
-- ============================================

-- Canal de comunicação
CREATE TYPE chat_channel AS ENUM ('dashboard', 'whatsapp');

-- Tipo de mensagem
CREATE TYPE message_type AS ENUM ('text', 'audio', 'image', 'document');

-- Role da mensagem
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- Status de processamento
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'error');

-- Sessões de chat
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    channel chat_channel NOT NULL,
    whatsapp_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    -- Contexto da conversa
    context JSONB DEFAULT '{}'::jsonb,
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- Mensagens de chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    type message_type DEFAULT 'text',
    content TEXT NOT NULL,
    -- Áudio (se aplicável)
    audio_url TEXT,
    audio_duration_seconds INTEGER,
    was_transcribed BOOLEAN DEFAULT false,
    -- Anexos e visualizações
    attachments JSONB DEFAULT '[]'::jsonb,
    visualizations JSONB DEFAULT '[]'::jsonb,
    -- Metadados de processamento
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requisições ao orquestrador
CREATE TABLE IF NOT EXISTS orchestrator_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    query_type VARCHAR(50),
    status processing_status DEFAULT 'pending',
    -- Contexto da requisição
    context JSONB DEFAULT '{}'::jsonb,
    -- Resultado
    response JSONB,
    agents_used TEXT[],
    -- Métricas
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    model_used VARCHAR(50),
    -- Erros
    error_message TEXT
);

-- Log de execução dos agentes
CREATE TABLE IF NOT EXISTS agent_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orchestrator_request_id UUID NOT NULL REFERENCES orchestrator_requests(id) ON DELETE CASCADE,
    dimension dimension_type NOT NULL,
    status processing_status DEFAULT 'pending',
    -- Input/Output
    input_context JSONB,
    output_analysis JSONB,
    -- Métricas
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER,
    -- Erros
    error_message TEXT
);

-- Feedback dos usuários
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    was_helpful BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Análises salvas/exportadas
CREATE TABLE IF NOT EXISTS saved_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    analysis_type VARCHAR(50),
    content JSONB NOT NULL,
    -- Exportação
    export_format VARCHAR(10),
    export_url TEXT,
    -- Metadados
    municipality_ids UUID[],
    microregion_ids UUID[],
    dimensions dimension_type[],
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_chat_sessions_channel ON chat_sessions(channel);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_whatsapp ON chat_sessions(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_orchestrator_requests_status ON orchestrator_requests(status);
CREATE INDEX IF NOT EXISTS idx_orchestrator_requests_message ON orchestrator_requests(message_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_request ON agent_execution_logs(orchestrator_request_id);
CREATE INDEX IF NOT EXISTS idx_saved_analyses_session ON saved_analyses(session_id);

-- Trigger para atualizar last_activity_at na sessão
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_sessions
    SET last_activity_at = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_session_on_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- Comentários
COMMENT ON TABLE chat_sessions IS 'Sessões de chat (Dashboard ou WhatsApp)';
COMMENT ON TABLE chat_messages IS 'Mensagens de chat entre usuário e assistente';
COMMENT ON TABLE orchestrator_requests IS 'Requisições processadas pelo orquestrador';
COMMENT ON TABLE agent_execution_logs IS 'Log de execução de cada agente dimensional';
COMMENT ON TABLE user_feedback IS 'Feedback dos usuários sobre as respostas';
COMMENT ON TABLE saved_analyses IS 'Análises salvas e exportadas pelos usuários';
