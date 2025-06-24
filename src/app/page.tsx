'use client';

import { useState } from 'react';

interface StructuredEntry {
  date?: string;
  title?: string;
  summary?: string;
  tags?: string[];
  people?: string[];
  [key: string]: unknown;
}

export default function Home() {
  const [rawText, setRawText] = useState('');
  const [structured, setStructured] = useState<StructuredEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // Add upload state

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch('/api/structure-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry: rawText }),
      });

      if (!res.ok) {
        throw new Error('Failed to structure entry');
      }

      const data = await res.json();
      setStructured(data);
    } catch (error) {
      console.error('Structure failed:', error);
      alert('Failed to structure entry. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleUploadToDrive = async (entryData: StructuredEntry) => {
    setUploading(true);
    try {
      const response = await fetch('/api/upload-to-drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: JSON.stringify(entryData, null, 2),
          fileName: `entry_${new Date().toISOString().split('T')[0]}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(
          `API request failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      alert('Successfully uploaded to Google Drive!'); // Success feedback
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please check the console for details.');
    } finally {
      setUploading(false);
    }
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
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 border border-white cursor-pointer disabled:opacity-50"
        onClick={handleSubmit}
        disabled={loading || !rawText.trim()}
      >
        {loading ? 'Processing...' : 'Structure with AI'}
      </button>

      {structured && (
        <div className="mt-4">
          <button
            className="bg-white text-black px-4 py-2 rounded hover:bg-white-800 disabled:opacity-50 cursor-pointer"
            onClick={() => handleUploadToDrive(structured)}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload to Google Drive'}
          </button>

          {/* Optional: Show structured data preview */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600">
              Preview structured data
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto text-gray-600 font-mono">
              {JSON.stringify(structured, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </main>
  );
}
