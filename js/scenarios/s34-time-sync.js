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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, pb, ir, io } = BK.scenarios.h;

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
      payroll: { min: 1000000, max: 60000000, scaleBy: "size", step: 100000, currency: true },
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
          evaluation: [["Tests the plain explanation the error message points to", "Prövar den enkla förklaring som felmeddelandet pekar på"]],
          interrupts: [
            ir("i1", { chosen: "B" }, ["Domain controllers cut off", "Domänkontrollanterna avskurna"], [
              io(["The failures stop", "Felen upphör"], ["The flood of failed logons stops the moment the domain controllers go offline. {{person.socLead.name}} calls it proof that the attack has been cut off.", "Flödet av misslyckade inloggningar upphör i samma stund som domänkontrollanterna kopplas bort. {{person.socLead.name}} kallar det ett bevis på att angreppet har stoppats."], ["The failed logons stopped when the domain controllers were isolated.", "De misslyckade inloggningarna upphörde när domänkontrollanterna isolerades."]),
              io(["Locked out", "Utelåsta"], ["Within minutes, the night shift's badges stop opening doors and the operations centre loses access to every system it needs. Nobody inside can sign in to check anything.", "Inom några minuter slutar nattskiftets passerkort att öppna dörrar och driftcentralen tappar åtkomsten till alla system den behöver. Ingen därinne kan logga in och kontrollera något."], ["Isolating the domain controllers stopped badges and every sign-in.", "Isoleringen av domänkontrollanterna stoppade passerkort och alla inloggningar."], { reopen: true }),
              io(["The insurer is told", "Försäkringsbolaget får veta"], ["The attack declaration reached the insurer's incident hotline. They want a call within the hour and ask what evidence you have preserved.", "Beslutet om angrepp nådde försäkringsbolagets incidentlinje. De vill ha ett samtal inom en timme och frågar vilka bevis ni har säkrat."], ["The insurer has been notified of a declared cyber attack.", "Försäkringsbolaget har underrättats om ett utlyst cyberangrepp."])
            ]),
            ir("i2", { notChosen: "B" }, ["No attack declared", "Inget angrepp utlyst"], [
              io(["Nothing spreads", "Inget sprider sig"], ["Twenty minutes pass. No new accounts are locked, and nothing has changed on the servers the night shift can still see. Whatever this is, it does not seem to be spreading.", "Tjugo minuter går. Inga nya konton låses, och ingenting har ändrats på de servrar som nattskiftet fortfarande ser. Vad det än är verkar det inte sprida sig."], ["Nothing new spread in the first twenty minutes.", "Ingenting nytt spreds under de första tjugo minuterna."]),
              io(["Webmail too", "Webbposten också"], ["Failed logons now also appear on the external webmail, from addresses abroad. To {{person.socLead.name}}, it looks like an attacker widening the front.", "Misslyckade inloggningar syns nu också mot den externa webbposten, från adresser utomlands. För {{person.socLead.name}} ser det ut som en angripare som breddar fronten."], ["Failed logons are also showing on the external webmail.", "Misslyckade inloggningar syns också mot den externa webbposten."], { reopen: true }),
              io(["Overruled, on record", "Överkörd, till protokollet"], ["{{person.socLead.name}} emails {{person.ciso.name}} that the SOC recommended isolation and was overruled, and asks for the decision to be logged with a name.", "{{person.socLead.name}} mejlar {{person.ciso.name}} att SOC rekommenderade isolering och blev överkörd, och ber att beslutet loggas med namn."], ["The SOC lead has put on record that isolation was recommended and refused.", "SOC-chefen har fört till protokollet att isolering rekommenderades och avslogs."])
            ])
          ],
          pushback: {
            A: [
              pb(["The SOC lead objects", "SOC-chefen invänder"], ["{{person.socLead.name}} is blunt: checking clocks is exactly the distraction an attacker would want, and every minute spent on it lets them dig in deeper. If you are wrong, who explains why you waited?", "{{person.socLead.name}} säger det rakt ut: att kontrollera klockor är precis den distraktion en angripare skulle vilja ha, och varje minut ni lägger på det låter dem gräva sig djupare. Om ni har fel, vem förklarar varför ni väntade?"]),
              pb(["A wrong clock proves nothing", "En felaktig klocka bevisar ingenting"], ["Suppose the clocks are wrong. Someone could have changed them on purpose, and a wrong time explains the symptoms, not the cause. Do you stop looking for an intruder the moment you find a bad clock?", "Anta att klockorna går fel. Någon kan ha ändrat dem med flit, och en felaktig tid förklarar symtomen, inte orsaken. Slutar ni leta efter en inkräktare i samma ögonblick som ni hittar en felaktig klocka?"]),
              pb(["Nobody can get in to check", "Ingen kommer in och kontrollerar"], ["To check the time on a server, someone has to sign in, and sign-in is what is failing. The night shift has local accounts on only a handful of machines, and nobody remembers the passwords. Who can actually check, and how long will it take?", "För att kontrollera tiden på en server måste någon logga in, och det är inloggningen som fallerar. Nattskiftet har lokala konton på bara ett fåtal maskiner, och ingen minns lösenorden. Vem kan faktiskt kontrollera, och hur lång tid tar det?"])
            ],
            B: [
              pb(["Six o'clock is coming", "Klockan sex närmar sig"], ["With the domain controllers isolated, nobody will be able to sign in to anything when the morning shift arrives. {{person.serviceOwner.name}} asks how long the isolation will last. What is your answer, and what is your condition for lifting it?", "Med domänkontrollanterna isolerade kommer ingen att kunna logga in någonstans när morgonskiftet kommer. {{person.serviceOwner.name}} frågar hur länge isoleringen ska pågå. Vad svarar ni, och vad är ert villkor för att häva den?"]),
              pb(["“Not yet valid”", "”Ännu inte giltigt”"], ["{{person.itOps.name}} points at the certificate errors: some say “not yet valid”. An attacker covering their tracks would not make your certificates appear to come from the future. Do you stand by the attack declaration, or take it back?", "{{person.itOps.name}} pekar på certifikatfelen: en del säger ”ännu inte giltigt”. En angripare som sopar igen spåren skulle inte få era certifikat att se ut att komma från framtiden. Står ni fast vid att det är ett angrepp, eller tar ni tillbaka det?"]),
              pb(["Declaring starts things", "Att utlysa sätter saker i rörelse"], ["{{person.legal.name}}, woken by the declaration, asks whether to start reporting and call the insurer. Both are hard to undo. Do you file on what you have seen so far?", "{{person.legal.name}}, som väcktes av beslutet, frågar om rapporteringen ska påbörjas och försäkringsbolaget ringas. Båda är svåra att backa ur. Anmäler ni på det ni har sett hittills?"])
            ],
            C: [
              pb(["They come back the same", "De kommer tillbaka likadana"], ["The first restarted servers come up with exactly the same errors, and one does not come back at all. Nothing has improved and one more thing is broken. Do you keep restarting, or stop and find out why?", "De första omstartade servrarna kommer upp med exakt samma fel, och en kommer inte upp alls. Ingenting har blivit bättre och en sak till är trasig. Fortsätter ni starta om, eller stannar ni och tar reda på varför?"]),
              pb(["Evidence wiped", "Bevis som raderas"], ["{{person.socLead.name}} objects: if this is an attack, restarting wipes the memory an investigator would need. You may be destroying the only proof of who did this. Is a restart worth that?", "{{person.socLead.name}} invänder: om det är ett angrepp raderar en omstart minnet som en utredare skulle behöva. Ni kanske förstör det enda beviset på vem som gjorde det här. Är en omstart värd det?"]),
              pb(["Which ones?", "Vilka?"], ["The night shift asks which servers count as “failing”. The errors are on every domain controller and dozens of sites, and each restart drops whatever sessions still work. Who picks the order, and on what basis?", "Nattskiftet frågar vilka servrar som räknas som ”fallerande”. Felen finns på varje domänkontrollant och dussintals webbplatser, och varje omstart kapar de sessioner som fortfarande fungerar. Vem väljer ordningen, och på vilka grunder?"])
            ]
          }
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
        branches: [
          { when: { decision: "d1", option: "B" }, narrativeAppend: { en: "Because the domain controllers were isolated as an attack, nobody could sign in to fix the clocks for two hours, and the night shift's badges stopped working.", sv: "Eftersom domänkontrollanterna isolerades som vid ett angrepp kunde ingen logga in och rätta klockorna på två timmar, och nattskiftets passerkort slutade fungera." } }
        ],
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
          ["Shut down the time-dependent systems and wait for the receiver to settle; correcting live clocks could do more damage.", "Stäng ner de tidsberoende systemen och vänta på att mottagaren stabiliseras; att rätta klockor i drift kan göra mer skada."]
        ], {
          knowns: [["A single faulty receiver drove every clock wrong.", "En enda felaktig mottagare fick varje klocka att gå fel."]],
          uncertainties: [["What ran on the false date in the meantime.", "Vad som körts på det falska datumet under tiden."]],
          tradeoffs: {
            operational: ["A planned order is slower than forcing everything.", "En planerad ordning går långsammare än att tvinga igenom allt."],
            security: ["External time sources must be trustworthy and reachable.", "Externa tidskällor måste vara pålitliga och nåbara."],
            legal: ["Records with wrong timestamps may matter later.", "Poster med fel tidsstämplar kan spela roll senare."],
            reputational: ["The business wakes up at six.", "Verksamheten vaknar klockan sex."]
          },
          evaluation: [["Removes the bad source first, then corrects deliberately", "Tar bort den felaktiga källan först och rättar sedan avsiktligt"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["The receiver is unplugged", "Mottagaren kopplas ur"], [
              io(["Clocks come back", "Klockorna kommer tillbaka"], ["The time servers lock on to the external sources, and the first domain controllers show the right date. The night shift can sign in again.", "Tidsservrarna låser på de externa källorna, och de första domänkontrollanterna visar rätt datum. Nattskiftet kan logga in igen."], ["The time servers now follow external sources; the first sign-ins work.", "Tidsservrarna följer nu externa källor; de första inloggningarna fungerar."]),
              io(["Blocked outbound", "Stopp i brandväggen"], ["The time servers cannot reach any external source: outbound time traffic is blocked. The on-call network engineer does not answer the first three calls.", "Tidsservrarna når inga externa källor: utgående tidstrafik är blockerad. Nätverkets jourhavande tekniker svarar inte på de tre första samtalen."], ["Outbound time traffic was blocked and network on-call did not answer at first.", "Utgående tidstrafik var blockerad och nätverksjouren svarade inte först."], { reopen: true }),
              io(["Sources disagree", "Källorna är oense"], ["Two external sources differ by almost a second, and one keeps shifting. {{person.itOps.name}} is not sure which to trust, or whether that even matters tonight.", "Två externa källor skiljer sig åt med nästan en sekund, och den ena fortsätter att flytta sig. {{person.itOps.name}} är osäker på vilken man ska lita på, eller om det ens spelar roll i natt."], ["The external time sources disagree slightly; nobody is sure which to trust.", "De externa tidskällorna skiljer sig lite åt; ingen vet säkert vilken man ska lita på."])
            ]),
            ir("i2", { notChosen: "A" }, ["The receiver stays connected", "Mottagaren är kvar"], [
              io(["It looks better", "Det ser bättre ut"], ["After your change, the number of failed logons drops sharply. The night shift relaxes and someone starts writing the all-clear.", "Efter er åtgärd minskar antalet misslyckade inloggningar kraftigt. Nattskiftet slappnar av och någon börjar skriva att faran är över."], ["Failed logons dropped sharply after your change.", "De misslyckade inloggningarna minskade kraftigt efter er åtgärd."]),
              io(["The wrong date returns", "Fel datum kommer tillbaka"], ["The GPS receiver is still feeding both time servers. Every few minutes another system picks up the wrong date again, including some you thought were done.", "GPS-mottagaren matar fortfarande båda tidsservrarna. Med några minuters mellanrum får ännu ett system fel datum igen, även några som ni trodde var klara."], ["The faulty receiver is still connected and feeding the time servers.", "Den felaktiga mottagaren är fortfarande ansluten och matar tidsservrarna."], { reopen: true }),
              io(["A known fault", "Ett känt fel"], ["The receiver supplier's on-call line says the model has a known date fault. A fixed firmware version is planned, but not available yet.", "Jourlinjen hos mottagarens leverantör säger att modellen har ett känt datumfel. En rättad programvaruversion är planerad, men finns inte ännu."], ["The supplier confirmed a known date fault, with no fix available yet.", "Leverantören bekräftade ett känt datumfel, utan någon rättning ännu."])
            ])
          ],
          pushback: {
            A: [
              pb(["Blocked at the firewall", "Stoppad i brandväggen"], ["The time servers cannot reach any external source: the firewall blocks outbound time traffic. {{person.networkLead.name}} needs an emergency change, in the middle of the night, to the core network. Who approves it, and how fast?", "Tidsservrarna når inga externa källor: brandväggen blockerar utgående tidstrafik. {{person.networkLead.name}} behöver en akut ändring i kärnnätet mitt i natten. Vem godkänner den, och hur snabbt?"]),
              pb(["Opening the door to time", "Att öppna dörren för tiden"], ["{{person.ciso.name}} objects: an hour ago this looked like an attack, and now you are letting outside servers you do not control set the clock for the whole company. If someone wanted to manipulate time, is this the door?", "{{person.ciso.name}} invänder: för en timme sedan såg det här ut som ett angrepp, och nu låter ni externa servrar som ni inte kontrollerar ställa klockan för hela företaget. Om någon ville manipulera tiden, är det här dörren?"]),
              pb(["There is no list", "Det finns ingen lista"], ["A planned order needs a list of critical systems, and nobody has one. Drafting it will take time while {{num.servers}} servers still think it is twenty years from now. How long do you plan before you start correcting?", "En planerad ordning kräver en lista över kritiska system, och ingen har någon. Att ta fram den tar tid medan {{num.servers}} servrar fortfarande tror att det är tjugo år fram i tiden. Hur länge planerar ni innan ni börjar rätta?"])
            ],
            B: [
              pb(["The receiver pulls it back", "Mottagaren drar tillbaka den"], ["Within a minute of the forced push, the time servers sync with the GPS receiver again and send the wrong date straight back out. You corrected the symptom, not the source. Do you push again, or stop and deal with the receiver first?", "Inom en minut efter den påtvingade ändringen synkar tidsservrarna mot GPS-mottagaren igen och skickar ut det felaktiga datumet på nytt. Ni rättade symtomet, inte källan. Tvingar ni igenom igen, eller stannar ni och tar hand om mottagaren först?"]),
              pb(["Twenty years backwards", "Tjugo år bakåt"], ["Databases that wrote records with future dates now see time jump backwards. Replication starts treating new records as older than the ones from tonight. Do you carry on, or stop before the data gets more tangled?", "Databaser som skrev poster med framtida datum ser nu tiden hoppa bakåt. Replikeringen börjar behandla nya poster som äldre än nattens. Fortsätter ni, eller stoppar ni innan datan trasslar in sig mer?"]),
              pb(["No way back", "Ingen väg tillbaka"], ["{{person.itOps.name}} warns that a one-shot push to every server has no rollback: if it goes wrong, nobody will be able to sign in to fix it. They want a written go-ahead. Who signs it?", "{{person.itOps.name}} varnar för att en ändring på alla servrar på en gång saknar väg tillbaka: om det går fel kan ingen logga in och rätta det. {{person.itOps.name}} vill ha ett skriftligt klartecken. Vem skriver under?"])
            ],
            C: [
              pb(["Everything is time-dependent", "Allt är tidsberoende"], ["Sign-in, certificates, backups, logging, scheduling: almost everything depends on time. “Shut down the time-dependent systems” turns out to mean shutting down nearly the whole company. Where do you draw the line?", "Inloggning, certifikat, säkerhetskopiering, loggning, schemaläggning: nästan allt är beroende av tid. ”Stäng ner de tidsberoende systemen” visar sig betyda att stänga ner nästan hela företaget. Var drar ni gränsen?"]),
              pb(["Waiting on an old box", "Att vänta på en gammal låda"], ["{{person.facilities.name}} says the receiver is old, nobody knows what firmware it runs, and the supplier's support opens in the morning. There is no sign that it will “settle” by itself. How long do you wait on a device nobody can diagnose?", "{{person.facilities.name}} säger att mottagaren är gammal, att ingen vet vilken programvara den kör och att leverantörens support öppnar först på morgonen. Inget tyder på att den ”stabiliseras” av sig själv. Hur länge väntar ni på en apparat som ingen kan felsöka?"]),
              pb(["The business wakes up", "Verksamheten vaknar"], ["{{person.serviceOwner.name}} reminds you that the morning shift starts at six and will find systems down by your choice, not by the fault. They want a time when it will be back. What do you tell them?", "{{person.serviceOwner.name}} påminner om att morgonskiftet börjar klockan sex och kommer att hitta system som ligger nere på grund av ert beslut, inte felet. Hen vill veta när allt är tillbaka. Vad säger ni?"])
            ]
          }
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
        reconsider: { decision: "d2", pressure: { en: "Two years of logs are gone. If you corrected the clocks in a planned order, the jobs ran while you were still planning. If you forced every server at once, the jump itself set half of them off.", sv: "Två års loggar är borta. Om ni rättade klockorna i planerad ordning körde jobben medan ni fortfarande planerade. Om ni tvingade in tiden på alla servrar på en gång satte själva hoppet igång hälften av dem." } },
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
          ["Leave the jobs running, because backups and invoicing depend on them, but have someone watch every run today.", "Låt jobben gå, eftersom säkerhetskopior och fakturering är beroende av dem, men låt någon bevaka varje körning i dag."]
        ], {
          knowns: [["Retention jobs deleted data on the false date.", "Gallringsjobb raderade data på det falska datumet."]],
          uncertainties: [["What other jobs acted on the false date.", "Vilka andra jobb som agerade på det falska datumet."]],
          tradeoffs: {
            operational: ["Pausing jobs stops normal processing today.", "Att pausa jobb stoppar den normala behandlingen i dag."],
            security: ["Lost logs leave a gap in your ability to investigate.", "Förlorade loggar lämnar en lucka i er förmåga att utreda."],
            legal: ["Deleted records under a legal hold need explaining.", "Raderade poster under ett bevarandebeslut måste förklaras."],
            reputational: ["Nobody outside knows yet.", "Ingen utanför vet ännu."]
          },
          evaluation: [["Stops automation acting on bad assumptions and documents the loss", "Stoppar automatik som agerar på felaktiga antaganden och dokumenterar förlusten"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["The schedulers are paused", "Schemaläggarna pausas"], [
              io(["Caught in time", "Stoppat i tid"], ["Pausing the schedulers catches a second retention run queued for the top of the hour on a server whose clock is still wrong. It never starts.", "Pausen av schemaläggarna fångar en andra gallringskörning som låg i kö till nästa hel timme på en server som fortfarande har fel tid. Den startar aldrig."], ["A second retention run was stopped before it started.", "En andra gallringskörning stoppades innan den startade."]),
              io(["Backups paused too", "Säkerhetskopieringen pausad"], ["Tonight's backup run was among the paused jobs. Until someone decides to exempt it, there is no fresh copy of anything since the deletion.", "Nattens säkerhetskopiering var ett av de pausade jobben. Tills någon beslutar att undanta den finns ingen ny kopia av något sedan raderingen."], ["Tonight's backup was paused along with the other jobs.", "Nattens säkerhetskopiering pausades tillsammans med de andra jobben."], { reopen: true }),
              io(["A partial copy", "En ofullständig kopia"], ["The SIEM kept summary copies of some of the deleted logs, but not the raw entries. {{person.legal.name}} cannot yet say whether that satisfies the legal hold.", "SIEM-systemet sparade sammanfattningar av en del av de raderade loggarna, men inte råposterna. {{person.legal.name}} kan ännu inte säga om det räcker för bevarandebeslutet."], ["Summary copies of some deleted logs exist; their legal value is unclear.", "Sammanfattningar av en del raderade loggar finns; deras rättsliga värde är oklart."])
            ]),
            ir("i2", { notChosen: "A" }, ["The automation keeps running", "Automatiken fortsätter"], [
              io(["A clean run", "En felfri körning"], ["The next scheduled backup runs on a corrected server and reports success. To some in the room, that proves the jobs are safe again.", "Nästa schemalagda säkerhetskopiering körs på en rättad server och rapporterar att den lyckades. För några i rummet bevisar det att jobben är säkra igen."], ["The first backup after the correction completed normally.", "Den första säkerhetskopieringen efter rättningen gick normalt."]),
              io(["Another clean-up", "Ännu en städning"], ["A clean-up job on a server that still has the wrong date deletes years of archived service tickets it believes have expired.", "Ett städjobb på en server som fortfarande har fel datum raderar flera års arkiverade ärenden som det tror har gått ut."], ["A second clean-up job deleted archived service tickets.", "Ett andra städjobb raderade arkiverade ärenden."], { reopen: true }),
              io(["No full list", "Ingen komplett lista"], ["{{person.legal.name}} asks for a written list of everything automated that ran overnight. IT can name the retention jobs, but not what else may have fired.", "{{person.legal.name}} ber om en skriftlig lista över allt automatiskt som kördes under natten. IT kan namnge gallringsjobben, men inte vad mer som kan ha startat."], ["Nobody can yet list every automated job that ran overnight.", "Ingen kan ännu lista alla automatiska jobb som kördes under natten."])
            ])
          ],
          pushback: {
            A: [
              pb(["Tonight's backups", "Nattens säkerhetskopior"], ["Pausing all date-driven jobs also pauses tonight's backups, on the night after the oldest sets were deleted. You would have fewer copies than ever. Do you exempt backups, and how do you know they are safe to run?", "Att pausa alla datumstyrda jobb pausar också nattens säkerhetskopiering, natten efter att de äldsta kopiorna raderades. Ni skulle ha färre kopior än någonsin. Undantar ni säkerhetskopieringen, och hur vet ni att den är säker att köra?"]),
              pb(["What counts as date-driven?", "Vad räknas som datumstyrt?"], ["Nobody has a list. There are schedulers in every team, and some jobs belong to business systems IT does not run. Finding them all will take hours. Who goes through them, and who decides which are safe?", "Ingen har någon lista. Det finns schemaläggare i varje team, och en del jobb tillhör verksamhetssystem som IT inte driver. Att hitta alla tar timmar. Vem går igenom dem, och vem avgör vilka som är säkra?"]),
              pb(["A record that will be used", "En dokumentation som kommer att användas"], ["{{person.legal.name}} warns that writing down exactly what was lost and why creates a record the other side in the dispute will read. Some want it kept short. Do you document fully, knowing who will see it?", "{{person.legal.name}} varnar för att en exakt beskrivning av vad som förlorades och varför blir ett dokument som motparten i tvisten kommer att läsa. Några vill hålla det kort. Dokumenterar ni fullständigt, med vetskap om vem som kommer att se det?"])
            ],
            B: [
              pb(["Restoring the future", "Att återställa framtiden"], ["The newest remaining backups were taken tonight, on the false date. Restoring them brings back records stamped twenty years ahead, and the jobs that read them may fire again. Do you still restore, and from which copy?", "De nyaste kvarvarande säkerhetskopiorna togs i natt, på det falska datumet. Att återställa dem tar tillbaka poster stämplade tjugo år framåt, och jobben som läser dem kan starta igen. Återställer ni ändå, och från vilken kopia?"]),
              pb(["Carry on with what?", "Fortsätta med vad?"], ["The retention jobs that did the damage are still scheduled, and nobody has checked what else ran tonight. “Carry on” means trusting automation that has just deleted two years of logs. Are you sure nothing else is waiting to fire?", "Gallringsjobben som orsakade skadan är fortfarande schemalagda, och ingen har kontrollerat vad mer som kördes i natt. ”Fortsätta” betyder att lita på automatik som just raderat två års loggar. Är ni säkra på att inget annat väntar på att starta?"]),
              pb(["The legal hold", "Bevarandebeslutet"], ["{{person.legal.name}} says the deleted logs under legal hold must be explained to the other party, with what happened and when. “We restored and carried on” is not an explanation. Who writes it, and on what record?", "{{person.legal.name}} säger att de raderade loggarna under bevarandebeslutet måste förklaras för motparten, med vad som hände och när. ”Vi återställde och fortsatte” är ingen förklaring. Vem skriver den, och utifrån vilken dokumentation?"])
            ],
            C: [
              pb(["Too fast to watch", "För snabbt för att bevaka"], ["Last night's retention job finished in minutes. By the time someone watching recognises a wrong run, the damage is done. Can a person really stop a job mid-run, or are you just watching it happen?", "Nattens gallringsjobb blev klart på några minuter. När den som bevakar har förstått att en körning är fel är skadan redan skedd. Kan en människa verkligen stoppa ett jobb mitt i, eller ser ni bara på när det händer?"]),
              pb(["Not every clock is fixed", "Alla klockor är inte rättade"], ["Only the most important systems have the right time so far. Jobs on the rest still believe it is twenty years from now and will act on it. Do you let those run too?", "Hittills har bara de viktigaste systemen rätt tid. Jobben på resten tror fortfarande att det är tjugo år fram i tiden och kommer att agera därefter. Låter ni även dem köra?"]),
              pb(["Who stays awake?", "Vem håller sig vaken?"], ["The night shift has been up since three. Watching every run today means someone alert all day, and {{person.itOps.name}} says nobody is fit to do it. Who watches, and who answers if they miss one?", "Nattskiftet har varit uppe sedan tre. Att bevaka varje körning i dag kräver att någon är skärpt hela dagen, och {{person.itOps.name}} säger att ingen är i skick för det. Vem bevakar, och vem står till svars om något missas?"])
            ]
          }
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
        reconsider: { decision: "d1", pressure: { en: "The payroll file left at 03:40, while you were still deciding what this was. If you declared an attack, the bank saw an outage and asked no questions. If you checked first, nobody stopped the batch.", sv: "Lönefilen gick i väg 03.40, medan ni fortfarande avgjorde vad det här var. Om ni utlyste ett angrepp såg banken ett avbrott och ställde inga frågor. Om ni kontrollerade först var det ingen som stoppade körningen." } },
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because the clocks were corrected in a planned order, payroll and invoicing still ran on the false date while you worked down the list.", sv: "Eftersom klockorna rättades i planerad ordning körde lön och fakturering fortfarande på det falska datumet medan ni betade av listan." } }
        ],
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
          ["Leave the invoices and send one short explanation to all customers; crediting {{num.invoices|number}} invoices would tie finance up for weeks.", "Låt fakturorna vara och skicka en kort förklaring till alla kunder; att kreditera {{num.invoices|number}} fakturor skulle binda upp ekonomi i veckor."]
        ], {
          knowns: [["Real money and real documents went out on the false date.", "Riktiga pengar och riktiga dokument gick ut på det falska datumet."]],
          uncertainties: [["What else outside IT acted on it.", "Vad mer utanför IT som agerade på det."]],
          tradeoffs: {
            operational: ["Crediting thousands of invoices is days of work.", "Att kreditera tusentals fakturor är flera dagars arbete."],
            security: ["Customers suspecting fraud is a reputational risk and a phishing opportunity for others.", "Kunder som misstänker bedrägeri är en anseenderisk och en möjlighet för nätfiske från andra."],
            legal: ["Invoices and payroll have accounting and tax rules.", "Fakturor och löner har bokförings- och skatteregler."],
            reputational: ["Silence makes the strange invoices look like a scam.", "Tystnad får de konstiga fakturorna att se ut som ett bedrägeri."]
          },
          evaluation: [["Reverses business effects quickly and explains them plainly", "Gör verksamhetens följder ogjorda snabbt och förklarar dem enkelt"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Calling it all back", "Att ropa tillbaka allt"], [
              io(["Held in time", "Stoppad i tid"], ["The bank confirms the payroll file is held before its cut-off. Nothing has left your account, and {{person.cfo.name}} breathes out.", "Banken bekräftar att lönefilen är stoppad före brytpunkten. Inget har lämnat ert konto, och {{person.cfo.name}} andas ut."], ["The bank held the payroll file before it executed.", "Banken stoppade lönefilen innan den genomfördes."]),
              io(["Credit notes quarantined", "Kreditnotor i karantän"], ["Several customers' mail filters quarantine your credit notes as phishing, and one customer's security team reports your domain as a scam.", "Flera kunders e-postfilter lägger era kreditnotor i karantän som nätfiske, och säkerhetsteamet hos en kund anmäler er domän som bedrägeri."], ["Some customers' filters flagged your credit notes as phishing.", "En del kunders filter flaggade era kreditnotor som nätfiske."], { reopen: true, meters: { trust: -1 } }),
              io(["Ahead of the briefing", "Före informationen"], ["Staff hear that pay has been “stopped” before your briefing reaches them. A union representative asks whether salaries will be late this month.", "Personalen hör att lönen har ”stoppats” innan er information når dem. En fackligt förtroendevald frågar om lönen blir sen den här månaden."], ["Staff heard about the stopped pay before your briefing reached them.", "Personalen hörde om den stoppade lönen innan er information nådde dem."])
            ]),
            ir("i2", { notChosen: "A" }, ["Not everything called back", "Allt ropas inte tillbaka"], [
              io(["Customers shrug", "Kunderna rycker på axlarna"], ["Most customers' finance teams reply that they will simply ignore the odd invoice. It feels like the problem is fading on its own.", "De flesta kunders ekonomiavdelningar svarar att de helt enkelt bortser från den konstiga fakturan. Det känns som om problemet försvinner av sig självt."], ["Most customers say they will ignore the odd invoices.", "De flesta kunder säger att de bortser från de konstiga fakturorna."]),
              io(["Reported as a scam", "Rapporterat som bedrägeri"], ["A regional news site reports that customers of {{org.name}} are receiving suspicious invoices dated decades ahead, and advises readers not to pay.", "En regional nyhetssajt rapporterar att kunder till {{org.name}} får misstänkta fakturor daterade årtionden framåt och avråder läsarna från att betala."], ["A news site has reported your invoices as a possible scam.", "En nyhetssajt har rapporterat era fakturor som ett möjligt bedrägeri."], { reopen: true, meters: { media: 1, trust: -1 } }),
              io(["Staff are asking", "Personalen frågar"], ["Staff are asking in the lunchroom chat whether this month's salary has already been paid. Nobody has told them anything, and guesses are spreading.", "Personalen frågar i fikarummets chatt om månadens lön redan har betalats ut. Ingen har sagt något till dem, och gissningarna sprids."], ["Staff are asking whether pay has gone out; nobody has answered.", "Personalen frågar om lönen har betalats ut; ingen har svarat."])
            ])
          ],
          pushback: {
            A: [
              pb(["Payday still comes", "Lönedagen kommer ändå"], ["Payroll says a correct new file will take days to produce and check. Stopping this one means staff may be paid late, some of them with rent due. Do you still stop it, and what do you promise staff?", "Löneavdelningen säger att en ny, korrekt fil tar flera dagar att ta fram och kontrollera. Att stoppa den här betyder att personalen kan få lönen sent, en del med hyran som ska betalas. Stoppar ni den ändå, och vad lovar ni personalen?"]),
              pb(["Credit notes look strange too", "Kreditnotor ser också konstiga ut"], ["Customers who already suspect a scam will now receive a second wave of unexpected documents from you on the same day. Some will report those too. How do you make the correction believable?", "Kunder som redan misstänker bedrägeri kommer nu att få en andra våg av oväntade dokument från er samma dag. En del kommer att anmäla även dem. Hur gör ni rättelsen trovärdig?"]),
              pb(["Two signatures", "Två underskrifter"], ["The bank will only stop the file with written confirmation from two authorised signatories before its cut-off. {{person.cfo.name}} is one; the other is on holiday abroad and not answering. Who else can sign, and is that allowed?", "Banken stoppar bara filen med skriftlig bekräftelse från två behöriga firmatecknare före sin brytpunkt. {{person.cfo.name}} är en; den andra är på semester utomlands och svarar inte. Vem mer kan skriva under, och är det tillåtet?"])
            ],
            B: [
              pb(["Paid twice", "Betalt två gånger"], ["On the real payday, the normal payroll job will run again. Unless someone remembers to cancel it, staff get paid twice, and recovering money from employees is slow and painful. Who owns making sure that does not happen?", "På den riktiga lönedagen körs det vanliga lönejobbet igen. Om ingen kommer ihåg att avbryta det får personalen betalt två gånger, och att kräva tillbaka pengar från anställda är långsamt och plågsamt. Vem ansvarar för att det inte händer?"]),
              pb(["Are the amounts even right?", "Stämmer ens beloppen?"], ["The file was calculated on a false date. Hours, overtime, leavers and new starters may all be wrong for this month. Do you send out salaries that nobody has checked?", "Filen beräknades på ett falskt datum. Timmar, övertid, de som slutat och de som börjat kan alla vara fel för den här månaden. Skickar ni ut löner som ingen har kontrollerat?"]),
              pb(["The accountant objects", "Redovisningen invänder"], ["Your accountant warns that an early salary payment falls in the wrong period for tax and reporting, and correcting it afterwards means amending filings. Is “recover the difference later” as simple as it sounded?", "Er redovisningsansvarige varnar för att en tidig löneutbetalning hamnar i fel period för skatt och rapportering, och att rätta det i efterhand innebär ändrade deklarationer. Är ”reglera skillnaden senare” så enkelt som det lät?"])
            ],
            C: [
              pb(["“Ignore our invoices”", "”Bortse från våra fakturor”"], ["A mass email telling customers to ignore an invoice is exactly what fraudsters send. One customer's security team has already flagged your explanation as suspicious. How are customers meant to know it is really you?", "Ett massutskick som ber kunderna bortse från en faktura är precis vad bedragare skickar. Säkerhetsteamet hos en kund har redan flaggat er förklaring som misstänkt. Hur ska kunderna veta att det verkligen är ni?"]),
              pb(["Invoices stay in the books", "Fakturorna står kvar i böckerna"], ["{{person.cfo.name}}'s team points out that issued invoices remain in your accounts until they are credited. Leaving {{num.invoices|number}} invalid invoices in place breaks the bookkeeping, and the auditors will find them. Is weeks of work really avoidable?", "{{person.cfo.name}}s team påpekar att utställda fakturor står kvar i bokföringen tills de krediteras. Att låta {{num.invoices|number}} ogiltiga fakturor ligga kvar bryter mot bokföringen, och revisorerna kommer att hitta dem. Går veckors arbete verkligen att undvika?"]),
              pb(["The big customers want more", "De stora kunderna vill ha mer"], ["Your largest customers say an email is not enough: their procurement will not process anything further from you until the faulty invoice is formally cancelled. Do you make exceptions, and for whom?", "Era största kunder säger att ett mejl inte räcker: deras inköp behandlar inget mer från er förrän den felaktiga fakturan är formellt makulerad. Gör ni undantag, och i så fall för vilka?"])
            ]
          }
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
        reconsider: { decision: "d3", pressure: { en: "The telecom authority says the interference may return any night. Do your rules for date-driven jobs still hold if it happens on payday?", sv: "Telemyndigheten säger att störningarna kan komma tillbaka vilken natt som helst. Håller era regler för datumstyrda jobb även om det händer på lönedagen?" } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because payroll was stopped, staff were paid two days late. The union wants compensation and a written apology.", sv: "Eftersom lönen stoppades fick personalen betalt två dagar för sent. Facket kräver ersättning och en skriftlig ursäkt." } }
        ],
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
          evaluation: [["Builds redundancy and sanity checks into a foundation everyone trusts", "Bygger in redundans och rimlighetskontroller i en grund som alla litar på"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Three sources", "Tre källor"], [
              io(["The test holds", "Testet håller"], ["In a planned test, {{person.networkLead.name}} disconnects the antenna. The time servers stay on the other sources and no clock moves.", "I ett planerat test kopplar {{person.networkLead.name}} bort antennen. Tidsservrarna håller sig till de andra källorna och ingen klocka rör sig."], ["A test with the antenna disconnected kept every clock steady.", "Ett test med antennen bortkopplad höll varje klocka stadig."]),
              io(["The vendor says no", "Leverantören säger nej"], ["The production line vendor says any change to the controllers' time settings voids the warranty. The plan cannot cover every system as written.", "Leverantören av produktionslinjen säger att varje ändring av styrsystemens tidsinställningar upphäver garantin. Planen kan inte täcka alla system som den är skriven."], ["The production vendor refuses time changes without voiding the warranty.", "Produktionsleverantören vägrar tidsändringar utan att garantin upphör."], { reopen: true }),
              io(["Noisy alerts", "Larm som larmar för mycket"], ["The new drift alerts fire dozens of times in the first week, mostly from cameras with cheap clocks. The SOC has started muting some of them.", "De nya larmen för avvikelser går dussintals gånger första veckan, mest från kameror med billiga klockor. SOC har börjat tysta en del av dem."], ["The new drift alerts are noisy and some are being muted.", "De nya avvikelselarmen är högljudda och en del tystas."])
            ]),
            ir("i2", { notChosen: "A" }, ["One source, no checks", "En källa, inga kontroller"], [
              io(["Incident closed", "Incidenten stängd"], ["The board welcomes a quick, cheap fix and closes the incident. Nobody asks again about doors, cameras or production.", "Styrelsen välkomnar en snabb och billig lösning och stänger incidenten. Ingen frågar igen om dörrar, kameror eller produktion."], ["The board has closed the incident on the quick fix.", "Styrelsen har stängt incidenten med den snabba lösningen."]),
              io(["The auditor's finding", "Revisorns anmärkning"], ["The external auditor lists time as a single point of failure in the management letter, naming doors and production. The board wants an answer before the next meeting.", "Den externa revisorn tar upp tid som en enskild felpunkt i sin rapport till ledningen, med dörrar och produktion nämnda. Styrelsen vill ha ett svar före nästa möte."], ["The auditor flagged time as a single point of failure.", "Revisorn har pekat ut tid som en enskild felpunkt."], { reopen: true }),
              io(["Interference again", "Störning igen"], ["The telecom authority reports another night of interference. This time no clock moved, but nobody can say why, and nothing would have stopped it if one had.", "Telemyndigheten rapporterar ännu en natt med störningar. Den här gången rörde sig ingen klocka, men ingen kan säga varför, och inget hade stoppat det om någon hade gjort det."], ["Interference returned for a night; no clock moved, and nobody knows why.", "Störningen kom tillbaka en natt; ingen klocka rörde sig, och ingen vet varför."])
            ])
          ],
          pushback: {
            A: [
              pb(["Which three?", "Vilka tre?"], ["A second satellite antenna fails in the same interference, and internet time depends on the network staying up. Truly independent sources cost money and need people who understand them. Do you know what “independent” means for you?", "En andra satellitantenn fallerar i samma störning, och tid från internet är beroende av att nätet fungerar. Verkligt oberoende källor kostar pengar och kräver folk som förstår dem. Vet ni vad ”oberoende” betyder för er?"]),
              pb(["Limits block the fix", "Gränserna stoppar rättningen"], ["With limits on how far clocks may jump, the next time a clock is badly wrong, systems will refuse the correction too. Someone must override hundreds of servers by hand, at night. Is the limit protecting you, or trapping you?", "Med gränser för hur långt klockor får hoppa kommer systemen nästa gång en klocka går rejält fel att vägra även rättningen. Någon måste åsidosätta hundratals servrar för hand, på natten. Skyddar gränsen er, eller fångar den er?"]),
              pb(["Every job owner must change", "Varje jobbägare måste ändra"], ["Making date-driven jobs check before acting means changing scripts owned by different teams and products owned by suppliers. The payroll supplier says it is not on their roadmap. Who pays, and what do you do until then?", "Att låta datumstyrda jobb kontrollera innan de agerar innebär ändringar i skript som ägs av olika team och produkter som ägs av leverantörer. Lönesystemets leverantör säger att det inte finns i deras planer. Vem betalar, och vad gör ni fram till dess?"])
            ],
            B: [
              pb(["Same sky", "Samma himmel"], ["The telecom authority says the interference may return any night. A better receiver still loses the signal when the sky is jammed. What does it do then, and what do your fourteen systems do?", "Telemyndigheten säger att störningen kan komma tillbaka vilken natt som helst. En bättre mottagare tappar ändå signalen när himlen störs. Vad gör den då, och vad gör era fjorton system?"]),
              pb(["Who looks after it?", "Vem sköter den?"], ["The old receiver sat on the roof for years with nobody updating it. {{person.facilities.name}} asks who will own the new one: firmware, monitoring, replacement. Without an owner, will the new box not age the same way?", "Den gamla mottagaren satt på taket i flera år utan att någon uppdaterade den. {{person.facilities.name}} frågar vem som ska äga den nya: programvara, övervakning, utbyte. Utan en ägare, åldras inte den nya lådan på samma sätt?"]),
              pb(["Nothing checks the answer", "Ingenting kontrollerar svaret"], ["Doors, cameras and production controllers will still take whatever time the new receiver gives them, with no limits and no alerts. A better box does not change that. If it is ever wrong, who notices?", "Dörrar, kameror och produktionsstyrning tar fortfarande den tid som den nya mottagaren ger dem, utan gränser och utan larm. En bättre låda ändrar inte det. Om den någon gång har fel, vem märker det?"])
            ],
            C: [
              pb(["Production has no internet", "Produktionen har inget internet"], ["Door access and the production line controllers sit on isolated networks for good reason. Giving them internet time means opening them up. {{person.ciso.name}} refuses. What do those systems use instead?", "Passersystemet och styrsystemen i produktionen ligger på isolerade nät av goda skäl. Att ge dem tid från internet innebär att öppna upp dem. {{person.ciso.name}} vägrar. Vad ska de systemen använda i stället?"]),
              pb(["Still one source", "Fortfarande en källa"], ["A single public time source is still a single source. If it is unreachable or someone feeds it false time, every clock follows, just as they did last week. Have you moved the antenna, or removed the risk?", "En enda publik tidskälla är fortfarande en enda källa. Om den inte går att nå eller någon matar den med falsk tid följer varje klocka efter, precis som förra veckan. Har ni flyttat antennen, eller tagit bort risken?"]),
              pb(["When the network goes", "När nätet försvinner"], ["In a network outage, every clock drifts with nothing to check against, and sign-in depends on time. The failure you would need to recover from is the one that cuts you off from your time source. How do you recover then?", "Vid ett nätverksavbrott driver varje klocka utan något att jämföra med, och inloggningen är beroende av tiden. Felet som ni skulle behöva återhämta er från är just det som skär av er från tidskällan. Hur återhämtar ni er då?"])
            ]
          }
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
