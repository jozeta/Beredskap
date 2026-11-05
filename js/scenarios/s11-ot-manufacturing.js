/*
 * s11-ot-manufacturing.js — "The Line Stops at 03:00" (archetype B, OT/ICS).
 *
 * Ambiguous start: controllers on a production line are intermittently
 * unreachable → IT wants to isolate, operations warns that isolation threatens
 * safe production → an engineering workstation pushed modified logic → it was
 * reached from the IT network → a safety trip was bypassed → regulators and the
 * OT vendor gate the restart → clean logic is weeks old → the same image exists
 * at a sister plant → the commercial aftermath.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s11-ot-manufacturing",
    version: 1,
    category: "ot-ics",
    archetype: "ambiguous-start",
    emblem: "ot",
    title: L(["The Line Stops at 03:00", "Linjen stannar klockan 03.00"]),
    summary: L([
      "Night shift. A production line stops because its controllers keep dropping off the network. IT sees malware; operations sees a safety risk in pulling cables. Both are partly right.",
      "Nattskift. En produktionslinje stannar eftersom styrsystemen gång på gång tappar kontakten med nätverket. IT ser skadekod; produktionen ser en säkerhetsrisk i att dra ur sladdar. Båda har delvis rätt."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Contain an OT incident without creating a safety hazard", "Begränsa en OT-incident utan att skapa en säkerhetsrisk"]), teaser: L(["Acting without creating new dangers", "Att agera utan att skapa nya faror"]) },
      { id: "lo2", text: L(["Let IT and operations share decision-making", "Låta IT och produktion dela på besluten"]), teaser: L(["Two worlds, one decision", "Två världar, ett beslut"]) },
      { id: "lo3", text: L(["Find and close the IT/OT boundary breach", "Hitta och stänga intrånget i gränsen mellan IT och OT"]), teaser: L(["Finding the way in", "Att hitta vägen in"]) },
      { id: "lo4", text: L(["Restart production under uncertainty", "Starta produktionen igen under osäkerhet"]), teaser: L(["Starting again without certainty", "Att starta om utan att vara säker"]) }
    ],
    mitre: ["T0886", "T0866", "T0831", "T0880", "T0816", "T1021", "T1078"],
    frameworks: {
      nistCsf: ["GV.RR", "ID.AM", "PR.AA", "PR.PS", "PR.IR", "DE.CM", "RS.MA", "RS.MI", "RC.RP"],
      iso27001: ["A.5.24", "A.5.26", "A.5.29", "A.5.30", "A.8.9", "A.8.13", "A.8.20", "A.8.22", "A.8.32"]
    },
    minStages: 4,
    maxStages: 9,
    constraints: { startWindow: "night", startTime: "03:00", sectors: ["manufacturing", "energy", "utilities"] },
    actor: { types: ["unknown", "state"], motivation: L(["Unclear: reconnaissance and manipulation of industrial processes", "Oklar: kartläggning och manipulation av industriella processer"]), capability: "high" },
    variables: {
      plcs: { min: 6, max: 60, scaleBy: "size" },
      lossPerHour: { min: 80000, max: 3000000, step: 10000, scaleBy: "size", currency: true },
      batchValue: { min: 200000, max: 9000000, step: 50000, scaleBy: "size", currency: true },
      backupWeeks: { min: 3, max: 11 },
      ewsDays: { min: 8, max: 40 }
    },
    roles: ["incidentCommander", "otEngineer", "itOps", "networkLead", "ciso", "socLead", "serviceOwner", "supplierManager", "comms", "ceo"],

    groundTruth: {
      rootCause: L([
        "An attacker reached an engineering workstation in the plant from an IT jump server through a remote-desktop rule that had been opened for a vendor and never closed. About {{num.ewsDays}} days later they used the workstation's engineering software to push modified logic to controllers on line 3 and disable a safety trip. The intermittent communication losses were the controllers restarting after logic downloads.",
        "En angripare nådde en ingenjörsarbetsstation i fabriken från en hoppserver i IT-nätet via en regel för fjärrskrivbord som hade öppnats för en leverantör och aldrig stängts. Ungefär {{num.ewsDays}} dagar senare använde de arbetsstationens ingenjörsprogram för att skicka ändrad logik till styrsystemen på linje 3 och koppla bort ett säkerhetsstopp. De återkommande avbrotten i kommunikationen var styrsystemen som startade om efter nedladdningarna av logik."
      ]),
      attackerTimeline: [
        { at: -86400, text: L(["Remote-desktop rule from IT to the engineering workstation opened for a vendor; never closed.", "En regel för fjärrskrivbord från IT till ingenjörsarbetsstationen öppnas för en leverantör; den stängs aldrig."]) },
        { at: -57600, text: L(["Attacker reaches the IT jump server.", "Angriparen når hoppservern i IT-nätet."]) },
        { at: -43200, text: L(["First session from the jump server to the engineering workstation.", "Första sessionen från hoppservern till ingenjörsarbetsstationen."]) },
        { at: -90, text: L(["Modified logic downloaded to line 3 controllers; safety trip setting changed.", "Ändrad logik laddas ned till styrsystemen på linje 3; inställningen för säkerhetsstoppet ändras."]) },
        { at: 0, text: L(["Controllers restart repeatedly; line 3 stops.", "Styrsystemen startar om upprepade gånger; linje 3 stannar."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-ews", revealStage: "p3", text: L(["Modified logic was downloaded to the controllers from an engineering workstation.", "Ändrad logik har laddats ned till styrsystemen från en ingenjörsarbetsstation."]) },
      { id: "hf-boundary", revealStage: "p4", text: L(["The engineering workstation was reached from the IT network through a forgotten remote-desktop rule.", "Ingenjörsarbetsstationen nåddes från IT-nätet via en bortglömd regel för fjärrskrivbord."]) },
      { id: "hf-safety", revealStage: "p5", text: L(["A safety trip on line 3 was disabled in the modified logic.", "Ett säkerhetsstopp på linje 3 kopplades bort i den ändrade logiken."]) },
      { id: "hf-sister", revealStage: "p8", text: L(["The sister plant uses the same workstation image and firewall rule.", "Systerfabriken använder samma avbild för arbetsstationer och samma brandväggsregel."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Line 3 has stopped", "Linje 3 har stannat"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. On the night shift at {{org.name}}, line 3 stops. The line has gone into a safe stop, with a batch half-way through the process.\n\nOn the operator screens, the line's controllers keep dropping off the network and coming back, again and again. Lines 1 and 2 are still running. The shift leader calls IT on-call and the OT engineer, and each of them has a different first guess.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. Under nattskiftet hos {{org.name}} stannar linje 3. Linjen har gått till ett säkert stopp, med en batch halvvägs genom processen.\n\nPå operatörsskärmarna tappar linjens styrsystem kontakten med nätverket och kommer tillbaka, om och om igen. Linje 1 och 2 går fortfarande. Skiftledaren ringer IT-jouren och OT-ingenjören, och de har var sin första gissning."
        ]),
        injects: [
          inj("i1-1", 0, "impactReport", "person.otEngineer", "high", "confirmed", [
            "Line 3 controllers lose communication every few minutes and restart. The line is in a safe stop. A batch worth {{num.batchValue|currency}} is mid-process.",
            "Styrsystemen på linje 3 tappar kommunikationen med några minuters mellanrum och startar om. Linjen står i säkert stopp. En batch värd {{num.batchValue|currency}} är mitt i processen."
          ], { fallbackRole: "serviceOwner", tests: ["lo1"] }),
          inj("i1-2", 20, "siemAlert", "soc", "medium", "unverified", [
            "Unusual traffic between the IT network and the plant network around {{time.T-90|clock}}. Not enough detail to say more.",
            "Ovanlig trafik mellan IT-nätet och fabriksnätet runt klockan {{time.T-90|clock}}. För lite detaljer för att säga mer."
          ], { statedReliability: ["Low confidence", "Låg tillförlitlighet"], tests: ["lo3"] }),
          inj("i1-3", 30, "chat", "person.serviceOwner", "medium", "misleading", [
            "“This happens when the switches in hall 3 get warm. Restart them and let's get the line going.”",
            "”Det här händer när switcharna i hall 3 blir varma. Starta om dem så får vi igång linjen.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Plausible operational explanation that is wrong. A restart would also wipe volatile evidence on the switches.", "En rimlig förklaring från driften som är fel. En omstart skulle också radera flyktiga spår i switcharna."], tests: ["lo2"] })
        ],
        charts: [{
          id: "c1-comm", type: "line", markers: "injects",
          title: L(["Controller communication losses per 10 minutes", "Kommunikationsavbrott i styrsystemen per tio minuter"]), unit: L(["losses", "avbrott"]),
          data: line(["Communication losses", "Kommunikationsavbrott"], -120, 40, 10, (x, ctx) => (x < -90 ? 0 : 2 + ctx.rng.int(0, 4) + (x > -10 ? 4 : 0)))
        }],
        questions: {
          technical: [
            q("Is this a network fault, a device fault or something else — how do you tell without touching it?", "Är det här ett nätverksfel, ett enhetsfel eller något annat – hur avgör ni det utan att röra något?", ["otEngineer", "networkLead"]),
            q("What would isolating the plant network from IT break?", "Vad skulle det slå ut att isolera fabriksnätet från IT?", ["otEngineer", "networkLead"]),
            q("Who is allowed to touch the controllers?", "Vem får röra styrsystemen?", ["otEngineer", "socLead"])
          ],
          executive: [
            q("Who decides in the plant at night — IT or the shift manager?", "Vem bestämmer i fabriken på natten – IT eller skiftledaren?", ["serviceOwner", "incidentCommander"]),
            q("What does each hour of stoppage cost, and when does the batch spoil?", "Vad kostar varje timmes stopp, och när förstörs batchen?", ["serviceOwner", "ceo"]),
            q("Who must be woken: plant manager, security, the OT vendor?", "Vilka måste väckas: fabrikschefen, säkerhet, OT-leverantören?", ["incidentCommander"])
          ]
        },
        challenges: [ch("Restarting the switches would probably get the line running — and erase evidence.", "En omstart av switcharna skulle troligen få igång linjen – och radera spår.")],
        decision: dec("d1", "incidentCommander", ["What do you do first?", "Vad gör ni först?"], [
          ["Keep the line in safe stop, preserve evidence and disconnect the plant network from IT.", "Behåll linjen i säkert stopp, säkra spår och koppla bort fabriksnätet från IT."],
          ["Restart the network switches, the likeliest cause of a controller dropout, and resume once the line reports healthy.", "Starta om nätverksswitcharna, den troligaste orsaken till att styrsystem tappar kontakten, och återuppta när linjen rapporterar normalt läge."],
          ["Keep the line in safe stop and investigate before changing anything.", "Behåll linjen i säkert stopp och utred innan något ändras."]
        ], {
          knowns: [["Line 3 controllers restart repeatedly.", "Styrsystemen på linje 3 startar om upprepade gånger."], ["Unusual IT-to-plant traffic was seen.", "Ovanlig trafik mellan IT och fabrik har setts."]],
          uncertainties: [["Whether this is an attack.", "Om det här är ett angrepp."]],
          tradeoffs: {
            operational: ["Disconnecting IT may stop other lines and reporting.", "Att koppla bort IT kan stoppa andra linjer och rapportering."],
            security: ["A restart destroys evidence and may resume a manipulated process.", "En omstart förstör spår och kan återuppta en manipulerad process."],
            legal: ["Safety obligations come before production.", "Säkerhetsskyldigheter går före produktionen."],
            reputational: ["Late deliveries to customers have penalties.", "Försenade leveranser till kunder ger viten."]
          },
          evaluation: [["Keeps safety first", "Sätter säkerheten först"], ["Involves operations in the containment decision", "Involverar produktionen i beslutet om begränsning"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["After the cut", "Efter frånkopplingen"], [
              io(["The traffic stops", "Trafiken upphör"], ["The SOC sees no more traffic between IT and the plant. Someone on the call says the problem is solved, but line 3's controllers are still dropping off.", "SOC ser ingen mer trafik mellan IT och fabriken. Någon i samtalet säger att problemet är löst, men styrsystemen på linje 3 tappar fortfarande kontakten."], ["The unusual IT-to-plant traffic stopped when the plant was disconnected.", "Den ovanliga trafiken mellan IT och fabriken upphörde när fabriken kopplades bort."]),
              io(["Operations pushes back", "Produktionen protesterar"], ["The shift leader says nobody asked operations, and that lines 1 and 2 are now running without anyone able to see the planning system. They want the cable back in until the plant manager arrives.", "Skiftledaren säger att ingen frågade produktionen, och att linje 1 och 2 nu går utan att någon kan se planeringssystemet. Hen vill ha tillbaka kabeln tills fabrikschefen är på plats."], ["Operations disputes the disconnect; the plant manager is on the way.", "Produktionen ifrågasätter frånkopplingen; fabrikschefen är på väg."], { reopen: true }),
              io(["Nothing else in IT", "Inget annat i IT"], ["The office side reports nothing unusual: no other alarms anywhere in the IT network. Either the problem is all in the plant, or whatever caused it left no trace in IT.", "Kontorssidan rapporterar inget ovanligt: inga andra larm någonstans i IT-nätet. Antingen finns problemet helt i fabriken, eller så lämnade det som orsakade det inga spår i IT."], ["IT monitoring showed no other alarms in the office network that night.", "IT-bevakningen visade inga andra larm i kontorsnätet den natten."])
            ]),
            ir("i2", { notChosen: "A" }, ["The plant stays connected", "Fabriken förblir ansluten"], [
              io(["Another burst", "En ny skur"], ["The SOC sees another short burst of unusual traffic between IT and the plant, while the plant is still connected. It stops before anyone can see where it went.", "SOC ser ännu en kort skur av ovanlig trafik mellan IT och fabriken, medan fabriken fortfarande är ansluten. Den upphör innan någon hinner se vart den tog vägen."], ["More unusual IT-to-plant traffic was seen while the plant stayed connected.", "Mer ovanlig trafik mellan IT och fabriken sågs medan fabriken förblev ansluten."], { reopen: true }),
              io(["No answer from the plant manager", "Fabrikschefen svarar inte"], ["You try to reach the plant manager to agree what happens if things get worse. The phone rings out twice. Nobody on site will take responsibility for disconnecting the plant.", "Ni försöker nå fabrikschefen för att komma överens om vad som händer om det blir värre. Signalerna går fram två gånger utan svar. Ingen på plats vill ta ansvar för att koppla bort fabriken."], ["The plant manager could not be reached in the first half hour.", "Fabrikschefen gick inte att nå under den första halvtimmen."]),
              io(["Quiet for now", "Tyst för stunden"], ["No new unusual traffic for half an hour. IT on-call says it was probably a routine scan and suggests the security side can stand down.", "Ingen ny ovanlig trafik på en halvtimme. IT-jouren säger att det förmodligen var en rutinmässig skanning och föreslår att säkerhetssidan kan avvakta."], ["No new unusual traffic for half an hour; IT on-call suspects a routine scan.", "Ingen ny ovanlig trafik på en halvtimme; IT-jouren misstänker en rutinskanning."])
            ])
          ],
          pushback: {
            A: [
              pb(["The batch records stop", "Batchprotokollen tystnar"], ["Disconnecting the plant also cut the link the quality lab uses to record tonight's batch. Without those records, the batch worth {{num.batchValue|currency}} must be scrapped even if line 3 recovers. Do you reconnect long enough to save the records, or write the batch off?", "När fabriken kopplades bort bröts också länken som kvalitetslabbet använder för att registrera nattens batch. Utan de uppgifterna måste batchen värd {{num.batchValue|currency}} kasseras även om linje 3 kommer tillbaka. Kopplar ni upp igen så länge att uppgifterna kan räddas, eller skriver ni av batchen?"]),
              pb(["The OT engineer is locked out", "OT-ingenjören är utestängd"], ["The OT engineer was diagnosing the controllers from home over the link you just cut, and is now forty minutes away by car. Nobody on site can read the controller diagnostics. Do you open a path for one person, on the night you cut every path for a reason?", "OT-ingenjören felsökte styrsystemen hemifrån via förbindelsen ni just bröt, och har nu fyrtio minuter med bil till fabriken. Ingen på plats kan läsa styrsystemens diagnostik. Öppnar ni en väg för en enda person, samma natt som ni stängde alla vägar av en anledning?"]),
              pb(["The restarts go on", "Omstarterna fortsätter"], ["Twenty minutes after the cut, line 3's controllers are still dropping off and restarting, exactly as before. If the cause came from IT, disconnecting should have helped. Do you keep the plant cut off, at a cost, for a measure that may have changed nothing?", "Tjugo minuter efter frånkopplingen tappar styrsystemen på linje 3 fortfarande kontakten och startar om, precis som förut. Om orsaken kom från IT borde frånkopplingen ha hjälpt. Håller ni fabriken bortkopplad, med allt vad det kostar, för en åtgärd som kanske inte ändrade något?"])
            ],
            B: [
              pb(["The switch logs are gone", "Switcharnas loggar är borta"], ["The network lead points out that restarting the switches wiped their logs, including whatever recorded the unusual traffic the SOC flagged. If this turns out to be an attack, you have erased the first evidence yourselves. Who signs off on that, and do you tell the SOC now?", "Nätverksansvarig påpekar att omstarten av switcharna raderade deras loggar, inklusive det som kan ha registrerat den ovanliga trafik som SOC larmade om. Om det visar sig vara ett angrepp har ni själva raderat de första spåren. Vem står för det beslutet, och berättar ni det för SOC nu?"]),
              pb(["Healthy for ten minutes", "Normalt läge i tio minuter"], ["After the restart, line 3 reports healthy and the shift leader starts the line. Ten minutes later the controllers drop off again, this time with product moving through the process. Do you stop it again, and can you trust any “healthy” signal after this?", "Efter omstarten rapporterar linje 3 normalt läge och skiftledaren startar linjen. Tio minuter senare tappar styrsystemen kontakten igen, den här gången med produkt på väg genom processen. Stoppar ni igen, och kan ni lita på någon signal om ”normalt läge” efter det här?"]),
              pb(["The SOC won't close it", "SOC vill inte stänga larmet"], ["The SOC analyst says warm switches do not explain unusual traffic between IT and the plant, and refuses to close the alert. The shift leader says production cannot wait for a ticket. Who overrules whom tonight, and on what evidence?", "SOC-analytikern säger att varma switchar inte förklarar ovanlig trafik mellan IT och fabriken, och vägrar stänga larmet. Skiftledaren säger att produktionen inte kan vänta på ett ärende. Vem kör över vem i natt, och på vilket underlag?"])
            ],
            C: [
              pb(["The batch has a deadline", "Batchen har en tidsgräns"], ["The process engineer says the half-finished batch has about two hours before it must be scrapped, and an investigation that changes nothing will not have answers by then. Do you trade {{num.batchValue|currency}} for evidence, or put a deadline on the investigation?", "Processingenjören säger att den halvfärdiga batchen har ungefär två timmar på sig innan den måste kasseras, och en utredning som inte ändrar något hinner inte ge svar till dess. Byter ni {{num.batchValue|currency}} mot bevis, eller sätter ni en tidsgräns för utredningen?"]),
              pb(["Still connected", "Fortfarande ansluten"], ["While you investigate, the plant stays connected to the IT network where the unusual traffic was seen, and the SOC cannot say whether that traffic has stopped. Are you investigating an incident, or watching it continue?", "Medan ni utreder är fabriken fortfarande ansluten till IT-nätet där den ovanliga trafiken syntes, och SOC kan inte säga om den trafiken har upphört. Utreder ni en incident, eller ser ni på medan den fortsätter?"]),
              pb(["Whose investigation?", "Vems utredning?"], ["IT on-call says investigating the line is an operations job; the OT engineer says it is a cyber job. Half an hour in, nobody has opened a single log. Who owns this investigation, by name, and what do they look at first?", "IT-jouren säger att utreda linjen är produktionens sak; OT-ingenjören säger att det är en cyberfråga. En halvtimme in har ingen öppnat en enda logg. Vem äger utredningen, med namn, och vad tittar hen på först?"])
            ]
          }
        }),
        facilitator: fac(
          ["Two cultures in the room. Let them clash a little.", "Två kulturer i rummet. Låt dem krocka lite."],
          ["Safe stop held, evidence preserved and a joint IT–operations decision on isolation.", "Säkert stopp behållet, spår säkrade och ett gemensamt beslut mellan IT och produktion om isolering."],
          [["Ask: who has the key to the control room tonight?", "Fråga: vem har nyckeln till kontrollrummet i natt?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["Not your network to pull", "Inte ert nätverk att koppla ur"]),
        twist: L(["Operations has the final say over the plant network — and warns that isolation could create a hazard.", "Produktionen har sista ordet över fabriksnätet – och varnar för att en isolering kan skapa en fara."]),
        twistKind: "authority",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the plant network was cut off from IT, production planning stopped receiving orders, and the morning shift does not know what to run.", sv: "Eftersom fabriksnätet kopplades bort från IT slutade produktionsplaneringen att få order, och morgonskiftet vet inte vad de ska köra." } }
        ],
        assumptionChallenged: L(["IT decides how to contain a cyber incident.", "IT bestämmer hur en cyberincident ska begränsas."]),
        narrative: L([
          "{{time.T+60|clock}}. The plant manager has arrived on site, and is unhappy about what IT wants to do.\n\nFor IT, cutting the plant off from the office network is the standard first move against malware. For the plant manager, the network is part of how lines 1 and 2 run safely, and pulling a cable is not a neutral act.",
          "Klockan {{time.T+60|clock}}. Fabrikschefen har kommit till anläggningen, och är inte nöjd med vad IT vill göra.\n\nFör IT är att koppla bort fabriken från kontorsnätet det självklara första steget mot skadlig kod. För fabrikschefen är nätet en del av hur linje 1 och 2 körs säkert, och att dra ur en kabel är inte en neutral handling."
        ]),
        injects: [
          inj("i2-1", 60, "executiveMessage", "person.serviceOwner", "high", "confirmed", [
            "“Lines 1 and 2 are still running. If you cut the plant off from IT, their cooling and dosing loses its setpoints from the planning system. That is a safety risk, not an inconvenience. Nothing gets disconnected without my sign-off.”",
            "”Linje 1 och 2 går fortfarande. Om ni kopplar bort fabriken från IT förlorar deras kylning och dosering sina börvärden från planeringssystemet. Det är en säkerhetsrisk, inte en olägenhet. Inget kopplas bort utan mitt godkännande.”"
          ], { tests: ["lo1", "lo2"] }),
          inj("i2-2", 80, "chat", "person.otEngineer", "medium", "confirmed", [
            "“We could switch lines 1 and 2 to local setpoints first. It takes about an hour and needs two people on the floor.”",
            "”Vi skulle kunna ställa om linje 1 och 2 till lokala börvärden först. Det tar ungefär en timme och kräver två personer på golvet.”"
          ], { fallbackRole: "itOps", tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Can the plant run safely in local mode, cut off from IT?", "Kan fabriken köras säkert i lokalt läge, frånkopplad från IT?", ["otEngineer"]),
            q("What can you see on the plant network without changing anything?", "Vad kan ni se i fabriksnätet utan att ändra något?", ["networkLead", "socLead"]),
            q("Did your first decision consider the other lines?", "Tog ert första beslut hänsyn till de andra linjerna?", ["otEngineer"], "d1")
          ],
          executive: [
            q("Who has authority over the plant network in an incident?", "Vem har mandat över fabriksnätet vid en incident?", ["ceo", "serviceOwner"]),
            q("How do you reconcile safety and security when they pull in different directions?", "Hur förenar ni säkerhet och informationssäkerhet när de drar åt olika håll?", ["serviceOwner", "ciso"]),
            q("Would you take the same first step, knowing isolation affects lines 1 and 2?", "Skulle ni ta samma första steg, med vetskap om att isoleringen påverkar linje 1 och 2?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Isolation now is safer for security and riskier for safety.", "Att isolera nu är säkrare för informationssäkerheten och riskablare för den fysiska säkerheten.")],
        decision: dec("d2", "serviceOwner", ["How do you isolate safely?", "Hur isolerar ni på ett säkert sätt?"], [
          ["Move lines 1 and 2 to local setpoints first, then isolate the plant network.", "Ställ först om linje 1 och 2 till lokala börvärden och isolera sedan fabriksnätet."],
          ["Isolate immediately and accept the risk to lines 1 and 2.", "Isolera omedelbart och acceptera risken för linje 1 och 2."],
          ["Don't isolate; monitor the plant network instead.", "Isolera inte; bevaka fabriksnätet i stället."]
        ], {
          knowns: [["Lines 1 and 2 depend on setpoints from IT.", "Linje 1 och 2 är beroende av börvärden från IT."]],
          uncertainties: [["Whether the attacker is still active.", "Om angriparen fortfarande är aktiv."]],
          tradeoffs: {
            operational: ["The safe switch-over takes an hour.", "Den säkra omställningen tar en timme."],
            security: ["An hour more connection is an hour more exposure.", "En timme till med anslutning är en timme till med exponering."],
            legal: ["Process safety is regulated and personal.", "Processäkerhet är reglerad och har personligt ansvar."],
            reputational: ["A safety incident would dwarf a cyber one.", "En säkerhetsolycka skulle överskugga en cyberincident."]
          },
          evaluation: [["Sequences containment around safety", "Ordnar begränsningen kring säkerheten"], ["Agrees one decision-maker for the plant network", "Kommer överens om en beslutsfattare för fabriksnätet"]],
          minutes: 10,
          interrupts: [
            ir("i1", { chosen: "B" }, ["Isolated at once", "Isolerat på en gång"], [
              io(["The lines hold", "Linjerna håller"], ["Operators take lines 1 and 2 by hand, and nothing drifts. The network lead says this proves the risk was exaggerated.", "Operatörerna tar över linje 1 och 2 för hand, och inget driver iväg. Nätverksansvarig säger att det bevisar att risken var överdriven."], ["Lines 1 and 2 held steady after the immediate isolation.", "Linje 1 och 2 höll sig stabila efter den omedelbara isoleringen."]),
              io(["A cooling alarm", "Ett kyllarm"], ["Fifteen minutes after the cut, a cooling alarm sounds on line 1 and the line trips to a safe stop. The operators restart it by hand, but the plant manager wants the decision revisited now.", "En kvart efter frånkopplingen ljuder ett kyllarm på linje 1 och linjen går till säkert stopp. Operatörerna startar den igen för hand, men fabrikschefen vill att beslutet omprövas nu."], ["A cooling alarm briefly stopped line 1 after the isolation.", "Ett kyllarm stoppade linje 1 en kort stund efter isoleringen."], { reopen: true }),
              io(["A formal objection", "En formell invändning"], ["The plant manager puts in writing that the isolation was done without their sign-off, against a stated safety concern. Nothing has gone wrong. Yet.", "Fabrikschefen skriver ner att isoleringen gjordes utan hens godkännande, trots en uttalad säkerhetsoro. Inget har gått fel. Än."], ["The plant manager has formally objected to the isolation.", "Fabrikschefen har formellt invänt mot isoleringen."])
            ]),
            ir("i2", { notChosen: "B" }, ["Still connected", "Fortfarande ansluten"], [
              io(["A quiet hour", "En lugn timme"], ["The hour passes with no new unusual traffic. The plant manager says patience has paid off: lines 1 and 2 never lost a setpoint.", "Timmen går utan ny ovanlig trafik. Fabrikschefen säger att tålamodet har lönat sig: linje 1 och 2 tappade aldrig ett enda börvärde."], ["The extra hour passed without new unusual traffic.", "Den extra timmen gick utan ny ovanlig trafik."]),
              io(["Traffic again", "Trafik igen"], ["While the plant is still connected, the SOC sees another burst of unusual traffic from IT towards the plant network. Nobody can say what it reached.", "Medan fabriken fortfarande är ansluten ser SOC ännu en skur av ovanlig trafik från IT mot fabriksnätet. Ingen kan säga vad den nådde."], ["More unusual IT-to-plant traffic was seen while the plant was still connected.", "Mer ovanlig trafik från IT till fabriken sågs medan fabriken fortfarande var ansluten."], { reopen: true }),
              io(["The CISO asks why", "Säkerhetschefen frågar varför"], ["The CISO hears the plant is still connected and wants to know why the incident plan was not followed. They want the reason in writing before morning.", "Säkerhetschefen får höra att fabriken fortfarande är ansluten och vill veta varför incidentplanen inte följdes. Hen vill ha skälet skriftligt före morgonen."], ["The CISO has asked in writing why the plant was not isolated at once.", "Säkerhetschefen har skriftligt frågat varför fabriken inte isolerades direkt."])
            ])
          ],
          pushback: {
            A: [
              pb(["One line switched, one not", "En linje omställd, en inte"], ["The switch-over is slower than planned: after an hour, line 1 runs on local setpoints and line 2 does not. The plant is still connected to IT. Do you isolate now with one line half-switched, or give it another hour?", "Omställningen går långsammare än planerat: efter en timme går linje 1 på lokala börvärden men inte linje 2. Fabriken är fortfarande ansluten till IT. Isolerar ni nu med en linje halvvägs omställd, eller ger ni det en timme till?"]),
              pb(["Two people on the floor", "Två personer på golvet"], ["The only two people who can make the switch are the OT engineer and the most experienced operator. While they work, nobody is investigating line 3 or watching its controllers. Who do you take them from, and what stops while they are busy?", "De enda två som kan göra omställningen är OT-ingenjören och den mest erfarna operatören. Medan de arbetar är det ingen som utreder linje 3 eller håller ögonen på dess styrsystem. Vem tar ni dem från, och vad står still medan de är upptagna?"]),
              pb(["Product you cannot release", "Produkt som inte kan släppas"], ["On local setpoints, lines 1 and 2 no longer report to the planning system. Quality says it cannot release product made without those records. Are you prepared to run two lines whose output may not be sellable?", "På lokala börvärden rapporterar linje 1 och 2 inte längre till planeringssystemet. Kvalitet säger att de inte kan släppa produkter som tillverkats utan de uppgifterna. Är ni beredda att köra två linjer vars produktion kanske inte går att sälja?"])
            ],
            B: [
              pb(["The plant manager said no", "Fabrikschefen sa nej"], ["The plant manager was clear: nothing gets disconnected without their sign-off, and they have not signed. Pulling the cable now means doing it over the objection of the person responsible for process safety. Who in this room has the authority to overrule them?", "Fabrikschefen var tydlig: inget kopplas bort utan hens godkännande, och hen har inte godkänt. Att dra ur kabeln nu innebär att göra det mot viljan hos den som ansvarar för processäkerheten. Vem i rummet har mandat att köra över hen?"]),
              pb(["Dosing starts to drift", "Doseringen börjar driva"], ["Ten minutes after isolation, line 2's dosing begins to drift from its setpoint, and an operator is correcting it by hand. Do you reconnect to stabilise it, or ask one person to hold a running process steady manually for hours?", "Tio minuter efter isoleringen börjar doseringen på linje 2 driva från sitt börvärde, och en operatör rättar den för hand. Kopplar ni upp igen för att stabilisera, eller ber ni en enda person att hålla en pågående process stabil manuellt i flera timmar?"]),
              pb(["A name on the risk", "Ett namn på risken"], ["The safety officer reminds you that process safety is personal: if something happens on line 1 or 2, a named manager answers for it. They want the accepted risk in writing before the cable is pulled. Whose name goes on that paper?", "Säkerhetsansvarig påminner om att processäkerhet har personligt ansvar: om något händer på linje 1 eller 2 får en namngiven chef svara för det. Hen vill ha den accepterade risken skriftligt innan kabeln dras ur. Vems namn står på det papperet?"])
            ],
            C: [
              pb(["Monitoring with what?", "Bevaka med vad?"], ["The network lead admits there is no sensor on the plant network; monitoring means someone reading firewall logs by hand. Whatever happened to line 3 could happen to lines 1 and 2 before anyone notices. What exactly are you monitoring, and who watches it tonight?", "Nätverksansvarig medger att det inte finns någon sensor i fabriksnätet; bevakning betyder att någon läser brandväggsloggar för hand. Det som hände linje 3 kan hända linje 1 och 2 innan någon märker det. Vad är det exakt ni bevakar, och vem tittar i natt?"]),
              pb(["IT wants it on record", "IT vill ha det protokollfört"], ["IT on-call says leaving the plant connected after unusual traffic goes against the incident plan, and wants the objection recorded. If things get worse, the record will show you were warned. Do you still overrule them?", "IT-jouren säger att låta fabriken vara ansluten efter ovanlig trafik strider mot incidentplanen, och vill ha invändningen protokollförd. Om det blir värre kommer det att framgå att ni var varnade. Kör ni ändå över dem?"]),
              pb(["Line 3 is still unexplained", "Linje 3 är fortfarande oförklarad"], ["Line 3 is still restarting, and nothing you have decided explains why. Not isolating keeps lines 1 and 2 running on the same network with the same unknown. Is that a decision, or a hope?", "Linje 3 startar fortfarande om, och inget ni har beslutat förklarar varför. Att inte isolera låter linje 1 och 2 gå på samma nät med samma okända orsak. Är det ett beslut, eller en förhoppning?"])
            ]
          }
        }),
        facilitator: fac(
          ["The key learning point for IT-heavy groups: in OT, safety outranks containment speed.", "Den viktigaste lärdomen för IT-tunga grupper: i OT väger säkerheten tyngre än snabb begränsning."],
          ["A sequenced, safe isolation agreed between IT and operations.", "En stegvis och säker isolering som IT och produktion är överens om."],
          [["Ask: what is the worst physical outcome tonight?", "Fråga: vad är det värsta fysiska utfallet i natt?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 180,
        title: L(["Someone changed the logic", "Någon ändrade logiken"]),
        twist: L(["The controllers keep restarting because someone downloaded modified logic to them.", "Styrsystemen startar om eftersom någon har laddat ned ändrad logik till dem."]),
        twistKind: "cause",
        reconsider: { decision: "d2", pressure: { en: "Someone downloaded modified logic to the controllers. If you took the time to move lines 1 and 2 to local setpoints, the attacker had that time too. If you isolated at once, you cut the operators off from their only view of line 3.", sv: "Någon har laddat ner ändrad logik till styrsystemen. Om ni tog tid på er att ställa om linje 1 och 2 till lokala börvärden fick angriparen samma tid. Om ni isolerade direkt skar ni av operatörernas enda insyn i linje 3." } },
        assumptionChallenged: L(["This is a network or hardware fault.", "Det här är ett nätverks- eller hårdvarufel."]),
        reveals: ["hf-ews"],
        narrative: L([
          "{{time.T+180|clock}}. The plant is now separated from the office network, safely. The OT engineer starts comparing the controllers' logic with the last approved version.\n\nUntil now, the working theory has been malware or failing network hardware. The comparison will show whether anything inside the controllers themselves has changed.",
          "Klockan {{time.T+180|clock}}. Fabriken är nu avskild från kontorsnätet, på ett säkert sätt. OT-ingenjören börjar jämföra styrsystemens logik med den senast godkända versionen.\n\nHittills har arbetsteorin varit skadlig kod eller trasig nätverksutrustning. Jämförelsen kommer att visa om något inne i själva styrsystemen har ändrats."
        ]),
        injects: [
          inj("i3-1", 180, "forensicFinding", "person.otEngineer", "critical", "confirmed", [
            "The logic on {{num.plcs}} controllers differs from the approved version. The project log shows downloads from engineering workstation {{asset.engWorkstation}} at {{time.T-90|clock}} — when nobody was on shift to do it.",
            "Logiken i {{num.plcs}} styrsystem skiljer sig från den godkända versionen. Projektloggen visar nedladdningar från ingenjörsarbetsstationen {{asset.engWorkstation}} klockan {{time.T-90|clock}} – när ingen var på plats för att göra det."
          ], { headline: ["Unauthorised logic downloads", "Obehöriga nedladdningar av logik"], fallbackRole: "itOps", reveals: ["hf-ews"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c3-downloads", type: "bar",
          title: L(["Logic downloads per day from engineering workstations", "Nedladdningar av logik per dag från ingenjörsarbetsstationer"]), unit: L(["downloads", "nedladdningar"]),
          caption: L(["Days before tonight.", "Dagar före i natt."]),
          data: (ctx) => {
            const days = [-6, -5, -4, -3, -2, -1, 0];
            return { categories: days, series: [
              { id: "approved", label: L(["Approved changes", "Godkända ändringar"]), values: days.map((d) => (d === -3 ? 2 : 0)) },
              { id: "unknown", label: L(["No change ticket", "Inget ändringsärende"]), values: days.map((d) => (d === 0 ? Math.max(1, Math.round(ctx.vars.plcs / 2)) : 0)) }
            ] };
          }
        }],
        questions: {
          technical: [
            q("What did the modified logic change?", "Vad ändrade den modifierade logiken?", ["otEngineer"]),
            q("How do you secure the engineering workstation as evidence?", "Hur säkrar ni ingenjörsarbetsstationen som bevis?", ["socLead", "otEngineer"]),
            q("Was your isolation sequence fast enough, given an active intruder?", "Var er ordning för isoleringen tillräckligt snabb, med tanke på en aktiv inkräktare?", ["networkLead"], "d2")
          ],
          executive: [
            q("Is this now a matter for the police and authorities?", "Är det här nu en fråga för polis och myndigheter?", ["ceo", "ciso"]),
            q("Do you stop the whole plant?", "Stoppar ni hela fabriken?", ["serviceOwner", "ceo"]),
            q("Does this change who should own the plant-network decision?", "Ändrar det här vem som bör äga beslutet om fabriksnätet?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("Lines 1 and 2 use controllers from the same workstation.", "Linje 1 och 2 använder styrsystem från samma arbetsstation.")],
        decision: dec("d3", "serviceOwner", ["What do you do with the plant?", "Vad gör ni med fabriken?"], [
          ["Bring all lines to a safe stop until logic on every controller is verified.", "Ta alla linjer till säkert stopp tills logiken i varje styrsystem är kontrollerad."],
          ["Keep lines 1 and 2 running under manual supervision and verify their logic first.", "Låt linje 1 och 2 gå under manuell övervakning och kontrollera deras logik först."],
          ["Restore line 3 from the approved logic and restart it.", "Återställ linje 3 från den godkända logiken och starta den igen."]
        ], {
          knowns: [["Logic on line 3 controllers was changed.", "Logiken i styrsystemen på linje 3 har ändrats."]],
          uncertainties: [["Whether lines 1 and 2 were changed too.", "Om även linje 1 och 2 har ändrats."]],
          tradeoffs: {
            operational: ["A full stop costs {{num.lossPerHour|currency}} per hour.", "Ett fullständigt stopp kostar {{num.lossPerHour|currency}} per timme."],
            security: ["Running unverified logic may run a manipulated process.", "Att köra okontrollerad logik kan innebära att en manipulerad process körs."],
            legal: ["Running a process you cannot trust may breach safety duties.", "Att köra en process ni inte kan lita på kan bryta mot säkerhetsskyldigheter."],
            reputational: ["Customers will accept delay more readily than an accident.", "Kunder accepterar en försening lättare än en olycka."]
          },
          evaluation: [["Refuses to run unverified logic", "Vägrar köra okontrollerad logik"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Every line stopped", "Alla linjer stoppade"], [
              io(["A calm stop", "Ett lugnt stopp"], ["All lines reach a safe stop without incident. The operators are relieved that nothing is running that nobody can vouch for.", "Alla linjer når säkert stopp utan incidenter. Operatörerna är lättade över att inget går som ingen kan stå för."], ["All lines reached a safe stop without incident.", "Alla linjer nådde säkert stopp utan incidenter."]),
              io(["A ruined batch", "En förstörd batch"], ["Stopping line 2 mid-process ruins the batch in its vessels. Cleaning will take a full shift before the line can even be checked.", "När linje 2 stoppas mitt i processen förstörs batchen i dess kärl. Rengöringen tar ett helt skift innan linjen ens kan kontrolleras."], ["Stopping line 2 ruined its batch and needs a shift of cleaning.", "Stoppet förstörde batchen på linje 2 och kräver ett skift av rengöring."]),
              io(["Talk of a hack", "Prat om hackare"], ["With nothing running, the night shift is sent home early. By morning, a staff group chat is asking whether the plant was hacked, and nobody has told them anything.", "Med allt stillastående skickas nattskiftet hem tidigt. På morgonen frågar personalen i en gruppchatt om fabriken har blivit hackad, och ingen har berättat något för dem."], ["Staff are speculating about a hack; nobody has briefed them.", "Personalen spekulerar om ett dataintrång; ingen har informerat dem."])
            ]),
            ir("i2", { notChosen: "A" }, ["Lines still running", "Linjerna går fortfarande"], [
              io(["Running fine", "Allt går bra"], ["Lines 1 and 2 run normally through the night. Production says the decision saved a day's output.", "Linje 1 och 2 går normalt hela natten. Produktionen säger att beslutet räddade ett dygns produktion."], ["Lines 1 and 2 ran normally through the night.", "Linje 1 och 2 gick normalt hela natten."]),
              io(["A dropout on line 2", "Ett avbrott på linje 2"], ["A controller on line 2 drops off the network once, then comes back. The operators cannot say whether it is the same thing that happened to line 3, or nothing at all.", "Ett styrsystem på linje 2 tappar kontakten med nätverket en gång och kommer sedan tillbaka. Operatörerna kan inte säga om det är samma sak som hände linje 3, eller ingenting alls."], ["A line 2 controller dropped off once while the line was running.", "Ett styrsystem på linje 2 tappade kontakten en gång medan linjen gick."], { reopen: true }),
              io(["An operator walks out", "En operatör går hem"], ["An operator refuses to work next to a running line whose logic nobody has checked, and goes home. The safety representative wants a meeting before the next shift.", "En operatör vägrar arbeta bredvid en linje i drift vars logik ingen har kontrollerat, och går hem. Skyddsombudet vill ha ett möte före nästa skift."], ["An operator left over safety concerns; the safety representative wants a meeting.", "En operatör gick hem av säkerhetsskäl; skyddsombudet vill ha ett möte."])
            ])
          ],
          pushback: {
            A: [
              pb(["When do they start again?", "När startar de igen?"], ["With every line stopped, the plant loses {{num.lossPerHour|currency}} an hour, and checking every controller will take more than a day. Production asks: if the check of lines 1 and 2 finds nothing, was the stop worth it? On what proof will you start them again?", "Med alla linjer stoppade förlorar fabriken {{num.lossPerHour|currency}} i timmen, och att kontrollera varje styrsystem tar mer än ett dygn. Produktionen frågar: om kontrollen av linje 1 och 2 inte hittar något, var stoppet värt det? På vilket underlag startar ni dem igen?"]),
              pb(["Stopping has its own risks", "Ett stopp har sina egna risker"], ["The shift leader warns that stopping lines 1 and 2 mid-process means hours of cleaning, some product lost, and a restart later, which is when equipment is most at risk. Is stopping two lines with no known fault really the safe choice?", "Skiftledaren varnar för att stoppa linje 1 och 2 mitt i processen innebär timmar av rengöring, en del förlorad produkt och en omstart senare, vilket är när utrustningen är mest utsatt. Är det verkligen det säkra valet att stoppa två linjer utan känt fel?"]),
              pb(["Rumours in the canteen", "Rykten i matsalen"], ["Staff on the floor ask why every line has stopped when only line 3 had a problem. Talk of a hack is already spreading in the canteen. What do you tell them now, without knowing yet what was changed?", "Personalen på golvet frågar varför alla linjer har stoppats när bara linje 3 hade problem. Prat om ett hackerangrepp sprider sig redan i matsalen. Vad säger ni till dem nu, utan att ännu veta vad som ändrats?"])
            ],
            B: [
              pb(["Watching the wrong thing", "Ni bevakar fel sak"], ["The OT engineer confirms that lines 1 and 2 are programmed from the same engineering workstation as line 3. Manual supervision watches the process, not the logic inside the controllers. What would the operators actually see if that logic had been changed too?", "OT-ingenjören bekräftar att linje 1 och 2 programmeras från samma ingenjörsarbetsstation som linje 3. Manuell övervakning bevakar processen, inte logiken inne i styrsystemen. Vad skulle operatörerna egentligen se om även den logiken hade ändrats?"]),
              pb(["Operators want to go home", "Operatörer vill gå hem"], ["Two operators on line 2 ask whether it is safe to stand next to a line whose control logic nobody has checked. One wants to go home. Do you ask them to stay, and who takes responsibility if they turn out to be right?", "Två operatörer på linje 2 frågar om det är säkert att stå bredvid en linje vars styrlogik ingen har kontrollerat. En av dem vill gå hem. Ber ni dem stanna, och vem tar ansvaret om det visar sig att de hade rätt?"]),
              pb(["Slower on a running line", "Långsammare på en linje som går"], ["Comparing logic on running controllers is slower, and the engineers doing it are the same ones working on line 3. The OT engineer says it will take most of the day. Are you willing to run unverified logic for that long?", "Att jämföra logik i styrsystem som är i drift går långsammare, och ingenjörerna som gör det är samma som arbetar med linje 3. OT-ingenjören säger att det tar större delen av dagen. Är ni beredda att köra okontrollerad logik så länge?"])
            ],
            C: [
              pb(["Approved by whom?", "Godkänd av vem?"], ["The approved version you want to load sits on the same engineering workstation that pushed tonight's unauthorised downloads. Nobody can say who else has touched it. Do you load it onto line 3 without a second source to compare it against?", "Den godkända versionen ni vill ladda in ligger på samma ingenjörsarbetsstation som skickade nattens obehöriga nedladdningar. Ingen kan säga vem mer som har rört den. Laddar ni in den i linje 3 utan en andra källa att jämföra med?"]),
              pb(["They could do it again", "De kan göra det igen"], ["You still do not know how the downloads were made or by whom. Restarting line 3 means running it while whoever did this may still be able to reach the workstation. What stops them from doing it again tomorrow night?", "Ni vet fortfarande inte hur nedladdningarna gjordes eller av vem. Att starta linje 3 innebär att köra den medan den som gjorde det kanske fortfarande kan nå arbetsstationen. Vad hindrar dem från att göra om det i morgon natt?"]),
              pb(["The engineer won't sign", "Ingenjören skriver inte under"], ["The OT engineer refuses to sign the restart: finding a difference in the logic is not the same as knowing the line is safe to run. Production wants line 3 back. Do you restart over the engineer's objection, or look for someone else to sign?", "OT-ingenjören vägrar skriva under omstarten: att hitta en skillnad i logiken är inte samma sak som att veta att linjen är säker att köra. Produktionen vill ha tillbaka linje 3. Startar ni mot ingenjörens invändning, eller letar ni efter någon annan som skriver under?"])
            ]
          }
        }),
        facilitator: fac(
          ["Fault becomes attack. Watch whether the group returns to the switch-restart idea.", "Felet blir ett angrepp. Se om gruppen återvänder till idén att starta om switcharna."],
          ["All lines brought to safe stop until controller logic is verified.", "Alla linjer i säkert stopp tills logiken i styrsystemen är kontrollerad."],
          [["Ask: how do you know the “approved” logic is itself clean?", "Fråga: hur vet ni att den ”godkända” logiken själv är ren?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 300,
        title: L(["The forgotten rule", "Den bortglömda regeln"]),
        twist: L(["The engineering workstation was reached from the IT network through a rule opened for a vendor and never closed.", "Ingenjörsarbetsstationen nåddes från IT-nätet via en regel som öppnades för en leverantör och aldrig stängdes."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because every line was brought to a stop, a customer's just-in-time delivery has been missed, and their own line stops at noon.", sv: "Eftersom alla linjer stoppades har en kunds leverans just-in-time uteblivit, och deras egen linje stannar vid lunch." } }
        ],
        assumptionChallenged: L(["The plant network is separated from IT.", "Fabriksnätet är avskilt från IT."]),
        reveals: ["hf-boundary"],
        narrative: L([
          "{{time.T+300|clock}}. The network team traces how anyone could have reached the engineering workstation, the computer used to program the controllers.\n\nThe plant network is supposed to be separated from the office network. Everyone believed it was. The firewall rules tell a more complicated story.",
          "Klockan {{time.T+300|clock}}. Nätverksteamet spårar hur någon kan ha nått ingenjörsarbetsstationen, datorn som används för att programmera styrsystemen.\n\nFabriksnätet ska vara avskilt från kontorsnätet. Alla trodde att det var det. Brandväggsreglerna berättar en mer komplicerad historia."
        ]),
        injects: [
          inj("i4-1", 300, "networkEvidence", "itOps", "critical", "confirmed", [
            "A firewall rule allows remote desktop from IT jump server {{asset.jumpHost}} to {{asset.engWorkstation}}. It was created for a vendor's commissioning two months ago. Sessions through it began {{num.ewsDays}} days ago, from a jump-server account nobody in OT uses.",
            "En brandväggsregel tillåter fjärrskrivbord från hoppservern {{asset.jumpHost}} i IT-nätet till {{asset.engWorkstation}}. Den skapades för en leverantörs driftsättning för två månader sedan. Sessioner genom den började för {{num.ewsDays}} dagar sedan, från ett konto på hoppservern som ingen inom OT använder."
          ], { headline: ["IT-to-OT path found", "Väg från IT till OT hittad"], fallbackRole: "itOps", reveals: ["hf-boundary"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-blast", type: "blast",
          title: L(["The path into the plant", "Vägen in i fabriken"]),
          data: () => ({
            center: { label: "{{asset.jumpHost}}", status: "compromised" },
            rings: [
              { label: L(["Boundary", "Gräns"]), nodes: [{ label: L(["Vendor firewall rule", "Leverantörens brandväggsregel"]), status: "compromised" }] },
              { label: L(["Engineering", "Ingenjörsnivå"]), nodes: [{ label: "{{asset.engWorkstation}}", status: "compromised" }] },
              { label: L(["Process", "Process"]), nodes: [{ label: L(["Line 3 controllers", "Styrsystem linje 3"]), status: "down" }, { label: L(["Lines 1 and 2", "Linje 1 och 2"]), status: "unknown" }] }
            ]
          })
        }],
        questions: {
          technical: [
            q("How did the attacker reach the IT jump server in the first place?", "Hur nådde angriparen hoppservern i IT-nätet från början?", ["socLead", "itOps"]),
            q("Which other IT-to-OT rules exist that nobody remembers?", "Vilka andra regler mellan IT och OT finns som ingen minns?", ["networkLead"]),
            q("Did stopping all lines protect you from this path?", "Skyddade stoppet av alla linjer er mot den här vägen?", ["otEngineer"], "d3")
          ],
          executive: [
            q("Who owns the boundary between IT and OT?", "Vem äger gränsen mellan IT och OT?", ["ceo", "ciso"]),
            q("Do you involve the vendor whose rule this was?", "Involverar ni leverantören som regeln tillhörde?", ["supplierManager"]),
            q("Does this change your view on how you isolated the plant?", "Ändrar det här er syn på hur ni isolerade fabriken?", ["serviceOwner"], "d2")
          ]
        },
        challenges: [ch("The vendor rule was approved by someone who has since left.", "Leverantörsregeln godkändes av någon som sedan dess har slutat.")],
        decision: dec("d4", "ciso", ["How do you close the boundary?", "Hur stänger ni gränsen?"], [
          ["Close every IT-to-OT path except a monitored, approved one, and review all rules.", "Stäng alla vägar från IT till OT utom en bevakad och godkänd, och granska alla regler."],
          ["Close this rule only.", "Stäng bara den här regeln."],
          ["Keep the rule for the vendor's return and add monitoring.", "Behåll regeln till leverantörens återkomst och lägg till bevakning."]
        ], {
          knowns: [["A forgotten rule linked IT and OT.", "En bortglömd regel kopplade samman IT och OT."]],
          uncertainties: [["How the jump server was reached.", "Hur hoppservern nåddes."]],
          tradeoffs: {
            operational: ["Vendors and engineers lose convenient remote access.", "Leverantörer och ingenjörer förlorar bekväm fjärråtkomst."],
            security: ["One forgotten rule was enough.", "En bortglömd regel räckte."],
            legal: ["Critical-infrastructure rules expect controlled boundaries.", "Regler för samhällsviktig infrastruktur förväntar sig kontrollerade gränser."],
            reputational: ["A plant reachable from IT is hard to defend publicly.", "En fabrik som kan nås från IT är svår att försvara offentligt."]
          },
          evaluation: [["Reviews the whole boundary, not just one rule", "Granskar hela gränsen, inte bara en regel"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Every path closed", "Alla vägar stängda"], [
              io(["One door left", "En dörr kvar"], ["The network lead confirms that only the approved, monitored path now crosses between IT and the plant. For the first time tonight, someone can say that with evidence.", "Nätverksansvarig bekräftar att bara den godkända och bevakade vägen nu går mellan IT och fabriken. För första gången i natt kan någon säga det med belägg."], ["Only the approved, monitored path now crosses between IT and OT.", "Bara den godkända, bevakade vägen går nu mellan IT och OT."]),
              io(["The lab goes dark", "Labbet blir mörkt"], ["Quality reports that its lab instruments no longer send results to IT, so no finished product can be released. The path they used was never documented.", "Kvalitet rapporterar att labbets instrument inte längre skickar resultat till IT, så ingen färdig produkt kan släppas. Vägen de använde var aldrig dokumenterad."], ["Quality lab results no longer reach IT; product release is on hold.", "Kvalitetslabbets resultat når inte längre IT; frisläppningen av produkter står still."], { reopen: true }),
              io(["A blocked attempt", "Ett blockerat försök"], ["Within the hour, the closed rules log a blocked connection attempt from the IT network towards the plant. It could be the intruder, or a forgotten backup job.", "Inom en timme loggar de stängda reglerna ett blockerat anslutningsförsök från IT-nätet mot fabriken. Det kan vara inkräktaren, eller ett bortglömt säkerhetskopieringsjobb."], ["A blocked connection attempt from IT towards the plant is unexplained.", "Ett blockerat anslutningsförsök från IT mot fabriken är oförklarat."])
            ]),
            ir("i2", { notChosen: "A" }, ["Other paths remain", "Andra vägar finns kvar"], [
              io(["Help stays close", "Hjälpen finns kvar"], ["Because not every path was closed, the OT vendor's usual support connection still works, and their engineer helps compare line 3's logic overnight. It saves a day.", "Eftersom inte alla vägar stängdes fungerar OT-leverantörens vanliga supportanslutning fortfarande, och deras ingenjör hjälper till att jämföra logiken på linje 3 under natten. Det sparar ett dygn."], ["The vendor's remote help sped up the logic comparison.", "Leverantörens fjärrhjälp snabbade upp jämförelsen av logiken."]),
              io(["Another open rule", "Ännu en öppen regel"], ["The network lead finds another rule towards the plant with no owner and no ticket. It is still open, and nobody knows who uses it.", "Nätverksansvarig hittar ännu en regel mot fabriken utan ägare och utan ärende. Den är fortfarande öppen, och ingen vet vem som använder den."], ["At least one more ownerless rule towards the plant is still open.", "Minst en regel till utan ägare mot fabriken står fortfarande öppen."], { reopen: true }),
              io(["The authority asks", "Myndigheten frågar"], ["{{reg.supervisor|cap}} calls with an early question: is the plant now separated from the office network? The honest answer is “partly”.", "{{reg.supervisor|cap}} ringer med en tidig fråga: är fabriken nu avskild från kontorsnätet? Det ärliga svaret är ”delvis”."], ["{{reg.supervisor|cap}} has asked whether the plant is separated from IT.", "{{reg.supervisor|cap}} har frågat om fabriken är avskild från IT."], { meters: { regulator: 1 } })
            ])
          ],
          pushback: {
            A: [
              pb(["The vendor is cut off too", "Leverantören stängs också ute"], ["Closing every path also cut the OT vendor's remote support, and their engineer was about to help compare the logic on line 3. Coming on site will take them a day. Do you make one exception for the vendor, or accept the delay?", "När alla vägar stängdes försvann också OT-leverantörens fjärrsupport, och deras ingenjör skulle just hjälpa till att jämföra logiken på linje 3. Att komma på plats tar dem ett dygn. Gör ni ett undantag för leverantören, eller accepterar ni förseningen?"]),
              pb(["Things go quiet", "Saker tystnar"], ["Within an hour, maintenance reports that the spare-parts system and the energy-metering reports have gone silent: they relied on paths nobody had documented. Do you reopen paths you cannot explain, or let those systems stay dark?", "Inom en timme rapporterar underhåll att reservdelssystemet och energimätningens rapporter har tystnat: de byggde på vägar som ingen hade dokumenterat. Öppnar ni igen vägar ni inte kan förklara, eller låter ni systemen förbli mörka?"]),
              pb(["Who does the review?", "Vem gör granskningen?"], ["The review of every rule falls on the network lead, who wrote many of them and has been up all night. Nobody else knows the plant firewall. Who reviews the reviewer, and when will the review actually get done?", "Granskningen av alla regler hamnar hos nätverksansvarig, som skrev många av dem och har varit vaken hela natten. Ingen annan kan fabrikens brandvägg. Vem granskar granskaren, och när blir granskningen faktiskt gjord?"])
            ],
            B: [
              pb(["Still inside IT", "Fortfarande inne i IT"], ["Closing the rule does not explain how the attacker reached the jump server in the first place, and the jump-server account is still enabled. If they are still in the IT network, what stops them finding another way across?", "Att stänga regeln förklarar inte hur angriparen nådde hoppservern från början, och kontot på hoppservern är fortfarande aktivt. Om de fortfarande finns i IT-nätet, vad hindrar dem från att hitta en annan väg över?"]),
              pb(["A dozen more rules", "Ett dussin regler till"], ["Scrolling through the firewall, the network lead finds a dozen more rules towards the plant with no owner and no ticket. Closing one and leaving the rest will be hard to defend. Do you stop at this one, knowing the others are there?", "När nätverksansvarig bläddrar igenom brandväggen hittar hen ytterligare ett dussin regler mot fabriken utan ägare och utan ärende. Att stänga en och lämna resten blir svårt att försvara. Stannar ni vid den här, med vetskap om att de andra finns?"]),
              pb(["A promise you can't make", "Ett löfte ni inte kan ge"], ["The plant manager asks for written confirmation that the plant is separated from IT before anyone goes back on the floor. With one rule closed and the rest unreviewed, can you honestly give it?", "Fabrikschefen vill ha en skriftlig bekräftelse på att fabriken är avskild från IT innan någon går tillbaka ut på golvet. Med en regel stängd och resten ogranskade, kan ni ärligt ge den?"])
            ],
            C: [
              pb(["Watched, but open", "Bevakad, men öppen"], ["This rule just let someone download logic to line 3. Monitoring would have shown those sessions; it would not have stopped them. Are you ready to tell the plant manager that the door is still open, only watched?", "Den här regeln lät just någon ladda ned logik till linje 3. Bevakning hade visat sessionerna; den hade inte stoppat dem. Är ni beredda att säga till fabrikschefen att dörren fortfarande står öppen, bara bevakad?"]),
              pb(["The vendor doesn't need it", "Leverantören behöver den inte"], ["The vendor's account manager says their engineers stopped using the rule after commissioning and have no plans to come back soon. Keeping it open is your choice, not theirs. Who is it really being kept for?", "Leverantörens kundansvarige säger att deras ingenjörer slutade använda regeln efter driftsättningen och inte planerar att komma tillbaka snart. Att hålla den öppen är ert val, inte deras. Vem behålls den egentligen för?"]),
              pb(["Who answers the alert?", "Vem svarar på larmet?"], ["Monitoring has to be watched, at night too. The SOC says nobody there understands plant traffic or may touch the plant firewall. Who answers the alert in the middle of the night, and what can they actually do about it?", "Bevakningen måste ha någon som tittar, även på natten. SOC säger att ingen där förstår trafiken i fabriken eller får röra fabrikens brandvägg. Vem svarar på larmet mitt i natten, och vad kan hen faktiskt göra åt det?"])
            ]
          }
        }),
        facilitator: fac(
          ["The classic IT/OT lesson. Let the network lead own it.", "Den klassiska lärdomen om IT och OT. Låt nätverksansvarig äga den."],
          ["A single monitored path between IT and OT and a full rule review.", "En enda bevakad väg mellan IT och OT och en fullständig granskning av reglerna."],
          [["Ask: when was the boundary last reviewed?", "Fråga: när granskades gränsen senast?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 480,
        title: L(["The safety trip", "Säkerhetsstoppet"]),
        twist: L(["The modified logic disabled a safety trip on line 3. This was not only disruption.", "Den ändrade logiken kopplade bort ett säkerhetsstopp på linje 3. Det här var inte bara störning."]),
        twistKind: "impact",
        reconsider: { decision: "d3", pressure: { en: "A safety trip was disabled on line 3. Lines 1 and 2 may carry the same change. Do you still stand by what you did with them?", sv: "En säkerhetsfunktion var bortkopplad på linje 3. Linje 1 och 2 kan bära samma ändring. Står ni fortfarande fast vid det ni gjorde med dem?" } },
        assumptionChallenged: L(["The attacker only wanted to stop production.", "Angriparen ville bara stoppa produktionen."]),
        reveals: ["hf-safety"],
        narrative: L([
          "{{time.T+480|clock}}. The engineers have been working through the modified logic line by line, function by function.\n\nSo far the changes explain why the controllers kept restarting. Now the comparison reaches the safety interlocks, the parts of the logic that stop the line when something dangerous happens.",
          "Klockan {{time.T+480|clock}}. Ingenjörerna har gått igenom den ändrade logiken rad för rad, funktion för funktion.\n\nHittills förklarar ändringarna varför styrsystemen startade om hela tiden. Nu når jämförelsen säkerhetsförreglingarna, de delar av logiken som stoppar linjen när något farligt händer."
        ]),
        injects: [
          inj("i5-1", 480, "forensicFinding", "person.otEngineer", "critical", "confirmed", [
            "In the modified logic, the over-pressure trip on line 3 is set to never activate. Had the line kept running with that logic, a pressure fault would not have stopped it.",
            "I den ändrade logiken är övertrycksstoppet på linje 3 inställt så att det aldrig löser ut. Om linjen hade fortsatt köras med den logiken hade ett tryckfel inte stoppat den."
          ], { headline: ["Safety trip disabled", "Säkerhetsstopp bortkopplat"], fallbackRole: "itOps", reveals: ["hf-safety"], tests: ["lo1"] })
        ],
        charts: [{
          id: "c5-kpi", type: "kpi",
          title: L(["What the manipulation reached", "Vad manipulationen nådde"]),
          data: kpi([
            { id: "plcs", label: ["Controllers with modified logic", "Styrsystem med ändrad logik"], value: (v) => v.plcs, tone: "danger" },
            { id: "trips", label: ["Safety trips disabled", "Bortkopplade säkerhetsstopp"], value: 1, tone: "danger" },
            { id: "days", label: ["Days of access before the change", "Dagar med åtkomst före ändringen"], value: (v) => v.ewsDays, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("How do you check every safety function before any restart?", "Hur kontrollerar ni varje säkerhetsfunktion före en omstart?", ["otEngineer"]),
            q("Could the safety system itself have been reached?", "Kan själva säkerhetssystemet ha nåtts?", ["otEngineer", "networkLead"]),
            q("Did your decision to stop all lines prevent a hazard?", "Förhindrade ert beslut att stoppa alla linjer en fara?", ["otEngineer"], "d3")
          ],
          executive: [
            q("Who must be told about a deliberate safety bypass?", "Vilka måste få veta om en avsiktlig förbikoppling av säkerheten?", ["ceo", "serviceOwner"]),
            q("Do staff on the floor need to know tonight?", "Behöver personalen på golvet få veta det i natt?", ["serviceOwner", "comms"]),
            q("Does this change your earlier choice on authority over the plant network?", "Ändrar det här ert tidigare val om mandatet över fabriksnätet?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("Staff worked next to a line whose safety trip had been disabled.", "Personal arbetade bredvid en linje vars säkerhetsstopp hade kopplats bort.")],
        decision: dec("d5", "ceo", ["How do you treat the safety bypass?", "Hur hanterar ni förbikopplingen av säkerheten?"], [
          ["As a serious safety incident: inform staff, report to authorities and verify every safety function before restart.", "Som en allvarlig säkerhetsincident: informera personalen, rapportera till myndigheterna och kontrollera varje säkerhetsfunktion före omstart."],
          ["Fix the logic and report it as part of the cyber incident.", "Rätta logiken och rapportera det som en del av cyberincidenten."],
          ["Fix the logic now and report the bypass once the investigation shows how it happened, so the report is right first time.", "Rätta logiken nu och rapportera förbikopplingen när utredningen visar hur den gick till, så att rapporten blir rätt från början."]
        ], {
          knowns: [["A safety trip was deliberately disabled.", "Ett säkerhetsstopp kopplades avsiktligt bort."]],
          uncertainties: [["Whether other safety functions were touched.", "Om andra säkerhetsfunktioner har rörts."]],
          tradeoffs: {
            operational: ["Full safety verification delays restart further.", "En fullständig säkerhetskontroll försenar omstarten ytterligare."],
            security: ["The attacker's intent was physical harm, or the risk of it.", "Angriparens avsikt var fysisk skada, eller risken för det."],
            legal: ["Safety incidents carry reporting duties.", "Säkerhetsincidenter medför rapporteringsskyldigheter."],
            reputational: ["Hiding a safety bypass is indefensible.", "Att dölja en förbikopplad säkerhetsfunktion går inte att försvara."]
          },
          evaluation: [["Treats it as a safety event with full transparency", "Behandlar det som en säkerhetshändelse med full öppenhet"]],
          minutes: 10,
          interrupts: [
            ir("i1", { chosen: "A" }, ["Out in the open", "Helt öppet"], [
              io(["The floor backs you", "Golvet står bakom er"], ["The night-shift operators thank management for telling them straight. The safety representative offers to help with the verification.", "Operatörerna på nattskiftet tackar ledningen för att de fick veta rakt ut. Skyddsombudet erbjuder sig att hjälpa till med kontrollen."], ["Staff and the safety representative back how the bypass was handled.", "Personalen och skyddsombudet står bakom hur förbikopplingen hanterades."]),
              io(["Weeks, not days", "Veckor, inte dagar"], ["Now that you have promised the authorities that every safety function will be verified, the OT engineer reports it will take weeks, not days. Production asks whether the promise can be narrowed.", "Nu när ni har lovat myndigheterna att varje säkerhetsfunktion ska kontrolleras rapporterar OT-ingenjören att det tar veckor, inte dagar. Produktionen frågar om löftet kan snävas in."], ["Verifying every safety function will take weeks.", "Att kontrollera varje säkerhetsfunktion kommer att ta veckor."], { reopen: true }),
              io(["A post goes public", "Ett inlägg blir offentligt"], ["A staff member posts about “sabotaged safety systems” at the plant. It is shared locally within hours, and nobody knows how much detail it contains.", "En anställd skriver ett inlägg om ”saboterade säkerhetssystem” i fabriken. Det delas lokalt inom några timmar, och ingen vet hur mycket detaljer det innehåller."], ["A staff post about sabotaged safety systems is circulating publicly.", "Ett inlägg från en anställd om saboterade säkerhetssystem sprids offentligt."], { meters: { media: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["Kept narrow", "Hållet snävt"], [
              io(["Nobody asks", "Ingen frågar"], ["The day passes without anyone outside the company asking about the safety trip. Legal says that suggests the approach was fine.", "Dagen går utan att någon utanför företaget frågar om säkerhetsstoppet. Juristen säger att det tyder på att tillvägagångssättet var rätt."], ["Nobody outside the company has asked about the bypass so far.", "Ingen utanför företaget har frågat om förbikopplingen än så länge."]),
              io(["Heard second-hand", "Hört i andra hand"], ["An operator hears from a contractor that line 3's safety trip was disabled while they worked next to it. The safety representative demands to know why staff were not told.", "En operatör får höra av en entreprenör att säkerhetsstoppet på linje 3 var bortkopplat medan hen arbetade bredvid. Skyddsombudet kräver att få veta varför personalen inte informerades."], ["Staff learned of the bypass second-hand; the safety representative wants answers.", "Personalen fick veta om förbikopplingen i andra hand; skyddsombudet kräver svar."], { reopen: true }),
              io(["The safety authority calls", "Arbetsmiljömyndigheten ringer"], ["The workplace-safety authority calls: it has heard from elsewhere about a safety-related incident at the plant, and asks why it was not told directly.", "Arbetsmiljömyndigheten ringer: den har från annat håll hört talas om en säkerhetsrelaterad händelse i fabriken, och frågar varför den inte informerades direkt."], ["The workplace-safety authority has asked why it was not told directly.", "Arbetsmiljömyndigheten har frågat varför den inte informerades direkt."], { meters: { regulator: 1 } })
            ])
          ],
          pushback: {
            A: [
              pb(["A veto for the floor", "Ett veto för golvet"], ["The staff safety representative asks to take part in verifying every safety function, and wants the right to halt any restart. That would slow everything down. Do you give a staff representative a say over your restart?", "Skyddsombudet vill delta i kontrollen av varje säkerhetsfunktion och vill ha rätt att stoppa en omstart. Det skulle göra allt långsammare. Ger ni en personalrepresentant inflytande över er omstart?"]),
              pb(["The word gets out", "Det läcker ut"], ["Within an hour of telling staff, a local reporter calls asking about “sabotage of safety systems” at the plant. Nothing has been said publicly. Do you confirm it, and what does the word ‘safety’ do to your customers?", "Inom en timme efter att personalen informerats ringer en lokal reporter och frågar om ”sabotage mot säkerhetssystem” i fabriken. Inget har sagts offentligt. Bekräftar ni, och vad gör ordet ’säkerhet’ med era kunder?"]),
              pb(["Every safety function?", "Varje säkerhetsfunktion?"], ["The OT engineer counts the safety functions across the plant: there are dozens, and some have not been tested since installation. Verifying all of them could take weeks. Do you narrow the scope, and who decides which ones count?", "OT-ingenjören räknar säkerhetsfunktionerna i fabriken: de är dussintals, och några har inte testats sedan installationen. Att kontrollera alla kan ta veckor. Begränsar ni omfattningen, och vem avgör vilka som räknas?"])
            ],
            B: [
              pb(["The wrong authority", "Fel myndighet"], ["The safety manager points out that a disabled safety trip is a workplace-safety matter, while the cyber report goes to a different authority. If the safety side hears about it second-hand, it will look as if you buried it. Who makes sure it reaches the right place?", "Säkerhetschefen påpekar att ett bortkopplat säkerhetsstopp är en arbetsmiljöfråga, medan cyberrapporten går till en annan myndighet. Om den sidan får höra det i andra hand ser det ut som att ni har sopat det under mattan. Vem ser till att det når rätt mottagare?"]),
              pb(["The operators weren't told", "Operatörerna fick inte veta"], ["Operators worked next to line 3 while its safety trip was disabled, and nobody has told them. One of them hears about it from an IT colleague in the car park. What do you say to that operator now?", "Operatörer arbetade bredvid linje 3 medan dess säkerhetsstopp var bortkopplat, och ingen har berättat det för dem. En av dem får höra det av en IT-kollega på parkeringen. Vad säger ni till den operatören nu?"]),
              pb(["Fixed is not tested", "Rättat är inte testat"], ["The trip setting has been corrected in the logic, but nobody has tested that the trip actually fires, and you still do not know whether other safety functions were touched. Is a corrected setting enough to call the line safe?", "Inställningen för stoppet har rättats i logiken, men ingen har testat att stoppet faktiskt löser ut, och ni vet fortfarande inte om andra säkerhetsfunktioner har rörts. Räcker en rättad inställning för att kalla linjen säker?"])
            ],
            C: [
              pb(["When did you know?", "När visste ni?"], ["Your legal adviser says safety incidents must be reported promptly, not when the investigation is finished, which could take weeks. When the authority asks when you knew about the bypass, how do you explain the gap?", "Er juridiska rådgivare säger att säkerhetsincidenter ska rapporteras skyndsamt, inte när utredningen är klar, vilket kan ta veckor. När myndigheten frågar när ni kände till förbikopplingen, hur förklarar ni glappet?"]),
              pb(["Complete enough?", "Tillräckligt klart?"], ["The investigation keeps finding small new details, and the report keeps slipping. Meanwhile the operators who stood next to line 3 still do not know. Who decides when it is complete enough to report, and to tell them?", "Utredningen hittar hela tiden nya små detaljer, och rapporten skjuts upp gång på gång. Under tiden vet operatörerna som stod bredvid linje 3 fortfarande ingenting. Vem avgör när det är tillräckligt klart för att rapportera, och för att berätta för dem?"]),
              pb(["“Fixed it quietly”", "”Fixade det i tysthet”"], ["Comms warns that if this comes out before you report it, the headline will be that you fixed a safety bypass quietly, whatever your reasons were. Can you defend the wait in public, in one sentence?", "Kommunikation varnar för att om det här kommer ut innan ni har rapporterat blir rubriken att ni fixade en förbikopplad säkerhetsfunktion i tysthet, oavsett era skäl. Kan ni försvara väntan offentligt, i en mening?"])
            ]
          }
        }),
        facilitator: fac(
          ["The gravest moment. Keep it calm and serious.", "Det allvarligaste ögonblicket. Håll det lugnt och allvarligt."],
          ["Safety reporting, staff informed and every safety function verified.", "Säkerhetsrapportering, personalen informerad och varje säkerhetsfunktion kontrollerad."],
          [["Ask: what would you say to the night-shift operators?", "Fråga: vad skulle ni säga till operatörerna på nattskiftet?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 900,
        title: L(["Permission to restart", "Tillstånd att starta"]),
        twist: L(["You cannot restart on your own: the authorities and the OT vendor must be satisfied first.", "Ni kan inte starta på egen hand: myndigheterna och OT-leverantören måste vara nöjda först."]),
        twistKind: "authority",
        branches: [
          { when: { decision: "d5", option: "A" }, narrativeAppend: { en: "Because the bypass was reported to the authorities, a labour inspector arrives tomorrow, and staff are asking whether it is safe to come to work.", sv: "Eftersom förbikopplingen rapporterades till myndigheterna kommer en arbetsmiljöinspektör i morgon, och personalen frågar om det är säkert att gå till jobbet." } }
        ],
        assumptionChallenged: L(["We restart when we are ready.", "Vi startar när vi är redo."]),
        narrative: L([
          "Morning. The authorities have been informed, and the OT vendor's engineers are on site with their reference files.\n\nProduction management wants a restart date: customers are waiting and every hour costs money. But restarting is no longer a decision {{org.name}} can take alone.",
          "Morgon. Myndigheterna har informerats, och OT-leverantörens ingenjörer är på plats med sina referensfiler.\n\nProduktionsledningen vill ha ett datum för omstart: kunderna väntar och varje timme kostar pengar. Men att starta om är inte längre ett beslut som {{org.name}} kan fatta ensamt."
        ]),
        injects: [
          inj("i6-1", 900, "regulatorLetter", "regulator", "high", "confirmed", [
            "{{reg.supervisor|cap}} asks to be informed before restart and requests confirmation that safety functions have been independently verified.",
            "{{reg.supervisor|cap}} vill informeras före omstart och begär en bekräftelse på att säkerhetsfunktionerna har kontrollerats oberoende."
          ], { pressure: "regulator", substitute: { source: "insurer", content: ["{{supplier.insurer}}: cover for restart-related damage requires documented independent verification of safety functions.", "{{supplier.insurer}}: försäkringsskyddet för skador i samband med omstarten kräver dokumenterad oberoende kontroll av säkerhetsfunktionerna."] }, tests: ["lo4"] }),
          inj("i6-2", 930, "phoneTranscript", "vendor", "medium", "confirmed", [
            "The OT vendor: “We can certify the logic against our reference, but only for controllers still on firmware we support. Two on line 3 are not.”",
            "OT-leverantören: ”Vi kan certifiera logiken mot vår referens, men bara för styrsystem som fortfarande har firmware vi stöder. Två på linje 3 har inte det.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you verify controllers the vendor won't certify?", "Hur kontrollerar ni de styrsystem som leverantören inte vill certifiera?", ["otEngineer"]),
            q("What monitoring must be in place before restart?", "Vilken bevakning måste finnas på plats före omstart?", ["socLead", "otEngineer"]),
            q("Did closing the IT/OT boundary make the restart easier?", "Gjorde stängningen av gränsen mellan IT och OT omstarten enklare?", ["networkLead"], "d4")
          ],
          executive: [
            q("Who signs off the restart, and on what evidence?", "Vem godkänner omstarten, och på vilket underlag?", ["serviceOwner", "ceo"]),
            q("Do you replace the unsupported controllers before restarting?", "Byter ni ut de styrsystem som saknar stöd före omstarten?", ["serviceOwner", "ceo"]),
            q("Does your safety-incident handling satisfy the authorities?", "Uppfyller er hantering av säkerhetsincidenten myndigheternas krav?", ["ceo"], "d5")
          ]
        },
        challenges: [ch("Two controllers on outdated firmware cannot be certified.", "Två styrsystem med föråldrad firmware går inte att certifiera.")],
        decision: dec("d6", "serviceOwner", ["What is the restart condition?", "Vilket är villkoret för omstart?"], [
          ["Independent verification of all safety functions, replacement of uncertified controllers and enhanced monitoring.", "Oberoende kontroll av alla säkerhetsfunktioner, utbyte av ocertifierade styrsystem och förstärkt bevakning."],
          ["Restart lines 1 and 2 after verification; keep line 3 down until replaced.", "Starta linje 1 och 2 efter kontroll; låt linje 3 stå tills utbytet är gjort."],
          ["Restart all lines once the vendor certifies what it can.", "Starta alla linjer när leverantören har certifierat det som går."]
        ], {
          knowns: [["Two controllers cannot be certified.", "Två styrsystem kan inte certifieras."]],
          uncertainties: [["How long replacement takes.", "Hur lång tid ett utbyte tar."]],
          tradeoffs: {
            operational: ["Replacement means days more without line 3.", "Ett utbyte innebär flera dagar till utan linje 3."],
            security: ["Uncertified controllers may still carry manipulated logic.", "Ocertifierade styrsystem kan fortfarande bära på manipulerad logik."],
            legal: ["Restarting without verification may breach safety rules.", "Att starta utan kontroll kan bryta mot säkerhetsregler."],
            reputational: ["A partial restart shows control.", "En delvis omstart visar att man har kontroll."]
          },
          evaluation: [["Restarts only what can be verified", "Startar bara det som går att kontrollera"]],
          interrupts: [
            ir("i1", { chosen: "C" }, ["Restarting on a partial certificate", "Omstart på ett delvis certifikat"], [
              io(["Customers hold on", "Kunderna väntar kvar"], ["Given a restart date, the key customers agree to hold their orders. Sales calls it the best news of the week.", "När de får ett datum för omstart går de viktigaste kunderna med på att behålla sina order. Försäljning kallar det veckans bästa nyhet."], ["Key customers are holding their orders, based on the restart date.", "De viktigaste kunderna behåller sina order, med utgångspunkt i datumet för omstart."], { meters: { trust: 1 } }),
              io(["The authority says no", "Myndigheten säger nej"], ["{{reg.supervisor|cap}} replies that restarting controllers that were not independently verified is not acceptable, and asks for the restart plan in writing.", "{{reg.supervisor|cap}} svarar att det inte är acceptabelt att starta styrsystem som inte har kontrollerats oberoende, och begär planen för omstarten skriftligt."], ["{{reg.supervisor|cap}} has rejected restarting unverified controllers.", "{{reg.supervisor|cap}} har avvisat omstart av okontrollerade styrsystem."], { reopen: true, meters: { regulator: 1 } }),
              io(["The insurer is silent", "Försäkringsbolaget tiger"], ["{{supplier.insurer}} acknowledges the plan without saying whether a restart on these terms is covered. Finance reads that as a yes; legal does not.", "{{supplier.insurer}} bekräftar att planen har kommit in utan att säga om en omstart på de villkoren omfattas. Ekonomi tolkar det som ett ja; juristen gör det inte."], ["The insurer has not said whether this restart is covered.", "Försäkringsbolaget har inte sagt om den här omstarten omfattas."])
            ]),
            ir("i2", { notChosen: "C" }, ["Waiting for verification", "I väntan på kontroll"], [
              io(["The authority approves", "Myndigheten godtar"], ["{{reg.supervisor|cap}} welcomes the verification-first approach and offers a faster review of your evidence.", "{{reg.supervisor|cap}} välkomnar att ni sätter kontrollen först och erbjuder en snabbare granskning av ert underlag."], ["{{reg.supervisor|cap}} has welcomed the verification-first approach.", "{{reg.supervisor|cap}} har välkomnat att kontrollen kommer först."], { meters: { regulator: -1 } }),
              io(["A customer leaves", "En kund går"], ["A major customer moves its next order to a competitor, saying it cannot wait for a restart with no end date.", "En stor kund flyttar sin nästa order till en konkurrent och säger att den inte kan vänta på en omstart utan slutdatum."], ["A major customer has moved an order to a competitor.", "En stor kund har flyttat en order till en konkurrent."], { reopen: true, meters: { trust: -1 } }),
              io(["Parts of unknown origin", "Delar av okänt ursprung"], ["Purchasing finds two refurbished controllers of the old model, available in four days. Nobody can say where they have been.", "Inköp hittar två renoverade styrsystem av den gamla modellen, tillgängliga om fyra dagar. Ingen kan säga var de har suttit tidigare."], ["Two refurbished replacement controllers are available, of uncertain origin.", "Två renoverade ersättningsstyrsystem finns att få, av osäkert ursprung."])
            ])
          ],
          pushback: {
            A: [
              pb(["Weeks for two parts", "Veckor för två delar"], ["The supplier quotes several weeks for replacement controllers; the old model is no longer stocked. Under your condition, the whole plant waits for two parts. Do you stand by all-or-nothing, or let verified lines run first?", "Leverantören anger flera veckors leveranstid för nya styrsystem; den gamla modellen finns inte längre i lager. Med ert villkor väntar hela fabriken på två delar. Står ni fast vid allt eller inget, eller låter ni kontrollerade linjer gå först?"]),
              pb(["Independent of whom?", "Oberoende av vem?"], ["The only firm able to verify your safety functions at short notice is a partner of the OT vendor. {{reg.supervisor|cap}} may not see that as independent. Do you wait for a truly independent party, and how long are you prepared to wait?", "Det enda företag som kan kontrollera era säkerhetsfunktioner med kort varsel är en partner till OT-leverantören. {{reg.supervisor|cap}} kanske inte ser det som oberoende. Väntar ni på en verkligt oberoende part, och hur länge är ni beredda att vänta?"]),
              pb(["Monitoring nobody has", "Bevakning som ingen har"], ["Enhanced monitoring sounds right, but the SOC has never monitored plant traffic and no tool has been chosen. The restart now waits for a project that has not started. Is this a restart condition, or a wish list?", "Förstärkt bevakning låter rätt, men SOC har aldrig bevakat trafiken i fabriken och inget verktyg är valt. Omstarten väntar nu på ett projekt som inte har börjat. Är det här ett villkor för omstart, eller en önskelista?"])
            ],
            B: [
              pb(["Line 3 is the bottleneck", "Linje 3 är flaskhalsen"], ["Production planning says most orders need something from line 3, so restarting lines 1 and 2 ships very little. The partial restart costs almost as much as a full stop. Does it actually help, or does it just look like progress?", "Produktionsplaneringen säger att de flesta order behöver något från linje 3, så att starta linje 1 och 2 ger mycket lite att leverera. Den delvisa omstarten kostar nästan lika mycket som ett fullständigt stopp. Hjälper den faktiskt, eller ser den bara ut som framsteg?"]),
              pb(["Verified against what?", "Kontrollerade mot vad?"], ["Lines 1 and 2 were programmed from the same engineering workstation as line 3. The checks found nothing, but the inspector asks how you would know if something had been hidden well. What makes you confident enough to sign?", "Linje 1 och 2 programmerades från samma ingenjörsarbetsstation som linje 3. Kontrollerna hittade inget, men inspektören frågar hur ni skulle veta om något hade gömts väl. Vad gör er tillräckligt säkra för att skriva under?"]),
              pb(["The taped-off line", "Linjen bakom avspärrningen"], ["Operators go back to lines 1 and 2 while line 3 stands beside them, taped off. They ask why their lines are safe when the one next to them is not. What do you answer, and does your answer convince you?", "Operatörerna går tillbaka till linje 1 och 2 medan linje 3 står bredvid, avspärrad. De frågar varför deras linjer är säkra när den intill inte är det. Vad svarar ni, och övertygar svaret er själva?"])
            ],
            C: [
              pb(["Two left out", "Två utelämnade"], ["The vendor's certificate covers every controller except the two on line 3, and you are about to run them anyway. {{reg.supervisor|cap}} asked for independent verification of safety functions. Do you tell them those two were left out, and what do you say when they ask why?", "Leverantörens certifikat omfattar alla styrsystem utom de två på linje 3, och ni ska köra dem ändå. {{reg.supervisor|cap}} bad om en oberoende kontroll av säkerhetsfunktionerna. Berättar ni att de två lämnades utanför, och vad säger ni när de frågar varför?"]),
              pb(["The insurer's condition", "Försäkringsbolagets villkor"], ["{{supplier.insurer}} replies that cover for damage after a restart depends on documented verification of safety functions. If anything happens on line 3, you may be on your own. Is the time you gain worth running uninsured?", "{{supplier.insurer}} svarar att försäkringsskyddet för skador efter en omstart förutsätter dokumenterad kontroll av säkerhetsfunktionerna. Om något händer på linje 3 kan ni stå utan skydd. Är tiden ni vinner värd att köra utan försäkring?"]),
              pb(["Whose signature counts?", "Vems underskrift gäller?"], ["The OT engineer refuses to sign for line 3: to them, two controllers the vendor won't certify are not verified at all. Production says the vendor's certificate is enough. Whose signature do you go with?", "OT-ingenjören vägrar skriva under för linje 3: för hen är två styrsystem som leverantören inte vill certifiera inte kontrollerade alls. Produktionen säger att leverantörens certifikat räcker. Vems underskrift går ni på?"])
            ]
          }
        }),
        facilitator: fac(
          ["External gatekeepers. Watch for impatience.", "Externa grindvakter. Se upp med otålighet."],
          ["A staged restart limited to verified equipment, with authorities informed.", "En stegvis omstart begränsad till kontrollerad utrustning, med myndigheterna informerade."],
          [["Ask: what evidence would convince you, if you were the inspector?", "Fråga: vilka bevis skulle övertyga er om ni var inspektören?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 1440,
        title: L(["Old logic, lost changes", "Gammal logik, förlorade ändringar"]),
        twist: L(["The last trusted logic backup is {{num.backupWeeks}} weeks old — recipe changes since then are lost.", "Den senaste pålitliga säkerhetskopian av logiken är {{num.backupWeeks}} veckor gammal – receptändringar sedan dess är förlorade."]),
        twistKind: "impact",
        assumptionChallenged: L(["We can simply restore the approved logic.", "Vi kan helt enkelt återställa den godkända logiken."]),
        narrative: L([
          "The next day. The verified controllers are ready, and engineers prepare to load trusted logic onto them.\n\nThe question is which logic can be trusted. The project files on the engineering workstation were in the attacker's hands, and the offline copies are older than anyone would like.",
          "Nästa dag. De verifierade styrsystemen är klara, och ingenjörerna förbereder sig för att ladda in pålitlig logik.\n\nFrågan är vilken logik som går att lita på. Projektfilerna på ingenjörsarbetsstationen har varit i angriparens händer, och de frånkopplade kopiorna är äldre än någon skulle önska."
        ]),
        injects: [
          inj("i7-1", 1440, "impactReport", "person.otEngineer", "high", "confirmed", [
            "The approved project files on the workstation can't be trusted. The offline copy is {{num.backupWeeks}} weeks old. Recipe and tuning changes made since then must be redone and validated.",
            "De godkända projektfilerna på arbetsstationen går inte att lita på. Den frånkopplade kopian är {{num.backupWeeks}} veckor gammal. Recept- och trimningsändringar som gjorts sedan dess måste göras om och valideras."
          ], { fallbackRole: "serviceOwner", tests: ["lo4"] })
        ],
        charts: [{
          id: "c7-rto", type: "rto",
          title: L(["Recovery time objective against estimated restart", "Mål för återställningstid jämfört med beräknad omstart"]),
          caption: L(["Hours.", "Timmar."]),
          data: (ctx) => ({
            services: Object.values(ctx.org.services).map((s, i) => ({ id: s.id, name: s.name, rto: s.rto, rpo: s.rpo, estimate: Math.round(s.rto * (2 + i) + ctx.vars.backupWeeks * 6) }))
          })
        }],
        questions: {
          technical: [
            q("How do you rebuild and validate weeks of changes safely?", "Hur bygger ni upp och validerar flera veckors ändringar på ett säkert sätt?", ["otEngineer"]),
            q("How should logic backups be kept from now on?", "Hur ska säkerhetskopior av logiken förvaras framöver?", ["otEngineer", "itOps"]),
            q("Does this change the restart conditions you set?", "Ändrar det här villkoren för omstart som ni satte?", ["otEngineer"], "d6")
          ],
          executive: [
            q("What do you tell customers about delivery dates?", "Vad säger ni till kunderna om leveransdatum?", ["serviceOwner", "comms"]),
            q("Do you bring in extra engineering capacity?", "Tar ni in extra ingenjörskapacitet?", ["serviceOwner", "ceo"]),
            q("Does the restart condition still balance safety and production?", "Väger villkoret för omstart fortfarande säkerhet och produktion mot varandra?", ["ceo"], "d6")
          ]
        },
        challenges: [ch("Customers expect deliveries next week.", "Kunderna förväntar sig leveranser nästa vecka.")],
        decision: dec("d7", "serviceOwner", ["How do you restore the logic?", "Hur återställer ni logiken?"], [
          ["Restore the offline copy and redo recent changes under formal validation.", "Återställ den frånkopplade kopian och gör om de senaste ändringarna med formell validering."],
          ["Use the current project files after a manual review.", "Använd de nuvarande projektfilerna efter en manuell granskning."],
          ["Restore the offline copy and run without the recent changes.", "Återställ den frånkopplade kopian och kör utan de senaste ändringarna."]
        ], {
          knowns: [["The trusted copy is {{num.backupWeeks}} weeks old.", "Den pålitliga kopian är {{num.backupWeeks}} veckor gammal."]],
          uncertainties: [["Which recent changes matter most.", "Vilka av de senaste ändringarna som är viktigast."]],
          tradeoffs: {
            operational: ["Validation takes engineers and time.", "Validering kräver ingenjörer och tid."],
            security: ["Current files may carry the attacker's changes.", "De nuvarande filerna kan bära på angriparens ändringar."],
            legal: ["Product quality obligations depend on validated recipes.", "Krav på produktkvalitet förutsätter validerade recept."],
            reputational: ["Faulty products would be worse than delay.", "Felaktiga produkter vore värre än en försening."]
          },
          evaluation: [["Uses only trusted logic as the base", "Använder bara pålitlig logik som grund"]],
          interrupts: [
            ir("i1", { chosen: "B" }, ["Running on reviewed files", "Med granskade filer"], [
              io(["Nothing more found", "Inget mer hittat"], ["The manual review finds the changes you already knew about and nothing else. The reviewers sign off with confidence.", "Den manuella granskningen hittar de ändringar ni redan kände till och inget annat. Granskarna skriver under med full övertygelse."], ["The manual review found nothing beyond the known changes.", "Den manuella granskningen hittade inget utöver de kända ändringarna."]),
              io(["An unexplained block", "Ett oförklarat block"], ["Deep in the files, a reviewer finds a block of logic nobody can explain. It might be a former contractor's work, or something left behind.", "Djupt inne i filerna hittar en granskare ett logikblock som ingen kan förklara. Det kan vara en tidigare konsults arbete, eller något som lämnats kvar."], ["The review found a logic block nobody can explain.", "Granskningen hittade ett logikblock som ingen kan förklara."], { reopen: true }),
              io(["The engineer steps aside", "Ingenjören kliver åt sidan"], ["The OT engineer records a formal objection and asks to be taken off the sign-off for the reviewed files.", "OT-ingenjören antecknar en formell invändning och ber att slippa skriva under de granskade filerna."], ["The OT engineer has refused to sign off the reviewed files.", "OT-ingenjören har vägrat skriva under de granskade filerna."])
            ]),
            ir("i2", { notChosen: "B" }, ["Back to the offline copy", "Tillbaka till den frånkopplade kopian"], [
              io(["It loads clean", "Den laddas rent"], ["The offline copy loads without errors and passes its first tests. The engineers call it the first good news in days.", "Den frånkopplade kopian laddas utan fel och klarar sina första tester. Ingenjörerna kallar det de första goda nyheterna på flera dagar."], ["The offline copy loaded and passed its first tests.", "Den frånkopplade kopian laddades och klarade sina första tester."]),
              io(["The trial batch fails", "Provbatchen underkänns"], ["The first trial batch on the restored logic fails its quality check. The recent changes mattered more than anyone thought.", "Den första provbatchen med den återställda logiken underkänns i kvalitetskontrollen. De senaste ändringarna betydde mer än någon trodde."], ["The first trial batch on the restored logic failed quality checks.", "Den första provbatchen med den återställda logiken underkändes i kvalitetskontrollen."], { reopen: true }),
              io(["Help, next week", "Hjälp, nästa vecka"], ["The former contractor behind the recent changes is reached. They can help reconstruct them, but not for a week, and at their own rate.", "Den tidigare konsulten bakom de senaste ändringarna går att nå. Hen kan hjälpa till att återskapa dem, men inte förrän om en vecka, och till eget pris."], ["The contractor behind the recent changes can help, but not for a week.", "Konsulten bakom de senaste ändringarna kan hjälpa till, men inte förrän om en vecka."])
            ])
          ],
          pushback: {
            A: [
              pb(["Changes nobody remembers", "Ändringar som ingen minns"], ["Many of the recent tuning changes were made by a contractor who has since left, with notes that just say “adjusted”. Redoing them under validation means rediscovering them first. How long are you willing to wait, and who decides when it is good enough?", "Många av de senaste trimningsändringarna gjordes av en konsult som har slutat, med anteckningar som bara säger ”justerat”. Att göra om dem med validering innebär att först lista ut dem igen. Hur länge är ni beredda att vänta, och vem avgör när det är bra nog?"]),
              pb(["The same engineers", "Samma ingenjörer"], ["Formal validation needs the same engineers who are verifying the safety functions. One of them has hardly left the site since the first night. Which work gets priority, and who tells customers about the delay?", "Formell validering kräver samma ingenjörer som kontrollerar säkerhetsfunktionerna. En av dem har knappt lämnat fabriken sedan första natten. Vilket arbete prioriteras, och vem berättar för kunderna om förseningen?"]),
              pb(["How offline is offline?", "Hur frånkopplad är frånkopplad?"], ["Someone asks where the offline copy has been kept for {{num.backupWeeks}} weeks. The answer is a drawer in the engineering office, unlocked, used by several people. How sure are you that “offline” means untouched?", "Någon frågar var den frånkopplade kopian har förvarats i {{num.backupWeeks}} veckor. Svaret är en olåst låda på ingenjörskontoret som flera personer använder. Hur säkra är ni på att ”frånkopplad” betyder orörd?"])
            ],
            B: [
              pb(["A needle in a haystack", "En nål i en höstack"], ["The project files hold thousands of lines of logic, and the attacker had access for {{num.ewsDays}} days. A manual review finds what you look for, not necessarily what was hidden. Who signs that the review was thorough enough?", "Projektfilerna innehåller tusentals rader logik, och angriparen hade åtkomst i {{num.ewsDays}} dagar. En manuell granskning hittar det ni letar efter, inte nödvändigtvis det som gömts. Vem skriver under på att granskningen var tillräckligt noggrann?"]),
              pb(["Overruling your expert", "Att köra över er expert"], ["The OT engineer has already said the project files on the workstation cannot be trusted. Choosing them anyway means overruling your own expert on their own subject. On what grounds, and will you put it in writing?", "OT-ingenjören har redan sagt att projektfilerna på arbetsstationen inte går att lita på. Att välja dem ändå innebär att köra över er egen expert i hens eget ämne. På vilka grunder, och skriver ni ner det?"]),
              pb(["The honest answer", "Det ärliga svaret"], ["{{reg.supervisor|cap}} asks which logic you will run. The honest answer is files from the compromised workstation, reviewed by hand. Will that satisfy them, and what do you do if it doesn't?", "{{reg.supervisor|cap}} frågar vilken logik ni kommer att köra. Det ärliga svaret är filer från den komprometterade arbetsstationen, granskade för hand. Kommer det att räcka för dem, och vad gör ni om det inte gör det?"])
            ],
            C: [
              pb(["Off-specification product", "Produkt utanför specifikation"], ["Quality warns that the recipes in the offline copy predate a change customers asked for. Product made with them may not meet the current specification. Do you ship it, scrap it, or tell the customers first?", "Kvalitet varnar för att recepten i den frånkopplade kopian är äldre än en ändring som kunderna begärde. Produkter som tillverkas med dem kanske inte uppfyller den nuvarande specifikationen. Levererar ni, kasserar ni, eller berättar ni för kunderna först?"]),
              pb(["Workarounds by hand", "Handpåläggning"], ["Operators remember why some tuning changes were made: to stop a valve from sticking at high speed. Without them, they will compensate by hand. Are you asking people to work around a known problem on a line that just had a safety incident?", "Operatörerna minns varför vissa trimningsändringar gjordes: för att en ventil inte skulle kärva vid hög hastighet. Utan dem får de kompensera för hand. Ber ni människor att gå runt ett känt problem på en linje som just haft en säkerhetsincident?"]),
              pb(["Temporary becomes permanent", "Tillfälligt blir permanent"], ["Nobody owns the job of putting the recent changes back, and production already treats the old logic as good enough. In a month, who will remember what was left out, and why?", "Ingen äger uppgiften att lägga tillbaka de senaste ändringarna, och produktionen behandlar redan den gamla logiken som bra nog. Om en månad, vem minns då vad som utelämnades, och varför?"])
            ]
          }
        }),
        facilitator: fac(
          ["Recovery in OT is engineering work, not a restore button.", "Återställning i OT är ingenjörsarbete, inte en återställningsknapp."],
          ["Trusted base restored and changes redone under validation.", "Pålitlig grund återställd och ändringar gjorda om med validering."],
          [["Ask: where should the trusted copy live?", "Fråga: var bör den pålitliga kopian förvaras?"]]
        )
      },
      {
        id: "p8",
        priority: 4,
        clock: 2880,
        title: L(["The sister plant", "Systerfabriken"]),
        twist: L(["The sister plant uses the same workstation image — and the same firewall rule.", "Systerfabriken använder samma avbild för arbetsstationer – och samma brandväggsregel."]),
        twistKind: "scope",
        reconsider: { decision: "d4", pressure: { en: "The sister plant has the same rule. If you closed only that one rule here, the same door is open there. If you closed every path, the vendor cannot reach either plant to help you.", sv: "Systerfabriken har samma regel. Om ni bara stängde den enda regeln här står samma dörr öppen där. Om ni stängde alla vägar kan leverantören inte nå någon av fabrikerna för att hjälpa er." } },
        assumptionChallenged: L(["The incident is limited to this plant.", "Incidenten är begränsad till den här fabriken."]),
        reveals: ["hf-sister"],
        narrative: L([
          "Two days later. The plant is slowly recovering. In a review meeting, an engineer who works at both of the company's plants mentions something almost in passing.\n\nThe room goes quiet. If they are right, the same door may be open somewhere else, at a plant that has had no alarm at all.",
          "Två dagar senare. Fabriken återhämtar sig långsamt. På ett genomgångsmöte nämner en ingenjör som arbetar vid båda företagets fabriker något nästan i förbigående.\n\nDet blir tyst i rummet. Om hen har rätt kan samma dörr stå öppen någon annanstans, i en fabrik som inte har haft något larm alls."
        ]),
        injects: [
          inj("i8-1", 2880, "employeeReport", "employee", "high", "confirmed", [
            "“Our sister plant was commissioned with the same vendor team. Same workstation image, and I'm fairly sure the same remote-desktop rule.”",
            "”Vår systerfabrik driftsattes av samma leverantörsteam. Samma avbild för arbetsstationerna, och jag är ganska säker på att samma regel för fjärrskrivbord finns där.”"
          ], { reveals: ["hf-sister"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How fast can you check and close the same path at the sister plant?", "Hur snabbt kan ni kontrollera och stänga samma väg i systerfabriken?", ["networkLead", "otEngineer"]),
            q("What signs of logic changes would you look for there?", "Vilka tecken på ändrad logik skulle ni leta efter där?", ["otEngineer"]),
            q("Did your boundary review cover other sites?", "Omfattade er granskning av gränsen andra anläggningar?", ["networkLead"], "d4")
          ],
          executive: [
            q("Do you stop the sister plant as a precaution?", "Stoppar ni systerfabriken i förebyggande syfte?", ["ceo", "serviceOwner"]),
            q("Who coordinates across sites?", "Vem samordnar mellan anläggningarna?", ["ceo", "incidentCommander"]),
            q("Would you handle the first plant differently, knowing this?", "Skulle ni ha hanterat den första fabriken annorlunda, med den här vetskapen?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Stopping a second plant doubles the commercial damage.", "Att stoppa en andra fabrik fördubblar den kommersiella skadan.")],
        decision: dec("d8", "ceo", ["What do you do at the sister plant?", "Vad gör ni i systerfabriken?"], [
          ["Close the path immediately and verify logic without stopping, with a safe stop ready.", "Stäng vägen omedelbart och kontrollera logiken utan att stoppa, med ett säkert stopp förberett."],
          ["Stop the sister plant until checked.", "Stoppa systerfabriken tills den är kontrollerad."],
          ["Close the rule and keep producing; stopping a second plant on suspicion alone would break every delivery promise you have.", "Stäng regeln och fortsätt producera; att stoppa en andra fabrik enbart på misstanke skulle bryta varje leveranslöfte ni har."]
        ], {
          knowns: [["The same path likely exists there.", "Samma väg finns troligen där."]],
          uncertainties: [["Whether the attacker used it.", "Om angriparen har använt den."]],
          tradeoffs: {
            operational: ["Stopping costs a second plant's output.", "Ett stopp kostar en andra fabriks produktion."],
            security: ["Carrying on blindly repeats the risk.", "Att fortsätta i blindo upprepar risken."],
            legal: ["Safety duties apply at both sites.", "Säkerhetsskyldigheterna gäller på båda anläggningarna."],
            reputational: ["Two incidents look like systemic failure.", "Två incidenter ser ut som ett systemfel."]
          },
          evaluation: [["Checks for the same weakness across the estate", "Söker efter samma svaghet i hela verksamheten"]],
          interrupts: [
            ir("i1", { chosen: "B" }, ["Sister plant stopped", "Systerfabriken stoppad"], [
              io(["A clean stop", "Ett rent stopp"], ["The sister plant reaches a safe stop without incident, and its staff accept the reason once it is explained.", "Systerfabriken når säkert stopp utan incidenter, och personalen godtar skälet när det förklaras."], ["The sister plant reached a safe stop without incident.", "Systerfabriken nådde säkert stopp utan incidenter."]),
              io(["The board asks why", "Styrelsen frågar varför"], ["The board chair calls: stopping a second plant with no alarms, on one engineer's memory, needs a better reason than caution. They want the decision revisited today.", "Styrelseordföranden ringer: att stoppa en andra fabrik utan larm, på grund av en ingenjörs minnesbild, kräver ett bättre skäl än försiktighet. Hen vill att beslutet omprövas i dag."], ["The board chair has asked you to justify stopping the sister plant.", "Styrelseordföranden har bett er motivera stoppet av systerfabriken."], { reopen: true }),
              io(["Nothing found, yet", "Inget hittat, än"], ["The first day of checks at the sister plant finds no differences in the logic. But the reference copies came from workstations built from the same image.", "Den första dagens kontroller i systerfabriken hittar inga skillnader i logiken. Men referenskopiorna kom från arbetsstationer byggda från samma avbild."], ["First checks at the sister plant found no differences, against references of uncertain trust.", "De första kontrollerna i systerfabriken hittade inga skillnader, mot referenser av osäker tillförlitlighet."])
            ]),
            ir("i2", { notChosen: "B" }, ["The sister plant runs on", "Systerfabriken kör vidare"], [
              io(["Deliveries kept", "Leveranserna hålls"], ["The sister plant keeps producing and every delivery goes out on time. Sales says the call was right.", "Systerfabriken fortsätter producera och varje leverans går i tid. Försäljning säger att beslutet var rätt."], ["The sister plant kept producing and met its deliveries.", "Systerfabriken fortsatte producera och höll sina leveranser."]),
              io(["One odd restart", "En udda omstart"], ["Overnight, a controller at the sister plant restarts once. Local engineers say that happens now and then. Nobody can prove it either way.", "Under natten startar ett styrsystem i systerfabriken om en gång. De lokala ingenjörerna säger att det händer ibland. Ingen kan bevisa det ena eller det andra."], ["A sister-plant controller restarted once overnight; local engineers call it routine.", "Ett styrsystem i systerfabriken startade om en gång under natten; de lokala ingenjörerna kallar det rutin."], { reopen: true }),
              io(["Operators want tests", "Operatörerna vill ha tester"], ["Sister-plant operators ask their safety representative to demand a test of every safety trip before their next shift.", "Operatörerna i systerfabriken ber sitt skyddsombud att kräva ett test av varje säkerhetsstopp före nästa skift."], ["Sister-plant operators want every safety trip tested before their next shift.", "Operatörerna i systerfabriken vill att varje säkerhetsstopp testas före nästa skift."])
            ])
          ],
          pushback: {
            A: [
              pb(["Compared with what?", "Jämfört med vad?"], ["The sister plant's engineers ask what to compare their logic against: their approved versions live on workstations built from the same image. Without a trusted reference, what does “verified” mean there?", "Systerfabrikens ingenjörer frågar vad de ska jämföra sin logik med: deras godkända versioner ligger på arbetsstationer byggda från samma avbild. Utan en pålitlig referens, vad betyder ”kontrollerad” där?"]),
              pb(["Who pulls the safe stop?", "Vem utlöser det säkra stoppet?"], ["The sister plant's manager agrees to keep running but asks who decides to trigger the safe stop, and on what signal. Their operators have not been told why the check is happening. Who has that authority there, and do the operators get told what you know?", "Systerfabrikens chef går med på att fortsätta köra men frågar vem som beslutar om det säkra stoppet, och vid vilken signal. Deras operatörer har inte fått veta varför kontrollen görs. Vem har det mandatet där, och får operatörerna veta det ni vet?"]),
              pb(["Wait one day", "Vänta en dag"], ["Closing the rule at the sister plant also cuts remote help the vendor is giving them on an unrelated fault this week. Their manager asks you to wait one day. Do you?", "Att stänga regeln i systerfabriken bryter också den fjärrhjälp leverantören ger dem med ett annat fel den här veckan. Deras chef ber er vänta en dag. Gör ni det?"])
            ],
            B: [
              pb(["A healthy plant", "En frisk fabrik"], ["The sister plant has had no alarms, no restarts and no anomalies. Its manager says you are stopping a healthy plant on one engineer's memory. What evidence would justify the stop, and do you have it?", "Systerfabriken har inte haft några larm, inga omstarter och inga avvikelser. Dess chef säger att ni stoppar en frisk fabrik på grund av en ingenjörs minnesbild. Vilka bevis skulle motivera stoppet, och har ni dem?"]),
              pb(["No fallback left", "Ingen reserv kvar"], ["Customers who were being supplied from the sister plant while your plant recovered now get nothing at all. Sales asks how long the stop will last. Can you give them a date?", "Kunder som har försörjts från systerfabriken medan er fabrik återhämtat sig får nu ingenting alls. Försäljning frågar hur länge stoppet varar. Kan ni ge dem ett datum?"]),
              pb(["Stopping is a hazard too", "Ett stopp är också en fara"], ["The sister plant's process engineer warns that an unplanned stop of their process is itself a hazard, and nobody on site has done one in years. Is a precautionary stop safer than the risk you are trying to avoid?", "Systerfabrikens processingenjör varnar för att ett oplanerat stopp av deras process i sig är en fara, och ingen på plats har gjort ett på flera år. Är ett förebyggande stopp säkrare än risken ni försöker undvika?"])
            ],
            C: [
              pb(["The image is still there", "Avbilden finns kvar"], ["Closing the rule does nothing about the workstation image, and the engineering workstation there may already have been used. If logic was changed, the plant is running on it right now. Are you checking anything, or hoping?", "Att stänga regeln gör ingenting åt avbilden för arbetsstationerna, och ingenjörsarbetsstationen där kan redan ha använts. Om logiken har ändrats körs fabriken på den just nu. Kontrollerar ni något, eller hoppas ni?"]),
              pb(["In the accident report", "I olycksrapporten"], ["The safety manager reminds you that a safety trip was disabled at one plant and the same door was open at the other. If something happens there, “we kept producing to meet deliveries” will be in the report. Who signs that sentence?", "Säkerhetschefen påminner om att ett säkerhetsstopp kopplades bort i en fabrik och att samma dörr stod öppen i den andra. Om något händer där kommer ”vi fortsatte producera för att hålla leveranserna” att stå i rapporten. Vem skriver under den meningen?"]),
              pb(["Questions on the floor", "Frågor på golvet"], ["Word from your plant has reached the sister plant's operators, who ask whether their own safety trips still work. Management there says carry on. What do you tell people working next to those lines?", "Nyheter från er fabrik har nått systerfabrikens operatörer, som frågar om deras egna säkerhetsstopp fortfarande fungerar. Ledningen där säger att de ska fortsätta. Vad säger ni till dem som arbetar bredvid de linjerna?"])
            ]
          }
        }),
        facilitator: fac(
          ["Common images and vendors spread risk.", "Gemensamma avbilder och leverantörer sprider risken."],
          ["The path closed at once and logic verified with a safe stop ready.", "Vägen stängd direkt och logiken kontrollerad med ett säkert stopp förberett."],
          [["Ask: what else is identical across your sites?", "Fråga: vad mer är identiskt mellan era anläggningar?"]]
        )
      },
      {
        id: "p9",
        priority: 5,
        clock: 7200,
        title: L(["Counting the cost", "Att räkna kostnaden"]),
        twist: L(["Customers invoke delivery penalties, and the insurer questions whether OT was in scope of the policy.", "Kunderna åberopar viten för förseningar, och försäkringsbolaget ifrågasätter om OT omfattades av försäkringen."]),
        twistKind: "impact",
        assumptionChallenged: L(["Insurance and contracts will absorb the cost.", "Försäkringar och avtal tar hand om kostnaden."]),
        narrative: L([
          "Five days later. Production is back in stages, line by line, under the vendor's supervision.\n\nThe commercial fallout arrives in the same week: customers count the late deliveries, and the insurer reads its policy again. The room has to decide what changes, now that everyone is listening.",
          "Fem dagar senare. Produktionen är tillbaka i etapper, linje för linje, under leverantörens överinseende.\n\nDe kommersiella följderna kommer samma vecka: kunderna räknar de sena leveranserna och försäkringsbolaget läser sin försäkring igen. Rummet måste bestämma vad som ändras, nu när alla lyssnar."
        ]),
        injects: [
          inj("i9-1", 7200, "email", "customer", "medium", "confirmed", [
            "Two customers invoke penalty clauses for late deliveries; one asks to audit your OT security before placing further orders.",
            "Två kunder åberopar vitesklausuler för försenade leveranser; en vill granska er OT-säkerhet innan fler beställningar läggs."
          ], { pressure: "customers", substitute: { source: "management", content: ["Sales reports that two customers are reconsidering their orders after the delays.", "Försäljning rapporterar att två kunder omprövar sina beställningar efter förseningarna."] }, tests: ["lo4"] }),
          inj("i9-2", 7230, "email", "insurer", "medium", "confirmed", [
            "{{supplier.insurer}}: “Our records list your IT environment. Please show that production control systems were declared and secured as described in your application.”",
            "{{supplier.insurer}}: ”Våra uppgifter avser er IT-miljö. Visa att produktionsstyrsystemen anmäldes och skyddades så som det beskrevs i er ansökan.”"
          ], { optional: true, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What would an OT security audit find today?", "Vad skulle en granskning av OT-säkerheten hitta i dag?", ["otEngineer", "ciso"]),
            q("Which improvements give the most protection soonest?", "Vilka förbättringar ger mest skydd snabbast?", ["ciso", "networkLead"]),
            q("Which first-night decision would you most like to have made differently?", "Vilket beslut från den första natten skulle ni helst ha fattat annorlunda?", ["incidentCommander"], "d1")
          ],
          executive: [
            q("Do you welcome the customer's audit?", "Välkomnar ni kundens granskning?", ["ceo"]),
            q("Who owns OT security from now on?", "Vem äger OT-säkerheten framöver?", ["ceo", "ciso"]),
            q("Did your restart choices protect the customer relationships?", "Skyddade era val kring omstarten kundrelationerna?", ["serviceOwner"], "d6")
          ]
        },
        challenges: [ch("Nobody formally owned OT security before the incident.", "Ingen ägde formellt OT-säkerheten före incidenten.")],
        decision: dec("d9", "ceo", ["What do you change?", "Vad ändrar ni?"], [
          ["Name an owner for OT security, fund boundary and monitoring improvements and invite the customer audit.", "Utse en ägare för OT-säkerheten, finansiera förbättringar av gräns och bevakning och bjud in till kundens granskning."],
          ["Fix the specific findings and negotiate the penalties.", "Åtgärda de specifika fynden och förhandla om vitena."],
          ["Contest the penalties as force majeure.", "Bestrid vitena som force majeure."]
        ], {
          knowns: [["Customers and the insurer are questioning OT security.", "Kunder och försäkringsbolag ifrågasätter OT-säkerheten."]],
          uncertainties: [["Whether force majeure would hold.", "Om force majeure skulle hålla."]],
          tradeoffs: {
            operational: ["OT improvements need planned downtime.", "Förbättringar av OT kräver planerade stopp."],
            security: ["Ownership is the root fix.", "Ägarskap är grundåtgärden."],
            legal: ["Force majeure for a known weakness is weak.", "Force majeure för en känd svaghet är ett svagt argument."],
            reputational: ["Openness to audit can win customers back.", "Öppenhet för granskning kan vinna tillbaka kunder."]
          },
          evaluation: [["Establishes ownership of OT security", "Etablerar ägarskap för OT-säkerheten"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["The audit is coming", "Granskningen kommer"], [
              io(["The customer stays", "Kunden stannar"], ["The customer welcomes the invitation and confirms its next order while the audit is planned.", "Kunden välkomnar inbjudan och bekräftar sin nästa order medan granskningen planeras."], ["The auditing customer has confirmed its next order.", "Den granskande kunden har bekräftat sin nästa order."], { meters: { trust: 1 } }),
              io(["An owner without teeth", "En ägare utan tänder"], ["The newly named owner of OT security says the role has no authority over the plant, and the plant manager agrees. Without that, it is just a title.", "Den nyutsedda ägaren av OT-säkerheten säger att rollen saknar mandat över fabriken, och fabrikschefen håller med. Utan det är det bara en titel."], ["The named OT security owner says the role lacks real authority.", "Den utsedda ägaren av OT-säkerheten säger att rollen saknar verkligt mandat."], { reopen: true }),
              io(["Early findings travel", "Tidiga fynd sprids"], ["The auditors' early notes are blunt, and the customer forwards them to its procurement team. Nobody knows who else will read them.", "Granskarnas första anteckningar är raka, och kunden skickar dem vidare till sin inköpsavdelning. Ingen vet vem mer som kommer att läsa dem."], ["The customer's early audit notes are circulating inside its company.", "Kundens tidiga granskningsanteckningar sprids inom kundens företag."], { meters: { trust: -1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["No owner, no audit", "Ingen ägare, ingen granskning"], [
              io(["A settlement", "En uppgörelse"], ["One customer accepts a reduced penalty without further fuss. Finance calls it proof that the cheaper route works.", "En kund godtar ett reducerat vite utan vidare diskussion. Ekonomi kallar det ett bevis på att den billigare vägen fungerar."], ["One customer has accepted a reduced penalty.", "En kund har godtagit ett reducerat vite."]),
              io(["Orders paused", "Order pausade"], ["The customer who asked for an audit pauses all orders until it can see who is accountable for OT security.", "Kunden som bad om en granskning pausar alla order tills den kan se vem som ansvarar för OT-säkerheten."], ["The customer who asked for an audit has paused all orders.", "Kunden som bad om en granskning har pausat alla order."], { reopen: true, meters: { trust: -1 } }),
              io(["The renewal question", "Frågan vid förnyelsen"], ["{{supplier.insurer}} makes renewal conditional on naming who governs OT security. The letter does not say what happens if you can't.", "{{supplier.insurer}} gör förnyelsen villkorad av att ni anger vem som styr OT-säkerheten. Brevet säger inte vad som händer om ni inte kan det."], ["The insurer's renewal depends on naming who governs OT security.", "Försäkringsbolagets förnyelse hänger på att ni anger vem som styr OT-säkerheten."])
            ])
          ],
          pushback: {
            A: [
              pb(["The audit report travels", "Granskningsrapporten sprids"], ["The customer's auditors will find the forgotten rule, the old logic backups and the unsupported controllers, and their report may reach other customers. Are you ready for that report to circulate?", "Kundens granskare kommer att hitta den bortglömda regeln, de gamla säkerhetskopiorna av logiken och styrsystemen utan support, och rapporten kan nå andra kunder. Är ni redo för att den rapporten sprids?"]),
              pb(["Nobody volunteers", "Ingen anmäler sig"], ["Nobody wants to own OT security: the CISO says it is engineering, the plant manager says it is IT. Naming an owner means giving them authority over both. Who is it, by name, and what can they overrule?", "Ingen vill äga OT-säkerheten: säkerhetschefen säger att det är ingenjörernas sak, fabrikschefen säger att det är IT:s. Att utse en ägare innebär att ge hen mandat över båda. Vem är det, med namn, och vad får hen köra över?"]),
              pb(["Paid from the same budget", "Betalt ur samma budget"], ["The improvements must be funded from the same budget that pays the penalties this year. Finance asks which planned projects you will cut to pay for them. Which ones, and who tells their owners?", "Förbättringarna måste finansieras ur samma budget som betalar vitena i år. Ekonomi frågar vilka planerade projekt ni stryker för att betala dem. Vilka, och vem berättar det för deras ägare?"])
            ],
            B: [
              pb(["The customer wants more", "Kunden vill ha mer"], ["The customer who asked for an audit says a list of fixes is not enough; they want to see who is accountable. Without the audit, their next order goes elsewhere. Do you let them in after all?", "Kunden som bad om en granskning säger att en lista över åtgärder inte räcker; de vill se vem som är ansvarig. Utan granskningen hamnar deras nästa beställning någon annanstans. Släpper ni in dem ändå?"]),
              pb(["Symptoms, not the cause", "Symtom, inte orsaken"], ["The list of findings is long, but nobody owned OT security before and nobody owns it now. Who makes sure the next forgotten rule is found before an attacker finds it?", "Listan över fynd är lång, men ingen ägde OT-säkerheten tidigare och ingen äger den nu. Vem ser till att nästa bortglömda regel hittas innan en angripare hittar den?"]),
              pb(["The insurer's question", "Försäkringsbolagets fråga"], ["{{supplier.insurer}} asks how OT security is governed now, as a condition for renewing cover. Fixing the findings and negotiating penalties leaves that question unanswered. What do you write back?", "{{supplier.insurer}} frågar hur OT-säkerheten styrs nu, som villkor för att förnya försäkringen. Att åtgärda fynden och förhandla om vitena lämnar den frågan obesvarad. Vad skriver ni tillbaka?"])
            ],
            C: [
              pb(["A door you opened", "En dörr ni själva öppnade"], ["Your lawyer says force majeure is weak when the cause was a firewall rule you opened yourselves and never closed. The customers' lawyers will say the same. Do you still fight it, knowing it may end up in public?", "Er jurist säger att force majeure är ett svagt argument när orsaken var en brandväggsregel ni själva öppnade och aldrig stängde. Kundernas jurister kommer att säga samma sak. Strider ni ändå, med vetskap om att det kan bli offentligt?"]),
              pb(["Winning the argument", "Att vinna diskussionen"], ["The customer who asked for an audit reads force majeure as you denying responsibility, and pauses all orders. Is winning the argument worth losing the customer?", "Kunden som bad om en granskning tolkar force majeure som att ni förnekar ansvar, och pausar alla beställningar. Är det värt att förlora kunden för att vinna diskussionen?"]),
              pb(["Two stories at once", "Två berättelser samtidigt"], ["{{supplier.insurer}} notes that you claim force majeure towards customers while asking the insurer to accept a cyber incident you should have prevented. The two positions do not fit together. Which one do you stand behind?", "{{supplier.insurer}} noterar att ni hävdar force majeure mot kunderna samtidigt som ni ber försäkringsbolaget godta en cyberincident som ni borde ha förhindrat. De två hållningarna går inte ihop. Vilken står ni bakom?"])
            ]
          }
        }),
        facilitator: fac(
          ["Close on ownership and investment.", "Avsluta med ägarskap och investeringar."],
          ["A named owner for OT security, funded improvements and openness to customers.", "En utsedd ägare för OT-säkerheten, finansierade förbättringar och öppenhet mot kunderna."],
          [["Ask: who will be accountable the next time a line stops at 03:00?", "Fråga: vem är ansvarig nästa gång en linje stannar klockan 03.00?"]]
        )
      }
    ],

    resolution: {
      type: "resolved",
      text: L([
        "Production restarts in stages on verified logic, the IT/OT boundary is closed at both plants, and OT security gets an owner and a budget.",
        "Produktionen startar stegvis med kontrollerad logik, gränsen mellan IT och OT stängs vid båda fabrikerna och OT-säkerheten får en ägare och en budget."
      ])
    },

    debrief: {
      keyLessons: [
        L(["In OT, safety outranks containment speed; sequence actions around it.", "I OT väger säkerheten tyngre än snabb begränsning; ordna åtgärderna kring den."]),
        L(["IT and operations must share decision-making in plant incidents.", "IT och produktion måste dela på besluten vid incidenter i fabriken."]),
        L(["One forgotten firewall rule can connect IT to OT.", "En enda bortglömd brandväggsregel kan koppla samman IT och OT."]),
        L(["Keep trusted, offline copies of controller logic.", "Förvara pålitliga, frånkopplade kopior av styrsystemens logik."])
      ],
      assumptionsVsReality: [
        avr(["IT decides containment.", "IT bestämmer över begränsningen."], ["Operations had to approve for safety.", "Produktionen måste godkänna av säkerhetsskäl."], "p2"),
        avr(["A network fault.", "Ett nätverksfel."], ["Logic was changed deliberately.", "Logiken ändrades avsiktligt."], "p3"),
        avr(["OT is separated from IT.", "OT är avskilt från IT."], ["A vendor rule connected them.", "En leverantörsregel kopplade samman dem."], "p4"),
        avr(["Only disruption.", "Bara störning."], ["A safety trip was disabled.", "Ett säkerhetsstopp kopplades bort."], "p5")
      ],
      strengthsToLookFor: [
        L(["Holding the safe stop", "Att behålla det säkra stoppet"]),
        L(["A joint IT–operations decision", "Ett gemensamt beslut mellan IT och produktion"]),
        L(["Verifying safety functions before restart", "Att kontrollera säkerhetsfunktionerna före omstart"])
      ],
      commonGaps: [
        L(["IT acting alone on the plant network", "Att IT agerar ensamt i fabriksnätet"]),
        L(["Restarting to “see if it works”", "Att starta om för att ”se om det fungerar”"]),
        L(["No trusted copy of logic", "Ingen pålitlig kopia av logiken"])
      ],
      suggestedActions: [
        act(["Review and minimise every IT-to-OT path; allow one monitored route.", "Granska och minimera varje väg mellan IT och OT; tillåt en bevakad väg."], "networkLead", "high"),
        act(["Keep signed, offline copies of controller logic and compare regularly.", "Förvara signerade, frånkopplade kopior av styrsystemens logik och jämför regelbundet."], "otEngineer", "high"),
        act(["Name an owner for OT security with a budget.", "Utse en ägare för OT-säkerheten med en budget."], "ceo", "high"),
        act(["Agree a joint IT–operations incident procedure for the plant.", "Ta fram en gemensam incidentrutin för IT och produktion i fabriken."], "incidentCommander", "medium"),
        act(["Close vendor access after commissioning, by default.", "Stäng leverantörsåtkomst efter driftsättning som standard."], "supplierManager", "medium")
      ]
    }
  });
})();
