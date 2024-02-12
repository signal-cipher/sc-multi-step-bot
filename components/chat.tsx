'use client'

import { useChat, type Message } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const [messageContent, setMessageContent] = useState('')

  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages,
      id,
      body: {
        id,
        previewToken,
        googleSheetId: '1SGbS_kU8d3Lk_k27MLj5airqIBcMjB23Ed1jMs-t5y0'
      },
      onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText)
        }
      },
      onFinish: async (message: Message) => {
        console.log('@@@ message', message.content)
        const previousContent = messageContent
        setMessageContent(message.content)

        if (input.toLowerCase() === 'save') {
          toast.success('saving')
          await saveToSheets(previousContent)
        }
      }
    })

  const saveToSheets = async (content: any) => {
    try {
      const response = await fetch('/api/sheets/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: content
        })
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`)
      }

      const rowIndex = await response.json()
      console.log('@@@ rowIndex', rowIndex)

      toast.success('Output has been saved to Google Sheets.')

      // trigger bots
      const bots = [
        {
          name: 'Bot2',
          prompt: `I want you to become my marketing strategy expert. Your goal is to help me craft the best possible project brief for my needs. The brief will be used by marketing experts to create the recommended campaigns.

You will follow the following process:
Your first response will be to create an initial brief based on the user input. Once complete will need to improve it through continual iterations by going through the next steps.

Based on the user input, you will generate the following.

Create a comprehensive brief for an effective marketing campaign based on the product or service entered by the user.

Write an introduction about the product or service and the market space it is competing in.  This should define the purpose as well as the overall theme and tone of the campaign.

Create customer personas for the product or service.  Personas should include a detailed description of the person and include a bulleted list of demographic information such as the customers age, sex, profession, information sources, objections, goals, pain points, buying behaviors and lifestyle preferences.
Give each persona an identity, (Example: "Health Conscious Sarah").

Generate 3 different and distinct campaign concepts which MUST each include the following:

- A detailed creative description of the campaign.
- 3 alternate campaign names.
- How the campaign engages the customer personas.
- Use DALL-E to create 6 sample images of the campaign.`
        },
        {
          name: 'Bot3',
          prompt: `I want you to become my marketing strategy expert. Your goal is to help me craft the best possible project brief for my needs. The brief will be used by marketing experts to create the recommended campaigns.

You will follow the following process:
Your first response will be to create an initial brief based on the provided input. 

Based on the input, you will generate the following.

Create a comprehensive brief for an effective marketing campaign based on the product or service entered by the user.

Write an introduction about the product or service and the market space it is competing in.  This should define the purpose as well as the overall theme and tone of the campaign.

Expand on the provided customer personas for the product or service.  Personas should include a detailed description of the person and include a bulleted list of demographic information such as the customers age, sex, profession, information sources, objections, goals, pain points, buying behaviors and lifestyle preferences.
Give each persona an identity, (Example: "Health Conscious Sarah").

Generate 3 different and distinct campaign concepts which MUST each include the following:

- A detailed creative description of the campaign.
- 3 alternate campaign names.
- How the campaign engages the customer personas.

After each concept description, create a bulleted list of 5 proposed optimal marketing tactics to make the campaign idea successful. (Example of marketing tactics: email marketing, social media, influencer partnerships, paid digital, experiential events, and trade shows.) The proposed tactics should align with the preferences of the defined customer personas.

Create a table of deliverables required to complete the campaign and recommended timeline to produce each type of asset.
(Example assets would be social media assets, banners, videos, website updates and imagery.) The table should be formatted as Duration and Deliverables.

Create an optimized weekly project calendar that structures the project tasks and subtasks into optimal timelines based on the recommended marketing tactics in order to create efficiency in the project workflow. The calendar should be formatted as tables with the columns labeled by week and the tasks as rows.`
        }
      ]

      for (const bot of bots) {
        const botResponse = await fetch('/api/bot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: bot.prompt,
            content: content
          })
        })

        if (!botResponse.ok) {
          throw new Error(
            `Error: ${botResponse.status} - ${botResponse.statusText}`
          )
        }
        console.log('@@@ botResponse  ', botResponse)

        const botData = await botResponse.text()
        console.log('@@@ botData', botData)

        // Save bot response to Google Sheets
        const sheetResponse = await fetch('/api/sheets/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rowIndex,
            botName: bot.name,
            data: botData
          })
        })

        if (!sheetResponse.ok) {
          throw new Error(
            `Error: ${sheetResponse.status} - ${sheetResponse.statusText}`
          )
        }

        const sheetData = await sheetResponse.json()
        console.log('@@@ sheetData', sheetData)
      }
    } catch (error) {
      console.error('Error saving to Google Sheets:', error)
      toast.error('Failed to save to Google Sheets. Please try again.')
    }
  }

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          // <EmptyScreen setInput={setInput} />
          <div></div>
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenAI Key</DialogTitle>
            <DialogDescription>
              If you have not obtained your OpenAI API key, you can do so by{' '}
              <a
                href="https://platform.openai.com/signup/"
                className="underline"
              >
                signing up
              </a>{' '}
              on the OpenAI website. This is only necessary for preview
              environments so that the open source community can test the app.
              The token will be saved to your browser&apos;s local storage under
              the name <code className="font-mono">ai-token</code>.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={e => setPreviewTokenInput(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setPreviewToken(previewTokenInput)
                setPreviewTokenDialog(false)
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
