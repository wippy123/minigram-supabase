import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  onValueChange: (value: string) => void;
};

export const Select: React.FC<SelectProps> = ({
  children,
  className,
  onValueChange,
  ...props
}) => {
  return (
    <select
      className={`block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${className}`}
      onChange={(e) => onValueChange(e.target.value)}
      {...props}
    >
      {children}
    </select>
  );
};
