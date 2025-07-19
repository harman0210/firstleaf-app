'use client';
import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export type RichTextEditorHandle = { getContent: () => string };

const RichTextEditor = forwardRef<RichTextEditorHandle>((_, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<Quill | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        // toolbar options...
      });
    }
    return () => { quillInstance.current = null; };
  }, []);

  useImperativeHandle(ref, () => ({
    getContent: () => quillInstance.current?.root.innerHTML || '',
  }));

  return <div ref={editorRef} style={{ height: 300 }} />;
});

RichTextEditor.displayName = 'RichTextEditor';
export default RichTextEditor;
