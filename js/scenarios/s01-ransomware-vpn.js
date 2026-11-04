/*
 * s01-ransomware-vpn.js — "Locked Out at Close of Business" (archetype A).
 *
 * Reference implementation of the template model (spec section 6). Backbone:
 * Friday-evening encryption via an unpatched VPN → backups were encrypted 48 h
 * earlier → initial access was valid credentials, five days ago → exfiltration
 * revealed (double extortion) → leak-site countdown → CEO demands a Monday
 * restore while identity is not clean → customers defrauded with stolen invoices
 * → recovery order and residual-risk ownership.
 *
 * Ground truth (fixed for every generation; minutes relative to T+0):
 *   -43200  contractor's VPN password appears in an infostealer log
 *   -30240  vendor advisory for the VPN appliance; secondary node left unpatched
 *   -7200   first VPN session with the contractor account (MFA bypassed via the flaw)
 *   -5760   reconnaissance; credential dumping on the jump host
 *   -5600   persistence: scheduled task on the DC recreates a service account nightly
 *   -4320   backup admin account used interactively; exfiltration night 1 (of 3)
 *   -2880   backup repositories encrypted, retention policy altered
 *   -60     EDR on file servers switched to audit mode with an admin account
 *   -20     encryption starts
 *   0       first service-desk ticket
 */
(function () {
  "use strict";

  const BK = window.BK;

  // ---- Chart data helpers (derived from ground truth and rolled variables) ----------------

  /** File modifications per minute on the file server: flat baseline, then the encryption surge at T-20. */
  function fileModRate(ctx) {
    const peak = Math.round(900 + ctx.vars.servers * 40);
    const points = [];
    for (let t = -120; t <= 20; t += 5) {
      let y;
      if (t < -20) y = 25 + ctx.rng.int(0, 30);
      else y = Math.round(40 + (peak - 40) * (1 - Math.exp(-(t + 20) / 9)) + ctx.rng.int(-40, 40));
      points.push([t, Math.max(0, y)]);
    }
    return { xUnit: "minutes", series: [{ id: "mods", label: { en: "File operations", sv: "Filoperationer" }, points }] };
  }

  /** Backup jobs for the last 7 days: successful until the repositories were encrypted (T-48 h). */
  function backupJobs() {
    const days = [-7, -6, -5, -4, -3, -2, -1];
    return {
      categories: days,
      categoryUnit: "days",
      series: [
        { id: "ok", label: { en: "Completed", sv: "Slutförda" }, values: days.map((d) => (d < -2 ? 14 : 0)), tone: "ok" },
        { id: "warn", label: { en: "Completed with warnings", sv: "Slutförda med varningar" }, values: days.map((d) => (d < -2 ? 0 : 14)), tone: "warn" }
      ]
    };
  }

  /** VPN sign-ins for the contractor account: daytime habit, then night sessions from day -5. */
  function vpnSignIns(ctx) {
    const days = [];
    for (let d = -14; d <= -1; d++) days.push(d);
    return {
      categories: days,
      categoryUnit: "days",
      series: [
        { id: "day", label: { en: "Daytime (06–22)", sv: "Dagtid (06–22)" }, values: days.map(() => 1 + ctx.rng.int(0, 1)) },
        { id: "night", label: { en: "Night (22–06)", sv: "Natt (22–06)" }, values: days.map((d) => (d >= -5 ? 2 + ctx.rng.int(0, 3) : 0)) }
      ]
    };
  }

  /** Outbound data to cloud storage per night: three nights carry the exfiltration. */
  function outboundPerNight(ctx) {
    const total = ctx.vars.gbExfil;
    const share = [0.28, 0.41, 0.31];
    const points = [];
    for (let n = -7; n <= -1; n++) {
      const exfilIndex = n - -3; // nights -3, -2, -1 → 0, 1, 2
      const base = 1 + ctx.rng.int(0, 3);
      points.push([n, exfilIndex >= 0 && exfilIndex < 3 ? Math.round(total * share[exfilIndex]) + base : base]);
    }
    return { xUnit: "nights", series: [{ id: "gb", label: { en: "GB sent to cloud storage", sv: "GB skickat till molnlagring" }, points }] };
  }

  /** Service dependency picture with identity marked as compromised. */
  function dependencies(ctx) {
    const services = ctx.org.services;
    const platform = BK.data.sectors.PLATFORM;
    const used = new Set();
    Object.values(services).forEach((s) => s.deps.forEach((d) => used.add(d)));
    return {
      nodes: Object.values(services)
        .map((s) => ({ id: s.id, kind: "service", label: s.name, status: s.id === "primary" ? "down" : "degraded" }))
        .concat(Array.from(used).map((d) => ({ id: d, kind: "platform", label: platform[d], status: d === "identity" ? "compromised" : d === "backup" ? "down" : "ok" }))),
      edges: [].concat(...Object.values(services).map((s) => s.deps.map((d) => ({ from: s.id, to: d }))))
    };
  }

  /** RTO against estimated recovery: identity rebuild delays everything that depends on it. */
  function rtoChart(ctx) {
    return {
      services: Object.values(ctx.org.services).map((s) => {
        const identityDelay = s.deps.includes("identity") ? ctx.vars.identityRebuildHours : 0;
        const estimate = Math.round(identityDelay + s.rto * (1.5 + ctx.rng.float(0, 1.5)));
        return { id: s.id, name: s.name, rto: s.rto, rpo: s.rpo, estimate };
      })
    };
  }

  BK.scenarios.register({
    id: "s01-ransomware-vpn",
    version: 1,
    category: "ransomware",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "skull-lock",
    title: { en: "Locked Out at Close of Business", sv: "Utelåsta vid arbetsdagens slut" },
    summary: {
      en: "Files start changing names on a Friday evening. What looks like a fast ransomware outbreak turns out to have been prepared for days: the backups went first, the attacker walked in through the VPN, and the data left the building before anything was encrypted.",
      sv: "En fredagskväll börjar filer byta namn. Det som ser ut som ett snabbt ransomwareutbrott visar sig ha förberetts i flera dagar: säkerhetskopiorna slogs ut först, angriparen kom in via VPN:en och datan hade redan lämnat huset innan något krypterades."
    },
    learningObjectives: [
      { id: "lo1", text: { en: "Decide containment scope under business pressure", sv: "Besluta om omfattningen av isoleringen under tryck från verksamheten" }, teaser: { en: "How far to go, and who decides", sv: "Hur långt man ska gå, och vem som bestämmer" } },
      { id: "lo2", text: { en: "Assess backup trustworthiness before recovery", sv: "Bedöma om säkerhetskopiorna går att lita på innan återställning" }, teaser: { en: "Trusting what you think you have", sv: "Att lita på det man tror att man har" } },
      { id: "lo3", text: { en: "Recognise a double-extortion data breach and act on notification duties", sv: "Känna igen dubbel utpressning med dataintrång och agera utifrån anmälningsplikten" }, teaser: { en: "When the problem is bigger than it looks", sv: "När problemet är större än det ser ut" } },
      { id: "lo4", text: { en: "Establish decision authority and an update rhythm in the crisis management team", sv: "Etablera beslutsmandat och en rytm för lägesrapportering i krisledningsgruppen" }, teaser: { en: "Who decides, and how the team keeps up", sv: "Vem som bestämmer, och hur gruppen håller takten" } },
      { id: "lo5", text: { en: "Prioritise recovery order and assign ownership of residual risk", sv: "Prioritera återställningsordningen och utse ägare för den kvarstående risken" }, teaser: { en: "Choosing what comes first", sv: "Att välja vad som kommer först" } }
    ],
    mitre: ["T1133", "T1078", "T1003", "T1021", "T1562.001", "T1053", "T1136", "T1490", "T1486", "T1567"],
    frameworks: {
      nistCsf: ["GV.RR", "ID.RA", "PR.AA", "PR.DS", "DE.CM", "RS.MA", "RS.AN", "RS.CO", "RS.MI", "RC.RP", "RC.CO"],
      iso27001: ["A.5.19", "A.5.24", "A.5.25", "A.5.26", "A.5.28", "A.5.29", "A.5.31", "A.5.34", "A.8.8", "A.8.13", "A.8.15", "A.8.16"]
    },
    minStages: 4,
    maxStages: 8,
    constraints: { startWindow: "friday-evening", sectors: ["logistics", "retail", "manufacturing"] },
    actor: {
      types: ["criminal"],
      motivation: { en: "Financial gain through double extortion", sv: "Ekonomisk vinning genom dubbel utpressning" },
      capability: "high"
    },
    variables: {
      ransom: { min: 2000000, max: 25000000, step: 250000, scaleBy: "size", currency: true },
      hosts: { min: 40, max: 900, scaleBy: "size" },
      servers: { min: 6, max: 60, scaleBy: "size" },
      gbExfil: { min: 20, max: 400, step: 5, scaleBy: "size" },
      recordsAffected: { min: 3000, max: 180000, step: 500, scaleBy: "size" },
      backupDaysOld: { min: 8, max: 15 },
      leakDays: { min: 4, max: 7 },
      trucksMonday: { min: 40, max: 600, step: 5, scaleBy: "size" },
      identityRebuildHours: { min: 36, max: 96, step: 6, scaleBy: "size" },
      revenueLoss: { min: 400000, max: 9000000, step: 50000, scaleBy: "size", currency: true },
      fraudAmount: { min: 60000, max: 900000, step: 5000, currency: true },
      hostsStage2: { derive: (v) => Math.round(v.hosts * 0.6) },
      extraHosts: { derive: (v) => Math.max(5, Math.round(v.hosts * 0.25)) },
      ransomRaised: { derive: (v) => Math.round((v.ransom * 1.5) / 1000) * 1000 }
    },
    roles: ["incidentCommander", "ciso", "socLead", "itOps", "serviceOwner", "legal", "comms", "ceo", "dpo"],

    groundTruth: {
      rootCause: {
        en: "Initial access through the secondary node of {{env.vpn}} ({{asset.vpnGateway}}), left unpatched against advisory {{asset.vulnId}}, using an IT contractor's password harvested by an infostealer. The attacker dumped credentials, planted persistence on {{asset.domainController}}, took over {{asset.backupAdmin}}, exfiltrated {{num.gbExfil}} GB over three nights, encrypted the backup repositories 48 hours before T+0 and finally disabled endpoint protection and encrypted the file servers.",
        sv: "Den första åtkomsten skedde via den sekundära noden i {{env.vpn}} ({{asset.vpnGateway}}), som inte patchats mot säkerhetsmeddelandet {{asset.vulnId}}, med en IT-konsults lösenord som stulits av en infostealer. Angriparen dumpade inloggningsuppgifter, installerade persistens på {{asset.domainController}}, tog över {{asset.backupAdmin}}, exfiltrerade {{num.gbExfil}} GB under tre nätter, krypterade backupförråden 48 timmar före T+0 och stängde till sist av klientskyddet och krypterade filservrarna."
      },
      attackerTimeline: [
        { at: -43200, text: { en: "The contractor's VPN password appears in an infostealer log offered for sale.", sv: "Konsultens VPN-lösenord dyker upp i en infostealer-logg som bjuds ut till försäljning." } },
        { at: -30240, text: { en: "Vendor advisory {{asset.vulnId}} published; only the primary VPN node is patched.", sv: "Säkerhetsmeddelandet {{asset.vulnId}} publiceras; bara den primära VPN-noden patchas." } },
        { at: -7200, text: { en: "First VPN session from {{asset.attackerIp}} with the contractor account; MFA bypassed through the flaw.", sv: "Första VPN-sessionen från {{asset.attackerIp}} med konsultkontot; MFA kringgås via sårbarheten." } },
        { at: -5760, text: { en: "Reconnaissance of the directory; credential dumping on {{asset.jumpHost}}.", sv: "Kartläggning av katalogtjänsten; dumpning av inloggningsuppgifter på {{asset.jumpHost}}." } },
        { at: -5600, text: { en: "Scheduled task on {{asset.domainController}} recreates {{asset.serviceAccount}} as an administrator every night.", sv: "En schemalagd aktivitet på {{asset.domainController}} återskapar {{asset.serviceAccount}} som administratör varje natt." } },
        { at: -4320, text: { en: "{{asset.backupAdmin}} used interactively; first of three nights of exfiltration from {{asset.fileServer2}}.", sv: "{{asset.backupAdmin}} används interaktivt; första av tre nätter med exfiltrering från {{asset.fileServer2}}." } },
        { at: -2880, text: { en: "Backup repositories on {{asset.backupServer}} encrypted; retention policy altered.", sv: "Backupförråden på {{asset.backupServer}} krypteras; lagringspolicyn ändras." } },
        { at: -60, text: { en: "Endpoint protection on the file servers switched to audit mode using {{asset.adminAccount}}.", sv: "Klientskyddet på filservrarna ändras till granskningsläge med {{asset.adminAccount}}." } },
        { at: -20, text: { en: "Encryption starts on {{asset.fileServer}}.", sv: "Krypteringen startar på {{asset.fileServer}}." } }
      ]
    },

    hiddenFacts: [
      { id: "hf-backups", revealStage: "p2", text: { en: "The backup repositories on {{asset.backupServer}} were encrypted 48 hours before T+0 using {{asset.backupAdmin}}. Every job since has reported “completed with warnings”.", sv: "Backupförråden på {{asset.backupServer}} krypterades 48 timmar före T+0 med {{asset.backupAdmin}}. Varje jobb sedan dess har rapporterat ”slutfört med varningar”." } },
      { id: "hf-access", revealStage: "p3", text: { en: "Initial access was a valid contractor password (from an infostealer log) on the unpatched secondary VPN node, which let the attacker bypass MFA.", sv: "Den första åtkomsten var ett giltigt konsultlösenord (från en infostealer-logg) på den opatchade sekundära VPN-noden, vilket lät angriparen kringgå MFA." } },
      { id: "hf-dwell", revealStage: "p3", text: { en: "The attacker had been inside for five days before encryption started.", sv: "Angriparen hade varit inne i fem dygn innan krypteringen startade." } },
      { id: "hf-exfil", revealStage: "p4", text: { en: "{{num.gbExfil}} GB was exfiltrated over three nights to a cloud storage service, including payroll exports and scanned ID documents.", sv: "{{num.gbExfil}} GB exfiltrerades under tre nätter till en molnlagringstjänst, bland annat lönefiler och inskannade id-handlingar." } },
      { id: "hf-persistence", revealStage: "p6", text: { en: "A scheduled task on {{asset.domainController}} recreates the administrator account {{asset.serviceAccount}} every night; password resets alone do not remove the attacker.", sv: "En schemalagd aktivitet på {{asset.domainController}} återskapar administratörskontot {{asset.serviceAccount}} varje natt; lösenordsbyten räcker inte för att få ut angriparen." } },
      { id: "hf-cleancopy", revealStage: "p8", text: { en: "The newest trustworthy offline backup is {{num.backupDaysOld}} days old — older than the intrusion, so clean, but everything since must be recreated.", sv: "Den senaste frånkopplade säkerhetskopian som går att lita på är {{num.backupDaysOld}} dagar gammal – äldre än intrånget och därmed ren, men allt därefter måste återskapas." } }
    ],

    stages: [
      // ---------------------------------------------------------------------------------------- p1
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: { en: "Something is wrong with the file servers", sv: "Något är fel med filservrarna" },
        narrative: {
          en: "It is {{time.T+0|day}}, {{time.T+0|clock}}. Most office staff at {{org.name}} have left for the weekend; the warehouse night shift starts at {{time.T+90|clock}} and will need every system to pick and ship tomorrow's orders.\n\nThe service desk is taking calls from people who cannot open shared files. Documents on {{asset.fileServer}} have new names ending in {{asset.ransomExt}}, and the list of affected folders grows each time someone refreshes the screen. Nobody has declared an incident yet.",
          sv: "Det är {{time.T+0|day}}, klockan {{time.T+0|clock}}. De flesta på kontoret hos {{org.name}} har gått hem för helgen och lagrets nattskift börjar {{time.T+90|clock}}; det behöver alla system för att plocka och skicka morgondagens beställningar.\n\nServicedesken tar emot samtal från medarbetare som inte kan öppna gemensamma filer. Dokument på {{asset.fileServer}} har fått nya namn som slutar på {{asset.ransomExt}}, och listan över drabbade mappar växer varje gång någon uppdaterar skärmen. Ingen har ännu utlyst någon incident."
        },
        injects: [
          {
            id: "i1-1", at: 0, type: "ticket", source: "serviceDesk",
            severity: "low", reliability: "confirmed", visibility: "public",
            headline: { en: "Ticket {{asset.ticketId}}: Cannot open files on the shared drive", sv: "Ärende {{asset.ticketId}}: Kan inte öppna filer på den gemensamma enheten" },
            // Who notices first varies by seed; the facts (server, extension, note) do not.
            variants: [
              {
                id: "finance",
                content: {
                  en: "Three users in finance report that spreadsheets on {{asset.fileServer}} will not open. The file names now end in {{asset.ransomExt}}. One user says a text file called README_RESTORE.txt has appeared in every folder.",
                  sv: "Tre användare på ekonomiavdelningen anmäler att kalkylblad på {{asset.fileServer}} inte går att öppna. Filnamnen slutar nu på {{asset.ransomExt}}. En användare berättar att en textfil som heter README_RESTORE.txt har dykt upp i varje mapp."
                }
              },
              {
                id: "planning",
                content: {
                  en: "The transport planners cannot open tomorrow's route plans on {{asset.fileServer}}. Every file in the shared folder now ends in {{asset.ransomExt}}, and a file called README_RESTORE.txt sits at the top of the list.",
                  sv: "Transportplanerarna kan inte öppna morgondagens körplaner på {{asset.fileServer}}. Varje fil i den gemensamma mappen slutar nu på {{asset.ransomExt}}, och en fil som heter README_RESTORE.txt ligger överst i listan."
                }
              },
              {
                id: "hr",
                content: {
                  en: "HR reports that employment contracts on {{asset.fileServer}} show as unreadable. The documents have been renamed with {{asset.ransomExt}} at the end, and a README_RESTORE.txt file has appeared next to them.",
                  sv: "HR anmäler att anställningsavtal på {{asset.fileServer}} inte går att läsa. Dokumenten har fått {{asset.ransomExt}} tillagt i slutet av namnet, och en fil som heter README_RESTORE.txt har dykt upp bredvid dem."
                }
              }
            ],
            meta: { ticketId: "{{asset.ticketId}}", priority: { en: "P3 — normal", sv: "P3 – normal" } },
            tests: ["lo1"],
            expectedResponse: { en: "Recognise the ransomware pattern, escalate to the SOC at once and open an incident log.", sv: "Känna igen mönstret för ransomware, eskalera direkt till SOC och öppna en incidentlogg." },
            facilitatorNote: { en: "The README file is the ransom note. Let the group work that out; do not name it ransomware for them.", sv: "README-filen är utpressningsmeddelandet. Låt gruppen komma fram till det själv; kalla det inte ransomware åt dem." }
          },
          {
            id: "i1-2", at: 15, type: "edrAlert", source: "edr",
            severity: "high", reliability: "confirmed", visibility: "public",
            headline: { en: "{{env.edrAlert|cap}}: mass file modification on {{asset.fileServer}} and {{asset.fileServer2}}", sv: "{{env.edrAlert|cap}}: massändring av filer på {{asset.fileServer}} och {{asset.fileServer2}}" },
            content: {
              en: "Behaviour detection: a single process is renaming and rewriting files at high speed. Automatic isolation is not enabled for servers. Protection on both servers was switched to audit mode 75 minutes ago by the account {{asset.adminAccount}}.",
              sv: "Beteendedetektering: en enskild process byter namn på och skriver om filer i hög takt. Automatisk isolering är inte aktiverad för servrar. Skyddet på båda servrarna ändrades till granskningsläge för 75 minuter sedan av kontot {{asset.adminAccount}}."
            },
            tests: ["lo1"],
            expectedResponse: { en: "Treat this as active ransomware. Isolate through the network rather than powering off, so memory and logs survive.", sv: "Behandla det som pågående ransomware. Isolera via nätverket i stället för att stänga av, så att minne och loggar finns kvar." },
            facilitatorNote: { en: "The audit-mode change by an administrator account is the first sign that the attacker holds privileged credentials. Advanced groups pick this up; note whether anyone asks who made the change.", sv: "Att ett administratörskonto ändrade till granskningsläge är det första tecknet på att angriparen har privilegierade inloggningsuppgifter. Avancerade grupper fångar upp det; notera om någon frågar vem som gjorde ändringen." }
          },
          {
            id: "i1-3", at: 25, type: "chat", source: "person.serviceOwner",
            severity: "medium", reliability: "misleading", visibility: "public",
            optional: true, difficulties: ["intermediate", "advanced", "executive"],
            content: {
              en: "It's just the nightly sync job again — we had exactly this in the spring. Please don't touch the network, the night shift needs every system up from {{time.T+90|clock}}.",
              sv: "Det är bara nattsynken igen – vi hade exakt samma sak i våras. Rör inte nätverket, nattskiftet behöver alla system från {{time.T+90|clock}}."
            },
            tests: ["lo1", "lo4"],
            facilitatorNote: { en: "Intentionally misleading reassurance from the business side. Watch whether the group verifies it or lets it delay containment.", sv: "Medvetet vilseledande lugnande besked från verksamheten. Se om gruppen kontrollerar påståendet eller låter det fördröja isoleringen." }
          },
          {
            id: "i1-4", at: 35, type: "phoneTranscript", source: "person.ceo",
            severity: "medium", reliability: "confirmed", visibility: "public", optional: true,
            content: {
              en: "{{person.ceo.firstName}} calls from the car: “I'm hearing the file servers are down. Is this serious? I'm having dinner with the chair of the board at eight — what do I say?”",
              sv: "{{person.ceo.firstName}} ringer från bilen: ”Jag hör att filservrarna ligger nere. Är det allvarligt? Jag äter middag med styrelseordföranden klockan åtta – vad ska jag säga?”"
            },
            tests: ["lo4"],
            expectedResponse: { en: "A short, factual holding line; agree when the next update will come and who gives it.", sv: "Ett kort och sakligt besked; kom överens om när nästa lägesrapport kommer och vem som lämnar den." }
          }
        ],
        charts: [
          {
            id: "c1-filemods", type: "line", metric: "fileModRate", markers: "injects",
            title: { en: "File operations per minute on {{asset.fileServer}}", sv: "Filoperationer per minut på {{asset.fileServer}}" },
            caption: { en: "Minutes relative to the first ticket (T+0).", sv: "Minuter i förhållande till det första ärendet (T+0)." },
            unit: { en: "operations/min", sv: "operationer/min" },
            data: fileModRate
          }
        ],
        questions: {
          technical: [
            { text: { en: "What do you need to know in the next 15 minutes to decide on containment, and who finds it out?", sv: "Vad behöver ni veta inom 15 minuter för att kunna besluta om isolering, och vem tar reda på det?" }, roles: ["socLead", "itOps"] },
            { text: { en: "Isolate the servers, the network segment or the whole site — what does each option cost in evidence and in operations?", sv: "Isolera servrarna, nätverkssegmentet eller hela anläggningen – vad kostar varje alternativ i spår och i drift?" }, roles: ["itOps", "incidentCommander"] },
            { text: { en: "Why would protection on two servers be switched to audit mode, and what does that tell you about the attacker's access?", sv: "Varför skulle skyddet på två servrar ändras till granskningsläge, och vad säger det om angriparens åtkomst?" }, roles: ["socLead", "ciso"] }
          ],
          executive: [
            { text: { en: "Who has the authority to stop the night shift, and how quickly can that person be reached?", sv: "Vem har mandat att stoppa nattskiftet, och hur snabbt når ni den personen?" }, roles: ["ceo", "incidentCommander"] },
            { text: { en: "Do you activate the crisis management team now, on incomplete information?", sv: "Aktiverar ni krisledningsgruppen nu, på ofullständigt underlag?" }, roles: ["ceo", "ciso"] },
            { text: { en: "What does the CEO tell the chair of the board tonight — and what should not be said yet?", sv: "Vad säger vd till styrelseordföranden i kväll – och vad bör inte sägas ännu?" }, roles: ["ceo", "comms"] }
          ]
        },
        challenges: [
          { text: { en: "Shutting the VPN stops the warehouse night shift and {{org.service.primary|lcfirst}}.", sv: "Att stänga VPN:en stoppar lagrets nattskift och {{org.service.primary|lcfirst}}." } }
        ],
        decision: {
          id: "d1",
          question: { en: "Do you disconnect the network now?", sv: "Kopplar ni bort nätverket nu?" },
          authority: "incidentCommander",
          options: [
            { key: "A", text: { en: "Isolate the affected file servers only; keep the network and VPN running.", sv: "Isolera bara de drabbade filservrarna; låt nätverket och VPN:en vara igång." },
              pushback: [
                { title: { en: "A third server", sv: "En tredje server" }, text: { en: "Ten minutes after you isolated the two file servers, the same renaming starts on a third server you left connected. Do you widen the isolation now, admitting the first call was too narrow, or wait to see whether it spreads further?", sv: "Tio minuter efter att ni isolerade de två filservrarna börjar samma namnbyten på en tredje server som ni lät vara ansluten. Utvidgar ni isoleringen nu, och medger att första beslutet var för snävt, eller väntar ni för att se om det sprider sig mer?" } },
                { title: { en: "The account is still active", sv: "Kontot är fortfarande aktivt" }, text: { en: "The administrator account that weakened the endpoint protection is still enabled, and it has just signed in to a domain controller. Isolating two servers did not touch it. Do you disable an account you cannot yet tie to a person, and risk locking out a colleague in the middle of the night?", sv: "Administratörskontot som försvagade klientskyddet är fortfarande aktivt, och det har just loggat in på en domänkontrollant. Att isolera två servrar påverkade det inte. Stänger ni av ett konto som ni ännu inte kan knyta till en person, och riskerar att låsa ute en kollega mitt i natten?" } },
                { title: { en: "The night shift stops anyway", sv: "Nattskiftet stannar ändå" }, text: { en: "The warehouse lead calls: picking has stopped anyway, because tonight's pick lists are on the servers you isolated. You now have the disruption of a shutdown without its protection. Do you go further, or try to get the lists back?", sv: "Lagerchefen ringer: plocket har stannat ändå, eftersom nattens plocklistor ligger på servrarna ni isolerade. Ni har nu avbrottet från en nedstängning utan dess skydd. Går ni längre, eller försöker ni få tillbaka listorna?" } }
              ]
            },
            { key: "B", text: { en: "Disconnect from the internet and shut the VPN, accepting that the night shift stops.", sv: "Koppla bort internet och stäng VPN:en, med vetskap om att nattskiftet stoppas." },
              pushback: [
                { title: { en: "It really was the sync job", sv: "Det var faktiskt synkjobbet" }, text: { en: "Twenty minutes after the shutdown, IT finds that a sync job really did start renaming files this afternoon. The night shift is standing still. Do you reconnect, or keep everything down until you are certain it explains all of it?", sv: "Tjugo minuter efter nedstängningen hittar IT ett synkjobb som faktiskt började byta namn på filer i eftermiddags. Nattskiftet står still. Kopplar ni upp igen, eller håller ni allt nere tills ni är säkra på att det förklarar allt?" } },
                { title: { en: "Nobody asked the CEO", sv: "Ingen frågade vd" }, text: { en: "{{person.ceo.name}} calls from a dinner: Saturday deliveries are promised to your biggest customer, and nobody asked before shutting down. The CEO wants the network back by midnight. Who has the authority here, and who tells the CEO no?", sv: "{{person.ceo.name}} ringer från en middag: lördagens leveranser är utlovade till er största kund, och ingen frågade innan ni stängde ner. Vd vill ha nätverket tillbaka före midnatt. Vem har mandatet här, och vem säger nej till vd?" } },
                { title: { en: "Cut off from your own help", sv: "Avskurna från er egen hjälp" }, text: { en: "Shutting the VPN also cut off the two engineers working from home, the only people who know the affected servers. They cannot reach anything now. Do you open a way in for them, on a night when you do not know how the attacker got in?", sv: "När VPN:en stängdes kopplades också de två tekniker bort som arbetar hemifrån, de enda som kan de drabbade servrarna. De når ingenting nu. Öppnar ni en väg in för dem, en natt när ni inte vet hur angriparen kom in?" } }
              ]
            },
            { key: "C", text: { en: "Keep everything running for 30 minutes while the SOC confirms what is happening.", sv: "Låt allt vara igång i 30 minuter medan SOC bekräftar vad som händer." },
              pushback: [
                { title: { en: "Thirty more minutes", sv: "Trettio minuter till" }, text: { en: "The SOC asks for another thirty minutes to be sure. In the first thirty, the number of renamed files has tripled. Do you give them more time, or act on what you can already see?", sv: "SOC ber om trettio minuter till för att vara säkra. Under de första trettio har antalet omdöpta filer tredubblats. Ger ni dem mer tid, eller agerar ni på det ni redan ser?" } },
                { title: { en: "Staff are saving their work", sv: "Personalen sparar sina filer" }, text: { en: "The service desk told staff to keep working while the SOC checks. Now people are copying files to USB sticks “to be safe”, from machines that may be infected. Do you stop them, and how, without saying the word ransomware?", sv: "Servicedesken sa åt personalen att fortsätta arbeta medan SOC kontrollerar. Nu kopierar folk filer till USB-minnen ”för säkerhets skull”, från datorer som kan vara infekterade. Stoppar ni dem, och hur, utan att säga ordet utpressningsprogram?" } },
                { title: { en: "Who owns the wait?", sv: "Vem äger väntan?" }, text: { en: "The insurer's hotline asks one question: who decided to keep systems running after encryption was seen, and is that written down? Nobody in the room has said it out loud. Who owns this decision, by name?", sv: "Försäkringsbolagets jourlinje ställer en fråga: vem beslutade att låta systemen vara igång efter att krypteringen upptäcktes, och finns det nedskrivet? Ingen i rummet har sagt det högt. Vem äger beslutet, med namn?" } }
              ]
            }
          ],
          knowns: [
            { en: "Files on two servers are being renamed and rewritten right now.", sv: "Filer på två servrar byts namn på och skrivs om just nu." },
            { en: "Endpoint protection on those servers was weakened by an administrator account.", sv: "Klientskyddet på servrarna försvagades av ett administratörskonto." },
            { en: "The night shift depends on {{org.service.primary|lcfirst}} from {{time.T+90|clock}}.", sv: "Nattskiftet är beroende av {{org.service.primary|lcfirst}} från {{time.T+90|clock}}." }
          ],
          uncertainties: [
            { en: "How many systems are affected, and whether it is still spreading.", sv: "Hur många system som är drabbade och om det fortfarande sprids." },
            { en: "Whether the business side is right that this is a known sync problem.", sv: "Om verksamheten har rätt i att det är ett känt synkproblem." }
          ],
          tradeoffs: {
            operational: { en: "A full disconnect stops picking and dispatch tonight.", sv: "En fullständig frånkoppling stoppar plock och utleveranser i natt." },
            security: { en: "Waiting or isolating narrowly may let encryption and attacker access continue.", sv: "Att vänta eller isolera snävt kan låta krypteringen och angriparens åtkomst fortsätta." },
            legal: { en: "Powering systems off destroys volatile evidence; network isolation preserves it.", sv: "Att stänga av system förstör flyktiga spår; isolering via nätverket bevarar dem." },
            reputational: { en: "Missed Saturday deliveries will be noticed by customers.", sv: "Uteblivna leveranser på lördag kommer att märkas hos kunderna." }
          },
          evaluation: [
            { en: "Defines who has the authority to accept business disruption", sv: "Klargör vem som har mandat att acceptera avbrott i verksamheten" },
            { en: "Prefers network isolation over powering off, to preserve evidence", sv: "Väljer isolering via nätverket framför att stänga av, för att bevara spår" },
            { en: "Time-boxes information gathering instead of waiting open-ended", sv: "Tidsätter informationsinhämtningen i stället för att vänta obegränsat" }
          ],
          discussionMinutes: 8
        },
        facilitator: {
          notes: { en: "Let the group feel the weekend: who is reachable, who is driving home, who has the admin passwords. Do not confirm ransomware; let them conclude it.", sv: "Låt gruppen känna av helgen: vem går att nå, vem sitter i bilen på väg hem, vem har administratörslösenorden. Bekräfta inte att det är ransomware; låt dem dra slutsatsen själva." },
          expected: { en: "Escalation within minutes, an incident log, and a time-boxed decision on network isolation with a named owner.", sv: "Eskalering inom några minuter, en incidentlogg och ett tidsatt beslut om isolering via nätverket med en utsedd ansvarig." },
          hints: [
            { en: "If the group stalls: the service desk asks whether it should tell users to save their work and log off.", sv: "Om gruppen kör fast: servicedesken frågar om de ska be användarna spara sitt arbete och logga ut." },
            { en: "If nobody mentions it: what does “audit mode” mean for the endpoint protection?", sv: "Om ingen tar upp det: vad betyder ”granskningsläge” för klientskyddet?" }
          ]
        }
      },

      // ---------------------------------------------------------------------------------------- p2
      {
        id: "p2",
        mandatory: true,
        clock: 55,
        title: { en: "The backups were the first target", sv: "Säkerhetskopiorna var första målet" },
        twist: { en: "Your backups were the attacker's first target — two days ago.", sv: "Säkerhetskopiorna var angriparens första mål – för två dagar sedan." },
        twistKind: "scope",
        assumptionChallenged: { en: "Restoring from backup is a viable plan.", sv: "Att återställa från säkerhetskopior är en fungerande plan." },
        reveals: ["hf-backups"],
        narrative: {
          en: "{{time.T+55|clock}}. Encryption has reached {{num.hostsStage2}} systems, {{num.servers}} of them servers. A ransom note signed {{actor.name}} has appeared on every affected server, and the warehouse night shift is standing idle.\n\nIT operations went to start a restore, the plan everyone had relied on, and found the backup repositories on {{asset.backupServer}} already encrypted. The room has to work out what “recovery” means now.",
          sv: "Klockan {{time.T+55|clock}}. Krypteringen har nått {{num.hostsStage2}} system, varav {{num.servers}} servrar. Ett utpressningsmeddelande undertecknat {{actor.name}} har dykt upp på varje drabbad server, och lagrets nattskift står stilla.\n\nIT-driften skulle börja återställa, den plan som alla hade litat på, och upptäckte att backupförråden på {{asset.backupServer}} redan var krypterade. Rummet måste reda ut vad ”återställning” betyder nu."
        },
        injects: [
          {
            id: "i2-1", at: 55, type: "ransomNote", source: "attacker",
            severity: "critical", reliability: "unverified", visibility: "public",
            headline: { en: "README_RESTORE.txt", sv: "README_RESTORE.txt" },
            content: {
              en: "Your network has been encrypted by {{actor.name}}. Your backups are gone — check for yourselves. We also hold copies of your files. Price for the decryption tool and deletion of your data: {{num.ransom|currency}}. Contact us at {{actor.contact}} within 72 hours. After that the price doubles and your data goes public.",
              sv: "Ert nätverk har krypterats av {{actor.name}}. Era säkerhetskopior är borta – kontrollera själva. Vi har också kopior av era filer. Pris för dekrypteringsverktyget och radering av er data: {{num.ransom|currency}}. Kontakta oss på {{actor.contact}} inom 72 timmar. Därefter dubblas priset och er data publiceras."
            },
            meta: { contact: "{{actor.contact}}", deadlineHours: 72 },
            tests: ["lo2", "lo3"],
            expectedResponse: { en: "Preserve the note as evidence. Treat the data-theft claim as a hypothesis to test, not as a bluff.", sv: "Säkra meddelandet som bevis. Behandla påståendet om datastöld som en hypotes att pröva, inte som bluff." },
            facilitatorNote: { en: "The claim about stolen files is true but stays unconfirmed until stage 4. Many groups dismiss it as a bluff — note how they treat it.", sv: "Påståendet om stulna filer stämmer men förblir obekräftat till skede 4. Många grupper avfärdar det som bluff – notera hur de hanterar det." }
          },
          {
            id: "i2-2", at: 60, type: "backupReport", source: "backupSystem",
            severity: "critical", reliability: "confirmed", visibility: "public",
            reveals: ["hf-backups"],
            headline: { en: "Backup job summary — last 7 days", sv: "Sammanfattning av backupjobb – senaste 7 dagarna" },
            content: {
              en: "Every job since {{time.T-2880|day}} reports “completed with warnings”. Repository check: catalogue unreadable, volume headers replaced. Last change to the retention policy: {{time.T-2885|datetime}} by {{asset.backupAdmin}}.",
              sv: "Varje jobb sedan {{time.T-2880|day}} rapporterar ”slutfört med varningar”. Kontroll av förrådet: katalogen går inte att läsa, volymhuvudena har ersatts. Senaste ändring av lagringspolicyn: {{time.T-2885|datetime}} av {{asset.backupAdmin}}."
            },
            tests: ["lo2"],
            expectedResponse: { en: "Treat all online backups as compromised, look for offline or immutable copies, and preserve the backup server for forensics.", sv: "Behandla alla uppkopplade säkerhetskopior som komprometterade, leta efter frånkopplade eller oföränderliga kopior och säkra backupservern för forensisk analys." },
            facilitatorNote: { en: "Nobody read the warnings for two days — a monitoring gap worth recording as an observation.", sv: "Ingen läste varningarna på två dygn – en brist i övervakningen som är värd att notera som en observation." }
          },
          {
            id: "i2-3", at: 70, type: "chat", source: "person.itOps",
            severity: "high", reliability: "unverified", visibility: "public", optional: true,
            content: {
              en: "There's an offline copy that gets rotated to the archive store, but I don't know how old it is or whether it's complete. Getting it here takes until tomorrow morning.",
              sv: "Det finns en frånkopplad kopia som roteras till arkivförrådet, men jag vet inte hur gammal den är eller om den är komplett. Att få hit den tar till i morgon bitti."
            },
            tests: ["lo2"]
          },
          {
            id: "i2-4", at: 80, type: "email", source: "insurer",
            severity: "medium", reliability: "confirmed", visibility: "public", optional: true,
            headline: { en: "Cyber policy — notification requirements", sv: "Cyberförsäkring – krav på anmälan" },
            content: {
              en: "{{supplier.insurer}}: the policy requires notification within 24 hours and our approval before you engage an incident response firm or enter any negotiation.",
              sv: "{{supplier.insurer}}: försäkringen kräver anmälan inom 24 timmar och vårt godkännande innan ni anlitar ett incidentresponsföretag eller inleder någon förhandling."
            },
            meta: { from: "claims@{{supplier.insurer.domain}}" },
            tests: ["lo4"]
          },
          {
            id: "i2-5", at: 85, type: "email", source: "insurer",
            severity: "medium", reliability: "confirmed", visibility: "role:legal",
            headline: { en: "Policy clause 7.3", sv: "Försäkringsvillkor 7.3" },
            content: {
              en: "Only you have read this clause: the insurer may reduce or refuse cover if a known critical vulnerability was left unpatched for more than 14 days.",
              sv: "Bara du har läst den här klausulen: försäkringsbolaget kan sätta ned eller neka ersättning om en känd kritisk sårbarhet har lämnats opatchad i mer än 14 dagar."
            },
            facilitatorNote: { en: "Role card for legal. It becomes explosive in stage 3, when the three-week-old unpatched VPN node is found. Watch whether legal shares it.", sv: "Rollkort till juristen. Det blir laddat i skede 3, när den tre veckor gamla opatchade VPN-noden hittas. Se om juristen delar det med gruppen." },
            tests: ["lo4"]
          },
          {
            id: "i2-spread", at: 75, type: "edrAlert", source: "edr", branchOnly: true,
            severity: "critical", reliability: "confirmed", visibility: "public",
            headline: { en: "Encryption spreading to workstations", sv: "Krypteringen sprider sig till arbetsstationer" },
            content: {
              en: "While the network stayed connected, encryption reached {{num.extraHosts}} more machines, including the warehouse terminals.",
              sv: "Medan nätverket var uppkopplat nådde krypteringen ytterligare {{num.extraHosts}} datorer, bland annat lagrets terminaler."
            },
            tests: ["lo1"]
          }
        ],
        branches: [
          {
            when: { decision: "d1", option: "C" },
            addInjects: ["i2-spread"],
            narrativeAppend: { en: "Because the network stayed connected while the SOC investigated, encryption kept spreading.", sv: "Eftersom nätverket var uppkopplat medan SOC utredde fortsatte krypteringen att spridas." },
            facilitatorNote: { en: "Consequence of waiting. Do not moralise; ask what would have made an earlier decision possible.", sv: "En följd av att vänta. Moralisera inte; fråga vad som hade gjort ett tidigare beslut möjligt." }
          }
        ],
        charts: [
          {
            id: "c2-kpi", type: "kpi",
            title: { en: "Situation at {{time.T+55|clock}}", sv: "Läget klockan {{time.T+55|clock}}" },
            data: (ctx) => ({
              tiles: [
                { id: "hosts", label: { en: "Systems encrypted", sv: "Krypterade system" }, value: ctx.vars.hostsStage2, format: "number", tone: "danger" },
                { id: "servers", label: { en: "Servers affected", sv: "Drabbade servrar" }, value: ctx.vars.servers, format: "number", tone: "danger" },
                { id: "backups", label: { en: "Usable online backups", sv: "Användbara uppkopplade säkerhetskopior" }, value: 0, format: "number", tone: "warn" }
              ]
            })
          },
          {
            id: "c2-backups", type: "bar",
            title: { en: "Backup job results per day", sv: "Resultat av backupjobb per dag" },
            caption: { en: "Days before T+0.", sv: "Dagar före T+0." },
            unit: { en: "jobs", sv: "jobb" },
            data: backupJobs
          }
        ],
        questions: {
          technical: [
            { text: { en: "What can you restore from, and how will you prove it is clean before you rely on it?", sv: "Vad kan ni återställa från, och hur bevisar ni att det är rent innan ni förlitar er på det?" }, roles: ["itOps", "socLead"] },
            { text: { en: "What does the use of {{asset.backupAdmin}} two days ago tell you about how long the attacker has been inside?", sv: "Vad säger användningen av {{asset.backupAdmin}} för två dagar sedan om hur länge angriparen har varit inne?" }, roles: ["socLead", "ciso"] },
            { text: { en: "Given that the attacker prepared this days in advance, is the containment you chose an hour ago still enough?", sv: "Med tanke på att angriparen förberett det här i flera dagar – räcker den isolering ni valde för en timme sedan?" }, roles: ["incidentCommander", "itOps"], revisits: "d1" }
          ],
          executive: [
            { text: { en: "Without backups, what is the realistic recovery time for {{org.service.primary|lcfirst}}, and what does each day cost?", sv: "Utan säkerhetskopior – vilken är den realistiska återställningstiden för {{org.service.primary|lcfirst}}, och vad kostar varje dygn?" }, roles: ["ceo", "serviceOwner"] },
            { text: { en: "Who decides whether contact with the attacker is even an option, and on what principles?", sv: "Vem avgör om kontakt med angriparen ens är ett alternativ, och utifrån vilka principer?" }, roles: ["ceo", "legal"] },
            { text: { en: "Knowing what you know now, would you make the same call on disconnecting the network?", sv: "Med det ni vet nu – skulle ni fatta samma beslut om att koppla bort nätverket?" }, roles: ["ceo", "incidentCommander"], revisits: "d1" }
          ]
        },
        challenges: [
          { text: { en: "Your own IT team has only ever restored single servers, never the whole environment.", sv: "Ert eget IT-team har bara återställt enstaka servrar, aldrig hela miljön." } },
          { text: { en: "The insurer must approve any incident response firm before work starts.", sv: "Försäkringsbolaget måste godkänna ett incidentresponsföretag innan arbetet får börja." } }
        ],
        decision: {
          id: "d2",
          question: { en: "What is your recovery strategy now that the backups cannot be trusted?", sv: "Vilken återställningsstrategi väljer ni nu när säkerhetskopiorna inte går att lita på?" },
          authority: "ceo",
          options: [
            { key: "A", text: { en: "Restore from the oldest offline copy you can find, accepting data loss.", sv: "Återställ från den äldsta frånkopplade kopia ni kan hitta och acceptera dataförlust." },
              pushback: [
                { title: { en: "A copy nobody can date", sv: "En kopia som ingen kan datera" }, text: { en: "The archive store can deliver the offline copy at dawn, but its label shows only a rotation number, not a date. Nobody can say whether it was made before or after the backup account was misused. Do you bet the recovery on a copy you cannot date, and how will you check it first?", sv: "Arkivet kan leverera den frånkopplade kopian i gryningen, men etiketten visar bara ett rotationsnummer, inget datum. Ingen kan säga om den togs före eller efter att backupkontot missbrukades. Satsar ni återställningen på en kopia ni inte kan datera, och hur kontrollerar ni den först?" } },
                { title: { en: "Who decides what is lost?", sv: "Vem bestämmer vad som går förlorat?" }, text: { en: "The service owner points out that every order, delivery note and invoice since that copy was made must be re-entered by hand, and finance says the month-end run cannot happen without them. Nobody has said how much loss is acceptable. Who in this room decides how much data the company can afford to lose?", sv: "Tjänsteägaren påpekar att varje order, följesedel och faktura sedan kopian togs måste matas in för hand, och ekonomi säger att månadsskiftets körning inte går utan dem. Ingen har sagt hur stor förlust som är acceptabel. Vem i rummet avgör hur mycket data företaget har råd att förlora?" } },
                { title: { en: "Restoring into the same house", sv: "Återställa in i samma hus" }, text: { en: "The SOC reminds you that the account that encrypted the backups is still valid, and nobody yet knows how the attacker got it. Restoring onto the same servers could hand them a fresh target by tomorrow night. Do you restore before you know who still holds the keys?", sv: "SOC påminner om att kontot som krypterade säkerhetskopiorna fortfarande är giltigt, och ingen vet ännu hur angriparen fick tag i det. Att återställa till samma servrar kan ge dem ett nytt mål redan i morgon kväll. Återställer ni innan ni vet vem som fortfarande har nycklarna?" } }
              ]
            },
            { key: "B", text: { en: "Rebuild critical systems from scratch in a clean environment.", sv: "Bygg upp kritiska system från grunden i en ren miljö." },
              pushback: [
                { title: { en: "Nobody has done this before", sv: "Ingen har gjort det här förut" }, text: { en: "IT operations admit they have never built the environment from scratch, and the build documentation was on the encrypted file servers. They cannot give you an end date, only “several days, maybe more”. Do you commit the company to a plan whose finish line nobody can name?", sv: "IT-driften medger att de aldrig har byggt upp miljön från grunden, och byggdokumentationen låg på de krypterade filservrarna. De kan inte ge något slutdatum, bara ”flera dagar, kanske mer”. Binder ni företaget vid en plan där ingen kan säga när den är klar?" } },
                { title: { en: "The biggest customer will not wait", sv: "Största kunden väntar inte" }, text: { en: "The service owner has spoken to your largest customer: if deliveries have not resumed early next week, they will move their volumes to a competitor. A full rebuild will not be ready by then. Do you accept losing the customer, or carve out a faster path for one system?", sv: "Tjänsteägaren har pratat med er största kund: om leveranserna inte är igång i början av nästa vecka flyttar de sina volymer till en konkurrent. En fullständig ombyggnad blir inte klar till dess. Accepterar ni att förlora kunden, eller tar ni fram en snabbare väg för ett enda system?" } },
                { title: { en: "Clean from what?", sv: "Ren utifrån vad?" }, text: { en: "A rebuild needs installation files, licence keys and configuration. The only copies IT can find are on the backup server the attacker controlled. Can you trust anything taken from there, and if not, where do you even start?", sv: "En ombyggnad kräver installationsfiler, licensnycklar och konfiguration. De enda kopior IT hittar ligger på backupservern som angriparen kontrollerade. Kan ni lita på något som hämtas därifrån, och om inte, var börjar ni då?" } }
              ]
            },
            { key: "C", text: { en: "Open contact with the attacker to keep the decryption option open while you investigate.", sv: "Ta kontakt med angriparen för att hålla dekrypteringsalternativet öppet medan ni utreder." },
              pushback: [
                { title: { en: "Without the insurer's approval", sv: "Utan försäkringsbolagets godkännande" }, text: { en: "The policy requires the insurer's approval before any negotiation, and their claims line only takes messages until Monday. Contact tonight could put the whole cover at risk. Do you wait for an approval that may not come in time, or open the channel and risk the policy?", sv: "Försäkringen kräver försäkringsbolagets godkännande före all förhandling, och deras skadelinje tar bara emot meddelanden fram till måndag. Kontakt i kväll kan sätta hela skyddet på spel. Väntar ni på ett godkännande som kanske inte kommer i tid, eller öppnar ni kanalen och riskerar försäkringen?" } },
                { title: { en: "Who is typing?", sv: "Vem skriver?" }, text: { en: "The attacker answers within minutes and asks who they are speaking to and what role that person has. Someone in your company now has to sit in a chat with criminals tonight, untrained, and every line may later be read aloud. Who types, and what are they forbidden to say?", sv: "Angriparen svarar inom några minuter och frågar vem de pratar med och vilken roll personen har. Någon i ert företag måste nu sitta i en chatt med kriminella i natt, utan utbildning, och varje rad kan senare läsas upp. Vem skriver, och vad får hen absolut inte säga?" } },
                { title: { en: "You told them you are looking", sv: "Ni visade att ni letar" }, text: { en: "Your response partner warns that any contact before the logs are preserved tells the attacker you have found the encrypted backups and are weighing options. A group that knows it is cornered may act faster. Is keeping a door open worth showing them your hand?", sv: "Er incidentpartner varnar för att kontakt innan loggarna är säkrade visar angriparen att ni har hittat de krypterade säkerhetskopiorna och väger alternativ. En grupp som vet att den är trängd kan agera snabbare. Är det värt att visa era kort för att hålla en dörr öppen?" } }
              ]
            }
          ],
          knowns: [
            { en: "Online backups were encrypted two days ago.", sv: "De uppkopplade säkerhetskopiorna krypterades för två dygn sedan." },
            { en: "An offline copy may exist, but its age and completeness are unknown.", sv: "En frånkopplad kopia kan finnas, men dess ålder och fullständighet är okänd." }
          ],
          uncertainties: [
            { en: "Whether the attacker still has access to the environment.", sv: "Om angriparen fortfarande har åtkomst till miljön." },
            { en: "Whether the claim about stolen files is true.", sv: "Om påståendet om stulna filer stämmer." }
          ],
          tradeoffs: {
            operational: { en: "Rebuilding is slower but avoids restoring the attacker along with the data.", sv: "Att bygga om tar längre tid men undviker att återställa angriparen tillsammans med datan." },
            security: { en: "Any restore onto a compromised identity system can be undone overnight.", sv: "En återställning ovanpå en komprometterad identitetsmiljö kan raseras på en natt." },
            legal: { en: "Contact with the attacker needs insurer approval and sanctions screening.", sv: "Kontakt med angriparen kräver godkännande från försäkringsbolaget och sanktionskontroll." },
            reputational: { en: "Being seen to negotiate can affect trust with customers and staff.", sv: "Att uppfattas som förhandlande kan påverka förtroendet hos kunder och medarbetare." }
          },
          evaluation: [
            { en: "Checks backup integrity before committing to a restore", sv: "Kontrollerar säkerhetskopiornas integritet innan man binder sig vid en återställning" },
            { en: "Separates the business decision on recovery from the technical one", sv: "Skiljer verksamhetsbeslutet om återställning från det tekniska" }
          ],
          discussionMinutes: 10
        },
        facilitator: {
          notes: { en: "This is the stage where plans built on “we'll restore from backup” collapse. Give the group time to feel it.", sv: "I det här skedet rasar planer som bygger på ”vi återställer från backup”. Ge gruppen tid att känna det." },
          expected: { en: "Online backups treated as compromised; an offline copy located and verified before use; the insurer notified.", sv: "Uppkopplade säkerhetskopior behandlas som komprometterade; en frånkopplad kopia lokaliseras och kontrolleras före användning; försäkringsbolaget underrättas." },
          hints: [
            { en: "Ask: when did anyone last test a full restore?", sv: "Fråga: när testade någon senast en fullständig återställning?" },
            { en: "Ask: who reads the backup reports — and on which days?", sv: "Fråga: vem läser backuprapporterna – och vilka dagar?" }
          ]
        }
      },

      // ---------------------------------------------------------------------------------------- p3
      {
        id: "p3",
        mandatory: true,
        clock: 190,
        title: { en: "The door was left open", sv: "Dörren stod öppen" },
        twist: { en: "Nobody clicked anything. The attacker logged in through your VPN — five days ago.", sv: "Ingen klickade på något. Angriparen loggade in via er VPN – för fem dagar sedan." },
        twistKind: "cause",
        reconsider: { decision: "d1", pressure: { en: "The way in was the VPN the night shift depends on. Every hour it stays open, the attacker can come back. Every hour it is shut, nothing leaves the warehouse.", sv: "Vägen in var just den VPN som nattskiftet är beroende av. Varje timme den står öppen kan angriparen komma tillbaka. Varje timme den är stängd lämnar ingenting lagret." } },
        assumptionChallenged: { en: "This started with a phishing email opened this afternoon.", sv: "Det här började med ett nätfiskemejl som öppnades i eftermiddags." },
        reveals: ["hf-access", "hf-dwell"],
        narrative: {
          en: "{{time.T+190|clock}}. Two analysts from {{supplier.irRetainer}} are working remotely with your SOC, pulling logs from the firewall, the VPN and the domain controllers.\n\nUntil now, everyone has assumed the attack started this afternoon, probably with a phishing email. The analysts' first findings change the picture of how this started, and of how long the attacker has been inside.",
          sv: "Klockan {{time.T+190|clock}}. Två analytiker från {{supplier.irRetainer}} arbetar på distans tillsammans med er SOC och hämtar loggar från brandväggen, vpn:et och domänkontrollanterna.\n\nHittills har alla antagit att attacken började i eftermiddags, troligen med ett nätfiskemejl. Analytikernas första fynd förändrar bilden av hur det här började, och av hur länge angriparen har varit inne."
        },
        injects: [
          {
            id: "i3-1", at: 190, type: "forensicFinding", source: "forensics",
            severity: "high", reliability: "confirmed", visibility: "public",
            reveals: ["hf-access"],
            headline: { en: "Initial access: {{asset.vpnGateway}}", sv: "Första åtkomst: {{asset.vpnGateway}}" },
            content: {
              en: "The first malicious activity is a VPN session on {{time.T-7200|datetime}} from {{asset.attackerIp}}, using an IT contractor's account. The secondary VPN node was never patched against advisory {{asset.vulnId}}, published three weeks ago; the flaw lets a valid password skip the MFA check.",
              sv: "Den första skadliga aktiviteten är en VPN-session {{time.T-7200|datetime}} från {{asset.attackerIp}}, med en IT-konsults konto. Den sekundära VPN-noden patchades aldrig mot säkerhetsmeddelandet {{asset.vulnId}}, som publicerades för tre veckor sedan; sårbarheten gör att ett giltigt lösenord räcker för att hoppa över MFA-kontrollen."
            },
            tests: ["lo1"],
            expectedResponse: { en: "Close or patch the VPN node, block the contractor account, and widen the hunt to everything the account touched.", sv: "Stäng eller patcha VPN-noden, spärra konsultkontot och bredda sökningen till allt kontot har rört." }
          },
          {
            id: "i3-2", at: 205, type: "threatIntel", source: "threatIntel",
            severity: "medium", reliability: "unverified", visibility: "public",
            statedReliability: { en: "Assessed as likely", sv: "Bedöms som sannolikt" },
            content: {
              en: "The contractor's password appeared in an infostealer log offered for sale about a month ago. The log came from a personal laptop.",
              sv: "Konsultens lösenord dök upp i en infostealer-logg som bjöds ut till försäljning för ungefär en månad sedan. Loggen kom från en privat bärbar dator."
            },
            tests: ["lo1"]
          },
          {
            id: "i3-3", at: 220, type: "authLog", source: "siem",
            severity: "high", reliability: "confirmed", visibility: "public",
            reveals: ["hf-dwell"],
            headline: { en: "Interactive sign-in by a service account", sv: "Interaktiv inloggning med ett tjänstekonto" },
            content: {
              en: "{{asset.backupAdmin}} signed in interactively on {{asset.jumpHost}} at {{time.T-4320|datetime}}. The account should never sign in interactively. The night before, credential-dumping tools ran on the same host.",
              sv: "{{asset.backupAdmin}} loggade in interaktivt på {{asset.jumpHost}} {{time.T-4320|datetime}}. Kontot ska aldrig logga in interaktivt. Natten innan kördes verktyg för att dumpa inloggningsuppgifter på samma server."
            },
            tests: ["lo2"]
          },
          {
            id: "i3-role", at: 225, type: "employeeReport", source: "itOps",
            severity: "medium", reliability: "confirmed", visibility: "role:itOps",
            content: {
              en: "You remember now: patching the secondary VPN node was postponed from the last change window. The change ticket is still open in your queue.",
              sv: "Nu minns du: patchningen av den sekundära VPN-noden sköts upp från det senaste ändringsfönstret. Ändringsärendet ligger fortfarande öppet i din kö."
            },
            facilitatorNote: { en: "Role card for IT operations. It contradicts the disputed claim that the VPN was patched. Note whether the person corrects the record.", sv: "Rollkort till IT-driften. Det motsäger det omstridda påståendet att VPN:en var patchad. Notera om personen rättar uppgiften." },
            tests: ["lo1"]
          },
          {
            id: "i3-4", at: 230, type: "chat", source: "person.itOps",
            severity: "medium", reliability: "disputed", visibility: "public",
            optional: true, difficulties: ["advanced", "executive"],
            content: {
              en: "We patched the VPN last month, I'm sure of it. The scanner must be wrong.",
              sv: "Vi patchade VPN:en förra månaden, det är jag säker på. Skannern måste ha fel."
            },
            facilitatorNote: { en: "Disputed: only the primary node was patched. Watch whether the group verifies rather than trusting memory.", sv: "Omstritt: bara den primära noden patchades. Se om gruppen kontrollerar i stället för att lita på minnet." }
          }
        ],
        branches: [],
        charts: [
          {
            id: "c3-vpn", type: "bar",
            title: { en: "VPN sign-ins by the contractor account", sv: "VPN-inloggningar med konsultkontot" },
            caption: { en: "Days before T+0. Night-time sessions begin five days before the encryption.", sv: "Dagar före T+0. Nattliga sessioner börjar fem dygn före krypteringen." },
            unit: { en: "sessions", sv: "sessioner" },
            data: vpnSignIns
          },
          {
            id: "c3-blast", type: "blast",
            title: { en: "Known reach of the attacker so far", sv: "Angriparens kända räckvidd hittills" },
            caption: { en: "Rings show when each system was reached. The domain controller has not yet been assessed.", sv: "Ringarna visar när varje system nåddes. Domänkontrollanten är ännu inte bedömd." },
            // Status reflects what forensics knows at this stage — not the ground truth revealed later.
            data: () => ({
              center: { label: "{{asset.vpnGateway}}", status: "compromised" },
              rings: [
                { label: { en: "Day −5", sv: "Dag −5" }, nodes: [{ label: { en: "Contractor account", sv: "Konsultkontot" }, status: "compromised" }, { label: "{{asset.jumpHost}}", status: "compromised" }] },
                { label: { en: "Day −3", sv: "Dag −3" }, nodes: [{ label: "{{asset.backupAdmin}}", status: "compromised" }, { label: "{{asset.backupServer}}", status: "down" }, { label: "{{asset.domainController}}", status: "unknown" }] },
                { label: { en: "Day 0", sv: "Dag 0" }, nodes: [{ label: "{{asset.fileServer}}", status: "down" }, { label: "{{asset.fileServer2}}", status: "down" }, { label: { en: "Workstations", sv: "Arbetsstationer" }, status: "degraded" }] }
              ]
            })
          }
        ],
        questions: {
          technical: [
            { text: { en: "Which accounts must you now assume are compromised, and in what order do you reset them without locking yourselves out?", sv: "Vilka konton måste ni nu anta är komprometterade, och i vilken ordning byter ni lösenord utan att låsa ute er själva?" }, roles: ["socLead", "itOps"] },
            { text: { en: "What else could the attacker have done in five days that you have not yet looked for?", sv: "Vad mer kan angriparen ha gjort på fem dygn som ni ännu inte har letat efter?" }, roles: ["socLead", "ciso"] },
            { text: { en: "Does your containment still hold now that you know the entry point was the VPN itself?", sv: "Håller er isolering fortfarande nu när ni vet att ingången var själva VPN:en?" }, roles: ["incidentCommander", "itOps"], revisits: "d1" }
          ],
          executive: [
            { text: { en: "The contractor works for a supplier. What do you need from them tonight, and who calls them?", sv: "Konsulten är anställd hos en leverantör. Vad behöver ni från dem i kväll, och vem ringer?" }, roles: ["ciso", "legal"] },
            { text: { en: "A known vulnerability went unpatched for three weeks. How do you handle accountability without derailing the response?", sv: "En känd sårbarhet var opatchad i tre veckor. Hur hanterar ni ansvarsfrågan utan att hanteringen spårar ur?" }, roles: ["ceo", "ciso"] },
            { text: { en: "Does the recovery strategy you chose still make sense if the attacker has had domain-wide access for days?", sv: "Är den återställningsstrategi ni valde fortfarande rimlig om angriparen har haft åtkomst i hela domänen i flera dygn?" }, roles: ["ceo", "incidentCommander"], revisits: "d2" }
          ]
        },
        challenges: [
          { text: { en: "Resetting every privileged account tonight will break the integrations that keep the warehouse running over the weekend.", sv: "Att byta lösenord på alla privilegierade konton i natt slår ut de integrationer som håller lagret igång under helgen." } }
        ],
        decision: {
          id: "d3",
          question: { en: "How do you handle privileged accounts tonight?", sv: "Hur hanterar ni de privilegierade kontona i natt?" },
          authority: "ciso",
          options: [
            { key: "A", text: { en: "Reset every privileged and service account now, accepting broken integrations.", sv: "Byt lösenord på alla privilegierade konton och tjänstekonton nu och acceptera trasiga integrationer." },
              pushback: [
                { title: { en: "Nobody knows where they are used", sv: "Ingen vet var de används" }, text: { en: "Within minutes of the reset, the link to the transport partner's booking system stops. Nobody knows which configuration file held the old password, and the person who set it up left two years ago. Do you roll back one reset to keep bookings alive, or leave it broken all weekend?", sv: "Några minuter efter bytet slutar kopplingen till transportpartnerns bokningssystem att fungera. Ingen vet vilken konfigurationsfil som hade det gamla lösenordet, och personen som satte upp den slutade för två år sedan. Backar ni ett byte för att hålla bokningarna vid liv, eller låter ni det vara trasigt hela helgen?" } },
                { title: { en: "Locked out of your own house", sv: "Utelåsta från ert eget hus" }, text: { en: "After the reset, IT operations discovers that the emergency administrator password was kept in a document on the encrypted file servers. Two of your own administrators can no longer sign in to fix anything. How do you regain control without opening a shortcut the attacker could use too?", sv: "Efter bytet upptäcker IT-driften att lösenordet till nödadministratörskontot låg i ett dokument på de krypterade filservrarna. Två av era egna administratörer kan inte längre logga in och åtgärda något. Hur återtar ni kontrollen utan att öppna en genväg som angriparen också kan använda?" } },
                { title: { en: "Now they know", sv: "Nu vet de" }, text: { en: "The response analysts point out that a mass reset tells the attacker, loudly, that you have found them. Someone who has been inside for five days may have more than one plan. Do you go ahead before you have looked for their other ways in, or pause and do it all at once?", sv: "Incidentanalytikerna påpekar att ett massbyte talar om för angriparen, högt och tydligt, att ni har hittat dem. Den som har varit inne i fem dygn kan ha mer än en plan. Kör ni på innan ni har letat efter deras andra vägar in, eller pausar ni och gör allt på en gång?" } }
              ]
            },
            { key: "B", text: { en: "Reset only the accounts known to be compromised and monitor the rest closely.", sv: "Byt bara lösenord på de konton som säkert är komprometterade och övervaka resten noga." },
              pushback: [
                { title: { en: "The list keeps growing", sv: "Listan växer" }, text: { en: "Credential-dumping tools ran on the jump host, so the analysts say every account that signed in there during the last five days must be treated as stolen. That is dozens of accounts, including two domain administrators. Is “known to be compromised” still two accounts, or all of them?", sv: "Verktyg för att dumpa inloggningsuppgifter kördes på hoppservern, så analytikerna menar att varje konto som loggat in där de senaste fem dygnen måste behandlas som stulet. Det är dussintals konton, bland dem två domänadministratörer. Är ”säkert komprometterade” fortfarande två konton, eller alla?" } },
                { title: { en: "Who watches at night?", sv: "Vem vakar i natt?" }, text: { en: "“Monitor closely” turns out to mean one SOC analyst reading sign-in logs by hand until Monday, with no alert for administrator sign-ins at night. If that person sees something in the middle of the night, what are they allowed to do, and whom do they wake?", sv: "”Övervaka noga” visar sig betyda en SOC-analytiker som läser inloggningsloggar för hand fram till måndag, utan larm för administratörsinloggningar nattetid. Om den personen ser något mitt i natten, vad får hen göra, och vem väcker hen?" } },
                { title: { en: "On the record", sv: "Till protokollet" }, text: { en: "The response firm's lead puts it in writing: they recommend a full reset of privileged accounts tonight and want it noted that you chose otherwise. The insurer will see that note. Do you sign it as it stands, or change your decision?", sv: "Incidentföretagets ansvariga skriver ner det: de rekommenderar ett fullständigt byte av privilegierade konton i natt och vill ha noterat att ni valde annorlunda. Försäkringsbolaget kommer att se den anteckningen. Skriver ni under som det står, eller ändrar ni beslutet?" } }
              ]
            },
            { key: "C", text: { en: "Wait until the forensic scope is clear before resetting anything.", sv: "Vänta tills den forensiska omfattningen är klarlagd innan ni byter några lösenord." },
              pushback: [
                { title: { en: "Clear by when?", sv: "Klar när?" }, text: { en: "The analysts estimate that a clear forensic scope will take three to five days. Until then, every account the attacker may hold keeps working exactly as it does now. Are you really leaving everything untouched until the middle of next week?", sv: "Analytikerna bedömer att en klar forensisk avgränsning tar tre till fem dagar. Fram till dess fungerar varje konto som angriparen kan ha precis som nu. Låter ni verkligen allt vara orört till mitten av nästa vecka?" } },
                { title: { en: "Not even the contractor?", sv: "Inte ens konsulten?" }, text: { en: "The contractor's employer calls: their consultant swears they did nothing and asks whether the account has been blocked. It has not, because you decided to touch nothing yet. Can you explain why the one account you know was used is still open?", sv: "Konsultens arbetsgivare ringer: konsulten försäkrar att hen inte har gjort något och undrar om kontot är spärrat. Det är det inte, eftersom ni beslutade att inte röra något ännu. Kan ni förklara varför det enda konto ni vet har använts fortfarande är öppet?" } },
                { title: { en: "Reasonable steps?", sv: "Rimliga åtgärder?" }, text: { en: "Legal points out that the insurance policy requires “reasonable steps to limit the damage”. Leaving known stolen credentials active while you investigate may not read as reasonable afterwards. Who signs that the wait was the right call?", sv: "Juristen påpekar att försäkringen kräver ”rimliga åtgärder för att begränsa skadan”. Att låta kända stulna inloggningsuppgifter vara aktiva medan ni utreder kanske inte ser rimligt ut i efterhand. Vem skriver under på att väntan var rätt beslut?" } }
              ]
            }
          ],
          knowns: [
            { en: "The attacker used a contractor account and a backup service account.", sv: "Angriparen använde ett konsultkonto och ett tjänstekonto för backup." },
            { en: "Credential-dumping tools ran on the jump host.", sv: "Verktyg för att dumpa inloggningsuppgifter kördes på hoppservern." }
          ],
          uncertainties: [
            { en: "How many other accounts the attacker holds.", sv: "Hur många andra konton angriparen förfogar över." },
            { en: "Whether the attacker has left other ways back in.", sv: "Om angriparen har lämnat andra vägar tillbaka in." }
          ],
          tradeoffs: {
            operational: { en: "A broad reset breaks weekend integrations and may lock out your own administrators.", sv: "Ett brett lösenordsbyte slår ut helgens integrationer och kan låsa ute era egna administratörer." },
            security: { en: "A narrow reset may leave the attacker with working credentials.", sv: "Ett snävt byte kan lämna angriparen med fungerande inloggningsuppgifter." },
            legal: { en: "Contractor access is governed by a supplier agreement that may need invoking.", sv: "Konsultens åtkomst regleras i ett leverantörsavtal som kan behöva åberopas." },
            reputational: { en: "Low immediate impact; high if the attacker returns after the reset.", sv: "Liten direkt påverkan; stor om angriparen kommer tillbaka efter bytet." }
          },
          evaluation: [
            { en: "Considers service accounts, contractors and break-glass accounts, not only staff", sv: "Tar med tjänstekonton, konsulter och nödkonton, inte bara personal" },
            { en: "Plans the order of resets so the team keeps control", sv: "Planerar ordningen för lösenordsbyten så att teamet behåller kontrollen" }
          ],
          discussionMinutes: 8
        },
        facilitator: {
          notes: { en: "Shift the room from “bad luck” to “an exposed door and a long dwell time”. Keep accountability talk short; it belongs in the debrief.", sv: "Flytta gruppen från ”otur” till ”en öppen dörr och lång vistelsetid”. Håll ansvarsdiskussionen kort; den hör hemma i utvärderingen." },
          expected: { en: "The VPN node closed, compromised accounts disabled, a planned reset of privileged credentials, and the contractor's employer contacted.", sv: "VPN-noden stängd, komprometterade konton spärrade, ett planerat byte av privilegierade inloggningsuppgifter och konsultens arbetsgivare kontaktad." },
          hints: [
            { en: "Ask: does anyone know whether the attacker can still log in right now?", sv: "Fråga: vet någon om angriparen kan logga in just nu?" },
            { en: "Ask: which accounts are not in the staff directory at all?", sv: "Fråga: vilka konton finns inte alls i personalkatalogen?" }
          ]
        }
      },

      // ---------------------------------------------------------------------------------------- p4
      {
        id: "p4",
        mandatory: true,
        clock: 930,
        title: { en: "They took the data first", sv: "De tog datan först" },
        twist: { en: "This is not only an outage. It is a data breach — and it is public.", sv: "Det här är inte bara ett avbrott. Det är ett dataintrång – och det är offentligt." },
        twistKind: "scope",
        assumptionChallenged: { en: "Encryption is the whole incident; no personal data has left the network.", sv: "Krypteringen är hela incidenten; inga personuppgifter har lämnat nätverket." },
        reveals: ["hf-exfil"],
        narrative: {
          en: "Saturday, {{time.T+930|clock}}. The crisis management team meets for its morning update, tired after a short night.\n\nOvernight, {{org.name}} was listed on {{actor.name}}'s leak site with a sample of files: payroll exports, customer contracts and scanned ID documents. Until this morning the incident was about systems; now it is about people's data, and it is public.",
          sv: "Lördag, klockan {{time.T+930|clock}}. Krisledningsgruppen samlas för morgonens lägesgenomgång, trött efter en kort natt.\n\nUnder natten har {{org.name}} publicerats på {{actor.name}}s läcksajt med ett urval filer: lönefiler, kundavtal och inskannade id-handlingar. Fram till i morse handlade incidenten om system; nu handlar den om människors uppgifter, och den är offentlig."
        },
        injects: [
          {
            id: "i4-1", at: 930, type: "forensicFinding", source: "forensics",
            severity: "critical", reliability: "confirmed", visibility: "public",
            reveals: ["hf-exfil"],
            headline: { en: "{{num.gbExfil}} GB left the network", sv: "{{num.gbExfil}} GB har lämnat nätverket" },
            content: {
              en: "Firewall logs show {{num.gbExfil}} GB sent to a cloud storage service over three nights, between 01:00 and 04:00, from {{asset.fileServer2}}. The traffic was allowed because your marketing team uses the same service.",
              sv: "Brandväggsloggarna visar att {{num.gbExfil}} GB skickades till en molnlagringstjänst under tre nätter, mellan 01.00 och 04.00, från {{asset.fileServer2}}. Trafiken tilläts eftersom er marknadsavdelning använder samma tjänst."
            },
            tests: ["lo3"]
          },
          {
            id: "i4-2", at: 945, type: "mediaEnquiry", source: "media", pressure: "media",
            severity: "high", reliability: "confirmed", visibility: "public", optional: true,
            content: {
              en: "A reporter from the regional newspaper: “We have seen {{org.shortName}} listed on a ransomware leak site. Can you confirm you have been attacked, and whether customer data is affected? We publish at 14:00.”",
              sv: "En reporter från lokaltidningen: ”Vi har sett att {{org.shortName}} finns på en läcksajt för ransomware. Kan ni bekräfta att ni har blivit angripna och om kunddata berörs? Vi publicerar klockan 14.”"
            },
            tests: ["lo4"]
          },
          {
            id: "i4-3", at: 960, type: "executiveMessage", source: "person.dpo", fallbackRole: "legal",
            severity: "high", reliability: "confirmed", visibility: "public",
            content: {
              en: "“Scanned ID documents and payroll files are personal data, and payroll can show union membership and sick leave — that is sensitive data. If we became aware of a breach yesterday evening, the 72-hour clock to {{reg.dpaShort}} may already be running.”",
              sv: "”Inskannade id-handlingar och lönefiler är personuppgifter, och lönefilerna kan visa fackmedlemskap och sjukfrånvaro – det är känsliga uppgifter. Om vi fick kännedom om en personuppgiftsincident i går kväll kan 72-timmarsfristen mot {{reg.dpaShort}} redan ha börjat löpa.”"
            },
            tests: ["lo3"],
            expectedResponse: { en: "Start the notification assessment now; a first notification can be supplemented later.", sv: "Påbörja bedömningen av anmälan nu; en första anmälan kan kompletteras senare." }
          },
          {
            id: "i4-4", at: 980, type: "customerComplaint", source: "customer", pressure: "customers",
            severity: "medium", reliability: "confirmed", visibility: "public", optional: true,
            content: {
              en: "A key account calls: their contract with you is in the leak sample. They want to know by Monday what else is exposed and what you are doing about it.",
              sv: "En nyckelkund ringer: deras avtal med er finns i läckans urval. De vill veta senast på måndag vad mer som exponerats och vad ni gör åt det."
            },
            tests: ["lo3", "lo4"]
          },
          {
            id: "i4-reentry", at: 940, type: "authLog", source: "siem", branchOnly: true,
            severity: "critical", reliability: "confirmed", visibility: "public",
            headline: { en: "New administrator sign-in overnight", sv: "Ny administratörsinloggning under natten" },
            content: {
              en: "At 03:12 the attacker signed in again with a second administrator account nobody had flagged.",
              sv: "Klockan 03.12 loggade angriparen in igen med ett annat administratörskonto som ingen hade flaggat."
            },
            tests: ["lo1"]
          }
        ],
        branches: [
          {
            when: { decision: "d3", option: "C" },
            addInjects: ["i4-reentry"],
            narrativeAppend: { en: "While the resets waited for the forensic scope, the attacker came back.", sv: "Medan lösenordsbytena väntade på den forensiska avgränsningen kom angriparen tillbaka." }
          }
        ],
        charts: [
          {
            id: "c4-outbound", type: "line",
            title: { en: "Outbound data to cloud storage per night", sv: "Utgående data till molnlagring per natt" },
            caption: { en: "Nights before T+0. Three nights carry almost all of the volume.", sv: "Nätter före T+0. Tre nätter står för nästan hela volymen." },
            unit: { en: "GB", sv: "GB" },
            data: outboundPerNight
          }
        ],
        questions: {
          technical: [
            { text: { en: "How do you establish what was actually taken, and how fast can you give legal and the DPO a defensible answer?", sv: "Hur fastställer ni vad som faktiskt har tagits, och hur snabbt kan ni ge juristen och dataskyddsombudet ett svar som håller?" }, roles: ["socLead", "itOps"] },
            { text: { en: "Why was the exfiltration not detected, and what would have caught it?", sv: "Varför upptäcktes inte exfiltreringen, och vad hade fångat den?" }, roles: ["socLead", "ciso"] },
            { text: { en: "Last night you decided how to handle privileged accounts. Does the data theft change that decision?", sv: "I går kväll beslutade ni hur de privilegierade kontona skulle hanteras. Förändrar datastölden det beslutet?" }, roles: ["ciso", "itOps"], revisits: "d3" }
          ],
          executive: [
            { text: { en: "When did the organisation become “aware” of the breach in the GDPR sense — and what follows from that?", sv: "När fick organisationen ”kännedom” om incidenten i dataskyddsförordningens mening – och vad följer av det?" }, roles: ["dpo", "legal"] },
            { text: { en: "What do you say to the press before 14:00, and who says it?", sv: "Vad säger ni till pressen före klockan 14, och vem säger det?" }, roles: ["comms", "ceo"] },
            { text: { en: "Yesterday the attacker's claim of stolen files was unverified. How did you treat that claim — and what does that teach you?", sv: "I går var angriparens påstående om stulna filer obekräftat. Hur hanterade ni det påståendet – och vad lär ni er av det?" }, roles: ["ceo", "ciso"], revisits: "d2" }
          ]
        },
        challenges: [
          { text: { en: "Employees may read about their own payroll data in the news before they hear it from you.", sv: "Medarbetarna riskerar att läsa om sina egna lönedata i nyheterna innan de hör det från er." } }
        ],
        decision: {
          id: "d4",
          question: { en: "Do you notify {{reg.dpaShort}} now with incomplete information, or wait until you know what was taken?", sv: "Anmäler ni till {{reg.dpaShort}} nu med ofullständig information, eller väntar ni tills ni vet vad som har tagits?" },
          authority: "legal",
          options: [
            { key: "A", text: { en: "Notify now and supplement the notification as facts are confirmed.", sv: "Anmäl nu och komplettera anmälan i takt med att fakta bekräftas." },
              pushback: [
                { title: { en: "“Unknown” in every box", sv: "”Okänt” i varje ruta" }, text: { en: "The notification form asks how many people are affected, which categories of data and what the likely consequences are. Today, the honest answer to almost every question is “unknown”. Legal worries that a vague first notice invites an inspection. Do you send it anyway, and who signs it?", sv: "Anmälningsformuläret frågar hur många som berörs, vilka kategorier av uppgifter och vilka de troliga följderna är. I dag är det ärliga svaret på nästan varje fråga ”okänt”. Juristen oroar sig för att en vag första anmälan bjuder in till tillsyn. Skickar ni den ändå, och vem skriver under?" } },
                { title: { en: "The CEO wants it first", sv: "Vd vill läsa först" }, text: { en: "{{person.ceo.name}} wants to approve the wording before anything goes to the regulator, and is in a meeting for the next two hours. The draft says the company “lost control” of personal data, which the CEO fears reads as an admission. Do you send without the CEO's approval, or let the clock run?", sv: "{{person.ceo.name}} vill godkänna formuleringen innan något går till tillsynsmyndigheten och sitter i möte de närmaste två timmarna. Utkastet säger att företaget ”förlorat kontrollen” över personuppgifter, vilket vd befarar läses som ett erkännande. Skickar ni utan vd:s godkännande, eller låter ni klockan gå?" } },
                { title: { en: "A group you did not mention", sv: "En grupp ni inte nämnde" }, text: { en: "An hour after you notify, HR realises that some of the scanned ID documents belong to job applicants, not employees: people your notification does not mention at all. Do you supplement at once, and how many corrections can you send before it looks as if you do not know what happened?", sv: "En timme efter anmälan inser HR att en del av de inskannade id-handlingarna tillhör arbetssökande, inte anställda: personer som anmälan inte nämner alls. Kompletterar ni direkt, och hur många rättelser kan ni skicka innan det ser ut som att ni inte vet vad som har hänt?" } }
              ]
            },
            { key: "B", text: { en: "Wait until forensics confirms which categories of data were taken.", sv: "Vänta tills den forensiska analysen bekräftat vilka kategorier av uppgifter som tagits." },
              pushback: [
                { title: { en: "The clock started on Friday", sv: "Klockan startade i fredags" }, text: { en: "The DPO argues that the company became aware of a possible breach when the ransom note claimed stolen files on Friday evening. By the time forensics is done, the 72 hours may be long gone. Is “we were waiting to be sure” an explanation you want to put in writing?", sv: "Dataskyddsombudet menar att företaget fick kännedom om en möjlig incident när utpressningsmeddelandet hävdade stulna filer i fredags kväll. När den forensiska analysen är klar kan 72 timmar vara passerade sedan länge. Är ”vi ville vara säkra” en förklaring ni vill sätta på pränt?" } },
                { title: { en: "Forensics says next week", sv: "Forensikerna säger nästa vecka" }, text: { en: "The analysts explain that confirming every category means matching {{num.gbExfil}} GB of outbound traffic against what was on the servers, folder by folder. Their estimate is a week, at least. Do you really wait a week, or set a notification date now regardless of what they find?", sv: "Analytikerna förklarar att bekräfta varje kategori innebär att stämma av {{num.gbExfil}} GB utgående trafik mot det som fanns på servrarna, mapp för mapp. De bedömer att det tar minst en vecka. Väntar ni verkligen en vecka, eller sätter ni ett datum för anmälan nu oavsett vad de hittar?" } },
                { title: { en: "An employee finds their passport", sv: "En medarbetare hittar sitt pass" }, text: { en: "An employee calls HR: a friend has sent them a screenshot from the leak site, and their own passport scan is on it. HR has been told to say nothing until forensics is done. What does HR say to that person today?", sv: "En medarbetare ringer HR: en vän har skickat en skärmbild från läcksajten, och hens eget inskannade pass syns där. HR har fått besked att inte säga något förrän den forensiska analysen är klar. Vad säger HR till den personen i dag?" } }
              ]
            },
            { key: "C", text: { en: "Notify only if the leak site publishes personal data.", sv: "Anmäl bara om läcksajten publicerar personuppgifter." },
              pushback: [
                { title: { en: "The condition is already met", sv: "Villkoret är redan uppfyllt" }, text: { en: "The DPO points at the screen: the sample already published contains payroll exports and scanned ID documents. By your own rule, you should be notifying now. What exactly are you still waiting for, and can you explain it to the DPO?", sv: "Dataskyddsombudet pekar på skärmen: urvalet som redan publicerats innehåller lönefiler och inskannade id-handlingar. Enligt er egen regel borde ni anmäla nu. Vad är det egentligen ni fortfarande väntar på, och kan ni förklara det för dataskyddsombudet?" } },
                { title: { en: "The DPO objects in writing", sv: "Dataskyddsombudet invänder skriftligt" }, text: { en: "The DPO says they will record their disagreement formally, as the role requires. If the regulator ever asks, that note will show the company was advised to notify and chose not to. Are you prepared to overrule your own DPO on paper?", sv: "Dataskyddsombudet säger att hen kommer att dokumentera sin avvikande mening formellt, som rollen kräver. Om tillsynsmyndigheten någon gång frågar visar anteckningen att företaget fick rådet att anmäla och valde att låta bli. Är ni beredda att köra över ert eget dataskyddsombud på papper?" } },
                { title: { en: "The attacker sets your timing", sv: "Angriparen styr er tidplan" }, text: { en: "Your decision now depends on what a criminal posts, and when. If more files appear in the middle of a Sunday night, someone must notice and notify within hours. You have handed the timing of a legal duty to the attacker. Who is on watch, and is that really your plan?", sv: "Ert beslut hänger nu på vad en kriminell publicerar, och när. Om fler filer dyker upp mitt i en söndagsnatt måste någon märka det och anmäla inom några timmar. Ni har lämnat tidpunkten för en lagstadgad skyldighet till angriparen. Vem håller vakt, och är det verkligen er plan?" } }
              ]
            }
          ],
          knowns: [
            { en: "Payroll exports and scanned ID documents are in the published sample.", sv: "Lönefiler och inskannade id-handlingar finns i det publicerade urvalet." },
            { en: "{{num.gbExfil}} GB left the network over three nights.", sv: "{{num.gbExfil}} GB lämnade nätverket under tre nätter." }
          ],
          uncertainties: [
            { en: "The full set of people and data categories affected.", sv: "Hela kretsen av berörda personer och kategorier av uppgifter." },
            { en: "Whether the attacker will publish everything.", sv: "Om angriparen kommer att publicera allt." }
          ],
          tradeoffs: {
            operational: { en: "Preparing a notification takes people away from recovery.", sv: "Att förbereda en anmälan tar folk från återställningsarbetet." },
            security: { en: "Little direct effect, but the regulator may ask hard questions about controls.", sv: "Liten direkt effekt, men tillsynsmyndigheten kan ställa svåra frågor om skyddsåtgärderna." },
            legal: { en: "Missing the 72-hour deadline is itself a breach; a phased notification is allowed.", sv: "Att missa 72-timmarsfristen är i sig en överträdelse; en anmälan i etapper är tillåten." },
            reputational: { en: "Being seen to hide a data breach damages trust far more than the breach itself.", sv: "Att uppfattas dölja ett dataintrång skadar förtroendet betydligt mer än själva intrånget." }
          },
          evaluation: [
            { en: "Counts the deadline from awareness, not from full confirmation", sv: "Räknar fristen från kännedom, inte från fullständig bekräftelse" },
            { en: "Plans communication to affected employees before the press does it for them", sv: "Planerar kommunikationen till berörda medarbetare innan pressen gör det åt dem" }
          ],
          discussionMinutes: 10
        },
        facilitator: {
          notes: { en: "The incident changes category: from IT outage to personal-data breach with legal deadlines. Watch whether the DPO gets the floor.", sv: "Incidenten byter karaktär: från IT-avbrott till personuppgiftsincident med lagstadgade tidsfrister. Se om dataskyddsombudet får ordet." },
          expected: { en: "A decision to notify within 72 hours of awareness, a holding statement for media, and a plan to inform staff first.", sv: "Ett beslut att anmäla inom 72 timmar från kännedom, ett kort besked till media och en plan för att informera personalen först." },
          hints: [
            { en: "Ask: what does the notification have to contain, and what can be added later?", sv: "Fråga: vad måste anmälan innehålla, och vad kan läggas till senare?" },
            { en: "Ask: who tells the employees, and through which channel while email is down?", sv: "Fråga: vem berättar för medarbetarna, och genom vilken kanal när e-posten ligger nere?" }
          ]
        }
      },

      // ---------------------------------------------------------------------------------------- p5
      {
        id: "p5",
        priority: 3,
        clock: 1290,
        title: { en: "The countdown", sv: "Nedräkningen" },
        twist: { en: "Paying is unlikely to stop the leak: this actor has published data from victims who paid.", sv: "Att betala stoppar troligen inte läckan: den här aktören har publicerat data från offer som betalade." },
        twistKind: "impact",
        reconsider: { decision: "d4", pressure: { en: "{{reg.dpaShort}} calls: a journalist has asked them about your breach. They want to know why they are hearing it from the press, and what you knew when.", sv: "{{reg.dpaShort}} ringer: en journalist har frågat dem om ert intrång. De vill veta varför de hör det från pressen, och vad ni visste när." } },
        assumptionChallenged: { en: "Paying the ransom would at least keep the data private.", sv: "Att betala lösensumman skulle åtminstone hålla datan hemlig." },
        narrative: {
          en: "Saturday afternoon, {{time.T+1290|clock}}. The leak site now shows a countdown: {{num.leakDays}} days until full publication. The price on the site has risen to {{num.ransomRaised|currency}}.\n\nThe pressure inside the company is rising just as fast. Management wants every option on the table, the insurer has conditions, and the police have advice. Someone has to decide what {{org.name}} will and will not do.",
          sv: "Lördag eftermiddag, klockan {{time.T+1290|clock}}. Läcksajten visar nu en nedräkning: {{num.leakDays}} dagar till fullständig publicering. Priset på sajten har höjts till {{num.ransomRaised|currency}}.\n\nTrycket inne i företaget stiger lika snabbt. Ledningen vill ha alla alternativ på bordet, försäkringsbolaget har villkor och polisen har råd. Någon måste bestämma vad {{org.name}} ska och inte ska göra."
        },
        injects: [
          {
            id: "i5-1", at: 1290, type: "threatIntel", source: "threatIntel",
            severity: "high", reliability: "unverified", visibility: "public",
            statedReliability: { en: "Moderate confidence", sv: "Måttlig tillförlitlighet" },
            content: {
              en: "Two victims who paid {{actor.name}} earlier this year had their data published anyway within two months. The group has rebranded once and reuses infrastructure from a group that collapsed last year.",
              sv: "Två offer som betalade {{actor.name}} tidigare i år fick ändå sina data publicerade inom två månader. Gruppen har bytt namn en gång och återanvänder infrastruktur från en grupp som upplöstes förra året."
            },
            tests: ["lo3"]
          },
          {
            id: "i5-2", at: 1310, type: "email", source: "insurer",
            severity: "medium", reliability: "confirmed", visibility: "public",
            headline: { en: "Negotiation support and conditions", sv: "Stöd vid förhandling och villkor" },
            content: {
              en: "{{supplier.insurer}}: “We can appoint a negotiator. Any payment requires our prior approval, a sanctions screening of the recipient and documented legal advice.”",
              sv: "{{supplier.insurer}}: ”Vi kan utse en förhandlare. Varje betalning kräver vårt förhandsgodkännande, sanktionskontroll av mottagaren och dokumenterad juridisk rådgivning.”"
            },
            tests: ["lo4"]
          },
          {
            id: "i5-3", at: 1330, type: "phoneTranscript", source: "police", pressure: "lawEnforcement",
            severity: "medium", reliability: "confirmed", visibility: "public", optional: true,
            content: {
              en: "The cyber unit at {{reg.police}}: “We advise against payment. We would like indicators of compromise and a forensic image of the VPN appliance. Please preserve all logs.”",
              sv: "It-brottsenheten hos {{reg.police}}: ”Vi avråder från betalning. Vi vill gärna ha indikatorer på intrånget och en forensisk avbild av VPN-enheten. Bevara alla loggar.”"
            },
            tests: ["lo4"]
          },
          {
            id: "i5-4", at: 1350, type: "executiveMessage", source: "person.ceo",
            severity: "medium", reliability: "confirmed", visibility: "public",
            content: {
              en: "“If paying gets {{org.service.primary|lcfirst}} back by Monday and keeps customer data out of the papers, I want that option on the table.”",
              sv: "”Om en betalning ger oss {{org.service.primary|lcfirst}} tillbaka till måndag och håller kunddata borta från tidningarna vill jag ha det alternativet på bordet.”"
            },
            tests: ["lo4"]
          }
        ],
        charts: [
          {
            id: "c5-kpi", type: "kpi",
            title: { en: "Extortion pressure", sv: "Utpressningstrycket" },
            data: (ctx) => ({
              tiles: [
                { id: "days", label: { en: "Days until full publication", sv: "Dagar till fullständig publicering" }, value: ctx.vars.leakDays, format: "number", tone: "danger" },
                { id: "price", label: { en: "Demanded price", sv: "Begärt belopp" }, value: ctx.vars.ransomRaised, format: "currency", tone: "warn" },
                { id: "records", label: { en: "Personal-data records at risk", sv: "Poster med personuppgifter i riskzonen" }, value: ctx.vars.recordsAffected, format: "number", tone: "warn" }
              ]
            })
          }
        ],
        questions: {
          technical: [
            { text: { en: "If you open a channel to the attacker, what technical information could you gain — and what are the risks?", sv: "Om ni öppnar en kanal till angriparen – vilken teknisk information kan ni få, och vilka är riskerna?" }, roles: ["socLead", "ciso"] },
            { text: { en: "What evidence must you preserve for the police and the insurer, and is anything at risk of being overwritten?", sv: "Vilka bevis måste ni säkra åt polisen och försäkringsbolaget, och riskerar något att skrivas över?" }, roles: ["itOps", "socLead"] },
            { text: { en: "Does the data theft change how you balance restoring against investigating?", sv: "Förändrar datastölden hur ni väger återställning mot utredning?" }, roles: ["incidentCommander", "itOps"], revisits: "d2" }
          ],
          executive: [
            { text: { en: "What are your principles on paying — and were they decided before today?", sv: "Vilka principer har ni för att betala – och var de beslutade före i dag?" }, roles: ["ceo", "legal"] },
            { text: { en: "Who must be involved before any contact with the attacker: board, insurer, police, legal?", sv: "Vilka måste involveras innan någon kontakt med angriparen: styrelse, försäkringsbolag, polis, juridik?" }, roles: ["ceo", "legal"] },
            { text: { en: "Would you still notify the regulator the way you decided this morning, given the countdown?", sv: "Skulle ni fortfarande anmäla till tillsynsmyndigheten på det sätt ni beslutade i morse, med tanke på nedräkningen?" }, roles: ["dpo", "legal"], revisits: "d4" }
          ]
        },
        challenges: [
          { text: { en: "Several board members expect a recommendation by tonight.", sv: "Flera styrelseledamöter förväntar sig en rekommendation i kväll." } }
        ],
        decision: {
          id: "d5",
          question: { en: "How do you respond to the extortion?", sv: "Hur svarar ni på utpressningen?" },
          authority: "ceo",
          options: [
            { key: "A", text: { en: "Open a channel through the insurer's negotiator to buy time, without intending to pay.", sv: "Öppna en kanal via försäkringsbolagets förhandlare för att vinna tid, utan avsikt att betala." },
              pushback: [
                { title: { en: "The negotiator needs a number", sv: "Förhandlaren behöver en siffra" }, text: { en: "The negotiator asks for your walk-away price. Without a figure, they say, the attacker will see through the talks within a day. Do you approve a number you do not intend to pay, and who in the company signs off on it?", sv: "Förhandlaren frågar efter ert högsta bud. Utan en siffra, säger hen, genomskådar angriparen samtalen inom ett dygn. Godkänner ni en siffra ni inte tänker betala, och vem i företaget skriver under på den?" } },
                { title: { en: "The board hears “negotiating”", sv: "Styrelsen hör ”förhandling”" }, text: { en: "A board member hears that you are in talks and assumes a payment is coming. They want the amount pre-approved at tonight's call, “so we are ready”. Do you correct them, and if you never intend to pay, how do you explain why you are talking at all?", sv: "En styrelseledamot hör att ni för samtal och utgår från att en betalning är på väg. Hen vill ha beloppet förhandsgodkänt vid kvällens möte, ”så att vi är redo”. Rättar ni hen, och om ni aldrig tänker betala, hur förklarar ni varför ni pratar alls?" } },
                { title: { en: "A reminder from the attacker", sv: "En påminnelse från angriparen" }, text: { en: "Hours after the channel opens, a new sample appears on the leak site, posted “as a reminder”, and the countdown is cut by a day. So far the talks have bought you less time, not more. Do you keep the channel open, or close it and lose what you hoped to learn?", sv: "Några timmar efter att kanalen öppnats dyker ett nytt urval upp på läcksajten, publicerat ”som en påminnelse”, och nedräkningen kortas med ett dygn. Hittills har samtalen gett er mindre tid, inte mer. Håller ni kanalen öppen, eller stänger ni den och förlorar det ni hoppades få veta?" } }
              ]
            },
            { key: "B", text: { en: "Refuse all contact and publish a factual statement.", sv: "Vägra all kontakt och publicera ett sakligt uttalande." },
              pushback: [
                { title: { en: "They answer in public", sv: "De svarar offentligt" }, text: { en: "Within an hour of your statement, the leak site posts a message mocking it and promises the next batch “for the press”. Customers start calling to ask whether their data is next. Did refusing in public speed up the very damage you wanted to limit?", sv: "Inom en timme efter ert uttalande publicerar läcksajten ett meddelande som hånar det och lovar nästa omgång ”till pressen”. Kunder börjar ringa och fråga om deras uppgifter står på tur. Påskyndade den offentliga vägran just den skada ni ville begränsa?" } },
                { title: { en: "A customer wants you to try", sv: "En kund vill att ni försöker" }, text: { en: "A key account whose contract is in the sample writes that they expect you to do “everything possible” to keep their data private, and that they will hold you responsible if you do not. Refusing all contact is not everything possible. What do you tell them?", sv: "En nyckelkund vars avtal finns i urvalet skriver att de förväntar sig att ni gör ”allt som står i er makt” för att hålla deras uppgifter hemliga, och att de håller er ansvariga annars. Att vägra all kontakt är inte allt som står i er makt. Vad säger ni till dem?" } },
                { title: { en: "Notifying blind", sv: "Anmäla i blindo" }, text: { en: "The response analysts point out that without any contact you cannot see the attacker's list of stolen files, which would show exactly whom you must inform. Your notifications will stay estimates. Is refusing on principle worth notifying people blind?", sv: "Incidentanalytikerna påpekar att utan någon kontakt kan ni inte se angriparens lista över stulna filer, som skulle visa exakt vilka ni måste informera. Era anmälningar förblir uppskattningar. Är det värt att vägra av princip om ni då måste informera i blindo?" } }
              ]
            },
            { key: "C", text: { en: "Prepare to pay if it prevents publication of customer data.", sv: "Förbered en betalning om den förhindrar att kunddata publiceras." },
              pushback: [
                { title: { en: "Screening cannot clear them", sv: "Kontrollen kan inte frikänna dem" }, text: { en: "The insurer's sanctions screening comes back inconclusive: the group's reused infrastructure cannot be ruled out as linked to a sanctioned entity. Paying could itself be illegal. Who is prepared to sign a payment that may break the law?", sv: "Försäkringsbolagets sanktionskontroll ger inget klart besked: gruppens återanvända infrastruktur kan inte uteslutas ha koppling till en sanktionerad aktör. En betalning kan i sig vara olaglig. Vem är beredd att skriva under en betalning som kan bryta mot lagen?" } },
                { title: { en: "Customers, but not staff?", sv: "Kunderna, men inte personalen?" }, text: { en: "The DPO asks why you would pay to protect customer data when employees' payroll files and ID scans are in the same set. If the payment becomes known, staff will read exactly whom the company chose to protect. How do you explain that choice to your own people?", sv: "Dataskyddsombudet frågar varför ni skulle betala för att skydda kunddata när medarbetarnas lönefiler och id-handlingar finns i samma material. Om betalningen blir känd kommer personalen att se exakt vilka företaget valde att skydda. Hur förklarar ni det valet för era egna medarbetare?" } },
                { title: { en: "What exactly are you buying?", sv: "Vad är det ni köper?" }, text: { en: "The attacker's chat clarifies the offer: the price covers “the customer files” only; payroll and ID documents are “a separate conversation”. And this group has published data from victims who paid. What exactly does your money buy, and for how long?", sv: "Angriparens chatt förtydligar erbjudandet: priset gäller bara ”kundfilerna”; lönefiler och id-handlingar är ”ett separat samtal”. Och den här gruppen har publicerat data från offer som betalade. Vad är det egentligen era pengar köper, och för hur länge?" } }
              ]
            }
          ],
          knowns: [
            { en: "The actor has published data from victims who paid.", sv: "Aktören har publicerat data från offer som betalade." },
            { en: "The insurer requires approval and sanctions screening before any payment.", sv: "Försäkringsbolaget kräver godkännande och sanktionskontroll före en betalning." }
          ],
          uncertainties: [
            { en: "Whether a decryption tool would work on your systems.", sv: "Om ett dekrypteringsverktyg skulle fungera på era system." },
            { en: "How customers and staff would react to a payment becoming known.", sv: "Hur kunder och medarbetare skulle reagera om en betalning blev känd." }
          ],
          tradeoffs: {
            operational: { en: "Negotiation can buy time but consumes leadership attention.", sv: "En förhandling kan ge tid men tar ledningens uppmärksamhet." },
            security: { en: "Payment funds future attacks and does not remove the attacker's access.", sv: "En betalning finansierar framtida angrepp och tar inte bort angriparens åtkomst." },
            legal: { en: "Sanctions rules may prohibit payment to some groups.", sv: "Sanktionsregler kan förbjuda betalning till vissa grupper." },
            reputational: { en: "Payments tend to become public sooner or later.", sv: "Betalningar brukar bli kända förr eller senare." }
          },
          evaluation: [
            { en: "Grounds the decision in principles agreed before the crisis, or records that none existed", sv: "Grundar beslutet i principer som fanns före krisen, eller noterar att sådana saknades" },
            { en: "Involves the insurer, legal and law enforcement before acting", sv: "Involverar försäkringsbolaget, juridik och polis innan något görs" }
          ],
          discussionMinutes: 10
        },
        facilitator: {
          notes: { en: "Keep the discussion on decision principles, not morality. Many organisations discover here that no payment policy exists.", sv: "Håll diskussionen på beslutsprinciper, inte moral. Många organisationer upptäcker här att det saknas en policy för betalning." },
          expected: { en: "A documented position on contact and payment, owned by the CEO and supported by legal and the insurer.", sv: "Ett dokumenterat ställningstagande om kontakt och betalning, ägt av vd och förankrat hos juridik och försäkringsbolaget." },
          hints: [
            { en: "Ask: what would you need to believe for paying to be the right choice?", sv: "Fråga: vad skulle ni behöva tro för att en betalning ska vara rätt val?" },
            { en: "Ask: does the board expect to decide this, or to be informed?", sv: "Fråga: förväntar sig styrelsen att fatta beslutet eller att bli informerad?" }
          ]
        }
      },

      // ---------------------------------------------------------------------------------------- p6
      {
        id: "p6",
        priority: 2,
        clock: 2280,
        title: { en: "Monday morning, no matter what", sv: "Måndag morgon, oavsett vad" },
        twist: { en: "The attacker still has a way in.", sv: "Angriparen har fortfarande en väg in." },
        twistKind: "scope",
        reconsider: { decision: "d3", pressure: { en: "The attacker is still inside. If you reset broadly, you broke payroll and the warehouse scanners without stopping them. If you held back, they are using the accounts you left alone.", sv: "Angriparen är fortfarande kvar. Om ni bytte brett slog ni ut lönekopplingen och lagrets skannrar utan att stoppa dem. Om ni avvaktade använder de nu kontona ni lät vara." } },
        assumptionChallenged: { en: "Once the VPN is closed and passwords are reset, the attacker is out.", sv: "När VPN:en är stängd och lösenorden bytta är angriparen ute." },
        reveals: ["hf-persistence"],
        narrative: {
          en: "Sunday, {{time.T+2280|clock}}. After two days of work, rebuilt servers for {{org.service.primary|lcfirst}} are ready for testing.\n\n{{person.ceo.firstName}} wants the warehouse running at 06:00 on Monday: {{num.trucksMonday}} deliveries are booked and two large customers have threatened penalties. The technical team is less certain that the rebuilt environment is clean.",
          sv: "Söndag, klockan {{time.T+2280|clock}}. Efter två dagars arbete är återuppbyggda servrar för {{org.service.primary|lcfirst}} klara för test.\n\n{{person.ceo.firstName}} vill ha lagret igång klockan 06 på måndag: {{num.trucksMonday}} leveranser är bokade och två stora kunder har hotat med vite. Det tekniska teamet är mindre säkert på att den återuppbyggda miljön är ren."
        },
        injects: [
          {
            id: "i6-1", at: 2280, type: "forensicFinding", source: "forensics",
            severity: "critical", reliability: "confirmed", visibility: "public",
            reveals: ["hf-persistence"],
            headline: { en: "Persistence on {{asset.domainController}}", sv: "Persistens på {{asset.domainController}}" },
            content: {
              en: "A scheduled task on {{asset.domainController}} recreates a service account called {{asset.serviceAccount}} every night at 02:00 and adds it to the administrators group. It was created on {{time.T-5600|datetime}} and survived the password resets.",
              sv: "En schemalagd aktivitet på {{asset.domainController}} återskapar ett tjänstekonto som heter {{asset.serviceAccount}} varje natt klockan 02 och lägger till det i administratörsgruppen. Den skapades {{time.T-5600|datetime}} och överlevde lösenordsbytena."
            },
            tests: ["lo5"]
          },
          {
            id: "i6-2", at: 2300, type: "executiveMessage", source: "person.ceo",
            severity: "high", reliability: "confirmed", visibility: "public",
            content: {
              en: "“I have promised our biggest customers we will deliver on Monday. Tell me what it takes to make that happen — not why it can't.”",
              sv: "”Jag har lovat våra största kunder att vi levererar på måndag. Säg vad som krävs för att det ska gå – inte varför det inte går.”"
            },
            tests: ["lo4", "lo5"]
          },
          {
            id: "i6-3", at: 2320, type: "impactReport", source: "person.serviceOwner", fallbackRole: "itOps",
            severity: "medium", reliability: "confirmed", visibility: "public", optional: true,
            content: {
              en: "Manual fallback: the warehouse can run on printed pick lists at about 35% of normal capacity for at most three days, if 20 extra staff are brought in.",
              sv: "Manuell reservrutin: lagret kan köras med utskrivna plocklistor på ungefär 35 procent av normal kapacitet i högst tre dagar, om 20 extra personer tas in."
            },
            tests: ["lo5"]
          },
          {
            id: "i6-4", at: 2340, type: "supplierNotice", source: "supplier", pressure: "suppliers",
            severity: "medium", reliability: "confirmed", visibility: "public", optional: true,
            content: {
              en: "Your transport partner: “Without electronic booking we cannot guarantee Monday slots. We need your decision by 18:00 today.”",
              sv: "Er transportpartner: ”Utan elektronisk bokning kan vi inte garantera måndagens tider. Vi behöver ert besked senast klockan 18 i dag.”"
            },
            tests: ["lo5"]
          },
          {
            id: "i6-negotiator", at: 2290, type: "chat", source: "attacker", branchOnly: true,
            severity: "high", reliability: "unverified", visibility: "public",
            content: {
              en: "Message relayed by the negotiator: “We see you are rebuilding. We still have access. Pay and we will tell you how we got in.”",
              sv: "Meddelande som förhandlaren vidarebefordrar: ”Vi ser att ni bygger om. Vi har fortfarande åtkomst. Betala så berättar vi hur vi kom in.”"
            },
            tests: ["lo3"]
          }
        ],
        branches: [
          {
            when: { decision: "d5", option: "A" },
            addInjects: ["i6-negotiator"],
            narrativeAppend: { en: "The negotiation channel has produced its first reply.", sv: "Förhandlingskanalen har gett sitt första svar." }
          }
        ],
        charts: [
          {
            id: "c6-deps", type: "dependency",
            title: { en: "What {{org.shortName}}'s services depend on", sv: "Vad tjänsterna hos {{org.shortName}} är beroende av" },
            caption: { en: "Services that depend on identity cannot be trusted until it has been rebuilt.", sv: "Tjänster som är beroende av identitetsmiljön går inte att lita på förrän den har byggts om." },
            data: dependencies
          }
        ],
        questions: {
          technical: [
            { text: { en: "How do you verify that identity is clean before you trust rebuilt systems that depend on it?", sv: "Hur verifierar ni att identitetsmiljön är ren innan ni litar på återuppbyggda system som är beroende av den?" }, roles: ["ciso", "itOps"] },
            { text: { en: "What is the minimum safe configuration to run {{org.service.primary|lcfirst}} on Monday, if at all?", sv: "Vilken är den minsta säkra konfigurationen för att köra {{org.service.primary|lcfirst}} på måndag, om alls?" }, roles: ["itOps", "serviceOwner"] },
            { text: { en: "Your credential resets did not remove this persistence. What does that say about the decision you made on Friday night?", sv: "Era lösenordsbyten tog inte bort persistensen. Vad säger det om beslutet ni fattade i fredags kväll?" }, roles: ["ciso", "socLead"], revisits: "d3" }
          ],
          executive: [
            { text: { en: "Who owns the risk if you restart on Monday and the attacker comes back?", sv: "Vem äger risken om ni startar på måndag och angriparen kommer tillbaka?" }, roles: ["ceo", "ciso"] },
            { text: { en: "What do you tell the two customers threatening penalties?", sv: "Vad säger ni till de två kunderna som hotar med vite?" }, roles: ["ceo", "comms"] },
            { text: { en: "Does the recovery strategy you chose on Friday still hold now that identity is compromised?", sv: "Håller återställningsstrategin ni valde i fredags fortfarande nu när identitetsmiljön är komprometterad?" }, roles: ["ceo", "incidentCommander"], revisits: "d2" }
          ]
        },
        challenges: [
          { text: { en: "Rebuilding {{env.directory}} properly is estimated to take {{num.identityRebuildHours}} hours.", sv: "En ordentlig återuppbyggnad av {{env.directory}} beräknas ta {{num.identityRebuildHours}} timmar." } }
        ],
        decision: {
          id: "d6",
          question: { en: "Do you restart the warehouse systems on Monday?", sv: "Startar ni lagrets system på måndag?" },
          authority: "ceo",
          options: [
            { key: "A", text: { en: "Restart {{org.service.primary|lcfirst}} on Monday at 06:00 in a closely monitored segment.", sv: "Starta {{org.service.primary|lcfirst}} på måndag klockan 06 i ett noga övervakat segment." },
              pushback: [
                { title: { en: "A window, not a wall", sv: "Ett fönster, inte en mur" }, text: { en: "The SOC points out that the monitored segment still signs users in against the same directory where the scheduled task was found. The account will be recreated again tonight. When it appears, what exactly will the people watching the segment do, and can they do it before the warehouse opens?", sv: "SOC påpekar att det övervakade segmentet fortfarande loggar in användare mot samma katalogtjänst där den schemalagda aktiviteten hittades. Kontot återskapas igen i natt. När det dyker upp, vad gör de som bevakar segmentet, och hinner de göra det innan lagret öppnar?" } },
                { title: { en: "Nobody will sign", sv: "Ingen vill skriva under" }, text: { en: "The CISO refuses to sign the risk acceptance for the restart and says it must carry the CEO's name. The incident commander agrees. The restart is set for Monday morning and the signature line is still empty. Who signs, by name, before the first truck is loaded?", sv: "Informationssäkerhetschefen vägrar skriva under riskacceptansen för starten och säger att den måste bära vd:s namn. Incidentledaren håller med. Starten är satt till måndag morgon och raden för underskrift är fortfarande tom. Vem skriver under, med namn, innan första lastbilen lastas?" } },
                { title: { en: "The insurer's warning", sv: "Försäkringsbolagets varning" }, text: { en: "{{supplier.insurer}} writes that restarting on a directory with known, unremoved persistence may be treated as negligence, and a second encryption might not be covered. The deliveries are worth a lot; a second outage could cost far more. Are you prepared to carry that loss yourselves?", sv: "{{supplier.insurer}} skriver att en start ovanpå en katalogtjänst med känd persistens som inte tagits bort kan bedömas som oaktsamhet, och att en andra kryptering kanske inte ersätts. Leveranserna är värda mycket; ett andra avbrott kan kosta betydligt mer. Är ni beredda att bära den förlusten själva?" } }
              ]
            },
            { key: "B", text: { en: "Delay until identity has been rebuilt, about {{num.identityRebuildHours}} hours.", sv: "Vänta tills identitetsmiljön är återuppbyggd, ungefär {{num.identityRebuildHours}} timmar." },
              pushback: [
                { title: { en: "The penalties arrive", sv: "Vitena kommer" }, text: { en: "Both customers who threatened penalties send formal notices tonight, and one has already booked a competitor for the rest of the month. Every hour of the rebuild now has a price you can read. Does waiting the full time still look right?", sv: "Båda kunderna som hotade med vite skickar formella krav i kväll, och den ena har redan bokat en konkurrent resten av månaden. Varje timme av ombyggnaden har nu ett pris ni kan läsa. Ser det fortfarande rätt ut att vänta hela tiden?" } },
                { title: { en: "The estimate slips", sv: "Uppskattningen glider" }, text: { en: "IT operations has just found two more systems that trust the old directory and must be rebuilt with it. “About {{num.identityRebuildHours}} hours” is now “maybe twice that”. Do you set a hard deadline for the rebuild, or wait however long it takes?", sv: "IT-driften har just hittat ytterligare två system som litar på den gamla katalogtjänsten och måste byggas om med den. ”Ungefär {{num.identityRebuildHours}} timmar” har blivit ”kanske det dubbla”. Sätter ni en hård tidsgräns för ombyggnaden, eller väntar ni så länge det tar?" } },
                { title: { en: "The slots go to someone else", sv: "Tiderna går till någon annan" }, text: { en: "Your transport partner needs an answer this evening. If you cannot book electronically on Monday, they will release your slots for the whole week to other customers. Delaying the restart may cost you the trucks even after the systems are back. Do you give up the week?", sv: "Er transportpartner behöver besked i kväll. Om ni inte kan boka elektroniskt på måndag släpper de era tider för hela veckan till andra kunder. Att vänta med starten kan kosta er lastbilarna även när systemen är tillbaka. Ger ni upp veckan?" } }
              ]
            },
            { key: "C", text: { en: "Run on manual pick lists on Monday and restore in stages from Tuesday.", sv: "Kör med manuella plocklistor på måndag och återställ stegvis från tisdag." },
              pushback: [
                { title: { en: "Eight people, not twenty", sv: "Åtta personer, inte tjugo" }, text: { en: "The manual fallback needs twenty extra staff. The staffing agency can send eight by Monday morning. With fewer hands, a third of normal capacity becomes much less. Which customers get their deliveries, and who tells the others?", sv: "Den manuella reservrutinen kräver tjugo extra personer. Bemanningsföretaget kan skicka åtta till måndag morgon. Med färre händer blir en tredjedel av normal kapacitet betydligt mindre. Vilka kunder får sina leveranser, och vem berättar för de andra?" } },
                { title: { en: "Printed from where?", sv: "Utskrivna varifrån?" }, text: { en: "The pick lists need Monday's order data, and that data lives in the systems you are not restarting. Someone suggests printing them from the rebuilt server “just this once”. Is a one-off connection really different from a restart?", sv: "Plocklistorna kräver måndagens orderdata, och den finns i systemen ni inte startar. Någon föreslår att skriva ut dem från den återuppbyggda servern ”bara den här gången”. Är en tillfällig anslutning verkligen något annat än en start?" } },
                { title: { en: "Customers want a date", sv: "Kunderna vill ha ett datum" }, text: { en: "The two customers threatening penalties say manual operation is not what they signed for, and want a firm date for full service. “In stages from Tuesday” is not a date. What do you promise them, and who makes that promise?", sv: "De två kunderna som hotar med vite säger att manuell drift inte är vad de har skrivit avtal om, och vill ha ett fast datum för full drift. ”Stegvis från tisdag” är inget datum. Vad lovar ni dem, och vem står för det löftet?" } }
              ]
            }
          ],
          knowns: [
            { en: "The attacker can recreate an administrator account every night.", sv: "Angriparen kan återskapa ett administratörskonto varje natt." },
            { en: "{{num.trucksMonday}} deliveries are booked for Monday.", sv: "{{num.trucksMonday}} leveranser är bokade till måndag." }
          ],
          uncertainties: [
            { en: "Whether other persistence exists that has not yet been found.", sv: "Om det finns annan persistens som ännu inte hittats." },
            { en: "How long customers will accept manual operations.", sv: "Hur länge kunderna accepterar manuell drift." }
          ],
          tradeoffs: {
            operational: { en: "Delay costs deliveries and penalties; manual operation runs at a third of capacity.", sv: "En försening kostar leveranser och viten; manuell drift ger en tredjedel av kapaciteten." },
            security: { en: "Restarting on a compromised identity system can mean a second encryption.", sv: "Att starta ovanpå en komprometterad identitetsmiljö kan innebära en andra kryptering." },
            legal: { en: "Customer contracts may allow force majeure — or may not.", sv: "Kundavtalen kan medge force majeure – eller inte." },
            reputational: { en: "A second outage would be far worse than a planned delay.", sv: "Ett andra avbrott vore betydligt värre än en planerad försening." }
          },
          evaluation: [
            { en: "Names an owner for the residual risk of restarting", sv: "Utser en ägare för den kvarstående risken med att starta" },
            { en: "Uses manual fallbacks to buy time instead of trading away security", sv: "Använder manuella reservrutiner för att vinna tid i stället för att ge avkall på säkerheten" }
          ],
          discussionMinutes: 10
        },
        facilitator: {
          notes: { en: "The CEO's pressure is legitimate; the question is who decides with what information. Avoid making the CEO the villain.", sv: "Vd:s tryck är legitimt; frågan är vem som beslutar och på vilket underlag. Undvik att göra vd till skurk." },
          expected: { en: "Persistence removed before restart; a staged recovery with a named risk owner; customers told what will and will not happen on Monday.", sv: "Persistensen tas bort före start; en stegvis återställning med en utsedd riskägare; kunderna får veta vad som händer och inte händer på måndag." },
          hints: [
            { en: "Ask: what would you need to see on Monday at 05:00 to be confident?", sv: "Fråga: vad skulle ni behöva se klockan 05 på måndag för att känna er trygga?" },
            { en: "Ask: is “partially open” an option?", sv: "Fråga: är ”delvis öppet” ett alternativ?" }
          ]
        }
      },

      // ---------------------------------------------------------------------------------------- p7
      {
        id: "p7",
        priority: 4,
        clock: 2700,
        title: { en: "Your customers are being targeted", sv: "Era kunder angrips" },
        twist: { en: "Stolen invoices are being used to defraud your customers.", sv: "Stulna fakturor används för att lura era kunder." },
        twistKind: "impact",
        assumptionChallenged: { en: "The harm is confined to {{org.shortName}}.", sv: "Skadan är begränsad till {{org.shortName}}." },
        narrative: {
          en: "Sunday {{time.T+2700|daypart}}, {{time.T+2700|clock}}. The incident spreads beyond your own walls.\n\nCustomers are forwarding emails that appear to come from {{org.shortName}}'s finance department, asking them to pay outstanding invoices to a new bank account. The emails look exactly like your real invoices, because they are built from them.",
          sv: "Söndag {{time.T+2700|daypart}}, klockan {{time.T+2700|clock}}. Incidenten sprider sig utanför era egna väggar.\n\nKunder vidarebefordrar mejl som ser ut att komma från ekonomiavdelningen på {{org.shortName}}, där de uppmanas att betala utestående fakturor till ett nytt bankkonto. Mejlen ser exakt ut som era riktiga fakturor, eftersom de är byggda av dem."
        },
        injects: [
          {
            id: "i7-1", at: 2700, type: "phishingEmail", source: "customer",
            severity: "high", reliability: "confirmed", visibility: "public",
            headline: { en: "Updated bank details", sv: "Nya bankuppgifter" },
            content: {
              en: "“Due to a change of bank, please pay all outstanding invoices to the account below. The attached invoice is a copy of your original.” The attachment is a genuine invoice from your system, sent from {{asset.lookalikeDomain}}.",
              sv: "”På grund av byte av bank ber vi er betala alla utestående fakturor till kontot nedan. Bifogad faktura är en kopia av originalet.” Bilagan är en äkta faktura från ert system, skickad från {{asset.lookalikeDomain}}."
            },
            meta: { from: "invoice@{{asset.lookalikeDomain}}", to: { en: "Accounts payable at a customer", sv: "Leverantörsreskontran hos en kund" }, subject: { en: "Updated bank details — please read", sv: "Nya bankuppgifter – läs detta" } },
            tests: ["lo3"]
          },
          {
            id: "i7-2", at: 2730, type: "customerComplaint", source: "customer", pressure: "customers",
            severity: "high", reliability: "confirmed", visibility: "public", optional: true,
            content: {
              en: "A customer paid {{num.fraudAmount|currency}} to the new account this morning and asks who will cover the loss.",
              sv: "En kund betalade {{num.fraudAmount|currency}} till det nya kontot i morse och undrar vem som står för förlusten."
            },
            tests: ["lo3"]
          },
          {
            id: "i7-3", at: 2750, type: "socialPost", source: "socialMedia", pressure: "media",
            severity: "medium", reliability: "misleading", visibility: "public", optional: true,
            content: {
              en: "A post shared 4,000 times: “Don't pay any invoice from {{org.shortName}} — they've been hacked and they're hiding it.”",
              sv: "Ett inlägg som delats 4 000 gånger: ”Betala inga fakturor från {{org.shortName}} – de har blivit hackade och mörkar det.”"
            },
            facilitatorNote: { en: "Partly true, partly misleading: genuine invoices are still valid. Watch whether communication corrects without sounding defensive.", sv: "Delvis sant, delvis vilseledande: äkta fakturor gäller fortfarande. Se om kommunikationen rättar till utan att låta defensiv." },
            tests: ["lo4"]
          }
        ],
        charts: [
          {
            id: "c7-categories", type: "donut",
            title: { en: "What the leaked data contains", sv: "Vad den läckta datan innehåller" },
            caption: { en: "Estimated records by category.", sv: "Uppskattat antal poster per kategori." },
            data: (ctx) => {
              const total = ctx.vars.recordsAffected;
              const employees = Math.min(ctx.org.headcount, Math.round(total * 0.1));
              const invoices = Math.round(total * 0.45);
              const contacts = Math.round(total * 0.35);
              return {
                segments: [
                  { id: "contacts", label: { en: "Customer contacts", sv: "Kundkontakter" }, value: contacts },
                  { id: "invoices", label: { en: "Invoices", sv: "Fakturor" }, value: invoices },
                  { id: "employees", label: { en: "Employee records", sv: "Personaluppgifter" }, value: employees },
                  { id: "other", label: { en: "Contracts and other", sv: "Avtal och övrigt" }, value: Math.max(0, total - employees - invoices - contacts) }
                ]
              };
            }
          }
        ],
        questions: {
          technical: [
            { text: { en: "How do you take down the look-alike domain and help customers verify genuine messages?", sv: "Hur får ni bort den förväxlingsbara domänen och hjälper kunderna att verifiera äkta meddelanden?" }, roles: ["socLead", "itOps"] },
            { text: { en: "Which invoice data was in the stolen set, and can you identify which customers are exposed?", sv: "Vilka fakturauppgifter fanns i det stulna materialet, och kan ni identifiera vilka kunder som är exponerade?" }, roles: ["itOps", "socLead"] },
            { text: { en: "Does this change the scope of the personal-data notification you decided on?", sv: "Påverkar det här omfattningen av den anmälan om personuppgiftsincident som ni beslutade om?" }, roles: ["ciso"], revisits: "d4" }
          ],
          executive: [
            { text: { en: "Do you warn all customers now, before you know who is affected?", sv: "Varnar ni alla kunder nu, innan ni vet vilka som berörs?" }, roles: ["comms", "ceo"] },
            { text: { en: "Who covers a customer's loss — and what does your answer signal?", sv: "Vem står för en kunds förlust – och vad signalerar ert svar?" }, roles: ["ceo", "legal"] },
            { text: { en: "Is what you have said publicly so far still accurate, or do you need to correct something?", sv: "Stämmer det ni hittills har sagt externt fortfarande, eller behöver ni rätta något?" }, roles: ["comms"], revisits: "d4" }
          ]
        },
        challenges: [
          { text: { en: "Your own invoicing system is still offline, so you cannot easily tell customers what they actually owe.", sv: "Ert eget faktureringssystem ligger fortfarande nere, så ni kan inte enkelt tala om för kunderna vad de faktiskt är skyldiga." } }
        ],
        decision: {
          id: "d7",
          question: { en: "How do you warn your customers?", sv: "Hur varnar ni era kunder?" },
          authority: "ceo",
          options: [
            { key: "A", text: { en: "Notify all customers proactively with concrete guidance on verifying invoices.", sv: "Kontakta alla kunder proaktivt med konkreta råd om hur fakturor kan verifieras." },
              pushback: [
                { title: { en: "Your warning looks like the scam", sv: "Er varning ser ut som bedrägeriet" }, text: { en: "Several customers' finance teams quarantine your warning as suspicious: an unexpected email about invoices and bank details is exactly what they were trained to distrust. The ones most at risk may never read it. How do you reach people who no longer trust email from you?", sv: "Flera kunders ekonomiavdelningar sätter er varning i karantän som misstänkt: ett oväntat mejl om fakturor och bankuppgifter är precis vad de har lärt sig att misstro. De som löper störst risk kanske aldrig läser det. Hur når ni människor som inte längre litar på mejl från er?" } },
                { title: { en: "The phones melt", sv: "Telefonerna går varma" }, text: { en: "Hundreds of customers call within the hour. Your agents cannot open the invoicing system to confirm what anyone actually owes, and the queue passes two hours. A customer who gives up waiting may simply pay. What do you tell the agents to say when they cannot confirm anything?", sv: "Hundratals kunder ringer inom en timme. Era handläggare kan inte öppna faktureringssystemet och bekräfta vad någon faktiskt är skyldig, och kön passerar två timmar. En kund som tröttnar på att vänta kanske helt enkelt betalar. Vad ska handläggarna säga när de inte kan bekräfta något?" } },
                { title: { en: "Quoted as an admission", sv: "Citerad som ett erkännande" }, text: { en: "The lawyer for the customer who already paid quotes your warning back to you: you told every customer that invoices were stolen from your systems. They read that as accepting responsibility for the loss. Do you change the wording for the next batch, or stand by it?", sv: "Juristen för kunden som redan betalat citerar er egen varning: ni har talat om för varje kund att fakturor stulits från era system. De läser det som att ni tar ansvar för förlusten. Ändrar ni formuleringen till nästa utskick, eller står ni för den?" } }
              ]
            },
            { key: "B", text: { en: "Notify only customers whose data is confirmed in the leak.", sv: "Kontakta bara kunder vars uppgifter bekräftat finns i läckan." },
              pushback: [
                { title: { en: "Not on your list", sv: "Inte på er lista" }, text: { en: "A customer who is not on your confirmed list calls: they received the fake invoice and paid it yesterday. Your list is incomplete, and you do not know by how much. Do you widen the warning now, or keep to what you can prove?", sv: "En kund som inte finns på er bekräftade lista ringer: de fick den falska fakturan och betalade den i går. Er lista är ofullständig, och ni vet inte hur mycket. Breddar ni varningen nu, eller håller ni er till det ni kan bevisa?" } },
                { title: { en: "Customers compare notes", sv: "Kunderna pratar med varandra" }, text: { en: "In an industry chat group, customers who were warned share your message. Those who were not ask why they had to hear about it from a competitor. To them, a selective warning looks like a cover-up. How do you explain who got told and who did not?", sv: "I en chattgrupp för branschen delar kunder som fått varningen ert meddelande. De som inte fått den undrar varför de fick höra det från en konkurrent. För dem ser en selektiv varning ut som mörkläggning. Hur förklarar ni vem som fick veta och vem som inte fick det?" } },
                { title: { en: "Confirmed takes days", sv: "Bekräftat tar dagar" }, text: { en: "The analysts say confirming exactly whose data is in the stolen set will take days. The fraudulent emails are going out today. Is “confirmed” a standard you can meet before more customers pay, and if not, what replaces it?", sv: "Analytikerna säger att det tar dagar att bekräfta exakt vems uppgifter som finns i det stulna materialet. Bedrägerimejlen går ut i dag. Är ”bekräftat” en nivå ni kan nå innan fler kunder betalar, och om inte, vad ersätter den?" } }
              ]
            },
            { key: "C", text: { en: "Publish a general statement on the website and respond on request.", sv: "Publicera ett allmänt uttalande på webbplatsen och svara på förfrågningar." },
              pushback: [
                { title: { en: "Nobody reads the website", sv: "Ingen läser webbplatsen" }, text: { en: "The customer who lost money says they would never have looked at your website: the fake invoice went straight to their accounts team. A warning people have to go looking for reaches only those who already suspect something. Is a web page really a warning?", sv: "Kunden som förlorade pengar säger att de aldrig skulle ha tittat på er webbplats: den falska fakturan gick direkt till deras ekonomiavdelning. En varning som man måste leta upp når bara dem som redan misstänker något. Är en webbsida verkligen en varning?" } },
                { title: { en: "“You knew and stayed quiet”", sv: "”Ni visste och teg”" }, text: { en: "The paying customer's lawyer argues that you knew customers were being targeted and chose not to warn them directly. A web page will be their exhibit, not your defence. Are you prepared to defend a passive warning in a dispute over who pays the loss?", sv: "Den betalande kundens jurist hävdar att ni visste att kunder angreps och valde att inte varna dem direkt. En webbsida blir deras bevis, inte ert försvar. Är ni beredda att försvara en passiv varning i en tvist om vem som står för förlusten?" } },
                { title: { en: "Respond with what?", sv: "Svara med vad?" }, text: { en: "The requests you invited are arriving, and every one asks the same thing: is this invoice real? With invoicing still offline, nobody can answer. What does “respond on request” mean when you cannot confirm a single invoice?", sv: "Förfrågningarna ni bjöd in kommer, och alla frågar samma sak: är den här fakturan äkta? Med faktureringen fortfarande nere kan ingen svara. Vad betyder ”svara på förfrågningar” när ni inte kan bekräfta en enda faktura?" } }
              ]
            }
          ],
          knowns: [
            { en: "Genuine invoices are being reused from {{asset.lookalikeDomain}}.", sv: "Äkta fakturor återanvänds från {{asset.lookalikeDomain}}." },
            { en: "At least one customer has already paid the fraudulent account.", sv: "Minst en kund har redan betalat till bedragarnas konto." }
          ],
          uncertainties: [
            { en: "How many customers have received the fraudulent email.", sv: "Hur många kunder som har fått bedrägerimejlet." },
            { en: "Whether the bank can recall payments already made.", sv: "Om banken kan återkalla redan gjorda betalningar." }
          ],
          tradeoffs: {
            operational: { en: "A broad warning floods customer service while systems are down.", sv: "En bred varning översvämmar kundtjänst medan systemen ligger nere." },
            security: { en: "Silence lets the fraud continue.", sv: "Tystnad låter bedrägeriet fortsätta." },
            legal: { en: "Liability for customers' losses is unclear and contested.", sv: "Ansvaret för kundernas förluster är oklart och omtvistat." },
            reputational: { en: "Customers forgive an incident more readily than being left uninformed.", sv: "Kunder förlåter en incident lättare än att lämnas oinformerade." }
          },
          evaluation: [
            { en: "Gives customers a concrete way to verify genuine messages", sv: "Ger kunderna ett konkret sätt att verifiera äkta meddelanden" },
            { en: "Coordinates customer messages with the regulator notification and the press line", sv: "Samordnar kundbudskapen med anmälan till tillsynsmyndigheten och pressbudskapet" }
          ],
          discussionMinutes: 8
        },
        facilitator: {
          notes: { en: "The incident now harms third parties. Look for empathy and speed, not perfect information.", sv: "Incidenten skadar nu tredje part. Se efter empati och snabbhet, inte perfekt information." },
          expected: { en: "A proactive warning with a verification channel, a request to take down the domain, and contact with the bank about recalls.", sv: "En proaktiv varning med en kanal för verifiering, en begäran om att domänen tas ned och kontakt med banken om återkallelser." },
          hints: [
            { en: "Ask: how does a customer check that a message really comes from you?", sv: "Fråga: hur kontrollerar en kund att ett meddelande verkligen kommer från er?" },
            { en: "Ask: who talks to the customer who has lost money?", sv: "Fråga: vem pratar med kunden som har förlorat pengar?" }
          ]
        }
      },

      // ---------------------------------------------------------------------------------------- p8
      {
        id: "p8",
        priority: 1,
        clock: 3600,
        title: { en: "Recovery order and residual risk", sv: "Återställningsordning och kvarstående risk" },
        twist: { en: "The newest trustworthy backup is {{num.backupDaysOld}} days old.", sv: "Den senaste säkerhetskopian ni kan lita på är {{num.backupDaysOld}} dagar gammal." },
        twistKind: "impact",
        reconsider: { decision: "d2", pressure: { en: "The newest clean copy is {{num.backupDaysOld}} days old. Restoring it means weeks of orders and invoices re-entered by hand, while the attacker's offer of a working decryption key still stands.", sv: "Den senaste rena kopian är {{num.backupDaysOld}} dagar gammal. Att återställa den betyder veckor av order och fakturor som måste matas in för hand, medan angriparens erbjudande om en fungerande dekrypteringsnyckel fortfarande står." } },
        assumptionChallenged: { en: "Once systems are restored, you are back where you were on Friday.", sv: "När systemen är återställda är ni tillbaka där ni var i fredags." },
        reveals: ["hf-cleancopy"],
        narrative: {
          en: "Monday, {{time.T+3600|clock}}. The offline copy from the archive store has been checked in an isolated environment, and it is clean. Recovery can begin.\n\nBut not everything can come back at once, and not everything will come back as it was. Someone has to decide what comes first, what waits, and what risk the company accepts by switching systems back on.",
          sv: "Måndag, klockan {{time.T+3600|clock}}. Den frånkopplade kopian från arkivet har kontrollerats i en isolerad miljö, och den är ren. Återställningen kan börja.\n\nMen allt kan inte komma tillbaka samtidigt, och allt kommer inte tillbaka som det var. Någon måste bestämma vad som kommer först, vad som får vänta och vilken risk företaget accepterar när systemen slås på igen."
        },
        injects: [
          {
            id: "i8-1", at: 3600, type: "backupReport", source: "itOps",
            severity: "critical", reliability: "confirmed", visibility: "public",
            reveals: ["hf-cleancopy"],
            headline: { en: "Restore test of the offline copy", sv: "Återställningstest av den frånkopplade kopian" },
            content: {
              en: "The offline copy is complete and contains none of the attacker's tools. It is {{num.backupDaysOld}} days old. Everything since — orders, invoices, timesheets — must be recreated from other sources.",
              sv: "Den frånkopplade kopian är komplett och innehåller inga av angriparens verktyg. Den är {{num.backupDaysOld}} dagar gammal. Allt därefter – order, fakturor, tidrapporter – måste återskapas från andra källor."
            },
            tests: ["lo2", "lo5"]
          },
          {
            id: "i8-2", at: 3615, type: "impactReport", source: "person.serviceOwner", fallbackRole: "itOps",
            severity: "high", reliability: "confirmed", visibility: "public",
            content: {
              en: "Estimated loss: {{num.revenueLoss|currency}} per day of downtime. Finance names the month-end invoicing run as the most urgent business process.",
              sv: "Beräknad förlust: {{num.revenueLoss|currency}} per dygn med avbrott. Ekonomi pekar ut månadens faktureringskörning som den mest brådskande verksamhetsprocessen."
            },
            tests: ["lo5"]
          },
          {
            id: "i8-3", at: 3630, type: "regulatorLetter", source: "regulator", pressure: "regulator",
            severity: "medium", reliability: "confirmed", visibility: "public", optional: true,
            content: {
              en: "{{reg.supervisor|cap}} requests a report under {{reg.nis2}} within one month, including the root cause and the measures taken.",
              sv: "{{reg.supervisor|cap}} begär en rapport enligt {{reg.nis2}} inom en månad, med grundorsak och vidtagna åtgärder."
            },
            tests: ["lo3"]
          },
          {
            id: "i8-4", at: 3640, type: "executiveMessage", source: "person.ciso",
            severity: "medium", reliability: "confirmed", visibility: "public", optional: true,
            content: {
              en: "“We can restore in many different orders. What we cannot do is restore without someone signing off on the risk we are accepting.”",
              sv: "”Vi kan återställa i många olika ordningar. Det vi inte kan göra är att återställa utan att någon skriver under på risken vi accepterar.”"
            },
            tests: ["lo5"]
          }
        ],
        charts: [
          {
            id: "c8-rto", type: "rto",
            title: { en: "Recovery time objective against estimated recovery", sv: "Mål för återställningstid jämfört med beräknad återställning" },
            caption: { en: "Hours. Services that depend on identity wait for the directory rebuild.", sv: "Timmar. Tjänster som är beroende av identitetsmiljön väntar på att katalogtjänsten byggs om." },
            unit: { en: "hours", sv: "timmar" },
            data: rtoChart
          }
        ],
        questions: {
          technical: [
            { text: { en: "In what order do you restore, and what must be in place before each system is reconnected?", sv: "I vilken ordning återställer ni, och vad måste finnas på plats innan varje system kopplas in igen?" }, roles: ["itOps", "ciso"] },
            { text: { en: "How will you detect the attacker if they try to come back during recovery?", sv: "Hur upptäcker ni angriparen om den försöker ta sig tillbaka under återställningen?" }, roles: ["socLead"] },
            { text: { en: "Looking back at your containment decision on Friday evening: what would you do differently, knowing the full timeline?", sv: "Om ni ser tillbaka på isoleringsbeslutet i fredags kväll: vad skulle ni göra annorlunda med facit i hand?" }, roles: ["incidentCommander", "socLead"], revisits: "d1" }
          ],
          executive: [
            { text: { en: "Which business process comes back first, and who decides between {{org.service.primary|lcfirst}} and invoicing?", sv: "Vilken verksamhetsprocess kommer tillbaka först, och vem avgör mellan {{org.service.primary|lcfirst}} och faktureringen?" }, roles: ["ceo", "serviceOwner"] },
            { text: { en: "Who formally accepts the residual risk, and how is that documented?", sv: "Vem accepterar formellt den kvarstående risken, och hur dokumenteras det?" }, roles: ["ceo", "ciso"] },
            { text: { en: "Which of your earlier decisions would you now present to the board as right — and which as lessons?", sv: "Vilka av era tidigare beslut skulle ni nu presentera för styrelsen som rätt – och vilka som lärdomar?" }, roles: ["ceo"], revisits: true }
          ]
        },
        challenges: [
          { text: { en: "{{num.backupDaysOld}} days of orders and invoices must be recreated from email, paper and customer records.", sv: "{{num.backupDaysOld}} dagars order och fakturor måste återskapas från e-post, papper och kunduppgifter." } }
        ],
        decision: {
          id: "d8",
          question: { en: "What is your recovery order, and who signs off on the residual risk?", sv: "Vilken återställningsordning väljer ni, och vem skriver under på den kvarstående risken?" },
          authority: "ceo",
          options: [
            { key: "A", text: { en: "Restore strictly by recovery time objective, starting with {{org.service.primary|lcfirst}}.", sv: "Återställ strikt efter mål för återställningstid, med början i {{org.service.primary|lcfirst}}." },
              pushback: [
                { title: { en: "Running blind", sv: "I blindo" }, text: { en: "Monitoring is further down the list, so the SOC cannot see sign-ins on the restored service. If the attacker returns tonight, nobody will notice before morning. Did anyone name that risk when you chose this order, and who owns it now?", sv: "Övervakningen ligger längre ner på listan, så SOC kan inte se inloggningar i den återställda tjänsten. Om angriparen kommer tillbaka i natt märker ingen det före morgonen. Nämnde någon den risken när ni valde ordningen, och vem äger den nu?" } },
                { title: { en: "Deliveries without invoices", sv: "Leveranser utan fakturor" }, text: { en: "Finance objects: the month-end invoicing run is their most urgent process, and without it the company cannot bill for the deliveries you are restarting. Every day of trucks without invoices widens the cash gap. Who decides between moving goods and getting paid?", sv: "Ekonomi invänder: månadens faktureringskörning är deras mest brådskande process, och utan den kan företaget inte fakturera leveranserna ni startar upp. Varje dag med lastbilar men utan fakturor ökar hålet i kassan. Vem avgör mellan att flytta gods och att få betalt?" } },
                { title: { en: "A shortcut to sign in", sv: "En genväg för att logga in" }, text: { en: "The service needs users to sign in, and identity is not rebuilt yet. To meet the recovery target, IT proposes temporary local accounts with a shared password “for a few days”. Do you accept a shortcut like that to hit the target, and who removes it afterwards?", sv: "Tjänsten kräver att användarna loggar in, och identitetsmiljön är inte återuppbyggd. För att nå målet för återställningstid föreslår IT tillfälliga lokala konton med ett gemensamt lösenord ”under några dagar”. Accepterar ni en sådan genväg för att nå målet, och vem tar bort den efteråt?" } }
              ]
            },
            { key: "B", text: { en: "Restore identity and monitoring first, then services by recovery time objective.", sv: "Återställ identitet och övervakning först, därefter tjänsterna efter mål för återställningstid." },
              pushback: [
                { title: { en: "Nothing to show for days", sv: "Inget att visa på flera dagar" }, text: { en: "Identity and monitoring will take days before a single business service returns. {{person.ceo.firstName}} has to tell customers that nothing visible will move until then. Can the business carry that silence, and who stands in front of the customers to say it?", sv: "Identitet och övervakning tar flera dagar innan en enda verksamhetstjänst är tillbaka. {{person.ceo.firstName}} måste berätta för kunderna att inget synligt händer innan dess. Klarar verksamheten den tystnaden, och vem står inför kunderna och säger det?" } },
                { title: { en: "The price of doing it right", sv: "Priset för att göra rätt" }, text: { en: "Finance calculates that the identity-first order adds at least two days of downtime, at about {{num.revenueLoss|currency}} a day. The board will see that figure next to your decision. Who signs for that cost, and can they defend it?", sv: "Ekonomi räknar ut att ordningen med identitet först lägger till minst två dygns avbrott, med ungefär {{num.revenueLoss|currency}} per dygn. Styrelsen kommer att se den siffran bredvid ert beslut. Vem skriver under på den kostnaden, och kan hen försvara den?" } },
                { title: { en: "Restore or rebuild identity?", sv: "Återställa eller bygga om identiteten?" }, text: { en: "The clean copy also holds the old directory, with every account and password policy from before the attack, including the contractor's. Restoring it is fast; building a new one from scratch adds more days. Which do you choose, and does “identity first” still mean what you thought it did?", sv: "Den rena kopian innehåller också den gamla katalogtjänsten, med alla konton och lösenordsregler från före angreppet, även konsultens. Att återställa den går fort; att bygga en ny från grunden tar fler dagar. Vilket väljer ni, och betyder ”identitet först” fortfarande det ni trodde?" } }
              ]
            },
            { key: "C", text: { en: "Restore invoicing first to protect cash flow.", sv: "Återställ faktureringen först för att skydda kassaflödet." },
              pushback: [
                { title: { en: "Billing before delivering", sv: "Fakturera innan ni levererar" }, text: { en: "The service owner warns that customers will receive your invoices while their deliveries are still not moving. A key account has already said they will not pay for orders they have not received. Is invoicing first protecting cash flow, or testing your customers' patience?", sv: "Tjänsteägaren varnar för att kunderna kommer att få era fakturor medan deras leveranser fortfarande står still. En nyckelkund har redan sagt att de inte betalar för order de inte har fått. Skyddar fakturering först kassaflödet, eller prövar den kundernas tålamod?" } },
                { title: { en: "Invoices you cannot stand behind", sv: "Fakturor ni inte kan stå för" }, text: { en: "Invoices from the last {{num.backupDaysOld}} days must be rebuilt from email and paper, and finance expects errors and double billing. Sending them first means sending your least reliable data first. Do you send invoices you cannot fully stand behind?", sv: "Fakturorna från de senaste {{num.backupDaysOld}} dagarna måste återskapas från e-post och papper, och ekonomi räknar med fel och dubbelfakturering. Att skicka dem först innebär att skicka er minst pålitliga data först. Skickar ni fakturor som ni inte fullt ut kan stå för?" } },
                { title: { en: "Bank details without a watch", sv: "Bankuppgifter utan bevakning" }, text: { en: "The CISO points out that invoicing holds bank details and payment flows, and restoring it before monitoring leaves the most valuable system unwatched. If anything is changed there, nobody will see it. Who accepts that risk on the system that handles the money?", sv: "Informationssäkerhetschefen påpekar att faktureringen innehåller bankuppgifter och betalflöden, och att återställa den före övervakningen lämnar det mest värdefulla systemet obevakat. Om något ändras där ser ingen det. Vem accepterar den risken i systemet som hanterar pengarna?" } }
              ]
            }
          ],
          knowns: [
            { en: "A clean offline copy exists, {{num.backupDaysOld}} days old.", sv: "Det finns en ren frånkopplad kopia, {{num.backupDaysOld}} dagar gammal." },
            { en: "Each day of downtime costs about {{num.revenueLoss|currency}}.", sv: "Varje dygn med avbrott kostar ungefär {{num.revenueLoss|currency}}." }
          ],
          uncertainties: [
            { en: "Whether every trace of the attacker has been found.", sv: "Om alla spår av angriparen har hittats." },
            { en: "How much lost data can be recreated.", sv: "Hur mycket av den förlorade datan som går att återskapa." }
          ],
          tradeoffs: {
            operational: { en: "Identity first is slower to show results but makes every later step safer.", sv: "Identitet först ger synliga resultat senare men gör varje senare steg säkrare." },
            security: { en: "Any service restored before monitoring is a blind spot.", sv: "Varje tjänst som återställs före övervakningen blir en blind fläck." },
            legal: { en: "The regulator's report will ask how the recovery order was decided.", sv: "Rapporten till tillsynsmyndigheten kommer att fråga hur återställningsordningen beslutades." },
            reputational: { en: "Customers judge you by when deliveries resume.", sv: "Kunderna bedömer er efter när leveranserna kommer igång." }
          },
          evaluation: [
            { en: "Restores security foundations (identity, monitoring) before business services", sv: "Återställer säkerhetsgrunden (identitet, övervakning) före verksamhetstjänsterna" },
            { en: "Names a person who formally accepts the residual risk", sv: "Utser en person som formellt accepterar den kvarstående risken" }
          ],
          discussionMinutes: 10
        },
        facilitator: {
          notes: { en: "Close the exercise on ownership: who accepts which risk, in writing. Leave time for the debrief.", sv: "Avsluta övningen med ägarskap: vem accepterar vilken risk, skriftligt. Lämna tid till utvärderingen." },
          expected: { en: "Identity and monitoring before services; a documented recovery order; a named owner of residual risk.", sv: "Identitet och övervakning före tjänsterna; en dokumenterad återställningsordning; en utsedd ägare av den kvarstående risken." },
          hints: [
            { en: "Ask: if the attacker returns on Wednesday, who will say they accepted that risk?", sv: "Fråga: om angriparen kommer tillbaka på onsdag, vem kommer att säga att den accepterade den risken?" },
            { en: "Ask: what do you need to recreate first, and from where?", sv: "Fråga: vad behöver ni återskapa först, och varifrån?" }
          ]
        }
      }
    ],

    resolution: {
      type: "partial",
      text: {
        en: "Operations recover over the following weeks. The data cannot be un-leaked: notification, customer support and the regulator's review continue long after the systems are back.",
        sv: "Verksamheten återhämtar sig under de följande veckorna. Det som har läckt går inte att ta tillbaka: anmälan, kundstöd och tillsynsmyndighetens granskning fortsätter långt efter att systemen är tillbaka."
      }
    },

    debrief: {
      keyLessons: [
        { en: "Backup monitoring is a security control: two days of ignored warnings removed the most important recovery option.", sv: "Övervakning av säkerhetskopior är en säkerhetsåtgärd: två dygns ignorerade varningar tog bort det viktigaste återställningsalternativet." },
        { en: "Known, exploited vulnerabilities on internet-facing systems must be patched within days — on every node, with verification.", sv: "Kända, utnyttjade sårbarheter i internetexponerade system måste patchas inom dagar – på varje nod, med kontroll." },
        { en: "Treat attacker claims as hypotheses to test, neither as bluff nor as fact.", sv: "Behandla angriparens påståenden som hypoteser att pröva, varken som bluff eller som fakta." },
        { en: "Authority to disrupt the business must be clear before the incident, especially outside office hours.", sv: "Mandatet att avbryta verksamheten måste vara tydligt före incidenten, särskilt utanför kontorstid." },
        { en: "Recovery without verified identity hygiene invites re-compromise.", sv: "Återställning utan verifierad identitetsmiljö bäddar för ett nytt intrång." }
      ],
      assumptionsVsReality: [
        { assumption: { en: "We can restore from backup.", sv: "Vi kan återställa från backup." }, reality: { en: "Online backups were encrypted 48 hours before the attack became visible.", sv: "De uppkopplade säkerhetskopiorna krypterades 48 timmar innan angreppet blev synligt." }, stage: "p2" },
        { assumption: { en: "It began with a phishing email.", sv: "Det började med ett nätfiskemejl." }, reality: { en: "Valid credentials through an unpatched VPN node, five days earlier.", sv: "Giltiga inloggningsuppgifter via en opatchad VPN-nod, fem dygn tidigare." }, stage: "p3" },
        { assumption: { en: "It is an outage, not a data breach.", sv: "Det är ett avbrott, inte ett dataintrång." }, reality: { en: "{{num.gbExfil}} GB was exfiltrated, including personal data.", sv: "{{num.gbExfil}} GB exfiltrerades, inklusive personuppgifter." }, stage: "p4" },
        { assumption: { en: "Password resets remove the attacker.", sv: "Lösenordsbyten får ut angriparen." }, reality: { en: "A scheduled task on the domain controller recreated an administrator account every night.", sv: "En schemalagd aktivitet på domänkontrollanten återskapade ett administratörskonto varje natt." }, stage: "p6" }
      ],
      strengthsToLookFor: [
        { en: "Escalation and an incident log within minutes", sv: "Eskalering och incidentlogg inom några minuter" },
        { en: "Network isolation rather than power-off, to preserve evidence", sv: "Isolering via nätverket i stället för avstängning, för att bevara spår" },
        { en: "Early involvement of the DPO and legal counsel", sv: "Tidig involvering av dataskyddsombud och jurist" },
        { en: "One spokesperson and a steady rhythm of updates", sv: "En talesperson och en jämn rytm i lägesrapporteringen" }
      ],
      commonGaps: [
        { en: "Nobody owns the decision to stop operations at night", sv: "Ingen äger beslutet att stoppa verksamheten nattetid" },
        { en: "Backups assumed usable without verification", sv: "Säkerhetskopior antas fungera utan kontroll" },
        { en: "The 72-hour clock counted from confirmation instead of awareness", sv: "72-timmarsfristen räknas från bekräftelse i stället för från kännedom" },
        { en: "Contractor and service accounts forgotten in credential resets", sv: "Konsult- och tjänstekonton glöms bort vid lösenordsbyten" }
      ],
      suggestedActions: [
        { text: { en: "Alert on backup job warnings and test restores monthly, including an offline or immutable copy.", sv: "Larma på varningar i backupjobben och testa återställning varje månad, inklusive en frånkopplad eller oföränderlig kopia." }, ownerRole: "itOps", priority: "high" },
        { text: { en: "Patch internet-facing appliances within 72 hours of a critical advisory, and verify every node.", sv: "Patcha internetexponerade enheter inom 72 timmar efter ett kritiskt säkerhetsmeddelande och kontrollera varje nod." }, ownerRole: "ciso", priority: "high" },
        { text: { en: "Require phishing-resistant MFA and managed devices for contractor VPN access.", sv: "Kräv nätfiskeresistent MFA och hanterade enheter för konsulters VPN-åtkomst." }, ownerRole: "ciso", priority: "high" },
        { text: { en: "Document who may disrupt operations out of hours, and how to reach them.", sv: "Dokumentera vem som får avbryta verksamheten utanför kontorstid och hur personen nås." }, ownerRole: "ceo", priority: "medium" },
        { text: { en: "Agree a board-approved position on ransom payment before it is needed.", sv: "Ta fram ett styrelseförankrat ställningstagande om lösensummor innan det behövs." }, ownerRole: "legal", priority: "medium" },
        { text: { en: "Prepare notification templates and a 72-hour timeline for the DPO and communications.", sv: "Förbered mallar för anmälan och en 72-timmarsplan för dataskyddsombud och kommunikation." }, ownerRole: "dpo", priority: "medium" }
      ]
    }
  });
})();
