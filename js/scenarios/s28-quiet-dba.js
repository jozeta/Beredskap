/*
 * s28-quiet-dba.js — "Small Exports" (archetype B, insider data theft).
 *
 * Customers say a competitor knows their renewal dates and prices → database
 * audit logs show a trusted administrator exporting small slices weekly for
 * eight months → evidence and employment law limit what you may do, and the
 * administrator holds the keys → a payment trail links them to a contractor
 * working for the competitor, and the pricing engine's code went too → they
 * resign before you act → four others have the same unmonitored access.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s28-quiet-dba",
    version: 1,
    category: "insider-data-theft",
    archetype: "ambiguous-start",
    emblem: "quiet-dba",
    title: L(["Small Exports", "Små exporter"]),
    summary: L([
      "A competitor seems to know your customers' renewal dates. Nothing was hacked. Someone with every right to read the data has been reading it very carefully.",
      "En konkurrent verkar känna till era kunders förnyelsedatum. Inget har hackats. Någon med full rätt att läsa datan har läst den mycket noggrant."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Investigate a trusted insider without alerting them or breaking the law", "Utreda en betrodd insider utan att varna hen eller bryta mot lagen"]), teaser: L(["Looking closely at someone you trust", "Att granska någon man litar på"]) },
      { id: "lo2", text: L(["Preserve evidence that will stand up later", "Säkra bevis som håller senare"]), teaser: L(["What you will need afterwards", "Vad ni kommer att behöva efteråt"]) },
      { id: "lo3", text: L(["Remove privileged access cleanly at the right moment", "Ta bort privilegierad åtkomst rent i rätt ögonblick"]), teaser: L(["Choosing the moment", "Att välja ögonblicket"]) },
      { id: "lo4", text: L(["Find the control gap, not only the person", "Hitta luckan i kontrollerna, inte bara personen"]), teaser: L(["More than one door", "Fler än en dörr"]) }
    ],
    mitre: ["T1078", "T1213", "T1074", "T1567.002", "T1005"],
    frameworks: {
      nistCsf: ["PR.AA", "PR.DS", "DE.CM", "DE.AE", "RS.AN", "RS.MA", "GV.RR"],
      iso27001: ["A.5.15", "A.5.18", "A.5.28", "A.6.1", "A.6.4", "A.6.5", "A.8.2", "A.8.15", "A.8.16"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours" },
    actor: { types: ["insider"], motivation: L(["Financial: paid by a contractor working for a competitor", "Ekonomisk: betald av en konsult som arbetar för en konkurrent"]), capability: "medium" },
    variables: {
      rows: { min: 2000, max: 90000, scaleBy: "size", step: 100 },
      exports: { min: 20, max: 60 },
      lostAccounts: { min: 3, max: 30, scaleBy: "size" }
    },
    roles: ["incidentCommander", "ciso", "socLead", "itOps", "hr", "legal", "dpo", "ceo", "serviceOwner", "securityOfficer", "comms"],

    groundTruth: {
      rootCause: L([
        "A senior database administrator with eleven years at {{org.name}} was paid by a consultancy working for a competitor. For eight months they ran small weekly queries on the customer and contract tables, about {{num.rows|number}} rows in total, saved them to a staging folder and uploaded them to personal cloud storage. They also copied the pricing engine's source code. Database audit logging existed but nobody reviewed it, and four other administrators had the same unmonitored access.",
        "En senior databasadministratör med elva år på {{org.name}} fick betalt av en konsultfirma som arbetade för en konkurrent. I åtta månader körde hen små veckovisa frågor mot kund- och avtalstabellerna, totalt omkring {{num.rows|number}} rader, sparade dem i en mellanlagringsmapp och laddade upp dem till privat molnlagring. Hen kopierade också källkoden till prissättningsmotorn. Det fanns granskningsloggar för databasen men ingen gick igenom dem, och fyra andra administratörer hade samma obevakade åtkomst."
      ]),
      attackerTimeline: [
        { at: -345600, text: L(["First small export of the contract table.", "Första lilla exporten av avtalstabellen."]) },
        { at: -172800, text: L(["Pricing engine repository cloned to a personal device.", "Prissättningsmotorns kodförråd klonas till en privat enhet."]) },
        { at: -20160, text: L(["Competitor begins approaching customers before renewal.", "Konkurrenten börjar kontakta kunder inför förnyelse."]) },
        { at: 0, text: L(["Customer complaints reach account management.", "Kundklagomål når kundansvariga."]) },
        { at: 4320, text: L(["The administrator resigns with immediate effect.", "Administratören säger upp sig med omedelbar verkan."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-exports", revealStage: "p2", text: L(["Weekly queries under one administrator's own account, saved to a staging folder and then uploaded.", "Veckovisa frågor under en administratörs eget konto, sparade i en mellanlagringsmapp och sedan uppladdade."]) },
      { id: "hf-money", revealStage: "p4", text: L(["The administrator is paid monthly by a consultancy retained by the competitor.", "Administratören får månatlig betalning från en konsultfirma som anlitas av konkurrenten."]) },
      { id: "hf-peers", revealStage: "p6", text: L(["Four other administrators can query the same tables with no review of their activity.", "Fyra andra administratörer kan göra frågor mot samma tabeller utan att deras aktivitet granskas."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["A well-informed competitor", "En välinformerad konkurrent"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. {{person.serviceOwner.name}} has had three similar calls in two weeks. Each customer was approached by the same competitor a month before their contract renewal, with an offer just below their current price.\n\nOne customer is blunt about it: the competitor knew their renewal date, their volume and their discount. That information exists in one place, and it is your contract database.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. {{person.serviceOwner.name}} har fått tre liknande samtal på två veckor. Varje kund kontaktades av samma konkurrent en månad före sin avtalsförnyelse, med ett erbjudande strax under det nuvarande priset.\n\nEn kund säger det rakt ut: konkurrenten kände till deras förnyelsedatum, volym och rabatt. Den informationen finns på ett enda ställe, och det är er avtalsdatabas."
        ]),
        injects: [
          inj("i1-1", 0, "customerComplaint", "customer", "high", "confirmed", [
            "“They knew our renewal date to the day, our volumes and our discount. Either you told them or someone in your company did. Which is it?”",
            "”De visste vårt förnyelsedatum på dagen, våra volymer och vår rabatt. Antingen har ni berättat det för dem eller så har någon på ert företag gjort det. Vilket är det?”"
          ], { tests: ["lo1"] }),
          inj("i1-2", 30, "chat", "person.itOps", "medium", "misleading", [
            "“No alerts, no strange sign-ins, the firewall is clean. If data left, it wasn't through a hack. Maybe a salesperson took a list when they left?”",
            "”Inga larm, inga konstiga inloggningar, brandväggen är ren. Om data har läckt så var det inte genom ett intrång. Kanske tog en säljare med sig en lista när hen slutade?”"
          ], { facilitatorNote: ["Plausible and partly right: no hack. But the access may be current, not past.", "Rimligt och delvis rätt: inget intrång. Men åtkomsten kan vara pågående, inte avslutad."], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Who can read renewal dates, volumes and discounts today?", "Vem kan läsa förnyelsedatum, volymer och rabatter i dag?", ["itOps", "ciso"]),
            q("Do you log who queries the contract database, and does anyone read those logs?", "Loggar ni vem som gör frågor mot avtalsdatabasen, och läser någon de loggarna?", ["socLead", "itOps"]),
            q("How do you look without the people you are looking at noticing?", "Hur tittar ni utan att de ni tittar på märker det?", ["ciso"])
          ],
          executive: [
            q("Is three phone calls enough to open an investigation?", "Räcker tre telefonsamtal för att inleda en utredning?", ["incidentCommander", "ceo"]),
            q("Who is told, and who is deliberately not told?", "Vem får veta, och vem får medvetet inte veta?", ["incidentCommander", "legal"]),
            q("What do you say to the customer who asked “which is it”?", "Vad säger ni till kunden som frågade ”vilket är det”?", ["serviceOwner", "comms"])
          ]
        },
        challenges: [ch("The crisis team's usual technical lead is a database administrator.", "Krisledningens vanliga tekniska ansvarige är en databasadministratör.")],
        decision: dec("d1", "incidentCommander", ["How do you start?", "Hur börjar ni?"], [
          ["Open a confidential investigation with a small team: security, legal, HR. Pull database audit logs quietly.", "Inled en konfidentiell utredning med ett litet team: säkerhet, juridik, HR. Ta fram databasens granskningsloggar i tysthet."],
          ["Announce an internal review so everyone knows it is being taken seriously.", "Tillkännage en intern granskning så att alla vet att det tas på allvar."],
          ["Treat it as a commercial matter and let sales win the customers back.", "Behandla det som en kommersiell fråga och låt säljavdelningen vinna tillbaka kunderna."]
        ], {
          knowns: [["Contract details only held in one database reached a competitor.", "Avtalsuppgifter som bara finns i en databas har nått en konkurrent."]],
          uncertainties: [["Whether the access is still going on.", "Om åtkomsten fortfarande pågår."]],
          tradeoffs: {
            operational: ["A small team means some senior people are kept out.", "Ett litet team innebär att vissa seniora personer hålls utanför."],
            security: ["Announcing a review warns whoever is doing it.", "Att tillkännage en granskning varnar den som gör det."],
            legal: ["Employee investigations need a lawful, proportionate basis.", "Utredningar av anställda kräver en laglig och proportionerlig grund."],
            reputational: ["Customers are already asking whether you leak.", "Kunderna frågar redan om ni läcker."]
          },
          evaluation: [["Keeps the circle small and starts from the data's own logs", "Håller kretsen liten och utgår från datans egna loggar"]],
          pushback: {
            A: [
              pb(["Left out of the room", "Utanför rummet"], ["The crisis team's usual technical lead, a database administrator, asks why they were not invited to a meeting about the contract database. Leaving them out signals suspicion; letting them in may tell the wrong person. What do you say to them?", "Krisledningens vanliga tekniska ansvarige, en databasadministratör, frågar varför hen inte blev inbjuden till ett möte om avtalsdatabasen. Att hålla hen utanför signalerar misstanke; att släppa in hen kan informera fel person. Vad säger ni till hen?"]),
              pb(["Who pulls the logs?", "Vem tar fram loggarna?"], ["Pulling database audit logs needs someone with administrator rights on that database. The people who can do it quietly are the same people whose access you need to look at. Who runs the query, and how do you know it is not noticed?", "För att ta fram databasens granskningsloggar krävs någon med administratörsrättigheter i den databasen. De som kan göra det i tysthet är samma personer vars åtkomst ni behöver granska. Vem kör frågan, och hur vet ni att det inte märks?"]),
              pb(["The customer wants an answer", "Kunden vill ha ett svar"], ["The customer who asked “which is it” calls back: unless they hear what you are doing by the end of the week, they will start talking to the competitor. A confidential investigation means you can tell them almost nothing. What do you say?", "Kunden som frågade ”vilket är det” ringer tillbaka: om de inte får höra vad ni gör innan veckan är slut börjar de prata med konkurrenten. En konfidentiell utredning innebär att ni nästan inte kan säga något. Vad säger ni?"])
            ],
            B: [
              pb(["Sales feel accused", "Säljarna känner sig anklagade"], ["Within an hour of the announcement, two senior salespeople ask HR whether they are suspected, and one asks for a union representative. The review is meant to show seriousness. Do you narrow it, or let everyone feel under suspicion?", "Inom en timme efter tillkännagivandet frågar två seniora säljare HR om de är misstänkta, och en ber om ett fackligt ombud. Granskningen ska visa att ni tar det på allvar. Smalnar ni av den, eller låter ni alla känna sig misstänkta?"]),
              pb(["Nothing preserved yet", "Inget är säkrat än"], ["{{person.ciso.name}} points out that nobody has preserved a single log yet. Everyone with access to the contract database and its logs has just been told you are coming. Do you rush to secure evidence now, and who do you trust to do it?", "{{person.ciso.name}} påpekar att ingen har säkrat en enda logg ännu. Alla med åtkomst till avtalsdatabasen och dess loggar har just fått veta att ni kommer. Skyndar ni er att säkra bevis nu, och vem litar ni på att göra det?"]),
              pb(["The customer reads it", "Kunden läser det"], ["The announcement reaches the customer who complained. They reply: “So you admit someone inside leaked our data. Have you told the regulator?” You have made an internal suspicion public before knowing what it is. What is your answer?", "Tillkännagivandet når kunden som klagade. Hen svarar: ”Så ni erkänner att någon internt har läckt våra uppgifter. Har ni anmält det till tillsynsmyndigheten?” Ni har gjort en intern misstanke offentlig innan ni vet vad den gäller. Vad svarar ni?"])
            ],
            C: [
              pb(["The DPO objects", "Dataskyddsombudet invänder"], ["{{person.dpo.name}} points out that contract records hold named contacts, so this may be a personal data breach with a notification deadline. Calling it commercial does not stop that clock. Who decides it is not a breach, before anyone has looked?", "{{person.dpo.name}} påpekar att avtalsposterna innehåller namngivna kontaktpersoner, så det här kan vara en personuppgiftsincident med en anmälningsfrist. Att kalla det en kommersiell fråga stoppar inte den klockan. Vem bestämmer att det inte är en incident, innan någon har tittat?"]),
              pb(["A fourth call", "Ett fjärde samtal"], ["{{person.serviceOwner.name}} reports a fourth customer approached this week, with the exact renewal date again. The discounts sales are offering to win them back are already cutting margin. How many discounts do you give before you look for where the data comes from?", "{{person.serviceOwner.name}} rapporterar en fjärde kund som kontaktats den här veckan, med exakt förnyelsedatum igen. Rabatterna som säljarna erbjuder för att vinna tillbaka dem äter redan av marginalen. Hur många rabatter ger ni innan ni letar efter var datan kommer ifrån?"]),
              pb(["A discount is not an answer", "En rabatt är inget svar"], ["The customer who asked “which is it” turns down the improved offer. They want to know in writing whether their data is safe with you. Sales cannot answer that. What do you write?", "Kunden som frågade ”vilket är det” tackar nej till det förbättrade erbjudandet. Hen vill veta skriftligt om deras uppgifter är säkra hos er. Det kan säljarna inte svara på. Vad skriver ni?"])
            ]
          }
        }),
        facilitator: fac(
          ["Insider cases are lost early by talking too widely. Watch who wants to tell everyone.", "Insiderärenden förloras tidigt genom att man pratar för brett. Se vem som vill berätta för alla."],
          ["Need-to-know team, legal and HR from the start, logs before interviews.", "Ett team på behovsbasis, juridik och HR från början, loggar före intervjuer."],
          [["Ask: if the person doing this sat in this room, what would they learn today?", "Fråga: om personen som gör det här satt i det här rummet, vad skulle hen få veta i dag?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 1440,
        title: L(["Every Thursday", "Varje torsdag"]),
        twist: L(["The audit logs show one account: a senior database administrator's own, running small queries on the contract tables every Thursday evening for eight months. {{num.exports}} exports so far.", "Granskningsloggarna visar ett konto: en senior databasadministratörs eget, som kört små frågor mot avtalstabellerna varje torsdagskväll i åtta månader. {{num.exports}} exporter hittills."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the investigation was kept confidential, two more Thursday exports went out while you prepared.", sv: "Eftersom utredningen hölls konfidentiell gick ytterligare två torsdagsexporter ut medan ni förberedde er." } }
        ],
        assumptionChallenged: L(["A former salesperson took a list.", "En tidigare säljare tog med sig en lista."]),
        reveals: ["hf-exports"],
        narrative: L([
          "{{time.T+1440|weekday|cap}}. {{person.socLead.name}} has spent the night reading database audit logs that nobody had opened in two years. They were switched on for an audit and then forgotten.\n\nThe pattern is patient and very regular. The queries are small enough to look like routine maintenance, and they come from someone who has every right to run them.",
          "{{time.T+1440|weekday|cap}}. {{person.socLead.name}} har ägnat natten åt att läsa databasens granskningsloggar, som ingen hade öppnat på två år. De slogs på inför en revision och glömdes sedan bort.\n\nMönstret är tålmodigt och mycket regelbundet. Frågorna är tillräckligt små för att se ut som rutinunderhåll, och de kommer från någon som har full rätt att köra dem."
        ]),
        injects: [
          inj("i2-1", 1440, "logExcerpt", "person.socLead", "high", "confirmed", [
            "Contract DB audit: account {{asset.adminAccount}}. Thursdays 21:00–21:20. SELECT on customers, contracts, discounts; 200–600 rows each. Output written to D:\\staging\\tmp. {{num.exports}} occurrences since February.",
            "Granskningslogg för avtalsdatabasen: konto {{asset.adminAccount}}. Torsdagar 21.00–21.20. SELECT mot kunder, avtal, rabatter; 200–600 rader per gång. Utdata skrivs till D:\\staging\\tmp. {{num.exports}} tillfällen sedan februari."
          ], { reveals: ["hf-exports"], tests: ["lo1"] }),
          inj("i2-2", 1500, "networkEvidence", "soc", "high", "confirmed", [
            "Proxy: uploads from {{asset.dbServer}} to a personal cloud storage service on Thursday nights, 1–4 MB each. The server has no business reason to reach that service.",
            "Proxy: uppladdningar från {{asset.dbServer}} till en privat molnlagringstjänst på torsdagsnätter, 1–4 MB per gång. Servern har inget verksamhetsskäl att nå den tjänsten."
          ], { tests: ["lo1"] })
        ],
        charts: [{
          id: "c2-rows", type: "line",
          title: L(["Rows exported per week", "Exporterade rader per vecka"]), unit: L(["rows", "rader"]),
          caption: L(["Weeks before the first complaint.", "Veckor före det första klagomålet."]),
          data: line(["Rows", "Rader"], -36, 0, 2, (x, ctx) => (x < -34 ? 0 : Math.round(ctx.vars.rows / 18) + ((x * 37) % 120)), "weeks")
        }],
        questions: {
          technical: [
            q("How do you preserve the logs so they stand up later, without the administrator seeing?", "Hur säkrar ni loggarna så att de håller senare, utan att administratören ser det?", ["socLead", "itOps"]),
            q("What else could this account reach, and what might it have changed?", "Vad mer kunde det här kontot nå, och vad kan det ha ändrat?", ["ciso", "itOps"]),
            q("Was keeping the circle small the right call, given who it turned out to be?", "Var det rätt att hålla kretsen liten, med tanke på vem det visade sig vara?", ["incidentCommander"], "d1")
          ],
          executive: [
            q("Do you confront them now, or watch?", "Konfronterar ni hen nu, eller bevakar ni?", ["hr", "legal"]),
            q("Is this a personal data breach, and when did the clock start?", "Är det här en personuppgiftsincident, och när började klockan gå?", ["dpo", "legal"]),
            q("If you had announced a review yesterday, what would have happened to these logs?", "Om ni hade tillkännagett en granskning i går, vad hade hänt med de här loggarna?", ["ciso"], "d1")
          ]
        },
        challenges: [ch("The administrator is on call tonight and has full access to the logging system.", "Administratören har beredskap i natt och full åtkomst till loggsystemet.")],
        decision: dec("d2", "legal", ["What do you do with what you know?", "Vad gör ni med det ni vet?"], [
          ["Preserve evidence first, involve the police, then remove access in one coordinated step.", "Säkra bevisen först, ta in polisen, och ta sedan bort åtkomsten i ett samordnat steg."],
          ["Confront the administrator today and ask for an explanation.", "Konfrontera administratören i dag och be om en förklaring."],
          ["Keep watching for a few weeks to see who receives the data.", "Fortsätt bevaka i några veckor för att se vem som tar emot datan."]
        ], {
          knowns: [["One administrator has exported contract data weekly for months.", "En administratör har exporterat avtalsdata varje vecka i månader."]],
          uncertainties: [["Who receives it, and what else they took.", "Vem som tar emot den, och vad mer hen har tagit."]],
          tradeoffs: {
            operational: ["The administrator runs systems you depend on tonight.", "Administratören driver system ni är beroende av i natt."],
            security: ["Watching longer means more data leaves.", "Att bevaka längre innebär att mer data försvinner."],
            legal: ["Evidence gathered carelessly may be unusable.", "Bevis som samlats in slarvigt kan bli oanvändbara."],
            reputational: ["Every week of watching is another week of customers approached.", "Varje vecka av bevakning är ytterligare en vecka då kunder kontaktas."]
          },
          evaluation: [["Secures evidence and plans the access removal before anyone is confronted", "Säkrar bevisen och planerar borttagandet av åtkomst innan någon konfronteras"]],
          pushback: {
            A: [
              pb(["Another Thursday", "Ännu en torsdag"], ["Preserving the evidence properly and getting the police involved will take days. The next Thursday export is due before you are ready. Do you let one more export leave to protect the case, or act early and risk it?", "Att säkra bevisen ordentligt och få in polisen tar flera dagar. Nästa torsdagsexport kommer innan ni är klara. Låter ni ytterligare en export gå ut för att skydda ärendet, eller agerar ni tidigare och riskerar det?"]),
              pb(["On call tonight", "Beredskap i natt"], ["The administrator is on call tonight with full access to the logging system you are trying to preserve. Changing the rota at short notice could tip them off. Do you let them work the shift, or pull them and explain why?", "Administratören har beredskap i natt med full åtkomst till loggsystemet som ni försöker säkra. Att ändra schemat med kort varsel kan varna hen. Låter ni hen ta passet, eller tar ni bort hen och förklarar varför?"]),
              pb(["The police set the pace", "Polisen styr tempot"], ["The police take the report but say it will be assigned to an investigator “within the coming weeks”. Your plan puts removing access after their involvement. Who decides when access goes: you, or a queue at the police?", "Polisen tar emot anmälan men säger att den kommer att tilldelas en utredare ”inom de närmaste veckorna”. Er plan lägger borttagandet av åtkomst efter polisens inblandning. Vem bestämmer när åtkomsten tas bort: ni, eller en kö hos polisen?"])
            ],
            B: [
              pb(["The hour after", "Timmen efter"], ["The meeting ends and the administrator walks back to their desk with every right they had this morning. You have told them what you know, and nothing has been locked down. What can they do in the next hour, and who is watching?", "Mötet tar slut och administratören går tillbaka till sin plats med alla rättigheter hen hade i morse. Ni har berättat vad ni vet, och inget har låsts. Vad kan hen göra under den närmaste timmen, och vem bevakar?"]),
              pb(["“Routine maintenance”", "”Rutinunderhåll”"], ["{{person.hr.name}} warns that the administrator can bring a union representative and simply say the queries were routine maintenance. Without preserved evidence, that is hard to contradict. What do you do if that is the whole explanation?", "{{person.hr.name}} varnar för att administratören kan ta med ett fackligt ombud och helt enkelt säga att frågorna var rutinunderhåll. Utan säkrade bevis är det svårt att motbevisa. Vad gör ni om det är hela förklaringen?"]),
              pb(["The logs are still live", "Loggarna är fortfarande levande"], ["{{person.socLead.name}} has read the audit logs but not yet made a preserved copy. Confronting the administrator today tells them exactly which records matter. Do you still hold the meeting today, or delay it until the copy exists?", "{{person.socLead.name}} har läst granskningsloggarna men ännu inte gjort en säkrad kopia. Att konfrontera administratören i dag talar om för hen exakt vilka poster som spelar roll. Håller ni ändå mötet i dag, eller skjuter ni upp det tills kopian finns?"])
            ],
            C: [
              pb(["How many customers?", "Hur många kunder?"], ["Another customer was approached this week. {{person.serviceOwner.name}} asks how many more you are willing to lose to see who receives the data. Can you give that a number?", "Ännu en kund har kontaktats den här veckan. {{person.serviceOwner.name}} frågar hur många fler ni är beredda att förlora för att se vem som tar emot datan. Kan ni sätta en siffra på det?"]),
              pb(["Proportionate watching", "Proportionerlig bevakning"], ["{{person.legal.name}} warns that weeks of monitoring a named employee needs a documented, proportionate basis, and nobody has written one. Evidence gathered without it may be unusable. Who signs off on the watching, and on what grounds?", "{{person.legal.name}} varnar för att flera veckors övervakning av en namngiven anställd kräver en dokumenterad och proportionerlig grund, och ingen har skrivit någon. Bevis som samlas in utan den kan bli oanvändbara. Vem godkänner bevakningen, och på vilka grunder?"]),
              pb(["Knowingly letting it go", "Att medvetet släppa iväg det"], ["{{person.dpo.name}} points out that every export you watch is personal data you knowingly allowed to leave. The regulator will ask why you did not stop it once you knew. How will you answer?", "{{person.dpo.name}} påpekar att varje export ni bevakar är personuppgifter som ni medvetet lät lämna företaget. Tillsynsmyndigheten kommer att fråga varför ni inte stoppade det när ni visste. Hur svarar ni?"])
            ]
          }
        }),
        facilitator: fac(
          ["The trusted insider is the twist. Evidence and timing matter more than speed now.", "Den betrodda insidern är vändningen. Bevis och tajming betyder nu mer än fart."],
          ["Preserve, involve police, plan a single coordinated removal of access.", "Säkra, ta in polisen, planera ett enda samordnat borttagande av åtkomsten."],
          [["Ask: what can this person do in the ten minutes after they learn you know?", "Fråga: vad kan den här personen göra under tio minuter efter att hen fått veta att ni vet?"]]
        )
      },
      {
        id: "p3",
        clock: 2880,
        priority: 1,
        title: L(["The keys they hold", "Nycklarna hen har"]),
        twist: L(["Removing the administrator's access is not one switch: they hold the break-glass account, the backup encryption keys and the only working copy of the database runbooks.", "Att ta bort administratörens åtkomst är inte en enda knapp: hen har nödkontot, krypteringsnycklarna till säkerhetskopiorna och den enda fungerande kopian av databasens driftrutiner."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "The leak runs every Thursday from a senior administrator's own account. If you announced a review, they knew to stop. If you investigated quietly, colleagues will ask why they were not told.", sv: "Läckan sker varje torsdag från en senior administratörs eget konto. Om ni tillkännagav en granskning visste hen att sluta. Om ni utredde i tysthet kommer kollegorna att fråga varför de inte fick veta." } },
        assumptionChallenged: L(["We can just disable their account.", "Vi kan bara stänga av hens konto."]),
        narrative: L([
          "{{time.T+2880|weekday|cap}}. {{person.itOps.name}} has been asked, without being told why, to list everything that would stop working if one particular administrator disappeared tomorrow.\n\nThe list takes all afternoon. It covers far more than a single user account, and several items have only ever been known to that one person.",
          "{{time.T+2880|weekday|cap}}. {{person.itOps.name}} har ombetts, utan att få veta varför, att lista allt som skulle sluta fungera om en viss administratör försvann i morgon.\n\nListan tar hela eftermiddagen. Den omfattar betydligt mer än ett enskilt användarkonto, och flera punkter har bara någonsin varit kända av just den personen."
        ]),
        injects: [
          inj("i3-1", 2880, "impactReport", "person.itOps", "high", "confirmed", [
            "Held only by this administrator: break-glass database account, backup encryption key passphrase, replication credentials, and the up-to-date failover runbook (on a personal drive).",
            "Bara den här administratören har: nödkontot till databasen, lösenfrasen till säkerhetskopiornas krypteringsnyckel, replikeringsinloggningen och den aktuella rutinen för reservdrift (på en personlig enhet)."
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("In what order do you rotate keys so nothing breaks and nothing is left open?", "I vilken ordning byter ni nycklar så att inget går sönder och inget lämnas öppet?", ["itOps", "ciso"]),
            q("Can you recover the backup key without the administrator?", "Kan ni återskapa säkerhetskopieringsnyckeln utan administratören?", ["itOps"]),
            q("Does the plan to preserve evidence first still hold with these dependencies?", "Håller planen att säkra bevisen först fortfarande med de här beroendena?", ["ciso"], "d2")
          ],
          executive: [
            q("What is the risk if they sabotage on the way out?", "Vad är risken om hen saboterar på vägen ut?", ["ceo", "ciso"]),
            q("Who does the removal, and who is in the room when it happens?", "Vem gör borttagandet, och vem är i rummet när det sker?", ["hr", "securityOfficer"]),
            q("Did involving the police change your timing?", "Ändrade det tidpunkten att ni tog in polisen?", ["legal"], "d2")
          ]
        },
        challenges: [ch("The administrator has booked a week of leave starting Monday.", "Administratören har bokat en veckas semester från och med måndag.")],
        decision: dec("d3", "ciso", ["How do you remove access?", "Hur tar ni bort åtkomsten?"], [
          ["Prepare every key change in advance, then remove all access in one window while HR holds the meeting.", "Förbered varje nyckelbyte i förväg och ta sedan bort all åtkomst i ett enda fönster medan HR håller mötet."],
          ["Disable the user account now and deal with the keys afterwards.", "Stäng av användarkontot nu och ta hand om nycklarna efteråt."],
          ["Wait until the leave starts and do it while they are away.", "Vänta tills semestern börjar och gör det medan hen är borta."]
        ], {
          knowns: [["The administrator alone holds several critical secrets.", "Administratören ensam har flera kritiska hemligheter."]],
          uncertainties: [["Whether they have planted anything to protect themselves.", "Om hen har placerat ut något för att skydda sig själv."]],
          tradeoffs: {
            operational: ["Rotating backup keys can break restores if done wrong.", "Att byta säkerhetskopieringsnycklar kan förstöra återställningar om det görs fel."],
            security: ["A half removal leaves exactly the access an angry insider would use.", "Ett halvt borttagande lämnar just den åtkomst en arg insider skulle använda."],
            legal: ["The meeting must follow employment law and the union agreement.", "Mötet måste följa arbetsrätten och kollektivavtalet."],
            reputational: ["A botched removal becomes a second incident.", "Ett misslyckat borttagande blir en andra incident."]
          },
          evaluation: [["Removes every kind of access at once, prepared in advance", "Tar bort alla slags åtkomst på en gång, förberett i förväg"]],
          pushback: {
            A: [
              pb(["Every helper is a risk", "Varje medhjälpare är en risk"], ["Preparing new break-glass, backup and replication credentials needs several engineers, and each will wonder why. One of them sits next to the administrator. How many people do you tell, and what?", "För att förbereda nya inloggningar för nödkontot, säkerhetskopiorna och replikeringen behövs flera tekniker, och var och en kommer att undra varför. En av dem sitter bredvid administratören. Hur många berättar ni för, och vad?"]),
              pb(["Untested restores", "Otestade återställningar"], ["{{person.itOps.name}} warns that the backup key cannot be rotated and tested without the passphrase holder noticing. If the window goes wrong, you may lose the ability to restore older backups. Do you accept that risk to keep the operation secret?", "{{person.itOps.name}} varnar för att säkerhetskopieringsnyckeln inte kan bytas och testas utan att den som har lösenfrasen märker det. Om fönstret går fel kan ni förlora möjligheten att återställa äldre säkerhetskopior. Accepterar ni den risken för att hålla operationen hemlig?"]),
              pb(["Before Monday", "Före måndag"], ["The leave starts Monday. {{person.hr.name}} says a proper meeting needs notice to the union, so the earliest window is the last working day. Do you rush the preparation to fit, or let the leave start with nothing done?", "Semestern börjar på måndag. {{person.hr.name}} säger att ett korrekt möte kräver att facket underrättas i förväg, så det tidigaste fönstret är sista arbetsdagen. Forcerar ni förberedelserna för att hinna, eller låter ni semestern börja utan att något är gjort?"])
            ],
            B: [
              pb(["The phone call", "Telefonsamtalet"], ["Minutes after the account is disabled, the administrator calls the service desk asking why they cannot log in. They still know the break-glass and replication credentials. What does the service desk say, and what do you do in the next ten minutes?", "Några minuter efter att kontot stängts av ringer administratören servicedesken och frågar varför hen inte kan logga in. Hen kan fortfarande inloggningarna till nödkontot och replikeringen. Vad säger servicedesken, och vad gör ni under de närmaste tio minuterna?"]),
              pb(["No runbook tonight", "Ingen driftrutin i natt"], ["The only current failover runbook is on the administrator's personal drive, and they were your on-call cover tonight. If the database fails, nobody has the procedure. Who covers the night, and with what?", "Den enda aktuella rutinen för reservdrift ligger på administratörens personliga enhet, och hen hade beredskap i natt. Om databasen fallerar har ingen rutinen. Vem tar natten, och med vad?"]),
              pb(["A suspension without a meeting", "En avstängning utan möte"], ["{{person.hr.name}} says disabling someone's access without a meeting is a suspension in practice, and the union will ask on what grounds. You cannot mention the police without risking the case. What do you tell them?", "{{person.hr.name}} säger att stänga av någons åtkomst utan ett möte i praktiken är en avstängning, och facket kommer att fråga på vilka grunder. Ni kan inte nämna polisen utan att riskera ärendet. Vad säger ni till dem?"])
            ],
            C: [
              pb(["One more Thursday", "En torsdag till"], ["There is a Thursday before the leave starts. Waiting means accepting at least one more export of contract data, knowingly. Is the cleaner timing worth that, and how do you explain it to the regulator later?", "Det hinner bli en torsdag innan semestern börjar. Att vänta innebär att medvetet acceptera minst en export till av avtalsdata. Är den smidigare tidpunkten värd det, och hur förklarar ni det för tillsynsmyndigheten senare?"]),
              pb(["Paged on holiday", "Uppringd på semestern"], ["Administrators on leave still get called when something breaks, and this one is the only person who knows several systems. The first time operations calls, they will notice access is gone. What is your plan when that call happens?", "Administratörer på semester blir ändå uppringda när något går sönder, och den här är den enda som kan flera av systemen. Första gången driften ringer kommer hen att märka att åtkomsten är borta. Vad är er plan när det samtalet kommer?"]),
              pb(["Not told, not heard", "Inte informerad, inte hörd"], ["{{person.legal.name}} warns that removing access while the employee is away and cannot respond may breach the union agreement's procedure. Do you inform them by phone during their leave, or risk the removal being challenged?", "{{person.legal.name}} varnar för att ta bort åtkomst medan den anställde är borta och inte kan svara kan bryta mot kollektivavtalets ordning. Informerar ni hen per telefon under semestern, eller riskerar ni att borttagandet ifrågasätts?"])
            ]
          }
        }),
        facilitator: fac(
          ["Single points of knowledge make insiders dangerous. The removal is an operation, not a click.", "Kunskap som bara finns hos en person gör insiders farliga. Borttagandet är en operation, inte ett klick."],
          ["A prepared, simultaneous removal of all access, timed with the HR meeting.", "Ett förberett, samtidigt borttagande av all åtkomst, samordnat med HR-mötet."],
          [["Ask: who else here holds a secret only they know?", "Fråga: vem mer här har en hemlighet som bara hen känner till?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 4320,
        title: L(["Resigned this morning", "Sa upp sig i morse"]),
        twist: L(["Before you act, the administrator resigns with immediate effect. The police have meanwhile traced monthly payments to them from a consultancy retained by the competitor, and the pricing engine's source code was copied too.", "Innan ni hinner agera säger administratören upp sig med omedelbar verkan. Polisen har under tiden spårat månatliga betalningar till hen från en konsultfirma som anlitas av konkurrenten, och källkoden till prissättningsmotorn kopierades också."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "The administrator resigned this morning, before you acted. Was your plan the right one, or only the slowest?", sv: "Administratören sa upp sig i morse, innan ni agerade. Var er plan den rätta, eller bara den långsammaste?" } },
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because the police were brought in first, you were asked not to change any access yet, and the administrator's next shift starts tonight.", sv: "Eftersom polisen kopplades in först ombads ni att inte ändra någon åtkomst ännu, och administratörens nästa pass börjar i kväll." } }
        ],
        assumptionChallenged: L(["It is about a customer list.", "Det handlar om en kundlista."]),
        reveals: ["hf-money"],
        narrative: L([
          "{{time.T+4320|weekday|cap}}, {{time.T+4320|clock}}. The resignation arrives by email at eight, short and polite. The administrator's badge was used to leave the building at 07:40, and their laptop is on their desk, wiped.\n\nAt ten, the police investigator calls {{person.legal.name}}. The bank records they requested have come back, and the version-control logs say something about another kind of data.",
          "{{time.T+4320|weekday|cap}}, klockan {{time.T+4320|clock}}. Uppsägningen kommer via mejl klockan åtta, kort och artig. Administratörens passerkort användes för att lämna byggnaden 07.40, och datorn ligger på skrivbordet, raderad.\n\nKlockan tio ringer polisens utredare till {{person.legal.name}}. Bankuppgifterna de begärt har kommit, och versionshanteringens loggar säger något om en annan sorts data."
        ]),
        injects: [
          inj("i4-1", 4320, "email", "employee", "medium", "confirmed", [
            "“I hereby resign with immediate effect for personal reasons. My laptop is on my desk. I wish everyone well.”",
            "”Jag säger härmed upp mig med omedelbar verkan av personliga skäl. Min dator ligger på skrivbordet. Jag önskar alla lycka till.”"
          ], { headline: ["Resignation", "Uppsägning"], tests: ["lo3"] }),
          inj("i4-2", 4380, "phoneTranscript", "police", "high", "confirmed", [
            "The investigator: “Monthly payments for nine months from a consultancy that works for your competitor. And your code repository shows a full clone of the pricing engine in the spring, to a device we haven't seen.”",
            "Utredaren: ”Månatliga betalningar i nio månader från en konsultfirma som arbetar för er konkurrent. Och ert kodförråd visar en fullständig kloning av prissättningsmotorn i våras, till en enhet vi inte har sett.”"
          ], { reveals: ["hf-money"], tests: ["lo2"] }),
          inj("i4-3", 4440, "chat", "person.itOps", "high", "unverified", [
            "“The break-glass account was used at 06:55 this morning. We don't know for what yet.”",
            "”Nödkontot användes 06.55 i morse. Vi vet inte till vad ännu.”"
          ], { optional: true, difficulties: ["advanced", "executive"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["What left", "Vad som försvann"]),
          data: kpi([
            { id: "rows", label: ["Contract rows exported", "Exporterade avtalsrader"], value: (v) => v.rows, tone: "danger" },
            { id: "exp", label: ["Weekly exports", "Veckovisa exporter"], value: (v) => v.exports, tone: "warn" },
            { id: "lost", label: ["Customers approached by the competitor", "Kunder som kontaktats av konkurrenten"], value: (v) => v.lostAccounts, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("What do you rotate in the next hour, now that the planned window is gone?", "Vad byter ni under den närmaste timmen, nu när det planerade fönstret är borta?", ["itOps", "ciso"]),
            q("What did the break-glass account do this morning?", "Vad gjorde nödkontot i morse?", ["socLead"]),
            q("Did preparing the key changes in advance pay off today?", "Lönade det sig i dag att förbereda nyckelbytena i förväg?", ["itOps"], "d3")
          ],
          executive: [
            q("Is the source code a bigger loss than the customer data?", "Är källkoden en större förlust än kunddatan?", ["ceo", "serviceOwner"]),
            q("Do you pursue the competitor, and who decides?", "Går ni vidare mot konkurrenten, och vem bestämmer?", ["legal", "ceo"]),
            q("Would confronting the administrator on day two have changed anything?", "Hade det ändrat något att konfrontera administratören dag två?", ["hr"], "d2")
          ]
        },
        challenges: [ch("Two engineers ask whether they are suspected too.", "Två tekniker frågar om de också är misstänkta.")],
        decision: dec("d4", "ceo", ["What now?", "Vad gör ni nu?"], [
          ["Rotate everything immediately, notify the regulator and affected customers, and support the police case.", "Byt allt omedelbart, anmäl till tillsynsmyndigheten och berätta för berörda kunder, och stöd polisens utredning."],
          ["Rotate everything and keep it quiet while the police work.", "Byt allt och håll det tyst medan polisen arbetar."],
          ["Take the competitor to court now, publicly, before the customers they won settle in.", "Stäm konkurrenten nu, offentligt, innan kunderna de vann hinner rota sig."]
        ], {
          knowns: [["Paid insider, months of exports, source code taken.", "En betald insider, månader av exporter, källkod tagen."]],
          uncertainties: [["Whether anything was changed or planted on the way out.", "Om något ändrades eller placerades ut på vägen ut."]],
          tradeoffs: {
            operational: ["Full rotation will disrupt services for a day.", "Ett fullständigt byte stör tjänsterna i ett dygn."],
            security: ["Any credential not rotated is still theirs.", "Varje inloggning som inte byts är fortfarande hens."],
            legal: ["Notification duties run regardless of the police case.", "Anmälningsskyldigheten gäller oavsett polisutredningen."],
            reputational: ["Customers approached by the competitor deserve to know why.", "Kunder som kontaktats av konkurrenten förtjänar att få veta varför."]
          },
          evaluation: [["Closes every door and meets disclosure duties while preserving the case", "Stänger varje dörr och uppfyller informationsplikten samtidigt som ärendet bevaras"]],
          pushback: {
            A: [
              pb(["Down on the same day", "Nere samma dag"], ["Full rotation will disrupt services for about a day. The customers you are notifying will read your letter while your systems are down. Do you rotate everything at once, or stagger it and leave some doors open longer?", "Ett fullständigt byte stör tjänsterna i ungefär ett dygn. Kunderna ni informerar kommer att läsa ert brev medan era system ligger nere. Byter ni allt på en gång, eller sprider ni ut det och lämnar vissa dörrar öppna längre?"]),
              pb(["The police ask you to wait", "Polisen ber er vänta"], ["The investigator asks you to hold customer notifications for a week so the consultancy is not warned. Your notification duties do not pause for the police. Whose request wins, and who tells the other?", "Utredaren ber er vänta en vecka med att informera kunderna så att konsultfirman inte varnas. Er anmälningsskyldighet pausas inte för polisen. Vems begäran vinner, och vem säger det till den andra?"]),
              pb(["Naming the competitor", "Att namnge konkurrenten"], ["Customers will ask the obvious question: does the competitor now have our data? Saying yes, while the police case is open, could be defamation if it does not hold; saying less looks evasive. How much do you put in writing?", "Kunderna kommer att ställa den självklara frågan: har konkurrenten nu våra uppgifter? Att säga ja, medan polisutredningen pågår, kan bli förtal om det inte håller; att säga mindre ser undanglidande ut. Hur mycket skriver ni?"])
            ],
            B: [
              pb(["The DPO will not sign", "Dataskyddsombudet skriver inte under"], ["{{person.dpo.name}} says plainly that the contact details in the exported rows are personal data, and the notification deadline has nothing to do with the police case. Keeping quiet is a decision the DPO will not sign. Who overrules them?", "{{person.dpo.name}} säger rakt ut att kontaktuppgifterna i de exporterade raderna är personuppgifter, och anmälningsfristen har ingenting med polisutredningen att göra. Att hålla tyst är ett beslut som dataskyddsombudet inte skriver under. Vem kör över hen?"]),
              pb(["The customer goes first", "Kunden hinner före"], ["One of the approached customers says they will report the leak to the regulator themselves if they hear nothing this week. If the regulator learns of it from a customer, what does your silence look like?", "En av de kontaktade kunderna säger att hen själv anmäler läckan till tillsynsmyndigheten om hen inte hör något den här veckan. Om myndigheten får veta det från en kund, hur ser er tystnad ut då?"]),
              pb(["The team works it out", "Teamet räknar ut det"], ["The engineers rotating every credential overnight can see whose access is being removed. Two of them have already asked whether they are suspected. What do you tell the staff doing the work, and how long will “quiet” last?", "Teknikerna som byter varje inloggning under natten kan se vems åtkomst som tas bort. Två av dem har redan frågat om de är misstänkta. Vad säger ni till personalen som gör jobbet, och hur länge håller ”tyst”?"])
            ],
            C: [
              pb(["Showing your hand", "Att visa korten"], ["{{person.legal.name}} warns that the evidence so far links the administrator to a consultancy, not directly to the competitor. A public lawsuit now tells the consultancy everything the police know. Do you risk the criminal case for a faster civil one?", "{{person.legal.name}} varnar för att bevisen hittills kopplar administratören till en konsultfirma, inte direkt till konkurrenten. En offentlig stämning nu berättar för konsultfirman allt polisen vet. Riskerar ni brottsutredningen för en snabbare tvistemålsprocess?"]),
              pb(["Customers read it in the news", "Kunderna läser det i nyheterna"], ["A public lawsuit means the customers whose data was taken will learn about it from the press before they hear from you. Several of them are deciding on renewals this month. Who calls them first?", "En offentlig stämning innebär att kunderna vars uppgifter togs får veta det från pressen innan de hör något från er. Flera av dem ska besluta om förnyelse den här månaden. Vem ringer dem först?"]),
              pb(["Lawyers before locks", "Jurister före lås"], ["The lawsuit says nothing about the administrator's credentials, and the engineers who should be rotating them are writing statements for the lawyers. Which comes first today, and who decides?", "Stämningen säger ingenting om administratörens inloggningar, och teknikerna som borde byta dem skriver nu redogörelser åt juristerna. Vad kommer först i dag, och vem bestämmer?"])
            ]
          }
        }),
        facilitator: fac(
          ["The insider moved first. The team's preparation decides how bad today is.", "Insidern hann före. Teamets förberedelser avgör hur illa dagen blir."],
          ["Immediate full rotation, regulator and customer notification, cooperation with police.", "Omedelbart fullständigt byte, anmälan till tillsynsmyndighet och kunder, samarbete med polisen."],
          [["Ask: which credential would you use, if you were them, tonight?", "Fråga: vilken inloggning skulle ni använda i natt, om ni var hen?"]]
        )
      },
      {
        id: "p5",
        clock: 5760,
        priority: 2,
        title: L(["Two engineers", "Två tekniker"]),
        twist: L(["The break-glass account was used to delete a month of database audit logs at 06:55. The only remaining copy is the one the SOC preserved on day two.", "Nödkontot användes 06.55 för att radera en månad av databasens granskningsloggar. Den enda kopia som finns kvar är den som SOC säkrade dag två."]),
        twistKind: "impact",
        assumptionChallenged: L(["The logs will be there when we need them.", "Loggarna finns kvar när vi behöver dem."]),
        narrative: L([
          "{{time.T+5760|weekday|cap}}. The rotation is done and services are stable. {{person.socLead.name}} has finally traced what the break-glass account did on the administrator's last morning.\n\nThe answer explains why someone with eleven years of access would choose that account, at that hour, as their final act before walking out of the building.",
          "{{time.T+5760|weekday|cap}}. Bytet är klart och tjänsterna är stabila. {{person.socLead.name}} har till slut spårat vad nödkontot gjorde under administratörens sista morgon.\n\nSvaret förklarar varför någon med elva års åtkomst valde just det kontot, vid den tiden, som sin sista handling innan hen lämnade byggnaden."
        ]),
        injects: [
          inj("i5-1", 5760, "forensicFinding", "forensics", "high", "confirmed", [
            "Break-glass account, 06:55: audit log table truncated for the last 30 days. Earlier records are intact. The SOC's preserved export from day two covers the deleted period.",
            "Nödkontot, 06.55: granskningsloggtabellen tömd för de senaste 30 dagarna. Äldre poster är intakta. SOC:s säkrade export från dag två täcker den raderade perioden."
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("How do you make audit logs impossible for administrators to delete?", "Hur gör ni granskningsloggar omöjliga för administratörer att radera?", ["socLead", "itOps"]),
            q("What chain of custody do you have for the preserved copy?", "Vilken spårbarhet har ni för den säkrade kopian?", ["socLead", "legal"]),
            q("Did rotating everything immediately stop anything else?", "Stoppade det något mer att byta allt omedelbart?", ["itOps"], "d4")
          ],
          executive: [
            q("What would the police case look like without that preserved copy?", "Hur skulle polisärendet se ut utan den säkrade kopian?", ["legal"]),
            q("How do you talk to the team that worked beside this person for eleven years?", "Hur pratar ni med teamet som arbetade bredvid den här personen i elva år?", ["hr", "comms"]),
            q("Did telling customers change how they see you?", "Ändrade det kundernas syn på er att ni berättade?", ["serviceOwner"], "d4")
          ]
        },
        challenges: [ch("The team asks why nobody noticed the weekly queries for eight months.", "Teamet frågar varför ingen märkte de veckovisa frågorna under åtta månader.")],
        noDecision: L(["No vote here. Let the room take stock of what the early evidence decision saved, and how the team is supported.", "Ingen omröstning här. Låt rummet konstatera vad det tidiga beslutet om bevis räddade, och hur teamet får stöd."]),
        facilitator: fac(
          ["The early preservation decision is the hero of this stage. Make sure the room notices.", "Det tidiga beslutet att säkra bevis är hjälten i det här skedet. Se till att rummet märker det."],
          ["Recognise the value of early preservation; plan tamper-proof logging.", "Uppmärksamma värdet av tidig säkring; planera manipuleringssäker loggning."],
          [["Ask: who reviews the people who review the logs?", "Fråga: vem granskar dem som granskar loggarna?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        priority: 3,
        title: L(["Four more", "Fyra till"]),
        twist: L(["An access review finds four other administrators who can query the same tables at any hour, with no alert and nobody reading the logs.", "En behörighetsgranskning hittar fyra andra administratörer som när som helst kan göra frågor mot samma tabeller, utan larm och utan att någon läser loggarna."]),
        twistKind: "scope",
        reconsider: { decision: "d3", pressure: { en: "Four more administrators can query the same tables. Was the way you removed one person's access a model, or a warning?", sv: "Ytterligare fyra administratörer kan ställa frågor mot samma tabeller. Var ert sätt att ta bort en persons åtkomst ett föredöme, eller en varning?" } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because affected customers were told, one has invoked the confidentiality clause in their contract and is claiming damages.", sv: "Eftersom berörda kunder informerades har en av dem åberopat sekretessklausulen i sitt avtal och kräver skadestånd." } }
        ],
        assumptionChallenged: L(["We had one bad apple.", "Vi hade ett ruttet äpple."]),
        reveals: ["hf-peers"],
        narrative: L([
          "{{time.T+10080|weekday|cap}}. Two weeks on. The police case continues and the competitor's lawyers have gone quiet. The crisis team meets to close the incident.\n\n{{person.ciso.name}} asks for ten more minutes. The question is not the person who left, but everyone who still could do the same thing tomorrow without anyone noticing.",
          "{{time.T+10080|weekday|cap}}. Två veckor senare. Polisutredningen fortsätter och konkurrentens jurister har blivit tysta. Krisledningen träffas för att avsluta incidenten.\n\n{{person.ciso.name}} ber om tio minuter till. Frågan är inte personen som slutade, utan alla som fortfarande skulle kunna göra samma sak i morgon utan att någon märker det."
        ]),
        injects: [
          inj("i6-1", 10080, "impactReport", "person.ciso", "medium", "confirmed", [
            "Accounts able to read all customer and contract tables: 5 (one now removed). Query alerts: none. Log reviews in two years: one, for the external audit.",
            "Konton som kan läsa alla kund- och avtalstabeller: 5 (varav ett nu borttaget). Larm på frågor: inga. Logggranskningar på två år: en, inför den externa revisionen."
          ], { reveals: ["hf-peers"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Do administrators need to read customer data to do their job?", "Behöver administratörer läsa kunddata för att göra sitt jobb?", ["itOps", "ciso"]),
            q("Which alert would have caught the Thursday pattern in week two?", "Vilket larm hade fångat torsdagsmönstret vecka två?", ["socLead"]),
            q("Looking back, what did the decision on how to remove access teach you?", "När ni ser tillbaka, vad lärde ni er av beslutet om hur åtkomsten skulle tas bort?", ["ciso"], "d3")
          ],
          executive: [
            q("How do you add oversight without telling loyal staff they are suspects?", "Hur inför ni tillsyn utan att säga till lojala medarbetare att de är misstänkta?", ["hr", "ciso"]),
            q("Who owns the review of privileged activity from now on?", "Vem äger granskningen av privilegierad aktivitet från och med nu?", ["ciso"]),
            q("Which early decision mattered most?", "Vilket tidigt beslut spelade störst roll?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The administrators' manager says monitoring them will make the best people leave.", "Administratörernas chef säger att övervakning kommer att få de bästa att sluta.")],
        decision: dec("d5", "ciso", ["What do you change?", "Vad ändrar ni?"], [
          ["Least privilege on data, alerts on unusual queries, tamper-proof logs reviewed monthly, and two-person control for break-glass.", "Minsta möjliga behörighet till data, larm på ovanliga frågor, manipuleringssäkra loggar som granskas varje månad och tvåpersonskontroll för nödkontot."],
          ["Background checks for all administrators.", "Bakgrundskontroller för alla administratörer."],
          ["A reminder of the confidentiality agreement.", "En påminnelse om sekretessavtalet."]
        ], {
          knowns: [["Others have the same unmonitored access.", "Andra har samma obevakade åtkomst."]],
          uncertainties: [["Whether any of them has done anything wrong.", "Om någon av dem har gjort något fel."]],
          tradeoffs: {
            operational: ["Removing data access from administrators slows some work.", "Att ta bort administratörers åtkomst till data bromsar en del arbete."],
            security: ["Checks on people do not replace controls on data.", "Kontroller av personer ersätter inte kontroller av data."],
            legal: ["Monitoring must be proportionate and disclosed to staff.", "Övervakning måste vara proportionerlig och berättas för personalen."],
            reputational: ["Customers will ask what has changed.", "Kunderna kommer att fråga vad som har ändrats."]
          },
          evaluation: [["Controls the data and the logs, not just the people", "Kontrollerar datan och loggarna, inte bara människorna"]],
          pushback: {
            A: [
              pb(["“Are we suspects?”", "”Är vi misstänkta?”"], ["Two of the four remaining administrators ask whether the new alerts and reviews mean they are under suspicion. Their manager has already warned that monitoring will make the best people leave. How do you introduce the controls without losing them?", "Två av de fyra kvarvarande administratörerna frågar om de nya larmen och granskningarna betyder att de är misstänkta. Deras chef har redan varnat för att övervakning får de bästa att sluta. Hur inför ni kontrollerna utan att förlora dem?"]),
              pb(["Three in the morning", "Klockan tre på natten"], ["With least privilege, an on-call administrator fixing a broken database at night must ask for data access first. {{person.itOps.name}} asks who approves that at three in the morning, and how long recovery waits. What is the answer?", "Med minsta möjliga behörighet måste en administratör i beredskap som lagar en trasig databas på natten först begära åtkomst till datan. {{person.itOps.name}} frågar vem som godkänner det klockan tre på natten, och hur länge återställningen får vänta. Vad är svaret?"]),
              pb(["Who reads the alerts?", "Vem läser larmen?"], ["The audit logs were already switched on for two years and nobody read them. {{person.socLead.name}} says the SOC has no capacity for monthly reviews or a new stream of query alerts. What makes this different from last time?", "Granskningsloggarna var redan påslagna i två år och ingen läste dem. {{person.socLead.name}} säger att SOC inte har kapacitet för månatliga granskningar eller ett nytt flöde av larm på frågor. Vad gör det här annorlunda mot förra gången?"])
            ],
            B: [
              pb(["Eleven clean years", "Elva år utan anmärkning"], ["The administrator who left had eleven years of service, and the payments started less than a year ago. A background check at hiring, or even last year, would have found nothing. What exactly would a check catch?", "Administratören som slutade hade elva års anställning, och betalningarna började för mindre än ett år sedan. En bakgrundskontroll vid anställningen, eller till och med förra året, hade inte hittat något. Vad exakt skulle en kontroll fånga?"]),
              pb(["The law and the union", "Lagen och facket"], ["{{person.legal.name}} warns that checks on current staff need a lawful basis and may be limited by law and the union agreement. The union has already asked why only administrators. Do you push ahead, and on what basis?", "{{person.legal.name}} varnar för att kontroller av befintlig personal kräver laglig grund och kan begränsas av lag och kollektivavtal. Facket har redan frågat varför bara administratörerna. Kör ni vidare, och på vilken grund?"]),
              pb(["Same access tomorrow", "Samma åtkomst i morgon"], ["Background checks take weeks. Meanwhile four administrators can still query every customer and contract table at any hour, with no alert. What changes on the systems tomorrow?", "Bakgrundskontroller tar veckor. Under tiden kan fyra administratörer fortfarande göra frågor mot varje kund- och avtalstabell när som helst, utan larm. Vad ändras i systemen i morgon?"])
            ],
            C: [
              pb(["They signed it too", "Hen skrev också under"], ["The administrator who left had signed the same confidentiality agreement, and it did not stop eight months of exports. Who exactly will a reminder stop?", "Administratören som slutade hade skrivit under samma sekretessavtal, och det stoppade inte åtta månader av exporter. Vem exakt kommer en påminnelse att stoppa?"]),
              pb(["“What has changed?”", "”Vad har ändrats?”"], ["Customers deciding on renewals ask what you have changed since the leak. The honest answer is “we reminded staff of their agreement”. Will they renew on that?", "Kunder som ska besluta om förnyelse frågar vad ni har ändrat sedan läckan. Det ärliga svaret är ”vi påminde personalen om deras avtal”. Kommer de att förnya på det?"]),
              pb(["Accused, and nothing fixed", "Anklagade, och inget lagat"], ["The administrators read the reminder as aimed at them. Their manager says you have managed to make loyal staff feel suspected while leaving the access exactly as it was. Is that the worst of both, and do you go further?", "Administratörerna läser påminnelsen som riktad mot dem. Deras chef säger att ni har lyckats få lojal personal att känna sig misstänkt och samtidigt lämnat åtkomsten precis som den var. Är det det sämsta av två världar, och går ni längre?"])
            ]
          }
        }),
        facilitator: fac(
          ["End on systems: the insider exploited a design that trusted administrators with everything.", "Avsluta med systemen: insidern utnyttjade en design som anförtrodde administratörerna allt."],
          ["Least privilege, query alerts, protected logs, two-person break-glass.", "Minsta behörighet, larm på frågor, skyddade loggar, tvåpersonskontroll för nödåtkomst."],
          [["Ask: what is the Thursday pattern in your environment that nobody is watching?", "Fråga: vilket är torsdagsmönstret i er miljö som ingen bevakar?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Access is removed and the evidence holds, but the competitor has the pricing logic and several customers have already moved.",
        "Åtkomsten är borttagen och bevisen håller, men konkurrenten har prissättningslogiken och flera kunder har redan gått över."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Insider cases are lost by talking too widely too early.", "Insiderärenden förloras genom att man pratar för brett för tidigt."]),
        L(["Preserve evidence before you confront anyone; insiders know where the logs are.", "Säkra bevisen innan ni konfronterar någon; insiders vet var loggarna finns."]),
        L(["Removing a privileged insider is an operation: every kind of access, prepared, at once.", "Att ta bort en privilegierad insider är en operation: all slags åtkomst, förberett, på en gång."]),
        L(["Logs nobody reads are not a control.", "Loggar som ingen läser är ingen kontroll."])
      ],
      assumptionsVsReality: [
        avr(["A former salesperson took a list.", "En tidigare säljare tog med sig en lista."], ["A trusted administrator exported data every week.", "En betrodd administratör exporterade data varje vecka."], "p2"),
        avr(["It is about a customer list.", "Det handlar om en kundlista."], ["A paid insider also took the pricing engine's code.", "En betald insider tog också prissättningsmotorns kod."], "p4"),
        avr(["One bad apple.", "Ett ruttet äpple."], ["Four others have the same unmonitored access.", "Fyra andra har samma obevakade åtkomst."], "p6")
      ],
      strengthsToLookFor: [
        L(["A small need-to-know team from the start", "Ett litet team på behovsbasis från början"]),
        L(["Preserving logs before interviews", "Att säkra loggar före intervjuer"]),
        L(["Planning the access removal as one coordinated step", "Att planera borttagandet av åtkomst som ett samordnat steg"])
      ],
      commonGaps: [
        L(["Confronting the suspect too early", "Att konfrontera den misstänkte för tidigt"]),
        L(["Forgetting break-glass accounts and keys", "Att glömma nödkonton och nycklar"]),
        L(["Ending with the person instead of the control gap", "Att sluta med personen i stället för luckan i kontrollerna"])
      ],
      suggestedActions: [
        act(["Remove standing administrator access to customer data; grant it just in time.", "Ta bort administratörers stående åtkomst till kunddata; ge den bara vid behov."], "ciso", "high"),
        act(["Send database audit logs to tamper-proof storage and alert on unusual queries.", "Skicka databasens granskningsloggar till manipuleringssäker lagring och larma på ovanliga frågor."], "socLead", "high"),
        act(["Put break-glass accounts under two-person control.", "Lägg nödkonton under tvåpersonskontroll."], "itOps", "medium"),
        act(["Write an insider investigation procedure with HR and legal.", "Skriv en rutin för insiderutredningar tillsammans med HR och juridik."], "hr", "medium")
      ]
    }
  });
})();
