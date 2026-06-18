// import 'dotenv/config'
// import { GoogleGenAI } from '@google/genai'

// async function main() {
//   const apiKey = process.env.GEMINI_API_KEY
//   if (!apiKey) {
//     console.error('GEMINI_API_KEY is not set in .env')
//     process.exit(1)
//   }

//   const ai = new GoogleGenAI({ apiKey })
//   const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

//   console.log(`Testing Gemini API with model: ${model}...`)

//   const response = await ai.models.generateContent({
//     model,
//     contents: 'Patient has fasting glucose of 115 mg/dL and BMI of 26.5.',
//     config: {
//       systemInstruction: 'You are a clinical risk assessment engine. Return ONLY this JSON shape: {"risk": <0-100>, "level": "LOW"|"MEDIUM"|"HIGH"}',
//       responseMimeType: 'application/json',
//       maxOutputTokens: 200,
//     },
//   })

//   console.log('Raw response text:', response.text)
//   const parsed = JSON.parse(response.text ?? '{}')
//   console.log('Parsed JSON:', parsed)
//   console.log('\n✅ Gemini API is working correctly.')
// }

// main().catch(err => {
//   console.error('❌ Gemini API test failed:', err)
//   process.exit(1)
// })


// scripts/test-gemini.ts
import 'dotenv/config'
import { GoogleGenAI, Type } from '@google/genai'

async function main() {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in .env')
    process.exit(1)
  }

  const ai = new GoogleGenAI({ apiKey })
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  console.log(`Testing Gemini API with model: ${model}...`)

  const response = await ai.models.generateContent({
    model,
    contents: `
Return exactly this JSON object and nothing else:

{"risk":35,"level":"MEDIUM"}
`,
    config: {
      systemInstruction:
        'You are a clinical risk assessment engine. Return only valid JSON.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          risk: {
            type: Type.NUMBER,
          },
          level: {
            type: Type.STRING,
            enum: ['LOW', 'MEDIUM', 'HIGH'],
          },
        },
        required: ['risk', 'level'],
      },
      temperature: 0,
      maxOutputTokens: 200,
    },
  })

  const text = response.text?.trim() ?? '{}'

  console.log('Raw response text:', text)

  const jsonMatch = text.match(/\{[\s\S]*\}/)

if (!jsonMatch) {
  throw new Error(`No JSON found in Gemini response: ${text}`)
}

const parsed = JSON.parse(jsonMatch[0])

  console.log('Parsed JSON:', parsed)
  console.log('\n✅ Gemini API is working correctly.')
}

main().catch((err) => {
  console.error('❌ Gemini API test failed:', err)
  process.exit(1)
})