/*
 * s13-deepfake-executive.js — "The CEO Who Wasn't There" (archetype F, social engineering).
 *
 * Human-first: a convincing video call from the "CEO" asks for a confidential
 * transfer, and part of it has gone → the CEO was on a flight; the call was
 * synthetic → the same cloned voice reset the CEO's MFA at the service desk →
 * fabricated audio of the CEO is published → other executives were called too →
 * the employee who paid, and the verification culture that let it happen.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s13-deepfake-executive",
    version: 1,
    category: "social-engineering",
    archetype: "human-legal-reputational",
    emblem: "deepfake",
    title: L(["The CEO Who Wasn't There", "Vd:n som inte var där"]),
    summary: L([
      "A finance manager joins a video call with the CEO about a confidential acquisition and starts the transfer. The CEO was on a plane. The voice and face were not theirs.",
      "En ekonomiansvarig deltar i ett videosamtal med vd om ett hemligt förvärv och påbörjar överföringen. Vd satt på ett flygplan. Rösten och ansiktet var inte vd:ns."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Stop and recover a fraudulent payment quickly", "Stoppa och återkräva en bedräglig betalning snabbt"]), teaser: L(["Racing the clock", "Att tävla mot klockan"]) },
      { id: "lo2", text: L(["Recognise synthetic media as an attack on identity processes", "Se syntetiska medier som ett angrepp på identitetsprocesser"]), teaser: L(["How you know who you are talking to", "Hur ni vet vem ni talar med"]) },
      { id: "lo3", text: L(["Communicate when your own leader's voice can be faked", "Kommunicera när er egen ledares röst kan förfalskas"]), teaser: L(["When a familiar voice cannot be trusted", "När en välbekant röst inte går att lita på"]) },
      { id: "lo4", text: L(["Build a verification culture without blaming the victim", "Bygga en kontrollkultur utan att skuldbelägga den drabbade"]), teaser: L(["Checking without blaming", "Att kontrollera utan att skuldbelägga"]) }
    ],
    mitre: ["T1656", "T1589", "T1098", "T1078", "T1657", "T1586"],
    frameworks: {
      nistCsf: ["GV.RR", "GV.PO", "PR.AT", "PR.AA", "RS.CO", "RS.MA", "RC.CO"],
      iso27001: ["A.5.17", "A.5.24", "A.5.26", "A.6.3", "A.5.16", "A.5.34"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours" },
    actor: { types: ["criminal"], motivation: L(["Financial: payment fraud, then reputational leverage", "Ekonomisk: betalningsbedrägeri, därefter påtryckning genom ryktet"]), capability: "medium" },
    variables: {
      amount: { min: 400000, max: 25000000, step: 50000, scaleBy: "size", currency: true },
      tranchePct: { min: 30, max: 60 },
      views: { min: 8000, max: 400000 },
      calledExecs: { min: 2, max: 5 }
    },
    roles: ["cfo", "ceo", "comms", "legal", "hr", "itOps", "ciso", "incidentCommander", "securityOfficer", "socLead"],

    groundTruth: {
      rootCause: L([
        "A criminal group cloned the CEO's face and voice from public interviews and conference recordings. They used it in a video call to order a confidential transfer, and on the phone to the service desk to have the CEO's MFA reset. When the fraud was discovered they published fabricated audio to pressure the company.",
        "En kriminell grupp klonade vd:ns ansikte och röst från offentliga intervjuer och konferensinspelningar. De använde klonen i ett videosamtal för att beordra en hemlig överföring och i telefon till servicedesken för att få vd:ns MFA återställd. När bedrägeriet upptäcktes publicerade de fabricerat ljud för att sätta press på företaget."
      ]),
      attackerTimeline: [
        { at: -20160, text: L(["Public interviews and talks of the CEO collected.", "Offentliga intervjuer och föredrag med vd samlas in."]) },
        { at: -2880, text: L(["The CEO's travel plans learned from a public post.", "Vd:ns resplaner upptäcks i ett offentligt inlägg."]) },
        { at: -45, text: L(["Synthetic video call with the finance manager.", "Syntetiskt videosamtal med den ekonomiansvariga."]) },
        { at: -20, text: L(["Cloned voice calls the service desk and has the CEO's MFA reset.", "Den klonade rösten ringer servicedesken och får vd:ns MFA återställd."]) },
        { at: 0, text: L(["First tranche of the transfer leaves the bank.", "Första delen av överföringen lämnar banken."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-fake", revealStage: "p2", text: L(["The video call was synthetic; the CEO was on a flight at the time.", "Videosamtalet var syntetiskt; vd satt på ett flygplan vid tillfället."]) },
      { id: "hf-helpdesk", revealStage: "p3", text: L(["The cloned voice had the service desk reset the CEO's MFA.", "Den klonade rösten fick servicedesken att återställa vd:ns MFA."]) },
      { id: "hf-others", revealStage: "p5", text: L(["Several other executives received similar calls.", "Flera andra chefer fick liknande samtal."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["A confidential transfer", "En hemlig överföring"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. A finance manager at {{org.name}} knocks on the CFO's door, slightly pale. Forty minutes ago they were on a video call with the CEO, who asked for help with something confidential.\n\nThe manager has already sent part of a large payment, and another is scheduled for this afternoon. They followed the CEO's instructions. Something about the call still bothers them, and they cannot quite say what.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. En ekonomiansvarig på {{org.name}} knackar på ekonomichefens dörr, lite blek. För fyrtio minuter sedan var hen med i ett videosamtal med vd, som bad om hjälp med något konfidentiellt.\n\nDen ekonomiansvariga har redan skickat en del av en stor betalning, och ytterligare en är schemalagd till i eftermiddag. Hen följde vd:s instruktioner. Något med samtalet stör ändå, och hen kan inte riktigt säga vad."
        ]),
        injects: [
          inj("i1-1", 0, "employeeReport", "employee", "high", "unverified", [
            "“The CEO said there's a confidential acquisition and we must pay a deposit of {{num.amount|currency}} today, split in two. I've sent the first part. It felt odd that I couldn't tell anyone, so I'm telling you.”",
            "”Vd sa att det pågår ett hemligt förvärv och att vi måste betala en handpenning på {{num.amount|currency}} i dag, uppdelad i två delar. Jag har skickat den första delen. Det kändes konstigt att jag inte fick berätta för någon, så jag berättar för dig.”"
          ], { headline: ["“The CEO asked me to pay”", "”Vd bad mig betala”"], statedReliability: ["First-hand account", "Förstahandsuppgift"], tests: ["lo1"] }),
          inj("i1-2", 10, "logExcerpt", "bank", "medium", "confirmed", [
            "The bank portal shows the first transfer — {{num.tranchePct}} per cent of the amount — sent to a foreign account eleven minutes ago. The second is scheduled for this afternoon.",
            "Bankportalen visar den första överföringen – {{num.tranchePct}} procent av beloppet – skickad till ett utländskt konto för elva minuter sedan. Den andra är schemalagd till i eftermiddag."
          ], { tests: ["lo1"] }),
          inj("i1-3", 20, "sms", "person.ceo", "medium", "misleading", [
            "A text from the CEO's number: “Please keep this between us. Complete the second payment.”",
            "Ett sms från vd:ns nummer: ”Håll det här mellan oss. Genomför den andra betalningen.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Spoofed sender. Watch whether the group treats a familiar number as proof.", "Förfalskad avsändare. Se om gruppen behandlar ett välbekant nummer som bevis."], tests: ["lo2"],
            meta: {
              thread: [
                { side: "out", text: L(["The first payment has gone. Should I wait for the signed paperwork before the second?", "Den första betalningen har gått. Ska jag vänta på de undertecknade papperen innan den andra?"]) },
                { side: "in", text: L(["Please keep this between us. Complete the second payment.", "Håll det här mellan oss. Genomför den andra betalningen."]) }
              ]
            }
          })
        ],
        questions: {
          technical: [
            q("How do you reach the real CEO through a channel you trust?", "Hur når ni den riktiga vd:n via en kanal ni litar på?", ["securityOfficer", "itOps"]),
            q("What records exist of the video call?", "Vilka spår finns av videosamtalet?", ["itOps", "socLead"]),
            q("Can a text from a known number be trusted?", "Går det att lita på ett sms från ett känt nummer?", ["socLead"])
          ],
          executive: [
            q("How fast can the bank stop the second payment and try to recall the first?", "Hur snabbt kan banken stoppa den andra betalningen och försöka återkalla den första?", ["cfo"]),
            q("Who is allowed to approve a payment this size?", "Vem får godkänna en betalning av den här storleken?", ["cfo", "ceo"]),
            q("How do you treat the finance manager right now?", "Hur bemöter ni den ekonomiansvariga just nu?", ["cfo", "hr"])
          ]
        },
        challenges: [ch("If the acquisition is real, stopping the payment could break a deal.", "Om förvärvet är på riktigt kan ett stopp av betalningen förstöra en affär.")],
        decision: dec("d1", "cfo", ["What do you do with the payments?", "Vad gör ni med betalningarna?"], [
          ["Stop the second payment, ask the bank to recall the first, and verify with the CEO through a known channel.", "Stoppa den andra betalningen, be banken återkalla den första och stäm av med vd via en känd kanal."],
          ["Pause the second payment until the CEO confirms.", "Pausa den andra betalningen tills vd bekräftar."],
          ["Complete it: the CEO was on camera, the deal is real, and missing today's deadline could cost the acquisition.", "Genomför den: vd syntes i bild, affären är verklig, och att missa dagens tidsgräns kan kosta förvärvet."]
        ], {
          knowns: [["One payment has gone abroad.", "En betalning har gått utomlands."], ["Secrecy was demanded.", "Hemlighållande krävdes."]],
          uncertainties: [["Whether the call was real.", "Om samtalet var äkta."]],
          tradeoffs: {
            operational: ["A real deal could be delayed.", "En verklig affär kan försenas."],
            security: ["Secrecy and urgency are classic fraud markers.", "Hemlighållande och brådska är klassiska kännetecken för bedrägeri."],
            legal: ["Recall chances fall by the hour.", "Möjligheten att återkalla minskar för varje timme."],
            reputational: ["Losing the money is worse than an awkward call to the CEO.", "Att förlora pengarna är värre än ett obekvämt samtal till vd."]
          },
          evaluation: [["Acts on the payment before certainty", "Agerar på betalningen innan det finns visshet"], ["Verifies through an independent channel", "Kontrollerar via en oberoende kanal"]],
          pushback: {
            A: [
              pb(["The CEO cannot be reached", "Vd går inte att nå"], ["You call the CEO's known mobile and their assistant: voicemail, and the calendar says only “away”. The recall is already with the bank. Do you keep the payment stopped for hours with no confirmation either way, and what if the deal turns out to be real?", "Ni ringer vd:s kända mobilnummer och assistenten: röstbrevlåda, och kalendern säger bara ”borta”. Återkallelsen ligger redan hos banken. Håller ni betalningen stoppad i flera timmar utan bekräftelse åt något håll, och vad händer om affären visar sig vara verklig?"]),
              pb(["The bank wants grounds", "Banken vill ha skäl"], ["The bank asks on what grounds you are recalling a payment your own manager authorised. A recall for fraud needs you to claim fraud, in writing. Do you call it fraud now, before you know, and live with that if the CEO did ask for it?", "Banken frågar på vilka grunder ni återkallar en betalning som er egen ekonomiansvariga har godkänt. En återkallelse på grund av bedrägeri kräver att ni skriftligen påstår bedrägeri. Kallar ni det bedrägeri nu, innan ni vet, och står ni för det om vd faktiskt bad om betalningen?"]),
              pb(["“Let me call them back”", "”Låt mig ringa tillbaka”"], ["The finance manager is sure they have just wrecked an acquisition and wants to call the “CEO” back on the link from the meeting invite to explain. Do you allow it, forbid any contact with that link, or listen in, and what do they say if it answers?", "Den ekonomiansvariga är säker på att hen just har förstört ett förvärv och vill ringa tillbaka till ”vd” via länken i mötesinbjudan för att förklara. Tillåter ni det, förbjuder ni all kontakt via den länken eller lyssnar ni med, och vad ska hen säga om någon svarar?"])
            ],
            B: [
              pb(["The first payment keeps moving", "Den första betalningen rör sig"], ["The pause protects the second payment, but the first is already abroad, and the bank says the chance of a recall falls every hour. You have not asked for one. Do you keep waiting for the CEO, or try to pull the money back without confirmation?", "Pausen skyddar den andra betalningen, men den första är redan utomlands, och banken säger att chansen till återkallelse minskar för varje timme. Ni har inte begärt någon. Fortsätter ni vänta på vd, eller försöker ni få tillbaka pengarna utan bekräftelse?"]),
              pb(["Confirmation by text", "Bekräftelse via sms"], ["A new text arrives from the CEO's number: “Confirmed. Please release it now.” Your condition was that the CEO confirms. Does this count, and if not, what exactly would count as confirmation?", "Ett nytt sms kommer från vd:s nummer: ”Bekräftat. Släpp den nu.” Ert villkor var att vd bekräftar. Räknas det här, och om inte, vad exakt räknas då som en bekräftelse?"]),
              pb(["Who owns the pause?", "Vem äger pausen?"], ["Your payment routine has no step for “paused pending verification”. The bank asks who may hold a scheduled payment and for how long. Who owns this pause, by name, and when does it run out on its own?", "Er betalningsrutin har inget steg för ”pausad i väntan på kontroll”. Banken frågar vem som får hålla inne en schemalagd betalning och hur länge. Vem äger den här pausen, med namn, och när löper den ut av sig själv?"])
            ],
            C: [
              pb(["No paperwork anywhere", "Inga papper någonstans"], ["Legal looks for the acquisition: no confidentiality agreement, no letter of intent, no adviser engaged. Every earlier deal had all three. Do you still send the second payment on the strength of one video call?", "Juristerna letar efter förvärvet: inget sekretessavtal, ingen avsiktsförklaring, ingen rådgivare anlitad. Alla tidigare affärer har haft alla tre. Skickar ni ändå den andra betalningen enbart på grund av ett videosamtal?"]),
              pb(["The manager refuses", "Den ekonomiansvariga vägrar"], ["The finance manager says they will not press send a second time: something felt wrong, and that is why they came to you. Do you overrule the person who raised the alarm, or press send yourself and own it?", "Den ekonomiansvariga säger att hen inte tänker trycka på skicka en gång till: något kändes fel, och det var därför hen kom till er. Kör ni över den som slog larm, eller trycker ni på skicka själva och tar ansvaret?"]),
              pb(["The bank calls back", "Banken ringer tillbaka"], ["The bank's fraud desk phones: the receiving account was opened recently, and they advise against sending more. If you go ahead, they want written confirmation that you were warned. Do you sign it?", "Bankens bedrägeriavdelning ringer: det mottagande kontot öppnades nyligen, och de avråder från att skicka mer. Om ni går vidare vill de ha en skriftlig bekräftelse på att ni har blivit varnade. Skriver ni under?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The recall request", "Begäran om återkallelse"], [
              io(["The bank holds it", "Banken håller emot"], ["{{supplier.bank}} confirms the second payment is stopped and the recall request for the first has gone to the receiving bank. They cannot promise anything, but they say you moved faster than most.", "{{supplier.bank}} bekräftar att den andra betalningen är stoppad och att begäran om återkallelse av den första har gått till den mottagande banken. De kan inte lova något, men säger att ni agerade snabbare än de flesta."], ["The second payment is stopped and a recall of the first is requested.", "Den andra betalningen är stoppad och en återkallelse av den första är begärd."]),
              io(["Grounds in writing", "Skäl i skrift"], ["The bank will only send the recall as a fraud case, signed by an authorised signatory, and can hold the second payment only until the end of the day without it. The CEO is the other signatory, and still cannot be reached.", "Banken skickar bara återkallelsen som ett bedrägeriärende, undertecknat av en behörig firmatecknare, och kan utan det hålla inne den andra betalningen bara dagen ut. Den andra firmatecknaren är vd, som fortfarande inte går att nå."], ["Without a signed fraud claim, the bank holds the payment only until day's end.", "Utan ett undertecknat bedrägeripåstående håller banken inne betalningen bara dagen ut."], { reopen: true }),
              io(["A text asks why", "Ett sms frågar varför"], ["A text arrives from the CEO's number: “Why has the payment stopped? Call me.” You call straight back. It goes to voicemail.", "Ett sms kommer från vd:s nummer: ”Varför har betalningen stoppats? Ring mig.” Ni ringer direkt tillbaka. Det går till röstbrevlådan."], ["A text from the CEO's number asked why the payment stopped; calls go to voicemail.", "Ett sms från vd:s nummer frågade varför betalningen stoppades; samtal går till röstbrevlådan."])
            ]),
            ir("i2", { notChosen: "A" }, ["No recall requested", "Ingen återkallelse begärd"], [
              io(["The money moves on", "Pengarna går vidare"], ["The bank calls on its own initiative: part of the first payment has already been moved on from the receiving account. Any recall now depends on what is left there, and that shrinks by the hour.", "Banken ringer på eget initiativ: en del av den första betalningen har redan flyttats vidare från det mottagande kontot. En återkallelse beror nu på vad som finns kvar där, och det minskar för varje timme."], ["Part of the first payment has already left the receiving account.", "En del av den första betalningen har redan lämnat det mottagande kontot."], { reopen: true }),
              io(["No paperwork found", "Inga papper hittade"], ["Legal searches for the acquisition and finds nothing: no agreement, no adviser, no board item. They add that the CEO has kept early deals to a very small circle before.", "Juristerna letar efter förvärvet och hittar ingenting: inget avtal, ingen rådgivare, ingen styrelsepunkt. De tillägger att vd tidigare har hållit tidiga affärer inom en mycket liten krets."], ["Legal has found no paperwork for the acquisition.", "Juristerna har inte hittat några papper om förvärvet."]),
              io(["A glitch remembered", "Ett minne av en störning"], ["Asked to go through the call again, the finance manager remembers that the CEO's picture froze twice and the voice lagged behind the lips. At the time they put it down to a bad connection.", "När den ekonomiansvariga går igenom samtalet igen minns hen att vd:s bild frös två gånger och att rösten släpade efter läpparna. Då trodde hen att det var en dålig uppkoppling."], ["The manager recalls the CEO's picture froze and the sound lagged.", "Den ekonomiansvariga minns att vd:s bild frös och att ljudet släpade."])
            ])
          ]
        }),
        facilitator: fac(
          ["Speed matters more than proof here. The bank window is short.", "Snabbhet är viktigare än bevis här. Bankens fönster är kort."],
          ["Second payment stopped, recall requested and the CEO reached independently.", "Andra betalningen stoppad, återkallelse begärd och vd nådd på egen väg."],
          [["Ask: what number would you call the CEO on?", "Fråga: vilket nummer skulle ni ringa vd på?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["The CEO was in the air", "Vd var i luften"]),
        twist: L(["The CEO lands and calls: they were on a flight during the call. Someone used a synthetic copy of their face and voice.", "Vd landar och ringer: de satt på ett flygplan under samtalet. Någon använde en syntetisk kopia av deras ansikte och röst."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the second payment was stopped, the real counterparty in the acquisition, who did expect a payment this week, asks whether the deal is off.", sv: "Eftersom den andra betalningen stoppades frågar den verkliga motparten i förvärvet, som faktiskt väntade sig en betalning den här veckan, om affären är avbruten." } }
        ],
        assumptionChallenged: L(["Seeing and hearing someone on a video call proves it is them.", "Att se och höra någon i ett videosamtal bevisar att det är de."]),
        reveals: ["hf-fake"],
        narrative: L([
          "{{time.T+60|clock}}. Nobody has been able to reach the CEO all morning. Then {{person.ceo.name}} calls back from the arrivals hall of an airport, having just switched their phone on.\n\nThe finance manager is in the room when the call is put on speaker. What the CEO says turns a strange payment into something much more serious.",
          "Klockan {{time.T+60|clock}}. Ingen har lyckats nå vd under förmiddagen. Sedan ringer {{person.ceo.name}} tillbaka från ankomsthallen på en flygplats, precis när telefonen slagits på.\n\nDen ekonomiansvariga är i rummet när samtalet läggs på högtalare. Det vd säger förvandlar en märklig betalning till något mycket allvarligare."
        ]),
        injects: [
          inj("i2-1", 60, "phoneTranscript", "person.ceo", "critical", "confirmed", [
            "“I've been in the air for three hours. There's no acquisition. Whoever that was, it wasn't me.”",
            "”Jag har suttit på planet i tre timmar. Det finns inget förvärv. Vem det än var, så var det inte jag.”"
          ], { headline: ["The call was fake", "Samtalet var falskt"], reveals: ["hf-fake"], tests: ["lo2"] }),
          inj("i2-2", 75, "phoneTranscript", "bank", "high", "confirmed", [
            "{{supplier.bank}}: “The second payment is stopped. We've sent a recall for the first, but the receiving bank must cooperate. A police report helps.”",
            "{{supplier.bank}}: ”Den andra betalningen är stoppad. Vi har skickat en återkallelse för den första, men den mottagande banken måste samarbeta. En polisanmälan hjälper.”"
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How was the call joined — which platform, invite and account?", "Hur anslöt man till samtalet – vilken plattform, inbjudan och vilket konto?", ["itOps", "socLead"]),
            q("Where could they find enough of the CEO's voice and face?", "Var kunde de hitta tillräckligt mycket av vd:ns röst och ansikte?", ["securityOfficer"]),
            q("Did your first decision stop the money in time?", "Stoppade ert första beslut pengarna i tid?", ["cfo"], "d1")
          ],
          executive: [
            q("Do you report to the police now?", "Polisanmäler ni nu?", ["legal", "cfo"]),
            q("Who else in the company could be targeted the same way?", "Vilka andra i företaget kan utsättas på samma sätt?", ["ceo", "securityOfficer"]),
            q("Would you handle the payment differently now?", "Skulle ni hantera betalningen annorlunda nu?", ["cfo"], "d1")
          ]
        },
        challenges: [ch("The finance manager is distraught and blames themselves.", "Den ekonomiansvariga är förtvivlad och skyller på sig själv.")],
        decision: dec("d2", "incidentCommander", ["What is your immediate response?", "Vad är er omedelbara åtgärd?"], [
          ["Police report, recall support, and a warning to finance and executive assistants about fake calls.", "Polisanmälan, stöd till återkallelsen och en varning till ekonomi och chefsassistenter om falska samtal."],
          ["Police report and recall; keep it quiet internally.", "Polisanmälan och återkallelse; håll det tyst internt."],
          ["Handle it as a finance matter.", "Hantera det som en ekonomifråga."]
        ], {
          knowns: [["The call was synthetic.", "Samtalet var syntetiskt."], ["The second payment is stopped.", "Den andra betalningen är stoppad."]],
          uncertainties: [["Whether the first payment can be recovered.", "Om den första betalningen kan återfås."]],
          tradeoffs: {
            operational: ["A warning will cause some suspicion of real calls.", "En varning gör att även äkta samtal blir misstänkta."],
            security: ["Silence leaves others exposed to the same trick.", "Tystnad lämnar andra sårbara för samma trick."],
            legal: ["A police report supports the recall.", "En polisanmälan stödjer återkallelsen."],
            reputational: ["An internal warning may leak.", "En intern varning kan läcka ut."]
          },
          evaluation: [["Warns likely targets quickly", "Varnar troliga måltavlor snabbt"]],
          pushback: {
            A: [
              pb(["Real calls get refused", "Äkta samtal nekas"], ["An assistant, following your warning, refuses to put the real CEO through to a key customer. The customer is offended. How should people check a genuine call from today, and who tells them before the next one is refused?", "En assistent som följer er varning vägrar koppla den riktiga vd:n till en viktig kund. Kunden tar illa upp. Hur ska folk kontrollera ett äkta samtal från och med i dag, och vem talar om det för dem innan nästa samtal nekas?"]),
              pb(["Everyone knows who paid", "Alla vet vem som betalade"], ["Your warning describes the fraud in enough detail that all of finance knows who sent the money. The finance manager asks why their mistake was broadcast. Do you stand by the wording, rewrite it, or apologise?", "Er varning beskriver bedrägeriet så detaljerat att hela ekonomiavdelningen vet vem som skickade pengarna. Den ekonomiansvariga frågar varför hens misstag basunerades ut. Står ni för formuleringen, skriver ni om den eller ber ni om ursäkt?"]),
              pb(["The police want it contained", "Polisen vill begränsa spridningen"], ["The officer taking your report asks you to limit how widely the details spread while they try to trace the receiving account. Your warning has already gone out. Do you pull it back and leave staff exposed, or keep it and risk the trace?", "Polisen som tar emot anmälan ber er begränsa hur långt detaljerna sprids medan de försöker spåra det mottagande kontot. Er varning har redan gått ut. Drar ni tillbaka den och lämnar personalen oskyddad, eller låter ni den ligga och riskerar spårningen?"])
            ],
            B: [
              pb(["Rumours fill the silence", "Rykten fyller tystnaden"], ["Half the finance floor saw the CEO on speaker and the manager in tears. By lunch, people are saying someone stole millions, or was fired. Silence is being filled with guesses. Do you still say nothing, and for how long?", "Halva ekonomiavdelningen såg vd på högtalare och den ekonomiansvariga i tårar. Till lunch säger folk att någon har stulit miljoner, eller fått sparken. Tystnaden fylls med gissningar. Säger ni fortfarande ingenting, och hur länge?"]),
              pb(["The police ask who else", "Polisen frågar vilka fler"], ["The police ask whether anyone else in the company was approached. You cannot know without asking staff, and asking breaks the silence. Do you ask quietly, one by one, or keep the circle closed and not know?", "Polisen frågar om någon annan i företaget har blivit kontaktad. Det kan ni inte veta utan att fråga personalen, och att fråga bryter tystnaden. Frågar ni diskret, en i taget, eller håller ni kretsen sluten och förblir ovetande?"]),
              pb(["The CEO's own assistant", "Vd:s egen assistent"], ["The CEO's assistant manages their calendar and calls, and has not been told. Anyone who wants the CEO's voice to work again would start there. Do you really leave them out, and on what basis do you choose who is told?", "Vd:s assistent sköter kalendern och samtalen och har inte fått veta något. Den som vill att vd:s röst ska fungera igen skulle börja där. Lämnar ni verkligen assistenten utanför, och på vilken grund väljer ni vem som får veta?"])
            ],
            C: [
              pb(["Nobody files the report", "Ingen gör anmälan"], ["The bank repeats that a police report helps the recall. Finance says reporting crimes is not their job, and nobody else has been asked. Who files it, and how many more hours of recall chance are you willing to lose deciding?", "Banken upprepar att en polisanmälan hjälper återkallelsen. Ekonomi säger att det inte är deras uppgift att anmäla brott, och ingen annan har fått frågan. Vem gör anmälan, och hur många fler timmar av chansen till återkallelse är ni beredda att förlora på att bestämma det?"]),
              pb(["The trick still works", "Tricket fungerar fortfarande"], ["Nothing in a finance response stops the same face and voice calling someone outside finance tomorrow. Security has not been asked to look at how the call was set up. Whose job is that, and why did you decide it was not part of this?", "Ingenting i en ekonomihantering hindrar samma ansikte och röst från att ringa någon utanför ekonomi i morgon. Säkerhet har inte ombetts titta på hur samtalet arrangerades. Vems uppgift är det, och varför bestämde ni att det inte ingick?"]),
              pb(["Left alone with auditors", "Ensam med revisorerna"], ["Handled as a finance matter, the finance manager gets questions from controllers about the payment, but no support and no word from HR. They ask whether they are being investigated. What do you tell them, and who should?", "När det hanteras som en ekonomifråga får den ekonomiansvariga frågor från controllers om betalningen, men inget stöd och inget besked från HR. Hen frågar om hen är föremål för utredning. Vad svarar ni, och vem borde svara?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["After the warning", "Efter varningen"], [
              io(["A case number", "Ett diarienummer"], ["The police register the report straight away and give you a case number. {{supplier.bank}} says it strengthens the recall request considerably.", "Polisen registrerar anmälan direkt och ger er ett diarienummer. {{supplier.bank}} säger att det stärker begäran om återkallelse avsevärt."], ["A police case number backs the recall request.", "Ett polisiärt diarienummer stödjer begäran om återkallelse."]),
              io(["The warning leaks", "Varningen läcker"], ["Within two hours your warning has been forwarded outside the company. A business reporter asks comms to confirm a “CEO fraud” at {{org.name}}. Nobody has agreed what to say.", "Inom två timmar har er varning vidarebefordrats utanför företaget. En näringslivsreporter ber kommunikation bekräfta ett ”vd-bedrägeri” på {{org.name}}. Ingen har kommit överens om vad som ska sägas."], ["A reporter has asked about a fraud at the company.", "En reporter har frågat om ett bedrägeri på företaget."], { reopen: true, meters: { media: 1 } }),
              io(["The police call back later", "Polisen ringer tillbaka senare"], ["The report is taken, but the officer says the fraud unit will call back, perhaps tomorrow. Meanwhile, two assistants ask how they should check whether a call is real today.", "Anmälan tas emot, men polisen säger att bedrägerienheten ringer tillbaka, kanske i morgon. Under tiden frågar två assistenter hur de ska kontrollera om ett samtal är äkta i dag."], ["The police report is filed; investigators have not yet called back.", "Polisanmälan är gjord; utredarna har ännu inte ringt tillbaka."])
            ]),
            ir("i2", { notChosen: "A" }, ["Nobody else was warned", "Ingen annan varnades"], [
              io(["Finance has no guidance", "Ekonomi saknar vägledning"], ["A payments clerk asks the CFO whether to process an urgent request from an executive that just arrived by chat. Nobody has told finance what to look for, or whom to call.", "En betalningshandläggare frågar ekonomichefen om hen ska genomföra en brådskande begäran från en chef som just kom via chatten. Ingen har talat om för ekonomi vad de ska se upp med, eller vem de ska ringa."], ["Finance staff have no guidance on unusual executive requests.", "Ekonomipersonalen saknar vägledning om ovanliga förfrågningar från chefer."], { reopen: true }),
              io(["Quiet holds", "Tystnaden håller"], ["By the afternoon nothing has spread beyond the crisis team. The CFO says it proves the right call: no panic, no rumours, no reporters.", "Till eftermiddagen har ingenting spridits utanför krisledningen. Ekonomichefen säger att det bevisar att beslutet var rätt: ingen panik, inga rykten, inga reportrar."], ["Nothing about the fraud has spread beyond the crisis team so far.", "Ingenting om bedrägeriet har hittills spridits utanför krisledningen."]),
              io(["Talk on the floor", "Prat på golvet"], ["Colleagues saw the finance manager leave the CFO's office in tears. By lunch some say they made a huge mistake, others that they were fired. The manager asks you what they are allowed to say.", "Kollegor såg den ekonomiansvariga lämna ekonomichefens rum i tårar. Till lunch säger vissa att hen gjorde ett enormt misstag, andra att hen fick sparken. Den ekonomiansvariga frågar er vad hen får säga."], ["Rumours about the finance manager are spreading on the floor.", "Rykten om den ekonomiansvariga sprids på avdelningen."])
            ])
          ]
        }),
        facilitator: fac(
          ["The emotional turn. Watch how the group talks about the employee.", "Den känslomässiga vändningen. Se hur gruppen pratar om den anställda."],
          ["Police report, recall pursued and likely targets warned.", "Polisanmälan, återkallelsen drivs och troliga måltavlor varnas."],
          [["Ask: would you have spotted it?", "Fråga: skulle ni ha upptäckt det?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 150,
        title: L(["The voice at the service desk", "Rösten på servicedesken"]),
        twist: L(["Before the payment, the same voice phoned the service desk and had the CEO's MFA reset.", "Före betalningen ringde samma röst servicedesken och fick vd:ns MFA återställd."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "The same voice had the CEO's MFA reset before the payment. If you warned finance and the assistants, the attackers may now know you are onto them. If you kept it quiet, the service desk never heard.", sv: "Samma röst fick vd:s MFA återställd före betalningen. Om ni varnade ekonomi och assistenterna kan angriparna nu veta att ni är dem på spåren. Om ni höll tyst fick servicedesken aldrig veta." } },
        assumptionChallenged: L(["This was only payment fraud.", "Det här var bara betalningsbedrägeri."]),
        reveals: ["hf-helpdesk"],
        narrative: L([
          "{{time.T+150|clock}}. The CEO tries to log in to email from the taxi, and cannot: the account no longer accepts their phone.\n\nThe service desk checks the history. The video call was not the first time someone used the CEO's face or voice this week, and the first time was aimed at something more useful than money.",
          "Klockan {{time.T+150|clock}}. Vd försöker logga in i e-posten från taxin, och kan inte: kontot godtar inte längre deras telefon.\n\nServicedesken kontrollerar historiken. Videosamtalet var inte första gången någon använde vd:s ansikte eller röst den här veckan, och första gången riktades mot något mer användbart än pengar."
        ]),
        injects: [
          inj("i3-1", 150, "ticket", "serviceDesk", "critical", "confirmed", [
            "Ticket {{asset.ticketId}}: “CEO called at {{time.T-20|clock}}, lost phone while travelling, MFA reset and new device enrolled.” The call recording sounds exactly like the CEO.",
            "Ärende {{asset.ticketId}}: ”Vd ringde klockan {{time.T-20|clock}}, tappade telefonen på resan, MFA återställd och ny enhet registrerad.” Samtalsinspelningen låter precis som vd."
          ], { headline: ["CEO account reset by phone", "Vd:ns konto återställt via telefon"], reveals: ["hf-helpdesk"], tests: ["lo2"] }),
          inj("i3-2", 170, "authLog", "siem", "high", "confirmed", [
            "Since the reset, the CEO's account has signed in from {{asset.attackerIp}}, read the board folder and searched mail for “acquisition” and “bank”.",
            "Sedan återställningen har vd:ns konto loggat in från {{asset.attackerIp}}, läst styrelsemappen och sökt i e-posten efter ”förvärv” och ”bank”."
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("How do you take the CEO's account back and remove the new device?", "Hur tar ni tillbaka vd:ns konto och tar bort den nya enheten?", ["itOps", "socLead"]),
            q("Which other resets were done by phone recently?", "Vilka andra återställningar har gjorts via telefon nyligen?", ["itOps"]),
            q("Did your warning reach the service desk?", "Nådde er varning servicedesken?", ["itOps"], "d2")
          ],
          executive: [
            q("What did the attacker read in the board folder, and does it matter?", "Vad läste angriparen i styrelsemappen, och spelar det någon roll?", ["ceo", "legal"]),
            q("How should the service desk verify executives from now on?", "Hur ska servicedesken kontrollera chefer framöver?", ["ciso"]),
            q("Was keeping it inside finance and the executive team enough?", "Räckte det att hålla det inom ekonomi och ledningen?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("The service-desk agent followed the procedure — it just trusted a voice.", "Servicedeskens medarbetare följde rutinen – den litade bara på en röst.")],
        decision: dec("d3", "ciso", ["How do you secure executive identities?", "Hur skyddar ni chefernas identiteter?"], [
          ["Reclaim the account, suspend phone-based resets for all staff and require in-person or video-plus-callback verification.", "Ta tillbaka kontot, stoppa återställningar via telefon för all personal och kräv verifiering på plats eller via video plus återuppringning."],
          ["Reclaim the account and suspend phone resets for executives only.", "Ta tillbaka kontot och stoppa återställningar via telefon enbart för chefer."],
          ["Reclaim the account and remind the service desk to be careful.", "Ta tillbaka kontot och påminn servicedesken om att vara försiktig."]
        ], {
          knowns: [["A voice clone defeated the reset procedure.", "En röstklon tog sig förbi rutinen för återställning."]],
          uncertainties: [["Which other accounts were reset this way.", "Vilka andra konton som har återställts på det här sättet."]],
          tradeoffs: {
            operational: ["Stricter resets lock out real travellers.", "Strängare återställningar stänger ute verkliga resenärer."],
            security: ["A video call is no longer proof on its own.", "Ett videosamtal är inte längre ett bevis i sig."],
            legal: ["Board material may be sensitive information.", "Styrelsematerial kan vara känslig information."],
            reputational: ["A weak procedure is now a known one.", "En svag rutin är nu en känd rutin."]
          },
          evaluation: [["Fixes the process, not just the account", "Rättar processen, inte bara kontot"]],
          pushback: {
            A: [
              pb(["Video is what fooled you", "Det var video som lurade er"], ["The service-desk lead points out that your new rule accepts video plus callback, and a video call is exactly what fooled the finance manager this morning. Is the callback carrying all the weight, and to which number, from which list?", "Servicedeskens chef påpekar att er nya regel godtar video plus återuppringning, och ett videosamtal är precis vad som lurade den ekonomiansvariga i morse. Bär återuppringningen hela tyngden, och till vilket nummer, från vilken lista?"]),
              pb(["The CEO wants it now", "Vd vill ha det nu"], ["The CEO, still without email in a taxi, demands to be reset by phone straight away: “You know my voice.” Under your new rule, they must come in or do video plus callback. Who tells the CEO no, and do you hold?", "Vd, fortfarande utan e-post i en taxi, kräver att bli återställd via telefon direkt: ”Ni känner ju min röst.” Enligt er nya regel måste vd komma in eller göra video plus återuppringning. Vem säger nej till vd, och håller ni fast vid det?"]),
              pb(["Staff abroad locked out", "Personal utomlands utestängd"], ["A sales team abroad needs resets before a customer pitch tomorrow and cannot come in. The service desk asks for an exception process today. How is your exception different from the phone reset you just stopped?", "Ett säljteam utomlands behöver återställningar inför en kundpresentation i morgon och kan inte komma in. Servicedesken vill ha en rutin för undantag i dag. Hur skiljer sig ert undantag från den telefonåterställning ni just stoppade?"])
            ],
            B: [
              pb(["Who counts as an executive?", "Vem räknas som chef?"], ["Your list covers the leadership team. It does not cover the people with delegated access to their mailboxes and calendars, or the IT administrators whose accounts can do more than any executive's. Do you protect titles, or access?", "Er lista omfattar ledningsgruppen. Den omfattar inte de personer som har delegerad åtkomst till ledningens brevlådor och kalendrar, eller IT-administratörerna vars konton kan göra mer än någon chefs. Skyddar ni titlar eller åtkomst?"]),
              pb(["A personal exception", "Ett personligt undantag"], ["Two executives say the new rule will lock them out on their travels next week, and one asks the service desk to keep accepting their voice “because they know me”. Do you grant the exception that recreates the old hole?", "Två chefer säger att den nya regeln kommer att stänga ute dem på deras resor nästa vecka, och en ber servicedesken fortsätta godta rösten ”eftersom de känner mig”. Beviljar ni undantaget som återskapar det gamla hålet?"]),
              pb(["Two classes of account", "Två klasser av konton"], ["A team lead asks why executives get protection and everyone else does not, when the attacker only needs one account with the right access. Can you explain, out loud, why their account is not worth protecting?", "En teamledare frågar varför cheferna får skydd och alla andra inte, när angriparen bara behöver ett konto med rätt åtkomst. Kan ni förklara, högt, varför deras konto inte är värt att skydda?"])
            ],
            C: [
              pb(["Careful how, exactly?", "Försiktig hur, exakt?"], ["The service-desk lead asks what “be careful” means in practice. The agent followed every step of the procedure, and the voice was perfect. What should they do differently on the next call, concretely, and is it written anywhere?", "Servicedeskens chef frågar vad ”var försiktig” betyder i praktiken. Medarbetaren följde varje steg i rutinen, och rösten var perfekt. Vad ska de göra annorlunda vid nästa samtal, konkret, och står det någonstans?"]),
              pb(["The agent stops answering", "Medarbetaren slutar svara"], ["After your reminder, the agent who did the reset refuses to take any more reset calls, and two colleagues feel blamed too. The queue is growing. Who takes the calls, and what did your reminder actually tell them?", "Efter er påminnelse vägrar medarbetaren som gjorde återställningen att ta fler samtal om återställning, och två kollegor känner sig också utpekade. Kön växer. Vem tar samtalen, och vad sa er påminnelse egentligen till dem?"]),
              pb(["Internal audit asks", "Internrevisionen frågar"], ["Internal audit notes that a known attack path into the CEO's account was answered with a reminder. They plan to report it to the board. Can you defend that, and what would you add before the report is written?", "Internrevisionen noterar att en känd angreppsväg in i vd:s konto besvarades med en påminnelse. De planerar att rapportera det till styrelsen. Kan ni försvara det, och vad skulle ni lägga till innan rapporten skrivs?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["No resets by phone", "Inga återställningar via telefon"], [
              io(["The account is back", "Kontot är tillbaka"], ["The rogue device is removed and the sign-ins from {{asset.attackerIp}} stop. The CEO is reset in person at reception and reads their email within the hour.", "Den främmande enheten tas bort och inloggningarna från {{asset.attackerIp}} upphör. Vd återställs på plats i receptionen och läser sin e-post inom en timme."], ["The CEO's account is back under company control.", "Vd:s konto är tillbaka under företagets kontroll."]),
              io(["Travellers locked out", "Resenärer utestängda"], ["By evening, twenty staff abroad cannot get back into their accounts, including a team in the middle of a customer tender. Their director calls the CEO and demands an exception tonight.", "Till kvällen kommer tjugo medarbetare utomlands inte in i sina konton, bland dem ett team mitt i ett kundanbud. Deras chef ringer vd och kräver ett undantag i kväll."], ["Staff abroad are locked out until another reset route exists.", "Personal utomlands är utestängd tills en annan väg för återställning finns."], { reopen: true, meters: { trust: -1 } }),
              io(["The CEO pushes back", "Vd protesterar"], ["Once back in, the CEO calls the company-wide rule overkill and asks for it to be reviewed within days. The service desk asks whose word now counts.", "När vd väl är inne kallar hen regeln för hela företaget överdriven och vill att den ses över inom några dagar. Servicedesken frågar vems ord som gäller nu."], ["The CEO wants the company-wide rule reviewed within days.", "Vd vill att regeln för hela företaget ses över inom några dagar."])
            ]),
            ir("i2", { notChosen: "A" }, ["Resets as before", "Återställningar som förut"], [
              io(["A reset goes through", "En återställning går igenom"], ["This afternoon a team lead with access to the payment system was reset by phone under the old procedure. The agent cannot say how they checked the caller. Nobody has called the team lead to confirm.", "I eftermiddags återställdes en teamledare med åtkomst till betalsystemet via telefon enligt den gamla rutinen. Medarbetaren kan inte säga hur hen kontrollerade den som ringde. Ingen har ringt teamledaren för att bekräfta."], ["A phone reset was done today for a non-executive with payment access, unconfirmed.", "En telefonåterställning gjordes i dag för en icke-chef med åtkomst till betalningar, obekräftad."], { reopen: true }),
              io(["A quiet afternoon", "En lugn eftermiddag"], ["No further reset requests arrive. The service-desk lead says the reminder has made everyone alert and that the procedure is working.", "Inga fler förfrågningar om återställning kommer in. Servicedeskens chef säger att påminnelsen har gjort alla vaksamma och att rutinen fungerar."], ["No further reset requests came in on the first afternoon.", "Inga fler förfrågningar om återställning kom in den första eftermiddagen."]),
              io(["No written rule", "Ingen skriven regel"], ["The agent who did the CEO's reset asks what they should accept from anyone who is not on your list. Nobody has written it down, and the next caller is waiting.", "Medarbetaren som återställde vd:s konto frågar vad hen ska godta från alla som inte står på er lista. Ingen har skrivit ned det, och nästa uppringare väntar."], ["The service desk has no written rule for other staff's resets.", "Servicedesken har ingen skriven regel för övriga anställdas återställningar."])
            ])
          ]
        }),
        facilitator: fac(
          ["Synthetic media attacks identity processes, not only people.", "Syntetiska medier angriper identitetsprocesser, inte bara människor."],
          ["Account reclaimed and phone-based resets stopped company-wide.", "Kontot återtaget och återställningar via telefon stoppade i hela företaget."],
          [["Ask: what does your service desk accept as proof of identity?", "Fråga: vad godtar er servicedesk som bevis på identitet?"]]
        )
      },
      {
        id: "p4",
        priority: 1,
        clock: 1440,
        title: L(["Words the CEO never said", "Ord som vd aldrig sa"]),
        twist: L(["Audio of the CEO making offensive remarks about staff and customers is published. It is fabricated — and spreading.", "Ljud där vd fäller kränkande kommentarer om personal och kunder publiceras. Det är fabricerat – och sprids."]),
        twistKind: "impact",
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because finance and the assistants were warned, the story reached a journalist before the fake audio did.", sv: "Eftersom ekonomi och assistenterna varnades nådde historien en journalist innan det falska ljudklippet gjorde det." } }
        ],
        assumptionChallenged: L(["The damage was the money.", "Skadan var pengarna."]),
        narrative: L([
          "The next morning. The fraud has been reported and the CEO's account has been secured. The crisis team hoped to handle the rest quietly.\n\nThen the CEO's name starts trending on social media. A clip is spreading fast, and the comments are furious. Customers, staff and journalists are all asking the same question.",
          "Nästa morgon. Bedrägeriet har anmälts och vd:s konto har säkrats. Krisledningen hoppades kunna hantera resten i det tysta.\n\nSedan börjar vd:s namn trenda i sociala medier. Ett klipp sprids snabbt, och kommentarerna är rasande. Kunder, personal och journalister ställer alla samma fråga."
        ]),
        injects: [
          inj("i4-1", 1440, "socialPost", "socialMedia", "high", "disputed", [
            "A post with a two-minute clip, “{{person.ceo.name}} on what they really think of customers”, has {{num.views}} plays. Comments are furious.",
            "Ett inlägg med ett klipp på två minuter, ”{{person.ceo.name}} om vad de egentligen tycker om kunderna”, har spelats {{num.views}} gånger. Kommentarerna är rasande."
          ], { facilitatorNote: ["Fabricated. The group cannot prove a negative; watch how they handle that.", "Fabricerat. Gruppen kan inte bevisa något som inte hänt; se hur de hanterar det."], tests: ["lo3"] }),
          inj("i4-2", 1470, "mediaEnquiry", "media", "high", "confirmed", [
            "A business reporter: “Is the recording genuine? Was the company also defrauded this week?”",
            "En näringslivsreporter: ”Är inspelningen äkta? Blev företaget också bedraget i veckan?”"
          ], { pressure: "media", substitute: { source: "customer", content: ["Two large customers ask whether the recording is genuine before their board meetings.", "Två stora kunder frågar om inspelningen är äkta inför sina styrelsemöten."] }, tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-spread", type: "line",
          title: L(["Plays of the fabricated clip", "Uppspelningar av det fabricerade klippet"]), unit: L(["thousand plays", "tusen uppspelningar"]),
          data: line(["Plays", "Uppspelningar"], 0, 12, 1, (x, ctx) => (ctx.vars.views / 1000) * Math.min(1, (x / 12) ** 1.6), "hours")
        }],
        questions: {
          technical: [
            q("What evidence can you give that the clip is synthetic?", "Vilka bevis kan ni ge för att klippet är syntetiskt?", ["securityOfficer", "socLead"]),
            q("Can the platforms take it down, and how fast?", "Kan plattformarna ta bort det, och hur snabbt?", ["comms", "legal"]),
            q("Could the material from the board folder be used next?", "Kan materialet från styrelsemappen användas härnäst?", ["socLead"], "d3")
          ],
          executive: [
            q("Does the CEO speak publicly, and how?", "Uttalar sig vd offentligt, och i så fall hur?", ["ceo", "comms"]),
            q("Do you disclose the payment fraud at the same time?", "Berättar ni om betalningsbedrägeriet samtidigt?", ["comms", "legal"]),
            q("Did your warning to staff prepare them for this?", "Förberedde er varning till personalen dem på det här?", ["hr", "comms"], "d2")
          ]
        },
        challenges: [ch("A denial from the CEO sounds exactly like what a guilty CEO would say.", "Ett förnekande från vd låter precis som det en skyldig vd skulle säga.")],
        decision: dec("d4", "ceo", ["How do you respond publicly?", "Hur svarar ni offentligt?"], [
          ["Tell the whole story: the fraud attempt, the fake media and the police report, with the CEO on camera in person.", "Berätta hela historien: bedrägeriförsöket, de falska medierna och polisanmälan, med vd framför kameran personligen."],
          ["Call the clip fabricated in one short statement, and keep the fraud attempt out of it while the police investigate.", "Kalla klippet förfalskat i ett kort uttalande, och håll bedrägeriförsöket utanför medan polisen utreder."],
          ["Say nothing yourselves and push the platforms to remove it; every statement spreads the clip further.", "Säg ingenting själva och pressa plattformarna att ta bort det; varje uttalande sprider klippet vidare."]
        ], {
          knowns: [["The clip is fabricated.", "Klippet är fabricerat."], ["Fraud was attempted.", "Ett bedrägeri har försökts."]],
          uncertainties: [["Whether more fakes will follow.", "Om fler förfalskningar kommer att följa."]],
          tradeoffs: {
            operational: ["Openness invites more questions about controls.", "Öppenhet bjuder in till fler frågor om kontrollerna."],
            security: ["Explaining the method helps others defend.", "Att förklara metoden hjälper andra att försvara sig."],
            legal: ["Commenting on an investigation needs care.", "Att kommentera en utredning kräver försiktighet."],
            reputational: ["Context is the only answer to a fake.", "Sammanhang är det enda svaret på en förfalskning."]
          },
          evaluation: [["Gives context rather than a bare denial", "Ger sammanhang i stället för ett naket förnekande"]],
          minutes: 10,
          pushback: {
            A: [
              pb(["A face against a face", "Ett ansikte mot ett ansikte"], ["Comms points out that you are answering a fake video of the CEO with a video of the CEO. Commenters are already asking why they should believe this one. What proof do you put next to the CEO's face, and who outside the company vouches for it?", "Kommunikation påpekar att ni besvarar en falsk video av vd med en video av vd. Kommentatorer frågar redan varför de ska tro på den här. Vilka bevis ställer ni bredvid vd:s ansikte, och vem utanför företaget går i god för dem?"]),
              pb(["The police ask you to wait", "Polisen ber er vänta"], ["The investigator asks you not to describe the payment fraud or how it was done yet, while they work with the receiving bank. Your statement is ready to go. Do you publish the whole story anyway, or cut the part that gives it context?", "Utredaren ber er att ännu inte beskriva betalningsbedrägeriet eller hur det gick till, medan de arbetar med den mottagande banken. Ert uttalande är klart att skickas. Publicerar ni hela historien ändå, eller stryker ni den del som ger sammanhanget?"]),
              pb(["“What else can a call move?”", "”Vad mer kan ett samtal flytta?”"], ["Two large customers read your full account and ask the obvious question: if a video call could move your money, what else of theirs could it move? They want answers before renewal. Are you ready to discuss your controls in public?", "Två stora kunder läser er fullständiga redogörelse och ställer den självklara frågan: om ett videosamtal kunde flytta era pengar, vad mer av deras kan det flytta? De vill ha svar före förnyelsen. Är ni beredda att diskutera era kontroller offentligt?"])
            ],
            B: [
              pb(["The reporter already knows", "Reportern vet redan"], ["The business reporter's question already mentions that you were defrauded this week. If your statement leaves it out and it surfaces later, it reads as concealment. Do you still keep the fraud out of it?", "Näringslivsreporterns fråga nämner redan att ni blev bedragna i veckan. Om ert uttalande utelämnar det och det kommer fram senare läses det som mörkläggning. Håller ni ändå bedrägeriet utanför?"]),
              pb(["“They would say that”", "”Det skulle de ju säga”"], ["The top reply to your statement: “Of course they'd say it's fake.” Plays keep climbing after you posted it. A bare denial has given the clip a second wave. What do you add, and how soon?", "Det populäraste svaret på ert uttalande: ”Klart att de säger att det är falskt.” Uppspelningarna fortsätter öka efter att ni publicerade det. Ett naket förnekande har gett klippet en andra våg. Vad lägger ni till, och hur snart?"]),
              pb(["Staff know more", "Personalen vet mer"], ["Staff who know about the fraud see the external statement leave it out. In the internal channel, someone asks whether they are being told the truth either. What do you say to your own people that you would not say outside?", "Medarbetare som känner till bedrägeriet ser att det externa uttalandet utelämnar det. I den interna kanalen frågar någon om de själva får höra sanningen. Vad säger ni till er egen personal som ni inte skulle säga utåt?"])
            ],
            C: [
              pb(["Copies everywhere", "Kopior överallt"], ["One platform removes the clip within hours. By then it is on three others, in chat groups and as a download link. Takedowns are not going to finish this. What is your plan when removal fails, and how long do you stay silent while it does?", "En plattform tar bort klippet inom några timmar. Då finns det redan på tre andra, i chattgrupper och som nedladdningslänk. Borttagningar kommer inte att avsluta det här. Vad är er plan när borttagningen misslyckas, och hur länge är ni tysta medan den gör det?"]),
              pb(["“Declined to comment”", "”Avböjer att kommentera”"], ["The first article runs with the line that the company declined to comment on the CEO's recording. Customers read it as confirmation. How long can you hold silence when your silence is now the story?", "Den första artikeln publiceras med raden att företaget avböjer att kommentera vd:s inspelning. Kunder läser det som en bekräftelse. Hur länge kan ni vara tysta när er tystnad nu är nyheten?"]),
              pb(["The CEO wants to speak", "Vd vill tala"], ["The CEO says they will not sit quietly while their name is dragged through this, and is ready to post a personal denial tonight with or without approval. Do you hold the CEO to your strategy, and how?", "Vd säger att hen inte tänker sitta tyst medan hens namn dras i smutsen, och är beredd att publicera ett personligt förnekande i kväll, med eller utan godkännande. Håller ni vd till er strategi, och hur?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The CEO on camera", "Vd framför kameran"], [
              io(["The story turns", "Berättelsen vänder"], ["A respected business outlet runs your account as a fraud story with the clip as part of it. The top comments under the clip start linking to it.", "En ansedd affärstidning publicerar er redogörelse som en bedrägerihistoria där klippet ingår. De populäraste kommentarerna under klippet börjar länka till den."], ["Leading coverage frames the clip as part of a fraud attempt.", "Den ledande bevakningen beskriver klippet som en del av ett bedrägeriförsök."], { meters: { media: -1 } }),
              io(["A figure slips out", "En siffra slinker ut"], ["In the questions afterwards the CEO is asked how much was lost and gives a figure legal had not approved. The investigator calls within the hour, unhappy about details of the case going public.", "I frågestunden efteråt får vd frågan hur mycket som förlorades och nämner en siffra som juristerna inte hade godkänt. Utredaren ringer inom en timme, missnöjd med att detaljer i ärendet blivit offentliga."], ["The CEO named the loss publicly before legal had approved it.", "Vd nämnde förlusten offentligt innan juristerna hade godkänt det."], { reopen: true, meters: { media: 1 } }),
              io(["Experts disagree", "Experterna är oense"], ["One audio analyst quoted in the press says the clip shows clear signs of synthesis. Another says it is impossible to tell either way. Both are being shared.", "En ljudanalytiker som citeras i pressen säger att klippet visar tydliga tecken på syntes. En annan säger att det inte går att avgöra åt något håll. Båda delas flitigt."], ["Outside experts disagree on whether the clip can be proven fake.", "Externa experter är oense om huruvida klippet kan bevisas vara falskt."])
            ]),
            ir("i2", { notChosen: "A" }, ["Without the whole story", "Utan hela historien"], [
              io(["The fraud gets out", "Bedrägeriet kommer ut"], ["A business site reports, citing a source, that {{org.name}} was defrauded this week, and notes that your response said nothing about it. Readers start connecting the two.", "En affärssajt rapporterar, med hänvisning till en källa, att {{org.name}} blev bedraget i veckan, och noterar att ert svar inte nämnde något om det. Läsarna börjar koppla ihop de två."], ["The fraud has been reported by the press without your account of it.", "Bedrägeriet har rapporterats i pressen utan er version av det."], { reopen: true, meters: { media: 1 } }),
              io(["A label on the clip", "En märkning på klippet"], ["One major platform labels the clip as disputed and stops recommending it. Plays slow down there. The team takes it as a sign the approach is working.", "En stor plattform märker klippet som ifrågasatt och slutar rekommendera det. Uppspelningarna där går ned i takt. Teamet ser det som ett tecken på att linjen fungerar."], ["One major platform has labelled the clip as disputed.", "En stor plattform har märkt klippet som ifrågasatt."]),
              io(["Customers ask quietly", "Kunder frågar i det tysta"], ["Two large customers call their account managers, not the press. They ask whether the recording is genuine, and whether there is anything else they should know before their own board meets.", "Två stora kunder ringer sina kundansvariga, inte pressen. De frågar om inspelningen är äkta, och om det finns något mer de borde veta innan deras egen styrelse möts."], ["Two large customers have asked privately whether there is more to the story.", "Två stora kunder har i förtroende frågat om det finns mer bakom historien."])
            ])
          ]
        }),
        facilitator: fac(
          ["The crisis is now reputational. Let comms lead.", "Krisen är nu en fråga om rykte. Låt kommunikation leda."],
          ["A full, personal and contextual response that names the fraud.", "Ett fullständigt, personligt svar med sammanhang som nämner bedrägeriet."],
          [["Ask: what proof would a sceptical journalist accept?", "Fråga: vilka bevis skulle en skeptisk journalist godta?"]]
        )
      },
      {
        id: "p5",
        priority: 2,
        clock: 1800,
        title: L(["Not the only call", "Inte det enda samtalet"]),
        twist: L(["{{num.calledExecs}} other executives and assistants received similar calls this week; some went unreported.", "{{num.calledExecs}} andra chefer och assistenter fick liknande samtal i veckan; en del rapporterades aldrig."]),
        twistKind: "scope",
        reconsider: { decision: "d3", pressure: { en: "{{num.calledExecs}} more people received calls, and some never reported them. Was your change to resets wide enough?", sv: "Ytterligare {{num.calledExecs}} personer har fått samtal, och några rapporterade dem aldrig. Var er ändring av återställningar tillräckligt bred?" } },
        assumptionChallenged: L(["One employee was targeted.", "En anställd var måltavla."]),
        reveals: ["hf-others"],
        narrative: L([
          "After the public statement about the fake audio and the fraud, something changes inside the company.\n\nPeople start coming forward, one by one, a little embarrassed. They received calls this week too, from a voice they recognised, asking for things that seemed ordinary at the time.",
          "Efter det offentliga uttalandet om det falska ljudet och bedrägeriet förändras något inne i företaget.\n\nFolk börjar träda fram, en och en, lite generade. De fick också samtal den här veckan, från en röst de kände igen, med frågor om saker som verkade vanliga just då."
        ]),
        injects: [
          inj("i5-1", 1800, "employeeReport", "employee", "high", "confirmed", [
            "An executive assistant: “I had a call from the ‘CEO’ on Monday asking for the board's contact list. I sent it. I thought it was normal.”",
            "En chefsassistent: ”Jag fick ett samtal från ’vd’ i måndags som bad om styrelsens kontaktlista. Jag skickade den. Jag trodde att det var normalt.”"
          ], { reveals: ["hf-others"], tests: ["lo4"] })
        ],
        charts: [{
          id: "c5-kpi", type: "kpi",
          title: L(["The campaign so far", "Kampanjen hittills"]),
          data: kpi([
            { id: "amount", label: ["Payment requested", "Begärd betalning"], value: (v) => v.amount, format: "currency", tone: "danger" },
            { id: "execs", label: ["Other people called", "Andra som har ringts upp"], value: (v) => v.calledExecs, tone: "warn" },
            { id: "views", label: ["Plays of the fake clip", "Uppspelningar av det falska klippet"], value: (v) => v.views, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("How do you find calls that were never reported?", "Hur hittar ni samtal som aldrig rapporterades?", ["securityOfficer"]),
            q("What did the board contact list let them do next?", "Vad gjorde styrelsens kontaktlista det möjligt för dem att göra härnäst?", ["securityOfficer", "socLead"]),
            q("Did your service-desk change cover these people?", "Omfattade er ändring av servicedesken de här personerna?", ["itOps"], "d3")
          ],
          executive: [
            q("Why didn't people report odd calls?", "Varför rapporterade folk inte konstiga samtal?", ["hr", "ceo"]),
            q("Do you warn the board members directly?", "Varnar ni styrelseledamöterna direkt?", ["ceo", "legal"]),
            q("Did your public statement help people come forward?", "Hjälpte ert offentliga uttalande folk att höra av sig?", ["comms"], "d4")
          ]
        },
        challenges: [ch("People feel foolish and stay quiet.", "Folk känner sig dumma och är tysta.")],
        decision: dec("d5", "ceo", ["How do you encourage reporting?", "Hur uppmuntrar ni rapportering?"], [
          ["Publicly thank those who reported, promise no blame and set up a simple reporting route.", "Tacka offentligt dem som rapporterade, lova att ingen skuldbeläggs och inför en enkel väg för rapportering."],
          ["Require all staff to report suspicious calls.", "Kräv att all personal rapporterar misstänkta samtal."],
          ["Run mandatory training.", "Genomför obligatorisk utbildning."]
        ], {
          knowns: [["Several people were called.", "Flera personer har ringts upp."]],
          uncertainties: [["How many stayed silent.", "Hur många som har varit tysta."]],
          tradeoffs: {
            operational: ["A reporting route needs someone to answer it.", "En väg för rapportering behöver någon som svarar."],
            security: ["Early reports would have stopped the fraud.", "Tidiga rapporter skulle ha stoppat bedrägeriet."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["Blame drives silence.", "Skuldbeläggning leder till tystnad."]
          },
          evaluation: [["Makes reporting safe", "Gör det tryggt att rapportera"]],
          pushback: {
            A: [
              pb(["The route is flooded", "Rapportvägen svämmar över"], ["Within a day, the new route has dozens of reports: every unexpected call, every odd voicemail. Two people triage it part-time. Who answers, and what happens to the one report that matters if it is buried in the pile?", "Inom ett dygn har den nya vägen dussintals rapporter: varje oväntat samtal, varje konstigt röstmeddelande. Två personer sorterar dem på deltid. Vem svarar, och vad händer med den enda rapport som spelar roll om den drunknar i högen?"]),
              pb(["Thanking the one who sent it", "Att tacka den som skickade"], ["A board member reads your public thanks and writes: “You are thanking someone who sent our contact details to criminals?” Does your no-blame promise cover the assistant, and how do you explain that to the board?", "En styrelseledamot läser ert offentliga tack och skriver: ”Ni tackar någon som skickade våra kontaktuppgifter till brottslingar?” Omfattar ert löfte om ingen skuldbeläggning assistenten, och hur förklarar ni det för styrelsen?"]),
              pb(["The attacker reads it too", "Angriparen läser också"], ["A public thank-you tells the attackers which of their calls have been reported, and by implication which have not. Do you keep the thanks internal, and does that take away what made it work?", "Ett offentligt tack talar om för angriparna vilka av deras samtal som har rapporterats, och därmed vilka som inte har det. Håller ni tacket internt, och tar det i så fall bort det som fick det att fungera?"])
            ],
            B: [
              pb(["Late reporters", "De som rapporterar sent"], ["The first report under the new rule comes from someone who admits they sent information on a call a week ago and said nothing. Under a duty to report, they broke the rule. Do they face consequences, knowing everyone is watching your answer?", "Den första rapporten enligt den nya regeln kommer från någon som erkänner att hen lämnade ut uppgifter i ett samtal för en vecka sedan och teg. Med en plikt att rapportera har hen brutit mot regeln. Får det konsekvenser, när alla ser hur ni svarar?"]),
              pb(["Report to whom?", "Rapportera till vem?"], ["The requirement names no channel. Reports arrive by email, chat, to managers and to the service desk, and nobody collects them. Half are already lost. Who owns gathering them, and from when?", "Kravet anger ingen kanal. Rapporter kommer via e-post, chatt, till chefer och till servicedesken, och ingen samlar ihop dem. Hälften har redan försvunnit. Vem äger insamlingen, och från när?"]),
              pb(["It sounds like a trap", "Det låter som en fälla"], ["HR hears from staff that a duty to report, after a week where people stayed quiet out of embarrassment, reads like a disciplinary trap. Some say they will now report nothing at all. Will your rule make people speak, or hide?", "HR hör från personalen att en plikt att rapportera, efter en vecka där folk tigit av skam, uppfattas som en disciplinär fälla. Några säger att de nu inte tänker rapportera något alls. Får er regel folk att tala, eller att gömma sig?"])
            ],
            C: [
              pb(["Training takes a month", "Utbildningen tar en månad"], ["Scheduling everyone takes until next month. The calls happened this week, and people may still be sitting on them. What happens to the reports that exist today, before anyone has been trained?", "Att schemalägga alla tar till nästa månad. Samtalen skedde den här veckan, och folk kan fortfarande sitta på dem. Vad händer med de rapporter som finns i dag, innan någon har utbildats?"]),
              pb(["“Is this my punishment?”", "”Är det här mitt straff?”"], ["The people who came forward are booked onto the same course as everyone else, first. One asks HR whether this is the consequence for reporting. How do you make sure training does not feel like the price of speaking up?", "De som trädde fram bokas först på samma kurs som alla andra. En frågar HR om det här är konsekvensen av att ha rapporterat. Hur ser ni till att utbildningen inte känns som priset för att säga ifrån?"]),
              pb(["No course spots a clone", "Ingen kurs avslöjar en klon"], ["The trainer admits that no course teaches people to spot a perfect voice clone. The assistant who sent the contact list did nothing training would have caught. What is the training for, then, and what would actually have helped?", "Utbildaren medger att ingen kurs lär folk att känna igen en perfekt röstklon. Assistenten som skickade kontaktlistan gjorde inget som en utbildning skulle ha fångat upp. Vad är utbildningen till för då, och vad hade faktiskt hjälpt?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Thanks and no blame", "Tack och ingen skuld"], [
              io(["Reports come in", "Rapporterna kommer"], ["Within hours several more people report calls, including one who refused a request and is relieved to be able to say so. The new route works as intended.", "Inom några timmar rapporterar flera personer till samtal, bland dem en som vägrade en begäran och är lättad över att kunna säga det. Den nya vägen fungerar som tänkt."], ["Reports came in quickly once the no-blame promise was made.", "Rapporterna kom snabbt efter löftet om ingen skuldbeläggning."]),
              io(["Nobody reads them", "Ingen läser dem"], ["The route turns out to be a shared mailbox that nobody watches overnight. A report about a call asking for bank details sits unread for twelve hours.", "Vägen visar sig vara en gemensam brevlåda som ingen bevakar under natten. En rapport om ett samtal som bad om bankuppgifter ligger oläst i tolv timmar."], ["One report sat unread overnight in the new route.", "En rapport låg oläst över natten i den nya vägen."], { reopen: true }),
              io(["A colleague is named", "En kollega pekas ut"], ["One report is not about the reporter's own call: it names a colleague who took a strange call last week and said nothing. Is that the culture you meant?", "En rapport handlar inte om rapportörens eget samtal: den pekar ut en kollega som fick ett märkligt samtal förra veckan och teg. Är det den kultur ni menade?"], ["One report named a colleague rather than the reporter's own call.", "En rapport pekade ut en kollega i stället för rapportörens eget samtal."])
            ]),
            ir("i2", { notChosen: "A" }, ["No promise of safety", "Inget löfte om trygghet"], [
              io(["People wait and see", "Folk avvaktar"], ["The assistant who sent the contact list asks HR whether they will be disciplined. Word gets round, and two people who meant to report decide to wait and see what happens to them first.", "Assistenten som skickade kontaktlistan frågar HR om hen kommer att få en påföljd. Det sprider sig, och två personer som tänkte rapportera bestämmer sig för att först se vad som händer med hen."], ["Some people are waiting to see what happens before they report.", "Några avvaktar och vill se vad som händer innan de rapporterar."], { reopen: true }),
              io(["A handful arrive", "En handfull kommer in"], ["A handful of reports arrive the same day. Management reads it as proof that people respond to clear expectations.", "En handfull rapporter kommer in samma dag. Ledningen ser det som bevis på att folk svarar på tydliga förväntningar."], ["A handful of reports arrived after the instruction went out.", "En handfull rapporter kom in efter att instruktionen gick ut."]),
              io(["Real calls reported", "Äkta samtal rapporteras"], ["Staff now report every unexpected call, including genuine ones from the CEO and the CFO. Two executives complain that their own people will not take their calls.", "Personalen rapporterar nu varje oväntat samtal, även äkta samtal från vd och ekonomichefen. Två chefer klagar på att deras egna medarbetare inte vill ta deras samtal."], ["Genuine calls from executives are being reported as suspicious.", "Äkta samtal från chefer rapporteras som misstänkta."])
            ])
          ]
        }),
        facilitator: fac(
          ["Reporting culture is the real control.", "Rapporteringskulturen är den verkliga kontrollen."],
          ["Thanks, no-blame and an easy way to report.", "Tack, ingen skuldbeläggning och ett enkelt sätt att rapportera."],
          [["Ask: what happens today when someone reports a mistake?", "Fråga: vad händer i dag när någon rapporterar ett misstag?"]]
        )
      },
      {
        id: "p6",
        priority: 3,
        clock: 4320,
        title: L(["Verification, not blame", "Kontroll, inte skuld"]),
        twist: L(["A board member asks for the finance manager to be dismissed. HR and the CFO disagree on who decides.", "En styrelseledamot vill att den ekonomiansvariga ska sägas upp. HR och ekonomichefen är oense om vem som beslutar."]),
        twistKind: "authority",
        reconsider: { decision: "d1", pressure: { en: "A board member wants the finance manager dismissed. The board will judge your first decision about the payments as well.", sv: "En styrelseledamot vill att ekonomichefen avskedas. Styrelsen kommer också att bedöma ert första beslut om betalningarna." } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because you told the whole story, the fraud attempt now leads every article, and two major investors have called the CEO.", sv: "Eftersom ni berättade hela historien toppar bedrägeriförsöket nu varje artikel, och två stora investerare har ringt vd." } }
        ],
        assumptionChallenged: L(["The employee who paid is the problem.", "Den anställda som betalade är problemet."]),
        narrative: L([
          "Three days later. The bank has partly recovered the first payment; the rest has moved on through other accounts.\n\nThe board meets to review the incident. The finance manager, who raised the alarm and came forward on the first morning, is waiting outside to find out what happens to them.",
          "Tre dagar senare. Banken har delvis fått tillbaka den första betalningen; resten har gått vidare genom andra konton.\n\nStyrelsen möts för att gå igenom incidenten. Den ekonomiansvariga, som slog larm och trädde fram den första morgonen, väntar utanför för att få veta vad som händer med hen."
        ]),
        injects: [
          inj("i6-1", 4320, "executiveMessage", "management", "high", "confirmed", [
            "A board member writes: “Someone sent money to a criminal on a video call. There must be consequences.”",
            "En styrelseledamot skriver: ”Någon skickade pengar till en brottsling via ett videosamtal. Det måste få konsekvenser.”"
          ], { tests: ["lo4"] }),
          inj("i6-2", 4350, "email", "bank", "medium", "confirmed", [
            "{{supplier.bank}}: the receiving bank has frozen and returned part of the first payment. The rest has moved on.",
            "{{supplier.bank}}: den mottagande banken har fryst och återbetalat en del av den första betalningen. Resten har flyttats vidare."
          ], { optional: true, tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Which payment controls would have stopped this regardless of the call?", "Vilka betalningskontroller skulle ha stoppat det här oavsett samtalet?", ["itOps", "ciso"]),
            q("How do you make verification easy to do?", "Hur gör ni kontroller enkla att genomföra?", ["ciso"]),
            q("Is the new reset process holding up?", "Håller den nya rutinen för återställning?", ["itOps"], "d3")
          ],
          executive: [
            q("Who decides on consequences for the employee?", "Vem beslutar om konsekvenser för den anställda?", ["hr", "ceo"]),
            q("What would dismissing them teach everyone else?", "Vad skulle en uppsägning lära alla andra?", ["hr", "ceo"]),
            q("Does your reporting promise survive this pressure?", "Överlever ert löfte om rapportering det här trycket?", ["ceo"], "d5")
          ]
        },
        challenges: [ch("The employee reported it themselves, within an hour.", "Den anställda rapporterade det själv, inom en timme.")],
        decision: dec("d6", "ceo", ["What do you do?", "Vad gör ni?"], [
          ["No sanction; fix the process with dual approval and callback, and credit the self-report.", "Ingen påföljd; rätta processen med dubbelt godkännande och återuppringning, och ge erkännande för självrapporteringen."],
          ["A written warning and new controls.", "En skriftlig varning och nya kontroller."],
          ["Follow the board member's request.", "Följ styrelseledamotens begäran."]
        ], {
          knowns: [["The process allowed a single person to pay.", "Processen tillät en enda person att betala."]],
          uncertainties: [["How the board will react.", "Hur styrelsen kommer att reagera."]],
          tradeoffs: {
            operational: ["Dual approval slows urgent payments.", "Dubbelt godkännande gör brådskande betalningar långsammare."],
            security: ["Punishment discourages the next report.", "Bestraffning avskräcker från nästa rapport."],
            legal: ["Employment law limits sanctions for following instructions.", "Arbetsrätten begränsar påföljder för att ha följt instruktioner."],
            reputational: ["Staff will watch how this is handled.", "Personalen kommer att se hur det här hanteras."]
          },
          evaluation: [["Treats it as a process failure", "Behandlar det som ett processfel"]],
          pushback: {
            A: [
              pb(["The board member escalates", "Styrelseledamoten trappar upp"], ["The board member says they will take it to the full board and question the CEO's judgement, since it was the CEO's own face that was used. No sanction now looks like the CEO protecting themselves. Do you hold the line?", "Styrelseledamoten säger att frågan ska tas upp i hela styrelsen och att vd:s omdöme ska ifrågasättas, eftersom det var vd:s eget ansikte som användes. Ingen påföljd ser nu ut som att vd skyddar sig själv. Står ni fast?"]),
              pb(["Dual approval bites", "Dubbelt godkännande biter"], ["Next week a genuine, urgent supplier payment waits half a day for a second approver and a callback that nobody answers. The supplier threatens a penalty. Do you allow an exception, and who may grant it?", "Nästa vecka väntar en äkta, brådskande leverantörsbetalning en halv dag på en andra godkännare och en återuppringning som ingen svarar på. Leverantören hotar med vite. Tillåter ni ett undantag, och vem får bevilja det?"]),
              pb(["“Why is that praised?”", "”Varför får det beröm?”"], ["Some staff ask privately why someone whose payment the bank only partly recovered is being credited, while they would be disciplined for far less. What is your message to them, and who delivers it?", "Några medarbetare frågar i förtroende varför någon vars betalning banken bara delvis fick tillbaka får erkännande, när de själva skulle få en påföljd för mycket mindre. Vad är ert budskap till dem, och vem framför det?"])
            ],
            B: [
              pb(["A warning for what?", "En varning för vad?"], ["HR asks which rule was broken: the process let one person pay, and they followed what looked like the CEO's instruction. Without a broken rule, the warning will not hold. Do you write it anyway?", "HR frågar vilken regel som bröts: processen lät en person betala, och hen följde det som såg ut som vd:s instruktion. Utan en bruten regel håller inte varningen. Skriver ni den ändå?"]),
              pb(["The report that never comes", "Rapporten som aldrig kommer"], ["Word of the warning spreads. Someone who took an odd call this week decides not to come forward after all. You will never hear of it. How would you even know what this warning has cost you?", "Ryktet om varningen sprids. Någon som fick ett märkligt samtal den här veckan bestämmer sig för att inte höra av sig ändå. Ni kommer aldrig att få veta det. Hur skulle ni ens kunna veta vad den här varningen har kostat er?"]),
              pb(["Nobody is satisfied", "Ingen är nöjd"], ["The board member says a warning is not consequences. The finance manager's union representative says it is punishment for reporting. You chose the middle and pleased neither. Who were you trying to satisfy?", "Styrelseledamoten säger att en varning inte är några konsekvenser. Den ekonomiansvarigas fackliga företrädare säger att det är ett straff för att ha rapporterat. Ni valde mitten och gjorde ingen nöjd. Vem försökte ni tillfredsställa?"])
            ],
            C: [
              pb(["It will not hold", "Det kommer inte att hålla"], ["HR and legal say a dismissal for following an instruction from what appeared to be the CEO is unlikely to stand, and a dispute would be public. Do you go ahead and risk the whole story being retold in a courtroom?", "HR och juristerna säger att en uppsägning för att ha följt en instruktion från det som såg ut att vara vd sannolikt inte håller, och en tvist skulle bli offentlig. Går ni vidare och riskerar att hela historien återberättas i en rättssal?"]),
              pb(["The CFO objects", "Ekonomichefen protesterar"], ["The CFO says they approved the process that let one person send a payment this size. If the finance manager goes for using it, the CFO should answer too. Do you apply the same standard upward?", "Ekonomichefen säger att hen godkände den process som lät en person skicka en betalning av den här storleken. Om den ekonomiansvariga får gå för att ha använt den borde ekonomichefen också stå till svars. Tillämpar ni samma måttstock uppåt?"]),
              pb(["The others go quiet", "De andra tystnar"], ["The people who came forward about their own calls ask HR whether they are next. Two withdraw what they reported. What has this decision just taught everyone about reporting, and can you undo it?", "De som trädde fram om sina egna samtal frågar HR om de står på tur. Två drar tillbaka det de rapporterade. Vad har det här beslutet just lärt alla om att rapportera, och kan ni göra det ogjort?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["No sanction", "Ingen påföljd"], [
              io(["An early report", "En tidig rapport"], ["The finance manager is back at their desk, and colleagues stop by. The next morning someone in accounts payable flags an odd invoice within minutes, citing what happened to the manager.", "Den ekonomiansvariga är tillbaka vid sitt skrivbord, och kollegor tittar förbi. Nästa morgon flaggar någon på leverantörsreskontran en märklig faktura inom några minuter, med hänvisning till det som hände den ekonomiansvariga."], ["An odd invoice was reported within minutes the day after the decision.", "En märklig faktura rapporterades inom några minuter dagen efter beslutet."]),
              io(["To the chair", "Till ordföranden"], ["The board member takes it to the chair, arguing the CEO cannot decide on a case in which their own face was used. The chair asks for the decision to be taken again with the full board.", "Styrelseledamoten tar frågan till ordföranden och hävdar att vd inte kan besluta i ett ärende där hens eget ansikte användes. Ordföranden vill att beslutet fattas på nytt med hela styrelsen."], ["The board chair has asked for the decision to be reviewed.", "Styrelseordföranden har begärt att beslutet ses över."], { reopen: true }),
              io(["Half a day's wait", "En halv dags väntan"], ["The first large payment under dual approval waits half a day for a callback. The supplier is irritated; finance is unsure whether that is the control working or failing.", "Den första stora betalningen med dubbelt godkännande väntar en halv dag på en återuppringning. Leverantören är irriterad; ekonomi är osäker på om det är kontrollen som fungerar eller som brister."], ["The first payment under dual approval was delayed by half a day.", "Den första betalningen med dubbelt godkännande försenades en halv dag."])
            ]),
            ir("i2", { notChosen: "A" }, ["A sanction is chosen", "En påföljd väljs"], [
              io(["The union writes", "Facket skriver"], ["The finance manager's union representative asks in writing which rule was broken, and signals that a dispute will follow if the answer does not hold.", "Den ekonomiansvarigas fackliga företrädare frågar skriftligen vilken regel som bröts, och signalerar att en tvist följer om svaret inte håller."], ["The union has asked in writing for the grounds.", "Facket har skriftligen begärt skälen."], { reopen: true }),
              io(["The board is satisfied", "Styrelsen är nöjd"], ["The board member thanks the CEO for taking it seriously, and the board moves on to the next item. Inside the room, it feels settled.", "Styrelseledamoten tackar vd för att frågan togs på allvar, och styrelsen går vidare till nästa punkt. I rummet känns det avgjort."], ["The board member who demanded consequences is satisfied.", "Styrelseledamoten som krävde konsekvenser är nöjd."]),
              io(["The route goes quiet", "Rapportvägen tystnar"], ["For two days nothing comes in through the reporting route. It could mean the attackers have stopped, or that people have.", "I två dagar kommer ingenting in via rapporteringsvägen. Det kan betyda att angriparna har slutat, eller att personalen har det."], ["No new reports have come in since the decision.", "Inga nya rapporter har kommit in sedan beslutet."])
            ])
          ]
        }),
        facilitator: fac(
          ["Close on culture. This is the lesson people remember.", "Avsluta med kultur. Det är den här lärdomen folk minns."],
          ["No sanction, stronger process and recognition for reporting.", "Ingen påföljd, starkare process och erkännande för rapporteringen."],
          [["Ask: if you were the employee, would you have reported it?", "Fråga: om ni var den anställda, skulle ni ha rapporterat?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Part of the money is recovered, the fake is publicly explained, identity resets are tightened and the company adopts a no-blame verification culture.",
        "En del av pengarna återfås, förfalskningen förklaras offentligt, identitetsåterställningar skärps och företaget inför en kontrollkultur utan skuldbeläggning."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Seeing and hearing is no longer proof of identity.", "Att se och höra någon är inte längre ett bevis på identitet."]),
        L(["Payment controls must not depend on a single trusted voice.", "Betalningskontroller får inte vara beroende av en enda betrodd röst."]),
        L(["Service-desk identity checks are an attack surface.", "Servicedeskens identitetskontroller är en angreppsyta."]),
        L(["Reporting culture is the strongest control.", "Rapporteringskulturen är den starkaste kontrollen."])
      ],
      assumptionsVsReality: [
        avr(["The video call was the CEO.", "Videosamtalet var vd."], ["It was synthetic.", "Det var syntetiskt."], "p2"),
        avr(["Only money was at stake.", "Det var bara pengar som stod på spel."], ["The CEO's account was taken over too.", "Vd:ns konto togs också över."], "p3"),
        avr(["One person was targeted.", "En person var måltavla."], ["Several people were called.", "Flera personer ringdes upp."], "p5")
      ],
      strengthsToLookFor: [
        L(["Stopping the payment before certainty", "Att stoppa betalningen innan det fanns visshet"]),
        L(["Verifying through a known channel", "Att kontrollera via en känd kanal"]),
        L(["Protecting the employee who reported", "Att skydda den anställda som rapporterade"])
      ],
      commonGaps: [
        L(["Trusting a familiar face or number", "Att lita på ett välbekant ansikte eller nummer"]),
        L(["A bare denial of the fake", "Ett naket förnekande av förfalskningen"]),
        L(["Blaming the victim", "Att skuldbelägga den drabbade"])
      ],
      suggestedActions: [
        act(["Require dual approval and an independent callback for unusual payments.", "Kräv dubbelt godkännande och oberoende återuppringning för ovanliga betalningar."], "cfo", "high"),
        act(["Stop identity resets by phone; verify in person or with callback.", "Stoppa identitetsåterställningar via telefon; kontrollera på plats eller med återuppringning."], "ciso", "high"),
        act(["Agree code words or a verification routine for executives.", "Inför kodord eller en kontrollrutin för chefer."], "securityOfficer", "medium"),
        act(["Prepare a response template for synthetic media.", "Ta fram en svarsmall för syntetiska medier."], "comms", "medium"),
        act(["Make reporting easy and blame-free.", "Gör rapportering enkel och fri från skuldbeläggning."], "hr", "medium")
      ]
    }
  });
})();
