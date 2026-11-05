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
  const { L, q, ch, inj, dec, fac, act, avr, pb, ir, io } = BK.scenarios.h;

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
          evaluation: [["Says nothing it will have to retract, and reads the report before defending the model", "Säger inget som måste tas tillbaka, och läser rapporten innan modellen försvaras"]],
          pushback: {
            A: [
              pb(["Nobody has read it", "Ingen har läst den"], ["You have confirmed the report is genuine, but nobody in the room has read past its title. The journalist now asks which of its findings you accept. Do you answer questions about a document you have just vouched for without knowing what it says?", "Ni har bekräftat att rapporten är äkta, men ingen i rummet har läst längre än till rubriken. Nu frågar journalisten vilka av dess slutsatser ni godtar. Svarar ni på frågor om ett dokument ni just gått i god för, utan att veta vad det står i det?"]),
              pb(["Data science objects", "Datateamet protesterar"], ["{{person.devLead.name}} is furious: by saying the model is under urgent review, you have told the country it is suspect, when it has never seen an address. The team wants the statement corrected. Do you stand by the review, or soften it to keep your own experts with you?", "{{person.devLead.name}} är rasande: genom att säga att modellen granskas skyndsamt har ni talat om för hela landet att den är misstänkt, trots att den aldrig sett en adress. Teamet vill att uttalandet rättas. Står ni fast vid granskningen, eller tonar ni ner den för att behålla era egna experter?"]),
              pb(["A date in print", "Ett datum i tryck"], ["The journalist asks when the full answer will come, and will print whatever date you give. Data science says a proper review takes weeks, not days. What deadline do you commit to in public, knowing you may miss it?", "Journalisten frågar när det fullständiga svaret kommer, och kommer att trycka det datum ni anger. Datateamet säger att en ordentlig granskning tar veckor, inte dagar. Vilken tidpunkt lovar ni offentligt, med vetskap om att ni kan missa den?"])
            ],
            B: [
              pb(["The paper will not wait", "Tidningen väntar inte"], ["The journalist replies within minutes: the article runs tomorrow as planned, with the line “the company declined to comment”. Your 48 hours buy nothing in print. Do you stay silent, or say something before the deadline?", "Journalisten svarar inom några minuter: artikeln publiceras i morgon som planerat, med raden ”bolaget avböjer att kommentera”. Era 48 timmar köper ingenting i tryck. Håller ni tyst, eller säger ni något före deadline?"]),
              pb(["The residents ask", "De boende frågar"], ["A residents' association in one of the named areas has heard about the enquiry and asks you directly whether its neighbours are refused because of where they live. “No comment for 48 hours” will be read out at their meeting tonight. What do you tell them that you will not tell the paper?", "En boendeförening i ett av de utpekade områdena har hört talas om frågan och undrar direkt om grannarna nekas på grund av var de bor. ”Ingen kommentar på 48 timmar” kommer att läsas upp på deras möte i kväll. Vad säger ni till dem som ni inte säger till tidningen?"]),
              pb(["Selling while you verify", "Säljer medan ni verifierar"], ["For the next 48 hours the model keeps quoting and refusing home insurance as usual. If the documents prove right, every refusal in that window was made after you had been warned. Do you keep selling as normal while you check?", "Under de kommande 48 timmarna fortsätter modellen att lämna offerter och neka hemförsäkring som vanligt. Om dokumenten visar sig stämma gjordes varje avslag under den tiden efter att ni blivit varnade. Fortsätter ni sälja som vanligt medan ni kontrollerar?"])
            ],
            C: [
              pb(["Out of which context?", "Ur vilket sammanhang?"], ["The journalist asks a simple follow-up: then what is the context? Send us the full report. Nobody in the room has read it. Do you send a document you have not read, or admit your denial rests on one team's word?", "Journalisten ställer en enkel följdfråga: vilket är då sammanhanget? Skicka hela rapporten. Ingen i rummet har läst den. Skickar ni ett dokument ni inte har läst, eller medger ni att ert förnekande vilar på ett enda teams ord?"]),
              pb(["Comms will not sign", "Kommunikation skriver inte under"], ["{{person.comms.name}} refuses to put their name to “out of context” before reading the report, because the phrase will be quoted word for word. Do you overrule your head of communications, or miss the deadline with no answer?", "{{person.comms.name}} vägrar stå för ”taget ur sitt sammanhang” innan rapporten är läst, eftersom formuleringen kommer att citeras ordagrant. Kör ni över er kommunikationschef, eller missar ni deadline utan svar?"]),
              pb(["Inputs are not outcomes", "Indata är inte utfall"], ["A junior analyst points out quietly that “no addresses” describes what goes into the model, not whom it refuses. Nobody in the room has looked at refusal rates by area. Do you still put your name to a statement about outcomes you have never checked?", "En yngre analytiker påpekar försiktigt att ”inga adresser” beskriver vad som går in i modellen, inte vilka den nekar. Ingen i rummet har tittat på avslagsfrekvensen per område. Står ni ändå för ett uttalande om utfall som ni aldrig har kontrollerat?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "C" }, ["The denial is on record", "Förnekandet är registrerat"], [
              io(["Printed in full", "Trycks i sin helhet"], ["The journalist thanks you and says your denial will run in full, high up in the article. {{person.devLead.name}}'s team is relieved. Nobody has yet opened the report itself.", "Journalisten tackar och säger att ert förnekande kommer att återges i sin helhet, högt upp i artikeln. {{person.devLead.name}}s team andas ut. Ingen har ännu öppnat själva rapporten."], ["Your denial will be printed in full; nobody has read the report.", "Ert förnekande trycks i sin helhet; ingen har läst rapporten."]),
              io(["Your own figures", "Era egna siffror"], ["The journalist replies with one question: the documents include your own table of refusal rates by area, so which part is out of context? {{person.comms.name}} says the statement cannot be defended as written.", "Journalisten svarar med en enda fråga: dokumenten innehåller er egen tabell över avslag per område, så vilken del är tagen ur sitt sammanhang? {{person.comms.name}} säger att uttalandet inte går att försvara i sin nuvarande form."], ["The journalist has answered your denial with your own refusal figures.", "Journalisten har bemött ert förnekande med era egna avslagssiffror."], { reopen: true, meters: { media: 1 } }),
              io(["A second newspaper", "En andra tidning"], ["Another newspaper calls about the same documents and quotes your denial back to you. Nobody can tell whether the documents have spread or the first paper passed on your statement.", "En annan tidning ringer om samma dokument och citerar ert förnekande. Ingen kan avgöra om dokumenten har spridits eller om den första tidningen har skickat vidare ert uttalande."], ["A second newspaper is asking about the same documents.", "En andra tidning ställer frågor om samma dokument."], { meters: { media: 1 } })
            ]),
            ir("i2", { notChosen: "C" }, ["No denial on record", "Inget förnekande registrerat"], [
              io(["A softer headline", "En mildare rubrik"], ["The journalist says your measured reply will be quoted, and the working headline has changed from “refuses” to “questions over”. Some in the room take this as proof the story is weaker than feared.", "Journalisten säger att ert avvägda svar kommer att citeras, och arbetsrubriken har ändrats från ”nekar” till ”frågetecken kring”. Några i rummet ser det som ett bevis på att artikeln är svagare än befarat."], ["The paper has softened its working headline after your reply.", "Tidningen har mildrat sin arbetsrubrik efter ert svar."]),
              io(["A broker wants assurance", "En mäklare vill ha besked"], ["Your largest broker has heard a story is coming and wants written assurance today that the model does not take account of where people live. Without it, the broker will pause new home business with you.", "Er största mäklare har hört att en artikel är på väg och vill ha en skriftlig försäkran i dag om att modellen inte tar hänsyn till var folk bor. Utan den pausar mäklaren nya hemförsäkringar hos er."], ["The largest broker wants written assurance about the model today.", "Den största mäklaren vill ha en skriftlig försäkran om modellen i dag."], { reopen: true }),
              io(["Data science feels betrayed", "Datateamet känner sig svikna"], ["{{person.devLead.name}} writes to the whole team that management has thrown the model to the press without evidence. Two senior data scientists ask to be heard before anything more is said.", "{{person.devLead.name}} skriver till hela teamet att ledningen har kastat modellen åt pressen utan belägg. Två seniora dataforskare ber att få bli hörda innan något mer sägs."], ["Data science has protested in writing about how the model was described.", "Datateamet har skriftligt protesterat mot hur modellen beskrevs."])
            ])
          ]
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
          evaluation: [["Stops knowingly unfair decisions from today, without pretending the cost is zero", "Stoppar medvetet orättvisa beslut från i dag, utan att låtsas att kostnaden är noll"]],
          pushback: {
            A: [
              pb(["The queue hits them too", "Kön drabbar dem också"], ["By evening hundreds of home quotes are waiting, and applicants from the flagged areas wait longest, because their files need the most checking. Underwriters are asked to work the weekend. Is a queue that falls hardest on the same neighbourhoods any fairer than the model?", "Till kvällen väntar hundratals offerter, och sökande från de flaggade områdena väntar längst, eftersom deras ärenden kräver mest kontroll. Handläggarna ombeds jobba helgen. Är en kö som slår hårdast mot samma bostadsområden rättvisare än modellen?"]),
              pb(["A broker's ultimatum", "En mäklares ultimatum"], ["Your largest broker says that unless home quotes come back within a day, it will move its whole home book to a competitor. It asks for the model to be switched back on for its customers only. Do you make an exception for one broker, or lose the business?", "Er största mäklare säger att om offerterna inte kommer tillbaka inom ett dygn flyttar den hela sitt bestånd av hemförsäkringar till en konkurrent. Den ber att modellen slås på igen enbart för dess kunder. Gör ni ett undantag för en mäklare, eller förlorar ni affärerna?"]),
              pb(["The manual rules copy it", "Handboken gör likadant"], ["The underwriting manager points out that the manual guidelines also weigh claims density and distance to repair partners. The model was built to match them. Switching it off may not switch off the effect. Do you rewrite the manual rules today too, or accept the same bias at a slower pace?", "Chefen för riskbedömningen påpekar att de manuella riktlinjerna också väger in skadetäthet och avstånd till reparationspartner. Modellen byggdes för att efterlikna dem. Att stänga av den stänger kanske inte av effekten. Skriver ni om de manuella reglerna i dag också, eller godtar ni samma snedvridning i långsammare takt?"])
            ],
            B: [
              pb(["Priced out, not refused", "Bortprissatta, inte nekade"], ["Many applicants in the flagged areas are never refused, only quoted a price no one would accept. Your human review sees refusals only. Do you widen it to high quotes as well, knowing you cannot staff that?", "Många sökande i de flaggade områdena nekas aldrig, de får bara ett pris som ingen skulle godta. Er mänskliga granskning ser bara avslag. Utvidgar ni den till höga offerter också, med vetskap om att ni inte har personal till det?"]),
              pb(["A rubber stamp", "En gummistämpel"], ["The underwriters say they have no guidance on when to overrule the model and only minutes per case. Most say they will simply confirm what it decided. Is a review that agrees with the model every time a safeguard, or cover for it?", "Handläggarna säger att de saknar riktlinjer för när de ska gå emot modellen och bara har några minuter per ärende. De flesta säger att de helt enkelt kommer att bekräfta det modellen bestämt. Är en granskning som alltid håller med modellen ett skydd, eller en täckmantel?"]),
              pb(["Sorting by neighbourhood", "Sortering efter område"], ["Legal points out that sending only applicants from the flagged areas to a human means you are now sorting people by where they live, on purpose. Can you defend treating applicants differently by neighbourhood in order to fix a model that did the same?", "Juristerna påpekar att om bara sökande från de flaggade områdena skickas till en människa sorterar ni nu själva folk efter var de bor, med flit. Kan ni försvara att behandla sökande olika beroende på område för att rätta en modell som gjorde samma sak?"])
            ],
            C: [
              pb(["Months, not days", "Månader, inte dagar"], ["The audit firm can start in three weeks and needs two months. Until then, every refusal is made by a model your own report says should not have launched. How many refusals are you willing to make while you wait?", "Granskningsfirman kan börja om tre veckor och behöver två månader. Fram till dess fattas varje avslag av en modell som er egen rapport säger inte borde ha lanserats. Hur många avslag är ni beredda att fatta medan ni väntar?"]),
              pb(["Your experts dissent", "Era experter reserverar sig"], ["{{person.devLead.name}}, who was sure this morning that the model was clean, now asks for it to be minuted that data science recommends switching it off or adding human review. Do you overrule your own experts in writing?", "{{person.devLead.name}}, som i morse var säker på att modellen var felfri, begär nu att det protokollförs att datateamet rekommenderar avstängning eller mänsklig granskning. Kör ni över era egna experter skriftligt?"]),
              pb(["“Is it still running?”", "”Används den fortfarande?”"], ["The journalist sends one more question before publication: is the model still making decisions today? Whatever you answer will be printed next to the report's conclusion. Can you say “yes, unchanged” in public?", "Journalisten skickar en sista fråga före publicering: fattar modellen fortfarande beslut i dag? Vad ni än svarar trycks bredvid rapportens slutsats. Kan ni säga ”ja, oförändrad” offentligt?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "C" }, ["Still deciding as before", "Beslutar som förut"], [
              io(["Common practice", "Vanlig praxis"], ["The audit firm's partner tells you informally that keeping a model running during an audit is common practice, as long as the decision is minuted. The room relaxes a little.", "Granskningsfirmans delägare säger informellt att det är vanlig praxis att låta en modell gå under en granskning, så länge beslutet protokollförs. Rummet slappnar av något."], ["The auditors call running during an audit common, if minuted.", "Granskarna kallar drift under granskning vanligt, om det protokollförs."]),
              io(["A refusal goes public", "Ett avslag blir offentligt"], ["An applicant from one of the flagged areas is refused this afternoon and posts the automated letter online, with today's date. Comments ask why you are still doing it now that you know.", "En sökande från ett av de flaggade områdena nekas i eftermiddag och lägger ut det automatiska beslutsbrevet på nätet, med dagens datum. Kommentarerna frågar varför ni fortfarande gör så nu när ni vet."], ["An applicant refused today has posted the letter publicly.", "En sökande som nekades i dag har publicerat brevet."], { reopen: true, meters: { trust: -1, media: 1 } }),
              io(["Fewer refusals today", "Färre avslag i dag"], ["Today's refusal rate in the flagged areas is lower than usual. Nobody can tell whether it is chance, or whether brokers have quietly stopped sending applicants from those areas.", "Dagens avslagsfrekvens i de flaggade områdena är lägre än vanligt. Ingen kan avgöra om det är en slump, eller om mäklarna i tysthet har slutat skicka sökande från de områdena."], ["Refusals in the flagged areas dipped today; nobody knows why.", "Avslagen i de flaggade områdena minskade i dag; ingen vet varför."])
            ]),
            ir("i2", { notChosen: "C" }, ["The model is reined in", "Modellen tyglas"], [
              io(["Acted the same day", "Agerade samma dag"], ["When told, the journalist says the article will note that you acted on the day you read the report. Some in the room feel the worst is behind you.", "När journalisten får veta det säger hen att artikeln kommer att nämna att ni agerade samma dag som ni läste rapporten. Några i rummet känner att det värsta är över."], ["The article will say you acted on the day you knew.", "Artikeln kommer att säga att ni agerade samma dag som ni visste."]),
              io(["Humans refuse them too", "Människor nekar dem också"], ["The first cases from the flagged areas decided by underwriters are refused almost as often as before. The manual guidelines weigh the same claims density and repair-partner distance.", "De första ärendena från de flaggade områdena som handläggarna avgör nekas nästan lika ofta som förut. De manuella riktlinjerna väger in samma skadetäthet och avstånd till reparationspartner."], ["The first human decisions refused the flagged areas almost as often.", "De första mänskliga besluten nekade de flaggade områdena nästan lika ofta."], { reopen: true }),
              io(["Brokers notice", "Mäklarna märker det"], ["Within the hour, brokers notice that home quotes have changed. One asks whether something is wrong with the model, and the question is already going round among them.", "Inom en timme märker mäklarna att offerterna för hemförsäkring har ändrats. En av dem frågar om något är fel på modellen, och frågan går redan runt bland dem."], ["Brokers know something has changed with home quotes.", "Mäklarna vet att något har ändrats med offerterna."])
            ])
          ]
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
          evaluation: [["Treats the data leak on its own merits, not as a side note to the press story", "Behandlar dataläckan för vad den är, inte som en fotnot till pressberättelsen"]],
          pushback: {
            A: [
              pb(["The letter tells the story", "Brevet berättar historien"], ["Customer service asks how the letter should explain why a training file with customers' claims existed at all. Any honest answer mentions the fairness work the press is about to write about. Do you tie the two stories together in your own words, or leave customers to make the link?", "Kundtjänst frågar hur brevet ska förklara varför en träningsfil med kunders skador alls fanns. Varje ärligt svar nämner arbetet med likabehandling som pressen snart skriver om. Knyter ni ihop de två historierna med egna ord, eller låter ni kunderna dra slutsatsen själva?"]),
              pb(["“Is my data online?”", "”Ligger mina uppgifter ute?”"], ["{{num.extract|number}} letters will bring thousands of calls, and the contact centre cannot say who downloaded the file or where it went. Staff will have to answer “we don't know” all day. Do you send now with that answer, or wait until you can say more?", "{{num.extract|number}} brev kommer att ge tusentals samtal, och kundtjänst kan inte säga vem som laddade ner filen eller vart den tog vägen. Personalen kommer att få svara ”vi vet inte” hela dagen. Skickar ni nu med det svaret, eller väntar ni tills ni kan säga mer?"]),
              pb(["Old addresses", "Gamla adresser"], ["Many people in the extract left years ago, and some addresses are out of date. A letter about an exposed claims history, sent to an old address, tells a stranger that someone made a claim. Do you still write to everyone today, or slow down to check addresses?", "Många i utdraget slutade vara kunder för flera år sedan, och en del adresser är inaktuella. Ett brev om exponerad skadehistorik till en gammal adress berättar för en främling att någon har haft en skada. Skriver ni ändå till alla i dag, eller saktar ni ner för att kontrollera adresserna?"])
            ],
            B: [
              pb(["You may never know", "Ni får kanske aldrig veta"], ["The cloud provider can give you download addresses, but not who is behind them or where the file went next. “Once you know how far the link travelled” may mean never. When do you write to customers if the answer never comes?", "Molnleverantören kan ge er adresserna bakom nedladdningarna, men inte vem som står bakom dem eller vart filen tog vägen sedan. ”När ni vet hur långt länken spreds” kan betyda aldrig. När skriver ni till kunderna om svaret aldrig kommer?"]),
              pb(["The authority asks why", "Myndigheten frågar varför"], ["{{reg.dpaShort}} acknowledges your notification and asks why the customers have not been told, when dozens of downloads are already confirmed. Your answer goes on file. Can you explain the wait in words you would want read back later?", "{{reg.dpaShort}} bekräftar er anmälan och frågar varför kunderna inte har informerats, när dussintals nedladdningar redan är bekräftade. Ert svar hamnar i akten. Kan ni förklara väntan med ord ni vill få upplästa senare?"]),
              pb(["The journalist has it too", "Journalisten har den också"], ["The journalist got the documents from this folder, so the journalist may also hold the extract. If the paper mentions it first, customers learn about their own data from the press. Do you still wait?", "Journalisten fick dokumenten ur den här mappen, så journalisten kan också ha utdraget. Om tidningen nämner det först får kunderna veta om sina egna uppgifter genom pressen. Väntar ni ändå?"])
            ],
            C: [
              pb(["A direct question", "En rak fråga"], ["The journalist asks whether customer data was in the folder too. If you say yes, the stories merge in print anyway; if you dodge, the dodge becomes the story. What do you answer?", "Journalisten frågar om det också fanns kunduppgifter i mappen. Säger ni ja flyter historierna ihop i tryck ändå; slingrar ni er blir slingrandet historien. Vad svarar ni?"]),
              pb(["The DPO will not sign", "Dataskyddsombudet skriver inte under"], ["{{person.dpo.name}} says that delaying letters to manage press coverage is not a reason the law recognises, and refuses to sign a plan with that timing in it. Do you overrule your data protection officer, or rewrite the reason?", "{{person.dpo.name}} säger att skjuta upp brev för att styra pressbevakningen inte är ett skäl som lagen godtar, och vägrar skriva under en plan med den tidpunkten. Kör ni över ert dataskyddsombud, eller skriver ni om skälet?"]),
              pb(["A customer already knows", "En kund vet redan"], ["A customer calls in: a stranger has sent them a message quoting their own claim from two years ago. They want to know how anyone got it. Do you tell this one customer the truth today, while thousands of others wait for their letters?", "En kund ringer: en främling har skickat ett meddelande som citerar kundens egen skada från för två år sedan. Kunden vill veta hur någon fått tag på den. Berättar ni sanningen för den här kunden i dag, medan tusentals andra väntar på sina brev?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The letters go out", "Breven skickas"], [
              io(["Calmer than feared", "Lugnare än befarat"], ["The first calls are calmer than anyone expected. Several customers say they appreciate hearing it from you first, and the contact centre asks whether the script can stay as it is.", "De första samtalen är lugnare än någon väntat sig. Flera kunder säger att de uppskattar att få höra det från er först, och kundtjänst undrar om manuset kan få vara kvar som det är."], ["Early reactions to the customer letters were calmer than feared.", "De första reaktionerna på kundbreven var lugnare än befarat."]),
              io(["The paper has the letter", "Tidningen har brevet"], ["Within hours a customer forwards your letter to the journalist. The paper now plans to report the exposed customer data alongside the fairness story, in the same article.", "Inom några timmar vidarebefordrar en kund ert brev till journalisten. Tidningen planerar nu att skriva om de exponerade kunduppgifterna tillsammans med granskningen av likabehandling, i samma artikel."], ["The newspaper has a copy of your customer letter.", "Tidningen har en kopia av ert kundbrev."], { meters: { media: 1 } }),
              io(["A stranger's letter", "En främlings brev"], ["A caller says they received a letter about someone else's claims history: the customer moved out years ago. They want to know what else you are sending to the wrong people.", "En person ringer och säger att hen har fått ett brev om någon annans skadehistorik: kunden flyttade för flera år sedan. Hen vill veta vad mer ni skickar till fel personer."], ["At least one letter reached a stranger at an old address.", "Minst ett brev har nått en främling på en gammal adress."], { meters: { trust: -1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["Customers not yet told", "Kunderna vet ännu inget"], [
              io(["The authority acknowledges", "Myndigheten bekräftar"], ["{{reg.dpaShort}} acknowledges your notification and asks for a written follow-up, without comment on how or when you inform customers. Some in the room read that as approval.", "{{reg.dpaShort}} bekräftar er anmälan och ber om en skriftlig uppföljning, utan att kommentera hur eller när ni informerar kunderna. Några i rummet tolkar det som ett godkännande."], ["{{reg.dpaShort}} has acknowledged the notification and wants a written follow-up.", "{{reg.dpaShort}} har bekräftat anmälan och vill ha en skriftlig uppföljning."]),
              io(["Told by someone else", "Fick veta av någon annan"], ["A customer calls: a friend at the research partner has told them their claims history was in a file that leaked. They ask why they heard it from a friend and not from you. Staff have no answer.", "En kund ringer: en vän hos forskningspartnern har berättat att kundens skadehistorik låg i en fil som läckt. Kunden frågar varför hen fick höra det av en vän och inte av er. Personalen har inget svar."], ["One customer learned of the exposure from someone else, not from you.", "En kund fick veta om exponeringen av någon annan, inte av er."], { reopen: true, meters: { trust: -1 } }),
              io(["Downloads stop", "Nedladdningarna upphör"], ["The cloud provider reports no new downloads since the link was found. It cannot say whether interest has faded, or whether copies are now moving somewhere you cannot see.", "Molnleverantören rapporterar inga nya nedladdningar sedan länken hittades. Den kan inte säga om intresset har svalnat, eller om kopior nu sprids någonstans där ni inte ser dem."], ["No new downloads since the link was found; the reason is unknown.", "Inga nya nedladdningar sedan länken hittades; orsaken är okänd."])
            ])
          ]
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
          evaluation: [["Reaches the people harmed rather than waiting for them to find you", "Når de människor som skadats i stället för att vänta på att de hittar er"]],
          pushback: {
            A: [
              pb(["Records already deleted", "Redan raderade uppgifter"], ["{{person.dpo.name}} says that for applicants refused early on, retention rules have left little more than a decision code. A full re-review cannot judge those cases properly. Do you promise everyone in public a review you can only partly deliver?", "{{person.dpo.name}} säger att för sökande som nekades tidigt har gallringsreglerna lämnat knappt mer än en beslutskod. En fullständig omprövning kan inte bedöma de ärendena ordentligt. Lovar ni alla offentligt en omprövning som ni bara delvis kan genomföra?"]),
              pb(["An admission in writing", "Ett skriftligt medgivande"], ["Legal warns that offering compensation before the inquiries conclude reads as admitting every refusal in those areas was unlawful, including the right ones. Opposing lawyers will quote your own programme. Do you go ahead, and how do you word the offer?", "Juristerna varnar för att erbjuda ersättning innan granskningarna är klara läses som ett medgivande att varje avslag i de områdena var olagligt, även de riktiga. Motpartens advokater kommer att citera ert eget program. Går ni vidare, och hur formulerar ni erbjudandet?"]),
              pb(["Some refusals were right", "En del avslag var riktiga"], ["Some refusals in the flagged areas were correct: the homes really were high risk. Re-reviewing everyone means either telling those people no a second time, or quietly covering risks you would refuse anywhere else. Which do you do?", "En del avslag i de flaggade områdena var korrekta: bostäderna var verkligen högriskobjekt. Att ompröva alla betyder att antingen säga nej en andra gång till de personerna, eller i tysthet försäkra risker ni skulle neka överallt annars. Vilket gör ni?"])
            ],
            B: [
              pb(["They will not ask", "De kommer inte att fråga"], ["Community groups in the flagged areas say most people who were refused will never see your notice, and few trust an insurer that already said no. The people most harmed are the least likely to ask. How is waiting for requests not leaving them behind?", "Föreningar i de flaggade områdena säger att de flesta som nekades aldrig kommer att se ert meddelande, och få litar på ett bolag som redan sagt nej. De som skadats mest är minst benägna att fråga. Hur är det att vänta på begäranden något annat än att lämna dem åt sitt öde?"]),
              pb(["Everyone asks", "Alla frågar"], ["Within a day of publishing the route, thousands of requests arrive, most from outside the flagged areas, from people hoping for a better price. Your team cannot find the real cases in the pile. Do you narrow who may ask, and how, without looking like you are closing the door?", "Inom ett dygn efter att vägen publicerats kommer tusentals begäranden, de flesta från andra områden, från folk som hoppas på ett bättre pris. Teamet hittar inte de verkliga fallen i högen. Begränsar ni vem som får fråga, och hur, utan att det ser ut som att ni stänger dörren?"]),
              pb(["You already have the list", "Ni har redan listan"], ["Your analysts point out that you already hold a list of every refused applicant in the flagged areas. Waiting for them to ask, when you could write to them, will look deliberate. Can you explain to the inquiry why you did not use the list?", "Era analytiker påpekar att ni redan har en lista över varje nekad sökande i de flaggade områdena. Att vänta på att de frågar, när ni kunde skriva till dem, kommer att se avsiktligt ut. Kan ni förklara för granskningen varför ni inte använde listan?"])
            ],
            C: [
              pb(["The family who flooded", "Familjen med vattenläckan"], ["The customer whose home flooded writes again, copying the newspaper: they cannot wait a year for an authority's findings. Your reply will be published. What do you tell one family that you will not do for the rest?", "Kunden vars bostad fick en vattenläcka skriver igen, med kopia till tidningen: de kan inte vänta ett år på en myndighets slutsatser. Ert svar kommer att publiceras. Vad säger ni till en familj som ni inte gör för de andra?"]),
              pb(["Waiting costs more", "Att vänta kostar mer"], ["An official at {{reg.supervisor}} says informally that firms that wait to be told usually face tougher requirements than those that act first. Waiting may not limit what you admit; it may enlarge it. Do you still wait?", "En tjänsteperson på {{reg.supervisor}} säger informellt att bolag som väntar på att bli tillsagda brukar få hårdare krav än de som agerar först. Att vänta begränsar kanske inte vad ni medger; det kan utvidga det. Väntar ni ändå?"]),
              pb(["Still uninsured", "Fortfarande oförsäkrade"], ["Every month you wait, some of the refused applicants are still without home insurance. If one of them loses their home before the findings arrive, your choice to wait will be in that story. Is that a risk you will sign for?", "Varje månad ni väntar står en del av de nekade sökande fortfarande utan hemförsäkring. Om någon av dem förlorar sitt hem innan slutsatserna kommer finns ert beslut att vänta med i den historien. Är det en risk ni vill skriva under på?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The re-review begins", "Omprövningen börjar"], [
              io(["The first files", "De första ärendena"], ["Underwriters work through the first hundred files. Most of the refused applicants would have been accepted anywhere else. The team says this proves the programme was the right call.", "Handläggarna går igenom de första hundra ärendena. De flesta av de nekade sökande hade godkänts var som helst annars. Teamet säger att det bevisar att programmet var rätt beslut."], ["Most of the first re-reviewed files would have been accepted elsewhere.", "De flesta av de första omprövade ärendena hade godkänts på andra håll."]),
              io(["Used as an admission", "Används som medgivande"], ["A claimant law firm sends a letter quoting your announcement word for word as an admission that every refusal in the flagged areas was unlawful, and invites others to join.", "En advokatbyrå som företräder sökande skickar ett brev som citerar ert besked ordagrant som ett medgivande att varje avslag i de flaggade områdena var olagligt, och bjuder in fler att ansluta sig."], ["A claimant law firm cites your re-review as an admission.", "En advokatbyrå åberopar er omprövning som ett medgivande."], { reopen: true }),
              io(["Few answers", "Få svar"], ["The first letters to refused applicants bring very few replies. Nobody can tell whether people have moved, found cover elsewhere, or simply do not trust a letter from you.", "De första breven till nekade sökande ger mycket få svar. Ingen kan avgöra om folk har flyttat, fått försäkring på annat håll eller helt enkelt inte litar på ett brev från er."], ["Few of the first refused applicants contacted have replied.", "Få av de första nekade sökande som kontaktats har svarat."])
            ]),
            ir("i2", { notChosen: "A" }, ["Nobody is reaching out", "Ingen tar kontakt"], [
              io(["Silence from the supervisor", "Tystnad från tillsynen"], ["The ten-day deadline still stands, and nobody at {{reg.supervisor}} has commented on how you plan to put things right. Some on the board read the silence as acceptance.", "Tiodagarsfristen gäller fortfarande, och ingen på {{reg.supervisor}} har kommenterat hur ni tänker rätta till följderna. Några i styrelsen tolkar tystnaden som ett godkännande."], ["{{reg.supervisor}} has not commented on how you plan to put things right.", "{{reg.supervisor}} har inte kommenterat hur ni tänker rätta till följderna."]),
              io(["An empty chair", "En tom stol"], ["A residents' association in one of the flagged areas holds a public meeting about the refusals. Your company was invited and nobody came. A photo of the empty chair is shared widely.", "En boendeförening i ett av de flaggade områdena håller ett offentligt möte om avslagen. Ert bolag var inbjudet och ingen kom. En bild på den tomma stolen sprids brett."], ["A residents' meeting in a flagged area publicly noted your absence.", "Ett boendemöte i ett flaggat område noterade offentligt er frånvaro."], { reopen: true, meters: { trust: -1, media: 1 } }),
              io(["A charity offers help", "En organisation erbjuder hjälp"], ["A housing charity offers to find and contact refused applicants in the flagged areas, if you give it your list. It is trusted locally; it is also a third party asking for personal data.", "En bostadsorganisation erbjuder sig att hitta och kontakta nekade sökande i de flaggade områdena, om ni lämnar ut er lista. Den har lokalt förtroende; den är också en tredje part som ber om personuppgifter."], ["A housing charity has offered to contact refused applicants, if given your list.", "En bostadsorganisation har erbjudit sig att kontakta nekade sökande, om den får er lista."])
            ])
          ]
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
          evaluation: [["Holds the decision-makers to account rather than the person who warned them", "Ställer beslutsfattarna till svars i stället för den som varnade dem"]],
          pushback: {
            A: [
              pb(["The contract is thin", "Avtalet är tunt"], ["Legal reads the vendor contract: it grants audit rights for security, not for how decisions are made. Forcing access means a dispute the vendor may win, while the regulators wait. Do you start a legal fight with the supplier of a system you still run?", "Juristerna läser avtalet: det ger granskningsrätt för säkerhet, inte för hur besluten fattas. Att tvinga fram åtkomst betyder en tvist som leverantören kan vinna, medan myndigheterna väntar. Inleder ni en rättslig strid med leverantören av ett system ni fortfarande använder?"]),
              pb(["The chair objects", "Ordföranden protesterar"], ["The chair says protecting the person who put customer data in a public folder looks like rewarding the breach, and the board will not be seen to excuse it. Do you defend her protection to your own board, and what consequence for the folder do you accept?", "Ordföranden säger att skydda den som lade kunduppgifter i en öppen mapp ser ut som att belöna läckan, och styrelsen vill inte framstå som att den ursäktar den. Försvarar ni skyddet för henne inför er egen styrelse, och vilken konsekvens för mappen godtar ni?"]),
              pb(["Names in this room", "Namn i det här rummet"], ["An independent review of the launch will name the people who accepted the known issue, and some of them are in this room. Do you commission a review that may end your own careers, and who sets its terms?", "En oberoende granskning av lanseringen kommer att namnge dem som godtog det kända problemet, och några av dem sitter i det här rummet. Beställer ni en granskning som kan avsluta era egna karriärer, och vem bestämmer dess ramar?"])
            ],
            B: [
              pb(["Marking its own homework", "Rättar sitt eget prov"], ["The risk function signed off the launch plan six months ago. It would now be reviewing a decision it was part of. Will the board, the regulators or the press accept its conclusions?", "Riskfunktionen godkände lanseringsplanen för sex månader sedan. Den skulle nu granska ett beslut den själv var med och fattade. Kommer styrelsen, myndigheterna eller pressen att godta dess slutsatser?"]),
              pb(["Retaliation by another name", "Repressalier med ett annat namn"], ["The data scientist's lawyer writes that putting her through HR while the people who overruled her are reviewed by colleagues is retaliation in all but name. A copy goes to the newspaper. How do you show the two processes are fair to her?", "Dataforskarens advokat skriver att det i praktiken är repressalier när hon hanteras som ett HR-ärende medan de som körde över henne granskas av kollegor. En kopia går till tidningen. Hur visar ni att de två processerna är rättvisa mot henne?"]),
              pb(["A review that cannot see", "En granskning som inte ser"], ["Without outside pressure, the vendor sends only its promised summary statement of compliance. The internal review cannot test the model itself. Do you accept a review that cannot look inside the model it is reviewing?", "Utan tryck utifrån skickar leverantören bara sin utlovade sammanfattande försäkran. Den interna granskningen kan inte testa själva modellen. Godtar ni en granskning som inte kan se in i modellen den granskar?"])
            ],
            C: [
              pb(["Leave reads as punishment", "Ledighet som straff"], ["The data scientist says being sent home while the people who overruled her stay at their desks is a punishment, whatever the pay. Her union calls it retaliation against a whistleblower. Do you bring her back, or defend the leave?", "Dataforskaren säger att bli hemskickad medan de som körde över henne sitter kvar är ett straff, vad lönen än är. Hennes fack kallar det repressalier mot en visselblåsare. Tar ni tillbaka henne, eller försvarar ni ledigheten?"]),
              pb(["Privileged findings", "Skyddade slutsatser"], ["The law firm advises that its findings will be privileged and kept from the regulators. The authorities have already asked for the decision to launch with a known issue. Do you let a review built to protect the company be your answer to them?", "Advokatbyrån meddelar att dess slutsatser omfattas av sekretess och hålls borta från myndigheterna. Myndigheterna har redan begärt beslutet att lansera med ett känt problem. Låter ni en granskning byggd för att skydda bolaget bli ert svar till dem?"]),
              pb(["Confidential from whom?", "Sekretess mot vem?"], ["The vendor agrees to cooperate, but only under an agreement that bars you from sharing anything about the model with regulators. You would learn how it works and be unable to say. Do you sign?", "Leverantören går med på att medverka, men bara under ett avtal som hindrar er från att dela något om modellen med myndigheterna. Ni skulle få veta hur den fungerar men inte kunna berätta det. Skriver ni under?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Standing by the warning", "Står bakom varningen"], [
              io(["Others speak up", "Fler säger ifrån"], ["Two employees contact HR with concerns about other projects. Both say they would not have dared before they saw how the person who wrote the warning was treated.", "Två medarbetare kontaktar HR med farhågor om andra projekt. Båda säger att de inte hade vågat innan de såg hur personen som skrev varningen behandlades."], ["Two more employees have raised concerns, citing how the warning was treated.", "Två medarbetare till har slagit larm, med hänvisning till hur varningen behandlades."]),
              io(["The vendor refuses", "Leverantören vägrar"], ["The vendor's lawyers reject your first demand outright: the contract, they say, gives no right to inspect how the model decides. They warn of a dispute if you press it.", "Leverantörens jurister avvisar ert första krav rakt av: avtalet ger enligt dem ingen rätt att granska hur modellen fattar beslut. De varnar för en tvist om ni driver frågan."], ["The vendor rejected your first demand for access.", "Leverantören avvisade ert första krav på åtkomst."], { reopen: true }),
              io(["The chair abstains", "Ordföranden avstår"], ["The board approves your plan, but the chair has an abstention recorded in the minutes. Nobody can tell whether it is quiet support or the first step towards distance.", "Styrelsen godkänner er plan, men ordföranden låter protokollföra att hen avstår. Ingen kan avgöra om det är ett tyst stöd eller ett första steg mot att ta avstånd."], ["The chair abstained on the accountability plan, in the minutes.", "Ordföranden avstod i protokollet från att ta ställning till planen."])
            ]),
            ir("i2", { notChosen: "A" }, ["The warning-giver stands alone", "Den som varnade står ensam"], [
              io(["She will cooperate", "Hon samarbetar"], ["The data scientist replies that she will cooperate with your process, and asks only that her original warning be put on record. The room takes it as a sign the matter is settled.", "Dataforskaren svarar att hon kommer att samarbeta med er process, och ber bara att hennes ursprungliga varning förs till protokollet. Rummet ser det som ett tecken på att frågan är löst."], ["The data scientist said she will cooperate with your process.", "Dataforskaren har sagt att hon samarbetar med er process."]),
              io(["A formal complaint", "En formell anmälan"], ["Her lawyer writes that she has filed a formal whistleblower complaint about how she is being treated, and copies the newspaper. The article's follow-up now has a second subject.", "Hennes advokat skriver att hon har gjort en formell visselblåsaranmälan om hur hon behandlas, med kopia till tidningen. Tidningens uppföljning har nu ett andra ämne."], ["The data scientist has filed a formal whistleblower complaint.", "Dataforskaren har gjort en formell visselblåsaranmälan."], { reopen: true, meters: { media: 1 } }),
              io(["The vendor's statement", "Leverantörens försäkran"], ["The vendor's one-page statement of compliance arrives. It says the model “uses no protected characteristics”: true of the inputs, and silent on the outcomes.", "Leverantörens ensidiga försäkran om regelefterlevnad kommer. Där står att modellen ”inte använder några skyddade egenskaper”: sant om indata, och tyst om utfallen."], ["The vendor's compliance statement covers inputs only, not outcomes.", "Leverantörens försäkran gäller bara indata, inte utfall."])
            ])
          ]
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
          evaluation: [["Gives someone the power to stop a harmful model before it reaches customers", "Ger någon makten att stoppa en skadlig modell innan den når kunderna"]],
          pushback: {
            A: [
              pb(["Review of every refusal", "Granskning av varje avslag"], ["Claims triage and fraud scoring turn down or flag thousands of cases a week. Human review of every refusal needs staff you do not have, and reviewers under time pressure tend to agree with the machine. Do you narrow the promise, or fund it?", "Sortering av skadeärenden och bedrägeribedömning avvisar eller flaggar tusentals ärenden i veckan. Mänsklig granskning av varje avslag kräver personal ni inte har, och granskare under tidspress brukar hålla med maskinen. Smalnar ni av löftet, eller finansierar ni det?"]),
              pb(["Who holds the veto?", "Vem har vetot?"], ["Product managers ask who exactly can stop a launch. If it is data science, they judge their own work; if it is risk, they lack the skills. The last warning came from inside the team and was overruled. Who gets the veto, and who can overrule them?", "Produktansvariga frågar vem som egentligen kan stoppa en lansering. Är det datateamet bedömer de sitt eget arbete; är det riskfunktionen saknar de kunskapen. Den senaste varningen kom inifrån teamet och kördes över. Vem får vetot, och vem kan köra över dem?"]),
              pb(["The rule bites at once", "Regeln biter direkt"], ["The first fairness test on the fraud model shows it flags claims from the same areas more often. Under your new rule it should stop, but it also catches real fraud. Do you switch off a second model in the same week you announce the policy?", "Det första testet av likabehandling på bedrägerimodellen visar att den flaggar skadeanmälningar från samma områden oftare. Enligt er nya regel borde den stoppas, men den fångar också verkliga bedrägerier. Stänger ni av en andra modell samma vecka som ni presenterar policyn?"])
            ],
            B: [
              pb(["A year is a long time", "Ett år är lång tid"], ["The pricing model's problem was found before launch and still ran for six months. An annual audit would have caught it, at best, months after the harm began. What stops a harmful model between audits?", "Prismodellens problem upptäcktes före lanseringen och fick ändå gå i sex månader. En årlig granskning hade i bästa fall hittat det månader efter att skadan börjat. Vad stoppar en skadlig modell mellan granskningarna?"]),
              pb(["Not what was asked", "Inte det som efterfrågades"], ["The regulator's letter asks about your process for approving models, not checking them afterwards. An annual audit answers a question it did not ask. Will you send that as your answer?", "Myndighetens brev frågar efter er process för att godkänna modeller, inte för att kontrollera dem i efterhand. En årlig granskning svarar på en fråga som den inte ställde. Skickar ni det som ert svar?"]),
              pb(["Auditors locked out", "Granskare utestängda"], ["Several of the nine other models are vendor products whose contracts give auditors no access. The audit firm says it can only review what it is allowed to see. Do you renegotiate every contract, or audit around the gaps?", "Flera av de nio andra modellerna är leverantörsprodukter vars avtal inte ger granskare någon åtkomst. Granskningsfirman säger att den bara kan granska det den får se. Omförhandlar ni varje avtal, eller granskar ni runt luckorna?"])
            ],
            C: [
              pb(["Humans have bias too", "Människor är också partiska"], ["Your manual guidelines were written by the same people and use the same claims data. Underwriters' own decisions have never been tested for fairness either. Are you removing bias, or only the part you can measure?", "Era manuella riktlinjer skrevs av samma personer och använder samma skadedata. Handläggarnas egna beslut har inte heller testats för likabehandling. Tar ni bort snedvridningen, eller bara den del ni kan mäta?"]),
              pb(["Can you survive the cure?", "Överlever ni botemedlet?"], ["{{person.serviceOwner.name}} reminds you that manual underwriting handles a third of today's volume. Without models, you either turn away most new customers or spend a year hiring. Brokers are already watching. Can the company survive the cure?", "{{person.serviceOwner.name}} påminner om att manuell riskbedömning klarar en tredjedel av dagens volym. Utan modeller får ni antingen säga nej till de flesta nya kunder eller rekrytera i ett år. Mäklarna håller redan ögonen på er. Överlever bolaget botemedlet?"]),
              pb(["Only one kind of model", "Bara en sorts modell"], ["The other nine models, in claims, fraud and customer service, keep running untested, because your decision covers underwriting only. The regulator asked about every model affecting customers. Is stopping one kind of model an answer, or a gesture?", "De nio andra modellerna, inom skador, bedrägerier och kundtjänst, fortsätter otestade, eftersom ert beslut bara gäller riskbedömning. Myndigheten frågade om varje modell som påverkar kunder. Är det ett svar att stoppa en sorts modell, eller en gest?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["A veto with teeth", "Ett veto med verkan"], [
              io(["Held up as an example", "Lyfts fram som exempel"], ["{{reg.supervisor}} replies that your approach will be mentioned as an example in its next letter to the market. The board is delighted.", "{{reg.supervisor}} svarar att ert arbetssätt kommer att nämnas som exempel i nästa brev till marknaden. Styrelsen är förtjust."], ["{{reg.supervisor}} called your approach an example for the market.", "{{reg.supervisor}} kallade ert arbetssätt ett exempel för marknaden."], { meters: { regulator: -1 } }),
              io(["Nobody will hold it", "Ingen vill ha det"], ["No senior manager will agree to be the named person who can stop a launch. Risk nominates data science, data science nominates risk, and product asks for the veto to be advisory.", "Ingen i ledningen vill vara den utsedda person som kan stoppa en lansering. Riskfunktionen föreslår datateamet, datateamet föreslår riskfunktionen, och produktsidan vill att vetot ska vara rådgivande."], ["Nobody has yet agreed to hold the veto.", "Ingen har ännu gått med på att inneha vetot."], { reopen: true }),
              io(["The first block", "Det första stoppet"], ["The first fairness test under the new rule blocks an update to the claims-triage model planned for next month. Product says the delay costs a quarter; the test owner will not back down.", "Det första testet av likabehandling enligt den nya regeln stoppar en uppdatering av modellen för sortering av skadeärenden som var planerad till nästa månad. Produktsidan säger att förseningen kostar ett kvartal; testansvarig står fast."], ["The new rule has already blocked a planned model update.", "Den nya regeln har redan stoppat en planerad modelluppdatering."])
            ]),
            ir("i2", { notChosen: "A" }, ["Nobody can stop a launch", "Ingen kan stoppa en lansering"], [
              io(["Praised as decisive", "Hyllas som handlingskraftigt"], ["An industry body praises your decision as decisive and asks you to present it at its next meeting. Some in the room see that as the end of the matter.", "En branschorganisation berömmer ert beslut som handlingskraftigt och ber er presentera det på nästa möte. Några i rummet ser det som att saken är avslutad."], ["An industry body has asked you to present your approach.", "En branschorganisation har bett er presentera ert arbetssätt."]),
              io(["The fraud model too", "Bedrägerimodellen också"], ["A quick check suggests the fraud scoring model flags claims from the same areas more often. Under what you decided, nobody has the power to stop it before it does more harm.", "En snabb kontroll tyder på att bedrägerimodellen flaggar skadeanmälningar från samma områden oftare. Med det ni beslutade har ingen makt att stoppa den innan den gör mer skada."], ["A quick check suggests the fraud model also flags the same areas.", "En snabb kontroll tyder på att bedrägerimodellen också flaggar samma områden."], { reopen: true, meters: { regulator: 1 } }),
              io(["The warning-giver's verdict", "Varnarens dom"], ["The data scientist who wrote the original warning sends a short note: nothing in what you decided would have stopped her report from being parked. Nobody is sure whether to circulate it.", "Dataforskaren som skrev den ursprungliga varningen skickar en kort rad: inget i det ni beslutade hade hindrat att hennes rapport lades på hyllan. Ingen vet om den ska spridas vidare."], ["The original warning-giver says your decision would not have helped her.", "Den som skrev varningen säger att ert beslut inte hade hjälpt henne."])
            ])
          ]
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
