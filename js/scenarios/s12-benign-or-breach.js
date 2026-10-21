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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Triage an alert without dismissing it because a benign explanation exists", "Bedöma ett larm utan att avfärda det bara för att det finns en harmlös förklaring"]) },
      { id: "lo2", text: L(["Use independent telemetry to separate legitimate and malicious activity", "Använda oberoende telemetri för att skilja legitim aktivitet från skadlig"]) },
      { id: "lo3", text: L(["Decide on isolating a business-critical system", "Besluta om isolering av ett verksamhetskritiskt system"]) },
      { id: "lo4", text: L(["Recognise alert suppression and fatigue as a risk", "Se undertryckta larm och larmtrötthet som en risk"]) }
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
          "{{time.T+0|day}}, {{time.T+0|clock}}. The SOC analyst on duty sees a burst of lateral-movement detections on {{asset.erpServer}}, the server behind {{org.service.primary|lcfirst}}.",
          "{{time.T+0|day}}, klockan {{time.T+0|clock}}. SOC-analytikern i tjänst ser en rad detektioner av lateral rörelse på {{asset.erpServer}}, servern bakom {{org.service.primary|lcfirst}}."
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
          evaluation: [["Checks the benign explanation rather than accepting it", "Kontrollerar den harmlösa förklaringen i stället för att godta den"]]
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
        assumptionChallenged: L(["This is an attack.", "Det här är ett angrepp."]),
        narrative: L([
          "{{time.T+40|clock}}. The application team lead joins the call, a little annoyed.",
          "Klockan {{time.T+40|clock}}. Applikationsteamets ledare ansluter till samtalet, lite irriterad."
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
          evaluation: [["Keeps the anomaly open while accepting the maintenance", "Håller avvikelsen öppen samtidigt som underhållet godtas"]]
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
        assumptionChallenged: L(["All the activity has one explanation.", "All aktivitet har en och samma förklaring."]),
        reveals: ["hf-second"],
        narrative: L([
          "{{time.T+100|clock}}. The analyst pulls identity logs and network flows for {{asset.workstationIt}}.",
          "Klockan {{time.T+100|clock}}. Analytikern hämtar identitetsloggar och nätverksflöden för {{asset.workstationIt}}."
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
          minutes: 10
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
        assumptionChallenged: L(["Our monitoring would have caught this earlier.", "Vår bevakning hade upptäckt det här tidigare."]),
        reveals: ["hf-suppress"],
        narrative: L([
          "{{time.T+240|clock}}. The SOC lead looks at why tonight was the first alert.",
          "Klockan {{time.T+240|clock}}. SOC-ansvarig undersöker varför i natt var det första larmet."
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
          evaluation: [["Makes suppression precise rather than broad", "Gör undertryckningen precis i stället för bred"]]
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
          "{{time.T+330|clock}}. The CFO has been woken up and has a view.",
          "Klockan {{time.T+330|clock}}. Ekonomichefen har väckts och har en åsikt."
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
          ["Run it as normal.", "Kör det som vanligt."]
        ], {
          knowns: [["The actor's known access is contained.", "Aktörens kända åtkomst är begränsad."]],
          uncertainties: [["Whether they left anything behind.", "Om de har lämnat något efter sig."]],
          tradeoffs: {
            operational: ["Postponing misses payroll and the bank deadline.", "Ett uppskjutande missar lönerna och bankens tidsgräns."],
            security: ["Running as normal ignores possible payment fraud.", "Att köra som vanligt bortser från möjliga betalningsbedrägerier."],
            legal: ["Paying staff late has legal consequences.", "Att betala ut löner för sent får rättsliga följder."],
            reputational: ["Fraudulent payments would be far worse than a delay.", "Bedrägliga betalningar vore mycket värre än en försening."]
          },
          evaluation: [["Makes risk acceptance explicit and owned", "Gör riskacceptansen uttalad och ägd"]]
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
        assumptionChallenged: L(["The actor only got as far as the business system.", "Aktören kom bara så långt som till affärssystemet."]),
        reveals: ["hf-payroll"],
        narrative: L([
          "Midday. The SOC replays the account's history across all the suppressed windows.",
          "Mitt på dagen. SOC spelar upp kontots historik under alla undertryckta fönster."
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
          evaluation: [["Reports in time and informs employees promptly", "Anmäler i tid och informerar de anställda snabbt"]]
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
        assumptionChallenged: L(["Fixing one rule fixes the problem.", "Att rätta en regel löser problemet."]),
        narrative: L([
          "Two days later. The SOC presents what made this possible.",
          "Två dagar senare. SOC presenterar vad som gjorde det här möjligt."
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
          evaluation: [["Addresses capacity, not only configuration", "Tar itu med kapacitet, inte bara konfiguration"]]
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
