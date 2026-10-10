-- Evolução aditiva do histórico de atividades: registrar lançamentos financeiros sem dados bancários.
ALTER TABLE hub_activity_events DROP CONSTRAINT IF EXISTS hub_activity_events_action_check;
ALTER TABLE hub_activity_events ADD CONSTRAINT hub_activity_events_action_check
 CHECK (action IN ('login','logout','client_created','client_updated','client_project_linked','client_project_unlinked','project_created','project_updated','project_archived','task_created','task_updated','task_status_changed','profile_updated','password_changed','finance_created','finance_updated','finance_status_changed'));
ALTER TABLE hub_activity_events DROP CONSTRAINT IF EXISTS hub_activity_events_entity_type_check;
ALTER TABLE hub_activity_events ADD CONSTRAINT hub_activity_events_entity_type_check
 CHECK (entity_type IS NULL OR entity_type IN ('client','project','task','finance'));
