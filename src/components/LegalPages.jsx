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

function PrivacyContent() {
  const sections = [
    {
      title: 'No account required',
      text: 'You can browse all public civic information on Civic Voice Canada without creating an account or providing any personal information.',
    },
    {
      title: 'What this app displays',
      text: 'Civic Voice Canada displays public and open-government information sourced from official government portals and public registries. This information is already publicly available. We do not add personal information about members of the public.',
    },
    {
      title: 'We do not sell personal information',
      text: 'Civic Voice Canada does not sell, rent, or trade any personal information to third parties, advertisers, or data brokers.',
    },
    {
      title: 'No political profiles or voting recommendations',
      text: 'This app does not build political profiles about users. It does not track your political views, infer your voting intentions, or make voting recommendations based on your usage.',
    },
    {
      title: 'Location information',
      text: 'If you choose to use location features, your general location (province or region) may be used temporarily to show relevant local information. Precise GPS coordinates are not stored. Location data is not shared with third parties and is not retained after your session ends.',
    },
    {
      title: 'Analytics, accounts, and notifications',
      text: 'Analytics, crash reporting, user accounts, push notifications, and email features are not currently enabled. If any of these are introduced in the future, this policy will be updated and users will be clearly informed before the feature is activated.',
    },
    {
      title: 'Correction and contact submissions',
      text: 'If you submit a correction request or contact us once the contact channel is available, any information you provide voluntarily — such as your name, email address, or description of an issue — will be used only to review and respond to your submission. It will not be used for marketing or shared with third parties.',
    },
    {
      title: 'Operator details',
      text: 'Operator details will be finalised before public launch. This policy will be updated at that time to include the legal name and contact information of the operator.',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm leading-relaxed">
          Civic Voice Canada is designed to be a low-data, privacy-respecting civic transparency tool.
          This page explains what information is and is not collected when you use the app.
        </p>
      </div>
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

function TermsContent() {
  const sections = [
    {
      title: 'Independent, non-government platform',
      text: 'Civic Voice Canada is an independent project. It is not affiliated with, endorsed by, or acting on behalf of any government body, political party, candidate, lobby group, or advocacy organization. Use of this platform does not constitute interaction with any government service.',
    },
    {
      title: 'Informational and educational use only',
      text: 'All content on this platform is provided for general informational and educational purposes only. By using this platform you agree not to rely on it as a substitute for professional advice of any kind.',
    },
    {
      title: 'No professional advice of any kind',
      text: 'Nothing on this platform constitutes legal advice, financial advice, investment advice, tax advice, voting guidance, political advice, or any other form of professional or regulated advice. Do not make legal, financial, investment, tax, voting, or political decisions based solely on content displayed here. Consult a qualified professional for advice relevant to your specific situation.',
    },
    {
      title: 'Verify important information with official sources',
      text: 'Data displayed here is sourced from official government portals but may be delayed, incomplete, filtered, or under review. Users are responsible for verifying any important information directly with the original official source before citing, sharing, or acting on it. Source links are provided wherever available.',
    },
    {
      title: 'Data accuracy limitations',
      text: 'Data may be delayed, incomplete, transformed for display, or pending refresh. Financial figures may differ from official publications due to rounding, reporting period differences, or filtering decisions. We make no warranties regarding the accuracy, completeness, or fitness for purpose of any content.',
    },
    {
      title: 'No corruption findings, legal conclusions, or endorsements',
      text: 'This platform does not make findings of corruption, legal violations, or wrongdoing about any individual or organisation. It does not endorse, oppose, or make voting recommendations about any political candidate, party, or policy. Descriptions of government programs and public spending are intended to be neutral and factual.',
    },
    {
      title: 'Acceptable use',
      text: 'You may use this platform for personal, research, journalistic, and educational purposes. You may not use it to harass individuals, manufacture false claims about public figures, or misrepresent the platform as an official government service.',
    },
    {
      title: 'Changes to these terms',
      text: 'These terms may be updated before or after public launch. Continued use of the platform after an update constitutes acceptance of the revised terms.',
    },
    {
      title: 'Operator details and governing law',
      text: 'Operator details and the governing province for these terms will be finalised before public launch.',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm leading-relaxed">
          By using Civic Voice Canada you agree to the following terms. Please read them before using the platform.
        </p>
      </div>
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

function AccessibilityContent() {
  const features = [
    'Interactive elements include accessible labels and ARIA attributes where practical.',
    'Colour contrast targets WCAG 2.1 AA minimum ratios for text and interactive components.',
    'Data tables and charts include labels or summary text where practical.',
    'Modal dialogs are dismissible by keyboard and include close buttons with accessible labels.',
    'The app is designed to work at standard browser zoom levels up to 200%.',
    'Touch targets on mobile are sized to meet minimum tap-area guidelines.',
  ];

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 text-sm leading-relaxed">
          Civic Voice Canada aims to be accessible to all users, including those using assistive
          technologies. We target WCAG 2.1/2.2 Level AA as our practical baseline.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 text-sm mb-3">
          Current accessibility features
        </h3>
        <div className="space-y-2">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-2.5">
              <span className="text-green-500 font-bold text-sm mt-0.5 flex-shrink-0">✓</span>
              <p className="text-gray-600 text-sm leading-relaxed">{f}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-1.5">Known limitations</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Some complex data visualisations — such as multi-series charts — may not be fully
          navigable by screen reader in all contexts. We are working to improve text alternatives
          and summaries for these sections. A formal accessibility review against the live app
          is planned before public launch.
        </p>
      </div>

      <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
        <p className="text-amber-800 font-semibold text-sm mb-1">Report an accessibility barrier</p>
        <p className="text-amber-700 text-sm leading-relaxed">
          If you encounter an accessibility barrier, we want to know about it. A public contact
          channel will be posted before public launch. Once available, accessibility reports will
          be reviewed and prioritised.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-gray-500 text-xs leading-relaxed">
          Accessibility conformance is an ongoing process. This statement will be updated as the
          app is reviewed and improved. Target standard: WCAG 2.1 Level AA, with reference to
          WCAG 2.2 where applicable.
        </p>
      </div>
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
    if (page === 'privacy') return <PrivacyContent />;
    if (page === 'terms') return <TermsContent />;
    if (page === 'accessibility') return <AccessibilityContent />;
    if (page === 'sources') return <SourcesContent />;
    if (page === 'disclaimer') return <DisclaimerContent />;
    if (page === 'contact') return <ContactContent />;
    return null;
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
