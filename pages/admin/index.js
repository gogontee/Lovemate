import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import withAdminAuth from "@/components/withAdminAuth";
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

const COLORS = ["#e11d48", "#fbbf24"];

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    votes: 0,
    revenue: 0,
    votesPerDay: [],
    genderDistribution: [],
  });
  const [topVoters, setTopVoters] = useState([]);
  const [votesPerCandidate, setVotesPerCandidate] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      // users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

        const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchStats = async () => {
    try {
      // all your logic here...
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchStats();
}, []);


      // vote transactions
      const { data: voteTx, error: voteError } = await supabase
        .from("transactions")
        .select("amount, type, user_id, created_at, candidate_id")
        .eq("type", "vote");

      if (voteError) {
  console.error("Error fetching vote transactions:", voteError.message);
  setNotFound(true);
  return;
}

      // total revenue
      const { data: allTx } = await supabase
        .from("transactions")
        .select("amount, created_at");

      // candidates
      const { data: candidates, error: candidateError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "candidate");

      if (candidateError) {
  console.error("Error fetching candidates:", candidateError.message);
  setNotFound(true);
  return;
}

if (!candidates || candidates.length === 0) {
  console.warn("No candidates found yet.");
}

      // top voters
      const voteCountByUser = {};
      voteTx.forEach((tx) => {
        if (tx.user_id) {
          voteCountByUser[tx.user_id] = (voteCountByUser[tx.user_id] || 0) + 1;
        }
      });

      const sortedTopVoters = Object.entries(voteCountByUser)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([user_id, count]) => ({ user_id, votes: count }));

      const { data: votersData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", sortedTopVoters.map((v) => v.user_id));

      const topVoterProfiles = sortedTopVoters.map((v) => {
        const profile = votersData.find((u) => u.id === v.user_id);
        return { ...profile, votes: v.votes };
      });

      // votes per candidate
      const candidateVotes = {};
      voteTx.forEach((tx) => {
        const cid = tx.candidate_id;
        if (cid) {
          candidateVotes[cid] = (candidateVotes[cid] || 0) + 1;
        }
      });

      const votesPerCandidate = candidates.map((c) => ({
        name: c.full_name,
        votes: candidateVotes[c.id] || 0,
      }));

      // revenue per day
      const revenueByDay = {};
      allTx.forEach((tx) => {
        const date = new Date(tx.created_at).toLocaleDateString();
        revenueByDay[date] = (revenueByDay[date] || 0) + tx.amount;
      });

      const dailyRevenue = Object.entries(revenueByDay).map(([date, amount]) => ({
        date,
        amount,
      }));

      setStats({
        users: userCount || 0,
        votes: voteTx.length,
        revenue: allTx.reduce((sum, t) => sum + t.amount, 0),
        votesPerDay: [],
        genderDistribution: [],
      });

      setTopVoters(topVoterProfiles);
      setVotesPerCandidate(votesPerCandidate);
      setDailyRevenue(dailyRevenue);
    };

    fetchStats();
  }, []);

  // Handle 404 scenario
  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-center">
        <div>
          <h1 className="text-6xl font-bold text-rose-600">404</h1>
          <p className="text-lg text-gray-600 mt-2">Oops! Data not found.</p>
          <p className="text-sm text-gray-400">Please check your database or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded shadow text-center">
              <p className="text-sm text-gray-500">Total Users</p>
              <h3 className="text-3xl font-bold text-rose-600">{stats.users}</h3>
            </div>
            <div className="bg-white p-6 rounded shadow text-center">
              <p className="text-sm text-gray-500">Total Votes</p>
              <h3 className="text-3xl font-bold text-rose-600">{stats.votes}</h3>
            </div>
            <div className="bg-white p-6 rounded shadow text-center">
              <p className="text-sm text-gray-500">Revenue (₦)</p>
              <h3 className="text-3xl font-bold text-rose-600">
                ₦{stats.revenue.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Top Voters */}
          <div className="bg-white p-6 rounded shadow">
            <h4 className="text-lg font-semibold mb-4">Top Voters</h4>
            <ul className="space-y-2 text-sm">
              {topVoters.map((voter) => (
                <li key={voter.id} className="flex justify-between">
                  <span>{voter.full_name || voter.email}</span>
                  <span className="font-bold text-rose-600">{voter.votes} votes</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Votes Per Candidate */}
          <div className="bg-white p-6 rounded shadow">
            <h4 className="text-lg font-semibold mb-4">Votes Per Candidate</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={votesPerCandidate}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="votes" stroke="#e11d48" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Revenue */}
          <div className="bg-white p-6 rounded shadow">
            <h4 className="text-lg font-semibold mb-4">Daily Revenue (₦)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenue}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white p-6 rounded shadow">
            <h4 className="text-lg font-semibold mb-4">Candidates by Gender</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.genderDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#e11d48"
                  label
                >
                  {stats.genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminDashboard);
