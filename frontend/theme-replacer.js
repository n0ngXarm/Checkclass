const fs = require('fs');
const path = require('path');

const dict = {
  'bg-[#f4f6f8]': 'bg-[#f4f6f8] dark:bg-[#0f172a]',
  'bg-[#f8fafc]': 'bg-[#f8fafc] dark:bg-slate-800/50',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-800',
  'bg-slate-50/50': 'bg-slate-50/50 dark:bg-slate-800/50',
  'bg-white': 'bg-white dark:bg-slate-800',
  'bg-white/95': 'bg-white/95 dark:bg-slate-900/95',
  'bg-white/90': 'bg-white/90 dark:bg-slate-900/90',
  'bg-white/80': 'bg-white/80 dark:bg-slate-900/80',
  'text-slate-800': 'text-slate-800 dark:text-slate-100',
  'text-slate-700': 'text-slate-700 dark:text-slate-200',
  'text-slate-600': 'text-slate-600 dark:text-slate-300',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'text-slate-400': 'text-slate-400 dark:text-slate-500',
  'border-slate-100/50': 'border-slate-100/50 dark:border-slate-700/50',
  'border-slate-100/60': 'border-slate-100/60 dark:border-slate-700/60',
  'border-slate-100': 'border-slate-100 dark:border-slate-700',
  'border-slate-200/80': 'border-slate-200/80 dark:border-slate-600/80',
  'border-slate-200/50': 'border-slate-200/50 dark:border-slate-600/50',
  'border-slate-200': 'border-slate-200 dark:border-slate-600',
  'border-white/40': 'border-white/40 dark:border-slate-700',
  'border-white/20': 'border-white/20 dark:border-slate-700',
  'ring-slate-100': 'ring-slate-100 dark:ring-slate-700'
};

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We safely split by spaces, quotes, backticks to replace whole words only.
      // But string replacement across the file is easiest if we parse tokens.
      let tokens = content.split(/([\s"'`]+)/);
      for(let i=0; i<tokens.length; i++) {
         let t = tokens[i];
         if(dict[t]) {
            // check if next tokens already contain the dark class to avoid double add
            // Wait, we can just blind replace and then dedup or ignore if it's already there
            let newVal = dict[t];
            // if replacing makes it "bg-white dark:bg-slate-800", check if the string isn't already there?
            tokens[i] = newVal;
         }
      }
      let modified = tokens.join('');
      
      if(modified !== content) {
        fs.writeFileSync(fullPath, modified);
        console.log('Updated ' + fullPath);
      }
    }
  });
}

processDir('./app');
processDir('./components');
