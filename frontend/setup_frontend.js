const fs = require('fs');
const path = require('path');

const files = {
  'src/lib/api.ts': `import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  if(token){
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

export default api;`,

  'src/app/login/page.tsx': `import React from 'react';
import Link from 'next/link';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 p-8 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6 text-center">Welcome Back</h2>
        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="email">Email</label>
            <input type="email" id="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="password">Password</label>
            <input type="password" id="password" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" />
          </div>
          <button type="button" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition-colors duration-200">Login</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account? <Link href="/signup" className="text-blue-600 hover:underline cursor-pointer">Sign up</Link>
        </p>
      </div>
    </div>
  );
}`,

  'src/app/dashboard/page.tsx': `import React from 'react';
import Link from 'next/link';
import { Upload, BookOpen, Layers, MessageSquare } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 dark:bg-white/10 backdrop-blur-xl border-r border-gray-200 dark:border-white/20 p-6 flex flex-col gap-6 fixed h-full z-10 shadow-[0_20px_40px_rgba(0,0,0,0.05)]">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">AI Study Assistant</h1>
        <nav className="flex flex-col gap-2 mt-4">
          <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-pointer transition-colors duration-200">
            <BookOpen size={20} /> Dashboard
          </Link>
          <Link href="/upload" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors duration-200">
            <Upload size={20} /> Upload Notes
          </Link>
          <Link href="/quiz" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors duration-200">
            <Layers size={20} /> Quizzes
          </Link>
          <Link href="/chat" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors duration-200">
            <MessageSquare size={20} /> AI Chat
          </Link>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="ml-64 p-8 w-full">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-8">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Cards */}
             {[1,2,3].map(i => (
               <div key={i} className="bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 p-6 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Note Document {i}</h3>
                 <p className="text-slate-600 dark:text-slate-400 text-sm">Uploaded recently. Generate quiz or summarize.</p>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Frontend files generated successfully.');
