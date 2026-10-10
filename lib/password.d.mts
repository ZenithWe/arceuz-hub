export function acceptedPassword(password: unknown): boolean
export function hashPassword(password: string): Promise<string>
export function checkPassword(password: string, stored: string | null): Promise<boolean>
export function newSessionToken(): string
export function sessionDigest(token: string): string
export function emailDigest(email: string, secret: string): string
