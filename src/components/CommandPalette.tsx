import React, { useState, useEffect, useRef } from "react";
import { Search, File, Command, Settings, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFileSystem } from "../contexts/FileSystemContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "files" | "commands"; // 'files' = Cmd+P, 'commands' = Cmd+Shift+P
  onOpenFile: (fileId: string) => void;
  onRunCommand: (commandId: string) => void;
}

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  mode,
  onOpenFile,
  onRunCommand,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { fileSystem } = useFileSystem();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen, mode]);

  // Generate list items based on mode
  const getItems = () => {
    if (mode === "files") {
      return Object.values(fileSystem)
        .filter((item) => item.type === "file")
        .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
        .map((item) => ({
          id: item.id,
          label: item.name,
          icon: <File className="h-4 w-4 text-gray-400" />,
          action: () => onOpenFile(item.id),
        }));
    } else {
      // Commands
      const commands: CommandItem[] = [
        {
          id: "toggle-sidebar",
          label: "View: Toggle Sidebar",
          shortcut: "Cmd+B",
          icon: <Command className="h-4 w-4" />,
          action: () => onRunCommand("toggle-sidebar"),
        },
        {
          id: "save-file",
          label: "File: Save",
          shortcut: "Cmd+S",
          icon: <File className="h-4 w-4" />,
          action: () => onRunCommand("save-file"),
        },
        {
          id: "format-document",
          label: "Format Document",
          shortcut: "Shift+Alt+F",
          icon: <Settings className="h-4 w-4" />,
          action: () => onRunCommand("format-document"),
        },
        {
          id: "new-file",
          label: "File: New File",
          icon: <File className="h-4 w-4" />,
          action: () => onRunCommand("new-file"),
        },
      ];
      return commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
      );
    }
  };

  const filteredItems = getItems();

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-[#252526] rounded-lg shadow-2xl border border-[#3c3c3c] overflow-hidden flex flex-col"
          >
            {/* Input */}
            <div className="flex items-center px-4 py-3 border-b border-[#3c3c3c]">
              <Search className="h-4 w-4 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                placeholder={
                  mode === "files"
                    ? "Search files by name..."
                    : "Type a command..."
                }
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center space-x-1">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-[#3c3c3c] rounded border border-[#4a4a4a]">
                  Esc
                </kbd>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto py-2">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No results found.
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center px-4 py-2 text-sm text-left group ${
                      index === selectedIndex
                        ? "bg-[#04395e] text-white"
                        : "text-gray-300 hover:bg-[#2a2d2e]"
                    }`}
                  >
                    <span className="mr-3 opacity-80">{item.icon}</span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {/* @ts-ignore - existing check for item.shortcut */}
                    {item.shortcut && (
                      <span className="text-xs text-gray-500 group-hover:text-gray-300 ml-4 font-mono">
                        {/* @ts-ignore */}
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
            {mode === "commands" && (
              <div className="bg-[#007acc] text-white text-[10px] px-2 py-0.5 text-center font-mono">
                Command Palette
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
