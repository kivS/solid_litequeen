import clsx from 'clsx'

export function IconLink({
  children,
  className,
  iconClassName,
  compact = false,
  icon: Icon,
  external = undefined,
  ...props
}) {
  const LinkComponent = 'a'

  return (
    <LinkComponent
      {...props}
      rel={external ? props.rel ?? 'noreferrer' : props.rel}
      target={external ? props.target ?? '_blank' : props.target}
      className={clsx(
        className,
        'hover:text-landing-accent-light group relative isolate flex items-center rounded-lg px-2 py-0.5 text-[0.8125rem]/6 font-medium transition-colors dark:text-white/30',
        compact ? 'gap-x-2' : 'gap-x-3',
      )}
    >
      <span className="absolute inset-0 -z-10 scale-75 rounded-lg opacity-0 transition group-hover:scale-100 group-hover:opacity-100 dark:bg-white/5" />
      {Icon && (
        <Icon
          className={clsx(iconClassName ? iconClassName : 'h-4 w-4 flex-none')}
        />
      )}
      <span className="self-baseline dark:text-white">{children}</span>
    </LinkComponent>
  )
}
