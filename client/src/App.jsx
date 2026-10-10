import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pay from './pages/Pay.jsx';
import Transactions from './pages/Transactions.jsx';
import Analytics from './pages/Analytics.jsx';
import Budget from './pages/Budget.jsx';
import Learn from './pages/Learn.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash"><span className="coin">🪙</span></div>;
  if (!user) return <Login />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="pay" element={<Pay />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="budget" element={<Budget />} />
        <Route path="learn" element={<Learn />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
