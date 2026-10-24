import './globals.css';
export const metadata = { title: 'Quran Hosting | Class Portal', icons: { icon: '/logo.png' } };
export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}
