-- Módulo Clientes, exclusivo do Arceuz Hub. Adição não destrutiva.
CREATE TABLE IF NOT EXISTS hub_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  contact_name text NOT NULL DEFAULT '' CHECK (char_length(contact_name) <= 120),
  email text NOT NULL DEFAULT '' CHECK (char_length(email) <= 254),
  phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 40),
  whatsapp text NOT NULL DEFAULT '' CHECK (char_length(whatsapp) <= 40),
  website text CHECK (website IS NULL OR (char_length(website) <= 500 AND website ~ '^https://')),
  status text NOT NULL DEFAULT 'lead' CHECK (status IN ('lead','negociacao','ativo','inativo')),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 5000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hub_clients_status ON hub_clients(status,created_at DESC);
ALTER TABLE hub_projects ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES hub_clients(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_hub_projects_client ON hub_projects(client_id);
