import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Shield, Cookie, Eye, Database, Globe, Clock, AlertCircle, CheckCircle, Lock, Smartphone, Users, Server, FileText, Vote, Wallet, User, EyeOff, Heart, TrendingUp } from "lucide-react";

export default function Policy() {
  const [activeTab, setActiveTab] = useState("privacy");
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const tabs = [
    { id: "privacy", label: "Privacy Policy", icon: Shield },
    { id: "cookies", label: "Cookie Policy", icon: Cookie },
    { id: "data", label: "Data Collection", icon: Database },
  ];

  return (
    <>
      <Head>
        <title>Privacy & Policy – Lovemate Show</title>
        <meta name="description" content="Privacy policy, cookie policy, and data collection practices for Lovemate Show - Your privacy matters to us." />
      </Head>

      <Header />
      
      <main className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-block px-4 py-1 bg-pink-600 text-white text-sm font-semibold rounded-full mb-4">
              YOUR PRIVACY MATTERS
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Privacy & <span className="text-pink-400">Policy</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-rose-500 mx-auto mb-6"></div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              How we collect, use, and protect your information
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Last Updated: February 2026
            </p>
          </div>

          {/* User Types Overview Banner */}
          <div className="mb-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-white font-bold text-center mb-4 flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-pink-400" />
              This Policy Applies To:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-xl p-3">
                <User className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">Registered Users</p>
                <p className="text-gray-400 text-xs">Fans, Supporters, Voters, Wallet Funders</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <EyeOff className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">Anonymous Visitors</p>
                <p className="text-gray-400 text-xs">Unregistered voters & browsers</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">Contestant Applicants</p>
                <p className="text-gray-400 text-xs">Candidates on the show</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-12">
              {/* Privacy Policy Tab */}
              {activeTab === "privacy" && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-100">
                    <div className="flex items-start gap-4">
                      <Shield className="w-8 h-8 text-pink-600 flex-shrink-0" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Our Commitment to Privacy</h2>
                        <p className="text-gray-700">
                          At Lovemate Show, we are committed to protecting your privacy and ensuring the security of your personal information. 
                          This policy explains how we collect, use, and safeguard your data when you interact with our platform.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Section 
                    title="1. Types of Users on Our Platform"
                    icon={Users}
                  >
                    <li><strong>Registered Users (Fans/Supporters):</strong> Individuals who create accounts using their name, email address, phone number (optional), and profile picture to vote for candidates, fund their wallets, send gifts, and engage with content. All registered users can fund their wallet and vote.</li>
                    <li><strong>Anonymous Users:</strong> Individuals who vote or browse without creating an account (limited functionality, cannot send gifts or appear on leaderboards).</li>
                    <li><strong>Contestant Applicants:</strong> Users who apply to become candidates on the show (requires full registration and additional information).</li>
                  </Section>

                  <Section 
                    title="2. Information We Collect"
                    icon={Database}
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-800 mb-2">For Registered Users (Fans/Supporters):</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>First name and/or nickname (visible to other users)</li>
                        <li>Email address (required, kept confidential)</li>
                        <li>Phone number (optional, kept confidential)</li>
                        <li>Profile picture (visible to other users, may appear in top fan section)</li>
                        <li>Account creation date and last active timestamp</li>
                        <li>Wallet balance and transaction history (private)</li>
                        <li>Voting history (which candidates you supported)</li>
                        <li>Gift purchases and send history</li>
                        <li>Points earned and ranking on fan leaderboards (name and profile photo visible)</li>
                      </ul>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-800 mb-2">For Contestant Applicants (Candidates):</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>All information collected for registered users plus:</li>
                        <li>Government-issued ID for age and identity verification (confidential)</li>
                        <li>Contact information (phone, email – confidential)</li>
                        <li>Gallery photos, "About You" biography (public on candidate profile)</li>
                        <li>Vote count and gift card total (public on candidate profile)</li>
                        <li>Bank account details for prize payouts (confidential)</li>
                        <li>Any other documentation required for participation (confidential)</li>
                      </ul>
                      <p className="mt-2 text-sm text-gray-600">Note: On your public candidate profile, only your nickname, profile photo, gallery photos, "About You" description, vote count, and gift card total are shown. All other personal information remains confidential.</p>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-800 mb-2">For Anonymous Users:</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>IP address and device information</li>
                        <li>Voting choices (without personal identification)</li>
                        <li>Browser type and browsing behavior</li>
                        <li>Approximate geographic location (city/country level)</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Technical Data (All Users):</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>IP address and device information</li>
                        <li>Browser type and version</li>
                        <li>Pages visited and time spent on site</li>
                        <li>Referring websites and exit pages</li>
                      </ul>
                    </div>
                  </Section>

                  <Section 
                    title="3. How We Use Your Information"
                    icon={Eye}
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-800 mb-2">For Registered Users (Fans/Supporters):</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Create and manage your user account</li>
                        <li>Display your name and profile picture on fan leaderboards (top fans)</li>
                        <li>Track your voting activity and points earned</li>
                        <li>Send important updates about voting periods and show events</li>
                        <li>Notify you when candidates you support are at risk of eviction</li>
                        <li>Process wallet transactions, vote purchases, and gift sending</li>
                      </ul>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-800 mb-2">For Voting & Engagement:</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Record and count votes to determine candidate rankings</li>
                        <li>Prevent vote manipulation and ensure fair voting</li>
                        <li>Calculate points for fan leaderboards</li>
                        <li>Track which candidates receive the most support</li>
                        <li>Enable vote gifting and sharing features</li>
                        <li>Determine eviction outcomes based on audience votes</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">For Anonymous Users:</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Allow participation in voting without account creation</li>
                        <li>Analyze voting patterns and site usage</li>
                        <li>Detect and prevent bot voting or manipulation</li>
                        <li>Improve user experience based on behavior</li>
                      </ul>
                    </div>
                  </Section>

                  <Section 
                    title="4. What Information Is Visible to Other Users"
                    icon={Eye}
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-800 mb-2">For Registered Users (Fans/Supporters):</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><span className="font-semibold">Visible:</span> First name/nickname, profile photo (may appear in top fan section of the portal).</li>
                        <li><span className="font-semibold">Not Visible:</span> Email address, phone number, wallet balance, transaction history, voting choices (kept confidential).</li>
                      </ul>
                    </div>
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-800 mb-2">For Candidates (Contestants):</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><span className="font-semibold">Visible on Public Profile:</span> Nickname, profile photo, gallery photos, "About You" description, vote count, gift card total.</li>
                        <li><span className="font-semibold">Not Visible (Confidential):</span> Real name (unless chosen as nickname), email address, phone number, government ID, bank account details, any other confidential documents.</li>
                      </ul>
                    </div>
                  </Section>

                  <Section 
                    title="5. Voting & Wallet Transparency"
                    icon={Vote}
                  >
                    <li><strong>Vote Counting:</strong> All votes are recorded on the blockchain or secure database for transparency and auditability</li>
                    <li><strong>Public Leaderboards:</strong> Top fans' names and profile pictures (if provided) are displayed publicly based on points earned</li>
                    <li><strong>Candidate Rankings:</strong> Real-time vote counts are displayed to show which candidates are leading or at risk of eviction</li>
                    <li><strong>Anonymous Voting:</strong> Users who vote without an account have their votes counted but their identities remain private</li>
                    <li><strong>Wallet Transactions:</strong> Your transaction history is private but may be audited for fraud prevention</li>
                    <li><strong>Gift Tracking:</strong> Gifts sent to candidates are tracked and displayed publicly on candidate profiles</li>
                    <li>Half of accumulated gifts are awarded to candidates at season end, half retained by producers per Terms of Participation</li>
                  </Section>

                  <Section 
                    title="6. Information Sharing & Disclosure"
                    icon={Users}
                  >
                    <li><strong>Public Information:</strong> Fan names, profile pictures, and points are displayed on leaderboards</li>
                    <li><strong>Candidate Public Profile:</strong> Nickname, photos, bio, vote count, gift total are public</li>
                    <li><strong>Voting Results:</strong> Aggregate voting data is shared publicly to show candidate popularity</li>
                    <li><strong>Service Providers:</strong> Payment processors (Stripe, Paystack, etc.) receive necessary payment information</li>
                    <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                    <li><strong>Fraud Prevention:</strong> Suspicious voting patterns may be investigated with relevant authorities</li>
                    <li className="text-pink-600 font-semibold">We NEVER sell your personal information to third parties for marketing purposes</li>
                    <li className="text-pink-600 font-semibold">Anonymous voters' identities are never revealed unless required by law</li>
                  </Section>

                  <Section 
                    title="7. Data Security"
                    icon={Lock}
                  >
                    <li>Industry-standard encryption for data transmission (SSL/TLS)</li>
                    <li>Secure storage with Supabase and Row Level Security policies</li>
                    <li>Wallet transactions protected with bank-grade security</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Access controls restricting internal data access</li>
                    <li>Automatic logout for inactive sessions</li>
                    <li>Vote manipulation detection systems to ensure fair play</li>
                    <li>While we implement strong security measures, no internet transmission is 100% secure</li>
                    <li className="font-semibold">Your sensitive information (email, phone number, wallet details) is never exposed to other users – only your first name and profile photo may appear publicly.</li>
                  </Section>

                  <Section 
                    title="8. Your Rights as a User"
                    icon={CheckCircle}
                  >
                    <li><strong>Access:</strong> Request a copy of your personal data and voting history</li>
                    <li><strong>Correction:</strong> Update your name, email, phone number, or profile picture</li>
                    <li><strong>Deletion:</strong> Request deletion of your account and associated data (voting records may be anonymized for audit purposes)</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from newsletters and promotional emails</li>
                    <li><strong>Data Portability:</strong> Receive your voting and transaction data in a structured format</li>
                    <li><strong>Vote Privacy:</strong> Request anonymity for your voting activity (if registered)</li>
                    <li><strong>Wallet Closure:</strong> Request wallet closure and remaining fund withdrawal (subject to minimum amounts)</li>
                    <li>Contact us at <span className="text-pink-600 font-semibold">lovemateshow@gmail.com</span> to exercise your rights</li>
                  </Section>

                  <Section 
                    title="9. Data Retention"
                    icon={Clock}
                  >
                    <li><strong>Registered Users:</strong> Data retained while your account is active; 12 months after account deletion for audit purposes</li>
                    <li><strong>Voting Records:</strong> Retained for the duration of the show season plus 12 months for audit and fraud prevention</li>
                    <li><strong>Wallet Transactions:</strong> Retained for 7 years for financial audit compliance</li>
                    <li><strong>Anonymous Votes:</strong> Retained as aggregate data (personally identifiable information removed after 30 days)</li>
                    <li><strong>Leaderboard Data:</strong> Archived after each season for historical records</li>
                    <li><strong>Legal Requirements:</strong> Some data retained longer as required by law</li>
                  </Section>

                  <Section 
                    title="10. Anonymous Voting"
                    icon={EyeOff}
                  >
                    <li>You can vote for your favorite candidates without creating an account</li>
                    <li>Anonymous votes are counted equally alongside registered user votes</li>
                    <li>IP addresses are temporarily logged to prevent vote manipulation</li>
                    <li>Anonymous voting data is anonymized after 30 days</li>
                    <li>You will not appear on fan leaderboards as an anonymous voter</li>
                    <li>Anonymous voters cannot earn points or qualify as "Top Fans"</li>
                    <li>You cannot send gifts to candidates without an account</li>
                    <li>Anonymous votes cannot be tracked or retrieved after voting</li>
                  </Section>

                  <Section 
                    title="11. Children's Privacy"
                    icon={AlertCircle}
                  >
                    <li>Lovemate Show is strictly for individuals 18 years and older</li>
                    <li>We do not knowingly collect information from minors</li>
                    <li>Age verification is required for account creation</li>
                    <li>Anonymous voting does not require age verification, but we assume users are 18+</li>
                    <li>If we discover data from a minor, we will delete it immediately</li>
                  </Section>

                  <Section 
                    title="12. International Data Transfers"
                    icon={Globe}
                  >
                    <li>Your data may be processed in Nigeria and other countries where we operate</li>
                    <li>We ensure appropriate safeguards for international data transfers</li>
                    <li>By using our platform, you consent to international data processing</li>
                    <li>Vote data may be processed globally for real-time counting</li>
                  </Section>

                  <Section 
                    title="13. Updates to This Policy"
                    icon={FileText}
                  >
                    <li>We may update this privacy policy periodically</li>
                    <li>Material changes will be notified via email or website notice</li>
                    <li>Continued use after changes constitutes acceptance of new terms</li>
                    <li>Check the "Last Updated" date at the top of this page</li>
                  </Section>

                  <Section 
                    title="14. Contact Information"
                    icon={Smartphone}
                  >
                    <li><strong>All Inquiries:</strong> lovemateshow@gmail.com</li>
                    <li><strong>Address:</strong> Lagos, Nigeria</li>
                    <li><strong>Response Time:</strong> We aim to respond within 5-7 business days</li>
                  </Section>

                  {/* Quick Reference Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mt-4">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-600" />
                      Quick Reference for Voters & Fans
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">✅ What's Public:</p>
                        <ul className="text-gray-600 space-y-1 ml-4 list-disc">
                          <li>Your first name/nickname (if registered)</li>
                          <li>Profile picture (if uploaded)</li>
                          <li>Points earned on leaderboards</li>
                          <li>Votes cast (aggregate, not individual choices)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">🔒 What's Private:</p>
                        <ul className="text-gray-600 space-y-1 ml-4 list-disc">
                          <li>Your email address and phone number</li>
                          <li>Wallet balance and transaction details</li>
                          <li>Individual voting choices</li>
                          <li>Anonymous voter identities</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cookie Policy Tab */}
              {activeTab === "cookies" && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-start gap-4">
                      <Cookie className="w-8 h-8 text-blue-600 flex-shrink-0" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">How We Use Cookies</h2>
                        <p className="text-gray-700">
                          Cookies help us provide, protect, and improve your experience on Lovemate Show. 
                          This policy explains what cookies are and how we use them.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Section 
                    title="What Are Cookies?"
                    icon={Cookie}
                  >
                    <li>Cookies are small text files stored on your device when you visit websites</li>
                    <li>They help websites remember your preferences and actions</li>
                    <li>Cookies cannot access files on your computer or transmit viruses</li>
                    <li>You can control or disable cookies through your browser settings</li>
                  </Section>

                  <Section 
                    title="Types of Cookies We Use"
                    icon={Database}
                  >
                    <li><strong>Essential Cookies:</strong> Required for basic site functionality (login, voting, wallet access, form submissions)</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences (voting reminders, favorite candidates)</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site (Google Analytics)</li>
                    <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                    <li><strong>Persistent Cookies:</strong> Remain on your device until they expire or you delete them</li>
                    <li><strong>Authentication Cookies:</strong> Keep you logged in to your account</li>
                  </Section>

                  <Section 
                    title="Third-Party Cookies"
                    icon={Server}
                  >
                    <li><strong>Supabase:</strong> Authentication and database services</li>
                    <li><strong>Google Analytics:</strong> Site traffic and usage analysis</li>
                    <li><strong>Payment Processors:</strong> Secure payment processing for wallet funding</li>
                    <li><strong>YouTube:</strong> Video embeds and playback preferences</li>
                    <li><strong>Social Media:</strong> Share buttons from Instagram, Twitter, Facebook, TikTok</li>
                    <li>These third parties have their own cookie and privacy policies</li>
                  </Section>

                  <Section 
                    title="Managing Cookies"
                    icon={Settings}
                  >
                    <li>Most browsers accept cookies by default</li>
                    <li>You can modify browser settings to block or delete cookies</li>
                    <li><strong>Chrome:</strong> Settings → Privacy & Security → Cookies</li>
                    <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                    <li><strong>Edge:</strong> Settings → Site Permissions → Cookies</li>
                    <li>Disabling cookies may affect site functionality (login, voting, wallet access)</li>
                  </Section>

                  <Section 
                    title="Cookie Duration"
                    icon={Clock}
                  >
                    <li><strong>Session Cookies:</strong> Last until you close your browser</li>
                    <li><strong>Persistent Cookies:</strong> 30 days to 2 years depending on type</li>
                    <li><strong>Authentication Cookies:</strong> 7 days (remember me option extends to 30 days)</li>
                    <li><strong>Preference Cookies:</strong> 12 months</li>
                    <li><strong>Voting Session Cookies:</strong> 24 hours to prevent double voting</li>
                  </Section>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      Your Consent
                    </h3>
                    <p className="text-gray-700 mb-2">
                      By continuing to use our website, you consent to our use of cookies as described in this policy.
                    </p>
                    <p className="text-gray-700">
                      You can withdraw consent at any time by clearing cookies in your browser settings, adjusting your cookie preferences, or requesting account deletion.
                    </p>
                  </div>
                </div>
              )}

              {/* Data Collection Tab */}
              {activeTab === "data" && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                    <div className="flex items-start gap-4">
                      <Database className="w-8 h-8 text-green-600 flex-shrink-0" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">How We Collect & Process Data</h2>
                        <p className="text-gray-700">
                          Transparency about data collection helps you make informed decisions about using our platform.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Section 
                    title="Data Collection Methods"
                    icon={Database}
                  >
                    <li><strong>Direct Collection:</strong> Information you provide in registration forms, profile setup, and wallet funding</li>
                    <li><strong>Voting Activity:</strong> Automatic collection of vote choices, timestamps, and candidate preferences</li>
                    <li><strong>Transaction Data:</strong> Payment information, wallet balances, and gift purchases</li>
                    <li><strong>Automatic Collection:</strong> IP addresses, device information, browser type, and site usage through analytics</li>
                    <li><strong>Anonymous Tracking:</strong> Vote patterns without personal identification</li>
                    <li><strong>Third-Party Sources:</strong> Payment verification from processors</li>
                  </Section>

                  <Section 
                    title="Lawful Basis for Processing"
                    icon={CheckCircle}
                  >
                    <li><strong>Contract Performance:</strong> Processing votes, managing wallets, and providing voting services</li>
                    <li><strong>Legitimate Interests:</strong> Preventing vote manipulation, fraud detection, and analytics</li>
                    <li><strong>Consent:</strong> By accepting our Terms of Participation and Privacy Policy during sign-up, you grant us consent to process your data as described. For anonymous users, continued use constitutes consent.</li>
                    <li><strong>Legal Obligations:</strong> Financial transaction records and compliance with election/voting laws</li>
                  </Section>

                  <Section 
                    title="Data Processing for Voting Integrity"
                    icon={TrendingUp}
                  >
                    <li>Real-time vote counting and candidate ranking</li>
                    <li>Fraud detection algorithms to identify suspicious voting patterns</li>
                    <li>IP-based restrictions to prevent automated bot voting</li>
                    <li>Rate limiting to ensure fair voting practices</li>
                    <li>Audit trails for all vote transactions</li>
                    <li>Anonymous vote aggregation for public leaderboards</li>
                  </Section>

                  <Section 
                    title="Wallet & Payment Processing"
                    icon={Wallet}
                  >
                    <li>Secure payment gateway integration (Stripe, Paystack, etc.)</li>
                    <li>Encrypted storage of wallet balances and transaction history</li>
                    <li>No storage of full credit card details on our servers</li>
                    <li>Transaction records retained for 7 years for audit compliance</li>
                    <li>Automated fraud detection for suspicious transactions</li>
                    <li>Refund processing capability within platform guidelines</li>
                  </Section>

                  <Section 
                    title="Data Processing Locations"
                    icon={Globe}
                  >
                    <li>Primary data storage: Supabase (cloud infrastructure)</li>
                    <li>Backup locations: Redundant servers for disaster recovery</li>
                    <li>Analytics processing: Google Analytics (global infrastructure)</li>
                    <li>Payment processing: Regional payment gateways</li>
                    <li>All processing complies with applicable data protection laws</li>
                  </Section>

                  <Section 
                    title="Automated Decision Making"
                    icon={Server}
                  >
                    <li>Vote counting and candidate rankings are fully automated</li>
                    <li>Fraud detection algorithms may flag suspicious voting activity</li>
                    <li>Wallet transactions are automatically processed based on rules</li>
                    <li>Leaderboard calculations are automated and real-time</li>
                    <li>You can request human review of automated decisions affecting you</li>
                  </Section>

                  <Section 
                    title="Data Breach Procedures"
                    icon={AlertCircle}
                  >
                    <li>Immediate investigation of suspected breaches</li>
                    <li>Notification to affected users within 72 hours when required</li>
                    <li>Cooperation with regulatory authorities as needed</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Incident response team on standby</li>
                    <li>Wallet transaction freeze in case of suspected breach</li>
                  </Section>

                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                    <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Your Data Rights Summary
                    </h3>
                    <p className="text-amber-700 mb-3">
                      As a user (registered or anonymous), you have the right to:
                    </p>
                    <ul className="space-y-1 text-amber-700 ml-6">
                      <li>• Access your personal data and voting history</li>
                      <li>• Correct inaccurate account information</li>
                      <li>• Delete your account and associated data</li>
                      <li>• Object to processing of your data</li>
                      <li>• Data portability for your voting records</li>
                      <li>• Withdraw consent for marketing communications</li>
                      <li>• Request anonymity for your voting activity</li>
                    </ul>
                    <p className="text-amber-700 mt-3">
                      To exercise these rights, contact: <strong className="text-amber-800">lovemateshow@gmail.com</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 mt-8 border-t border-gray-200">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-pink-600 transition-colors flex items-center gap-2"
                >
                  ← Back to Home
                </Link>
                <Link
                  href="/terms"
                  className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  View Terms of Participation
                </Link>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center text-gray-300">
            <p className="mb-2">Have questions about our privacy practices or voting data?</p>
            <p>Contact us at <span className="text-pink-400 font-semibold">lovemateshow@gmail.com</span></p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// Reusable Section Component
function Section({ title, icon: Icon, children }) {
  return (
    <div className="border-b border-gray-200 pb-6 last:border-0">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
        <Icon className="w-6 h-6 text-pink-600" />
        <span>{title}</span>
      </h2>
      <div className="text-gray-700 ml-10">
        {children}
      </div>
    </div>
  );
}

// Settings icon component
function Settings(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}