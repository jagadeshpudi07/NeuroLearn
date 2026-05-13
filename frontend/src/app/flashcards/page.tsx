"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ArrowLeft, ArrowRight, UploadCloud, Loader2, PlusCircle } from 'lucide-react';
import api from '@/lib/api';

export default function FlashcardsPage() {
  const [hasDocument, setHasDocument] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingMore, setGeneratingMore] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  useEffect(() => {
    const noteId = localStorage.getItem('noteId');
    if (noteId) {
      setHasDocument(true);
      
      const cachedData = localStorage.getItem(`flashcards_${noteId}`);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setCards(parsed.cards || []);
          setCurrentIndex(parsed.currentIndex || 0);
          return; // Skip fetching if we have cached data
        } catch (e) {
          console.error("Failed to parse cached flashcards", e);
        }
      }
      
      fetchFlashcards(noteId);
    }
  }, []);

  // Save current state to localStorage whenever cards or index changes
  useEffect(() => {
    const noteId = localStorage.getItem('noteId');
    if (noteId && cards.length > 0) {
      localStorage.setItem(`flashcards_${noteId}`, JSON.stringify({
        cards,
        currentIndex
      }));
    }
  }, [cards, currentIndex]);

  const fetchFlashcards = async (noteId: string) => {
    setLoading(true);
    try {
      const res = await api.post('/ai/generate-flashcards', { noteId });
      setCards(res.data.cards);
    } catch (error: any) {
      console.error("Failed to fetch flashcards", error);
      if (error.response?.status === 404) {
        localStorage.removeItem('noteId');
        localStorage.removeItem(`flashcards_${noteId}`);
        setHasDocument(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMoreCards = async () => {
    const noteId = localStorage.getItem('noteId');
    if (!noteId || generatingMore) return;
    
    setGeneratingMore(true);
    try {
      const existingQ = cards.map(c => c.q);
      const res = await api.post('/ai/generate-flashcards', { 
        noteId, 
        existingQ 
      });
      // Append new cards to existing ones
      setCards(prev => [...prev, ...res.data.cards]);
      // Jump to the first of the newly added cards
      setCurrentIndex(cards.length);
      setIsFlipped(false);
    } catch (error) {
      console.error("Failed to generate more flashcards");
    } finally {
      setGeneratingMore(false);
    }
  };

  const handleFlip = () => setIsFlipped(!isFlipped);
  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };
  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar />
      <div className="md:ml-64 p-4 md:p-8 w-full flex flex-col items-center justify-center pt-24 md:pt-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50">Active Recall</h2>
          {!loading && cards.length > 0 && (
            <p className="text-slate-600 dark:text-slate-400 mt-2">Card {currentIndex + 1} of {cards.length}</p>
          )}
        </div>

        {/* Card Content */}
        {!hasDocument ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-dashed border-gray-300 dark:border-white/10 rounded-3xl text-center max-w-2xl mx-auto w-full">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 text-blue-500">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">No Flashcards Yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Upload the material to use the features and generate interactive flashcards.</p>
            <a href="/upload" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all">Go to Upload</a>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-500">
            <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
            <p className="text-lg font-medium">Creating flashcards from your notes...</p>
          </div>
        ) : cards.length > 0 ? (
          <>
            {/* Card Container */}
            <div className="relative w-full max-w-lg h-80 [perspective:1000px] group">
              <div 
                onClick={handleFlip}
                className={`relative w-full h-full cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white text-center leading-tight">{cards[currentIndex].q}</h3>
                  <div className="mt-8 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse">
                    Click to reveal answer
                  </div>
                </div>
                
                {/* Back Side */}
                <div 
                  className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-blue-600 rounded-3xl p-10 flex flex-col items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.1)] text-white"
                >
                  <p className="text-xl font-medium text-center leading-relaxed italic">"{cards[currentIndex].a}"</p>
                  <div className="mt-8 text-white/50 text-xs font-bold uppercase tracking-widest">
                    Answer Revealed
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation and Actions */}
            <div className="flex flex-col items-center mt-12 gap-8">
              <div className="flex gap-6">
                <button 
                  onClick={prevCard} 
                  className="p-4 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-110 cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <ArrowLeft size={24} />
                </button>
                <button 
                  onClick={nextCard} 
                  className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 border-none shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer text-white"
                >
                  <ArrowRight size={24} />
                </button>
              </div>
              
              <button
                onClick={generateMoreCards}
                disabled={generatingMore}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingMore ? (
                  <><Loader2 size={18} className="animate-spin" /> Generating More...</>
                ) : (
                  <><PlusCircle size={18} /> Generate More Flashcards</>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-slate-500">Failed to load flashcards.</div>
        )}
      </div>
    </div>
  );
}