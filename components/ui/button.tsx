import * as React from 'react'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200",

        destructive:
          "cursor-pointer bg-destructive text-white hover:bg-destructive/90 shadow-md shadow-destructive/20 hover:shadow-lg hover:shadow-destructive/30 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/80 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200",

        outline:
          "cursor-pointer border-2 border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 dark:bg-background/50 dark:border-border dark:hover:bg-accent/50 dark:hover:border-accent-foreground/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",

        secondary:
          "cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200",

        ghost:
          "cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 transition-colors duration-200 hover:-translate-y-0.5 active:translate-y-0",

        link: "cursor-pointer text-primary underline-offset-4 hover:underline hover:text-primary/80 transition-colors duration-200",

        success:
          "cursor-pointer bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-600/20 hover:shadow-lg hover:shadow-green-600/30 dark:bg-green-700 dark:hover:bg-green-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200",

        warning:
          "cursor-pointer bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 dark:bg-amber-600 dark:hover:bg-amber-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200",

        info: "cursor-pointer bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 dark:bg-blue-700 dark:hover:bg-blue-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200",

        gradient:
          "cursor-pointer bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300",

        "outline-destructive":
          "cursor-pointer border-2 border-destructive text-destructive hover:bg-destructive hover:text-white dark:border-destructive/80 dark:text-destructive dark:hover:bg-destructive/90 transition-all duration-200",

        "outline-primary":
          "cursor-pointer border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground dark:border-primary/80 dark:hover:bg-primary/90 transition-all duration-200",

        "ghost-destructive":
          "cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 transition-colors duration-200",

        shine:
          "cursor-pointer bg-primary text-primary-foreground relative overflow-hidden hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700",

        elevated:
          "bg-background text-foreground border shadow-lg hover:shadow-xl dark:bg-card dark:border-border hover:-translate-y-1 active:translate-y-0 active:shadow-lg transition-all duration-300",

        glass:
          "cursor-pointer bg-white/10 text-foreground backdrop-blur-md border border-white/20 hover:bg-white/20 dark:bg-black/10 dark:border-white/10 dark:hover:bg-black/20 shadow-lg hover:shadow-xl transition-all duration-200",
      },

      size: {
        xs: "h-7 rounded px-2 text-xs gap-1 has-[>svg]:px-1.5",
        sm: "h-8 rounded-md gap-1.5 px-3 text-sm has-[>svg]:px-2.5",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-11 rounded-md px-6 text-base has-[>svg]:px-4",
        xl: "h-12 rounded-lg px-8 text-lg has-[>svg]:px-5",
        icon: "size-9",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        "icon-xl": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
