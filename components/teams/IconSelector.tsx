import { useState } from "react";
import {
  UserGroupIcon,
  BeakerIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";

const icons = [
  { name: "UserGroup", component: UserGroupIcon },
  { name: "Beaker", component: BeakerIcon },
  { name: "LightBulb", component: LightBulbIcon },
  { name: "RocketLaunch", component: RocketLaunchIcon },
  { name: "PuzzlePiece", component: PuzzlePieceIcon },
];

type IconSelectorProps = {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
};

export default function IconSelector({
  selectedIcon,
  onSelectIcon,
}: IconSelectorProps) {
  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {icons.map((icon) => (
        <button
          key={icon.name}
          onClick={() => onSelectIcon(icon.name)}
          className={`p-2 border rounded ${
            selectedIcon === icon.name ? "border-blue-500" : "border-gray-300"
          }`}
        >
          <icon.component className="h-8 w-8" />
        </button>
      ))}
    </div>
  );
}
