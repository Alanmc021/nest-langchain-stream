'use client';

import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import HardBreak from '@tiptap/extension-hard-break';

export default function StreamingEditor() {
  const [loading, setLoading] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Strike,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      Blockquote,
      CodeBlock,
      BulletList,
      OrderedList,
      ListItem,
      HardBreak,
    ],
    content: '<p>Inicie o streaming...</p>',
  });

  const fetchStreamingData = async () => {
    if (!editor) return;
    editor.commands.setContent('');
    setLoading(true);

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Mzg2ODA3NTYsImV4cCI6MTczOTk3Njc1Nn0.oDgaPSFoDW1R9eUYlcCGE_x3jwo1EZRFMF7RrJnd_cY");

    const raw = JSON.stringify({ prompt: 'crie uma peticao inicial formata em abnt pode usar um caso de pencao alimenticiam, deixe justificado' });

    try {
      const res = await fetch('http://localhost:8001/langchain/stream', {
        method: 'POST',
        headers: myHeaders,
        body: raw,
      });

      if (!res.body) {
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        editor.commands.insertContent(decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      editor.commands.setContent('<p>Erro ao buscar os dados</p>');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Editor de Streaming com TipTap</h1>
      <button
        onClick={fetchStreamingData}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
        disabled={loading}
      >
        {loading ? 'Carregando...' : 'Iniciar Streaming'}
      </button>
      <div className="flex gap-2 p-2 border-b border-gray-300 mt-4">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'bg-gray-300 px-2 py-1 rounded' : 'bg-white px-2 py-1 rounded'}><strong>B</strong></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'bg-gray-300 px-2 py-1 rounded' : 'bg-white px-2 py-1 rounded'}><em>I</em></button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor?.isActive('strike') ? 'bg-gray-300 px-2 py-1 rounded' : 'bg-white px-2 py-1 rounded'}><s>S</s></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor?.isActive('underline') ? 'bg-gray-300 px-2 py-1 rounded' : 'bg-white px-2 py-1 rounded'}>U</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor?.isActive('heading', { level: 1 }) ? 'bg-gray-300 px-2 py-1 rounded' : 'bg-white px-2 py-1 rounded'}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor?.isActive('heading', { level: 2 }) ? 'bg-gray-300 px-2 py-1 rounded' : 'bg-white px-2 py-1 rounded'}>H2</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor?.isActive('heading', { level: 3 }) ? 'bg-gray-300 px-2 py-1 rounded' : 'bg-white px-2 py-1 rounded'}>H3</button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor?.isActive('blockquote') ? 'bg-gray-300 px-2 py-1 rounded' : 'bg-white px-2 py-1 rounded'}>❝</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor?.isActive('bulletList') ? 'bg-gray-300 px-2 py-1 rounded' : 'bg-white px-2 py-1 rounded'}>• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor?.isActive('orderedList') ? 'bg-gray-300 px-2 py-1 rounded' : 'bg-white px-2 py-1 rounded'}>1. List</button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor?.isActive('codeBlock') ? 'bg-gray-300 px-2 py-1 rounded' : 'bg-white px-2 py-1 rounded'}>{'{ }'}</button>
      </div>
      <div className="mt-4 p-2 border border-gray-300 rounded-md">
        <EditorContent editor={editor} className="min-h-[200px]" />
      </div>
    </div>
  );
}

