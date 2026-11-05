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
  const { L, q, ch, inj, dec, fac, act, avr, pb, ir, io } = BK.scenarios.h;

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
          ["Tell the reporter you have seen no sign of a hack, which is true, and say nothing more today.", "Säg till reportern att ni inte har sett några tecken på intrång, vilket stämmer, och säg inget mer i dag."]
        ], {
          knowns: [["Sample rows match your export format.", "Exempelraderna stämmer med ert exportformat."]],
          uncertainties: [["How the data got out.", "Hur datan kom ut."], ["How many people are affected.", "Hur många personer som berörs."]],
          tradeoffs: {
            operational: ["Investigating and communicating compete for the same people.", "Utredning och kommunikation konkurrerar om samma personer."],
            security: ["Speculating publicly may mislead your own investigation.", "Att spekulera offentligt kan vilseleda den egna utredningen."],
            legal: ["What you say may later be held against you.", "Det ni säger kan senare användas mot er."],
            reputational: ["Silence or denial becomes the story.", "Tystnad eller förnekande blir själva nyheten."]
          },
          evaluation: [["Communicates honestly without speculating", "Kommunicerar ärligt utan att spekulera"], ["Starts the breach assessment at once", "Påbörjar bedömningen av incidenten direkt"]],
          interrupts: [
            ir("i1", { chosen: "C" }, ["“No sign of a hack”", "”Inga tecken på intrång”"], [
              io(["The quote lands", "Citatet tas emot"], ["The reporter thanks you and says the quote will be used. The service owner is pleased: “See? Short and true.”", "Reportern tackar och säger att citatet kommer att användas. Systemägaren är nöjd: ”Där ser ni. Kort och sant.”"], ["The reporter has your “no sign of a hack” quote.", "Reportern har ert citat om att det inte finns några tecken på intrång."]),
              io(["The callers disagree", "De uppringda säger emot"], ["The reporter calls back: several people in the file say their only connection is to {{org.name}}, never to any partner. They ask whether you still stand by your statement.", "Reportern ringer tillbaka: flera personer i filen säger att deras enda koppling är till {{org.name}}, aldrig till någon partner. Hen frågar om ni fortfarande står fast vid ert uttalande."], ["People in the file say their only link is to {{org.name}}.", "Personer i filen säger att deras enda koppling är till {{org.name}}."], { reopen: true, meters: { media: 1 } }),
              io(["“So it's not yours?”", "”Så den är inte er?”"], ["The reporter asks a follow-up: “So you are saying the data is not yours?” Comms answered that you have nothing more to say today, and nobody is sure what that will look like in print.", "Reportern ställer en följdfråga: ”Så ni säger att uppgifterna inte är era?” Kommunikation svarade att ni inte har något mer att säga i dag, och ingen vet hur det kommer att se ut i tryck."], ["The reporter asked if you deny the data is yours; you did not answer.", "Reportern frågade om ni förnekar att uppgifterna är era; ni svarade inte."])
            ]),
            ir("i2", { notChosen: "C" }, ["No denial", "Inget förnekande"], [
              io(["Quoted in full", "Citerat i sin helhet"], ["The reporter says your statement will be quoted in full and that it reads as a company taking it seriously. The room breathes out for a moment.", "Reportern säger att ert uttalande kommer att citeras i sin helhet och att det låter som ett företag som tar det på allvar. Rummet andas ut en stund."], ["The reporter will quote your statement in full.", "Reportern kommer att citera ert uttalande i sin helhet."]),
              io(["A different story", "En annan version"], ["The service owner had already told a partner it was “probably an old partner list”. The partner repeated it to the reporter, who now asks which version is true.", "Systemägaren hade redan sagt till en partner att det ”troligen är en gammal partnerlista”. Partnern upprepade det för reportern, som nu frågar vilken version som stämmer."], ["A partner has repeated the “old partner list” claim to the reporter.", "En partner har upprepat påståendet om en ”gammal partnerlista” för reportern."], { reopen: true, meters: { media: 1 } }),
              io(["Customer service calls", "Samtal till kundtjänst"], ["People the reporter phoned start calling your customer service. The staff there have been told nothing and are improvising answers.", "Personer som reportern har ringt börjar ringa er kundtjänst. Personalen där har inte fått veta någonting och improviserar sina svar."], ["Customer service is getting calls from people in the file, with no script.", "Kundtjänst får samtal från personer i filen och har inget manus."])
            ])
          ],
          pushback: {
            A: [
              pb(["A promise with a time", "Ett löfte med klockslag"], ["You told the reporter when you would say more. The cloud team now says confirming the source may take longer than that. Do you keep a promise you may not be able to fill, or soften it and look evasive?", "Ni sa till reportern när ni skulle säga mer. Molnteamet säger nu att det kan ta längre tid än så att bekräfta källan. Håller ni fast vid ett löfte som ni kanske inte kan infria, eller mjukar ni upp det och framstår som undanglidande?"]),
              pb(["“You made it a story”", "”Ni gjorde det till en nyhet”"], ["The service owner, sure you were never hacked, is furious: by saying you are investigating, you told a reporter there is something to find, over what may be a partner's old list. Did you just turn a non-story into a story?", "Systemägaren, säker på att ni aldrig har hackats, är rasande: genom att säga att ni utreder har ni talat om för en reporter att det finns något att hitta, kanske på grund av en partners gamla lista. Har ni just gjort en icke-nyhet till en nyhet?"]),
              pb(["The clock you just started", "Fristen ni just startade"], ["Legal points out that saying you take it seriously and are investigating shows you are aware of a possible breach. The notification clock may be running from this call. Are you ready to notify within 72 hours of today?", "Juristen påpekar att ni, genom att säga att ni tar det på allvar och utreder, visar att ni känner till en möjlig incident. Fristen för anmälan kan löpa från det här samtalet. Är ni beredda att anmäla inom 72 timmar från i dag?"])
            ],
            B: [
              pb(["“Declined to comment”", "”Avböjer att kommentera”"], ["The reporter says the article will read “the company declined to comment”, next to quotes from people they phoned. How will the people in that file read your silence?", "Reportern säger att artikeln kommer att skriva ”företaget avböjer att kommentera”, bredvid citat från personer som hen har ringt. Hur kommer människorna i filen att uppfatta er tystnad?"]),
              pb(["A caller at customer service", "Ett samtal till kundtjänst"], ["One of the people the reporter phoned calls your customer service asking whether their data has leaked. Your staff have been told nothing. What do they say, and is it the same thing you told the reporter?", "En av de personer som reportern ringde hör av sig till er kundtjänst och frågar om deras uppgifter har läckt. Er personal har inte fått veta någonting. Vad säger de, och är det samma sak som ni sa till reportern?"]),
              pb(["Clear after tomorrow", "Klart först efter i morgon"], ["The cloud team says the facts will not be clear before the article runs. “Until the facts are clear” means saying nothing until after publication. Is silence still the plan when the story is already out?", "Molnteamet säger att fakta inte kommer att vara klarlagda innan artikeln publiceras. ”Tills fakta är klarlagda” betyder att ni inte säger något förrän efter publiceringen. Är tystnad fortfarande planen när nyheten redan är ute?"])
            ],
            C: [
              pb(["How the quote will age", "Hur citatet åldras"], ["The sample rows match your own export format. Whatever the cause, “no sign of a hack” will be read as “not us”. If the file turns out to be yours, how will that quote look next week?", "Exempelraderna stämmer med ert eget exportformat. Oavsett orsak kommer ”inga tecken på intrång” att läsas som ”inte vi”. Om filen visar sig komma från er, hur ser det citatet ut nästa vecka?"]),
              pb(["Who speaks for them?", "Vem talar för dem?"], ["The DPO objects: a statement about your systems says nothing to the people whose names and addresses a reporter is holding. Who in this room is speaking for them today?", "Dataskyddsombudet invänder: ett uttalande om era system säger ingenting till de människor vars namn och adresser en reporter har i handen. Vem i rummet talar för dem i dag?"]),
              pb(["Not the question asked", "Inte frågan som ställdes"], ["The reporter writes back: “I didn't only ask whether you were hacked. I asked whether this is your data.” Do you answer that question, or repeat the same line?", "Reportern skriver tillbaka: ”Jag frågade inte bara om ni har blivit hackade. Jag frågade om det här är era uppgifter.” Svarar ni på den frågan, eller upprepar ni samma linje?"])
            ]
          }
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
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because you confirmed an urgent investigation, the reporter published tonight under the headline: company confirms data incident.", sv: "Eftersom ni bekräftade en brådskande utredning publicerade reportern i kväll under rubriken: företaget bekräftar dataincident." } }
        ],
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
          evaluation: [["Closes exposure fast while preserving evidence", "Stänger exponeringen snabbt och säkrar samtidigt spåren"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Snapshot, then close", "Ögonblicksbild, sedan stängning"], [
              io(["Evidence secured", "Spåren säkrade"], ["The snapshot is complete and public access is removed. Legal says this is exactly what the regulator will want to see, and the cloud team is visibly proud.", "Ögonblicksbilden är klar och den publika åtkomsten borttagen. Juristen säger att det är precis vad tillsynsmyndigheten vill se, och molnteamet är synbart stolt."], ["A complete snapshot of the container is secured as evidence.", "En fullständig ögonblicksbild av lagringen är säkrad som bevis."]),
              io(["The export job breaks", "Exportjobbet går sönder"], ["With public access gone, the nightly export fails, and a report a business unit depends on is missing. The service owner asks to open access again “just for tonight”.", "När den publika åtkomsten är borta fallerar den nattliga exporten, och en rapport som en verksamhet är beroende av saknas. Systemägaren vill öppna åtkomsten igen ”bara i natt”."], ["The nightly export failed and a business report is missing.", "Den nattliga exporten fallerade och en verksamhetsrapport saknas."], { reopen: true }),
              io(["A second public container", "En andra publik lagring"], ["The sweep finds another container open to the internet. At first glance it holds only test data, but nobody has looked closely yet.", "Genomgången hittar ytterligare en lagringsplats som är öppen mot internet. Vid en första anblick innehåller den bara testdata, men ingen har tittat noga ännu."], ["The sweep found a second public container that seems to hold test data.", "Genomgången hittade en andra publik lagring som verkar innehålla testdata."])
            ]),
            ir("i2", { notChosen: "A" }, ["No snapshot, no sweep", "Ingen ögonblicksbild, ingen genomgång"], [
              io(["Are there others?", "Finns det fler?"], ["The DPO asks the obvious question: if one test container was public, how many others are? Nobody has checked, and nobody owns the question.", "Dataskyddsombudet ställer den självklara frågan: om en testlagring var publik, hur många fler är det? Ingen har kontrollerat, och ingen äger frågan."], ["Nobody has yet checked whether other containers are public.", "Ingen har ännu kontrollerat om andra lagringsplatser är publika."], { reopen: true }),
              io(["What can you prove?", "Vad kan ni bevisa?"], ["Legal asks what you will be able to show the regulator about exactly what the container held. The cloud team's answer is uncertain.", "Juristen frågar vad ni kommer att kunna visa tillsynsmyndigheten om exakt vad lagringen innehöll. Molnteamets svar är osäkert."], ["Legal is unsure you can show exactly what was exposed.", "Juristen är osäker på om ni kan visa exakt vad som exponerades."]),
              io(["“Is it still open?”", "”Är den fortfarande öppen?”"], ["The reporter calls again and asks one question: can the data still be reached today? Comms does not know what to answer.", "Reportern ringer igen och ställer en enda fråga: går uppgifterna fortfarande att nå i dag? Kommunikation vet inte vad de ska svara."], ["The reporter has asked whether the data is still accessible.", "Reportern har frågat om uppgifterna fortfarande går att nå."], { meters: { media: 1 } })
            ])
          ],
          pushback: {
            A: [
              pb(["Another full copy", "Ytterligare en fullständig kopia"], ["Your snapshot is a second complete copy of the exposed personal data. The DPO asks where it is kept, who can reach it and for how long. Have you just created another thing that must be protected?", "Er ögonblicksbild är en andra fullständig kopia av de exponerade personuppgifterna. Dataskyddsombudet frågar var den förvaras, vem som kommer åt den och hur länge. Har ni just skapat ännu något som måste skyddas?"]),
              pb(["The export job fails", "Exportjobbet fallerar"], ["Removing public access breaks the nightly export job, and the team that owns it says another service reads those files every morning. Do you rebuild the job properly first, or let that service fail?", "Att ta bort den publika åtkomsten slår ut det nattliga exportjobbet, och teamet som äger det säger att en annan tjänst läser filerna varje morgon. Bygger ni först om jobbet ordentligt, eller låter ni den tjänsten fallera?"]),
              pb(["Two more open containers", "Två öppna lagringsplatser till"], ["The sweep finds two more storage containers with public access, owned by other teams, contents unknown. Nobody knows what depends on them. Do you close them too, right now, without knowing what breaks?", "Genomgången hittar ytterligare två lagringsplatser med publik åtkomst, som ägs av andra team och har okänt innehåll. Ingen vet vad som är beroende av dem. Stänger ni dem också, nu direkt, utan att veta vad som går sönder?"])
            ],
            B: [
              pb(["What exactly was exposed?", "Vad exakt exponerades?"], ["Legal warns that the regulator will ask exactly what was exposed and to how many. With the container gone, your only full record is the reporter's file. Can you live with that?", "Juristen varnar för att tillsynsmyndigheten kommer att fråga exakt vad som exponerades och för hur många. När lagringen är borta är ert enda fullständiga underlag reporterns fil. Kan ni leva med det?"]),
              pb(["The job runs again tonight", "Jobbet körs igen i natt"], ["The nightly export job still points at that location and will run again tonight. Nobody has yet traced what else writes to it or reads from it. Did deleting it fix anything but today's symptom?", "Det nattliga exportjobbet pekar fortfarande på den platsen och körs igen i natt. Ingen har ännu spårat vad mer som skriver dit eller läser därifrån. Löste raderingen något mer än dagens symptom?"]),
              pb(["The logs go with it", "Loggarna försvinner med den"], ["The SOC lead objects: the access logs are tied to the container's settings, and deleting it may take the four months of logs with it. Do you pause, and leave the data open a little longer to save them?", "SOC-chefen invänder: åtkomstloggarna är knutna till lagringens inställningar, och en radering kan ta de fyra månadernas loggar med sig. Pausar ni, och låter datan vara öppen en stund till för att rädda dem?"])
            ],
            C: [
              pb(["Reads keep coming", "Läsningarna fortsätter"], ["Since you decided to wait, the logs show more anonymous reads of the files, every one of them on your watch. How will you explain those downloads to the people in the file?", "Sedan ni beslutade att vänta visar loggarna fler anonyma läsningar av filerna, var och en under er bevakning. Hur förklarar ni de nedladdningarna för människorna i filen?"]),
              pb(["The reporter checks the link", "Reportern testar länken"], ["Comms warns that the reporter may test whether the files are still reachable before publishing. “Still open after we called them” would be tomorrow's headline. Who in this room will defend that choice?", "Kommunikationsavdelningen varnar för att reportern kan testa om filerna fortfarande går att nå innan publiceringen. ”Fortfarande öppet efter vårt samtal” blir morgondagens rubrik. Vem i rummet ska försvara det valet?"]),
              pb(["A new breach, on your watch", "En ny incident, under er tid"], ["The DPO says that leaving the data open now that you know is no longer an old mistake: it is a new decision to expose it. Are you prepared to sign off on that?", "Dataskyddsombudet säger att det inte längre är ett gammalt misstag att låta datan vara öppen nu när ni vet: det är ett nytt beslut att exponera den. Är ni beredda att skriva under på det?"])
            ]
          }
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
        reconsider: { decision: "d1", pressure: { en: "The files hold identity numbers and health data. Whatever you told the reporter yesterday is in today's article, right next to what you know now.", sv: "Filerna innehåller personnummer och hälsouppgifter. Det ni sa till reportern i går står i dagens artikel, alldeles bredvid det ni vet nu." } },
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
          interrupts: [
            ir("i1", { chosen: "C" }, ["Waiting for the analysis", "I väntan på analysen"], [
              io(["Done by morning", "Klart till i morgon bitti"], ["The analysts say the full list will be ready by tomorrow morning. Waiting one night seems reasonable to most of the room.", "Analytikerna säger att den fullständiga listan är klar i morgon bitti. Att vänta en natt verkar rimligt för de flesta i rummet."], ["The full analysis is promised by tomorrow morning.", "Den fullständiga analysen är utlovad till i morgon bitti."]),
              io(["A person calls in", "En berörd ringer"], ["A person whose health notes are in the file calls, upset: the reporter told them before you did. They ask why nobody from {{org.name}} has been in touch.", "En person vars hälsoanteckningar finns i filen ringer, upprörd: reportern berättade det innan ni gjorde det. Hen frågar varför ingen från {{org.name}} har hört av sig."], ["A person in the file heard about it from the reporter, not you.", "En person i filen fick veta det av reportern, inte av er."], { reopen: true, meters: { trust: -1 } }),
              io(["The DPO's advice", "Dataskyddsombudets råd"], ["The DPO puts in writing that they advised notifying today, and asks for the decision to wait to be minuted with the name behind it.", "Dataskyddsombudet skriver ner att hen rådde er att anmäla i dag och ber att beslutet att vänta protokollförs med namnet bakom det."], ["The DPO's written advice to notify today is on file.", "Dataskyddsombudets skriftliga råd om att anmäla i dag är protokollfört."])
            ]),
            ir("i2", { notChosen: "C" }, ["Notified today", "Anmält i dag"], [
              io(["Receipt confirmed", "Mottagandet bekräftat"], ["{{reg.dpaShort}} confirms receipt and asks for a supplement once the analysis is complete. It is a standard reply, and the room takes it as a good sign.", "{{reg.dpaShort}} bekräftar mottagandet och ber om en komplettering när analysen är klar. Det är ett standardsvar, och rummet tar det som ett gott tecken."], ["{{reg.dpaShort}} has confirmed receipt and expects a supplement.", "{{reg.dpaShort}} har bekräftat mottagandet och väntar på en komplettering."]),
              io(["Something was left out", "Något utelämnades"], ["Written in a hurry, the notification mentions identity numbers but not the health notes in the free-text field. The DPO says it must be supplemented at once.", "Anmälan skrevs i all hast och nämner personnummer men inte hälsoanteckningarna i fritextfältet. Dataskyddsombudet säger att den måste kompletteras genast."], ["Your first notification left out the health notes and must be supplemented.", "Er första anmälan utelämnade hälsoanteckningarna och måste kompletteras."], { reopen: true, meters: { regulator: 1 } }),
              io(["The phones light up", "Telefonerna går varma"], ["Within an hour, worried people flood customer service. Some are grateful to have heard it from you; others are frightened and angry, and the staff are struggling.", "Inom en timme strömmar oroliga människor till kundtjänst. En del är tacksamma för att de fick höra det från er; andra är rädda och arga, och personalen har svårt att räcka till."], ["Calls from worried people are overwhelming customer service.", "Samtal från oroliga människor överbelastar kundtjänst."])
            ])
          ],
          pushback: {
            A: [
              pb(["Calls from a stale list", "Samtal från en inaktuell lista"], ["There are {{num.sensitive}} people to contact personally, and the contact details you have are the same ones in the exposed file, some years out of date. How many days will this take, and who makes the calls?", "Det är {{num.sensitive}} personer att kontakta personligen, och de kontaktuppgifter ni har är samma som i den exponerade filen, en del flera år gamla. Hur många dagar tar det här, och vem ringer samtalen?"]),
              pb(["Them, or their carer?", "Personen eller företrädaren?"], ["Some of the people have support needs, and a stranger calling about their health information could cause real distress. Some have guardians or carers. Who gets the call, and how do you know you are speaking to the right person?", "En del av personerna har stödbehov, och ett samtal från en främling om deras hälsouppgifter kan väcka verklig oro. En del har gode män eller anhöriga som företräder dem. Vem får samtalet, och hur vet ni att ni talar med rätt person?"]),
              pb(["The newspaper gets there first", "Tidningen hinner före"], ["The article runs tomorrow, and you can reach only a fraction of these people before then. The rest will learn from the news anyway. Who do you call first, and what do the others hear in the meantime?", "Artikeln publiceras i morgon, och ni hinner bara nå en bråkdel av de här personerna innan dess. Resten får veta det genom nyheterna ändå. Vem ringer ni först, och vad får de andra höra under tiden?"])
            ],
            B: [
              pb(["“Was mine one of them?”", "”Var mina uppgifter med?”"], ["A person reads your statement that some records included health information and calls to ask whether theirs did. Your staff cannot answer yet. What do they hear from you?", "En person läser i ert uttalande att vissa poster innehöll hälsouppgifter och ringer för att fråga om hens gjorde det. Er personal kan inte svara ännu. Vad får hen höra från er?"]),
              pb(["You can reach them", "Ni kan nå dem"], ["The DPO says that with health data, people should be told directly unless that is impossible. A public statement is for when you cannot reach them, and you have their addresses. How do you justify not writing to them?", "Dataskyddsombudet säger att människor ska informeras direkt när det gäller hälsouppgifter, om det inte är omöjligt. Ett offentligt uttalande är till för när ni inte kan nå dem, och ni har deras adresser. Hur motiverar ni att ni inte skriver till dem?"]),
              pb(["An advertisement", "En annons"], ["A public statement about identity numbers and health notes also tells anyone who downloaded the files exactly what is valuable in them. Have you just advertised what to look for?", "Ett offentligt uttalande om personnummer och hälsoanteckningar talar också om för alla som har laddat ner filerna exakt vad som är värdefullt i dem. Har ni just annonserat vad man ska leta efter?"])
            ],
            C: [
              pb(["Seventy-two hours", "Sjuttiotvå timmar"], ["Legal reminds you that the 72 hours started at the latest when the open storage was found today. A full analysis of every file will not be done within that. Do you miss the deadline for the sake of completeness?", "Juristen påminner om att de 72 timmarna började löpa senast när den öppna lagringen hittades i dag. En fullständig analys av varje fil blir inte klar inom den tiden. Missar ni fristen för fullständighetens skull?"]),
              pb(["Reading it in the paper", "Att läsa det i tidningen"], ["The reporter has learned that health details are involved and will include them tomorrow. People will read about their own health information in the news before you have said a word. Is your analysis worth that?", "Reportern har fått veta att hälsouppgifter ingår och tar med det i morgon. Människor kommer att läsa om sina egna hälsouppgifter i nyheterna innan ni har sagt ett ord. Är er analys värd det?"]),
              pb(["The answer it cannot give", "Svaret den inte kan ge"], ["Without logs for most of the period, no analysis will tell you who downloaded the files. What will the full analysis tell you that changes whether you notify?", "Utan loggar för större delen av perioden kommer ingen analys att visa vem som laddade ner filerna. Vad kommer den fullständiga analysen att säga som ändrar om ni anmäler?"])
            ]
          },
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
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because a full snapshot was taken before closing, the container stayed public for another hour, and the access log shows two more downloads in that hour.", sv: "Eftersom en fullständig ögonblicksbild togs innan stängningen var behållaren öppen ytterligare en timme, och åtkomstloggen visar två nedladdningar till under den timmen." } }
        ],
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
          evaluation: [["Reports the true awareness date", "Anger den verkliga tidpunkten för kännedom"]],
          interrupts: [
            ir("i1", { chosen: "C" }, ["The ticket left out", "Ärendet utelämnat"], [
              io(["Nobody asks", "Ingen frågar"], ["The notification goes in without mentioning the ticket, and no one outside has asked about it. Some in the room start to feel the problem has gone away.", "Anmälan skickas in utan att ärendet nämns, och ingen utomstående har frågat om det. Några i rummet börjar känna att problemet har försvunnit."], ["No one outside has asked about the ticket so far.", "Ingen utomstående har frågat om ärendet hittills."]),
              io(["The researcher speaks", "Forskaren tar till orda"], ["The researcher posts publicly that they warned you {{num.daysSinceTicket}} days ago, with a screenshot of the reply closing the ticket. The reporter has already shared it.", "Säkerhetsforskaren skriver offentligt att hen varnade er för {{num.daysSinceTicket}} dagar sedan, med en skärmbild av svaret som stängde ärendet. Reportern har redan delat den."], ["The researcher has said publicly that they warned you earlier.", "Säkerhetsforskaren har sagt offentligt att hen varnade er tidigare."], { reopen: true, meters: { media: 1, regulator: 1 } }),
              io(["People inside know", "Folk internt vet"], ["The service desk agent who closed the ticket asks HR whether they will be blamed. Several colleagues now know the ticket exists, and that it was left out.", "Den medarbetare i servicedesken som stängde ärendet frågar HR om hen kommer att få skulden. Flera kollegor vet nu att ärendet finns, och att det utelämnades."], ["Several staff know the ticket was left out of the notification.", "Flera medarbetare vet att ärendet utelämnades i anmälan."])
            ]),
            ir("i2", { notChosen: "C" }, ["The warning on record", "Varningen redovisad"], [
              io(["The researcher offers help", "Forskaren erbjuder hjälp"], ["The researcher replies to your contact, offers to share what they saw, and says they have no plans to talk to the press for now.", "Säkerhetsforskaren svarar på er kontakt, erbjuder sig att dela det hen såg och säger att hen inte har några planer på att prata med pressen just nu."], ["The researcher has offered help and is not talking to the press for now.", "Säkerhetsforskaren har erbjudit hjälp och pratar inte med pressen just nu."]),
              io(["The regulator digs in", "Myndigheten gräver vidare"], ["{{reg.dpaShort}} asks for the ticket itself, the support routines and the names of everyone who handled it. The ignored warning is now at the centre of their questions.", "{{reg.dpaShort}} begär själva ärendet, supportrutinerna och namnen på alla som hanterade det. Den ignorerade varningen står nu i centrum för deras frågor."], ["{{reg.dpaShort}} has asked for the ticket and the support routines.", "{{reg.dpaShort}} har begärt ärendet och supportrutinerna."], { meters: { regulator: 1 } }),
              io(["Someone to blame", "Någon att skylla på"], ["Internally, people start blaming the service desk agent who closed the ticket. Their manager asks the room to stop it, pointing out that the spam filter flagged it first.", "Internt börjar folk skylla på den medarbetare i servicedesken som stängde ärendet. Chefen ber rummet att stoppa det och påpekar att skräppostfiltret flaggade det först."], ["The agent who closed the ticket is being blamed internally.", "Medarbetaren som stängde ärendet får skulden internt."], { reopen: true })
            ])
          ],
          pushback: {
            A: [
              pb(["The person who closed it", "Personen som stängde ärendet"], ["Colleagues already know who closed the ticket, and that person is being blamed in the corridors. Disclosing it publicly puts them in an even brighter spotlight. How do you stay honest without making one support agent the face of this?", "Kollegorna vet redan vem som stängde ärendet, och personen får skulden i korridorerna. Att berätta det offentligt sätter hen i ännu skarpare strålkastarljus. Hur är ni ärliga utan att göra en enskild supportmedarbetare till ansiktet utåt?"]),
              pb(["The researcher's version", "Forskarens version"], ["When you call to thank the researcher, they say they appreciate it but will tell their own story too, including that nobody answered them. Does your public thanks look different next to their version?", "När ni ringer för att tacka säkerhetsforskaren säger hen att hen uppskattar det men också tänker berätta sin egen historia, inklusive att ingen svarade. Ser ert offentliga tack annorlunda ut bredvid hens version?"]),
              pb(["Why volunteer it?", "Varför berätta frivilligt?"], ["Legal warns that publicly confirming the warning weeks ago may weigh against you in any sanction. A board member asks why you are volunteering something nobody outside has asked about. What do you answer?", "Juristen varnar för att det kan väga emot er vid en eventuell sanktion att offentligt bekräfta varningen för flera veckor sedan. En styrelseledamot frågar varför ni frivilligt berättar något som ingen utanför har frågat om. Vad svarar ni?"])
            ],
            B: [
              pb(["“Did anyone warn you?”", "”Varnade någon er?”"], ["The reporter asks directly whether anyone warned you before. Your notification to {{reg.dpaShort}} says yes; your public line says nothing. Do you answer the question, or not?", "Reportern frågar rakt ut om någon har varnat er tidigare. Er anmälan till {{reg.dpaShort}} säger ja; er offentliga linje säger ingenting. Svarar ni på frågan, eller inte?"]),
              pb(["The researcher is free to talk", "Forskaren kan prata fritt"], ["Nobody has contacted the researcher, who can speak to the press whenever they like. If they do, it will look as if you hid the warning from the public. Who calls the researcher, and what do you ask of them?", "Ingen har kontaktat säkerhetsforskaren, som kan prata med pressen när hen vill. Om hen gör det kommer det att se ut som att ni dolde varningen för allmänheten. Vem ringer forskaren, och vad ber ni hen om?"]),
              pb(["Public on someone else's terms", "Offentligt på någon annans villkor"], ["Comms points out that documents sent to {{reg.dpaShort}} can be requested by journalists. The ignored warning may become public anyway, on someone else's timing. What does keeping it out of your own statement achieve?", "Kommunikationsavdelningen påpekar att handlingar som skickas till {{reg.dpaShort}} kan begäras ut av journalister. Den ignorerade varningen kan bli offentlig ändå, när någon annan väljer. Vad vinner ni på att hålla den utanför ert eget uttalande?"])
            ],
            C: [
              pb(["Against your lawyer's advice", "Mot er jurists råd"], ["Your own lawyer has written that awareness arguably began with the ticket. A notification that says “today” goes against that written advice. Who signs it, by name?", "Er egen jurist har skrivit att kännedom rimligen uppstod när ärendet kom in. En anmälan som säger ”i dag” går emot det skriftliga rådet. Vem skriver under den, med namn?"]),
              pb(["A team that knows", "Ett team som vet"], ["The ticket is in the support system with a date on it, and several people have now seen it. How long does a secret shared by a whole team last?", "Ärendet finns i supportsystemet med ett datum, och flera personer har nu sett det. Hur länge håller en hemlighet som ett helt team känner till?"]),
              pb(["One screenshot", "En enda skärmbild"], ["The researcher kept their email and the automatic reply your support system sent back. If they publish it, your stated awareness date is disproved in one screenshot. Are you betting on them staying quiet?", "Säkerhetsforskaren har kvar sitt mejl och det automatiska svaret som ert supportsystem skickade. Om hen publicerar det motbevisas er angivna tidpunkt för kännedom med en enda skärmbild. Satsar ni på att hen förblir tyst?"])
            ]
          }
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
        reconsider: { decision: "d2", pressure: { en: "The data is on a forum, downloaded {{num.downloads}} times. If you took a snapshot before closing, you have the evidence and lost an hour. If you deleted it, you can no longer say exactly what was exposed.", sv: "Uppgifterna ligger på ett forum och har laddats ner {{num.downloads}} gånger. Om ni tog en ögonblicksbild innan ni stängde har ni bevisen och förlorade en timme. Om ni raderade den kan ni inte längre säga exakt vad som exponerades." } },
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because you phoned everyone with sensitive data personally, fraudsters are now copying the calls: people are being rung by someone claiming to be you.", sv: "Eftersom ni ringde alla med känsliga uppgifter personligen härmar bedragare nu samtalen: folk blir uppringda av någon som påstår sig vara ni." } }
        ],
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
          evaluation: [["Offers concrete help, not only information", "Erbjuder konkret hjälp, inte bara information"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["The support line opens", "Stödlinjen öppnar"], [
              io(["It helps", "Det hjälper"], ["The first day, the support line answers most calls, and several people thank you for helping them block credit applications. One of them says so publicly.", "Under den första dagen besvarar stödlinjen de flesta samtal, och flera personer tackar för hjälpen att spärra kreditansökningar. En av dem säger det offentligt."], ["The support line is helping people, and some have said so publicly.", "Stödlinjen hjälper människor, och några har sagt det offentligt."], { meters: { trust: 1 } }),
              io(["Hours on hold", "Timmar i kö"], ["Waiting times on the support line run to hours, and people post screenshots of the queue. The line you promised now looks like part of the problem.", "Väntetiderna på stödlinjen är flera timmar, och folk lägger ut skärmbilder av kön. Linjen ni lovade ser nu ut som en del av problemet."], ["The support line's waiting times run to hours.", "Väntetiderna på stödlinjen är flera timmar."], { reopen: true, meters: { media: 1 } }),
              io(["“Is this really you?”", "”Är det verkligen ni?”"], ["Many people you contact refuse to engage, afraid your message is itself a fraud. Some of them are probably right to be careful; you cannot tell which.", "Många av dem ni kontaktar vägrar svara, rädda att ert meddelande i sig är ett bedrägeri. En del gör troligen rätt i att vara försiktiga; ni kan inte avgöra vilka."], ["Many people doubt your contact is genuine and will not engage.", "Många tvivlar på att er kontakt är äkta och svarar inte."])
            ]),
            ir("i2", { notChosen: "A" }, ["No direct help", "Ingen direkt hjälp"], [
              io(["A credit application", "En kreditansökan"], ["A person in the file reports that someone has applied for credit in their name. They ask what {{org.name}} is going to do about it.", "En person i filen rapporterar att någon har ansökt om kredit i hens namn. Hen frågar vad {{org.name}} tänker göra åt det."], ["A person in the file has reported a credit application in their name.", "En person i filen har rapporterat en kreditansökan i sitt namn."], { reopen: true, meters: { trust: -1 } }),
              io(["Quiet so far", "Lugnt hittills"], ["Few people have written to the email address so far. Some in the room take that as a sign the response is enough.", "Få personer har skrivit till e-postadressen hittills. Några i rummet tar det som ett tecken på att insatsen räcker."], ["Few affected people have contacted you so far.", "Få berörda har kontaktat er hittills."]),
              io(["An advocacy group asks", "En intresseorganisation frågar"], ["An organisation representing people with disabilities asks publicly what concrete help you are offering its members whose notes were exposed.", "En organisation för personer med funktionsnedsättning frågar offentligt vilken konkret hjälp ni erbjuder de medlemmar vars anteckningar har exponerats."], ["A disability organisation has publicly asked what help you offer.", "En organisation för personer med funktionsnedsättning har offentligt frågat vilken hjälp ni erbjuder."], { meters: { media: 1 } })
            ])
          ],
          pushback: {
            A: [
              pb(["Staff by tomorrow", "Personal till i morgon"], ["A support line needs trained people by tomorrow, and since the article calls have already spiked. Who answers the phone, and what are they allowed to say about someone's health information?", "En stödlinje behöver utbildad personal till i morgon, och sedan artikeln har samtalen redan ökat kraftigt. Vem svarar i telefon, och vad får de säga om någons hälsouppgifter?"]),
              pb(["Is it really you?", "Är det verkligen ni?"], ["Your direct contact asks people to trust a call or email about their identity numbers, the exact pattern scammers use after a leak. How will people know it is really you, and not someone using your name?", "Er direkta kontakt ber människor lita på ett samtal eller mejl om deras personnummer, precis det mönster som bedragare använder efter en läcka. Hur ska de veta att det verkligen är ni och inte någon som använder ert namn?"]),
              pb(["Help for some, not all", "Hjälp till några, inte alla"], ["Finance asks who pays, and whether help with blocking credit applications goes to all {{num.records}} people or only those with identity numbers in the file. Where do you draw the line, and how do you explain it to the rest?", "Ekonomi frågar vem som betalar, och om hjälpen att spärra kreditansökningar ska gå till alla {{num.records}} personer eller bara till dem med personnummer i filen. Var drar ni gränsen, och hur förklarar ni den för de andra?"])
            ],
            B: [
              pb(["No internet at home", "Inget internet hemma"], ["An elderly person whose health notes were exposed has no internet and calls your switchboard, which has no script. Who is your web page actually for?", "En äldre person vars hälsoanteckningar exponerades har inget internet och ringer er växel, som saknar instruktioner. Vem är er webbsida egentligen till för?"]),
              pb(["A week to reply", "En vecka för att svara"], ["The question mailbox receives thousands of emails on the first day, and replies will take a week. People asking whether their identity number is public will wait days. Is that acceptable?", "Brevlådan för frågor får tusentals mejl första dagen, och svaren kommer att dröja en vecka. Människor som undrar om deras personnummer är publikt får vänta i flera dagar. Är det acceptabelt?"]),
              pb(["Guidance does not block", "Vägledning spärrar ingenting"], ["Forum comments are already pointing out the identity numbers. Advice on a web page does not stop a credit application in someone's name. What concrete harm does your page actually prevent?", "Kommentarer på forumet pekar redan ut personnumren. Råd på en webbsida stoppar inte en kreditansökan i någons namn. Vilken konkret skada förhindrar er sida egentligen?"])
            ],
            C: [
              pb(["Sent back to you", "Tillbaka till er"], ["The authorities you referred people to say they cannot tell anyone what was in your files; only you can. People come back to you, angrier than before. What do you tell them now?", "Myndigheterna som ni hänvisade till säger att de inte kan berätta för någon vad som fanns i era filer; det kan bara ni. Människor kommer tillbaka till er, argare än tidigare. Vad säger ni till dem nu?"]),
              pb(["The follow-up question", "Följdfrågan"], ["The reporter's follow-up asks what you are doing for the people affected. Your answer is that you refer them to the authorities. How does that read under the headline that is already out?", "Reporterns följdfråga gäller vad ni gör för de berörda. Ert svar är att ni hänvisar dem till myndigheterna. Hur läses det under rubriken som redan är ute?"]),
              pb(["Why should they do the work?", "Varför ska de göra jobbet?"], ["The DPO points out that you held the data and you left it open; the people affected did nothing wrong. Why should they be the ones chasing help?", "Dataskyddsombudet påpekar att det var ni som hade uppgifterna och lämnade dem öppna; de berörda gjorde inget fel. Varför ska det vara de som jagar hjälp?"])
            ]
          }
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
        reconsider: { decision: "d3", pressure: { en: "The regulator now asks how cloud storage is governed. Knowing what you know now, was your way of telling people the right one?", sv: "Tillsynsmyndigheten frågar nu hur molnlagringen styrs. Med det ni vet i dag, var ert sätt att informera de berörda det rätta?" } },
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
          evaluation: [["Turns the case into lasting governance", "Omsätter ärendet i bestående styrning"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["An open answer", "Ett öppet svar"], [
              io(["Cooperation noted", "Samarbetet noteras"], ["{{reg.dpaShort}} replies that your cooperation and the independent review will be taken into account. The CEO forwards the letter to the board.", "{{reg.dpaShort}} svarar att ert samarbete och den oberoende granskningen kommer att beaktas. Vd vidarebefordrar brevet till styrelsen."], ["{{reg.dpaShort}} says your cooperation will be taken into account.", "{{reg.dpaShort}} säger att ert samarbete kommer att beaktas."], { meters: { regulator: -1 } }),
              io(["No funding yet", "Ingen finansiering ännu"], ["The board refuses to approve funding for the improvement plan until it has seen a full cost estimate. The plan you promised the regulator has no money behind it.", "Styrelsen vägrar godkänna finansiering av förbättringsplanen innan den har sett en fullständig kostnadsuppskattning. Planen ni lovade tillsynsmyndigheten saknar pengar."], ["The board has not approved funding for the improvement plan.", "Styrelsen har inte godkänt finansiering av förbättringsplanen."], { reopen: true }),
              io(["The review finds more", "Granskningen hittar mer"], ["In its first week, the independent review finds production data in another test environment. It was not public, but it must be reported, and the case grows.", "Under sin första vecka hittar den oberoende granskningen produktionsdata i en annan testmiljö. Den var inte publik, men den måste redovisas, och ärendet växer."], ["The review found production data in another, non-public test environment.", "Granskningen hittade produktionsdata i en annan testmiljö, som inte var publik."], { meters: { regulator: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["A guarded answer", "Ett försiktigt svar"], [
              io(["Accepted for now", "Godtaget tills vidare"], ["{{reg.dpaShort}} acknowledges your answers and has no further questions for the moment. Legal calls it a good result.", "{{reg.dpaShort}} bekräftar era svar och har inga fler frågor för tillfället. Juristen kallar det ett bra resultat."], ["{{reg.dpaShort}} has no further questions for the moment.", "{{reg.dpaShort}} har inga fler frågor för tillfället."]),
              io(["An inspection", "En inspektion"], ["{{reg.dpaShort}} finds your answers too narrow and announces an inspection on site. They want to see the storage controls for themselves.", "{{reg.dpaShort}} anser att era svar är för snäva och aviserar en inspektion på plats. De vill se lagringskontrollerna med egna ögon."], ["{{reg.dpaShort}} has announced an on-site inspection.", "{{reg.dpaShort}} har aviserat en inspektion på plats."], { reopen: true, meters: { regulator: 1 } }),
              io(["The reporter wants it", "Reportern vill se det"], ["The reporter asks to see your reply to the regulator. Comms is not sure whether you can refuse, or how a refusal would read.", "Reportern begär att få se ert svar till tillsynsmyndigheten. Kommunikation är osäker på om ni kan neka, och hur ett nej skulle uppfattas."], ["The reporter has asked to see your reply to the regulator.", "Reportern har begärt att få se ert svar till tillsynsmyndigheten."], { meters: { media: 1 } })
            ])
          ],
          pushback: {
            A: [
              pb(["Findings you have not seen", "Fynd ni inte har sett"], ["An independent review will find weaknesses beyond this container, and a candid answer means sending those to the regulator too. Are you ready to commit to sharing findings you have not read yet?", "En oberoende granskning kommer att hitta brister utöver den här lagringen, och ett öppet svar innebär att även de skickas till tillsynsmyndigheten. Är ni beredda att lova att dela fynd som ni ännu inte har läst?"]),
              pb(["Which budget pays?", "Vilken budget betalar?"], ["Finance asks where the money for a funded improvement plan comes from. It competes with the budget for supporting the people affected. Which one do you cut?", "Ekonomi frågar varifrån pengarna till en finansierad förbättringsplan ska komma. Den konkurrerar med budgeten för stödet till de berörda. Vilken skär ni i?"]),
              pb(["Evidence for others", "Underlag för andra"], ["External counsel warns that an independent report written for the regulator can also be used by affected people who claim damages. Do you still commission it on those terms?", "Externa jurister varnar för att en oberoende rapport som skrivs för tillsynsmyndigheten också kan användas av berörda som kräver skadestånd. Beställer ni den ändå på de villkoren?"])
            ],
            B: [
              pb(["“Classified as spam”", "”Klassades som skräppost”"], ["One question is why the warning was not acted on. The narrow, accurate answer is “it was classified as spam”. Is that the whole truth the regulator is asking for?", "En av frågorna är varför varningen inte åtgärdades. Det snäva, korrekta svaret är ”den klassades som skräppost”. Är det hela sanningen som tillsynsmyndigheten frågar efter?"]),
              pb(["Round after round", "Omgång efter omgång"], ["Narrow answers invite follow-up questions, and each round adds weeks and keeps the case open and in the news. Is narrow really the faster way out?", "Snäva svar bjuder in till följdfrågor, och varje omgång lägger till veckor och håller ärendet öppet och i nyheterna. Är snävt verkligen den snabbaste vägen ut?"]),
              pb(["The DPO will not sign", "Dataskyddsombudet skriver inte under"], ["Your DPO, who must stand behind the reply, says a narrowly correct answer that leaves out weaknesses you know about is not something they can put their name to. Do you overrule your own DPO?", "Ert dataskyddsombud, som ska stå bakom svaret, säger att ett snävt korrekt svar som utelämnar brister ni känner till inte är något hen kan sätta sitt namn på. Kör ni över ert eget dataskyddsombud?"])
            ],
            C: [
              pb(["The sidelined DPO", "Ett åsidosatt dataskyddsombud"], ["Your DPO is meant to be the regulator's point of contact. Routing everything through outside lawyers sidelines them, and they ask whether their role still means anything. What do you tell them?", "Ert dataskyddsombud ska vara tillsynsmyndighetens kontaktpunkt. Att låta allt gå via externa jurister ställer hen åt sidan, och hen frågar om rollen fortfarande betyder något. Vad svarar ni?"]),
              pb(["Lawyers asking engineers", "Jurister som frågar tekniker"], ["The regulator's questions are about access reviews and export jobs. The lawyers must ask your cloud team for every answer, adding days to each round. Who answers when a follow-up comes up in a meeting?", "Tillsynsmyndighetens frågor gäller åtkomstgranskningar och exportjobb. Juristerna måste fråga ert molnteam om varje svar, vilket lägger till dagar i varje omgång. Vem svarar när en följdfråga kommer upp under ett möte?"]),
              pb(["“Send the people who run it”", "”Skicka dem som driver det”"], ["The case officer asks for a meeting with the people who run the storage, not your lawyers. Your counsel advises against it. Do you send them, or say no to the regulator?", "Handläggaren ber om ett möte med dem som driver lagringen, inte era jurister. Era advokater avråder. Skickar ni dem, eller säger ni nej till tillsynsmyndigheten?"])
            ]
          }
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
