import React, { useState } from 'react';
import { Lock, Mail, LogIn, RefreshCw, AlertCircle } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Error al iniciar sesión. Asegúrate de usar tu cuenta autorizada.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 border border-white/10">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-100">
              <Lock size={40} className="text-brand-blue" />
            </div>
            <h1 className="text-3xl font-black text-brand-blue mb-2">Acceso Privado</h1>
            <p className="text-slate-500 font-medium">Solo personal autorizado de KR Cambios</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 text-brand-blue border-2 border-slate-100 font-black py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <RefreshCw size={24} className="animate-spin text-brand-green" />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                  Entrar con Google
                </>
              )}
            </button>
            
            <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold mt-8">
              Seguridad Protegida por KR Cambios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
