import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { clearChats } from '@/app/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { SidebarList } from '@/components/sidebar-list'
import {
  IconGitHub,
  IconNextChat,
  IconSeparator,
  IconVercel
} from '@/components/ui/icons'
import { SidebarFooter } from '@/components/sidebar-footer'
import { ThemeToggle } from '@/components/theme-toggle'
import { ClearHistory } from '@/components/clear-history'
import { UserMenu } from '@/components/user-menu'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { ChatHistory } from './chat-history'
import Image from 'next/image'

async function UserOrLogin() {
  return (
    <>
      <Link href="/" target="_blank" rel="nofollow">
        <img
          src="https://framerusercontent.com/images/JGs8WFixcVVZert7GnE0iXO9CI.svg"
          alt="Signal & Cipher"
          className="w-8 h-auto"
        />
      </Link>
    </>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <span className="text-sm w-48 text-right">Google Sheet ID:</span>
        <input
          type="text"
          value="1SGbS_kU8d3Lk_k27MLj5airqIBcMjB23Ed1jMs-t5y0"
          className="w-full px-4 py-1 focus-within:outline-none sm:text-sm overflow-hidden max-h-60 grow bg-background sm:rounded-md sm:border"
        />
      </div>

      {/* <div className="flex items-center justify-end space-x-2">
        <Link
          href="https://docs.google.com/spreadsheets/d/1SGbS_kU8d3Lk_k27MLj5airqIBcMjB23Ed1jMs-t5y0/edit?usp=sharing"
          target="_blank"
          rel="nofollow"
        >
          <div className="text-sm w-48 text-right underline flex items-center justify-end gap-1">
            Google Sheet
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </div>
        </Link>
      </div> */}
    </header>
  )
}
