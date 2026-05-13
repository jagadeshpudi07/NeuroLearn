const fs = require('fs');
const path = require('path');

const files = {
  'src/app/upload/page.tsx': `"use client";
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File, CheckCircle } from 'lucide-react';
import gsap from 'gsap';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current, 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div 
        ref={containerRef}
        className="max-w-2xl w-full bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-3xl p-10 shadow-[0_20px_40px_rgba(0,0,0,0.05)] text-center"
      >
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Upload Study Material</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Drag and drop your PDF notes here to generate summaries, flashcards, and quizzes.</p>
        
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={\`border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer \${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}\`}
        >
          {file ? (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle size={48} className="text-green-500" />
              <div className="text-lg font-medium text-slate-800 dark:text-slate-200">{file.name}</div>
              <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors cursor-pointer">
                Process PDF
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <UploadCloud size={48} className="text-blue-500 mb-2" />
              <p className="text-lg font-medium text-slate-800 dark:text-slate-200">Drop your PDF here</p>
              <p className="text-sm text-slate-500">or click to browse from your computer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`,

  'src/app/flashcards/page.tsx': `"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

const mockCards = [
  { q: "What is React?", a: "A JavaScript library for building user interfaces." },
  { q: "What is GSAP?", a: "GreenSock Animation Platform for high-performance web animations." },
  { q: "Define Glassmorphism.", a: "A UI design trend emphasizing frosted glass effects and background blur." },
];

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { y: 30, opacity: 0, rotationX: 15 }, 
        { y: 0, opacity: 1, rotationX: 0, duration: 0.6, ease: "back.out(1.7)" }
      );
    }
  }, [currentIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % mockCards.length), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + mockCards.length) % mockCards.length), 150);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Interactive Flashcards</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Card {currentIndex + 1} of {mockCards.length}</p>
      </div>

      <div className="relative w-full max-w-lg h-80 perspective-1000">
        <div 
          ref={cardRef}
          onClick={handleFlip}
          className={\`w-full h-full cursor-pointer transition-transform duration-700 preserve-3d \${isFlipped ? 'rotate-y-180' : ''}\`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-white/90 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-3xl p-8 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
            <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 text-center">{mockCards[currentIndex].q}</h3>
          </div>
          
          {/* Back */}
          <div 
            className="absolute inset-0 w-full h-full backface-hidden bg-blue-50 dark:bg-blue-900/40 backdrop-blur-xl border border-blue-200 dark:border-blue-500/30 rounded-3xl p-8 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <p className="text-xl text-slate-800 dark:text-slate-100 text-center">{mockCards[currentIndex].a}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 mt-12">
        <button onClick={prevCard} className="p-4 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-700 dark:text-slate-300">
          <ArrowLeft size={24} />
        </button>
        <button onClick={nextCard} className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 border-none shadow-md transition-colors cursor-pointer text-white">
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}`,

  'src/app/quiz/page.tsx': `"use client";
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const mockQuestions = [
  { id: 1, text: "Which component represents the View in MVC?", options: ["Model", "Controller", "View", "Database"] },
  { id: 2, text: "What does GSAP stand for?", options: ["Global Style Animation", "GreenSock Animation Platform", "General System", "Graphic Style"] },
  { id: 3, text: "Which hook is used for side effects in React?", options: ["useState", "useEffect", "useMemo", "useContext"] },
];

export default function QuizPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      const qCards = containerRef.current.children;
      gsap.fromTo(qCards, 
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Knowledge Quiz</h2>
          <p className="text-slate-600 dark:text-slate-400">Select the correct answers for each question.</p>
        </div>

        <div ref={containerRef} className="space-y-6">
          {mockQuestions.map((q, idx) => (
            <div key={q.id} className="bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transform transition-transform hover:translate-y-[-2px]">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
                <span className="text-blue-500 mr-2">Q{idx + 1}.</span> {q.text}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, oIdx) => (
                  <button 
                    key={oIdx}
                    className="p-3 text-left rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 transition-colors duration-200 cursor-pointer"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
           <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all cursor-pointer">
             Submit Quiz
           </button>
        </div>
      </div>
    </div>
  );
}`,

  'src/app/globals.css': `@import "tailwindcss";

@theme {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

/* 3D Utility Classes for Flashcards */
.perspective-1000 {
  perspective: 1000px;
}
.preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('UI Components generated successfully.');
