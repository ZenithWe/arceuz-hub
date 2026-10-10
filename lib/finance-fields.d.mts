export declare const directions:[string,string][]
export declare const statuses:[string,string][]
export declare function knownDirection(value:unknown):boolean
export declare function knownStatus(value:unknown):boolean
export declare function directionName(value:string):string
export declare function statusName(value:string):string
export declare function isFinanceId(value:unknown):boolean
export type FinanceInput={title:string;direction:string;status:string;amount_cents:number;category:string|null;method:string|null;reference:string|null;notes:string;competence_on:string|null;due_on:string|null;paid_on:string|null;project_id:string|null}
export declare function parseFinanceEntry(raw:Record<string,unknown>):{error:string;value?:never}|{value:FinanceInput;error?:never}
export declare function formatMoney(cents:number|string):string
export declare function formatMoneyInput(cents:number|string):string
export declare function formatDate(date:string|null):string
export declare function isPastDue(entry:{status:string;due_on:string|null},today:string):boolean
