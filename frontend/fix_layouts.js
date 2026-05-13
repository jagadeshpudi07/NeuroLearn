const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/upload/page.tsx',
  'src/app/quiz/page.tsx',
  'src/app/flashcards/page.tsx'
];

filesToFix.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix the nested div issue and duplicate classes
    content = content.replace(/return \(\s*<div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">\s*<Sidebar \/>\s*<div className="ml-64 p-8 w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 flex flex-col items-center">/, 
      'return (\n    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">\n      <Sidebar />\n      <div className="ml-64 p-8 w-full flex flex-col items-center justify-center">');
    
    // Fix the double closing div at the end if it exists
    content = content.replace(/<\/div>\s*<\/div>\s*\);/g, '</div>\n    </div>\n  );');
    
    fs.writeFileSync(fullPath, content);
  }
});

console.log('Layouts fixed successfully.');
