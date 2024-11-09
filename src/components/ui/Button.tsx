import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, FC } from "react";

// class variance authority allows me to have variants of my buttton
const butttonVariants = cva(
  // 1st argument are the styles that are always active on the button
  "active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-color focus: outline-none focus:ring-2 focus:ring-slate-400 focus: ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        ghost: "bg-transparent hover: text-slate-900 hover:bg-slate-200",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-2",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// HTMLButtonElement :now whatever props we pass to the button are gonna include whatever we pass to a default button in react
// Variant Props : to get the above functionality + intellisense on all our button variants (takes in a Generic, i.e. the buttons we passed above)
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof butttonVariants> {
  // here we will pass custom properties
  isLoading?: boolean;
}

// we are destructuring props here
// ...props here is catch all , for all the other properties that we are not destructuring
const Button: FC<ButtonProps> = ({
  className,
  children,
  variant,
  isLoading,
  size,
  ...props
}) => {
  // this cn utility function would let us easily overwrite styles across our project
  return <button className={cn(butttonVariants({variant,size,className}))} disabled={isLoading} {...props}>
    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
    {children}  
  </button>; //we can pass all the other properties to the button as we know that those are all button properties, also Loader2 is coming from a dependency
  // {children} is rendering all of the texts we pass into the buttons
};

export default Button;