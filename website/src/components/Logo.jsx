import { cn } from '@/lib/utils'

export function Logo({ className, ...props }) {
  return (
    <img
      alt="logo image"
      width={35}
      height={35}
      src="/logo.webp"
      loading="lazy"
      className={cn('', className)}
      {...props}
    />
  )
}
