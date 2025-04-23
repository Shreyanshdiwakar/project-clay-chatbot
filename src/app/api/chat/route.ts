import { NextResponse } from 'next/server';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openrouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured' },
        { status: 500 }
      );
    }

    console.log('Sending request to OpenRouter API...');
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterApiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'OpenRouter-Completions-Version': '2023-12-01'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly academic counselor helping high school students plan extracurricular activities to improve their college applications. Ask follow-up questions if needed.'
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    
    console.log('OpenRouter API response status:', response.status);
    
    if (!response.ok) {
      console.error('OpenRouter API error:', JSON.stringify(data));
      return NextResponse.json(
        { message: 'Sorry, I encountered an error connecting to the AI service. Please try again later.' },
        { status: 500 }
      );
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected response format:', JSON.stringify(data));
      return NextResponse.json(
        { message: 'Sorry, I received an unexpected response format. Please try again.' },
        { status: 500 }
      );
    }

    const botResponse = data.choices[0].message.content || 'Sorry, I could not generate a response.';
    return NextResponse.json({ message: botResponse });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Sorry, an unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
} 