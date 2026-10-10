-- Evolução aditiva, preserva todos os repositórios cadastrados.
ALTER TABLE hub_repositories ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE hub_repositories ADD COLUMN IF NOT EXISTS language text;
ALTER TABLE hub_repositories ADD COLUMN IF NOT EXISTS default_branch text;
ALTER TABLE hub_repositories ADD COLUMN IF NOT EXISTS stars integer NOT NULL DEFAULT 0;
ALTER TABLE hub_repositories ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'unknown';
ALTER TABLE hub_repositories ADD COLUMN IF NOT EXISTS sync_status text NOT NULL DEFAULT 'never';
ALTER TABLE hub_repositories ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_hub_repositories_project ON hub_repositories(project_id);
