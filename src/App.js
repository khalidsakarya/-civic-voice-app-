import React, { useState, useEffect } from 'react';
import { Menu, ChevronRight, ChevronDown, Globe, Users, FileText, AlertCircle, MapPin, Calendar, Award, CheckCircle, XCircle, MinusCircle, DollarSign, TrendingUp, Briefcase, Building2, Search, X, Filter, BarChart3, PieChart, ThumbsUp, ThumbsDown, Clock, Crown, Star, Scale } from 'lucide-react';
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
`;

function App() {
  const [view, setView] = useState('countries');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  
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
      // SENATE - Leadership & Key Members with FULL features
      { 
        name: 'Chuck Schumer', state: 'New York', district: 'Senator', party: 'Democrat', yearsInOffice: 25, 
        email: 'senator@schumer.senate.gov', phone: '(202) 224-6542', committees: ['Finance', 'Rules'], 
        supportVotes: 2847, opposeVotes: 1923, userVote: null,
        bio: 'Senate Majority Leader, representing New York since 1999',
        stockTrades: [],
        votingHistory: [
          { bill: 'S.815', title: 'National Security Supplemental', vote: 'Yes', date: '2024-02-13', description: 'Emergency funding for Ukraine, Israel, and Taiwan' },
          { bill: 'S.4', title: 'Border Security Act', vote: 'Yes', date: '2024-02-08', description: 'Comprehensive border security and immigration reform' }
        ],
        attendance: { percentage: 94, sessionsAttended: 235, totalSessions: 250, ranking: 23 },
        expenses: { 
          total: 285000, 
          year: 2024,
          breakdown: { 'Staff Salaries': 185000, 'Office Rent': 45000, 'Travel': 32000, 'Communications': 18000, 'Supplies': 5000 }
        }
      },
      { 
        name: 'Mitch McConnell', state: 'Kentucky', district: 'Senator', party: 'Republican', yearsInOffice: 39, 
        email: 'senator@mcconnell.senate.gov', phone: '(202) 224-2541', committees: ['Appropriations', 'Rules'], 
        supportVotes: 3102, opposeVotes: 2456, userVote: null,
        bio: 'Senate Minority Leader, longest-serving Senate Republican Leader',
        stockTrades: [],
        votingHistory: [
          { bill: 'S.815', title: 'National Security Supplemental', vote: 'Yes', date: '2024-02-13', description: 'Emergency funding for Ukraine, Israel, and Taiwan' },
          { bill: 'S.4', title: 'Border Security Act', vote: 'No', date: '2024-02-08', description: 'Comprehensive border security and immigration reform' }
        ],
        attendance: { percentage: 89, sessionsAttended: 223, totalSessions: 250, ranking: 45 },
        financialDisclosure: {
          initialWorth: 22000000,
          currentWorth: 35000000,
          percentageIncrease: 59,
          annualSalary: 174000,
          assets: [
            { type: 'Real Estate', value: 8500000 },
            { type: 'Investment Portfolio', value: 18000000 },
            { type: 'Retirement Accounts', value: 6500000 },
            { type: 'Business Interests', value: 2000000 }
          ]
        }
      },
      
      // Key Senators
      { 
        name: 'Bernie Sanders', state: 'Vermont', district: 'Senator', party: 'Independent', yearsInOffice: 17, 
        email: 'senator@sanders.senate.gov', phone: '(202) 224-5141', committees: ['Budget', 'Health'], 
        supportVotes: 4521, opposeVotes: 892, userVote: null,
        bio: 'Independent Senator, former presidential candidate, democratic socialist',
        stockTrades: [],
        votingHistory: [
          { bill: 'S.815', title: 'National Security Supplemental', vote: 'No', date: '2024-02-13', description: 'Emergency funding for Ukraine, Israel, and Taiwan' },
          { bill: 'H.R.2', title: 'Medicare for All Act', vote: 'Yes', date: '2024-01-15', description: 'Single-payer healthcare system' }
        ],
        attendance: { percentage: 96, sessionsAttended: 240, totalSessions: 250, ranking: 12 }
      },
      { 
        name: 'Elizabeth Warren', state: 'Massachusetts', district: 'Senator', party: 'Democrat', yearsInOffice: 12, 
        email: 'senator@warren.senate.gov', phone: '(202) 224-4543', committees: ['Finance', 'Banking'], 
        supportVotes: 3845, opposeVotes: 1267, userVote: null,
        bio: 'Senator from Massachusetts, former Harvard law professor, consumer protection advocate',
        stockTrades: [],
        financialDisclosure: {
          initialWorth: 3800000,
          currentWorth: 12000000,
          percentageIncrease: 216,
          annualSalary: 174000,
          assets: [
            { type: 'Book Royalties', value: 4500000 },
            { type: 'Real Estate', value: 5200000 },
            { type: 'Retirement Accounts', value: 2300000 }
          ]
        }
      },
      { 
        name: 'Ted Cruz', state: 'Texas', district: 'Senator', party: 'Republican', yearsInOffice: 12, 
        email: 'senator@cruz.senate.gov', phone: '(202) 224-5922', committees: ['Judiciary', 'Commerce'], 
        supportVotes: 2934, opposeVotes: 2178, userVote: null,
        bio: 'Senator from Texas, former Solicitor General of Texas, constitutional conservative',
        stockTrades: [],
        attendance: { percentage: 78, sessionsAttended: 195, totalSessions: 250, ranking: 87 }
      },
      { 
        name: 'Marco Rubio', state: 'Florida', district: 'Senator', party: 'Republican', yearsInOffice: 14, 
        email: 'senator@rubio.senate.gov', phone: '(202) 224-3041', committees: ['Foreign Relations', 'Intelligence'], 
        supportVotes: 2756, opposeVotes: 1892, userVote: null,
        bio: 'Senator from Florida, former Speaker of Florida House, foreign policy hawk',
        stockTrades: []
      },
      { 
        name: 'Amy Klobuchar', state: 'Minnesota', district: 'Senator', party: 'Democrat', yearsInOffice: 18, 
        email: 'senator@klobuchar.senate.gov', phone: '(202) 224-3244', committees: ['Judiciary', 'Commerce'], 
        supportVotes: 3234, opposeVotes: 1456, userVote: null,
        bio: 'Senator from Minnesota, former Hennepin County Attorney, moderate Democrat',
        stockTrades: []
      },
      { 
        name: 'Lindsey Graham', state: 'South Carolina', district: 'Senator', party: 'Republican', yearsInOffice: 22, 
        email: 'senator@graham.senate.gov', phone: '(202) 224-5972', committees: ['Judiciary', 'Armed Services'], 
        supportVotes: 2845, opposeVotes: 2134, userVote: null,
        bio: 'Senator from South Carolina, Chairman of Armed Services Committee, defense hawk',
        stockTrades: [
          { date: '2024-12-15', company: 'Lockheed Martin', ticker: 'LMT', type: 'Purchase', valueRange: '$15,001-$50,000', assetType: 'Stock', conflict: true, conflictReason: 'Armed Services Committee member trading defense contractor stock' },
          { date: '2024-11-20', company: 'Raytheon Technologies', ticker: 'RTX', type: 'Purchase', valueRange: '$15,001-$50,000', assetType: 'Stock', conflict: true, conflictReason: 'Armed Services Committee member trading defense contractor stock' }
        ],
        lobbying: {
          totalMeetings: 47,
          totalValue: 2850000,
          meetings: [
            { organization: 'Lockheed Martin', representative: 'Defense Lobbyist John Smith', date: '2024-01-15', topic: 'F-35 Program Funding', value: 450000 },
            { organization: 'Raytheon', representative: 'Government Relations VP', date: '2024-02-22', topic: 'Missile Defense Systems', value: 380000 }
          ]
        }
      },
      { 
        name: 'Cory Booker', state: 'New Jersey', district: 'Senator', party: 'Democrat', yearsInOffice: 11, 
        email: 'senator@booker.senate.gov', phone: '(202) 224-3224', committees: ['Foreign Relations', 'Judiciary'], 
        supportVotes: 3456, opposeVotes: 1234, userVote: null,
        bio: 'Senator from New Jersey, former Mayor of Newark, social justice advocate',
        stockTrades: []
      },
      { 
        name: 'Rand Paul', state: 'Kentucky', district: 'Senator', party: 'Republican', yearsInOffice: 14, 
        email: 'senator@paul.senate.gov', phone: '(202) 224-4343', committees: ['Foreign Relations', 'Health'], 
        supportVotes: 2678, opposeVotes: 2345, userVote: null,
        bio: 'Senator from Kentucky, libertarian Republican, ophthalmologist',
        stockTrades: []
      },
      
      // Additional Senators (30 more states)
      { name: 'John Cornyn', state: 'Texas', district: 'Senator', party: 'Republican', yearsInOffice: 22, email: 'senator@cornyn.senate.gov', phone: '(202) 224-2934', committees: ['Judiciary', 'Intelligence'], supportVotes: 2567, opposeVotes: 2134, userVote: null, bio: 'Senior Senator from Texas', stockTrades: [] },
      { name: 'Catherine Cortez Masto', state: 'Nevada', district: 'Senator', party: 'Democrat', yearsInOffice: 8, email: 'senator@cortezmasto.senate.gov', phone: '(202) 224-3542', committees: ['Finance', 'Energy'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'First Latina Senator', stockTrades: [] },
      { name: 'Josh Hawley', state: 'Missouri', district: 'Senator', party: 'Republican', yearsInOffice: 6, email: 'senator@hawley.senate.gov', phone: '(202) 224-6154', committees: ['Judiciary', 'Armed Services'], supportVotes: 2345, opposeVotes: 2678, userVote: null, bio: 'Conservative Senator from Missouri', stockTrades: [] },
      { name: 'Raphael Warnock', state: 'Georgia', district: 'Senator', party: 'Democrat', yearsInOffice: 4, email: 'senator@warnock.senate.gov', phone: '(202) 224-3643', committees: ['Agriculture', 'Commerce'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Baptist pastor, first Black Senator from Georgia', stockTrades: [] },
      { name: 'Jon Ossoff', state: 'Georgia', district: 'Senator', party: 'Democrat', yearsInOffice: 4, email: 'senator@ossoff.senate.gov', phone: '(202) 224-3521', committees: ['Judiciary', 'Homeland Security'], supportVotes: 3234, opposeVotes: 1456, userVote: null, bio: 'Youngest Senator elected since 1973', stockTrades: [] },
      { name: 'Tom Cotton', state: 'Arkansas', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@cotton.senate.gov', phone: '(202) 224-2353', committees: ['Armed Services', 'Intelligence'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Army veteran, conservative Republican', stockTrades: [] },
      { name: 'Mark Warner', state: 'Virginia', district: 'Senator', party: 'Democrat', yearsInOffice: 16, email: 'senator@warner.senate.gov', phone: '(202) 224-2023', committees: ['Intelligence', 'Finance'], supportVotes: 3123, opposeVotes: 1678, userVote: null, bio: 'Former Virginia Governor, tech entrepreneur', stockTrades: [] },
      { name: 'Tim Scott', state: 'South Carolina', district: 'Senator', party: 'Republican', yearsInOffice: 11, email: 'senator@scott.senate.gov', phone: '(202) 224-6121', committees: ['Finance', 'Banking'], supportVotes: 2678, opposeVotes: 2123, userVote: null, bio: 'First Black Republican Senator from the South since Reconstruction', stockTrades: [] },
      { name: 'Kirsten Gillibrand', state: 'New York', district: 'Senator', party: 'Democrat', yearsInOffice: 15, email: 'senator@gillibrand.senate.gov', phone: '(202) 224-4451', committees: ['Armed Services', 'Agriculture'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Advocate for military sexual assault reform', stockTrades: [] },
      { name: 'Ron Wyden', state: 'Oregon', district: 'Senator', party: 'Democrat', yearsInOffice: 28, email: 'senator@wyden.senate.gov', phone: '(202) 224-5244', committees: ['Finance', 'Energy'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Senate Finance Committee Chairman', stockTrades: [] },
      
      // HOUSE - Leadership & Key Members with FULL features
      { 
        name: 'Nancy Pelosi', state: 'California', district: 'CA-11', party: 'Democrat', yearsInOffice: 37, 
        email: 'rep@pelosi.house.gov', phone: '(202) 225-4965', committees: ['Leadership'], 
        supportVotes: 4234, opposeVotes: 1567, userVote: null,
        bio: 'Former Speaker of the House, representing San Francisco since 1987',
        stockTrades: [
          { date: '2024-12-01', company: 'NVIDIA Corporation', ticker: 'NVDA', type: 'Purchase', valueRange: '$1,000,001-$5,000,000', assetType: 'Stock', conflict: true, conflictReason: 'Tech regulation oversight while trading major tech stocks' },
          { date: '2024-11-15', company: 'Microsoft Corporation', ticker: 'MSFT', type: 'Purchase', valueRange: '$500,001-$1,000,000', assetType: 'Call Options', conflict: true, conflictReason: 'Tech regulation oversight while trading major tech stocks' },
          { date: '2024-10-28', company: 'Tesla Inc.', ticker: 'TSLA', type: 'Purchase', valueRange: '$250,001-$500,000', assetType: 'Stock', conflict: false, conflictReason: null },
          { date: '2024-10-10', company: 'Apple Inc.', ticker: 'AAPL', type: 'Sale', valueRange: '$100,001-$250,000', assetType: 'Stock', conflict: true, conflictReason: 'Tech regulation oversight while trading major tech stocks' },
          { date: '2024-09-22', company: 'Alphabet Inc. (Google)', ticker: 'GOOGL', type: 'Purchase', valueRange: '$500,001-$1,000,000', assetType: 'Stock', conflict: true, conflictReason: 'Tech regulation oversight while trading major tech stocks' }
        ],
        votingHistory: [
          { bill: 'H.R.815', title: 'National Security Supplemental', vote: 'Yes', date: '2024-02-13', description: 'Emergency funding for Ukraine, Israel, and Taiwan' },
          { bill: 'H.R.2', title: 'Secure the Border Act', vote: 'No', date: '2024-05-11', description: 'Republican border security bill' },
          { bill: 'H.R.1', title: 'Lower Energy Costs Act', vote: 'No', date: '2024-03-30', description: 'Republican energy bill' }
        ],
        attendance: { percentage: 91, sessionsAttended: 342, totalSessions: 376, ranking: 156 },
        financialDisclosure: {
          initialWorth: 58000000,
          currentWorth: 140000000,
          percentageIncrease: 141,
          annualSalary: 174000,
          assets: [
            { type: 'Real Estate (SF, Napa)', value: 25000000 },
            { type: 'Stock Portfolio', value: 85000000 },
            { type: 'Husband\'s Business Interests', value: 30000000 }
          ]
        },
        lobbying: {
          totalMeetings: 89,
          totalValue: 4200000,
          meetings: [
            { organization: 'Meta Platforms', representative: 'Tech Policy Director', date: '2024-01-10', topic: 'AI Regulation Framework', value: 650000 },
            { organization: 'Alphabet (Google)', representative: 'VP Government Affairs', date: '2024-02-05', topic: 'Antitrust Concerns', value: 580000 },
            { organization: 'Apple Inc.', representative: 'Chief Compliance Officer', date: '2024-03-12', topic: 'App Store Regulations', value: 520000 }
          ]
        }
      },
      { 
        name: 'Kevin McCarthy', state: 'California', district: 'CA-20', party: 'Republican', yearsInOffice: 17, 
        email: 'rep@mccarthy.house.gov', phone: '(202) 225-2915', committees: ['Leadership'], 
        supportVotes: 3567, opposeVotes: 2134, userVote: null,
        bio: 'Former Speaker of the House (2023), House Republican Leader',
        stockTrades: [],
        attendance: { percentage: 88, sessionsAttended: 331, totalSessions: 376, ranking: 201 }
      },
      
      { 
        name: 'Alexandria Ocasio-Cortez', state: 'New York', district: 'NY-14', party: 'Democrat', yearsInOffice: 6, 
        email: 'rep@ocasio-cortez.house.gov', phone: '(202) 225-3965', committees: ['Financial Services', 'Oversight'], 
        supportVotes: 5234, opposeVotes: 1892, userVote: null,
        bio: 'Progressive Democrat from New York, former bartender and activist, Green New Deal champion',
        stockTrades: [],
        votingHistory: [
          { bill: 'H.R.815', title: 'National Security Supplemental', vote: 'No', date: '2024-02-13', description: 'Opposed military spending' },
          { bill: 'H.R.763', title: 'Green New Deal Resolution', vote: 'Yes', date: '2024-04-22', description: 'Climate change action' }
        ],
        attendance: { percentage: 97, sessionsAttended: 365, totalSessions: 376, ranking: 18 },
        financialDisclosure: {
          initialWorth: 7000,
          currentWorth: 280000,
          percentageIncrease: 3900,
          annualSalary: 174000,
          assets: [
            { type: 'Checking/Savings', value: 45000 },
            { type: 'Retirement Account', value: 85000 },
            { type: 'Student Loan Debt', value: -150000 }
          ]
        }
      },
      { 
        name: 'Marjorie Taylor Greene', state: 'Georgia', district: 'GA-14', party: 'Republican', yearsInOffice: 4, 
        email: 'rep@greene.house.gov', phone: '(202) 225-5211', committees: ['Oversight', 'Homeland Security'], 
        supportVotes: 2845, opposeVotes: 3456, userVote: null,
        bio: 'Conservative Republican from Georgia, businesswoman, controversial statements',
        stockTrades: [],
        attendance: { percentage: 72, sessionsAttended: 271, totalSessions: 376, ranking: 398 }
      },
      
      { 
        name: 'Adam Schiff', state: 'California', district: 'CA-30', party: 'Democrat', yearsInOffice: 24, 
        email: 'rep@schiff.house.gov', phone: '(202) 225-4176', committees: ['Intelligence', 'Judiciary'], 
        supportVotes: 3678, opposeVotes: 1456, userVote: null,
        bio: 'Representative from California, former federal prosecutor, led Trump impeachment',
        stockTrades: []
      },
      { 
        name: 'Jim Jordan', state: 'Ohio', district: 'OH-4', party: 'Republican', yearsInOffice: 17, 
        email: 'rep@jordan.house.gov', phone: '(202) 225-2676', committees: ['Judiciary', 'Oversight'], 
        supportVotes: 2934, opposeVotes: 2567, userVote: null,
        bio: 'Representative from Ohio, former college wrestling coach, Freedom Caucus founder',
        stockTrades: []
      },
      
      { 
        name: 'Hakeem Jeffries', state: 'New York', district: 'NY-8', party: 'Democrat', yearsInOffice: 11, 
        email: 'rep@jeffries.house.gov', phone: '(202) 225-5936', committees: ['Leadership'], 
        supportVotes: 3845, opposeVotes: 1234, userVote: null,
        bio: 'House Democratic Leader, representing Brooklyn, first Black House party leader',
        stockTrades: []
      },
      { 
        name: 'Steve Scalise', state: 'Louisiana', district: 'LA-1', party: 'Republican', yearsInOffice: 15, 
        email: 'rep@scalise.house.gov', phone: '(202) 225-3015', committees: ['Leadership'], 
        supportVotes: 3123, opposeVotes: 1892, userVote: null,
        bio: 'House Majority Leader, survived 2017 shooting, representing Louisiana',
        stockTrades: []
      },
      
      { 
        name: 'Katie Porter', state: 'California', district: 'CA-47', party: 'Democrat', yearsInOffice: 6, 
        email: 'rep@porter.house.gov', phone: '(202) 225-5611', committees: ['Oversight', 'Natural Resources'], 
        supportVotes: 4123, opposeVotes: 1345, userVote: null,
        bio: 'Representative from California, consumer protection advocate, famous for her whiteboard',
        stockTrades: []
      },
      { 
        name: 'Matt Gaetz', state: 'Florida', district: 'FL-1', party: 'Republican', yearsInOffice: 8, 
        email: 'rep@gaetz.house.gov', phone: '(202) 225-4136', committees: ['Judiciary', 'Armed Services'], 
        supportVotes: 2567, opposeVotes: 2934, userVote: null,
        bio: 'Representative from Florida, former Florida House member, Trump ally',
        stockTrades: []
      },
      
      { 
        name: 'Ilhan Omar', state: 'Minnesota', district: 'MN-5', party: 'Democrat', yearsInOffice: 6, 
        email: 'rep@omar.house.gov', phone: '(202) 225-4755', committees: ['Foreign Affairs', 'Education'], 
        supportVotes: 3892, opposeVotes: 2134, userVote: null,
        bio: 'Representative from Minnesota, former refugee from Somalia, progressive Squad member',
        stockTrades: []
      },
      { 
        name: 'Lauren Boebert', state: 'Colorado', district: 'CO-3', party: 'Republican', yearsInOffice: 4, 
        email: 'rep@boebert.house.gov', phone: '(202) 225-4761', committees: ['Natural Resources', 'Oversight'], 
        supportVotes: 2456, opposeVotes: 3234, userVote: null,
        bio: 'Representative from Colorado, restaurant owner, Second Amendment advocate',
        stockTrades: []
      },
      
      { 
        name: 'Rashida Tlaib', state: 'Michigan', district: 'MI-12', party: 'Democrat', yearsInOffice: 6, 
        email: 'rep@tlaib.house.gov', phone: '(202) 225-5126', committees: ['Financial Services', 'Oversight'], 
        supportVotes: 3678, opposeVotes: 2012, userVote: null,
        bio: 'Representative from Michigan, first Palestinian-American woman in Congress',
        stockTrades: []
      },
      { 
        name: 'Dan Crenshaw', state: 'Texas', district: 'TX-2', party: 'Republican', yearsInOffice: 6, 
        email: 'rep@crenshaw.house.gov', phone: '(202) 225-6565', committees: ['Energy', 'Homeland Security'], 
        supportVotes: 3234, opposeVotes: 1892, userVote: null,
        bio: 'Representative from Texas, former Navy SEAL, lost eye in Afghanistan',
        stockTrades: [
          { date: '2024-12-10', company: 'Raytheon Technologies', ticker: 'RTX', type: 'Purchase', valueRange: '$50,001-$100,000', assetType: 'Stock', conflict: false, conflictReason: null },
          { date: '2024-11-25', company: 'Lockheed Martin', ticker: 'LMT', type: 'Purchase', valueRange: '$100,001-$250,000', assetType: 'Stock', conflict: false, conflictReason: null },
          { date: '2024-10-18', company: 'Boeing Company', ticker: 'BA', type: 'Purchase', valueRange: '$15,001-$50,000', assetType: 'Stock', conflict: false, conflictReason: null },
          { date: '2024-09-30', company: 'General Dynamics', ticker: 'GD', type: 'Purchase', valueRange: '$50,001-$100,000', assetType: 'Stock', conflict: false, conflictReason: null }
        ]
      },
      
      { 
        name: 'Pramila Jayapal', state: 'Washington', district: 'WA-7', party: 'Democrat', yearsInOffice: 8, 
        email: 'rep@jayapal.house.gov', phone: '(202) 225-3106', committees: ['Judiciary', 'Budget'], 
        supportVotes: 3892, opposeVotes: 1456, userVote: null,
        bio: 'Representative from Washington, Chair of Congressional Progressive Caucus',
        stockTrades: []
      },
      { 
        name: 'Chip Roy', state: 'Texas', district: 'TX-21', party: 'Republican', yearsInOffice: 6, 
        email: 'rep@roy.house.gov', phone: '(202) 225-4236', committees: ['Judiciary', 'Budget'], 
        supportVotes: 2678, opposeVotes: 2567, userVote: null,
        bio: 'Representative from Texas, former Chief of Staff to Ted Cruz, Freedom Caucus member',
        stockTrades: []
      },
      
      { 
        name: 'Ayanna Pressley', state: 'Massachusetts', district: 'MA-7', party: 'Democrat', yearsInOffice: 6, 
        email: 'rep@pressley.house.gov', phone: '(202) 225-5111', committees: ['Financial Services', 'Oversight'], 
        supportVotes: 3756, opposeVotes: 1678, userVote: null,
        bio: 'Representative from Massachusetts, first Black woman elected to Congress from Massachusetts',
        stockTrades: []
      },
      { 
        name: 'Paul Gosar', state: 'Arizona', district: 'AZ-9', party: 'Republican', yearsInOffice: 14, 
        email: 'rep@gosar.house.gov', phone: '(202) 225-2315', committees: ['Natural Resources', 'Oversight'], 
        supportVotes: 2456, opposeVotes: 2892, userVote: null,
        bio: 'Representative from Arizona, dentist, controversial statements and actions',
        stockTrades: []
      },
      
      // Additional House Members (35 more diverse states/districts)
      { name: 'Greg Stanton', state: 'Arizona', district: 'AZ-4', party: 'Democrat', yearsInOffice: 6, email: 'rep@stanton.house.gov', phone: '(202) 225-9888', committees: ['Transportation', 'Judiciary'], supportVotes: 3234, opposeVotes: 1567, userVote: null, bio: 'Former Phoenix Mayor', stockTrades: [] },
      { name: 'Andy Biggs', state: 'Arizona', district: 'AZ-5', party: 'Republican', yearsInOffice: 8, email: 'rep@biggs.house.gov', phone: '(202) 225-2635', committees: ['Judiciary', 'Oversight'], supportVotes: 2345, opposeVotes: 2678, userVote: null, bio: 'Freedom Caucus member', stockTrades: [] },
      { name: 'Katie Hill', state: 'California', district: 'CA-25', party: 'Democrat', yearsInOffice: 2, email: 'rep@hill.house.gov', phone: '(202) 225-1956', committees: ['Armed Services', 'Oversight'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former nonprofit executive', stockTrades: [] },
      { name: 'Darrell Issa', state: 'California', district: 'CA-48', party: 'Republican', yearsInOffice: 12, email: 'rep@issa.house.gov', phone: '(202) 225-3906', committees: ['Foreign Affairs', 'Judiciary'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'Former car alarm entrepreneur', stockTrades: [] },
      { name: 'Lauren Underwood', state: 'Illinois', district: 'IL-14', party: 'Democrat', yearsInOffice: 6, email: 'rep@underwood.house.gov', phone: '(202) 225-2976', committees: ['Appropriations', 'Veterans Affairs'], supportVotes: 3678, opposeVotes: 1456, userVote: null, bio: 'Youngest Black woman ever elected to Congress', stockTrades: [] },
      { name: 'Darin LaHood', state: 'Illinois', district: 'IL-16', party: 'Republican', yearsInOffice: 9, email: 'rep@lahood.house.gov', phone: '(202) 225-6201', committees: ['Ways and Means'], supportVotes: 2678, opposeVotes: 2123, userVote: null, bio: 'Son of former Transportation Secretary', stockTrades: [] },
      { name: 'André Carson', state: 'Indiana', district: 'IN-7', party: 'Democrat', yearsInOffice: 16, email: 'rep@carson.house.gov', phone: '(202) 225-4011', committees: ['Intelligence', 'Transportation'], supportVotes: 3456, opposeVotes: 1678, userVote: null, bio: 'One of three Muslims in Congress', stockTrades: [] },
      { name: 'Jim Banks', state: 'Indiana', district: 'IN-3', party: 'Republican', yearsInOffice: 8, email: 'rep@banks.house.gov', phone: '(202) 225-4436', committees: ['Armed Services', 'Education'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Navy Reserve officer', stockTrades: [] },
      { name: 'Sharice Davids', state: 'Kansas', district: 'KS-3', party: 'Democrat', yearsInOffice: 6, email: 'rep@davids.house.gov', phone: '(202) 225-2865', committees: ['Transportation', 'Small Business'], supportVotes: 3567, opposeVotes: 1456, userVote: null, bio: 'First openly LGBTQ+ Native American in Congress', stockTrades: [] },
      { name: 'Andy Barr', state: 'Kentucky', district: 'KY-6', party: 'Republican', yearsInOffice: 12, email: 'rep@barr.house.gov', phone: '(202) 225-4706', committees: ['Financial Services'], supportVotes: 2567, opposeVotes: 2234, userVote: null, bio: 'Former congressional staffer', stockTrades: [] },
      { name: 'John Lewis', state: 'Georgia', district: 'GA-5', party: 'Democrat', yearsInOffice: 33, email: 'rep@lewis.house.gov', phone: '(202) 225-3801', committees: ['Ways and Means'], supportVotes: 4567, opposeVotes: 892, userVote: null, bio: 'Civil rights icon', stockTrades: [] },
      { name: 'Buddy Carter', state: 'Georgia', district: 'GA-1', party: 'Republican', yearsInOffice: 10, email: 'rep@carter.house.gov', phone: '(202) 225-5831', committees: ['Energy and Commerce'], supportVotes: 2456, opposeVotes: 2345, userVote: null, bio: 'Pharmacist', stockTrades: [] },
      { name: 'Raja Krishnamoorthi', state: 'Illinois', district: 'IL-8', party: 'Democrat', yearsInOffice: 8, email: 'rep@krishnamoorthi.house.gov', phone: '(202) 225-3711', committees: ['Oversight', 'Intelligence'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'First Indian-American from Illinois', stockTrades: [] },
      { name: 'Elise Stefanik', state: 'New York', district: 'NY-21', party: 'Republican', yearsInOffice: 10, email: 'rep@stefanik.house.gov', phone: '(202) 225-4611', committees: ['Armed Services', 'Education'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'Youngest woman ever elected to Congress (at time)', stockTrades: [] },
      { name: 'Ritchie Torres', state: 'New York', district: 'NY-15', party: 'Democrat', yearsInOffice: 4, email: 'rep@torres.house.gov', phone: '(202) 225-4361', committees: ['Financial Services', 'Homeland Security'], supportVotes: 3567, opposeVotes: 1456, userVote: null, bio: 'First openly gay Afro-Latino member', stockTrades: [] },
      { name: 'Patrick McHenry', state: 'North Carolina', district: 'NC-10', party: 'Republican', yearsInOffice: 19, email: 'rep@mchenry.house.gov', phone: '(202) 225-2576', committees: ['Financial Services'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'Former Financial Services Chairman', stockTrades: [] },
      { name: 'Joyce Beatty', state: 'Ohio', district: 'OH-3', party: 'Democrat', yearsInOffice: 11, email: 'rep@beatty.house.gov', phone: '(202) 225-4324', committees: ['Financial Services'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Congressional Black Caucus Chair', stockTrades: [] },
      { name: 'Michael Turner', state: 'Ohio', district: 'OH-10', party: 'Republican', yearsInOffice: 22, email: 'rep@turner.house.gov', phone: '(202) 225-6465', committees: ['Intelligence', 'Armed Services'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'Former Dayton Mayor', stockTrades: [] },
      { name: 'Brendan Boyle', state: 'Pennsylvania', district: 'PA-2', party: 'Democrat', yearsInOffice: 10, email: 'rep@boyle.house.gov', phone: '(202) 225-6111', committees: ['Budget', 'Ways and Means'], supportVotes: 3345, opposeVotes: 1678, userVote: null, bio: 'First Irish immigrant elected to Congress', stockTrades: [] },
      { name: 'Brian Fitzpatrick', state: 'Pennsylvania', district: 'PA-1', party: 'Republican', yearsInOffice: 8, email: 'rep@fitzpatrick.house.gov', phone: '(202) 225-4276', committees: ['Foreign Affairs', 'Transportation'], supportVotes: 2789, opposeVotes: 2134, userVote: null, bio: 'Former FBI agent', stockTrades: [] },
      { name: 'Joe Wilson', state: 'South Carolina', district: 'SC-2', party: 'Republican', yearsInOffice: 22, email: 'rep@wilson.house.gov', phone: '(202) 225-2452', committees: ['Armed Services', 'Foreign Affairs'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'Famous for "You lie!" outburst', stockTrades: [] },
      { name: 'Colin Allred', state: 'Texas', district: 'TX-32', party: 'Democrat', yearsInOffice: 6, email: 'rep@allred.house.gov', phone: '(202) 225-2231', committees: ['Transportation', 'Veterans Affairs'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Former NFL player', stockTrades: [] },
      { name: 'Michael McCaul', state: 'Texas', district: 'TX-10', party: 'Republican', yearsInOffice: 19, email: 'rep@mccaul.house.gov', phone: '(202) 225-2401', committees: ['Foreign Affairs', 'Homeland Security'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'One of wealthiest members of Congress', stockTrades: [] },
      { name: 'Abigail Spanberger', state: 'Virginia', district: 'VA-7', party: 'Democrat', yearsInOffice: 6, email: 'rep@spanberger.house.gov', phone: '(202) 225-2815', committees: ['Intelligence', 'Agriculture'], supportVotes: 3345, opposeVotes: 1678, userVote: null, bio: 'Former CIA officer', stockTrades: [] },
      { name: 'Rob Wittman', state: 'Virginia', district: 'VA-1', party: 'Republican', yearsInOffice: 17, email: 'rep@wittman.house.gov', phone: '(202) 225-4261', committees: ['Armed Services', 'Natural Resources'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'Marine scientist', stockTrades: [] },
      { name: 'Pramila Jayapal', state: 'Washington', district: 'WA-7', party: 'Democrat', yearsInOffice: 8, email: 'rep@jayapal.house.gov', phone: '(202) 225-3106', committees: ['Judiciary', 'Budget'], supportVotes: 3892, opposeVotes: 1456, userVote: null, bio: 'Progressive Caucus Chair', stockTrades: [] },
      { name: 'Cathy McMorris Rodgers', state: 'Washington', district: 'WA-5', party: 'Republican', yearsInOffice: 19, email: 'rep@mcmorrisrodgers.house.gov', phone: '(202) 225-2006', committees: ['Energy and Commerce'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'Former House Republican Conference Chair', stockTrades: [] },
      { name: 'Mark Pocan', state: 'Wisconsin', district: 'WI-2', party: 'Democrat', yearsInOffice: 11, email: 'rep@pocan.house.gov', phone: '(202) 225-2906', committees: ['Appropriations'], supportVotes: 3567, opposeVotes: 1456, userVote: null, bio: 'Co-Chair of Progressive Caucus', stockTrades: [] },
      { name: 'Bryan Steil', state: 'Wisconsin', district: 'WI-1', party: 'Republican', yearsInOffice: 6, email: 'rep@steil.house.gov', phone: '(202) 225-3031', committees: ['Financial Services'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'Former manufacturing executive', stockTrades: [] },
      
      // Additional Senators (30 more = 40 total Senators)
      { name: 'Dianne Feinstein', state: 'California', district: 'Senator', party: 'Democrat', yearsInOffice: 31, email: 'senator@feinstein.senate.gov', phone: '(202) 224-3841', committees: ['Judiciary', 'Intelligence'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'Longest-serving female Senator', stockTrades: [] },
      { name: 'Alex Padilla', state: 'California', district: 'Senator', party: 'Democrat', yearsInOffice: 4, email: 'senator@padilla.senate.gov', phone: '(202) 224-3553', committees: ['Judiciary', 'Environment'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'First Latino Senator from California', stockTrades: [] },
      { name: 'John Hickenlooper', state: 'Colorado', district: 'Senator', party: 'Democrat', yearsInOffice: 4, email: 'senator@hickenlooper.senate.gov', phone: '(202) 224-5941', committees: ['Commerce', 'Energy'], supportVotes: 3345, opposeVotes: 1567, userVote: null, bio: 'Former Colorado Governor', stockTrades: [] },
      { name: 'Michael Bennet', state: 'Colorado', district: 'Senator', party: 'Democrat', yearsInOffice: 16, email: 'senator@bennet.senate.gov', phone: '(202) 224-5852', committees: ['Finance', 'Agriculture'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'Former Denver school superintendent', stockTrades: [] },
      { name: 'Richard Blumenthal', state: 'Connecticut', district: 'Senator', party: 'Democrat', yearsInOffice: 13, email: 'senator@blumenthal.senate.gov', phone: '(202) 224-2823', committees: ['Judiciary', 'Commerce'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former Attorney General', stockTrades: [] },
      { name: 'Chris Murphy', state: 'Connecticut', district: 'Senator', party: 'Democrat', yearsInOffice: 12, email: 'senator@murphy.senate.gov', phone: '(202) 224-4041', committees: ['Foreign Relations', 'Health'], supportVotes: 3567, opposeVotes: 1345, userVote: null, bio: 'Gun control advocate', stockTrades: [] },
      { name: 'Tom Carper', state: 'Delaware', district: 'Senator', party: 'Democrat', yearsInOffice: 22, email: 'senator@carper.senate.gov', phone: '(202) 224-2441', committees: ['Environment', 'Homeland Security'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'Former Delaware Governor', stockTrades: [] },
      { name: 'Chris Coons', state: 'Delaware', district: 'Senator', party: 'Democrat', yearsInOffice: 14, email: 'senator@coons.senate.gov', phone: '(202) 224-5042', committees: ['Foreign Relations', 'Judiciary'], supportVotes: 3345, opposeVotes: 1567, userVote: null, bio: 'Biden ally and confidant', stockTrades: [] },
      { name: 'Rick Scott', state: 'Florida', district: 'Senator', party: 'Republican', yearsInOffice: 6, email: 'senator@scott.senate.gov', phone: '(202) 224-5274', committees: ['Commerce', 'Budget'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Former Florida Governor, wealthy businessman', stockTrades: [] },
      { name: 'Chuck Grassley', state: 'Iowa', district: 'Senator', party: 'Republican', yearsInOffice: 43, email: 'senator@grassley.senate.gov', phone: '(202) 224-3744', committees: ['Judiciary', 'Finance'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'Longest-serving Republican Senator', stockTrades: [] },
      { name: 'Joni Ernst', state: 'Iowa', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@ernst.senate.gov', phone: '(202) 224-3254', committees: ['Armed Services', 'Agriculture'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'First woman elected to Congress from Iowa', stockTrades: [] },
      { name: 'Roger Marshall', state: 'Kansas', district: 'Senator', party: 'Republican', yearsInOffice: 4, email: 'senator@marshall.senate.gov', phone: '(202) 224-4774', committees: ['Agriculture', 'Health'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Physician and obstetrician', stockTrades: [] },
      { name: 'Jerry Moran', state: 'Kansas', district: 'Senator', party: 'Republican', yearsInOffice: 14, email: 'senator@moran.senate.gov', phone: '(202) 224-6521', committees: ['Appropriations', 'Veterans Affairs'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'Former House member', stockTrades: [] },
      { name: 'Bill Cassidy', state: 'Louisiana', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@cassidy.senate.gov', phone: '(202) 224-5824', committees: ['Finance', 'Health'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'Physician, voted to convict Trump', stockTrades: [] },
      { name: 'John Kennedy', state: 'Louisiana', district: 'Senator', party: 'Republican', yearsInOffice: 7, email: 'senator@kennedy.senate.gov', phone: '(202) 224-4623', committees: ['Appropriations', 'Judiciary'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Known for colorful sayings', stockTrades: [] },
      { name: 'Angus King', state: 'Maine', district: 'Senator', party: 'Independent', yearsInOffice: 12, email: 'senator@king.senate.gov', phone: '(202) 224-5344', committees: ['Intelligence', 'Armed Services'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'Independent who caucuses with Democrats', stockTrades: [] },
      { name: 'Susan Collins', state: 'Maine', district: 'Senator', party: 'Republican', yearsInOffice: 27, email: 'senator@collins.senate.gov', phone: '(202) 224-2523', committees: ['Appropriations', 'Intelligence'], supportVotes: 2789, opposeVotes: 2134, userVote: null, bio: 'Moderate Republican, frequent swing vote', stockTrades: [] },
      { name: 'Ben Cardin', state: 'Maryland', district: 'Senator', party: 'Democrat', yearsInOffice: 17, email: 'senator@cardin.senate.gov', phone: '(202) 224-4524', committees: ['Foreign Relations', 'Finance'], supportVotes: 3345, opposeVotes: 1567, userVote: null, bio: 'Human rights advocate', stockTrades: [] },
      { name: 'Chris Van Hollen', state: 'Maryland', district: 'Senator', party: 'Democrat', yearsInOffice: 8, email: 'senator@vanhollen.senate.gov', phone: '(202) 224-4654', committees: ['Appropriations', 'Budget'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former House Budget Committee ranking member', stockTrades: [] },
      { name: 'Ed Markey', state: 'Massachusetts', district: 'Senator', party: 'Democrat', yearsInOffice: 11, email: 'senator@markey.senate.gov', phone: '(202) 224-2742', committees: ['Environment', 'Commerce'], supportVotes: 3567, opposeVotes: 1345, userVote: null, bio: 'Green New Deal co-sponsor', stockTrades: [] },
      { name: 'Gary Peters', state: 'Michigan', district: 'Senator', party: 'Democrat', yearsInOffice: 10, email: 'senator@peters.senate.gov', phone: '(202) 224-6221', committees: ['Homeland Security', 'Commerce'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'Former investment advisor', stockTrades: [] },
      { name: 'Debbie Stabenow', state: 'Michigan', district: 'Senator', party: 'Democrat', yearsInOffice: 23, email: 'senator@stabenow.senate.gov', phone: '(202) 224-4822', committees: ['Agriculture', 'Finance'], supportVotes: 3345, opposeVotes: 1567, userVote: null, bio: 'Agriculture Committee Chair', stockTrades: [] },
      { name: 'Tina Smith', state: 'Minnesota', district: 'Senator', party: 'Democrat', yearsInOffice: 7, email: 'senator@smith.senate.gov', phone: '(202) 224-5641', committees: ['Agriculture', 'Health'], supportVotes: 3456, opposeVotes: 1234, userVote: null, bio: 'Former Lieutenant Governor', stockTrades: [] },
      { name: 'Roger Wicker', state: 'Mississippi', district: 'Senator', party: 'Republican', yearsInOffice: 16, email: 'senator@wicker.senate.gov', phone: '(202) 224-6253', committees: ['Commerce', 'Armed Services'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Former House member', stockTrades: [] },
      { name: 'Cindy Hyde-Smith', state: 'Mississippi', district: 'Senator', party: 'Republican', yearsInOffice: 6, email: 'senator@hydesmith.senate.gov', phone: '(202) 224-5054', committees: ['Agriculture', 'Appropriations'], supportVotes: 2345, opposeVotes: 2678, userVote: null, bio: 'First woman elected to Congress from Mississippi', stockTrades: [] },
      { name: 'Roy Blunt', state: 'Missouri', district: 'Senator', party: 'Republican', yearsInOffice: 13, email: 'senator@blunt.senate.gov', phone: '(202) 224-5721', committees: ['Appropriations', 'Rules'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'Former House Majority Whip', stockTrades: [] },
      { name: 'Jon Tester', state: 'Montana', district: 'Senator', party: 'Democrat', yearsInOffice: 17, email: 'senator@tester.senate.gov', phone: '(202) 224-2644', committees: ['Appropriations', 'Veterans Affairs'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'Third-generation farmer', stockTrades: [] },
      { name: 'Steve Daines', state: 'Montana', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@daines.senate.gov', phone: '(202) 224-2651', committees: ['Finance', 'Energy'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Former business executive', stockTrades: [] },
      { name: 'Deb Fischer', state: 'Nebraska', district: 'Senator', party: 'Republican', yearsInOffice: 12, email: 'senator@fischer.senate.gov', phone: '(202) 224-6551', committees: ['Armed Services', 'Commerce'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'Rancher and former state senator', stockTrades: [] },
      { name: 'Ben Sasse', state: 'Nebraska', district: 'Senator', party: 'Republican', yearsInOffice: 10, email: 'senator@sasse.senate.gov', phone: '(202) 224-4224', committees: ['Judiciary', 'Finance'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'Former university president', stockTrades: [] },
      
      // Additional House Members (47 more = 110 total House members)
      { name: 'Maxine Waters', state: 'California', district: 'CA-43', party: 'Democrat', yearsInOffice: 32, email: 'rep@waters.house.gov', phone: '(202) 225-2201', committees: ['Financial Services'], supportVotes: 3678, opposeVotes: 1456, userVote: null, bio: 'Financial Services Chair', stockTrades: [] },
      { name: 'Barbara Lee', state: 'California', district: 'CA-12', party: 'Democrat', yearsInOffice: 26, email: 'rep@lee.house.gov', phone: '(202) 225-2661', committees: ['Appropriations', 'Budget'], supportVotes: 3789, opposeVotes: 1234, userVote: null, bio: 'Only member to vote against Afghanistan war', stockTrades: [] },
      { name: 'Ro Khanna', state: 'California', district: 'CA-17', party: 'Democrat', yearsInOffice: 8, email: 'rep@khanna.house.gov', phone: '(202) 225-2631', committees: ['Armed Services', 'Oversight'], supportVotes: 3567, opposeVotes: 1456, userVote: null, bio: 'Silicon Valley progressive', stockTrades: [] },
      { name: 'Eric Swalwell', state: 'California', district: 'CA-14', party: 'Democrat', yearsInOffice: 12, email: 'rep@swalwell.house.gov', phone: '(202) 225-5065', committees: ['Intelligence', 'Judiciary'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Former presidential candidate', stockTrades: [] },
      { name: 'Ted Lieu', state: 'California', district: 'CA-36', party: 'Democrat', yearsInOffice: 10, email: 'rep@lieu.house.gov', phone: '(202) 225-3976', committees: ['Foreign Affairs', 'Judiciary'], supportVotes: 3678, opposeVotes: 1234, userVote: null, bio: 'Air Force veteran, tech-savvy', stockTrades: [] },
      { name: 'Jimmy Gomez', state: 'California', district: 'CA-34', party: 'Democrat', yearsInOffice: 7, email: 'rep@gomez.house.gov', phone: '(202) 225-6235', committees: ['Ways and Means'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Progressive Latino leader', stockTrades: [] },
      { name: 'Sara Jacobs', state: 'California', district: 'CA-51', party: 'Democrat', yearsInOffice: 4, email: 'rep@jacobs.house.gov', phone: '(202) 225-2040', committees: ['Foreign Affairs', 'Armed Services'], supportVotes: 3345, opposeVotes: 1678, userVote: null, bio: 'Youngest member from California', stockTrades: [] },
      { name: 'Young Kim', state: 'California', district: 'CA-40', party: 'Republican', yearsInOffice: 4, email: 'rep@kim.house.gov', phone: '(202) 225-4111', committees: ['Foreign Affairs', 'Small Business'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'First Korean-American Republican woman', stockTrades: [] },
      { name: 'Michelle Steel', state: 'California', district: 'CA-45', party: 'Republican', yearsInOffice: 4, email: 'rep@steel.house.gov', phone: '(202) 225-2415', committees: ['Ways and Means'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Korean-American, tax policy focus', stockTrades: [] },
      { name: 'Diana DeGette', state: 'Colorado', district: 'CO-1', party: 'Democrat', yearsInOffice: 27, email: 'rep@degette.house.gov', phone: '(202) 225-4431', committees: ['Energy and Commerce'], supportVotes: 3567, opposeVotes: 1456, userVote: null, bio: 'Senior member, health care advocate', stockTrades: [] },
      { name: 'Joe Neguse', state: 'Colorado', district: 'CO-2', party: 'Democrat', yearsInOffice: 6, email: 'rep@neguse.house.gov', phone: '(202) 225-2161', committees: ['Judiciary', 'Natural Resources'], supportVotes: 3678, opposeVotes: 1234, userVote: null, bio: 'Trump impeachment manager', stockTrades: [] },
      { name: 'Doug Lamborn', state: 'Colorado', district: 'CO-5', party: 'Republican', yearsInOffice: 17, email: 'rep@lamborn.house.gov', phone: '(202) 225-4422', committees: ['Armed Services'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Military affairs focus', stockTrades: [] },
      { name: 'John Larson', state: 'Connecticut', district: 'CT-1', party: 'Democrat', yearsInOffice: 24, email: 'rep@larson.house.gov', phone: '(202) 225-2265', committees: ['Ways and Means'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Social Security advocate', stockTrades: [] },
      { name: 'Rosa DeLauro', state: 'Connecticut', district: 'CT-3', party: 'Democrat', yearsInOffice: 32, email: 'rep@delauro.house.gov', phone: '(202) 225-3661', committees: ['Appropriations'], supportVotes: 3567, opposeVotes: 1456, userVote: null, bio: 'Appropriations Chair', stockTrades: [] },
      { name: 'Lisa Blunt Rochester', state: 'Delaware', district: 'DE-At Large', party: 'Democrat', yearsInOffice: 8, email: 'rep@bluntrochester.house.gov', phone: '(202) 225-4165', committees: ['Energy and Commerce'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'First woman and Black person to represent Delaware', stockTrades: [] },
      { name: 'Debbie Wasserman Schultz', state: 'Florida', district: 'FL-25', party: 'Democrat', yearsInOffice: 18, email: 'rep@wassermanschultz.house.gov', phone: '(202) 225-7931', committees: ['Appropriations'], supportVotes: 3345, opposeVotes: 1678, userVote: null, bio: 'Former DNC Chair', stockTrades: [] },
      { name: 'Val Demings', state: 'Florida', district: 'FL-10', party: 'Democrat', yearsInOffice: 8, email: 'rep@demings.house.gov', phone: '(202) 225-2176', committees: ['Intelligence', 'Judiciary'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Former police chief', stockTrades: [] },
      { name: 'Kathy Castor', state: 'Florida', district: 'FL-14', party: 'Democrat', yearsInOffice: 17, email: 'rep@castor.house.gov', phone: '(202) 225-3376', committees: ['Energy and Commerce'], supportVotes: 3345, opposeVotes: 1678, userVote: null, bio: 'Climate crisis committee chair', stockTrades: [] },
      { name: 'Byron Donalds', state: 'Florida', district: 'FL-19', party: 'Republican', yearsInOffice: 4, email: 'rep@donalds.house.gov', phone: '(202) 225-2536', committees: ['Financial Services'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Black conservative leader', stockTrades: [] },
      { name: 'Carlos Gimenez', state: 'Florida', district: 'FL-28', party: 'Republican', yearsInOffice: 4, email: 'rep@gimenez.house.gov', phone: '(202) 225-2778', committees: ['Transportation', 'Homeland Security'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'Former Miami-Dade mayor', stockTrades: [] },
      { name: 'Maria Elvira Salazar', state: 'Florida', district: 'FL-27', party: 'Republican', yearsInOffice: 4, email: 'rep@salazar.house.gov', phone: '(202) 225-3931', committees: ['Foreign Affairs'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Former journalist, Cuban-American', stockTrades: [] },
      { name: 'Hank Johnson', state: 'Georgia', district: 'GA-4', party: 'Democrat', yearsInOffice: 18, email: 'rep@johnson.house.gov', phone: '(202) 225-1605', committees: ['Judiciary', 'Transportation'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Progressive voice on judiciary', stockTrades: [] },
      { name: 'Lucy McBath', state: 'Georgia', district: 'GA-7', party: 'Democrat', yearsInOffice: 6, email: 'rep@mcbath.house.gov', phone: '(202) 225-4501', committees: ['Education', 'Judiciary'], supportVotes: 3567, opposeVotes: 1456, userVote: null, bio: 'Gun violence prevention advocate', stockTrades: [] },
      { name: 'Nikema Williams', state: 'Georgia', district: 'GA-5', party: 'Democrat', yearsInOffice: 4, email: 'rep@williams.house.gov', phone: '(202) 225-3801', committees: ['Transportation', 'Financial Services'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Holds John Lewis\' former seat', stockTrades: [] },
      { name: 'Andrew Clyde', state: 'Georgia', district: 'GA-9', party: 'Republican', yearsInOffice: 4, email: 'rep@clyde.house.gov', phone: '(202) 225-9893', committees: ['Oversight', 'Homeland Security'], supportVotes: 2345, opposeVotes: 2678, userVote: null, bio: 'Gun store owner, Second Amendment focus', stockTrades: [] },
      { name: 'Ed Case', state: 'Hawaii', district: 'HI-1', party: 'Democrat', yearsInOffice: 6, email: 'rep@case.house.gov', phone: '(202) 225-2726', committees: ['Appropriations'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'Former state representative', stockTrades: [] },
      { name: 'Mike Simpson', state: 'Idaho', district: 'ID-2', party: 'Republican', yearsInOffice: 24, email: 'rep@simpson.house.gov', phone: '(202) 225-5531', committees: ['Appropriations'], supportVotes: 2678, opposeVotes: 2234, userVote: null, bio: 'Appropriations member, infrastructure focus', stockTrades: [] },
      { name: 'Robin Kelly', state: 'Illinois', district: 'IL-2', party: 'Democrat', yearsInOffice: 11, email: 'rep@kelly.house.gov', phone: '(202) 225-0773', committees: ['Energy and Commerce'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Gun violence prevention leader', stockTrades: [] },
      { name: 'Jan Schakowsky', state: 'Illinois', district: 'IL-9', party: 'Democrat', yearsInOffice: 25, email: 'rep@schakowsky.house.gov', phone: '(202) 225-2111', committees: ['Energy and Commerce'], supportVotes: 3567, opposeVotes: 1456, userVote: null, bio: 'Progressive, consumer advocate', stockTrades: [] },
      { name: 'Sean Casten', state: 'Illinois', district: 'IL-6', party: 'Democrat', yearsInOffice: 6, email: 'rep@casten.house.gov', phone: '(202) 225-4561', committees: ['Financial Services'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Clean energy scientist', stockTrades: [] },
      { name: 'Mike Quigley', state: 'Illinois', district: 'IL-5', party: 'Democrat', yearsInOffice: 15, email: 'rep@quigley.house.gov', phone: '(202) 225-4061', committees: ['Appropriations', 'Intelligence'], supportVotes: 3345, opposeVotes: 1678, userVote: null, bio: 'LGBTQ+ rights advocate', stockTrades: [] },
      { name: 'Mary Miller', state: 'Illinois', district: 'IL-15', party: 'Republican', yearsInOffice: 4, email: 'rep@miller.house.gov', phone: '(202) 225-5271', committees: ['Agriculture', 'Education'], supportVotes: 2345, opposeVotes: 2678, userVote: null, bio: 'Conservative farmer', stockTrades: [] },
      { name: 'Victoria Spartz', state: 'Indiana', district: 'IN-5', party: 'Republican', yearsInOffice: 4, email: 'rep@spartz.house.gov', phone: '(202) 225-2276', committees: ['Judiciary', 'Education'], supportVotes: 2567, opposeVotes: 2345, userVote: null, bio: 'First Ukrainian-born member', stockTrades: [] },
      { name: 'Tracey Mann', state: 'Kansas', district: 'KS-1', party: 'Republican', yearsInOffice: 4, email: 'rep@mann.house.gov', phone: '(202) 225-2715', committees: ['Agriculture', 'Transportation'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Farmer and former state official', stockTrades: [] },
      { name: 'Morgan McGarvey', state: 'Kentucky', district: 'KY-3', party: 'Democrat', yearsInOffice: 2, email: 'rep@mcgarvey.house.gov', phone: '(202) 225-5401', committees: ['Education', 'Veterans Affairs'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'Former state senator', stockTrades: [] },
      { name: 'Steve Scalise', state: 'Louisiana', district: 'LA-1', party: 'Republican', yearsInOffice: 15, email: 'rep@scalise.house.gov', phone: '(202) 225-3015', committees: ['Leadership'], supportVotes: 3123, opposeVotes: 1892, userVote: null, bio: 'House Majority Leader', stockTrades: [] },
      { name: 'Chellie Pingree', state: 'Maine', district: 'ME-1', party: 'Democrat', yearsInOffice: 15, email: 'rep@pingree.house.gov', phone: '(202) 225-6116', committees: ['Appropriations'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Organic farmer, food policy expert', stockTrades: [] },
      { name: 'Jared Golden', state: 'Maine', district: 'ME-2', party: 'Democrat', yearsInOffice: 6, email: 'rep@golden.house.gov', phone: '(202) 225-6306', committees: ['Armed Services', 'Small Business'], supportVotes: 2989, opposeVotes: 1934, userVote: null, bio: 'Marine veteran, moderate Democrat', stockTrades: [] },
      { name: 'Steny Hoyer', state: 'Maryland', district: 'MD-5', party: 'Democrat', yearsInOffice: 43, email: 'rep@hoyer.house.gov', phone: '(202) 225-4131', committees: ['Leadership'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Former House Majority Leader', stockTrades: [] },
      { name: 'Jamie Raskin', state: 'Maryland', district: 'MD-8', party: 'Democrat', yearsInOffice: 8, email: 'rep@raskin.house.gov', phone: '(202) 225-5341', committees: ['Oversight', 'Judiciary'], supportVotes: 3678, opposeVotes: 1234, userVote: null, bio: 'Constitutional scholar, Trump impeachment manager', stockTrades: [] },
      { name: 'Andy Harris', state: 'Maryland', district: 'MD-1', party: 'Republican', yearsInOffice: 14, email: 'rep@harris.house.gov', phone: '(202) 225-5311', committees: ['Appropriations'], supportVotes: 2456, opposeVotes: 2567, userVote: null, bio: 'Physician, Freedom Caucus member', stockTrades: [] },
      { name: 'Jake Auchincloss', state: 'Massachusetts', district: 'MA-4', party: 'Democrat', yearsInOffice: 4, email: 'rep@auchincloss.house.gov', phone: '(202) 225-5931', committees: ['Transportation', 'Financial Services'], supportVotes: 3345, opposeVotes: 1678, userVote: null, bio: 'Marine veteran, young centrist', stockTrades: [] },
      { name: 'Seth Moulton', state: 'Massachusetts', district: 'MA-6', party: 'Democrat', yearsInOffice: 10, email: 'rep@moulton.house.gov', phone: '(202) 225-8020', committees: ['Armed Services', 'Budget'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'Marine veteran, presidential candidate', stockTrades: [] },
      { name: 'Debbie Dingell', state: 'Michigan', district: 'MI-6', party: 'Democrat', yearsInOffice: 10, email: 'rep@dingell.house.gov', phone: '(202) 225-4071', committees: ['Energy and Commerce'], supportVotes: 3456, opposeVotes: 1567, userVote: null, bio: 'Holds late husband\'s seat, auto industry focus', stockTrades: [] },
      { name: 'Elissa Slotkin', state: 'Michigan', district: 'MI-7', party: 'Democrat', yearsInOffice: 6, email: 'rep@slotkin.house.gov', phone: '(202) 225-4872', committees: ['Armed Services', 'Homeland Security'], supportVotes: 3234, opposeVotes: 1678, userVote: null, bio: 'CIA officer, national security expert', stockTrades: [] }
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
                setView('categories');
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
          onClick={() => setView('countries')}
          className="mb-4 sm:mb-6 button-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium text-sm sm:text-base shadow-elegant"
        >
          ← Back to Countries
        </button>
        
        <div className="mb-8 animate-slide-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-shadow">{countryName} Government</h1>
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

          {/* Legislative Hub - Combines Bills, Laws & Legislation (Canada Only) */}
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
            
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {showMenu && (
          <div className="fixed top-16 right-4 bg-white shadow-xl rounded-lg p-4 z-20 w-64">
            <button
              onClick={() => {
                setView('analytics');
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded flex items-center gap-3 text-gray-700 font-medium mb-2"
            >
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Analytics Dashboard
            </button>
            <button
              onClick={() => {
                setView('bills');
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded flex items-center gap-3 text-gray-700 font-medium"
            >
              <FileText className="w-5 h-5 text-purple-600" />
              Parliamentary Bills
            </button>
          </div>
        )}

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
                      setView('member-detail');
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

  return (
    <div className="App smooth-scroll">
      <style>{customStyles}</style>
      {view === 'countries' && renderCountrySelection()}
        {view === 'categories' && renderCategories()}
        {view === 'chambers' && renderChambers()}
        {view === 'parties' && renderParties()}
        {view === 'members' && renderMembers()}
        {view === 'member-detail' && selectedMember && renderMemberDetail()}
        {view === 'analytics' && renderAnalytics()}
        {view === 'us-analytics' && renderUSAnalytics()}
        {view === 'bills' && renderBills()}
        {view === 'legislative-hub' && renderLegislativeHub()}
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
    </div>
  );
}

export default App;