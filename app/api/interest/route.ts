import { NextResponse } from 'next/server';
import { mockSubmitInterest } from '@/lib/api/mock';
import { applicantSchema, InterestApiError } from '@/lib/api/types';

export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 8_192) throw new InterestApiError('VALIDATION_ERROR', 'Request is too large.');
    return NextResponse.json(await mockSubmitInterest(applicantSchema.parse(JSON.parse(text))));
  } catch (error) {
    const typed = error instanceof InterestApiError ? error : new InterestApiError('VALIDATION_ERROR', 'Check the highlighted fields and try again.');
    return NextResponse.json({ error: { code: typed.code, message: typed.message } }, { status: typed.code === 'SUBMISSION_FAILED' ? 503 : 400 });
  }
}
