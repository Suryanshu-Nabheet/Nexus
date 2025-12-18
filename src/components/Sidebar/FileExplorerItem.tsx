import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
} from "lucide-react";
import { useFileSystem } from "../../contexts/FileSystemContext";
import { FileSystemItem } from "../../types/fileSystem";
import { motion, AnimatePresence } from "framer-motion";

interface FileExplorerItemProps {
  item: FileSystemItem;
  level: number;
}

const getFileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return <FileCode className="h-4 w-4 text-blue-400" />;
    case "json":
      return <FileJson className="h-4 w-4 text-yellow-400" />;
    case "css":
    case "html":
      return <FileCode className="h-4 w-4 text-orange-400" />;
    default:
      return <FileText className="h-4 w-4 text-gray-400" />;
  }
};

const FileExplorerItem: React.FC<FileExplorerItemProps> = ({ item, level }) => {
  const { fileSystem, activeFileId, setActiveFile, toggleFolder } =
    useFileSystem();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === "folder") {
      toggleFolder(item.id);
    } else {
      setActiveFile(item.id);
    }
  };

  const isFolder = item.type === "folder";
  const isActive = activeFileId === item.id;

  return (
    <div className="select-none">
      <motion.div
        className={`flex items-center py-1 px-2 cursor-pointer transition-colors ${
          isActive
            ? "bg-blue-500/20 text-blue-200 border-l-2 border-blue-500"
            : "hover:bg-white/5 text-gray-400 hover:text-gray-200"
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="mr-1 opacity-70">
          {isFolder ? (
            item.isOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )
          ) : (
            <div className="w-3" /> // Spacer
          )}
        </span>

        <span className="mr-2">
          {isFolder ? (
            item.isOpen ? (
              <FolderOpen className="h-4 w-4 text-blue-300" />
            ) : (
              <Folder className="h-4 w-4 text-blue-300" />
            )
          ) : (
            getFileIcon(item.name)
          )}
        </span>

        <span className="text-sm truncate max-w-[150px]">{item.name}</span>
      </motion.div>

      <AnimatePresence>
        {isFolder && item.isOpen && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {item.children.map(
              (childId) =>
                fileSystem[childId] && (
                  <FileExplorerItem
                    key={childId}
                    item={fileSystem[childId]}
                    level={level + 1}
                  />
                )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileExplorerItem;
