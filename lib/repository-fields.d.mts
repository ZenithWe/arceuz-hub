export type RepoIdentity={full_name:string;html_url:string}
export declare function normalizeRepositoryInput(raw:unknown):{error:string;value?:never}|{value:RepoIdentity;error?:never}
export declare function normalizeRepositoryProject(raw:unknown):{error:string;value?:never}|{value:string|null;error?:never}
export declare function repositorySyncLabel(raw:string):string
export declare function formatRepositoryDate(date:string|null):string
