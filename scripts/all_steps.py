"""
All-in-one script to replace 4 analytics render functions with shared helper.
"""
import re

path = r'C:\Users\jem91\civic-voice-app\src\App.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)
print(f"Original file length: {original_len}")

# ================================================================
# STEP 1: Insert helper function + keep renderUSAnalytics signature
# ================================================================

HELPER = """\
  // Shared Government Stats Page Renderer
  const renderGovernmentStatsPage = (d) => {
    const spendingColors = ['bg-purple-500','bg-blue-500','bg-yellow-500','bg-red-500','bg-green-500','bg-orange-500','bg-gray-500','bg-teal-500','bg-pink-500','bg-indigo-500','bg-lime-500','bg-cyan-500','bg-rose-500','bg-amber-500','bg-sky-500'];
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => setView(d.backView)} className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
              <span className="sm:hidden">\u2190 Back</span><span className="hidden sm:inline">\u2190 Back to {d.backLabel}</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Important Government Stats</h1>
            <div className="w-20"></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {analyticsLoading[d.cc] ? (
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
              <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              Fetching latest data...
            </div>
          ) : analyticsLastUpdated[d.cc] ? (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
              <span>\u2713</span>
              Last updated: {analyticsLastUpdated[d.cc].toLocaleString()}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4">
              <span>\U0001f4cb</span>
              Showing sample data
            </div>
          )}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{d.overviewTitle}</h2>
            <p className="text-gray-600">{d.overviewSub}</p>
          </div>

          {/* Revenue Sources */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Revenue Sources ({d.summaryRevenue})
            </h3>
            <p className="text-gray-600 mb-4">Where the government gets its money</p>
            <div className="space-y-3">
              {d.revenue.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{item.source}</span>
                    <span className="font-bold text-gray-800">{d.currency}{item.amount}B ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{width: `${item.percentage}%`}} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-red-800 font-bold">\u26a0\ufe0f Budget Deficit: {d.deficitDisplay}</p>
              <p className="text-sm text-red-700">{d.deficitSub}</p>
            </div>
          </div>

          {/* Spending by Category */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Spending by Category ({d.summarySpending})
            </h3>
            <p className="text-gray-600 mb-4">Where your tax dollars go</p>
            <div className="space-y-3">
              {d.spending.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{item.category}</span>
                    <span className="font-bold text-gray-800">{d.currency}{item.amount}B ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`h-3 rounded-full ${spendingColors[index % spendingColors.length]}`} style={{width: `${item.percentage}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deficit History */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              Budget Deficit History (2014\u20132024)
            </h3>
            <p className="text-gray-600 mb-4">Annual budget deficits over the past decade</p>
            <div className="space-y-2">
              {d.deficitHistory.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium w-16">{item.year}</span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className={`h-6 rounded-full ${Math.abs(item.deficit) > d.deficitMax * 0.6 ? 'bg-red-700' : Math.abs(item.deficit) > d.deficitMax * 0.3 ? 'bg-red-500' : 'bg-red-400'}`}
                        style={{width: `${Math.min((Math.abs(item.deficit) / d.deficitMax) * 100, 100)}%`}}
                      />
                    </div>
                  </div>
                  <span className="font-bold text-red-600 w-32 text-right">-{d.currency}{Math.abs(item.deficit)}B</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <p className="text-sm text-yellow-800"><strong>Note:</strong> {d.deficitNote}</p>
            </div>
          </div>

          {/* National Debt History */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              National Debt Growth (2014\u20132024)
            </h3>
            <p className="text-gray-600 mb-4">Total accumulated government debt over time</p>
            <div className="space-y-2">
              {d.debtHistory.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium w-16">{item.year}</span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div className="bg-orange-500 h-6 rounded-full" style={{width: `${(item.debt / d.debtMax) * 100}%`}} />
                    </div>
                  </div>
                  <span className="font-bold text-orange-600 w-32 text-right">{d.currency}{item.debt}T</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-400 rounded-lg">
              <p className="text-orange-800 font-bold">{d.debtNote}</p>
              <p className="text-sm text-orange-700 mt-1">{d.debtNoteSub}</p>
            </div>
          </div>

          {/* Unemployment Trends */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              Unemployment Rate Trends (2020\u20132024)
            </h3>
            <p className="text-gray-600 mb-4">National unemployment rate over the past 5 years</p>
            <div className="space-y-3">
              {d.unemploymentTrends.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-gray-800 font-bold text-lg">{item.year}</span>
                      <span className="text-gray-600 text-sm ml-3">{item.context}</span>
                    </div>
                    <span className={`text-2xl font-bold ${item.rate < 4 ? 'text-green-600' : item.rate < 6 ? 'text-yellow-600' : 'text-red-600'}`}>{item.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className={`h-4 rounded-full ${item.rate < 4 ? 'bg-green-500' : item.rate < 6 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${(item.rate / 10) * 100}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Foreign Aid by Country */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              Foreign Aid by Country (Top Recipients)
            </h3>
            <p className="text-gray-600 mb-4">International development assistance and humanitarian aid</p>
            <div className="space-y-3">
              {d.foreignAid.map((item, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <span className="text-gray-800 font-bold">{index + 1}. {item.country}</span>
                      <p className="text-sm text-gray-600">{item.purpose}</p>
                    </div>
                    <span className="font-bold text-blue-600 ml-4">{d.currency}{item.amount}B</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <p className="text-blue-800 font-bold">Total Foreign Aid: {d.aidTotal}</p>
            </div>
          </div>

          {/* Active Loans to Foreign Governments */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Active Loans to Foreign Governments
            </h3>
            <p className="text-gray-600 mb-4">Loans extended to foreign nations (expected to be repaid)</p>
            <div className="space-y-3">
              {d.foreignLoans.map((item, index) => (
                <div key={index} className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <span className="text-gray-800 font-bold text-lg">{item.country}</span>
                      <p className="text-sm text-gray-600 mt-1">{item.purpose}</p>
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded mt-1 inline-block">{item.status}</span>
                    </div>
                    <span className="font-bold text-green-600 text-xl ml-4">{d.currency}{item.amount}B</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grant Spending by Department */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-600" />
              Grant Spending by Department
            </h3>
            <p className="text-gray-600 mb-4">How much each department distributes in grants</p>
            <div className="space-y-3">
              {d.grantsByDepartment.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{item.department}</span>
                    <span className="font-bold text-gray-800">{d.currency}{item.grants}B ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full" style={{width: `${item.percentage}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Spending Trends */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Department Spending Trends (2020\u20132024)
            </h3>
            <p className="text-gray-600 mb-4">How spending has changed in major departments</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-2 text-gray-700">{d.deptHeaders[0]}</th>
                    <th className="text-right py-2 px-2 text-red-700">{d.deptHeaders[1]}</th>
                    <th className="text-right py-2 px-2 text-blue-700">{d.deptHeaders[2]}</th>
                    <th className="text-right py-2 px-2 text-green-700">{d.deptHeaders[3]}</th>
                    <th className="text-right py-2 px-2 text-purple-700">{d.deptHeaders[4]}</th>
                  </tr>
                </thead>
                <tbody>
                  {d.departmentTrends.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2 px-2 font-medium text-gray-800">{item.year}</td>
                      <td className="text-right py-2 px-2 text-red-600">{d.currency}{item.col1}B</td>
                      <td className="text-right py-2 px-2 text-blue-600">{d.currency}{item.col2}B</td>
                      <td className="text-right py-2 px-2 text-green-600">{d.currency}{item.col3}B</td>
                      <td className="text-right py-2 px-2 text-purple-600">{d.currency}{item.col4}B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-700 mb-2">Total Revenue</p>
              <p className="text-4xl font-bold text-green-700">{d.summaryRevenue}</p>
              <p className="text-xs text-gray-600 mt-2">FY 2024\u201325</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-700 mb-2">Total Spending</p>
              <p className="text-4xl font-bold text-red-700">{d.summarySpending}</p>
              <p className="text-xs text-gray-600 mt-2">FY 2024\u201325</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-400 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-700 mb-2">National Debt</p>
              <p className="text-4xl font-bold text-orange-700">{d.summaryDebt}</p>
              <p className="text-xs text-gray-600 mt-2">As of 2024</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // US Budget Analytics Render Function
  const renderUSAnalytics = () => {\
"""

# The anchor to find
ANCHOR = "  // US Budget Analytics Render Function\n  const renderUSAnalytics = () => {"

if ANCHOR in content:
    content = content.replace(ANCHOR, HELPER, 1)
    print("STEP 1 (helper insert): OK")
else:
    print("STEP 1: ANCHOR NOT FOUND")
    import sys; sys.exit(1)

# ================================================================
# STEP 2: Replace body of renderUSAnalytics
# Find from just after the signature to just before // Supreme Court
# ================================================================

US_BODY_NEW = """\
    return renderGovernmentStatsPage({
      cc: 'US',
      backView: 'categories',
      backLabel: 'Government Levels',
      currency: '$',
      overviewTitle: '\U0001f4ca Federal Budget Overview (FY 2024)',
      overviewSub: 'Comprehensive analysis of the $6.5 trillion US federal budget',
      revenue: [
        { source: 'Individual Income Tax', amount: 2400, percentage: 49 },
        { source: 'Payroll Taxes (SS/Medicare)', amount: 1700, percentage: 35 },
        { source: 'Corporate Income Tax', amount: 530, percentage: 11 },
        { source: 'Customs & Excise Taxes', amount: 155, percentage: 3 },
        { source: 'Estate & Gift Taxes', amount: 45, percentage: 1 },
        { source: 'Other Revenue', amount: 70, percentage: 1 },
      ],
      deficitDisplay: '$1.7 Trillion',
      deficitSub: 'Government spends $1.7T more than it collects (borrowed money)',
      spending: [
        { category: 'Social Security', amount: 1350, percentage: 21 },
        { category: 'Medicare', amount: 839, percentage: 13 },
        { category: 'Defense (DOD)', amount: 842, percentage: 13 },
        { category: 'Interest on National Debt', amount: 658, percentage: 10 },
        { category: 'Medicaid', amount: 616, percentage: 9 },
        { category: 'Income Security (SNAP, Unemployment)', amount: 505, percentage: 8 },
        { category: 'Veterans Benefits', amount: 301, percentage: 5 },
        { category: 'Education & Training', amount: 305, percentage: 5 },
        { category: 'Transportation', amount: 108, percentage: 2 },
        { category: 'Agriculture', amount: 151, percentage: 2 },
        { category: 'Other Spending', amount: 825, percentage: 12 },
      ],
      deficitHistory: [
        { year: 2014, deficit: -485 },
        { year: 2015, deficit: -438 },
        { year: 2016, deficit: -585 },
        { year: 2017, deficit: -665 },
        { year: 2018, deficit: -779 },
        { year: 2019, deficit: -984 },
        { year: 2020, deficit: -3132 },
        { year: 2021, deficit: -2772 },
        { year: 2022, deficit: -1375 },
        { year: 2023, deficit: -1695 },
        { year: 2024, deficit: -1700 },
      ],
      deficitMax: 3200,
      deficitNote: '2020-2021 saw historic deficits due to COVID-19 pandemic response spending.',
      debtHistory: [
        { year: 2014, debt: 17.8 },
        { year: 2015, debt: 18.2 },
        { year: 2016, debt: 19.6 },
        { year: 2017, debt: 20.2 },
        { year: 2018, debt: 21.5 },
        { year: 2019, debt: 22.7 },
        { year: 2020, debt: 27.7 },
        { year: 2021, debt: 28.4 },
        { year: 2022, debt: 30.9 },
        { year: 2023, debt: 33.2 },
        { year: 2024, debt: 34.5 },
      ],
      debtMax: 35,
      debtNote: '\U0001f4c8 Current National Debt: $34.5 Trillion',
      debtNoteSub: 'Interest payments: $658 billion per year (10% of budget)',
      unemploymentTrends: [
        { year: 2020, rate: 8.1, context: 'COVID-19 Pandemic' },
        { year: 2021, rate: 5.4, context: 'Economic Recovery' },
        { year: 2022, rate: 3.6, context: 'Strong Job Market' },
        { year: 2023, rate: 3.7, context: 'Stable Employment' },
        { year: 2024, rate: 4.1, context: 'Current Rate' },
      ],
      foreignAid: [
        { country: 'Ukraine', amount: 44.2, purpose: 'Military and humanitarian aid' },
        { country: 'Israel', amount: 3.8, purpose: 'Military assistance' },
        { country: 'Afghanistan', amount: 3.3, purpose: 'Humanitarian assistance' },
        { country: 'Jordan', amount: 1.7, purpose: 'Economic and military aid' },
        { country: 'Syria', amount: 1.9, purpose: 'Humanitarian assistance' },
        { country: 'Egypt', amount: 1.4, purpose: 'Military and economic support' },
        { country: 'Ethiopia', amount: 1.4, purpose: 'Humanitarian and development' },
        { country: 'Nigeria', amount: 1.2, purpose: 'Security and health programs' },
        { country: 'South Sudan', amount: 1.1, purpose: 'Humanitarian relief' },
        { country: 'Kenya', amount: 1.1, purpose: 'Security and development' },
      ],
      aidTotal: '~$61 Billion (1% of budget)',
      foreignLoans: [
        { country: 'Ukraine', amount: 61.4, purpose: 'Economic stabilization and reconstruction', status: 'Active' },
        { country: 'Pakistan', amount: 6.8, purpose: 'Economic development', status: 'Active' },
        { country: 'Iraq', amount: 4.5, purpose: 'Infrastructure reconstruction', status: 'Active' },
        { country: 'Colombia', amount: 3.2, purpose: 'Counter-narcotics and security', status: 'Active' },
        { country: 'Jordan', amount: 2.6, purpose: 'Budget support and development', status: 'Active' },
        { country: 'Philippines', amount: 2.1, purpose: 'Infrastructure development', status: 'Active' },
        { country: 'Tunisia', amount: 1.8, purpose: 'Economic reform support', status: 'Active' },
        { country: 'Lebanon', amount: 1.5, purpose: 'Economic assistance', status: 'Active' },
      ],
      grantsByDepartment: [
        { department: 'Health & Human Services', grants: 1200, percentage: 45 },
        { department: 'Treasury', grants: 890, percentage: 33 },
        { department: 'Defense', grants: 420, percentage: 16 },
        { department: 'Veterans Affairs', grants: 125, percentage: 5 },
        { department: 'Agriculture', grants: 124, percentage: 5 },
        { department: 'Transportation', grants: 78, percentage: 3 },
        { department: 'Education', grants: 68, percentage: 3 },
        { department: 'Housing & Urban Development', grants: 59, percentage: 2 },
        { department: 'State Department', grants: 42, percentage: 2 },
        { department: 'Energy', grants: 28, percentage: 1 },
      ],
      departmentTrends: [
        { year: 2020, col1: 714, col2: 1495, col3: 102, col4: 220 },
        { year: 2021, col1: 753, col2: 1622, col3: 238, col4: 240 },
        { year: 2022, col1: 766, col2: 1639, col3: 79,  col4: 273 },
        { year: 2023, col1: 816, col2: 1686, col3: 90,  col4: 296 },
        { year: 2024, col1: 842, col2: 1700, col3: 79,  col4: 301 },
      ],
      deptHeaders: ['Year', 'Defense', 'Health & Human Services', 'Education', 'Veterans Affairs'],
      summaryRevenue: '$4.9T',
      summarySpending: '$6.5T',
      summaryDebt: '$34.5T',
    });
  };\
"""

# Use regex to find and replace everything from after the signature to just before Supreme Court comment
# Pattern: from "const renderUSAnalytics = () => {" to "  // Supreme Court Render Functions"
# We already replaced the signature to include the old body text, so let's find the right content.
# After step 1, the file has:
#   ...HELPER...
#   // US Budget Analytics Render Function
#   const renderUSAnalytics = () => {
#     if (!usAnalyticsData) ...
#     ... (old body) ...
#   };
#
#   // Supreme Court Render Functions

# Find the old body of renderUSAnalytics - between the signature and the Supreme Court comment
sig = "  // US Budget Analytics Render Function\n  const renderUSAnalytics = () => {"
sc_comment = "  // Supreme Court Render Functions"

sig_pos = content.find(sig)
sc_pos = content.find(sc_comment, sig_pos)

if sig_pos == -1:
    print("STEP 2: Signature not found!")
    import sys; sys.exit(1)
if sc_pos == -1:
    print("STEP 2: Supreme Court comment not found!")
    import sys; sys.exit(1)

print(f"sig_pos={sig_pos}, sc_pos={sc_pos}")

# The old US function goes from sig_pos to just before sc_pos
# We want to replace from after the signature "{" to just before "\n\n  // Supreme Court"
# Old content between: everything from sig+len to sc_pos
after_sig = sig_pos + len(sig)

# Find the closing "  };\n\n" before sc_pos
# The closing of renderUSAnalytics should be "  };\n" followed by blank line then sc_comment
# Let's find the last "  };\n" before sc_pos
old_body_end = content.rfind("\n  };\n\n", after_sig, sc_pos)
if old_body_end == -1:
    # try without double newline
    old_body_end = content.rfind("\n  };\n", after_sig, sc_pos)
    if old_body_end == -1:
        print("STEP 2: Could not find end of renderUSAnalytics")
        import sys; sys.exit(1)

print(f"old_body_end={old_body_end}")
print(f"Snippet near old_body_end: {repr(content[old_body_end:old_body_end+30])}")

# Replace from after_sig (i.e., content[after_sig:old_body_end+len("  };\n")]) with new body
old_body = content[after_sig:sc_pos]
print(f"Old body starts: {repr(old_body[:80])}")

new_full_us = "\n" + US_BODY_NEW + "\n\n"
content = content[:after_sig] + new_full_us + content[sc_pos:]
print("STEP 2 (US body): OK")

# ================================================================
# STEP 3: Replace renderAnalytics (Canada)
# ================================================================

CA_NEW = """  const renderAnalytics = () => renderGovernmentStatsPage({
    cc: 'CA',
    backView: 'categories',
    backLabel: 'Government Levels',
    currency: 'C$',
    overviewTitle: '\U0001f4ca Canadian Federal Budget Overview (FY 2024\u201325)',
    overviewSub: 'Comprehensive analysis of the C$521 billion Canadian federal budget',
    revenue: [
      { source: 'Personal Income Tax', amount: 217, percentage: 45 },
      { source: 'Corporate Income Tax', amount: 76, percentage: 16 },
      { source: 'GST / Sales Tax', amount: 53, percentage: 11 },
      { source: 'EI Premiums', amount: 28, percentage: 6 },
      { source: 'Excise & Customs', amount: 40, percentage: 8 },
      { source: 'Other Revenue', amount: 67, percentage: 14 },
    ],
    deficitDisplay: 'C$40 Billion',
    deficitSub: 'Government spends C$40B more than it collects (borrowed money)',
    spending: [
      { category: 'Elderly Benefits (OAS/GIS)', amount: 72, percentage: 14 },
      { category: 'Health Transfers to Provinces', amount: 54, percentage: 10 },
      { category: 'Employment Insurance', amount: 26, percentage: 5 },
      { category: 'National Defence', amount: 40, percentage: 8 },
      { category: "Children's Benefits (CCB)", amount: 27, percentage: 5 },
      { category: 'Debt Servicing', amount: 47, percentage: 9 },
      { category: 'Indigenous Services', amount: 23, percentage: 4 },
      { category: 'Other Programs', amount: 232, percentage: 45 },
    ],
    deficitHistory: [
      { year: 2014, deficit: -5.5 },
      { year: 2015, deficit: -3 },
      { year: 2016, deficit: -17.8 },
      { year: 2017, deficit: -19.9 },
      { year: 2018, deficit: -14.1 },
      { year: 2019, deficit: -14.1 },
      { year: 2020, deficit: -327.7 },
      { year: 2021, deficit: -113.8 },
      { year: 2022, deficit: -43.0 },
      { year: 2023, deficit: -35.3 },
      { year: 2024, deficit: -40.1 },
    ],
    deficitMax: 330,
    deficitNote: '2020-2021 saw historic deficits due to COVID-19 pandemic emergency response spending.',
    debtHistory: [
      { year: 2014, debt: 0.61 },
      { year: 2015, debt: 0.62 },
      { year: 2016, debt: 0.63 },
      { year: 2017, debt: 0.65 },
      { year: 2018, debt: 0.67 },
      { year: 2019, debt: 0.68 },
      { year: 2020, debt: 1.04 },
      { year: 2021, debt: 1.14 },
      { year: 2022, debt: 1.17 },
      { year: 2023, debt: 1.22 },
      { year: 2024, debt: 1.26 },
    ],
    debtMax: 1.3,
    debtNote: '\U0001f4c8 Current Federal Net Debt: C$1.26 Trillion',
    debtNoteSub: 'Debt servicing costs: C$47 billion per year (9% of budget)',
    unemploymentTrends: [
      { year: 2020, rate: 9.5, context: 'COVID-19 Pandemic' },
      { year: 2021, rate: 7.5, context: 'Economic Recovery' },
      { year: 2022, rate: 5.3, context: 'Strong Job Market' },
      { year: 2023, rate: 5.7, context: 'Rate Rising' },
      { year: 2024, rate: 6.3, context: 'Current Rate' },
    ],
    foreignAid: [
      { country: 'Ukraine', amount: 3.8, purpose: 'Military and humanitarian support' },
      { country: 'Ethiopia', amount: 0.23, purpose: 'Food security and development' },
      { country: 'Haiti', amount: 0.15, purpose: 'Humanitarian assistance' },
      { country: 'Bangladesh', amount: 0.12, purpose: 'Climate resilience and development' },
      { country: 'Jordan', amount: 0.11, purpose: 'Refugee support and stabilization' },
      { country: 'Nigeria', amount: 0.10, purpose: 'Health systems and governance' },
      { country: 'Ghana', amount: 0.09, purpose: 'Economic growth programs' },
      { country: 'Pakistan', amount: 0.08, purpose: 'Flood relief and recovery' },
    ],
    aidTotal: '~C$7.7 Billion (1.5% of budget)',
    foreignLoans: [
      { country: 'Ukraine', amount: 2.4, purpose: 'Reconstruction and economic stabilization', status: 'Active' },
      { country: 'Jamaica', amount: 0.18, purpose: 'Infrastructure development', status: 'Active' },
      { country: 'Colombia', amount: 0.14, purpose: 'Security and development programs', status: 'Active' },
      { country: 'Indonesia', amount: 0.12, purpose: 'Climate adaptation projects', status: 'Active' },
    ],
    grantsByDepartment: [
      { department: 'Employment & Social Dev', grants: 87, percentage: 38 },
      { department: 'Health Canada', grants: 62, percentage: 27 },
      { department: 'Indigenous Services Canada', grants: 28, percentage: 12 },
      { department: 'Infrastructure Canada', grants: 14, percentage: 6 },
      { department: 'Natural Resources Canada', grants: 12, percentage: 5 },
      { department: 'Agriculture Canada', grants: 9, percentage: 4 },
      { department: 'Innovation, Science & Industry', grants: 8, percentage: 3 },
      { department: 'Environment & Climate Change', grants: 6, percentage: 3 },
      { department: 'Transport Canada', grants: 4, percentage: 2 },
    ],
    departmentTrends: [
      { year: 2020, col1: 24, col2: 110, col3: 18, col4: 22 },
      { year: 2021, col1: 25, col2: 122, col3: 20, col4: 25 },
      { year: 2022, col1: 28, col2: 105, col3: 22, col4: 23 },
      { year: 2023, col1: 35, col2: 108, col3: 24, col4: 23 },
      { year: 2024, col1: 40, col2: 112, col3: 26, col4: 23 },
    ],
    deptHeaders: ['Year', 'National Defence', 'Employment & Social Dev', 'Health Canada', 'Indigenous Services'],
    summaryRevenue: 'C$481B',
    summarySpending: 'C$521B',
    summaryDebt: 'C$1.26T',
  });

"""

# Find renderAnalytics (Canada) - it starts with "  const renderAnalytics = () => {"
# and ends at "  const renderContracts = () => ("
ca_sig = "  const renderAnalytics = () => {"
ca_end = "  const renderContracts = () => ("

ca_pos = content.find(ca_sig)
ca_end_pos = content.find(ca_end, ca_pos)

if ca_pos == -1:
    print("STEP 3: renderAnalytics not found!")
    import sys; sys.exit(1)
if ca_end_pos == -1:
    print("STEP 3: renderContracts not found!")
    import sys; sys.exit(1)

print(f"CA: ca_pos={ca_pos}, ca_end_pos={ca_end_pos}")
content = content[:ca_pos] + CA_NEW + content[ca_end_pos:]
print("STEP 3 (Canada analytics): OK")

# ================================================================
# STEP 4: Replace renderUKAnalytics
# ================================================================

UK_NEW = """  const renderUKAnalytics = () => renderGovernmentStatsPage({
    cc: 'UK',
    backView: 'uk-national',
    backLabel: 'Westminster',
    currency: '\u00a3',
    overviewTitle: '\U0001f4ca UK Government Budget Overview (FY 2024\u201325)',
    overviewSub: 'Comprehensive analysis of the \u00a31.19 trillion UK public sector budget',
    revenue: [
      { source: 'Income Tax', amount: 273, percentage: 29 },
      { source: 'National Insurance', amount: 175, percentage: 19 },
      { source: 'VAT', amount: 169, percentage: 18 },
      { source: 'Corporation Tax', amount: 103, percentage: 11 },
      { source: 'Fuel & Excise Duty', amount: 48, percentage: 5 },
      { source: 'Other Taxes & Revenue', amount: 159, percentage: 17 },
    ],
    deficitDisplay: '\u00a3122 Billion',
    deficitSub: 'Government spends \u00a3122B more than it collects (borrowed money)',
    spending: [
      { category: 'Social Protection (DWP)', amount: 280, percentage: 24 },
      { category: 'Health (NHS England)', amount: 225, percentage: 19 },
      { category: 'Education', amount: 109, percentage: 9 },
      { category: 'Debt Interest', amount: 96, percentage: 8 },
      { category: 'Housing & Local Government', amount: 81, percentage: 7 },
      { category: 'Defence', amount: 52, percentage: 4 },
      { category: 'Transport', amount: 35, percentage: 3 },
      { category: 'Other Departments', amount: 315, percentage: 26 },
    ],
    deficitHistory: [
      { year: 2014, deficit: -97 },
      { year: 2015, deficit: -76 },
      { year: 2016, deficit: -58 },
      { year: 2017, deficit: -46 },
      { year: 2018, deficit: -42 },
      { year: 2019, deficit: -55 },
      { year: 2020, deficit: -322 },
      { year: 2021, deficit: -318 },
      { year: 2022, deficit: -134 },
      { year: 2023, deficit: -128 },
      { year: 2024, deficit: -122 },
    ],
    deficitMax: 325,
    deficitNote: '2020-2021 saw record deficits due to COVID-19 pandemic response and the furlough scheme.',
    debtHistory: [
      { year: 2014, debt: 1.48 },
      { year: 2015, debt: 1.55 },
      { year: 2016, debt: 1.62 },
      { year: 2017, debt: 1.68 },
      { year: 2018, debt: 1.73 },
      { year: 2019, debt: 1.80 },
      { year: 2020, debt: 2.14 },
      { year: 2021, debt: 2.22 },
      { year: 2022, debt: 2.31 },
      { year: 2023, debt: 2.53 },
      { year: 2024, debt: 2.68 },
    ],
    debtMax: 2.8,
    debtNote: '\U0001f4c8 Current National Debt: \u00a32.68 Trillion',
    debtNoteSub: 'Debt interest payments: \u00a396 billion per year (8% of budget)',
    unemploymentTrends: [
      { year: 2020, rate: 4.9, context: 'COVID-19 impact' },
      { year: 2021, rate: 4.5, context: 'Furlough scheme end' },
      { year: 2022, rate: 3.7, context: 'Post-Brexit recovery' },
      { year: 2023, rate: 4.2, context: 'Cost of living crisis' },
      { year: 2024, rate: 4.2, context: 'Current rate' },
    ],
    foreignAid: [
      { country: 'Ukraine', amount: 4.2, purpose: 'Military and humanitarian support' },
      { country: 'Yemen', amount: 0.19, purpose: 'Humanitarian assistance' },
      { country: 'Syria', amount: 0.17, purpose: 'Conflict relief and recovery' },
      { country: 'South Sudan', amount: 0.14, purpose: 'Emergency food and health aid' },
      { country: 'Somalia', amount: 0.12, purpose: 'Humanitarian and development aid' },
      { country: 'Ethiopia', amount: 0.11, purpose: 'Emergency food security' },
      { country: 'Bangladesh', amount: 0.10, purpose: 'Climate adaptation and development' },
      { country: 'Pakistan', amount: 0.09, purpose: 'Flood recovery and development' },
    ],
    aidTotal: '~\u00a37.4 Billion (0.6% of budget)',
    foreignLoans: [
      { country: 'Ukraine', amount: 3.0, purpose: 'Economic stabilization and reconstruction', status: 'Active' },
      { country: 'Pakistan', amount: 0.45, purpose: 'Economic reform and development', status: 'Active' },
      { country: 'Kenya', amount: 0.22, purpose: 'Infrastructure and climate investment', status: 'Active' },
      { country: 'Ghana', amount: 0.18, purpose: 'Development finance', status: 'Active' },
    ],
    grantsByDepartment: [
      { department: 'Health & Social Care', grants: 225, percentage: 45 },
      { department: 'Work & Pensions (DWP)', grants: 125, percentage: 25 },
      { department: 'Education', grants: 60, percentage: 12 },
      { department: 'Housing & Communities', grants: 35, percentage: 7 },
      { department: 'Transport', grants: 20, percentage: 4 },
      { department: 'Home Office', grants: 15, percentage: 3 },
      { department: 'Defence', grants: 12, percentage: 2 },
      { department: 'Foreign, Commonwealth & Dev', grants: 9, percentage: 2 },
    ],
    departmentTrends: [
      { year: 2020, col1: 42, col2: 1205, col3: 95,  col4: 280 },
      { year: 2021, col1: 45, col2: 1320, col3: 102, col4: 295 },
      { year: 2022, col1: 47, col2: 1380, col3: 107, col4: 310 },
      { year: 2023, col1: 50, col2: 1410, col3: 109, col4: 320 },
      { year: 2024, col1: 52, col2: 1450, col3: 109, col4: 330 },
    ],
    deptHeaders: ['Year', 'Defence', 'NHS England', 'Education', 'Social Protection'],
    summaryRevenue: '\u00a3927B',
    summarySpending: '\u00a31.19T',
    summaryDebt: '\u00a32.68T',
  });

"""

uk_sig = "  const renderUKAnalytics = () => {"
uk_end = "  const renderUKNational = () => ("

uk_pos = content.find(uk_sig)
uk_end_pos = content.find(uk_end, uk_pos)

if uk_pos == -1:
    print("STEP 4: renderUKAnalytics not found!")
    import sys; sys.exit(1)
if uk_end_pos == -1:
    print("STEP 4: renderUKNational not found!")
    import sys; sys.exit(1)

print(f"UK: uk_pos={uk_pos}, uk_end_pos={uk_end_pos}")
content = content[:uk_pos] + UK_NEW + content[uk_end_pos:]
print("STEP 4 (UK analytics): OK")

# ================================================================
# STEP 5: Replace renderAuAnalytics
# ================================================================

AU_NEW = """  const renderAuAnalytics = () => renderGovernmentStatsPage({
    cc: 'AU',
    backView: 'au-categories',
    backLabel: 'Australian Federal Government',
    currency: 'A$',
    overviewTitle: '\U0001f4ca Australian Federal Budget Overview (FY 2024\u201325)',
    overviewSub: 'Comprehensive analysis of the A$682 billion Australian federal budget',
    revenue: [
      { source: 'Personal Income Tax', amount: 284, percentage: 42 },
      { source: 'Corporate Income Tax', amount: 128, percentage: 19 },
      { source: 'GST', amount: 87, percentage: 13 },
      { source: 'Excise & Customs', amount: 40, percentage: 6 },
      { source: 'Other Taxes', amount: 53, percentage: 8 },
      { source: 'Non-Tax Revenue', amount: 83, percentage: 12 },
    ],
    deficitDisplay: 'A$20 Billion',
    deficitSub: 'Government spends A$20B more than it collects (borrowed money)',
    spending: [
      { category: 'Social Security & Welfare', amount: 225, percentage: 33 },
      { category: 'Health', amount: 109, percentage: 16 },
      { category: 'Defence', amount: 55, percentage: 8 },
      { category: 'Education', amount: 41, percentage: 6 },
      { category: 'Transport & Infrastructure', amount: 27, percentage: 4 },
      { category: 'Debt Servicing', amount: 24, percentage: 4 },
      { category: 'Housing & Community Services', amount: 20, percentage: 3 },
      { category: 'Other Programs', amount: 181, percentage: 27 },
    ],
    deficitHistory: [
      { year: 2014, deficit: -48 },
      { year: 2015, deficit: -37 },
      { year: 2016, deficit: -39 },
      { year: 2017, deficit: -33 },
      { year: 2018, deficit: -10 },
      { year: 2019, deficit: -4 },
      { year: 2020, deficit: -134 },
      { year: 2021, deficit: -99 },
      { year: 2022, deficit: -32 },
      { year: 2023, deficit: -14 },
      { year: 2024, deficit: -20 },
    ],
    deficitMax: 140,
    deficitNote: '2020-2021 saw record deficits due to COVID-19 pandemic stimulus and JobKeeper payments.',
    debtHistory: [
      { year: 2014, debt: 0.37 },
      { year: 2015, debt: 0.44 },
      { year: 2016, debt: 0.49 },
      { year: 2017, debt: 0.55 },
      { year: 2018, debt: 0.58 },
      { year: 2019, debt: 0.59 },
      { year: 2020, debt: 0.72 },
      { year: 2021, debt: 0.83 },
      { year: 2022, debt: 0.88 },
      { year: 2023, debt: 0.91 },
      { year: 2024, debt: 0.94 },
    ],
    debtMax: 1.0,
    debtNote: '\U0001f4c8 Current Gross Debt: A$942 Billion',
    debtNoteSub: 'Debt servicing cost: A$24 billion per year (4% of budget)',
    unemploymentTrends: [
      { year: 2020, rate: 6.4, context: 'COVID-19 Pandemic' },
      { year: 2021, rate: 5.1, context: 'Recovery Underway' },
      { year: 2022, rate: 3.5, context: 'Labour Market Tight' },
      { year: 2023, rate: 3.7, context: 'Stable Employment' },
      { year: 2024, rate: 3.9, context: 'Current Rate' },
    ],
    foreignAid: [
      { country: 'Papua New Guinea', amount: 0.48, purpose: 'Bilateral development \u2014 health, education & governance' },
      { country: 'Indonesia', amount: 0.37, purpose: 'Economic growth, disaster resilience & education' },
      { country: 'Solomon Islands', amount: 0.28, purpose: 'Security partnership & infrastructure' },
      { country: 'Timor-Leste', amount: 0.21, purpose: 'Economic development & financial reform' },
      { country: 'Vanuatu', amount: 0.16, purpose: 'Infrastructure & climate resilience' },
      { country: 'Philippines', amount: 0.14, purpose: 'Inclusive economic growth & human development' },
      { country: 'Cambodia', amount: 0.10, purpose: 'Rule of law & land rights' },
      { country: 'Myanmar', amount: 0.09, purpose: 'Humanitarian assistance & civil society' },
    ],
    aidTotal: '~A$4.9 Billion (0.7% of budget)',
    foreignLoans: [
      { country: 'Papua New Guinea', amount: 0.38, purpose: 'Infrastructure development & economic growth', status: 'Active' },
      { country: 'Indonesia', amount: 0.24, purpose: 'Climate projects and energy transition', status: 'Active' },
      { country: 'Timor-Leste', amount: 0.12, purpose: 'Infrastructure and governance reform', status: 'Active' },
      { country: 'Fiji', amount: 0.08, purpose: 'Climate resilience infrastructure', status: 'Active' },
    ],
    grantsByDepartment: [
      { department: 'Health & Aged Care', grants: 109, percentage: 42 },
      { department: 'Social Services (DSS)', grants: 85, percentage: 33 },
      { department: 'Education', grants: 28, percentage: 11 },
      { department: 'Infrastructure & Transport', grants: 16, percentage: 6 },
      { department: 'Housing Australia', grants: 10, percentage: 4 },
      { department: 'Agriculture, Water & Environment', grants: 6, percentage: 2 },
      { department: 'Industry, Science & Resources', grants: 4, percentage: 2 },
    ],
    departmentTrends: [
      { year: 2020, col1: 39, col2: 90,  col3: 35, col4: 210 },
      { year: 2021, col1: 43, col2: 97,  col3: 38, col4: 225 },
      { year: 2022, col1: 49, col2: 101, col3: 39, col4: 235 },
      { year: 2023, col1: 52, col2: 105, col3: 40, col4: 242 },
      { year: 2024, col1: 55, col2: 109, col3: 41, col4: 250 },
    ],
    deptHeaders: ['Year', 'Defence', 'Health & Aged Care', 'Education', 'Social Security & Welfare'],
    summaryRevenue: 'A$675B',
    summarySpending: 'A$682B',
    summaryDebt: 'A$942B',
  });

"""

au_sig = "  const renderAuAnalytics = () => {"
au_end = "  const renderAuCategories = () => {"

au_pos = content.find(au_sig)
au_end_pos = content.find(au_end, au_pos)

if au_pos == -1:
    print("STEP 5: renderAuAnalytics not found!")
    import sys; sys.exit(1)
if au_end_pos == -1:
    print("STEP 5: renderAuCategories not found!")
    import sys; sys.exit(1)

print(f"AU: au_pos={au_pos}, au_end_pos={au_end_pos}")
content = content[:au_pos] + AU_NEW + content[au_end_pos:]
print("STEP 5 (AU analytics): OK")

# Write the file
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nFinal file length: {len(content)}")
print("All steps 1-5 complete.")
