/*
 * s22-physical-intrusion.js — "The Visitor Who Stayed" (archetype B, physical intrusion).
 *
 * A cleaner finds a small box plugged in behind the reception printer. It might
 * be a vendor's → it is a mini-computer with its own mobile connection that has
 * scanned the network for nine days → CCTV shows a visitor who followed staff
 * in without signing the log → the box captured credentials, an admin account
 * reached HR files, and a second box is found → who owns physical security
 * when facilities is outsourced → what to tell staff about holding doors.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s22-physical-intrusion",
    version: 1,
    category: "physical-intrusion",
    archetype: "ambiguous-start",
    emblem: "visitor",
    title: L(["The Visitor Who Stayed", "Besökaren som blev kvar"]),
    summary: L([
      "A cleaner finds a small box plugged in behind the reception printer. Nobody ordered it, nobody signed it in, and it has been talking to the network for more than a week.",
      "En lokalvårdare hittar en liten låda inkopplad bakom receptionens skrivare. Ingen har beställt den, ingen har skrivit in den, och den har pratat med nätverket i mer än en vecka."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Handle a suspicious device without destroying evidence", "Hantera en misstänkt enhet utan att förstöra bevis"]), teaser: L(["Careful hands", "Försiktiga händer"]) },
      { id: "lo2", text: L(["Connect physical security and cyber security in one response", "Förena fysisk säkerhet och cybersäkerhet i en och samma insats"]), teaser: L(["Where the physical and the digital meet", "Där det fysiska och det digitala möts"]) },
      { id: "lo3", text: L(["Scope credential theft from inside the network", "Avgränsa stöld av inloggningsuppgifter inifrån nätverket"]), teaser: L(["Mapping what was touched", "Att kartlägga vad som har rörts"]) },
      { id: "lo4", text: L(["Change behaviour around doors and visitors without blaming staff", "Förändra beteenden kring dörrar och besökare utan att skuldbelägga personalen"]), teaser: L(["Changing habits without blame", "Att ändra vanor utan att skuldbelägga"]) }
    ],
    mitre: ["T1200", "T1557", "T1078", "T1021", "T1213"],
    frameworks: {
      nistCsf: ["ID.AM", "PR.AA", "PR.AT", "DE.CM", "DE.AE", "RS.AN", "RS.MA"],
      iso27001: ["A.7.2", "A.7.4", "A.5.15", "A.5.24", "A.5.28", "A.6.3", "A.8.20"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "monday-morning" },
    actor: { types: ["criminal", "unknown"], motivation: L(["Unclear: espionage or groundwork for a later attack", "Oklart: spionage eller förberedelser för ett senare angrepp"]), capability: "medium" },
    variables: {
      daysActive: { min: 6, max: 14 },
      hostsScanned: { min: 200, max: 6000, scaleBy: "size", step: 10 },
      hashesCaptured: { min: 12, max: 300, scaleBy: "size" }
    },
    roles: ["incidentCommander", "securityOfficer", "facilities", "itOps", "networkLead", "socLead", "ciso", "hr", "legal", "dpo", "comms", "ceo", "supplierManager"],

    groundTruth: {
      rootCause: L([
        "A person in a contractor's high-visibility vest followed staff through the staff entrance without a badge and placed two small computers with their own mobile connections on open network ports. For {{num.daysActive}} days they mapped the network and captured login attempts; one cracked administrator password was used from the device to read files on the HR share.",
        "En person i en entreprenörs varselväst följde med personal genom personalingången utan passerkort och placerade två små datorer med egen mobilanslutning i öppna nätverksuttag. Under {{num.daysActive}} dagar kartlade de nätverket och fångade inloggningsförsök; ett knäckt administratörslösenord användes från enheten för att läsa filer på HR-utdelningen."
      ]),
      attackerTimeline: [
        { at: -14400, text: L(["Visitor follows staff through the staff entrance at 07:52.", "Besökaren följer med personal genom personalingången klockan 07.52."]) },
        { at: -14390, text: L(["First device placed behind the reception printer.", "Den första enheten placeras bakom receptionens skrivare."]) },
        { at: -14370, text: L(["Second device placed in a meeting room.", "Den andra enheten placeras i ett mötesrum."]) },
        { at: -12000, text: L(["Network mapping begins over the mobile link.", "Kartläggningen av nätverket börjar via mobilanslutningen."]) },
        { at: -2880, text: L(["Cracked administrator password used to read the HR share.", "Knäckt administratörslösenord används för att läsa HR-utdelningen."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-device", revealStage: "p2", text: L(["The box is a mini-computer with its own mobile modem, controlled from outside.", "Lådan är en minidator med eget mobilmodem som styrs utifrån."]) },
      { id: "hf-visit", revealStage: "p3", text: L(["A person in a contractor vest followed staff in without a badge and was never signed in.", "En person i entreprenörsväst följde med personalen in utan passerkort och skrevs aldrig in."]) },
      { id: "hf-second", revealStage: "p4", text: L(["A second device sits in a meeting room, and a captured admin password reached the HR files.", "En andra enhet sitter i ett mötesrum, och ett fångat administratörslösenord nådde HR-filerna."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["A box behind the printer", "En låda bakom skrivaren"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The working week has just started at {{org.name}}. A cleaner reports a small black box with a network cable and a power adapter, plugged in behind the printer in reception.\n\nThe light on it is blinking. Nobody remembers ordering anything like it, and it was not there last month. It could be a vendor's monitoring device, or it could be something much worse.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Arbetsveckan har just börjat hos {{org.name}}. En städare rapporterar en liten svart låda med nätverkskabel och nätadapter, inkopplad bakom skrivaren i receptionen.\n\nLampan på den blinkar. Ingen minns att något sådant har beställts, och den fanns inte där förra månaden. Det kan vara en leverantörs övervakningsenhet, eller något mycket värre."
        ]),
        injects: [
          inj("i1-1", 0, "employeeReport", "facilities", "medium", "unverified", [
            "“There's a little box behind the printer with a light blinking. It wasn't there last month. Should I unplug it?”",
            "”Det sitter en liten låda bakom skrivaren som blinkar. Den fanns inte där förra månaden. Ska jag dra ur den?”"
          ], { tests: ["lo1"] }),
          inj("i1-2", 20, "ticket", "serviceDesk", "low", "confirmed", [
            "Facilities asks IT: is the box behind the reception printer ours? Photo attached.",
            "Fastighet frågar IT: är lådan bakom receptionsskrivaren vår? Foto bifogat."
          ], { tests: ["lo2"] }),
          inj("i1-3", 30, "chat", "itOps", "low", "misleading", [
            "IT: “Probably the printer vendor's monitoring box. They install those sometimes.”",
            "IT: ”Förmodligen skrivarleverantörens övervakningslåda. Sådana installerar de ibland.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Plausible: vendors do install devices. This one is not theirs.", "Rimligt: leverantörer installerar ibland enheter. Den här är inte deras."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you find out what is plugged into that network port?", "Hur tar ni reda på vad som är inkopplat i det nätverksuttaget?", ["networkLead"]),
            q("What would you lose by unplugging it now?", "Vad skulle ni förlora på att dra ur den nu?", ["socLead"]),
            q("Who keeps a record of devices vendors install?", "Vem håller ordning på vilka enheter leverantörer installerar?", ["itOps", "supplierManager"])
          ],
          executive: [
            q("Is this worth more than a ticket?", "Är det här värt mer än ett ärende?", ["incidentCommander"]),
            q("Who in the building is responsible for physical security?", "Vem i byggnaden ansvarar för den fysiska säkerheten?", ["securityOfficer", "facilities"]),
            q("Who should the cleaner have reported this to, and did that work?", "Till vem borde lokalvårdaren ha rapporterat det här, och fungerade det?", ["facilities"])
          ]
        },
        challenges: [ch("The printer vendor's support line opens at nine.", "Skrivarleverantörens support öppnar klockan nio.")],
        decision: dec("d1", "securityOfficer", ["What do you do with the box?", "Vad gör ni med lådan?"], [
          ["Photograph it, leave it powered, isolate its port at the switch, and call security and IT.", "Fotografera den, låt den vara strömsatt, isolera dess port i switchen och kalla in säkerhet och IT."],
          ["Unplug it and put it in a drawer.", "Dra ur den och lägg den i en låda."],
          ["Leave it until the printer vendor confirms.", "Låt den sitta tills skrivarleverantören bekräftar."]
        ], {
          knowns: [["The box is plugged into the network.", "Lådan är inkopplad i nätverket."]],
          uncertainties: [["Whether it belongs to a vendor.", "Om den tillhör en leverantör."]],
          tradeoffs: {
            operational: ["Isolating the port takes the printer offline.", "Att isolera porten kopplar bort skrivaren."],
            security: ["Unplugging loses what is in its memory.", "Att dra ur den förlorar det som finns i dess minne."],
            legal: ["It may become evidence.", "Den kan bli bevis."],
            reputational: ["A false alarm costs little.", "Ett falsklarm kostar lite."]
          },
          evaluation: [["Cuts the network path while keeping the device intact", "Kapar nätverksvägen men behåller enheten intakt"]]
        }),
        facilitator: fac(
          ["The best move separates the device from the network at the switch, without pulling the plug.", "Det bästa draget skiljer enheten från nätverket i switchen, utan att dra ur kontakten."],
          ["Photos, port isolation, chain of custody, and security and IT together.", "Foton, isolerad port, spårbar hantering och säkerhet och IT tillsammans."],
          [["Ask: if this were a weapon, would you put it in a drawer?", "Fråga: om det här vore ett vapen, skulle ni lägga det i en låda?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 90,
        title: L(["Not ours", "Inte vår"]),
        twist: L(["The printer vendor has never seen it. Inside is a small computer with a mobile data card, and the switch logs show it has been active on your network for {{num.daysActive}} days.", "Skrivarleverantören har aldrig sett den. Inuti finns en liten dator med ett mobildatakort, och switchens loggar visar att den har varit aktiv i ert nätverk i {{num.daysActive}} dagar."]),
        twistKind: "cause",
        assumptionChallenged: L(["It is a vendor's monitoring device.", "Det är en leverantörs övervakningsenhet."]),
        reveals: ["hf-device"],
        narrative: L([
          "{{time.T+90|clock}}. The printer vendor has been asked, and does not recognise the box. {{person.networkLead.name}} and {{person.socLead.name}} look at the switch logs and open the box itself.\n\nWhat they find is not an office gadget. Someone built it on purpose, and it has been busy.",
          "Klockan {{time.T+90|clock}}. Skrivarleverantören har tillfrågats och känner inte igen lådan. {{person.networkLead.name}} och {{person.socLead.name}} tittar på switchens loggar och öppnar själva lådan.\n\nDet de hittar är ingen kontorspryl. Någon har byggt den med avsikt, och den har varit flitig."
        ]),
        injects: [
          inj("i2-1", 90, "networkEvidence", "itOps", "high", "confirmed", [
            "Port 2/0/14 (reception): unknown device, first seen {{num.daysActive}} days ago. Since then it has contacted {{num.hostsScanned|number}} internal addresses.",
            "Port 2/0/14 (receptionen): okänd enhet, sågs första gången för {{num.daysActive}} dagar sedan. Sedan dess har den kontaktat {{num.hostsScanned|number}} interna adresser."
          ], { tests: ["lo3"] }),
          inj("i2-2", 120, "forensicFinding", "forensics", "high", "confirmed", [
            "The box contains a single-board computer, a mobile data card and a battery. It does not use your internet connection at all; it talks out through the mobile network.",
            "Lådan innehåller en enkortsdator, ett mobildatakort och ett batteri. Den använder inte er internetuppkoppling alls; den kommunicerar ut via mobilnätet."
          ], { reveals: ["hf-device"], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Why did nothing on your network notice traffic going out?", "Varför märkte ingenting i ert nätverk att trafik gick ut?", ["socLead", "networkLead"]),
            q("What would it have seen from that port?", "Vad skulle den ha sett från den porten?", ["networkLead"]),
            q("Was leaving it powered the right call?", "Var det rätt att låta den vara strömsatt?", ["socLead"], "d1")
          ],
          executive: [
            q("Is this a police matter now?", "Är det här en polissak nu?", ["legal", "securityOfficer"]),
            q("Who leads: physical security or cyber security?", "Vem leder: fysisk säkerhet eller cybersäkerhet?", ["incidentCommander"]),
            q("Looking back at this morning, who should have been called first?", "Om ni ser tillbaka på i morse, vem borde ha kallats in först?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Facilities and IT each assume the other is handling it.", "Fastighet och IT tror var och en att den andra hanterar det.")],
        decision: dec("d2", "incidentCommander", ["How do you organise the response?", "Hur organiserar ni insatsen?"], [
          ["One incident team with security, facilities and IT under a single lead, and the police informed.", "En incidentgrupp med säkerhet, fastighet och IT under en gemensam ledning, och polisen informerad."],
          ["IT handles the device; facilities handles the building.", "IT hanterar enheten; fastighet hanterar byggnaden."],
          ["Treat it as a lost-property case until more is known.", "Behandla det som ett hittegodsärende tills mer är känt."]
        ], {
          knowns: [["The device is not a vendor's and talks out over mobile data.", "Enheten är inte en leverantörs och kommunicerar ut via mobildata."]],
          uncertainties: [["Who placed it, and whether there are more.", "Vem som placerade den, och om det finns fler."]],
          tradeoffs: {
            operational: ["A joint team takes people from their normal work.", "En gemensam grupp tar personal från deras ordinarie arbete."],
            security: ["Split teams miss what lies between them.", "Uppdelade grupper missar det som ligger mellan dem."],
            legal: ["Police involvement changes how evidence is handled.", "Polisens inblandning ändrar hur bevis hanteras."],
            reputational: ["Staff will hear about it either way.", "Personalen kommer att höra talas om det oavsett."]
          },
          evaluation: [["Puts physical and cyber security under one lead", "Samlar fysisk säkerhet och cybersäkerhet under en ledning"]]
        }),
        facilitator: fac(
          ["The device lives where the two disciplines meet. Watch for teams handing it to each other.", "Enheten finns där de två disciplinerna möts. Var uppmärksam på grupper som skickar den mellan sig."],
          ["A joint team, the police informed, the hunt for more devices started.", "En gemensam grupp, polisen informerad, sökandet efter fler enheter påbörjat."],
          [["Ask: if one box was placed, how many could have been?", "Fråga: om en låda placerades, hur många kan det ha varit?"]]
        )
      },
      {
        id: "p3",
        clock: 240,
        priority: 1,
        title: L(["The vest", "Västen"]),
        twist: L(["Camera footage from {{num.daysActive}} days ago shows a person in a contractor's vest following two employees through the staff entrance. The visitor log has no entry that morning.", "Kameror från för {{num.daysActive}} dagar sedan visar en person i entreprenörsväst som följer två anställda genom personalingången. Besöksliggaren har ingen post den morgonen."]),
        twistKind: "impact",
        assumptionChallenged: L(["Our badge system keeps strangers out.", "Vårt passersystem håller främlingar ute."]),
        reveals: ["hf-visit"],
        narrative: L([
          "{{time.T+240|clock}}. The box has been there for days. Someone must have carried it in and plugged it in. {{person.securityOfficer.name}} goes through the camera recordings for the morning the box first appeared on the network.\n\nThe cameras at the staff entrance are good. It takes twenty minutes to find the moment.",
          "Klockan {{time.T+240|clock}}. Lådan har funnits där i flera dagar. Någon måste ha burit in och kopplat in den. {{person.securityOfficer.name}} går igenom kamerainspelningarna från morgonen då lådan först dök upp i nätverket.\n\nKamerorna vid personalingången är bra. Det tar tjugo minuter att hitta ögonblicket."
        ]),
        injects: [
          inj("i3-1", 240, "impactReport", "facilities", "high", "confirmed", [
            "07:52: two employees badge in at the staff entrance; a third person in a vest walks in behind them carrying a toolbox. No badge, no sign-in. 08:31: the same person leaves.",
            "07.52: två anställda passerar personalingången med kort; en tredje person i väst går in bakom dem med en verktygslåda. Inget kort, ingen inskrivning. 08.31: samma person lämnar."
          ], { headline: ["Camera review, staff entrance", "Kameragenomgång, personalingången"], reveals: ["hf-visit"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Where did the visitor go in those 39 minutes, and which ports are there?", "Vart gick besökaren under de 39 minuterna, och vilka uttag finns där?", ["securityOfficer", "networkLead"]),
            q("Can you turn off open network ports in public areas?", "Kan ni stänga av öppna nätverksuttag i allmänna utrymmen?", ["networkLead"]),
            q("Did the joint team find this faster than separate teams would have?", "Hittade den gemensamma gruppen det här snabbare än separata grupper hade gjort?", ["securityOfficer"], "d2")
          ],
          executive: [
            q("The two employees held the door. What, if anything, do you say to them?", "De två anställda höll upp dörren. Vad, om något, säger ni till dem?", ["hr"]),
            q("Do you share the footage with the police?", "Delar ni filmerna med polisen?", ["legal"]),
            q("Would you organise the response the same way, knowing it started at the door?", "Skulle ni organisera insatsen likadant, när ni vet att det började vid dörren?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("Camera recordings are kept for 14 days; the earliest relevant day is about to be overwritten.", "Kamerainspelningarna sparas i 14 dagar; den tidigaste relevanta dagen håller på att skrivas över.")],
        decision: dec("d3", "securityOfficer", ["What do you do now?", "Vad gör ni nu?"], [
          ["Preserve all footage, walk the visitor's route and sweep every area for devices.", "Säkra alla inspelningar, gå besökarens väg och genomsök alla utrymmen efter enheter."],
          ["Preserve the footage and wait for the police.", "Säkra inspelningarna och vänta på polisen."],
          ["Issue a reminder about holding doors.", "Skicka ut en påminnelse om att inte hålla upp dörrar."]
        ], {
          knowns: [["The visitor was inside for 39 minutes.", "Besökaren var inne i 39 minuter."]],
          uncertainties: [["Where else they went.", "Var de mer gick."]],
          tradeoffs: {
            operational: ["A sweep disrupts every floor for a day.", "En genomsökning stör varje våning i ett dygn."],
            security: ["An unfound device keeps working.", "En enhet som inte hittas fortsätter att arbeta."],
            legal: ["Footage is personal data and evidence at once.", "Inspelningarna är både personuppgifter och bevis."],
            reputational: ["A reminder alone looks like blaming staff.", "Enbart en påminnelse ser ut som att skylla på personalen."]
          },
          evaluation: [["Follows the visitor's route physically before the footage is lost", "Följer besökarens väg fysiskt innan inspelningarna försvinner"]]
        }),
        facilitator: fac(
          ["Thirty-nine minutes is long enough for more than one box.", "Trettionio minuter räcker för mer än en låda."],
          ["Footage preserved, route walked, full sweep.", "Inspelningar säkrade, vägen gången, fullständig genomsökning."],
          [["Ask: what would you carry in a toolbox?", "Fråga: vad skulle ni bära i en verktygslåda?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 480,
        title: L(["What it caught", "Vad den fångade"]),
        twist: L(["The box was not only watching. It answered login requests on the network and collected password hashes; one administrator password was cracked and used to open the HR file share. A second box is found in a meeting room.", "Lådan bara iakttog inte. Den besvarade inloggningsförfrågningar i nätverket och samlade in lösenordshashar; ett administratörslösenord knäcktes och användes för att öppna HR:s filutdelning. En andra låda hittas i ett mötesrum."]),
        twistKind: "scope",
        assumptionChallenged: L(["It only mapped the network.", "Den kartlade bara nätverket."]),
        reveals: ["hf-second"],
        narrative: L([
          "{{time.T+480|clock}}. The forensic team has made a copy of the box's storage and gone through it. Meanwhile, a sweep team is walking through every room of the office.\n\nUntil now, the box has been treated as a spy: something that listened. The analysis shows whether it only listened, and the sweep shows whether it was alone.",
          "Klockan {{time.T+480|clock}}. Forensikteamet har kopierat lådans lagring och gått igenom den. Samtidigt går ett sökteam igenom varje rum på kontoret.\n\nHittills har lådan behandlats som en spion: något som lyssnade. Analysen visar om den bara lyssnade, och genomsökningen visar om den var ensam."
        ]),
        injects: [
          inj("i4-1", 480, "forensicFinding", "forensics", "critical", "confirmed", [
            "Tools on the box impersonate network services to collect login attempts. {{num.hashesCaptured}} password hashes collected; one administrator account cracked. That account read the HR share two days ago.",
            "Verktygen på lådan utger sig för att vara nätverkstjänster för att samla in inloggningsförsök. {{num.hashesCaptured}} lösenordshashar insamlade; ett administratörskonto knäckt. Det kontot läste HR-utdelningen för två dagar sedan."
          ], { tests: ["lo3"] }),
          inj("i4-2", 510, "employeeReport", "facilities", "high", "confirmed", [
            "Sweep team: a second box, identical, under the table in meeting room 3, behind the screen's power strip.",
            "Genomsökningen: en andra låda, likadan, under bordet i mötesrum 3, bakom skärmens grenuttag."
          ], { reveals: ["hf-second"], tests: ["lo2"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["What the boxes did", "Vad lådorna gjorde"]),
          data: kpi([
            { id: "days", label: ["Days on the network", "Dagar i nätverket"], value: (v) => v.daysActive, tone: "warn" },
            { id: "hosts", label: ["Internal hosts contacted", "Interna värdar kontaktade"], value: (v) => v.hostsScanned, tone: "warn" },
            { id: "hashes", label: ["Password hashes collected", "Insamlade lösenordshashar"], value: (v) => v.hashesCaptured, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("Which accounts need new passwords, and in what order?", "Vilka konton behöver nya lösenord, och i vilken ordning?", ["itOps", "ciso"]),
            q("How do you stop the network from answering such requests at all?", "Hur stoppar ni nätverket från att alls besvara sådana förfrågningar?", ["networkLead"]),
            q("Did the sweep plan find everything, or did you get lucky?", "Hittade genomsökningen allt, eller hade ni tur?", ["securityOfficer"], "d3")
          ],
          executive: [
            q("HR files were read. What is in them, and whose data is it?", "HR-filerna lästes. Vad finns i dem, och vems uppgifter är det?", ["hr", "dpo"]),
            q("Do you notify {{reg.dpaShort}}?", "Anmäler ni till {{reg.dpaShort}}?", ["dpo", "legal"]),
            q("Given the HR data, would you still have waited for the police?", "Med tanke på HR-uppgifterna, skulle ni fortfarande ha väntat på polisen?", ["incidentCommander"], "d3")
          ]
        },
        challenges: [ch("The administrator whose password was cracked uses the same password for the building's access-control system.", "Administratören vars lösenord knäcktes använder samma lösenord till byggnadens passersystem.")],
        decision: dec("d4", "ciso", ["How do you clean up the credentials?", "Hur städar ni upp inloggningsuppgifterna?"], [
          ["Reset every captured account, starting with administrators and the access-control system, and notify the DPA about the HR files.", "Återställ varje fångat konto, med början i administratörer och passersystemet, och anmäl HR-filerna till dataskyddsmyndigheten."],
          ["Reset the cracked administrator account only.", "Återställ bara det knäckta administratörskontot."],
          ["Force a company-wide password change next week.", "Tvinga fram ett lösenordsbyte för hela företaget nästa vecka."]
        ], {
          knowns: [["One admin account was cracked and used.", "Ett administratörskonto knäcktes och användes."]],
          uncertainties: [["Which other hashes are being cracked right now.", "Vilka andra hashar som knäcks just nu."]],
          tradeoffs: {
            operational: ["Mass resets lock people out on a busy day.", "Massåterställningar låser ute folk en hektisk dag."],
            security: ["Every collected hash is a password being cracked.", "Varje insamlad hash är ett lösenord som håller på att knäckas."],
            legal: ["HR data includes health and union information.", "HR-uppgifter innehåller uppgifter om hälsa och fackmedlemskap."],
            reputational: ["Staff whose files were read deserve to hear it from you.", "Personal vars filer lästes förtjänar att få höra det av er."]
          },
          evaluation: [["Treats every collected hash as compromised", "Behandlar varje insamlad hash som komprometterad"]]
        }),
        facilitator: fac(
          ["A device on the inside turns into a credential harvester; the HR read makes it a personal-data breach.", "En enhet på insidan blir en insamlare av inloggningsuppgifter; läsningen av HR-filerna gör det till en personuppgiftsincident."],
          ["Broad resets including the access-control system; DPA notified; affected staff told.", "Breda återställningar inklusive passersystemet; dataskyddsmyndigheten anmäld; berörd personal informerad."],
          [["Ask: which of your systems trusts that same admin password?", "Fråga: vilka av era system litar på samma administratörslösenord?"]]
        )
      },
      {
        id: "p5",
        clock: 1440,
        priority: 2,
        title: L(["Whose job was it?", "Vems jobb var det?"]),
        twist: L(["Reception and the staff entrance are run by an outsourced facilities company. Their contract says nothing about tailgating, network ports or reporting suspicious objects.", "Receptionen och personalingången sköts av ett anlitat fastighetsföretag. Deras avtal säger ingenting om medföljande obehöriga, nätverksuttag eller rapportering av misstänkta föremål."]),
        twistKind: "authority",
        assumptionChallenged: L(["Physical security is handled by the facilities company.", "Den fysiska säkerheten sköts av fastighetsföretaget."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}. The immediate technical response is under way. The question now is how a stranger could walk in, plant devices and leave twice without anyone stopping them.\n\n{{person.supplierManager.name}} reads the contract with {{supplier.facilities}}, the company that runs reception and the staff entrance.",
          "{{time.T+1440|weekday|cap}}. Den akuta tekniska hanteringen pågår. Frågan nu är hur en främling kunde gå in, placera ut enheter och gå därifrån två gånger utan att någon stoppade hen.\n\n{{person.supplierManager.name}} läser avtalet med {{supplier.facilities}}, företaget som sköter receptionen och personalingången."
        ]),
        injects: [
          inj("i5-1", 1440, "supplierNotice", "supplier", "medium", "disputed", [
            "{{supplier.facilities}}: “Our staff are not security guards. Access control is the tenant's responsibility under the contract.”",
            "{{supplier.facilities}}: ”Vår personal är inte väktare. Passerkontroll är hyresgästens ansvar enligt avtalet.”"
          ], { facilitatorNote: ["Partly true: the contract is silent, which is the real finding.", "Delvis sant: avtalet är tyst, vilket är det verkliga fyndet."], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Which network ports in public areas need to be live at all?", "Vilka nätverksuttag i allmänna utrymmen behöver alls vara aktiva?", ["networkLead"]),
            q("How would you detect the next unknown device in minutes, not days?", "Hur skulle ni upptäcka nästa okända enhet inom minuter, inte dagar?", ["socLead"]),
            q("Did the credential clean-up reach the building systems?", "Nådde städningen av inloggningsuppgifter byggnadens system?", ["itOps"], "d4")
          ],
          executive: [
            q("Who owns physical security now, by name?", "Vem äger den fysiska säkerheten nu, med namn?", ["ceo", "securityOfficer"]),
            q("What changes in the facilities contract?", "Vad ändras i fastighetsavtalet?", ["supplierManager", "legal"]),
            q("Would you have notified differently if the HR files had been payroll data?", "Skulle ni ha anmält annorlunda om HR-filerna hade varit löneuppgifter?", ["dpo"], "d4")
          ]
        },
        challenges: [ch("The facilities company points out that your own staff held the door.", "Fastighetsföretaget påpekar att er egen personal höll upp dörren.")],
        noDecision: L(["No single decision here: let the room settle who owns physical security, and record it.", "Inget enskilt beslut här: låt rummet komma fram till vem som äger den fysiska säkerheten, och dokumentera det."]),
        facilitator: fac(
          ["Ownership gaps between tenant and contractor are the root of this incident.", "Ägarskapsluckor mellan hyresgäst och entreprenör är grunden till den här incidenten."],
          ["A named owner, contract changes and port control in public areas.", "En namngiven ägare, avtalsändringar och kontroll av uttag i allmänna utrymmen."],
          [["Ask: who would have stopped the vest at the door?", "Fråga: vem skulle ha stoppat västen vid dörren?"]]
        )
      },
      {
        id: "p6",
        clock: 2880,
        priority: 3,
        title: L(["Holding the door", "Att hålla upp dörren"]),
        twist: L(["The story spreads internally in a version where “two colleagues let a burglar in”. The two employees are on sick leave, and a local paper is asking.", "Historien sprids internt i en version där ”två kollegor släppte in en inbrottstjuv”. De två anställda är sjukskrivna, och en lokaltidning ställer frågor."]),
        twistKind: "impact",
        assumptionChallenged: L(["This is a technical incident with technical fixes.", "Det här är en teknisk incident med tekniska lösningar."]),
        narrative: L([
          "{{time.T+2880|weekday|cap}}. The devices are gone, the passwords changed and the investigation is with the police. Inside the office, a different story has taken hold.\n\n{{person.hr.name}} asks for a plan before the rumours settle into the version everyone remembers. Two colleagues are at the centre of that version, and a local journalist has started asking questions.",
          "{{time.T+2880|weekday|cap}}. Enheterna är borta, lösenorden bytta och utredningen ligger hos polisen. Inne på kontoret har en annan historia tagit form.\n\n{{person.hr.name}} vill ha en plan innan ryktena sätter sig i den version som alla kommer att minnas. Två kollegor står i centrum för den versionen, och en lokaljournalist har börjat ställa frågor."
        ]),
        injects: [
          inj("i6-1", 2880, "mediaEnquiry", "media", "medium", "confirmed", [
            "“We hear there was a break-in at {{org.name}} and that devices were found in the office. Can you confirm, and was any data stolen?”",
            "”Vi hör att det har varit ett inbrott hos {{org.name}} och att enheter hittades på kontoret. Kan ni bekräfta, och stals några uppgifter?”"
          ], { pressure: "media", substitute: { type: "employeeReport", source: "employee", content: ["“People are saying a burglar planted bugs and it's the fault of two people in finance. Is that true?”", "”Folk säger att en inbrottstjuv planterade buggar och att det är två personer på ekonomi som bär skulden. Stämmer det?”"] }, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What will make tailgating harder without making the building unpleasant?", "Vad gör det svårare att följa med in obehörigt utan att göra byggnaden obehaglig att vistas i?", ["securityOfficer", "facilities"]),
            q("How do you check the building regularly for unknown devices?", "Hur kontrollerar ni byggnaden regelbundet efter okända enheter?", ["securityOfficer"]),
            q("Looking back, did you reset enough accounts?", "I efterhand, återställde ni tillräckligt många konton?", ["ciso"], "d4")
          ],
          executive: [
            q("What do you say to the two employees, and to everyone else?", "Vad säger ni till de två anställda, och till alla andra?", ["hr", "ceo"]),
            q("How do you make challenging a stranger feel normal?", "Hur gör ni det normalt att fråga en främling vem hen är?", ["hr", "securityOfficer"]),
            q("Would you organise the response differently next time?", "Skulle ni organisera insatsen annorlunda nästa gång?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("A manager proposes disciplinary action against the two employees.", "En chef föreslår disciplinära åtgärder mot de två anställda.")],
        decision: dec("d5", "ceo", ["How do you close this with staff?", "Hur avslutar ni det här med personalen?"], [
          ["A no-blame message from the CEO, support for the two employees, and a simple rule: everyone badges in, everyone may ask.", "Ett budskap utan skuldbeläggning från vd, stöd till de två anställda och en enkel regel: alla passerar med kort, alla får fråga."],
          ["A strict new policy with sanctions for holding doors.", "En strikt ny policy med sanktioner för att hålla upp dörrar."],
          ["Say nothing until the rumours die down.", "Säg ingenting tills ryktena har lagt sig."]
        ], {
          knowns: [["The employees were polite, not careless.", "De anställda var artiga, inte slarviga."]],
          uncertainties: [["Whether staff will report the next stranger.", "Om personalen kommer att rapportera nästa främling."]],
          tradeoffs: {
            operational: ["Badge rules slow everyone at the door.", "Passerregler gör alla långsammare vid dörren."],
            security: ["Fear of blame stops people reporting.", "Rädsla för skuld gör att folk slutar rapportera."],
            legal: ["Disciplinary action needs a rule that existed.", "Disciplinära åtgärder kräver en regel som fanns."],
            reputational: ["The press will ask who is to blame.", "Pressen kommer att fråga vem som bär skulden."]
          },
          evaluation: [["Changes the norm without punishing the people who were tricked", "Ändrar normen utan att straffa dem som blev lurade"]]
        }),
        facilitator: fac(
          ["Social engineering at the door works because people are kind. Punishment makes the next report less likely.", "Social manipulation vid dörren fungerar för att folk är vänliga. Straff gör nästa rapport mindre sannolik."],
          ["No-blame culture, support for the two employees, clear badge rules and permission to challenge.", "En kultur utan skuldbeläggning, stöd till de två anställda, tydliga passerregler och tillåtelse att fråga."],
          [["Ask: who reported the box in the first place, and how do you get more of that?", "Fråga: vem rapporterade lådan från början, och hur får ni mer av det?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Both devices are removed and the stolen credentials reset, but the HR files were read and the visitor is never identified.",
        "Båda enheterna tas bort och de stulna inloggningsuppgifterna återställs, men HR-filerna lästes och besökaren identifieras aldrig."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Isolate a suspicious device at the switch; do not pull its plug.", "Isolera en misstänkt enhet i switchen; dra inte ur dess kontakt."]),
        L(["Physical and cyber security need one lead when an incident crosses both.", "Fysisk säkerhet och cybersäkerhet behöver en ledning när en incident berör båda."]),
        L(["A device inside the network collects credentials: treat every captured hash as lost.", "En enhet inne i nätverket samlar in inloggningsuppgifter: behandla varje fångad hash som förlorad."]),
        L(["Tailgating is beaten by culture and design, not by blame.", "Medföljande obehöriga stoppas med kultur och utformning, inte med skuld."])
      ],
      assumptionsVsReality: [
        avr(["A vendor's monitoring box.", "En leverantörs övervakningslåda."], ["An attacker's computer with its own mobile link.", "En angripares dator med egen mobilanslutning."], "p2"),
        avr(["Badges keep strangers out.", "Passerkort håller främlingar ute."], ["Kindness let one in.", "Vänlighet släppte in en."], "p3"),
        avr(["It only watched.", "Den bara iakttog."], ["It harvested and used passwords.", "Den samlade in och använde lösenord."], "p4")
      ],
      strengthsToLookFor: [
        L(["Keeping the device intact for evidence", "Att hålla enheten intakt som bevis"]),
        L(["Sweeping the visitor's route quickly", "Att snabbt genomsöka besökarens väg"]),
        L(["Supporting the employees who held the door", "Att stötta de anställda som höll upp dörren"])
      ],
      commonGaps: [
        L(["Physical and IT teams working separately", "Att fysisk säkerhet och IT arbetar var för sig"]),
        L(["Live network ports in public areas", "Aktiva nätverksuttag i allmänna utrymmen"]),
        L(["Blaming staff for social engineering", "Att skylla på personalen för social manipulation"])
      ],
      suggestedActions: [
        act(["Disable network ports in public areas and require device authentication on the rest.", "Stäng av nätverksuttag i allmänna utrymmen och kräv enhetsautentisering på resten."], "networkLead", "high"),
        act(["Name an owner for physical security and add it to the facilities contract.", "Utse en ägare för den fysiska säkerheten och skriv in det i fastighetsavtalet."], "securityOfficer", "high"),
        act(["Alert on unknown devices appearing on the network.", "Larma när okända enheter dyker upp i nätverket."], "socLead", "medium"),
        act(["Run a no-blame campaign: everyone may ask a stranger who they are.", "Genomför en kampanj utan skuldbeläggning: alla får fråga en främling vem hen är."], "hr", "medium")
      ]
    }
  });
})();
