export default function UC2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                UC2: Herindicatie
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Criteria-evaluatie met AI en bronplicht
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select className="px-4 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">Selecteer cliënt...</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                Opslaan
              </button>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
