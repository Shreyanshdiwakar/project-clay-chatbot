/**
 * API Route to Check Environment Variable Configuration
 * 
 * This is used by the client to check if the API keys are configured
 * without exposing the actual key values.
 */

import { NextResponse } from 'next/server';
import { isApiKeyConfigured, getEnvDiagnostics } from '@/config/env';

export async function GET() {
  return NextResponse.json({
    openrouterApiKey: isApiKeyConfigured() ? 'set' : 'missing',
    ...getEnvDiagnostics(),
  });
} 