import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { testConnection } from './lib/firebase';

function Main() {
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Main />);
