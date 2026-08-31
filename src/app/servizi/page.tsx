export default function ServiziPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-slate-50">
      <h1 className="text-4xl font-bold text-slate-900 mb-4">Servizi per la tua Barca</h1>
      <p className="text-lg text-slate-600 max-w-lg text-center mb-8">
        Assistenza, pulizia, cambusa e molto altro. Il tuo concierge digitale è quasi pronto.
      </p>
      <a href="/cambusa" className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">
        Vai alla Cambusa
      </a>
    </div>
  );
}
