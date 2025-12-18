import React from "react";
import { useFileSystem } from "../../contexts/FileSystemContext";
import FileExplorerItem from "./FileExplorerItem";
import { Plus, FolderPlus } from "lucide-react";

const FileExplorer: React.FC = () => {
  const { fileSystem, createFile } = useFileSystem();

  const rootItem = fileSystem["root"];

  const handleCreateFile = () => {
    const name = prompt("Enter file name:");
    if (name) {
      // Default to root for now if no folder selected (context needs 'activeFolder' logic)
      createFile("root", name, "file");
    }
  };

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name:");
    if (name) {
      createFile("root", name, "folder");
    }
  };

  return (
    <div className="h-full bg-black border-r border-[#1f1f1f] flex flex-col w-60 overflow-hidden text-[13px]">
      <div className="p-3 border-b border-[#1f1f1f] flex justify-between items-center bg-[#18181b]/50">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Explorer
        </span>
        <div className="flex space-x-1">
          <button
            onClick={handleCreateFile}
            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
            title="New File"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={handleCreateFolder}
            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
            title="New Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {rootItem &&
          rootItem.children?.map(
            (childId) =>
              fileSystem[childId] && (
                <FileExplorerItem
                  key={childId}
                  item={fileSystem[childId]}
                  level={0}
                />
              )
          )}
      </div>
    </div>
  );
};

export default FileExplorer;
