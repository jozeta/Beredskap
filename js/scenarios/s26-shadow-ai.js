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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb } = BK.scenarios.h;

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
          ["Thank the customer, let the rep's manager handle it this week, and open an incident only if a second case appears.", "Tacka kunden, låt säljarens chef hantera det i veckan, och öppna en incident först om ett andra fall dyker upp."]
        ], {
          knowns: [["A full contract and named contacts were pasted into an external service.", "Ett helt avtal och namngivna kontakter klistrades in i en extern tjänst."]],
          uncertainties: [["How often it happened, and what the provider keeps.", "Hur ofta det hänt, och vad leverantören sparar."]],
          tradeoffs: {
            operational: ["An incident takes people away from selling in the last week of the quarter.", "En incident tar folk från försäljningen sista veckan i kvartalet."],
            security: ["Treating it as a one-off hides a pattern if there is one.", "Att behandla det som en engångshändelse döljer ett mönster om det finns ett."],
            legal: ["Contract and data protection duties may already apply.", "Avtals- och dataskyddsskyldigheter kan redan gälla."],
            reputational: ["The customer has seen how their contract was handled.", "Kunden har sett hur deras avtal hanterades."]
          },
          evaluation: [["Looks at what data left, rather than at whether anyone meant harm", "Tittar på vilken data som lämnade, i stället för om någon menade illa"]],
          pushback: {
            A: [
              pb(["Last week of the quarter", "Kvartalets sista vecka"], ["{{person.serviceOwner.name}} objects: it is the last week of the quarter, and an incident means interviews with sales instead of closing deals. Nothing was hacked and the customer is happy. How much selling time will you spend on a tool nobody meant harm with?", "{{person.serviceOwner.name}} invänder: det är kvartalets sista vecka, och en incident betyder intervjuer med säljarna i stället för avslut. Inget har hackats och kunden är nöjd. Hur mycket säljtid är ni beredda att lägga på ett verktyg som ingen menade något illa med?"]),
              pb(["The rep is frightened", "Säljaren är rädd"], ["The rep hears the word “incident” and asks HR whether they are about to be fired. They are this quarter's top seller, and colleagues are watching how the company treats them. How do you investigate without making the rep a suspect?", "Säljaren hör ordet ”incident” och frågar HR om hen kommer att få sparken. Hen är kvartalets bästa säljare, och kollegorna ser hur företaget behandlar hen. Hur utreder ni utan att göra säljaren till misstänkt?"]),
              pb(["Deleted, they say", "Raderad, säger hen"], ["The rep deleted the chat, and nobody knows whom to ask at the provider or what it keeps. You may never establish where the data went. What exactly will you scope, and when do you call the investigation finished?", "Säljaren raderade chatten, och ingen vet vem man ska fråga hos leverantören eller vad den sparar. Ni kanske aldrig kan fastställa vart datan tog vägen. Vad exakt ska ni kartlägga, och när förklarar ni utredningen avslutad?"])
            ],
            B: [
              pb(["“Everyone uses it”", "”Alla använder det”"], ["The rep's own words were “everyone uses it”. Handling it as one person's conduct means nobody checks whether that is true. If it is, what is a single conversation with one rep worth?", "Säljarens egna ord var ”alla använder det”. Att hantera det som en persons uppförande betyder att ingen kontrollerar om det stämmer. Om det gör det, vad är ett enskilt samtal med en säljare värt?"]),
              pb(["The customer writes again", "Kunden skriver igen"], ["The procurement lead who sent the chat back writes again, politely: what have you done to protect our contract and our people's names? A private talk between a rep and a manager is not an answer you can send. What do you tell them?", "Inköpschefen som skickade tillbaka chatten skriver igen, artigt: vad har ni gjort för att skydda vårt avtal och våra medarbetares namn? Ett enskilt samtal mellan en säljare och en chef är inget svar ni kan skicka. Vad säger ni till dem?"]),
              pb(["Named people in the chat", "Namngivna personer i chatten"], ["The chat held named contacts: personal data sent to an outside service. {{person.dpo.name}} says a conduct talk neither records nor assesses that, and asks who decided this is not a data protection matter. Who takes that responsibility?", "Chatten innehöll namngivna kontakter: personuppgifter som skickats till en extern tjänst. {{person.dpo.name}} säger att ett samtal om uppförande varken dokumenterar eller bedömer det, och frågar vem som beslutade att det inte är en dataskyddsfråga. Vem tar det ansvaret?"])
            ],
            C: [
              pb(["Who is looking?", "Vem letar?"], ["A second case will only appear if someone looks for one, and nobody has been asked to. This one surfaced because a customer made a mistake. How will you ever see the second case if nobody opens the question now?", "Ett andra fall dyker bara upp om någon letar efter det, och ingen har fått i uppdrag att göra det. Det här kom fram för att en kund gjorde ett misstag. Hur ska ni någonsin se det andra fallet om ingen öppnar frågan nu?"]),
              pb(["“No big deal”", "”Ingen stor grej”"], ["The rep has told colleagues it was “no big deal, the customer was happy”. By the time the manager gets to it later in the week, the team has learned that nothing happens. What does waiting teach them?", "Säljaren har sagt till kollegorna att det var ”ingen stor grej, kunden var nöjd”. När chefen tar tag i det senare i veckan har teamet lärt sig att ingenting händer. Vad lär väntan dem?"]),
              pb(["The clock may already run", "Klockan kan redan gå"], ["{{person.legal.name}} warns that if this is a personal data breach, the time to assess notification started when you became aware of it, today. Waiting for a second case does not pause that. Are you prepared to explain the delay later?", "{{person.legal.name}} varnar för att om det här är en personuppgiftsincident började tiden för att bedöma anmälan löpa när ni fick kännedom om den, i dag. Att vänta på ett andra fall pausar inte det. Är ni beredda att förklara dröjsmålet i efterhand?"])
            ]
          }
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
          evaluation: [["Stops the flow and gives people a legitimate way to do the work", "Stoppar flödet och ger folk ett legitimt sätt att göra jobbet"]],
          pushback: {
            A: [
              pb(["Days become weeks", "Dagar blir veckor"], ["{{person.cio.name}} says an approved assistant with a proper data agreement takes weeks to buy and set up, not days. You have already promised staff an alternative. Do you rush the approval, or tell sales they have no tool at quarter end?", "{{person.cio.name}} säger att en godkänd assistent med ett ordentligt avtal tar veckor att köpa in och sätta upp, inte dagar. Ni har redan lovat personalen ett alternativ. Forcerar ni godkännandet, eller säger ni till säljarna att de står utan verktyg vid kvartalsskiftet?"]),
              pb(["Soften the wording", "Mildra formuleringen"], ["The sales manager who recommended the tool asks {{person.comms.name}} to soften the staff message so it does not read as an accusation against the team, or against the manager. Your draft names the practice plainly. Whose interest should the wording serve?", "Säljchefen som rekommenderade verktyget ber {{person.comms.name}} mildra meddelandet till personalen så att det inte läses som en anklagelse mot teamet, eller mot chefen. Ert utkast beskriver arbetssättet rakt ut. Vems intresse ska formuleringen tjäna?"]),
              pb(["Proposals due this week", "Offerter som ska ut i veckan"], ["The head of sales says the team wrote proposals in half the time with the tool, and dozens are due this week. Without it, some will not go out on time. Who tells the waiting customers, and is the block worth those deals?", "Försäljningschefen säger att teamet skrev offerter på halva tiden med verktyget, och dussintals ska ut den här veckan. Utan det kommer en del inte iväg i tid. Vem berättar det för de väntande kunderna, och är blockeringen värd de affärerna?"])
            ],
            B: [
              pb(["“The AI site is broken”", "”AI-sidan är trasig”"], ["Within an hour the service desk has a pile of tickets from sales saying the AI site is broken. Nobody told the service desk why, so they start troubleshooting it. What do they say, and how long can quiet last?", "Inom en timme har servicedesken en hög ärenden från säljarna om att AI-sidan är trasig. Ingen har berättat för servicedesken varför, så de börjar felsöka. Vad ska de säga, och hur länge kan tystnaden hålla?"]),
              pb(["The manager asks", "Chefen frågar"], ["The sales manager who recommended the tool notices the block at once and asks IT directly whether it is about them. Saying nothing to the person most involved looks like a cover-up. Do you tell the manager, and if so, why not everyone?", "Säljchefen som rekommenderade verktyget märker blockeringen direkt och frågar IT rakt ut om det handlar om hen. Att inte säga något till den mest inblandade ser ut som en mörkläggning. Berättar ni för chefen, och i så fall, varför inte för alla?"]),
              pb(["Nobody knows it was wrong", "Ingen vet att det var fel"], ["{{person.dpo.name}} points out that a quiet block leaves {{num.reps}} people unaware that what they pasted may still sit with the provider, and free to paste the same into any other tool. How is anyone to drop a habit nobody has told them is wrong?", "{{person.dpo.name}} påpekar att en tyst blockering lämnar {{num.reps}} personer ovetande om att det de klistrat in kan finnas kvar hos leverantören, och fria att klistra in samma sak i vilket annat verktyg som helst. Hur ska någon sluta med en vana som ingen har sagt är fel?"])
            ],
            C: [
              pb(["Every day you allowed", "Varje dag ni tillät"], ["Today's proxy log shows more uploads, one of them a full contract. {{person.dpo.name}} says every upload from now on is one you knew about and allowed. Can you defend that to a regulator?", "Dagens proxylogg visar fler uppladdningar, en av dem ett helt avtal. {{person.dpo.name}} säger att varje uppladdning från och med nu är en som ni kände till och tillät. Kan ni försvara det inför en tillsynsmyndighet?"]),
              pb(["Silence as approval", "Tystnad som godkännande"], ["The sales team reads the open service as a green light, and the manager tells them to carry on as before. The company has now knowingly endorsed the practice. What would it take to undo that later?", "Säljteamet tolkar den öppna tjänsten som grönt ljus, och chefen säger åt dem att fortsätta som förut. Företaget har nu medvetet godkänt arbetssättet. Vad skulle det krävas för att göra det ogjort senare?"]),
              pb(["Phones are not so easy", "Mobilerna är inte så enkla"], ["{{person.cio.name}} checks: on a phone, reps would have to retype or photograph whole contracts, which few will bother with. A block would stop most of the flow, not just move it. Does your reason for leaving it open still hold?", "{{person.cio.name}} kontrollerar: i mobilen skulle säljarna behöva skriva av eller fotografera hela avtal, vilket få orkar. En blockering skulle stoppa det mesta av flödet, inte bara flytta det. Håller ert skäl för att låta den vara öppen fortfarande?"])
            ]
          }
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
        reconsider: { decision: "d2", pressure: { en: "The terms let the provider train on what your staff pasted in. If you blocked it openly, half of sales has moved to their phones. If you blocked it quietly, staff found out from a broken bookmark. If you left it open, it is still flowing out today.", sv: "Villkoren låter leverantören träna på det personalen klistrade in. Om ni blockerade öppet har halva säljavdelningen gått över till mobilerna. Om ni blockerade i tysthet fick personalen veta det via ett trasigt bokmärke. Om ni lät den vara öppen flödar det fortfarande ut i dag." } },
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because you told staff why the service was blocked, the message leaked to a sales forum, and a competitor's rep has posted it with a smile.", sv: "Eftersom ni berättade för personalen varför tjänsten blockerades läckte meddelandet till ett säljforum, och en konkurrents säljare har lagt upp det med ett leende." } }
        ],
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
          evaluation: [["Meets both contract and data protection duties, in proportion to the facts", "Uppfyller både avtals- och dataskyddsskyldigheter, i proportion till fakta"]],
          pushback: {
            A: [
              pb(["The CEO hesitates", "Vd tvekar"], ["Account managers warn that volunteering this will cost deals at quarter end, and some customers have never even read their confidentiality clause. {{person.ceo.name}} asks whether telling them unprompted is really necessary. Who convinces the CEO, and with what?", "Kundansvariga varnar för att det kostar affärer vid kvartalsskiftet att berätta självmant, och en del kunder har aldrig ens läst sin sekretessklausul. {{person.ceo.name}} frågar om det verkligen är nödvändigt att berätta utan att bli tillfrågad. Vem övertygar vd, och med vad?"]),
              pb(["“Was ours in it?”", "”Fanns vårt med?”"], ["The first customer you call asks the obvious question: was our contract pasted in? The proxy logs show upload sizes, not content, so you cannot say for certain. Do you tell customers something you cannot confirm either way?", "Den första kunden ni ringer ställer den självklara frågan: klistrades vårt avtal in? Proxyloggarna visar storlek på uppladdningar, inte innehåll, så ni kan inte säga säkert. Berättar ni för kunder något som ni varken kan bekräfta eller avfärda?"]),
              pb(["Deletion you can't prove", "Radering ni inte kan bevisa"], ["The provider replies that deletion takes up to 30 days “where technically feasible” and offers no way to confirm it. You were about to tell customers the data has been deleted. What can you honestly promise them now?", "Leverantören svarar att radering tar upp till 30 dagar ”där det är tekniskt möjligt” och erbjuder inget sätt att bekräfta den. Ni skulle just berätta för kunderna att datan raderats. Vad kan ni ärligt lova dem nu?"])
            ],
            B: [
              pb(["The clause says tell us", "Klausulen säger: berätta"], ["{{person.legal.name}} reads one confidentiality clause aloud: you must inform the customer without delay of any disclosure to a third party. Staying silent is itself the breach. Do you still wait to be asked?", "{{person.legal.name}} läser upp en sekretessklausul: ni ska utan dröjsmål informera kunden om varje utlämnande till tredje part. Att tiga är i sig avtalsbrottet. Väntar ni ändå tills någon frågar?"]),
              pb(["The DPO dissents", "Dataskyddsombudet reserverar sig"], ["{{person.dpo.name}} asked for a decision on notification and got “say nothing”, which is not an assessment. The DPO wants the objection recorded. Do you overrule your own data protection officer, in writing?", "{{person.dpo.name}} bad om ett beslut om anmälan och fick ”säg ingenting”, vilket inte är någon bedömning. Dataskyddsombudet vill att invändningen dokumenteras. Kör ni över ert eget dataskyddsombud, skriftligt?"]),
              pb(["Too many people know", "För många vet"], ["{{num.reps}} reps, their manager, IT and HR all know what happened, and many of them talk to customers every day. One slip and a customer hears it from a rep instead of from you. How long do you expect the silence to hold?", "{{num.reps}} säljare, deras chef, IT och HR vet alla vad som hänt, och många av dem pratar med kunder varje dag. En försägelse och en kund hör det från en säljare i stället för från er. Hur länge räknar ni med att tystnaden håller?"])
            ],
            C: [
              pb(["The form wants facts", "Blanketten vill ha fakta"], ["The notification to {{reg.dpaShort}} asks how many people are affected, what data, and what you have done. You have estimates, not answers. Do you file something incomplete now, or take another day to get it right?", "Anmälan till {{reg.dpaShort}} frågar hur många som berörs, vilken data och vad ni har gjort. Ni har uppskattningar, inte svar. Skickar ni in något ofullständigt nu, eller tar ni en dag till för att få det rätt?"]),
              pb(["Customers who weren't affected", "Kunder som inte berördes"], ["Telling every customer includes many whose contracts were never pasted anywhere. Account managers expect a flood of worried calls at quarter end, and some customers will demand audits. Is alarming everyone proportionate to what you know?", "Att informera alla kunder omfattar många vars avtal aldrig klistrades in någonstans. Kundansvariga räknar med en flod av oroliga samtal vid kvartalsskiftet, och en del kunder kommer att kräva granskningar. Står det i proportion till det ni vet att oroa alla?"]),
              pb(["Admitting what didn't happen", "Erkänna det som inte hände"], ["{{person.legal.name}} warns that a notice sent before the facts are checked may admit breaches of contracts that were never affected, and invite penalty claims you do not owe. Speed and accuracy pull apart. Which do you give up?", "{{person.legal.name}} varnar för att ett besked som skickas innan fakta är kontrollerade kan erkänna brott mot avtal som aldrig berördes, och bjuda in vitesanspråk ni inte är skyldiga. Snabbhet och precision drar åt olika håll. Vilket ger ni upp?"])
            ]
          }
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
          ["Tell the customer you are investigating and will answer in full by Friday, without confirming anything yet.", "Säg till kunden att ni utreder och svarar fullständigt senast fredag, utan att bekräfta något ännu."]
        ], {
          knowns: [["The customer's contract was among those pasted in.", "Kundens avtal fanns bland dem som klistrades in."]],
          uncertainties: [["How the clause actually reached the competitor.", "Hur klausulen faktiskt nådde konkurrenten."]],
          tradeoffs: {
            operational: ["Honesty may cost the account; denial may cost all of them.", "Ärlighet kan kosta kunden; förnekelse kan kosta alla kunder."],
            security: ["Blaming the former employee without evidence is its own risk.", "Att skylla på den tidigare medarbetaren utan belägg är en risk i sig."],
            legal: ["A denial that later proves false worsens the contract position.", "Ett förnekande som senare visar sig falskt försämrar avtalsläget."],
            reputational: ["The customer already suspects; they are testing your honesty.", "Kunden misstänker redan; de prövar er ärlighet."]
          },
          evaluation: [["Tells the customer what is known and unknown without inventing a convenient story", "Berättar för kunden vad som är känt och okänt utan att hitta på en bekväm historia"]],
          pushback: {
            A: [
              pb(["In writing", "Skriftligt"], ["{{person.legal.name}} warns that putting in writing that the contract went into an AI service may be read as admitting a breach of the confidentiality clause before anyone knows the route. Do you still put it in writing, and who signs it?", "{{person.legal.name}} varnar för att ett skriftligt besked om att avtalet hamnade i en AI-tjänst kan läsas som ett erkännande av brott mot sekretessklausulen innan någon vet vägen. Skriver ni det ändå, och vem skriver under?"]),
              pb(["“Send us everything”", "”Skicka allt till oss”"], ["The customer thanks you for your honesty and asks for every record of what was pasted about them. The records you have mix their data with other customers'. How much do you hand over, and what do you hold back?", "Kunden tackar för ärligheten och ber om varje underlag om vad som klistrades in om dem. Underlagen ni har blandar deras data med andra kunders. Hur mycket lämnar ni ut, och vad håller ni inne?"]),
              pb(["Word travels", "Ryktet sprids"], ["This customer talks to others in the industry. Once they know, other customers will ask you the same question this week, and not all of them have heard from you yet. Are you ready to give every one of them the same honest answer?", "Den här kunden pratar med andra i branschen. När de vet kommer andra kunder att ställa samma fråga redan den här veckan, och alla har inte hört från er ännu. Är ni redo att ge var och en samma ärliga svar?"])
            ],
            B: [
              pb(["Nothing but a hire date", "Inget annat än ett anställningsdatum"], ["You have no evidence the former account manager took anything, only the date they joined the competitor. If the customer repeats your theory, that person's lawyer will call. Can you defend an accusation you cannot support?", "Ni har inga belägg för att den tidigare kundansvariga tog något, bara datumet när hen började hos konkurrenten. Om kunden för vidare er teori kommer hens jurist att ringa. Kan ni försvara en anklagelse som ni inte kan styrka?"]),
              pb(["The follow-up question", "Följdfrågan"], ["The customer pauses, then asks: was our contract ever put into an outside tool? You know it was. Do you answer yes now, and explain why you led with someone else?", "Kunden gör en paus och frågar sedan: lades vårt avtal någon gång in i ett externt verktyg? Ni vet att det gjordes. Svarar ni ja nu, och förklarar varför ni först pekade på någon annan?"]),
              pb(["The team is listening", "Teamet lyssnar"], ["The sales team hears that leadership is blaming a former colleague for something {{num.reps}} of them did themselves. Each of them knows what they pasted. What does this answer teach them about owning mistakes?", "Säljteamet hör att ledningen skyller på en tidigare kollega för något som {{num.reps}} av dem själva gjorde. Var och en vet vad de klistrade in. Vad lär det här svaret dem om att stå för sina misstag?"])
            ],
            C: [
              pb(["A yes-or-no question", "En ja-eller-nej-fråga"], ["The customer asked one thing: did you share our contract? You already know it was pasted into the service. “We are investigating” in reply to a question you can partly answer may later look like a denial. What do you actually say on the call?", "Kunden frågade en sak: har ni delat vårt avtal? Ni vet redan att det klistrades in i tjänsten. ”Vi utreder” som svar på en fråga ni delvis kan besvara kan senare se ut som ett förnekande. Vad säger ni faktiskt i samtalet?"]),
              pb(["Friday changes nothing", "Fredag ändrar ingenting"], ["{{person.cio.name}} says the route may never be provable, so on Friday you will know no more about how the clause got out than today. The extra days buy time, not certainty. What will you say on Friday that you cannot say now?", "{{person.cio.name}} säger att vägen kanske aldrig går att bevisa, så på fredag vet ni inte mer om hur klausulen kom ut än i dag. De extra dagarna köper tid, inte visshet. Vad kommer ni att säga på fredag som ni inte kan säga nu?"]),
              pb(["“Don't make me stonewall”", "”Tvinga mig inte att slingra mig”"], ["{{person.serviceOwner.name}} has to make the call and does not want to read a script that dodges a question they know the answer to. They ask whether the company expects them to stonewall a customer they have known for years. What do you tell them?", "{{person.serviceOwner.name}} ska ringa samtalet och vill inte läsa ett manus som undviker en fråga hen vet svaret på. Hen frågar om företaget förväntar sig att hen ska slingra sig inför en kund hen har känt i flera år. Vad svarar ni?"])
            ]
          }
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
        reconsider: { decision: "d4", pressure: { en: "The customer has forwarded your answer to their lawyers. If you told them everything, they are now invoking the penalty clause. If you held back, they have found the AI service's terms themselves.", sv: "Kunden har skickat ert svar vidare till sina jurister. Om ni berättade allt åberopar de nu vitesklausulen. Om ni höll inne med något har de själva hittat AI-tjänstens villkor." } },
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because a data incident was opened on the first day, the rep has been suspended pending review, and the sales team has stopped talking to security.", sv: "Eftersom en dataincident öppnades redan första dagen är säljaren avstängd under granskningen, och säljteamet har slutat prata med säkerhetsfunktionen." } }
        ],
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
          evaluation: [["Matches accountability to who set the expectation, and fixes the rule", "Lägger ansvaret där förväntan sattes, och rättar regeln"]],
          pushback: {
            A: [
              pb(["The rule-followers notice", "De som följde reglerna märker det"], ["Other departments, who wrote proposals and reports the slow way, see that six months of pasting customer contracts led to no individual consequence at all. What do they conclude about your rules?", "Andra avdelningar, som skrev offerter och rapporter på det långsamma sättet, ser att sex månaders inklistrande av kundavtal inte ledde till någon individuell följd alls. Vilken slutsats drar de om era regler?"]),
              pb(["The rep who went further", "Säljaren som gick längre"], ["The logs show one rep kept pasting full contracts with contact lists even after colleagues questioned it in the team chat. No individual warnings treats them the same as everyone else. Is there no line for anyone?", "Loggarna visar att en säljare fortsatte klistra in hela avtal med kontaktlistor även efter att kollegor ifrågasatt det i teamchatten. Inga individuella varningar betyder att hen behandlas som alla andra. Finns det ingen gräns för någon?"]),
              pb(["Training without a tool", "Utbildning utan verktyg"], ["{{person.cio.name}} warns that training without a usable approved tool sends people back to the free one by next quarter. The policy and the course can be ready this month; the tool cannot. What stops the habit coming back?", "{{person.cio.name}} varnar för att utbildning utan ett användbart godkänt verktyg skickar folk tillbaka till det kostnadsfria redan nästa kvartal. Riktlinjerna och kursen kan vara klara den här månaden; verktyget kan inte det. Vad hindrar vanan från att komma tillbaka?"])
            ],
            B: [
              pb(["Warnings that may not stand", "Varningar som kanske inte håller"], ["The union says it will contest every warning: the manager told them to do it and the policy never mentioned AI. {{person.legal.name}} thinks several may not survive. Do you go ahead with warnings you may have to withdraw?", "Facket säger att det kommer att bestrida varje varning: chefen sa åt dem att göra så och riktlinjerna nämnde aldrig AI. {{person.legal.name}} tror att flera inte kommer att hålla. Går ni vidare med varningar som ni kan tvingas dra tillbaka?"]),
              pb(["Same warning, unequal roles", "Samma varning, olika roller"], ["Under your decision, the manager who recommended the tool gets the same warning as the newest rep who followed the advice. Staff see equal punishment for unequal responsibility. Is that fair, and can you explain it to them?", "Med ert beslut får chefen som rekommenderade verktyget samma varning som den nyaste säljaren som följde rådet. Personalen ser lika straff för olika ansvar. Är det rättvist, och kan ni förklara det för dem?"]),
              pb(["The top seller resigns", "Toppsäljaren säger upp sig"], ["This quarter's top seller hands in their notice, saying they will not stay where following the manager earns a warning. Two others are interviewing elsewhere. How many of the team are you prepared to lose over a rule that did not exist?", "Kvartalets bästa säljare säger upp sig och säger att hen inte stannar där det ger en varning att följa chefen. Två andra går på intervjuer på annat håll. Hur många i teamet är ni beredda att förlora för en regel som inte fanns?"])
            ],
            C: [
              pb(["“I said summaries”", "”Jag sa sammanfattningar”"], ["The manager says they suggested the tool for summaries, never for pasting contact lists, and that the targets came from above. Their own manager set those targets. Does accountability stop at the person you chose?", "Chefen säger att hen föreslog verktyget för sammanfattningar, aldrig för att klistra in kontaktlistor, och att målen kom uppifrån. Hens egen chef satte de målen. Stannar ansvaret hos den person ni valde?"]),
              pb(["The reps did choose", "Säljarna valde själva"], ["Some reps pasted far more than anyone suggested, including full contact lists. Warning only the manager says they carried no responsibility at all. Is that the message you want the rest of the company to take away?", "En del säljare klistrade in mycket mer än någon föreslagit, även hela kontaktlistor. Att bara varna chefen säger att de inte bar något ansvar alls. Är det budskapet ni vill att resten av företaget tar med sig?"]),
              pb(["Who owned the policy?", "Vem ägde riktlinjerna?"], ["{{person.legal.name}} points out that the acceptable-use policy had an owner too, and it never mentioned AI tools. Warning the manager for a gap someone else left looks like choosing a scapegoat. Who else should be held to account?", "{{person.legal.name}} påpekar att riktlinjerna för tillåten användning också hade en ägare, och de nämnde aldrig AI-verktyg. Att varna chefen för en lucka som någon annan lämnade ser ut som att välja en syndabock. Vem mer borde ställas till svars?"])
            ]
          }
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
        reconsider: { decision: "d1", pressure: { en: "Twenty-three more services, in every department. Was this ever one rep's mistake, and does the way you first treated it still hold?", sv: "Tjugotre tjänster till, på varje avdelning. Var det här någonsin en enskild säljares misstag, och håller det sätt ni först hanterade det på fortfarande?" } },
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
          evaluation: [["Makes the approved route faster than the workaround", "Gör den godkända vägen snabbare än genvägen"]],
          pushback: {
            A: [
              pb(["Who does the reviews?", "Vem gör granskningarna?"], ["A fast approval route needs reviewers, and security has two people who already have a queue. Twenty-three tools are waiting. {{person.ciso.name}} asks what they should stop doing to make room. What gives?", "En snabb godkännandeväg kräver granskare, och säkerhetsfunktionen har två personer som redan har en kö. Tjugotre verktyg väntar. {{person.ciso.name}} frågar vad de ska sluta med för att få plats. Vad får ge vika?"]),
              pb(["Board calls in the meantime", "Styrelsemöten under tiden"], ["Until alternatives exist, the remaining services stay open, including finance's transcription tool that records board calls. Each week of review is another week of board discussions sent to an unknown provider. Do you block that one now, against your own plan?", "Tills alternativen finns är de övriga tjänsterna öppna, även ekonomiavdelningens transkriberingsverktyg som spelar in styrelsemöten. Varje veckas granskning är ännu en vecka av styrelsediskussioner som skickas till en okänd leverantör. Blockerar ni det nu, mot er egen plan?"]),
              pb(["Fast or rubber stamp?", "Snabbt eller gummistämpel?"], ["HR says its recruiting assistant is one of the 23 and it is needed for a hiring round next week. If you approve it that fast, other departments will say the fast route is just a rubber stamp. How do you stay fast without becoming a formality?", "HR säger att deras rekryteringsassistent är en av de 23 och att den behövs till en rekryteringsomgång nästa vecka. Om ni godkänner den så snabbt kommer andra avdelningar att säga att den snabba vägen bara är en gummistämpel. Hur förblir ni snabba utan att bli en formalitet?"])
            ],
            B: [
              pb(["Two were approved", "Två var godkända"], ["Two of the 23 services were in fact approved, with signed agreements. Blocking them breaks commitments the company made and stops teams who did everything right. Did you mean all 23?", "Två av de 23 tjänsterna var faktiskt godkända, med undertecknade avtal. Att blockera dem bryter åtaganden som företaget gjort och stoppar team som gjorde allt rätt. Menade ni verkligen alla 23?"]),
              pb(["Every department stops", "Varje avdelning stannar"], ["Finance says its period-end work depends on two of the blocked tools, and HR and others report the same. Work stops in every department at once, with no alternatives ready. Which do you unblock first, and is it still a block?", "Ekonomi säger att periodbokslutet hänger på två av de blockerade verktygen, och HR och andra säger samma sak. Arbetet stannar på varje avdelning samtidigt, utan några alternativ klara. Vilket öppnar ni först, och är det då fortfarande en blockering?"]),
              pb(["Who tells you next time?", "Vem berättar nästa gång?"], ["After the sales case, staff had started telling IT which tools they use. A blanket block tells them that disclosure means losing your tools. Who will tell you about the twenty-fourth service?", "Efter säljärendet hade personalen börjat berätta för IT vilka verktyg de använder. En total blockering säger att den som berättar förlorar sina verktyg. Vem kommer att berätta om den tjugofjärde tjänsten?"])
            ],
            C: [
              pb(["They did choose well", "De valde faktiskt klokt"], ["The sales team chose well by their own measure: a tool that saved hours and won deals. Any guidance would have had to beat their targets. Why would guidance work better this time?", "Säljteamet valde klokt efter sitt eget mått: ett verktyg som sparade timmar och vann affärer. All vägledning hade behövt slå deras säljmål. Varför skulle vägledning fungera bättre den här gången?"]),
              pb(["What is already out there", "Det som redan är ute"], ["41 percent of staff already use unapproved services, and finance's tool has been recording board calls. Guidance does nothing about the data already sent. What happens to what is already out there?", "41 procent av personalen använder redan ej godkända tjänster, och ekonomiavdelningens verktyg har spelat in styrelsemöten. Vägledning gör ingenting åt den data som redan skickats. Vad händer med det som redan finns där ute?"]),
              pb(["The DPO wants it on record", "Dataskyddsombudet vill ha det dokumenterat"], ["{{person.dpo.name}} says each of these tools is a processor without an agreement, and guidance does not change that. The DPO wants it recorded that the company knowingly allowed it. Will you sign that, or change the plan?", "{{person.dpo.name}} säger att vart och ett av verktygen är ett personuppgiftsbiträde utan avtal, och att vägledning inte ändrar det. Dataskyddsombudet vill ha dokumenterat att företaget medvetet tillät det. Skriver ni under på det, eller ändrar ni planen?"])
            ]
          }
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
