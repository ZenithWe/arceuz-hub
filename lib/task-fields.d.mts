
export declare const taskStatuses: [string,string][]
export declare const taskPriorities: [string,string][]
export declare function knownTaskStatus(x:unknown):boolean
export declare function knownTaskPriority(x:unknown):boolean
export declare function taskStatusName(x:string):string
export declare function taskPriorityName(x:string):string
export declare function isUUID(x:unknown):x is string
export declare function isTaskDate(input:string):boolean
export declare function brDate(input:string|null):string
export type TaskData={title:string;description:string;priority:string;status:string;due_on:string|null;assigned_to:string|null;project_id:string|null}
export declare function parseTaskFields(raw:Record<string,unknown>):{value:TaskData;error?:never}|{error:string;value?:never}
