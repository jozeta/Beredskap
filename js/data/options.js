/*
 * options.js — Enumerations used by the wizard, generator and library:
 * categories, archetypes, sectors, difficulties, audiences and so on.
 *
 * Each list holds ids only; labels come from i18n ("sector.<id>", …), so the
 * same id can be stored in an exercise and rendered in either language.
 */
(function () {
  "use strict";

  const BK = window.BK;

  BK.data.options = {
    categories: [
      "ransomware", "fraud", "ddos", "insider", "supply-chain", "cloud-privacy", "identity",
      "malware", "availability", "third-party", "ot-ics", "edr-soc", "social-engineering",
      "devsecops", "hacktivism", "multi-incident", "healthcare", "network-identity",
      "vulnerability", "executive-compound"
    ],

    // Spec section 13. Template `archetype` strings map to a letter for display and filtering.
    archetypes: {
      A: "obvious-incident-hidden-secondary",
      B: "ambiguous-start",
      C: "benign-lookalike",
      D: "third-party-origin",
      E: "compound-crisis",
      F: "human-legal-reputational"
    },

    sectors: [
      "logistics", "retail", "manufacturing", "energy", "healthcare", "finance",
      "public", "telecom", "education", "transport", "technology", "utilities"
    ],

    difficulties: ["introductory", "intermediate", "advanced", "executive"],
    durations: [30, 60, 90, 180],
    audiences: ["technical", "executive", "mixed"],
    sizes: ["small", "medium", "large"],
    jurisdictions: ["se", "eu", "generic"],
    pressures: ["media", "regulator", "lawEnforcement", "suppliers", "customers"],
    densities: ["low", "normal", "high"],
    injectRelease: ["manual", "timer"],
    decisionModes: ["open", "options"],

    // Stage bounds from the spec; individual templates narrow these.
    minStages: 3,
    maxStages: 10,

    // ---- Scenario vocabulary (spec 6) ----
    injectTypes: [
      "ticket", "siemAlert", "edrAlert", "authLog", "networkEvidence", "logExcerpt", "backupReport",
      "forensicFinding", "threatIntel", "advisory", "email", "phishingEmail", "employeeReport",
      "executiveMessage", "chat", "phoneTranscript", "sms", "customerComplaint", "supplierNotice",
      "mediaEnquiry", "newsHeadline", "socialPost", "regulatorLetter", "ransomNote", "statusPage",
      "impactReport"
    ],
    severities: ["info", "low", "medium", "high", "critical"],
    reliabilities: ["confirmed", "unverified", "misleading", "disputed"],
    // Twist kinds: "cause" and "scope" change understanding of the incident (validator needs ≥ 2).
    chartTypes: ["line", "bar", "kpi", "gauge", "donut", "dependency", "blast", "rto", "timeline"],
    twistKinds: ["cause", "scope", "impact", "authority"],
    startWindows: ["any", "business-hours", "friday-evening", "weekend", "night", "holiday-eve", "monday-morning"],
    actorTypes: ["criminal", "state", "hacktivist", "insider", "unknown"],
    capabilityTiers: ["low", "medium", "high"],
    sources: [
      "serviceDesk", "soc", "edr", "siem", "itOps", "backupSystem", "irRetainer", "threatIntel", "csirt",
      "vendor", "media", "regulator", "police", "customer", "supplier", "employee", "attacker", "insurer",
      "bank", "msp", "socialMedia", "management", "forensics", "facilities"
    ]
  };

  // Ordering helpers for difficulty gating ("minDifficulty") and severity sorting.
  BK.data.options.difficultyRank = function (d) {
    return Math.max(0, BK.data.options.difficulties.indexOf(d));
  };
  BK.data.options.severityRank = function (s) {
    return Math.max(0, BK.data.options.severities.indexOf(s));
  };

  /** Archetype letter (A–F) for a template archetype string, or the string itself if unknown. */
  BK.data.options.archetypeLetter = function (archetype) {
    const map = BK.data.options.archetypes;
    return Object.keys(map).find((k) => map[k] === archetype) || archetype;
  };
})();
