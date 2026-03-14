"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <div className={cn("p-3", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center items-center gap-2 pt-1 relative",          dropdowns: "flex items-center gap-2",
          dropdown_root: "relative",
          dropdown: "absolute inset-0 opacity-0 cursor-pointer",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          row: "flex w-full mt-2",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
          cell: "h-9 w-9 text-center text-sm p-0 relative",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        {...props}
      />
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
