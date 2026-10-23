/*
 * s26-shadow-ai.js — "The Helpful Assistant" (archetype F, policy breach).
 *
 * A sales rep's forwarded summary shows customer contract terms pasted into a
 * public AI chat service → it is a whole team, encouraged by their manager to
 * hit targets → one customer's contract forbids sharing with third parties and
 * the service's terms allow training on inputs → a customer finds a familiar
 * clause in a competitor's proposal → discipline or fix the system.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s26-shadow-ai",
    version: 1,
    category: "policy-breach",
    archetype: "human-legal-reputational",
    emblem: "shadow-ai",
    title: L(["The Helpful Assistant", "Den hjälpsamma assistenten"]),
    summary: L([
      "A sales team has found a faster way to write proposals: paste customer contracts into a free AI chat service. Nobody stole anything. That is exactly what makes it hard.",
      "Ett säljteam har hittat ett snabbare sätt att skriva offerter: klistra in kundavtal i en gratis AI-tjänst. Ingen har stulit något. Det är just det som gör det svårt."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Assess a policy breach by its data, not by its intent", "Bedöma ett policybrott utifrån datan, inte avsikten"]), teaser: L(["What a good intention can cost", "Vad en god avsikt kan kosta"]) },
      { id: "lo2", text: L(["Decide whether shared data is a personal data breach and a contract breach", "Avgöra om delad data är en personuppgiftsincident och ett avtalsbrott"]), teaser: L(["Promises made on paper", "Löften som getts på papper"]) },
      { id: "lo3", text: L(["Respond proportionately when many people broke the same rule", "Agera proportionerligt när många bröt mot samma regel"]), teaser: L(["When everyone did it", "När alla gjorde det"]) },
      { id: "lo4", text: L(["Replace a forbidden tool with an approved one people will use", "Ersätta ett förbjudet verktyg med ett godkänt som folk faktiskt använder"]), teaser: L(["Making the right way the easy way", "Att göra rätt sätt till det enkla sättet"]) }
    ],
    mitre: ["T1567", "T1213", "T1530"],
    frameworks: {
      nistCsf: ["GV.PO", "GV.RR", "ID.AM", "PR.AT", "PR.DS", "RS.CO"],
      iso27001: ["A.5.10", "A.5.12", "A.5.14", "A.5.23", "A.5.34", "A.6.3", "A.6.4"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours" },
    actor: { types: ["insider"], motivation: L(["None malicious: staff trying to work faster under target pressure", "Inget illasinnat: personal som försöker arbeta snabbare under press att nå mål"]), capability: "low" },
    variables: {
      reps: { min: 6, max: 40, scaleBy: "size" },
      contracts: { min: 30, max: 600, scaleBy: "size" },
      contacts: { min: 120, max: 4000, scaleBy: "size", step: 10 }
    },
    roles: ["incidentCommander", "ciso", "legal", "dpo", "hr", "ceo", "comms", "cio", "serviceOwner", "supplierManager"],

    groundTruth: {
      rootCause: L([
        "For six months the sales team pasted contract terms, prices and named customer contacts into a free public AI chat service to draft proposals faster. Their manager suggested it at a team meeting. The service's terms allowed inputs to be used to improve its models. No approved alternative existed, and the acceptable-use policy did not mention AI tools. A clause from one customer's contract later appeared nearly word for word in a competitor's proposal; the link to the AI service was never proven.",
        "I sex månader klistrade säljteamet in avtalsvillkor, priser och namngivna kundkontakter i en gratis, öppen AI-tjänst för att skriva offerter snabbare. Deras chef föreslog det på ett teammöte. Tjänstens villkor tillät att det som matades in användes för att förbättra modellerna. Det fanns inget godkänt alternativ, och riktlinjerna för tillåten användning nämnde inte AI-verktyg. En klausul ur en kunds avtal dök senare upp nästan ordagrant i en konkurrents offert; kopplingen till AI-tjänsten bevisades aldrig."
      ]),
      attackerTimeline: [
        { at: -262800, text: L(["Sales manager suggests the AI service at a team meeting.", "Säljchefen föreslår AI-tjänsten på ett teammöte."]) },
        { at: -175200, text: L(["Most of the team uses it daily, including full contract texts.", "De flesta i teamet använder den dagligen, även med hela avtalstexter."]) },
        { at: 0, text: L(["A forwarded summary reveals the practice.", "En vidarebefordrad sammanfattning avslöjar arbetssättet."]) },
        { at: 4320, text: L(["A customer finds a familiar clause in a competitor's proposal.", "En kund hittar en välbekant klausul i en konkurrents offert."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-team", revealStage: "p2", text: L(["The practice was suggested by the sales manager and used by most of the team for half a year.", "Arbetssättet föreslogs av säljchefen och användes av större delen av teamet i ett halvår."]) },
      { id: "hf-terms", revealStage: "p3", text: L(["The free tier's terms let the provider reuse inputs to improve its models.", "Gratisnivåns villkor lät leverantören återanvända inmatad text för att förbättra sina modeller."]) },
      { id: "hf-clause", revealStage: "p4", text: L(["A customer-specific clause has surfaced in a competitor's proposal, with no proven route.", "En kundspecifik klausul har dykt upp i en konkurrents offert, utan bevisad väg dit."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["A very good proposal", "En mycket bra offert"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. A customer's procurement lead forwards a proposal from {{org.name}} back to your sales team by mistake, together with the long AI conversation that produced it.\n\nThe conversation is still attached. It shows a sales rep pasting in the customer's full contract, last year's price list and a list of named contacts, then asking the assistant to “make it more persuasive”. The proposal was excellent.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. En kunds inköpschef skickar av misstag tillbaka en offert från {{org.name}} till ert säljteam, tillsammans med den långa AI-konversation som tog fram den.\n\nKonversationen är fortfarande bifogad. Den visar hur en säljare klistrar in kundens hela avtal, fjolårets prislista och en lista med namngivna kontaktpersoner, och sedan ber assistenten ”göra den mer övertygande”. Offerten blev utmärkt."
        ]),
        injects: [
          inj("i1-1", 0, "email", "customer", "medium", "confirmed", [
            "“Sorry, I think this was meant for you rather than us — the chat log was attached to your proposal. Great offer by the way.”",
            "”Förlåt, jag tror att det här var tänkt för er och inte för oss – chattloggen satt bifogad till er offert. Bra erbjudande förresten.”"
          ], { headline: ["Fwd: Proposal and attachment", "Vb: Offert och bilaga"], meta: { subject: L(["Fwd: Proposal and attachment", "Vb: Offert och bilaga"]), attachment: L(["chat-export.txt", "chatt-export.txt"]) }, tests: ["lo1"] }),
          inj("i1-2", 20, "employeeReport", "employee", "low", "confirmed", [
            "The sales rep: “It's just a writing tool. Everyone uses it. I deleted the chat afterwards, so it's gone.”",
            "Säljaren: ”Det är bara ett skrivverktyg. Alla använder det. Jag raderade chatten efteråt, så den är borta.”"
          ], { tests: ["lo1", "lo3"] }),
          inj("i1-3", 35, "chat", "person.serviceOwner", "medium", "misleading", [
            "“Let's not turn a productivity tool into an incident. Nothing was hacked and the customer is happy.”",
            "”Låt oss inte göra ett produktivitetsverktyg till en incident. Inget har hackats och kunden är nöjd.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["True on its face, but the data left your control the moment it was pasted.", "Sant vid första anblick, men datan lämnade er kontroll i samma stund som den klistrades in."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("What exactly left the company in that conversation?", "Vad exakt lämnade företaget i den konversationen?", ["ciso", "dpo"]),
            q("Does deleting the chat delete the data at the provider?", "Raderas datan hos leverantören när chatten raderas?", ["cio", "ciso"]),
            q("How would you know whether anyone else does the same?", "Hur skulle ni veta om någon annan gör samma sak?", ["cio"])
          ],
          executive: [
            q("Is this a security incident, an HR matter, or both?", "Är det här en säkerhetsincident, en personalfråga eller båda?", ["incidentCommander", "hr"]),
            q("Who decides, and who needs to know today?", "Vem bestämmer, och vem behöver veta det i dag?", ["incidentCommander", "legal"]),
            q("What do you say to the customer who sent it back?", "Vad säger ni till kunden som skickade tillbaka det?", ["serviceOwner", "comms"])
          ]
        },
        challenges: [ch("The rep is the team's top performer this quarter.", "Säljaren är teamets bästa säljare det här kvartalet.")],
        decision: dec("d1", "incidentCommander", ["How do you treat this?", "Hur behandlar ni det här?"], [
          ["Open a data incident: establish what was shared, by whom and where it went.", "Öppna en dataincident: ta reda på vad som delades, av vem och vart det tog vägen."],
          ["Handle it as a one-off conduct issue with the rep's manager.", "Hantera det som en enstaka uppförandefråga med säljarens chef."],
          ["Thank the customer and move on: nothing was stolen.", "Tacka kunden och gå vidare: inget stals."]
        ], {
          knowns: [["A full contract and named contacts were pasted into an external service.", "Ett helt avtal och namngivna kontakter klistrades in i en extern tjänst."]],
          uncertainties: [["How often it happened, and what the provider keeps.", "Hur ofta det hänt, och vad leverantören sparar."]],
          tradeoffs: {
            operational: ["An incident takes people away from selling in the last week of the quarter.", "En incident tar folk från försäljningen sista veckan i kvartalet."],
            security: ["Treating it as a one-off hides a pattern if there is one.", "Att behandla det som en engångshändelse döljer ett mönster om det finns ett."],
            legal: ["Contract and data protection duties may already apply.", "Avtals- och dataskyddsskyldigheter kan redan gälla."],
            reputational: ["The customer has seen how their contract was handled.", "Kunden har sett hur deras avtal hanterades."]
          },
          evaluation: [["Looks at what data left, rather than at whether anyone meant harm", "Tittar på vilken data som lämnade, i stället för om någon menade illa"]]
        }),
        facilitator: fac(
          ["The trap is “nobody meant harm, so there is no incident”. Steer towards the data.", "Fällan är ”ingen menade illa, alltså finns ingen incident”. Styr mot datan."],
          ["Open an incident, scope the practice, involve the DPO and legal early.", "Öppna en incident, kartlägg arbetssättet, ta in dataskyddsombudet och juristen tidigt."],
          [["Ask: if a USB stick with the same files had been left on a train, what would you do?", "Fråga: om ett usb-minne med samma filer hade glömts på ett tåg, vad hade ni gjort då?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 1440,
        title: L(["Not one rep", "Inte en säljare"]),
        twist: L(["It is not one rep. The proxy logs show {{num.reps}} people in sales using the same AI service daily for six months, and the team's own meeting notes show the manager recommending it.", "Det är inte en säljare. Proxyloggarna visar {{num.reps}} personer på säljavdelningen som använt samma AI-tjänst dagligen i sex månader, och teamets egna mötesanteckningar visar att chefen rekommenderade den."]),
        twistKind: "scope",
        assumptionChallenged: L(["One person made a mistake.", "En person gjorde ett misstag."]),
        reveals: ["hf-team"],
        narrative: L([
          "{{time.T+1440|weekday|cap}}. {{person.cio.name}} has pulled six months of web proxy logs for the AI service's address, expecting a handful of visits from one desk.\n\nThe chart that comes back looks like a second working day. Uploads start every morning at nine, peak before the Friday sales meeting, and come from almost every desk in the sales department.",
          "{{time.T+1440|weekday|cap}}. {{person.cio.name}} har tagit fram sex månaders proxyloggar för AI-tjänstens adress och väntar sig en handfull besök från ett skrivbord.\n\nDiagrammet som kommer tillbaka ser ut som en andra arbetsdag. Uppladdningarna börjar varje morgon klockan nio, toppar före fredagens säljmöte och kommer från nästan varje skrivbord på säljavdelningen."
        ]),
        injects: [
          inj("i2-1", 1440, "logExcerpt", "itOps", "high", "confirmed", [
            "Proxy: {{num.reps}} distinct users in Sales posting to the AI service. Median upload 14 KB, largest 2.1 MB. Earliest: six months ago, the week after the spring kick-off.",
            "Proxy: {{num.reps}} olika användare på Sälj som skickar data till AI-tjänsten. Medianstorlek 14 kB, största 2,1 MB. Tidigast: för sex månader sedan, veckan efter vårens kickoff."
          ], { reveals: ["hf-team"], tests: ["lo3"] }),
          inj("i2-2", 1500, "employeeReport", "person.hr", "medium", "confirmed", [
            "Team meeting notes, spring kick-off: “Tip from the manager: use the free AI assistant for proposals, it saves hours. Paste the contract in and ask for a summary.”",
            "Anteckningar från teammöte, vårens kickoff: ”Tips från chefen: använd den kostnadsfria AI-assistenten till offerter, det sparar timmar. Klistra in avtalet och be om en sammanfattning.”"
          ], { tests: ["lo3"] })
        ],
        charts: [{
          id: "c2-uploads", type: "line",
          title: L(["Uploads to the AI service", "Uppladdningar till AI-tjänsten"]), unit: L(["uploads per week", "uppladdningar per vecka"]),
          caption: L(["Weeks before the forwarded proposal.", "Veckor före den vidarebefordrade offerten."]),
          data: line(["Uploads", "Uppladdningar"], -26, 0, 2, (x, ctx) => (x < -24 ? 0 : ctx.vars.reps * (4 + (x + 26) * 0.4)), "weeks")
        }],
        questions: {
          technical: [
            q("Can you tell from the logs which uploads held contracts or personal data?", "Kan ni se i loggarna vilka uppladdningar som innehöll avtal eller personuppgifter?", ["ciso", "cio"]),
            q("Should you block the service today, and what will people use instead?", "Ska ni blockera tjänsten i dag, och vad kommer folk att använda i stället?", ["cio"]),
            q("Was opening an incident on day one the right call, now you see the scale?", "Var det rätt att öppna en incident första dagen, nu när ni ser omfattningen?", ["incidentCommander"], "d1")
          ],
          executive: [
            q("Who is accountable when a manager told the team to do it?", "Vem är ansvarig när en chef sa åt teamet att göra så?", ["hr", "ceo"]),
            q("What does the acceptable-use policy actually say about AI tools?", "Vad säger riktlinjerna för tillåten användning faktiskt om AI-verktyg?", ["legal", "ciso"]),
            q("If you had treated it as one rep's mistake, where would you be now?", "Om ni hade behandlat det som en enskild säljares misstag, var hade ni varit nu?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The policy forbids “unapproved cloud storage” but says nothing about AI tools.", "Riktlinjerna förbjuder ”ej godkänd molnlagring” men säger ingenting om AI-verktyg.")],
        decision: dec("d2", "ciso", ["What happens to the AI service today?", "Vad händer med AI-tjänsten i dag?"], [
          ["Block it, tell staff why, and offer an approved alternative within days.", "Blockera den, berätta för personalen varför och erbjud ett godkänt alternativ inom några dagar."],
          ["Block it quietly and say nothing until the review is done.", "Blockera den i tysthet och säg ingenting förrän granskningen är klar."],
          ["Leave it open: blocking it will only push people to their phones.", "Låt den vara öppen: en blockering driver bara folk till sina mobiler."]
        ], {
          knowns: [["Most of the sales team used the service with customer data.", "Större delen av säljteamet använde tjänsten med kunddata."]],
          uncertainties: [["What the provider retained, and for how long.", "Vad leverantören sparade, och hur länge."]],
          tradeoffs: {
            operational: ["Sales loses a tool it depends on at quarter end.", "Säljavdelningen förlorar ett verktyg den är beroende av vid kvartalsskiftet."],
            security: ["A silent block teaches people to hide their tools better.", "En tyst blockering lär folk att dölja sina verktyg bättre."],
            legal: ["Continued use adds to the exposure every day.", "Fortsatt användning ökar exponeringen varje dag."],
            reputational: ["Staff will talk about how the company reacted.", "Personalen kommer att prata om hur företaget reagerade."]
          },
          evaluation: [["Stops the flow and gives people a legitimate way to do the work", "Stoppar flödet och ger folk ett legitimt sätt att göra jobbet"]]
        }),
        facilitator: fac(
          ["Scope flips the question from discipline to system failure. Watch who still wants a scapegoat.", "Omfattningen vänder frågan från disciplin till systemfel. Se vem som fortfarande vill ha en syndabock."],
          ["Block with an explanation and a fast, approved alternative.", "Blockera med en förklaring och ett snabbt, godkänt alternativ."],
          [["Ask: what would you have done in their place, with their targets?", "Fråga: vad hade ni gjort i deras ställe, med deras mål?"]]
        )
      },
      {
        id: "p3",
        clock: 2880,
        priority: 1,
        title: L(["The small print", "Det finstilta"]),
        twist: L(["The free tier's terms let the provider use inputs to improve its models, and one customer's contract forbids sharing its terms with any third party, with a penalty clause.", "Gratisnivåns villkor låter leverantören använda inmatad text för att förbättra sina modeller, och en kunds avtal förbjuder att villkoren delas med tredje part, med en vitesklausul."]),
        twistKind: "impact",
        assumptionChallenged: L(["The AI service just processes text and forgets it.", "AI-tjänsten bearbetar bara text och glömmer den."]),
        reveals: ["hf-terms"],
        narrative: L([
          "{{time.T+2880|weekday|cap}}. {{person.legal.name}} has read two documents nobody in sales ever opened: the AI service's terms of use and the confidentiality clauses in the {{num.contracts}} customer contracts the team has worked on.\n\nThe two documents disagree with each other. One promises customers that their terms stay inside {{org.name}}. The other says what the provider may do with everything it is given.",
          "{{time.T+2880|weekday|cap}}. {{person.legal.name}} har läst två dokument som ingen på säljavdelningen någonsin öppnade: AI-tjänstens användarvillkor och sekretessklausulerna i de {{num.contracts}} kundavtal som teamet har arbetat med.\n\nDe två dokumenten säger emot varandra. Det ena lovar kunderna att deras villkor stannar inom {{org.name}}. Det andra säger vad leverantören får göra med allt den får."
        ]),
        injects: [
          inj("i3-1", 2880, "advisory", "person.legal", "high", "confirmed", [
            "Terms of the free tier, section 4: “We may use content you submit to develop and improve our services.” Retention: “as long as necessary”. Opt-out: business plans only.",
            "Villkor för gratisnivån, avsnitt 4: ”Vi får använda innehåll du skickar in för att utveckla och förbättra våra tjänster.” Lagring: ”så länge som behövs”. Möjlighet att avstå: endast företagsabonnemang."
          ], { headline: ["Legal review: AI service terms", "Juridisk granskning: AI-tjänstens villkor"], reveals: ["hf-terms"], tests: ["lo2"] }),
          inj("i3-2", 2940, "executiveMessage", "person.dpo", "high", "confirmed", [
            "“About {{num.contacts|number}} named customer contacts were pasted in over six months. That is personal data sent to a processor we have no agreement with. I need a decision on notification.”",
            "”Omkring {{num.contacts|number}} namngivna kundkontakter klistrades in under sex månader. Det är personuppgifter som skickats till ett personuppgiftsbiträde vi saknar avtal med. Jag behöver ett beslut om anmälan.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Can you ask the provider to delete what was sent, and prove it happened?", "Kan ni be leverantören radera det som skickades, och bevisa att det skett?", ["cio", "supplierManager"]),
            q("Which contracts have confidentiality or no-third-party clauses?", "Vilka avtal har sekretess- eller tredjepartsklausuler?", ["legal"]),
            q("Did the block and the alternative hold, or are people finding new tools?", "Höll blockeringen och alternativet, eller hittar folk nya verktyg?", ["cio"], "d2")
          ],
          executive: [
            q("Is this notifiable to {{reg.dpaShort}}, and on what reasoning?", "Är det här anmälningspliktigt till {{reg.dpaShort}}, och med vilket resonemang?", ["dpo", "legal"]),
            q("Do you tell affected customers before they ask?", "Berättar ni för berörda kunder innan de frågar?", ["serviceOwner", "ceo"]),
            q("Did telling staff why you blocked the service help or hurt?", "Hjälpte eller stjälpte det att berätta för personalen varför tjänsten blockerades?", ["ciso"], "d2")
          ]
        },
        challenges: [ch("The provider's support answers deletion requests within 30 days, “where technically feasible”.", "Leverantörens support besvarar raderingsbegäranden inom 30 dagar, ”där det är tekniskt möjligt”.")],
        decision: dec("d3", "legal", ["How do you handle the customers and the regulator?", "Hur hanterar ni kunderna och tillsynsmyndigheten?"], [
          ["Request deletion, assess notification with the DPO, and tell customers with confidentiality clauses proactively.", "Begär radering, bedöm anmälan med dataskyddsombudet och berätta självmant för kunder med sekretessklausuler."],
          ["Request deletion and say nothing unless a customer asks.", "Begär radering och säg ingenting om inte en kund frågar."],
          ["Notify everyone, regulator and all customers, immediately.", "Anmäl till alla, tillsynsmyndigheten och samtliga kunder, omedelbart."]
        ], {
          knowns: [["Personal data and confidential terms went to a provider without an agreement.", "Personuppgifter och konfidentiella villkor gick till en leverantör utan avtal."]],
          uncertainties: [["Whether anything was retained or reused.", "Om något sparades eller återanvändes."]],
          tradeoffs: {
            operational: ["Proactive contact keeps account managers busy for weeks.", "Proaktiv kontakt håller kundansvariga sysselsatta i veckor."],
            security: ["Deletion requests may never be confirmed.", "Raderingsbegäranden kanske aldrig bekräftas."],
            legal: ["Silence is a breach of the confidentiality clauses in itself.", "Tystnad är i sig ett brott mot sekretessklausulerna."],
            reputational: ["Customers hearing it from someone else is the worst version.", "Att kunderna får höra det från någon annan är den sämsta versionen."]
          },
          evaluation: [["Meets both contract and data protection duties, in proportion to the facts", "Uppfyller både avtals- och dataskyddsskyldigheter, i proportion till fakta"]]
        }),
        facilitator: fac(
          ["Two regimes at once: data protection and contracts. Groups often handle one and forget the other.", "Två regelverk samtidigt: dataskydd och avtal. Grupper hanterar ofta det ena och glömmer det andra."],
          ["Deletion request, documented notification assessment, proactive contact with clause holders.", "Raderingsbegäran, dokumenterad bedömning av anmälan, proaktiv kontakt med dem som har klausuler."],
          [["Ask: what did you promise these customers in writing?", "Fråga: vad har ni lovat de här kunderna skriftligt?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 4320,
        title: L(["A familiar sentence", "En välbekant mening"]),
        twist: L(["A customer calls: a competitor's proposal contains a clause from their contract with you, almost word for word. Nobody can prove how it got there, and the customer wants an answer by Friday.", "En kund ringer: en konkurrents offert innehåller en klausul ur deras avtal med er, nästan ordagrant. Ingen kan bevisa hur den hamnade där, och kunden vill ha svar till fredag."]),
        twistKind: "cause",
        assumptionChallenged: L(["Pasting text into a chat service has no consequences you will ever see.", "Att klistra in text i en chattjänst får inga följder som ni någonsin kommer att märka."]),
        reveals: ["hf-clause"],
        narrative: L([
          "{{time.T+4320|weekday|cap}}. The review is going well. The service is blocked, an approved assistant is being tested, and the first customers have been told calmly.\n\nThen {{person.serviceOwner.name}} takes a call from one of your largest customers. Their procurement team has received a proposal from a competitor, and one paragraph looks very familiar to them.",
          "{{time.T+4320|weekday|cap}}. Granskningen går bra. Tjänsten är blockerad, en godkänd assistent testas och de första kunderna har fått beskedet på ett lugnt sätt.\n\nSedan tar {{person.serviceOwner.name}} ett samtal från en av era största kunder. Deras inköpsavdelning har fått en offert från en konkurrent, och ett stycke ser mycket bekant ut för dem."
        ]),
        injects: [
          inj("i4-1", 4320, "phoneTranscript", "customer", "high", "confirmed", [
            "Their head of procurement: “Paragraph 7.3 in their proposal is our clause with you. The odd payment terms, the wording, all of it. Did you share our contract?”",
            "Deras inköpschef: ”Punkt 7.3 i deras offert är vår klausul med er. De udda betalningsvillkoren, formuleringen, alltihop. Har ni delat vårt avtal?”"
          ], { reveals: ["hf-clause"], tests: ["lo2"] }),
          inj("i4-2", 4380, "chat", "person.cio", "medium", "unverified", [
            "“We can't prove it came from the AI service. Clauses get reused across the industry, and staff move between companies. But we can't rule it out either.”",
            "”Vi kan inte bevisa att den kom från AI-tjänsten. Klausuler återanvänds i branschen och folk byter jobb. Men vi kan inte utesluta det heller.”"
          ], { tests: ["lo1"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["What the review found", "Vad granskningen hittade"]),
          data: kpi([
            { id: "reps", label: ["Staff who used the service", "Anställda som använde tjänsten"], value: (v) => v.reps, tone: "warn" },
            { id: "con", label: ["Contracts possibly pasted", "Avtal som kan ha klistrats in"], value: (v) => v.contracts, tone: "warn" },
            { id: "ppl", label: ["Named contacts shared", "Namngivna kontakter som delats"], value: (v) => v.contacts, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("What evidence would show where the clause came from?", "Vilka belägg skulle visa var klausulen kom ifrån?", ["ciso", "legal"]),
            q("Is the customer's contract in the proxy logs at all?", "Finns kundens avtal över huvud taget i proxyloggarna?", ["cio"]),
            q("Did the decision about telling customers proactively help with this one?", "Hjälpte beslutet om att berätta för kunderna självmant i det här fallet?", ["serviceOwner"], "d3")
          ],
          executive: [
            q("What do you tell the customer when the honest answer is “we don't know”?", "Vad säger ni till kunden när det ärliga svaret är ”vi vet inte”?", ["ceo", "serviceOwner"]),
            q("Is there a penalty to pay, and do you offer it before they ask?", "Finns det ett vite att betala, och erbjuder ni det innan de frågar?", ["legal", "ceo"]),
            q("Would silence towards customers have made this call worse?", "Hade tystnad mot kunderna gjort det här samtalet värre?", ["comms"], "d3")
          ]
        },
        challenges: [ch("The competitor recently hired one of your former account managers.", "Konkurrenten anställde nyligen en av era tidigare kundansvariga.")],
        decision: dec("d4", "ceo", ["What do you tell the customer?", "Vad säger ni till kunden?"], [
          ["The truth: their contract was pasted into an AI service, you cannot prove or rule out the link, and here is what you have done.", "Sanningen: deras avtal klistrades in i en AI-tjänst, ni kan varken bevisa eller utesluta kopplingen, och här är vad ni har gjort."],
          ["Point to the former employee as the likelier route.", "Peka på den tidigare medarbetaren som den troligare vägen."],
          ["Deny any sharing until the investigation is complete.", "Förneka all delning tills utredningen är klar."]
        ], {
          knowns: [["The customer's contract was among those pasted in.", "Kundens avtal fanns bland dem som klistrades in."]],
          uncertainties: [["How the clause actually reached the competitor.", "Hur klausulen faktiskt nådde konkurrenten."]],
          tradeoffs: {
            operational: ["Honesty may cost the account; denial may cost all of them.", "Ärlighet kan kosta kunden; förnekelse kan kosta alla kunder."],
            security: ["Blaming the former employee without evidence is its own risk.", "Att skylla på den tidigare medarbetaren utan belägg är en risk i sig."],
            legal: ["A denial that later proves false worsens the contract position.", "Ett förnekande som senare visar sig falskt försämrar avtalsläget."],
            reputational: ["The customer already suspects; they are testing your honesty.", "Kunden misstänker redan; de prövar er ärlighet."]
          },
          evaluation: [["Tells the customer what is known and unknown without inventing a convenient story", "Berättar för kunden vad som är känt och okänt utan att hitta på en bekväm historia"]]
        }),
        facilitator: fac(
          ["Uncertainty is the point: there may never be proof. Watch for convenient explanations.", "Osäkerheten är poängen: det kanske aldrig finns bevis. Var uppmärksam på bekväma förklaringar."],
          ["Honest account of what happened and what is unknown, with the remediation already done.", "En ärlig redogörelse för vad som hände och vad som är okänt, med de åtgärder som redan vidtagits."],
          [["Ask: which answer would you still be comfortable with in a year?", "Fråga: vilket svar skulle ni fortfarande känna er bekväma med om ett år?"]]
        )
      },
      {
        id: "p5",
        clock: 5760,
        priority: 2,
        title: L(["What happens to the team", "Vad som händer med teamet"]),
        twist: L(["HR proposes formal warnings for all {{num.reps}} people. The union representative replies within the hour: the manager told them to do it, and the policy never mentioned AI.", "HR föreslår formella varningar för alla {{num.reps}} personer. Fackets ombud svarar inom en timme: chefen sa åt dem att göra så, och riktlinjerna nämnde aldrig AI."]),
        twistKind: "authority",
        assumptionChallenged: L(["Breaking a rule is grounds for discipline.", "Att bryta mot en regel är grund för disciplinära åtgärder."]),
        narrative: L([
          "{{time.T+5760|weekday|cap}}. The customer conversations are under way. Inside the company, a different question has been waiting all week: what happens to the people who did it?\n\n{{person.hr.name}} has drafted a proposal. Sales morale is low, two reps have asked whether they will be fired, and the manager who recommended the tool has gone very quiet.",
          "{{time.T+5760|weekday|cap}}. Samtalen med kunderna pågår. Inom företaget har en annan fråga väntat hela veckan: vad händer med dem som gjorde det?\n\n{{person.hr.name}} har skrivit ett förslag. Stämningen på säljavdelningen är låg, två säljare har frågat om de kommer att få sparken och chefen som rekommenderade verktyget har blivit mycket tyst."
        ]),
        injects: [
          inj("i5-1", 5760, "email", "employee", "medium", "confirmed", [
            "The union representative: “Our members followed their manager's instruction, using a tool no policy mentioned. Warnings for them and not for the decision-makers would be unreasonable.”",
            "Fackets ombud: ”Våra medlemmar följde sin chefs instruktion och använde ett verktyg som inga riktlinjer nämnde. Varningar för dem men inte för beslutsfattarna vore orimligt.”"
          ], { headline: ["Proposed warnings for sales staff", "Föreslagna varningar för säljpersonal"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What would a policy need to say for people to follow it?", "Vad skulle riktlinjerna behöva säga för att folk ska följa dem?", ["ciso", "legal"]),
            q("Is the approved assistant actually good enough to replace the free one?", "Är den godkända assistenten faktiskt tillräckligt bra för att ersätta den kostnadsfria?", ["cio"]),
            q("Did the honest answer to the customer hold up this week?", "Höll det ärliga svaret till kunden den här veckan?", ["serviceOwner"], "d4")
          ],
          executive: [
            q("Where does accountability sit: the reps, the manager, or the policy owner?", "Var ligger ansvaret: hos säljarna, chefen eller den som äger riktlinjerna?", ["hr", "ceo"]),
            q("What message does the rest of the company take from your decision?", "Vilket budskap tar resten av företaget med sig av ert beslut?", ["comms", "ceo"]),
            q("Did what you told the customer change how you see the staff involved?", "Ändrade det ni sa till kunden hur ni ser på de inblandade medarbetarna?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("Staff in other departments have quietly started deleting their own AI chat histories.", "Personal på andra avdelningar har i tysthet börjat radera sina egna AI-chatthistoriker.")],
        decision: dec("d5", "hr", ["How do you respond to the people involved?", "Hur bemöter ni de inblandade?"], [
          ["No individual warnings; a conversation with the manager, a clear new policy and training for everyone.", "Inga individuella varningar; ett samtal med chefen, tydliga nya riktlinjer och utbildning för alla."],
          ["Warnings for everyone who used the service.", "Varningar för alla som använde tjänsten."],
          ["A warning for the manager only.", "En varning endast för chefen."]
        ], {
          knowns: [["The practice was encouraged by a manager and not covered by policy.", "Arbetssättet uppmuntrades av en chef och omfattades inte av riktlinjerna."]],
          uncertainties: [["How many other teams do the same.", "Hur många andra team som gör samma sak."]],
          tradeoffs: {
            operational: ["Mass warnings damage a team you need next quarter.", "Massvarningar skadar ett team ni behöver nästa kvartal."],
            security: ["Harsh punishment teaches people to hide, not to ask.", "Hårda straff lär folk att dölja, inte att fråga."],
            legal: ["Warnings without a clear rule may not stand.", "Varningar utan en tydlig regel kanske inte håller."],
            reputational: ["Every employee is watching what happens to these people.", "Varje anställd ser vad som händer med de här personerna."]
          },
          evaluation: [["Matches accountability to who set the expectation, and fixes the rule", "Lägger ansvaret där förväntan sattes, och rättar regeln"]]
        }),
        facilitator: fac(
          ["Proportionality and just culture. The policy gap is the organisation's, not the reps'.", "Proportionalitet och rättvis kultur. Luckan i riktlinjerna är organisationens, inte säljarnas."],
          ["Fix the policy and the tooling; address the manager's judgement; no mass warnings.", "Rätta riktlinjerna och verktygen; ta upp chefens omdöme; inga massvarningar."],
          [["Ask: how many other unwritten rules does your policy have?", "Fråga: hur många andra oskrivna regler har era riktlinjer?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        priority: 3,
        title: L(["Every other tool", "Alla andra verktyg"]),
        twist: L(["A company-wide scan finds 23 other AI and file-sharing services in regular use, in every department, including HR and finance.", "En genomsökning av hela företaget hittar 23 andra AI- och fildelningstjänster i regelbunden användning, på varje avdelning, även HR och ekonomi."]),
        twistKind: "scope",
        assumptionChallenged: L(["This was a sales problem.", "Det här var ett problem på säljavdelningen."]),
        narrative: L([
          "{{time.T+10080|weekday|cap}}. A week later. The sales case is closing. {{person.cio.name}} has run the same proxy search for every external service that accepts uploads, across the whole company.\n\nThe list is longer than the room expected. Some of the services are well known, some are a year old, and almost none of them have ever been through a security review.",
          "{{time.T+10080|weekday|cap}}. En vecka senare. Säljärendet håller på att avslutas. {{person.cio.name}} har kört samma proxysökning efter alla externa tjänster som tar emot uppladdningar, i hela företaget.\n\nListan är längre än rummet väntat sig. En del tjänster är välkända, en del är ett år gamla, och nästan ingen av dem har någonsin gått igenom en säkerhetsgranskning."
        ]),
        injects: [
          inj("i6-1", 10080, "impactReport", "itOps", "medium", "confirmed", [
            "External upload services in use: 23 (AI assistants 9, file conversion 6, file sharing 5, transcription 3). Users: 41 percent of staff. Approved: 2.",
            "Externa uppladdningstjänster i bruk: 23 (AI-assistenter 9, filkonvertering 6, fildelning 5, transkribering 3). Användare: 41 procent av personalen. Godkända: 2."
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which of these handle personal or confidential data?", "Vilka av dessa hanterar personuppgifter eller konfidentiell data?", ["ciso", "dpo"]),
            q("How do you approve good tools fast enough that people wait for you?", "Hur godkänner ni bra verktyg tillräckligt snabbt för att folk ska vänta på er?", ["cio"]),
            q("Did the response to the sales team make people more or less willing to tell you about these?", "Gjorde bemötandet av säljteamet folk mer eller mindre villiga att berätta om de här?", ["hr"], "d5")
          ],
          executive: [
            q("Block everything, approve everything, or something in between?", "Blockera allt, godkänna allt eller något däremellan?", ["cio", "ceo"]),
            q("Who owns the list of approved tools from now on?", "Vem äger listan över godkända verktyg från och med nu?", ["ciso", "cio"]),
            q("Looking back, which decision shaped the week most?", "När ni ser tillbaka, vilket beslut präglade veckan mest?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Finance's transcription tool records board calls.", "Ekonomiavdelningens transkriberingsverktyg spelar in styrelsemöten.")],
        decision: dec("d6", "cio", ["What is your approach?", "Vilken väg väljer ni?"], [
          ["A fast approval route, approved alternatives for the common needs, then block what remains.", "En snabb godkännandeväg, godkända alternativ för de vanliga behoven, och blockera sedan det som återstår."],
          ["Block all 23 services at once.", "Blockera alla 23 tjänster på en gång."],
          ["Publish guidance and trust people to choose well.", "Publicera vägledning och lita på att folk väljer klokt."]
        ], {
          knowns: [["Unapproved tools are used across the company.", "Ej godkända verktyg används i hela företaget."]],
          uncertainties: [["Which of them have already received sensitive data.", "Vilka av dem som redan har fått känslig data."]],
          tradeoffs: {
            operational: ["Blocking everything stops real work in every department.", "Att blockera allt stoppar verkligt arbete på varje avdelning."],
            security: ["Guidance alone changes little.", "Enbart vägledning förändrar lite."],
            legal: ["Each tool is a processor without an agreement.", "Varje verktyg är ett personuppgiftsbiträde utan avtal."],
            reputational: ["A heavy hand now makes the next disclosure less likely.", "En hård hand nu gör nästa avslöjande mindre sannolikt."]
          },
          evaluation: [["Makes the approved route faster than the workaround", "Gör den godkända vägen snabbare än genvägen"]]
        }),
        facilitator: fac(
          ["End on the system: shadow IT exists because the official route is slow.", "Avsluta med systemet: skugg-IT finns för att den officiella vägen är långsam."],
          ["A fast approval process and good approved tools, then enforcement.", "En snabb godkännandeprocess och bra godkända verktyg, därefter efterlevnad."],
          [["Ask: how long does it take to get a new tool approved here today?", "Fråga: hur lång tid tar det att få ett nytt verktyg godkänt här i dag?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The practice is stopped and the customers told. One account is lost over the clause, and the company learns how many other tools it never knew about.",
        "Arbetssättet är stoppat och kunderna informerade. En kund går förlorad på grund av klausulen, och företaget får veta hur många andra verktyg det aldrig kände till."
      ])
    },

    debrief: {
      keyLessons: [
        L(["A policy breach is measured by the data that left, not by the intent behind it.", "Ett policybrott mäts i den data som lämnade, inte i avsikten bakom det."]),
        L(["Free AI services can keep and reuse what you paste in: treat them as third parties.", "Kostnadsfria AI-tjänster kan spara och återanvända det ni klistrar in: behandla dem som tredje part."]),
        L(["When many people break the same rule, the rule or the system has failed.", "När många bryter mot samma regel har regeln eller systemet fallerat."]),
        L(["People use shadow tools because the approved route is slower: fix the route.", "Folk använder skuggverktyg för att den godkända vägen är långsammare: rätta vägen."])
      ],
      assumptionsVsReality: [
        avr(["One rep made a mistake.", "En säljare gjorde ett misstag."], ["A whole team, encouraged by its manager.", "Ett helt team, uppmuntrat av sin chef."], "p2"),
        avr(["The service forgets what it is given.", "Tjänsten glömmer det den får."], ["Its terms allow reuse of inputs.", "Dess villkor tillåter återanvändning av inmatad text."], "p3"),
        avr(["There will be no visible consequence.", "Det blir inga synliga följder."], ["A customer's clause surfaced at a competitor.", "En kunds klausul dök upp hos en konkurrent."], "p4")
      ],
      strengthsToLookFor: [
        L(["Opening an incident despite no malicious intent", "Att öppna en incident trots att ingen avsikt var illasinnad"]),
        L(["Handling contract and data protection duties together", "Att hantera avtals- och dataskyddsskyldigheter tillsammans"]),
        L(["Proportionate response to staff", "Ett proportionerligt bemötande av personalen"])
      ],
      commonGaps: [
        L(["Treating it as an HR matter only", "Att behandla det enbart som en personalfråga"]),
        L(["Forgetting confidentiality clauses in customer contracts", "Att glömma sekretessklausuler i kundavtal"]),
        L(["Blocking tools without offering an alternative", "Att blockera verktyg utan att erbjuda ett alternativ"])
      ],
      suggestedActions: [
        act(["Add AI and upload services explicitly to the acceptable-use policy.", "Lägg uttryckligen till AI- och uppladdningstjänster i riktlinjerna för tillåten användning."], "ciso", "high"),
        act(["Provide an approved AI assistant with a data processing agreement.", "Tillhandahåll en godkänd AI-assistent med personuppgiftsbiträdesavtal."], "cio", "high"),
        act(["Create a two-week approval route for new tools.", "Skapa en godkännandeväg på två veckor för nya verktyg."], "cio", "medium"),
        act(["Map confidentiality clauses in customer contracts.", "Kartlägg sekretessklausuler i kundavtalen."], "legal", "medium")
      ]
    }
  });
})();
