/*
 * i18n.js — UI strings (English/Swedish), the t() lookup helper, localisation of
 * bilingual content objects ({ en, sv }), Intl-based formatters and a
 * missing-key report.
 *
 * Scenario content is NOT stored here; templates carry their own { en, sv } text.
 * "Beredskap" is a proper noun and appears untranslated in both languages.
 */
(function () {
  "use strict";

  const BK = window.BK;

  const LOCALES = { en: "en-GB", sv: "sv-SE" };
  const LANGS = ["en", "sv"];

  const strings = {
    en: {
      "app.name": "Beredskap",
      "app.tagline": "Cyber crisis exercises",
      "app.skip": "Skip to content",
      "app.exerciseBanner": "EXERCISE — fictional scenario",

      "nav.label": "Main navigation",
      "nav.dashboard": "Dashboard",
      "nav.library": "Scenario library",
      "nav.new": "New exercise",
      "nav.history": "History",
      "nav.settings": "Settings",

      "lang.en": "English",
      "lang.sv": "Svenska",
      "lang.switch": "Language",
      "theme.label": "Theme",
      "theme.toggle": "Change theme (currently {mode})",
      "theme.light": "Light",
      "theme.dark": "Dark",
      "theme.system": "System",

      "status.saving": "Saving…",
      "status.saved": "Saved {time}",
      "status.memory": "Not saved — storage unavailable",
      "status.error": "Not saved",

      "common.cancel": "Cancel",
      "common.confirm": "Confirm",
      "common.close": "Close",
      "common.back": "Back",
      "common.delete": "Delete",
      "common.reset": "Reset",
      "common.later": "Later",
      "common.add": "Add",
      "common.remove": "Remove",
      "common.minutes": "{n} min",
      "common.stageRange": "{min}–{max} stages",
      "common.any": "Any",
      "common.random": "Random",
      "common.optional": "Optional",
      "common.notBuilt.title": "Not available yet",
      "common.notBuilt.body": "This view is added in a later build phase.",

      "notFound.title": "Page not found",
      "notFound.body": "The address does not match any view in Beredskap.",
      "notFound.home": "Go to dashboard",

      "dashboard.title": "Dashboard",
      "dashboard.intro": "Generate a tabletop cyber crisis exercise, preview it privately, then run it full-screen for the room.",
      "dashboard.quick.title": "Quick start",
      "dashboard.quick.body": "Choose a scenario, generate, preview, start. With default settings this takes less than a minute.",
      "dashboard.quick.new": "New exercise",
      "dashboard.quick.surprise": "Surprise me",
      "dashboard.quick.library": "Browse scenarios",
      "dashboard.resume.title": "Active session",
      "dashboard.resume.empty": "No exercise is running right now.",
      "dashboard.resume.action": "Resume",
      "dashboard.recent.title": "Recent exercises",
      "dashboard.recent.empty": "Exercises you generate will appear here.",
      "dashboard.recent.open": "Open",
      "dashboard.scenarioCount": "{n} scenarios available",

      "library.title": "Scenario library",
      "library.intro": "Professionally authored templates. Every generation varies organisation, people, threat actor and numbers while the incident logic stays the same.",
      "library.search": "Search scenarios",
      "library.searchPlaceholder": "Title, technique, objective…",
      "library.category": "Category",
      "library.archetype": "Structure",
      "library.allCategories": "All categories",
      "library.allArchetypes": "All structures",
      "library.count": "{n} of {total} scenarios",
      "library.empty": "No scenario templates are installed yet.",
      "library.noMatch": "No scenarios match these filters.",
      "library.objectives": "Learning objectives",
      "library.attack": "MITRE ATT&CK",
      "library.preview": "Preview",
      "library.use": "Use scenario",
      "library.stagesOutline": "Stage outline",
      "library.invalid": "{n} validation problem(s)",

      "category.ransomware": "Ransomware",
      "category.fraud": "Fraud / phishing",
      "category.ddos": "DDoS / availability",
      "category.insider": "Insider threat",
      "category.supply-chain": "Supply chain",
      "category.cloud-privacy": "Cloud / privacy",
      "category.identity": "Phishing / identity",
      "category.malware": "Malware",
      "category.availability": "Availability / DR",
      "category.third-party": "Third party",
      "category.ot-ics": "OT / ICS",
      "category.edr-soc": "EDR / SOC",
      "category.social-engineering": "Social engineering",
      "category.devsecops": "DevSecOps",
      "category.hacktivism": "Hacktivism",
      "category.multi-incident": "Multi-incident",
      "category.healthcare": "Healthcare",
      "category.network-identity": "Network / identity",
      "category.vulnerability": "Vulnerability",
      "category.executive-compound": "Executive / compound",

      "archetype.A": "Obvious incident, hidden secondary attack",
      "archetype.B": "Ambiguous start",
      "archetype.C": "Legitimate activity or fault that resembles an attack",
      "archetype.D": "Third-party or external origin",
      "archetype.E": "Multi-incident, compound crisis",
      "archetype.F": "Human, legal or reputational crisis first",

      "wizard.title": "New exercise",
      "wizard.intro": "Defaults give a sound exercise. Open Advanced to tailor the organisation, environment and external pressure.",
      "wizard.basic": "Basic",
      "wizard.advanced": "Advanced",
      "wizard.exerciseTitle": "Exercise title",
      "wizard.exerciseTitleHint": "Leave empty to use the scenario title.",
      "wizard.scenario": "Scenario",
      "wizard.scenarioSurprise": "Surprise me (random scenario)",
      "wizard.randomCategory": "Random within category",
      "wizard.language": "Exercise language",
      "wizard.difficulty": "Difficulty",
      "wizard.duration": "Duration",
      "wizard.durationCustom": "Custom",
      "wizard.durationCustomLabel": "Custom duration in minutes",
      "wizard.stages": "Number of stages",
      "wizard.stagesHint": "{min}–{max} for this scenario.",
      "wizard.stagesRandom": "Set from the scenario when it is drawn.",
      "wizard.audience": "Audience",
      "wizard.stageTheme": "Stage theme",
      "wizard.sector": "Sector",
      "wizard.sectorRandom": "Random (suited to the scenario)",
      "wizard.orgSize": "Organisation size",
      "wizard.orgName": "Organisation name",
      "wizard.orgNameHint": "Optional. Leave empty for a generated fictional name.",
      "wizard.environment": "Technology environment",
      "wizard.environmentHint": "Changes vocabulary only, e.g. “EDR alert” becomes “Defender for Endpoint alert”.",
      "wizard.jurisdiction": "Jurisdiction",
      "wizard.pressures": "External pressure",
      "wizard.pressuresHint": "Turning one off removes or replaces the injects tagged with it.",
      "wizard.density": "Inject density per stage",
      "wizard.roles": "Participating roles",
      "wizard.rolesHint": "Injects aimed at an absent role are re-targeted or flagged “Role not present — who covers this?”.",
      "wizard.useRealNames": "Use real participant names",
      "wizard.participantName": "Participant name for {role}",
      "wizard.participantPlaceholder": "Name (optional)",
      "wizard.objectives": "Learning objectives",
      "wizard.objectivesEmpty": "Choose a specific scenario to see its learning objectives.",
      "wizard.objectiveCustom": "Add your own objective",
      "wizard.objectiveCustomPlaceholder": "e.g. Test the new escalation chart",
      "wizard.discussion": "Discussion time per stage (minutes)",
      "wizard.discussionHint": "Leave empty to derive it from the total duration.",
      "wizard.injectRelease": "Inject release",
      "wizard.decisionMode": "Decision recording",
      "wizard.seed": "Seed",
      "wizard.seedHint": "Same scenario, settings and seed always produce the same exercise.",
      "wizard.reroll": "Reroll",
      "wizard.generate": "Generate exercise",
      "wizard.noScenarios": "No scenario templates are installed, so nothing can be generated yet.",
      "wizard.engineMissing": "Settings captured. The generator is added in build phase 2.",

      "difficulty.introductory": "Introductory",
      "difficulty.introductory.hint": "Clear evidence, basic response",
      "difficulty.intermediate": "Intermediate",
      "difficulty.intermediate.hint": "Cross-team coordination",
      "difficulty.advanced": "Advanced",
      "difficulty.advanced.hint": "Ambiguous and misleading evidence, conflicting priorities",
      "difficulty.executive": "Executive",
      "difficulty.executive.hint": "Continuity, legal, reputation, decision authority",

      "audience.technical": "Technical",
      "audience.technical.hint": "SOC, IT and incident response",
      "audience.executive": "Executive",
      "audience.executive.hint": "Crisis leadership",
      "audience.mixed": "Mixed",
      "audience.mixed.hint": "Draws from both question sets",

      "size.small": "Small",
      "size.medium": "Medium",
      "size.large": "Large",

      "sector.logistics": "Logistics",
      "sector.retail": "Retail",
      "sector.manufacturing": "Manufacturing",
      "sector.energy": "Energy",
      "sector.healthcare": "Healthcare",
      "sector.finance": "Financial services",
      "sector.public": "Public administration",
      "sector.telecom": "Telecommunications",
      "sector.education": "Education",
      "sector.transport": "Transport",
      "sector.technology": "Software and IT services",
      "sector.utilities": "Water and utilities",

      "env.generic": "Generic",
      "env.m365": "Microsoft 365 / Entra / Azure",
      "env.google": "Google Workspace / GCP",
      "env.aws": "AWS",
      "env.onprem": "On-premises",
      "env.hybrid": "Hybrid",
      "env.otics": "OT / ICS",

      "jurisdiction.se": "Sweden",
      "jurisdiction.eu": "EU",
      "jurisdiction.generic": "Generic",

      "pressure.media": "Media",
      "pressure.regulator": "Regulator",
      "pressure.lawEnforcement": "Law enforcement",
      "pressure.suppliers": "Suppliers",
      "pressure.customers": "Customer escalation",

      "density.low": "Low",
      "density.normal": "Normal",
      "density.high": "High",

      "release.manual": "Facilitator-controlled",
      "release.timer": "Auto-suggested on timer",

      "decisionMode.open": "Open-ended only",
      "decisionMode.options": "Open-ended + options where authored",

      "history.title": "History",
      "history.intro": "Past sessions, their debriefs and exports.",
      "history.empty": "No sessions have been run yet.",

      "settings.title": "Settings",
      "settings.general": "General",
      "settings.language": "Language",
      "settings.uiTheme": "Application theme",
      "settings.stageTheme": "Default stage theme",
      "settings.stageThemeHint": "A dark stage usually reads better in a dim room.",
      "settings.defaultDuration": "Default exercise duration",
      "settings.data": "Local data",
      "settings.dataBody": "Everything is stored in this browser only. Nothing is sent anywhere.",
      "settings.dataCount": "{n} saved items",
      "settings.exportRaw": "Export raw data",
      "settings.clearAll": "Clear all local data",
      "settings.clear1.title": "Clear all local data?",
      "settings.clear1.body": "This deletes every saved exercise, session, debrief and preference in this browser.",
      "settings.clear1.confirm": "Continue",
      "settings.clear2.title": "Are you absolutely sure?",
      "settings.clear2.body": "This cannot be undone. Export anything you want to keep first.",
      "settings.clear2.confirm": "Delete everything",
      "settings.cleared": "All local data has been deleted.",

      "error.storageUnavailable": "Browser storage is unavailable (private mode or blocked). Work is kept only until this tab closes — export anything you want to keep.",
      "error.quota": "Browser storage is full, so the last change was not saved. Export and delete old exercises to free space.",
      "error.write": "The last change could not be saved to browser storage.",
      "error.corrupt.title": "Some saved data could not be read",
      "error.corrupt.body": "{n} saved item(s) are damaged or come from a newer version of Beredskap. Export the raw data first if you may need it, then reset the damaged items.",
      "error.corrupt.export": "Export raw data",
      "error.corrupt.reset": "Reset damaged items",
      "error.corrupt.done": "Damaged items were removed.",
      "error.fullscreen": "Fullscreen was not allowed. Press F11 to present full-screen.",
      "error.import": "The file could not be imported: {reason}",
      "error.validation": "The exercise cannot start until these problems are fixed:"
    },

    sv: {
      "app.name": "Beredskap",
      "app.tagline": "Övningar i cyberkris",
      "app.skip": "Hoppa till innehållet",
      "app.exerciseBanner": "ÖVNING — fiktivt scenario",

      "nav.label": "Huvudmeny",
      "nav.dashboard": "Översikt",
      "nav.library": "Scenariobibliotek",
      "nav.new": "Ny övning",
      "nav.history": "Historik",
      "nav.settings": "Inställningar",

      "lang.en": "English",
      "lang.sv": "Svenska",
      "lang.switch": "Språk",
      "theme.label": "Tema",
      "theme.toggle": "Byt tema (nu: {mode})",
      "theme.light": "Ljust",
      "theme.dark": "Mörkt",
      "theme.system": "System",

      "status.saving": "Sparar…",
      "status.saved": "Sparat {time}",
      "status.memory": "Inte sparat — lagring saknas",
      "status.error": "Inte sparat",

      "common.cancel": "Avbryt",
      "common.confirm": "Bekräfta",
      "common.close": "Stäng",
      "common.back": "Tillbaka",
      "common.delete": "Radera",
      "common.reset": "Återställ",
      "common.later": "Senare",
      "common.add": "Lägg till",
      "common.remove": "Ta bort",
      "common.minutes": "{n} min",
      "common.stageRange": "{min}–{max} skeden",
      "common.any": "Valfri",
      "common.random": "Slumpvis",
      "common.optional": "Valfritt",
      "common.notBuilt.title": "Inte tillgängligt ännu",
      "common.notBuilt.body": "Den här vyn byggs i en senare fas.",

      "notFound.title": "Sidan finns inte",
      "notFound.body": "Adressen motsvarar ingen vy i Beredskap.",
      "notFound.home": "Till översikten",

      "dashboard.title": "Översikt",
      "dashboard.intro": "Skapa en diskussionsövning i cyberkris, granska den i förväg och genomför den sedan i helskärm för gruppen.",
      "dashboard.quick.title": "Kom igång",
      "dashboard.quick.body": "Välj scenario, generera, granska och starta. Med standardinställningarna tar det under en minut.",
      "dashboard.quick.new": "Ny övning",
      "dashboard.quick.surprise": "Överraska mig",
      "dashboard.quick.library": "Bläddra bland scenarier",
      "dashboard.resume.title": "Pågående övning",
      "dashboard.resume.empty": "Ingen övning pågår just nu.",
      "dashboard.resume.action": "Fortsätt",
      "dashboard.recent.title": "Senaste övningar",
      "dashboard.recent.empty": "Övningar du skapar visas här.",
      "dashboard.recent.open": "Öppna",
      "dashboard.scenarioCount": "{n} scenarier tillgängliga",

      "library.title": "Scenariobibliotek",
      "library.intro": "Professionellt författade mallar. Varje generering varierar organisation, personer, hotaktör och siffror medan händelseförloppets logik består.",
      "library.search": "Sök scenarier",
      "library.searchPlaceholder": "Titel, teknik, lärandemål…",
      "library.category": "Kategori",
      "library.archetype": "Struktur",
      "library.allCategories": "Alla kategorier",
      "library.allArchetypes": "Alla strukturer",
      "library.count": "{n} av {total} scenarier",
      "library.empty": "Inga scenariomallar är installerade ännu.",
      "library.noMatch": "Inga scenarier matchar filtren.",
      "library.objectives": "Lärandemål",
      "library.attack": "MITRE ATT&CK",
      "library.preview": "Förhandsgranska",
      "library.use": "Använd scenariot",
      "library.stagesOutline": "Skeden i korthet",
      "library.invalid": "{n} valideringsfel",

      "category.ransomware": "Ransomware",
      "category.fraud": "Bedrägeri / nätfiske",
      "category.ddos": "Överbelastning / tillgänglighet",
      "category.insider": "Insiderhot",
      "category.supply-chain": "Leverantörskedja",
      "category.cloud-privacy": "Moln / dataskydd",
      "category.identity": "Nätfiske / identitet",
      "category.malware": "Skadlig kod",
      "category.availability": "Tillgänglighet / katastrofåterställning",
      "category.third-party": "Tredje part",
      "category.ot-ics": "OT / industriella styrsystem",
      "category.edr-soc": "EDR / SOC",
      "category.social-engineering": "Social manipulation",
      "category.devsecops": "DevSecOps",
      "category.hacktivism": "Hacktivism",
      "category.multi-incident": "Flera samtidiga incidenter",
      "category.healthcare": "Hälso- och sjukvård",
      "category.network-identity": "Nätverk / identitet",
      "category.vulnerability": "Sårbarhet",
      "category.executive-compound": "Ledning / sammansatt kris",

      "archetype.A": "Uppenbar incident, dold sekundär attack",
      "archetype.B": "Otydlig början",
      "archetype.C": "Legitim aktivitet eller fel som liknar en attack",
      "archetype.D": "Ursprung hos tredje part eller externt",
      "archetype.E": "Flera incidenter, sammansatt kris",
      "archetype.F": "Mänsklig, juridisk eller anseendekris först",

      "wizard.title": "Ny övning",
      "wizard.intro": "Standardvalen ger en välbalanserad övning. Öppna Avancerat för att anpassa organisation, teknikmiljö och yttre tryck.",
      "wizard.basic": "Grundinställningar",
      "wizard.advanced": "Avancerat",
      "wizard.exerciseTitle": "Övningens namn",
      "wizard.exerciseTitleHint": "Lämna tomt för att använda scenariots titel.",
      "wizard.scenario": "Scenario",
      "wizard.scenarioSurprise": "Överraska mig (slumpat scenario)",
      "wizard.randomCategory": "Slumpa inom kategori",
      "wizard.language": "Övningens språk",
      "wizard.difficulty": "Svårighetsgrad",
      "wizard.duration": "Längd",
      "wizard.durationCustom": "Egen",
      "wizard.durationCustomLabel": "Egen längd i minuter",
      "wizard.stages": "Antal skeden",
      "wizard.stagesHint": "{min}–{max} för det här scenariot.",
      "wizard.stagesRandom": "Bestäms av scenariot när det har slumpats.",
      "wizard.audience": "Målgrupp",
      "wizard.stageTheme": "Tema för presentationen",
      "wizard.sector": "Sektor",
      "wizard.sectorRandom": "Slumpvis (passande för scenariot)",
      "wizard.orgSize": "Organisationens storlek",
      "wizard.orgName": "Organisationens namn",
      "wizard.orgNameHint": "Valfritt. Lämna tomt för ett genererat fiktivt namn.",
      "wizard.environment": "Teknikmiljö",
      "wizard.environmentHint": "Påverkar bara ordvalen, t.ex. blir ”EDR-larm” ”Defender for Endpoint-larm”.",
      "wizard.jurisdiction": "Jurisdiktion",
      "wizard.pressures": "Yttre tryck",
      "wizard.pressuresHint": "Om du stänger av ett tryck tas de inspel som hör till det bort eller ersätts.",
      "wizard.density": "Mängd inspel per skede",
      "wizard.roles": "Deltagande roller",
      "wizard.rolesHint": "Inspel till en roll som saknas styrs om eller markeras ”Rollen saknas — vem tar det här?”.",
      "wizard.useRealNames": "Använd deltagarnas riktiga namn",
      "wizard.participantName": "Deltagarens namn för {role}",
      "wizard.participantPlaceholder": "Namn (valfritt)",
      "wizard.objectives": "Lärandemål",
      "wizard.objectivesEmpty": "Välj ett specifikt scenario för att se dess lärandemål.",
      "wizard.objectiveCustom": "Lägg till eget lärandemål",
      "wizard.objectiveCustomPlaceholder": "t.ex. Pröva den nya eskaleringsrutinen",
      "wizard.discussion": "Diskussionstid per skede (minuter)",
      "wizard.discussionHint": "Lämna tomt för att räkna fram tiden från övningens längd.",
      "wizard.injectRelease": "Släpp av inspel",
      "wizard.decisionMode": "Beslutsregistrering",
      "wizard.seed": "Frö",
      "wizard.seedHint": "Samma scenario, inställningar och frö ger alltid exakt samma övning.",
      "wizard.reroll": "Slumpa om",
      "wizard.generate": "Generera övning",
      "wizard.noScenarios": "Inga scenariomallar är installerade, så inget kan genereras ännu.",
      "wizard.engineMissing": "Inställningarna är sparade. Generatorn byggs i fas 2.",

      "difficulty.introductory": "Grundläggande",
      "difficulty.introductory.hint": "Tydliga spår, grundläggande hantering",
      "difficulty.intermediate": "Medel",
      "difficulty.intermediate.hint": "Samordning mellan team",
      "difficulty.advanced": "Avancerad",
      "difficulty.advanced.hint": "Tvetydiga och vilseledande spår, motstridiga prioriteringar",
      "difficulty.executive": "Ledningsnivå",
      "difficulty.executive.hint": "Kontinuitet, juridik, anseende, beslutsmandat",

      "audience.technical": "Teknisk",
      "audience.technical.hint": "SOC, IT och incidenthantering",
      "audience.executive": "Ledning",
      "audience.executive.hint": "Krisledningsgrupp",
      "audience.mixed": "Blandad",
      "audience.mixed.hint": "Hämtar frågor från båda frågeuppsättningarna",

      "size.small": "Liten",
      "size.medium": "Medelstor",
      "size.large": "Stor",

      "sector.logistics": "Logistik",
      "sector.retail": "Handel",
      "sector.manufacturing": "Tillverkning",
      "sector.energy": "Energi",
      "sector.healthcare": "Hälso- och sjukvård",
      "sector.finance": "Finans",
      "sector.public": "Offentlig förvaltning",
      "sector.telecom": "Telekommunikation",
      "sector.education": "Utbildning",
      "sector.transport": "Transport",
      "sector.technology": "Mjukvara och IT-tjänster",
      "sector.utilities": "Vatten och försörjning",

      "env.generic": "Generisk",
      "env.m365": "Microsoft 365 / Entra / Azure",
      "env.google": "Google Workspace / GCP",
      "env.aws": "AWS",
      "env.onprem": "Egen drift (on-premises)",
      "env.hybrid": "Hybrid",
      "env.otics": "OT / industriella styrsystem",

      "jurisdiction.se": "Sverige",
      "jurisdiction.eu": "EU",
      "jurisdiction.generic": "Generisk",

      "pressure.media": "Media",
      "pressure.regulator": "Tillsynsmyndighet",
      "pressure.lawEnforcement": "Polis",
      "pressure.suppliers": "Leverantörer",
      "pressure.customers": "Kundeskalering",

      "density.low": "Låg",
      "density.normal": "Normal",
      "density.high": "Hög",

      "release.manual": "Styrs av övningsledaren",
      "release.timer": "Föreslås automatiskt enligt tid",

      "decisionMode.open": "Endast fritext",
      "decisionMode.options": "Fritext + svarsalternativ där de finns",

      "history.title": "Historik",
      "history.intro": "Tidigare genomföranden, deras utvärderingar och exporter.",
      "history.empty": "Inga övningar har genomförts ännu.",

      "settings.title": "Inställningar",
      "settings.general": "Allmänt",
      "settings.language": "Språk",
      "settings.uiTheme": "Programmets tema",
      "settings.stageTheme": "Standardtema för presentationen",
      "settings.stageThemeHint": "Ett mörkt tema brukar synas bättre i ett nedsläckt rum.",
      "settings.defaultDuration": "Standardlängd för övningar",
      "settings.data": "Lokal data",
      "settings.dataBody": "Allt lagras bara i den här webbläsaren. Ingenting skickas någonstans.",
      "settings.dataCount": "{n} sparade poster",
      "settings.exportRaw": "Exportera rådata",
      "settings.clearAll": "Radera all lokal data",
      "settings.clear1.title": "Radera all lokal data?",
      "settings.clear1.body": "Alla sparade övningar, genomföranden, utvärderingar och inställningar i den här webbläsaren raderas.",
      "settings.clear1.confirm": "Fortsätt",
      "settings.clear2.title": "Är du helt säker?",
      "settings.clear2.body": "Det går inte att ångra. Exportera först det du vill behålla.",
      "settings.clear2.confirm": "Radera allt",
      "settings.cleared": "All lokal data har raderats.",

      "error.storageUnavailable": "Webbläsarens lagring är inte tillgänglig (privat läge eller blockerad). Arbetet finns bara kvar tills fliken stängs — exportera det du vill behålla.",
      "error.quota": "Webbläsarens lagring är full, så den senaste ändringen sparades inte. Exportera och radera gamla övningar för att frigöra utrymme.",
      "error.write": "Den senaste ändringen kunde inte sparas i webbläsarens lagring.",
      "error.corrupt.title": "Viss sparad data kunde inte läsas",
      "error.corrupt.body": "{n} sparade poster är skadade eller kommer från en nyare version av Beredskap. Exportera rådatan först om du kan behöva den, och återställ sedan de skadade posterna.",
      "error.corrupt.export": "Exportera rådata",
      "error.corrupt.reset": "Återställ skadade poster",
      "error.corrupt.done": "De skadade posterna har tagits bort.",
      "error.fullscreen": "Helskärm tilläts inte. Tryck på F11 för att visa i helskärm.",
      "error.import": "Filen kunde inte importeras: {reason}",
      "error.validation": "Övningen kan inte startas förrän de här problemen är åtgärdade:"
    }
  };

  let current = "en";
  const missing = new Set(); // "sv:some.key" entries seen at runtime

  function interpolate(str, vars) {
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
  }

  /** Translate a UI key. Falls back to English, then to the key itself. */
  function t(key, vars, lang) {
    const l = lang || current;
    let str = strings[l] && strings[l][key];
    if (str === undefined) {
      missing.add(l + ":" + key);
      str = strings.en[key];
      if (str === undefined) str = key;
    }
    return interpolate(str, vars);
  }

  /** Pick the right language from bilingual content ({ en, sv }). Falls back to English. */
  function loc(obj, lang) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj;
    const l = lang || current;
    if (obj[l] != null && obj[l] !== "") return obj[l];
    return obj.en != null ? obj.en : "";
  }

  function setLang(lang, opts) {
    const next = LANGS.includes(lang) ? lang : "en";
    current = next;
    document.documentElement.lang = next;
    if (!(opts && opts.silent)) BK.events.emit("lang", next);
  }

  function getLang() {
    return current;
  }

  function locale(lang) {
    return LOCALES[lang || current];
  }

  // ---- Formatters -------------------------------------------------------------

  const fmt = {
    number(n, lang) {
      return new Intl.NumberFormat(locale(lang)).format(n);
    },
    /** Swedish uses SEK and English EUR by default; callers override for jurisdiction. */
    currency(n, currency, lang) {
      const l = lang || current;
      const cur = currency || (l === "sv" ? "SEK" : "EUR");
      return new Intl.NumberFormat(locale(l), { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
    },
    date(d, lang) {
      return new Intl.DateTimeFormat(locale(lang), { year: "numeric", month: "long", day: "numeric" }).format(d);
    },
    weekdayDate(d, lang) {
      return new Intl.DateTimeFormat(locale(lang), { weekday: "long", day: "numeric", month: "long" }).format(d);
    },
    /** 24-hour clock in both languages. */
    time(d, lang) {
      return new Intl.DateTimeFormat(locale(lang), { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
    },
    dateTime(d, lang) {
      return fmt.date(d, lang) + " " + fmt.time(d, lang);
    }
  };

  /** Keys present in one language table but absent in the other, plus runtime misses. */
  function missingReport() {
    const en = Object.keys(strings.en);
    const sv = Object.keys(strings.sv);
    return {
      missingInSv: en.filter((k) => !(k in strings.sv)),
      missingInEn: sv.filter((k) => !(k in strings.en)),
      runtime: Array.from(missing)
    };
  }

  if (BK.config.debug) {
    window.addEventListener("load", () => {
      const r = missingReport();
      if (r.missingInSv.length || r.missingInEn.length || r.runtime.length) {
        console.warn("[Beredskap i18n] missing keys", r);
      }
    });
  }

  BK.i18n = { strings, LANGS, t, loc, setLang, getLang, locale, fmt, missingReport };
  BK.t = t;
  BK.loc = loc;
})();
