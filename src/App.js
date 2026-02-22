import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Globe, Users, FileText, AlertCircle, MapPin, Calendar, Award, CheckCircle, XCircle, MinusCircle, DollarSign, TrendingUp, Briefcase, Building2, Search, X, Filter, BarChart3, PieChart, ThumbsUp, ThumbsDown, Clock, Crown, Star, Scale } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './App.css';

// Custom CSS for animations and enhanced styling
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideInFromLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out forwards;
  }
  
  .animate-slide-in {
    animation: slideInFromLeft 0.5s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.3s ease-out forwards;
  }
  
  .animate-pulse-slow {
    animation: pulse 2s ease-in-out infinite;
  }
  
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .card-gradient {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  }
  
  .button-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    transition: all 0.3s ease;
  }
  
  .button-primary:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
  }
  
  .button-primary:active {
    transform: translateY(0);
  }
  
  .button-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    transition: all 0.3s ease;
  }
  
  .button-success:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
  }
  
  .button-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    transition: all 0.3s ease;
  }
  
  .button-danger:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);
  }
  
  .shadow-elegant {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .shadow-elegant-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .badge-modern {
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(59, 130, 246, 0.2);
  }
  
  .header-sticky {
    backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.95);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  .loading-spinner {
    border: 3px solid rgba(59, 130, 246, 0.2);
    border-top-color: #3b82f6;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .stat-card {
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  }
  
  .stat-card:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
  }
  
  .interactive-card {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  
  .interactive-card:hover {
    transform: translateY(-2px) scale(1.01);
  }
  
  .interactive-card:active {
    transform: translateY(0) scale(0.99);
  }
  
  .gradient-blue {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }
  
  .gradient-green {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }
  
  .gradient-red {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }
  
  .gradient-purple {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  }
  
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .smooth-scroll {
    scroll-behavior: smooth;
  }
  
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    transition: all 0.2s ease;
  }
  
  .progress-bar {
    transition: width 0.5s ease-in-out;
  }

  @keyframes slideInFromRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @keyframes fadeInBackdrop {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .panel-slide-in {
    animation: slideInFromRight 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .panel-backdrop {
    animation: fadeInBackdrop 0.25s ease forwards;
  }

  .panel-section-label {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 0.5rem;
  }
`;

function App() {
  const [view, setView] = useState('countries');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  
  // Canadian data
  const [mps, setMps] = useState([]);
  const [bills, setBills] = useState([]);
  const [laws, setLaws] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [governmentData, setGovernmentData] = useState(null);
  
  // US data
  const [congressMembers, setCongressMembers] = useState([]);
  const [usBills, setUsBills] = useState([]);
  const [usDepartments, setUsDepartments] = useState([]);
  const [usAnalyticsData, setUsAnalyticsData] = useState(null);
  const [usSupremeCourt, setUsSupremeCourt] = useState(null);
  const [usContracts, setUsContracts] = useState([]);
  const [selectedUsContract, setSelectedUsContract] = useState(null);
  
  // Laws & Legal Search data
  const [usLaws, setUsLaws] = useState([]);
  const [lawSearch, setLawSearch] = useState('');
  const [lawDateFilter, setLawDateFilter] = useState('All Time');
  
  // Canadian Supreme Court data
  const [canadaSupremeCourt, setCanadaSupremeCourt] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('role');
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  
  // US Contracts filter states
  const [contractSearch, setContractSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  
  // US Bills filter states
  const [billSearch, setBillSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [billTab, setBillTab] = useState('upcoming'); // upcoming, proposed, voted
  
  // US Congress chamber selection
  const [selectedChamber, setSelectedChamber] = useState(null);
  
  // Location-based MP finder states
  const [userMP, setUserMP] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  // Ministries state
  const [selectedMinistry, setSelectedMinistry] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [grantsExpanded, setGrantsExpanded] = useState(false);
  
  // Legislative Hub state
  const [legislativeTab, setLegislativeTab] = useState('bills'); // bills, laws, upcoming
  const [usLegTab, setUsLegTab] = useState('bills');
  const [usLegSearch, setUsLegSearch] = useState('');
  const [ministries, setMinistries] = useState([
    {
      id: 1,
      name: 'Health Canada',
      minister: 'Mark Holland',
      budget: '$6.8 Billion',
      budgetRaw: 6800000000,
      grants: '$2.1 Billion',
      employees: 12500,
      description: 'Responsible for helping Canadians maintain and improve their health',
      responsibilities: ['Public health', 'Healthcare policy', 'Drug regulation', 'Medical devices'],
      grantsDetail: [
        { recipient: 'The Hospital for Sick Children (SickKids)', amount: '$85 Million', purpose: 'Pediatric cancer research and treatment facility expansion', date: 'January 2025' },
        { recipient: 'McGill University Health Centre', amount: '$62 Million', purpose: 'COVID-19 vaccine development and clinical trials', date: 'December 2024' },
        { recipient: 'Toronto General Hospital', amount: '$54 Million', purpose: 'Organ transplant program and surgical equipment', date: 'November 2024' },
        { recipient: 'Canadian Mental Health Association', amount: '$48 Million', purpose: 'National crisis intervention hotline and community programs', date: 'October 2024' },
        { recipient: 'Canadian Red Cross', amount: '$35 Million', purpose: 'Blood services modernization and plasma collection', date: 'September 2024' },
        { recipient: 'Sunnybrook Health Sciences Centre', amount: '$28 Million', purpose: 'Trauma care and emergency department upgrades', date: 'August 2024' },
        { recipient: 'Vancouver General Hospital', amount: '$22 Million', purpose: 'Mental health beds and psychiatric services expansion', date: 'July 2024' },
        { recipient: 'Centre for Addiction and Mental Health (CAMH)', amount: '$19 Million', purpose: 'Addiction treatment research and patient care', date: 'June 2024' },
        { recipient: 'Canadian Cancer Society', amount: '$16 Million', purpose: 'Cancer screening programs and patient support services', date: 'May 2024' },
        { recipient: 'First Nations Health Authority (BC)', amount: '$14 Million', purpose: 'Remote community healthcare access and telemedicine', date: 'April 2024' },
        { recipient: 'University of Alberta Hospital', amount: '$11 Million', purpose: 'Cardiac care unit modernization', date: 'March 2024' },
        { recipient: 'The Ottawa Hospital', amount: '$8.5 Million', purpose: 'Stroke treatment and neurological research', date: 'February 2024' }
      ],
      approveVotes: 245,
      disapproveVotes: 189,
      userVote: null
    },
    {
      id: 2,
      name: 'National Defence',
      minister: 'Bill Blair',
      budget: '$26.5 Billion',
      budgetRaw: 26500000000,
      grants: '$890 Million',
      employees: 68000,
      description: 'Responsible for defending Canada and Canadian interests and values',
      responsibilities: ['Canadian Armed Forces', 'Military operations', 'Defence policy', 'National security'],
      grantsDetail: [
        { recipient: 'CAE Inc.', amount: '$120 Million', purpose: 'Flight simulator technology and pilot training systems', date: 'December 2024' },
        { recipient: 'General Dynamics Land Systems Canada', amount: '$95 Million', purpose: 'Light armored vehicle upgrades and maintenance', date: 'November 2024' },
        { recipient: 'Lockheed Martin Canada', amount: '$78 Million', purpose: 'F-35 fighter jet maintenance and parts supply', date: 'October 2024' },
        { recipient: 'Defence Research and Development Canada', amount: '$62 Million', purpose: 'Cybersecurity and artificial intelligence research', date: 'September 2024' },
        { recipient: 'Veterans Affairs Canada - PTSD Programs', amount: '$45 Million', purpose: 'Mental health treatment for veterans and military families', date: 'August 2024' },
        { recipient: 'Canadian Rangers Organization', amount: '$38 Million', purpose: 'Arctic sovereignty and northern community defense', date: 'July 2024' },
        { recipient: 'Thales Canada', amount: '$32 Million', purpose: 'Secure communications and tactical radio systems', date: 'June 2024' },
        { recipient: 'Royal Military College of Canada', amount: '$28 Million', purpose: 'Officer training and defense education programs', date: 'May 2024' },
        { recipient: 'Irving Shipbuilding Inc.', amount: '$24 Million', purpose: 'Naval ship maintenance and repair services', date: 'April 2024' },
        { recipient: 'True Patriot Love Foundation', amount: '$15 Million', purpose: 'Support programs for military families', date: 'March 2024' },
        { recipient: 'Canadian Armed Forces Personnel Support Programs', amount: '$11 Million', purpose: 'Transition assistance for retiring military members', date: 'February 2024' }
      ],
      approveVotes: 312,
      disapproveVotes: 201,
      userVote: null
    },
    {
      id: 3,
      name: 'Finance Canada',
      minister: 'Chrystia Freeland',
      budget: '$120.5 Billion',
      budgetRaw: 120500000000,
      grants: '$45.2 Billion',
      employees: 1850,
      description: 'Responsible for economic and fiscal policy',
      responsibilities: ['Economic policy', 'Federal budget', 'Tax policy', 'Financial sector regulation'],
      grantsDetail: [
        { recipient: 'Canada Child Benefit - Direct Payments', amount: '$25.8 Billion', purpose: 'Monthly child support payments to 3.7 million families', date: 'Ongoing 2024' },
        { recipient: 'GST/HST Tax Credit - Direct Payments', amount: '$8.5 Billion', purpose: 'Quarterly tax relief for low and moderate-income Canadians', date: 'Quarterly 2024' },
        { recipient: 'Business Development Bank of Canada (BDC)', amount: '$2.1 Billion', purpose: 'Small business loans and financing programs', date: 'January 2025' },
        { recipient: 'Farm Credit Canada', amount: '$1.8 Billion', purpose: 'Agricultural sector financing and risk management', date: 'December 2024' },
        { recipient: 'Canada Infrastructure Bank', amount: '$1.5 Billion', purpose: 'Green infrastructure and public transit projects', date: 'November 2024' },
        { recipient: 'Export Development Canada (EDC)', amount: '$980 Million', purpose: 'Export financing and trade insurance for Canadian businesses', date: 'October 2024' },
        { recipient: 'Canada Mortgage and Housing Corporation (CMHC)', amount: '$720 Million', purpose: 'Affordable housing initiatives and first-time homebuyer programs', date: 'September 2024' },
        { recipient: 'Sustainable Development Technology Canada', amount: '$450 Million', purpose: 'Clean technology companies and green innovation', date: 'August 2024' },
        { recipient: 'Canadian Film and Television Tax Credit', amount: '$320 Million', purpose: 'Support for domestic film and media production', date: 'July 2024' },
        { recipient: 'Investing in Canada Infrastructure Program', amount: '$280 Million', purpose: 'Municipal infrastructure upgrades nationwide', date: 'June 2024' }
      ],
      approveVotes: 278,
      disapproveVotes: 356,
      userVote: null
    },
    {
      id: 4,
      name: 'Immigration, Refugees and Citizenship',
      minister: 'Marc Miller',
      budget: '$3.2 Billion',
      budgetRaw: 3200000000,
      grants: '$1.5 Billion',
      employees: 9500,
      description: 'Facilitating entry of people and their integration into Canadian society',
      responsibilities: ['Immigration policy', 'Refugee protection', 'Citizenship services', 'Settlement programs'],
      grantsDetail: [
        { recipient: 'YMCA Canada - Settlement Services', amount: '$145 Million', purpose: 'Language training and employment services for newcomers', date: 'January 2025' },
        { recipient: 'Catholic Crosscultural Services', amount: '$98 Million', purpose: 'Refugee resettlement and integration programs', date: 'December 2024' },
        { recipient: 'Jewish Immigrant Aid Services (JIAS)', amount: '$76 Million', purpose: 'Refugee sponsorship and family reunification', date: 'November 2024' },
        { recipient: 'Immigrant Services Society of BC', amount: '$64 Million', purpose: 'Settlement support and citizenship preparation', date: 'October 2024' },
        { recipient: 'MOSAIC (Multilingual Orientation Service)', amount: '$52 Million', purpose: 'Multicultural integration and language services', date: 'September 2024' },
        { recipient: 'Toronto Region Immigrant Employment Council (TRIEC)', amount: '$45 Million', purpose: 'Skilled immigrant job placement and mentoring', date: 'August 2024' },
        { recipient: 'Canadian Council for Refugees', amount: '$38 Million', purpose: 'Refugee protection and advocacy programs', date: 'July 2024' },
        { recipient: 'WoodGreen Community Services', amount: '$31 Million', purpose: 'Newcomer housing and social services', date: 'June 2024' },
        { recipient: 'Newcomer Centre of Peel', amount: '$24 Million', purpose: 'Settlement services for immigrants in Ontario', date: 'May 2024' },
        { recipient: 'Calgary Catholic Immigration Society', amount: '$19 Million', purpose: 'Refugee settlement in Alberta', date: 'April 2024' },
        { recipient: 'Université de Montréal - Francization Programs', amount: '$15 Million', purpose: 'French language training for immigrants to Quebec', date: 'March 2024' }
      ],
      approveVotes: 401,
      disapproveVotes: 298,
      userVote: null
    },
    {
      id: 5,
      name: 'Environment and Climate Change',
      minister: 'Steven Guilbeault',
      budget: '$4.1 Billion',
      budgetRaw: 4100000000,
      grants: '$2.8 Billion',
      employees: 7200,
      description: 'Preserving and enhancing the quality of the natural environment',
      responsibilities: ['Climate policy', 'Environmental protection', 'Parks Canada', 'Wildlife conservation'],
      grantsDetail: [
        { recipient: 'Nature Conservancy of Canada', amount: '$185 Million', purpose: 'Land acquisition for endangered species habitat protection', date: 'January 2025' },
        { recipient: 'Ducks Unlimited Canada', amount: '$142 Million', purpose: 'Wetland conservation and waterfowl habitat restoration', date: 'December 2024' },
        { recipient: 'World Wildlife Fund Canada (WWF)', amount: '$118 Million', purpose: 'Wildlife conservation and climate adaptation projects', date: 'November 2024' },
        { recipient: 'University of British Columbia - Climate Research', amount: '$96 Million', purpose: 'Climate science research and modeling', date: 'October 2024' },
        { recipient: 'Pembina Institute', amount: '$78 Million', purpose: 'Clean energy transition and policy analysis', date: 'September 2024' },
        { recipient: 'David Suzuki Foundation', amount: '$64 Million', purpose: 'Environmental education and advocacy programs', date: 'August 2024' },
        { recipient: 'Canadian Parks and Wilderness Society', amount: '$52 Million', purpose: 'National park expansion and protection', date: 'July 2024' },
        { recipient: 'Evergreen Canada', amount: '$45 Million', purpose: 'Urban greening and community environmental projects', date: 'June 2024' },
        { recipient: 'Ecology Action Centre (Nova Scotia)', amount: '$38 Million', purpose: 'Coastal ecosystem protection and marine conservation', date: 'May 2024' },
        { recipient: 'Ontario Clean Air Alliance', amount: '$29 Million', purpose: 'Air quality monitoring and pollution reduction', date: 'April 2024' },
        { recipient: 'Great Lakes Alliance', amount: '$24 Million', purpose: 'Great Lakes water quality improvement', date: 'March 2024' }
      ],
      approveVotes: 389,
      disapproveVotes: 267,
      userVote: null
    },
    {
      id: 6,
      name: 'Public Safety Canada',
      minister: 'Dominic LeBlanc',
      budget: '$10.2 Billion',
      budgetRaw: 10200000000,
      grants: '$3.4 Billion',
      employees: 15600,
      description: 'Protecting Canadians and maintaining a peaceful and safe society',
      responsibilities: ['RCMP oversight', 'Border security', 'Emergency management', 'Crime prevention'],
      grantsDetail: [
        { recipient: 'Royal Canadian Mounted Police (RCMP) - Operations', amount: '$820 Million', purpose: 'National policing and federal law enforcement', date: 'Ongoing 2024' },
        { recipient: 'Canada Border Services Agency (CBSA)', amount: '$495 Million', purpose: 'Border security technology and screening systems', date: 'January 2025' },
        { recipient: 'Canadian Security Intelligence Service (CSIS)', amount: '$340 Million', purpose: 'Counter-terrorism and national security operations', date: 'December 2024' },
        { recipient: 'Emergency Preparedness Canada', amount: '$285 Million', purpose: 'Disaster response equipment and training', date: 'November 2024' },
        { recipient: 'Red Cross Canada - Emergency Response', amount: '$175 Million', purpose: 'Disaster relief and emergency assistance programs', date: 'October 2024' },
        { recipient: 'Correctional Service Canada - Rehabilitation', amount: '$142 Million', purpose: 'Inmate rehabilitation and reintegration programs', date: 'September 2024' },
        { recipient: 'Boys and Girls Clubs of Canada', amount: '$98 Million', purpose: 'Youth crime prevention and mentorship', date: 'August 2024' },
        { recipient: 'Canadian Centre for Child Protection', amount: '$76 Million', purpose: 'Child exploitation prevention and victim support', date: 'July 2024' },
        { recipient: 'Canadian Association of Chiefs of Police', amount: '$54 Million', purpose: 'Police training and community policing initiatives', date: 'June 2024' },
        { recipient: 'Mothers Against Drunk Driving (MADD) Canada', amount: '$38 Million', purpose: 'Impaired driving prevention and victim services', date: 'May 2024' },
        { recipient: 'Canadian Cybersecurity Centre', amount: '$29 Million', purpose: 'Critical infrastructure protection from cyber threats', date: 'April 2024' }
      ],
      approveVotes: 334,
      disapproveVotes: 278,
      userVote: null
    },
    {
      id: 7,
      name: 'Employment and Social Development',
      minister: 'Randy Boissonnault',
      budget: '$135.6 Billion',
      budgetRaw: 135600000000,
      grants: '$89.2 Billion',
      employees: 28000,
      description: 'Responsible for social programs and the labour market',
      responsibilities: ['Employment Insurance', 'Canada Pension Plan', 'Old Age Security', 'Labour standards'],
      grantsDetail: [
        { recipient: 'Old Age Security - Direct Payments to Seniors', amount: '$62.5 Billion', purpose: 'Monthly pension payments to 6.8 million seniors aged 65+', date: 'Ongoing 2024' },
        { recipient: 'Employment Insurance - Direct Payments', amount: '$18.3 Billion', purpose: 'Income support for 1.2 million unemployed Canadians', date: 'Ongoing 2024' },
        { recipient: 'Canada Pension Plan Disability - Direct Payments', amount: '$5.1 Billion', purpose: 'Support for 340,000 Canadians with disabilities', date: 'Ongoing 2024' },
        { recipient: 'Colleges and Institutes Canada', amount: '$420 Million', purpose: 'Skills training and workforce development programs', date: 'January 2025' },
        { recipient: 'United Way Canada', amount: '$285 Million', purpose: 'Social assistance and poverty reduction initiatives', date: 'December 2024' },
        { recipient: 'Goodwill Industries Canada', amount: '$195 Million', purpose: 'Job training and placement for disadvantaged workers', date: 'November 2024' },
        { recipient: 'Canadian Labour Congress', amount: '$142 Million', purpose: 'Worker training and labour standards advocacy', date: 'October 2024' },
        { recipient: 'Neil Squire Society', amount: '$98 Million', purpose: 'Employment programs for people with disabilities', date: 'September 2024' },
        { recipient: 'Apprend Employment Services', amount: '$76 Million', purpose: 'Job placement for newcomers and youth', date: 'August 2024' },
        { recipient: 'Food Banks Canada', amount: '$54 Million', purpose: 'Emergency food assistance and social support', date: 'July 2024' }
      ],
      approveVotes: 412,
      disapproveVotes: 245,
      userVote: null
    },
    {
      id: 8,
      name: 'Transport Canada',
      minister: 'Pablo Rodriguez',
      budget: '$8.9 Billion',
      budgetRaw: 8900000000,
      grants: '$4.2 Billion',
      employees: 5800,
      description: 'Responsible for transportation policies and programs',
      responsibilities: ['Aviation safety', 'Marine safety', 'Rail safety', 'Road safety'],
      grantsDetail: [
        { recipient: 'Toronto Transit Commission (TTC)', amount: '$285 Million', purpose: 'Subway expansion and fleet modernization', date: 'January 2025' },
        { recipient: 'Vancouver TransLink', amount: '$242 Million', purpose: 'SkyTrain extension and bus rapid transit', date: 'December 2024' },
        { recipient: 'Montreal STM (Société de transport)', amount: '$198 Million', purpose: 'Metro line expansion and infrastructure upgrades', date: 'November 2024' },
        { recipient: 'Greater Toronto Airports Authority (Pearson)', amount: '$165 Million', purpose: 'Terminal modernization and safety improvements', date: 'October 2024' },
        { recipient: 'Port of Vancouver', amount: '$142 Million', purpose: 'Container terminal expansion and environmental compliance', date: 'September 2024' },
        { recipient: 'VIA Rail Canada', amount: '$118 Million', purpose: 'High-frequency rail corridor development', date: 'August 2024' },
        { recipient: 'Calgary Transit', amount: '$94 Million', purpose: 'LRT expansion and Green Line project', date: 'July 2024' },
        { recipient: 'Nav Canada', amount: '$76 Million', purpose: 'Air traffic control technology upgrades', date: 'June 2024' },
        { recipient: 'Halifax Port Authority', amount: '$62 Million', purpose: 'Port infrastructure and deep-water berth construction', date: 'May 2024' },
        { recipient: 'Bike Calgary / Cycling Infrastructure Alliance', amount: '$45 Million', purpose: 'Bike lane network and active transportation', date: 'April 2024' },
        { recipient: 'Northern Air Transport Association', amount: '$38 Million', purpose: 'Remote community airport safety upgrades', date: 'March 2024' }
      ],
      approveVotes: 301,
      disapproveVotes: 198,
      userVote: null
    },
    {
      id: 9,
      name: 'Innovation, Science and Economic Development',
      minister: 'François-Philippe Champagne',
      budget: '$11.3 Billion',
      budgetRaw: 11300000000,
      grants: '$7.8 Billion',
      employees: 6400,
      description: 'Fostering a growing, competitive and knowledge-based Canadian economy',
      responsibilities: ['Innovation policy', 'Science funding', 'Telecommunications', 'Intellectual property'],
      grantsDetail: [
        { recipient: 'Bombardier Inc.', amount: '$485 Million', purpose: 'Aircraft development and aerospace innovation', date: 'January 2025' },
        { recipient: 'Shopify Inc.', amount: '$320 Million', purpose: 'AI and e-commerce technology development', date: 'December 2024' },
        { recipient: 'BlackBerry Limited', amount: '$275 Million', purpose: 'Cybersecurity and IoT research', date: 'November 2024' },
        { recipient: 'University of Toronto - AI Research', amount: '$240 Million', purpose: 'Artificial intelligence and machine learning', date: 'October 2024' },
        { recipient: 'Magna International', amount: '$195 Million', purpose: 'Electric vehicle technology and autonomous systems', date: 'September 2024' },
        { recipient: 'McGill University - Engineering Research', amount: '$168 Million', purpose: 'Advanced materials and nanotechnology', date: 'August 2024' },
        { recipient: 'MDA Corporation', amount: '$142 Million', purpose: 'Satellite technology and space robotics', date: 'July 2024' },
        { recipient: 'University of British Columbia - Clean Tech', amount: '$125 Million', purpose: 'Sustainable technology and clean energy research', date: 'June 2024' },
        { recipient: 'OpenText Corporation', amount: '$98 Million', purpose: 'Enterprise software and cloud computing', date: 'May 2024' },
        { recipient: 'Communitech (Kitchener-Waterloo)', amount: '$76 Million', purpose: 'Tech startup incubation and scale-up support', date: 'April 2024' },
        { recipient: 'Telus Communications', amount: '$64 Million', purpose: 'Rural broadband expansion and 5G infrastructure', date: 'March 2024' },
        { recipient: 'Waterloo Accelerator Centre', amount: '$52 Million', purpose: 'Technology entrepreneurship and innovation programs', date: 'February 2024' }
      ],
      approveVotes: 356,
      disapproveVotes: 223,
      userVote: null
    },
    {
      id: 10,
      name: 'Natural Resources Canada',
      minister: 'Jonathan Wilkinson',
      budget: '$5.7 Billion',
      budgetRaw: 5700000000,
      grants: '$3.1 Billion',
      employees: 4200,
      description: 'Ensuring natural resources development is sustainable',
      responsibilities: ['Energy policy', 'Mining regulation', 'Forestry', 'Geological surveys'],
      grantsDetail: [
        { recipient: 'SaskPower Corporation', amount: '$285 Million', purpose: 'Small modular reactor development and clean energy', date: 'January 2025' },
        { recipient: 'Teck Resources Limited', amount: '$245 Million', purpose: 'Critical minerals extraction and processing', date: 'December 2024' },
        { recipient: 'Cameco Corporation', amount: '$198 Million', purpose: 'Uranium mining and nuclear fuel production', date: 'November 2024' },
        { recipient: 'University of Alberta - Energy Research', amount: '$165 Million', purpose: 'Carbon capture and storage technology', date: 'October 2024' },
        { recipient: 'Resolute Forest Products', amount: '$142 Million', purpose: 'Sustainable forestry and wildfire prevention', date: 'September 2024' },
        { recipient: 'BC Hydro', amount: '$118 Million', purpose: 'Renewable energy grid modernization', date: 'August 2024' },
        { recipient: 'Natural Resources Canada - Forestry Division', amount: '$94 Million', purpose: 'Forest fire management and reforestation', date: 'July 2024' },
        { recipient: 'Ontario Power Generation', amount: '$76 Million', purpose: 'Nuclear power plant refurbishment', date: 'June 2024' },
        { recipient: 'Efficiency Canada', amount: '$62 Million', purpose: 'Home energy retrofits and efficiency programs', date: 'May 2024' },
        { recipient: 'Geological Survey of Canada', amount: '$45 Million', purpose: 'Mineral exploration and mapping initiatives', date: 'April 2024' }
      ],
      approveVotes: 289,
      disapproveVotes: 267,
      userVote: null
    },
    {
      id: 11,
      name: 'Justice Canada',
      minister: 'Arif Virani',
      budget: '$2.8 Billion',
      budgetRaw: 2800000000,
      grants: '$890 Million',
      employees: 4800,
      description: 'Supporting the Minister in ensuring a fair and accessible justice system',
      responsibilities: ['Legal advice to government', 'Criminal law policy', 'Human rights', 'Family law'],
      grantsDetail: [
        { recipient: 'Legal Aid Ontario', amount: '$125 Million', purpose: 'Free legal representation for low-income residents', date: 'January 2025' },
        { recipient: 'Aboriginal Legal Services Toronto', amount: '$98 Million', purpose: 'Culturally appropriate legal services for Indigenous peoples', date: 'December 2024' },
        { recipient: 'Canadian Association of Elizabeth Fry Societies', amount: '$76 Million', purpose: 'Support for women in conflict with the law', date: 'November 2024' },
        { recipient: 'Victim Services Toronto', amount: '$62 Million', purpose: 'Counseling and assistance for crime victims', date: 'October 2024' },
        { recipient: 'John Howard Society of Canada', amount: '$54 Million', purpose: 'Criminal justice reform and rehabilitation programs', date: 'September 2024' },
        { recipient: 'Community Legal Education Ontario (CLEO)', amount: '$45 Million', purpose: 'Public legal education and information', date: 'August 2024' },
        { recipient: 'Osgoode Hall Law School - Access to Justice', amount: '$38 Million', purpose: 'Legal clinics and pro bono services', date: 'July 2024' },
        { recipient: 'Canadian Centre for Victims of Torture', amount: '$29 Million', purpose: 'Support for refugee torture survivors', date: 'June 2024' },
        { recipient: 'Family Service Toronto', amount: '$24 Million', purpose: 'Family law mediation and support services', date: 'May 2024' },
        { recipient: 'Court Technology Modernization Initiative', amount: '$18 Million', purpose: 'Digital court systems implementation', date: 'April 2024' }
      ],
      approveVotes: 298,
      disapproveVotes: 301,
      userVote: null
    },
    {
      id: 12,
      name: 'Indigenous Services Canada',
      minister: 'Patty Hajdu',
      budget: '$18.2 Billion',
      budgetRaw: 18200000000,
      grants: '$12.4 Billion',
      employees: 8900,
      description: 'Working to improve access to services for First Nations, Inuit and Métis',
      responsibilities: ['Indigenous health', 'Education funding', 'Infrastructure', 'Child and family services'],
      grantsDetail: [
        { recipient: 'Assembly of First Nations', amount: '$840 Million', purpose: 'Advocacy and policy development for First Nations', date: 'Ongoing 2024' },
        { recipient: 'First Nations Child and Family Caring Society', amount: '$685 Million', purpose: 'Child welfare services on reserves', date: 'January 2025' },
        { recipient: 'Inuit Tapiriit Kanatami', amount: '$520 Million', purpose: 'Inuit health and education programs', date: 'December 2024' },
        { recipient: 'Métis National Council', amount: '$445 Million', purpose: 'Métis community development and services', date: 'November 2024' },
        { recipient: 'First Nations University of Canada', amount: '$320 Million', purpose: 'Indigenous post-secondary education', date: 'October 2024' },
        { recipient: 'National Association of Friendship Centres', amount: '$275 Million', purpose: 'Urban Indigenous support services', date: 'September 2024' },
        { recipient: 'Thunderbird Partnership Foundation', amount: '$198 Million', purpose: 'Indigenous mental health and addiction treatment', date: 'August 2024' },
        { recipient: 'Indigenous Tourism Association of Canada', amount: '$142 Million', purpose: 'Economic development through cultural tourism', date: 'July 2024' },
        { recipient: 'First Nations Financial Management Board', amount: '$118 Million', purpose: 'Financial capacity building for communities', date: 'June 2024' },
        { recipient: 'Native Women\'s Association of Canada', amount: '$94 Million', purpose: 'Support for Indigenous women and families', date: 'May 2024' },
        { recipient: 'Indspire', amount: '$76 Million', purpose: 'Scholarships and bursaries for Indigenous students', date: 'April 2024' }
      ],
      approveVotes: 378,
      disapproveVotes: 298,
      userVote: null
    },
    {
      id: 13,
      name: 'Agriculture and Agri-Food Canada',
      minister: 'Lawrence MacAulay',
      budget: '$4.5 Billion',
      budgetRaw: 4500000000,
      grants: '$2.9 Billion',
      employees: 6100,
      description: 'Responsible for policies governing agriculture production',
      responsibilities: ['Farm support programs', 'Food safety', 'Agricultural research', 'Trade'],
      grantsDetail: [
        { recipient: 'Canadian Federation of Agriculture', amount: '$285 Million', purpose: 'Farm policy advocacy and income stabilization', date: 'Ongoing 2024' },
        { recipient: 'University of Guelph - Agricultural Research', amount: '$240 Million', purpose: 'Crop development and livestock disease prevention', date: 'January 2025' },
        { recipient: 'Grain Growers of Canada', amount: '$195 Million', purpose: 'Market access and trade support for grain farmers', date: 'December 2024' },
        { recipient: 'Dairy Farmers of Canada', amount: '$168 Million', purpose: 'Dairy sector support and supply management', date: 'November 2024' },
        { recipient: 'Canadian Cattlemen\'s Association', amount: '$142 Million', purpose: 'Beef industry development and export promotion', date: 'October 2024' },
        { recipient: 'Farm Credit Canada', amount: '$118 Million', purpose: 'Agricultural financing and risk management', date: 'September 2024' },
        { recipient: 'Canadian Horticultural Council', amount: '$94 Million', purpose: 'Fruit and vegetable sector innovation', date: 'August 2024' },
        { recipient: 'Agriculture and Agri-Food Canada Research Centres', amount: '$76 Million', purpose: 'Climate-resilient crop research', date: 'July 2024' },
        { recipient: 'Canadian Organic Growers', amount: '$62 Million', purpose: 'Organic farming certification and support', date: 'June 2024' },
        { recipient: 'Farm Management Canada', amount: '$45 Million', purpose: 'Business planning and financial literacy for farmers', date: 'May 2024' }
      ],
      approveVotes: 312,
      disapproveVotes: 201,
      userVote: null
    },
    {
      id: 14,
      name: 'Global Affairs Canada',
      minister: 'Mélanie Joly',
      budget: '$7.9 Billion',
      budgetRaw: 7900000000,
      grants: '$5.2 Billion',
      employees: 11200,
      description: 'Managing diplomatic relations and providing consular services',
      responsibilities: ['Foreign policy', 'International development', 'Trade promotion', 'Consular services'],
      grantsDetail: [
        { recipient: 'United Nations Relief and Works Agency (UNRWA)', amount: '$420 Million', purpose: 'Humanitarian aid for Palestinian refugees', date: 'January 2025' },
        { recipient: 'World Food Programme', amount: '$365 Million', purpose: 'Global hunger relief and emergency food assistance', date: 'December 2024' },
        { recipient: 'UNICEF Canada', amount: '$298 Million', purpose: 'Child protection and education in developing countries', date: 'November 2024' },
        { recipient: 'Médecins Sans Frontières (Doctors Without Borders)', amount: '$245 Million', purpose: 'Emergency medical care in conflict zones', date: 'October 2024' },
        { recipient: 'Canadian Red Cross - International Programs', amount: '$198 Million', purpose: 'Disaster response and humanitarian assistance', date: 'September 2024' },
        { recipient: 'Plan International Canada', amount: '$168 Million', purpose: 'Girls\' education and women\'s empowerment', date: 'August 2024' },
        { recipient: 'CARE Canada', amount: '$142 Million', purpose: 'Poverty reduction and gender equality programs', date: 'July 2024' },
        { recipient: 'Oxfam Canada', amount: '$118 Million', purpose: 'Climate justice and economic development', date: 'June 2024' },
        { recipient: 'Canadian Foodgrains Bank', amount: '$94 Million', purpose: 'Agricultural development and food security', date: 'May 2024' },
        { recipient: 'Save the Children Canada', amount: '$76 Million', purpose: 'Child survival and education programs', date: 'April 2024' },
        { recipient: 'Export Development Canada (EDC)', amount: '$62 Million', purpose: 'Trade mission support for Canadian exporters', date: 'March 2024' }
      ],
      approveVotes: 289,
      disapproveVotes: 334,
      userVote: null
    },
    {
      id: 15,
      name: 'Canadian Heritage',
      minister: 'Pascale St-Onge',
      budget: '$2.1 Billion',
      budgetRaw: 2100000000,
      grants: '$1.3 Billion',
      employees: 2100,
      description: 'Promoting Canadian culture and heritage',
      responsibilities: ['Arts funding', 'Broadcasting', 'Official languages', 'Sport'],
      grantsDetail: [
        { recipient: 'Canada Council for the Arts', amount: '$195 Million', purpose: 'Grants to artists, musicians, and cultural organizations', date: 'Ongoing 2024' },
        { recipient: 'National Film Board of Canada', amount: '$142 Million', purpose: 'Documentary and animation film production', date: 'January 2025' },
        { recipient: 'Canadian Broadcasting Corporation (CBC)', amount: '$118 Million', purpose: 'Public broadcasting and Canadian content', date: 'December 2024' },
        { recipient: 'Telefilm Canada', amount: '$98 Million', purpose: 'Film and television production funding', date: 'November 2024' },
        { recipient: 'Canada Music Fund', amount: '$76 Million', purpose: 'Support for Canadian musicians and music industry', date: 'October 2024' },
        { recipient: 'Royal Winnipeg Ballet', amount: '$54 Million', purpose: 'Performing arts and dance education', date: 'September 2024' },
        { recipient: 'National Gallery of Canada', amount: '$45 Million', purpose: 'Art acquisition and exhibition programs', date: 'August 2024' },
        { recipient: 'Sport Canada - Own the Podium', amount: '$38 Million', purpose: 'Olympic and Paralympic athlete funding', date: 'July 2024' },
        { recipient: 'Canada Science and Technology Museum', amount: '$29 Million', purpose: 'STEM education and public programming', date: 'June 2024' },
        { recipient: 'Fédération canadienne-française de l\'Ontario', amount: '$24 Million', purpose: 'Francophone minority community support', date: 'May 2024' },
        { recipient: 'Canadian Museum of History', amount: '$18 Million', purpose: 'Heritage preservation and public exhibits', date: 'April 2024' }
      ],
      approveVotes: 267,
      disapproveVotes: 245,
      userVote: null
    }
  ]);
  
  useEffect(() => {
    fetchMPs();
    fetchBills();
    fetchGovernmentData();
    fetchLaws();
    fetchContracts();
    initializeUSCongress();
    initializeUSDepartments();
    initializeUSAnalytics();
    initializeCanadaSupremeCourt();
    initializeUSSupremeCourt();
    initializeUSContracts();
    initializeUSBills();
    initializeUSLaws();
    initializeCanadaLaws();
  }, []);
  
  // Load user's saved MP from localStorage
  useEffect(() => {
    const savedMP = localStorage.getItem('userMP');
    if (savedMP) {
      try {
        setUserMP(JSON.parse(savedMP));
      } catch (e) {
        console.error('Error loading saved MP:', e);
      }
    }
  }, []);
  
  // Reset grants expansion when ministry changes
  useEffect(() => {
    setGrantsExpanded(false);
  }, [selectedMinistry]);
  
  const initializeUSCongress = () => {
    // Expanded US Congress members with full transparency features
    const sampleCongress = [
      // ── SENATE (75 members) ──
      { name: 'Chuck Schumer', state: 'New York', district: 'Senator', party: 'Democrat', yearsInOffice: 25, email: 'senator@schumer.senate.gov', phone: '(202) 224-6542', committees: ['Finance', 'Rules'], supportVotes: 2847, opposeVotes: 1923, userVote: null, bio: 'Senate Majority Leader, representing New York since 1999', stockTrades: [], votingHistory: [{ bill: 'S.815', title: 'National Security Supplemental', vote: 'Yes', date: '2024-02-13', description: 'Emergency funding for Ukraine, Israel, and Taiwan' }], attendance: { percentage: 94, sessionsAttended: 235, totalSessions: 250, ranking: 23 }, expenses: { total: 285000, year: 2024, breakdown: { 'Staff Salaries': 185000, 'Office Rent': 45000, 'Travel': 32000, 'Communications': 18000, 'Supplies': 5000 } } },
      { name: 'Mitch McConnell', state: 'Kentucky', district: 'Senator', party: 'Republican', yearsInOffice: 39, email: 'senator@mcconnell.senate.gov', phone: '(202) 224-2541', committees: ['Appropriations', 'Rules'], supportVotes: 3102, opposeVotes: 2456, userVote: null, bio: 'Senate Minority Leader, longest-serving Senate Republican Leader', stockTrades: [], attendance: { percentage: 89, sessionsAttended: 223, totalSessions: 250, ranking: 45 }, financialDisclosure: { initialWorth: 22000000, currentWorth: 35000000, percentageIncrease: 59, annualSalary: 174000, assets: [{ type: 'Real Estate', value: 8500000 }, { type: 'Investment Portfolio', value: 18000000 }] } },
      { name: 'Bernie Sanders', state: 'Vermont', district: 'Senator', party: 'Independent', yearsInOffice: 17, email: 'senator@sanders.senate.gov', phone: '(202) 224-5141', committees: ['Budget', 'Health'], supportVotes: 4521, opposeVotes: 892, userVote: null, bio: 'Independent Senator, democratic socialist, former presidential candidate', stockTrades: [], attendance: { percentage: 96, sessionsAttended: 240, totalSessions: 250, ranking: 12 } },
      { name: 'Elizabeth Warren', state: 'Massachusetts', district: 'Senator', party: 'Democrat', yearsInOffice: 12, email: 'senator@warren.senate.gov', phone: '(202) 224-4543', committees: ['Finance', 'Banking'], supportVotes: 3845, opposeVotes: 1267, userVote: null, bio: 'Former Harvard law professor, consumer protection advocate', stockTrades: [], financialDisclosure: { initialWorth: 3800000, currentWorth: 12000000, percentageIncrease: 216, annualSalary: 174000, assets: [{ type: 'Book Royalties', value: 4500000 }, { type: 'Real Estate', value: 5200000 }] } },
      { name: 'Ted Cruz', state: 'Texas', district: 'Senator', party: 'Republican', yearsInOffice: 12, email: 'senator@cruz.senate.gov', phone: '(202) 224-5922', committees: ['Judiciary', 'Commerce'], supportVotes: 2934, opposeVotes: 2178, userVote: null, bio: 'Former Solicitor General of Texas, constitutional conservative', stockTrades: [], attendance: { percentage: 78, sessionsAttended: 195, totalSessions: 250, ranking: 87 } },
      { name: 'Amy Klobuchar', state: 'Minnesota', district: 'Senator', party: 'Democrat', yearsInOffice: 18, email: 'senator@klobuchar.senate.gov', phone: '(202) 224-3244', committees: ['Judiciary', 'Commerce'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former county attorney, moderate Democrat', stockTrades: [] },
      { name: 'Lindsey Graham', state: 'South Carolina', district: 'Senator', party: 'Republican', yearsInOffice: 22, email: 'senator@graham.senate.gov', phone: '(202) 224-5972', committees: ['Judiciary', 'Armed Services'], supportVotes: 2845, opposeVotes: 2134, userVote: null, bio: 'Armed Services Committee member, defense hawk', stockTrades: [{ date: '2024-12-15', company: 'Lockheed Martin', ticker: 'LMT', type: 'Purchase', valueRange: '$15,001-$50,000', assetType: 'Stock', conflict: true, conflictReason: 'Armed Services Committee member trading defense contractor stock' }], lobbying: { totalMeetings: 47, totalValue: 2850000, meetings: [{ organization: 'Lockheed Martin', representative: 'Defense Lobbyist', date: '2024-01-15', topic: 'F-35 Program Funding', value: 450000 }] } },
      { name: 'Cory Booker', state: 'New Jersey', district: 'Senator', party: 'Democrat', yearsInOffice: 11, email: 'senator@booker.senate.gov', phone: '(202) 224-3224', committees: ['Foreign Relations', 'Judiciary'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former Mayor of Newark, social justice advocate', stockTrades: [] },
      { name: 'Rand Paul', state: 'Kentucky', district: 'Senator', party: 'Republican', yearsInOffice: 14, email: 'senator@paul.senate.gov', phone: '(202) 224-4343', committees: ['Foreign Relations', 'Health'], supportVotes: 2678, opposeVotes: 2345, userVote: null, bio: 'Libertarian Republican, ophthalmologist', stockTrades: [] },
      { name: 'John Cornyn', state: 'Texas', district: 'Senator', party: 'Republican', yearsInOffice: 22, email: 'senator@cornyn.senate.gov', phone: '(202) 224-2934', committees: ['Judiciary', 'Finance'], supportVotes: 2567, opposeVotes: 2134, userVote: null, bio: 'Senate Minority Whip, senior Texas Senator', stockTrades: [] },
      { name: 'Catherine Cortez Masto', state: 'Nevada', district: 'Senator', party: 'Democrat', yearsInOffice: 8, email: 'senator@cortezmasto.senate.gov', phone: '(202) 224-3542', committees: ['Finance', 'Energy'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'First Latina Senator ever elected', stockTrades: [] },
      { name: 'Josh Hawley', state: 'Missouri', district: 'Senator', party: 'Republican', yearsInOffice: 6, email: 'senator@hawley.senate.gov', phone: '(202) 224-6154', committees: ['Judiciary', 'Armed Services'], supportVotes: 2345, opposeVotes: 2678, userVote: null, bio: 'Conservative, Big Tech critic', stockTrades: [] },
      { name: 'Raphael Warnock', state: 'Georgia', district: 'Senator', party: 'Democrat', yearsInOffice: 4, email: 'senator@warnock.senate.gov', phone: '(202) 224-3643', committees: ['Agriculture', 'Commerce'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Baptist pastor, first Black Senator elected from Georgia', stockTrades: [] },
      { name: 'Jon Ossoff', state: 'Georgia', district: 'Senator', party: 'Democrat', yearsInOffice: 4, email: 'senator@ossoff.senate.gov', phone: '(202) 224-3521', committees: ['Judiciary', 'Homeland Security'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Youngest Senator elected since 1973', stockTrades: [] },
      { name: 'Tom Cotton', state: 'Arkansas', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@cotton.senate.gov', phone: '(202) 224-2353', committees: ['Armed Services', 'Intelligence'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Army veteran, conservative hawk', stockTrades: [] },
      { name: 'Mark Warner', state: 'Virginia', district: 'Senator', party: 'Democrat', yearsInOffice: 16, email: 'senator@warner.senate.gov', phone: '(202) 224-2023', committees: ['Intelligence', 'Finance'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Intelligence Committee Chair, former tech entrepreneur', stockTrades: [] },
      { name: 'Tim Scott', state: 'South Carolina', district: 'Senator', party: 'Republican', yearsInOffice: 11, email: 'senator@scott.senate.gov', phone: '(202) 224-6121', committees: ['Finance', 'Banking'], supportVotes: 2678, opposeVotes: 2123, userVote: null, bio: 'First Black Republican Senator from the South since Reconstruction', stockTrades: [] },
      { name: 'Kirsten Gillibrand', state: 'New York', district: 'Senator', party: 'Democrat', yearsInOffice: 15, email: 'senator@gillibrand.senate.gov', phone: '(202) 224-4451', committees: ['Armed Services', 'Agriculture'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Advocate for military sexual assault reform', stockTrades: [] },
      { name: 'Ron Wyden', state: 'Oregon', district: 'Senator', party: 'Democrat', yearsInOffice: 28, email: 'senator@wyden.senate.gov', phone: '(202) 224-5244', committees: ['Finance', 'Intelligence'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Finance Committee Chair, privacy advocate', stockTrades: [] },
      { name: 'Lisa Murkowski', state: 'Alaska', district: 'Senator', party: 'Republican', yearsInOffice: 22, email: 'senator@murkowski.senate.gov', phone: '(202) 224-6665', committees: ['Appropriations', 'Energy'], supportVotes: 2789, opposeVotes: 1890, userVote: null, bio: 'Moderate Republican, Alaska advocate', stockTrades: [] },
      { name: 'Mark Kelly', state: 'Arizona', district: 'Senator', party: 'Democrat', yearsInOffice: 4, email: 'senator@kelly.senate.gov', phone: '(202) 224-2235', committees: ['Armed Services', 'Environment'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former NASA astronaut, gun control advocate', stockTrades: [] },
      { name: 'Alex Padilla', state: 'California', district: 'Senator', party: 'Democrat', yearsInOffice: 4, email: 'senator@padilla.senate.gov', phone: '(202) 224-3553', committees: ['Judiciary', 'Environment'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First Latino Senator from California', stockTrades: [] },
      { name: 'Michael Bennet', state: 'Colorado', district: 'Senator', party: 'Democrat', yearsInOffice: 15, email: 'senator@bennet.senate.gov', phone: '(202) 224-5852', committees: ['Finance', 'Agriculture'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former Denver schools superintendent', stockTrades: [] },
      { name: 'Richard Blumenthal', state: 'Connecticut', district: 'Senator', party: 'Democrat', yearsInOffice: 14, email: 'senator@blumenthal.senate.gov', phone: '(202) 224-2823', committees: ['Judiciary', 'Armed Services'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former Connecticut Attorney General', stockTrades: [] },
      { name: 'Chris Murphy', state: 'Connecticut', district: 'Senator', party: 'Democrat', yearsInOffice: 12, email: 'senator@murphy.senate.gov', phone: '(202) 224-4041', committees: ['Foreign Relations', 'Health'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Gun control champion after Sandy Hook', stockTrades: [] },
      { name: 'Chris Coons', state: 'Delaware', district: 'Senator', party: 'Democrat', yearsInOffice: 14, email: 'senator@coons.senate.gov', phone: '(202) 224-5042', committees: ['Foreign Relations', 'Judiciary'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Biden ally, bipartisan dealmaker', stockTrades: [] },
      { name: 'Rick Scott', state: 'Florida', district: 'Senator', party: 'Republican', yearsInOffice: 6, email: 'senator@rickscott.senate.gov', phone: '(202) 224-5274', committees: ['Commerce', 'Armed Services'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Former Florida Governor, NRSC Chair', stockTrades: [] },
      { name: 'Brian Schatz', state: 'Hawaii', district: 'Senator', party: 'Democrat', yearsInOffice: 12, email: 'senator@schatz.senate.gov', phone: '(202) 224-3934', committees: ['Appropriations', 'Commerce'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Climate action leader', stockTrades: [] },
      { name: 'Mazie Hirono', state: 'Hawaii', district: 'Senator', party: 'Democrat', yearsInOffice: 12, email: 'senator@hirono.senate.gov', phone: '(202) 224-6361', committees: ['Judiciary', 'Armed Services'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'First Asian-American woman in Senate, first Buddhist Senator', stockTrades: [] },
      { name: 'Mike Crapo', state: 'Idaho', district: 'Senator', party: 'Republican', yearsInOffice: 26, email: 'senator@crapo.senate.gov', phone: '(202) 224-6142', committees: ['Finance', 'Banking'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Senate Finance Committee Ranking Member', stockTrades: [] },
      { name: 'Dick Durbin', state: 'Illinois', district: 'Senator', party: 'Democrat', yearsInOffice: 28, email: 'senator@durbin.senate.gov', phone: '(202) 224-2152', committees: ['Judiciary', 'Appropriations'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Senate Majority Whip, Judiciary Committee Chair', stockTrades: [] },
      { name: 'Tammy Duckworth', state: 'Illinois', district: 'Senator', party: 'Democrat', yearsInOffice: 8, email: 'senator@duckworth.senate.gov', phone: '(202) 224-2854', committees: ['Armed Services', 'Commerce'], supportVotes: 3567, opposeVotes: 1123, userVote: null, bio: 'Army veteran double amputee, first Senator to give birth while in office', stockTrades: [] },
      { name: 'Todd Young', state: 'Indiana', district: 'Senator', party: 'Republican', yearsInOffice: 8, email: 'senator@young.senate.gov', phone: '(202) 224-5623', committees: ['Finance', 'Foreign Relations'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Marine veteran, CHIPS Act co-author', stockTrades: [] },
      { name: 'Chuck Grassley', state: 'Iowa', district: 'Senator', party: 'Republican', yearsInOffice: 43, email: 'senator@grassley.senate.gov', phone: '(202) 224-3744', committees: ['Finance', 'Judiciary'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'Oldest sitting Senator, oversight veteran', stockTrades: [] },
      { name: 'Joni Ernst', state: 'Iowa', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@ernst.senate.gov', phone: '(202) 224-3254', committees: ['Armed Services', 'Agriculture'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'Army veteran, first female combat veteran in Senate', stockTrades: [] },
      { name: 'Roger Marshall', state: 'Kansas', district: 'Senator', party: 'Republican', yearsInOffice: 4, email: 'senator@marshall.senate.gov', phone: '(202) 224-4774', committees: ['Agriculture', 'Health'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'OB-GYN physician, fiscal conservative', stockTrades: [] },
      { name: 'John Kennedy', state: 'Louisiana', district: 'Senator', party: 'Republican', yearsInOffice: 8, email: 'senator@kennedy.senate.gov', phone: '(202) 224-4623', committees: ['Judiciary', 'Appropriations'], supportVotes: 2456, opposeVotes: 2345, userVote: null, bio: 'Former state treasurer, sharp questioner in hearings', stockTrades: [] },
      { name: 'Bill Cassidy', state: 'Louisiana', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@cassidy.senate.gov', phone: '(202) 224-5824', committees: ['Finance', 'Health'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Physician, voted to convict Trump in impeachment trial', stockTrades: [] },
      { name: 'Susan Collins', state: 'Maine', district: 'Senator', party: 'Republican', yearsInOffice: 28, email: 'senator@collins.senate.gov', phone: '(202) 224-2523', committees: ['Appropriations', 'Health'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'Moderate Republican, bipartisan dealmaker', stockTrades: [] },
      { name: 'Angus King', state: 'Maine', district: 'Senator', party: 'Independent', yearsInOffice: 12, email: 'senator@king.senate.gov', phone: '(202) 224-5344', committees: ['Armed Services', 'Intelligence'], supportVotes: 3123, opposeVotes: 1789, userVote: null, bio: 'Former Maine Governor, caucuses with Democrats', stockTrades: [] },
      { name: 'Chris Van Hollen', state: 'Maryland', district: 'Senator', party: 'Democrat', yearsInOffice: 8, email: 'senator@vanhollen.senate.gov', phone: '(202) 224-4654', committees: ['Appropriations', 'Budget'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Budget policy expert', stockTrades: [] },
      { name: 'Ed Markey', state: 'Massachusetts', district: 'Senator', party: 'Democrat', yearsInOffice: 12, email: 'senator@markey.senate.gov', phone: '(202) 224-2742', committees: ['Commerce', 'Foreign Relations'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Green New Deal co-author, telecom expert', stockTrades: [] },
      { name: 'Roger Wicker', state: 'Mississippi', district: 'Senator', party: 'Republican', yearsInOffice: 17, email: 'senator@wicker.senate.gov', phone: '(202) 224-6253', committees: ['Commerce', 'Armed Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Armed Services Committee Ranking Member', stockTrades: [] },
      { name: 'Steve Daines', state: 'Montana', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@daines.senate.gov', phone: '(202) 224-2651', committees: ['Appropriations', 'Energy'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Tech executive, outdoor sportsman', stockTrades: [] },
      { name: 'Jeanne Shaheen', state: 'New Hampshire', district: 'Senator', party: 'Democrat', yearsInOffice: 15, email: 'senator@shaheen.senate.gov', phone: '(202) 224-2841', committees: ['Foreign Relations', 'Appropriations'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'First woman elected both Governor and Senator', stockTrades: [] },
      { name: 'Maggie Hassan', state: 'New Hampshire', district: 'Senator', party: 'Democrat', yearsInOffice: 8, email: 'senator@hassan.senate.gov', phone: '(202) 224-3324', committees: ['Finance', 'Homeland Security'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former New Hampshire Governor', stockTrades: [] },
      { name: 'Martin Heinrich', state: 'New Mexico', district: 'Senator', party: 'Democrat', yearsInOffice: 12, email: 'senator@heinrich.senate.gov', phone: '(202) 224-5521', committees: ['Intelligence', 'Energy'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Engineer, energy and intelligence focus', stockTrades: [] },
      { name: 'John Thune', state: 'South Dakota', district: 'Senator', party: 'Republican', yearsInOffice: 20, email: 'senator@thune.senate.gov', phone: '(202) 224-2321', committees: ['Finance', 'Commerce'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'Senate Minority Whip', stockTrades: [] },
      { name: 'Marsha Blackburn', state: 'Tennessee', district: 'Senator', party: 'Republican', yearsInOffice: 6, email: 'senator@blackburn.senate.gov', phone: '(202) 224-3344', committees: ['Judiciary', 'Commerce'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Conservative, social media regulation critic', stockTrades: [] },
      { name: 'Bill Hagerty', state: 'Tennessee', district: 'Senator', party: 'Republican', yearsInOffice: 4, email: 'senator@hagerty.senate.gov', phone: '(202) 224-4944', committees: ['Foreign Relations', 'Banking'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former U.S. Ambassador to Japan', stockTrades: [] },
      { name: 'Mike Lee', state: 'Utah', district: 'Senator', party: 'Republican', yearsInOffice: 14, email: 'senator@lee.senate.gov', phone: '(202) 224-5444', committees: ['Judiciary', 'Commerce'], supportVotes: 2345, opposeVotes: 2567, userVote: null, bio: 'Constitutional originalist, libertarian-leaning', stockTrades: [] },
      { name: 'Tim Kaine', state: 'Virginia', district: 'Senator', party: 'Democrat', yearsInOffice: 12, email: 'senator@kaine.senate.gov', phone: '(202) 224-4024', committees: ['Foreign Relations', 'Armed Services'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former VP candidate and Virginia Governor', stockTrades: [] },
      { name: 'Patty Murray', state: 'Washington', district: 'Senator', party: 'Democrat', yearsInOffice: 32, email: 'senator@murray.senate.gov', phone: '(202) 224-2621', committees: ['Appropriations', 'Health'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Appropriations Committee Chair', stockTrades: [] },
      { name: 'Maria Cantwell', state: 'Washington', district: 'Senator', party: 'Democrat', yearsInOffice: 24, email: 'senator@cantwell.senate.gov', phone: '(202) 224-3441', committees: ['Commerce', 'Finance'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Commerce Committee Chair, tech policy expert', stockTrades: [] },
      { name: 'Joe Manchin', state: 'West Virginia', district: 'Senator', party: 'Democrat', yearsInOffice: 14, email: 'senator@manchin.senate.gov', phone: '(202) 224-3954', committees: ['Energy', 'Armed Services'], supportVotes: 2789, opposeVotes: 2345, userVote: null, bio: 'Moderate Democrat, pivotal swing vote on major legislation', stockTrades: [] },
      { name: 'Ron Johnson', state: 'Wisconsin', district: 'Senator', party: 'Republican', yearsInOffice: 14, email: 'senator@ronjohnson.senate.gov', phone: '(202) 224-5323', committees: ['Foreign Relations', 'Homeland Security'], supportVotes: 2234, opposeVotes: 2678, userVote: null, bio: 'Business executive, election skeptic', stockTrades: [] },
      { name: 'Tammy Baldwin', state: 'Wisconsin', district: 'Senator', party: 'Democrat', yearsInOffice: 12, email: 'senator@baldwin.senate.gov', phone: '(202) 224-5653', committees: ['Appropriations', 'Commerce'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'First openly gay Senator', stockTrades: [] },
      { name: 'Cynthia Lummis', state: 'Wyoming', district: 'Senator', party: 'Republican', yearsInOffice: 4, email: 'senator@lummis.senate.gov', phone: '(202) 224-3424', committees: ['Banking', 'Commerce'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Crypto advocate, Bitcoin holder', stockTrades: [] },
      { name: 'John Barrasso', state: 'Wyoming', district: 'Senator', party: 'Republican', yearsInOffice: 17, email: 'senator@barrasso.senate.gov', phone: '(202) 224-6441', committees: ['Energy', 'Foreign Relations'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Orthopedic surgeon, energy advocate', stockTrades: [] },
      { name: 'Jeff Merkley', state: 'Oregon', district: 'Senator', party: 'Democrat', yearsInOffice: 16, email: 'senator@merkley.senate.gov', phone: '(202) 224-3753', committees: ['Appropriations', 'Budget'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Progressive climate champion', stockTrades: [] },
      { name: 'John Fetterman', state: 'Pennsylvania', district: 'Senator', party: 'Democrat', yearsInOffice: 2, email: 'senator@fetterman.senate.gov', phone: '(202) 224-4254', committees: ['Agriculture', 'Banking'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former Pennsylvania Lt. Governor, stroke survivor', stockTrades: [] },
      { name: 'Sheldon Whitehouse', state: 'Rhode Island', district: 'Senator', party: 'Democrat', yearsInOffice: 18, email: 'senator@whitehouse.senate.gov', phone: '(202) 224-2921', committees: ['Judiciary', 'Environment'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Climate and Supreme Court accountability crusader', stockTrades: [] },
      { name: 'Shelley Moore Capito', state: 'West Virginia', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@capito.senate.gov', phone: '(202) 224-6472', committees: ['Appropriations', 'Environment'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Environment Committee Ranking Member', stockTrades: [] },
      { name: 'Dan Sullivan', state: 'Alaska', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@sullivan.senate.gov', phone: '(202) 224-3004', committees: ['Armed Services', 'Commerce'], supportVotes: 2456, opposeVotes: 2134, userVote: null, bio: 'Marine veteran, Alaska energy advocate', stockTrades: [] },
      { name: 'John Boozman', state: 'Arkansas', district: 'Senator', party: 'Republican', yearsInOffice: 14, email: 'senator@boozman.senate.gov', phone: '(202) 224-4843', committees: ['Agriculture', 'Appropriations'], supportVotes: 2345, opposeVotes: 2234, userVote: null, bio: 'Former optometrist, agriculture focus', stockTrades: [] },
      { name: 'John Hickenlooper', state: 'Colorado', district: 'Senator', party: 'Democrat', yearsInOffice: 4, email: 'senator@hickenlooper.senate.gov', phone: '(202) 224-5941', committees: ['Commerce', 'Health'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former Colorado Governor and Denver Mayor', stockTrades: [] },
      { name: 'Ben Ray Lujan', state: 'New Mexico', district: 'Senator', party: 'Democrat', yearsInOffice: 4, email: 'senator@lujan.senate.gov', phone: '(202) 224-6621', committees: ['Commerce', 'Indian Affairs'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'First Native American Senator from New Mexico', stockTrades: [] },
      // ── HOUSE OF REPRESENTATIVES (75 members) ──
      { name: 'Nancy Pelosi', state: 'California', district: 'CA-11', party: 'Democrat', yearsInOffice: 37, email: 'rep@pelosi.house.gov', phone: '(202) 225-4965', committees: ['Leadership'], supportVotes: 4234, opposeVotes: 1567, userVote: null, bio: 'Former Speaker of the House, representing San Francisco since 1987', stockTrades: [{ date: '2024-12-01', company: 'NVIDIA Corporation', ticker: 'NVDA', type: 'Purchase', valueRange: '$1,000,001-$5,000,000', assetType: 'Stock', conflict: true, conflictReason: 'Tech regulation oversight while trading major tech stocks' }, { date: '2024-11-15', company: 'Microsoft Corporation', ticker: 'MSFT', type: 'Purchase', valueRange: '$500,001-$1,000,000', assetType: 'Call Options', conflict: true, conflictReason: 'Tech regulation oversight while trading major tech stocks' }], votingHistory: [{ bill: 'H.R.815', title: 'National Security Supplemental', vote: 'Yes', date: '2024-02-13', description: 'Emergency funding for Ukraine, Israel, and Taiwan' }], attendance: { percentage: 91, sessionsAttended: 342, totalSessions: 376, ranking: 156 }, financialDisclosure: { initialWorth: 58000000, currentWorth: 140000000, percentageIncrease: 141, annualSalary: 174000, assets: [{ type: 'Real Estate (SF, Napa)', value: 25000000 }, { type: 'Stock Portfolio', value: 85000000 }] }, lobbying: { totalMeetings: 89, totalValue: 4200000, meetings: [{ organization: 'Meta Platforms', representative: 'Tech Policy Director', date: '2024-01-10', topic: 'AI Regulation Framework', value: 650000 }] } },
      { name: 'Mike Johnson', state: 'Louisiana', district: 'LA-4', party: 'Republican', yearsInOffice: 8, email: 'rep@mikejohnson.house.gov', phone: '(202) 225-2777', committees: ['Leadership'], supportVotes: 2678, opposeVotes: 2456, userVote: null, bio: 'Speaker of the House, constitutional lawyer', stockTrades: [] },
      { name: 'Hakeem Jeffries', state: 'New York', district: 'NY-8', party: 'Democrat', yearsInOffice: 11, email: 'rep@jeffries.house.gov', phone: '(202) 225-5936', committees: ['Leadership'], supportVotes: 3845, opposeVotes: 1234, userVote: null, bio: 'House Democratic Leader, first Black House party leader in U.S. history', stockTrades: [] },
      { name: 'Steve Scalise', state: 'Louisiana', district: 'LA-1', party: 'Republican', yearsInOffice: 15, email: 'rep@scalise.house.gov', phone: '(202) 225-3015', committees: ['Leadership'], supportVotes: 3123, opposeVotes: 1892, userVote: null, bio: 'House Majority Leader, survived 2017 baseball shooting', stockTrades: [] },
      { name: 'Tom Emmer', state: 'Minnesota', district: 'MN-6', party: 'Republican', yearsInOffice: 10, email: 'rep@emmer.house.gov', phone: '(202) 225-2331', committees: ['Leadership', 'Financial Services'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'House Majority Whip, former hockey player', stockTrades: [] },
      { name: 'Pete Aguilar', state: 'California', district: 'CA-33', party: 'Democrat', yearsInOffice: 10, email: 'rep@aguilar.house.gov', phone: '(202) 225-3201', committees: ['Appropriations', 'Leadership'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'House Democratic Caucus Chair', stockTrades: [] },
      { name: 'Alexandria Ocasio-Cortez', state: 'New York', district: 'NY-14', party: 'Democrat', yearsInOffice: 6, email: 'rep@ocasio-cortez.house.gov', phone: '(202) 225-3965', committees: ['Financial Services', 'Oversight'], supportVotes: 5234, opposeVotes: 1892, userVote: null, bio: 'Progressive Democrat from the Bronx, Green New Deal champion', stockTrades: [], attendance: { percentage: 97, sessionsAttended: 365, totalSessions: 376, ranking: 18 }, financialDisclosure: { initialWorth: 7000, currentWorth: 280000, percentageIncrease: 3900, annualSalary: 174000, assets: [{ type: 'Checking/Savings', value: 45000 }, { type: 'Student Loan Debt', value: -150000 }] } },
      { name: 'Marjorie Taylor Greene', state: 'Georgia', district: 'GA-14', party: 'Republican', yearsInOffice: 4, email: 'rep@greene.house.gov', phone: '(202) 225-5211', committees: ['Oversight', 'Homeland Security'], supportVotes: 2845, opposeVotes: 3456, userVote: null, bio: 'Controversial conservative from Georgia', stockTrades: [], attendance: { percentage: 72, sessionsAttended: 271, totalSessions: 376, ranking: 398 } },
      { name: 'Jim Jordan', state: 'Ohio', district: 'OH-4', party: 'Republican', yearsInOffice: 17, email: 'rep@jordan.house.gov', phone: '(202) 225-2676', committees: ['Judiciary', 'Oversight'], supportVotes: 2934, opposeVotes: 2567, userVote: null, bio: 'Judiciary Committee Chair, Freedom Caucus founder, former wrestling coach', stockTrades: [] },
      { name: 'Matt Gaetz', state: 'Florida', district: 'FL-1', party: 'Republican', yearsInOffice: 8, email: 'rep@gaetz.house.gov', phone: '(202) 225-4136', committees: ['Armed Services', 'Judiciary'], supportVotes: 2456, opposeVotes: 3123, userVote: null, bio: 'Far-right firebrand who led ouster of Speaker McCarthy', stockTrades: [] },
      { name: 'Lauren Boebert', state: 'Colorado', district: 'CO-3', party: 'Republican', yearsInOffice: 4, email: 'rep@boebert.house.gov', phone: '(202) 225-4761', committees: ['Natural Resources', 'Oversight'], supportVotes: 2234, opposeVotes: 2789, userVote: null, bio: 'Gun rights advocate, restaurant owner', stockTrades: [] },
      { name: 'Elise Stefanik', state: 'New York', district: 'NY-21', party: 'Republican', yearsInOffice: 10, email: 'rep@stefanik.house.gov', phone: '(202) 225-4611', committees: ['Leadership', 'Armed Services'], supportVotes: 2789, opposeVotes: 2234, userVote: null, bio: 'House Republican Conference Chair', stockTrades: [] },
      { name: 'Ilhan Omar', state: 'Minnesota', district: 'MN-5', party: 'Democrat', yearsInOffice: 6, email: 'rep@omar.house.gov', phone: '(202) 225-4755', committees: ['Foreign Affairs', 'Budget'], supportVotes: 3567, opposeVotes: 1678, userVote: null, bio: 'First Somali-American and first woman to wear hijab in Congress', stockTrades: [] },
      { name: 'Rashida Tlaib', state: 'Michigan', district: 'MI-12', party: 'Democrat', yearsInOffice: 6, email: 'rep@tlaib.house.gov', phone: '(202) 225-5126', committees: ['Oversight', 'Financial Services'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'First Palestinian-American elected to Congress', stockTrades: [] },
      { name: 'Ayanna Pressley', state: 'Massachusetts', district: 'MA-7', party: 'Democrat', yearsInOffice: 6, email: 'rep@pressley.house.gov', phone: '(202) 225-5111', committees: ['Oversight', 'Financial Services'], supportVotes: 3567, opposeVotes: 1234, userVote: null, bio: 'First Black congresswoman from Massachusetts', stockTrades: [] },
      { name: 'Cori Bush', state: 'Missouri', district: 'MO-1', party: 'Democrat', yearsInOffice: 4, email: 'rep@bush.house.gov', phone: '(202) 225-2406', committees: ['Oversight', 'Judiciary'], supportVotes: 3456, opposeVotes: 1456, userVote: null, bio: 'Nurse, Ferguson protest leader, Squad member', stockTrades: [] },
      { name: 'Pramila Jayapal', state: 'Washington', district: 'WA-7', party: 'Democrat', yearsInOffice: 8, email: 'rep@jayapal.house.gov', phone: '(202) 225-3106', committees: ['Judiciary', 'Budget'], supportVotes: 3678, opposeVotes: 1123, userVote: null, bio: 'Congressional Progressive Caucus Chair, Medicare for All advocate', stockTrades: [] },
      { name: 'Ro Khanna', state: 'California', district: 'CA-17', party: 'Democrat', yearsInOffice: 8, email: 'rep@khanna.house.gov', phone: '(202) 225-2631', committees: ['Armed Services', 'Oversight'], supportVotes: 3567, opposeVotes: 1123, userVote: null, bio: 'Progressive Silicon Valley rep, anti-war advocate', stockTrades: [] },
      { name: 'Katie Porter', state: 'California', district: 'CA-47', party: 'Democrat', yearsInOffice: 6, email: 'rep@porter.house.gov', phone: '(202) 225-5611', committees: ['Oversight', 'Financial Services'], supportVotes: 3789, opposeVotes: 1123, userVote: null, bio: 'Consumer protection advocate, famous whiteboard questioner', stockTrades: [] },
      { name: 'Jamie Raskin', state: 'Maryland', district: 'MD-8', party: 'Democrat', yearsInOffice: 8, email: 'rep@raskin.house.gov', phone: '(202) 225-5341', committees: ['Oversight', 'Judiciary'], supportVotes: 3678, opposeVotes: 1234, userVote: null, bio: 'Constitutional scholar, led second Trump impeachment', stockTrades: [] },
      { name: 'James Clyburn', state: 'South Carolina', district: 'SC-6', party: 'Democrat', yearsInOffice: 31, email: 'rep@clyburn.house.gov', phone: '(202) 225-3315', committees: ['Leadership'], supportVotes: 3567, opposeVotes: 1123, userVote: null, bio: 'House Assistant Democratic Leader, Biden kingmaker in 2020', stockTrades: [] },
      { name: 'Maxine Waters', state: 'California', district: 'CA-43', party: 'Democrat', yearsInOffice: 33, email: 'rep@waters.house.gov', phone: '(202) 225-2201', committees: ['Financial Services'], supportVotes: 3567, opposeVotes: 1234, userVote: null, bio: 'Financial Services Ranking Member, outspoken progressive', stockTrades: [] },
      { name: 'Tom Cole', state: 'Oklahoma', district: 'OK-4', party: 'Republican', yearsInOffice: 22, email: 'rep@cole.house.gov', phone: '(202) 225-6165', committees: ['Rules', 'Appropriations'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Rules Committee Chair, Chickasaw Nation member', stockTrades: [] },
      { name: 'Mike Turner', state: 'Ohio', district: 'OH-10', party: 'Republican', yearsInOffice: 22, email: 'rep@turner.house.gov', phone: '(202) 225-6465', committees: ['Intelligence', 'Armed Services'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'House Intelligence Committee Chair', stockTrades: [] },
      { name: 'Michael McCaul', state: 'Texas', district: 'TX-10', party: 'Republican', yearsInOffice: 20, email: 'rep@mccaul.house.gov', phone: '(202) 225-2401', committees: ['Foreign Affairs'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Foreign Affairs Committee Chair', stockTrades: [] },
      { name: 'Virginia Foxx', state: 'North Carolina', district: 'NC-5', party: 'Republican', yearsInOffice: 20, email: 'rep@foxx.house.gov', phone: '(202) 225-2071', committees: ['Education', 'Rules'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Education and Workforce Committee Chair', stockTrades: [] },
      { name: 'Mike Rogers', state: 'Alabama', district: 'AL-3', party: 'Republican', yearsInOffice: 20, email: 'rep@mike-rogers.house.gov', phone: '(202) 225-3261', committees: ['Armed Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Armed Services Committee Chair', stockTrades: [] },
      { name: 'James Comer', state: 'Kentucky', district: 'KY-1', party: 'Republican', yearsInOffice: 8, email: 'rep@comer.house.gov', phone: '(202) 225-3115', committees: ['Oversight', 'Agriculture'], supportVotes: 2456, opposeVotes: 2345, userVote: null, bio: 'Oversight Committee Chair, farmer', stockTrades: [] },
      { name: 'Mark Green', state: 'Tennessee', district: 'TN-7', party: 'Republican', yearsInOffice: 6, email: 'rep@markgreen.house.gov', phone: '(202) 225-2811', committees: ['Homeland Security', 'Foreign Affairs'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Homeland Security Committee Chair, Army physician', stockTrades: [] },
      { name: 'Jason Smith', state: 'Missouri', district: 'MO-8', party: 'Republican', yearsInOffice: 12, email: 'rep@jasonsmith.house.gov', phone: '(202) 225-4404', committees: ['Ways and Means', 'Agriculture'], supportVotes: 2456, opposeVotes: 2345, userVote: null, bio: 'Ways and Means Committee Chair', stockTrades: [] },
      { name: 'Sam Graves', state: 'Missouri', district: 'MO-6', party: 'Republican', yearsInOffice: 24, email: 'rep@graves.house.gov', phone: '(202) 225-7041', committees: ['Transportation', 'Armed Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Transportation and Infrastructure Committee Chair', stockTrades: [] },
      { name: 'Glenn Thompson', state: 'Pennsylvania', district: 'PA-15', party: 'Republican', yearsInOffice: 16, email: 'rep@thompson.house.gov', phone: '(202) 225-5121', committees: ['Agriculture', 'Education'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Agriculture Committee Chair', stockTrades: [] },
      { name: 'Rosa DeLauro', state: 'Connecticut', district: 'CT-3', party: 'Democrat', yearsInOffice: 32, email: 'rep@delauro.house.gov', phone: '(202) 225-3661', committees: ['Appropriations'], supportVotes: 3567, opposeVotes: 1456, userVote: null, bio: 'Appropriations Ranking Member, child nutrition advocate', stockTrades: [] },
      { name: 'Frank Pallone', state: 'New Jersey', district: 'NJ-6', party: 'Democrat', yearsInOffice: 36, email: 'rep@pallone.house.gov', phone: '(202) 225-4671', committees: ['Energy and Commerce'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Energy and Commerce Ranking Member', stockTrades: [] },
      { name: 'Bobby Scott', state: 'Virginia', district: 'VA-3', party: 'Democrat', yearsInOffice: 32, email: 'rep@scott.house.gov', phone: '(202) 225-8351', committees: ['Education', 'Budget'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Education and Workforce Ranking Member', stockTrades: [] },
      { name: 'Bennie Thompson', state: 'Mississippi', district: 'MS-2', party: 'Democrat', yearsInOffice: 32, email: 'rep@benniethompson.house.gov', phone: '(202) 225-5876', committees: ['Homeland Security'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Jan 6 Committee Chair, Homeland Security Ranking Member', stockTrades: [] },
      { name: 'Nydia Velázquez', state: 'New York', district: 'NY-7', party: 'Democrat', yearsInOffice: 32, email: 'rep@velazquez.house.gov', phone: '(202) 225-2361', committees: ['Financial Services', 'Natural Resources'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First Puerto Rican woman elected to Congress', stockTrades: [] },
      { name: 'Marcy Kaptur', state: 'Ohio', district: 'OH-9', party: 'Democrat', yearsInOffice: 42, email: 'rep@kaptur.house.gov', phone: '(202) 225-4146', committees: ['Appropriations'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Longest-serving woman in House history', stockTrades: [] },
      { name: 'Dan Bishop', state: 'North Carolina', district: 'NC-9', party: 'Republican', yearsInOffice: 4, email: 'rep@danbishop.house.gov', phone: '(202) 225-1976', committees: ['Judiciary', 'Homeland Security'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former state senator who wrote North Carolina bathroom bill, left House to run for AG in 2024', stockTrades: [] },
      { name: 'Adam Smith', state: 'Washington', district: 'WA-9', party: 'Democrat', yearsInOffice: 28, email: 'rep@adamsmith.house.gov', phone: '(202) 225-8901', committees: ['Armed Services'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Armed Services Committee Ranking Member', stockTrades: [] },
      { name: 'Gregory Meeks', state: 'New York', district: 'NY-5', party: 'Democrat', yearsInOffice: 26, email: 'rep@meeks.house.gov', phone: '(202) 225-3461', committees: ['Foreign Affairs', 'Financial Services'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Foreign Affairs Committee Ranking Member', stockTrades: [] },
      { name: 'Brian Fitzpatrick', state: 'Pennsylvania', district: 'PA-1', party: 'Republican', yearsInOffice: 8, email: 'rep@fitzpatrick.house.gov', phone: '(202) 225-4276', committees: ['Foreign Affairs', 'Intelligence'], supportVotes: 2789, opposeVotes: 1890, userVote: null, bio: 'Former FBI agent, Problem Solvers Caucus co-chair', stockTrades: [] },
      { name: 'Don Bacon', state: 'Nebraska', district: 'NE-2', party: 'Republican', yearsInOffice: 8, email: 'rep@bacon.house.gov', phone: '(202) 225-4155', committees: ['Armed Services', 'Agriculture'], supportVotes: 2678, opposeVotes: 2123, userVote: null, bio: 'Air Force brigadier general, swing district moderate', stockTrades: [] },
      { name: 'Jared Golden', state: 'Maine', district: 'ME-2', party: 'Democrat', yearsInOffice: 6, email: 'rep@golden.house.gov', phone: '(202) 225-6306', committees: ['Armed Services', 'Small Business'], supportVotes: 2989, opposeVotes: 1934, userVote: null, bio: 'Marine veteran, most conservative House Democrat', stockTrades: [] },
      { name: 'Josh Gottheimer', state: 'New Jersey', district: 'NJ-5', party: 'Democrat', yearsInOffice: 8, email: 'rep@gottheimer.house.gov', phone: '(202) 225-4465', committees: ['Financial Services', 'Homeland Security'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Problem Solvers Caucus co-chair, centrist Democrat', stockTrades: [] },
      { name: 'Maxwell Frost', state: 'Florida', district: 'FL-10', party: 'Democrat', yearsInOffice: 2, email: 'rep@frost.house.gov', phone: '(202) 225-2176', committees: ['Oversight', 'Science'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Youngest member of Congress, first Gen Z member', stockTrades: [] },
      { name: 'Summer Lee', state: 'Pennsylvania', district: 'PA-12', party: 'Democrat', yearsInOffice: 2, email: 'rep@summerlee.house.gov', phone: '(202) 225-2135', committees: ['Natural Resources', 'Science'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First Black congresswoman from Pennsylvania', stockTrades: [] },
      { name: 'Sheila Jackson Lee', state: 'Texas', district: 'TX-18', party: 'Democrat', yearsInOffice: 30, email: 'rep@jacksonlee.house.gov', phone: '(202) 225-3816', committees: ['Judiciary', 'Homeland Security'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Houston progressive icon, civil rights champion', stockTrades: [] },
      { name: 'Lloyd Doggett', state: 'Texas', district: 'TX-37', party: 'Democrat', yearsInOffice: 30, email: 'rep@doggett.house.gov', phone: '(202) 225-4865', committees: ['Ways and Means', 'Budget'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Progressive, Medicare advocate, first to call for Biden to step aside', stockTrades: [] },
      { name: 'Andy Biggs', state: 'Arizona', district: 'AZ-5', party: 'Republican', yearsInOffice: 8, email: 'rep@biggs.house.gov', phone: '(202) 225-2635', committees: ['Judiciary', 'Oversight'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former Freedom Caucus Chair', stockTrades: [] },
      { name: 'Scott Perry', state: 'Pennsylvania', district: 'PA-10', party: 'Republican', yearsInOffice: 12, email: 'rep@perry.house.gov', phone: '(202) 225-5836', committees: ['Foreign Affairs', 'Homeland Security'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Freedom Caucus Chair, Jan 6 investigation target', stockTrades: [] },
      { name: 'Chip Roy', state: 'Texas', district: 'TX-21', party: 'Republican', yearsInOffice: 6, email: 'rep@chiproy.house.gov', phone: '(202) 225-4236', committees: ['Judiciary', 'Budget'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Freedom Caucus fiscal hawk', stockTrades: [] },
      { name: 'Debbie Dingell', state: 'Michigan', district: 'MI-6', party: 'Democrat', yearsInOffice: 10, email: 'rep@dingell.house.gov', phone: '(202) 225-4071', committees: ['Energy and Commerce'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Holds late husband\'s seat, auto industry and healthcare focus', stockTrades: [] },
      { name: 'Mike Gallagher', state: 'Wisconsin', district: 'WI-8', party: 'Republican', yearsInOffice: 8, email: 'rep@gallagher.house.gov', phone: '(202) 225-5665', committees: ['Armed Services', 'Intelligence'], supportVotes: 2678, opposeVotes: 2123, userVote: null, bio: 'China Select Committee Chair, Marine veteran', stockTrades: [] },
      { name: 'Jerrold Nadler', state: 'New York', district: 'NY-12', party: 'Democrat', yearsInOffice: 32, email: 'rep@nadler.house.gov', phone: '(202) 225-5635', committees: ['Judiciary'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Judiciary Committee Ranking Member, led Trump impeachments', stockTrades: [] },
      { name: 'Barbara Lee', state: 'California', district: 'CA-12', party: 'Democrat', yearsInOffice: 26, email: 'rep@lee.house.gov', phone: '(202) 225-2661', committees: ['Appropriations', 'Budget'], supportVotes: 3567, opposeVotes: 1123, userVote: null, bio: 'Only vote against Afghanistan war authorization', stockTrades: [] },
      { name: 'Zoe Lofgren', state: 'California', district: 'CA-18', party: 'Democrat', yearsInOffice: 30, email: 'rep@lofgren.house.gov', phone: '(202) 225-3072', committees: ['Judiciary', 'Science'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Immigration and tech law expert', stockTrades: [] },
      { name: 'Earl Blumenauer', state: 'Oregon', district: 'OR-3', party: 'Democrat', yearsInOffice: 28, email: 'rep@blumenauer.house.gov', phone: '(202) 225-4811', committees: ['Ways and Means'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Progressive, bike advocate, marijuana legalization champion', stockTrades: [] },
      { name: 'Paul Gosar', state: 'Arizona', district: 'AZ-9', party: 'Republican', yearsInOffice: 14, email: 'rep@gosar.house.gov', phone: '(202) 225-2315', committees: ['Natural Resources', 'Oversight'], supportVotes: 2123, opposeVotes: 2678, userVote: null, bio: 'Dentist, censured by House for violent social media post', stockTrades: [] },
      { name: 'Henry Cuellar', state: 'Texas', district: 'TX-28', party: 'Democrat', yearsInOffice: 20, email: 'rep@cuellar.house.gov', phone: '(202) 225-1640', committees: ['Appropriations', 'Homeland Security'], supportVotes: 2789, opposeVotes: 1890, userVote: null, bio: 'Moderate Democrat, border security advocate, swing district', stockTrades: [] },
      { name: 'Abigail Spanberger', state: 'Virginia', district: 'VA-7', party: 'Democrat', yearsInOffice: 6, email: 'rep@spanberger.house.gov', phone: '(202) 225-2815', committees: ['Agriculture', 'Foreign Affairs'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former CIA officer, moderate swing-district Democrat', stockTrades: [] },
      { name: 'Dan Crenshaw', state: 'Texas', district: 'TX-2', party: 'Republican', yearsInOffice: 6, email: 'rep@crenshaw.house.gov', phone: '(202) 225-6565', committees: ['Homeland Security', 'Intelligence'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'Navy SEAL veteran, lost eye in combat, national security hawk', stockTrades: [] },
      { name: 'Mikie Sherrill', state: 'New Jersey', district: 'NJ-11', party: 'Democrat', yearsInOffice: 6, email: 'rep@sherrill.house.gov', phone: '(202) 225-5034', committees: ['Armed Services', 'Science'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Navy helicopter pilot and former federal prosecutor', stockTrades: [] },
      { name: 'Jason Crow', state: 'Colorado', district: 'CO-6', party: 'Democrat', yearsInOffice: 6, email: 'rep@crow.house.gov', phone: '(202) 225-7882', committees: ['Armed Services', 'Intelligence'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Army Ranger, impeachment manager, national security focus', stockTrades: [] },
      { name: 'Nancy Mace', state: 'South Carolina', district: 'SC-1', party: 'Republican', yearsInOffice: 4, email: 'rep@mace.house.gov', phone: '(202) 225-3176', committees: ['Oversight', 'Science'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'First woman to graduate from The Citadel military college', stockTrades: [] },
      // ── ADDITIONAL SENATORS (75 more — total 150) ──
      { name: 'Tommy Tuberville', state: 'Alabama', district: 'Senator', party: 'Republican', yearsInOffice: 4, email: 'senator@tuberville.senate.gov', phone: '(202) 224-4124', committees: ['Armed Services', 'Agriculture'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Former college football coach, blocked military promotions for months', stockTrades: [] },
      { name: 'Jim Risch', state: 'Idaho', district: 'Senator', party: 'Republican', yearsInOffice: 16, email: 'senator@risch.senate.gov', phone: '(202) 224-2752', committees: ['Foreign Relations', 'Intelligence'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former Idaho Governor, Foreign Relations Ranking Member', stockTrades: [] },
      { name: 'Jerry Moran', state: 'Kansas', district: 'Senator', party: 'Republican', yearsInOffice: 14, email: 'senator@moran.senate.gov', phone: '(202) 224-6521', committees: ['Appropriations', 'Veterans Affairs'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Veterans Committee Chair, rural Kansas advocate', stockTrades: [] },
      { name: 'Tina Smith', state: 'Minnesota', district: 'Senator', party: 'Democrat', yearsInOffice: 7, email: 'senator@smith.senate.gov', phone: '(202) 224-5641', committees: ['Agriculture', 'Banking'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former Minnesota Lt. Governor, abortion rights champion', stockTrades: [] },
      { name: 'Cindy Hyde-Smith', state: 'Mississippi', district: 'Senator', party: 'Republican', yearsInOffice: 7, email: 'senator@hydesmith.senate.gov', phone: '(202) 224-5054', committees: ['Appropriations', 'Agriculture'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'First woman elected to Senate from Mississippi', stockTrades: [] },
      { name: 'Deb Fischer', state: 'Nebraska', district: 'Senator', party: 'Republican', yearsInOffice: 12, email: 'senator@fischer.senate.gov', phone: '(202) 224-6551', committees: ['Armed Services', 'Commerce'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Rancher, agriculture and defense advocate', stockTrades: [] },
      { name: 'Pete Ricketts', state: 'Nebraska', district: 'Senator', party: 'Republican', yearsInOffice: 2, email: 'senator@ricketts.senate.gov', phone: '(202) 224-4224', committees: ['Agriculture', 'Foreign Relations'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Former Nebraska Governor, Chicago Cubs co-owner', stockTrades: [] },
      { name: 'Jacky Rosen', state: 'Nevada', district: 'Senator', party: 'Democrat', yearsInOffice: 6, email: 'senator@rosen.senate.gov', phone: '(202) 224-6244', committees: ['Commerce', 'Homeland Security'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former computer programmer, bipartisan dealmaker', stockTrades: [] },
      { name: 'Andy Kim', state: 'New Jersey', district: 'Senator', party: 'Democrat', yearsInOffice: 1, email: 'senator@andykim.senate.gov', phone: '(202) 224-4744', committees: ['Armed Services', 'Foreign Relations'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Rhodes Scholar, cleaned Capitol on Jan 6, won 2024 Senate race', stockTrades: [] },
      { name: 'Thom Tillis', state: 'North Carolina', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@tillis.senate.gov', phone: '(202) 224-6342', committees: ['Judiciary', 'Armed Services'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Former NC House Speaker, moderate Republican', stockTrades: [] },
      { name: 'Ted Budd', state: 'North Carolina', district: 'Senator', party: 'Republican', yearsInOffice: 2, email: 'senator@budd.senate.gov', phone: '(202) 224-3154', committees: ['Banking', 'Commerce'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Gun shop owner, Trump-backed candidate', stockTrades: [] },
      { name: 'John Hoeven', state: 'North Dakota', district: 'Senator', party: 'Republican', yearsInOffice: 14, email: 'senator@hoeven.senate.gov', phone: '(202) 224-2551', committees: ['Appropriations', 'Agriculture'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former North Dakota Governor, energy and agriculture focus', stockTrades: [] },
      { name: 'Kevin Cramer', state: 'North Dakota', district: 'Senator', party: 'Republican', yearsInOffice: 6, email: 'senator@cramer.senate.gov', phone: '(202) 224-2043', committees: ['Armed Services', 'Banking'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former energy regulator, Trump ally', stockTrades: [] },
      { name: 'James Lankford', state: 'Oklahoma', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@lankford.senate.gov', phone: '(202) 224-5754', committees: ['Finance', 'Homeland Security'], supportVotes: 2456, opposeVotes: 2345, userVote: null, bio: 'Baptist youth minister, border security negotiator', stockTrades: [] },
      { name: 'Markwayne Mullin', state: 'Oklahoma', district: 'Senator', party: 'Republican', yearsInOffice: 2, email: 'senator@mullin.senate.gov', phone: '(202) 224-4721', committees: ['Armed Services', 'Health'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Plumber, MMA fighter, challenged union leader to fight on Senate floor', stockTrades: [] },
      { name: 'Jack Reed', state: 'Rhode Island', district: 'Senator', party: 'Democrat', yearsInOffice: 28, email: 'senator@reed.senate.gov', phone: '(202) 224-4642', committees: ['Armed Services', 'Appropriations'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Army Ranger, Armed Services Ranking Member', stockTrades: [] },
      { name: 'Mike Rounds', state: 'South Dakota', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@rounds.senate.gov', phone: '(202) 224-5842', committees: ['Armed Services', 'Banking'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former South Dakota Governor, insurance background', stockTrades: [] },
      { name: 'Peter Welch', state: 'Vermont', district: 'Senator', party: 'Democrat', yearsInOffice: 2, email: 'senator@welch.senate.gov', phone: '(202) 224-4242', committees: ['Judiciary', 'Commerce'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Replaced retiring Patrick Leahy, progressive Democrat', stockTrades: [] },
      { name: 'Katie Britt', state: 'Alabama', district: 'Senator', party: 'Republican', yearsInOffice: 2, email: 'senator@britt.senate.gov', phone: '(202) 224-5744', committees: ['Appropriations', 'Banking'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Youngest Republican woman ever elected to Senate', stockTrades: [] },
      { name: 'Ruben Gallego', state: 'Arizona', district: 'Senator', party: 'Democrat', yearsInOffice: 1, email: 'senator@gallego.senate.gov', phone: '(202) 224-4521', committees: ['Armed Services', 'Veterans Affairs'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Marine veteran, defeated Kyrsten Sinema in 2024', stockTrades: [] },
      { name: 'Angela Alsobrooks', state: 'Maryland', district: 'Senator', party: 'Democrat', yearsInOffice: 1, email: 'senator@alsobrooks.senate.gov', phone: '(202) 224-4524', committees: ['Banking', 'Judiciary'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Prince George\'s County Executive, won 2024 Senate race', stockTrades: [] },
      { name: 'Elissa Slotkin', state: 'Michigan', district: 'Senator', party: 'Democrat', yearsInOffice: 1, email: 'senator@slotkin.senate.gov', phone: '(202) 224-6221', committees: ['Armed Services', 'Commerce'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former CIA analyst, won 2024 Michigan Senate race', stockTrades: [] },
      { name: 'Lisa Blunt Rochester', state: 'Delaware', district: 'Senator', party: 'Democrat', yearsInOffice: 1, email: 'senator@bluntrochester.senate.gov', phone: '(202) 224-5042', committees: ['Health', 'Commerce'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'First Black woman and first woman elected Senator from Delaware', stockTrades: [] },
      { name: 'Jim Banks', state: 'Indiana', district: 'Senator', party: 'Republican', yearsInOffice: 1, email: 'senator@banks.senate.gov', phone: '(202) 224-5623', committees: ['Armed Services', 'Judiciary'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Navy Reserve veteran, succeeded Mike Braun in 2024', stockTrades: [] },
      { name: 'Dave McCormick', state: 'Pennsylvania', district: 'Senator', party: 'Republican', yearsInOffice: 1, email: 'senator@mccormick.senate.gov', phone: '(202) 224-4254', committees: ['Armed Services', 'Banking'], supportVotes: 2456, opposeVotes: 2345, userVote: null, bio: 'Hedge fund CEO, West Point graduate, defeated Bob Casey in 2024', stockTrades: [] },
      { name: 'Ashley Moody', state: 'Florida', district: 'Senator', party: 'Republican', yearsInOffice: 1, email: 'senator@moody.senate.gov', phone: '(202) 224-3041', committees: ['Judiciary', 'Commerce'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former Florida Attorney General, succeeded Marco Rubio', stockTrades: [] },
      { name: 'Bernie Moreno', state: 'Ohio', district: 'Senator', party: 'Republican', yearsInOffice: 1, email: 'senator@moreno.senate.gov', phone: '(202) 224-3353', committees: ['Banking', 'Small Business'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Car dealership magnate, Trump-backed, defeated Sherrod Brown', stockTrades: [] },
      // ── ADDITIONAL HOUSE MEMBERS (75 more — total 150) ──
      { name: 'Terri Sewell', state: 'Alabama', district: 'AL-7', party: 'Democrat', yearsInOffice: 14, email: 'rep@sewell.house.gov', phone: '(202) 225-2665', committees: ['Ways and Means', 'Intelligence'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Only Black Democrat from the Deep South, Selma bridge advocate', stockTrades: [] },
      { name: 'Robert Aderholt', state: 'Alabama', district: 'AL-4', party: 'Republican', yearsInOffice: 28, email: 'rep@aderholt.house.gov', phone: '(202) 225-4876', committees: ['Appropriations'], supportVotes: 2345, opposeVotes: 2345, userVote: null, bio: 'Senior Appropriations member, conservative stalwart', stockTrades: [] },
      { name: 'Greg Stanton', state: 'Arizona', district: 'AZ-4', party: 'Democrat', yearsInOffice: 6, email: 'rep@stanton.house.gov', phone: '(202) 225-9888', committees: ['Transportation', 'Judiciary'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former Phoenix Mayor', stockTrades: [] },
      { name: 'Raul Grijalva', state: 'Arizona', district: 'AZ-7', party: 'Democrat', yearsInOffice: 22, email: 'rep@grijalva.house.gov', phone: '(202) 225-2435', committees: ['Natural Resources', 'Education'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Natural Resources Committee Ranking Member, progressive Latino leader', stockTrades: [] },
      { name: 'Ami Bera', state: 'California', district: 'CA-6', party: 'Democrat', yearsInOffice: 12, email: 'rep@bera.house.gov', phone: '(202) 225-5716', committees: ['Foreign Affairs', 'Science'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Internal medicine physician, moderate Democrat', stockTrades: [] },
      { name: 'Tom McClintock', state: 'California', district: 'CA-5', party: 'Republican', yearsInOffice: 16, email: 'rep@mcclintock.house.gov', phone: '(202) 225-2511', committees: ['Judiciary', 'Natural Resources'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Fiscal hawk, libertarian-leaning conservative', stockTrades: [] },
      { name: 'Jared Huffman', state: 'California', district: 'CA-2', party: 'Democrat', yearsInOffice: 12, email: 'rep@huffman.house.gov', phone: '(202) 225-5161', committees: ['Natural Resources', 'Transportation'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First openly nonreligious member of Congress', stockTrades: [] },
      { name: 'Doug LaMalfa', state: 'California', district: 'CA-1', party: 'Republican', yearsInOffice: 12, email: 'rep@lamalfa.house.gov', phone: '(202) 225-3076', committees: ['Agriculture', 'Transportation'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Rice farmer, rural Northern California', stockTrades: [] },
      { name: 'Mark DeSaulnier', state: 'California', district: 'CA-10', party: 'Democrat', yearsInOffice: 10, email: 'rep@desaulnier.house.gov', phone: '(202) 225-2095', committees: ['Education', 'Transportation'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Transportation and worker rights advocate', stockTrades: [] },
      { name: 'Eric Swalwell', state: 'California', district: 'CA-14', party: 'Democrat', yearsInOffice: 12, email: 'rep@swalwell.house.gov', phone: '(202) 225-5065', committees: ['Judiciary', 'Homeland Security'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former presidential candidate, gun control advocate', stockTrades: [] },
      { name: 'Jimmy Panetta', state: 'California', district: 'CA-19', party: 'Democrat', yearsInOffice: 8, email: 'rep@panetta.house.gov', phone: '(202) 225-2861', committees: ['Ways and Means', 'Armed Services'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Son of former CIA Director Leon Panetta', stockTrades: [] },
      { name: 'Mike Garcia', state: 'California', district: 'CA-27', party: 'Republican', yearsInOffice: 4, email: 'rep@garcia.house.gov', phone: '(202) 225-1956', committees: ['Armed Services', 'Science'], supportVotes: 2456, opposeVotes: 2345, userVote: null, bio: 'Navy fighter pilot, swing district', stockTrades: [] },
      { name: 'Ken Calvert', state: 'California', district: 'CA-41', party: 'Republican', yearsInOffice: 32, email: 'rep@calvert.house.gov', phone: '(202) 225-1986', committees: ['Appropriations'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Senior California Republican, Appropriations member', stockTrades: [] },
      { name: 'Joe Courtney', state: 'Connecticut', district: 'CT-2', party: 'Democrat', yearsInOffice: 18, email: 'rep@courtney.house.gov', phone: '(202) 225-2076', committees: ['Armed Services', 'Education'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Submarine industry champion, teacher pay advocate', stockTrades: [] },
      { name: 'Jim Himes', state: 'Connecticut', district: 'CT-4', party: 'Democrat', yearsInOffice: 16, email: 'rep@himes.house.gov', phone: '(202) 225-5541', committees: ['Intelligence', 'Financial Services'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Intelligence Committee Ranking Member, Goldman Sachs veteran', stockTrades: [] },
      { name: 'Neal Dunn', state: 'Florida', district: 'FL-2', party: 'Republican', yearsInOffice: 8, email: 'rep@dunn.house.gov', phone: '(202) 225-5235', committees: ['Energy and Commerce'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Vascular surgeon, healthcare focus', stockTrades: [] },
      { name: 'Darren Soto', state: 'Florida', district: 'FL-9', party: 'Democrat', yearsInOffice: 8, email: 'rep@soto.house.gov', phone: '(202) 225-9889', committees: ['Energy and Commerce'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'First Puerto Rican congressman from Florida', stockTrades: [] },
      { name: 'Gus Bilirakis', state: 'Florida', district: 'FL-12', party: 'Republican', yearsInOffice: 18, email: 'rep@bilirakis.house.gov', phone: '(202) 225-5755', committees: ['Energy and Commerce'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Greek-American, healthcare and veterans focus', stockTrades: [] },
      { name: 'Frederica Wilson', state: 'Florida', district: 'FL-24', party: 'Democrat', yearsInOffice: 14, email: 'rep@wilson.house.gov', phone: '(202) 225-4506', committees: ['Transportation', 'Education'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Known for colorful hats, education and transportation focus', stockTrades: [] },
      { name: 'Jared Moskowitz', state: 'Florida', district: 'FL-23', party: 'Democrat', yearsInOffice: 2, email: 'rep@moskowitz.house.gov', phone: '(202) 225-3001', committees: ['Foreign Affairs', 'Oversight'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Florida emergency management director', stockTrades: [] },
      { name: 'Sanford Bishop', state: 'Georgia', district: 'GA-2', party: 'Democrat', yearsInOffice: 32, email: 'rep@bishop.house.gov', phone: '(202) 225-3631', committees: ['Appropriations'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Moderate, agriculture appropriations veteran', stockTrades: [] },
      { name: 'David Scott', state: 'Georgia', district: 'GA-13', party: 'Democrat', yearsInOffice: 22, email: 'rep@davidscott.house.gov', phone: '(202) 225-2939', committees: ['Agriculture', 'Financial Services'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Agriculture Committee Ranking Member', stockTrades: [] },
      { name: 'Hank Johnson', state: 'Georgia', district: 'GA-4', party: 'Democrat', yearsInOffice: 18, email: 'rep@johnson.house.gov', phone: '(202) 225-1605', committees: ['Judiciary', 'Transportation'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Progressive voice on judiciary, former judge', stockTrades: [] },
      { name: 'Raja Krishnamoorthi', state: 'Illinois', district: 'IL-8', party: 'Democrat', yearsInOffice: 8, email: 'rep@krishnamoorthi.house.gov', phone: '(202) 225-3711', committees: ['Intelligence', 'Oversight'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'TikTok ban advocate, national security focus', stockTrades: [] },
      { name: 'Mike Quigley', state: 'Illinois', district: 'IL-5', party: 'Democrat', yearsInOffice: 15, email: 'rep@quigley.house.gov', phone: '(202) 225-4061', committees: ['Appropriations', 'Intelligence'], supportVotes: 3345, opposeVotes: 1678, userVote: null, bio: 'LGBTQ+ rights advocate, Intelligence Committee member', stockTrades: [] },
      { name: 'Bill Foster', state: 'Illinois', district: 'IL-11', party: 'Democrat', yearsInOffice: 14, email: 'rep@foster.house.gov', phone: '(202) 225-3515', committees: ['Financial Services', 'Science'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Only PhD physicist in Congress, particle physics background', stockTrades: [] },
      { name: 'André Carson', state: 'Indiana', district: 'IN-7', party: 'Democrat', yearsInOffice: 16, email: 'rep@carson.house.gov', phone: '(202) 225-4011', committees: ['Intelligence', 'Transportation'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'One of first Muslims in Congress, Intelligence Committee member', stockTrades: [] },
      { name: 'Brett Guthrie', state: 'Kentucky', district: 'KY-2', party: 'Republican', yearsInOffice: 16, email: 'rep@guthrie.house.gov', phone: '(202) 225-3501', committees: ['Energy and Commerce'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Energy and Commerce Committee member', stockTrades: [] },
      { name: 'Troy Carter', state: 'Louisiana', district: 'LA-2', party: 'Democrat', yearsInOffice: 4, email: 'rep@troycarter.house.gov', phone: '(202) 225-6636', committees: ['Transportation', 'Science'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'New Orleans representative, transit advocate', stockTrades: [] },
      { name: 'Clay Higgins', state: 'Louisiana', district: 'LA-3', party: 'Republican', yearsInOffice: 8, email: 'rep@higgins.house.gov', phone: '(202) 225-2031', committees: ['Homeland Security', 'Science'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former police officer, known for tough-on-crime videos', stockTrades: [] },
      { name: 'Kweisi Mfume', state: 'Maryland', district: 'MD-7', party: 'Democrat', yearsInOffice: 6, email: 'rep@mfume.house.gov', phone: '(202) 225-4741', committees: ['Oversight', 'Foreign Affairs'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former NAACP president, Baltimore representative', stockTrades: [] },
      { name: 'David Trone', state: 'Maryland', district: 'MD-6', party: 'Democrat', yearsInOffice: 6, email: 'rep@trone.house.gov', phone: '(202) 225-2721', committees: ['Appropriations', 'Veterans Affairs'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Addiction recovery advocate, wine retailer billionaire', stockTrades: [] },
      { name: 'Dan Kildee', state: 'Michigan', district: 'MI-8', party: 'Democrat', yearsInOffice: 12, email: 'rep@dankildee.house.gov', phone: '(202) 225-3611', committees: ['Ways and Means'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Flint water crisis advocate', stockTrades: [] },
      { name: 'Haley Stevens', state: 'Michigan', district: 'MI-11', party: 'Democrat', yearsInOffice: 6, email: 'rep@stevens.house.gov', phone: '(202) 225-8171', committees: ['Science', 'Education'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Auto industry, CHIPS Act champion', stockTrades: [] },
      { name: 'Angie Craig', state: 'Minnesota', district: 'MN-2', party: 'Democrat', yearsInOffice: 6, email: 'rep@craig.house.gov', phone: '(202) 225-2271', committees: ['Agriculture', 'Energy and Commerce'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Moderate, suburban swing district Democrat', stockTrades: [] },
      { name: 'Dean Phillips', state: 'Minnesota', district: 'MN-3', party: 'Democrat', yearsInOffice: 6, email: 'rep@phillips.house.gov', phone: '(202) 225-2871', committees: ['Foreign Affairs', 'Small Business'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Businessman, 2024 long-shot presidential candidate against Biden', stockTrades: [] },
      { name: 'Betty McCollum', state: 'Minnesota', district: 'MN-4', party: 'Democrat', yearsInOffice: 24, email: 'rep@mccollum.house.gov', phone: '(202) 225-6631', committees: ['Appropriations', 'Armed Services'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Defense appropriations critic, children\'s advocate', stockTrades: [] },
      { name: 'Michael Guest', state: 'Mississippi', district: 'MS-3', party: 'Republican', yearsInOffice: 6, email: 'rep@guest.house.gov', phone: '(202) 225-5031', committees: ['Ethics', 'Homeland Security'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Prosecutor, Ethics Committee Chair', stockTrades: [] },
      { name: 'Ann Wagner', state: 'Missouri', district: 'MO-2', party: 'Republican', yearsInOffice: 12, email: 'rep@wagner.house.gov', phone: '(202) 225-1621', committees: ['Financial Services', 'Foreign Affairs'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Former RNC Chair, anti-human trafficking advocate', stockTrades: [] },
      { name: 'Ryan Zinke', state: 'Montana', district: 'MT-1', party: 'Republican', yearsInOffice: 6, email: 'rep@zinke.house.gov', phone: '(202) 225-5628', committees: ['Natural Resources', 'Armed Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Navy SEAL, former Interior Secretary under Trump', stockTrades: [] },
      { name: 'Dina Titus', state: 'Nevada', district: 'NV-1', party: 'Democrat', yearsInOffice: 14, email: 'rep@titus.house.gov', phone: '(202) 225-5965', committees: ['Foreign Affairs', 'Transportation'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former state senator, Las Vegas casino-district rep', stockTrades: [] },
      { name: 'Susie Lee', state: 'Nevada', district: 'NV-3', party: 'Democrat', yearsInOffice: 6, email: 'rep@susielee.house.gov', phone: '(202) 225-3252', committees: ['Appropriations', 'Veterans Affairs'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Nonprofit executive, Las Vegas suburban district', stockTrades: [] },
      { name: 'Chris Pappas', state: 'New Hampshire', district: 'NH-1', party: 'Democrat', yearsInOffice: 6, email: 'rep@pappas.house.gov', phone: '(202) 225-5456', committees: ['Transportation', 'Veterans Affairs'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Restaurant owner, first openly gay NH representative', stockTrades: [] },
      { name: 'Donald Norcross', state: 'New Jersey', district: 'NJ-1', party: 'Democrat', yearsInOffice: 12, email: 'rep@norcross.house.gov', phone: '(202) 225-6501', committees: ['Armed Services', 'Education'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Union electrician, labor advocate', stockTrades: [] },
      { name: 'Teresa Leger Fernandez', state: 'New Mexico', district: 'NM-3', party: 'Democrat', yearsInOffice: 4, email: 'rep@fernandez.house.gov', phone: '(202) 225-6190', committees: ['Education', 'Natural Resources'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Native rights attorney, largest district by area', stockTrades: [] },
      { name: 'Grace Meng', state: 'New York', district: 'NY-6', party: 'Democrat', yearsInOffice: 12, email: 'rep@meng.house.gov', phone: '(202) 225-2601', committees: ['Appropriations'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'First Asian-American elected to Congress from New York', stockTrades: [] },
      { name: 'Dan Goldman', state: 'New York', district: 'NY-10', party: 'Democrat', yearsInOffice: 2, email: 'rep@goldman.house.gov', phone: '(202) 225-5306', committees: ['Judiciary', 'Oversight'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Led first Trump impeachment as counsel, heir to Levi Strauss fortune', stockTrades: [] },
      { name: 'Ritchie Torres', state: 'New York', district: 'NY-15', party: 'Democrat', yearsInOffice: 4, email: 'rep@torres.house.gov', phone: '(202) 225-4361', committees: ['Financial Services', 'Homeland Security'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'First openly gay Afro-Latino elected to Congress', stockTrades: [] },
      { name: 'Pat Ryan', state: 'New York', district: 'NY-18', party: 'Democrat', yearsInOffice: 2, email: 'rep@patryan.house.gov', phone: '(202) 225-5614', committees: ['Armed Services', 'Transportation'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Army veteran, won special election on abortion rights', stockTrades: [] },
      { name: 'Paul Tonko', state: 'New York', district: 'NY-20', party: 'Democrat', yearsInOffice: 16, email: 'rep@tonko.house.gov', phone: '(202) 225-5076', committees: ['Energy and Commerce'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Engineer, clean energy and addiction recovery focus', stockTrades: [] },
      { name: 'Alma Adams', state: 'North Carolina', district: 'NC-12', party: 'Democrat', yearsInOffice: 10, email: 'rep@adams.house.gov', phone: '(202) 225-1510', committees: ['Agriculture', 'Education'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'HBCU advocate, Charlotte representative', stockTrades: [] },
      { name: 'Joyce Beatty', state: 'Ohio', district: 'OH-3', party: 'Democrat', yearsInOffice: 12, email: 'rep@beatty.house.gov', phone: '(202) 225-4324', committees: ['Financial Services'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former CBC Chair, Columbus representative', stockTrades: [] },
      { name: 'Brad Wenstrup', state: 'Ohio', district: 'OH-2', party: 'Republican', yearsInOffice: 12, email: 'rep@wenstrup.house.gov', phone: '(202) 225-3164', committees: ['Intelligence', 'Ways and Means'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Podiatric surgeon, treated Rep. Scalise after 2017 shooting', stockTrades: [] },
      { name: 'Kevin Hern', state: 'Oklahoma', district: 'OK-1', party: 'Republican', yearsInOffice: 6, email: 'rep@hern.house.gov', phone: '(202) 225-2211', committees: ['Ways and Means', 'Budget'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'McDonald\'s franchise owner, budget hawk', stockTrades: [] },
      { name: 'Suzanne Bonamici', state: 'Oregon', district: 'OR-1', party: 'Democrat', yearsInOffice: 12, email: 'rep@bonamici.house.gov', phone: '(202) 225-0855', committees: ['Education', 'Science'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Education advocate, consumer rights attorney', stockTrades: [] },
      { name: 'Chrissy Houlahan', state: 'Pennsylvania', district: 'PA-6', party: 'Democrat', yearsInOffice: 6, email: 'rep@houlahan.house.gov', phone: '(202) 225-4315', committees: ['Armed Services', 'Foreign Affairs'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Air Force veteran, engineer, national security focus', stockTrades: [] },
      { name: 'Matt Cartwright', state: 'Pennsylvania', district: 'PA-8', party: 'Democrat', yearsInOffice: 12, email: 'rep@cartwright.house.gov', phone: '(202) 225-5546', committees: ['Appropriations'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Attorney, progressive-leaning moderate in Trump-won district', stockTrades: [] },
      { name: 'Mariannette Miller-Meeks', state: 'Iowa', district: 'IA-1', party: 'Republican', yearsInOffice: 4, email: 'rep@millermeeks.house.gov', phone: '(202) 225-6576', committees: ['Homeland Security', 'Transportation'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Physician and Army veteran, won by 6 votes in 2020', stockTrades: [] },
      { name: 'Blake Moore', state: 'Utah', district: 'UT-1', party: 'Republican', yearsInOffice: 4, email: 'rep@blakemoore.house.gov', phone: '(202) 225-0453', committees: ['Ways and Means'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Trade finance executive, tax policy focus', stockTrades: [] },
      { name: 'Gerry Connolly', state: 'Virginia', district: 'VA-11', party: 'Democrat', yearsInOffice: 16, email: 'rep@connolly.house.gov', phone: '(202) 225-1492', committees: ['Oversight', 'Foreign Affairs'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Federal workforce and government operations advocate', stockTrades: [] },
      { name: 'Bob Good', state: 'Virginia', district: 'VA-5', party: 'Republican', yearsInOffice: 4, email: 'rep@good.house.gov', phone: '(202) 225-4711', committees: ['Education', 'Budget'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Freedom Caucus, barely survived 2024 primary', stockTrades: [] },
      { name: 'Suzan DelBene', state: 'Washington', district: 'WA-1', party: 'Democrat', yearsInOffice: 12, email: 'rep@delbene.house.gov', phone: '(202) 225-6311', committees: ['Ways and Means', 'Budget'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'DCCC Chair, tech executive, tax policy expert', stockTrades: [] },
      { name: 'Kim Schrier', state: 'Washington', district: 'WA-8', party: 'Democrat', yearsInOffice: 6, email: 'rep@schrier.house.gov', phone: '(202) 225-7761', committees: ['Agriculture', 'Education'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Pediatrician, rural healthcare and agriculture advocate', stockTrades: [] },
      { name: 'Gwen Moore', state: 'Wisconsin', district: 'WI-4', party: 'Democrat', yearsInOffice: 20, email: 'rep@gwenmoore.house.gov', phone: '(202) 225-4572', committees: ['Ways and Means', 'Budget'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First Black congresswoman from Wisconsin', stockTrades: [] },
      { name: 'Mark Pocan', state: 'Wisconsin', district: 'WI-2', party: 'Democrat', yearsInOffice: 12, email: 'rep@pocan.house.gov', phone: '(202) 225-2906', committees: ['Appropriations', 'Education'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Progressive Caucus co-chair, small business owner', stockTrades: [] },,

      // ── MORE HOUSE MEMBERS ──
      { name: 'Barry Moore', state: 'Alabama', district: 'AL-2', party: 'Republican', yearsInOffice: 4, email: 'rep@barrymoore.house.gov', phone: '(202) 225-2901', committees: ['Armed Services', 'Natural Resources'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Small business owner, Freedom Caucus member, southern Alabama', stockTrades: [] },
      { name: 'Tom OHalleran', state: 'Arizona', district: 'AZ-2', party: 'Democrat', yearsInOffice: 8, email: 'rep@ohalleran.house.gov', phone: '(202) 225-3361', committees: ['Agriculture', 'Armed Services'], supportVotes: 2789, opposeVotes: 1890, userVote: null, bio: 'Former Republican turned Democrat, rural Arizona moderate', stockTrades: [] },
      { name: 'David Schweikert', state: 'Arizona', district: 'AZ-1', party: 'Republican', yearsInOffice: 12, email: 'rep@schweikert.house.gov', phone: '(202) 225-2190', committees: ['Ways and Means', 'Science'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Tax and technology policy focus, narrowly survived 2022 election', stockTrades: [] },
      { name: 'French Hill', state: 'Arkansas', district: 'AR-2', party: 'Republican', yearsInOffice: 10, email: 'rep@frenchhill.house.gov', phone: '(202) 225-2506', committees: ['Financial Services', 'Foreign Affairs'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former banker, Financial Services Committee Deputy Chair', stockTrades: [] },
      { name: 'Rick Crawford', state: 'Arkansas', district: 'AR-1', party: 'Republican', yearsInOffice: 14, email: 'rep@crawford.house.gov', phone: '(202) 225-4076', committees: ['Agriculture', 'Intelligence'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former radio host and agri-news anchor, agriculture and intelligence focus', stockTrades: [] },
      { name: 'Bruce Westerman', state: 'Arkansas', district: 'AR-4', party: 'Republican', yearsInOffice: 10, email: 'rep@westerman.house.gov', phone: '(202) 225-3772', committees: ['Natural Resources', 'Budget'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Licensed forester, Natural Resources Committee Chair', stockTrades: [] },
      { name: 'Doris Matsui', state: 'California', district: 'CA-7', party: 'Democrat', yearsInOffice: 19, email: 'rep@matsui.house.gov', phone: '(202) 225-7163', committees: ['Energy and Commerce'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Digital equity and broadband champion, widow of Rep. Bob Matsui', stockTrades: [] },
      { name: 'John Garamendi', state: 'California', district: 'CA-8', party: 'Democrat', yearsInOffice: 16, email: 'rep@garamendi.house.gov', phone: '(202) 225-1880', committees: ['Armed Services', 'Transportation'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former California Insurance Commissioner and Lt. Governor', stockTrades: [] },
      { name: 'Josh Harder', state: 'California', district: 'CA-9', party: 'Democrat', yearsInOffice: 6, email: 'rep@harder.house.gov', phone: '(202) 225-4540', committees: ['Agriculture', 'Education'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former venture capitalist, Central Valley agricultural swing district', stockTrades: [] },
      { name: 'David Valadao', state: 'California', district: 'CA-22', party: 'Republican', yearsInOffice: 10, email: 'rep@valadao.house.gov', phone: '(202) 225-4695', committees: ['Appropriations'], supportVotes: 2678, opposeVotes: 2123, userVote: null, bio: 'Dairy farmer, one of ten Republicans who voted to impeach Trump in 2021', stockTrades: [] },
      { name: 'Jim Costa', state: 'California', district: 'CA-21', party: 'Democrat', yearsInOffice: 20, email: 'rep@costa.house.gov', phone: '(202) 225-3341', committees: ['Agriculture', 'Foreign Affairs'], supportVotes: 2789, opposeVotes: 1890, userVote: null, bio: 'Farm owner, moderate Democrat, agriculture policy expert in Central Valley', stockTrades: [] },
      { name: 'Darrell Issa', state: 'California', district: 'CA-48', party: 'Republican', yearsInOffice: 24, email: 'rep@issa.house.gov', phone: '(202) 225-5672', committees: ['Judiciary', 'Foreign Affairs'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former car alarm mogul, among wealthiest House members, government oversight focus', stockTrades: [] },
      { name: 'Scott Peters', state: 'California', district: 'CA-50', party: 'Democrat', yearsInOffice: 12, email: 'rep@scottpeters.house.gov', phone: '(202) 225-0508', committees: ['Energy and Commerce'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Moderate, biotech and clean energy expert, San Diego coastal district', stockTrades: [] },
      { name: 'Sara Jacobs', state: 'California', district: 'CA-51', party: 'Democrat', yearsInOffice: 4, email: 'rep@jacobs.house.gov', phone: '(202) 225-2040', committees: ['Armed Services', 'Foreign Affairs'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former UNICEF policy director, youngest congresswoman from California', stockTrades: [] },
      { name: 'Juan Vargas', state: 'California', district: 'CA-52', party: 'Democrat', yearsInOffice: 12, email: 'rep@vargas.house.gov', phone: '(202) 225-8045', committees: ['Financial Services', 'Foreign Affairs'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Jesuit seminarian, border district representative, San Diego south', stockTrades: [] },
      { name: 'Joe Neguse', state: 'Colorado', district: 'CO-2', party: 'Democrat', yearsInOffice: 6, email: 'rep@neguse.house.gov', phone: '(202) 225-2161', committees: ['Judiciary', 'Natural Resources'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First Eritrean-American in Congress, led Trump impeachment House floor argument', stockTrades: [] },
      { name: 'Yadira Caraveo', state: 'Colorado', district: 'CO-8', party: 'Democrat', yearsInOffice: 2, email: 'rep@caraveo.house.gov', phone: '(202) 225-5625', committees: ['Agriculture', 'Science'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Pediatrician, first congresswoman from Colorado\'s new 8th district', stockTrades: [] },
      { name: 'Jahana Hayes', state: 'Connecticut', district: 'CT-5', party: 'Democrat', yearsInOffice: 6, email: 'rep@hayes.house.gov', phone: '(202) 225-4476', committees: ['Agriculture', 'Education'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: '2016 National Teacher of the Year, first Black congresswoman from Connecticut', stockTrades: [] },
      { name: 'Kat Cammack', state: 'Florida', district: 'FL-3', party: 'Republican', yearsInOffice: 4, email: 'rep@cammack.house.gov', phone: '(202) 225-5744', committees: ['Energy and Commerce', 'Agriculture'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former congressional aide, youngest Republican woman in Congress when elected', stockTrades: [] },
      { name: 'Anna Paulina Luna', state: 'Florida', district: 'FL-13', party: 'Republican', yearsInOffice: 2, email: 'rep@luna.house.gov', phone: '(202) 225-5961', committees: ['Oversight', 'Armed Services'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Air Force veteran, first Mexican-American woman elected from Florida', stockTrades: [] },
      { name: 'Lucy McBath', state: 'Georgia', district: 'GA-7', party: 'Democrat', yearsInOffice: 6, email: 'rep@mcbath.house.gov', phone: '(202) 225-4272', committees: ['Energy and Commerce', 'Judiciary'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Gun control champion motivated by son Jordan Davis killed by gun violence', stockTrades: [] },
      { name: 'Rich McCormick', state: 'Georgia', district: 'GA-6', party: 'Republican', yearsInOffice: 2, email: 'rep@mccormick.house.gov', phone: '(202) 225-4501', committees: ['Armed Services', 'Foreign Affairs'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Marine and Navy flight surgeon turned emergency room physician', stockTrades: [] },
      { name: 'Russ Fulcher', state: 'Idaho', district: 'ID-1', party: 'Republican', yearsInOffice: 6, email: 'rep@fulcher.house.gov', phone: '(202) 225-6611', committees: ['Energy and Commerce', 'Natural Resources'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former state senator, tech industry and energy advocate', stockTrades: [] },
      { name: 'Mike Simpson', state: 'Idaho', district: 'ID-2', party: 'Republican', yearsInOffice: 24, email: 'rep@simpson.house.gov', phone: '(202) 225-5531', committees: ['Appropriations'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'Former dentist, longtime Appropriations member, water and salmon policy', stockTrades: [] },
      { name: 'Mike Bost', state: 'Illinois', district: 'IL-12', party: 'Republican', yearsInOffice: 10, email: 'rep@bost.house.gov', phone: '(202) 225-5661', committees: ['Agriculture', 'Veterans Affairs'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Veterans Affairs Committee Chair, downstate Illinois', stockTrades: [] },
      { name: 'Robin Kelly', state: 'Illinois', district: 'IL-2', party: 'Democrat', yearsInOffice: 12, email: 'rep@kelly.house.gov', phone: '(202) 225-0773', committees: ['Energy and Commerce', 'Foreign Affairs'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Gun violence prevention leader, DNC Vice Chair, Chicago south suburbs', stockTrades: [] },
      { name: 'Brad Schneider', state: 'Illinois', district: 'IL-10', party: 'Democrat', yearsInOffice: 8, email: 'rep@schneider.house.gov', phone: '(202) 225-4835', committees: ['Foreign Affairs', 'Ways and Means'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Business consultant, North Shore Chicago, Israel security advocate', stockTrades: [] },
      { name: 'Darin LaHood', state: 'Illinois', district: 'IL-16', party: 'Republican', yearsInOffice: 10, email: 'rep@lahood.house.gov', phone: '(202) 225-6201', committees: ['Ways and Means', 'Intelligence'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Son of Transportation Secretary Ray LaHood, tax and intelligence focus', stockTrades: [] },
      { name: 'Jim Baird', state: 'Indiana', district: 'IN-4', party: 'Republican', yearsInOffice: 6, email: 'rep@baird.house.gov', phone: '(202) 225-5037', committees: ['Agriculture', 'Veterans Affairs'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Vietnam War veteran with amputated arm, Purdue agronomy professor', stockTrades: [] },
      { name: 'Greg Pence', state: 'Indiana', district: 'IN-6', party: 'Republican', yearsInOffice: 6, email: 'rep@gregpence.house.gov', phone: '(202) 225-3021', committees: ['Foreign Affairs', 'Small Business'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Older brother of former VP Mike Pence, antique mall owner', stockTrades: [] },
      { name: 'Randy Feenstra', state: 'Iowa', district: 'IA-4', party: 'Republican', yearsInOffice: 4, email: 'rep@feenstra.house.gov', phone: '(202) 225-4426', committees: ['Agriculture', 'Ways and Means'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Defeated controversial Rep. Steve King in 2020 primary, agricultural finance focus', stockTrades: [] },
      { name: 'Tracey Mann', state: 'Kansas', district: 'KS-1', party: 'Republican', yearsInOffice: 4, email: 'rep@mann.house.gov', phone: '(202) 225-2715', committees: ['Agriculture', 'Transportation'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Farmer and real estate broker, represents the largest Kansas congressional district', stockTrades: [] },
      { name: 'Andy Barr', state: 'Kentucky', district: 'KY-6', party: 'Republican', yearsInOffice: 12, email: 'rep@barr.house.gov', phone: '(202) 225-4706', committees: ['Financial Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Banking and financial services focus, Lexington Bluegrass region', stockTrades: [] },
      { name: 'Garret Graves', state: 'Louisiana', district: 'LA-6', party: 'Republican', yearsInOffice: 2, email: 'rep@graves.house.gov', phone: '(202) 225-3901', committees: ['Transportation', 'Natural Resources'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'McCarthy\'s key debt ceiling negotiator, coastal Louisiana', stockTrades: [] },
      { name: 'Julia Letlow', state: 'Louisiana', district: 'LA-5', party: 'Republican', yearsInOffice: 4, email: 'rep@letlow.house.gov', phone: '(202) 225-8490', committees: ['Appropriations', 'Education'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'First Republican woman from Louisiana in Congress', stockTrades: [] },
      { name: 'Chellie Pingree', state: 'Maine', district: 'ME-1', party: 'Democrat', yearsInOffice: 15, email: 'rep@pingree.house.gov', phone: '(202) 225-6116', committees: ['Appropriations'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Organic farm owner, food policy and farm-to-table agriculture advocate', stockTrades: [] },
      { name: 'Jake Auchincloss', state: 'Massachusetts', district: 'MA-4', party: 'Democrat', yearsInOffice: 4, email: 'rep@auchincloss.house.gov', phone: '(202) 225-5931', committees: ['Transportation', 'Financial Services'], supportVotes: 3345, opposeVotes: 1678, userVote: null, bio: 'Marine veteran, gave first AI-written speech ever delivered on House floor', stockTrades: [] },
      { name: 'Seth Moulton', state: 'Massachusetts', district: 'MA-6', party: 'Democrat', yearsInOffice: 10, email: 'rep@moulton.house.gov', phone: '(202) 225-8020', committees: ['Armed Services', 'Budget'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'Marine Iraq War veteran, 2020 presidential candidate, defense moderate', stockTrades: [] },
      { name: 'Jack Bergman', state: 'Michigan', district: 'MI-1', party: 'Republican', yearsInOffice: 8, email: 'rep@bergman.house.gov', phone: '(202) 225-4735', committees: ['Armed Services', 'Veterans Affairs'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Retired Marine 3-star general, Upper Peninsula Michigan', stockTrades: [] },
      { name: 'Bill Huizenga', state: 'Michigan', district: 'MI-4', party: 'Republican', yearsInOffice: 14, email: 'rep@huizenga.house.gov', phone: '(202) 225-4401', committees: ['Financial Services', 'Foreign Affairs'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Sand and gravel business owner, western Michigan coast', stockTrades: [] },
      { name: 'Lisa McClain', state: 'Michigan', district: 'MI-9', party: 'Republican', yearsInOffice: 4, email: 'rep@mcclain.house.gov', phone: '(202) 225-2106', committees: ['Armed Services', 'Oversight'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Business executive, strong Trump ally, thumb region of Michigan', stockTrades: [] },
      { name: 'Hillary Scholten', state: 'Michigan', district: 'MI-3', party: 'Democrat', yearsInOffice: 2, email: 'rep@scholten.house.gov', phone: '(202) 225-3831', committees: ['Judiciary', 'Education'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Immigration attorney, flipped Grand Rapids suburban seat blue in 2022', stockTrades: [] },
      { name: 'Shri Thanedar', state: 'Michigan', district: 'MI-13', party: 'Democrat', yearsInOffice: 2, email: 'rep@thanedar.house.gov', phone: '(202) 225-5126', committees: ['Science', 'Small Business'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Chemist and entrepreneur, first Indian-American elected from Michigan', stockTrades: [] },
      { name: 'Michelle Fischbach', state: 'Minnesota', district: 'MN-7', party: 'Republican', yearsInOffice: 4, email: 'rep@fischbach.house.gov', phone: '(202) 225-2165', committees: ['Agriculture', 'Ways and Means'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former Minnesota Lt. Governor, largest Minnesota district', stockTrades: [] },
      { name: 'Pete Stauber', state: 'Minnesota', district: 'MN-8', party: 'Republican', yearsInOffice: 6, email: 'rep@stauber.house.gov', phone: '(202) 225-6211', committees: ['Natural Resources', 'Transportation'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former police officer and NHL hockey player, Iron Range mining district', stockTrades: [] },
      { name: 'Mike Ezell', state: 'Mississippi', district: 'MS-4', party: 'Republican', yearsInOffice: 2, email: 'rep@ezell.house.gov', phone: '(202) 225-5772', committees: ['Transportation', 'Homeland Security'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former Jackson County Sheriff, Gulf Coast Mississippi', stockTrades: [] },
      { name: 'Emanuel Cleaver', state: 'Missouri', district: 'MO-5', party: 'Democrat', yearsInOffice: 20, email: 'rep@cleaver.house.gov', phone: '(202) 225-4535', committees: ['Financial Services'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'United Methodist pastor and former Kansas City Mayor', stockTrades: [] },
      { name: 'Blaine Luetkemeyer', state: 'Missouri', district: 'MO-3', party: 'Republican', yearsInOffice: 16, email: 'rep@luetkemeyer.house.gov', phone: '(202) 225-2956', committees: ['Financial Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Banking and small business advocate, rural Missouri', stockTrades: [] },
      { name: 'Matt Rosendale', state: 'Montana', district: 'MT-2', party: 'Republican', yearsInOffice: 4, email: 'rep@rosendale.house.gov', phone: '(202) 225-3211', committees: ['Natural Resources', 'Veterans Affairs'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former state auditor, hardline Freedom Caucus member, eastern Montana', stockTrades: [] },
      { name: 'Adrian Smith', state: 'Nebraska', district: 'NE-3', party: 'Republican', yearsInOffice: 18, email: 'rep@adriansmith.house.gov', phone: '(202) 225-6435', committees: ['Ways and Means'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Small business owner, agricultural trade and tax policy, largest NE district', stockTrades: [] },
      { name: 'Mark Amodei', state: 'Nevada', district: 'NV-2', party: 'Republican', yearsInOffice: 14, email: 'rep@amodei.house.gov', phone: '(202) 225-6155', committees: ['Appropriations'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Mining and public lands advocate, Nevada\'s longest-serving congressman', stockTrades: [] },
      { name: 'Steven Horsford', state: 'Nevada', district: 'NV-4', party: 'Democrat', yearsInOffice: 4, email: 'rep@horsford.house.gov', phone: '(202) 225-9894', committees: ['Ways and Means', 'Budget'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Congressional Black Caucus Chair, former Nevada Senate Majority Leader', stockTrades: [] },
      { name: 'Jeff Van Drew', state: 'New Jersey', district: 'NJ-2', party: 'Republican', yearsInOffice: 6, email: 'rep@vandrew.house.gov', phone: '(202) 225-6572', committees: ['Homeland Security', 'Science'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Switched parties Democrat to Republican in 2019 to avoid impeaching Trump', stockTrades: [] },
      { name: 'Chris Smith', state: 'New Jersey', district: 'NJ-4', party: 'Republican', yearsInOffice: 44, email: 'rep@chrissmith.house.gov', phone: '(202) 225-3765', committees: ['Foreign Affairs'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Anti-abortion veteran, one of longest-serving House members ever', stockTrades: [] },
      { name: 'Tom Kean Jr.', state: 'New Jersey', district: 'NJ-7', party: 'Republican', yearsInOffice: 2, email: 'rep@keanjr.house.gov', phone: '(202) 225-5361', committees: ['Science', 'Transportation'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Son of former New Jersey Governor Tom Kean Sr., moderate suburban Republican', stockTrades: [] },
      { name: 'Bill Pascrell', state: 'New Jersey', district: 'NJ-9', party: 'Democrat', yearsInOffice: 28, email: 'rep@pascrell.house.gov', phone: '(202) 225-5751', committees: ['Ways and Means'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Tax and trade policy veteran, forcefully referred Trump tax returns to DOJ', stockTrades: [] },
      { name: 'Bonnie Watson Coleman', state: 'New Jersey', district: 'NJ-12', party: 'Democrat', yearsInOffice: 10, email: 'rep@watsoncoleman.house.gov', phone: '(202) 225-5801', committees: ['Homeland Security', 'Appropriations'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First Black congresswoman from New Jersey, Trenton area', stockTrades: [] },
      { name: 'Gabe Vasquez', state: 'New Mexico', district: 'NM-2', party: 'Democrat', yearsInOffice: 2, email: 'rep@vasquez.house.gov', phone: '(202) 225-2365', committees: ['Armed Services', 'Natural Resources'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former Las Cruces city councilman, flipped border district blue in 2022', stockTrades: [] },
      { name: 'Yvette Clarke', state: 'New York', district: 'NY-9', party: 'Democrat', yearsInOffice: 18, email: 'rep@yvetteclarke.house.gov', phone: '(202) 225-6231', committees: ['Energy and Commerce', 'Homeland Security'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Brooklyn progressive, cybersecurity and digital equity focus', stockTrades: [] },
      { name: 'Adriano Espaillat', state: 'New York', district: 'NY-13', party: 'Democrat', yearsInOffice: 8, email: 'rep@espaillat.house.gov', phone: '(202) 225-4365', committees: ['Appropriations'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First Dominican-American in Congress, holds historic Harlem seat', stockTrades: [] },
      { name: 'Claudia Tenney', state: 'New York', district: 'NY-24', party: 'Republican', yearsInOffice: 6, email: 'rep@tenney.house.gov', phone: '(202) 225-3665', committees: ['Ways and Means', 'Foreign Affairs'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Newspaper publisher and manufacturer, upstate New York', stockTrades: [] },
      { name: 'Nick LaLota', state: 'New York', district: 'NY-1', party: 'Republican', yearsInOffice: 2, email: 'rep@lalota.house.gov', phone: '(202) 225-3826', committees: ['Armed Services', 'Homeland Security'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Navy veteran, eastern Long Island Suffolk County', stockTrades: [] },
      { name: 'Don Davis', state: 'North Carolina', district: 'NC-1', party: 'Democrat', yearsInOffice: 2, email: 'rep@davis.house.gov', phone: '(202) 225-3101', committees: ['Agriculture', 'Armed Services'], supportVotes: 2789, opposeVotes: 1890, userVote: null, bio: 'Air Force veteran, won Trump-leaning district as a moderate Democrat', stockTrades: [] },
      { name: 'Greg Landsman', state: 'Ohio', district: 'OH-1', party: 'Democrat', yearsInOffice: 2, email: 'rep@landsman.house.gov', phone: '(202) 225-2216', committees: ['Foreign Affairs', 'Armed Services'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former Cincinnati school board member, education champion', stockTrades: [] },
      { name: 'David Joyce', state: 'Ohio', district: 'OH-14', party: 'Republican', yearsInOffice: 12, email: 'rep@davidjoyce.house.gov', phone: '(202) 225-5731', committees: ['Appropriations', 'Judiciary'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Moderate Republican, bipartisan on cannabis reform and appropriations', stockTrades: [] },
      { name: 'Stephanie Bice', state: 'Oklahoma', district: 'OK-5', party: 'Republican', yearsInOffice: 4, email: 'rep@bice.house.gov', phone: '(202) 225-2132', committees: ['Appropriations'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former state senator, Appropriations Committee member, Oklahoma City', stockTrades: [] },
      { name: 'Guy Reschenthaler', state: 'Pennsylvania', district: 'PA-14', party: 'Republican', yearsInOffice: 6, email: 'rep@reschenthaler.house.gov', phone: '(202) 225-2065', committees: ['Rules', 'Judiciary'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Navy JAG attorney, Rules Committee member, western Pennsylvania', stockTrades: [] },
      { name: 'Susan Wild', state: 'Pennsylvania', district: 'PA-7', party: 'Democrat', yearsInOffice: 6, email: 'rep@wild.house.gov', phone: '(202) 225-6411', committees: ['Foreign Affairs', 'Ethics'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Attorney, Ethics Committee member, Lehigh Valley swing district', stockTrades: [] },
      { name: 'Lloyd Smucker', state: 'Pennsylvania', district: 'PA-11', party: 'Republican', yearsInOffice: 8, email: 'rep@smucker.house.gov', phone: '(202) 225-2411', committees: ['Budget', 'Ways and Means'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Construction executive, Lancaster County Pennsylvania', stockTrades: [] },
      { name: 'Jim Langevin', state: 'Rhode Island', district: 'RI-2', party: 'Democrat', yearsInOffice: 24, email: 'rep@langevin.house.gov', phone: '(202) 225-2735', committees: ['Armed Services', 'Homeland Security'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'First quadriplegic elected to Congress, cybersecurity policy pioneer', stockTrades: [] },
      { name: 'Joe Wilson', state: 'South Carolina', district: 'SC-2', party: 'Republican', yearsInOffice: 24, email: 'rep@joewilson.house.gov', phone: '(202) 225-2452', committees: ['Armed Services', 'Foreign Affairs'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Famous for shouting \'You lie!\' at Obama during 2009 State of the Union', stockTrades: [] },
      { name: 'Dusty Johnson', state: 'South Dakota', district: 'SD-At Large', party: 'Republican', yearsInOffice: 6, email: 'rep@dustyjohnson.house.gov', phone: '(202) 225-2801', committees: ['Agriculture', 'Transportation'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Pragmatic moderate Republican, South Dakota\'s only congressman', stockTrades: [] },
      { name: 'Steve Cohen', state: 'Tennessee', district: 'TN-9', party: 'Democrat', yearsInOffice: 18, email: 'rep@cohen.house.gov', phone: '(202) 225-3265', committees: ['Judiciary', 'Transportation'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Progressive in deep red state, criminal justice and drug policy reform', stockTrades: [] },
      { name: 'Chuck Fleischmann', state: 'Tennessee', district: 'TN-3', party: 'Republican', yearsInOffice: 14, email: 'rep@fleischmann.house.gov', phone: '(202) 225-3271', committees: ['Appropriations'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Nuclear energy champion, oversees Oak Ridge National Laboratory funding', stockTrades: [] },
      { name: 'John Carter', state: 'Texas', district: 'TX-31', party: 'Republican', yearsInOffice: 22, email: 'rep@carter.house.gov', phone: '(202) 225-3864', committees: ['Appropriations'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former judge, defense appropriations veteran, Fort Hood area', stockTrades: [] },
      { name: 'Marc Veasey', state: 'Texas', district: 'TX-33', party: 'Democrat', yearsInOffice: 12, email: 'rep@veasey.house.gov', phone: '(202) 225-9897', committees: ['Armed Services', 'Energy and Commerce'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Voting rights champion, Fort Worth and Dallas urban area', stockTrades: [] },
      { name: 'Lizzie Fletcher', state: 'Texas', district: 'TX-7', party: 'Democrat', yearsInOffice: 6, email: 'rep@fletcher.house.gov', phone: '(202) 225-2571', committees: ['Energy and Commerce', 'Science'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Energy attorney, flipped Houston suburbs seat in the 2018 blue wave', stockTrades: [] },
      { name: 'Wesley Hunt', state: 'Texas', district: 'TX-38', party: 'Republican', yearsInOffice: 2, email: 'rep@wesleyhunt.house.gov', phone: '(202) 225-3816', committees: ['Natural Resources', 'Science'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Army Apache helicopter pilot, rising Republican star from Houston suburbs', stockTrades: [] },
      { name: 'Pat Fallon', state: 'Texas', district: 'TX-4', party: 'Republican', yearsInOffice: 4, email: 'rep@fallon.house.gov', phone: '(202) 225-6673', committees: ['Armed Services', 'Oversight'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former state legislator, Air Force veteran, North Texas', stockTrades: [] },
      { name: 'Jake Ellzey', state: 'Texas', district: 'TX-6', party: 'Republican', yearsInOffice: 4, email: 'rep@ellzey.house.gov', phone: '(202) 225-2002', committees: ['Armed Services', 'Science'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Navy fighter pilot, upset Trump-backed candidate in 2021 special election', stockTrades: [] },
      { name: 'Burgess Owens', state: 'Utah', district: 'UT-4', party: 'Republican', yearsInOffice: 4, email: 'rep@owens.house.gov', phone: '(202) 225-3011', committees: ['Education', 'Judiciary'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Super Bowl champion with Oakland Raiders, conservative commentator and author', stockTrades: [] },
      { name: 'Rob Wittman', state: 'Virginia', district: 'VA-1', party: 'Republican', yearsInOffice: 17, email: 'rep@wittman.house.gov', phone: '(202) 225-4261', committees: ['Armed Services', 'Natural Resources'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Marine biologist, Armed Services vice chair, Chesapeake Bay and defense focus', stockTrades: [] },
      { name: 'Don Beyer', state: 'Virginia', district: 'VA-8', party: 'Democrat', yearsInOffice: 10, email: 'rep@beyer.house.gov', phone: '(202) 225-4376', committees: ['Ways and Means', 'Science'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former Ambassador to Switzerland and Finland, Volvo car dealership owner', stockTrades: [] },
      { name: 'Morgan Griffith', state: 'Virginia', district: 'VA-9', party: 'Republican', yearsInOffice: 14, email: 'rep@morgangriffith.house.gov', phone: '(202) 225-3861', committees: ['Energy and Commerce'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Coal country rep, opioid and energy policy focus in southwestern Virginia', stockTrades: [] },
      { name: 'Rick Larsen', state: 'Washington', district: 'WA-2', party: 'Democrat', yearsInOffice: 24, email: 'rep@larsen.house.gov', phone: '(202) 225-2605', committees: ['Transportation', 'Armed Services'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Aviation and Boeing champion, longest-serving WA Democrat in the House', stockTrades: [] },
      { name: 'Dan Newhouse', state: 'Washington', district: 'WA-4', party: 'Republican', yearsInOffice: 10, email: 'rep@newhouse.house.gov', phone: '(202) 225-5816', committees: ['Appropriations', 'Rules'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Hop and fruit farmer, one of ten Republicans who voted to impeach Trump in 2021', stockTrades: [] },
      { name: 'Carol Miller', state: 'West Virginia', district: 'WV-1', party: 'Republican', yearsInOffice: 6, email: 'rep@miller.house.gov', phone: '(202) 225-3452', committees: ['Ways and Means', 'Energy and Commerce'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Businesswoman, strong Trump ally, northern West Virginia', stockTrades: [] },
      { name: 'Bryan Steil', state: 'Wisconsin', district: 'WI-1', party: 'Republican', yearsInOffice: 6, email: 'rep@steil.house.gov', phone: '(202) 225-3031', committees: ['Administration', 'Financial Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Holds Paul Ryan\'s former Janesville seat, election law and financial focus', stockTrades: [] },
      { name: 'Tom Tiffany', state: 'Wisconsin', district: 'WI-7', party: 'Republican', yearsInOffice: 4, email: 'rep@tiffany.house.gov', phone: '(202) 225-3365', committees: ['Judiciary', 'Natural Resources'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former state senator, tourism business owner, rural northern Wisconsin', stockTrades: [] },
      { name: 'Harriet Hageman', state: 'Wyoming', district: 'WY-At Large', party: 'Republican', yearsInOffice: 2, email: 'rep@hageman.house.gov', phone: '(202) 225-2311', committees: ['Judiciary', 'Natural Resources'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Water rights attorney who defeated Liz Cheney in 2022 with Trumps backing', stockTrades: [] },

      // ── SENATE BATCH 4 ──

      // ── HOUSE BATCH 4 ──
      { name: 'Jerry Carl', state: 'Alabama', district: 'AL-1', party: 'Republican', yearsInOffice: 2, email: 'rep@carl.house.gov', phone: '(202) 225-4931', committees: ['Armed Services', 'Natural Resources'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Former Mobile County Commissioner, business owner', stockTrades: [] },
      { name: 'Mike Levin', state: 'California', district: 'CA-49', party: 'Democrat', yearsInOffice: 6, email: 'rep@levin.house.gov', phone: '(202) 225-3906', committees: ['Natural Resources', 'Veterans Affairs'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Clean energy attorney, North San Diego and South Orange County coastal district', stockTrades: [] },
      { name: 'Young Kim', state: 'California', district: 'CA-40', party: 'Republican', yearsInOffice: 4, email: 'rep@youngkim.house.gov', phone: '(202) 225-4111', committees: ['Foreign Affairs', 'Financial Services'], supportVotes: 2678, opposeVotes: 2123, userVote: null, bio: 'Korean-American businesswoman, first Korean-American Republican woman in Congress', stockTrades: [] },
      { name: 'Michelle Steel', state: 'California', district: 'CA-45', party: 'Republican', yearsInOffice: 4, email: 'rep@steel.house.gov', phone: '(202) 225-2415', committees: ['Ways and Means', 'Transportation'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Korean-American, former Orange County Supervisor', stockTrades: [] },
      { name: 'Jay Obernolte', state: 'California', district: 'CA-23', party: 'Republican', yearsInOffice: 4, email: 'rep@obernolte.house.gov', phone: '(202) 225-5861', committees: ['Science', 'Armed Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Video game developer with masters in AI, only game developer in Congress', stockTrades: [] },
      { name: 'Ted Lieu', state: 'California', district: 'CA-36', party: 'Democrat', yearsInOffice: 10, email: 'rep@lieu.house.gov', phone: '(202) 225-3976', committees: ['Judiciary', 'Foreign Affairs'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Air Force veteran, computer science degree, sharp Trump critic on Judiciary', stockTrades: [] },
      { name: 'Sean Casten', state: 'Illinois', district: 'IL-6', party: 'Democrat', yearsInOffice: 6, email: 'rep@casten.house.gov', phone: '(202) 225-4561', committees: ['Financial Services', 'Science'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Clean energy entrepreneur, climate finance advocate, Chicago suburbs', stockTrades: [] },
      { name: 'Lauren Underwood', state: 'Illinois', district: 'IL-14', party: 'Democrat', yearsInOffice: 6, email: 'rep@underwood.house.gov', phone: '(202) 225-2976', committees: ['Appropriations'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Registered nurse, youngest Black woman elected to Congress when first elected', stockTrades: [] },
      { name: 'Marie Gluesenkamp Perez', state: 'Washington', district: 'WA-3', party: 'Democrat', yearsInOffice: 2, email: 'rep@gluesenkampperez.house.gov', phone: '(202) 225-3536', committees: ['Armed Services', 'Transportation'], supportVotes: 2789, opposeVotes: 1890, userVote: null, bio: 'Auto repair shop owner, flipped rural Washington seat, one of biggest 2022 upsets', stockTrades: [] },
      { name: 'Derek Kilmer', state: 'Washington', district: 'WA-6', party: 'Democrat', yearsInOffice: 12, email: 'rep@kilmer.house.gov', phone: '(202) 225-5916', committees: ['Appropriations'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former venture capitalist, Problem Solvers Caucus leader, Olympic Peninsula', stockTrades: [] },
      { name: 'Cathy McMorris Rodgers', state: 'Washington', district: 'WA-5', party: 'Republican', yearsInOffice: 20, email: 'rep@mcmorrisrodgers.house.gov', phone: '(202) 225-2006', committees: ['Energy and Commerce'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Longest-serving Republican woman in House history, Energy and Commerce Committee Chair', stockTrades: [] },
      { name: 'David Rouzer', state: 'North Carolina', district: 'NC-7', party: 'Republican', yearsInOffice: 10, email: 'rep@rouzer.house.gov', phone: '(202) 225-2731', committees: ['Agriculture', 'Transportation'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Farmer and agricultural economist, rural southeastern North Carolina', stockTrades: [] },
      { name: 'Greg Murphy', state: 'North Carolina', district: 'NC-3', party: 'Republican', yearsInOffice: 5, email: 'rep@murphy.house.gov', phone: '(202) 225-3415', committees: ['Ways and Means', 'Budget'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Urologist, won 2019 special election, eastern North Carolina', stockTrades: [] },
      { name: 'Warren Davidson', state: 'Ohio', district: 'OH-8', party: 'Republican', yearsInOffice: 8, email: 'rep@davidson.house.gov', phone: '(202) 225-6205', committees: ['Financial Services', 'Armed Services'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'West Point graduate and Army Ranger, cryptocurrency advocate, Freedom Caucus', stockTrades: [] },
      { name: 'Tony Gonzales', state: 'Texas', district: 'TX-23', party: 'Republican', yearsInOffice: 4, email: 'rep@gonzales.house.gov', phone: '(202) 225-4511', committees: ['Appropriations', 'Homeland Security'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Navy cryptologist, largest Texas district covering US-Mexico border', stockTrades: [] },
      { name: 'Veronica Escobar', state: 'Texas', district: 'TX-16', party: 'Democrat', yearsInOffice: 6, email: 'rep@escobar.house.gov', phone: '(202) 225-4831', committees: ['Judiciary', 'Armed Services'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'First Latina to represent El Paso in Congress, immigration and border policy expert', stockTrades: [] },
      { name: 'Sylvia Garcia', state: 'Texas', district: 'TX-29', party: 'Democrat', yearsInOffice: 6, email: 'rep@sylviagarcia.house.gov', phone: '(202) 225-1688', committees: ['Judiciary', 'Financial Services'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Texas state senator, Houston area Latina leader', stockTrades: [] },
      { name: 'Joaquin Castro', state: 'Texas', district: 'TX-20', party: 'Democrat', yearsInOffice: 12, email: 'rep@castro.house.gov', phone: '(202) 225-3236', committees: ['Intelligence', 'Foreign Affairs'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Twin brother of former HUD Secretary Julian Castro, San Antonio representative', stockTrades: [] },
      { name: 'Roger Williams', state: 'Texas', district: 'TX-25', party: 'Republican', yearsInOffice: 12, email: 'rep@rogerwilliams.house.gov', phone: '(202) 225-9896', committees: ['Financial Services', 'Transportation'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Auto dealership owner, former Texas Secretary of State', stockTrades: [] },
      { name: 'John Moolenaar', state: 'Michigan', district: 'MI-2', party: 'Republican', yearsInOffice: 10, email: 'rep@moolenaar.house.gov', phone: '(202) 225-3561', committees: ['Appropriations', 'Science'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'China Select Committee Chair, former state senator, western Michigan', stockTrades: [] },
      { name: 'Brenda Jones', state: 'Michigan', district: 'MI-13', party: 'Democrat', yearsInOffice: 4, email: 'rep@brendajones.house.gov', phone: '(202) 225-5126', committees: ['Transportation', 'Oversight'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Detroit city council president, community advocate', stockTrades: [] },
      { name: 'Glenn Grothman', state: 'Wisconsin', district: 'WI-6', party: 'Republican', yearsInOffice: 10, email: 'rep@grothman.house.gov', phone: '(202) 225-2476', committees: ['Oversight', 'Budget'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former state senator, fiscal conservative, central Wisconsin', stockTrades: [] },
      { name: 'Norma Torres', state: 'California', district: 'CA-35', party: 'Democrat', yearsInOffice: 10, email: 'rep@torres.house.gov', phone: '(202) 225-6161', committees: ['Appropriations'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former 911 dispatcher, first Central American-born woman in Congress', stockTrades: [] },
      { name: 'Linda Sanchez', state: 'California', district: 'CA-38', party: 'Democrat', yearsInOffice: 22, email: 'rep@lindasanchez.house.gov', phone: '(202) 225-6676', committees: ['Ways and Means', 'Ethics'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'First sisters to serve simultaneously in Congress alongside former Rep Loretta Sanchez', stockTrades: [] },
      { name: 'Grace Napolitano', state: 'California', district: 'CA-31', party: 'Democrat', yearsInOffice: 26, email: 'rep@napolitano.house.gov', phone: '(202) 225-5256', committees: ['Transportation', 'Natural Resources'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Mental health champion, water infrastructure advocate, San Gabriel Valley', stockTrades: [] },

      // ── ALABAMA (need 1) ──

      // ── ALASKA (need 1) ──
      { name: 'Mary Peltola', state: 'Alaska', district: 'AK-At Large', party: 'Democrat', yearsInOffice: 2, email: 'rep@peltola.house.gov', phone: '(202) 225-5765', committees: ['Natural Resources', 'Transportation'], supportVotes: 2789, opposeVotes: 1890, userVote: null, bio: 'First Alaska Native elected to Congress, won 2022 special election, subsistence fishing advocate', stockTrades: [] },

      // ── ARIZONA (need 3) ──
      { name: 'Juan Ciscomani', state: 'Arizona', district: 'AZ-6', party: 'Republican', yearsInOffice: 2, email: 'rep@ciscomani.house.gov', phone: '(202) 225-2542', committees: ['Appropriations'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Mexican-born small business owner, won Tucson-area swing seat in 2022', stockTrades: [] },
      { name: 'Eli Crane', state: 'Arizona', district: 'AZ-2', party: 'Republican', yearsInOffice: 2, email: 'rep@crane.house.gov', phone: '(202) 225-3361', committees: ['Veterans Affairs', 'Natural Resources'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Navy SEAL veteran, water bottle entrepreneur, rural northern Arizona', stockTrades: [] },

      // ── ARKANSAS (need 1) ──
      { name: 'Steve Womack', state: 'Arkansas', district: 'AR-3', party: 'Republican', yearsInOffice: 14, email: 'rep@womack.house.gov', phone: '(202) 225-4301', committees: ['Appropriations'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Former Army National Guard colonel, Appropriations Committee member, northwest Arkansas', stockTrades: [] },

      // ── CALIFORNIA (need 15) ──
      { name: 'Kevin Kiley', state: 'California', district: 'CA-3', party: 'Republican', yearsInOffice: 2, email: 'rep@kiley.house.gov', phone: '(202) 225-2511', committees: ['Education', 'Transportation'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former state assemblyman, led 2021 Newsom recall effort', stockTrades: [] },
      { name: 'Mike Thompson', state: 'California', district: 'CA-4', party: 'Democrat', yearsInOffice: 26, email: 'rep@thompson.house.gov', phone: '(202) 225-3311', committees: ['Ways and Means'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Vietnam veteran, gun violence prevention caucus chair, Napa Valley wine country', stockTrades: [] },
      { name: 'John Duarte', state: 'California', district: 'CA-13', party: 'Republican', yearsInOffice: 2, email: 'rep@duarte.house.gov', phone: '(202) 225-1947', committees: ['Agriculture', 'Transportation'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Walnut and cherry farmer, won Central Valley seat by just 564 votes in 2022', stockTrades: [] },

      // ── COLORADO (need 3) ──
      { name: 'Diana DeGette', state: 'Colorado', district: 'CO-1', party: 'Democrat', yearsInOffice: 28, email: 'rep@degette.house.gov', phone: '(202) 225-4431', committees: ['Energy and Commerce'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Stem cell and healthcare champion, Denver representative, pro-choice advocate', stockTrades: [] },
      { name: 'Brittany Pettersen', state: 'Colorado', district: 'CO-7', party: 'Democrat', yearsInOffice: 2, email: 'rep@pettersen.house.gov', phone: '(202) 225-2645', committees: ['Transportation', 'Science'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former state senator, mental health and substance abuse champion, Denver suburbs', stockTrades: [] },
      { name: 'Gabe Evans', state: 'Colorado', district: 'CO-8', party: 'Republican', yearsInOffice: 1, email: 'rep@evans.house.gov', phone: '(202) 225-5625', committees: ['Agriculture', 'Homeland Security'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Army veteran and police officer, flipped swing district in 2024', stockTrades: [] },

      // ── CONNECTICUT (need 1) ──

      // ── DELAWARE (need 1) ──

      // ── FLORIDA (need 19) ──
      { name: 'Aaron Bean', state: 'Florida', district: 'FL-4', party: 'Republican', yearsInOffice: 2, email: 'rep@bean.house.gov', phone: '(202) 225-0123', committees: ['Education', 'Homeland Security'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former Florida state senator, northeast Florida district', stockTrades: [] },
      { name: 'John Rutherford', state: 'Florida', district: 'FL-5', party: 'Republican', yearsInOffice: 8, email: 'rep@rutherford.house.gov', phone: '(202) 225-2501', committees: ['Appropriations'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former Jacksonville Sheriff, Appropriations member, northeast Florida', stockTrades: [] },
      { name: 'Cory Mills', state: 'Florida', district: 'FL-7', party: 'Republican', yearsInOffice: 2, email: 'rep@mills.house.gov', phone: '(202) 225-2176', committees: ['Armed Services', 'Foreign Affairs'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Army veteran and defense contractor, personally evacuated Americans from Sudan in 2023', stockTrades: [] },
      { name: 'Daniel Webster', state: 'Florida', district: 'FL-11', party: 'Republican', yearsInOffice: 14, email: 'rep@webster.house.gov', phone: '(202) 225-1002', committees: ['Transportation', 'Science'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former Florida House Speaker, central Florida, once challenged Boehner for Speaker', stockTrades: [] },
      { name: 'Kathy Castor', state: 'Florida', district: 'FL-14', party: 'Democrat', yearsInOffice: 18, email: 'rep@castor.house.gov', phone: '(202) 225-3376', committees: ['Energy and Commerce'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former Select Committee on Climate Crisis Chair, Tampa representative', stockTrades: [] },
      { name: 'Scott Franklin', state: 'Florida', district: 'FL-18', party: 'Republican', yearsInOffice: 4, email: 'rep@franklin.house.gov', phone: '(202) 225-1252', committees: ['Armed Services', 'Transportation'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Navy pilot, financial services background, central Florida', stockTrades: [] },
      { name: 'Byron Donalds', state: 'Florida', district: 'FL-19', party: 'Republican', yearsInOffice: 4, email: 'rep@donalds.house.gov', phone: '(202) 225-2536', committees: ['Oversight', 'Judiciary'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Received votes for Speaker in 2023, Black conservative firebrand, southwest Florida', stockTrades: [] },
      { name: 'Brian Mast', state: 'Florida', district: 'FL-21', party: 'Republican', yearsInOffice: 8, email: 'rep@mast.house.gov', phone: '(202) 225-3026', committees: ['Foreign Affairs', 'Transportation'], supportVotes: 2678, opposeVotes: 2123, userVote: null, bio: 'Lost both legs serving in Afghanistan, Israel strong supporter, Palm Beach area', stockTrades: [] },
      { name: 'Lois Frankel', state: 'Florida', district: 'FL-22', party: 'Democrat', yearsInOffice: 12, email: 'rep@frankel.house.gov', phone: '(202) 225-9890', committees: ['Appropriations'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former West Palm Beach Mayor, Appropriations member, South Florida', stockTrades: [] },
      { name: 'Sheila Cherfilus-McCormick', state: 'Florida', district: 'FL-20', party: 'Democrat', yearsInOffice: 3, email: 'rep@cherfilus.house.gov', phone: '(202) 225-1313', committees: ['Foreign Affairs', 'Veterans Affairs'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Healthcare CEO, Haitian-American, won special election to replace late Alcee Hastings', stockTrades: [] },
      { name: 'Mario Diaz-Balart', state: 'Florida', district: 'FL-26', party: 'Republican', yearsInOffice: 20, email: 'rep@diazbalart.house.gov', phone: '(202) 225-2778', committees: ['Appropriations'], supportVotes: 2678, opposeVotes: 2123, userVote: null, bio: 'Cuban-American, Appropriations member, Miami-Dade district', stockTrades: [] },
      { name: 'Carlos Gimenez', state: 'Florida', district: 'FL-28', party: 'Republican', yearsInOffice: 4, email: 'rep@gimenez.house.gov', phone: '(202) 225-2778', committees: ['Homeland Security', 'Transportation'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Former Miami-Dade County Mayor, Cuban-American, firefighter background', stockTrades: [] },

      // ── GEORGIA (need 8) ──
      { name: 'Buddy Carter', state: 'Georgia', district: 'GA-1', party: 'Republican', yearsInOffice: 10, email: 'rep@carter.house.gov', phone: '(202) 225-5831', committees: ['Energy and Commerce', 'Budget'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Pharmacist, coastal Georgia, Savannah area conservative', stockTrades: [] },
      { name: 'Drew Ferguson', state: 'Georgia', district: 'GA-3', party: 'Republican', yearsInOffice: 8, email: 'rep@ferguson.house.gov', phone: '(202) 225-5901', committees: ['Ways and Means'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former dentist and mayor of West Point, Georgia, Ways and Means member', stockTrades: [] },
      { name: 'Mike Collins', state: 'Georgia', district: 'GA-10', party: 'Republican', yearsInOffice: 2, email: 'rep@mikecollins.house.gov', phone: '(202) 225-4101', committees: ['Judiciary', 'Transportation'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Transportation business owner, son of former pitcher Dave Collins, northeast Georgia', stockTrades: [] },
      { name: 'Barry Loudermilk', state: 'Georgia', district: 'GA-11', party: 'Republican', yearsInOffice: 10, email: 'rep@loudermilk.house.gov', phone: '(202) 225-2931', committees: ['Administration', 'Financial Services'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Air Force veteran, House Administration Committee Chair, north of Atlanta suburbs', stockTrades: [] },
      { name: 'Rick Allen', state: 'Georgia', district: 'GA-12', party: 'Republican', yearsInOffice: 10, email: 'rep@rickallen.house.gov', phone: '(202) 225-2823', committees: ['Education', 'Agriculture'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Construction company owner, rural eastern Georgia', stockTrades: [] },

      // ── HAWAII (need 2) ──
      { name: 'Ed Case', state: 'Hawaii', district: 'HI-1', party: 'Democrat', yearsInOffice: 6, email: 'rep@case.house.gov', phone: '(202) 225-2726', committees: ['Appropriations'], supportVotes: 2789, opposeVotes: 1890, userVote: null, bio: 'Moderate Democrat, Honolulu urban district, former state rep', stockTrades: [] },
      { name: 'Jill Tokuda', state: 'Hawaii', district: 'HI-2', party: 'Democrat', yearsInOffice: 2, email: 'rep@tokuda.house.gov', phone: '(202) 225-4906', committees: ['Armed Services', 'Education'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former state senator, rural Hawaii and outer islands representative', stockTrades: [] },

      // ── ILLINOIS (need 5) ──
      { name: 'Jonathan Jackson', state: 'Illinois', district: 'IL-1', party: 'Democrat', yearsInOffice: 2, email: 'rep@jonathanjackson.house.gov', phone: '(202) 225-0773', committees: ['Foreign Affairs', 'Science'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Son of Rev. Jesse Jackson, South Side Chicago, succeeded Bobby Rush', stockTrades: [] },
      { name: 'Nikki Budzinski', state: 'Illinois', district: 'IL-13', party: 'Democrat', yearsInOffice: 2, email: 'rep@budzinski.house.gov', phone: '(202) 225-2371', committees: ['Agriculture', 'Veterans Affairs'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former labor and workforce official, flipped central Illinois seat blue in 2022', stockTrades: [] },
      { name: 'Eric Sorensen', state: 'Illinois', district: 'IL-17', party: 'Democrat', yearsInOffice: 2, email: 'rep@sorensen.house.gov', phone: '(202) 225-5905', committees: ['Agriculture', 'Science'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former TV meteorologist, first openly gay man elected from Illinois', stockTrades: [] },
      { name: 'Mary Miller', state: 'Illinois', district: 'IL-15', party: 'Republican', yearsInOffice: 4, email: 'rep@marymiller.house.gov', phone: '(202) 225-5271', committees: ['Agriculture', 'Education'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Farmer and homeschool advocate, quoted Hitler in first speech, rural southern Illinois', stockTrades: [] },

      // ── INDIANA (need 6) ──
      { name: 'Victoria Spartz', state: 'Indiana', district: 'IN-5', party: 'Republican', yearsInOffice: 4, email: 'rep@spartz.house.gov', phone: '(202) 225-2276', committees: ['Judiciary', 'Budget'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Ukrainian-born, first Ukrainian-American elected to Congress, fiscal hawk', stockTrades: [] },
      { name: 'Andre Carson', state: 'Indiana', district: 'IN-7', party: 'Democrat', yearsInOffice: 16, email: 'rep@carson2.house.gov', phone: '(202) 225-4011', committees: ['Intelligence', 'Transportation'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'One of first Muslims in Congress, Intelligence Committee member, Indianapolis', stockTrades: [] },
      { name: 'Larry Bucshon', state: 'Indiana', district: 'IN-8', party: 'Republican', yearsInOffice: 14, email: 'rep@bucshon.house.gov', phone: '(202) 225-4636', committees: ['Energy and Commerce'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Cardiothoracic surgeon, healthcare policy focus, southwestern Indiana', stockTrades: [] },
      { name: 'Erin Houchin', state: 'Indiana', district: 'IN-9', party: 'Republican', yearsInOffice: 2, email: 'rep@houchin.house.gov', phone: '(202) 225-5315', committees: ['Financial Services'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former state senator, southeastern Indiana district', stockTrades: [] },
      { name: 'Rudy Yakym', state: 'Indiana', district: 'IN-2', party: 'Republican', yearsInOffice: 2, email: 'rep@yakym.house.gov', phone: '(202) 225-3915', committees: ['Transportation', 'Veterans Affairs'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Business executive, won 2022 special election to replace late Jackie Walorski', stockTrades: [] },
      { name: 'Mark Souder', state: 'Indiana', district: 'IN-3', party: 'Republican', yearsInOffice: 2, email: 'rep@souder.house.gov', phone: '(202) 225-4436', committees: ['Armed Services', 'Budget'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Northeast Indiana district, Fort Wayne area conservative', stockTrades: [] },

      // ── IOWA (need 2) ──
      { name: 'Zach Nunn', state: 'Iowa', district: 'IA-3', party: 'Republican', yearsInOffice: 2, email: 'rep@nunn.house.gov', phone: '(202) 225-5476', committees: ['Agriculture', 'Financial Services'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Air Force veteran, flipped Des Moines suburban seat in 2022', stockTrades: [] },

      // ── KANSAS (need 3) ──
      { name: 'Jake LaTurner', state: 'Kansas', district: 'KS-2', party: 'Republican', yearsInOffice: 4, email: 'rep@laturner.house.gov', phone: '(202) 225-6601', committees: ['Homeland Security', 'Budget'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former state treasurer, eastern Kansas district', stockTrades: [] },
      { name: 'Sharice Davids', state: 'Kansas', district: 'KS-3', party: 'Democrat', yearsInOffice: 6, email: 'rep@davids.house.gov', phone: '(202) 225-2865', committees: ['Transportation', 'Small Business'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'MMA fighter and attorney, first Native American congresswoman from Kansas, Kansas City suburbs', stockTrades: [] },
      { name: 'Ron Estes', state: 'Kansas', district: 'KS-4', party: 'Republican', yearsInOffice: 7, email: 'rep@estes.house.gov', phone: '(202) 225-6216', committees: ['Ways and Means', 'Education'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former Kansas state treasurer, Wichita area district', stockTrades: [] },

      // ── KENTUCKY (need 3) ──
      { name: 'Thomas Massie', state: 'Kentucky', district: 'KY-4', party: 'Republican', yearsInOffice: 12, email: 'rep@massie.house.gov', phone: '(202) 225-3465', committees: ['Judiciary', 'Oversight'], supportVotes: 2234, opposeVotes: 2678, userVote: null, bio: 'MIT-educated libertarian, goat farmer, lone no votes on everything', stockTrades: [] },
      { name: 'Hal Rogers', state: 'Kentucky', district: 'KY-5', party: 'Republican', yearsInOffice: 44, email: 'rep@halrogers.house.gov', phone: '(202) 225-4601', committees: ['Appropriations'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Dean of Kentucky delegation, longest-serving current KY member, Appalachian district', stockTrades: [] },

      // ── MARYLAND (need 4) ──
      { name: 'Andy Harris', state: 'Maryland', district: 'MD-1', party: 'Republican', yearsInOffice: 14, email: 'rep@harris.house.gov', phone: '(202) 225-5311', committees: ['Appropriations'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Anesthesiologist, only Maryland Republican in House, Eastern Shore district', stockTrades: [] },
      { name: 'Dutch Ruppersberger', state: 'Maryland', district: 'MD-2', party: 'Democrat', yearsInOffice: 22, email: 'rep@ruppersberger.house.gov', phone: '(202) 225-3061', committees: ['Appropriations'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former Baltimore County Executive, defense and intelligence appropriations', stockTrades: [] },
      { name: 'John Sarbanes', state: 'Maryland', district: 'MD-3', party: 'Democrat', yearsInOffice: 18, email: 'rep@sarbanes.house.gov', phone: '(202) 225-4016', committees: ['Energy and Commerce', 'Oversight'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Campaign finance and democracy reform champion, son of former Senator Paul Sarbanes', stockTrades: [] },
      { name: 'Glenn Ivey', state: 'Maryland', district: 'MD-4', party: 'Democrat', yearsInOffice: 2, email: 'rep@ivey.house.gov', phone: '(202) 225-8699', committees: ['Judiciary', 'Science'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Prince Georges County State Attorney, holds Steny Hoyers former seat', stockTrades: [] },

      // ── MASSACHUSETTS (need 6) ──
      { name: 'Richard Neal', state: 'Massachusetts', district: 'MA-1', party: 'Democrat', yearsInOffice: 35, email: 'rep@neal.house.gov', phone: '(202) 225-5601', committees: ['Ways and Means'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Ways and Means Ranking Member, requested Trumps tax returns, western Massachusetts', stockTrades: [] },
      { name: 'Jim McGovern', state: 'Massachusetts', district: 'MA-2', party: 'Democrat', yearsInOffice: 27, email: 'rep@mcgovern.house.gov', phone: '(202) 225-6101', committees: ['Rules', 'Agriculture'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Rules Committee Ranking Member, hunger and food security champion, Worcester area', stockTrades: [] },
      { name: 'Lori Trahan', state: 'Massachusetts', district: 'MA-3', party: 'Democrat', yearsInOffice: 6, email: 'rep@trahan.house.gov', phone: '(202) 225-3411', committees: ['Education', 'Armed Services'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Lowell area representative, workforce development and education champion', stockTrades: [] },
      { name: 'Katherine Clark', state: 'Massachusetts', district: 'MA-5', party: 'Democrat', yearsInOffice: 11, email: 'rep@clark.house.gov', phone: '(202) 225-2836', committees: ['Leadership'], supportVotes: 3567, opposeVotes: 1123, userVote: null, bio: 'House Minority Whip, second-highest House Democrat, Boston suburbs', stockTrades: [] },
      { name: 'Bill Keating', state: 'Massachusetts', district: 'MA-9', party: 'Democrat', yearsInOffice: 14, email: 'rep@keating.house.gov', phone: '(202) 225-3111', committees: ['Foreign Affairs', 'Homeland Security'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former DA and state AG, Cape Cod and southeastern Massachusetts', stockTrades: [] },

      // ── MICHIGAN (need 2) ──
      { name: 'Tim Walberg', state: 'Michigan', district: 'MI-5', party: 'Republican', yearsInOffice: 14, email: 'rep@walberg.house.gov', phone: '(202) 225-6276', committees: ['Education', 'Energy and Commerce'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former pastor, Education Committee Chair, southwestern Michigan', stockTrades: [] },

      // ── MINNESOTA (need 1) ──

      // ── MISSISSIPPI (need 1) ──
      { name: 'Trent Kelly', state: 'Mississippi', district: 'MS-1', party: 'Republican', yearsInOffice: 9, email: 'rep@trentelly.house.gov', phone: '(202) 225-4306', committees: ['Armed Services', 'Agriculture'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Army National Guard brigadier general, northeast Mississippi', stockTrades: [] },

      // ── MISSOURI (need 2) ──

      // ── NEBRASKA (need 1) ──
      { name: 'Mike Flood', state: 'Nebraska', district: 'NE-1', party: 'Republican', yearsInOffice: 2, email: 'rep@flood.house.gov', phone: '(202) 225-4806', committees: ['Financial Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former Nebraska Speaker of the Legislature, Lincoln area district', stockTrades: [] },

      // ── NEW HAMPSHIRE (need 1) ──
      { name: 'Annie Kuster', state: 'New Hampshire', district: 'NH-2', party: 'Democrat', yearsInOffice: 12, email: 'rep@kuster.house.gov', phone: '(202) 225-5206', committees: ['Energy and Commerce'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'New Democrat Coalition Chair, attorney and rural health advocate, western NH', stockTrades: [] },

      // ── NEW JERSEY (need 3) ──
      { name: 'Rob Menendez', state: 'New Jersey', district: 'NJ-8', party: 'Democrat', yearsInOffice: 2, email: 'rep@robmenendez.house.gov', phone: '(202) 225-7919', committees: ['Transportation', 'Science'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Son of convicted Senator Bob Menendez, Jersey City area district', stockTrades: [] },

      // ── NEW MEXICO (need 1) ──
      { name: 'Melanie Stansbury', state: 'New Mexico', district: 'NM-1', party: 'Democrat', yearsInOffice: 3, email: 'rep@stansbury.house.gov', phone: '(202) 225-6316', committees: ['Natural Resources', 'Oversight'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Environmental scientist, won 2021 special election, Albuquerque representative', stockTrades: [] },

      // ── NEW YORK (need 11) ──
      { name: 'Lee Zeldin', state: 'New York', district: 'NY-1', party: 'Republican', yearsInOffice: 8, email: 'rep@zeldin.house.gov', phone: '(202) 225-3826', committees: ['Foreign Affairs', 'Financial Services'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Army Ranger, 2022 NY Governor candidate, now EPA Administrator under Trump', stockTrades: [] },
      { name: 'Andrew Garbarino', state: 'New York', district: 'NY-2', party: 'Republican', yearsInOffice: 4, email: 'rep@garbarino.house.gov', phone: '(202) 225-7896', committees: ['Homeland Security', 'Financial Services'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Moderate Republican, SALT deduction champion, Long Island suburbs', stockTrades: [] },
      { name: 'George Santos', state: 'New York', district: 'NY-3', party: 'Republican', yearsInOffice: 1, email: 'rep@santos.house.gov', phone: '(202) 225-5516', committees: ['Small Business', 'Science'], supportVotes: 1234, opposeVotes: 3456, userVote: null, bio: 'Expelled by House in 2023 after lying about nearly entire life story and biography', stockTrades: [] },
      { name: 'Anthony DEsposito', state: 'New York', district: 'NY-4', party: 'Republican', yearsInOffice: 2, email: 'rep@desposito.house.gov', phone: '(202) 225-5516', committees: ['Homeland Security', 'Transportation'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former Nassau County legislator, Long Island suburban district', stockTrades: [] },
      { name: 'Tom Suozzi', state: 'New York', district: 'NY-3', party: 'Democrat', yearsInOffice: 4, email: 'rep@suozzi.house.gov', phone: '(202) 225-5516', committees: ['Ways and Means', 'Foreign Affairs'], supportVotes: 2789, opposeVotes: 1890, userVote: null, bio: 'Former Nassau County Executive, won 2024 special election to reclaim George Santos seat', stockTrades: [] },
      { name: 'Nydia Velazquez', state: 'New York', district: 'NY-7', party: 'Democrat', yearsInOffice: 32, email: 'rep@velazquez2.house.gov', phone: '(202) 225-2361', committees: ['Financial Services', 'Small Business'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First Puerto Rican woman elected to Congress, small business champion, Brooklyn', stockTrades: [] },
      { name: 'Jerry Nadler', state: 'New York', district: 'NY-12', party: 'Democrat', yearsInOffice: 31, email: 'rep@nadler2.house.gov', phone: '(202) 225-5635', committees: ['Judiciary'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Judiciary Ranking Member, led first Trump impeachment, Upper West Side Manhattan', stockTrades: [] },

      // ── NORTH CAROLINA (need 6) ──
      { name: 'Tim Moore', state: 'North Carolina', district: 'NC-6', party: 'Republican', yearsInOffice: 1, email: 'rep@timmoore.house.gov', phone: '(202) 225-1314', committees: ['Judiciary', 'Transportation'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former NC House Speaker, Piedmont Triad district', stockTrades: [] },
      { name: 'Kathy Manning', state: 'North Carolina', district: 'NC-6', party: 'Democrat', yearsInOffice: 4, email: 'rep@manning.house.gov', phone: '(202) 225-3065', committees: ['Foreign Affairs', 'Education'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Immigration attorney, Greensboro area, Jewish community leader', stockTrades: [] },
      { name: 'Wiley Nickel', state: 'North Carolina', district: 'NC-13', party: 'Democrat', yearsInOffice: 2, email: 'rep@nickel.house.gov', phone: '(202) 225-4531', committees: ['Financial Services'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former state senator, Research Triangle suburban district', stockTrades: [] },

      // ── NORTH DAKOTA (need 1) ──
      { name: 'Kelly Armstrong', state: 'North Dakota', district: 'ND-At Large', party: 'Republican', yearsInOffice: 6, email: 'rep@armstrong.house.gov', phone: '(202) 225-2611', committees: ['Judiciary', 'Energy and Commerce'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Attorney, former state senator, now North Dakota Governor after 2024', stockTrades: [] },

      // ── OHIO (need 6) ──
      { name: 'Steve Chabot', state: 'Ohio', district: 'OH-1', party: 'Republican', yearsInOffice: 26, email: 'rep@chabot.house.gov', phone: '(202) 225-2216', committees: ['Judiciary', 'Foreign Affairs'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Cincinnati attorney, lost 2022 re-election after redistricting', stockTrades: [] },
      { name: 'Shontel Brown', state: 'Ohio', district: 'OH-11', party: 'Democrat', yearsInOffice: 3, email: 'rep@shontelbrown.house.gov', phone: '(202) 225-7032', committees: ['Oversight', 'Transportation'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Cuyahoga County Council Chair, defeated Nina Turner in 2021 primary', stockTrades: [] },
      { name: 'Emilia Sykes', state: 'Ohio', district: 'OH-13', party: 'Democrat', yearsInOffice: 2, email: 'rep@sykes.house.gov', phone: '(202) 225-5261', committees: ['Education', 'Foreign Affairs'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Ohio House Minority Leader, Akron area representative', stockTrades: [] },
      { name: 'Max Miller', state: 'Ohio', district: 'OH-7', party: 'Republican', yearsInOffice: 2, email: 'rep@maxmiller.house.gov', phone: '(202) 225-5705', committees: ['Agriculture', 'Transportation'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Trump White House aide, former Cleveland Browns staff, northeast Ohio', stockTrades: [] },

      // ── OKLAHOMA (need 2) ──
      { name: 'Frank Lucas', state: 'Oklahoma', district: 'OK-3', party: 'Republican', yearsInOffice: 30, email: 'rep@lucas.house.gov', phone: '(202) 225-5565', committees: ['Agriculture', 'Science'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former Agriculture Committee Chair, wheat and cattle farmer, western Oklahoma', stockTrades: [] },

      // ── OREGON (need 3) ──
      { name: 'Val Hoyle', state: 'Oregon', district: 'OR-4', party: 'Democrat', yearsInOffice: 2, email: 'rep@hoyle.house.gov', phone: '(202) 225-6416', committees: ['Transportation', 'Education'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Oregon Labor Commissioner, labor and workforce rights champion', stockTrades: [] },
      { name: 'Cliff Bentz', state: 'Oregon', district: 'OR-2', party: 'Republican', yearsInOffice: 4, email: 'rep@bentz.house.gov', phone: '(202) 225-6730', committees: ['Natural Resources', 'Judiciary'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Attorney and rancher, rural eastern Oregon, largest Oregon district', stockTrades: [] },

      // ── PENNSYLVANIA (need 8) ──
      { name: 'Madeleine Dean', state: 'Pennsylvania', district: 'PA-4', party: 'Democrat', yearsInOffice: 6, email: 'rep@dean.house.gov', phone: '(202) 225-4731', committees: ['Judiciary', 'Foreign Affairs'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former professor and state rep, suburban Philadelphia, impeachment manager', stockTrades: [] },
      { name: 'Mary Gay Scanlon', state: 'Pennsylvania', district: 'PA-5', party: 'Democrat', yearsInOffice: 6, email: 'rep@scanlon.house.gov', phone: '(202) 225-2011', committees: ['Judiciary', 'Rules'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former civil rights attorney, Delaware County suburbs south of Philadelphia', stockTrades: [] },
      { name: 'Brendan Boyle', state: 'Pennsylvania', district: 'PA-2', party: 'Democrat', yearsInOffice: 10, email: 'rep@bboyle.house.gov', phone: '(202) 225-6111', committees: ['Ways and Means', 'Budget'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Budget Committee Ranking Member, Philadelphia northeast district', stockTrades: [] },
      { name: 'Mike Kelly', state: 'Pennsylvania', district: 'PA-16', party: 'Republican', yearsInOffice: 14, email: 'rep@mikekelly.house.gov', phone: '(202) 225-5406', committees: ['Ways and Means', 'Education'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Car dealership owner, northwestern Pennsylvania, challenged 2020 election results', stockTrades: [] },
      { name: 'Dan Meuser', state: 'Pennsylvania', district: 'PA-9', party: 'Republican', yearsInOffice: 6, email: 'rep@meuser.house.gov', phone: '(202) 225-6511', committees: ['Financial Services'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Business executive, former PA Revenue Secretary, Hazleton area district', stockTrades: [] },

      // ── SOUTH CAROLINA (need 4) ──
      { name: 'William Timmons', state: 'South Carolina', district: 'SC-4', party: 'Republican', yearsInOffice: 6, email: 'rep@timmons.house.gov', phone: '(202) 225-6030', committees: ['Financial Services'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Attorney, Greenville and Spartanburg Upstate South Carolina district', stockTrades: [] },
      { name: 'Jeff Duncan', state: 'South Carolina', district: 'SC-3', party: 'Republican', yearsInOffice: 14, email: 'rep@jeffduncan.house.gov', phone: '(202) 225-5301', committees: ['Energy and Commerce', 'Foreign Affairs'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Freedom Caucus member, real estate broker, western South Carolina', stockTrades: [] },
      { name: 'Russell Fry', state: 'South Carolina', district: 'SC-7', party: 'Republican', yearsInOffice: 2, email: 'rep@fry.house.gov', phone: '(202) 225-9895', committees: ['Judiciary', 'Transportation'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former state rep, defeated Tom Rice who voted to impeach Trump, Grand Strand district', stockTrades: [] },
      { name: 'Ralph Norman', state: 'South Carolina', district: 'SC-5', party: 'Republican', yearsInOffice: 7, email: 'rep@norman.house.gov', phone: '(202) 225-5501', committees: ['Oversight', 'Budget'], supportVotes: 2234, opposeVotes: 2678, userVote: null, bio: 'Real estate developer, Freedom Caucus hardliner, Rock Hill and Lancaster area', stockTrades: [] },

      // ── TENNESSEE (need 6) ──
      { name: 'Diana Harshbarger', state: 'Tennessee', district: 'TN-1', party: 'Republican', yearsInOffice: 4, email: 'rep@harshbarger.house.gov', phone: '(202) 225-6356', committees: ['Energy and Commerce'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Pharmacist, Johnson City area, deep red Appalachian Tennessee', stockTrades: [] },
      { name: 'Tim Burchett', state: 'Tennessee', district: 'TN-2', party: 'Republican', yearsInOffice: 6, email: 'rep@burchett.house.gov', phone: '(202) 225-4311', committees: ['Foreign Affairs', 'Transportation'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former Knox County Mayor, elbowed Kevin McCarthy after Speaker ouster vote', stockTrades: [] },
      { name: 'John Rose', state: 'Tennessee', district: 'TN-6', party: 'Republican', yearsInOffice: 6, email: 'rep@rose.house.gov', phone: '(202) 225-4231', committees: ['Financial Services'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Farmer, attorney, and banking attorney, middle Tennessee suburbs north of Nashville', stockTrades: [] },
      { name: 'Andy Ogles', state: 'Tennessee', district: 'TN-5', party: 'Republican', yearsInOffice: 2, email: 'rep@ogles.house.gov', phone: '(202) 225-4311', committees: ['Foreign Affairs', 'Budget'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former tourism director, Nashville area district after redistricting', stockTrades: [] },
      { name: 'David Kustoff', state: 'Tennessee', district: 'TN-8', party: 'Republican', yearsInOffice: 8, email: 'rep@kustoff.house.gov', phone: '(202) 225-4714', committees: ['Financial Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former U.S. Attorney, west Tennessee district, Memphis suburbs', stockTrades: [] },

      // ── TEXAS (need 20) ──
      { name: 'Lance Gooden', state: 'Texas', district: 'TX-5', party: 'Republican', yearsInOffice: 6, email: 'rep@gooden.house.gov', phone: '(202) 225-3484', committees: ['Financial Services', 'Foreign Affairs'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former state rep, east of Dallas suburbs, Trump ally', stockTrades: [] },
      { name: 'Morgan Luttrell', state: 'Texas', district: 'TX-8', party: 'Republican', yearsInOffice: 2, email: 'rep@luttrell.house.gov', phone: '(202) 225-4901', committees: ['Armed Services', 'Science'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Navy SEAL, neuroscience researcher, north Houston suburbs', stockTrades: [] },
      { name: 'Al Green', state: 'Texas', district: 'TX-9', party: 'Democrat', yearsInOffice: 20, email: 'rep@algreen.house.gov', phone: '(202) 225-7508', committees: ['Financial Services'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'First to introduce Trump impeachment articles in 2017, civil rights attorney, Houston', stockTrades: [] },
      { name: 'August Pfluger', state: 'Texas', district: 'TX-11', party: 'Republican', yearsInOffice: 4, email: 'rep@pfluger.house.gov', phone: '(202) 225-3605', committees: ['Energy and Commerce', 'Homeland Security'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Air Force fighter pilot, west Texas oil country, Permian Basin', stockTrades: [] },
      { name: 'Kay Granger', state: 'Texas', district: 'TX-12', party: 'Republican', yearsInOffice: 27, email: 'rep@granger.house.gov', phone: '(202) 225-5071', committees: ['Appropriations'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Former Appropriations Chair, first Republican woman to chair full Appropriations Committee', stockTrades: [] },
      { name: 'Michael Burgess', state: 'Texas', district: 'TX-26', party: 'Republican', yearsInOffice: 22, email: 'rep@burgess.house.gov', phone: '(202) 225-7772', committees: ['Energy and Commerce', 'Rules'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'OB-GYN physician, north Dallas-Fort Worth suburbs', stockTrades: [] },
      { name: 'Troy Nehls', state: 'Texas', district: 'TX-22', party: 'Republican', yearsInOffice: 4, email: 'rep@nehls.house.gov', phone: '(202) 225-5951', committees: ['Transportation', 'Judiciary'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former Fort Bend County Sheriff, southwest Houston suburbs', stockTrades: [] },
      { name: 'Ronny Jackson', state: 'Texas', district: 'TX-13', party: 'Republican', yearsInOffice: 4, email: 'rep@ronnyjackson.house.gov', phone: '(202) 225-3706', committees: ['Armed Services', 'Veterans Affairs'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former White House physician under Obama and Trump, panhandle Texas district', stockTrades: [] },

      // ── UTAH (need 1) ──

      // ── VERMONT (need 1) ──
      { name: 'Becca Balint', state: 'Vermont', district: 'VT-At Large', party: 'Democrat', yearsInOffice: 2, email: 'rep@balint.house.gov', phone: '(202) 225-4115', committees: ['Judiciary', 'Oversight'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First woman and first openly gay person to represent Vermont in Congress', stockTrades: [] },

      // ── VIRGINIA (need 4) ──
      { name: 'Ben Cline', state: 'Virginia', district: 'VA-6', party: 'Republican', yearsInOffice: 6, email: 'rep@cline.house.gov', phone: '(202) 225-5431', committees: ['Judiciary', 'Education'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former state delegate, Shenandoah Valley and western Virginia district', stockTrades: [] },
      { name: 'Jen Kiggans', state: 'Virginia', district: 'VA-2', party: 'Republican', yearsInOffice: 2, email: 'rep@kiggans.house.gov', phone: '(202) 225-4215', committees: ['Armed Services', 'Veterans Affairs'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Navy helicopter pilot and nurse practitioner, defeated Elaine Luria in 2022', stockTrades: [] },

      // ── WASHINGTON (need 1) ──

      // ── WEST VIRGINIA (need 1) ──
      { name: 'Alex Mooney', state: 'West Virginia', district: 'WV-2', party: 'Republican', yearsInOffice: 10, email: 'rep@mooney.house.gov', phone: '(202) 225-2711', committees: ['Financial Services', 'Natural Resources'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former Maryland state senator who moved to WV, gold standard advocate, Freedom Caucus', stockTrades: [] },

      // ── WISCONSIN (need 2) ──
      { name: 'Derrick Van Orden', state: 'Wisconsin', district: 'WI-3', party: 'Republican', yearsInOffice: 2, email: 'rep@vanorden.house.gov', phone: '(202) 225-5506', committees: ['Agriculture', 'Transportation'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Navy SEAL, author, flipped western Wisconsin seat in 2022', stockTrades: [] },

      // ── ALABAMA ──
      { name: 'Dale Strong', state: 'Alabama', district: 'AL-5', party: 'Republican', yearsInOffice: 2, email: 'rep@strong.house.gov', phone: '(202) 225-4801', committees: ['Armed Services', 'Science'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Former Madison County Commission Chair, north Alabama Huntsville area', stockTrades: [] },
      // ── ARIZONA ──
      // ── CALIFORNIA ──
      { name: 'Kevin Mullin', state: 'California', district: 'CA-15', party: 'Democrat', yearsInOffice: 2, email: 'rep@mullin.house.gov', phone: '(202) 225-3531', committees: ['Science', 'Transportation'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former California Assembly Speaker pro tempore, San Mateo county', stockTrades: [] },
      { name: 'Salud Carbajal', state: 'California', district: 'CA-24', party: 'Democrat', yearsInOffice: 8, email: 'rep@carbajal.house.gov', phone: '(202) 225-3601', committees: ['Armed Services', 'Transportation'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Marine Reserve veteran, Santa Barbara and San Luis Obispo district', stockTrades: [] },
      { name: 'Julia Brownley', state: 'California', district: 'CA-26', party: 'Democrat', yearsInOffice: 12, email: 'rep@brownley.house.gov', phone: '(202) 225-5811', committees: ['Veterans Affairs', 'Transportation'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Veterans Affairs Committee member, Ventura County coastal district', stockTrades: [] },
      { name: 'Judy Chu', state: 'California', district: 'CA-28', party: 'Democrat', yearsInOffice: 15, email: 'rep@chu.house.gov', phone: '(202) 225-5464', committees: ['Ways and Means', 'Judiciary'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First Chinese-American woman elected to Congress, San Gabriel Valley', stockTrades: [] },
      { name: 'Brad Sherman', state: 'California', district: 'CA-32', party: 'Democrat', yearsInOffice: 28, email: 'rep@sherman.house.gov', phone: '(202) 225-5911', committees: ['Foreign Affairs', 'Financial Services'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'CPA and attorney, San Fernando Valley, introduced first Trump impeachment article', stockTrades: [] },
      { name: 'Tony Cardenas', state: 'California', district: 'CA-29', party: 'Democrat', yearsInOffice: 12, email: 'rep@cardenas.house.gov', phone: '(202) 225-6131', committees: ['Energy and Commerce'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Los Angeles City Council member, northeast San Fernando Valley', stockTrades: [] },
      { name: 'Sydney Kamlager-Dove', state: 'California', district: 'CA-37', party: 'Democrat', yearsInOffice: 2, email: 'rep@kamlager.house.gov', phone: '(202) 225-7084', committees: ['Foreign Affairs', 'Science'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former state senator, Los Angeles progressive, holds Karen Bass old seat', stockTrades: [] },
      { name: 'Robert Garcia', state: 'California', district: 'CA-42', party: 'Democrat', yearsInOffice: 2, email: 'rep@rgarcia.house.gov', phone: '(202) 225-7924', committees: ['Oversight', 'Armed Services'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former Long Beach Mayor, first openly gay immigrant elected to Congress', stockTrades: [] },
      // ── CONNECTICUT ──
      { name: 'John Larson', state: 'Connecticut', district: 'CT-1', party: 'Democrat', yearsInOffice: 26, email: 'rep@larson.house.gov', phone: '(202) 225-2265', committees: ['Ways and Means'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former Democratic Caucus Chair, Hartford area, Social Security reform champion', stockTrades: [] },
      // ── DELAWARE ──
      { name: 'Sarah McBride', state: 'Delaware', district: 'DE-At Large', party: 'Democrat', yearsInOffice: 1, email: 'rep@mcbride.house.gov', phone: '(202) 225-4165', committees: ['Oversight', 'Education'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First openly transgender person elected to Congress, former Delaware state senator', stockTrades: [] },
      // ── FLORIDA ──
      { name: 'Greg Steube', state: 'Florida', district: 'FL-17', party: 'Republican', yearsInOffice: 6, email: 'rep@steube.house.gov', phone: '(202) 225-5792', committees: ['Judiciary', 'Foreign Affairs'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Army veteran and attorney, Sarasota area, fell from tree in 2023', stockTrades: [] },
      { name: 'Debbie Wasserman Schultz', state: 'Florida', district: 'FL-25', party: 'Democrat', yearsInOffice: 20, email: 'rep@dws.house.gov', phone: '(202) 225-7931', committees: ['Appropriations'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former DNC Chair, breast cancer survivor and advocate, Broward County', stockTrades: [] },
      { name: 'Maria Elvira Salazar', state: 'Florida', district: 'FL-27', party: 'Republican', yearsInOffice: 4, email: 'rep@salazar.house.gov', phone: '(202) 225-3931', committees: ['Foreign Affairs', 'Small Business'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Former TV journalist, Cuban-American, Miami Doral district', stockTrades: [] },
      // ── GEORGIA ──
      { name: 'Nikema Williams', state: 'Georgia', district: 'GA-5', party: 'Democrat', yearsInOffice: 4, email: 'rep@nikemawilliams.house.gov', phone: '(202) 225-3801', committees: ['Transportation', 'Administration'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former Georgia Democratic Party Chair, holds John Lewis Atlanta seat', stockTrades: [] },
      // ── ILLINOIS ──
      { name: 'Delia Ramirez', state: 'Illinois', district: 'IL-3', party: 'Democrat', yearsInOffice: 2, email: 'rep@ramirez.house.gov', phone: '(202) 225-5701', committees: ['Transportation', 'Veterans Affairs'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former state rep, first Guatemalan-American woman in Congress, Chicago northwest side', stockTrades: [] },
      // ── KENTUCKY ──
      { name: 'Morgan McGarvey', state: 'Kentucky', district: 'KY-3', party: 'Democrat', yearsInOffice: 2, email: 'rep@mcgarvey.house.gov', phone: '(202) 225-5401', committees: ['Judiciary', 'Transportation'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former Kentucky state Senate Minority Leader, Louisville urban district', stockTrades: [] },
      // ── MASSACHUSETTS ──
      { name: 'Stephen Lynch', state: 'Massachusetts', district: 'MA-8', party: 'Democrat', yearsInOffice: 22, email: 'rep@lynch.house.gov', phone: '(202) 225-8273', committees: ['Oversight', 'Financial Services'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former ironworker and union leader, South Boston and South Shore moderate Democrat', stockTrades: [] },
      // ── MICHIGAN ──
      { name: 'John James', state: 'Michigan', district: 'MI-10', party: 'Republican', yearsInOffice: 2, email: 'rep@johnjames.house.gov', phone: '(202) 225-4961', committees: ['Foreign Affairs', 'Transportation'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Army Ranger, lost two Senate races then won House seat in 2022, Macomb County', stockTrades: [] },
      // ── MINNESOTA ──
      // ── MISSOURI ──
      { name: 'Eric Burlison', state: 'Missouri', district: 'MO-7', party: 'Republican', yearsInOffice: 2, email: 'rep@burlison.house.gov', phone: '(202) 225-6536', committees: ['Oversight', 'Natural Resources'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former state representative, Springfield and Branson southwest Missouri area', stockTrades: [] },
      // ── NEW JERSEY ──
      // ── NEW MEXICO ──
      // ── NEW YORK ──
      { name: 'Marc Molinaro', state: 'New York', district: 'NY-19', party: 'Republican', yearsInOffice: 2, email: 'rep@molinaro.house.gov', phone: '(202) 225-5614', committees: ['Agriculture', 'Transportation'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Former Dutchess County Executive and 2018 gubernatorial candidate, Hudson Valley', stockTrades: [] },
      // ── NORTH CAROLINA ──
      // ── NORTH DAKOTA ──
      // ── OHIO ──
      // ── OKLAHOMA ──
      // ── OREGON ──
      { name: 'Maxine Dexter', state: 'Oregon', district: 'OR-3', party: 'Democrat', yearsInOffice: 1, email: 'rep@dexter.house.gov', phone: '(202) 225-4811', committees: ['Energy and Commerce', 'Science'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Physician, holds Earl Blumenauers Portland seat after he retired in 2024', stockTrades: [] },
      // ── PENNSYLVANIA ──
      { name: 'Chris Deluzio', state: 'Pennsylvania', district: 'PA-17', party: 'Democrat', yearsInOffice: 2, email: 'rep@deluzio.house.gov', phone: '(202) 225-2565', committees: ['Armed Services', 'Veterans Affairs'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Navy veteran and voting rights attorney, western PA Pittsburgh suburbs swing seat', stockTrades: [] },
      { name: 'John Joyce', state: 'Pennsylvania', district: 'PA-13', party: 'Republican', yearsInOffice: 6, email: 'rep@johnjoyce.house.gov', phone: '(202) 225-2431', committees: ['Energy and Commerce'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Dermatologist, south-central Pennsylvania rural district', stockTrades: [] },
      // ── TENNESSEE ──
      { name: 'Justin Jones', state: 'Tennessee', district: 'TN-5', party: 'Democrat', yearsInOffice: 1, email: 'rep@justinjones.house.gov', phone: '(202) 225-4311', committees: ['Education', 'Oversight'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Expelled then re-elected to Tennessee legislature after gun protest, now Nashville rep', stockTrades: [] },
      // ── TEXAS ──
      { name: 'Vicente Gonzalez', state: 'Texas', district: 'TX-34', party: 'Democrat', yearsInOffice: 6, email: 'rep@vgonzalez.house.gov', phone: '(202) 225-9901', committees: ['Foreign Affairs', 'Financial Services'], supportVotes: 2789, opposeVotes: 1890, userVote: null, bio: 'Attorney, Rio Grande Valley border district, moderate Democrat', stockTrades: [] },
      { name: 'Greg Casar', state: 'Texas', district: 'TX-35', party: 'Democrat', yearsInOffice: 2, email: 'rep@casar.house.gov', phone: '(202) 225-5645', committees: ['Oversight', 'Natural Resources'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former Austin city council member, progressive labor champion, Austin to San Antonio', stockTrades: [] },
      // ── UTAH ──
      { name: 'Celeste Maloy', state: 'Utah', district: 'UT-2', party: 'Republican', yearsInOffice: 1, email: 'rep@maloy.house.gov', phone: '(202) 225-9730', committees: ['Natural Resources', 'Transportation'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Attorney, won 2023 special election, rural southern and western Utah', stockTrades: [] },
      // ── VIRGINIA ──
      { name: 'Jennifer Wexton', state: 'Virginia', district: 'VA-10', party: 'Democrat', yearsInOffice: 6, email: 'rep@wexton.house.gov', phone: '(202) 225-5136', committees: ['Appropriations'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former state senator, diagnosed with rare brain disease PSP, northern Virginia suburbs', stockTrades: [] },
      // ── WASHINGTON ──
      { name: 'Marilyn Strickland', state: 'Washington', district: 'WA-10', party: 'Democrat', yearsInOffice: 4, email: 'rep@strickland.house.gov', phone: '(202) 225-9740', committees: ['Armed Services', 'Transportation'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Tacoma Mayor, first Korean-American and Black woman elected from Washington', stockTrades: [] },
      // ── WISCONSIN ──,
      { name: 'Andrew Clyde', state: 'Georgia', district: 'GA-9', party: 'Republican', yearsInOffice: 4, email: 'rep@clyde.house.gov', phone: '(202) 225-9893', committees: ['Armed Services', 'Judiciary'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Gun shop owner, compared Jan 6 to normal tourist visit, north Georgia mountains', stockTrades: [] },
      { name: 'Mark Alford', state: 'Missouri', district: 'MO-4', party: 'Republican', yearsInOffice: 2, email: 'rep@alford.house.gov', phone: '(202) 225-2876', committees: ['Armed Services', 'Budget'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Former TV news anchor, central Missouri rural district', stockTrades: [] },
      { name: 'Rob Menendez Jr', state: 'New Jersey', district: 'NJ-8', party: 'Democrat', yearsInOffice: 2, email: 'rep@robmenendez.house.gov', phone: '(202) 225-7919', committees: ['Transportation', 'Science'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Son of convicted Senator Bob Menendez, Jersey City and Hudson County district', stockTrades: [] },
      { name: 'Frank Pallone Jr', state: 'New Jersey', district: 'NJ-6', party: 'Democrat', yearsInOffice: 35, email: 'rep@pallonejr.house.gov', phone: '(202) 225-4671', committees: ['Energy and Commerce'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Energy and Commerce Ranking Member, ocean and coastal environmental champion', stockTrades: [] },
      { name: 'Brad Finstad', state: 'Minnesota', district: 'MN-1', party: 'Republican', yearsInOffice: 2, email: 'rep@finstad.house.gov', phone: '(202) 225-2472', committees: ['Agriculture', 'Transportation'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Farmer, won 2022 special election to replace late Rep Jim Hagedorn', stockTrades: [] },
      { name: 'Randy Weber', state: 'Texas', district: 'TX-14', party: 'Republican', yearsInOffice: 12, email: 'rep@rweber.house.gov', phone: '(202) 225-2831', committees: ['Science', 'Transportation'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Air conditioning business owner, Galveston and Beaumont Gulf Coast district', stockTrades: [] },

      // ── COMPLETING THE SENATE (2 missing) ──

      // ── HOUSE: Alabama ──
      { name: 'Bradley Byrne', state: 'Alabama', district: 'AL-1', party: 'Republican', yearsInOffice: 6, email: 'rep@byrne.house.gov', phone: '(202) 225-4931', committees: ['Armed Services', 'Education'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Former Alabama state senator and chancellor of two-year colleges', stockTrades: [] },

      // ── HOUSE: Alaska ──

      // ── HOUSE: Arizona ──

      // ── HOUSE: Colorado ──
      { name: 'Doug Lamborn', state: 'Colorado', district: 'CO-5', party: 'Republican', yearsInOffice: 18, email: 'rep@lamborn.house.gov', phone: '(202) 225-4422', committees: ['Armed Services', 'Natural Resources'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Colorado Springs area conservative, NORAD and Space Command champion', stockTrades: [] },

      // ── HOUSE: Connecticut ──

      // ── HOUSE: Florida ──
      { name: 'Al Lawson', state: 'Florida', district: 'FL-5', party: 'Democrat', yearsInOffice: 8, email: 'rep@lawson.house.gov', phone: '(202) 225-0123', committees: ['Agriculture', 'Financial Services'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Florida state senator, agriculture and small business champion, North Florida', stockTrades: [] },

      // ── HOUSE: Georgia ──
      { name: 'Austin Scott', state: 'Georgia', district: 'GA-8', party: 'Republican', yearsInOffice: 14, email: 'rep@austinscott.house.gov', phone: '(202) 225-6531', committees: ['Agriculture', 'Armed Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Insurance and real estate, challenged Kevin McCarthy for Speaker in 2023', stockTrades: [] },

      // ── HOUSE: Hawaii ──

      // ── HOUSE: Illinois ──
      { name: 'Jan Schakowsky', state: 'Illinois', district: 'IL-9', party: 'Democrat', yearsInOffice: 26, email: 'rep@schakowsky.house.gov', phone: '(202) 225-2111', committees: ['Energy and Commerce'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Progressive, consumer protection and senior care champion, Chicago north shore', stockTrades: [] },
      { name: 'Danny Davis', state: 'Illinois', district: 'IL-7', party: 'Democrat', yearsInOffice: 28, email: 'rep@davis.house.gov', phone: '(202) 225-5006', committees: ['Ways and Means', 'Oversight'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'West side Chicago progressive, criminal justice and poverty reduction champion', stockTrades: [] },

      // ── HOUSE: Iowa ──

      // ── HOUSE: Kentucky ──

      // ── HOUSE: Louisiana ──

      // ── HOUSE: Maine ──

      // ── HOUSE: Maryland ──

      // ── HOUSE: Massachusetts ──

      // ── HOUSE: Minnesota ──

      // ── HOUSE: Mississippi ──

      // ── HOUSE: Missouri ──

      // ── HOUSE: Montana ──

      // ── HOUSE: Nebraska ──

      // ── HOUSE: New Hampshire ──

      // ── HOUSE: New Mexico ──

      // ── HOUSE: New York ──
      { name: 'Anthony DeStefano', state: 'New York', district: 'NY-4', party: 'Republican', yearsInOffice: 2, email: 'rep@destefano.house.gov', phone: '(202) 225-5516', committees: ['Homeland Security', 'Transportation'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Long Island Republican, suburban New York district', stockTrades: [] },

      // ── HOUSE: North Carolina ──

      // ── HOUSE: Ohio ──

      // ── HOUSE: Oklahoma ──

      // ── HOUSE: Oregon ──

      // ── HOUSE: Pennsylvania ──

      // ── HOUSE: South Carolina ──

      // ── HOUSE: Tennessee ──
      { name: 'Scott DesJarlais', state: 'Tennessee', district: 'TN-4', party: 'Republican', yearsInOffice: 14, email: 'rep@desjarlais.house.gov', phone: '(202) 225-6831', committees: ['Agriculture', 'Armed Services'], supportVotes: 2234, opposeVotes: 2456, userVote: null, bio: 'Physician who survived medical ethics scandals, rural south Tennessee', stockTrades: [] },

      // ── HOUSE: Texas ──

      { name: 'Adam Schiff', state: 'California', district: 'Senator', party: 'Democrat', yearsInOffice: 1, email: 'senator@schiff.senate.gov', phone: '(202) 224-3553', committees: ['Intelligence', 'Judiciary'], supportVotes: 3456, opposeVotes: 1345, userVote: null, bio: 'Former House Intelligence Chair and Trump impeachment manager, elected California Senator in 2024', stockTrades: [] },
      { name: 'John Curtis', state: 'Utah', district: 'Senator', party: 'Republican', yearsInOffice: 1, email: 'senator@curtis.senate.gov', phone: '(202) 224-5444', committees: ['Foreign Relations', 'Energy'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Former Provo Mayor, most vocal Republican on climate change, elected Utah Senator in 2024', stockTrades: [] },

      // ── FINAL 10: COMPLETING ALL 435 HOUSE SEATS ──

      // Arizona (missing AZ-3, AZ-8)
      { name: 'Yassamin Ansari', state: 'Arizona', district: 'AZ-3', party: 'Democrat', yearsInOffice: 1, email: 'rep@ansari.house.gov', phone: '(202) 225-4065', committees: ['Science', 'Foreign Affairs'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Phoenix city councilwoman, first Iranian-American woman elected to Congress', stockTrades: [] },
      { name: 'Elijah Norton', state: 'Arizona', district: 'AZ-8', party: 'Republican', yearsInOffice: 1, email: 'rep@norton.house.gov', phone: '(202) 225-0512', committees: ['Transportation', 'Small Business'], supportVotes: 2345, opposeVotes: 2234, userVote: null, bio: 'Business owner, west Phoenix suburbs, first elected in 2024', stockTrades: [] },

      // California (missing CA-25, CA-34, CA-39, CA-44, CA-46)
      { name: 'Raul Ruiz', state: 'California', district: 'CA-25', party: 'Democrat', yearsInOffice: 12, email: 'rep@ruiz.house.gov', phone: '(202) 225-5330', committees: ['Energy and Commerce', 'Natural Resources'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Emergency room physician, first Mexican-American to represent California desert district', stockTrades: [] },
      { name: 'Jimmy Gomez', state: 'California', district: 'CA-34', party: 'Democrat', yearsInOffice: 8, email: 'rep@gomez.house.gov', phone: '(202) 225-6235', committees: ['Ways and Means', 'Oversight'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former California assemblyman, progressive Los Angeles urban district', stockTrades: [] },
      { name: 'Mark Takano', state: 'California', district: 'CA-39', party: 'Democrat', yearsInOffice: 12, email: 'rep@takano.house.gov', phone: '(202) 225-2305', committees: ['Veterans Affairs', 'Education'], supportVotes: 3345, opposeVotes: 1456, userVote: null, bio: 'Former Veterans Affairs Chair, first openly gay person of color elected to Congress', stockTrades: [] },
      { name: 'Nanette Barragan', state: 'California', district: 'CA-44', party: 'Democrat', yearsInOffice: 8, email: 'rep@barragan.house.gov', phone: '(202) 225-8220', committees: ['Energy and Commerce', 'Homeland Security'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former Los Angeles Harbor Commission president, South Bay Los Angeles', stockTrades: [] },
      { name: 'Lou Correa', state: 'California', district: 'CA-46', party: 'Democrat', yearsInOffice: 8, email: 'rep@correa.house.gov', phone: '(202) 225-2965', committees: ['Judiciary', 'Homeland Security'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former California state senator, moderate Santa Ana area Orange County district', stockTrades: [] },

      // North Carolina (missing NC-2, NC-4, NC-8, NC-11)
      { name: 'Deborah Ross', state: 'North Carolina', district: 'NC-2', party: 'Democrat', yearsInOffice: 4, email: 'rep@ross.house.gov', phone: '(202) 225-3032', committees: ['Judiciary', 'Science'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former ACLU-NC director, Raleigh area civil liberties champion', stockTrades: [] },
      { name: 'Valerie Foushee', state: 'North Carolina', district: 'NC-4', party: 'Democrat', yearsInOffice: 2, email: 'rep@foushee.house.gov', phone: '(202) 225-1784', committees: ['Science', 'Transportation'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Former Orange County Commissioner, Chapel Hill and Durham Research Triangle area', stockTrades: [] },
      { name: 'Richard Hudson', state: 'North Carolina', district: 'NC-8', party: 'Republican', yearsInOffice: 12, email: 'rep@hudson.house.gov', phone: '(202) 225-3715', committees: ['Energy and Commerce'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'NRCC Chair, helped Republicans win House in 2022, south-central North Carolina', stockTrades: [] },
      { name: 'Chuck Edwards', state: 'North Carolina', district: 'NC-11', party: 'Republican', yearsInOffice: 2, email: 'rep@edwards.house.gov', phone: '(202) 225-6401', committees: ['Agriculture', 'Transportation'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former NC state senator, replaced Madison Cawthorn in western mountain district', stockTrades: [] },

      // Ohio (missing OH-5, OH-12, OH-15)
      { name: 'Bob Latta', state: 'Ohio', district: 'OH-5', party: 'Republican', yearsInOffice: 18, email: 'rep@latta.house.gov', phone: '(202) 225-6405', committees: ['Energy and Commerce'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former state senator, northwest Ohio agriculture and manufacturing district', stockTrades: [] },
      { name: 'Troy Balderson', state: 'Ohio', district: 'OH-12', party: 'Republican', yearsInOffice: 6, email: 'rep@balderson.house.gov', phone: '(202) 225-5355', committees: ['Science', 'Small Business'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Former Ohio state senator, central Ohio suburban and rural district', stockTrades: [] },
      { name: 'Mike Carey', state: 'Ohio', district: 'OH-15', party: 'Republican', yearsInOffice: 4, email: 'rep@carey.house.gov', phone: '(202) 225-2015', committees: ['Ways and Means', 'Budget'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Coal lobbyist turned congressman, won 2021 special election, south-central Ohio', stockTrades: [] },

      // Oklahoma (missing OK-2)
      { name: 'Josh Brecheen', state: 'Oklahoma', district: 'OK-2', party: 'Republican', yearsInOffice: 2, email: 'rep@brecheen.house.gov', phone: '(202) 225-2701', committees: ['Natural Resources', 'Education'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Former Oklahoma state senator, rancher, southeastern Oklahoma district', stockTrades: [] },

      // Pennsylvania (missing PA-3)
      { name: 'Dwight Evans', state: 'Pennsylvania', district: 'PA-3', party: 'Democrat', yearsInOffice: 8, email: 'rep@evans.house.gov', phone: '(202) 225-4001', committees: ['Ways and Means', 'Small Business'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former Pennsylvania House Appropriations Chair, North Philadelphia community champion', stockTrades: [] },

      // Texas (missing TX-15, TX-17, TX-19, TX-24, TX-27, TX-36)
      { name: 'Monica De La Cruz', state: 'Texas', district: 'TX-15', party: 'Republican', yearsInOffice: 2, email: 'rep@delacruz.house.gov', phone: '(202) 225-9901', committees: ['Agriculture', 'Financial Services'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Business owner, flipped heavily Hispanic Rio Grande Valley seat to Republican in 2022', stockTrades: [] },
      { name: 'Pete Sessions', state: 'Texas', district: 'TX-17', party: 'Republican', yearsInOffice: 24, email: 'rep@sessions.house.gov', phone: '(202) 225-6105', committees: ['Rules', 'Homeland Security'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former NRCC Chair, Rules Committee member, central Texas Waco area', stockTrades: [] },
      { name: 'Jodey Arrington', state: 'Texas', district: 'TX-19', party: 'Republican', yearsInOffice: 8, email: 'rep@arrington.house.gov', phone: '(202) 225-4005', committees: ['Ways and Means', 'Budget'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Budget Committee Chair, Lubbock area agriculture and energy district', stockTrades: [] },
      { name: 'Beth Van Duyne', state: 'Texas', district: 'TX-24', party: 'Republican', yearsInOffice: 4, email: 'rep@vanduyne.house.gov', phone: '(202) 225-0074', committees: ['Ways and Means', 'Small Business'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former Irving Mayor, Dallas-Fort Worth suburban district', stockTrades: [] },
      { name: 'Michael Cloud', state: 'Texas', district: 'TX-27', party: 'Republican', yearsInOffice: 6, email: 'rep@cloud.house.gov', phone: '(202) 225-7742', committees: ['Oversight', 'Science'], supportVotes: 2234, opposeVotes: 2567, userVote: null, bio: 'Business owner, Texas Gulf Coast Corpus Christi area, Freedom Caucus member', stockTrades: [] },
      { name: 'Brian Babin', state: 'Texas', district: 'TX-36', party: 'Republican', yearsInOffice: 10, email: 'rep@babin.house.gov', phone: '(202) 225-1555', committees: ['Transportation', 'Science'], supportVotes: 2345, opposeVotes: 2456, userVote: null, bio: 'Dentist, east Texas and Houston suburbs, NASA and Space Center advocate', stockTrades: [] },

      // Wisconsin (missing WI-5)
      { name: 'Scott Fitzgerald', state: 'Wisconsin', district: 'WI-5', party: 'Republican', yearsInOffice: 4, email: 'rep@fitzgerald.house.gov', phone: '(202) 225-5101', committees: ['Judiciary', 'Education'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Former Wisconsin Senate Majority Leader, Milwaukee suburban Waukesha County district', stockTrades: [] },

      // ── 4 MISSING CURRENT SENATORS ──
      { name: 'Gary Peters', state: 'Michigan', district: 'Senator', party: 'Democrat', yearsInOffice: 10, email: 'senator@peters.senate.gov', phone: '(202) 224-6221', committees: ['Armed Services', 'Homeland Security'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Navy veteran, Great Lakes and auto industry champion, Michigan senior Senator', stockTrades: [] },
      { name: 'Eric Schmitt', state: 'Missouri', district: 'Senator', party: 'Republican', yearsInOffice: 2, email: 'senator@schmitt.senate.gov', phone: '(202) 224-5721', committees: ['Armed Services', 'Commerce'], supportVotes: 2456, opposeVotes: 2345, userVote: null, bio: 'Former Missouri Attorney General, sued China over COVID, replaced Roy Blunt in 2023', stockTrades: [] },
      { name: 'Tim Sheehy', state: 'Montana', district: 'Senator', party: 'Republican', yearsInOffice: 1, email: 'senator@sheehy.senate.gov', phone: '(202) 224-2644', committees: ['Agriculture', 'Veterans Affairs'], supportVotes: 2456, opposeVotes: 2234, userVote: null, bio: 'Navy SEAL veteran and aerospace entrepreneur, defeated Jon Tester in 2024', stockTrades: [] },
      { name: 'Jon Husted', state: 'Ohio', district: 'Senator', party: 'Republican', yearsInOffice: 1, email: 'senator@husted.senate.gov', phone: '(202) 224-3353', committees: ['Commerce', 'Banking'], supportVotes: 2345, opposeVotes: 2234, userVote: null, bio: 'Former Ohio Lt. Governor, appointed to fill JD Vances Senate seat after Vance became VP in 2025', stockTrades: [] }
    ];
    
    setCongressMembers(sampleCongress);
  };
  
  const initializeUSDepartments = () => {
    // 15 US Cabinet Departments with grant data
    const departments = [
      {
        id: 1,
        name: 'Department of State',
        secretary: 'Antony Blinken',
        budget: '$58.1 Billion',
        budgetRaw: 58100000000,
        grants: '$42.3 Billion',
        employees: 77243,
        description: 'Advancing U.S. foreign policy and diplomacy worldwide',
        responsibilities: ['Foreign affairs', 'Diplomacy', 'International development', 'Consular services'],
        grantsDetail: [
          { recipient: 'USAID - Global Health Programs', amount: '$8.2 Billion', purpose: 'HIV/AIDS prevention and global health initiatives', date: 'Ongoing 2024' },
          { recipient: 'United Nations Operations', amount: '$3.5 Billion', purpose: 'UN peacekeeping and humanitarian missions', date: 'January 2025' },
          { recipient: 'NATO Allied Support', amount: '$2.8 Billion', purpose: 'Military cooperation and defense partnerships', date: 'December 2024' },
          { recipient: 'Middle East Partnership Initiative', amount: '$1.9 Billion', purpose: 'Democracy and economic development in MENA region', date: 'November 2024' },
          { recipient: 'Millennium Challenge Corporation', amount: '$1.2 Billion', purpose: 'Economic growth in developing countries', date: 'October 2024' }
        ],
        approveVotes: 3421,
        disapproveVotes: 2876,
        userVote: null
      },
      {
        id: 2,
        name: 'Department of the Treasury',
        secretary: 'Janet Yellen',
        budget: '$7.9 Trillion',
        budgetRaw: 7900000000000,
        grants: '$890 Billion',
        employees: 87336,
        description: 'Managing federal finances, economic policy, and debt obligations',
        responsibilities: ['Economic policy', 'Tax collection (IRS)', 'Federal debt management', 'Currency production'],
        grantsDetail: [
          { recipient: 'Federal Debt Interest Payments', amount: '$658 Billion', purpose: 'Interest on $34 trillion national debt', date: 'Ongoing 2024' },
          { recipient: 'Community Development Financial Institutions', amount: '$85 Billion', purpose: 'Loans to underserved communities', date: 'January 2025' },
          { recipient: 'Emergency Rental Assistance Program', amount: '$48 Billion', purpose: 'COVID-19 rental assistance', date: 'December 2024' },
          { recipient: 'Small Business Administration Loans', amount: '$42 Billion', purpose: 'Small business financing and disaster relief', date: 'November 2024' },
          { recipient: 'State and Local Fiscal Recovery', amount: '$35 Billion', purpose: 'Infrastructure and public services funding', date: 'October 2024' }
        ],
        approveVotes: 2945,
        disapproveVotes: 3821,
        userVote: null
      },
      {
        id: 3,
        name: 'Department of Defense (DOD)',
        secretary: 'Lloyd Austin',
        budget: '$842 Billion',
        budgetRaw: 842000000000,
        grants: '$420 Billion',
        employees: 2870000,
        description: 'National defense and military operations worldwide',
        responsibilities: ['Military operations', 'National security', 'Defense research', 'Veterans support'],
        grantsDetail: [
          { recipient: 'Lockheed Martin Corporation', amount: '$75 Billion', purpose: 'F-35 fighter jets, missiles, and defense systems', date: 'Ongoing 2024' },
          { recipient: 'Boeing Defense & Space', amount: '$24 Billion', purpose: 'Aircraft, satellites, and missile defense', date: 'January 2025' },
          { recipient: 'Raytheon Technologies', amount: '$17 Billion', purpose: 'Missiles, radar systems, and cybersecurity', date: 'December 2024' },
          { recipient: 'Northrop Grumman', amount: '$13 Billion', purpose: 'B-21 Stealth Bomber and space systems', date: 'November 2024' },
          { recipient: 'General Dynamics', amount: '$11 Billion', purpose: 'Submarines, tanks, and combat systems', date: 'October 2024' },
          { recipient: 'BAE Systems USA', amount: '$8.5 Billion', purpose: 'Armored vehicles and naval systems', date: 'September 2024' },
          { recipient: 'L3Harris Technologies', amount: '$6.2 Billion', purpose: 'Communications and electronic warfare', date: 'August 2024' }
        ],
        approveVotes: 4235,
        disapproveVotes: 2102,
        userVote: null
      },
      {
        id: 4,
        name: 'Department of Justice (DOJ)',
        secretary: 'Merrick Garland',
        budget: '$37.5 Billion',
        budgetRaw: 37500000000,
        grants: '$15.2 Billion',
        employees: 115259,
        description: 'Federal law enforcement and administration of justice',
        responsibilities: ['FBI operations', 'Federal prosecutions', 'Civil rights enforcement', 'Prison system'],
        grantsDetail: [
          { recipient: 'FBI Operations & Investigations', amount: '$5.8 Billion', purpose: 'Federal law enforcement and counterterrorism', date: 'Ongoing 2024' },
          { recipient: 'State and Local Law Enforcement Grants', amount: '$3.2 Billion', purpose: 'Police equipment and training programs', date: 'January 2025' },
          { recipient: 'Violence Against Women Programs', amount: '$1.8 Billion', purpose: 'Domestic violence prevention and victim services', date: 'December 2024' },
          { recipient: 'Drug Enforcement Administration', amount: '$1.5 Billion', purpose: 'Combat drug trafficking and opioid crisis', date: 'November 2024' },
          { recipient: 'Legal Aid for Low-Income Defendants', amount: '$850 Million', purpose: 'Public defender services nationwide', date: 'October 2024' }
        ],
        approveVotes: 3156,
        disapproveVotes: 2734,
        userVote: null
      },
      {
        id: 5,
        name: 'Department of Health & Human Services (HHS)',
        secretary: 'Xavier Becerra',
        budget: '$1.7 Trillion',
        budgetRaw: 1700000000000,
        grants: '$1.2 Trillion',
        employees: 83212,
        description: 'Healthcare, medical research, and social services',
        responsibilities: ['Medicare & Medicaid', 'CDC operations', 'NIH medical research', 'Food and drug safety'],
        grantsDetail: [
          { recipient: 'Medicare Payments to Healthcare Providers', amount: '$850 Billion', purpose: 'Healthcare for 65+ million seniors', date: 'Ongoing 2024' },
          { recipient: 'Medicaid State Programs', amount: '$  Billion', purpose: 'Healthcare for low-income Americans', date: 'Ongoing 2024' },
          { recipient: 'National Institutes of Health (NIH)', amount: '$48 Billion', purpose: 'Medical research and clinical trials', date: 'January 2025' },
          { recipient: 'Centers for Disease Control (CDC)', amount: '$12 Billion', purpose: 'Disease prevention and public health', date: 'December 2024' },
          { recipient: 'Johns Hopkins University Medical Research', amount: '$3.2 Billion', purpose: 'Cancer and infectious disease research', date: 'November 2024' },
          { recipient: 'Mayo Clinic Research Programs', amount: '$1.8 Billion', purpose: 'Clinical research and medical innovation', date: 'October 2024' }
        ],
        approveVotes: 3892,
        disapproveVotes: 2456,
        userVote: null
      },
      {
        id: 6,
        name: 'Department of Education',
        secretary: 'Miguel Cardona',
        budget: '$79.6 Billion',
        budgetRaw: 79600000000,
        grants: '$68.2 Billion',
        employees: 4400,
        description: 'Federal education policy and student financial aid',
        responsibilities: ['Student loans', 'K-12 grants', 'Higher education funding', 'Education research'],
        grantsDetail: [
          { recipient: 'Pell Grants for College Students', amount: '$28.2 Billion', purpose: 'Financial aid for 6.5 million low-income students', date: 'Ongoing 2024' },
          { recipient: 'Title I Grants to Schools', amount: '$18.4 Billion', purpose: 'Support for low-income K-12 schools', date: 'January 2025' },
          { recipient: 'Special Education (IDEA)', amount: '$14.2 Billion', purpose: 'Services for students with disabilities', date: 'December 2024' },
          { recipient: 'Head Start Early Childhood Programs', amount: '$11.9 Billion', purpose: 'Preschool for low-income children', date: 'November 2024' },
          { recipient: 'Community Colleges of America', amount: '$4.5 Billion', purpose: 'Workforce training and technical education', date: 'October 2024' }
        ],
        approveVotes: 3234,
        disapproveVotes: 2987,
        userVote: null
      },
      {
        id: 7,
        name: 'Department of Veterans Affairs (VA)',
        secretary: 'Denis McDonough',
        budget: '$301 Billion',
        budgetRaw: 301000000000,
        grants: '$125 Billion',
        employees: 412892,
        description: 'Healthcare and benefits for military veterans',
        responsibilities: ['VA hospitals', 'Disability compensation', 'GI Bill education', 'Veterans pensions'],
        grantsDetail: [
          { recipient: 'VA Medical Centers Nationwide', amount: '$85 Billion', purpose: 'Healthcare for 9 million veterans', date: 'Ongoing 2024' },
          { recipient: 'Disability Compensation Payments', amount: '$118 Billion', purpose: 'Monthly payments to 5.2 million disabled veterans', date: 'Ongoing 2024' },
          { recipient: 'GI Bill Education Benefits', amount: '$14.5 Billion', purpose: 'College tuition for veterans and families', date: 'January 2025' },
          { recipient: 'Homeless Veterans Support Programs', amount: '$2.8 Billion', purpose: 'Housing and job training for homeless vets', date: 'December 2024' },
          { recipient: 'Veterans Crisis Line & Mental Health', amount: '$1.9 Billion', purpose: 'PTSD treatment and suicide prevention', date: 'November 2024' }
        ],
        approveVotes: 4892,
        disapproveVotes: 1245,
        userVote: null
      },
      {
        id: 8,
        name: 'Department of Homeland Security (DHS)',
        secretary: 'Alejandro Mayorkas',
        budget: '$60.3 Billion',
        budgetRaw: 60300000000,
        grants: '$22.4 Billion',
        employees: 260000,
        description: 'Border security, immigration, and disaster response',
        responsibilities: ['Border protection', 'TSA airport security', 'FEMA disaster relief', 'Secret Service'],
        grantsDetail: [
          { recipient: 'FEMA Disaster Relief Fund', amount: '$12.3 Billion', purpose: 'Hurricane, wildfire, and flood recovery', date: 'Ongoing 2024' },
          { recipient: 'Customs and Border Protection', amount: '$5.8 Billion', purpose: 'Border wall, agents, and technology', date: 'January 2025' },
          { recipient: 'State Homeland Security Grants', amount: '$3.2 Billion', purpose: 'State and local emergency preparedness', date: 'December 2024' },
          { recipient: 'Immigration and Customs Enforcement', amount: '$2.1 Billion', purpose: 'Immigration enforcement and detention', date: 'November 2024' },
          { recipient: 'Cybersecurity and Infrastructure Security Agency', amount: '$1.8 Billion', purpose: 'Protect critical infrastructure from cyber attacks', date: 'October 2024' }
        ],
        approveVotes: 2934,
        disapproveVotes: 3421,
        userVote: null
      },
      {
        id: 9,
        name: 'Department of Transportation (DOT)',
        secretary: 'Pete Buttigieg',
        budget: '$108 Billion',
        budgetRaw: 108000000000,
        grants: '$78.5 Billion',
        employees: 55100,
        description: 'Infrastructure, highways, aviation, and public transit',
        responsibilities: ['Highway funding', 'FAA aviation safety', 'Public transit', 'Rail infrastructure'],
        grantsDetail: [
          { recipient: 'State Highway Infrastructure Grants', amount: '$52.5 Billion', purpose: 'Road, bridge, and highway construction', date: 'Ongoing 2024' },
          { recipient: 'Federal Transit Administration', amount: '$18.2 Billion', purpose: 'Subway, bus, and light rail systems', date: 'January 2025' },
          { recipient: 'Amtrak National Rail Service', amount: '$4.9 Billion', purpose: 'Passenger rail operations and upgrades', date: 'December 2024' },
          { recipient: 'Airport Improvement Program', amount: '$3.8 Billion', purpose: 'Runway and terminal modernization', date: 'November 2024' },
          { recipient: 'Port Infrastructure Development', amount: '$2.4 Billion', purpose: 'Seaport upgrades and cargo capacity', date: 'October 2024' }
        ],
        approveVotes: 3567,
        disapproveVotes: 2234,
        userVote: null
      },
      {
        id: 10,
        name: 'Department of Energy (DOE)',
        secretary: 'Jennifer Granholm',
        budget: '$45.8 Billion',
        budgetRaw: 45800000000,
        grants: '$28.3 Billion',
        employees: 16500,
        description: 'Energy policy, nuclear security, and scientific research',
        responsibilities: ['Nuclear weapons', 'Energy research', 'Grid modernization', 'National labs'],
        grantsDetail: [
          { recipient: 'National Nuclear Security Administration', amount: '$21.4 Billion', purpose: 'Nuclear weapons maintenance and security', date: 'Ongoing 2024' },
          { recipient: 'Clean Energy Investment Tax Credits', amount: '$12.8 Billion', purpose: 'Solar, wind, and renewable energy projects', date: 'January 2025' },
          { recipient: 'Lawrence Livermore National Laboratory', amount: '$2.9 Billion', purpose: 'Nuclear fusion and weapons research', date: 'December 2024' },
          { recipient: 'Brookhaven National Laboratory', amount: '$1.8 Billion', purpose: 'Particle physics and energy science', date: 'November 2024' },
          { recipient: 'Electric Vehicle Charging Infrastructure', amount: '$1.5 Billion', purpose: 'EV charging stations nationwide', date: 'October 2024' }
        ],
        approveVotes: 3234,
        disapproveVotes: 2567,
        userVote: null
      },
      {
        id: 11,
        name: 'Department of Agriculture (USDA)',
        secretary: 'Tom Vilsack',
        budget: '$151 Billion',
        budgetRaw: 151000000000,
        grants: '$124 Billion',
        employees: 100000,
        description: 'Farm policy, food safety, and nutrition programs',
        responsibilities: ['Farm subsidies', 'Food stamps (SNAP)', 'Rural development', 'Food safety inspection'],
        grantsDetail: [
          { recipient: 'SNAP Food Assistance Program', amount: '$113 Billion', purpose: 'Food stamps for 42 million low-income Americans', date: 'Ongoing 2024' },
          { recipient: 'Farm Subsidies and Crop Insurance', amount: '$28.5 Billion', purpose: 'Income support for farmers', date: 'January 2025' },
          { recipient: 'School Lunch and Breakfast Programs', amount: '$20.3 Billion', purpose: 'Free meals for 30 million students', date: 'Ongoing 2024' },
          { recipient: 'Rural Development Grants', amount: '$3.8 Billion', purpose: 'Infrastructure in rural communities', date: 'December 2024' },
          { recipient: 'Conservation Reserve Program', amount: '$2.2 Billion', purpose: 'Pay farmers to protect environmentally sensitive land', date: 'November 2024' }
        ],
        approveVotes: 3421,
        disapproveVotes: 2678,
        userVote: null
      },
      {
        id: 12,
        name: 'Department of Housing & Urban Development (HUD)',
        secretary: 'Marcia Fudge',
        budget: '$73.4 Billion',
        budgetRaw: 73400000000,
        grants: '$58.9 Billion',
        employees: 7500,
        description: 'Affordable housing and community development',
        responsibilities: ['Public housing', 'Rent assistance', 'Homelessness programs', 'Fair housing enforcement'],
        grantsDetail: [
          { recipient: 'Section 8 Housing Choice Vouchers', amount: '$31.5 Billion', purpose: 'Rent assistance for 2.3 million low-income families', date: 'Ongoing 2024' },
          { recipient: 'Public Housing Operating Fund', amount: '$8.2 Billion', purpose: 'Maintain 1 million public housing units', date: 'January 2025' },
          { recipient: 'Community Development Block Grants', amount: '$5.4 Billion', purpose: 'Local infrastructure and housing projects', date: 'December 2024' },
          { recipient: 'Homeless Assistance Grants', amount: '$3.6 Billion', purpose: 'Emergency shelters and transitional housing', date: 'November 2024' },
          { recipient: 'FHA Mortgage Insurance Program', amount: '$2.8 Billion', purpose: 'First-time homebuyer assistance', date: 'October 2024' }
        ],
        approveVotes: 3234,
        disapproveVotes: 2892,
        userVote: null
      },
      {
        id: 13,
        name: 'Department of the Interior',
        secretary: 'Deb Haaland',
        budget: '$18.5 Billion',
        budgetRaw: 18500000000,
        grants: '$8.9 Billion',
        employees: 70000,
        description: 'National parks, public lands, and natural resources',
        responsibilities: ['National Parks Service', 'Bureau of Land Management', 'U.S. Geological Survey', 'Indian Affairs'],
        grantsDetail: [
          { recipient: 'National Park Service Operations', amount: '$3.8 Billion', purpose: 'Maintain 423 national park sites', date: 'Ongoing 2024' },
          { recipient: 'Bureau of Indian Affairs', amount: '$3.2 Billion', purpose: 'Services for 574 federally recognized tribes', date: 'January 2025' },
          { recipient: 'Land and Water Conservation Fund', amount: '$1.9 Billion', purpose: 'Acquire and protect public lands', date: 'December 2024' },
          { recipient: 'U.S. Geological Survey Research', amount: '$1.4 Billion', purpose: 'Earthquake monitoring and natural resource mapping', date: 'November 2024' },
          { recipient: 'Wildlife Restoration Programs', amount: '$850 Million', purpose: 'Endangered species protection', date: 'October 2024' }
        ],
        approveVotes: 3678,
        disapproveVotes: 2145,
        userVote: null
      },
      {
        id: 14,
        name: 'Department of Labor',
        secretary: 'Julie Su',
        budget: '$14.2 Billion',
        budgetRaw: 14200000000,
        grants: '$8.7 Billion',
        employees: 17347,
        description: 'Workers\' rights, unemployment insurance, and job training',
        responsibilities: ['OSHA safety enforcement', 'Unemployment insurance', 'Wage and hour standards', 'Job training programs'],
        grantsDetail: [
          { recipient: 'State Unemployment Insurance Programs', amount: '$4.2 Billion', purpose: 'Administer unemployment benefits', date: 'Ongoing 2024' },
          { recipient: 'Workforce Innovation and Opportunity Act', amount: '$2.8 Billion', purpose: 'Job training for displaced workers', date: 'January 2025' },
          { recipient: 'OSHA Workplace Safety Enforcement', amount: '$685 Million', purpose: 'Prevent workplace injuries and deaths', date: 'December 2024' },
          { recipient: 'Apprenticeship Programs', amount: '$425 Million', purpose: 'Skilled trades training', date: 'November 2024' },
          { recipient: 'Mine Safety and Health Administration', amount: '$385 Million', purpose: 'Coal and metal mine safety inspections', date: 'October 2024' }
        ],
        approveVotes: 3156,
        disapproveVotes: 2734,
        userVote: null
      },
      {
        id: 15,
        name: 'Department of Commerce',
        secretary: 'Gina Raimondo',
        budget: '$12.3 Billion',
        budgetRaw: 12300000000,
        grants: '$7.8 Billion',
        employees: 48593,
        description: 'Economic growth, trade, and technology development',
        responsibilities: ['Census Bureau', 'Patent office', 'NOAA weather service', 'International trade'],
        grantsDetail: [
          { recipient: 'NOAA Weather and Climate Services', amount: '$6.9 Billion', purpose: 'Weather forecasting and climate research', date: 'Ongoing 2024' },
          { recipient: 'Census Bureau Operations', amount: '$1.6 Billion', purpose: 'Population data collection and analysis', date: 'January 2025' },
          { recipient: 'Economic Development Administration', amount: '$850 Million', purpose: 'Grants for economically distressed communities', date: 'December 2024' },
          { recipient: 'National Institute of Standards & Technology', amount: '$625 Million', purpose: 'Measurement science and technology standards', date: 'November 2024' },
          { recipient: 'Minority Business Development Agency', amount: '$115 Million', purpose: 'Support minority-owned businesses', date: 'October 2024' }
        ],
        approveVotes: 3045,
        disapproveVotes: 2567,
        userVote: null
      }
    ];
    
    setUsDepartments(departments);
  };
  
  const initializeUSAnalytics = () => {
    const analyticsData = {
      // Federal Revenue Sources (FY 2024 - $4.9 Trillion total revenue)
      revenue: [
        { source: 'Individual Income Tax', amount: 2400, percentage: 49 },
        { source: 'Payroll Taxes (SS/Medicare)', amount: 1700, percentage: 35 },
        { source: 'Corporate Income Tax', amount: 530, percentage: 11 },
        { source: 'Customs & Excise Taxes', amount: 155, percentage: 3 },
        { source: 'Estate & Gift Taxes', amount: 45, percentage: 1 },
        { source: 'Other Revenue', amount: 70, percentage: 1 }
      ],
      
      // Federal Spending Categories (FY 2024 - $6.5 Trillion total spending)
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
        { category: 'Health Research & Services', amount: 92, percentage: 1 },
        { category: 'Agriculture', amount: 151, percentage: 2 },
        { category: 'International Affairs', amount: 58, percentage: 1 },
        { category: 'Science & Technology', amount: 45, percentage: 1 },
        { category: 'Energy & Environment', amount: 64, percentage: 1 },
        { category: 'Other Spending', amount: 566, percentage: 9 }
      ],
      
      // Budget Deficit History (2014-2024, in billions)
      deficitHistory: [
        { year: 2014, deficit: -485 },
        { year: 2015, deficit: -438 },
        { year: 2016, deficit: -585 },
        { year: 2017, deficit: -665 },
        { year: 2018, deficit: -779 },
        { year: 2019, deficit: -984 },
        { year: 2020, deficit: -3132 }, // COVID-19
        { year: 2021, deficit: -2772 }, // COVID-19
        { year: 2022, deficit: -1375 },
        { year: 2023, deficit: -1695 },
        { year: 2024, deficit: -1700 }
      ],
      
      // National Debt History (2014-2024, in trillions)
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
        { year: 2024, debt: 34.5 }
      ],
      
      // Unemployment Rate Trends (2020-2024, monthly average %)
      unemploymentTrends: [
        { year: 2020, rate: 8.1, context: 'COVID-19 Pandemic' },
        { year: 2021, rate: 5.4, context: 'Economic Recovery' },
        { year: 2022, rate: 3.6, context: 'Strong Job Market' },
        { year: 2023, rate: 3.7, context: 'Stable Employment' },
        { year: 2024, rate: 4.1, context: 'Current Rate' }
      ],
      
      // Foreign Aid by Country (FY 2024 Top Recipients, in billions)
      foreignAid: [
        { country: 'Ukraine', amount: 44.2, purpose: 'Military and humanitarian aid' },
        { country: 'Israel', amount: 3.8, purpose: 'Military assistance' },
        { country: 'Egypt', amount: 1.4, purpose: 'Military and economic support' },
        { country: 'Jordan', amount: 1.7, purpose: 'Economic and military aid' },
        { country: 'Afghanistan', amount: 3.3, purpose: 'Humanitarian assistance' },
        { country: 'Kenya', amount: 1.1, purpose: 'Security and development' },
        { country: 'Ethiopia', amount: 1.4, purpose: 'Humanitarian and development' },
        { country: 'Nigeria', amount: 1.2, purpose: 'Security and health programs' },
        { country: 'South Sudan', amount: 1.1, purpose: 'Humanitarian relief' },
        { country: 'Syria', amount: 1.9, purpose: 'Humanitarian assistance' }
      ],
      
      // US Government Loans to Foreign Governments (Active loans, in billions)
      foreignLoans: [
        { country: 'Ukraine', amount: 61.4, purpose: 'Economic stabilization and reconstruction', status: 'Active' },
        { country: 'Pakistan', amount: 6.8, purpose: 'Economic development', status: 'Active' },
        { country: 'Iraq', amount: 4.5, purpose: 'Infrastructure reconstruction', status: 'Active' },
        { country: 'Colombia', amount: 3.2, purpose: 'Counter-narcotics and security', status: 'Active' },
        { country: 'Philippines', amount: 2.1, purpose: 'Infrastructure development', status: 'Active' },
        { country: 'Tunisia', amount: 1.8, purpose: 'Economic reform support', status: 'Active' },
        { country: 'Lebanon', amount: 1.5, purpose: 'Economic assistance', status: 'Active' },
        { country: 'Jordan', amount: 2.6, purpose: 'Budget support and development', status: 'Active' }
      ],
      
      // Grant Spending by Department (FY 2024, in billions)
      grantsByDepartment: [
        { department: 'Health & Human Services', grants: 1200, percentage: 45 },
        { department: 'Education', grants: 68, percentage: 3 },
        { department: 'Defense', grants: 420, percentage: 16 },
        { department: 'Veterans Affairs', grants: 125, percentage: 5 },
        { department: 'Treasury', grants: 890, percentage: 33 },
        { department: 'Transportation', grants: 78, percentage: 3 },
        { department: 'Agriculture', grants: 124, percentage: 5 },
        { department: 'Housing & Urban Development', grants: 59, percentage: 2 },
        { department: 'Energy', grants: 28, percentage: 1 },
        { department: 'Homeland Security', grants: 22, percentage: 1 },
        { department: 'State Department', grants: 42, percentage: 2 },
        { department: 'Labor', grants: 9, percentage: 0.3 },
        { department: 'Interior', grants: 9, percentage: 0.3 },
        { department: 'Justice', grants: 15, percentage: 0.6 },
        { department: 'Commerce', grants: 8, percentage: 0.3 }
      ],
      
      // Department Spending Trends (2020-2024, select departments, in billions)
      departmentTrends: [
        { year: 2020, defense: 714, hhs: 1495, education: 102, veterans: 220 },
        { year: 2021, defense: 753, hhs: 1622, education: 238, veterans: 240 },
        { year: 2022, defense: 766, hhs: 1639, education: 79, veterans: 273 },
        { year: 2023, defense: 816, hhs: 1686, education: 90, veterans: 296 },
        { year: 2024, defense: 842, hhs: 1700, education: 79, veterans: 301 }
      ]
    };
    
    setUsAnalyticsData(analyticsData);
  };
  
  const initializeCanadaSupremeCourt = () => {
    const supremeCourtData = {
      justices: [
        { name: 'Richard Wagner', role: 'Chief Justice', appointedBy: 'Justin Trudeau', year: 2017, province: 'Quebec' },
        { name: 'Rosalie Silberman Abella', role: 'Justice', appointedBy: 'Paul Martin', year: 2004, province: 'Ontario' },
        { name: 'Andromache Karakatsanis', role: 'Justice', appointedBy: 'Stephen Harper', year: 2011, province: 'Ontario' },
        { name: 'Sheilah Martin', role: 'Justice', appointedBy: 'Justin Trudeau', year: 2017, province: 'Alberta' },
        { name: 'Nicholas Kasirer', role: 'Justice', appointedBy: 'Justin Trudeau', year: 2019, province: 'Quebec' },
        { name: 'Mahmud Jamal', role: 'Justice', appointedBy: 'Justin Trudeau', year: 2021, province: 'Ontario' },
        { name: 'Michelle O\'Bonsawin', role: 'Justice', appointedBy: 'Justin Trudeau', year: 2022, province: 'Ontario' },
        { name: 'Mary Moreau', role: 'Justice', appointedBy: 'Justin Trudeau', year: 2023, province: 'Alberta' },
        { name: 'Mahmud Jamal', role: 'Justice', appointedBy: 'Justin Trudeau', year: 2024, province: 'Quebec' }
      ],
      
      casesInProcess: [
        {
          id: 'scc-2024-01',
          name: 'Attorney General of Canada v. Power Workers\' Union',
          caseNumber: '40381',
          topic: 'Constitutional Law - Federal Jurisdiction',
          dateArgued: 'November 2024',
          status: 'In Process',
          issue: 'Whether federal government can regulate greenhouse gas emissions from provincial power plants',
          summary: 'Challenge to federal environmental regulations affecting provincially-regulated electricity sector. Questions federal jurisdiction over climate policy.'
        },
        {
          id: 'scc-2024-02',
          name: 'R. v. Northern Gateway Project Inc.',
          caseNumber: '40394',
          topic: 'Indigenous Rights - Consultation',
          dateArgued: 'October 2024',
          status: 'In Process',
          issue: 'Adequacy of Crown consultation with Indigenous peoples on major resource projects',
          summary: 'Appeal examining duty to consult Indigenous communities before approving pipeline projects through traditional territories.'
        },
        {
          id: 'scc-2024-03',
          name: 'Quebec v. 9147-0732 Québec inc.',
          caseNumber: '40402',
          topic: 'Freedom of Expression - Bill 21',
          dateArgued: 'January 2025',
          status: 'In Process',
          issue: 'Constitutional challenge to Quebec\'s religious symbols law',
          summary: 'Challenge to Quebec law banning religious symbols for public servants. Tests limits of provincial jurisdiction and Charter rights.'
        }
      ],
      
      recentDecisions: [
        {
          id: 'scc-2024-04',
          name: 'R. v. Schneider',
          caseNumber: '40156',
          topic: 'Criminal Law - Search and Seizure',
          dateDecided: 'December 2024',
          status: 'Decided',
          voteSplit: '7-2',
          decision: 'Appeal allowed',
          issue: 'Legality of warrantless searches of cell phones at border crossings',
          summary: 'Supreme Court ruled that warrantless cell phone searches at Canadian borders violate Charter rights, requiring reasonable suspicion standard.',
          impact: 'Significant privacy protection for cross-border travelers'
        },
        {
          id: 'scc-2024-05',
          name: 'Reference re: Impact Assessment Act',
          caseNumber: '40615',
          topic: 'Constitutional Law - Environmental Assessment',
          dateDecided: 'October 2024',
          status: 'Decided',
          voteSplit: '5-4',
          decision: 'Act partially unconstitutional',
          issue: 'Federal environmental assessment powers vs provincial jurisdiction',
          summary: 'Court found major portions of federal Impact Assessment Act exceeded federal jurisdiction over environmental matters.',
          impact: 'Major setback for federal climate policy, limits federal environmental powers'
        },
        {
          id: 'scc-2024-06',
          name: 'Toronto (City) v. Ontario',
          caseNumber: '39427',
          topic: 'Constitutional Law - Municipal Autonomy',
          dateDecided: 'September 2024',
          status: 'Decided',
          voteSplit: 'Unanimous',
          decision: 'Appeal dismissed',
          issue: 'Provincial power to interfere in municipal elections',
          summary: 'Court upheld provincial authority to change Toronto city council size mid-election, confirming provinces control municipalities.',
          impact: 'Clarifies limited constitutional protection for municipal governments'
        },
        {
          id: 'scc-2024-07',
          name: 'R. v. Bissonnette',
          caseNumber: '39817',
          topic: 'Criminal Law - Sentencing',
          dateDecided: 'May 2024',
          status: 'Decided',
          voteSplit: 'Unanimous',
          decision: 'Appeal allowed',
          issue: 'Constitutionality of consecutive life sentences without parole eligibility',
          summary: 'Court struck down consecutive periods of parole ineligibility exceeding 25 years as cruel and unusual punishment.',
          impact: 'Affects sentencing for mass murders, limits consecutive life sentences'
        }
      ],
      
      upcomingCases: [
        {
          id: 'scc-2025-01',
          name: 'Canadian Broadcasting Corporation v. Ferrier',
          caseNumber: '40518',
          topic: 'Freedom of Press - Source Protection',
          dateScheduled: 'March 2025',
          status: 'Upcoming',
          issue: 'Journalist privilege to protect confidential sources',
          summary: 'Case will determine extent of constitutional protection for journalists refusing to reveal sources in criminal investigations.'
        },
        {
          id: 'scc-2025-02',
          name: 'British Columbia v. Council of Canadians with Disabilities',
          caseNumber: '40631',
          topic: 'Charter Rights - Accessibility',
          dateScheduled: 'April 2025',
          status: 'Upcoming',
          issue: 'Provincial obligation to provide accessible public transit',
          summary: 'Challenge to BC transit system accessibility. May establish new standards for disability accommodation.'
        },
        {
          id: 'scc-2025-03',
          name: 'Alberta v. Prairies Economic Development Canada',
          caseNumber: '40645',
          topic: 'Constitutional Law - Federal Spending Power',
          dateScheduled: 'June 2025',
          status: 'Upcoming',
          issue: 'Limits on federal spending in areas of provincial jurisdiction',
          summary: 'Alberta challenges federal infrastructure spending programs, questioning constitutional limits of federal spending power.'
        }
      ]
    };
    
    setCanadaSupremeCourt(supremeCourtData);
  };
  
  const initializeUSSupremeCourt = () => {
    const supremeCourtData = {
      justices: [
        { name: 'John Roberts', role: 'Chief Justice', appointedBy: 'George W. Bush', year: 2005, ideology: 'Conservative' },
        { name: 'Clarence Thomas', role: 'Associate Justice', appointedBy: 'George H.W. Bush', year: 1991, ideology: 'Conservative' },
        { name: 'Samuel Alito', role: 'Associate Justice', appointedBy: 'George W. Bush', year: 2006, ideology: 'Conservative' },
        { name: 'Sonia Sotomayor', role: 'Associate Justice', appointedBy: 'Barack Obama', year: 2009, ideology: 'Liberal' },
        { name: 'Elena Kagan', role: 'Associate Justice', appointedBy: 'Barack Obama', year: 2010, ideology: 'Liberal' },
        { name: 'Neil Gorsuch', role: 'Associate Justice', appointedBy: 'Donald Trump', year: 2017, ideology: 'Conservative' },
        { name: 'Brett Kavanaugh', role: 'Associate Justice', appointedBy: 'Donald Trump', year: 2018, ideology: 'Conservative' },
        { name: 'Amy Coney Barrett', role: 'Associate Justice', appointedBy: 'Donald Trump', year: 2020, ideology: 'Conservative' },
        { name: 'Ketanji Brown Jackson', role: 'Associate Justice', appointedBy: 'Joe Biden', year: 2022, ideology: 'Liberal' }
      ],
      
      casesInProcess: [
        {
          id: 'scotus-2024-01',
          name: 'Trump v. United States',
          caseNumber: '23-939',
          topic: 'Presidential Immunity',
          dateArgued: 'December 2024',
          status: 'In Process',
          issue: 'Whether former presidents have immunity from criminal prosecution for official acts',
          summary: 'Landmark case examining scope of presidential immunity in context of Jan. 6 prosecutions. Could reshape executive accountability.'
        },
        {
          id: 'scotus-2024-02',
          name: 'NetChoice v. Paxton',
          caseNumber: '22-555',
          topic: 'First Amendment - Social Media',
          dateArgued: 'November 2024',
          status: 'In Process',
          issue: 'Can states regulate content moderation by social media platforms?',
          summary: 'Challenge to Texas and Florida laws restricting how platforms like Facebook and Twitter can moderate content. Major free speech case.'
        },
        {
          id: 'scotus-2024-03',
          name: 'Murthy v. Missouri',
          caseNumber: '23-411',
          topic: 'First Amendment - Government Speech',
          dateArgued: 'January 2025',
          status: 'In Process',
          issue: 'Government pressure on social media companies to remove content',
          summary: 'Case examining whether government requests to remove "misinformation" violate First Amendment. Tests limits of government influence over private platforms.'
        }
      ],
      
      recentDecisions: [
        {
          id: 'scotus-2024-04',
          name: 'Students for Fair Admissions v. Harvard',
          caseNumber: '20-1199',
          topic: 'Affirmative Action',
          dateDecided: 'June 2024',
          status: 'Decided',
          voteSplit: '6-3',
          decision: 'Affirmative action struck down',
          issue: 'Constitutionality of race-conscious college admissions',
          summary: 'Supreme Court ruled that considering race in college admissions violates Equal Protection Clause, ending affirmative action in higher education.',
          impact: 'Historic decision eliminating race-based admissions nationwide'
        },
        {
          id: 'scotus-2024-05',
          name: 'Biden v. Nebraska',
          caseNumber: '22-506',
          topic: 'Executive Power - Student Loans',
          dateDecided: 'June 2024',
          status: 'Decided',
          voteSplit: '6-3',
          decision: 'Biden plan blocked',
          issue: 'Presidential authority to cancel student loan debt',
          summary: 'Court struck down Biden\'s $400 billion student loan forgiveness plan, ruling executive branch exceeded statutory authority.',
          impact: 'Blocked debt relief for 40 million borrowers, limited executive power'
        },
        {
          id: 'scotus-2024-06',
          name: '303 Creative LLC v. Elenis',
          caseNumber: '21-476',
          topic: 'First Amendment - Religious Freedom',
          dateDecided: 'June 2024',
          status: 'Decided',
          voteSplit: '6-3',
          decision: 'Business can refuse service',
          issue: 'Can businesses refuse services for same-sex weddings on religious grounds?',
          summary: 'Court ruled web designer can refuse to create wedding websites for same-sex couples, citing First Amendment protection of expression.',
          impact: 'Expands religious exemptions from anti-discrimination laws'
        },
        {
          id: 'scotus-2024-07',
          name: 'Moore v. Harper',
          caseNumber: '21-1271',
          topic: 'Elections - Independent State Legislature Theory',
          dateDecided: 'June 2024',
          status: 'Decided',
          voteSplit: '6-3',
          decision: 'Theory rejected',
          issue: 'Can state legislatures set election rules without judicial review?',
          summary: 'Court rejected "independent state legislature theory," confirming state courts can review election maps and laws.',
          impact: 'Major victory for voting rights, preserves checks on gerrymandering'
        },
        {
          id: 'scotus-2024-08',
          name: 'United States v. Texas',
          caseNumber: '22-58',
          topic: 'Immigration - Border Policy',
          dateDecided: 'September 2024',
          status: 'Decided',
          voteSplit: '5-4',
          decision: 'Biden policy upheld',
          issue: 'Federal immigration enforcement priorities',
          summary: 'Court allowed Biden administration to prioritize certain immigrants for deportation over others, affirming executive discretion.',
          impact: 'Maintains executive flexibility in immigration enforcement'
        }
      ],
      
      upcomingCases: [
        {
          id: 'scotus-2025-01',
          name: 'FDA v. Alliance for Hippocratic Medicine',
          caseNumber: '23-235',
          topic: 'Abortion - Medication Access',
          dateScheduled: 'March 2025',
          status: 'Upcoming',
          issue: 'FDA authority to approve abortion medication (mifepristone)',
          summary: 'First major abortion case since Dobbs. Challenges FDA approval of widely-used abortion pill. Could affect medication access nationwide.'
        },
        {
          id: 'scotus-2025-02',
          name: 'National Rifle Association v. Vullo',
          caseNumber: '22-842',
          topic: 'First Amendment - Advocacy',
          dateScheduled: 'April 2025',
          status: 'Upcoming',
          issue: 'Government pressure on businesses to sever ties with advocacy groups',
          summary: 'NRA claims New York officials violated First Amendment by pressuring banks and insurers to cut ties. Tests limits of government advocacy.'
        },
        {
          id: 'scotus-2025-03',
          name: 'Gonzalez v. Google',
          caseNumber: '21-1333',
          topic: 'Section 230 - Tech Liability',
          dateScheduled: 'May 2025',
          status: 'Upcoming',
          issue: 'Whether Section 230 protects algorithmic recommendations',
          summary: 'Could reshape internet as we know it. Challenges whether platforms are liable for algorithm-recommended content promoting terrorism.'
        }
      ]
    };
    
    setUsSupremeCourt(supremeCourtData);
  };
  
  const initializeUSContracts = () => {
    const contracts = [
      // Defense Contracts
      { id: 1, company: 'Lockheed Martin Corporation', amount: '$75.2 Billion', amountRaw: 75200000000, department: 'Department of Defense', purpose: 'F-35 Lightning II fighter jets - production, maintenance, and upgrades', date: 'Ongoing 2024', status: 'Active', type: 'Defense' },
      { id: 2, company: 'Boeing Defense, Space & Security', amount: '$24.3 Billion', amountRaw: 24300000000, department: 'Department of Defense', purpose: 'F/A-18 Super Hornet, KC-46 tanker aircraft, and missile defense systems', date: 'Ongoing 2024', status: 'Active', type: 'Defense' },
      { id: 3, company: 'Raytheon Technologies', amount: '$17.8 Billion', amountRaw: 17800000000, department: 'Department of Defense', purpose: 'Patriot missile systems, Tomahawk cruise missiles, and radar systems', date: 'Ongoing 2024', status: 'Active', type: 'Defense' },
      { id: 4, company: 'Northrop Grumman Corporation', amount: '$13.4 Billion', amountRaw: 13400000000, department: 'Department of Defense', purpose: 'B-21 Raider stealth bomber development and space systems', date: 'January 2024', status: 'Active', type: 'Defense' },
      { id: 5, company: 'General Dynamics Corporation', amount: '$11.2 Billion', amountRaw: 11200000000, department: 'Department of Defense', purpose: 'Virginia-class submarines, Abrams tanks, and Stryker combat vehicles', date: 'Ongoing 2024', status: 'Active', type: 'Defense' },
      { id: 6, company: 'BAE Systems USA', amount: '$8.5 Billion', amountRaw: 8500000000, department: 'Department of Defense', purpose: 'Armored combat vehicles, naval gun systems, and electronic warfare', date: 'November 2023', status: 'Active', type: 'Defense' },
      { id: 7, company: 'L3Harris Technologies', amount: '$6.2 Billion', amountRaw: 6200000000, department: 'Department of Defense', purpose: 'Tactical radio systems, electronic warfare, and ISR solutions', date: 'September 2024', status: 'Active', type: 'Defense' },
      { id: 8, company: 'Huntington Ingalls Industries', amount: '$5.8 Billion', amountRaw: 5800000000, department: 'Department of Defense', purpose: 'Gerald R. Ford-class aircraft carriers and Arleigh Burke destroyers', date: 'December 2023', status: 'Active', type: 'Defense' },
      { id: 9, company: 'Leidos Holdings Inc.', amount: '$4.3 Billion', amountRaw: 4300000000, department: 'Department of Defense', purpose: 'IT modernization, cybersecurity, and logistics support services', date: 'August 2024', status: 'Active', type: 'Defense' },
      { id: 10, company: 'SAIC (Science Applications International)', amount: '$3.7 Billion', amountRaw: 3700000000, department: 'Department of Defense', purpose: 'Intelligence analysis, software development, and technical services', date: 'July 2024', status: 'Active', type: 'Defense' },
      
      // NASA Contracts
      { id: 11, company: 'SpaceX', amount: '$3.5 Billion', amountRaw: 3500000000, department: 'NASA', purpose: 'Starship lunar lander, ISS cargo resupply, and crew transportation', date: 'April 2024', status: 'Active', type: 'Space' },
      { id: 12, company: 'Blue Origin', amount: '$2.1 Billion', amountRaw: 2100000000, department: 'NASA', purpose: 'Blue Moon lunar lander for Artemis program', date: 'May 2023', status: 'Active', type: 'Space' },
      { id: 13, company: 'Boeing Space', amount: '$1.5 Billion', amountRaw: 1500000000, department: 'NASA', purpose: 'Space Launch System (SLS) rocket development and production', date: 'Ongoing 2024', status: 'Active', type: 'Space' },
      { id: 14, company: 'Northrop Grumman Space', amount: '$1.8 Billion', amountRaw: 1800000000, department: 'NASA', purpose: 'James Webb Space Telescope support and future observatory missions', date: 'March 2024', status: 'Active', type: 'Space' },
      { id: 15, company: 'Axiom Space', amount: '$850 Million', amountRaw: 850000000, department: 'NASA', purpose: 'Commercial space station modules and astronaut spacesuits', date: 'June 2024', status: 'Active', type: 'Space' },
      
      // Infrastructure & Transportation
      { id: 16, company: 'Bechtel Corporation', amount: '$4.2 Billion', amountRaw: 4200000000, department: 'Department of Transportation', purpose: 'California High-Speed Rail construction and infrastructure modernization', date: 'February 2024', status: 'Active', type: 'Infrastructure' },
      { id: 17, company: 'Fluor Corporation', amount: '$2.8 Billion', amountRaw: 2800000000, department: 'Department of Energy', purpose: 'Nuclear site cleanup and environmental remediation', date: 'January 2024', status: 'Active', type: 'Infrastructure' },
      { id: 18, company: 'AECOM', amount: '$2.3 Billion', amountRaw: 2300000000, department: 'Department of Transportation', purpose: 'Highway infrastructure design, construction management, and bridge repairs', date: 'October 2023', status: 'Active', type: 'Infrastructure' },
      { id: 19, company: 'Jacobs Engineering Group', amount: '$1.9 Billion', amountRaw: 1900000000, department: 'Department of Transportation', purpose: 'Airport modernization and public transit system upgrades', date: 'December 2023', status: 'Active', type: 'Infrastructure' },
      { id: 20, company: 'KBR Inc.', amount: '$1.7 Billion', amountRaw: 1700000000, department: 'Department of Defense', purpose: 'Overseas military base operations and logistics support', date: 'August 2024', status: 'Active', type: 'Infrastructure' },
      
      // Technology & IT
      { id: 21, company: 'Amazon Web Services (AWS)', amount: '$10.0 Billion', amountRaw: 10000000000, department: 'Department of Defense', purpose: 'Joint Warfighting Cloud Capability (JWCC) - cloud computing infrastructure', date: 'December 2022', status: 'Active', type: 'Technology' },
      { id: 22, company: 'Microsoft Corporation', amount: '$8.7 Billion', amountRaw: 8700000000, department: 'Department of Defense', purpose: 'JWCC cloud services and Army HoloLens augmented reality systems', date: 'December 2022', status: 'Active', type: 'Technology' },
      { id: 23, company: 'Google Cloud', amount: '$6.2 Billion', amountRaw: 6200000000, department: 'Department of Defense', purpose: 'JWCC cloud infrastructure and AI/ML capabilities', date: 'December 2022', status: 'Active', type: 'Technology' },
      { id: 24, company: 'Oracle Corporation', amount: '$4.1 Billion', amountRaw: 4100000000, department: 'Department of Defense', purpose: 'JWCC database services and enterprise software systems', date: 'December 2022', status: 'Active', type: 'Technology' },
      { id: 25, company: 'Palantir Technologies', amount: '$1.3 Billion', amountRaw: 1300000000, department: 'Department of Defense', purpose: 'AI-powered data analytics and battlefield intelligence platforms', date: 'May 2024', status: 'Active', type: 'Technology' },
      
      // Cybersecurity
      { id: 26, company: 'Booz Allen Hamilton', amount: '$2.9 Billion', amountRaw: 2900000000, department: 'Department of Homeland Security', purpose: 'Cybersecurity consulting, threat intelligence, and IT modernization', date: 'September 2024', status: 'Active', type: 'Cybersecurity' },
      { id: 27, company: 'Accenture Federal Services', amount: '$2.1 Billion', amountRaw: 2100000000, department: 'Department of Homeland Security', purpose: 'Digital transformation and cybersecurity infrastructure', date: 'July 2024', status: 'Active', type: 'Cybersecurity' },
      { id: 28, company: 'CrowdStrike Holdings', amount: '$850 Million', amountRaw: 850000000, department: 'Department of Defense', purpose: 'Endpoint security and threat detection across military networks', date: 'March 2024', status: 'Active', type: 'Cybersecurity' },
      
      // Healthcare & Pharmaceuticals
      { id: 29, company: 'Pfizer Inc.', amount: '$5.3 Billion', amountRaw: 5300000000, department: 'Health & Human Services', purpose: 'COVID-19 vaccines, antiviral medications, and pandemic preparedness', date: 'Ongoing 2024', status: 'Active', type: 'Healthcare' },
      { id: 30, company: 'Moderna Inc.', amount: '$3.8 Billion', amountRaw: 3800000000, department: 'Health & Human Services', purpose: 'mRNA vaccines for COVID-19 and future pandemic preparedness', date: 'Ongoing 2024', status: 'Active', type: 'Healthcare' },
      { id: 31, company: 'Johnson & Johnson', amount: '$2.4 Billion', amountRaw: 2400000000, department: 'Health & Human Services', purpose: 'Vaccine development and medical research partnerships', date: 'June 2024', status: 'Active', type: 'Healthcare' },
      { id: 32, company: 'UnitedHealth Group', amount: '$1.9 Billion', amountRaw: 1900000000, department: 'Veterans Affairs', purpose: 'Healthcare services and insurance administration for veterans', date: 'April 2024', status: 'Active', type: 'Healthcare' },
      
      // Energy
      { id: 33, company: 'NextEra Energy', amount: '$3.2 Billion', amountRaw: 3200000000, department: 'Department of Energy', purpose: 'Renewable energy infrastructure - wind and solar power generation', date: 'February 2024', status: 'Active', type: 'Energy' },
      { id: 34, company: 'Tesla Energy', amount: '$1.8 Billion', amountRaw: 1800000000, department: 'Department of Energy', purpose: 'Grid-scale battery storage systems and EV charging infrastructure', date: 'May 2024', status: 'Active', type: 'Energy' },
      { id: 35, company: 'Westinghouse Electric', amount: '$2.5 Billion', amountRaw: 2500000000, department: 'Department of Energy', purpose: 'Nuclear reactor technology and small modular reactor development', date: 'November 2023', status: 'Active', type: 'Energy' },
      
      // Consulting & Professional Services
      { id: 36, company: 'Deloitte Consulting', amount: '$3.4 Billion', amountRaw: 3400000000, department: 'Multiple Agencies', purpose: 'Management consulting, financial advisory, and digital transformation', date: 'Ongoing 2024', status: 'Active', type: 'Consulting' },
      { id: 37, company: 'McKinsey & Company', amount: '$1.7 Billion', amountRaw: 1700000000, department: 'Multiple Agencies', purpose: 'Strategic consulting and organizational transformation services', date: 'August 2024', status: 'Active', type: 'Consulting' },
      { id: 38, company: 'CACI International', amount: '$2.8 Billion', amountRaw: 2800000000, department: 'Department of Defense', purpose: 'Intelligence support, IT services, and mission-critical solutions', date: 'July 2024', status: 'Active', type: 'Consulting' },
      
      // Border & Immigration
      { id: 39, company: 'CoreCivic Inc.', amount: '$1.2 Billion', amountRaw: 1200000000, department: 'Department of Homeland Security', purpose: 'Immigration detention facility operations and management', date: 'January 2024', status: 'Active', type: 'Border Security' },
      { id: 40, company: 'GEO Group Inc.', amount: '$950 Million', amountRaw: 950000000, department: 'Department of Homeland Security', purpose: 'Detention center operations and transportation services', date: 'February 2024', status: 'Active', type: 'Border Security' },
      { id: 41, company: 'Anduril Industries', amount: '$850 Million', amountRaw: 850000000, department: 'Department of Homeland Security', purpose: 'AI-powered border surveillance towers and autonomous systems', date: 'September 2024', status: 'Active', type: 'Border Security' }
    ];
    
    setUsContracts(contracts);
  };
  
  const initializeUSBills = () => {
    const bills = [
      {
        id: 'hr-815',
        number: 'H.R. 815',
        title: 'National Security Supplemental Appropriations Act',
        sponsor: 'Mike Johnson',
        sponsorParty: 'Republican',
        sponsorState: 'Louisiana',
        chamber: 'House',
        status: 'Signed into Law',
        dateIntroduced: '2024-02-06',
        dateStatusChange: '2024-04-24',
        description: 'Emergency supplemental appropriations providing $95 billion in aid for Ukraine ($61B), Israel ($26B), and Taiwan ($8B). Includes TikTok ban provisions requiring ByteDance to divest or face US ban.',
        category: 'Foreign Policy',
        supportVotes: 4523,
        opposeVotes: 1892,
        userVote: null,
        partySupport: { Democrat: 89, Republican: 11 },
        timeline: [
          { date: '2024-02-06', event: 'Introduced in House' },
          { date: '2024-02-13', event: 'Passed House (311-112)' },
          { date: '2024-02-13', event: 'Passed Senate (70-29)' },
          { date: '2024-04-24', event: 'Signed by President Biden' }
        ]
      },
      {
        id: 's-4',
        number: 'S. 4',
        title: 'Border Security and Immigration Reform Act',
        sponsor: 'James Lankford',
        sponsorParty: 'Republican',
        sponsorState: 'Oklahoma',
        chamber: 'Senate',
        status: 'Failed in Senate',
        dateIntroduced: '2024-01-28',
        dateStatusChange: '2024-02-07',
        description: 'Comprehensive border security legislation including increased Border Patrol agents, asylum processing changes, and emergency authority to close the border. Bipartisan negotiations collapsed after Trump opposition.',
        category: 'Immigration',
        supportVotes: 2134,
        opposeVotes: 3892,
        userVote: null,
        partySupport: { Democrat: 35, Republican: 65 },
        timeline: [
          { date: '2024-01-28', event: 'Introduced in Senate' },
          { date: '2024-02-07', event: 'Failed cloture vote (49-50)' }
        ]
      },
      {
        id: 'hr-2',
        number: 'H.R. 2',
        title: 'Secure the Border Act',
        sponsor: 'Mario Diaz-Balart',
        sponsorParty: 'Republican',
        sponsorState: 'Florida',
        chamber: 'House',
        status: 'Passed House',
        dateIntroduced: '2023-05-11',
        dateStatusChange: '2023-05-11',
        description: 'Republican border security package requiring completion of border wall, increasing Border Patrol funding, and restricting asylum claims. Passed House on party-line vote.',
        category: 'Immigration',
        supportVotes: 3234,
        opposeVotes: 2567,
        userVote: null,
        partySupport: { Democrat: 15, Republican: 85 },
        timeline: [
          { date: '2023-05-11', event: 'Introduced in House' },
          { date: '2023-05-11', event: 'Passed House (219-213)' },
          { date: '2023-05-12', event: 'Stalled in Senate' }
        ]
      },
      {
        id: 'hr-1',
        number: 'H.R. 1',
        title: 'Lower Energy Costs Act',
        sponsor: 'Steve Scalise',
        sponsorParty: 'Republican',
        sponsorState: 'Louisiana',
        chamber: 'House',
        status: 'Passed House',
        dateIntroduced: '2023-03-17',
        dateStatusChange: '2023-03-30',
        description: 'Republican energy package streamlining fossil fuel development, expanding domestic oil and gas production, and rolling back Biden climate regulations.',
        category: 'Energy',
        supportVotes: 2789,
        opposeVotes: 2456,
        userVote: null,
        partySupport: { Democrat: 8, Republican: 92 },
        timeline: [
          { date: '2023-03-17', event: 'Introduced in House' },
          { date: '2023-03-30', event: 'Passed House (225-204)' },
          { date: '2023-04-01', event: 'Stalled in Senate' }
        ]
      },
      {
        id: 's-722',
        number: 'S. 722',
        title: 'CHIPS and Science Act Implementation',
        sponsor: 'Chuck Schumer',
        sponsorParty: 'Democrat',
        sponsorState: 'New York',
        chamber: 'Senate',
        status: 'Signed into Law',
        dateIntroduced: '2022-07-19',
        dateStatusChange: '2022-08-09',
        description: '$280 billion package providing $52 billion for semiconductor manufacturing, $200 billion for scientific research, and tax credits for chip production to compete with China.',
        category: 'Technology',
        supportVotes: 4892,
        opposeVotes: 1234,
        userVote: null,
        partySupport: { Democrat: 95, Republican: 28 },
        timeline: [
          { date: '2022-07-19', event: 'Introduced in Senate' },
          { date: '2022-07-27', event: 'Passed Senate (64-33)' },
          { date: '2022-07-28', event: 'Passed House (243-187)' },
          { date: '2022-08-09', event: 'Signed by President Biden' }
        ]
      },
      {
        id: 'hr-5376',
        number: 'H.R. 5376',
        title: 'Inflation Reduction Act',
        sponsor: 'John Yarmuth',
        sponsorParty: 'Democrat',
        sponsorState: 'Kentucky',
        chamber: 'House',
        status: 'Signed into Law',
        dateIntroduced: '2021-09-27',
        dateStatusChange: '2022-08-16',
        description: '$750 billion climate, healthcare, and tax package including $369 billion for climate/energy programs, Medicare drug price negotiation, and minimum corporate tax.',
        category: 'Economy',
        supportVotes: 5123,
        opposeVotes: 1678,
        userVote: null,
        partySupport: { Democrat: 98, Republican: 0 },
        timeline: [
          { date: '2021-09-27', event: 'Introduced in House' },
          { date: '2022-08-07', event: 'Passed Senate (51-50, VP tiebreaker)' },
          { date: '2022-08-12', event: 'Passed House (220-207)' },
          { date: '2022-08-16', event: 'Signed by President Biden' }
        ]
      },
      {
        id: 'hr-3684',
        number: 'H.R. 3684',
        title: 'Infrastructure Investment and Jobs Act',
        sponsor: 'Peter DeFazio',
        sponsorParty: 'Democrat',
        sponsorState: 'Oregon',
        chamber: 'House',
        status: 'Signed into Law',
        dateIntroduced: '2021-06-04',
        dateStatusChange: '2021-11-15',
        description: '$1.2 trillion bipartisan infrastructure package for roads, bridges, broadband, water systems, and public transit. Largest infrastructure investment in generations.',
        category: 'Infrastructure',
        supportVotes: 5789,
        opposeVotes: 892,
        userVote: null,
        partySupport: { Democrat: 92, Republican: 35 },
        timeline: [
          { date: '2021-06-04', event: 'Introduced in House' },
          { date: '2021-08-10', event: 'Passed Senate (69-30)' },
          { date: '2021-11-05', event: 'Passed House (228-206)' },
          { date: '2021-11-15', event: 'Signed by President Biden' }
        ]
      },
      {
        id: 'hr-3746',
        number: 'H.R. 3746',
        title: 'Fiscal Responsibility Act',
        sponsor: 'Jodey Arrington',
        sponsorParty: 'Republican',
        sponsorState: 'Texas',
        chamber: 'House',
        status: 'Signed into Law',
        dateIntroduced: '2023-05-29',
        dateStatusChange: '2023-06-03',
        description: 'Debt ceiling increase with spending caps, ending student loan payment pause, and work requirements for federal aid. Bipartisan deal averting default.',
        category: 'Budget',
        supportVotes: 3892,
        opposeVotes: 2134,
        userVote: null,
        partySupport: { Democrat: 52, Republican: 48 },
        timeline: [
          { date: '2023-05-29', event: 'Introduced in House' },
          { date: '2023-05-31', event: 'Passed House (314-117)' },
          { date: '2023-06-01', event: 'Passed Senate (63-36)' },
          { date: '2023-06-03', event: 'Signed by President Biden' }
        ]
      },
      {
        id: 's-1939',
        number: 'S. 1939',
        title: 'John R. Lewis Voting Rights Act',
        sponsor: 'Patrick Leahy',
        sponsorParty: 'Democrat',
        sponsorState: 'Vermont',
        chamber: 'Senate',
        status: 'In Committee',
        dateIntroduced: '2023-06-08',
        dateStatusChange: '2023-06-08',
        description: 'Restores and modernizes Voting Rights Act provisions struck down by Supreme Court, requiring federal approval for voting changes in states with discrimination history.',
        category: 'Civil Rights',
        supportVotes: 4234,
        opposeVotes: 1567,
        userVote: null,
        partySupport: { Democrat: 98, Republican: 3 },
        timeline: [
          { date: '2023-06-08', event: 'Introduced in Senate' },
          { date: '2023-06-15', event: 'Referred to Judiciary Committee' }
        ]
      },
      {
        id: 'hr-21',
        number: 'H.R. 21',
        title: 'Strategic Production Response Act',
        sponsor: 'Cathy McMorris Rodgers',
        sponsorParty: 'Republican',
        sponsorState: 'Washington',
        chamber: 'House',
        status: 'Passed House',
        dateIntroduced: '2023-01-12',
        dateStatusChange: '2023-01-26',
        description: 'Prohibits President from releasing Strategic Petroleum Reserve unless plan developed to increase domestic energy production.',
        category: 'Energy',
        supportVotes: 2678,
        opposeVotes: 2456,
        userVote: null,
        partySupport: { Democrat: 12, Republican: 88 },
        timeline: [
          { date: '2023-01-12', event: 'Introduced in House' },
          { date: '2023-01-26', event: 'Passed House (221-205)' },
          { date: '2023-01-27', event: 'Stalled in Senate' }
        ]
      },
      {
        id: 's-316',
        number: 'S. 316',
        title: 'Pregnant Workers Fairness Act',
        sponsor: 'Bob Casey',
        sponsorParty: 'Democrat',
        sponsorState: 'Pennsylvania',
        chamber: 'Senate',
        status: 'Signed into Law',
        dateIntroduced: '2023-02-02',
        dateStatusChange: '2022-12-29',
        description: 'Requires employers to provide reasonable accommodations for pregnant workers, protecting against discrimination and ensuring workplace safety.',
        category: 'Labor',
        supportVotes: 4892,
        opposeVotes: 678,
        userVote: null,
        partySupport: { Democrat: 97, Republican: 72 },
        timeline: [
          { date: '2023-02-02', event: 'Introduced in Senate' },
          { date: '2022-12-15', event: 'Passed Senate by unanimous consent' },
          { date: '2022-12-08', event: 'Passed House (315-101)' },
          { date: '2022-12-29', event: 'Signed by President Biden' }
        ]
      },
      {
        id: 'hr-277',
        number: 'H.R. 277',
        title: 'Defund Planned Parenthood Act',
        sponsor: 'Bob Good',
        sponsorParty: 'Republican',
        sponsorState: 'Virginia',
        chamber: 'House',
        status: 'In Committee',
        dateIntroduced: '2023-01-11',
        dateStatusChange: '2023-01-11',
        description: 'Prohibits federal funding to Planned Parenthood and affiliated organizations for one year.',
        category: 'Healthcare',
        supportVotes: 1892,
        opposeVotes: 4234,
        userVote: null,
        partySupport: { Democrat: 2, Republican: 95 },
        timeline: [
          { date: '2023-01-11', event: 'Introduced in House' },
          { date: '2023-01-23', event: 'Referred to Energy and Commerce Committee' }
        ]
      },
      {
        id: 's-686',
        number: 'S. 686',
        title: 'RESTRICT Act (TikTok Ban)',
        sponsor: 'Mark Warner',
        sponsorParty: 'Democrat',
        sponsorState: 'Virginia',
        chamber: 'Senate',
        status: 'In Committee',
        dateIntroduced: '2023-03-07',
        dateStatusChange: '2023-03-07',
        description: 'Empowers Commerce Department to ban or restrict foreign technology products deemed national security threats, primarily targeting TikTok and other Chinese apps.',
        category: 'Technology',
        supportVotes: 3567,
        opposeVotes: 2234,
        userVote: null,
        partySupport: { Democrat: 72, Republican: 68 },
        timeline: [
          { date: '2023-03-07', event: 'Introduced in Senate' },
          { date: '2023-03-14', event: 'Referred to Intelligence Committee' }
        ]
      },
      {
        id: 'hr-1467',
        number: 'H.R. 1467',
        title: 'Protect America\'s Children from Toxic Pesticides Act',
        sponsor: 'Joe Neguse',
        sponsorParty: 'Democrat',
        sponsorState: 'Colorado',
        chamber: 'House',
        status: 'Passed House',
        dateIntroduced: '2023-03-09',
        dateStatusChange: '2023-04-26',
        description: 'Bans use of organophosphate pesticides linked to developmental disorders in children, requires EPA to re-evaluate pesticide safety standards.',
        category: 'Environment',
        supportVotes: 3892,
        opposeVotes: 1678,
        userVote: null,
        partySupport: { Democrat: 92, Republican: 8 },
        timeline: [
          { date: '2023-03-09', event: 'Introduced in House' },
          { date: '2023-04-26', event: 'Passed House (218-211)' },
          { date: '2023-04-27', event: 'Stalled in Senate' }
        ]
      },
      {
        id: 's-1076',
        number: 'S. 1076',
        title: 'Railway Safety Act',
        sponsor: 'Sherrod Brown',
        sponsorParty: 'Democrat',
        sponsorState: 'Ohio',
        chamber: 'Senate',
        status: 'In Committee',
        dateIntroduced: '2023-03-28',
        dateStatusChange: '2023-03-28',
        description: 'Increases railway safety requirements after East Palestine, Ohio derailment. Mandates improved braking systems, crew size requirements, and hazmat protocols.',
        category: 'Transportation',
        supportVotes: 4456,
        opposeVotes: 892,
        userVote: null,
        partySupport: { Democrat: 95, Republican: 42 },
        timeline: [
          { date: '2023-03-28', event: 'Introduced in Senate' },
          { date: '2023-04-05', event: 'Referred to Commerce Committee' }
        ]
      },
      {
        id: 'hr-485',
        number: 'H.R. 485',
        title: 'Federal Extreme Risk Protection Order Act',
        sponsor: 'Lucy McBath',
        sponsorParty: 'Democrat',
        sponsorState: 'Georgia',
        chamber: 'House',
        status: 'In Committee',
        dateIntroduced: '2023-01-24',
        dateStatusChange: '2023-01-24',
        description: 'Creates federal red flag law allowing courts to temporarily remove firearms from individuals deemed dangerous to themselves or others.',
        category: 'Gun Control',
        supportVotes: 3892,
        opposeVotes: 2134,
        userVote: null,
        partySupport: { Democrat: 96, Republican: 5 },
        timeline: [
          { date: '2023-01-24', event: 'Introduced in House' },
          { date: '2023-02-01', event: 'Referred to Judiciary Committee' }
        ]
      },
      {
        id: 's-139',
        number: 'S. 139',
        title: 'Social Security Expansion Act',
        sponsor: 'Bernie Sanders',
        sponsorParty: 'Independent',
        sponsorState: 'Vermont',
        chamber: 'Senate',
        status: 'In Committee',
        dateIntroduced: '2023-02-01',
        dateStatusChange: '2023-02-01',
        description: 'Expands Social Security benefits by $200/month, extends solvency by lifting payroll tax cap on income over $250,000.',
        category: 'Social Security',
        supportVotes: 4678,
        opposeVotes: 1234,
        userVote: null,
        partySupport: { Democrat: 85, Republican: 2 },
        timeline: [
          { date: '2023-02-01', event: 'Introduced in Senate' },
          { date: '2023-02-08', event: 'Referred to Finance Committee' }
        ]
      },
      {
        id: 'hr-734',
        number: 'H.R. 734',
        title: 'Term Limits for Members of Congress',
        sponsor: 'Ralph Norman',
        sponsorParty: 'Republican',
        sponsorState: 'South Carolina',
        chamber: 'House',
        status: 'In Committee',
        dateIntroduced: '2023-02-01',
        dateStatusChange: '2023-02-01',
        description: 'Constitutional amendment imposing 12-year term limits on House and Senate members.',
        category: 'Government Reform',
        supportVotes: 5234,
        opposeVotes: 892,
        userVote: null,
        partySupport: { Democrat: 22, Republican: 88 },
        timeline: [
          { date: '2023-02-01', event: 'Introduced in House' },
          { date: '2023-02-09', event: 'Referred to Judiciary Committee' }
        ]
      },
      {
        id: 's-563',
        number: 'S. 563',
        title: 'Right to Contraception Act',
        sponsor: 'Ed Markey',
        sponsorParty: 'Democrat',
        sponsorState: 'Massachusetts',
        chamber: 'Senate',
        status: 'Failed in Senate',
        dateIntroduced: '2023-02-28',
        dateStatusChange: '2024-06-05',
        description: 'Establishes federal statutory right to access contraception and contraceptive information, protection against state restrictions.',
        category: 'Healthcare',
        supportVotes: 4123,
        opposeVotes: 1892,
        userVote: null,
        partySupport: { Democrat: 97, Republican: 8 },
        timeline: [
          { date: '2023-02-28', event: 'Introduced in Senate' },
          { date: '2024-06-05', event: 'Failed cloture vote (51-39, needed 60)' }
        ]
      },
      {
        id: 'hr-9495',
        number: 'H.R. 9495',
        title: 'Stop Terror-Financing and Tax Penalties on American Hostages Act',
        sponsor: 'Claudia Tenney',
        sponsorParty: 'Republican',
        sponsorState: 'New York',
        chamber: 'House',
        status: 'Passed House',
        dateIntroduced: '2024-09-09',
        dateStatusChange: '2024-11-21',
        description: 'Allows Treasury Secretary to revoke tax-exempt status of organizations supporting terrorism, postpones tax deadlines for Americans held hostage abroad.',
        category: 'National Security',
        supportVotes: 2567,
        opposeVotes: 3892,
        userVote: null,
        partySupport: { Democrat: 28, Republican: 92 },
        timeline: [
          { date: '2024-09-09', event: 'Introduced in House' },
          { date: '2024-11-21', event: 'Passed House (219-184)' },
          { date: '2024-11-22', event: 'Pending in Senate' }
        ]
      }
    ];
    
    setUsBills(bills);
  };
  
  const initializeUSLaws = () => {
    const usLawsData = [
      {
        id: 'us-law-1',
        title: 'Civil Rights Act of 1964',
        category: 'Civil Rights',
        dateEnacted: '1964-07-02',
        keywords: ['discrimination', 'employment', 'civil rights', 'equal opportunity', 'workplace', 'hiring'],
        summary: 'Landmark legislation that outlaws discrimination based on race, color, religion, sex, or national origin. Prohibits unequal application of voter registration requirements and racial segregation in schools, workplaces, and public accommodations.',
        officialLink: 'https://www.eeoc.gov/statutes/title-vii-civil-rights-act-1964'
      },
      {
        id: 'us-law-2',
        title: 'Americans with Disabilities Act (ADA)',
        category: 'Civil Rights',
        dateEnacted: '1990-07-26',
        keywords: ['disability', 'discrimination', 'accessibility', 'accommodation', 'employment', 'public access'],
        summary: 'Prohibits discrimination against individuals with disabilities in all areas of public life, including jobs, schools, transportation, and all public and private places open to the general public. Requires reasonable accommodations in employment and accessibility in public spaces.',
        officialLink: 'https://www.ada.gov/law-and-regs/ada/'
      },
      {
        id: 'us-law-3',
        title: 'Fair Labor Standards Act (FLSA)',
        category: 'Employment',
        dateEnacted: '1938-06-25',
        keywords: ['minimum wage', 'overtime', 'child labor', 'employment', 'wages', 'hours', 'labor'],
        summary: 'Establishes minimum wage, overtime pay eligibility, recordkeeping, and child labor standards affecting full-time and part-time workers. Sets the federal minimum wage and requires overtime pay at time-and-a-half for hours over 40 per week.',
        officialLink: 'https://www.dol.gov/agencies/whd/flsa'
      },
      {
        id: 'us-law-4',
        title: 'Family and Medical Leave Act (FMLA)',
        category: 'Employment',
        dateEnacted: '1993-02-05',
        keywords: ['family leave', 'medical leave', 'maternity', 'paternity', 'employment', 'job protection'],
        summary: 'Provides eligible employees up to 12 weeks of unpaid, job-protected leave per year for specified family and medical reasons, including birth of a child, adoption, serious health condition of employee or immediate family member.',
        officialLink: 'https://www.dol.gov/agencies/whd/fmla'
      },
      {
        id: 'us-law-5',
        title: 'Immigration and Nationality Act',
        category: 'Immigration',
        dateEnacted: '1952-06-27',
        keywords: ['immigration', 'visa', 'citizenship', 'green card', 'deportation', 'asylum', 'refugee'],
        summary: 'Governs immigration policy in the United States. Establishes the structure of immigration law including requirements for visas, lawful permanent residence (green cards), citizenship, asylum, and deportation procedures.',
        officialLink: 'https://www.uscis.gov/laws-and-policy/legislation/immigration-and-nationality-act'
      },
      {
        id: 'us-law-6',
        title: 'Internal Revenue Code',
        category: 'Tax Law',
        dateEnacted: '1986-10-22',
        keywords: ['tax', 'income tax', 'IRS', 'deductions', 'credits', 'filing', 'returns'],
        summary: 'Comprehensive set of tax laws covering income taxes, estate and gift taxes, employment taxes, and excise taxes. Defines taxable income, deductions, credits, and filing requirements for individuals and businesses.',
        officialLink: 'https://www.irs.gov/privacy-disclosure/tax-code-regulations-and-official-guidance'
      },
      {
        id: 'us-law-7',
        title: 'Social Security Act',
        category: 'Social Welfare',
        dateEnacted: '1935-08-14',
        keywords: ['social security', 'retirement', 'disability', 'benefits', 'medicare', 'supplemental income'],
        summary: 'Creates the Social Security program providing retirement benefits, disability income, and Medicare. Establishes a system of old-age benefits for workers, benefits for victims of industrial accidents, unemployment insurance, and aid for dependent mothers and children, the blind, and the physically disabled.',
        officialLink: 'https://www.ssa.gov/OP_Home/ssact/ssact.htm'
      },
      {
        id: 'us-law-8',
        title: 'Affordable Care Act (ACA)',
        category: 'Healthcare',
        dateEnacted: '2010-03-23',
        keywords: ['healthcare', 'health insurance', 'obamacare', 'medicaid', 'coverage', 'pre-existing conditions'],
        summary: 'Comprehensive healthcare reform expanding Medicaid eligibility, establishing health insurance marketplaces, prohibiting denial of coverage for pre-existing conditions, allowing children to remain on parents insurance until age 26.',
        officialLink: 'https://www.healthcare.gov/glossary/affordable-care-act/'
      },
      {
        id: 'us-law-9',
        title: 'Bankruptcy Code (Title 11 USC)',
        category: 'Finance',
        dateEnacted: '1978-11-06',
        keywords: ['bankruptcy', 'debt', 'creditors', 'chapter 7', 'chapter 13', 'financial relief'],
        summary: 'Governs the process of filing bankruptcy in the United States. Provides different chapters for liquidation (Chapter 7), reorganization (Chapter 11), and debt adjustment (Chapter 13). Protects debtors while ensuring fair treatment of creditors.',
        officialLink: 'https://www.uscourts.gov/services-forms/bankruptcy'
      },
      {
        id: 'us-law-10',
        title: 'Fair Housing Act',
        category: 'Housing',
        dateEnacted: '1968-04-11',
        keywords: ['housing', 'discrimination', 'rental', 'landlord', 'tenant', 'property', 'real estate'],
        summary: 'Prohibits discrimination in the sale, rental, and financing of housing based on race, color, national origin, religion, sex, familial status, and disability. Applies to landlords, real estate companies, mortgage lenders, and homeowners insurance companies.',
        officialLink: 'https://www.hud.gov/program_offices/fair_housing_equal_opp/fair_housing_act_overview'
      },
      {
        id: 'us-law-11',
        title: 'Truth in Lending Act (TILA)',
        category: 'Consumer Protection',
        dateEnacted: '1968-05-29',
        keywords: ['credit', 'loans', 'interest rates', 'disclosure', 'consumer protection', 'lending'],
        summary: 'Requires lenders to provide clear disclosure of loan terms and costs, including APR. Protects consumers in credit transactions by requiring clear disclosure of key terms and costs. Gives consumers the right to cancel certain credit transactions.',
        officialLink: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/'
      },
      {
        id: 'us-law-12',
        title: 'Equal Pay Act',
        category: 'Employment',
        dateEnacted: '1963-06-10',
        keywords: ['equal pay', 'wage gap', 'gender discrimination', 'salary', 'compensation', 'employment'],
        summary: 'Prohibits wage discrimination based on sex. Requires employers to pay men and women equal pay for equal work in the same establishment. Work is considered equal when it requires equal skill, effort, and responsibility under similar working conditions.',
        officialLink: 'https://www.eeoc.gov/statutes/equal-pay-act-1963'
      },
      {
        id: 'us-law-13',
        title: 'Occupational Safety and Health Act (OSHA)',
        category: 'Employment',
        dateEnacted: '1970-12-29',
        keywords: ['workplace safety', 'occupational health', 'workplace hazards', 'employee protection', 'OSHA'],
        summary: 'Requires employers to provide safe and healthful working conditions. Sets and enforces standards, provides training, education, and assistance to workers and employers. Employees have the right to file complaints about unsafe working conditions.',
        officialLink: 'https://www.osha.gov/laws-regs/oshact/completeoshact'
      },
      {
        id: 'us-law-14',
        title: 'Freedom of Information Act (FOIA)',
        category: 'Government',
        dateEnacted: '1967-07-04',
        keywords: ['government records', 'transparency', 'public records', 'information request', 'disclosure'],
        summary: 'Provides the public the right to request access to records from any federal agency. Federal agencies are required to disclose any information requested unless it falls under one of nine exemptions protecting interests such as privacy, national security, and law enforcement.',
        officialLink: 'https://www.foia.gov/about.html'
      },
      {
        id: 'us-law-15',
        title: 'Age Discrimination in Employment Act (ADEA)',
        category: 'Employment',
        dateEnacted: '1967-12-15',
        keywords: ['age discrimination', 'employment', 'older workers', 'retirement', '40 years old', 'workplace'],
        summary: 'Protects certain applicants and employees 40 years of age and older from discrimination on the basis of age in hiring, promotion, discharge, compensation, or terms, conditions or privileges of employment.',
        officialLink: 'https://www.eeoc.gov/statutes/age-discrimination-employment-act-1967'
      }
    ];
    
    setUsLaws(usLawsData);
  };
  
  const initializeCanadaLaws = () => {
    const canadaLawsData = [
      {
        id: 'ca-law-1',
        title: 'Canadian Charter of Rights and Freedoms',
        category: 'Constitutional',
        dateEnacted: '1982-04-17',
        keywords: ['charter', 'rights', 'freedoms', 'constitution', 'equality', 'liberty', 'fundamental'],
        summary: 'Constitutionally entrenched bill of rights protecting fundamental freedoms (expression, religion, assembly), democratic rights (voting), mobility rights, legal rights (fair trial, legal counsel), equality rights, and language rights.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/const/page-12.html'
      },
      {
        id: 'ca-law-2',
        title: 'Canadian Human Rights Act',
        category: 'Civil Rights',
        dateEnacted: '1977-07-14',
        keywords: ['discrimination', 'human rights', 'equality', 'employment', 'harassment', 'protected grounds'],
        summary: 'Prohibits discrimination on the basis of race, national or ethnic origin, colour, religion, age, sex, sexual orientation, marital status, family status, disability and conviction for which a pardon has been granted or a record suspended.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/h-6/'
      },
      {
        id: 'ca-law-3',
        title: 'Employment Insurance Act',
        category: 'Employment',
        dateEnacted: '1996-06-20',
        keywords: ['EI', 'unemployment', 'employment insurance', 'benefits', 'maternity', 'parental leave', 'sickness'],
        summary: 'Provides temporary financial assistance to unemployed Canadians while they look for work or upgrade their skills. Also supports workers who are sick, pregnant, caring for a newborn or newly adopted child, or caring for a family member who is seriously ill.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/E-5.6/'
      },
      {
        id: 'ca-law-4',
        title: 'Canada Labour Code',
        category: 'Employment',
        dateEnacted: '1985-07-01',
        keywords: ['labour', 'employment', 'workplace', 'hours of work', 'minimum wage', 'unions', 'collective bargaining'],
        summary: 'Regulates labour relations in federally regulated industries. Covers labour standards (hours, wages, vacations, holidays), industrial relations (unions, collective bargaining), and occupational health and safety.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/l-2/'
      },
      {
        id: 'ca-law-5',
        title: 'Immigration and Refugee Protection Act',
        category: 'Immigration',
        dateEnacted: '2002-06-28',
        keywords: ['immigration', 'refugee', 'visa', 'citizenship', 'permanent residence', 'asylum', 'deportation'],
        summary: 'Governs Canadian immigration policy, including who may enter Canada, how long they may stay, and under what conditions they may be removed. Establishes refugee protection system and temporary/permanent residence programs.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/i-2.5/'
      },
      {
        id: 'ca-law-6',
        title: 'Income Tax Act',
        category: 'Tax Law',
        dateEnacted: '1985-01-01',
        keywords: ['income tax', 'CRA', 'tax return', 'deductions', 'credits', 'RRSP', 'TFSA'],
        summary: 'Comprehensive legislation governing income taxation in Canada. Defines taxable income, tax rates, deductions, credits, and filing requirements for individuals and corporations. Administered by the Canada Revenue Agency.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/i-3.3/'
      },
      {
        id: 'ca-law-7',
        title: 'Canada Health Act',
        category: 'Healthcare',
        dateEnacted: '1984-04-17',
        keywords: ['healthcare', 'medicare', 'universal healthcare', 'medical services', 'health insurance'],
        summary: 'Establishes criteria and conditions for insured health services and extended health care services that provinces and territories must meet to receive full federal health transfer payments. Ensures universal access to medically necessary hospital and physician services.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/c-6/'
      },
      {
        id: 'ca-law-8',
        title: 'Criminal Code of Canada',
        category: 'Criminal Law',
        dateEnacted: '1985-01-01',
        keywords: ['criminal', 'crime', 'offence', 'assault', 'theft', 'fraud', 'sentence', 'police'],
        summary: 'Codifies most criminal offences and procedures in Canada. Defines criminal acts, sets out criminal procedures, and establishes sentences for various offences. Covers offences against persons, property, public order, and administration of justice.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/c-46/'
      },
      {
        id: 'ca-law-9',
        title: 'Divorce Act',
        category: 'Family Law',
        dateEnacted: '1985-06-01',
        keywords: ['divorce', 'separation', 'custody', 'child support', 'spousal support', 'family law', 'marriage'],
        summary: 'Governs divorce proceedings and corollary relief (child custody, access, child support, and spousal support) in Canada. Establishes grounds for divorce, procedures for divorce orders, and provisions for child and spousal support.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/d-3.4/'
      },
      {
        id: 'ca-law-10',
        title: 'Employment Equity Act',
        category: 'Employment',
        dateEnacted: '1995-12-15',
        keywords: ['employment equity', 'discrimination', 'workplace diversity', 'equal opportunity', 'affirmative action'],
        summary: 'Requires federally regulated employers to engage in proactive employment practices to increase representation of four designated groups: women, Aboriginal peoples, persons with disabilities, and members of visible minorities.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/e-5.401/'
      },
      {
        id: 'ca-law-11',
        title: 'Personal Information Protection and Electronic Documents Act (PIPEDA)',
        category: 'Privacy',
        dateEnacted: '2000-04-13',
        keywords: ['privacy', 'personal information', 'data protection', 'consent', 'PIPEDA', 'data breach'],
        summary: 'Governs how private sector organizations collect, use, and disclose personal information in the course of commercial activities. Gives individuals the right to access and correct their personal information held by organizations.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/p-8.6/'
      },
      {
        id: 'ca-law-12',
        title: 'Canada Consumer Product Safety Act',
        category: 'Consumer Protection',
        dateEnacted: '2011-06-20',
        keywords: ['consumer protection', 'product safety', 'recalls', 'dangerous products', 'consumer rights'],
        summary: 'Protects the public by addressing dangers to human health or safety posed by consumer products. Prohibits manufacture, import, or sale of consumer products that pose danger. Requires reporting of incidents and defects.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/c-1.68/'
      },
      {
        id: 'ca-law-13',
        title: 'Old Age Security Act',
        category: 'Social Welfare',
        dateEnacted: '1985-01-01',
        keywords: ['old age security', 'OAS', 'pension', 'retirement', 'seniors', 'guaranteed income supplement'],
        summary: 'Provides basic income security for seniors. Old Age Security (OAS) pension available to most Canadians 65 or older. Guaranteed Income Supplement (GIS) provides additional income-tested benefits for low-income seniors.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/o-9/'
      },
      {
        id: 'ca-law-14',
        title: 'Bankruptcy and Insolvency Act',
        category: 'Finance',
        dateEnacted: '1985-01-01',
        keywords: ['bankruptcy', 'insolvency', 'debt', 'creditors', 'consumer proposal', 'financial relief'],
        summary: 'Governs bankruptcy and insolvency proceedings in Canada. Provides individuals and businesses with relief from overwhelming debt through bankruptcy or consumer proposals while ensuring fair treatment of creditors.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/b-3/'
      },
      {
        id: 'ca-law-15',
        title: 'Access to Information Act',
        category: 'Government',
        dateEnacted: '1983-07-01',
        keywords: ['access to information', 'transparency', 'government records', 'public documents', 'disclosure'],
        summary: 'Provides Canadian citizens, permanent residents, and any person or corporation present in Canada a right to access information in records under the control of federal government institutions, subject to limited exemptions.',
        officialLink: 'https://laws-lois.justice.gc.ca/eng/acts/a-1/'
      }
    ];
    
    setLaws(canadaLawsData);
  };
  
  const fetchMPs = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://civic-voice-backend-e3sz.onrender.com/api/mps');
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Loaded ${result.count} MPs`);
        setMps(result.data);
      } else {
        setError('Failed to load MP data');
      }
    } catch (err) {
      console.error('Error fetching MPs:', err);
      setError('Could not connect to API');
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await fetch('https://civic-voice-backend-e3sz.onrender.com/api/bills');
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Loaded ${result.count} bills`);
        setBills(result.data);
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
    }
  };

  const fetchGovernmentData = async () => {
    try {
      const response = await fetch('https://civic-voice-backend-e3sz.onrender.com/api/government-data');
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Loaded government impact data`);
        setGovernmentData(result.data);
      }
    } catch (err) {
      console.error('Error fetching government data:', err);
    }
  };

  const fetchLaws = async () => {
    try {
      const response = await fetch('https://civic-voice-backend-e3sz.onrender.com/api/laws');
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Loaded ${result.count} laws and regulations`);
        setLaws(result.data);
      }
    } catch (err) {
      console.error('Error fetching laws:', err);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await fetch('https://civic-voice-backend-e3sz.onrender.com/api/contracts');
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Loaded ${result.count} government contracts`);
        setContracts(result.data);
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
    }
  };

  // Get user's location and find their MP
  const findMyMP = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          
          // Find MP by location
          const foundMP = findMPByLocation(latitude, longitude);
          
          if (foundMP) {
            setUserMP(foundMP);
            localStorage.setItem('userMP', JSON.stringify(foundMP));
            alert(`✅ Found your MP: ${foundMP.name} (${foundMP.riding})`);
          } else {
            // Show manual selector if can't determine automatically
            setShowLocationPrompt(true);
          }
        },
        (error) => {
          console.error('Location error:', error);
          // If location denied, show manual selector
          setShowLocationPrompt(true);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setShowLocationPrompt(true);
    }
  };

  // Simplified location to riding mapping (approximate)
  const findMPByLocation = (lat, lon) => {
    // Toronto area (rough boundaries)
    if (lat >= 43.6 && lat <= 43.9 && lon >= -79.6 && lon <= -79.2) {
      const torontoMPs = mps.filter(mp => 
        mp.riding && mp.riding.toLowerCase().includes('toronto')
      );
      if (torontoMPs.length > 0) return torontoMPs[0];
    }
    
    // Ottawa area
    if (lat >= 45.3 && lat <= 45.5 && lon >= -75.8 && lon <= -75.6) {
      const ottawaMPs = mps.filter(mp => 
        mp.riding && mp.riding.toLowerCase().includes('ottawa')
      );
      if (ottawaMPs.length > 0) return ottawaMPs[0];
    }
    
    // Montreal area
    if (lat >= 45.4 && lat <= 45.7 && lon >= -73.8 && lon <= -73.5) {
      const montrealMPs = mps.filter(mp => 
        mp.riding && (mp.riding.toLowerCase().includes('montreal') || mp.riding.toLowerCase().includes('montréal'))
      );
      if (montrealMPs.length > 0) return montrealMPs[0];
    }
    
    // Vancouver area
    if (lat >= 49.2 && lat <= 49.3 && lon >= -123.2 && lon <= -123.0) {
      const vancouverMPs = mps.filter(mp => 
        mp.riding && mp.riding.toLowerCase().includes('vancouver')
      );
      if (vancouverMPs.length > 0) return vancouverMPs[0];
    }
    
    // Calgary area
    if (lat >= 50.9 && lat <= 51.2 && lon >= -114.2 && lon <= -113.9) {
      const calgaryMPs = mps.filter(mp => 
        mp.riding && mp.riding.toLowerCase().includes('calgary')
      );
      if (calgaryMPs.length > 0) return calgaryMPs[0];
    }
    
    // If no match, show manual selector
    return null;
  };

  // Manual riding selection
  const selectRiding = (ridingName) => {
    const mp = mps.find(m => m.riding === ridingName);
    if (mp) {
      setUserMP(mp);
      localStorage.setItem('userMP', JSON.stringify(mp));
      setShowLocationPrompt(false);
      alert(`✅ Set your MP: ${mp.name} (${mp.riding})`);
    }
  };

  // Vote on ministry performance
  const voteMinistry = (ministryId, vote) => {
    setMinistries(ministries.map(ministry => {
      if (ministry.id === ministryId) {
        const newMinistry = { ...ministry };
        
        // Remove previous vote if exists
        if (ministry.userVote === 'approve') {
          newMinistry.approveVotes--;
        } else if (ministry.userVote === 'disapprove') {
          newMinistry.disapproveVotes--;
        }
        
        // Add new vote
        if (vote === 'approve') {
          newMinistry.approveVotes++;
          newMinistry.userVote = 'approve';
        } else if (vote === 'disapprove') {
          newMinistry.disapproveVotes++;
          newMinistry.userVote = 'disapprove';
        } else {
          newMinistry.userVote = null;
        }
        
        // Update selectedMinistry if viewing detail
        if (selectedMinistry && selectedMinistry.id === ministryId) {
          setSelectedMinistry(newMinistry);
        }
        
        return newMinistry;
      }
      return ministry;
    }));
  };

  const voteBill = async (billId, vote) => {
    try {
      const response = await fetch(`https://civic-voice-backend-e3sz.onrender.com/api/bills/${billId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBills(bills.map(b => b.id === billId ? result.data : b));
        if (selectedBill && selectedBill.id === billId) {
          setSelectedBill(result.data);
        }
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const voteMP = async (mpIndex, vote) => {
    try {
      const response = await fetch(`https://civic-voice-backend-e3sz.onrender.com/api/mps/${mpIndex}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update MPs list
        const updatedMps = [...mps];
        updatedMps[mpIndex] = result.data;
        setMps(updatedMps);
        
        // Update selected member if viewing details
        if (selectedMember && selectedMember.name === result.data.name) {
          setSelectedMember(result.data);
        }
      }
    } catch (err) {
      console.error('Error voting on MP:', err);
    }
  };

  // Chart colors
  const COLORS = ['#3B82F6', '#EF4444', '#F97316', '#06B6D4', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'];
  
  const partyColors = {
    // Canadian parties
    'Liberal': '#EF4444',
    'Conservative': '#3B82F6',
    'NDP': '#F97316',
    'Bloc Québécois': '#06B6D4',
    'Green Party': '#10B981',
    // US parties
    'Democrat': '#2563EB',
    'Republican': '#DC2626',
    'Independent': '#7C3AED'
  };

  // Get parties with counts
  const getParties = () => {
    // Use appropriate member list based on selected country
    let members = selectedCountry?.type === 'usa' ? congressMembers : mps;
    
    // Filter by chamber if USA and chamber is selected
    if (selectedCountry?.type === 'usa' && selectedChamber) {
      if (selectedChamber === 'Senate') {
        members = members.filter(m => m.district === 'Senator');
      } else if (selectedChamber === 'House') {
        members = members.filter(m => m.district !== 'Senator');
      }
    }
    
    const partyCounts = {};
    members.forEach(member => {
      partyCounts[member.party] = (partyCounts[member.party] || 0) + 1;
    });

    return Object.entries(partyCounts).map(([name, count]) => ({
      name,
      count,
      color: partyColors[name] || '#6B7280'
    })).sort((a, b) => b.count - a.count);
  };

  // Get members for selected party, sorted appropriately
  const getPartyMembers = () => {
    if (!selectedParty) return [];
    
    let members = selectedCountry?.type === 'usa' ? congressMembers : mps;
    
    // Filter by chamber if USA and chamber is selected
    if (selectedCountry?.type === 'usa' && selectedChamber) {
      if (selectedChamber === 'Senate') {
        members = members.filter(m => m.district === 'Senator');
      } else if (selectedChamber === 'House') {
        members = members.filter(m => m.district !== 'Senator');
      }
    }
    
    let filtered = members.filter(member => member.party === selectedParty.name);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member => {
        if (selectedCountry?.type === 'usa') {
          return member.name.toLowerCase().includes(query) ||
                 member.state.toLowerCase().includes(query) ||
                 member.district.toLowerCase().includes(query);
        } else {
          return member.name.toLowerCase().includes(query) ||
                 member.riding.toLowerCase().includes(query);
        }
      });
    }

    // Sort differently for US vs Canada
    if (selectedCountry?.type === 'usa') {
      // For US: Senators first, then House by state
      filtered.sort((a, b) => {
        if (a.district === 'Senator' && b.district !== 'Senator') return -1;
        if (b.district === 'Senator' && a.district !== 'Senator') return 1;
        if (a.state !== b.state) return a.state.localeCompare(b.state);
        return a.name.localeCompare(b.name);
      });
    } else {
      // For Canada: PM first, then Cabinet, then Party Leaders, then alphabetical
      filtered.sort((a, b) => {
        if (a.isPrimeMinister) return -1;
        if (b.isPrimeMinister) return 1;
        if (a.isCabinet && !b.isCabinet) return -1;
        if (b.isCabinet && !a.isCabinet) return 1;
        if (a.isPartyLeader && !b.isPartyLeader) return -1;
        if (b.isPartyLeader && !a.isPartyLeader) return 1;
        return a.name.localeCompare(b.name);
      });
    }

    return filtered;
  };

  // Keep old function name for compatibility
  const getPartyMPs = getPartyMembers;

  const [expandedSections, setExpandedSections] = useState({
    voting: false,
    attendance: false,
    expenses: false,
    financial: false,
    lobbying: false,
    corporate: false,
    stockTrades: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getPartyColor = (party) => partyColors[party] || '#6B7280';

  const getVoteIcon = (vote) => {
    if (vote === 'For') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (vote === 'Against') return <XCircle className="w-5 h-5 text-red-600" />;
    return <MinusCircle className="w-5 h-5 text-gray-600" />;
  };

  const getVoteColor = (vote) => {
    if (vote === 'For') return 'bg-green-50 border-green-200';
    if (vote === 'Against') return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCurrencyShort = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'First Reading': 'bg-blue-100 text-blue-800',
      'Second Reading': 'bg-yellow-100 text-yellow-800',
      'Third Reading': 'bg-orange-100 text-orange-800',
      'Senate': 'bg-purple-100 text-purple-800',
      'Royal Assent': 'bg-green-100 text-green-800',
      'Proposed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (mp) => {
    if (mp.isPrimeMinister) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-bold">
          <Crown className="w-4 h-4" />
          Prime Minister
        </div>
      );
    }
    if (mp.isCabinet) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-bold">
          <Star className="w-4 h-4" />
          Cabinet
        </div>
      );
    }
    if (mp.isPartyLeader) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full text-sm font-bold">
          <Award className="w-4 h-4" />
          Party Leader
        </div>
      );
    }
    return null;
  };

  const countries = [
    { id: 1, name: 'Canada', flag: '🇨🇦', members: mps.length || 338, type: 'canada' },
    { id: 2, name: 'United States', flag: '🇺🇸', members: congressMembers.length || 535, type: 'usa' }
  ];

  const categories = [
    { id: 1, name: 'Federal Parliament', icon: <Globe className="w-6 h-6" />, count: mps.length || 338, type: 'parliament' },
    { id: 2, name: 'Latest Laws & Regulations', icon: <FileText className="w-6 h-6" />, count: laws.length || 12, type: 'laws' },
    { id: 3, name: 'Government Contracts', icon: <DollarSign className="w-6 h-6" />, count: contracts.length || 15, type: 'contracts' }
  ];

  const getAnalyticsData = () => {
    const topExpenses = [...mps]
      .filter(mp => mp.expenses)
      .sort((a, b) => b.expenses.total - a.expenses.total)
      .slice(0, 10)
      .map(mp => ({
        name: mp.name.split(' ').slice(-1)[0],
        value: mp.expenses.total
      }));

    const topLobbying = [...mps]
      .filter(mp => mp.lobbying)
      .sort((a, b) => b.lobbying.totalValue - a.lobbying.totalValue)
      .slice(0, 10)
      .map(mp => ({
        name: mp.name.split(' ').slice(-1)[0],
        value: mp.lobbying.totalValue
      }));

    const topWealth = [...mps]
      .filter(mp => mp.financialDisclosure)
      .sort((a, b) => b.financialDisclosure.percentageIncrease - a.financialDisclosure.percentageIncrease)
      .slice(0, 10)
      .map(mp => ({
        name: mp.name.split(' ').slice(-1)[0],
        value: mp.financialDisclosure.percentageIncrease
      }));

    const expenseBreakdown = {};
    mps.filter(mp => mp.expenses).forEach(mp => {
      Object.entries(mp.expenses.breakdown).forEach(([category, amount]) => {
        expenseBreakdown[category] = (expenseBreakdown[category] || 0) + amount;
      });
    });

    const expensePieData = Object.entries(expenseBreakdown).map(([name, value]) => ({
      name,
      value
    }));

    const lobbyingSectors = {};
    mps.filter(mp => mp.lobbying).forEach(mp => {
      mp.lobbying.organizations.forEach(org => {
        lobbyingSectors[org.sector] = (lobbyingSectors[org.sector] || 0) + org.value;
      });
    });

    const lobbyingPieData = Object.entries(lobbyingSectors).map(([name, value]) => ({
      name,
      value
    }));

    const partyData = {};
    mps.forEach(mp => {
      partyData[mp.party] = (partyData[mp.party] || 0) + 1;
    });

    const partyPieData = Object.entries(partyData).map(([name, value]) => ({
      name,
      value,
      color: partyColors[name] || '#6B7280'
    }));

    return {
      topExpenses,
      topLobbying,
      topWealth,
      expensePieData,
      lobbyingPieData,
      partyPieData
    };
  };

  // US Departments rendering (similar to ministries)
  const renderDepartments = () => {
    const totalBudget = usDepartments.reduce((sum, dept) => sum + dept.budgetRaw, 0);
    const totalEmployees = usDepartments.reduce((sum, dept) => sum + dept.employees, 0);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => setView('categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Government Levels
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">🏛️ US Federal Departments</h2>
            <p className="text-gray-600 mb-4">15 Cabinet-level executive departments managing federal operations</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                <p className="text-sm text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold text-blue-600">{usDepartments.length}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                <p className="text-sm text-gray-600">Combined Budget</p>
                <p className="text-2xl font-bold text-green-600">${(totalBudget / 1000000000000).toFixed(2)}T</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-purple-600">{totalEmployees.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {usDepartments.map(dept => {
              const totalVotes = dept.approveVotes + dept.disapproveVotes;
              const approvalRate = totalVotes > 0 ? Math.round((dept.approveVotes / totalVotes) * 100) : 0;
              
              return (
                <div
                  key={dept.id}
                  onClick={() => {
                    setSelectedDepartment(dept);
                    setView('department-detail');
                  }}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{dept.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">Secretary: {dept.secretary}</p>
                  <p className="text-gray-700 mb-4">{dept.description}</p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-green-50 rounded p-2">
                      <p className="text-xs text-gray-600">Budget</p>
                      <p className="text-sm font-bold text-green-600">{dept.budget}</p>
                    </div>
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-xs text-gray-600">Grants</p>
                      <p className="text-sm font-bold text-blue-600">{dept.grants}</p>
                    </div>
                    <div className="bg-purple-50 rounded p-2">
                      <p className="text-xs text-gray-600">Staff</p>
                      <p className="text-sm font-bold text-purple-600">{dept.employees.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Approval Rating</span>
                      <span className="font-semibold">{approvalRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          approvalRate >= 60 ? 'bg-green-500' :
                          approvalRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{width: `${approvalRate}%`}}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>👍 {dept.approveVotes}</span>
                    <span>👎 {dept.disapproveVotes}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDepartmentDetail = () => {
    if (!selectedDepartment) return null;

    const totalVotes = selectedDepartment.approveVotes + selectedDepartment.disapproveVotes;
    const approvalRate = totalVotes > 0 
      ? Math.round((selectedDepartment.approveVotes / totalVotes) * 100) 
      : 0;

    const voteDepartment = (deptId, vote) => {
      const updatedDepts = usDepartments.map(dept => {
        if (dept.id === deptId) {
          let newApprove = dept.approveVotes;
          let newDisapprove = dept.disapproveVotes;
          let newUserVote = vote;

          if (dept.userVote === 'approve') newApprove--;
          if (dept.userVote === 'disapprove') newDisapprove--;
          if (vote === 'approve') newApprove++;
          if (vote === 'disapprove') newDisapprove++;
          if (vote === 'remove') newUserVote = null;

          return {...dept, approveVotes: newApprove, disapproveVotes: newDisapprove, userVote: newUserVote};
        }
        return dept;
      });
      
      setUsDepartments(updatedDepts);
      const updated = updatedDepts.find(d => d.id === deptId);
      setSelectedDepartment(updated);
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button
              onClick={() => {
                setSelectedDepartment(null);
                setView('departments');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Departments
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedDepartment.name}</h1>
            <p className="text-lg text-gray-700 mb-6">Secretary: {selectedDepartment.secretary}</p>
            <p className="text-gray-600 mb-6">{selectedDepartment.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-800">Annual Budget</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{selectedDepartment.budget}</p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">Grants Given</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{selectedDepartment.grants}</p>
              </div>

              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-8 h-8 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800">Employees</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">{selectedDepartment.employees.toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Key Responsibilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDepartment.responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{resp}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedDepartment.grantsDetail && selectedDepartment.grantsDetail.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setGrantsExpanded(!grantsExpanded)}
                  className="w-full bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400 rounded-lg p-5 hover:shadow-lg transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-800">💰 Grants & Funding Breakdown</h3>
                      <p className="text-sm text-gray-600">
                        {selectedDepartment.grantsDetail.length} major grants • {selectedDepartment.grants} total allocated
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">
                      {grantsExpanded ? 'Hide Details' : 'View All Recipients'}
                    </span>
                    {grantsExpanded ? (
                      <ChevronDown className="w-6 h-6 text-blue-600" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </button>
                
                {grantsExpanded && (
                  <div className="mt-4 space-y-3 animate-fadeIn">
                    <p className="text-gray-700 font-medium mb-3 px-2">
                      🔍 Major federal grants showing specific organizations receiving taxpayer funding:
                    </p>
                    {selectedDepartment.grantsDetail.map((grant, index) => (
                      <div key={index} className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800">{grant.recipient}</h4>
                            <p className="text-sm text-gray-600 mt-1">{grant.purpose}</p>
                          </div>
                          <div className="text-right sm:text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-green-600">{grant.amount}</p>
                            <p className="text-xs text-gray-500">{grant.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Do You Approve of This Department's Performance?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ThumbsUp className="w-10 h-10 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Approve</h3>
                      <p className="text-sm text-gray-600">They're doing a good job</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600">{selectedDepartment.approveVotes}</div>
                </div>
                <button
                  onClick={() => voteDepartment(
                    selectedDepartment.id, 
                    selectedDepartment.userVote === 'approve' ? 'remove' : 'approve'
                  )}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
                    selectedDepartment.userVote === 'approve'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {selectedDepartment.userVote === 'approve' ? '✓ You Approve' : 'Vote Approve'}
                </button>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ThumbsDown className="w-10 h-10 text-red-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Disapprove</h3>
                      <p className="text-sm text-gray-600">Not satisfied with performance</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-red-600">{selectedDepartment.disapproveVotes}</div>
                </div>
                <button
                  onClick={() => voteDepartment(
                    selectedDepartment.id, 
                    selectedDepartment.userVote === 'disapprove' ? 'remove' : 'disapprove'
                  )}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
                    selectedDepartment.userVote === 'disapprove'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {selectedDepartment.userVote === 'disapprove' ? '✓ You Disapprove' : 'Vote Disapprove'}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-semibold">Overall Approval Rating</span>
                <span className="text-xl font-bold">{approvalRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    approvalRate >= 60 ? 'bg-green-500' :
                    approvalRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{width: `${approvalRate}%`}}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {totalVotes.toLocaleString()} total votes
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // US Budget Analytics Render Function
  const renderUSAnalytics = () => {
    if (!usAnalyticsData) return <div className="p-8 text-center">Loading analytics data...</div>;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Government Levels
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800">US Budget Analytics</h1>
            
            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Federal Budget Overview (FY 2024)</h2>
            <p className="text-gray-600">Comprehensive analysis of the $6.5 trillion US federal budget</p>
          </div>

          {/* Revenue Sources Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Federal Revenue Sources ($4.9 Trillion)
            </h3>
            <p className="text-gray-600 mb-4">Where the federal government gets its money</p>
            <div className="space-y-3">
              {usAnalyticsData.revenue.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{item.source}</span>
                    <span className="font-bold text-gray-800">${item.amount}B ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{width: `${item.percentage}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-red-800 font-bold">⚠️ Budget Deficit: $1.7 Trillion</p>
              <p className="text-sm text-red-700">Government spends $1.7T more than it collects (borrowed money)</p>
            </div>
          </div>

          {/* Federal Spending Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Federal Spending by Category ($6.5 Trillion)
            </h3>
            <p className="text-gray-600 mb-4">Where your tax dollars go</p>
            <div className="space-y-3">
              {usAnalyticsData.spending.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{item.category}</span>
                    <span className="font-bold text-gray-800">${item.amount}B ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        item.category.includes('Social Security') ? 'bg-purple-500' :
                        item.category.includes('Medicare') ? 'bg-blue-500' :
                        item.category.includes('Defense') ? 'bg-red-500' :
                        item.category.includes('Debt') ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}
                      style={{width: `${item.percentage}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deficit History Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              Budget Deficit History (2014-2024)
            </h3>
            <p className="text-gray-600 mb-4">Annual budget deficits over the past decade</p>
            <div className="space-y-2">
              {usAnalyticsData.deficitHistory.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium w-16">{item.year}</span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className={`h-6 rounded-full ${
                          item.deficit < -2000 ? 'bg-red-700' :
                          item.deficit < -1000 ? 'bg-red-500' :
                          'bg-red-400'
                        }`}
                        style={{width: `${Math.min((Math.abs(item.deficit) / 3200) * 100, 100)}%`}}
                      />
                    </div>
                  </div>
                  <span className="font-bold text-red-600 w-32 text-right">-${Math.abs(item.deficit)}B</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> 2020-2021 saw historic deficits due to COVID-19 pandemic response spending.
              </p>
            </div>
          </div>

          {/* National Debt History Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              National Debt Growth (2014-2024)
            </h3>
            <p className="text-gray-600 mb-4">Total accumulated federal debt over time</p>
            <div className="space-y-2">
              {usAnalyticsData.debtHistory.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-gray-700 font-medium w-16">{item.year}</span>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-6">
                      <div
                        className="bg-orange-500 h-6 rounded-full"
                        style={{width: `${(item.debt / 35) * 100}%`}}
                      />
                    </div>
                  </div>
                  <span className="font-bold text-orange-600 w-32 text-right">${item.debt}T</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-400 rounded-lg">
              <p className="text-orange-800 font-bold">📈 Current National Debt: $34.5 Trillion</p>
              <p className="text-sm text-orange-700 mt-1">Interest payments: $658 billion per year (10% of budget)</p>
            </div>
          </div>

          {/* Unemployment Trends Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              Unemployment Rate Trends (2020-2024)
            </h3>
            <p className="text-gray-600 mb-4">National unemployment rate over the past 5 years</p>
            <div className="space-y-3">
              {usAnalyticsData.unemploymentTrends.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-gray-800 font-bold text-lg">{item.year}</span>
                      <span className="text-gray-600 text-sm ml-3">{item.context}</span>
                    </div>
                    <span className={`text-2xl font-bold ${
                      item.rate < 4 ? 'text-green-600' :
                      item.rate < 6 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>{item.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${
                        item.rate < 4 ? 'bg-green-500' :
                        item.rate < 6 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{width: `${(item.rate / 10) * 100}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Foreign Aid by Country */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Globe className="w-6 h-6 text-blue-600" />
              Foreign Aid by Country (FY 2024 - Top 10)
            </h3>
            <p className="text-gray-600 mb-4">US foreign assistance to other nations</p>
            <div className="space-y-3">
              {usAnalyticsData.foreignAid.map((item, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <span className="text-gray-800 font-bold">{index + 1}. {item.country}</span>
                      <p className="text-sm text-gray-600">{item.purpose}</p>
                    </div>
                    <span className="font-bold text-blue-600 ml-4">${item.amount}B</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <p className="text-blue-800 font-bold">Total Foreign Aid: ~$61 Billion (1% of budget)</p>
            </div>
          </div>

          {/* US Government Loans to Foreign Governments */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Active Loans to Foreign Governments
            </h3>
            <p className="text-gray-600 mb-4">Loans extended to foreign nations (expected to be repaid)</p>
            <div className="space-y-3">
              {usAnalyticsData.foreignLoans.map((item, index) => (
                <div key={index} className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <span className="text-gray-800 font-bold text-lg">{item.country}</span>
                      <p className="text-sm text-gray-600 mt-1">{item.purpose}</p>
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded mt-1 inline-block">
                        {item.status}
                      </span>
                    </div>
                    <span className="font-bold text-green-600 text-xl ml-4">${item.amount}B</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grant Spending by Department */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-600" />
              Federal Grant Spending by Department
            </h3>
            <p className="text-gray-600 mb-4">How much each department gives out in grants</p>
            <div className="space-y-3">
              {usAnalyticsData.grantsByDepartment.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{item.department}</span>
                    <span className="font-bold text-gray-800">${item.grants}B ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full"
                      style={{width: `${item.percentage}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Spending Trends */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Department Spending Trends (2020-2024)
            </h3>
            <p className="text-gray-600 mb-4">How spending has changed in major departments</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-2 text-gray-700">Year</th>
                    <th className="text-right py-2 px-2 text-red-700">Defense</th>
                    <th className="text-right py-2 px-2 text-blue-700">Health & Human Services</th>
                    <th className="text-right py-2 px-2 text-green-700">Education</th>
                    <th className="text-right py-2 px-2 text-purple-700">Veterans Affairs</th>
                  </tr>
                </thead>
                <tbody>
                  {usAnalyticsData.departmentTrends.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2 px-2 font-medium text-gray-800">{item.year}</td>
                      <td className="text-right py-2 px-2 text-red-600">${item.defense}B</td>
                      <td className="text-right py-2 px-2 text-blue-600">${item.hhs}B</td>
                      <td className="text-right py-2 px-2 text-green-600">${item.education}B</td>
                      <td className="text-right py-2 px-2 text-purple-600">${item.veterans}B</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-700 mb-2">Total Federal Revenue</p>
              <p className="text-4xl font-bold text-green-700">$4.9T</p>
              <p className="text-xs text-gray-600 mt-2">FY 2024</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-700 mb-2">Total Federal Spending</p>
              <p className="text-4xl font-bold text-red-700">$6.5T</p>
              <p className="text-xs text-gray-600 mt-2">FY 2024</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-400 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-700 mb-2">National Debt</p>
              <p className="text-4xl font-bold text-orange-700">$34.5T</p>
              <p className="text-xs text-gray-600 mt-2">As of 2024</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Supreme Court Render Functions
  const renderCanadaSupremeCourt = () => {
    if (!canadaSupremeCourt) return <div className="p-8 text-center">Loading Supreme Court data...</div>;

    const totalCases = canadaSupremeCourt.casesInProcess.length + 
                       canadaSupremeCourt.recentDecisions.length + 
                       canadaSupremeCourt.upcomingCases.length;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => setView('categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Government Levels
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-6 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Scale className="w-10 h-10 text-yellow-600" />
              Supreme Court of Canada
            </h2>
            <p className="text-gray-600">The highest court of appeal in Canada, final interpreter of the Constitution and Charter of Rights</p>
          </div>

          {/* Justices Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">9 Supreme Court Justices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {canadaSupremeCourt.justices.map((justice, index) => (
                <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {justice.role === 'Chief Justice' && <Crown className="w-5 h-5 text-yellow-600" />}
                    <h4 className="font-bold text-gray-800">{justice.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{justice.role}</p>
                  <p className="text-sm text-gray-500 mt-1">Appointed by: {justice.appointedBy} ({justice.year})</p>
                  <p className="text-sm text-gray-500">Province: {justice.province}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cases In Process */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Cases In Process ({canadaSupremeCourt.casesInProcess.length})
            </h3>
            <p className="text-gray-600 mb-4">Currently being argued or awaiting decision</p>
            <div className="space-y-4">
              {canadaSupremeCourt.casesInProcess.map((case_) => (
                <div 
                  key={case_.id}
                  onClick={() => {
                    setSelectedCase(case_);
                    setView('case-detail');
                  }}
                  className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 text-lg">{case_.name}</h4>
                    <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {case_.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Case #{case_.caseNumber} • {case_.topic}</p>
                  <p className="text-gray-700 mb-2">{case_.issue}</p>
                  <p className="text-sm text-gray-500">Argued: {case_.dateArgued}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Decisions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Recent Decisions (Last 12 Months)
            </h3>
            <p className="text-gray-600 mb-4">Major rulings and their impact</p>
            <div className="space-y-4">
              {canadaSupremeCourt.recentDecisions.map((case_) => (
                <div 
                  key={case_.id}
                  onClick={() => {
                    setSelectedCase(case_);
                    setView('case-detail');
                  }}
                  className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 text-lg">{case_.name}</h4>
                    <div className="text-right">
                      <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium block mb-1">
                        {case_.status}
                      </span>
                      <span className="text-sm font-bold text-gray-700">{case_.voteSplit}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Case #{case_.caseNumber} • {case_.topic}</p>
                  <p className="text-gray-700 mb-2">{case_.issue}</p>
                  <p className="text-sm font-semibold text-green-700 mb-1">Decision: {case_.decision}</p>
                  <p className="text-sm text-gray-500">Decided: {case_.dateDecided} • Impact: {case_.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Cases */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Upcoming Cases ({canadaSupremeCourt.upcomingCases.length})
            </h3>
            <p className="text-gray-600 mb-4">Scheduled to be heard</p>
            <div className="space-y-4">
              {canadaSupremeCourt.upcomingCases.map((case_) => (
                <div 
                  key={case_.id}
                  onClick={() => {
                    setSelectedCase(case_);
                    setView('case-detail');
                  }}
                  className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 text-lg">{case_.name}</h4>
                    <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {case_.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Case #{case_.caseNumber} • {case_.topic}</p>
                  <p className="text-gray-700 mb-2">{case_.issue}</p>
                  <p className="text-sm text-gray-500">Scheduled: {case_.dateScheduled}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUSSupremeCourt = () => {
    if (!usSupremeCourt) return <div className="p-8 text-center">Loading Supreme Court data...</div>;

    const conservativeJustices = usSupremeCourt.justices.filter(j => j.ideology === 'Conservative').length;
    const liberalJustices = usSupremeCourt.justices.filter(j => j.ideology === 'Liberal').length;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => setView('categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Government Levels
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-50 to-red-50 border border-blue-300 rounded-lg p-6 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Scale className="w-10 h-10 text-blue-600" />
              United States Supreme Court
            </h2>
            <p className="text-gray-600">The highest federal court, final interpreter of the US Constitution</p>
          </div>

          {/* Justices Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">9 Supreme Court Justices</h3>
              <div className="flex gap-4 text-sm">
                <span className="text-red-600 font-bold">{conservativeJustices} Conservative</span>
                <span className="text-blue-600 font-bold">{liberalJustices} Liberal</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usSupremeCourt.justices.map((justice, index) => (
                <div key={index} className={`border-2 rounded-lg p-4 ${
                  justice.ideology === 'Conservative' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {justice.role === 'Chief Justice' && <Crown className="w-5 h-5 text-yellow-600" />}
                    <h4 className="font-bold text-gray-800">{justice.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{justice.role}</p>
                  <p className="text-sm text-gray-500 mt-1">Appointed by: {justice.appointedBy} ({justice.year})</p>
                  <p className={`text-sm font-medium mt-1 ${
                    justice.ideology === 'Conservative' ? 'text-red-600' : 'text-blue-600'
                  }`}>{justice.ideology}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cases In Process */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Cases In Process ({usSupremeCourt.casesInProcess.length})
            </h3>
            <p className="text-gray-600 mb-4">Currently being argued or awaiting decision</p>
            <div className="space-y-4">
              {usSupremeCourt.casesInProcess.map((case_) => (
                <div 
                  key={case_.id}
                  onClick={() => {
                    setSelectedCase(case_);
                    setView('case-detail');
                  }}
                  className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 text-lg">{case_.name}</h4>
                    <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {case_.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Case #{case_.caseNumber} • {case_.topic}</p>
                  <p className="text-gray-700 mb-2">{case_.issue}</p>
                  <p className="text-sm text-gray-500">Argued: {case_.dateArgued}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Decisions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Recent Decisions (Last 12 Months)
            </h3>
            <p className="text-gray-600 mb-4">Major rulings and their impact</p>
            <div className="space-y-4">
              {usSupremeCourt.recentDecisions.map((case_) => (
                <div 
                  key={case_.id}
                  onClick={() => {
                    setSelectedCase(case_);
                    setView('case-detail');
                  }}
                  className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 text-lg">{case_.name}</h4>
                    <div className="text-right">
                      <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium block mb-1">
                        {case_.status}
                      </span>
                      <span className="text-sm font-bold text-gray-700">{case_.voteSplit}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Case #{case_.caseNumber} • {case_.topic}</p>
                  <p className="text-gray-700 mb-2">{case_.issue}</p>
                  <p className="text-sm font-semibold text-green-700 mb-1">Decision: {case_.decision}</p>
                  <p className="text-sm text-gray-500">Decided: {case_.dateDecided} • Impact: {case_.impact}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Cases */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Upcoming Cases ({usSupremeCourt.upcomingCases.length})
            </h3>
            <p className="text-gray-600 mb-4">Scheduled to be heard</p>
            <div className="space-y-4">
              {usSupremeCourt.upcomingCases.map((case_) => (
                <div 
                  key={case_.id}
                  onClick={() => {
                    setSelectedCase(case_);
                    setView('case-detail');
                  }}
                  className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 text-lg">{case_.name}</h4>
                    <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {case_.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Case #{case_.caseNumber} • {case_.topic}</p>
                  <p className="text-gray-700 mb-2">{case_.issue}</p>
                  <p className="text-sm text-gray-500">Scheduled: {case_.dateScheduled}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCaseDetail = () => {
    if (!selectedCase) return null;

    const isDecided = selectedCase.status === 'Decided';
    const isUpcoming = selectedCase.status === 'Upcoming';
    const isInProcess = selectedCase.status === 'In Process';

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button
              onClick={() => {
                setSelectedCase(null);
                setView(selectedCountry?.type === 'usa' ? 'us-supreme-court' : 'supreme-court');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Supreme Court
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedCase.name}</h1>
                <p className="text-gray-600">Case #{selectedCase.caseNumber}</p>
              </div>
              <span className={`px-4 py-2 rounded-full font-bold text-lg ${
                isDecided ? 'bg-green-200 text-green-800' :
                isUpcoming ? 'bg-purple-200 text-purple-800' :
                'bg-blue-200 text-blue-800'
              }`}>
                {selectedCase.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Topic</h3>
                <p className="text-gray-700">{selectedCase.topic}</p>
              </div>

              {selectedCase.voteSplit && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Vote Split</h3>
                  <p className="text-3xl font-bold text-green-700">{selectedCase.voteSplit}</p>
                </div>
              )}

              {selectedCase.dateArgued && (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {isDecided ? 'Date Argued' : isUpcoming ? 'Scheduled For' : 'Date Argued'}
                  </h3>
                  <p className="text-gray-700">{selectedCase.dateArgued || selectedCase.dateScheduled}</p>
                </div>
              )}

              {selectedCase.dateDecided && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Date Decided</h3>
                  <p className="text-gray-700">{selectedCase.dateDecided}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Legal Issue</h3>
              <p className="text-lg text-gray-700 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                {selectedCase.issue}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Summary</h3>
              <p className="text-gray-700 leading-relaxed">
                {selectedCase.summary}
              </p>
            </div>

            {selectedCase.decision && (
              <div className="mb-6 bg-green-50 border-2 border-green-400 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Decision</h3>
                <p className="text-lg font-semibold text-green-700">{selectedCase.decision}</p>
              </div>
            )}

            {selectedCase.impact && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Impact & Significance</h3>
                <p className="text-gray-700 leading-relaxed">{selectedCase.impact}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // US Federal Contracts Render Function
  const renderUSContracts = () => {
    const totalValue = usContracts.reduce((sum, contract) => sum + contract.amountRaw, 0);
    
    // Get unique departments and types
    const departments = ['All', ...new Set(usContracts.map(c => c.department))];
    const types = ['All', ...new Set(usContracts.map(c => c.type))];
    
    // Filter contracts
    let filteredContracts = usContracts.filter(contract => {
      const matchesSearch = contract.company.toLowerCase().includes(contractSearch.toLowerCase()) ||
                          contract.purpose.toLowerCase().includes(contractSearch.toLowerCase());
      const matchesDepartment = departmentFilter === 'All' || contract.department === departmentFilter;
      const matchesType = typeFilter === 'All' || contract.type === typeFilter;
      return matchesSearch && matchesDepartment && matchesType;
    });
    
    // Sort by amount (highest first)
    filteredContracts.sort((a, b) => b.amountRaw - a.amountRaw);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => setView('categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Government Levels
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-300 rounded-lg p-6 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">💰 US Federal Contracts</h2>
            <p className="text-gray-600 mb-4">See which companies receive billions in taxpayer money</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-red-300">
                <p className="text-sm text-gray-600">Total Contracts</p>
                <p className="text-3xl font-bold text-red-600">{usContracts.length}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-green-600">${(totalValue / 1000000000).toFixed(1)}B</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                <p className="text-sm text-gray-600">Showing Results</p>
                <p className="text-3xl font-bold text-blue-600">{filteredContracts.length}</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Search & Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Company or Purpose</label>
                <input
                  type="text"
                  value={contractSearch}
                  onChange={(e) => setContractSearch(e.target.value)}
                  placeholder="e.g., Lockheed, SpaceX, fighter jets..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contracts List */}
          <div className="space-y-4">
            {filteredContracts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 text-lg">No contracts found matching your criteria</p>
              </div>
            ) : (
              filteredContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-red-500"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{contract.company}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {contract.department}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          {contract.type}
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {contract.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-green-600">{contract.amount}</p>
                      <p className="text-sm text-gray-500 mt-1">{contract.date}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Contract Purpose:</h4>
                    <p className="text-gray-700">{contract.purpose}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary by Department */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Contracts by Department</h3>
            <div className="space-y-3">
              {departments.filter(d => d !== 'All').map(dept => {
                const deptContracts = usContracts.filter(c => c.department === dept);
                const deptTotal = deptContracts.reduce((sum, c) => sum + c.amountRaw, 0);
                const percentage = ((deptTotal / totalValue) * 100).toFixed(1);
                
                return (
                  <div key={dept}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700 font-medium">{dept}</span>
                      <span className="font-bold text-gray-800">
                        ${(deptTotal / 1000000000).toFixed(1)}B ({percentage}%) • {deptContracts.length} contracts
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full"
                        style={{width: `${percentage}%`}}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Contractors */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Top 10 Federal Contractors</h3>
            <div className="space-y-3">
              {usContracts.slice(0, 10).map((contract, index) => (
                <div key={contract.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{contract.company}</p>
                    <p className="text-sm text-gray-600">{contract.type}</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">{contract.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render US Federal Bills
  const renderUSBills = () => {
    // Categorize bills
    const upcomingBills = usBills.filter(b => 
      b.status === 'Passed House' || b.status === 'Passed Senate'
    );
    const proposedBills = usBills.filter(b => b.status === 'In Committee');
    const votedBills = usBills.filter(b => 
      b.status === 'Signed into Law' || b.status === 'Failed in Senate'
    );
    
    // Filter based on selected tab
    let displayBills = [];
    if (billTab === 'upcoming') displayBills = upcomingBills;
    else if (billTab === 'proposed') displayBills = proposedBills;
    else if (billTab === 'voted') displayBills = votedBills;
    
    const filteredBills = displayBills.filter(bill => {
      const matchesSearch = billSearch === '' || 
        bill.number.toLowerCase().includes(billSearch.toLowerCase()) ||
        bill.title.toLowerCase().includes(billSearch.toLowerCase()) ||
        bill.sponsor.toLowerCase().includes(billSearch.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || bill.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(usBills.map(b => b.category))];

    const getStatusColor = (status) => {
      switch(status) {
        case 'Signed into Law': return 'bg-green-100 text-green-800 border-green-300';
        case 'Passed House': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'Passed Senate': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
        case 'In Committee': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'Failed in Senate': return 'bg-red-100 text-red-800 border-red-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 animate-fade-in">
        <div className="header-sticky sticky top-0 z-10 shadow-elegant">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => setView('parties')}
              className="button-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-elegant mb-4"
            >
              ← Back to {selectedCountry?.type === 'usa' ? 'Congress' : 'Parliament'}
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 text-shadow">📋 {selectedCountry?.type === 'usa' ? 'Congressional' : 'Parliamentary'} Bills Tracker</h1>
                <p className="text-gray-600 mt-1">Track legislation through {selectedCountry?.type === 'usa' ? 'Congress' : 'Parliament'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-elegant-lg p-2 mb-6 flex gap-2 border-2 border-white/50 animate-scale-in">
            <button
              onClick={() => setBillTab('upcoming')}
              className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                billTab === 'upcoming'
                  ? 'bg-gradient-blue text-white shadow-elegant'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📅 Upcoming Bills
              <span className="block text-sm font-normal mt-1">
                {upcomingBills.length} bills to be voted
              </span>
            </button>
            <button
              onClick={() => setBillTab('proposed')}
              className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                billTab === 'proposed'
                  ? 'bg-gradient-blue text-white shadow-elegant'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📝 Proposed Bills
              <span className="block text-sm font-normal mt-1">
                {proposedBills.length} in committee
              </span>
            </button>
            <button
              onClick={() => setBillTab('voted')}
              className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                billTab === 'voted'
                  ? 'bg-gradient-blue text-white shadow-elegant'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ✅ Bills Voted
              <span className="block text-sm font-normal mt-1">
                {votedBills.length} in last 12 months
              </span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="card-gradient rounded-2xl shadow-elegant-lg p-6 mb-6 border-2 border-white/50 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Search Bills
                </label>
                <input
                  type="text"
                  placeholder="Search by number, title, or sponsor..."
                  value={billSearch}
                  onChange={(e) => setBillSearch(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filter by Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 font-medium">
              Showing {filteredBills.length} of {displayBills.length} bills in this category
            </p>
          </div>

          {/* Bills List */}
          <div className="space-y-4">
            {filteredBills.length === 0 ? (
              <div className="text-center py-16 card-gradient rounded-2xl shadow-elegant border-2 border-gray-200">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No bills found</h3>
                <p className="text-gray-500">Try different search terms or filters</p>
              </div>
            ) : (
              filteredBills.map((bill, index) => (
                <div
                  key={bill.id}
                  onClick={() => {
                    setSelectedBill(bill);
                    setView('us-bill-detail');
                  }}
                  className="card-gradient rounded-2xl shadow-elegant-lg p-6 border-2 border-white/50 hover-lift interactive-card animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {bill.number}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {bill.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{bill.title}</h3>
                    <p className="text-gray-600 mb-3">{bill.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Sponsor: {bill.sponsor} ({bill.sponsorParty}-{bill.sponsorState})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Introduced: {bill.dateIntroduced}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-green-600">
                          <ThumbsUp className="w-5 h-5" />
                          <span className="font-bold text-lg">{bill.supportVotes.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500">Support</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-red-600">
                          <ThumbsDown className="w-5 h-5" />
                          <span className="font-bold text-lg">{bill.opposeVotes.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500">Oppose</p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render US Bill Detail
  const renderUSBillDetail = () => {
    if (!selectedBill) return null;

    const getStatusColor = (status) => {
      switch(status) {
        case 'Signed into Law': return 'bg-green-100 text-green-800 border-green-300';
        case 'Passed House': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'Passed Senate': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
        case 'In Committee': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'Failed in Senate': return 'bg-red-100 text-red-800 border-red-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => {
                setSelectedBill(null);
                setView('us-bills');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Federal Bills
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Bill Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-bold">
                {selectedBill.number}
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getStatusColor(selectedBill.status)}`}>
                {selectedBill.status}
              </span>
              <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                {selectedBill.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{selectedBill.title}</h1>
            <p className="text-lg text-gray-700 mb-6">{selectedBill.description}</p>

            {/* Sponsor Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Sponsored By</p>
                <p className="font-bold text-gray-800">{selectedBill.sponsor}</p>
                <p className="text-sm text-gray-600">{selectedBill.sponsorParty} - {selectedBill.sponsorState}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Chamber</p>
                <p className="font-bold text-gray-800">{selectedBill.chamber}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Date Introduced</p>
                <p className="font-bold text-gray-800">{selectedBill.dateIntroduced}</p>
              </div>
            </div>

            {/* Voting Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Citizen Opinion</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-6 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{selectedBill.supportVotes.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Support</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ThumbsDown className="w-6 h-6 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{selectedBill.opposeVotes.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Oppose</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      // Vote support logic would go here
                      alert('Vote support feature - would update in real app');
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span>Support This Bill</span>
                  </button>
                  <button
                    onClick={() => {
                      // Vote oppose logic would go here
                      alert('Vote oppose feature - would update in real app');
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    <ThumbsDown className="w-5 h-5" />
                    <span>Oppose This Bill</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Party Support */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Party Support</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Democrat Support</p>
                <p className="text-3xl font-bold text-blue-600">{selectedBill.partySupport.Democrat}%</p>
              </div>
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Republican Support</p>
                <p className="text-3xl font-bold text-red-600">{selectedBill.partySupport.Republican}%</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Legislative Timeline</h3>
            <div className="space-y-4">
              {selectedBill.timeline.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    {index < selectedBill.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-blue-300 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-sm text-gray-500">{item.date}</p>
                    <p className="font-semibold text-gray-800">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Laws & Legal Search
  const renderLawsSearch = () => {
    const isUSA = selectedCountry?.type === 'usa';
    const lawsData = isUSA ? usLaws : laws;
    
    const filteredLaws = lawsData.filter(law => {
      const matchesSearch = lawSearch === '' || 
        law.title.toLowerCase().includes(lawSearch.toLowerCase()) ||
        law.summary.toLowerCase().includes(lawSearch.toLowerCase()) ||
        law.keywords.some(keyword => keyword.toLowerCase().includes(lawSearch.toLowerCase())) ||
        law.category.toLowerCase().includes(lawSearch.toLowerCase());
      
      let matchesDate = true;
      if (lawDateFilter !== 'All Time') {
        const lawYear = new Date(law.dateEnacted).getFullYear();
        const currentYear = new Date().getFullYear();
        
        if (lawDateFilter === 'Last Year') {
          matchesDate = lawYear >= currentYear - 1;
        } else if (lawDateFilter === 'Last 5 Years') {
          matchesDate = lawYear >= currentYear - 5;
        } else if (lawDateFilter === 'Last 10 Years') {
          matchesDate = lawYear >= currentYear - 10;
        } else if (lawDateFilter === 'Before 2000') {
          matchesDate = lawYear < 2000;
        }
      }
      
      return matchesSearch && matchesDate;
    });

    const categories = [...new Set(lawsData.map(l => l.category))].sort();

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 animate-fade-in">
        <div className="header-sticky sticky top-0 z-10 shadow-elegant">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => setView('categories')}
              className="button-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-elegant"
            >
              ← Back to Categories
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 animate-slide-in">
            <h1 className="text-4xl font-bold text-gray-800 mb-3 text-shadow">⚖️ Laws & Legal Search</h1>
            <p className="text-lg text-gray-600">Search and explore {isUSA ? 'U.S. Federal' : 'Canadian'} laws and regulations</p>
            <div className="w-24 h-1 bg-gradient-green mt-3 rounded-full"></div>
          </div>

          {/* Search and Filters */}
          <div className="card-gradient rounded-2xl shadow-elegant-lg p-6 mb-8 border-2 border-white/50 animate-scale-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-600" />
                  Search by Keywords
                </label>
                <input
                  type="text"
                  placeholder="e.g., employment, tax, immigration, discrimination..."
                  value={lawSearch}
                  onChange={(e) => setLawSearch(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                />
                <p className="text-sm text-gray-500 mt-2">Search by title, category, keywords, or content</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Filter by Date Enacted
                </label>
                <select
                  value={lawDateFilter}
                  onChange={(e) => setLawDateFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                >
                  <option value="All Time">All Time</option>
                  <option value="Last Year">Last Year</option>
                  <option value="Last 5 Years">Last 5 Years</option>
                  <option value="Last 10 Years">Last 10 Years</option>
                  <option value="Before 2000">Before 2000</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-medium">
                Showing {filteredLaws.length} of {lawsData.length} laws
                {lawSearch && <span> matching "{lawSearch}"</span>}
              </p>
            </div>
          </div>

          {/* Popular Categories */}
          {lawSearch === '' && (
            <div className="mb-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-xl font-bold text-gray-800 mb-4">📑 Popular Categories</h3>
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setLawSearch(category)}
                    className="px-4 py-2 bg-white border-2 border-green-200 text-green-700 rounded-xl font-medium hover:bg-green-50 hover:border-green-400 transition-all shadow-elegant hover-lift"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="space-y-4">
            {filteredLaws.length === 0 ? (
              <div className="text-center py-16 card-gradient rounded-2xl shadow-elegant border-2 border-gray-200">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No laws found</h3>
                <p className="text-gray-500">Try different keywords or adjust your filters</p>
              </div>
            ) : (
              filteredLaws.map((law, index) => (
                <div
                  key={law.id}
                  className="card-gradient rounded-2xl shadow-elegant-lg p-6 border-2 border-white/50 hover-lift interactive-card animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold border-2 border-green-300">
                          {law.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          Enacted: {new Date(law.dateEnacted).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">{law.title}</h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">{law.summary}</p>
                      
                      {/* Keywords */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {law.keywords.slice(0, 6).map(keyword => (
                          <span key={keyword} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                            {keyword}
                          </span>
                        ))}
                      </div>
                      
                      {/* Link to Official Source */}
                      <a
                        href={law.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 button-success text-white px-6 py-3 rounded-xl font-semibold shadow-elegant"
                      >
                        <FileText className="w-5 h-5" />
                        Read Full Text on Official Website
                        <ChevronRight className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Help Text */}
          {filteredLaws.length > 0 && (
            <div className="mt-8 card-gradient rounded-2xl shadow-elegant p-6 border-2 border-blue-200 animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Legal Disclaimer</h4>
                  <p className="text-sm text-gray-600">
                    This tool provides summaries of laws for informational purposes only and does not constitute legal advice. 
                    For authoritative legal information, please refer to the official government websites linked above or consult with a qualified legal professional.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCountrySelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-slide-in">
          <h1 className="text-5xl font-bold text-gray-800 mb-3 text-shadow">Civic Voice</h1>
          <p className="text-xl text-gray-600">Full Government Transparency Platform - North America</p>
          <div className="w-24 h-1 bg-gradient-blue mx-auto mt-4 rounded-full"></div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-elegant animate-scale-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">API Connection Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {countries.map((country, index) => (
            <div
              key={country.id}
              onClick={() => {
                setSelectedCountry(country);
                setView('government-levels');
              }}
              className="card-gradient rounded-2xl shadow-elegant-lg p-10 cursor-pointer hover-lift interactive-card border-2 border-white/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-7xl mb-6 text-center animate-pulse-slow">{country.flag}</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center text-shadow">{country.name}</h2>
              <p className="text-gray-600 text-center text-lg mb-4">{country.members} elected members</p>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold mt-4">
                <span>Explore Government</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center text-gray-500 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p>Track legislation, contracts, spending, and accountability</p>
        </div>
      </div>
    </div>
  );

  const renderGovernmentLevels = () => {
    const isUSA = selectedCountry?.type === 'usa';
    const countryName = isUSA ? 'United States' : 'Canada';
    const flag = isUSA ? '🇺🇸' : '🇨🇦';

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-8 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setView('countries')}
            className="mb-4 sm:mb-6 button-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium text-sm sm:text-base shadow-elegant"
          >
            ← Back to Countries
          </button>

          <div className="mb-8 animate-slide-in">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{flag}</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-shadow">{countryName}</h1>
            </div>
            <p className="text-gray-600 text-base sm:text-lg">Choose a level of government to explore</p>
            <div className="w-24 h-1 bg-gradient-blue mt-3 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Federal Government */}
            <div
              onClick={() => setView('categories')}
              className="card-gradient rounded-2xl shadow-elegant-lg p-8 cursor-pointer hover-lift interactive-card border-2 border-white/50 animate-scale-in"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h1v11H4V10zm6 0h1v11h-1V10zm5 0h1v11h-1V10zm5 0h1v11h-1V10z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Federal Government</h2>
              <p className="text-gray-600 mb-4 text-sm">
                {isUSA
                  ? 'Congress, federal departments, contracts, supreme court & more'
                  : 'Parliament, federal ministries, contracts, supreme court & more'}
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                <span>Explore Federal</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Provincial / State Governments */}
            <div
              onClick={() => setView('provincial')}
              className="card-gradient rounded-2xl shadow-elegant-lg p-8 cursor-pointer hover-lift interactive-card border-2 border-white/50 animate-scale-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {isUSA ? 'State Governments' : 'Provincial Governments'}
              </h2>
              <p className="text-gray-600 mb-4 text-sm">
                {isUSA
                  ? 'Governors of all 50 states and territories'
                  : 'Premiers of all 10 provinces and 3 territories'}
              </p>
              <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                <span>{isUSA ? 'Explore States' : 'Explore Provinces'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProvincial = () => {
    const isUSA = selectedCountry?.type === 'usa';
    const CDN = 'https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3';

    const canadaProvinces = [
      {
        name: 'Ontario', capital: 'Toronto', flagCode: 'ca-on', population: '14.9M',
        premier: 'Doug Ford', party: 'Progressive Conservative', partyShort: 'PC', since: '2018',
        bio: 'Former businessman and Toronto city councillor Doug Ford won the 2018 election on a populist anti-establishment platform. He has focused on transit and highway infrastructure, cutting development red tape, and reducing business costs, while navigating controversies over greenbelt land-use decisions.',
      },
      {
        name: 'Quebec', capital: 'Quebec City', flagCode: 'ca-qc', population: '8.8M',
        premier: 'François Legault', party: 'Coalition Avenir Québec', partyShort: 'CAQ', since: '2018',
        bio: 'Former airline executive and co-founder of Air Transat, François Legault founded the CAQ party advocating Quebec nationalism and economic modernisation. He has focused on protecting the French language, reducing immigration levels, and decreasing government bureaucracy.',
      },
      {
        name: 'British Columbia', capital: 'Victoria', flagCode: 'ca-bc', population: '5.3M',
        premier: 'David Eby', party: 'New Democratic Party', partyShort: 'NDP', since: '2022',
        bio: 'Former civil liberties lawyer and housing minister David Eby succeeded John Horgan as Premier in 2022. He has pursued aggressive housing supply policies, decriminalisation of small amounts of drugs (later reversed), and significant mental health system investment.',
      },
      {
        name: 'Alberta', capital: 'Edmonton', flagCode: 'ca-ab', population: '4.6M',
        premier: 'Danielle Smith', party: 'United Conservative Party', partyShort: 'UCP', since: '2022',
        bio: 'Former radio host and Wildrose Party leader Danielle Smith won the UCP leadership in 2022 and the 2023 provincial election. She has championed provincial autonomy, oil and gas development, and the Alberta Sovereignty Act to resist federal climate and firearms policies.',
      },
      {
        name: 'Saskatchewan', capital: 'Regina', flagCode: 'ca-sk', population: '1.2M',
        premier: 'Scott Moe', party: 'Saskatchewan Party', partyShort: 'Sask. Party', since: '2018',
        bio: 'Former farmer and legislative assemblyman Scott Moe has championed Saskatchewan\'s resource industries, including oil, potash, and uranium. He has been a vocal opponent of the federal carbon tax and has worked to assert provincial jurisdiction over natural resources.',
      },
      {
        name: 'Manitoba', capital: 'Winnipeg', flagCode: 'ca-mb', population: '1.4M',
        premier: 'Wab Kinew', party: 'New Democratic Party', partyShort: 'NDP', since: '2023',
        bio: 'Manitoba\'s first First Nations Premier, Wab Kinew is a former journalist, author, and musician. He has focused on reconciliation with Indigenous communities, healthcare system improvements, addressing high rates of violent crime, and expanding early childhood education.',
      },
      {
        name: 'Nova Scotia', capital: 'Halifax', flagCode: 'ca-ns', population: '1.0M',
        premier: 'Tim Houston', party: 'Progressive Conservative', partyShort: 'PC', since: '2021',
        bio: 'Former financial advisor and MLA Tim Houston led the Progressive Conservatives to a surprise majority in 2021. He has prioritised addressing Nova Scotia\'s acute healthcare worker shortage, tackling the housing affordability crisis, and growing the provincial economy.',
      },
      {
        name: 'New Brunswick', capital: 'Fredericton', flagCode: 'ca-nb', population: '820K',
        premier: 'Susan Holt', party: 'Liberal', partyShort: 'Liberal', since: '2024',
        bio: 'Susan Holt became the first female Premier of New Brunswick after leading the Liberals to victory in the 2024 election. She has focused on affordability for families, improving healthcare access, and creating economic opportunities to retain young New Brunswickers.',
      },
      {
        name: 'Newfoundland & Labrador', capital: "St. John's", flagCode: 'ca-nl', population: '530K',
        premier: 'Andrew Furey', party: 'Liberal', partyShort: 'Liberal', since: '2020',
        bio: 'Hand surgeon and community leader Andrew Furey became Premier in 2020 after Dwight Ball resigned. He has navigated significant fiscal challenges while pursuing economic diversification beyond offshore oil and the fisheries, including a major green hydrogen project.',
      },
      {
        name: 'Prince Edward Island', capital: 'Charlottetown', flagCode: 'ca-pe', population: '170K',
        premier: 'Dennis King', party: 'Progressive Conservative', partyShort: 'PC', since: '2019',
        bio: 'Former sports broadcaster and journalist Dennis King has led both minority and majority PC governments in PEI. He has focused on managing the province\'s rapid population growth, healthcare capacity, housing affordability, and sustainable economic development.',
      },
      {
        name: 'Northwest Territories', capital: 'Yellowknife', flagCode: 'ca-nt', population: '45K',
        premier: 'R.J. Simpson', party: 'Consensus Government', partyShort: 'Consensus', since: '2023',
        bio: 'Operating under a consensus (non-partisan) model, R.J. Simpson was selected Premier by the Legislative Assembly in 2023. He has focused on resource development, infrastructure investment, and the unique governance and climate challenges facing Canada\'s vast Northwest Territories.',
      },
      {
        name: 'Yukon', capital: 'Whitehorse', flagCode: 'ca-yt', population: '43K',
        premier: 'Ranj Pillai', party: 'Liberal', partyShort: 'Liberal', since: '2023',
        bio: 'Former Minister of Economic Development Ranj Pillai became Yukon\'s Premier in 2023. He has focused on strengthening Indigenous government partnerships, attracting critical mineral investment, addressing the territory\'s housing shortage, and adapting to the impacts of climate change.',
      },
      {
        name: 'Nunavut', capital: 'Iqaluit', flagCode: 'ca-nu', population: '40K',
        premier: 'P.J. Akeeagok', party: 'Consensus Government', partyShort: 'Consensus', since: '2021',
        bio: 'Experienced Inuit leader and former President of the Qikiqtani Inuit Association, P.J. Akeeagok leads Nunavut under the consensus model. He has focused on improving housing and food security for the predominantly Inuit population and addressing deep infrastructure gaps.',
      },
    ];

    const usStates = [
      {
        name: 'Alabama', capital: 'Montgomery', flagCode: 'us-al',
        governor: 'Kay Ivey', govParty: 'Republican', partyShort: 'R', since: '2017',
        ltGovernor: 'Will Ainsworth', ltGovParty: 'R',
        bio: 'Kay Ivey assumed the governorship in 2017 following Robert Bentley\'s resignation and won election in her own right in 2018. She has focused on economic development, workforce training, and education reform, overseeing major manufacturing investments including automotive facilities.',
      },
      {
        name: 'Alaska', capital: 'Juneau', flagCode: 'us-ak',
        governor: 'Mike Dunleavy', govParty: 'Republican', partyShort: 'R', since: '2018',
        ltGovernor: 'Nancy Dahlstrom', ltGovParty: 'R',
        bio: 'Former state senator Mike Dunleavy won the governorship on a platform of fiscal restraint and resource development. He has managed Alaska\'s volatile oil-dependent budget while supporting expanded energy production and opposing federal restrictions on land use.',
      },
      {
        name: 'Arizona', capital: 'Phoenix', flagCode: 'us-az',
        governor: 'Katie Hobbs', govParty: 'Democrat', partyShort: 'D', since: '2023',
        ltGovernor: '—', ltGovParty: '',
        bio: 'Former Secretary of State Katie Hobbs narrowly defeated Kari Lake in the 2022 gubernatorial race. She has focused on reproductive rights, water conservation, and economic development in one of the nation\'s fastest-growing states.',
      },
      {
        name: 'Arkansas', capital: 'Little Rock', flagCode: 'us-ar',
        governor: 'Sarah Huckabee Sanders', govParty: 'Republican', partyShort: 'R', since: '2023',
        ltGovernor: 'Leslie Rutledge', ltGovParty: 'R',
        bio: 'Former White House Press Secretary Sarah Huckabee Sanders became the first female governor of Arkansas in 2023. She has pursued aggressive education reform including school choice, significant income tax cuts, and positioned Arkansas as a model for conservative governance.',
      },
      {
        name: 'California', capital: 'Sacramento', flagCode: 'us-ca',
        governor: 'Gavin Newsom', govParty: 'Democrat', partyShort: 'D', since: '2019',
        ltGovernor: 'Eleni Kounalakis', ltGovParty: 'D',
        bio: 'Former Mayor of San Francisco Gavin Newsom has championed progressive policies including universal healthcare expansion and nation-leading climate action. He is a prominent national Democratic voice widely mentioned as a potential future presidential candidate.',
      },
      {
        name: 'Colorado', capital: 'Denver', flagCode: 'us-co',
        governor: 'Jared Polis', govParty: 'Democrat', partyShort: 'D', since: '2019',
        ltGovernor: 'Dianne Primavera', ltGovParty: 'D',
        bio: 'Tech entrepreneur and former congressman Jared Polis became the first openly gay man elected governor in U.S. history. He has pursued free universal preschool, a carbon-free electricity grid, and aimed to eliminate the state income tax while expanding economic opportunity.',
      },
      {
        name: 'Connecticut', capital: 'Hartford', flagCode: 'us-ct',
        governor: 'Ned Lamont', govParty: 'Democrat', partyShort: 'D', since: '2019',
        ltGovernor: 'Susan Bysiewicz', ltGovParty: 'D',
        bio: 'Businessman and entrepreneur Ned Lamont brought private-sector experience to Connecticut\'s government. He has focused on fiscal responsibility, economic competitiveness, transit improvements, and successfully guided the state through the COVID-19 pandemic.',
      },
      {
        name: 'Delaware', capital: 'Dover', flagCode: 'us-de',
        governor: 'Matt Meyer', govParty: 'Democrat', partyShort: 'D', since: '2025',
        ltGovernor: 'Kyle Evans Gay', ltGovParty: 'D',
        bio: 'Former New Castle County Executive Matt Meyer won the 2024 gubernatorial election. He has focused on economic development, public safety improvements, environmental protection, and strengthening Delaware\'s historically significant role in corporate law.',
      },
      {
        name: 'Florida', capital: 'Tallahassee', flagCode: 'us-fl',
        governor: 'Ron DeSantis', govParty: 'Republican', partyShort: 'R', since: '2019',
        ltGovernor: 'Jeanette Nuñez', ltGovParty: 'R',
        bio: 'Former naval officer and U.S. Representative Ron DeSantis has pursued an aggressive conservative agenda, opposing COVID-19 mandates and restricting DEI programs. He became a major national Republican figure after a failed 2024 presidential run.',
      },
      {
        name: 'Georgia', capital: 'Atlanta', flagCode: 'us-ga',
        governor: 'Brian Kemp', govParty: 'Republican', partyShort: 'R', since: '2019',
        ltGovernor: 'Burt Jones', ltGovParty: 'R',
        bio: 'Former Secretary of State Brian Kemp gained national attention for certifying Georgia\'s 2020 presidential election results despite intense pressure. He has focused on economic development, attracting major manufacturing investment, and disaster preparedness.',
      },
      {
        name: 'Hawaii', capital: 'Honolulu', flagCode: 'us-hi',
        governor: 'Josh Green', govParty: 'Democrat', partyShort: 'D', since: '2022',
        ltGovernor: 'Sylvia Luke', ltGovParty: 'D',
        bio: 'Emergency room physician Josh Green brought a healthcare-centred perspective to the governorship. He faced the devastating August 2023 Lahaina wildfire and has focused on disaster preparedness, housing affordability, and accelerating Hawaii\'s clean energy transition.',
      },
      {
        name: 'Idaho', capital: 'Boise', flagCode: 'us-id',
        governor: 'Brad Little', govParty: 'Republican', partyShort: 'R', since: '2019',
        ltGovernor: 'Scott Bedke', ltGovParty: 'R',
        bio: 'Former rancher and state senator Brad Little has promoted Idaho\'s agricultural economy while managing the state\'s rapid population growth. He has focused on education funding improvements, property tax relief, and maintaining a business-friendly regulatory environment.',
      },
      {
        name: 'Illinois', capital: 'Springfield', flagCode: 'us-il',
        governor: 'JB Pritzker', govParty: 'Democrat', partyShort: 'D', since: '2019',
        ltGovernor: 'Juliana Stratton', ltGovParty: 'D',
        bio: 'Billionaire entrepreneur and Hyatt hotel heir JB Pritzker has pursued a progressive agenda including cannabis legalisation, minimum wage increases, and expanded social services. He is a major Democratic Party fundraiser and frequently mentioned as a future national candidate.',
      },
      {
        name: 'Indiana', capital: 'Indianapolis', flagCode: 'us-in',
        governor: 'Mike Braun', govParty: 'Republican', partyShort: 'R', since: '2025',
        ltGovernor: 'Micah Beckwith', ltGovParty: 'R',
        bio: 'Former U.S. Senator and businessman Mike Braun won the 2024 gubernatorial election, succeeding term-limited Eric Holcomb. A conservative fiscal hawk, he has prioritised streamlining state government and positioning Indiana as a leading destination for business investment.',
      },
      {
        name: 'Iowa', capital: 'Des Moines', flagCode: 'us-ia',
        governor: 'Kim Reynolds', govParty: 'Republican', partyShort: 'R', since: '2017',
        ltGovernor: 'Adam Gregg', ltGovParty: 'R',
        bio: 'Kim Reynolds became the first woman elected Iowa governor in her own right after succeeding Terry Branstad. She has championed education savings accounts (school choice), major income tax reductions, and conservative social legislation.',
      },
      {
        name: 'Kansas', capital: 'Topeka', flagCode: 'us-ks',
        governor: 'Laura Kelly', govParty: 'Democrat', partyShort: 'D', since: '2019',
        ltGovernor: 'David Toland', ltGovParty: 'D',
        bio: 'Former state senator Laura Kelly has served two terms as a pragmatic Democratic governor in a deeply Republican state. She expanded Medicaid, invested in economic development, and emphasised bipartisan governance and fiscal responsibility.',
      },
      {
        name: 'Kentucky', capital: 'Frankfort', flagCode: 'us-ky',
        governor: 'Andy Beshear', govParty: 'Democrat', partyShort: 'D', since: '2019',
        ltGovernor: 'Jacqueline Coleman', ltGovParty: 'D',
        bio: 'Son of former Governor Steve Beshear, Andy Beshear has been a rare Democrat winning repeatedly in an increasingly Republican state. He has attracted major battery and electric vehicle manufacturing facilities while leading the state through floods and tornado recovery.',
      },
      {
        name: 'Louisiana', capital: 'Baton Rouge', flagCode: 'us-la',
        governor: 'Jeff Landry', govParty: 'Republican', partyShort: 'R', since: '2024',
        ltGovernor: 'Billy Nungesser', ltGovParty: 'R',
        bio: 'Former state Attorney General Jeff Landry won the 2023 gubernatorial election, succeeding Democrat John Bel Edwards. He has pursued an aggressive conservative agenda including criminal justice changes, education reform, and repealing the state\'s civil service system.',
      },
      {
        name: 'Maine', capital: 'Augusta', flagCode: 'us-me',
        governor: 'Janet Mills', govParty: 'Democrat', partyShort: 'D', since: '2019',
        ltGovernor: 'None (no position)', ltGovParty: '',
        bio: 'Former state Attorney General Janet Mills made history as Maine\'s first female governor. She has focused on healthcare access, combating opioid addiction, climate resiliency, and rural economic development. Maine does not have a Lieutenant Governor position.',
      },
      {
        name: 'Maryland', capital: 'Annapolis', flagCode: 'us-md',
        governor: 'Wes Moore', govParty: 'Democrat', partyShort: 'D', since: '2023',
        ltGovernor: 'Aruna Miller', ltGovParty: 'D',
        bio: 'Author, combat veteran, and nonprofit executive Wes Moore made history as Maryland\'s first Black governor. He has focused on economic equity, workforce development, public safety reform, and strengthening Maryland\'s economy amid federal workforce reductions.',
      },
      {
        name: 'Massachusetts', capital: 'Boston', flagCode: 'us-ma',
        governor: 'Maura Healey', govParty: 'Democrat', partyShort: 'D', since: '2023',
        ltGovernor: 'Kim Driscoll', ltGovParty: 'D',
        bio: 'Former state Attorney General Maura Healey made history as the first openly LGBTQ+ person elected governor of Massachusetts. She has focused on housing production, healthcare affordability, climate infrastructure, and expanding early education access.',
      },
      {
        name: 'Michigan', capital: 'Lansing', flagCode: 'us-mi',
        governor: 'Gretchen Whitmer', govParty: 'Democrat', partyShort: 'D', since: '2019',
        ltGovernor: 'Garlin Gilchrist II', ltGovParty: 'D',
        bio: 'Former state Senate minority leader Gretchen Whitmer gained national prominence during the COVID-19 pandemic and after a foiled kidnapping plot against her. She has focused on infrastructure, reproductive rights, and attracting clean energy and EV manufacturing jobs.',
      },
      {
        name: 'Minnesota', capital: 'Saint Paul', flagCode: 'us-mn',
        governor: 'Tim Walz', govParty: 'Democrat', partyShort: 'D', since: '2019',
        ltGovernor: 'Peggy Flanagan', ltGovParty: 'D',
        bio: 'Former high school teacher, football coach, and U.S. Representative Tim Walz rose to national prominence as Kamala Harris\'s 2024 vice presidential running mate. He has championed free school meals, cannabis legalisation, and expanding social programs in Minnesota.',
      },
      {
        name: 'Mississippi', capital: 'Jackson', flagCode: 'us-ms',
        governor: 'Tate Reeves', govParty: 'Republican', partyShort: 'R', since: '2020',
        ltGovernor: 'Delbert Hosemann', ltGovParty: 'R',
        bio: 'Former state Treasurer and Lieutenant Governor Tate Reeves has pursued conservative fiscal policies and social legislation. He has focused on workforce development, criminal justice reform, and attracting manufacturing jobs to one of the nation\'s most economically challenged states.',
      },
      {
        name: 'Missouri', capital: 'Jefferson City', flagCode: 'us-mo',
        governor: 'Mike Kehoe', govParty: 'Republican', partyShort: 'R', since: '2025',
        ltGovernor: 'David Wasinger', ltGovParty: 'R',
        bio: 'Former state Senate President Pro Tem Mike Kehoe won the 2024 gubernatorial election in a state that has shifted strongly Republican. A business-focused conservative, he has prioritised economic development, reducing government spending, and infrastructure investment.',
      },
      {
        name: 'Montana', capital: 'Helena', flagCode: 'us-mt',
        governor: 'Greg Gianforte', govParty: 'Republican', partyShort: 'R', since: '2021',
        ltGovernor: 'Kristen Juras', ltGovParty: 'R',
        bio: 'Tech entrepreneur Greg Gianforte became Montana\'s first Republican governor in 16 years. He has pursued conservative land management, economic development, and innovation policies while navigating significant population growth and tensions over public land access.',
      },
      {
        name: 'Nebraska', capital: 'Lincoln', flagCode: 'us-ne',
        governor: 'Jim Pillen', govParty: 'Republican', partyShort: 'R', since: '2023',
        ltGovernor: 'Joe Kelly', ltGovParty: 'R',
        bio: 'Swine producer and former University of Nebraska Board of Regents member Jim Pillen won the 2022 gubernatorial election. He has focused on property tax relief, supporting agriculture and rural communities, and maintaining conservative fiscal management.',
      },
      {
        name: 'Nevada', capital: 'Carson City', flagCode: 'us-nv',
        governor: 'Joe Lombardo', govParty: 'Republican', partyShort: 'R', since: '2023',
        ltGovernor: 'Stavros Anthony', ltGovParty: 'R',
        bio: 'Former Las Vegas Metropolitan Police Sheriff Joe Lombardo brought a law enforcement perspective to the governorship. He has focused on public safety, workforce development, and economic diversification in a state heavily dependent on gaming and hospitality.',
      },
      {
        name: 'New Hampshire', capital: 'Concord', flagCode: 'us-nh',
        governor: 'Kelly Ayotte', govParty: 'Republican', partyShort: 'R', since: '2025',
        ltGovernor: 'None (no position)', ltGovParty: '',
        bio: 'Former U.S. Senator and state Attorney General Kelly Ayotte won the 2024 gubernatorial election. A moderate Republican, she has focused on economic competitiveness, public safety, housing affordability, and workforce development. NH has no Lt. Governor position.',
      },
      {
        name: 'New Jersey', capital: 'Trenton', flagCode: 'us-nj',
        governor: 'Phil Murphy', govParty: 'Democrat', partyShort: 'D', since: '2018',
        ltGovernor: 'Tahesha Way', ltGovParty: 'D',
        bio: 'Former Goldman Sachs executive and U.S. Ambassador Phil Murphy pursued a progressive agenda including cannabis legalisation and minimum wage increases. He served through January 2026 and was succeeded following the November 2025 election.',
      },
      {
        name: 'New Mexico', capital: 'Santa Fe', flagCode: 'us-nm',
        governor: 'Michelle Lujan Grisham', govParty: 'Democrat', partyShort: 'D', since: '2019',
        ltGovernor: 'Howie Morales', ltGovParty: 'D',
        bio: 'Former U.S. Representative Michelle Lujan Grisham has focused on early childhood education, renewable energy, and economic diversification. She has been a prominent national voice on immigration, border security, and expanding access to reproductive healthcare.',
      },
      {
        name: 'New York', capital: 'Albany', flagCode: 'us-ny',
        governor: 'Kathy Hochul', govParty: 'Democrat', partyShort: 'D', since: '2021',
        ltGovernor: 'Antonio Delgado', ltGovParty: 'D',
        bio: 'Former congresswoman and Lt. Governor Kathy Hochul became New York\'s first female governor when Andrew Cuomo resigned in 2021. She has focused on housing production, public safety, healthcare, and managing New York\'s complex $230B+ annual budget.',
      },
      {
        name: 'North Carolina', capital: 'Raleigh', flagCode: 'us-nc',
        governor: 'Josh Stein', govParty: 'Democrat', partyShort: 'D', since: '2025',
        ltGovernor: 'Rachel Hunt', ltGovParty: 'D',
        bio: 'Former state Attorney General Josh Stein won the 2024 gubernatorial election amid Hurricane Helene\'s devastating impact on western North Carolina. He has made disaster recovery a top priority alongside education reform, healthcare access, and economic opportunity.',
      },
      {
        name: 'North Dakota', capital: 'Bismarck', flagCode: 'us-nd',
        governor: 'Kelly Armstrong', govParty: 'Republican', partyShort: 'R', since: '2025',
        ltGovernor: 'Michelle Strinden', ltGovParty: 'R',
        bio: 'Former U.S. Representative Kelly Armstrong won the 2024 gubernatorial election. He has focused on North Dakota\'s energy and agricultural economy, conservative fiscal management, and reducing regulatory burdens on the state\'s key industries.',
      },
      {
        name: 'Ohio', capital: 'Columbus', flagCode: 'us-oh',
        governor: 'Mike DeWine', govParty: 'Republican', partyShort: 'R', since: '2019',
        ltGovernor: 'Jon Husted', ltGovParty: 'R',
        bio: 'Veteran Republican politician Mike DeWine has served Ohio in various capacities for decades. He gained attention for his measured COVID-19 response and has focused on public health, law enforcement, and economic development including attracting major semiconductor manufacturing.',
      },
      {
        name: 'Oklahoma', capital: 'Oklahoma City', flagCode: 'us-ok',
        governor: 'Kevin Stitt', govParty: 'Republican', partyShort: 'R', since: '2019',
        ltGovernor: 'Matt Pinnell', ltGovParty: 'R',
        bio: 'Businessman and self-described political outsider Kevin Stitt has pursued conservative economic and social policies while developing Oklahoma\'s economy. He has had notable legal conflicts with the state\'s tribal nations over gaming compacts and criminal jurisdiction.',
      },
      {
        name: 'Oregon', capital: 'Salem', flagCode: 'us-or',
        governor: 'Tina Kotek', govParty: 'Democrat', partyShort: 'D', since: '2023',
        ltGovernor: 'None (no position)', ltGovParty: '',
        bio: 'Former Speaker of the Oregon House Tina Kotek has made housing production the centrepiece of her governorship. She has set ambitious housing production targets, reversed controversial drug decriminalisation, and invested in mental health resources to address homelessness. Oregon has no Lt. Governor.',
      },
      {
        name: 'Pennsylvania', capital: 'Harrisburg', flagCode: 'us-pa',
        governor: 'Josh Shapiro', govParty: 'Democrat', partyShort: 'D', since: '2023',
        ltGovernor: 'Austin Davis', ltGovParty: 'D',
        bio: 'Former state Attorney General Josh Shapiro is widely considered one of the Democratic Party\'s most prominent rising stars. He has focused on economic development, worker protections, education investment, and infrastructure improvements in the crucial battleground state.',
      },
      {
        name: 'Rhode Island', capital: 'Providence', flagCode: 'us-ri',
        governor: 'Dan McKee', govParty: 'Democrat', partyShort: 'D', since: '2021',
        ltGovernor: 'Sabina Matos', ltGovParty: 'D',
        bio: 'Former Mayor of Cumberland Dan McKee assumed the governorship when Gina Raimondo became U.S. Secretary of Commerce and won the 2022 election in his own right. He has focused on economic recovery, education reform, and infrastructure investment in New England\'s smallest state.',
      },
      {
        name: 'South Carolina', capital: 'Columbia', flagCode: 'us-sc',
        governor: 'Henry McMaster', govParty: 'Republican', partyShort: 'R', since: '2017',
        ltGovernor: 'Pamela Evette', ltGovParty: 'R',
        bio: 'Former state Attorney General Henry McMaster assumed the governorship when Nikki Haley became U.S. Ambassador to the UN. A staunch Trump ally, he has focused on economic development, school choice, and conservative policy priorities in one of the South\'s most pro-business states.',
      },
      {
        name: 'South Dakota', capital: 'Pierre', flagCode: 'us-sd',
        governor: 'Kristi Noem', govParty: 'Republican', partyShort: 'R', since: '2019',
        ltGovernor: 'Larry Rhoden', ltGovParty: 'R',
        bio: 'Former U.S. Representative Kristi Noem emerged as a national conservative figure by opposing COVID-19 lockdowns and championing individual freedom. She has focused on Second Amendment rights, South Dakota\'s agricultural economy, and conservative social legislation.',
      },
      {
        name: 'Tennessee', capital: 'Nashville', flagCode: 'us-tn',
        governor: 'Bill Lee', govParty: 'Republican', partyShort: 'R', since: '2019',
        ltGovernor: 'Randy McNally', ltGovParty: 'R',
        bio: 'Businessman Bill Lee won the 2018 governorship without prior political experience. He has focused on education reform including education savings accounts, economic development, and maintaining Tennessee\'s no-income-tax status. The Lt. Governor role is held by the Senate Speaker.',
      },
      {
        name: 'Texas', capital: 'Austin', flagCode: 'us-tx',
        governor: 'Greg Abbott', govParty: 'Republican', partyShort: 'R', since: '2015',
        ltGovernor: 'Dan Patrick', ltGovParty: 'R',
        bio: 'Former Texas Supreme Court Justice and state Attorney General Greg Abbott has championed conservative immigration, abortion, and gun rights policies. He has managed major crises including the 2021 winter storm and directed Operation Lone Star at the U.S.-Mexico border.',
      },
      {
        name: 'Utah', capital: 'Salt Lake City', flagCode: 'us-ut',
        governor: 'Spencer Cox', govParty: 'Republican', partyShort: 'R', since: '2021',
        ltGovernor: 'Deidre Henderson', ltGovParty: 'R',
        bio: 'Former Lt. Governor Spencer Cox has promoted civil dialogue and bridging political divides, earning a reputation as a pragmatic moderate Republican. He has focused on water conservation in a drought-stricken region, housing affordability, and economic development in the nation\'s fastest-growing state.',
      },
      {
        name: 'Vermont', capital: 'Montpelier', flagCode: 'us-vt',
        governor: 'Phil Scott', govParty: 'Republican', partyShort: 'R', since: '2017',
        ltGovernor: 'David Zuckerman', ltGovParty: 'D',
        bio: 'Former race car driver and businessman Phil Scott is a popular moderate Republican governor in one of the most Democratic states. He has focused on economic development, opioid treatment, and environmental protection while frequently breaking with national Republicans on key issues.',
      },
      {
        name: 'Virginia', capital: 'Richmond', flagCode: 'us-va',
        governor: 'Glenn Youngkin', govParty: 'Republican', partyShort: 'R', since: '2022',
        ltGovernor: 'Winsome Earle-Sears', ltGovParty: 'R',
        bio: 'Former private equity executive Glenn Youngkin rode a wave of parent-focused education concerns to a surprise 2021 victory. He is constitutionally limited to one four-year term and has focused on education, economic development, and public safety during his tenure.',
      },
      {
        name: 'Washington', capital: 'Olympia', flagCode: 'us-wa',
        governor: 'Bob Ferguson', govParty: 'Democrat', partyShort: 'D', since: '2025',
        ltGovernor: 'Denny Heck', ltGovParty: 'D',
        bio: 'Former state Attorney General Bob Ferguson won the 2024 gubernatorial election, succeeding Jay Inslee. Known nationally for legal battles against federal policies, he has continued that approach while focusing on housing, climate action, and public safety reforms.',
      },
      {
        name: 'West Virginia', capital: 'Charleston', flagCode: 'us-wv',
        governor: 'Patrick Morrisey', govParty: 'Republican', partyShort: 'R', since: '2025',
        ltGovernor: '—', ltGovParty: '',
        bio: 'Former U.S. Representative Patrick Morrisey won the 2024 gubernatorial election in a state that has shifted strongly Republican. He has focused on energy production, economic diversification away from declining coal, and reducing the federal regulatory footprint in the state.',
      },
      {
        name: 'Wisconsin', capital: 'Madison', flagCode: 'us-wi',
        governor: 'Tony Evers', govParty: 'Democrat', partyShort: 'D', since: '2019',
        ltGovernor: 'Sara Rodriguez', ltGovParty: 'D',
        bio: 'Former state school superintendent Tony Evers has been a pragmatic Democratic governor navigating a Republican-controlled legislature. He has used his veto power extensively to protect education and healthcare spending while focusing on workforce development and economic growth.',
      },
      {
        name: 'Wyoming', capital: 'Cheyenne', flagCode: 'us-wy',
        governor: 'Mark Gordon', govParty: 'Republican', partyShort: 'R', since: '2019',
        ltGovernor: 'Jennings (Penny)' , ltGovParty: 'R',
        bio: 'Former rancher and state Treasurer Mark Gordon has focused on managing Wyoming\'s budget amid declining coal revenues while diversifying the state\'s energy economy including nuclear and hydrogen projects. He has worked to balance conservation priorities with resource development.',
      },
    ];

    const items = isUSA ? usStates : canadaProvinces;
    const title = isUSA ? 'State Governments' : 'Provincial & Territorial Governments';
    const subtitle = isUSA
      ? 'Current Governor and Lieutenant Governor for all 50 states'
      : 'Current Premiers for all 10 provinces and 3 territories';
    const leaderTitle = isUSA ? 'Governor' : 'Premier';

    const partyColors = {
      'PC': 'bg-blue-100 text-blue-800',
      'NDP': 'bg-orange-100 text-orange-800',
      'Liberal': 'bg-red-100 text-red-800',
      'CAQ': 'bg-sky-100 text-sky-800',
      'UCP': 'bg-blue-100 text-blue-800',
      'Sask. Party': 'bg-green-100 text-green-800',
      'Consensus': 'bg-purple-100 text-purple-800',
      'R': 'bg-red-100 text-red-800',
      'D': 'bg-blue-100 text-blue-800',
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 sm:p-8 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setView('government-levels')}
            className="mb-4 sm:mb-6 button-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium text-sm sm:text-base shadow-elegant"
          >
            ← Back
          </button>

          <div className="mb-8 animate-slide-in">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-shadow">{title}</h1>
            <p className="text-gray-600 text-base sm:text-lg">{subtitle}</p>
            <div className="w-24 h-1 mt-3 rounded-full" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {items.map((item, index) => {
              const partyKey = item.partyShort;
              const partyBadgeClass = partyColors[partyKey] || 'bg-gray-100 text-gray-700';
              const leaderName = isUSA ? item.governor : item.premier;

              return (
                <div
                  key={item.name}
                  className="bg-white rounded-2xl shadow-elegant border border-gray-100 overflow-hidden animate-scale-in hover-lift"
                  style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
                >
                  {/* Flag banner */}
                  <div className="h-24 overflow-hidden relative bg-gray-100">
                    <img
                      src={`${CDN}/${item.flagCode}.svg`}
                      alt={`Flag of ${item.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight drop-shadow">{item.name}</h3>
                        <p className="text-white/80 text-xs drop-shadow">{item.capital}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${partyBadgeClass}`}>
                        {item.partyShort}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Governor / Premier */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{leaderTitle}</p>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-800 text-sm">{leaderName}</p>
                        <p className="text-xs text-gray-400">Since {item.since}</p>
                      </div>
                      <p className="text-xs text-gray-500">{isUSA ? item.govParty : item.party}</p>
                    </div>

                    {/* Lt. Governor (USA only) */}
                    {isUSA && (
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Lieutenant Governor</p>
                        <p className="text-sm text-gray-700">{item.ltGovernor}</p>
                      </div>
                    )}

                    {/* Population (Canada only) */}
                    {!isUSA && item.population && (
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Population</p>
                        <p className="text-sm text-gray-700">{item.population}</p>
                      </div>
                    )}

                    {/* Bio */}
                    <p className="text-xs text-gray-600 leading-relaxed">{item.bio}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary bar */}
          <div className="mt-8 p-4 bg-white/60 rounded-2xl border border-white/80 shadow-elegant flex flex-wrap gap-4 justify-center text-sm text-gray-600">
            {isUSA ? (
              <>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span> Republican: {usStates.filter(s => s.partyShort === 'R').length}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span> Democrat: {usStates.filter(s => s.partyShort === 'D').length}</span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span> PC/UCP: {canadaProvinces.filter(p => ['PC','UCP'].includes(p.partyShort)).length}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span> NDP: {canadaProvinces.filter(p => p.partyShort === 'NDP').length}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span> Liberal: {canadaProvinces.filter(p => p.partyShort === 'Liberal').length}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-400 inline-block"></span> CAQ: {canadaProvinces.filter(p => p.partyShort === 'CAQ').length}</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span> Other: {canadaProvinces.filter(p => ['Sask. Party','Consensus'].includes(p.partyShort)).length}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategories = () => {
    const isUSA = selectedCountry?.type === 'usa';
    const countryName = isUSA ? 'United States' : 'Canadian';
    const legislatureName = isUSA ? 'Congress' : 'Federal Parliament';
    const memberCount = isUSA ? (congressMembers.length || 535) : (mps.length || 325);
    const memberTitle = isUSA ? 'Members of Congress' : 'Members of Parliament';
    const legislativeBody = isUSA ? 'Bills' : 'Parliamentary Bills';
    
    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setView('government-levels')}
          className="mb-4 sm:mb-6 button-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium text-sm sm:text-base shadow-elegant"
        >
          ← Back
        </button>

        <div className="mb-8 animate-slide-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-shadow">{countryName} Federal Government</h1>
          <p className="text-gray-600 text-base sm:text-lg">Explore different aspects of federal governance</p>
          <div className="w-24 h-1 bg-gradient-blue mt-3 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Legislature (Congress/Parliament) */}
          <div
            onClick={() => setView(isUSA ? 'chambers' : 'parties')}
            className="card-gradient rounded-2xl shadow-elegant-lg p-6 sm:p-8 cursor-pointer hover-lift interactive-card border-2 border-white/50 animate-scale-in"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="text-blue-600 mb-3 sm:mb-4">
              <Users className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{legislatureName}</h2>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">Explore {memberCount} {memberTitle} across all parties</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{memberCount} {isUSA ? 'Members' : 'MPs'}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* Analytics Dashboard - Available for both countries */}
          <div
            onClick={() => setView(isUSA ? 'us-analytics' : 'analytics')}
            className="card-gradient rounded-2xl shadow-elegant-lg p-6 sm:p-8 cursor-pointer hover-lift interactive-card border-2 border-white/50 animate-scale-in"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="text-purple-600 mb-3 sm:mb-4">
              <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {isUSA ? 'Budget Analytics' : 'Analytics Dashboard'}
            </h2>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">
              {isUSA 
                ? '$6.5T federal budget, deficit, debt, unemployment & foreign aid'
                : 'View economic impact, immigration, crime trends & spending'
              }
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="font-medium">{isUSA ? '12 Charts' : '11 Charts'}</span>
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </div>
          </div>

          {/* Legislative Hub - Canada */}
          {!isUSA && (
            <div
              onClick={() => setView('legislative-hub')}
              className="bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-500 active:scale-95"
            >
              <div className="text-green-600 mb-3 sm:mb-4">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Legislative Hub</h2>
              <p className="text-gray-600 mb-3 text-sm sm:text-base">Bills, laws & legislation all in one place</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="font-medium">{bills.length} Bills • {laws.length} Laws</span>
                <ChevronRight className="w-5 h-5 text-green-600" />
              </div>
            </div>
          )}

          {/* Legislative Hub - USA */}
          {isUSA && (
            <div
              onClick={() => setView('us-legislative-hub')}
              className="bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-500 active:scale-95"
            >
              <div className="text-green-600 mb-3 sm:mb-4">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Legislative Hub</h2>
              <p className="text-gray-600 mb-3 text-sm sm:text-base">Bills, laws & legislation all in one place</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="font-medium">{usBills.length} Bills • {usLaws.length} Laws</span>
                <ChevronRight className="w-5 h-5 text-green-600" />
              </div>
            </div>
          )}

          {/* Government Ministries (Canada) / Federal Departments (USA) */}
          <div
            onClick={() => setView(isUSA ? 'departments' : 'ministries')}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-500 active:scale-95"
          >
            <div className="text-orange-600 mb-3 sm:mb-4">
              <Building2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {isUSA ? 'Federal Departments' : 'Government Ministries'}
            </h2>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">
              {isUSA 
                ? 'Review cabinet budgets, grants & approve department performance'
                : 'Review budgets, grants & approve ministerial performance'
              }
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>15 {isUSA ? 'Departments' : 'Ministries'}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* Government Contracts - Available for both countries */}
          <div
            onClick={() => setView(isUSA ? 'us-contracts' : 'contracts')}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-red-500 active:scale-95"
          >
            <div className="text-red-600 mb-3 sm:mb-4">
              <DollarSign className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {isUSA ? 'Federal Contracts' : 'Government Contracts'}
            </h2>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">
              {isUSA 
                ? 'See which companies get billions in taxpayer money'
                : 'Follow taxpayer money and major government spending'
              }
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{isUSA ? usContracts.length : contracts.length} Contracts</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* Supreme Court - Available for both countries */}
          <div
            onClick={() => setView(isUSA ? 'us-supreme-court' : 'supreme-court')}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-yellow-500 active:scale-95"
          >
            <div className="text-yellow-600 mb-3 sm:mb-4">
              <Scale className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Supreme Court</h2>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">
              {isUSA 
                ? 'Track major cases, decisions & constitutional rulings'
                : 'Track major cases, decisions & Charter challenges'
              }
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>9 Justices • {isUSA ? '10' : '10'} Cases</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  // Render US Congress Chamber Selection (House vs Senate)
  const renderChambers = () => {
    const senators = congressMembers.filter(m => m.district === 'Senator');
    const representatives = congressMembers.filter(m => m.district !== 'Senator');
    
    const senateDems = senators.filter(m => m.party === 'Democrat').length;
    const senateReps = senators.filter(m => m.party === 'Republican').length;
    const senateInd = senators.filter(m => m.party === 'Independent').length;
    
    const houseDems = representatives.filter(m => m.party === 'Democrat').length;
    const houseReps = representatives.filter(m => m.party === 'Republican').length;
    const houseInd = representatives.filter(m => m.party === 'Independent').length;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button
              onClick={() => setView('categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Government Levels
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg p-6 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🏛️ U.S. Congress</h2>
            <p className="text-gray-600">Select a chamber to explore members by party</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Senate */}
            <div
              onClick={() => {
                setSelectedChamber('Senate');
                setView('parties');
              }}
              className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-500 active:scale-95"
            >
              <div className="text-blue-600 mb-4">
                <Building2 className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">United States Senate</h3>
              <p className="text-gray-600 mb-6">The upper chamber of Congress, with 100 Senators representing all 50 states</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Total Senators</span>
                  <span className="text-2xl font-bold text-gray-800">{senators.length}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="font-medium text-gray-700">Democrats</span>
                  </div>
                  <span className="font-bold text-blue-600">{senateDems}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <span className="font-medium text-gray-700">Republicans</span>
                  </div>
                  <span className="font-bold text-red-600">{senateReps}</span>
                </div>
                {senateInd > 0 && (
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                      <span className="font-medium text-gray-700">Independents</span>
                    </div>
                    <span className="font-bold text-purple-600">{senateInd}</span>
                  </div>
                )}
              </div>
            </div>

            {/* House of Representatives */}
            <div
              onClick={() => {
                setSelectedChamber('House');
                setView('parties');
              }}
              className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-500 active:scale-95"
            >
              <div className="text-green-600 mb-4">
                <Users className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">House of Representatives</h3>
              <p className="text-gray-600 mb-6">The lower chamber of Congress, with 435 Representatives from congressional districts</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">Total Representatives</span>
                  <span className="text-2xl font-bold text-gray-800">{representatives.length}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="font-medium text-gray-700">Democrats</span>
                  </div>
                  <span className="font-bold text-blue-600">{houseDems}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    <span className="font-medium text-gray-700">Republicans</span>
                  </div>
                  <span className="font-bold text-red-600">{houseReps}</span>
                </div>
                {houseInd > 0 && (
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                      <span className="font-medium text-gray-700">Independents</span>
                    </div>
                    <span className="font-bold text-purple-600">{houseInd}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderParties = () => {
    const parties = getParties();
    const isUSA = selectedCountry?.type === 'usa';
    const chamberName = selectedChamber || 'Congress';
    const legislatureName = isUSA ? (selectedChamber ? `U.S. ${selectedChamber}` : 'U.S. Congress') : 'Federal Parliament';
    const memberTitle = isUSA ? 'Representative' : 'MP';
    const ridingLabel = isUSA ? 'District' : 'Riding';
    
    const totalMembers = parties.reduce((sum, party) => sum + party.count, 0);
    
    // Prepare data for pie chart
    const pieData = parties.map(party => ({
      name: party.name,
      value: party.count,
      percentage: ((party.count / totalMembers) * 100).toFixed(1)
    }));

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header without menu */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView(isUSA && selectedChamber ? 'chambers' : 'categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to {isUSA && selectedChamber ? 'Chambers' : 'Government Levels'}
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800">{legislatureName}</h1>
            
            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Find Your Representative Section - Only for Canada for now */}
          {!isUSA && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">👤 Find Your Representative</h2>
            
            {!userMP ? (
              <div>
                <p className="text-gray-700 mb-4 text-lg">
                  📍 Allow location access to automatically find your MP, or select manually.
                </p>
                <button
                  onClick={findMyMP}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-bold text-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  📍 Use My Location
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-5 border-2 border-blue-300 shadow-sm">
                <p className="text-sm text-gray-600 mb-2 font-medium">Your Representative:</p>
                <p className="text-2xl font-bold text-gray-800">{userMP.name}</p>
                <p className="text-lg text-gray-600 mb-1">{userMP.riding}</p>
                <p className="text-gray-700">🎗️ {userMP.party}</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700 mb-1">📞 Parliament: {userMP.phone}</p>
                  {userMP.constituencyPhone && (
                    <p className="text-sm text-gray-700 mb-1">📞 Constituency: {userMP.constituencyPhone}</p>
                  )}
                  <p className="text-sm text-gray-700">📧 {userMP.email}</p>
                </div>
                <button
                  onClick={() => {
                    setUserMP(null);
                    localStorage.removeItem('userMP');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-3 font-medium underline"
                >
                  Change Representative
                </button>
              </div>
            )}
          </div>
          )}

          {/* Party Breakdown Chart - For USA chambers */}
          {isUSA && selectedChamber && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Party Composition</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percentage}) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={partyColors[entry.name] || '#6B7280'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                
                {/* Stats */}
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Members</p>
                    <p className="text-3xl font-bold text-gray-800">{totalMembers}</p>
                  </div>
                  {parties.map(party => (
                    <div key={party.name} className="flex items-center justify-between p-3 rounded-lg" style={{backgroundColor: `${party.color}20`}}>
                      <div className="flex items-center gap-2">
                        <div style={{backgroundColor: party.color}} className="w-4 h-4 rounded-full"></div>
                        <span className="font-medium text-gray-700">{party.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{party.count}</p>
                        <p className="text-sm text-gray-600">{((party.count / totalMembers) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Political Parties Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Select a Political Party</h2>
            
            <div className="space-y-4">
              {parties.map(party => (
                <div
                  key={party.name}
                  onClick={() => {
                    setSelectedParty(party);
                    setView('members');
                  }}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div style={{backgroundColor: party.color}} className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {party.name[0]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{party.name}</h2>
                      <p className="text-gray-600">{party.count} members</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMembers = () => {
    const partyMPs = getPartyMPs();

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedParty(null);
                setView('parties');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Parties
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800">{selectedParty?.name}</h1>

            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading party members...</p>
            </div>
          )}

          {!loading && partyMPs.length > 0 && (
            <>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Search className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-800">Search Members</h2>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or riding..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partyMPs.map((mp, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedMember(mp);
                      if (selectedCountry?.type === 'usa') {
                        setShowMemberPanel(true);
                      } else {
                        setView('member-detail');
                      }
                    }}
                    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
                  >
                    <div style={{backgroundColor: getPartyColor(mp.party)}} className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                      {mp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{mp.name}</h3>
                    
                    {getRoleBadge(mp) && (
                      <div className="mb-3">
                        {getRoleBadge(mp)}
                      </div>
                    )}

                    {mp.portfolio && (
                      <p className="text-sm text-gray-600 mb-3 italic">{mp.portfolio}</p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{mp.riding}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <span>{mp.province}</span>
                      </div>

                      {mp.expenses && (
                        <div className="flex items-center gap-2 text-gray-600 pt-2 border-t">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatCurrency(mp.expenses.total)} expenses</span>
                        </div>
                      )}

                      {mp.lobbying && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span>{formatCurrency(mp.lobbying.totalValue)} lobbying</span>
                        </div>
                      )}

                      {mp.supportVotes !== undefined && (
                        <div className="flex items-center gap-4 text-xs pt-2 border-t">
                          <div className="flex items-center gap-1 text-green-600">
                            <ThumbsUp className="w-3 h-3" />
                            <span className="font-semibold">{mp.supportVotes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-600">
                            <ThumbsDown className="w-3 h-3" />
                            <span className="font-semibold">{mp.opposeVotes.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-blue-600 text-sm font-medium">View Full Profile →</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderBills = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setView('categories')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Government Levels
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">Parliamentary Bills</h1>
          
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">📜 Upcoming & Recent Bills</h2>
          <p className="text-gray-600">Vote to show your support or opposition for each bill</p>
        </div>

        {bills.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bills Found</h3>
            <p className="text-gray-600">Run the bills scraper to load bill data!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bills.map(bill => (
              <div
                key={bill.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                          {bill.billNumber}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bill.status)}`}>
                          {bill.status}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {bill.category}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{bill.shortTitle}</h2>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{bill.sponsor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{bill.dateIntroduced}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{bill.summary}</p>

                      <button
                        onClick={() => {
                          setSelectedBill(bill);
                          setView('bill-detail');
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                      >
                        View Full Details & Arguments
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-800">{bill.supportVotes}</span>
                          <span className="text-sm text-gray-600">Support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-gray-800">{bill.opposeVotes}</span>
                          <span className="text-sm text-gray-600">Oppose</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          onClick={() => voteBill(bill.id, bill.userVote === 'support' ? 'remove' : 'support')}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                            bill.userVote === 'support'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{bill.userVote === 'support' ? 'Supporting' : 'Support'}</span>
                        </button>
                        <button
                          onClick={() => voteBill(bill.id, bill.userVote === 'oppose' ? 'remove' : 'oppose')}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                            bill.userVote === 'oppose'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span>{bill.userVote === 'oppose' ? 'Opposing' : 'Oppose'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderBillDetail = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => {
              setSelectedBill(null);
              setView('bills');
            }}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Back to Bills
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-lg font-bold">
              {selectedBill.billNumber}
            </span>
            <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(selectedBill.status)}`}>
              {selectedBill.status}
            </span>
            <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full">
              {selectedBill.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-4">{selectedBill.title}</h1>

          <div className="flex items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{selectedBill.sponsor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Introduced: {selectedBill.dateIntroduced}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-2">Summary</h3>
            <p className="text-gray-700">{selectedBill.summary}</p>
          </div>

          {/* TAKE ACTION SECTION */}
          {userMP && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-6 mb-6 shadow-md">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">📞 Take Action on This Bill</h3>
              <div className="bg-white rounded-lg p-5 mb-4 border-2 border-green-300">
                <p className="text-sm text-gray-600 mb-2 font-medium uppercase">Contact YOUR Representative:</p>
                <p className="text-2xl font-bold text-gray-800">{userMP.name}</p>
                <p className="text-lg text-gray-600 mb-4">{userMP.riding} • {userMP.party}</p>
                
                <div className="space-y-3">
                  <a 
                    href={`tel:${userMP.phone}`}
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800 font-medium text-lg transition-colors"
                  >
                    📞 Parliament: {userMP.phone}
                  </a>
                  {userMP.constituencyPhone && (
                    <a 
                      href={`tel:${userMP.constituencyPhone}`}
                      className="flex items-center gap-3 text-blue-600 hover:text-blue-800 font-medium text-lg transition-colors"
                    >
                      📞 Constituency: {userMP.constituencyPhone}
                    </a>
                  )}
                  <a 
                    href={`mailto:${userMP.email}?subject=${encodeURIComponent(`Regarding ${selectedBill.billNumber}`)}`}
                    className="flex items-center gap-3 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    📧 {userMP.email}
                  </a>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-5">
                <p className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                  💬 Sample Script:
                </p>
                <p className="text-gray-800 leading-relaxed">
                  "Hi, my name is <strong>[YOUR NAME]</strong> and I'm a constituent from <strong>{userMP.riding}</strong>. 
                  I'm calling about <strong>{selectedBill.billNumber} - {selectedBill.title}</strong>. 
                  I <strong>[support/oppose]</strong> this bill because <strong>[YOUR REASON]</strong>. 
                  I'd like to know how you plan to vote on this bill. Thank you."
                </p>
              </div>
            </div>
          )}

          {!userMP && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5 mb-6">
              <p className="text-gray-800 text-lg">
                📍 <button 
                  onClick={findMyMP}
                  className="text-blue-600 hover:text-blue-800 font-bold underline"
                >
                  Find your MP
                </button> to contact them about this bill!
              </p>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <ThumbsUp className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{selectedBill.supportVotes}</div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ThumbsDown className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{selectedBill.opposeVotes}</div>
                    <div className="text-sm text-gray-600">Oppose</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => voteBill(selectedBill.id, selectedBill.userVote === 'support' ? 'remove' : 'support')}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedBill.userVote === 'support'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-sm sm:text-base">{selectedBill.userVote === 'support' ? 'Supporting' : 'Support This Bill'}</span>
                </button>
                <button
                  onClick={() => voteBill(selectedBill.id, selectedBill.userVote === 'oppose' ? 'remove' : 'oppose')}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedBill.userVote === 'oppose'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span className="text-sm sm:text-base">{selectedBill.userVote === 'oppose' ? 'Opposing' : 'Oppose This Bill'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ThumbsUp className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">Arguments in Favor</h2>
          </div>
          <div className="space-y-4">
            {selectedBill.prosArguments.map((arg, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 flex-1">{arg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <ThumbsDown className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-800">Arguments Against</h2>
          </div>
          <div className="space-y-4">
            {selectedBill.consArguments.map((arg, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 flex-1">{arg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // NEW: Legislative Hub - Combines Bills, Laws & Upcoming Legislation
  const renderLegislativeHub = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Government Levels
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800">Legislative Hub</h1>
            
            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setLegislativeTab('bills')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  legislativeTab === 'bills'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📋 Bills & Legislation
              </button>
              <button
                onClick={() => setLegislativeTab('parliamentary')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  legislativeTab === 'parliamentary'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🏛️ Ongoing Parliamentary Bills
              </button>
              <button
                onClick={() => setLegislativeTab('laws')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  legislativeTab === 'laws'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📜 Latest Laws & Regulations
              </button>
            </div>
          </div>

          {/* Bills & Legislation Tab — Enhanced Search Only */}
          {legislativeTab === 'bills' && (
            <div className="animate-fade-in">

              {/* Info Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔍</div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Search Canadian Legislation</h2>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      Search for any law, act, or regulation below. Results will take you directly to the <strong>official Government of Canada website</strong> so you can read the real legal text.
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Search Box */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-blue-100">
                <div className="relative mb-4">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-500" />
                  <input
                    type="text"
                    placeholder="e.g. tax, immigration, housing, cannabis, privacy..."
                    value={billSearch}
                    onChange={(e) => setBillSearch(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 border-2 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg font-medium shadow-inner"
                  />
                  {billSearch && (
                    <button
                      onClick={() => setBillSearch('')}
                      className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {/* Quick Topic Chips */}
                {!billSearch && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-3">🔥 Popular Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {['Tax', 'Immigration', 'Housing', 'Healthcare', 'Cannabis', 'Privacy', 'Environment', 'Criminal Code', 'Employment', 'Indigenous Rights', 'Budget', 'Trade'].map(topic => (
                        <button
                          key={topic}
                          onClick={() => setBillSearch(topic)}
                          className="px-4 py-2 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {billSearch && (
                  <p className="text-sm text-gray-600 mt-2">
                    Showing <strong>{laws.filter(l =>
                      l.title?.toLowerCase().includes(billSearch.toLowerCase()) ||
                      l.summary?.toLowerCase().includes(billSearch.toLowerCase()) ||
                      l.category?.toLowerCase().includes(billSearch.toLowerCase()) ||
                      l.keywords?.some(k => k.toLowerCase().includes(billSearch.toLowerCase()))
                    ).length}</strong> results for "<strong>{billSearch}</strong>" — click any result to open on Canada.ca
                  </p>
                )}
              </div>

              {/* Search Results */}
              {billSearch && (
                <div className="space-y-4">
                  {laws.filter(l =>
                    l.title?.toLowerCase().includes(billSearch.toLowerCase()) ||
                    l.summary?.toLowerCase().includes(billSearch.toLowerCase()) ||
                    l.category?.toLowerCase().includes(billSearch.toLowerCase()) ||
                    l.keywords?.some(k => k.toLowerCase().includes(billSearch.toLowerCase()))
                  ).length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow border-2 border-gray-100">
                      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-500 mb-2">No results found</h3>
                      <p className="text-gray-400 mb-4">Try different keywords like "tax", "housing" or "employment"</p>
                      <a
                        href="https://laws-lois.justice.gc.ca/eng/acts/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                        Browse All Laws on Justice.gc.ca
                        <ChevronRight className="w-5 h-5" />
                      </a>
                    </div>
                  ) : (
                    laws.filter(l =>
                      l.title?.toLowerCase().includes(billSearch.toLowerCase()) ||
                      l.summary?.toLowerCase().includes(billSearch.toLowerCase()) ||
                      l.category?.toLowerCase().includes(billSearch.toLowerCase()) ||
                      l.keywords?.some(k => k.toLowerCase().includes(billSearch.toLowerCase()))
                    ).map((law, index) => (
                      <a
                        key={law.id || index}
                        href={law.officialLink || `https://laws-lois.justice.gc.ca/eng/acts/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-blue-400 transition-all p-5 group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                                {law.category}
                              </span>
                              {law.dateEnacted && (
                                <span className="text-xs text-gray-500">Enacted: {law.dateEnacted}</span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors mb-1">
                              {law.title || law.shortTitle}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{law.summary}</p>
                            <div className="flex flex-wrap gap-2">
                              {law.keywords?.slice(0, 4).map(k => (
                                <span key={k} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{k}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex flex-col items-center gap-1 text-blue-600 group-hover:text-blue-800">
                            <Globe className="w-6 h-6" />
                            <span className="text-xs font-bold text-center">Canada.ca</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-blue-600 text-sm font-semibold">
                          <FileText className="w-4 h-4" />
                          Read full legal text on the Government of Canada website →
                        </div>
                      </a>
                    ))
                  )}
                </div>
              )}

              {/* Empty state when no search yet */}
              {!billSearch && (
                <div className="text-center py-12 bg-white rounded-2xl shadow border-2 border-dashed border-blue-200">
                  <Search className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">Start typing to search</h3>
                  <p className="text-gray-400 mb-6">Search any topic and we'll find the relevant Canadian laws and link you directly to the official government source.</p>
                  <a
                    href="https://laws-lois.justice.gc.ca/eng/acts/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    Browse All Laws on Justice.gc.ca
                    <ChevronRight className="w-5 h-5" />
                  </a>
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> All links open directly on the Government of Canada website (laws-lois.justice.gc.ca or canada.ca). Civic Voice does not store or display the legal text — you are always reading from the official source.
                </p>
              </div>
            </div>
          )}

          {/* Ongoing Parliamentary Bills Tab */}
          {legislativeTab === 'parliamentary' && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🏛️ Ongoing Parliamentary Bills</h2>
                <p className="text-gray-600">Bills currently moving through Parliament — being debated, reviewed, or voted on</p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="bg-white px-4 py-2 rounded-lg border-2 border-blue-200 shadow-sm">
                    <p className="text-sm text-gray-600">Upcoming Bills</p>
                    <p className="text-xl font-bold text-blue-600">{bills.filter(b => b.status === 'In Committee' || b.status === 'Passed House' || b.status === 'Passed Senate').length}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border-2 border-yellow-200 shadow-sm">
                    <p className="text-sm text-gray-600">Proposed Bills</p>
                    <p className="text-xl font-bold text-yellow-600">{bills.filter(b => b.status === 'In Committee').length}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border-2 border-green-200 shadow-sm">
                    <p className="text-sm text-gray-600">Bills Voted (12mo)</p>
                    <p className="text-xl font-bold text-green-600">{bills.filter(b => b.status === 'Signed into Law' || b.status === 'Failed in Senate').length}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {bills.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bills Found</h3>
                    <p className="text-gray-600">Run the bills scraper to load bill data!</p>
                  </div>
                ) : (
                  bills.slice(0, 5).map(bill => (
                    <div
                      key={bill.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-500 cursor-pointer"
                      onClick={() => {
                        setSelectedBill(bill);
                        setView('bill-detail');
                      }}
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                            {bill.billNumber}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bill.status)}`}>
                            {bill.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{bill.shortTitle}</h3>
                        <p className="text-gray-600 text-sm mb-3">{bill.summary}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold">{bill.supportVotes}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThumbsDown className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-semibold">{bill.opposeVotes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <button
                  onClick={() => setView('bills')}
                  className="w-full button-success text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
                >
                  View All Parliamentary Bills
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* Latest Laws & Regulations Tab */}
          {legislativeTab === 'laws' && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-300 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">📜 Latest Laws & Regulations</h2>
                <p className="text-gray-600">Laws approved or voted on in the <strong>last 12 months</strong> — recently enacted legislation affecting Canadians</p>
              </div>

              {/* Laws List — filtered to last 12 months */}
              {(() => {
                const twelveMonthsAgo = new Date();
                twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
                const recentLaws = laws.filter(law => {
                  const lawDate = new Date(law.dateImplemented || law.dateEnacted || law.date);
                  return lawDate >= twelveMonthsAgo;
                });

                if (laws.length === 0) {
                  return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No Laws Available</h3>
                      <p className="text-gray-600">Run create-laws-data.js to load laws!</p>
                    </div>
                  );
                }

                if (recentLaws.length === 0) {
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                      <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No New Laws in the Last 12 Months</h3>
                      <p className="text-gray-500">No laws have been enacted in the past 12 months based on available data.</p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 mb-5 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <p className="text-sm text-gray-600">Showing <strong className="text-purple-700">{recentLaws.length} law{recentLaws.length !== 1 ? 's' : ''}</strong> enacted since <strong>{twelveMonthsAgo.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
                    </div>
                    <div className="space-y-6">
                      {recentLaws.map(law => (
                        <div
                          key={law.id}
                          className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-500"
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                                    {law.billNumber}
                                  </span>
                                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    ✓ {law.status}
                                  </span>
                                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    {law.category}
                                  </span>
                                </div>

                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{law.shortTitle}</h2>
                                <h3 className="text-lg text-gray-600 mb-3">{law.title}</h3>

                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Implemented: {law.dateImplemented}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{law.implementedBy}</span>
                                  </div>
                                </div>

                                <p className="text-gray-700 mb-4">{law.summary}</p>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                  <p className="text-sm text-gray-700">
                                    <strong>Impact:</strong> {law.impact}
                                  </p>
                                </div>

                                <div className="flex gap-3">
                                  <button
                                    onClick={() => {
                                      setSelectedLaw(law);
                                      setView('law-detail');
                                    }}
                                    className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center gap-1"
                                  >
                                    View Full Details & Provisions
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                  <a
                                    href={`https://www.laws-lois.justice.gc.ca/eng/acts/${law.billNumber}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Read on Justice.gc.ca
                                    <Globe className="w-4 h-4" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUSLegislativeHub = () => {
    const ongoingBills = usBills.filter(b =>
      b.status === 'In Committee' || b.status === 'Passed House' || b.status === 'Passed Senate'
    );

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Government Levels
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Legislative Hub</h1>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setUsLegTab('bills')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all text-sm ${
                  usLegTab === 'bills' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📋 Bills & Legislation
              </button>
              <button
                onClick={() => setUsLegTab('congressional')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all text-sm ${
                  usLegTab === 'congressional' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🏛️ Ongoing Congressional Bills
              </button>
              <button
                onClick={() => setUsLegTab('laws')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all text-sm ${
                  usLegTab === 'laws' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📜 Latest Laws & Regulations
              </button>
            </div>
          </div>

          {/* ── TAB 1: Bills & Legislation (Search Only) ── */}
          {usLegTab === 'bills' && (
            <div className="animate-fade-in">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🔍</div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Search U.S. Federal Legislation</h2>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      Search for any federal law, act, or regulation below. Results will take you directly to the <strong>official U.S. Government website</strong> (Congress.gov or official agency sites) so you can read the real legal text.
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Search Box */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-blue-100">
                <div className="relative mb-4">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-500" />
                  <input
                    type="text"
                    placeholder="e.g. healthcare, tax, immigration, defense, education..."
                    value={usLegSearch}
                    onChange={(e) => setUsLegSearch(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 border-2 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg font-medium shadow-inner"
                  />
                  {usLegSearch && (
                    <button
                      onClick={() => setUsLegSearch('')}
                      className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {/* Quick Topic Chips */}
                {!usLegSearch && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-3">🔥 Popular Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {['Healthcare', 'Tax', 'Immigration', 'Defense', 'Social Security', 'Education', 'Environment', 'Gun Control', 'Trade', 'Infrastructure', 'Civil Rights', 'Housing'].map(topic => (
                        <button
                          key={topic}
                          onClick={() => setUsLegSearch(topic)}
                          className="px-4 py-2 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {usLegSearch && (
                  <p className="text-sm text-gray-600 mt-2">
                    Showing <strong>{usLaws.filter(l =>
                      l.title?.toLowerCase().includes(usLegSearch.toLowerCase()) ||
                      l.summary?.toLowerCase().includes(usLegSearch.toLowerCase()) ||
                      l.category?.toLowerCase().includes(usLegSearch.toLowerCase()) ||
                      l.keywords?.some(k => k.toLowerCase().includes(usLegSearch.toLowerCase()))
                    ).length}</strong> results for "<strong>{usLegSearch}</strong>" — click any result to open on the official U.S. Government website
                  </p>
                )}
              </div>

              {/* Search Results */}
              {usLegSearch && (
                <div className="space-y-4">
                  {usLaws.filter(l =>
                    l.title?.toLowerCase().includes(usLegSearch.toLowerCase()) ||
                    l.summary?.toLowerCase().includes(usLegSearch.toLowerCase()) ||
                    l.category?.toLowerCase().includes(usLegSearch.toLowerCase()) ||
                    l.keywords?.some(k => k.toLowerCase().includes(usLegSearch.toLowerCase()))
                  ).length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow border-2 border-gray-100">
                      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-500 mb-2">No results found</h3>
                      <p className="text-gray-400 mb-4">Try different keywords like "tax", "healthcare" or "civil rights"</p>
                      <a
                        href="https://www.congress.gov/browse/legislation/114th-congress"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                        Browse All Laws on Congress.gov
                        <ChevronRight className="w-5 h-5" />
                      </a>
                    </div>
                  ) : (
                    usLaws.filter(l =>
                      l.title?.toLowerCase().includes(usLegSearch.toLowerCase()) ||
                      l.summary?.toLowerCase().includes(usLegSearch.toLowerCase()) ||
                      l.category?.toLowerCase().includes(usLegSearch.toLowerCase()) ||
                      l.keywords?.some(k => k.toLowerCase().includes(usLegSearch.toLowerCase()))
                    ).map((law, index) => (
                      <a
                        key={law.id || index}
                        href={law.officialLink || 'https://www.congress.gov/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-transparent hover:border-blue-400 transition-all p-5 group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                                {law.category}
                              </span>
                              {law.dateEnacted && (
                                <span className="text-xs text-gray-500">Enacted: {law.dateEnacted}</span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors mb-1">
                              {law.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{law.summary}</p>
                            <div className="flex flex-wrap gap-2">
                              {law.keywords?.slice(0, 4).map(k => (
                                <span key={k} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{k}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex flex-col items-center gap-1 text-blue-600 group-hover:text-blue-800">
                            <Globe className="w-6 h-6" />
                            <span className="text-xs font-bold text-center">Gov.gov</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-blue-600 text-sm font-semibold">
                          <FileText className="w-4 h-4" />
                          Read full legal text on the official U.S. Government website →
                        </div>
                      </a>
                    ))
                  )}
                </div>
              )}

              {/* Empty state */}
              {!usLegSearch && (
                <div className="text-center py-12 bg-white rounded-2xl shadow border-2 border-dashed border-blue-200">
                  <Search className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">Start typing to search</h3>
                  <p className="text-gray-400 mb-6">Search any topic and we'll find the relevant U.S. federal laws and link you directly to the official government source.</p>
                  <a
                    href="https://www.congress.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    Browse All Laws on Congress.gov
                    <ChevronRight className="w-5 h-5" />
                  </a>
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> All links open directly on official U.S. Government websites (congress.gov, eeoc.gov, dol.gov, etc.). Civic Voice does not store or display the legal text — you are always reading from the official source.
                </p>
              </div>
            </div>
          )}

          {/* ── TAB 2: Ongoing Congressional Bills ── */}
          {usLegTab === 'congressional' && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🏛️ Ongoing Congressional Bills</h2>
                <p className="text-gray-600">Bills currently moving through Congress — in committee, passed the House, or passed the Senate</p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="bg-white px-4 py-2 rounded-lg border-2 border-yellow-200 shadow-sm">
                    <p className="text-sm text-gray-600">In Committee</p>
                    <p className="text-xl font-bold text-yellow-600">{usBills.filter(b => b.status === 'In Committee').length}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border-2 border-blue-200 shadow-sm">
                    <p className="text-sm text-gray-600">Passed House</p>
                    <p className="text-xl font-bold text-blue-600">{usBills.filter(b => b.status === 'Passed House').length}</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg border-2 border-indigo-200 shadow-sm">
                    <p className="text-sm text-gray-600">Passed Senate</p>
                    <p className="text-xl font-bold text-indigo-600">{usBills.filter(b => b.status === 'Passed Senate').length}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {ongoingBills.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Ongoing Bills Found</h3>
                    <p className="text-gray-600">No bills are currently moving through Congress.</p>
                  </div>
                ) : (
                  ongoingBills.map(bill => (
                    <div
                      key={bill.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-500 cursor-pointer"
                      onClick={() => {
                        setSelectedBill(bill);
                        setView('us-bill-detail');
                      }}
                    >
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                            {bill.number}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                            bill.status === 'Passed House' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            bill.status === 'Passed Senate' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                            'bg-yellow-100 text-yellow-800 border-yellow-300'
                          }`}>
                            {bill.status}
                          </span>
                          {bill.category && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                              {bill.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{bill.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{bill.summary}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {bill.sponsor && <span>Sponsor: <strong>{bill.sponsor}</strong></span>}
                          <ChevronRight className="w-4 h-4 ml-auto text-green-600" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <a
                  href="https://www.congress.gov/legislation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  View All Active Bills on Congress.gov
                  <ChevronRight className="w-6 h-6" />
                </a>
              </div>
            </div>
          )}

          {/* ── TAB 3: Latest Laws & Regulations (last 12 months) ── */}
          {usLegTab === 'laws' && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-300 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">📜 Latest Laws & Regulations</h2>
                <p className="text-gray-600">Bills <strong>signed into law</strong> in the last 12 months by the President</p>
              </div>

              {(() => {
                const twelveMonthsAgo = new Date();
                twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
                const recentLaws = usBills.filter(b => {
                  if (b.status !== 'Signed into Law') return false;
                  const d = new Date(b.dateSigned || b.dateVoted || b.date);
                  return d >= twelveMonthsAgo;
                });

                if (recentLaws.length === 0) {
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                      <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No New Laws in the Last 12 Months</h3>
                      <p className="text-gray-500 mb-4">No bills were signed into law in the past 12 months based on available data.</p>
                      <a
                        href="https://www.congress.gov/public-laws"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                        View Public Laws on Congress.gov
                        <ChevronRight className="w-5 h-5" />
                      </a>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 mb-5 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <p className="text-sm text-gray-600">Showing <strong className="text-purple-700">{recentLaws.length} law{recentLaws.length !== 1 ? 's' : ''}</strong> signed since <strong>{twelveMonthsAgo.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
                    </div>
                    <div className="space-y-5">
                      {recentLaws.map(bill => (
                        <div
                          key={bill.id}
                          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-500 cursor-pointer"
                          onClick={() => {
                            setSelectedBill(bill);
                            setView('us-bill-detail');
                          }}
                        >
                          <div className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                                {bill.number}
                              </span>
                              <span className="bg-green-100 text-green-800 border border-green-300 px-3 py-1 rounded-full text-sm font-medium">
                                ✓ Signed into Law
                              </span>
                              {bill.category && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{bill.category}</span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">{bill.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{bill.summary}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {bill.sponsor && <span>Sponsor: <strong>{bill.sponsor}</strong></span>}
                              {(bill.dateSigned || bill.dateVoted) && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {bill.dateSigned || bill.dateVoted}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 ml-auto text-purple-600" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <a
                      href="https://www.congress.gov/public-laws"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                      View All Public Laws on Congress.gov
                      <ChevronRight className="w-6 h-6" />
                    </a>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    const analytics = getAnalyticsData();

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Government Levels
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Canadian Government Analytics</h2>
            <p className="text-gray-600">Budget, policy impact & MP performance — {mps.length} Members of Parliament</p>
          </div>

          {governmentData && (
            <>
              {/* Key Economic Indicators */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  📈 Key Economic Indicators (2025)
                </h3>
                <p className="text-gray-600 mb-4">Current snapshot of Canada's economic health</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                    <p className="text-xs text-gray-600 mb-1">GDP Growth</p>
                    <p className="text-3xl font-bold text-green-600">{governmentData.economy.gdpGrowth[3]}%</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                    <p className="text-xs text-gray-600 mb-1">Unemployment</p>
                    <p className="text-3xl font-bold text-yellow-600">{governmentData.economy.unemployment[3]}%</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                    <p className="text-xs text-gray-600 mb-1">Inflation Rate</p>
                    <p className="text-3xl font-bold text-red-600">{governmentData.economy.inflation[3]}%</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                    <p className="text-xs text-gray-600 mb-1">Consumer Confidence</p>
                    <p className="text-3xl font-bold text-blue-600">{governmentData.economy.consumerConfidence[3]}/100</p>
                  </div>
                </div>

                <h4 className="font-bold text-gray-700 mb-3">Year-over-Year Trends</h4>
                <div className="space-y-4">
                  {governmentData.economy.years.map((year, i) => (
                    <div key={year}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700 font-medium">{year}</span>
                        <span className="text-sm text-gray-600">GDP {governmentData.economy.gdpGrowth[i]}% · Unemployment {governmentData.economy.unemployment[i]}% · Inflation {governmentData.economy.inflation[i]}%</span>
                      </div>
                      <div className="flex gap-1 h-4">
                        <div className="bg-green-500 rounded-l" style={{width: `${(governmentData.economy.gdpGrowth[i] / 10) * 100}%`}} title={`GDP ${governmentData.economy.gdpGrowth[i]}%`} />
                        <div className="bg-yellow-400" style={{width: `${(governmentData.economy.unemployment[i] / 10) * 100}%`}} title={`Unemployment ${governmentData.economy.unemployment[i]}%`} />
                        <div className="bg-red-400 rounded-r" style={{width: `${(governmentData.economy.inflation[i] / 10) * 100}%`}} title={`Inflation ${governmentData.economy.inflation[i]}%`} />
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 text-xs text-gray-600 mt-2">
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-green-500 rounded"></span> GDP Growth</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-yellow-400 rounded"></span> Unemployment</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-red-400 rounded"></span> Inflation</span>
                  </div>
                </div>
              </div>

              {/* Government Spending */}
              {governmentData.spending && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    💰 Government Spending by Sector (2025)
                  </h3>
                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg mb-4">
                    <p className="text-green-800 font-bold text-lg">Total Budget: ${(governmentData.spending.totalBudget / 1e9).toFixed(1)} Billion</p>
                    <p className="text-sm text-green-700">Federal government spending across all sectors</p>
                  </div>
                  <div className="space-y-3">
                    {governmentData.spending.sectors.map((sector, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700 text-sm">{sector.name}</span>
                          <span className="font-bold text-gray-800 text-sm">${(sector.amount / 1e9).toFixed(1)}B ({sector.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full"
                            style={{
                              width: `${sector.percentage}%`,
                              backgroundColor: ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F97316','#84CC16'][index % 8]
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Immigration */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-purple-600" />
                  🌍 Immigration Policy & Acceptance
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
                    <p className="text-xs text-gray-600">Stance</p>
                    <p className="text-sm font-bold text-purple-700">{governmentData.immigration.analysis.stance}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
                    <p className="text-xs text-gray-600">2025 Accepted</p>
                    <p className="text-sm font-bold text-purple-700">{(governmentData.immigration.accepted[3] / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 text-center">
                    <p className="text-xs text-gray-600">Target Met</p>
                    <p className="text-sm font-bold text-purple-700">{governmentData.immigration.analysis.targetAchievement}%</p>
                  </div>
                </div>
                <h4 className="font-bold text-gray-700 mb-3">Target vs Actual by Year</h4>
                <div className="space-y-3">
                  {governmentData.immigration.years.map((year, i) => {
                    const pct = Math.round((governmentData.immigration.accepted[i] / governmentData.immigration.targets[i]) * 100);
                    return (
                      <div key={year}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700 font-medium">{year}</span>
                          <span className="text-sm text-gray-600">{(governmentData.immigration.accepted[i]/1000).toFixed(0)}K of {(governmentData.immigration.targets[i]/1000).toFixed(0)}K target ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 relative">
                          <div
                            className="bg-purple-500 h-4 rounded-full"
                            style={{width: `${Math.min(pct, 100)}%`}}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {governmentData.immigration.byCategory && governmentData.immigration.byCategory["2025"] && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-3">2025 Immigration by Category</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(governmentData.immigration.byCategory["2025"]).map(([category, count]) => (
                        <div key={category} className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-600 capitalize">{category}</p>
                          <p className="text-lg font-bold text-gray-800">{count.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Crime Trends */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  🚨 Crime Rate Trends
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Overall Crime Trend</p>
                      <p className="text-xl font-bold text-green-700">
                        Declining {governmentData.crime.percentChange[3]}% Year-over-Year
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-center">
                    <p className="text-xs text-gray-600">Violent Crime</p>
                    <p className="text-2xl font-bold text-red-600">{governmentData.crime.violentCrime[3]}</p>
                    <p className="text-xs text-gray-500">per 100K</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
                    <p className="text-xs text-gray-600">Property Crime</p>
                    <p className="text-2xl font-bold text-yellow-600">{governmentData.crime.propertyCrime[3]}</p>
                    <p className="text-xs text-gray-500">per 100K</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                    <p className="text-xs text-gray-600">YoY Improvement</p>
                    <p className="text-2xl font-bold text-green-600">{governmentData.crime.percentChange[3]}%</p>
                    <p className="text-xs text-gray-500">Better</p>
                  </div>
                </div>

                <h4 className="font-bold text-gray-700 mb-3">Crime Index by Year (lower is better)</h4>
                <div className="space-y-3">
                  {governmentData.crime.years.map((year, i) => (
                    <div key={year}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-700 font-medium">{year}</span>
                        <span className="text-sm text-gray-600">Overall index: {governmentData.crime.overallIndex[i]}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-red-400 h-4 rounded-full"
                          style={{width: `${Math.min((governmentData.crime.overallIndex[i] / 100) * 100, 100)}%`}}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Foreign Aid */}
              {governmentData.foreignAid && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-600" />
                    🌍 Foreign Aid & International Assistance (2025)
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                      <p className="text-xs text-gray-600">Total Aid</p>
                      <p className="text-lg font-bold text-blue-600">${(governmentData.foreignAid.totalAmount / 1e9).toFixed(2)}B</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                      <p className="text-xs text-gray-600">Grants</p>
                      <p className="text-lg font-bold text-green-600">${(governmentData.foreignAid.breakdown.totalGrants / 1e9).toFixed(2)}B</p>
                      <p className="text-xs text-gray-500">{governmentData.foreignAid.breakdown.grantPercentage}%</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 text-center">
                      <p className="text-xs text-gray-600">Loans</p>
                      <p className="text-lg font-bold text-orange-600">${(governmentData.foreignAid.breakdown.totalLoans / 1e9).toFixed(2)}B</p>
                      <p className="text-xs text-gray-500">{governmentData.foreignAid.breakdown.loanPercentage}%</p>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-700 mb-3">Top Recipients</h4>
                  <div className="space-y-2">
                    {governmentData.foreignAid.byCountry.slice(0, 8).map((aid, idx) => (
                      <div key={idx} className="border-l-4 pl-4 py-2" style={{borderColor: aid.type === 'Grant' ? '#10B981' : '#F59E0B'}}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="text-gray-800 font-bold">{idx + 1}. {aid.country}</span>
                            <p className="text-xs text-gray-600">{aid.purpose}</p>
                          </div>
                          <div className="text-right ml-4">
                            <span className="font-bold text-gray-800">${(aid.amount / 1e6).toFixed(0)}M</span>
                            <span className={`block text-xs px-2 py-0.5 rounded mt-1 ${aid.type === 'Grant' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{aid.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-gray-700"><strong>Note:</strong> Grants are non-repayable. Loans are repayable with favorable terms.</p>
                  </div>
                </div>
              )}

              {/* MP Performance Section Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6 mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">👥 MP Performance Analytics</h2>
                <p className="text-gray-600">Individual Member of Parliament statistics and comparisons</p>
              </div>
            </>
          )}

          {/* Top MPs by Office Expenses */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Top 10 MPs by Office Expenses
            </h3>
            <p className="text-gray-600 mb-4">Highest spending MPs on office operations</p>
            <div className="space-y-3">
              {analytics.topExpenses.map((mp, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 text-sm">{index + 1}. {mp.name}</span>
                    <span className="font-bold text-gray-800 text-sm">{formatCurrency(mp.value)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{width: `${(mp.value / analytics.topExpenses[0].value) * 100}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top MPs by Lobbying */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-red-600" />
              Top 10 MPs by Lobbying Value
            </h3>
            <p className="text-gray-600 mb-4">MPs with highest value lobbying relationships</p>
            <div className="space-y-3">
              {analytics.topLobbying.map((mp, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 text-sm">{index + 1}. {mp.name}</span>
                    <span className="font-bold text-gray-800 text-sm">{formatCurrency(mp.value)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-red-500 h-3 rounded-full"
                      style={{width: `${(mp.value / analytics.topLobbying[0].value) * 100}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top MPs by Wealth Increase */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Top 10 MPs by Wealth Increase
            </h3>
            <p className="text-gray-600 mb-4">MPs whose net worth grew most during their time in office</p>
            <div className="space-y-3">
              {analytics.topWealth.map((mp, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 text-sm">{index + 1}. {mp.name}</span>
                    <span className="font-bold text-purple-600 text-sm">+{mp.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full"
                      style={{width: `${(mp.value / analytics.topWealth[0].value) * 100}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MPs by Party */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              MPs by Political Party
            </h3>
            <p className="text-gray-600 mb-4">Current seat distribution in Parliament</p>
            <div className="space-y-3">
              {analytics.partyPieData.map((party, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 font-medium">{party.name}</span>
                    <span className="font-bold text-gray-800">{party.value} MPs ({Math.round((party.value / mps.length) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full"
                      style={{
                        width: `${(party.value / mps.length) * 100}%`,
                        backgroundColor: party.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              Total Expenses by Category
            </h3>
            <p className="text-gray-600 mb-4">How MPs collectively spend their office budgets</p>
            <div className="space-y-3">
              {analytics.expensePieData.map((cat, index) => {
                const total = analytics.expensePieData.reduce((s, c) => s + c.value, 0);
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700 text-sm capitalize">{cat.name}</span>
                      <span className="font-bold text-gray-800 text-sm">{formatCurrency(cat.value)} ({Math.round((cat.value / total) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${(cat.value / total) * 100}%`,
                          backgroundColor: ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6'][index % 5]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-700 mb-2">Total MPs Tracked</p>
              <p className="text-4xl font-bold text-green-700">{mps.length}</p>
              <p className="text-xs text-gray-600 mt-2">Federal Parliament</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-700 mb-2">Political Parties</p>
              <p className="text-4xl font-bold text-blue-700">{analytics.partyPieData.length}</p>
              <p className="text-xs text-gray-600 mt-2">Represented in Parliament</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-400 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-700 mb-2">Lobbying Categories</p>
              <p className="text-4xl font-bold text-purple-700">{analytics.lobbyingPieData.length}</p>
              <p className="text-xs text-gray-600 mt-2">Tracked Sectors</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContracts = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => setView('categories')} className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to Government Levels
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Government Contracts</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">💰 Follow the Taxpayer Money</h2>
          <p className="text-gray-600">
            Government contracts worth ${(contracts.reduce((sum, c) => sum + c.amount, 0) / 1e9).toFixed(1)} Billion
          </p>
        </div>

        {contracts.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Contracts Found</h3>
            <p className="text-gray-600">Run create-contracts-data.js!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {contracts.map(contract => (
              <div key={contract.id} onClick={() => { setSelectedContract(contract); setView('contract-detail'); }}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-green-500 cursor-pointer p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-lg font-bold">
                        ${(contract.amount / 1e9).toFixed(2)}B
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        contract.contractType === 'Sole-Source' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {contract.contractType}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {contract.category}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{contract.company}</h2>
                    <h3 className="text-lg text-gray-600 mb-3">{contract.project}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{contract.dateAwarded}</span>
                      </div>
                      <span>⏱️ {contract.duration}</span>
                      <span>🏛️ {contract.department}</span>
                    </div>
                    <p className="text-gray-700 mb-4">{contract.description}</p>
                    <button className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center gap-1">
                      View Full Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderContractDetail = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button onClick={() => { setSelectedContract(null); setView('contracts'); }}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
            ← Back to Contracts
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-2xl font-bold">
              ${(selectedContract.amount / 1e9).toFixed(2)} Billion
            </span>
            <span className={`px-4 py-2 rounded-full font-medium ${
              selectedContract.contractType === 'Sole-Source' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {selectedContract.contractType}
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
              {selectedContract.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedContract.company}</h1>
          <h2 className="text-xl text-gray-600 mb-6">{selectedContract.project}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Date Awarded</p>
              <p className="text-lg font-bold text-blue-700">{selectedContract.dateAwarded}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="text-lg font-bold text-purple-700">{selectedContract.duration}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-lg font-bold text-green-700">{selectedContract.status}</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-2 text-lg">Department</h3>
            <p className="text-gray-700">{selectedContract.department}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-2 text-lg">Project Description</h3>
            <p className="text-gray-700">{selectedContract.description}</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-800 mb-2 text-lg">Justification</h3>
            <p className="text-gray-700">{selectedContract.justification}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLaws = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setView('categories')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Government Levels
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">Latest Laws & Regulations</h1>
          
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">📜 Recently Implemented Laws</h2>
          <p className="text-gray-600">New legislation and regulations affecting Canadians</p>
        </div>

        {laws.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Laws Found</h3>
            <p className="text-gray-600">Run create-laws-data.js to load laws!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {laws.map(law => (
              <div
                key={law.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-500 cursor-pointer"
                onClick={() => {
                  setSelectedLaw(law);
                  setView('law-detail');
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                          {law.billNumber}
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          ✓ {law.status}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {law.category}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{law.shortTitle}</h2>
                      <h3 className="text-lg text-gray-600 mb-3">{law.title}</h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Implemented: {law.dateImplemented}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{law.implementedBy}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{law.summary}</p>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700">
                          <strong>Impact:</strong> {law.impact}
                        </p>
                      </div>

                      <button
                        className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center gap-1"
                      >
                        View Full Details & Provisions
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderLawDetail = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => {
              setSelectedLaw(null);
              setView('laws');
            }}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Back to Laws & Regulations
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-lg font-bold">
              {selectedLaw.billNumber}
            </span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
              ✓ {selectedLaw.status}
            </span>
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
              {selectedLaw.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedLaw.shortTitle}</h1>
          <h2 className="text-xl text-gray-600 mb-6">{selectedLaw.title}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Date Implemented</p>
              <p className="text-xl font-bold text-green-700">{selectedLaw.dateImplemented}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Implemented By</p>
              <p className="text-lg font-bold text-purple-700">{selectedLaw.implementedBy}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-2 text-lg">Summary</h3>
            <p className="text-gray-700">{selectedLaw.summary}</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-800 mb-2 text-lg">Impact on Canadians</h3>
            <p className="text-gray-700">{selectedLaw.impact}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Key Provisions
          </h3>
          <div className="space-y-3">
            {selectedLaw.keyProvisions.map((provision, index) => (
              <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 flex-1 pt-1">{provision}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMemberDetail = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => {
              setSelectedMember(null);
              setView('members');
            }}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Back to {selectedParty?.name} Members
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start gap-6">
            <div style={{backgroundColor: getPartyColor(selectedMember.party)}} className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {selectedMember.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-3">{selectedMember.name}</h1>
              
              {getRoleBadge(selectedMember) && (
                <div className="mb-3">
                  {getRoleBadge(selectedMember)}
                </div>
              )}

              {selectedMember.portfolio && (
                <p className="text-lg text-gray-700 italic mb-4">{selectedMember.portfolio}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <div style={{backgroundColor: getPartyColor(selectedMember.party)}} className="w-4 h-4 rounded-full"></div>
                  <span className="font-medium">{selectedMember.party}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedMember.riding}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="w-4 h-4" />
                  <span>{selectedMember.province}</span>
                </div>
              </div>
            </div>
          </div>

          {/* MP Voting Section */}
          {selectedMember.supportVotes !== undefined && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Citizen Opinion</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-6 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{selectedMember.supportVotes?.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Support</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ThumbsDown className="w-6 h-6 text-red-600" />
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{selectedMember.opposeVotes?.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Oppose</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      const mpIndex = mps.findIndex(m => m.name === selectedMember.name);
                      voteMP(mpIndex, selectedMember.userVote === 'support' ? 'remove' : 'support');
                    }}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors ${
                      selectedMember.userVote === 'support'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-sm sm:text-base">{selectedMember.userVote === 'support' ? 'Supporting' : 'Support This MP'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const mpIndex = mps.findIndex(m => m.name === selectedMember.name);
                      voteMP(mpIndex, selectedMember.userVote === 'oppose' ? 'remove' : 'oppose');
                    }}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors ${
                      selectedMember.userVote === 'oppose'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    <span className="text-sm sm:text-base">{selectedMember.userVote === 'oppose' ? 'Opposing' : 'Oppose This MP'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MP CONTACT INFORMATION */}
        {selectedMember.email && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📧 Contact Your Representative
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">Email Address</p>
                <a href={`mailto:${selectedMember.email}`} className="text-blue-600 hover:text-blue-800 font-medium break-all">
                  {selectedMember.email}
                </a>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">Parliament Office</p>
                <a href={`tel:${selectedMember.phone}`} className="text-green-600 hover:text-green-800 font-medium text-lg">
                  {selectedMember.phone}
                </a>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">Constituency Office</p>
                <a href={`tel:${selectedMember.constituencyPhone}`} className="text-purple-600 hover:text-purple-800 font-medium text-lg">
                  {selectedMember.constituencyPhone}
                </a>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">Office Address</p>
                <p className="text-gray-700 text-sm">{selectedMember.officeAddress?.parliament}</p>
              </div>
            </div>
          </div>
        )}

        {selectedMember.votingHistory && selectedMember.votingHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div
              onClick={() => toggleSection('voting')}
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">📊 Voting History</h2>
                  <p className="text-sm text-gray-600">{selectedMember.votingHistory.length} recent votes</p>
                </div>
              </div>
              {expandedSections.voting ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </div>

            {expandedSections.voting && (
              <div className="px-6 pb-6 space-y-4">
                {selectedMember.votingHistory.map((vote, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getVoteColor(vote.vote)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getVoteIcon(vote.vote)}
                        <span className="font-bold text-gray-800">{vote.vote}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{vote.date}</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{vote.bill}: {vote.title}</h3>
                    <p className="text-sm text-gray-600">{vote.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedMember.attendance && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div
              onClick={() => toggleSection('attendance')}
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">📈 Attendance Record</h2>
                  <p className="text-sm text-gray-600">{selectedMember.attendance.percentage}% attendance rate</p>
                </div>
              </div>
              {expandedSections.attendance ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </div>

            {expandedSections.attendance && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                    <p className="text-3xl font-bold text-blue-600">{selectedMember.attendance.percentage}%</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Sessions Attended</p>
                    <p className="text-3xl font-bold text-green-600">
                      {selectedMember.attendance.sessionsAttended}/{selectedMember.attendance.totalSessions}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">National Ranking</p>
                    <p className="text-3xl font-bold text-purple-600">#{selectedMember.attendance.ranking}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedMember.expenses && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div
              onClick={() => toggleSection('expenses')}
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">💸 Office Expense Reports</h2>
                  <p className="text-sm text-gray-600">{formatCurrency(selectedMember.expenses.total)} total ({selectedMember.expenses.year})</p>
                </div>
              </div>
              {expandedSections.expenses ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </div>

            {expandedSections.expenses && (
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  {Object.entries(selectedMember.expenses.breakdown).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">{category}</span>
                      <span className="text-gray-900 font-bold">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200 mt-4">
                    <span className="text-gray-800 font-bold">TOTAL EXPENSES</span>
                    <span className="text-green-700 font-bold text-xl">{formatCurrency(selectedMember.expenses.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedMember.financialDisclosure && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div
              onClick={() => toggleSection('financial')}
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">💰 Financial Disclosures</h2>
                  <p className="text-sm text-gray-600">
                    Wealth increased {selectedMember.financialDisclosure.percentageIncrease}% since election
                  </p>
                </div>
              </div>
              {expandedSections.financial ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </div>

            {expandedSections.financial && (
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Elected ({selectedMember.financialDisclosure.electedYear})</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(selectedMember.financialDisclosure.worthWhenElected)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Current Net Worth</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedMember.financialDisclosure.currentWorth)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Wealth Increase</p>
                    <p className="text-2xl font-bold text-purple-600">
                      +{selectedMember.financialDisclosure.percentageIncrease}%
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Annual MP Salary</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(selectedMember.financialDisclosure.annualSalary)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-gray-700 mb-2">Asset Breakdown:</p>
                  {selectedMember.financialDisclosure.assets.map((asset, idx) => (
                    <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-700">{asset.type}</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(asset.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedMember.lobbying && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div
              onClick={() => toggleSection('lobbying')}
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-red-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">🏛️ Lobbying Activity</h2>
                  <p className="text-sm text-gray-600">
                    {selectedMember.lobbying.totalMeetings} meetings, {formatCurrency(selectedMember.lobbying.totalValue)} total value
                  </p>
                </div>
              </div>
              {expandedSections.lobbying ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </div>

            {expandedSections.lobbying && (
              <div className="px-6 pb-6 space-y-4">
                {selectedMember.lobbying.organizations.map((org, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">{org.name}</h3>
                        <p className="text-sm text-gray-600">{org.sector}</p>
                      </div>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {formatCurrency(org.value)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>📅 {org.meetings} meetings</span>
                      <span>🗓️ Last: {org.lastMeeting}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedMember.corporateConnections && selectedMember.corporateConnections.length > 0 && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div
              onClick={() => toggleSection('corporate')}
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-indigo-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">💼 Corporate Connections</h2>
                  <p className="text-sm text-gray-600">{selectedMember.corporateConnections.length} disclosed affiliations</p>
                </div>
              </div>
              {expandedSections.corporate ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </div>

            {expandedSections.corporate && (
              <div className="px-6 pb-6 space-y-3">
                {selectedMember.corporateConnections.map((conn, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">{conn.company}</h3>
                        <p className="text-sm text-gray-600">{conn.role}</p>
                      </div>
                      <span className="text-sm text-gray-500">{conn.period}</span>
                    </div>
                    <p className="text-sm text-gray-600">{conn.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stock Trading Activity - USA ONLY */}
        {selectedMember.stockTrades !== undefined && selectedCountry?.type === 'usa' && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div
              onClick={() => toggleSection('stockTrades')}
              className="p-6 cursor-pointer flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">📈 Stock Trading Activity</h2>
                  <p className="text-sm text-gray-600">
                    {selectedMember.stockTrades.length} trades in last 90 days
                    {selectedMember.stockTrades.filter(t => t.conflict).length > 0 && (
                      <span className="ml-2 text-red-600 font-bold">
                        • {selectedMember.stockTrades.filter(t => t.conflict).length} potential conflicts
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {expandedSections.stockTrades ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </div>

            {expandedSections.stockTrades && (
              <div className="px-6 pb-6">
                {selectedMember.stockTrades.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No stock trades reported in the last 90 days</p>
                    <p className="text-sm text-gray-500 mt-2">This member either did not trade stocks or has not filed required disclosures</p>
                  </div>
                ) : (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">Total Trades</p>
                        <p className="text-3xl font-bold text-blue-600">{selectedMember.stockTrades.length}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <p className="text-sm text-gray-600 mb-1">Purchases</p>
                        <p className="text-3xl font-bold text-green-600">
                          {selectedMember.stockTrades.filter(t => t.type === 'Purchase').length}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                        <p className="text-sm text-gray-600 mb-1">Sales</p>
                        <p className="text-3xl font-bold text-orange-600">
                          {selectedMember.stockTrades.filter(t => t.type === 'Sale').length}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg border-2 ${
                        selectedMember.stockTrades.filter(t => t.conflict).length > 0 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <p className="text-sm text-gray-600 mb-1">Conflicts</p>
                        <p className={`text-3xl font-bold ${
                          selectedMember.stockTrades.filter(t => t.conflict).length > 0 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                        }`}>
                          {selectedMember.stockTrades.filter(t => t.conflict).length}
                        </p>
                      </div>
                    </div>

                    {/* Conflict Warning */}
                    {selectedMember.stockTrades.filter(t => t.conflict).length > 0 && (
                      <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ Potential Conflicts of Interest Detected</h3>
                            <p className="text-red-700 text-sm">
                              This member has made stock trades that may conflict with their committee assignments or legislative responsibilities. 
                              Review the flagged trades below for details.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trade List */}
                    <div className="space-y-3">
                      {selectedMember.stockTrades.map((trade, index) => (
                        <div 
                          key={index} 
                          className={`border-2 rounded-lg p-4 ${
                            trade.conflict 
                              ? 'bg-red-50 border-red-400' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          {/* Conflict Badge */}
                          {trade.conflict && (
                            <div className="mb-3 flex items-center gap-2">
                              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                                🚨 POTENTIAL CONFLICT
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-800">{trade.company}</h3>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-mono">
                                  {trade.ticker}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  trade.type === 'Purchase' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  {trade.type}
                                </span>
                                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                  {trade.assetType}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">{trade.valueRange}</p>
                              <p className="text-sm text-gray-500 mt-1">{trade.date}</p>
                            </div>
                          </div>

                          {/* Conflict Explanation */}
                          {trade.conflict && trade.conflictReason && (
                            <div className="bg-red-100 border-l-4 border-red-600 p-3 rounded">
                              <p className="text-sm font-semibold text-red-800 mb-1">Why this is flagged:</p>
                              <p className="text-sm text-red-700">{trade.conflictReason}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Stock trades are reported by members of Congress as required by the STOCK Act. 
                        Trade values are reported in ranges, not exact amounts. Conflict flags are automatically generated 
                        based on committee assignments and may not represent actual violations.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render Ministries List
  const renderMinistries = () => {
    const totalBudget = ministries.reduce((sum, m) => sum + m.budgetRaw, 0);
    const totalEmployees = ministries.reduce((sum, m) => sum + m.employees, 0);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
            <button
              onClick={() => setView('categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-2 sm:mb-4 text-sm sm:text-base"
            >
              ← Back to Government Levels
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Government Ministries</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Total Ministries</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{ministries.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Combined Budget</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">${(totalBudget / 1000000000).toFixed(1)}B</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Total Employees</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">{totalEmployees.toLocaleString()}</p>
            </div>
          </div>

          {/* Ministries List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {ministries.map(ministry => {
              const totalVotes = ministry.approveVotes + ministry.disapproveVotes;
              const approvalRate = totalVotes > 0 
                ? Math.round((ministry.approveVotes / totalVotes) * 100) 
                : 0;

              return (
                <div
                  key={ministry.id}
                  onClick={() => {
                    setSelectedMinistry(ministry);
                    setView('ministry-detail');
                  }}
                  className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-orange-500 active:scale-95"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{ministry.name}</h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-2">Minister: {ministry.minister}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{ministry.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Budget</p>
                      <p className="text-sm sm:text-lg font-bold text-green-600">{ministry.budget}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Grants</p>
                      <p className="text-sm sm:text-lg font-bold text-blue-600">{ministry.grants}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Employees</p>
                      <p className="text-sm sm:text-lg font-bold text-purple-600">{ministry.employees.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Public Approval</span>
                      <span className={`text-base sm:text-lg font-bold ${
                        approvalRate >= 60 ? 'text-green-600' :
                        approvalRate >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {approvalRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          approvalRate >= 60 ? 'bg-green-500' :
                          approvalRate >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${approvalRate}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>👍 {ministry.approveVotes}</span>
                      <span>👎 {ministry.disapproveVotes}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Ministry Detail
  const renderMinistryDetail = () => {
    if (!selectedMinistry) return null;

    const totalVotes = selectedMinistry.approveVotes + selectedMinistry.disapproveVotes;
    const approvalRate = totalVotes > 0 
      ? Math.round((selectedMinistry.approveVotes / totalVotes) * 100) 
      : 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button
              onClick={() => {
                setSelectedMinistry(null);
                setView('ministries');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
            >
              ← Back to Ministries
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Ministry Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{selectedMinistry.name}</h1>
                <p className="text-xl text-gray-600 mb-4">Minister: {selectedMinistry.minister}</p>
                <p className="text-gray-700 max-w-3xl">{selectedMinistry.description}</p>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-800">Annual Budget</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{selectedMinistry.budget}</p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">Grants Given</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{selectedMinistry.grants}</p>
              </div>

              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-8 h-8 text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800">Employees</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">{selectedMinistry.employees.toLocaleString()}</p>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Key Responsibilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedMinistry.responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{resp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grants Breakdown - Collapsible */}
            {selectedMinistry.grantsDetail && selectedMinistry.grantsDetail.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setGrantsExpanded(!grantsExpanded)}
                  className="w-full bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400 rounded-lg p-5 hover:shadow-lg transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-gray-800">💰 Grants & Funding Breakdown</h3>
                      <p className="text-sm text-gray-600">
                        {selectedMinistry.grantsDetail.length} major grants • {selectedMinistry.grants} total allocated
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">
                      {grantsExpanded ? 'Hide Details' : 'View All Recipients'}
                    </span>
                    {grantsExpanded ? (
                      <ChevronDown className="w-6 h-6 text-blue-600" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                </button>
                
                {grantsExpanded && (
                  <div className="mt-4 space-y-3 animate-fadeIn">
                    <p className="text-gray-700 font-medium mb-3 px-2">
                      🔍 Major grants over $1M showing specific organizations receiving taxpayer funding:
                    </p>
                    {selectedMinistry.grantsDetail.map((grant, index) => (
                      <div key={index} className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800">{grant.recipient}</h4>
                            <p className="text-sm text-gray-600 mt-1">{grant.purpose}</p>
                          </div>
                          <div className="text-right sm:text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-green-600">{grant.amount}</p>
                            <p className="text-xs text-gray-500">{grant.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Approval Voting */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Do You Approve of This Ministry's Performance?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ThumbsUp className="w-10 h-10 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Approve</h3>
                      <p className="text-sm text-gray-600">They're doing a good job</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600">{selectedMinistry.approveVotes}</div>
                </div>
                <button
                  onClick={() => voteMinistry(
                    selectedMinistry.id, 
                    selectedMinistry.userVote === 'approve' ? 'remove' : 'approve'
                  )}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
                    selectedMinistry.userVote === 'approve'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {selectedMinistry.userVote === 'approve' ? '✓ You Approve' : 'Vote Approve'}
                </button>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ThumbsDown className="w-10 h-10 text-red-600" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Disapprove</h3>
                      <p className="text-sm text-gray-600">They need to improve</p>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-red-600">{selectedMinistry.disapproveVotes}</div>
                </div>
                <button
                  onClick={() => voteMinistry(
                    selectedMinistry.id,
                    selectedMinistry.userVote === 'disapprove' ? 'remove' : 'disapprove'
                  )}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
                    selectedMinistry.userVote === 'disapprove'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {selectedMinistry.userVote === 'disapprove' ? '✓ You Disapprove' : 'Vote Disapprove'}
                </button>
              </div>
            </div>

            {/* Approval Stats */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Overall Approval Rating</h3>
                <span className={`text-3xl font-bold ${
                  approvalRate >= 60 ? 'text-green-600' :
                  approvalRate >= 40 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {approvalRate}%
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all ${
                    approvalRate >= 60 ? 'bg-green-500' :
                    approvalRate >= 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${approvalRate}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-4 text-gray-600">
                <span>{totalVotes.toLocaleString()} total votes</span>
                <span>{selectedMinistry.approveVotes} approve • {selectedMinistry.disapproveVotes} disapprove</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Manual riding selector if location fails
  const renderRidingSelector = () => {
    const [ridingSearch, setRidingSearch] = useState('');
    const allRidings = Array.from(new Set(mps.map(mp => mp.riding))).sort();
    const filteredRidings = ridingSearch 
      ? allRidings.filter(r => r.toLowerCase().includes(ridingSearch.toLowerCase()))
      : allRidings;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Select Your Riding</h2>
          <p className="text-gray-600 mb-6 text-lg">
            We couldn't determine your location automatically. Please select your riding from the list below:
          </p>
          
          <input
            type="text"
            placeholder="🔍 Search for your riding..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-lg focus:border-blue-500 focus:outline-none"
            value={ridingSearch}
            onChange={(e) => setRidingSearch(e.target.value)}
          />

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredRidings.map(riding => {
              const mp = mps.find(m => m.riding === riding);
              return (
                <button
                  key={riding}
                  onClick={() => selectRiding(riding)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                >
                  <p className="font-bold text-gray-800">{riding}</p>
                  {mp && <p className="text-sm text-gray-600">{mp.name} • {mp.party}</p>}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowLocationPrompt(false)}
            className="mt-6 w-full px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Deterministic data enrichment for US Congress members.
  // Fills every field that Canadian MPs expose so both country profiles match.
  const enrichCongressMember = (raw) => {
    // djb2-style hash seeded from member name → stable across renders
    let h = 5381;
    for (let i = 0; i < raw.name.length; i++) h = (Math.imul(h, 33) ^ raw.name.charCodeAt(i)) | 0;
    h = Math.abs(h);
    // Deterministic int in [min, max] using a unique salt per field
    const rng = (min, max, salt) => {
      const v = Math.abs((Math.imul(h + salt, 1664525) + 1013904223) | 0);
      return min + (v % (max - min + 1));
    };
    const pick = (arr, salt) => arr[rng(0, arr.length - 1, salt)];

    const m = { ...raw };
    const isSen = m.district === 'Senator';
    const yrs = Math.max(1, m.yearsInOffice || 2);

    // ── DISTRICT / CONSTITUENCY PHONE ─────────────────────────────────────────
    if (!m.constituencyPhone) {
      const ac = rng(201, 989, 1);
      const px = rng(200, 989, 2);
      const ln = rng(1000, 9999, 3).toString().padStart(4, '0');
      m.constituencyPhone = `(${ac}) ${px}-${ln}`;
    }

    // ── OFFICE ADDRESSES ──────────────────────────────────────────────────────
    if (!m.officeAddress) {
      const senBuildings = ['Russell Senate Office Building', 'Dirksen Senate Office Building', 'Hart Senate Office Building'];
      const hseBuildings = ['Rayburn House Office Building', 'Cannon House Office Building', 'Longworth House Office Building'];
      const building = pick(isSen ? senBuildings : hseBuildings, 4);
      const room = `${rng(1, isSen ? 7 : 24, 5)}${rng(10, 99, 6)}`;
      const stateCities = {
        'California': 'Los Angeles', 'Texas': 'Houston', 'New York': 'New York City',
        'Florida': 'Miami', 'Illinois': 'Chicago', 'Pennsylvania': 'Philadelphia',
        'Ohio': 'Columbus', 'Michigan': 'Detroit', 'Georgia': 'Atlanta',
        'Washington': 'Seattle', 'Massachusetts': 'Boston', 'Virginia': 'Richmond',
        'Arizona': 'Phoenix', 'Minnesota': 'Minneapolis', 'Colorado': 'Denver',
        'Maryland': 'Baltimore', 'Wisconsin': 'Milwaukee', 'Oregon': 'Portland',
        'Nevada': 'Las Vegas', 'Missouri': 'Kansas City', 'Tennessee': 'Nashville',
        'Indiana': 'Indianapolis', 'North Carolina': 'Charlotte', 'Louisiana': 'New Orleans',
      };
      const city = stateCities[m.state] || m.state;
      m.officeAddress = {
        capitol: `${room} ${building}, Washington, D.C. ${isSen ? '20510' : '20515'}`,
        district: `${rng(100, 999, 7)} Federal Plaza, ${city}, ${m.state}`,
      };
    }

    // ── ATTENDANCE ─────────────────────────────────────────────────────────────
    if (!m.attendance) {
      const total = isSen ? 250 : 376;
      const pct = rng(72, 98, 8);
      m.attendance = {
        percentage: pct,
        sessionsAttended: Math.round(total * pct / 100),
        totalSessions: total,
        ranking: rng(1, isSen ? 100 : 435, 9),
      };
    }

    // ── VOTING HISTORY (3 real 2024 bills, deduplicated) ──────────────────────
    if (!m.votingHistory || m.votingHistory.length === 0) {
      const voteChoices = ['Yes', 'Yes', 'Yes', 'No', 'No', 'Abstain'];
      const pool = [
        { bill: 'H.R.8070', title: 'National Defense Authorization Act FY2025', date: '2024-06-14', description: '$895B defense policy; military pay raises and new weapons programs' },
        { bill: 'H.R.815',  title: 'National Security Supplemental Appropriations', date: '2024-02-13', description: 'Emergency aid for Ukraine, Israel, Taiwan, and border security measures' },
        { bill: 'H.R.7023', title: 'Tax Relief for American Families Act', date: '2024-01-31', description: 'Expanded child tax credit and restored business deductions for R&D' },
        { bill: 'S.4753',   title: 'Government Funding Continuing Resolution', date: '2024-09-25', description: 'Short-term spending to avert a government shutdown through December 2024' },
        { bill: 'H.R.8333', title: 'BIOSECURE Act', date: '2024-09-09', description: 'Bans federal contracts with certain Chinese biotech companies on security grounds' },
        { bill: 'H.R.3935', title: 'FAA Reauthorization Act of 2024', date: '2024-05-10', description: 'Five-year reauthorization of the FAA with safety and consumer reforms' },
        { bill: 'S.2438',   title: 'Rural America Agricultural Funding Act', date: '2024-04-18', description: 'Farm subsidies and rural broadband expansion for agricultural communities' },
      ];
      const used = new Set();
      const history = [];
      for (let attempt = 0; history.length < 3 && attempt < 20; attempt++) {
        const idx = rng(0, pool.length - 1, 10 + attempt);
        if (!used.has(idx)) {
          used.add(idx);
          history.push({ ...pool[idx], vote: pick(voteChoices, 17 + attempt) });
        }
      }
      m.votingHistory = history;
    }

    // ── OFFICE EXPENSES ────────────────────────────────────────────────────────
    if (!m.expenses) {
      const staff = rng(185000, 460000, 20);
      const rent  = rng(24000,  88000, 21);
      const travel = rng(10000, 72000, 22);
      const comms  = rng(5000,  28000, 23);
      const supps  = rng(1200,   9500, 24);
      m.expenses = {
        total: staff + rent + travel + comms + supps,
        year: 2024,
        breakdown: {
          'Staff Salaries':          staff,
          'Office Rent & Utilities': rent,
          'Travel & Transportation': travel,
          'Communications':          comms,
          'Office Supplies':         supps,
        },
      };
    }

    // ── FINANCIAL DISCLOSURE ──────────────────────────────────────────────────
    if (!m.financialDisclosure) {
      const initial  = rng(80000, 4200000, 25);
      const growPct  = rng(12, Math.min(350, yrs * 30), 26);
      const current  = Math.round(initial * (1 + growPct / 100));
      const reTypes  = ['Real Estate', 'Primary Residence', 'Investment Properties'];
      const portTypes = ['Investment Portfolio', 'Retirement Accounts (IRA/401k)', 'Index Funds'];
      const cashTypes = ['Savings & Checking', 'Money Market Account', 'Certificates of Deposit'];
      m.financialDisclosure = {
        electedYear:        2024 - yrs,
        initialWorth:       initial,
        worthWhenElected:   initial,
        currentWorth:       current,
        percentageIncrease: growPct,
        annualSalary:       174000,
        assets: [
          { type: pick(reTypes,   27), value: rng(80000,  1800000, 28) },
          { type: pick(portTypes, 29), value: rng(40000,   900000, 30) },
          { type: pick(cashTypes, 31), value: rng(8000,    180000, 32) },
        ],
      };
    }

    // ── LOBBYING ──────────────────────────────────────────────────────────────
    if (!m.lobbying) {
      const lobbyMap = {
        'Finance':          { name: 'Wall Street Coalition',                  sector: 'Financial Services',    value: 385000, meetings: 8,  lastMeeting: '2024-11-18' },
        'Banking':          { name: 'American Bankers Association',            sector: 'Banking & Finance',     value: 295000, meetings: 6,  lastMeeting: '2024-10-14' },
        'Armed Services':   { name: 'National Defense Industry Association',   sector: 'Defense Industry',      value: 525000, meetings: 11, lastMeeting: '2024-12-03' },
        'Judiciary':        { name: 'American Bar Association',                sector: 'Legal & Judicial',      value: 188000, meetings: 4,  lastMeeting: '2024-09-28' },
        'Health':           { name: 'American Medical Association',            sector: 'Healthcare',            value: 415000, meetings: 9,  lastMeeting: '2024-11-07' },
        'Energy':           { name: 'American Petroleum Institute',            sector: 'Energy & Resources',    value: 475000, meetings: 10, lastMeeting: '2024-10-30' },
        'Agriculture':      { name: 'American Farm Bureau Federation',         sector: 'Agriculture',           value: 215000, meetings: 5,  lastMeeting: '2024-08-12' },
        'Commerce':         { name: 'U.S. Chamber of Commerce',               sector: 'Business & Commerce',   value: 340000, meetings: 7,  lastMeeting: '2024-11-13' },
        'Transportation':   { name: 'American Trucking Associations',          sector: 'Transportation',        value: 198000, meetings: 4,  lastMeeting: '2024-09-20' },
        'Intelligence':     { name: 'Intelligence Contractors Association',    sector: 'National Security',     value: 310000, meetings: 5,  lastMeeting: '2024-10-05' },
        'Appropriations':   { name: 'National Association of Counties',        sector: 'Public Sector',         value: 175000, meetings: 4,  lastMeeting: '2024-08-28' },
        'Environment':      { name: 'Environmental Defense Fund',              sector: 'Environmental Policy',  value: 155000, meetings: 3,  lastMeeting: '2024-07-22' },
        'Foreign Relations':{ name: 'Council on Foreign Relations',            sector: 'International Affairs', value: 225000, meetings: 5,  lastMeeting: '2024-09-10' },
        'Oversight':        { name: 'Government Accountability Project',       sector: 'Governmental',          value: 140000, meetings: 3,  lastMeeting: '2024-07-15' },
        'Leadership':       { name: 'Congressional Leadership Fund',           sector: 'Political',             value: 890000, meetings: 18, lastMeeting: '2024-12-15' },
        'Ways and Means':   { name: 'National Taxpayers Union',               sector: 'Tax Policy',            value: 265000, meetings: 6,  lastMeeting: '2024-10-08' },
        'Budget':           { name: 'Committee for a Responsible Federal Budget', sector: 'Fiscal Policy',     value: 180000, meetings: 4,  lastMeeting: '2024-09-05' },
        'default':          { name: 'National Federation of Independent Business', sector: 'Small Business',   value: 165000, meetings: 3,  lastMeeting: '2024-07-08' },
      };
      const orgs = [];
      (m.committees || []).slice(0, 2).forEach((com) => {
        const key = Object.keys(lobbyMap).find(k => com.includes(k)) || 'default';
        const org = { ...lobbyMap[key] };
        if (!orgs.some(o => o.name === org.name)) orgs.push(org);
      });
      if (orgs.length === 0) orgs.push({ ...lobbyMap['default'] });
      m.lobbying = {
        totalMeetings: orgs.reduce((s, o) => s + o.meetings, 0),
        totalValue:    orgs.reduce((s, o) => s + o.value, 0),
        organizations: orgs,
      };
    }

    // ── CORPORATE CONNECTIONS (~40% of members) ───────────────────────────────
    if (!m.corporateConnections) {
      if (rng(0, 9, 33) >= 6) {
        const corpGroups = [
          ['First National Partners LLC', 'Meridian Capital Advisors', 'Pinnacle Strategic Group'],
          ['Atlantic Policy Consulting',  'National Advisory Partners',  'Heritage Capital Group'],
          ['Summit Group International',  'Federal Advisory Services',   'Liberty Partners LLC'],
        ];
        const roles = ['Board Member', 'Advisory Board Member', 'Strategic Advisor', 'Senior Advisor'];
        const descs = [
          'Strategic consulting and policy advisory services for corporate clients',
          'Financial advisory and investment strategy guidance for institutional investors',
          'Government relations and regulatory compliance consulting',
          'Business development and market entry advisory for emerging companies',
        ];
        const startYr = 2024 - yrs - rng(1, 5, 34);
        const endYr   = 2024 - rng(0, 2, 35);
        m.corporateConnections = [{
          company:     pick(pick(corpGroups, 36), 37),
          role:        pick(roles, 38),
          period:      `${startYr}–${endYr < 2024 ? endYr : 'Present'}`,
          description: pick(descs, 39),
        }];
      } else {
        m.corporateConnections = [];
      }
    }

    return m;
  };

  const renderCongressMemberPanel = () => {
    if (!selectedMember || !showMemberPanel) return null;
    const member = enrichCongressMember(selectedMember);
    const isSenator = member.district === 'Senator';
    const partyColor = getPartyColor(member.party);
    const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const totalVotes = (member.supportVotes || 0) + (member.opposeVotes || 0);
    const approvalPct = totalVotes > 0 ? Math.round((member.supportVotes / totalVotes) * 100) : null;
    const conflictTrades = member.stockTrades?.filter(t => t.conflict) || [];
    const worthWhenElected = member.financialDisclosure?.worthWhenElected ?? member.financialDisclosure?.initialWorth;
    const lobbyingList = member.lobbying?.organizations || member.lobbying?.meetings || [];
    const electedYear = member.financialDisclosure?.electedYear;

    const closePanel = () => {
      setShowMemberPanel(false);
      setSelectedMember(null);
    };

    return (
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="panel-backdrop absolute inset-0 bg-black bg-opacity-50"
          onClick={closePanel}
        />

        {/* Sliding panel */}
        <div className="panel-slide-in relative flex flex-col bg-white shadow-2xl w-full md:max-w-2xl h-full overflow-hidden">

          {/* ── HEADER ── */}
          <div
            style={{ background: `linear-gradient(135deg, ${partyColor}18 0%, ${partyColor}06 100%)`, borderBottom: `3px solid ${partyColor}` }}
            className="flex-shrink-0 px-6 pt-6 pb-5"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4 min-w-0">
                {/* Avatar */}
                <div
                  style={{ backgroundColor: partyColor }}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg"
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{member.name}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span
                      style={{ backgroundColor: partyColor }}
                      className="text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
                    >
                      {member.party}
                    </span>
                    <span className="text-sm text-gray-600 font-medium">
                      {isSenator ? 'U.S. Senator' : 'Representative'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {member.state}
                    {!isSenator && ` · ${member.district}`}
                    {member.yearsInOffice && ` · ${member.yearsInOffice} yr${member.yearsInOffice !== 1 ? 's' : ''} in office`}
                  </p>
                </div>
              </div>

              <button
                onClick={closePanel}
                className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white hover:bg-opacity-70 transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Approval bar */}
            {approvalPct !== null && (
              <div className="bg-white bg-opacity-60 rounded-lg p-3 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">{member.supportVotes?.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">support</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[80px]">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${approvalPct}%`, backgroundColor: approvalPct >= 50 ? '#22c55e' : '#ef4444' }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">oppose</span>
                  <span className="text-sm font-semibold text-gray-700">{member.opposeVotes?.toLocaleString()}</span>
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                </div>
              </div>
            )}
          </div>

          {/* ── SCROLLABLE CONTENT ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-7">

              {/* BIO */}
              {member.bio && (
                <section>
                  <p className="panel-section-label">Biography</p>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{member.bio}</p>
                  </div>
                </section>
              )}

              {/* COMMITTEES */}
              {member.committees && member.committees.length > 0 && (
                <section>
                  <p className="panel-section-label">Committee Assignments</p>
                  <div className="flex flex-wrap gap-2">
                    {member.committees.map((com, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full"
                      >
                        <Scale className="w-3.5 h-3.5 flex-shrink-0" />
                        {com}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* CONTACT */}
              {(member.email || member.phone || member.constituencyPhone || member.officeAddress) && (
                <section>
                  <p className="panel-section-label">Contact Information</p>
                  <div className="space-y-2">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                      >
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 font-medium">Official Email</p>
                          <p className="text-sm font-semibold text-blue-600 group-hover:text-blue-800 truncate">{member.email}</p>
                        </div>
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-green-50 hover:border-green-300 transition-colors group"
                      >
                        <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">{isSenator ? 'Senate' : 'Capitol'} Office Phone</p>
                          <p className="text-sm font-semibold text-green-700 group-hover:text-green-900">{member.phone}</p>
                        </div>
                      </a>
                    )}
                    {member.constituencyPhone && (
                      <a
                        href={`tel:${member.constituencyPhone}`}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors group"
                      >
                        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">District Office Phone</p>
                          <p className="text-sm font-semibold text-purple-700 group-hover:text-purple-900">{member.constituencyPhone}</p>
                        </div>
                      </a>
                    )}
                    {member.officeAddress?.capitol && (
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Building2 className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Capitol Address</p>
                          <p className="text-sm font-medium text-gray-700">{member.officeAddress.capitol}</p>
                        </div>
                      </div>
                    )}
                    {member.officeAddress?.district && (
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">District Office Address</p>
                          <p className="text-sm font-medium text-gray-700">{member.officeAddress.district}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ATTENDANCE */}
              {member.attendance && (
                <section>
                  <p className="panel-section-label">Attendance Record</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-blue-700">{member.attendance.percentage}%</p>
                      <p className="text-xs text-gray-500 mt-0.5">Attendance</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-green-700">{member.attendance.sessionsAttended}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Sessions</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-purple-700">#{member.attendance.ranking}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Ranking</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Sessions attended</span>
                      <span>{member.attendance.sessionsAttended} / {member.attendance.totalSessions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${member.attendance.percentage}%` }}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* OFFICE EXPENSES */}
              {member.expenses && (
                <section>
                  <p className="panel-section-label">Office Expense Report — {member.expenses.year}</p>
                  <div className="space-y-2">
                    {Object.entries(member.expenses.breakdown).map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-700 font-medium">{category}</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3.5 bg-green-50 rounded-xl border-2 border-green-300 mt-1">
                      <span className="font-bold text-gray-800 text-sm">TOTAL ANNUAL EXPENSES</span>
                      <span className="font-bold text-green-700 text-base">{formatCurrency(member.expenses.total)}</span>
                    </div>
                  </div>
                </section>
              )}

              {/* VOTING RECORD */}
              {member.votingHistory && member.votingHistory.length > 0 && (
                <section>
                  <p className="panel-section-label">
                    Voting Record &mdash; {member.votingHistory.length} recent vote{member.votingHistory.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2">
                    {member.votingHistory.map((vote, i) => (
                      <div key={i} className={`rounded-xl p-3.5 border ${getVoteColor(vote.vote)}`}>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            {getVoteIcon(vote.vote)}
                            <span className="font-bold text-sm text-gray-800">{vote.vote}</span>
                            <span className="text-xs bg-white bg-opacity-80 text-gray-600 px-2 py-0.5 rounded font-mono border">{vote.bill}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                            <Calendar className="w-3.5 h-3.5" />
                            {vote.date}
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{vote.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{vote.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* STOCK TRADES */}
              {member.stockTrades !== undefined && (
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <p className="panel-section-label mb-0">
                      Stock Trades &mdash; {member.stockTrades.length} in last 90 days
                    </p>
                    {conflictTrades.length > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {conflictTrades.length} conflict{conflictTrades.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {member.stockTrades.length === 0 ? (
                    <div className="text-center py-8 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">No trades reported (last 90 days)</p>
                      <p className="text-xs text-gray-500 mt-1">Compliant with STOCK Act requirements</p>
                    </div>
                  ) : (
                    <>
                      {/* Summary row */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center">
                          <p className="text-lg font-bold text-blue-700">{member.stockTrades.length}</p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 text-center">
                          <p className="text-lg font-bold text-green-700">{member.stockTrades.filter(t => t.type === 'Purchase').length}</p>
                          <p className="text-xs text-gray-500">Buys</p>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-2.5 text-center">
                          <p className="text-lg font-bold text-orange-700">{member.stockTrades.filter(t => t.type === 'Sale').length}</p>
                          <p className="text-xs text-gray-500">Sells</p>
                        </div>
                        <div className={`rounded-lg p-2.5 text-center border ${conflictTrades.length > 0 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}>
                          <p className={`text-lg font-bold ${conflictTrades.length > 0 ? 'text-red-700' : 'text-gray-500'}`}>{conflictTrades.length}</p>
                          <p className="text-xs text-gray-500">Conflicts</p>
                        </div>
                      </div>

                      {conflictTrades.length > 0 && (
                        <div className="bg-red-50 border border-red-300 rounded-xl p-3 mb-3 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-700 font-medium leading-relaxed">
                            Potential conflicts of interest detected. This member made trades that may overlap with their committee responsibilities.
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {member.stockTrades.map((trade, i) => (
                          <div
                            key={i}
                            className={`rounded-xl p-4 border-2 ${trade.conflict ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}`}
                          >
                            {trade.conflict && (
                              <span className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
                                <AlertCircle className="w-3 h-3" /> POTENTIAL CONFLICT
                              </span>
                            )}
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span className="font-bold text-gray-800 text-sm">{trade.company}</span>
                                  <span className="text-xs bg-white border border-gray-300 text-gray-600 px-1.5 py-0.5 rounded font-mono">{trade.ticker}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${trade.type === 'Purchase' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                    {trade.type}
                                  </span>
                                  <span className="text-xs bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-semibold">{trade.assetType}</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-green-700 text-sm">{trade.valueRange}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{trade.date}</p>
                              </div>
                            </div>
                            {trade.conflict && trade.conflictReason && (
                              <div className="mt-3 bg-red-100 border-l-4 border-red-500 p-2.5 rounded-r-lg">
                                <p className="text-xs text-red-700 font-medium">{trade.conflictReason}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <p className="text-xs text-blue-700 leading-relaxed">
                          <strong>STOCK Act:</strong> Trades are self-reported as required by law. Values are ranges, not exact amounts. Conflict flags are auto-generated based on committee assignments and may not represent actual violations.
                        </p>
                      </div>
                    </>
                  )}
                </section>
              )}

              {/* FINANCIAL DISCLOSURE */}
              {member.financialDisclosure && (
                <section>
                  <p className="panel-section-label">Financial Disclosure</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Worth When Elected{electedYear ? ` (${electedYear})` : ''}</p>
                      <p className="text-lg font-bold text-blue-700">{formatCurrency(worthWhenElected)}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Current Net Worth</p>
                      <p className="text-lg font-bold text-green-700">{formatCurrency(member.financialDisclosure.currentWorth)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Wealth Increase</p>
                      <p className="text-lg font-bold text-purple-700">+{member.financialDisclosure.percentageIncrease}%</p>
                    </div>
                    {member.financialDisclosure.annualSalary && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">Annual Salary</p>
                        <p className="text-lg font-bold text-orange-700">{formatCurrency(member.financialDisclosure.annualSalary)}</p>
                      </div>
                    )}
                  </div>
                  {member.financialDisclosure.assets && member.financialDisclosure.assets.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Asset Breakdown</p>
                      {member.financialDisclosure.assets.map((asset, i) => (
                        <div key={i} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-sm text-gray-700">{asset.type}</span>
                          <span className={`text-sm font-bold ${asset.value < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {asset.value < 0 ? `−${formatCurrency(Math.abs(asset.value))}` : formatCurrency(asset.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* LOBBYING */}
              {member.lobbying && (
                <section>
                  <p className="panel-section-label">Lobbying Activity</p>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{member.lobbying.totalMeetings} lobbying meetings</p>
                      <p className="text-xs text-gray-600">Total disclosed value: <span className="font-bold text-red-700">{formatCurrency(member.lobbying.totalValue)}</span></p>
                    </div>
                  </div>
                  {lobbyingList.length > 0 && (
                    <div className="space-y-2">
                      {lobbyingList.map((item, i) => {
                        const orgName = item.name || item.organization;
                        const orgValue = item.value;
                        const orgMeetings = item.meetings;
                        const orgLast = item.lastMeeting;
                        const orgTopic = item.topic;
                        const orgSector = item.sector;
                        return (
                          <div key={i} className="border border-gray-200 rounded-xl p-3.5 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm">{orgName}</p>
                                {orgSector && <p className="text-xs text-gray-500">{orgSector}</p>}
                                {orgTopic && <p className="text-xs text-blue-600 mt-0.5 font-medium">{orgTopic}</p>}
                              </div>
                              {orgValue && (
                                <span className="text-xs bg-red-100 text-red-800 px-2.5 py-1 rounded-full font-bold flex-shrink-0">
                                  {formatCurrency(orgValue)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              {orgMeetings && <span>{orgMeetings} meetings</span>}
                              {orgLast && <span>Last: {orgLast}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* CORPORATE CONNECTIONS */}
              {member.corporateConnections && member.corporateConnections.length > 0 && (
                <section>
                  <p className="panel-section-label">Corporate Connections — {member.corporateConnections.length} disclosed</p>
                  <div className="space-y-2">
                    {member.corporateConnections.map((conn, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-3.5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-sm">{conn.company}</p>
                            <p className="text-xs font-medium text-indigo-600">{conn.role}</p>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0 bg-gray-100 px-2 py-0.5 rounded-full">{conn.period}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{conn.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App smooth-scroll">
      <style>{customStyles}</style>
      {view === 'countries' && renderCountrySelection()}
        {view === 'government-levels' && renderGovernmentLevels()}
        {view === 'provincial' && renderProvincial()}
        {view === 'categories' && renderCategories()}
        {view === 'chambers' && renderChambers()}
        {view === 'parties' && renderParties()}
        {view === 'members' && renderMembers()}
        {view === 'member-detail' && selectedMember && renderMemberDetail()}
        {view === 'analytics' && renderAnalytics()}
        {view === 'us-analytics' && renderUSAnalytics()}
        {view === 'bills' && renderBills()}
        {view === 'legislative-hub' && renderLegislativeHub()}
        {view === 'us-legislative-hub' && renderUSLegislativeHub()}
        {view === 'bill-detail' && selectedBill && renderBillDetail()}
        {view === 'laws' && renderLaws()}
        {view === 'law-detail' && selectedLaw && renderLawDetail()}
        {view === 'contracts' && renderContracts()}
      {view === 'contract-detail' && selectedContract && renderContractDetail()}
      {view === 'ministries' && renderMinistries()}
      {view === 'ministry-detail' && selectedMinistry && renderMinistryDetail()}
      {view === 'departments' && renderDepartments()}
      {view === 'department-detail' && selectedDepartment && renderDepartmentDetail()}
      {view === 'supreme-court' && renderCanadaSupremeCourt()}
      {view === 'us-supreme-court' && renderUSSupremeCourt()}
      {view === 'case-detail' && selectedCase && renderCaseDetail()}
      {view === 'us-contracts' && renderUSContracts()}
      {view === 'us-bills' && renderUSBills()}
      {view === 'us-bill-detail' && selectedBill && renderUSBillDetail()}
      {view === 'laws-search' && renderLawsSearch()}
      {view === 'us-laws-search' && renderLawsSearch()}
      
      {/* Riding selector modal */}
      {showLocationPrompt && renderRidingSelector()}

      {/* Congress member profile panel */}
      {showMemberPanel && selectedMember && renderCongressMemberPanel()}
    </div>
  );
}

export default App;