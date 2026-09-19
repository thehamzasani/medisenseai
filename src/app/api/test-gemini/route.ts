import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

export async function GET() {
  const start = Date.now()

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: 'Say OK',
      config: {
        maxOutputTokens: 5,
        temperature: 0,
      },
    })

    const latencyMs = Date.now() - start
    const text = response.text?.trim() ?? ''

    return NextResponse.json({
      status: 'ok',
      model: GEMINI_MODEL,
      latencyMs,
      response: text,
      message: 'Gemini API is responding normally',
    })
  } catch (error: unknown) {
    const latencyMs = Date.now() - start

    // Parse Gemini error response for retry info
    const errObj = error as { status?: number; error?: { error?: { status?: string; message?: string; details?: Array<{ '@type'?: string; retryDelay?: string }> } } }
    const status = errObj?.status ?? errObj?.error?.error?.status
    const message = errObj?.error?.error?.message ?? (error instanceof Error ? error.message : 'Unknown error')

    // Extract retry delay from Gemini error details
    let retryAfterSeconds: number | undefined
    const details = errObj?.error?.error?.details
    if (details && Array.isArray(details)) {
      for (const detail of details) {
        if (detail['@type']?.includes('RetryInfo') && detail.retryDelay) {
          const match = detail.retryDelay.match(/(\d+\.?\d*)/)
          if (match) retryAfterSeconds = Math.ceil(parseFloat(match[1]))
        }
      }
    }

    if (status === 'RESOURCE_EXHAUSTED') {
      return NextResponse.json({
        status: 'quota_exceeded',
        model: GEMINI_MODEL,
        latencyMs,
        error: message,
        retryAfterSeconds: retryAfterSeconds ?? 60,
      })
    }

    return NextResponse.json({
      status: 'error',
      model: GEMINI_MODEL,
      latencyMs,
      error: message,
    })
  }
}
