export type FileType = "file" | "folder";

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  parentId: string | null;
  content?: string; // Only for files
  children?: string[]; // Array of IDs, only for folders
  language?: string; // e.g., 'javascript', 'python'
  isOpen?: boolean; // UI state for folders
  url?: string; // For lazy loading external content (e.g. GitHub)
}

export type FileSystem = Record<string, FileSystemItem>;

export interface IFileSystemContext {
  fileSystem: FileSystem;
  activeFileId: string | null;
  openFiles: string[]; // List of IDs for open tabs
  createFile: (parentId: string | null, name: string, type: FileType) => string;
  updateFileContent: (fileId: string, content: string) => void;
  deleteItem: (itemId: string) => void;
  renameItem: (itemId: string, newName: string) => void;
  setActiveFile: (fileId: string | null) => void;
  closeFile: (fileId: string) => void;
  toggleFolder: (folderId: string) => void;
  setDirectory: (rootName: string, items: FileSystemItem[]) => void;
}
