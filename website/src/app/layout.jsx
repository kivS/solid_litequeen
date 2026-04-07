import clsx from 'clsx'

import '@/styles/tailwind.css'

import { TailwindIndicator } from '@/components/tailwind-indicator'

export const metadata = {
  title: 'Solid Lite Queen - Manage SQLite databases in your Rails app',
  description:
    'Solid Lite Queen is an open-source SQLite database management software for your Rails app.',
  alternates: {
    types: {
      'application/rss+xml': 'https://solid.litequeen.com/feed.xml',
    },
  },
  metadataBase: new URL('https://solid.litequeen.com'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={clsx('h-full antialiased')}>
      <body className="flex min-h-full flex-col bg-white dark:bg-gray-950">
        {children}
        <TailwindIndicator />
      </body>
    </html>
  )
}
