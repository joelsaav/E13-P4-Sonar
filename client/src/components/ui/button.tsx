import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";
import Icon from "./icon";
import type { IconType } from "@/types/components";

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    leftIcon?: IconType | string;
    rightIcon?: IconType | string;
    iconSize?: number;
    text?: React.ReactNode;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      leftIcon,
      rightIcon,
      iconSize = 16,
      children,
      text,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {leftIcon ? (
          <Icon as={leftIcon} size={iconSize} className="shrink-0" />
        ) : null}
        {text || children}
        {rightIcon ? (
          <Icon as={rightIcon} size={iconSize} className="shrink-0" />
        ) : null}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
