/*
 * s27-whistleblower.js — "The Folder" (archetype F, whistleblowing / leak).
 *
 * A journalist holds genuine internal documents about customers billed for a
 * service no longer delivered → they came from an employee who reported it
 * internally twice and was ignored: a protected disclosure, not a hack → the
 * folder also holds an HR appendix with staff salaries → management wants the
 * source found; the law forbids it → the story runs → the channel ignored more
 * than one report.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, pb, ir, io } =BK.scenarios.h;

  BK.scenarios.register({
    id: "s27-whistleblower",
    version: 1,
    category: "whistleblowing",
    archetype: "human-legal-reputational",
    emblem: "whistleblower",
    title: L(["The Folder", "Mappen"]),
    summary: L([
      "A reporter has a folder of genuine internal documents and a deadline. Everyone wants to know who leaked them. The more important question is why nobody listened first.",
      "En reporter har en mapp med äkta interna dokument och en deadline. Alla vill veta vem som läckte dem. Den viktigare frågan är varför ingen lyssnade först."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Tell a leak from a breach, and a breach from a protected disclosure", "Skilja en läcka från ett intrång, och ett intrång från en skyddad visselblåsning"]), teaser: L(["What kind of problem this is", "Vilken sorts problem det här är"]) },
      { id: "lo2", text: L(["Respect whistleblower protection while investigating", "Respektera visselblåsarskyddet under utredningen"]), teaser: L(["The questions you may not ask", "Frågorna ni inte får ställa"]) },
      { id: "lo3", text: L(["Handle personal data inside leaked material", "Hantera personuppgifter i läckt material"]), teaser: L(["What else was in the folder", "Vad mer som fanns i mappen"]) },
      { id: "lo4", text: L(["Answer the substance, not only the leak", "Svara på sakfrågan, inte bara på läckan"]), teaser: L(["The story behind the story", "Historien bakom historien"]) }
    ],
    mitre: ["T1213", "T1530", "T1567"],
    frameworks: {
      nistCsf: ["GV.OC", "GV.PO", "GV.OV", "ID.AM", "PR.DS", "RS.CO", "RS.AN"],
      iso27001: ["A.5.4", "A.5.24", "A.5.26", "A.5.34", "A.5.36", "A.6.4", "A.6.8"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours" },
    actor: { types: ["insider"], motivation: L(["Public interest: an employee who was ignored internally", "Allmänintresse: en anställd som ignorerades internt"]), capability: "low" },
    variables: {
      customers: { min: 400, max: 18000, scaleBy: "size", step: 10 },
      overbilled: { min: 1, max: 40, scaleBy: "size" },
      staff: { min: 60, max: 900, scaleBy: "size", step: 10 }
    },
    roles: ["incidentCommander", "ceo", "legal", "hr", "comms", "dpo", "ciso", "cfo", "serviceOwner", "itOps"],

    groundTruth: {
      rootCause: L([
        "For two years {{org.name}} kept billing about {{num.customers|number}} customers for a support level it had quietly stopped providing. A finance analyst noticed, reported it twice through the internal whistleblowing channel, and was told it was “a commercial matter”. After the second rejection the analyst gave a journalist a folder of internal documents. The folder accidentally included an HR appendix with staff salaries. Nobody broke into anything.",
        "I två år fortsatte {{org.name}} att fakturera omkring {{num.customers|number}} kunder för en supportnivå som företaget i tysthet hade slutat leverera. En ekonomianalytiker upptäckte det, rapporterade det två gånger via den interna visselblåsarkanalen och fick höra att det var ”en kommersiell fråga”. Efter det andra avslaget gav analytikern en journalist en mapp med interna dokument. Mappen innehöll av misstag en HR-bilaga med personalens löner. Ingen bröt sig in någonstans."
      ]),
      attackerTimeline: [
        { at: -1051200, text: L(["Premium support quietly reduced; billing unchanged.", "Premiumsupporten minskas i tysthet; faktureringen oförändrad."]) },
        { at: -262800, text: L(["First internal report through the whistleblowing channel; closed.", "Första interna rapporten via visselblåsarkanalen; avslutad."]) },
        { at: -87600, text: L(["Second report; closed as a commercial matter.", "Andra rapporten; avslutad som en kommersiell fråga."]) },
        { at: -10080, text: L(["Documents handed to a journalist.", "Dokumenten lämnas till en journalist."]) },
        { at: 0, text: L(["Request for comment arrives.", "Begäran om kommentar kommer in."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-reports", revealStage: "p2", text: L(["The documents match two internal reports that the case handler closed without investigation.", "Dokumenten stämmer med två interna rapporter som handläggaren avslutade utan utredning."]) },
      { id: "hf-hr", revealStage: "p3", text: L(["The journalist's folder contains a salary spreadsheet the source never meant to include.", "Journalistens mapp innehåller ett lönekalkylblad som källan aldrig tänkte ta med."]) },
      { id: "hf-channel", revealStage: "p6", text: L(["Most reports in the channel over three years were closed by the same person, often the same day.", "De flesta rapporterna i kanalen under tre år avslutades av samma person, ofta samma dag."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Request for comment", "Begäran om kommentar"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. An email reaches the press office from an investigative reporter at a national newspaper. It quotes, word for word, from three internal documents: a pricing memo, a support capacity plan and minutes from a management meeting.\n\nThe reporter says the documents show that {{org.name}} has charged customers for a service it stopped providing. The article runs in two days. They would like a comment.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Ett mejl når pressavdelningen från en grävande reporter på en rikstäckande tidning. Det citerar ordagrant ur tre interna dokument: en prissättnings-pm, en kapacitetsplan för supporten och protokoll från ett ledningsmöte.\n\nReportern säger att dokumenten visar att {{org.name}} har tagit betalt av kunder för en tjänst företaget slutat leverera. Artikeln publiceras om två dagar. Hen vill gärna ha en kommentar."
        ]),
        injects: [
          inj("i1-1", 0, "mediaEnquiry", "media", "high", "confirmed", [
            "“We have internal documents showing premium support was cut two years ago while customers kept paying for it. Can you explain why, and will customers be refunded? We publish on Thursday.”",
            "”Vi har interna dokument som visar att premiumsupporten minskades för två år sedan medan kunderna fortsatte att betala för den. Kan ni förklara varför, och kommer kunderna att få pengarna tillbaka? Vi publicerar på torsdag.”"
          ], { headline: ["Request for comment: premium support", "Begäran om kommentar: premiumsupport"], tests: ["lo4"] }),
          inj("i1-2", 30, "executiveMessage", "person.ceo", "medium", "misleading", [
            "“Someone has stolen confidential documents. I want IT to find out who, today, and I want legal to stop the article.”",
            "”Någon har stulit konfidentiella dokument. Jag vill att IT tar reda på vem, i dag, och jag vill att juristen stoppar artikeln.”"
          ], { facilitatorNote: ["Understandable instinct, and both demands are likely unlawful or impossible.", "En begriplig instinkt, och båda kraven är sannolikt olagliga eller omöjliga."], tests: ["lo1", "lo2"] })
        ],
        questions: {
          technical: [
            q("Where do those three documents live, and who can open them?", "Var ligger de tre dokumenten, och vem kan öppna dem?", ["itOps", "ciso"]),
            q("Is there any sign of an intrusion, or does this look like access someone already had?", "Finns det tecken på intrång, eller ser det ut som åtkomst någon redan hade?", ["ciso"]),
            q("What would searching for the source involve, and is it allowed?", "Vad skulle det innebära att leta efter källan, och är det tillåtet?", ["legal", "ciso"])
          ],
          executive: [
            q("Is this a security incident, a media issue, or a governance issue?", "Är det här en säkerhetsincident, en mediefråga eller en styrningsfråga?", ["incidentCommander", "ceo"]),
            q("Are the documents true?", "Stämmer dokumenten?", ["cfo", "serviceOwner"]),
            q("Can you stop a newspaper from publishing, and should you try?", "Kan ni hindra en tidning från att publicera, och borde ni försöka?", ["legal", "comms"])
          ]
        },
        challenges: [ch("The CEO has already told two board members that “someone stole our files”.", "Vd har redan sagt till två styrelseledamöter att ”någon har stulit våra filer”.")],
        decision: dec("d1", "incidentCommander", ["What do you do first?", "Vad gör ni först?"], [
          ["Establish whether the documents are genuine and what they say, before looking for any source.", "Ta reda på om dokumenten är äkta och vad de säger, innan ni letar efter någon källa."],
          ["Start an IT investigation to identify who leaked them.", "Starta en IT-utredning för att identifiera vem som läckte dem."],
          ["Have lawyers write to the newspaper today, asking it not to publish confidential documents until you have had a chance to respond.", "Låt jurister skriva till tidningen i dag och be den att inte publicera konfidentiella dokument förrän ni har fått möjlighet att svara."]
        ], {
          knowns: [["A reporter holds genuine-looking internal documents.", "En reporter har interna dokument som ser äkta ut."]],
          uncertainties: [["Whether the documents are accurate, and how they left.", "Om dokumenten är korrekta, och hur de kom ut."]],
          tradeoffs: {
            operational: ["Checking the substance takes the time you have before Thursday.", "Att kontrollera sakfrågan tar den tid ni har fram till torsdag."],
            security: ["A hunt for the source may break the law and destroy trust.", "En jakt på källan kan bryta mot lagen och förstöra förtroendet."],
            legal: ["Source protection and whistleblower law limit what you may do.", "Källskydd och visselblåsarlagstiftning begränsar vad ni får göra."],
            reputational: ["Trying to stop the article becomes the article.", "Att försöka stoppa artikeln blir artikeln."]
          },
          evaluation: [["Looks at whether the allegation is true before chasing the messenger", "Undersöker om påståendet stämmer innan budbäraren jagas"]],
          pushback: {
            A: [
              pb(["Two days is not enough", "Två dagar räcker inte"], ["Finance says matching two years of billing against what support actually delivered will take at least a week. The article runs in two days. Do you answer the reporter with half a picture, or ask for more time and look evasive?", "Ekonomi säger att det tar minst en vecka att jämföra två års fakturering med vad supporten faktiskt levererade. Artikeln publiceras om två dagar. Svarar ni reportern med en halv bild, eller ber ni om mer tid och ser undanglidande ut?"]),
              pb(["The CEO goes around you", "Vd går förbi er"], ["The CEO hears that nobody is looking for “the thief” and says they will call IT directly. Checking the substance first only holds if someone says no to the CEO. Who in the room does that, and on what grounds?", "Vd får höra att ingen letar efter ”tjuven” och säger att hen tänker ringa IT direkt. Att kontrollera sakfrågan först håller bara om någon säger nej till vd. Vem i rummet gör det, och med vilket stöd?"]),
              pb(["The memo is genuine", "PM:et är äkta"], ["Within an hour {{person.serviceOwner.name}} confirms the capacity plan is real: support was cut. You now know the story is largely true, and still nothing about how the documents left or what else went with them. Do you keep looking only at the substance, or widen the work now?", "Inom en timme bekräftar {{person.serviceOwner.name}} att kapacitetsplanen är äkta: supporten minskades. Nu vet ni att berättelsen i stort sett stämmer, men fortfarande ingenting om hur dokumenten kom ut eller vad mer som följde med. Fortsätter ni bara med sakfrågan, eller breddar ni arbetet nu?"])
            ],
            B: [
              pb(["On what legal basis?", "Med vilket rättsligt stöd?"], ["To find who opened the three documents, IT must go through the file access and email of finance and management staff. {{person.legal.name}} asks what the legal basis is, and whether anyone has checked if the source might be protected. Do you keep going without an answer?", "För att hitta vem som öppnat de tre dokumenten måste IT gå igenom filåtkomst och mejl för personal inom ekonomi och ledning. {{person.legal.name}} frågar vilket rättsligt stöd ni har, och om någon har kontrollerat om källan kan vara skyddad. Fortsätter ni utan ett svar?"]),
              pb(["Finance knows", "Ekonomi vet om det"], ["An IT technician asked a finance manager who else could open the pricing memo. By lunch, staff in finance are asking each other who is under investigation. Do you explain the hunt to them, or carry on and let the rumours run?", "En IT-tekniker frågade en ekonomichef vem mer som kunde öppna prissättnings-pm:et. Vid lunch frågar personalen på ekonomi varandra vem som blir utredd. Förklarar ni jakten för dem, eller fortsätter ni och låter ryktena gå?"]),
              pb(["The reporter hears of it", "Reportern får höra om det"], ["The reporter emails again: “We understand you have started an internal search for our source. Would you like to comment on that as well?” The hunt is now part of the story. Do you stop it, deny it, or defend it in print?", "Reportern mejlar igen: ”Vi förstår att ni har inlett en intern sökning efter vår källa. Vill ni kommentera det också?” Jakten är nu en del av berättelsen. Stoppar ni den, förnekar ni den, eller försvarar ni den i tidningen?"])
            ],
            C: [
              pb(["The letter becomes news", "Brevet blir en nyhet"], ["The editor replies politely that the newspaper will not wait, and that the article will mention the company's attempt to delay it. Do you withdraw the letter, or stand behind it in print?", "Redaktören svarar artigt att tidningen inte tänker vänta, och att artikeln kommer att nämna företagets försök att skjuta upp den. Drar ni tillbaka brevet, eller står ni för det i tidningen?"]),
              pb(["Still no answer", "Fortfarande inget svar"], ["{{person.comms.name}} points out that the letter says nothing about whether customers paid for a service they did not get. That was the reporter's question, and the deadline has not moved. Who is actually working on the answer?", "{{person.comms.name}} påpekar att brevet inte säger något om huruvida kunder betalat för en tjänst de inte fick. Det var reporterns fråga, och deadlinen har inte flyttats. Vem arbetar egentligen med svaret?"]),
              pb(["You just confirmed them", "Ni bekräftade dem nyss"], ["{{person.legal.name}} warns that calling the documents “confidential” in writing tells the newspaper they are genuine. You have confirmed authenticity without saying a word about the substance. Do you send a letter that helps the article more than it helps you?", "{{person.legal.name}} varnar för att den som skriftligen kallar dokumenten ”konfidentiella” talar om för tidningen att de är äkta. Ni har bekräftat äktheten utan att säga ett ord om sakfrågan. Skickar ni ett brev som hjälper artikeln mer än det hjälper er?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "B" }, ["The access search", "Sökningen i åtkomstloggarna"], [
              io(["Too many names", "För många namn"], ["The first pass of the search returns dozens of staff who opened the three documents in the normal course of their work. Nobody stands out, and IT asks how much deeper it should dig.", "Sökningens första genomgång ger dussintals anställda som öppnat de tre dokumenten i sitt vanliga arbete. Ingen sticker ut, och IT frågar hur mycket djupare de ska gräva."], ["The first pass of the access search found no obvious suspect.", "Sökningens första genomgång hittade ingen uppenbar misstänkt."]),
              io(["Legal pulls the brake", "Juristen drar i bromsen"], ["{{person.legal.name}} orders the search paused: nobody has assessed the legal basis, or whether the source may be protected. The CEO wants it running again by tonight.", "{{person.legal.name}} beordrar att sökningen pausas: ingen har bedömt den rättsliga grunden, eller om källan kan vara skyddad. Vd vill ha den igång igen till i kväll."], ["The access search is paused pending a legal assessment.", "Sökningen i åtkomstloggarna är pausad i väntan på en rättslig bedömning."], { reopen: true }),
              io(["Word spreads", "Det sprids"], ["An IT technician's questions have travelled. An employee asks HR whether everyone's file access and email are now being watched.", "En IT-teknikers frågor har spridit sig. En anställd frågar HR om allas filåtkomst och mejl nu blir övervakade."], ["Staff know that IT is searching for the source.", "Personalen vet att IT letar efter källan."])
            ]),
            ir("i2", { notChosen: "B" }, ["Nobody hunting the thief", "Ingen jagar tjuven"], [
              io(["The CEO calls IT", "Vd ringer IT"], ["The CEO has called an IT technician directly and asked them to “have a quiet look” at who opened the files. The technician asks the room whether that instruction counts.", "Vd har ringt en IT-tekniker direkt och bett hen att ”titta lite i tysthet” på vem som öppnat filerna. Teknikern frågar rummet om den instruktionen gäller."], ["The CEO asked IT informally to look for the source.", "Vd har informellt bett IT att leta efter källan."], { reopen: true }),
              io(["The board wants a culprit", "Styrelsen vill ha en skyldig"], ["One of the board members the CEO briefed asks why, a day after a theft, nobody is looking for the thief. They expect a name at the next board call.", "En av styrelseledamöterna som vd informerade frågar varför ingen letar efter tjuven ett dygn efter en stöld. Hen räknar med ett namn till nästa styrelsesamtal."], ["A board member expects to be told who leaked the documents.", "En styrelseledamot räknar med att få veta vem som läckte dokumenten."]),
              io(["The reporter asks", "Reportern frågar"], ["The reporter asks directly whether the company is trying to identify the source. Today you can truthfully say no, and the reporter notes it.", "Reportern frågar rakt ut om företaget försöker identifiera källan. I dag kan ni sanningsenligt svara nej, och reportern antecknar det."], ["You told the reporter you are not searching for the source.", "Ni har sagt till reportern att ni inte letar efter källan."])
            ])
          ]
        }),
        facilitator: fac(
          ["The instinct to hunt the source is strong. The real exposure is the billing.", "Instinkten att jaga källan är stark. Den verkliga exponeringen är faktureringen."],
          ["Verify the substance first; involve legal on what may and may not be done about the source.", "Verifiera sakfrågan först; ta in juristen om vad som får och inte får göras kring källan."],
          [["Ask: if every word in the documents is true, what is your problem?", "Fråga: om varje ord i dokumenten stämmer, vad är då ert problem?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 240,
        title: L(["Reported twice", "Rapporterat två gånger"]),
        twist: L(["No intrusion. The documents match two reports made through your own whistleblowing channel last year. Both were closed as “a commercial matter”, without investigation.", "Inget intrång. Dokumenten stämmer med två rapporter som gjordes via er egen visselblåsarkanal förra året. Båda avslutades som ”en kommersiell fråga”, utan utredning."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "B" }, narrativeAppend: { en: "Because an IT investigation into the leak had already started, the union asks whether staff who use the whistleblowing channel are being monitored.", sv: "Eftersom en IT-utredning av läckan redan hade startat frågar facket om personal som använder visselblåsarkanalen blir övervakad." } }
        ],
        assumptionChallenged: L(["Someone stole our documents.", "Någon har stulit våra dokument."]),
        reveals: ["hf-reports"],
        narrative: L([
          "{{time.T+240|clock}}. {{person.ciso.name}} has found no sign of a break-in: no unusual downloads, no strange sign-ins, nothing copied out in bulk. The documents were opened by the people you would expect to open them.\n\nThen {{person.legal.name}} checks the register of the whistleblowing channel, which only legal and one case handler can see. Two closed cases from last year describe exactly what the reporter wrote.",
          "Klockan {{time.T+240|clock}}. {{person.ciso.name}} har inte hittat några tecken på intrång: inga ovanliga nedladdningar, inga konstiga inloggningar, inget som kopierats ut i stora mängder. Dokumenten har öppnats av de personer man kan vänta sig.\n\nSedan går {{person.legal.name}} igenom registret för visselblåsarkanalen, som bara juristen och en handläggare kan se. Två avslutade ärenden från förra året beskriver exakt det som reportern skrev."
        ]),
        injects: [
          inj("i2-1", 240, "forensicFinding", "person.ciso", "medium", "confirmed", [
            "No anomalous access to the three documents in twelve months. All opens are by staff in finance, support planning or management. No bulk export, no external sharing links.",
            "Ingen avvikande åtkomst till de tre dokumenten på tolv månader. Alla öppningar har gjorts av personal inom ekonomi, supportplanering eller ledning. Ingen massexport, inga externa delningslänkar."
          ], { tests: ["lo1"] }),
          inj("i2-2", 270, "ticket", "person.legal", "high", "confirmed", [
            "Whistleblowing register: case 2 (March) and case 7 (September). Subject: premium support billed but not delivered. Status: closed, “commercial matter, not within scope”. Investigation: none recorded.",
            "Visselblåsarregistret: ärende 2 (mars) och ärende 7 (september). Ämne: premiumsupport fakturerad men inte levererad. Status: avslutat, ”kommersiell fråga, faller utanför”. Utredning: ingen registrerad."
          ], { reveals: ["hf-reports"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Who can see the whistleblowing register, and should even fewer people?", "Vem kan se visselblåsarregistret, och borde ännu färre kunna det?", ["legal", "ciso"]),
            q("What would the search for the source the CEO asked for actually reveal?", "Vad skulle den sökning efter källan som vd bad om faktiskt avslöja?", ["ciso"]),
            q("Was checking the substance before the source the right order?", "Var det rätt ordning att kontrollera sakfrågan före källan?", ["incidentCommander"], "d1")
          ],
          executive: [
            q("Was this a protected disclosure, and what does that mean for you?", "Var det här en skyddad visselblåsning, och vad betyder det för er?", ["legal", "hr"]),
            q("Who closed the two cases, and on what authority?", "Vem avslutade de två ärendena, och med vilket mandat?", ["legal", "ceo"]),
            q("If IT had started hunting the source this morning, what would you be explaining now?", "Om IT hade börjat jaga källan i morse, vad skulle ni behöva förklara nu?", ["ceo"], "d1")
          ]
        },
        challenges: [ch("The case handler who closed both reports reports directly to the CFO.", "Handläggaren som avslutade båda rapporterna rapporterar direkt till ekonomichefen.")],
        decision: dec("d2", "ceo", ["How do you treat the source?", "Hur förhåller ni er till källan?"], [
          ["Stop any attempt to identify them; treat it as a protected disclosure and say so internally.", "Stoppa varje försök att identifiera hen; behandla det som en skyddad visselblåsning och säg det internt."],
          ["Identify them quietly, but take no action for now.", "Identifiera hen i tysthet, men vidta inga åtgärder tills vidare."],
          ["Leave the question open until after the article.", "Lämna frågan öppen tills efter artikeln."]
        ], {
          knowns: [["The issue was reported internally twice and closed.", "Frågan rapporterades internt två gånger och avslutades."]],
          uncertainties: [["Whether the source had other routes they tried.", "Om källan försökte andra vägar också."]],
          tradeoffs: {
            operational: ["Leaving it open keeps the organisation guessing and talking.", "Att lämna det öppet får organisationen att gissa och prata."],
            security: ["Quiet identification is still identification.", "Att identifiera i tysthet är fortfarande att identifiera."],
            legal: ["Reprisals, or attempts to find the source, may be unlawful.", "Repressalier, eller försök att hitta källan, kan vara olagliga."],
            reputational: ["Staff are watching how you treat the person who spoke up.", "Personalen ser hur ni behandlar den som sa ifrån."]
          },
          evaluation: [["Protects the reporter and shifts attention to the substance", "Skyddar den som rapporterade och flyttar fokus till sakfrågan"]],
          pushback: {
            A: [
              pb(["The board heard “stolen”", "Styrelsen hörde ”stulet”"], ["Two board members, told yesterday that someone stole the files, now ask why the company is calling that person a whistleblower. Saying it internally means contradicting the CEO's own words. Do you correct the board in writing today?", "Två styrelseledamöter, som i går fick höra att någon stal filerna, frågar nu varför företaget kallar den personen för visselblåsare. Att säga det internt innebär att motsäga vd:s egna ord. Rättar ni styrelsen skriftligt i dag?"]),
              pb(["The message will travel", "Meddelandet kommer att spridas"], ["An internal message saying the disclosure is protected also confirms to every employee that the reports were made and ignored. {{person.comms.name}} expects it to reach the reporter before Thursday. Do you send it now, or after the article?", "Ett internt meddelande om att visselblåsningen är skyddad bekräftar också för varje anställd att rapporterna gjordes och ignorerades. {{person.comms.name}} räknar med att det når reportern före torsdag. Skickar ni det nu, eller efter artikeln?"]),
              pb(["Protected is a legal test", "Skyddad är en rättslig bedömning"], ["{{person.legal.name}} notes that going to the press is protected only under certain conditions, and nobody has assessed them yet. Declaring the disclosure protected now commits the company before that assessment. Do you make the promise before you know it holds?", "{{person.legal.name}} påpekar att det bara är under vissa villkor som det är skyddat att gå till pressen, och ingen har bedömt dem ännu. Att förklara visselblåsningen skyddad nu binder företaget innan den bedömningen är gjord. Ger ni löftet innan ni vet att det håller?"])
            ],
            B: [
              pb(["Opening the register", "Att öppna registret"], ["Identifying the source quietly means reading the whistleblowing register's case files, which only legal and the case handler may see. Whoever opens them is using the channel to find the person who trusted it. Who does that, and for what lawful purpose?", "Att identifiera källan i tysthet innebär att läsa ärendena i visselblåsarregistret, som bara juristen och handläggaren får se. Den som öppnar dem använder kanalen för att hitta personen som litade på den. Vem gör det, och för vilket lagligt syfte?"]),
              pb(["A name you cannot forget", "Ett namn ni inte kan glömma"], ["{{person.hr.name}} asks who will carry the name once you have it. Every later decision about that person, on pay, promotion or a reorganisation, can now be read as a reprisal. How will you ever prove the knowledge played no part?", "{{person.hr.name}} frågar vem som ska bära namnet när ni väl har det. Varje senare beslut om den personen, om lön, befordran eller en omorganisation, kan nu tolkas som en repressalie. Hur ska ni någonsin kunna visa att kunskapen inte spelade in?"]),
              pb(["The union asks directly", "Facket frågar rakt ut"], ["The union representative asks the CEO a simple question: is management trying to find out who went to the press? “Quietly” only works if you do not get asked. Do you answer truthfully, or say no?", "Det fackliga ombudet ställer en enkel fråga till vd: försöker ledningen ta reda på vem som gick till pressen? ”I tysthet” fungerar bara så länge ingen frågar. Svarar ni sanningsenligt, eller säger ni nej?"])
            ],
            C: [
              pb(["Someone is being blamed", "Någon pekas ut"], ["In the departments that could open the documents, people are guessing out loud. One employee has asked HR whether they are suspected, because colleagues have stopped talking to them. Do you stay silent while a possibly innocent person is singled out?", "På de avdelningar som kunde öppna dokumenten gissar folk högt. En anställd har frågat HR om hen är misstänkt, eftersom kollegorna slutat prata med hen. Förblir ni tysta medan en kanske oskyldig person pekas ut?"]),
              pb(["The CEO's order still stands", "Vd:s order gäller fortfarande"], ["Nobody has withdrawn the CEO's instruction from this morning. An IT technician asks whether to continue the access search. Leaving the question open means the search goes on by default. Do you stop it, or let it run?", "Ingen har dragit tillbaka vd:s instruktion från i morse. En IT-tekniker frågar om sökningen i åtkomstloggarna ska fortsätta. Att lämna frågan öppen innebär att sökningen fortsätter av sig själv. Stoppar ni den, eller låter ni den löpa?"]),
              pb(["“We have not decided”", "”Vi har inte bestämt oss”"], ["The reporter asks whether the company will take any action against the source. If the answer is “we have not decided”, that sentence will be in Thursday's article. Can you live with it in print?", "Reportern frågar om företaget kommer att vidta några åtgärder mot källan. Om svaret är ”vi har inte bestämt oss” står den meningen i torsdagens artikel. Kan ni leva med den i tryck?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The protection message", "Beskedet om skydd"], [
              io(["Staff speak up", "Personalen säger ifrån"], ["Within hours of the internal message, two employees contact {{person.legal.name}} with concerns they say they had kept to themselves.", "Inom några timmar efter det interna beskedet hör två anställda av sig till {{person.legal.name}} med farhågor de säger att de hållit för sig själva."], ["Staff have begun raising concerns with legal directly.", "Personal har börjat ta upp farhågor direkt med juristen."]),
              io(["The board objects", "Styrelsen invänder"], ["The board chair calls the message premature: nobody has assessed whether going to the press meets the legal conditions for protection. The chair asks for it to be withdrawn or rewritten today.", "Styrelseordföranden kallar beskedet förhastat: ingen har bedömt om det uppfyller de rättsliga villkoren för skydd att gå till pressen. Ordföranden vill att det dras tillbaka eller skrivs om i dag."], ["The board chair questioned declaring the disclosure protected before a legal assessment.", "Styrelseordföranden ifrågasatte att visselblåsningen förklarades skyddad före en rättslig bedömning."], { reopen: true }),
              io(["The reporter has it", "Reportern har det"], ["The reporter quotes your internal message back to {{person.comms.name}} and asks whether it means the company accepts the documents are accurate.", "Reportern citerar ert interna besked för {{person.comms.name}} och frågar om det betyder att företaget medger att dokumenten stämmer."], ["The reporter holds a copy of your internal message.", "Reportern har en kopia av ert interna besked."])
            ]),
            ir("i2", { notChosen: "A" }, ["The source left exposed", "Källan lämnas oskyddad"], [
              io(["A colleague is shunned", "En kollega fryses ut"], ["An employee in support planning tells HR that colleagues have stopped talking to them since the article was announced. They had nothing to do with it, they say, and they want to know if they are suspected.", "En anställd inom supportplaneringen berättar för HR att kollegorna slutat prata med hen sedan artikeln blev känd. Hen säger att hen inte har med saken att göra och vill veta om hen är misstänkt."], ["A support planner believes colleagues suspect them of the leak.", "En anställd inom supportplaneringen tror att kollegorna misstänker hen för läckan."]),
              io(["The union writes", "Facket skriver"], ["The union asks in writing whether management is trying to identify the person who went to the press, and wants an answer before Thursday.", "Facket frågar skriftligt om ledningen försöker identifiera den som gick till pressen, och vill ha svar före torsdag."], ["The union has asked in writing whether you are seeking the source.", "Facket har skriftligt frågat om ni letar efter källan."], { reopen: true }),
              io(["“No comment” on record", "”Inga kommentarer” noterat"], ["The reporter asks whether the company will act against the source. With no position agreed, {{person.comms.name}} says the company has no comment. The reporter says that answer will be in the article.", "Reportern frågar om företaget kommer att vidta åtgärder mot källan. Utan något beslutat förhållningssätt svarar {{person.comms.name}} att företaget inte har några kommentarer. Reportern säger att svaret kommer att stå i artikeln."], ["You gave the reporter no answer on how the source will be treated.", "Ni gav reportern inget svar på hur källan kommer att behandlas."], { meters: { media: 1 } })
            ])
          ]
        }),
        facilitator: fac(
          ["Cause flips: not a breach but a failed internal channel. Protection now matters more than identity.", "Orsaken vänds: inget intrång utan en internkanal som fallerat. Skyddet betyder nu mer än identiteten."],
          ["No hunt for the source; open a proper investigation of the billing.", "Ingen jakt på källan; inled en ordentlig utredning av faktureringen."],
          [["Ask: what would make the next person use your channel instead of a newspaper?", "Fråga: vad skulle få nästa person att använda er kanal i stället för en tidning?"]]
        )
      },
      {
        id: "p3",
        clock: 720,
        priority: 1,
        title: L(["Page 41", "Sidan 41"]),
        twist: L(["The reporter, checking facts, mentions a salary spreadsheet in the folder: names, roles and pay for {{num.staff|number}} employees. It has nothing to do with the story.", "Reportern nämner, under faktakontrollen, ett lönekalkylblad i mappen: namn, befattningar och löner för {{num.staff|number}} anställda. Det har ingenting med berättelsen att göra."]),
        twistKind: "scope",
        reconsider: { decision: "d1", pressure: { en: "The folder also holds salary data for {{num.staff|number}} people. If you started an IT hunt for the source, staff have noticed. If you only checked the documents, you still do not know what else left the building.", sv: "Mappen innehåller också lönedata för {{num.staff|number}} personer. Om ni startade en IT-jakt på källan har personalen märkt det. Om ni bara kontrollerade dokumenten vet ni fortfarande inte vad mer som lämnade huset." } },
        assumptionChallenged: L(["The leak only concerns the billing documents.", "Läckan gäller bara faktureringsdokumenten."]),
        reveals: ["hf-hr"],
        narrative: L([
          "{{time.T+720|clock}}. {{person.comms.name}} has a fact-checking call with the reporter, who is professional and thorough. They go through the documents page by page.\n\nNear the end, the reporter asks a question that has nothing to do with billing. They want to confirm that the spreadsheet on page 41 is genuine, “just so we know what we hold, we won't publish it”.",
          "Klockan {{time.T+720|clock}}. {{person.comms.name}} har ett samtal om faktakontroll med reportern, som är professionell och noggrann. De går igenom dokumenten sida för sida.\n\nMot slutet ställer reportern en fråga som inte har med faktureringen att göra. Hen vill bekräfta att kalkylbladet på sidan 41 är äkta, ”bara så att vi vet vad vi har, vi kommer inte att publicera det”."
        ]),
        injects: [
          inj("i3-1", 720, "phoneTranscript", "media", "medium", "confirmed", [
            "The reporter: “There's also a salary sheet in what we received. Names, titles, pay. We won't use it, but I wanted you to know we have it.”",
            "Reportern: ”Det finns också ett lönekalkylblad i det vi fick. Namn, titlar, löner. Vi kommer inte att använda det, men jag ville att ni skulle veta att vi har det.”"
          ], { reveals: ["hf-hr"], tests: ["lo3"] }),
          inj("i3-2", 760, "executiveMessage", "person.dpo", "high", "confirmed", [
            "“That is a personal data breach regardless of who sent it or why. We are probably inside the 72 hours from now. I'd also want to tell the staff concerned before they read about it.”",
            "”Det är en personuppgiftsincident oavsett vem som skickade det eller varför. Vi är troligen inne i 72-timmarsfristen från och med nu. Jag vill också berätta för de berörda anställda innan de läser om det.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Where did the salary sheet live, and who could open it?", "Var låg lönekalkylbladet, och vem kunde öppna det?", ["itOps", "ciso"]),
            q("Can you ask the newspaper to delete it, and would that request be wise?", "Kan ni be tidningen radera det, och vore en sådan begäran klok?", ["legal"]),
            q("Did the decision on the source change how you handle this second problem?", "Ändrade beslutet om källan hur ni hanterar det här andra problemet?", ["legal"], "d2")
          ],
          executive: [
            q("Do you notify {{reg.dpaShort}}, and how do you describe the cause?", "Anmäler ni till {{reg.dpaShort}}, och hur beskriver ni orsaken?", ["dpo", "legal"]),
            q("What do you tell {{num.staff|number}} employees whose salaries a newspaper holds?", "Vad säger ni till {{num.staff|number}} anställda vars löner en tidning har?", ["hr", "comms"]),
            q("Does protecting the source still hold when the leak harmed colleagues?", "Håller skyddet av källan fortfarande när läckan skadade kollegor?", ["hr", "ceo"], "d2")
          ]
        },
        challenges: [ch("Two managers ask HR whether this means the leaker can now be disciplined.", "Två chefer frågar HR om det här betyder att den som läckte nu kan bli föremål för disciplinära åtgärder.")],
        decision: dec("d3", "dpo", ["How do you handle the salary data?", "Hur hanterar ni lönedatan?"], [
          ["Notify the regulator, tell affected staff today, and ask the newspaper in writing not to keep the sheet.", "Anmäl till tillsynsmyndigheten, berätta för berörd personal i dag och be tidningen skriftligt att inte behålla kalkylbladet."],
          ["Ask the newspaper to delete it and notify no one, since it will not be published.", "Be tidningen radera det och anmäl inte till någon, eftersom det inte kommer att publiceras."],
          ["Ask the newspaper for written confirmation that the sheet is deleted, and decide on notification once you have it.", "Be tidningen om en skriftlig bekräftelse på att kalkylbladet är raderat, och besluta om anmälan när ni har fått den."]
        ], {
          knowns: [["A third party holds staff salary data.", "En tredje part har personalens lönedata."]],
          uncertainties: [["Whether anyone else received the folder.", "Om någon annan har fått mappen."]],
          tradeoffs: {
            operational: ["Telling staff now adds a second storm to the week.", "Att berätta för personalen nu lägger till en andra storm under veckan."],
            security: ["The sheet's original access rights may be far too wide.", "Kalkylbladets ursprungliga behörigheter kan vara alldeles för breda."],
            legal: ["Not publishing does not make it not a breach.", "Att det inte publiceras gör det inte till något annat än en incident."],
            reputational: ["Staff will forgive the leak sooner than the silence.", "Personalen förlåter läckan snabbare än tystnaden."]
          },
          evaluation: [["Treats the salary sheet as a breach in its own right, separate from the disclosure", "Behandlar lönekalkylbladet som en incident i sig, skild från visselblåsningen"]],
          pushback: {
            A: [
              pb(["“Who sent our salaries?”", "”Vem skickade våra löner?”"], ["The first thing {{num.staff|number}} employees will ask is who sent their salaries to a newspaper. You have also said, or are about to say, that the source is protected. How do you put both in the same message today?", "Det första {{num.staff|number}} anställda kommer att fråga är vem som skickade deras löner till en tidning. Ni har också sagt, eller är på väg att säga, att källan är skyddad. Hur får ni in båda sakerna i samma meddelande i dag?"]),
              pb(["Describing the cause", "Att beskriva orsaken"], ["The notification to {{reg.dpaShort}} asks how the breach happened. Writing “an employee gave documents to a journalist” puts a protected disclosure in a regulator's file. How do you describe the cause without exposing or blaming the source?", "Anmälan till {{reg.dpaShort}} frågar hur incidenten gick till. Att skriva ”en anställd gav dokument till en journalist” lägger en skyddad visselblåsning i en myndighets akt. Hur beskriver ni orsaken utan att avslöja eller skuldbelägga källan?"]),
              pb(["The newspaper says no", "Tidningen säger nej"], ["The newspaper's lawyer replies that it never deletes material from sources and cannot discuss it further. Your written request is now in their files and changes nothing. What do you tell staff who ask whether their pay is still out there?", "Tidningens jurist svarar att den aldrig raderar material från källor och inte kan diskutera saken vidare. Er skriftliga begäran ligger nu i deras arkiv och ändrar ingenting. Vad säger ni till personal som frågar om deras löner fortfarande finns där ute?"])
            ],
            B: [
              pb(["The DPO will not sign", "Dataskyddsombudet skriver inte under"], ["{{person.dpo.name}} puts it in writing: this is a personal data breach whether or not it is published, and the 72 hours are running. Not notifying is a decision the DPO will not sign. Who in the room signs it instead?", "{{person.dpo.name}} skriver det svart på vitt: det här är en personuppgiftsincident oavsett om det publiceras, och 72 timmar löper. Att inte anmäla är ett beslut som dataskyddsombudet inte skriver under. Vem i rummet skriver under i stället?"]),
              pb(["A promise you cannot check", "Ett löfte ni inte kan kontrollera"], ["The reporter says the newspaper will not publish the sheet, but does not say it will delete it. Your reason for telling no one now rests on a third party's word. Is that enough to explain to {{num.staff|number}} employees later?", "Reportern säger att tidningen inte kommer att publicera kalkylbladet, men inte att den raderar det. Ert skäl att inte berätta för någon vilar nu på en tredje parts ord. Räcker det som förklaring till {{num.staff|number}} anställda senare?"]),
              pb(["One copy of how many?", "En kopia av hur många?"], ["You do not know whether anyone else received the folder. Another newspaper, a union or an authority could hold the same sheet, and your request covers one copy. Can you decide not to notify while that is unknown?", "Ni vet inte om någon annan har fått mappen. En annan tidning, ett fackförbund eller en myndighet kan ha samma kalkylblad, och er begäran gäller en kopia. Kan ni besluta att inte anmäla så länge det är okänt?"])
            ],
            C: [
              pb(["Their lawyer, your deadline", "Deras jurist, er frist"], ["The newspaper says its lawyer will reply “next week”. The 72 hours started when the reporter told you about the sheet. Do you let your notification deadline depend on another organisation's lawyer?", "Tidningen säger att dess jurist svarar ”nästa vecka”. 72 timmar började löpa när reportern berättade om kalkylbladet. Låter ni er anmälningsfrist hänga på en annan organisations jurist?"]),
              pb(["Confirmation of what?", "Bekräftelse på vad?"], ["{{person.dpo.name}} asks what a signed confirmation would prove. It cannot show that no copies were made, and it does not undo the fact that the data left. If deletion does not change whether this is a breach, why are you waiting for it?", "{{person.dpo.name}} frågar vad en underskriven bekräftelse skulle bevisa. Den kan inte visa att inga kopior gjorts, och den ändrar inte att datan har lämnat företaget. Om raderingen inte avgör om det är en incident, varför väntar ni på den?"]),
              pb(["The rumour arrives first", "Ryktet kommer först"], ["An employee tells HR they have heard that “salaries are out” and asks directly whether theirs is one of them. Until the confirmation arrives, you have decided to say nothing. What does HR answer today?", "En anställd säger till HR att hen har hört att ”lönerna har läckt” och frågar rakt ut om hens egen är med. Tills bekräftelsen kommer har ni bestämt er för att inte säga något. Vad svarar HR i dag?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["After notifying", "Efter anmälan"], [
              io(["The regulator follows up", "Myndigheten följer upp"], ["{{reg.dpaShort}} acknowledges the notification within hours and asks who could open the salary sheet before it left, and why.", "{{reg.dpaShort}} bekräftar anmälan inom några timmar och frågar vem som kunde öppna lönekalkylbladet innan det lämnade företaget, och varför."], ["{{reg.dpaShort}} has opened a file and asked about the sheet's access rights.", "{{reg.dpaShort}} har öppnat ett ärende och frågat om kalkylbladets behörigheter."], { meters: { regulator: 1 } }),
              io(["A tense staff briefing", "En spänd personalinformation"], ["Staff take the news badly but listen. Most questions are about who could see their pay, and two managers ask loudly whether the person who sent it will be disciplined.", "Personalen tar emot beskedet illa men lyssnar. De flesta frågorna gäller vem som kunde se deras löner, och två chefer frågar högt om den som skickade det kommer att bestraffas."], ["Staff were told today that their salaries left the company.", "Personalen fick i dag veta att deras löner har lämnat företaget."]),
              io(["The newspaper declines", "Tidningen avböjer"], ["The newspaper's lawyer replies that it never deletes material received from sources and will not discuss it further. Your request is now in their files.", "Tidningens jurist svarar att den aldrig raderar material från källor och inte tänker diskutera saken vidare. Er begäran ligger nu i deras arkiv."], ["The newspaper declined to delete the salary sheet.", "Tidningen har avböjt att radera lönekalkylbladet."])
            ]),
            ir("i2", { notChosen: "A" }, ["Salaries still unspoken", "Lönerna förblir outtalade"], [
              io(["The rumour arrives", "Ryktet kommer"], ["Someone has heard that “salaries are out”. By the afternoon HR has a queue of employees asking whether theirs is one of them, and HR has nothing it is allowed to say.", "Någon har hört att ”lönerna har läckt”. På eftermiddagen har HR en kö av anställda som frågar om deras egen är med, och HR har inget den får säga."], ["A rumour that salaries leaked is circulating among staff.", "Ett rykte om att lönerna har läckt går bland personalen."], { reopen: true, meters: { trust: -1 } }),
              io(["The DPO dissents", "Dataskyddsombudet reserverar sig"], ["{{person.dpo.name}} records formal dissent: this is a personal data breach whether or not it is published, and the clock is running. A copy goes to the board.", "{{person.dpo.name}} lämnar en formell reservation: det här är en personuppgiftsincident oavsett om det publiceras, och klockan går. En kopia går till styrelsen."], ["The DPO has recorded written dissent on the handling of the salary data.", "Dataskyddsombudet har skriftligt reserverat sig mot hanteringen av lönedatan."]),
              io(["“Removed”, says the paper", "”Borttaget”, säger tidningen"], ["The reporter says, by phone, that the sheet has been removed from the newsroom's working files. Nothing is in writing, and nobody can say whether copies exist elsewhere.", "Reportern säger i telefon att kalkylbladet har tagits bort från redaktionens arbetsfiler. Inget finns skriftligt, och ingen kan säga om det finns kopior någon annanstans."], ["The newspaper says the sheet was removed; no copies can be verified.", "Tidningen säger att kalkylbladet är borttaget; inga kopior kan kontrolleras."])
            ])
          ]
        }),
        facilitator: fac(
          ["A protected disclosure can still contain a breach. Both can be true at once.", "En skyddad visselblåsning kan ändå innehålla en incident. Båda kan vara sanna samtidigt."],
          ["Notify, inform staff first, request non-retention, and tighten the sheet's access.", "Anmäl, informera personalen först, begär att det inte behålls och strama åt behörigheterna."],
          [["Ask: would you have accepted this access level on the salary sheet yesterday?", "Fråga: hade ni accepterat den här behörighetsnivån på lönekalkylbladet i går?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 2880,
        title: L(["Thursday", "Torsdag"]),
        twist: L(["The article runs, and it includes something you had not found: the same cut support was also billed to public-sector customers under a framework agreement with strict terms. By noon, the consumer regulator has asked for your billing records.", "Artikeln publiceras, och den innehåller något ni inte hade hittat: samma bortplockade support fakturerades också kunder i offentlig sektor enligt ett ramavtal med strikta villkor. Vid lunch har konsumentmyndigheten begärt in era faktureringsunderlag."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "The article is out and the public-sector customers are furious. Inside the company, people are guessing who the source is. Does your stance on the source still hold?", sv: "Artikeln är publicerad och kunderna i offentlig sektor är rasande. Inom företaget gissar folk vem källan är. Håller ert förhållningssätt till källan fortfarande?" } },
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because staff were told about the salary sheet, pay comparisons are circulating internally, and three managers have asked to talk to HR.", sv: "Eftersom personalen fick veta om lönekalkylbladet cirkulerar lönejämförelser internt, och tre chefer har bett att få prata med HR." } }
        ],
        assumptionChallenged: L(["The billing problem only concerns ordinary commercial customers.", "Faktureringsproblemet gäller bara vanliga kommersiella kunder."]),
        narrative: L([
          "{{time.T+2880|weekday|cap}}, morning. The article is on the front page of the newspaper's website. The headline is about customers paying for something they did not get, and the second paragraph is about a company that ignored its own staff.\n\n{{person.serviceOwner.name}}'s phone has been ringing since seven. The leak itself is mentioned once, near the end.",
          "{{time.T+2880|weekday|cap}}, morgon. Artikeln ligger högst upp på tidningens webbplats. Rubriken handlar om kunder som betalat för något de inte fått, och andra stycket om ett företag som ignorerade sin egen personal.\n\n{{person.serviceOwner.name}}s telefon har ringt sedan sju. Själva läckan nämns en gång, mot slutet."
        ]),
        injects: [
          inj("i4-1", 2880, "newsHeadline", "media", "high", "confirmed", [
            "Customers paid for support that no longer existed, documents show. An employee who raised the alarm internally twice was told to drop it.",
            "Kunder betalade för support som inte längre fanns, visar dokument. En anställd som slog larm internt två gånger fick höra att släppa det."
          ], { headline: ["Paid for a service that was quietly cut", "Betalade för en tjänst som i tysthet togs bort"], tests: ["lo4"] }),
          inj("i4-2", 2940, "regulatorLetter", "regulator", "high", "confirmed", [
            "The consumer authority requests, within ten working days, billing records for premium support for the last three years, the decision to reduce the service, and your plan for affected customers.",
            "Konsumentmyndigheten begär, inom tio arbetsdagar, faktureringsunderlag för premiumsupport för de senaste tre åren, beslutet att minska tjänsten och er plan för berörda kunder."
          ], { tests: ["lo4"] }),
          inj("i4-3", 3000, "customerComplaint", "customer", "medium", "confirmed", [
            "“We have paid for premium support for three years. Were we ever getting it? We want an answer and a refund, not a statement.”",
            "”Vi har betalat för premiumsupport i tre år. Fick vi den någonsin? Vi vill ha ett svar och pengarna tillbaka, inte ett pressmeddelande.”"
          ], { optional: true, tests: ["lo4"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["The billing question", "Faktureringsfrågan"]),
          data: kpi([
            { id: "cust", label: ["Customers billed for premium support", "Kunder fakturerade för premiumsupport"], value: (v) => v.customers, tone: "warn" },
            { id: "amt", label: ["Estimated overbilling (million)", "Uppskattad överfakturering (miljoner)"], value: (v) => v.overbilled, tone: "danger" },
            { id: "rep", label: ["Internal reports ignored", "Ignorerade interna rapporter"], value: 2, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("Can you work out who was billed and how much, from the systems you have?", "Kan ni räkna ut vem som fakturerats och hur mycket, med de system ni har?", ["cfo", "itOps"]),
            q("What records must you preserve now?", "Vilka underlag måste ni bevara nu?", ["legal", "itOps"]),
            q("Did telling staff about the salary sheet before the article help?", "Hjälpte det att berätta om lönekalkylbladet för personalen före artikeln?", ["hr"], "d3")
          ],
          executive: [
            q("Do you apologise and refund, or defend the decision?", "Ber ni om ursäkt och betalar tillbaka, eller försvarar ni beslutet?", ["ceo", "cfo"]),
            q("Who speaks for the company today?", "Vem talar för företaget i dag?", ["comms", "ceo"]),
            q("Would hunting for the source on day one be in this article too?", "Hade jakten på källan första dagen också funnits med i den här artikeln?", ["comms"], "d2")
          ]
        },
        challenges: [ch("The board chair asks why the board learned about the internal reports from a newspaper.", "Styrelseordföranden frågar varför styrelsen fick veta om de interna rapporterna från en tidning.")],
        decision: dec("d4", "ceo", ["What is your public response?", "Vilket är ert offentliga svar?"], [
          ["Acknowledge the billing error, commit to refunds, and announce an independent review of how the reports were handled.", "Erkänn faktureringsfelet, åta er att betala tillbaka och tillkännage en oberoende granskning av hur rapporterna hanterades."],
          ["Say you are investigating and will comment when it is complete.", "Säg att ni utreder och kommer att kommentera när utredningen är klar."],
          ["Lead with the facts of the billing, and say clearly that the documents were taken without permission.", "Börja med fakta om faktureringen, och säg tydligt att dokumenten togs utan tillstånd."]
        ], {
          knowns: [["The billing allegation is accurate.", "Påståendet om faktureringen stämmer."]],
          uncertainties: [["The full amount owed.", "Hela beloppet som ska betalas tillbaka."]],
          tradeoffs: {
            operational: ["Refunds need a calculation you do not yet have.", "Återbetalningar kräver en beräkning ni ännu inte har."],
            security: ["Talking about the leak invites the question of who leaked.", "Att prata om läckan väcker frågan om vem som läckte."],
            legal: ["Admitting the error may affect the regulator's case.", "Att erkänna felet kan påverka myndighetens ärende."],
            reputational: ["“Investigating” reads as stalling when the documents are public.", "”Vi utreder” uppfattas som förhalning när dokumenten är offentliga."]
          },
          evaluation: [["Answers the substance and owns the failure to listen", "Svarar på sakfrågan och tar ansvar för att man inte lyssnade"]],
          pushback: {
            A: [
              pb(["Refunds without a number", "Återbetalning utan belopp"], ["{{person.cfo.name}} cannot yet say which customers are owed or how much. Promise refunds today and the reporter will ask for the figure tomorrow. Do you commit before you can calculate, and what do you say when asked “how much”?", "{{person.cfo.name}} kan ännu inte säga vilka kunder som ska ha pengar tillbaka eller hur mycket. Lovar ni återbetalning i dag kommer reportern att fråga efter beloppet i morgon. Åtar ni er innan ni kan räkna, och vad säger ni när någon frågar ”hur mycket”?"]),
              pb(["Handing over the conclusion", "Att lämna över slutsatsen"], ["{{person.legal.name}} warns that admitting the billing error publicly, on the same day the consumer authority asks for your records, hands the regulator its conclusion before it has read a page. Do you still say “error” out loud today?", "{{person.legal.name}} varnar för att ett offentligt erkännande av faktureringsfelet, samma dag som konsumentmyndigheten begär in era underlag, ger myndigheten dess slutsats innan den har läst en sida. Säger ni ändå ”fel” högt i dag?"]),
              pb(["Independent of whom?", "Oberoende av vem?"], ["You have promised an independent review of how the two reports were handled. Those reports were closed inside a line of management that answers to people in this crisis team. Who chooses the reviewer, and should anyone in this room have a say?", "Ni har lovat en oberoende granskning av hur de två rapporterna hanterades. Rapporterna avslutades inom en chefslinje som svarar mot personer i den här krisledningen. Vem väljer granskaren, och bör någon i det här rummet ha något att säga till om?"])
            ],
            B: [
              pb(["The framework customers", "Ramavtalskunderna"], ["The public-sector customers point to the terms of their framework agreement: they want a written explanation within days, not when your review is done. “Investigating” does not meet a contract. What do you tell them that you are not telling the press?", "Kunderna i offentlig sektor hänvisar till villkoren i sitt ramavtal: de vill ha en skriftlig förklaring inom några dagar, inte när er utredning är klar. ”Vi utreder” uppfyller inte ett avtal. Vad säger ni till dem som ni inte säger till pressen?"]),
              pb(["“Already investigated twice”", "”Redan utrett två gånger”"], ["The reporter's follow-up quotes your statement next to the two reports closed last year: “The company says it is investigating. It has been told twice before.” How do you answer that line?", "Reporterns uppföljning citerar ert uttalande bredvid de två rapporterna som avslutades förra året: ”Företaget säger att det utreder. Det har fått veta två gånger tidigare.” Hur svarar ni på den meningen?"]),
              pb(["Staff read it too", "Personalen läser också"], ["Employees have read that a colleague raised this twice and was ignored. Internally they ask what is actually being done. If the public answer is “investigating”, what do you tell your own staff that is more than that?", "De anställda har läst att en kollega tog upp det här två gånger och ignorerades. Internt frågar de vad som faktiskt görs. Om det offentliga svaret är ”vi utreder”, vad säger ni till er egen personal som är mer än så?"])
            ],
            C: [
              pb(["Aimed at a colleague", "Riktat mot en kollega"], ["Staff and the union read “taken without permission” as an accusation against the colleague who reported twice and was ignored. The union asks whether the company now regards that person as a thief. What is your answer?", "Personalen och facket läser ”togs utan tillstånd” som en anklagelse mot kollegan som rapporterade två gånger och ignorerades. Facket frågar om företaget nu ser den personen som en tjuv. Vad svarar ni?"]),
              pb(["The quote you will get", "Citatet ni kommer att få"], ["{{person.comms.name}} predicts tomorrow's headline: “Company that ignored warnings goes after the whistleblower.” The billing facts will be quoted less than that one sentence. Do you keep it in the statement?", "{{person.comms.name}} förutser morgondagens rubrik: ”Företaget som ignorerade varningar går på visselblåsaren.” Fakta om faktureringen kommer att citeras mindre än den enda meningen. Behåller ni den i uttalandet?"]),
              pb(["Can you prove it?", "Kan ni bevisa det?"], ["{{person.ciso.name}} found no intrusion: the documents were opened by people with every right to open them. {{person.legal.name}} warns that a public claim of unauthorised taking may itself be seen as a reprisal. Can you defend that sentence if challenged?", "{{person.ciso.name}} hittade inget intrång: dokumenten öppnades av personer med full rätt att öppna dem. {{person.legal.name}} varnar för att ett offentligt påstående om att något tagits utan tillstånd i sig kan ses som en repressalie. Kan ni försvara den meningen om den ifrågasätts?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["After owning it", "Efter erkännandet"], [
              io(["Coverage softens", "Bevakningen mildras"], ["The evening follow-ups quote your acknowledgement next to the original story. Several customers say publicly that they will wait and see what the refunds look like.", "Kvällens uppföljningar citerar ert erkännande bredvid den ursprungliga artikeln. Flera kunder säger offentligt att de avvaktar och ser hur återbetalningarna blir."], ["Follow-up coverage quoted your acknowledgement alongside the story.", "Uppföljande bevakning citerade ert erkännande bredvid artikeln."], { meters: { media: -1 } }),
              io(["Claims pour in", "Kraven strömmar in"], ["By the afternoon, customer service has hundreds of refund claims, including from customers who never bought premium support. {{person.cfo.name}} still has no figure to work from.", "På eftermiddagen har kundtjänst hundratals krav på återbetalning, även från kunder som aldrig köpt premiumsupport. {{person.cfo.name}} har fortfarande inget belopp att utgå från."], ["Refund claims are arriving faster than finance can assess them.", "Krav på återbetalning kommer in snabbare än ekonomi hinner bedöma dem."]),
              io(["The regulator quotes you", "Myndigheten citerar er"], ["The consumer authority's follow-up letter cites your public statement as the company's own admission and asks for the refund plan within the same deadline.", "Konsumentmyndighetens uppföljande brev hänvisar till ert offentliga uttalande som företagets eget medgivande och begär återbetalningsplanen inom samma frist."], ["The consumer authority cites your public admission in its case.", "Konsumentmyndigheten hänvisar till ert offentliga medgivande i sitt ärende."], { meters: { regulator: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["No one owns it", "Ingen tar ansvar"], [
              io(["Framework customers escalate", "Ramavtalskunderna trappar upp"], ["The public-sector customers invoke their framework agreement and demand a written explanation within five working days. One says it is reviewing whether to suspend payments.", "Kunderna i offentlig sektor åberopar ramavtalet och kräver en skriftlig förklaring inom fem arbetsdagar. En av dem säger att den ser över om betalningarna ska stoppas."], ["Public-sector customers demanded a written explanation under their framework agreement.", "Kunder i offentlig sektor har krävt en skriftlig förklaring enligt ramavtalet."], { meters: { trust: -1 } }),
              io(["Staff go to the press", "Personal går till pressen"], ["Two current employees tell a second outlet, anonymously, that the company still will not admit what everyone inside knows. The new story leads with your statement.", "Två nuvarande anställda berättar anonymt för en annan redaktion att företaget fortfarande inte vill erkänna det alla internt vet. Den nya artikeln inleds med ert uttalande."], ["Current staff have spoken anonymously to a second outlet.", "Nuvarande anställda har talat anonymt med en annan redaktion."], { reopen: true, meters: { media: 1 } }),
              io(["The story moves on", "Nyheten går vidare"], ["By evening the article has slipped down the front page and no other outlet has picked it up. Some in the room feel the worst is over.", "Till kvällen har artikeln glidit ner på förstasidan och ingen annan redaktion har tagit upp den. Några i rummet känner att det värsta är över."], ["Media interest dropped by the evening of publication.", "Medieintresset avtog till kvällen på publiceringsdagen."])
            ])
          ]
        }),
        facilitator: fac(
          ["The leak is a sideshow; the public cares about the billing and the ignored reports.", "Läckan är ett sidospår; allmänheten bryr sig om faktureringen och de ignorerade rapporterna."],
          ["Own it, refund, and review the whistleblowing process independently.", "Ta ansvar, betala tillbaka och låt visselblåsarprocessen granskas oberoende."],
          [["Ask: which sentence in your statement would the reporter quote tomorrow?", "Fråga: vilken mening i ert uttalande skulle reportern citera i morgon?"]]
        )
      },
      {
        id: "p5",
        clock: 4320,
        priority: 2,
        title: L(["The case handler", "Handläggaren"]),
        twist: L(["The case handler who closed both reports says they were told by the CFO that billing questions were “not for the whistleblowing channel”. There is an email.", "Handläggaren som avslutade båda rapporterna säger att ekonomichefen sa att faktureringsfrågor ”inte hör hemma i visselblåsarkanalen”. Det finns ett mejl."]),
        twistKind: "authority",
        assumptionChallenged: L(["One person made a bad call.", "En person gjorde en dålig bedömning."]),
        narrative: L([
          "{{time.T+4320|weekday|cap}}. The review has started. {{person.hr.name}} and {{person.legal.name}} interview the case handler who closed the two reports, expecting an apology for poor judgement.\n\nInstead the case handler brings a printed email. It is short, and it is signed by someone who is sitting in the crisis team.",
          "{{time.T+4320|weekday|cap}}. Granskningen har börjat. {{person.hr.name}} och {{person.legal.name}} intervjuar handläggaren som avslutade de två rapporterna och väntar sig en ursäkt för ett dåligt omdöme.\n\nI stället tar handläggaren fram ett utskrivet mejl. Det är kort, och det är undertecknat av någon som sitter i krisledningen."
        ]),
        injects: [
          inj("i5-1", 4320, "email", "employee", "high", "confirmed", [
            "“Billing and pricing questions are commercial decisions and not for the whistleblowing channel. Please close these and refer the person to their manager.”",
            "”Fakturerings- och prisfrågor är kommersiella beslut och hör inte hemma i visselblåsarkanalen. Avsluta dessa och hänvisa personen till sin chef.”"
          ], { headline: ["Re: Case 2", "Sv: Ärende 2"], meta: { subject: L(["Re: Case 2", "Sv: Ärende 2"]) }, tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Who else has written instructions about what the channel may handle?", "Vem mer har gett skriftliga instruktioner om vad kanalen får hantera?", ["legal"]),
            q("How do you keep the review independent of the people it concerns?", "Hur håller ni granskningen oberoende av de personer den gäller?", ["legal", "hr"]),
            q("Is your public commitment to an independent review now harder to keep?", "Är ert offentliga löfte om en oberoende granskning nu svårare att hålla?", ["ceo"], "d4")
          ],
          executive: [
            q("Can the CFO stay in the crisis team?", "Kan ekonomichefen sitta kvar i krisledningen?", ["ceo"]),
            q("Who tells the board, and what exactly?", "Vem berättar för styrelsen, och vad exakt?", ["ceo", "legal"]),
            q("Did the public statement on Thursday say anything that is now untrue?", "Sa uttalandet i torsdags något som nu är osant?", ["comms"], "d4")
          ]
        },
        challenges: [ch("The CFO says the email was a reasonable instruction about scope.", "Ekonomichefen säger att mejlet var en rimlig instruktion om avgränsning.")],
        noDecision: L(["No vote: this is for the board. Let the room decide what it must tell the board and how the review stays independent.", "Ingen omröstning: det här är en fråga för styrelsen. Låt rummet bestämma vad det måste berätta för styrelsen och hur granskningen hålls oberoende."]),
        facilitator: fac(
          ["Conflicts of interest inside the crisis team are common and rarely named. Name it.", "Jäv inom krisledningen är vanligt och benämns sällan. Benämn det."],
          ["The CFO steps back from the crisis team; the board receives the email; the review is external.", "Ekonomichefen kliver av krisledningen; styrelsen får mejlet; granskningen är extern."],
          [["Ask: who in this room is being reviewed?", "Fråga: vem i det här rummet granskas?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        priority: 3,
        title: L(["Every closed case", "Varje avslutat ärende"]),
        twist: L(["The external review reads three years of the channel: 19 reports, 17 closed by the same case handler, most on the day they arrived. Two concerned safety.", "Den externa granskningen läser tre år av kanalen: 19 rapporter, 17 avslutade av samma handläggare, de flesta samma dag som de kom in. Två gällde säkerhet."]),
        twistKind: "scope",
        reconsider: { decision: "d4", pressure: { en: "Seventeen of nineteen reports were closed by the same handler. Was your first public answer still the right one?", sv: "Sjutton av nitton rapporter avslutades av samma handläggare. Var ert första offentliga svar fortfarande det rätta?" } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because you acknowledged the error and committed to refunds, public-sector customers now claim refunds for five years, not the two in the article.", sv: "Eftersom ni erkände felet och åtog er att betala tillbaka kräver kunderna i offentlig sektor nu återbetalning för fem år, inte de två som artikeln nämnde." } }
        ],
        assumptionChallenged: L(["The channel failed once.", "Kanalen fallerade en gång."]),
        reveals: ["hf-channel"],
        narrative: L([
          "{{time.T+10080|weekday|cap}}. A week later. The external reviewer presents the first findings to the board and the crisis team, with the billing case set aside for a moment.\n\nThey have read every report the channel ever received. The billing reports were not an exception, and some of the other closed cases were about things far more serious than money.",
          "{{time.T+10080|weekday|cap}}. En vecka senare. Den externa granskaren presenterar de första resultaten för styrelsen och krisledningen, med faktureringsärendet åsidosatt en stund.\n\nGranskaren har läst varje rapport som kanalen någonsin tagit emot. Faktureringsrapporterna var inget undantag, och en del av de andra avslutade ärendena gällde saker som var betydligt allvarligare än pengar."
        ]),
        injects: [
          inj("i6-1", 10080, "impactReport", "irRetainer", "high", "confirmed", [
            "Reports received in three years: 19. Closed by the same case handler: 17. Closed on the day of receipt: 12. Reporter given feedback: 3. Two closed reports concern workplace safety.",
            "Mottagna rapporter på tre år: 19. Avslutade av samma handläggare: 17. Avslutade samma dag som de kom in: 12. Återkoppling till den som rapporterade: 3. Två avslutade rapporter gäller arbetsmiljö och säkerhet."
          ], { reveals: ["hf-channel"], tests: ["lo2", "lo4"] })
        ],
        questions: {
          technical: [
            q("How should a whistleblowing channel be run so one person cannot close everything?", "Hur bör en visselblåsarkanal drivas så att en person inte kan avsluta allt?", ["legal", "hr"]),
            q("Should the channel be run by someone outside the company?", "Bör kanalen drivas av någon utanför företaget?", ["legal"]),
            q("Looking back, how did protecting the source shape the week?", "När ni ser tillbaka, hur påverkade skyddet av källan veckan?", ["hr"], "d2")
          ],
          executive: [
            q("Do you reopen the two safety reports today?", "Öppnar ni de två säkerhetsrapporterna igen i dag?", ["ceo", "hr"]),
            q("What do you tell staff about the channel now?", "Vad säger ni till personalen om kanalen nu?", ["comms", "hr"]),
            q("Which decision in the first hour mattered most?", "Vilket beslut under den första timmen spelade störst roll?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("One of the safety reports names a supervisor who still manages the reporter.", "En av säkerhetsrapporterna namnger en arbetsledare som fortfarande är chef för den som rapporterade.")],
        decision: dec("d5", "ceo", ["What changes?", "Vad ändras?"], [
          ["Reopen every closed report, move the channel to an independent party, and report outcomes to the board quarterly.", "Öppna alla avslutade rapporter igen, flytta kanalen till en oberoende part och rapportera utfallen till styrelsen varje kvartal."],
          ["Replace the case handler and keep the channel in-house.", "Byt handläggare och behåll kanalen internt."],
          ["Relaunch the channel with a new case handler and a reminder to all staff, keeping it in-house where people know it.", "Starta om kanalen med en ny handläggare och en påminnelse till all personal, och behåll den internt där folk känner till den."]
        ], {
          knowns: [["The channel closed almost everything without investigation.", "Kanalen avslutade nästan allt utan utredning."]],
          uncertainties: [["How many people stopped reporting because of it.", "Hur många som slutade rapportera på grund av det."]],
          tradeoffs: {
            operational: ["Reopening 17 cases is months of work.", "Att öppna 17 ärenden igen är månader av arbete."],
            security: ["Safety reports left closed are a risk today.", "Säkerhetsrapporter som lämnas avslutade är en risk i dag."],
            legal: ["Whistleblowing law sets requirements for how reports are handled.", "Visselblåsarlagstiftningen ställer krav på hur rapporter hanteras."],
            reputational: ["Staff trust in the channel is close to zero.", "Personalens förtroende för kanalen är nära noll."]
          },
          evaluation: [["Fixes the channel so the next report reaches someone who acts", "Rättar kanalen så att nästa rapport når någon som agerar"]],
          pushback: {
            A: [
              pb(["Seventeen old cases", "Sjutton gamla ärenden"], ["Reopening means contacting people who reported up to three years ago, and some have left. {{person.legal.name}} warns that reopened cases may turn up new liabilities the company must then act on. Who does this work, and which cases go first?", "Att öppna igen innebär att kontakta personer som rapporterade för upp till tre år sedan, och en del har slutat. {{person.legal.name}} varnar för att återöppnade ärenden kan leda till nya ansvarsfrågor som företaget sedan måste agera på. Vem gör jobbet, och vilka ärenden tas först?"]),
              pb(["Managers object", "Cheferna invänder"], ["Several managers object that an outside party will receive allegations about them without knowing the business, and that the board will see unverified accusations every quarter. Do you accept that, or limit what the board sees?", "Flera chefer invänder att en extern part kommer att ta emot anklagelser mot dem utan att känna verksamheten, och att styrelsen kommer att se overifierade anklagelser varje kvartal. Accepterar ni det, eller begränsar ni vad styrelsen får se?"]),
              pb(["The supervisor is still there", "Arbetsledaren är kvar"], ["One reopened safety report names a supervisor who still manages the person who reported. A move to an external party takes weeks to set up. Does that report wait in the queue, and what do you do about the supervisor today?", "En av de återöppnade säkerhetsrapporterna namnger en arbetsledare som fortfarande är chef för den som rapporterade. Att flytta kanalen till en extern part tar veckor att ordna. Får den rapporten vänta i kön, och vad gör ni med arbetsledaren i dag?"])
            ],
            B: [
              pb(["Same reporting line", "Samma rapportväg"], ["The new case handler would sit in the same reporting line that sent the “not for the whistleblowing channel” email. Staff ask what stops the same instruction reaching the next person. What is your answer?", "Den nya handläggaren skulle sitta i samma rapportväg som skickade mejlet om att det ”inte hör hemma i visselblåsarkanalen”. Personalen frågar vad som hindrar att samma instruktion når nästa person. Vad svarar ni?"]),
              pb(["A scapegoat", "En syndabock"], ["The old case handler's union says the handler followed a written instruction from a senior manager and is being made to carry the blame alone. Do you replace them anyway, and what happens to the person who gave the instruction?", "Den tidigare handläggarens fackförbund säger att handläggaren följde en skriftlig instruktion från en högre chef och nu får bära skulden ensam. Byter ni ut hen ändå, och vad händer med den som gav instruktionen?"]),
              pb(["Still closed", "Fortfarande avslutade"], ["A new case handler starts from today. The seventeen closed reports stay closed, two of them about safety, and the people who sent them are still waiting for an answer. Who answers them?", "En ny handläggare börjar i dag. De sjutton avslutade rapporterna förblir avslutade, två av dem om säkerhet, och de som skickade dem väntar fortfarande på svar. Vem svarar dem?"])
            ],
            C: [
              pb(["Reply all", "Svara alla"], ["Within minutes of the reminder, someone replies to all staff: “I reported in this channel two years ago and nobody ever answered.” Others add their own stories. What does your relaunch say about the reports that were already ignored?", "Inom några minuter efter påminnelsen svarar någon till all personal: ”Jag rapporterade i den här kanalen för två år sedan och fick aldrig något svar.” Andra fyller på med egna berättelser. Vad säger er omstart om de rapporter som redan ignorerats?"]),
              pb(["What the law asks", "Vad lagen kräver"], ["{{person.legal.name}} points out that a relaunch does nothing about three years in which the channel may not have met legal requirements for handling and feedback. If a regulator asks how those reports were handled, what do you show them?", "{{person.legal.name}} påpekar att en omstart inte gör något åt tre år då kanalen kanske inte uppfyllde lagens krav på hantering och återkoppling. Om en myndighet frågar hur de rapporterna hanterades, vad visar ni då?"]),
              pb(["Where people know it", "Där folk känner till den"], ["Staff say that “in-house, where people know it” is exactly the problem: they know who reads it and who that person reports to. The board asks how you will know whether anyone uses it. What will you measure?", "Personalen säger att ”internt, där folk känner till den” är just problemet: de vet vem som läser den och vem den personen rapporterar till. Styrelsen frågar hur ni ska veta om någon använder den. Vad tänker ni mäta?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Reopening the channel", "Kanalen öppnas igen"], [
              io(["A reporter answers", "En rapportör svarar"], ["The reviewer reaches the person behind one of the closed safety reports. They agree to talk, and say this is the first time anyone has asked.", "Granskaren når personen bakom en av de avslutade säkerhetsrapporterna. Hen går med på att prata, och säger att det är första gången någon frågar."], ["The first reopened safety report is under active investigation.", "Den första återöppnade säkerhetsrapporten utreds nu aktivt."]),
              io(["Managers push back", "Cheferna slår tillbaka"], ["Two senior managers formally object to an outside party receiving allegations about them, and one says they will not stay if the board sees unverified accusations every quarter.", "Två högre chefer invänder formellt mot att en extern part ska ta emot anklagelser mot dem, och en säger att hen inte stannar om styrelsen ska se overifierade anklagelser varje kvartal."], ["Two senior managers formally objected to the independent channel.", "Två högre chefer har formellt invänt mot den oberoende kanalen."], { reopen: true }),
              io(["A new liability", "Ett nytt ansvar"], ["{{person.legal.name}} reads one reopened case and warns it may trigger a duty to report to an authority. Nobody yet knows how serious it is.", "{{person.legal.name}} läser ett återöppnat ärende och varnar för att det kan utlösa en skyldighet att rapportera till en myndighet. Ingen vet ännu hur allvarligt det är."], ["A reopened case may trigger a reporting duty to an authority.", "Ett återöppnat ärende kan utlösa en rapporteringsskyldighet till en myndighet."], { meters: { regulator: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["Old reports stay closed", "Gamla rapporter förblir stängda"], [
              io(["A reporter writes", "En rapportör skriver"], ["The person behind one of the closed safety reports emails the CEO: “I reported this two years ago. Will anyone look at it now, or should I go to the press too?”", "Personen bakom en av de avslutade säkerhetsrapporterna mejlar vd: ”Jag rapporterade det här för två år sedan. Kommer någon att titta på det nu, eller ska jag också gå till pressen?”"], ["A safety reporter has asked the CEO in writing for an answer.", "En person som rapporterat om säkerhet har skriftligt bett vd om svar."], { reopen: true }),
              io(["The board asks how", "Styrelsen frågar hur"], ["The board chair asks how the board will know the channel works from now on, and asks for a written answer before the next meeting.", "Styrelseordföranden frågar hur styrelsen ska veta att kanalen fungerar framöver, och vill ha ett skriftligt svar före nästa möte."], ["The board has asked for a written plan for oversight of the channel.", "Styrelsen har begärt en skriftlig plan för tillsynen av kanalen."]),
              io(["A new report arrives", "En ny rapport kommer in"], ["Within a day of the relaunch, the channel receives its first new report. Some in the room take it as proof that staff trust it again.", "Inom ett dygn efter omstarten tar kanalen emot sin första nya rapport. Några i rummet ser det som ett bevis på att personalen litar på den igen."], ["A new report arrived in the channel within a day of the change.", "En ny rapport kom in i kanalen inom ett dygn efter ändringen."])
            ])
          ]
        }),
        facilitator: fac(
          ["End where it began: a leak is often a symptom of a channel that does not work.", "Avsluta där det började: en läcka är ofta ett symtom på en kanal som inte fungerar."],
          ["Reopen, externalise, and give the board visibility.", "Öppna igen, lägg ut kanalen externt och ge styrelsen insyn."],
          [["Ask: when did anyone in this room last check that the channel works?", "Fråga: när kontrollerade någon i det här rummet senast att kanalen fungerar?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Customers are refunded and the channel is rebuilt, but the regulator's case runs for months, and the company's reputation now rests on whether the next report is handled differently.",
        "Kunderna får pengarna tillbaka och kanalen byggs om, men myndighetens ärende pågår i månader, och företagets anseende vilar nu på om nästa rapport hanteras annorlunda."
      ])
    },

    debrief: {
      keyLessons: [
        L(["A leak is not always a breach: check for intrusion before assuming theft.", "En läcka är inte alltid ett intrång: kontrollera om det skett ett intrång innan ni antar en stöld."]),
        L(["Whistleblowers are protected; hunting the source can be unlawful and always damages trust.", "Visselblåsare är skyddade; att jaga källan kan vara olagligt och skadar alltid förtroendet."]),
        L(["Personal data inside leaked material is a breach in its own right.", "Personuppgifter i läckt material är en incident i sig."]),
        L(["Answer the substance. The public cares about what the documents say, not how they left.", "Svara på sakfrågan. Allmänheten bryr sig om vad dokumenten säger, inte hur de kom ut."])
      ],
      assumptionsVsReality: [
        avr(["Someone stole our documents.", "Någon har stulit våra dokument."], ["An ignored employee made a protected disclosure.", "En ignorerad anställd gjorde en skyddad visselblåsning."], "p2"),
        avr(["Only billing documents leaked.", "Bara faktureringsdokument läckte."], ["A staff salary sheet was in the folder too.", "Ett lönekalkylblad för personalen fanns också i mappen."], "p3"),
        avr(["The channel failed once.", "Kanalen fallerade en gång."], ["It closed almost every report for three years.", "Den avslutade nästan varje rapport i tre år."], "p6")
      ],
      strengthsToLookFor: [
        L(["Checking the substance before the source", "Att kontrollera sakfrågan före källan"]),
        L(["Refusing to identify the whistleblower", "Att vägra identifiera visselblåsaren"]),
        L(["Naming the conflict of interest in the crisis team", "Att benämna jävet i krisledningen"])
      ],
      commonGaps: [
        L(["Ordering IT to find the leaker", "Att beordra IT att hitta den som läckt"]),
        L(["Missing the personal data in the leaked folder", "Att missa personuppgifterna i den läckta mappen"]),
        L(["A public statement about the leak instead of the substance", "Ett offentligt uttalande om läckan i stället för om sakfrågan"])
      ],
      suggestedActions: [
        act(["Move the whistleblowing channel to an independent party with board reporting.", "Flytta visselblåsarkanalen till en oberoende part med rapportering till styrelsen."], "legal", "high"),
        act(["Write a leak-response procedure that forbids hunting a whistleblower.", "Skriv en rutin för läckor som förbjuder jakt på visselblåsare."], "hr", "high"),
        act(["Review access to HR files such as salary sheets.", "Se över behörigheterna till HR-filer som lönekalkylblad."], "ciso", "medium"),
        act(["Prepare a holding statement template that addresses substance first.", "Ta fram en mall för ett första uttalande som tar upp sakfrågan först."], "comms", "medium")
      ]
    }
  });
})();
