import { cn } from '@/lib/utils'

export default function CopyToClipboardButton({ data, className }) {
  return (
    <button
      type="button"
      title="Copy"
      data-copy-button
      data-copy-text={data}
      className={cn(
        'group hover:scale-110 hover:bg-black hover:shadow-lg',
        className,
      )}
    >
      <CopyIcon className="h-4 w-4 group-data-[copied]:hidden" />
      <CheckIcon className="hidden h-4 w-4 text-green-500 group-data-[copied]:block" />
    </button>
  )
}

export function CopyIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width={14} height={14} x={8} y={8} rx={2} ry={2} />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />{' '}
    </svg>
  )
}

export function CheckIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
