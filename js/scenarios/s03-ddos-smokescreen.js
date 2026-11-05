/*
 * s03-ddos-smokescreen.js — "Black Friday Under Fire" (archetype A).
 *
 * Volumetric DDoS at peak sales → mitigation only partly works as the attack
 * moves to the application layer → extortion demand → the DDoS was cover for
 * credential stuffing; customer accounts are taken over → stored cards and
 * points are spent → the payment provider threatens suspension → customers are
 * victims of someone else's breach as well.
 *
 * Ground truth: a credential list from an unrelated breach was bought two weeks
 * earlier; the flood was meant to occupy the team and hide a low-and-slow login
 * campaign from residential proxies.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s03-ddos-smokescreen",
    version: 1,
    category: "ddos",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "ddos",
    title: L(["Black Friday Under Fire", "Black Friday under beskjutning"]),
    summary: L([
      "The busiest evening of the year and the site collapses under a flood of traffic. Everyone watches the bandwidth graphs — which is exactly what the attacker wanted.",
      "Årets viktigaste kväll, och webbplatsen faller ihop under en flod av trafik. Alla stirrar på bandbreddsgraferna – vilket är precis vad angriparen ville."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Coordinate DDoS mitigation with providers under commercial pressure", "Samordna åtgärder mot överbelastningsattacker med leverantörer under kommersiellt tryck"]), teaser: L(["Working with partners under pressure", "Att samarbeta med partner under press"]) },
      { id: "lo2", text: L(["Keep watching for secondary attacks during a loud incident", "Fortsätta bevaka sekundära angrepp under en högljudd incident"]), teaser: L(["Where you are looking, and where you are not", "Var ni tittar – och var ni inte tittar"]) },
      { id: "lo3", text: L(["Decide on extortion without rewarding the attacker", "Besluta om utpressning utan att belöna angriparen"]), teaser: L(["Saying yes or no to demands", "Att säga ja eller nej till krav"]) },
      { id: "lo4", text: L(["Protect customers whose accounts were taken over", "Skydda kunder vars konton har tagits över"]), teaser: L(["Caring for the people affected", "Att ta hand om dem som drabbas"]) }
    ],
    mitre: ["T1498", "T1499", "T1110", "T1078", "T1589", "T1657"],
    frameworks: {
      nistCsf: ["ID.RA", "PR.AA", "PR.IR", "DE.CM", "DE.AE", "RS.MA", "RS.MI", "RS.CO", "GV.SC"],
      iso27001: ["A.5.19", "A.5.24", "A.5.26", "A.5.30", "A.5.34", "A.8.5", "A.8.6", "A.8.16", "A.8.20"]
    },
    minStages: 4,
    maxStages: 7,
    constraints: { startWindow: "friday-evening", sectors: ["retail", "transport", "technology"] },
    actor: { types: ["criminal"], motivation: L(["Extortion and resale of hijacked accounts", "Utpressning och vidareförsäljning av kapade konton"]), capability: "medium" },
    variables: {
      gbps: { min: 20, max: 400, scaleBy: "size" },
      revenuePerHour: { min: 150000, max: 6000000, step: 10000, scaleBy: "size", currency: true },
      attempts: { min: 200000, max: 9000000, step: 1000, scaleBy: "size" },
      takeovers: { min: 300, max: 18000, step: 10, scaleBy: "size" },
      fraudOrders: { min: 40, max: 900, scaleBy: "size" },
      demand: { min: 250000, max: 4000000, step: 50000, scaleBy: "size", currency: true },
      fraudRate: { min: 2, max: 6 }
    },
    roles: ["incidentCommander", "ciso", "socLead", "networkLead", "itOps", "serviceOwner", "comms", "ceo", "legal", "dpo", "supplierManager"],

    groundTruth: {
      rootCause: L([
        "A credential list from an unrelated breach was bought two weeks earlier. The DDoS — first volumetric, then at the application layer — kept the team busy while a slow login campaign from residential proxies tested {{num.attempts}} credential pairs and took over {{num.takeovers}} customer accounts, which were then used to spend stored cards and loyalty points.",
        "En lista med inloggningsuppgifter från ett orelaterat dataintrång köptes två veckor tidigare. Överbelastningsattacken – först volymbaserad, sedan på applikationsnivå – höll teamet sysselsatt medan en långsam inloggningskampanj via privata proxyadresser prövade {{num.attempts}} kombinationer av användarnamn och lösenord och tog över {{num.takeovers}} kundkonton, som sedan användes för att handla med sparade kort och bonuspoäng."
      ]),
      attackerTimeline: [
        { at: -20160, text: L(["Credential list from another company's breach bought on a criminal market.", "En lista med inloggningsuppgifter från ett annat företags dataintrång köps på en kriminell marknad."]) },
        { at: -1440, text: L(["Rate limits on the login API probed from a handful of addresses.", "Spärrarna för antal anrop mot inloggningstjänsten testas från ett fåtal adresser."]) },
        { at: 0, text: L(["Volumetric flood against the public site begins.", "Volymattacken mot den publika webbplatsen startar."]) },
        { at: 55, text: L(["Attack shifts to application-layer requests imitating shoppers.", "Angreppet går över till anrop på applikationsnivå som efterliknar kunder."]) },
        { at: 120, text: L(["Low-and-slow credential stuffing starts from residential proxies.", "Långsam inloggningsattack med stulna uppgifter startar via privata proxyadresser."]) },
        { at: 140, text: L(["Extortion email sent.", "Utpressningsmejl skickas."]) },
        { at: 600, text: L(["Taken-over accounts used to order with stored cards and points.", "Övertagna konton används för att beställa med sparade kort och poäng."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-stuffing", revealStage: "p4", text: L(["While the flood ran, {{num.attempts}} login attempts tested leaked credentials and {{num.takeovers}} succeeded.", "Medan attacken pågick prövades {{num.attempts}} inloggningsförsök med läckta uppgifter, och {{num.takeovers}} lyckades."]) },
      { id: "hf-orders", revealStage: "p5", text: L(["Taken-over accounts placed {{num.fraudOrders}} orders with stored cards and loyalty points.", "Övertagna konton lade {{num.fraudOrders}} beställningar med sparade kort och bonuspoäng."]) },
      { id: "hf-same", revealStage: "p6", text: L(["The extortion and the account takeovers come from the same group, which is already selling access to the hijacked accounts.", "Utpressningen och kontokapningarna kommer från samma grupp, som redan säljer åtkomst till de kapade kontona."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["The shop goes dark", "Butiken släcks ner"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. The biggest sales evening of the year has just started; the campaign has been advertised for weeks and the warehouse is fully staffed.\n\n{{org.service.primary|cap}} is timing out for most visitors, and monitoring shows traffic many times the normal peak. Shoppers are already complaining on social media, and every minute offline is money that will not come back.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. Årets största försäljningskväll har just börjat; kampanjen har annonserats i veckor och lagret är fullt bemannat.\n\n{{org.service.primary|cap}} svarar inte för de flesta besökare, och övervakningen visar trafik som är många gånger högre än en normal topp. Kunderna klagar redan i sociala medier, och varje minut offline är pengar som inte kommer tillbaka."
        ]),
        injects: [
          inj("i1-1", 0, "networkEvidence", "itOps", "critical", "confirmed", [
            "Inbound traffic {{num.gbps}} Gbit/s from tens of thousands of sources, mostly UDP reflection. The internet links are saturated; the firewall is dropping legitimate sessions.",
            "Inkommande trafik {{num.gbps}} Gbit/s från tiotusentals källor, mest UDP-reflektion. Internetförbindelserna är fulla; brandväggen kastar legitima sessioner."
          ], { headline: ["Links saturated", "Förbindelserna är fulla"], tests: ["lo1"] }),
          inj("i1-2", 10, "impactReport", "person.serviceOwner", "high", "confirmed", [
            "Every hour offline tonight costs about {{num.revenuePerHour|currency}} in lost sales — and the campaign was planned around this evening.",
            "Varje timme som butiken ligger nere i kväll kostar ungefär {{num.revenuePerHour|currency}} i förlorad försäljning – och kampanjen är planerad kring just den här kvällen."
          ], { tests: ["lo1"] }),
          inj("i1-3", 25, "phoneTranscript", "supplier", "medium", "confirmed", [
            "{{supplier.isp}}: “We can turn on upstream scrubbing within 30 minutes, but your contract only covers 10 Gbit/s. Above that it's billed per hour, and we need written approval.”",
            "{{supplier.isp}}: ”Vi kan aktivera rensning uppströms inom 30 minuter, men ert avtal täcker bara 10 Gbit/s. Därutöver debiteras per timme, och vi behöver ett skriftligt godkännande.”"
          ], { tests: ["lo1"] }),
          inj("i1-4", 35, "socialPost", "socialMedia", "medium", "confirmed", [
            "“Waited all year for this sale and {{org.shortName}} is down AGAIN. Going elsewhere.” — shared hundreds of times.",
            "”Väntat hela året på den här rean och {{org.shortName}} ligger nere IGEN. Handlar någon annanstans.” – delat hundratals gånger."
          ], { optional: true, pressure: "media", tests: ["lo1"] })
        ],
        charts: [{
          id: "c1-gbps", type: "line", markers: "injects",
          title: L(["Inbound traffic", "Inkommande trafik"]), unit: L(["Gbit/s", "Gbit/s"]),
          caption: L(["Minutes relative to the start of the attack.", "Minuter i förhållande till attackens start."]),
          data: line(["Inbound traffic", "Inkommande trafik"], -60, 40, 5, (x, ctx) => (x < 0 ? 2 + ctx.rng.int(0, 2) : ctx.vars.gbps * (0.85 + ctx.rng.float(0, 0.15))))
        }],
        questions: {
          technical: [
            q("What can be done at your edge, and what only upstream?", "Vad kan göras i er egen nätkant, och vad bara uppströms?", ["networkLead", "itOps"]),
            q("Which services must stay reachable even if the shop does not?", "Vilka tjänster måste vara nåbara även om butiken inte är det?", ["networkLead", "serviceOwner"]),
            q("Who is watching everything else while everyone watches the traffic?", "Vem bevakar allt annat medan alla tittar på trafiken?", ["socLead", "ciso"])
          ],
          executive: [
            q("Who can approve unbudgeted mitigation costs tonight?", "Vem kan godkänna obudgeterade kostnader för skydd i kväll?", ["ceo", "incidentCommander"]),
            q("What do you tell customers while the shop is down?", "Vad säger ni till kunderna medan butiken ligger nere?", ["comms", "ceo"]),
            q("Do you extend the sale if it is lost tonight?", "Förlänger ni rean om kvällen går förlorad?", ["serviceOwner", "ceo"])
          ]
        },
        challenges: [ch("The ISP needs a signed approval for costs nobody has budgeted.", "Operatören behöver ett undertecknat godkännande för kostnader som ingen har budgeterat.")],
        decision: dec("d1", "incidentCommander", ["How do you respond to the flood?", "Hur möter ni attacken?"], [
          ["Approve upstream scrubbing above the contract now, whatever it costs tonight.", "Godkänn rensning uppströms utöver avtalet nu, vad det än kostar i kväll."],
          ["Geo-block all traffic from outside your main market.", "Geoblockera all trafik utanför er huvudmarknad."],
          ["Put up a static queue page and wait for the attack to stop.", "Lägg upp en statisk kösida och vänta tills attacken upphör."]
        ], {
          knowns: [["Links are saturated at {{num.gbps}} Gbit/s.", "Förbindelserna är fulla vid {{num.gbps}} Gbit/s."], ["Each hour costs about {{num.revenuePerHour|currency}}.", "Varje timme kostar ungefär {{num.revenuePerHour|currency}}."]],
          uncertainties: [["How long the attack will last.", "Hur länge attacken pågår."], ["Whether it is a distraction.", "Om det är en avledning."]],
          tradeoffs: {
            operational: ["Scrubbing restores most traffic but adds latency.", "Rensning återställer det mesta av trafiken men ger fördröjning."],
            security: ["Geo-blocking cuts some attack traffic and some customers.", "Geoblockering stoppar en del av attacktrafiken och en del kunder."],
            legal: ["Spending above contract needs an authorised signature.", "Kostnader utöver avtalet kräver en behörig underskrift."],
            reputational: ["A dead shop on the biggest evening is remembered.", "En död butik på årets största kväll blir ihågkommen."]
          },
          evaluation: [["Has a named person who can approve emergency spend", "Har en utsedd person som kan godkänna akuta kostnader"], ["Keeps someone on security monitoring beyond the DDoS", "Låter någon bevaka säkerheten bortom överbelastningen"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Scrubbing switched on", "Rensningen slås på"], [
              io(["The graphs fall", "Graferna faller"], ["Within half an hour of the approval, traffic is routed through the ISP's scrubbing and the links start to clear. Someone in the room says the worst is over.", "Inom en halvtimme efter godkännandet leds trafiken genom operatörens rensning och förbindelserna börjar bli fria. Någon i rummet säger att det värsta är över."], ["Scrubbing is running and the links are clearing.", "Rensningen är igång och förbindelserna blir fria."]),
              io(["Signature rejected", "Underskriften godtas inte"], ["{{supplier.isp}} rejects the approval: only a named signatory on the contract may approve overage, and the person who signed is not on the list. Scrubbing will not start until someone who is signs.", "{{supplier.isp}} godtar inte godkännandet: bara en namngiven firmatecknare i avtalet får godkänna kostnader utöver avtalet, och den som skrev under finns inte på listan. Rensningen startar inte förrän någon som gör det skriver under."], ["The ISP rejected the first approval, which delayed scrubbing.", "Operatören underkände det första godkännandet, vilket försenade rensningen."], { reopen: true }),
              io(["A sudden lull", "Ett plötsligt lugn"], ["The flood drops sharply minutes before scrubbing is even active. The network lead cannot say whether the attacker gave up, is testing your response, or is about to try something else.", "Attacken minskar kraftigt några minuter innan rensningen ens är aktiv. Nätverksansvarig kan inte säga om angriparen gav upp, testar hur ni reagerar eller är på väg att pröva något annat."], ["The flood dropped before scrubbing started; nobody knows why.", "Attacken minskade innan rensningen startade; ingen vet varför."])
            ]),
            ir("i2", { notChosen: "A" }, ["No upstream help", "Ingen hjälp uppströms"], [
              io(["Still unreachable", "Fortfarande onåbar"], ["The links stay full. Most visitors get a timeout rather than your page, and complaints about {{org.shortName}} are shared faster than the communications team can answer them.", "Förbindelserna förblir fulla. De flesta besökare får en tidsgräns i stället för er sida, och klagomålen på {{org.shortName}} delas snabbare än kommunikatörerna hinner svara."], ["For the first hour the shop stayed unreachable for most visitors.", "Under den första timmen var butiken onåbar för de flesta besökare."], { meters: { media: 1 } }),
              io(["The CEO intervenes", "Vd griper in"], ["{{person.ceo.name}} has seen the dark shop from home and learned that scrubbing was on offer. “Why are we not paying for protection tonight?” The CEO wants a new decision before another hour is lost.", "{{person.ceo.name}} har sett den släckta butiken hemifrån och fått veta att rensning fanns att få. ”Varför betalar vi inte för skydd i kväll?” Vd vill ha ett nytt beslut innan ännu en timme går förlorad."], ["The CEO has questioned the decision not to buy scrubbing.", "Vd har ifrågasatt beslutet att inte köpa rensning."], { reopen: true }),
              io(["The flood dips", "Attacken mattas av"], ["Traffic drops by a third for twenty minutes, then climbs again. Some in the room say the attacker is losing interest; the network lead says it looks more like someone adjusting.", "Trafiken minskar med en tredjedel i tjugo minuter och ökar sedan igen. Några i rummet menar att angriparen tappar intresset; nätverksansvarig säger att det snarare ser ut som att någon justerar."], ["The flood dipped for twenty minutes, then returned.", "Attacken mattades av i tjugo minuter och kom sedan tillbaka."])
            ])
          ],
          pushback: {
            A: [
              pb(["Nobody can sign", "Ingen kan skriva under"], ["The ISP wants a signed approval before it starts scrubbing, and your own spending limit is far below what tonight could cost. The one person who can approve more is not answering. Do you sign beyond your mandate, or let the shop stay dark while you keep calling?", "Operatören vill ha ett undertecknat godkännande innan rensningen startar, och er egen beslutsgräns ligger långt under vad natten kan kosta. Den enda som kan godkänna mer svarar inte. Skriver ni under utöver ert mandat, eller låter ni butiken vara släckt medan ni fortsätter ringa?"]),
              pb(["A bill with no ceiling", "En faktura utan tak"], ["The approval you gave has no cap and no end time. Overage is billed per hour, and nobody knows whether the attack lasts one evening or the whole weekend. Do you set a ceiling now, and what do you do when you reach it?", "Godkännandet ni gav har varken tak eller sluttid. Överskridandet debiteras per timme, och ingen vet om attacken pågår en kväll eller hela helgen. Sätter ni ett tak nu, och vad gör ni när ni når det?"]),
              pb(["Payments in the filter", "Betalningar i filtret"], ["The ISP warns that once traffic runs through scrubbing, confirmations from the payment provider to your checkout pass through the same filter, and some may be dropped as suspicious. Do you exempt them and leave a gap in the protection, or accept failed payments on the biggest evening of the year?", "Operatören varnar för att när trafiken går genom rensningen passerar även betalleverantörens bekräftelser till kassan samma filter, och en del kan kastas som misstänkta. Undantar ni dem och lämnar en lucka i skyddet, eller accepterar ni misslyckade betalningar på årets största kväll?"])
            ],
            B: [
              pb(["The links are still full", "Förbindelserna är fortfarande fulla"], ["The network lead reports that the block works at your own edge, but the internet links are filled before the traffic ever reaches it. The graphs have barely moved. Do you go upstream after all, admitting the block bought you almost nothing?", "Nätverksansvarig rapporterar att blockeringen verkar i er egen nätkant, men internetförbindelserna fylls innan trafiken ens når dit. Graferna har knappt rört sig. Går ni ändå uppströms, och medger att blockeringen gav nästan ingenting?"]),
              pb(["Checkout calls abroad", "Kassan ringer utomlands"], ["Since the block went on, every card payment fails. The service that confirms payments answers from servers outside your main market. Do you open a hole in the block for it, and how do you know which other services you have cut off without noticing?", "Sedan blockeringen slogs på misslyckas varje kortbetalning. Tjänsten som bekräftar betalningarna svarar från servrar utanför er huvudmarknad. Öppnar ni ett hål i blockeringen för den, och hur vet ni vilka andra tjänster ni har stängt ute utan att märka det?"]),
              pb(["The campaign was abroad too", "Kampanjen gick utomlands också"], ["Marketing reminds you that a large share of tonight's campaign ads were bought for neighbouring countries. Those customers, who clicked on your ads, now get an error page. Do you tell marketing to stop the ads, or lift the block for those countries and let more of the flood back in?", "Marknadsavdelningen påminner om att en stor del av kvällens kampanjannonser köptes för grannländerna. De kunderna, som klickade på era annonser, får nu en felsida. Ber ni marknad att stoppa annonserna, eller lyfter ni blockeringen för de länderna och släpper in mer av attacken igen?"])
            ],
            C: [
              pb(["The queue page is down too", "Kösidan ligger också nere"], ["The static queue page sits behind the same saturated links. Most visitors never see it; they just get a timeout. Do you move it to outside hosting tonight, which means approving a cost after all, or accept that customers see nothing?", "Den statiska kösidan ligger bakom samma fulla förbindelser. De flesta besökare ser den aldrig; de får bara en tidsgräns. Flyttar ni den till extern drift i kväll, vilket betyder att ni ändå godkänner en kostnad, eller accepterar ni att kunderna inte ser något alls?"]),
              pb(["No sign of stopping", "Inga tecken på att det slutar"], ["The traffic has not dropped at all since you chose to wait, and each hour costs about {{num.revenuePerHour|currency}}. Nobody has said how long waiting is allowed to last. At what point does waiting end, and who decides it?", "Trafiken har inte minskat alls sedan ni valde att vänta, och varje timme kostar ungefär {{num.revenuePerHour|currency}}. Ingen har sagt hur länge väntan får pågå. När upphör väntan, och vem bestämmer det?"]),
              pb(["Why was the offer refused?", "Varför sa ni nej till erbjudandet?"], ["The CEO sees the queue page on their own phone and learns that the ISP offered scrubbing within thirty minutes. “We saved money on the biggest evening of the year?” Do you defend waiting to the CEO, or reverse the decision now?", "Vd ser kösidan i sin egen telefon och får veta att operatören erbjöd rensning inom trettio minuter. ”Sparade vi pengar på årets största kväll?” Försvarar ni väntan inför vd, eller ändrar ni beslutet nu?"])
            ]
          }
        }),
        facilitator: fac(
          ["Make the room feel the money. The trap is that everyone looks at the same graph.", "Låt gruppen känna av pengarna. Fällan är att alla tittar på samma graf."],
          ["Scrubbing approved quickly, customers informed, and one person explicitly assigned to watch everything else.", "Rensning godkänd snabbt, kunderna informerade och en person uttryckligen utsedd att bevaka allt annat."],
          [["Ask: what is your SOC looking at right now?", "Fråga: vad tittar er SOC på just nu?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["It looks like shoppers", "Det ser ut som kunder"]),
        twist: L(["Scrubbing worked — so the attack changed shape and now looks like real shoppers.", "Rensningen fungerade – så angreppet bytte form och ser nu ut som riktiga kunder."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because scrubbing was approved above the contract, tonight's bill already exceeds the whole weekend's expected profit.", sv: "Eftersom rensning godkändes utöver avtalet överstiger nattens faktura redan hela helgens förväntade vinst." } }
        ],
        assumptionChallenged: L(["Upstream scrubbing will end the attack.", "Rensning uppströms gör slut på attacken."]),
        narrative: L([
          "{{time.T+60|clock}}. The internet links are clear again and the traffic graphs look almost normal. People in the room start to relax.\n\nBut the site is still crawling. The web servers are overloaded by requests that look exactly like customers browsing, searching and logging in. Telling a bot from a real shopper is suddenly the hardest problem of the evening.",
          "Klockan {{time.T+60|clock}}. Internetförbindelserna är fria igen och trafikgraferna ser nästan normala ut. Folk i rummet börjar slappna av.\n\nMen webbplatsen är fortfarande seg. Webbservrarna är överbelastade av anrop som ser exakt ut som kunder som bläddrar, söker och loggar in. Att skilja en bot från en riktig kund är plötsligt kvällens svåraste problem."
        ]),
        injects: [
          inj("i2-1", 60, "logExcerpt", "itOps", "high", "confirmed", [
            "Request rate on search and login is twelve times normal, from many residential addresses, with real browser fingerprints. Each address sends only a few requests per minute.",
            "Anropstakten mot sök och inloggning är tolv gånger den normala, från många privata adresser och med riktiga webbläsarsignaturer. Varje adress skickar bara några få anrop per minut."
          ], { headline: ["Application-layer load", "Belastning på applikationsnivå"], tests: ["lo1", "lo2"] }),
          inj("i2-2", 80, "phoneTranscript", "vendor", "medium", "confirmed", [
            "The CDN vendor: “We can put a challenge page in front of the whole site. It will stop most bots — and some real customers on older phones.”",
            "CDN-leverantören: ”Vi kan lägga en kontrollsida framför hela webbplatsen. Den stoppar de flesta botar – och en del riktiga kunder med äldre telefoner.”"
          ], { tests: ["lo1"] }),
          inj("i2-3", 90, "chat", "person.serviceOwner", "medium", "misleading", [
            "“Login traffic is high because everyone is trying to check out at once. That's just Black Friday.”",
            "”Inloggningstrafiken är hög för att alla försöker betala samtidigt. Det är bara Black Friday.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Plausible and wrong: the login traffic hides the credential stuffing revealed in stage 4.", "Rimligt och fel: inloggningstrafiken döljer den kontokapning som avslöjas i skede 4."], tests: ["lo2"] })
        ],
        charts: [{
          id: "c2-rps", type: "line", markers: "injects",
          title: L(["Login requests per second", "Inloggningsanrop per sekund"]), unit: L(["requests/s", "anrop/s"]),
          data: line(["Login requests", "Inloggningsanrop"], -30, 90, 5, (x, ctx) => (x < 50 ? 40 + ctx.rng.int(0, 15) : 40 + (x - 50) * 18 + ctx.rng.int(0, 40)))
        }],
        questions: {
          technical: [
            q("How do you tell bots from real customers when both look the same?", "Hur skiljer ni botar från riktiga kunder när de ser likadana ut?", ["networkLead", "socLead"]),
            q("Why would an attacker focus on the login page specifically?", "Varför skulle en angripare rikta in sig just på inloggningssidan?", ["socLead", "ciso"]),
            q("Did your first decision buy you what you expected?", "Gav ert första beslut det ni förväntade er?", ["networkLead"], "d1")
          ],
          executive: [
            q("Is losing some real customers to a challenge page acceptable tonight?", "Är det acceptabelt att förlora en del riktiga kunder på en kontrollsida i kväll?", ["serviceOwner", "ceo"]),
            q("How long can you keep paying for mitigation?", "Hur länge kan ni fortsätta betala för skyddet?", ["ceo", "incidentCommander"]),
            q("Knowing the attack adapts, would you still choose the same response?", "Med vetskap om att angreppet anpassar sig – skulle ni välja samma åtgärd igen?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("A challenge page will block some genuine customers on the biggest evening of the year.", "En kontrollsida kommer att stoppa en del riktiga kunder på årets största kväll.")],
        decision: dec("d2", "incidentCommander", ["How do you handle the application-layer load?", "Hur hanterar ni belastningen på applikationsnivå?"], [
          ["Put a challenge page in front of the whole site.", "Lägg en kontrollsida framför hela webbplatsen."],
          ["Protect only login and checkout with strict rate limits and challenges.", "Skydda bara inloggning och kassa med hårda spärrar och kontroller."],
          ["Add server capacity and absorb the load.", "Lägg till serverkapacitet och ta emot belastningen."]
        ], {
          knowns: [["Requests imitate real browsers from residential addresses.", "Anropen efterliknar riktiga webbläsare från privata adresser."]],
          uncertainties: [["What the attacker wants from the login page.", "Vad angriparen vill med inloggningssidan."]],
          tradeoffs: {
            operational: ["Site-wide challenges cost conversions.", "Kontroller på hela webbplatsen kostar försäljning."],
            security: ["Absorbing the load lets every login attempt through.", "Att ta emot belastningen släpper igenom varje inloggningsförsök."],
            legal: ["No direct legal impact yet.", "Ingen direkt juridisk påverkan ännu."],
            reputational: ["Friction annoys customers less than an outage.", "Friktion irriterar kunderna mindre än ett avbrott."]
          },
          evaluation: [["Questions why login is targeted", "Ifrågasätter varför inloggningen är målet"], ["Prefers targeted controls over raw capacity", "Föredrar riktade åtgärder framför ren kapacitet"]],
          interrupts: [
            ir("i1", { chosen: "B" }, ["Login and checkout guarded", "Inloggning och kassa skyddas"], [
              io(["Checkout recovers", "Kassan återhämtar sig"], ["Within half an hour, checkout errors fall and orders start coming through again. The service owner says it proves the login load was just shoppers in a hurry.", "Inom en halvtimme minskar felen i kassan och beställningarna börjar komma igenom igen. Tjänsteägaren säger att det bevisar att inloggningslasten bara var stressade kunder."], ["Checkout recovered after login and checkout were protected.", "Kassan återhämtade sig efter att inloggning och kassa skyddades."]),
              io(["Regulars locked out", "Stamkunderna stängs ute"], ["The strict limits trip on customers who retry a failed payment. Loyal customers are locked out of checkout in the middle of the sale, and the service owner wants the limits off.", "De hårda spärrarna slår till mot kunder som försöker betala igen efter ett fel. Trogna kunder stängs ute från kassan mitt i rean, och tjänsteägaren vill att spärrarna tas bort."], ["Strict limits locked genuine customers out of checkout during the sale.", "Hårda spärrar stängde ute riktiga kunder från kassan under rean."], { reopen: true, meters: { trust: -1 } }),
              io(["A steady trickle", "En jämn ström"], ["The new controls show a steady trickle of failed logins, a few per address, never enough to trip a limit. It could be shoppers who forgot their passwords. Nobody has time to look closer.", "De nya kontrollerna visar en jämn ström av misslyckade inloggningar, några per adress, aldrig tillräckligt för att utlösa en spärr. Det kan vara kunder som har glömt sina lösenord. Ingen hinner titta närmare."], ["A trickle of failed logins stays under the limits, not yet examined.", "En ström av misslyckade inloggningar ligger under spärrarna, ännu inte granskad."])
            ]),
            ir("i2", { notChosen: "B" }, ["Login left open", "Inloggningen lämnas öppen"], [
              io(["Pages load again", "Sidorna laddar igen"], ["The site answers almost normally for the first time tonight and orders pick up. People in the room start talking about how to make up for the lost hours.", "Webbplatsen svarar nästan normalt för första gången i kväll och beställningarna tar fart. Folk i rummet börjar prata om hur de förlorade timmarna ska tas igen."], ["The site is responding again and orders are picking up.", "Webbplatsen svarar igen och beställningarna tar fart."]),
              io(["Sales still halved", "Försäljningen är fortfarande halverad"], ["An hour later, sales are still at half a normal sales evening. The service owner says the measure costs almost as much as the attack, and asks the room to try something else.", "En timme senare ligger försäljningen fortfarande på hälften av en normal reakväll. Tjänsteägaren säger att åtgärden kostar nästan lika mycket som attacken och ber rummet pröva något annat."], ["Sales stayed at half the normal level after the measure.", "Försäljningen låg kvar på halva den normala nivån efter åtgärden."], { reopen: true }),
              io(["Nobody on the logs", "Ingen på loggarna"], ["The SOC lead asks for one person to watch the login logs. With everyone busy with load and costs, nobody can be spared before midnight, and the request is noted for later.", "SOC-ansvarig ber om en person som bevakar inloggningsloggarna. Med alla upptagna av lasten och kostnaderna kan ingen avvaras före midnatt, och begäran noteras till senare."], ["When the SOC asked, nobody could be spared to watch login logs.", "När SOC frågade kunde ingen avvaras för att bevaka inloggningsloggarna."])
            ])
          ],
          pushback: {
            A: [
              pb(["Older phones fail", "Äldre telefoner fastnar"], ["Customer service reports that many callers cannot get past the challenge page at all, mostly on older phones. Conversion has dropped sharply since it went up. How many real customers are you willing to turn away to stop the bots?", "Kundtjänst rapporterar att många som ringer inte kommer förbi kontrollsidan alls, mest på äldre telefoner. Försäljningen har sjunkit kraftigt sedan den kom upp. Hur många riktiga kunder är ni beredda att stöta bort för att stoppa botarna?"]),
              pb(["The app stops working", "Appen slutar fungera"], ["The mobile app calls the same site in the background and cannot solve a challenge. App users, often your most loyal customers, can no longer log in or pay. Do you exempt the app, and with it a path the bots can also use?", "Mobilappen anropar samma webbplats i bakgrunden och kan inte lösa en kontroll. Appens användare, ofta era mest trogna kunder, kan inte längre logga in eller betala. Undantar ni appen, och därmed en väg som även botarna kan använda?"]),
              pb(["Login traffic barely drops", "Inloggningstrafiken minskar knappt"], ["Search traffic fell when the challenge went up, but requests to the login page are almost as many as before. Whatever is sending them gets through the challenge. Is the site-wide challenge doing what you think, and what is still reaching login?", "Söktrafiken föll när kontrollen kom upp, men anropen mot inloggningssidan är nästan lika många som tidigare. Det som skickar dem tar sig förbi kontrollen. Gör kontrollen på hela webbplatsen det ni tror, och vad är det som fortfarande når inloggningen?"])
            ],
            B: [
              pb(["A few requests per address", "Några få anrop per adress"], ["Each attacking address sends only a few requests per minute, well under the limits you set. The rate limits trigger mostly on real customers who retry. Do you tighten them further, and lock out even more genuine shoppers, or admit the limits miss the attack?", "Varje angripande adress skickar bara några få anrop per minut, långt under gränserna ni satte. Spärrarna slår mest till mot riktiga kunder som försöker igen. Skärper ni dem ytterligare, och stänger ute ännu fler riktiga kunder, eller medger ni att spärrarna missar angreppet?"]),
              pb(["One address, many customers", "En adress, många kunder"], ["Mobile operators put thousands of phones behind the same few addresses. Your strict limits now block whole groups of customers at checkout, at the peak of the sale. Do you loosen the limits for those operators, knowing the attacker can hide there too?", "Mobiloperatörer lägger tusentals telefoner bakom samma fåtal adresser. Era hårda spärrar stoppar nu hela grupper av kunder i kassan, mitt i reans topp. Lättar ni på spärrarna för de operatörerna, med vetskap om att angriparen kan gömma sig där också?"]),
              pb(["The rest of the shop crawls", "Resten av butiken går segt"], ["The service owner says login and checkout are protected, but search and product pages are still overloaded. Customers cannot find anything to put in the cart. Was protecting two pages the right priority on a sales evening, and what do you tell the service owner?", "Tjänsteägaren säger att inloggning och kassa är skyddade, men sök och produktsidor är fortfarande överbelastade. Kunderna hittar inget att lägga i varukorgen. Var det rätt prioritering att skydda två sidor en försäljningskväll, och vad säger ni till tjänsteägaren?"])
            ],
            C: [
              pb(["The load grows to match", "Lasten växer i takt"], ["Within twenty minutes of the new servers coming online, the request rate rises again to fill them. Each new server costs money by the hour. Do you keep adding capacity against an attacker who scales with you, and where do you stop?", "Inom tjugo minuter efter att de nya servrarna kom igång ökar anropstakten igen och fyller dem. Varje ny server kostar pengar per timme. Fortsätter ni lägga till kapacitet mot en angripare som växer i takt med er, och var slutar ni?"]),
              pb(["The database cannot scale", "Databasen kan inte växa"], ["More web servers mean more queries against the same customer database, which is now the bottleneck. It cannot be scaled up during an evening without downtime. Do you take the shop down to grow the database, or accept that the extra servers changed little?", "Fler webbservrar innebär fler frågor mot samma kunddatabas, som nu är flaskhalsen. Den kan inte byggas ut under en kväll utan avbrott. Tar ni ner butiken för att bygga ut databasen, eller accepterar ni att de extra servrarna ändrade lite?"]),
              pb(["Every login answered", "Varje inloggning besvaras"], ["The SOC lead objects: with more capacity, the site now answers every login request at full speed, and nobody has looked at what those logins are for. “We are making it easier for them, whatever they want.” Do you keep absorbing it without knowing what you are serving?", "SOC-ansvarig invänder: med mer kapacitet besvarar webbplatsen nu varje inloggningsförsök i full fart, och ingen har tittat på vad inloggningarna är till för. ”Vi gör det lättare för dem, vad de än vill.” Fortsätter ni ta emot lasten utan att veta vad ni betjänar?"])
            ]
          }
        }),
        facilitator: fac(
          ["Plant the seed: why login? Don't answer it — stage 4 will.", "Så fröet: varför inloggningen? Svara inte – skede 4 gör det."],
          ["Targeted protection of login and checkout, and someone asking what the login traffic is for.", "Riktat skydd av inloggning och kassa, och någon som frågar vad inloggningstrafiken är till för."],
          [["Ask: what would you do with a list of stolen passwords tonight?", "Fråga: vad skulle ni göra med en lista över stulna lösenord i kväll?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 150,
        title: L(["Pay or it continues", "Betala, annars fortsätter det"]),
        twist: L(["It is extortion — and the price rises every hour you wait.", "Det är utpressning – och priset stiger för varje timme ni väntar."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "The flood has turned into an extortion demand. If you paid for scrubbing above the contract, the attackers know what you can afford. If you geo-blocked or waited, half the night's sales are gone.", sv: "Översvämningen har blivit ett utpressningskrav. Om ni betalade för rensning utöver avtalet vet angriparna vad ni har råd med. Om ni geoblockerade eller väntade är halva nattens försäljning borta." } },
        assumptionChallenged: L(["This is random vandalism that will pass.", "Det här är slumpmässig skadegörelse som går över."]),
        narrative: L([
          "{{time.T+150|clock}}. An email arrives at the press address and at the CEO's personal address at the same moment.\n\nWhoever sent it knows who runs the company, and wants to be sure management reads it tonight. The subject line says only: “About your weekend.”",
          "Klockan {{time.T+150|clock}}. Ett mejl kommer till pressadressen och till vd:s personliga adress i samma ögonblick.\n\nDen som skickade det vet vem som leder företaget och vill vara säker på att ledningen läser det i kväll. Ämnesraden lyder bara: ”Angående er helg.”"
        ]),
        injects: [
          inj("i3-1", 150, "ransomNote", "attacker", "critical", "unverified", [
            "“That was a demonstration. Pay {{num.demand|currency}} in cryptocurrency by midnight and the attack stops for the whole weekend. Ignore us and Sunday will be worse. The price doubles at midnight.”",
            "”Det där var en demonstration. Betala {{num.demand|currency}} i kryptovaluta före midnatt så upphör attacken hela helgen. Ignorera oss och söndagen blir värre. Priset dubblas vid midnatt.”"
          ], { headline: ["Subject: weekend", "Ämne: helgen"], tests: ["lo3"], facilitatorNote: ["The demand is real, but the DDoS is not the main business. Watch whether the group stops looking elsewhere once the “explanation” has arrived.", "Kravet är verkligt, men överbelastningen är inte huvudsaken. Se om gruppen slutar titta åt andra håll när ”förklaringen” har kommit."] }),
          inj("i3-2", 170, "threatIntel", "threatIntel", "medium", "unverified", [
            "Groups using this kind of extortion message have been seen attacking again even after payment, and some combine DDoS with other activity.",
            "Grupper som använder den här typen av utpressningsmeddelanden har setts angripa igen även efter betalning, och vissa kombinerar överbelastning med annan aktivitet."
          ], { statedReliability: ["Open-source reporting", "Öppna källor"], tests: ["lo2", "lo3"] }),
          inj("i3-3", 180, "phoneTranscript", "police", "low", "confirmed", [
            "{{reg.police|cap}}: “Don't pay. Save the email with full headers and any wallet address. We would like your traffic logs for the case.”",
            "{{reg.police|cap}}: ”Betala inte. Spara mejlet med fullständiga mejlhuvuden och eventuell plånboksadress. Vi vill gärna ha era trafikloggar till ärendet.”"
          ], { optional: true, pressure: "lawEnforcement", tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What could you learn from the demand itself?", "Vad kan ni lära er av själva kravet?", ["socLead", "ciso"]),
            q("Now that you have an explanation, are you still watching everything else?", "Nu när ni har en förklaring – bevakar ni fortfarande allt annat?", ["socLead", "ciso"]),
            q("Has your targeted protection held since the last decision?", "Har det riktade skyddet hållit sedan det senaste beslutet?", ["networkLead"], "d2")
          ],
          executive: [
            q("Is paying ever an option for you, and who decides?", "Är betalning någonsin ett alternativ för er, och vem beslutar?", ["ceo", "legal"]),
            q("What do you say publicly about an extortion attempt?", "Vad säger ni offentligt om ett utpressningsförsök?", ["comms", "ceo"]),
            q("Does the demand change how you see the trade-off you made on customer friction?", "Ändrar kravet hur ni ser på avvägningen ni gjorde om friktion för kunderna?", ["serviceOwner", "ceo"], "d2")
          ]
        },
        challenges: [ch("The commercial director argues that paying would cost less than one more hour offline.", "Försäljningschefen menar att en betalning kostar mindre än en timme till med butiken nere.")],
        decision: dec("d3", "ceo", ["How do you answer the extortion?", "Hur svarar ni på utpressningen?"], [
          ["Refuse, report to the police and keep strengthening defences.", "Vägra, polisanmäl och fortsätt förstärka skyddet."],
          ["Open a channel to buy time without intending to pay.", "Öppna en kanal för att vinna tid utan avsikt att betala."],
          ["Pay to protect the weekend's sales.", "Betala för att skydda helgens försäljning."]
        ], {
          knowns: [["The demand doubles at midnight.", "Kravet dubblas vid midnatt."]],
          uncertainties: [["Whether paying would stop anything.", "Om en betalning skulle stoppa något alls."]],
          tradeoffs: {
            operational: ["Refusing may mean a hard weekend.", "Att vägra kan innebära en tuff helg."],
            security: ["Paying marks you as a payer for future attacks.", "En betalning märker er som betalare inför framtida attacker."],
            legal: ["Payments may conflict with sanctions and require approvals.", "Betalningar kan strida mot sanktioner och kräver godkännanden."],
            reputational: ["Paying usually becomes known.", "Betalningar brukar bli kända."]
          },
          evaluation: [["Decides on principles, not panic", "Beslutar utifrån principer, inte panik"], ["Keeps the security team looking beyond the obvious", "Låter säkerhetsteamet titta bortom det uppenbara"]],
          interrupts: [
            ir("i1", { chosen: "C" }, ["After the payment", "Efter betalningen"], [
              io(["The flood stops", "Attacken upphör"], ["About an hour after the transfer, traffic falls back to a normal Friday night. The room starts to relax, and someone suggests sending half the team home.", "Ungefär en timme efter överföringen faller trafiken tillbaka till en normal fredagskväll. Rummet börjar slappna av, och någon föreslår att halva teamet går hem."], ["The flood stopped about an hour after the payment.", "Attacken upphörde ungefär en timme efter betalningen."]),
              io(["A second demand", "Ett andra krav"], ["A new email arrives: thanks for the payment, and Sunday's protection costs double. The attackers attach a screenshot of your transfer. Paying once has made you a customer.", "Ett nytt mejl kommer: tack för betalningen, och söndagens skydd kostar det dubbla. Angriparna bifogar en skärmbild av er överföring. En betalning har gjort er till kund."], ["After the payment, the attackers sent a second, larger demand.", "Efter betalningen skickade angriparna ett andra, större krav."], { reopen: true }),
              io(["Payment in limbo", "Betalningen hänger i luften"], ["The intermediary handling the transfer has frozen it for checks. Nobody can say whether the attackers have received anything, and the deadline is still running.", "Mellanhanden som hanterar överföringen har fryst den för kontroll. Ingen kan säga om angriparna har fått något, och tidsfristen löper fortfarande."], ["Nobody can confirm whether the attackers received the payment.", "Ingen kan bekräfta om angriparna har fått betalningen."])
            ]),
            ir("i2", { notChosen: "C" }, ["No money sent", "Inga pengar skickas"], [
              io(["Others got it too", "Andra fick det också"], ["A security contact at another retailer calls: they received the same email tonight and are not paying either. It feels like confirmation that you are on the right track.", "En säkerhetskontakt hos en annan handlare ringer: de fick samma mejl i kväll och tänker inte heller betala. Det känns som en bekräftelse på att ni är på rätt spår."], ["At least one other retailer received the same demand tonight.", "Minst en annan handlare fick samma krav i kväll."]),
              io(["The board wants to pay", "Styrelsen vill betala"], ["The chair of the board calls {{person.ceo.name}}: the weekend is worth more than the demand, and the board expects the question reconsidered before midnight. The chair wants a decision, not a principle.", "Styrelseordföranden ringer {{person.ceo.name}}: helgen är värd mer än kravet, och styrelsen förväntar sig att frågan omprövas före midnatt. Ordföranden vill ha ett beslut, inte en princip."], ["The board chair has pressed for payment before midnight.", "Styrelseordföranden har tryckt på för en betalning före midnatt."], { reopen: true }),
              io(["A short reminder", "En kort påminnelse"], ["Traffic spikes hard for ten minutes and then falls back. A one-line email follows: “That was a reminder.” The network lead cannot tell whether it was a threat or all they have left.", "Trafiken ökar kraftigt i tio minuter och faller sedan tillbaka. Ett mejl på en rad följer: ”Det var en påminnelse.” Nätverksansvarig kan inte avgöra om det var ett hot eller allt de har kvar."], ["A ten-minute traffic spike followed, signed “a reminder”.", "En tio minuter lång trafiktopp följde, undertecknad ”en påminnelse”."])
            ])
          ],
          pushback: {
            A: [
              pb(["The weekend in numbers", "Helgen i siffror"], ["The service owner puts a figure on the table: if Sunday is as bad as tonight, the loss is larger than {{num.demand|currency}}. “We are paying anyway, just to someone else.” Is your principle worth more than the weekend, and can you say so to the people who will lose their bonuses?", "Tjänsteägaren lägger fram en siffra: om söndagen blir lika illa som i kväll blir förlusten större än {{num.demand|currency}}. ”Vi betalar ändå, bara till någon annan.” Är er princip värd mer än helgen, och kan ni säga det till dem som förlorar sin bonus?"]),
              pb(["The police want logs", "Polisen vill ha loggar"], ["The police want full traffic logs for the case. Exporting them pulls the network team away from defending the site for hours, and the logs contain customers' addresses. Do you hand them over tonight, and who checks that you are allowed to?", "Polisen vill ha fullständiga trafikloggar till ärendet. Att ta fram dem drar bort nätverksteamet från försvaret av webbplatsen i flera timmar, och loggarna innehåller kunders adresser. Lämnar ni över dem i natt, och vem kontrollerar att ni får göra det?"]),
              pb(["Say it out loud?", "Säga det högt?"], ["A reporter asks whether you are being extorted. Saying “we refused” sounds strong, but it may also invite the attackers to prove a point on Sunday. Saying nothing looks like hiding. What do you say publicly about a refusal you have just made?", "En reporter frågar om ni utsätts för utpressning. Att säga ”vi vägrade” låter starkt, men kan också locka angriparna att visa vad de kan på söndag. Att inte säga något ser ut som att ni döljer något. Vad säger ni offentligt om en vägran ni just har fattat beslut om?"])
            ],
            B: [
              pb(["A sign of good faith", "Ett tecken på god vilja"], ["The attackers answer within minutes: send a small test payment to show you are serious, or the price doubles at midnight as promised. The channel you opened now asks for money. Do you send anything at all, and if not, what was the channel for?", "Angriparna svarar inom några minuter: skicka en liten testbetalning för att visa att ni menar allvar, annars dubblas priset vid midnatt som utlovat. Kanalen ni öppnade kräver nu pengar. Skickar ni något alls, och om inte, vad var kanalen till för?"]),
              pb(["Who is talking to them?", "Vem pratar med dem?"], ["Legal points out that every message to the attackers is written evidence, and nobody has said who is allowed to write them or what they may promise. The police would rather you did not talk at all. Who owns this conversation, and can you stop it without making things worse?", "Juristen påpekar att varje meddelande till angriparna är skriftlig bevisning, och ingen har sagt vem som får skriva dem eller vad den får lova. Polisen vill helst att ni inte pratar alls. Vem äger samtalet, och kan ni avsluta det utan att göra saken värre?"]),
              pb(["Time for what?", "Tid till vad?"], ["Two hours into the conversation, nobody can say what the extra time has been used for. The defences are the same as before and the deadline still stands. Is the channel a tactic, or a way to avoid making the real decision?", "Två timmar in i samtalet kan ingen säga vad den extra tiden har använts till. Skyddet är detsamma som tidigare och tidsfristen står fast. Är kanalen en taktik, eller ett sätt att slippa fatta det verkliga beslutet?"])
            ],
            C: [
              pb(["The money will not move", "Pengarna går inte att flytta"], ["Your bank will not convert that much into cryptocurrency on a Friday night, and nobody can check the wallet against sanctions lists before midnight. Paying in time means paying unchecked, through someone you do not know. Do you still go ahead?", "Banken växlar inte så mycket till kryptovaluta en fredagskväll, och ingen kan kontrollera plånboken mot sanktionslistor före midnatt. Att betala i tid innebär att betala okontrollerat, via någon ni inte känner. Går ni ändå vidare?"]),
              pb(["The insurer was not asked", "Försäkringsbolaget tillfrågades inte"], ["Your cyber insurance only covers extortion payments it has approved in advance, and the insurer's duty officer will not answer until morning. Paying now means paying from your own pocket. Do you wait for approval and let the price double, or pay without cover?", "Er cyberförsäkring täcker bara utpressningsbetalningar som bolaget har godkänt i förväg, och försäkringsbolagets jour svarar inte förrän i morgon bitti. Att betala nu innebär att betala ur egen ficka. Väntar ni på godkännande och låter priset dubblas, eller betalar ni utan täckning?"]),
              pb(["“Have you paid?”", "”Har ni betalat?”"], ["A reporter calls: other companies hit this way have paid, and readers want to know whether you did. The police already told you not to. Do you confirm the payment, deny it, or refuse to comment, and which answer will still hold on Monday?", "En reporter ringer: andra företag som drabbats på samma sätt har betalat, och läsarna vill veta om ni gjorde det. Polisen har redan sagt åt er att inte göra det. Bekräftar ni betalningen, förnekar ni den eller avböjer ni att kommentera, och vilket svar håller fortfarande på måndag?"])
            ]
          }
        }),
        facilitator: fac(
          ["The ransom note offers an easy story. The real attack continues in the background.", "Utpressningsbrevet erbjuder en enkel förklaring. Det verkliga angreppet pågår i bakgrunden."],
          ["A refusal grounded in principles, police informed and monitoring maintained beyond the DDoS.", "En vägran grundad i principer, polisen informerad och bevakningen upprätthållen bortom överbelastningen."],
          [["Ask: if you were the attacker, what would you do while they read this email?", "Fråga: om ni var angriparen, vad skulle ni göra medan de läser det här mejlet?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 300,
        title: L(["The smokescreen", "Rökridån"]),
        twist: L(["The flood was cover. While you watched it, thousands of customer accounts were taken over.", "Attacken var en rökridå. Medan ni tittade på den togs tusentals kundkonton över."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because you refused and reported it, the attackers doubled the flood within the hour and posted your refusal on a forum.", sv: "Eftersom ni vägrade och polisanmälde fördubblade angriparna översvämningen inom en timme och lade ut ert nej på ett forum." } }
        ],
        assumptionChallenged: L(["This is an availability incident.", "Det här är en tillgänglighetsincident."]),
        reveals: ["hf-stuffing"],
        narrative: L([
          "{{time.T+300|clock}}. For five hours every eye in the room has been on the bandwidth graphs and the web servers.\n\nAn analyst who finally had time to look at the authentication logs asks everyone to stop talking. What they found has been happening quietly in the background since early in the evening, and it has nothing to do with the traffic.",
          "Klockan {{time.T+300|clock}}. I fem timmar har alla i rummet stirrat på bandbreddsgraferna och webbservrarna.\n\nEn analytiker som äntligen hade tid att titta på inloggningsloggarna ber alla att vara tysta. Det hen hittade har pågått tyst i bakgrunden sedan tidigt i kväll, och det har ingenting med trafiken att göra."
        ]),
        injects: [
          inj("i4-1", 300, "authLog", "siem", "critical", "confirmed", [
            "{{num.attempts}} login attempts since {{time.T+120|clock}}, using email–password pairs from a known breach at another company. {{num.takeovers}} succeeded. Many accounts then changed email address and delivery address.",
            "{{num.attempts}} inloggningsförsök sedan {{time.T+120|clock}}, med kombinationer av e-post och lösenord från ett känt dataintrång hos ett annat företag. {{num.takeovers}} lyckades. Många konton bytte därefter e-postadress och leveransadress."
          ], { headline: ["Credential stuffing behind the flood", "Kontokapning bakom attacken"], reveals: ["hf-stuffing"], tests: ["lo2", "lo4"] }),
          inj("i4-2", 320, "executiveMessage", "person.dpo", "high", "confirmed", [
            "“Account takeovers expose names, addresses and order history. That is a personal data breach — and possibly a lot of them.”",
            "”Kontokapningar exponerar namn, adresser och orderhistorik. Det är en personuppgiftsincident – och möjligen väldigt många.”"
          ], { fallbackRole: "legal", tests: ["lo4"] })
        ],
        charts: [{
          id: "c4-logins", type: "bar",
          title: L(["Login attempts per hour", "Inloggningsförsök per timme"]), unit: L(["attempts", "försök"]),
          caption: L(["Hours since the attack began.", "Timmar sedan attacken började."]),
          data: (ctx) => {
            const hours = [0, 1, 2, 3, 4, 5];
            const per = ctx.vars.attempts / 3.5;
            return {
              categories: hours,
              series: [
                { id: "fail", label: L(["Failed", "Misslyckade"]), values: hours.map((h) => (h < 2 ? 3000 + ctx.rng.int(0, 900) : Math.round(per * (0.6 + ctx.rng.float(0, 0.4))))) },
                { id: "ok", label: L(["Successful", "Lyckade"]), values: hours.map((h) => (h < 2 ? 900 + ctx.rng.int(0, 200) : Math.round((ctx.vars.takeovers / 3.5) * (0.6 + ctx.rng.float(0, 0.4))))) }
              ]
            };
          }
        }],
        questions: {
          technical: [
            q("How do you lock attackers out of taken-over accounts without locking out real customers?", "Hur stänger ni ute angripare från kapade konton utan att stänga ute riktiga kunder?", ["socLead", "serviceOwner"]),
            q("Which account changes must be reversed, and how?", "Vilka kontoändringar måste återställas, och hur?", ["socLead", "serviceOwner"]),
            q("What did your monitoring miss while the team looked at the DDoS?", "Vad missade er övervakning medan teamet tittade på överbelastningen?", ["socLead"], "d1")
          ],
          executive: [
            q("Do you force a password reset for every customer tonight?", "Tvingar ni fram nya lösenord för alla kunder i natt?", ["ceo", "serviceOwner"]),
            q("Is this now a data breach to notify, and when did you become aware?", "Är det nu ett intrång som ska anmälas, och när fick ni kännedom?", ["dpo", "legal"]),
            q("Does your answer to the extortion still stand, now you know what it covered?", "Står sig ert svar på utpressningen nu när ni vet vad den dolde?", ["ceo"], "d3")
          ]
        },
        challenges: [ch("A forced reset during the sale will cost more orders than the DDoS did.", "En tvingande lösenordsåterställning under rean kostar fler order än överbelastningen gjorde.")],
        decision: dec("d4", "ceo", ["How do you protect customer accounts now?", "Hur skyddar ni kundkontona nu?"], [
          ["Force a reset for all accounts tonight and restore changed contact details.", "Tvinga fram nya lösenord för alla konton i natt och återställ ändrade kontaktuppgifter."],
          ["Lock only accounts with suspicious logins and add step-up checks at checkout.", "Lås bara konton med misstänkta inloggningar och lägg till extra kontroll i kassan."],
          ["Keep the sale running and handle takeovers on Monday.", "Låt rean pågå och hantera kapningarna på måndag."]
        ], {
          knowns: [["{{num.takeovers}} accounts were taken over.", "{{num.takeovers}} konton har kapats."]],
          uncertainties: [["How many have already been used for orders.", "Hur många som redan har använts för beställningar."]],
          tradeoffs: {
            operational: ["A global reset stops sales for many genuine customers.", "En global återställning stoppar försäljningen för många riktiga kunder."],
            security: ["Targeted locks may miss accounts the attacker has not used yet.", "Riktade låsningar kan missa konton som angriparen ännu inte har använt."],
            legal: ["Personal data was exposed; notification duties apply.", "Personuppgifter har exponerats; anmälningsplikten gäller."],
            reputational: ["Customers judge you on whether you protected their accounts.", "Kunderna bedömer er efter om ni skyddade deras konton."]
          },
          evaluation: [["Acts on takeovers the same night", "Agerar på kapningarna samma natt"], ["Recognises the notification duty", "Ser anmälningsplikten"]],
          minutes: 10,
          interrupts: [
            ir("i1", { chosen: "A" }, ["Every password reset", "Alla lösenord återställs"], [
              io(["Takeovers stop", "Kapningarna upphör"], ["Within the hour, new successful logins from the campaign drop almost to zero. The SOC lead calls it the first clear win of the night.", "Inom en timme sjunker nya lyckade inloggningar från kampanjen nästan till noll. SOC-ansvarig kallar det nattens första tydliga seger."], ["New takeovers dropped sharply after the mass reset.", "Nya kapningar minskade kraftigt efter den stora återställningen."]),
              io(["Links to the attacker", "Länkar till angriparen"], ["Many reset links went to email addresses the attacker had already put on taken-over accounts. Those accounts have now been reset by the attacker, with new passwords only they know.", "Många återställningslänkar gick till e-postadresser som angriparen redan hade lagt in på kapade konton. De kontona har nu återställts av angriparen, med nya lösenord som bara angriparen känner till."], ["Some reset links went to addresses the attacker controlled.", "En del återställningslänkar gick till adresser som angriparen kontrollerade."], { reopen: true, meters: { trust: -1 } }),
              io(["Copycat emails", "Falska kopior"], ["Within an hour, look-alike reset emails from a similar domain appear in customers' inboxes. Customers ask on social media which message is real, and nobody has an answer ready.", "Inom en timme dyker liknande återställningsmejl från en snarlik domän upp i kundernas inkorgar. Kunder frågar i sociala medier vilket meddelande som är äkta, och ingen har något svar redo."], ["Fake reset emails are circulating alongside the real ones.", "Falska återställningsmejl cirkulerar tillsammans med de äkta."], { meters: { media: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["Most accounts still open", "De flesta konton är öppna"], [
              io(["Sales hold up", "Försäljningen håller"], ["The sale keeps running through the night and revenue recovers some of the lost evening. The service owner thanks the room for not stopping the shop a second time.", "Rean fortsätter under natten och intäkterna tar igen en del av den förlorade kvällen. Tjänsteägaren tackar rummet för att butiken inte stoppades en gång till."], ["Night sales recovered part of the lost evening.", "Nattens försäljning tog igen en del av den förlorade kvällen."]),
              io(["Details keep changing", "Uppgifterna fortsätter ändras"], ["The SOC sees more accounts change email and delivery address after the decision than before it. Whatever is happening has not slowed down.", "SOC ser att fler konton byter e-post- och leveransadress efter beslutet än före. Det som pågår har inte saktat in."], ["Account details kept changing after the decision.", "Kontouppgifter fortsatte att ändras efter beslutet."], { reopen: true }),
              io(["One customer posts", "En kund skriver"], ["A customer posts that the email address on their account was changed tonight and asks whether anyone else has seen the same. So far nobody has answered.", "En kund skriver att e-postadressen på kontot har ändrats i natt och frågar om någon annan har varit med om samma sak. Hittills har ingen svarat."], ["A customer has publicly reported their account email being changed.", "En kund har offentligt berättat att e-postadressen på kontot har ändrats."])
            ])
          ],
          pushback: {
            A: [
              pb(["Reset links to the attacker", "Återställningslänkar till angriparen"], ["Many taken-over accounts now have the attacker's email address. A reset sent tonight goes straight to them, unless the old addresses are restored first, and for some accounts nobody can find the original. Do you send the resets anyway, or hold them until every address is checked?", "Många kapade konton har nu angriparens e-postadress. En återställning som skickas i natt går rakt till dem, om inte de gamla adresserna återställs först, och för vissa konton kan ingen hitta den ursprungliga. Skickar ni återställningarna ändå, eller håller ni inne dem tills varje adress är kontrollerad?"]),
              pb(["It looks like phishing", "Det ser ut som nätfiske"], ["Communications warns that a mass email tonight saying “reset your password now” looks exactly like a phishing campaign, and you have told customers for years never to click such links. How do you make a genuine reset message believable at midnight?", "Kommunikationsavdelningen varnar för att ett massutskick i natt med ”byt ditt lösenord nu” ser ut precis som en nätfiskekampanj, och ni har i åratal sagt åt kunderna att aldrig klicka på sådana länkar. Hur gör ni ett äkta återställningsmeddelande trovärdigt vid midnatt?"]),
              pb(["Telling everyone at once", "Att berätta för alla på en gång"], ["The data protection officer points out that a reset for every customer effectively tells all of them about a breach tonight, before you have decided what to report, to whom, or what to say. Are you ready to go public at that scale tonight?", "Dataskyddsombudet påpekar att en återställning för alla kunder i praktiken berättar om ett intrång för alla redan i natt, innan ni har bestämt vad som ska anmälas, till vem eller vad ni ska säga. Är ni redo att gå ut så brett redan i natt?"])
            ],
            B: [
              pb(["What counts as suspicious?", "Vad räknas som misstänkt?"], ["The logins came from home addresses with real browsers, a few at a time. The SOC can only flag a fraction of them with confidence. Do you lock the uncertain ones as well, and accept locking out real customers, or leave them open?", "Inloggningarna kom från privata adresser med riktiga webbläsare, några i taget. SOC kan bara peka ut en bråkdel av dem med säkerhet. Låser ni de osäkra också, och accepterar att stänga ute riktiga kunder, eller lämnar ni dem öppna?"]),
              pb(["The check goes to the attacker", "Kontrollen går till angriparen"], ["The extra check at checkout sends a code to the account's email address, and on many taken-over accounts that address now belongs to the attacker. The step-up check confirms them, not the customer. Does your targeted approach still protect anyone in those accounts?", "Den extra kontrollen i kassan skickar en kod till kontots e-postadress, och på många kapade konton tillhör den adressen nu angriparen. Kontrollen bekräftar dem, inte kunden. Skyddar ert riktade upplägg fortfarande någon i de kontona?"]),
              pb(["Locked out, and no one told", "Utelåsta, och ingen har sagt något"], ["Customer service has calls from customers whose accounts were locked tonight, and no script. Agents do not know whether to say “breach”, “error” or nothing. What do the people answering the phones say, and who decides it before the next call?", "Kundtjänst får samtal från kunder vars konton låstes i natt, och har inget manus. Handläggarna vet inte om de ska säga ”intrång”, ”fel” eller ingenting. Vad säger de som svarar i telefon, och vem bestämmer det före nästa samtal?"])
            ],
            C: [
              pb(["The clock started tonight", "Klockan startade i natt"], ["The data protection officer reminds you that the deadline for reporting a personal data breach runs from when you became aware, which was tonight. Handling it on Monday uses up most of that time. Who signs off on waiting, and how do you explain the gap to the supervisor?", "Dataskyddsombudet påminner om att fristen för att anmäla en personuppgiftsincident räknas från när ni fick kännedom, och det var i natt. Att hantera den på måndag förbrukar det mesta av tiden. Vem står för beslutet att vänta, och hur förklarar ni glappet för tillsynsmyndigheten?"]),
              pb(["A whole weekend for them", "En hel helg för dem"], ["The taken-over accounts have new email and delivery addresses, and nobody has locked them. Until Monday, whoever controls them can use everything stored in them, while the sale invites them to shop. Can you defend that trade to the customers who own those accounts?", "De kapade kontona har nya e-post- och leveransadresser, och ingen har låst dem. Fram till måndag kan den som styr dem använda allt som finns sparat i dem, medan rean lockar till köp. Kan ni försvara den avvägningen inför kunderna som äger kontona?"]),
              pb(["The analyst wants it in writing", "Analytikern vill ha det skriftligt"], ["The analyst who found the takeovers asks for the decision to wait to be written down with a name on it, “so it is clear I raised it”. The room goes quiet. Who puts their name to waiting until Monday?", "Analytikern som hittade kapningarna ber att beslutet att vänta skrivs ner med ett namn, ”så att det framgår att jag larmade”. Det blir tyst i rummet. Vem sätter sitt namn på att vänta till måndag?"])
            ]
          }
        }),
        facilitator: fac(
          ["The key debrief moment: who was watching the logs? Let the room realise it, don't say it.", "Utvärderingens viktigaste ögonblick: vem bevakade loggarna? Låt gruppen inse det själv, säg det inte."],
          ["Same-night protection of accounts, reversal of changed details and a notification assessment.", "Skydd av kontona samma natt, återställning av ändrade uppgifter och en bedömning av anmälan."],
          [["Ask: which team owns customer accounts at 23:00 on a Friday?", "Fråga: vilket team äger kundkontona klockan 23 en fredag?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 900,
        title: L(["Orders nobody placed", "Beställningar som ingen har lagt"]),
        twist: L(["The hijacked accounts are spending saved cards and loyalty points.", "De kapade kontona handlar med sparade kort och bonuspoäng."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "While the site fought the load, thousands of accounts were taken over. Did your way of handling the load leave the door open, or keep it shut?", sv: "Medan webbplatsen kämpade mot lasten kapades tusentals konton. Lämnade ert sätt att hantera lasten dörren öppen, eller höll det den stängd?" } },
        assumptionChallenged: L(["Stolen accounts only expose data; no money is lost.", "Stulna konton exponerar bara uppgifter; inga pengar går förlorade."]),
        reveals: ["hf-orders"],
        narrative: L([
          "Saturday, {{time.T+900|clock}}. Customer service opens to a long queue.\n\nPeople are calling about orders they never placed, sent to addresses they have never heard of, and about loyalty points that have vanished overnight. Some of the parcels are already on their way. Every caller wants to know who will pay.",
          "Lördag, klockan {{time.T+900|clock}}. Kundtjänst öppnar med en lång kö.\n\nFolk ringer om beställningar de aldrig har lagt, skickade till adresser de aldrig hört talas om, och om bonuspoäng som har försvunnit under natten. En del av paketen är redan på väg. Varje kund vill veta vem som betalar."
        ]),
        injects: [
          inj("i5-1", 900, "impactReport", "person.serviceOwner", "high", "confirmed", [
            "{{num.fraudOrders}} orders overnight from taken-over accounts, paid with stored cards or loyalty points, many to parcel lockers. Some have already shipped.",
            "{{num.fraudOrders}} beställningar under natten från kapade konton, betalda med sparade kort eller bonuspoäng, många till paketskåp. En del har redan skickats."
          ], { reveals: ["hf-orders"], tests: ["lo4"] }),
          inj("i5-2", 930, "customerComplaint", "customer", "medium", "confirmed", [
            "“Someone used my saved card in your shop and my points are gone. I never got an email about it. Why should I trust you with my card again?”",
            "”Någon har använt mitt sparade kort i er butik och mina poäng är borta. Jag fick inget mejl om det. Varför ska jag lita på er med mitt kort igen?”"
          ], { pressure: "customers", optional: true, tests: ["lo4"] })
        ],
        charts: [{
          id: "c5-kpi", type: "kpi",
          title: L(["Account takeover impact", "Konsekvenser av kontokapningarna"]),
          data: kpi([
            { id: "takeovers", label: ["Accounts taken over", "Kapade konton"], value: (v) => v.takeovers, tone: "danger" },
            { id: "orders", label: ["Fraudulent orders", "Bedrägliga beställningar"], value: (v) => v.fraudOrders, tone: "danger" },
            { id: "attempts", label: ["Login attempts tested", "Prövade inloggningsförsök"], value: (v) => v.attempts, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("How do you stop shipments that are already on their way?", "Hur stoppar ni försändelser som redan är på väg?", ["serviceOwner", "socLead"]),
            q("Why did customers get no alert when contact details changed?", "Varför fick kunderna ingen varning när kontaktuppgifterna ändrades?", ["socLead", "ciso"]),
            q("Did your account-protection decision last night go far enough?", "Gick ert beslut om skydd av kontona i går kväll tillräckligt långt?", ["socLead"], "d4")
          ],
          executive: [
            q("Who refunds the customers, and how quickly?", "Vem ersätter kunderna, och hur snabbt?", ["ceo", "serviceOwner"]),
            q("What do you tell customers whose cards were used?", "Vad säger ni till kunderna vars kort har använts?", ["comms", "ceo"]),
            q("Would you make the same call on customer accounts again?", "Skulle ni fatta samma beslut om kundkontona igen?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("Refunds cost money the weekend has already lost; delaying them costs trust.", "Återbetalningar kostar pengar som helgen redan har förlorat; att vänta med dem kostar förtroende.")],
        decision: dec("d5", "ceo", ["How do you make customers whole?", "Hur gottgör ni kunderna?"], [
          ["Refund every affected customer proactively, without waiting for claims.", "Ersätt alla drabbade kunder proaktivt, utan att invänta krav."],
          ["Refund on request after verifying each case.", "Ersätt på begäran efter att varje fall har kontrollerats."],
          ["Refer customers to their card issuer.", "Hänvisa kunderna till sin kortutgivare."]
        ], {
          knowns: [["Orders were placed through your shop with stored payment methods.", "Beställningarna lades i er butik med sparade betalsätt."]],
          uncertainties: [["How many orders can still be stopped.", "Hur många beställningar som fortfarande kan stoppas."]],
          tradeoffs: {
            operational: ["Proactive refunds need people over a weekend.", "Proaktiva återbetalningar kräver personal under en helg."],
            security: ["Stopping shipments limits the attacker's gain.", "Att stoppa försändelser begränsar angriparens vinst."],
            legal: ["Consumer rules may put the burden on you anyway.", "Konsumentregler kan ändå lägga bördan på er."],
            reputational: ["How you treat victims decides whether they return.", "Hur ni behandlar de drabbade avgör om de kommer tillbaka."]
          },
          evaluation: [["Puts the affected customer first", "Sätter den drabbade kunden först"], ["Stops shipments before refunds", "Stoppar försändelser före återbetalningar"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Refunds go out", "Återbetalningarna går ut"], [
              io(["Customers say thanks", "Kunderna tackar"], ["By the afternoon, refunded customers are posting that you sorted it before they even asked. Calls to customer service start to fall.", "Vid eftermiddagen skriver ersatta kunder att ni ordnade det innan de ens hann fråga. Samtalen till kundtjänst börjar minska."], ["Refunded customers are speaking well of you online.", "Ersatta kunder talar väl om er på nätet."], { meters: { trust: 1 } }),
              io(["Claims from nowhere", "Krav från ingenstans"], ["Word of no-questions refunds spreads, and claims start arriving from accounts that are not on the affected list. Customer service cannot tell genuine victims from opportunists without checking each case.", "Ryktet om återbetalning utan frågor sprids, och krav börjar komma från konton som inte finns på listan över drabbade. Kundtjänst kan inte skilja verkliga offer från lycksökare utan att kontrollera varje fall."], ["Claims are arriving from accounts not on the affected list.", "Krav kommer in från konton som inte finns på listan över drabbade."], { reopen: true }),
              io(["The list keeps moving", "Listan ändras hela tiden"], ["The fraud team keeps moving orders on and off the refund list as it checks them. Nobody can say when the list will be final, or what the total will be.", "Bedrägeriteamet flyttar hela tiden beställningar till och från återbetalningslistan medan de kontrolleras. Ingen kan säga när listan är klar, eller vad summan blir."], ["The list of affected orders is not final yet.", "Listan över drabbade beställningar är inte klar än."])
            ]),
            ir("i2", { notChosen: "A" }, ["Customers must ask", "Kunderna måste fråga"], [
              io(["Fewer calls than feared", "Färre samtal än väntat"], ["By midday, fewer customers have called than anyone feared, and the queue is shrinking. Some in the room say the problem is smaller than the numbers suggested.", "Vid lunch har färre kunder ringt än någon befarade, och kön krymper. Några i rummet menar att problemet är mindre än siffrorna antydde."], ["By midday fewer customers had called than expected.", "Vid lunch hade färre kunder ringt än väntat."]),
              io(["A post spreads", "Ett inlägg sprids"], ["A customer's description of being sent away with a process instead of an apology is shared thousands of times. A consumer journalist asks for comment within the hour.", "En kunds beskrivning av hur hen fick en process i stället för en ursäkt delas tusentals gånger. En konsumentjournalist vill ha en kommentar inom en timme."], ["A customer's account of your refund handling is spreading online.", "En kunds berättelse om er hantering av återbetalningar sprids på nätet."], { reopen: true, meters: { media: 1, trust: -1 } }),
              io(["An informal question", "En informell fråga"], ["An official at the consumer authority calls to ask, informally, how refunds are being handled this weekend. No case has been opened, and they will not say why they are asking.", "En handläggare på konsumentmyndigheten ringer och frågar informellt hur återbetalningarna hanteras i helgen. Inget ärende är öppnat, och handläggaren vill inte säga varför frågan ställs."], ["The consumer authority has asked informally how refunds are handled.", "Konsumentmyndigheten har informellt frågat hur återbetalningarna hanteras."], { meters: { regulator: 1 } })
            ])
          ],
          pushback: {
            A: [
              pb(["Paying twice", "Att betala två gånger"], ["Some customers have already disputed the charges with their card issuer. If you refund them too, you pay twice, and some parcels are already in the attacker's hands. Do you slow down to check each case, or accept the double cost to keep the promise?", "En del kunder har redan bestridit dragningarna hos sin kortutgivare. Om ni också återbetalar dem betalar ni två gånger, och en del paket är redan i angriparens händer. Saktar ni ner för att kontrollera varje fall, eller accepterar ni dubbla kostnader för att hålla löftet?"]),
              pb(["Which orders are fake?", "Vilka beställningar är falska?"], ["Some affected accounts also contain real purchases made the same night by their owners. Without checking, a proactive refund pays back orders customers actually wanted, and a few will keep both. Do you still refund everything without asking?", "En del drabbade konton innehåller också riktiga köp som ägarna gjorde samma natt. Utan kontroll betalar en proaktiv återbetalning tillbaka beställningar som kunderna faktiskt ville ha, och några kommer att behålla båda. Återbetalar ni ändå allt utan att fråga?"]),
              pb(["Finance asks who approved", "Ekonomi frågar vem som godkände"], ["Finance asks who approved refunds without verification, on a weekend when the sales are already lost, and how this will look to the auditors. There is no written basis yet. Who owns the decision, and can it be defended on paper?", "Ekonomiavdelningen frågar vem som godkände återbetalningar utan kontroll, en helg när försäljningen redan är förlorad, och hur det ser ut för revisorerna. Det finns inget skriftligt underlag ännu. Vem äger beslutet, och kan det försvaras på papper?"])
            ],
            B: [
              pb(["Twenty minutes a case", "Tjugo minuter per fall"], ["Verifying one case takes about twenty minutes, and the weekend crew is small. At this pace, the last customers will wait more than a week for their money. Do you add people, loosen the checks, or let them wait?", "Att kontrollera ett fall tar ungefär tjugo minuter, och helgbemanningen är liten. I den här takten får de sista kunderna vänta mer än en vecka på sina pengar. Tar ni in fler, lättar ni på kontrollerna eller låter ni dem vänta?"]),
              pb(["They do not know yet", "De vet inte om det än"], ["Many affected customers have not noticed: the order confirmations went to the attacker's email address. They will find out from their bank statement, long after the weekend. Can “refund on request” work for people who do not know there is anything to request?", "Många drabbade kunder har inte märkt något: orderbekräftelserna gick till angriparens e-postadress. De får veta det via kontoutdraget, långt efter helgen. Kan ”ersättning på begäran” fungera för människor som inte vet att det finns något att begära?"]),
              pb(["“Prove I didn't order it?”", "”Bevisa att jag inte beställde?”"], ["A customer's post goes viral: “They want me to prove I didn't place an order from my own hacked account.” Customer service is following the process exactly. Do you defend the verification step in public, or drop it?", "Ett kundinlägg sprids snabbt: ”De vill att jag ska bevisa att jag inte beställde från mitt eget kapade konto.” Kundtjänst följer processen till punkt och pricka. Försvarar ni kontrollsteget offentligt, eller slopar ni det?"])
            ],
            C: [
              pb(["Points have no issuer", "Poäng har ingen utgivare"], ["Many of the fraudulent orders were paid with loyalty points, and there is no card issuer to refer anyone to. Those customers have nowhere to go but you. Who restores their points, and does your decision still hold if you have to make an exception?", "Många av de bedrägliga beställningarna betalades med bonuspoäng, och där finns ingen kortutgivare att hänvisa till. De kunderna har ingen annan än er att vända sig till. Vem återställer deras poäng, och håller beslutet om ni måste göra ett undantag?"]),
              pb(["It comes back to you", "Det kommer tillbaka till er"], ["Card issuers pass disputed charges back to the merchant, with a fee per case. The cost lands on you anyway, weeks later and with interest, and the customer still blames your shop. What have you saved by referring them away?", "Kortutgivarna skickar tillbaka bestridda dragningar till butiken, med en avgift per ärende. Kostnaden hamnar hos er ändå, veckor senare och dyrare, och kunden skyller fortfarande på er butik. Vad har ni sparat på att hänvisa bort dem?"]),
              pb(["Staff won't read the script", "Personalen vill inte läsa manuset"], ["Customer service agents say they cannot keep telling crying customers to call their bank, about something that happened in your shop. Two have asked to be taken off the phones. Do you change the answer, or ask your staff to keep giving it?", "Handläggarna i kundtjänst säger att de inte kan fortsätta be gråtande kunder ringa sin bank, om något som hände i er butik. Två har bett att slippa telefonen. Ändrar ni svaret, eller ber ni personalen att fortsätta ge det?"])
            ]
          }
        }),
        facilitator: fac(
          ["The incident now has victims with names. Look for empathy and speed.", "Incidenten har nu drabbade med namn. Se efter empati och snabbhet."],
          ["Shipments stopped, proactive refunds and alerts for contact-detail changes switched on.", "Försändelser stoppade, proaktiva återbetalningar och varningar vid ändrade kontaktuppgifter påslagna."],
          [["Ask: what would make you shop here again?", "Fråga: vad skulle få er att handla här igen?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 1500,
        title: L(["The payment provider calls", "Betalleverantören ringer"]),
        twist: L(["Your payment provider — not you — now decides whether the shop can open on Sunday.", "Er betalleverantör – inte ni – avgör nu om butiken får öppna på söndag."]),
        twistKind: "authority",
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because every account was reset tonight, customer service has four thousand calls in the queue, and the complaint is trending.", sv: "Eftersom varje konto återställdes i natt har kundtjänst fyratusen samtal i kö, och klagomålen trendar." } }
        ],
        assumptionChallenged: L(["We control when the shop reopens.", "Vi bestämmer när butiken öppnar igen."]),
        reveals: ["hf-same"],
        narrative: L([
          "Saturday, {{time.T+1500|clock}}. A call from the payment provider that handles every card payment in the shop.\n\nFraud rates on your merchant account have crossed the provider's threshold overnight. The provider is polite, but clear that its rules, not your sales calendar, will decide what happens next.",
          "Lördag, klockan {{time.T+1500|clock}}. Ett samtal från betalleverantören som hanterar varje kortbetalning i butiken.\n\nBedrägerinivån på ert handlarkonto har passerat leverantörens gräns under natten. Leverantören är artig, men tydlig med att det är dess regler, inte er försäljningskalender, som avgör vad som händer härnäst."
        ]),
        injects: [
          inj("i6-1", 1500, "supplierNotice", "supplier", "critical", "confirmed", [
            "{{supplier.payments}}: “Your fraud rate is {{num.fraudRate}} % against our 1 % limit. Unless you show effective controls by Sunday 08:00 we will suspend card acceptance.”",
            "{{supplier.payments}}: ”Er bedrägerinivå är {{num.fraudRate}} % mot vår gräns på 1 %. Om ni inte kan visa fungerande kontroller senast söndag 08.00 stänger vi av kortbetalningarna.”"
          ], { headline: ["Notice of suspension", "Meddelande om avstängning"], tests: ["lo4"] }),
          inj("i6-2", 1530, "threatIntel", "threatIntel", "high", "confirmed", [
            "Access to accounts in your shop is being sold on a forum, advertised by the same alias that signed the extortion email.",
            "Åtkomst till konton i er butik säljs på ett forum, utannonserad av samma alias som skrev under utpressningsmejlet."
          ], { reveals: ["hf-same"], statedReliability: ["Confirmed by two sources", "Bekräftat av två källor"], tests: ["lo2", "lo3"] })
        ],
        charts: [{
          id: "c6-gauge", type: "gauge",
          title: L(["Card fraud rate on your merchant account", "Kortbedrägerier på ert handlarkonto"]),
          data: (ctx) => ({ value: ctx.vars.fraudRate, max: 10, suffix: " %", label: L(["Provider limit: 1 %", "Leverantörens gräns: 1 %"]), tone: "danger" })
        }],
        questions: {
          technical: [
            q("What evidence of effective controls can you give the provider by morning?", "Vilka bevis på fungerande kontroller kan ni ge leverantören till i morgon bitti?", ["ciso", "socLead"]),
            q("What does the forum sale tell you about the remaining risk?", "Vad säger försäljningen på forumet om den kvarvarande risken?", ["socLead", "ciso"]),
            q("Did your stance on the extortion make any difference to the attacker?", "Gjorde er hållning till utpressningen någon skillnad för angriparen?", ["ciso"], "d3")
          ],
          executive: [
            q("Do you open on Sunday without cards, or stay closed?", "Öppnar ni på söndag utan kortbetalning eller håller ni stängt?", ["ceo", "serviceOwner"]),
            q("Who negotiates with the provider, and with what authority?", "Vem förhandlar med leverantören, och med vilket mandat?", ["supplierManager", "ceo"]),
            q("Does the forum sale change how you treat the customers you refunded?", "Ändrar försäljningen på forumet hur ni behandlar kunderna ni har ersatt?", ["ceo"], "d5")
          ]
        },
        challenges: [ch("Without card acceptance there is no Sunday sale.", "Utan kortbetalningar blir det ingen söndagsrea.")],
        decision: dec("d6", "ceo", ["What do you put in front of the payment provider?", "Vad lägger ni fram för betalleverantören?"], [
          ["Full transparency: the incident, the controls added and a plan, and accept their conditions.", "Full öppenhet: incidenten, de tillagda kontrollerna och en plan, och acceptera deras villkor."],
          ["Ask for a short grace period while controls are completed.", "Be om en kort respit medan kontrollerna slutförs."],
          ["Switch traffic to a backup payment provider.", "Flytta trafiken till en reservleverantör för betalningar."]
        ], {
          knowns: [["The fraud rate is above the contractual limit.", "Bedrägerinivån ligger över avtalets gräns."]],
          uncertainties: [["Whether a backup provider would accept you mid-incident.", "Om en reservleverantör skulle ta emot er mitt under en incident."]],
          tradeoffs: {
            operational: ["Losing card payments halts most sales.", "Att förlora kortbetalningar stoppar det mesta av försäljningen."],
            security: ["Switching providers does not remove the cause.", "Att byta leverantör tar inte bort orsaken."],
            legal: ["The merchant agreement sets the terms.", "Handlaravtalet styr villkoren."],
            reputational: ["Providers talk to each other.", "Leverantörer talar med varandra."]
          },
          evaluation: [["Engages the provider as a partner with evidence", "Bemöter leverantören som en partner med underlag"], ["Does not route around the problem", "Försöker inte gå runt problemet"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Cards on the table", "Korten på bordet"], [
              io(["The provider stays", "Leverantören stannar"], ["The provider's risk team says your account is the most complete they have received. Card acceptance stays on while they review it, under their conditions.", "Leverantörens riskteam säger att er redogörelse är den mest fullständiga de har fått. Kortbetalningarna fortsätter medan de granskar den, enligt deras villkor."], ["Card acceptance continues under the provider's review and conditions.", "Kortbetalningarna fortsätter under leverantörens granskning och villkor."]),
              io(["Payouts held back", "Utbetalningar hålls inne"], ["The conditions arrive: a large share of your payouts held for three months as security. Finance says the company cannot carry that cash gap past the end of the month.", "Villkoren kommer: en stor del av era utbetalningar hålls inne i tre månader som säkerhet. Ekonomi säger att företaget inte klarar det glappet i likviditet efter månadsskiftet."], ["The provider's conditions hold back part of your payouts.", "Leverantörens villkor innebär att en del av utbetalningarna hålls inne."], { reopen: true }),
              io(["Passed further up", "Skickas vidare uppåt"], ["The provider says its own rules oblige it to pass your account on to the card networks. It cannot say what they will do with it, or when.", "Leverantören säger att dess egna regler kräver att redogörelsen skickas vidare till kortnätverken. Den kan inte säga vad de gör med den, eller när."], ["The provider has passed your incident account to the card networks.", "Leverantören har skickat er redogörelse vidare till kortnätverken."], { meters: { regulator: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["Holding something back", "Något hålls tillbaka"], [
              io(["A friendly hint", "En vänlig vink"], ["The provider's account manager hints that the deadline is “not carved in stone” if the numbers improve. The room takes it as room to manoeuvre.", "Leverantörens kundansvarige antyder att fristen ”inte är huggen i sten” om siffrorna förbättras. Rummet tolkar det som ett handlingsutrymme."], ["The account manager hinted that the deadline could slip.", "Kundansvarige antydde att fristen kunde flyttas."]),
              io(["They already know", "De vet redan"], ["The provider's risk team asks why you did not mention that access to your accounts is for sale on a forum. They found it themselves. Their trust in what you tell them has dropped.", "Leverantörens riskteam frågar varför ni inte nämnde att åtkomst till era konton säljs på ett forum. De hittade det själva. Deras förtroende för det ni säger har sjunkit."], ["The provider learned of the forum sale before you told them.", "Leverantören fick veta om försäljningen på forumet innan ni berättade."], { reopen: true }),
              io(["The rate dips", "Nivån sjunker"], ["The latest figures show the fraud rate falling slightly, but still well above the limit. Nobody can tell whether the attackers are slowing down or just waiting.", "De senaste siffrorna visar att bedrägerinivån sjunker något, men den ligger fortfarande långt över gränsen. Ingen kan avgöra om angriparna saktar in eller bara väntar."], ["The fraud rate fell slightly but stays above the limit.", "Bedrägerinivån sjönk något men ligger kvar över gränsen."])
            ])
          ],
          pushback: {
            A: [
              pb(["The conditions bite", "Villkoren svider"], ["The provider's conditions arrive: an extra check on every card payment for months, and part of your payouts held back as security. The service owner says that will cost more than this weekend did. Do you still accept them all, or try to negotiate after promising full cooperation?", "Leverantörens villkor kommer: en extra kontroll vid varje kortbetalning i flera månader, och en del av era utbetalningar innehålls som säkerhet. Tjänsteägaren säger att det kommer att kosta mer än den här helgen gjorde. Accepterar ni ändå alla, eller försöker ni förhandla efter att ha lovat fullt samarbete?"]),
              pb(["Legal wants to read it first", "Juristen vill läsa först"], ["Legal warns that a full written account of the incident, handed to a third party, may end up with regulators, insurers or in a dispute. They want to review every line, which takes longer than the provider's deadline. Do you send it unreviewed, or late?", "Juristen varnar för att en fullständig skriftlig redogörelse för incidenten, överlämnad till en tredje part, kan hamna hos myndigheter, försäkringsbolag eller i en tvist. Juristen vill granska varje rad, vilket tar längre tid än leverantörens frist. Skickar ni den ogranskad, eller för sent?"]),
              pb(["Still for sale", "Fortfarande till salu"], ["Full transparency means telling the provider that access to your customers' accounts is still being advertised on a forum. They will ask whether the takeovers have stopped. Can you honestly say yes, and what happens to your plan if you cannot?", "Full öppenhet innebär att berätta för leverantören att åtkomst till era kunders konton fortfarande annonseras på ett forum. De kommer att fråga om kapningarna har upphört. Kan ni ärligt svara ja, och vad händer med er plan om ni inte kan det?"])
            ],
            B: [
              pb(["What will be different?", "Vad blir annorlunda?"], ["The provider asks one question: what will be true at the end of the grace period that is not true now? Without concrete controls and dates, the request sounds like stalling. What exactly are you asking them to wait for?", "Leverantören ställer en fråga: vad kommer att vara sant när respiten är slut som inte är sant nu? Utan konkreta kontroller och datum låter begäran som en förhalning. Exakt vad ber ni dem vänta på?"]),
              pb(["Fraud continues meanwhile", "Bedrägerierna fortsätter under tiden"], ["Every fraudulent order during the grace period pushes your fraud rate higher, not lower, and each one comes back as a dispute you pay for. The longer the respite, the worse your numbers when it ends. Is a delay really in your favour?", "Varje bedräglig beställning under respiten driver upp bedrägerinivån i stället för ner, och var och en kommer tillbaka som ett bestridande som ni betalar. Ju längre respit, desto sämre siffror när den tar slut. Är en fördröjning verkligen till er fördel?"]),
              pb(["The account manager is uneasy", "Kundansvarig är obekväm"], ["The provider's account manager tells your supplier manager privately that asking for time while your accounts are on sale on a forum makes the risk team nervous. “They talk to other providers.” Do you change your approach before the request goes in?", "Leverantörens kundansvarige säger i förtroende till er leverantörsansvarige att det gör riskteamet nervöst när ni ber om tid medan era konton säljs på ett forum. ”De pratar med andra leverantörer.” Ändrar ni ert upplägg innan begäran skickas?"])
            ],
            C: [
              pb(["The backup asks the question", "Reserven ställer frågan"], ["The backup provider's onboarding form asks directly whether you are currently under a fraud review by another provider. Answering yes may mean a refusal; answering no is a lie in writing. What do you put in the box?", "Reservleverantörens anslutningsformulär frågar rakt ut om ni just nu granskas för bedrägerier av en annan leverantör. Att svara ja kan betyda nej; att svara nej är en skriftlig lögn. Vad skriver ni i rutan?"]),
              pb(["Stored cards do not move", "Sparade kort följer inte med"], ["Your customers' saved cards are stored with the current provider and cannot be moved. After the switch, every returning customer must type their card again, and the backup integration has never run at this volume. Is this really faster than fixing the problem?", "Kundernas sparade kort ligger hos den nuvarande leverantören och kan inte flyttas. Efter bytet måste varje återkommande kund skriva in sitt kort igen, och reservkopplingen har aldrig körts i den här volymen. Är det verkligen snabbare än att lösa problemet?"]),
              pb(["A breach of the agreement?", "Ett avtalsbrott?"], ["Your supplier manager finds a clause: moving card traffic away while under review may itself breach the merchant agreement, with penalties. The current provider will see the traffic drop within hours. Do you go ahead and risk losing them for good?", "Er leverantörsansvarige hittar en klausul: att flytta korttrafiken under en pågående granskning kan i sig bryta mot handlaravtalet, med vite. Den nuvarande leverantören ser trafiken minska inom några timmar. Går ni vidare och riskerar att förlora dem för gott?"])
            ]
          }
        }),
        facilitator: fac(
          ["Decision authority has moved outside the company. A good moment to discuss third-party dependencies.", "Beslutsmandatet har flyttat utanför företaget. Ett bra tillfälle att diskutera beroenden av tredje part."],
          ["A transparent, evidence-based conversation with the provider and a credible control plan.", "Ett öppet samtal med leverantören grundat på underlag och en trovärdig plan för kontroller."],
          [["Ask: what does the provider need to believe to let you open?", "Fråga: vad behöver leverantören tro för att låta er öppna?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 2700,
        title: L(["Victims twice over", "Drabbade två gånger"]),
        twist: L(["Your customers' passwords leaked elsewhere first — they are victims twice, and many reuse the same password everywhere.", "Kundernas lösenord läckte först någon annanstans – de är drabbade två gånger, och många använder samma lösenord överallt."]),
        twistKind: "impact",
        reconsider: { decision: "d4", pressure: { en: "Your customers were victims twice. If you forced a reset for everyone, a third of them could not shop all weekend. If you locked only suspicious accounts, some takeovers were missed. Do you stand by it?", sv: "Era kunder drabbades två gånger. Om ni tvingade fram ett lösenordsbyte för alla kunde en tredjedel av dem inte handla på hela helgen. Om ni bara låste misstänkta konton missades några kapningar. Står ni fast vid det?" } },
        assumptionChallenged: L(["Fixing our own login ends the customers' exposure.", "När vi har rättat vår egen inloggning är kunderna inte längre exponerade."]),
        narrative: L([
          "Sunday, {{time.T+2700|clock}}. The attack has stopped, and the shop is running normally again.\n\nThe communications team is drafting Monday's message to all customers. The forensic team has a clear answer about where the passwords came from, and the question is how much of that answer to share, and how to say it without blaming customers.",
          "Söndag, klockan {{time.T+2700|clock}}. Attacken har upphört och butiken fungerar normalt igen.\n\nKommunikationsavdelningen skriver måndagens budskap till alla kunder. Forensikteamet har ett tydligt svar på varifrån lösenorden kom, och frågan är hur mycket av det svaret ni ska dela, och hur ni säger det utan att skylla på kunderna."
        ]),
        injects: [
          inj("i7-1", 2700, "forensicFinding", "forensics", "medium", "confirmed", [
            "Nearly all successful logins used email–password pairs from a public breach at another company two years ago. Your own systems did not leak passwords.",
            "Nästan alla lyckade inloggningar använde kombinationer av e-post och lösenord från ett offentligt dataintrång hos ett annat företag för två år sedan. Era egna system har inte läckt lösenord."
          ], { tests: ["lo4"] }),
          inj("i7-2", 2730, "mediaEnquiry", "media", "medium", "confirmed", [
            "A consumer journalist: “Is it true your shop leaked customer passwords? Readers are asking whether to change them.”",
            "En konsumentjournalist: ”Stämmer det att er butik har läckt kundernas lösenord? Läsarna undrar om de ska byta.”"
          ], { optional: true, pressure: "media", tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which controls would make reused passwords useless against you?", "Vilka kontroller skulle göra återanvända lösenord verkningslösa mot er?", ["ciso", "socLead"]),
            q("How will you detect the next low-and-slow login campaign?", "Hur ska ni upptäcka nästa långsamma inloggningskampanj?", ["socLead", "networkLead"]),
            q("With hindsight, how should the first-evening response have been split between DDoS and monitoring?", "Med facit i hand – hur borde första kvällens arbete ha fördelats mellan överbelastning och övervakning?", ["incidentCommander"], "d1")
          ],
          executive: [
            q("How do you explain “not our leak, but our responsibility” to customers?", "Hur förklarar ni ”inte vår läcka, men vårt ansvar” för kunderna?", ["comms", "ceo"]),
            q("Do you offer customers stronger sign-in options, or require them?", "Erbjuder ni kunderna starkare inloggning eller kräver ni det?", ["ceo", "serviceOwner"]),
            q("What would you tell the board you got right and wrong this weekend?", "Vad skulle ni säga till styrelsen att ni gjorde rätt och fel i helgen?", ["ceo"], true)
          ]
        },
        challenges: [ch("Blaming another company's breach sounds like an excuse, even when it is true.", "Att skylla på ett annat företags dataintrång låter som en ursäkt, även när det är sant.")],
        decision: dec("d7", "ceo", ["What do you change for customer sign-in?", "Vad ändrar ni för kundernas inloggning?"], [
          ["Require two-step sign-in for accounts with stored cards.", "Kräv tvåstegsinloggning för konton med sparade kort."],
          ["Offer two-step sign-in and check passwords against known breaches.", "Erbjud tvåstegsinloggning och kontrollera lösenord mot kända dataintrång."],
          ["Keep sign-in as it is and rely on fraud monitoring.", "Behåll inloggningen som den är och lita på bedrägeribevakningen."]
        ], {
          knowns: [["The passwords came from another company's breach.", "Lösenorden kom från ett annat företags dataintrång."]],
          uncertainties: [["How customers will react to more friction.", "Hur kunderna reagerar på mer friktion."]],
          tradeoffs: {
            operational: ["Stronger sign-in adds support calls.", "Starkare inloggning ger fler supportsamtal."],
            security: ["Breached-password checks stop most stuffing.", "Kontroll mot läckta lösenord stoppar det mesta av kontokapningen."],
            legal: ["Payment rules increasingly expect strong authentication.", "Betalregler förväntar sig i allt högre grad stark autentisering."],
            reputational: ["Visible protection rebuilds trust.", "Synligt skydd bygger upp förtroendet igen."]
          },
          evaluation: [["Turns the lesson into a lasting control", "Omsätter lärdomen i en bestående kontroll"], ["Communicates honestly without blame-shifting", "Kommunicerar ärligt utan att skjuta över skulden"]],
          interrupts: [
            ir("i1", { chosen: "C" }, ["Sign-in unchanged", "Inloggningen är oförändrad"], [
              io(["A quiet week", "En lugn vecka"], ["The first week after the decision passes without any new wave of takeovers. Fraud monitoring reports nothing unusual, and the decision starts to look sensible.", "Den första veckan efter beslutet går utan någon ny våg av kapningar. Bedrägeribevakningen rapporterar inget ovanligt, och beslutet börjar se klokt ut."], ["The week after brought no new wave of takeovers.", "Veckan efter kom ingen ny våg av kapningar."]),
              io(["The provider says no", "Leverantören säger nej"], ["The payment provider's risk team replies that “no change” is not a control. Unless you show something new, they will review card acceptance again at the end of the month.", "Betalleverantörens riskteam svarar att ”ingen förändring” inte är någon kontroll. Om ni inte visar något nytt granskar de kortbetalningarna igen vid månadsskiftet."], ["The payment provider rejected unchanged sign-in as a control.", "Betalleverantören underkände oförändrad inloggning som kontroll."], { reopen: true }),
              io(["Customers act alone", "Kunderna agerar själva"], ["Many customers change their passwords after the news. Nobody knows how many simply switched to another password they already use elsewhere.", "Många kunder byter lösenord efter nyheterna. Ingen vet hur många som bara tog ett annat lösenord som de redan använder på andra ställen."], ["Many customers changed passwords; nobody knows how many reused old ones.", "Många kunder bytte lösenord; ingen vet hur många som återanvände gamla."])
            ]),
            ir("i2", { notChosen: "C" }, ["New sign-in rules", "Nya inloggningsregler"], [
              io(["Leaked passwords stopped", "Läckta lösenord stoppas"], ["On the first day, the new controls stop a batch of sign-ins that used passwords known to have leaked. The CISO shares the figure with the board the same evening.", "Första dagen stoppar de nya kontrollerna ett antal inloggningar med lösenord som är kända för att ha läckt. Säkerhetschefen delar siffran med styrelsen samma kväll."], ["The new controls blocked sign-ins with leaked passwords on day one.", "De nya kontrollerna stoppade inloggningar med läckta lösenord första dagen."]),
              io(["Support overwhelmed", "Supporten översvämmas"], ["Customers get stuck at the new checks in the middle of a purchase, and sign-in calls triple. The service owner asks for the change to be rolled back before the next campaign.", "Kunder fastnar i de nya kontrollerna mitt i ett köp, och samtalen om inloggning tredubblas. Tjänsteägaren vill att ändringen rullas tillbaka före nästa kampanj."], ["Sign-in support calls tripled after the change.", "Supportsamtalen om inloggning tredubblades efter ändringen."], { reopen: true, meters: { trust: -1 } }),
              io(["Mixed figures", "Blandade siffror"], ["The first figures show fewer suspicious sign-ins, but also fewer sign-ins overall. Nobody can say whether it is the attackers or the customers who have moved on.", "De första siffrorna visar färre misstänkta inloggningar, men också färre inloggningar totalt. Ingen kan säga om det är angriparna eller kunderna som har gått vidare."], ["Sign-ins fell after the change; nobody knows whose.", "Inloggningarna minskade efter ändringen; ingen vet vems."])
            ])
          ],
          pushback: {
            A: [
              pb(["Customers delete their cards", "Kunderna tar bort sina kort"], ["In the first days of the new rule, many customers remove their saved card rather than set up a second step, and some stop coming back. The service owner says the rule is driving away the loyal customers it was meant to protect. Do you hold the line?", "Under de första dagarna med den nya regeln tar många kunder bort sitt sparade kort hellre än att ställa in ett andra steg, och en del slutar komma tillbaka. Tjänsteägaren säger att regeln driver bort de trogna kunder den skulle skydda. Står ni fast?"]),
              pb(["Codes to the wrong place", "Koder till fel ställe"], ["The second step sends a code to the contact details on the account. On accounts that were taken over, those details may still be the attacker's. Turning on two-step there locks the attacker in, not out. How do you verify the owner before you enrol anyone?", "Det andra steget skickar en kod till kontaktuppgifterna på kontot. På kapade konton kan uppgifterna fortfarande vara angriparens. Att slå på tvåstegsinloggning där låser in angriparen, inte ute. Hur kontrollerar ni ägaren innan ni registrerar någon?"]),
              pb(["Points stay unprotected", "Poängen förblir oskyddade"], ["The rule covers only accounts with stored cards. Accounts without cards but full of loyalty points, the ones that were also emptied this weekend, keep the old sign-in. Is a rule based on cards protecting what the attackers actually took?", "Regeln gäller bara konton med sparade kort. Konton utan kort men med mycket bonuspoäng, sådana som också tömdes i helgen, behåller den gamla inloggningen. Skyddar en regel som bygger på kort det som angriparna faktiskt tog?"])
            ],
            B: [
              pb(["Almost nobody opts in", "Nästan ingen väljer det"], ["A week after launch, only a small share of customers have turned on two-step sign-in, and they are mostly the ones who were least at risk. The reused passwords are still out there. Is offering protection the same as providing it?", "En vecka efter lanseringen har bara en liten andel av kunderna slagit på tvåstegsinloggning, och det är mest de som löpte minst risk. De återanvända lösenorden finns fortfarande där ute. Är det samma sak att erbjuda skydd som att ge det?"]),
              pb(["The check flags thousands", "Kontrollen flaggar tusentals"], ["On the first morning, the breached-password check stops a large share of customers at sign-in and forces a password change in the middle of their purchase. Customer service is overwhelmed again. Do you soften the check, or ride out the complaints?", "Första morgonen stoppar kontrollen mot läckta lösenord en stor andel av kunderna vid inloggningen och tvingar fram ett lösenordsbyte mitt i köpet. Kundtjänst är överbelastad igen. Mildrar ni kontrollen, eller tar ni klagomålen?"]),
              pb(["The provider expected more", "Leverantören väntade sig mer"], ["The payment provider reads your plan and notes that two-step sign-in is optional. Its risk team expects strong authentication for stored cards, not an offer. Do you go back and make it mandatory, or argue that offering is enough?", "Betalleverantören läser er plan och noterar att tvåstegsinloggningen är frivillig. Dess riskteam förväntar sig stark autentisering för sparade kort, inte ett erbjudande. Går ni tillbaka och gör den obligatorisk, eller argumenterar ni för att erbjudandet räcker?"])
            ],
            C: [
              pb(["The monitoring missed it", "Bevakningen missade det"], ["Your fraud monitoring did not flag the weekend's orders; customers noticed first, by calling. The control you are relying on is the one that failed. What makes you confident it will catch the next campaign?", "Er bedrägeribevakning flaggade inte helgens beställningar; kunderna märkte det först, genom att ringa. Kontrollen ni förlitar er på är den som brast. Vad gör er säkra på att den fångar nästa kampanj?"]),
              pb(["Not what the provider accepted", "Inte vad leverantören godtog"], ["Card acceptance continues only under the provider's conditions, and they asked to see effective controls. “Same sign-in, same monitoring” is not a new control. What do you show them when they follow up?", "Kortbetalningarna fortsätter bara enligt leverantörens villkor, och de bad att få se fungerande kontroller. ”Samma inloggning, samma bevakning” är ingen ny kontroll. Vad visar ni dem när de följer upp?"]),
              pb(["“What did you change?”", "”Vad har ni ändrat?”"], ["The consumer journalist asks what you have changed so that readers are safe shopping with you now. The honest answer is: nothing. Can you say that on the record, and how will customers hear it?", "Konsumentjournalisten frågar vad ni har ändrat så att läsarna kan handla tryggt hos er nu. Det ärliga svaret är: ingenting. Kan ni säga det offentligt, och hur kommer kunderna att uppfatta det?"])
            ]
          }
        }),
        facilitator: fac(
          ["End on prevention and honest communication.", "Avsluta med förebyggande arbete och ärlig kommunikation."],
          ["Breached-password checks, stronger sign-in for stored cards, and a clear, honest customer message.", "Kontroll mot läckta lösenord, starkare inloggning för sparade kort och ett tydligt, ärligt budskap till kunderna."],
          [["Ask: which of these controls existed on Friday?", "Fråga: vilka av de här kontrollerna fanns i fredags?"]]
        )
      }
    ],

    resolution: {
      type: "resolved",
      text: L([
        "The attack stops on Sunday. Customers are refunded, card acceptance continues under the provider's conditions, and stronger sign-in is rolled out — but the weekend's sales are gone.",
        "Attacken upphör på söndagen. Kunderna får ersättning, kortbetalningarna fortsätter enligt leverantörens villkor och starkare inloggning införs – men helgens försäljning är förlorad."
      ])
    },

    debrief: {
      keyLessons: [
        L(["A loud incident is the best cover for a quiet one; assign someone to watch everything else.", "En högljudd incident är det bästa skyddet för en tyst; utse någon som bevakar allt annat."]),
        L(["DDoS readiness includes contracts, approvals and named decision-makers, not just technology.", "Beredskap mot överbelastning omfattar avtal, godkännanden och utsedda beslutsfattare, inte bara teknik."]),
        L(["Credential stuffing is stopped by breached-password checks, rate limits and stronger sign-in.", "Kontokapning stoppas med kontroll mot läckta lösenord, spärrar och starkare inloggning."]),
        L(["Third parties such as payment providers can take decisions out of your hands.", "Tredje parter som betalleverantörer kan ta besluten ur era händer."])
      ],
      assumptionsVsReality: [
        avr(["Scrubbing will end it.", "Rensning gör slut på det."], ["The attack moved to the application layer.", "Angreppet flyttade till applikationsnivån."], "p2"),
        avr(["It is an availability incident.", "Det är en tillgänglighetsincident."], ["It was cover for account takeover.", "Det var en rökridå för kontokapning."], "p4"),
        avr(["Stolen accounts only leak data.", "Stulna konton läcker bara uppgifter."], ["Stored cards and points were spent.", "Sparade kort och poäng användes."], "p5"),
        avr(["We decide when to reopen.", "Vi bestämmer när vi öppnar igen."], ["The payment provider decided.", "Betalleverantören bestämde."], "p6")
      ],
      strengthsToLookFor: [
        L(["Fast approval of mitigation spend", "Snabbt godkännande av kostnader för skydd"]),
        L(["Someone explicitly watching beyond the obvious", "Någon som uttryckligen bevakar bortom det uppenbara"]),
        L(["Customer-first refunds", "Återbetalningar med kunden i fokus"])
      ],
      commonGaps: [
        L(["Everyone watching the bandwidth graph", "Alla tittar på bandbreddsgrafen"]),
        L(["No pre-agreed authority for emergency spend", "Inget i förväg överenskommet mandat för akuta kostnader"]),
        L(["No alerts when account contact details change", "Inga varningar när kontaktuppgifter på konton ändras"])
      ],
      suggestedActions: [
        act(["Agree DDoS scrubbing capacity and emergency approval in the ISP contract.", "Avtala om rensningskapacitet och akut godkännande i operatörsavtalet."], "networkLead", "high"),
        act(["Check customer passwords against known breaches and rate-limit logins per account.", "Kontrollera kundernas lösenord mot kända dataintrång och begränsa inloggningsförsök per konto."], "ciso", "high"),
        act(["Alert customers and the SOC when contact or delivery details change.", "Varna kunder och SOC när kontakt- eller leveransuppgifter ändras."], "socLead", "high"),
        act(["Name who can approve emergency spend out of hours.", "Utse vem som kan godkänna akuta kostnader utanför kontorstid."], "ceo", "medium"),
        act(["Rehearse with the payment provider how incidents are handled.", "Öva med betalleverantören hur incidenter hanteras."], "supplierManager", "medium")
      ]
    }
  });
})();
