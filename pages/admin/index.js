import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient.js";
import AdminSidebar from "../../components/AdminSidebar.js";
import AdminHeader from "../../components/AdminHeader.js";
import withAdminAuth from "../../components/withAdminAuth.js";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#e11d48", "#fbbf24"];

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    votes: 0,
    revenue: 0,
    votesPerDay: [],
    genderDistribution: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
  // users
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // vote transactions
  const { data: voteTx } = await supabase
    .from("transactions")
    .select("amount, type, user_id, created_at, candidate_id")
    .eq("type", "vote");

  // total revenue
  const { data: allTx } = await supabase
    .from("transactions")
    .select("amount, created_at");

  // candidates
  const { data: candidates } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "candidate");

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

  // fetch voter names
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
    votesPerDay: [], // keep if you still want to chart it separately
    genderDistribution: [],
  });
  setTopVoters(topVoterProfiles);
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

  setVotesPerCandidate(votesPerCandidate);
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

  setDailyRevenue(dailyRevenue);
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
};

    fetchStats();
  }, []);

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

          {/* Line Chart - Votes per Day */}
          <div className="bg-white p-6 rounded shadow">
            <h4 className="text-lg font-semibold mb-4">Votes Per Day</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.votesPerDay}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#e11d48" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Gender Distribution */}
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
