import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { readdirSync, readFileSync } from 'node:fs'
const require = createRequire(import.meta.url)
let ts
try { ts = require('typescript') } catch {
  // Allows a syntax-only check when a global tsc is present and npm is offline.
  const globalModules = execFileSync('npm', ['root', '-g'], {encoding:'utf8'}).trim()
  ts = require(join(globalModules, 'typescript'))
}
const root = new URL('../', import.meta.url)
const files = []
function scan(relative) {
  for (const entry of readdirSync(new URL(relative,root),{withFileTypes:true})) {
    const path = `${relative}${entry.name}`
    if (entry.isDirectory()) scan(path+'/')
    else if (/\.(ts|tsx)$/.test(path)) files.push(path)
  }
}
for (const dir of ['app/','components/','lib/']) scan(dir)
files.push('next.config.ts')
let errors = 0
for (const file of files) {
  const content = readFileSync(new URL(file,root),'utf8')
  const output = ts.transpileModule(content, {
    compilerOptions: {jsx:ts.JsxEmit.Preserve, target:ts.ScriptTarget.ES2022},
    reportDiagnostics:true, fileName:file,
  })
  const issues = (output.diagnostics??[]).filter(d=>d.category===ts.DiagnosticCategory.Error)
  errors+=issues.length
  for(const issue of issues) console.error(`${file}: ${ts.flattenDiagnosticMessageText(issue.messageText,' ')}`)
}
console.log(`${files.length} arquivos TS/TSX verificados; ${errors} erros de sintaxe.`)
process.exitCode = errors ? 1 : 0
