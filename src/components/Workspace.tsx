import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import EditorPane from "./EditorPane";
import TerminalPane from "./TerminalPane";
import PreviewPane from "./PreviewPane";
import FileExplorer from "./Sidebar/FileExplorer";
import ActivityBar from "./Sidebar/ActivityBar";
import TabBar from "./Tabs/TabBar";
import WelcomePage from "./WelcomePage";
import { Language, supportedLanguages } from "../utils/languages";
import { useFileSystem } from "../contexts/FileSystemContext";
import { loadPyodide, PyodideInterface } from "pyodide";

function Workspace() {
  const [currentDirId, setCurrentDirId] = useState<string>("root");

  const {
    activeFileId,
    fileSystem,
    updateFileContent,
    createFile,
    deleteItem,
    setDirectory,
  } = useFileSystem();

  const activeFile = activeFileId ? fileSystem[activeFileId] : null;

  // Determine language from active file
  const getLanguageFromExt = (ext: string = "js"): Language => {
    return (
      supportedLanguages.find((l) => l.extension === ext) ||
      supportedLanguages[0]
    );
  };

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    activeFile
      ? getLanguageFromExt(activeFile.name.split(".").pop())
      : supportedLanguages[0]
  );

  // Sync state with active file
  useEffect(() => {
    if (activeFile) {
      setCode(activeFile.content || "");
      const ext = activeFile.name.split(".").pop();
      setSelectedLanguage(getLanguageFromExt(ext));
    }
  }, [activeFileId, fileSystem]);

  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [horizontalLayout, setHorizontalLayout] = useState(false);
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFolderOpen, setIsFolderOpen] = useState(false); // Start false for "Open Folder" workflow
  const [activeView, setActiveView] = useState("explorer"); // 'explorer' | 'search' | 'git' | 'extensions'

  // Sync editor changes back to VFS
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (activeFileId) {
      updateFileContent(activeFileId, newCode);
    }
  };

  // File System Access API Implementation
  const handleOpenFolder = async () => {
    try {
      // @ts-ignore - window.showDirectoryPicker is not yet fully typed in all envs
      const dirHandle = await window.showDirectoryPicker();

      setIsLoading(true);
      const items: any[] = [];
      const rootName = dirHandle.name;

      async function readDir(handle: any, parentId: string | null) {
        for await (const entry of handle.values()) {
          const id = self.crypto.randomUUID();
          if (entry.kind === "file") {
            const file = await entry.getFile();
            const text = await file.text();
            items.push({
              id,
              name: entry.name,
              type: "file",
              parentId: parentId || "root",
              content: text,
              language: entry.name.split(".").pop() || "txt",
            });
          } else if (entry.kind === "directory") {
            items.push({
              id,
              name: entry.name,
              type: "folder",
              parentId: parentId || "root",
              children: [], // will be populated by context logic or manual if needed but context logic handles it if flat list
              isOpen: false,
            });
            await readDir(entry, id);
          }
        }
      }

      await readDir(dirHandle, null); // Start with null parent (meaning root children)

      setDirectory(rootName, items);
      setIsFolderOpen(true);
      setIsSidebarOpen(true);
      setActiveView("explorer");
    } catch (err) {
      console.error("Failed to open folder:", err);
      // User probably cancelled, do nothing
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitClone = async () => {
    const repoUrl = prompt(
      "Enter GitHub Repository URL (e.g. https://github.com/facebook/react):"
    );
    if (!repoUrl) return;

    setIsLoading(true);
    setOutput((prev) => prev + `\nCloning ${repoUrl}...\n`);

    try {
      // Parse URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) throw new Error("Invalid GitHub URL");

      const owner = match[1];
      const repo = match[2].replace(".git", "");

      // Get Default Branch
      const repoDataRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`
      );
      if (!repoDataRes.ok) throw new Error("Repository not found");
      const repoData = await repoDataRes.json();
      const branch = repoData.default_branch;

      // Get Tree
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
      );
      if (!treeRes.ok) throw new Error("Failed to fetch file tree");
      const treeData = await treeRes.json();

      const items: any[] = [];
      const rootName = repo;
      const idMap: Record<string, string> = {}; // path -> uuid

      // First pass: Create IDs for all paths
      // Root is implicit in "setDirectory" logic but we need to map GitHub paths (src/index.js) to our IDs.
      // Note: GitHub tree returns flattened paths.

      // We need to create a folder structure.
      // For every item "a/b/c.js", we need items for "a", "a/b", "a/b/c.js".
      // GitHub API returns "tree" items for folders too! so "a" and "a/b" should be in the list.

      // Create a lookup for paths to new UUIDs
      treeData.tree.forEach((node: any) => {
        idMap[node.path] = self.crypto.randomUUID();
      });

      treeData.tree.forEach((node: any) => {
        const id = idMap[node.path];
        const parts = node.path.split("/");
        const name = parts.pop();
        const parentPath = parts.join("/");
        const parentId = parts.length > 0 ? idMap[parentPath] : "root";

        if (node.type === "blob") {
          items.push({
            id,
            name,
            type: "file",
            parentId: parentId || "root", // should handle top level
            content: "// Loading from GitHub...",
            language: name?.split(".").pop() || "txt",
            url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${node.path}`,
          });
        } else if (node.type === "tree") {
          items.push({
            id,
            name,
            type: "folder",
            parentId: parentId || "root",
            children: [],
            isOpen: false,
          });
        }
      });

      setDirectory(rootName, items);
      setIsFolderOpen(true);
      setIsSidebarOpen(true);
      setActiveView("explorer");
      setOutput((prev) => prev + `Successfully cloned ${repo}!\n`);
    } catch (err: any) {
      console.error(err);
      setOutput((prev) => prev + `Error cloning repository: ${err.message}\n`);
      alert("Failed to clone repository: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Lazy Load Effect
  useEffect(() => {
    const loadContent = async () => {
      if (
        activeFile &&
        activeFile.url &&
        activeFile.content === "// Loading from GitHub..."
      ) {
        setIsLoading(true);
        try {
          const res = await fetch(activeFile.url);
          if (!res.ok) throw new Error("Failed to fetch content");
          const text = await res.text();
          updateFileContent(activeFile.id, text);
        } catch (err) {
          updateFileContent(activeFile.id, "// Error loading file content");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadContent();
  }, [activeFileId]); // Run when active file changes

  const [cursorPos, setCursorPos] = useState({ ln: 1, col: 1 });
  const handleCursorChange = (ln: number, col: number) => {
    setCursorPos({ ln, col });
  };

  useEffect(() => {
    const handleResize = () => {
      setHorizontalLayout(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Terminal input buffer
  const inputBuffer = useRef<string>("");

  useEffect(() => {
    async function loadPython() {
      if (pyodide) return;

      try {
        setIsLoading(true);
        setOutput("Initializing Python runtime...\n");

        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.6/full/",
          stdout: (text) => setOutput((prev) => prev + text + "\n"),
          stderr: (text) => setOutput((prev) => prev + "Error: " + text + "\n"),
        });

        pyodideInstance.setStdin({
          stdin: () => {
            const result = prompt("Input required:");
            if (result !== null) {
              setOutput((prev) => prev + result + "\n");
            }
            return result || "";
          },
        });

        setPyodide(pyodideInstance);
        setOutput(
          (prev) =>
            prev +
            "Python runtime initialized successfully.\nType in the terminal to interact.\n$ "
        );
      } catch (error) {
        console.error("Failed to load Python runtime:", error);
        setOutput(
          (prev) => prev + `Failed to initialize Python runtime: ${error}\n$ `
        );
      } finally {
        setIsLoading(false);
      }
    }
    // loadPython(); // Disable auto-load for now to conform to "clean" requirement, or Keep it?
    // User asked for "working end to end", so Python support is good.
    loadPython();
  }, []);

  const handleTerminalData = (data: string) => {
    if (data === "\r") {
      // Process command on Enter
      const commandLine = inputBuffer.current.trim();
      setOutput((prev) => prev + "\r\n");

      if (commandLine) {
        processShellCommand(commandLine);
      } else {
        // Just print prompt
        const getPathString = (id: string): string => {
          if (id === "root") return "~";
          let curr = fileSystem[id];
          let path = "";
          while (curr && curr.id !== "root") {
            path = "/" + curr.name + path;
            if (curr.parentId) curr = fileSystem[curr.parentId];
            else break;
          }
          return "~" + path;
        };
        setOutput(
          (prev) => prev + `\x1b[32m${getPathString(currentDirId)}\x1b[0m $ `
        );
      }
      inputBuffer.current = "";
    } else if (data === "\u007f") {
      // Backspace
      setOutput((prev) => {
        if (inputBuffer.current.length === 0) return prev;
        inputBuffer.current = inputBuffer.current.slice(0, -1);
        return prev.slice(0, -1);
      });
    } else {
      setOutput((prev) => prev + data);
      inputBuffer.current += data;
    }
  };

  const processShellCommand = (cmd: string) => {
    const args = cmd.trim().split(/\s+/);
    const command = args[0];

    // Helper to get formatted path for prompt
    const getPathString = (id: string): string => {
      if (id === "root") return "~";
      let curr = fileSystem[id];
      let path = "";
      while (curr && curr.id !== "root") {
        path = "/" + curr.name + path;
        if (curr.parentId) curr = fileSystem[curr.parentId];
        else break;
      }
      return "~" + path;
    };

    const currentDir = fileSystem[currentDirId];
    // Next prompt string
    const prompt = `\r\n\x1b[32m${getPathString(currentDirId)}\x1b[0m $ `; // Default prompt, override in CD

    switch (command) {
      case "ls":
        if (!currentDir || !currentDir.children) {
          setOutput((prev) => prev + prompt);
          break;
        }
        const files = currentDir.children
          .map((id) => {
            const item = fileSystem[id];
            if (!item) return "";
            return item.type === "folder"
              ? `\x1b[1;34m${item.name}/\x1b[0m`
              : item.name;
          })
          .filter(Boolean);

        setOutput((prev) => prev + files.join("  ") + prompt);
        break;

      case "cd":
        if (!args[1] || args[1] === "~") {
          setCurrentDirId("root");
          setOutput((prev) => prev + `\r\n\x1b[32m~\x1b[0m $ `);
        } else if (args[1] === "..") {
          if (currentDir.parentId) {
            setCurrentDirId(currentDir.parentId);
            // Calculate parent path for prompt
            // This is tricky because state update is async.
            // We roughly emulate it or just wait for next render?
            // For terminal we need immediate feedback.
            // Let's use a "nextId"
            const nextId = currentDir.parentId;
            setOutput(
              (prev) => prev + `\r\n\x1b[32m${getPathString(nextId)}\x1b[0m $ `
            );
          } else {
            setOutput((prev) => prev + prompt);
          }
        } else {
          const targetId = currentDir.children?.find(
            (id) => fileSystem[id]?.name === args[1]
          );
          const target = targetId ? fileSystem[targetId] : null;

          if (target && target.type === "folder") {
            setCurrentDirId(target.id);
            setOutput(
              (prev) =>
                prev + `\r\n\x1b[32m${getPathString(target.id)}\x1b[0m $ `
            );
          } else {
            setOutput(
              (prev) => prev + `cd: ${args[1]}: No such directory${prompt}`
            );
          }
        }
        break;

      case "touch":
        if (args[1]) {
          createFile(currentDirId, args[1], "file");
          setOutput((prev) => prev + prompt);
        } else {
          setOutput((prev) => prev + `usage: touch [file]${prompt}`);
        }
        break;

      case "mkdir":
        if (args[1]) {
          createFile(currentDirId, args[1], "folder");
          setOutput((prev) => prev + prompt);
        } else {
          setOutput((prev) => prev + `usage: mkdir [dir]${prompt}`);
        }
        break;

      case "rm":
        if (args[1]) {
          const targetId = currentDir.children?.find(
            (id) => fileSystem[id]?.name === args[1]
          );
          if (targetId) {
            deleteItem(targetId);
            setOutput((prev) => prev + prompt);
          } else {
            setOutput(
              (prev) =>
                prev + `rm: ${args[1]}: No such file or directory${prompt}`
            );
          }
        } else {
          setOutput((prev) => prev + `usage: rm [file]${prompt}`);
        }
        break;

      case "cat":
        if (args[1]) {
          const targetId = currentDir.children?.find(
            (id) => fileSystem[id]?.name === args[1]
          );
          const targetFile = targetId ? fileSystem[targetId] : null;

          if (targetFile && targetFile.type === "file") {
            setOutput((prev) => prev + (targetFile.content || "") + prompt);
          } else {
            setOutput(
              (prev) =>
                prev + `cat: ${args[1]}: No such file or directory${prompt}`
            );
          }
        } else {
          setOutput((prev) => prev + `usage: cat [file]${prompt}`);
        }
        break;

      case "pwd":
        setOutput((prev) => prev + getPathString(currentDirId) + prompt);
        break;

      case "clear":
        setOutput(prompt.trimStart()); // Remove leading newline for clear
        break;

      case "help":
        setOutput(
          (prev) =>
            prev +
            `Available commands: ls, cd, touch, mkdir, rm, cat, clear, pwd, python${prompt}`
        );
        break;

      case "python":
        setOutput((prev) => prev + "Starting Python REPL... (Mock)\r\n>>> ");
        break;

      default:
        setOutput(
          (prev) => prev + `bash: ${command}: command not found${prompt}`
        );
    }
  };

  const handleRunCode = async () => {
    try {
      if (selectedLanguage.id === "python") {
        if (!pyodide) {
          setOutput("Python runtime is still initializing. Please wait...\n");
          return;
        }

        if (isLoading) {
          setOutput("Please wait for Python runtime to finish loading...\n");
          return;
        }

        setOutput(
          `[${new Date().toLocaleTimeString()}] Running Python code...\n`
        );

        try {
          await pyodide.loadPackagesFromImports(code);
          const result = await pyodide.runPythonAsync(code);
          if (result !== undefined && result !== null) {
            setOutput((prev) => `${prev}${result}\n`);
          }
          setOutput(
            (prev) =>
              `${prev}[${new Date().toLocaleTimeString()}] Execution completed successfully.\n`
          );
        } catch (error: any) {
          setOutput((prev) => `${prev}Error: ${error.message}\n`);
        }
      } else if (selectedLanguage.id === "javascript") {
        const logs: string[] = [];
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;

        console.log = (...args) => {
          const formattedArgs = args
            .map((arg) =>
              typeof arg === "object"
                ? JSON.stringify(arg, null, 2)
                : String(arg)
            )
            .join(" ");
          logs.push(formattedArgs);
        };

        console.error = (...args) => {
          const formattedArgs = args
            .map((arg) =>
              typeof arg === "object"
                ? JSON.stringify(arg, null, 2)
                : String(arg)
            )
            .join(" ");
          logs.push(`Error: ${formattedArgs}`);
        };

        try {
          const executeCode = new Function(`
            return (async () => {
              ${code}
            })();
          `);

          await executeCode();

          if (logs.length > 0) {
            setOutput((prev) => `${prev}${logs.join("\n")}\n`);
          }

          setOutput(
            (prev) =>
              `${prev}\n[${new Date().toLocaleTimeString()}] Execution completed successfully.\n`
          );
        } catch (error: any) {
          setOutput((prev) => `${prev}Error: ${error.message}\n`);
        } finally {
          console.log = originalConsoleLog;
          console.error = originalConsoleError;
        }
      }
    } catch (error: any) {
      setOutput((prev) => `${prev}Error: ${error.message}\n`);
    }
  };

  const handleClearTerminal = () => {
    setOutput("");
  };

  const handleSaveCode = () => {
    try {
      const fileContent = code;
      const fileName = activeFile
        ? activeFile.name
        : `code.${selectedLanguage.extension}`;

      const blob = new Blob([fileContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setOutput(
        (prev) =>
          `${prev}[${new Date().toLocaleTimeString()}] Code saved as ${fileName}\n`
      );
    } catch (error: any) {
      setOutput((prev) => `${prev}Error saving code: ${error.message}\n`);
    }
  };

  const handleShareCode = () => {
    setOutput((prev) => prev + "Share functionality to be updated for VFS.\n");
  };

  const handleFileUpload = (content: string, language: Language) => {
    setCode(content);
    setSelectedLanguage(language);
    setOutput((prev) => `${prev}Success: File loaded into active editor.\n`);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-gray-300 overflow-hidden font-sans">
      <Header
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onRunCode={handleRunCode}
        onClearTerminal={handleClearTerminal}
        onSaveCode={handleSaveCode}
        onShareCode={handleShareCode}
        onFileUpload={handleFileUpload}
        isLoading={isLoading}
        activeFile={activeFile}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar (Far Left) */}
        <ActivityBar
          activeView={activeView}
          onViewChange={(view) => {
            if (view === activeView) {
              // Toggle visibility if clicking active view
              setIsSidebarOpen(!isSidebarOpen);
            } else {
              // Switch view and ensure open
              setActiveView(view);
              setIsSidebarOpen(true);
            }
          }}
        />

        {/* Sidebar (Explorer) */}
        {isSidebarOpen && activeView === "explorer" && isFolderOpen && (
          <FileExplorer />
        )}

        {/* Sidebar (Search) */}
        {isSidebarOpen && activeView === "search" && (
          <div className="h-full bg-black border-r border-[#1f1f1f] flex flex-col w-60 overflow-hidden text-[13px] pt-4 px-4 text-gray-400">
            <span className="uppercase text-xs font-bold mb-4">Search</span>
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#3c3c3c] text-white p-1 px-2 rounded border border-transparent focus:border-[#007acc] outline-none mb-2"
            />
            <p className="text-xs text-center mt-4">No results found.</p>
          </div>
        )}

        {/* Sidebar (Source Control) */}
        {isSidebarOpen && activeView === "git" && (
          <div className="h-full bg-black border-r border-[#1f1f1f] flex flex-col w-60 overflow-hidden text-[13px] pt-4 px-4 text-gray-400">
            <span className="uppercase text-xs font-bold mb-4">
              Source Control
            </span>
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-center mb-2">
                No underlying git repository found.
              </p>
              <button
                onClick={handleGitClone}
                className="bg-[#007acc] text-white px-3 py-1 rounded text-xs hover:bg-[#0062a3]"
              >
                Clone Repository
              </button>
            </div>
          </div>
        )}

        {/* Sidebar (Extensions) */}
        {isSidebarOpen && activeView === "extensions" && (
          <div className="h-full bg-black border-r border-[#1f1f1f] flex flex-col w-60 overflow-hidden text-[13px] pt-4 px-4 text-gray-400">
            <span className="uppercase text-xs font-bold mb-4">Extensions</span>
            <input
              type="text"
              placeholder="Search Extensions"
              className="w-full bg-[#3c3c3c] text-white p-1 px-2 rounded border border-transparent focus:border-[#007acc] outline-none mb-2"
            />
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2 p-1 hover:bg-[#2a2d2e] cursor-pointer">
                <div className="w-8 h-8 bg-blue-500/20 text-blue-400 flex items-center justify-center rounded">
                  PY
                </div>
                <div>
                  <div className="font-bold text-white">Python</div>
                  <div className="text-[10px]">Debugging, linting...</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar (Empty/Start State for Explorer) */}
        {isSidebarOpen && activeView === "explorer" && !isFolderOpen && (
          <div className="h-full bg-black border-r border-[#1f1f1f] flex flex-col w-60 overflow-hidden text-[13px] pt-2 px-4 text-gray-500">
            <span className="uppercase text-xs font-bold mb-4">Explorer</span>
            <div className="text-sm">
              <p className="mb-2">No Folder Opened</p>
              <p>You have not yet opened a folder.</p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          {/* If folder is NOT open, show Welcome Page full screen (minus header/activity bar) */}
          {!isFolderOpen ? (
            <WelcomePage
              onOpenFolder={handleOpenFolder}
              onCloneRepo={handleGitClone}
            />
          ) : (
            <>
              <TabBar />
              {!activeFileId ? (
                <div className="flex items-center justify-center h-full text-gray-500 bg-[#1f1f1f]">
                  {/* Empty Editor State (VS Code logo or shortcuts could go here) */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-32 h-32 bg-no-repeat bg-center opacity-10 mb-4"
                      style={{ backgroundImage: "url(/vscode.svg)" }}
                    ></div>
                    <p className="text-sm">Select a file to view or edit</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 overflow-hidden relative">
                  <div className="flex flex-col flex-1 h-full">
                    {/* Editor + Preview Split */}
                    <div className="flex-1 flex min-h-0">
                      <div className="flex-1 border-r border-border">
                        <EditorPane
                          language={selectedLanguage}
                          code={code}
                          filePath={
                            activeFile ? `src/${activeFile.name}` : undefined
                          }
                          onChange={handleCodeChange}
                          onCursorChange={handleCursorChange}
                        />
                      </div>
                      {/* Preview Pane */}
                      {["html", "javascript", "typescript"].includes(
                        selectedLanguage.id
                      ) && (
                        <div className="w-[40%] border-l border-border hidden md:block">
                          <PreviewPane
                            language={selectedLanguage}
                            code={code}
                          />
                        </div>
                      )}
                    </div>

                    {/* Terminal Pane (Bottom) */}
                    <div className="h-[30%] min-h-[150px] border-t border-border bg-black">
                      <TerminalPane
                        output={output}
                        onData={handleTerminalData}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* StatusBar */}
      <div className="h-6 bg-[#007acc] text-white text-xs flex items-center px-3 space-x-4 select-none">
        <div className="flex items-center space-x-1">
          <span>main*</span>
        </div>
        <div className="flex-1" />
        <div>
          Ln {cursorPos.ln}, Col {cursorPos.col}
        </div>
        <div>UTF-8</div>
        <div>{selectedLanguage.name}</div>
      </div>
    </div>
  );
}

export default Workspace;
