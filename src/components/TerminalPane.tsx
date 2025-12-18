import React, { useEffect, useState, useRef } from "react";
import { Terminal as TerminalIcon, Loader2 } from "lucide-react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import "xterm/css/xterm.css";

interface TerminalPaneProps {
  output: string;
  isLoading?: boolean;
  onData?: (data: string) => void;
}

const TerminalPane: React.FC<TerminalPaneProps> = ({
  output,
  isLoading = false,
  onData,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const lastOutputRef = useRef<string>("");
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);
  const { theme } = useTheme();

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new Terminal({
      theme: {
        background: theme === "dark" ? "#1a1b26" : "#ffffff",
        foreground: theme === "dark" ? "#a9b1d6" : "#1a1a1a",
        cursor: theme === "dark" ? "#c0caf5" : "#1a1a1a",
        black: theme === "dark" ? "#24283b" : "#000000",
        red: "#ff0000",
        green: "#00ff00",
        blue: "#0000ff",
        yellow: theme === "dark" ? "#e0af68" : "#ffa500",
        magenta: theme === "dark" ? "#bb9af7" : "#ff00ff",
        cyan: theme === "dark" ? "#7dcfff" : "#00ffff",
        white: theme === "dark" ? "#c0caf5" : "#ffffff",
        brightBlack: theme === "dark" ? "#414868" : "#666666",
        brightRed: "#ff0000",
        brightGreen: "#00ff00",
        brightBlue: "#0000ff",
        brightYellow: theme === "dark" ? "#e0af68" : "#ffa500",
        brightMagenta: theme === "dark" ? "#bb9af7" : "#ff00ff",
        brightCyan: theme === "dark" ? "#7dcfff" : "#00ffff",
        brightWhite: theme === "dark" ? "#c0caf5" : "#ffffff",
      },
      fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      convertEol: true,
      rows: 20,
      cols: 80,
      scrollback: 1000,
      tabStopWidth: 4,
      windowsMode: false,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    // Configure terminal container
    if (terminalRef.current) {
      terminalRef.current.style.display = "block";
      terminalRef.current.style.height = "100%";
      terminalRef.current.style.width = "100%";
      terminalRef.current.style.padding = "8px";
    }

    // Open terminal in container
    term.open(terminalRef.current!);

    // Initial setup
    requestAnimationFrame(() => {
      fitAddon.fit();
      term.write("\x1b[2J\x1b[H"); // Clear screen
      term.write("\x1b[1;1H"); // Move cursor to top
      term.write("\x1b[38;2;180;180;180m$ \x1b[0m"); // Gray prompt
      setIsTerminalVisible(true);
    });

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Handle user input
    term.onData((data) => {
      if (onData) {
        onData(data);
      }
    });

    // Handle window resize
    const handleResize = () => {
      requestAnimationFrame(() => {
        fitAddon.fit();
      });
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
      xtermRef.current = null;
    };
  }, [theme]);

  // Handle output changes
  useEffect(() => {
    if (!xtermRef.current || !output) return;

    const term = xtermRef.current;

    // Only write new output if it's different (or just append it)
    // For this refactor, we are going to write directly what is passed
    // But since 'output' state in App.tsx might be the full log, we need to be careful.
    // However, the previous implementation cleared the screen every time:
    // term.write('\x1b[2J\x1b[H\x1b[1;1H');
    // We should change App.tsx to stream chunks, OR keep this clear-and-redraw behavior for now but improve it.
    // For interactive terminal, clear-and-redraw is bad because it wipes user input.
    // Let's assume App.tsx will be updated to append commands, or we just handle the "latest" chunk?
    // Actually, looking at App.tsx, 'setOutput' appends: setOutput(prev => prev + text).
    // So 'output' grows indefinitely.
    // If we re-write the WHOLE output every time, the terminal flashes.
    // We need to diff or only write new parts.

    // BETTER APPROACH: App.tsx shouldn't pass full history. It should pass "new data".
    // But since we are constrained to 'output' string prop for now, let's stick to the previous behavior
    // BUT wrap it to prevent processing if it hasn't changed.

    if (output === lastOutputRef.current) return;

    // Calculate the new part
    const newPart = output.slice(lastOutputRef.current.length);
    lastOutputRef.current = output;

    // If we cleared the terminal (empty output), reset
    if (output === "") {
      term.write("\x1b[2J\x1b[H");
      return;
    }

    // Process and write ONLY the new part
    // We need to process colors like before
    const lines = newPart.split("\n");
    lines.forEach((line, i) => {
      // Write raw line (xterm handles ANSI codes from Workspace)
      term.write(line + (i < lines.length - 1 ? "\r\n" : ""));
    });

    // Scroll to bottom
    if (fitAddonRef.current) {
      fitAddonRef.current.fit();
    }
  }, [output]);

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

  const headerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="h-full flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div
        className={`flex items-center px-4 border-b border-[#2b2b2b] bg-[#18181b] z-10 select-none ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {["PROBLEMS", "OUTPUT", "TERMINAL", "DEBUG CONSOLE"].map((tab) => (
          <div
            key={tab}
            className={`mr-6 py-2 text-[11px] cursor-pointer hover:text-white transition-colors relative ${
              tab === "TERMINAL" ? "text-white font-medium" : ""
            }`}
          >
            {tab}
            {tab === "TERMINAL" && (
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white" />
            )}
          </div>
        ))}
        <div className="flex-1" />
        <div className="flex items-center space-x-3 py-2">
          <div className="flex items-center space-x-1">
            <span className="h-3 w-3 rounded-full border border-gray-500 flex items-center justify-center text-[8px]">
              +
            </span>
            <span className="text-[11px]">bash</span>
          </div>
          <Loader2
            className={`h-3 w-3 animate-spin ${
              isLoading ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
      <motion.div
        className="flex-1 overflow-hidden relative transition-colors duration-300"
        style={{ backgroundColor: theme === "dark" ? "#1a1b26" : "#ffffff" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isTerminalVisible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div ref={terminalRef} className="absolute inset-0" />
      </motion.div>
    </motion.div>
  );
};

export default TerminalPane;
