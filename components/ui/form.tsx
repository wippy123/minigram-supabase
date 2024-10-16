import React, { forwardRef } from "react";
import { FieldValues, UseFormRegister, FieldErrors } from "react-hook-form";

interface FormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

export function Form({ onSubmit, children }: FormProps) {
  return <form onSubmit={onSubmit}>{children}</form>;
}

interface FormItemProps {
  children: React.ReactNode;
}

export function FormItem({ children }: FormItemProps) {
  return <div className="mb-4">{children}</div>;
}

interface FormLabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

export function FormLabel({ htmlFor, children }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700"
    >
      {children}
    </label>
  );
}

interface FormControlProps {
  children: React.ReactNode;
}

export function FormControl({ children }: FormControlProps) {
  return <div className="mt-1">{children}</div>;
}

interface FormDescriptionProps {
  children: React.ReactNode;
}

export function FormDescription({ children }: FormDescriptionProps) {
  return <p className="mt-2 text-sm text-gray-500">{children}</p>;
}

interface FormMessageProps {
  children: React.ReactNode;
}

export function FormMessage({ children }: FormMessageProps) {
  return <p className="mt-2 text-sm text-red-600">{children}</p>;
}

interface FormFieldProps<TFieldValues extends FieldValues> {
  name: string;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  render: (props: {
    field: ReturnType<UseFormRegister<TFieldValues>>;
  }) => React.ReactNode;
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  register,
  errors,
  render,
}: FormFieldProps<TFieldValues>) {
  const field = register(name);
  return (
    <FormItem>
      {render({ field })}
      {errors[name] && (
        <FormMessage>{errors[name]?.message as string}</FormMessage>
      )}
    </FormItem>
  );
}
