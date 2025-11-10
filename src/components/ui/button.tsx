import * as React from "react";
import { Slot } from "@radix-ui/react-slot@1.1.2";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-base font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none cursor-pointer shadow-md hover:shadow-lg font-['Montserrat'] border-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-[25px]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 rounded-[25px]",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground rounded-[25px]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-[25px]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground rounded-[25px]",
        link: "text-primary underline-offset-4 hover:underline rounded-[25px]",
        maroon: "bg-[#8B0000] text-white hover:bg-[#8B0000]/90 rounded-[25px]",
      },
      size: {
        default: "h-auto px-[30px] py-[15px] has-[>svg]:px-[25px]",
        sm: "h-auto px-[20px] py-[10px] text-sm has-[>svg]:px-[15px]",
        lg: "h-auto px-[40px] py-[20px] text-lg has-[>svg]:px-[35px]",
        icon: "size-[50px] p-[15px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
