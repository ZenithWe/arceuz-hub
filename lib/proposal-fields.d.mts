export declare const proposalStatuses:[string,string][]
export declare function knownProposalStatus(v:unknown):boolean
export declare function proposalStatusName(v:string):string
export declare function isProposalId(v:unknown):boolean
export declare function formatProposalDate(v:string|null):string
export declare function formatProposalMoney(v:number|string):string
export declare function proposalInputMoney(v:number|string):string
export type ProposalInput={title:string;scope:string;delivery_terms:string;payment_terms:string;notes:string;status:string;valid_until:string|null;amount_cents:number;client_id:string|null;project_id:string|null}
export declare function normalizeProposalInput(raw:Record<string,unknown>):{error:string;value?:never}|{value:ProposalInput;error?:never}
