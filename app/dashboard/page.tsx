import '../dashboard.css';
import Dashboard from './Dashboard';

export const metadata = { title: 'ניהול תוכן', robots: { index: false, follow: false } };

export default function DashboardPage() {
  return <Dashboard />;
}
