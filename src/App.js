import React, { useState, useEffect } from 'react';
import { Menu, ChevronRight, ChevronDown, Globe, Users, FileText, AlertCircle, MapPin, Calendar, Award, CheckCircle, XCircle, MinusCircle, DollarSign, TrendingUp, Briefcase, Building2, Search, X, Filter, BarChart3, PieChart, ThumbsUp, ThumbsDown, Clock, Crown, Star } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './App.css';

function App() {
  const [view, setView] = useState('countries');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  
  const [mps, setMps] = useState([]);
  const [bills, setBills] = useState([]);
  const [laws, setLaws] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [governmentData, setGovernmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('role');
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  
  // Location-based MP finder states
  const [userMP, setUserMP] = useState(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  // Ministries state
  const [selectedMinistry, setSelectedMinistry] = useState(null);
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
    'Liberal': '#EF4444',
    'Conservative': '#3B82F6',
    'NDP': '#F97316',
    'Bloc Québécois': '#06B6D4',
    'Green Party': '#10B981'
  };

  // Get parties with counts
  const getParties = () => {
    const partyCounts = {};
    mps.forEach(mp => {
      partyCounts[mp.party] = (partyCounts[mp.party] || 0) + 1;
    });

    return Object.entries(partyCounts).map(([name, count]) => ({
      name,
      count,
      color: partyColors[name] || '#6B7280'
    })).sort((a, b) => b.count - a.count);
  };

  // Get MPs for selected party, sorted by role
  const getPartyMPs = () => {
    if (!selectedParty) return [];
    
    let filtered = mps.filter(mp => mp.party === selectedParty.name);

    if (searchQuery) {
      filtered = filtered.filter(mp =>
        mp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mp.riding.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by role hierarchy
    filtered.sort((a, b) => {
      // PM first
      if (a.isPrimeMinister) return -1;
      if (b.isPrimeMinister) return 1;
      
      // Then Cabinet
      if (a.isCabinet && !b.isCabinet) return -1;
      if (b.isCabinet && !a.isCabinet) return 1;
      
      // Then Party Leaders
      if (a.isPartyLeader && !b.isPartyLeader) return -1;
      if (b.isPartyLeader && !a.isPartyLeader) return 1;
      
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });

    return filtered;
  };

  const [expandedSections, setExpandedSections] = useState({
    voting: false,
    attendance: false,
    expenses: false,
    financial: false,
    lobbying: false,
    corporate: false
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
    { id: 1, name: 'Canada', flag: '🇨🇦', members: mps.length || 338 }
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

  const renderCountrySelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Civic Voice</h1>
        <p className="text-gray-600 mb-8">Full Government Transparency Platform</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold">API Connection Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {countries.map(country => (
            <div
              key={country.id}
              onClick={() => setView('categories')}
              className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-6xl mb-4">{country.flag}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{country.name}</h2>
              <p className="text-gray-600">{country.members} elected members</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setView('countries')}
          className="mb-4 sm:mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium text-sm sm:text-base"
        >
          ← Back to Countries
        </button>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">Canadian Government</h1>
        <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg">Explore different aspects of federal governance</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Federal Parliament */}
          <div
            onClick={() => setView('parties')}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-500 active:scale-95"
          >
            <div className="text-blue-600 mb-3 sm:mb-4">
              <Users className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Federal Parliament</h2>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">Explore 325 Members of Parliament across all parties</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>325 MPs</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div
            onClick={() => setView('analytics')}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-500 active:scale-95"
          >
            <div className="text-purple-600 mb-3 sm:mb-4">
              <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h2>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">View economic impact, immigration, crime trends & spending</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>11 Charts</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* Parliamentary Bills */}
          <div
            onClick={() => setView('bills')}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-500 active:scale-95"
          >
            <div className="text-green-600 mb-3 sm:mb-4">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Parliamentary Bills</h2>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">Track and vote on upcoming legislation</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{bills.length} Bills</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* Government Ministries */}
          <div
            onClick={() => setView('ministries')}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-500 active:scale-95"
          >
            <div className="text-orange-600 mb-3 sm:mb-4">
              <Building2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Government Ministries</h2>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">Review budgets, grants & approve ministerial performance</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>15 Ministries</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* Latest Laws & Regulations */}
          <div
            onClick={() => setView('laws')}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-indigo-500 active:scale-95"
          >
            <div className="text-indigo-600 mb-3 sm:mb-4">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Latest Laws & Regulations</h2>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">Recently implemented legislation affecting Canadians</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{laws.length} Laws</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>

          {/* Government Contracts */}
          <div
            onClick={() => setView('contracts')}
            className="bg-white rounded-xl shadow-lg p-6 sm:p-8 cursor-pointer hover:shadow-2xl transition-all border-2 border-transparent hover:border-red-500 active:scale-95"
          >
            <div className="text-red-600 mb-3 sm:mb-4">
              <DollarSign className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Government Contracts</h2>
            <p className="text-gray-600 mb-3 text-sm sm:text-base">Follow taxpayer money and major government spending</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{contracts.length} Contracts</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderParties = () => {
    const parties = getParties();

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header without menu */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('categories')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Government Levels
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800">Federal Parliament</h1>
            
            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Find Your MP Section */}
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
            onClick={() => setView('parties')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back
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
                    <div className="flex items-center justify-between">
                      <div className="flex gap-6">
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

                      <div className="flex gap-3">
                        <button
                          onClick={() => voteBill(bill.id, bill.userVote === 'support' ? 'remove' : 'support')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            bill.userVote === 'support'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {bill.userVote === 'support' ? 'Supporting' : 'Support'}
                        </button>
                        <button
                          onClick={() => voteBill(bill.id, bill.userVote === 'oppose' ? 'remove' : 'oppose')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            bill.userVote === 'oppose'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          {bill.userVote === 'oppose' ? 'Opposing' : 'Oppose'}
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

  const renderAnalytics = () => {
    const analytics = getAnalyticsData();

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setView('parties')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back
            </button>
            
            <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
            
            <div className="w-20"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Data Insights</h2>
            <p className="text-gray-600">Visual analysis of {mps.length} Members of Parliament</p>
          </div>

          {/* GOVERNMENT IMPACT SECTION */}
          {governmentData && (
            <>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🏛️ Government Policy Impact</h2>
                <p className="text-gray-600">How current government policies are affecting Canada</p>
              </div>

              {/* Economic Impact Chart */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  📈 Economic Impact Under Current Government
                </h3>
                <p className="text-sm text-gray-600 mb-4">Key economic indicators showing government policy effectiveness</p>
                
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={governmentData.economy.years.map((year, i) => ({
                    year,
                    gdp: governmentData.economy.gdpGrowth[i],
                    unemployment: governmentData.economy.unemployment[i],
                    inflation: governmentData.economy.inflation[i]
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Line type="monotone" dataKey="gdp" stroke="#10B981" strokeWidth={2} name="GDP Growth %" />
                    <Line type="monotone" dataKey="unemployment" stroke="#F59E0B" strokeWidth={2} name="Unemployment %" />
                    <Line type="monotone" dataKey="inflation" stroke="#EF4444" strokeWidth={2} name="Inflation %" />
                  </LineChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">GDP Growth (2025)</p>
                    <p className="text-2xl font-bold text-green-600">{governmentData.economy.gdpGrowth[3]}%</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-600 mb-1">Unemployment (2025)</p>
                    <p className="text-2xl font-bold text-yellow-600">{governmentData.economy.unemployment[3]}%</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-gray-600 mb-1">Inflation (2025)</p>
                    <p className="text-2xl font-bold text-red-600">{governmentData.economy.inflation[3]}%</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Consumer Confidence</p>
                    <p className="text-2xl font-bold text-blue-600">{governmentData.economy.consumerConfidence[3]}/100</p>
                  </div>
                </div>
              </div>

              {/* Immigration Policy Chart */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-purple-600" />
                  🌍 Immigration Policy & Acceptance
                </h3>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Policy Stance</p>
                      <p className="text-xl font-bold text-purple-700">{governmentData.immigration.analysis.stance}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">2025 Accepted</p>
                      <p className="text-xl font-bold text-purple-700">{governmentData.immigration.accepted[3].toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Target Achievement</p>
                      <p className="text-xl font-bold text-purple-700">{governmentData.immigration.analysis.targetAchievement}%</p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={governmentData.immigration.years.map((year, i) => ({
                    year,
                    target: governmentData.immigration.targets[i],
                    accepted: governmentData.immigration.accepted[i]
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="target" fill="#9CA3AF" name="Immigration Target" />
                    <Bar dataKey="accepted" fill="#8B5CF6" name="Actually Accepted" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-800 mb-3">2025 Immigration by Category</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(governmentData.immigration.byCategory["2025"]).map(([category, count]) => (
                      <div key={category} className="bg-white p-3 rounded border">
                        <p className="text-xs text-gray-600 capitalize">{category}</p>
                        <p className="text-lg font-bold text-gray-800">{count.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Crime Rate Trends Chart */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  🚨 Crime Rate Trends
                </h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Overall Crime Trend</p>
                      <p className="text-2xl font-bold text-green-700">
                        Declining {governmentData.crime.percentChange[3]}% Year-over-Year
                      </p>
                    </div>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={governmentData.crime.years.map((year, i) => ({
                    year,
                    violent: governmentData.crime.violentCrime[i],
                    property: governmentData.crime.propertyCrime[i],
                    overall: governmentData.crime.overallIndex[i]
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} per 100K`} />
                    <Legend />
                    <Line type="monotone" dataKey="violent" stroke="#EF4444" strokeWidth={2} name="Violent Crime" />
                    <Line type="monotone" dataKey="property" stroke="#F59E0B" strokeWidth={2} name="Property Crime" />
                    <Line type="monotone" dataKey="overall" stroke="#6B7280" strokeWidth={3} name="Overall Crime Index" />
                  </LineChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-gray-600 mb-1">Violent Crime (2025)</p>
                    <p className="text-2xl font-bold text-red-600">{governmentData.crime.violentCrime[3]}</p>
                    <p className="text-xs text-gray-500">per 100,000 people</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-600 mb-1">Property Crime (2025)</p>
                    <p className="text-2xl font-bold text-yellow-600">{governmentData.crime.propertyCrime[3]}</p>
                    <p className="text-xs text-gray-500">per 100,000 people</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">YoY Change</p>
                    <p className="text-2xl font-bold text-green-600">{governmentData.crime.percentChange[3]}%</p>
                    <p className="text-xs text-gray-500">Improvement</p>
                  </div>
                </div>
              </div>

              {/* Government Spending by Sector Chart */}
              {governmentData.spending && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    💰 Government Spending by Sector (2025)
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600">Total Budget</p>
                    <p className="text-3xl font-bold text-green-700">
                      ${(governmentData.spending.totalBudget / 1e9).toFixed(1)} Billion
                    </p>
                  </div>

                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={governmentData.spending.sectors}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                      <YAxis tickFormatter={(value) => `$${(value / 1e9).toFixed(0)}B`} />
                      <Tooltip 
                        formatter={(value) => [`$${(value / 1e9).toFixed(2)} Billion`, 'Amount']}
                      />
                      <Bar dataKey="amount" fill="#10B981">
                        {governmentData.spending.sectors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    {governmentData.spending.sectors.slice(0, 4).map((sector, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded border">
                        <p className="text-xs text-gray-600 font-medium mb-1">{sector.name}</p>
                        <p className="text-lg font-bold text-gray-800">
                          ${(sector.amount / 1e9).toFixed(1)}B
                        </p>
                        <p className="text-xs text-gray-500">{sector.percentage}% of budget</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Foreign Aid Chart */}
              {governmentData.foreignAid && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-600" />
                    🌍 Foreign Aid & International Assistance (2025)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Total Foreign Aid</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${(governmentData.foreignAid.totalAmount / 1e9).toFixed(2)}B
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Grants (Non-Repayable)</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${(governmentData.foreignAid.breakdown.totalGrants / 1e9).toFixed(2)}B
                      </p>
                      <p className="text-xs text-gray-500">{governmentData.foreignAid.breakdown.grantPercentage}%</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600 mb-1">Loans (Repayable)</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ${(governmentData.foreignAid.breakdown.totalLoans / 1e9).toFixed(2)}B
                      </p>
                      <p className="text-xs text-gray-500">{governmentData.foreignAid.breakdown.loanPercentage}%</p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={governmentData.foreignAid.byCountry.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" angle={-45} textAnchor="end" height={100} />
                      <YAxis tickFormatter={(value) => `$${(value / 1e6).toFixed(0)}M`} />
                      <Tooltip 
                        formatter={(value) => [`$${(value / 1e6).toFixed(0)} Million`, 'Amount']}
                        labelFormatter={(label) => label}
                      />
                      <Bar dataKey="amount" fill="#3B82F6">
                        {governmentData.foreignAid.byCountry.slice(0, 10).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.type === 'Grant' ? '#10B981' : entry.type === 'Loan' ? '#F59E0B' : '#6B7280'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 space-y-2">
                    <h4 className="font-bold text-gray-800 mb-3">Top Recipients:</h4>
                    {governmentData.foreignAid.byCountry.slice(0, 8).map((aid, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{aid.country}</p>
                          <p className="text-xs text-gray-600">{aid.purpose}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            ${(aid.amount / 1e6).toFixed(0)}M
                          </p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            aid.type === 'Grant' 
                              ? 'bg-green-100 text-green-700' 
                              : aid.type === 'Loan'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {aid.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> Grants are non-repayable aid (humanitarian, development). 
                      Loans are repayable with favorable terms (infrastructure, economic development).
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8 mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">👥 MP Performance Analytics</h2>
                <p className="text-gray-600">Individual Member of Parliament statistics and comparisons</p>
              </div>
            </>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Top 10 MPs by Office Expenses
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.topExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrencyShort} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-red-600" />
              Top 10 MPs by Lobbying Value
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.topLobbying}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrencyShort} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Top 10 MPs by Wealth Increase
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.topWealth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Total Expenses by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={analytics.expensePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Lobbying by Sector</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={analytics.lobbyingPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.lobbyingPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">MPs by Political Party</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={analytics.partyPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value}) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.partyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
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
              <div className="flex items-center justify-between">
                <div className="flex gap-8">
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

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const mpIndex = mps.findIndex(m => m.name === selectedMember.name);
                      voteMP(mpIndex, selectedMember.userVote === 'support' ? 'remove' : 'support');
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      selectedMember.userVote === 'support'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    {selectedMember.userVote === 'support' ? 'Supporting' : 'Support This MP'}
                  </button>
                  <button
                    onClick={() => {
                      const mpIndex = mps.findIndex(m => m.name === selectedMember.name);
                      voteMP(mpIndex, selectedMember.userVote === 'oppose' ? 'remove' : 'oppose');
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      selectedMember.userVote === 'oppose'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    {selectedMember.userVote === 'oppose' ? 'Opposing' : 'Oppose This MP'}
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
    <div className="App">
      {view === 'countries' && renderCountrySelection()}
      {view === 'categories' && renderCategories()}
      {view === 'parties' && renderParties()}
      {view === 'members' && renderMembers()}
      {view === 'member-detail' && selectedMember && renderMemberDetail()}
      {view === 'analytics' && renderAnalytics()}
      {view === 'bills' && renderBills()}
      {view === 'bill-detail' && selectedBill && renderBillDetail()}
      {view === 'laws' && renderLaws()}
      {view === 'law-detail' && selectedLaw && renderLawDetail()}
      {view === 'contracts' && renderContracts()}
      {view === 'contract-detail' && selectedContract && renderContractDetail()}
      {view === 'ministries' && renderMinistries()}
      {view === 'ministry-detail' && selectedMinistry && renderMinistryDetail()}
      
      {/* Riding selector modal */}
      {showLocationPrompt && renderRidingSelector()}
    </div>
  );
}

export default App;