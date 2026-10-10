-- Arceuz Hub: adições não destrutivas ao módulo Financeiro.
ALTER TABLE hub_financial_entries ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE hub_financial_entries ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';
ALTER TABLE hub_financial_entries ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES hub_members(id) ON DELETE SET NULL;
ALTER TABLE hub_financial_entries ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES hub_members(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_hub_finance_due ON hub_financial_entries(due_on) WHERE status='pending';
CREATE INDEX IF NOT EXISTS idx_hub_finance_project ON hub_financial_entries(project_id);
