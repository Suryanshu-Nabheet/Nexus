import React from "react";
import { X, FileCode, FileJson, FileType, File } from "lucide-react";
import { useFileSystem } from "../../contexts/FileSystemContext";
import { motion, AnimatePresence } from "framer-motion";

const getFileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return <FileCode className="h-3.5 w-3.5 text-yellow-400" />;
    case "json":
      return <FileJson className="h-3.5 w-3.5 text-yellow-400" />;
    case "css":
      return <div className="text-blue-400 font-bold text-[10px]">#</div>;
    case "html":
      return (
        <div className="text-orange-500 font-bold text-[10px]">&lt;&gt;</div>
      );
    default:
      return <File className="h-4 w-4 text-gray-400" />;
  }
};

const TabBar: React.FC = () => {
  const { openFiles, activeFileId, setActiveFile, closeFile, fileSystem } =
    useFileSystem();

  if (openFiles.length === 0) return null;

  return (
    <div className="flex h-[35px] bg-black border-b border-[#1f1f1f] overflow-x-auto select-none no-scrollbar">
      <AnimatePresence initial={false}>
        {openFiles.map((fileId) => {
          const file = fileSystem[fileId];
          const isActive = activeFileId === fileId;

          if (!file) return null;

          return (
            <motion.div
              key={fileId}
              initial={{ opacity: 0, minWidth: 0 }}
              animate={{ opacity: 1, minWidth: 120 }}
              exit={{ opacity: 0, minWidth: 0 }}
              className={`
                group relative flex items-center min-w-[120px] max-w-[200px] px-3 cursor-pointer
                border-r border-[#1f1f1f]
                ${
                  isActive
                    ? "bg-[#1e1e1e] text-white"
                    : "bg-black text-[#868686] hover:bg-[#111]"
                }
              `}
              onClick={() => setActiveFile(fileId)}
            >
              {/* Top Active Indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-blue-500" />
              )}

              {/* Icon */}
              <span className="mr-2 flex-shrink-0 opacity-80">
                {getFileIcon(file.name)}
              </span>

              {/* Filename */}
              <span className="text-[13px] truncate flex-1">{file.name}</span>

              {/* Close Button UI Adjustment: Always visible if active, else hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(fileId);
                }}
                className={`
                  ml-2 p-0.5 rounded-sm 
                  hover:bg-gray-600/50 transition-all
                  ${
                    isActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }
                `}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default TabBar;
