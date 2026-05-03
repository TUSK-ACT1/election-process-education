/* ===== ElectionGuide AI — Decision Engine ===== */

const DecisionEngine = {
  /**
   * Determine the user's current stage based on their context and dates.
   * Returns the most urgent recommended action.
   */
  analyzeUserStage(userContext) {
    const { electionDate, completedSteps = [], votingMethod, country } = userContext;
    if (!electionDate) {
      return {
        stage: "setup",
        urgency: "info",
        action: "Set your election date",
        description: "Provide your election date so I can build a personalized timeline with deadlines.",
        steps: ["Tell me the date of your upcoming election", "Or describe the election type and I'll look up typical timelines"]
      };
    }

    const now = new Date();
    const election = new Date(electionDate);
    const daysUntil = Math.ceil((election - now) / (1000 * 60 * 60 * 24));

    // Get milestones
    const countryKey = (country || "").toLowerCase();
    const countryData = ElectionData.countries[countryKey];
    const milestones = countryData ? countryData.milestones : ElectionData.genericMilestones;

    // Find next uncompleted milestone
    const upcomingMilestones = milestones
      .filter(m => !completedSteps.includes(m.id))
      .sort((a, b) => b.daysBeforeElection - a.daysBeforeElection);

    // Find overdue milestones
    const overdue = upcomingMilestones.filter(m => daysUntil < m.daysBeforeElection);
    const nextUp = upcomingMilestones.find(m => daysUntil >= m.daysBeforeElection) || upcomingMilestones[0];

    // Determine urgency
    let urgency = "low";
    let urgencyLabel = "You have time";

    if (daysUntil <= 0) {
      if (daysUntil === 0) {
        urgency = "critical";
        urgencyLabel = "🗳️ It's Election Day!";
      } else {
        urgency = "past";
        urgencyLabel = "Election has passed";
      }
    } else if (daysUntil <= 3) {
      urgency = "critical";
      urgencyLabel = `⚠️ Only ${daysUntil} day${daysUntil > 1 ? 's' : ''} left!`;
    } else if (daysUntil <= 7) {
      urgency = "high";
      urgencyLabel = `🔴 ${daysUntil} days remaining`;
    } else if (daysUntil <= 14) {
      urgency = "medium";
      urgencyLabel = `🟡 ${daysUntil} days remaining`;
    } else {
      urgency = "low";
      urgencyLabel = `🟢 ${daysUntil} days remaining`;
    }

    // Warnings for overdue steps
    const warnings = overdue.map(m => `"${m.label}" deadline may have passed. Please verify immediately.`);

    // Build reasoning (Why this action?)
    let reasoning = "";
    if (daysUntil <= 0) {
      reasoning = "Because the election date has arrived or passed.";
    } else if (nextUp) {
      reasoning = `Since there are ${daysUntil} days left until the election, completing "${nextUp.label}" is your highest priority to stay on track.`;
      if (votingMethod === 'mail' && nextUp.id === 'mail_ballot_send') {
        reasoning += " Mail-in ballots require extra time for postal delivery, so acting now is critical.";
      }
      if (userContext.constraints && userContext.constraints.some(c => c.toLowerCase().includes('first-time'))) {
        reasoning += " As a first-time voter, getting this step done early gives you time to resolve any unexpected issues.";
      }
    }

    // Build action recommendation
    let action, description, steps;
    if (daysUntil === 0) {
      action = "Go vote!";
      description = "Today is Election Day. Head to your polling location with your required ID.";
      steps = ["Bring your ID and voter registration confirmation", "Go to your assigned polling location", "Cast your vote!", "Report any issues to poll workers"];
    } else if (daysUntil < 0) {
      action = "Review results";
      description = "The election has passed. Check official sources for results.";
      steps = ["Visit your election authority's website for results", "Learn from this experience for future elections"];
    } else if (nextUp) {
      action = nextUp.label;
      description = nextUp.description;
      steps = this.getStepsForMilestone(nextUp.id, userContext);
    } else {
      action = "You're all set!";
      description = "You've completed all preparation steps.";
      steps = ["Review your voting plan one more time", "Stay informed about any last-minute changes"];
      reasoning = "You have successfully completed all recommended steps for this election.";
    }

    // Trust & Reliability cues
    const contextCues = [];
    if (country) {
      contextCues.push(`Based on general guidelines for ${country}`);
    }
    contextCues.push("Always verify specific deadlines with your local election office.");

    return { stage: nextUp ? nextUp.id : "ready", urgency, urgencyLabel, action, description, steps, warnings, daysUntil, reasoning, contextCues };
  },

  getStepsForMilestone(milestoneId, ctx) {
    const stepsMap = {
      register: [
        "Visit your election authority website or office",
        "Complete the voter registration form",
        "Provide required identification",
        "Save your confirmation/receipt"
      ],
      research: [
        "Look up your sample ballot online",
        "Research each candidate's positions",
        "Read about ballot measures/propositions",
        "Check nonpartisan voter guides"
      ],
      absentee_request: [
        "Check mail ballot eligibility for your area",
        "Submit your absentee ballot application",
        "Note the return deadline",
        "Track your ballot status online"
      ],
      early_voting: [
        "Find early voting locations near you",
        "Check early voting dates and hours",
        "Bring required identification",
        "Vote at your convenience"
      ],
      mail_ballot_send: [
        "Complete your mail-in ballot carefully",
        "Sign the envelope as required",
        "Mail it well before the deadline OR drop it off",
        "Track it online to confirm receipt"
      ],
      election_day: [
        "Confirm your polling location",
        "Bring required ID",
        "Plan your travel and timing",
        "Vote and confirm your ballot was accepted"
      ],
      notification: ["Check the Election Commission announcement", "Note all important dates"],
      nominations: ["Review the list of candidates in your constituency"],
      campaign: ["Attend local debates or rallies", "Read candidate manifestos"],
      campaign_end: ["Finalize your voting decision", "Rest and prepare for polling day"],
      counting: ["Follow official counting updates"],
      postal_apply: ["Apply at your local electoral office", "Submit by the deadline"],
      proxy_apply: ["Identify a trusted proxy voter", "Submit the proxy application form"],
      prepare: ["Gather ID documents", "Check polling location"],
      results: ["Check official sources for results"],
      certification: ["Final certified results will be published officially"]
    };
    return stepsMap[milestoneId] || ["Contact your local election authority for details"];
  },

  /**
   * Generate a personalized timeline from user context.
   */
  generateTimeline(userContext) {
    const { electionDate, completedSteps = [], country } = userContext;
    if (!electionDate) return [];

    const election = new Date(electionDate);
    const now = new Date();
    const daysUntil = Math.ceil((election - now) / (1000 * 60 * 60 * 24));

    const countryKey = (country || "").toLowerCase();
    const countryData = ElectionData.countries[countryKey];
    const milestones = countryData ? countryData.milestones : ElectionData.genericMilestones;

    return milestones.map(m => {
      const targetDate = new Date(election);
      targetDate.setDate(targetDate.getDate() - m.daysBeforeElection);

      const daysToThis = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
      let status = "upcoming";
      if (completedSteps.includes(m.id)) {
        status = "completed";
      } else if (daysToThis < 0) {
        status = "overdue";
      } else if (daysToThis <= 3) {
        status = "urgent";
      } else if (daysToThis <= 7) {
        status = "active";
      }

      let urgencyLevel = "low";
      if (status === "overdue") urgencyLevel = "high";
      else if (status === "urgent") urgencyLevel = "high";
      else if (status === "active") urgencyLevel = "medium";

      return {
        ...m,
        date: targetDate,
        dateStr: targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status,
        urgencyLevel,
        daysAway: daysToThis
      };
    }).sort((a, b) => a.date - b.date);
  },

  /**
   * Build a personalized checklist from context.
   */
  generateChecklist(userContext) {
    const { votingMethod, country } = userContext;
    const base = JSON.parse(JSON.stringify(ElectionData.checklistTemplate));

    // Customize based on voting method
    if (votingMethod === "mail") {
      base.doNow.push({ id: "cl_mail_apply", text: "Apply for mail-in ballot", detail: "Don't wait—apply as soon as possible" });
      base.doNext = base.doNext.filter(i => i.id !== "cl_location");
      base.onElectionDay = [
        { id: "cl_complete_ballot", text: "Complete and sign your mail ballot", detail: "Follow all instructions carefully" },
        { id: "cl_mail_send", text: "Mail or drop off your ballot", detail: "Ensure it arrives by the deadline" },
        { id: "cl_track", text: "Track your ballot online", detail: "Confirm it was received and accepted" }
      ];
    } else if (votingMethod === "early") {
      base.doNext.push({ id: "cl_early_dates", text: "Check early voting dates & locations", detail: "Plan which day works best for you" });
    }

    return base;
  },

  /**
   * Handle specific scenario questions.
   */
  getScenarioResponse(scenarioKey, explanationMode = "simple", context = {}) {
    const scenario = ElectionData.scenarios[scenarioKey];
    if (!scenario) return null;
    
    let content = explanationMode === "simple" ? scenario.simple : scenario.detailed;
    
    // Add context awareness
    if (context.country && explanationMode === "detailed") {
        content += `\n\n*Note: Since you are in ${context.country}, ensure you check the specific rules for your region, as alternative options vary widely by local jurisdiction.*`;
    }

    return {
      title: scenario.title,
      content: content
    };
  },

  /**
   * Detect scenario from user message.
   */
  detectScenario(message) {
    const msg = message.toLowerCase();
    if (msg.includes("missed") && (msg.includes("register") || msg.includes("registration") || msg.includes("deadline"))) return "missed_registration";
    if (msg.includes("no id") || msg.includes("lost id") || msg.includes("missing id") || msg.includes("don't have id") || msg.includes("no identification")) return "missing_id";
    if (msg.includes("can't vote") || msg.includes("cannot vote") || msg.includes("won't be able to vote") || msg.includes("not available on election")) return "cannot_vote_election_day";
    if (msg.includes("eligible") || msg.includes("eligibility") || msg.includes("can i vote") || msg.includes("am i allowed")) return "eligibility_confusion";
    return null;
  },

  /**
   * Internal Validation & Testing
   * Ensures the decision logic handles core cases securely and accurately.
   */
  runTests() {
    console.log("Running DecisionEngine Tests...");
    let passed = 0, failed = 0;
    
    const assert = (condition, msg) => {
      if(condition) { passed++; console.log(`[PASS] ${msg}`); }
      else { failed++; console.error(`[FAIL] ${msg}`); }
    };

    try {
      // Test 1: Future Election Date (Low Urgency)
      let d = new Date(); d.setDate(d.getDate() + 45);
      let res = this.analyzeUserStage({ electionDate: d.toISOString(), country: "united states" });
      assert(res.urgency === "low", "Future date correctly mapped to low urgency");

      // Test 2: Election Day (Critical Urgency)
      res = this.analyzeUserStage({ electionDate: new Date().toISOString(), country: "united states" });
      assert(res.urgency === "critical", "Today correctly mapped to critical urgency");

      // Test 3: Past Election Date
      d = new Date(); d.setDate(d.getDate() - 5);
      res = this.analyzeUserStage({ electionDate: d.toISOString(), country: "united states" });
      assert(res.urgency === "past", "Past date correctly detected");

      // Test 4: Scenario Detection
      assert(this.detectScenario("I lost my voter id") === "missing_id", "Missing ID scenario detected securely");

      console.log(`Tests Complete: ${passed} Passed, ${failed} Failed.`);
      return failed === 0;
    } catch (e) {
      console.error("Test execution failed:", e);
      return false;
    }
  }
};

// Auto-run tests in Node.js environment or allow programmatic trigger
if (typeof module !== 'undefined' && typeof process !== 'undefined') {
  DecisionEngine.runTests();
}
