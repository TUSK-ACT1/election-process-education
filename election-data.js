/* ===== ElectionGuide AI — Election Data & Knowledge Base ===== */

const ElectionData = {
  /* Country/region-specific election info */
  countries: {
    "united states": {
      registrationMethods: ["Online", "By mail", "In person at DMV or election office"],
      votingMethods: ["In-person on Election Day", "Early voting", "Mail-in / Absentee ballot"],
      idRequirements: "Varies by state. Many states require photo ID (driver's license, passport, etc.). Some accept non-photo ID or affidavit.",
      eligibility: "Must be a U.S. citizen, 18+ on Election Day, meet state residency requirements, and not be disqualified by felony conviction (varies by state).",
      electionTypes: {
        national: { name: "Federal / Presidential Election", cycle: "Every 4 years (President), 2 years (Congress)" },
        state: { name: "State Election", cycle: "Varies by state" },
        local: { name: "Local / Municipal Election", cycle: "Varies by municipality" },
        primary: { name: "Primary Election", cycle: "Before general elections" },
        special: { name: "Special Election", cycle: "Called as needed" }
      },
      milestones: [
        { id: "register", label: "Voter Registration", description: "Register to vote or verify your registration status. Deadline varies by state (typically 15–30 days before Election Day).", daysBeforeElection: 30 },
        { id: "research", label: "Research Candidates & Issues", description: "Review candidate positions, ballot measures, and local issues.", daysBeforeElection: 28 },
        { id: "absentee_request", label: "Request Absentee/Mail Ballot", description: "If voting by mail, submit your absentee ballot application.", daysBeforeElection: 25 },
        { id: "early_voting", label: "Early Voting Period", description: "Vote early at designated polling locations (where available).", daysBeforeElection: 14 },
        { id: "mail_ballot_send", label: "Mail Ballot Deadline", description: "Ensure your mail-in ballot is sent before the deadline.", daysBeforeElection: 7 },
        { id: "election_day", label: "Election Day", description: "Vote at your assigned polling location. Polls typically open 6–7 AM and close 7–8 PM.", daysBeforeElection: 0 },
        { id: "results", label: "Preliminary Results", description: "Initial results are announced on election night. Official counting may take days.", daysBeforeElection: -1 },
        { id: "certification", label: "Results Certification", description: "Official results are certified by state election authorities.", daysBeforeElection: -30 }
      ],
      officialResources: [
        { name: "Vote.gov", url: "https://vote.gov" },
        { name: "USA.gov Elections", url: "https://www.usa.gov/voting" },
        { name: "Can I Vote?", url: "https://www.nass.org/can-I-vote" }
      ]
    },
    "india": {
      registrationMethods: ["Online via NVSP portal", "Offline Form 6 at BLO/ERO office"],
      votingMethods: ["In-person at polling booth using EVM", "Postal ballot (limited eligibility)"],
      idRequirements: "EPIC (Voter ID card) is standard. Alternatives: Aadhaar, passport, driving license, PAN card, and other government-issued photo IDs.",
      eligibility: "Must be an Indian citizen, 18+ on qualifying date (Jan 1), resident of the constituency, and registered in the electoral roll.",
      electionTypes: {
        national: { name: "Lok Sabha (General) Election", cycle: "Every 5 years" },
        state: { name: "Vidhan Sabha (State Assembly) Election", cycle: "Every 5 years" },
        local: { name: "Panchayat / Municipal Election", cycle: "Every 5 years" },
        "by-election": { name: "By-Election", cycle: "As needed for vacant seats" }
      },
      milestones: [
        { id: "register", label: "Electoral Roll Registration", description: "Ensure your name is on the voter list via NVSP or visit BLO.", daysBeforeElection: 45 },
        { id: "notification", label: "Election Notification", description: "Election Commission announces dates, code of conduct begins.", daysBeforeElection: 40 },
        { id: "nominations", label: "Candidate Nominations", description: "Candidates file nominations; scrutiny and withdrawal follow.", daysBeforeElection: 30 },
        { id: "campaign", label: "Campaign Period", description: "Candidates campaign. Review manifestos and attend rallies.", daysBeforeElection: 14 },
        { id: "campaign_end", label: "Campaign Silence Period", description: "Campaigning ends 48 hours before polling.", daysBeforeElection: 2 },
        { id: "election_day", label: "Polling Day", description: "Vote at your assigned booth using EVM. Carry voter ID.", daysBeforeElection: 0 },
        { id: "counting", label: "Counting Day", description: "Votes are counted and results are announced.", daysBeforeElection: -3 },
        { id: "results", label: "Official Results", description: "Results declared by Election Commission.", daysBeforeElection: -5 }
      ],
      officialResources: [
        { name: "Election Commission of India", url: "https://eci.gov.in" },
        { name: "NVSP Portal", url: "https://www.nvsp.in" },
        { name: "Voter Helpline", url: "https://voterportal.eci.gov.in" }
      ]
    },
    "united kingdom": {
      registrationMethods: ["Online at gov.uk", "By post using paper form"],
      votingMethods: ["In-person at polling station", "Postal vote", "Proxy vote"],
      idRequirements: "Photo ID required at polling stations (since 2023). Accepted: passport, driving licence, or free Voter Authority Certificate.",
      eligibility: "Must be 18+ (16+ in Scotland/Wales for devolved elections), a British, Irish, or qualifying Commonwealth citizen, and registered to vote.",
      electionTypes: {
        national: { name: "General Election", cycle: "At least every 5 years" },
        local: { name: "Local Council Election", cycle: "Varies by council" },
        devolved: { name: "Devolved Parliament/Assembly Election", cycle: "Every 4–5 years" }
      },
      milestones: [
        { id: "register", label: "Voter Registration", description: "Register online at gov.uk/register-to-vote. Deadline ~12 working days before election.", daysBeforeElection: 16 },
        { id: "postal_apply", label: "Postal Vote Application", description: "Apply for a postal vote if you cannot attend in person.", daysBeforeElection: 11 },
        { id: "proxy_apply", label: "Proxy Vote Deadline", description: "Apply for a proxy vote if needed.", daysBeforeElection: 6 },
        { id: "campaign", label: "Campaign Period", description: "Review party manifestos and candidate positions.", daysBeforeElection: 14 },
        { id: "election_day", label: "Polling Day", description: "Vote at your polling station, 7AM–10PM. Bring photo ID.", daysBeforeElection: 0 },
        { id: "results", label: "Results", description: "Results announced overnight and next day.", daysBeforeElection: -1 }
      ],
      officialResources: [
        { name: "Register to Vote", url: "https://www.gov.uk/register-to-vote" },
        { name: "Electoral Commission", url: "https://www.electoralcommission.org.uk" }
      ]
    }
  },

  /* Generic fallback for unknown countries */
  genericMilestones: [
    { id: "register", label: "Voter Registration", description: "Confirm you are registered to vote. Check with your local election authority.", daysBeforeElection: 30 },
    { id: "research", label: "Research Candidates & Issues", description: "Learn about candidates, their platforms, and any ballot measures.", daysBeforeElection: 21 },
    { id: "prepare", label: "Prepare Required Documents", description: "Gather necessary identification and documents for voting.", daysBeforeElection: 14 },
    { id: "early_voting", label: "Early/Advance Voting (if available)", description: "Check if early or advance voting is available in your area.", daysBeforeElection: 10 },
    { id: "election_day", label: "Election Day", description: "Cast your vote at your designated polling location.", daysBeforeElection: 0 },
    { id: "results", label: "Results Announced", description: "Official results are tallied and announced.", daysBeforeElection: -3 }
  ],

  /* Scenario responses */
  scenarios: {
    missed_registration: {
      title: "Missed Registration Deadline",
      simple: "In some places you can still register on Election Day. Check with your local election office right away.",
      detailed: "If you've missed the standard registration deadline:\n1. **Same-Day Registration**: Some jurisdictions allow registration on Election Day at the polling place. You may need extra ID.\n2. **Provisional Ballot**: In some areas, you can cast a provisional ballot which will be verified later.\n3. **Contact your election office** immediately to learn your specific options.\n4. **For future elections**: Set reminders well ahead of deadlines."
    },
    missing_id: {
      title: "Missing or Lost ID",
      simple: "Don't worry—many places accept alternatives. Contact your election office for options.",
      detailed: "If you don't have the required ID:\n1. **Alternative IDs**: Check if other forms of ID are accepted (utility bill, bank statement, etc.).\n2. **Free voter ID**: Some jurisdictions offer free voter ID cards—apply now.\n3. **Affidavit/Provisional Ballot**: You may be able to sign an affidavit or cast a provisional ballot.\n4. **Get replacement ID**: Visit your local government office ASAP for a replacement."
    },
    cannot_vote_election_day: {
      title: "Can't Vote on Election Day",
      simple: "You may have options: early voting, mail-in ballot, or proxy voting. Check what's available in your area.",
      detailed: "If you can't make it on Election Day:\n1. **Early Voting**: Many areas offer early voting days/weeks before the election.\n2. **Absentee/Mail-in Ballot**: Request a mail ballot—check the deadline.\n3. **Proxy Voting**: In some countries, someone can vote on your behalf (with authorization).\n4. **Extended Hours**: Some polling stations have extended hours—check yours.\n5. **Employer obligations**: Some jurisdictions require employers to give time off to vote."
    },
    eligibility_confusion: {
      title: "Unsure About Eligibility",
      simple: "Eligibility usually depends on citizenship, age, and residency. Contact your election authority to confirm.",
      detailed: "Common eligibility requirements:\n1. **Citizenship**: You typically must be a citizen (some local elections have exceptions).\n2. **Age**: Usually 18+ on Election Day (some places allow 16+ for certain elections).\n3. **Residency**: You must reside in the voting district.\n4. **Disqualifications**: Some places restrict voting for people with certain criminal convictions.\n5. **Check officially**: Contact your local election authority or use their online tools."
    }
  },

  /* Checklist templates */
  checklistTemplate: {
    doNow: [
      { id: "cl_register", text: "Verify your voter registration", detail: "Check if you're registered and your info is correct" },
      { id: "cl_id", text: "Confirm you have required identification", detail: "Check what ID you need and ensure it's valid" },
      { id: "cl_method", text: "Decide your voting method", detail: "In-person, early voting, or mail-in ballot" },
      { id: "cl_research", text: "Start researching candidates", detail: "Find unbiased voter guides for your area" }
    ],
    doNext: [
      { id: "cl_ballot", text: "Request mail-in ballot (if applicable)", detail: "Apply before the deadline" },
      { id: "cl_location", text: "Find your polling location", detail: "Know where to go and plan transportation" },
      { id: "cl_plan", text: "Create your voting plan", detail: "What time will you vote? Who's going with you?" },
      { id: "cl_sample", text: "Review your sample ballot", detail: "Know what you'll be voting on before you go" }
    ],
    onElectionDay: [
      { id: "cl_bring_id", text: "Bring required ID to polling station", detail: "Double-check the accepted forms of ID" },
      { id: "cl_polling", text: "Go to your correct polling location", detail: "Arrive with enough time before polls close" },
      { id: "cl_vote", text: "Cast your vote", detail: "Take your time, review your ballot before submitting" },
      { id: "cl_sticker", text: "Confirm your ballot was accepted", detail: "Get your receipt/sticker and report any issues" }
    ]
  }
};
