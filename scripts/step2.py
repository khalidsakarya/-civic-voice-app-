path = r'C:\Users\jem91\civic-voice-app\src\App.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = None
for i, line in enumerate(lines):
    if 'const renderUSAnalytics = () => {' in line:
        start_idx = i
        break

end_idx = None
for i, line in enumerate(lines):
    if '// Supreme Court Render Functions' in line:
        end_idx = i
        break

print(f"start_idx={start_idx+1}, end_idx={end_idx+1}")

new_body = """  const renderUSAnalytics = () => {
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
  };

"""

new_lines = lines[:start_idx] + [new_body] + lines[end_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("STEP 2: OK")
