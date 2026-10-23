/*
 * s32-supplier-ransomware.js — "The Trucks Stop" (archetype D, supplier outage).
 *
 * Shipments stop leaving the warehouse; the logistics provider blames "IT
 * problems" → it is ransomware, and a network tunnel from their systems into
 * your warehouse system is still open → deliveries stop for days and the
 * shipment data lived only with them → their leak site lists your customers'
 * delivery addresses → they want to reconnect, you want evidence → a dozen
 * critical suppliers, none with a tested exit plan.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s32-supplier-ransomware",
    version: 1,
    category: "supplier-outage",
    archetype: "third-party-origin",
    emblem: "supplier-ransom",
    title: L(["The Trucks Stop", "Lastbilarna står still"]),
    summary: L([
      "Nothing is wrong with your systems. Your logistics provider has been hit by ransomware, and your deliveries have stopped anyway. Their incident is now your crisis, and you hold almost none of the levers.",
      "Det är inget fel på era system. Er logistikleverantör har drabbats av ransomware, och era leveranser har stannat ändå. Deras incident är nu er kris, och ni har nästan inga av spakarna."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Protect your own network when a connected supplier is compromised", "Skydda ert eget nätverk när en uppkopplad leverantör är komprometterad"]), teaser: L(["Doors that face your neighbours", "Dörrar som vetter mot grannarna"]) },
      { id: "lo2", text: L(["Keep the business running when a critical supplier stops", "Hålla verksamheten igång när en kritisk leverantör stannar"]), teaser: L(["Living without a partner", "Att klara sig utan en partner"]) },
      { id: "lo3", text: L(["Meet your own duties for data a supplier lost", "Uppfylla era egna skyldigheter för data som en leverantör förlorat"]), teaser: L(["Whose data it really is", "Vems data det egentligen är"]) },
      { id: "lo4", text: L(["Set conditions before reconnecting a recovering supplier", "Ställa villkor innan en leverantör som återhämtar sig kopplas in igen"]), teaser: L(["Trust after trouble", "Förtroende efter problem"]) }
    ],
    mitre: ["T1199", "T1486", "T1567", "T1021"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.AM", "ID.RA", "PR.IR", "RS.CO", "RS.MI", "RC.RP", "RC.CO"],
      iso27001: ["A.5.19", "A.5.20", "A.5.21", "A.5.22", "A.5.24", "A.5.29", "A.5.30", "A.8.20", "A.8.22"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "monday-morning" },
    actor: { types: ["criminal"], motivation: L(["Financial: ransomware against the logistics provider", "Ekonomisk: ransomware mot logistikleverantören"]), capability: "high" },
    variables: {
      orders: { min: 300, max: 9000, scaleBy: "size", step: 10 },
      addresses: { min: 4000, max: 300000, scaleBy: "size", step: 100 },
      penalty: { min: 20000, max: 600000, scaleBy: "size", step: 5000, currency: true }
    },
    roles: ["incidentCommander", "supplierManager", "serviceOwner", "ciso", "networkLead", "itOps", "ceo", "cfo", "comms", "dpo", "legal"],

    groundTruth: {
      rootCause: L([
        "Your logistics provider was hit by ransomware over the weekend after an attacker used a stolen remote-access account. Their transport management system, which held all shipment and delivery data for {{org.name}}, was encrypted, and data was stolen first. A site-to-site network tunnel connected their environment directly to your warehouse system and stayed open for six hours after their outage began. No traffic crossed it maliciously, but nobody knew that at the time. Your contract had no exit or continuity terms.",
        "Er logistikleverantör drabbades av ransomware under helgen efter att en angripare använt ett stulet konto för fjärråtkomst. Deras transportledningssystem, som innehöll alla sändnings- och leveransuppgifter för {{org.name}}, krypterades, och data stals först. En nätverkstunnel kopplade deras miljö direkt till ert lagersystem och stod öppen i sex timmar efter att deras avbrott började. Ingen skadlig trafik passerade den, men det visste ingen då. Ert avtal saknade villkor för avveckling och kontinuitet."
      ]),
      attackerTimeline: [
        { at: -4320, text: L(["Stolen remote-access account used at the logistics provider.", "Ett stulet konto för fjärråtkomst används hos logistikleverantören."]) },
        { at: -1440, text: L(["Shipment database copied out.", "Sändningsdatabasen kopieras ut."]) },
        { at: -420, text: L(["Encryption at the provider; their systems go dark.", "Kryptering hos leverantören; deras system släcks ner."]) },
        { at: 0, text: L(["Your warehouse notices shipments are not being collected.", "Ert lager märker att sändningar inte hämtas."]) },
        { at: 2880, text: L(["Provider appears on a leak site.", "Leverantören dyker upp på en läcksajt."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-tunnel", revealStage: "p2", text: L(["The provider's ransomware began Sunday night, and the always-on tunnel into the warehouse system was never closed.", "Leverantörens ransomware började söndag kväll, och den alltid öppna tunneln in i lagersystemet stängdes aldrig."]) },
      { id: "hf-leak", revealStage: "p4", text: L(["Stolen shipment records include end customers' names and home addresses from your orders.", "Stulna sändningsposter innehåller slutkunders namn och hemadresser från era beställningar."]) },
      { id: "hf-suppliers", revealStage: "p6", text: L(["Twelve suppliers are critical, three have network access, and none has a tested exit plan.", "Tolv leverantörer är kritiska, tre har nätverksåtkomst och ingen har en testad avvecklingsplan."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Nothing collected", "Inget hämtat"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The warehouse manager calls {{person.serviceOwner.name}}. The morning trucks have not arrived, the provider's booking portal shows an error page, and nobody answers their operations line.\n\nThe pallets for {{num.orders|number}} customer orders are wrapped and waiting at the loading dock. A message on the provider's website mentions “technical problems” and promises an update later.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Lagerchefen ringer {{person.serviceOwner.name}}. Morgonens lastbilar har inte kommit, leverantörens bokningsportal visar en felsida och ingen svarar på deras driftsnummer.\n\nPallarna för {{num.orders|number}} kundbeställningar står inplastade och väntar vid lastkajen. Ett meddelande på leverantörens webbplats nämner ”tekniska problem” och lovar en uppdatering senare."
        ]),
        injects: [
          inj("i1-1", 0, "statusPage", "supplier", "medium", "unverified", [
            "We are experiencing technical problems affecting bookings and tracking. Our teams are working to restore services. We apologise for the inconvenience.",
            "Vi har tekniska problem som påverkar bokning och spårning. Våra team arbetar med att återställa tjänsterna. Vi ber om ursäkt för besväret."
          ], { headline: ["Service disruption", "Driftstörning"], tests: ["lo2"] }),
          inj("i1-2", 30, "chat", "person.networkLead", "medium", "confirmed", [
            "“Their side of the network tunnel to our warehouse system is still up. I can see it. Nothing unusual crossing it, but it's open.”",
            "”Deras sida av nätverkstunneln till vårt lagersystem är fortfarande uppe. Jag ser den. Inget ovanligt passerar, men den är öppen.”"
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("What connections do you have to the provider: integrations, tunnels, shared accounts?", "Vilka förbindelser har ni med leverantören: integrationer, tunnlar, delade konton?", ["networkLead", "itOps"]),
            q("What would you see if something crossed that tunnel?", "Vad skulle ni se om något passerade tunneln?", ["networkLead", "ciso"]),
            q("What does the warehouse system need from the provider to keep working?", "Vad behöver lagersystemet från leverantören för att fungera?", ["itOps"])
          ],
          executive: [
            q("Is this an inconvenience or the start of a crisis?", "Är det här ett besvär eller början på en kris?", ["incidentCommander", "ceo"]),
            q("Who at the provider can you actually reach?", "Vem hos leverantören kan ni faktiskt nå?", ["supplierManager"]),
            q("What do you tell customers waiting for deliveries today?", "Vad säger ni till kunder som väntar på leveranser i dag?", ["serviceOwner", "comms"])
          ]
        },
        challenges: [ch("The provider's account manager is on holiday and their deputy does not answer.", "Leverantörens kundansvarige är på semester och ersättaren svarar inte.")],
        decision: dec("d1", "incidentCommander", ["What do you do first?", "Vad gör ni först?"], [
          ["Close the tunnel and integrations as a precaution, and set up a crisis contact with the provider.", "Stäng tunneln och integrationerna som en försiktighetsåtgärd, och upprätta en kriskontakt med leverantören."],
          ["Leave the connections open so deliveries resume quickly when they recover.", "Låt förbindelserna vara öppna så att leveranserna snabbt kan komma igång när de återhämtar sig."],
          ["Wait for the provider's update before deciding anything.", "Vänta på leverantörens uppdatering innan något beslutas."]
        ], {
          knowns: [["The provider is down and the tunnel to your systems is open.", "Leverantören ligger nere och tunneln till era system är öppen."]],
          uncertainties: [["Whether it is an outage or an attack.", "Om det är ett avbrott eller ett angrepp."]],
          tradeoffs: {
            operational: ["Closing connections makes recovery slower later.", "Att stänga förbindelserna gör återhämtningen långsammare senare."],
            security: ["An open tunnel to a possibly compromised network is a risk to you.", "En öppen tunnel till ett möjligen komprometterat nätverk är en risk för er."],
            legal: ["Your contract may say little about who decides.", "Ert avtal säger kanske lite om vem som bestämmer."],
            reputational: ["Customers expect deliveries today.", "Kunderna väntar sig leveranser i dag."]
          },
          evaluation: [["Protects your network before the cause is confirmed", "Skyddar ert nätverk innan orsaken är bekräftad"]]
        }),
        facilitator: fac(
          ["“Technical problems” often means ransomware. The first decision is about your exposure, not theirs.", "”Tekniska problem” betyder ofta ransomware. Det första beslutet handlar om er exponering, inte deras."],
          ["Close the tunnel and integrations precautionarily; open a crisis channel.", "Stäng tunneln och integrationerna i förebyggande syfte; öppna en kriskanal."],
          [["Ask: if their network is compromised, what can it reach of yours?", "Fråga: om deras nätverk är komprometterat, vad kan det nå hos er?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 240,
        title: L(["It is ransomware", "Det är ransomware"]),
        twist: L(["The provider confirms ransomware since Sunday night. Their transport system is encrypted and they cannot say when it returns. The tunnel into your warehouse system was open for the whole of that time.", "Leverantören bekräftar ransomware sedan söndag kväll. Deras transportsystem är krypterat och de kan inte säga när det kommer tillbaka. Tunneln in i ert lagersystem var öppen under hela den tiden."]),
        twistKind: "cause",
        assumptionChallenged: L(["It is an ordinary outage at the supplier.", "Det är ett vanligt avbrott hos leverantören."]),
        reveals: ["hf-tunnel"],
        narrative: L([
          "{{time.T+240|clock}}. {{person.supplierManager.name}} finally reaches the provider's head of IT, who sounds exhausted. They have been up since Sunday night and are speaking carefully, as their lawyers have told them to.\n\nThey confirm what “technical problems” meant. Then {{person.networkLead.name}} asks the question nobody at the provider had thought about: what happened to the connection into your network.",
          "Klockan {{time.T+240|clock}}. {{person.supplierManager.name}} når till slut leverantörens IT-chef, som låter utmattad. Hen har varit vaken sedan söndag kväll och uttrycker sig försiktigt, som juristerna har sagt.\n\nHen bekräftar vad ”tekniska problem” betydde. Sedan ställer {{person.networkLead.name}} frågan som ingen hos leverantören hade tänkt på: vad hände med förbindelsen in i ert nätverk."
        ]),
        injects: [
          inj("i2-1", 240, "phoneTranscript", "supplier", "high", "confirmed", [
            "The provider's head of IT: “It's ransomware. It started Sunday night. Our transport system is encrypted. We have backups but we don't know how long. The tunnel to you? I honestly don't know.”",
            "Leverantörens IT-chef: ”Det är ransomware. Det började söndag kväll. Vårt transportsystem är krypterat. Vi har säkerhetskopior men vet inte hur lång tid det tar. Tunneln till er? Ärligt talat vet jag inte.”"
          ], { reveals: ["hf-tunnel"], tests: ["lo1"] }),
          inj("i2-2", 300, "networkEvidence", "soc", "medium", "confirmed", [
            "Tunnel logs since Sunday 22:00: normal booking traffic until 23:40, then silence. No connections from the provider's side to anything except the booking interface. Logs cover six hours.",
            "Tunnelloggar sedan söndag 22.00: normal bokningstrafik fram till 23.40, sedan tystnad. Inga anslutningar från leverantörens sida till något annat än bokningsgränssnittet. Loggarna täcker sex timmar."
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Are six hours of tunnel logs enough to be sure nothing crossed?", "Räcker sex timmars tunnelloggar för att vara säker på att inget passerade?", ["ciso", "networkLead"]),
            q("What else should you check on your side of the connection?", "Vad mer bör ni kontrollera på er sida av förbindelsen?", ["itOps", "ciso"]),
            q("Was closing the connections this morning the right call?", "Var det rätt att stänga förbindelserna i morse?", ["networkLead"], "d1")
          ],
          executive: [
            q("How long can you go without deliveries?", "Hur länge klarar ni er utan leveranser?", ["serviceOwner", "ceo"]),
            q("What does your contract say about this?", "Vad säger ert avtal om det här?", ["legal", "supplierManager"]),
            q("If you had kept the tunnel open for a quick restart, how would you feel now?", "Om ni hade hållit tunneln öppen för en snabb omstart, hur skulle det kännas nu?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The provider asks you to keep the incident confidential.", "Leverantören ber er hålla incidenten konfidentiell.")],
        decision: dec("d2", "ciso", ["How do you treat your own exposure?", "Hur hanterar ni er egen exponering?"], [
          ["Keep the connections closed, check the warehouse system and the accounts the provider used, and log your decision.", "Håll förbindelserna stängda, kontrollera lagersystemet och de konton leverantören använde, och dokumentera beslutet."],
          ["Trust the six hours of logs and move on to logistics.", "Lita på de sex timmarna loggar och gå vidare till logistiken."],
          ["Treat yourselves as compromised and rebuild the warehouse system.", "Behandla er själva som komprometterade och bygg om lagersystemet."]
        ], {
          knowns: [["The provider has ransomware; the tunnel was open throughout.", "Leverantören har ransomware; tunneln var öppen hela tiden."]],
          uncertainties: [["Whether the attacker used the tunnel.", "Om angriparen använde tunneln."]],
          tradeoffs: {
            operational: ["A rebuild costs days you do not have.", "En ombyggnad kostar dagar ni inte har."],
            security: ["Moving on too fast may miss a foothold.", "Att gå vidare för snabbt kan missa ett fotfäste."],
            legal: ["Documenting your checks protects you later.", "Att dokumentera era kontroller skyddar er senare."],
            reputational: ["Nothing public yet.", "Inget offentligt ännu."]
          },
          evaluation: [["Checks proportionately on its own side, with a record of the reasoning", "Kontrollerar proportionerligt på sin egen sida, med resonemanget dokumenterat"]]
        }),
        facilitator: fac(
          ["Confirmation of ransomware shifts the question to your exposure and to continuity.", "Bekräftelsen av ransomware flyttar frågan till er exponering och kontinuiteten."],
          ["Connections stay closed, proportionate checks, decisions logged.", "Förbindelserna förblir stängda, proportionerliga kontroller, beslut dokumenterade."],
          [["Ask: what proof would you want before reopening?", "Fråga: vilka belägg skulle ni vilja ha innan ni öppnar igen?"]]
        )
      },
      {
        id: "p3",
        clock: 720,
        priority: 1,
        title: L(["Ten days", "Tio dagar"]),
        twist: L(["The provider estimates ten days to restore. Their system held every shipment, address and delivery slot for your orders. You have no copy, and alternative carriers need that data to book anything.", "Leverantören uppskattar tio dagar för att återställa. Deras system innehöll varje sändning, adress och leveranstid för era beställningar. Ni har ingen kopia, och alternativa transportörer behöver den datan för att kunna boka något."]),
        twistKind: "impact",
        assumptionChallenged: L(["We can switch to another carrier tomorrow.", "Vi kan byta till en annan transportör i morgon."]),
        narrative: L([
          "{{time.T+720|clock}}. Two alternative carriers have capacity and are willing to help. Both ask for the same thing before they can take a single pallet: a booking file with addresses, weights, delivery windows and customer references.\n\n{{person.itOps.name}} looks for it in the warehouse system. Then everyone in the room realises where that information has always lived.",
          "Klockan {{time.T+720|clock}}. Två alternativa transportörer har kapacitet och vill hjälpa till. Båda ber om samma sak innan de kan ta en enda pall: en bokningsfil med adresser, vikter, leveransfönster och kundreferenser.\n\n{{person.itOps.name}} letar efter den i lagersystemet. Sedan inser alla i rummet var den informationen alltid har funnits."
        ]),
        injects: [
          inj("i3-1", 720, "impactReport", "person.serviceOwner", "high", "confirmed", [
            "Orders waiting: {{num.orders|number}}. Shipment data: held only in the provider's system. Largest customer's contract: late delivery penalty from day 3, estimated {{num.penalty|currency}} by day 10.",
            "Väntande beställningar: {{num.orders|number}}. Sändningsdata: finns bara i leverantörens system. Största kundens avtal: vite för sen leverans från dag 3, uppskattat till {{num.penalty|currency}} till dag 10."
          ], { tests: ["lo2"] })
        ],
        charts: [{
          id: "c3-backlog", type: "line",
          title: L(["Orders waiting at the dock", "Beställningar som väntar vid kajen"]), unit: L(["orders", "beställningar"]),
          caption: L(["Days from the outage.", "Dagar från avbrottet."]),
          data: line(["Orders", "Beställningar"], 0, 10, 1, (x, ctx) => ctx.vars.orders * (1 + x * 0.6), "days")
        }],
        questions: {
          technical: [
            q("Can you rebuild a booking file from your order system?", "Kan ni återskapa en bokningsfil från ert ordersystem?", ["itOps", "serviceOwner"]),
            q("What would it take to connect a new carrier safely in days?", "Vad skulle krävas för att koppla in en ny transportör säkert på några dagar?", ["networkLead", "itOps"]),
            q("Did your checks on the warehouse system find anything?", "Hittade era kontroller av lagersystemet något?", ["ciso"], "d2")
          ],
          executive: [
            q("Which customers and orders go first?", "Vilka kunder och beställningar går först?", ["serviceOwner", "ceo"]),
            q("Do you pay a premium to alternative carriers, and who approves it?", "Betalar ni ett påslag till alternativa transportörer, och vem godkänner det?", ["cfo"]),
            q("Did keeping connections closed make the switch harder?", "Gjorde de stängda förbindelserna bytet svårare?", ["supplierManager"], "d2")
          ]
        },
        challenges: [ch("Your largest customer threatens to invoke the penalty clause on day 3.", "Er största kund hotar att åberopa vitesklausulen dag 3.")],
        decision: dec("d3", "serviceOwner", ["How do you keep goods moving?", "Hur håller ni varorna i rörelse?"], [
          ["Rebuild booking data from your own systems, split volume across two alternative carriers, and prioritise by contract and need.", "Återskapa bokningsdata från era egna system, fördela volymen på två alternativa transportörer och prioritera efter avtal och behov."],
          ["Wait for the provider; switching costs more than it saves.", "Vänta på leverantören; ett byte kostar mer än det sparar."],
          ["Move everything to one alternative carrier at full price.", "Flytta allt till en alternativ transportör till fullt pris."]
        ], {
          knowns: [["The provider needs about ten days; the data is theirs.", "Leverantören behöver omkring tio dagar; datan finns hos dem."]],
          uncertainties: [["How complete a rebuilt booking file will be.", "Hur komplett en återskapad bokningsfil blir."]],
          tradeoffs: {
            operational: ["Rebuilding data manually is slow and error-prone.", "Att återskapa data manuellt är långsamt och felbenäget."],
            security: ["New carriers mean new connections, set up in a hurry.", "Nya transportörer innebär nya förbindelser, uppsatta i all hast."],
            legal: ["Penalty clauses start on day 3.", "Vitesklausulerna börjar gälla dag 3."],
            reputational: ["Customers see empty delivery slots, not your supplier's incident.", "Kunderna ser tomma leveranstider, inte er leverantörs incident."]
          },
          evaluation: [["Keeps the business moving without opening new risks carelessly", "Håller verksamheten igång utan att vårdslöst öppna nya risker"]]
        }),
        facilitator: fac(
          ["Dependency becomes visible only when it breaks. Data held only by a supplier is a continuity risk.", "Beroendet blir synligt först när det går sönder. Data som bara finns hos en leverantör är en kontinuitetsrisk."],
          ["Rebuild from own data, split carriers, prioritise, set up new links securely.", "Återskapa från egen data, dela på transportörer, prioritera, sätt upp nya förbindelser säkert."],
          [["Ask: which of your processes depends on data you do not hold?", "Fråga: vilka av era processer är beroende av data som ni inte har?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 2880,
        title: L(["On the leak site", "På läcksajten"]),
        twist: L(["The provider appears on a ransomware leak site. The samples include your end customers' names, home addresses and delivery notes: about {{num.addresses|number}} people. You are the controller of that data.", "Leverantören dyker upp på en läcksajt för ransomware. Utdragen innehåller era slutkunders namn, hemadresser och leveransanteckningar: omkring {{num.addresses|number}} personer. Ni är personuppgiftsansvariga för den datan."]),
        twistKind: "scope",
        assumptionChallenged: L(["This is a logistics problem, not a data breach.", "Det här är ett logistikproblem, inte ett dataintrång."]),
        reveals: ["hf-leak"],
        narrative: L([
          "{{time.T+2880|weekday|cap}}. Goods are moving again through the alternative carriers, slowly. The crisis team is starting to talk about this as a logistics problem with a known end date.\n\nThen {{person.dpo.name}} forwards a link from a threat intelligence newsletter. The provider has been named on a leak site, and the attackers have posted samples to prove what they took.",
          "{{time.T+2880|weekday|cap}}. Varorna rör sig igen via de alternativa transportörerna, långsamt. Krisledningen börjar prata om det här som ett logistikproblem med ett känt slutdatum.\n\nSedan vidarebefordrar {{person.dpo.name}} en länk från ett nyhetsbrev om hotunderrättelser. Leverantören har namngetts på en läcksajt, och angriparna har lagt ut utdrag för att bevisa vad de tog."
        ]),
        injects: [
          inj("i4-1", 2880, "threatIntel", "threatIntel", "high", "confirmed", [
            "Leak site post names your logistics provider. Samples include delivery records with sender “{{org.name}}”: recipient names, home addresses, phone numbers and notes such as “leave behind the shed”.",
            "Ett inlägg på läcksajten namnger er logistikleverantör. Utdragen innehåller leveransposter med avsändaren ”{{org.name}}”: mottagares namn, hemadresser, telefonnummer och anteckningar som ”ställ bakom förrådet”."
          ], { reveals: ["hf-leak"], tests: ["lo3"] }),
          inj("i4-2", 2940, "executiveMessage", "person.dpo", "high", "confirmed", [
            "“The provider processes this data on our behalf. That makes the breach ours to assess and notify. Our clock started when we learned of it, which is now.”",
            "”Leverantören behandlar den här datan för vår räkning. Det gör att det är vi som ska bedöma och anmäla incidenten. Vår klocka började när vi fick kännedom, alltså nu.”"
          ], { tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["Your exposure", "Er exponering"]),
          data: kpi([
            { id: "ord", label: ["Orders delayed", "Försenade beställningar"], value: (v) => v.orders, tone: "warn" },
            { id: "adr", label: ["End customers in leaked data", "Slutkunder i läckt data"], value: (v) => v.addresses, tone: "danger" },
            { id: "pen", label: ["Penalty exposure", "Vitesexponering"], value: (v) => v.penalty, format: "currency", tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("Can you work out which of your customers are in the stolen data?", "Kan ni ta reda på vilka av era kunder som finns i den stulna datan?", ["itOps", "dpo"]),
            q("What does the provider know about what was taken?", "Vad vet leverantören om vad som togs?", ["supplierManager"]),
            q("Did rebuilding booking data from your own systems help here?", "Hjälpte det här att ni återskapade bokningsdata från era egna system?", ["itOps"], "d3")
          ],
          executive: [
            q("Do you notify {{reg.dpaShort}} even though the breach was at the supplier?", "Anmäler ni till {{reg.dpaShort}} trots att intrånget skedde hos leverantören?", ["dpo", "legal"]),
            q("What do you tell people whose home address and “where to leave the parcel” is public?", "Vad säger ni till personer vars hemadress och ”var paketet ska ställas” är offentlig?", ["comms", "dpo"]),
            q("Does your data processing agreement with the provider help you now?", "Hjälper ert personuppgiftsbiträdesavtal med leverantören er nu?", ["legal"], "d3")
          ]
        },
        challenges: [ch("The provider asks you not to notify until their own investigation is complete.", "Leverantören ber er att inte anmäla förrän deras egen utredning är klar.")],
        decision: dec("d4", "dpo", ["What do you do about the leaked data?", "Vad gör ni med den läckta datan?"], [
          ["Notify the regulator now, tell affected customers with practical advice, and demand the provider's findings under your agreement.", "Anmäl till tillsynsmyndigheten nu, berätta för berörda kunder med praktiska råd och kräv leverantörens resultat enligt ert avtal."],
          ["Wait for the provider's investigation as they asked.", "Vänta på leverantörens utredning som de bad om."],
          ["Leave notification to the provider, since it was their breach.", "Låt leverantören sköta anmälan, eftersom det var deras intrång."]
        ], {
          knowns: [["Your customers' personal data is on a leak site.", "Era kunders personuppgifter finns på en läcksajt."]],
          uncertainties: [["The full set of records stolen.", "Hela mängden poster som stals."]],
          tradeoffs: {
            operational: ["Customer notification on top of delivery chaos is heavy.", "Att informera kunderna ovanpå leveranskaoset är tungt."],
            security: ["Addresses with delivery notes enable burglary and fraud.", "Adresser med leveransanteckningar möjliggör inbrott och bedrägerier."],
            legal: ["As controller, the duty to notify is yours.", "Som personuppgiftsansvarig ligger anmälningsskyldigheten hos er."],
            reputational: ["Customers will hear about it from the news.", "Kunderna kommer att höra om det från nyheterna."]
          },
          evaluation: [["Owns the controller's duties even when the breach happened elsewhere", "Tar på sig den personuppgiftsansvariges skyldigheter även när intrånget skedde någon annanstans"]]
        }),
        facilitator: fac(
          ["The scope jump: a logistics problem becomes your data breach. Controller duties do not move to the processor.", "Omfattningen ökar: ett logistikproblem blir ert dataintrång. Den personuppgiftsansvariges skyldigheter flyttas inte till biträdet."],
          ["Notify, inform customers with advice, use your agreement to get findings.", "Anmäl, informera kunderna med råd, använd avtalet för att få fram resultat."],
          [["Ask: whose name is on the delivery note?", "Fråga: vems namn står på följesedeln?"]]
        )
      },
      {
        id: "p5",
        clock: 7200,
        priority: 2,
        title: L(["Back online?", "Igång igen?"]),
        twist: L(["The provider says it is clean and wants to reopen the tunnel tomorrow. It offers a one-page statement from its own IT team, no forensic report, and no answer on how the attacker got in.", "Leverantören säger att den är ren och vill öppna tunneln igen i morgon. Den erbjuder ett försäkrande på en sida från sitt eget IT-team, ingen forensisk rapport och inget svar på hur angriparen kom in."]),
        twistKind: "authority",
        assumptionChallenged: L(["When the supplier says it is safe, we reconnect.", "När leverantören säger att det är säkert kopplar vi in igen."]),
        narrative: L([
          "{{time.T+7200|weekday|cap}}. Day five. The provider is recovering faster than expected and is eager to have its customers back. Every day without your volume costs it money too.\n\nIts head of IT calls with good news and a request. {{person.networkLead.name}} listens to the good news and then asks three questions that do not get clear answers.",
          "{{time.T+7200|weekday|cap}}. Dag fem. Leverantören återhämtar sig snabbare än väntat och vill gärna ha tillbaka sina kunder. Varje dag utan er volym kostar dem också pengar.\n\nDeras IT-chef ringer med goda nyheter och en begäran. {{person.networkLead.name}} lyssnar på de goda nyheterna och ställer sedan tre frågor som inte får tydliga svar."
        ]),
        injects: [
          inj("i5-1", 7200, "supplierNotice", "supplier", "medium", "confirmed", [
            "“Our systems have been restored from clean backups and we are confident the threat is removed. We propose reopening the integration tomorrow at 06:00.”",
            "”Våra system har återställts från rena säkerhetskopior och vi är säkra på att hotet är borttaget. Vi föreslår att integrationen öppnas igen i morgon klockan 06.00.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What would you need to see before trusting their network again?", "Vad skulle ni behöva se innan ni litar på deras nätverk igen?", ["networkLead", "ciso"]),
            q("Do you need the always-on tunnel at all, or would a narrower integration do?", "Behöver ni den alltid öppna tunneln över huvud taget, eller skulle en smalare integration räcka?", ["networkLead"]),
            q("Is the regulator notification still accurate with what the provider now says?", "Stämmer anmälan till tillsynsmyndigheten fortfarande med det leverantören nu säger?", ["dpo"], "d4")
          ],
          executive: [
            q("How much longer can the alternative carriers carry you?", "Hur mycket längre kan de alternativa transportörerna bära er?", ["serviceOwner", "cfo"]),
            q("Who decides when to reconnect: you, or the provider?", "Vem bestämmer när ni kopplar in igen: ni eller leverantören?", ["supplierManager", "legal"]),
            q("Did notifying early, against the provider's wishes, damage the relationship?", "Skadade den tidiga anmälan, mot leverantörens önskan, relationen?", ["supplierManager"], "d4")
          ]
        },
        challenges: [ch("Your commercial director wants the cheaper provider back as soon as possible.", "Er kommersiella chef vill ha tillbaka den billigare leverantören så snart som möjligt.")],
        decision: dec("d5", "ciso", ["On what conditions do you reconnect?", "På vilka villkor kopplar ni in igen?"], [
          ["Reconnect through a narrow, monitored integration once you have the root cause and independent confirmation.", "Koppla in igen via en smal, övervakad integration när ni har fått grundorsaken och en oberoende bekräftelse."],
          ["Reopen the tunnel tomorrow as proposed.", "Öppna tunneln i morgon som föreslaget."],
          ["Move permanently to the alternative carriers.", "Flytta permanent till de alternativa transportörerna."]
        ], {
          knowns: [["The provider is restored but cannot show how it was breached.", "Leverantören är återställd men kan inte visa hur intrånget skedde."]],
          uncertainties: [["Whether the attacker's way in is closed.", "Om angriparens väg in är stängd."]],
          tradeoffs: {
            operational: ["Waiting for evidence extends expensive workarounds.", "Att vänta på belägg förlänger dyra nödlösningar."],
            security: ["Reconnecting blind reopens a path into your network.", "Att koppla in blint öppnar på nytt en väg in i ert nätverk."],
            legal: ["Your contract gives you few rights to demand evidence.", "Ert avtal ger er få rättigheter att kräva belägg."],
            reputational: ["A second incident through the same supplier would be unforgivable.", "En andra incident via samma leverantör vore oförlåtlig."]
          },
          evaluation: [["Sets evidence-based conditions and narrows the connection", "Ställer villkor byggda på belägg och smalnar av förbindelsen"]]
        }),
        facilitator: fac(
          ["Reconnection is a security decision under commercial pressure. Watch who owns it.", "Återanslutningen är ett säkerhetsbeslut under kommersiellt tryck. Se vem som äger det."],
          ["Conditions: root cause, independent check, narrower and monitored integration.", "Villkor: grundorsak, oberoende kontroll, smalare och övervakad integration."],
          [["Ask: what would make you confident, rather than hopeful?", "Fråga: vad skulle göra er säkra, snarare än hoppfulla?"]]
        )
      },
      {
        id: "p6",
        clock: 20160,
        priority: 3,
        title: L(["Twelve suppliers", "Tolv leverantörer"]),
        twist: L(["A review of suppliers finds twelve that are critical, three with network access into your systems, and not one with a tested exit or continuity plan.", "En genomgång av leverantörerna hittar tolv som är kritiska, tre med nätverksåtkomst in i era system och inte en enda med en testad plan för avveckling eller kontinuitet."]),
        twistKind: "scope",
        assumptionChallenged: L(["The logistics provider was our only weak link.", "Logistikleverantören var vår enda svaga länk."]),
        reveals: ["hf-suppliers"],
        narrative: L([
          "{{time.T+20160|weekday|cap}}. Two weeks later. Deliveries are back to normal and the penalty negotiations are under way. {{person.supplierManager.name}} has used the quiet to map every supplier the business could not do without for a week.\n\nThe map is uncomfortable. It shows connections nobody remembered approving, and data that only exists in someone else's system.",
          "{{time.T+20160|weekday|cap}}. Två veckor senare. Leveranserna är tillbaka i normal takt och förhandlingarna om viten pågår. {{person.supplierManager.name}} har använt lugnet till att kartlägga varje leverantör som verksamheten inte skulle klara sig utan i en vecka.\n\nKartan är obekväm. Den visar förbindelser som ingen minns att de godkände, och data som bara finns i någon annans system."
        ]),
        injects: [
          inj("i6-1", 20160, "impactReport", "person.supplierManager", "medium", "confirmed", [
            "Critical suppliers: 12. With network access to your systems: 3 (all always-on tunnels). Holding data you have no copy of: 5. With exit or continuity terms in the contract: 1. Tested: 0.",
            "Kritiska leverantörer: 12. Med nätverksåtkomst till era system: 3 (alla alltid öppna tunnlar). Som har data ni saknar kopia av: 5. Med villkor för avveckling eller kontinuitet i avtalet: 1. Testade: 0."
          ], { reveals: ["hf-suppliers"], tests: ["lo2", "lo4"] })
        ],
        questions: {
          technical: [
            q("Which of the three tunnels could be narrowed or removed?", "Vilka av de tre tunnlarna skulle kunna smalnas av eller tas bort?", ["networkLead"]),
            q("Which supplier-held data should you keep a copy of?", "Vilken data som leverantörer har bör ni ha en kopia av?", ["itOps", "serviceOwner"]),
            q("Looking back, how did closing the tunnel on day one shape the incident?", "När ni ser tillbaka, hur påverkade stängningen av tunneln dag ett incidenten?", ["networkLead"], "d1")
          ],
          executive: [
            q("What do you require of critical suppliers from now on?", "Vad kräver ni av kritiska leverantörer från och med nu?", ["supplierManager", "legal"]),
            q("Who tests the exit plans, and how often?", "Vem testar avvecklingsplanerna, och hur ofta?", ["supplierManager"]),
            q("Did the reconnection conditions you set hold?", "Höll villkoren ni ställde för återanslutningen?", ["ciso"], "d5")
          ]
        },
        challenges: [ch("Two of the critical suppliers are much larger than you and refuse to change their contracts.", "Två av de kritiska leverantörerna är mycket större än ni och vägrar ändra sina avtal.")],
        decision: dec("d6", "supplierManager", ["What do you change?", "Vad ändrar ni?"], [
          ["Narrow every supplier connection, keep copies of critical data, add incident and exit terms, and test one exit plan per quarter.", "Smalna av varje leverantörsförbindelse, behåll kopior av kritisk data, lägg till villkor för incidenter och avveckling, och testa en avvecklingsplan per kvartal."],
          ["Add a security questionnaire to procurement.", "Lägg till ett säkerhetsformulär i upphandlingen."],
          ["Dual-source every critical supplier.", "Ha dubbla leverantörer för varje kritisk leverantör."]
        ], {
          knowns: [["Critical dependencies have no tested exit and some have network access.", "Kritiska beroenden saknar testad avveckling och några har nätverksåtkomst."]],
          uncertainties: [["Which supplier is next.", "Vilken leverantör som blir nästa."]],
          tradeoffs: {
            operational: ["Exit tests take time from people who are already busy.", "Avvecklingstester tar tid från folk som redan har fullt upp."],
            security: ["Questionnaires measure promises, not resilience.", "Formulär mäter löften, inte motståndskraft."],
            legal: ["Large suppliers resist new terms.", "Stora leverantörer motsätter sig nya villkor."],
            reputational: ["Customers expect you to manage your suppliers.", "Kunderna förväntar sig att ni hanterar era leverantörer."]
          },
          evaluation: [["Reduces exposure to suppliers and practises living without them", "Minskar exponeringen mot leverantörer och övar på att klara sig utan dem"]]
        }),
        facilitator: fac(
          ["End on dependency management: connections, data copies, exit plans you have tried.", "Avsluta med hantering av beroenden: förbindelser, kopior av data, avvecklingsplaner ni har provat."],
          ["Narrow links, keep data copies, incident and exit terms, regular exit tests.", "Smalare förbindelser, kopior av data, villkor för incidenter och avveckling, regelbundna avvecklingstester."],
          [["Ask: which supplier would stop you for a week, and have you ever tried without them?", "Fråga: vilken leverantör skulle stoppa er i en vecka, och har ni någonsin provat utan dem?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Deliveries recover through alternative carriers and your network stays clean, but your customers' addresses are public and penalties are paid.",
        "Leveranserna kommer igång via alternativa transportörer och ert nätverk förblir rent, men era kunders adresser är offentliga och viten betalas."
      ])
    },

    debrief: {
      keyLessons: [
        L(["A supplier's incident becomes yours through every connection you share: close them first.", "En leverantörs incident blir er genom varje förbindelse ni delar: stäng dem först."]),
        L(["Data held only by a supplier is a continuity risk you only see when it breaks.", "Data som bara finns hos en leverantör är en kontinuitetsrisk som syns först när den går sönder."]),
        L(["As controller, notification is your duty even when the breach was at the processor.", "Som personuppgiftsansvarig är anmälan er skyldighet även när intrånget skedde hos biträdet."]),
        L(["Reconnect on evidence, not on reassurance.", "Koppla in igen på belägg, inte på försäkringar."])
      ],
      assumptionsVsReality: [
        avr(["An ordinary supplier outage.", "Ett vanligt avbrott hos leverantören."], ["Ransomware, with a tunnel into our systems open.", "Ransomware, med en tunnel in i våra system öppen."], "p2"),
        avr(["A logistics problem, not a breach.", "Ett logistikproblem, inte ett intrång."], ["Our customers' addresses on a leak site.", "Våra kunders adresser på en läcksajt."], "p4"),
        avr(["One weak link.", "En svag länk."], ["Twelve critical suppliers, none with a tested exit.", "Tolv kritiska leverantörer, ingen med testad avveckling."], "p6")
      ],
      strengthsToLookFor: [
        L(["Closing supplier connections before the cause was confirmed", "Att stänga leverantörsförbindelser innan orsaken bekräftats"]),
        L(["Rebuilding booking data from own systems", "Att återskapa bokningsdata från egna system"]),
        L(["Notifying as controller despite the supplier's request", "Att anmäla som personuppgiftsansvarig trots leverantörens begäran"])
      ],
      commonGaps: [
        L(["Keeping connections open for a fast restart", "Att hålla förbindelser öppna för en snabb omstart"]),
        L(["Leaving notification to the supplier", "Att lämna anmälan till leverantören"]),
        L(["Reconnecting on the supplier's word", "Att koppla in igen på leverantörens ord"])
      ],
      suggestedActions: [
        act(["Replace always-on supplier tunnels with narrow, monitored integrations.", "Ersätt alltid öppna leverantörstunnlar med smala, övervakade integrationer."], "networkLead", "high"),
        act(["Keep your own copy of data critical to operations.", "Behåll en egen kopia av data som är kritisk för verksamheten."], "itOps", "high"),
        act(["Add incident notification, evidence and exit terms to critical supplier contracts.", "Lägg till villkor om incidentrapportering, belägg och avveckling i avtal med kritiska leverantörer."], "supplierManager", "medium"),
        act(["Test one supplier exit plan each quarter.", "Testa en avvecklingsplan för en leverantör varje kvartal."], "supplierManager", "medium")
      ]
    }
  });
})();
