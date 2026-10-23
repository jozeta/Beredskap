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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Respond to a vulnerability report in good faith", "Bemöta en sårbarhetsrapport i god tro"]) },
      { id: "lo2", text: L(["Find every product that shares a vulnerable component", "Hitta alla produkter som delar en sårbar komponent"]) },
      { id: "lo3", text: L(["Meet reporting duties for exploited vulnerabilities", "Uppfylla rapporteringsskyldigheter för utnyttjade sårbarheter"]) },
      { id: "lo4", text: L(["Protect customers who cannot update quickly", "Skydda kunder som inte kan uppdatera snabbt"]) }
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
          ["Send the legal letter.", "Skicka det juridiska brevet."],
          ["Do not reply until the flaw is verified.", "Svara inte förrän felet är verifierat."]
        ], {
          knowns: [["A detailed report with a proof of concept has arrived.", "En detaljerad rapport med konceptbevis har kommit."]],
          uncertainties: [["Whether the flaw is real and how far it reaches.", "Om felet är verkligt och hur långt det sträcker sig."]],
          tradeoffs: {
            operational: ["Committing to a timeline puts pressure on three teams.", "Att binda sig till en tidsplan sätter tryck på tre team."],
            security: ["A researcher who feels ignored may publish early.", "En forskare som känner sig ignorerad kan publicera tidigt."],
            legal: ["A threatening letter can become the headline.", "Ett hotfullt brev kan bli rubriken."],
            reputational: ["How you treat researchers is visible to the whole community.", "Hur ni behandlar forskare syns för hela gemenskapen."]
          },
          evaluation: [["Treats the researcher as a partner from the first reply", "Behandlar forskaren som en partner från första svaret"]]
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
          evaluation: [["Coordinates one disclosure across every affected vendor", "Samordnar ett offentliggörande för alla berörda leverantörer"]]
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
          ["Wait for firmware and let customers update at their own pace.", "Vänta på firmware och låt kunderna uppdatera i sin egen takt."],
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
          evaluation: [["Reduces exposure for everyone, not just the customers who update", "Minskar exponeringen för alla, inte bara för kunderna som uppdaterar"]]
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
          ["Quietly reset the hijacked devices and say nothing.", "Återställ de kapade enheterna i tysthet och säg ingenting."]
        ], {
          knowns: [["The flaw has been exploited for weeks.", "Felet har utnyttjats i flera veckor."]],
          uncertainties: [["Who is behind the unknown accounts.", "Vem som ligger bakom de okända kontona."]],
          tradeoffs: {
            operational: ["Blocking the old path everywhere may disconnect some old devices.", "Att blockera den äldre vägen överallt kan koppla bort en del gamla enheter."],
            security: ["Exploitation continues every day you wait.", "Utnyttjandet fortsätter varje dag ni väntar."],
            legal: ["An exploited flaw changes your reporting duties.", "Ett utnyttjat fel ändrar era rapporteringsskyldigheter."],
            reputational: ["Silence about exploitation is the worst story of all.", "Tystnad om utnyttjandet är den värsta historien av alla."]
          },
          evaluation: [["Moves from coordinated disclosure to active incident response", "Går från samordnat offentliggörande till aktiv incidenthantering"]]
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
          evaluation: [["Reports now with the true timeline", "Rapporterar nu med den sanna tidslinjen"]]
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
          ["No comment beyond the advisory.", "Ingen kommentar utöver säkerhetsinformationen."]
        ], {
          knowns: [["The flaw, the fix and the earlier exploitation are public.", "Felet, rättningen och det tidigare utnyttjandet är offentliga."]],
          uncertainties: [["How many devices will ever be updated.", "Hur många enheter som någonsin kommer att uppdateras."]],
          tradeoffs: {
            operational: ["Reaching every device is a long project.", "Att nå varje enhet är ett långt projekt."],
            security: ["Unpatched devices remain targets.", "Opatchade enheter förblir måltavlor."],
            legal: ["Public commitments are promises.", "Offentliga åtaganden är löften."],
            reputational: ["How you treat the researcher today shapes the next report.", "Hur ni behandlar forskaren i dag formar nästa rapport."]
          },
          evaluation: [["Commits to the remaining exposure, not only the fix", "Åtar sig den kvarvarande exponeringen, inte bara rättningen"]]
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
