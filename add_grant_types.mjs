import { readFileSync, writeFileSync } from 'fs';
let c = readFileSync('src/App.js', 'utf8');
c = c.replace(/\r\n/g, '\n');

// Maps unescaped recipient name → type ('grant' or 'contract')
const typeMap = {
  // ── Health Canada ──
  'The Hospital for Sick Children (SickKids)': 'grant',
  'McGill University Health Centre': 'grant',
  'Toronto General Hospital': 'grant',
  'Canadian Mental Health Association': 'grant',
  'Canadian Red Cross': 'contract',
  'Sunnybrook Health Sciences Centre': 'grant',
  'Vancouver General Hospital': 'grant',
  'Centre for Addiction and Mental Health (CAMH)': 'grant',
  'Canadian Cancer Society': 'grant',
  'First Nations Health Authority (BC)': 'grant',
  'University of Alberta Hospital': 'grant',
  'The Ottawa Hospital': 'grant',

  // ── National Defence ──
  'CAE Inc.': 'contract',
  'General Dynamics Land Systems Canada': 'contract',
  'Lockheed Martin Canada': 'contract',
  'Defence Research and Development Canada': 'grant',
  'Veterans Affairs Canada - PTSD Programs': 'grant',
  'Canadian Rangers Organization': 'grant',
  'Thales Canada': 'contract',
  'Royal Military College of Canada': 'grant',
  'Irving Shipbuilding Inc.': 'contract',
  'True Patriot Love Foundation': 'grant',
  'Canadian Armed Forces Personnel Support Programs': 'grant',

  // ── Finance Canada ──
  'Canada Child Benefit - Direct Payments': 'grant',
  'GST/HST Tax Credit - Direct Payments': 'grant',
  'Business Development Bank of Canada (BDC)': 'grant',
  'Farm Credit Canada': 'grant',
  'Canada Infrastructure Bank': 'grant',
  'Export Development Canada (EDC)': 'grant',
  'Canada Mortgage and Housing Corporation (CMHC)': 'grant',
  'Sustainable Development Technology Canada': 'grant',
  'Canadian Film and Television Tax Credit': 'grant',
  'Investing in Canada Infrastructure Program': 'grant',

  // ── Immigration, Refugees and Citizenship ──
  'YMCA Canada - Settlement Services': 'contract',
  'Catholic Crosscultural Services': 'contract',
  'Jewish Immigrant Aid Services (JIAS)': 'grant',
  'Immigrant Services Society of BC': 'contract',
  'MOSAIC (Multilingual Orientation Service)': 'contract',
  'Toronto Region Immigrant Employment Council (TRIEC)': 'contract',
  'Canadian Council for Refugees': 'grant',
  'WoodGreen Community Services': 'contract',
  'Newcomer Centre of Peel': 'contract',
  'Calgary Catholic Immigration Society': 'contract',
  'Université de Montréal - Francization Programs': 'contract',

  // ── Environment and Climate Change ──
  'Nature Conservancy of Canada': 'grant',
  'Ducks Unlimited Canada': 'grant',
  'World Wildlife Fund Canada (WWF)': 'grant',
  'University of British Columbia - Climate Research': 'grant',
  'Pembina Institute': 'grant',
  'David Suzuki Foundation': 'grant',
  'Canadian Parks and Wilderness Society': 'grant',
  'Evergreen Canada': 'grant',
  'Ecology Action Centre (Nova Scotia)': 'grant',
  'Ontario Clean Air Alliance': 'grant',
  'Great Lakes Alliance': 'grant',

  // ── Public Safety Canada ──
  'Royal Canadian Mounted Police (RCMP) - Operations': 'grant',
  'Canada Border Services Agency (CBSA)': 'contract',
  'Canadian Security Intelligence Service (CSIS)': 'grant',
  'Emergency Preparedness Canada': 'contract',
  'Red Cross Canada - Emergency Response': 'grant',
  'Correctional Service Canada - Rehabilitation': 'grant',
  'Boys and Girls Clubs of Canada': 'grant',
  'Canadian Centre for Child Protection': 'grant',
  'Canadian Association of Chiefs of Police': 'contract',
  'Mothers Against Drunk Driving (MADD) Canada': 'grant',
  'Canadian Cybersecurity Centre': 'contract',

  // ── Employment and Social Development ──
  'Old Age Security - Direct Payments to Seniors': 'grant',
  'Employment Insurance - Direct Payments': 'grant',
  'Canada Pension Plan Disability - Direct Payments': 'grant',
  'Colleges and Institutes Canada': 'contract',
  'United Way Canada': 'grant',
  'Goodwill Industries Canada': 'contract',
  'Canadian Labour Congress': 'contract',
  'Neil Squire Society': 'contract',
  'Apprend Employment Services': 'contract',
  'Food Banks Canada': 'grant',

  // ── Transport Canada ──
  'Toronto Transit Commission (TTC)': 'grant',
  'Vancouver TransLink': 'grant',
  'Montreal STM (Société de transport)': 'grant',
  'Greater Toronto Airports Authority (Pearson)': 'grant',
  'Port of Vancouver': 'grant',
  'VIA Rail Canada': 'grant',
  'Calgary Transit': 'grant',
  'Nav Canada': 'contract',
  'Halifax Port Authority': 'grant',
  'Bike Calgary / Cycling Infrastructure Alliance': 'grant',
  'Northern Air Transport Association': 'grant',

  // ── Innovation, Science and Economic Development ──
  'Bombardier Inc.': 'contract',
  'Shopify Inc.': 'contract',
  'BlackBerry Limited': 'contract',
  'University of Toronto - AI Research': 'grant',
  'Magna International': 'contract',
  'McGill University - Engineering Research': 'grant',
  'MDA Corporation': 'contract',
  'University of British Columbia - Clean Tech': 'grant',
  'OpenText Corporation': 'contract',
  'Communitech (Kitchener-Waterloo)': 'grant',
  'Telus Communications': 'contract',
  'Waterloo Accelerator Centre': 'grant',

  // ── Natural Resources Canada ──
  'SaskPower Corporation': 'contract',
  'Teck Resources Limited': 'contract',
  'Cameco Corporation': 'contract',
  'University of Alberta - Energy Research': 'grant',
  'Resolute Forest Products': 'contract',
  'BC Hydro': 'contract',
  'Natural Resources Canada - Forestry Division': 'grant',
  'Ontario Power Generation': 'contract',
  'Efficiency Canada': 'grant',
  'Geological Survey of Canada': 'grant',

  // ── Justice Canada ──
  'Legal Aid Ontario': 'contract',
  'Aboriginal Legal Services Toronto': 'contract',
  'Canadian Association of Elizabeth Fry Societies': 'grant',
  'Victim Services Toronto': 'contract',
  'John Howard Society of Canada': 'grant',
  'Community Legal Education Ontario (CLEO)': 'grant',
  'Osgoode Hall Law School - Access to Justice': 'contract',
  'Canadian Centre for Victims of Torture': 'grant',
  'Family Service Toronto': 'contract',
  'Court Technology Modernization Initiative': 'contract',

  // ── Indigenous Services Canada ──
  'Assembly of First Nations': 'grant',
  'First Nations Child and Family Caring Society': 'contract',
  'Inuit Tapiriit Kanatami': 'grant',
  'Métis National Council': 'grant',
  'First Nations University of Canada': 'grant',
  'National Association of Friendship Centres': 'grant',
  'Thunderbird Partnership Foundation': 'grant',
  'Indigenous Tourism Association of Canada': 'grant',
  'First Nations Financial Management Board': 'grant',
  "Native Women's Association of Canada": 'grant',
  'Indspire': 'grant',

  // ── Agriculture and Agri-Food Canada ──
  'Canadian Federation of Agriculture': 'grant',
  'University of Guelph - Agricultural Research': 'grant',
  'Grain Growers of Canada': 'grant',
  'Dairy Farmers of Canada': 'grant',
  "Canadian Cattlemen's Association": 'grant',
  'Canadian Horticultural Council': 'grant',
  'Agriculture and Agri-Food Canada Research Centres': 'grant',
  'Canadian Organic Growers': 'grant',
  'Farm Management Canada': 'grant',

  // ── Global Affairs Canada ──
  'United Nations Relief and Works Agency (UNRWA)': 'grant',
  'World Food Programme': 'grant',
  'UNICEF Canada': 'grant',
  'Médecins Sans Frontières (Doctors Without Borders)': 'grant',
  'Canadian Red Cross - International Programs': 'grant',
  'Plan International Canada': 'grant',
  'CARE Canada': 'grant',
  'Oxfam Canada': 'grant',
  'Canadian Foodgrains Bank': 'grant',
  'Save the Children Canada': 'grant',

  // ── Canadian Heritage ──
  'Canada Council for the Arts': 'grant',
  'National Film Board of Canada': 'contract',
  'Canadian Broadcasting Corporation (CBC)': 'grant',
  'Telefilm Canada': 'grant',
  'Canada Music Fund': 'grant',
  'Royal Winnipeg Ballet': 'grant',
  'National Gallery of Canada': 'grant',
  'Sport Canada - Own the Podium': 'grant',
  'Canada Science and Technology Museum': 'grant',
  "Fédération canadienne-française de l'Ontario": 'grant',
  'Canadian Museum of History': 'grant',

  // ── US: Department of State ──
  'USAID - Global Health Programs': 'grant',
  'United Nations Operations': 'grant',
  'NATO Allied Support': 'grant',
  'Middle East Partnership Initiative': 'grant',
  'Millennium Challenge Corporation': 'grant',

  // ── US: Department of the Treasury ──
  'Federal Debt Interest Payments': 'grant',
  'Community Development Financial Institutions': 'grant',
  'Emergency Rental Assistance Program': 'grant',
  'Small Business Administration Loans': 'grant',
  'State and Local Fiscal Recovery': 'grant',

  // ── US: Department of Defense ──
  'Lockheed Martin Corporation': 'contract',
  'Boeing Defense & Space': 'contract',
  'Raytheon Technologies': 'contract',
  'Northrop Grumman': 'contract',
  'General Dynamics': 'contract',
  'BAE Systems USA': 'contract',
  'L3Harris Technologies': 'contract',

  // ── US: Department of Justice ──
  'FBI Operations & Investigations': 'grant',
  'State and Local Law Enforcement Grants': 'grant',
  'Violence Against Women Programs': 'grant',
  'Drug Enforcement Administration': 'grant',
  'Legal Aid for Low-Income Defendants': 'grant',

  // ── US: Department of Health & Human Services ──
  'Medicare Payments to Healthcare Providers': 'contract',
  'Medicaid State Programs': 'grant',
  'National Institutes of Health (NIH)': 'grant',
  'Centers for Disease Control (CDC)': 'grant',
  'Johns Hopkins University Medical Research': 'grant',
  'Mayo Clinic Research Programs': 'grant',

  // ── US: Department of Education ──
  'Pell Grants for College Students': 'grant',
  'Title I Grants to Schools': 'grant',
  'Special Education (IDEA)': 'grant',
  'Head Start Early Childhood Programs': 'grant',
  'Community Colleges of America': 'grant',

  // ── US: Department of Veterans Affairs ──
  'VA Medical Centers Nationwide': 'contract',
  'Disability Compensation Payments': 'grant',
  'GI Bill Education Benefits': 'grant',
  'Homeless Veterans Support Programs': 'grant',
  'Veterans Crisis Line & Mental Health': 'grant',

  // ── US: Department of Homeland Security ──
  'FEMA Disaster Relief Fund': 'grant',
  'Customs and Border Protection': 'contract',
  'State Homeland Security Grants': 'grant',
  'Immigration and Customs Enforcement': 'grant',
  'Cybersecurity and Infrastructure Security Agency': 'grant',

  // ── US: Department of Transportation ──
  'State Highway Infrastructure Grants': 'grant',
  'Federal Transit Administration': 'grant',
  'Amtrak National Rail Service': 'grant',
  'Airport Improvement Program': 'grant',
  'Port Infrastructure Development': 'grant',

  // ── US: Department of Energy ──
  'National Nuclear Security Administration': 'grant',
  'Clean Energy Investment Tax Credits': 'grant',
  'Lawrence Livermore National Laboratory': 'contract',
  'Brookhaven National Laboratory': 'contract',
  'Electric Vehicle Charging Infrastructure': 'contract',

  // ── US: Department of Agriculture ──
  'SNAP Food Assistance Program': 'grant',
  'Farm Subsidies and Crop Insurance': 'grant',
  'School Lunch and Breakfast Programs': 'grant',
  'Rural Development Grants': 'grant',
  'Conservation Reserve Program': 'grant',

  // ── US: Department of Housing & Urban Development ──
  'Section 8 Housing Choice Vouchers': 'grant',
  'Public Housing Operating Fund': 'grant',
  'Community Development Block Grants': 'grant',
  'Homeless Assistance Grants': 'grant',
  'FHA Mortgage Insurance Program': 'grant',

  // ── US: Department of the Interior ──
  'National Park Service Operations': 'grant',
  'Bureau of Indian Affairs': 'grant',
  'Land and Water Conservation Fund': 'grant',
  'U.S. Geological Survey Research': 'grant',
  'Wildlife Restoration Programs': 'grant',

  // ── US: Department of Labor ──
  'State Unemployment Insurance Programs': 'grant',
  'Workforce Innovation and Opportunity Act': 'grant',
  'OSHA Workplace Safety Enforcement': 'grant',
  'Apprenticeship Programs': 'grant',
  'Mine Safety and Health Administration': 'grant',

  // ── US: Department of Commerce ──
  'NOAA Weather and Climate Services': 'grant',
  'Census Bureau Operations': 'grant',
  'Economic Development Administration': 'grant',
  'National Institute of Standards & Technology': 'grant',
  'Minority Business Development Agency': 'grant',
};

let matched = 0;
let unmatched = [];

// Match grantsDetail items that don't yet have a type field.
// Pattern: { recipient: '...', amount: '...', purpose: '...', date: '...' }
c = c.replace(
  /\{ recipient: ('(?:[^'\\]|\\.)*'), amount: ('(?:[^'\\]|\\.)*'), purpose: ('(?:[^'\\]|\\.)*'), date: ('(?:[^'\\]|\\.)*') \}/g,
  (match, recipientQ, amountQ, purposeQ, dateQ) => {
    // Unescape \' back to ' for the lookup key
    const key = recipientQ.slice(1, -1).replace(/\\'/g, "'");
    const type = typeMap[key];
    if (!type) {
      unmatched.push(key);
      return match;
    }
    matched++;
    return `{ recipient: ${recipientQ}, amount: ${amountQ}, purpose: ${purposeQ}, date: ${dateQ}, type: '${type}' }`;
  }
);

console.log(`Matched and updated: ${matched} items`);
if (unmatched.length) {
  console.log('UNMAPPED recipients:');
  unmatched.forEach(r => console.log(' -', r));
} else {
  console.log('All recipients mapped successfully.');
}

writeFileSync('src/App.js', c, 'utf8');
console.log('Done. File size:', c.length);
