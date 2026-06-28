import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

export async function generateCoachMessage(
  userName: string,
  recentGoals: { title: string; status: string }[],
  adherenceRate: number,
  streakDays: number,
  healthDelta: number | null,
): Promise<string> {
  const activeGoals = recentGoals.filter(g => g.status === 'active').map(g => g.title).join(', ') || 'None'
  const completedCount = recentGoals.filter(g => g.status === 'completed').length

  const prompt = `You are MediSense Health Coach, an AI preventive health assistant. Generate a brief, encouraging, and personalized check-in message for a patient.

Patient: ${userName}
Active goals: ${activeGoals}
Goals completed: ${completedCount}
Adherence rate: ${adherenceRate}%
Current streak: ${streakDays} days
Health trend: ${healthDelta != null ? (healthDelta >= 0 ? `improving by ${Math.abs(healthDelta)} points` : `declining by ${Math.abs(healthDelta)} points`) : 'stable'}

Write 2-3 sentences that are:
1. Encouraging and empathetic
2. Specific to their progress
3. Include one actionable suggestion
4. Warm but professional tone`

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: 'You are MediSense Health Coach — a supportive, knowledgeable AI that helps patients stay on track with their health goals. Keep responses concise (2-3 sentences), personalized, and actionable.',
        temperature: 0.4,
        maxOutputTokens: 256,
      },
    })
    return response.text?.trim() ?? 'Keep up the great work with your health goals! Every small step counts toward a healthier you.'
  } catch {
    return 'Keep up the great work with your health goals! Every small step counts toward a healthier you.'
  }
}
