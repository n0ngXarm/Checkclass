import './globals.css';

export const metadata = {
  title: 'ระบบเช็คชื่อ IT',
  description: 'ระบบเช็คชื่อนักเรียน แผนกเทคโนโลยีสารสนเทศ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
