// pages/directors/index.js
import { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { supabase } from "@/utils/supabaseClient";
import Header from "../../components/Header";
import DirectorAuthGuard from "../../components/directors/DirectorAuthGuard";
import DirectorsLayout from "../../components/directors/DirectorsLayout";
import WelcomePopup from "../../components/directors/WelcomePopup";
import StatsCards from "../../components/directors/StatsCards";
import TopFansSection from "../../components/directors/TopFansSection";
import TopCandidatesSection from "../../components/directors/TopCandidatesSection";
import CandidatesTable from "../../components/directors/CandidatesTable";
import FansTable from "../../components/directors/FansTable";
import AnalyticsCharts from "../../components/directors/AnalyticsCharts";
import TransactionsView from "../../components/directors/TransactionsView";

// Animation variants
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DirectorsDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Data states
  const [profiles, setProfiles] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voteTransactions, setVoteTransactions] = useState([]);
  const [giftTransactions, setGiftTransactions] = useState([]);
  const [topFans, setTopFans] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [voteAnalytics, setVoteAnalytics] = useState({});
  const [stats, setStats] = useState({
    totalProfiles: 0,
    totalCandidates: 0,
    totalVotes: 0,
    totalVoteWorth: 0,
    totalGifts: 0,
    totalGiftWorth: 0,
    totalRevenue: 0,
    approvedCandidates: 0,
    pendingCandidates: 0
  });

  const checkWeeklyPopup = (userId) => {
    const lastPopup = localStorage.getItem(`director_welcome_${userId}`);
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    if (!lastPopup || parseInt(lastPopup) < oneWeekAgo) {
      setShowWelcomePopup(true);
      localStorage.setItem(`director_welcome_${userId}`, Date.now().toString());
    }
  };

  const handleAccessGranted = async (authUser) => {
    setUser(authUser);
    await fetchDashboardData(authUser.id);
    checkWeeklyPopup(authUser.id);
  };

  // Set up real-time subscriptions separately after user is set
  useEffect(() => {
    if (!user?.id) return;

    const subscriptions = [];

    // Subscribe to vote_transactions changes
    const voteSubscription = supabase
      .channel('vote_transactions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vote_transactions' },
        async () => {
          console.log('Vote transaction changed, refreshing...');
          await fetchDashboardData(user.id);
        }
      )
      .subscribe();
    subscriptions.push(voteSubscription);

    // Subscribe to gift_transactions changes
    const giftSubscription = supabase
      .channel('gift_transactions_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'gift_transactions' },
        async () => {
          console.log('Gift transaction changed, refreshing...');
          await fetchDashboardData(user.id);
        }
      )
      .subscribe();
    subscriptions.push(giftSubscription);

    // Subscribe to profile changes
    const profileSubscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profile' },
        async () => {
          console.log('Profile changed, refreshing...');
          await fetchDashboardData(user.id);
        }
      )
      .subscribe();
    subscriptions.push(profileSubscription);

    // Cleanup subscriptions on unmount
    return () => {
      subscriptions.forEach(sub => supabase.removeChannel(sub));
    };
  }, [user?.id]); // Only re-run when user.id changes

  const fetchDashboardData = async (userId) => {
    try {
      console.log('Fetching dashboard data for user:', userId);
      
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profile")
        .select("*")
        .order("points", { ascending: false });

      if (profilesError) console.error('Profiles error:', profilesError);

      // Fetch all candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from("candidates")
        .select("*")
        .order("votes", { ascending: false });

      if (candidatesError) console.error('Candidates error:', candidatesError);

      // Fetch vote transactions with profile data
      const { data: votesData, error: votesError } = await supabase
        .from("vote_transactions")
        .select(`
          *,
          profile:user_id (
            id,
            full_name,
            photo_url
          )
        `)
        .order("created_at", { ascending: false });

      if (votesError) console.error('Votes error:', votesError);
      console.log('Vote transactions fetched:', votesData?.length || 0);

      // Fetch gift transactions with profile data
      const { data: giftsData, error: giftsError } = await supabase
        .from("gift_transactions")
        .select(`
          *,
          profile:user_id (
            id,
            full_name,
            photo_url
          )
        `)
        .order("created_at", { ascending: false });

      if (giftsError) console.error('Gifts error:', giftsError);
      console.log('Gift transactions fetched:', giftsData?.length || 0);

      // Fetch user profile
      const { data: userProfile, error: userError } = await supabase
        .from("profile")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) console.error('User profile error:', userError);

      setProfile(userProfile);
      setProfiles(profilesData || []);
      setCandidates(candidatesData || []);
      setVoteTransactions(votesData || []);
      setGiftTransactions(giftsData || []);

      // Calculate stats
      calculateStats(profilesData, candidatesData, votesData, giftsData);
      
      // Calculate top fans
      calculateTopFans(profilesData);
      
      // Calculate top candidates
      calculateTopCandidates(candidatesData);
      
      // Calculate analytics
      calculateAnalytics(votesData, giftsData);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const calculateStats = (profiles, candidates, votes, gifts) => {
    const totalVoteWorth = votes?.reduce((sum, v) => sum + (v.total_amount || 0), 0) || 0;
    const totalGiftWorth = gifts?.reduce((sum, g) => sum + (g.amount || 0), 0) || 0;
    const totalVotes = votes?.reduce((sum, v) => sum + (v.votes || 0), 0) || 0;
    const totalGifts = gifts?.length || 0;
    
    const approvedCandidates = candidates?.filter(c => c.role === "Yes").length || 0;
    const pendingCandidates = candidates?.filter(c => c.role !== "Yes").length || 0;

    setStats({
      totalProfiles: profiles?.length || 0,
      totalCandidates: candidates?.length || 0,
      totalVotes,
      totalVoteWorth,
      totalGifts,
      totalGiftWorth,
      totalRevenue: totalVoteWorth + totalGiftWorth,
      approvedCandidates,
      pendingCandidates
    });
  };

  const calculateTopFans = (profiles) => {
    const fans = profiles?.map(p => ({
      id: p.id,
      name: p.full_name,
      photo: p.photo_url,
      points: p.points || 0,
      favorites: p.favorite || []
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 3);
    
    setTopFans(fans);
  };

  const calculateTopCandidates = (candidates) => {
    const top = candidates?.map(c => ({
      ...c,
      shortId: c.id.substring(0, 8)
    }))
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, 10);
    
    setTopCandidates(top);
  };

  const calculateAnalytics = (votes, gifts) => {
    if (!votes || votes.length === 0) {
      setVoteAnalytics({});
      return;
    }

    // Group votes by date
    const votesByDate = {};
    votes.forEach(v => {
      const date = new Date(v.created_at).toLocaleDateString();
      if (!votesByDate[date]) {
        votesByDate[date] = {
          count: 0,
          worth: 0,
          transactions: 0
        };
      }
      votesByDate[date].count += v.votes || 0;
      votesByDate[date].worth += v.total_amount || 0;
      votesByDate[date].transactions += 1;
    });

    console.log('Analytics calculated:', votesByDate);
    setVoteAnalytics(votesByDate);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(`director_code_${user?.id}`);
  };

  // Log data for debugging
  useEffect(() => {
    console.log('Active tab:', activeTab);
    console.log('Vote transactions count:', voteTransactions.length);
    console.log('Gift transactions count:', giftTransactions.length);
    console.log('Vote analytics:', voteAnalytics);
  }, [activeTab, voteTransactions, giftTransactions, voteAnalytics]);

  return (
    <>
      <Head>
        <title>Director's Dashboard - Lovemate Show</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Header />

      <DirectorAuthGuard onAccessGranted={handleAccessGranted}>
        <WelcomePopup 
          isOpen={showWelcomePopup}
          onClose={() => setShowWelcomePopup(false)}
          userName={profile?.full_name}
        />

        <DirectorsLayout
          profile={profile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
        >
          <motion.div
            key={activeTab}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 pb-24 md:pb-6"
          >
            {activeTab === "overview" && (
              <>
                <StatsCards stats={stats} />
                <TopFansSection fans={topFans} />
                <TopCandidatesSection 
                  candidates={topCandidates} 
                  isMobileGrid={true}
                />
              </>
            )}

            {activeTab === "candidates" && (
              <CandidatesTable candidates={candidates} />
            )}

            {activeTab === "fans" && (
              <FansTable profiles={profiles} candidates={candidates} />
            )}

            {activeTab === "transactions" && (
              <TransactionsView 
                voteTransactions={voteTransactions}
                giftTransactions={giftTransactions}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsCharts 
                voteTransactions={voteTransactions}
                giftTransactions={giftTransactions}
                candidates={candidates}
                profiles={profiles}
              />
            )}
          </motion.div>
        </DirectorsLayout>
      </DirectorAuthGuard>
    </>
  );
}