import { before, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = mkdtempSync(join(tmpdir(), 'arceuz-metrics-'))
const require = createRequire(import.meta.url)
let metrics
before(() => {
  execFileSync('tsc', ['--skipLibCheck', '--target','es2022','--module','commonjs','--lib','es2022,dom',
    '--outDir', output, 'lib/metrics.ts'], { cwd: root, stdio:'pipe' })
  metrics = require(join(output, 'metrics.js'))
})
process.on('exit', () => rmSync(output, { recursive: true, force: true }))
const date = text => new Date(text)
const income = (amount_cents, status='paid', paid_on='2026-10-09') => ({ direction:'income', amount_cents, status, paid_on, due_on:null })
const expense = (amount_cents, status='paid', paid_on='2026-10-09') => ({ direction:'expense', amount_cents, status, paid_on, due_on:null })

test('time window uses Sao Paulo rather than UTC at midnight', () => {
  assert.deepEqual(metrics.dateBounds('7d', date('2026-10-10T01:59:00Z')),
    { start:'2026-10-03', end:'2026-10-09', today:'2026-10-09' })
  assert.equal(metrics.dateBounds('month', date('2026-10-10T03:01:00Z')).today, '2026-10-10')
})
test('previous month respects leap years and year boundaries', () => {
  assert.equal(metrics.dateBounds('previous', date('2028-03-10T18:00:00Z')).end, '2028-02-29')
  assert.equal(metrics.dateBounds('previous', date('2026-01-08T18:00:00Z')).start, '2025-12-01')
  assert.equal(metrics.dateBounds('year', date('2026-10-09T18:00:00Z')).start, '2026-01-01')
})
test('invalid filter defaults to current month', () => {
  assert.equal(metrics.resolvePeriod('totally-invalid'), 'month')
  assert.equal(metrics.resolvePeriod('7d'), '7d')
})
test('no fabricated KPIs or finance records in empty database', () => {
  const stats = metrics.calculateStats([], [], [], [], 'month', date('2026-10-09T18:00:00Z'))
  assert.equal(stats.totalProjects, 0)
  assert.equal(stats.incomeCents, 0)
  assert.equal(stats.resultCents, 0)
  assert.equal(stats.monthly.length, 6)
  assert.ok(stats.monthly.every(x=>x.income===0 && x.expense===0))
})
test('financial KPIs reflect only paid within the selected dates, pending counted separately', () => {
  const finance = [income('12000'),expense('2500'),income('9999','pending'),expense('5000','pending'),
    income('8900','cancelled'),income('300','paid','2026-09-30'),income('400','paid','2026-10-01')]
  const stats = metrics.calculateStats([], [], finance, [], '7d', date('2026-10-09T18:00:00Z'))
  assert.equal(stats.incomeCents,12000)
  assert.equal(stats.expensesCents,2500)
  assert.equal(stats.resultCents,9500)
  assert.equal(stats.receivableCents,9999)
  assert.equal(stats.payableCents,5000)
  assert.equal(stats.monthly.at(-1).income,12400)
})
test('projects, published sites, repositories and tasks categorized correctly', () => {
  const projects = [
    {status:'idea',production_url:null},
    {status:'planning',production_url:null},
    {status:'production',production_url:'https://site.example'},
    {status:'completed',production_url:'https://done.example'},
    {status:'paused',production_url:null},
  ]
  const tasks = [
    {status:'todo',due_on:'2026-10-09'}, {status:'doing',due_on:'2026-10-15'},
    {status:'todo',due_on:'2026-10-16'}, {status:'review',due_on:'2026-10-08'},
    {status:'done',due_on:'2026-10-07'},
  ]
  const stats = metrics.calculateStats(projects, [{id:'repo1'}], [], tasks, 'month', date('2026-10-09T18:00:00Z'))
  assert.equal(stats.totalProjects,5)
  assert.equal(stats.activeProjects,2)
  assert.equal(stats.publishedSites,2)
  assert.equal(stats.repositories,1)
  assert.equal(stats.upcomingTasks,2)
  assert.equal(stats.overdueTasks,1)
})
test('unsafe integer cents fail closed rather than rounding business finances', () => {
  assert.throws(() => metrics.calculateStats([],[],[income('9007199254740993')],[],'month',date('2026-10-09T18:00:00Z')), /seguro/)
})
