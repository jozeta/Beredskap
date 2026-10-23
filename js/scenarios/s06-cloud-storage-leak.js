/*
 * s06-cloud-storage-leak.js — "The Journalist's Question" (archetype F).
 *
 * A reputational and legal crisis first: a journalist asks for comment on
 * leaked data → nobody hacked anything; a storage container was public for
 * months and its logs are incomplete → it holds more categories of personal
 * data than anyone believed → the notification clock started weeks ago, when a
 * customer emailed support → copies now circulate → the story runs and the
 * regulator opens a case.
 *
 * Ground truth: a test configuration made a storage container public; a data
 * export job kept writing production files into it; a researcher found it,
 * a support ticket about it was closed unread, and a forum later shared it.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s06-cloud-storage-leak",
    version: 1,
    category: "cloud-privacy",
    archetype: "human-legal-reputational",
    emblem: "cloud-leak",
    title: L(["The Journalist's Question", "Journalistens fråga"]),
    summary: L([
      "A reporter calls about a file of personal data that seems to come from your systems. Nobody was hacked — which turns out to be no comfort at all.",
      "En reporter ringer om en fil med personuppgifter som verkar komma från era system. Ingen har hackats – vilket visar sig inte vara någon tröst alls."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Respond to the media without guessing or denying", "Svara media utan att gissa eller förneka"]), teaser: L(["Speaking before you know", "Att uttala sig innan man vet"]) },
      { id: "lo2", text: L(["Establish the scope of a cloud exposure with incomplete logs", "Fastställa omfattningen av en exponering i molnet med ofullständiga loggar"]), teaser: L(["Seeing the whole picture with gaps in it", "Att se helheten när bitar saknas"]) },
      { id: "lo3", text: L(["Meet personal data breach duties, including when awareness began", "Uppfylla skyldigheterna vid personuppgiftsincidenter, inklusive när kännedom uppstod"]), teaser: L(["When the clock starts", "När klockan börjar ticka"]) },
      { id: "lo4", text: L(["Treat affected people as the priority", "Sätta de berörda människorna i första rummet"]), teaser: L(["Putting people first", "Att sätta människor först"]) }
    ],
    mitre: ["T1530", "T1213"],
    frameworks: {
      nistCsf: ["GV.PO", "ID.AM", "PR.DS", "PR.PS", "DE.CM", "RS.MA", "RS.AN", "RS.CO", "RC.CO"],
      iso27001: ["A.5.23", "A.5.24", "A.5.25", "A.5.26", "A.5.31", "A.5.34", "A.8.9", "A.8.12", "A.8.15"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours", sectors: ["public", "education", "healthcare", "retail", "technology"] },
    actor: { types: ["unknown"], motivation: L(["Opportunistic discovery and sharing of exposed data", "Opportunistiskt upptäckande och spridning av exponerade data"]), capability: "low" },
    variables: {
      records: { min: 5000, max: 900000, step: 100, scaleBy: "size" },
      monthsPublic: { min: 9, max: 20 },
      sensitive: { min: 300, max: 40000, step: 10, scaleBy: "size" },
      downloads: { min: 6, max: 80 },
      daysSinceTicket: { min: 12, max: 30 }
    },
    roles: ["incidentCommander", "ciso", "cloudLead", "socLead", "serviceOwner", "dpo", "legal", "comms", "ceo"],

    groundTruth: {
      rootCause: L([
        "{{num.monthsPublic}} months ago a test configuration made a {{env.storage}} publicly readable. A nightly export job later began writing production files there. Access logging was only enabled for part of the period. A researcher found the container and emailed support; the ticket was closed as spam. A forum later shared the link.",
        "För {{num.monthsPublic}} månader sedan gjorde en testkonfiguration en {{env.storage}} läsbar för alla. Ett nattligt exportjobb började senare skriva produktionsfiler dit. Åtkomstloggning var bara aktiverad under en del av perioden. En säkerhetsforskare hittade lagringen och mejlade supporten; ärendet stängdes som skräppost. Ett forum delade senare länken."
      ]),
      attackerTimeline: [
        { at: -604800, text: L(["Storage made public by a test configuration.", "Lagringen görs publik genom en testkonfiguration."]) },
        { at: -432000, text: L(["Nightly export job starts writing production data into it.", "Det nattliga exportjobbet börjar skriva produktionsdata dit."]) },
        { at: -40000, text: L(["A researcher finds the container and emails support; ticket closed as spam.", "En säkerhetsforskare hittar lagringen och mejlar supporten; ärendet stängs som skräppost."]) },
        { at: -10080, text: L(["Link shared on a data-leak forum.", "Länken delas på ett forum för dataläckor."]) },
        { at: -1440, text: L(["A journalist obtains the file.", "En journalist får tag på filen."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-public", revealStage: "p2", text: L(["No intrusion: a {{env.storage}} was publicly readable for {{num.monthsPublic}} months, and access logs cover only part of that time.", "Inget intrång: en {{env.storage}} var läsbar för alla i {{num.monthsPublic}} månader, och åtkomstloggarna täcker bara en del av den tiden."]) },
      { id: "hf-categories", revealStage: "p3", text: L(["Besides contact details, the files contain {{num.sensitive}} records with personal identity numbers and notes that reveal health information.", "Utöver kontaktuppgifter innehåller filerna {{num.sensitive}} poster med personnummer och anteckningar som avslöjar hälsouppgifter."]) },
      { id: "hf-ticket", revealStage: "p4", text: L(["A researcher reported the exposure to support {{num.daysSinceTicket}} days ago; the ticket was closed as spam.", "En säkerhetsforskare rapporterade exponeringen till supporten för {{num.daysSinceTicket}} dagar sedan; ärendet stängdes som skräppost."]) },
      { id: "hf-copies", revealStage: "p5", text: L(["The data was shared on a forum and downloaded at least {{num.downloads}} times.", "Datan har delats på ett forum och laddats ner minst {{num.downloads}} gånger."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["A call from the newsroom", "Ett samtal från redaktionen"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. The communications team receives a call from an investigative reporter. They say they have a file with names, addresses and phone numbers of people in {{org.name}}'s records, and they have called some of them to check.\n\nThey plan to publish tomorrow and want a comment today. Nobody in IT has seen any sign of a break-in. The instinct in the room is to deny it.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. Kommunikationsavdelningen får ett samtal från en granskande reporter. Hen säger sig ha en fil med namn, adresser och telefonnummer till personer i {{org.name}}s register, och hen har ringt några av dem för att kontrollera.\n\nHen planerar att publicera i morgon och vill ha en kommentar i dag. Ingen på IT har sett några tecken på intrång. Instinkten i rummet är att förneka."
        ]),
        injects: [
          inj("i1-1", 0, "mediaEnquiry", "media", "high", "confirmed", [
            "“We have a file with what looks like your customer records — {{num.records}} rows. We have verified several by phone. Have you been hacked, and why haven't the people affected been told?”",
            "”Vi har en fil med något som ser ut som ert kundregister – {{num.records}} rader. Vi har verifierat flera via telefon. Har ni blivit hackade, och varför har de berörda inte fått veta något?”"
          ], { headline: ["Request for comment", "Begäran om kommentar"], tests: ["lo1"] }),
          inj("i1-2", 30, "email", "media", "medium", "confirmed", [
            "The reporter sends five sample rows. The column names match an export format your systems use.",
            "Reportern skickar fem exempelrader. Kolumnnamnen stämmer med ett exportformat som era system använder."
          ], { tests: ["lo2"] }),
          inj("i1-3", 45, "chat", "person.serviceOwner", "medium", "misleading", [
            "“We haven't been hacked — we would have seen it. This is probably an old list from a partner. I'd just deny it.”",
            "”Vi har inte blivit hackade – det hade vi märkt. Det här är troligen en gammal lista från en partner. Jag skulle bara förneka det.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Confident and wrong. A denial today becomes tomorrow's headline.", "Säker och fel. Ett förnekande i dag blir morgondagens rubrik."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you confirm in hours whether the file came from your systems?", "Hur bekräftar ni inom några timmar om filen kommer från era system?", ["cloudLead", "socLead"]),
            q("Where does this export format exist in your environment?", "Var finns det här exportformatet i er miljö?", ["cloudLead", "serviceOwner"]),
            q("What should be preserved before anyone starts changing settings?", "Vad bör säkras innan någon börjar ändra inställningar?", ["socLead", "ciso"])
          ],
          executive: [
            q("What do you say to the reporter today, when you know almost nothing?", "Vad säger ni till reportern i dag, när ni vet nästan ingenting?", ["comms", "ceo"]),
            q("Does the clock for a personal data breach start now?", "Börjar fristen för en personuppgiftsincident löpa nu?", ["dpo", "legal"]),
            q("Who speaks for the organisation?", "Vem talar för organisationen?", ["ceo", "comms"])
          ]
        },
        challenges: [ch("The story runs tomorrow, with or without your comment.", "Artikeln publiceras i morgon, med eller utan er kommentar.")],
        decision: dec("d1", "ceo", ["What do you tell the reporter today?", "Vad säger ni till reportern i dag?"], [
          ["Confirm you are investigating urgently, that you take it seriously, and when you will say more.", "Bekräfta att ni utreder skyndsamt, att ni tar det på allvar och när ni kommer att säga mer."],
          ["Decline to comment until the facts are clear.", "Avböj att kommentera tills fakta är klarlagda."],
          ["Deny that you have been hacked.", "Förneka att ni har blivit hackade."]
        ], {
          knowns: [["Sample rows match your export format.", "Exempelraderna stämmer med ert exportformat."]],
          uncertainties: [["How the data got out.", "Hur datan kom ut."], ["How many people are affected.", "Hur många personer som berörs."]],
          tradeoffs: {
            operational: ["Investigating and communicating compete for the same people.", "Utredning och kommunikation konkurrerar om samma personer."],
            security: ["Speculating publicly may mislead your own investigation.", "Att spekulera offentligt kan vilseleda den egna utredningen."],
            legal: ["What you say may later be held against you.", "Det ni säger kan senare användas mot er."],
            reputational: ["Silence or denial becomes the story.", "Tystnad eller förnekande blir själva nyheten."]
          },
          evaluation: [["Communicates honestly without speculating", "Kommunicerar ärligt utan att spekulera"], ["Starts the breach assessment at once", "Påbörjar bedömningen av incidenten direkt"]]
        }),
        facilitator: fac(
          ["This scenario starts outside the IT department. Let communications and legal lead.", "Det här scenariot börjar utanför IT-avdelningen. Låt kommunikation och juridik leda."],
          ["An honest holding statement, rapid verification and the breach assessment started.", "Ett ärligt kort besked, snabb verifiering och bedömningen av personuppgiftsincidenten påbörjad."],
          [["Ask: what will the headline be if you deny it and are wrong?", "Fråga: vad blir rubriken om ni förnekar och har fel?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 180,
        title: L(["Nobody broke in", "Ingen bröt sig in"]),
        twist: L(["Nobody hacked you. A storage container was open to the internet for {{num.monthsPublic}} months.", "Ingen har hackat er. En lagringsplats var öppen mot internet i {{num.monthsPublic}} månader."]),
        twistKind: "cause",
        assumptionChallenged: L(["We have been hacked.", "Vi har blivit hackade."]),
        reveals: ["hf-public"],
        narrative: L([
          "{{time.T+180|clock}}. The cloud team has spent three hours comparing the reporter's sample with everything you store, and they have found the source.\n\nIt was not a break-in. Nobody needed to break in. What they found is a mistake that has been sitting in plain sight, and the logs only go back a fraction of the time it has been there.",
          "Klockan {{time.T+180|clock}}. Molnteamet har ägnat tre timmar åt att jämföra reporterns urval med allt ni lagrar, och de har hittat källan.\n\nDet var inget intrång. Ingen behövde bryta sig in. Det de hittade är ett misstag som har legat öppet för alla, och loggarna täcker bara en bråkdel av tiden det har funnits där."
        ]),
        injects: [
          inj("i2-1", 180, "forensicFinding", "person.cloudLead", "critical", "confirmed", [
            "A {{env.storage}} created for a test {{num.monthsPublic}} months ago allows anonymous reads. A nightly export job has written production files there ever since. Access logging was only switched on four months ago.",
            "En {{env.storage}} som skapades för ett test för {{num.monthsPublic}} månader sedan tillåter anonym läsning. Ett nattligt exportjobb har skrivit produktionsfiler dit sedan dess. Åtkomstloggning slogs på först för fyra månader sedan."
          ], { headline: ["Public storage found", "Publik lagring hittad"], fallbackRole: "socLead", reveals: ["hf-public"], tests: ["lo2"] }),
          inj("i2-2", 200, "logExcerpt", "siem", "high", "confirmed", [
            "In the logged period: steady anonymous reads from a few addresses, then a sharp rise ten days ago from hundreds of addresses. Nothing is known about the earlier months.",
            "Under den loggade perioden: jämn anonym läsning från några få adresser, därefter en kraftig ökning för tio dagar sedan från hundratals adresser. Om de tidigare månaderna vet man ingenting."
          ], { tests: ["lo2"] })
        ],
        charts: [{
          id: "c2-reads", type: "bar",
          title: L(["Anonymous reads per month (logged period only)", "Anonyma läsningar per månad (endast loggad period)"]), unit: L(["requests", "anrop"]),
          caption: L(["Months before today. Earlier months were not logged.", "Månader före i dag. Tidigare månader loggades inte."]),
          data: (ctx) => {
            const months = [-4, -3, -2, -1, 0];
            return { categories: months, series: [{ id: "reads", label: L(["Anonymous reads", "Anonyma läsningar"]), values: months.map((m) => (m < 0 ? 20 + ctx.rng.int(0, 30) : 900 + ctx.rng.int(0, 400))) }] };
          }
        }],
        questions: {
          technical: [
            q("How do you close the exposure without destroying the evidence?", "Hur stänger ni exponeringen utan att förstöra spåren?", ["cloudLead", "socLead"]),
            q("What can you say about the months without logs?", "Vad kan ni säga om månaderna utan loggar?", ["socLead", "ciso"]),
            q("Does what you found support what was said to the reporter this morning?", "Stöder det ni har hittat det som sades till reportern i morse?", ["socLead", "cloudLead"], "d1")
          ],
          executive: [
            q("Is a misconfiguration better or worse news than a hack, publicly?", "Är en felkonfiguration bättre eller sämre nyheter än ett intrång, offentligt?", ["comms", "ceo"]),
            q("Do you correct what you told the reporter earlier?", "Rättar ni det ni sa till reportern tidigare?", ["comms", "ceo"], "d1"),
            q("Who is accountable for the test configuration?", "Vem är ansvarig för testkonfigurationen?", ["ciso", "ceo"])
          ]
        },
        challenges: [ch("Without logs for most of the period, you can't prove who downloaded what.", "Utan loggar för större delen av perioden kan ni inte bevisa vem som laddade ner vad.")],
        decision: dec("d2", "ciso", ["How do you proceed with the storage?", "Hur går ni vidare med lagringen?"], [
          ["Snapshot it for evidence, then remove public access and scan every other container.", "Ta en ögonblicksbild som bevis, ta sedan bort den publika åtkomsten och sök igenom alla andra lagringsplatser."],
          ["Delete the container immediately.", "Radera lagringen omedelbart."],
          ["Leave it until the investigation is complete.", "Låt den vara tills utredningen är klar."]
        ], {
          knowns: [["The data is still publicly readable right now.", "Datan är fortfarande läsbar för alla just nu."]],
          uncertainties: [["Who downloaded it before logging began.", "Vem som laddade ner den innan loggningen började."]],
          tradeoffs: {
            operational: ["The export job will fail when access changes.", "Exportjobbet kommer att fallera när åtkomsten ändras."],
            security: ["Every minute public adds downloads.", "Varje minut som datan är publik ger fler nedladdningar."],
            legal: ["Deleting may destroy evidence regulators expect.", "Att radera kan förstöra spår som tillsynsmyndigheter förväntar sig."],
            reputational: ["“Still open after the call” would be the worst headline.", "”Fortfarande öppen efter samtalet” vore den värsta rubriken."]
          },
          evaluation: [["Closes exposure fast while preserving evidence", "Stänger exponeringen snabbt och säkrar samtidigt spåren"]]
        }),
        facilitator: fac(
          ["A misconfiguration is still a breach. Watch whether relief replaces urgency.", "En felkonfiguration är fortfarande en incident. Se om lättnad ersätter brådska."],
          ["Evidence preserved, exposure closed within minutes and a sweep of all storage started.", "Spår säkrade, exponeringen stängd inom några minuter och en genomgång av all lagring påbörjad."],
          [["Ask: if logs are missing, what is the honest statement about who saw the data?", "Fråga: om loggarna saknas, vad är det ärliga beskedet om vem som har sett datan?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 360,
        title: L(["More than contact details", "Mer än kontaktuppgifter"]),
        twist: L(["The files contain far more than names and addresses: identity numbers and health information.", "Filerna innehåller betydligt mer än namn och adresser: personnummer och hälsouppgifter."]),
        twistKind: "scope",
        assumptionChallenged: L(["Only contact details were exposed.", "Bara kontaktuppgifter har exponerats."]),
        reveals: ["hf-categories"],
        narrative: L([
          "{{time.T+360|clock}}. The data protection officer has had the exposed files reviewed, column by column.\n\nUntil now everyone has talked about “contact details”. The review shows that the export job copied every field from the source system, including some that nobody thought of as part of the export.",
          "Klockan {{time.T+360|clock}}. Dataskyddsombudet har låtit granska de exponerade filerna, kolumn för kolumn.\n\nHittills har alla talat om ”kontaktuppgifter”. Granskningen visar att exportjobbet kopierade varje fält från källsystemet, även några som ingen tänkte på som en del av exporten."
        ]),
        injects: [
          inj("i3-1", 360, "forensicFinding", "person.dpo", "critical", "confirmed", [
            "Besides contact details, {{num.sensitive}} records include personal identity numbers, and a free-text notes field contains information about illness, disability and support needs.",
            "Utöver kontaktuppgifter innehåller {{num.sensitive}} poster personnummer, och ett fritextfält med anteckningar innehåller uppgifter om sjukdom, funktionsnedsättning och stödbehov."
          ], { headline: ["Data categories", "Kategorier av uppgifter"], fallbackRole: "legal", reveals: ["hf-categories"], tests: ["lo3", "lo4"] })
        ],
        charts: [{
          id: "c3-categories", type: "donut",
          title: L(["What the exposed files contain", "Vad de exponerade filerna innehåller"]),
          data: (ctx) => {
            const total = ctx.vars.records;
            const sensitive = ctx.vars.sensitive;
            return { segments: [
              { id: "contact", label: L(["Contact details only", "Endast kontaktuppgifter"]), value: Math.max(0, total - sensitive) },
              { id: "id", label: L(["With identity numbers and health notes", "Med personnummer och hälsoanteckningar"]), value: sensitive }
            ] };
          }
        }],
        questions: {
          technical: [
            q("How do you identify exactly which people have sensitive data in the files?", "Hur tar ni reda på exakt vilka personer som har känsliga uppgifter i filerna?", ["serviceOwner", "socLead"]),
            q("Why was a free-text field with health information exported at all?", "Varför exporterades ett fritextfält med hälsouppgifter över huvud taget?", ["serviceOwner", "cloudLead"]),
            q("Did closing the storage the way you did preserve what you now need?", "Bevarade sättet ni stängde lagringen på det ni nu behöver?", ["cloudLead"], "d2")
          ],
          executive: [
            q("Do the affected people need to be told directly, and how?", "Måste de berörda informeras direkt, och hur?", ["dpo", "comms"]),
            q("What do you now tell the reporter?", "Vad säger ni nu till reportern?", ["comms", "ceo"]),
            q("Does this change your public posture since this morning?", "Ändrar det här er offentliga hållning sedan i morse?", ["ceo"], "d1")
          ]
        },
        challenges: [ch("Some affected people are vulnerable; how they hear about this matters.", "En del av de berörda är sårbara; hur de får veta det spelar roll.")],
        decision: dec("d3", "legal", ["How do you notify?", "Hur anmäler och informerar ni?"], [
          ["Notify {{reg.dpaShort}} today and contact everyone with sensitive data directly and personally.", "Anmäl till {{reg.dpaShort}} i dag och kontakta alla med känsliga uppgifter direkt och personligt."],
          ["Notify {{reg.dpaShort}} today; inform people through a public statement.", "Anmäl till {{reg.dpaShort}} i dag; informera de berörda genom ett offentligt uttalande."],
          ["Wait until the full analysis is done before notifying anyone.", "Vänta tills hela analysen är klar innan ni anmäler eller informerar någon."]
        ], {
          knowns: [["Health information and identity numbers were exposed.", "Hälsouppgifter och personnummer har exponerats."]],
          uncertainties: [["Who has downloaded the files.", "Vem som har laddat ner filerna."]],
          tradeoffs: {
            operational: ["Personal contact with thousands of people is heavy work.", "Personlig kontakt med tusentals människor är ett tungt arbete."],
            security: ["People can protect themselves only if they know.", "Människor kan bara skydda sig om de vet."],
            legal: ["High-risk breaches require informing the people affected.", "Incidenter med hög risk kräver att de berörda informeras."],
            reputational: ["Hearing about your own health data from a newspaper is unforgivable.", "Att få höra om sina egna hälsouppgifter i en tidning är oförlåtligt."]
          },
          evaluation: [["Informs affected people before the press does", "Informerar de berörda innan pressen gör det"], ["Recognises special-category data", "Känner igen känsliga personuppgifter"]],
          minutes: 10
        }),
        facilitator: fac(
          ["The people in the file are the centre now. Watch the language the group uses about them.", "Människorna i filen är nu i centrum. Lyssna på hur gruppen talar om dem."],
          ["Same-day notification and direct, careful contact with people whose sensitive data was exposed.", "Anmälan samma dag och direkt, varsam kontakt med de personer vars känsliga uppgifter exponerats."],
          [["Ask: how would you want to hear this if it were your data?", "Fråga: hur skulle ni vilja få veta det här om det var era uppgifter?"]]
        )
      },
      {
        id: "p4",
        priority: 1,
        clock: 480,
        title: L(["You were told before", "Ni fick veta det tidigare"]),
        twist: L(["Someone reported the open storage to your support team {{num.daysSinceTicket}} days ago. The clock started then.", "Någon rapporterade den öppna lagringen till er support för {{num.daysSinceTicket}} dagar sedan. Fristen började löpa då."]),
        twistKind: "impact",
        assumptionChallenged: L(["We became aware today.", "Vi fick kännedom i dag."]),
        reveals: ["hf-ticket"],
        narrative: L([
          "{{time.T+480|clock}}. While tracing the history of the export job, the team searches the support system for anything that mentions the storage address.\n\nThey find a closed support ticket. Reading it changes the question of when the organisation “became aware”, and with it every deadline the room has been working towards.",
          "Klockan {{time.T+480|clock}}. När teamet spårar exportjobbets historik söker de i supportsystemet efter allt som nämner lagringsadressen.\n\nDe hittar ett stängt supportärende. Att läsa det ändrar frågan om när organisationen ”fick kännedom”, och därmed varje tidsfrist som rummet har arbetat mot."
        ]),
        injects: [
          inj("i4-1", 480, "ticket", "serviceDesk", "high", "confirmed", [
            "{{num.daysSinceTicket}} days ago a security researcher wrote: “Your storage at this address is public and contains personal data. Please fix.” The ticket was closed as spam the same day.",
            "För {{num.daysSinceTicket}} dagar sedan skrev en säkerhetsforskare: ”Er lagring på den här adressen är publik och innehåller personuppgifter. Var vänlig åtgärda.” Ärendet stängdes som skräppost samma dag."
          ], { headline: ["Closed ticket", "Stängt ärende"], reveals: ["hf-ticket"], tests: ["lo3"] }),
          inj("i4-2", 500, "executiveMessage", "person.legal", "high", "confirmed", [
            "“Arguably the organisation became aware when that ticket arrived. If so, our 72 hours expired long ago. We must say so honestly in the notification.”",
            "”Man kan hävda att organisationen fick kännedom när det ärendet kom in. I så fall gick våra 72 timmar ut för länge sedan. Det måste vi säga ärligt i anmälan.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How did a report like this get closed as spam?", "Hur kunde en sådan rapport stängas som skräppost?", ["serviceOwner", "socLead"]),
            q("How should security reports from outsiders reach the right people?", "Hur ska säkerhetsrapporter utifrån nå rätt personer?", ["ciso", "socLead"]),
            q("Does this ticket change what the logs tell you about downloads?", "Ändrar det här ärendet vad loggarna säger om nedladdningar?", ["socLead"], "d2")
          ],
          executive: [
            q("How do you explain the late notification to {{reg.dpaShort}}?", "Hur förklarar ni den sena anmälan för {{reg.dpaShort}}?", ["legal", "dpo"]),
            q("Do you disclose the ignored ticket publicly?", "Berättar ni offentligt om det ignorerade ärendet?", ["comms", "ceo"]),
            q("Does the notification plan you chose still hold?", "Står sig den plan för anmälan som ni valde?", ["dpo"], "d3")
          ]
        },
        challenges: [ch("Admitting the ignored warning is painful; hiding it is worse if it comes out.", "Att erkänna den ignorerade varningen är plågsamt; att dölja den är värre om det kommer fram.")],
        decision: dec("d4", "ceo", ["How do you handle the ignored warning?", "Hur hanterar ni den ignorerade varningen?"], [
          ["Disclose it in the notification and publicly, and thank the researcher.", "Redovisa den i anmälan och offentligt, och tacka säkerhetsforskaren."],
          ["Disclose it to {{reg.dpaShort}} only.", "Redovisa den endast för {{reg.dpaShort}}."],
          ["Leave it out; awareness began today.", "Utelämna den; kännedom uppstod i dag."]
        ], {
          knowns: [["A warning arrived {{num.daysSinceTicket}} days ago and was ignored.", "En varning kom in för {{num.daysSinceTicket}} dagar sedan och ignorerades."]],
          uncertainties: [["Whether the researcher will speak to the press.", "Om säkerhetsforskaren kommer att prata med pressen."]],
          tradeoffs: {
            operational: ["Openness invites more questions.", "Öppenhet bjuder in till fler frågor."],
            security: ["A working reporting channel is a security control.", "En fungerande kanal för rapportering är en säkerhetsåtgärd."],
            legal: ["Misstating awareness is a serious additional breach.", "Att ange fel tidpunkt för kännedom är en allvarlig överträdelse i sig."],
            reputational: ["The researcher may already have told the journalist.", "Säkerhetsforskaren kan redan ha berättat för journalisten."]
          },
          evaluation: [["Reports the true awareness date", "Anger den verkliga tidpunkten för kännedom"]]
        }),
        facilitator: fac(
          ["An integrity test. Make the temptation real.", "Ett prov på integritet. Gör frestelsen verklig."],
          ["The true awareness date in the notification, and a fixed channel for security reports.", "Den verkliga tidpunkten för kännedom i anmälan, och en åtgärdad kanal för säkerhetsrapporter."],
          [["Ask: what if the journalist already has the ticket?", "Fråga: tänk om journalisten redan har ärendet?"]]
        )
      },
      {
        id: "p5",
        priority: 2,
        clock: 1440,
        title: L(["Copies everywhere", "Kopior överallt"]),
        twist: L(["The data is now on a forum and has been downloaded at least {{num.downloads}} times. Closing the container changed nothing for those copies.", "Datan finns nu på ett forum och har laddats ner minst {{num.downloads}} gånger. Att stänga lagringen ändrade ingenting för de kopiorna."]),
        twistKind: "scope",
        assumptionChallenged: L(["Closing the storage contained the leak.", "När lagringen stängdes begränsades läckan."]),
        reveals: ["hf-copies"],
        narrative: L([
          "The next morning. The article is out, with a headline about health details left open online, and it is the most-read story on the news site.\n\nThe storage was closed yesterday. Then a threat-intelligence contact sends a screenshot from a forum, and it becomes clear that closing the storage was the end of nothing.",
          "Nästa morgon. Artikeln är publicerad, med en rubrik om hälsouppgifter som legat öppet på nätet, och den är den mest lästa på nyhetssajten.\n\nLagringen stängdes i går. Sedan skickar en kontakt inom hotunderrättelser en skärmbild från ett forum, och det blir tydligt att stängningen inte avslutade någonting."
        ]),
        injects: [
          inj("i5-1", 1440, "threatIntel", "threatIntel", "high", "confirmed", [
            "The full file is posted on a data-leak forum, with comments pointing out the identity numbers. The post has at least {{num.downloads}} downloads.",
            "Hela filen är publicerad på ett forum för dataläckor, med kommentarer som pekar ut personnumren. Inlägget har minst {{num.downloads}} nedladdningar."
          ], { reveals: ["hf-copies"], statedReliability: ["Confirmed", "Bekräftat"], tests: ["lo4"] }),
          inj("i5-2", 1480, "newsHeadline", "media", "high", "confirmed", [
            "Health details of thousands left open online for over a year, despite warning",
            "Hälsouppgifter om tusentals låg öppet på nätet i över ett år – trots varning"
          ], { headline: ["Health details of thousands left open online", "Hälsouppgifter om tusentals låg öppet på nätet"], pressure: "media", optional: true, tests: ["lo1"] })
        ],
        charts: [{
          id: "c5-downloads", type: "line",
          title: L(["Downloads of the forum post", "Nedladdningar av foruminlägget"]), unit: L(["downloads", "nedladdningar"]),
          data: (ctx) => {
            const points = [];
            for (let h = 0; h <= 24; h += 2) points.push([h, Math.round(ctx.vars.downloads * (1 - Math.exp(-h / 6)))]);
            return { xUnit: "hours", series: [{ id: "dl", label: L(["Cumulative downloads", "Ackumulerade nedladdningar"]), points }] };
          }
        }],
        questions: {
          technical: [
            q("Can you get the post removed, and does it matter?", "Kan ni få inlägget borttaget, och spelar det någon roll?", ["socLead", "ciso"]),
            q("What misuse should you watch for now — fraud, phishing, identity theft?", "Vilket missbruk bör ni nu bevaka – bedrägerier, nätfiske, identitetsstöld?", ["socLead"]),
            q("Was evidence preserved well enough to answer these questions?", "Säkrades spåren tillräckligt väl för att besvara de här frågorna?", ["socLead"], "d2")
          ],
          executive: [
            q("What practical support do you offer affected people?", "Vilket praktiskt stöd erbjuder ni de berörda?", ["ceo", "dpo"]),
            q("How do you respond to the article?", "Hur bemöter ni artikeln?", ["comms", "ceo"]),
            q("Did your earlier notification choices reach people before this did?", "Nådde era tidigare val kring information de berörda innan det här gjorde det?", ["dpo"], "d3")
          ]
        },
        challenges: [ch("The data cannot be called back. Only the harm can be reduced.", "Datan går inte att kalla tillbaka. Bara skadan kan minskas.")],
        decision: dec("d5", "ceo", ["What do you offer the people affected?", "Vad erbjuder ni de berörda?"], [
          ["Direct contact, a support line, guidance on identity protection and help with blocking credit applications.", "Direkt kontakt, en stödlinje, vägledning om identitetsskydd och hjälp med att spärra kreditansökningar."],
          ["A web page with guidance and an email address for questions.", "En webbsida med vägledning och en e-postadress för frågor."],
          ["Refer people to the authorities.", "Hänvisa de berörda till myndigheterna."]
        ], {
          knowns: [["The data is public and widely copied.", "Datan är publik och kopierad i stor omfattning."]],
          uncertainties: [["How it will be misused.", "Hur den kommer att missbrukas."]],
          tradeoffs: {
            operational: ["A support line needs trained staff quickly.", "En stödlinje kräver utbildad personal snabbt."],
            security: ["Guidance reduces fraud against the people affected.", "Vägledning minskar bedrägerier mot de berörda."],
            legal: ["Support does not remove liability, but it is expected.", "Stöd tar inte bort ansvaret, men det förväntas."],
            reputational: ["How you care for victims defines the story's second act.", "Hur ni tar hand om de drabbade avgör nyhetens andra akt."]
          },
          evaluation: [["Offers concrete help, not only information", "Erbjuder konkret hjälp, inte bara information"]]
        }),
        facilitator: fac(
          ["Containment is over; harm reduction is what remains.", "Begränsningen är över; det som återstår är att minska skadan."],
          ["Direct, practical support for the people affected and monitoring for misuse.", "Direkt och praktiskt stöd för de berörda och bevakning av missbruk."],
          [["Ask: what would genuinely help someone whose identity number is now public?", "Fråga: vad skulle verkligen hjälpa någon vars personnummer nu är publikt?"]]
        )
      },
      {
        id: "p6",
        priority: 3,
        clock: 4320,
        title: L(["The regulator writes", "Tillsynsmyndigheten skriver"]),
        twist: L(["{{reg.dpaShort}} opens a supervisory case and asks how cloud storage is governed across the organisation.", "{{reg.dpaShort}} inleder ett tillsynsärende och frågar hur molnlagring styrs i hela organisationen."]),
        twistKind: "authority",
        assumptionChallenged: L(["Once notified, the regulator will let us handle it.", "När anmälan är gjord låter tillsynsmyndigheten oss sköta det."]),
        narrative: L([
          "Three days later. A letter arrives from the data protection authority, with a list of detailed questions and a two-week deadline.\n\nThe authority is no longer asking only about one storage container. It wants to understand how the whole organisation manages cloud storage, test data and warnings from outside.",
          "Tre dagar senare. Ett brev kommer från dataskyddsmyndigheten, med en lista detaljerade frågor och en tidsfrist på två veckor.\n\nMyndigheten frågar inte längre bara om en lagringsplats. Den vill förstå hur hela organisationen hanterar molnlagring, testdata och varningar utifrån."
        ]),
        injects: [
          inj("i6-1", 4320, "regulatorLetter", "regulator", "high", "confirmed", [
            "{{reg.dpa|cap}} asks for: how storage access is reviewed, why production data was exported to a test location, why the warning was not acted on, and what technical measures now prevent recurrence. Reply within three weeks.",
            "{{reg.dpa|cap}} begär: hur åtkomsten till lagring granskas, varför produktionsdata exporterades till en testplats, varför varningen inte åtgärdades och vilka tekniska åtgärder som nu förhindrar en upprepning. Svar inom tre veckor."
          ], { pressure: "regulator", substitute: { source: "management", content: ["The board asks for an independent review of how cloud storage and data exports are governed.", "Styrelsen begär en oberoende granskning av hur molnlagring och dataexporter styrs."] }, tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What controls would detect a public storage location within hours?", "Vilka kontroller skulle upptäcka en publik lagringsplats inom några timmar?", ["cloudLead", "ciso"]),
            q("How do you stop production data from reaching test environments?", "Hur stoppar ni att produktionsdata hamnar i testmiljöer?", ["cloudLead", "serviceOwner"]),
            q("Looking back, how should you have closed the storage?", "Så här i efterhand – hur borde ni ha stängt lagringen?", ["cloudLead"], "d2")
          ],
          executive: [
            q("Who owns the answer to the regulator, and how candid is it?", "Vem äger svaret till tillsynsmyndigheten, och hur öppet är det?", ["legal", "dpo"]),
            q("What does good cloud governance look like for you?", "Hur ser god styrning av molntjänster ut för er?", ["ciso", "ceo"]),
            q("Do your choices on the ignored warning still read well?", "Håller era val kring den ignorerade varningen fortfarande?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("A full review will expose other weaknesses you would rather not show.", "En fullständig granskning kommer att avslöja andra brister som ni hellre inte visar.")],
        decision: dec("d6", "ceo", ["How do you answer the regulator?", "Hur svarar ni tillsynsmyndigheten?"], [
          ["Candidly, with an independent review and a funded improvement plan.", "Öppet, med en oberoende granskning och en finansierad förbättringsplan."],
          ["Answer each question narrowly and accurately.", "Besvara varje fråga snävt och korrekt."],
          ["Let external counsel manage all contact.", "Låt externa jurister sköta all kontakt."]
        ], {
          knowns: [["The regulator has opened a case.", "Tillsynsmyndigheten har inlett ett ärende."]],
          uncertainties: [["What sanctions may follow.", "Vilka sanktioner som kan följa."]],
          tradeoffs: {
            operational: ["An independent review takes time and money.", "En oberoende granskning tar tid och kostar pengar."],
            security: ["Real improvement needs honest findings.", "Verklig förbättring kräver ärliga fynd."],
            legal: ["Cooperation is usually taken into account.", "Samarbete brukar beaktas."],
            reputational: ["The regulator's decision will be public.", "Tillsynsmyndighetens beslut blir offentligt."]
          },
          evaluation: [["Turns the case into lasting governance", "Omsätter ärendet i bestående styrning"]]
        }),
        facilitator: fac(
          ["Close on governance and honesty.", "Avsluta med styrning och ärlighet."],
          ["A candid answer, an independent review and controls for storage exposure and data exports.", "Ett öppet svar, en oberoende granskning och kontroller för exponerad lagring och dataexporter."],
          [["Ask: if the regulator visits next month, what will they find?", "Fråga: om tillsynsmyndigheten gör ett besök nästa månad, vad hittar de då?"]]
        )
      }
    ],

    resolution: {
      type: "open",
      text: L([
        "The exposure is closed, but the data cannot be recalled. Support for affected people continues, and the regulator's review is still open.",
        "Exponeringen är stängd, men datan går inte att kalla tillbaka. Stödet till de berörda fortsätter, och tillsynsmyndighetens granskning pågår fortfarande."
      ])
    },

    debrief: {
      keyLessons: [
        L(["A misconfiguration is a breach; “nobody hacked us” is not reassurance.", "En felkonfiguration är en incident; ”ingen har hackat oss” är ingen tröst."]),
        L(["Awareness can start long before management knows — every reporting channel matters.", "Kännedom kan uppstå långt innan ledningen vet – varje kanal för rapportering spelar roll."]),
        L(["Communicate honestly early; denial becomes the story.", "Kommunicera ärligt och tidigt; förnekande blir själva nyheten."]),
        L(["Production data does not belong in test locations.", "Produktionsdata hör inte hemma i testmiljöer."])
      ],
      assumptionsVsReality: [
        avr(["We were hacked.", "Vi blev hackade."], ["Storage was public for months.", "Lagringen var publik i månader."], "p2"),
        avr(["Only contact details.", "Bara kontaktuppgifter."], ["Identity numbers and health notes.", "Personnummer och hälsoanteckningar."], "p3"),
        avr(["We became aware today.", "Vi fick kännedom i dag."], ["A warning was ignored weeks ago.", "En varning ignorerades för flera veckor sedan."], "p4"),
        avr(["Closing the storage contained it.", "Att stänga lagringen begränsade det."], ["Copies were already circulating.", "Kopior spreds redan."], "p5")
      ],
      strengthsToLookFor: [
        L(["An honest holding statement", "Ett ärligt kort besked"]),
        L(["Evidence preserved before closing", "Spår säkrade före stängning"]),
        L(["Personal contact with vulnerable people", "Personlig kontakt med sårbara personer"])
      ],
      commonGaps: [
        L(["Denying before knowing", "Att förneka innan man vet"]),
        L(["Counting the deadline from today", "Att räkna fristen från i dag"]),
        L(["Information instead of practical help", "Information i stället för praktisk hjälp"])
      ],
      suggestedActions: [
        act(["Continuously scan for publicly accessible storage and alert within hours.", "Sök kontinuerligt efter publikt åtkomlig lagring och larma inom några timmar."], "cloudLead", "high"),
        act(["Ban production data in test locations; use synthetic data.", "Förbjud produktionsdata i testmiljöer; använd syntetiska data."], "serviceOwner", "high"),
        act(["Publish a security contact and route reports to the security team.", "Publicera en säkerhetskontakt och styr rapporter till säkerhetsteamet."], "ciso", "high"),
        act(["Enable access logging on all storage holding personal data.", "Aktivera åtkomstloggning på all lagring som innehåller personuppgifter."], "cloudLead", "medium"),
        act(["Prepare holding statements and notification templates in advance.", "Förbered korta besked och mallar för anmälan i förväg."], "comms", "medium")
      ]
    }
  });
})();
