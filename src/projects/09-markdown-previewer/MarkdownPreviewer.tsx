import { useState, useEffect } from 'react';
import { FileText, Copy, Trash2, Check, Eye, Edit3, Download } from 'lucide-react';

const INITIAL_MARKDOWN = `# Welcome to Miles Lab Markdown Previewer! ✨

Easily draft notes, documentation, or README files with real-time HTML rendering.

## Features Included:
- **Real-time split pane** layout (Editor & Live Preview)
- **Persistent local storage** so your notes stay safe
- **Quick actions** to copy, clear, or download

### Code Example
\`\`\`javascript
const greeting = "Hello, Miles Lab!";
console.log(greeting);
\`\`\`

### Quick Checklist
- [x] Build Project 07 (Pomodoro)
- [x] Build Project 08 (Expense Tracker)
- [ ] Build Project 09 (Markdown Previewer)

> "Simplicity is the soul of efficiency." — Austin Freeman
`;

export default function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState<string>(() => {
    const saved = localStorage.getItem('miles_lab_markdown');
    return saved !== null ? saved : INITIAL_MARKDOWN;
  });

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'split' | 'edit' | 'preview'>('split');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('miles_lab_markdown', markdown);
  }, [markdown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your document?')) {
      setMarkdown('');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'miles-lab-document.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple and clean custom markdown to HTML converter for rendering
  const renderMarkdown = (text: string) => {
    const html = text
      // Escape HTML tags for safety
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-indigo-300 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-indigo-400 mt-5 mb-2 border-b border-slate-800 pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-black text-white mt-2 mb-3 border-b border-slate-800 pb-2">$1</h1>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1 italic text-slate-400 my-3 bg-indigo-950/20 rounded-r-lg">$1</blockquote>')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
      // Inline Code
      .replace(/`([^`]+)`/g, '<code class="bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-800">$1</code>')
      // Unordered Lists & Checkboxes
      .replace(/^- [x] (.*$)/gim, '<li class="flex items-center gap-2 my-1 text-slate-300"><span class="text-emerald-400 font-bold">✓</span> <span class="line-through text-slate-500">$1</span></li>')
      .replace(/^- [ ] (.*$)/gim, '<li class="flex items-center gap-2 my-1 text-slate-300"><span class="text-slate-600">○</span> <span>$1</span></li>')
      .replace(/^- (.*$)/gim, '<li class="list-disc ml-5 my-1 text-slate-300">$1</li>')
      // Code blocks (simple representation)
      .replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="bg-slate-950 p-3 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto my-3 border border-slate-800"><code>$2</code></pre>')
      // Paragraphs (double line breaks)
      .replace(/\n\n/g, '</p><p class="my-2 text-slate-300 leading-relaxed">');

    return `<div class="text-xs text-slate-300 leading-relaxed"><p class="my-2">${html}</p></div>`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 text-white flex flex-col h-[calc(100vh-80px)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-3 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" /> 09. Markdown Live Previewer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Write Markdown syntax on the left and see it instantly rendered on the right.</p>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile view tabs */}
          <div className="flex md:hidden bg-slate-900 p-1 rounded-xl border border-slate-800 mr-2">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${activeTab === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleDownload}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download .md file"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          <button
            onClick={handleClear}
            className="bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Clear document"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Main Split Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        
        {/* Editor Pane */}
        <div className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-slate-950/60 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Markdown Editor</span>
            <span className="font-mono lowercase text-[10px] text-slate-500">{markdown.length} chars</span>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type your markdown here..."
            className="w-full flex-1 bg-transparent p-4 text-xs font-mono text-slate-200 focus:outline-none resize-none leading-relaxed"
            spellCheck="false"
          />
        </div>

        {/* Live Preview Pane */}
        <div className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-slate-950/60 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-emerald-400" /> Live HTML Preview</span>
            <span className="font-mono lowercase text-[10px] text-emerald-400/80">rendered live</span>
          </div>
          <div 
            className="w-full flex-1 bg-slate-950/40 p-5 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
          />
        </div>

      </div>

    </div>
  );
}