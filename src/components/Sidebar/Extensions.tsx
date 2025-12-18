import React, { useState } from "react";
import { Filter, Download } from "lucide-react";

interface Extension {
  id: string;
  name: string;
  description: string;
  publisher: string;
  version: string;
  downloads: string;
  installed: boolean;
}

const EXTENSIONS_DATA: Extension[] = [
  {
    id: "prettier",
    name: "Prettier - Code Formatter",
    description: "Code formatter using prettier",
    publisher: "esbenp",
    version: "9.10.3",
    downloads: "28M",
    installed: true,
  },
  {
    id: "python",
    name: "Python",
    description: "IntelliSense, linting, debugging for Python.",
    publisher: "ms-python",
    version: "2023.14.0",
    downloads: "74M",
    installed: true,
  },
  {
    id: "vim",
    name: "Vim",
    description: "Vim emulation for VS Code",
    publisher: "vscodevim",
    version: "1.24.3",
    downloads: "4.5M",
    installed: false,
  },
  {
    id: "eslint",
    name: "ESLint",
    description: "Integrates ESLint JavaScript into VS Code.",
    publisher: "dbaeumer",
    version: "2.4.0",
    downloads: "22M",
    installed: true,
  },
  {
    id: "gitlens",
    name: "GitLens",
    description: "Supercharge Git within VS Code",
    publisher: "gitkraken",
    version: "13.2.0",
    downloads: "19M",
    installed: false,
  },
];

const Extensions = () => {
  const [query, setQuery] = useState("");

  const filteredExtensions = EXTENSIONS_DATA.filter(
    (ext) =>
      ext.name.toLowerCase().includes(query.toLowerCase()) ||
      ext.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#252526] text-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
            Extensions
          </span>
          <Filter className="h-3 w-3 text-gray-500 cursor-pointer hover:text-white" />
        </div>
        <input
          type="text"
          className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007acc] text-sm px-2 py-1 rounded outline-none placeholder-gray-500 text-white"
          placeholder="Search Extensions in Marketplace"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredExtensions.map((ext) => (
          <div
            key={ext.id}
            className="flex items-start p-2 rounded hover:bg-[#2a2d2e] cursor-pointer mb-1 group"
          >
            <div className="h-8 w-8 bg-[#3d3d3d] rounded mr-3 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gray-400">
                {ext.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-white">
                  {ext.name}
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 truncate mb-1">
                {ext.description}
              </p>
              <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                <span>{ext.publisher}</span>
                <span className="flex items-center">
                  <Download className="h-2.5 w-2.5 mr-0.5" />
                  {ext.downloads}
                </span>
                {ext.installed && (
                  <span className="bg-[#2d2d2d] text-gray-400 px-1 rounded ml-auto">
                    Installed
                  </span>
                )}
              </div>
            </div>
            {!ext.installed && (
              <button className="hidden group-hover:block bg-[#0e639c] text-white text-[10px] px-2 py-0.5 rounded shadow-sm hover:bg-[#1177bb] mt-1 ml-2">
                Install
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Extensions;
