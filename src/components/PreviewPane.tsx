import React, { useMemo } from "react";
import { Eye, RefreshCw, ExternalLink } from "lucide-react";
import { Language } from "../utils/languages";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

interface PreviewPaneProps {
  language: Language;
  code: string;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ language, code }) => {
  const canPreview = language.id === "html" || language.id === "javascript";
  const { theme } = useTheme();

  const htmlPreview = useMemo(() => {
    if (!canPreview) return null;

    if (language.id === "html") {
      return code;
    } else if (language.id === "javascript") {
      return `
        <html>
          <head>
            <style>
              body {
                font-family: system-ui, sans-serif;
                padding: 20px;
                margin: 0;
                color: ${theme === "dark" ? "#e5e5e5" : "#1a1a1a"};
                background: ${theme === "dark" ? "#1a1a1a" : "#ffffff"};
                transition: color 0.3s ease, background-color 0.3s ease;
              }
              #output {
                border: 1px solid ${theme === "dark" ? "#333" : "#ccc"};
                padding: 10px;
                border-radius: 4px;
                background: ${theme === "dark" ? "#2a2a2a" : "#f5f5f5"};
                color: ${theme === "dark" ? "#e5e5e5" : "#1a1a1a"};
                transition: all 0.3s ease;
              }
            </style>
          </head>
          <body>
            <div id="output"></div>
            <script>
              const outputEl = document.getElementById('output');
              const log = console.log;
              console.log = function(...args) {
                log.apply(console, args);
                const text = args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
                ).join(' ');
                const p = document.createElement('p');
                p.style.margin = '5px 0';
                p.textContent = text;
                outputEl.appendChild(p);
              };
              
              try {
                (async function() {
                  ${code}
                })();
              } catch (error) {
                console.log('Error: ' + error.message);
              }
            </script>
          </body>
        </html>
      `;
    }

    return null;
  }, [language, code, theme]);

  const [key, setKey] = React.useState(0);
  const refreshPreview = () => setKey((prev) => prev + 1);

  const openInNewTab = () => {
    if (!htmlPreview) return;

    const blob = new Blob([htmlPreview], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, "_blank");

    if (newWindow) {
      newWindow.document.title = `Nexus - ${language.name} Preview`;
    }

    setTimeout(() => URL.revokeObjectURL(url), 1000);
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

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="h-full flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={`p-2 border-b text-sm flex justify-between items-center shadow-md relative z-10
          ${
            theme === "dark"
              ? "bg-gray-900/80 backdrop-blur-md border-gray-700/50 text-gray-300"
              : "bg-white/80 backdrop-blur-md border-gray-200/50 text-gray-700"
          }`}
        variants={headerVariants}
      >
        <motion.div
          className="flex items-center"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Eye className="h-4 w-4 mr-2 text-blue-400" />
          <span className="font-medium">Preview</span>
        </motion.div>
        <div className="flex items-center space-x-2">
          {canPreview && (
            <>
              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={refreshPreview}
                className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 text-white"
                title="Refresh Preview"
              >
                <RefreshCw className="h-4 w-4" />
              </motion.button>
              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={openInNewTab}
                className="p-1.5 rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white transition-all duration-300 flex items-center space-x-1 shadow-md"
                title="Open in New Tab"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm">Open Preview</span>
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
      <motion.div
        className="flex-1 bg-white dark:bg-gray-950 overflow-auto transition-colors duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {canPreview ? (
            <motion.iframe
              key={key}
              title="Preview"
              srcDoc={htmlPreview || ""}
              className="w-full h-full border-none"
              sandbox="allow-scripts"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.div
              className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center p-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Eye className="h-6 w-6 mx-auto mb-2 opacity-50" />
                </motion.div>
                <p>Preview not available for {language.name}</p>
                <p className="text-sm mt-1">
                  Only HTML and JavaScript have preview support
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default PreviewPane;
