/* ===== ElectionGuide AI — Main Application Logic ===== */

document.addEventListener('DOMContentLoaded', () => {
  // --- State Management ---
  const state = {
    userContext: {
      location: null, // { country, region, city }
      country: null,
      electionType: null,
      electionDate: null,
      votingMethod: null,
      constraints: [],
      completedSteps: [],
      language: 'English'
    },
    currentPanel: 'chat',
    explanationMode: 'simple', // 'simple' or 'detailed'
    intakeStep: 0,
    isProcessing: false,
    quizActive: null, // { questions, currentIdx, answers }
    checklist: {
      doNow: [],
      doNext: [],
      onElectionDay: []
    }
  };

  // --- DOM Elements ---
  const els = {
    loadingScreen: document.getElementById('loading-screen'),
    app: document.getElementById('app'),
    chatMessages: document.getElementById('chat-messages'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    quickActions: document.getElementById('quick-actions'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    panels: document.querySelectorAll('.panel'),
    explanationModeBtn: document.getElementById('explanation-mode-btn'),
    explanationLabel: document.getElementById('explanation-label'),
    resetBtn: document.getElementById('reset-btn'),
    fabAction: document.getElementById('fab-action'),
    nextActionOverlay: document.getElementById('next-action-overlay'),
    nextActionContent: document.getElementById('next-action-content'),
    closeNextAction: document.getElementById('close-next-action'),

    // Timeline
    timelineTrack: document.getElementById('timeline-track'),
    timelineEmpty: document.getElementById('timeline-empty'),
    timelineSubtitle: document.getElementById('timeline-subtitle'),

    // Checklist
    checklistGroups: document.getElementById('checklist-groups'),
    checklistEmpty: document.getElementById('checklist-empty'),
    progressCircle: document.getElementById('progress-circle'),
    progressText: document.getElementById('progress-text'),

    // Quiz
    quizStart: document.getElementById('quiz-start'),
    quizActive: document.getElementById('quiz-active'),
    quizResults: document.getElementById('quiz-results'),
    startQuizBtn: document.getElementById('start-quiz-btn'),
    quizQuestionText: document.getElementById('quiz-question-text'),
    quizQuestionNum: document.getElementById('quiz-question-number'),
    quizOptions: document.getElementById('quiz-options'),
    quizNextBtn: document.getElementById('quiz-next-btn'),
    quizProgressFill: document.getElementById('quiz-progress-fill'),
    quizResultsCard: document.getElementById('quiz-results-card')
  };

  // --- Initialization ---
  const init = () => {
    // Simulate loading
    setTimeout(() => {
      els.loadingScreen.classList.add('fade-out');
      els.app.classList.remove('hidden');
      addMessage('assistant', "Hello! I'm **ElectionGuide AI**, your personalized civic assistant. I'm here to help you navigate the voting process step-by-step.\n\nTo get started, **where are you located?** (Country and City/Region)");
      renderQuickActions(['United States', 'India', 'United Kingdom', 'Other']);
    }, 2000);

    setupEventListeners();
  };

  const setupEventListeners = () => {
    // Chat Input
    els.sendBtn.addEventListener('click', handleUserInput);
    els.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
      }
    });

    // Navigation
    els.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => switchPanel(btn.dataset.mode));
    });

    // Settings
    els.explanationModeBtn.addEventListener('click', toggleExplanationMode);
    els.resetBtn.addEventListener('click', resetApp);

    // FAB
    els.fabAction.addEventListener('click', showNextAction);
    els.closeNextAction.addEventListener('click', () => els.nextActionOverlay.classList.add('hidden'));

    // Quiz
    els.startQuizBtn.addEventListener('click', startQuiz);
    els.quizNextBtn.addEventListener('click', nextQuizQuestion);
  };

  // --- Navigation & UI State ---
  const switchPanel = (panelId) => {
    state.currentPanel = panelId;

    els.modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === panelId);
    });

    els.panels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `${panelId}-panel`);
    });

    // Update specific panel content if needed
    if (panelId === 'timeline') updateTimelineUI();
    if (panelId === 'checklist') updateChecklistUI();
  };

  const toggleExplanationMode = () => {
    state.explanationMode = state.explanationMode === 'simple' ? 'detailed' : 'simple';
    els.explanationLabel.textContent = state.explanationMode.charAt(0).toUpperCase() + state.explanationMode.slice(1);

    addMessage('assistant', `I've switched to **${state.explanationMode}** explanations. I'll provide ${state.explanationMode === 'detailed' ? 'more in-depth information' : 'clearer, bite-sized steps'} from now on.`);
  };

  const resetApp = () => {
    if (confirm('Are you sure you want to reset? This will clear your progress.')) {
      window.location.reload();
    }
  };

  // --- Chat Logic ---
  const handleUserInput = () => {
    const text = els.userInput.value.trim();
    if (!text || state.isProcessing) return;

    addMessage('user', text);
    els.userInput.value = '';
    els.userInput.style.height = 'auto';

    processResponse(text);
  };

  const addMessage = (role, text) => {
    const msg = document.createElement('div');
    msg.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = role === 'assistant' ? 'AI' : 'U';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    // Security: Sanitize input to prevent XSS attacks before parsing markdown
    const sanitizeHTML = (str) => {
      const temp = document.createElement('div');
      temp.textContent = str;
      return temp.innerHTML;
    };

    // Simple markdown-ish parsing (applied after sanitization)
    let html = sanitizeHTML(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    bubble.innerHTML = html;

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    els.chatMessages.appendChild(msg);

    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  };

  const renderQuickActions = (actions) => {
    els.quickActions.innerHTML = '';
    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.className = 'quick-action-btn';
      btn.textContent = action;
      // Accessibility: Ensure button is keyboard focusable
      btn.setAttribute('tabindex', '0');
      
      const triggerAction = () => {
        els.userInput.value = action;
        handleUserInput();
      };
      
      btn.addEventListener('click', triggerAction);
      // Accessibility: Allow activating with Enter/Space
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerAction();
        }
      });
      els.quickActions.appendChild(btn);
    });
  };

  const processResponse = (text) => {
    state.isProcessing = true;

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'message assistant';
    typing.innerHTML = '<div class="msg-avatar">AI</div><div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
    els.chatMessages.appendChild(typing);
    els.chatMessages.scrollTop = els.chatMessages.scrollHeight;

    setTimeout(() => {
      typing.remove();

      // Check for scenarios first if intake is done
      if (state.intakeStep >= 5) {
        const scenarioKey = DecisionEngine.detectScenario(text);
        if (scenarioKey) {
          const resp = DecisionEngine.getScenarioResponse(scenarioKey, state.explanationMode, state.userContext);
          addMessage('assistant', `### ${resp.title}\n\n${resp.content}\n\n*General guidance. Please verify with ${state.userContext.country || 'your local'} election authorities.*`);
          renderQuickActions(['Check Timeline', 'View Checklist', 'What should I do now?']);
          state.isProcessing = false;
          return;
        }
      }

      // Handle Intake Flow
      handleIntake(text);
      state.isProcessing = false;
    }, 1000);
  };

  const handleIntake = (text) => {
    const step = state.intakeStep;

    switch (step) {
      case 0: // Location
        state.userContext.location = text;
        state.userContext.country = inferCountry(text);
        state.intakeStep++;
        addMessage('assistant', `Got it. What type of election are you interested in?`);
        renderQuickActions(['National', 'State/Provincial', 'Local', 'All of them']);
        break;

      case 1: // Election Type
        state.userContext.electionType = text;
        state.intakeStep++;
        addMessage('assistant', `Important: Do you know the **Election Date**? If not, I'll use a general estimate.`);
        renderQuickActions(['I know it', "I'm not sure"]);
        break;

      case 2: // Date Check
        if (text.toLowerCase().includes('not sure') || text.toLowerCase().includes('no')) {
          // Set a default date 3 months out for demo
          const d = new Date();
          d.setMonth(d.getMonth() + 3);
          state.userContext.electionDate = d.toISOString().split('T')[0];
          state.intakeStep++;
          nextStepInIntake();
        } else {
          addMessage('assistant', `Please enter the date (YYYY-MM-DD):`);
          els.userInput.placeholder = "e.g., 2024-11-05";
          state.intakeStep = 2.5;
        }
        break;

      case 2.5: // Date Entry
        if (isValidDate(text)) {
          state.userContext.electionDate = text;
          state.intakeStep = 3;
          nextStepInIntake();
        } else {
          addMessage('assistant', "That doesn't look like a valid date. Please try YYYY-MM-DD.");
        }
        break;

      case 3: // Voting Method
        state.userContext.votingMethod = text.toLowerCase().includes('mail') ? 'mail' :
          text.toLowerCase().includes('early') ? 'early' : 'person';
        state.intakeStep++;
        addMessage('assistant', `Finally, are there any constraints I should know about? (e.g., First-time voter, accessibility needs, language preference)`);
        renderQuickActions(['First-time voter', 'Need accessibility info', 'No constraints']);
        break;

      case 4: // Constraints & Wrap up
        if (!text.toLowerCase().includes('no ')) {
          state.userContext.constraints.push(text);
        }
        state.intakeStep++;
        finalizeIntake();
        break;

      default:
        // Regular conversation or AI help
        let response = `I'm here to help you navigate the election process in ${state.userContext.location || 'your area'}.`;

        if (state.userContext.constraints && state.userContext.constraints.length > 0) {
          response += ` Keeping your specific needs in mind (${state.userContext.constraints.join(', ')}),`;
        }

        response += ` you can check your **Timeline** and **Checklist** using the tabs above for a personalized plan.`;

        // Add reliability cue
        response += `\n\n*If you have a specific question not covered here, I recommend checking official resources for ${state.userContext.country || 'your local jurisdiction'}.*`;

        addMessage('assistant', response);
        renderQuickActions(['Registering missed?', 'What should I do now?', 'Take a quiz']);
        break;
    }
  };

  const nextStepInIntake = () => {
    addMessage('assistant', `How do you plan to vote?`);
    renderQuickActions(['In-person (Election Day)', 'Early Voting', 'Mail-in / Absentee']);
  };

  const finalizeIntake = () => {
    // Build initial timeline and checklist
    state.checklist = DecisionEngine.generateChecklist(state.userContext);

    const analysis = DecisionEngine.analyzeUserStage(state.userContext);

    addMessage('assistant', `Great! I've built your personalized election guide. 

Here is your current status:
**Next Step:** ${analysis.action}
**Urgency:** ${analysis.urgencyLabel}

You can find your full timeline and checklist in the tabs above. Would you like to see what you should do right now?`);

    renderQuickActions(['Show me what to do now', 'View Timeline', 'Take Quiz']);
    updateTimelineUI();
    updateChecklistUI();
  };

  // --- Helper Functions ---
  const inferCountry = (text) => {
    const t = text.toLowerCase();
    if (t.includes('usa') || t.includes('united states') || t.includes('america')) return 'United States';
    if (t.includes('india') || t.includes('delhi') || t.includes('mumbai')) return 'India';
    if (t.includes('uk') || t.includes('united kingdom') || t.includes('london')) return 'United Kingdom';
    return 'United States'; // Default for demo
  };

  const isValidDate = (dateString) => {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const d = new Date(dateString);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0) return false;
    return d.toISOString().slice(0, 10) === dateString;
  };

  /**
   * Updates the Timeline UI using DocumentFragments for high performance.
   */
  const updateTimelineUI = () => {
    const timeline = DecisionEngine.generateTimeline(state.userContext);
    if (!timeline || timeline.length === 0) return;

    els.timelineEmpty.classList.add('hidden');
    els.timelineTrack.classList.remove('hidden');
    
    // Performance optimization: Using DocumentFragment to minimize reflows
    const fragment = document.createDocumentFragment();
    els.timelineTrack.innerHTML = '';
    els.timelineSubtitle.textContent = `Personalized for ${state.userContext.location}`;

    timeline.forEach(item => {
      const el = document.createElement('div');
      el.className = 'timeline-item';

      const dotClass = item.status === 'completed' ? 'completed' :
        item.status === 'urgent' ? 'urgent' :
          item.status === 'active' ? 'active' : 'upcoming';

      const icon = item.status === 'completed' ?
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>' : '';

      // Google Services Integration: Generate a dynamic Google Calendar link
      // This provides real-world utility by allowing users to easily save deadlines.
      const gcalDate = item.date.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, 8) + "T090000Z";
      const gcalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.label)}&dates=${gcalDate}/${gcalDate}&details=${encodeURIComponent(item.description)}`;

      el.innerHTML = `
        <div class="timeline-dot ${dotClass}">${icon}</div>
        <div class="timeline-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div class="timeline-date">${item.dateStr}</div>
            <a href="${gcalLink}" target="_blank" rel="noopener noreferrer" style="font-size: 0.7rem; color: var(--accent-primary); text-decoration: none; display: flex; align-items: center; gap: 4px;" title="Add to Google Calendar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Save
            </a>
          </div>
          <h4>${item.label}</h4>
          <p>${item.description}</p>
          ${item.urgencyLevel !== 'low' ? `<span class="urgency-tag ${item.urgencyLevel}">${item.urgencyLevel.toUpperCase()} PRIORITY</span>` : ''}
        </div>
      `;
      els.timelineTrack.appendChild(el);
    });
    
    els.timelineTrack.appendChild(fragment);
  };

  /**
   * Updates the Checklist UI efficiently.
   */
  const updateChecklistUI = () => {
    if (!state.checklist.doNow.length) return;

    els.checklistEmpty.classList.add('hidden');
    els.checklistGroups.classList.remove('hidden');
    const fragment = document.createDocumentFragment();
    els.checklistGroups.innerHTML = '';

    const renderGroup = (title, items, groupClass) => {
      if (!items.length) return;
      const group = document.createElement('div');
      group.className = 'checklist-group';
      group.innerHTML = `<h3 class="checklist-group-title ${groupClass}">${title}</h3>`;

      items.forEach(item => {
        const itemEl = document.createElement('div');
        const isCompleted = state.userContext.completedSteps.includes(item.id);
        itemEl.className = `checklist-item ${isCompleted ? 'completed' : ''}`;
        
        // Accessibility: Make checklist items operable via keyboard
        itemEl.setAttribute('role', 'checkbox');
        itemEl.setAttribute('aria-checked', isCompleted ? 'true' : 'false');
        itemEl.setAttribute('tabindex', '0');
        
        itemEl.innerHTML = `
          <div class="check-box" aria-hidden="true">
            ${isCompleted ? '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4"><path d="M20 6L9 17l-5-5"/></svg>' : ''}
          </div>
          <div class="check-content">
            <div class="check-text">${item.text}</div>
            <div class="check-detail">${item.detail}</div>
          </div>
        `;
        
        const toggleHandler = () => toggleChecklistItem(item.id);
        itemEl.addEventListener('click', toggleHandler);
        itemEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleHandler();
          }
        });
        
        group.appendChild(itemEl);
      });
      fragment.appendChild(group);
    };

    renderGroup('Do Now', state.checklist.doNow, 'now');
    renderGroup('Do Next', state.checklist.doNext, 'next');
    renderGroup('Election Day', state.checklist.onElectionDay, 'election-day');

    els.checklistGroups.appendChild(fragment);
    updateProgress();
  };

  const toggleChecklistItem = (id) => {
    const idx = state.userContext.completedSteps.indexOf(id);
    if (idx > -1) {
      state.userContext.completedSteps.splice(idx, 1);
    } else {
      state.userContext.completedSteps.push(id);
    }
    updateChecklistUI();
    updateTimelineUI();
    updateProgress();
  };

  const updateProgress = () => {
    const total = state.checklist.doNow.length + state.checklist.doNext.length + state.checklist.onElectionDay.length;
    if (total === 0) return;

    const completed = state.userContext.completedSteps.length;
    const percentage = Math.round((completed / total) * 100);

    els.progressText.textContent = `${percentage}%`;

    // Circle progress: 2 * PI * R (R=24) = 150.8
    const offset = 150.8 - (percentage / 100) * 150.8;
    els.progressCircle.style.strokeDashoffset = offset;
  };

  // --- Next Action (Decision Support) ---
  const showNextAction = () => {
    const analysis = DecisionEngine.analyzeUserStage(state.userContext);

    els.nextActionContent.innerHTML = `
      <div class="urgency-badge ${analysis.urgency}">${analysis.urgencyLabel}</div>
      <h3>Recommended Action:</h3>
      <h2 style="font-size:1.5rem; margin-bottom:1rem; color:var(--accent-primary)">${analysis.action}</h2>
      <div style="margin: 1.5rem 0 1rem; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Why this matters:</div>
      <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem; border-left: 3px solid var(--accent-primary); padding-left: 0.75rem;">${analysis.reasoning}</p>

      <div style="margin: 1.5rem 0 1rem; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Next Steps:</div>
      <ul class="action-steps">
        ${analysis.steps.map(step => `<li>${step}</li>`).join('')}
      </ul>

      <div style="margin-top:1.5rem; font-size: 0.75rem; color: var(--text-muted); text-align: center;">
        ${analysis.contextCues.map(cue => `<div>${cue}</div>`).join('')}
      </div>

      ${analysis.warnings.length ? `
        <div style="margin-top:1.5rem; padding:0.75rem; background:rgba(239,68,68,0.1); border-left:3px solid var(--accent-danger); border-radius:4px;">
          <strong style="color:var(--accent-danger); font-size:0.8rem;">ATTENTION:</strong>
          <ul style="margin:0.5rem 0 0; padding-left:1.2rem; font-size:0.75rem; color:var(--text-secondary);">
            ${analysis.warnings.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="margin-top:2rem; display: flex; gap: 0.75rem;">
        <button class="btn-primary" style="flex: 2" id="confirm-action-btn">I've done this</button>
        <button class="header-btn" style="flex: 1" id="google-search-btn" title="Search for official info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.16 5.4-7.84 5.4-4.88 0-8.84-4.04-8.84-9 0-4.96 3.96-9 8.84-9 2.8 0 4.68 1.16 5.76 2.2l2.56-2.48C19.04 1.48 15.96 0 12.48 0 5.56 0 0 5.56 0 12.48s5.56 12.48 12.48 12.48c7.24 0 12.04-5.08 12.04-12.24 0-.84-.08-1.48-.2-2.12h-11.84z"/></svg>
          Search
        </button>
      </div>
    `;

    els.nextActionOverlay.classList.remove('hidden');
    
    document.getElementById('google-search-btn').onclick = () => {
      const query = `official election ${analysis.action} ${state.userContext.location} ${state.userContext.electionType}`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    };

    document.getElementById('confirm-action-btn').onclick = () => {
      if (analysis.stage !== 'setup' && analysis.stage !== 'ready') {
        if (!state.userContext.completedSteps.includes(analysis.stage)) {
          state.userContext.completedSteps.push(analysis.stage);
          updateTimelineUI();
          updateChecklistUI();
        }
      }
      els.nextActionOverlay.classList.add('hidden');
      addMessage('assistant', `Excellent! I've marked **${analysis.action}** as completed. What else should we look at?`);
    };
  };

  // --- Quiz Flow ---
  const startQuiz = () => {
    const questions = QuizModule.getQuiz(5);
    state.quizActive = {
      questions,
      currentIdx: 0,
      answers: []
    };

    els.quizStart.classList.add('hidden');
    els.quizResults.classList.add('hidden');
    els.quizActive.classList.remove('hidden');

    renderQuizQuestion();
  };

  const renderQuizQuestion = () => {
    const { questions, currentIdx } = state.quizActive;
    const q = questions[currentIdx];

    els.quizQuestionNum.textContent = `Question ${currentIdx + 1} of ${questions.length}`;
    els.quizQuestionText.textContent = q.question;
    els.quizProgressFill.style.width = `${((currentIdx) / questions.length) * 100}%`;

    els.quizOptions.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.onclick = () => selectQuizOption(i);
      els.quizOptions.appendChild(btn);
    });

    els.quizNextBtn.classList.add('hidden');
  };

  const selectQuizOption = (idx) => {
    const { questions, currentIdx, answers } = state.quizActive;
    const q = questions[currentIdx];

    if (answers[currentIdx] !== undefined) return; // Prevent multiple selection

    answers[currentIdx] = idx;

    const buttons = els.quizOptions.querySelectorAll('.quiz-option');
    buttons.forEach((btn, i) => {
      btn.classList.add('disabled');
      if (i === q.correct) btn.classList.add('correct');
      else if (i === idx) btn.classList.add('wrong');
    });

    els.quizNextBtn.classList.remove('hidden');
    if (currentIdx === questions.length - 1) {
      els.quizNextBtn.textContent = 'See Results';
    } else {
      els.quizNextBtn.textContent = 'Next Question';
    }
  };

  const nextQuizQuestion = () => {
    const { questions, currentIdx } = state.quizActive;
    if (currentIdx < questions.length - 1) {
      state.quizActive.currentIdx++;
      renderQuizQuestion();
    } else {
      showQuizResults();
    }
  };

  const showQuizResults = () => {
    const { questions, answers } = state.quizActive;
    const results = QuizModule.gradeQuiz(questions, answers);

    els.quizActive.classList.add('hidden');
    els.quizResults.classList.remove('hidden');

    els.quizResultsCard.innerHTML = `
      <div class="quiz-score">${results.score}%</div>
      <h3>${results.correct} / ${results.total} Correct</h3>
      <p class="quiz-feedback">${results.feedback}</p>
      
      <div style="text-align:left; margin-top:2rem;">
        ${results.results.map((r, i) => `
          <div style="margin-bottom:1.5rem; border-bottom:1px solid var(--border-color); padding-bottom:1rem;">
            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem;">Question ${i + 1}</div>
            <div style="font-weight:600; font-size:0.9rem; margin-bottom:0.5rem;">${r.question}</div>
            <div style="font-size:0.85rem; color:${r.isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)'};">
              ${r.isCorrect ? '✓ Correct' : `✗ Incorrect (Correct: ${questions[i].options[r.correctAnswer]})`}
            </div>
            <div style="margin-top:0.5rem; font-size:0.8rem; color:var(--text-secondary); font-style:italic;">
              ${r.explanation}
            </div>
          </div>
        `).join('')}
      </div>

      <button class="btn-primary" style="margin-top:1.5rem" id="retry-quiz-btn">Try Another Quiz</button>
    `;

    document.getElementById('retry-quiz-btn').onclick = startQuiz;
  };

  // Start the app
  init();
});
