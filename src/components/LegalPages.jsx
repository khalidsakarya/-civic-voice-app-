import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const LEGAL_PAGES = {
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How we handle your information',
    icon: '🔒',
  },
  terms: {
    title: 'Terms of Use',
    subtitle: 'Conditions for using Civic Voice Canada',
    icon: '📋',
  },
  accessibility: {
    title: 'Accessibility',
    subtitle: 'Our commitment to accessible design',
    icon: '♿',
  },
  sources: {
    title: 'Data Sources',
    subtitle: 'Where our information comes from',
    icon: '📊',
  },
  disclaimer: {
    title: 'Disclaimer',
    subtitle: 'Important information about this platform',
    icon: 'ℹ️',
  },
  contact: {
    title: 'Contact & Corrections',
    subtitle: 'Report incorrect data or get in touch',
    icon: '✉️',
  },
};

function PlaceholderPage({ title }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
      <p className="text-amber-800 font-medium text-base mb-1">{title} — Coming Soon</p>
      <p className="text-amber-700 text-sm">This page is being prepared for the Canadian MVP launch.</p>
    </div>
  );
}

function SourcesContent() {
  const sources = [
    {
      name: 'Statistics Canada — Labour Force Survey',
      use: 'Provincial unemployment rates and labour force data',
      licence: 'Statistics Canada Open Licence',
      url: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
    },
    {
      name: 'Canada Revenue Agency — Registered Charities Registry',
      use: 'Ontario registered charities — name, type, and category',
      licence: 'Open Government Licence – Canada',
      url: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
    },
    {
      name: 'Government of Ontario — Public Accounts: Detailed Schedule of Payments',
      use: 'Ontario transfer payments to organisations and agencies (FY 2024-25)',
      licence: 'Ontario.ca Terms of Use',
      url: 'https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm leading-relaxed">
          Civic Voice Canada displays data from official government open-data portals and public registries.
          Source links and reporting periods are shown where practical. We encourage users to verify
          important information directly with the original source before citing or acting on it.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 text-base mb-3">Active Data Sources — Canadian MVP</h3>
        <div className="space-y-4">
          {sources.map((s) => (
            <div key={s.name} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                  <p className="text-gray-600 text-xs mt-1">{s.use}</p>
                  <p className="text-gray-400 text-xs mt-1">Licence: {s.licence}</p>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                  aria-label={`Open source: ${s.name}`}
                >
                  Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-gray-600 text-xs leading-relaxed">
          Additional Canadian federal, provincial, and territorial data sources are under review for
          future releases. All data displayed reflects the most recent fetch from each official source
          at the reporting period shown. Data may not reflect updates published after the last fetch date.
        </p>
      </div>
    </div>
  );
}

function DisclaimerContent() {
  const sections = [
    {
      title: 'Independence',
      text: 'Civic Voice Canada is an independent, non-partisan project. It is not affiliated with, endorsed by, or funded by any government body, political party, candidate, lobby group, or advocacy organization.',
    },
    {
      title: 'Sources & Data',
      text: 'Information is sourced from publicly available government records and official open-data portals. Where live data is unavailable, content may be illustrative or estimated for educational purposes. Always refer to official government publications for authoritative figures.',
    },
    {
      title: 'Informational Purpose Only',
      text: 'All content is provided for general informational and educational purposes only. Nothing on this platform constitutes legal, financial, tax, or political advice. Consult qualified professionals before making decisions based on information presented here.',
    },
    {
      title: 'Accuracy & Completeness',
      text: 'While every effort is made to ensure information is accurate and current, we make no warranties regarding completeness, reliability, or fitness for a particular purpose. Information may be out of date or subject to change without notice.',
    },
    {
      title: 'No Political Advocacy',
      text: 'This platform does not endorse, promote, or oppose any political party, candidate, government policy, or ideology. Descriptions of legislation, programs, and government activities are intended to be neutral and factual.',
    },
    {
      title: 'AI-Generated Content',
      text: 'Some content may be generated or summarized using artificial intelligence tools. AI-generated summaries may contain errors or omissions and should not be relied upon as authoritative statements of fact.',
    },
  ];

  return (
    <div className="space-y-5">
      {sections.map(({ title, text }, i) => (
        <div key={title} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
          <h3 className="font-semibold text-gray-800 text-sm mb-1.5">
            <span className="text-gray-400 font-normal mr-1.5">{i + 1}.</span>{title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  );
}

function ContactContent() {
  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm leading-relaxed">
          If you believe any information displayed in Civic Voice Canada is inaccurate, outdated,
          or misleading, we welcome corrections and feedback from the public, researchers, journalists,
          and government representatives. Factual errors will be reviewed and corrected promptly
          upon verification.
        </p>
      </div>

      <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
        <p className="text-amber-800 font-medium text-sm mb-1">Correction Request Channel</p>
        <p className="text-amber-700 text-sm">
          Correction request channel pending before public launch.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 text-sm mb-2">What to include in a correction request</h3>
        <ul className="space-y-2">
          {[
            'The specific data point or statement you believe is incorrect',
            'The correct information, with a link to an official source if available',
            'The page or section of the app where you found it',
            'Your name (optional) — anonymous corrections are also accepted',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function LegalPageOverlay({ page, onClose }) {
  const meta = LEGAL_PAGES[page];
  if (!meta) return null;

  const renderContent = () => {
    if (page === 'sources') return <SourcesContent />;
    if (page === 'disclaimer') return <DisclaimerContent />;
    if (page === 'contact') return <ContactContent />;
    return <PlaceholderPage title={meta.title} />;
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white w-full max-w-lg mx-4 my-8 rounded-2xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-2xl px-6 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">{meta.icon}</span>
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{meta.title}</h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 ml-8">{meta.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors ml-4"
            aria-label={`Close ${meta.title}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 pb-8">
          {renderContent()}
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 border-t border-gray-100 rounded-b-2xl bg-gray-50">
          <p className="text-xs text-gray-400 text-center">
            Civic Voice Canada · Independent civic transparency platform
          </p>
        </div>
      </div>
    </div>
  );
}
