/*
 * s37-underwriting-ai.js — "The Model That Said No" (archetype F, insurance).
 *
 * A journalist holds internal documents suggesting the AI underwriting model refuses
 * cover in certain neighbourhoods → the model never uses postcode, but proxies do the
 * same work, and an internal fairness warning was parked to meet a launch date → the
 * leak came from a public cloud folder that also held a customer training extract →
 * regulators open inquiries and thousands of refusals may have been unfair → the
 * person who raised the warning, the board and the model vendor pull apart → the same
 * vendor model runs at other insurers.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s37-underwriting-ai",
    version: 1,
    category: "underwriting-ai",
    archetype: "human-legal-reputational",
    emblem: "underwriting-ai",
    title: L(["The Model That Said No", "Modellen som sa nej"]),
    summary: L([
      "A journalist has documents suggesting your AI pricing model quietly refuses cover in some neighbourhoods. The model never sees an address, so everyone in the room believes it cannot be true. Then you read your own fairness report.",
      "En journalist har dokument som tyder på att er AI-modell för riskbedömning i tysthet nekar försäkring i vissa bostadsområden. Modellen ser aldrig någon adress, så alla i rummet tror att det inte kan stämma. Sedan läser ni er egen rapport om likabehandling."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Respond publicly before the facts are fully known", "Svara offentligt innan alla fakta är kända"]), teaser: L(["Answers before answers exist", "Svar innan det finns svar"]) },
      { id: "lo2", text: L(["Decide what to do with a model that may be causing harm", "Besluta vad som ska hända med en modell som kan orsaka skada"]), teaser: L(["When the machine is the incident", "När maskinen är incidenten"]) },
      { id: "lo3", text: L(["Handle a data leak and an ethics failure as one incident", "Hantera en dataläcka och ett etiskt misslyckande som en incident"]), teaser: L(["Two problems, one folder", "Två problem, en mapp"]) },
      { id: "lo4", text: L(["Put right decisions that already harmed customers", "Rätta till beslut som redan har skadat kunder"]), teaser: L(["The people already told no", "De som redan fått nej"]) }
    ],
    mitre: ["T1530", "T1567"],
    frameworks: {
      nistCsf: ["GV.PO", "GV.RM", "GV.OV", "ID.RA", "PR.DS", "RS.CO"],
      iso27001: ["A.5.10", "A.5.12", "A.5.31", "A.5.33", "A.5.34", "A.8.12"]
    },
    minStages: 4,
    maxStages: 6,
    constraints: { startWindow: "business-hours", startTime: "10:20", sectors: ["insurance"] },
    actor: { types: ["unknown"], motivation: L(["None hostile: a data scientist's shared folder and a model nobody fully checked", "Ingen fientlig: en dataforskares delade mapp och en modell som ingen kontrollerat fullt ut"]), capability: "low" },
    variables: {
      declined: { min: 600, max: 9000, scaleBy: "size", step: 10 },
      extract: { min: 8000, max: 90000, scaleBy: "size", step: 1000 },
      areas: { min: 6, max: 40 },
      gap: { min: 2, max: 4 }
    },
    roles: ["incidentCommander", "ceo", "cio", "ciso", "cfo", "devLead", "serviceOwner", "legal", "dpo", "comms", "hr"],

    groundTruth: {
      rootCause: L([
        "{{org.name}}'s underwriting model never receives a postcode, but two of its strongest inputs, distance to the nearest repair partner and historical claims density, follow neighbourhood lines closely. Six months ago an internal fairness test found applicants in {{num.areas}} areas were refused {{num.gap}} times as often as similar applicants elsewhere; the finding was logged as a known issue so the model could launch on time. A data scientist later copied the project wiki, including the fairness report and a training extract with {{num.extract|number}} customers' claims histories, to a personal cloud folder that was shared by link. A journalist received the link.",
        "{{org.name}}s modell för riskbedömning får aldrig något postnummer, men två av dess starkaste indata, avståndet till närmaste reparationspartner och den historiska skadetätheten, följer bostadsområdenas gränser nära. För sex månader sedan visade ett internt test av likabehandling att sökande i {{num.areas}} områden nekades {{num.gap}} gånger så ofta som jämförbara sökande på andra håll; resultatet loggades som ett känt problem så att modellen kunde lanseras i tid. En dataforskare kopierade senare projektets wiki, med rapporten om likabehandling och ett träningsutdrag med {{num.extract|number}} kunders skadehistorik, till en privat molnmapp som delades via länk. En journalist fick länken."
      ]),
      attackerTimeline: [
        { at: -262800, text: L(["Fairness test flags the model; logged as a known issue.", "Test av likabehandling flaggar modellen; loggas som känt problem."]) },
        { at: -250000, text: L(["Model launches on schedule.", "Modellen lanseras enligt tidsplanen."]) },
        { at: -43200, text: L(["Project wiki and training extract copied to a link-shared folder.", "Projektets wiki och träningsutdraget kopieras till en mapp som delas via länk."]) },
        { at: -1440, text: L(["A journalist receives the link.", "En journalist får länken."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-proxy", revealStage: "p2", text: L(["The model uses no postcode, but two proxies reproduce neighbourhood lines, and the company's own test found it.", "Modellen använder inget postnummer, men två ersättningsvariabler återskapar områdesgränserna, och bolagets eget test upptäckte det."]) },
      { id: "hf-extract", revealStage: "p3", text: L(["The shared folder also held a training extract with real customers' claims histories.", "Den delade mappen innehöll också ett träningsutdrag med verkliga kunders skadehistorik."]) },
      { id: "hf-vendor", revealStage: "p6", text: L(["The model is a vendor product, and the same version prices policies at other insurers.", "Modellen är en leverantörsprodukt, och samma version prissätter försäkringar hos andra bolag."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Request for comment", "Begäran om kommentar"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. A reporter from a national newspaper emails {{person.comms.name}}. They have internal documents from {{org.name}} that, they say, show the company's automated underwriting refuses home insurance far more often in some neighbourhoods, many of them home to immigrant families. Publication is planned for tomorrow morning.\n\nThe head of data science, {{person.devLead.name}}, is sure it is wrong: the model has never seen an address, by design. The CEO wants a firm answer by lunch.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. En reporter på en rikstidning mejlar {{person.comms.name}}. Hen har interna dokument från {{org.name}} som, säger hen, visar att bolagets automatiska riskbedömning nekar hemförsäkring betydligt oftare i vissa bostadsområden, där många invandrarfamiljer bor. Publicering är planerad till i morgon bitti.\n\nDatachefen {{person.devLead.name}} är säker på att det är fel: modellen har aldrig sett en adress, det är en medveten konstruktion. Vd vill ha ett tydligt svar till lunch."
        ]),
        injects: [
          inj("i1-1", 0, "mediaEnquiry", "media", "high", "confirmed", [
            "“We have internal documents including a report titled ‘Fairness review, pricing model v2’. It shows refusal rates up to several times higher in specific areas. Do you dispute this? Deadline 17:00 today.”",
            "”Vi har interna dokument, bland annat en rapport med titeln ’Granskning av likabehandling, prismodell v2’. Den visar avslag upp till flera gånger oftare i vissa områden. Bestrider ni detta? Deadline klockan 17 i dag.”"
          ], { tests: ["lo1"] }),
          inj("i1-2", 15, "chat", "person.devLead", "medium", "misleading", [
            "“The model has no address, no postcode, no nationality, nothing like that. Whatever they have is out of context. Say that.”",
            "”Modellen har ingen adress, inget postnummer, ingen nationalitet, inget sådant. Vad de än har är taget ur sitt sammanhang. Säg det.”"
          ], { facilitatorNote: ["True about the inputs, wrong about the outcome: proxies do the work. Watch whether anyone asks for the report itself.", "Sant om indata, fel om utfallet: ersättningsvariabler gör jobbet. Se om någon ber att få läsa själva rapporten."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you find out, before 17:00, whether the report the journalist has is real?", "Hur tar ni reda på, före klockan 17, om rapporten som journalisten har är äkta?", ["devLead", "ciso"]),
            q("Can a model discriminate without ever seeing the thing it discriminates on?", "Kan en modell diskriminera utan att någonsin se det den diskriminerar efter?", ["devLead"]),
            q("Where could internal documents like these have left the company?", "Var kan interna dokument som de här ha lämnat bolaget?", ["ciso"])
          ],
          executive: [
            q("What can you say today that you will not have to take back tomorrow?", "Vad kan ni säga i dag som ni inte behöver ta tillbaka i morgon?", ["comms", "ceo"]),
            q("Who in the room has actually read the fairness report?", "Vem i rummet har faktiskt läst rapporten om likabehandling?", ["ceo", "incidentCommander"]),
            q("Is this a leak, a discrimination case, or both?", "Är det här en läcka, ett diskrimineringsärende eller både och?", ["legal"])
          ]
        },
        challenges: [ch("Legal says any admission today could be used in a discrimination claim.", "Juristerna säger att varje medgivande i dag kan användas i ett diskrimineringsmål.")],
        decision: dec("d1", "ceo", ["What do you tell the journalist today?", "Vad säger ni till journalisten i dag?"], [
          ["Confirm the report is internal and genuine, say the model is under urgent review, and promise a full answer.", "Bekräfta att rapporten är intern och äkta, säg att modellen granskas skyndsamt och lova ett fullständigt svar."],
          ["Ask for 48 hours to verify the documents, and say nothing on the substance today.", "Be om 48 timmar för att verifiera dokumenten, och säg ingenting i sak i dag."],
          ["Say the model uses only lawful factors and no addresses, and that the documents are out of context.", "Säg att modellen bara använder tillåtna faktorer och inga adresser, och att dokumenten är tagna ur sitt sammanhang."]
        ], {
          knowns: [["A journalist holds what looks like your internal fairness report.", "En journalist har något som ser ut som er interna rapport om likabehandling."]],
          uncertainties: [["What the report actually concludes, and how the journalist got it.", "Vad rapporten faktiskt kommer fram till, och hur journalisten fick den."]],
          tradeoffs: {
            operational: ["Verifying properly takes longer than the deadline.", "Att verifiera ordentligt tar längre tid än deadline."],
            security: ["The documents left the company somehow; that is its own incident.", "Dokumenten lämnade bolaget på något sätt; det är en egen incident."],
            legal: ["Anything you say may matter in a discrimination case.", "Allt ni säger kan få betydelse i ett diskrimineringsmål."],
            reputational: ["A firm denial that later collapses is worse than silence.", "Ett bestämt förnekande som senare faller är värre än tystnad."]
          },
          evaluation: [["Says nothing it will have to retract, and reads the report before defending the model", "Säger inget som måste tas tillbaka, och läser rapporten innan modellen försvaras"]]
        }),
        facilitator: fac(
          ["The data science lead is sincere and wrong. The test is whether anyone reads the actual report before speaking.", "Datachefen är uppriktig och har fel. Provet är om någon läser den faktiska rapporten innan ni uttalar er."],
          ["A holding answer that admits the review, without defending or condemning the model yet.", "Ett avvaktande svar som medger granskningen, utan att försvara eller döma ut modellen ännu."],
          [["Ask: if the report is genuine, which sentence in your answer becomes a problem?", "Fråga: om rapporten är äkta, vilken mening i ert svar blir då ett problem?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 120,
        title: L(["Our own report", "Vår egen rapport"]),
        twist: L(["The report is genuine. The model uses no postcode, but distance to the nearest repair partner and historical claims density follow neighbourhood lines, and six months ago your own team measured the effect, logged it as a known issue, and launched on time.", "Rapporten är äkta. Modellen använder inget postnummer, men avståndet till närmaste reparationspartner och den historiska skadetätheten följer områdesgränserna, och för sex månader sedan mätte ert eget team effekten, loggade den som ett känt problem och lanserade i tid."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "C" }, narrativeAppend: { en: "Because you told the journalist the documents were out of context, the paper has moved publication to tonight, with your quote printed above the report's own conclusion.", sv: "Eftersom ni sa till journalisten att dokumenten var tagna ur sitt sammanhang har tidningen tidigarelagt publiceringen till i kväll, med ert citat tryckt ovanför rapportens egen slutsats." } }
        ],
        assumptionChallenged: L(["A model without addresses cannot treat neighbourhoods differently.", "En modell utan adresser kan inte behandla bostadsområden olika."]),
        reveals: ["hf-proxy"],
        narrative: L([
          "{{time.T+120|clock}}. {{person.devLead.name}} has found the report on the project wiki and read it in front of everyone. The conclusion is plain: applicants in {{num.areas}} areas are refused {{num.gap}} times as often as comparable applicants elsewhere, because two harmless-sounding inputs stand in for where people live.\n\nThe ticket recording the finding is still open. Its last comment, from the week before launch, reads: “Known issue. Revisit after go-live.”",
          "Klockan {{time.T+120|clock}}. {{person.devLead.name}} har hittat rapporten i projektets wiki och läst den inför alla. Slutsatsen är tydlig: sökande i {{num.areas}} områden nekas {{num.gap}} gånger så ofta som jämförbara sökande på andra håll, eftersom två oskyldigt klingande indata ersätter var folk bor.\n\nÄrendet som dokumenterar resultatet är fortfarande öppet. Den sista kommentaren, från veckan före lanseringen, lyder: ”Känt problem. Ses över efter driftstart.”"
        ]),
        injects: [
          inj("i2-1", 120, "impactReport", "person.devLead", "high", "confirmed", [
            "Fairness review, pricing model v2: refusal rate in {{num.areas}} areas {{num.gap}}× the rate for matched applicants elsewhere. Main drivers: repair-partner distance, claims density. Recommendation: do not launch without mitigation. Status: accepted as known issue.",
            "Granskning av likabehandling, prismodell v2: avslagsfrekvens i {{num.areas}} områden {{num.gap}} gånger så hög som för jämförbara sökande på andra håll. Främsta orsaker: avstånd till reparationspartner, skadetäthet. Rekommendation: lansera inte utan åtgärd. Status: accepterat som känt problem."
          ], { reveals: ["hf-proxy"], tests: ["lo2"] }),
          inj("i2-2", 135, "executiveMessage", "person.serviceOwner", "medium", "confirmed", [
            "“If we switch the model off, every home quote goes to manual underwriting. We can do about a third of today's volume. Brokers will send the rest to competitors by Friday.”",
            "”Om vi stänger av modellen går varje offert för hemförsäkring till manuell riskbedömning. Vi klarar ungefär en tredjedel av dagens volym. Mäklarna skickar resten till konkurrenterna senast på fredag.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Can you remove the effect without removing the model?", "Kan ni ta bort effekten utan att ta bort modellen?", ["devLead"]),
            q("How quickly could you show, with evidence, that a fix works?", "Hur snabbt skulle ni kunna visa, med belägg, att en åtgärd fungerar?", ["devLead", "serviceOwner"]),
            q("Knowing the report is genuine, does your answer to the journalist still stand?", "Med vetskap om att rapporten är äkta, står ert svar till journalisten sig?", ["comms"], "d1")
          ],
          executive: [
            q("Who accepted “known issue”, and who should have been asked?", "Vem accepterade ”känt problem”, och vem borde ha tillfrågats?", ["ceo", "legal"]),
            q("Is running a model you know is unfair a business risk or a legal one?", "Är det en affärsrisk eller en juridisk risk att köra en modell ni vet är orättvis?", ["legal", "cfo"]),
            q("Would you give the journalist the same answer now?", "Skulle ni ge journalisten samma svar nu?", ["ceo"], "d1")
          ]
        },
        challenges: [ch("The product owner says competitors' models probably do the same, and nobody else is being asked.", "Produktägaren säger att konkurrenternas modeller troligen gör likadant, och att ingen annan blir tillfrågad.")],
        decision: dec("d2", "ceo", ["What happens to the model today?", "Vad händer med modellen i dag?"], [
          ["Switch it off and underwrite manually, accepting that two-thirds of quotes will wait.", "Stäng av den och gör riskbedömningen manuellt, med insikten att två tredjedelar av offerterna får vänta."],
          ["Keep it, but send every refusal in the flagged areas to a human underwriter.", "Behåll den, men skicka varje avslag i de flaggade områdena till en mänsklig handläggare."],
          ["Keep it running unchanged while an independent audit confirms the finding.", "Låt den gå oförändrad medan en oberoende granskning bekräftar resultatet."]
        ], {
          knowns: [["Your own test found the model refuses some areas far more often.", "Ert eget test visade att modellen nekar vissa områden betydligt oftare."]],
          uncertainties: [["Whether a quick fix would remove the effect or only move it.", "Om en snabb åtgärd skulle ta bort effekten eller bara flytta den."]],
          tradeoffs: {
            operational: ["Manual underwriting handles only a third of the volume.", "Manuell riskbedömning klarar bara en tredjedel av volymen."],
            security: ["The model is the cause, not a victim.", "Modellen är orsaken, inte ett offer."],
            legal: ["Every refusal from now on is made with knowledge of the bias.", "Varje avslag från och med nu görs med vetskap om snedvridningen."],
            reputational: ["The story tomorrow will ask what you did today.", "Morgondagens artikel kommer att fråga vad ni gjorde i dag."]
          },
          evaluation: [["Stops knowingly unfair decisions from today, without pretending the cost is zero", "Stoppar medvetet orättvisa beslut från i dag, utan att låtsas att kostnaden är noll"]]
        }),
        facilitator: fac(
          ["The comfortable belief has collapsed. Watch for the room reaching for “everyone does it”.", "Den bekväma föreställningen har rasat. Se om rummet griper efter ”alla gör så”."],
          ["Stop the harm today, by switching off or by human review of refusals, and own the earlier decision.", "Stoppa skadan i dag, genom avstängning eller mänsklig granskning av avslag, och ta ansvar för det tidigare beslutet."],
          [["Ask: if a customer refused this afternoon asked why, what would you tell them?", "Fråga: om en kund som nekas i eftermiddag frågar varför, vad skulle ni säga då?"]]
        )
      },
      {
        id: "p3",
        clock: 300,
        title: L(["The shared folder", "Den delade mappen"]),
        twist: L(["The leak came from a data scientist's personal cloud folder, shared by link. Besides the report, it held a training extract with {{num.extract|number}} customers' names, addresses and claims histories.", "Läckan kom från en dataforskares privata molnmapp, delad via länk. Utöver rapporten innehöll den ett träningsutdrag med {{num.extract|number}} kunders namn, adresser och skadehistorik."]),
        twistKind: "scope",
        reconsider: { decision: "d1", pressure: { en: "The folder also held real customer data, so this is a breach as well as a story. Does what you told the journalist this morning still sit right with what you now have to tell customers?", sv: "Mappen innehöll också verkliga kunduppgifter, så det här är en läcka lika mycket som en artikel. Går det ni sa till journalisten i morse fortfarande ihop med det ni nu måste säga till kunderna?" } },
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because the model was switched off, home quotes now take three days instead of three minutes, and two large brokers have started sending business elsewhere.", sv: "Eftersom modellen stängdes av tar offerter för hemförsäkring nu tre dagar i stället för tre minuter, och två stora mäklare har börjat skicka affärer någon annanstans." } }
        ],
        assumptionChallenged: L(["Only internal documents leaked.", "Det var bara interna dokument som läckte."]),
        reveals: ["hf-extract"],
        narrative: L([
          "{{time.T+300|clock}}. {{person.ciso.name}}'s team has traced the documents. A data scientist synced the whole project wiki to a personal cloud folder to work from home, and shared the folder by link with a colleague at a research partner. The link has since travelled.\n\nThe folder's access log shows dozens of downloads from unknown addresses. Inside it, next to the fairness report, sits a training extract: real customers, real addresses, real claims.",
          "Klockan {{time.T+300|clock}}. {{person.ciso.name}}s team har spårat dokumenten. En dataforskare synkade hela projektets wiki till en privat molnmapp för att kunna arbeta hemifrån, och delade mappen via länk med en kollega hos en forskningspartner. Länken har sedan spridits vidare.\n\nMappens åtkomstlogg visar dussintals nedladdningar från okända adresser. I mappen, bredvid rapporten om likabehandling, ligger ett träningsutdrag: verkliga kunder, verkliga adresser, verkliga skador."
        ]),
        injects: [
          inj("i3-1", 300, "forensicFinding", "forensics", "high", "confirmed", [
            "Shared folder: link-sharing enabled 11 weeks ago. 47 downloads from 31 addresses. Contents include training_extract.csv: {{num.extract|number}} rows, name, address, policy type, claims history.",
            "Delad mapp: delning via länk aktiverad för 11 veckor sedan. 47 nedladdningar från 31 adresser. Innehållet omfattar training_extract.csv: {{num.extract|number}} rader, namn, adress, försäkringstyp, skadehistorik."
          ], { reveals: ["hf-extract"], tests: ["lo3"] }),
          inj("i3-2", 320, "chat", "person.devLead", "medium", "disputed", [
            "“The extract was pseudonymised for training. It's not really personal data.”",
            "”Utdraget var pseudonymiserat för träning. Det är egentligen inte personuppgifter.”"
          ], { facilitatorNote: ["Names and addresses are in the file; pseudonymised data is still personal data, and this file is not even that.", "Namn och adresser finns i filen; pseudonymiserade uppgifter är fortfarande personuppgifter, och den här filen är inte ens det."], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How do you close the link and find every copy you can?", "Hur stänger ni länken och hittar varje kopia ni kan?", ["ciso"]),
            q("Is the extract personal data, whatever it was called?", "Är utdraget personuppgifter, vad det än kallades?", ["dpo"]),
            q("Did your decision on the model this morning make the folder easier or harder to explain?", "Gjorde ert beslut om modellen i morse mappen lättare eller svårare att förklara?", ["devLead"], "d2")
          ],
          executive: [
            q("What do you do about the data scientist who shared the folder?", "Vad gör ni med dataforskaren som delade mappen?", ["hr", "ciso"]),
            q("Who tells the customers in the extract, and with what words?", "Vem informerar kunderna i utdraget, och med vilka ord?", ["comms", "dpo"]),
            q("Looking at the brokers' reaction, was your call on the model the right one?", "Med mäklarnas reaktion framför er, var ert beslut om modellen rätt?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("The data scientist who shared the folder is also the one who wrote the fairness warning.", "Dataforskaren som delade mappen är också den som skrev varningen om likabehandling.")],
        decision: dec("d3", "dpo", ["How do you handle the customer data in the folder?", "Hur hanterar ni kunduppgifterna i mappen?"], [
          ["Notify {{reg.dpaShort}} today and tell every customer in the extract, plainly, what was exposed.", "Anmäl till {{reg.dpaShort}} i dag och berätta rakt för varje kund i utdraget vad som exponerades."],
          ["Notify {{reg.dpaShort}} today, and tell customers once you know how far the link travelled.", "Anmäl till {{reg.dpaShort}} i dag, och informera kunderna när ni vet hur långt länken spreds."],
          ["Close the link and notify {{reg.dpaShort}}, but hold customer letters until after the article, so the two stories do not merge.", "Stäng länken och anmäl till {{reg.dpaShort}}, men vänta med kundbreven till efter artikeln, så att de två historierna inte flyter ihop."]
        ], {
          knowns: [["A link-shared folder exposed real customers' claims histories to dozens of unknown downloads.", "En mapp delad via länk exponerade verkliga kunders skadehistorik för dussintals okända nedladdningar."]],
          uncertainties: [["Who now holds copies.", "Vem som nu har kopior."]],
          tradeoffs: {
            operational: ["Telling tens of thousands of customers takes days and staff.", "Att informera tiotusentals kunder tar dagar och personal."],
            security: ["Copies already downloaded cannot be pulled back.", "Kopior som redan laddats ner kan inte dras tillbaka."],
            legal: ["Timing letters around press coverage is hard to defend later.", "Att tajma breven efter pressbevakningen är svårt att försvara i efterhand."],
            reputational: ["Two stories at once may be worse than one; so may a hidden one.", "Två historier på en gång kan vara värre än en; det kan också en dold vara."]
          },
          evaluation: [["Treats the data leak on its own merits, not as a side note to the press story", "Behandlar dataläckan för vad den är, inte som en fotnot till pressberättelsen"]]
        }),
        facilitator: fac(
          ["The person who raised the warning is also the person who caused the leak. Watch whether the room wants a culprit.", "Personen som slog larm är också personen som orsakade läckan. Se om rummet vill ha en syndabock."],
          ["Notify promptly, tell affected customers, and handle the employee proportionately.", "Anmäl snabbt, informera berörda kunder och hantera medarbetaren proportionerligt."],
          [["Ask: does the warning she wrote change how you treat the folder she shared?", "Fråga: ändrar varningen hon skrev hur ni behandlar mappen hon delade?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 2880,
        title: L(["The people already told no", "De som redan fått nej"]),
        twist: L(["The article runs. By noon the consumer authority and {{reg.supervisor}} have both opened inquiries, and your own analysts estimate that {{num.declined|number}} applicants over two years may have been refused cover, or priced out, unfairly.", "Artikeln publiceras. Vid lunch har både konsumentmyndigheten och {{reg.supervisor}} inlett granskningar, och era egna analytiker uppskattar att {{num.declined|number}} sökande under två år kan ha nekats försäkring, eller prissatts bort, på felaktiga grunder."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because every customer in the extract was told, a consumer group has started collecting names for a joint claim, and links your letter to the article.", sv: "Eftersom varje kund i utdraget informerades har en konsumentgrupp börjat samla namn till en gemensam talan, och kopplar ihop ert brev med artikeln." } }
        ],
        assumptionChallenged: L(["The harm is a future risk.", "Skadan är en framtida risk."]),
        narrative: L([
          "{{time.T+2880|weekday|cap}}. The article is on the front page, with a photograph of a street in one of the flagged areas. Two inquiry letters arrive before noon.\n\nThe analysts have run the numbers backwards. Over two years, {{num.declined|number}} applicants in the flagged areas were refused or quoted a price that made them walk away. Some of them will have gone without home insurance; a few may since have had a fire or a flood.",
          "{{time.T+2880|weekday|cap}}. Artikeln ligger på förstasidan, med en bild från en gata i ett av de flaggade områdena. Två brev om granskning kommer före lunch.\n\nAnalytikerna har räknat baklänges. Under två år nekades {{num.declined|number}} sökande i de flaggade områdena, eller fick ett pris som fick dem att avstå. En del av dem har levt utan hemförsäkring; några kan sedan dess ha haft en brand eller en översvämning."
        ]),
        injects: [
          inj("i4-1", 2880, "regulatorLetter", "regulator", "high", "confirmed", [
            "Inquiry: the authority requests the model's documentation, the fairness review, the decision to launch with a known issue, and the number of affected applicants, within ten working days.",
            "Granskning: myndigheten begär modellens dokumentation, granskningen av likabehandling, beslutet att lansera med ett känt problem och antalet berörda sökande, inom tio arbetsdagar."
          ], { tests: ["lo4"] }),
          inj("i4-2", 2900, "customerComplaint", "customer", "medium", "unverified", [
            "“I was refused home insurance by you last year and couldn't get it anywhere for the price. In March we had a water leak and paid for everything ourselves. Was that because of where I live?”",
            "”Jag nekades hemförsäkring av er förra året och kunde inte få någon annanstans till det priset. I mars fick vi en vattenläcka och betalade allt själva. Var det på grund av var jag bor?”"
          ], { facilitatorNote: ["Not every refusal was unfair; some will have been right. The room must decide how to tell them apart.", "Alla avslag var inte orättvisa; en del var riktiga. Rummet måste avgöra hur de ska skiljas åt."], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you tell an unfair refusal from a fair one, two years later?", "Hur skiljer ni ett orättvist avslag från ett rättvist, två år senare?", ["devLead", "serviceOwner"]),
            q("What data do you still have about applicants who were refused?", "Vilka uppgifter har ni fortfarande om sökande som nekades?", ["dpo"]),
            q("Did the way you handled the folder's customers this week help you now, or hurt you?", "Hjälpte eller stjälpte ert sätt att hantera mappens kunder i veckan nu?", ["dpo"], "d3")
          ],
          executive: [
            q("What do you owe someone who had no insurance when their house flooded?", "Vad är ni skyldiga någon som saknade försäkring när huset översvämmades?", ["ceo", "legal"]),
            q("Do you wait for the regulators, or act before they tell you to?", "Väntar ni på myndigheterna, eller agerar ni innan de säger åt er?", ["ceo"]),
            q("Would you handle the folder's customers the same way, now that the joint claim exists?", "Skulle ni hantera mappens kunder på samma sätt, nu när den gemensamma talan finns?", ["dpo"], "d3")
          ]
        },
        challenges: [ch("Finance estimates that re-reviewing every refusal would cost more than the model saved in its first year.", "Ekonomi uppskattar att en omprövning av varje avslag skulle kosta mer än vad modellen sparade det första året.")],
        decision: dec("d4", "ceo", ["How do you put right the refusals?", "Hur rättar ni till avslagen?"], [
          ["Re-review every refusal in the flagged areas over two years, and offer cover, refunds or compensation where it was wrong.", "Ompröva varje avslag i de flaggade områdena under två år, och erbjud försäkring, återbetalning eller ersättning där det blev fel."],
          ["Re-review any refusal on request, and publish clearly how to ask.", "Ompröva varje avslag på begäran, och publicera tydligt hur man ber om det."],
          ["Wait for the regulators' findings and do what they require, so you do not admit more than they establish.", "Vänta på myndigheternas slutsatser och gör det de kräver, så att ni inte medger mer än de fastställer."]
        ], {
          knowns: [["Thousands of applicants may have been refused because of where they live.", "Tusentals sökande kan ha nekats på grund av var de bor."]],
          uncertainties: [["How many refusals were actually wrong, and what each one cost the person.", "Hur många avslag som faktiskt var fel, och vad varje avslag kostade personen."]],
          tradeoffs: {
            operational: ["A full re-review is months of underwriting work.", "En fullständig omprövning är månader av riskbedömningsarbete."],
            security: ["Re-review means contacting people whose data you hold.", "Omprövning innebär att kontakta personer vars uppgifter ni har."],
            legal: ["Acting before the regulators is good faith; it is also an admission.", "Att agera före myndigheterna visar god tro; det är också ett medgivande."],
            reputational: ["People refused because of where they live will not ask twice.", "Den som nekats på grund av var hen bor frågar inte två gånger."]
          },
          evaluation: [["Reaches the people harmed rather than waiting for them to find you", "Når de människor som skadats i stället för att vänta på att de hittar er"]]
        }),
        facilitator: fac(
          ["Cost and admission pull against fairness. The challenge about cost is real, and should be argued.", "Kostnad och medgivande drar mot rättvisa. Utmaningen om kostnaden är verklig, och bör diskuteras."],
          ["Reach out proactively, with a fair way to tell wrong refusals from right ones.", "Ta kontakt självmant, med ett rättvist sätt att skilja felaktiga avslag från riktiga."],
          [["Ask: who will contact the people who stopped trying?", "Fråga: vem kontaktar dem som slutade försöka?"]]
        )
      },
      {
        id: "p5",
        clock: 4320,
        title: L(["Everyone wants a name", "Alla vill ha ett namn"]),
        twist: L(["The data scientist who wrote the warning asks for protection as a whistleblower. The board wants someone held accountable. And the model's vendor refuses to share how the model works, citing trade secrets.", "Dataforskaren som skrev varningen ber om skydd som visselblåsare. Styrelsen vill att någon ställs till svars. Och modellens leverantör vägrar dela hur modellen fungerar, med hänvisning till affärshemligheter."]),
        twistKind: "authority",
        reconsider: { decision: "d2", pressure: { en: "The board asks why a model with a known problem kept running for six months, and what you did with it the day you knew. Do you still stand by that decision?", sv: "Styrelsen frågar varför en modell med ett känt problem fick gå i sex månader, och vad ni gjorde med den den dag ni visste. Står ni fortfarande fast vid det beslutet?" } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because every refusal is being re-reviewed, the underwriting team has paused new business in the flagged areas to cope, and the paper is preparing a follow-up.", sv: "Eftersom varje avslag omprövas har riskbedömningsteamet pausat nya affärer i de flaggade områdena för att hinna med, och tidningen förbereder en uppföljning." } }
        ],
        assumptionChallenged: L(["Accountability means finding the person to blame.", "Ansvarsutkrävande betyder att hitta någon att skylla på."]),
        narrative: L([
          "{{time.T+4320|weekday|cap}}. The data scientist's email to HR is short: she raised the warning, she was overruled, and she now hears that people want her dismissed for the folder. She asks to be treated as a whistleblower.\n\nThe chair of the board wants a name by the next meeting. The vendor's lawyers write that the model's internals are protected and will not be shared with auditors or regulators without a court order.",
          "{{time.T+4320|weekday|cap}}. Dataforskarens mejl till HR är kort: hon slog larm, hon blev överkörd, och nu hör hon att folk vill att hon ska sägas upp för mappen. Hon ber att få behandlas som visselblåsare.\n\nStyrelseordföranden vill ha ett namn till nästa möte. Leverantörens jurister skriver att modellens inre funktion är skyddad och inte kommer att delas med revisorer eller myndigheter utan domstolsbeslut."
        ]),
        injects: [
          inj("i5-1", 4320, "employeeReport", "employee", "high", "confirmed", [
            "“I wrote the fairness review and recommended we did not launch. I was told it was a known issue. I synced the wiki to work on it at home because I was still trying to fix it. I made a mistake with the folder. I am not the reason the model was unfair.”",
            "”Jag skrev granskningen av likabehandling och rekommenderade att vi inte skulle lansera. Jag fick höra att det var ett känt problem. Jag synkade wikin för att arbeta med det hemma eftersom jag fortfarande försökte lösa det. Jag gjorde ett misstag med mappen. Jag är inte orsaken till att modellen var orättvis.”"
          ], { tests: ["lo3"] }),
          inj("i5-2", 4350, "email", "vendor", "medium", "confirmed", [
            "Vendor: “The model architecture and weights are trade secrets. We can provide a summary statement of compliance. We cannot provide access to auditors or regulators without a court order.”",
            "Leverantören: ”Modellens arkitektur och vikter är affärshemligheter. Vi kan tillhandahålla en sammanfattande försäkran om regelefterlevnad. Vi kan inte ge revisorer eller myndigheter åtkomst utan domstolsbeslut.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Can you show a regulator how the model decides without the vendor's help?", "Kan ni visa en myndighet hur modellen fattar beslut utan leverantörens hjälp?", ["devLead"]),
            q("What does your contract say about audits and access?", "Vad säger ert avtal om granskning och åtkomst?", ["legal"]),
            q("Is the re-review of refusals still the right plan, with new business paused?", "Är omprövningen av avslagen fortfarande rätt plan, nu när nya affärer är pausade?", ["serviceOwner"], "d4")
          ],
          executive: [
            q("Who made the decision to launch with a known issue, and what happens to them?", "Vem fattade beslutet att lansera med ett känt problem, och vad händer med dem?", ["ceo", "hr"]),
            q("Can you protect the person who warned you and still deal with the folder?", "Kan ni skydda den som varnade er och ändå hantera mappen?", ["hr", "legal"]),
            q("Looking at the pause in new business, would you put the refusals right in the same way?", "Med pausen i nya affärer framför er, skulle ni rätta till avslagen på samma sätt?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("A board member suggests the quickest way to close the story is for the data scientist to leave quietly with a settlement.", "En styrelseledamot föreslår att det snabbaste sättet att stänga historien är att dataforskaren lämnar i tysthet med en uppgörelse.")],
        decision: dec("d5", "ceo", ["How do you handle accountability?", "Hur hanterar ni ansvarsfrågan?"], [
          ["Protect the whistleblower, give the board an independent review of the launch decision, and force vendor access through the contract.", "Skydda visselblåsaren, ge styrelsen en oberoende granskning av lanseringsbeslutet och tvinga fram leverantörens medverkan via avtalet."],
          ["Let the risk function review the launch decision internally, and handle the folder as a separate HR matter.", "Låt riskfunktionen granska lanseringsbeslutet internt, och hantera mappen som ett separat HR-ärende."],
          ["Hire an external law firm for a board-led review, with the vendor under a confidentiality agreement and the data scientist on paid leave.", "Anlita en extern advokatbyrå för en styrelseledd granskning, med leverantören under sekretessavtal och dataforskaren tjänstledig med lön."]
        ], {
          knowns: [["The warning was written, overruled, and then leaked by the person who wrote it.", "Varningen skrevs, kördes över och läckte sedan genom den person som skrev den."]],
          uncertainties: [["Whether the vendor can be made to open the model at all.", "Om leverantören över huvud taget kan förmås att öppna modellen."]],
          tradeoffs: {
            operational: ["An independent review takes months and needs the vendor's cooperation.", "En oberoende granskning tar månader och kräver leverantörens medverkan."],
            security: ["The folder was a real breach, whatever the motive.", "Mappen var en verklig läcka, oavsett motiv."],
            legal: ["Retaliation against a whistleblower would be a second scandal.", "Repressalier mot en visselblåsare vore en andra skandal."],
            reputational: ["The board wants a name; the public will judge the name you pick.", "Styrelsen vill ha ett namn; allmänheten kommer att bedöma namnet ni väljer."]
          },
          evaluation: [["Holds the decision-makers to account rather than the person who warned them", "Ställer beslutsfattarna till svars i stället för den som varnade dem"]]
        }),
        facilitator: fac(
          ["This stage tests courage more than process. The settlement suggestion is tempting and corrosive.", "Den här etappen prövar mod mer än process. Förslaget om en uppgörelse är lockande och frätande."],
          ["Protect the warning-giver, review the decision that overruled her, and make the vendor accountable.", "Skydda den som varnade, granska beslutet som körde över henne och ställ leverantören till svars."],
          [["Ask: what will the next person with a warning learn from what you do now?", "Fråga: vad lär sig nästa person med en varning av det ni gör nu?"]]
        )
      },
      {
        id: "p6",
        clock: 20160,
        title: L(["Not only our model", "Inte bara vår modell"]),
        twist: L(["The vendor's model, in the same version, prices home insurance at two other insurers, and the regulator now treats it as a market-wide question. Your own inventory finds nine more models in use that nobody has tested for fairness.", "Leverantörens modell, i samma version, prissätter hemförsäkring hos två andra bolag, och myndigheten behandlar det nu som en fråga för hela marknaden. Er egen inventering hittar nio modeller till i drift som ingen har testat för likabehandling."]),
        twistKind: "scope",
        reconsider: { decision: "d4", pressure: { en: "The regulator now asks every insurer using the model how it put things right. Will your answer on the refusals stand next to theirs?", sv: "Myndigheten frågar nu varje bolag som använder modellen hur det rättade till följderna. Kommer ert svar om avslagen att hålla bredvid deras?" } },
        branches: [
          { when: { decision: "d5", option: "A" }, narrativeAppend: { en: "Because you forced the vendor through the contract, it has opened the model to auditors, and given notice that it will not renew the agreement.", sv: "Eftersom ni tvingade leverantören via avtalet har den öppnat modellen för revisorerna, och samtidigt meddelat att den inte förnyar avtalet." } }
        ],
        assumptionChallenged: L(["This was one model's problem.", "Det här var en enskild modells problem."]),
        reveals: ["hf-vendor"],
        narrative: L([
          "{{time.T+20160|weekday|cap}}, two weeks on. The regulator's second letter is addressed to every insurer using the vendor's model. Industry colleagues call {{person.ceo.name}} to ask what you found, and how.\n\nInside {{org.name}}, a quick inventory has found nine other models making or shaping decisions about customers: claims triage, fraud scoring, customer service routing. None of them has been tested for fairness. The question is no longer one model.",
          "{{time.T+20160|weekday|cap}}, två veckor senare. Myndighetens andra brev är adresserat till varje bolag som använder leverantörens modell. Kollegor i branschen ringer {{person.ceo.name}} och frågar vad ni hittade, och hur.\n\nInom {{org.name}} har en snabb inventering hittat nio andra modeller som fattar eller påverkar beslut om kunder: sortering av skadeärenden, bedrägeribedömning, styrning av kundtjänst. Ingen av dem har testats för likabehandling. Frågan gäller inte längre en enda modell."
        ]),
        injects: [
          inj("i6-1", 20160, "regulatorLetter", "regulator", "high", "confirmed", [
            "Letter to all firms using pricing model v2: describe your use of the model, your testing for unfair outcomes, and your process for approving models that affect customers.",
            "Brev till alla bolag som använder prismodell v2: beskriv er användning av modellen, er testning av orättvisa utfall och er process för att godkänna modeller som påverkar kunder."
          ], { reveals: ["hf-vendor"], tests: ["lo2"] }),
          inj("i6-2", 20200, "impactReport", "person.ciso", "medium", "confirmed", [
            "Model inventory: 10 models affecting customers (including pricing v2). Owners named for 4. Fairness tested: 1 (pricing v2, issue accepted). Human review of adverse decisions: 0.",
            "Modellinventering: 10 modeller som påverkar kunder (inklusive prismodell v2). Ägare utsedd för 4. Testade för likabehandling: 1 (prismodell v2, problemet accepterat). Mänsklig granskning av negativa beslut: 0."
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What would a fairness test before launch have needed to stop this one?", "Vad hade ett test av likabehandling före lansering behövt för att stoppa den här?", ["devLead"]),
            q("Which of the nine other models worries you most, and why?", "Vilken av de nio andra modellerna oroar er mest, och varför?", ["devLead", "ciso"]),
            q("Did your re-review of refusals hold up once others had to answer the same question?", "Höll er omprövning av avslagen när andra fick svara på samma fråga?", ["serviceOwner"], "d4")
          ],
          executive: [
            q("Who should be able to stop a model from launching, and do they have that power today?", "Vem ska kunna stoppa en modell från att lanseras, och har de den makten i dag?", ["ceo", "legal"]),
            q("Do you share what you learned with competitors?", "Delar ni det ni har lärt er med konkurrenterna?", ["ceo", "comms"]),
            q("Was the way you handled accountability worth losing the vendor?", "Var ert sätt att hantera ansvarsfrågan värt att förlora leverantören?", ["ceo"], "d5")
          ]
        },
        challenges: [ch("Product managers warn that fairness tests with a veto will slow every launch by months.", "Produktansvariga varnar för att tester av likabehandling med vetorätt kommer att försena varje lansering med månader.")],
        decision: dec("d6", "ceo", ["What do you change in how you use models?", "Vad ändrar ni i hur ni använder modeller?"], [
          ["A model inventory with owners, fairness tests that can stop a launch, and human review of every refusal.", "En modellinventering med ägare, tester av likabehandling som kan stoppa en lansering och mänsklig granskning av varje avslag."],
          ["An annual external audit of every model that affects customers.", "En årlig extern granskning av varje modell som påverkar kunder."],
          ["Stop using automated models for underwriting decisions altogether.", "Sluta helt använda automatiska modeller för beslut om riskbedömning."]
        ], {
          knowns: [["Ten models affect customers; one was tested, and its warning was overruled.", "Tio modeller påverkar kunder; en testades, och dess varning kördes över."]],
          uncertainties: [["How much a real veto will slow the business.", "Hur mycket en verklig vetorätt kommer att bromsa verksamheten."]],
          tradeoffs: {
            operational: ["A veto slows launches; no veto repeats this.", "En vetorätt bromsar lanseringar; ingen vetorätt upprepar det här."],
            security: ["Models are now part of your risk register.", "Modeller är nu en del av ert riskregister."],
            legal: ["Regulators are moving towards requiring exactly this.", "Myndigheterna rör sig mot att kräva just detta."],
            reputational: ["The next model problem will be judged against this one.", "Nästa modellproblem kommer att bedömas mot det här."]
          },
          evaluation: [["Gives someone the power to stop a harmful model before it reaches customers", "Ger någon makten att stoppa en skadlig modell innan den når kunderna"]]
        }),
        facilitator: fac(
          ["End where it started: a warning that existed and had no power. The question is who will hold that power now.", "Avsluta där det började: en varning som fanns men saknade kraft. Frågan är vem som ska ha den makten nu."],
          ["Inventory, ownership, tests with teeth, and human review of adverse decisions.", "Inventering, ägarskap, tester med verklig verkan och mänsklig granskning av negativa beslut."],
          [["Ask: if the warning comes again next year, what stops it being parked?", "Fråga: om varningen kommer igen nästa år, vad hindrar att den läggs på hyllan?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The model is under control and the refusals are being put right, but the leaked customer data cannot be recalled, the vendor relationship is ending, and nine other models are waiting for the same questions.",
        "Modellen är under kontroll och avslagen håller på att rättas till, men de läckta kunduppgifterna går inte att återkalla, leverantörsrelationen håller på att avslutas, och nio andra modeller väntar på samma frågor."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Read your own evidence before you defend a system in public.", "Läs era egna belägg innan ni försvarar ett system offentligt."]),
        L(["A model can discriminate through proxies without ever seeing the protected trait.", "En modell kan diskriminera via ersättningsvariabler utan att någonsin se den skyddade egenskapen."]),
        L(["A leak and an ethics failure can be one incident; handle both on their own merits.", "En läcka och ett etiskt misslyckande kan vara en och samma incident; hantera båda för vad de är."]),
        L(["Warnings without the power to stop a launch are only paperwork.", "Varningar utan makt att stoppa en lansering är bara pappersarbete."])
      ],
      assumptionsVsReality: [
        avr(["A model without addresses cannot treat neighbourhoods differently.", "En modell utan adresser kan inte behandla bostadsområden olika."], ["Proxies reproduced the neighbourhood lines, and your test showed it.", "Ersättningsvariabler återskapade områdesgränserna, och ert test visade det."], "p2"),
        avr(["Only internal documents leaked.", "Det var bara interna dokument som läckte."], ["Real customers' claims histories were in the same folder.", "Verkliga kunders skadehistorik låg i samma mapp."], "p3"),
        avr(["The harm is a future risk.", "Skadan är en framtida risk."], ["Thousands were already refused.", "Tusentals hade redan nekats."], "p4")
      ],
      strengthsToLookFor: [
        L(["Reading the report before answering the press", "Att läsa rapporten innan pressen får svar"]),
        L(["Stopping knowingly unfair decisions on the day they were known", "Att stoppa medvetet orättvisa beslut samma dag som det blev känt"]),
        L(["Protecting the person who raised the warning", "Att skydda personen som slog larm"])
      ],
      commonGaps: [
        L(["Defending the model on the strength of its inputs", "Att försvara modellen med hänvisning till dess indata"]),
        L(["Treating the leaked extract as a side issue", "Att behandla det läckta utdraget som en bisak"]),
        L(["Looking for a culprit instead of the decision that overruled the warning", "Att leta efter en syndabock i stället för beslutet som körde över varningen"])
      ],
      suggestedActions: [
        act(["Keep an inventory of every model that affects customers, with a named owner.", "För en förteckning över varje modell som påverkar kunder, med en utsedd ägare."], "cio", "high"),
        act(["Test models for unfair outcomes before launch, with the power to stop the launch.", "Testa modeller för orättvisa utfall före lansering, med makt att stoppa lanseringen."], "devLead", "high"),
        act(["Require audit and regulator access in every model vendor contract.", "Kräv granskningsrätt och åtkomst för myndigheter i varje avtal med modelleverantörer."], "legal", "medium"),
        act(["Block link-sharing of company data to personal cloud storage.", "Blockera delning via länk av bolagets data till privat molnlagring."], "ciso", "medium")
      ]
    }
  });
})();
