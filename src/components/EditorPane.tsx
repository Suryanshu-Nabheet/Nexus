import React, { useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Language } from "../utils/languages";
import { useTheme } from "../contexts/ThemeContext";
import { useEditor } from "../contexts/EditorContext";
import { motion } from "framer-motion";
import * as monaco from "monaco-editor";
import { ChevronRight } from "lucide-react";

interface EditorPaneProps {
  language: Language;
  code: string;
  filePath?: string;
  onChange: (value: string) => void;
  onCursorChange?: (ln: number, col: number) => void;
}

const EditorPane: React.FC<EditorPaneProps> = ({
  language,
  code,
  filePath = "src/main", // Default fallback
  onChange,
  onCursorChange,
}) => {
  const { theme } = useTheme();
  const { setEditorInstance } = useEditor();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    setEditorInstance(editor);

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange(e.position.lineNumber, e.position.column);
      }
    });

    // Disable zoom
    editor.onKeyDown((e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.code === "Equal" || e.code === "Minus")
      ) {
        e.preventDefault();
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Parse file path for breadcrumbs
  const pathParts = filePath.split("/");
  const fileName = pathParts.pop();
  const directories = pathParts;

  return (
    <motion.div
      className="h-full flex flex-col transition-colors duration-300"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div
        className={`h-[22px] flex items-center px-4 border-b border-[#1f1f1f] bg-black select-none ${
          theme === "dark" ? "text-gray-500" : "text-gray-500"
        }`}
      >
        <div className="flex items-center text-[11px] space-x-1">
          {directories.map((dir, i) => (
            <React.Fragment key={i}>
              <span>{dir}</span>
              <ChevronRight className="h-3 w-3 opacity-50" />
            </React.Fragment>
          ))}
          <div className="flex items-center text-gray-200">
            <span className="mr-1" style={{ color: language.color }}>
              {language.icon || "📄"}
            </span>
            <span>{fileName}</span>
          </div>
        </div>
      </div>
      <motion.div
        className="flex-1 overflow-hidden transition-colors duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Editor
          height="100%"
          language={language.monacoLanguage || language.id}
          value={code}
          onChange={(value) => onChange(value || "")}
          theme={theme === "dark" ? "vs-dark" : "light"}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "JetBrains Mono, Menlo, Monaco, Courier New, monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            padding: { top: 10 },
            lineNumbers: "on",
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            mouseWheelZoom: false,
          }}
          onMount={handleEditorDidMount}
        />
      </motion.div>
    </motion.div>
  );
};

export default EditorPane;
