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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

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
          ["Wait for the provider's 10:00 update: closing the tunnel now could strand every order in transit.", "Vänta på leverantörens uppdatering klockan 10: att stänga tunneln nu kan strandsätta varje order som är på väg."]
        ], {
          knowns: [["The provider is down and the tunnel to your systems is open.", "Leverantören ligger nere och tunneln till era system är öppen."]],
          uncertainties: [["Whether it is an outage or an attack.", "Om det är ett avbrott eller ett angrepp."]],
          tradeoffs: {
            operational: ["Closing connections makes recovery slower later.", "Att stänga förbindelserna gör återhämtningen långsammare senare."],
            security: ["An open tunnel to a possibly compromised network is a risk to you.", "En öppen tunnel till ett möjligen komprometterat nätverk är en risk för er."],
            legal: ["Your contract may say little about who decides.", "Ert avtal säger kanske lite om vem som bestämmer."],
            reputational: ["Customers expect deliveries today.", "Kunderna väntar sig leveranser i dag."]
          },
          evaluation: [["Protects your network before the cause is confirmed", "Skyddar ert nätverk innan orsaken är bekräftad"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["After closing the tunnel", "Efter att tunneln stängts"], [
              io(["Someone calls back", "Någon ringer tillbaka"], ["Closing the tunnel set off an alarm at the provider, and someone from their network team finally calls, surprised that you noticed anything. You now have a direct number.", "Stängningen av tunneln utlöste ett larm hos leverantören, och någon från deras nätverksteam ringer till slut, förvånad över att ni märkt något. Nu har ni ett direktnummer."], ["You have a working contact in the provider's network team.", "Ni har en fungerande kontakt i leverantörens nätverksteam."]),
              io(["The pick lists stop", "Plocklistorna stannar"], ["The warehouse system was waiting on the closed integration and briefly stops releasing pick lists for everything, not only the provider's orders. The warehouse manager wants to know who decided this.", "Lagersystemet väntade på den stängda integrationen och slutar en stund att släppa plocklistor för allt, inte bara leverantörens ordrar. Lagerchefen vill veta vem som beslutade det."], ["Closing the integration briefly halted all pick lists in the warehouse.", "Stängningen av integrationen stoppade en stund alla plocklistor i lagret."], { reopen: true }),
              io(["Quiet either way", "Tyst i båda fallen"], ["Nothing visible changes. The tunnel was quiet before you closed it and is quiet now, and nobody can say whether closing it mattered.", "Inget synligt förändras. Tunneln var tyst innan ni stängde den och är tyst nu, och ingen kan säga om stängningen spelade någon roll."], ["The tunnel was quiet both before and after closing.", "Tunneln var tyst både före och efter stängningen."])
            ]),
            ir("i2", { notChosen: "A" }, ["The tunnel stays open", "Tunneln står öppen"], [
              io(["An industry alert", "En branschvarning"], ["An industry security group sends an alert: customers of logistics providers with outages this week should cut network links to them immediately. Your link is still open.", "En säkerhetsgrupp i branschen skickar en varning: kunder till logistikleverantörer med avbrott den här veckan bör omedelbart koppla bort nätverksförbindelserna till dem. Er förbindelse är fortfarande öppen."], ["An industry alert advises cutting links to the provider now.", "En branschvarning råder att koppla bort förbindelserna till leverantören nu."], { reopen: true }),
              io(["No traffic at all", "Ingen trafik alls"], ["{{person.networkLead.name}} watches the tunnel for an hour: no traffic at all. Several in the room say this proves it is just an outage.", "{{person.networkLead.name}} bevakar tunneln i en timme: ingen trafik alls. Flera i rummet säger att det bevisar att det bara är ett avbrott."], ["The tunnel carried no traffic in the hour after your decision.", "Tunneln hade ingen trafik timmen efter ert beslut."]),
              io(["An unsigned request", "En osignerad begäran"], ["An email from an unfamiliar address, claiming to be the provider's IT, asks you to keep the integration enabled “so that recovery goes smoothly”. Nobody can confirm who sent it.", "Ett mejl från en okänd adress, som påstår sig komma från leverantörens IT, ber er hålla integrationen igång ”så att återställningen går smidigt”. Ingen kan bekräfta vem som skickade det."], ["An unverified email asked you to keep the provider link open.", "Ett overifierat mejl bad er hålla förbindelsen till leverantören öppen."])
            ])
          ],
          pushback: {
            A: [
              pb(["No labels for the trucks", "Inga etiketter till lastbilarna"], ["The warehouse manager says the integration you closed also prints the shipping labels. If the provider recovers by lunch and the trucks come, nothing can leave without them. Do you keep everything closed even if they are back this afternoon?", "Lagerchefen säger att integrationen ni stängde också skriver ut fraktetiketterna. Om leverantören är tillbaka till lunch och lastbilarna kommer kan inget lämna lagret utan dem. Håller ni allt stängt även om de är tillbaka i eftermiddag?"]),
              pb(["“You're treating them as hacked”", "”Ni behandlar dem som hackade”"], ["The commercial director is unhappy: “It's an error page, not an attack. Cutting the link tells our biggest partner we think they've been hacked.” Can you justify isolating a partner on a suspicion, and who tells them?", "Den kommersiella chefen är missnöjd: ”Det är en felsida, inte ett angrepp. Att klippa förbindelsen säger till vår största partner att vi tror att de är hackade.” Kan ni motivera att isolera en partner på en misstanke, och vem berättar det för dem?"]),
              pb(["A crisis contact nobody answers", "En kriskontakt som ingen svarar på"], ["Your “crisis contact” is a voicemail: the account manager is on holiday and the deputy does not pick up. With the connections closed, nobody at the provider can tell you when it is safe to reopen. Who are you actually going to talk to, and how long do you stay closed without them?", "Er ”kriskontakt” är en röstbrevlåda: kundansvarige är på semester och ersättaren svarar inte. Med förbindelserna stängda kan ingen hos leverantören säga när det är säkert att öppna igen. Vem ska ni egentligen prata med, och hur länge håller ni stängt utan dem?"])
            ],
            B: [
              pb(["Where the tunnel lands", "Där tunneln landar"], ["{{person.networkLead.name}} reminds you that the tunnel ends directly on the warehouse system that runs picking and packing. If the provider's network is no longer under their control, you do not know who is at the other end. Is a faster restart worth that?", "{{person.networkLead.name}} påminner om att tunneln slutar direkt i lagersystemet som styr plock och pack. Om leverantörens nätverk inte längre är under deras kontroll vet ni inte vem som sitter i andra änden. Är en snabbare omstart värd det?"]),
              pb(["Others are cutting off", "Andra kopplar bort"], ["In an industry chat, two other customers of the same provider say they have already cut all links “until we know more”. You are now the one keeping the door open. What do you know that they do not?", "I en branschchatt säger två andra kunder till samma leverantör att de redan har kopplat bort alla förbindelser ”tills vi vet mer”. Nu är det ni som håller dörren öppen. Vad vet ni som inte de vet?"]),
              pb(["Recovery is not today", "Återhämtningen sker inte i dag"], ["The provider's status page now says restoring services “will take longer than expected”. Keeping the connections open was meant to save time on a quick recovery that is not coming today. What is the open tunnel buying you now?", "Leverantörens statussida säger nu att återställningen ”kommer att ta längre tid än väntat”. Att hålla förbindelserna öppna skulle spara tid vid en snabb återhämtning som inte kommer i dag. Vad köper den öppna tunneln er nu?"])
            ],
            C: [
              pb(["The update says nothing", "Uppdateringen säger ingenting"], ["The promised update arrives late and repeats the first one word for word: technical problems, no time estimate. You have waited with the tunnel open and learned nothing. How long do you wait for the next one?", "Den utlovade uppdateringen kommer sent och upprepar den första ord för ord: tekniska problem, ingen tidsuppskattning. Ni har väntat med tunneln öppen och inte lärt er något. Hur länge väntar ni på nästa?"]),
              pb(["Who decided to wait?", "Vem beslutade att vänta?"], ["The CISO wants it on record: you knew a tunnel into your network was open to a supplier in trouble, and you chose to wait for their press statement. If this turns out to be an attack, whose name is on that decision?", "CISO vill ha det dokumenterat: ni visste att en tunnel in i ert nätverk stod öppen mot en leverantör med problem, och ni valde att vänta på deras pressmeddelande. Om det visar sig vara ett angrepp, vems namn står på det beslutet?"]),
              pb(["Nothing is moving anyway", "Inget rör sig ändå"], ["The warehouse checks: tracking for orders already on the road has shown nothing since the night, because the provider's systems are down. The orders you wanted to protect are not flowing through the tunnel at all. What exactly is waiting protecting?", "Lagret kontrollerar: spårningen för ordrar som redan är på väg har inte visat något sedan natten, eftersom leverantörens system ligger nere. Ordrarna ni ville skydda går inte genom tunneln alls. Vad är det egentligen väntan skyddar?"])
            ]
          }
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
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the tunnel was closed, the last two hundred orders are stranded: neither delivered nor cancellable.", sv: "Eftersom tunneln stängdes är de sista tvåhundra ordrarna strandsatta: varken levererade eller möjliga att avbeställa." } }
        ],
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
          evaluation: [["Checks proportionately on its own side, with a record of the reasoning", "Kontrollerar proportionerligt på sin egen sida, med resonemanget dokumenterat"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["The checks", "Kontrollerna"], [
              io(["Nothing found", "Inget hittat"], ["The first pass over the warehouse system and the provider's service account finds nothing unusual: no new accounts, no odd sign-ins.", "Den första genomgången av lagersystemet och leverantörens tjänstekonto hittar inget ovanligt: inga nya konton, inga konstiga inloggningar."], ["The first check found nothing unusual on your side.", "Den första kontrollen hittade inget ovanligt på er sida."]),
              io(["A shared old password", "Ett gammalt delat lösenord"], ["The check shows the provider's service account has used the same password for six years, shared by several of their staff. Nobody can say who knows it, or where it is written down now.", "Kontrollen visar att leverantörens tjänstekonto har haft samma lösenord i sex år, delat av flera av deras anställda. Ingen kan säga vem som känner till det, eller var det står nedskrivet nu."], ["The provider's service account had a years-old shared password.", "Leverantörens tjänstekonto hade ett flera år gammalt delat lösenord."], { reopen: true }),
              io(["A Sunday-night sign-in", "En inloggning söndag kväll"], ["One sign-in to the warehouse system on Sunday night cannot be matched to anyone on shift. It may be a forgotten scheduled job; it may not.", "En inloggning i lagersystemet på söndagskvällen går inte att koppla till någon i tjänst. Det kan vara ett bortglömt schemalagt jobb; det kan också vara något annat."], ["A Sunday-night warehouse sign-in is still unexplained.", "En inloggning i lagersystemet på söndagskvällen är fortfarande oförklarad."])
            ]),
            ir("i2", { notChosen: "A" }, ["Nothing on record", "Inget dokumenterat"], [
              io(["The insurer's condition", "Försäkringsbolagets villkor"], ["Your cyber insurer writes that cover for this incident depends on documented checks of your own systems and a record of your decisions. You have neither.", "Ert cyberförsäkringsbolag skriver att skyddet för den här incidenten förutsätter dokumenterade kontroller av era egna system och en logg över era beslut. Ni har inget av det."], ["Your insurer made cover conditional on documented checks.", "Försäkringsbolaget har gjort skyddet beroende av dokumenterade kontroller."], { reopen: true }),
              io(["“No sign of movement”", "”Inga tecken på spridning”"], ["The provider's head of IT emails that their investigators “see no sign of movement to customers”. It is one sentence, with no detail and no report.", "Leverantörens IT-chef mejlar att deras utredare ”inte ser några tecken på spridning till kunder”. Det är en mening, utan detaljer och utan rapport."], ["The provider says, without detail, nothing moved to customers.", "Leverantören säger, utan detaljer, att inget spreds till kunder."]),
              io(["Who decided what?", "Vem beslutade vad?"], ["{{person.ciso.name}} asks who is writing down today's decisions and the reasons for them. Nobody is.", "{{person.ciso.name}} frågar vem som skriver ner dagens beslut och skälen bakom dem. Ingen gör det."], ["Nobody is keeping a record of today's security decisions.", "Ingen för någon logg över dagens säkerhetsbeslut."])
            ])
          ],
          pushback: {
            A: [
              pb(["The same people, twice", "Samma personer, två gånger"], ["The people who must check the warehouse system and the provider's accounts are the same ones needed to find a way to move goods without the provider. {{person.itOps.name}} says they can do one of the two properly today. Which one waits?", "Personerna som ska kontrollera lagersystemet och leverantörens konton är samma som behövs för att hitta ett sätt att få ut varor utan leverantören. {{person.itOps.name}} säger att de kan göra en av de två ordentligt i dag. Vilken får vänta?"]),
              pb(["Their lawyers want your log", "Deras jurister vill ha er logg"], ["The provider heard you are checking “their” accounts and documenting decisions, and their lawyers ask to see your record. They also ask you to keep the incident confidential. Do you share your decision log with a supplier whose lawyers are already involved?", "Leverantören har hört att ni kontrollerar ”deras” konton och dokumenterar beslut, och deras jurister ber att få se er dokumentation. De ber er också hålla incidenten konfidentiell. Delar ni er beslutslogg med en leverantör vars jurister redan är inkopplade?"]),
              pb(["When is the check finished?", "När är kontrollen klar?"], ["The checks find nothing so far, but the provider cannot yet say how the attacker got in, so you do not know what to look for. The connections stay closed until you are sure. What does “sure” look like, and when do you stop checking?", "Kontrollerna har inte hittat något hittills, men leverantören kan ännu inte säga hur angriparen kom in, så ni vet inte vad ni ska leta efter. Förbindelserna förblir stängda tills ni är säkra. Hur ser ”säkra” ut, och när slutar ni kontrollera?"])
            ],
            B: [
              pb(["Connections, not content", "Förbindelser, inte innehåll"], ["{{person.networkLead.name}} points out that the logs show which connections were made, not what was inside them. Anything sent through the booking interface would look like normal booking traffic. Is “only the booking interface” reassuring, or exactly the door you would use?", "{{person.networkLead.name}} påpekar att loggarna visar vilka förbindelser som gjordes, inte vad de innehöll. Allt som skickades via bokningsgränssnittet skulle se ut som vanlig bokningstrafik. Är ”bara bokningsgränssnittet” lugnande, eller precis den dörr man själv skulle använda?"]),
              pb(["Their account is still valid", "Deras konto fungerar fortfarande"], ["The provider's service account in your warehouse system still works, and its password sits in a network now in criminal hands. Trusting the logs meant nobody touched it. Do you leave it enabled because the last six hours looked quiet?", "Leverantörens tjänstekonto i ert lagersystem fungerar fortfarande, och lösenordet finns i ett nätverk som nu är i kriminellas händer. Att lita på loggarna gjorde att ingen rörde det. Låter ni det vara aktivt för att de senaste sex timmarna såg lugna ut?"]),
              pb(["The insurer's question", "Försäkringsbolagets fråga"], ["Your cyber insurer asks what checks you carried out on your own side after learning a connected supplier had ransomware. “We read six hours of logs” is the whole answer. Are you confident that keeps you covered if something surfaces later?", "Ert cyberförsäkringsbolag frågar vilka kontroller ni gjorde på er egen sida efter att ni fått veta att en uppkopplad leverantör hade ransomware. ”Vi läste sex timmars loggar” är hela svaret. Är ni säkra på att det håller ert skydd om något dyker upp senare?"])
            ],
            C: [
              pb(["A warehouse that cannot pick", "Ett lager som inte kan plocka"], ["{{person.itOps.name}} estimates three to four days to rebuild the warehouse system, and during that time nothing can be picked or packed, whoever turns up to collect it. You are adding your own outage on top of the provider's. Is that a cost you can carry?", "{{person.itOps.name}} uppskattar tre till fyra dagar för att bygga om lagersystemet, och under den tiden kan inget plockas eller packas, oavsett vem som kommer för att hämta. Ni lägger ett eget avbrott ovanpå leverantörens. Är det en kostnad ni kan bära?"]),
              pb(["What is the evidence?", "Vilka är beläggen?"], ["The CEO asks a simple question: the logs show nothing but booking traffic, so what evidence says your system is compromised? “It might be” is your only answer. Do you rebuild on fear, or do you have a reason you can state?", "Vd ställer en enkel fråga: loggarna visar inget annat än bokningstrafik, så vilka belägg säger att ert system är komprometterat? ”Det kan vara det” är ert enda svar. Bygger ni om av rädsla, eller har ni ett skäl ni kan formulera?"]),
              pb(["The rebuild wipes the evidence", "Ombyggnaden raderar beläggen"], ["Your insurer wants the warehouse system imaged before anything is wiped, and that alone takes a day. Rebuilding straight away destroys exactly what would show whether anything crossed. Do you delay the rebuild further, or lose the answer for good?", "Ert försäkringsbolag vill att lagersystemet avbildas innan något raderas, och bara det tar en dag. Att bygga om direkt förstör precis det som skulle visa om något passerade. Skjuter ni upp ombyggnaden ytterligare, eller förlorar ni svaret för gott?"])
            ]
          }
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
        reconsider: { decision: "d1", pressure: { en: "The provider will be down for ten days. If you closed the connections, you were safe and blind. If you left them open, you were exposed for six hours with nothing to show for it.", sv: "Leverantören kommer att vara nere i tio dagar. Om ni stängde förbindelserna var ni skyddade men blinda. Om ni lät dem vara öppna var ni exponerade i sex timmar utan att få något för det." } },
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
          evaluation: [["Keeps the business moving without opening new risks carelessly", "Håller verksamheten igång utan att vårdslöst öppna nya risker"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Two carriers, one file", "Två transportörer, en fil"], [
              io(["The first trucks roll", "De första lastbilarna rullar"], ["By evening the first carrier collects a batch of orders from the rebuilt file, and the dock starts to clear. The room feels it has turned a corner.", "Till kvällen hämtar den första transportören en omgång ordrar från den återskapade filen, och kajen börjar tömmas. Rummet känner att det vänt."], ["The first batch left with an alternative carrier.", "Den första omgången har lämnat med en alternativ transportör."]),
              io(["The wrong addresses", "Fel adresser"], ["Dozens of parcels go to the wrong place: the order system held billing addresses, not where customers asked for delivery. Complaints start the same evening.", "Dussintals paket hamnar på fel ställe: ordersystemet hade fakturaadresser, inte dit kunderna bett om leverans. Klagomålen börjar samma kväll."], ["Rebuilt bookings sent some parcels to billing addresses.", "Återskapade bokningar skickade en del paket till fakturaadresser."], { reopen: true, meters: { trust: -1 } }),
              io(["A spoken promise", "Ett muntligt löfte"], ["Your largest customer's buyer says they will hold off on the penalty for now, given how you are handling it. Nothing is in writing.", "Er största kunds inköpare säger att de avvaktar med vitet tills vidare, med tanke på hur ni hanterar det. Inget finns på papper."], ["The largest customer verbally held off the penalty; nothing is written.", "Största kunden avvaktar muntligt med vitet; inget är skriftligt."])
            ]),
            ir("i2", { notChosen: "A" }, ["No booking data", "Ingen bokningsdata"], [
              io(["Capacity taken", "Kapaciteten tagen"], ["One alternative carrier calls back: the spare capacity it offered this week has gone to another customer of the same provider.", "En alternativ transportör ringer tillbaka: den lediga kapaciteten den erbjöd den här veckan har gått till en annan kund hos samma leverantör."], ["One carrier's spare capacity this week went to another company.", "En transportörs lediga kapacitet den här veckan gick till ett annat företag."], { reopen: true }),
              io(["“We understand”", "”Vi förstår”"], ["Your largest customer's buyer sounds understanding on the phone and says they will “see what can be done” about the penalty.", "Er största kunds inköpare låter förstående i telefon och säger att de ska ”se vad som går att göra” med vitet."], ["The largest customer sounded understanding; nothing was agreed.", "Största kunden lät förstående; inget avtalades."]),
              io(["A private spreadsheet", "Ett privat kalkylblad"], ["A warehouse planner says they keep a personal spreadsheet with some of last month's delivery addresses. It might help, or it might be a data-protection problem of its own.", "En lagerplanerare berättar att hen har ett eget kalkylblad med en del av förra månadens leveransadresser. Det kan hjälpa, eller vara ett dataskyddsproblem i sig."], ["A planner holds a private spreadsheet of delivery addresses.", "En planerare har ett privat kalkylblad med leveransadresser."])
            ])
          ],
          pushback: {
            A: [
              pb(["The file has holes", "Filen har hål"], ["The first rebuilt booking file goes to a test: many rows lack delivery windows or door codes, and one carrier rejects them outright. Sending incomplete bookings means failed deliveries and angry customers. Do you send what you have, or keep rebuilding while the dock fills up?", "Den första återskapade bokningsfilen testas: många rader saknar leveransfönster eller portkoder, och en transportör avvisar dem direkt. Att skicka ofullständiga bokningar betyder misslyckade leveranser och arga kunder. Skickar ni det ni har, eller fortsätter ni återskapa medan kajen fylls?"]),
              pb(["Two new doors in a day", "Två nya dörrar på en dag"], ["Both carriers want a live integration into your systems today. {{person.networkLead.name}} has not reviewed either, and you closed the last supplier connection for safety only this morning. Do you open two new ones on trust?", "Båda transportörerna vill ha en direktintegration mot era system i dag. {{person.networkLead.name}} har inte granskat någon av dem, och ni stängde den förra leverantörsförbindelsen av säkerhetsskäl så sent som i morse. Öppnar ni två nya på förtroende?"]),
              pb(["Who waits for their goods?", "Vem får vänta på sina varor?"], ["Prioritising by contract puts your largest customer first, and small long-standing customers at the back of a queue they cannot see. Sales says some of them will not come back. Who tells them, and are you sure contracts are the right order?", "Att prioritera efter avtal sätter er största kund först, och små trogna kunder sist i en kö de inte kan se. Försäljning säger att några av dem inte kommer tillbaka. Vem berättar det för dem, och är ni säkra på att avtalen är rätt ordning?"])
            ],
            B: [
              pb(["Day three arrives", "Dag tre kommer"], ["Your largest customer confirms it will invoke the penalty clause from day three, rising towards {{num.penalty|currency}} by day ten. And ten days is the provider's estimate, not a promise. If it slips, how long do you keep waiting?", "Er största kund bekräftar att den åberopar vitesklausulen från dag tre, med ett belopp som stiger mot {{num.penalty|currency}} till dag tio. Och tio dagar är leverantörens uppskattning, inte ett löfte. Om den drar ut, hur länge fortsätter ni att vänta?"]),
              pb(["The capacity disappears", "Kapaciteten försvinner"], ["The two alternative carriers say the capacity they offered is available today. Other companies hit by the same outage are already calling them. If you change your mind in three days, will there be anything left to book?", "De två alternativa transportörerna säger att kapaciteten de erbjöd finns i dag. Andra företag som drabbats av samma avbrott ringer dem redan. Om ni ändrar er om tre dagar, finns det då något kvar att boka?"]),
              pb(["Cheaper for whom?", "Billigare för vem?"], ["Customer service has a list of orders bought for fixed dates: events, openings, deadlines. For those customers, a delivery on day eleven is worth nothing. Who decides that their loss is part of “switching costs more than it saves”?", "Kundtjänst har en lista med beställningar gjorda till fasta datum: evenemang, öppningar, deadlines. För de kunderna är en leverans dag elva värd ingenting. Vem bestämmer att deras förlust ingår i ”ett byte kostar mer än det sparar”?"])
            ],
            C: [
              pb(["Not enough trucks", "För få lastbilar"], ["The carrier you chose can take about half the volume this week, not all of it, and makes no promise for next week. You have swapped one dependency for another that is already full. What happens to the other half?", "Transportören ni valde kan ta ungefär halva volymen den här veckan, inte allt, och lovar inget för nästa vecka. Ni har bytt ett beroende mot ett annat som redan är fullt. Vad händer med den andra halvan?"]),
              pb(["The CFO wants the sums", "Ekonomidirektören vill se kalkylen"], ["At full price for {{num.orders|number}} orders, the CFO says the carrier bill may exceed the penalties you are trying to avoid. They want the comparison before signing. Can you show this is cheaper than the problem it solves?", "Med fullt pris för {{num.orders|number}} beställningar säger ekonomidirektören att transportörens faktura kan bli större än vitena ni försöker undvika. Hen vill se jämförelsen innan något skrivs under. Kan ni visa att det här är billigare än problemet det löser?"]),
              pb(["Still no booking file", "Fortfarande ingen bokningsfil"], ["The new carrier is ready to collect, and asks for the same thing as everyone else: addresses, weights and delivery windows. Moving everything to them did not solve where that data is. What do you give them on day one?", "Den nya transportören är redo att hämta, och ber om samma sak som alla andra: adresser, vikter och leveransfönster. Att flytta allt till dem löste inte var den datan finns. Vad ger ni dem dag ett?"])
            ]
          }
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
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because volume was split across two carriers, delivery slots are in confusion, and customer complaints have tripled.", sv: "Eftersom volymen delades mellan två transportörer råder förvirring kring leveranstiderna, och kundklagomålen har tredubblats." } }
        ],
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
          ["Let the provider notify, as it holds the delivery data, and support them: two notices for one breach confuse customers.", "Låt leverantören anmäla, eftersom de förvaltar leveransuppgifterna, och stöd dem: två meddelanden om samma intrång förvirrar kunderna."]
        ], {
          knowns: [["Your customers' personal data is on a leak site.", "Era kunders personuppgifter finns på en läcksajt."]],
          uncertainties: [["The full set of records stolen.", "Hela mängden poster som stals."]],
          tradeoffs: {
            operational: ["Customer notification on top of delivery chaos is heavy.", "Att informera kunderna ovanpå leveranskaoset är tungt."],
            security: ["Addresses with delivery notes enable burglary and fraud.", "Adresser med leveransanteckningar möjliggör inbrott och bedrägerier."],
            legal: ["As controller, the duty to notify is yours.", "Som personuppgiftsansvarig ligger anmälningsskyldigheten hos er."],
            reputational: ["Customers will hear about it from the news.", "Kunderna kommer att höra om det från nyheterna."]
          },
          evaluation: [["Owns the controller's duties even when the breach happened elsewhere", "Tar på sig den personuppgiftsansvariges skyldigheter även när intrånget skedde någon annanstans"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["After the notice", "Efter meddelandet"], [
              io(["Thanks, not anger", "Tack, inte ilska"], ["Many customers reply with thanks for the practical advice, and a consumer reporter singles out your notice as clear and honest.", "Många kunder svarar och tackar för de praktiska råden, och en konsumentreporter lyfter fram ert meddelande som tydligt och ärligt."], ["Your customer notice was received as clear and practical.", "Ert meddelande till kunderna togs emot som tydligt och praktiskt."], { meters: { trust: 1 } }),
              io(["Notified, but not in it", "Meddelade, men inte drabbade"], ["People who say they never had a delivery from you are calling, frightened by your notice. Some of those you told were probably never in the stolen data.", "Personer som säger att de aldrig fått en leverans från er ringer, skrämda av ert meddelande. En del av dem ni informerade fanns troligen aldrig i den stulna datan."], ["Some people you notified were likely not in the stolen data.", "En del av dem ni informerade fanns troligen inte i den stulna datan."], { reopen: true, meters: { trust: -1 } }),
              io(["The regulator asks back", "Myndigheten frågar tillbaka"], ["{{reg.dpaShort}} acknowledges the notification and asks for your data processing agreement with the provider and for evidence of how you oversaw them.", "{{reg.dpaShort}} bekräftar anmälan och ber om ert personuppgiftsbiträdesavtal med leverantören och om belägg för hur ni har följt upp dem."], ["{{reg.dpaShort}} has asked how you oversaw the provider.", "{{reg.dpaShort}} har frågat hur ni följde upp leverantören."], { meters: { regulator: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["Waiting on the provider", "I väntan på leverantören"], [
              io(["A customer finds their address", "En kund hittar sin adress"], ["A customer finds their own name and address in the leak-site samples and posts a screenshot with your company as sender. It is being shared widely.", "En kund hittar sitt eget namn och sin adress i utdragen på läcksajten och lägger ut en skärmbild med ert företag som avsändare. Den sprids snabbt."], ["A customer has publicly posted their address from the leak.", "En kund har offentligt lagt ut sin adress från läckan."], { reopen: true, meters: { media: 1, trust: -1 } }),
              io(["“Within days”", "”Inom några dagar”"], ["The provider says its notice is drafted and will go out “within days”. It sounds organised and reassuring.", "Leverantören säger att deras meddelande är skrivet och går ut ”inom några dagar”. Det låter ordnat och lugnande."], ["The provider says its notice will go out within days.", "Leverantören säger att deras meddelande går ut inom några dagar."]),
              io(["The regulator calls first", "Myndigheten ringer först"], ["{{reg.dpaShort}} calls to ask whether you are aware of a leak involving your customers. They read about it in a newsletter.", "{{reg.dpaShort}} ringer och frågar om ni känner till en läcka som rör era kunder. De läste om den i ett nyhetsbrev."], ["{{reg.dpaShort}} contacted you about the leak before you contacted them.", "{{reg.dpaShort}} kontaktade er om läckan innan ni kontaktade dem."], { meters: { regulator: 1 } })
            ])
          ],
          pushback: {
            A: [
              pb(["Who exactly do you tell?", "Vilka berättar ni för?"], ["You cannot yet tell which customers are in the stolen data. Telling all {{num.addresses|number}} risks frightening people who were never affected; telling only the samples misses the rest. Whom do you notify today, and how will you explain the uncertainty?", "Ni kan ännu inte avgöra vilka kunder som finns i den stulna datan. Att meddela alla {{num.addresses|number}} riskerar att skrämma personer som aldrig drabbats; att bara meddela de i utdragen missar resten. Vilka meddelar ni i dag, och hur förklarar ni osäkerheten?"]),
              pb(["“The agreement doesn't say that”", "”Det står inte i avtalet”"], ["The provider's lawyers reply that your agreement does not oblige them to hand over forensic findings during an ongoing investigation. Your demand has no teeth, and the relationship has cooled. Do you escalate, and what can you actually enforce?", "Leverantörens jurister svarar att ert avtal inte förpliktar dem att lämna ut forensiska resultat under en pågående utredning. Ert krav saknar tänder, och relationen har svalnat. Eskalerar ni, och vad kan ni faktiskt driva igenom?"]),
              pb(["The phones explode", "Telefonerna exploderar"], ["Customer service is already swamped by delivery complaints. Within an hour of the notice, call volume triples, and the most common question is “Is my home address on the internet?” Who answers that, and with what?", "Kundtjänst är redan översvämmad av leveransklagomål. Inom en timme efter meddelandet tredubblas samtalen, och den vanligaste frågan är ”Finns min hemadress på internet?” Vem svarar på det, och med vad?"])
            ],
            B: [
              pb(["Their investigation has no end", "Deras utredning har inget slut"], ["The provider cannot say when its investigation will finish. {{person.dpo.name}} reminds you that your own deadline to notify {{reg.dpaShort}} started when you learned of the leak, and it will not wait for theirs. What happens when your deadline passes first?", "Leverantören kan inte säga när utredningen blir klar. {{person.dpo.name}} påminner om att er egen tidsfrist för att anmäla till {{reg.dpaShort}} började löpa när ni fick veta om läckan, och den väntar inte på deras. Vad händer när er tidsfrist går ut först?"]),
              pb(["Your name is on the sample", "Ert namn står i utdragen"], ["A journalist has the leak-site samples, with your company as sender on every record, and asks for comment today. “We are waiting for our supplier” will be the headline. Is that what you want to say?", "En journalist har utdragen från läcksajten, med ert företag som avsändare på varje post, och ber om en kommentar i dag. ”Vi väntar på vår leverantör” blir rubriken. Är det det ni vill säga?"]),
              pb(["“Leave it behind the shed”", "”Ställ det bakom förrådet”"], ["The leaked notes tell anyone where people leave parcels and when they are not home. While you wait, those customers do not know they should take any precautions. Who carries the responsibility if someone is burgled in the meantime?", "De läckta anteckningarna talar om för vem som helst var folk lämnar paket och när de inte är hemma. Medan ni väntar vet de kunderna inte att de borde vidta några försiktighetsåtgärder. Vem bär ansvaret om någon får inbrott under tiden?"])
            ],
            C: [
              pb(["Not theirs to do", "Inte deras sak"], ["{{person.dpo.name}} is firm: the provider processes this data on your behalf, so the duty to notify {{reg.dpaShort}} is yours, not theirs. If they notify late or not at all, it is your deadline that is missed. Are you sure you can hand this over?", "{{person.dpo.name}} är bestämd: leverantören behandlar datan för er räkning, så skyldigheten att anmäla till {{reg.dpaShort}} är er, inte deras. Om de anmäler sent eller inte alls är det er tidsfrist som missas. Är ni säkra på att ni kan lämna över det här?"]),
              pb(["A notice without your name", "Ett meddelande utan ert namn"], ["The provider's draft notice speaks of “customers of a logistics partner” and never mentions you. Your customers will learn from the leak site and the press that it was their orders from you. Is one confusing notice better than two clear ones?", "Leverantörens utkast till meddelande talar om ”kunder till en logistikpartner” och nämner aldrig er. Era kunder kommer att få veta från läcksajten och pressen att det gällde deras beställningar hos er. Är ett förvirrande meddelande bättre än två tydliga?"]),
              pb(["“It's on our list”", "”Det står på vår lista”"], ["The provider's team is rebuilding its entire system and says notification is “on the list”. Nobody there can give you a date. Do you trust a company in the middle of ransomware recovery to meet your legal deadline?", "Leverantörens team bygger om hela sitt system och säger att anmälan ”står på listan”. Ingen där kan ge er ett datum. Litar ni på att ett företag mitt i en återhämtning från ransomware klarar er lagstadgade tidsfrist?"])
            ]
          }
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
        reconsider: { decision: "d4", pressure: { en: "The provider wants to reconnect tomorrow on a one-page statement. Did the way you handled the leaked data give you leverage, or spend it?", sv: "Leverantören vill koppla upp igen i morgon på ett ensidigt uttalande. Gav ert sätt att hantera de läckta uppgifterna er ett övertag, eller förbrukade det?" } },
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
          evaluation: [["Sets evidence-based conditions and narrows the connection", "Ställer villkor byggda på belägg och smalnar av förbindelsen"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Conditions on the table", "Villkor på bordet"], [
              io(["They agree", "De går med på det"], ["The provider agrees, grudgingly, to an independent check and offers to share the cost of the narrow integration. It looks like your conditions worked.", "Leverantören går motvilligt med på en oberoende kontroll och erbjuder sig att dela kostnaden för den smala integrationen. Det ser ut som att era villkor fungerade."], ["The provider agreed to an independent check.", "Leverantören har gått med på en oberoende kontroll."]),
              io(["One page, take it or leave it", "En sida, ta det eller lämna det"], ["The provider says no customer gets more than the one-page statement, and that two of your competitors have already reconnected on it.", "Leverantören säger att ingen kund får mer än uttalandet på en sida, och att två av era konkurrenter redan har kopplat upp sig på det."], ["The provider refuses to share more than its one-page statement.", "Leverantören vägrar dela mer än sitt uttalande på en sida."], { reopen: true }),
              io(["A hedged letter", "Ett förbehållsamt brev"], ["The independent firm can review the restored systems but not the backups they came from, and its letter says so plainly.", "Den oberoende firman kan granska de återställda systemen men inte säkerhetskopiorna de kom från, och det står tydligt i brevet."], ["The independent check does not cover the backups.", "Den oberoende kontrollen omfattar inte säkerhetskopiorna."])
            ]),
            ir("i2", { notChosen: "A" }, ["Without conditions", "Utan villkor"], [
              io(["Another customer", "En annan kund"], ["In the industry chat, another customer of the provider reports suspicious sign-ins on a system connected to them, days after reconnecting. Nobody knows yet if it is related.", "I branschchatten rapporterar en annan kund till leverantören misstänkta inloggningar i ett system som är kopplat till dem, några dagar efter återanslutningen. Ingen vet ännu om det hänger ihop."], ["Another of the provider's customers reported suspicious sign-ins.", "En annan av leverantörens kunder har rapporterat misstänkta inloggningar."], { reopen: true }),
              io(["“Commercially closed”", "”Kommersiellt avslutat”"], ["The commercial director reports that costs and complaints are both falling, and calls the incident closed.", "Den kommersiella chefen rapporterar att både kostnader och klagomål minskar, och kallar incidenten avslutad."], ["The commercial director has declared the incident closed.", "Den kommersiella chefen har förklarat incidenten avslutad."]),
              io(["Whose data now?", "Vems data nu?"], ["The provider asks whether it should keep or delete years of your shipment history and customer addresses. Nobody in the room has an answer.", "Leverantören frågar om den ska behålla eller radera flera års sändningshistorik och kundadresser. Ingen i rummet har något svar."], ["Nobody has decided what happens to your data at the provider.", "Ingen har bestämt vad som händer med er data hos leverantören."])
            ])
          ],
          pushback: {
            A: [
              pb(["Four weeks for a report", "Fyra veckor för en rapport"], ["The provider says its forensic firm will report in about four weeks, and it will only share a summary. Waiting for the root cause means a month more on alternative carriers. Do you accept a summary, or hold out for evidence you may never get?", "Leverantören säger att dess forensiska firma rapporterar om ungefär fyra veckor, och att de bara delar en sammanfattning. Att vänta på grundorsaken betyder en månad till med alternativa transportörer. Accepterar ni en sammanfattning, eller håller ni ut för belägg ni kanske aldrig får?"]),
              pb(["Who builds the narrow link?", "Vem bygger den smala förbindelsen?"], ["A narrow, monitored integration needs development on both sides. The provider says it is not on their plan and will charge for it, and your own team needs weeks. Who pays, and do you keep the old tunnel closed until it exists?", "En smal, övervakad integration kräver utveckling på båda sidor. Leverantören säger att det inte finns i deras plan och att de tar betalt för det, och ert eget team behöver veckor. Vem betalar, och håller ni den gamla tunneln stängd tills den finns?"]),
              pb(["Every week costs", "Varje vecka kostar"], ["The commercial director shows the bill: the alternative carriers cost far more per parcel, and the cheaper provider is ready now. “We are paying a fortune for a feeling of safety.” Is independent confirmation worth that much, and can you put a number on it?", "Den kommersiella chefen visar räkningen: de alternativa transportörerna kostar betydligt mer per paket, och den billigare leverantören är redo nu. ”Vi betalar en förmögenhet för en känsla av säkerhet.” Är en oberoende bekräftelse värd så mycket, och kan ni sätta en siffra på det?"])
            ],
            B: [
              pb(["Signed by the team that missed it", "Undertecknat av teamet som missade det"], ["The one-page statement comes from the same IT team that did not notice the intrusion, and it still does not say how the attacker got in. If that way in is still open, the tunnel leads straight back to you. What makes this page enough?", "Det ensidiga uttalandet kommer från samma IT-team som inte märkte intrånget, och det säger fortfarande inte hur angriparen kom in. Om den vägen in fortfarande är öppen leder tunneln rakt tillbaka till er. Vad gör att den här sidan räcker?"]),
              pb(["Exactly as before", "Precis som förut"], ["{{person.networkLead.name}} notes the tunnel would reopen unchanged: always on, straight into the warehouse system, with the same service account. Nothing about the connection has been learned from. Do you at least change the account and narrow the rules first, even if it costs a day?", "{{person.networkLead.name}} konstaterar att tunneln skulle öppnas oförändrad: alltid uppe, rakt in i lagersystemet, med samma tjänstekonto. Ingenting med förbindelsen har ändrats av det som hänt. Byter ni åtminstone kontot och snävar in reglerna först, även om det kostar en dag?"]),
              pb(["What did you require?", "Vad krävde ni?"], ["Your insurer asks what conditions you set before reconnecting to a supplier that had just been breached. “They told us it was clean” is the honest answer. If something comes through that tunnel next month, will that answer keep you covered?", "Ert försäkringsbolag frågar vilka villkor ni ställde innan ni kopplade in en leverantör som just haft ett intrång. ”De sa att det var rent” är det ärliga svaret. Om något kommer genom tunneln nästa månad, håller det svaret ert försäkringsskydd?"])
            ],
            C: [
              pb(["The contract has a tail", "Avtalet har en svans"], ["Legal finds the provider contract has a notice period and minimum volumes. Leaving now may trigger penalties of its own, on top of what the outage has already cost. Do you still leave immediately, or serve notice and keep using them meanwhile?", "Juristen hittar att avtalet med leverantören har uppsägningstid och minimivolymer. Att lämna nu kan i sig utlösa viten, utöver vad avbrottet redan kostat. Lämnar ni ändå direkt, eller säger ni upp avtalet och fortsätter använda dem under tiden?"]),
              pb(["New carriers, old questions", "Nya transportörer, gamla frågor"], ["Making the alternatives permanent means proper integrations with them, and neither has been asked about security, incident duties or an exit plan. You may be building the same dependency twice. What will you check before you sign?", "Att göra alternativen permanenta innebär riktiga integrationer med dem, och ingen av dem har fått frågor om säkerhet, incidentskyldigheter eller avvecklingsplan. Ni kanske bygger samma beroende två gånger. Vad kontrollerar ni innan ni skriver under?"]),
              pb(["Your data stays behind", "Er data blir kvar"], ["Years of your shipment history and customer addresses remain in the provider's systems. Once you leave, you lose most of your leverage to get their findings or confirm the data is deleted. Who makes sure it is, and how?", "Flera års sändningshistorik och kundadresser finns kvar i leverantörens system. När ni lämnar förlorar ni det mesta av ert inflytande för att få deras resultat eller bekräftelse på att datan raderas. Vem ser till att den gör det, och hur?"])
            ]
          }
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
        reconsider: { decision: "d3", pressure: { en: "Twelve critical suppliers, none with a tested exit. Looking back at the stopped trucks, was your way of keeping goods moving the right bet?", sv: "Tolv kritiska leverantörer, ingen med en testad exitplan. Med de stillastående lastbilarna i backspegeln, var ert sätt att hålla varorna i rörelse rätt satsning?" } },
        branches: [
          { when: { decision: "d5", option: "A" }, narrativeAppend: { en: "Because you insisted on independent confirmation, the provider has hinted it may serve other customers first as it recovers.", sv: "Eftersom ni krävde oberoende bekräftelse har leverantören antytt att den kan prioritera andra kunder när den återhämtar sig." } }
        ],
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
          evaluation: [["Reduces exposure to suppliers and practises living without them", "Minskar exponeringen mot leverantörer och övar på att klara sig utan dem"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["The programme starts", "Programmet startar"], [
              io(["A tunnel nobody used", "En tunnel ingen använde"], ["The first review finds that one of the three always-on supplier tunnels has carried no traffic for a year. It is closed the same day.", "Den första genomgången visar att en av de tre alltid öppna leverantörstunnlarna inte har haft någon trafik på ett år. Den stängs samma dag."], ["An unused always-on supplier tunnel has been closed.", "En oanvänd, alltid öppen leverantörstunnel har stängts."]),
              io(["Eight weeks, not one", "Åtta veckor, inte en"], ["A walk-through of the first exit plan shows the replacement supplier needs about eight weeks to take over, not the one week the plan assumes.", "En genomgång av den första avvecklingsplanen visar att ersättaren behöver omkring åtta veckor för att ta över, inte den vecka som planen förutsätter."], ["The first exit plan assumed one week; the real handover takes eight.", "Den första avvecklingsplanen räknade med en vecka; övertagandet tar åtta."], { reopen: true }),
              io(["One number, please", "En siffra, tack"], ["The board asks for a single figure showing supplier risk has gone down. Nobody agrees on what to measure.", "Styrelsen ber om en enda siffra som visar att leverantörsrisken har minskat. Ingen är överens om vad som ska mätas."], ["The board wants a supplier-risk figure nobody has defined.", "Styrelsen vill ha en siffra för leverantörsrisk som ingen har definierat."])
            ]),
            ir("i2", { notChosen: "A" }, ["The old doors remain", "De gamla dörrarna finns kvar"], [
              io(["“Technical problems” again", "”Tekniska problem” igen"], ["Another critical supplier posts “technical problems” on its status page. Its always-on tunnel into your network is still open.", "En annan kritisk leverantör skriver ”tekniska problem” på sin statussida. Dess alltid öppna tunnel in i ert nätverk står fortfarande öppen."], ["Another critical supplier had an outage with its tunnel still open.", "En annan kritisk leverantör hade ett avbrott med sin tunnel fortfarande öppen."], { reopen: true }),
              io(["“Under control”", "”Under kontroll”"], ["The first results come back reassuring, and the board is told supplier risk is under control.", "De första resultaten ser lugnande ut, och styrelsen får höra att leverantörsrisken är under kontroll."], ["The board has been told supplier risk is under control.", "Styrelsen har fått höra att leverantörsrisken är under kontroll."]),
              io(["The auditor's question", "Revisorns fråga"], ["An auditor asks to see one tested exit plan for any critical supplier. You have documents, but none has ever been tried.", "En revisor ber att få se en testad avvecklingsplan för någon kritisk leverantör. Ni har dokument, men ingen har någonsin provats."], ["An auditor has asked for evidence of a tested exit plan.", "En revisor har bett om belägg för en testad avvecklingsplan."])
            ])
          ],
          pushback: {
            A: [
              pb(["The big two say no", "De två stora säger nej"], ["Two of the critical suppliers are far larger than you and refuse new incident and exit terms. Their answer is “take it or leave it”. Do you accept their standard contract, or start looking for replacements you may not find?", "Två av de kritiska leverantörerna är mycket större än ni och vägrar nya villkor om incidenter och avveckling. Deras svar är ”ta det eller lämna det”. Accepterar ni deras standardavtal, eller börjar ni leta efter ersättare som ni kanske inte hittar?"]),
              pb(["Who runs the exit test?", "Vem kör avvecklingstestet?"], ["Operations points out that a real exit test means running a day without a supplier, with the cost and risk that brings. No department volunteers for the first quarter. Who owns the test, and what happens if it fails?", "Verksamheten påpekar att ett riktigt avvecklingstest innebär att klara en dag utan en leverantör, med den kostnad och risk det för med sig. Ingen avdelning anmäler sig för första kvartalet. Vem äger testet, och vad händer om det misslyckas?"]),
              pb(["Copies are a target too", "Kopior är också ett mål"], ["{{person.dpo.name}} objects that keeping your own copy of supplier-held data means storing more personal data, including home addresses. You would be building the next thing worth stealing. How much do you copy, and how do you protect it?", "{{person.dpo.name}} invänder att en egen kopia av data som leverantörer har betyder att ni lagrar fler personuppgifter, bland annat hemadresser. Ni skulle bygga nästa sak som är värd att stjäla. Hur mycket kopierar ni, och hur skyddar ni det?"])
            ],
            B: [
              pb(["They would have passed", "De hade klarat det"], ["{{person.supplierManager.name}} finds last year's questionnaire from the logistics provider: every answer was “yes”, including remote access with strong authentication. A form like yours would have passed them. What would it actually have caught?", "{{person.supplierManager.name}} hittar förra årets formulär från logistikleverantören: alla svar var ”ja”, även fjärråtkomst med stark autentisering. Ett formulär som ert hade godkänt dem. Vad hade det faktiskt fångat?"]),
              pb(["The tunnels stay open", "Tunnlarna förblir öppna"], ["The three always-on tunnels into your systems are untouched by a procurement questionnaire, which only applies to new contracts. The next supplier incident would find the same doors. When do you deal with the connections you already have?", "De tre alltid öppna tunnlarna in i era system påverkas inte av ett formulär i upphandlingen, som bara gäller nya avtal. Nästa leverantörsincident skulle hitta samma dörrar. När tar ni hand om de förbindelser ni redan har?"]),
              pb(["A bad answer, then what?", "Ett dåligt svar, och sedan?"], ["Procurement receives twelve completed forms, and nobody in security has time to read them. One critical supplier answers “no” to half the questions, and you cannot leave them. What do you do with a bad answer you cannot act on?", "Inköp får in tolv ifyllda formulär, och ingen inom säkerhet har tid att läsa dem. En kritisk leverantör svarar ”nej” på halva frågorna, och ni kan inte lämna dem. Vad gör ni med ett dåligt svar som ni inte kan agera på?"])
            ],
            C: [
              pb(["Double the bill", "Dubbla räkningen"], ["The CFO calculates that a second supplier for each critical service roughly doubles contract costs and removes the volume discounts you have now. It also needs people to manage twice as many relationships. Can you justify that to the board for twelve suppliers?", "Ekonomidirektören räknar ut att en andra leverantör för varje kritisk tjänst ungefär fördubblar avtalskostnaderna och tar bort de volymrabatter ni har i dag. Det kräver också folk för att hantera dubbelt så många relationer. Kan ni motivera det inför styrelsen för tolv leverantörer?"]),
              pb(["Twice the connections", "Dubbelt så många förbindelser"], ["{{person.networkLead.name}} notes that dual-sourcing the three suppliers with network access means six connections into your systems instead of three. You would double the doors this incident just taught you to fear. How does that make you safer?", "{{person.networkLead.name}} konstaterar att dubbla leverantörer för de tre som har nätverksåtkomst innebär sex förbindelser in i era system i stället för tre. Ni skulle fördubbla de dörrar som den här incidenten just lärde er att frukta. Hur gör det er säkrare?"]),
              pb(["Some cannot be doubled", "Vissa går inte att dubblera"], ["Several of the twelve have no real alternative: a specialised system, a sole regional provider. Dual-sourcing does nothing for the dependencies that hurt most. What is your plan for the suppliers you cannot replace?", "Flera av de tolv har inget verkligt alternativ: ett specialiserat system, en ensam regional leverantör. Dubbla leverantörer gör inget åt de beroenden som gör mest ont. Vad är er plan för leverantörerna ni inte kan ersätta?"])
            ]
          }
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
