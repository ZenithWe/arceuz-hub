
-- Fase 3: Tarefas. Migration incremental; não apaga dados anteriores.
ALTER TABLE hub_tasks ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE hub_tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_hub_tasks_status_assignee ON hub_tasks(status,assigned_to,due_on);
CREATE INDEX IF NOT EXISTS idx_hub_tasks_project ON hub_tasks(project_id);
