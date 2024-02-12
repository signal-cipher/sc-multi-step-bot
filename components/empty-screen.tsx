import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: '(1) Launch a new fragrance line',
    message: 'Launch a new fragrance line'
  },
  {
    heading: '(2) Build an event experience that resonates with our customers',
    message: 'Build an event experience that resonates with our customers'
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to Expert Strategist Bot!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          If you have any questions or need my assistance with brainstorming
          ideas, please feel free to let me know.{' '}
        </p>
        <p className="mb-2 leading-normal text-muted-foreground">
          {`Message "Save" to save the last message to your Google Sheet and trigger other bots.`}
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
