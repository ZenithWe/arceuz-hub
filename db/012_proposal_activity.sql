-- Amplia o registro de ações e tipos para propostas sem apagar o histórico anterior.
ALTER TABLE hub_activity_events DROP CONSTRAINT IF EXISTS hub_activity_events_action_check;
ALTER TABLE hub_activity_events ADD CONSTRAINT hub_activity_events_action_check CHECK(action IN (
 'login','logout','client_created','client_updated','client_project_linked','client_project_unlinked','client_deleted',
 'project_created','project_updated','project_archived','project_deleted','task_created','task_updated','task_status_changed','task_deleted',
 'profile_updated','password_changed','finance_created','finance_updated','finance_status_changed','finance_deleted',
 'repository_deleted','proposal_created','proposal_updated','proposal_deleted'
));
ALTER TABLE hub_activity_events DROP CONSTRAINT IF EXISTS hub_activity_events_entity_type_check;
ALTER TABLE hub_activity_events ADD CONSTRAINT hub_activity_events_entity_type_check CHECK(entity_type IS NULL OR entity_type IN('client','project','task','finance','repository','proposal'));
