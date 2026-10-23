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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
          evaluation: [["Has a named person who can approve emergency spend", "Har en utsedd person som kan godkänna akuta kostnader"], ["Keeps someone on security monitoring beyond the DDoS", "Låter någon bevaka säkerheten bortom överbelastningen"]]
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
          evaluation: [["Questions why login is targeted", "Ifrågasätter varför inloggningen är målet"], ["Prefers targeted controls over raw capacity", "Föredrar riktade åtgärder framför ren kapacitet"]]
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
          evaluation: [["Decides on principles, not panic", "Beslutar utifrån principer, inte panik"], ["Keeps the security team looking beyond the obvious", "Låter säkerhetsteamet titta bortom det uppenbara"]]
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
          minutes: 10
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
          evaluation: [["Puts the affected customer first", "Sätter den drabbade kunden först"], ["Stops shipments before refunds", "Stoppar försändelser före återbetalningar"]]
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
          evaluation: [["Engages the provider as a partner with evidence", "Bemöter leverantören som en partner med underlag"], ["Does not route around the problem", "Försöker inte gå runt problemet"]]
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
          evaluation: [["Turns the lesson into a lasting control", "Omsätter lärdomen i en bestående kontroll"], ["Communicates honestly without blame-shifting", "Kommunicerar ärligt utan att skjuta över skulden"]]
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
