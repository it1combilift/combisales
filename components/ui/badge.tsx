import * as React from 'react'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm [a&]:hover:bg-primary/90 [a&]:hover:shadow-md dark:shadow-primary/20",

        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-sm [a&]:hover:bg-secondary/80 dark:bg-secondary/80",

        destructive:
          "bg-destructive/10 [a&]:hover:bg-destructive/5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive border-none focus-visible:outline-none",

        outline:
          "border-border bg-background text-foreground shadow-sm [a&]:hover:bg-accent [a&]:hover:text-accent-foreground [a&]:hover:border-accent-foreground/20 dark:border-border/70 dark:bg-background/50",

        success:
          "border-none bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 focus-visible:outline-none dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5",

        warning:
          "border-none bg-amber-600/10 text-amber-600 focus-visible:ring-amber-600/20 focus-visible:outline-none dark:bg-amber-400/10 dark:text-amber-400 dark:focus-visible:ring-amber-400/40 [a&]:hover:bg-amber-600/5 dark:[a&]:hover:bg-amber-400/5",

        info: "border-none bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 focus-visible:outline-none dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5",

        error:
          "border-red-200 bg-red-50 text-red-700 shadow-sm [a&]:hover:bg-red-100 [a&]:hover:border-red-300 dark:border-red-800/50 dark:bg-red-950/50 dark:text-red-400 dark:[a&]:hover:bg-red-950/70",

        purple:
          "border-purple-200 bg-purple-50 text-purple-700 shadow-sm [a&]:hover:bg-purple-100 [a&]:hover:border-purple-300 dark:border-purple-800/50 dark:bg-purple-950/50 dark:text-purple-400 dark:[a&]:hover:bg-purple-950/70",

        pink: "border-pink-200 bg-pink-50 text-pink-700 shadow-sm [a&]:hover:bg-pink-100 [a&]:hover:border-pink-300 dark:border-pink-800/50 dark:bg-pink-950/50 dark:text-pink-400 dark:[a&]:hover:bg-pink-950/70",

        teal: "border-teal-200 bg-teal-50 text-teal-700 shadow-sm [a&]:hover:bg-teal-100 [a&]:hover:border-teal-300 dark:border-teal-800/50 dark:bg-teal-950/50 dark:text-teal-400 dark:[a&]:hover:bg-teal-950/70",

        neutral:
          "border-gray-200 bg-gray-50 text-gray-700 shadow-sm [a&]:hover:bg-gray-100 [a&]:hover:border-gray-300 dark:border-gray-800/50 dark:bg-gray-900/50 dark:text-gray-400 dark:[a&]:hover:bg-gray-900/70",

        "outline-primary":
          "border-primary bg-primary/5 text-primary shadow-sm [a&]:hover:bg-primary/10 [a&]:hover:border-primary/70 dark:bg-primary/10 dark:border-primary/50 dark:[a&]:hover:bg-primary/20",

        "outline-success":
          "border-green-600 bg-green-50/50 text-green-700 shadow-sm [a&]:hover:bg-green-100/50 dark:border-green-600/50 dark:bg-green-950/30 dark:text-green-400",

        "outline-warning":
          "border-amber-600 bg-amber-50/50 text-amber-700 shadow-sm [a&]:hover:bg-amber-100/50 dark:border-amber-600/50 dark:bg-amber-950/30 dark:text-amber-400",

        "outline-destructive":
          "border-destructive bg-destructive/5 text-destructive shadow-sm [a&]:hover:bg-destructive/10 dark:bg-destructive/10 dark:border-destructive/50",

        ghost:
          "border-transparent bg-transparent text-foreground [a&]:hover:bg-accent/50 dark:[a&]:hover:bg-accent/30",

        gradient:
          "border-transparent bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white shadow-md shadow-primary/20 [a&]:hover:shadow-lg [a&]:hover:shadow-primary/30 dark:shadow-primary/30",
        shine:
          "border-transparent bg-primary text-primary-foreground shadow-sm relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:-translate-x-full [a&]:hover:before:translate-x-full before:transition-transform before:duration-700",

        dot: 'border-border bg-background text-foreground shadow-sm pl-1.5 before:content-[""] before:size-1.5 before:rounded-full before:bg-current before:inline-block before:mr-1 [a&]:hover:bg-accent dark:border-border/70 dark:bg-background/50',
      },

      size: {
        sm: "px-2 py-0.5 text-[10px] [&>svg]:size-2.5 gap-1 rounded",
        default: "px-2.5 py-0.5 text-xs [&>svg]:size-3 gap-1.5 rounded-md",
        lg: "px-3 py-1 text-sm [&>svg]:size-3.5 gap-1.5 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
