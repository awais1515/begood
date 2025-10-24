

"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BirthDateSelectorProps {
  value?: Date;
  onChange: (date?: Date) => void;
  className?: string;
}

export function BirthDateSelector({ value, onChange, className }: BirthDateSelectorProps) {
  const [day, setDay] = React.useState<string | undefined>(
    value ? String(value.getDate()) : undefined
  );
  const [month, setMonth] = React.useState<string | undefined>(
    value ? String(value.getMonth()) : undefined
  );
  const [year, setYear] = React.useState<string | undefined>(
    value ? String(value.getFullYear()) : undefined
  );

  React.useEffect(() => {
    if (day && month && year) {
      const newDate = new Date(Number(year), Number(month), Number(day));
      if (!value || newDate.getTime() !== value.getTime()) {
        onChange(newDate);
      }
    } else if (value && (!day || !month || !year)) {
      // If any field is cleared, clear the whole date
      onChange(undefined);
    }
  }, [day, month, year, onChange, value]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - 18 - i));
  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];
  const daysInMonth = (year && month) ? new Date(Number(year), Number(month) + 1, 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger aria-label="Month">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={day} onValueChange={setDay}>
        <SelectTrigger aria-label="Day">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger aria-label="Year">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
