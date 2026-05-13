"use client";
import { Sidebar } from '@/components/Sidebar';
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File as FileIcon, CheckCircle, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import api from '@/lib/api';
import { toast, Toaster } from 'react-hot-toast';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      console.log("Uploading file:", file.name);
      const res = await api.post('/notes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("Upload success:", res.data);
      localStorage.setItem('noteId', res.data.noteId);
      toast.success('Material processed successfully!');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (error: any) {
      console.error("Upload failed:", error);
      const msg = error.response?.data?.error || error.message || 'Failed to process material';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const onUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <Toaster position="top-right" />
      <div className="md:ml-64 p-4 md:p-8 w-full flex flex-col items-center justify-center pt-24 md:pt-8">
        <div 
          ref={containerRef}
          className="max-w-2xl w-full bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 rounded-3xl p-6 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.05)] text-center"
        >
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Upload Study Material</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Drag and drop your PDF notes here to generate summaries, flashcards, and quizzes.</p>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf" 
            className="hidden" 
          />

          <div 
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={onUploadClick}
            className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}`}
          >
            {file ? (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle size={48} className="text-green-500" />
                <div className="text-lg font-medium text-slate-800 dark:text-slate-200">{file.name}</div>
                <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  disabled={uploading}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors cursor-pointer flex items-center gap-2"
                >
                  {uploading ? (
                    <><Loader2 className="animate-spin" size={18} /> Processing...</>
                  ) : (
                    'Process PDF'
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500">
                  <UploadCloud size={40} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Drop your PDF here</p>
                  <p className="text-sm text-slate-500">or click to browse from your computer</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}