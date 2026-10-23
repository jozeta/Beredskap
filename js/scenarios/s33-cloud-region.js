/*
 * s33-cloud-region.js — "The Region Is Gone" (archetype B, disaster recovery).
 *
 * Every cloud service in the primary region fails at once; some suspect an
 * attack → a fire and power failure have taken the provider's whole region
 * down for days, control plane included → the failover plan was never tested
 * and depends on the region that is gone → sign-in and the secondary region
 * both turn out to be problems: identity lives in the dead region and the
 * backups sit outside the EU → reporting a significant disruption → one
 * provider, one region, almost everything.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s33-cloud-region",
    version: 1,
    category: "disaster-recovery",
    archetype: "ambiguous-start",
    emblem: "region-down",
    title: L(["The Region Is Gone", "Regionen är borta"]),
    summary: L([
      "Everything in your cloud region stops at once. There is no attacker, only a fire in a building you have never seen. Your recovery plan is about to meet reality for the first time.",
      "Allt i er molnregion stannar på en gång. Det finns ingen angripare, bara en brand i en byggnad ni aldrig har sett. Er återställningsplan är på väg att möta verkligheten för första gången."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Decide on failover with incomplete information from a provider", "Besluta om reservdrift med ofullständig information från en leverantör"]), teaser: L(["Waiting or moving", "Att vänta eller flytta"]) },
      { id: "lo2", text: L(["Find the hidden dependencies in a recovery plan", "Hitta de dolda beroendena i en återställningsplan"]), teaser: L(["What the plan forgot", "Vad planen glömde"]) },
      { id: "lo3", text: L(["Balance recovery speed against data protection and contracts", "Väga återställningstakt mot dataskydd och avtal"]), teaser: L(["Fast, but where?", "Snabbt, men var?"]) },
      { id: "lo4", text: L(["Manage concentration risk on a single provider", "Hantera koncentrationsrisk hos en enda leverantör"]), teaser: L(["All the eggs", "Alla äggen"]) }
    ],
    mitre: ["T1499"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.AM", "ID.RA", "PR.IR", "RS.MA", "RS.CO", "RC.RP", "RC.CO"],
      iso27001: ["A.5.19", "A.5.23", "A.5.29", "A.5.30", "A.5.34", "A.7.5", "A.8.13", "A.8.14"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours" },
    actor: { types: ["unknown"], motivation: L(["None: a physical failure at the cloud provider", "Ingen: ett fysiskt fel hos molnleverantören"]), capability: "low" },
    variables: {
      services: { min: 6, max: 60, scaleBy: "size" },
      customers: { min: 2000, max: 400000, scaleBy: "size", step: 100 },
      hours: { min: 30, max: 72 }
    },
    roles: ["incidentCommander", "cio", "cloudLead", "itOps", "networkLead", "serviceOwner", "ciso", "dpo", "legal", "comms", "ceo", "supplierManager"],

    groundTruth: {
      rootCause: L([
        "A fire in the electrical room of one of the provider's facilities triggered a power and cooling failure that cascaded across the region. The provider shut the whole region down, including its management services, for {{num.hours}} hours. {{org.name}}'s architecture spread services across zones in that region but treated the region itself as safe. The failover plan had never been tested, relied on the region's own identity and secrets services, and pointed to a backup region outside the EU chosen years earlier for cost.",
        "En brand i elrummet i en av leverantörens anläggningar orsakade ett ström- och kylfel som spred sig över regionen. Leverantören stängde ner hela regionen, inklusive dess administrationstjänster, i {{num.hours}} timmar. {{org.name}}s arkitektur fördelade tjänsterna över zoner i den regionen men behandlade själva regionen som säker. Planen för reservdrift hade aldrig testats, var beroende av regionens egna tjänster för identitet och hemligheter, och pekade på en reservregion utanför EU som valts för flera år sedan av kostnadsskäl."
      ]),
      attackerTimeline: [
        { at: -30, text: L(["Fire in an electrical room at the provider's facility.", "Brand i ett elrum i leverantörens anläggning."]) },
        { at: 0, text: L(["Power and cooling fail across the region.", "Ström och kylning fallerar i hela regionen."]) },
        { at: 120, text: L(["Provider shuts down the region, including management services.", "Leverantören stänger ner regionen, inklusive administrationstjänsterna."]) },
        { at: 2880, text: L(["Region partially restored.", "Regionen delvis återställd."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-fire", revealStage: "p2", text: L(["An electrical-room fire cascaded into a full regional shutdown, with no restoration estimate.", "En brand i ett elrum spred sig till en fullständig nedstängning av regionen, utan uppskattning av när den återställs."]) },
      { id: "hf-deps", revealStage: "p4", text: L(["Sign-in, secrets and the backup copies depend on the dead region or sit outside the EU.", "Inloggning, hemligheter och säkerhetskopiorna är beroende av den döda regionen eller ligger utanför EU."]) },
      { id: "hf-concentration", revealStage: "p6", text: L(["Nearly every critical service, and the tooling to recover them, runs with one provider in one region.", "Nästan varje kritisk tjänst, och verktygen för att återställa dem, körs hos en leverantör i en region."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Everything at once", "Allt på en gång"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. Monitoring goes red across the board. {{org.service.primary}}, the customer app, the internal systems: {{num.services}} services stop answering within the same two minutes.\n\nThe cloud provider's status page shows a yellow triangle and the word “investigating”. In the crisis channel, someone asks whether this is the attack everybody has been warning about.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Övervakningen blir röd över hela linjen. {{org.service.primary}}, kundappen, de interna systemen: {{num.services}} tjänster slutar svara inom samma två minuter.\n\nMolnleverantörens statussida visar en gul triangel och ordet ”undersöker”. I krisledningens kanal frågar någon om det här är angreppet som alla har varnat för."
        ]),
        injects: [
          inj("i1-1", 0, "siemAlert", "itOps", "critical", "confirmed", [
            "{{num.services}} services unreachable since {{time.T+0|clock}}. All hosted in the primary region, across all three zones. Management console: timing out.",
            "{{num.services}} tjänster onåbara sedan {{time.T+0|clock}}. Alla ligger i den primära regionen, i alla tre zonerna. Administrationskonsolen: tidsgräns överskriden."
          ], { tests: ["lo1"] }),
          inj("i1-2", 10, "statusPage", "vendor", "medium", "unverified", [
            "We are investigating increased error rates for multiple services in one region. We will provide an update within 60 minutes.",
            "Vi undersöker ökade felfrekvenser för flera tjänster i en region. Vi återkommer med en uppdatering inom 60 minuter."
          ], { headline: ["Investigating: increased error rates", "Undersöker: ökade felfrekvenser"], tests: ["lo1"] }),
          inj("i1-3", 20, "chat", "person.ciso", "medium", "misleading", [
            "“Everything at once across three zones? That's what a coordinated attack looks like. I want the SOC looking for intrusion.”",
            "”Allt på en gång över tre zoner? Det är så ett samordnat angrepp ser ut. Jag vill att SOC letar efter intrång.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["A fair question, but region-wide symptoms point at the provider.", "En rimlig fråga, men symtom i hela regionen pekar på leverantören."], tests: ["lo1"] })
        ],
        charts: [{
          id: "c1-up", type: "line",
          title: L(["Services answering", "Tjänster som svarar"]), unit: L(["services", "tjänster"]),
          caption: L(["Minutes around the failure.", "Minuter kring felet."]),
          data: line(["Services up", "Tjänster uppe"], -20, 30, 5, (x, ctx) => (x < 0 ? ctx.vars.services : 0))
        }],
        questions: {
          technical: [
            q("Is it only your services, or everything in that region?", "Är det bara era tjänster, eller allt i den regionen?", ["cloudLead", "networkLead"]),
            q("What runs outside the primary region today?", "Vad körs utanför den primära regionen i dag?", ["cloudLead"]),
            q("Where is your failover plan, and when was it last used?", "Var finns er plan för reservdrift, och när användes den senast?", ["itOps", "cloudLead"])
          ],
          executive: [
            q("Who decides whether to wait or to fail over?", "Vem bestämmer om ni ska vänta eller gå över till reservdrift?", ["incidentCommander", "cio"]),
            q("What do you tell customers in the first hour?", "Vad säger ni till kunderna under den första timmen?", ["comms", "serviceOwner"]),
            q("Is this a security incident until proven otherwise?", "Är det här en säkerhetsincident tills motsatsen är bevisad?", ["ciso", "incidentCommander"])
          ]
        },
        challenges: [ch("Your own status page is hosted in the same region and is also down.", "Er egen statussida ligger i samma region och är också nere.")],
        decision: dec("d1", "incidentCommander", ["What do you do in the first hour?", "Vad gör ni under den första timmen?"], [
          ["Confirm with the provider and peers whether it is regional, start preparing failover, and tell customers you know.", "Bekräfta med leverantören och andra om det är regionalt, börja förbereda reservdrift och berätta för kunderna att ni vet."],
          ["Treat it as an attack and isolate everything.", "Behandla det som ett angrepp och isolera allt."],
          ["Wait for the provider's 60-minute update.", "Vänta på leverantörens uppdatering om 60 minuter."]
        ], {
          knowns: [["Everything in one region failed at once.", "Allt i en region fallerade på en gång."]],
          uncertainties: [["The cause, and how long it will last.", "Orsaken, och hur länge det varar."]],
          tradeoffs: {
            operational: ["Preparing failover takes people away from diagnosis.", "Att förbereda reservdrift tar folk från felsökningen."],
            security: ["Dismissing an attack too early is a risk; so is isolating a failure.", "Att avfärda ett angrepp för tidigt är en risk; det är också att isolera ett fel."],
            legal: ["Customer contracts promise availability you are not meeting.", "Kundavtalen lovar en tillgänglighet som ni inte levererar."],
            reputational: ["Silence in the first hour is noticed.", "Tystnad under den första timmen märks."]
          },
          evaluation: [["Checks the scope fast and prepares to act without waiting", "Kontrollerar omfattningen snabbt och förbereder sig på att agera utan att vänta"]]
        }),
        facilitator: fac(
          ["Region-wide symptoms usually mean the provider. The value is in preparing failover early.", "Symtom i hela regionen betyder oftast leverantören. Värdet ligger i att förbereda reservdriften tidigt."],
          ["Confirm scope, prepare failover in parallel, early customer message.", "Bekräfta omfattningen, förbered reservdrift parallellt, tidigt meddelande till kunderna."],
          [["Ask: what do other companies in the same region see?", "Fråga: vad ser andra företag i samma region?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 120,
        title: L(["A fire", "En brand"]),
        twist: L(["The provider confirms a fire and power failure that has forced a shutdown of the whole region, management services included. There is no estimate. Their message says “at least 24 hours”.", "Leverantören bekräftar en brand och ett strömavbrott som tvingat fram en nedstängning av hela regionen, administrationstjänsterna inräknade. Det finns ingen uppskattning. Deras meddelande säger ”minst 24 timmar”."]),
        twistKind: "cause",
        assumptionChallenged: L(["Three zones mean we cannot lose everything.", "Tre zoner betyder att vi inte kan förlora allt."]),
        reveals: ["hf-fire"],
        narrative: L([
          "{{time.T+120|clock}}. The provider's update is short and sober. Its engineers are not allowed into the building until the fire service gives the all-clear.\n\nYour architecture was built across three zones so that no single failure could take everything down. The design assumed zones fail one at a time. Nobody planned for the region itself to stop.",
          "Klockan {{time.T+120|clock}}. Leverantörens uppdatering är kort och saklig. Dess tekniker får inte gå in i byggnaden förrän räddningstjänsten har gett klartecken.\n\nEr arkitektur byggdes över tre zoner så att inget enskilt fel skulle kunna slå ut allt. Designen förutsatte att zoner fallerar en i taget. Ingen planerade för att själva regionen skulle stanna."
        ]),
        injects: [
          inj("i2-1", 120, "statusPage", "vendor", "critical", "confirmed", [
            "A fire in a facility has caused a loss of power and cooling. As a precaution, all services in the region, including management services, are shut down. We expect this to last at least 24 hours.",
            "En brand i en anläggning har orsakat förlust av ström och kylning. Som en försiktighetsåtgärd är alla tjänster i regionen, inklusive administrationstjänster, nedstängda. Vi räknar med att det varar minst 24 timmar."
          ], { headline: ["Major outage: regional shutdown", "Stort avbrott: regional nedstängning"], reveals: ["hf-fire"], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Can you fail over without the region's management console?", "Kan ni gå över till reservdrift utan regionens administrationskonsol?", ["cloudLead"]),
            q("How old is the newest copy of your data outside the region?", "Hur gammal är den nyaste kopian av er data utanför regionen?", ["itOps", "cloudLead"]),
            q("Did preparing failover in the first hour save time now?", "Sparade förberedelserna för reservdrift under den första timmen tid nu?", ["cloudLead"], "d1")
          ],
          executive: [
            q("Is 24 hours or more acceptable, or do you move?", "Är 24 timmar eller mer acceptabelt, eller flyttar ni?", ["cio", "ceo"]),
            q("What does it cost to fail over and then fail back?", "Vad kostar det att gå över till reservdrift och sedan tillbaka?", ["cio"]),
            q("If you had treated it as an attack, what would you have isolated for nothing?", "Om ni hade behandlat det som ett angrepp, vad hade ni isolerat i onödan?", ["ciso"], "d1")
          ]
        },
        challenges: [ch("The provider's “24 hours” has an asterisk: “subject to fire service assessment”.", "Leverantörens ”24 timmar” har en asterisk: ”förutsatt räddningstjänstens bedömning”.")],
        decision: dec("d2", "cio", ["Do you fail over?", "Går ni över till reservdrift?"], [
          ["Fail over the most critical services now, in priority order, and accept the cost.", "Gå över till reservdrift för de mest kritiska tjänsterna nu, i prioritetsordning, och acceptera kostnaden."],
          ["Wait 24 hours for the provider before deciding.", "Vänta 24 timmar på leverantören innan ni bestämmer er."],
          ["Fail over everything at once.", "Gå över till reservdrift för allt på en gång."]
        ], {
          knowns: [["The region is down for at least a day, with no firm estimate.", "Regionen ligger nere minst ett dygn, utan säker uppskattning."]],
          uncertainties: [["Whether the failover plan works at all.", "Om planen för reservdrift fungerar över huvud taget."]],
          tradeoffs: {
            operational: ["Failover may lose the last hours of data.", "Reservdriften kan förlora de sista timmarnas data."],
            security: ["A rushed failover may skip controls.", "En forcerad reservdrift kan hoppa över kontroller."],
            legal: ["Every hour down eats into contracted availability.", "Varje timme nere äter av avtalad tillgänglighet."],
            reputational: ["Customers compare you to competitors who are back.", "Kunderna jämför er med konkurrenter som är igång igen."]
          },
          evaluation: [["Moves the most critical services first instead of waiting for certainty", "Flyttar de mest kritiska tjänsterna först i stället för att vänta på visshet"]]
        }),
        facilitator: fac(
          ["The decision is about uncertainty: the provider cannot promise. Waiting is also a decision.", "Beslutet handlar om osäkerhet: leverantören kan inte lova något. Att vänta är också ett beslut."],
          ["Prioritised failover of the most critical services now.", "Prioriterad reservdrift för de mest kritiska tjänsterna nu."],
          [["Ask: what would make you regret waiting, and what would make you regret moving?", "Fråga: vad skulle få er att ångra att ni väntade, och vad skulle få er att ångra att ni flyttade?"]]
        )
      },
      {
        id: "p3",
        clock: 300,
        priority: 1,
        title: L(["The runbook", "Driftrutinen"]),
        twist: L(["The failover runbook has never been run. Step 3 says “open the management console”, which is in the dead region. Step 7 retrieves secrets from a vault that also lives there.", "Driftrutinen för reservdrift har aldrig körts. Steg 3 säger ”öppna administrationskonsolen”, som ligger i den döda regionen. Steg 7 hämtar hemligheter från ett valv som också ligger där."]),
        twistKind: "impact",
        assumptionChallenged: L(["We have a tested disaster recovery plan.", "Vi har en testad plan för katastrofåterställning."]),
        narrative: L([
          "{{time.T+300|clock}}. {{person.cloudLead.name}} opens the disaster recovery runbook. It is well written, with screenshots, and it was approved by the board two years ago as part of an audit.\n\nIt has never actually been run. The team starts at step one, reading aloud, and by step three it is already clear who wrote it and what they assumed would always be there.",
          "Klockan {{time.T+300|clock}}. {{person.cloudLead.name}} öppnar driftrutinen för katastrofåterställning. Den är välskriven, med skärmbilder, och godkändes av styrelsen för två år sedan som en del av en revision.\n\nDen har aldrig faktiskt körts. Teamet börjar vid steg ett och läser högt, och redan vid steg tre står det klart vem som skrev den och vad hen antog att det alltid skulle finnas."
        ]),
        injects: [
          inj("i3-1", 300, "ticket", "person.cloudLead", "high", "confirmed", [
            "DR runbook v1.4. Step 3: “Log in to the management console (primary region).” Step 7: “Retrieve database credentials from the secrets vault (primary region).” Last test: none recorded.",
            "Driftrutin för katastrofåterställning v1.4. Steg 3: ”Logga in i administrationskonsolen (primär region).” Steg 7: ”Hämta databasinloggningar från valvet för hemligheter (primär region).” Senaste test: inget registrerat."
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Can you reach the secondary region without the primary region's console?", "Kan ni nå den sekundära regionen utan den primära regionens konsol?", ["cloudLead"]),
            q("Where can you get database credentials if the vault is gone?", "Var kan ni få databasinloggningar om valvet är borta?", ["cloudLead", "ciso"]),
            q("Does prioritised failover still make sense with a broken runbook?", "Är prioriterad reservdrift fortfarande vettig med en trasig driftrutin?", ["cio"], "d2")
          ],
          executive: [
            q("Who signed off this plan, and on what evidence?", "Vem godkände den här planen, och på vilka belägg?", ["cio", "ceo"]),
            q("Do you bring in the provider's or an outside team to help?", "Tar ni in leverantörens eller ett externt team för att hjälpa till?", ["supplierManager"]),
            q("Is waiting suddenly more attractive than it was an hour ago?", "Är det plötsligt mer lockande att vänta än för en timme sedan?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("The engineer who wrote the runbook left the company last year.", "Teknikern som skrev driftrutinen slutade på företaget förra året.")],
        decision: dec("d3", "cloudLead", ["How do you proceed?", "Hur går ni vidare?"], [
          ["Rebuild access to the secondary region using break-glass credentials kept offline, and fail over one service at a time.", "Bygg upp åtkomsten till den sekundära regionen med nödinloggningar som förvaras frånkopplade, och gå över till reservdrift en tjänst i taget."],
          ["Improvise all services in parallel to save time.", "Improvisera alla tjänster parallellt för att spara tid."],
          ["Stop and wait for the region to return.", "Stoppa och vänta på att regionen kommer tillbaka."]
        ], {
          knowns: [["The runbook depends on the dead region.", "Driftrutinen är beroende av den döda regionen."]],
          uncertainties: [["Whether break-glass credentials exist and work.", "Om nödinloggningar finns och fungerar."]],
          tradeoffs: {
            operational: ["One service at a time is slow.", "En tjänst i taget går långsamt."],
            security: ["Improvised access tends to leave wide permissions behind.", "Improviserad åtkomst brukar lämna breda behörigheter efter sig."],
            legal: ["Changes made under pressure must still be recorded.", "Ändringar som görs under tryck måste fortfarande dokumenteras."],
            reputational: ["A failed failover is worse than none.", "En misslyckad reservdrift är värre än ingen."]
          },
          evaluation: [["Proceeds carefully on what actually works, recording the gaps", "Går försiktigt vidare med det som faktiskt fungerar och dokumenterar luckorna"]]
        }),
        facilitator: fac(
          ["Untested plans fail on hidden dependencies. Watch for improvisation without control.", "Otestade planer fallerar på dolda beroenden. Var uppmärksam på improvisation utan kontroll."],
          ["Offline break-glass access, service-by-service failover, record every deviation.", "Frånkopplad nödåtkomst, reservdrift tjänst för tjänst, dokumentera varje avvikelse."],
          [["Ask: what else in your plans assumes the primary region exists?", "Fråga: vad mer i era planer förutsätter att den primära regionen finns?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 600,
        title: L(["Locked out, and abroad", "Utelåsta, och utomlands"]),
        twist: L(["Two discoveries at once. Staff sign-in runs in the dead region, so most people cannot log in to anything, including email. And the secondary region chosen years ago for cost is outside the EU, where your customer contracts forbid processing their personal data.", "Två upptäckter på en gång. Personalens inloggning körs i den döda regionen, så de flesta kan inte logga in någonstans, inte ens i e-posten. Och den sekundära regionen, som valdes för flera år sedan av kostnadsskäl, ligger utanför EU, där era kundavtal förbjuder behandling av deras personuppgifter."]),
        twistKind: "scope",
        assumptionChallenged: L(["Only customer services are affected, and the backup region is ours to use.", "Bara kundtjänsterna är drabbade, och reservregionen kan vi använda fritt."]),
        reveals: ["hf-deps"],
        narrative: L([
          "{{time.T+600|clock}}. The first critical service is almost ready in the secondary region. Then the service desk reports that staff cannot log in to email, chat or the HR system, even at the office.\n\nAt the same time {{person.dpo.name}} reads the region name in the failover plan for the first time and looks it up. The cheaper region chosen years ago turns out to be on another continent.",
          "Klockan {{time.T+600|clock}}. Den första kritiska tjänsten är nästan klar i den sekundära regionen. Sedan rapporterar servicedesken att personalen inte kan logga in i e-post, chatt eller HR-systemet, inte ens på kontoret.\n\nSamtidigt läser {{person.dpo.name}} regionnamnet i planen för reservdrift för första gången och slår upp det. Den billigare regionen som valdes för flera år sedan visar sig ligga på en annan kontinent."
        ]),
        injects: [
          inj("i4-1", 600, "ticket", "serviceDesk", "critical", "confirmed", [
            "Staff cannot sign in to email, chat, HR or the VPN. The sign-in service and its directory are hosted in the primary region. Cached sessions are expiring one by one.",
            "Personalen kan inte logga in i e-post, chatt, HR eller VPN. Inloggningstjänsten och dess katalog ligger i den primära regionen. Cachade sessioner går ut en efter en."
          ], { reveals: ["hf-deps"], tests: ["lo2"] }),
          inj("i4-2", 640, "executiveMessage", "person.dpo", "high", "confirmed", [
            "“The secondary region is outside the EU. Our contracts with our largest customers forbid processing their personal data there without their consent. Failing over might put us in breach.”",
            "”Den sekundära regionen ligger utanför EU. Våra avtal med de största kunderna förbjuder behandling av deras personuppgifter där utan deras samtycke. Reservdriften kan innebära att vi bryter mot avtalen.”"
          ], { tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["Where things stand", "Läget just nu"]),
          data: kpi([
            { id: "svc", label: ["Services down", "Tjänster nere"], value: (v) => v.services, tone: "danger" },
            { id: "cust", label: ["Customers affected", "Drabbade kunder"], value: (v) => v.customers, tone: "warn" },
            { id: "up", label: ["Services failed over", "Tjänster i reservdrift"], value: 1, tone: "info" }
          ])
        }],
        questions: {
          technical: [
            q("Can you restore staff sign-in somewhere else, and how?", "Kan ni återställa personalens inloggning någon annanstans, och hur?", ["itOps", "cloudLead"]),
            q("Could you fail over to a different EU region instead?", "Skulle ni kunna gå över till en annan region inom EU i stället?", ["cloudLead"]),
            q("Did the break-glass credentials work?", "Fungerade nödinloggningarna?", ["cloudLead"], "d3")
          ],
          executive: [
            q("Do you ask customers for consent, or not fail over their data?", "Ber ni kunderna om samtycke, eller låter ni bli att flytta deras data?", ["legal", "dpo"]),
            q("How do you run the crisis without email and chat?", "Hur leder ni krisen utan e-post och chatt?", ["incidentCommander"]),
            q("Would waiting for the region have avoided this dilemma?", "Hade väntan på regionen undvikit det här dilemmat?", ["cio"], "d2")
          ]
        },
        challenges: [ch("The crisis team is coordinating on personal phones and a group chat.", "Krisledningen samordnar via privata telefoner och en gruppchatt.")],
        decision: dec("d4", "cio", ["How do you continue?", "Hur fortsätter ni?"], [
          ["Restore sign-in first with emergency accounts, rebuild critical services in an EU region from backups, and tell affected customers.", "Återställ inloggningen först med nödkonton, bygg upp kritiska tjänster i en EU-region från säkerhetskopior och berätta för berörda kunder."],
          ["Fail over to the non-EU region anyway and sort out the contracts later.", "Gå över till reservdrift i regionen utanför EU ändå och reda ut avtalen senare."],
          ["Stop the failover and wait for the primary region.", "Avbryt reservdriften och vänta på den primära regionen."]
        ], {
          knowns: [["Sign-in is down, and the planned backup region conflicts with contracts.", "Inloggningen ligger nere, och den planerade reservregionen strider mot avtalen."]],
          uncertainties: [["How long building in a new EU region takes.", "Hur lång tid det tar att bygga i en ny EU-region."]],
          tradeoffs: {
            operational: ["Building in a new region takes longer than the planned failover.", "Att bygga i en ny region tar längre tid än den planerade reservdriften."],
            security: ["Emergency accounts must be controlled and closed afterwards.", "Nödkonton måste kontrolleras och stängas efteråt."],
            legal: ["Processing in the non-EU region may breach contracts and transfer rules.", "Behandling i regionen utanför EU kan bryta mot avtal och regler om överföring."],
            reputational: ["Customers will judge both the outage and how you handled their data.", "Kunderna kommer att bedöma både avbrottet och hur ni hanterade deras data."]
          },
          evaluation: [["Restores the foundations first and respects data commitments under pressure", "Återställer grunden först och respekterar åtagandena om data under tryck"]]
        }),
        facilitator: fac(
          ["Two hidden dependencies at once: identity and data residency. Speed tempts the room to ignore the second.", "Två dolda beroenden samtidigt: identitet och dataplacering. Tempot frestar rummet att ignorera det andra."],
          ["Identity first, EU region rebuild, honest customer contact.", "Identitet först, återuppbyggnad i en EU-region, ärlig kontakt med kunderna."],
          [["Ask: which promise to customers is harder to break, availability or data location?", "Fråga: vilket löfte till kunderna är svårast att bryta, tillgänglighet eller dataplacering?"]]
        )
      },
      {
        id: "p5",
        clock: 1440,
        priority: 2,
        title: L(["A significant disruption", "En betydande störning"]),
        twist: L(["{{reg.supervisor}} contacts you: a disruption of this length to {{org.service.primary}} is a significant incident under {{reg.nis2}}, even with no attacker. The early warning was due within 24 hours.", "{{reg.supervisor}} kontaktar er: en störning av den här längden i {{org.service.primary}} är en betydande incident enligt {{reg.nis2}}, även utan angripare. Den tidiga varningen skulle ha lämnats inom 24 timmar."]),
        twistKind: "authority",
        assumptionChallenged: L(["Reporting duties are for cyber attacks.", "Rapporteringsskyldigheter gäller cyberangrepp."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}. A day in. Some services run in an EU region, staff can sign in again through emergency accounts, and the provider has started restoring parts of the region.\n\nThe crisis team has been thinking of this as an operational problem caused by a fire. A letter from the supervisory authority suggests that the regulator sees it rather differently.",
          "{{time.T+1440|weekday|cap}}. Ett dygn in. En del tjänster körs i en EU-region, personalen kan logga in igen via nödkonton och leverantören har börjat återställa delar av regionen.\n\nKrisledningen har tänkt på det här som ett driftproblem orsakat av en brand. Ett brev från tillsynsmyndigheten antyder att myndigheten ser det ganska annorlunda."
        ]),
        injects: [
          inj("i5-1", 1440, "regulatorLetter", "regulator", "high", "confirmed", [
            "{{reg.supervisor}}: “We understand {{org.service.primary}} has been unavailable for over 24 hours. Please submit an early warning and incident notification without delay, regardless of the cause.”",
            "{{reg.supervisor}}: ”Vi förstår att {{org.service.primary}} har varit otillgänglig i mer än 24 timmar. Lämna en tidig varning och en incidentanmälan utan dröjsmål, oavsett orsak.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What data do you need for the report: duration, users, services?", "Vilka uppgifter behöver ni till rapporten: varaktighet, användare, tjänster?", ["itOps", "serviceOwner"]),
            q("Are the emergency accounts still controlled?", "Är nödkontona fortfarande under kontroll?", ["ciso"]),
            q("Did the EU region rebuild work as planned?", "Fungerade återuppbyggnaden i EU-regionen som planerat?", ["cloudLead"], "d4")
          ],
          executive: [
            q("Who files the report, and how do you explain being late?", "Vem lämnar rapporten, och hur förklarar ni förseningen?", ["legal", "ciso"]),
            q("What do you owe customers under their service levels?", "Vad är ni skyldiga kunderna enligt deras servicenivåer?", ["serviceOwner", "legal"]),
            q("Did telling customers about their data help with the regulator?", "Hjälpte det i kontakten med myndigheten att ni berättade för kunderna om deras data?", ["dpo"], "d4")
          ]
        },
        challenges: [ch("Nobody in the crisis team knew outages without an attacker could be reportable.", "Ingen i krisledningen visste att avbrott utan angripare kunde vara rapporteringspliktiga.")],
        noDecision: L(["No vote: the duty exists. Let the room plan the report and how to avoid missing the next deadline.", "Ingen omröstning: skyldigheten finns. Låt rummet planera rapporten och hur nästa tidsfrist ska hållas."]),
        facilitator: fac(
          ["Many assume reporting is only for attacks. Significant disruptions count too.", "Många antar att rapportering bara gäller angrepp. Betydande störningar räknas också."],
          ["File now with an honest timeline; put reporting criteria into the crisis checklist.", "Lämna in nu med en ärlig tidslinje; lägg in rapporteringskriterier i krisledningens checklista."],
          [["Ask: which of your services count as essential under the law?", "Fråga: vilka av era tjänster räknas som samhällsviktiga enligt lagen?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        priority: 3,
        title: L(["One basket", "En korg"]),
        twist: L(["A dependency review shows that nearly all critical services, the monitoring, the status page, staff sign-in and the backups' management all depend on the same provider, mostly in one region.", "En genomgång av beroenden visar att nästan alla kritiska tjänster, övervakningen, statussidan, personalens inloggning och hanteringen av säkerhetskopiorna är beroende av samma leverantör, mestadels i en region."]),
        twistKind: "scope",
        assumptionChallenged: L(["This was a rare event at the provider.", "Det här var en ovanlig händelse hos leverantören."]),
        reveals: ["hf-concentration"],
        narrative: L([
          "{{time.T+10080|weekday|cap}}. A week later. The region is fully back and services have moved home. The provider has published a detailed report and offered service credits.\n\n{{person.cio.name}} asks a different question: if the same thing happened next month, what would be different? The answer starts with a diagram that nobody had drawn before.",
          "{{time.T+10080|weekday|cap}}. En vecka senare. Regionen är helt tillbaka och tjänsterna har flyttat hem. Leverantören har publicerat en detaljerad rapport och erbjudit kreditering.\n\n{{person.cio.name}} ställer en annan fråga: om samma sak hände nästa månad, vad skulle vara annorlunda? Svaret börjar med ett diagram som ingen hade ritat tidigare."
        ]),
        injects: [
          inj("i6-1", 10080, "impactReport", "person.cloudLead", "medium", "confirmed", [
            "Critical services in the primary region: 87 percent. Monitoring, status page, sign-in and backup management: same provider, same region. DR tests in three years: 0. Secondary region: outside the EU.",
            "Kritiska tjänster i den primära regionen: 87 procent. Övervakning, statussida, inloggning och hantering av säkerhetskopior: samma leverantör, samma region. Tester av katastrofåterställning på tre år: 0. Sekundär region: utanför EU."
          ], { reveals: ["hf-concentration"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which services need a second region, and which can wait?", "Vilka tjänster behöver en andra region, och vilka kan vänta?", ["cloudLead", "cio"]),
            q("How often will you test failover for real?", "Hur ofta ska ni testa reservdrift på riktigt?", ["cloudLead", "itOps"]),
            q("Looking back, how did restoring sign-in first affect everything else?", "När ni ser tillbaka, hur påverkade det allt annat att inloggningen återställdes först?", ["itOps"], "d4")
          ],
          executive: [
            q("Is a second provider worth the cost and complexity?", "Är en andra leverantör värd kostnaden och komplexiteten?", ["cio", "ceo"]),
            q("Who owns recovery testing, and who checks it happens?", "Vem äger återställningstesterna, och vem kontrollerar att de genomförs?", ["cio", "ceo"]),
            q("Which first-day decision mattered most?", "Vilket beslut den första dagen spelade störst roll?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("The finance director points out that a second region roughly doubles hosting costs for critical services.", "Ekonomichefen påpekar att en andra region ungefär fördubblar kostnaden för drift av de kritiska tjänsterna.")],
        decision: dec("d5", "cio", ["What do you change?", "Vad ändrar ni?"], [
          ["A second EU region for critical services and identity, offline break-glass access, monitoring outside the provider, and twice-yearly failover tests.", "En andra EU-region för kritiska tjänster och identitet, frånkopplad nödåtkomst, övervakning utanför leverantören och reservdriftstester två gånger om året."],
          ["Move everything to a second provider.", "Flytta allt till en andra leverantör."],
          ["Accept the risk; regional outages are rare.", "Acceptera risken; regionala avbrott är ovanliga."]
        ], {
          knowns: [["Almost everything depends on one provider and one region.", "Nästan allt är beroende av en leverantör och en region."]],
          uncertainties: [["How likely and how long the next outage is.", "Hur sannolikt och hur långt nästa avbrott blir."]],
          tradeoffs: {
            operational: ["Two regions mean more to run and test.", "Två regioner innebär mer att driva och testa."],
            security: ["A second provider doubles the surface to secure.", "En andra leverantör fördubblar ytan som ska skyddas."],
            legal: ["Recovery locations must respect data commitments.", "Återställningsplatser måste respektera åtagandena om data."],
            reputational: ["The next outage will be judged against this one.", "Nästa avbrott kommer att bedömas mot det här."]
          },
          evaluation: [["Reduces concentration where it matters and proves recovery by testing", "Minskar koncentrationen där det spelar roll och bevisar återställningen genom tester"]]
        }),
        facilitator: fac(
          ["End on concentration risk and testing. A plan that has never run is a hope.", "Avsluta med koncentrationsrisk och tester. En plan som aldrig har körts är en förhoppning."],
          ["Second EU region for the critical core, independent monitoring, regular real tests.", "En andra EU-region för den kritiska kärnan, oberoende övervakning, regelbundna riktiga tester."],
          [["Ask: when will you next pull the plug on purpose?", "Fråga: när drar ni ur kontakten med flit nästa gång?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Services return after a long day and a half, data commitments are kept, but the report was late and the recovery plan has to be rebuilt from scratch.",
        "Tjänsterna kommer tillbaka efter ett långt och ett halvt dygn, åtagandena om data hålls, men rapporten var sen och återställningsplanen måste byggas om från grunden."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Zones protect against zone failures, not region failures.", "Zoner skyddar mot zonfel, inte mot regionfel."]),
        L(["An untested recovery plan hides dependencies on the very thing that failed.", "En otestad återställningsplan döljer beroenden av just det som fallerade."]),
        L(["Recovery locations must respect data commitments, even under pressure.", "Återställningsplatser måste respektera åtagandena om data, även under tryck."]),
        L(["Significant disruptions can be reportable without any attacker.", "Betydande störningar kan vara rapporteringspliktiga utan någon angripare."])
      ],
      assumptionsVsReality: [
        avr(["Three zones mean we cannot lose everything.", "Tre zoner betyder att vi inte kan förlora allt."], ["The whole region shut down.", "Hela regionen stängdes ner."], "p2"),
        avr(["Customer services are what's down; the backup region is ours to use.", "Det är kundtjänsterna som ligger nere; reservregionen kan vi använda fritt."], ["Staff sign-in died too, and the backup region conflicts with contracts.", "Personalens inloggning dog också, och reservregionen strider mot avtalen."], "p4"),
        avr(["A rare event at the provider.", "En ovanlig händelse hos leverantören."], ["Almost everything sits with one provider in one region.", "Nästan allt ligger hos en leverantör i en region."], "p6")
      ],
      strengthsToLookFor: [
        L(["Preparing failover in the first hour", "Att förbereda reservdrift under den första timmen"]),
        L(["Restoring identity before applications", "Att återställa identitet före applikationer"]),
        L(["Refusing to move data where contracts forbid it", "Att vägra flytta data dit avtalen förbjuder det"])
      ],
      commonGaps: [
        L(["Waiting for the provider's estimate", "Att vänta på leverantörens uppskattning"]),
        L(["Not knowing where the secondary region is", "Att inte veta var den sekundära regionen ligger"]),
        L(["Missing reporting duties for outages", "Att missa rapporteringsskyldigheter vid avbrott"])
      ],
      suggestedActions: [
        act(["Test failover of critical services and identity twice a year.", "Testa reservdrift av kritiska tjänster och identitet två gånger om året."], "cloudLead", "high"),
        act(["Keep break-glass access and runbooks outside the primary region.", "Förvara nödåtkomst och driftrutiner utanför den primära regionen."], "itOps", "high"),
        act(["Choose recovery regions that meet data commitments.", "Välj återställningsregioner som uppfyller åtagandena om data."], "dpo", "medium"),
        act(["Add outage reporting criteria to the crisis checklist.", "Lägg till rapporteringskriterier för avbrott i krisledningens checklista."], "legal", "medium")
      ]
    }
  });
})();
