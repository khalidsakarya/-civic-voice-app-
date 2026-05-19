import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

function Card({ title, desc, children }) {
  return (
    <div className="sn-trans-chart-card bg-white rounded-lg shadow-md p-5 mb-4">
      <h3 className="text-base font-bold text-gray-800 mb-0.5">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{desc}</p>
      {children}
    </div>
  );
}

/**
 * Renders one official economic metric chart panel (live Firestore series only).
 */
export default function EconomicModalMetricChart({
  chartKey,
  isUSA,
  budgetData,
  spendData,
  crimeDataM,
  crimeChartTitle,
  crimeChartDesc,
  crimeBarViolent,
  crimeBarProperty,
  formatCrimeTooltip,
  formatCrimeAxisTick,
  unempData,
  unempKeys,
  gdpDataM,
  povDataM,
  homelessData,
  onExpand,
}) {
  const TICK = { fontSize: 13, fill: '#4b5563' };
  const TT = {
    fontSize: '13px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  };
  const LEG = { fontSize: '13px', paddingTop: '10px' };
  const MARGIN = { top: 5, right: 24, left: 0, bottom: 5 };

  if (chartKey === 'budget' && budgetData.length > 0) {
    return (
      <Card title="Government Budget Distribution" desc="Share of total budget per spending category (%)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart layout="vertical" data={budgetData} margin={MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <YAxis dataKey="name" type="category" width={120} tick={TICK} />
            <XAxis type="number" tick={TICK} tickFormatter={(v) => `${v}%`} domain={[0, 'dataMax + 5']} />
            <Tooltip formatter={(v) => [`${v}%`, 'Budget Share']} contentStyle={TT} />
            <Bar dataKey="value" name="Budget Share" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {budgetData.map((e, i) => (
                <Cell key={i} fill={e.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <button
          type="button"
          onClick={() => onExpand('budget')}
          className="mt-3 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
        >
          View full screen
        </button>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-3">
          {budgetData.map((c) => (
            <span key={c.name} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span
                className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: c.color }}
              />
              {c.name}
            </span>
          ))}
        </div>
      </Card>
    );
  }

  if (chartKey === 'spending' && spendData.length > 0) {
    return (
      <Card title="Spending vs Budget" desc="Allocated vs actual spending per category ($M)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart layout="vertical" data={spendData} margin={MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <YAxis dataKey="category" type="category" width={90} tick={TICK} />
            <XAxis type="number" tick={TICK} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}B`} />
            <Tooltip formatter={(v) => [`$${v.toLocaleString()}M`, '']} contentStyle={TT} />
            <Legend verticalAlign="bottom" wrapperStyle={LEG} />
            <Bar dataKey="Allocated" fill="#6366f1" radius={[0, 3, 3, 0]} maxBarSize={18} />
            <Bar dataKey="Actual" fill="#10b981" radius={[0, 3, 3, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
        <button
          type="button"
          onClick={() => onExpand('spending')}
          className="mt-3 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
        >
          View full screen
        </button>
      </Card>
    );
  }

  if (chartKey === 'crime' && crimeDataM.length > 0) {
    return (
      <Card title={crimeChartTitle} desc={crimeChartDesc}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart layout="vertical" data={crimeDataM} margin={MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <YAxis dataKey="year" type="category" width={45} tick={TICK} />
            <XAxis type="number" tick={TICK} tickFormatter={formatCrimeAxisTick} />
            <Tooltip formatter={formatCrimeTooltip} contentStyle={TT} />
            <Legend verticalAlign="bottom" wrapperStyle={LEG} />
            <Bar dataKey={crimeBarViolent} fill="#ef4444" radius={[0, 3, 3, 0]} maxBarSize={18} />
            <Bar dataKey={crimeBarProperty} fill="#f59e0b" radius={[0, 3, 3, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
        <button
          type="button"
          onClick={() => onExpand('crime')}
          className="mt-3 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
        >
          View full screen
        </button>
      </Card>
    );
  }

  if (chartKey === 'unemployment' && unempData.length > 0 && unempKeys.length >= 2) {
    return (
      <Card title="Unemployment Rate" desc={`Annual rate (%) vs ${isUSA ? 'US' : 'CA'} national average`}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart layout="vertical" data={unempData} margin={MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <YAxis dataKey="year" type="category" width={45} tick={TICK} />
            <XAxis type="number" tick={TICK} tickFormatter={(v) => `${v}%`} domain={[0, 'dataMax + 1']} />
            <Tooltip formatter={(v) => [`${v}%`, '']} contentStyle={TT} />
            <Legend verticalAlign="bottom" wrapperStyle={LEG} />
            <Bar dataKey={unempKeys[0]} fill="#6366f1" radius={[0, 3, 3, 0]} maxBarSize={18} />
            <Bar dataKey={unempKeys[1]} fill="#9ca3af" radius={[0, 3, 3, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
        <button
          type="button"
          onClick={() => onExpand('unemployment')}
          className="mt-3 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
        >
          View full screen
        </button>
      </Card>
    );
  }

  if (chartKey === 'gdp' && gdpDataM.length > 0) {
    return (
      <Card title="GDP Growth Over Time" desc="Annual GDP growth rate (%) — green = growth, red = contraction">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart layout="vertical" data={gdpDataM} margin={MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <YAxis dataKey="year" type="category" width={45} tick={TICK} />
            <XAxis type="number" tick={TICK} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => [`${v}%`, 'GDP Growth']} contentStyle={TT} />
            <Bar dataKey="GDP Growth (%)" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {gdpDataM.map((e, i) => (
                <Cell key={i} fill={e['GDP Growth (%)'] >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <button
          type="button"
          onClick={() => onExpand('gdp')}
          className="mt-3 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
        >
          View full screen
        </button>
        <div className="flex gap-4 justify-center mt-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0 bg-emerald-500" /> Growth
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0 bg-red-500" /> Contraction
          </span>
        </div>
      </Card>
    );
  }

  if (chartKey === 'poverty' && povDataM.length > 0) {
    return (
      <Card title="Poverty Rate Trend" desc="Population living below the poverty line (%)">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart layout="vertical" data={povDataM} margin={MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <YAxis dataKey="year" type="category" width={45} tick={TICK} />
            <XAxis type="number" tick={TICK} tickFormatter={(v) => `${v}%`} domain={[0, 'dataMax + 2']} />
            <Tooltip formatter={(v) => [`${v}%`, 'Poverty Rate']} contentStyle={TT} />
            <Legend verticalAlign="bottom" wrapperStyle={LEG} />
            <Bar dataKey="Poverty Rate (%)" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
        <button
          type="button"
          onClick={() => onExpand('poverty')}
          className="mt-3 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
        >
          View full screen
        </button>
      </Card>
    );
  }

  if (chartKey === 'homeless' && homelessData.length > 0) {
    return (
      <Card title="Homelessness Statistics" desc="Sheltered vs unsheltered population">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart layout="vertical" data={homelessData} margin={MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <YAxis dataKey="year" type="category" width={45} tick={TICK} />
            <XAxis
              type="number"
              tick={TICK}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
            />
            <Tooltip formatter={(v, name) => [v.toLocaleString(), name]} contentStyle={TT} />
            <Legend verticalAlign="bottom" wrapperStyle={LEG} />
            <Bar dataKey="Sheltered" stackId="a" fill="#6366f1" maxBarSize={32} />
            <Bar dataKey="Unsheltered" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
        <button
          type="button"
          onClick={() => onExpand('homeless')}
          className="mt-3 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
        >
          View full screen
        </button>
      </Card>
    );
  }

  return null;
}

