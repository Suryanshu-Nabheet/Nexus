import React, { useRef } from "react";
import {
  Play,
  Moon,
  Sun,
  Save,
  FileCode,
  Menu,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Language } from "../utils/languages";
import { useTheme } from "../contexts/ThemeContext";

interface HeaderProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  onRunCode: () => void;
  onClearTerminal: () => void;
  onSaveCode: () => void;
  onShareCode: () => void;
  onFileUpload: (content: string, language: Language) => void;
  isLoading: boolean;
  activeFile: { name: string } | null;
}

const Header: React.FC<HeaderProps> = ({
  onRunCode,
  onSaveCode,
  isLoading,
  activeFile,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-[30px] bg-black flex items-center justify-between px-2 select-none border-b border-[#1f1f1f] text-[13px]">
      {/* Left: Window Controls & Menu */}
      <div className="flex items-center space-x-3">
        {/* macOS-style window controls logic usually handled by OS, but we can simulate menu */}
        <div className="flex items-center space-x-2 px-2">
          <FileCode className="h-4 w-4 text-blue-500" />
        </div>

        {/* Menu Bar Simulation */}
        <div className="hidden md:flex items-center space-x-3 text-gray-400 text-xs">
          <span className="hover:text-white cursor-pointer">File</span>
          <span className="hover:text-white cursor-pointer">Edit</span>
          <span className="hover:text-white cursor-pointer">Selection</span>
          <span className="hover:text-white cursor-pointer">View</span>
          <span className="hover:text-white cursor-pointer">Go</span>
          <span className="hover:text-white cursor-pointer">Run</span>
          <span className="hover:text-white cursor-pointer">Terminal</span>
          <span className="hover:text-white cursor-pointer">Help</span>
        </div>
      </div>

      {/* Center: Title / Active File */}
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-[#2a2a2a] px-3 py-0.5 rounded-md flex items-center space-x-2 text-gray-400 hover:text-white hover:bg-[#333] transition-colors cursor-pointer border border-transparent hover:border-[#3f3f3f] max-w-[400px]">
          <Search className="h-3 w-3" />
          <span className="text-xs truncate">
            {activeFile ? activeFile.name : "Nexus"}
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center">
          <button
            onClick={onRunCode}
            disabled={isLoading}
            className="p-1 hover:bg-[#333] rounded text-green-500 hover:text-green-400 transition-colors"
            title="Run Code (F5)"
          >
            <Play className="h-4 w-4 fill-current" />
          </button>

          <button
            onClick={onSaveCode}
            className="p-1 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
            title="Save (Cmd+S)"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>

        <div className="h-3 w-[1px] bg-gray-700 mx-2" />

        <div className="flex items-center space-x-1">
          <button className="p-1 text-gray-400 hover:text-white hover:bg-[#333] rounded">
            <div className="h-4 w-4 border border-gray-500 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 border-r border-b border-gray-500" />
            </div>
          </button>
          <button className="p-1 text-gray-400 hover:text-white hover:bg-[#333] rounded">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
