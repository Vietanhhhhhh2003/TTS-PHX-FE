"use client";

import { forwardRef } from "react";

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="date"
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-400" : "border-gray-300"
        } ${className}`}
        {...props}
      />
    );
  },
);
DatePicker.displayName = "DatePicker";
