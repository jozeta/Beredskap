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
  const { L, q, ch, inj, dec, fac, act, avr, kpi } = BK.scenarios.h;

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
          ["Have lawyers demand the newspaper return the documents.", "Låt jurister kräva att tidningen lämnar tillbaka dokumenten."]
        ], {
          knowns: [["A reporter holds genuine-looking internal documents.", "En reporter har interna dokument som ser äkta ut."]],
          uncertainties: [["Whether the documents are accurate, and how they left.", "Om dokumenten är korrekta, och hur de kom ut."]],
          tradeoffs: {
            operational: ["Checking the substance takes the time you have before Thursday.", "Att kontrollera sakfrågan tar den tid ni har fram till torsdag."],
            security: ["A hunt for the source may break the law and destroy trust.", "En jakt på källan kan bryta mot lagen och förstöra förtroendet."],
            legal: ["Source protection and whistleblower law limit what you may do.", "Källskydd och visselblåsarlagstiftning begränsar vad ni får göra."],
            reputational: ["Trying to stop the article becomes the article.", "Att försöka stoppa artikeln blir artikeln."]
          },
          evaluation: [["Looks at whether the allegation is true before chasing the messenger", "Undersöker om påståendet stämmer innan budbäraren jagas"]]
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
          evaluation: [["Protects the reporter and shifts attention to the substance", "Skyddar den som rapporterade och flyttar fokus till sakfrågan"]]
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
          ["Wait to see whether the salary sheet appears anywhere.", "Vänta och se om lönekalkylbladet dyker upp någonstans."]
        ], {
          knowns: [["A third party holds staff salary data.", "En tredje part har personalens lönedata."]],
          uncertainties: [["Whether anyone else received the folder.", "Om någon annan har fått mappen."]],
          tradeoffs: {
            operational: ["Telling staff now adds a second storm to the week.", "Att berätta för personalen nu lägger till en andra storm under veckan."],
            security: ["The sheet's original access rights may be far too wide.", "Kalkylbladets ursprungliga behörigheter kan vara alldeles för breda."],
            legal: ["Not publishing does not make it not a breach.", "Att det inte publiceras gör det inte till något annat än en incident."],
            reputational: ["Staff will forgive the leak sooner than the silence.", "Personalen förlåter läckan snabbare än tystnaden."]
          },
          evaluation: [["Treats the salary sheet as a breach in its own right, separate from the disclosure", "Behandlar lönekalkylbladet som en incident i sig, skild från visselblåsningen"]]
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
          ["Focus on the leak of confidential documents.", "Fokusera på läckan av konfidentiella dokument."]
        ], {
          knowns: [["The billing allegation is accurate.", "Påståendet om faktureringen stämmer."]],
          uncertainties: [["The full amount owed.", "Hela beloppet som ska betalas tillbaka."]],
          tradeoffs: {
            operational: ["Refunds need a calculation you do not yet have.", "Återbetalningar kräver en beräkning ni ännu inte har."],
            security: ["Talking about the leak invites the question of who leaked.", "Att prata om läckan väcker frågan om vem som läckte."],
            legal: ["Admitting the error may affect the regulator's case.", "Att erkänna felet kan påverka myndighetens ärende."],
            reputational: ["“Investigating” reads as stalling when the documents are public.", "”Vi utreder” uppfattas som förhalning när dokumenten är offentliga."]
          },
          evaluation: [["Answers the substance and owns the failure to listen", "Svarar på sakfrågan och tar ansvar för att man inte lyssnade"]]
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
          ["Send a reminder about the channel to all staff.", "Skicka en påminnelse om kanalen till all personal."]
        ], {
          knowns: [["The channel closed almost everything without investigation.", "Kanalen avslutade nästan allt utan utredning."]],
          uncertainties: [["How many people stopped reporting because of it.", "Hur många som slutade rapportera på grund av det."]],
          tradeoffs: {
            operational: ["Reopening 17 cases is months of work.", "Att öppna 17 ärenden igen är månader av arbete."],
            security: ["Safety reports left closed are a risk today.", "Säkerhetsrapporter som lämnas avslutade är en risk i dag."],
            legal: ["Whistleblowing law sets requirements for how reports are handled.", "Visselblåsarlagstiftningen ställer krav på hur rapporter hanteras."],
            reputational: ["Staff trust in the channel is close to zero.", "Personalens förtroende för kanalen är nära noll."]
          },
          evaluation: [["Fixes the channel so the next report reaches someone who acts", "Rättar kanalen så att nästa rapport når någon som agerar"]]
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
