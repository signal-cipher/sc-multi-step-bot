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
        {/* <h1 className="mb-2 text-lg font-semibold">
          {`Hi! I'm here to guide you with a panel of expert agents to help solve
          your organizations initiatives.`}
        </h1> */}
        {/* <p className="mb-2 leading-normal text-muted-foreground">
          {`Hi! I'm here to guide you with a panel of expert agents to help solve
          your organizations initiatives.`}
        </p> */}
        <p className="mb-2 leading-normal text-muted-foreground">
          {`Hi! I'm here to guide you with a panel of expert agents to help solve
          your organizations initiatives. Ever wonder what it would take to get
          that product launch off the ground or planning a major rebranding? I
          can help you come up with your project objectives. Think of me as a
          group of expert strategists here to help you with your project.`}
        </p>
      </div>
    </div>
  )
}
