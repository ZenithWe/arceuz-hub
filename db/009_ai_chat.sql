-- Conversas separadas por membro. Nunca armazenar a chave da API no banco.
CREATE TABLE IF NOT EXISTS hub_ai_conversations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id uuid NOT NULL REFERENCES hub_members(id) ON DELETE CASCADE,
 title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 110),
 mode text NOT NULL DEFAULT 'general' CHECK (mode IN ('general','sales','proposals','marketing','websites','analysis')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hub_ai_conversations_owner ON hub_ai_conversations(owner_id,updated_at DESC);
CREATE TABLE IF NOT EXISTS hub_ai_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 seq bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
 conversation_id uuid NOT NULL REFERENCES hub_ai_conversations(id) ON DELETE CASCADE,
 role text NOT NULL CHECK(role IN ('user','assistant')),
 content text NOT NULL CHECK(char_length(content) BETWEEN 1 AND 10000),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hub_ai_messages_conversation ON hub_ai_messages(conversation_id,seq DESC);
CREATE INDEX IF NOT EXISTS idx_hub_ai_messages_created ON hub_ai_messages(created_at DESC);
