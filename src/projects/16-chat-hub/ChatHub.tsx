import React, { useState, useEffect, useRef } from 'react';
import { Check, Pencil, RotateCw, Smile, Trash2, X } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: string;
  createdAt?: number;
  edited?: boolean;
  reactions?: string[];
  deliveryStatus?: 'sent' | 'delivered' | 'read';
}

interface Contact {
  id: string;
  name: string;
  role: string;
  status: 'offline' | 'online' | 'opened'; // red, yellow, green mapping
  avatar: string;
  lastSeen?: string;
}

export default function ChatHub() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Alex Vance', role: 'Lead Architect', status: 'opened', avatar: 'AV' },
    { id: '2', name: 'Sarah Connor', role: 'DevOps Engineer', status: 'online', avatar: 'SC' },
    { id: '3', name: 'Marcus Brody', role: 'UI/UX Designer', status: 'offline', avatar: 'MB', lastSeen: '2 hours ago' },
  ]);

  const [activeContactId, setActiveContactId] = useState<string>('1');
  const activeContactIdRef = useRef(activeContactId);
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('miles_lab_chat_messages');
    return saved ? JSON.parse(saved) : {
      '1': [
        { id: 'm1', sender: 'contact', text: 'Hey Miles! Ready for the milestone push?', timestamp: '10:00 AM' },
        { id: 'm2', sender: 'user', text: 'Always ready. All 15 projects are locked in.', timestamp: '10:02 AM' },
        { id: 'm3', sender: 'contact', text: 'Awesome. Let me know when you inspect the repository.', timestamp: '10:05 AM' },
      ],
      '2': [
        { id: 'm4', sender: 'contact', text: 'Pipelines are running smoothly.', timestamp: 'Yesterday' }
      ],
      '3': [
        { id: 'm5', sender: 'contact', text: 'Checked out the color palettes. Looking sharp.', timestamp: '2 days ago' }
      ]
    };
  });

  const [inputText, setInputText] = useState('');
  const [typingContactId, setTypingContactId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [reactionPickerId, setReactionPickerId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Persist messages
  useEffect(() => {
    localStorage.setItem('miles_lab_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now());
    updateCurrentTime();
    const intervalId = window.setInterval(updateCurrentTime, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];
  const activeMessages = messages[activeContactId] || [];
  const isWithinEditWindow = (message: Message, now: number) =>
    message.sender === 'user' &&
    typeof message.createdAt === 'number' &&
    now - message.createdAt >= 0 &&
    now - message.createdAt < 15 * 60 * 1000;

  // Handle selecting a contact (and simulating status change to green/opened)
  const handleSelectContact = (id: string) => {
    activeContactIdRef.current = id;
    setActiveContactId(id);
    setUnreadCounts(prev => ({ ...prev, [id]: 0 }));
    setContacts(contacts.map(c => c.id === id ? { ...c, status: 'opened' } : c));
    setMessages(prev => ({
      ...prev,
      [id]: (prev[id] || []).map(message => message.sender === 'user'
        ? { ...message, deliveryStatus: 'read' }
        : message
      )
    }));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const createdAt = Date.now();
    const newMsg: Message = {
      id: createdAt.toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt,
      deliveryStatus: 'sent'
    };

    setMessages({
      ...messages,
      [activeContactId]: [...activeMessages, newMsg]
    });

    setInputText('');
    const replyContactId = activeContactId;
    setTypingContactId(replyContactId);

    // Let the typing indicator appear before the simulated reply arrives.
    setTimeout(() => {
      const reply: Message = {
        id: `${Date.now()}-reply`,
        sender: 'contact',
        text: 'Got it. I will take a look and get back to you shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now()
      };

      setTypingContactId(current => current === replyContactId ? null : current);
      setContacts(prev => prev.map(c => c.id === replyContactId ? { ...c, status: 'online' } : c));
      setMessages(prev => ({
        ...prev,
        [replyContactId]: (prev[replyContactId] || []).map(message => message.id === newMsg.id
          ? { ...message, deliveryStatus: 'delivered' as const }
          : message
        ).concat(reply)
      }));
      setUnreadCounts(prev => replyContactId === activeContactIdRef.current
        ? prev
        : { ...prev, [replyContactId]: (prev[replyContactId] || 0) + 1 }
      );

      setTimeout(() => {
        setContacts(prev => prev.map(c => c.id === replyContactId ? { ...c, status: 'opened' } : c));
        setMessages(prev => ({
          ...prev,
          [replyContactId]: (prev[replyContactId] || []).map(message => message.id === newMsg.id
            ? { ...message, deliveryStatus: 'read' }
            : message
          )
        }));
      }, 2000);
    }, 1800);
  };

  const handleClearConversation = () => {
    setMessages(prev => ({ ...prev, [activeContactId]: [] }));
    setUnreadCounts(prev => ({ ...prev, [activeContactId]: 0 }));
    if (typingContactId === activeContactId) setTypingContactId(null);
  };

  const handleCycleStatus = () => {
    const nextStatus: Record<Contact['status'], Contact['status']> = {
      offline: 'online',
      online: 'opened',
      opened: 'offline'
    };
    setContacts(prev => prev.map(contact => contact.id === activeContactId
      ? { ...contact, status: nextStatus[contact.status] }
      : contact
    ));
    const deliveryStatus: Record<Contact['status'], NonNullable<Message['deliveryStatus']>> = {
      offline: 'sent',
      online: 'delivered',
      opened: 'read'
    };
    setMessages(prev => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).map(message => message.sender === 'user'
        ? { ...message, deliveryStatus: deliveryStatus[nextStatus[activeContact.status]] }
        : message
      )
    }));
  };

  const handleStartEditing = (message: Message) => {
    if (!isWithinEditWindow(message, Date.now())) return;
    setEditingMessageId(message.id);
    setEditingText(message.text);
    setReactionPickerId(null);
  };

  const handleSaveEdit = (event: React.FormEvent<HTMLFormElement>, messageId: string, now: number) => {
    event.preventDefault();
    const text = editingText.trim();
    const message = (messages[activeContactId] || []).find(item => item.id === messageId);
    if (!text || !message || !isWithinEditWindow(message, now)) {
      setEditingMessageId(null);
      setEditingText('');
      return;
    }

    setMessages(prev => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).map(message =>
        message.id === messageId ? { ...message, text, edited: true } : message
      )
    }));
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).filter(message => message.id !== messageId)
    }));
    if (editingMessageId === messageId) setEditingMessageId(null);
    if (reactionPickerId === messageId) setReactionPickerId(null);
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).map(message => {
        if (message.id !== messageId) return message;
        const reactions = message.reactions || [];
        return {
          ...message,
          reactions: reactions.includes(emoji)
            ? reactions.filter(reaction => reaction !== emoji)
            : [...reactions, emoji]
        };
      })
    }));
    setReactionPickerId(null);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-indigo-400">
          💬 Project 16: Local Chat Hub (Dot Architecture)
        </h1>
        <p className="text-slate-400 text-sm">
          Local-first secure messaging powered by real-time status dot architecture (Red: Offline, Yellow: Online, Green: Opened).
        </p>
      </div>

      {/* Chat Container */}
      <div className="grid h-162.5 grid-cols-1 md:grid-cols-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
        
        {/* Sidebar Contacts */}
        <div className="md:col-span-1 border-r border-slate-800/80 flex flex-col bg-slate-900/30">
          <div className="p-4 border-b border-slate-800/80">
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">
            {contacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => handleSelectContact(contact.id)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition border-b border-slate-800/40 ${
                  activeContactId === contact.id ? 'bg-indigo-600/10 border-l-4 border-l-indigo-500' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="relative w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm border border-slate-700">
                  {contact.avatar}
                  {contact.status !== 'offline' && (
                    <span
                      aria-label="Online"
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-lg shadow-emerald-500/50"
                    />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-sm font-semibold text-slate-200 truncate">{contact.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{contact.role}</p>
                </div>
                {(unreadCounts[contact.id] || 0) > 0 && (
                  <span
                    aria-label={`${unreadCounts[contact.id]} unread message${unreadCounts[contact.id] === 1 ? '' : 's'}`}
                    className="min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center"
                  >
                    {unreadCounts[contact.id]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="md:col-span-3 flex min-h-0 flex-col bg-slate-950/40">
          
          {/* Chat Header */}
          <div className="shrink-0 p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-200 text-xs border border-slate-700">
                {activeContact.avatar}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">{activeContact.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCycleStatus}
                aria-label={`Change ${activeContact.name}'s status from ${activeContact.status}`}
                title="Cycle status: offline, online, opened"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClearConversation}
                aria-label={`Clear conversation with ${activeContact.name}`}
                title="Clear conversation"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:bg-rose-950/60 hover:border-rose-800 hover:text-rose-300 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                Local Encrypted Vault
              </div>
            </div>
          </div>

          {/* Message History */}
          <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-4 [&::-webkit-scrollbar]:hidden">
            {activeMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} group`}
              >
                <div className="relative max-w-full">
                  <div className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-600/10' 
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}>
                    {editingMessageId === msg.id ? (
                      <form onSubmit={event => handleSaveEdit(event, msg.id, Date.now())} className="flex min-w-48 items-center gap-2">
                        <input
                          autoFocus
                          value={editingText}
                          onChange={event => setEditingText(event.target.value)}
                          aria-label="Edit message text"
                          className="min-w-0 flex-1 rounded-md border border-white/20 bg-slate-950/40 px-2 py-1 text-sm text-white outline-none focus:border-white/50"
                        />
                        <button type="submit" aria-label="Save edited message" title="Save" className="p-1 text-emerald-200 hover:text-white">
                          <Check className="h-4 w-4" />
                        </button>
                        <button type="button" aria-label="Cancel editing" title="Cancel" onClick={() => setEditingMessageId(null)} className="p-1 text-white/70 hover:text-white">
                          <X className="h-4 w-4" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap wrap-break-word">{msg.text}</p>
                        {msg.edited && <span className="mt-1 block text-[10px] opacity-65">(edited)</span>}
                      </>
                    )}
                  </div>

                  {editingMessageId !== msg.id && (
                    <div className={`absolute top-0 z-10 flex -translate-y-full items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 ${msg.sender === 'user' ? 'right-0' : 'left-0'}`}>
                      <button
                        type="button"
                        onClick={() => setReactionPickerId(current => current === msg.id ? null : msg.id)}
                        aria-label={`React to message: ${msg.text}`}
                        title="Add reaction"
                        className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Smile className="h-3.5 w-3.5" />
                      </button>
                      {isWithinEditWindow(msg, currentTime) && (
                        <button type="button" onClick={() => handleStartEditing(msg)} aria-label="Edit message" title="Edit message" className="rounded p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteMessage(msg.id)} aria-label="Delete message" title="Delete message" className="rounded p-1.5 text-slate-300 hover:bg-rose-950 hover:text-rose-300">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {reactionPickerId === msg.id && (
                    <div role="group" aria-label="Choose a reaction" className={`absolute bottom-full z-20 mb-1 flex gap-1 rounded-lg border border-slate-700 bg-slate-900 p-1.5 shadow-xl ${msg.sender === 'user' ? 'right-0' : 'left-0'}`}>
                      {['👍', '❤️', '🔥', '😂'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleToggleReaction(msg.id, emoji)}
                          aria-label={`React with ${emoji}`}
                          className="rounded px-1.5 py-1 text-base hover:bg-slate-800"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {(msg.reactions?.length || 0) > 0 && (
                    <div className={`mt-1 flex flex-wrap gap-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.reactions?.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleToggleReaction(msg.id, emoji)}
                          aria-label={`Remove ${emoji} reaction`}
                          title="Remove reaction"
                          className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs hover:border-indigo-500"
                        >
                          {emoji} <span className="text-[10px] text-slate-400">1</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="mt-1 flex items-center gap-1.5 px-1 text-[10px] text-slate-500">
                  {msg.sender === 'user' && (
                    <span
                      role="img"
                      aria-label={msg.deliveryStatus || 'sent'}
                      title={msg.deliveryStatus === 'read' ? 'Opened / Read' : msg.deliveryStatus === 'delivered' ? 'Delivered / Online' : 'Sent / Offline'}
                      className={`h-2 w-2 rounded-full ${msg.deliveryStatus === 'read' ? 'bg-emerald-500' : msg.deliveryStatus === 'delivered' ? 'bg-amber-400' : 'bg-rose-500'}`}
                    />
                  )}
                  {msg.timestamp}
                </span>
              </div>
            ))}
            {typingContactId === activeContactId && (
              <div className="flex flex-col items-start" aria-live="polite">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-400 px-4 py-3 rounded-2xl rounded-bl-none text-xs">
                  <span>Contact is typing...</span>
                  <span className="flex items-center gap-1" aria-hidden="true">
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSendMessage} className="shrink-0 p-4 border-t border-slate-800/80 bg-slate-900/40 flex gap-3">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeContact.name}...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-600/20"
            >
              Send
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}