export const statuses: readonly (readonly [string,string])[]
export function knownStatus(value: unknown): boolean
export function statusName(value: string): string
export function parseBRLCents(input: unknown): number | null
export function formatBRLInput(cents: string | number): string
export function normalizeProjectURL(text: unknown): string | null
export function validISODate(value: string): boolean
