"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/shadcn-button"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-[3px] transition-[opacity,backdrop-filter] duration-[var(--dur-sheet-enter)] ease-[var(--ease-out)] data-ending-style:backdrop-blur-none data-ending-style:opacity-0 data-ending-style:duration-[var(--dur-sheet-exit)] data-ending-style:ease-[var(--ease-in)] data-starting-style:backdrop-blur-none data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "group/sheet fixed z-50 flex flex-col gap-0 overflow-hidden rounded-[var(--r-xl)] border border-[var(--line)] bg-[var(--surface)] bg-clip-padding text-sm text-[var(--text)] shadow-[var(--sh-float)] will-change-transform transition-[transform,opacity] duration-[var(--dur-sheet-enter)] ease-[var(--ease-out)] data-ending-style:opacity-0 data-ending-style:duration-[var(--dur-sheet-exit)] data-ending-style:ease-[var(--ease-in)] data-starting-style:opacity-0",
          "data-[side=bottom]:inset-x-4 data-[side=bottom]:bottom-4 data-[side=bottom]:h-auto data-[side=bottom]:max-h-[85vh] data-[side=bottom]:data-ending-style:translate-y-[60%] data-[side=bottom]:data-starting-style:translate-y-[60%]",
          "data-[side=top]:inset-x-4 data-[side=top]:top-4 data-[side=top]:h-auto data-[side=top]:max-h-[85vh] data-[side=top]:data-ending-style:translate-y-[-60%] data-[side=top]:data-starting-style:translate-y-[-60%]",
          "data-[side=left]:top-4 data-[side=left]:bottom-4 data-[side=left]:left-4 data-[side=left]:h-auto data-[side=left]:w-[min(440px,calc(100vw-2rem))] data-[side=left]:data-ending-style:translate-x-[-60%] data-[side=left]:data-starting-style:translate-x-[-60%]",
          "data-[side=right]:top-4 data-[side=right]:bottom-4 data-[side=right]:right-4 data-[side=right]:h-auto data-[side=right]:w-[min(440px,calc(100vw-2rem))] data-[side=right]:data-ending-style:translate-x-[60%] data-[side=right]:data-starting-style:translate-x-[60%]",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3 transition-[opacity,transform] duration-200 ease-out delay-100 group-data-starting-style/sheet:opacity-0 group-data-ending-style/sheet:opacity-0"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "flex flex-col gap-1 border-b border-[var(--line)] p-5 transition-[opacity,transform] duration-300 ease-out delay-75 group-data-starting-style/sheet:translate-y-1 group-data-starting-style/sheet:opacity-0 group-data-ending-style/sheet:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "mt-auto flex flex-col gap-2 border-t border-[var(--line)] p-5 transition-[opacity,transform] duration-300 ease-out delay-100 group-data-starting-style/sheet:translate-y-1 group-data-starting-style/sheet:opacity-0 group-data-ending-style/sheet:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--ink)]",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
