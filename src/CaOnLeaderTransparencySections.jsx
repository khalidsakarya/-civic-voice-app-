import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ROWS = [
  { label: 'Status',                    value: 'Filed',                          color: 'text-green-700' },
  { label: 'Coverage',                  value: '124 / 124 MPPs',                 color: 'text-gray-800' },
  { label: 'Latest period',             value: 'Fall 2024',                      color: 'text-gray-800' },
  { label: 'Public values',             value: 'Not machine-readable',           color: 'text-amber-700' },
  { label: 'Doug Ford-specific values', value: 'Requires manual portal review',  color: 'text-orange-700' },
];

export function CaOnFinancialDisclosure() {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <div
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <p className="panel-section-label">Financial Disclosure</p>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
          {ROWS.map(({ label, value, color }, i) => (
            <div
              key={label}
              className={`flex items-center justify-between px-4 py-3 ${i < ROWS.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <span className="text-sm text-gray-500">{label}</span>
              <span className={`text-sm font-semibold ${color}`}>{value}</span>
            </div>
          ))}
          <div className="px-4 py-2.5 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
            <span className="text-xs text-blue-600">Source: OICO · pds.oico.on.ca</span>
            <a
              href="https://pds.oico.on.ca/Pages/Public/PublicDisclosures.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Open portal →
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
