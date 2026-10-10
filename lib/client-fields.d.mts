export declare const clientStatuses: [string,string][]
export declare function knownClientStatus(value:unknown):boolean
export declare function clientStatusName(value:string):string
export type ClientData={name:string;contact_name:string;email:string;phone:string;whatsapp:string;website:string|null;status:string;notes:string}
export declare function normalizeClientInput(raw:Record<string,unknown>):{error:string;value?:never}|{value:ClientData;error?:never}
