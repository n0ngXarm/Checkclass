const fs = require('fs');
const path = require('path');

const rules = [
  { p: /bg-\[#f4f6f8\]/g, r: 'bg-[#f4f6f8] dark:bg-[#0f172a]' },
  { p: /bg-\[#f8fafc\]/g, r: 'bg-[#f8fafc] dark:bg-[#0f172a]' },
  { p: /text-slate-800/g, r: 'text-slate-800 dark:text-slate-100' },
  { p: /text-slate-700/g, r: 'text-slate-700 dark:text-slate-200' },
  { p: /text-slate-600/g, r: 'text-slate-600 dark:text-slate-300' },
  { p: /text-slate-500/g, r: 'text-slate-500 dark:text-slate-400' },
  { p: /bg-white(?!\/)/g, r: 'bg-white dark:bg-slate-800' },
  { p: /bg-white\/95/g, r: 'bg-white/95 dark:bg-slate-900/95' },
  { p: /bg-white\/90/g, r: 'bg-white/90 dark:bg-slate-900/90' },
  { p: /bg-slate-50(?!\/)/g, r: 'bg-slate-50 dark:bg-slate-800/50' },
  { p: /bg-slate-50\/50/g, r: 'bg-slate-50/50 dark:bg-slate-800/30' },
  { p: /bg-slate-100(?!\/)/g, r: 'bg-slate-100 dark:bg-slate-800' },
  { p: /border-slate-100(?!\/)/g, r: 'border-slate-100 dark:border-slate-700' },
  { p: /border-slate-100\/50/g, r: 'border-slate-100/50 dark:border-slate-700/50' },
  { p: /border-slate-100\/60/g, r: 'border-slate-100/60 dark:border-slate-700/60' },
  { p: /border-slate-200(?!\/)/g, r: 'border-slate-200 dark:border-slate-700' },
  { p: /border-slate-200\/80/g, r: 'border-slate-200/80 dark:border-slate-700/80' },
  { p: /border-white\/40/g, r: 'border-white/40 dark:border-slate-700' },
  { p: /border-white\/20/g, r: 'border-white/20 dark:border-slate-700' },
  { p: /ring-slate-100/g, r: 'ring-slate-100 dark:ring-slate-700' },
  { p: /from-primary-900 to-primary-700/g, r: 'from-primary-900 to-primary-700 dark:from-primary-400 dark:to-primary-200' },
  { p: /from-primary-100 to-primary-200/g, r: 'from-primary-100 to-primary-200 dark:from-slate-700 dark:to-slate-800' },
  { p: /border-primary-200\/50/g, r: 'border-primary-200/50 dark:border-slate-600' },
  { p: /bg-primary-50(?!\/)/g, r: 'bg-primary-50 dark:bg-slate-800' },
  { p: /bg-gold-50(?!\/)/g, r: 'bg-gold-50 dark:bg-slate-800' },
  { p: /bg-brown-50(?!\/)/g, r: 'bg-brown-50 dark:bg-slate-800' },
  { p: /text-primary-800/g, r: 'text-primary-800 dark:text-primary-400' },
];

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = content;
      
      rules.forEach(({p, r}) => {
         modified = modified.replace(p, (match, offset, str) => {
            const prefix = str.slice(Math.max(0, offset - 5), offset);
            const suffix = str.slice(offset + match.length, offset + match.length + 5);
            if (prefix === 'dark:') return match;
            if (suffix.startsWith(' dark') || suffix.startsWith('dark:')) return match; 
            if (prefix.endsWith('-')) return match; // prevent hover:bg-white matching as bg-white if prefix is hover: ? No, if hover: then prefix is hover:. That's fine. Wait, if prefix is `r-` like from `border-bg-white`? not a thing.
            return r;
         });
      });
      
      if(modified !== content) {
        fs.writeFileSync(fullPath, modified);
        console.log('Updated ' + fullPath);
      }
    }
  });
}

processDir('./app');
processDir('./components');
