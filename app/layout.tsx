import '@fontsource/karantina/hebrew-700.css';
import '@fontsource/karantina/latin-700.css';
import '@fontsource/heebo/hebrew-400.css';
import '@fontsource/heebo/hebrew-500.css';
import '@fontsource/heebo/hebrew-700.css';
import '@fontsource/heebo/latin-400.css';
import '@fontsource/heebo/latin-500.css';
import '@fontsource/heebo/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './globals.css';
import './site.css';

export const metadata = {
  title: 'טלדן ט.ד. הנדסה ובניין',
  description: 'טלדן ט.ד. הנדסה ובניין. קבלן ראשי למבנים ציבוריים, מרכזים רפואיים וסניפי בנק.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <noscript>
          <style>{'.rev{opacity:1!important;transform:none!important}.splash{display:none!important}'}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
