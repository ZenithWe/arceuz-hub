-- Histórico de ações do Arceuz Hub; somente usuários internos e ações do próprio sistema.
-- Nunca registrar senhas, tokens, texto de formulários privados ou navegação externa.
CREATE TABLE IF NOT EXISTS hub_activity_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 member_id uuid NOT NULL REFERENCES hub_members(id) ON DELETE CASCADE,
 action text NOT NULL CHECK (action IN (
   'login','logout','client_created','client_updated','client_project_linked','client_project_unlinked',
   'project_created','project_updated','project_archived',
   'task_created','task_updated','task_status_changed','profile_updated','password_changed'
 )),
 entity_type text CHECK (entity_type IS NULL OR entity_type IN ('client','project','task')),
 entity_id uuid,
 subject text NOT NULL DEFAULT '' CHECK (char_length(subject)<=160),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hub_activity_member_date ON hub_activity_events(member_id, created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_hub_activity_date ON hub_activity_events(created_at DESC,id DESC);
