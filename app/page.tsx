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
            AI-gedreven documentatie voor Meerzorg en Herindicatie
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              UC1: Meerzorg
            </h2>
            <p className="text-gray-600 mb-4">
              Genereer Meerzorg-aanvragen met AI-ondersteuning voor field mapping,
              validatie en evidence linking.
            </p>
            <div className="mt-4 p-4 bg-gray-100 rounded text-sm text-gray-500">
              Coming soon...
            </div>
          </div>

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
