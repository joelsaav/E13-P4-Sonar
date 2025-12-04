import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  children,
  className = "space-y-2",
}: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}
