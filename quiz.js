/* ===== ElectionGuide AI — Quiz Module ===== */

const QuizModule = {
  questions: [
    {
      question: "What is the primary purpose of voter registration?",
      options: [
        "To join a political party",
        "To confirm your eligibility and add you to the voter list",
        "To receive campaign materials",
        "To get a tax benefit"
      ],
      correct: 1,
      explanation: "Voter registration confirms your identity, eligibility, and ensures your name is on the official voter roll so you can cast a ballot."
    },
    {
      question: "What should you do if you realize you missed the voter registration deadline?",
      options: [
        "Give up and skip the election",
        "Try to vote anyway without registering",
        "Check if same-day registration or provisional ballots are available",
        "Register for the next election only"
      ],
      correct: 2,
      explanation: "Some jurisdictions offer same-day registration or provisional ballots. Always check with your local election authority—you may still have options."
    },
    {
      question: "Why is it important to research candidates before voting?",
      options: [
        "It's required by law",
        "So you can tell others who to vote for",
        "To make an informed decision aligned with your values",
        "To get a voter discount"
      ],
      correct: 2,
      explanation: "Researching candidates helps you understand their positions on issues you care about, enabling you to make an informed choice."
    },
    {
      question: "What is a mail-in / absentee ballot?",
      options: [
        "A ballot only for military personnel",
        "A way to vote by sending your ballot through the mail",
        "A digital voting method",
        "A backup ballot kept at the polling station"
      ],
      correct: 1,
      explanation: "A mail-in or absentee ballot lets you vote by mail rather than going to a polling station in person. Eligibility rules vary by location."
    },
    {
      question: "What typically happens AFTER Election Day?",
      options: [
        "All votes are immediately finalized within an hour",
        "Votes are counted, results verified, and officially certified",
        "A re-election is always held",
        "Nothing—the first results are always final"
      ],
      correct: 1,
      explanation: "After Election Day, ballots (including mail-in and provisional) are counted, results are verified, and election authorities officially certify the outcomes."
    },
    {
      question: "What is early voting?",
      options: [
        "Voting before you're 18",
        "Casting your vote before the official Election Day at designated locations",
        "Voting online early in the morning",
        "Pre-registering your vote by phone"
      ],
      correct: 1,
      explanation: "Early voting allows eligible voters to cast ballots at designated locations before the official Election Day, offering more flexibility."
    },
    {
      question: "If you can't vote in person on Election Day, what should you do FIRST?",
      options: [
        "Post about it on social media",
        "Ask a friend to vote for you without authorization",
        "Check alternative voting options like early voting, mail-in, or proxy voting",
        "Wait for the next election"
      ],
      correct: 2,
      explanation: "If you can't make it on Election Day, explore alternatives like early voting, requesting a mail-in ballot, or (where allowed) proxy voting."
    },
    {
      question: "Why do election results need to be 'certified'?",
      options: [
        "To make the results look official",
        "It's just a tradition with no real purpose",
        "To formally verify accuracy and make results legally binding",
        "To allow candidates to change the results"
      ],
      correct: 2,
      explanation: "Certification is the official process of verifying that vote counts are accurate and complete, making the results legally binding."
    }
  ],

  /**
   * Get a shuffled subset of quiz questions.
   */
  getQuiz(count = 5) {
    const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },

  /**
   * Grade a completed quiz. answers = [{questionIndex, selectedOption}]
   */
  gradeQuiz(quizQuestions, answers) {
    let correct = 0;
    const results = quizQuestions.map((q, i) => {
      const userAnswer = answers[i];
      const isCorrect = userAnswer === q.correct;
      if (isCorrect) correct++;
      return { question: q.question, isCorrect, userAnswer, correctAnswer: q.correct, explanation: q.explanation };
    });

    const score = Math.round((correct / quizQuestions.length) * 100);
    let feedback;
    if (score === 100) feedback = "Perfect score! You have an excellent understanding of the election process. 🎉";
    else if (score >= 80) feedback = "Great job! You understand the election process well. Review the items you missed to strengthen your knowledge.";
    else if (score >= 60) feedback = "Good effort! You have a basic understanding. Consider reviewing the election process to fill in some gaps.";
    else feedback = "Keep learning! Understanding the election process is important for every citizen. Review the explanations below and try again.";

    return { correct, total: quizQuestions.length, score, feedback, results };
  }
};
