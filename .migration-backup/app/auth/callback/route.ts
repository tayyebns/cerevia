import { createClient } from '@/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data } = await supabase.auth.getUser()
      const role = data.user?.user_metadata?.role || 'patient'

      return NextResponse.redirect(
        new URL(role === 'gp' ? '/gp' : '/patient', request.url)
      )
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=invalid_code', request.url))
}
