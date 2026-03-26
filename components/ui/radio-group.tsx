import * as React from "react"
import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<HTMLDivElement, any>(
  ({ className, value, onValueChange, children, ...props }, ref) => (
    <div className={cn("grid gap-2", className)} ref={ref} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<any>(child)) {
          return React.cloneElement(child, {
            ...child.props,
            checked: child.props.value === value,
            onChange: () => onValueChange?.(child.props.value),
          })
        }
        return child
      })}
    </div>
  )
)
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<HTMLInputElement, any>(
  ({ className, checked, onChange, value, ...props }, ref) => (
    <div className={cn("relative flex items-center justify-center w-5 h-5 rounded-full border border-primary text-primary shrink-0 transition-all", checked ? "bg-primary text-primary-foreground border-primary" : "bg-transparent border-input", className)}>
      <input
        type="radio"
        ref={ref}
        value={value}
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        {...props}
      />
      {checked && <div className="h-2.5 w-2.5 rounded-full bg-current" />}
    </div>
  )
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
