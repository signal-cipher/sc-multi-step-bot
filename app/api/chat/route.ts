import { nanoid } from '@/lib/utils'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const maxDuration = 300

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken, prompt } = json

  if (previewToken) {
    openai.apiKey = previewToken
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: prompt
      },
      ...messages
    ],
    max_tokens: 4096,
    temperature: 0.2,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const payload = [createdAt, title, completion]

      console.log('@@@ payload', payload)
    }
  })

  return new StreamingTextResponse(stream)
}
