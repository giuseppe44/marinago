import { HeroSearch } from "@/components/home/HeroSearch";
import { Pillars } from "@/components/home/Pillars";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Test di connessione (sola lettura)
  const { data: marinas, error } = await supabase.from("marinas").select("id").limit(1);
  const dbStatus = error 
    ? { status: "error", message: error.message }
    : { status: "success", count: marinas?.length || 0 };

  // Recupero barche dell'utente
  let userBoats: any[] = [];
  if (user) {
    const { data } = await supabase.from("boats").select("*").eq("owner_id", user.id);
    if (data) userBoats = data;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* DB Connection Status Bar */}
      <div className={`text-xs text-center py-1 text-white ${dbStatus.status === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
        {dbStatus.status === 'success' 
          ? `✓ Database connesso (Supabase OK)` 
          : `⚠ Errore connessione DB: ${dbStatus.message}`}
      </div>

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full bg-slate-900 flex items-center justify-center">
        {/* Placeholder per l'immagine di sfondo (mare Sardegna) */}
        <div className="absolute inset-0 bg-blue-900/40 z-0" />
        <div 
          className="absolute inset-0 z-0 opacity-60 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=2070&auto=format&fit=crop")' }}
        />
        
        <div className="relative z-10 text-center px-4 w-full">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
            Trova il tuo posto in Sardegna.
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Scopri i porti, prenota l'ormeggio e ordina la tua cambusa direttamente a bordo.
          </p>
        </div>
      </section>

      {/* Search Bar - Overlapping Hero */}
      <HeroSearch boats={userBoats} />

      {/* 4 Pillars Section */}
      <Pillars />
      
    </main>
  );
}
