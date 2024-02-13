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
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  noStore()
  const router = useRouter()
  const path = usePathname()
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const [messageContent, setMessageContent] = useState('')
  const [botPrompts, setBotPrompts] = useState({}) as any

  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages,
      id,
      body: {
        id,
        previewToken,
        googleSheetId: '1SGbS_kU8d3Lk_k27MLj5airqIBcMjB23Ed1jMs-t5y0',
        prompt: botPrompts?.bot1
      },
      onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText)
        }
      },
      onFinish: async (message: Message) => {
        const previousContent = messageContent
        setMessageContent(message.content)

        if (input.toLowerCase() === 'save') {
          await saveToSheets(previousContent)
        }
      }
    })

  useEffect(() => {
    getBotPrompts()
  }, [])

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

      toast.success('Output has been saved to Google Sheets.')

      // trigger bots
      const bots = [
        {
          name: 'Bot2',
          prompt: botPrompts?.bot2 || ''
        },
        {
          name: 'Bot3',
          prompt: botPrompts?.bot3 || ''
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

        const botData = await botResponse.text()

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
        console.log(`${bot.name} saved to Google Sheets at row ${sheetData}`)
      }
    } catch (error) {
      console.error('Error saving to Google Sheets:', error)
      toast.error('Failed to save to Google Sheets. Please try again.')
    }
  }

  const getBotPrompts = async () => {
    try {
      const url = `/api/sheets/read?timestamp=${new Date().getTime()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`) // Throws an error if response is not ok
      }

      const data = await response.json()
      setBotPrompts(data)

      console.log('bot prompts loaded')
      console.log('bots', data)
    } catch (error) {
      console.error('Error fetching bot prompts:', error)
      toast.error('Failed to fetch bot prompts.')
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
          <EmptyScreen setInput={setInput} />
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
        prompt={botPrompts?.bot1}
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
