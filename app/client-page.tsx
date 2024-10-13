'use client'

import dynamic from 'next/dynamic'
import { SessionProvider } from "next-auth/react"

const ShoppingListAppComponent = dynamic(
  () => import('@/components/shopping-list-app').then((mod) => mod.ShoppingListAppComponent),
  { ssr: false }
)

export default function ClientPage() {
  return (
    <SessionProvider>
      <ShoppingListAppComponent />
    </SessionProvider>
  )
}