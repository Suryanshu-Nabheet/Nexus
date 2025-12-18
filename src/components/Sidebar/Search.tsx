import React, { useState } from "react";
import { Search as SearchIcon, File } from "lucide-react";
import { useFileSystem } from "../../contexts/FileSystemContext";

const Search = () => {
  const [query, setQuery] = useState("");
  const { fileSystem, setActiveFile } = useFileSystem();

  const results = Object.values(fileSystem).filter((item) => {
    if (!query) return false;
    if (item.type !== "file") return false;
    // Search in name or content
    return (
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(query.toLowerCase()))
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#252526] text-white">
      <div className="p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-4">
          Search
        </span>
        <div className="relative">
          <input
            type="text"
            className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007acc] text-sm px-2 py-1 pl-7 rounded outline-none placeholder-gray-500 text-white"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SearchIcon className="absolute left-2 top-1.5 h-3.5 w-3.5 text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {query && (
          <div className="text-xs text-gray-400 mb-2 px-2">
            {results.length} results found
          </div>
        )}
        <div className="space-y-1">
          {results.map((item) => (
            <div
              key={item.id}
              className="flex items-center p-1 rounded hover:bg-[#2a2d2e] cursor-pointer group"
              onClick={() => setActiveFile(item.id)}
            >
              <File className="h-3.5 w-3.5 text-gray-500 mr-2 flex-shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm text-gray-300 truncate group-hover:text-white">
                  {item.name}
                </span>
                <span className="text-[10px] text-gray-500 truncate">
                  {/* Basic snippet: showing first match line simplified */}
                  {item.content?.substring(0, 40).replace(/\n/g, " ")}...
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
