export declare const aiModes:string[][]
export declare function knownAiMode(value:unknown):boolean
export declare function aiModeLabel(value:string):string
export declare function normalizeAiMessage(raw:unknown):{error:string;value?:never}|{value:string;error?:never}
export declare function conversationTitle(message:string):string
export declare function formatAiDate(value:string):string
