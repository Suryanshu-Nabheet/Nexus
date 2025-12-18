import React from "react";
import { FilePlus, FolderPlus, Command, Github } from "lucide-react";
import { motion } from "framer-motion";
import { useFileSystem } from "../contexts/FileSystemContext";

interface WelcomePageProps {
  onOpenFolder: () => void;
  onCloneRepo: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({
  onOpenFolder,
  onCloneRepo,
}) => {
  const { createFile } = useFileSystem();

  const handleNewFile = () => {
    const name = prompt("Enter file name:");
    if (name) createFile("root", name, "file");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="h-full w-full bg-background flex flex-col items-center justify-center text-gray-400 p-8 select-none">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full"
      >
        <motion.div variants={itemVariants} className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-200 mb-4 tracking-tight">
            Nexus
          </h1>
          <p className="text-lg text-gray-500">
            Professional editing, redefined.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Start
            </h2>

            <button
              onClick={handleNewFile}
              className="group flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-white/5 transition-colors"
            >
              <FilePlus className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
              <span className="text-blue-400 group-hover:text-blue-300">
                New File
              </span>
            </button>

            <button
              onClick={onOpenFolder}
              className="group flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-white/5 transition-colors"
            >
              <FolderPlus className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
              <span className="text-blue-400 group-hover:text-blue-300">
                Open Folder...
              </span>
            </button>

            <button
              onClick={onCloneRepo}
              className="group flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-white/5 transition-colors"
            >
              <Github className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
              <span className="text-blue-400 group-hover:text-blue-300">
                Clone Repository...
              </span>
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Recent
            </h2>
            <div className="text-sm text-gray-600 italic">No recent files</div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-16 pt-8 border-t border-white/5 grid grid-cols-2 gap-8 text-xs text-gray-500"
        >
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Command className="h-4 w-4" />
              <span>Show All Commands</span>
            </div>
            <p>
              Use <kbd className="bg-white/10 px-1 rounded">Cmd+Shift+P</kbd> to
              access all commands.
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="h-4 w-4" />{" "}
              {/* Settings icon reused from lucide if imported, else generic */}
              <span>Customize</span>
            </div>
            <p>Manage themes, shortcuts, and extensions.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Quick fix for missing Settings icon in imports above if not caught
import { Settings } from "lucide-react";

export default WelcomePage;
