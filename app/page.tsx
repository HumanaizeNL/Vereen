import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vereen Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-gedreven data management en herindicatie voor WLZ zorg
          </p>
        </div>

        {/* Featured: AI Onboarding Assistant */}
        <Link href="/onboarding">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg shadow-md border-2 border-purple-300 hover:border-purple-500 transition-colors cursor-pointer mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-purple-900">
                AI Onboarding Assistent →
              </h2>
            </div>
            <p className="text-purple-700 mb-4">
              Vind de juiste AI-oplossing voor uw organisatie. De digitale assistent helpt u
              bij het in kaart brengen van uw vraagstuk en presenteert passende AI-oplossingen
              uit het Algoritmeregister met een implementatieplan op basis van VNG governance.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-purple-600 font-medium">
                ✓ Nieuw - Start het gesprek
              </div>
              <span className="text-purple-500">|</span>
              <span className="text-purple-500">Gebaseerd op algoritmes.overheid.nl</span>
            </div>
          </div>
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/uc1">
            <div className="bg-green-50 p-6 rounded-lg shadow-md border-2 border-green-300 hover:border-green-500 transition-colors cursor-pointer">
              <h2 className="text-2xl font-semibold text-green-900 mb-3">
                UC1: Data Management →
              </h2>
              <p className="text-green-700 mb-4">
                Upload en beheer cliëntgegevens, CSV/PDF/DOCX bestanden, en bekijk
                uitgebreide statistieken en analyses.
              </p>
              <div className="mt-4 text-green-600 font-medium">
                ✓ Actief - Klik om te starten
              </div>
            </div>
          </Link>

          <Link href="/uc2">
            <div className="bg-blue-50 p-6 rounded-lg shadow-md border-2 border-blue-300 hover:border-blue-500 transition-colors cursor-pointer">
              <h2 className="text-2xl font-semibold text-blue-900 mb-3">
                UC2: Herindicatie →
              </h2>
              <p className="text-blue-700 mb-4">
                Evalueer herindicatie-criteria met AI, genereer adviezen met
                bronplicht en exporteer naar DOCX/PDF.
              </p>
              <div className="mt-4 text-blue-600 font-medium">
                ✓ Actief - Klik om te starten
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Quick Start
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Upload dossierbestanden (CSV, PDF, DOCX)</li>
            <li>AI evalueert criteria op basis van VV7/VV8 framework</li>
            <li>Review en corrigeer via voice commands of inline editing</li>
            <li>Exporteer adviesrapport met bronnenbijlage</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
