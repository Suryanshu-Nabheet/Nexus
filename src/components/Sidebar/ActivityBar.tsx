import React from "react";
import {
  Files,
  Search,
  GitBranch,
  Puzzle,
  Settings,
  UserCircle,
} from "lucide-react";
import { motion } from "framer-motion";

interface ActivityBarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onViewChange,
}) => {
  const icons = [
    { id: "explorer", icon: Files, label: "Explorer" },
    { id: "search", icon: Search, label: "Search" },
    { id: "git", icon: GitBranch, label: "Source Control" },
    { id: "extensions", icon: Puzzle, label: "Extensions" },
  ];

  return (
    <div className="w-[48px] bg-black border-r border-[#1f1f1f] flex flex-col justify-between py-2 z-20 flex-shrink-0">
      <div className="flex flex-col items-center space-y-4 pt-2">
        {icons.map((item) => (
          <div
            key={item.id}
            className="relative group w-full flex justify-center cursor-pointer"
            onClick={() => onViewChange(item.id)}
          >
            {activeView === item.id && (
              <motion.div
                layoutId="active-indicator"
                className="absolute left-0 top-[10%] h-[80%] w-[2px] bg-white"
              />
            )}
            <div
              className={`p-2 transition-colors ${
                activeView === item.id
                  ? "text-white"
                  : "text-[#858585] group-hover:text-white"
              }`}
              title={item.label}
            >
              <item.icon className="h-6 w-6" strokeWidth={1.5} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center space-y-4 pb-2">
        <div
          className="p-2 text-[#858585] hover:text-white cursor-pointer"
          title="Accounts"
        >
          <UserCircle className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <div
          className="p-2 text-[#858585] hover:text-white cursor-pointer"
          title="Manage"
        >
          <Settings className="h-6 w-6" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export default ActivityBar;
