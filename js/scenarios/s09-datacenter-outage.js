/*
 * s09-datacenter-outage.js — "When the Lights Stay On but Nothing Works" (archetype C).
 *
 * Looks like an equipment fault: the primary data centre overheats → failover
 * fails (replication lag, an undocumented dependency, an expired licence) → the
 * cooling setpoints were changed remotely in the building management system →
 * the recovery point objective is breached → a contractor's default-password
 * account was exposed for weeks → the building owner controls the evidence →
 * the answer is sabotage AND negligence.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s09-datacenter-outage",
    version: 1,
    category: "availability",
    archetype: "benign-lookalike",
    emblem: "datacenter",
    title: L(["When the Lights Stay On but Nothing Works", "När lamporna lyser men inget fungerar"]),
    summary: L([
      "The primary data centre overheats on a quiet night and the disaster-recovery site fails to take over. It looks like bad luck and bad maintenance. Part of it is.",
      "Den primära datahallen överhettas en lugn natt och reservplatsen tar inte över. Det ser ut som otur och dåligt underhåll. En del av det är det."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Run a failover decision under time pressure", "Fatta beslut om övergång till reservmiljö under tidspress"]), teaser: L(["Big decisions on a short clock", "Stora beslut med kort tid"]) },
      { id: "lo2", text: L(["Treat facilities and building systems as part of the attack surface", "Behandla fastighet och fastighetssystem som en del av angreppsytan"]), teaser: L(["Parts of the house you rarely think about", "Delar av huset man sällan tänker på"]) },
      { id: "lo3", text: L(["Handle data loss beyond the recovery point objective", "Hantera dataförlust utöver målet för återställningspunkt"]), teaser: L(["Living with what cannot be recovered", "Att leva med det som inte går att få tillbaka"]) },
      { id: "lo4", text: L(["Keep two explanations open: fault and attack", "Hålla två förklaringar öppna: fel och angrepp"]), teaser: L(["Keeping more than one explanation open", "Att hålla mer än en förklaring öppen"]) }
    ],
    mitre: ["T0831", "T0886", "T1078", "T1133"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.AM", "ID.RA", "PR.IR", "PR.AA", "DE.CM", "RS.MA", "RS.AN", "RC.RP"],
      iso27001: ["A.5.19", "A.5.22", "A.5.24", "A.5.29", "A.5.30", "A.7.11", "A.8.14", "A.8.13", "A.8.20"]
    },
    minStages: 3,
    maxStages: 7,
    constraints: { startWindow: "night", sectors: ["finance", "healthcare", "public", "telecom", "technology", "transport"] },
    actor: { types: ["unknown"], motivation: L(["Unclear: opportunistic access to an exposed building system", "Oklar: opportunistisk åtkomst till ett exponerat fastighetssystem"]), capability: "low" },
    variables: {
      tempPeak: { min: 38, max: 52 },
      lagMinutes: { min: 35, max: 240, step: 5 },
      systems: { min: 12, max: 140, scaleBy: "size" },
      transactions: { min: 800, max: 90000, step: 50, scaleBy: "size" },
      licenceDays: { min: 3, max: 40 },
      yearsUntested: { min: 2, max: 4 }
    },
    roles: ["incidentCommander", "cio", "itOps", "networkLead", "facilities", "serviceOwner", "ciso", "supplierManager", "legal", "comms", "ceo"],

    groundTruth: {
      rootCause: L([
        "The building management system was reachable from the internet through a facilities contractor's remote-access account with its default password. An unknown party logged in several times over weeks and, on the night, raised the cooling setpoints. The failover then failed because replication had lagged for months, a licence server existed only in the primary data centre, and the standby database licence had expired — the failover had not been tested in {{num.yearsUntested}} years.",
        "Fastighetssystemet gick att nå från internet via en fastighetsentreprenörs fjärråtkomstkonto med standardlösenord. En okänd part loggade in flera gånger under några veckor och höjde under natten börvärdena för kylningen. Övergången till reservmiljön misslyckades sedan eftersom replikeringen hade släpat efter i månader, en licensserver bara fanns i den primära datahallen och licensen för reservdatabasen hade gått ut – övergången hade inte testats på {{num.yearsUntested}} år."
      ]),
      attackerTimeline: [
        { at: -40320, text: L(["First login to the building management system with the contractor's default password.", "Första inloggningen i fastighetssystemet med entreprenörens standardlösenord."]) },
        { at: -20160, text: L(["Further logins; configuration pages viewed.", "Fler inloggningar; konfigurationssidor visas."]) },
        { at: -45, text: L(["Cooling setpoints raised and alarms suppressed.", "Kylningens börvärden höjs och larm undertrycks."]) },
        { at: 0, text: L(["Temperature alarms reach IT monitoring.", "Temperaturlarm når IT-övervakningen."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-deps", revealStage: "p2", text: L(["Failover fails because of replication lag, a licence server only in the primary site and an expired standby licence.", "Övergången misslyckas på grund av eftersläpande replikering, en licensserver som bara finns på den primära platsen och en utgången licens för reservmiljön."]) },
      { id: "hf-bms", revealStage: "p3", text: L(["Cooling setpoints were changed remotely through the building management system 45 minutes before the alarms.", "Kylningens börvärden ändrades på distans via fastighetssystemet 45 minuter före larmen."]) },
      { id: "hf-loss", revealStage: "p4", text: L(["{{num.lagMinutes}} minutes of transactions — about {{num.transactions}} — exist only in the overheated primary site.", "{{num.lagMinutes}} minuters transaktioner – ungefär {{num.transactions}} – finns bara i den överhettade primära datahallen."]) },
      { id: "hf-account", revealStage: "p5", text: L(["The building system was reachable through a contractor account with a default password, used by an unknown party for weeks.", "Fastighetssystemet gick att nå via ett entreprenörskonto med standardlösenord, som en okänd part använde i flera veckor."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Too hot", "För varmt"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. A quiet night, until temperature alarms from the primary data centre reach IT on-call. Servers in hall A are slowing themselves down to cope with the heat, and some have already shut down.\n\nThe facilities on-call phone goes to voicemail. Every critical service runs in that hall, and the disaster-recovery site has been sitting ready, untouched, for years.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. En lugn natt, tills temperaturlarm från det primära datacentret når IT-jouren. Servrarna i hall A sänker sin egen prestanda för att klara värmen, och några har redan stängt av sig.\n\nFastighetsjourens telefon går till röstbrevlådan. Varje kritisk tjänst körs i den hallen, och reservplatsen har stått redo, orörd, i flera år."
        ]),
        injects: [
          inj("i1-1", 0, "siemAlert", "itOps", "high", "confirmed", [
            "Inlet temperature in hall A rising quickly, now {{num.tempPeak}} °C. Two racks have powered down automatically.",
            "Inloppstemperaturen i hall A stiger snabbt, nu {{num.tempPeak}} °C. Två rack har stängts av automatiskt."
          ], { headline: ["Temperature critical", "Kritisk temperatur"], tests: ["lo1"] }),
          inj("i1-2", 20, "phoneTranscript", "person.facilities", "medium", "unverified", [
            "“The cooling units are running, but the building system shows a much higher setpoint than normal. Maybe a sensor fault. I can be there in an hour.”",
            "”Kylaggregaten går, men fastighetssystemet visar ett mycket högre börvärde än normalt. Kanske ett givarfel. Jag kan vara där om en timme.”"
          ], { fallbackRole: "itOps", tests: ["lo4"] })
        ],
        charts: [{
          id: "c1-temp", type: "line", markers: "injects",
          title: L(["Inlet temperature, hall A", "Inloppstemperatur, hall A"]), unit: L(["°C", "°C"]),
          data: line(["Inlet temperature", "Inloppstemperatur"], -90, 30, 5, (x, ctx) => (x < -45 ? 22 + ctx.rng.float(0, 1) : 22 + (ctx.vars.tempPeak - 22) * (1 - Math.exp(-(x + 45) / 30))))
        }],
        questions: {
          technical: [
            q("How long until critical systems shut down on their own?", "Hur lång tid tar det innan kritiska system stänger av sig själva?", ["itOps", "networkLead"]),
            q("Which systems would you shut down first to reduce heat?", "Vilka system skulle ni stänga av först för att minska värmen?", ["itOps"]),
            q("Is the disaster-recovery site ready to take over?", "Är reservplatsen redo att ta över?", ["itOps", "cio"])
          ],
          executive: [
            q("Who can authorise a failover in the middle of the night?", "Vem kan godkänna en övergång till reservmiljön mitt i natten?", ["cio", "incidentCommander"]),
            q("What does the business lose for every hour of outage?", "Vad förlorar verksamheten för varje timme som systemen ligger nere?", ["serviceOwner", "ceo"]),
            q("Who needs to be woken up?", "Vilka behöver väckas?", ["incidentCommander"])
          ]
        },
        challenges: [ch("Facilities is an hour away; the hall will be too hot in less.", "Fastighetsjouren är en timme bort; hallen blir för varm innan dess.")],
        decision: dec("d1", "cio", ["What do you do now?", "Vad gör ni nu?"], [
          ["Start a controlled failover to the disaster-recovery site now.", "Starta en kontrollerad övergång till reservplatsen nu."],
          ["Shut down non-critical systems to buy time until facilities arrives.", "Stäng av icke-kritiska system för att vinna tid tills fastighetsjouren är på plats."],
          ["Wait for facilities to diagnose the cooling.", "Vänta på att fastighetsjouren felsöker kylningen."]
        ], {
          knowns: [["The temperature is rising fast.", "Temperaturen stiger snabbt."]],
          uncertainties: [["Why the setpoint changed.", "Varför börvärdet ändrades."], ["Whether failover works.", "Om övergången fungerar."]],
          tradeoffs: {
            operational: ["Failover at night with few staff is risky.", "En övergång på natten med lite personal är riskfylld."],
            security: ["An unexplained setpoint change deserves a second look.", "En oförklarad ändring av börvärdet förtjänar en närmare granskning."],
            legal: ["Service agreements define acceptable downtime.", "Serviceavtal anger vilken nedtid som är acceptabel."],
            reputational: ["Customers notice outages before you announce them.", "Kunder märker avbrott innan ni meddelar dem."]
          },
          evaluation: [["Acts before automatic shutdowns decide for you", "Agerar innan automatiska avstängningar beslutar åt er"], ["Notes the odd setpoint as worth investigating", "Noterar det märkliga börvärdet som något att utreda"]],
          pushback: {
            A: [
              pb(["A runbook nobody has used", "En körbok som ingen har använt"], ["The on-call engineer opens the failover runbook: it was last updated years ago and refers to servers that have since been renamed. Nobody on tonight's call has done a real failover. Do you start it anyway with a skeleton crew, or buy time first?", "Jourteknikern öppnar körboken för övergången: den uppdaterades senast för flera år sedan och hänvisar till servrar som har bytt namn. Ingen i nattens samtal har gjort en riktig övergång. Startar ni ändå med en minimal bemanning, eller köper ni tid först?"]),
              pb(["The night batch is halfway", "Nattkörningen är halvvägs"], ["The service owner calls: the nightly batch run is halfway through, and a failover now cuts it off mid-stream. Restarting it on the standby site means checking every record by hand in the morning. Do you interrupt it, or let it finish while the hall heats up?", "Tjänsteägaren ringer: nattens batchkörning är halvvägs, och en övergång nu bryter den mitt i. Att starta om den på reservplatsen innebär att varje post måste kontrolleras för hand i morgon bitti. Avbryter ni den, eller låter ni den bli klar medan hallen blir varmare?"]),
              pb(["Maybe it's just a sensor", "Kanske bara en givare"], ["The facilities technician repeats it: the higher setpoint could be a sensor fault. If it is, you are moving every critical service on a reading nobody has checked, and moving back will take a day. Do you commit to something this hard to reverse on an unverified number?", "Fastighetsteknikern upprepar det: det högre börvärdet kan vara ett givarfel. I så fall flyttar ni varje kritisk tjänst på grund av ett värde som ingen har kontrollerat, och att flytta tillbaka tar ett dygn. Binder ni er för något så svårt att ångra på ett overifierat värde?"])
            ],
            B: [
              pb(["The curve barely bends", "Kurvan böjer knappt av"], ["The test and development racks are off, and the temperature curve has barely flattened: it still climbs a degree every few minutes. Facilities is still forty minutes away. Do you start switching off systems that someone does call critical, or admit this will not buy enough time?", "Test- och utvecklingsracken är avstängda, och temperaturkurvan har knappt planat ut: den stiger fortfarande en grad med några minuters mellanrum. Fastighetsjouren är fortfarande fyrtio minuter bort. Börjar ni stänga av system som någon faktiskt kallar kritiska, eller erkänner ni att det här inte köper tillräckligt med tid?"]),
              pb(["Everything is critical to someone", "Allt är kritiskt för någon"], ["Every owner you wake insists their system cannot go: reporting, the partner portal, a payroll job due tonight. You are spending the minutes you meant to buy arguing about the list. Who has the final say on what is non-critical, right now?", "Varje ägare ni väcker hävdar att just deras system inte kan stängas: rapporteringen, partnerportalen, en lönekörning som ska gå i natt. Ni lägger minuterna ni ville köpa på att bråka om listan. Vem har sista ordet om vad som är icke-kritiskt, just nu?"]),
              pb(["A database will not come back", "En databas vill inte starta"], ["Two of the systems you powered off were in the middle of writing. One database now says it needs a consistency check on restart that will take hours. Was that cost worth the degrees you saved, and do you keep shutting things down the same way?", "Två av systemen ni stängde av höll på att skriva data. En databas säger nu att den behöver en konsistenskontroll vid omstart som tar flera timmar. Var den kostnaden värd graderna ni vann, och fortsätter ni stänga av på samma sätt?"])
            ],
            C: [
              pb(["Another rack goes dark", "Ännu ett rack slocknar"], ["While you wait, another rack shuts itself down, and this one runs part of a customer-facing service. The technician is still forty minutes away. How many more automatic shutdowns will you accept before you act yourselves?", "Medan ni väntar stänger ännu ett rack av sig självt, och det här kör en del av en kundnära tjänst. Teknikern är fortfarande fyrtio minuter bort. Hur många fler automatiska avstängningar accepterar ni innan ni själva agerar?"]),
              pb(["Drives above their limit", "Diskar över sin gräns"], ["The storage array starts logging warnings: drives are now above their rated temperature. Damage from heat does not show up tonight, it shows up as failures over the coming weeks. Are you waiting to protect the hardware, or to avoid a decision?", "Lagringssystemet börjar logga varningar: diskarna är nu över sin märktemperatur. Värmeskador syns inte i natt, de syns som haverier under de kommande veckorna. Väntar ni för att skydda hårdvaran, eller för att slippa fatta ett beslut?"]),
              pb(["“Why are we waiting?”", "”Varför väntar vi?”"], ["The CEO texts: “Why are we waiting for a contractor to tell us what to do with our own systems?” Nobody in the room has said who owns the decision to wait. If the hall shuts down before the technician arrives, who explains why?", "Vd:n skickar ett sms: ”Varför väntar vi på att en entreprenör ska tala om vad vi ska göra med våra egna system?” Ingen i rummet har sagt vem som äger beslutet att vänta. Om hallen stängs ned innan teknikern är på plats, vem förklarar varför?"])
            ]
          }
        }),
        facilitator: fac(
          ["It is a facilities story — let it be one for now. Note anyone who asks “why the setpoint?”.", "Det är en fastighetshistoria – låt den vara det tills vidare. Notera den som frågar ”varför börvärdet?”."],
          ["A timely failover decision and someone asking why the setpoint changed.", "Ett beslut om övergång i tid och någon som frågar varför börvärdet ändrades."],
          [["Ask: when did anyone last fail over for real?", "Fråga: när gjorde någon senast en riktig övergång?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["The failover that wasn't", "Övergången som uteblev"]),
        twist: L(["The disaster-recovery site does not take over: three hidden problems block it.", "Reservplatsen tar inte över: tre dolda problem stoppar den."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the failover started early, half the systems are now split between two sites, and nobody can say which copy of the data is current.", sv: "Eftersom omkopplingen startades tidigt är hälften av systemen nu delade mellan två platser, och ingen kan säga vilken kopia av data som är aktuell." } }
        ],
        assumptionChallenged: L(["Our disaster-recovery site takes over automatically.", "Vår reservplats tar över automatiskt."]),
        reveals: ["hf-deps"],
        narrative: L([
          "{{time.T+60|clock}}. The failover to the disaster-recovery site has been started, exactly as the plan describes.\n\nIt is not going well. One service after another refuses to start, each for a different reason. The plan assumed the standby site would simply take over; nobody has checked that assumption since the plan was written.",
          "Klockan {{time.T+60|clock}}. Övergången till reservplatsen har startats, precis som planen beskriver.\n\nDet går inte bra. Den ena tjänsten efter den andra vägrar starta, var och en av olika skäl. Planen utgick från att reservplatsen bara skulle ta över; ingen har kontrollerat det antagandet sedan planen skrevs."
        ]),
        injects: [
          inj("i2-1", 60, "logExcerpt", "itOps", "critical", "confirmed", [
            "Standby database refuses to start: “licence expired {{num.licenceDays}} days ago”. Applications cannot reach the licence server — it runs only in hall A. Replication to the standby site is {{num.lagMinutes}} minutes behind.",
            "Reservdatabasen vägrar starta: ”licensen gick ut för {{num.licenceDays}} dagar sedan”. Applikationerna når inte licensservern – den körs bara i hall A. Replikeringen till reservplatsen ligger {{num.lagMinutes}} minuter efter."
          ], { headline: ["Failover errors", "Fel vid övergången"], reveals: ["hf-deps"], tests: ["lo1"] }),
          inj("i2-2", 80, "phoneTranscript", "vendor", "medium", "confirmed", [
            "{{supplier.vendor}}: “We can issue an emergency licence, but our licensing desk opens at eight.”",
            "{{supplier.vendor}}: ”Vi kan utfärda en akutlicens, men vår licensavdelning öppnar klockan åtta.”"
          ], { optional: true, tests: ["lo1"] })
        ],
        charts: [{
          id: "c2-deps", type: "dependency",
          title: L(["What the standby site depends on", "Vad reservplatsen är beroende av"]),
          data: (ctx) => {
            const p = BK.data.sectors.PLATFORM;
            const svc = Object.values(ctx.org.services);
            return {
              nodes: svc.map((s) => ({ id: s.id, kind: "service", label: s.name, status: "down" }))
                .concat([
                  { id: "db", kind: "platform", label: L(["Standby database (licence expired)", "Reservdatabas (licensen utgången)"]), status: "down" },
                  { id: "lic", kind: "platform", label: L(["Licence server (only in hall A)", "Licensserver (bara i hall A)"]), status: "down" },
                  { id: "net", kind: "platform", label: p.network, status: "ok" },
                  { id: "id", kind: "platform", label: p.identity, status: "degraded" }
                ]),
              edges: [].concat(...svc.map((s) => [{ from: s.id, to: "db" }, { from: s.id, to: "lic" }, { from: s.id, to: "net" }, { from: s.id, to: "id" }]))
            };
          }
        }],
        questions: {
          technical: [
            q("Which of the three blockers can you work around tonight?", "Vilket av de tre hindren kan ni ta er runt i natt?", ["itOps", "networkLead"]),
            q("What happens to the data that has not replicated?", "Vad händer med de data som inte har replikerats?", ["itOps"]),
            q("Was starting the failover the right call, given this?", "Var det rätt att starta övergången, med tanke på det här?", ["itOps"], "d1")
          ],
          executive: [
            q("Do you tell customers now, before you know when service returns?", "Informerar ni kunderna nu, innan ni vet när tjänsten är tillbaka?", ["comms", "ceo"]),
            q("Who escalates to the vendor's management tonight?", "Vem eskalerar till leverantörens ledning i natt?", ["supplierManager", "cio"]),
            q("Would you decide differently if you had known the standby site was broken?", "Hade ni beslutat annorlunda om ni vetat att reservplatsen inte fungerade?", ["cio"], "d1")
          ]
        },
        challenges: [ch("The fastest fix needs the vendor, who is closed until morning.", "Den snabbaste lösningen kräver leverantören, som har stängt till i morgon bitti.")],
        decision: dec("d2", "cio", ["How do you restore service?", "Hur får ni tillbaka tjänsten?"], [
          ["Escalate to the vendor's management for an emergency licence and rebuild the licence server at the standby site.", "Eskalera till leverantörens ledning för en akutlicens och bygg upp licensservern på reservplatsen."],
          ["Cool hall A with portable units and restart there.", "Kyl hall A med mobila aggregat och starta om där."],
          ["Wait for the vendor's normal hours rather than risk a rushed, untested rebuild of the licence server at night.", "Vänta till leverantörens normala öppettider hellre än att riskera en forcerad, otestad ombyggnad av licensservern mitt i natten."]
        ], {
          knowns: [["Three separate problems block failover.", "Tre separata problem stoppar övergången."]],
          uncertainties: [["Whether hall A can be cooled safely.", "Om hall A kan kylas ned på ett säkert sätt."]],
          tradeoffs: {
            operational: ["Restarting in hall A risks hardware damage.", "En omstart i hall A riskerar skador på hårdvaran."],
            security: ["Hall A's cooling problem is still unexplained.", "Kylproblemet i hall A är fortfarande oförklarat."],
            legal: ["Running unlicensed software may breach terms.", "Att köra olicensierad programvara kan bryta mot villkoren."],
            reputational: ["Hours of outage add up quickly.", "Timmar av avbrott räknas snabbt ihop."]
          },
          evaluation: [["Escalates hard instead of waiting", "Eskalerar kraftfullt i stället för att vänta"]],
          pushback: {
            A: [
              pb(["Nobody can sign the order", "Ingen kan skriva under"], ["The vendor's duty manager agrees to an out-of-hours emergency licence, but only against a signed order from someone with purchasing authority. Nobody awake has that authority. Do you wake the CEO to sign a licence order in the middle of the night, or lose the hours?", "Leverantörens jourchef går med på en akutlicens utanför kontorstid, men bara mot en underskriven beställning från någon med inköpsbehörighet. Ingen som är vaken har den behörigheten. Väcker ni vd:n för att skriva under en licensbeställning mitt i natten, eller förlorar ni timmarna?"]),
              pb(["Rebuilding from memory", "Att bygga om ur minnet"], ["The licence server was set up years ago by someone who has since left, and there is no documentation of how. The engineer rebuilding it is guessing at the settings. If a guess is wrong, every application may fail in a new way. How long do you let them try?", "Licensservern sattes upp för flera år sedan av någon som har slutat, och det finns ingen dokumentation av hur. Teknikern som bygger om den gissar sig till inställningarna. Gissar hen fel kan varje applikation fallera på ett nytt sätt. Hur länge låter ni hen försöka?"]),
              pb(["The same two engineers", "Samma två tekniker"], ["The only two engineers who can rebuild the licence server are the ones watching hall A and shutting down racks as it heats. Pull them onto the rebuild and nobody is watching the hall. Which problem do you let wait?", "De enda två tekniker som kan bygga om licensservern är de som bevakar hall A och stänger av rack när den blir varm. Flyttar ni dem till ombyggnaden bevakar ingen hallen. Vilket problem låter ni vänta?"])
            ],
            B: [
              pb(["Cooling arrives in hours", "Kylningen kommer om flera timmar"], ["The rental firm can deliver portable cooling in three hours at the earliest, and facilities is unsure the hall's power feed can carry the extra load. Is restarting in hall A still faster than fixing the standby site, or just more familiar?", "Uthyrningsfirman kan leverera mobil kylning tidigast om tre timmar, och fastighetsavdelningen är osäker på om hallens elmatning klarar den extra lasten. Är en omstart i hall A fortfarande snabbare än att laga reservplatsen, eller bara mer bekant?"]),
              pb(["Restarting into the unknown", "Omstart i det okända"], ["Nobody can yet explain why the cooling went wrong in hall A. If you restart there and the same thing happens during the morning rush, you lose both the night and the day. Do you bring everything back into a hall whose fault you cannot explain?", "Ingen kan ännu förklara varför kylningen i hall A slutade fungera. Om ni startar om där och samma sak händer mitt i morgonrusningen har ni förlorat både natten och dagen. Tar ni tillbaka allt till en hall vars fel ni inte kan förklara?"]),
              pb(["Hot disks on restart", "Varma diskar vid omstart"], ["The storage team warns that disks which ran this hot often fail when they spin up again. Hall A holds the newest copy of your data, the minutes that never reached the standby site. Do you risk that copy on a restart, or leave it powered down until you know more?", "Lagringsteamet varnar för att diskar som har gått så här varma ofta havererar när de startas igen. Hall A har den nyaste kopian av era data, minuterna som aldrig nådde reservplatsen. Riskerar ni den kopian vid en omstart, eller låter ni den vara avstängd tills ni vet mer?"])
            ],
            C: [
              pb(["Eight o'clock is rush hour", "Klockan åtta är rusningstid"], ["Waiting for the licensing desk means service returns, at best, well into the morning, after customers have started trying to log in. Your customer support opens before the vendor does. What do they tell the first hundred callers?", "Att vänta på licensavdelningen innebär att tjänsten i bästa fall är tillbaka en bra bit in på förmiddagen, efter att kunderna har börjat försöka logga in. Er kundtjänst öppnar före leverantören. Vad säger de till de första hundra som ringer?"]),
              pb(["The agreement runs out first", "Avtalet tar slut först"], ["The service owner checks the agreements: for your largest customers, the allowed downtime runs out around the time the vendor's desk opens. Waiting means choosing to breach them. Is a careful rebuild worth a breach you could see coming?", "Tjänsteägaren går igenom avtalen: för era största kunder tar den tillåtna nedtiden slut ungefär när leverantörens licensavdelning öppnar. Att vänta är att välja att bryta mot dem. Är en försiktig ombyggnad värd ett avtalsbrott ni såg komma?"]),
              pb(["Opening hours mean a queue", "Öppettider betyder kö"], ["The vendor's licensing desk serves every customer, and tickets are already queued for the morning. An emergency licence at eight still needs an order and an approval. Waiting for eight may mean waiting until noon. Do you still wait?", "Leverantörens licensavdelning betjänar alla kunder, och ärenden ligger redan i kö till morgonen. En akutlicens klockan åtta kräver ändå en beställning och ett godkännande. Att vänta till åtta kan betyda att vänta till lunch. Väntar ni ändå?"])
            ]
          }
        }),
        facilitator: fac(
          ["Three ordinary failures stacked together — the realistic picture of untested DR.", "Tre vardagliga fel staplade på varandra – den realistiska bilden av en otestad reservmiljö."],
          ["Hard escalation to the vendor, workaround for the licence server and honest customer updates.", "Kraftfull eskalering till leverantören, en lösning för licensservern och ärliga uppdateringar till kunderna."],
          [["Ask: which of these would a test have caught?", "Fråga: vilket av de här hade ett test fångat?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 180,
        title: L(["Someone changed the setpoint", "Någon ändrade börvärdet"]),
        twist: L(["The cooling did not fail. Someone changed the setpoints remotely through the building management system.", "Kylningen gick inte sönder. Någon ändrade börvärdena på distans via fastighetssystemet."]),
        twistKind: "cause",
        reconsider: { decision: "d1", pressure: { en: "The cooling did not fail: someone turned it off. Your first move was a response to a fault. Would you make it the same way against an attacker?", sv: "Kylningen gick inte sönder: någon stängde av den. Ert första drag var ett svar på ett fel. Skulle ni göra likadant mot en angripare?" } },
        assumptionChallenged: L(["This is an equipment failure.", "Det här är ett utrustningsfel."]),
        reveals: ["hf-bms"],
        narrative: L([
          "{{time.T+180|clock}}. The facilities technician has finally arrived at the building and opened the building management system's event log.\n\nEveryone assumed a cooling unit had failed, or a sensor had broken. The technician scrolls back through the log, goes quiet, and asks who else has access to the system.",
          "Klockan {{time.T+180|clock}}. Fastighetsteknikern har till slut kommit fram till byggnaden och öppnat fastighetssystemets händelselogg.\n\nAlla antog att ett kylaggregat hade gått sönder, eller att en givare var trasig. Teknikern bläddrar bakåt i loggen, blir tyst och frågar vem mer som har åtkomst till systemet."
        ]),
        injects: [
          inj("i3-1", 180, "logExcerpt", "facilities", "critical", "confirmed", [
            "At {{time.T-45|clock}} the cooling setpoint for hall A was changed from 21 °C to 35 °C and high-temperature alarms were set to “suppressed”. The change was made through the contractor's remote-access account.",
            "Klockan {{time.T-45|clock}} ändrades börvärdet för kylningen i hall A från 21 °C till 35 °C och larmen för hög temperatur sattes till ”undertryckta”. Ändringen gjordes via entreprenörens fjärråtkomstkonto."
          ], { headline: ["Building system event log", "Fastighetssystemets händelselogg"], reveals: ["hf-bms"], tests: ["lo2", "lo4"] }),
          inj("i3-2", 200, "phoneTranscript", "supplier", "medium", "disputed", [
            "The facilities contractor: “None of our technicians were working last night. But I can't rule out that someone checked something from home.”",
            "Fastighetsentreprenören: ”Ingen av våra tekniker arbetade i natt. Men jag kan inte utesluta att någon kollade något hemifrån.”"
          ], { facilitatorNote: ["Disputed: the contractor's staff were not involved, but the contractor cannot prove it. Keep both explanations alive.", "Omstritt: entreprenörens personal var inte inblandad, men entreprenören kan inte bevisa det. Håll båda förklaringarna vid liv."], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you secure the building system right now, without losing evidence?", "Hur säkrar ni fastighetssystemet just nu utan att förlora spår?", ["facilities", "ciso"]),
            q("Is the building system connected to your IT network?", "Är fastighetssystemet anslutet till ert IT-nätverk?", ["networkLead", "facilities"]),
            q("Does this change how you continue the recovery?", "Ändrar det här hur ni fortsätter återställningen?", ["itOps"], "d2")
          ],
          executive: [
            q("Is this now a security incident, and who leads it?", "Är det här nu en säkerhetsincident, och vem leder den?", ["ceo", "ciso"]),
            q("Do you report to the police tonight?", "Polisanmäler ni i natt?", ["ciso", "ceo"]),
            q("Would you have pushed for failover so hard if you had known it was deliberate?", "Hade ni drivit på övergången lika hårt om ni vetat att det var avsiktligt?", ["cio"], "d1")
          ]
        },
        challenges: [ch("The building system is managed by facilities and a contractor, not IT.", "Fastighetssystemet förvaltas av fastighetsavdelningen och en entreprenör, inte av IT.")],
        decision: dec("d3", "ciso", ["How do you treat the building system?", "Hur hanterar ni fastighetssystemet?"], [
          ["Disable all remote access to it, preserve its logs and treat it as a security incident.", "Stäng all fjärråtkomst till det, säkra loggarna och behandla det som en säkerhetsincident."],
          ["Change the contractor's password and continue the recovery.", "Byt entreprenörens lösenord och fortsätt återställningen."],
          ["Leave it to facilities and the contractor.", "Överlåt det till fastighetsavdelningen och entreprenören."]
        ], {
          knowns: [["Setpoints and alarms were changed remotely.", "Börvärden och larm ändrades på distans."]],
          uncertainties: [["Who made the change.", "Vem som gjorde ändringen."]],
          tradeoffs: {
            operational: ["Without remote access, facilities must be on site.", "Utan fjärråtkomst måste fastighetspersonalen vara på plats."],
            security: ["A password change may not remove other access.", "Ett lösenordsbyte tar kanske inte bort annan åtkomst."],
            legal: ["Evidence for a possible crime must be preserved.", "Spår av ett möjligt brott måste bevaras."],
            reputational: ["“Hackers turned off the cooling” is a big headline.", "”Hackare stängde av kylningen” är en stor rubrik."]
          },
          evaluation: [["Brings building systems inside security incident handling", "Tar in fastighetssystemen i hanteringen av säkerhetsincidenter"]],
          pushback: {
            A: [
              pb(["Cooling needs remote hands", "Kylningen kräver fjärrhjälp"], ["The technician explains that the cooling units are tuned remotely by the contractor's specialist. With remote access cut, every adjustment needs someone on site, and the specialist is hours away. Hall A is still too warm. Do you keep the access closed while the hall recovers?", "Teknikern förklarar att kylaggregaten finjusteras på distans av entreprenörens specialist. Med fjärråtkomsten stängd kräver varje justering någon på plats, och specialisten är flera timmar bort. Hall A är fortfarande för varm. Håller ni åtkomsten stängd medan hallen återhämtar sig?"]),
              pb(["The contractor feels accused", "Entreprenören känner sig anklagad"], ["The contractor's manager is offended: calling it a security incident implies their staff did it. They threaten to pull the technician off site until that is cleared up. Do you keep the framing and lose the only hands in the building, or soften it?", "Entreprenörens chef är kränkt: att kalla det en säkerhetsincident antyder att deras personal gjorde det. Hen hotar att kalla tillbaka teknikern tills det är utrett. Håller ni fast vid ramen och förlorar de enda händerna i byggnaden, eller tonar ni ned den?"]),
              pb(["Evidence or cooling?", "Spår eller kylning?"], ["To fix the cooling, the technician must change the very settings you just declared evidence. Copying the logs properly first takes time and someone who knows the system, and nobody in IT does. Do you let the technician touch it now, and who decides what is saved first?", "För att laga kylningen måste teknikern ändra just de inställningar ni nyss förklarade som spår. Att först kopiera loggarna ordentligt tar tid och kräver någon som kan systemet, och det kan ingen på IT. Låter ni teknikern röra det nu, och vem avgör vad som säkras först?"])
            ],
            B: [
              pb(["One password among many", "Ett lösenord bland många"], ["The technician scrolls the user list: several other accounts, some shared by the contractor's whole team. You changed one password. Are you sure that was the only way in, and that whoever used it cannot simply use another?", "Teknikern bläddrar i användarlistan: flera andra konton, en del delade av hela entreprenörens team. Ni bytte ett lösenord. Är ni säkra på att det var den enda vägen in, och att den som använde den inte bara kan ta en annan?"]),
              pb(["Where the new password goes", "Vart det nya lösenordet tar vägen"], ["The contractor asks for the new password by email so their staff can keep working. If the change came from inside the contractor, or from someone reading their mail, you have just handed it over again. Who gets the new password, and how?", "Entreprenören ber att få det nya lösenordet per e-post så att personalen kan fortsätta arbeta. Om ändringen kom inifrån entreprenören, eller från någon som läser deras e-post, har ni just lämnat över det igen. Vem får det nya lösenordet, och hur?"]),
              pb(["The log is being tidied", "Loggen städas bort"], ["To get the hall back to normal, the technician is resetting setpoints and clearing the alarm history. Whoever investigates later will ask what the system looked like tonight. Is anyone saving that before it is gone, or is the recovery more important?", "För att få hallen tillbaka till normalläge återställer teknikern börvärdena och rensar larmhistoriken. Den som utreder senare kommer att fråga hur systemet såg ut i natt. Säkrar någon det innan det försvinner, eller är återställningen viktigare?"])
            ],
            C: [
              pb(["Marking their own homework", "De rättar sitt eget prov"], ["The change was made through the contractor's account, and the contractor will now investigate it. Their first answer was that none of their staff were working. Are you comfortable letting them judge their own access?", "Ändringen gjordes via entreprenörens konto, och entreprenören ska nu utreda den. Deras första svar var att ingen av deras anställda arbetade. Är ni bekväma med att låta dem bedöma sin egen åtkomst?"]),
              pb(["Who answers tomorrow?", "Vem svarar i morgon?"], ["The CEO asks who is leading the investigation into the overheating. The honest answer is a contractor you do not manage, reporting to facilities, who report to nobody in this room. If customers ask tomorrow, who speaks for it?", "Vd:n frågar vem som leder utredningen av överhettningen. Det ärliga svaret är en entreprenör ni inte styr, som rapporterar till fastighetsavdelningen, som inte rapporterar till någon i det här rummet. Om kunderna frågar i morgon, vem står för det?"]),
              pb(["It also runs the doors", "Det styr även dörrarna"], ["The technician mentions that the same building system controls the data centre's door locks and fire dampers. If someone could change the cooling, they may be able to change those too. Is this still a facilities matter?", "Teknikern nämner att samma fastighetssystem styr datahallens dörrlås och brandspjäll. Om någon kunde ändra kylningen kan de kanske ändra det också. Är det här fortfarande en fråga för fastighetsavdelningen?"])
            ]
          }
        }),
        facilitator: fac(
          ["The frame flips. Avoid letting the room jump to “definitely sabotage” — the contractor's role is unclear.", "Ramen vänds. Låt inte gruppen hoppa direkt till ”definitivt sabotage” – entreprenörens roll är oklar."],
          ["Remote access cut, logs preserved and the incident handled as security.", "Fjärråtkomst stängd, loggar säkrade och incidenten hanterad som en säkerhetsfråga."],
          [["Ask: what else does that building system control?", "Fråga: vad mer styr det där fastighetssystemet?"]]
        )
      },
      {
        id: "p4",
        priority: 1,
        clock: 300,
        title: L(["The lost minutes", "De förlorade minuterna"]),
        twist: L(["{{num.lagMinutes}} minutes of transactions exist only in the overheated hall.", "{{num.lagMinutes}} minuters transaktioner finns bara i den överhettade hallen."]),
        twistKind: "impact",
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because the vendor was escalated in the middle of the night, they granted the emergency licence and sent an invoice at three times the normal rate.", sv: "Eftersom leverantören eskalerades mitt i natten beviljade de nödlicensen och skickade en faktura till tre gånger normalpriset." } }
        ],
        assumptionChallenged: L(["We lose no data on failover.", "Vi förlorar inga data vid en övergång."]),
        reveals: ["hf-loss"],
        narrative: L([
          "{{time.T+300|clock}}. After hours of work, services are partly back at the standby site, and the first customers can log in again.\n\nBut the reconciliation team reports gaps. Some of the very last activity before the outage is missing at the standby site, and the place where it may still exist is a hall nobody can safely enter yet.",
          "Klockan {{time.T+300|clock}}. Efter timmar av arbete är tjänsterna delvis tillbaka på reservplatsen, och de första kunderna kan logga in igen.\n\nMen avstämningsteamet rapporterar luckor. En del av den allra sista aktiviteten före avbrottet saknas på reservplatsen, och det ställe där den kanske fortfarande finns är en hall som ingen ännu kan gå in i på ett säkert sätt."
        ]),
        injects: [
          inj("i4-1", 300, "impactReport", "person.serviceOwner", "high", "confirmed", [
            "About {{num.transactions}} transactions from the last {{num.lagMinutes}} minutes before the outage are missing at the standby site. They may still be on the disks in hall A — if those disks survived the heat.",
            "Ungefär {{num.transactions}} transaktioner från de sista {{num.lagMinutes}} minuterna före avbrottet saknas på reservplatsen. De kan fortfarande finnas på diskarna i hall A – om diskarna klarade värmen."
          ], { fallbackRole: "itOps", reveals: ["hf-loss"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["Data loss", "Dataförlust"]),
          data: kpi([
            { id: "lag", label: ["Minutes not replicated", "Minuter som inte replikerats"], value: (v) => v.lagMinutes, tone: "danger" },
            { id: "tx", label: ["Transactions missing", "Saknade transaktioner"], value: (v) => v.transactions, tone: "danger" },
            { id: "rpo", label: ["Recovery point objective (minutes)", "Mål för återställningspunkt (minuter)"], value: (v, ctx) => Math.round(ctx.org.services.primary.rpo * 60), tone: "info" }
          ])
        }],
        questions: {
          technical: [
            q("Can the missing data be recovered from hall A safely?", "Kan de saknade data återvinnas från hall A på ett säkert sätt?", ["itOps"]),
            q("How do you reconcile what customers did with what you now hold?", "Hur stämmer ni av det kunderna gjorde med det ni nu har?", ["serviceOwner", "itOps"]),
            q("Did the recovery path you chose make data loss worse?", "Gjorde den väg för återställningen ni valde dataförlusten värre?", ["itOps"], "d2")
          ],
          executive: [
            q("Who tells affected customers their transactions may be lost?", "Vem talar om för berörda kunder att deras transaktioner kan ha gått förlorade?", ["comms", "serviceOwner"]),
            q("What is your legal and contractual exposure?", "Vilken rättslig och avtalsmässig exponering har ni?", ["ceo", "supplierManager"]),
            q("Does the deliberate cause change who carries the cost?", "Ändrar den avsiktliga orsaken vem som bär kostnaden?", ["ceo"], "d3")
          ]
        },
        challenges: [ch("Your recovery point objective promised less than five minutes of loss.", "Ert mål för återställningspunkt utlovade mindre än fem minuters förlust.")],
        decision: dec("d4", "ceo", ["How do you handle the lost transactions?", "Hur hanterar ni de förlorade transaktionerna?"], [
          ["Inform affected customers proactively and recover what you can from hall A.", "Informera berörda kunder proaktivt och återvinn det ni kan från hall A."],
          ["Recover from hall A first, then decide what to say.", "Återvinn från hall A först och bestäm sedan vad ni ska säga."],
          ["Ask customers to resubmit anything missing.", "Be kunderna skicka in det som saknas på nytt."]
        ], {
          knowns: [["Data beyond the recovery point is missing.", "Data bortom återställningspunkten saknas."]],
          uncertainties: [["Whether hall A's disks are intact.", "Om diskarna i hall A är intakta."]],
          tradeoffs: {
            operational: ["Reconciliation is manual and slow.", "Avstämningen är manuell och långsam."],
            security: ["Recovering from hall A must not destroy evidence.", "Återvinningen från hall A får inte förstöra spår."],
            legal: ["Customers may have claims.", "Kunder kan ha krav."],
            reputational: ["Proactive honesty limits damage.", "Proaktiv ärlighet begränsar skadan."]
          },
          evaluation: [["Tells customers before they discover it", "Berättar för kunderna innan de upptäcker det själva"]],
          pushback: {
            A: [
              pb(["You cannot name them yet", "Ni kan inte peka ut dem än"], ["Reconciliation cannot yet say which customers lost what. A proactive message must go to everyone active in that window, many of whom lost nothing, and support will be flooded. Do you send a broad warning now, or wait until you can reach the right people?", "Avstämningen kan ännu inte säga vilka kunder som förlorade vad. Ett proaktivt meddelande måste gå till alla som var aktiva under perioden, varav många inte förlorade något, och kundtjänst kommer att översvämmas. Skickar ni en bred varning nu, eller väntar ni tills ni når rätt personer?"]),
              pb(["Legal wants every word", "Juristerna vill läsa varje ord"], ["Legal objects: writing that transactions “may be lost” admits you missed what you promised. They want to review every sentence first, which will take until tomorrow. Do you wait for legal, or send without them?", "Juristerna invänder: att skriva att transaktioner ”kan ha gått förlorade” är att erkänna att ni inte höll det ni lovat. De vill granska varje mening först, vilket tar till i morgon. Väntar ni på juristerna, eller skickar ni utan dem?"]),
              pb(["Customers act on the warning", "Kunderna agerar på varningen"], ["After your message, some customers redo their transactions straight away. If hall A's disks turn out to be readable, you will hold both the original and the repeat. How will you tell them apart, and who pays for the doubles?", "Efter ert meddelande gör en del kunder om sina transaktioner direkt. Om diskarna i hall A visar sig gå att läsa har ni både originalet och kopian. Hur skiljer ni dem åt, och vem betalar för dubbletterna?"])
            ],
            B: [
              pb(["A screenshot goes public", "En skärmbild blir offentlig"], ["A customer posts a screenshot of a missing transaction and asks whether anyone else has the same problem. Dozens reply. Your silence while you recover now looks like hiding it. Do you still wait for hall A before you say anything?", "En kund lägger ut en skärmbild av en saknad transaktion och frågar om fler har samma problem. Dussintals svarar. Er tystnad medan ni återvinner ser nu ut som att ni döljer det. Väntar ni fortfarande på hall A innan ni säger något?"]),
              pb(["Recovery takes days", "Återvinningen tar dagar"], ["Getting into hall A safely, copying the disks without destroying evidence and checking what is readable will take days, not hours. “Recover first” means saying nothing for days. Is this still a plan, or a delay?", "Att säkert ta sig in i hall A, kopiera diskarna utan att förstöra spår och kontrollera vad som går att läsa tar dagar, inte timmar. ”Återvinn först” betyder att inte säga något på flera dagar. Är det fortfarande en plan, eller en fördröjning?"]),
              pb(["Support is improvising", "Kundtjänst improviserar"], ["Your support staff have no script. Some are telling callers that “everything is fine now”. When you later tell customers their data may be lost, those calls will be remembered. Who decides what support says today?", "Er kundtjänst har inget manus. En del säger till dem som ringer att ”allt fungerar nu”. När ni senare berättar att data kan ha gått förlorade kommer de samtalen att minnas. Vem bestämmer vad kundtjänst säger i dag?"])
            ],
            C: [
              pb(["Customers cannot tell", "Kunderna kan inte avgöra"], ["Most customers cannot tell which of their actions in those minutes went through. Some resubmit things that were processed, others assume theirs were. Who carries the cost of a double payment or a lost order?", "De flesta kunder kan inte avgöra vilka av deras åtgärder under de minuterna som gick igenom. En del skickar in sådant som redan behandlats, andra tror att deras gick igenom. Vem bär kostnaden för en dubbel betalning eller en förlorad order?"]),
              pb(["“So we do the work?”", "”Ska vi göra jobbet?”"], ["A large customer calls: “You lost our data and now you want us to redo it?” They are asking their lawyers what your contract says about lost transactions. Do you stand by asking customers to fix it themselves?", "En stor kund ringer: ”Ni tappade våra data och nu ska vi göra om det?” De frågar sina jurister vad avtalet säger om förlorade transaktioner. Står ni fast vid att be kunderna lösa det själva?"]),
              pb(["The insurer asks about hall A", "Försäkringsbolaget frågar om hall A"], ["The insurer asks what you did to recover the data before asking customers to redo it. Losses you did not try to recover may not be covered. Do you still skip hall A?", "Försäkringsbolaget frågar vad ni gjorde för att återvinna data innan ni bad kunderna göra om. Förluster ni inte försökte återvinna kanske inte ersätts. Hoppar ni fortfarande över hall A?"])
            ]
          }
        }),
        facilitator: fac(
          ["RPO on paper versus RPO in reality.", "Återställningspunkt på papper mot återställningspunkt i verkligheten."],
          ["Proactive customer contact and careful recovery of hall A data.", "Proaktiv kontakt med kunderna och varsam återvinning av data från hall A."],
          [["Ask: who knew replication was behind?", "Fråga: vem visste att replikeringen släpade efter?"]]
        )
      },
      {
        id: "p5",
        priority: 2,
        clock: 600,
        title: L(["A door left open", "En dörr som stod öppen"]),
        twist: L(["The building system was on the internet with a default password — and someone has used it for weeks.", "Fastighetssystemet låg ute på internet med ett standardlösenord – och någon har använt det i flera veckor."]),
        twistKind: "scope",
        reconsider: { decision: "d3", pressure: { en: "The building system has been open with a default password for weeks. If you treated it as a security incident, facilities and the contractor feel accused. If you only changed a password, the way in may still be open.", sv: "Fastighetssystemet har stått öppet med ett standardlösenord i veckor. Om ni behandlade det som en säkerhetsincident känner sig fastighet och entreprenören anklagade. Om ni bara bytte ett lösenord kan vägen in fortfarande vara öppen." } },
        assumptionChallenged: L(["Someone got lucky last night.", "Någon hade tur i natt."]),
        reveals: ["hf-account"],
        narrative: L([
          "{{time.T+600|weekday|cap}} {{time.T+600|daypart}}, {{time.T+600|clock}}. The security team has received the building system's full access history from the facilities contractor.\n\nThe question is no longer whether someone changed the cooling, but how they got in and how long they have been able to. The answer points to a door that has been open for much longer than one night.",
          "{{time.T+600|weekday|cap}} {{time.T+600|daypart}}, klockan {{time.T+600|clock}}. Säkerhetsteamet har fått fastighetssystemets hela åtkomsthistorik från fastighetsentreprenören.\n\nFrågan är inte längre om någon ändrade kylningen, utan hur de kom in och hur länge de har kunnat göra det. Svaret pekar på en dörr som har stått öppen mycket längre än en natt."
        ]),
        injects: [
          inj("i5-1", 600, "forensicFinding", "forensics", "critical", "confirmed", [
            "The contractor's remote-access account uses the manufacturer's default password and is reachable from the internet. Logins from {{asset.attackerIp}} began four weeks ago; configuration pages were browsed several times before last night's change.",
            "Entreprenörens fjärråtkomstkonto använder tillverkarens standardlösenord och går att nå från internet. Inloggningar från {{asset.attackerIp}} började för fyra veckor sedan; konfigurationssidor besöktes flera gånger före nattens ändring."
          ], { reveals: ["hf-account"], tests: ["lo2"] })
        ],
        charts: [{
          id: "c5-logins", type: "bar",
          title: L(["Building-system logins per week", "Inloggningar i fastighetssystemet per vecka"]), unit: L(["logins", "inloggningar"]),
          caption: L(["Weeks before the incident.", "Veckor före incidenten."]),
          data: (ctx) => {
            const weeks = [-8, -7, -6, -5, -4, -3, -2, -1, 0];
            return { categories: weeks, series: [
              { id: "contractor", label: L(["Contractor locations", "Entreprenörens platser"]), values: weeks.map(() => ctx.rng.int(0, 2)) },
              { id: "unknown", label: L(["Unknown address", "Okänd adress"]), values: weeks.map((w) => (w >= -4 ? 1 + ctx.rng.int(0, 3) : 0)) }
            ] };
          }
        }],
        questions: {
          technical: [
            q("Which other building or operational systems are reachable from the internet?", "Vilka andra fastighets- eller driftsystem går att nå från internet?", ["networkLead", "facilities"]),
            q("Could the intruder reach your IT network from the building system?", "Kan inkräktaren nå ert IT-nätverk från fastighetssystemet?", ["networkLead", "ciso"]),
            q("Did cutting remote access close every path?", "Stängde ni alla vägar när ni stängde fjärråtkomsten?", ["ciso"], "d3")
          ],
          executive: [
            q("Who is responsible: you, the contractor or the building owner?", "Vem är ansvarig: ni, entreprenören eller fastighetsägaren?", ["ceo", "supplierManager"]),
            q("Do you report this as a crime?", "Anmäler ni det här som ett brott?", ["ceo", "ciso"]),
            q("Does the long access change your customer message?", "Ändrar den långa åtkomsten ert budskap till kunderna?", ["comms"], "d4")
          ]
        },
        challenges: [ch("Nobody in IT knew the building system was on the internet.", "Ingen på IT visste att fastighetssystemet låg ute på internet.")],
        decision: dec("d5", "ciso", ["How do you close the exposure?", "Hur stänger ni exponeringen?"], [
          ["Take all building systems off the internet, require secure remote access and include them in security monitoring.", "Ta bort alla fastighetssystem från internet, kräv säker fjärråtkomst och ta in dem i säkerhetsövervakningen."],
          ["Change default passwords on building systems.", "Byt standardlösenord på fastighetssystemen."],
          ["Ask the contractor to fix it.", "Be entreprenören att åtgärda det."]
        ], {
          knowns: [["An unknown party had access for four weeks.", "En okänd part hade åtkomst i fyra veckor."]],
          uncertainties: [["What else they changed or saw.", "Vad mer de ändrade eller såg."]],
          tradeoffs: {
            operational: ["Removing remote access slows facilities work.", "Att ta bort fjärråtkomsten saktar ner fastighetsarbetet."],
            security: ["Only passwords leaves systems exposed.", "Att bara byta lösenord lämnar systemen exponerade."],
            legal: ["Contracts may not cover security duties.", "Avtalen kanske inte täcker säkerhetsansvar."],
            reputational: ["The finding will appear in any report.", "Fyndet kommer att synas i varje rapport."]
          },
          evaluation: [["Treats building systems as security assets", "Behandlar fastighetssystem som säkerhetsobjekt"]],
          pushback: {
            A: [
              pb(["Nobody has the list", "Ingen har listan"], ["Facilities cannot list every building system: access control, lifts, fire alarm, power monitoring, each with its own supplier. They find a new one every hour. How do you take “all” of them off the internet when you cannot name them?", "Fastighetsavdelningen kan inte räkna upp alla fastighetssystem: passersystem, hissar, brandlarm, elövervakning, vart och ett med sin egen leverantör. De hittar ett nytt varje timme. Hur tar ni ”alla” från internet när ni inte kan namnge dem?"]),
              pb(["Suppliers want their link", "Leverantörerna vill ha sin länk"], ["The lift and fire-alarm suppliers say their service contracts depend on direct internet access for remote monitoring. Removing it may end their obligation to respond to faults. Do you accept losing remote support, or start making exceptions?", "Hiss- och brandlarmsleverantörerna säger att deras serviceavtal bygger på direkt internetåtkomst för fjärrövervakning. Tar ni bort den kan deras skyldighet att åtgärda fel upphöra. Accepterar ni att förlora fjärrsupporten, eller börjar ni göra undantag?"]),
              pb(["Monitoring nobody can read", "Övervakning som ingen kan läsa"], ["Your security team has never seen building-system logs, and the protocols are unfamiliar. The first weeks will produce alerts nobody can interpret. Is monitoring you cannot understand protection, or a box ticked?", "Ert säkerhetsteam har aldrig sett loggar från fastighetssystem, och protokollen är okända för dem. De första veckorna kommer att ge larm som ingen kan tolka. Är övervakning ni inte förstår ett skydd, eller en bock i en ruta?"])
            ],
            B: [
              pb(["Four weeks inside", "Fyra veckor inne"], ["The unknown address browsed configuration pages for four weeks. A new password tells you nothing about what they changed, added or left behind in that time. Do you trust a system they have been inside for a month just because the password is new?", "Den okända adressen bläddrade bland konfigurationssidor i fyra veckor. Ett nytt lösenord säger ingenting om vad de ändrade, lade till eller lämnade kvar under den tiden. Litar ni på ett system de har varit inne i en månad bara för att lösenordet är nytt?"]),
              pb(["Still on the internet", "Fortfarande på internet"], ["The login page is still reachable from anywhere. The new password can be guessed, phished or end up on a sticky note in the plant room, just like the last one. Is that a fix, or just resetting the clock?", "Inloggningssidan går fortfarande att nå var som helst ifrån. Det nya lösenordet kan gissas, nätfiskas eller hamna på en lapp i teknikrummet, precis som det förra. Är det en åtgärd, eller bara en nollställning av klockan?"]),
              pb(["Who keeps the new passwords?", "Vem har de nya lösenorden?"], ["Facilities counts dozens of devices; some cannot change password without a supplier visit. The contractor asks to keep the new passwords in the shared spreadsheet they always use. Who holds them, and how is that better than before?", "Fastighetsavdelningen räknar till dussintals enheter; på en del kan lösenordet inte bytas utan ett besök av leverantören. Entreprenören vill ha de nya lösenorden i det delade kalkylark de alltid använder. Vem har dem, och hur är det bättre än förut?"])
            ],
            C: [
              pb(["Closing their own door", "De stänger sin egen dörr"], ["It was the contractor's account and its default password that let someone in for four weeks. You are asking the party who left the door open to close it, and to tell you when it is done. How will you check?", "Det var entreprenörens konto och dess standardlösenord som släppte in någon i fyra veckor. Ni ber den som lämnade dörren öppen att stänga den, och att meddela när det är klart. Hur kontrollerar ni det?"]),
              pb(["“That's not in our contract”", "”Det ingår inte i vårt avtal”"], ["The contractor replies that securing remote access is not part of their contract. They offer to quote it as extra work, starting in three weeks. Do you pay and wait, with the system still exposed, or do it yourselves?", "Entreprenören svarar att säkring av fjärråtkomst inte ingår i deras avtal. De erbjuder sig att offerera det som extraarbete, med start om tre veckor. Betalar ni och väntar, med systemet fortfarande exponerat, eller gör ni det själva?"]),
              pb(["An email as proof", "Ett mejl som bevis"], ["The CEO asks whether you are sure the exposure is closed. Your only evidence will be an email from the contractor saying so. Is that enough for you to sign off on, after what happened?", "Vd:n frågar om ni är säkra på att exponeringen är stängd. Ert enda bevis kommer att vara ett mejl från entreprenören som säger det. Räcker det för att ni ska godkänna det, efter det som hänt?"])
            ]
          }
        }),
        facilitator: fac(
          ["OT and facilities are rarely in the incident plan. Use this.", "OT och fastighetssystem finns sällan med i incidentplanen. Använd det här."],
          ["Building systems taken off the internet, secured remote access, and inclusion in monitoring.", "Fastighetssystemen borttagna från internet, säker fjärråtkomst och övervakning av systemen."],
          [["Ask: who owns the asset list for building systems?", "Fråga: vem äger förteckningen över fastighetssystemen?"]]
        )
      },
      {
        id: "p6",
        priority: 3,
        clock: 1440,
        title: L(["Not your building", "Inte er byggnad"]),
        twist: L(["The building owner controls the building system — and refuses to share its logs.", "Fastighetsägaren styr fastighetssystemet – och vägrar dela loggarna."]),
        twistKind: "authority",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because all remote access to the building system was cut, the contractor cannot reach it to fix the cooling, and an engineer has to drive four hours.", sv: "Eftersom all fjärråtkomst till fastighetssystemet kapades kan entreprenören inte nå det för att laga kylningen, och en tekniker måste köra fyra timmar." } }
        ],
        assumptionChallenged: L(["We control everything in our data centre.", "Vi styr allt i vår datahall."]),
        narrative: L([
          "The next day. The police want the building system's logs to investigate the sabotage, and the insurer wants them to assess the claim.\n\nBut the building system is not yours. It belongs to the building owner and serves other tenants too. You rent the space; someone else holds the evidence.",
          "Nästa dag. Polisen vill ha fastighetssystemets loggar för att utreda sabotaget, och försäkringsbolaget vill ha dem för att bedöma skadan.\n\nMen fastighetssystemet är inte ert. Det tillhör fastighetsägaren och betjänar även andra hyresgäster. Ni hyr lokalerna; någon annan har bevisen."
        ]),
        injects: [
          inj("i6-1", 1440, "email", "supplier", "high", "confirmed", [
            "The building owner's lawyer: “The building management system is our property and serves other tenants. We will not release logs without a court order.”",
            "Fastighetsägarens advokat: ”Fastighetssystemet är vår egendom och betjänar andra hyresgäster. Vi lämnar inte ut loggar utan domstolsbeslut.”"
          ], { tests: ["lo2"] }),
          inj("i6-2", 1470, "phoneTranscript", "police", "medium", "confirmed", [
            "{{reg.police|cap}}: “We need the logs to investigate. If the owner refuses, we can request them, but it takes time.”",
            "{{reg.police|cap}}: ”Vi behöver loggarna för att kunna utreda. Om ägaren vägrar kan vi begära ut dem, men det tar tid.”"
          ], { optional: true, pressure: "lawEnforcement", tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What evidence do you already hold that does not depend on the owner?", "Vilka spår har ni redan som inte är beroende av ägaren?", ["ciso", "itOps"]),
            q("Are other tenants at risk from the same system?", "Är andra hyresgäster utsatta för risk via samma system?", ["ciso", "facilities"]),
            q("Is the exposure fix you chose within your control?", "Ligger den åtgärd mot exponeringen som ni valde inom er kontroll?", ["ciso"], "d5")
          ],
          executive: [
            q("Do you warn other tenants?", "Varnar ni andra hyresgäster?", ["ceo", "legal"]),
            q("How do you work with an owner who is protecting itself?", "Hur samarbetar ni med en ägare som skyddar sig själv?", ["ceo", "supplierManager"]),
            q("Does this affect the customer commitments you made?", "Påverkar det här de åtaganden ni har gjort mot kunderna?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("Other tenants in the building may be just as exposed and not know it.", "Andra hyresgäster i byggnaden kan vara lika exponerade utan att veta om det.")],
        decision: dec("d6", "ceo", ["How do you deal with the building owner?", "Hur hanterar ni fastighetsägaren?"], [
          ["Escalate jointly with the police, warn other tenants and use your lease rights.", "Eskalera tillsammans med polisen, varna andra hyresgäster och använd era rättigheter enligt hyresavtalet."],
          ["Negotiate quietly for a copy of the logs.", "Förhandla i tysthet om en kopia av loggarna."],
          ["Accept the refusal and rely on your own evidence.", "Acceptera vägran och lita på era egna spår."]
        ], {
          knowns: [["The owner controls the system and its logs.", "Ägaren styr systemet och dess loggar."]],
          uncertainties: [["Whether other tenants were targeted.", "Om andra hyresgäster var måltavlor."]],
          tradeoffs: {
            operational: ["A dispute with the owner is distracting.", "En tvist med ägaren tar uppmärksamhet."],
            security: ["Other tenants may be next.", "Andra hyresgäster kan stå på tur."],
            legal: ["Lease terms decide what you can demand.", "Hyresavtalet avgör vad ni kan kräva."],
            reputational: ["Warning neighbours is the responsible thing.", "Att varna grannarna är det ansvarsfulla."]
          },
          evaluation: [["Considers others affected by the same exposure", "Tar hänsyn till andra som berörs av samma exponering"]],
          pushback: {
            A: [
              pb(["The lease says less", "Hyresavtalet säger mindre"], ["Legal reads the lease: it promises suitable premises, but says nothing about logs or the security of building systems. Using it as a lever may start a dispute that outlasts the investigation. Do you still lead with your lease rights?", "Juristerna läser hyresavtalet: det utlovar ändamålsenliga lokaler men säger ingenting om loggar eller säkerheten i fastighetssystemen. Att använda det som påtryckning kan starta en tvist som varar längre än utredningen. Inleder ni ändå med era rättigheter enligt hyresavtalet?"]),
              pb(["A warning they call defamatory", "En varning de kallar ärekränkande"], ["The owner's lawyer warns that telling other tenants about an unproven attack on its system could harm the owner, and that they will hold you liable. Do you still send the warning, and what exactly will it say?", "Fastighetsägarens advokat varnar för att det kan skada ägaren att berätta för andra hyresgäster om ett obevisat angrepp mot dess system, och att de kommer att hålla er ansvariga. Skickar ni varningen ändå, och vad ska den säga exakt?"]),
              pb(["They still run your cooling", "De sköter fortfarande er kylning"], ["The owner still controls the cooling and the building you depend on. Since your escalation, requests for access and repairs are answered slowly and only in writing. How much friction can you afford with the people who keep your hall cool?", "Ägaren styr fortfarande kylningen och byggnaden ni är beroende av. Sedan er eskalering besvaras förfrågningar om tillträde och reparationer långsamt och bara skriftligt. Hur mycket friktion har ni råd med mot dem som håller er hall sval?"])
            ],
            B: [
              pb(["The neighbours do not know", "Grannarna vet inget"], ["While you negotiate quietly, other tenants keep running on the same building system without knowing what happened. If one of them is hit next week, how will you explain that you knew and said nothing?", "Medan ni förhandlar i tysthet fortsätter andra hyresgäster att vara beroende av samma fastighetssystem utan att veta vad som hänt. Om någon av dem drabbas nästa vecka, hur förklarar ni att ni visste men teg?"]),
              pb(["A copy they chose", "En kopia de har valt"], ["The police ask how you will get the logs. A copy the owner hands over privately, edited by them, may be worthless as evidence. Is a copy they chose to give you evidence at all?", "Polisen frågar hur ni ska få loggarna. En kopia som ägaren lämnar över i det tysta, och som de har bearbetat, kan sakna värde som bevis. Är en kopia som de har valt att ge er överhuvudtaget ett bevis?"]),
              pb(["The price of the logs", "Priset för loggarna"], ["The owner offers the logs in exchange for a confidentiality agreement: no public statements about the building's security, and no claims against them. Do you sign to get the evidence, and give up what you might need later?", "Ägaren erbjuder loggarna mot ett sekretessavtal: inga offentliga uttalanden om säkerheten i byggnaden och inga krav mot dem. Skriver ni under för att få spåren, och avstår från det ni kanske behöver senare?"])
            ],
            C: [
              pb(["The insurer needs their logs", "Försäkringsbolaget behöver loggarna"], ["The insurer says that without the building system's own logs it cannot confirm a third party caused the damage, and may assess the claim as a maintenance failure. Do you still accept the owner's refusal?", "Försäkringsbolaget säger att det utan fastighetssystemets egna loggar inte kan bekräfta att en tredje part orsakade skadan, och kan komma att bedöma det som ett underhållsfel. Accepterar ni fortfarande ägarens vägran?"]),
              pb(["The case may be closed", "Ärendet kan läggas ned"], ["{{reg.police|cap}} tell you that without the owner's logs the investigation is unlikely to get far. Accepting the refusal may mean nobody is ever held to account. Is that a result you can explain to your staff and customers?", "{{reg.police|cap}} säger att utredningen sannolikt inte kommer långt utan ägarens loggar. Att acceptera vägran kan betyda att ingen någonsin ställs till svars. Är det ett resultat ni kan förklara för er personal och era kunder?"]),
              pb(["Same refusal next time", "Samma vägran nästa gång"], ["The owner has shown it will not share logs, and its building system still controls your cooling. Accepting it now sets the rule for the next incident too. Are you willing to live with that for the rest of the lease?", "Ägaren har visat att den inte delar loggar, och dess fastighetssystem styr fortfarande er kylning. Att acceptera nu sätter regeln även för nästa incident. Är ni beredda att leva med det resten av hyrestiden?"])
            ]
          }
        }),
        facilitator: fac(
          ["Shared infrastructure, shared risk. Authority is split.", "Delad infrastruktur, delad risk. Mandatet är delat."],
          ["Joint escalation with the police and a warning to other tenants.", "Gemensam eskalering med polisen och en varning till andra hyresgäster."],
          [["Ask: what does your lease say about building security?", "Fråga: vad säger ert hyresavtal om säkerheten i byggnaden?"]]
        )
      },
      {
        id: "p7",
        priority: 4,
        clock: 4320,
        title: L(["Sabotage and negligence", "Sabotage och försumlighet"]),
        twist: L(["Both are true: someone sabotaged the cooling, and the failover had not been tested in {{num.yearsUntested}} years.", "Båda är sanna: någon saboterade kylningen, och övergången hade inte testats på {{num.yearsUntested}} år."]),
        twistKind: "impact",
        reconsider: { decision: "d4", pressure: { en: "Sabotage and negligence are both true. Customers you told early now ask for compensation. Customers you have not told yet will read it in your report.", sv: "Både sabotage och försumlighet är sant. Kunder som ni informerade tidigt kräver nu ersättning. Kunder som ni ännu inte informerat kommer att läsa det i er rapport." } },
        assumptionChallenged: L(["If it was sabotage, we are not responsible.", "Om det var sabotage är vi inte ansvariga."]),
        narrative: L([
          "Three days later. The board receives the root-cause summary, and the directors read it closely.\n\nIt would be convenient to present the outage as an attack by an unknown third party. It would also be convenient to present it as a maintenance failure. The summary on the table says something less convenient.",
          "Tre dagar senare. Styrelsen får sammanfattningen av grundorsaken, och ledamöterna läser den noggrant.\n\nDet vore bekvämt att framställa avbrottet som ett angrepp från en okänd tredje part. Det vore också bekvämt att framställa det som ett underhållsfel. Sammanfattningen på bordet säger något mindre bekvämt."
        ]),
        injects: [
          inj("i7-1", 4320, "email", "management", "medium", "confirmed", [
            "The audit committee: “The report says the outage was caused by a third party. It also says failover had not been tested in {{num.yearsUntested}} years and a licence had expired. Which of these do you consider the cause?”",
            "Revisionsutskottet: ”Rapporten säger att avbrottet orsakades av en tredje part. Den säger också att övergången inte hade testats på {{num.yearsUntested}} år och att en licens hade gått ut. Vilket av detta betraktar ni som orsaken?”"
          ], { tests: ["lo3", "lo4"] })
        ],
        questions: {
          technical: [
            q("What must be tested, and how often, so this cannot happen again?", "Vad måste testas, och hur ofta, för att det här inte ska kunna hända igen?", ["itOps", "cio"]),
            q("How do you monitor replication lag and licence expiry?", "Hur bevakar ni eftersläpning i replikeringen och licenser som går ut?", ["itOps"]),
            q("Which of your decisions in the first hour would you change?", "Vilka av era beslut under den första timmen skulle ni ändra?", ["cio"], "d1")
          ],
          executive: [
            q("How do you answer the audit committee honestly?", "Hur svarar ni revisionsutskottet ärligt?", ["ceo", "cio"]),
            q("Who owns disaster-recovery readiness?", "Vem äger beredskapen för reservmiljön?", ["ceo", "cio"]),
            q("Does your answer match what you told customers?", "Stämmer ert svar med det ni sa till kunderna?", ["comms"], "d4")
          ]
        },
        challenges: [ch("Blaming the saboteur is easier — and incomplete.", "Att skylla på sabotören är enklare – och ofullständigt.")],
        decision: dec("d7", "ceo", ["What do you present as the cause and the fix?", "Vad lägger ni fram som orsak och åtgärd?"], [
          ["Both: the sabotage, and the untested recovery that turned it into a long outage — with owners and dates for each fix.", "Båda: sabotaget och den otestade reservmiljön som gjorde det till ett långt avbrott – med ansvariga och datum för varje åtgärd."],
          ["The sabotage, with recovery improvements as a side note.", "Sabotaget, med förbättringar av reservmiljön som en sidonotering."],
          ["The untested recovery; the sabotage is a police matter.", "Den otestade reservmiljön; sabotaget är en polisfråga."]
        ], {
          knowns: [["The outage had a deliberate trigger and avoidable amplifiers.", "Avbrottet hade en avsiktlig utlösare och undvikbara förstärkare."]],
          uncertainties: [["Who the saboteur was.", "Vem sabotören var."]],
          tradeoffs: {
            operational: ["Regular failover tests cost time and carry risk.", "Regelbundna tester av övergång kostar tid och innebär risk."],
            security: ["Facilities and IT must share security ownership.", "Fastighet och IT måste dela ägarskapet för säkerheten."],
            legal: ["Regulators look at preparedness, not only the trigger.", "Tillsynsmyndigheter tittar på beredskapen, inte bara på utlösaren."],
            reputational: ["Owning both causes builds credibility.", "Att stå för båda orsakerna bygger trovärdighet."]
          },
          evaluation: [["Owns the internal causes as well as the external one", "Tar ansvar för de interna orsakerna lika väl som för den externa"]],
          pushback: {
            A: [
              pb(["Negligence in writing", "Försumlighet i skrift"], ["Legal warns that writing “untested for {{num.yearsUntested}} years” in a board report weakens the insurance claim and any claim against the contractor. Do you still put both causes on paper, and in those words?", "Juristerna varnar för att formuleringen ”otestad i {{num.yearsUntested}} år” i en styrelserapport försvagar försäkringsanspråket och eventuella krav mot entreprenören. Skriver ni ändå ned båda orsakerna, och med de orden?"]),
              pb(["Tests mean planned outages", "Tester betyder planerade avbrott"], ["The CIO, named as owner of the failover tests, points out that twice-yearly tests mean planned outages, which the business has refused before. Who in this room will defend that downtime when the service owners push back?", "CIO:n, som står som ansvarig för testerna av övergången, påpekar att tester två gånger om året innebär planerade avbrott, vilket verksamheten har sagt nej till förut. Vem i rummet försvarar den nedtiden när tjänsteägarna protesterar?"]),
              pb(["An unnamed saboteur", "En sabotör utan namn"], ["A director asks: if you cannot say who did it, is the sabotage half of the report more than a theory? Next to concrete failures with names and dates, it may read like an excuse. How do you present something you cannot prove yet?", "En ledamot frågar: om ni inte kan säga vem som gjorde det, är sabotagedelen av rapporten mer än en teori? Bredvid konkreta brister med namn och datum kan den läsas som en ursäkt. Hur lägger ni fram något ni ännu inte kan bevisa?"])
            ],
            B: [
              pb(["They already asked", "De har redan frågat"], ["The audit committee has read that failover was untested and a licence had expired, and asked which you consider the cause. A footnote answers a question they did not ask. Do you want them to find the rest themselves?", "Revisionsutskottet har läst att övergången var otestad och att en licens hade gått ut, och frågat vad ni betraktar som orsaken. En fotnot svarar på en fråga de inte ställde. Vill ni att de ska hitta resten själva?"]),
              pb(["The loss came from the length", "Förlusten kom av längden"], ["The insurer's assessor notes that most of the loss came from the length of the outage, not the trigger, and asks why your report treats recovery as minor. If the insurer reads it that way, will the board?", "Försäkringsbolagets värderingsman konstaterar att det mesta av förlusten kom av hur länge avbrottet varade, inte av utlösaren, och frågar varför er rapport behandlar reservmiljön som en bisak. Om försäkringsbolaget läser det så, gör inte styrelsen det också?"]),
              pb(["The night shift reads it", "Nattskiftet läser den"], ["The engineers who spent the night working around the expired licence and the missing licence server read the draft. They say it hides the lesson they paid for, and they will say so if asked. What do you tell them?", "Teknikerna som ägnade natten åt att ta sig runt den utgångna licensen och den saknade licensservern läser utkastet. De säger att det döljer den lärdom de betalade för, och att de kommer att säga det om någon frågar. Vad säger ni till dem?"])
            ],
            C: [
              pb(["Nobody owns the open door", "Ingen äger den öppna dörren"], ["Leaving the sabotage to the police means the building-system fix has no owner in your report. Facilities and the contractor read it as “not our problem”. Who closes the way in, if not you?", "Att lämna sabotaget åt polisen innebär att åtgärden för fastighetssystemet saknar ägare i er rapport. Fastighetsavdelningen och entreprenören läser det som ”inte vårt problem”. Vem stänger vägen in, om inte ni?"]),
              pb(["A security incident by another name", "En säkerhetsincident med ett annat namn"], ["Legal asks whether a deliberate intrusion through a supplier's account should be handled and reported as a security incident, not only as a crime. Calling it a police matter may look like stepping away from that duty. Are you sure it is not yours?", "Juristerna frågar om ett avsiktligt intrång via en leverantörs konto borde hanteras och rapporteras som en säkerhetsincident, inte bara som ett brott. Att kalla det en polisfråga kan se ut som att ni kliver undan det ansvaret. Är ni säkra på att det inte är ert?"]),
              pb(["The team takes all the blame", "Teamet får ta all skuld"], ["Read on its own, the report says the outage was your own staff's fault, while someone deliberately turned off the cooling. The engineers who worked through the night feel singled out. Is that the story you want inside the organisation?", "Läst för sig säger rapporten att avbrottet var er egen personals fel, trots att någon avsiktligt stängde av kylningen. Teknikerna som arbetade hela natten känner sig utpekade. Är det den berättelsen ni vill ha inom organisationen?"])
            ]
          }
        }),
        facilitator: fac(
          ["Close on honesty: the trigger was external, the outage length was home-made.", "Avsluta med ärlighet: utlösaren var extern, avbrottets längd var självförvållad."],
          ["Both causes owned, with regular failover tests and building systems in security scope.", "Båda orsakerna erkända, med regelbundna tester av övergången och fastighetssystemen inom säkerhetsarbetet."],
          [["Ask: if there had been no saboteur, when would this have failed anyway?", "Fråga: om det inte hade funnits någon sabotör, när hade det här ändå fallerat?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Service returns from the standby site within a day; part of the lost data is recovered from hall A. The police investigation is open, and failover tests are now scheduled twice a year.",
        "Tjänsterna kommer tillbaka från reservplatsen inom ett dygn; en del av de förlorade data återvinns från hall A. Polisutredningen pågår, och tester av övergången är nu schemalagda två gånger om året."
      ])
    },

    debrief: {
      keyLessons: [
        L(["An untested disaster-recovery site is a hypothesis, not a capability.", "En otestad reservplats är en hypotes, inte en förmåga."]),
        L(["Building management systems are part of the attack surface.", "Fastighetssystem är en del av angreppsytan."]),
        L(["Keep the “fault” and “attack” explanations open until evidence decides.", "Håll förklaringarna ”fel” och ”angrepp” öppna tills spåren avgör."]),
        L(["Recovery point objectives must be monitored, not assumed.", "Mål för återställningspunkt måste bevakas, inte förutsättas."])
      ],
      assumptionsVsReality: [
        avr(["Failover is automatic.", "Övergången sker automatiskt."], ["Three hidden problems blocked it.", "Tre dolda problem stoppade den."], "p2"),
        avr(["An equipment failure.", "Ett utrustningsfel."], ["Setpoints were changed remotely.", "Börvärdena ändrades på distans."], "p3"),
        avr(["No data loss.", "Ingen dataförlust."], ["Minutes of transactions were missing.", "Flera minuters transaktioner saknades."], "p4"),
        avr(["Someone got lucky.", "Någon hade tur."], ["A default password was used for weeks.", "Ett standardlösenord användes i flera veckor."], "p5")
      ],
      strengthsToLookFor: [
        L(["Timely failover decision", "Ett beslut om övergång i tid"]),
        L(["Questioning the odd setpoint early", "Att tidigt ifrågasätta det märkliga börvärdet"]),
        L(["Proactive customer communication about data loss", "Proaktiv kommunikation till kunderna om dataförlusten"])
      ],
      commonGaps: [
        L(["Assuming the DR site works", "Att anta att reservplatsen fungerar"]),
        L(["Leaving building systems to facilities alone", "Att lämna fastighetssystemen helt åt fastighetsavdelningen"]),
        L(["Blaming only the external cause", "Att enbart skylla på den externa orsaken"])
      ],
      suggestedActions: [
        act(["Test failover end-to-end twice a year.", "Testa övergången från början till slut två gånger om året."], "cio", "high"),
        act(["Take building systems off the internet and into security monitoring.", "Ta bort fastighetssystemen från internet och in i säkerhetsövervakningen."], "ciso", "high"),
        act(["Monitor replication lag and licence expiry with alerts.", "Bevaka eftersläpning i replikeringen och licenser som går ut, med larm."], "itOps", "high"),
        act(["Add security clauses for remote access to facilities contracts.", "Lägg till säkerhetsklausuler om fjärråtkomst i fastighetsavtalen."], "supplierManager", "medium"),
        act(["Document every dependency the standby site needs.", "Dokumentera varje beroende som reservplatsen behöver."], "itOps", "medium")
      ]
    }
  });
})();
