import React, { useState } from 'react'
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"

import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"
import data from "../countries.json"

const countries = data;

const processCountry = (country) => {
  const processedLabel = country.label.split(',').reverse().join(' ').trim();
  return processedLabel.charAt(0).toUpperCase() + processedLabel.slice(1);
}


export function ChooseAnswer({value,setValue}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[100%] justify-between"
        >
          {value
            ? countries.find((country) => country.value === value)?.label
            : "Guess country..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.label}
                  onSelect={(currentValue) => {
                    const selectedCountry = countries.find(
                      (option) => option.label.toLowerCase() === currentValue.toLowerCase(),
                    );
                    setValue(selectedCountry?.value ?? "");
                    setOpen(false);
                  }}
                >
                  {processCountry(country)}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === country.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
