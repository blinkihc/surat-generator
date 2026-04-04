import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Form Section Replacements
content = content.replace(/className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200"/g, 'className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"');
content = content.replace(/className="space-y-8"/g, 'className="space-y-4"');
content = content.replace(/mb-6/g, 'mb-4');
content = content.replace(/gap-6/g, 'gap-4');
content = content.replace(/gap-4/g, 'gap-3'); // some gap-4 to gap-3
content = content.replace(/space-y-1\.5/g, 'space-y-1');
content = content.replace(/text-xs font-semibold text-slate-500 uppercase/g, 'text-[10px] font-semibold text-slate-500 uppercase');
content = content.replace(/w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all/g, 'w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all');

// Preview Section Replacements
// Update wrapper
content = content.replace(/className="p-8 bg-white overflow-auto max-h-\[calc\(100vh-200px\)\]"/g, 'className="p-4 sm:p-8 bg-slate-200/50 overflow-auto max-h-[calc(100vh-200px)] flex justify-center"');
// Update paper
content = content.replace(/className="w-full max-w-\[210mm\] mx-auto bg-white p-\[15mm\] text-slate-900 font-serif leading-relaxed text-\[11pt\]"/g, 'className="w-[215mm] bg-white p-[20mm] text-slate-900 font-serif leading-relaxed text-[11pt] shrink-0 shadow-xl"');
content = content.replace(/style=\{\{ minHeight: '297mm' \}\}/g, "style={{ minHeight: '330mm' }}");

// Update Kop Surat text sizes
content = content.replace(/<h1 className="text-xl font-bold uppercase tracking-wide">\{settings.kopLine1\}<\/h1>/g, '<h1 className="text-[14pt] font-bold uppercase tracking-wide leading-tight">{settings.kopLine1}</h1>');
content = content.replace(/<h2 className="text-3xl font-bold uppercase tracking-wider mt-1 mb-2">\{settings.kopLine2\}<\/h2>/g, '<h2 className="text-[18pt] font-bold uppercase tracking-wider mt-1 mb-1 leading-tight">{settings.kopLine2}</h2>');
content = content.replace(/<p className="text-\[10pt\] italic">\{settings.kopAddress\}<\/p>/g, '<p className="text-[9pt] italic leading-tight">{settings.kopAddress}</p>');

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx");
