/*
 * s12-benign-or-breach.js — "Maintenance or Movement?" (archetype C, EDR/SOC).
 *
 * Lookalike: EDR flags lateral movement on a business-critical server → the
 * application team confirms planned maintenance, and they are right → separate
 * telemetry shows a second, unrelated actor hiding inside the maintenance
 * window → the SOC had been suppressing alerts during maintenance windows →
 * the business refuses isolation at month-end → the actor's account reached the
 * payroll database → the alert-fatigue reckoning.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s12-benign-or-breach",
    version: 1,
    category: "edr-soc",
    archetype: "benign-lookalike",
    emblem: "maintenance",
    title: L(["Maintenance or Movement?", "Underhåll eller intrång?"]),
    summary: L([
      "The security tooling lights up on a critical server during planned maintenance. The maintenance is real. So, it turns out, is something else.",
      "Säkerhetsverktygen larmar på en kritisk server under ett planerat underhåll. Underhållet är på riktigt. Det visar sig att något annat också är det."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Triage an alert without dismissing it because a benign explanation exists", "Bedöma ett larm utan att avfärda det bara för att det finns en harmlös förklaring"]), teaser: L(["Plausible is not the same as proven", "Rimligt är inte samma sak som bevisat"]) },
      { id: "lo2", text: L(["Use independent telemetry to separate legitimate and malicious activity", "Använda oberoende telemetri för att skilja legitim aktivitet från skadlig"]), teaser: L(["Seeing for yourself", "Att se med egna ögon"]) },
      { id: "lo3", text: L(["Decide on isolating a business-critical system", "Besluta om isolering av ett verksamhetskritiskt system"]), teaser: L(["The cost of caution", "Priset för försiktighet"]) },
      { id: "lo4", text: L(["Recognise alert suppression and fatigue as a risk", "Se undertryckta larm och larmtrötthet som en risk"]), teaser: L(["What you have learned to ignore", "Det ni har lärt er att ignorera"]) }
    ],
    mitre: ["T1021", "T1078", "T1003", "T1562.001", "T1070", "T1048"],
    frameworks: {
      nistCsf: ["DE.CM", "DE.AE", "RS.AN", "RS.MA", "RS.MI", "PR.AA", "ID.IM"],
      iso27001: ["A.5.25", "A.5.26", "A.5.28", "A.8.15", "A.8.16", "A.8.32", "A.8.2"]
    },
    minStages: 3,
    maxStages: 7,
    constraints: { startWindow: "night" },
    actor: { types: ["criminal", "unknown"], motivation: L(["Financial: access to payroll and banking data", "Ekonomisk: åtkomst till löne- och bankuppgifter"]), capability: "medium" },
    variables: {
      alertsSuppressed: { min: 40, max: 900, scaleBy: "size" },
      windows: { min: 3, max: 9 },
      employeesPayroll: { min: 80, max: 6000, scaleBy: "size" },
      monthEndValue: { min: 2000000, max: 80000000, step: 100000, scaleBy: "size", currency: true },
      firstWindowDays: { min: 21, max: 75 }
    },
    roles: ["socLead", "itOps", "serviceOwner", "ciso", "incidentCommander", "cfo", "hr", "supplierManager", "cio", "dpo"],

    groundTruth: {
      rootCause: L([
        "A criminal actor had a stolen service-desk credential and noticed that the SOC suppressed lateral-movement alerts on {{asset.erpServer}} during the published maintenance windows. For about {{num.firstWindowDays}} days they only worked inside those windows. The maintenance itself was genuine.",
        "En kriminell aktör hade ett stulet konto från servicedesken och märkte att SOC undertryckte larm om lateral rörelse på {{asset.erpServer}} under de publicerade underhållsfönstren. I ungefär {{num.firstWindowDays}} dagar arbetade de bara inom de fönstren. Själva underhållet var äkta."
      ]),
      attackerTimeline: [
        { at: -100800, text: L(["Service-desk credential bought from an access broker.", "Konto från servicedesken köps från en mäklare av åtkomst."]) },
        { at: -86400, text: L(["Actor reads the maintenance calendar on the intranet.", "Aktören läser underhållskalendern på intranätet."]) },
        { at: -64800, text: L(["First activity inside a maintenance window.", "Första aktiviteten inom ett underhållsfönster."]) },
        { at: -20160, text: L(["Payroll database queried during a window.", "Lönedatabasen frågas mot under ett fönster."]) },
        { at: 10, text: L(["Tonight: activity inside the window again, from a host maintenance doesn't use.", "I natt: aktivitet inom fönstret igen, från en dator som underhållet inte använder."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-second", revealStage: "p3", text: L(["A second actor is active inside the maintenance window, unrelated to the maintenance.", "En andra aktör är aktiv inom underhållsfönstret, utan koppling till underhållet."]) },
      { id: "hf-suppress", revealStage: "p4", text: L(["The SOC suppressed lateral-movement alerts on the server during every maintenance window.", "SOC undertryckte larm om lateral rörelse på servern under varje underhållsfönster."]) },
      { id: "hf-payroll", revealStage: "p6", text: L(["The actor's account queried the payroll database weeks ago.", "Aktörens konto frågade mot lönedatabasen för flera veckor sedan."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["An alert on the business system", "Ett larm på affärssystemet"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. The SOC analyst on the night shift sees a burst of lateral-movement detections on {{asset.erpServer}}, the server behind {{org.service.primary|lcfirst}}.\n\nIt looks like someone moving through the network and using credentials against a critical server. But there is also a change ticket: planned maintenance of that very server, tonight. Alerts during maintenance are common, and usually harmless.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. SOC-analytikern på nattskiftet ser en mängd larm om lateral förflyttning mot {{asset.erpServer}}, servern bakom {{org.service.primary|lcfirst}}.\n\nDet ser ut som att någon rör sig genom nätverket och använder inloggningsuppgifter mot en kritisk server. Men det finns också ett ändringsärende: planerat underhåll av just den servern, i natt. Larm under underhåll är vanliga, och oftast ofarliga."
        ]),
        injects: [
          inj("i1-1", 0, "edrAlert", "edr", "high", "confirmed", [
            "{{env.edrAlert}}: remote service creation and credential use from several hosts against {{asset.erpServer}} in fifteen minutes.",
            "{{env.edrAlert}}: fjärrskapade tjänster och användning av inloggningsuppgifter från flera datorer mot {{asset.erpServer}} på femton minuter."
          ], { headline: ["Lateral movement on the business system", "Lateral rörelse på affärssystemet"], tests: ["lo1"] }),
          inj("i1-2", 10, "ticket", "serviceDesk", "low", "confirmed", [
            "Change {{asset.ticketId}}: planned maintenance of {{asset.erpServer}} tonight, {{time.T-30|clock}}–{{time.T+210|clock}}, by the application team.",
            "Ändring {{asset.ticketId}}: planerat underhåll av {{asset.erpServer}} i natt, {{time.T-30|clock}}–{{time.T+210|clock}}, av applikationsteamet."
          ], { tests: ["lo1"] }),
          inj("i1-3", 20, "chat", "soc", "low", "misleading", [
            "A colleague in the SOC: “That's maintenance. We see this every month. Close it.”",
            "En kollega i SOC: ”Det där är underhåll. Vi ser det varje månad. Stäng det.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Partly true, which makes it dangerous. Closing on habit is the gap this scenario tests.", "Delvis sant, vilket gör det farligt. Att stänga av vana är bristen som scenariot prövar."], tests: ["lo4"] })
        ],
        charts: [{
          id: "c1-alerts", type: "line", markers: "injects",
          title: L(["Detections on the business system per 10 minutes", "Detektioner på affärssystemet per tio minuter"]), unit: L(["detections", "detektioner"]),
          data: line(["Detections", "Detektioner"], -60, 40, 10, (x, ctx) => (x < -10 ? ctx.rng.int(0, 1) : 6 + ctx.rng.int(0, 5)))
        }],
        questions: {
          technical: [
            q("Which hosts and accounts does the maintenance plan say will be used?", "Vilka datorer och konton säger underhållsplanen att det ska användas?", ["socLead", "itOps"]),
            q("What would make this activity not maintenance?", "Vad skulle göra att den här aktiviteten inte är underhåll?", ["socLead"]),
            q("Who in the application team can you reach right now?", "Vem i applikationsteamet kan ni nå just nu?", ["itOps"])
          ],
          executive: [
            q("Who decides whether the business system may be isolated tonight?", "Vem beslutar om affärssystemet får isoleras i natt?", ["serviceOwner", "incidentCommander"]),
            q("What is the cost of a false alarm versus a missed one?", "Vad kostar ett falsklarm jämfört med ett missat larm?", ["ciso", "serviceOwner"]),
            q("Is anyone senior on call?", "Har någon i ledningen beredskap?", ["incidentCommander"])
          ]
        },
        challenges: [ch("The change ticket matches the time window exactly.", "Ändringsärendet stämmer exakt med tidsfönstret.")],
        decision: dec("d1", "socLead", ["How do you handle the alert?", "Hur hanterar ni larmet?"], [
          ["Verify with the application team host by host before closing it.", "Stäm av med applikationsteamet dator för dator innan det stängs."],
          ["Close it as planned maintenance.", "Stäng det som planerat underhåll."],
          ["Isolate the server now and sort it out afterwards.", "Isolera servern nu och reda ut det efteråt."]
        ], {
          knowns: [["Planned maintenance is running.", "Ett planerat underhåll pågår."], ["Detections match lateral movement.", "Detektionerna stämmer med lateral rörelse."]],
          uncertainties: [["Whether every detection is maintenance.", "Om varje detektion är underhåll."]],
          tradeoffs: {
            operational: ["Isolation would ruin the maintenance and the morning.", "En isolering skulle förstöra underhållet och morgonen."],
            security: ["Closing on habit misses whatever hides in the noise.", "Att stänga av vana missar det som gömmer sig i bruset."],
            legal: ["The server holds personal data.", "Servern innehåller personuppgifter."],
            reputational: ["A false alarm costs trust in the SOC.", "Ett falsklarm kostar förtroende för SOC."]
          },
          evaluation: [["Checks the benign explanation rather than accepting it", "Kontrollerar den harmlösa förklaringen i stället för att godta den"]],
          interrupts: [
            ir("i1", { chosen: "B" }, ["Closed as maintenance", "Stängt som underhåll"], [
              io(["Nobody objects", "Ingen invänder"], ["The shift log takes the closure without comment, and the colleague who suggested it thanks you for not waking anyone.", "Skiftloggen tar emot stängningen utan kommentarer, och kollegan som föreslog den tackar er för att ni inte väckte någon."], ["The alert was closed without anyone questioning it.", "Larmet stängdes utan att någon ifrågasatte det."]),
              io(["The SOC lead reopens it", "SOC-ansvarig öppnar igen"], ["The SOC lead, checking in from home, sees a burst of lateral-movement detections closed without a single host checked. They reopen it and ask who decided.", "SOC-ansvarig, som kollar in hemifrån, ser en mängd detektioner av lateral rörelse som stängts utan att en enda dator kontrollerats. Hen öppnar ärendet igen och frågar vem som beslutade."], ["The SOC lead has reopened the alert and questioned the closure.", "SOC-ansvarig har öppnat larmet igen och ifrågasatt stängningen."], { reopen: true }),
              io(["No reply yet", "Inget svar än"], ["As a courtesy, the analyst messages the application team about the closed alert. Nobody replies; they are presumably busy with the upgrade.", "Som en artighet skickar analytikern ett meddelande till applikationsteamet om det stängda larmet. Ingen svarar; de är förmodligen upptagna med uppgraderingen."], ["The application team did not reply to the SOC's first message.", "Applikationsteamet svarade inte på SOC:s första meddelande."])
            ]),
            ir("i2", { notChosen: "B" }, ["Alert kept open", "Larmet hålls öppet"], [
              io(["A lull", "Ett andrum"], ["Detections slow down for a few minutes. Your SOC colleague says that was a maintenance step finishing, and that the lull proves it.", "Detektionerna avtar i några minuter. Er kollega i SOC säger att det var ett underhållssteg som blev klart, och att avbrottet bevisar det."], ["Detections slowed briefly; a colleague calls it a maintenance step.", "Detektionerna avtog en kort stund; en kollega kallar det ett underhållssteg."]),
              io(["An annoyed team", "Ett irriterat team"], ["The application team lead complains that the SOC is slowing a tight maintenance window, and copies their manager.", "Applikationsteamets ansvarige klagar på att SOC bromsar ett snävt underhållsfönster, och sätter sin chef på kopia."], ["The application team lead has complained about the SOC's interference.", "Applikationsteamets ansvarige har klagat på att SOC lägger sig i."]),
              io(["The owner wants grounds", "Ägaren vill ha skäl"], ["The service owner hears that the SOC is holding up the maintenance and demands to know on what grounds, with month-end close only hours away.", "Tjänsteägaren får höra att SOC håller upp underhållet och kräver att få veta på vilka grunder, med månadsbokslutet bara några timmar bort."], ["The service owner has demanded the grounds for holding the alert open.", "Tjänsteägaren har krävt att få veta skälen till att larmet hålls öppet."], { reopen: true })
            ])
          ],
          pushback: {
            A: [
              pb(["Not now, we're busy", "Inte nu, vi är upptagna"], ["The application team lead doesn't answer, and the engineer who does is mid-upgrade and promises the host list “after the window”. The detections keep coming. Do you wait for them, or escalate and interrupt their maintenance?", "Applikationsteamets ansvarige svarar inte, och teknikern som svarar är mitt i uppgraderingen och lovar listan över datorer ”efter fönstret”. Detektionerna fortsätter komma. Väntar ni på dem, eller eskalerar ni och avbryter deras underhåll?"]),
              pb(["Spending goodwill", "Att förbruka förtroende"], ["Your SOC colleague says you are about to wake half the application team over something the SOC sees every month. If it is just maintenance, the SOC looks jumpy, again. How much goodwill are you willing to spend on a hunch?", "Er kollega i SOC säger att ni är på väg att väcka halva applikationsteamet för något som SOC ser varje månad. Om det bara är underhåll ser SOC nervöst ut, igen. Hur mycket förtroende är ni beredda att förbruka på en magkänsla?"]),
              pb(["Nothing to check against", "Inget att jämföra med"], ["The change ticket names the server and the time window, but not which hosts or accounts will be used. There is nothing on paper to check host by host against. What exactly will you compare the detections with?", "Ändringsärendet anger servern och tidsfönstret, men inte vilka datorer eller konton som ska användas. Det finns inget på papper att stämma av dator för dator mot. Vad ska ni egentligen jämföra detektionerna med?"])
            ],
            B: [
              pb(["Two things look the same", "Två saker ser likadana ut"], ["Remote service creation and credential use from several hosts is exactly what maintenance looks like, and exactly what an intruder looks like. Once the alert is closed, nobody will look at it again. Who checks the rest of tonight's activity, and when?", "Fjärrskapade tjänster och användning av inloggningsuppgifter från flera datorer är precis hur underhåll ser ut, och precis hur en inkräktare ser ut. När larmet är stängt tittar ingen på det igen. Vem kontrollerar resten av nattens aktivitet, och när?"]),
              pb(["Your name on the ticket", "Ert namn på ärendet"], ["The closing note carries the analyst's name and a timestamp. If anything is ever found, that line will be the first entry in the timeline. Are you comfortable signing it on the strength of a change ticket alone?", "Avslutsnoteringen bär analytikerns namn och en tidsstämpel. Om något någonsin hittas blir den raden den första i tidslinjen. Känner ni er trygga med att skriva under på grundval av enbart ett ändringsärende?"]),
              pb(["Still climbing", "Det fortsätter öka"], ["Twenty minutes after the alert was closed, new detections from the same server keep arriving, and the count is still climbing. Do you reopen your own ticket and admit it was closed too fast, or let the new ones close the same way?", "Tjugo minuter efter att larmet stängdes fortsätter nya detektioner från samma server att komma, och antalet ökar fortfarande. Öppnar ni ert eget ärende igen och medger att det stängdes för snabbt, eller låter ni de nya stängas på samma sätt?"])
            ],
            C: [
              pb(["Nobody asked the owner", "Ingen frågade ägaren"], ["The service owner calls: the server behind {{org.service.primary|lcfirst}} is unreachable and nobody asked them first. They want to know who isolated a business-critical system on an alert nobody had checked. Who answers, and with what?", "Tjänsteägaren ringer: servern bakom {{org.service.primary|lcfirst}} går inte att nå och ingen frågade hen först. Hen vill veta vem som isolerade ett verksamhetskritiskt system på ett larm som ingen hade kontrollerat. Vem svarar, och med vad?"]),
              pb(["Less to see", "Mindre att se"], ["With the server isolated, its logs no longer reach the SOC, and the scripts that were running stopped half-way. If this was an intruder, you now see less of what they were doing. Did isolation help you find out, or stop you looking?", "Med servern isolerad når dess loggar inte längre SOC, och skripten som körde stannade halvvägs. Om det var en inkräktare ser ni nu mindre av vad de gjorde. Hjälpte isoleringen er att ta reda på det, eller hindrade den er från att titta?"]),
              pb(["The next time you say isolate", "Nästa gång ni säger isolera"], ["Your SOC colleague notes that this server alerts during every maintenance and none of it has ever turned out to be an attack. If this one isn't either, will anyone listen the next time the SOC says “isolate”?", "Er kollega i SOC påpekar att den här servern larmar vid varje underhåll och att inget av det någonsin har visat sig vara ett angrepp. Om inte det här heller är det, kommer någon att lyssna nästa gång SOC säger ”isolera”?"])
            ]
          }
        }),
        facilitator: fac(
          ["Most groups close this. Let them; the next stages will bring them back.", "De flesta grupper stänger larmet. Låt dem; nästa steg tar dem tillbaka."],
          ["A host-by-host check against the maintenance plan.", "En kontroll dator för dator mot underhållsplanen."],
          [["Ask: what exactly does the change ticket list?", "Fråga: vad listar ändringsärendet exakt?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 40,
        title: L(["It really is maintenance", "Det är verkligen underhåll"]),
        twist: L(["The application team confirms: the activity you can see is their maintenance, and they can prove it.", "Applikationsteamet bekräftar: aktiviteten ni ser är deras underhåll, och de kan bevisa det."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "C" }, narrativeAppend: { en: "Because the server was isolated in the middle of the maintenance, the application team's upgrade broke half-way, and they blame security.", sv: "Eftersom servern isolerades mitt i underhållet gick applikationsteamets uppgradering sönder halvvägs, och de skyller på säkerhet." } }
        ],
        assumptionChallenged: L(["This is an attack.", "Det här är ett angrepp."]),
        narrative: L([
          "{{time.T+40|clock}}. The application team lead joins the call, a little annoyed at being interrupted in the middle of the work.\n\nThey have a run log, named accounts and a clear explanation. Month-end close starts in a few hours and they want the server left alone. Almost everything the SOC has seen fits their story. Almost.",
          "Klockan {{time.T+40|clock}}. Applikationsteamets ansvarige kopplar in sig i samtalet, lite irriterad över att bli avbruten mitt i arbetet.\n\nHen har en körlogg, namngivna konton och en tydlig förklaring. Månadsbokslutet börjar om några timmar och teamet vill att servern lämnas ifred. Nästan allt som SOC har sett stämmer med deras berättelse. Nästan."
        ]),
        injects: [
          inj("i2-1", 40, "chat", "itOps", "low", "confirmed", [
            "“Those are our scripts, run from our two admin hosts with our named accounts. Here's the run log. Please don't touch the server; month-end close starts at {{time.T+360|clock}}.”",
            "”Det där är våra skript, körda från våra två administrationsdatorer med våra namngivna konton. Här är körloggen. Rör inte servern; månadsbokslutet börjar klockan {{time.T+360|clock}}.”"
          ], { tests: ["lo1"] }),
          inj("i2-2", 60, "logExcerpt", "edr", "low", "confirmed", [
            "Of the detections, almost all come from the two admin hosts named in the change. A handful come from {{asset.workstationIt}}, which is not in the change.",
            "Nästan alla detektioner kommer från de två administrationsdatorerna som nämns i ändringen. Ett fåtal kommer från {{asset.workstationIt}}, som inte finns med i ändringen."
          ], { tests: ["lo2"] })
        ],
        charts: [{
          id: "c2-sources", type: "donut",
          title: L(["Where the detections come from", "Var detektionerna kommer ifrån"]),
          data: () => ({ segments: [
            { id: "admin", label: L(["The change's two admin hosts", "Ändringens två administrationsdatorer"]), value: 94 },
            { id: "other", label: L(["A host not in the change", "En dator som inte finns i ändringen"]), value: 6 }
          ] })
        }],
        questions: {
          technical: [
            q("What is {{asset.workstationIt}}, and who uses it?", "Vad är {{asset.workstationIt}}, och vem använder den?", ["socLead", "itOps"]),
            q("Can you separate the two kinds of activity without stopping the maintenance?", "Kan ni skilja de två sorternas aktivitet åt utan att stoppa underhållet?", ["socLead"]),
            q("Did your first decision make it easy to notice the odd host?", "Gjorde ert första beslut det lätt att upptäcka den udda datorn?", ["socLead"], "d1")
          ],
          executive: [
            q("How much weight does a confident explanation deserve?", "Hur mycket vikt förtjänar en säker förklaring?", ["ciso", "incidentCommander"]),
            q("Who would be blamed if you stopped the month-end close for nothing?", "Vem skulle få skulden om ni stoppade månadsbokslutet i onödan?", ["serviceOwner", "cfo"]),
            q("Would you still choose the same first step now?", "Skulle ni fortfarande välja samma första steg nu?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Six per cent is easy to round down to zero.", "Sex procent är lätt att avrunda till noll.")],
        decision: dec("d2", "socLead", ["What do you do about the host that isn't in the change?", "Vad gör ni med datorn som inte finns med i ändringen?"], [
          ["Investigate it separately with independent telemetry, without disturbing the maintenance.", "Utred den separat med oberoende telemetri, utan att störa underhållet."],
          ["Ask the application team whether it's theirs and accept the answer.", "Fråga applikationsteamet om den är deras och godta svaret."],
          ["Treat the whole alert as maintenance.", "Behandla hela larmet som underhåll."]
        ], {
          knowns: [["Most activity is genuine maintenance.", "Det mesta av aktiviteten är äkta underhåll."], ["One host is not in the change.", "En dator finns inte med i ändringen."]],
          uncertainties: [["What that host is doing.", "Vad den datorn gör."]],
          tradeoffs: {
            operational: ["Independent checks take analyst time at night.", "Oberoende kontroller tar analytikertid på natten."],
            security: ["Small anomalies inside noise are how intruders hide.", "Små avvikelser i bruset är hur inkräktare gömmer sig."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["Questioning a colleague's work needs tact.", "Att ifrågasätta en kollegas arbete kräver fingertoppskänsla."]
          },
          evaluation: [["Keeps the anomaly open while accepting the maintenance", "Håller avvikelsen öppen samtidigt som underhållet godtas"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Looking closer", "En närmare titt"], [
              io(["Quietly under way", "I det tysta"], ["The network team agrees to pull flows and identity logs for the odd host without touching the server. The maintenance carries on undisturbed.", "Nätverksteamet går med på att hämta flöden och identitetsloggar för den udda datorn utan att röra servern. Underhållet fortsätter ostört."], ["Logs for the odd host are being pulled without disturbing the maintenance.", "Loggar för den udda datorn hämtas utan att störa underhållet."]),
              io(["The queue waits", "Kön får vänta"], ["While the only night analyst digs into the odd host, a separate alert about a phishing click waits an hour unanswered. The SOC lead asks whether this is the right use of the night.", "Medan den enda nattanalytikern gräver i den udda datorn väntar ett annat larm, om ett klick på ett nätfiskemejl, en timme utan svar. SOC-ansvarig frågar om det här är rätt sätt att använda natten."], ["Another alert waited an hour while the analyst investigated.", "Ett annat larm väntade en timme medan analytikern utredde."], { reopen: true }),
              io(["A plausible owner", "En rimlig ägare"], ["Someone in IT says the host belongs to a colleague who sometimes works late. It would explain a lot, if it is true.", "Någon på IT säger att datorn tillhör en kollega som ibland jobbar sent. Det skulle förklara mycket, om det stämmer."], ["IT says the odd host belongs to a colleague who sometimes works late.", "IT säger att den udda datorn tillhör en kollega som ibland jobbar sent."])
            ]),
            ir("i2", { notChosen: "A" }, ["The odd host left alone", "Den udda datorn lämnas ifred"], [
              io(["It goes quiet", "Den tystnar"], ["The odd host produces no detections for twenty minutes. The six per cent starts to look like a blip.", "Den udda datorn ger inga detektioner på tjugo minuter. De sex procenten börjar se ut som en tillfällighet."], ["The odd host produced no detections for twenty minutes.", "Den udda datorn gav inga detektioner på tjugo minuter."]),
              io(["The analyst escalates", "Analytikern eskalerar"], ["The analyst who spotted the odd host calls the SOC lead at home. The SOC lead wants it checked independently before anything else is closed.", "Analytikern som upptäckte den udda datorn ringer SOC-ansvarig hemma. SOC-ansvarig vill att den kontrolleras oberoende innan något mer stängs."], ["The SOC lead wants the odd host checked independently.", "SOC-ansvarig vill att den udda datorn kontrolleras oberoende."], { reopen: true }),
              io(["Logged as noise", "Loggad som brus"], ["A senior SOC colleague writes the odd host off as normal noise in the shift log. To anyone reading later, the matter looks settled.", "En erfaren kollega i SOC skriver av den udda datorn som normalt brus i skiftloggen. För den som läser senare ser saken avgjord ut."], ["The odd host is logged as normal noise in the shift log.", "Den udda datorn är loggad som normalt brus i skiftloggen."])
            ])
          ],
          pushback: {
            A: [
              pb(["The rest of the queue", "Resten av kön"], ["The odd host has limited sensor coverage, and pulling network flows at night takes an hour. Your only night analyst is now spending the shift on six per cent of one alert. Who covers everything else in the queue while they do?", "Den udda datorn har begränsad sensortäckning, och att hämta nätverksflöden på natten tar en timme. Er enda nattanalytiker ägnar nu passet åt sex procent av ett enda larm. Vem tar hand om allt annat i kön under tiden?"]),
              pb(["Behind their backs", "Bakom ryggen på dem"], ["The application team lead hears that the SOC is checking “behind their backs” and calls it a question of trust. They will raise it with their manager in the morning. Do you explain what you're doing, or keep the investigation quiet?", "Applikationsteamets ansvarige får höra att SOC kontrollerar ”bakom ryggen på dem” och kallar det en förtroendefråga. Hen tänker ta upp det med sin chef i morgon bitti. Förklarar ni vad ni gör, eller håller ni utredningen tyst?"]),
              pb(["Maybe it's a colleague", "Kanske är det en kollega"], ["Someone on the application team mentions that people sometimes run scripts from their own desks when the admin hosts are slow. If that's it, you are investigating a co-worker. Do you keep going, and how will you tell the difference?", "Någon i applikationsteamet nämner att folk ibland kör skript från sina egna datorer när administrationsdatorerna är långsamma. Om det är förklaringen utreder ni en kollega. Fortsätter ni, och hur ska ni se skillnaden?"])
            ],
            B: [
              pb(["“Probably ours”", "”Förmodligen vår”"], ["The team lead, mid-upgrade, glances at the name and says “probably one of ours” without checking. That is the answer you said you would accept. Is “probably” an answer?", "Teamets ansvarige, mitt i uppgraderingen, kastar en blick på namnet och säger ”förmodligen en av våra” utan att kontrollera. Det är svaret ni sa att ni skulle godta. Är ”förmodligen” ett svar?"]),
              pb(["Whose judgement?", "Vems bedömning?"], ["If the SOC closes this on the application team's word, their name goes in the ticket. The team lead pushes back: why isn't the SOC checking for itself? Who actually owns this judgement, them or you?", "Om SOC stänger det här på applikationsteamets ord hamnar deras namn i ärendet. Teamets ansvarige protesterar: varför kontrollerar inte SOC själv? Vem äger egentligen bedömningen, de eller ni?"]),
              pb(["Not in their own log", "Inte i deras egen logg"], ["The host isn't in the run log the team just sent you. Even if someone says it's theirs, their own evidence doesn't show it. When the person and the log disagree, which do you believe?", "Datorn finns inte i körloggen som teamet just skickade. Även om någon säger att den är deras visar deras eget underlag inte det. När personen och loggen säger olika saker, vilken tror ni på?"])
            ],
            C: [
              pb(["Rewriting the ticket", "Att skriva om ärendet"], ["Six per cent of the detections come from a host the change does not mention. Treating it all as maintenance means deciding the change ticket is wrong, without asking anyone. Who in the room decided that?", "Sex procent av detektionerna kommer från en dator som ändringen inte nämner. Att behandla allt som underhåll innebär att besluta att ändringsärendet är fel, utan att fråga någon. Vem i rummet beslutade det?"]),
              pb(["Overruled, on record", "Överkörd, till protokollet"], ["The analyst who spotted the odd host asks you to note in the ticket that they flagged it and were overruled. Do you write that down, and does seeing it written change your mind?", "Analytikern som upptäckte den udda datorn ber er notera i ärendet att hen flaggade den och blev överkörd. Skriver ni ner det, och ändrar det er uppfattning att se det i skrift?"]),
              pb(["Explaining away the evidence", "Att bortförklara underlaget"], ["The application team's own run log lists exactly which hosts their scripts ran from, and {{asset.workstationIt}} is not one of them. You are now explaining away the evidence of the people you are trusting. Why?", "Applikationsteamets egen körlogg listar exakt vilka datorer deras skript kördes från, och {{asset.workstationIt}} är inte en av dem. Ni bortförklarar nu underlaget från dem ni litar på. Varför?"])
            ]
          }
        }),
        facilitator: fac(
          ["The benign explanation is real. The skill is not letting it swallow the anomaly.", "Den harmlösa förklaringen är verklig. Konsten är att inte låta den sluka avvikelsen."],
          ["The maintenance accepted and the odd host investigated separately.", "Underhållet godtaget och den udda datorn utredd för sig."],
          [["Ask: if you had to bet, what is the six per cent?", "Fråga: om ni var tvungna att gissa, vad är de sex procenten?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 100,
        title: L(["Someone else in the window", "Någon annan i fönstret"]),
        twist: L(["Network and identity logs show a second actor, unrelated to the maintenance, using the window as cover.", "Nätverks- och identitetsloggar visar en andra aktör, utan koppling till underhållet, som använder fönstret som täckmantel."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "There is a second actor, hiding inside the maintenance window. Does the way you handled the host outside the change still look careful enough?", sv: "Det finns en andra aktör som gömmer sig i underhållsfönstret. Ser ert sätt att hantera värden utanför ändringen fortfarande tillräckligt noggrant ut?" } },
        assumptionChallenged: L(["All the activity has one explanation.", "All aktivitet har en och samma förklaring."]),
        reveals: ["hf-second"],
        narrative: L([
          "{{time.T+100|clock}}. The analyst pulls identity logs and network flows for the one host that is not named in the change.\n\nIt is a workstation in the IT department, signed in with an account that has no part in tonight's work. The application team, asked directly, says it has nothing to do with them.",
          "Klockan {{time.T+100|clock}}. Analytikern hämtar identitetsloggar och nätverksflöden för den enda dator som inte nämns i ändringen.\n\nDet är en arbetsstation på IT-avdelningen, inloggad med ett konto som inte har med nattens arbete att göra. Applikationsteamet, tillfrågat direkt, säger att det inte har något med dem att göra."
        ]),
        injects: [
          inj("i3-1", 100, "authLog", "siem", "critical", "confirmed", [
            "{{asset.workstationIt}} is logged in with a service-desk account that normally works days. It queried {{asset.erpServer}} and opened an outbound connection to {{asset.attackerIp}}. None of this is in the run log.",
            "{{asset.workstationIt}} är inloggad med ett konto från servicedesken som normalt arbetar dagtid. Den frågade mot {{asset.erpServer}} och öppnade en utgående anslutning till {{asset.attackerIp}}. Inget av detta finns i körloggen."
          ], { headline: ["A second actor", "En andra aktör"], reveals: ["hf-second"], tests: ["lo2"] }),
          inj("i3-2", 120, "chat", "itOps", "medium", "confirmed", [
            "The application team: “That account isn't ours, and that host isn't ours. We have nothing to do with it.”",
            "Applikationsteamet: ”Det kontot är inte vårt, och den datorn är inte vår. Vi har inget med det att göra.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("How do you contain the second actor without breaking the maintenance?", "Hur begränsar ni den andra aktören utan att förstöra underhållet?", ["socLead", "itOps"]),
            q("Where else has the service-desk account been?", "Var mer har kontot från servicedesken varit?", ["socLead"]),
            q("Did keeping the anomaly open pay off?", "Lönade det sig att hålla avvikelsen öppen?", ["socLead"], "d2")
          ],
          executive: [
            q("Who needs to know before {{time.T+360|clock}}?", "Vilka behöver få veta före klockan {{time.T+360|clock}}?", ["incidentCommander", "ciso"]),
            q("Is month-end close still safe to start?", "Är det fortfarande säkert att börja månadsbokslutet?", ["cfo", "serviceOwner"]),
            q("What would have happened if the alert had been closed at {{time.T+20|clock}}?", "Vad hade hänt om larmet hade stängts klockan {{time.T+20|clock}}?", ["ciso"], "d1")
          ]
        },
        challenges: [ch("The actor is active right now.", "Aktören är aktiv just nu.")],
        decision: dec("d3", "incidentCommander", ["How do you contain the second actor?", "Hur begränsar ni den andra aktören?"], [
          ["Disable the service-desk account, isolate {{asset.workstationIt}} and block {{asset.attackerIp}}; let the maintenance finish.", "Spärra kontot från servicedesken, isolera {{asset.workstationIt}} och blockera {{asset.attackerIp}}; låt underhållet slutföras."],
          ["Stop the maintenance and isolate the business system.", "Stoppa underhållet och isolera affärssystemet."],
          ["Watch the actor quietly to learn more.", "Bevaka aktören i tysthet för att lära er mer."]
        ], {
          knowns: [["A second actor uses a stolen account.", "En andra aktör använder ett stulet konto."]],
          uncertainties: [["How long they have been here.", "Hur länge de har varit här."]],
          tradeoffs: {
            operational: ["Isolating the business system halts month-end close.", "En isolering av affärssystemet stoppar månadsbokslutet."],
            security: ["Watching quietly lets them continue.", "Att bevaka i tysthet låter dem fortsätta."],
            legal: ["Personal data may be at risk.", "Personuppgifter kan vara i fara."],
            reputational: ["A delayed close is visible to the board.", "Ett försenat bokslut syns för styrelsen."]
          },
          evaluation: [["Contains the actor precisely, not the whole business", "Begränsar aktören träffsäkert, inte hela verksamheten"]],
          minutes: 10,
          interrupts: [
            ir("i1", { chosen: "C" }, ["Watching them", "Under bevakning"], [
              io(["A map of their moves", "En karta över rörelserna"], ["Watching pays off: the analyst builds a list of every host the account touches tonight, which any containment will need.", "Bevakningen lönar sig: analytikern sammanställer en lista över varje dator som kontot rör i natt, något som en begränsning kommer att behöva."], ["Watching produced a list of hosts the account touched tonight.", "Bevakningen gav en lista över datorer som kontot rörde i natt."]),
              io(["The CISO calls a halt", "Säkerhetschefen stoppar det"], ["The CISO is woken and hears that an intruder is being watched on a system holding personal data, with no approval. They order it ended and want to know who decided.", "Säkerhetschefen väcks och får höra att en inkräktare bevakas i ett system med personuppgifter, utan godkännande. Hen beordrar att det avslutas och vill veta vem som beslutade."], ["The CISO has ordered the watching to end.", "Säkerhetschefen har beordrat att bevakningen avslutas."], { reopen: true }),
              io(["The session ends", "Sessionen tar slut"], ["The actor's session ends abruptly. Nobody can tell whether they noticed you, finished their work, or simply logged off for the night.", "Aktörens session tar plötsligt slut. Ingen kan avgöra om de märkte er, blev klara med sitt arbete eller bara loggade ut för natten."], ["The actor's session ended abruptly while being watched.", "Aktörens session tog plötsligt slut under bevakningen."])
            ]),
            ir("i2", { notChosen: "C" }, ["Cut off", "Avskurna"], [
              io(["Activity stops", "Aktiviteten upphör"], ["After your action, no further activity from the actor is seen on the business system. The room starts to talk about the incident in the past tense.", "Efter er åtgärd syns ingen mer aktivitet från aktören i affärssystemet. Rummet börjar prata om incidenten i dåtid."], ["No new activity from the actor has been seen since your action.", "Ingen ny aktivitet från aktören har setts sedan er åtgärd."]),
              io(["Another try", "Ett nytt försök"], ["An hour later, a different account tries to sign in from {{asset.attackerIp}} and fails. Whoever this is has more than one key to try.", "En timme senare försöker ett annat konto logga in från {{asset.attackerIp}} och misslyckas. Den som ligger bakom har fler än en nyckel att pröva."], ["A different account tried and failed to sign in from {{asset.attackerIp}}.", "Ett annat konto försökte logga in från {{asset.attackerIp}} och misslyckades."], { reopen: true }),
              io(["The owner denies it", "Ägaren förnekar"], ["The service-desk employee whose account was used is reached by phone. They insist they were asleep, and their manager vouches for them.", "Den anställda på servicedesken vars konto användes nås per telefon. Hen insisterar på att hen sov, och chefen går i god för hen."], ["The account's owner denies involvement; their manager vouches for them.", "Kontots ägare förnekar inblandning; chefen går i god för hen."])
            ])
          ],
          pushback: {
            A: [
              pb(["The account's real owner", "Kontots verkliga ägare"], ["Disabling the service-desk account also locks out the employee it belongs to, who starts work in a few hours and, as far as anyone knows, has done nothing wrong. Do you tell them why, and what if they turn out to be involved?", "När kontot från servicedesken spärras låses också den anställda ute som kontot tillhör, som börjar jobba om några timmar och, så vitt någon vet, inte har gjort något fel. Berättar ni varför, och vad gör ni om hen visar sig vara inblandad?"]),
              pb(["They know you've seen them", "De vet att ni har sett dem"], ["Blocking the address and disabling the account tells the actor they've been spotted. If they have another way in, this is when they will use it, and you will know less about where. Was a fast, visible response worth that?", "Att blockera adressen och spärra kontot talar om för aktören att de har upptäckts. Om de har en annan väg in är det nu de använder den, och ni vet mindre om var. Var ett snabbt och synligt svar värt det?"]),
              pb(["Trusting the server", "Att lita på servern"], ["The maintenance is still running on the same server the actor queried, with broad admin rights. Letting it finish means trusting that nothing the actor did there gets carried into the upgraded system. How sure are you?", "Underhållet pågår fortfarande på samma server som aktören frågade mot, med breda administratörsrättigheter. Att låta det slutföras innebär att lita på att inget som aktören gjorde där följer med in i det uppgraderade systemet. Hur säkra är ni?"])
            ],
            B: [
              pb(["The wrong target", "Fel mål"], ["The actor is on one workstation with one account, and isolating the business system cuts off neither. Month-end stops, but the account and {{asset.workstationIt}} are still live. What does the big move actually stop?", "Aktören finns på en arbetsstation med ett konto, och att isolera affärssystemet stänger inte ute något av dem. Månadsbokslutet stannar, men kontot och {{asset.workstationIt}} är fortfarande aktiva. Vad stoppar det stora greppet egentligen?"]),
              pb(["The CFO is woken", "Ekonomichefen väcks"], ["The application team wakes {{person.cfo.name}}: month-end close cannot start on an isolated system, and payments are due today. The CFO wants to know who decided, and why it could not be more targeted. Who takes that call?", "Applikationsteamet väcker {{person.cfo.name}}: månadsbokslutet kan inte starta på ett isolerat system, och betalningar ska gå i dag. Ekonomichefen vill veta vem som beslutade, och varför det inte kunde vara mer riktat. Vem tar det samtalet?"]),
              pb(["No clean way back", "Ingen ren väg tillbaka"], ["The application team warns that stopping mid-upgrade may leave no clean rollback: the old version is partly replaced and the new one unfinished. Do you let them finish under watch, or take ownership of whatever state the system ends up in?", "Applikationsteamet varnar för att ett stopp mitt i uppgraderingen kanske inte lämnar någon ren väg tillbaka: den gamla versionen är delvis ersatt och den nya inte klar. Låter ni dem slutföra under bevakning, eller tar ni ansvar för det skick systemet hamnar i?"])
            ],
            C: [
              pb(["What is leaving?", "Vad lämnar huset?"], ["While you watch, the connection to {{asset.attackerIp}} stays open and you cannot see what is flowing through it. Every minute of learning may be a minute of loss. How long do you watch, and what makes you stop?", "Medan ni bevakar är anslutningen till {{asset.attackerIp}} fortfarande öppen och ni kan inte se vad som går genom den. Varje minut av lärande kan vara en minut av förlust. Hur länge bevakar ni, och vad får er att sluta?"]),
              pb(["Who said yes?", "Vem sa ja?"], ["Watching an intruder on a system that holds personal data is a decision someone must own. The CISO has not been told yet. Who approved this, and would they say so tomorrow in front of the board?", "Att bevaka en inkräktare i ett system med personuppgifter är ett beslut som någon måste äga. Säkerhetschefen har inte fått veta än. Vem godkände det här, och skulle hen säga det i morgon inför styrelsen?"]),
              pb(["One analyst, two jobs", "En analytiker, två jobb"], ["Watching quietly means one night analyst following the actor live while the maintenance alerts keep coming. If the actor moves to a host nobody is watching, nobody will see it. Is this monitoring, or hoping?", "Att bevaka i tysthet innebär att en nattanalytiker följer aktören i realtid medan underhållslarmen fortsätter komma. Om aktören flyttar till en dator som ingen bevakar ser ingen det. Är det här bevakning, eller förhoppning?"])
            ]
          }
        }),
        facilitator: fac(
          ["The heart of the scenario: both stories are true at once.", "Kärnan i scenariot: båda berättelserna är sanna samtidigt."],
          ["Targeted containment of the second actor with the maintenance completed.", "Riktad begränsning av den andra aktören med underhållet slutfört."],
          [["Ask: what is the smallest action that stops them?", "Fråga: vilken är den minsta åtgärden som stoppar dem?"]]
        )
      },
      {
        id: "p4",
        priority: 1,
        clock: 240,
        title: L(["Why nobody saw it", "Varför ingen såg det"]),
        twist: L(["The SOC had suppressed these alerts during every maintenance window — and the actor had worked only inside them.", "SOC hade undertryckt de här larmen under varje underhållsfönster – och aktören hade bara arbetat inom dem."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d3", option: "B" }, narrativeAppend: { en: "Because the maintenance was stopped mid-way, the business system now runs a half-upgraded version, and support has a growing backlog.", sv: "Eftersom underhållet stoppades halvvägs kör affärssystemet nu en halvt uppgraderad version, och supporten har en växande kö." } }
        ],
        assumptionChallenged: L(["Our monitoring would have caught this earlier.", "Vår bevakning hade upptäckt det här tidigare."]),
        reveals: ["hf-suppress"],
        narrative: L([
          "{{time.T+240|clock}}. The second actor is contained, for now. The SOC lead asks the uncomfortable question: if this has happened before, why is tonight the first alert anyone has seen?\n\nThe answer is in the SOC's own configuration, written to make the night shift's life easier.",
          "Klockan {{time.T+240|clock}}. Den andra aktören är isolerad, för tillfället. SOC-ansvarig ställer den obekväma frågan: om det här har hänt förut, varför är i natt första gången någon ser ett larm?\n\nSvaret finns i SOC:s egen konfiguration, skriven för att göra nattskiftets arbete enklare."
        ]),
        injects: [
          inj("i4-1", 240, "forensicFinding", "soc", "high", "confirmed", [
            "A suppression rule mutes lateral-movement alerts on {{asset.erpServer}} during maintenance windows. It hid {{num.alertsSuppressed}} alerts over the last {{num.windows}} windows. Tonight's alert fired only because the window started late.",
            "En undertryckningsregel tystar larm om lateral rörelse på {{asset.erpServer}} under underhållsfönster. Den dolde {{num.alertsSuppressed}} larm under de senaste {{num.windows}} fönstren. Nattens larm utlöstes bara för att fönstret började sent."
          ], { headline: ["Suppressed alerts", "Undertryckta larm"], reveals: ["hf-suppress"], tests: ["lo4"] })
        ],
        charts: [{
          id: "c4-suppressed", type: "bar",
          title: L(["Alerts on the business system per maintenance window", "Larm på affärssystemet per underhållsfönster"]), unit: L(["alerts", "larm"]),
          caption: L(["Windows, oldest first.", "Fönster, äldsta först."]),
          data: (ctx) => {
            const n = ctx.vars.windows;
            const cats = Array.from({ length: n }, (_, i) => "#" + (i + 1));
            const each = Math.max(1, Math.round(ctx.vars.alertsSuppressed / n));
            return { categories: cats, series: [
              { id: "maint", label: L(["Maintenance", "Underhåll"]), values: cats.map(() => each) },
              { id: "unknown", label: L(["Not explained by maintenance", "Kan inte förklaras av underhåll"]), values: cats.map((_, i) => (i >= n - 3 ? 2 + ctx.rng.int(0, 6) : 0)) }
            ] };
          }
        }],
        questions: {
          technical: [
            q("Which other suppression rules exist, and who approved them?", "Vilka andra undertryckningsregler finns, och vem godkände dem?", ["socLead"]),
            q("How could the actor know the maintenance schedule?", "Hur kunde aktören känna till underhållsschemat?", ["socLead", "itOps"]),
            q("Did your containment cover the actor's earlier windows?", "Täckte er begränsning aktörens tidigare fönster?", ["socLead"], "d3")
          ],
          executive: [
            q("Who owns the decision to suppress alerts?", "Vem äger beslutet att undertrycka larm?", ["ciso", "cio"]),
            q("How do you talk about this without blaming the SOC?", "Hur pratar ni om det här utan att skylla på SOC?", ["ciso", "incidentCommander"]),
            q("Does this change how you judge the first-night decision?", "Ändrar det här hur ni bedömer beslutet den första natten?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The suppression rule was created to stop alert fatigue.", "Undertryckningsregeln skapades för att motverka larmtrötthet.")],
        decision: dec("d4", "ciso", ["What do you do with the suppression rules?", "Vad gör ni med undertryckningsreglerna?"], [
          ["Replace blanket suppression with rules tied to named hosts and accounts in each change.", "Ersätt allmän undertryckning med regler kopplade till namngivna datorer och konton i varje ändring."],
          ["Remove all suppression and accept more alerts.", "Ta bort all undertryckning och acceptera fler larm."],
          ["Keep the rules but review the suppressed alerts after each window.", "Behåll reglerna men granska de undertryckta larmen efter varje fönster."]
        ], {
          knowns: [["Suppression hid {{num.alertsSuppressed}} alerts.", "Undertryckningen dolde {{num.alertsSuppressed}} larm."]],
          uncertainties: [["How the schedule leaked.", "Hur schemat läckte ut."]],
          tradeoffs: {
            operational: ["More alerts strain a small SOC.", "Fler larm belastar ett litet SOC."],
            security: ["Blanket suppression is a published blind spot.", "Allmän undertryckning är en publicerad blind fläck."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["The board will ask why monitoring was switched off.", "Styrelsen kommer att fråga varför bevakningen var avstängd."]
          },
          evaluation: [["Makes suppression precise rather than broad", "Gör undertryckningen precis i stället för bred"]],
          interrupts: [
            ir("i1", { chosen: "C" }, ["The rules stay", "Reglerna blir kvar"], [
              io(["The review works", "Granskningen fungerar"], ["The first morning-after review runs on time and finds nothing. The SOC lead says the process works.", "Den första granskningen morgonen efter görs i tid och hittar ingenting. SOC-ansvarig säger att processen fungerar."], ["The first morning-after review ran on time and found nothing.", "Den första granskningen morgonen efter gjordes i tid och hittade ingenting."]),
              io(["The audit committee asks", "Revisionsutskottet frågar"], ["The audit committee hears that alerts on the business system will still be muted during maintenance, and asks why a known blind spot was kept.", "Revisionsutskottet får höra att larmen på affärssystemet fortfarande ska tystas under underhåll, och frågar varför en känd blind fläck behölls."], ["The audit committee has asked why the muted windows were kept.", "Revisionsutskottet har frågat varför de tystade fönstren behölls."], { reopen: true }),
              io(["Later this week", "Senare i veckan"], ["Another maintenance window on the same server is scheduled for later this week. The rule will be in force again.", "Ett nytt underhållsfönster på samma server är inplanerat senare i veckan. Regeln gäller då igen."], ["Another maintenance window on the server is scheduled this week.", "Ett nytt underhållsfönster på servern är inplanerat den här veckan."])
            ]),
            ir("i2", { notChosen: "C" }, ["The rules change", "Reglerna ändras"], [
              io(["The first window", "Det första fönstret"], ["The first maintenance window under the new setup surfaces two alerts, both explained within minutes. The analysts are cautiously pleased.", "Det första underhållsfönstret med det nya upplägget ger två larm, båda förklarade inom några minuter. Analytikerna är försiktigt nöjda."], ["The first window under the new rules surfaced two alerts, both explained.", "Det första fönstret med de nya reglerna gav två larm, båda förklarade."]),
              io(["Swamped", "Översvämmade"], ["The night analysts are swamped by alerts the old rule used to hide. One asks, in writing, for the old rule back until there are more people.", "Nattanalytikerna dränks i larm som den gamla regeln brukade dölja. En av dem ber skriftligt om att få tillbaka den gamla regeln tills det finns mer personal."], ["The night analysts were swamped and asked for the old rule back.", "Nattanalytikerna dränktes i larm och bad om att få tillbaka den gamla regeln."], { reopen: true }),
              io(["Slower changes", "Långsammare ändringar"], ["Change tickets now take longer to approve, and one team postpones its maintenance rather than list every host. Nobody is sure whether that is safer.", "Ändringsärenden tar nu längre tid att godkänna, och ett team skjuter upp sitt underhåll hellre än att lista varje dator. Ingen är säker på om det är säkrare."], ["Changes now take longer; one team postponed its maintenance.", "Ändringar tar nu längre tid; ett team har skjutit upp sitt underhåll."])
            ])
          ],
          pushback: {
            A: [
              pb(["Vague tickets", "Vaga ärenden"], ["Most change tickets don't list hosts or accounts; the application team writes “the ERP environment”. Precise suppression needs precise tickets. Who makes every team write them, starting with the next window?", "De flesta ändringsärenden listar inte datorer eller konton; applikationsteamet skriver ”ERP-miljön”. Precis undertryckning kräver precisa ärenden. Vem får varje team att skriva dem så, med början i nästa fönster?"]),
              pb(["A rule for every change", "En regel för varje ändring"], ["Every change now needs its own suppression rule, written before and removed after by the SOC. The night analysts say it will be done in a hurry, or not at all. Who writes them, and who checks they are removed?", "Varje ändring kräver nu en egen undertryckningsregel, som SOC skriver före och tar bort efter. Nattanalytikerna säger att det kommer att göras i all hast, eller inte alls. Vem skriver dem, och vem kontrollerar att de tas bort?"]),
              pb(["Named accounts can be stolen", "Namngivna konton kan stjälas"], ["Tonight's actor used a real account. Had they used one of the named maintenance accounts instead, a precise rule would have muted them as well. Does this close the blind spot, or just make it smaller?", "Nattens aktör använde ett riktigt konto. Om de i stället hade använt ett av de namngivna underhållskontona skulle även en precis regel ha tystat dem. Stänger det här den blinda fläcken, eller gör det den bara mindre?"])
            ],
            B: [
              pb(["The flood", "Floden"], ["Next maintenance night, the SOC gets every alert the rule used to hide, nearly all of them maintenance. By the end of the shift, analysts are closing them in batches. Have you removed the blind spot, or moved it?", "Nästa underhållsnatt får SOC alla larm som regeln brukade dölja, nästan alla underhåll. Mot slutet av passet stänger analytikerna dem i klump. Har ni tagit bort den blinda fläcken, eller flyttat den?"]),
              pb(["Why the rule existed", "Varför regeln fanns"], ["The SOC lead reminds you the rule was created because the team was drowning, and removing it without more people recreates the problem. Do you give them more people, or ask them to cope?", "SOC-ansvarig påminner om att regeln skapades för att teamet drunknade, och att ta bort den utan mer personal återskapar problemet. Ger ni dem mer folk, eller ber ni dem klara sig?"]),
              pb(["All at once", "Allt på en gång"], ["Other teams ask whether their suppression rules go too. Switching everything back on at once means nobody knows which of the new alerts matter. Where do you start, and in what order?", "Andra team frågar om deras undertryckningsregler också försvinner. Att slå på allt på en gång innebär att ingen vet vilka av de nya larmen som spelar roll. Var börjar ni, och i vilken ordning?"])
            ],
            C: [
              pb(["The morning after", "Morgonen efter"], ["Tonight's actor did their work inside the window. Reviewing suppressed alerts after it closes means finding out after they have finished. Is a morning-after review detection, or just a report?", "Nattens aktör gjorde sitt arbete inne i fönstret. Att granska undertryckta larm när det har stängt innebär att få veta det efter att de är klara. Är en granskning morgonen efter upptäckt, eller bara en rapport?"]),
              pb(["The review that slips", "Granskningen som uteblir"], ["The reviews land on the day shift, which already has a backlog. The first one is skipped because of a busy morning, and nobody notices. Who checks that the reviews actually happen?", "Granskningarna hamnar hos dagskiftet, som redan har en kö. Den första hoppas över på grund av en stressig morgon, och ingen märker det. Vem kontrollerar att granskningarna faktiskt blir av?"]),
              pb(["The same blind spot", "Samma blinda fläck"], ["The windows are still published and the alerts are still muted while they run. Anyone who learned the schedule once can use it again. What have you actually changed before the next window?", "Fönstren publiceras fortfarande och larmen är fortfarande tystade medan de pågår. Den som har lärt sig schemat en gång kan använda det igen. Vad har ni faktiskt ändrat före nästa fönster?"])
            ]
          }
        }),
        facilitator: fac(
          ["Alert fatigue is a design problem, not a people problem.", "Larmtrötthet är ett designproblem, inte ett personproblem."],
          ["Suppression tied to named hosts and accounts.", "Undertryckning kopplad till namngivna datorer och konton."],
          [["Ask: where is your maintenance calendar published?", "Fråga: var publiceras er underhållskalender?"]]
        )
      },
      {
        id: "p5",
        priority: 2,
        clock: 330,
        title: L(["Month-end can't wait", "Månadsbokslutet kan inte vänta"]),
        twist: L(["Finance overrules: the business system must be up for month-end close, investigation or not.", "Ekonomi kör över: affärssystemet måste vara i drift för månadsbokslutet, utredning eller inte."]),
        twistKind: "authority",
        assumptionChallenged: L(["Security decides what happens to a compromised system.", "Säkerhet bestämmer vad som händer med ett komprometterat system."]),
        narrative: L([
          "{{time.T+330|clock}}. The security team wants the business system offline while the investigation continues: nobody knows yet what the second actor touched.\n\nThe CFO has been woken up and has a different view. Month-end close starts within the hour, and it moves large sums of money on fixed deadlines.",
          "Klockan {{time.T+330|clock}}. Säkerhetsteamet vill ha affärssystemet nedstängt medan utredningen pågår: ingen vet ännu vad den andra aktören rörde.\n\nEkonomichefen har väckts och har en annan uppfattning. Månadsbokslutet börjar inom en timme, och det flyttar stora summor pengar med fasta tidsgränser."
        ]),
        injects: [
          inj("i5-1", 330, "executiveMessage", "person.cfo", "high", "confirmed", [
            "“The close moves {{num.monthEndValue|currency}} in payments and reporting today. If the system is offline, we miss payroll and the bank deadline. Investigate around it.”",
            "”Bokslutet hanterar {{num.monthEndValue|currency}} i betalningar och rapportering i dag. Om systemet är nere missar vi lönerna och bankens tidsgräns. Utred runt det.”"
          ], { fallbackRole: "serviceOwner", tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What monitoring would make running the close acceptable?", "Vilken bevakning skulle göra det acceptabelt att köra bokslutet?", ["socLead", "itOps"]),
            q("Can you verify the system is clean of the actor before {{time.T+360|clock}}?", "Kan ni bekräfta att systemet är fritt från aktören före klockan {{time.T+360|clock}}?", ["socLead"]),
            q("Did your containment leave the system usable?", "Lämnade er begränsning systemet användbart?", ["itOps"], "d3")
          ],
          executive: [
            q("Who has authority here: the CFO or the CISO?", "Vem har mandatet här: ekonomichefen eller säkerhetschefen?", ["incidentCommander", "cio"]),
            q("What residual risk are you accepting, and who signs for it?", "Vilken kvarvarande risk accepterar ni, och vem skriver under på den?", ["cfo", "ciso"]),
            q("Do your suppression changes affect month-end monitoring?", "Påverkar era ändringar av undertryckningen bevakningen av månadsbokslutet?", ["ciso"], "d4")
          ]
        },
        challenges: [ch("Payroll for {{num.employeesPayroll}} employees runs from this system.", "Lönerna för {{num.employeesPayroll}} anställda körs från det här systemet.")],
        decision: dec("d5", "incidentCommander", ["Does the close run?", "Körs bokslutet?"], [
          ["Run it under enhanced monitoring, with payments approved manually and a named risk owner.", "Kör det med förstärkt bevakning, manuellt godkända betalningar och en utsedd riskägare."],
          ["Postpone the close until the system is verified.", "Skjut upp bokslutet tills systemet är kontrollerat."],
          ["Run the close as normal: the actor has only been seen inside maintenance windows, and month-end is not one.", "Kör bokslutet som vanligt: aktören har bara setts inne i underhållsfönster, och månadsskiftet är inget sådant."]
        ], {
          knowns: [["The actor's known access is contained.", "Aktörens kända åtkomst är begränsad."]],
          uncertainties: [["Whether they left anything behind.", "Om de har lämnat något efter sig."]],
          tradeoffs: {
            operational: ["Postponing misses payroll and the bank deadline.", "Ett uppskjutande missar lönerna och bankens tidsgräns."],
            security: ["Running as normal ignores possible payment fraud.", "Att köra som vanligt bortser från möjliga betalningsbedrägerier."],
            legal: ["Paying staff late has legal consequences.", "Att betala ut löner för sent får rättsliga följder."],
            reputational: ["Fraudulent payments would be far worse than a delay.", "Bedrägliga betalningar vore mycket värre än en försening."]
          },
          evaluation: [["Makes risk acceptance explicit and owned", "Gör riskacceptansen uttalad och ägd"]],
          interrupts: [
            ir("i1", { chosen: "B" }, ["Close postponed", "Bokslutet uppskjutet"], [
              io(["The bank gives a day", "Banken ger en dag"], ["The bank grants a one-day extension. Payroll can still go out, a day late, and {{person.cfo.name}} grudgingly accepts.", "Banken beviljar en dags förlängning. Lönerna kan fortfarande gå ut, en dag sent, och {{person.cfo.name}} godtar det motvilligt."], ["The bank granted a one-day extension for the close.", "Banken beviljade en dags förlängning för bokslutet."]),
              io(["The CEO overrules", "Vd kör över"], ["Briefed by {{person.cfo.name}}, the CEO orders the close to start within two hours, with or without security sign-off.", "Efter en dragning av {{person.cfo.name}} beordrar vd att bokslutet ska börja inom två timmar, med eller utan säkerhetens godkännande."], ["The CEO has ordered the close to start within two hours.", "Vd har beordrat att bokslutet ska börja inom två timmar."], { reopen: true }),
              io(["Staff find out", "Personalen får veta"], ["Word gets out that salaries will be late. HR is fielding calls, and nobody has agreed what to say about why.", "Det sprids att lönerna blir sena. HR tar emot samtal, och ingen har kommit överens om vad som ska sägas om varför."], ["Staff know salaries will be late; HR has no agreed explanation.", "Personalen vet att lönerna blir sena; HR har ingen överenskommen förklaring."])
            ]),
            ir("i2", { notChosen: "B" }, ["The close runs", "Bokslutet körs"], [
              io(["Nothing unusual", "Inget ovanligt"], ["The first hours of the close show nothing unusual. Finance says security worried for nothing.", "Bokslutets första timmar visar inget ovanligt. Ekonomi säger att säkerhet oroade sig i onödan."], ["The first hours of the close showed nothing unusual.", "Bokslutets första timmar visade inget ovanligt."]),
              io(["Audit wants it in writing", "Revisionen vill ha det skriftligt"], ["Internal audit asks who accepted the risk of running the close on a system under investigation, and wants it in writing before payments are released.", "Internrevisionen frågar vem som accepterade risken att köra bokslutet på ett system under utredning, och vill ha det skriftligt innan betalningarna släpps."], ["Internal audit wants written risk acceptance before payments are released.", "Internrevisionen vill ha en skriftlig riskacceptans innan betalningarna släpps."], { reopen: true }),
              io(["Too many alerts", "För många larm"], ["The close produces a wave of alerts on normal finance activity. The SOC cannot easily tell which ones, if any, matter.", "Bokslutet ger en våg av larm på normal ekonomiaktivitet. SOC kan inte enkelt avgöra vilka, om några, som spelar roll."], ["The close is producing alerts the SOC struggles to triage.", "Bokslutet ger larm som SOC har svårt att sortera."])
            ])
          ],
          pushback: {
            A: [
              pb(["Nobody will sign", "Ingen vill skriva under"], ["Neither {{person.cfo.name}} nor the CISO wants to be the named risk owner; each says it is the other's call. The close starts within the hour. Who signs, and what happens if nobody does?", "Varken {{person.cfo.name}} eller säkerhetschefen vill vara utsedd riskägare; båda säger att det är den andras beslut. Bokslutet börjar inom en timme. Vem skriver under, och vad händer om ingen gör det?"]),
              pb(["Manual, in batches", "Manuellt, i klump"], ["Approving payments manually means finance checking thousands of transactions in a few hours, against a fixed bank deadline. Finance says it will approve them batch by batch. Is that still manual approval?", "Att godkänna betalningar manuellt innebär att ekonomi ska kontrollera tusentals transaktioner på några timmar, mot en fast tidsgräns hos banken. Ekonomi säger att de kommer att godkänna dem bunt för bunt. Är det fortfarande manuellt godkännande?"]),
              pb(["Monitoring for what?", "Bevaka vad?"], ["The SOC is asked to watch the close, but nobody can say what a malicious change during month-end would look like. What exactly are they watching for, and who has the authority to stop the close if something looks wrong?", "SOC ska bevaka bokslutet, men ingen kan säga hur en skadlig ändring under månadsskiftet skulle se ut. Vad är det exakt de ska hålla utkik efter, och vem har mandat att stoppa bokslutet om något ser fel ut?"])
            ],
            B: [
              pb(["Payday missed", "Lönedagen missas"], ["Postponing means {{num.employeesPayroll}} employees are not paid on time, and HR expects the unions on the phone by lunch. Do you tell staff the real reason, and if so, what exactly do you say?", "Ett uppskjutande innebär att {{num.employeesPayroll}} anställda inte får lön i tid, och HR räknar med att facket ringer före lunch. Berättar ni den verkliga anledningen för personalen, och i så fall vad säger ni exakt?"]),
              pb(["Over your head", "Över ert huvud"], ["{{person.cfo.name}} calls postponing a business decision and goes straight to the CEO. Within the hour you are asked to justify it. What evidence do you have that the system is not safe enough to run?", "{{person.cfo.name}} kallar uppskjutandet ett affärsbeslut och går direkt till vd. Inom en timme måste ni motivera det. Vilket underlag har ni för att systemet inte är tillräckligt säkert att köra?"]),
              pb(["Verified when?", "Kontrollerat när?"], ["The SOC cannot say when the system will count as verified: proving that nothing was left behind may never be fully possible. Postponed until when, exactly, and who decides it is enough?", "SOC kan inte säga när systemet räknas som kontrollerat: att bevisa att inget har lämnats kvar kanske aldrig går helt. Uppskjutet till när, exakt, och vem avgör att det räcker?"])
            ],
            C: [
              pb(["Seen only where you looked", "Sedd bara där ni tittade"], ["The actor was seen inside maintenance windows, but you only looked there because that's where alerts were muted. Do you know they never worked outside the windows, or just that nobody saw it?", "Aktören syntes inne i underhållsfönster, men ni tittade bara där eftersom det var där larmen var tystade. Vet ni att de aldrig arbetade utanför fönstren, eller bara att ingen såg det?"]),
              pb(["Nobody decided", "Ingen beslutade"], ["Running as normal means nobody has accepted the risk in writing. If a payment goes wrong, the first question will be who decided, and the answer will be “nobody did”. Are you comfortable with that answer?", "Att köra som vanligt innebär att ingen har accepterat risken skriftligt. Om en betalning går fel blir första frågan vem som beslutade, och svaret blir ”ingen gjorde det”. Känner ni er bekväma med det svaret?"]),
              pb(["The SOC wants it noted", "SOC vill ha det noterat"], ["The SOC lead asks for an objection to be recorded: nobody has yet checked what the stolen account did before tonight. Running the close as normal ignores that. Do you overrule them and run it anyway?", "SOC-ansvarig vill att en invändning noteras: ingen har ännu kontrollerat vad det stulna kontot gjorde före i natt. Att köra bokslutet som vanligt bortser från det. Kör ni över dem och kör ändå?"])
            ]
          }
        }),
        facilitator: fac(
          ["A real governance tension. There is no clean answer.", "En verklig styrningskonflikt. Det finns inget rent svar."],
          ["The close runs under compensating controls with a named risk owner.", "Bokslutet körs med kompenserande kontroller och en utsedd riskägare."],
          [["Ask: who signs the risk acceptance, in writing?", "Fråga: vem skriver under riskacceptansen, skriftligt?"]]
        )
      },
      {
        id: "p6",
        priority: 3,
        clock: 720,
        title: L(["They read the payroll", "De läste lönerna"]),
        twist: L(["Weeks ago, the actor's account queried the payroll database, including bank details.", "För flera veckor sedan frågade aktörens konto mot lönedatabasen, inklusive bankuppgifter."]),
        twistKind: "scope",
        reconsider: { decision: "d3", pressure: { en: "The actor read the payroll weeks ago. If you watched them to learn more, they kept their access while you did. If you cut them off, you may never know what else they took.", sv: "Aktören läste lönedatabasen för flera veckor sedan. Om ni bevakade dem för att lära er mer behöll de sin åtkomst under tiden. Om ni stängde ute dem får ni kanske aldrig veta vad mer de tog." } },
        branches: [
          { when: { decision: "d5", option: "B" }, narrativeAppend: { en: "Because month-end was postponed, suppliers were paid late, and two have put your account on hold.", sv: "Eftersom månadsbokslutet sköts upp fick leverantörerna betalt för sent, och två har spärrat ert kundkonto." } }
        ],
        assumptionChallenged: L(["The actor only got as far as the business system.", "Aktören kom bara så långt som till affärssystemet."]),
        reveals: ["hf-payroll"],
        narrative: L([
          "Midday. Month-end is under way, one way or another. The SOC replays the second account's history across every suppressed maintenance window, going back weeks.\n\nUntil now, the room has treated tonight as an attempt that was caught in time. The replay shows what the account did on nights when nobody was watching.",
          "Mitt på dagen. Månadsbokslutet pågår, på ett eller annat sätt. SOC spelar upp det andra kontots historik över varje undertryckt underhållsfönster, flera veckor bakåt.\n\nHittills har rummet behandlat natten som ett försök som stoppades i tid. Uppspelningen visar vad kontot gjorde de nätter då ingen tittade."
        ]),
        injects: [
          inj("i6-1", 720, "forensicFinding", "forensics", "high", "confirmed", [
            "{{num.firstWindowDays}} days ago, during a maintenance window, the service-desk account exported salary and bank-account data for {{num.employeesPayroll}} employees.",
            "För {{num.firstWindowDays}} dagar sedan, under ett underhållsfönster, exporterade kontot från servicedesken löne- och kontouppgifter för {{num.employeesPayroll}} anställda."
          ], { headline: ["Payroll data exported", "Löneuppgifter exporterade"], reveals: ["hf-payroll"], tests: ["lo2"] }),
          inj("i6-2", 760, "employeeReport", "employee", "medium", "unverified", [
            "An employee asks HR why their bank changed their salary account last month — they never asked for it.",
            "En anställd frågar HR varför banken bytte deras lönekonto förra månaden – de bad aldrig om det."
          ], { optional: true, statedReliability: ["Single report", "Enskild uppgift"], tests: ["lo2"] })
        ],
        charts: [{
          id: "c6-kpi", type: "kpi",
          title: L(["What the second actor reached", "Vad den andra aktören nådde"]),
          data: kpi([
            { id: "emp", label: ["Employees in exported payroll data", "Anställda i exporterade löneuppgifter"], value: (v) => v.employeesPayroll, tone: "danger" },
            { id: "windows", label: ["Maintenance windows used", "Utnyttjade underhållsfönster"], value: (v) => v.windows, tone: "warn" },
            { id: "days", label: ["Days since first export", "Dagar sedan första exporten"], value: (v) => v.firstWindowDays, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("What else did the account read or change?", "Vad mer läste eller ändrade kontot?", ["socLead"]),
            q("Were any salary accounts changed?", "Har några lönekonton ändrats?", ["itOps", "socLead"]),
            q("Did your risk acceptance for the close hold up?", "Höll er riskacceptans för bokslutet?", ["socLead"], "d5")
          ],
          executive: [
            q("Is this a personal-data breach you must report to {{reg.dpaShort}}?", "Är det här en personuppgiftsincident som ni måste anmäla till {{reg.dpaShort}}?", ["dpo"]),
            q("What do you tell employees, and when?", "Vad säger ni till de anställda, och när?", ["hr", "dpo"]),
            q("Would you run the close the same way, knowing this?", "Skulle ni köra bokslutet på samma sätt, med den här vetskapen?", ["cfo"], "d5")
          ]
        },
        challenges: [ch("The export was weeks ago; the 72 hours may have started at {{time.T+100|clock}}.", "Exporten skedde för flera veckor sedan; de 72 timmarna kan ha börjat klockan {{time.T+100|clock}}.")],
        decision: dec("d6", "dpo", ["How do you handle the payroll exposure?", "Hur hanterar ni exponeringen av löneuppgifterna?"], [
          ["Report to {{reg.dpaShort}}, tell employees today and check every salary-account change.", "Anmäl till {{reg.dpaShort}}, informera de anställda i dag och kontrollera varje ändring av lönekonton."],
          ["Report, but tell employees once the investigation is complete.", "Anmäl, men informera de anställda när utredningen är klar."],
          ["Wait until it is clear whether data was misused.", "Vänta tills det är klart om uppgifterna har missbrukats."]
        ], {
          knowns: [["Payroll data was exported.", "Löneuppgifter har exporterats."]],
          uncertainties: [["Whether salary accounts were redirected.", "Om lönekonton har ändrats till andra mottagare."]],
          tradeoffs: {
            operational: ["Checking every change takes payroll staff days.", "Att kontrollera varje ändring tar lönepersonalen flera dagar."],
            security: ["Employees can only protect themselves if they know.", "De anställda kan bara skydda sig om de vet."],
            legal: ["The 72-hour clock runs from awareness.", "72-timmarsfristen löper från det att ni fick kännedom."],
            reputational: ["Staff will judge you on how they hear about it.", "Personalen kommer att döma er efter hur de får veta det."]
          },
          evaluation: [["Reports in time and informs employees promptly", "Anmäler i tid och informerar de anställda snabbt"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Staff told today", "Personalen informerad i dag"], [
              io(["A calm response", "Ett lugnt mottagande"], ["Staff take the news calmly, and HR is thanked for being straight. Several employees check their own accounts and find nothing wrong.", "Personalen tar emot beskedet lugnt, och HR får tack för att de var raka. Flera anställda kontrollerar sina egna konton och hittar inget fel."], ["Staff responded calmly; early self-checks found nothing wrong.", "Personalen reagerade lugnt; de första egna kontrollerna hittade inget fel."]),
              io(["In the local news", "I lokala nyheter"], ["Within hours, a local news site reports a payroll data breach at the company, quoting an employee. Journalists want a statement.", "Inom några timmar rapporterar en lokal nyhetssajt om en läcka av löneuppgifter på företaget och citerar en anställd. Journalister vill ha en kommentar."], ["Local media is reporting a payroll data breach.", "Lokala medier rapporterar om en läcka av löneuppgifter."], { meters: { media: 1 } }),
              io(["The union steps in", "Facket kliver in"], ["The union asks the company to pay for fraud protection for every affected employee and to commission an independent review.", "Facket kräver att företaget betalar för bedrägeriskydd åt varje berörd anställd och beställer en oberoende granskning."], ["The union is demanding fraud protection and an independent review.", "Facket kräver bedrägeriskydd och en oberoende granskning."])
            ]),
            ir("i2", { notChosen: "A" }, ["Not told yet", "Inte informerade än"], [
              io(["Two quiet days", "Två lugna dagar"], ["No new reports of misuse come in over the next two days. Legal says waiting looks justified.", "Inga nya rapporter om missbruk kommer in de närmaste två dagarna. Juristen säger att väntan ser motiverad ut."], ["No new reports of misuse came in over the next two days.", "Inga nya rapporter om missbruk kom in de följande två dagarna."]),
              io(["A direct question", "En direkt fråga"], ["An employee emails HR asking whether the rumoured payroll breach is real. HR has been told to say nothing, and says exactly that.", "En anställd mejlar HR och frågar om ryktet om en löneläcka stämmer. HR har blivit tillsagd att inte säga något, och säger just det."], ["HR was asked directly about a payroll breach and could not answer.", "HR fick en direkt fråga om en löneläcka och kunde inte svara."], { reopen: true }),
              io(["The union has heard", "Facket har hört"], ["The union representative has heard something about payroll data and asks for a meeting tomorrow. They do not say how much they know.", "Fackets representant har hört något om löneuppgifter och begär ett möte i morgon. Hen säger inte hur mycket hen vet."], ["The union has heard about the payroll data and wants a meeting.", "Facket har hört talas om löneuppgifterna och vill ha ett möte."])
            ])
          ],
          pushback: {
            A: [
              pb(["Questions you can't answer", "Frågor ni inte kan besvara"], ["Telling employees today brings hundreds of questions you can't answer yet: was my account changed, will I be paid, should I call my bank? HR has two people free. Who answers, and with what?", "Att informera de anställda i dag ger hundratals frågor som ni inte kan besvara än: har mitt konto ändrats, får jag lön, ska jag ringa min bank? HR har två personer lediga. Vem svarar, och med vad?"]),
              pb(["Payroll grinds to a halt", "Lönearbetet står still"], ["Checking every salary-account change means payroll staff drop everything for days, right after month-end. Other payments and corrections start to slip. Do you bring in help, or accept the knock-on delays?", "Att kontrollera varje ändring av lönekonton innebär att lönepersonalen släpper allt annat i flera dagar, direkt efter månadsskiftet. Andra betalningar och rättelser börjar halka efter. Tar ni in hjälp, eller accepterar ni följdförseningarna?"]),
              pb(["A script for scammers", "Ett manus för bedragare"], ["Within hours of your notice, staff receive emails “from payroll” asking them to confirm their bank details. Your announcement gave fraudsters a script. How do you warn people without causing more panic?", "Inom några timmar efter ert meddelande får personalen mejl ”från lönekontoret” som ber dem bekräfta sina bankuppgifter. Ert besked gav bedragarna ett manus. Hur varnar ni utan att skapa mer panik?"])
            ],
            B: [
              pb(["They hear it anyway", "De får höra det ändå"], ["Talk of a “payroll hack” is already going round the staff chat. The investigation will take days. How long before employees learn from colleagues what you have chosen not to tell them yet?", "Prat om ett ”lönehack” sprids redan i personalens chatt. Utredningen tar flera dagar. Hur länge dröjer det innan de anställda får veta av kollegor det som ni har valt att inte berätta än?"]),
              pb(["The DPO disagrees", "Dataskyddsombudet håller inte med"], ["The DPO points out that when the risk to people is high, they must be told without undue delay, not at the end of an investigation. How do you justify the wait if {{reg.dpaShort}} asks?", "Dataskyddsombudet påpekar att när risken för de enskilda är hög ska de informeras utan onödigt dröjsmål, inte när en utredning är klar. Hur motiverar ni väntan om {{reg.dpaShort}} frågar?"]),
              pb(["They can't protect themselves", "De kan inte skydda sig"], ["Employees whose bank details were exported cannot watch for fraud if they don't know. If one of them loses a salary payment next week, what do you say about why you waited?", "Anställda vars bankuppgifter exporterades kan inte vara uppmärksamma på bedrägerier om de inte vet om det. Om någon av dem går miste om en löneutbetalning nästa vecka, vad säger ni om varför ni väntade?"])
            ],
            C: [
              pb(["The clock already started", "Klockan har redan börjat gå"], ["The 72-hour clock runs from when you became aware, not from when misuse is proven. Waiting may already take you past it. Who is prepared to argue that you weren't “aware” yet?", "72-timmarsfristen löper från när ni fick kännedom, inte från när missbruk är bevisat. Att vänta kan redan ta er förbi den. Vem är beredd att hävda att ni inte hade ”kännedom” än?"]),
              pb(["Clarity may never come", "Klarhet kanske aldrig kommer"], ["Misuse of bank details can surface months later, one employee at a time. Waiting for clarity may mean waiting indefinitely. What, exactly, would count as clear?", "Missbruk av bankuppgifter kan dyka upp månader senare, en anställd i taget. Att vänta på klarhet kan betyda att vänta hur länge som helst. Vad, exakt, skulle räknas som klart?"]),
              pb(["HR won't sit on it", "HR tänker inte tiga"], ["HR says they will not sit on this: staff data was taken and staff have a right to know. They are ready to tell people themselves. Do you overrule HR, and on what grounds?", "HR säger att de inte tänker tiga om det här: personalens uppgifter har tagits och personalen har rätt att få veta. De är beredda att berätta själva. Kör ni över HR, och på vilka grunder?"])
            ]
          }
        }),
        facilitator: fac(
          ["The incident becomes about people. Bring HR in.", "Incidenten handlar nu om människor. Ta in HR."],
          ["Timely report and same-day employee notice with account checks.", "Anmälan i tid och information till de anställda samma dag med kontroll av konton."],
          [["Ask: how will an employee feel hearing this from a colleague first?", "Fråga: hur känns det för en anställd att höra det här från en kollega först?"]]
        )
      },
      {
        id: "p7",
        priority: 4,
        clock: 2880,
        title: L(["The fatigue review", "Granskningen av larmtröttheten"]),
        twist: L(["The account came from a credential broker, and the maintenance calendar was readable by every employee.", "Kontot kom från en mäklare av inloggningsuppgifter, och underhållskalendern kunde läsas av alla anställda."]),
        twistKind: "impact",
        reconsider: { decision: "d5", pressure: { en: "Finance ran month-end on your terms, and two salary-account changes went through during the close. Would you make the same call again?", sv: "Ekonomi körde månadsbokslutet på era villkor, och två ändringar av lönekonton gick igenom under bokslutet. Skulle ni fatta samma beslut igen?" } },
        assumptionChallenged: L(["Fixing one rule fixes the problem.", "Att rätta en regel löser problemet."]),
        narrative: L([
          "Two days later. The immediate incident is handled, and the SOC presents what made it possible.\n\nIt was not one mistake but several small, reasonable-looking decisions: a muted alert, a calendar anyone could read, a credential nobody knew was for sale. The room has a budget for fixes, and it will not cover everything.",
          "Två dagar senare. Den akuta incidenten är hanterad, och SOC redogör för vad som gjorde den möjlig.\n\nDet var inte ett misstag utan flera små beslut som såg rimliga ut: ett tystat larm, en kalender som alla kunde läsa, en inloggning som ingen visste var till salu. Rummet har en budget för åtgärder, och den räcker inte till allt."
        ]),
        injects: [
          inj("i7-1", 2880, "threatIntel", "threatIntel", "medium", "confirmed", [
            "The service-desk credential was sold on a broker forum two months ago. The intranet maintenance calendar, readable by any account, lists every window for the year.",
            "Kontot från servicedesken såldes på ett mäklarforum för två månader sedan. Underhållskalendern på intranätet, som kan läsas av alla konton, listar årets alla fönster."
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which detections would catch a stolen account working at odd hours?", "Vilka detektioner skulle fånga ett stulet konto som arbetar på udda tider?", ["socLead"]),
            q("Should the maintenance calendar be restricted?", "Bör underhållskalendern begränsas?", ["itOps", "socLead"]),
            q("Did your new suppression rules hold up in the next window?", "Höll era nya undertryckningsregler i nästa fönster?", ["socLead"], "d4")
          ],
          executive: [
            q("Does the SOC have the people to handle alerts without suppression?", "Har SOC personal nog att hantera larm utan undertryckning?", ["ciso", "cio"]),
            q("How do you measure alert fatigue going forward?", "Hur mäter ni larmtrötthet framöver?", ["ciso"]),
            q("Which decision from the first night would you most like to change?", "Vilket beslut från den första natten skulle ni helst vilja ändra?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The SOC has three analysts covering nights.", "SOC har tre analytiker som täcker nätterna.")],
        decision: dec("d7", "cio", ["What do you invest in?", "Vad investerar ni i?"], [
          ["Analyst capacity, alert tuning and phishing-resistant authentication for the service desk.", "Analytikerkapacitet, justering av larm och nätfiskeresistent inloggning för servicedesken."],
          ["Restrict the calendar and fix the rules.", "Begränsa kalendern och rätta reglerna."],
          ["An outsourced SOC.", "Ett utkontrakterat SOC."]
        ], {
          knowns: [["A stolen credential and a public calendar made this possible.", "Ett stulet konto och en öppen kalender gjorde det här möjligt."]],
          uncertainties: [["Whether an outsourced SOC would do better.", "Om ett utkontrakterat SOC skulle klara det bättre."]],
          tradeoffs: {
            operational: ["More analysts cost money every year.", "Fler analytiker kostar pengar varje år."],
            security: ["Fixing only the symptoms leaves the fatigue.", "Att bara rätta symtomen lämnar tröttheten kvar."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["Showing investment rebuilds staff trust.", "Att visa på investeringar bygger upp personalens förtroende igen."]
          },
          evaluation: [["Addresses capacity, not only configuration", "Tar itu med kapacitet, inte bara konfiguration"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Investing in people", "Investering i människor"], [
              io(["The board backs it", "Styrelsen står bakom"], ["The board approves the investment in full, and the night analysts hear it from the CIO in person.", "Styrelsen godkänner hela investeringen, och nattanalytikerna får höra det av it-chefen personligen."], ["The board approved the investment; the SOC team knows it.", "Styrelsen godkände investeringen; SOC-teamet vet om det."]),
              io(["Something else is cut", "Något annat stryks"], ["Finance says the money comes from next year's projects, and a planned upgrade is cut. Its owner is furious and wants the decision reopened.", "Ekonomi säger att pengarna tas från nästa års projekt, och en planerad uppgradering stryks. Dess ägare är rasande och vill att beslutet tas upp igen."], ["Funding the plan means cutting another planned project.", "Att finansiera planen innebär att ett annat planerat projekt stryks."], { reopen: true }),
              io(["A slow market", "En trög marknad"], ["The first job advert gets three applicants. The recruiter estimates six months before the new analysts are in place.", "Den första platsannonsen får tre sökande. Rekryteraren bedömer att det dröjer sex månader innan de nya analytikerna är på plats."], ["Hiring the new analysts is expected to take about six months.", "Rekryteringen av de nya analytikerna väntas ta ungefär sex månader."])
            ]),
            ir("i2", { notChosen: "A" }, ["No new capacity", "Ingen ny kapacitet"], [
              io(["Noted favourably", "Positivt noterat"], ["Your insurer notes the quick changes favourably at renewal. The CIO calls it proof that a big budget was not needed.", "Ert försäkringsbolag noterar de snabba ändringarna positivt vid förnyelsen. It-chefen kallar det ett bevis på att det inte behövdes någon stor budget."], ["The insurer noted your changes favourably at renewal.", "Försäkringsbolaget noterade era ändringar positivt vid förnyelsen."]),
              io(["An analyst resigns", "En analytiker säger upp sig"], ["One of the three night analysts resigns, saying nothing will change for the people doing the work.", "En av de tre nattanalytikerna säger upp sig och säger att inget kommer att förändras för dem som gör jobbet."], ["One of the three night analysts has resigned.", "En av de tre nattanalytikerna har sagt upp sig."], { reopen: true }),
              io(["Another listing", "En ny annons"], ["Threat intelligence spots another credential for sale that claims to come from your service desk. Nobody knows yet whether it is real.", "Hotunderrättelser hittar ännu ett konto till salu som påstås komma från er servicedesk. Ingen vet ännu om det är äkta."], ["Another credential claiming to be from your service desk is for sale.", "Ännu ett konto som påstås komma från er servicedesk är till salu."])
            ])
          ],
          pushback: {
            A: [
              pb(["Months to hire", "Månader att rekrytera"], ["Recruiting experienced analysts takes months, and the next maintenance window is next week. The capacity you are paying for will not exist when you need it. What covers the gap?", "Att rekrytera erfarna analytiker tar månader, och nästa underhållsfönster är nästa vecka. Kapaciteten ni betalar för finns inte när ni behöver den. Vad täcker glappet?"]),
              pb(["The service desk wants out", "Servicedesken vill slippa"], ["The service desk says phishing-resistant sign-in will slow them down and break the remote-support tool they use all day. Their manager asks for an exception. Do you grant it, for the team whose account was stolen?", "Servicedesken säger att nätfiskeresistent inloggning kommer att göra dem långsammare och slå ut verktyget för fjärrsupport som de använder hela dagarna. Deras chef ber om ett undantag. Beviljar ni det, för teamet vars konto stals?"]),
              pb(["The cheapest fix left out", "Den billigaste åtgärden utelämnad"], ["The budget is spent, and the maintenance calendar is still readable by every account. The cheapest fix on the list was left out. Why, and who explains that after the next incident?", "Budgeten är förbrukad, och underhållskalendern kan fortfarande läsas av alla konton. Den billigaste åtgärden på listan blev utelämnad. Varför, och vem förklarar det efter nästa incident?"])
            ],
            B: [
              pb(["Still three analysts", "Fortfarande tre analytiker"], ["The three night analysts are still three. With the rules fixed, they face more alerts with the same people. How long before someone quietly writes a new suppression rule to cope?", "De tre nattanalytikerna är fortfarande tre. Med reglerna rättade möter de fler larm med samma personal. Hur länge dröjer det innan någon i tysthet skriver en ny undertryckningsregel för att orka?"]),
              pb(["The next stolen account", "Nästa stulna konto"], ["The credential was bought from a broker. Restricting the calendar does not stop the next one being bought, and nothing here changes how accounts sign in. What stops a stolen account working at odd hours next time?", "Kontot köptes från en mäklare. Att begränsa kalendern hindrar inte att nästa konto köps, och inget här ändrar hur konton loggar in. Vad hindrar ett stulet konto från att arbeta på udda tider nästa gång?"]),
              pb(["Everyone needs the calendar", "Alla behöver kalendern"], ["Teams across the business plan their work around that calendar. Restricting it means a stream of “is there maintenance tonight?” calls to the service desk. Who gets access, and how long will the restriction last?", "Team i hela verksamheten planerar sitt arbete efter den kalendern. Att begränsa den innebär en ström av samtal till servicedesken: ”är det underhåll i natt?” Vem får tillgång, och hur länge kommer begränsningen att hålla?"])
            ],
            C: [
              pb(["Strangers to your systems", "Främlingar i era system"], ["An outsourced SOC would see the same maintenance alerts without knowing your systems, and would probably ask for the same suppression. What would they have done differently on that first night?", "Ett utkontrakterat SOC skulle se samma underhållslarm utan att känna era system, och skulle troligen be om samma undertryckning. Vad hade de gjort annorlunda den första natten?"]),
              pb(["Your own analysts", "Era egna analytiker"], ["The three night analysts hear about the plan before anyone tells them. Two start looking for other jobs. Who runs monitoring during the months of handover?", "De tre nattanalytikerna hör talas om planen innan någon har berättat det för dem. Två börjar söka andra jobb. Vem sköter bevakningen under de månader överlämningen tar?"]),
              pb(["Alerting is not investigating", "Att larma är inte att utreda"], ["The provider's standard contract covers alerting, not investigation. This case was caught by an analyst who looked closer at six per cent of one alert. Who does that from now on?", "Leverantörens standardavtal omfattar larmhantering, inte utredning. Det här fallet upptäcktes av en analytiker som tittade närmare på sex procent av ett enda larm. Vem gör det från och med nu?"])
            ]
          }
        }),
        facilitator: fac(
          ["Close on capacity and design. Alert fatigue is a resourcing decision.", "Avsluta med kapacitet och design. Larmtrötthet är ett resursbeslut."],
          ["Investment in capacity, tuning and stronger authentication.", "Investering i kapacitet, justering och starkare inloggning."],
          [["Ask: how many alerts can one analyst really handle per shift?", "Fråga: hur många larm kan en analytiker egentligen hantera per pass?"]]
        )
      }
    ],

    resolution: {
      type: "resolved",
      text: L([
        "The maintenance finishes, the second actor is removed, payroll exposure is reported and alert suppression becomes precise instead of broad.",
        "Underhållet slutförs, den andra aktören avlägsnas, exponeringen av löneuppgifter anmäls och undertryckningen av larm blir precis i stället för bred."
      ])
    },

    debrief: {
      keyLessons: [
        L(["A true benign explanation can hide a malicious one; check the remainder.", "En sann harmlös förklaring kan dölja en skadlig; kontrollera det som inte förklaras."]),
        L(["Independent telemetry separates legitimate and malicious activity.", "Oberoende telemetri skiljer legitim aktivitet från skadlig."]),
        L(["Blanket alert suppression is a blind spot attackers can find.", "Allmän undertryckning av larm är en blind fläck som angripare kan hitta."]),
        L(["Risk acceptance on critical systems must be explicit and owned.", "Riskacceptans för kritiska system måste vara uttalad och ägd."])
      ],
      assumptionsVsReality: [
        avr(["It's an attack.", "Det är ett angrepp."], ["It was maintenance — mostly.", "Det var underhåll – för det mesta."], "p2"),
        avr(["One explanation fits all.", "En förklaring passar allt."], ["A second actor hid in the window.", "En andra aktör gömde sig i fönstret."], "p3"),
        avr(["Monitoring would have caught it.", "Bevakningen skulle ha upptäckt det."], ["Alerts were suppressed by design.", "Larmen undertrycktes avsiktligt."], "p4")
      ],
      strengthsToLookFor: [
        L(["Checking the change host by host", "Att kontrollera ändringen dator för dator"]),
        L(["Precise containment that spared the maintenance", "Träffsäker begränsning som skonade underhållet"]),
        L(["Written risk acceptance for the close", "Skriftlig riskacceptans för bokslutet"])
      ],
      commonGaps: [
        L(["Closing the alert on habit", "Att stänga larmet av vana"]),
        L(["Isolating the whole business system", "Att isolera hela affärssystemet"]),
        L(["Treating suppression rules as permanent", "Att behandla undertryckningsregler som permanenta"])
      ],
      suggestedActions: [
        act(["Tie alert suppression to named hosts and accounts in each change.", "Koppla undertryckning av larm till namngivna datorer och konton i varje ändring."], "socLead", "high"),
        act(["Restrict who can read the maintenance calendar.", "Begränsa vilka som kan läsa underhållskalendern."], "itOps", "medium"),
        act(["Use phishing-resistant authentication for service-desk accounts.", "Använd nätfiskeresistent inloggning för konton på servicedesken."], "ciso", "high"),
        act(["Agree who can accept risk on critical systems out of hours.", "Kom överens om vem som kan acceptera risk för kritiska system utanför kontorstid."], "cio", "medium")
      ]
    }
  });
})();
