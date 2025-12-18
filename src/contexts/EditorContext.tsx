import React, { createContext, useContext, useState } from 'react';

interface EditorContextType {
  editorInstance: any; // Monaco editor instance
  setEditorInstance: (editor: any) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [editorInstance, setEditorInstance] = useState<any>(null);

  return (
    <EditorContext.Provider value={{ editorInstance, setEditorInstance }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};