import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Search, Calendar, Edit3, Eye, Download, Copy, Check, Tag } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

const CATEGORIES = ['Work', 'Personal', 'Ideas', 'Study', 'Other'];

export default function NotesVault() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('miles_lab_notes_vault');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((n: any) => ({ ...n, tags: n.tags || [] }));
    }
    return [];
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    const saved = localStorage.getItem('miles_lab_notes_vault');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed[0].id : null;
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [copied, setCopied] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    localStorage.setItem('miles_lab_notes_vault', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeId) || null;

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '# Untitled Note\n\nStart writing your thoughts here...',
      tags: [],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setNotes([newNote, ...notes]);
    setActiveId(newNote.id);
  };

  const updateActiveContent = (content: string) => {
    if (!activeId) return;
    const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
    const title = firstLine || 'Untitled Note';
    setNotes(notes.map(n =>
      n.id === activeId
        ? { ...n, content, title, updatedAt: new Date().toISOString().split('T')[0] }
        : n
    ));
  };

  const updateActiveTags = (tags: string[]) => {
    if (!activeId) return;
    setNotes(notes.map(n =>
      n.id === activeId ? { ...n, tags, updatedAt: new Date().toISOString().split('T')[0] } : n
    ));
  };

  const addTag = (tag: string) => {
    if (!activeNote) return;
    const t = tag.trim();
    if (!t || activeNote.tags.includes(t)) return;
    updateActiveTags([...activeNote.tags, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!activeNote) return;
    updateActiveTags(activeNote.tags.filter(t => t !== tag));
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this note?')) return;
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (activeId === id) {
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleCopy = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const filteredNotes = notes.filter(n => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some(t => t.toLowerCase().includes(q));
    const matchesTag = !activeTag || n.tags.includes(activeTag);
    return matchesQuery && matchesTag;
  });

  const renderMarkdown = (text: string) => {
    const html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-indigo-300 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-indigo-400 mt-5 mb-2 border-b border-slate-800 pb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-black text-white mt-2 mb-3 border-b border-slate-800 pb-2">$1</h1>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1 italic text-slate-400 my-3 bg-indigo-950/20 rounded-r-lg">$1</blockquote>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-800">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="list-disc ml-5 my-1 text-slate-300">$1</li>')
      .replace(/\n\n/g, '</p><p class="my-2 text-slate-300 leading-relaxed">');
    return `<div class="text-xs text-slate-300 leading-relaxed"><p class="my-2">${html}</p></div>`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 text-white flex flex-col h-[calc(100vh-80px)]">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-3 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" /> 10. Knowledge Base & Notes Workspace
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Create, tag, search, and export your markdown notes in a persistent vault.</p>
        </div>

        <button
          onClick={createNewNote}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-h-0">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col overflow-hidden md:col-span-1">
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 [&::-webkit-scrollbar]:hidden"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveTag(null)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${activeTag === null ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${activeTag === tag ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 [&::-webkit-scrollbar]:hidden">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs px-2">
                No notes found. Click "New Note" to start!
              </div>
            ) : (
              filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => setActiveId(note.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-start group ${
                    activeId === note.id
                      ? 'bg-indigo-950/40 border-indigo-900/60 text-white'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold truncate text-slate-200">{note.title}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {note.tags.map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-900/40">{t}</span>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {note.updatedAt}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteNote(note.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 rounded transition-all"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
          {activeNote ? (
            <>
              <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs gap-3">
                <span className="font-semibold text-slate-300 truncate">{activeNote.title}</span>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setViewMode('edit')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${viewMode === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${viewMode === 'split' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      Split
                    </button>
                    <button
                      onClick={() => setViewMode('preview')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    title="Copy note"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    title="Download .md file"
                  >
                    <Download className="w-3 h-3" /> Export
                  </button>
                </div>
              </div>

              <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                {activeNote.tags.map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-900/40 flex items-center gap-1">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-rose-400">×</button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-[10px] text-white focus:outline-none focus:border-indigo-500 w-24"
                />
                <div className="flex gap-1 flex-wrap">
                  {CATEGORIES.filter(c => !activeNote.tags.includes(c)).map(c => (
                    <button
                      key={c}
                      onClick={() => addTag(c)}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-500 hover:text-slate-200"
                    >
                      +{c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0">
                <div className={`flex flex-col h-full ${viewMode === 'preview' ? 'hidden' : viewMode === 'edit' ? 'col-span-2' : ''}`}>
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => updateActiveContent(e.target.value)}
                    placeholder="Write your note in markdown..."
                    className="w-full h-full bg-transparent p-4 text-xs font-mono text-slate-200 focus:outline-none resize-none leading-relaxed [&::-webkit-scrollbar]:hidden"
                    spellCheck="false"
                  />
                </div>

                <div className={`flex flex-col h-full bg-slate-950/40 p-5 overflow-y-auto border-l border-slate-800 [&::-webkit-scrollbar]:hidden ${viewMode === 'edit' ? 'hidden' : viewMode === 'preview' ? 'col-span-2 border-l-0' : ''}`}>
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(activeNote.content) }} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs p-8 text-center">
              <FileText className="w-10 h-10 text-slate-700 mb-3" />
              <p className="font-semibold text-slate-400">No note selected</p>
              <p className="mt-1">Click "New Note" above to create your first document in the vault.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
