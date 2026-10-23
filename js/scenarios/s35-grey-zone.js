/*
 * s35-grey-zone.js — "Grey-Zone Week" (archetype E, hybrid threats; long).
 *
 * Monday: false posts claim a data cover-up → the website and app go down
 * under a DDoS that "proves" it → Tuesday: satellite interference stalls the
 * fleet → Wednesday: two fibre routes to the main site are cut, deliberately,
 * and the authorities link everything to one coordinated campaign → the
 * authorities ask for information and restraint → an employee is offered
 * money for site plans → next week: how long can you keep this up?
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s35-grey-zone",
    version: 1,
    category: "hybrid-threat",
    archetype: "compound-crisis",
    emblem: "grey-zone",
    title: L(["Grey-Zone Week", "Gråzonsveckan"]),
    summary: L([
      "A false story, an overloaded website, satellite signals that come and go, and a cut cable. Each one alone is manageable. The question is whether they are alone, and how long your organisation can keep going if they are not.",
      "En falsk berättelse, en överbelastad webbplats, satellitsignaler som kommer och går och en kapad kabel. Var för sig går de att hantera. Frågan är om de är var för sig, och hur länge er organisation orkar om de inte är det."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Counter disinformation without amplifying it", "Bemöta desinformation utan att förstärka den"]), teaser: L(["When a story travels faster than the truth", "När en berättelse färdas snabbare än sanningen"]) },
      { id: "lo2", text: L(["Connect separate incidents into a common picture", "Sätta samman separata händelser till en gemensam lägesbild"]), teaser: L(["Seeing the shape of the week", "Att se veckans mönster"]) },
      { id: "lo3", text: L(["Work with authorities in a national security context", "Samarbeta med myndigheter i ett säkerhetspolitiskt sammanhang"]), teaser: L(["Part of something larger", "En del av något större"]) },
      { id: "lo4", text: L(["Protect staff targeted for recruitment and pressure", "Skydda personal som utsätts för värvningsförsök och påtryckningar"]), teaser: L(["The people behind the systems", "Människorna bakom systemen"]) },
      { id: "lo5", text: L(["Sustain a crisis organisation over many days", "Hålla en krisorganisation igång under många dagar"]), teaser: L(["Endurance", "Uthållighet"]) }
    ],
    mitre: ["T1498", "T1491", "T1585", "T1566", "T1589"],
    frameworks: {
      nistCsf: ["GV.OC", "GV.RR", "ID.RA", "PR.AT", "PR.IR", "DE.AE", "RS.MA", "RS.CO", "RC.CO"],
      iso27001: ["A.5.5", "A.5.6", "A.5.7", "A.5.24", "A.5.26", "A.5.29", "A.6.3", "A.7.4", "A.7.5", "A.8.20"]
    },
    minStages: 4,
    maxStages: 7,
    constraints: { startWindow: "monday-morning" },
    actor: { types: ["state"], motivation: L(["Destabilisation: eroding trust in critical services without open conflict", "Destabilisering: att urholka förtroendet för samhällsviktiga tjänster utan öppen konflikt"]), capability: "high" },
    variables: {
      shares: { min: 4000, max: 90000, step: 100 },
      gbps: { min: 20, max: 160, step: 5 },
      vehicles: { min: 12, max: 300, scaleBy: "size" }
    },
    roles: ["incidentCommander", "ceo", "comms", "ciso", "socLead", "networkLead", "itOps", "securityOfficer", "facilities", "legal", "hr", "serviceOwner"],

    groundTruth: {
      rootCause: L([
        "A state-sponsored influence and sabotage campaign targeted organisations running critical services in the region over one week. It combined fabricated posts and fake leaked documents, a DDoS timed to make the false story look true, local satellite-navigation interference, two deliberate fibre cuts near {{org.name}}'s main site, phishing that reused the false story, and an attempt to recruit an employee for site plans. No single event was severe; together they were designed to exhaust crisis organisations and erode public trust.",
        "En statsunderstödd påverkans- och sabotagekampanj riktades under en vecka mot organisationer som driver samhällsviktiga tjänster i regionen. Den kombinerade påhittade inlägg och falska läckta dokument, en överbelastningsattack tajmad för att få den falska berättelsen att verka sann, lokal störning av satellitnavigering, två avsiktliga fiberavbrott nära {{org.name}}s huvudanläggning, nätfiske som återanvände den falska berättelsen och ett försök att värva en anställd för att få ritningar över anläggningen. Ingen enskild händelse var allvarlig; tillsammans var de utformade för att utmatta krisorganisationer och urholka allmänhetens förtroende."
      ]),
      attackerTimeline: [
        { at: -10080, text: L(["Fake accounts and look-alike news sites prepared.", "Falska konton och efterliknande nyhetssajter förbereds."]) },
        { at: 0, text: L(["False posts and a fake “leaked memo” published.", "Falska inlägg och en falsk ”läckt promemoria” publiceras."]) },
        { at: 480, text: L(["DDoS on the website and customer app.", "Överbelastningsattack mot webbplatsen och kundappen."]) },
        { at: 1440, text: L(["Satellite-navigation interference in the region.", "Störning av satellitnavigering i regionen."]) },
        { at: 2880, text: L(["Two fibre routes to the main site cut.", "Två fibervägar till huvudanläggningen kapas."]) },
        { at: 4320, text: L(["Employee approached with a paid offer for site plans.", "En anställd kontaktas med ett betalt erbjudande om ritningar över anläggningen."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-timed", revealStage: "p2", text: L(["The traffic flood started forty minutes after the false posts peaked, from rented infrastructure.", "Trafikfloden började fyrtio minuter efter att de falska inläggen nått sin topp, från hyrd infrastruktur."]) },
      { id: "hf-campaign", revealStage: "p4", text: L(["Authorities assess all the week's events as one state-backed campaign against several organisations.", "Myndigheterna bedömer veckans alla händelser som en statsunderstödd kampanj mot flera organisationer."]) },
      { id: "hf-recruit", revealStage: "p6", text: L(["A recruiter persona has messaged four employees with access to site plans, offering cash.", "En påhittad rekryterare har skickat meddelanden till fyra anställda med åtkomst till ritningar och erbjudit kontanter."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Monday: the story", "Måndag: berättelsen"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. A post goes viral before most staff have finished their coffee. It claims that {{org.name}} has suffered a huge data breach and is covering it up, and it attaches a “leaked internal memo” on what looks like your letterhead.\n\nThe memo is fake: wrong logo version, a manager who left last year. But it has been shared {{num.shares|number}} times in two hours, and customers are calling to ask whether they should be worried.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Ett inlägg sprids explosionsartat innan de flesta i personalen har druckit upp sitt kaffe. Det påstår att {{org.name}} har drabbats av ett enormt dataintrång och mörkar det, och bifogar en ”läckt intern promemoria” på något som ser ut som ert brevhuvud.\n\nPromemorian är falsk: fel version av logotypen, en chef som slutade förra året. Men den har delats {{num.shares|number}} gånger på två timmar, och kunder ringer för att fråga om de borde vara oroliga."
        ]),
        injects: [
          inj("i1-1", 0, "socialPost", "socialMedia", "high", "misleading", [
            "BREAKING: Leaked memo shows they've known about the breach for weeks and told staff to keep quiet. Your data is out there. Share before they delete this.",
            "JUST NU: Läckt promemoria visar att de har känt till intrånget i flera veckor och sagt åt personalen att hålla tyst. Din data finns där ute. Dela innan de raderar det här."
          ], { headline: ["Shared {{num.shares|number}} times", "Delat {{num.shares|number}} gånger"], facilitatorNote: ["Fabricated. Watch whether the room engages with the claim or checks the document.", "Påhittat. Se om rummet går in i påståendet eller kontrollerar dokumentet."], tests: ["lo1"] }),
          inj("i1-2", 30, "employeeReport", "person.comms", "medium", "confirmed", [
            "The memo uses our 2019 letterhead and is signed by a manager who left last year. The phrasing is close to ours, but some of the Swedish reads like a translation.",
            "Promemorian använder vårt brevhuvud från 2019 och är undertecknad av en chef som slutade förra året. Formuleringarna ligger nära våra, men en del av svenskan låter som en översättning."
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you check quickly that there really is no breach?", "Hur kontrollerar ni snabbt att det verkligen inte finns något intrång?", ["ciso", "socLead"]),
            q("Where did the post start, and what accounts are spreading it?", "Var startade inlägget, och vilka konton sprider det?", ["comms", "socLead"]),
            q("What would a real leak of an internal memo look like in your logs?", "Hur skulle en verklig läcka av en intern promemoria se ut i era loggar?", ["socLead"])
          ],
          executive: [
            q("Do you respond publicly, and with what?", "Svarar ni offentligt, och med vad?", ["comms", "ceo"]),
            q("Does denying it make the story bigger?", "Gör ett förnekande berättelsen större?", ["comms"]),
            q("What do you tell staff who are being asked by friends?", "Vad säger ni till personal som får frågor av vänner?", ["hr", "comms"])
          ]
        },
        challenges: [ch("A local radio station asks for an interview within the hour.", "En lokal radiostation vill ha en intervju inom en timme.")],
        decision: dec("d1", "comms", ["How do you respond to the story?", "Hur bemöter ni berättelsen?"], [
          ["Check for a breach, then publish one calm factual statement on your own channels and brief staff and customer service.", "Kontrollera om det skett ett intrång, publicera sedan ett lugnt sakligt uttalande i era egna kanaler och informera personal och kundtjänst."],
          ["Respond directly under the viral post to correct it.", "Svara direkt under det virala inlägget för att rätta det."],
          ["Say nothing; it will blow over.", "Säg ingenting; det blåser över."]
        ], {
          knowns: [["A fabricated memo is spreading fast.", "En påhittad promemoria sprids snabbt."]],
          uncertainties: [["Who is behind it and what comes next.", "Vem som ligger bakom och vad som kommer härnäst."]],
          tradeoffs: {
            operational: ["Customer service is overloaded either way.", "Kundtjänst är överbelastad oavsett."],
            security: ["Dismissing it without checking would be careless.", "Att avfärda det utan att kontrollera vore slarvigt."],
            legal: ["Fake documents on your letterhead may be a crime to report.", "Falska dokument på ert brevhuvud kan vara ett brott att anmäla."],
            reputational: ["Replying under the post feeds its reach.", "Att svara under inlägget ökar dess spridning."]
          },
          evaluation: [["Checks the facts and speaks on its own channels without feeding the false post", "Kontrollerar fakta och talar i egna kanaler utan att ge näring åt det falska inlägget"]]
        }),
        facilitator: fac(
          ["Disinformation wants engagement. A calm statement on owned channels beats arguing in replies.", "Desinformation vill ha engagemang. Ett lugnt uttalande i egna kanaler slår att argumentera i svarstrådar."],
          ["Verify, one factual statement on own channels, brief staff and customer service.", "Verifiera, ett sakligt uttalande i egna kanaler, informera personal och kundtjänst."],
          [["Ask: who benefits if you spend the day arguing with this post?", "Fråga: vem tjänar på att ni ägnar dagen åt att argumentera med det här inlägget?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 480,
        title: L(["Monday evening: the proof", "Måndag kväll: beviset"]),
        twist: L(["At 16:40 the website and customer app collapse under a {{num.gbps}} Gbit/s flood. Within minutes, new posts call it proof: “They've taken the site down to hide the breach.”", "Klockan 16.40 kollapsar webbplatsen och kundappen under en flod på {{num.gbps}} Gbit/s. Inom några minuter kallar nya inlägg det för ett bevis: ”De har tagit ner sajten för att dölja intrånget.”"]),
        twistKind: "scope",
        assumptionChallenged: L(["This is a communications problem.", "Det här är ett kommunikationsproblem."]),
        reveals: ["hf-timed"],
        narrative: L([
          "{{time.T+480|clock}}. The calm statement was working. The share rate had dropped, customer service had a script, and the radio interview went well.\n\nThen the website stops loading, and the customer app with it. {{person.networkLead.name}} watches the traffic graph turn into a wall. On social media, the people who shared the memo this morning have an explanation ready.",
          "Klockan {{time.T+480|clock}}. Det lugna uttalandet fungerade. Delningstakten hade minskat, kundtjänst hade ett manus och radiointervjun gick bra.\n\nSedan slutar webbplatsen ladda, och kundappen med den. {{person.networkLead.name}} ser trafikdiagrammet förvandlas till en vägg. I sociala medier har de som delade promemorian i morse en förklaring färdig."
        ]),
        injects: [
          inj("i2-1", 480, "networkEvidence", "person.networkLead", "critical", "confirmed", [
            "Inbound {{num.gbps}} Gbit/s from rented servers in many countries, starting 16:40, forty minutes after the second wave of posts peaked. Website and app unreachable.",
            "Inkommande {{num.gbps}} Gbit/s från hyrda servrar i många länder, med start 16.40, fyrtio minuter efter att den andra vågen av inlägg nått sin topp. Webbplats och app onåbara."
          ], { reveals: ["hf-timed"], tests: ["lo2"] }),
          inj("i2-2", 500, "socialPost", "socialMedia", "high", "misleading", [
            "And now their website is “down”. Funny how that happens the day the memo leaks. They're deleting evidence.",
            "Och nu ligger deras webbplats ”nere”. Konstigt att det händer samma dag som promemorian läcker. De raderar bevis."
          ], { facilitatorNote: ["The DDoS is being used as narrative fuel. Technical and communication responses must be linked.", "Överbelastningsattacken används som bränsle för berättelsen. Det tekniska och det kommunikativa svaret måste hänga ihop."], tests: ["lo1", "lo2"] })
        ],
        charts: [{
          id: "c2-flood", type: "line",
          title: L(["Inbound traffic", "Inkommande trafik"]), unit: L(["Gbit/s", "Gbit/s"]),
          caption: L(["Minutes around the flood.", "Minuter kring floden."]),
          data: line(["Traffic", "Trafik"], -60, 60, 10, (x, ctx) => (x < 0 ? 2 : ctx.vars.gbps))
        }],
        questions: {
          technical: [
            q("How fast can your provider filter this, and what does it cost?", "Hur snabbt kan er leverantör filtrera det här, och vad kostar det?", ["networkLead"]),
            q("Is anything else happening behind the flood?", "Händer något annat bakom floden?", ["socLead", "ciso"]),
            q("Did checking for a breach this morning give you something solid to say now?", "Gav kontrollen av ett eventuellt intrång i morse er något säkert att säga nu?", ["ciso"], "d1")
          ],
          executive: [
            q("Are the story and the attack connected, and does it matter?", "Hänger berättelsen och angreppet ihop, och spelar det någon roll?", ["incidentCommander", "ceo"]),
            q("What do you tell customers who cannot reach you?", "Vad säger ni till kunder som inte når er?", ["comms", "serviceOwner"]),
            q("Did your calm statement this morning hold up?", "Höll ert lugna uttalande från i morse?", ["comms"], "d1")
          ]
        },
        challenges: [ch("Your own statement is on the website that is now unreachable.", "Ert eget uttalande ligger på webbplatsen som nu är onåbar.")],
        decision: dec("d2", "incidentCommander", ["How do you respond?", "Hur svarar ni?"], [
          ["Treat it as one coordinated incident: filter the traffic, post the facts on channels that still work, and report to {{reg.csirt}}.", "Behandla det som en samordnad incident: filtrera trafiken, lägg ut fakta i de kanaler som fortfarande fungerar och rapportera till {{reg.csirt}}."],
          ["Handle the DDoS technically and leave the story to communications.", "Hantera överbelastningsattacken tekniskt och lämna berättelsen till kommunikationsavdelningen."],
          ["Take the website offline yourselves until the story dies down.", "Ta ner webbplatsen själva tills berättelsen har lagt sig."]
        ], {
          knowns: [["A DDoS followed the false story and is being used to support it.", "En överbelastningsattack följde på den falska berättelsen och används för att stödja den."]],
          uncertainties: [["Whether more is coming, and from whom.", "Om mer är på väg, och från vem."]],
          tradeoffs: {
            operational: ["Filtering may block some real customers.", "Filtrering kan blockera en del riktiga kunder."],
            security: ["Separating the two hides the pattern.", "Att skilja de två åt döljer mönstret."],
            legal: ["Reporting to the CSIRT helps others in the region.", "Rapportering till CSIRT hjälper andra i regionen."],
            reputational: ["Taking the site down yourselves confirms the false story.", "Att ta ner sajten själva bekräftar den falska berättelsen."]
          },
          evaluation: [["Links the technical and narrative attack and shares with authorities early", "Kopplar ihop det tekniska och det berättelsebaserade angreppet och delar tidigt med myndigheterna"]]
        }),
        facilitator: fac(
          ["Hybrid threats are designed to be handled in silos. The point is to join them up.", "Hybridhot är utformade för att hanteras i stuprör. Poängen är att koppla ihop dem."],
          ["One incident, technical filtering plus factual messaging on alternative channels, CSIRT report.", "En incident, teknisk filtrering plus saklig kommunikation i alternativa kanaler, rapport till CSIRT."],
          [["Ask: if this was planned, what would the planner want you to do next?", "Fråga: om det här var planerat, vad skulle den som planerade vilja att ni gör härnäst?"]]
        )
      },
      {
        id: "p3",
        clock: 1440,
        priority: 1,
        title: L(["Tuesday: lost signals", "Tisdag: förlorade signaler"]),
        twist: L(["Satellite navigation is disrupted across the region. {{num.vehicles}} vehicles in your fleet lose positioning, route planning fails, and two time-dependent systems start drifting.", "Satellitnavigeringen störs i hela regionen. {{num.vehicles}} fordon i er fordonsflotta tappar positioneringen, ruttplaneringen fallerar och två tidsberoende system börjar glida."]),
        twistKind: "impact",
        assumptionChallenged: L(["The website and the story are the whole problem.", "Webbplatsen och berättelsen är hela problemet."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}. The website is back behind filtering and the story is fading. The crisis team had planned to scale down to a morning meeting.\n\nAt eight, the fleet coordinator calls. Vehicles across the region are showing positions in the sea or at the airport, and the route planning system has given up. {{person.facilities.name}} reports odd behaviour on the building's own clocks.",
          "{{time.T+1440|weekday|cap}}. Webbplatsen är tillbaka bakom filtrering och berättelsen klingar av. Krisledningen hade planerat att trappa ner till ett morgonmöte.\n\nKlockan åtta ringer fordonssamordnaren. Fordon i hela regionen visar positioner ute i havet eller på flygplatsen, och ruttplaneringssystemet har gett upp. {{person.facilities.name}} rapporterar konstigt beteende i byggnadens egna klockor."
        ]),
        injects: [
          inj("i3-1", 1440, "advisory", "csirt", "high", "confirmed", [
            "Satellite navigation interference is affecting the region since 06:30. Expect positioning and timing errors. Use fallback procedures.",
            "Störning av satellitnavigering påverkar regionen sedan 06.30. Räkna med fel i positionering och tid. Använd reservrutiner."
          ], { headline: ["Navigation interference in the region", "Störning av navigering i regionen"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Which of your systems depend on satellite positioning or timing?", "Vilka av era system är beroende av satellitbaserad positionering eller tid?", ["itOps", "facilities"]),
            q("What are your fallback procedures, and does anyone know them?", "Vilka är era reservrutiner, och kan någon dem?", ["facilities", "serviceOwner"]),
            q("Did reporting to the CSIRT yesterday bring anything back to you today?", "Gav rapporten till CSIRT i går er något tillbaka i dag?", ["socLead"], "d2")
          ],
          executive: [
            q("Is this part of the same thing?", "Är det här en del av samma sak?", ["incidentCommander"]),
            q("How long can the fleet run on paper maps and phone calls?", "Hur länge kan fordonsflottan klara sig på papperskartor och telefonsamtal?", ["serviceOwner"]),
            q("Is treating everything as one incident still right, or is that overthinking?", "Är det fortfarande rätt att behandla allt som en incident, eller är det att överanalysera?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("The crisis team has slept four hours each and has meetings scheduled all week.", "Krisledningen har sovit fyra timmar var och har möten inbokade hela veckan.")],
        decision: dec("d3", "incidentCommander", ["How do you organise for the rest of the week?", "Hur organiserar ni er för resten av veckan?"], [
          ["Move to a shift pattern for the crisis team, switch the fleet to manual routines, and keep one common picture.", "Gå över till skiftschema i krisledningen, ställ om fordonsflottan till manuella rutiner och behåll en gemensam lägesbild."],
          ["Keep the same team going until it is over.", "Låt samma team fortsätta tills det är över."],
          ["Stand the crisis team down and let departments handle their own problems.", "Avveckla krisledningen och låt avdelningarna hantera sina egna problem."]
        ], {
          knowns: [["A third, unrelated-looking disruption has started.", "En tredje störning, som ser orelaterad ut, har börjat."]],
          uncertainties: [["How long the week will last.", "Hur länge veckan kommer att pågå."]],
          tradeoffs: {
            operational: ["Shifts need deputies who know the picture.", "Skift kräver ersättare som känner till läget."],
            security: ["Tired people miss patterns.", "Trötta människor missar mönster."],
            legal: ["Working-time rules still apply in a crisis.", "Arbetstidsreglerna gäller även i en kris."],
            reputational: ["Fragmented responses send mixed messages.", "Splittrade insatser ger motstridiga budskap."]
          },
          evaluation: [["Plans for endurance and keeps a single common picture", "Planerar för uthållighet och behåller en gemensam lägesbild"]]
        }),
        facilitator: fac(
          ["The campaign is designed to exhaust. Endurance becomes a decision, not an afterthought.", "Kampanjen är utformad för att utmatta. Uthållighet blir ett beslut, inte en eftertanke."],
          ["Shifts, deputies, manual fallbacks, one common picture.", "Skift, ersättare, manuella reservrutiner, en gemensam lägesbild."],
          [["Ask: who in this room should be asleep right now?", "Fråga: vem i det här rummet borde sova just nu?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 2880,
        title: L(["Wednesday: the cable", "Onsdag: kabeln"]),
        twist: L(["Both fibre routes to the main site are cut, at two places a kilometre apart, within ten minutes of each other. The police say it was deliberate, and the security service tells you that this week's events are assessed as one coordinated campaign against several organisations in the region.", "Båda fibervägarna till huvudanläggningen kapas, på två platser en kilometer ifrån varandra, inom tio minuter. Polisen säger att det var avsiktligt, och säkerhetstjänsten meddelar att veckans händelser bedöms som en samordnad kampanj mot flera organisationer i regionen."]),
        twistKind: "cause",
        assumptionChallenged: L(["We are having a run of bad luck.", "Vi har en period av otur."]),
        reveals: ["hf-campaign"],
        narrative: L([
          "{{time.T+2880|weekday|cap}}, morning. The main site goes offline: no internet, no connection to the data centre, no phones on the fixed network. {{person.networkLead.name}} switches to the backup mobile links, which carry about a tenth of the normal traffic.\n\nAt eleven, two plain-clothes officers ask for {{person.securityOfficer.name}} at reception. What they have to say changes how everyone in the room sees Monday and Tuesday.",
          "{{time.T+2880|weekday|cap}}, förmiddag. Huvudanläggningen tappar förbindelsen: inget internet, ingen anslutning till datahallen, inga telefoner på det fasta nätet. {{person.networkLead.name}} går över till reservförbindelserna via mobilnätet, som klarar ungefär en tiondel av den normala trafiken.\n\nKlockan elva frågar två civilklädda polisanställda efter {{person.securityOfficer.name}} i receptionen. Det de har att säga ändrar hur alla i rummet ser på måndagen och tisdagen."
        ]),
        injects: [
          inj("i4-1", 2880, "ticket", "person.networkLead", "critical", "confirmed", [
            "Both fibre routes to the main site down at 05:52 and 06:01. The carrier reports physical cuts at two locations, 1.1 km apart. Backup mobile links active at about 10 percent capacity.",
            "Båda fibervägarna till huvudanläggningen nere 05.52 och 06.01. Operatören rapporterar fysiska avbrott på två platser, 1,1 km ifrån varandra. Reservförbindelser via mobilnätet aktiva med ungefär 10 procents kapacitet."
          ], { tests: ["lo2"] }),
          inj("i4-2", 2940, "phoneTranscript", "police", "high", "confirmed", [
            "The officers: “The cuts were made with tools, by people who knew where to dig. Together with the security service, we assess the posts, the overload, the interference and this as one campaign. You are not the only target.”",
            "Polisen: ”Kablarna kapades med verktyg, av personer som visste var de skulle gräva. Tillsammans med säkerhetstjänsten bedömer vi inläggen, överbelastningen, störningen och det här som en kampanj. Ni är inte det enda målet.”"
          ], { reveals: ["hf-campaign"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["The week so far", "Veckan hittills"]),
          data: kpi([
            { id: "sh", label: ["Shares of the false memo", "Delningar av den falska promemorian"], value: (v) => v.shares, tone: "warn" },
            { id: "gb", label: ["Peak flood (Gbit/s)", "Toppflöde (Gbit/s)"], value: (v) => v.gbps, tone: "warn" },
            { id: "veh", label: ["Vehicles without positioning", "Fordon utan positionering"], value: (v) => v.vehicles, tone: "warn" },
            { id: "fib", label: ["Fibre routes cut", "Kapade fibervägar"], value: 2, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("What must run on ten percent of normal capacity, and what can wait?", "Vad måste köras på tio procent av normal kapacitet, och vad kan vänta?", ["networkLead", "itOps"]),
            q("What else at the site is physically exposed in the same way?", "Vad mer vid anläggningen är fysiskt exponerat på samma sätt?", ["facilities", "securityOfficer"]),
            q("Did the shift pattern help you meet this with rested people?", "Hjälpte skiftschemat er att möta det här med utvilade personer?", ["incidentCommander"], "d3")
          ],
          executive: [
            q("What changes now that you know it is a campaign?", "Vad ändras nu när ni vet att det är en kampanj?", ["ceo", "incidentCommander"]),
            q("What can you say publicly, and what must you not?", "Vad kan ni säga offentligt, och vad får ni inte säga?", ["comms", "legal"]),
            q("Looking at the whole week, was joining the incidents up on Monday right?", "När ni ser på hela veckan, var det rätt att koppla ihop händelserna i måndags?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("Staff are frightened, and some ask whether they are safe coming to work.", "Personalen är rädd, och en del frågar om det är säkert att komma till jobbet.")],
        decision: dec("d4", "ceo", ["How do you respond to a campaign?", "Hur svarar ni på en kampanj?"], [
          ["Raise physical security, prioritise essential services on the backup links, share fully with authorities, and brief staff honestly about their safety.", "Höj det fysiska skyddet, prioritera samhällsviktiga tjänster på reservförbindelserna, dela fullt ut med myndigheterna och informera personalen ärligt om deras säkerhet."],
          ["Focus on restoring connectivity and leave the rest to the authorities.", "Fokusera på att återställa förbindelserna och lämna resten till myndigheterna."],
          ["Go public that you are under attack by a foreign state.", "Gå ut offentligt med att ni angrips av en främmande stat."]
        ], {
          knowns: [["The week's events are one deliberate campaign.", "Veckans händelser är en avsiktlig kampanj."]],
          uncertainties: [["What the campaign's next step is.", "Vad kampanjens nästa steg är."]],
          tradeoffs: {
            operational: ["Raising security slows everyday work.", "Att höja skyddet bromsar vardagsarbetet."],
            security: ["Leaving it all to authorities ignores what only you can protect.", "Att lämna allt till myndigheterna bortser från det som bara ni kan skydda."],
            legal: ["Attributing to a state is not your call to make publicly.", "Att peka ut en stat är inte ert beslut att fatta offentligt."],
            reputational: ["Fear among staff spreads faster than any post.", "Rädsla bland personalen sprids snabbare än något inlägg."]
          },
          evaluation: [["Protects people and essential services and stays aligned with authorities", "Skyddar människor och samhällsviktiga tjänster och håller linje med myndigheterna"]]
        }),
        facilitator: fac(
          ["The reframe: not bad luck but a campaign. The organisation becomes part of a national picture.", "Omtolkningen: inte otur utan en kampanj. Organisationen blir en del av en nationell lägesbild."],
          ["Physical security up, essential services first, full sharing, honest staff briefing.", "Höjt fysiskt skydd, samhällsviktiga tjänster först, fullt informationsutbyte, ärlig information till personalen."],
          [["Ask: what does a campaign want that a single incident does not?", "Fråga: vad vill en kampanj som en enskild incident inte vill?"]]
        )
      },
      {
        id: "p5",
        clock: 3600,
        priority: 2,
        title: L(["Wednesday evening: restraint", "Onsdag kväll: återhållsamhet"]),
        twist: L(["The authorities ask you to share all logs and observations with them, and to say nothing publicly about the campaign or the fibre cuts while they work. A journalist already knows about the cables.", "Myndigheterna ber er dela alla loggar och iakttagelser med dem, och att inte säga något offentligt om kampanjen eller fiberavbrotten medan de arbetar. En journalist känner redan till kablarna."]),
        twistKind: "authority",
        assumptionChallenged: L(["We decide what we tell the public.", "Vi bestämmer vad vi berättar för allmänheten."]),
        narrative: L([
          "{{time.T+3600|clock}}. A liaison officer from the regional civil preparedness authority joins the crisis meeting by phone, along with the police. They thank the team for the reports sent on Monday and Tuesday.\n\nThey also have two requests. One is easy. The other puts {{person.comms.name}} in a difficult position, because a local reporter called an hour ago asking about “sabotage near your site”.",
          "Klockan {{time.T+3600|clock}}. En sambandsperson från den regionala beredskapsmyndigheten ansluter till krismötet per telefon, tillsammans med polisen. De tackar teamet för rapporterna som skickades i måndags och tisdags.\n\nDe har också två önskemål. Det ena är enkelt. Det andra sätter {{person.comms.name}} i en svår sits, eftersom en lokal reporter ringde för en timme sedan och frågade om ”sabotage nära er anläggning”."
        ]),
        injects: [
          inj("i5-1", 3600, "regulatorLetter", "regulator", "high", "confirmed", [
            "Request: share all technical indicators, logs and observations from this week with the national coordination cell. Do not comment publicly on the fibre cuts or a possible campaign while the investigation is under way.",
            "Begäran: dela alla tekniska indikatorer, loggar och iakttagelser från veckan med den nationella samordningsfunktionen. Kommentera inte offentligt fiberavbrotten eller en möjlig kampanj medan utredningen pågår."
          ], { headline: ["Request from the coordination cell", "Begäran från samordningsfunktionen"], tests: ["lo3"] }),
          inj("i5-2", 3660, "mediaEnquiry", "media", "medium", "confirmed", [
            "“We hear two fibre cables near your site were cut on purpose this morning. Is this connected to Monday's website problems and the leaked memo?”",
            "”Vi hör att två fiberkablar nära er anläggning kapades med avsikt i morse. Hänger det ihop med måndagens problem med webbplatsen och den läckta promemorian?”"
          ], { tests: ["lo1", "lo3"] })
        ],
        questions: {
          technical: [
            q("What can you share quickly that is actually useful to others?", "Vad kan ni dela snabbt som faktiskt är till nytta för andra?", ["socLead", "networkLead"]),
            q("How do you share logs safely when your main site is half offline?", "Hur delar ni loggar säkert när huvudanläggningen är halvt nedkopplad?", ["itOps"]),
            q("Did raising physical security change anything you have seen since?", "Ändrade det höjda fysiska skyddet något ni har sett sedan dess?", ["securityOfficer"], "d4")
          ],
          executive: [
            q("What do you tell the journalist without breaking the request?", "Vad säger ni till journalisten utan att bryta mot begäran?", ["comms", "legal"]),
            q("Who decides when your duty to customers outweighs the authorities' request?", "Vem bestämmer när er skyldighet mot kunderna väger tyngre än myndigheternas begäran?", ["ceo", "legal"]),
            q("Was briefing staff honestly the right call, given the request for restraint?", "Var det rätt att informera personalen ärligt, med tanke på begäran om återhållsamhet?", ["hr"], "d4")
          ]
        },
        challenges: [ch("A false post now claims the fibre cuts were done by your own staff to hide evidence.", "Ett falskt inlägg påstår nu att fiberavbrotten utfördes av er egen personal för att dölja bevis.")],
        noDecision: L(["No vote: the authorities lead on the campaign. Let the room agree what to share, what to say to the journalist, and where its own line is.", "Ingen omröstning: myndigheterna leder arbetet med kampanjen. Låt rummet komma överens om vad som ska delas, vad som ska sägas till journalisten och var den egna gränsen går."]),
        facilitator: fac(
          ["Coordination with authorities limits your voice. Agree a line that is true and says little.", "Samordning med myndigheter begränsar er röst. Kom överens om en linje som är sann och säger lite."],
          ["Share fully, give the journalist a short, true holding line, and agree on escalation with the authorities.", "Dela fullt ut, ge journalisten en kort och sann första kommentar och kom överens med myndigheterna om eskalering."],
          [["Ask: what is the shortest true answer you can give the journalist?", "Fråga: vilket är det kortaste sanna svaret ni kan ge journalisten?"]]
        )
      },
      {
        id: "p6",
        mandatory: true,
        clock: 4320,
        title: L(["Thursday: the offer", "Torsdag: erbjudandet"]),
        twist: L(["An engineer tells HR she was offered cash on a professional networking site for “a consulting job”: drawings of the main site's power and cooling. The same recruiter profile has messaged three other employees with access to site plans.", "En tekniker berättar för HR att hon via ett yrkesnätverk har erbjudits kontanter för ”ett konsultuppdrag”: ritningar över huvudanläggningens el och kylning. Samma rekryterarprofil har skickat meddelanden till tre andra anställda med åtkomst till ritningar."]),
        twistKind: "scope",
        assumptionChallenged: L(["The campaign attacks our systems and reputation, not our people.", "Kampanjen angriper våra system och vårt anseende, inte vår personal."]),
        reveals: ["hf-recruit"],
        narrative: L([
          "{{time.T+4320|weekday|cap}}. The fibre is spliced and the main site is back. The posts have slowed down. {{person.hr.name}} asks for five minutes alone with {{person.securityOfficer.name}} before the morning meeting starts.\n\nAn engineer came to HR in tears. She had not done anything wrong. She had only answered a friendly message from a recruiter, and the questions became more specific with every reply.",
          "{{time.T+4320|weekday|cap}}. Fibern är skarvad och huvudanläggningen är tillbaka. Inläggen har saktat in. {{person.hr.name}} ber om fem minuter ensam med {{person.securityOfficer.name}} innan morgonmötet börjar.\n\nEn tekniker kom till HR i tårar. Hon hade inte gjort något fel. Hon hade bara svarat på ett vänligt meddelande från en rekryterare, och frågorna blev mer specifika för varje svar."
        ]),
        injects: [
          inj("i6-1", 4320, "employeeReport", "person.hr", "high", "confirmed", [
            "“He said he worked for an engineering firm and needed reference drawings for a similar site. He offered more than my monthly salary. When I asked why he needed ours specifically, he stopped answering, then wrote again with a higher offer.”",
            "”Han sa att han arbetade för en ingenjörsfirma och behövde referensritningar för en liknande anläggning. Han erbjöd mer än min månadslön. När jag frågade varför han behövde just våra slutade han svara, och skrev sedan igen med ett högre bud.”"
          ], { reveals: ["hf-recruit"], tests: ["lo4"] }),
          inj("i6-2", 4380, "phishingEmail", "attacker", "medium", "confirmed", [
            "Following this week's security incidents, all staff must re-confirm their credentials on the new secure portal by Friday.",
            "Efter veckans säkerhetsincidenter måste all personal bekräfta sina inloggningsuppgifter på den nya säkra portalen senast fredag."
          ], { headline: ["Mandatory security update", "Obligatorisk säkerhetsuppdatering"], meta: { from: "security@{{asset.lookalikeDomain}}", subject: L(["Mandatory security update", "Obligatorisk säkerhetsuppdatering"]) }, optional: true, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Who has access to site plans and drawings, and where are they stored?", "Vem har åtkomst till ritningar över anläggningen, och var förvaras de?", ["securityOfficer", "facilities"]),
            q("How do you warn staff about the phishing that reuses this week's news?", "Hur varnar ni personalen för nätfisket som återanvänder veckans nyheter?", ["ciso", "comms"]),
            q("Did the sharing with authorities give them what they needed to act on this?", "Gav informationsutbytet med myndigheterna dem det de behövde för att agera på det här?", ["securityOfficer"], "d4")
          ],
          executive: [
            q("How do you protect the four employees, and the next ones?", "Hur skyddar ni de fyra anställda, och nästa som kontaktas?", ["hr", "securityOfficer"]),
            q("What do you tell all staff without causing suspicion of colleagues?", "Vad säger ni till all personal utan att väcka misstankar mot kollegor?", ["hr", "comms"]),
            q("Would leaving the campaign to the authorities have missed this?", "Hade det här missats om kampanjen lämnats åt myndigheterna?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("One of the four has not replied to HR and is on leave this week.", "En av de fyra har inte svarat HR och är ledig den här veckan.")],
        decision: dec("d5", "securityOfficer", ["How do you respond?", "Hur svarar ni?"], [
          ["Thank and protect the engineer, contact the other three supportively, restrict access to drawings, report to the police, and brief all staff on approaches like this.", "Tacka och skydda teknikern, kontakta de tre andra på ett stödjande sätt, begränsa åtkomsten till ritningar, anmäl till polisen och informera all personal om sådana här kontaktförsök."],
          ["Investigate the other three quietly before talking to them.", "Utred de tre andra i tysthet innan ni pratar med dem."],
          ["Keep it within HR and security to avoid alarm.", "Håll det inom HR och säkerhet för att undvika oro."]
        ], {
          knowns: [["Several employees with access to site plans were targeted for recruitment.", "Flera anställda med åtkomst till ritningar har utsatts för värvningsförsök."]],
          uncertainties: [["Whether anyone has already shared something.", "Om någon redan har delat något."]],
          tradeoffs: {
            operational: ["Restricting drawings slows maintenance work.", "Att begränsa ritningarna bromsar underhållsarbetet."],
            security: ["Treating targets as suspects stops people from reporting.", "Att behandla måltavlor som misstänkta får folk att sluta rapportera."],
            legal: ["Approaches like this may be crimes the police must know about.", "Kontaktförsök som detta kan vara brott som polisen måste känna till."],
            reputational: ["Staff will remember how the engineer was treated.", "Personalen kommer att minnas hur teknikern behandlades."]
          },
          evaluation: [["Protects the people who report and closes the access that was targeted", "Skyddar dem som rapporterar och stänger den åtkomst som var måltavla"]]
        }),
        facilitator: fac(
          ["The campaign reaches people. How you treat the engineer decides whether the next approach is reported.", "Kampanjen når människor. Hur ni behandlar teknikern avgör om nästa kontaktförsök rapporteras."],
          ["Protect and thank, supportive outreach, restrict drawings, police report, staff briefing.", "Skydda och tacka, stödjande kontakt, begränsade ritningar, polisanmälan, information till personalen."],
          [["Ask: what would make someone tell you about an offer like this?", "Fråga: vad skulle få någon att berätta för er om ett sådant erbjudande?"]]
        )
      },
      {
        id: "p7",
        clock: 10080,
        priority: 3,
        title: L(["The week after", "Veckan efter"]),
        twist: L(["The regional preparedness authority warns that campaigns like this tend to return in waves, and asks each organisation running essential services to show how it would sustain operations through a month of similar disruption.", "Den regionala beredskapsmyndigheten varnar för att kampanjer som den här brukar återkomma i vågor, och ber varje organisation som driver samhällsviktiga tjänster visa hur den skulle upprätthålla verksamheten under en månad av liknande störningar."]),
        twistKind: "scope",
        assumptionChallenged: L(["It is over.", "Det är över."]),
        narrative: L([
          "{{time.T+10080|weekday|cap}}. A week later. Services are normal, the false posts are gone, and the police investigation continues out of sight. The crisis team meets one last time, and most of its members look as though they need a holiday.\n\nA letter from the regional preparedness authority turns the review into a different conversation. The question is no longer what happened last week, but what you would do if it happened every week for a month.",
          "{{time.T+10080|weekday|cap}}. En vecka senare. Tjänsterna fungerar normalt, de falska inläggen är borta och polisutredningen fortsätter i det tysta. Krisledningen träffas en sista gång, och de flesta ser ut att behöva semester.\n\nEtt brev från den regionala beredskapsmyndigheten gör genomgången till ett annat samtal. Frågan är inte längre vad som hände förra veckan, utan vad ni skulle göra om det hände varje vecka i en månad."
        ]),
        injects: [
          inj("i7-1", 10080, "regulatorLetter", "regulator", "medium", "confirmed", [
            "We expect further campaigns of this kind. Please describe within 30 days how you would sustain essential services through a month of combined disinformation, cyber attacks and physical disruption, including staffing.",
            "Vi räknar med fler kampanjer av det här slaget. Beskriv inom 30 dagar hur ni skulle upprätthålla samhällsviktiga tjänster under en månad av kombinerad desinformation, cyberangrepp och fysiska störningar, inklusive bemanning."
          ], { tests: ["lo5"] })
        ],
        questions: {
          technical: [
            q("Which of last week's workarounds could last a month?", "Vilka av förra veckans nödlösningar skulle hålla i en månad?", ["itOps", "networkLead"]),
            q("Where are you still physically exposed?", "Var är ni fortfarande fysiskt exponerade?", ["facilities", "securityOfficer"]),
            q("Looking back, how did the shift pattern work?", "När ni ser tillbaka, hur fungerade skiftschemat?", ["incidentCommander"], "d3")
          ],
          executive: [
            q("How many people does your crisis organisation really have, two deep?", "Hur många personer har er krisorganisation egentligen, med ersättare?", ["incidentCommander", "hr"]),
            q("What did you learn about speaking when others lead?", "Vad lärde ni er om att kommunicera när andra leder?", ["comms"]),
            q("Which decision of the week mattered most?", "Vilket beslut under veckan spelade störst roll?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("Two members of the crisis team have reported sick from exhaustion.", "Två medlemmar i krisledningen har sjukskrivit sig på grund av utmattning.")],
        decision: dec("d6", "ceo", ["What do you build?", "Vad bygger ni?"], [
          ["A crisis organisation two deep, rehearsed fallbacks for communications and positioning, physical protection of key routes, and a standing link to authorities.", "En krisorganisation med dubbla ersättare, inövade reservrutiner för kommunikation och positionering, fysiskt skydd av viktiga ledningar och en stående kontakt med myndigheterna."],
          ["A detailed plan document for the authority.", "Ett detaljerat plandokument till myndigheten."],
          ["A larger communications team for the next disinformation wave.", "Ett större kommunikationsteam inför nästa desinformationsvåg."]
        ], {
          knowns: [["The campaign may return, and the team is exhausted.", "Kampanjen kan komma tillbaka, och teamet är utmattat."]],
          uncertainties: [["When the next wave comes and what form it takes.", "När nästa våg kommer och vilken form den tar."]],
          tradeoffs: {
            operational: ["Deputies and exercises cost time every month.", "Ersättare och övningar kostar tid varje månad."],
            security: ["A plan on paper does not keep people awake for a month.", "En plan på papper håller inte folk vakna i en månad."],
            legal: ["Essential-service duties include preparedness.", "Skyldigheterna för samhällsviktig verksamhet omfattar beredskap."],
            reputational: ["The public will judge the second wave harder than the first.", "Allmänheten kommer att döma den andra vågen hårdare än den första."]
          },
          evaluation: [["Builds endurance in people and fallbacks, not only in documents", "Bygger uthållighet hos människor och i reservrutiner, inte bara i dokument"]]
        }),
        facilitator: fac(
          ["End on endurance and preparedness: hybrid threats are long games.", "Avsluta med uthållighet och beredskap: hybridhot är ett långt spel."],
          ["Two-deep crisis roles, rehearsed fallbacks, protected key routes, standing authority links.", "Krisroller med dubbla ersättare, inövade reservrutiner, skyddade viktiga ledningar, stående kontakt med myndigheter."],
          [["Ask: who covers for each of you in week three?", "Fråga: vem ersätter var och en av er vecka tre?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Services held through the week and the false story faded, but the crisis team is exhausted, and the authorities expect the campaign to return.",
        "Tjänsterna höll genom veckan och den falska berättelsen bleknade, men krisledningen är utmattad och myndigheterna räknar med att kampanjen kommer tillbaka."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Answer disinformation with facts on your own channels; arguing in replies feeds it.", "Bemöt desinformation med fakta i egna kanaler; att argumentera i svarstrådar ger den näring."]),
        L(["Hybrid threats are designed to be handled in silos: join the incidents into one picture.", "Hybridhot är utformade för att hanteras i stuprör: sätt samman händelserna till en lägesbild."]),
        L(["Campaigns target people as well as systems; protect those who report approaches.", "Kampanjer riktar sig mot människor lika väl som system; skydda dem som rapporterar kontaktförsök."]),
        L(["Endurance is a decision: shifts, deputies and fallbacks you have practised.", "Uthållighet är ett beslut: skift, ersättare och reservrutiner ni har övat."])
      ],
      assumptionsVsReality: [
        avr(["A communications problem.", "Ett kommunikationsproblem."], ["A DDoS timed to make the story look true.", "En överbelastningsattack tajmad för att få berättelsen att verka sann."], "p2"),
        avr(["A run of bad luck.", "En period av otur."], ["One coordinated campaign against the region.", "En samordnad kampanj mot regionen."], "p4"),
        avr(["Only systems and reputation are targeted.", "Bara system och anseende är måltavlor."], ["Staff with site access were approached for cash.", "Personal med åtkomst till anläggningen kontaktades med erbjudanden om pengar."], "p6")
      ],
      strengthsToLookFor: [
        L(["Joining the incidents up early", "Att koppla ihop händelserna tidigt"]),
        L(["Shift patterns for the crisis team", "Skiftschema för krisledningen"]),
        L(["Treating the engineer as a reporter, not a suspect", "Att behandla teknikern som någon som rapporterar, inte som en misstänkt"])
      ],
      commonGaps: [
        L(["Arguing with false posts in the replies", "Att argumentera med falska inlägg i svarstrådarna"]),
        L(["Handling each disruption in its own silo", "Att hantera varje störning i sitt eget stuprör"]),
        L(["Running the same people for five days", "Att låta samma personer arbeta i fem dagar"])
      ],
      suggestedActions: [
        act(["Staff every crisis role two deep and rehearse handovers.", "Bemanna varje krisroll med dubbla ersättare och öva överlämningar."], "incidentCommander", "high"),
        act(["Prepare fallbacks for communications, positioning and timing.", "Förbered reservrutiner för kommunikation, positionering och tid."], "itOps", "high"),
        act(["Train staff with access to sensitive plans to recognise and report approaches.", "Utbilda personal med åtkomst till känsliga ritningar att känna igen och rapportera kontaktförsök."], "securityOfficer", "medium"),
        act(["Agree communication lines with authorities before the next campaign.", "Kom överens om kommunikationslinjer med myndigheterna före nästa kampanj."], "comms", "medium")
      ]
    }
  });
})();
