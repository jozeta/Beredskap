/*
 * s25-certificate-expiry.js — "Midnight, Everything Expires" (archetype C, certificates / PKI).
 *
 * At midnight every internal connection fails at once and it looks like an
 * attack → it is the internal intermediate certificate, expired, owned by
 * nobody → renewing it needs the offline root and two people who are away →
 * the "temporary" workaround switched off certificate checking, and a real
 * attacker uses it with a fake "install this certificate" message → a
 * partner suspends a connection over the disabled checks → who owns
 * certificates from now on.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s25-certificate-expiry",
    version: 1,
    category: "certificate-expiry",
    archetype: "benign-lookalike",
    emblem: "certificate",
    title: L(["Midnight, Everything Expires", "Vid midnatt går allt ut"]),
    summary: L([
      "At midnight every internal system stops trusting every other. It looks like a coordinated attack. It is a date nobody wrote down, and an attacker is about to take advantage of it.",
      "Vid midnatt slutar varje internt system lita på alla andra. Det ser ut som ett samordnat angrepp. Det är ett datum som ingen skrev upp, och en angripare är på väg att utnyttja det."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Tell an operational fault from an attack before acting", "Skilja ett driftfel från ett angrepp innan ni agerar"]), teaser: L(["Understanding before acting", "Att förstå innan man agerar"]) },
      { id: "lo2", text: L(["Recover trust infrastructure safely under time pressure", "Återställa förtroendeinfrastruktur på ett säkert sätt under tidspress"]), teaser: L(["Repairing the foundations under time pressure", "Att laga grunden under tidspress"]) },
      { id: "lo3", text: L(["Avoid workarounds that remove security controls", "Undvika nödlösningar som tar bort säkerhetskontroller"]), teaser: L(["The cost of shortcuts", "Priset för genvägar"]) },
      { id: "lo4", text: L(["Give certificates and keys an owner", "Ge certifikat och nycklar en ägare"]), teaser: L(["Who looks after the things nobody sees", "Vem som tar hand om det ingen ser"]) }
    ],
    mitre: ["T1557", "T1566", "T1204", "T1553"],
    frameworks: {
      nistCsf: ["ID.AM", "PR.DS", "PR.PS", "DE.AE", "RS.AN", "RS.MI", "RC.RP"],
      iso27001: ["A.5.9", "A.5.24", "A.5.29", "A.8.9", "A.8.24", "A.8.32", "A.6.3"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "night", startTime: "00:00" },
    actor: { types: ["criminal"], motivation: L(["Opportunistic: exploiting the confusion with fake fix instructions", "Opportunistisk: utnyttjar förvirringen med falska instruktioner för att lösa problemet"]), capability: "low" },
    variables: {
      systems: { min: 40, max: 900, scaleBy: "size" },
      bypassed: { min: 8, max: 120, scaleBy: "size" },
      installs: { min: 5, max: 140, scaleBy: "size" }
    },
    roles: ["incidentCommander", "itOps", "networkLead", "ciso", "socLead", "cio", "serviceOwner", "comms", "supplierManager", "devLead", "ceo"],

    groundTruth: {
      rootCause: L([
        "The internal intermediate certificate authority's certificate expired at midnight. It had been issued five years earlier by an engineer who later left, and was in no inventory. Overnight, teams switched off certificate checking on several integrations to restore service. In the morning an opportunistic attacker sent staff a fake IT message with a “fix” that installed their own root certificate, and one integration with checking disabled sent data to a look-alike host.",
        "Certifikatet för den interna mellanliggande certifikatutfärdaren gick ut vid midnatt. Det hade utfärdats fem år tidigare av en tekniker som senare slutade, och fanns inte i någon förteckning. Under natten stängde team av certifikatkontrollen i flera integrationer för att få igång tjänsterna. På morgonen skickade en opportunistisk angripare ett falskt IT-meddelande till personalen med en ”lösning” som installerade angriparens eget rotcertifikat, och en integration utan kontroll skickade data till en efterliknande värd."
      ]),
      attackerTimeline: [
        { at: -2628000, text: L(["Intermediate certificate issued with a five-year lifetime.", "Mellanliggande certifikat utfärdas med en livslängd på fem år."]) },
        { at: 0, text: L(["The certificate expires.", "Certifikatet går ut."]) },
        { at: 300, text: L(["Certificate checking switched off on integrations as a workaround.", "Certifikatkontrollen stängs av i integrationer som nödlösning."]) },
        { at: 420, text: L(["Fake “IT notice” with a certificate installer sent to staff.", "Falskt ”IT-meddelande” med ett certifikatinstallationsprogram skickas till personalen."]) },
        { at: 470, text: L(["An integration without checking connects to a look-alike host.", "En integration utan kontroll ansluter till en efterliknande värd."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-expiry", revealStage: "p2", text: L(["The internal intermediate certificate expired at midnight and was in no inventory.", "Det interna mellanliggande certifikatet gick ut vid midnatt och fanns inte i någon förteckning."]) },
      { id: "hf-root", revealStage: "p3", text: L(["Only two people know how to unlock the offline root, and both are away.", "Bara två personer vet hur den frånkopplade roten låses upp, och båda är bortresta."]) },
      { id: "hf-workaround", revealStage: "p4", text: L(["The overnight workaround removed certificate checking, and an attacker used both that and a fake certificate installer.", "Nattens nödlösning tog bort certifikatkontrollen, och en angripare utnyttjade både den och ett falskt installationsprogram för certifikat."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Midnight", "Midnatt"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+5|clock}}. Five minutes after midnight, alarms fire across {{org.name}}: internal systems refuse to talk to each other, the VPN rejects every connection, and integrations with partners fail. All at once.\n\nThe night shift cannot log in to anything. Everything broke in the same second, across the whole company, which makes it look very much like a coordinated attack.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+5|clock}}. Fem minuter efter midnatt larmar det över hela {{org.name}}: interna system vägrar prata med varandra, vpn:et avvisar varje anslutning och integrationer med partner slutar fungera. Allt på en gång.\n\nNattskiftet kan inte logga in någonstans. Allt gick sönder i samma sekund, i hela företaget, vilket får det att se mycket ut som ett samordnat angrepp."
        ]),
        injects: [
          inj("i1-1", 5, "siemAlert", "siem", "critical", "confirmed", [
            "Spike in failed secure connections across {{num.systems}} internal systems: “certificate not trusted”. Started 00:00:01.",
            "Topp i misslyckade säkra anslutningar över {{num.systems}} interna system: ”certifikatet är inte betrott”. Började 00.00.01."
          ], { tests: ["lo1"] }),
          inj("i1-2", 15, "ticket", "serviceDesk", "high", "confirmed", [
            "Night shift cannot log in to anything. Partners report our API is down.",
            "Nattskiftet kan inte logga in i någonting. Partner rapporterar att vårt API ligger nere."
          ], { tests: ["lo1"] }),
          inj("i1-3", 20, "chat", "person.socLead", "high", "misleading", [
            "“Everything breaking at exactly midnight across the whole estate? That's coordinated. I think someone is attacking our PKI.”",
            "”Allt går sönder exakt vid midnatt över hela miljön? Det är samordnat. Jag tror att någon angriper vår PKI.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Reasonable instinct; exact timing at midnight is more typical of an expiry than an attack.", "En rimlig instinkt; exakt tidpunkt vid midnatt är mer typiskt för ett utgånget certifikat än för ett angrepp."], tests: ["lo1"] })
        ],
        charts: [{
          id: "c1-fail", type: "line",
          title: L(["Failed secure connections", "Misslyckade säkra anslutningar"]), unit: L(["per minute", "per minut"]),
          caption: L(["Minutes around midnight.", "Minuter kring midnatt."]),
          data: line(["Failures", "Fel"], -30, 30, 5, (x, ctx) => (x < 0 ? 3 : ctx.vars.systems * 12))
        }],
        questions: {
          technical: [
            q("What fails at exactly midnight that an attacker wouldn't need to time?", "Vad slutar fungera exakt vid midnatt som en angripare inte skulle behöva tajma?", ["itOps", "networkLead"]),
            q("Where do you look first: the certificates, or the logs?", "Var tittar ni först: på certifikaten, eller i loggarna?", ["networkLead", "socLead"]),
            q("Who knows how your internal certificate authority is built?", "Vem vet hur er interna certifikatutfärdare är uppbyggd?", ["itOps"])
          ],
          executive: [
            q("Do you call this a cyber incident yet?", "Kallar ni det här en cyberincident ännu?", ["incidentCommander", "ciso"]),
            q("What does it cost to cut external connections if it is an attack?", "Vad kostar det att kapa externa förbindelser om det är ett angrepp?", ["cio", "serviceOwner"]),
            q("Who wakes the right people at this hour?", "Vem väcker rätt personer vid den här tiden?", ["incidentCommander"])
          ]
        },
        challenges: [ch("The night on-call engineer has never touched the certificate authority.", "Nattens beredskapstekniker har aldrig rört certifikatutfärdaren.")],
        decision: dec("d1", "incidentCommander", ["What is your first move?", "Vad är ert första drag?"], [
          ["Check certificate validity across the chain before treating it as an attack.", "Kontrollera certifikatens giltighet i hela kedjan innan det behandlas som ett angrepp."],
          ["Declare a cyber attack and cut all external connections.", "Utlys ett cyberangrepp och kapa alla externa förbindelser."],
          ["Let the on-call engineer stabilise what they can, and wake nobody else until you know what this is.", "Låt jourteknikern stabilisera det som går, och väck ingen annan förrän ni vet vad det här är."]
        ], {
          knowns: [["Everything failed at once at midnight with trust errors.", "Allt fallerade samtidigt vid midnatt med förtroendefel."]],
          uncertainties: [["Whether anything malicious is involved.", "Om något skadligt är inblandat."]],
          tradeoffs: {
            operational: ["Cutting connections makes the outage worse if it is a fault.", "Att kapa förbindelser förvärrar avbrottet om det är ett fel."],
            security: ["Assuming a fault too quickly could miss an attack.", "Att för snabbt anta ett fel kan missa ett angrepp."],
            legal: ["Declaring an attack starts reporting obligations.", "Att utlysa ett angrepp startar rapporteringsskyldigheter."],
            reputational: ["Partners are already noticing.", "Partnerna märker det redan."]
          },
          evaluation: [["Tests the simplest explanation before the dramatic one", "Prövar den enklaste förklaringen före den dramatiska"]],
          pushback: {
            A: [
              pb(["The SOC lead objects", "SOC-chefen invänder"], ["{{person.socLead.name}} insists that checking certificates one by one while a possible attacker is inside wastes the hour that matters most, and wants the objection logged. Do you keep checking, or escalate in parallel and accept the cost?", "{{person.socLead.name}} hävdar att det slösar bort den viktigaste timmen att gå igenom certifikat ett i taget medan en möjlig angripare är inne, och vill att invändningen förs till protokollet. Fortsätter ni kontrollera, eller trappar ni upp parallellt och tar kostnaden?"]),
              pb(["Nobody knows the chain", "Ingen kan kedjan"], ["The on-call engineer has never opened the certificate authority and cannot find any map of which certificates hang off which chain. Checking “the whole chain” could take hours. How long do you give the check before you change course?", "Jourteknikern har aldrig öppnat certifikatutfärdaren och hittar ingen karta över vilka certifikat som hänger på vilken kedja. Att kontrollera ”hela kedjan” kan ta timmar. Hur länge får kontrollen pågå innan ni byter spår?"]),
              pb(["Partners want an answer", "Partnerna vill ha svar"], ["Two partners whose integrations failed have already asked whether you have been breached. “We are still checking” is not an answer they will accept for long. What do you tell them while you check, and who says it?", "Två partner vars integrationer slutat fungera har redan frågat om ni har blivit utsatta för intrång. ”Vi kontrollerar fortfarande” är inget svar de nöjer sig med länge. Vad säger ni till dem medan ni kontrollerar, och vem säger det?"])
            ],
            B: [
              pb(["Nothing changed inside", "Ingenting ändrades inuti"], ["Half an hour after the cut, the internal failures look exactly the same: systems inside the network still refuse each other, with no outside traffic at all. If an outside attacker were driving this, cutting them off should have changed something. Do you reconnect, or keep everything cut?", "En halvtimme efter avkopplingen ser de interna felen exakt likadana ut: system inne i nätet vägrar fortfarande varandra, helt utan extern trafik. Om en angripare utifrån låg bakom borde avkopplingen ha ändrat något. Kopplar ni upp igen, eller håller ni allt avkopplat?"]),
              pb(["Your own experts locked out", "Era egna experter utelåsta"], ["Cutting every external connection also locked out the specialists who would connect from home to investigate. Nobody on site understands the certificate setup. Do you open a way in for them, in the middle of what you have just called an attack?", "När varje extern förbindelse kapades låstes också de specialister ute som skulle ha kopplat upp sig hemifrån för att utreda. Ingen på plats förstår certifikatmiljön. Öppnar ni en väg in för dem, mitt i det ni nyss kallade ett angrepp?"]),
              pb(["A report with no attacker", "En rapport utan angripare"], ["Declaring an attack starts the reporting process, and the duty officer asks whether to send an early warning to the authorities tonight. You have a pattern, but no indicator of an attacker. Do you report an attack you cannot yet describe?", "Att utlysa ett angrepp startar rapporteringen, och tjänstgörande ansvarig frågar om en tidig varning ska skickas till myndigheterna i natt. Ni har ett mönster, men inga tecken på en angripare. Rapporterar ni ett angrepp som ni ännu inte kan beskriva?"])
            ],
            C: [
              pb(["Out of their depth", "På för djupt vatten"], ["The on-call engineer has restarted three servers and nothing changed. They message that they do not know what to try next and ask who else they should call. Do you wake someone now, and admit that waiting was the wrong call?", "Jourteknikern har startat om tre servrar utan att något ändrats. Hen skriver att hen inte vet vad nästa steg är och frågar vem mer hen ska ringa. Väcker ni någon nu, och medger att det var fel att vänta?"]),
              pb(["The CIO hears it elsewhere", "It-chefen får höra det på annat håll"], ["{{person.cio.name}} learns about the outage from a partner's angry message, not from you, and asks why nobody was woken when the whole company stopped. Who decided waiting was acceptable, and on what grounds?", "{{person.cio.name}} får veta om avbrottet genom ett argt meddelande från en partner, inte från er, och frågar varför ingen väcktes när hela företaget stannade. Vem beslutade att det var godtagbart att vänta, och på vilka grunder?"]),
              pb(["If it is an attack", "Om det är ett angrepp"], ["Everything failed company-wide in the same second. If this is an attack after all, the attacker gets the whole night while the crisis team sleeps and one engineer restarts servers. How sure are you that it is not, and what is that certainty based on?", "Allt slutade fungera i hela företaget i samma sekund. Om det trots allt är ett angrepp får angriparen hela natten medan krisledningen sover och en tekniker startar om servrar. Hur säkra är ni på att det inte är det, och vad bygger den säkerheten på?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Checking the chain", "Kontrollen av kedjan"], [
              io(["A lead, not an answer", "Ett spår, inte ett svar"], ["Twenty minutes in, the on-call engineer finds one server whose chain of trust shows an error, but cannot yet tell what it means or whether the others look the same. It is a lead, not an answer.", "Efter tjugo minuter hittar jourteknikern en server vars förtroendekedja visar ett fel, men kan ännu inte säga vad det betyder eller om de andra ser likadana ut. Det är ett spår, inte ett svar."], ["One server's chain shows an error nobody can interpret yet.", "En servers kedja visar ett fel som ingen kan tolka ännu."]),
              io(["The console is locked too", "Konsolen är också låst"], ["The certificate authority's own admin console rejects the on-call engineer's login with the same trust error. Nobody can check the chain from the inside without another way in, so the way you check has to change.", "Certifikatutfärdarens egen administrationskonsol avvisar jourteknikerns inloggning med samma förtroendefel. Ingen kan kontrollera kedjan inifrån utan en annan väg in, så sättet ni kontrollerar på måste ändras."], ["The certificate admin console rejected logins during the first check.", "Certifikatkonsolen avvisade inloggningar under den första kontrollen."], { reopen: true }),
              io(["A partner goes public", "En partner går ut offentligt"], ["While you check, with nothing yet to tell anyone, a partner's public status page says the fault is “on the {{org.name}} side” and points customers to you. The first question from a journalist lands in the shared inbox.", "Medan ni kontrollerar, utan något att säga ännu, skriver en partner på sin publika driftstatussida att felet ligger ”hos {{org.name}}” och hänvisar kunderna till er. Den första frågan från en journalist landar i den gemensamma inkorgen."], ["A partner has publicly placed the outage with you.", "En partner har offentligt lagt avbrottet hos er."], { meters: { media: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["Nobody looked at the certificates", "Ingen tittade på certifikaten"], [
              io(["No attacker traffic", "Ingen angripartrafik"], ["The SOC sweeps an hour of firewall logs and finds no unusual inbound traffic at all. Either there is no attacker, or a very quiet one. The certificates themselves have still not been opened.", "SOC går igenom en timmes brandväggsloggar och hittar ingen ovanlig inkommande trafik alls. Antingen finns ingen angripare, eller en mycket tyst. Själva certifikaten har fortfarande ingen öppnat."], ["An hour of firewall logs showed no unusual inbound traffic.", "En timmes brandväggsloggar visade ingen ovanlig inkommande trafik."]),
              io(["A question nobody asked", "En fråga ingen ställde"], ["{{person.networkLead.name}}, woken by the alarms, calls in and asks one thing: has anyone actually opened a failing certificate and read it? Nobody has. Your first move rests on a guess.", "{{person.networkLead.name}}, väckt av larmen, ringer in och frågar en sak: har någon faktiskt öppnat ett av certifikaten som fallerar och läst det? Ingen har det. Ert första drag vilar på en gissning."], ["Nobody had examined a certificate when the first move was made.", "Ingen hade granskat något certifikat när det första draget gjordes."], { reopen: true }),
              io(["The partner wants an answer", "Partnern vill ha svar"], ["A partner's duty manager calls: their systems see yours rejecting every connection, and they want to know within the hour whether you have been compromised. All you have to offer is what you assumed.", "En partners jourhavande chef ringer: deras system ser hur era avvisar varje anslutning, och de vill inom en timme veta om ni har blivit utsatta för intrång. Det enda ni har att ge är det ni har antagit."], ["A partner demanded to know within the hour whether you were compromised.", "En partner krävde att inom en timme få veta om ni utsatts för intrång."], { meters: { trust: -1 } })
            ])
          ]
        }),
        facilitator: fac(
          ["Midnight to the second points to a date, not an adversary. Watch for the room escalating to “attack” without checking.", "Midnatt på sekunden pekar på ett datum, inte en motståndare. Var uppmärksam på om rummet trappar upp till ”angrepp” utan att kontrollera."],
          ["Check the certificate chain first, keep an open mind about an attack.", "Kontrollera certifikatkedjan först, håll öppet för ett angrepp."],
          [["Ask: what has a date in it?", "Fråga: vad har ett datum i sig?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["A date nobody wrote down", "Ett datum ingen skrev upp"]),
        twist: L(["It isn't an attack. The certificate of your internal intermediate certificate authority expired at 00:00. Every certificate it issued is now distrusted. Nobody had it on a list.", "Det är inget angrepp. Certifikatet för er interna mellanliggande certifikatutfärdare gick ut klockan 00.00. Varje certifikat den utfärdat är nu misstrott. Ingen hade det på någon lista."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "B" }, narrativeAppend: { en: "Because every external connection was cut, the night's card payments failed for two hours, and the payment partner has logged an incident against you.", sv: "Eftersom varje extern förbindelse kapades misslyckades nattens kortbetalningar i två timmar, och betalpartnern har registrerat en incident mot er." } }
        ],
        assumptionChallenged: L(["Someone is attacking our certificate infrastructure.", "Någon angriper vår certifikatinfrastruktur."]),
        reveals: ["hf-expiry"],
        narrative: L([
          "{{time.T+60|clock}}. {{person.networkLead.name}} opens the certificate details of one of the failing servers and reads the chain of trust from the bottom up.\n\nThe server's own certificate is fine. So is the company's root. The problem sits in the middle, in a certificate that was issued five years ago and has not been thought about since.",
          "Klockan {{time.T+60|clock}}. {{person.networkLead.name}} öppnar certifikatinformationen för en av de servrar som inte fungerar och läser förtroendekedjan nerifrån och upp.\n\nServerns eget certifikat är i ordning. Det är även företagets rot. Problemet sitter i mitten, i ett certifikat som utfärdades för fem år sedan och som ingen har tänkt på sedan dess."
        ]),
        injects: [
          inj("i2-1", 60, "logExcerpt", "itOps", "high", "confirmed", [
            "Chain: server certificate (valid) → “{{org.shortName}} Issuing CA 1” (expired today 00:00:00) → “{{org.shortName}} Root CA” (valid). Issued five years ago; no owner recorded.",
            "Kedja: servercertifikat (giltigt) → ”{{org.shortName}} Issuing CA 1” (gick ut i dag 00.00.00) → ”{{org.shortName}} Root CA” (giltigt). Utfärdat för fem år sedan; ingen ägare registrerad."
          ], { reveals: ["hf-expiry"], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("What does it take to renew an intermediate certificate in your setup?", "Vad krävs för att förnya ett mellanliggande certifikat i er miljö?", ["networkLead", "itOps"]),
            q("Which systems can't be fixed by renewing, because they pinned the old certificate?", "Vilka system går inte att laga genom förnyelse, eftersom de har låst sig vid det gamla certifikatet?", ["devLead"]),
            q("Was checking before escalating the right call?", "Var det rätt att kontrollera innan ni trappade upp?", ["incidentCommander"], "d1")
          ],
          executive: [
            q("How long until the business runs again, honestly?", "Hur lång tid tar det innan verksamheten fungerar igen, ärligt?", ["cio", "serviceOwner"]),
            q("What do you tell partners whose integrations failed?", "Vad säger ni till partner vars integrationer fallerade?", ["supplierManager", "comms"]),
            q("If you had declared an attack at 00:20, what would you be undoing now?", "Om ni hade utlyst ett angrepp klockan 00.20, vad skulle ni hålla på att göra ogjort nu?", ["ciso"], "d1")
          ]
        },
        challenges: [ch("A team lead proposes switching off certificate checking “for a few hours” to get services up.", "En gruppchef föreslår att certifikatkontrollen stängs av ”några timmar” för att få igång tjänsterna.")],
        decision: dec("d2", "cio", ["How do you restore service?", "Hur återställer ni tjänsterna?"], [
          ["Renew the intermediate properly and restore service system by system; no disabling of checks.", "Förnya det mellanliggande certifikatet på rätt sätt och återställ system för system; ingen avstängning av kontroller."],
          ["Switch off certificate checking on critical integrations until the renewal is done.", "Stäng av certifikatkontrollen i kritiska integrationer tills förnyelsen är klar."],
          ["Issue new certificates from a quick, new certificate authority built tonight.", "Utfärda nya certifikat från en snabb, ny certifikatutfärdare som byggs i natt."]
        ], {
          knowns: [["The cause is an expired intermediate certificate.", "Orsaken är ett utgånget mellanliggande certifikat."]],
          uncertainties: [["How quickly the renewal can be done.", "Hur snabbt förnyelsen kan göras."]],
          tradeoffs: {
            operational: ["Doing it properly takes hours longer.", "Att göra det ordentligt tar timmar längre."],
            security: ["Disabled checking means any server can pretend to be yours.", "Avstängd kontroll betyder att vilken server som helst kan utge sig för att vara er."],
            legal: ["Some partner contracts require certificate validation.", "En del partneravtal kräver certifikatkontroll."],
            reputational: ["Morning customers will notice the outage.", "Morgonens kunder kommer att märka avbrottet."]
          },
          evaluation: [["Restores trust without removing the control that provides it", "Återställer förtroendet utan att ta bort kontrollen som ger det"]],
          pushback: {
            A: [
              pb(["No end time", "Ingen sluttid"], ["{{person.itOps.name}} cannot say how long a proper renewal takes: nobody here has ever done one. The business wants a time it can give customers. Do you hold the line with no end in sight, and what do you promise them?", "{{person.itOps.name}} kan inte säga hur lång tid en ordentlig förnyelse tar: ingen här har gjort en tidigare. Verksamheten vill ha en tid att ge kunderna. Håller ni fast vid linjen utan något slut i sikte, och vad lovar ni dem?"]),
              pb(["Ten minutes, one switch", "Tio minuter, en inställning"], ["A team lead says they could have their integration back in ten minutes by switching off one check, and their customers are waiting. Refusing means the team sits idle all night. Do you forbid it in writing, and will they listen if you do?", "En gruppchef säger att teamets integration kan vara igång om tio minuter om en enda kontroll stängs av, och deras kunder väntar. Ett nej betyder att teamet sitter sysslolöst hela natten. Förbjuder ni det skriftligt, och kommer de att lyssna?"]),
              pb(["Last in line", "Sist i kön"], ["{{person.serviceOwner.name}} sees their customer-facing service near the end of the restore order and objects: morning customers will see errors for hours while internal tools come back first. Who sets the order, and on what basis?", "{{person.serviceOwner.name}} ser att hens kundnära tjänst ligger nästan sist i återställningsordningen och protesterar: morgonens kunder kommer att se fel i timmar medan interna verktyg kommer tillbaka först. Vem bestämmer ordningen, och utifrån vad?"])
            ],
            B: [
              pb(["Everything is critical", "Allt är kritiskt"], ["Three teams in, the list of “critical” integrations has grown from a handful to dozens, each with its own engineer switching checks off. Nobody is keeping track. How will you know where to turn checking back on, and who owns that list?", "Efter tre team har listan över ”kritiska” integrationer vuxit från en handfull till dussintals, var och en med sin egen tekniker som stänger av kontroller. Ingen håller ordning på det. Hur ska ni veta var kontrollen ska slås på igen, och vem äger den listan?"]),
              pb(["Security will not sign", "Säkerhet skriver inte under"], ["{{person.ciso.name}} refuses to sign off: with checking off, any server can claim to be a partner and the integrations will believe it. The CISO wants the decision in writing with the CIO's name on it. Will you sign, and for how long?", "{{person.ciso.name}} vägrar godkänna: med kontrollen avstängd kan vilken server som helst utge sig för att vara en partner och integrationerna tror på det. Säkerhetschefen vill ha beslutet skriftligt med it-chefens namn på. Skriver ni under, och för hur länge?"]),
              pb(["Temporary until when?", "Tillfälligt till när?"], ["The change record says “temporary”, but nobody knows when the renewal will be done, so there is no end date to write. Workarounds without an end date tend to stay. What exactly ends this, and who checks that it did?", "Ändringsposten säger ”tillfälligt”, men ingen vet när förnyelsen är klar, så det finns inget slutdatum att skriva in. Nödlösningar utan slutdatum brukar bli kvar. Vad är det exakt som avslutar det här, och vem kontrollerar att det skedde?"])
            ],
            C: [
              pb(["Nobody trusts it yet", "Ingen litar på den än"], ["A new certificate authority only helps once every server, laptop and partner trusts its root. Partners say they will not install a root built overnight without review. Which systems actually come back tonight, and which stay down?", "En ny certifikatutfärdare hjälper först när varje server, dator och partner litar på dess rot. Partnerna säger att de inte installerar en rot som byggts över natten utan granskning. Vilka system kommer faktiskt tillbaka i natt, och vilka förblir nere?"]),
              pb(["A key on a virtual machine", "En nyckel på en virtuell maskin"], ["The engineer building it asks where to keep the new root's private key: there is no safe and no hardware key tonight, only a virtual machine. Whoever copies that file can pretend to be your whole company. Do you accept that to save a few hours?", "Teknikern som bygger den frågar var den nya rotens privata nyckel ska förvaras: i natt finns inget kassaskåp och ingen hårdvarunyckel, bara en virtuell maskin. Den som kopierar den filen kan utge sig för att vara hela företaget. Accepterar ni det för att vinna några timmar?"]),
              pb(["Two PKIs, no owner", "Två PKI:er, ingen ägare"], ["{{person.networkLead.name}} points out that the old chain still has to be renewed anyway, so after tonight you will run two certificate authorities and nobody owns either. Is a second, rushed PKI really faster than fixing the first?", "{{person.networkLead.name}} påpekar att den gamla kedjan ändå måste förnyas, så efter i natt har ni två certifikatutfärdare och ingen äger någon av dem. Är en andra, hastigt byggd PKI verkligen snabbare än att laga den första?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "B" }, ["Checks switched off", "Kontrollerna avstängda"], [
              io(["Services come back", "Tjänsterna kommer tillbaka"], ["Within forty minutes the critical integrations run again with checking off. The night shift cheers, and three more teams ask to do the same for theirs.", "Inom fyrtio minuter går de kritiska integrationerna igen med kontrollen avstängd. Nattskiftet jublar, och ytterligare tre team ber att få göra likadant med sina."], ["Critical integrations run without checking; more teams want the same.", "Kritiska integrationer går utan kontroll; fler team vill göra likadant."]),
              io(["Nobody kept the list", "Ingen förde listan"], ["By the handover nobody can say exactly which integrations had checking switched off: the changes were agreed in chat, not in the change log. The decision cannot be controlled as it was written.", "Vid överlämningen kan ingen säga exakt vilka integrationer som fick kontrollen avstängd: ändringarna bestämdes i chatten, inte i ändringsloggen. Beslutet går inte att styra så som det skrevs."], ["There is no reliable list of where checking was switched off.", "Det finns ingen tillförlitlig lista över var kontrollen stängdes av."], { reopen: true }),
              io(["“Until further notice”", "”Tills vidare”"], ["{{person.ciso.name}} records a formal objection and asks for an end date on the change. Nobody can give one, so the change record now reads “until further notice”.", "{{person.ciso.name}} för in en formell invändning och begär ett slutdatum för ändringen. Ingen kan ge något, så ändringsposten lyder nu ”tills vidare”."], ["The workaround is recorded with no end date.", "Nödlösningen är registrerad utan slutdatum."])
            ]),
            ir("i2", { notChosen: "B" }, ["Checks stay on", "Kontrollerna är kvar"], [
              io(["One team did it anyway", "Ett team gjorde det ändå"], ["Before dawn the SOC spots a team that switched certificate checking off on its own integration without asking anyone. It works, and two more teams want to know why they cannot do the same.", "Före gryningen upptäcker SOC ett team som stängt av certifikatkontrollen i sin egen integration utan att fråga någon. Det fungerar, och två team till vill veta varför de inte får göra likadant."], ["At least one team switched checking off without approval.", "Minst ett team stängde av kontrollen utan godkännande."], { reopen: true }),
              io(["Payments stay down", "Betalningarna ligger nere"], ["The payment integration stays down through the night. {{person.serviceOwner.name}} reports the first failed customer payments and asks how long this will last. Nobody can give a time.", "Betalintegrationen ligger nere hela natten. {{person.serviceOwner.name}} rapporterar de första misslyckade kundbetalningarna och frågar hur länge det här ska pågå. Ingen kan ge en tid."], ["Payments stayed down overnight with no recovery time to give.", "Betalningarna låg nere över natten utan någon tid för återställning."], { meters: { trust: -1 } }),
              io(["The line holds", "Linjen håller"], ["The teams accept the decision. A few services come back on publicly trusted certificates they already had, and the room feels the plan is working.", "Teamen godtar beslutet. Några tjänster kommer tillbaka med allmänt betrodda certifikat som de redan hade, och rummet känner att planen fungerar."], ["A few services are back on existing public certificates.", "Några tjänster är tillbaka med befintliga allmänt betrodda certifikat."])
            ])
          ]
        }),
        facilitator: fac(
          ["The tempting workaround is the security failure of this exercise. See who argues against it.", "Den lockande nödlösningen är övningens säkerhetsmisslyckande. Se vem som argumenterar emot den."],
          ["A proper renewal with service restored in priority order, no checks disabled.", "En ordentlig förnyelse med tjänsterna återställda i prioritetsordning, inga kontroller avstängda."],
          [["Ask: what is the certificate check protecting you from tonight?", "Fråga: vad skyddar certifikatkontrollen er mot i natt?"]]
        )
      },
      {
        id: "p3",
        clock: 180,
        priority: 1,
        title: L(["The safe", "Kassaskåpet"]),
        twist: L(["Renewing needs the offline root certificate authority, kept in a safe with a hardware key. The two people who know the procedure are on holiday and on a flight.", "Förnyelsen kräver den frånkopplade rotcertifikatutfärdaren, som förvaras i ett kassaskåp med en hårdvarunyckel. De två personer som kan proceduren är på semester respektive på ett flyg."]),
        twistKind: "impact",
        reconsider: { decision: "d2", pressure: { en: "Renewal needs a safe nobody can open tonight. If you refused to switch checks off, the payment integration stays down until a keyholder lands. If you switched them off, you are running without the protection the certificates exist for.", sv: "Förnyelsen kräver ett kassaskåp som ingen kan öppna i natt. Om ni vägrade stänga av kontrollerna är betalintegrationen nere tills en nyckelinnehavare landar. Om ni stängde av dem kör ni utan det skydd som certifikaten finns till för." } },
        assumptionChallenged: L(["Renewal is a quick admin task.", "Förnyelse är en snabb administrativ uppgift."]),
        reveals: ["hf-root"],
        narrative: L([
          "{{time.T+180|clock}}. The fix is known: issue a new intermediate certificate. {{person.itOps.name}} finds the renewal procedure in an old document, written five years ago by people who have since moved on.\n\nIt is short, precise and old-fashioned. Every step depends on things kept offline for security reasons, and on people who are not in the building.",
          "Klockan {{time.T+180|clock}}. Lösningen är känd: utfärda ett nytt mellanliggande certifikat. {{person.itOps.name}} hittar förnyelseproceduren i ett gammalt dokument, skrivet för fem år sedan av personer som sedan dess har gått vidare.\n\nDen är kort, exakt och gammaldags. Varje steg är beroende av saker som av säkerhetsskäl förvaras frånkopplade, och av personer som inte är i byggnaden."
        ]),
        injects: [
          inj("i3-1", 180, "email", "itOps", "high", "confirmed", [
            "Procedure: “Open safe B-2 (two keyholders). Start the offline root server. Unlock the hardware key with the PIN (held by the two keyholders). Sign the new intermediate.”",
            "Procedur: ”Öppna kassaskåp B-2 (två nyckelinnehavare). Starta den frånkopplade rotservern. Lås upp hårdvarunyckeln med PIN-koden (som de två nyckelinnehavarna har). Signera det nya mellanliggande certifikatet.”"
          ], { headline: ["Root CA procedure, version 1", "Procedur för rot-CA, version 1"], reveals: ["hf-root"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Is there any safe way to renew without the keyholders?", "Finns det något säkert sätt att förnya utan nyckelinnehavarna?", ["networkLead", "ciso"]),
            q("What can you restore meanwhile with publicly trusted certificates?", "Vad kan ni återställa under tiden med allmänt betrodda certifikat?", ["networkLead", "devLead"]),
            q("Is the decision not to disable checks still holding?", "Håller beslutet att inte stänga av kontrollerna fortfarande?", ["cio"], "d2")
          ],
          executive: [
            q("Do you bring a keyholder home from holiday?", "Hämtar ni hem en nyckelinnehavare från semestern?", ["cio", "ceo"]),
            q("What do you tell staff arriving at 08:00?", "Vad säger ni till personalen som kommer klockan 08.00?", ["comms"]),
            q("Is the pressure to switch off checks growing, and who is resisting it?", "Växer trycket på att stänga av kontrollerna, och vem står emot?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("The safe's second key is in a drawer at the departed engineer's old desk.", "Kassaskåpets andra nyckel ligger i en låda i den tidigare teknikerns gamla skrivbord.")],
        decision: dec("d3", "ciso", ["How do you get the root ceremony done?", "Hur får ni ceremonin för roten genomförd?"], [
          ["Reach a keyholder by phone, bring them in, and do the ceremony with two witnesses and a written record.", "Nå en nyckelinnehavare per telefon, ta in hen, och genomför ceremonin med två vittnen och ett skriftligt protokoll."],
          ["Have facilities open the safe tonight and follow the written procedure in the binder, without the keyholders.", "Låt fastighet öppna kassaskåpet i natt och följ den skriftliga proceduren i pärmen, utan nyckelinnehavarna."],
          ["Abandon the internal PKI and buy public certificates for everything.", "Överge den interna PKI:n och köp allmänt betrodda certifikat för allt."]
        ], {
          knowns: [["The root can only be used by its keyholders.", "Roten kan bara användas av sina nyckelinnehavare."]],
          uncertainties: [["How quickly a keyholder can be reached.", "Hur snabbt en nyckelinnehavare kan nås."]],
          tradeoffs: {
            operational: ["Waiting for a keyholder extends the outage.", "Att vänta på en nyckelinnehavare förlänger avbrottet."],
            security: ["A careless ceremony can expose the root key.", "En slarvig ceremoni kan exponera rotnyckeln."],
            legal: ["Some systems require an auditable chain of trust.", "Vissa system kräver en granskningsbar förtroendekedja."],
            reputational: ["Partners are asking when, not why.", "Partnerna frågar när, inte varför."]
          },
          evaluation: [["Protects the root key even under pressure", "Skyddar rotnyckeln även under tryck"]],
          pushback: {
            A: [
              pb(["Home tomorrow at the earliest", "Hemma tidigast i morgon"], ["The keyholder you reach is abroad with family and can be back by tomorrow afternoon at the earliest. The other one is in the air. Do you keep the business waiting a day for a controlled ceremony, and who tells the partners?", "Nyckelinnehavaren ni når är utomlands med familjen och kan vara tillbaka tidigast i morgon eftermiddag. Den andra sitter på ett flyg. Låter ni verksamheten vänta ett dygn på en kontrollerad ceremoni, och vem berättar det för partnerna?"]),
              pb(["“I'll read you the PIN”", "”Jag läser upp PIN-koden”"], ["The keyholder on holiday offers a shortcut: they will read the PIN over the phone so someone in the office can do it tonight. It would save a day, and it would break the very control the ceremony exists for. Do you accept?", "Nyckelinnehavaren på semestern erbjuder en genväg: hen läser upp PIN-koden i telefon så att någon på kontoret kan göra det i natt. Det skulle spara ett dygn, och bryta just den kontroll som ceremonin finns till för. Tackar ni ja?"]),
              pb(["Who witnesses?", "Vem är vittne?"], ["The procedure needs two witnesses, and the only people awake who understand it are the engineers who most want it done fast. An auditor will later ask who signed the record. Who is independent enough to witness this tonight?", "Proceduren kräver två vittnen, och de enda vakna som förstår den är de tekniker som helst vill få det gjort snabbt. En revisor kommer senare att fråga vem som skrev under protokollet. Vem är tillräckligt oberoende för att vara vittne i natt?"])
            ],
            B: [
              pb(["The PIN is not in the safe", "PIN-koden ligger inte i kassaskåpet"], ["Facilities can open the safe, but the hardware key still needs a PIN that only the keyholders hold. An engineer suggests guessing from notes in the binder; a few wrong attempts may lock the key for good. Do you let them try?", "Fastighet kan öppna kassaskåpet, men hårdvarunyckeln kräver fortfarande en PIN-kod som bara nyckelinnehavarna har. En tekniker föreslår att gissa utifrån anteckningar i pärmen; några felaktiga försök kan låsa nyckeln för gott. Låter ni hen försöka?"]),
              pb(["Facilities says no", "Fastighet säger nej"], ["The facilities manager will not open a safe marked “two keyholders” without written authority from someone entitled to give it, and asks who that is tonight. Nobody in the room is sure. Who signs, and are they allowed to?", "Fastighetsansvarig tänker inte öppna ett kassaskåp märkt ”två nyckelinnehavare” utan skriftligt uppdrag från någon som har rätt att ge det, och frågar vem det är i natt. Ingen i rummet är säker. Vem skriver under, och får hen det?"]),
              pb(["A root nobody can vouch for", "En rot ingen kan gå i god för"], ["Without the keyholders, nobody can witness or vouch for how the new intermediate was made. Partners and auditors who rely on your certificates may ask exactly that. Can you defend a root used by people who were never trusted with it?", "Utan nyckelinnehavarna kan ingen vittna om eller gå i god för hur det nya mellanliggande certifikatet togs fram. Partner och revisorer som förlitar sig på era certifikat kan fråga just det. Kan ni försvara en rot som använts av personer som aldrig anförtrotts den?"])
            ],
            C: [
              pb(["Weeks, not hours", "Veckor, inte timmar"], ["Public certificate authorities will not issue certificates for many of your internal server names, and some devices cannot take a new chain at all. {{person.devLead.name}} estimates weeks of changes. What runs in the meantime?", "Allmänna certifikatutfärdare utfärdar inte certifikat för många av era interna servernamn, och vissa enheter kan inte ta emot en ny kedja alls. {{person.devLead.name}} uppskattar ändringsarbetet till veckor. Vad är igång under tiden?"]),
              pb(["Who can buy tonight?", "Vem kan köpa i natt?"], ["The plan needs certificates for up to {{num.systems}} systems tonight, with no budget and no supplier agreement. Procurement is asleep, and the supplier wants an approved order before issuing. Who has the authority to buy, and how fast?", "Planen kräver certifikat för upp till {{num.systems}} system i natt, utan budget och utan leverantörsavtal. Inköp sover, och leverantören vill ha en godkänd beställning innan något utfärdas. Vem har mandat att köpa, och hur snabbt?"]),
              pb(["Rebuilding trust overnight", "Bygga om förtroendet över natten"], ["Some internal systems check certificates only against your own root and have no public authorities installed at all. Abandoning the internal PKI means touching every one of them. Are you replacing one expired certificate, or rebuilding your whole trust model in a night?", "Vissa interna system kontrollerar certifikat enbart mot er egen rot och har inga allmänna utfärdare installerade alls. Att överge den interna PKI:n innebär att röra vart och ett av dem. Byter ni ut ett utgånget certifikat, eller bygger ni om hela er förtroendemodell på en natt?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Calling the keyholder", "Samtalet till nyckelinnehavaren"], [
              io(["On the first flight", "Med första flyget"], ["The keyholder on holiday answers at the second try and agrees to come back on the first available flight. The room relaxes: the ceremony is now a question of when, not whether.", "Nyckelinnehavaren på semestern svarar på andra försöket och går med på att komma tillbaka med första lediga flyg. Rummet slappnar av: ceremonin är nu en fråga om när, inte om."], ["A keyholder is travelling back for the ceremony.", "En nyckelinnehavare är på väg tillbaka för ceremonin."]),
              io(["Voicemail twice", "Röstbrevlåda två gånger"], ["Both keyholders' phones go to voicemail: one is in the air, the other asleep in a distant time zone. Every hour you wait for a call back, the business waits too.", "Båda nyckelinnehavarnas telefoner går till röstbrevlådan: den ena sitter på ett flyg, den andra sover i en avlägsen tidszon. Varje timme ni väntar på att någon ringer tillbaka väntar verksamheten också."], ["Neither keyholder could be reached when the call had to be made.", "Ingen nyckelinnehavare gick att nå när beslutet behövde fattas."], { reopen: true }),
              io(["“Is the PIN still the same?”", "”Är PIN-koden densamma?”"], ["The keyholder answers but sounds unsure: it has been five years, and they cannot remember whether the PIN was ever changed. They will come, but cannot promise the ceremony works first time.", "Nyckelinnehavaren svarar men låter osäker: det har gått fem år, och hen minns inte om PIN-koden någonsin byttes. Hen kommer, men kan inte lova att ceremonin fungerar på första försöket."], ["The keyholder is coming but is unsure the PIN still works.", "Nyckelinnehavaren kommer men är osäker på om PIN-koden fortfarande fungerar."])
            ]),
            ir("i2", { notChosen: "A" }, ["The keyholders left out", "Nyckelinnehavarna utanför"], [
              io(["A keyholder hears anyway", "En nyckelinnehavare hör det ändå"], ["One keyholder hears about the outage from a colleague and calls in, upset that nobody asked: the root, they say, must not be touched without them. They will help, but first want to know what has already been done.", "En nyckelinnehavare får höra om avbrottet från en kollega och ringer in, upprörd över att ingen frågade: roten, säger hen, får inte röras utan dem. Hen hjälper till, men vill först veta vad som redan har gjorts."], ["A keyholder knows of the outage and objects to being bypassed.", "En nyckelinnehavare känner till avbrottet och invänder mot att ha förbigåtts."]),
              io(["Audit says stop", "Revisionen säger stopp"], ["Internal audit reminds {{person.ciso.name}} that any change to the chain of trust without the named keyholders needs prior approval from the audit committee. Your plan has no such approval, and the committee does not meet tonight.", "Internrevisionen påminner {{person.ciso.name}} om att varje ändring i förtroendekedjan utan de utsedda nyckelinnehavarna kräver förhandsgodkännande från revisionsutskottet. Er plan har inget sådant godkännande, och utskottet sammanträder inte i natt."], ["Audit requires prior approval for trust changes without the keyholders.", "Revisionen kräver förhandsgodkännande för förtroendeändringar utan nyckelinnehavarna."], { reopen: true }),
              io(["Faster than feared", "Snabbare än befarat"], ["The first steps go faster than anyone expected, and a handful of services come back before morning. {{person.networkLead.name}} warns that nobody can yet say how the remaining systems will be fixed.", "De första stegen går snabbare än någon väntat sig, och en handfull tjänster kommer tillbaka före morgonen. {{person.networkLead.name}} varnar för att ingen ännu kan säga hur resten av systemen ska lagas."], ["A handful of services came back; the rest have no clear route.", "En handfull tjänster kom tillbaka; resten saknar en tydlig väg."])
            ])
          ]
        }),
        facilitator: fac(
          ["Single points of failure in people are as real as in servers.", "Enskilda kritiska beroenden av människor är lika verkliga som av servrar."],
          ["A controlled ceremony with a keyholder; interim public certificates for the most critical services.", "En kontrollerad ceremoni med en nyckelinnehavare; tillfälliga allmänt betrodda certifikat för de mest kritiska tjänsterna."],
          [["Ask: who else in the company holds a secret only they know?", "Fråga: vem mer i företaget har en hemlighet som bara hen känner till?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 480,
        title: L(["The fix that wasn't", "Lösningen som inte var det"]),
        twist: L(["The overnight workaround switched off certificate checking on {{num.bypassed}} systems. This morning {{num.installs}} staff ran a fake IT “certificate fix”, and one integration is sending orders to a look-alike server.", "Nattens nödlösning stängde av certifikatkontrollen på {{num.bypassed}} system. I morse körde {{num.installs}} anställda en falsk ”certifikatlösning” från IT, och en integration skickar beställningar till en efterliknande server."]),
        twistKind: "scope",
        reconsider: { decision: "d1", pressure: { en: "Staff ran a fake “certificate fix” this morning: someone used your midnight outage as cover. Was it an attack after all, and does your first call still stand?", sv: "Personalen körde en falsk ”certifikatlösning” i morse: någon använde ert midnattsavbrott som täckmantel. Var det ett angrepp trots allt, och står ert första beslut sig?" } },
        branches: [
          { when: { decision: "d2", option: "B" }, narrativeAppend: { en: "Because certificate checking was switched off to keep the integrations running, the look-alike server was accepted without a single warning.", sv: "Eftersom certifikatkontrollen stängdes av för att hålla integrationerna igång accepterades den efterliknande servern utan en enda varning." } }
        ],
        assumptionChallenged: L(["This is an outage, not a security incident.", "Det här är ett avbrott, inte en säkerhetsincident."]),
        reveals: ["hf-workaround"],
        narrative: L([
          "{{time.T+480|clock}}. Morning. Services are coming back one by one, some through the proper fix and some through quick workarounds made in the night.\n\nThe service desk is overloaded with staff who still cannot log in. {{person.socLead.name}} notices traffic from one integration going somewhere it should not, and an IT notice in staff inboxes that nobody in IT remembers writing.",
          "Klockan {{time.T+480|clock}}. Morgon. Tjänsterna kommer tillbaka en efter en, en del via den riktiga lösningen och en del via snabba nödlösningar som gjordes under natten.\n\nServicedesken är överbelastad av anställda som fortfarande inte kan logga in. {{person.socLead.name}} ser att trafik från en integration går dit den inte borde, och ett IT-meddelande i personalens inkorgar som ingen på IT minns att de har skrivit."
        ]),
        injects: [
          inj("i4-1", 480, "phishingEmail", "attacker", "high", "confirmed", [
            "IT notice: due to tonight's certificate problem, please run the attached tool to install the new company certificate. Services will work again immediately.",
            "IT-meddelande: på grund av nattens certifikatproblem, kör det bifogade verktyget för att installera företagets nya certifikat. Tjänsterna fungerar igen direkt."
          ], { headline: ["IT: fix for certificate errors", "IT: lösning på certifikatfelen"], meta: { from: "it-support@{{asset.lookalikeDomain}}", subject: L(["Fix for certificate errors", "Lösning på certifikatfelen"]) }, tests: ["lo3"] }),
          inj("i4-2", 500, "networkEvidence", "soc", "critical", "confirmed", [
            "Order integration (certificate checking disabled at 05:12) connecting to {{asset.attackerIp}} instead of the partner's endpoint since 07:30. A look-alike name resolved there.",
            "Orderintegrationen (certifikatkontroll avstängd klockan 05.12) ansluter till {{asset.attackerIp}} i stället för partnerns ändpunkt sedan 07.30. Ett efterliknande namn pekade dit."
          ], { reveals: ["hf-workaround"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["The morning after", "Morgonen efter"]),
          data: kpi([
            { id: "sys", label: ["Systems affected at midnight", "System som drabbades vid midnatt"], value: (v) => v.systems, tone: "warn" },
            { id: "byp", label: ["Systems with checking switched off", "System med avstängd kontroll"], value: (v) => v.bypassed, tone: "danger" },
            { id: "inst", label: ["Staff who ran the fake fix", "Anställda som körde den falska lösningen"], value: (v) => v.installs, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("How do you find every system where checking was switched off?", "Hur hittar ni varje system där kontrollen stängdes av?", ["itOps", "devLead"]),
            q("What can an attacker do with their root certificate on {{num.installs}} computers?", "Vad kan en angripare göra med sitt rotcertifikat på {{num.installs}} datorer?", ["socLead", "ciso"]),
            q("Did the decision on restoring service hold, or did teams act on their own?", "Höll beslutet om återställningen, eller agerade team på egen hand?", ["cio"], "d2")
          ],
          executive: [
            q("Is this now a security incident with reporting duties?", "Är det här nu en säkerhetsincident med rapporteringsskyldigheter?", ["ciso", "incidentCommander"]),
            q("What do you tell the partner whose orders went to the wrong place?", "Vad säger ni till partnern vars beställningar gick till fel ställe?", ["supplierManager", "comms"]),
            q("Who allowed teams to switch off checks, and how will you know next time?", "Vem tillät team att stänga av kontrollerna, och hur får ni veta det nästa gång?", ["cio"], "d2")
          ]
        },
        challenges: [ch("The teams that switched off checking did it to help, and they did restore service.", "De team som stängde av kontrollen gjorde det för att hjälpa till, och de fick faktiskt igång tjänsterna.")],
        decision: dec("d4", "ciso", ["What do you do now?", "Vad gör ni nu?"], [
          ["Turn checking back on everywhere, remove the fake root from every computer, block the look-alike host, and treat it as a security incident.", "Slå på kontrollen igen överallt, ta bort den falska roten från varje dator, blockera den efterliknande värden och behandla det som en säkerhetsincident."],
          ["Fix the one integration and leave the other workarounds until the PKI is stable.", "Laga den enda integrationen och låt de andra nödlösningarna vara tills PKI:n är stabil."],
          ["Warn staff with clear steps to remove the fake certificate themselves, and keep IT focused on the integrations.", "Varna personalen med tydliga steg för att själva ta bort det falska certifikatet, och låt IT fokusera på integrationerna."]
        ], {
          knowns: [["Checks are off on many systems; a fake root is installed on some computers.", "Kontrollerna är avstängda på många system; en falsk rot är installerad på en del datorer."]],
          uncertainties: [["What else the attacker intercepted.", "Vad mer angriparen fångade upp."]],
          tradeoffs: {
            operational: ["Turning checks back on may break services again.", "Att slå på kontrollerna igen kan slå ut tjänster på nytt."],
            security: ["Every hour with checks off and a fake root installed is open interception.", "Varje timme med avstängda kontroller och en falsk rot installerad är öppen avlyssning."],
            legal: ["Partner data was sent to an attacker.", "Partnerdata skickades till en angripare."],
            reputational: ["The outage story is becoming a breach story.", "Avbrottshistorien håller på att bli en intrångshistoria."]
          },
          evaluation: [["Removes every workaround and the fake root, not only the one that was caught", "Tar bort varje nödlösning och den falska roten, inte bara den som upptäcktes"]],
          pushback: {
            A: [
              pb(["A second outage", "Ett andra avbrott"], ["Turning checking back on everywhere means the {{num.bypassed}} systems running on workarounds fail again until each has a renewed certificate. The service desk is already overloaded. Do you accept a second outage this morning, and in what order?", "Att slå på kontrollen överallt innebär att de {{num.bypassed}} system som går på nödlösningar slutar fungera igen tills vart och ett har ett förnyat certifikat. Servicedesken är redan överbelastad. Accepterar ni ett andra avbrott i morse, och i vilken ordning?"]),
              pb(["They worked all night", "De jobbade hela natten"], ["The engineers who switched checking off worked all night and got services back. Now they hear their fix is being reversed and called a security incident, and some say they will not pick up the phone next time. How do you undo their work without punishing them?", "Teknikerna som stängde av kontrollen jobbade hela natten och fick igång tjänsterna. Nu hör de att deras lösning rivs upp och kallas en säkerhetsincident, och några säger att de inte svarar i telefon nästa gång. Hur river ni upp deras arbete utan att straffa dem?"]),
              pb(["Machines you don't manage", "Datorer ni inte förvaltar"], ["Removing the fake root centrally works on managed computers, but some of the {{num.installs}} staff ran the tool on personal laptops they use from home. Central tools cannot reach those. What do you do about machines you do not control?", "Att ta bort den falska roten centralt fungerar på förvaltade datorer, men några av de {{num.installs}} anställda körde verktyget på privata datorer som de använder hemifrån. Centrala verktyg når inte dem. Vad gör ni med datorer som ni inte styr över?"])
            ],
            B: [
              pb(["Found by chance", "Upptäckt av en slump"], ["{{person.socLead.name}} says you only know about the order integration because someone happened to look at its traffic. The other systems with checking off have no such monitoring. How do you know none of them is talking to a look-alike right now?", "{{person.socLead.name}} säger att ni bara känner till orderintegrationen för att någon råkade titta på dess trafik. De andra systemen med avstängd kontroll har ingen sådan bevakning. Hur vet ni att inget av dem pratar med en efterliknande värd just nu?"]),
              pb(["The fake root stays", "Den falska roten blir kvar"], ["Your decision fixes one integration but says nothing about the {{num.installs}} computers that now trust the attacker's root. Their secure web traffic can be read in transit. Who is handling that, and since when?", "Ert beslut lagar en integration men säger ingenting om de {{num.installs}} datorer som nu litar på angriparens rot. Deras skyddade webbtrafik kan läsas under överföringen. Vem tar hand om det, och sedan när?"]),
              pb(["A direct question", "En rak fråga"], ["{{person.supplierManager.name}} has the partner whose orders went astray on the line, asking one thing: are any of your other connections to us still running without checks? The honest answer is yes. What do you tell them?", "{{person.supplierManager.name}} har partnern vars beställningar hamnade fel i luren, och de frågar en sak: går några av era andra förbindelser till oss fortfarande utan kontroll? Det ärliga svaret är ja. Vad säger ni till dem?"])
            ],
            C: [
              pb(["Another email from “IT”", "Ännu ett mejl från ”IT”"], ["Staff have just learned that an email from “IT” about certificates was fake. Now IT sends another email about certificates, with steps to follow, and people reply asking how to tell this one is real. How do they tell your instructions from the attacker's?", "Personalen har just fått veta att ett mejl från ”IT” om certifikat var falskt. Nu skickar IT ännu ett mejl om certifikat, med steg att följa, och folk svarar och frågar hur de ska veta att det här är äkta. Hur skiljer de era instruktioner från angriparens?"]),
              pb(["Was it the right one?", "Var det rätt certifikat?"], ["The steps are fiddly, and the service desk is taking calls from people unsure whether they removed the fake certificate or the real company one. Nobody can confirm which computers are clean. How will you know the fake root is gone?", "Stegen är krångliga, och servicedesken får samtal från folk som inte vet om de tog bort det falska certifikatet eller företagets riktiga. Ingen kan bekräfta vilka datorer som är rena. Hur ska ni veta att den falska roten är borta?"]),
              pb(["Only takes one", "Det räcker med en"], ["Anyone on leave, in meetings all day or ignoring the email keeps the attacker's root installed. {{person.socLead.name}} says one such computer is enough for the attacker. Can you defend leaving the clean-up to staff if one of those is used tonight?", "Den som är ledig, sitter i möten hela dagen eller ignorerar mejlet behåller angriparens rot. {{person.socLead.name}} säger att en enda sådan dator räcker för angriparen. Kan ni försvara att städningen lämnades till personalen om en av dem används i kväll?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Everything back on", "Allt påslaget igen"], [
              io(["A second outage", "Ett andra avbrott"], ["Turning checking back on breaks the workaround systems again within minutes, and the service desk queue doubles. Staff who had only just got back to work are locked out a second time.", "När kontrollen slås på igen slutar nödlösningssystemen fungera inom några minuter, och servicedeskens kö fördubblas. Personal som nyss kommit igång med arbetet är utelåst en andra gång."], ["Restoring checks caused a second outage on the workaround systems.", "Återställda kontroller gav ett andra avbrott i nödlösningssystemen."], { meters: { trust: -1 } }),
              io(["The look-alike goes quiet", "Den efterliknande värden tystnar"], ["Within the hour the look-alike host stops answering. The SOC cannot say whether your block did it, or whether the attacker already has what they wanted.", "Inom en timme slutar den efterliknande värden svara. SOC kan inte säga om det var er blockering, eller om angriparen redan har fått det hen ville ha."], ["The look-alike host went silent; nobody knows why.", "Den efterliknande värden tystnade; ingen vet varför."]),
              io(["Laptops out of reach", "Datorer utom räckhåll"], ["Central removal of the fake root works on managed computers, but the reports show a group of home laptops that never check in. Your decision covered every computer; it cannot reach these.", "Den centrala borttagningen av den falska roten fungerar på förvaltade datorer, men rapporterna visar en grupp hemmadatorer som aldrig hör av sig. Ert beslut omfattade varje dator; det når inte de här."], ["Some home laptops with the fake root are beyond central removal.", "Några hemmadatorer med den falska roten går inte att nå centralt."], { reopen: true })
            ]),
            ir("i2", { notChosen: "A" }, ["Workarounds left in place", "Nödlösningarna får vara kvar"], [
              io(["A second wave", "En andra våg"], ["A second wave of the fake IT notice arrives, now copying the wording of your genuine outage message. More staff run the tool before anyone warns them.", "En andra våg av det falska IT-meddelandet kommer, nu med formuleringar kopierade från ert äkta meddelande om avbrottet. Fler anställda kör verktyget innan någon hinner varna dem."], ["A second wave of the fake notice reached staff.", "En andra våg av det falska meddelandet nådde personalen."], { reopen: true, meters: { trust: -1 } }),
              io(["A quiet morning", "En lugn förmiddag"], ["Nothing else unusual shows up all morning. The business takes it as proof that the remaining workarounds are harmless and asks to leave them until next week.", "Inget mer ovanligt dyker upp under förmiddagen. Verksamheten tar det som bevis för att de återstående nödlösningarna är ofarliga och vill låta dem vara kvar till nästa vecka."], ["Nothing more was seen this morning; the business wants to wait.", "Inget mer syntes under förmiddagen; verksamheten vill vänta."]),
              io(["Audit wants a list", "Revisionen vill ha en lista"], ["Internal audit asks for a list of every system still running without certificate checks, by the end of the day. Nobody has one, and the teams who made the changes are asleep after the night shift.", "Internrevisionen begär en lista över varje system som fortfarande går utan certifikatkontroll, före dagens slut. Ingen har en, och teamen som gjorde ändringarna sover efter nattskiftet."], ["Audit wants a list of unchecked systems that nobody has.", "Revisionen vill ha en lista över okontrollerade system som ingen har."])
            ])
          ]
        }),
        facilitator: fac(
          ["Opportunists read your outage like a news feed. The workaround made the attack possible.", "Opportunister läser ert avbrott som ett nyhetsflöde. Nödlösningen gjorde angreppet möjligt."],
          ["Checks restored everywhere, fake root removed centrally, look-alike blocked, incident declared.", "Kontrollerna återställda överallt, den falska roten borttagen centralt, efterliknande värd blockerad, incident utlyst."],
          [["Ask: who would want to send your staff an IT notice this morning?", "Fråga: vem skulle vilja skicka ett IT-meddelande till er personal i morse?"]]
        )
      },
      {
        id: "p5",
        clock: 1440,
        priority: 2,
        title: L(["The partner pulls the plug", "Partnern drar ur sladden"]),
        twist: L(["Your payment partner has suspended your connection: their contract forbids integrations that skip certificate checks, and they want an independent confirmation before you reconnect.", "Er betalningspartner har stängt av er anslutning: deras avtal förbjuder integrationer som hoppar över certifikatkontroller, och de vill ha en oberoende bekräftelse innan ni ansluter igen."]),
        twistKind: "authority",
        assumptionChallenged: L(["We decide when our services are back.", "Vi bestämmer när våra tjänster är tillbaka."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}. The certificate authority has been renewed and most services run normally again. The crisis team expects to stand down today.\n\nThen {{person.supplierManager.name}} brings a letter from one of your most important partners. The partner has read about the night's workarounds, and its contract has something to say about them.",
          "{{time.T+1440|weekday|cap}}. Certifikatutfärdaren har förnyats och de flesta tjänster fungerar normalt igen. Krisledningen räknar med att avvecklas i dag.\n\nSedan kommer {{person.supplierManager.name}} med ett brev från en av era viktigaste partner. Partnern har läst om nattens nödlösningar, och dess avtal har något att säga om dem."
        ]),
        injects: [
          inj("i5-1", 1440, "supplierNotice", "supplier", "high", "confirmed", [
            "{{supplier.payments}}: “Your connection is suspended. Reconnection requires written confirmation from an independent assessor that certificate validation is enforced on all integrations with us.”",
            "{{supplier.payments}}: ”Er anslutning är avstängd. Återanslutning kräver skriftlig bekräftelse från en oberoende granskare att certifikatkontroll upprätthålls i alla integrationer med oss.”"
          ], { pressure: "suppliers", substitute: { type: "executiveMessage", source: "person.cio", content: ["“Our auditors want proof that certificate checking is back on everywhere before the quarter closes.”", "”Våra revisorer vill ha bevis för att certifikatkontrollen är påslagen överallt igen innan kvartalet stängs.”"] }, tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How do you prove that checks are on everywhere?", "Hur bevisar ni att kontrollerna är påslagna överallt?", ["itOps", "devLead"]),
            q("Is anything still trusting the fake root?", "Litar något fortfarande på den falska roten?", ["socLead"]),
            q("Did removing every workaround break anything you hadn't expected?", "Slog borttagandet av alla nödlösningar ut något ni inte hade väntat er?", ["itOps"], "d4")
          ],
          executive: [
            q("How much revenue stops while payments are suspended?", "Hur mycket intäkter stoppas medan betalningarna är avstängda?", ["serviceOwner", "ceo"]),
            q("Who do you bring in as the independent assessor, and how fast?", "Vem tar ni in som oberoende granskare, och hur snabbt?", ["supplierManager"]),
            q("Would you have acted on the workarounds differently, knowing this contract?", "Hade ni hanterat nödlösningarna annorlunda om ni känt till det här avtalet?", ["ciso"], "d4")
          ]
        },
        challenges: [ch("The partner's letter was copied to the regulator for payments.", "Partnerns brev skickades i kopia till tillsynsmyndigheten för betalningar.")],
        noDecision: L(["No vote here: the partner decides. Let the room plan how to meet the condition fast and honestly.", "Ingen omröstning här: partnern bestämmer. Låt rummet planera hur villkoret uppfylls snabbt och ärligt."]),
        facilitator: fac(
          ["Authority sits with the partner now; the only lever is evidence.", "Befogenheten ligger nu hos partnern; det enda verktyget är belägg."],
          ["An independent check and a clear evidence pack.", "En oberoende kontroll och ett tydligt underlag."],
          [["Ask: what evidence would convince you, if you were the partner?", "Fråga: vilket underlag skulle övertyga er, om ni var partnern?"]]
        )
      },
      {
        id: "p6",
        clock: 4320,
        priority: 3,
        title: L(["Every date", "Varje datum"]),
        twist: L(["A full search finds {{num.systems}} certificates in use across the company. Forty expire in the next ninety days; nobody owns most of them.", "En fullständig genomsökning hittar {{num.systems}} certifikat i bruk i företaget. Fyrtio går ut inom nittio dagar; de flesta saknar ägare."]),
        twistKind: "impact",
        reconsider: { decision: "d4", pressure: { en: "The payment partner wants independent confirmation before reconnecting. Was your clean-up thorough enough to show them?", sv: "Betalpartnern vill ha en oberoende bekräftelse innan de kopplar upp igen. Var er sanering tillräckligt grundlig för att visa upp?" } },
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because a keyholder was called back from holiday, they arrived exhausted, and the ceremony record has two errors the auditor will find.", sv: "Eftersom en nyckelinnehavare kallades tillbaka från semestern kom hen utmattad, och ceremoniprotokollet har två fel som revisorn kommer att hitta." } }
        ],
        assumptionChallenged: L(["It was one forgotten certificate.", "Det var ett bortglömt certifikat."]),
        narrative: L([
          "{{time.T+4320|weekday|cap}}. {{person.itOps.name}} presents the results of a full search for certificates across the company, something nobody had done before.\n\nThe midnight failure was one certificate that nobody had on a list. The search shows how many more there are, and how many dates are waiting in the next few months.",
          "{{time.T+4320|weekday|cap}}. {{person.itOps.name}} presenterar resultatet av en fullständig genomsökning efter certifikat i hela företaget, något som ingen hade gjort tidigare.\n\nFelet vid midnatt var ett enda certifikat som ingen hade på någon lista. Genomsökningen visar hur många fler det finns, och hur många datum som väntar de närmaste månaderna."
        ]),
        injects: [
          inj("i6-1", 4320, "impactReport", "itOps", "medium", "confirmed", [
            "Certificates found: {{num.systems}}. Owners recorded: 31 percent. Expiring within 90 days: 40, including two used by customer-facing services.",
            "Hittade certifikat: {{num.systems}}. Registrerade ägare: 31 procent. Går ut inom 90 dagar: 40, varav två används av tjänster mot kunder."
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which certificates can renew automatically, and which can't?", "Vilka certifikat kan förnyas automatiskt, och vilka kan inte det?", ["itOps", "networkLead"]),
            q("How do you make switching off a certificate check impossible without approval?", "Hur gör ni det omöjligt att stänga av en certifikatkontroll utan godkännande?", ["devLead", "ciso"]),
            q("Was the root ceremony handled in a way you'd repeat?", "Genomfördes ceremonin för roten på ett sätt ni skulle upprepa?", ["ciso"], "d3")
          ],
          executive: [
            q("Who owns certificates and keys as a whole?", "Vem äger certifikat och nycklar som helhet?", ["cio"]),
            q("What else in the company has a date nobody is watching?", "Vad mer i företaget har ett datum som ingen bevakar?", ["cio", "ceo"]),
            q("Which decision in the first hour mattered most?", "Vilket beslut under den första timmen spelade störst roll?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Two of the expiring certificates belong to a system nobody admits to running.", "Två av certifikaten som går ut tillhör ett system som ingen säger sig driva.")],
        decision: dec("d5", "cio", ["What do you change?", "Vad ändrar ni?"], [
          ["One owner for certificates and keys, an inventory with alerts, automatic renewal where possible, and two trained keyholders more.", "En ägare för certifikat och nycklar, en förteckning med larm, automatisk förnyelse där det går och två utbildade nyckelinnehavare till."],
          ["Put every expiry date in a shared calendar with reminders to named owners, starting this week.", "Lägg varje utgångsdatum i en gemensam kalender med påminnelser till utsedda ägare, med start den här veckan."],
          ["Buy longer-lived certificates.", "Köp certifikat med längre livslängd."]
        ], {
          knowns: [["Most certificates have no owner.", "De flesta certifikat saknar ägare."]],
          uncertainties: [["How many hidden systems still use the old chain.", "Hur många dolda system som fortfarande använder den gamla kedjan."]],
          tradeoffs: {
            operational: ["Automation takes effort up front.", "Automatisering kräver arbete i början."],
            security: ["Long-lived certificates make the next expiry worse.", "Certifikat med lång livslängd gör nästa utgång värre."],
            legal: ["Partners may audit your certificate practices.", "Partner kan granska er certifikathantering."],
            reputational: ["The next expiry will not be forgiven.", "Nästa utgång kommer inte att förlåtas."]
          },
          evaluation: [["Gives certificates an owner and makes expiry visible in advance", "Ger certifikaten en ägare och gör utgångar synliga i förväg"]],
          pushback: {
            A: [
              pb(["Nobody volunteers", "Ingen anmäler sig"], ["Nobody wants to own certificates and keys: {{person.itOps.name}} says it is a security job, and security says it is operations. Without an owner, the rest of the plan has nobody to run it. Who gets it, and what do they stop doing to make room?", "Ingen vill äga certifikat och nycklar: {{person.itOps.name}} säger att det är ett säkerhetsjobb, och säkerhet säger att det är drift. Utan en ägare har resten av planen ingen som driver den. Vem får uppdraget, och vad slutar hen göra för att få plats?"]),
              pb(["Forty before it's built", "Fyrtio innan det är byggt"], ["Automation and a proper inventory take months to build, but forty certificates expire in the next ninety days, two of them customer-facing. The plan does nothing for those yet. Who handles them by hand, starting tomorrow?", "Automatisering och en riktig förteckning tar månader att bygga, men fyrtio certifikat går ut de närmaste nittio dagarna, två av dem i kundnära tjänster. Planen gör ännu ingenting för dem. Vem hanterar dem för hand, med start i morgon?"]),
              pb(["Two more is still few", "Två till är fortfarande få"], ["The only candidates for the new keyholder roles sit in the same team and office as the first two. One bad week, or one reorganisation, could leave you exactly where you were. Is “two more” really enough, and who chooses them?", "De enda kandidaterna till de nya nyckelinnehavarrollerna sitter i samma team och på samma kontor som de två första. En dålig vecka, eller en omorganisation, kan lämna er precis där ni var. Räcker verkligen ”två till”, och vem väljer dem?"])
            ],
            B: [
              pb(["The owner left", "Ägaren slutade"], ["The certificate that failed at midnight once had an owner: the engineer who issued it and then left. A calendar reminder to a named person disappears with their account. What happens to a reminder when its owner moves on?", "Certifikatet som gick ut vid midnatt hade en gång en ägare: teknikern som utfärdade det och sedan slutade. En kalenderpåminnelse till en namngiven person försvinner med hens konto. Vad händer med en påminnelse när ägaren går vidare?"]),
              pb(["Most have no name", "De flesta saknar namn"], ["Reminders need named owners, and only 31 percent of certificates have one. The rest belong to teams that say they do not run them. Who is named on the remaining 69 percent, by the end of this week?", "Påminnelser kräver utsedda ägare, och bara 31 procent av certifikaten har en. Resten tillhör team som säger att de inte driver dem. Vem står som ägare för de återstående 69 procenten, före veckans slut?"]),
              pb(["Snoozed reminders", "Bortsnoozade påminnelser"], ["{{person.networkLead.name}} warns that forty reminders in ninety days, landing in the same inboxes as everything else, will be snoozed. A reminder does not renew anything. Who checks that each renewal actually happened?", "{{person.networkLead.name}} varnar för att fyrtio påminnelser på nittio dagar, i samma inkorgar som allt annat, kommer att skjutas upp. En påminnelse förnyar ingenting. Vem kontrollerar att varje förnyelse faktiskt blev gjord?"])
            ],
            C: [
              pb(["Five years was the problem", "Fem år var problemet"], ["The intermediate that failed had a five-year lifetime, and everyone who knew about it had gone by the time it expired. Does a longer lifetime prevent the next midnight, or just move it further away from anyone who remembers?", "Det mellanliggande certifikatet som gick ut hade fem års livslängd, och alla som kände till det hade försvunnit när det gick ut. Förhindrar en längre livslängd nästa midnatt, eller flyttar den bara längre bort från alla som minns?"]),
              pb(["Not accepted everywhere", "Godtas inte överallt"], ["{{person.devLead.name}} points out that browsers and many partner integrations already reject certificates with long lifetimes. Some of the forty expiring ones cannot be replaced with longer ones at all. What is your plan for those?", "{{person.devLead.name}} påpekar att webbläsare och många partnerintegrationer redan avvisar certifikat med lång livslängd. En del av de fyrtio som går ut kan inte ersättas med längre alls. Vad är er plan för dem?"]),
              pb(["Still nobody's job", "Fortfarande ingens jobb"], ["Longer certificates do not answer the question midnight raised: who owns them? The search found most have no owner, whatever their lifetime. When the first long-lived one expires, who is accountable?", "Längre certifikat besvarar inte frågan som midnatt väckte: vem äger dem? Genomsökningen visade att de flesta saknar ägare, oavsett livslängd. När det första långlivade certifikatet går ut, vem är ansvarig?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["One owner", "En ägare"], [
              io(["A volunteer", "En frivillig"], ["{{person.networkLead.name}} offers to own certificates and keys, on condition that something else leaves their desk. The CIO agrees on the spot, and the first automated renewal runs within the week.", "{{person.networkLead.name}} erbjuder sig att äga certifikat och nycklar, på villkor att något annat försvinner från hens bord. It-chefen säger ja direkt, och den första automatiska förnyelsen körs inom en vecka."], ["Certificates have an owner; the first automated renewal has run.", "Certifikaten har en ägare; den första automatiska förnyelsen har körts."]),
              io(["No budget this year", "Ingen budget i år"], ["Finance replies that the automation tooling and the keyholder training are not in this year's budget, and the earliest approval is next quarter. Forty certificates expire before then.", "Ekonomi svarar att verktygen för automatisering och utbildningen av nyckelinnehavare inte finns i årets budget, och att godkännande tidigast kan ges nästa kvartal. Fyrtio certifikat går ut innan dess."], ["The plan cannot be funded until next quarter.", "Planen kan inte finansieras förrän nästa kvartal."], { reopen: true }),
              io(["The first scan", "Den första genomsökningen"], ["The new inventory's first run flags a certificate that expired last month on a system everyone believes is unused. Nobody can say for certain what still depends on it.", "Förteckningens första körning flaggar ett certifikat som gick ut förra månaden på ett system som alla tror är oanvänt. Ingen kan säga säkert vad som fortfarande är beroende av det."], ["An expired certificate was found that nobody can explain.", "Ett utgånget certifikat hittades som ingen kan förklara."])
            ]),
            ir("i2", { notChosen: "A" }, ["Still nobody's job", "Fortfarande ingens jobb"], [
              io(["Nine days left", "Nio dagar kvar"], ["{{person.itOps.name}} notices that one of the forty expiring certificates runs out in nine days, on a customer-facing service. Under your plan, nobody in particular is responsible for it.", "{{person.itOps.name}} ser att ett av de fyrtio certifikat som går ut löper ut om nio dagar, i en kundnära tjänst. Med er plan är ingen särskild ansvarig för det."], ["A customer-facing certificate expires in nine days with no owner.", "Ett certifikat i en kundnära tjänst går ut om nio dagar utan ägare."], { reopen: true }),
              io(["It looks solved", "Det ser löst ut"], ["The change is in place within days and the board is told the problem is solved. Nobody asks who will still be watching in five years.", "Ändringen är på plats inom några dagar och styrelsen får höra att problemet är löst. Ingen frågar vem som fortfarande håller koll om fem år."], ["The board has been told certificate expiry is solved.", "Styrelsen har fått höra att certifikatutgångarna är lösta."]),
              io(["The auditor's finding", "Revisorns anmärkning"], ["The external auditor's interim report lists certificate management as a significant finding: a reminder is not a control. The report goes to the board next month.", "Den externa revisorns delrapport tar upp certifikathanteringen som en väsentlig anmärkning: en påminnelse är ingen kontroll. Rapporten går till styrelsen nästa månad."], ["The auditor has flagged certificate management as a significant finding.", "Revisorn har anmärkt på certifikathanteringen som en väsentlig brist."])
            ])
          ]
        }),
        facilitator: fac(
          ["End on ownership and on the workaround culture that made the attack work.", "Avsluta med ägarskap och med kulturen kring nödlösningar som fick angreppet att fungera."],
          ["An owner, an inventory, automation and more than two keyholders.", "En ägare, en förteckning, automatisering och fler än två nyckelinnehavare."],
          [["Ask: what will expire at midnight next year?", "Fråga: vad går ut vid midnatt nästa år?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The PKI is renewed and the workarounds removed, but orders were sent to an attacker for an hour and the payment partner's trust takes weeks to win back.",
        "PKI:n är förnyad och nödlösningarna borttagna, men beställningar skickades till en angripare i en timme och betalningspartnerns förtroende tar veckor att vinna tillbaka."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Something failing at exactly midnight is usually a date, not an attacker: check before escalating.", "Något som slutar fungera exakt vid midnatt är oftast ett datum, inte en angripare: kontrollera innan ni trappar upp."]),
        L(["Workarounds that remove a security control invite attacks.", "Nödlösningar som tar bort en säkerhetskontroll bjuder in till angrepp."]),
        L(["Opportunists exploit outages with fake fix instructions.", "Opportunister utnyttjar avbrott med falska instruktioner för att lösa problemet."]),
        L(["Certificates, keys and the people who hold them need owners and an inventory.", "Certifikat, nycklar och de personer som har dem behöver ägare och en förteckning."])
      ],
      assumptionsVsReality: [
        avr(["An attack on our PKI.", "Ett angrepp mot vår PKI."], ["An expired certificate nobody owned.", "Ett utgånget certifikat som ingen ägde."], "p2"),
        avr(["Renewal is a quick task.", "Förnyelse är en snabb uppgift."], ["It needs a safe and two absent people.", "Det kräver ett kassaskåp och två personer som är borta."], "p3"),
        avr(["Just an outage.", "Bara ett avbrott."], ["The workaround enabled a real attack.", "Nödlösningen möjliggjorde ett verkligt angrepp."], "p4")
      ],
      strengthsToLookFor: [
        L(["Checking the certificate chain before declaring an attack", "Att kontrollera certifikatkedjan innan ett angrepp utlyses"]),
        L(["Refusing to disable certificate checks", "Att vägra stänga av certifikatkontroller"]),
        L(["Warning staff about fake IT messages during the outage", "Att varna personalen för falska IT-meddelanden under avbrottet"])
      ],
      commonGaps: [
        L(["Escalating to “attack” without checking", "Att trappa upp till ”angrepp” utan att kontrollera"]),
        L(["Teams disabling checks on their own", "Att team stänger av kontroller på egen hand"]),
        L(["Single keyholders for critical secrets", "Enskilda nyckelinnehavare för kritiska hemligheter"])
      ],
      suggestedActions: [
        act(["Build a certificate inventory with owners and expiry alerts.", "Bygg en förteckning över certifikat med ägare och larm inför utgång."], "itOps", "high"),
        act(["Train at least four keyholders for the root ceremony and test it yearly.", "Utbilda minst fyra nyckelinnehavare för ceremonin för roten och testa den årligen."], "ciso", "high"),
        act(["Make disabling certificate validation a change that needs security approval.", "Gör avstängning av certifikatkontroll till en ändring som kräver säkerhetsgodkännande."], "devLead", "medium"),
        act(["Warn staff about fake IT fixes in every outage message.", "Varna personalen för falska IT-lösningar i varje meddelande om avbrott."], "comms", "medium")
      ]
    }
  });
})();
