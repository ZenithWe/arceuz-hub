export const eventLabels=Object.freeze({
 login:'Entrou no Hub',logout:'Saiu do Hub',
 client_created:'Cadastrou um cliente',client_updated:'Atualizou um cliente',
 client_project_linked:'Vinculou um projeto ao cliente',client_project_unlinked:'Desvinculou um projeto',
 project_created:'Criou um projeto',project_updated:'Editou um projeto',project_archived:'Arquivou um projeto',
 task_created:'Criou uma tarefa',task_updated:'Editou uma tarefa',task_status_changed:'Alterou a etapa de uma tarefa',
 profile_updated:'Atualizou o perfil',password_changed:'Alterou a própria senha',
 finance_created:'Criou um lançamento financeiro',finance_updated:'Editou um lançamento financeiro',finance_status_changed:'Alterou a situação de um lançamento',
 client_deleted:'Excluiu um cliente',project_deleted:'Excluiu um projeto ou site',task_deleted:'Excluiu uma tarefa',finance_deleted:'Excluiu um lançamento financeiro',repository_deleted:'Removeu um repositório do Hub',
 proposal_created:'Criou uma proposta',proposal_updated:'Atualizou uma proposta',proposal_deleted:'Excluiu uma proposta',
})
export function activityLabel(action){return eventLabels[action]??'Atividade no Hub'}
export function formatHubDate(value){
 if(!value)return 'Ainda não registrado'
 const date=new Date(value)
 if(!Number.isFinite(date.getTime()))return 'Ainda não registrado'
 return new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(date)
}
