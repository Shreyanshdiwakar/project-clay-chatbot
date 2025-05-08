/**
 * API Route to Check Environment Variable Configuration
 * 
 * This is used by the client to check if the API keys are configured
 * without exposing the actual key values.
 */

// Updated for Next.js 15+
import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { isApiKeyConfigured, getEnvDiagnostics } from '@/config/env';

export async function GET() {
  return NextResponse.json({
    openaiApiKey: isApiKeyConfigured() ? 'set' : 'missing',
    ...getEnvDiagnostics(),
  });
} 