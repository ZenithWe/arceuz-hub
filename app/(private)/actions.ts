'use server'
import { redirect } from 'next/navigation'
import { endSession } from '@/lib/auth'
export async function signOutAction() {
  await endSession()
  redirect('/login')
}
