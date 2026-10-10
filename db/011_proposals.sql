-- Módulo Propostas, migração aditiva
CREATE TABLE IF NOT EXISTS hub_proposals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title varchar(150) NOT NULL CHECK(char_length(title)>=3),
 client_id uuid REFERENCES hub_clients(id) ON DELETE SET NULL,
 project_id uuid REFERENCES hub_projects(id) ON DELETE SET NULL,
 amount_cents bigint NOT NULL CHECK(amount_cents BETWEEN 1 AND 100000000000),
 scope text NOT NULL CHECK(char_length(scope) BETWEEN 10 AND 8000),
 delivery_terms text NOT NULL DEFAULT '' CHECK(char_length(delivery_terms)<=2500),
 payment_terms text NOT NULL DEFAULT '' CHECK(char_length(payment_terms)<=2500),
 notes text NOT NULL DEFAULT '' CHECK(char_length(notes)<=3000),
 status varchar(20) NOT NULL DEFAULT 'draft' CHECK(status IN('draft','sent','negotiation','accepted','rejected')),
 valid_until date,
 created_by uuid REFERENCES hub_members(id) ON DELETE SET NULL,
 updated_by uuid REFERENCES hub_members(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hub_proposals_status_created ON hub_proposals(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hub_proposals_client ON hub_proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_hub_proposals_project ON hub_proposals(project_id);
