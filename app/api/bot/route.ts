import { OpenAIStream, StreamingTextResponse } from 'ai'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: Request) {
  const { prompt, content } = await req.json()

  console.log('@@@ content', content)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: prompt
      },
      {
        role: 'user',
        content: content
      }
    ],
    max_tokens: 4096,
    temperature: 0.2
  })

  return new NextResponse(completion.choices[0].message.content, {
    status: 200
  })
}
