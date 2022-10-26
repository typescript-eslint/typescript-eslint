import React from 'react';

export const editorEmbedId = 'monaco-editor-embed';

export const EditorEmbed: React.FC = () => (
  <div id={editorEmbedId} style={{ height: '100%' }} />
);
