import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { profiles } from '@/lib/profiles'

// Instantiated inside the handler so it's never called at build time

export async function POST(req: NextRequest) {
  const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY!,
    baseURL: 'https://openrouter.ai/api/v1',
  })

  try {
    const { message, profileId } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing message.' }, { status: 400 })
    }
    if (message.length > 500) {
      return NextResponse.json({ error: 'Message too long (max 500 chars).' }, { status: 400 })
    }

    // Look up profile server-side — never trust client-supplied profile data
    const profile = profiles.find(p => p.id === profileId)
    if (!profile) {
      return NextResponse.json({ error: 'Invalid profile.' }, { status: 400 })
    }

    const response = await client.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      max_tokens: 512,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a message quality evaluator for a dating app. Analyze the draft message against the recipient's profile and return a JSON object with exactly these five keys:

is_safe (boolean):
- false if the message contains ANY of: objectifying language ("hi sexy", "hey gorgeous", "you're hot"), explicit sexual requests, sexual innuendo, threats, slurs, or content that reduces a person to their physical appearance.
- true ONLY for genuinely respectful messages: questions, compliments about personality/interests, genuine conversation starters.

tone (string — pick exactly one): "Respectful" | "Forward" | "Objectifying" | "Inappropriate" | "Aggressive"
- Respectful: kind, genuine, references interests or asks a real question
- Forward: overly familiar or presumptuous but not harmful
- Objectifying: reduces person to appearance ("hi sexy", "you're cute", "hey gorgeous")
- Inappropriate: sexual innuendo, crude humor, boundary-crossing content
- Aggressive: threatening, demanding, hostile

is_safe must be false when tone is Objectifying, Inappropriate, or Aggressive.

pulse_score (integer 1-100): personalization score based purely on how well the message references the recipient's specific profile details.
- 1-15: generic opener with zero profile reference
- 16-40: minimal effort, no profile reference
- 41-75: some effort, partial reference to profile
- 76-100: directly references specific profile details (name, pet, hobby, bio quote)

coach_note (string): 1-2 encouraging sentences. For unsafe messages, explain specifically why. For generic safe messages, suggest a specific improvement using the profile. For good messages, offer praise.

reasoning_trace (string): brief internal reasoning for all scores.

Return ONLY a valid JSON object with these five keys.`,
        },
        {
          role: 'user',
          content: `Recipient Profile:
Name: ${profile.name}, Age: ${profile.age}
Bio: ${profile.bio}
Tags: ${profile.tags.join(', ')}

Draft Message: "${message}"`,
        },
      ],
    })

    if (!response.choices?.length) {
      return NextResponse.json({ error: 'No response from AI. Please try again.' }, { status: 500 })
    }

    const text = response.choices[0].message.content ?? ''

    let result: unknown
    try {
      result = JSON.parse(text)
    } catch {
      console.error('JSON parse failed, raw text:', text)
      return NextResponse.json({ error: 'AI returned an unexpected response. Please try again.' }, { status: 500 })
    }

    // Validate required fields before forwarding to client
    const r = result as Record<string, unknown>
    if (typeof r.is_safe !== 'boolean' || typeof r.pulse_score !== 'number' || typeof r.coach_note !== 'string') {
      console.error('Invalid schema from AI:', result)
      return NextResponse.json({ error: 'AI returned an invalid structure. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Evaluate API error:', error)
    const msg = error instanceof Error ? error.message : ''
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      return NextResponse.json({ error: 'API quota exceeded. Please try again later.' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Evaluation failed. Please try again.' }, { status: 500 })
  }
}
