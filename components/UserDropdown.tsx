import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  email: string;
}

interface UserDropdownProps {
  users: User[];
  value: string | null;
  onChange: (value: string) => void;
}

export function UserDropdown({ users, value, onChange }: UserDropdownProps) {
  return (
    <Select onValueChange={onChange} value={value || undefined}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Assign to..." />
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
