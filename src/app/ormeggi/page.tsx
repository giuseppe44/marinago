export default function OrmeggiPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-slate-50">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Porti & Ormeggi</h1>
      <p className="text-lg text-slate-600 max-w-lg text-center mb-8">
        Esplora la rete dei nostri porti affiliati e scopri le loro caratteristiche e servizi.
      </p>
      <a href="/" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        Cerca Disponibilità
      </a>
    </div>
  );
}
