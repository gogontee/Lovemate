// components/directors/AnalyticsCharts.js
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, Users, Gift, 
  Calendar, ChevronDown, Activity, DollarSign,
  UserPlus, UserCheck 
} from "lucide-react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// Trend types
const TRENDS = {
  VOTE: 'vote',
  GIFT: 'gift',
  REVENUE: 'revenue',
  REGISTRATION: 'registration',
  SIGNUP: 'signup'
};

export default function AnalyticsCharts({ 
  voteTransactions = [], 
  giftTransactions = [],
  candidates = [],
  profiles = []
}) {
  const [selectedTrend, setSelectedTrend] = useState(TRENDS.VOTE);
  const [showTrendDropdown, setShowTrendDropdown] = useState(false);
  const [chartData, setChartData] = useState({});
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  // Process data when component mounts
  useEffect(() => {
    processAllData();
  }, [voteTransactions, giftTransactions, candidates, profiles]);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right - window.scrollX
      });
    }
  };

  const processAllData = () => {
    console.log("🔄 Processing analytics data:", {
      voteTransactions: voteTransactions?.length || 0,
      giftTransactions: giftTransactions?.length || 0,
      candidates: candidates?.length || 0,
      profiles: profiles?.length || 0
    });
    
    // Process vote data from vote_transactions table
    const voteData = processVoteData();
    console.log("📈 Vote analytics:", voteData);
    
    // Process gift data from gift_transactions table
    const giftData = processGiftData();
    console.log("🎁 Gift analytics:", giftData);
    
    // Process revenue data from both tables
    const revenueData = processRevenueData();
    console.log("💰 Revenue analytics:", revenueData);
    
    // Process registration data from candidates table
    const registrationData = processRegistrationData();
    console.log("📝 Registration analytics:", registrationData);
    
    // Process signup data from profiles table
    const signupData = processSignupData();
    console.log("👤 Signup analytics:", signupData);

    setChartData({
      vote: voteData,
      gift: giftData,
      revenue: revenueData,
      registration: registrationData,
      signup: signupData
    });
  };

  const processVoteData = () => {
    if (!voteTransactions || voteTransactions.length === 0) {
      return { labels: [], participation: [], revenue: [], raw: {} };
    }
    
    const dailyData = {};
    
    voteTransactions.forEach((vote) => {
      if (!vote?.created_at) {
        console.warn("⚠️ Vote missing created_at:", vote?.id);
        return;
      }
      
      try {
        const date = new Date(vote.created_at).toLocaleDateString();
        if (!dailyData[date]) {
          dailyData[date] = {
            participation: 0,
            revenue: 0,
            count: 0
          };
        }
        dailyData[date].participation += 1;
        dailyData[date].revenue += vote.total_amount || 0;
        dailyData[date].count += 1;
      } catch (e) {
        console.warn("⚠️ Error processing vote date:", vote.created_at, e);
      }
    });

    const sortedDates = Object.keys(dailyData).sort((a, b) => 
      new Date(a) - new Date(b)
    );

    return {
      labels: sortedDates,
      participation: sortedDates.map(date => dailyData[date]?.participation || 0),
      revenue: sortedDates.map(date => (dailyData[date]?.revenue || 0) / 1000),
      raw: dailyData
    };
  };

  const processGiftData = () => {
    if (!giftTransactions || giftTransactions.length === 0) {
      return { labels: [], participation: [], revenue: [], raw: {} };
    }
    
    const dailyData = {};
    
    giftTransactions.forEach((gift) => {
      if (!gift?.created_at) {
        console.warn("⚠️ Gift missing created_at:", gift?.id);
        return;
      }
      
      try {
        const date = new Date(gift.created_at).toLocaleDateString();
        if (!dailyData[date]) {
          dailyData[date] = {
            participation: 0,
            revenue: 0,
            count: 0
          };
        }
        dailyData[date].participation += 1;
        dailyData[date].revenue += gift.amount || 0;
        dailyData[date].count += 1;
      } catch (e) {
        console.warn("⚠️ Error processing gift date:", gift.created_at, e);
      }
    });

    const sortedDates = Object.keys(dailyData).sort((a, b) => 
      new Date(a) - new Date(b)
    );

    return {
      labels: sortedDates,
      participation: sortedDates.map(date => dailyData[date]?.participation || 0),
      revenue: sortedDates.map(date => (dailyData[date]?.revenue || 0) / 1000),
      raw: dailyData
    };
  };

  const processRevenueData = () => {
    const allData = [
      ...(voteTransactions || []).map(v => ({
        date: v?.created_at,
        amount: v?.total_amount || 0,
        type: 'vote'
      })),
      ...(giftTransactions || []).map(g => ({
        date: g?.created_at,
        amount: g?.amount || 0,
        type: 'gift'
      }))
    ].filter(item => item.date);

    if (allData.length === 0) {
      return { labels: [], total: [], voteRevenue: [], giftRevenue: [], raw: {} };
    }

    const dailyData = {};
    
    allData.forEach(item => {
      try {
        const date = new Date(item.date).toLocaleDateString();
        if (!dailyData[date]) {
          dailyData[date] = {
            total: 0,
            voteRevenue: 0,
            giftRevenue: 0,
            count: 0
          };
        }
        dailyData[date].total += item.amount;
        if (item.type === 'vote') {
          dailyData[date].voteRevenue += item.amount;
        } else {
          dailyData[date].giftRevenue += item.amount;
        }
        dailyData[date].count += 1;
      } catch (e) {
        console.warn("⚠️ Error processing revenue date:", item.date, e);
      }
    });

    const sortedDates = Object.keys(dailyData).sort((a, b) => 
      new Date(a) - new Date(b)
    );

    return {
      labels: sortedDates,
      total: sortedDates.map(date => (dailyData[date]?.total || 0) / 1000),
      voteRevenue: sortedDates.map(date => (dailyData[date]?.voteRevenue || 0) / 1000),
      giftRevenue: sortedDates.map(date => (dailyData[date]?.giftRevenue || 0) / 1000),
      raw: dailyData
    };
  };

  const processRegistrationData = () => {
    if (!candidates || candidates.length === 0) {
      return { labels: [], counts: [], raw: {} };
    }
    
    const dailyData = {};
    
    candidates.forEach((candidate) => {
      if (!candidate?.created_at) {
        console.warn("⚠️ Candidate missing created_at:", candidate?.id);
        return;
      }
      try {
        const date = new Date(candidate.created_at).toLocaleDateString();
        dailyData[date] = (dailyData[date] || 0) + 1;
      } catch (e) {
        console.warn("⚠️ Error processing candidate date:", candidate.created_at, e);
      }
    });

    const sortedDates = Object.keys(dailyData).sort((a, b) => 
      new Date(a) - new Date(b)
    );

    return {
      labels: sortedDates,
      counts: sortedDates.map(date => dailyData[date] || 0),
      raw: dailyData
    };
  };

  const processSignupData = () => {
    if (!profiles || profiles.length === 0) {
      return { labels: [], counts: [], raw: {} };
    }
    
    const dailyData = {};
    
    profiles.forEach((profile) => {
      if (!profile?.created_at) {
        console.warn("⚠️ Profile missing created_at:", profile?.id);
        return;
      }
      try {
        const date = new Date(profile.created_at).toLocaleDateString();
        dailyData[date] = (dailyData[date] || 0) + 1;
      } catch (e) {
        console.warn("⚠️ Error processing profile date:", profile.created_at, e);
      }
    });

    const sortedDates = Object.keys(dailyData).sort((a, b) => 
      new Date(a) - new Date(b)
    );

    return {
      labels: sortedDates,
      counts: sortedDates.map(date => dailyData[date] || 0),
      raw: dailyData
    };
  };

  const getChartConfig = () => {
    const currentData = chartData[selectedTrend] || { labels: [] };

    switch(selectedTrend) {
      case TRENDS.VOTE:
        return {
          title: "Vote Analytics",
          icon: <Activity className="w-5 h-5 text-red-600" />,
          datasets: [
            {
              label: 'Vote Participation',
              data: currentData.participation || [],
              borderColor: 'rgb(225, 29, 72)',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              fill: true,
              tension: 0.4,
              yAxisID: 'y',
            },
            {
              label: 'Vote Revenue (₦000)',
              data: currentData.revenue || [],
              borderColor: 'rgb(37, 99, 235)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true,
              tension: 0.4,
              yAxisID: 'y1',
            }
          ]
        };

      case TRENDS.GIFT:
        return {
          title: "Gift Analytics",
          icon: <Gift className="w-5 h-5 text-red-600" />,
          datasets: [
            {
              label: 'Gift Participation',
              data: currentData.participation || [],
              borderColor: 'rgb(225, 29, 72)',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              fill: true,
              tension: 0.4,
              yAxisID: 'y',
            },
            {
              label: 'Gift Revenue (₦000)',
              data: currentData.revenue || [],
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              fill: true,
              tension: 0.4,
              yAxisID: 'y1',
            }
          ]
        };

      case TRENDS.REVENUE:
        return {
          title: "Revenue Analytics",
          icon: <DollarSign className="w-5 h-5 text-red-600" />,
          datasets: [
            {
              label: 'Total Revenue (₦000)',
              data: currentData.total || [],
              borderColor: 'rgb(225, 29, 72)',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              fill: true,
              tension: 0.4,
            }
          ]
        };

      case TRENDS.REGISTRATION:
        return {
          title: "Candidate Registration Trend",
          icon: <UserCheck className="w-5 h-5 text-red-600" />,
          datasets: [
            {
              label: 'New Registrations',
              data: currentData.counts || [],
              borderColor: 'rgb(225, 29, 72)',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              fill: true,
              tension: 0.4,
            }
          ]
        };

      case TRENDS.SIGNUP:
        return {
          title: "User Signup Trend",
          icon: <UserPlus className="w-5 h-5 text-red-600" />,
          datasets: [
            {
              label: 'New Signups',
              data: currentData.counts || [],
              borderColor: 'rgb(225, 29, 72)',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              fill: true,
              tension: 0.4,
            }
          ]
        };

      default:
        return {
          title: "Analytics",
          icon: <BarChart3 className="w-5 h-5 text-red-600" />,
          datasets: []
        };
    }
  };

  const chartConfig = getChartConfig();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#666',
          usePointStyle: true,
          boxWidth: 6
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 8,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (label.includes('Revenue')) {
                label += '₦' + (context.parsed.y * 1000).toLocaleString();
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        grid: {
          color: 'rgba(225, 29, 72, 0.1)'
        },
        ticks: {
          color: '#666',
          callback: function(value) {
            if (selectedTrend === TRENDS.VOTE || selectedTrend === TRENDS.GIFT) {
              return value;
            }
            return '₦' + value + 'k';
          }
        },
        title: {
          display: true,
          text: selectedTrend === TRENDS.VOTE || selectedTrend === TRENDS.GIFT ? 'Count' : 'Revenue (₦000)',
          color: '#666'
        }
      },
      y1: {
        type: 'linear',
        display: selectedTrend === TRENDS.VOTE || selectedTrend === TRENDS.GIFT,
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#666',
          callback: function(value) {
            return '₦' + value + 'k';
          }
        },
        title: {
          display: true,
          text: 'Revenue (₦000)',
          color: '#666'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#666',
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: 8
        }
      }
    }
  };

  const trendOptions = [
    { id: TRENDS.VOTE, label: 'Vote Analytics', icon: Activity },
    { id: TRENDS.GIFT, label: 'Gift Analytics', icon: Gift },
    { id: TRENDS.REVENUE, label: 'Revenue Analytics', icon: DollarSign },
    { id: TRENDS.REGISTRATION, label: 'Registration Trend', icon: UserCheck },
    { id: TRENDS.SIGNUP, label: 'Signup Trend', icon: UserPlus },
  ];

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    if (!showTrendDropdown) {
      updateDropdownPosition();
    }
    setShowTrendDropdown(!showTrendDropdown);
  };

  return (
    <motion.div
      variants={fadeInUp}
      className="space-y-4 relative"
    >
      {/* Trend Selector */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-rose-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {chartConfig.icon}
            {chartConfig.title}
          </h3>
          
          {/* Custom Dropdown Button */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={handleDropdownToggle}
              className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              <span>{trendOptions.find(t => t.id === selectedTrend)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showTrendDropdown ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-rose-100">
        <div className="h-80">
          {chartData[selectedTrend]?.labels?.length > 0 ? (
            <Line 
              data={{
                labels: chartData[selectedTrend].labels,
                datasets: chartConfig.datasets
              }} 
              options={chartOptions} 
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No data available for this period
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Portal */}
      {showTrendDropdown && (
        <>
          <div 
            className="fixed inset-0" 
            style={{ zIndex: 9998 }}
            onClick={() => setShowTrendDropdown(false)}
          />
          <div 
            className="fixed"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
              zIndex: 9999,
              width: '12rem'
            }}
          >
            <div className="bg-white rounded-xl shadow-xl border border-rose-100 overflow-hidden">
              {trendOptions.map((trend) => (
                <button
                  key={trend.id}
                  onClick={() => {
                    setSelectedTrend(trend.id);
                    setShowTrendDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                    selectedTrend === trend.id
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                      : 'text-gray-700 hover:bg-rose-50'
                  }`}
                >
                  <trend.icon className="w-4 h-4" />
                  {trend.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {selectedTrend === TRENDS.VOTE && (
          <>
            <StatCard 
              label="Total Votes" 
              value={voteTransactions.reduce((sum, v) => sum + (v.votes || 0), 0).toLocaleString()}
              subLabel="All time"
              color="from-red-600 to-rose-600"
            />
            <StatCard 
              label="Vote Revenue" 
              value={`₦${voteTransactions.reduce((sum, v) => sum + (v.total_amount || 0), 0).toLocaleString()}`}
              subLabel="Total value"
              color="from-blue-600 to-blue-700"
            />
            <StatCard 
              label="Peak Day" 
              value={getPeakDay(voteTransactions)}
              subLabel="Most active"
              color="from-green-600 to-green-700"
            />
            <StatCard 
              label="Avg per Day" 
              value={voteTransactions.length > 0 ? Math.round(voteTransactions.length / 30).toLocaleString() : '0'}
              subLabel="Last 30 days"
              color="from-purple-600 to-purple-700"
            />
          </>
        )}

        {selectedTrend === TRENDS.GIFT && (
          <>
            <StatCard 
              label="Total Gifts" 
              value={giftTransactions.length.toLocaleString()}
              subLabel="All time"
              color="from-red-600 to-rose-600"
            />
            <StatCard 
              label="Gift Revenue" 
              value={`₦${giftTransactions.reduce((sum, g) => sum + (g.amount || 0), 0).toLocaleString()}`}
              subLabel="Total value"
              color="from-green-600 to-green-700"
            />
            <StatCard 
              label="Peak Day" 
              value={getPeakDay(giftTransactions)}
              subLabel="Most gifts"
              color="from-blue-600 to-blue-700"
            />
            <StatCard 
              label="Avg per Day" 
              value={giftTransactions.length > 0 ? Math.round(giftTransactions.length / 30).toLocaleString() : '0'}
              subLabel="Last 30 days"
              color="from-purple-600 to-purple-700"
            />
          </>
        )}

        {selectedTrend === TRENDS.REVENUE && (
          <>
            <StatCard 
              label="Total Revenue" 
              value={`₦${(calculateTotalRevenue(voteTransactions, giftTransactions)).toLocaleString()}`}
              subLabel="All time"
              color="from-red-600 to-rose-600"
            />
            <StatCard 
              label="Vote Revenue" 
              value={`₦${voteTransactions.reduce((sum, v) => sum + (v.total_amount || 0), 0).toLocaleString()}`}
              subLabel="From votes"
              color="from-blue-600 to-blue-700"
            />
            <StatCard 
              label="Gift Revenue" 
              value={`₦${giftTransactions.reduce((sum, g) => sum + (g.amount || 0), 0).toLocaleString()}`}
              subLabel="From gifts"
              color="from-green-600 to-green-700"
            />
            <StatCard 
              label="Peak Day" 
              value={getPeakRevenueDay(voteTransactions, giftTransactions)}
              subLabel="Highest revenue"
              color="from-purple-600 to-purple-700"
            />
          </>
        )}

        {selectedTrend === TRENDS.REGISTRATION && (
          <>
            <StatCard 
              label="Total Candidates" 
              value={candidates.length.toLocaleString()}
              subLabel="All time"
              color="from-red-600 to-rose-600"
            />
            <StatCard 
              label="Approved" 
              value={candidates.filter(c => c.role === "Yes").length.toLocaleString()}
              subLabel="Ready to vote"
              color="from-green-600 to-green-700"
            />
            <StatCard 
              label="Pending" 
              value={candidates.filter(c => c.role !== "Yes").length.toLocaleString()}
              subLabel="Under review"
              color="from-yellow-600 to-yellow-700"
            />
            <StatCard 
              label="Peak Day" 
              value={getPeakDay(candidates)}
              subLabel="Most registrations"
              color="from-blue-600 to-blue-700"
            />
          </>
        )}

        {selectedTrend === TRENDS.SIGNUP && (
          <>
            <StatCard 
              label="Total Users" 
              value={profiles.length.toLocaleString()}
              subLabel="All time"
              color="from-red-600 to-rose-600"
            />
            <StatCard 
              label="Active Fans" 
              value={profiles.filter(p => p.points > 0).length.toLocaleString()}
              subLabel="With points"
              color="from-green-600 to-green-700"
            />
            <StatCard 
              label="New (30d)" 
              value={getNewUsersCount(profiles).toLocaleString()}
              subLabel="Last 30 days"
              color="from-blue-600 to-blue-700"
            />
            <StatCard 
              label="Peak Day" 
              value={getPeakDay(profiles)}
              subLabel="Most signups"
              color="from-purple-600 to-purple-700"
            />
          </>
        )}
      </div>
    </motion.div>
  );
}

// Helper Components
function StatCard({ label, value, subLabel, color }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-3 border border-rose-100">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r ${color}`}>
        {value}
      </p>
      <p className="text-[8px] text-gray-400 mt-1">{subLabel}</p>
    </div>
  );
}

// Helper Functions
function getPeakDay(items) {
  if (!items || items.length === 0) return 'N/A';
  
  const dailyCount = {};
  items.forEach(item => {
    if (!item?.created_at) return;
    try {
      const date = new Date(item.created_at).toLocaleDateString();
      dailyCount[date] = (dailyCount[date] || 0) + 1;
    } catch (e) {
      console.warn("⚠️ Error in getPeakDay:", e);
    }
  });
  
  const keys = Object.keys(dailyCount);
  if (keys.length === 0) return 'N/A';
  
  const peakDate = keys.reduce((a, b) => 
    dailyCount[a] > dailyCount[b] ? a : b
  );
  
  return peakDate;
}

function getPeakRevenueDay(voteTransactions, giftTransactions) {
  const dailyRevenue = {};
  
  [...voteTransactions, ...giftTransactions].forEach(item => {
    if (!item?.created_at) return;
    try {
      const date = new Date(item.created_at).toLocaleDateString();
      const amount = item.total_amount || item.amount || 0;
      dailyRevenue[date] = (dailyRevenue[date] || 0) + amount;
    } catch (e) {
      console.warn("⚠️ Error in getPeakRevenueDay:", e);
    }
  });
  
  const revenueKeys = Object.keys(dailyRevenue);
  if (revenueKeys.length === 0) {
    return 'N/A';
  }
  
  const peakDate = revenueKeys.reduce((a, b) => 
    dailyRevenue[a] > dailyRevenue[b] ? a : b
  );
  
  return peakDate || 'N/A';
}

function calculateTotalRevenue(voteTransactions, giftTransactions) {
  const voteRevenue = voteTransactions.reduce((sum, v) => sum + (v.total_amount || 0), 0);
  const giftRevenue = giftTransactions.reduce((sum, g) => sum + (g.amount || 0), 0);
  return voteRevenue + giftRevenue;
}

function getNewUsersCount(profiles) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return profiles.filter(p => {
    if (!p?.created_at) return false;
    try {
      return new Date(p.created_at) > thirtyDaysAgo;
    } catch (e) {
      return false;
    }
  }).length;
}