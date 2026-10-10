export declare const taskStatuses:string[][]
export declare const taskPriorities:string[][]
export declare function knownTaskStatus(v:unknown):boolean
export declare function knownTaskPriority(v:unknown):boolean
export declare function taskStatusName(v:string):string
export declare function taskPriorityName(v:string):string
export declare function isUuid(v:unknown):boolean
export type TaskData={title:string;description:string;status:string;priority:string;due_on:string|null;assigned_to:string|null;project_id:string|null}
export declare function normalizeTaskInput(raw:Record<string,unknown>):{error:string;value?:never}|{value:TaskData;error?:never}
export declare function isOverdue(date:string|null,status:string,today:string):boolean
export declare function formatTaskDate(date:string|null):string
