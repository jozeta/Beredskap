/*
 * s20-perfect-storm.js — "The Perfect Storm" (archetype E, executive / compound).
 *
 * Compound crisis for an executive team: an isolated sign-in outage → a global
 * administrator added a federation trust → the key IT supplier is down too →
 * break-glass accounts don't work → a journalist and the regulator call at the
 * same time → executive mailboxes may have been exported → the admin token came
 * through the supplier's tooling → the forged trust reaches customer-facing
 * apps → national coordination → rebuilding identity and the decision rhythm.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s20-perfect-storm",
    version: 1,
    category: "executive-compound",
    archetype: "compound-crisis",
    emblem: "storm",
    title: L(["The Perfect Storm", "Den perfekta stormen"]),
    summary: L([
      "It starts as a sign-in glitch. By evening the identity platform is in someone else's hands, your IT supplier is down, the emergency accounts don't work and the press is calling. The executive team must keep one picture and one voice.",
      "Det börjar som ett inloggningsfel. På kvällen är identitetsplattformen i någon annans händer, er IT-leverantör ligger nere, nödkontona fungerar inte och pressen ringer. Ledningsgruppen måste hålla en gemensam bild och tala med en röst."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Maintain a common operating picture across many workstreams", "Upprätthålla en gemensam lägesbild över många arbetsflöden"]) },
      { id: "lo2", text: L(["Keep decision authority clear under pressure", "Hålla beslutsmandatet tydligt under press"]) },
      { id: "lo3", text: L(["Recover control of the identity platform", "Återta kontrollen över identitetsplattformen"]) },
      { id: "lo4", text: L(["Communicate and notify under uncertainty", "Kommunicera och anmäla under osäkerhet"]) }
    ],
    mitre: ["T1484.002", "T1078", "T1098", "T1199", "T1114", "T1556"],
    frameworks: {
      nistCsf: ["GV.OC", "GV.RR", "GV.SC", "PR.AA", "DE.AE", "RS.MA", "RS.CO", "RS.MI", "RC.RP", "RC.CO"],
      iso27001: ["A.5.19", "A.5.21", "A.5.24", "A.5.26", "A.5.29", "A.5.30", "A.5.15", "A.5.18", "A.8.2"]
    },
    minStages: 6,
    maxStages: 10,
    constraints: { startWindow: "business-hours" },
    actor: { types: ["state", "criminal", "unknown"], motivation: L(["Unclear: long-term access to email and documents", "Oklar: långsiktig åtkomst till e-post och dokument"]), capability: "high" },
    variables: {
      usersAffected: { min: 60, max: 8000, scaleBy: "size" },
      mailboxes: { min: 4, max: 40 },
      supplierCustomers: { min: 30, max: 400 },
      appsFederated: { min: 6, max: 60, scaleBy: "size" },
      breakGlassHours: { min: 3, max: 10 }
    },
    roles: ["incidentCommander", "ceo", "cio", "ciso", "comms", "legal", "dpo", "supplierManager", "itOps", "socLead", "cloudLead", "serviceOwner", "dutyOfficer"],

    groundTruth: {
      rootCause: L([
        "An actor compromised the remote-management tooling of {{supplier.msp}}, which held a session token for one of your global administrators. With it they added a federation trust to your identity platform so they could sign in as anyone, disabled the break-glass accounts and read executive mailboxes. The supplier's own outage was the same actor covering their tracks.",
        "En aktör tog sig in i fjärrhanteringsverktygen hos {{supplier.msp}}, där en sessionstoken för en av era globala administratörer fanns. Med den lade aktören till ett federationsförtroende i er identitetsplattform för att kunna logga in som vem som helst, inaktiverade nödkontona och läste e-postlådor för ledningen. Leverantörens eget avbrott var samma aktör som sopade igen spåren."
      ]),
      attackerTimeline: [
        { at: -10080, text: L(["Supplier's management tooling compromised.", "Leverantörens hanteringsverktyg komprometteras."]) },
        { at: -4320, text: L(["Global admin session token taken from the tooling.", "Sessionstoken för global administratör tas från verktygen."]) },
        { at: -180, text: L(["Federation trust added; break-glass accounts disabled.", "Federationsförtroende läggs till; nödkonton inaktiveras."]) },
        { at: -60, text: L(["Executive mailboxes accessed with forged sign-ins.", "E-postlådor för ledningen öppnas med förfalskade inloggningar."]) },
        { at: 0, text: L(["Sign-in policy change causes the first outage.", "En ändring av inloggningspolicyn orsakar det första avbrottet."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-trust", revealStage: "p2", text: L(["A global administrator account added a new federation trust to the identity platform.", "Ett globalt administratörskonto lade till ett nytt federationsförtroende i identitetsplattformen."]) },
      { id: "hf-breakglass", revealStage: "p4", text: L(["The break-glass accounts were disabled by the attacker.", "Nödkontona inaktiverades av angriparen."]) },
      { id: "hf-mail", revealStage: "p6", text: L(["Executive mailboxes were read with forged sign-ins.", "E-postlådor för ledningen lästes med förfalskade inloggningar."]) },
      { id: "hf-supplier", revealStage: "p7", text: L(["The admin token came from the supplier's management tooling.", "Administratörstoken kom från leverantörens hanteringsverktyg."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["A sign-in glitch", "Ett inloggningsfel"]),
        narrative: L([
          "{{time.T+0|day}}, {{time.T+0|clock}}. Some staff at {{org.name}} can't sign in to {{env.mail}}. It looks small.",
          "{{time.T+0|day}}, klockan {{time.T+0|clock}}. En del anställda hos {{org.name}} kan inte logga in i {{env.mail}}. Det ser litet ut."
        ]),
        injects: [
          inj("i1-1", 0, "ticket", "serviceDesk", "medium", "confirmed", [
            "Ticket {{asset.ticketId}}: about {{num.usersAffected}} users get “access blocked by policy” when signing in. Others are fine.",
            "Ärende {{asset.ticketId}}: ungefär {{num.usersAffected}} användare får ”åtkomst blockerad av policy” när de loggar in. Andra fungerar som vanligt."
          ], { tests: ["lo1"] }),
          inj("i1-2", 20, "chat", "itOps", "low", "misleading", [
            "“Someone probably changed a conditional-access rule. I'll find it and roll it back.”",
            "”Någon har nog ändrat en regel för villkorsstyrd åtkomst. Jag letar upp den och backar den.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["True in a narrow sense: the attacker changed it. Rolling it back without asking who did it loses the clue.", "Sant i snäv mening: angriparen ändrade den. Att backa den utan att fråga vem som gjorde det tappar ledtråden."], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Who changed the sign-in policy, and when?", "Vem ändrade inloggningspolicyn, och när?", ["cloudLead", "itOps"]),
            q("What else did that account change today?", "Vad mer har det kontot ändrat i dag?", ["cloudLead"]),
            q("Is anything unusual in the identity audit log?", "Finns det något ovanligt i identitetsplattformens granskningslogg?", ["socLead"])
          ],
          executive: [
            q("Is this worth the executive team's attention yet?", "Är det här värt ledningsgruppens uppmärksamhet ännu?", ["cio", "incidentCommander"]),
            q("Who would tell you if it got bigger?", "Vem skulle tala om för er om det blev större?", ["dutyOfficer"]),
            q("What would make you convene the crisis team?", "Vad skulle få er att sammankalla krisledningen?", ["ceo", "incidentCommander"])
          ]
        },
        challenges: [ch("It's a busy day and the outage only affects some people.", "Det är en hektisk dag och avbrottet berör bara en del personer.")],
        decision: dec("d1", "cio", ["How do you treat it?", "Hur hanterar ni det?"], [
          ["Find who made the change before rolling it back, and alert security.", "Ta reda på vem som gjorde ändringen innan den backas, och larma säkerhet."],
          ["Roll the policy back and close the ticket.", "Backa policyn och stäng ärendet."],
          ["Wait to see if it resolves itself.", "Vänta och se om det löser sig självt."]
        ], {
          knowns: [["A policy change blocks some users.", "En policyändring blockerar en del användare."]],
          uncertainties: [["Who made it and why.", "Vem som gjorde den och varför."]],
          tradeoffs: {
            operational: ["Investigating first keeps users blocked a little longer.", "Att utreda först håller användarna blockerade lite längre."],
            security: ["Unexplained changes to identity are a warning sign.", "Oförklarade ändringar i identitetsplattformen är ett varningstecken."],
            legal: ["No change yet.", "Ingen förändring ännu."],
            reputational: ["Nobody outside notices yet.", "Ingen utanför märker något ännu."]
          },
          evaluation: [["Asks who before fixing what", "Frågar vem innan vad rättas"]]
        }),
        facilitator: fac(
          ["Small start, deliberately. Watch whether anyone asks who.", "En medvetet liten början. Se om någon frågar vem."],
          ["The change traced to an account before rollback, with security informed.", "Ändringen spårad till ett konto före tillbakarullning, med säkerhet informerad."],
          [["Ask: who is allowed to change sign-in policy?", "Fråga: vem får ändra inloggningspolicyn?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["A trust nobody added", "Ett förtroende som ingen lade till"]),
        twist: L(["A global administrator account added a federation trust three hours ago. Whoever holds it can sign in as anyone.", "Ett globalt administratörskonto lade till ett federationsförtroende för tre timmar sedan. Den som har det kan logga in som vem som helst."]),
        twistKind: "scope",
        assumptionChallenged: L(["This is a misconfiguration.", "Det här är en felkonfiguration."]),
        reveals: ["hf-trust"],
        narrative: L([
          "{{time.T+60|clock}}. The cloud lead reads the identity audit log.",
          "Klockan {{time.T+60|clock}}. Molnansvarig läser identitetsplattformens granskningslogg."
        ]),
        injects: [
          inj("i2-1", 60, "authLog", "siem", "critical", "confirmed", [
            "{{asset.adminAccount}}, a global administrator, added an external federation trust at {{time.T-180|clock}} and then changed sign-in policy. The account owner is on parental leave.",
            "{{asset.adminAccount}}, en global administratör, lade till ett externt federationsförtroende klockan {{time.T-180|clock}} och ändrade sedan inloggningspolicyn. Kontots ägare är föräldraledig."
          ], { headline: ["Federation trust added", "Federationsförtroende tillagt"], reveals: ["hf-trust"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How do you remove the trust without the attacker re-adding it?", "Hur tar ni bort förtroendet utan att angriparen lägger till det igen?", ["cloudLead"]),
            q("Which sign-ins used the forged trust?", "Vilka inloggningar använde det förfalskade förtroendet?", ["socLead"]),
            q("Did finding who changed the policy lead you here?", "Var det spårandet av vem som ändrade policyn som ledde er hit?", ["cloudLead"], "d1")
          ],
          executive: [
            q("Do you convene the crisis management team now?", "Sammankallar ni krisledningen nu?", ["ceo", "incidentCommander"]),
            q("Who leads, and who keeps the operating picture?", "Vem leder, och vem håller ihop lägesbilden?", ["incidentCommander"]),
            q("Would you still have closed the ticket?", "Skulle ni fortfarande ha stängt ärendet?", ["cio"], "d1")
          ]
        },
        challenges: [ch("If you act, the attacker may notice and do more damage.", "Om ni agerar kan angriparen märka det och göra mer skada.")],
        decision: dec("d2", "incidentCommander", ["What do you do now?", "Vad gör ni nu?"], [
          ["Convene the crisis team, name one commander and one keeper of the operating picture, and remove the trust and the admin's sessions together.", "Sammankalla krisledningen, utse en ledare och en ansvarig för lägesbilden, och ta bort förtroendet och administratörens sessioner samtidigt."],
          ["Remove the trust now and brief management later.", "Ta bort förtroendet nu och informera ledningen senare."],
          ["Watch the attacker quietly before acting.", "Bevaka angriparen i tysthet innan ni agerar."]
        ], {
          knowns: [["A global admin added a forged trust.", "En global administratör lade till ett förfalskat förtroende."]],
          uncertainties: [["What the attacker has already done.", "Vad angriparen redan har gjort."]],
          tradeoffs: {
            operational: ["Convening the crisis team pulls executives from the business.", "Att sammankalla krisledningen drar chefer från verksamheten."],
            security: ["Partial action warns the attacker.", "Halvhjärtade åtgärder varnar angriparen."],
            legal: ["Identity compromise may trigger NIS-type reporting.", "Ett intrång i identitetsplattformen kan utlösa rapportering av NIS-typ."],
            reputational: ["An unled crisis shows.", "En kris utan ledning syns."]
          },
          evaluation: [["Establishes command and an operating picture early", "Etablerar ledning och en lägesbild tidigt"], ["Acts on trust and sessions together", "Agerar på förtroende och sessioner samtidigt"]],
          minutes: 10
        }),
        facilitator: fac(
          ["The scenario's spine: one commander, one picture. Watch for it.", "Scenariots ryggrad: en ledare, en bild. Håll utkik efter det."],
          ["Crisis team convened with clear roles; trust and sessions removed together.", "Krisledningen sammankallad med tydliga roller; förtroende och sessioner borttagna samtidigt."],
          [["Ask: where is the operating picture written down?", "Fråga: var finns lägesbilden nedskriven?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 120,
        title: L(["The supplier is down too", "Leverantören ligger också nere"]),
        twist: L(["{{supplier.msp}}, which runs much of your IT, reports its own major outage and cannot help.", "{{supplier.msp}}, som sköter stora delar av er IT, rapporterar ett eget stort avbrott och kan inte hjälpa till."]),
        twistKind: "impact",
        assumptionChallenged: L(["Our supplier will help us through this.", "Vår leverantör kommer att hjälpa oss igenom det här."]),
        narrative: L([
          "{{time.T+120|clock}}. The supplier manager calls the service manager at {{supplier.msp}}.",
          "Klockan {{time.T+120|clock}}. Leverantörsansvarig ringer tjänsteansvarig hos {{supplier.msp}}."
        ]),
        injects: [
          inj("i3-1", 120, "supplierNotice", "msp", "high", "confirmed", [
            "{{supplier.msp}}: “We have a major incident affecting our management platform for all {{num.supplierCustomers}} customers. Engineers are unavailable. We'll update in four hours.”",
            "{{supplier.msp}}: ”Vi har en allvarlig incident som påverkar vår hanteringsplattform för alla {{num.supplierCustomers}} kunder. Teknikerna är inte tillgängliga. Vi uppdaterar om fyra timmar.”"
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Which of your systems can only be managed through the supplier?", "Vilka av era system kan bara hanteras via leverantören?", ["itOps", "supplierManager"]),
            q("Do you have your own admin access to everything critical?", "Har ni egen administratörsåtkomst till allt kritiskt?", ["itOps", "cloudLead"]),
            q("Did removing the trust hold without the supplier?", "Höll borttagandet av förtroendet utan leverantören?", ["cloudLead"], "d2")
          ],
          executive: [
            q("Is the supplier's outage related to yours?", "Hänger leverantörens avbrott ihop med ert?", ["ciso", "supplierManager"]),
            q("Do you cut the supplier's access to you?", "Stänger ni av leverantörens åtkomst till er?", ["ciso", "cio"]),
            q("Does the crisis team have the right people?", "Har krisledningen rätt personer?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("The supplier holds the only documentation for several systems.", "Leverantören har den enda dokumentationen för flera system.")],
        decision: dec("d3", "cio", ["What do you do about the supplier?", "Vad gör ni med leverantören?"], [
          ["Suspend the supplier's access to your environment as a precaution and work with your own people and a response partner.", "Stäng av leverantörens åtkomst till er miljö i förebyggande syfte och arbeta med egen personal och en incidentpartner."],
          ["Wait for the supplier's update.", "Vänta på leverantörens uppdatering."],
          ["Ask the supplier to prioritise you.", "Be leverantören prioritera er."]
        ], {
          knowns: [["The supplier has a major incident.", "Leverantören har en allvarlig incident."]],
          uncertainties: [["Whether the incidents are linked.", "Om incidenterna hänger ihop."]],
          tradeoffs: {
            operational: ["Without the supplier, you lack hands and knowledge.", "Utan leverantören saknar ni händer och kunskap."],
            security: ["A compromised supplier with access is a live threat.", "En komprometterad leverantör med åtkomst är ett levande hot."],
            legal: ["The contract may not foresee this.", "Avtalet kanske inte förutser det här."],
            reputational: ["Waiting looks passive.", "Att vänta ser passivt ut."]
          },
          evaluation: [["Reduces supplier risk without waiting for certainty", "Minskar leverantörsrisken utan att vänta på visshet"]]
        }),
        facilitator: fac(
          ["Coincidence or connection? Let the group sit with not knowing.", "Sammanträffande eller samband? Låt gruppen leva med ovissheten."],
          ["Supplier access suspended and independent help engaged.", "Leverantörens åtkomst avstängd och oberoende hjälp anlitad."],
          [["Ask: what can't you do without them?", "Fråga: vad kan ni inte göra utan dem?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 240,
        title: L(["The emergency accounts fail", "Nödkontona fungerar inte"]),
        twist: L(["The break-glass accounts don't work. The attacker disabled them before you noticed anything.", "Nödkontona fungerar inte. Angriparen inaktiverade dem innan ni märkte något."]),
        twistKind: "cause",
        assumptionChallenged: L(["Our break-glass accounts guarantee we can always get back in.", "Våra nödkonton garanterar att vi alltid kan ta oss in igen."]),
        reveals: ["hf-breakglass"],
        narrative: L([
          "{{time.T+240|clock}}. The attacker has re-added the trust. The cloud lead reaches for the sealed envelope.",
          "Klockan {{time.T+240|clock}}. Angriparen har lagt till förtroendet igen. Molnansvarig tar fram det förseglade kuvertet."
        ]),
        injects: [
          inj("i4-1", 240, "authLog", "itOps", "critical", "confirmed", [
            "Both break-glass accounts are disabled — by {{asset.adminAccount}}, at {{time.T-170|clock}}. Nobody else with global rights can sign in without the federation the attacker controls.",
            "Båda nödkontona är inaktiverade – av {{asset.adminAccount}}, klockan {{time.T-170|clock}}. Ingen annan med globala rättigheter kan logga in utan den federation som angriparen kontrollerar."
          ], { headline: ["Break-glass accounts disabled", "Nödkontona inaktiverade"], reveals: ["hf-breakglass"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["Control of identity", "Kontroll över identitetsplattformen"]),
          data: kpi([
            { id: "bg", label: ["Working break-glass accounts", "Fungerande nödkonton"], value: 0, tone: "danger" },
            { id: "apps", label: ["Apps that trust this identity platform", "Appar som litar på identitetsplattformen"], value: (v) => v.appsFederated, tone: "warn" },
            { id: "hours", label: ["Estimated hours to regain control", "Beräknade timmar till återtagen kontroll"], value: (v) => v.breakGlassHours, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("How do you regain control through the platform provider?", "Hur återtar ni kontrollen via plattformsleverantören?", ["cloudLead"]),
            q("What can you protect while you wait?", "Vad kan ni skydda medan ni väntar?", ["cloudLead", "socLead"]),
            q("Did suspending the supplier's access help or hurt here?", "Hjälpte eller stjälpte avstängningen av leverantörens åtkomst här?", ["itOps"], "d3")
          ],
          executive: [
            q("Who at the platform provider can you escalate to, at what level?", "Vem hos plattformsleverantören kan ni eskalera till, på vilken nivå?", ["cio", "supplierManager"]),
            q("What does the business do while identity is not yours?", "Vad gör verksamheten medan identitetsplattformen inte är er?", ["serviceOwner", "ceo"]),
            q("Is the crisis team's operating picture still accurate?", "Stämmer krisledningens lägesbild fortfarande?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("The platform provider's process for this takes {{num.breakGlassHours}} hours.", "Plattformsleverantörens process för det här tar {{num.breakGlassHours}} timmar.")],
        decision: dec("d4", "cio", ["How do you get back in?", "Hur tar ni er in igen?"], [
          ["Escalate to the platform provider's emergency process and, meanwhile, cut external access to critical apps that trust the platform.", "Eskalera till plattformsleverantörens nödprocess och stäng under tiden extern åtkomst till kritiska appar som litar på plattformen."],
          ["Escalate and wait.", "Eskalera och vänta."],
          ["Try to win back control by repeatedly removing the trust.", "Försök vinna tillbaka kontrollen genom att ta bort förtroendet om och om igen."]
        ], {
          knowns: [["You have no working global admin.", "Ni har ingen fungerande global administratör."]],
          uncertainties: [["How long recovery will take.", "Hur lång tid återtagandet kommer att ta."]],
          tradeoffs: {
            operational: ["Cutting external access stops remote staff and customers.", "Att stänga extern åtkomst stoppar distansarbetande personal och kunder."],
            security: ["While the attacker holds the trust, every connected app is open.", "Så länge angriparen har förtroendet är varje ansluten app öppen."],
            legal: ["Notification clocks may be running.", "Anmälningsfrister kan löpa."],
            reputational: ["A tug-of-war shows you're not in control.", "En dragkamp visar att ni inte har kontroll."]
          },
          evaluation: [["Limits damage while recovery is pending", "Begränsar skadan medan återtagandet pågår"]],
          minutes: 10
        }),
        facilitator: fac(
          ["The safety net is gone. Watch for panic and for clarity.", "Skyddsnätet är borta. Se efter panik och efter klarhet."],
          ["Provider escalation and protective cut-offs for critical apps.", "Eskalering till leverantören och skyddande bortkoppling av kritiska appar."],
          [["Ask: when were the break-glass accounts last tested?", "Fråga: när testades nödkontona senast?"]]
        )
      },
      {
        id: "p5",
        mandatory: true,
        clock: 360,
        title: L(["Two calls at once", "Två samtal samtidigt"]),
        twist: L(["A journalist and the regulator call within ten minutes. Three executives have already said different things.", "En journalist och tillsynsmyndigheten ringer inom tio minuter. Tre chefer har redan sagt olika saker."]),
        twistKind: "authority",
        assumptionChallenged: L(["We speak with one voice.", "Vi talar med en röst."]),
        narrative: L([
          "{{time.T+360|clock}}. The crisis room is full and the phones won't stop.",
          "Klockan {{time.T+360|clock}}. Krisrummet är fullt och telefonerna slutar inte ringa."
        ]),
        injects: [
          inj("i5-1", 360, "mediaEnquiry", "media", "high", "confirmed", [
            "A technology reporter: “I've heard you've lost control of your IT and that your supplier is hacked. Your CIO told a colleague it was ‘a minor outage’. Which is it?”",
            "En teknikreporter: ”Jag har hört att ni har förlorat kontrollen över er IT och att er leverantör är hackad. Er IT-chef sa till en kollega att det var ’ett mindre avbrott’. Vilket är det?”"
          ], { pressure: "media", substitute: { source: "customer", content: ["A major customer asks why three of your managers have given them three different explanations.", "En stor kund frågar varför tre av era chefer har gett dem tre olika förklaringar."] }, tests: ["lo2", "lo4"] }),
          inj("i5-2", 370, "regulatorLetter", "regulator", "high", "confirmed", [
            "{{reg.supervisor|cap}}: “We have information about an incident affecting {{supplier.msp}} and its customers. Please confirm whether you are affected and submit an early warning.”",
            "{{reg.supervisor|cap}}: ”Vi har uppgifter om en incident som påverkar {{supplier.msp}} och dess kunder. Bekräfta om ni är drabbade och skicka in en tidig varning.”"
          ], { pressure: "regulator", substitute: { source: "insurer", content: ["{{supplier.insurer}} asks for formal notice of the incident within 24 hours to keep cover.", "{{supplier.insurer}} begär en formell anmälan av incidenten inom 24 timmar för att försäkringen ska gälla."] }, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What facts can the technical team confirm right now?", "Vilka fakta kan det tekniska teamet bekräfta just nu?", ["ciso", "socLead"]),
            q("What must not be said because it would help the attacker?", "Vad får inte sägas eftersom det skulle hjälpa angriparen?", ["ciso"]),
            q("Did cutting external access change what customers see?", "Ändrade bortkopplingen av extern åtkomst vad kunderna ser?", ["itOps"], "d4")
          ],
          executive: [
            q("Who speaks for the company, and who approves the words?", "Vem talar för företaget, och vem godkänner orden?", ["ceo", "comms"]),
            q("What goes in the early warning to the regulator?", "Vad ska stå i den tidiga varningen till tillsynsmyndigheten?", ["legal", "ciso"]),
            q("Is the operating picture the single source for what you say?", "Är lägesbilden den enda källan för det ni säger?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("The CIO's “minor outage” comment is already circulating.", "IT-chefens kommentar om ”ett mindre avbrott” sprids redan.")],
        decision: dec("d5", "ceo", ["How do you take control of communication?", "Hur tar ni kontroll över kommunikationen?"], [
          ["One spokesperson, statements drawn only from the operating picture, an honest correction, and an early warning to the regulator now.", "En talesperson, uttalanden enbart från lägesbilden, en ärlig rättelse och en tidig varning till tillsynsmyndigheten nu."],
          ["Decline to comment and send the early warning tomorrow.", "Avstå från att kommentera och skicka den tidiga varningen i morgon."],
          ["Let each executive handle their own contacts.", "Låt varje chef hantera sina egna kontakter."]
        ], {
          knowns: [["Three versions are already out there.", "Tre versioner finns redan ute."], ["The regulator wants an early warning.", "Tillsynsmyndigheten vill ha en tidig varning."]],
          uncertainties: [["Whether data has been taken.", "Om uppgifter har tagits."]],
          tradeoffs: {
            operational: ["Central approval slows every message.", "Centralt godkännande gör varje budskap långsammare."],
            security: ["Some details must stay private for now.", "Vissa detaljer måste hållas inom organisationen tills vidare."],
            legal: ["Early warnings have short deadlines.", "Tidiga varningar har korta frister."],
            reputational: ["Inconsistency is more damaging than bad news.", "Motsägelser skadar mer än dåliga nyheter."]
          },
          evaluation: [["Establishes one voice tied to the operating picture", "Etablerar en röst kopplad till lägesbilden"], ["Meets the early-warning duty", "Uppfyller skyldigheten att ge en tidig varning"]],
          minutes: 10
        }),
        facilitator: fac(
          ["The governance moment. Push the CEO role to own it.", "Ögonblicket för styrning. Driv på så att vd-rollen äger det."],
          ["One voice, a correction and a timely early warning.", "En röst, en rättelse och en tidig varning i tid."],
          [["Ask: who has seen the operating picture in the last hour?", "Fråga: vem har sett lägesbilden den senaste timmen?"]]
        )
      },
      {
        id: "p6",
        mandatory: true,
        clock: 600,
        title: L(["What did they read?", "Vad läste de?"]),
        twist: L(["Forged sign-ins opened {{num.mailboxes}} executive mailboxes. You can't yet tell what was read or copied.", "Förfalskade inloggningar öppnade {{num.mailboxes}} e-postlådor för ledningen. Ni kan ännu inte avgöra vad som lästes eller kopierades."]),
        twistKind: "impact",
        assumptionChallenged: L(["We'll know what was exposed before we have to say anything.", "Vi kommer att veta vad som exponerades innan vi måste säga något."]),
        reveals: ["hf-mail"],
        narrative: L([
          "{{time.T+600|clock}}. The platform provider has given control back. The audit logs are readable again.",
          "Klockan {{time.T+600|clock}}. Plattformsleverantören har lämnat tillbaka kontrollen. Granskningsloggarna går att läsa igen."
        ]),
        injects: [
          inj("i6-1", 600, "forensicFinding", "irRetainer", "critical", "confirmed", [
            "Using the forged trust, the attacker signed in as {{num.mailboxes}} executives, including the CEO and the head of legal, and opened their mailboxes. Detailed access logs are only partly retained.",
            "Med det förfalskade förtroendet loggade angriparen in som {{num.mailboxes}} chefer, däribland vd och chefsjuristen, och öppnade deras e-postlådor. Detaljerade åtkomstloggar finns bara delvis kvar."
          ], { headline: ["Executive mailboxes accessed", "E-postlådor för ledningen öppnade"], reveals: ["hf-mail"], tests: ["lo4"] })
        ],
        charts: [{
          id: "c6-mail", type: "donut",
          title: L(["What the accessed mailboxes contain", "Vad de öppnade e-postlådorna innehåller"]),
          caption: L(["Estimated share of messages by kind.", "Uppskattad andel meddelanden per typ."]),
          data: () => ({ segments: [
            { id: "internal", label: L(["Internal business", "Intern verksamhet"]), value: 52 },
            { id: "customers", label: L(["Customer correspondence", "Korrespondens med kunder"]), value: 23 },
            { id: "legal", label: L(["Legal and board", "Juridik och styrelse"]), value: 15 },
            { id: "personal", label: L(["Personal data of staff", "Personuppgifter om personal"]), value: 10 }
          ] })
        }],
        questions: {
          technical: [
            q("What evidence can establish what was read?", "Vilka spår kan fastställa vad som lästes?", ["socLead", "cloudLead"]),
            q("Is the attacker fully out now?", "Är angriparen helt ute nu?", ["ciso", "cloudLead"]),
            q("Did your protective cut-offs limit what was reached?", "Begränsade era skyddande bortkopplingar vad som nåddes?", ["cloudLead"], "d4")
          ],
          executive: [
            q("Do you notify {{reg.dpaShort}} without knowing the full extent?", "Anmäler ni till {{reg.dpaShort}} utan att känna till hela omfattningen?", ["dpo", "legal"]),
            q("Which counterparties must be warned that their correspondence may be exposed?", "Vilka motparter måste varnas för att deras korrespondens kan vara exponerad?", ["legal", "ceo"]),
            q("Does your public line still hold?", "Håller er offentliga linje fortfarande?", ["comms"], "d5")
          ]
        },
        challenges: [ch("The legal mailbox contains a confidential negotiation.", "Chefsjuristens e-postlåda innehåller en konfidentiell förhandling.")],
        decision: dec("d6", "ceo", ["How do you handle the exposure?", "Hur hanterar ni exponeringen?"], [
          ["Notify {{reg.dpaShort}} within the deadline on what you know, warn affected counterparties and update as you learn more.", "Anmäl till {{reg.dpaShort}} inom fristen utifrån det ni vet, varna berörda motparter och uppdatera när ni vet mer."],
          ["Wait until forensics can tell you what was read.", "Vänta tills forensikerna kan säga vad som lästes."],
          ["Notify the regulator only.", "Anmäl bara till tillsynsmyndigheten."]
        ], {
          knowns: [["Executive mailboxes were accessed.", "E-postlådor för ledningen öppnades."]],
          uncertainties: [["What was read or copied.", "Vad som lästes eller kopierades."]],
          tradeoffs: {
            operational: ["Phased notification means repeated updates.", "Stegvis anmälan innebär upprepade uppdateringar."],
            security: ["Counterparties can protect themselves only if warned.", "Motparter kan bara skydda sig om de varnas."],
            legal: ["The deadline runs from awareness, not certainty.", "Fristen löper från kännedom, inte från visshet."],
            reputational: ["A late warning to a counterparty can end a relationship.", "En sen varning till en motpart kan avsluta en relation."]
          },
          evaluation: [["Notifies on time under uncertainty, and updates", "Anmäler i tid trots osäkerhet, och uppdaterar"]]
        }),
        facilitator: fac(
          ["Uncertainty doesn't stop the clock. That's the lesson.", "Osäkerhet stoppar inte klockan. Det är lärdomen."],
          ["Phased notification and counterparty warnings.", "Stegvis anmälan och varningar till motparter."],
          [["Ask: what would you write in the notification today, honestly?", "Fråga: vad skulle ni ärligt skriva i anmälan i dag?"]]
        )
      },
      {
        id: "p7",
        priority: 1,
        clock: 1080,
        title: L(["Through the supplier", "Via leverantören"]),
        twist: L(["The global admin's session token was taken from {{supplier.msp}}'s management tooling. The supplier's outage was the same attacker.", "Den globala administratörens sessionstoken togs från hanteringsverktygen hos {{supplier.msp}}. Leverantörens avbrott var samma angripare."]),
        twistKind: "cause",
        assumptionChallenged: L(["The supplier's outage was a coincidence.", "Leverantörens avbrott var ett sammanträffande."]),
        reveals: ["hf-supplier"],
        narrative: L([
          "The next morning. Your response partner and the supplier's compare findings.",
          "Nästa morgon. Er incidentpartner och leverantörens jämför sina fynd."
        ]),
        injects: [
          inj("i7-1", 1080, "forensicFinding", "irRetainer", "critical", "confirmed", [
            "The token was used from the same infrastructure that attacked {{supplier.msp}}. The supplier's management tool stored administrator sessions for many customers.",
            "Token användes från samma infrastruktur som angrep {{supplier.msp}}. Leverantörens hanteringsverktyg lagrade administratörssessioner för många kunder."
          ], { headline: ["Supplier was the way in", "Leverantören var vägen in"], reveals: ["hf-supplier"], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Which other supplier-held credentials must be revoked?", "Vilka andra inloggningsuppgifter hos leverantören måste återkallas?", ["itOps", "cloudLead"]),
            q("Should any supplier ever hold global admin sessions?", "Bör någon leverantör någonsin ha sessioner för global administratör?", ["ciso"]),
            q("Did suspending the supplier early prevent re-entry?", "Förhindrade den tidiga avstängningen av leverantören ett nytt intrång?", ["itOps"], "d3")
          ],
          executive: [
            q("What do you say about the supplier publicly?", "Vad säger ni offentligt om leverantören?", ["comms", "legal"]),
            q("What does the contract say about liability?", "Vad säger avtalet om ansvar?", ["legal", "supplierManager"]),
            q("Does this change what you told the regulator?", "Ändrar det här vad ni sa till tillsynsmyndigheten?", ["legal"], "d5")
          ]
        },
        challenges: [ch("You still depend on the supplier for daily operations.", "Ni är fortfarande beroende av leverantören för den dagliga driften.")],
        decision: dec("d7", "cio", ["What happens with the supplier?", "Vad händer med leverantören?"], [
          ["Keep them suspended from admin access, rebuild access on least privilege with your own approval, and review the contract.", "Håll dem avstängda från administratörsåtkomst, bygg upp åtkomsten igen enligt minsta behörighet med ert eget godkännande och granska avtalet."],
          ["Restore their access once they confirm they're clean.", "Återställ deras åtkomst när de bekräftar att de är rena."],
          ["Terminate the contract.", "Säg upp avtalet."]
        ], {
          knowns: [["The supplier's tooling was the entry point.", "Leverantörens verktyg var vägen in."]],
          uncertainties: [["How well the supplier will recover.", "Hur väl leverantören kommer att återhämta sig."]],
          tradeoffs: {
            operational: ["Without supplier access, your team carries the load.", "Utan leverantörens åtkomst bär ert team belastningen."],
            security: ["Standing supplier admin access was the weakness.", "Leverantörens stående administratörsåtkomst var svagheten."],
            legal: ["Termination may breach the contract.", "En uppsägning kan bryta mot avtalet."],
            reputational: ["Blaming the supplier won't satisfy customers.", "Att skylla på leverantören kommer inte att räcka för kunderna."]
          },
          evaluation: [["Rebuilds supplier access on your terms", "Bygger upp leverantörens åtkomst på era villkor"]]
        }),
        facilitator: fac(
          ["The two fires were one. Revisit the coincidence assumption.", "De två bränderna var en. Återvänd till antagandet om sammanträffande."],
          ["Supplier access rebuilt on least privilege under your control.", "Leverantörens åtkomst uppbyggd igen enligt minsta behörighet under er kontroll."],
          [["Ask: which other suppliers hold your admin sessions?", "Fråga: vilka andra leverantörer har era administratörssessioner?"]]
        )
      },
      {
        id: "p8",
        priority: 2,
        clock: 1440,
        title: L(["Every app that trusted it", "Varje app som litade på den"]),
        twist: L(["The forged trust worked for every one of the {{num.appsFederated}} apps that use your identity platform — including the customer portal.", "Det förfalskade förtroendet fungerade för var och en av de {{num.appsFederated}} appar som använder er identitetsplattform – även kundportalen."]),
        twistKind: "scope",
        assumptionChallenged: L(["The exposure was email.", "Exponeringen gällde e-post."]),
        narrative: L([
          "Day two. The response partner checks sign-ins to connected apps.",
          "Dag två. Incidentpartnern kontrollerar inloggningar till anslutna appar."
        ]),
        injects: [
          inj("i8-1", 1440, "authLog", "irRetainer", "high", "confirmed", [
            "Forged sign-ins also reached the finance system, the document platform and the customer portal's admin pages. App-side logs vary in quality.",
            "Förfalskade inloggningar nådde också ekonomisystemet, dokumentplattformen och kundportalens administrationssidor. Loggarna i apparna håller varierande kvalitet."
          ], { tests: ["lo1", "lo3"] })
        ],
        questions: {
          technical: [
            q("How do you check every connected app, in order of risk?", "Hur kontrollerar ni varje ansluten app, i riskordning?", ["socLead", "cloudLead"]),
            q("What changes might the attacker have made in those apps?", "Vilka ändringar kan angriparen ha gjort i apparna?", ["socLead", "serviceOwner"]),
            q("Did your earlier cut-offs cover these apps?", "Täckte era tidigare bortkopplingar de här apparna?", ["cloudLead"], "d4")
          ],
          executive: [
            q("Are customers now affected?", "Är kunderna nu drabbade?", ["serviceOwner", "ceo"]),
            q("Does your notification need updating?", "Behöver er anmälan uppdateras?", ["dpo", "legal"]),
            q("Is the operating picture keeping up with the scope?", "Hänger lägesbilden med i omfattningen?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("Each app has a different owner and log format.", "Varje app har en egen ägare och ett eget loggformat.")],
        decision: dec("d8", "incidentCommander", ["How do you organise the review?", "Hur organiserar ni granskningen?"], [
          ["One workstream per critical app with named owners, reported into the operating picture, customer portal first.", "Ett arbetsflöde per kritisk app med utsedda ägare, rapporterat in i lägesbilden, med kundportalen först."],
          ["Let the response partner work through them.", "Låt incidentpartnern beta av dem."],
          ["Review email first, then the rest.", "Granska e-posten först och sedan resten."]
        ], {
          knowns: [["Every federated app was reachable.", "Varje federerad app gick att nå."]],
          uncertainties: [["What was changed in each.", "Vad som ändrades i var och en."]],
          tradeoffs: {
            operational: ["Many workstreams strain coordination.", "Många arbetsflöden belastar samordningen."],
            security: ["Admin pages of the customer portal are high risk.", "Kundportalens administrationssidor är en hög risk."],
            legal: ["Customer impact changes notification duties.", "Påverkan på kunder ändrar anmälningsskyldigheterna."],
            reputational: ["Customers must hear it from you.", "Kunderna måste höra det från er."]
          },
          evaluation: [["Organises by risk with owners feeding one picture", "Organiserar efter risk med ägare som matar en gemensam bild"]]
        }),
        facilitator: fac(
          ["Scope explodes. The operating picture is now the main tool.", "Omfattningen exploderar. Lägesbilden är nu det viktigaste verktyget."],
          ["Risk-ordered workstreams feeding one picture.", "Arbetsflöden i riskordning som matar en gemensam bild."],
          [["Ask: can anyone in the room state the current scope in one sentence?", "Fråga: kan någon i rummet beskriva den aktuella omfattningen i en mening?"]]
        )
      },
      {
        id: "p9",
        priority: 3,
        clock: 2880,
        title: L(["National coordination", "Nationell samordning"]),
        twist: L(["{{reg.csirt|cap}} is coordinating all of the supplier's customers and asks you to share indicators — your lawyers advise caution.", "{{reg.csirt|cap}} samordnar alla leverantörens kunder och ber er dela indikatorer – era jurister råder till försiktighet."]),
        twistKind: "authority",
        assumptionChallenged: L(["This is our incident to manage.", "Det här är vår incident att hantera."]),
        narrative: L([
          "Day three. A coordination call with dozens of organisations.",
          "Dag tre. Ett samordningsmöte med dussintals organisationer."
        ]),
        injects: [
          inj("i9-1", 2880, "email", "csirt", "high", "confirmed", [
            "{{reg.csirt|cap}}: “{{num.supplierCustomers}} organisations are potentially affected. Please share your indicators and timeline so others can check their environments.”",
            "{{reg.csirt|cap}}: ”{{num.supplierCustomers}} organisationer kan vara drabbade. Dela era indikatorer och er tidslinje så att andra kan kontrollera sina miljöer.”"
          ], { tests: ["lo1"] }),
          inj("i9-2", 2910, "email", "management", "medium", "confirmed", [
            "Legal: “Sharing details may affect our claim against the supplier. Let us review everything first.”",
            "Juristerna: ”Att dela detaljer kan påverka vårt anspråk mot leverantören. Låt oss granska allt först.”"
          ], { optional: true, tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What can you share without exposing sensitive details?", "Vad kan ni dela utan att exponera känsliga detaljer?", ["ciso", "socLead"]),
            q("What can you learn from other victims?", "Vad kan ni lära er av andra drabbade?", ["socLead"]),
            q("Did the app review find indicators worth sharing?", "Hittade granskningen av apparna indikatorer som är värda att dela?", ["socLead"], "d8")
          ],
          executive: [
            q("Who decides on sharing: legal or security?", "Vem beslutar om delning: juristerna eller säkerhet?", ["ceo", "legal"]),
            q("What do you owe other victims?", "Vad är ni skyldiga andra drabbade?", ["ceo"]),
            q("Does your supplier decision fit the coordinated response?", "Passar ert beslut om leverantören in i den samordnade hanteringen?", ["cio"], "d7")
          ]
        },
        challenges: [ch("Other organisations are still compromised while you deliberate.", "Andra organisationer är fortfarande komprometterade medan ni överlägger.")],
        decision: dec("d9", "ceo", ["Do you share?", "Delar ni?"], [
          ["Share technical indicators now through the CSIRT; let legal review the narrative, not the indicators.", "Dela tekniska indikatorer nu via CSIRT; låt juristerna granska beskrivningen, inte indikatorerna."],
          ["Share after a full legal review.", "Dela efter en fullständig juridisk granskning."],
          ["Don't share.", "Dela inte."]
        ], {
          knowns: [["Many organisations are at risk.", "Många organisationer är i riskzonen."]],
          uncertainties: [["How sharing affects your claim.", "Hur delning påverkar ert anspråk."]],
          tradeoffs: {
            operational: ["Sharing takes analyst time.", "Delning tar analytikertid."],
            security: ["Indicators lose value with every day of delay.", "Indikatorer förlorar i värde för varje dags försening."],
            legal: ["Narrative statements carry more risk than indicators.", "Beskrivande uttalanden innebär större risk än indikatorer."],
            reputational: ["Withholding helps no one and may become known.", "Att hålla inne hjälper ingen och kan bli känt."]
          },
          evaluation: [["Shares quickly while managing legal risk", "Delar snabbt och hanterar samtidigt den juridiska risken"]]
        }),
        facilitator: fac(
          ["Your crisis is part of a bigger one. Watch whether the group thinks beyond itself.", "Er kris är en del av en större. Se om gruppen tänker bortom sig själv."],
          ["Prompt indicator sharing with legal review of narrative only.", "Snabb delning av indikatorer med juridisk granskning enbart av beskrivningen."],
          [["Ask: what would you want another victim to share with you?", "Fråga: vad skulle ni vilja att en annan drabbad delade med er?"]]
        )
      },
      {
        id: "p10",
        priority: 4,
        clock: 10080,
        title: L(["After the storm", "Efter stormen"]),
        twist: L(["Rebuilding identity will take weeks, and the crisis team is exhausted. The board asks what the operating picture missed.", "Att bygga om identitetsplattformen tar veckor, och krisledningen är utmattad. Styrelsen frågar vad lägesbilden missade."]),
        twistKind: "impact",
        assumptionChallenged: L(["When control is back, the crisis is over.", "När kontrollen är tillbaka är krisen över."]),
        narrative: L([
          "A week later. The board meets.",
          "En vecka senare. Styrelsen sammanträder."
        ]),
        injects: [
          inj("i10-1", 10080, "executiveMessage", "management", "medium", "confirmed", [
            "The chair: “I want to know three things: when we lost control, why we didn't know, and what will be different next time.”",
            "Ordföranden: ”Jag vill veta tre saker: när vi förlorade kontrollen, varför vi inte visste det och vad som kommer att vara annorlunda nästa gång.”"
          ], { tests: ["lo1", "lo2"] })
        ],
        charts: [{
          id: "c10-timeline", type: "timeline",
          title: L(["When control was lost, and regained", "När kontrollen förlorades, och återtogs"]),
          data: () => ({ events: [
            { at: -180, kind: "attacker", label: L(["Trust added; break-glass disabled", "Förtroende tillagt; nödkonton inaktiverade"]) },
            { at: 0, kind: "inject", label: L(["Sign-in glitch reported", "Inloggningsfel rapporterat"]) },
            { at: 60, kind: "decision", label: L(["Crisis team convened", "Krisledningen sammankallad"]) },
            { at: 360, kind: "decision", label: L(["One voice established", "En röst etablerad"]) },
            { at: 600, kind: "decision", label: L(["Control regained", "Kontrollen återtagen"]) }
          ] })
        }],
        questions: {
          technical: [
            q("How do you rebuild trust in the identity platform?", "Hur bygger ni upp förtroendet för identitetsplattformen igen?", ["cloudLead", "ciso"]),
            q("How will break-glass accounts be protected and tested?", "Hur ska nödkontona skyddas och testas?", ["cloudLead"]),
            q("Which changes to supplier access are now in place?", "Vilka ändringar av leverantörsåtkomsten är nu på plats?", ["supplierManager"], "d7")
          ],
          executive: [
            q("What did the operating picture miss, and why?", "Vad missade lägesbilden, och varför?", ["incidentCommander"]),
            q("Did decision authority stay clear throughout?", "Var beslutsmandatet tydligt hela tiden?", ["ceo"]),
            q("Which first-hour decision would you most like to have made differently?", "Vilket beslut från den första timmen skulle ni helst ha fattat annorlunda?", ["cio"], "d1")
          ]
        },
        challenges: [ch("The board wants named owners for every improvement.", "Styrelsen vill ha utsedda ägare för varje förbättring.")],
        decision: dec("d10", "ceo", ["What do you commit to?", "Vad åtar ni er?"], [
          ["Tested break-glass, no standing supplier admin, a practised crisis structure with an operating-picture role, and a board-level owner.", "Testade nödkonton, ingen stående administratörsåtkomst för leverantörer, en övad krisorganisation med en roll för lägesbilden och en ägare på styrelsenivå."],
          ["Technical fixes to identity and suppliers.", "Tekniska åtgärder för identitetsplattformen och leverantörerna."],
          ["An external review of the response.", "En extern granskning av hanteringen."]
        ], {
          knowns: [["Identity, suppliers and command all failed in places.", "Identitetsplattform, leverantörer och ledning brast alla på olika ställen."]],
          uncertainties: [["Whether the attacker kept other access.", "Om angriparen har kvar annan åtkomst."]],
          tradeoffs: {
            operational: ["Practising crisis structure takes executive time.", "Att öva krisorganisationen tar ledningens tid."],
            security: ["Technical fixes alone repeat the command failures.", "Tekniska åtgärder ensamma upprepar ledningsbristerna."],
            legal: ["Regulators will expect governance improvements.", "Tillsynsmyndigheterna kommer att förvänta sig förbättrad styrning."],
            reputational: ["A credible plan reassures customers and the board.", "En trovärdig plan lugnar kunder och styrelse."]
          },
          evaluation: [["Commits to governance and practice, not only technology", "Åtar sig styrning och övning, inte bara teknik"]]
        }),
        facilitator: fac(
          ["End on the executive role: one picture, one voice, clear authority.", "Avsluta med ledningens roll: en bild, en röst, tydligt mandat."],
          ["Commitments spanning identity, suppliers and crisis governance.", "Åtaganden som spänner över identitet, leverantörer och krisstyrning."],
          [["Ask: when will this team next practise together?", "Fråga: när övar det här teamet tillsammans nästa gång?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Control of identity is regained and the supplier link closed, but mailbox exposure remains uncertain and identity rebuild takes weeks. The executive team leaves with a clear view of what one picture and one voice require.",
        "Kontrollen över identitetsplattformen återtas och kopplingen till leverantören stängs, men exponeringen av e-postlådorna är fortfarande oviss och ombyggnaden av identitetsplattformen tar veckor. Ledningsgruppen går därifrån med en tydlig bild av vad en bild och en röst kräver."
      ])
    },

    debrief: {
      keyLessons: [
        L(["A common operating picture is a role, not a hope.", "En gemensam lägesbild är en roll, inte en förhoppning."]),
        L(["One commander and one voice beat many experts talking.", "En ledare och en röst slår många experter som pratar."]),
        L(["Break-glass accounts must be protected from the admins they back up, and tested.", "Nödkonton måste skyddas från de administratörer de ska ersätta, och testas."]),
        L(["Suppliers should never hold standing admin sessions.", "Leverantörer bör aldrig ha stående administratörssessioner."])
      ],
      assumptionsVsReality: [
        avr(["A misconfiguration.", "En felkonfiguration."], ["A forged federation trust.", "Ett förfalskat federationsförtroende."], "p2"),
        avr(["Break-glass will save us.", "Nödkontona räddar oss."], ["They were disabled.", "De var inaktiverade."], "p4"),
        avr(["The supplier outage was unrelated.", "Leverantörens avbrott var orelaterat."], ["It was the way in.", "Det var vägen in."], "p7")
      ],
      strengthsToLookFor: [
        L(["Convening early with clear roles", "Att samlas tidigt med tydliga roller"]),
        L(["Statements tied to the operating picture", "Uttalanden kopplade till lägesbilden"]),
        L(["Notifying under uncertainty", "Att anmäla trots osäkerhet"])
      ],
      commonGaps: [
        L(["Executives speaking separately", "Chefer som uttalar sig var för sig"]),
        L(["Waiting for certainty before notifying", "Att vänta på visshet innan anmälan"]),
        L(["Trusting untested break-glass", "Att lita på otestade nödkonton"])
      ],
      suggestedActions: [
        act(["Name an operating-picture keeper in the crisis plan.", "Utse en ansvarig för lägesbilden i krisplanen."], "incidentCommander", "high"),
        act(["Protect and test break-glass accounts quarterly.", "Skydda och testa nödkontona varje kvartal."], "cloudLead", "high"),
        act(["Remove standing supplier admin access; use just-in-time approval.", "Ta bort leverantörers stående administratörsåtkomst; använd godkännande vid behov."], "supplierManager", "high"),
        act(["Alert on new federation trusts and identity policy changes.", "Larma vid nya federationsförtroenden och ändringar av identitetspolicyn."], "socLead", "high"),
        act(["Practise the crisis team on a compound scenario yearly.", "Öva krisledningen på ett sammansatt scenario varje år."], "ceo", "medium")
      ]
    }
  });
})();
