import clsx from 'clsx'

import { FormattedDate } from '@/components/FormattedDate'
import CopyToClipboardButton from './copy-to-clipboard-button'

export const a = function Link(props) {
  return <a {...props} />
}

export const img = function Img(props) {
  return (
    <div className="relative mt-8 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900 [&+*]:mt-8">
      <img alt="" loading="lazy" {...props} />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10 dark:ring-white/10" />
    </div>
  )
}

function ContentWrapper({ className, ...props }) {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8 ">
      <div className="lg:ml-96 lg:flex lg:w-full lg:justify-end lg:pl-32">
        <div
          className={clsx(
            'mx-auto max-w-lg lg:mx-0 lg:w-0 lg:max-w-xl lg:flex-auto',
            className,
          )}
          {...props}
        />
      </div>
    </div>
  )
}

function ArticleHeader({ id, date }) {
  return (
    <header className="relative mb-10 xl:mb-0">
      <div className="pointer-events-none absolute left-[max(-0.5rem,calc(50%-18.625rem))] top-0 z-50 flex h-4 items-center justify-end gap-x-2 lg:left-0 lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-[32rem] xl:h-8">
        <a href={`#${id}`} className="inline-flex">
          <FormattedDate
            date={date}
            className="hidden xl:pointer-events-auto xl:block xl:text-2xs/4 xl:font-medium dark:xl:text-white/50"
          />
        </a>
        <div className="h-[0.0625rem] w-3.5 bg-gray-400 lg:-mr-3.5 xl:mr-0 xl:dark:bg-gray-300" />
      </div>
      <ContentWrapper>
        <div className="flex">
          <a href={`#${id}`} className="inline-flex">
            <FormattedDate
              date={date}
              className="text-2xs/4 font-medium text-gray-500 xl:hidden dark:text-white/50"
            />
          </a>
        </div>
      </ContentWrapper>
    </header>
  )
}

export const article = function Article({ id, date, children }) {
  return (
    <article id={id} className="scroll-mt-16">
      <ArticleHeader id={id} date={date} />
      <ContentWrapper className="typography" data-mdx-content>
        {children}
      </ContentWrapper>
    </article>
  )
}

export const code = function Code({
  highlightedCode,
  original_code: originalCode,
  ...props
}) {
  if (highlightedCode) {
    return (
      <div className="flex flex-col justify-start">
        <CopyToClipboardButton className="absolute z-40" data={originalCode} />
        <code
          {...props}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          className=""
        />
      </div>
    )
  }

  return <code {...props} />
}
