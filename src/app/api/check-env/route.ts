/**
 * API endpoint to check environment variables
 * This can be used to verify that the OpenRouter API key is properly set
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    
    // Mask the API key for security while still showing if it's set
    const maskedKey = openrouterApiKey 
      ? `${openrouterApiKey.substring(0, 3)}...${openrouterApiKey.substring(openrouterApiKey.length - 3)}` 
      : null;
    
    // Return environment status
    return NextResponse.json({
      env: process.env.NODE_ENV || 'unknown',
      openrouterApiKey: openrouterApiKey ? 'set' : 'not set',
      openrouterApiKeyMasked: maskedKey,
      message: openrouterApiKey 
        ? 'OpenRouter API key is configured'
        : 'OpenRouter API key is not configured. Please add OPENROUTER_API_KEY to your .env.local file.'
    });
  } catch (error) {
    console.error('Error checking environment:', error);
    return NextResponse.json(
      { error: 'Failed to check environment variables' },
      { status: 500 }
    );
  }
} 