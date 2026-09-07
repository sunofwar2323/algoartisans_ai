(() => {
  "use strict";

  const ENQUIRY_ENDPOINT = "https://formsubmit.co/ajax/algoartisans@gmail.com";
  /** Optional: paste a Google Apps Script / Sheet webhook URL to mirror submissions */
  const SHEET_WEBHOOK_URL = "";

  const ROLES = [
    {
      id: "accountant",
      name: "Accountant / Bookkeeper",
      blurb: "Books, invoices, payroll and clean financial reporting.",
      icon: "calculator",
      questions: [
        {
          id: "acct_software",
          label: "What accounting software do you currently use (QuickBooks, Xero, Excel, none)?",
          type: "text",
          required: true,
        },
        {
          id: "acct_volume",
          label: "What's your average monthly transaction volume?",
          type: "text",
          required: true,
        },
        {
          id: "acct_help",
          label: "Do you need help with:",
          type: "multi",
          required: true,
          options: [
            "Invoicing",
            "Expense tracking",
            "Payroll",
            "Tax prep",
            "Reconciliation",
            "Financial reporting",
          ],
        },
        {
          id: "acct_cadence",
          label: "What's your current reporting cadence?",
          type: "select",
          required: true,
          options: ["Weekly", "Monthly", "Quarterly", "Ad hoc / none"],
        },
        {
          id: "acct_integrate",
          label: "Any existing chart of accounts or financial system to integrate with?",
          type: "textarea",
          required: false,
        },
      ],
    },
    {
      id: "finance",
      name: "Finance Manager",
      blurb: "Budgets, forecasts, cash flow and board-ready reporting.",
      icon: "chart",
      questions: [
        { id: "fin_revenue", label: "What is your current revenue range?", type: "text", required: true },
        {
          id: "fin_budget",
          label: "Do you need budgeting/forecasting support?",
          type: "select",
          required: true,
          options: ["Yes", "No", "Not sure yet"],
        },
        {
          id: "fin_cashflow",
          label: "Do you need cash flow monitoring and alerts?",
          type: "select",
          required: true,
          options: ["Yes", "No", "Not sure yet"],
        },
        {
          id: "fin_kpis",
          label: "Any specific KPIs you track (margin, burn rate, runway, etc.)?",
          type: "textarea",
          required: false,
        },
        {
          id: "fin_investor",
          label: "Do you require investor/board reporting support?",
          type: "select",
          required: true,
          options: ["Yes", "No", "Sometimes"],
        },
      ],
    },
    {
      id: "marketing",
      name: "Marketing Specialist",
      blurb: "Channel strategy, campaigns and growth systems.",
      icon: "megaphone",
      questions: [
        {
          id: "mkt_channels",
          label: "What are your primary marketing channels today?",
          type: "multi",
          required: true,
          options: ["Social", "Email", "Ads", "SEO", "Content", "Other"],
        },
        { id: "mkt_icp", label: "What's your target audience/ICP?", type: "textarea", required: true },
        {
          id: "mkt_brand",
          label: "Do you have existing brand guidelines/assets?",
          type: "select",
          required: true,
          options: ["Yes", "Partial", "No"],
        },
        {
          id: "mkt_budget",
          label: "What's your monthly marketing budget range?",
          type: "text",
          required: true,
        },
        {
          id: "mkt_goal",
          label: "What's the primary goal?",
          type: "select",
          required: true,
          options: ["Lead gen", "Brand awareness", "Retention", "Mixed"],
        },
      ],
    },
    {
      id: "social",
      name: "Social Media Manager",
      blurb: "Platform management, content cadence and community.",
      icon: "share",
      questions: [
        {
          id: "soc_platforms",
          label: "Which platforms do you need managed?",
          type: "multi",
          required: true,
          options: ["Instagram", "LinkedIn", "TikTok", "Facebook", "X", "YouTube", "Other"],
        },
        {
          id: "soc_freq",
          label: "Posting frequency desired?",
          type: "text",
          required: true,
        },
        {
          id: "soc_assets",
          label: "Do you have existing content/brand assets, or need content created from scratch?",
          type: "select",
          required: true,
          options: ["Existing assets", "Need creation from scratch", "Mix of both"],
        },
        {
          id: "soc_approve",
          label: "Who approves content before it's posted?",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: "sales",
      name: "Sales / Business Development Rep",
      blurb: "Pipeline, outreach and CRM-driven growth.",
      icon: "handshake",
      questions: [
        { id: "sales_deal", label: "What's your average deal size?", type: "text", required: true },
        {
          id: "sales_process",
          label: "What's your current sales process?",
          type: "select",
          required: true,
          options: ["Inbound", "Outbound", "Both"],
        },
        {
          id: "sales_crm",
          label: "Do you have an existing CRM?",
          type: "text",
          required: true,
        },
        { id: "sales_icp", label: "What's your target market/ICP?", type: "textarea", required: true },
        {
          id: "sales_leads",
          label: "What's your monthly lead volume goal?",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: "support",
      name: "Customer Support Agent",
      blurb: "Tickets, FAQs and always-on customer care.",
      icon: "headset",
      questions: [
        {
          id: "sup_channels",
          label: "What channels need support coverage?",
          type: "multi",
          required: true,
          options: ["Email", "Chat", "Phone", "Social DMs"],
        },
        {
          id: "sup_volume",
          label: "What's your current ticket volume (daily/weekly)?",
          type: "text",
          required: true,
        },
        {
          id: "sup_tool",
          label: "Do you have an existing helpdesk tool (Zendesk, Intercom, etc.)?",
          type: "text",
          required: true,
        },
        {
          id: "sup_faqs",
          label: "What are your most common customer issues/FAQs?",
          type: "textarea",
          required: true,
        },
        {
          id: "sup_hours",
          label: "What hours of coverage do you need?",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: "hr",
      name: "HR / Recruiter",
      blurb: "Hiring, onboarding and people operations.",
      icon: "users",
      questions: [
        {
          id: "hr_employees",
          label: "How many employees do you currently have?",
          type: "text",
          required: true,
        },
        {
          id: "hr_hiring",
          label: "Are you currently hiring? For which roles?",
          type: "textarea",
          required: true,
        },
        {
          id: "hr_help",
          label: "Do you need help with onboarding, payroll admin, or policy documentation?",
          type: "multi",
          required: false,
          options: ["Onboarding", "Payroll admin", "Policy documentation", "None of these"],
        },
        {
          id: "hr_system",
          label: "Do you have an existing HRIS/ATS system?",
          type: "text",
          required: false,
        },
      ],
    },
    {
      id: "pm",
      name: "Project Manager",
      blurb: "Delivery cadence, scope control and team coordination.",
      icon: "kanban",
      questions: [
        {
          id: "pm_active",
          label: "How many active projects do you typically run at once?",
          type: "text",
          required: true,
        },
        {
          id: "pm_tool",
          label: "What project management tool do you currently use, if any?",
          type: "text",
          required: false,
        },
        { id: "pm_team", label: "What's your team size?", type: "text", required: true },
        {
          id: "pm_bottleneck",
          label: "What's your biggest current bottleneck?",
          type: "select",
          required: true,
          options: ["Deadlines", "Communication", "Scope creep", "Resourcing", "Other"],
        },
      ],
    },
    {
      id: "analyst",
      name: "Data Analyst",
      blurb: "Reporting, insights and decision-ready dashboards.",
      icon: "bars",
      questions: [
        {
          id: "da_sources",
          label: "What data sources do you need analyzed?",
          type: "multi",
          required: true,
          options: ["Sales", "Marketing", "Ops", "Finance", "Product", "Other"],
        },
        {
          id: "da_tools",
          label: "What tools do you currently use for reporting?",
          type: "select",
          required: true,
          options: ["Excel", "Tableau", "Power BI", "Looker", "None", "Other"],
        },
        {
          id: "da_decisions",
          label: "What decisions do you want the data to support?",
          type: "textarea",
          required: true,
        },
        {
          id: "da_freq",
          label: "What's your reporting frequency need?",
          type: "select",
          required: true,
          options: ["Daily", "Weekly", "Monthly", "Quarterly", "On demand"],
        },
      ],
    },
    {
      id: "writer",
      name: "Content Writer / Copywriter",
      blurb: "Brand voice across blogs, sites, emails and ads.",
      icon: "pen",
      questions: [
        {
          id: "cw_type",
          label: "What type of content do you need?",
          type: "multi",
          required: true,
          options: ["Blog", "Website", "Email", "Ads", "Docs", "Other"],
        },
        {
          id: "cw_volume",
          label: "What's your target monthly content volume?",
          type: "text",
          required: true,
        },
        {
          id: "cw_voice",
          label: "Do you have brand voice/style guidelines?",
          type: "select",
          required: true,
          options: ["Yes", "Partial", "No"],
        },
        {
          id: "cw_seo",
          label: "Any SEO requirements?",
          type: "textarea",
          required: false,
        },
      ],
    },
    {
      id: "ea",
      name: "Executive Assistant",
      blurb: "Calendar, inbox triage, travel and scheduling.",
      icon: "calendar",
      questions: [
        {
          id: "ea_tasks",
          label: "What tasks do you need support with?",
          type: "multi",
          required: true,
          options: ["Calendar", "Email triage", "Travel", "Scheduling", "Research", "Other"],
        },
        {
          id: "ea_execs",
          label: "How many executives need support?",
          type: "text",
          required: true,
        },
        {
          id: "ea_tools",
          label: "What tools do you use for calendar/email?",
          type: "select",
          required: true,
          options: ["Google Workspace", "Outlook / Microsoft 365", "Mixed", "Other"],
        },
      ],
    },
    {
      id: "ops",
      name: "Operations Manager",
      blurb: "Vendors, logistics, scheduling and process clarity.",
      icon: "cog",
      questions: [
        {
          id: "ops_process",
          label: "What operational processes need support?",
          type: "multi",
          required: true,
          options: ["Logistics", "Vendor management", "Scheduling", "Inventory", "Other"],
        },
        {
          id: "ops_tools",
          label: "What tools/systems are currently in place?",
          type: "textarea",
          required: false,
        },
        {
          id: "ops_pain",
          label: "What's your biggest operational pain point right now?",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "it",
      name: "IT / Systems Support",
      blurb: "Help desk, monitoring and stack reliability.",
      icon: "server",
      questions: [
        { id: "it_stack", label: "What's your current tech stack?", type: "textarea", required: true },
        {
          id: "it_need",
          label: "Do you need help desk support, systems monitoring, or both?",
          type: "select",
          required: true,
          options: ["Help desk", "Systems monitoring", "Both"],
        },
        {
          id: "it_scale",
          label: "What's your team size and number of devices/systems to support?",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "legal",
      name: "Legal / Compliance Assistant",
      blurb: "Contracts, NDAs and compliance checklists.",
      icon: "scale",
      questions: [
        {
          id: "leg_docs",
          label: "What type of documents do you need support with?",
          type: "multi",
          required: true,
          options: ["Contracts", "NDAs", "Compliance checklists", "Policies", "Other"],
        },
        {
          id: "leg_regs",
          label: "What industry/regulatory requirements apply to you (if any)?",
          type: "textarea",
          required: false,
        },
        {
          id: "leg_templates",
          label: "Do you have existing templates, or do you need them created?",
          type: "select",
          required: true,
          options: ["Have templates", "Need templates created", "Mix of both"],
        },
      ],
    },
  ];

  const ICONS = {
    calculator: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h2M12 10h2M16 10h0M8 14h2M12 14h2M16 14h0M8 18h2M12 18h2M16 18h0"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19V5M4 19h16"/><path d="M8 16v-5M12 16V8M16 16v-8"/></svg>',
    megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 11v2a1 1 0 001 1h2l6 4V6L6 10H4a1 1 0 00-1 1z"/><path d="M15 9.5a3.5 3.5 0 010 5M18 7a7 7 0 010 10"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
    handshake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 12l3 3 8-8"/><path d="M3 12l5 5 2-2M14 7l3 3 4-1"/></svg>',
    headset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12a8 8 0 0116 0v5a2 2 0 01-2 2h-1v-6h3M4 13h3v6H5a1 1 0 01-1-1v-5z"/><path d="M12 19v1a2 2 0 002 2h1"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c0-3 2.5-5 6-5s6 2 6 5M14 19c.5-2 2-3.5 4.5-3.5 1.5 0 2.8.5 3.5 1.5"/></svg>',
    kanban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16M3 10h6M9 14h6"/></svg>',
    bars: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    cog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
    server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01"/></svg>',
    scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v18M5 7h14"/><path d="M5 7l-2 6h4L5 7zM19 7l-2 6h4l-2-6z"/></svg>',
  };

  const root = document.getElementById("intakeApp");
  if (!root) return;

  const state = {
    step: 1,
    contact: {
      name: "",
      company: "",
      email: "",
      phone: "",
      industry: "",
      companySize: "",
    },
    selected: new Set(),
    answers: {},
  };

  const els = {
    steps: [...root.querySelectorAll("[data-step-panel]")],
    progress: [...root.querySelectorAll("[data-progress-step]")],
    railFill: document.getElementById("intakeRailFill"),
    railStatus: document.getElementById("intakeRailStatus"),
    roleGrid: document.getElementById("roleGrid"),
    questionMount: document.getElementById("questionMount"),
    reviewMount: document.getElementById("reviewMount"),
    feedback: document.getElementById("intakeFeedback"),
    confirm: document.getElementById("intakeConfirm"),
    formShell: document.getElementById("intakeShell"),
  };

  const STEP_LABELS = {
    1: "Contact details",
    2: "Role selection",
    3: "Role questionnaire",
    4: "Review & submit",
  };

  const escapeHtml = (str) =>
    String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const roleById = (id) => ROLES.find((r) => r.id === id);

  const setFeedback = (msg, type = "") => {
    if (!els.feedback) return;
    if (!msg) {
      els.feedback.hidden = true;
      els.feedback.textContent = "";
      els.feedback.className = "intake-feedback";
      return;
    }
    els.feedback.hidden = false;
    els.feedback.textContent = msg;
    els.feedback.className = `intake-feedback${type ? ` is-${type}` : ""}`;
  };

  const readContactFromDom = () => {
    state.contact = {
      name: document.getElementById("spName")?.value.trim() || "",
      company: document.getElementById("spCompany")?.value.trim() || "",
      email: document.getElementById("spEmail")?.value.trim() || "",
      phone: document.getElementById("spPhone")?.value.trim() || "",
      industry: document.getElementById("spIndustry")?.value.trim() || "",
      companySize: document.getElementById("spSize")?.value || "",
    };
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep1 = () => {
    readContactFromDom();
    const { name, company, email, industry, companySize } = state.contact;
    if (!name || !company || !email || !industry || !companySize) {
      setFeedback("Please complete all required contact fields.", "error");
      return false;
    }
    if (!validateEmail(email)) {
      setFeedback("Please enter a valid email address.", "error");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!state.selected.size) {
      setFeedback("Select at least one role to continue.", "error");
      return false;
    }
    return true;
  };

  const collectAnswersFromDom = () => {
    state.selected.forEach((roleId) => {
      const role = roleById(roleId);
      if (!role) return;
      if (!state.answers[roleId]) state.answers[roleId] = {};
      role.questions.forEach((q) => {
        if (q.type === "multi") {
          const checked = [
            ...document.querySelectorAll(`input[name="${roleId}__${q.id}"]:checked`),
          ].map((el) => el.value);
          state.answers[roleId][q.id] = checked;
        } else {
          const el = document.querySelector(`[name="${roleId}__${q.id}"]`);
          state.answers[roleId][q.id] = el ? el.value.trim() : "";
        }
      });
    });
  };

  const validateStep3 = () => {
    collectAnswersFromDom();
    for (const roleId of state.selected) {
      const role = roleById(roleId);
      for (const q of role.questions) {
        if (!q.required) continue;
        const val = state.answers[roleId]?.[q.id];
        const empty = Array.isArray(val) ? !val.length : !val;
        if (empty) {
          setFeedback(`Please complete required questions for ${role.name}.`, "error");
          const section = document.getElementById(`role-section-${roleId}`);
          section?.classList.add("is-open");
          section?.scrollIntoView({ behavior: "smooth", block: "start" });
          return false;
        }
      }
    }
    return true;
  };

  const renderRoles = () => {
    if (!els.roleGrid) return;
    els.roleGrid.innerHTML = ROLES.map((role) => {
      const active = state.selected.has(role.id);
      return `
        <button type="button" class="role-card${active ? " is-selected" : ""}" data-role="${role.id}" aria-pressed="${active}">
          <span class="role-card__icon" aria-hidden="true">${ICONS[role.icon] || ICONS.cog}</span>
          <span class="role-card__body">
            <span class="role-card__name">${escapeHtml(role.name)}</span>
            <span class="role-card__blurb">${escapeHtml(role.blurb)}</span>
          </span>
          <span class="role-card__check" aria-hidden="true"></span>
        </button>
      `;
    }).join("");
  };

  const fieldHtml = (roleId, q) => {
    const name = `${roleId}__${q.id}`;
    const saved = state.answers[roleId]?.[q.id];
    const req = q.required ? "required" : "";
    const reqMark = q.required ? '<span class="req">*</span>' : "";

    if (q.type === "textarea") {
      return `
        <label class="intake-field">
          <span>${escapeHtml(q.label)} ${reqMark}</span>
          <textarea name="${name}" rows="3" class="contactInput" ${req}>${escapeHtml(saved || "")}</textarea>
        </label>`;
    }
    if (q.type === "select") {
      const opts = (q.options || [])
        .map((o) => `<option value="${escapeHtml(o)}" ${saved === o ? "selected" : ""}>${escapeHtml(o)}</option>`)
        .join("");
      return `
        <label class="intake-field">
          <span>${escapeHtml(q.label)} ${reqMark}</span>
          <select name="${name}" class="contactInput" ${req}>
            <option value="">Select…</option>
            ${opts}
          </select>
        </label>`;
    }
    if (q.type === "multi") {
      const selected = Array.isArray(saved) ? saved : [];
      const opts = (q.options || [])
        .map(
          (o) => `
          <label class="intake-check">
            <input type="checkbox" name="${name}" value="${escapeHtml(o)}" ${selected.includes(o) ? "checked" : ""}>
            <span>${escapeHtml(o)}</span>
          </label>`
        )
        .join("");
      return `
        <fieldset class="intake-field intake-field--multi">
          <legend>${escapeHtml(q.label)} ${reqMark}</legend>
          <div class="intake-check-grid">${opts}</div>
        </fieldset>`;
    }
    return `
      <label class="intake-field">
        <span>${escapeHtml(q.label)} ${reqMark}</span>
        <input type="text" name="${name}" class="contactInput" value="${escapeHtml(saved || "")}" ${req}>
      </label>`;
  };

  const renderQuestions = () => {
    if (!els.questionMount) return;
    const selectedRoles = [...state.selected].map(roleById).filter(Boolean);
    if (!selectedRoles.length) {
      els.questionMount.innerHTML = `<p class="intake-empty">Select at least one role first.</p>`;
      return;
    }
    els.questionMount.innerHTML = selectedRoles
      .map((role, idx) => {
        const open = idx === 0 ? " is-open" : "";
        return `
          <details class="role-section${open}" id="role-section-${role.id}" ${idx === 0 ? "open" : ""}>
            <summary>
              <span class="role-section__icon" aria-hidden="true">${ICONS[role.icon] || ICONS.cog}</span>
              <span>
                <strong>${escapeHtml(role.name)}</strong>
                <em>${role.questions.length} questions</em>
              </span>
            </summary>
            <div class="role-section__body">
              ${role.questions.map((q) => fieldHtml(role.id, q)).join("")}
            </div>
          </details>`;
      })
      .join("");
  };

  const formatAnswer = (val) => {
    if (Array.isArray(val)) return val.length ? val.join(", ") : "—";
    return val || "—";
  };

  const renderReview = () => {
    if (!els.reviewMount) return;
    readContactFromDom();
    collectAnswersFromDom();
    const c = state.contact;
    const roles = [...state.selected].map(roleById).filter(Boolean);

    const contactBlock = `
      <div class="review-block">
        <div class="review-block__head">
          <h3>Contact info</h3>
          <button type="button" class="text-link" data-goto="1">Edit</button>
        </div>
        <dl class="review-dl">
          <div><dt>Name</dt><dd>${escapeHtml(c.name)}</dd></div>
          <div><dt>Company</dt><dd>${escapeHtml(c.company)}</dd></div>
          <div><dt>Email</dt><dd>${escapeHtml(c.email)}</dd></div>
          <div><dt>Phone</dt><dd>${escapeHtml(c.phone || "—")}</dd></div>
          <div><dt>Industry</dt><dd>${escapeHtml(c.industry)}</dd></div>
          <div><dt>Company size</dt><dd>${escapeHtml(c.companySize)}</dd></div>
        </dl>
      </div>`;

    const rolesBlock = `
      <div class="review-block">
        <div class="review-block__head">
          <h3>Selected roles</h3>
          <button type="button" class="text-link" data-goto="2">Edit</button>
        </div>
        <ul class="review-tags">${roles.map((r) => `<li>${escapeHtml(r.name)}</li>`).join("")}</ul>
      </div>`;

    const qaBlocks = roles
      .map((role) => {
        const rows = role.questions
          .map(
            (q) => `
          <div>
            <dt>${escapeHtml(q.label)}</dt>
            <dd>${escapeHtml(formatAnswer(state.answers[role.id]?.[q.id]))}</dd>
          </div>`
          )
          .join("");
        return `
          <div class="review-block">
            <div class="review-block__head">
              <h3>${escapeHtml(role.name)}</h3>
              <button type="button" class="text-link" data-goto="3">Edit</button>
            </div>
            <dl class="review-dl">${rows}</dl>
          </div>`;
      })
      .join("");

    els.reviewMount.innerHTML = contactBlock + rolesBlock + qaBlocks;
  };

  const goToStep = (step) => {
    state.step = step;
    setFeedback("");

    els.steps.forEach((panel) => {
      const n = Number(panel.getAttribute("data-step-panel"));
      const show = n === step;
      if (show) {
        panel.hidden = false;
        panel.classList.remove("is-leaving");
        panel.style.animation = "none";
        void panel.offsetHeight;
        panel.style.animation = "";
      } else {
        panel.hidden = true;
      }
    });

    els.progress.forEach((item) => {
      const n = Number(item.getAttribute("data-progress-step"));
      const active = n === step;
      const done = n < step;
      item.classList.toggle("is-active", active);
      item.classList.toggle("is-done", done);
      const btn = item.querySelector(".intake-progress__btn");
      if (btn) {
        if (active) btn.setAttribute("aria-current", "step");
        else btn.removeAttribute("aria-current");
        btn.disabled = n > step;
      }
    });

    // Fill connects node centers: 0%, 33.33%, 66.66%, 100%
    if (els.railFill) {
      const pct = ((step - 1) / 3) * 100;
      els.railFill.style.width = `${pct}%`;
    }
    if (els.railStatus) {
      els.railStatus.innerHTML = `Step <strong>${step}</strong> of 4 — ${STEP_LABELS[step] || ""}`;
    }

    if (step === 2) renderRoles();
    if (step === 3) renderQuestions();
    if (step === 4) renderReview();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const buildEmailBody = () => {
    const c = state.contact;
    const roles = [...state.selected].map(roleById).filter(Boolean);
    const lines = [
      "NEW PROJECT REQUEST",
      "===================",
      "",
      "CONTACT INFO",
      `Name: ${c.name}`,
      `Company: ${c.company}`,
      `Email: ${c.email}`,
      `Phone: ${c.phone || "—"}`,
      `Industry: ${c.industry}`,
      `Company size: ${c.companySize}`,
      "",
      `Selected roles: ${roles.map((r) => r.name).join(", ")}`,
      "",
    ];
    roles.forEach((role) => {
      lines.push(`--- ${role.name.toUpperCase()} ---`);
      role.questions.forEach((q) => {
        lines.push(`Q: ${q.label}`);
        lines.push(`A: ${formatAnswer(state.answers[role.id]?.[q.id])}`);
        lines.push("");
      });
    });
    return lines.join("\n");
  };

  const buildPayload = () => {
    const c = state.contact;
    const roles = [...state.selected].map(roleById).filter(Boolean);
    const roleNames = roles.map((r) => r.name);
    const subject = `New Project Request - ${c.company} - ${roleNames.join(", ")}`;

    const payload = {
      _subject: subject,
      _template: "table",
      _captcha: "false",
      Name: c.name,
      Company: c.company,
      Email: c.email,
      Phone: c.phone || "—",
      Industry: c.industry,
      "Company Size": c.companySize,
      "Roles Selected": roleNames.join(", "),
      Message: buildEmailBody(),
    };

    roles.forEach((role) => {
      role.questions.forEach((q) => {
        payload[`[${role.name}] ${q.label}`] = formatAnswer(state.answers[role.id]?.[q.id]);
      });
    });

    return { subject, payload, roles: roleNames, contact: { ...c } };
  };

  const persistLocalBackup = (record) => {
    try {
      const key = "algoartisans_project_submissions";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({ ...record, savedAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing.slice(-40)));
    } catch (_) {
      /* ignore quota / private mode */
    }
  };

  const mirrorToSheet = async (record) => {
    if (!SHEET_WEBHOOK_URL) return;
    try {
      await fetch(SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
        mode: "no-cors",
      });
    } catch (_) {
      /* sheet backup is best-effort */
    }
  };

  const submitIntake = async () => {
    const honey = document.getElementById("spHoney");
    if (honey && honey.value) return;

    const { subject, payload, roles, contact } = buildPayload();
    const record = { subject, contact, roles, answers: state.answers, message: payload.Message };

    persistLocalBackup(record);
    mirrorToSheet(record);

    const res = await fetch(ENQUIRY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Unable to send project request");
    }
  };

  const showConfirmation = () => {
    if (els.formShell) els.formShell.hidden = true;
    if (els.confirm) {
      els.confirm.hidden = false;
      els.confirm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  root.addEventListener("click", (e) => {
    const roleBtn = e.target.closest("[data-role]");
    if (roleBtn) {
      const id = roleBtn.getAttribute("data-role");
      if (state.selected.has(id)) state.selected.delete(id);
      else state.selected.add(id);
      // Drop answers for deselected roles
      [...Object.keys(state.answers)].forEach((rid) => {
        if (!state.selected.has(rid)) delete state.answers[rid];
      });
      renderRoles();
      setFeedback("");
      return;
    }

    const goto = e.target.closest("[data-goto]");
    if (goto) {
      goToStep(Number(goto.getAttribute("data-goto")));
      return;
    }

    const jump = e.target.closest("[data-progress-jump]");
    if (jump) {
      const target = Number(jump.getAttribute("data-progress-jump"));
      if (target <= state.step) {
        if (state.step === 3) collectAnswersFromDom();
        goToStep(target);
      }
      return;
    }

    const next = e.target.closest("[data-next]");
    if (next) {
      const target = Number(next.getAttribute("data-next"));
      if (state.step === 1 && !validateStep1()) return;
      if (state.step === 2 && !validateStep2()) return;
      if (state.step === 3 && !validateStep3()) return;
      goToStep(target);
      return;
    }

    const back = e.target.closest("[data-back]");
    if (back) {
      collectAnswersFromDom();
      goToStep(Number(back.getAttribute("data-back")));
    }
  });

  const submitBtn = document.getElementById("intakeSubmit");
  submitBtn?.addEventListener("click", async () => {
    collectAnswersFromDom();
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      goToStep(1);
      return;
    }
    const original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setFeedback("");
    try {
      await submitIntake();
      showConfirmation();
    } catch (err) {
      setFeedback(
        "Could not send automatically. Please email algoartisans@gmail.com, or try again. A local backup of this request was still saved in this browser.",
        "error"
      );
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });

  goToStep(1);
})();
