import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'text-sm font-medium',
            style: { borderRadius: '12px', padding: '12px 16px' },
          }}
        />
        {children}
      </main>
    </div>
  );
}