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
            { key: "A", text: { en: "Isolate the affected file servers only; keep the network and VPN running.", sv: "Isolera bara de drabbade filservrarna; låt nätverket och VPN:en vara igång." } },
            { key: "B", text: { en: "Disconnect from the internet and shut the VPN, accepting that the night shift stops.", sv: "Koppla bort internet och stäng VPN:en, med vetskap om att nattskiftet stoppas." } },
            { key: "C", text: { en: "Keep everything running for 30 minutes while the SOC confirms what is happening.", sv: "Låt allt vara igång i 30 minuter medan SOC bekräftar vad som händer." } }
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
            { key: "A", text: { en: "Restore from the oldest offline copy you can find, accepting data loss.", sv: "Återställ från den äldsta frånkopplade kopia ni kan hitta och acceptera dataförlust." } },
            { key: "B", text: { en: "Rebuild critical systems from scratch in a clean environment.", sv: "Bygg upp kritiska system från grunden i en ren miljö." } },
            { key: "C", text: { en: "Open contact with the attacker to keep the decryption option open while you investigate.", sv: "Ta kontakt med angriparen för att hålla dekrypteringsalternativet öppet medan ni utreder." } }
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
            { key: "A", text: { en: "Reset every privileged and service account now, accepting broken integrations.", sv: "Byt lösenord på alla privilegierade konton och tjänstekonton nu och acceptera trasiga integrationer." } },
            { key: "B", text: { en: "Reset only the accounts known to be compromised and monitor the rest closely.", sv: "Byt bara lösenord på de konton som säkert är komprometterade och övervaka resten noga." } },
            { key: "C", text: { en: "Wait until the forensic scope is clear before resetting anything.", sv: "Vänta tills den forensiska omfattningen är klarlagd innan ni byter några lösenord." } }
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
            { key: "A", text: { en: "Notify now and supplement the notification as facts are confirmed.", sv: "Anmäl nu och komplettera anmälan i takt med att fakta bekräftas." } },
            { key: "B", text: { en: "Wait until forensics confirms which categories of data were taken.", sv: "Vänta tills den forensiska analysen bekräftat vilka kategorier av uppgifter som tagits." } },
            { key: "C", text: { en: "Notify only if the leak site publishes personal data.", sv: "Anmäl bara om läcksajten publicerar personuppgifter." } }
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
            { key: "A", text: { en: "Open a channel through the insurer's negotiator to buy time, without intending to pay.", sv: "Öppna en kanal via försäkringsbolagets förhandlare för att vinna tid, utan avsikt att betala." } },
            { key: "B", text: { en: "Refuse all contact and publish a factual statement.", sv: "Vägra all kontakt och publicera ett sakligt uttalande." } },
            { key: "C", text: { en: "Prepare to pay if it prevents publication of customer data.", sv: "Förbered en betalning om den förhindrar att kunddata publiceras." } }
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
            { key: "A", text: { en: "Restart {{org.service.primary|lcfirst}} on Monday at 06:00 in a closely monitored segment.", sv: "Starta {{org.service.primary|lcfirst}} på måndag klockan 06 i ett noga övervakat segment." } },
            { key: "B", text: { en: "Delay until identity has been rebuilt, about {{num.identityRebuildHours}} hours.", sv: "Vänta tills identitetsmiljön är återuppbyggd, ungefär {{num.identityRebuildHours}} timmar." } },
            { key: "C", text: { en: "Run on manual pick lists on Monday and restore in stages from Tuesday.", sv: "Kör med manuella plocklistor på måndag och återställ stegvis från tisdag." } }
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
            { key: "A", text: { en: "Notify all customers proactively with concrete guidance on verifying invoices.", sv: "Kontakta alla kunder proaktivt med konkreta råd om hur fakturor kan verifieras." } },
            { key: "B", text: { en: "Notify only customers whose data is confirmed in the leak.", sv: "Kontakta bara kunder vars uppgifter bekräftat finns i läckan." } },
            { key: "C", text: { en: "Publish a general statement on the website and respond on request.", sv: "Publicera ett allmänt uttalande på webbplatsen och svara på förfrågningar." } }
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
            { key: "A", text: { en: "Restore strictly by recovery time objective, starting with {{org.service.primary|lcfirst}}.", sv: "Återställ strikt efter mål för återställningstid, med början i {{org.service.primary|lcfirst}}." } },
            { key: "B", text: { en: "Restore identity and monitoring first, then services by recovery time objective.", sv: "Återställ identitet och övervakning först, därefter tjänsterna efter mål för återställningstid." } },
            { key: "C", text: { en: "Restore invoicing first to protect cash flow.", sv: "Återställ faktureringen först för att skydda kassaflödet." } }
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
