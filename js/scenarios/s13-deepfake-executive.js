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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Stop and recover a fraudulent payment quickly", "Stoppa och återkräva en bedräglig betalning snabbt"]) },
      { id: "lo2", text: L(["Recognise synthetic media as an attack on identity processes", "Se syntetiska medier som ett angrepp på identitetsprocesser"]) },
      { id: "lo3", text: L(["Communicate when your own leader's voice can be faked", "Kommunicera när er egen ledares röst kan förfalskas"]) },
      { id: "lo4", text: L(["Build a verification culture without blaming the victim", "Bygga en kontrollkultur utan att skuldbelägga den drabbade"]) }
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
          inj("i1-3", 20, "chat", "person.ceo", "medium", "misleading", [
            "A text from the CEO's number: “Please keep this between us. Complete the second payment.”",
            "Ett sms från vd:ns nummer: ”Håll det här mellan oss. Genomför den andra betalningen.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Spoofed sender. Watch whether the group treats a familiar number as proof.", "Förfalskad avsändare. Se om gruppen behandlar ett välbekant nummer som bevis."], tests: ["lo2"] })
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
          ["Complete it; the CEO was on camera.", "Genomför den; vd syntes i bild."]
        ], {
          knowns: [["One payment has gone abroad.", "En betalning har gått utomlands."], ["Secrecy was demanded.", "Hemlighållande krävdes."]],
          uncertainties: [["Whether the call was real.", "Om samtalet var äkta."]],
          tradeoffs: {
            operational: ["A real deal could be delayed.", "En verklig affär kan försenas."],
            security: ["Secrecy and urgency are classic fraud markers.", "Hemlighållande och brådska är klassiska kännetecken för bedrägeri."],
            legal: ["Recall chances fall by the hour.", "Möjligheten att återkalla minskar för varje timme."],
            reputational: ["Losing the money is worse than an awkward call to the CEO.", "Att förlora pengarna är värre än ett obekvämt samtal till vd."]
          },
          evaluation: [["Acts on the payment before certainty", "Agerar på betalningen innan det finns visshet"], ["Verifies through an independent channel", "Kontrollerar via en oberoende kanal"]]
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
          evaluation: [["Warns likely targets quickly", "Varnar troliga måltavlor snabbt"]]
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
          evaluation: [["Fixes the process, not just the account", "Rättar processen, inte bara kontot"]]
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
          ["Deny the clip briefly and say nothing about the fraud.", "Förneka klippet kort och säg ingenting om bedrägeriet."],
          ["Say nothing until the platforms remove it.", "Säg ingenting tills plattformarna har tagit bort det."]
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
          minutes: 10
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
          evaluation: [["Makes reporting safe", "Gör det tryggt att rapportera"]]
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
          evaluation: [["Treats it as a process failure", "Behandlar det som ett processfel"]]
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
