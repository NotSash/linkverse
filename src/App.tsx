import { Toaster } from 'react-hot-toast';
import AppRouter from '@/router';

export default function App() {
  return (
    <>
      <AppRouter />

      <Toaster
        position="top-right"
        gutter={8}
        containerStyle={{ top: 16, right: 16 }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow:
              '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6',
            maxWidth: '380px',
          },
          success: {
            duration: 3000,
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
            style: { borderLeft: '4px solid #10b981' },
          },
          error: {
            duration: 4000,
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
            style: { borderLeft: '4px solid #ef4444' },
          },
        }}
      />

      {/* Mobile-optimized toast repositioning */}
      <style>{`
        @media (max-width: 640px) {
          [data-sonner-toaster], .react-hot-toast > div {
            bottom: 16px !important;
            top: auto !important;
            right: 16px !important;
            left: 16px !important;
          }
        }
      `}</style>
    </>
  );
}