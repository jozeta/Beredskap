/*
 * s40-benefits-outage.js — "Benefits Day" (archetype F, government agency).
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
  const { L, q, ch, inj, dec, fac, act, avr, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s40-benefits-outage",
    version: 1,
    category: "benefits-outage",
    archetype: "human-legal-reputational",
    emblem: "benefits-outage",
    title: L(["Benefits Day", "Utbetalningsdagen"]),
    summary: L([
      "Tomorrow, hundreds of thousands of people expect their benefits. Today, the bank has rejected the payment file, the police want the system left exactly as it is, and the minister has just promised on television that everyone will be paid on time.",
      "I morgon väntar hundratusentals personer på sina ersättningar. I dag har banken avvisat utbetalningsfilen, polisen vill att systemet lämnas precis som det är, och ministern har just lovat i tv att alla får sina pengar i tid."
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
          evaluation: [["Pays everyone who can safely be paid, and stops money from reaching accounts nobody can vouch for", "Betalar alla som säkert kan betalas, och hindrar pengar från att nå konton som ingen kan gå i god för"]],
          pushback: {
            A: [
              pb(["The honest ones in the pile", "De ärliga i högen"], ["{{person.serviceOwner.name}} pulls twenty held records at random: at least six look like people who simply moved and changed banks. They will have no money tomorrow because of a pattern they had nothing to do with. How fast can you release the genuine ones, and who decides which they are?", "{{person.serviceOwner.name}} tar ut tjugo innehållna poster på måfå: minst sex ser ut att vara personer som bara flyttat och bytt bank. De står utan pengar i morgon på grund av ett mönster de inte har något med att göra. Hur snabbt kan ni släppa de äkta, och vem avgör vilka de är?"]),
              pb(["No script for tomorrow", "Inget manus för i morgon"], ["The contact centre manager says {{num.changed|number}} people without money means a wave of calls tomorrow, and staff have no script and no way to check anything. Most callers will hear only “we are looking into it”. What exactly does a caseworker say to someone who has nothing left for food?", "Kontaktcentrets chef säger att {{num.changed|number}} personer utan pengar betyder en våg av samtal i morgon, och personalen har varken manus eller något sätt att kontrollera. De flesta som ringer får bara höra ”vi undersöker saken”. Vad säger en handläggare exakt till någon som inte har något kvar till mat?"]),
              pb(["Is the rest really clean?", "Är resten verkligen rent?"], ["The bank flagged only what crossed its own thresholds; nobody at the agency has checked the rest of the file. Do you send {{num.recipients|number}} payments tonight on trust, simply because the bank did not object to them?", "Banken flaggade bara det som passerade dess egna gränsvärden; ingen på myndigheten har kontrollerat resten av filen. Skickar ni {{num.recipients|number}} utbetalningar i kväll på god tro, bara för att banken inte invände mot dem?"])
            ],
            B: [
              pb(["Payments bounce back", "Betalningarna studsar"], ["The bank warns that many of the previous accounts are closed. Those payments will bounce back in two or three days, and those people will then have waited longer than if you had held them. Is “sort it out afterwards” a plan, or a delay with extra steps?", "Banken varnar för att många av de tidigare kontona är avslutade. De betalningarna studsar tillbaka om två eller tre dagar, och de personerna har då väntat längre än om ni hade hållit inne dem. Är ”reda ut det efteråt” en plan, eller en försening med extra steg?"]),
              pb(["Paid to the wrong person", "Betalt till fel person"], ["{{person.legal.name}} asks on what basis the agency pays benefits to an account the recipient has told you they no longer use. If an old account is shared with an ex-partner, the money goes to someone else. Who signs off on paying into accounts you have been told are wrong?", "{{person.legal.name}} frågar med vilket stöd myndigheten betalar ersättning till ett konto som mottagaren har sagt att hen inte längre använder. Om ett gammalt konto delas med en tidigare partner hamnar pengarna hos någon annan. Vem godkänner att ni betalar till konton som ni fått veta är fel?"]),
              pb(["The old numbers aren't in the file", "De gamla numren finns inte i filen"], ["{{person.serviceOwner.name}} says the previous account numbers sit in the change history, not in the payment system. Pulling out {{num.changed|number}} of them by hand before the bank's deadline is barely possible, and one wrong row pays the wrong person. Do you rush it, or admit it cannot be done in time?", "{{person.serviceOwner.name}} säger att de tidigare kontonumren ligger i ändringshistoriken, inte i utbetalningssystemet. Att plocka fram {{num.changed|number}} av dem för hand före bankens tidsgräns går knappt, och en felaktig rad betalar fel person. Forcerar ni det, eller medger ni att det inte hinns?"])
            ],
            C: [
              pb(["Everyone pays for a few", "Alla får betala för några"], ["{{num.recipients|number}} people get nothing tomorrow, almost all of them with no changed account at all. Many live from one payment to the next. How do you justify making everyone wait for a problem in a small part of the file?", "{{num.recipients|number}} personer får ingenting i morgon, nästan alla utan något ändrat konto. Många lever från en utbetalning till nästa. Hur motiverar ni att alla får vänta på grund av ett problem i en liten del av filen?"]),
              pb(["The bank has to report it", "Banken måste rapportera"], ["The bank says it must inform its own supervisor when a payment run this large is cancelled. The ministry may hear about it from them before it hears from you. Who calls the ministry now, and what do you tell them you actually know?", "Banken säger att den måste informera sin egen tillsynsmyndighet när en så stor utbetalning ställs in. Departementet kan få höra det från dem innan det hör det från er. Vem ringer departementet nu, och vad säger ni att ni faktiskt vet?"]),
              pb(["Until when?", "Till när?"], ["“Until you know what happened” has no end date. {{person.securityOfficer.name}} says finding out could take days. Do you set a time when payments restart regardless, and what do you do if you still know nothing by then?", "”Tills ni vet vad som har hänt” har inget slutdatum. {{person.securityOfficer.name}} säger att det kan ta dagar att ta reda på det. Bestämmer ni en tidpunkt då utbetalningarna startar oavsett, och vad gör ni om ni fortfarande inte vet något då?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The held records", "De innehållna posterna"], [
              io(["The bank accepts", "Banken godtar"], ["The bank accepts the trimmed file within the hour. Everyone else will be paid tomorrow, and the bank's fraud team says the held accounts look like a textbook pattern.", "Banken godtar den bantade filen inom en timme. Alla andra får betalt i morgon, och bankens bedrägerigrupp säger att de innehållna kontona ser ut som ett skolboksexempel."], ["The bank accepted the file without the changed records.", "Banken godtog filen utan de ändrade posterna."]),
              io(["The file breaks", "Filen går sönder"], ["Taking records out breaks the file's control totals. The bank's system rejects the trimmed file twice, and each new attempt eats into the time left before the deadline.", "När poster tas bort går filens kontrollsummor sönder. Bankens system avvisar den bantade filen två gånger, och varje nytt försök äter upp tiden som återstår före tidsgränsen."], ["The trimmed file was rejected twice for broken control totals.", "Den bantade filen avvisades två gånger på grund av felaktiga kontrollsummor."], { reopen: true }),
              io(["“I never asked”", "”Jag har aldrig bett om det”"], ["A held recipient calls the contact centre to ask why their account has been flagged. They say they never asked to change it, and do not recognise the new bank.", "En mottagare vars utbetalning hålls inne ringer kontaktcentret och frågar varför kontot flaggats. Personen säger att hen aldrig bett om någon ändring och inte känner igen den nya banken."], ["A held recipient says they never asked to change their account.", "En mottagare som hålls inne säger att hen aldrig bett om att ändra sitt konto."])
            ]),
            ir("i2", { notChosen: "A" }, ["Nothing held back for checking", "Inget hålls inne för kontroll"], [
              io(["Rumours spread", "Ryktena sprids"], ["By early evening, a forum for benefit recipients is full of posts saying the agency's payment “has failed”. People are asking whether anyone will be paid tomorrow.", "Tidigt på kvällen är ett forum för ersättningstagare fullt av inlägg om att myndighetens utbetalning ”har misslyckats”. Folk frågar om någon alls får betalt i morgon."], ["Rumours that tomorrow's payment is in doubt are spreading among recipients.", "Rykten om att morgondagens utbetalning är osäker sprids bland mottagarna."], { meters: { trust: -1 } }),
              io(["The ministry hears first", "Departementet får veta först"], ["The bank's relationship manager mentions the rejected file to a contact at the ministry. The ministry calls to ask why it heard this from a bank and not from you.", "Bankens kontaktperson nämner den avvisade filen för en bekant på departementet. Departementet ringer och frågar varför det fick höra det från en bank och inte från er."], ["The ministry learned of the rejected file from the bank, not from you.", "Departementet fick veta om den avvisade filen från banken, inte från er."], { reopen: true }),
              io(["A sample looks innocent", "Ett stickprov ser oskyldigt ut"], ["A first quick sample of the changed records shows people who moved house and switched banks. {{person.serviceOwner.name}} calls the whole thing a storm in a teacup.", "Ett första snabbt stickprov bland de ändrade posterna visar personer som flyttat och bytt bank. {{person.serviceOwner.name}} kallar alltihop en storm i ett vattenglas."], ["A first small sample of the changed records looked genuine.", "Ett första litet stickprov av de ändrade posterna såg äkta ut."])
            ])
          ]
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
          evaluation: [["Stops further harm to recipients while giving the police as much as can safely be given", "Stoppar ytterligare skada för mottagarna och ger polisen så mycket som säkert går att ge"]],
          pushback: {
            A: [
              pb(["The detective is furious", "Utredaren är rasande"], ["The detective says locking them out today tells the network the agency knows, and months of surveillance may be wasted. They ask who made the decision, by name. Are you ready to be the reason the people behind this are never caught?", "Utredaren säger att om ni låser ute dem i dag förstår nätverket att myndigheten vet, och månader av spaning kan vara förspillda. Hen frågar vem som fattade beslutet, med namn. Är ni beredda att vara orsaken till att de som ligger bakom aldrig grips?"]),
              pb(["What do you tell the team?", "Vad säger ni till gruppen?"], ["Two caseworkers are suddenly removed from their desks in the middle of the day. Their colleagues want to know why, rumours start, and the union representative asks for a meeting tonight. What can you tell staff without harming the police case or naming anyone?", "Två handläggare flyttas plötsligt från sina skrivbord mitt på dagen. Kollegerna vill veta varför, rykten börjar gå, och den fackliga företrädaren begär ett möte i kväll. Vad kan ni säga till personalen utan att skada polisens utredning eller peka ut någon?"]),
              pb(["Only the part you can see", "Bara den del ni ser"], ["Locking two accounts feels decisive, but six per cent of this month's changes came from other users. If the network has anyone else inside, they now know to be careful. Have you stopped the fraud, or only the part you could see?", "Att låsa två konton känns kraftfullt, men sex procent av månadens ändringar kom från andra användare. Om nätverket har någon mer på insidan vet de nu att de ska vara försiktiga. Har ni stoppat bedrägeriet, eller bara den del ni kunde se?"])
            ],
            B: [
              pb(["They will notice", "De kommer att märka det"], ["A caseworker whose account changes suddenly fail will notice within hours, probably on the first try. An error message is as clear a warning as a locked account. What happens to the police case, and to the caseworkers, when they realise?", "En handläggare vars kontoändringar plötsligt inte går igenom märker det inom några timmar, troligen redan första gången. Ett felmeddelande är en lika tydlig varning som ett låst konto. Vad händer med polisens utredning, och med handläggarna, när de förstår?"]),
              pb(["A secret shared with many", "En hemlighet som många delar"], ["To block the changes silently, IT staff must configure it and their manager must approve it. Every person who knows is a person who might talk. How many people at the agency will know by tonight, and can you trust all of them now?", "För att blockera ändringarna i det tysta måste IT-personal ställa in det och deras chef godkänna det. Varje person som vet är en person som kan prata. Hur många på myndigheten vet om det i kväll, och kan ni lita på alla nu?"]),
              pb(["Not what the police agreed to", "Inte vad polisen gick med på"], ["The detective asked you to leave everything untouched. A silent block is your interpretation, not theirs. If the network notices, the police will say the agency acted on its own. Do you tell the police what you have done, and accept it if they say no?", "Utredaren bad er att lämna allt orört. En tyst blockering är er tolkning, inte deras. Om nätverket märker det kommer polisen att säga att myndigheten agerade på egen hand. Berättar ni för polisen vad ni har gjort, och accepterar ni ett nej?"])
            ],
            C: [
              pb(["A week of changes", "En vecka av ändringar"], ["For every working day the accounts stay open, the two caseworkers can change more account numbers, and each change waits in the system for the next payment. Who checks every change they make this week, and who stops the money if it matters?", "Varje arbetsdag som kontona står öppna kan de två handläggarna ändra fler kontonummer, och varje ändring väntar i systemet på nästa utbetalning. Vem kontrollerar varje ändring de gör den här veckan, och vem stoppar pengarna om det behövs?"]),
              pb(["“The agency knew”", "”Myndigheten visste”"], ["{{person.legal.name}} asks to record that the agency knowingly let two employees keep access to recipients' payment details after discovering the fraud. If one more person loses money this week, that note is the headline. Who signs this decision?", "{{person.legal.name}} vill få antecknat att myndigheten medvetet lät två anställda behålla åtkomsten till mottagarnas betalningsuppgifter efter att bedrägeriet upptäckts. Om ytterligare en person förlorar pengar den här veckan är den anteckningen rubriken. Vem skriver under beslutet?"]),
              pb(["Acting normal for a week", "Låtsas som ingenting i en vecka"], ["{{person.hr.name}} says the two have ordinary meetings, reviews and team days coming up this week. Every normal conversation now becomes a performance by managers who know. Can your managers act normally for a week with someone they know is under investigation?", "{{person.hr.name}} säger att de två har vanliga möten, avstämningar och gruppdagar inbokade den här veckan. Varje vanligt samtal blir nu ett skådespel av chefer som vet. Klarar era chefer att bete sig normalt i en vecka mot någon de vet utreds?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "C" }, ["Left untouched", "Lämnat orört"], [
              io(["The police are grateful", "Polisen är tacksam"], ["The detective calls back: because nothing was touched, they have already identified someone collecting cash from one of the receiving banks. They thank you for holding your nerve.", "Utredaren ringer tillbaka: eftersom inget rördes har de redan identifierat någon som tar ut kontanter från en av de mottagande bankerna. Hen tackar er för att ni höll nerverna i styr."], ["The police say your restraint has already given them a lead.", "Polisen säger att er återhållsamhet redan gett dem ett spår."]),
              io(["More changes", "Fler ändringar"], ["{{person.ciso.name}} is watching the log when one of the two accounts changes another batch of account numbers, this afternoon, after you knew.", "{{person.ciso.name}} tittar på loggen när ett av de två kontona ändrar ytterligare en omgång kontonummer, i eftermiddag, efter att ni visste."], ["The two accounts kept changing account numbers after you knew.", "De två kontona fortsatte att ändra kontonummer efter att ni visste."], { reopen: true, meters: { regulator: 1 } }),
              io(["A request to talk", "En begäran om samtal"], ["The caseworker who asked for a transfer last month asks her manager for a private talk “about something at work”. The police ask you to postpone it.", "Handläggaren som bad om omplacering förra månaden ber sin chef om ett enskilt samtal ”om en sak på jobbet”. Polisen ber er skjuta upp det."], ["One caseworker asked for a private talk; it was postponed at the police's request.", "En av handläggarna bad om ett enskilt samtal; det sköts upp på polisens begäran."])
            ]),
            ir("i2", { notChosen: "C" }, ["Not left as asked", "Inte orört som polisen bad"], [
              io(["The detective objects", "Utredaren invänder"], ["The detective learns that the agency has changed something on the two accounts and calls to say weeks of surveillance may now be compromised. They want to know who decided.", "Utredaren får veta att myndigheten ändrat något på de två kontona och ringer för att säga att veckor av spaning nu kan vara förstörda. Hen vill veta vem som beslutade."], ["The police say your action may have compromised their surveillance.", "Polisen säger att ert agerande kan ha förstört deras spaning."], { reopen: true }),
              io(["Nothing new", "Inget nytt"], ["In the hours after you act, no new suspicious account changes appear anywhere in the system. It looks as if the tap has been turned off.", "Under timmarna efter att ni agerat dyker inga nya misstänkta kontoändringar upp någonstans i systemet. Det ser ut som om kranen har stängts."], ["No new suspicious account changes appeared in the first hours after you acted.", "Inga nya misstänkta kontoändringar syntes under de första timmarna efter att ni agerat."]),
              io(["The union calls", "Facket ringer"], ["A union representative calls {{person.hr.name}}: a member says she feels watched at work and wants to know why. The representative asks whether the agency has something to tell her.", "En facklig företrädare ringer {{person.hr.name}}: en medlem säger att hon känner sig övervakad på jobbet och vill veta varför. Företrädaren frågar om myndigheten har något att berätta för henne."], ["A union representative has asked HR why a member feels watched.", "En facklig företrädare har frågat HR varför en medlem känner sig övervakad."])
            ])
          ]
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
          evaluation: [["Tells political leadership and the public what is true, in writing, even when it contradicts the minister", "Berättar för den politiska ledningen och allmänheten vad som är sant, skriftligt, även när det motsäger ministern"]],
          pushback: {
            A: [
              pb(["Contradicting the minister", "Att motsäga ministern"], ["Your statement will be read as the agency publicly contradicting its minister on the same evening as the promise. The state secretary calls back: “You could at least have waited until morning.” Do you still publish tonight, and how do you word it so it does not read as defiance?", "Ert besked kommer att läsas som att myndigheten offentligt motsäger sin minister samma kväll som löftet gavs. Statssekreteraren ringer tillbaka: ”Ni kunde åtminstone ha väntat till i morgon bitti.” Publicerar ni ändå i kväll, och hur formulerar ni det så att det inte låter som trots?"]),
              pb(["Everyone thinks it's them", "Alla tror att det gäller dem"], ["Saying tonight that some people will not be paid sends thousands of worried people to the phones, most of whom are not affected. You cannot tell them individually yet. Can you publish that “some” will not be paid without frightening everyone?", "Att säga i kväll att några inte får betalt får tusentals oroliga personer att ringa, och de flesta berörs inte. Ni kan ännu inte ge besked till var och en. Kan ni publicera att ”några” inte får betalt utan att skrämma alla?"]),
              pb(["How many, and why?", "Hur många, och varför?"], ["A journalist asks how many will not be paid, and why. You cannot explain without mentioning a fraud the police asked you to keep quiet about. How much can you publish tonight without harming the investigation?", "En journalist frågar hur många som inte får betalt, och varför. Ni kan inte förklara utan att nämna ett bedrägeri som polisen bett er hålla tyst om. Hur mycket kan ni publicera i kväll utan att skada utredningen?"])
            ],
            B: [
              pb(["Paying the network, knowingly", "Att medvetet betala nätverket"], ["{{person.securityOfficer.name}} reminds you that most of the held records are believed to be fraudulent. Paying them all means sending public money to criminal accounts tomorrow, knowingly. Who will sign the payment order, by name?", "{{person.securityOfficer.name}} påminner om att de flesta innehållna posterna bedöms vara bedrägliga. Att betala alla innebär att i morgon medvetet skicka offentliga medel till kriminellas konton. Vem skriver under betalningsordern, med namn?"]),
              pb(["The bank wants it in writing", "Banken vill ha det skriftligt"], ["The bank that rejected these exact records this afternoon now asks for written confirmation that the agency accepts the risk, and asks whether the police are aware. What do you put in writing to a bank that already flagged this as fraud?", "Banken som avvisade just de här posterna i eftermiddags begär nu en skriftlig bekräftelse på att myndigheten tar risken, och frågar om polisen känner till det. Vad skriver ni till en bank som redan har flaggat det här som bedrägeri?"]),
              pb(["The agency answers, not the minister", "Myndigheten svarar, inte ministern"], ["{{person.legal.name}} warns that the agency, not the minister, is legally responsible for every payment it makes. A written confirmation tonight makes the agency's leadership answerable for each wrongful one. Is keeping a promise you never made worth that?", "{{person.legal.name}} varnar för att det är myndigheten, inte ministern, som rättsligt ansvarar för varje utbetalning. En skriftlig bekräftelse i kväll gör myndighetens ledning ansvarig för varenda felaktig. Är det värt det för att hålla ett löfte ni aldrig gav?"])
            ],
            C: [
              pb(["The promise is repeated", "Löftet upprepas"], ["An hour after your private briefing, the minister's press office repeats the promise in a written statement. Recipients still believe everyone will be paid. Is your duty done once you have told the ministry, or do you owe the public the truth directly?", "En timme efter er genomgång i förtroende upprepar ministerns pressavdelning löftet i ett skriftligt uttalande. Mottagarna tror fortfarande att alla får betalt. Är er plikt fullgjord när ni har berättat för departementet, eller är ni skyldiga allmänheten sanningen direkt?"]),
              pb(["“Not by email, please”", "”Inte via mejl, tack”"], ["The state secretary thanks you for the facts but asks you not to put them in an email, “to avoid leaks”. If tomorrow goes wrong, there will be no record that you told them. Do you insist on writing it down, against the ministry's wish?", "Statssekreteraren tackar för uppgifterna men ber er att inte skicka dem via mejl, ”för att undvika läckor”. Om morgondagen går fel finns det inget som visar att ni berättade. Insisterar ni på att skriva ner det, mot departementets vilja?"]),
              pb(["People are planning on it", "Folk planerar efter det"], ["People whose payments are held are making plans tonight based on the minister's words: bills on direct debit, money promised to others. Tomorrow they will find out from their bank balance that the promise was wrong, and that you knew. How will you explain to them why you kept quiet?", "Personer vars utbetalningar hålls inne planerar i kväll utifrån ministerns ord: räkningar på autogiro, pengar som lovats bort. I morgon får de veta via saldot att löftet var fel, och att ni visste. Hur förklarar ni för dem varför ni teg?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "B" }, ["Paying the held records", "De innehållna posterna betalas"], [
              io(["A quiet night", "En lugn kväll"], ["The bank takes the full file without further objection, and the state secretary sends a short thank-you. For tonight, the minister's promise stands.", "Banken tar emot hela filen utan fler invändningar, och statssekreteraren skickar ett kort tack. I kväll står ministerns löfte fast."], ["The bank accepted the full file; the ministry thanked you.", "Banken godtog hela filen; departementet tackade er."]),
              io(["The police warn you", "Polisen varnar"], ["The detective hears that you are releasing the held records and warns that paying the network knowingly could put the agency itself in the money trail. They ask you to think again tonight.", "Utredaren får höra att ni släpper de innehållna posterna och varnar för att myndigheten själv kan hamna i pengaspåret om ni medvetet betalar nätverket. Hen ber er tänka om i kväll."], ["The police have warned that paying the held records may implicate the agency.", "Polisen har varnat för att betalningen av de innehållna posterna kan göra myndigheten delaktig."], { reopen: true, meters: { regulator: 1 } }),
              io(["Someone has talked", "Någon har pratat"], ["A journalist calls {{person.comms.name}} asking whether the agency is about to pay accounts the bank flagged as fraud. Nobody knows who told them.", "En journalist ringer {{person.comms.name}} och frågar om myndigheten tänker betala konton som banken flaggat som bedrägeri. Ingen vet vem som har berättat."], ["A journalist is asking whether you paid accounts the bank flagged.", "En journalist frågar om ni betalat konton som banken flaggat."], { meters: { media: 1 } })
            ]),
            ir("i2", { notChosen: "B" }, ["The promise will break", "Löftet kommer att brytas"], [
              io(["“Find a way”", "”Hitta en lösning”"], ["The state secretary calls again: the minister will not take the promise back and expects the agency to “find a way” by morning. The call ends before you can answer.", "Statssekreteraren ringer igen: ministern tänker inte ta tillbaka löftet och förväntar sig att myndigheten ”hittar en lösning” till i morgon bitti. Samtalet avslutas innan ni hinner svara."], ["The ministry still expects every person to be paid tomorrow.", "Departementet förväntar sig fortfarande att varenda person får betalt i morgon."], { reopen: true }),
              io(["Softer words", "Mjukare ord"], ["Late in the evening, the ministry's website quietly changes “every single person” to “the vast majority”. Nobody calls to tell you.", "Sent på kvällen ändras ”varenda person” i tysthet till ”de allra flesta” på departementets webbplats. Ingen ringer och berättar det för er."], ["The ministry quietly softened the promise on its website.", "Departementet mildrade i tysthet löftet på sin webbplats."]),
              io(["Silence from above", "Tystnad uppifrån"], ["The ministry stops answering. By midnight nobody there has replied to your message, and you do not know what the minister will say in the morning.", "Departementet slutar svara. Vid midnatt har ingen där svarat på ert meddelande, och ni vet inte vad ministern kommer att säga i morgon bitti."], ["The ministry had not replied to you by midnight.", "Departementet hade inte svarat er vid midnatt."])
            ])
          ]
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
          evaluation: [["Protects every payment that relies on the register, without punishing the people who changed banks honestly", "Skyddar varje utbetalning som bygger på registret, utan att straffa dem som bytt bank av ärliga skäl"]],
          pushback: {
            A: [
              pb(["Thousands of letters", "Tusentals brev"], ["Contacting everyone who changed accounts in four months means reaching thousands of people, most of whom changed banks for ordinary reasons. The contact centre cannot get through them before the next payment. How many honest people go without money while you work through the list?", "Att kontakta alla som bytt konto på fyra månader innebär att nå tusentals personer, de flesta med helt vanliga skäl. Kontaktcentret hinner inte igenom dem före nästa utbetalning. Hur många ärliga personer står utan pengar medan ni betar av listan?"]),
              pb(["Contact could endanger", "Kontakten kan utsätta"], ["A shelter network warns that some of the people it supports changed accounts precisely so that an abusive partner could not reach their money. A letter or call to an old address or shared number could reach the wrong person. How do you contact them without putting them at risk?", "Ett nätverk av skyddade boenden varnar för att en del av dem de stöttar bytte konto just för att en våldsam partner inte skulle komma åt pengarna. Ett brev eller samtal till en gammal adress eller ett delat nummer kan nå fel person. Hur kontaktar ni dem utan att utsätta dem för fara?"]),
              pb(["Contact details from where?", "Kontaktuppgifter varifrån?"], ["To contact each person you will use the details in the register, the same register the caseworkers could edit. If phone numbers or addresses were changed too, you will be verifying with the fraudsters. How do you know the contact details are real?", "För att kontakta var och en använder ni uppgifterna i registret, samma register som handläggarna kunde ändra i. Om telefonnummer eller adresser också ändrats kommer ni att verifiera mot bedragarna. Hur vet ni att kontaktuppgifterna är äkta?"])
            ],
            B: [
              pb(["What if there is a third?", "Tänk om det finns en tredje?"], ["The two caseworkers are the ones you know about. If the network recruited anyone else, their changes sit in the “review by risk” pile, and the next payment may go out before anyone reaches them. How sure are you that two is the whole story?", "De två handläggarna är de ni känner till. Om nätverket har rekryterat någon mer ligger deras ändringar i högen ”granska efter risk”, och nästa utbetalning kan gå ut innan någon hunnit dit. Hur säkra är ni på att två är hela historien?"]),
              pb(["Who defines risk?", "Vem definierar risk?"], ["{{person.serviceOwner.name}} asks what “by risk” means in practice: by bank, by date, by amount? Each rule leaves a gap the network could have used, and there is little time to agree on them. Who sets the criteria, and on what evidence?", "{{person.serviceOwner.name}} frågar vad ”efter risk” betyder i praktiken: per bank, per datum, per belopp? Varje regel lämnar en lucka som nätverket kan ha utnyttjat, och det finns lite tid att enas. Vem bestämmer kriterierna, och utifrån vilka belägg?"]),
              pb(["Not enough for the others", "Inte nog för de andra"], ["When the two other agencies hear you are freezing only the two caseworkers' changes, one says that is not enough to protect its payments and asks you to freeze more. Their run is in nine days. Do you widen your freeze for their sake, or defend your narrower line?", "När de två andra myndigheterna hör att ni bara fryser de två handläggarnas ändringar säger den ena att det inte räcker för att skydda dess utbetalningar, och ber er frysa mer. Deras utbetalning sker om nio dagar. Vidgar ni frysningen för deras skull, eller försvarar ni er snävare linje?"])
            ],
            C: [
              pb(["It is your register", "Det är ert register"], ["{{person.legal.name}} points out that the register belongs to your agency; the other two only read from it. Leaving the decision to them does not move the responsibility for its contents. If they pay the network in nine days, whose failure is it?", "{{person.legal.name}} påpekar att registret tillhör er myndighet; de andra två läser bara från det. Att lämna beslutet till dem flyttar inte ansvaret för innehållet. Om de betalar nätverket om nio dagar, vems misslyckande är det då?"]),
              pb(["Three agencies, three answers", "Tre myndigheter, tre svar"], ["One agency freezes everything, the other freezes nothing, and the same person can be paid by one and held by the other. Journalists notice within a day. Can you defend a split response to one fraud in one register?", "En myndighet fryser allt, den andra ingenting, och samma person kan få betalt av den ena och hållas inne av den andra. Journalister märker det inom ett dygn. Kan ni försvara olika svar på ett bedrägeri i ett register?"]),
              pb(["And your own payments?", "Och era egna utbetalningar?"], ["Warning the others is not a decision about your own three affected benefits. Changed accounts in your own payments are still active, and your own next runs are coming. What exactly are you doing with them while the others decide?", "Att varna de andra är inget beslut om era egna tre drabbade ersättningar. Ändrade konton i era egna utbetalningar är fortfarande aktiva, och era nästa utbetalningar närmar sig. Vad gör ni exakt med dem medan de andra bestämmer sig?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The wide freeze", "Den breda frysningen"], [
              io(["The others follow", "De andra följer efter"], ["Both other agencies adopt your freeze list for their next payment run. One thanks you for acting before they had to ask.", "Båda de andra myndigheterna använder er frysningslista för sin nästa utbetalning. Den ena tackar er för att ni agerade innan de hann be om det."], ["Both other agencies are using your freeze list for their next run.", "Båda de andra myndigheterna använder er frysningslista för sin nästa utbetalning."]),
              io(["Caught by the freeze", "Fast i frysningen"], ["A shelter calls: a resident who changed accounts to escape a violent partner is now without money, and has been told to confirm the new account at the phone number in the register.", "Ett skyddat boende ringer: en boende som bytte konto för att komma undan en våldsam partner står nu utan pengar, och har fått beskedet att bekräfta det nya kontot via telefonnumret i registret."], ["A person who fled violence is without money because of the freeze.", "En person som flytt våld står utan pengar på grund av frysningen."], { reopen: true, meters: { trust: -1 } }),
              io(["Identical callers", "Likadana samtal"], ["Within hours, the contact centre gets calls from people insisting their changed account is genuine. Several use almost exactly the same words.", "Inom några timmar får kontaktcentret samtal från personer som hävdar att deras ändrade konto är äkta. Flera använder nästan exakt samma ord."], ["Some callers defending changed accounts use near-identical wording.", "En del som försvarar ändrade konton använder nästan identiska formuleringar."])
            ]),
            ir("i2", { notChosen: "A" }, ["Changes left active", "Ändringar som ligger kvar"], [
              io(["A partner agency will pay", "En annan myndighet betalar"], ["One of the other agencies says it cannot build its own checks in nine days. Unless you freeze the records in the register yourselves, it will pay from it as normal.", "En av de andra myndigheterna säger att den inte hinner bygga egna kontroller på nio dagar. Om ni inte själva fryser posterna i registret betalar den ut som vanligt utifrån det."], ["One partner agency will pay from the register as it stands unless you act.", "En annan myndighet betalar utifrån registret som det är om ni inte agerar."], { reopen: true }),
              io(["Nothing more found", "Inget mer hittas"], ["A first quick search finds nothing suspicious outside the two caseworkers' changes. The room starts to believe the problem is contained.", "En första snabb sökning hittar inget misstänkt utöver de två handläggarnas ändringar. Rummet börjar tro att problemet är avgränsat."], ["A first quick search found nothing beyond the two caseworkers' changes.", "En första snabb sökning hittade inget utöver de två handläggarnas ändringar."]),
              io(["A journalist asks", "En journalist frågar"], ["A journalist asks why changed accounts are still active when the agency already knows the fraud has run for months.", "En journalist frågar varför ändrade konton fortfarande är aktiva när myndigheten redan vet att bedrägeriet pågått i månader."], ["A journalist is asking why changed accounts are still active.", "En journalist frågar varför ändrade konton fortfarande är aktiva."], { meters: { media: 1 } })
            ])
          ]
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
          evaluation: [["Gets money to people in real need quickly without opening a new route for fraud", "Får snabbt ut pengar till personer i verklig nöd utan att öppna en ny väg för bedrägeri"]],
          pushback: {
            A: [
              pb(["Not today", "Inte i dag"], ["“From tomorrow” means that today, on payday, nobody gets help. The mother who cannot buy medicine for her child is told to come in tomorrow. What do you offer the most urgent cases today?", "”Från i morgon” betyder att ingen får hjälp i dag, på utbetalningsdagen. Mamman som inte kan köpa medicin till sitt barn får höra att hon ska komma in i morgon. Vad erbjuder ni de mest brådskande fallen i dag?"]),
              pb(["Queues and distances", "Köer och avstånd"], ["Some local offices are hours away from the people they serve, and many recipients are sick, disabled or caring for small children. A queue out the door on the first morning will be on the news. How do people who cannot travel get paid?", "En del lokalkontor ligger flera timmar bort från dem de betjänar, och många mottagare är sjuka, har en funktionsnedsättning eller tar hand om små barn. En kö ut genom dörren första morgonen blir en nyhet. Hur får de som inte kan resa sina pengar?"]),
              pb(["Borrowed ID at the counter", "Lånad legitimation vid disken"], ["{{person.securityOfficer.name}} warns that a network able to recruit caseworkers can just as easily send people with forged or borrowed ID to a counter. Who at the local offices is trained to spot that by tomorrow morning?", "{{person.securityOfficer.name}} varnar för att ett nätverk som kan rekrytera handläggare lika gärna kan skicka folk med förfalskad eller lånad legitimation till en disk. Vem på lokalkontoren är utbildad att upptäcka det till i morgon bitti?"])
            ],
            B: [
              pb(["Whose e-ID?", "Vems e-legitimation?"], ["If the network opened the new bank accounts, it may also control e-IDs in the recipients' names. {{person.ciso.name}} cannot rule it out today. Do you pay out to an identity you cannot be sure belongs to the person on the phone?", "Om nätverket öppnade de nya bankkontona kan det också styra e-legitimationer i mottagarnas namn. {{person.ciso.name}} kan inte utesluta det i dag. Betalar ni ut till en identitet som ni inte säkert vet tillhör personen i telefonen?"]),
              pb(["It sounds like the phishing", "Det låter som nätfisket"], ["Your message says “verify with e-ID to get your money today”; the fraudsters' texts say “confirm your details to get it today”. Many recipients cannot tell the two apart. How do you open a fast route without teaching people to click the phishing link?", "Ert meddelande säger ”verifiera med e-legitimation för att få pengarna i dag”; bedragarnas sms säger ”bekräfta dina uppgifter för att få dem i dag”. Många mottagare kan inte skilja dem åt. Hur öppnar ni en snabb väg utan att lära folk att klicka på nätfiskelänken?"]),
              pb(["Who counts as urgent?", "Vem räknas som brådskande?"], ["Staff on the phones must decide who is urgent, with no criteria, under {{num.calls|number}} calls. Callers are already comparing notes online about what to say to be paid today. Who draws the line, and how do you defend it to those turned away?", "Personalen i telefon måste avgöra vem som är brådskande, utan kriterier, med {{num.calls|number}} samtal i kö. De som ringer jämför redan på nätet vad man ska säga för att få betalt i dag. Vem drar gränsen, och hur försvarar ni den inför dem som nekas?"])
            ],
            C: [
              pb(["No exceptions, by name", "Inga undantag, med namn"], ["The mother who cannot buy medicine for her child is told to wait five working days. Her story will be on the news by evening. Can you stand behind “no exceptions” when a reporter asks you about her directly?", "Mamman som inte kan köpa medicin till sitt barn får höra att hon ska vänta fem arbetsdagar. Hennes berättelse är en nyhet innan kvällen. Kan ni stå för ”inga undantag” när en reporter frågar er om just henne?"]),
              pb(["The gap the fraudsters fill", "Luckan som bedragarna fyller"], ["For five days, thousands of people without money will keep receiving texts that promise payment today. Some will click, and lose more. Does waiting protect them, or push them toward the fraudsters?", "I fem dagar kommer tusentals personer utan pengar att fortsätta få sms som lovar utbetalning i dag. En del kommer att klicka, och förlora mer. Skyddar väntan dem, eller driver den dem till bedragarna?"]),
              pb(["Five days is a guess", "Fem dagar är en gissning"], ["{{person.serviceOwner.name}} says manually verifying every held record needs more trained staff than the agency has free, and the contact centre needs the same people. Nobody has calculated the five days. What do you say to people on day six?", "{{person.serviceOwner.name}} säger att manuell verifiering av varje innehållen post kräver mer utbildad personal än myndigheten har lediga, och kontaktcentret behöver samma personer. Ingen har räknat på de fem dagarna. Vad säger ni till folk dag sex?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "B" }, ["Paying by e-ID", "Utbetalning via e-legitimation"], [
              io(["It works", "Det fungerar"], ["By mid-afternoon several hundred urgent cases have been verified and paid. The mother who called about medicine for her child has her money.", "Vid mitten av eftermiddagen har flera hundra brådskande fall verifierats och fått betalt. Mamman som ringde om medicin till sitt barn har fått sina pengar."], ["Several hundred urgent cases were paid today through e-ID.", "Flera hundra brådskande fall fick betalt i dag via e-legitimation."], { meters: { trust: 1 } }),
              io(["A flagged account paid", "Ett flaggat konto betalt"], ["{{person.ciso.name}} finds that one of today's e-ID payments went to an account the bank flagged yesterday. Someone verified as the recipient, but probably was not.", "{{person.ciso.name}} upptäcker att en av dagens utbetalningar via e-legitimation gick till ett konto som banken flaggade i går. Någon verifierade sig som mottagaren, men var det troligen inte."], ["At least one e-ID payment today went to a flagged account.", "Minst en utbetalning via e-legitimation i dag gick till ett flaggat konto."], { reopen: true }),
              io(["The phishing adapts", "Nätfisket anpassar sig"], ["Within the hour a new text goes out: “Verify with e-ID to get your money today”, linking to a fake login page that looks like yours.", "Inom en timme går ett nytt sms ut: ”Verifiera med e-legitimation för att få dina pengar i dag”, med en länk till en falsk inloggningssida som liknar er."], ["The phishing texts now copy your e-ID wording.", "Nätfiske-sms:en kopierar nu er formulering om e-legitimation."])
            ]),
            ir("i2", { notChosen: "B" }, ["No money today", "Inga pengar i dag"], [
              io(["On the evening news", "I kvällsnyheterna"], ["The mother who could not buy medicine tells her story on the evening news. The agency's only line is “we are working on it”.", "Mamman som inte kunde köpa medicin berättar sin historia i kvällsnyheterna. Myndighetens enda besked är ”vi arbetar med saken”."], ["A recipient without money told her story on the evening news.", "En mottagare utan pengar berättade sin historia i kvällsnyheterna."], { meters: { media: 1 } }),
              io(["Bridging help", "Hjälp att klara dagen"], ["Local charities and the municipality's emergency aid offer bridging money, and the worst cases are covered for now. The pressure on the phones eases a little.", "Lokala hjälporganisationer och kommunens nödbistånd erbjuder pengar att klara sig på, och de svåraste fallen är täckta för stunden. Trycket på telefonerna lättar något."], ["Charities and municipal aid are covering some urgent cases for now.", "Hjälporganisationer och kommunalt bistånd täcker tills vidare en del brådskande fall."]),
              io(["People click", "Folk klickar"], ["The bank reports dozens of recipients who logged in through the phishing link today. Several accounts have already been emptied.", "Banken rapporterar att dussintals mottagare loggade in via nätfiskelänken i dag. Flera konton har redan tömts."], ["Several recipients lost money to the phishing today.", "Flera mottagare förlorade pengar till nätfisket i dag."], { reopen: true, meters: { trust: -1 } })
            ])
          ]
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
          evaluation: [["Owns the past decision openly and fixes the control, rather than waiting to be judged", "Tar öppet ansvar för det tidigare beslutet och åtgärdar kontrollen, i stället för att vänta på att bli bedömd"]],
          pushback: {
            A: [
              pb(["It points at someone", "Den pekar ut någon"], ["The report shows who deferred the recommendation, and that person still sits in the agency's leadership. Publishing it effectively names them before the supervisor has reached any conclusion. Do you publish anyway, and what do you say to that colleague first?", "Rapporten visar vem som sköt upp rekommendationen, och den personen sitter fortfarande i myndighetens ledning. Att publicera den pekar i praktiken ut hen innan tillsynsmyndigheten dragit någon slutsats. Publicerar ni ändå, och vad säger ni först till den kollegan?"]),
              pb(["A new backlog", "En ny kö"], ["Dual approval introduced overnight doubles the work on every account change, and the queue of genuine changes is already long after the freeze. People who need a new account for safety wait even longer. How do you bring in the control without creating a new backlog?", "Dubbelt godkännande infört över en natt fördubblar arbetet med varje kontoändring, och kön av äkta ändringar är redan lång efter frysningen. De som behöver ett nytt konto av säkerhetsskäl får vänta ännu längre. Hur inför ni kontrollen utan att skapa en ny kö?"]),
              pb(["Ahead of the verdict", "Före utlåtandet"], ["{{reg.supervisor|cap}} lets you know it would have preferred to receive the report within its review before you published it. Going public now may look like trying to get ahead of its verdict. Is openness worth irritating the body that will judge you?", "{{reg.supervisor|cap}} låter er veta att den hellre hade fått rapporten inom ramen för sin granskning innan ni publicerade den. Att gå ut nu kan se ut som ett försök att hinna före utlåtandet. Är öppenheten värd att irritera den som ska bedöma er?"])
            ],
            B: [
              pb(["They have it anyway", "De har den ändå"], ["The journalist already holds the full report and publishes on Sunday. Readers will see the whole text next to your answers and judge what you left out. Why not publish it yourselves?", "Journalisten har redan hela rapporten och publicerar på söndag. Läsarna kommer att se hela texten bredvid era svar och bedöma vad ni utelämnade. Varför inte publicera den själva?"]),
              pb(["A public records request", "En begäran om allmän handling"], ["A second journalist requests the report as a public document. {{person.legal.name}} says it will probably have to be released within days. Are you holding back something you cannot legally hold back for long?", "En andra journalist begär ut rapporten som allmän handling. {{person.legal.name}} säger att den troligen måste lämnas ut inom några dagar. Håller ni inne något som ni rättsligt inte kan hålla inne länge?"]),
              pb(["The union's question", "Fackets fråga"], ["The union for the caseworker who says she was threatened demands that the agency also explain what it did with her request for help a month earlier. Your answers to the journalist say nothing about it. Do you answer that too, before someone else does?", "Facket för handläggaren som säger att hon hotades kräver att myndigheten också förklarar vad den gjorde med hennes begäran om hjälp en månad tidigare. Era svar till journalisten säger ingenting om det. Svarar ni på det också, innan någon annan gör det?"])
            ],
            C: [
              pb(["Sunday comes first", "Söndagen kommer först"], ["The supervisor's review will take months; the article comes out on Sunday. “No comment until the review” will be the agency's only answer in print, next to the audit. Can you live with that being your only public word?", "Tillsynsmyndighetens granskning tar månader; artikeln kommer på söndag. ”Ingen kommentar innan granskningen” blir myndighetens enda svar i tryck, bredvid revisionen. Kan ni leva med att det är ert enda offentliga ord?"]),
              pb(["Fix it or not?", "Åtgärda eller inte?"], ["If you introduce dual approval now, everyone will read it as an admission; if you do not, the next recruited insider has the same opportunity. Waiting does not answer that. Which is it?", "Om ni inför dubbelt godkännande nu läser alla det som ett medgivande; om ni inte gör det har nästa rekryterade insider samma möjlighet. Att vänta besvarar inte den frågan. Vilket blir det?"]),
              pb(["Protecting whom?", "Skyddar vem?"], ["Staying silent also shields the manager who deferred the control and still sits in leadership. Staff are already asking whether the silence is about the agency or about one person. How do you show it is not a cover-up?", "Att tiga skyddar också chefen som sköt upp kontrollen och fortfarande sitter i ledningen. Personalen frågar redan om tystnaden handlar om myndigheten eller om en person. Hur visar ni att det inte är en mörkläggning?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The audit is public", "Revisionen är offentlig"], [
              io(["Noted by the supervisor", "Tillsynen noterar det"], ["{{reg.supervisor|cap}} writes in a public letter that the agency disclosed the audit itself, and says it will take that into account.", "{{reg.supervisor|cap}} skriver i ett offentligt brev att myndigheten själv lämnade ut revisionen, och att det kommer att vägas in."], ["The supervisor publicly noted that you disclosed the audit yourselves.", "Tillsynsmyndigheten noterade offentligt att ni själva lämnade ut revisionen."], { meters: { regulator: -1 } }),
              io(["Leadership splits", "Ledningen splittras"], ["The report names the deputy director general. Half the leadership team asks whether the agency has thrown one person to the wolves, and the board asks you to explain before anything more is said.", "Rapporten pekar ut den biträdande generaldirektören. Halva ledningsgruppen frågar om myndigheten har kastat en person åt vargarna, och styrelsen ber er förklara er innan något mer sägs."], ["The board has asked you to explain why the report was published in full.", "Styrelsen har bett er förklara varför rapporten publicerades i sin helhet."], { reopen: true }),
              io(["One line quoted", "En mening citeras"], ["Commentators quote only the line about saving money. The report's reasons and the rest of its recommendations go unmentioned.", "Kommentatorerna citerar bara meningen om att spara pengar. Rapportens skäl och resten av dess rekommendationer nämns inte."], ["Coverage quotes only the line about saving money.", "Bevakningen citerar bara meningen om att spara pengar."], { meters: { media: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["The report stays in-house", "Rapporten stannar internt"], [
              io(["The journalist publishes", "Journalisten publicerar"], ["The journalist publishes the full report, with a box listing everything the agency has not said about it.", "Journalisten publicerar hela rapporten, med en faktaruta över allt som myndigheten inte har sagt om den."], ["The full audit is public through the journalist, not through you.", "Hela revisionen är offentlig via journalisten, inte via er."], { reopen: true, meters: { media: 1 } }),
              io(["The supervisor asks", "Tillsynen begär in"], ["{{reg.supervisor|cap}} asks for the report and every decision document behind the deferral within a week.", "{{reg.supervisor|cap}} begär in rapporten och varje beslutsunderlag bakom uppskjutandet inom en vecka."], ["The supervisor has demanded the report and the deferral decisions.", "Tillsynsmyndigheten har begärt in rapporten och besluten om uppskjutandet."], { meters: { regulator: 1 } }),
              io(["Little attention", "Liten uppmärksamhet"], ["Sunday's article lands on a busy news day and draws little attention. Leadership says the storm has passed.", "Söndagens artikel kommer en nyhetstung dag och får liten uppmärksamhet. Ledningen säger att stormen har dragit förbi."], ["The article drew little attention on the day it ran.", "Artikeln fick liten uppmärksamhet den dag den publicerades."])
            ])
          ]
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
