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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Run a failover decision under time pressure", "Fatta beslut om övergång till reservmiljö under tidspress"]) },
      { id: "lo2", text: L(["Treat facilities and building systems as part of the attack surface", "Behandla fastighet och fastighetssystem som en del av angreppsytan"]) },
      { id: "lo3", text: L(["Handle data loss beyond the recovery point objective", "Hantera dataförlust utöver målet för återställningspunkt"]) },
      { id: "lo4", text: L(["Keep two explanations open: fault and attack", "Hålla två förklaringar öppna: fel och angrepp"]) }
    ],
    mitre: ["T0831", "T0886", "T1078", "T1133"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.AM", "ID.RA", "PR.IR", "PR.AA", "DE.CM", "RS.MA", "RS.AN", "RC.RP"],
      iso27001: ["A.5.19", "A.5.22", "A.5.24", "A.5.29", "A.5.30", "A.7.11", "A.8.14", "A.8.13", "A.8.20"]
    },
    minStages: 3,
    maxStages: 7,
    constraints: { startWindow: "weekend", sectors: ["finance", "healthcare", "public", "telecom", "technology", "transport"] },
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
          "{{time.T+0|day}}, {{time.T+0|clock}}. Temperature alarms from the primary data centre reach IT on-call. Servers are throttling and some have shut themselves down. The facilities on-call phone goes to voicemail.",
          "{{time.T+0|day}}, klockan {{time.T+0|clock}}. Temperaturlarm från den primära datahallen når IT-jouren. Servrar sänker sin prestanda och några har stängt av sig själva. Fastighetsjourens telefon går till röstbrevlådan."
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
          evaluation: [["Acts before automatic shutdowns decide for you", "Agerar innan automatiska avstängningar beslutar åt er"], ["Notes the odd setpoint as worth investigating", "Noterar det märkliga börvärdet som något att utreda"]]
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
        assumptionChallenged: L(["Our disaster-recovery site takes over automatically.", "Vår reservplats tar över automatiskt."]),
        reveals: ["hf-deps"],
        narrative: L([
          "{{time.T+60|clock}}. The failover has been started. It is not going well.",
          "Klockan {{time.T+60|clock}}. Övergången har startats. Det går inte bra."
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
          ["Wait for normal vendor hours.", "Vänta till leverantörens normala öppettider."]
        ], {
          knowns: [["Three separate problems block failover.", "Tre separata problem stoppar övergången."]],
          uncertainties: [["Whether hall A can be cooled safely.", "Om hall A kan kylas ned på ett säkert sätt."]],
          tradeoffs: {
            operational: ["Restarting in hall A risks hardware damage.", "En omstart i hall A riskerar skador på hårdvaran."],
            security: ["Hall A's cooling problem is still unexplained.", "Kylproblemet i hall A är fortfarande oförklarat."],
            legal: ["Running unlicensed software may breach terms.", "Att köra olicensierad programvara kan bryta mot villkoren."],
            reputational: ["Hours of outage add up quickly.", "Timmar av avbrott räknas snabbt ihop."]
          },
          evaluation: [["Escalates hard instead of waiting", "Eskalerar kraftfullt i stället för att vänta"]]
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
        assumptionChallenged: L(["This is an equipment failure.", "Det här är ett utrustningsfel."]),
        reveals: ["hf-bms"],
        narrative: L([
          "{{time.T+180|clock}}. The facilities technician has arrived and opened the building management system's event log.",
          "Klockan {{time.T+180|clock}}. Fastighetsteknikern har kommit fram och öppnat fastighetssystemets händelselogg."
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
          evaluation: [["Brings building systems inside security incident handling", "Tar in fastighetssystemen i hanteringen av säkerhetsincidenter"]]
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
        assumptionChallenged: L(["We lose no data on failover.", "Vi förlorar inga data vid en övergång."]),
        reveals: ["hf-loss"],
        narrative: L([
          "{{time.T+300|clock}}. Services are partly back at the standby site — with gaps.",
          "Klockan {{time.T+300|clock}}. Tjänsterna är delvis tillbaka på reservplatsen – med luckor."
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
          evaluation: [["Tells customers before they discover it", "Berättar för kunderna innan de upptäcker det själva"]]
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
        assumptionChallenged: L(["Someone got lucky last night.", "Någon hade tur i natt."]),
        reveals: ["hf-account"],
        narrative: L([
          "Morning, {{time.T+600|clock}}. The security team has the building system's full access history.",
          "Morgon, klockan {{time.T+600|clock}}. Säkerhetsteamet har tillgång till fastighetssystemets hela åtkomsthistorik."
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
          evaluation: [["Treats building systems as security assets", "Behandlar fastighetssystem som säkerhetsobjekt"]]
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
        assumptionChallenged: L(["We control everything in our data centre.", "Vi styr allt i vår datahall."]),
        narrative: L([
          "The next day. The police and the insurer both want the building system's logs. They belong to someone else.",
          "Nästa dag. Både polisen och försäkringsbolaget vill ha fastighetssystemets loggar. De tillhör någon annan."
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
          evaluation: [["Considers others affected by the same exposure", "Tar hänsyn till andra som berörs av samma exponering"]]
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
        assumptionChallenged: L(["If it was sabotage, we are not responsible.", "Om det var sabotage är vi inte ansvariga."]),
        narrative: L([
          "Three days later. The board receives the root-cause summary.",
          "Tre dagar senare. Styrelsen får sammanfattningen av grundorsaken."
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
          evaluation: [["Owns the internal causes as well as the external one", "Tar ansvar för de interna orsakerna lika väl som för den externa"]]
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
