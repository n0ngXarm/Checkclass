import './globals.css';

export const metadata = {
  title: 'ระบบเช็คชื่อ IT',
  description: 'ระบบเช็คชื่อนักเรียน แผนกเทคโนโลยีสารสนเทศ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <script dangerouslySetInnerHTML={{__html: `
          if(localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        `}} />
      </head>
      <body className="antialiased min-h-screen flex flex-col dark:bg-[#0f172a] dark:text-slate-200 overflow-x-hidden w-full">{children}</body>
    </html>
  );
}
