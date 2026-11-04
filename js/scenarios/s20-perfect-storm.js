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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, pb } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Maintain a common operating picture across many workstreams", "Upprätthålla en gemensam lägesbild över många arbetsflöden"]), teaser: L(["One shared picture", "En gemensam lägesbild"]) },
      { id: "lo2", text: L(["Keep decision authority clear under pressure", "Hålla beslutsmandatet tydligt under press"]), teaser: L(["Who decides when everything happens at once", "Vem som bestämmer när allt händer på en gång"]) },
      { id: "lo3", text: L(["Recover control of the identity platform", "Återta kontrollen över identitetsplattformen"]), teaser: L(["Regaining the foundations", "Att återta grunden"]) },
      { id: "lo4", text: L(["Communicate and notify under uncertainty", "Kommunicera och anmäla under osäkerhet"]), teaser: L(["Speaking before you know", "Att uttala sig innan man vet"]) }
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
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. A normal working day at {{org.name}}. Some staff cannot sign in to {{env.mail}}: they get a message that access is blocked by policy. Others are fine.\n\nIt looks small, the kind of thing the service desk fixes several times a month. Nobody has called an incident, and the executive team is in its weekly meeting, talking about something else entirely.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. En vanlig arbetsdag hos {{org.name}}. En del anställda kan inte logga in i {{env.mail}}: de får ett meddelande om att åtkomsten är blockerad av en policy. Andra loggar in som vanligt.\n\nDet ser litet ut, den sortens problem som servicedesken löser flera gånger i månaden. Ingen har utlyst någon incident, och ledningsgruppen sitter i sitt veckomöte och pratar om något helt annat."
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
          ["Leave it for the morning shift: one sign-in policy glitch in the middle of the night is not worth waking anyone.", "Lämna det till morgonskiftet: en enstaka störning i en inloggningsregel mitt i natten är inte värd att väcka någon för."]
        ], {
          knowns: [["A policy change blocks some users.", "En policyändring blockerar en del användare."]],
          uncertainties: [["Who made it and why.", "Vem som gjorde den och varför."]],
          tradeoffs: {
            operational: ["Investigating first keeps users blocked a little longer.", "Att utreda först håller användarna blockerade lite längre."],
            security: ["Unexplained changes to identity are a warning sign.", "Oförklarade ändringar i identitetsplattformen är ett varningstecken."],
            legal: ["No change yet.", "Ingen förändring ännu."],
            reputational: ["Nobody outside notices yet.", "Ingen utanför märker något ännu."]
          },
          evaluation: [["Asks who before fixing what", "Frågar vem innan vad rättas"]],
          pushback: {
            A: [
              pb(["Still blocked at lunch", "Fortfarande blockerade vid lunch"], ["While you trace the change, about {{num.usersAffected}} people still cannot read their mail. One of them is the finance team, on the day of a filing deadline. How long are you willing to keep them locked out to find a name?", "Medan ni spårar ändringen kan ungefär {{num.usersAffected}} personer fortfarande inte läsa sin e-post. En av grupperna är ekonomiavdelningen, på dagen för en inlämningsfrist. Hur länge är ni beredda att hålla dem utelåsta för att hitta ett namn?"]),
              pb(["“It's a five-minute fix”", "”Det tar fem minuter”"], ["The IT operations lead is openly annoyed: they have rolled back policies like this a hundred times, and you are turning a typo into a security case. The team is watching who wins. Do you hold the line, and how do you explain why?", "Driftansvarig är öppet irriterad: hen har backat sådana här policyer hundra gånger, och ni gör ett säkerhetsärende av ett skrivfel. Teamet ser vem som vinner. Står ni fast, och hur förklarar ni varför?"]),
              pb(["A noisy audit log", "En brusig granskningslogg"], ["The audit log shows dozens of policy edits this month, by several admins and by your IT supplier. Finding “who” may take hours, not minutes. Is the question still worth the wait?", "Granskningsloggen visar dussintals policyändringar den här månaden, av flera administratörer och av er IT-leverantör. Att hitta ”vem” kan ta timmar, inte minuter. Är frågan fortfarande värd väntan?"])
            ],
            B: [
              pb(["Cause: unknown", "Orsak: okänd"], ["The rollback worked and the ticket is closed with “cause unknown”. Nobody can say who changed sign-in policy on your identity platform, or why. Are you comfortable leaving that question unanswered?", "Tillbakarullningen fungerade och ärendet är stängt med ”orsak okänd”. Ingen kan säga vem som ändrade inloggningspolicyn i er identitetsplattform, eller varför. Känner ni er bekväma med att lämna den frågan obesvarad?"]),
              pb(["Maybe it was deliberate", "Kanske var det avsiktligt"], ["A colleague asks whether the policy was tightened on purpose, for a reason nobody told the service desk about. If so, the rollback has just reopened something. Do you know what you undid?", "En kollega frågar om policyn kanske skärptes med avsikt, av ett skäl som ingen berättade för servicedesken. I så fall har tillbakarullningen just öppnat något igen. Vet ni vad ni backade?"]),
              pb(["Security hears it second-hand", "Säkerhet hör det i andra hand"], ["The SOC lead hears about the rollback in the corridor and asks why a change to identity was undone without anyone telling security. Do you still treat it as a service-desk matter?", "SOC-chefen hör talas om tillbakarullningen i korridoren och frågar varför en ändring i identitetsplattformen backades utan att någon sa något till säkerhet. Behandlar ni det fortfarande som ett ärende för servicedesken?"])
            ],
            C: [
              pb(["The number is growing", "Antalet växer"], ["In the past hour the number of blocked users has kept rising, and the service desk queue now spills into other teams. The morning shift is hours away. Is this still a glitch that can wait?", "Den senaste timmen har antalet blockerade användare fortsatt att öka, och servicedeskens kö sprider sig till andra team. Morgonskiftet är timmar bort. Är det här fortfarande ett fel som kan vänta?"]),
              pb(["The duty officer's name", "Tjänstemannen i beredskaps namn"], ["The duty officer points out that not waking anyone is also a decision, and it will be theirs if this turns out to be more. Who owns the choice to let it wait?", "Tjänstemannen i beredskap påpekar att det också är ett beslut att inte väcka någon, och att det blir hens beslut om det här visar sig vara något mer. Vem äger valet att låta det vänta?"]),
              pb(["Nobody looked", "Ingen tittade"], ["Leaving it for the morning means nobody looks at who changed an identity policy for hours. If it was not a mistake, whoever did it has the night to themselves. Is that a risk you are knowingly taking?", "Att lämna det till morgonen betyder att ingen tittar på vem som ändrade en identitetspolicy på flera timmar. Om det inte var ett misstag har den som gjorde det natten för sig själv. Är det en risk ni tar medvetet?"])
            ]
          }
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
          "{{time.T+60|clock}}. The cloud lead opens the identity platform's audit log to find the policy change that blocked the users.\n\nThey find it, and they find what happened just before it. The person whose account made the change is on parental leave and has not logged in for weeks.",
          "Klockan {{time.T+60|clock}}. Molnansvarig öppnar identitetsplattformens granskningslogg för att hitta policyändringen som blockerade användarna.\n\nHen hittar den, och hen hittar vad som hände strax innan. Personen vars konto gjorde ändringen är föräldraledig och har inte loggat in på flera veckor."
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
          minutes: 10,
          pushback: {
            A: [
              pb(["Forty minutes to gather", "Fyrtio minuter att samlas"], ["Getting the crisis team into one room takes forty minutes; two executives are travelling. Meanwhile, the forged trust stays in place, because you chose to act on it together. Do you remove it first and convene after?", "Att få krisledningen samlad i ett rum tar fyrtio minuter; två chefer är på resande fot. Under tiden ligger det förfalskade förtroendet kvar, eftersom ni valde att agera samlat. Tar ni bort det först och samlas sedan?"]),
              pb(["Two commanders", "Två ledare"], ["You named one commander, but the CIO and the incident commander both believe they lead, and each has started giving instructions. Staff are getting conflicting orders within minutes. Who actually decides, and who tells the other?", "Ni utsåg en ledare, men både IT-chefen och incidentledaren tror att de leder, och båda har börjat ge instruktioner. Personalen får motstridiga order inom några minuter. Vem bestämmer egentligen, och vem säger det till den andra?"]),
              pb(["Anyone could be listening", "Vem som helst kan lyssna"], ["Whoever holds the trust can sign in as anyone, including someone on your crisis call or in your chat. The cloud lead refuses to share details on the usual channels. How does the keeper of the operating picture keep a picture?", "Den som har förtroendet kan logga in som vem som helst, även som någon i ert krissamtal eller i er chatt. Molnansvarig vägrar dela detaljer i de vanliga kanalerna. Hur ska den som ansvarar för lägesbilden kunna hålla en bild?"])
            ],
            B: [
              pb(["Sessions still open", "Sessionerna är fortfarande öppna"], ["The trust is gone, but anyone already signed in through it may still hold valid sessions. Removing the door does not throw out people already inside. Do you know who is still in?", "Förtroendet är borta, men den som redan har loggat in genom det kan fortfarande ha giltiga sessioner. Att ta bort dörren kastar inte ut dem som redan är inne. Vet ni vem som fortfarande är inne?"]),
              pb(["The CEO hears it elsewhere", "Vd hör det någon annanstans"], ["The CEO learns from a department head that “IT found a hacker”, before anyone has briefed management. The CEO asks who decided that later was soon enough. What do you answer?", "Vd får höra av en avdelningschef att ”IT har hittat en hackare”, innan någon har informerat ledningen. Vd frågar vem som bestämde att senare var tillräckligt snart. Vad svarar ni?"]),
              pb(["Nobody to decide on reporting", "Ingen som beslutar om rapportering"], ["Legal says an identity compromise may trigger NIS-type reporting, and that decision belongs to management. Management does not yet know there is anything to report. How long can that gap last?", "Juristen säger att ett intrång i identitetsplattformen kan utlösa rapportering av NIS-typ, och det beslutet ligger hos ledningen. Ledningen vet ännu inte att det finns något att rapportera. Hur länge kan den luckan bestå?"])
            ],
            C: [
              pb(["Watching what?", "Bevaka vad?"], ["The trust lets them sign in as anyone, to anything that uses your identity platform. Your logs show sign-ins, not what is done in each app afterwards. What exactly will you see while you watch?", "Förtroendet låter dem logga in som vem som helst, i allt som använder er identitetsplattform. Era loggar visar inloggningar, inte vad som görs i varje app efteråt. Vad exakt kommer ni att se medan ni bevakar?"]),
              pb(["The cloud lead objects", "Molnansvarig protesterar"], ["The cloud lead refuses to leave a forged global trust in place: “We are watching someone with the keys to everything.” Do you overrule your own expert, and how long do you give it?", "Molnansvarig vägrar låta ett förfalskat globalt förtroende ligga kvar: ”Vi tittar på någon som har nycklarna till allt.” Kör ni över er egen expert, och hur länge ger ni det?"]),
              pb(["A silent executive decision", "Ett tyst ledningsbeslut"], ["Choosing to let an attacker keep global access, even briefly, is a decision with consequences for the whole company. Nobody in management has been asked. Who has the authority to take it?", "Att välja att låta en angripare behålla global åtkomst, om än kort, är ett beslut med följder för hela företaget. Ingen i ledningen har tillfrågats. Vem har mandat att fatta det?"])
            ]
          }
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
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because you looked for who made the change before rolling it back, staff could not sign in for another two hours.", sv: "Eftersom ni letade efter vem som gjorde ändringen innan ni backade den kunde personalen inte logga in på ytterligare två timmar." } }
        ],
        assumptionChallenged: L(["Our supplier will help us through this.", "Vår leverantör kommer att hjälpa oss igenom det här."]),
        narrative: L([
          "{{time.T+120|clock}}. The situation is serious, and you need help from the people who know your systems best. The supplier manager calls the service manager at {{supplier.msp}}, which runs much of your IT.\n\nThe call is answered by a recorded message, then by a stressed person who has clearly had this conversation many times today.",
          "Klockan {{time.T+120|clock}}. Läget är allvarligt, och ni behöver hjälp av dem som känner era system bäst. Leverantörsansvarig ringer servicechefen hos {{supplier.msp}}, som sköter stora delar av er IT.\n\nSamtalet besvaras av ett inspelat meddelande, sedan av en stressad person som uppenbarligen har haft det här samtalet många gånger i dag."
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
          evaluation: [["Reduces supplier risk without waiting for certainty", "Minskar leverantörsrisken utan att vänta på visshet"]],
          pushback: {
            A: [
              pb(["Keys you don't have", "Nycklar ni inte har"], ["With the supplier cut off, IT operations discovers that nobody in-house has working admin passwords for three systems the supplier manages. Those systems now have no one able to fix them. Do you open a narrow door for the supplier again?", "När leverantören är avstängd upptäcker driften att ingen internt har fungerande administratörslösenord till tre system som leverantören förvaltar. Nu finns ingen som kan åtgärda dem. Öppnar ni en smal dörr för leverantören igen?"]),
              pb(["An angry account manager", "En arg kundansvarig"], ["The supplier's account manager calls: suspending their access implies they are compromised, breaches the contract and they will say so to their lawyers. You have no evidence linking the two incidents. Do you hold firm?", "Leverantörens kundansvarige ringer: att stänga av deras åtkomst antyder att de är komprometterade, bryter mot avtalet och det tänker de framföra till sina jurister. Ni har inga bevis som kopplar ihop incidenterna. Står ni fast?"]),
              pb(["No partner until morning", "Ingen partner före morgonen"], ["The response firm you call can send a team tomorrow morning at the earliest: many of the supplier's other customers are calling them too. Tonight it is just your own people. Is that enough to justify cutting the supplier off now?", "Incidentföretaget ni ringer kan tidigast skicka ett team i morgon bitti: många av leverantörens andra kunder ringer dem också. I natt är det bara er egen personal. Räcker det för att motivera att ni stänger av leverantören nu?"])
            ],
            B: [
              pb(["Four hours with the trust", "Fyra timmar med förtroendet"], ["The supplier's next update is four hours away. Whoever added the forged trust is not waiting with you. Who acts on your own identity platform in the meantime?", "Leverantörens nästa uppdatering kommer om fyra timmar. Den som lade till det förfalskade förtroendet väntar inte med er. Vem agerar i er egen identitetsplattform under tiden?"]),
              pb(["Their connections are open", "Deras anslutningar står öppna"], ["While the supplier's platform is in a major incident, its connections into your environment are still active. Nobody can tell you who is using them right now. Are you comfortable not knowing?", "Medan leverantörens plattform har en allvarlig incident är deras anslutningar in i er miljö fortfarande aktiva. Ingen kan säga vem som använder dem just nu. Känner ni er bekväma med att inte veta?"]),
              pb(["The CISO wants it minuted", "Säkerhetschefen vill ha det protokollfört"], ["The CISO asks for it to be minuted that they advised against waiting on a supplier in crisis. The executive team now has a recorded disagreement. Do you still wait?", "Säkerhetschefen vill ha det protokollfört att hen avrådde från att vänta på en leverantör i kris. Ledningsgruppen har nu en dokumenterad oenighet. Väntar ni fortfarande?"])
            ],
            C: [
              pb(["Everyone else asks too", "Alla andra frågar också"], ["The supplier has {{num.supplierCustomers}} customers, and all of them are asking to be prioritised. The service manager says they cannot promise anything to anyone. What is your plan if you are not first?", "Leverantören har {{num.supplierCustomers}} kunder, och alla ber att bli prioriterade. Servicechefen säger att de inte kan lova någon något. Vad är er plan om ni inte kommer först?"]),
              pb(["Help from a broken platform", "Hjälp från en trasig plattform"], ["If the supplier prioritises you, their engineers will log in to your environment from a platform that is itself in a major incident. Do you want them inside your systems right now?", "Om leverantören prioriterar er kommer deras tekniker att logga in i er miljö från en plattform som själv har en allvarlig incident. Vill ni ha dem inne i era system just nu?"]),
              pb(["Send us your password", "Skicka ert lösenord"], ["A supplier engineer offers to help at once if you email them an admin password, since their own tools are down. It is the fastest help on offer. Do you accept it on an unverified channel?", "En tekniker hos leverantören erbjuder sig att hjälpa direkt om ni mejlar ett administratörslösenord, eftersom deras egna verktyg ligger nere. Det är den snabbaste hjälpen som finns. Tar ni emot den via en overifierad kanal?"])
            ]
          }
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
        reconsider: { decision: "d2", pressure: { en: "The emergency accounts were already disabled. If you convened the full crisis team, the attacker had the hour it took. If you removed the trust at once, they simply added it again.", sv: "Nödkontona var redan avstängda. Om ni samlade hela krisledningen fick angriparen den timme det tog. Om ni tog bort förtroendet direkt lade de helt enkelt till det igen." } },
        assumptionChallenged: L(["Our break-glass accounts guarantee we can always get back in.", "Våra nödkonton garanterar att vi alltid kan ta oss in igen."]),
        reveals: ["hf-breakglass"],
        narrative: L([
          "{{time.T+240|clock}}. The cloud lead removed the strange trust an hour ago. Now it is back: the attacker has added it again.\n\nThe plan for exactly this moment is in a sealed envelope in the safe: two emergency administrator accounts, kept outside normal sign-in, for when everything else fails. The cloud lead opens the envelope.",
          "Klockan {{time.T+240|clock}}. Molnansvarig tog bort det märkliga förtroendet för en timme sedan. Nu är det tillbaka: angriparen har lagt till det igen.\n\nPlanen för precis det här ögonblicket ligger i ett förseglat kuvert i kassaskåpet: två administratörskonton för nödlägen, som hålls utanför den vanliga inloggningen, för när allt annat fallerar. Molnansvarig öppnar kuvertet."
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
          minutes: 10,
          pushback: {
            A: [
              pb(["Customers go dark", "Kunderna blir utan"], ["Cutting external access to critical apps takes the customer-facing services offline too. Customer service lines light up within minutes, and nobody has told customers why. What do you say to them, and who says it?", "När extern åtkomst till kritiska appar stängs går även de kundnära tjänsterna ner. Kundtjänsts telefoner börjar ringa inom några minuter, och ingen har förklarat varför för kunderna. Vad säger ni till dem, och vem säger det?"]),
              pb(["Which apps?", "Vilka appar?"], ["There are {{num.appsFederated}} apps that trust the platform, and the only complete list sits in the supplier's documentation, which you cannot reach. Do you cut the ones you know of, or everything you can find?", "Det finns {{num.appsFederated}} appar som litar på plattformen, och den enda fullständiga listan finns i leverantörens dokumentation, som ni inte kommer åt. Stänger ni de ni känner till, eller allt ni kan hitta?"]),
              pb(["“Who switched off our customers?”", "”Vem stängde av våra kunder?”"], ["The service owner for the largest customer platform objects: revenue stops while it is offline, and nobody asked them first. They want the decision reversed. Do you hold it, and on whose authority?", "Tjänsteägaren för den största kundplattformen protesterar: intäkterna stannar medan den är nere, och ingen frågade hen först. Hen vill att beslutet rivs upp. Står ni fast, och med vems mandat?"])
            ],
            B: [
              pb(["Hours of open doors", "Timmar med öppna dörrar"], ["The provider's process takes {{num.breakGlassHours}} hours. For all of that time, the attacker can sign in as anyone to every app that trusts the platform. What are you protecting while you wait?", "Leverantörens process tar {{num.breakGlassHours}} timmar. Under hela den tiden kan angriparen logga in som vem som helst i varje app som litar på plattformen. Vad skyddar ni medan ni väntar?"]),
              pb(["Prove you own it", "Bevisa att ni äger den"], ["The provider's emergency process asks for confirmation from a global administrator of the tenant. You have none that works. The process may stall at its first step. What do you do if it does?", "Leverantörens nödprocess kräver en bekräftelse från en global administratör för miljön. Ni har ingen som fungerar. Processen kan fastna redan i första steget. Vad gör ni om den gör det?"]),
              pb(["“And meanwhile?”", "”Och under tiden?”"], ["The CEO asks the crisis team what the company is doing while it waits. The honest answer is: nothing. Can you stand behind that answer if the board asks the same question tomorrow?", "Vd frågar krisledningen vad företaget gör medan det väntar. Det ärliga svaret är: ingenting. Kan ni stå för det svaret om styrelsen ställer samma fråga i morgon?"])
            ],
            C: [
              pb(["With which account?", "Med vilket konto?"], ["Nobody else with global rights can sign in without the federation the attacker controls. The cloud lead may not have a working account to remove the trust with again. What does the tug-of-war rest on?", "Ingen annan med globala rättigheter kan logga in utan den federation som angriparen kontrollerar. Molnansvarig kanske inte har något fungerande konto att ta bort förtroendet med igen. Vad vilar dragkampen på?"]),
              pb(["You're teaching them", "Ni lär upp dem"], ["Each time you remove the trust, the attacker sees it and adds it back, and they learn how fast you react. They may decide to lock you out completely next time. Is the tug-of-war worth that risk?", "Varje gång ni tar bort förtroendet ser angriparen det och lägger tillbaka det, och lär sig hur snabbt ni reagerar. Nästa gång kan de bestämma sig för att låsa ute er helt. Är dragkampen värd den risken?"]),
              pb(["The logs fill with noise", "Loggarna fylls med brus"], ["The SOC warns that every round of remove and re-add buries the attacker's real actions under your own changes. Investigators will struggle to tell them apart later. Do you keep going?", "SOC varnar för att varje runda av borttagning och tillägg begraver angriparens verkliga åtgärder under era egna ändringar. Utredarna kommer att få svårt att skilja dem åt i efterhand. Fortsätter ni?"])
            ]
          }
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
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because the supplier was suspended, nobody can renew the certificates they manage, and two of them expire tonight.", sv: "Eftersom leverantören stängdes av kan ingen förnya de certifikat de förvaltar, och två av dem går ut i natt." } }
        ],
        assumptionChallenged: L(["We speak with one voice.", "Vi talar med en röst."]),
        narrative: L([
          "{{time.T+360|clock}}. The crisis room is full and the phones will not stop. Word has spread, inside and outside the company.\n\nSeveral executives have already been asked about the problems by people they know, and each of them gave a different answer. Now two calls arrive within ten minutes that cannot be handled with a different answer each.",
          "Klockan {{time.T+360|clock}}. Krisrummet är fullt och telefonerna slutar inte ringa. Ryktet har spridit sig, inom och utanför företaget.\n\nFlera chefer har redan fått frågor om problemen av folk de känner, och var och en gav ett eget svar. Nu kommer två samtal inom tio minuter som inte kan hanteras med olika svar."
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
          minutes: 10,
          pushback: {
            A: [
              pb(["Correcting the CIO", "Att rätta IT-chefen"], ["An honest correction means saying publicly that the CIO's “minor outage” was wrong. The CIO asks for a softer wording that does not single anyone out. Do you agree, and does the correction still count as honest?", "En ärlig rättelse innebär att offentligt säga att IT-chefens ”mindre avbrott” var fel. IT-chefen ber om en mjukare formulering som inte pekar ut någon. Går ni med på det, och räknas rättelsen fortfarande som ärlig?"]),
              pb(["Little to say yet", "Lite att säga än"], ["An early warning now will contain very little, and the regulator will reply with questions you cannot answer. Whatever you send may also become public. What do you put in it, and what do you leave out?", "En tidig varning nu kommer att innehålla väldigt lite, och tillsynsmyndigheten kommer att svara med frågor ni inte kan besvara. Det ni skickar kan dessutom bli offentligt. Vad skriver ni, och vad lämnar ni utanför?"]),
              pb(["The picture is two hours old", "Lägesbilden är två timmar gammal"], ["The reporter publishes in thirty minutes, but the operating picture was last updated two hours ago. Statements “only from the operating picture” mean saying almost nothing new. Do you wait for an update, or speak now?", "Reportern publicerar om trettio minuter, men lägesbilden uppdaterades senast för två timmar sedan. Uttalanden ”enbart från lägesbilden” betyder att ni nästan inte säger något nytt. Väntar ni på en uppdatering, eller talar ni nu?"])
            ],
            B: [
              pb(["They publish anyway", "De publicerar ändå"], ["The reporter runs the story with the CIO's “minor outage” quote next to “the company declined to comment”. The only version out there is the wrong one. Is silence still the safer choice?", "Reportern publicerar med IT-chefens citat om ”ett mindre avbrott” bredvid ”företaget avböjer att kommentera”. Den enda versionen som finns ute är den felaktiga. Är tystnad fortfarande det säkrare valet?"]),
              pb(["Tomorrow may be late", "I morgon kan vara för sent"], ["Legal says the early-warning deadline may already be running, and the regulator has asked you directly. Sending it tomorrow means ignoring a direct request for a day. Are you prepared to explain that delay?", "Juristen säger att fristen för den tidiga varningen redan kan löpa, och tillsynsmyndigheten har frågat er direkt. Att skicka den i morgon betyder att ni bortser från en direkt begäran i ett dygn. Är ni beredda att förklara den förseningen?"]),
              pb(["Staff fill the silence", "Personalen fyller tystnaden"], ["With no word from management, staff start posting their own guesses on social media. One post names the supplier. Do you stay silent internally as well?", "När inget besked kommer från ledningen börjar personal lägga ut egna gissningar i sociala medier. Ett inlägg nämner leverantören. Är ni tysta internt också?"])
            ],
            C: [
              pb(["A fourth version", "En fjärde version"], ["By evening there is a fourth version: a regional manager told a customer it was “a cyber attack on our supplier”. Each executive is now telling a different story. How many versions are too many?", "Till kvällen finns en fjärde version: en regionchef har sagt till en kund att det var ”en cyberattack mot vår leverantör”. Varje chef berättar nu en egen historia. Hur många versioner är för många?"]),
              pb(["Two answers to the regulator", "Två svar till tillsynsmyndigheten"], ["The regulator has now heard from two different executives with two different accounts of the incident. They ask which one is the company's official position. Who answers, and which version wins?", "Tillsynsmyndigheten har nu hört från två olika chefer med två olika beskrivningar av incidenten. De frågar vilken som är företagets officiella hållning. Vem svarar, och vilken version gäller?"]),
              pb(["Personal words, company liability", "Personliga ord, företagets ansvar"], ["Legal warns that anything an executive says “personally” to a customer or journalist will be treated as the company's statement. Nobody has checked their words. Who carries the risk of what they say?", "Juristen varnar för att allt en chef säger ”personligen” till en kund eller journalist kommer att behandlas som företagets uttalande. Ingen har granskat deras ord. Vem bär risken för det de säger?"])
            ]
          }
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
          "{{time.T+600|clock}}. With the platform provider's help, you have regained control of the identity platform, and the audit logs are readable again.\n\nThe relief lasts until the logs show what the attacker did with their access during the hours you were locked out.",
          "Klockan {{time.T+600|clock}}. Med plattformsleverantörens hjälp har ni återtagit kontrollen över identitetsplattformen, och granskningsloggarna går att läsa igen.\n\nLättnaden varar tills loggarna visar vad angriparen gjorde med sin åtkomst under de timmar ni var utelåsta."
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
          evaluation: [["Notifies on time under uncertainty, and updates", "Anmäler i tid trots osäkerhet, och uppdaterar"]],
          pushback: {
            A: [
              pb(["The negotiation collapses", "Förhandlingen kollapsar"], ["Warning the counterparty in the confidential negotiation tells them their position may be known to a third party. Their lawyers pause the talks. Was warning them worth losing the deal, and was it your call to make?", "Att varna motparten i den konfidentiella förhandlingen talar om för dem att deras position kan vara känd för en tredje part. Deras jurister pausar samtalen. Var det värt att förlora affären, och var det ert beslut att fatta?"]),
              pb(["Three versions of the truth", "Tre versioner av sanningen"], ["The DPO warns that the numbers in a notification made today may change several times as forensics progresses. Each update will be read as a correction. Are you ready to be seen revising the story again and again?", "Dataskyddsombudet varnar för att siffrorna i en anmälan som görs i dag kan ändras flera gånger när forensiken går vidare. Varje uppdatering kommer att läsas som en rättelse. Är ni beredda att ses ändra berättelsen gång på gång?"]),
              pb(["“What exactly was read?”", "”Vad exakt lästes?”"], ["Every counterparty you warn asks the same question: what of ours was read? You cannot say, and some demand your forensic reports. Do you share them, or leave them with a warning and no answers?", "Varje motpart ni varnar ställer samma fråga: vad av vårt lästes? Ni kan inte säga det, och några kräver era forensiska rapporter. Delar ni dem, eller lämnar ni dem med en varning och inga svar?"])
            ],
            B: [
              pb(["The clock already started", "Klockan har redan startat"], ["The DPO says the notification deadline runs from when you became aware, and that was the forensic finding, not some future certainty. Waiting does not pause it. How do you justify missing it?", "Dataskyddsombudet säger att anmälningsfristen löper från när ni fick kännedom, och det var det forensiska fyndet, inte någon framtida visshet. Att vänta pausar den inte. Hur motiverar ni att missa den?"]),
              pb(["You may never know", "Ni kanske aldrig får veta"], ["Forensics reports that the detailed access logs are only partly retained. They may never be able to say exactly what was read. If certainty never comes, when do you stop waiting?", "Forensikerna rapporterar att de detaljerade åtkomstloggarna bara finns delvis kvar. De kanske aldrig kan säga exakt vad som lästes. Om vissheten aldrig kommer, när slutar ni vänta?"]),
              pb(["The head of legal wants to warn", "Chefsjuristen vill varna"], ["The head of legal, whose own mailbox was opened, insists on warning the negotiation counterparty today, whatever you decide. Do you overrule your own lawyer, or let them act alone?", "Chefsjuristen, vars egen e-postlåda öppnades, kräver att motparten i förhandlingen varnas i dag, vad ni än beslutar. Kör ni över er egen jurist, eller låter ni hen agera på egen hand?"])
            ],
            C: [
              pb(["Staff data in there", "Personaldata finns där"], ["About a tenth of the accessed messages contain personal data about staff. The DPO says that makes a notification to {{reg.dpaShort}} hard to avoid. Why is the regulator alone enough?", "Ungefär en tiondel av de öppnade meddelandena innehåller personuppgifter om personal. Dataskyddsombudet säger att det gör en anmälan till {{reg.dpaShort}} svår att undvika. Varför räcker det med tillsynsmyndigheten?"]),
              pb(["They'll hear it elsewhere", "De får höra det någon annanstans"], ["If a counterparty later learns from the press, or from the attacker, that you knew and said nothing, the relationship is over. Is the regulator-only route worth that risk?", "Om en motpart senare får veta via pressen, eller från angriparen, att ni visste och inte sa något är relationen slut. Är vägen via enbart tillsynsmyndigheten värd den risken?"]),
              pb(["Staff ask about their own data", "Personalen frågar om sina egna uppgifter"], ["A staff representative has heard that executive mailboxes were opened and asks whether employees' personal details were in them. Under this option, nobody has told staff anything. What do you answer?", "En personalföreträdare har hört att ledningens e-postlådor öppnades och frågar om personalens personuppgifter fanns i dem. Med det här alternativet har ingen sagt något till personalen. Vad svarar ni?"])
            ]
          }
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
        reconsider: { decision: "d3", pressure: { en: "The supplier's outage was the same attacker. If you suspended their access, you were right. If you waited for their update, you were waiting on the attacker.", sv: "Leverantörens avbrott var samma angripare. Om ni stängde av deras åtkomst hade ni rätt. Om ni väntade på deras besked väntade ni på angriparen." } },
        assumptionChallenged: L(["The supplier's outage was a coincidence.", "Leverantörens avbrott var ett sammanträffande."]),
        reveals: ["hf-supplier"],
        narrative: L([
          "The next morning. Your incident-response partner and the supplier's own investigators meet to compare findings.\n\nUntil now the supplier's outage and your break-in have been treated as two separate, unlucky events on the same day. The comparison tests that assumption.",
          "Nästa morgon. Er incidentpartner och leverantörens egna utredare möts för att jämföra fynd.\n\nHittills har leverantörens avbrott och ert intrång behandlats som två separata, olyckliga händelser samma dag. Jämförelsen prövar det antagandet."
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
          evaluation: [["Rebuilds supplier access on your terms", "Bygger upp leverantörens åtkomst på era villkor"]],
          pushback: {
            A: [
              pb(["Your team is running out", "Ert team tar slut"], ["With the supplier still suspended, your own team has covered every supplier task for days. Two people have worked through the night twice. Who does tonight's patching, and for how long can they keep going?", "Med leverantören fortfarande avstängd har ert eget team skött alla leverantörens uppgifter i flera dagar. Två personer har arbetat hela natten två gånger. Vem gör nattens uppdateringar, och hur länge orkar de?"]),
              pb(["Others have let them back", "Andra har släppt in dem"], ["The supplier says its platform is rebuilt and that most of its other customers have restored its access. You are becoming the outlier, and the relationship is cooling. What would make you change your mind?", "Leverantören säger att plattformen är ombyggd och att de flesta andra kunderna har återställt deras åtkomst. Ni håller på att bli undantaget, och relationen svalnar. Vad skulle få er att ändra er?"]),
              pb(["Least privilege for what?", "Minsta behörighet för vad?"], ["Rebuilding access on least privilege means knowing exactly what the supplier needs to do. The only documentation of that is the supplier's own. How do you define least privilege without them?", "Att bygga upp åtkomsten enligt minsta behörighet kräver att ni vet exakt vad leverantören behöver göra. Den enda dokumentationen av det är leverantörens egen. Hur definierar ni minsta behörighet utan dem?"])
            ],
            B: [
              pb(["Clean on whose word?", "Ren enligt vem?"], ["The confirmation would come from the same supplier whose tooling stored your admin sessions without anyone noticing. You would be taking their word for it. What independent proof will you ask for?", "Bekräftelsen skulle komma från samma leverantör vars verktyg lagrade era administratörssessioner utan att någon märkte det. Ni skulle ta dem på orden. Vilka oberoende bevis kommer ni att kräva?"]),
              pb(["The same door reopened", "Samma dörr öppnas igen"], ["Restoring their access restores standing admin rights, the exact weakness that let the attacker in. Nothing about the access itself changes. What is different next time?", "Att återställa deras åtkomst återställer stående administratörsrättigheter, exakt den svaghet som släppte in angriparen. Inget i själva åtkomsten ändras. Vad är annorlunda nästa gång?"]),
              pb(["The CISO won't agree", "Säkerhetschefen går inte med på det"], ["The CISO says they will not sign off on restoring supplier admin access as it was. The board will see the disagreement in the incident report. Do you overrule them?", "Säkerhetschefen säger att hen inte kommer att godkänna att leverantörens administratörsåtkomst återställs som den var. Styrelsen kommer att se oenigheten i incidentrapporten. Kör ni över hen?"])
            ],
            C: [
              pb(["Who runs IT tomorrow?", "Vem sköter IT i morgon?"], ["The supplier still runs much of your daily operations. Moving to someone else takes months, and nobody is lined up. Who keeps the lights on during the notice period?", "Leverantören sköter fortfarande en stor del av er dagliga drift. Att flytta till någon annan tar månader, och ingen står redo. Vem håller igång verksamheten under uppsägningstiden?"]),
              pb(["A breach of contract", "Ett avtalsbrott"], ["Legal warns that terminating now may itself breach the contract and weaken your own claim against the supplier. Is the satisfaction of ending it worth giving them a case?", "Juristen varnar för att en uppsägning nu i sig kan bryta mot avtalet och försvaga ert eget anspråk mot leverantören. Är tillfredsställelsen av att avsluta det värd att ge dem ett ärende?"]),
              pb(["Their documentation, not yours", "Deras dokumentation, inte er"], ["The supplier holds the only documentation for several of your systems. A terminated supplier has little reason to hand it over quickly. How do you secure it before you end the relationship?", "Leverantören har den enda dokumentationen för flera av era system. En uppsagd leverantör har små skäl att lämna över den snabbt. Hur säkrar ni den innan ni avslutar relationen?"])
            ]
          }
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
        branches: [
          { when: { decision: "d6", option: "A" }, narrativeAppend: { en: "Because you notified on what you knew, two counterparties have frozen their data exchange with you until you can say what was read.", sv: "Eftersom ni anmälde utifrån det ni visste har två motparter frusit sitt datautbyte med er tills ni kan säga vad som lästes." } }
        ],
        assumptionChallenged: L(["The exposure was email.", "Exponeringen gällde e-post."]),
        narrative: L([
          "Day two. The response partner widens the review beyond email, to every application that lets people sign in with their company account.\n\nThe identity platform is the front door to far more than mail. Each connected application keeps its own logs, of very different quality, and each may have been opened with a forged key.",
          "Dag två. Incidentpartnern vidgar granskningen bortom e-posten, till varje applikation där folk loggar in med sitt företagskonto.\n\nIdentitetsplattformen är ytterdörren till mycket mer än e-post. Varje ansluten applikation har egna loggar, av mycket varierande kvalitet, och var och en kan ha öppnats med en förfalskad nyckel."
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
          evaluation: [["Organises by risk with owners feeding one picture", "Organiserar efter risk med ägare som matar en gemensam bild"]],
          pushback: {
            A: [
              pb(["Finance says it's first", "Ekonomi säger att de kommer först"], ["The CFO argues the finance system must come before the customer portal: a payment run goes out tomorrow, and forged sign-ins could have changed bank details. Do you keep the portal first, or reorder?", "Ekonomichefen hävdar att ekonomisystemet måste komma före kundportalen: en betalningskörning går i morgon, och förfalskade inloggningar kan ha ändrat bankuppgifter. Behåller ni kundportalen först, eller ändrar ni ordningen?"]),
              pb(["Apps without owners", "Appar utan ägare"], ["When you try to name owners, several critical apps have nobody, and the same few people are named for the rest. They are already exhausted. Do you push ahead with workstreams nobody can staff?", "När ni försöker utse ägare saknar flera kritiska appar någon alls, och samma få personer står som ägare för resten. De är redan utmattade. Kör ni vidare med arbetsflöden som ingen kan bemanna?"]),
              pb(["The picture can't keep up", "Lägesbilden hinner inte med"], ["A dozen workstreams now report into one operating picture, and its keeper is hours behind. The crisis team is deciding on stale information. Do you cut the number of workstreams, or accept a lagging picture?", "Ett dussin arbetsflöden rapporterar nu in i en lägesbild, och den som ansvarar för den ligger timmar efter. Krisledningen fattar beslut på inaktuell information. Minskar ni antalet arbetsflöden, eller accepterar ni en lägesbild som släpar?"])
            ],
            B: [
              pb(["They don't know your apps", "De känner inte era appar"], ["The response partner asks who owns each app and what normal looks like in it. Nobody has been assigned to answer. Is handing it over really saving you work?", "Incidentpartnern frågar vem som äger varje app och hur det normala ser ut i den. Ingen har fått i uppdrag att svara. Sparar det verkligen arbete att lämna över det?"]),
              pb(["Their order, not yours", "Deras ordning, inte er"], ["The partner works through apps in order of how good the logs are, not business risk. The customer portal is near the bottom of their list. Do you step in and reprioritise?", "Partnern går igenom apparna i ordning efter hur bra loggarna är, inte efter verksamhetsrisk. Kundportalen ligger långt ner på deras lista. Går ni in och prioriterar om?"]),
              pb(["A weekly report", "En veckorapport"], ["The partner plans to report findings weekly, in its own format. Until then, the crisis team does not know what has been checked. How do you run the crisis without that information?", "Partnern planerar att rapportera fynd varje vecka, i sitt eget format. Fram till dess vet krisledningen inte vad som har kontrollerats. Hur leder ni krisen utan den informationen?"])
            ],
            C: [
              pb(["The portal waits", "Kundportalen får vänta"], ["Forged sign-ins reached the customer portal's admin pages. Under this plan, it waits until email is done. If something was changed there, customers are exposed for every day you spend on mail. Is email really first?", "Förfalskade inloggningar nådde kundportalens administrationssidor. Med den här planen får den vänta tills e-posten är klar. Om något ändrades där är kunderna exponerade varje dag ni lägger på e-posten. Är e-posten verkligen först?"]),
              pb(["The payment run", "Betalningskörningen"], ["Finance reminds you that tomorrow's payment run goes out from a system the forged sign-ins also reached. Nobody will have checked it in time. Do you let the run go ahead?", "Ekonomi påminner om att morgondagens betalningskörning går från ett system som de förfalskade inloggningarna också nådde. Ingen hinner kontrollera det. Låter ni körningen gå?"]),
              pb(["Looking where it's familiar", "Att leta där det är bekant"], ["The response partner points out that email is already the best understood part of this incident. Starting there again means the unknowns stay unknown longer. Why look where you have already looked?", "Incidentpartnern påpekar att e-posten redan är den bäst kända delen av incidenten. Att börja där igen betyder att det okända förblir okänt längre. Varför leta där ni redan har letat?"])
            ]
          }
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
          "Day three. A national coordination call brings together dozens of organisations that use the same supplier.\n\nSome of them have not yet found anything, because they do not know what to look for. You do. Sharing would help them; your own lawyers are thinking about the claim against the supplier.",
          "Dag tre. Ett nationellt samordningsmöte samlar dussintals organisationer som använder samma leverantör.\n\nEn del av dem har ännu inte hittat något, eftersom de inte vet vad de ska leta efter. Det vet ni. Att dela skulle hjälpa dem; era egna jurister tänker på anspråket mot leverantören."
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
          ["Don't share yet: the indicators show how far inside the attacker got, and your lawyers say that is evidence.", "Dela inte ännu: indikatorerna visar hur långt in angriparen kom, och juristerna säger att det är bevisning."]
        ], {
          knowns: [["Many organisations are at risk.", "Många organisationer är i riskzonen."]],
          uncertainties: [["How sharing affects your claim.", "Hur delning påverkar ert anspråk."]],
          tradeoffs: {
            operational: ["Sharing takes analyst time.", "Delning tar analytikertid."],
            security: ["Indicators lose value with every day of delay.", "Indikatorer förlorar i värde för varje dags försening."],
            legal: ["Narrative statements carry more risk than indicators.", "Beskrivande uttalanden innebär större risk än indikatorer."],
            reputational: ["Withholding helps no one and may become known.", "Att hålla inne hjälper ingen och kan bli känt."]
          },
          evaluation: [["Shares quickly while managing legal risk", "Delar snabbt och hanterar samtidigt den juridiska risken"]],
          pushback: {
            A: [
              pb(["Where is the line?", "Var går gränsen?"], ["Legal points out that a timeline of indicators shows exactly how far in the attacker got and when you noticed. The line between indicator and narrative is thinner than it sounds. Who decides what counts as which?", "Juristen påpekar att en tidslinje med indikatorer visar exakt hur långt in angriparen kom och när ni märkte det. Gränsen mellan indikator och beskrivning är tunnare än den låter. Vem avgör vad som är vad?"]),
              pb(["The attacker reads it too", "Angriparen läser också"], ["Shared indicators spread fast, and the attacker may see them too. If they change infrastructure, your own detection rules stop working. Do you share everything, or hold some back?", "Delade indikatorer sprids snabbt, och angriparen kan också se dem. Om de byter infrastruktur slutar era egna detekteringsregler att fungera. Delar ni allt, eller håller ni inne en del?"]),
              pb(["Your name in the press", "Ert namn i pressen"], ["A day after sharing, a journalist calls: another organisation's staff have mentioned that the indicators came from you. Your name is now attached to the incident publicly. Was sharing still worth it, and what do you say?", "En dag efter delningen ringer en journalist: personal hos en annan organisation har nämnt att indikatorerna kom från er. Ert namn är nu offentligt kopplat till incidenten. Var delningen fortfarande värd det, och vad säger ni?"])
            ],
            B: [
              pb(["A week of review", "En veckas granskning"], ["Legal estimates a full review will take a week. By then, the indicators will be old and the attacker will have moved on. Is a careful review of stale data worth anything to anyone?", "Juristerna uppskattar att en fullständig granskning tar en vecka. Då är indikatorerna gamla och angriparen har gått vidare. Är en noggrann granskning av inaktuella uppgifter värd något för någon?"]),
              pb(["“We could have found it”", "”Vi kunde ha hittat det”"], ["The CSIRT calls: another organisation just found the same forged trust in its own platform, and says your indicators would have shown it days earlier. How do you answer that while your review continues?", "CSIRT ringer: en annan organisation har just hittat samma förfalskade förtroende i sin plattform och säger att era indikatorer hade visat det flera dagar tidigare. Hur svarar ni på det medan er granskning pågår?"]),
              pb(["Shared informally anyway", "Delat informellt ändå"], ["The SOC lead admits that analysts have already passed some indicators to peers at other affected organisations, outside any approval. The review now covers something already shared. What do you do about it?", "SOC-chefen medger att analytiker redan har gett vissa indikatorer till kollegor på andra drabbade organisationer, utan något godkännande. Granskningen gäller nu något som redan har delats. Vad gör ni åt det?"])
            ],
            C: [
              pb(["Others still compromised", "Andra fortfarande drabbade"], ["Every day you hold back, organisations that use the same supplier remain compromised without knowing it. The CSIRT has noted that you were asked. How will you explain that later?", "Varje dag ni håller inne förblir organisationer som använder samma leverantör komprometterade utan att veta om det. CSIRT har noterat att ni blev tillfrågade. Hur förklarar ni det i efterhand?"]),
              pb(["It will become known", "Det kommer att bli känt"], ["Withholding indicators to protect a legal claim will not stay secret among dozens of victims on the same call. Your customers may read that you chose your claim over their safety. Is the claim worth that?", "Att hålla inne indikatorer för att skydda ett juridiskt anspråk kommer inte att förbli hemligt bland dussintals drabbade i samma samtal. Era kunder kan få läsa att ni valde anspråket framför deras säkerhet. Är anspråket värt det?"]),
              pb(["Your team disagrees", "Ert team håller inte med"], ["The CISO says the security team sees this as a matter of duty, not law, and morale is suffering. Some analysts ask whether they would be allowed to help peers privately. What do you tell them?", "Säkerhetschefen säger att säkerhetsteamet ser det här som en fråga om plikt, inte juridik, och att stämningen blir sämre. Några analytiker frågar om de får hjälpa kollegor privat. Vad säger ni till dem?"])
            ]
          }
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
        reconsider: { decision: "d5", pressure: { en: "The board asks what the operating picture missed. Did the way you took control of communication work, or would you change it?", sv: "Styrelsen frågar vad lägesbilden missade. Fungerade ert sätt att ta kontroll över kommunikationen, eller skulle ni ändra det?" } },
        assumptionChallenged: L(["When control is back, the crisis is over.", "När kontrollen är tillbaka är krisen över."]),
        narrative: L([
          "A week later. The board meets to review the incident, with the executive team that ran the crisis.\n\nThe attacker is out, but rebuilding trust in the identity platform will take weeks, and the crisis team is exhausted. The chair has prepared three questions and wants straight answers.",
          "En vecka senare. Styrelsen möts för att gå igenom incidenten, tillsammans med ledningsgruppen som ledde krisen.\n\nAngriparen är ute, men att återuppbygga förtroendet för identitetsplattformen tar veckor, och krisledningen är utmattad. Ordföranden har förberett tre frågor och vill ha raka svar."
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
          evaluation: [["Commits to governance and practice, not only technology", "Åtar sig styrning och övning, inte bara teknik"]],
          pushback: {
            A: [
              pb(["Same tired people", "Samma trötta personer"], ["Every commitment lands on the same few people who ran the crisis and are already exhausted. Four programmes at once is a promise they cannot keep this year. Which one do you drop?", "Varje åtagande hamnar hos samma få personer som ledde krisen och redan är utmattade. Fyra program samtidigt är ett löfte de inte kan hålla i år. Vilket stryker ni?"]),
              pb(["The supplier's night work", "Leverantörens nattarbete"], ["No standing supplier admin means the supplier can no longer fix things overnight without your approval. Someone in your organisation must be reachable at night to approve. Who is that, and are they paid for it?", "Ingen stående administratörsåtkomst för leverantörer innebär att leverantören inte längre kan åtgärda saker på natten utan ert godkännande. Någon hos er måste vara nåbar på natten för att godkänna. Vem är det, och får hen betalt för det?"]),
              pb(["Which board member?", "Vilken styrelseledamot?"], ["The chair accepts a board-level owner, then asks: which board member, by name? Nobody volunteers, and each has a reason why it should be someone else. Without a name, is the commitment real?", "Ordföranden accepterar en ägare på styrelsenivå och frågar sedan: vilken ledamot, med namn? Ingen anmäler sig, och alla har ett skäl till varför det borde vara någon annan. Utan ett namn, är åtagandet verkligt?"])
            ],
            B: [
              pb(["Not what the chair asked", "Inte vad ordföranden frågade"], ["The chair asked why you didn't know you had lost control. Technical fixes to identity and suppliers do not answer that. What do you say when the chair repeats the question?", "Ordföranden frågade varför ni inte visste att ni hade förlorat kontrollen. Tekniska åtgärder för identitet och leverantörer besvarar inte det. Vad säger ni när ordföranden upprepar frågan?"]),
              pb(["Three versions, again", "Tre versioner, igen"], ["Three executives gave three different accounts on the first day. Nothing in this plan changes how the next crisis is led or who speaks. What stops it from happening again?", "Tre chefer gav tre olika beskrivningar den första dagen. Inget i den här planen ändrar hur nästa kris leds eller vem som talar. Vad hindrar att det händer igen?"]),
              pb(["The regulator's follow-up", "Tillsynsmyndighetens uppföljning"], ["The regulator's follow-up letter asks what governance changes you have made. A list of technical fixes is all you would have. Is that the answer you want on record?", "Tillsynsmyndighetens uppföljande brev frågar vilka förändringar i styrningen ni har gjort. En lista med tekniska åtgärder är allt ni skulle ha. Är det svaret ni vill ha dokumenterat?"])
            ],
            C: [
              pb(["Months before anything", "Månader innan något händer"], ["An external review will take months to report. In the meantime, the break-glass accounts are untested and supplier access unchanged. What happens if the same thing starts again next month?", "En extern granskning tar månader innan den rapporterar. Under tiden är nödkontona otestade och leverantörens åtkomst oförändrad. Vad händer om samma sak börjar igen nästa månad?"]),
              pb(["You already know", "Ni vet redan"], ["The chair points out that the team in this room already knows most of what went wrong. A review may only confirm it, at the cost of time. Is this a decision, or a way of postponing one?", "Ordföranden påpekar att teamet i det här rummet redan vet det mesta om vad som gick fel. En granskning kanske bara bekräftar det, på bekostnad av tid. Är det här ett beslut, eller ett sätt att skjuta upp ett?"]),
              pb(["Interviews with an exhausted team", "Intervjuer med ett utmattat team"], ["The reviewers want to interview everyone who ran the crisis, the same people now rebuilding identity. Several say they cannot spare the time. Whose work waits for the review?", "Granskarna vill intervjua alla som ledde krisen, samma personer som nu bygger om identitetsplattformen. Flera säger att de inte har tid. Vems arbete får vänta på granskningen?"])
            ]
          }
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
