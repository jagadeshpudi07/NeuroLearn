"use client";
import React, { useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ArrowRight, UploadCloud, Loader2, BookOpen } from 'lucide-react';
import gsap from 'gsap';
import api from '@/lib/api';

export default function Dashboard() {
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [hasDocument, setHasDocument] = React.useState(false);
  const [summary, setSummary] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const noteId = localStorage.getItem('noteId');
    if (noteId) {
      setHasDocument(true);
      const cachedSummary = localStorage.getItem(`summary_${noteId}`);
      if (cachedSummary) {
        setSummary(cachedSummary);
        return; // Use cached summary, avoid regenerating
      }
      fetchSummary(noteId);
    }
  }, []);

  const fetchSummary = async (noteId: string) => {
    setLoading(true);
    try {
      const res = await api.post('/ai/generate-summary', { noteId });
      setSummary(res.data.summary);
      localStorage.setItem(`summary_${noteId}`, res.data.summary);
    } catch (error: any) {
      console.error("Failed to fetch summary:", error);
      if (error.response?.status === 404) {
        localStorage.removeItem('noteId');
        localStorage.removeItem(`summary_${noteId}`);
        setHasDocument(false);
      } else {
        const msg = error.response?.data?.error || "Failed to generate summary";
        setSummary(`Error: ${msg}. Please check your AI API balance or configuration.`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tl = gsap.timeline();

    // Title animation
    tl.fromTo(titleRef.current,
      { y: 30, opacity: 0, skewY: 2 },
      { y: 0, opacity: 1, skewY: 0, duration: 1, ease: "power4.out" }
    );

    // Staggered items animation
    if (cardsRef.current) {
      tl.fromTo(Array.from(cardsRef.current.children),
        { y: 40, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)" },
        "-=0.5"
      );
    }
  }, [hasDocument, loading]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="md:ml-64 p-4 md:p-8 w-full">
        <div className="max-w-6xl mx-auto pt-16 md:pt-10">
          <div ref={titleRef}>
            <h2 className="text-5xl md:text-7xl font-normal text-slate-900 dark:text-slate-50 mb-4 font-heading">
              Study <span className="text-blue-600">Smarter</span>, Not Harder
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-12 max-w-2xl">
              Transform your static notes into interactive quizzes, summaries, and flashcards with AI-powered insights.
            </p>
          </div>

          <div ref={cardsRef} className="w-full">
            {!hasDocument ? (
              <div className="flex flex-col items-center justify-center p-20 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-dashed border-gray-300 dark:border-white/10 rounded-3xl text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                  <UploadCloud size={40} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">No Material Found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm">Upload the material to use the features and generate study guides instantly.</p>
                <a 
                  href="/upload" 
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all hover:scale-105"
                >
                  Go to Upload
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* AI Summary Card */}
                <div className="md:col-span-2 lg:col-span-2 group relative bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Document Summary</h3>
                  </div>
                  {loading ? (
                    <div className="flex items-center gap-3 text-slate-500 animate-pulse">
                      <Loader2 className="animate-spin" /> Summarizing your notes...
                    </div>
                  ) : (
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">
                      {summary || "Your summary will appear here once processed."}
                    </p>
                  )}
                </div>

                {/* Quick Actions Card */}
                <div className="flex flex-col gap-6">
                  <a href="/quiz" className="group relative bg-blue-600 p-8 rounded-3xl shadow-xl hover:scale-[1.02] transition-all">
                    <h3 className="text-xl font-bold text-white mb-2">Practice Quiz</h3>
                    <p className="text-blue-100 text-sm mb-6">Test your knowledge with AI-generated questions.</p>
                    <div className="flex items-center text-white font-semibold text-sm gap-2">
                      Start Now <ArrowRight size={16} />
                    </div>
                  </a>
                  <a href="/flashcards" className="group relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-8 rounded-3xl shadow-lg hover:scale-[1.02] transition-all">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">Flashcards</h3>
                    <p className="text-slate-500 text-sm mb-6">Review key terms and definitions quickly.</p>
                    <div className="flex items-center text-blue-600 font-semibold text-sm gap-2">
                      Review <ArrowRight size={16} />
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}