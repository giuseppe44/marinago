"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Ship } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Controlla il ruolo per decidere dove reindirizzare
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
          if (profile?.role === 'MARINA_MANAGER' || profile?.role === 'ADMIN' || email.includes('admin')) {
             router.push("/gestore");
             router.refresh();
             return;
          }
        }
        
        router.push("/profilo/barche");
        router.refresh();
      } else {
        const { error: signUpError, data } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullName } // Salva il nome nei metadata
          }
        });
        if (signUpError) throw signUpError;
        
        // Se non richiede conferma email, logga e vai avanti
        if (data.session) {
          router.push("/profilo/barche");
          router.refresh();
        } else {
          setError("Registrazione completata. Controlla la tua email per confermare.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Errore durante l'autenticazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 p-3 rounded-full">
            <Ship className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
          {isLogin ? "Bentornato a bordo" : "Crea il tuo account"}
        </h2>
        <p className="text-center text-slate-500 mb-8 text-sm">
          {isLogin ? "Accedi per gestire le tue prenotazioni" : "Registrati per trovare il tuo ormeggio"}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
               <input 
                 type="text" 
                 required 
                 className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 value={fullName}
                 onChange={e => setFullName(e.target.value)}
               />
             </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? "Attendere..." : (isLogin ? "Accedi" : "Registrati")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? "Non hai un account? " : "Hai già un account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isLogin ? "Registrati" : "Accedi"}
          </button>
        </div>
      </div>
    </div>
  );
}
