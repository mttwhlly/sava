'use client';

import { useState } from 'react';
import { formatEntryAsMarkdown } from '@/utils/format-entry-markdown';

export default function Home() {
  const [rawText, setRawText] = useState('');
  const [structured, setStructured] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    const res = await fetch('/api/structure-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry: rawText }),
    });
    const data = await res.json();
    setStructured(data);
    setLoading(false);
  }

  const handleUploadToDrive = async () => {
    const markdown = formatEntryAsMarkdown(structured);
    console.log('Structured entry:', structured);

    const fileName = (structured?.title ?? 'Untitled').replace(/\s+/g, '-');

    const res = await fetch('/api/upload-to-drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: markdown, fileName }),
    });

    const data = await res.json();
    if (res.ok) alert('Uploaded to Drive!');
    else alert('Upload failed: ' + data.error);
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold font-mono">This is fine. 🔥</h1>
      </div>
      <textarea
        className="w-full h-40 p-4 border rounded mb-4 font-mono"
        placeholder="What happened today?"
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      />
      <button
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 border border-white cursor-pointer"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Structure with AI'}
      </button>
      {structured && (
        <button
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleUploadToDrive}
        >
          Upload to Google Drive
        </button>
      )}
    </main>
  );
}
