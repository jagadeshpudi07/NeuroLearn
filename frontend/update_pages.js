const fs = require('fs');
const path = require('path');

const sidebarImport = "import { Sidebar } from '@/components/Sidebar';";

const filesToUpdate = [
  'src/app/upload/page.tsx',
  'src/app/quiz/page.tsx',
  'src/app/flashcards/page.tsx',
  'src/app/chat/page.tsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Add Sidebar import if not present
    if (!content.includes(sidebarImport)) {
      content = content.replace('"use client";', '"use client";\n' + sidebarImport);
    }
    
    // Wrap main content in flex and add Sidebar
    if (!content.includes('<Sidebar />')) {
      content = content.replace(/return \(\s*<div className="min-h-screen/, (match) => {
        return 'return (\n    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">\n      <Sidebar />\n      <div className="ml-64 p-8 w-full flex flex-col items-center justify-center';
      });
      
      // Close the wrapper div
      content = content.replace(/<\/div>\s*\);/g, '</div>\n    </div>\n  );');
    }
    
    fs.writeFileSync(fullPath, content);
  }
});

console.log('Pages updated successfully.');
