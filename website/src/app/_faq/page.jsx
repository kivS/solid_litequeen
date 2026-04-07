import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

export const metadata = {
  title: 'FAQ - Solid Lite Queen | Common Questions Answered',
  description:
    'Find answers to the most common questions about Solid Lite Queen.',
}

export default function FaqPage() {
  return (
    <main>
      <nav className="mx-auto mt-2 flex max-w-screen-2xl place-content-between items-center gap-4  font-medium">
        <a href="/" className="ml-6">
          <Logo className="size-10" />
        </a>

        <ThemeToggle className="mr-5 size-5 " />
      </nav>

      <div className="flex flex-col">
        <h1
          className="mb-20 mt-10 text-center  text-4xl font-bold"
          title="Frequently Asked Questions"
        >
          FAQ
        </h1>

        <div className="w-full px-20  *:my-3 ">
          <details>
            <summary className="text-xl">
              <strong>What about my data, what do you do with it?</strong>
            </summary>
            <p>
              <strong>Nothing!</strong> All the data is kept on your servers and
              nothing is sent outside nor used.
            </p>
          </details>
        </div>

        <p className="mt-20 text-center">
          You still have questions?{' '}
          <a
            href="https://github.com/kivS/solid_litequeen/discussions/new?category=q-a"
            className="underline"
          >
            Let's us know.
          </a>
        </p>
      </div>
    </main>
  )
}
