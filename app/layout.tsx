import './globals.css';
import './a11y.css';

export const metadata = {
  title: 'טלדן ט.ד. הנדסה ובניין',
  description: 'טלדן ט.ד. הנדסה ובניין. קבלן ראשי למבנים ציבוריים, מרכזים רפואיים וסניפי בנק.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
