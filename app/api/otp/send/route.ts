import { NextResponse } from 'next/server';
import { mockSendOtp } from '@/lib/api/mock';
import { InterestApiError, phoneSchema } from '@/lib/api/types';
import { z } from 'zod';

export async function POST(request: Request) {
  try { const { phone } = z.object({ phone: phoneSchema }).parse(await request.json()); return NextResponse.json(await mockSendOtp(phone)); }
  catch (error) { const typed = error instanceof InterestApiError ? error : new InterestApiError('VALIDATION_ERROR', 'Enter a valid mobile number.'); return NextResponse.json({ error: { code: typed.code, message: typed.message } }, { status: typed.code === 'OTP_SEND_FAILED' ? 503 : 400 }); }
}
