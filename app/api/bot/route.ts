import { OpenAIStream, StreamingTextResponse } from 'ai'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const runtime = 'edge'
export const maxDuration = 300

export async function POST(req: Request) {
  const { prompt, content } = await req.json()

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
    temperature: 0.7
  })

  return new NextResponse(completion.choices[0].message.content, {
    status: 200
  })
}
