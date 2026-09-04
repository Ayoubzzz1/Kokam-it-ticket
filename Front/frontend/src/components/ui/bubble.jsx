import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  muted: 'bg-muted text-muted-foreground',
  tinted: 'bg-primary/10 text-foreground',
  outline: 'border border-border bg-background text-foreground',
  ghost: 'text-foreground',
  destructive: 'bg-destructive/10 text-destructive',
}

export function Bubble({ className, align = 'start', children, ...props }) {
  return (
    <div className={cn('flex w-full', align === 'end' ? 'justify-end' : 'justify-start', className)} {...props}>
      {children}
    </div>
  )
}

export function BubbleContent({ className, render, variant = 'secondary', children, ...props }) {
  const Component = render?.type || 'div'
  const componentProps = render?.props || {}
  return (
    <Component
      {...componentProps}
      {...props}
      className={cn('max-w-[80%] rounded-2xl px-4 py-2.5 text-sm', variants[variant] || variants.secondary, className)}
    >
      {children}
    </Component>
  )
}

export function BubbleReactions({ className, children, ...props }) {
  return <div className={cn('mt-1 flex items-center gap-1 text-xs', className)} {...props}>{children}</div>
}

export function BubbleGroup({ className, children, ...props }) {
  return <div className={cn('flex flex-col gap-2', className)} {...props}>{children}</div>
}