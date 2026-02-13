import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { useEffect } from "react";

export default function TermsOfParticipation() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Head>
        <title>Terms of Participation – Lovemate Show (18+)</title>
        <meta name="description" content="Official terms and conditions for participating in Lovemate Show - Adult reality TV series. Must be 18+ to apply." />
      </Head>

      <Header />
      
      <main className="bg-gradient-to-br from-gray-900 via-gray-800 to-pink-900 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with animation */}
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-block px-4 py-1 bg-pink-600 text-white text-sm font-semibold rounded-full mb-4">
              18+ ADULT CONTENT
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of <span className="text-pink-400">Participation</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-rose-500 mx-auto mb-6"></div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Please read carefully before applying. This is a legally binding agreement between you and Lovemate Productions.
            </p>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
            {/* Age Warning Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6 text-center">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-4xl">⚠️</span>
                <span className="text-2xl font-bold">YOU MUST BE 18 YEARS OR OLDER TO PARTICIPATE</span>
                <span className="text-4xl">⚠️</span>
              </div>
              <p className="text-red-100 mt-2">Valid ID required upon selection. No exceptions.</p>
            </div>

            <div className="p-8 md:p-12 space-y-8">
              {/* Section 1 - Eligibility */}
              <Section 
                number="1" 
                title="Eligibility & Age Verification"
                icon="🔞"
              >
                <li>Participants must be <span className="font-bold text-pink-600">18 years of age or older</span> at the time of application</li>
                <li>Valid government-issued ID required for final selection and age verification</li>
                <li>Must be legally able to reside and travel within Nigeria for the duration of filming (4 weeks)</li>
                <li>No felony convictions or pending criminal cases that would prevent TV participation</li>
                <li>Must be single, divorced, or legally separated (no current marital commitments)</li>
                <li>Not currently in a serious, exclusive relationship that would conflict with show format</li>
              </Section>

              {/* Section 2 - Consent to Film */}
              <Section 
                number="2" 
                title="Consent to Film & Broadcast"
                icon="🎥"
              >
                <li>You grant Lovemate Productions irrevocable rights to film, record, and photograph you 24/7 during production</li>
                <li>The show contains adult content including: romantic situations, intimate conversations, and mature themes</li>
                <li>Footage may be used in perpetuity across all media platforms worldwide (broadcast, streaming, social media, promotional materials)</li>
                <li>No additional compensation beyond the agreed participant stipend for broadcast rights</li>
                <li>You waive the right to inspect or approve final content before broadcast</li>
                <li>Production may use your name, likeness, voice, and biographical information for promotional purposes</li>
              </Section>

              {/* Section 3 - Psychological Requirements */}
              <Section 
                number="3" 
                title="Psychological & Emotional Considerations"
                icon="🧠"
              >
                <li>Participants must be mentally and emotionally prepared for reality TV pressures</li>
                <li>Psychological evaluation required before final selection (at production's expense)</li>
                <li>The show involves emotional situations, potential conflict, and public scrutiny</li>
                <li>On-site psychological support available throughout filming</li>
                <li>Production may remove participants whose mental health is at risk or compromises the show</li>
                <li>You acknowledge that online harassment and media attention are possible after broadcast</li>
              </Section>

              {/* Section 4 - Confidentiality */}
              <Section 
                number="4" 
                title="Confidentiality & Non-Disclosure"
                icon="🤫"
              >
                <li>All show details, including outcomes, relationships, and production information, are strictly confidential until broadcast</li>
                <li>No social media posts about the show, other participants, or production during filming</li>
                <li>Violation of confidentiality may result in removal and legal action</li>
                <li>Comprehensive NDA must be signed upon selection</li>
                <li>You may not disclose who you voted for, who stayed, or relationship outcomes</li>
              </Section>

              {/* Section 5 - Social Media */}
              <Section 
                number="5" 
                title="Social Media & Public Conduct"
                icon="📱"
              >
                <li>Social media accounts may be monitored during production</li>
                <li>No spoilers, behind-the-scenes content, or discussion of ongoing relationships</li>
                <li>Professional conduct expected at all public appearances</li>
                <li>Lovemate Productions not responsible for online harassment or media scrutiny</li>
                <li>You may be required to participate in show promotional activities on your social channels</li>
              </Section>

              {/* Section 6 - Background Check */}
              <Section 
                number="6" 
                title="Background Verification"
                icon="🔍"
              >
                <li>All finalists consent to comprehensive background check (criminal, employment, social media)</li>
                <li>Misrepresentation in application results in immediate disqualification</li>
                <li>Previous reality TV appearances must be disclosed</li>
                <li>Production may contact provided references</li>
                <li>Social media history may be reviewed for inappropriate content</li>
              </Section>

              {/* Section 7 - Medical */}
              <Section 
                number="7" 
                title="Medical & Physical Requirements"
                icon="🏥"
              >
                <li>Activities may include physical challenges and long filming hours (12-16 hour days)</li>
                <li>You must have adequate health insurance coverage</li>
                <li>Production provides emergency medical care but not liable for pre-existing conditions</li>
                <li>You consent to emergency medical treatment if necessary</li>
                <li>Must disclose any medical conditions that could affect participation</li>
              </Section>

              {/* Section 8 - Substance Policy */}
              <Section 
                number="8" 
                title="Substance Use Policy"
                icon="🚫"
              >
                <li>No alcohol or drug use permitted during filming activities</li>
                <li>Random testing may occur; positive results lead to immediate removal</li>
                <li>Prescription medications must be disclosed to production</li>
                <li>Smoking/vaping restricted to designated areas and times</li>
              </Section>

              {/* Section 9 - Relationships */}
              <Section 
                number="9" 
                title="Romantic Relationships & Conduct"
                icon="❤️"
              >
                <li>Relationships formed during the show may be portrayed for entertainment</li>
                <li>Participants must respect boundaries and consent at all times</li>
                <li>Harassment, non-consensual behavior, or aggression = immediate expulsion</li>
                <li>Production may intervene in situations compromising safety</li>
                <li>Intimate moments may be filmed and broadcast</li>
              </Section>

              {/* Section 10 - Post-Show */}
              <Section 
                number="10" 
                title="Post-Show Obligations"
                icon="📅"
              >
                <li>Selected participants may be required for promotional activities (interviews, events, social media)</li>
                <li>Exclusive media rights apply for 12 months after broadcast</li>
                <li>Cannot participate in competing reality shows for 18 months</li>
                <li>Must maintain confidentiality about unaired content</li>
              </Section>

              {/* Section 11 - Liability */}
              <Section 
                number="11" 
                title="Disclaimer of Liability"
                icon="⚖️"
              >
                <li>Lovemate Productions not liable for emotional distress, reputation damage, or other participation consequences</li>
                <li>You assume all risks associated with public exposure and media portrayal</li>
                <li>Show's portrayal at sole discretion of producers and editors</li>
                <li>No guarantee of airtime or specific portrayal</li>
              </Section>

              {/* Section 12 - Compensation */}
              <Section 
                number="12" 
                title="Compensation & Expenses"
                icon="💰"
              >
                <li>Selected participants receive daily stipend during filming</li>
                <li>Accommodation, meals, and transportation provided during production</li>
                <li>No compensation for application or pre-selection process</li>
                <li>Travel to filming location at participant's expense unless otherwise agreed</li>
              </Section>

              {/* Final Acknowledgment */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl border-2 border-pink-200 mt-8">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📝</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Acknowledgment of Understanding</h3>
                    <p className="text-gray-700 mb-4">
                      By checking the box on the registration form, I acknowledge that I have read, understood, and agree to all terms above. I confirm that I am 18 years or older and consent to participate in an adult-oriented reality TV production. I understand that this is a binding agreement.
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t border-pink-200">
                      <span>Last Updated: February 2026</span>
                      <span className="bg-pink-100 px-3 py-1 rounded-full">Version: 3.0 (18+ Edition)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-pink-600 transition-colors flex items-center gap-2"
                >
                  ← Back to Home
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Accept Terms & Continue to Registration →
                </Link>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center text-gray-300">
            <p className="mb-2">Have questions about the terms?</p>
            <p>Contact our participation coordinator at <span className="text-pink-400 font-semibold">participate@lovemate.show</span></p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// Reusable Section Component
function Section({ number, title, icon, children }) {
  return (
    <div className="border-b border-gray-200 pb-6 last:border-0">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
        <span className="bg-gradient-to-br from-pink-500 to-rose-500 text-white w-10 h-10 rounded-full inline-flex items-center justify-center text-lg shadow-md">
          {number}
        </span>
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      <ul className="space-y-2 text-gray-700 ml-14">
        {children}
      </ul>
    </div>
  );
}