-- Arceuz Hub — new stand-alone Neon PostgreSQL database. NEVER run in the existing Arceuz database.
-- Statements are executed individually by scripts/migrate.mjs and tracked in hub_schema_migrations.
CREATE TABLE IF NOT EXISTS hub_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text UNIQUE NOT NULL CHECK (slot IN ('mateus','roberto')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 90),
  email text NOT NULL UNIQUE CHECK (char_length(email) <= 254),
  password_hash text NOT NULL,
  title text CHECK (char_length(title) <= 90),
  bio text CHECK (char_length(bio) <= 500),
  avatar_url text CHECK (avatar_url IS NULL OR (char_length(avatar_url) <= 500 AND avatar_url ~ '^https://')),
  theme text NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light')),
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_hub_members_email_ci ON hub_members (lower(email));

CREATE TABLE IF NOT EXISTS hub_sessions (
  token_digest text PRIMARY KEY CHECK (char_length(token_digest)=64),
  member_id uuid NOT NULL REFERENCES hub_members(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_hub_sessions_member ON hub_sessions(member_id);
CREATE INDEX IF NOT EXISTS idx_hub_sessions_expires ON hub_sessions(expires_at);

CREATE TABLE IF NOT EXISTS hub_login_guards (
  email_digest text PRIMARY KEY CHECK (char_length(email_digest)=64),
  attempts integer NOT NULL DEFAULT 0,
  window_started timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz
);

CREATE TABLE IF NOT EXISTS hub_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  client_name text,
  production_url text,
  demo_url text,
  repository_url text,
  technology text,
  status text NOT NULL DEFAULT 'idea'
    CHECK (status IN ('idea','planning','development','review','production','paused','completed','archived')),
  started_on date,
  due_on date,
  responsible_id uuid REFERENCES hub_members(id) ON DELETE SET NULL,
  notes text,
  expected_revenue_cents bigint NOT NULL DEFAULT 0 CHECK (expected_revenue_cents>=0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hub_projects_status ON hub_projects(status);

CREATE TABLE IF NOT EXISTS hub_repositories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES hub_projects(id) ON DELETE SET NULL,
  github_full_name text NOT NULL UNIQUE,
  html_url text NOT NULL,
  last_commit_at timestamptz,
  updated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hub_financial_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES hub_projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('income','expense')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  amount_cents bigint NOT NULL CHECK (amount_cents>0),
  category text,
  method text,
  reference text UNIQUE,
  competence_on date,
  due_on date,
  paid_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT paid_requires_date CHECK (status<>'paid' OR paid_on IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_hub_finance_status_paid ON hub_financial_entries(status,paid_on);
CREATE INDEX IF NOT EXISTS idx_hub_finance_direction ON hub_financial_entries(direction);

CREATE TABLE IF NOT EXISTS hub_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES hub_projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES hub_members(id) ON DELETE SET NULL,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','review','done')),
  due_on date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hub_tasks_due ON hub_tasks(due_on) WHERE status<>'done';

-- No client-side PostgREST or user-facing SQL: all operations pass through server authentication.
