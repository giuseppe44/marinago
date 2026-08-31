import { HeroSearch } from "@/components/home/HeroSearch";
import { Pillars } from "@/components/home/Pillars";
import { FeaturedDestinations } from "@/components/home/FeaturedDestinations";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Recupero barche dell'utente o barche DEMO
  let userBoats: any[] = [];
  if (user) {
    const { data } = await supabase.from("boats").select("*").eq("owner_id", user.id);
    if (data) userBoats = data;
  }
  
  // Se non ci sono barche (utente non loggato o senza barche), carica quelle DEMO per la UX
  if (userBoats.length === 0) {
    const { data } = await supabase.from("boats").select("*").like("name", "[DEMO]%").limit(5);
    if (data) userBoats = data;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[65vh] min-h-[550px] w-full flex flex-col items-center justify-center">
        {/* L'immagine di sfondo: Barca a vela luminosa diurna in mare */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop")' }}
        />
        {/* Overlay scuro per far leggere bene il testo bianco */}
        <div className="absolute inset-0 z-0 bg-slate-900/60" />
        
        {/* Dynamic LIVE element */}
        <div className="relative z-10 mb-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-white text-sm font-medium tracking-wide">12 ormeggi confermati oggi</span>
        </div>
        
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

      {/* Featured Destinations */}
      <FeaturedDestinations />
      
    </main>
  );
}
