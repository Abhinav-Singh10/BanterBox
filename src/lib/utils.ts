import { ClassValue,clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// we will create conditional classes throughout our application and this utility function would help us
export function cn (...inputs: ClassValue[]) { // this will help remove conflicting class values that are finally applied in the css, where inputs would all be classvalues, resulting in an array of tailwind classes
    
    return twMerge(clsx(inputs)) 
}