import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  if (user && isAdmin) return <Navigate to="/admin" replace />;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-stone-200 border border-stone-100 overflow-hidden">
        <div className="bg-stone-900 p-12 text-white text-center">
          <div className="w-16 h-16 bg-wedding-gold/10 rounded-2xl flex items-center justify-center text-wedding-gold mx-auto mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-display mb-2">Eternal Vows</h1>
          <p className="text-stone-400 font-serif italic">Administrator Access</p>
        </div>
        
        <div className="p-12 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
              {error}
              {!isAdmin && user && <p className="mt-2 text-xs opacity-70">Note: Your email is not authorized as an administrator.</p>}
            </div>
          )}

          <div className="text-center space-y-4">
            <p className="text-stone-500 text-sm font-serif italic">
              Please sign in with your authorized Google account to manage your wedding invitation.
            </p>
            
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 text-stone-900 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-50 transition-all shadow-sm disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              {loading ? 'Connecting...' : 'Sign in with Google'}
            </button>
          </div>
          
          <div className="h-px bg-stone-100" />
          
          <div className="flex flex-col gap-2">
            <p className="text-center text-stone-400 text-[10px] uppercase tracking-widest font-bold">
              Authorized Administrator
            </p>
            <p className="text-center text-stone-900 text-xs font-mono font-bold">
              a45486005@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
