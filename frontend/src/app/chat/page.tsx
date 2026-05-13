"use client";
import { Sidebar } from '@/components/Sidebar';
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your AI Study Assistant. Upload a document to start asking questions about it.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const noteId = localStorage.getItem('noteId');
    if (noteId) {
      const cachedChat = localStorage.getItem(`chat_${noteId}`);
      if (cachedChat) {
        try {
          setMessages(JSON.parse(cachedChat));
        } catch (e) {
          console.error("Failed to parse cached chat", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    const noteId = localStorage.getItem('noteId');
    // Only save if there are user/assistant interactions beyond the initial greeting
    if (noteId && messages.length > 1) {
      localStorage.setItem(`chat_${noteId}`, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const noteId = localStorage.getItem('noteId');
    
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (!noteId) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Please upload a document first so I can assist you better.' }]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { 
        question: input, 
        noteId 
      });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.response }]);
    } catch (error: any) {
      if (error.response?.status === 404) {
        localStorage.removeItem('noteId');
        setMessages(prev => [...prev, { role: 'assistant', text: 'Document not found on the server. Please upload it again.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again later.' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar />
      <div className="md:ml-64 flex flex-col flex-1 h-screen">
        {/* Chat Header */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl pt-20 md:pt-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50">AI Study Tutor</h2>
          <p className="text-xs md:text-sm text-slate-500">Ask anything about your uploaded materials</p>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-blue-600'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[70%] p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-blue-600">
                <Bot size={20} />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 p-4 rounded-3xl rounded-tl-none flex items-center gap-2 text-slate-400 italic text-sm">
                <Loader2 size={16} className="animate-spin" /> NeuroLearn is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-white/10">
          <div className="max-w-4xl mx-auto relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about your notes..."
              className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors cursor-pointer"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
