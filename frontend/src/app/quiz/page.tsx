"use client";
import { Sidebar } from '@/components/Sidebar';
import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, Loader2, PlusCircle } from 'lucide-react';
import gsap from 'gsap';
import api from '@/lib/api';

export default function QuizPage() {
  const [hasDocument, setHasDocument] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingMore, setGeneratingMore] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const noteId = localStorage.getItem('noteId');
    if (noteId) {
      setHasDocument(true);
      
      const cachedData = localStorage.getItem(`quiz_${noteId}`);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setQuestions(parsed.questions || []);
          return;
        } catch (e) {
          console.error("Failed to parse cached quiz", e);
        }
      }
      
      fetchQuiz(noteId);
    }
  }, []);

  // Save quiz to localStorage whenever questions change
  useEffect(() => {
    const noteId = localStorage.getItem('noteId');
    if (noteId && questions.length > 0) {
      localStorage.setItem(`quiz_${noteId}`, JSON.stringify({ questions }));
    }
  }, [questions]);

  const fetchQuiz = async (noteId: string) => {
    setLoading(true);
    try {
      const res = await api.post('/ai/generate-quiz', { noteId });
      setQuestions(res.data.quiz);
    } catch (error: any) {
      console.error("Failed to fetch quiz", error);
      if (error.response?.status === 404) {
        localStorage.removeItem('noteId');
        localStorage.removeItem(`quiz_${noteId}`);
        setHasDocument(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMoreQuestions = async () => {
    const noteId = localStorage.getItem('noteId');
    if (!noteId || generatingMore) return;
    
    setGeneratingMore(true);
    try {
      const existingQ = questions.map(q => q.text || q.q);
      const res = await api.post('/ai/generate-quiz', { 
        noteId, 
        existingQ 
      });
      setQuestions(prev => [...prev, ...res.data.quiz]);
      setSubmitted(false);
    } catch (error: any) {
      console.error("Failed to generate more questions", error);
      if (error.response?.status === 404) {
        localStorage.removeItem('noteId');
        localStorage.removeItem(`quiz_${noteId}`);
        setHasDocument(false);
      }
    } finally {
      setGeneratingMore(false);
    }
  };

  useEffect(() => {
    if (containerRef.current && questions.length > 0) {
      gsap.fromTo(Array.from(containerRef.current.children), 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [questions]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar />
      <div className="md:ml-64 p-4 md:p-8 w-full pt-20 md:pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">Practice Quiz</h2>
            <p className="text-slate-600 dark:text-slate-400">Select the correct answers for each question.</p>
          </div>

          <div ref={containerRef} className="w-full">
            {!hasDocument ? (
              <div className="flex flex-col items-center justify-center p-16 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-dashed border-gray-300 dark:border-white/10 rounded-3xl text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 text-blue-500">
                  <UploadCloud size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">No Quiz Available</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8">Upload the material to use the features and generate quizzes.</p>
                <a href="/upload" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all">Go to Upload</a>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
                <p className="text-lg font-medium">Generating your quiz with AI...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div key={idx} className="bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transform transition-transform hover:translate-y-[-2px]">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                      <span className="text-blue-500 mr-2">Q{idx + 1}.</span> {q.text || q.q}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt: string, oIdx: number) => {
                        const isSelected = answers[idx] === opt;
                        const isCorrect = q.answer === opt;
                        
                        let btnClass = "p-3 text-left rounded-xl border transition-colors duration-200 cursor-pointer ";
                        
                        if (!submitted) {
                          if (isSelected) {
                            btnClass += "border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
                          } else {
                            btnClass += "border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300";
                          }
                        } else {
                          // Submitted state
                          if (isCorrect) {
                            btnClass += "border-green-500 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-medium";
                          } else if (isSelected && !isCorrect) {
                            btnClass += "border-red-500 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 opacity-70 text-decoration-line-through";
                          } else {
                            btnClass += "border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/20 text-slate-500 dark:text-slate-500 opacity-50";
                          }
                        }

                        return (
                          <button 
                            key={oIdx}
                            onClick={() => {
                              if (!submitted) {
                                setAnswers({ ...answers, [idx]: opt });
                              }
                            }}
                            disabled={submitted}
                            className={btnClass}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {hasDocument && !loading && questions.length > 0 && (
            <div className="mt-10 text-center">
               {!submitted ? (
                 <button 
                   onClick={() => setSubmitted(true)}
                   disabled={Object.keys(answers).length < questions.length}
                   className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
                 >
                   Submit Quiz
                 </button>
               ) : (
                 <div className="flex flex-col items-center gap-4">
                   <div className="text-2xl font-bold text-slate-800 dark:text-white">
                     Score: {Object.keys(answers).filter(idx => questions[Number(idx)].answer === answers[Number(idx)]).length} / {questions.length}
                   </div>
                   <div className="flex flex-col sm:flex-row gap-4">
                     <button 
                       onClick={() => {
                         setSubmitted(false);
                         setAnswers({});
                       }}
                       className="px-8 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
                     >
                       Retake Quiz
                     </button>
                     <button
                       onClick={generateMoreQuestions}
                       disabled={generatingMore}
                       className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {generatingMore ? (
                         <><Loader2 size={18} className="animate-spin" /> Generating...</>
                       ) : (
                         <><PlusCircle size={18} /> Generate More Questions</>
                       )}
                     </button>
                   </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}