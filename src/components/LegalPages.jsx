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

function SourceCard({ source }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-snug">{source.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{source.owner}</p>
        </div>
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
            aria-label={`Open official source: ${source.name}`}
          >
            Official source <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <div className="border-t border-gray-100 px-4 py-3 grid grid-cols-1 gap-2 bg-gray-50/60 text-xs">
        <Row label="Dataset / table" value={source.dataset} />
        <Row label="Reporting period" value={source.period} />
        <Row label="App use" value={source.use} />
        <Row label="Transformation" value={source.transform} />
        <Row label="Licence / terms" value={source.licence} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 w-32 flex-shrink-0">{label}</span>
      <span className="text-gray-700 leading-snug">{value}</span>
    </div>
  );
}

function SourcesContent() {
  const sources = [
    {
      name: 'Statistics Canada — Labour Force Survey',
      owner: 'Statistics Canada, Government of Canada',
      dataset: 'Table 14-10-0287-01 — Labour force characteristics by province, monthly',
      period: 'Monthly — most recent month available at time of update',
      use: 'Ontario unemployment rate displayed in the Economic & Social data section',
      transform: 'Ontario row extracted; latest month and 24-month series retained',
      licence: 'Statistics Canada Open Licence. Adapted from Statistics Canada data.',
      url: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1410028701',
    },
    {
      name: 'CRA Registered Charities Registry',
      owner: 'Canada Revenue Agency, Government of Canada',
      dataset: 'Registered charities identification file (ident_updated.csv) — open.canada.ca',
      period: 'Most recent T3010 filing year available at time of update',
      use: 'Ontario registered charities shown in the Tax Exempt / Charities section — organisation name, type, and category only',
      transform: 'Filtered to Ontario registrations. Director names not displayed. Financial values not displayed in this version.',
      licence: 'Open Government Licence – Canada',
      url: 'https://open.canada.ca/data/en/dataset/51c68b86-33f0-46fe-9b51-0a786d0088f5',
    },
    {
      name: 'Ontario Public Accounts — Detailed Schedule of Payments',
      owner: 'Government of Ontario, Ministry of Finance',
      dataset: 'Public Accounts: Detailed Schedule of Payments — data.ontario.ca',
      period: 'Fiscal year 2024-25 (April 2024 – March 2025)',
      use: 'Ontario transfer payments shown in the Transfer Payments section — top 100 recipients by amount',
      transform: 'Filtered to rows where Category = "Transfer Payments" only (8,592 of 15,571 total rows). Excludes vendor payments, travel expenses, statutory payments, salaries, and employee benefits. Top 100 by dollar amount retained.',
      licence: 'Ontario.ca Terms of Use. Not licensed under the Open Government Licence – Ontario.',
      url: 'https://data.ontario.ca/dataset/public-accounts-detailed-schedule-of-payments',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm leading-relaxed">
          Civic Voice Canada displays data from official government open-data portals and public registries.
          Each source is listed below with its dataset, reporting period, and any transformations applied.
          Always verify important information directly with the official source before citing or acting on it.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 text-sm mb-3 uppercase tracking-wide text-gray-500">
          Active sources — Canadian MVP
        </h3>
        <div className="space-y-4">
          {sources.map((s) => <SourceCard key={s.name} source={s} />)}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-gray-500 text-xs leading-relaxed">
          Additional Canadian federal, provincial, and territorial sources are under review for future
          releases. Data shown reflects the most recent fetch from each official source. It may not
          reflect updates published after the last fetch date.
        </p>
      </div>
    </div>
  );
}

function DisclaimerContent() {
  const sections = [
    {
      title: 'Independent and non-government',
      text: 'Civic Voice Canada is an independent, non-partisan project. It is not affiliated with, endorsed by, funded by, or acting on behalf of any government body, political party, candidate, lobby group, or advocacy organization at any level — federal, provincial, or municipal.',
    },
    {
      title: 'Informational purpose only',
      text: 'All content is provided for general informational and educational purposes only. Nothing on this platform constitutes legal advice, financial advice, investment advice, tax advice, or a voting recommendation of any kind. Do not rely on this platform as a substitute for advice from a qualified professional.',
    },
    {
      title: 'No government endorsement',
      text: 'The display of official government data, public records, or open-data content on this platform does not imply endorsement, approval, or affiliation by or with any government body, agency, or official whose information is shown.',
    },
    {
      title: 'Data may be delayed, incomplete, or transformed',
      text: 'Data is fetched periodically from official sources and may not reflect the most recent updates. Some data has been filtered, aggregated, or reformatted for display. Financial figures may differ from official publications due to rounding, reporting period differences, or filtering. Always refer to the original official source for authoritative figures.',
    },
    {
      title: 'Verify important information',
      text: 'Users are encouraged to verify any information displayed here directly with the official source before citing, sharing, or acting on it. Source links are provided wherever available. Civic Voice Canada accepts no liability for decisions made based on content displayed here.',
    },
    {
      title: 'No corruption findings, legal conclusions, or candidate endorsements',
      text: 'This platform does not make findings of corruption, wrongdoing, or legal violations about any individual or organization. It does not endorse, oppose, or make voting recommendations about any political candidate, party, or policy. Descriptions of legislation, government programs, and public spending are intended to be neutral and factual.',
    },
    {
      title: 'Accuracy and completeness',
      text: 'While every effort is made to display accurate and current information, we make no warranties regarding the completeness, reliability, accuracy, or fitness for a particular purpose of any content. Information may be out of date, incomplete, or subject to change without notice.',
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
  const fields = [
    {
      label: 'Affected page or section',
      detail: 'For example: "Ontario Transfer Payments" or "Economic & Social — Unemployment"',
    },
    {
      label: 'Data item',
      detail: 'The specific number, name, or statement you believe is wrong',
    },
    {
      label: 'Issue description',
      detail: 'What is incorrect and why — be as specific as possible',
    },
    {
      label: 'Official source or evidence',
      detail: 'A link to an official government source, publication, or dataset that shows the correct information (if available)',
    },
    {
      label: 'Your contact information (optional)',
      detail: 'Only needed if you would like a response. Anonymous corrections are accepted.',
    },
  ];

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
        <p className="text-amber-800 font-semibold text-sm mb-1">Correction request channel</p>
        <p className="text-amber-700 text-sm leading-relaxed">
          Correction request channel pending before public launch.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 text-sm mb-3">
          What to include in a correction request
        </h3>
        <p className="text-gray-500 text-xs mb-3 leading-relaxed">
          When the channel is available, please include as much of the following as possible:
        </p>
        <div className="space-y-3">
          {fields.map(({ label, detail }) => (
            <div key={label} className="border border-gray-200 rounded-lg px-4 py-3">
              <p className="font-medium text-gray-800 text-sm">{label}</p>
              <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
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
