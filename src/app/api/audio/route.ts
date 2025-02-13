import { NextResponse } from 'next/server'
import { ElevenLabsClient } from 'elevenlabs'

export async function POST(req: Request) {
  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  })

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
  const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID

  if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
    console.error('Missing ElevenLabs configuration:')
    return new NextResponse('ElevenLabs configuration missing', { status: 500 })
  }

  try {
    console.log('🎙️ Audio generation request received')
    
    const { text } = await req.json()
    console.log('Text to convert:', text)

    if (!text) {
      console.error('No text provided in request')
      return new NextResponse('Text is required', { status: 400 })
    }

    console.log('🔑 ElevenLabs configuration found')
    console.log('🎯 Making request to ElevenLabs API...')

    const audioStream = await client.textToSpeech.convert(ELEVENLABS_VOICE_ID, {
      output_format: 'mp3_44100_128',
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.5
      }
    })

    console.log('📡 ElevenLabs API response received', audioStream)

    // Convert stream to array buffer before sending
    const chunks = []
    for await (const chunk of audioStream) {
      chunks.push(chunk)
    }
    const audioBuffer = Buffer.concat(chunks)

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    })
  } catch (error: any) {
    console.error('💥 Unexpected error in audio generation:', error)
    
    // More specific error handling
    if (error.response?.status === 401) {
      return new NextResponse('Authentication failed', { status: 401 })
    }
    if (error.response?.status === 429) {
      return new NextResponse('Rate limit exceeded', { status: 429 })
    }
    
    return new NextResponse(
      'Error generating audio',
      { status: 500 }
    )
  }
}