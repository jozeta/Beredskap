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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
          ["Restart the switches and try to resume production.", "Starta om switcharna och försök återuppta produktionen."],
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
          evaluation: [["Keeps safety first", "Sätter säkerheten först"], ["Involves operations in the containment decision", "Involverar produktionen i beslutet om begränsning"]]
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
          minutes: 10
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
          evaluation: [["Refuses to run unverified logic", "Vägrar köra okontrollerad logik"]]
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
          evaluation: [["Reviews the whole boundary, not just one rule", "Granskar hela gränsen, inte bara en regel"]]
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
          ["Fix it quietly; nobody was hurt.", "Rätta det i tysthet; ingen kom till skada."]
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
          minutes: 10
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
          evaluation: [["Restarts only what can be verified", "Startar bara det som går att kontrollera"]]
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
          evaluation: [["Uses only trusted logic as the base", "Använder bara pålitlig logik som grund"]]
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
          ["Close the rule and carry on.", "Stäng regeln och fortsätt som vanligt."]
        ], {
          knowns: [["The same path likely exists there.", "Samma väg finns troligen där."]],
          uncertainties: [["Whether the attacker used it.", "Om angriparen har använt den."]],
          tradeoffs: {
            operational: ["Stopping costs a second plant's output.", "Ett stopp kostar en andra fabriks produktion."],
            security: ["Carrying on blindly repeats the risk.", "Att fortsätta i blindo upprepar risken."],
            legal: ["Safety duties apply at both sites.", "Säkerhetsskyldigheterna gäller på båda anläggningarna."],
            reputational: ["Two incidents look like systemic failure.", "Två incidenter ser ut som ett systemfel."]
          },
          evaluation: [["Checks for the same weakness across the estate", "Söker efter samma svaghet i hela verksamheten"]]
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
          evaluation: [["Establishes ownership of OT security", "Etablerar ägarskap för OT-säkerheten"]]
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
