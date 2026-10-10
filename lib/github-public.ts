import 'server-only'
import { normalizeRepositoryInput } from './repository-fields.mjs'
type GithubMetadata={status:'ok';description:string;language:string|null;default_branch:string|null;stars:number;updated_at:string|null;last_commit_at:string|null;visibility:'public';last_synced_at:string}
type GithubUnavailable={status:'unavailable'}
export type GithubResult=GithubMetadata|GithubUnavailable
const headers={'Accept':'application/vnd.github+json','User-Agent':'Arceuz-Hub','X-GitHub-Api-Version':'2022-11-28'}
function cleanDate(value:unknown){if(typeof value!=='string')return null;const d=new Date(value);return Number.isFinite(d.getTime())?d.toISOString():null}
export async function fetchPublicRepo(fullName:string):Promise<GithubResult>{
 const normalized=normalizeRepositoryInput(fullName)
 if(!normalized.value || normalized.value.full_name!==fullName)return {status:'unavailable'}
 const encoded=fullName.split('/').map(encodeURIComponent).join('/')
 try{
  const response=await fetch('https://api.github.com/repos/'+encoded,{
   headers,redirect:'error',cache:'no-store',signal:AbortSignal.timeout(6500)
  })
  if(!response.ok)return {status:'unavailable'}
  const item=await response.json()
  if(!item || item.private!==false || typeof item.full_name!=='string' ||
      item.full_name.toLowerCase()!==fullName.toLowerCase())return {status:'unavailable'}
  let last_commit_at:string|null=null
  try{
   const branch=typeof item.default_branch==='string'?item.default_branch:''
   if(branch && branch.length<150){
    const res=await fetch('https://api.github.com/repos/'+encoded+'/commits?per_page=1&sha='+encodeURIComponent(branch),{
     headers,redirect:'error',cache:'no-store',signal:AbortSignal.timeout(6000)
    })
    if(res.ok){
     const commits=await res.json()
     if(Array.isArray(commits)&&commits[0])last_commit_at=cleanDate(commits[0].commit?.committer?.date)
    }
   }
  }catch{}
  return {status:'ok',
   description:typeof item.description==='string'?item.description.slice(0,500):'',
   language:typeof item.language==='string'?item.language.slice(0,60):null,
   default_branch:typeof item.default_branch==='string'?item.default_branch.slice(0,120):null,
   stars:Number.isSafeInteger(item.stargazers_count)&&item.stargazers_count>=0?item.stargazers_count:0,
   updated_at:cleanDate(item.updated_at),
   last_commit_at,visibility:'public',last_synced_at:new Date().toISOString()
  }
 }catch{return {status:'unavailable'}}
}
export type PublicRepoResult={name:string;full_name:string;description:string|null;language:string|null;updated_at:string|null}
export async function discoverPublicRepositories(owner:string):Promise<PublicRepoResult[]|null>{
 if(!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(owner))return null
 try{
  const res=await fetch('https://api.github.com/users/'+owner+'/repos?type=owner&sort=updated&per_page=60',{
   headers,redirect:'error',cache:'no-store',signal:AbortSignal.timeout(6500)
  })
  if(!res.ok)return null
  const items=await res.json()
  if(!Array.isArray(items))return null
  return items.filter(x=>x?.private===false&&typeof x?.full_name==='string'&&
   normalizeRepositoryInput(x.full_name).value).slice(0,60).map(x=>({
   name:String(x.name).slice(0,100),full_name:String(x.full_name).toLowerCase(),
   description:typeof x.description==='string'?x.description.slice(0,200):null,
   language:typeof x.language==='string'?x.language.slice(0,60):null,
   updated_at:cleanDate(x.updated_at)
  }))
 }catch{return null}
}
