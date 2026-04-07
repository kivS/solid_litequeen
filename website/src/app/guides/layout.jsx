import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BookIcon } from '@/components/icons'

export const metadata = {
  title: 'Guides - Solid Lite Queen | Guides About Using Solid Lite Queen',
  description:
    'Learn how to use Solid Lite Queen with guides covering topics from installation and more.',
}

export default function GuidesLayout({ children }) {
  return (
    <main>
      <nav className="mx-auto my-4 flex max-w-screen-2xl place-content-between items-center gap-4  font-medium">
        <a href="/" className="ml-6">
          <Logo className="size-10" />
        </a>

        <a
          href="/guides/"
          className="flex items-center gap-2 text-xl hover:scale-105"
        >
          <BookIcon className="size-5" />
          Guides
        </a>

        <ThemeToggle className="mr-5 size-5 " />
      </nav>

      <div className="my-20 flex justify-center">{children}</div>
    </main>
  )
}
