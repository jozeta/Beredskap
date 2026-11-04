/*
 * s40-benefits-outage.js — "Payday" (archetype F, government agency).
 *
 * The day before payday, the bank rejects the benefit payment file: thousands of
 * recipients' account numbers have changed → the changes were made through two
 * caseworkers' accounts, bribed by a criminal network, and the police want everything
 * left untouched → the minister promises on the evening news that everyone will be paid
 * on time → the same pattern runs through two other benefits and months back → payday:
 * people without money, and phishing texts in the agency's name → weeks later: an
 * internal audit had recommended the control that would have stopped it.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s40-benefits-outage",
    version: 1,
    category: "benefits-outage",
    archetype: "human-legal-reputational",
    emblem: "benefits-outage",
    title: L(["Payday", "Utbetalningsdagen"]),
    summary: L([
      "Tomorrow, {{num.recipients|number}} people expect their benefits. Today, the bank has rejected the payment file, the police want the system left exactly as it is, and the minister has just promised on television that everyone will be paid on time.",
      "I morgon väntar {{num.recipients|number}} personer på sina ersättningar. I dag har banken avvisat utbetalningsfilen, polisen vill att systemet lämnas precis som det är, och ministern har just lovat i tv att alla får sina pengar i tid."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Decide under a hard deadline when paying and stopping fraud pull in opposite directions", "Besluta under en hård tidsgräns när utbetalning och stopp av bedrägeri drar åt olika håll"]), teaser: L(["The file the bank rejected", "Filen som banken avvisade"]) },
      { id: "lo2", text: L(["Balance a police investigation against your duty to protect people", "Väga en polisutredning mot er skyldighet att skydda människor"]), teaser: L(["Leave it as it is", "Låt det vara som det är"]) },
      { id: "lo3", text: L(["Tell political leadership what is true, not what it wants to hear", "Berätta för den politiska ledningen vad som är sant, inte vad den vill höra"]), teaser: L(["The promise on television", "Löftet i tv"]) },
      { id: "lo4", text: L(["Look after the people who did not get paid", "Ta hand om dem som inte fick sina pengar"]), teaser: L(["Rent is due", "Hyran ska betalas"]) }
    ],
    mitre: ["T1078", "T1565", "T1098", "T1566"],
    frameworks: {
      nistCsf: ["GV.RR", "PR.AA", "DE.AE", "RS.MA", "RS.CO", "RC.CO"],
      iso27001: ["A.5.4", "A.5.15", "A.5.18", "A.5.24", "A.5.26", "A.5.28", "A.6.4", "A.8.2"]
    },
    minStages: 4,
    maxStages: 6,
    constraints: { startWindow: "business-hours", startTime: "14:30", sectors: ["government"] },
    actor: { types: ["insider", "criminal"], motivation: L(["Financial: a criminal network diverting benefits through bribed insiders", "Ekonomisk: ett kriminellt nätverk som leder om ersättningar via mutade insiders"]), capability: "medium" },
    variables: {
      recipients: { min: 40000, max: 900000, scaleBy: "size", step: 1000 },
      changed: { min: 900, max: 9000, scaleBy: "size", step: 10 },
      payout: { min: 300000000, max: 6000000000, scaleBy: "size", step: 10000000, currency: true },
      diverted: { min: 4000000, max: 60000000, scaleBy: "size", step: 100000, currency: true },
      calls: { min: 8000, max: 120000, scaleBy: "size", step: 1000 }
    },
    roles: ["incidentCommander", "ceo", "cio", "ciso", "serviceOwner", "comms", "legal", "dpo", "hr", "securityOfficer"],

    groundTruth: {
      rootCause: L([
        "A criminal network recruited two caseworkers at {{org.name}}, one through a bribe and one through threats against her family. Over three weeks they changed the bank account numbers of {{num.changed|number}} recipients through the case management system, which lets any caseworker change an account number without a second approval. The network chose recipients who rarely log in. A smaller test run had been going on for four months in two other benefits. The volume this month was large enough for the bank's own checks to reject the payment file.",
        "Ett kriminellt nätverk rekryterade två handläggare på {{org.name}}, den ena med en muta och den andra med hot mot hennes familj. Under tre veckor ändrade de kontonumren för {{num.changed|number}} mottagare i ärendehanteringssystemet, som låter vilken handläggare som helst ändra ett kontonummer utan ett andra godkännande. Nätverket valde mottagare som sällan loggar in. En mindre provomgång hade pågått i fyra månader i två andra ersättningar. Mängden den här månaden var så stor att bankens egna kontroller avvisade utbetalningsfilen."
      ]),
      attackerTimeline: [
        { at: -175000, text: L(["First test changes in two smaller benefits.", "De första provändringarna i två mindre ersättningar."]) },
        { at: -30240, text: L(["The two caseworkers begin changing account numbers at scale.", "De två handläggarna börjar ändra kontonummer i stor skala."]) },
        { at: -60, text: L(["The bank rejects the payment file.", "Banken avvisar utbetalningsfilen."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-insiders", revealStage: "p2", text: L(["The changes were made through two caseworkers' own accounts; both were recruited by a criminal network.", "Ändringarna gjordes via två handläggares egna konton; båda hade rekryterats av ett kriminellt nätverk."]) },
      { id: "hf-spread", revealStage: "p4", text: L(["The same pattern has been running for months in two other benefits.", "Samma mönster har pågått i flera månader i två andra ersättningar."]) },
      { id: "hf-audit", revealStage: "p6", text: L(["An internal audit had recommended a second approval for account changes two years ago.", "En internrevision hade rekommenderat ett andra godkännande för kontoändringar för två år sedan."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["The day before payday", "Dagen före utbetalning"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. Tomorrow, {{num.recipients|number}} people expect their monthly benefits, {{num.payout|currency}} in total. An hour ago, the bank rejected the payment file: its fraud checks flagged that {{num.changed|number}} recipients have new account numbers this month, many at the same two banks, opened in the last few weeks.\n\nThe bank needs a corrected file by {{time.T+210|clock}} for money to arrive tomorrow. {{person.securityOfficer.name}} says the pattern does not look like an error.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. I morgon väntar {{num.recipients|number}} personer på sina månatliga ersättningar, sammanlagt {{num.payout|currency}}. För en timme sedan avvisade banken utbetalningsfilen: dess bedrägerikontroller flaggade att {{num.changed|number}} mottagare har nya kontonummer den här månaden, många i samma två banker, öppnade de senaste veckorna.\n\nBanken behöver en rättad fil senast klockan {{time.T+210|clock}} för att pengarna ska komma fram i morgon. {{person.securityOfficer.name}} säger att mönstret inte ser ut som ett fel."
        ]),
        injects: [
          inj("i1-1", 0, "email", "bank", "critical", "confirmed", [
            "Payment file rejected. Reason: {{num.changed|number}} beneficiary accounts changed within 30 days, concentrated at two institutions, accounts recently opened. Please confirm or correct by {{time.T+210|clock}} for value date tomorrow.",
            "Utbetalningsfilen avvisad. Orsak: {{num.changed|number}} mottagarkonton ändrade inom 30 dagar, koncentrerade till två institut, nyligen öppnade konton. Bekräfta eller rätta senast klockan {{time.T+210|clock}} för betalning i morgon."
          ], { headline: ["From the bank", "Från banken"], tests: ["lo1"] }),
          inj("i1-2", 15, "chat", "person.serviceOwner", "high", "disputed", [
            "“Most of these will be real. People change banks all the time. If we hold them, thousands of honest people go without money tomorrow.”",
            "”De flesta av de här är säkert äkta. Folk byter bank hela tiden. Om vi håller inne dem står tusentals ärliga personer utan pengar i morgon.”"
          ], { facilitatorNote: ["Partly true: some changes are genuine. Most are not, and nobody can tell which in three hours.", "Delvis sant: en del ändringar är äkta. De flesta är det inte, och ingen kan avgöra vilka på tre timmar."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Can you separate the changed records from the rest of the file in time?", "Kan ni skilja ut de ändrade posterna från resten av filen i tid?", ["serviceOwner", "cio"]),
            q("Who made the changes, and from where?", "Vem gjorde ändringarna, och varifrån?", ["ciso"]),
            q("Can you pay to the old account numbers instead?", "Kan ni betala till de gamla kontonumren i stället?", ["serviceOwner"])
          ],
          executive: [
            q("Is paying a fraudster worse than not paying an honest person?", "Är det värre att betala en bedragare än att inte betala en ärlig person?", ["ceo"]),
            q("Who do you have to tell today: the ministry, the police?", "Vem måste ni berätta för i dag: departementet, polisen?", ["ceo", "legal"]),
            q("What do you say to someone who calls tomorrow and has not been paid?", "Vad säger ni till någon som ringer i morgon och inte har fått sina pengar?", ["comms"])
          ]
        },
        challenges: [ch("Paying to the old account numbers would reach people who really did change banks, at closed accounts.", "Att betala till de gamla kontonumren skulle nå personer som verkligen bytt bank, på stängda konton.")],
        decision: dec("d1", "ceo", ["What do you send the bank?", "Vad skickar ni till banken?"], [
          ["Send the file without the changed records, pay everyone else on time, and hold the {{num.changed|number}} until they are checked.", "Skicka filen utan de ändrade posterna, betala alla andra i tid och håll inne de {{num.changed|number}} tills de är kontrollerade."],
          ["Pay the changed records to the previous account numbers, and sort out the exceptions afterwards.", "Betala de ändrade posterna till de tidigare kontonumren, och reda ut undantagen efteråt."],
          ["Stop the whole payment until you know what happened, and tell the bank to wait.", "Stoppa hela utbetalningen tills ni vet vad som har hänt, och be banken vänta."]
        ], {
          knowns: [["The bank has rejected the file; {{num.changed|number}} account numbers changed this month.", "Banken har avvisat filen; {{num.changed|number}} kontonummer har ändrats den här månaden."]],
          uncertainties: [["How many changes are genuine, and whether the rest of the file can be trusted.", "Hur många ändringar som är äkta, och om resten av filen går att lita på."]],
          tradeoffs: {
            operational: ["Holding records means thousands of calls tomorrow; stopping everything means hundreds of thousands.", "Att hålla inne poster innebär tusentals samtal i morgon; att stoppa allt innebär hundratusentals."],
            security: ["Paying the changed accounts sends public money to criminals.", "Att betala de ändrade kontona skickar offentliga medel till kriminella."],
            legal: ["People have a right to their benefits on time; the agency must not pay out wrongly.", "Människor har rätt till sina ersättningar i tid; myndigheten får inte betala ut felaktigt."],
            reputational: ["A missed payday is national news within hours.", "En missad utbetalningsdag är riksnyhet inom några timmar."]
          },
          evaluation: [["Pays everyone who can safely be paid, and stops money from reaching accounts nobody can vouch for", "Betalar alla som säkert kan betalas, och hindrar pengar från att nå konton som ingen kan gå i god för"]]
        }),
        facilitator: fac(
          ["The deadline is real. Watch whether the room treats “most of these are real” as fact or as hope.", "Tidsgränsen är verklig. Se om rummet behandlar ”de flesta är säkert äkta” som fakta eller som förhoppning."],
          ["Pay the unaffected majority on time, hold the changed records, and start checking them at once.", "Betala den opåverkade majoriteten i tid, håll inne de ändrade posterna och börja kontrollera dem direkt."],
          [["Ask: how would you explain each option to someone who did not get paid?", "Fråga: hur skulle ni förklara varje alternativ för någon som inte fick sina pengar?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["Two of our own", "Två av våra egna"]),
        twist: L(["Almost every change was made through the accounts of two caseworkers, during working hours, from their own desks. The police already know one of their names.", "Nästan varje ändring gjordes via två handläggares konton, under arbetstid, från deras egna skrivbord. Polisen känner redan till ett av namnen."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "C" }, narrativeAppend: { en: "Because you stopped the whole payment, the bank has released a statement that the agency's payments are delayed, and the contact centre's phone lines are already full.", sv: "Eftersom ni stoppade hela utbetalningen har banken gått ut med att myndighetens utbetalningar är försenade, och kontaktcentrets telefonlinjer är redan fulla." } }
        ],
        assumptionChallenged: L(["We were hacked from outside.", "Vi har blivit hackade utifrån."]),
        reveals: ["hf-insiders"],
        narrative: L([
          "{{time.T+60|clock}}. {{person.ciso.name}} has the audit log. There is no sign of an outside attacker: the changes were made through the case management system, by two caseworkers, in normal working hours. Any caseworker can change a recipient's account number; nobody has to approve it.\n\nThen a detective from {{reg.police}} calls. They have been following a criminal network that recruits public employees. They ask you not to touch the two accounts or alert the caseworkers: they want to see where the money goes.",
          "Klockan {{time.T+60|clock}}. {{person.ciso.name}} har granskningsloggen. Det finns inga spår av en angripare utifrån: ändringarna gjordes i ärendehanteringssystemet, av två handläggare, under vanlig arbetstid. Vilken handläggare som helst kan ändra en mottagares kontonummer; ingen behöver godkänna det.\n\nSedan ringer en utredare från {{reg.police}}. De har följt ett kriminellt nätverk som rekryterar offentliganställda. De ber er att inte röra de två kontona eller varna handläggarna: de vill se vart pengarna tar vägen."
        ]),
        injects: [
          inj("i2-1", 60, "logExcerpt", "person.ciso", "high", "confirmed", [
            "Case management audit: 94% of this month's account changes made by two users (caseworker IDs H-2231 and H-4410). Changes made during office hours from agency workstations. No second approval required for this field.",
            "Granskningslogg, ärendehantering: 94 % av månadens kontoändringar gjorda av två användare (handläggar-id H-2231 och H-4410). Ändringar gjorda under kontorstid från myndighetens datorer. Inget andra godkännande krävs för fältet."
          ], { reveals: ["hf-insiders"], tests: ["lo2"] }),
          inj("i2-2", 70, "phoneTranscript", "police", "high", "confirmed", [
            "“Please don't lock them out yet, and don't say anything to them. If the network sees that you know, the accounts are emptied and the people behind this vanish. Give us a week.”",
            "”Lås inte ute dem än, och säg ingenting till dem. Om nätverket ser att ni vet töms kontona och de som ligger bakom försvinner. Ge oss en vecka.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("If the two accounts stay active, what else can they change this week?", "Om de två kontona förblir aktiva, vad mer kan de ändra den här veckan?", ["ciso"]),
            q("Can you watch them without them noticing?", "Kan ni bevaka dem utan att de märker det?", ["ciso", "cio"]),
            q("Did the file you sent the bank hold up, now that you know who made the changes?", "Höll filen ni skickade till banken, nu när ni vet vem som gjorde ändringarna?", ["serviceOwner"], "d1")
          ],
          executive: [
            q("Who decides here: the police, or the agency?", "Vem bestämmer här: polisen eller myndigheten?", ["ceo", "legal"]),
            q("What do you owe the two caseworkers as their employer?", "Vad är ni skyldiga de två handläggarna som arbetsgivare?", ["hr"]),
            q("Would you make the same call on the payment file, knowing it was two of your own?", "Skulle ni fatta samma beslut om utbetalningsfilen, med vetskap om att det var två av era egna?", ["ceo"], "d1")
          ]
        },
        challenges: [ch("{{person.hr.name}} has a note on file: one of the two caseworkers asked for a transfer last month and said she felt unsafe.", "{{person.hr.name}} har en anteckning: en av de två handläggarna bad om omplacering förra månaden och sa att hon kände sig otrygg.")],
        decision: dec("d2", "securityOfficer", ["What do you do about the two caseworkers?", "Vad gör ni med de två handläggarna?"], [
          ["Lock both accounts now, move them off case work, and tell the police you could not wait.", "Lås båda kontona nu, flytta dem från handläggningen och säg till polisen att ni inte kunde vänta."],
          ["Leave the accounts active as the police ask, and quietly block account changes from them in the background.", "Låt kontona vara aktiva som polisen ber om, och blockera i det tysta kontoändringar från dem i bakgrunden."],
          ["Leave everything as it is for a week, as the police ask.", "Låt allt vara som det är i en vecka, som polisen ber om."]
        ], {
          knowns: [["Two caseworkers made almost all the changes; the police are investigating the network behind them.", "Två handläggare gjorde nästan alla ändringar; polisen utreder nätverket bakom dem."]],
          uncertainties: [["Whether the caseworkers acted willingly, and whether others are involved.", "Om handläggarna agerade frivilligt, och om fler är inblandade."]],
          tradeoffs: {
            operational: ["Every day the accounts stay open, more records can change.", "Varje dag kontona står öppna kan fler poster ändras."],
            security: ["A silent block may be noticed; an open account is a live risk.", "En tyst blockering kan upptäckas; ett öppet konto är en aktiv risk."],
            legal: ["Ignoring the police may harm the case; following them may harm recipients.", "Att strunta i polisen kan skada utredningen; att följa dem kan skada mottagarna."],
            reputational: ["“The agency knew and let it go on” is the worst headline here.", "”Myndigheten visste och lät det fortsätta” är den värsta rubriken här."]
          },
          evaluation: [["Stops further harm to recipients while giving the police as much as can safely be given", "Stoppar ytterligare skada för mottagarna och ger polisen så mycket som säkert går att ge"]]
        }),
        facilitator: fac(
          ["This turns a payment problem into an insider case. The note from HR should make the room uncomfortable.", "Det här gör ett utbetalningsproblem till ett insiderärende. Anteckningen från HR bör göra rummet obekvämt."],
          ["Stop the harm quietly, cooperate with the police on how, and treat the caseworkers as possible victims as well as suspects.", "Stoppa skadan i det tysta, samarbeta med polisen om hur, och behandla handläggarna som möjliga offer såväl som misstänkta."],
          [["Ask: if one of them was threatened, what changes in how you treat her?", "Fråga: om en av dem hotades, vad ändras i hur ni behandlar henne?"]]
        )
      },
      {
        id: "p3",
        clock: 240,
        title: L(["The promise", "Löftet"]),
        twist: L(["On the evening news, the minister says: “I have been assured that every single person will be paid tomorrow, on time.” Nobody at the agency gave that assurance.", "I kvällsnyheterna säger ministern: ”Jag har fått försäkringar om att varenda person får sina pengar i morgon, i tid.” Ingen på myndigheten har gett den försäkran."]),
        twistKind: "authority",
        reconsider: { decision: "d1", pressure: { en: "The minister has promised that everyone will be paid tomorrow. Whatever you sent the bank this afternoon now either keeps that promise or breaks it. Would you send the same file?", sv: "Ministern har lovat att alla får sina pengar i morgon. Det ni skickade till banken i eftermiddags håller nu antingen det löftet eller bryter det. Skulle ni skicka samma fil?" } },
        branches: [
          { when: { decision: "d2", option: "C" }, narrativeAppend: { en: "Because the two accounts were left untouched, the audit log shows another 140 account changes made this afternoon, after you knew.", sv: "Eftersom de två kontona lämnades orörda visar granskningsloggen ytterligare 140 kontoändringar gjorda i eftermiddag, efter att ni visste." } }
        ],
        assumptionChallenged: L(["The ministry will follow our lead.", "Departementet följer vår linje."]),
        narrative: L([
          "{{time.T+240|clock}}. The minister's state secretary calls {{person.ceo.name}} straight after the broadcast. The ministry wants a written confirmation tonight that the promise will be kept, and a short press release saying so.\n\n{{person.serviceOwner.name}} says it can be done, technically: release the held records and pay them as they are. Some of the money would go to the network's accounts.",
          "Klockan {{time.T+240|clock}}. Ministerns statssekreterare ringer {{person.ceo.name}} direkt efter sändningen. Departementet vill ha en skriftlig bekräftelse i kväll på att löftet hålls, och ett kort pressmeddelande som säger det.\n\n{{person.serviceOwner.name}} säger att det går, tekniskt: släpp de innehållna posterna och betala dem som de är. En del av pengarna skulle gå till nätverkets konton."
        ]),
        injects: [
          inj("i3-1", 240, "newsHeadline", "media", "high", "misleading", [
            "Minister: “Every single person will be paid tomorrow, on time. I have the agency's assurance.”",
            "Ministern: ”Varenda person får sina pengar i morgon, i tid. Jag har myndighetens försäkran.”"
          ], { headline: ["Evening news", "Kvällsnyheterna"], facilitatorNote: ["The agency gave no such assurance. The room must decide whether to correct a minister in public.", "Myndigheten gav ingen sådan försäkran. Rummet måste avgöra om man ska rätta en minister offentligt."], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Can any of the held records be verified by tomorrow morning?", "Kan någon av de innehållna posterna verifieras till i morgon bitti?", ["serviceOwner"]),
            q("What would it take to pay the held records safely?", "Vad skulle det krävas för att betala de innehållna posterna säkert?", ["cio"]),
            q("Are the two caseworkers' accounts still a risk tonight?", "Är de två handläggarnas konton fortfarande en risk i kväll?", ["ciso"], "d2")
          ],
          executive: [
            q("Is an agency allowed to say no to a minister in public?", "Får en myndighet säga nej till en minister offentligt?", ["ceo", "legal"]),
            q("What exactly will you put in writing tonight?", "Vad exakt sätter ni på pränt i kväll?", ["ceo"]),
            q("Would you handle the caseworkers the same way, now that the ministry is watching?", "Skulle ni hantera handläggarna på samma sätt, nu när departementet tittar på?", ["securityOfficer"], "d2")
          ]
        },
        challenges: [ch("The state secretary adds: “If this goes wrong tomorrow, the minister will need to know who said otherwise.”", "Statssekreteraren lägger till: ”Om det här går fel i morgon behöver ministern veta vem som sa något annat.”")],
        decision: dec("d3", "ceo", ["What do you tell the ministry, and the public?", "Vad säger ni till departementet, och till allmänheten?"], [
          ["Tell the ministry in writing that most people will be paid but some will not, and publish the same tonight.", "Säg skriftligt till departementet att de flesta får sina pengar men inte alla, och publicera samma sak i kväll."],
          ["Keep the minister's promise: release the held records and pay them all tomorrow.", "Håll ministerns löfte: släpp de innehållna posterna och betala alla i morgon."],
          ["Tell the ministry the facts privately, and let the minister decide what to say.", "Ge departementet fakta i förtroende, och låt ministern bestämma vad som ska sägas."]
        ], {
          knowns: [["The minister promised everyone would be paid; the agency has not confirmed it.", "Ministern lovade att alla får betalt; myndigheten har inte bekräftat det."]],
          uncertainties: [["How many of the held records belong to honest people.", "Hur många av de innehållna posterna som tillhör ärliga personer."]],
          tradeoffs: {
            operational: ["Paying everything makes tomorrow quiet; holding back makes it loud.", "Att betala allt gör morgondagen lugn; att hålla inne gör den högljudd."],
            security: ["Releasing the held records pays the network.", "Att släppa de innehållna posterna betalar nätverket."],
            legal: ["The agency is responsible for its payments, not the minister.", "Myndigheten ansvarar för sina utbetalningar, inte ministern."],
            reputational: ["Correcting a minister is remembered; so is a fraud you knew about.", "Att rätta en minister glöms inte; inte heller ett bedrägeri ni kände till."]
          },
          evaluation: [["Tells political leadership and the public what is true, in writing, even when it contradicts the minister", "Berättar för den politiska ledningen och allmänheten vad som är sant, skriftligt, även när det motsäger ministern"]]
        }),
        facilitator: fac(
          ["The pressure here is personal. The state secretary's last sentence is a threat; see who names it.", "Trycket här är personligt. Statssekreterarens sista mening är ett hot; se vem som säger det rakt ut."],
          ["Put the facts in writing to the ministry, publish what will happen tomorrow, and do not pay the network to keep a promise you did not make.", "Ge departementet fakta skriftligt, publicera vad som händer i morgon och betala inte nätverket för att hålla ett löfte ni inte gav."],
          [["Ask: who is accountable if the held money reaches criminals?", "Fråga: vem är ansvarig om de innehållna pengarna når kriminella?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 960,
        title: L(["Not only this month", "Inte bara den här månaden"]),
        twist: L(["The same pattern shows up in two other benefits, going back four months, in amounts small enough to pass every check. {{num.diverted|currency}} has already gone.", "Samma mönster syns i två andra ersättningar, fyra månader bakåt, med belopp så små att de passerat varje kontroll. {{num.diverted|currency}} har redan försvunnit."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d3", option: "B" }, narrativeAppend: { en: "Because the held records were released, the network's accounts received their money this morning, and most of it was withdrawn within the hour.", sv: "Eftersom de innehållna posterna släpptes fick nätverkets konton sina pengar i morse, och det mesta togs ut inom en timme." } }
        ],
        assumptionChallenged: L(["We caught it the first time it happened.", "Vi upptäckte det första gången det hände."]),
        reveals: ["hf-spread"],
        narrative: L([
          "{{time.T+960|weekday|cap}}, {{time.T+960|clock}}. {{person.cio.name}} has run the same search across every benefit the agency pays. Two smaller benefits show the same pattern, started four months ago: a few dozen account changes a month, the same caseworker IDs, money paid out and withdrawn.\n\nThe agency's account register is shared with two other agencies, which pay pensions and student support. They use it to pay the same people.",
          "{{time.T+960|weekday|cap}}, klockan {{time.T+960|clock}}. {{person.cio.name}} har kört samma sökning i varje ersättning som myndigheten betalar ut. Två mindre ersättningar visar samma mönster, som började för fyra månader sedan: några dussin kontoändringar i månaden, samma handläggar-id, pengar utbetalda och uttagna.\n\nMyndighetens kontoregister delas med två andra myndigheter, som betalar ut pensioner och studiestöd. De använder det för att betala samma personer."
        ]),
        injects: [
          inj("i4-1", 960, "impactReport", "person.cio", "critical", "confirmed", [
            "Search across all benefits: matching pattern in two further benefits since four months, {{num.diverted|currency}} paid to changed accounts. Account register is shared with two other agencies; their next payment run is in 9 days.",
            "Sökning i alla ersättningar: samma mönster i ytterligare två ersättningar sedan fyra månader, {{num.diverted|currency}} utbetalt till ändrade konton. Kontoregistret delas med två andra myndigheter; deras nästa utbetalning sker om 9 dagar."
          ], { reveals: ["hf-spread"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Which changed accounts can you trust, and how do you check them?", "Vilka ändrade konton kan ni lita på, och hur kontrollerar ni dem?", ["serviceOwner", "cio"]),
            q("Is anyone else changing account numbers the same way?", "Ändrar någon annan kontonummer på samma sätt?", ["ciso"]),
            q("Did what you told the ministry hold up against what you know now?", "Höll det ni sa till departementet mot det ni vet nu?", ["comms"], "d3")
          ],
          executive: [
            q("What do you owe the two other agencies, today?", "Vad är ni skyldiga de två andra myndigheterna, i dag?", ["ceo"]),
            q("Is this now a personal data breach as well as a fraud?", "Är det här nu en personuppgiftsincident lika väl som ett bedrägeri?", ["dpo", "legal"]),
            q("Would you give the ministry the same message again, knowing this?", "Skulle ni ge departementet samma besked igen, med vetskap om det här?", ["ceo"], "d3")
          ]
        },
        challenges: [ch("Freezing every changed account for four months back would also stop payments to people who changed banks for good reasons, including people escaping violence.", "Att frysa varje ändrat konto fyra månader bakåt skulle också stoppa utbetalningar till personer som bytt bank av goda skäl, även personer som flyr våld.")],
        decision: dec("d4", "cio", ["How far do you go?", "Hur långt går ni?"], [
          ["Freeze every account change made in four months across all benefits, and contact each person before paying again.", "Frys varje kontoändring som gjorts på fyra månader i alla ersättningar, och kontakta varje person innan ni betalar igen."],
          ["Freeze only changes made by the two caseworkers, and review the rest by risk.", "Frys bara ändringar gjorda av de två handläggarna, och granska resten efter risk."],
          ["Warn the two other agencies and let each of them decide what to do with their payments.", "Varna de två andra myndigheterna och låt var och en bestämma vad de gör med sina utbetalningar."]
        ], {
          knowns: [["The fraud has run for four months across three benefits, through a register shared with two other agencies.", "Bedrägeriet har pågått i fyra månader i tre ersättningar, via ett register som delas med två andra myndigheter."]],
          uncertainties: [["Whether the two caseworkers are the only ones involved.", "Om de två handläggarna är de enda inblandade."]],
          tradeoffs: {
            operational: ["A wide freeze means thousands of calls; a narrow one may miss others.", "En bred frysning innebär tusentals samtal; en smal kan missa andra."],
            security: ["The network may already have recruited someone else.", "Nätverket kan redan ha rekryterat någon annan."],
            legal: ["Other agencies' payments rely on your register; you are responsible for it.", "Andra myndigheters utbetalningar bygger på ert register; ni ansvarar för det."],
            reputational: ["“Four months unnoticed” is now the story.", "”Fyra månader utan att någon märkte det” är nu nyheten."]
          },
          evaluation: [["Protects every payment that relies on the register, without punishing the people who changed banks honestly", "Skyddar varje utbetalning som bygger på registret, utan att straffa dem som bytt bank av ärliga skäl"]]
        }),
        facilitator: fac(
          ["The scope just jumped from one payment to three agencies. The challenge about people escaping violence is there to stop an easy “freeze everything”.", "Omfattningen har just gått från en utbetalning till tre myndigheter. Utmaningen om personer som flyr våld finns där för att stoppa ett enkelt ”frys allt”."],
          ["Freeze what the two caseworkers touched, check the rest by risk with a fast route for urgent cases, and tell the other agencies today.", "Frys det de två handläggarna rört, kontrollera resten efter risk med en snabb väg för brådskande fall, och berätta för de andra myndigheterna i dag."],
          [["Ask: who outside this room is about to pay money based on your register?", "Fråga: vem utanför det här rummet är på väg att betala ut pengar utifrån ert register?"]]
        )
      },
      {
        id: "p5",
        clock: 1080,
        title: L(["Rent is due", "Hyran ska betalas"]),
        twist: L(["Text messages in the agency's name are going out to thousands: “Your payment is delayed. Confirm your bank details here to receive it today.”", "Sms i myndighetens namn går ut till tusentals: ”Din utbetalning är försenad. Bekräfta dina bankuppgifter här för att få den i dag.”"]),
        twistKind: "impact",
        reconsider: { decision: "d3", pressure: { en: "Payday is here, people are calling, and fraudsters are texting them in your name. What you told the public last night is what people believe this morning. Was it enough?", sv: "Utbetalningsdagen är här, folk ringer, och bedragare sms:ar dem i ert namn. Det ni sa till allmänheten i går kväll är vad folk tror på i morse. Räckte det?" } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because every account change for four months was frozen, the number of people without money today is several times larger than the {{num.changed|number}} held yesterday.", sv: "Eftersom varje kontoändring på fyra månader frystes är antalet personer utan pengar i dag flera gånger större än de {{num.changed|number}} som hölls inne i går." } }
        ],
        assumptionChallenged: L(["Holding the payments was the hard part.", "Att hålla inne utbetalningarna var den svåra delen."]),
        narrative: L([
          "{{time.T+1080|clock}}. Payday. The contact centre has had {{num.calls|number}} calls since it opened. Many callers are people whose payment was held. Some have rent due today; one caller says she cannot buy medicine for her child.\n\nAt the same time, text messages in the agency's name are spreading, with a link to a page asking for bank login details. Some of the people who did not get paid are exactly the people who will click.",
          "Klockan {{time.T+1080|clock}}. Utbetalningsdag. Kontaktcentret har fått {{num.calls|number}} samtal sedan det öppnade. Många som ringer är personer vars utbetalning hölls inne. En del ska betala hyran i dag; en kvinna säger att hon inte kan köpa medicin till sitt barn.\n\nSamtidigt sprids sms i myndighetens namn, med en länk till en sida som ber om inloggningsuppgifter till banken. En del av dem som inte fick sina pengar är precis de som kommer att klicka."
        ]),
        injects: [
          inj("i5-1", 1080, "sms", "attacker", "high", "misleading", [
            "“{{org.name}}: Your payment is delayed. Confirm your bank details at the link to receive it today.”",
            "”{{org.name}}: Din utbetalning är försenad. Bekräfta dina bankuppgifter via länken för att få den i dag.”"
          ], { headline: ["Reported by recipients", "Anmält av mottagare"], facilitatorNote: ["The phishing targets exactly the people who were not paid. Any delay in warning them costs real money.", "Nätfisket riktar sig precis mot dem som inte fick betalt. Varje försening i att varna dem kostar verkliga pengar."], tests: ["lo4"] }),
          inj("i5-2", 1095, "customerComplaint", "customer", "high", "confirmed", [
            "“I have never changed my account. Why is my money held? My rent is due today and the landlord will not wait.”",
            "”Jag har aldrig ändrat mitt konto. Varför hålls mina pengar inne? Hyran ska betalas i dag och hyresvärden väntar inte.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How fast can you verify a caller and pay them to a safe account?", "Hur snabbt kan ni verifiera den som ringer och betala till ett säkert konto?", ["serviceOwner"]),
            q("How do you get the phishing page taken down, and warn people?", "Hur får ni nätfiskesidan nedtagen, och varnar folk?", ["ciso"]),
            q("Did the scope you chose yesterday make today harder than it had to be?", "Gjorde den omfattning ni valde i går dagen i dag svårare än nödvändigt?", ["cio"], "d4")
          ],
          executive: [
            q("Who gets paid first, and who decides?", "Vem får betalt först, och vem bestämmer?", ["ceo"]),
            q("What does the agency say about people it could not pay?", "Vad säger myndigheten om dem den inte kunde betala?", ["comms"]),
            q("Would you choose the same scope again, standing in this contact centre?", "Skulle ni välja samma omfattning igen, stående i det här kontaktcentret?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("An emergency payment over the phone is exactly what the fraudsters would ask for.", "En nödutbetalning via telefon är precis vad bedragarna skulle be om.")],
        decision: dec("d5", "serviceOwner", ["How do you help the people who were not paid?", "Hur hjälper ni dem som inte fick betalt?"], [
          ["Open emergency payments in person at local offices, with ID checks, from tomorrow.", "Öppna nödutbetalningar på plats på lokalkontoren, med id-kontroll, från i morgon."],
          ["Verify callers through the national e-ID and pay urgent cases today.", "Verifiera den som ringer via nationell e-legitimation och betala brådskande fall i dag."],
          ["Pay everyone held after manual verification, within five working days, with no exceptions.", "Betala alla som hölls inne efter manuell verifiering, inom fem arbetsdagar, utan undantag."]
        ], {
          knowns: [["Thousands are without money today; phishing in your name is targeting them.", "Tusentals står utan pengar i dag; nätfiske i ert namn riktar sig mot dem."]],
          uncertainties: [["Whether e-ID is safe if the network controls some of the new bank accounts.", "Om e-legitimationen är säker om nätverket kontrollerar en del av de nya bankkontona."]],
          tradeoffs: {
            operational: ["Offices mean queues; phone verification means volume; waiting means hardship.", "Kontor innebär köer; verifiering per telefon innebär volym; att vänta innebär nöd."],
            security: ["Every fast route is a route the fraudsters will try.", "Varje snabb väg är en väg som bedragarna kommer att pröva."],
            legal: ["The agency must not pay wrongly; it must also not leave people without support.", "Myndigheten får inte betala fel; den får inte heller lämna människor utan stöd."],
            reputational: ["A mother without medicine is the face of this crisis.", "En mamma utan medicin är den här krisens ansikte."]
          },
          evaluation: [["Gets money to people in real need quickly without opening a new route for fraud", "Får snabbt ut pengar till personer i verklig nöd utan att öppna en ny väg för bedrägeri"]]
        }),
        facilitator: fac(
          ["The people the room protected yesterday are the ones suffering today. Let that land.", "De som rummet skyddade i går är de som lider i dag. Låt det sjunka in."],
          ["A fast, verified route for urgent cases, a loud warning about the phishing, and a clear date for everyone else.", "En snabb, verifierad väg för brådskande fall, en tydlig varning för nätfisket och ett tydligt datum för alla andra."],
          [["Ask: how does someone who did nothing wrong prove it to you today?", "Fråga: hur bevisar någon som inte gjort något fel det för er i dag?"]]
        )
      },
      {
        id: "p6",
        clock: 20160,
        title: L(["The audit nobody followed", "Revisionen som ingen följde"]),
        twist: L(["A journalist has a copy of an internal audit from two years ago. It recommended a second approval for every account change. Management deferred it to save money.", "En journalist har en kopia av en internrevision från två år sedan. Den rekommenderade ett andra godkännande för varje kontoändring. Ledningen sköt upp det för att spara pengar."]),
        twistKind: "impact",
        reconsider: { decision: "d2", pressure: { en: "The police have made arrests, and one of the caseworkers says she was threatened into it. How you treated the two of them on the first day is now part of the story. Would you do the same?", sv: "Polisen har gripit flera, och en av handläggarna säger att hon tvingades med hot. Hur ni behandlade de två den första dagen är nu en del av nyheten. Skulle ni göra likadant?" } },
        branches: [
          { when: { decision: "d5", option: "C" }, narrativeAppend: { en: "Because the held payments took five working days, the article also tells the story of three families evicted that week.", sv: "Eftersom de innehållna utbetalningarna tog fem arbetsdagar berättar artikeln också om tre familjer som vräktes den veckan." } }
        ],
        assumptionChallenged: L(["Nobody could have seen this coming.", "Ingen kunde ha förutsett det här."]),
        reveals: ["hf-audit"],
        narrative: L([
          "Two weeks later. The police have arrested five people, including one of the two caseworkers. The other says, through her union, that she was threatened, and that she asked the agency for help a month before.\n\nThen a journalist sends {{person.comms.name}} a copy of an internal audit from two years ago, and asks why its main recommendation, a second approval for account changes, was never carried out. {{reg.supervisor|cap}} has opened a review.",
          "Två veckor senare. Polisen har gripit fem personer, däribland en av de två handläggarna. Den andra säger, genom sitt fack, att hon blev hotad, och att hon bad myndigheten om hjälp en månad innan.\n\nSedan skickar en journalist en kopia av en internrevision från två år sedan till {{person.comms.name}}, och frågar varför dess viktigaste rekommendation, ett andra godkännande för kontoändringar, aldrig genomfördes. {{reg.supervisor|cap}} har inlett en granskning."
        ]),
        injects: [
          inj("i6-1", 20160, "mediaEnquiry", "media", "high", "confirmed", [
            "“We have the internal audit report that recommended dual approval for account changes. Who decided not to implement it, and why? We publish on Sunday.”",
            "”Vi har internrevisionens rapport som rekommenderade dubbelt godkännande för kontoändringar. Vem beslutade att inte genomföra det, och varför? Vi publicerar på söndag.”"
          ], { reveals: ["hf-audit"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("What would a second approval have cost, and what would it have stopped?", "Vad skulle ett andra godkännande ha kostat, och vad skulle det ha stoppat?", ["cio"]),
            q("What else did that audit recommend?", "Vad mer rekommenderade den revisionen?", ["ciso"]),
            q("Did your choice about the caseworkers on day one help or harm the police case?", "Hjälpte eller skadade ert val om handläggarna första dagen polisens utredning?", ["securityOfficer"], "d2")
          ],
          executive: [
            q("Who answers for the decision to defer the audit's recommendation?", "Vem står för beslutet att skjuta upp revisionens rekommendation?", ["ceo"]),
            q("What does the agency owe the caseworker who asked for help?", "Vad är myndigheten skyldig handläggaren som bad om hjälp?", ["hr"]),
            q("Would you treat the two caseworkers the same way again, knowing what you know now?", "Skulle ni behandla de två handläggarna på samma sätt igen, med det ni vet nu?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("The manager who deferred the recommendation is now the deputy director general.", "Chefen som sköt upp rekommendationen är nu biträdande generaldirektör.")],
        decision: dec("d6", "ceo", ["What do you do about the audit?", "Vad gör ni med revisionen?"], [
          ["Publish the audit, say plainly that the agency deferred the control, and introduce dual approval now.", "Publicera revisionen, säg rakt ut att myndigheten sköt upp kontrollen, och inför dubbelt godkännande nu."],
          ["Introduce dual approval now and answer the journalist's questions, without publishing the report.", "Inför dubbelt godkännande nu och svara på journalistens frågor, utan att publicera rapporten."],
          ["Wait for the supervisor's review before saying anything about past decisions.", "Vänta på tillsynsmyndighetens granskning innan ni säger något om tidigare beslut."]
        ], {
          knowns: [["An audit recommended the missing control two years ago, and the agency deferred it.", "En revision rekommenderade den saknade kontrollen för två år sedan, och myndigheten sköt upp den."]],
          uncertainties: [["Whether the deferral will be judged a reasonable priority or a failure.", "Om uppskjutandet kommer att bedömas som en rimlig prioritering eller ett misslyckande."]],
          tradeoffs: {
            operational: ["Dual approval slows every genuine account change.", "Dubbelt godkännande bromsar varje äkta kontoändring."],
            security: ["Without it, the next recruited insider can do the same.", "Utan det kan nästa rekryterade insider göra likadant."],
            legal: ["Public documents may have to be released anyway.", "Allmänna handlingar kan behöva lämnas ut ändå."],
            reputational: ["The report will be published, by you or by the journalist.", "Rapporten kommer att publiceras, av er eller av journalisten."]
          },
          evaluation: [["Owns the past decision openly and fixes the control, rather than waiting to be judged", "Tar öppet ansvar för det tidigare beslutet och åtgärdar kontrollen, i stället för att vänta på att bli bedömd"]]
        }),
        facilitator: fac(
          ["The person who deferred the control is in the room's chain of command. Watch whether that changes the answer.", "Den som sköt upp kontrollen finns i rummets egen ledningskedja. Se om det ändrar svaret."],
          ["Be open about the deferral, introduce dual approval, and support the caseworker who asked for help.", "Var öppna med uppskjutandet, inför dubbelt godkännande och stötta handläggaren som bad om hjälp."],
          [["Ask: if you were the supervisor, what would you want this agency to have said already?", "Fråga: om ni var tillsynsmyndigheten, vad skulle ni vilja att myndigheten redan hade sagt?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Most people were paid on time and the network was stopped, but thousands waited days for their money, {{num.diverted|currency}} is gone, and the agency must explain why a control recommended two years ago was never introduced.",
        "De flesta fick sina pengar i tid och nätverket stoppades, men tusentals väntade i flera dagar på sina pengar, {{num.diverted|currency}} har försvunnit, och myndigheten måste förklara varför en kontroll som rekommenderades för två år sedan aldrig infördes."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Pay everyone you safely can on time; hold only what you cannot vouch for.", "Betala alla ni säkert kan i tid; håll bara inne det ni inte kan gå i god för."]),
        L(["A police request does not take away your duty to stop harm; agree how, together.", "En begäran från polisen tar inte bort er skyldighet att stoppa skada; kom överens om hur, tillsammans."]),
        L(["Tell political leadership the truth in writing, even when it contradicts a promise.", "Berätta sanningen för den politiska ledningen skriftligt, även när den motsäger ett löfte."]),
        L(["A single person able to change where money goes is a control gap, not a staffing detail.", "Att en enda person kan ändra vart pengar går är en brist i kontrollen, inte en bemanningsdetalj."])
      ],
      assumptionsVsReality: [
        avr(["We were hacked from outside.", "Vi har blivit hackade utifrån."], ["Two caseworkers made the changes, recruited by a criminal network.", "Två handläggare gjorde ändringarna, rekryterade av ett kriminellt nätverk."], "p2"),
        avr(["We caught it the first time it happened.", "Vi upptäckte det första gången det hände."], ["It had been running for four months in two other benefits.", "Det hade pågått i fyra månader i två andra ersättningar."], "p4"),
        avr(["Nobody could have seen this coming.", "Ingen kunde ha förutsett det här."], ["An audit recommended the missing control two years ago.", "En revision rekommenderade den saknade kontrollen för två år sedan."], "p6")
      ],
      strengthsToLookFor: [
        L(["Paying the unaffected majority on time", "Att betala den opåverkade majoriteten i tid"]),
        L(["Putting the facts to the ministry in writing", "Att ge departementet fakta skriftligt"]),
        L(["A fast, verified route for people in urgent need", "En snabb, verifierad väg för personer i akut nöd"])
      ],
      commonGaps: [
        L(["Letting the minister's promise decide the payment", "Att låta ministerns löfte avgöra utbetalningen"]),
        L(["Treating the caseworkers only as suspects", "Att behandla handläggarna enbart som misstänkta"]),
        L(["Forgetting the other agencies that use the same register", "Att glömma de andra myndigheterna som använder samma register"])
      ],
      suggestedActions: [
        act(["Require a second approval for every change to where a payment goes.", "Kräv ett andra godkännande för varje ändring av vart en utbetalning går."], "cio", "high"),
        act(["Monitor account changes for unusual volume per caseworker and per receiving bank.", "Bevaka kontoändringar för ovanlig volym per handläggare och per mottagande bank."], "ciso", "high"),
        act(["Give staff a safe way to report threats and recruitment attempts, and act on it.", "Ge personalen ett tryggt sätt att anmäla hot och rekryteringsförsök, och agera på det."], "hr", "high"),
        act(["Agree in advance with the ministry how payment incidents are communicated.", "Kom överens i förväg med departementet om hur incidenter i utbetalningar kommuniceras."], "ceo", "medium")
      ]
    }
  });
})();
