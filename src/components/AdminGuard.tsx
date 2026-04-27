import React from 'react';
import { useAuth } from '../context/AuthContext';
import { loginWithGoogle } from '../lib/firebase';
import { LogIn } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-20 text-center font-bold text-emerald-600">
        جاري التحميل...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600">
           <LogIn className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">تسجيل الدخول للمسؤول</h1>
        <p className="text-slate-500 mb-8 max-w-sm">
          يجب تسجيل الدخول باستخدام حساب Google المعتمد للتمكن من إدارة النظام وتعديل الأسعار.
        </p>
        <button 
          onClick={() => loginWithGoogle()}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          تسجيل الدخول عبر Google
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
