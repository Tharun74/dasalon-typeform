import * as React from "react"
import { cn } from "@/lib/utils"

const Select = ({ children, onValueChange, value, ...props }: any) => {
  // Simple native select wrapper for MVP
  return (
    <div className="relative w-full" {...props}>
      <select 
        value={value} 
        onChange={(e) => onValueChange?.(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-no-repeat pr-8"
        style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
      >
        {children}
      </select>
    </div>
  )
}

const SelectTrigger = ({ children, className }: any) => <>{children}</>
const SelectValue = ({ placeholder }: any) => <option value="" disabled hidden>{placeholder}</option>
const SelectContent = ({ children }: any) => <>{children}</>
const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
