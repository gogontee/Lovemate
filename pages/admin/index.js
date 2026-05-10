// pages/admin/index.js
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import withAdminAuth from "@/components/withAdminAuth";
import NewsManagement from "@/components/admin/NewsManagement";
import ProfileManagement from "@/components/admin/ProfileManagement";
import CandidateManagement from "@/components/admin/CandidateManagement";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#ea580c", "#fbbf24"];

function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [stats, setStats] = useState({
    users: 0,
    votes: 0,
    revenue: 0,
    genderDistribution: [],
  });
  const [topVoters, setTopVoters] = useState([]);
  const [votesPerCandidate, setVotesPerCandidate] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Determine table name (try "profile" first, fallback to "profiles")
        let tableName = "profile";
        let testQuery = await supabase.from(tableName).select("id", { count: "exact", head: true });
        if (testQuery.error && testQuery.error.message.includes("relation") && testQuery.error.message.includes("does not exist")) {
          tableName = "profiles";
          const checkAgain = await supabase.from(tableName).select("id", { count: "exact", head: true });
          if (checkAgain.error) throw new Error("Neither 'profile' nor 'profiles' table found.");
        }

        // Total users
        const { count: userCount, error: userErr } = await supabase
          .from(tableName)
          .select("*", { count: "exact", head: true });
        if (userErr) throw userErr;

        // Vote transactions
        const { data: voteTx, error: voteError } = await supabase
          .from("transactions")
          .select("amount, type, user_id, created_at, candidate_id")
          .eq("type", "vote");
        if (voteError) throw voteError;

        // All transactions (revenue)
        const { data: allTx, error: txErr } = await supabase
          .from("transactions")
          .select("amount, created_at");
        if (txErr) throw txErr;

        // Get all profiles (candidates will be determined if role column exists)
        let candidates = [];
        try {
          const { data: profilesWithRole, error: roleError } = await supabase
            .from(tableName)
            .select("id, full_name, gender, role");
          
          if (!roleError && profilesWithRole) {
            candidates = profilesWithRole.filter(p => p.role === "candidate");
          } else {
            const { data: allProfiles } = await supabase
              .from(tableName)
              .select("id, full_name, gender");
            if (allProfiles) candidates = allProfiles;
          }
        } catch (err) {
          console.warn("Could not fetch role column, fetching all profiles");
          const { data: allProfiles } = await supabase
            .from(tableName)
            .select("id, full_name, gender");
          if (allProfiles) candidates = allProfiles;
        }

        const buildStats = async (candidatesList) => {
          // Top voters
          const voteCountByUser = {};
          voteTx.forEach(tx => {
            if (tx.user_id) voteCountByUser[tx.user_id] = (voteCountByUser[tx.user_id] || 0) + 1;
          });
          const sortedTopVoters = Object.entries(voteCountByUser)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([user_id, votes]) => ({ user_id, votes }));
          
          let topVoterProfiles = [];
          if (sortedTopVoters.length) {
            const { data: votersData } = await supabase
              .from(tableName)
              .select("id, full_name, email")
              .in("id", sortedTopVoters.map(v => v.user_id));
            topVoterProfiles = sortedTopVoters.map(v => ({
              ...votersData?.find(u => u.id === v.user_id),
              votes: v.votes
            }));
          }

          // Votes per candidate
          const candidateVotes = {};
          voteTx.forEach(tx => {
            if (tx.candidate_id) candidateVotes[tx.candidate_id] = (candidateVotes[tx.candidate_id] || 0) + 1;
          });
          const votesPerCandidateData = candidatesList.map(c => ({
            name: c.full_name,
            votes: candidateVotes[c.id] || 0,
          }));

          // Daily revenue
          const revenueByDay = {};
          allTx.forEach(tx => {
            const date = new Date(tx.created_at).toLocaleDateString();
            revenueByDay[date] = (revenueByDay[date] || 0) + tx.amount;
          });
          const dailyRevenueData = Object.entries(revenueByDay).map(([date, amount]) => ({ date, amount }));

          // Gender distribution
          const genderDist = {};
          candidatesList.forEach(c => {
            if (c.gender) {
              const gender = c.gender.toLowerCase();
              genderDist[gender] = (genderDist[gender] || 0) + 1;
            }
          });
          const genderDistributionData = Object.entries(genderDist).map(([name, value]) => ({ name, value }));

          setStats({
            users: userCount || 0,
            votes: voteTx.length,
            revenue: allTx.reduce((sum, t) => sum + t.amount, 0),
            genderDistribution: genderDistributionData,
          });
          setTopVoters(topVoterProfiles);
          setVotesPerCandidate(votesPerCandidateData);
          setDailyRevenue(dailyRevenueData);
          setLoading(false);
        };

        await buildStats(candidates);
      } catch (err) {
        console.error("Stats error:", err);
        setNotFound(true);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-orange-500">404</h1>
          <p className="text-lg text-white/60 mt-2">Data not found.</p>
        </div>
      </div>
    );
  }

  // Mobile-friendly tab scrolling wrapper
  const tabs = [
    { id: "dashboard", label: "Dashboard", component: null },
    { id: "profiles", label: "Profiles", component: <ProfileManagement /> },
    { id: "candidates", label: "Candidates", component: <CandidateManagement /> },
    { id: "news", label: "News", component: <NewsManagement /> },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6 space-y-6">
          {/* Horizontal scrollable tabs (app-style) */}
          <div className="overflow-x-auto scrollbar-hide pb-2">
            <div className="flex gap-2 border-b border-white/10 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`px-4 py-2 rounded-t-lg font-medium transition-all whitespace-nowrap ${
                    activeView === tab.id
                      ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content area */}
          {activeView === "dashboard" ? (
            <>
              <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
              {loading ? (
                <div className="text-center text-white/60 py-10">Loading dashboard...</div>
              ) : (
                <>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                      <p className="text-sm text-white/60">Total Users</p>
                      <h3 className="text-3xl font-bold text-orange-400">{stats.users}</h3>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                      <p className="text-sm text-white/60">Total Votes</p>
                      <h3 className="text-3xl font-bold text-orange-400">{stats.votes}</h3>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                      <p className="text-sm text-white/60">Revenue (₦)</p>
                      <h3 className="text-3xl font-bold text-yellow-400">
                        ₦{stats.revenue.toLocaleString()}
                      </h3>
                    </div>
                  </div>

                  {/* Top Voters */}
                  {topVoters.length > 0 && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-4">Top Voters</h4>
                      <ul className="space-y-2">
                        {topVoters.map((voter) => (
                          <li key={voter.id} className="flex justify-between text-white/80">
                            <span>{voter.full_name || voter.email}</span>
                            <span className="font-bold text-orange-400">{voter.votes} votes</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Votes Per Candidate */}
                  {votesPerCandidate.length > 0 && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-4">Votes Per Candidate</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={votesPerCandidate}>
                          <XAxis dataKey="name" stroke="#fff" tick={{ fill: "#ccc" }} />
                          <YAxis stroke="#ccc" />
                          <Tooltip contentStyle={{ backgroundColor: "#1f1f2e", border: "none", borderRadius: "8px" }} />
                          <Line type="monotone" dataKey="votes" stroke="#ea580c" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Daily Revenue */}
                  {dailyRevenue.length > 0 && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-4">Daily Revenue (₦)</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyRevenue}>
                          <XAxis dataKey="date" stroke="#fff" tick={{ fill: "#ccc" }} />
                          <YAxis stroke="#ccc" />
                          <Tooltip contentStyle={{ backgroundColor: "#1f1f2e", border: "none", borderRadius: "8px" }} />
                          <Line type="monotone" dataKey="amount" stroke="#fbbf24" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Gender Distribution */}
                  {stats.genderDistribution.length > 0 && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h4 className="text-lg font-semibold text-white mb-4">Candidates by Gender</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={stats.genderDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                          >
                            {stats.genderDistribution.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                          <Legend wrapperStyle={{ color: "#fff" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            // Render the selected management component (Profiles, Candidates, News)
            <div className="bg-black/40 rounded-xl p-4 sm:p-6 border border-white/10">
              {tabs.find(t => t.id === activeView)?.component}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminDashboard);