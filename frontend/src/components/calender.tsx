"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Calendar22({
  date,
  onSelect,
}: {
  onSelect: (date: Date | undefined) => void;
  date: Date | undefined;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {date ? date.toLocaleDateString("ar-EG") : "اختر اليوم"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          dir="rtl"
          className="w-auto overflow-hidden p-0"
          align="start"
        >
          <Calendar
            dir="ltr"
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(selectedDate) => {
              if (selectedDate) {
                const fixedDate = new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate()
                );
                onSelect(fixedDate);
              } else {
                onSelect(undefined);
              }
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
