/*
 * s34-time-sync.js — "Time Stops" (archetype C, time synchronisation).
 *
 * Sign-ins fail across the company and the SOC sees a burst of failed logons
 * → the GPS-fed time server lost its signal, then a receiver fault jumped the
 * clock forward years, and every server followed → retention jobs that think
 * it is the future deleted "old" logs and backups → scheduled month-end jobs
 * ran early: payroll sent to the bank, invoices issued → the signal loss was
 * regional interference, beyond anyone's control → fourteen systems with one
 * source of time.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s34-time-sync",
    version: 1,
    category: "time-sync",
    archetype: "benign-lookalike",
    emblem: "time-sync",
    title: L(["Time Stops", "Tiden stannar"]),
    summary: L([
      "Nobody can sign in, logs make no sense, and the SOC sees an attack in progress. The real cause is the one thing every system trusts without question: what time it is.",
      "Ingen kan logga in, loggarna går inte ihop och SOC ser ett pågående angrepp. Den verkliga orsaken är det enda som varje system litar på utan att ifrågasätta: vad klockan är."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Recognise infrastructure failures that look like attacks", "Känna igen infrastrukturfel som ser ut som angrepp"]), teaser: L(["When the evidence lies", "När bevisen ljuger"]) },
      { id: "lo2", text: L(["Contain side effects of automation running on false assumptions", "Begränsa följderna av automatik som körs på falska antaganden"]), teaser: L(["Machines doing exactly as told", "Maskiner som gör precis som de blivit tillsagda"]) },
      { id: "lo3", text: L(["Recover business processes that ran at the wrong time", "Återställa verksamhetsprocesser som kördes vid fel tidpunkt"]), teaser: L(["Undoing what already happened", "Att göra det redan gjorda ogjort"]) },
      { id: "lo4", text: L(["Build resilience into foundational services", "Bygga motståndskraft i grundläggande tjänster"]), teaser: L(["Things everyone assumes", "Saker alla tar för givna"]) }
    ],
    mitre: ["T1499"],
    frameworks: {
      nistCsf: ["ID.AM", "ID.RA", "PR.PS", "PR.IR", "DE.AE", "RS.AN", "RC.RP"],
      iso27001: ["A.5.29", "A.5.30", "A.7.5", "A.8.13", "A.8.15", "A.8.17", "A.8.32"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "night", startTime: "03:10" },
    actor: { types: ["unknown"], motivation: L(["None identified: regional signal interference and a receiver fault", "Ingen identifierad: regional signalstörning och ett fel i en mottagare"]), capability: "low" },
    variables: {
      servers: { min: 40, max: 1200, scaleBy: "size", step: 10 },
      payroll: { min: 1, max: 60, scaleBy: "size", currency: true },
      invoices: { min: 200, max: 15000, scaleBy: "size", step: 10 }
    },
    roles: ["incidentCommander", "itOps", "networkLead", "ciso", "socLead", "cio", "cfo", "serviceOwner", "facilities", "comms", "legal"],

    groundTruth: {
      rootCause: L([
        "{{org.name}}'s two internal time servers took their time from a single GPS receiver on the roof. Regional signal interference made the receiver lose its fix overnight; when the signal returned, a firmware fault in the old receiver misread the date and jumped it forward by almost twenty years. Both time servers trusted it and passed the date on to {{num.servers}} servers. Sign-ins failed, certificates appeared expired, retention jobs deleted logs and backups that seemed decades old, and scheduled month-end jobs ran early. No attacker was involved.",
        "{{org.name}}s två interna tidsservrar hämtade sin tid från en enda GPS-mottagare på taket. En regional signalstörning gjorde att mottagaren tappade positionen under natten; när signalen kom tillbaka läste ett fel i den gamla mottagarens programvara datumet fel och hoppade nästan tjugo år framåt. Båda tidsservrarna litade på den och förde datumet vidare till {{num.servers}} servrar. Inloggningar misslyckades, certifikat såg utgångna ut, gallringsjobb raderade loggar och säkerhetskopior som verkade vara årtionden gamla, och schemalagda månadsskiftesjobb kördes i förtid. Ingen angripare var inblandad."
      ]),
      attackerTimeline: [
        { at: -60, text: L(["Regional signal interference; GPS receiver loses its fix.", "Regional signalstörning; GPS-mottagaren tappar positionen."]) },
        { at: -10, text: L(["Receiver regains signal and misreads the date.", "Mottagaren får tillbaka signalen och läser datumet fel."]) },
        { at: 0, text: L(["Time servers and servers jump forward almost twenty years.", "Tidsservrar och servrar hoppar nästan tjugo år framåt."]) },
        { at: 40, text: L(["Retention and month-end jobs run on the false date.", "Gallrings- och månadsskiftesjobb körs på det falska datumet."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-gps", revealStage: "p2", text: L(["The single rooftop receiver lost its fix, then a firmware fault misread the date on reacquiring it.", "Den enda mottagaren på taket tappade positionen, och ett programvarufel läste sedan datumet fel när signalen kom tillbaka."]) },
      { id: "hf-jobs", revealStage: "p4", text: L(["Month-end payroll and invoicing jobs fired on the false date and reached the bank and customers.", "Lönekörning och fakturering för månadsskiftet startade på det falska datumet och nådde banken och kunderna."]) },
      { id: "hf-single", revealStage: "p6", text: L(["Fourteen systems, including doors and production, take time from that one antenna with no fallback.", "Fjorton system, bland annat dörrar och produktion, hämtar tid från den enda antennen utan reserv."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Nobody can sign in", "Ingen kan logga in"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The night shift in the operations centre cannot sign in. Then the SOC's dashboard fills with thousands of failed logons across every domain controller, from almost every account, all in the same few minutes.\n\nSome web services show certificate warnings. Log entries arrive with dates that make no sense. To {{person.socLead.name}}, it looks like the start of a large and well-prepared attack.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Nattskiftet i driftcentralen kan inte logga in. Sedan fylls SOC:s översikt med tusentals misslyckade inloggningar mot varje domänkontrollant, från nästan varje konto, allt inom samma minuter.\n\nEn del webbtjänster visar certifikatvarningar. Loggposter kommer in med datum som inte går ihop. För {{person.socLead.name}} ser det ut som början på ett stort och väl förberett angrepp."
        ]),
        injects: [
          inj("i1-1", 0, "siemAlert", "siem", "critical", "confirmed", [
            "Authentication failures: 18,400 in 6 minutes across all domain controllers. Error: “clock skew too great”. Certificate errors on 31 internal sites: “not yet valid” and “expired”.",
            "Inloggningsfel: 18 400 på 6 minuter mot alla domänkontrollanter. Felmeddelande: ”för stor tidsskillnad”. Certifikatfel på 31 interna webbplatser: ”ännu inte giltigt” och ”utgånget”."
          ], { tests: ["lo1"] }),
          inj("i1-2", 15, "chat", "person.socLead", "high", "misleading", [
            "“Mass logon failures, broken certificates, logs with garbage timestamps. Someone is tampering with our systems and covering their tracks. I want to isolate the domain controllers.”",
            "”Massvis med misslyckade inloggningar, trasiga certifikat, loggar med skräptidsstämplar. Någon manipulerar våra system och sopar igen spåren. Jag vill isolera domänkontrollanterna.”"
          ], { facilitatorNote: ["Every symptom fits a time problem; the error text even says so.", "Varje symtom passar ett tidsproblem; felmeddelandet säger det till och med."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("What does “clock skew too great” tell you?", "Vad säger ”för stor tidsskillnad” er?", ["itOps", "networkLead"]),
            q("What time do your servers think it is, right now?", "Vad tror era servrar att klockan är, just nu?", ["itOps"]),
            q("What would isolating the domain controllers do to the rest of the company?", "Vad skulle en isolering av domänkontrollanterna göra med resten av företaget?", ["itOps", "socLead"])
          ],
          executive: [
            q("Do you declare a cyber attack at three in the morning?", "Utlyser ni ett cyberangrepp klockan tre på natten?", ["incidentCommander", "ciso"]),
            q("Who needs to be woken, and who can wait until seven?", "Vem behöver väckas, och vem kan vänta till sju?", ["incidentCommander"]),
            q("What starts at six that will fail if this continues?", "Vad startar klockan sex som kommer att fallera om det här fortsätter?", ["serviceOwner"])
          ]
        },
        challenges: [ch("The SOC's own monitoring tool shows events dated in the future.", "SOC:s eget övervakningsverktyg visar händelser daterade i framtiden.")],
        decision: dec("d1", "incidentCommander", ["What is your first move?", "Vad är ert första drag?"], [
          ["Check the time on servers and time sources before declaring an attack.", "Kontrollera tiden på servrar och tidskällor innan ett angrepp utlyses."],
          ["Declare an attack and isolate the domain controllers.", "Utlys ett angrepp och isolera domänkontrollanterna."],
          ["Restart the failing servers.", "Starta om de servrar som fallerar."]
        ], {
          knowns: [["Mass sign-in failures with clock-related errors and broken timestamps.", "Massiva inloggningsfel med tidsrelaterade felmeddelanden och trasiga tidsstämplar."]],
          uncertainties: [["Whether anyone caused this deliberately.", "Om någon har orsakat det här avsiktligt."]],
          tradeoffs: {
            operational: ["Isolating domain controllers stops the whole company.", "Att isolera domänkontrollanterna stoppar hela företaget."],
            security: ["Dismissing an attack too quickly is risky; so is a false alarm.", "Att avfärda ett angrepp för snabbt är riskabelt; det är också ett falsklarm."],
            legal: ["Declaring an attack starts reporting obligations.", "Att utlysa ett angrepp startar rapporteringsskyldigheter."],
            reputational: ["Nobody outside knows yet.", "Ingen utanför vet ännu."]
          },
          evaluation: [["Tests the plain explanation the error message points to", "Prövar den enkla förklaring som felmeddelandet pekar på"]]
        }),
        facilitator: fac(
          ["The evidence itself is corrupted: timestamps are wrong. Watch whether the room reads the error message.", "Bevisen själva är förvanskade: tidsstämplarna är fel. Se om rummet läser felmeddelandet."],
          ["Check the time on systems and the time sources first.", "Kontrollera tiden på systemen och tidskällorna först."],
          [["Ask: if every clock were wrong, what would you see?", "Fråga: om varje klocka gick fel, vad skulle ni se då?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 30,
        title: L(["Almost twenty years", "Nästan tjugo år"]),
        twist: L(["Every server believes it is almost twenty years in the future. Both internal time servers take their time from one GPS receiver on the roof, which lost its signal and came back with a wildly wrong date.", "Varje server tror att det är nästan tjugo år in i framtiden. Båda de interna tidsservrarna hämtar sin tid från en enda GPS-mottagare på taket, som tappade signalen och kom tillbaka med ett helt felaktigt datum."]),
        twistKind: "cause",
        assumptionChallenged: L(["Someone is tampering with our systems.", "Någon manipulerar våra system."]),
        reveals: ["hf-gps"],
        narrative: L([
          "{{time.T+30|clock}}. {{person.itOps.name}} types one command on a domain controller and reads the answer twice. The date shown is in a year nobody in the room expects to see at work.\n\nThe time servers agree with the domain controller, because that is their job. Both of them get their time from the same small box connected to an antenna on the roof, installed long ago and largely forgotten since.",
          "Klockan {{time.T+30|clock}}. {{person.itOps.name}} skriver ett enda kommando på en domänkontrollant och läser svaret två gånger. Datumet som visas är ett år som ingen i rummet räknar med att se på jobbet.\n\nTidsservrarna håller med domänkontrollanten, eftersom det är deras uppgift. Båda hämtar sin tid från samma lilla låda, kopplad till en antenn på taket, installerad för länge sedan och sedan dess i stort sett bortglömd."
        ]),
        injects: [
          inj("i2-1", 30, "logExcerpt", "person.itOps", "high", "confirmed", [
            "Time server 1 and 2: source GPS-receiver-01, stratum 1. Receiver log: 02:05 signal lost; 03:00 signal reacquired; date set 19 years 7 months ahead. Time servers followed within 64 seconds.",
            "Tidsserver 1 och 2: källa GPS-receiver-01, stratum 1. Mottagarens logg: 02.05 signalen förlorad; 03.00 signalen tillbaka; datumet satt 19 år och 7 månader framåt. Tidsservrarna följde efter inom 64 sekunder."
          ], { reveals: ["hf-gps"], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you set the right time everywhere, and in what order?", "Hur sätter ni rätt tid överallt, och i vilken ordning?", ["itOps", "networkLead"]),
            q("What happens to systems when time jumps backwards by twenty years?", "Vad händer med system när tiden hoppar tjugo år bakåt?", ["itOps"]),
            q("Was checking the clocks before declaring an attack the right call?", "Var det rätt att kontrollera klockorna innan ett angrepp utlystes?", ["socLead"], "d1")
          ],
          executive: [
            q("Is this still a security incident at all?", "Är det här fortfarande en säkerhetsincident över huvud taget?", ["ciso", "incidentCommander"]),
            q("Who decides when it is safe to correct the time?", "Vem bestämmer när det är säkert att rätta tiden?", ["cio"]),
            q("If you had isolated the domain controllers, what would you be undoing now?", "Om ni hade isolerat domänkontrollanterna, vad skulle ni hålla på att göra ogjort nu?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Some systems refuse to accept a time change of that size without a manual override.", "En del system vägrar acceptera en tidsändring av den storleken utan manuell åtgärd.")],
        decision: dec("d2", "cio", ["How do you fix the time?", "Hur rättar ni tiden?"], [
          ["Take the GPS receiver out of service, point the time servers at trusted external sources, then correct critical systems in a planned order.", "Ta GPS-mottagaren ur drift, låt tidsservrarna använda betrodda externa källor och rätta sedan de kritiska systemen i planerad ordning."],
          ["Force the right time onto every server at once.", "Tvinga in rätt tid på varje server på en gång."],
          ["Wait for the receiver to correct itself.", "Vänta på att mottagaren rättar sig själv."]
        ], {
          knowns: [["A single faulty receiver drove every clock wrong.", "En enda felaktig mottagare fick varje klocka att gå fel."]],
          uncertainties: [["What ran on the false date in the meantime.", "Vad som körts på det falska datumet under tiden."]],
          tradeoffs: {
            operational: ["A planned order is slower than forcing everything.", "En planerad ordning går långsammare än att tvinga igenom allt."],
            security: ["External time sources must be trustworthy and reachable.", "Externa tidskällor måste vara pålitliga och nåbara."],
            legal: ["Records with wrong timestamps may matter later.", "Poster med fel tidsstämplar kan spela roll senare."],
            reputational: ["The business wakes up at six.", "Verksamheten vaknar klockan sex."]
          },
          evaluation: [["Removes the bad source first, then corrects deliberately", "Tar bort den felaktiga källan först och rättar sedan avsiktligt"]]
        }),
        facilitator: fac(
          ["Foundational services fail in strange ways. Correcting time is itself a risky change.", "Grundläggande tjänster fallerar på konstiga sätt. Att rätta tiden är i sig en riskfylld ändring."],
          ["Isolate the faulty source, use trusted alternatives, correct in a planned order.", "Isolera den felaktiga källan, använd betrodda alternativ, rätta i planerad ordning."],
          [["Ask: what else ran on that wrong date while you were looking at logons?", "Fråga: vad mer kördes på det felaktiga datumet medan ni tittade på inloggningarna?"]]
        )
      },
      {
        id: "p3",
        clock: 120,
        priority: 1,
        title: L(["Retention", "Gallring"]),
        twist: L(["Automated retention jobs, believing it was twenty years later, deleted everything “older than seven years”: two years of logs and the oldest backup sets were removed before anyone noticed.", "Automatiska gallringsjobb, som trodde att det var tjugo år senare, raderade allt ”äldre än sju år”: två års loggar och de äldsta säkerhetskopiorna togs bort innan någon märkte något."]),
        twistKind: "impact",
        assumptionChallenged: L(["Fixing the clock fixes the problem.", "Att rätta klockan löser problemet."]),
        narrative: L([
          "{{time.T+120|clock}}. The time is right again on the most important systems. Sign-ins work, the certificate warnings are gone, and the night shift is relieved.\n\nThen the backup system sends its morning report two hours early. It cheerfully says that housekeeping completed successfully, and lists how much storage it freed up during the night.",
          "Klockan {{time.T+120|clock}}. Tiden stämmer igen på de viktigaste systemen. Inloggningarna fungerar, certifikatvarningarna är borta och nattskiftet är lättat.\n\nSedan skickar backupsystemet sin morgonrapport två timmar för tidigt. Den meddelar glatt att städningen slutfördes utan fel och listar hur mycket lagringsutrymme som frigjordes under natten."
        ]),
        injects: [
          inj("i3-1", 120, "backupReport", "backupSystem", "high", "confirmed", [
            "Housekeeping completed. Expired by retention policy (7 years): 412 backup sets, 2.1 TB of archived logs. Storage freed: 38 TB. Status: success.",
            "Städning slutförd. Utgångna enligt gallringsregeln (7 år): 412 säkerhetskopior, 2,1 TB arkiverade loggar. Frigjort utrymme: 38 TB. Status: lyckades."
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Can any of the deleted backups or logs be recovered?", "Kan någon av de raderade säkerhetskopiorna eller loggarna återskapas?", ["itOps"]),
            q("Which other automated jobs act on dates and ran tonight?", "Vilka andra automatiska jobb agerar utifrån datum och kördes i natt?", ["itOps", "serviceOwner"]),
            q("Did correcting the time in a planned order stop anything else from firing?", "Hindrade rättningen i planerad ordning något annat från att starta?", ["itOps"], "d2")
          ],
          executive: [
            q("Were you required to keep any of the deleted records?", "Var ni skyldiga att behålla någon av de raderade posterna?", ["legal", "cfo"]),
            q("Who needs to know that the oldest backups are gone?", "Vem behöver veta att de äldsta säkerhetskopiorna är borta?", ["cio"]),
            q("Would forcing the time everywhere at once have made this worse?", "Hade det blivit värre om tiden tvingats in överallt på en gång?", ["cio"], "d2")
          ]
        },
        challenges: [ch("Some of the deleted logs were under a legal hold for an ongoing dispute.", "En del av de raderade loggarna omfattades av ett bevarandebeslut i en pågående tvist.")],
        decision: dec("d3", "cio", ["How do you deal with automation?", "Hur hanterar ni automatiken?"], [
          ["Pause all date-driven jobs, recover what you can, and record exactly what was lost and why.", "Pausa alla datumstyrda jobb, återskapa det som går och dokumentera exakt vad som gick förlorat och varför."],
          ["Restore from the remaining backups and carry on.", "Återställ från de återstående säkerhetskopiorna och fortsätt."],
          ["Leave automation running; the time is right now.", "Låt automatiken vara igång; tiden stämmer nu."]
        ], {
          knowns: [["Retention jobs deleted data on the false date.", "Gallringsjobb raderade data på det falska datumet."]],
          uncertainties: [["What other jobs acted on the false date.", "Vilka andra jobb som agerade på det falska datumet."]],
          tradeoffs: {
            operational: ["Pausing jobs stops normal processing today.", "Att pausa jobb stoppar den normala behandlingen i dag."],
            security: ["Lost logs leave a gap in your ability to investigate.", "Förlorade loggar lämnar en lucka i er förmåga att utreda."],
            legal: ["Deleted records under a legal hold need explaining.", "Raderade poster under ett bevarandebeslut måste förklaras."],
            reputational: ["Nobody outside knows yet.", "Ingen utanför vet ännu."]
          },
          evaluation: [["Stops automation acting on bad assumptions and documents the loss", "Stoppar automatik som agerar på felaktiga antaganden och dokumenterar förlusten"]]
        }),
        facilitator: fac(
          ["Automation does exactly what it is told, on whatever date it believes. That is the damage.", "Automatik gör exakt vad den blivit tillsagd, på vilket datum den än tror. Det är skadan."],
          ["Pause date-driven jobs, recover, document losses and legal holds.", "Pausa datumstyrda jobb, återskapa, dokumentera förluster och bevarandebeslut."],
          [["Ask: which of your scheduled jobs would you not want to run twenty years early?", "Fråga: vilka av era schemalagda jobb skulle ni inte vilja ha körda tjugo år för tidigt?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 300,
        title: L(["Month-end, early", "Månadsskiftet, i förtid"]),
        twist: L(["The false date was also a month-end. The payroll batch, {{num.payroll|currency}}, was sent to the bank at 03:40, and {{num.invoices|number}} customer invoices were issued and emailed, all dated twenty years from now.", "Det falska datumet var också ett månadsskifte. Lönekörningen, {{num.payroll|currency}}, skickades till banken 03.40, och {{num.invoices|number}} kundfakturor skapades och mejlades, alla daterade tjugo år framåt."]),
        twistKind: "scope",
        assumptionChallenged: L(["This stayed inside IT.", "Det här stannade inom IT."]),
        reveals: ["hf-jobs"],
        narrative: L([
          "{{time.T+300|clock}}. Early morning. Finance staff are beginning to log in, and {{person.cfo.name}} opens their email to find automatic confirmations that should only arrive at the end of the month.\n\nCustomers in other time zones are already replying to invoices with strange dates. The bank's corporate desk has left a voicemail about an unexpected payroll file.",
          "Klockan {{time.T+300|clock}}. Tidig morgon. Ekonomipersonalen börjar logga in, och {{person.cfo.name}} öppnar sin e-post och hittar automatiska bekräftelser som bara borde komma i slutet av månaden.\n\nKunder i andra tidszoner svarar redan på fakturor med konstiga datum. Bankens företagsavdelning har lämnat ett röstmeddelande om en oväntad lönefil."
        ]),
        injects: [
          inj("i4-1", 300, "email", "bank", "high", "confirmed", [
            "{{supplier.bank}}: “We received a salary payment file at 03:40 dated far in the future. It is queued for execution today. Please confirm whether it should be processed.”",
            "{{supplier.bank}}: ”Vi tog emot en lönefil 03.40 daterad långt fram i tiden. Den ligger i kö för utförande i dag. Bekräfta om den ska behandlas.”"
          ], { headline: ["Unexpected salary file", "Oväntad lönefil"], reveals: ["hf-jobs"], tests: ["lo3"] }),
          inj("i4-2", 330, "customerComplaint", "customer", "medium", "confirmed", [
            "“We just received an invoice from you dated twenty years from now, for a period we haven't reached. Is this a scam using your name?”",
            "”Vi fick precis en faktura från er daterad tjugo år framåt, för en period vi inte har kommit till. Är det här ett bedrägeri i ert namn?”"
          ], { tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["What ran on the wrong date", "Vad som kördes på fel datum"]),
          data: kpi([
            { id: "srv", label: ["Servers with the wrong date", "Servrar med fel datum"], value: (v) => v.servers, tone: "warn" },
            { id: "pay", label: ["Payroll file sent to the bank", "Lönefil skickad till banken"], value: (v) => v.payroll, format: "currency", tone: "danger" },
            { id: "inv", label: ["Invoices issued", "Utskickade fakturor"], value: (v) => v.invoices, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("Can you stop or recall the payroll file before it executes?", "Kan ni stoppa eller återkalla lönefilen innan den genomförs?", ["cfo"]),
            q("How do you cancel or credit invoices with impossible dates?", "Hur makulerar eller krediterar ni fakturor med omöjliga datum?", ["cfo", "serviceOwner"]),
            q("Did pausing date-driven jobs come in time to stop more?", "Kom pausen av datumstyrda jobb i tid för att stoppa mer?", ["itOps"], "d3")
          ],
          executive: [
            q("What do you tell customers who think they have been scammed?", "Vad säger ni till kunder som tror att de har blivit lurade?", ["comms", "serviceOwner"]),
            q("What do you tell staff about this month's pay?", "Vad säger ni till personalen om den här månadens lön?", ["cfo", "comms"]),
            q("Would leaving automation running have sent another batch?", "Hade ytterligare en körning skickats om automatiken fått fortsätta?", ["cio"], "d3")
          ]
        },
        challenges: [ch("Some customers' accounting systems have already booked the invoices automatically.", "En del kunders bokföringssystem har redan bokfört fakturorna automatiskt.")],
        decision: dec("d4", "cfo", ["How do you handle the business damage?", "Hur hanterar ni skadan i verksamheten?"], [
          ["Stop the payroll file with the bank, credit all invoices with a clear explanation to customers, and brief staff before rumours start.", "Stoppa lönefilen hos banken, kreditera alla fakturor med en tydlig förklaring till kunderna och informera personalen innan ryktena börjar."],
          ["Let the payroll run early and recover the difference later.", "Låt lönekörningen gå i förtid och reglera skillnaden senare."],
          ["Leave the invoices; customers will ignore the strange dates.", "Låt fakturorna vara; kunderna kommer att strunta i de konstiga datumen."]
        ], {
          knowns: [["Real money and real documents went out on the false date.", "Riktiga pengar och riktiga dokument gick ut på det falska datumet."]],
          uncertainties: [["What else outside IT acted on it.", "Vad mer utanför IT som agerade på det."]],
          tradeoffs: {
            operational: ["Crediting thousands of invoices is days of work.", "Att kreditera tusentals fakturor är flera dagars arbete."],
            security: ["Customers suspecting fraud is a reputational risk and a phishing opportunity for others.", "Kunder som misstänker bedrägeri är en anseenderisk och en möjlighet för nätfiske från andra."],
            legal: ["Invoices and payroll have accounting and tax rules.", "Fakturor och löner har bokförings- och skatteregler."],
            reputational: ["Silence makes the strange invoices look like a scam.", "Tystnad får de konstiga fakturorna att se ut som ett bedrägeri."]
          },
          evaluation: [["Reverses business effects quickly and explains them plainly", "Gör verksamhetens följder ogjorda snabbt och förklarar dem enkelt"]]
        }),
        facilitator: fac(
          ["The scope leaves IT: money, customers, staff. The room often keeps treating it as technical.", "Omfattningen lämnar IT: pengar, kunder, personal. Rummet fortsätter ofta att behandla det som tekniskt."],
          ["Stop the payroll, credit invoices with an explanation, brief staff.", "Stoppa lönekörningen, kreditera fakturorna med en förklaring, informera personalen."],
          [["Ask: who outside this room has already acted on that date?", "Fråga: vem utanför det här rummet har redan agerat på det datumet?"]]
        )
      },
      {
        id: "p5",
        clock: 1440,
        priority: 2,
        title: L(["Interference", "Störning"]),
        twist: L(["The national telecom authority reports widespread satellite navigation interference in the region overnight. Ships, aircraft and several companies lost signal. It may happen again, and nobody can say when.", "Den nationella telemyndigheten rapporterar omfattande störningar av satellitnavigering i regionen under natten. Fartyg, flygplan och flera företag tappade signalen. Det kan hända igen, och ingen kan säga när."]),
        twistKind: "authority",
        assumptionChallenged: L(["It was a one-off equipment fault we can fix.", "Det var ett enstaka utrustningsfel som vi kan laga."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}. The clocks are right, the payroll is stopped and the invoices are being credited. {{person.facilities.name}} has replaced the old receiver with a spare and the crisis team is ready to close.\n\nThen a news item and a bulletin from the national authority explain why the receiver lost its signal in the first place. The broken firmware was only half the story.",
          "{{time.T+1440|weekday|cap}}. Klockorna stämmer, lönekörningen är stoppad och fakturorna krediteras. {{person.facilities.name}} har bytt den gamla mottagaren mot en reserv och krisledningen är redo att avsluta.\n\nSedan förklarar en nyhet och ett meddelande från den nationella myndigheten varför mottagaren tappade signalen från början. Den trasiga programvaran var bara halva historien."
        ]),
        injects: [
          inj("i5-1", 1440, "advisory", "csirt", "medium", "confirmed", [
            "Bulletin: satellite navigation signals were disrupted across the region between 01:50 and 03:00. Organisations relying on satellite timing should verify fallback time sources. Further disruption cannot be ruled out.",
            "Meddelande: signaler för satellitnavigering stördes i regionen mellan 01.50 och 03.00. Organisationer som är beroende av satellitbaserad tid bör kontrollera sina reservkällor för tid. Fler störningar kan inte uteslutas."
          ], { headline: ["Satellite navigation interference", "Störning av satellitnavigering"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What should your time servers do when the satellite signal disappears?", "Vad ska era tidsservrar göra när satellitsignalen försvinner?", ["networkLead", "itOps"]),
            q("How would you notice next time before the date is wrong?", "Hur skulle ni märka det nästa gång innan datumet blir fel?", ["socLead", "itOps"]),
            q("Did the explanation to customers hold up now that the cause is public?", "Höll förklaringen till kunderna nu när orsaken är offentlig?", ["comms"], "d4")
          ],
          executive: [
            q("Is this a risk you can reduce, or only prepare for?", "Är det här en risk ni kan minska, eller bara förbereda er för?", ["cio", "ciso"]),
            q("Who else depends on the same signal: your suppliers, your building?", "Vem mer är beroende av samma signal: era leverantörer, er byggnad?", ["facilities", "cio"]),
            q("Did stopping the payroll cause any problems for staff?", "Orsakade stoppet av lönekörningen några problem för personalen?", ["cfo"], "d4")
          ]
        },
        challenges: [ch("The replacement receiver is the same model with the same firmware.", "Ersättningsmottagaren är samma modell med samma programvara.")],
        noDecision: L(["No vote: the interference is outside your control. Let the room decide how to stop it reaching your clocks next time.", "Ingen omröstning: störningen ligger utanför er kontroll. Låt rummet bestämma hur den ska hindras från att nå era klockor nästa gång."]),
        facilitator: fac(
          ["Some threats cannot be prevented, only absorbed. Shift to resilience.", "Vissa hot kan inte förhindras, bara tålas. Byt fokus till motståndskraft."],
          ["Multiple time sources, sanity limits on time jumps, monitoring for drift.", "Flera tidskällor, rimlighetsgränser för tidshopp, övervakning av avvikelser."],
          [["Ask: what other foundation do you take from the sky or the grid?", "Fråga: vilken annan grund hämtar ni från himlen eller elnätet?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        priority: 3,
        title: L(["One antenna", "En antenn"]),
        twist: L(["A dependency review finds fourteen systems that take time from that one rooftop antenna, including door access control, production line controllers and the camera system, with no second source.", "En genomgång av beroenden hittar fjorton system som hämtar tid från den enda antennen på taket, bland annat passersystemet, styrsystemen i produktionen och kamerasystemet, utan någon andra källa."]),
        twistKind: "scope",
        assumptionChallenged: L(["Time only matters for IT servers.", "Tid spelar bara roll för IT-servrar."]),
        reveals: ["hf-single"],
        narrative: L([
          "{{time.T+10080|weekday|cap}}. A week later. {{person.networkLead.name}} and {{person.facilities.name}} have followed every cable from the antenna on the roof down into the building, and every system that asks it what time it is.\n\nThe list is longer than either of them expected, and much of it is not IT at all. Some of the systems open doors, and some of them run machines.",
          "{{time.T+10080|weekday|cap}}. En vecka senare. {{person.networkLead.name}} och {{person.facilities.name}} har följt varje kabel från antennen på taket ner i byggnaden, och varje system som frågar den vad klockan är.\n\nListan är längre än någon av dem väntat sig, och mycket av den är inte IT alls. En del av systemen öppnar dörrar, och en del styr maskiner."
        ]),
        injects: [
          inj("i6-1", 10080, "impactReport", "person.networkLead", "medium", "confirmed", [
            "Systems taking time from GPS-receiver-01: 14 (domain, certificates, backup, logging, door access, CCTV, production controllers, payroll). Second time source: none. Alerts on time jumps: none.",
            "System som hämtar tid från GPS-receiver-01: 14 (domän, certifikat, säkerhetskopiering, loggning, passersystem, kameror, produktionsstyrning, lön). Andra tidskälla: ingen. Larm vid tidshopp: inga."
          ], { reveals: ["hf-single"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How many independent time sources do you need, and of what kind?", "Hur många oberoende tidskällor behöver ni, och av vilket slag?", ["networkLead"]),
            q("Should systems refuse large time jumps without a person approving?", "Bör system vägra stora tidshopp utan att en människa godkänner?", ["itOps"]),
            q("Looking back, how did pausing automation change the outcome?", "När ni ser tillbaka, hur ändrade pausen av automatiken utfallet?", ["itOps"], "d3")
          ],
          executive: [
            q("Who owns time as a service across IT, facilities and production?", "Vem äger tid som tjänst över IT, fastighet och produktion?", ["cio", "facilities"]),
            q("What else does everyone assume will simply be there?", "Vad mer tar alla för givet att det helt enkelt finns?", ["cio"]),
            q("Which decision in the first hour mattered most?", "Vilket beslut under den första timmen spelade störst roll?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Production says its line controllers cannot be changed without the vendor.", "Produktionen säger att linjens styrsystem inte kan ändras utan leverantören.")],
        decision: dec("d5", "cio", ["What do you change?", "Vad ändrar ni?"], [
          ["At least three independent time sources, limits on how far clocks may jump, alerts on drift, and date-driven jobs that check before acting.", "Minst tre oberoende tidskällor, gränser för hur långt klockor får hoppa, larm vid avvikelser och datumstyrda jobb som kontrollerar innan de agerar."],
          ["Replace the receiver with a better model.", "Byt mottagaren mot en bättre modell."],
          ["Use a public internet time source only.", "Använd bara en publik tidskälla på internet."]
        ], {
          knowns: [["Fourteen systems depend on one time source with no checks.", "Fjorton system är beroende av en tidskälla utan kontroller."]],
          uncertainties: [["When the next interference happens.", "När nästa störning inträffar."]],
          tradeoffs: {
            operational: ["Several sources and limits need setup and testing.", "Flera källor och gränser kräver uppsättning och tester."],
            security: ["A single internet source can be attacked or lost too.", "En enda källa på internet kan också angripas eller försvinna."],
            legal: ["Accurate time matters for records and evidence.", "Korrekt tid spelar roll för bokföring och bevisning."],
            reputational: ["A repeat would be harder to explain.", "En upprepning vore svårare att förklara."]
          },
          evaluation: [["Builds redundancy and sanity checks into a foundation everyone trusts", "Bygger in redundans och rimlighetskontroller i en grund som alla litar på"]]
        }),
        facilitator: fac(
          ["End on foundational dependencies hiding in plain sight.", "Avsluta med grundläggande beroenden som gömmer sig i öppen dager."],
          ["Multiple sources, jump limits, drift alerts, defensive automation.", "Flera källor, gränser för hopp, larm vid avvikelser, försiktig automatik."],
          [["Ask: what is the antenna on your roof?", "Fråga: vilken är antennen på ert tak?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The clocks are right and the payroll was stopped, but two years of logs and the oldest backups are gone, and customers will remember the strange invoices.",
        "Klockorna går rätt och lönekörningen stoppades, men två års loggar och de äldsta säkerhetskopiorna är borta, och kunderna kommer att minnas de konstiga fakturorna."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Infrastructure failures can look exactly like attacks; read the error messages.", "Infrastrukturfel kan se exakt ut som angrepp; läs felmeddelandena."]),
        L(["When the evidence itself is corrupted, check the foundation first.", "När bevisen själva är förvanskade, kontrollera grunden först."]),
        L(["Automation acts on whatever it believes; pause it when its assumptions are wrong.", "Automatik agerar på det den tror; pausa den när dess antaganden är fel."]),
        L(["Foundational services need more than one source and sanity checks.", "Grundläggande tjänster behöver mer än en källa och rimlighetskontroller."])
      ],
      assumptionsVsReality: [
        avr(["Someone is tampering with our systems.", "Någon manipulerar våra system."], ["One faulty time source misled every clock.", "En felaktig tidskälla vilseledde varje klocka."], "p2"),
        avr(["It stayed inside IT.", "Det stannade inom IT."], ["Payroll and invoices went out on the false date.", "Lön och fakturor gick ut på det falska datumet."], "p4"),
        avr(["Time matters only for servers.", "Tid spelar bara roll för servrar."], ["Doors, cameras and production depend on it too.", "Dörrar, kameror och produktion är också beroende av den."], "p6")
      ],
      strengthsToLookFor: [
        L(["Checking clocks before declaring an attack", "Att kontrollera klockorna innan ett angrepp utlyses"]),
        L(["Pausing date-driven automation", "Att pausa datumstyrd automatik"]),
        L(["Reaching the bank before the payroll executed", "Att nå banken innan lönekörningen genomfördes"])
      ],
      commonGaps: [
        L(["Isolating domain controllers on a false alarm", "Att isolera domänkontrollanter på ett falsklarm"]),
        L(["Forgetting jobs that ran on the false date", "Att glömma jobb som kördes på det falska datumet"]),
        L(["Treating it as purely technical", "Att behandla det som enbart tekniskt"])
      ],
      suggestedActions: [
        act(["Use at least three independent time sources with sanity limits.", "Använd minst tre oberoende tidskällor med rimlighetsgränser."], "networkLead", "high"),
        act(["Alert on clock drift and large time changes.", "Larma vid klockavvikelser och stora tidsändringar."], "socLead", "high"),
        act(["Make retention and month-end jobs check the date before acting.", "Låt gallrings- och månadsskiftesjobb kontrollera datumet innan de agerar."], "itOps", "medium"),
        act(["Map every system, including facilities and production, that depends on satellite timing.", "Kartlägg varje system, även fastighet och produktion, som är beroende av satellitbaserad tid."], "facilities", "medium")
      ]
    }
  });
})();
