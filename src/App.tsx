import React from "react";
import Workspace from "./components/Workspace";
import { ThemeProvider } from "./contexts/ThemeContext";
import { EditorProvider } from "./contexts/EditorContext";
import { FileSystemProvider } from "./contexts/FileSystemContext";

function App() {
  return (
    <ThemeProvider>
      <EditorProvider>
        <FileSystemProvider>
          <Workspace />
        </FileSystemProvider>
      </EditorProvider>
    </ThemeProvider>
  );
}

export default App;
