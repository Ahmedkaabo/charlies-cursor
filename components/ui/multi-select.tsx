"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface MultiSelectProps {
  options: { label: string; value: string }[]
  selected: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({ options, selected, onChange, placeholder, className }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
    onChange(newSelected)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((value) => {
                const option = options.find((opt) => opt.value === value)
                return (
                  <Badge key={value} variant="secondary">
                    {option?.label}
                  </Badge>
                )
              })
            ) : (
              <span className="text-muted-foreground">{placeholder || "Select..."}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} onSelect={() => handleSelect(option.value)}>
                  <Check
                    className={cn("mr-2 h-4 w-4", selected.includes(option.value) ? "opacity-100" : "opacity-0")}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
