/*
 * s23-researcher-disclosure.js — "Ninety Days to Publish" (archetype F, vulnerability disclosure).
 *
 * A security researcher reports that anyone can take over customers' devices
 * through the device-management portal, and will publish in 90 days. The flaw
 * is in a shared component also inside white-label products → the fix needs a
 * firmware update many customers can't install remotely → telemetry shows it
 * was exploited before the report → a reporting duty for exploited
 * vulnerabilities was missed → publication day.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s23-researcher-disclosure",
    version: 1,
    category: "vulnerability-disclosure",
    archetype: "human-legal-reputational",
    emblem: "disclosure",
    title: L(["Ninety Days to Publish", "Nittio dagar till publicering"]),
    summary: L([
      "A researcher has found a way to take over your customers' devices and will publish in ninety days. Your lawyers, your product team and the researcher all want different things.",
      "En forskare har hittat ett sätt att ta över era kunders enheter och tänker publicera om nittio dagar. Era jurister, ert produktteam och forskaren vill alla olika saker."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Respond to a vulnerability report in good faith", "Bemöta en sårbarhetsrapport i god tro"]), teaser: L(["Meeting an outsider in good faith", "Att möta någon utifrån i god tro"]) },
      { id: "lo2", text: L(["Find every product that shares a vulnerable component", "Hitta alla produkter som delar en sårbar komponent"]), teaser: L(["How far one problem reaches", "Hur långt ett problem når"]) },
      { id: "lo3", text: L(["Meet reporting duties for exploited vulnerabilities", "Uppfylla rapporteringsskyldigheter för utnyttjade sårbarheter"]), teaser: L(["Who outside the organisation should know", "Vem utanför organisationen som ska veta"]) },
      { id: "lo4", text: L(["Protect customers who cannot update quickly", "Skydda kunder som inte kan uppdatera snabbt"]), teaser: L(["Caring for those who cannot move fast", "Att ta hand om dem som inte kan agera snabbt"]) }
    ],
    mitre: ["T1190", "T1078", "T1098", "T1195"],
    frameworks: {
      nistCsf: ["GV.PO", "ID.RA", "ID.IM", "PR.PS", "RS.AN", "RS.CO", "RS.MI"],
      iso27001: ["A.5.5", "A.5.6", "A.5.24", "A.5.26", "A.8.8", "A.8.25", "A.8.28"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours", sectors: ["technology", "manufacturing", "telecom"] },
    actor: { types: ["unknown"], motivation: L(["Unknown: someone found the same flaw first and used it quietly", "Okänt: någon hittade samma fel först och utnyttjade det i tysthet"]), capability: "medium" },
    variables: {
      devices: { min: 20000, max: 2000000, scaleBy: "size", step: 1000 },
      offlinePct: { min: 25, max: 55 },
      exploitedDevices: { min: 80, max: 4000, scaleBy: "size", step: 10 },
      oemPartners: { min: 2, max: 9 }
    },
    roles: ["incidentCommander", "ciso", "devLead", "serviceOwner", "legal", "comms", "ceo", "socLead", "supplierManager", "cio"],

    groundTruth: {
      rootCause: L([
        "A shared authentication component in the device-management portal accepted a session token whose signature was never checked when it arrived through an older API path. The same component ships in partners' white-label products. An unknown party found the flaw before the researcher and used it to enrol devices into its own accounts for weeks.",
        "En gemensam autentiseringskomponent i portalen för enhetshantering godtog en sessionstoken vars signatur aldrig kontrollerades när den kom via en äldre API-väg. Samma komponent finns i partners produkter under andra varumärken. En okänd aktör hittade felet före forskaren och använde det för att registrera enheter i sina egna konton under flera veckor."
      ]),
      attackerTimeline: [
        { at: -86400, text: L(["The older API path is kept for backwards compatibility after a redesign.", "Den äldre API-vägen behålls för bakåtkompatibilitet efter en omdesign."]) },
        { at: -60480, text: L(["Unknown party begins enrolling customers' devices into outside accounts.", "En okänd aktör börjar registrera kunders enheter i externa konton."]) },
        { at: 0, text: L(["Researcher reports the flaw.", "Forskaren rapporterar felet."]) },
        { at: 43200, text: L(["Telemetry review finds earlier exploitation.", "Granskning av telemetrin hittar tidigare utnyttjande."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-oem", revealStage: "p2", text: L(["The vulnerable component also ships inside partners' white-label products.", "Den sårbara komponenten finns även i partners produkter under andra varumärken."]) },
      { id: "hf-exploited", revealStage: "p4", text: L(["Someone exploited the flaw for weeks before the researcher reported it.", "Någon utnyttjade felet i flera veckor innan forskaren rapporterade det."]) },
      { id: "hf-duty", revealStage: "p5", text: L(["Actively exploited vulnerabilities in products must be reported to the authorities within 24 hours of becoming aware.", "Aktivt utnyttjade sårbarheter i produkter ska rapporteras till myndigheterna inom 24 timmar från kännedom."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["The report", "Rapporten"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. An email reaches the security mailbox at {{org.name}}. A researcher says they can take control of customers' devices through the device-management portal, without a password, and attaches a proof of concept.\n\nThey follow a 90-day disclosure policy: in ninety days they will publish, fixed or not. Nobody has confirmed the claim yet, and the lawyers' first instinct is to send a warning letter.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Ett mejl når säkerhetsbrevlådan hos {{org.name}}. En forskare säger sig kunna ta kontroll över kundernas enheter via portalen för enhetshantering, utan lösenord, och bifogar ett konceptbevis.\n\nForskaren följer en policy om offentliggörande efter 90 dagar: om nittio dagar publiceras uppgifterna, rättade eller inte. Ingen har ännu bekräftat påståendet, och juristernas första instinkt är att skicka ett varningsbrev."
        ]),
        injects: [
          inj("i1-1", 0, "email", "employee", "high", "unverified", [
            "I can take over any customer device through your management portal by replaying a modified session token on an older API path. Proof of concept attached. I follow a 90-day disclosure policy and will publish on day 90, earlier if it is fixed. Please confirm receipt.",
            "Jag kan ta över vilken kundenhet som helst via er hanteringsportal genom att återanvända en ändrad sessionstoken på en äldre API-väg. Konceptbevis bifogat. Jag följer en policy om publicering efter 90 dagar och publicerar dag 90, tidigare om det är åtgärdat. Bekräfta gärna mottagandet."
          ], { headline: ["Vulnerability report: authentication bypass", "Sårbarhetsrapport: förbigående av autentisering"], meta: { from: "researcher@securemail.example", subject: L(["Authentication bypass in device portal", "Förbigående av autentisering i enhetsportalen"]) }, tests: ["lo1"] }),
          inj("i1-2", 30, "chat", "person.devLead", "medium", "confirmed", [
            "“If it's real, it's in the auth component. That's three teams and a firmware release. Not a quick fix.”",
            "”Om det stämmer sitter det i autentiseringskomponenten. Det är tre team och en ny firmware. Ingen snabb rättning.”"
          ], { tests: ["lo2"] }),
          inj("i1-3", 60, "chat", "person.legal", "low", "misleading", [
            "Legal: “Let's send a letter reminding them that unauthorised access is a crime. That usually slows researchers down.”",
            "Juridik: ”Vi skickar ett brev och påminner om att olovlig åtkomst är ett brott. Det brukar få forskare att lugna ned sig.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Threatening a good-faith researcher usually leads to immediate publication and a public story.", "Att hota en forskare som agerar i god tro leder oftast till omedelbar publicering och en offentlig historia."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How quickly can you confirm the proof of concept safely?", "Hur snabbt kan ni bekräfta konceptbeviset på ett säkert sätt?", ["devLead", "ciso"]),
            q("Who owns the authentication component?", "Vem äger autentiseringskomponenten?", ["devLead"]),
            q("Do you have a vulnerability disclosure policy, and does it say what you will do?", "Har ni en policy för sårbarhetsrapporter, och säger den vad ni kommer att göra?", ["ciso"])
          ],
          executive: [
            q("Is the researcher a threat or a help?", "Är forskaren ett hot eller en hjälp?", ["ceo", "legal"]),
            q("Who speaks to the researcher, and in what tone?", "Vem talar med forskaren, och i vilken ton?", ["ciso", "comms"]),
            q("What does a 90-day deadline mean for your release plans?", "Vad betyder en tidsfrist på 90 dagar för era releaseplaner?", ["serviceOwner", "cio"])
          ]
        },
        challenges: [ch("The researcher posts that they have “reported something serious to a big vendor” and will share details later.", "Forskaren skriver offentligt att hen har ”rapporterat något allvarligt till en stor leverantör” och kommer att dela detaljer senare.")],
        decision: dec("d1", "ciso", ["How do you respond to the researcher?", "Hur svarar ni forskaren?"], [
          ["Thank them, confirm receipt, name a contact and agree to work to the 90-day timeline.", "Tacka, bekräfta mottagandet, utse en kontaktperson och kom överens om att arbeta mot tidsfristen på 90 dagar."],
          ["Reply formally through legal, asking the researcher not to publish while engineering verifies the claim.", "Svara formellt via juridiken och be forskaren att inte publicera medan utvecklingen verifierar uppgifterna."],
          ["Acknowledge receipt only, and commit to a timeline once your engineers have reproduced it.", "Bekräfta bara mottagandet, och lova en tidsplan när era utvecklare har kunnat återskapa felet."]
        ], {
          knowns: [["A detailed report with a proof of concept has arrived.", "En detaljerad rapport med konceptbevis har kommit."]],
          uncertainties: [["Whether the flaw is real and how far it reaches.", "Om felet är verkligt och hur långt det sträcker sig."]],
          tradeoffs: {
            operational: ["Committing to a timeline puts pressure on three teams.", "Att binda sig till en tidsplan sätter tryck på tre team."],
            security: ["A researcher who feels ignored may publish early.", "En forskare som känner sig ignorerad kan publicera tidigt."],
            legal: ["A threatening letter can become the headline.", "Ett hotfullt brev kan bli rubriken."],
            reputational: ["How you treat researchers is visible to the whole community.", "Hur ni behandlar forskare syns för hela gemenskapen."]
          },
          evaluation: [["Treats the researcher as a partner from the first reply", "Behandlar forskaren som en partner från första svaret"]],
          pushback: {
            A: [
              pb(["Nobody asked engineering", "Ingen frågade utvecklingen"], ["{{person.devLead.name}} reads your reply and points out that nobody checked with engineering first: three teams, a firmware release and a planned release freeze all have to fit inside those ninety days. Have you promised a date you cannot keep, and do you tell the researcher now or later?", "{{person.devLead.name}} läser ert svar och påpekar att ingen stämde av med utvecklingen först: tre team, en ny firmware och ett planerat releasestopp ska alla rymmas inom de nittio dagarna. Har ni lovat ett datum ni inte kan hålla, och säger ni det till forskaren nu eller senare?"]),
              pb(["Legal objects", "Juridiken invänder"], ["{{person.legal.name}} objects that your reply accepted the researcher's terms in writing before anyone had confirmed the flaw is real. An unverified stranger is now setting your release schedule. Do you stand by the agreement, or walk part of it back before it hardens?", "{{person.legal.name}} invänder att ert svar skriftligen godtog forskarens villkor innan någon ens bekräftat att felet är verkligt. En okänd person styr nu er releaseplan. Står ni fast vid överenskommelsen, eller backar ni en del innan den hårdnar?"]),
              pb(["Who is this researcher?", "Vem är forskaren?"], ["A quick search finds no public history for the sender: no earlier reports, no talks, and a mail address that looks new. You have just named a contact and promised cooperation to someone you cannot place. How much do you share with them, and how do you find out who they are?", "En snabb sökning hittar ingen offentlig historik för avsändaren: inga tidigare rapporter, inga föredrag och en mejladress som ser ny ut. Ni har just utsett en kontakt och lovat samarbete med någon ni inte kan placera. Hur mycket delar ni, och hur tar ni reda på vem det är?"])
            ],
            B: [
              pb(["“Is this a threat?”", "”Är det här ett hot?”"], ["The researcher answers in one line: “Is this a legal threat? Please confirm, because my policy changes if it is.” Your letter asked for silence and offered nothing in return. Do you clarify, apologise, or let the letter stand?", "Forskaren svarar med en rad: ”Är det här ett juridiskt hot? Bekräfta gärna, för min policy ändras i så fall.” Ert brev bad om tystnad utan att erbjuda något tillbaka. Förtydligar ni, ber om ursäkt, eller låter ni brevet stå?"]),
              pb(["Engineering needs a line", "Utvecklingen behöver en kanal"], ["{{person.devLead.name}} needs details only the researcher has: which API path, which token fields. With legal as the only channel, every technical question goes through a lawyer and takes a day. Do you open a direct engineering line, and what does that say about your letter?", "{{person.devLead.name}} behöver uppgifter som bara forskaren har: vilken API-väg, vilka fält i token. Med juridiken som enda kanal går varje teknisk fråga via en jurist och tar ett dygn. Öppnar ni en direkt kanal för utvecklarna, och vad säger det om ert brev?"]),
              pb(["A request binds no one", "En begäran binder ingen"], ["On a second reading, {{person.legal.name}} admits that the request not to publish binds nobody: the researcher signed nothing and owes you nothing. The letter bought you no time, only a formal tone. What did you actually gain, and is it worth what it may cost?", "Vid en andra genomläsning medger {{person.legal.name}} att begäran om att inte publicera inte binder någon: forskaren har inte skrivit under något och är inte skyldig er något. Brevet gav er ingen tid, bara en formell ton. Vad vann ni egentligen, och är det värt vad det kan kosta?"])
            ],
            C: [
              pb(["Reproducing takes days", "Att återskapa tar dagar"], ["{{person.devLead.name}} says reproducing the bypass safely needs a separate test environment, and setting it up will take most of the week. Until then the researcher hears nothing more, while the ninety days keep running. How long can you stay silent, and what do you send in the meantime?", "{{person.devLead.name}} säger att det krävs en separat testmiljö för att återskapa förbigåendet på ett säkert sätt, och att det tar större delen av veckan att bygga den. Till dess hör forskaren ingenting mer, medan de nittio dagarna fortsätter att löpa. Hur länge kan ni vara tysta, och vad skickar ni under tiden?"]),
              pb(["Who is my contact?", "Vem är min kontakt?"], ["The researcher replies asking for a named contact and a date for the next update. Your acknowledgement gave neither, and nobody in the room agrees on who should own the relationship. Who answers, and what can you promise before you have reproduced anything?", "Forskaren svarar och ber om en namngiven kontakt och ett datum för nästa besked. Er bekräftelse gav inget av det, och ingen i rummet är överens om vem som ska äga relationen. Vem svarar, och vad kan ni lova innan ni har återskapat något?"]),
              pb(["The clock already runs", "Klockan går redan"], ["The researcher's policy counts from the day of the report, not from the day you confirm it. Holding back your timeline does not pause their deadline; it only shortens the time you will have once you commit. Why wait to agree a plan that is already running?", "Forskarens policy räknar från dagen för rapporten, inte från dagen ni bekräftar den. Att vänta med er tidsplan pausar inte deras tidsfrist; det kortar bara den tid ni har när ni väl binder er. Varför vänta med att komma överens om en plan som redan löper?"])
            ]
          }
        }),
        facilitator: fac(
          ["The researcher did you a favour by reporting privately. The tone of the first reply sets the next 90 days.", "Forskaren gjorde er en tjänst genom att rapportera privat. Tonen i det första svaret sätter de kommande 90 dagarna."],
          ["A fast, warm acknowledgement, a named contact and a plan to verify.", "En snabb, vänlig bekräftelse, en namngiven kontakt och en plan för att verifiera."],
          [["Ask: what would make you trust a stranger who found your mistake?", "Fråga: vad skulle få er att lita på en främling som hittade ert misstag?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 1440,
        title: L(["It works, everywhere", "Det fungerar, överallt"]),
        twist: L(["The bypass is real. The flaw sits in a shared authentication component, and that component also runs inside {{num.oemPartners}} partners' products sold under their own brands.", "Förbigåendet är verkligt. Felet sitter i en gemensam autentiseringskomponent, och den komponenten finns också i {{num.oemPartners}} partners produkter som säljs under deras egna varumärken."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "B" }, narrativeAppend: { en: "Because a legal letter went out first, the researcher has cut the deadline to 45 days and posted that you threatened them.", sv: "Eftersom ett juridiskt brev gick ut först har forskaren kortat tidsfristen till 45 dagar och skrivit offentligt att ni hotade dem." } }
        ],
        assumptionChallenged: L(["It is a bug in one portal.", "Det är ett fel i en portal."]),
        reveals: ["hf-oem"],
        narrative: L([
          "{{time.T+1440|weekday|cap}}. {{person.devLead.name}} has spent the day reproducing the bypass in a test environment and tracing it back to its source in the code.\n\nThe researcher was right. The question now is how far the flaw reaches, because the code where it lives has been copied into more places than your own product.",
          "{{time.T+1440|weekday|cap}}. {{person.devLead.name}} har ägnat dagen åt att återskapa förbigåendet i en testmiljö och spåra det tillbaka till källan i koden.\n\nForskaren hade rätt. Frågan nu är hur långt felet sträcker sig, eftersom koden där det sitter har kopierats till fler ställen än er egen produkt."
        ]),
        injects: [
          inj("i2-1", 1440, "forensicFinding", "person.devLead", "high", "confirmed", [
            "Confirmed: an older API path accepts session tokens without checking the signature. The component is a shared library, version 2.x, used since 2021.",
            "Bekräftat: en äldre API-väg godtar sessionstoken utan att kontrollera signaturen. Komponenten är ett gemensamt bibliotek, version 2.x, som använts sedan 2021."
          ], { tests: ["lo2"] }),
          inj("i2-2", 1500, "email", "supplier", "medium", "confirmed", [
            "{{person.supplierManager.name}}: our white-label agreements cover {{num.oemPartners}} partners. All of them embed library 2.x. None of them know yet.",
            "{{person.supplierManager.name}}: våra avtal om produkter under andra varumärken omfattar {{num.oemPartners}} partner. Alla bygger in bibliotek 2.x. Ingen av dem vet något ännu."
          ], { reveals: ["hf-oem"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Can you close the old API path without breaking customers' devices?", "Kan ni stänga den äldre API-vägen utan att slå ut kundernas enheter?", ["devLead"]),
            q("How do partners get a fix if they build their own releases?", "Hur får partner en rättning om de bygger sina egna releaser?", ["devLead", "supplierManager"]),
            q("Did your reply to the researcher buy you the time you now need?", "Gav ert svar till forskaren er den tid ni nu behöver?", ["ciso"], "d1")
          ],
          executive: [
            q("When do you tell the partners, and under what confidentiality?", "När berättar ni för partnerna, och under vilken sekretess?", ["supplierManager", "legal"]),
            q("Does the researcher need to know about the partners?", "Behöver forskaren veta om partnerna?", ["ciso"]),
            q("Would a different first reply have made this harder or easier?", "Hade ett annat första svar gjort det här svårare eller lättare?", ["comms"], "d1")
          ]
        },
        challenges: [ch("One partner competes with you and may use the information commercially.", "En av partnerna konkurrerar med er och kan använda informationen kommersiellt.")],
        decision: dec("d2", "incidentCommander", ["How do you coordinate the fix?", "Hur samordnar ni rättningen?"], [
          ["Tell all partners under embargo now, share a fix plan, and coordinate one public date with the researcher and {{reg.csirt}}.", "Informera alla partner under embargo nu, dela en plan för rättningen och samordna ett gemensamt offentligt datum med forskaren och {{reg.csirt}}."],
          ["Fix your own products first; tell partners when your fix ships.", "Rätta era egna produkter först; berätta för partnerna när er rättning är ute."],
          ["Ask the researcher for 180 days instead.", "Be forskaren om 180 dagar i stället."]
        ], {
          knowns: [["The flaw is in a shared component used by partners.", "Felet finns i en gemensam komponent som partnerna använder."]],
          uncertainties: [["How quickly partners can release fixes.", "Hur snabbt partnerna kan släppa rättningar."]],
          tradeoffs: {
            operational: ["Coordinating many vendors slows everyone down.", "Att samordna många leverantörer gör alla långsammare."],
            security: ["Partners who learn of it on publication day leave their customers exposed.", "Partner som får veta det på publiceringsdagen lämnar sina kunder exponerade."],
            legal: ["Embargo agreements need to be in writing.", "Embargoavtal behöver vara skriftliga."],
            reputational: ["Partners remember who told them late.", "Partner minns vem som berättade sent."]
          },
          evaluation: [["Coordinates one disclosure across every affected vendor", "Samordnar ett offentliggörande för alla berörda leverantörer"]],
          pushback: {
            A: [
              pb(["The embargo widens", "Embargot vidgas"], ["One of the {{num.oemPartners}} partners asks to share the embargoed details with the subcontractors who build its releases. Every extra recipient makes a leak more likely before any fix exists. Do you agree, refuse and slow their fix, or narrow what you shared?", "En av de {{num.oemPartners}} partnerna vill dela uppgifterna under embargo med de underleverantörer som bygger deras releaser. Varje ny mottagare gör en läcka mer sannolik innan någon rättning finns. Går ni med på det, säger ni nej och bromsar deras rättning, eller begränsar ni vad ni delade?"]),
              pb(["The slowest partner", "Den långsammaste partnern"], ["Two partners say they need longer than the researcher's deadline to release a fix. One public date means either your own customers wait for them, or you ask the researcher for more time. Whose customers do you protect first?", "Två partner säger att de behöver längre tid än forskarens tidsfrist för att släppa en rättning. Ett gemensamt offentligt datum betyder att antingen får era egna kunder vänta på dem, eller så ber ni forskaren om mer tid. Vems kunder skyddar ni först?"]),
              pb(["The coordinator wants it all", "Samordnaren vill ha allt"], ["{{reg.csirt}} agrees to coordinate but wants the full technical details and the partner list today. {{person.legal.name}} worries about losing control over who learns what, and when. Do you hand everything over, or keep the timeline in your own hands?", "{{reg.csirt}} går med på att samordna men vill ha alla tekniska detaljer och listan över partner i dag. {{person.legal.name}} oroar sig för att tappa kontrollen över vem som får veta vad, och när. Lämnar ni över allt, eller behåller ni tidsplanen i egna händer?"])
            ],
            B: [
              pb(["The patch tells all", "Rättningen avslöjar allt"], ["{{person.devLead.name}} warns that once your fix ships, anyone comparing old and new firmware can see what changed in the shared library. Partners would learn of the flaw at the same moment as everyone else who looks. Is “when our fix ships” really a safe time to tell them?", "{{person.devLead.name}} varnar för att när er rättning väl är ute kan vem som helst som jämför gammal och ny firmware se vad som ändrats i det gemensamma biblioteket. Partnerna skulle få veta om felet samtidigt som alla andra som tittar. Är ”när vår rättning är ute” verkligen en säker tidpunkt att berätta?"]),
              pb(["What the contracts say", "Vad avtalen säger"], ["{{person.supplierManager.name}} rereads the white-label agreements: they require you to notify partners of security defects “without undue delay”. Waiting for your own fix may breach every one of them. Do you accept that risk to keep the circle small?", "{{person.supplierManager.name}} läser om avtalen för produkterna under andra varumärken: de kräver att ni underrättar partner om säkerhetsbrister ”utan onödigt dröjsmål”. Att vänta på er egen rättning kan bryta mot vart och ett av dem. Tar ni den risken för att hålla kretsen liten?"]),
              pb(["The researcher asks", "Forskaren frågar"], ["The researcher asks whether the same code exists anywhere else, and whether it will all be fixed by day 90. An honest answer means telling them about partners you have not told yourselves. What do you say, and what if they contact the partners directly?", "Forskaren frågar om samma kod finns någon annanstans, och om allt kommer att vara rättat dag 90. Ett ärligt svar innebär att berätta om partner som ni själva inte har informerat. Vad svarar ni, och vad händer om forskaren kontaktar partnerna direkt?"])
            ],
            C: [
              pb(["Show us the plan", "Visa oss planen"], ["The researcher replies that their policy allows an extension only for a credible plan with dates, and asks to see yours. You do not have one yet, only a request for more time. What plan can you put in writing today?", "Forskaren svarar att policyn bara tillåter förlängning mot en trovärdig plan med datum, och ber att få se er. Ni har ingen ännu, bara en begäran om mer tid. Vilken plan kan ni sätta på pränt i dag?"]),
              pb(["Twice as long exposed", "Dubbelt så länge exponerade"], ["Every extra day is a day the flaw stays open in your devices and in the partners' products. {{person.devLead.name}} admits the old API path might be closed on the server long before firmware is ready. Is 180 days a timeline for the fix, or for your comfort?", "Varje extra dag är en dag då felet står öppet i era enheter och i partnernas produkter. {{person.devLead.name}} medger att den äldre API-vägen kanske kan stängas på servern långt innan firmwaren är klar. Är 180 dagar en tidsplan för rättningen, eller för er bekvämlighet?"]),
              pb(["Partners still in the dark", "Partnerna vet fortfarande inget"], ["Asking for more time does nothing for the {{num.oemPartners}} partners, who still know nothing. Longer secrecy means a longer period in which you know their products are exposed and they do not. When do you tell them, and does the extra time change that?", "Att be om mer tid gör ingenting för de {{num.oemPartners}} partnerna, som fortfarande inte vet något. Längre sekretess betyder en längre period då ni vet att deras produkter är exponerade men inte de själva. När berättar ni för dem, och ändrar den extra tiden det?"])
            ]
          }
        }),
        facilitator: fac(
          ["The flaw is now an ecosystem problem; coordination is the work.", "Felet är nu ett problem för hela ekosystemet; samordningen är arbetet."],
          ["Embargoed partner notice, a shared timeline and the national CSIRT as coordinator.", "Underrättelse till partner under embargo, en gemensam tidsplan och den nationella CSIRT-enheten som samordnare."],
          [["Ask: who in your supply chain would be surprised on day 90?", "Fråga: vem i er leveranskedja skulle bli överraskad dag 90?"]]
        )
      },
      {
        id: "p3",
        clock: 14400,
        priority: 1,
        title: L(["The update problem", "Uppdateringsproblemet"]),
        twist: L(["The fix needs new device firmware. {{num.offlinePct}} percent of devices are managed offline or behind customer firewalls and will not update by themselves.", "Rättningen kräver ny firmware i enheterna. {{num.offlinePct}} procent av enheterna hanteras offline eller bakom kundernas brandväggar och kommer inte att uppdateras av sig själva."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "The researcher posts that you are slow to respond. If you answered warmly and fast, you are now held to a 90-day timeline you may not meet. If you held back, the 90 days started anyway.", sv: "Forskaren skriver offentligt att ni är långsamma att svara. Om ni svarade varmt och snabbt är ni nu bundna till en tidsfrist på 90 dagar som ni kanske inte klarar. Om ni avvaktade började de 90 dagarna ändå." } },
        assumptionChallenged: L(["Once the fix ships, customers are safe.", "När rättningen är släppt är kunderna säkra."]),
        narrative: L([
          "{{time.T+14400|weekday|cap}}, day 10. The developers have a fix ready for testing, well ahead of the deadline. The mood in the room is good.\n\nThen {{person.serviceOwner.name}} looks at the installed base, the devices actually out there in customers' buildings, and at how many of them will ever receive the fix.",
          "{{time.T+14400|weekday|cap}}, dag 10. Utvecklarna har en rättning klar för test, långt före tidsgränsen. Stämningen i rummet är god.\n\nSedan tittar {{person.serviceOwner.name}} på den installerade basen, de enheter som faktiskt finns ute i kundernas byggnader, och på hur många av dem som någonsin kommer att få rättningen."
        ]),
        injects: [
          inj("i3-1", 14400, "impactReport", "management", "high", "confirmed", [
            "{{num.devices|number}} devices in the field. {{num.offlinePct}} percent have not contacted the update service in 90 days.",
            "{{num.devices|number}} enheter ute hos kunder. {{num.offlinePct}} procent har inte kontaktat uppdateringstjänsten på 90 dagar."
          ], { tests: ["lo4"] })
        ],
        charts: [{
          id: "c3-kpi", type: "kpi",
          title: L(["The installed base", "Den installerade basen"]),
          data: kpi([
            { id: "dev", label: ["Devices in the field", "Enheter ute hos kunder"], value: (v) => v.devices, tone: "info" },
            { id: "off", label: ["Percent not auto-updating", "Procent som inte uppdateras automatiskt"], value: (v) => v.offlinePct, tone: "danger" },
            { id: "oem", label: ["Partners affected", "Berörda partner"], value: (v) => v.oemPartners, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("Can you protect devices on the server side while firmware rolls out?", "Kan ni skydda enheterna på serversidan medan den nya firmwaren rullas ut?", ["devLead"]),
            q("How do you find and reach customers whose devices are offline?", "Hur hittar och når ni kunder vars enheter är offline?", ["serviceOwner"]),
            q("Are partners on the same timeline as you?", "Följer partnerna samma tidsplan som ni?", ["supplierManager"], "d2")
          ],
          executive: [
            q("What do you owe customers who cannot update quickly?", "Vad är ni skyldiga kunder som inte kan uppdatera snabbt?", ["ceo", "serviceOwner"]),
            q("Do you tell customers before publication day?", "Berättar ni för kunderna före publiceringsdagen?", ["comms", "legal"]),
            q("Was coordinating with partners worth the delay?", "Var samordningen med partnerna värd förseningen?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("Sales asks that large customers be told privately first.", "Försäljning vill att stora kunder informeras privat först.")],
        decision: dec("d3", "serviceOwner", ["How do you protect customers who can't update?", "Hur skyddar ni kunder som inte kan uppdatera?"], [
          ["Close the old API path on the server now as an interim block, contact offline customers directly, and publish guidance on day 90.", "Stäng den äldre API-vägen på servern nu som ett tillfälligt skydd, kontakta offlinekunder direkt och publicera vägledning dag 90."],
          ["Wait for the firmware instead of closing the old path; closing it breaks devices for customers who still depend on it.", "Vänta på firmwaren i stället för att stänga den äldre vägen; att stänga den slår ut enheter för kunder som fortfarande är beroende av den."],
          ["Tell large customers privately now, everyone else on day 90.", "Berätta privat för stora kunder nu, för alla andra dag 90."]
        ], {
          knowns: [["A server-side block is possible but may break old devices.", "En blockering på serversidan är möjlig men kan slå ut gamla enheter."]],
          uncertainties: [["How many devices depend on the old path.", "Hur många enheter som är beroende av den äldre vägen."]],
          tradeoffs: {
            operational: ["The server-side block may disconnect some old devices.", "Blockeringen på serversidan kan koppla bort en del gamla enheter."],
            security: ["Devices without the fix stay exposed after publication.", "Enheter utan rättningen förblir exponerade efter publiceringen."],
            legal: ["Telling some customers first is hard to defend.", "Att berätta för vissa kunder först är svårt att försvara."],
            reputational: ["Customers will judge you on day 91.", "Kunderna kommer att döma er dag 91."]
          },
          evaluation: [["Reduces exposure for everyone, not just the customers who update", "Minskar exponeringen för alla, inte bara för kunderna som uppdaterar"]],
          pushback: {
            A: [
              pb(["Devices that go quiet", "Enheter som tystnar"], ["Nobody can yet say how many devices still depend on the old path. Support warns that when older devices stop syncing, customers will call within hours, and nobody can explain why without revealing the flaw. What do you tell them before publication day?", "Ingen kan ännu säga hur många enheter som är beroende av den äldre vägen. Supporten varnar för att kunderna ringer inom några timmar när äldre enheter slutar synkronisera, och ingen kan förklara varför utan att avslöja felet. Vad säger ni till dem före publiceringsdagen?"]),
              pb(["Every call is a leak", "Varje samtal är en läcka"], ["Contacting offline customers directly means telling many organisations about a flaw that is still secret. Any one of them could post about it, weeks before the fix is out. How much do you say in those calls, and how do you keep it from spreading before day 90?", "Att kontakta offlinekunder direkt innebär att berätta för många organisationer om ett fel som fortfarande är hemligt. Vilken som helst av dem kan skriva om det, veckor innan rättningen är ute. Hur mycket säger ni i samtalen, och hur hindrar ni att det sprids före dag 90?"]),
              pb(["Partners aren't covered", "Partnerna omfattas inte"], ["{{person.supplierManager.name}} points out that closing the path on your servers does nothing for partners whose products run against their own. Your customers are protected sooner, theirs are not, and they will notice the change in your service. Do you warn partners first, or close the path anyway?", "{{person.supplierManager.name}} påpekar att det inte hjälper partner vars produkter går mot deras egna servrar att ni stänger vägen på era. Era kunder skyddas tidigare, deras inte, och de kommer att märka ändringen i er tjänst. Varnar ni partnerna först, eller stänger ni vägen ändå?"])
            ],
            B: [
              pb(["Open on publication day", "Öppet på publiceringsdagen"], ["With protection depending on firmware, {{num.offlinePct}} percent of devices will still be exposed on publication day, and the old path stays open with them. Once the write-up is public, anyone can use it. Are you keeping the door open just to avoid support calls?", "När skyddet hänger på firmwaren kommer {{num.offlinePct}} procent av enheterna fortfarande att vara exponerade på publiceringsdagen, och den äldre vägen står öppen för dem. När genomgången väl är publicerad kan vem som helst använda den. Håller ni dörren öppen bara för att slippa supportsamtal?"]),
              pb(["Not all or nothing", "Inte allt eller inget"], ["{{person.devLead.name}} says the old path could be closed for every device that has not used it in a month, leaving open only the few that still need it. Your decision treated it as all or nothing. Do you reopen the choice, or is breaking even a few devices still too much?", "{{person.devLead.name}} säger att den äldre vägen kan stängas för alla enheter som inte använt den på en månad, så att bara de få som fortfarande behöver den står öppna. Ert beslut behandlade det som allt eller inget. Öppnar ni frågan igen, eller är det fortfarande för mycket att slå ut ens några enheter?"]),
              pb(["What should we do now?", "Vad ska vi göra nu?"], ["A large customer's security team, which has heard rumours, asks whether there is anything they should do while waiting for firmware. Saying nothing is now a choice, not a gap. What do you answer, knowing you had a server-side option and chose not to use it?", "En stor kunds säkerhetsteam, som har hört rykten, frågar om det finns något de bör göra i väntan på firmwaren. Att inte säga något är nu ett val, inte en lucka. Vad svarar ni, när ni vet att ni hade ett skydd på serversidan och valde att inte använda det?"])
            ],
            C: [
              pb(["The small customer asks", "Den lilla kunden frågar"], ["A small customer hears from a contact at a large one that something is coming, and asks why they were not told. They run the same devices with the same exposure. How do you justify the difference, and can a private briefing stay private?", "En liten kund hör av en kontakt hos en stor kund att något är på gång, och frågar varför de inte fick veta. De har samma enheter och samma exponering. Hur motiverar ni skillnaden, och kan en privat genomgång verkligen förbli privat?"]),
              pb(["Briefing becomes a programme", "Genomgången blir ett projekt"], ["Once briefed, the large customers want a timeline, a mitigation and a dedicated contact, and two want the technical details for their own security teams. The briefing has become a support programme months before publication. Who runs it, and what are you allowed to share?", "Efter genomgången vill de stora kunderna ha en tidsplan, ett skydd och en egen kontaktperson, och två vill ha de tekniska detaljerna till sina säkerhetsteam. Genomgången har blivit ett supportprojekt månader före publiceringen. Vem driver det, och vad får ni dela?"]),
              pb(["Risk or sales?", "Risk eller försäljning?"], ["{{person.legal.name}} warns that warning some customers about a known flaw while staying silent to others will be hard to defend if anything happens to the others. The contracts make no distinction by size. Is this a risk decision, or a sales decision?", "{{person.legal.name}} varnar för att det blir svårt att försvara att ni varnade vissa kunder om ett känt fel men teg för andra, om något händer de andra. Avtalen skiljer inte på stora och små. Är det här ett riskbeslut, eller ett försäljningsbeslut?"])
            ]
          }
        }),
        facilitator: fac(
          ["A fix that does not reach devices is a press release, not a fix.", "En rättning som inte når enheterna är ett pressmeddelande, inte en rättning."],
          ["A server-side mitigation, direct outreach to offline customers and equal treatment.", "Ett skydd på serversidan, direktkontakt med offlinekunder och lika behandling."],
          [["Ask: what can you change on your side that protects everyone today?", "Fråga: vad kan ni ändra på er sida som skyddar alla redan i dag?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 43200,
        title: L(["Not the first", "Inte först"]),
        twist: L(["Your telemetry shows that the old API path was used in the same way for weeks before the report. {{num.exploitedDevices|number}} customer devices were enrolled into accounts you don't recognise.", "Er telemetri visar att den äldre API-vägen användes på samma sätt i flera veckor före rapporten. {{num.exploitedDevices|number}} kundenheter registrerades i konton ni inte känner igen."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "It was exploited before the report. Partners who knew under embargo have had to stay silent while their customers were attacked. Partners who did not know are about to find out from the news.", sv: "Felet utnyttjades före rapporten. Partner som fick veta under embargo har tvingats tiga medan deras kunder angreps. Partner som inte visste är på väg att få veta det via nyheterna." } },
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because the old API path was closed, older devices at many customers have stopped syncing, and support has taken three hundred calls since this morning.", sv: "Eftersom den äldre API-vägen stängdes har äldre enheter hos många kunder slutat synkronisera, och supporten har tagit emot trehundra samtal sedan i morse." } }
        ],
        assumptionChallenged: L(["Only the researcher knows about the flaw.", "Bara forskaren känner till felet."]),
        reveals: ["hf-exploited"],
        narrative: L([
          "{{time.T+43200|weekday|cap}}, day 30. Until now, everyone has treated the flaw as a secret shared between you and the researcher.\n\n{{person.socLead.name}} searches six months of portal logs for the bypass pattern, to be sure. At the same time, customer service receives a call from a customer whose devices are behaving strangely.",
          "{{time.T+43200|weekday|cap}}, dag 30. Hittills har alla behandlat felet som en hemlighet mellan er och forskaren.\n\n{{person.socLead.name}} söker igenom sex månaders portalloggar efter mönstret för förbigåendet, för säkerhets skull. Samtidigt får kundtjänst ett samtal från en kund vars enheter beter sig konstigt."
        ]),
        injects: [
          inj("i4-1", 43200, "logExcerpt", "siem", "critical", "confirmed", [
            "Older API path, unsigned tokens accepted: first seen 42 days before the report. {{num.exploitedDevices|number}} devices re-enrolled to 37 unknown accounts. Activity continues.",
            "Den äldre API-vägen, osignerade token godtagna: sågs första gången 42 dagar före rapporten. {{num.exploitedDevices|number}} enheter omregistrerade till 37 okända konton. Aktiviteten fortsätter."
          ], { reveals: ["hf-exploited"], tests: ["lo3"] }),
          inj("i4-2", 43260, "customerComplaint", "customer", "high", "confirmed", [
            "“Our devices show up in someone else's account and we can't remove them. Is this a fault, or have we been hacked?”",
            "”Våra enheter syns i någon annans konto och vi kan inte ta bort dem. Är det ett fel, eller har vi blivit hackade?”"
          ], { tests: ["lo4"] })
        ],
        charts: [{
          id: "c4-line", type: "line",
          title: L(["Devices re-enrolled to unknown accounts", "Enheter omregistrerade till okända konton"]), unit: L(["devices", "enheter"]),
          caption: L(["Days relative to the researcher's report.", "Dagar i förhållande till forskarens rapport."]),
          data: line(["Re-enrolled devices", "Omregistrerade enheter"], -42, 30, 6, (x, ctx) => Math.round(ctx.vars.exploitedDevices * Math.min(1, (x + 42) / 72)), "days")
        }],
        questions: {
          technical: [
            q("Can you return the hijacked devices to their owners safely?", "Kan ni återföra de kapade enheterna till sina ägare på ett säkert sätt?", ["devLead", "serviceOwner"]),
            q("What did the unknown accounts do with the devices?", "Vad gjorde de okända kontona med enheterna?", ["socLead"]),
            q("Is the interim server-side block still enough?", "Räcker det tillfälliga skyddet på serversidan fortfarande?", ["devLead"], "d3")
          ],
          executive: [
            q("Does the 90-day timeline still hold when the flaw is being exploited?", "Håller tidsplanen på 90 dagar fortfarande när felet utnyttjas?", ["ciso", "legal"]),
            q("Who must you tell now: customers, partners, authorities, the researcher?", "Vilka måste ni informera nu: kunder, partner, myndigheter, forskaren?", ["incidentCommander"]),
            q("Would you protect customers differently now, knowing it was used?", "Skulle ni skydda kunderna annorlunda nu, när ni vet att felet har utnyttjats?", ["serviceOwner"], "d3")
          ]
        },
        challenges: [ch("The product team asks to keep quiet until the firmware ships, “so attackers don't learn about it”.", "Produktteamet vill hålla tyst tills firmwaren är ute, ”så att angripare inte får veta det”.")],
        decision: dec("d4", "ciso", ["What changes now that it is exploited?", "Vad ändras nu när felet utnyttjas?"], [
          ["Block the old path everywhere today, tell the researcher, partners and authorities, and warn customers with steps to check their devices.", "Blockera den äldre vägen överallt i dag, informera forskaren, partnerna och myndigheterna, och varna kunderna med instruktioner för att kontrollera sina enheter."],
          ["Keep the plan; ship firmware on schedule.", "Håll fast vid planen; släpp firmwaren enligt tidsplanen."],
          ["Reset the hijacked devices now, and tell customers on day 90, when the fix and the advice can come together.", "Återställ de kapade enheterna nu, och berätta för kunderna dag 90, när rättningen och råden kan komma samtidigt."]
        ], {
          knowns: [["The flaw has been exploited for weeks.", "Felet har utnyttjats i flera veckor."]],
          uncertainties: [["Who is behind the unknown accounts.", "Vem som ligger bakom de okända kontona."]],
          tradeoffs: {
            operational: ["Blocking the old path everywhere may disconnect some old devices.", "Att blockera den äldre vägen överallt kan koppla bort en del gamla enheter."],
            security: ["Exploitation continues every day you wait.", "Utnyttjandet fortsätter varje dag ni väntar."],
            legal: ["An exploited flaw changes your reporting duties.", "Ett utnyttjat fel ändrar era rapporteringsskyldigheter."],
            reputational: ["Silence about exploitation is the worst story of all.", "Tystnad om utnyttjandet är den värsta historien av alla."]
          },
          evaluation: [["Moves from coordinated disclosure to active incident response", "Går från samordnat offentliggörande till aktiv incidenthantering"]],
          pushback: {
            A: [
              pb(["Old devices go dark", "Gamla enheter slocknar"], ["Blocking the old path everywhere today disconnects older devices at many customers, with no firmware yet to replace it. Support has no script, and customers will call before your warning reaches them. Do you stagger the block, or accept a day of chaos as the price?", "Att blockera den äldre vägen överallt i dag kopplar bort äldre enheter hos många kunder, utan någon firmware som ersätter den ännu. Supporten har inget manus, och kunderna ringer innan er varning når dem. Gör ni blockeringen stegvis, eller accepterar ni en dag av kaos som priset?"]),
              pb(["The researcher may go early", "Forskaren kan publicera tidigt"], ["You told the researcher the flaw is being exploited. They reply that their policy is to publish early when a flaw is used in the wild, so defenders can act. Your honesty may have just shortened your deadline. Do you ask them to hold, and on what grounds?", "Ni berättade för forskaren att felet utnyttjas. Forskaren svarar att policyn är att publicera tidigare när ett fel används i det fria, så att försvarare kan agera. Er ärlighet kan just ha kortat er tidsfrist. Ber ni forskaren att vänta, och med vilka argument?"]),
              pb(["A map for attackers", "En karta för angripare"], ["The product team argues that a public warning with steps to check devices tells every attacker exactly where to look, weeks before the firmware exists. The 37 unknown accounts are still active. Are you warning customers, or advertising the flaw?", "Produktteamet menar att en offentlig varning med instruktioner för att kontrollera enheterna visar varje angripare exakt var de ska leta, veckor innan firmwaren finns. De 37 okända kontona är fortfarande aktiva. Varnar ni kunderna, eller gör ni reklam för felet?"])
            ],
            B: [
              pb(["Activity continues", "Aktiviteten fortsätter"], ["The logs say the activity continues: more devices are being enrolled into unknown accounts while you follow the schedule. Every week of the plan adds victims you now know about. How many more are acceptable before the plan changes?", "Loggarna visar att aktiviteten fortsätter: fler enheter registreras i okända konton medan ni följer tidsplanen. Varje vecka av planen lägger till offer som ni nu känner till. Hur många fler är acceptabla innan planen ändras?"]),
              pb(["“Is this a known problem?”", "”Är det ett känt problem?”"], ["The customer whose devices appeared in someone else's account calls back and asks directly whether this is a known problem. Keeping the plan means not telling them what you know. What do you say to someone being attacked through your flaw right now?", "Kunden vars enheter dök upp i någon annans konto ringer igen och frågar rakt ut om det är ett känt problem. Att hålla fast vid planen betyder att inte berätta vad ni vet. Vad säger ni till någon som angrips genom ert fel just nu?"]),
              pb(["The researcher's question", "Forskarens fråga"], ["The researcher asks for an update, and whether you have seen any sign of exploitation. Keeping the plan means either telling them and losing control of the timeline, or not telling them. Which, and what happens if they later find out you knew?", "Forskaren ber om en lägesrapport och frågar om ni har sett några tecken på utnyttjande. Att hålla fast vid planen betyder att antingen berätta och tappa kontrollen över tidsplanen, eller att inte berätta. Vilket väljer ni, och vad händer om forskaren senare får veta att ni visste?"])
            ],
            C: [
              pb(["They come back", "De kommer tillbaka"], ["You reset the hijacked devices, but the old path is still open, and the unknown accounts can enrol them again tonight. Without a block, the reset is a cleanup the attacker can undo. Do you block the path as well, or keep resetting?", "Ni återställer de kapade enheterna, men den äldre vägen är fortfarande öppen, och de okända kontona kan registrera dem igen i natt. Utan blockering är återställningen en städning som angriparen kan göra ogjord. Blockerar ni vägen också, eller fortsätter ni att återställa?"]),
              pb(["Why was it reset?", "Varför återställdes den?"], ["Customers whose devices were reset lose their settings and call to ask why. You have decided not to explain until day 90. What does support say, and how will that answer read when the full story comes out?", "Kunder vars enheter återställdes förlorar sina inställningar och ringer för att fråga varför. Ni har beslutat att inte förklara förrän dag 90. Vad säger supporten, och hur kommer det svaret att läsas när hela historien kommer fram?"]),
              pb(["Evidence wiped", "Spåren raderas"], ["{{person.socLead.name}} objects that resetting the devices erases what the unknown accounts did with them, before anyone has looked. You still do not know who is behind the accounts or what they wanted. Do you reset now to protect customers, or wait to preserve the evidence?", "{{person.socLead.name}} invänder att en återställning raderar det de okända kontona gjorde med enheterna, innan någon har tittat. Ni vet fortfarande inte vem som ligger bakom kontona eller vad de ville. Återställer ni nu för att skydda kunderna, eller väntar ni för att säkra spåren?"])
            ]
          }
        }),
        facilitator: fac(
          ["Exploitation in the wild ends the comfortable timeline; the researcher should hear it from you.", "Utnyttjande i det fria avslutar den bekväma tidsplanen; forskaren bör få höra det från er."],
          ["Immediate blocking, notifications to all parties and customer guidance.", "Omedelbar blockering, underrättelser till alla parter och vägledning till kunderna."],
          [["Ask: who benefits from your silence now?", "Fråga: vem tjänar på er tystnad nu?"]]
        )
      },
      {
        id: "p5",
        clock: 44640,
        priority: 2,
        title: L(["The 24 hours you missed", "De 24 timmar ni missade"]),
        twist: L(["{{person.legal.name}} finds that product rules require exploited vulnerabilities to be reported to {{reg.csirt}} within a day of becoming aware. You became aware two days ago.", "{{person.legal.name}} upptäcker att produktreglerna kräver att utnyttjade sårbarheter rapporteras till {{reg.csirt}} inom ett dygn från kännedom. Ni fick kännedom för två dagar sedan."]),
        twistKind: "authority",
        assumptionChallenged: L(["Disclosure is between us and the researcher.", "Offentliggörandet är en sak mellan oss och forskaren."]),
        reveals: ["hf-duty"],
        narrative: L([
          "{{time.T+44640|weekday|cap}}, day 31. The discovery that the flaw has been exploited has changed the legal picture, and {{person.legal.name}} has read the product regulation again, carefully.\n\nSome rules about vulnerabilities apply only once they are known to be used by attackers. That moment has already passed.",
          "{{time.T+44640|weekday|cap}}, dag 31. Upptäckten att felet har utnyttjats har förändrat den rättsliga bilden, och {{person.legal.name}} har läst produktregleringen igen, noggrant.\n\nEn del regler om sårbarheter gäller först när det är känt att angripare använder dem. Det ögonblicket har redan passerat."
        ]),
        injects: [
          inj("i5-1", 44640, "advisory", "csirt", "high", "confirmed", [
            "{{reg.csirt}} reminder to manufacturers: actively exploited vulnerabilities in products with digital elements are to be reported without undue delay, with an early warning within 24 hours.",
            "Påminnelse från {{reg.csirt}} till tillverkare: aktivt utnyttjade sårbarheter i produkter med digitala delar ska rapporteras utan onödigt dröjsmål, med en tidig varning inom 24 timmar."
          ], { reveals: ["hf-duty"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What do you put in an early warning when you don't know who is behind it?", "Vad skriver ni i en tidig varning när ni inte vet vem som ligger bakom?", ["ciso", "socLead"]),
            q("Can partners report for their own products on time?", "Kan partnerna rapportera för sina egna produkter i tid?", ["supplierManager"]),
            q("Did blocking the old path stop the exploitation?", "Stoppade blockeringen av den äldre vägen utnyttjandet?", ["socLead"], "d4")
          ],
          executive: [
            q("How do you explain the delay to the authority?", "Hur förklarar ni förseningen för myndigheten?", ["legal", "ceo"]),
            q("Who in the company is responsible for knowing these duties?", "Vem i företaget ansvarar för att känna till de här skyldigheterna?", ["ceo", "ciso"]),
            q("Would you have decided differently on day 30 if you had known this?", "Hade ni beslutat annorlunda dag 30 om ni hade känt till det här?", ["incidentCommander"], "d4")
          ]
        },
        challenges: [ch("A partner says they will report only once you do, to avoid being first.", "En partner säger att de rapporterar först när ni gör det, för att inte vara först.")],
        decision: dec("d5", "legal", ["How do you handle the missed deadline?", "Hur hanterar ni den missade tidsfristen?"], [
          ["Report now, state plainly when you became aware and why it is late, and fix the process.", "Rapportera nu, ange rakt när ni fick kännedom och varför det är sent, och rätta processen."],
          ["Report with an awareness date of today.", "Rapportera med kännedomsdatum i dag."],
          ["Wait for the firmware so the report can say it is fixed.", "Vänta på firmwaren så att rapporten kan säga att det är åtgärdat."]
        ], {
          knowns: [["You have known about the exploitation for two days.", "Ni har känt till utnyttjandet i två dagar."]],
          uncertainties: [["How the authority will view the delay.", "Hur myndigheten kommer att se på förseningen."]],
          tradeoffs: {
            operational: ["Reporting takes senior time in the middle of the fix.", "Rapporteringen tar ledningens tid mitt under rättningen."],
            security: ["Authorities can warn others only if told.", "Myndigheter kan bara varna andra om de får veta."],
            legal: ["A false awareness date turns a delay into a deception.", "Ett felaktigt kännedomsdatum gör en försening till ett vilseledande."],
            reputational: ["Honest lateness is forgiven more easily than hidden lateness.", "Ärlig försening förlåts lättare än dold försening."]
          },
          evaluation: [["Reports now with the true timeline", "Rapporterar nu med den sanna tidslinjen"]],
          pushback: {
            A: [
              pb(["Late, in writing", "Sent, svart på vitt"], ["{{person.ceo.name}} asks whether stating in writing that you were two days late invites a sanction you might otherwise avoid. Your report becomes the first document the authority can hold against you. Do you still give the real date, and who signs it?", "{{person.ceo.name}} frågar om ett skriftligt erkännande av att ni var två dagar sena bjuder in en sanktion ni annars kunde ha sluppit. Rapporten blir det första dokument myndigheten kan använda mot er. Anger ni ändå det verkliga datumet, och vem skriver under?"]),
              pb(["Naming the partners", "Att namnge partnerna"], ["Your report names the shared component, and the authority will ask which other manufacturers use it. One partner has said they will only report once you do. Do you name the partners in your report, before they have reported themselves?", "Er rapport nämner den gemensamma komponenten, och myndigheten kommer att fråga vilka andra tillverkare som använder den. En partner har sagt att de rapporterar först när ni gör det. Namnger ni partnerna i er rapport, innan de själva har rapporterat?"]),
              pb(["Whose job was it?", "Vems uppgift var det?"], ["Fixing the process means naming an owner for product reporting duties. Legal says it is a security job; security says it is a legal one. Neither wants to be named in the report as the function that missed it. Who takes it, today?", "Att rätta processen betyder att utse en ägare för rapporteringen om produkter. Juridiken säger att det är en säkerhetsfråga; säkerhet säger att det är en juridisk. Ingen vill stå i rapporten som den funktion som missade det. Vem tar ansvaret, i dag?"])
            ],
            B: [
              pb(["The records disagree", "Underlagen säger emot"], ["The log search that found the exploitation is timestamped two days ago, and the ticket and chat history show who saw it. The authority can ask for all of it. Are you ready to explain why the date in your report does not match your own records?", "Loggsökningen som hittade utnyttjandet är tidsstämplad för två dagar sedan, och ärenden och chatthistorik visar vem som såg den. Myndigheten kan begära allt detta. Är ni beredda att förklara varför datumet i rapporten inte stämmer med era egna underlag?"]),
              pb(["Who will sign it?", "Vem skriver under?"], ["{{person.socLead.name}}, who found the exploitation, refuses to stand behind a report that gives today as the awareness date. Do you overrule them, find someone else to sign, or change the date?", "{{person.socLead.name}}, som hittade utnyttjandet, vägrar att stå bakom en rapport som anger i dag som kännedomsdatum. Kör ni över hen, hittar ni någon annan som skriver under, eller ändrar ni datumet?"]),
              pb(["Others hold the timeline", "Andra har tidslinjen"], ["The researcher, the partners and the customer who called on day 30 all know when this surfaced. If any of them is asked, the date in your report falls apart. How sure are you that nobody will contradict it?", "Forskaren, partnerna och kunden som ringde dag 30 vet alla när det här kom fram. Om någon av dem blir tillfrågad faller datumet i rapporten. Hur säkra är ni på att ingen kommer att säga emot?"])
            ],
            C: [
              pb(["Two days become weeks", "Två dagar blir veckor"], ["Firmware is still weeks away. Each day you wait, a two-day delay grows, and the reason in the report becomes “we wanted good news first”. How will that read to the authority?", "Firmwaren ligger fortfarande veckor bort. Varje dag ni väntar växer en försening på två dagar, och skälet i rapporten blir ”vi ville ha goda nyheter först”. Hur kommer det att läsas av myndigheten?"]),
              pb(["Nobody else is warned", "Ingen annan varnas"], ["{{reg.csirt}} can warn other users and vendors only once you report. Until then, the unknown accounts keep working through the same flaw and nobody outside is looking for them. Are you willing to be the reason others were not warned?", "{{reg.csirt}} kan varna andra användare och leverantörer först när ni rapporterar. Till dess fortsätter de okända kontona att arbeta via samma fel och ingen utanför letar efter dem. Är ni beredda att vara skälet till att andra inte varnades?"]),
              pb(["The partner waits too", "Partnern väntar också"], ["The partner who will report only after you is now waiting for your firmware too. Your choice sets the date for their reporting and their customers' warning as well. Are you willing to make that decision for them?", "Partnern som bara rapporterar efter er väntar nu också på er firmware. Ert val bestämmer datumet för deras rapport och för varningen till deras kunder. Är ni beredda att fatta det beslutet åt dem?"])
            ]
          }
        }),
        facilitator: fac(
          ["The duty was always there; nobody owned it. Look for who should have known.", "Skyldigheten fanns hela tiden; ingen ägde den. Leta efter vem som borde ha vetat."],
          ["An immediate, honest report and a named owner for product reporting duties.", "En omedelbar, ärlig rapport och en namngiven ägare för produktrapporteringen."],
          [["Ask: what other deadlines start on day one that nobody is watching?", "Fråga: vilka andra tidsfrister börjar dag ett utan att någon bevakar dem?"]]
        )
      },
      {
        id: "p6",
        clock: 129600,
        priority: 3,
        title: L(["Day 90", "Dag 90"]),
        twist: L(["The researcher publishes, with your coordinated advisory linked at the top. Firmware is on 61 percent of devices; journalists ask about the rest, and about the weeks before the report.", "Forskaren publicerar, med er samordnade säkerhetsinformation länkad överst. Den nya firmwaren finns på 61 procent av enheterna; journalister frågar om resten, och om veckorna före rapporten."]),
        twistKind: "impact",
        reconsider: { decision: "d3", pressure: { en: "Thirty-nine percent of devices still lack the fix. For the customers who cannot update, was your choice on day one the right one?", sv: "Trettionio procent av enheterna saknar fortfarande rättningen. För kunderna som inte kan uppdatera, var ert val den första dagen det rätta?" } },
        branches: [
          { when: { decision: "d5", option: "A" }, narrativeAppend: { en: "Because you reported the real awareness date, {{reg.csirt}} has opened a review of how your disclosure process works.", sv: "Eftersom ni rapporterade det verkliga kännedomsdatumet har {{reg.csirt}} inlett en granskning av hur er process för sårbarhetsrapporter fungerar." } }
        ],
        assumptionChallenged: L(["Publication day is the end of the incident.", "Publiceringsdagen är slutet på incidenten."]),
        narrative: L([
          "{{time.T+129600|weekday|cap}}, day 90. The deadline has arrived, as agreed. The researcher publishes their write-up this morning.\n\nThe fix exists, the advisory is ready, and the partners have been told. But not every device has been updated, and the journalists who read the write-up are asking questions you will have to answer in public.",
          "{{time.T+129600|weekday|cap}}, dag 90. Tidsgränsen är här, som överenskommet. Forskaren publicerar sin genomgång i dag.\n\nRättningen finns, säkerhetsinformationen är klar och partnerna har informerats. Men alla enheter har inte uppdaterats, och journalisterna som läser genomgången ställer frågor som ni måste besvara offentligt."
        ]),
        injects: [
          inj("i6-1", 129600, "newsHeadline", "media", "medium", "confirmed", [
            "Flaw let strangers take over {{org.shortName}} devices; maker says fix available, but thousands still exposed.",
            "Fel lät främlingar ta över {{org.shortName}}-enheter; tillverkaren säger att en rättning finns, men tusentals är fortfarande exponerade."
          ], { pressure: "media", substitute: { type: "customerComplaint", source: "customer", content: ["“We read the researcher's post. Why did we have to find out there and not from you?”", "”Vi läste forskarens inlägg. Varför fick vi veta det där och inte från er?”"] }, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you reach the devices that are still not updated?", "Hur når ni de enheter som fortfarande inte är uppdaterade?", ["serviceOwner", "devLead"]),
            q("Which other old API paths are kept only for compatibility?", "Vilka andra gamla API-vägar finns kvar bara för kompatibilitet?", ["devLead", "cio"]),
            q("Was the report to the authority complete and honest, looking back?", "Var rapporten till myndigheten fullständig och ärlig, i efterhand?", ["legal"], "d5")
          ],
          executive: [
            q("What do you say about the exploitation before the report?", "Vad säger ni om utnyttjandet före rapporten?", ["comms", "ceo"]),
            q("Do you thank the researcher publicly?", "Tackar ni forskaren offentligt?", ["ciso", "comms"]),
            q("Which of your first-day decisions shaped today most?", "Vilket av era beslut första dagen formade dagens läge mest?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("A competitor's marketing uses the headline.", "En konkurrents marknadsföring använder rubriken.")],
        decision: dec("d6", "ceo", ["What do you commit to publicly?", "Vad åtar ni er offentligt?"], [
          ["A public thank-you to the researcher, a clear vulnerability disclosure policy and a plan to reach every remaining device.", "Ett offentligt tack till forskaren, en tydlig policy för sårbarhetsrapporter och en plan för att nå varje kvarvarande enhet."],
          ["A short statement that the issue is fixed.", "Ett kort uttalande om att problemet är åtgärdat."],
          ["Let the advisory speak for itself, and answer journalists only in writing.", "Låt säkerhetsinformationen tala för sig själv, och svara journalister endast skriftligt."]
        ], {
          knowns: [["The flaw, the fix and the earlier exploitation are public.", "Felet, rättningen och det tidigare utnyttjandet är offentliga."]],
          uncertainties: [["How many devices will ever be updated.", "Hur många enheter som någonsin kommer att uppdateras."]],
          tradeoffs: {
            operational: ["Reaching every device is a long project.", "Att nå varje enhet är ett långt projekt."],
            security: ["Unpatched devices remain targets.", "Opatchade enheter förblir måltavlor."],
            legal: ["Public commitments are promises.", "Offentliga åtaganden är löften."],
            reputational: ["How you treat the researcher today shapes the next report.", "Hur ni behandlar forskaren i dag formar nästa rapport."]
          },
          evaluation: [["Commits to the remaining exposure, not only the fix", "Åtar sig den kvarvarande exponeringen, inte bara rättningen"]],
          pushback: {
            A: [
              pb(["Every device is a promise", "Varje enhet är ett löfte"], ["A plan to reach every remaining device includes customers who have not been in touch for years, and devices nobody can locate. Journalists will ask in six months how many are still exposed. Can you keep this promise, and what number will you publish?", "En plan för att nå varje kvarvarande enhet omfattar kunder som inte hört av sig på flera år, och enheter som ingen kan hitta. Journalister kommer att fråga om sex månader hur många som fortfarande är exponerade. Kan ni hålla löftet, och vilken siffra kommer ni att publicera?"]),
              pb(["Thanks for the headline?", "Tack för rubriken?"], ["Some board members object to thanking the researcher publicly on the day their write-up puts you in the headlines. They see it as rewarding the person who embarrassed you. Do you still thank them, and who stands up to say it?", "Några i styrelsen invänder mot att tacka forskaren offentligt samma dag som genomgången sätter er i rubrikerna. De ser det som att belöna den som gjorde er generade. Tackar ni ändå, och vem ställer sig upp och säger det?"]),
              pb(["The policy invites more", "Policyn lockar fler"], ["Publishing a disclosure policy today invites every researcher who read the write-up to look at your other products, and other old compatibility paths are still there. Are you ready for the reports that will follow, and who will answer them?", "Att publicera en policy för sårbarhetsrapporter i dag bjuder in varje forskare som läst genomgången att titta på era andra produkter, och andra gamla kompatibilitetsvägar finns kvar. Är ni redo för rapporterna som kommer, och vem ska svara på dem?"])
            ],
            B: [
              pb(["Fixed for whom?", "Åtgärdat för vem?"], ["Your statement says fixed, but 39 percent of devices still lack the firmware. A journalist asks whether that sentence is true for those customers. Do you correct the statement, or defend the wording?", "Ert uttalande säger åtgärdat, men 39 procent av enheterna saknar fortfarande firmwaren. En journalist frågar om den meningen stämmer för de kunderna. Rättar ni uttalandet, eller försvarar ni formuleringen?"]),
              pb(["The weeks before", "Veckorna före"], ["Journalists are already asking about the weeks before the report, when devices were taken over. A statement that says only “fixed” looks like it avoids that question. Who answers it, and what do they say?", "Journalister frågar redan om veckorna före rapporten, när enheter togs över. Ett uttalande som bara säger ”åtgärdat” ser ut att undvika den frågan. Vem svarar på den, och vad säger ni?"]),
              pb(["The researcher replies", "Forskaren svarar"], ["The researcher notes publicly that your statement does not mention them, the exploitation or the unpatched devices. Their readers include the researchers you will need next time. Do you add to the statement, or let their post stand as the fuller account?", "Forskaren påpekar offentligt att ert uttalande inte nämner forskaren, utnyttjandet eller de opatchade enheterna. Bland läsarna finns de forskare ni kommer att behöva nästa gång. Kompletterar ni uttalandet, eller låter ni forskarens inlägg stå som den fullständiga berättelsen?"])
            ],
            C: [
              pb(["“Am I safe?”", "”Är jag säker?”"], ["The advisory is written for engineers. The customer who asks “Am I safe?” cannot read it, and each written answer to a journalist takes a day. Who explains this in plain language, and when?", "Säkerhetsinformationen är skriven för tekniker. Kunden som frågar ”Är jag säker?” kan inte läsa den, och varje skriftligt svar till en journalist tar ett dygn. Vem förklarar det här på vanligt språk, och när?"]),
              pb(["The empty chair", "Den tomma stolen"], ["Tonight's news runs “the company declined to be interviewed” next to an interview with the researcher. Your silence has become part of the story. Do you put someone forward after all, and who?", "Kvällens nyheter visar ”företaget avböjde att ställa upp på intervju” bredvid en intervju med forskaren. Er tystnad har blivit en del av historien. Ställer ni upp med någon ändå, och vem?"]),
              pb(["Partners speak for you", "Partnerna talar åt er"], ["The {{num.oemPartners}} partners are giving interviews about their own products, each explaining the flaw in their own words, and some are blaming your component. Do you let them tell your part of the story, or step in?", "De {{num.oemPartners}} partnerna ger intervjuer om sina egna produkter, förklarar felet med egna ord, och några lägger skulden på er komponent. Låter ni dem berätta er del av historien, eller kliver ni in?"])
            ]
          }
        }),
        facilitator: fac(
          ["End on the relationship: the next researcher will read how this one was treated.", "Avsluta med relationen: nästa forskare kommer att läsa hur den här behandlades."],
          ["Public thanks, a disclosure policy and a long-tail patch plan.", "Offentligt tack, en policy för sårbarhetsrapporter och en plan för de sista enheterna."],
          [["Ask: would you want to report a flaw to yourselves?", "Fråga: skulle ni själva vilja rapportera ett fel till er?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The flaw is fixed and disclosed in coordination with partners and the researcher, but devices were hijacked before the report and many remain unpatched.",
        "Felet är rättat och offentliggjort i samordning med partner och forskaren, men enheter kapades före rapporten och många är fortfarande opatchade."
      ])
    },

    debrief: {
      keyLessons: [
        L(["A private vulnerability report is a gift: answer quickly and as a partner.", "En privat sårbarhetsrapport är en gåva: svara snabbt och som en partner."]),
        L(["Shared components make your flaw your partners' flaw: coordinate one disclosure.", "Gemensamma komponenter gör ert fel till era partners fel: samordna ett gemensamt offentliggörande."]),
        L(["Look for exploitation before the report; you are rarely the first to know.", "Leta efter utnyttjande före rapporten; ni är sällan först med att veta."]),
        L(["Exploited vulnerabilities carry short reporting deadlines: give someone the job of knowing them.", "Utnyttjade sårbarheter har korta rapporteringsfrister: ge någon ansvaret att känna till dem."])
      ],
      assumptionsVsReality: [
        avr(["A bug in one portal.", "Ett fel i en portal."], ["A shared component in many products.", "En gemensam komponent i många produkter."], "p2"),
        avr(["Only the researcher knows.", "Bara forskaren vet."], ["It was exploited for weeks.", "Felet hade utnyttjats i flera veckor."], "p4"),
        avr(["Disclosure is between us and the researcher.", "Offentliggörandet är en sak mellan oss och forskaren."], ["Authorities had to be told within a day.", "Myndigheterna skulle informeras inom ett dygn."], "p5")
      ],
      strengthsToLookFor: [
        L(["A warm, fast first reply to the researcher", "Ett vänligt, snabbt första svar till forskaren"]),
        L(["Checking logs for earlier exploitation", "Att kontrollera loggarna efter tidigare utnyttjande"]),
        L(["A server-side mitigation while firmware rolls out", "Ett skydd på serversidan medan den nya firmwaren rullas ut"])
      ],
      commonGaps: [
        L(["Legal threats against researchers", "Juridiska hot mot forskare"]),
        L(["Forgetting white-label partners", "Att glömma partner som säljer under egna varumärken"]),
        L(["Not knowing product reporting duties", "Att inte känna till rapporteringsskyldigheterna för produkter"])
      ],
      suggestedActions: [
        act(["Publish a vulnerability disclosure policy with a named contact.", "Publicera en policy för sårbarhetsrapporter med en namngiven kontakt."], "ciso", "high"),
        act(["Keep a component inventory that includes partners' products.", "För en komponentförteckning som även omfattar partners produkter."], "devLead", "high"),
        act(["Assign an owner for product vulnerability reporting duties.", "Utse en ägare för rapporteringsskyldigheterna för sårbarheter i produkter."], "legal", "high"),
        act(["Retire compatibility API paths on a schedule.", "Avveckla API-vägar för kompatibilitet enligt en fast plan."], "cio", "medium")
      ]
    }
  });
})();
