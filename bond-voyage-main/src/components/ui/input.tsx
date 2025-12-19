import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 sm:h-10 w-full min-w-0 rounded-lg border border-input bg-input-background px-3 py-2 text-sm text-foreground transition-colors",
        "placeholder:text-muted-foreground",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:bg-input-background dark:border-input",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
