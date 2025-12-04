import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import Icon from "@/components/ui/icon";

// Replace the `Checkbox` component in `@components/ui/checkbox` with below component and use it here to support custom icon.
export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    icon?: React.ReactNode;
    checkedIcon?: React.ReactNode;
  }
>(({ className, icon, checkedIcon, ...props }, ref) => (
  <>
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn("peer group", className)}
      {...props}
    >
      <span className="group-data-[state=checked]:hidden">{icon}</span>
      <span className="group-data-[state=unchecked]:hidden">{checkedIcon}</span>

      {!checkedIcon && (
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-current")}
        >
          <CheckIcon className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
      )}
    </CheckboxPrimitive.Root>
  </>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
