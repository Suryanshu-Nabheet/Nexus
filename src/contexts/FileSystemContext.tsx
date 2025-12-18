import React, { createContext, useContext, useState, useEffect } from "react";
import {
  FileSystem,
  IFileSystemContext,
  FileSystemItem,
  FileType,
} from "../types/fileSystem";

import { v4 as uuidv4 } from "uuid";

const initialFileSystem: FileSystem = {
  root: {
    id: "root",
    name: "root",
    type: "folder",
    parentId: null,
    children: ["welcome-file"],
    isOpen: true,
  },
  "welcome-file": {
    id: "welcome-file",
    name: "Welcome.js",
    type: "file",
    parentId: "root",
    content: '// Welcome to Nexus\nconsole.log("Hello, World!");',
    language: "javascript",
  },
};

const FileSystemContext = createContext<IFileSystemContext | undefined>(
  undefined
);

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fileSystem, setFileSystem] = useState<FileSystem>(initialFileSystem);
  const [activeFileId, setActiveFileId] = useState<string | null>(
    "welcome-file"
  );
  const [openFiles, setOpenFiles] = useState<string[]>(["welcome-file"]);

  const createFile = (
    parentId: string | null,
    name: string,
    type: FileType
  ): string => {
    const id = uuidv4();
    const safeParentId = parentId || "root";

    const newItem: FileSystemItem = {
      id,
      name,
      type,
      parentId: safeParentId,
      content: type === "file" ? "" : undefined,
      children: type === "folder" ? [] : undefined,
      language: name.split(".").pop() || "txt",
      isOpen: true,
    };

    setFileSystem((prev) => {
      const parent = prev[safeParentId];
      if (!parent) return prev;

      return {
        ...prev,
        [id]: newItem,
        [safeParentId]: {
          ...parent,
          children: [...(parent.children || []), id],
        },
      };
    });

    if (type === "file") {
      setActiveFileId(id);
      setOpenFiles((prev) => [...prev, id]);
    }

    return id;
  };

  const updateFileContent = (fileId: string, content: string) => {
    setFileSystem((prev) => ({
      ...prev,
      [fileId]: { ...prev[fileId], content },
    }));
  };

  const deleteItem = (itemId: string) => {
    setFileSystem((prev) => {
      const item = prev[itemId];
      if (!item || !item.parentId) return prev;

      const parent = prev[item.parentId];
      const newParentChildren =
        parent.children?.filter((id) => id !== itemId) || [];

      const newFS = { ...prev };
      delete newFS[itemId];
      newFS[item.parentId] = { ...parent, children: newParentChildren };

      return newFS;
    });

    if (openFiles.includes(itemId)) {
      closeFile(itemId);
    }
  };

  const renameItem = (itemId: string, newName: string) => {
    setFileSystem((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], name: newName },
    }));
  };

  const setActiveFile = (fileId: string | null) => {
    setActiveFileId(fileId);
    if (fileId && !openFiles.includes(fileId)) {
      setOpenFiles((prev) => [...prev, fileId]);
    }
  };

  const closeFile = (fileId: string) => {
    setOpenFiles((prev) => {
      const newFiles = prev.filter((id) => id !== fileId);
      // If we closed the active file, switch to the last one or null
      if (activeFileId === fileId) {
        // If there are other files, switch to the last one
        const nextFile =
          newFiles.length > 0 ? newFiles[newFiles.length - 1] : null;
        setActiveFileId(nextFile);
      }
      return newFiles;
    });
  };

  const toggleFolder = (folderId: string) => {
    setFileSystem((prev) => ({
      ...prev,
      [folderId]: { ...prev[folderId], isOpen: !prev[folderId].isOpen },
    }));
  };

  const setDirectory = (rootName: string, items: FileSystemItem[]) => {
    const newFS: FileSystem = {};
    const rootId = "root";

    // Reset root
    newFS[rootId] = {
      id: rootId,
      name: rootName,
      type: "folder",
      parentId: null,
      children: [],
      isOpen: true,
    };

    // Populate items
    items.forEach((item) => {
      newFS[item.id] = item;
      // Add to parent's children
      const parentId = item.parentId || rootId;
      if (newFS[parentId]) {
        const parent = newFS[parentId];
        newFS[parentId] = {
          ...parent,
          children: [...(parent.children || []), item.id],
        };
      }
    });

    setFileSystem(newFS);
    setActiveFileId(null);
    setOpenFiles([]);
  };

  return (
    <FileSystemContext.Provider
      value={{
        fileSystem,
        activeFileId,
        openFiles,
        createFile,
        updateFileContent,
        deleteItem,
        renameItem,
        setActiveFile,
        closeFile,
        toggleFolder,
        setDirectory,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error("useFileSystem must be used within a FileSystemProvider");
  }
  return context;
};
