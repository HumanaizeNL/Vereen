import { OnboardingChat } from '@/components/onboarding/OnboardingChat';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'AI Onboarding Assistent - Vereen',
  description: 'Vind de juiste AI-oplossing voor uw organisatie met behulp van onze digitale assistent',
};

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navigation bar */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Terug naar Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://algoritmes.overheid.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
            >
              Algoritmeregister
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://aigovernance.vng.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
            >
              VNG AI Governance
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </nav>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col">
        <OnboardingChat />
      </main>

      {/* Footer with attribution */}
      <footer className="bg-white border-t py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>
            Gebaseerd op het{' '}
            <a
              href="https://algoritmes.overheid.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Algoritmeregister van de Nederlandse overheid
            </a>
          </p>
          <p>
            Governance volgens{' '}
            <a
              href="https://aigovernance.vng.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              VNG AI Governance Kennisbank
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
