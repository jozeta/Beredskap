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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
          ["Wait for the morning team.", "Vänta på morgonens team."]
        ], {
          knowns: [["Everything failed at once at midnight with trust errors.", "Allt fallerade samtidigt vid midnatt med förtroendefel."]],
          uncertainties: [["Whether anything malicious is involved.", "Om något skadligt är inblandat."]],
          tradeoffs: {
            operational: ["Cutting connections makes the outage worse if it is a fault.", "Att kapa förbindelser förvärrar avbrottet om det är ett fel."],
            security: ["Assuming a fault too quickly could miss an attack.", "Att för snabbt anta ett fel kan missa ett angrepp."],
            legal: ["Declaring an attack starts reporting obligations.", "Att utlysa ett angrepp startar rapporteringsskyldigheter."],
            reputational: ["Partners are already noticing.", "Partnerna märker det redan."]
          },
          evaluation: [["Tests the simplest explanation before the dramatic one", "Prövar den enklaste förklaringen före den dramatiska"]]
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
          evaluation: [["Restores trust without removing the control that provides it", "Återställer förtroendet utan att ta bort kontrollen som ger det"]]
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
          ["Force the safe and guess the procedure.", "Bryt upp kassaskåpet och gissa proceduren."],
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
          evaluation: [["Protects the root key even under pressure", "Skyddar rotnyckeln även under tryck"]]
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
          ["Warn staff and let them remove the certificate themselves.", "Varna personalen och låt dem ta bort certifikatet själva."]
        ], {
          knowns: [["Checks are off on many systems; a fake root is installed on some computers.", "Kontrollerna är avstängda på många system; en falsk rot är installerad på en del datorer."]],
          uncertainties: [["What else the attacker intercepted.", "Vad mer angriparen fångade upp."]],
          tradeoffs: {
            operational: ["Turning checks back on may break services again.", "Att slå på kontrollerna igen kan slå ut tjänster på nytt."],
            security: ["Every hour with checks off and a fake root installed is open interception.", "Varje timme med avstängda kontroller och en falsk rot installerad är öppen avlyssning."],
            legal: ["Partner data was sent to an attacker.", "Partnerdata skickades till en angripare."],
            reputational: ["The outage story is becoming a breach story.", "Avbrottshistorien håller på att bli en intrångshistoria."]
          },
          evaluation: [["Removes every workaround and the fake root, not only the one that was caught", "Tar bort varje nödlösning och den falska roten, inte bara den som upptäcktes"]]
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
          ["Put the expiry dates in a shared calendar.", "Lägg utgångsdatumen i en gemensam kalender."],
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
          evaluation: [["Gives certificates an owner and makes expiry visible in advance", "Ger certifikaten en ägare och gör utgångar synliga i förväg"]]
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
