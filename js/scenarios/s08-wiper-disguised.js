/*
 * s08-wiper-disguised.js — "Ransom Note Without a Way Back" (archetype A).
 *
 * Apparent ransomware → nobody is waiting for payment → it is a wiper and
 * nothing can be decrypted → authorities link it to a state actor and set terms
 * for information sharing → identity and backup management are destroyed too →
 * weeks of manual operation → pressure to attribute publicly → the insurer
 * invokes a war exclusion.
 *
 * Ground truth: a state-linked group had access for months, staged a wiper
 * disguised as ransomware, and triggered it to cause disruption, not to earn
 * money. No country is named; attribution is left to authorities.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s08-wiper-disguised",
    version: 1,
    category: "malware",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "wiper",
    title: L(["Ransom Note Without a Way Back", "Lösensumma utan väg tillbaka"]),
    summary: L([
      "Screens fill with a ransom note and systems stop booting. It looks like every ransomware case the team has read about — except nobody seems to want the money.",
      "Skärmarna fylls av ett utpressningsmeddelande och systemen slutar starta. Det ser ut som alla ransomwarefall teamet har läst om – förutom att ingen verkar vilja ha pengarna."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Recognise when an incident is destruction, not extortion", "Känna igen när en incident handlar om förstörelse, inte utpressning"]) },
      { id: "lo2", text: L(["Work with national authorities under information-sharing constraints", "Samarbeta med nationella myndigheter med begränsningar i informationsdelningen"]) },
      { id: "lo3", text: L(["Plan a rebuild from scratch, including identity", "Planera en ombyggnad från grunden, inklusive identitetsmiljön"]) },
      { id: "lo4", text: L(["Keep the organisation running on manual procedures", "Hålla verksamheten igång med manuella rutiner"]) }
    ],
    mitre: ["T1485", "T1561", "T1490", "T1078", "T1021", "T1484"],
    frameworks: {
      nistCsf: ["GV.OC", "GV.RM", "ID.RA", "PR.IR", "PR.DS", "RS.MA", "RS.CO", "RC.RP", "RC.CO"],
      iso27001: ["A.5.5", "A.5.6", "A.5.7", "A.5.24", "A.5.26", "A.5.29", "A.5.30", "A.8.13", "A.8.14"]
    },
    minStages: 4,
    maxStages: 8,
    constraints: { startWindow: "business-hours", sectors: ["energy", "transport", "telecom", "logistics", "utilities", "public"] },
    actor: { types: ["state"], motivation: L(["Disruption of critical services as a political signal", "Störning av samhällsviktiga tjänster som en politisk signal"]), capability: "high" },
    variables: {
      hosts: { min: 60, max: 2500, step: 10, scaleBy: "size" },
      servers: { min: 10, max: 300, scaleBy: "size" },
      weeks: { min: 3, max: 10 },
      dwellDays: { min: 40, max: 140 },
      rebuildCost: { min: 2000000, max: 60000000, step: 500000, scaleBy: "size", currency: true }
    },
    roles: ["incidentCommander", "ciso", "cio", "socLead", "itOps", "serviceOwner", "securityOfficer", "legal", "comms", "ceo"],

    groundTruth: {
      rootCause: L([
        "A state-linked group had access for about {{num.dwellDays}} days, obtained through an exposed management interface. They mapped the network, took over domain administration and planted a wiper disguised as ransomware, which they triggered through a group policy to overwrite boot records and files on {{num.hosts}} machines, including domain controllers and backup consoles. The goal was disruption, not payment.",
        "En statskopplad grupp hade åtkomst i ungefär {{num.dwellDays}} dagar, via ett exponerat förvaltningsgränssnitt. De kartlade nätverket, tog över domänadministrationen och placerade ut ett raderingsprogram förklätt till ransomware, som de utlöste via en grupprincip för att skriva över startsektorer och filer på {{num.hosts}} datorer, däribland domänkontrollanter och backupkonsoler. Målet var störning, inte betalning."
      ]),
      attackerTimeline: [
        { at: -201600, text: L(["Access through an exposed management interface.", "Åtkomst via ett exponerat förvaltningsgränssnitt."]) },
        { at: -172800, text: L(["Domain administration taken over.", "Domänadministrationen tas över."]) },
        { at: -2880, text: L(["Wiper staged on file shares and a group policy prepared.", "Raderingsprogrammet placeras ut på filresurser och en grupprincip förbereds."]) },
        { at: -10, text: L(["Group policy pushes the wiper to all machines.", "Grupprincipen skickar ut raderingsprogrammet till alla datorer."]) },
        { at: 0, text: L(["Boot records and files overwritten; fake ransom note displayed.", "Startsektorer och filer skrivs över; ett falskt utpressningsmeddelande visas."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-fake", revealStage: "p2", text: L(["The ransom note is a decoy: no payment infrastructure exists.", "Utpressningsmeddelandet är en kuliss: det finns ingen infrastruktur för betalning."]) },
      { id: "hf-wiper", revealStage: "p3", text: L(["The malware overwrites boot records and files; nothing can be decrypted.", "Skadekoden skriver över startsektorer och filer; ingenting kan dekrypteras."]) },
      { id: "hf-actor", revealStage: "p4", text: L(["Authorities assess the attack as the work of a state-linked group that had access for {{num.dwellDays}} days.", "Myndigheterna bedömer angreppet som utfört av en statskopplad grupp som hade åtkomst i {{num.dwellDays}} dagar."]) },
      { id: "hf-identity", revealStage: "p5", text: L(["Domain controllers and backup consoles were wiped as well; identity must be rebuilt from nothing.", "Domänkontrollanter och backupkonsoler raderades också; identitetsmiljön måste byggas upp från ingenting."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Every screen at once", "Alla skärmar på en gång"]),
        narrative: L([
          "{{time.T+0|day}}, {{time.T+0|clock}}. Within minutes, computers across {{org.name}} restart and show the same red message. Servers stop responding. Phones still work.",
          "{{time.T+0|day}}, klockan {{time.T+0|clock}}. Inom några minuter startar datorer i hela {{org.name}} om och visar samma röda meddelande. Servrar slutar svara. Telefonerna fungerar fortfarande."
        ]),
        injects: [
          inj("i1-1", 0, "ransomNote", "attacker", "critical", "unverified", [
            "“Your files are encrypted. To recover them, send payment to the wallet below and email your ID to the address below. You have 48 hours.”",
            "”Era filer är krypterade. För att få tillbaka dem, skicka betalning till plånboken nedan och mejla ert ID till adressen nedan. Ni har 48 timmar.”"
          ], { headline: ["Red screen", "Röd skärm"], facilitatorNote: ["A decoy. Let the room treat it as ransomware for now.", "En kuliss. Låt gruppen behandla det som ransomware tills vidare."], tests: ["lo1"] }),
          inj("i1-2", 15, "impactReport", "person.serviceOwner", "critical", "confirmed", [
            "{{org.service.primary|cap}} has stopped. Field staff cannot see work orders. Customer service has no system access.",
            "{{org.service.primary|cap}} har stannat. Fältpersonalen ser inga arbetsordrar. Kundtjänst har ingen åtkomst till system."
          ], { tests: ["lo4"] }),
          inj("i1-3", 30, "chat", "person.itOps", "high", "confirmed", [
            "“The machines aren't just locked — some won't boot at all. I've never seen ransomware do that.”",
            "”Datorerna är inte bara låsta – en del går inte att starta alls. Jag har aldrig sett ransomware göra så.”"
          ], { optional: true, tests: ["lo1"] })
        ],
        charts: [{
          id: "c1-offline", type: "line", markers: "injects",
          title: L(["Machines offline", "Datorer som inte svarar"]), unit: L(["machines", "datorer"]),
          data: line(["Machines offline", "Datorer som inte svarar"], -20, 60, 5, (x, ctx) => (x < -5 ? ctx.rng.int(0, 3) : ctx.vars.hosts * (1 - Math.exp(-(x + 5) / 6))))
        }],
        questions: {
          technical: [
            q("What can still be saved — machines that have not restarted yet?", "Vad går fortfarande att rädda – datorer som ännu inte har startat om?", ["itOps", "socLead"]),
            q("How is this spreading so fast, everywhere at once?", "Hur kan det här spridas så snabbt, överallt samtidigt?", ["socLead", "ciso"]),
            q("What must be preserved for later investigation?", "Vad måste säkras för en senare utredning?", ["socLead"])
          ],
          executive: [
            q("Which services must keep running, and how without IT?", "Vilka tjänster måste fortsätta fungera, och hur utan IT?", ["serviceOwner", "ceo"]),
            q("Who do you call first — outside the organisation?", "Vem ringer ni först – utanför organisationen?", ["ceo", "securityOfficer"]),
            q("How do staff communicate if computers are down?", "Hur kommunicerar personalen om datorerna ligger nere?", ["comms", "incidentCommander"])
          ]
        },
        challenges: [ch("Some essential services depend on systems that just stopped.", "Vissa samhällsviktiga tjänster är beroende av system som just har stannat.")],
        decision: dec("d1", "incidentCommander", ["What do you do in the first hour?", "Vad gör ni den första timmen?"], [
          ["Disconnect all networks now, including from the internet, to save what has not been hit.", "Koppla bort alla nät nu, även från internet, för att rädda det som ännu inte har drabbats."],
          ["Isolate affected segments and keep critical systems connected.", "Isolera drabbade segment och låt kritiska system vara uppkopplade."],
          ["Power everything off.", "Stäng av all ström."]
        ], {
          knowns: [["Machines across the organisation are failing at once.", "Datorer i hela organisationen slutar fungera samtidigt."]],
          uncertainties: [["What is still untouched.", "Vad som fortfarande är opåverkat."]],
          tradeoffs: {
            operational: ["A full disconnect stops everything still working.", "En fullständig frånkoppling stoppar allt som fortfarande fungerar."],
            security: ["Keeping anything connected risks losing it too.", "Att låta något vara uppkopplat riskerar att också det går förlorat."],
            legal: ["Powering off destroys evidence authorities may need.", "Att stänga av strömmen förstör spår som myndigheterna kan behöva."],
            reputational: ["Essential services failing is a public matter.", "När samhällsviktiga tjänster faller blir det en offentlig fråga."]
          },
          evaluation: [["Protects what is not yet hit", "Skyddar det som ännu inte har drabbats"], ["Activates manual continuity procedures", "Aktiverar manuella kontinuitetsrutiner"]]
        }),
        facilitator: fac(
          ["Speed of loss is the shock. Note who thinks about manual operations early.", "Takten i förlusten är chocken. Notera vem som tidigt tänker på manuell drift."],
          ["Full network disconnect, manual continuity activated, external contacts started.", "Full frånkoppling av nätverken, manuell kontinuitet aktiverad och externa kontakter påbörjade."],
          [["Ask: which phone numbers do you have on paper?", "Fråga: vilka telefonnummer har ni på papper?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 120,
        title: L(["Nobody to pay", "Ingen att betala"]),
        twist: L(["Nobody is waiting for payment. This is not about money.", "Ingen väntar på betalning. Det här handlar inte om pengar."]),
        twistKind: "cause",
        assumptionChallenged: L(["Criminals want money, so paying is an option.", "Kriminella vill ha pengar, så att betala är ett alternativ."]),
        reveals: ["hf-fake"],
        narrative: L([
          "{{time.T+120|clock}}. The incident response partner has looked at the ransom note.",
          "Klockan {{time.T+120|clock}}. Incidentresponspartnern har tittat på utpressningsmeddelandet."
        ]),
        injects: [
          inj("i2-1", 120, "forensicFinding", "irRetainer", "critical", "confirmed", [
            "{{supplier.irRetainer}}: the email domain in the note was never registered, the wallet address is invalid, and the note is identical on every machine — no victim ID. There is no way to pay.",
            "{{supplier.irRetainer}}: e-postdomänen i meddelandet har aldrig registrerats, plånboksadressen är ogiltig och meddelandet är identiskt på alla datorer – inget offer-ID. Det finns inget sätt att betala."
          ], { headline: ["No payment channel", "Ingen betalningskanal"], reveals: ["hf-fake"], tests: ["lo1"] }),
          inj("i2-2", 150, "email", "insurer", "medium", "confirmed", [
            "{{supplier.insurer}}: “Please confirm whether you are in contact with the threat actor. Do not negotiate without our approval.”",
            "{{supplier.insurer}}: ”Bekräfta om ni har kontakt med hotaktören. Förhandla inte utan vårt godkännande.”"
          ], { optional: true, tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("If it isn't about money, what is it about — and what does that predict?", "Om det inte handlar om pengar, vad handlar det då om – och vad säger det om vad som kommer?", ["ciso", "socLead"]),
            q("What would destroying, rather than locking, data look like on disk?", "Hur skulle det se ut på disken om data förstörts snarare än låsts?", ["socLead", "itOps"]),
            q("Did your first-hour decision save anything?", "Räddade ert beslut den första timmen något?", ["itOps"], "d1")
          ],
          executive: [
            q("Who needs to know that this may be an attack on society, not just you?", "Vilka behöver få veta att det här kan vara ett angrepp mot samhället, inte bara mot er?", ["ceo", "securityOfficer"]),
            q("What changes when paying is no longer an option?", "Vad förändras när betalning inte längre är ett alternativ?", ["ceo", "cio"]),
            q("Would you have acted differently in the first hour, knowing this?", "Skulle ni ha agerat annorlunda under den första timmen, med den här vetskapen?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The board asks how fast you can “get the key”.", "Styrelsen frågar hur snabbt ni kan ”få nyckeln”.")],
        decision: dec("d2", "ceo", ["Who do you bring in now?", "Vilka tar ni in nu?"], [
          ["Report to {{reg.csirt}} and {{reg.police}} now, and treat it as a potential attack on essential services.", "Rapportera till {{reg.csirt}} och {{reg.police}} nu, och behandla det som ett möjligt angrepp på samhällsviktiga tjänster."],
          ["Keep it with your incident response partner until you know more.", "Håll det hos er incidentresponspartner tills ni vet mer."],
          ["Report to the insurer first.", "Rapportera till försäkringsbolaget först."]
        ], {
          knowns: [["There is no payment channel.", "Det finns ingen betalningskanal."]],
          uncertainties: [["Who is behind it, and why.", "Vem som ligger bakom, och varför."]],
          tradeoffs: {
            operational: ["Authorities bring help and constraints.", "Myndigheter bidrar med hjälp och med begränsningar."],
            security: ["Others may be next; early reporting helps them.", "Andra kan stå på tur; tidig rapportering hjälper dem."],
            legal: ["Essential-service operators may have reporting duties.", "Verksamheter med samhällsviktiga tjänster kan ha rapporteringsskyldighet."],
            reputational: ["Silence about an attack on essential services is hard to defend.", "Tystnad om ett angrepp på samhällsviktiga tjänster är svår att försvara."]
          },
          evaluation: [["Escalates to national bodies early", "Eskalerar tidigt till nationella myndigheter"]]
        }),
        facilitator: fac(
          ["The frame shifts from crime to something larger. Let the room feel that.", "Ramen skiftar från brott till något större. Låt gruppen känna det."],
          ["Early reporting to national authorities and a mindset shift from recovery-by-key to rebuild.", "Tidig rapportering till nationella myndigheter och ett skifte i synsätt från återställning med nyckel till ombyggnad."],
          [["Ask: who benefits from your services stopping?", "Fråga: vem tjänar på att era tjänster stannar?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 300,
        title: L(["Nothing to decrypt", "Inget att dekryptera"]),
        twist: L(["It is a wiper. The data is not encrypted — it is gone.", "Det är ett raderingsprogram. Datan är inte krypterad – den är borta."]),
        twistKind: "scope",
        assumptionChallenged: L(["Data is encrypted and could be recovered with a key.", "Datan är krypterad och skulle kunna återställas med en nyckel."]),
        reveals: ["hf-wiper"],
        narrative: L([
          "{{time.T+300|clock}}. The first disk images have been analysed.",
          "Klockan {{time.T+300|clock}}. De första diskavbilderna har analyserats."
        ]),
        injects: [
          inj("i3-1", 300, "forensicFinding", "forensics", "critical", "confirmed", [
            "The malware overwrites the boot record and then fills files with random data. There is no key, because there is no encryption. {{num.hosts}} machines and {{num.servers}} servers are affected.",
            "Skadekoden skriver över startsektorn och fyller sedan filer med slumpdata. Det finns ingen nyckel, eftersom det inte finns någon kryptering. {{num.hosts}} datorer och {{num.servers}} servrar är drabbade."
          ], { headline: ["Wiper confirmed", "Raderingsprogram bekräftat"], reveals: ["hf-wiper"], tests: ["lo1", "lo3"] })
        ],
        charts: [{
          id: "c3-kpi", type: "kpi",
          title: L(["Destruction so far", "Förstörelsen hittills"]),
          data: kpi([
            { id: "hosts", label: ["Machines wiped", "Raderade datorer"], value: (v) => v.hosts, tone: "danger" },
            { id: "servers", label: ["Servers wiped", "Raderade servrar"], value: (v) => v.servers, tone: "danger" },
            { id: "keys", label: ["Decryption keys possible", "Möjliga dekrypteringsnycklar"], value: 0, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("What survived: offline backups, unaffected segments, cloud services?", "Vad överlevde: frånkopplade säkerhetskopior, opåverkade segment, molntjänster?", ["itOps", "cio"]),
            q("Can anything be rebuilt on the existing infrastructure safely?", "Kan något byggas upp på den befintliga infrastrukturen på ett säkert sätt?", ["ciso", "itOps"]),
            q("Was disconnecting the networks enough to stop further wiping?", "Räckte det att koppla bort nätverken för att stoppa ytterligare radering?", ["itOps"], "d1")
          ],
          executive: [
            q("How long can the organisation run manually?", "Hur länge kan organisationen drivas manuellt?", ["serviceOwner", "ceo"]),
            q("What do you tell staff and customers now?", "Vad säger ni till personal och kunder nu?", ["comms", "ceo"]),
            q("Does involving authorities change how you plan recovery?", "Ändrar myndigheternas inblandning hur ni planerar återställningen?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("Recovery now means rebuilding, not restoring — and it will take weeks.", "Återställning innebär nu ombyggnad, inte återläsning – och det kommer att ta veckor.")],
        decision: dec("d3", "cio", ["What is the recovery approach?", "Vilken väg väljer ni för återställningen?"], [
          ["Rebuild critical services from scratch in a new, clean environment, using offline backups only for data.", "Bygg upp kritiska tjänster från grunden i en ny, ren miljö och använd frånkopplade säkerhetskopior endast för data."],
          ["Restore servers from backups into the existing environment.", "Läs tillbaka servrar från säkerhetskopior till den befintliga miljön."],
          ["Wait for the authorities' assessment before rebuilding anything.", "Invänta myndigheternas bedömning innan något byggs upp."]
        ], {
          knowns: [["Data on wiped machines is gone.", "Datan på raderade datorer är borta."]],
          uncertainties: [["Whether the attacker still has access to anything.", "Om angriparen fortfarande har åtkomst till något."]],
          tradeoffs: {
            operational: ["A clean rebuild is slower at first.", "En ren ombyggnad går långsammare i början."],
            security: ["Restoring into the old environment may restore the attacker's access.", "Att läsa tillbaka till den gamla miljön kan återställa angriparens åtkomst."],
            legal: ["Evidence must be kept for the authorities.", "Spår måste bevaras åt myndigheterna."],
            reputational: ["A second wipe would be catastrophic.", "En andra radering vore katastrofal."]
          },
          evaluation: [["Chooses a clean environment over speed", "Väljer en ren miljö framför snabbhet"]]
        }),
        facilitator: fac(
          ["Grief, then planning. Give the room a moment.", "Sorg, sedan planering. Ge gruppen ett ögonblick."],
          ["A clean-room rebuild for critical services, with evidence preserved.", "En ren ombyggnad av kritiska tjänster, med spåren bevarade."],
          [["Ask: what is the minimum that must work in 48 hours?", "Fråga: vad är det minsta som måste fungera inom 48 timmar?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 720,
        title: L(["The authorities arrive", "Myndigheterna kommer"]),
        twist: L(["The authorities link the attack to a state actor — and set rules for what you may share.", "Myndigheterna kopplar angreppet till en statlig aktör – och sätter regler för vad ni får dela."]),
        twistKind: "authority",
        assumptionChallenged: L(["This is our incident to manage and talk about as we see fit.", "Det här är vår incident att hantera och tala om som vi själva vill."]),
        reveals: ["hf-actor"],
        narrative: L([
          "Evening, {{time.T+720|clock}}. Representatives from {{reg.csirt}} and the national security service meet the crisis management team.",
          "Kväll, klockan {{time.T+720|clock}}. Företrädare för {{reg.csirt}} och säkerhetstjänsten möter krisledningsgruppen."
        ]),
        injects: [
          inj("i4-1", 720, "advisory", "csirt", "critical", "confirmed", [
            "Assessment: the attack matches a state-linked group with access for about {{num.dwellDays}} days. Other operators may be targeted. Indicators are shared with you in confidence and must not be published.",
            "Bedömning: angreppet stämmer med en statskopplad grupp som har haft åtkomst i ungefär {{num.dwellDays}} dagar. Andra aktörer kan vara måltavlor. Indikatorer delas med er i förtroende och får inte publiceras."
          ], { headline: ["Assessment shared in confidence", "Bedömning delad i förtroende"], reveals: ["hf-actor"], tests: ["lo2"] }),
          inj("i4-2", 760, "mediaEnquiry", "media", "high", "confirmed", [
            "A national broadcaster: “Sources say your outage is a cyberattack by a foreign state. Can you confirm?”",
            "En rikstäckande kanal: ”Källor säger att ert avbrott är en cyberattack från en främmande stat. Kan ni bekräfta?”"
          ], { optional: true, pressure: "media", tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("How do you use confidential indicators to check what survived?", "Hur använder ni de konfidentiella indikatorerna för att kontrollera det som överlevde?", ["socLead", "ciso"]),
            q("What does {{num.dwellDays}} days of access mean for your rebuild?", "Vad innebär {{num.dwellDays}} dagars åtkomst för er ombyggnad?", ["ciso", "itOps"]),
            q("Does your recovery approach still fit with a state actor in the picture?", "Passar er väg för återställningen fortfarande när en statlig aktör finns med i bilden?", ["cio"], "d3")
          ],
          executive: [
            q("What can you say publicly without breaking the authorities' trust?", "Vad kan ni säga offentligt utan att bryta myndigheternas förtroende?", ["comms", "legal"]),
            q("Who in your organisation may know the confidential details?", "Vilka i er organisation får känna till de konfidentiella detaljerna?", ["securityOfficer", "ceo"]),
            q("Did reporting early pay off?", "Lönade det sig att rapportera tidigt?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("The media know more than you are allowed to confirm.", "Media vet mer än ni får bekräfta.")],
        decision: dec("d4", "ceo", ["What do you say publicly?", "Vad säger ni offentligt?"], [
          ["Confirm a serious cyberattack and cooperation with authorities; do not attribute.", "Bekräfta ett allvarligt cyberangrepp och samarbete med myndigheterna; peka inte ut någon."],
          ["Confirm the authorities' assessment openly.", "Bekräfta myndigheternas bedömning öppet."],
          ["Describe it as a technical fault until the authorities speak.", "Beskriv det som ett tekniskt fel tills myndigheterna uttalar sig."]
        ], {
          knowns: [["Authorities ask you not to publish indicators or attribution.", "Myndigheterna ber er att inte publicera indikatorer eller peka ut någon."]],
          uncertainties: [["When authorities will speak publicly.", "När myndigheterna kommer att uttala sig offentligt."]],
          tradeoffs: {
            operational: ["Saying little keeps cooperation smooth.", "Att säga lite håller samarbetet smidigt."],
            security: ["Attribution can tip off the attacker and harm others' defence.", "Att peka ut någon kan varna angriparen och skada andras försvar."],
            legal: ["Sharing confidential information may breach terms.", "Att dela konfidentiell information kan bryta mot villkoren."],
            reputational: ["Calling it a technical fault would later be exposed.", "Att kalla det ett tekniskt fel skulle senare avslöjas."]
          },
          evaluation: [["Communicates truthfully within the authorities' limits", "Kommunicerar sanningsenligt inom myndigheternas gränser"]]
        }),
        facilitator: fac(
          ["Shared authority. Watch whether comms and security stay aligned.", "Delat mandat. Se om kommunikation och säkerhet håller ihop."],
          ["Truthful public statements, no attribution and a controlled circle of knowledge.", "Sanningsenliga offentliga uttalanden, ingen utpekning och en avgränsad krets som känner till detaljerna."],
          [["Ask: what is true and sayable right now?", "Fråga: vad är sant och går att säga just nu?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 1440,
        title: L(["No identity left", "Ingen identitet kvar"]),
        twist: L(["Domain controllers and backup consoles were wiped too. Nobody can log in to anything.", "Domänkontrollanter och backupkonsoler raderades också. Ingen kan logga in någonstans."]),
        twistKind: "scope",
        assumptionChallenged: L(["Our identity and backup management survived.", "Vår identitetsmiljö och backupförvaltning klarade sig."]),
        reveals: ["hf-identity"],
        narrative: L([
          "The next day, {{time.T+1440|clock}}. The rebuild team tries to restore the directory.",
          "Nästa dag, klockan {{time.T+1440|clock}}. Ombyggnadsteamet försöker återställa katalogtjänsten."
        ]),
        injects: [
          inj("i5-1", 1440, "forensicFinding", "itOps", "critical", "confirmed", [
            "All domain controllers and both backup management consoles were wiped. Offline backup tapes exist but can only be read once a backup server is rebuilt — which needs accounts that no longer exist.",
            "Alla domänkontrollanter och båda backupkonsolerna har raderats. Frånkopplade backupband finns men kan bara läsas när en backupserver har byggts upp – vilket kräver konton som inte längre finns."
          ], { reveals: ["hf-identity"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c5-blast", type: "blast",
          title: L(["What the wiper reached", "Vad raderingsprogrammet nådde"]),
          data: () => ({
            center: { label: L(["Group policy", "Grupprincip"]), status: "compromised" },
            rings: [
              { label: L(["Identity", "Identitet"]), nodes: [{ label: L(["Domain controllers", "Domänkontrollanter"]), status: "down" }, { label: L(["Admin workstations", "Administratörsdatorer"]), status: "down" }] },
              { label: L(["Infrastructure", "Infrastruktur"]), nodes: [{ label: L(["Backup consoles", "Backupkonsoler"]), status: "down" }, { label: L(["File servers", "Filservrar"]), status: "down" }] },
              { label: L(["Survived", "Klarade sig"]), nodes: [{ label: L(["Offline tapes", "Frånkopplade band"]), status: "ok" }, { label: L(["Cloud email", "E-post i molnet"]), status: "unknown" }] }
            ]
          })
        }],
        questions: {
          technical: [
            q("In what order do you rebuild identity, backup and critical services?", "I vilken ordning bygger ni upp identitet, backup och kritiska tjänster?", ["itOps", "cio"]),
            q("How do you make the new environment trustworthy from the first account?", "Hur gör ni den nya miljön pålitlig redan från det första kontot?", ["ciso"]),
            q("Did your choice of recovery approach anticipate this?", "Förutsåg er väg för återställningen det här?", ["cio"], "d3")
          ],
          executive: [
            q("How long can essential services run on paper?", "Hur länge kan samhällsviktiga tjänster drivas på papper?", ["serviceOwner", "ceo"]),
            q("Do you bring in outside help for the rebuild, and at what cost?", "Tar ni in extern hjälp för ombyggnaden, och till vilken kostnad?", ["cio", "ceo"]),
            q("Does the authorities' involvement help or slow the rebuild?", "Hjälper eller bromsar myndigheternas inblandning ombyggnaden?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("Rebuilding identity from nothing takes days before anything else can start.", "Att bygga upp identitetsmiljön från ingenting tar dagar innan något annat kan börja.")],
        decision: dec("d5", "cio", ["What is the rebuild order?", "Vilken ordning väljer ni för ombyggnaden?"], [
          ["Identity and backup first in a clean environment, then services by business priority.", "Identitet och backup först i en ren miljö, därefter tjänsterna efter verksamhetens prioritering."],
          ["The most critical business service first on stand-alone accounts, identity later.", "Den mest kritiska verksamhetstjänsten först med fristående konton, identiteten senare."],
          ["Rebuild everything in parallel with external teams.", "Bygg upp allt parallellt med externa team."]
        ], {
          knowns: [["Identity and backup management are gone.", "Identitetsmiljön och backupförvaltningen är borta."]],
          uncertainties: [["How much of the offline backup is usable.", "Hur mycket av de frånkopplade säkerhetskopiorna som går att använda."]],
          tradeoffs: {
            operational: ["Identity first delays visible progress.", "Identitet först fördröjer synliga framsteg."],
            security: ["Stand-alone accounts create new risks.", "Fristående konton skapar nya risker."],
            legal: ["Essential services may have minimum service obligations.", "Samhällsviktiga tjänster kan ha krav på lägsta servicenivå."],
            reputational: ["The public will measure progress by visible services.", "Allmänheten mäter framsteg utifrån synliga tjänster."]
          },
          evaluation: [["Builds trustworthy identity before dependent services", "Bygger upp en pålitlig identitetsmiljö före de tjänster som är beroende av den"]]
        }),
        facilitator: fac(
          ["Deep technical planning; let the IT voices lead, with business priorities in view.", "Djup teknisk planering; låt IT leda, med verksamhetens prioriteringar i sikte."],
          ["Clean identity and backup first, then services in an agreed order.", "Ren identitet och backup först, därefter tjänsterna i en överenskommen ordning."],
          [["Ask: what is the first account in the new environment, and who creates it?", "Fråga: vilket är det första kontot i den nya miljön, och vem skapar det?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 2880,
        title: L(["Weeks on paper", "Veckor på papper"]),
        twist: L(["The rebuild will take {{num.weeks}} weeks. The organisation must run manually far longer than anyone planned.", "Ombyggnaden kommer att ta {{num.weeks}} veckor. Organisationen måste drivas manuellt betydligt längre än någon har planerat för."]),
        twistKind: "impact",
        assumptionChallenged: L(["Our continuity plan covers a few days without IT.", "Vår kontinuitetsplan täcker några dagar utan IT."]),
        narrative: L([
          "Two days in. Field staff, customer service and finance are improvising.",
          "Två dagar in. Fältpersonal, kundtjänst och ekonomi improviserar."
        ]),
        injects: [
          inj("i6-1", 2880, "impactReport", "person.serviceOwner", "high", "confirmed", [
            "Paper processes work for urgent jobs but are slowing. Staff are exhausted. Invoicing has stopped. The continuity plan assumed 72 hours without IT.",
            "Pappersrutinerna fungerar för akuta uppdrag men går allt långsammare. Personalen är utmattad. Faktureringen har stannat. Kontinuitetsplanen förutsatte 72 timmar utan IT."
          ], { fallbackRole: "itOps", tests: ["lo4"] })
        ],
        charts: [{
          id: "c6-rto", type: "rto",
          title: L(["Recovery time objective against estimated rebuild", "Mål för återställningstid jämfört med beräknad ombyggnad"]),
          caption: L(["Hours.", "Timmar."]),
          data: (ctx) => ({
            services: Object.values(ctx.org.services).map((s, i) => ({ id: s.id, name: s.name, rto: s.rto, rpo: s.rpo, estimate: Math.round(ctx.vars.weeks * 168 * (0.25 + 0.2 * i)) }))
          })
        }],
        questions: {
          technical: [
            q("Which temporary tools could support manual work safely?", "Vilka tillfälliga verktyg skulle kunna stödja det manuella arbetet på ett säkert sätt?", ["itOps", "ciso"]),
            q("How do you prevent shadow IT from creating new risks?", "Hur förhindrar ni att skugg-IT skapar nya risker?", ["ciso"]),
            q("Does your rebuild order still match what the business most needs?", "Stämmer er ordning för ombyggnaden fortfarande med det verksamheten behöver mest?", ["cio"], "d5")
          ],
          executive: [
            q("How do you protect staff from burning out?", "Hur skyddar ni personalen från att gå in i väggen?", ["ceo", "incidentCommander"]),
            q("Which services do you reduce or stop?", "Vilka tjänster minskar ni eller stoppar ni?", ["serviceOwner", "ceo"]),
            q("Did your early continuity decisions hold up?", "Höll era tidiga beslut om kontinuitet?", ["ceo"], "d1")
          ]
        },
        challenges: [ch("Staff are using personal phones and free cloud tools to keep work going.", "Personalen använder privata telefoner och gratis molntjänster för att hålla arbetet igång.")],
        decision: dec("d6", "ceo", ["How do you sustain operations for weeks?", "Hur håller ni verksamheten igång i flera veckor?"], [
          ["Formally reduce services, set shifts and rest, and provide approved temporary tools.", "Minska tjänsterna formellt, inför skift och vila och tillhandahåll godkända tillfälliga verktyg."],
          ["Keep all services running on paper with overtime.", "Håll alla tjänster igång på papper med övertid."],
          ["Let teams find their own solutions.", "Låt teamen hitta egna lösningar."]
        ], {
          knowns: [["The rebuild will take {{num.weeks}} weeks.", "Ombyggnaden kommer att ta {{num.weeks}} veckor."]],
          uncertainties: [["How long staff can sustain the pace.", "Hur länge personalen orkar hålla takten."]],
          tradeoffs: {
            operational: ["Reducing services is visible and unpopular.", "Att minska tjänster märks och är impopulärt."],
            security: ["Uncontrolled tools create new exposure.", "Okontrollerade verktyg skapar ny exponering."],
            legal: ["Working-time and duty-of-care rules apply.", "Regler om arbetstid och arbetsgivarens omsorgsplikt gäller."],
            reputational: ["A controlled reduction is better than a collapse.", "En kontrollerad neddragning är bättre än en kollaps."]
          },
          evaluation: [["Plans for endurance, not only the first days", "Planerar för uthållighet, inte bara för de första dagarna"]]
        }),
        facilitator: fac(
          ["Continuity is a people problem. Let HR-type concerns surface.", "Kontinuitet är en fråga om människor. Låt frågor om personal och arbetsmiljö komma upp."],
          ["A formally reduced service level, rest and shifts, and approved temporary tools.", "En formellt sänkt servicenivå, vila och skift samt godkända tillfälliga verktyg."],
          [["Ask: who is checking on the people doing the work?", "Fråga: vem tar hand om dem som utför arbetet?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 4320,
        title: L(["Pressure to name names", "Press att peka ut"]),
        twist: L(["Politicians and media demand that you name the country; the government asks you not to.", "Politiker och media kräver att ni namnger landet; regeringen ber er att inte göra det."]),
        twistKind: "authority",
        assumptionChallenged: L(["Being open about who attacked us is always right.", "Det är alltid rätt att vara öppen om vem som angrep oss."]),
        narrative: L([
          "Three days in. A parliamentary committee wants a briefing, and journalists have heard a country named.",
          "Tre dagar in. Ett riksdagsutskott vill ha en dragning, och journalister har hört ett land nämnas."
        ]),
        injects: [
          inj("i7-1", 4320, "email", "management", "high", "confirmed", [
            "Government officials: “Attribution is a matter for the state. Please do not name any country, publicly or in briefings, until the government has decided.”",
            "Regeringstjänstemän: ”Attribution är en fråga för staten. Namnge inget land, varken offentligt eller i dragningar, förrän regeringen har beslutat.”"
          ], { tests: ["lo2"] }),
          inj("i7-2", 4350, "socialPost", "socialMedia", "medium", "misleading", [
            "A widely shared post names a country and claims your systems were “wide open”, citing an anonymous employee.",
            "Ett spritt inlägg namnger ett land och påstår att era system var ”vidöppna”, med hänvisning till en anonym anställd."
          ], { optional: true, pressure: "media", facilitatorNote: ["Part speculation, part rumour. Watch whether the group is drawn into correcting details it may not share.", "Delvis spekulation, delvis rykte. Se om gruppen dras in i att rätta detaljer som den inte får dela."], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What technical facts can you share without revealing confidential indicators?", "Vilka tekniska fakta kan ni dela utan att avslöja konfidentiella indikatorer?", ["ciso", "socLead"]),
            q("Is the exposed management interface closed everywhere?", "Är det exponerade förvaltningsgränssnittet stängt överallt?", ["itOps"]),
            q("Did your public line from the first evening hold?", "Höll er offentliga linje från den första kvällen?", ["ciso"], "d4")
          ],
          executive: [
            q("What do you say to the committee?", "Vad säger ni till utskottet?", ["ceo", "legal"]),
            q("How do you answer claims about being “wide open”?", "Hur bemöter ni påståendena om att ni var ”vidöppna”?", ["comms", "ceo"]),
            q("Does your public line still hold, given the pressure?", "Står sig er offentliga linje trots trycket?", ["comms"], "d4")
          ]
        },
        challenges: [ch("Some criticism of your security is fair; some is not.", "En del av kritiken mot er säkerhet är rimlig; en del är det inte.")],
        decision: dec("d7", "ceo", ["How do you handle the political pressure?", "Hur hanterar ni det politiska trycket?"], [
          ["Brief the committee on facts and impact, decline to attribute, and acknowledge your own weaknesses.", "Ge utskottet en dragning om fakta och konsekvenser, avstå från att peka ut någon och erkänn era egna brister."],
          ["Decline the briefing until the authorities speak.", "Tacka nej till dragningen tills myndigheterna har uttalat sig."],
          ["Confirm the country privately to the committee.", "Bekräfta landet för utskottet i förtroende."]
        ], {
          knowns: [["The government asks you not to attribute.", "Regeringen ber er att inte peka ut någon."]],
          uncertainties: [["How long the political pressure will last.", "Hur länge det politiska trycket kommer att vara."]],
          tradeoffs: {
            operational: ["Briefings take leadership time during recovery.", "Dragningar tar ledningens tid under återställningen."],
            security: ["Leaks of confidential details help the attacker.", "Läckor av konfidentiella detaljer hjälper angriparen."],
            legal: ["Breaking confidentiality may have consequences.", "Att bryta sekretessen kan få konsekvenser."],
            reputational: ["Admitting weaknesses builds credibility.", "Att erkänna brister bygger trovärdighet."]
          },
          evaluation: [["Respects the boundary between operator and state", "Respekterar gränsen mellan verksamhet och stat"]]
        }),
        facilitator: fac(
          ["Pressure from above and outside. Integrity and boundaries.", "Tryck uppifrån och utifrån. Integritet och gränser."],
          ["Transparent on facts and impact, silent on attribution, honest about weaknesses.", "Öppna om fakta och konsekvenser, tysta om utpekande och ärliga om brister."],
          [["Ask: what will you be glad you said in a year?", "Fråga: vad kommer ni om ett år att vara glada att ni sa?"]]
        )
      },
      {
        id: "p8",
        priority: 4,
        clock: 10080,
        title: L(["The war exclusion", "Krigsundantaget"]),
        twist: L(["The insurer invokes the war exclusion: a state-linked attack may not be covered.", "Försäkringsbolaget åberopar krigsundantaget: ett statskopplat angrepp kanske inte omfattas."]),
        twistKind: "impact",
        assumptionChallenged: L(["Our cyber insurance will cover the rebuild.", "Vår cyberförsäkring täcker ombyggnaden."]),
        narrative: L([
          "A week later. The rebuild budget has been estimated, and a letter arrives from the insurer.",
          "En vecka senare. Budgeten för ombyggnaden har beräknats, och ett brev kommer från försäkringsbolaget."
        ]),
        injects: [
          inj("i8-1", 10080, "email", "insurer", "high", "confirmed", [
            "{{supplier.insurer}}: “Given the authorities' assessment, we reserve our position under the policy's exclusion for acts of war and state-sponsored operations. Coverage for the rebuild, estimated at {{num.rebuildCost|currency}}, is under review.”",
            "{{supplier.insurer}}: ”Med hänsyn till myndigheternas bedömning förbehåller vi oss rätten att åberopa försäkringens undantag för krigshandlingar och statsstödda operationer. Ersättning för ombyggnaden, beräknad till {{num.rebuildCost|currency}}, prövas.”"
          ], { tests: ["lo3"] })
        ],
        charts: [{
          id: "c8-kpi", type: "kpi",
          title: L(["Cost of the attack", "Angreppets kostnad"]),
          data: kpi([
            { id: "cost", label: ["Estimated rebuild cost", "Beräknad kostnad för ombyggnad"], value: (v) => v.rebuildCost, format: "currency", tone: "danger" },
            { id: "weeks", label: ["Weeks of manual operation", "Veckor med manuell drift"], value: (v) => v.weeks, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("What would a resilient architecture look like next time?", "Hur skulle en motståndskraftig arkitektur se ut nästa gång?", ["cio", "ciso"]),
            q("How do you keep backups and identity recoverable after a total wipe?", "Hur ser ni till att säkerhetskopior och identitet går att återställa efter en total radering?", ["itOps", "ciso"]),
            q("Would a different rebuild order have reduced the cost?", "Hade en annan ordning för ombyggnaden minskat kostnaden?", ["cio"], "d5")
          ],
          executive: [
            q("How do you fund the rebuild if insurance refuses?", "Hur finansierar ni ombyggnaden om försäkringen inte betalar?", ["ceo", "legal"]),
            q("Do you contest the exclusion — and on what basis?", "Bestrider ni undantaget – och på vilken grund?", ["legal"]),
            q("Did your public statements affect the insurer's position?", "Påverkade era offentliga uttalanden försäkringsbolagets hållning?", ["legal"], "d7")
          ]
        },
        challenges: [ch("The same attribution that brought national support may now cost you your insurance.", "Samma utpekande som gav nationellt stöd kan nu kosta er försäkringsskyddet.")],
        decision: dec("d8", "ceo", ["How do you respond to the insurer?", "Hur svarar ni försäkringsbolaget?"], [
          ["Contest the exclusion with legal advice while securing interim funding.", "Bestrid undantaget med juridiskt stöd och säkra samtidigt tillfällig finansiering."],
          ["Accept and fund the rebuild from reserves.", "Acceptera och finansiera ombyggnaden med egna reserver."],
          ["Seek state support as an essential-service operator.", "Sök statligt stöd som verksamhet med samhällsviktiga tjänster."]
        ], {
          knowns: [["The insurer reserves its position.", "Försäkringsbolaget förbehåller sig sin rätt."]],
          uncertainties: [["How a court would view the exclusion.", "Hur en domstol skulle se på undantaget."]],
          tradeoffs: {
            operational: ["The rebuild cannot wait for a legal dispute.", "Ombyggnaden kan inte vänta på en rättslig tvist."],
            security: ["Underfunding the rebuild repeats the weakness.", "En underfinansierad ombyggnad upprepar svagheten."],
            legal: ["War exclusions in cyber policies are contested.", "Krigsundantag i cyberförsäkringar är omstridda."],
            reputational: ["Owners and the public watch how this is handled.", "Ägare och allmänhet följer hur det här hanteras."]
          },
          evaluation: [["Secures recovery funding regardless of the dispute", "Säkrar finansieringen av återställningen oavsett tvisten"]]
        }),
        facilitator: fac(
          ["Close on strategic risk: insurance is not a recovery plan.", "Avsluta med strategisk risk: en försäkring är ingen återställningsplan."],
          ["Interim funding secured, the exclusion contested and resilience investments planned.", "Tillfällig finansiering säkrad, undantaget bestritt och investeringar i motståndskraft planerade."],
          [["Ask: what did you assume insurance would do for you?", "Fråga: vad antog ni att försäkringen skulle göra för er?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Essential services return in stages over several weeks on a newly built, cleaner infrastructure. Funding and the insurance dispute continue, as does the authorities' investigation.",
        "De samhällsviktiga tjänsterna kommer tillbaka stegvis under flera veckor på en nybyggd och renare infrastruktur. Finansieringen och tvisten med försäkringsbolaget fortsätter, liksom myndigheternas utredning."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Not every ransom note means ransomware; check whether payment is even possible.", "Alla utpressningsmeddelanden betyder inte ransomware; kontrollera om betalning ens är möjlig."]),
        L(["Plan continuity for weeks without IT, not days.", "Planera kontinuitet för veckor utan IT, inte dagar."]),
        L(["Identity and backup management must survive a total wipe.", "Identitet och backupförvaltning måste klara en total radering."]),
        L(["Work with authorities early and respect their boundaries.", "Samarbeta tidigt med myndigheterna och respektera deras gränser."])
      ],
      assumptionsVsReality: [
        avr(["Criminals want money.", "Kriminella vill ha pengar."], ["Nobody could be paid.", "Det fanns ingen att betala."], "p2"),
        avr(["Data is encrypted.", "Datan är krypterad."], ["Data was destroyed.", "Datan förstördes."], "p3"),
        avr(["Identity survived.", "Identitetsmiljön klarade sig."], ["Identity and backup consoles were wiped.", "Identitetsmiljön och backupkonsolerna raderades."], "p5"),
        avr(["Insurance will pay.", "Försäkringen betalar."], ["A war exclusion was invoked.", "Ett krigsundantag åberopades."], "p8")
      ],
      strengthsToLookFor: [
        L(["Fast network disconnection", "Snabb frånkoppling av nätverken"]),
        L(["Early escalation to national bodies", "Tidig eskalering till nationella myndigheter"]),
        L(["A clean-room rebuild", "En ren ombyggnad"])
      ],
      commonGaps: [
        L(["Planning around a decryption key", "Att planera utifrån en dekrypteringsnyckel"]),
        L(["Continuity plans that assume days, not weeks", "Kontinuitetsplaner som räknar med dagar, inte veckor"]),
        L(["Restoring into a compromised environment", "Att läsa tillbaka till en komprometterad miljö"])
      ],
      suggestedActions: [
        act(["Keep offline, immutable backups and a recovery path for identity that does not depend on the production directory.", "Ha frånkopplade, oföränderliga säkerhetskopior och en återställningsväg för identitet som inte är beroende av produktionskatalogen."], "cio", "high"),
        act(["Extend continuity plans to several weeks without IT, with tested paper procedures.", "Utöka kontinuitetsplanerna till flera veckor utan IT, med testade pappersrutiner."], "serviceOwner", "high"),
        act(["Remove management interfaces from the internet.", "Ta bort förvaltningsgränssnitt från internet."], "itOps", "high"),
        act(["Review insurance exclusions and plan funding for a total rebuild.", "Granska försäkringens undantag och planera finansieringen av en total ombyggnad."], "legal", "medium"),
        act(["Agree contacts and information-sharing terms with national authorities in advance.", "Kom i förväg överens med nationella myndigheter om kontaktvägar och villkor för informationsdelning."], "securityOfficer", "medium")
      ]
    }
  });
})();
