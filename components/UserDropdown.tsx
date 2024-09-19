import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamMember } from "./tasks/AddTaskForm";

interface UserDropdownProps {
  users: TeamMember[];
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
          <SelectItem key={user.member_id} value={user.member_id}>
            {user.display_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
