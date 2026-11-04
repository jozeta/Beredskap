/*
 * b18-insurer-ransomware.js — "Insured by Us, Hit by Them" (branching, insurance).
 *
 * A cyber insurer is hit by the same ransomware group that is attacking its clients,
 * and the group has copied the cyber book: which client is covered for how much ransom.
 * Spine: first move → the cyber book → the demand → clients asking for ransom
 * approvals → notification → the journalist → recovery → clients extorted with your
 * data → the board → what changes. Break-away at § "The journalist": denying that
 * client data was taken.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b18-insurer-ransomware",
    version: 1,
    format: "branching",
    category: "insurer-ransomware",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "insurer-ransomware",
    title: L(["Insured by Us, Hit by Them", "Försäkrade av oss, drabbade av dem"]),
    summary: L([
      "You sell cyber insurance. This morning the ransomware group your clients fear most is inside your own network, and it has copied the list of every client and how much ransom their policy will pay. Every choice you make, your clients will watch.",
      "Ni säljer cyberförsäkringar. I morse är den utpressningsgrupp som era kunder fruktar mest inne i ert eget nät, och den har kopierat listan över varje kund och hur mycket lösensumma deras försäkring betalar. Varje val ni gör kommer era kunder att följa."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Contain ransomware while keeping critical claims running", "Begränsa utpressningsprogram och samtidigt hålla kritiska skadeärenden igång"]), teaser: L(["Your own advice, tested", "Era egna råd, på prov"]) },
      { id: "lo2", text: L(["Protect clients whose stolen data makes them targets", "Skydda kunder som blir måltavlor genom stulna uppgifter"]), teaser: L(["When your data arms the attacker", "När era uppgifter beväpnar angriparen"]) },
      { id: "lo3", text: L(["Decide on extortion consistently with what you tell others", "Besluta om utpressning i linje med det ni säger till andra"]), teaser: L(["Practising what you sell", "Att leva som man lär"]) },
      { id: "lo4", text: L(["Communicate honestly with clients, brokers, regulators and the press", "Kommunicera ärligt med kunder, mäklare, myndigheter och press"]), teaser: L(["Many audiences, one truth", "Många mottagare, en sanning"]) }
    ],
    mitre: ["T1133", "T1078", "T1486", "T1567", "T1657"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.RA", "PR.DS", "RS.MA", "RS.CO", "RC.RP"],
      iso27001: ["A.5.24", "A.5.26", "A.5.29", "A.5.34", "A.8.13", "A.8.16"]
    },
    constraints: { startWindow: "monday-morning", startTime: "06:40", sectors: ["insurance"] },
    actor: { types: ["criminal"], motivation: L(["Financial: extort the insurer, then its clients, using the insurer's own records", "Ekonomisk: pressa försäkringsbolaget, och sedan dess kunder, med bolagets egna uppgifter"]), capability: "high" },
    variables: {
      clients: { min: 400, max: 6000, scaleBy: "size", step: 10 },
      demand: { min: 3000000, max: 60000000, scaleBy: "size", step: 100000, currency: true },
      claimsOpen: { min: 600, max: 9000, scaleBy: "size", step: 10 },
      extorted: { min: 3, max: 12 }
    },
    roles: ["incidentCommander", "ciso", "cio", "ceo", "cfo", "itOps", "serviceOwner", "legal", "dpo", "comms", "supplierManager"],

    flags: {
      isolated: L(["Network isolated at once", "Nätet isolerat direkt"]),
      reinsurerFirst: L(["Called the reinsurer's hotline first", "Ringde återförsäkrarens jourlinje först"]),
      clientsWarned: L(["Cyber clients warned the same day", "Cyberkunderna varnade samma dag"]),
      candidWithClient: L(["Told an extorted client the data came from you", "Berättade för en utpressad kund att uppgifterna kom från er"]),
      refused: L(["Refused to pay", "Vägrade betala"]),
      negotiating: L(["Opened negotiations to buy time", "Inledde förhandlingar för att vinna tid"]),
      paid: L(["Paid the ransom", "Betalade lösensumman"]),
      refusalReversed: L(["Reversed the refusal and paid", "Ändrade sig och betalade"]),
      manualClaims: L(["Urgent claims approved on paper", "Brådskande skador godkända på papper"]),
      honoured: L(["Honoured clients' ransom cover as written", "Godkände kundernas lösensummeskydd enligt villkoren"]),
      overrode: L(["Told clients not to pay, whatever the policy says", "Sa åt kunderna att inte betala, oavsett villkoren"]),
      notified: L(["Notified the regulator in time", "Anmält till tillsynsmyndigheten i tid"]),
      notifyLate: L(["Notification delayed", "Anmälan försenad"]),
      denied: L(["Decided not to notify", "Beslutat att inte anmäla"]),
      rebuilt: L(["Claims system rebuilt clean", "Skadesystemet återuppbyggt rent"]),
      acceptedLiability: L(["Accepted a share of liability", "Accepterade en del av ansvaret"]),
      openLessons: L(["Shared its own lessons with clients", "Delade sina egna lärdomar med kunderna"])
    },

    start: "c1",
    pages: [
      pg("c1", ["Your own advice", "Era egna råd"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The claims system will not open. On the file servers, every folder holds the same text file, and the ransom note is signed by a group your cyber underwriters know well: in the last month it has hit six of {{org.name}}'s own cyber-insurance clients.\n\n{{person.itOps.name}} can still see some servers encrypting. There are {{num.claimsOpen|number}} open claims, a few of them from clients in the middle of their own ransomware incidents.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Skadesystemet går inte att öppna. På filservrarna innehåller varje mapp samma textfil, och utpressningsbrevet är undertecknat av en grupp som era cyberförsäkringstecknare känner väl: den senaste månaden har den drabbat sex av {{org.name}}s egna kunder med cyberförsäkring.\n\n{{person.itOps.name}} ser fortfarande några servrar som krypteras. Det finns {{num.claimsOpen|number}} öppna skadeärenden, några av dem från kunder som är mitt i sina egna incidenter med utpressningsprogram."
      ], {
        injects: [
          inj("b18-1", 0, "ransomNote", "attacker", "critical", "confirmed", [
            "“Your network is encrypted and we have your data, including your cyber portfolio. You know how this works better than anyone. Contact us within 72 hours.”",
            "”Ert nät är krypterat och vi har era uppgifter, inklusive er cyberportfölj. Ni vet bättre än någon hur det här fungerar. Kontakta oss inom 72 timmar.”"
          ], { headline: ["Note on every file server", "Brev på varje filserver"], tests: ["lo1"] })
        ],
        discuss: [q("What would you tell a client who called you with this exact morning?", "Vad skulle ni säga till en kund som ringde er med exakt den här morgonen?", ["ciso", "serviceOwner"])],
        facilitator: { notes: L(["The room has given this advice to clients for years. Watch whether it follows its own advice.", "Rummet har gett kunderna de här råden i åratal. Se om det följer sina egna råd."]) },
        choice: ask(["What is your first move?", "Vad är ert första drag?"], ["Isolates fast, as it tells clients to, while keeping a path for urgent claims.", "Isolerar snabbt, som den säger åt kunderna, men behåller en väg för brådskande skador."], [
          opt(["Isolate the network now and start your incident response plan", "Isolera nätet nu och starta er incidentplan"], "c2", ["What you tell every client to do. Claims stop with it.", "Det ni säger åt varje kund att göra. Skadeärendena stannar med det."], { set: "isolated" }),
          opt(["Isolate the infected servers only and keep the claims system's network up", "Isolera bara de infekterade servrarna och låt skadesystemets nät vara uppe"], "c2", ["Keeps claims moving, if the spread really stops there.", "Håller skadeärendena igång, om spridningen verkligen stannar där."]),
          opt(["Call your own insurer's incident hotline first, as your policy requires", "Ring ert eget försäkringsbolags incidentlinje först, som er försäkring kräver"], "c2", ["Protects your cover, and costs minutes while servers encrypt.", "Skyddar ert eget skydd, och kostar minuter medan servrarna krypteras."], { set: "reinsurerFirst" })
        ])
      }),

      pg("c2", ["The cyber book", "Cyberportföljen"], [
        "{{person.ciso.name}}'s team finds the staging folder the attackers used. Before encrypting anything, they copied the underwriting files for the cyber book: {{num.clients|number}} clients, their security questionnaires, their policy limits and, line by line, how much ransom each policy will reimburse.\n\nIn other words, the group now knows which of your clients can afford to pay, and exactly how much.",
        "{{person.ciso.name}}s team hittar mappen som angriparna använde för att samla ihop data. Innan något krypterades kopierade de riskbedömningsakterna för cyberportföljen: {{num.clients|number}} kunder, deras säkerhetsformulär, deras försäkringsbelopp och, rad för rad, hur mycket lösensumma varje försäkring ersätter.\n\nMed andra ord vet gruppen nu vilka av era kunder som har råd att betala, och exakt hur mycket."
      ], {
        variants: [vr("isolated", [
          "With the network isolated, the encryption has stopped spreading, and {{person.ciso.name}}'s team can work in peace. They find the staging folder: before encrypting anything, the attackers copied the underwriting files for {{num.clients|number}} cyber clients, including each policy's ransom cover.\n\nThe group now knows which of your clients can afford to pay, and exactly how much.",
          "Med nätet isolerat har krypteringen slutat sprida sig, och {{person.ciso.name}}s team kan arbeta i lugn och ro. De hittar mappen där data samlades: innan något krypterades kopierade angriparna riskbedömningsakterna för {{num.clients|number}} cyberkunder, inklusive varje försäkrings lösensummeskydd.\n\nGruppen vet nu vilka av era kunder som har råd att betala, och exakt hur mycket."
        ], ["Because you isolated at once, the encryption stopped early.", "Eftersom ni isolerade direkt stoppades krypteringen tidigt."])],
        chart: { id: "b18-kpi", type: "kpi", title: L(["What they took", "Vad de tog"]), data: kpi([
          { id: "k1", label: ["Cyber clients in the stolen files", "Cyberkunder i de stulna filerna"], value: (v) => v.clients, tone: "danger" },
          { id: "k2", label: ["Open claims, now on hold", "Öppna skadeärenden, nu vilande"], value: (v) => v.claimsOpen, tone: "warn" }
        ]) },
        injects: [
          inj("b18-2", 60, "forensicFinding", "forensics", "critical", "confirmed", [
            "Staging folder on the underwriting file server: 41 GB compressed, exfiltrated Saturday 02:10–04:55. Contents: cyber underwriting files, client questionnaires, policy schedules including ransom and extortion sub-limits.",
            "Insamlingsmapp på riskbedömningens filserver: 41 GB komprimerat, exfiltrerat lördag 02.10–04.55. Innehåll: riskbedömningsakter för cyber, kunders frågeformulär, försäkringsbrev inklusive delbelopp för lösensumma och utpressning."
          ], { tests: ["lo2"] })
        ],
        discuss: [q("Which of your clients is in the most danger this week, and do they know?", "Vilken av era kunder är i störst fara den här veckan, och vet de om det?", ["serviceOwner", "ciso"])],
        choice: ask(["Where do you put your effort now?", "Var lägger ni kraften nu?"], ["Warns the clients whose data now makes them targets, before they hear it from the attacker.", "Varnar kunderna vars uppgifter nu gör dem till måltavlor, innan de får höra det från angriparen."], [
          opt(["Warn your cyber clients today that their policy details were stolen", "Varna era cyberkunder i dag om att deras försäkringsuppgifter har stulits"], "l1", ["Right by them, and it makes your breach public within hours.", "Rätt mot dem, och det gör ert intrång offentligt inom några timmar."], { set: "clientsWarned", effects: { trust: 1 } }),
          opt(["Find out exactly what was taken before telling anyone", "Ta reda på exakt vad som togs innan ni berättar för någon"], "l1", ["Accurate when it comes, and the attacker may reach them first.", "Korrekt när det kommer, och angriparen kan hinna före."]),
          opt(["Get the claims system back first; clients in incidents need it", "Få tillbaka skadesystemet först; kunder mitt i incidenter behöver det"], "c3b", ["Practical, and the stolen book keeps working for the attacker.", "Praktiskt, och den stulna portföljen fortsätter att arbeta för angriparen."])
        ])
      }),

      pg("l1", ["A client calls", "En kund ringer"], [
        "The finance director of a manufacturing client calls {{person.serviceOwner.name}} directly. Their company was encrypted last night. The attackers' note quotes, to the euro, the ransom sub-limit in their policy with {{org.name}}.\n\n“How do they know what our policy pays?” the finance director asks. “Only you and our broker have that number.”",
        "Ekonomichefen hos en tillverkande kund ringer {{person.serviceOwner.name}} direkt. Deras företag krypterades i natt. Angriparnas brev anger, på kronan, delbeloppet för lösensumma i deras försäkring hos {{org.name}}.\n\n”Hur vet de vad vår försäkring betalar?” frågar ekonomichefen. ”Bara ni och vår mäklare har den siffran.”"
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you tell the client?", "Vad säger ni till kunden?"], ["Tells the client the truth about the source, so they can protect themselves and negotiate knowing it.", "Berättar sanningen om källan för kunden, så att de kan skydda sig och förhandla med vetskap om det."], [
          opt(["Tell them honestly that the details almost certainly came from your breach", "Berätta ärligt att uppgifterna nästan säkert kommer från ert intrång"], "c3", ["Painful, and it lets them negotiate with their eyes open.", "Smärtsamt, och det låter dem förhandla med öppna ögon."], { set: "candidWithClient" }),
          opt(["Handle their claim normally and say nothing about the source yet", "Hantera deras skada som vanligt och säg ingenting om källan ännu"], "c3", ["Buys you time, and they will find out.", "Köper er tid, och de kommer att få veta."])
        ])
      }),

      pg("c3", ["The demand", "Kravet"], [
        "The group's negotiator replies within the hour. Their price for a decryptor, and for not publishing the cyber book, is {{num.demand|currency}}. Without payment, every client's file goes online on Friday.\n\nIn the meeting room, someone reads out a line from {{org.name}}'s own client guidance: “We recommend that organisations do not pay ransoms.” Nobody says anything for a while.",
        "Gruppens förhandlare svarar inom en timme. Priset för en dekrypteringsnyckel, och för att inte publicera cyberportföljen, är {{num.demand|currency}}. Utan betalning läggs varje kunds akt ut på fredag.\n\nI mötesrummet läser någon upp en rad ur {{org.name}}s egna råd till kunderna: ”Vi rekommenderar att organisationer inte betalar lösensummor.” Ingen säger något på en stund."
      ], {
        injects: [
          inj("b18-3", 120, "chat", "attacker", "high", "confirmed", [
            "“{{num.demand|currency}}. You will recover the money from your reinsurers. Or Friday we publish every client, every limit, every security weakness they told you about.”",
            "”{{num.demand|currency}}. Ni får tillbaka pengarna från era återförsäkrare. Annars publicerar vi på fredag varje kund, varje belopp, varje säkerhetsbrist de berättade om för er.”"
          ], { tests: ["lo3"] })
        ],
        choice: ask(["How do you answer the extortion?", "Hur svarar ni på utpressningen?"], ["Refuses, consistent with its own advice, and puts its effort into protecting clients.", "Vägrar, i linje med sina egna råd, och lägger kraften på att skydda kunderna."], [
          opt(["Refuse, and say so publicly when the time comes", "Vägra, och säg det offentligt när det är dags"], "c4", ["Consistent with what you sell. Friday will come.", "I linje med det ni säljer. Fredagen kommer."], { set: "refused" }),
          opt(["Open negotiations through a specialist to buy time", "Inled förhandlingar via en specialist för att vinna tid"], "c4", ["Time for clients and forensics, and a channel you must manage.", "Tid för kunder och forensik, och en kanal som måste skötas."], { set: "negotiating" }),
          opt(["Pay quietly to keep the clients' files offline", "Betala i tysthet för att hålla kundernas akter borta från nätet"], "c4", ["Protects clients this week, if the group keeps its word.", "Skyddar kunderna den här veckan, om gruppen håller sitt ord."], { set: "paid", effects: { regulator: 1 } })
        ])
      }),

      pg("c3b", ["Claims on hold", "Skadeärenden på is"], [
        "The claims system is down and {{num.claimsOpen|number}} claims are frozen. One of them belongs to a logistics client whose own systems were encrypted on Saturday: their incident response firm will stop work tonight unless {{org.name}} confirms it will pay the invoice.\n\nWithout the claims system, nobody can check the policy, the limits or what has already been paid.",
        "Skadesystemet ligger nere och {{num.claimsOpen|number}} ärenden är frysta. Ett av dem tillhör en logistikkund vars egna system krypterades i lördags: deras incidentfirma slutar arbeta i kväll om inte {{org.name}} bekräftar att fakturan betalas.\n\nUtan skadesystemet kan ingen kontrollera försäkringen, beloppen eller vad som redan har betalats."
      ], {
        choice: ask(["What do you do with urgent claims?", "Vad gör ni med brådskande skador?"], ["Keeps critical client claims moving on paper, with phone verification, while systems are down.", "Håller kritiska kundskador i rörelse på papper, med verifiering per telefon, medan systemen ligger nere."], [
          opt(["Approve urgent incident costs on paper, verified by phone", "Godkänn brådskande incidentkostnader på papper, verifierade per telefon"], "c4", ["Keeps clients alive, with some risk of paying what you cannot check.", "Håller kunderna vid liv, med viss risk att betala sådant ni inte kan kontrollera."], { set: "manualClaims" }),
          opt(["Pause every approval until the claims system is back", "Pausa varje godkännande tills skadesystemet är tillbaka"], "c4", ["Safe for you, and the logistics client's responders go home.", "Säkert för er, och logistikkundens incidentfirma går hem."])
        ])
      }),

      pg("c4", ["The clients' ransoms", "Kundernas lösensummor"], [
        "Two clients in active incidents ask for approval to pay their own attackers. Their policies cover ransom payments under conditions, and both clients meet the conditions.\n\nOne of the two is being extorted by the same group that is extorting you. {{person.legal.name}} asks the obvious question: can {{org.name}} refuse to pay for itself while approving clients' payments to the same criminals?",
        "Två kunder mitt i incidenter ber om godkännande att betala sina egna angripare. Deras försäkringar täcker lösensummor under vissa villkor, och båda kunderna uppfyller villkoren.\n\nEn av de två pressas av samma grupp som pressar er. {{person.legal.name}} ställer den självklara frågan: kan {{org.name}} vägra betala för egen del och samtidigt godkänna kunders betalningar till samma kriminella?"
      ], {
        variants: [vr("paid", [
          "Two clients in active incidents ask for approval to pay their own attackers. Their policies cover ransom payments under conditions, and both clients meet them.\n\nOne of them is being extorted by the same group you have just paid. {{person.legal.name}} points out that your payment is now part of the group's funding, and that the client knows exactly what you did.",
          "Två kunder mitt i incidenter ber om godkännande att betala sina egna angripare. Deras försäkringar täcker lösensummor under vissa villkor, och båda kunderna uppfyller dem.\n\nEn av dem pressas av samma grupp som ni just har betalat. {{person.legal.name}} påpekar att er betalning nu är en del av gruppens finansiering, och att kunden vet exakt vad ni gjorde."
        ], ["Because you paid, the client's question is about consistency, not policy.", "Eftersom ni betalade handlar kundens fråga om konsekvens, inte om villkor."])],
        discuss: [q("Is a policy a promise, even when you would not take the same advice?", "Är en försäkring ett löfte, även när ni inte själva skulle följa samma råd?", ["legal", "ceo"])],
        choice: ask(["What do you tell the clients?", "Vad säger ni till kunderna?"], ["Honours the policy as written, while giving the clients honest advice and support.", "Fullföljer försäkringen enligt villkoren, och ger samtidigt kunderna ärliga råd och stöd."], [
          opt(["Honour the policy wording and approve where the conditions are met", "Fullfölj villkoren och godkänn där kraven är uppfyllda"], "l2", ["Keeps your word. You will fund the group that is extorting you.", "Håller ert ord. Ni kommer att finansiera gruppen som pressar er."], { set: "honoured" }),
          opt(["Delay client ransom approvals until your own incident is under control", "Skjut upp kundernas godkännanden tills er egen incident är under kontroll"], "l2", ["Buys you time, and leaves clients waiting at the worst moment.", "Ger er tid, och lämnar kunderna väntande i det värsta läget."], { effects: { trust: -1 } }),
          opt(["Advise every client not to pay, whatever the policy says", "Råd varje kund att inte betala, oavsett vad villkoren säger"], "l2", ["Consistent with your own stance, and possibly a breach of contract.", "I linje med er egen hållning, och möjligen ett avtalsbrott."], { set: "overrode", effects: { trust: -1 } }),
          opt(["Reverse your refusal and pay, now that clients are being extorted with your data", "Ändra er och betala, nu när kunder pressas med era uppgifter"], "l2", ["Contradicts your public stance under the pressure of your clients' harm.", "Motsäger er offentliga hållning under trycket av den skada era kunder lider."], { requires: "refused", set: "refusalReversed", effects: { regulator: 1 } })
        ])
      }),

      pg("l2", ["The supervisor", "Tillsynen"], [
        "{{reg.supervisor|cap}} calls {{person.ceo.name}}. They have heard from a broker that {{org.name}} cannot process claims, and they want to know whether the company can still meet its obligations to policyholders this week.\n\nThey ask for a written report today: what happened, what is affected, and how long until claims work again.",
        "{{reg.supervisor|cap}} ringer {{person.ceo.name}}. De har hört från en mäklare att {{org.name}} inte kan hantera skadeärenden, och vill veta om bolaget fortfarande kan fullgöra sina åtaganden mot försäkringstagarna den här veckan.\n\nDe begär en skriftlig rapport i dag: vad som har hänt, vad som berörs och hur lång tid det tar innan skadehanteringen fungerar igen."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you send the supervisor?", "Vad skickar ni till tillsynen?"], ["Sends a full report today with what is known and not known, and the plan for claims.", "Skickar en fullständig rapport i dag med vad som är känt och inte känt, och planen för skadehanteringen."], [
          opt(["A full report today, including the stolen cyber book", "En fullständig rapport i dag, inklusive den stulna cyberportföljen"], "c5", ["Hard to write in a day, and it builds trust you will need.", "Svår att skriva på en dag, och den bygger förtroende ni kommer att behöva."]),
          opt(["A short report on the outage today, the data loss later", "En kort rapport om avbrottet i dag, dataförlusten senare"], "c5", ["Easier today. The supervisor will ask why the second part came later.", "Enklare i dag. Tillsynen kommer att fråga varför andra delen kom senare."])
        ])
      }),

      pg("c5", ["Whose data is it?", "Vems uppgifter är det?"], [
        "{{person.dpo.name}} goes through what the files contain. Most of the cyber book is business information about companies, but the questionnaires name contact people, list security officers, and in some cases describe past incidents involving clients' own customers' personal data.\n\nSome in the room argue that this is commercial data and not a personal data breach. {{person.dpo.name}} is not convinced.",
        "{{person.dpo.name}} går igenom vad filerna innehåller. Det mesta av cyberportföljen är affärsinformation om företag, men frågeformulären namnger kontaktpersoner, listar säkerhetsansvariga och beskriver i vissa fall tidigare incidenter som berört kundernas egna kunders personuppgifter.\n\nEn del i rummet menar att det här är kommersiella uppgifter och ingen personuppgiftsincident. {{person.dpo.name}} är inte övertygad."
      ], {
        choice: ask(["Do you notify the regulator?", "Anmäler ni till tillsynsmyndigheten?"], ["Notifies in time: named people and descriptions of clients' incidents are personal data.", "Anmäler i tid: namngivna personer och beskrivningar av kundernas incidenter är personuppgifter."], [
          opt(["Notify {{reg.dpaShort}} within 72 hours and inform every client formally", "Anmäl till {{reg.dpaShort}} inom 72 timmar och informera varje kund formellt"], "l3", ["Meets the duty, and every client now has it in writing.", "Uppfyller skyldigheten, och varje kund har det nu skriftligt."], { set: "notified", effects: { regulator: -1 } }),
          opt(["Notify once forensics confirms exactly what was taken", "Anmäl när forensikerna har bekräftat exakt vad som togs"], "l3", ["Accurate, and probably late.", "Korrekt, och troligen sent."], { set: "notifyLate", effects: { regulator: 1 } }),
          opt(["Treat it as business data and do not notify", "Behandla det som affärsuppgifter och anmäl inte"], "l3", ["Hard to defend once the named contacts are published.", "Svårt att försvara när de namngivna kontakterna publiceras."], { set: "denied", effects: { regulator: 2 } })
        ])
      }),

      pg("l3", ["The brokers", "Mäklarna"], [
        "The large brokers have heard. Two of them call to say their clients are asking whether to move their cyber cover elsewhere, and whether {{org.name}} can still be trusted with security questionnaires at all.\n\nOne broker is blunt: “You ask our clients to prove their security before you insure them. Can you prove yours?”",
        "De stora mäklarna har fått höra. Två av dem ringer och säger att deras kunder frågar om de ska flytta sitt cyberskydd någon annanstans, och om {{org.name}} över huvud taget kan anförtros säkerhetsformulär.\n\nEn mäklare är rak: ”Ni kräver att våra kunder bevisar sin säkerhet innan ni försäkrar dem. Kan ni bevisa er?”"
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["How do you handle the brokers?", "Hur hanterar ni mäklarna?"], ["Calls the major brokers personally with the facts and a plan.", "Ringer de stora mäklarna personligen med fakta och en plan."], [
          opt(["Personal calls to the major brokers, with the facts", "Personliga samtal till de stora mäklarna, med fakta"], "c6", ["Time from senior people, and they hear it from you.", "Tid från ledningen, och de hör det från er."]),
          opt(["A written notice to all brokers", "Ett skriftligt meddelande till alla mäklare"], "c6", ["Efficient, and it reads like the notices you send after other people's breaches.", "Effektivt, och det läses som meddelandena ni skickar efter andras intrång."])
        ])
      }),

      pg("c6", ["The journalist", "Journalisten"], [
        "{{time.T+1440|weekday|cap}}. A financial journalist calls the press office. Their headline is already written: “Cyber insurer hacked by the gang it insures against.”\n\nThey ask whether client data was taken, whether the company has paid, and whether clients have been told. They publish at four.",
        "{{time.T+1440|weekday|cap}}. En ekonomijournalist ringer pressavdelningen. Rubriken är redan skriven: ”Cyberförsäkrare hackad av ligan den försäkrar mot.”\n\nHen frågar om kunduppgifter har tagits, om bolaget har betalat och om kunderna har informerats. Hen publicerar klockan fyra."
      ], {
        injects: [
          inj("b18-4", 1440, "mediaEnquiry", "media", "high", "confirmed", [
            "“We understand the group behind several recent attacks on your clients is now inside your own systems. Was client data taken? Have you paid? Have clients been told? We publish at 16:00.”",
            "”Vi förstår att gruppen bakom flera av de senaste angreppen mot era kunder nu är inne i era egna system. Har kunduppgifter tagits? Har ni betalat? Har kunderna informerats? Vi publicerar klockan 16.”"
          ], { headline: ["Financial desk enquiry", "Fråga från ekonomiredaktionen"], tests: ["lo4"] })
        ],
        choice: ask(["What do you tell the journalist?", "Vad säger ni till journalisten?"], ["Confirms the facts briefly, including that client data was taken, and what clients are being told.", "Bekräftar fakta kortfattat, inklusive att kunduppgifter tagits, och vad kunderna får veta."], [
          opt(["Confirm briefly what happened and what you are doing for clients", "Bekräfta kortfattat vad som hänt och vad ni gör för kunderna"], "c7", ["A hard story, accurately told.", "En svår nyhet, korrekt berättad."], { effects: { media: -1 } }),
          opt(["Confirm, and offer the CEO for an interview today", "Bekräfta, och erbjud vd för en intervju i dag"], "c7", ["Open and human, if the CEO is well prepared.", "Öppet och mänskligt, om vd är väl förberedd."]),
          opt(["Deny that any client data was taken", "Förneka att några kunduppgifter har tagits"], "x1", ["The attackers will publish on Friday.", "Angriparna publicerar på fredag."], { effects: { media: 2, trust: -1 } })
        ])
      }),

      pg("c7", ["Bringing claims back", "Att få tillbaka skadehanteringen"], [
        "The backups survived: they were kept offline, exactly as {{org.name}} requires of its clients. Restoring onto clean hardware in an isolated environment will take about two weeks. Cleaning the old servers and restarting them would take three days, if the cleaning is complete.\n\nThe claims backlog grows by hundreds every day.",
        "Säkerhetskopiorna klarade sig: de förvarades frånkopplade, precis som {{org.name}} kräver av sina kunder. Att återställa på ren hårdvara i en isolerad miljö tar omkring två veckor. Att rensa de gamla servrarna och starta om dem skulle ta tre dagar, om rensningen är fullständig.\n\nSkadekön växer med hundratals ärenden varje dag."
      ], {
        variants: [vr("paid", [
          "The group delivered a decryptor after payment. It works, slowly, and the forensic firm warns that decrypted servers cannot be trusted until rebuilt. The backups also survived.\n\nRestoring clean takes about two weeks. Running on decrypted servers would take three days.",
          "Gruppen levererade en dekrypteringsnyckel efter betalningen. Den fungerar, långsamt, och forensikfirman varnar för att dekrypterade servrar inte går att lita på förrän de byggts om. Säkerhetskopiorna klarade sig också.\n\nEn ren återställning tar omkring två veckor. Att köra på dekrypterade servrar skulle ta tre dagar."
        ], ["Because you paid, you have a decryptor, and a choice about trusting it.", "Eftersom ni betalade har ni en dekrypteringsnyckel, och ett val om ni ska lita på den."])],
        choice: ask(["How do you restore claims?", "Hur återställer ni skadehanteringen?"], ["Rebuilds clean from backups, even though it takes longer, and keeps urgent claims moving manually.", "Bygger upp rent från säkerhetskopior, trots att det tar längre tid, och håller brådskande skador igång manuellt."], [
          opt(["Rebuild the claims system clean from backups, about two weeks", "Bygg upp skadesystemet rent från säkerhetskopior, omkring två veckor"], "l4", ["The advice you give clients. Two weeks of backlog.", "Rådet ni ger kunderna. Två veckors kö."], { set: "rebuilt" }),
          opt(["Clean the old servers and restart in three days", "Rensa de gamla servrarna och starta om på tre dagar"], "l4", ["Fast, if nothing was left behind.", "Snabbt, om ingenting lämnades kvar."])
        ])
      }),

      pg("l4", ["The product question", "Produktfrågan"], [
        "In the underwriting team, a harder question has surfaced. If {{org.name}} believes paying ransoms funds the criminals, should its cyber policies keep reimbursing them?\n\nSales warn that clients buy the policy largely for that cover. The underwriters point out that the stolen book has just shown the attackers exactly who has it.",
        "I riskbedömningsteamet har en svårare fråga dykt upp. Om {{org.name}} anser att lösensummor finansierar de kriminella, ska bolagets cyberförsäkringar då fortsätta att ersätta dem?\n\nSäljavdelningen varnar för att kunderna köper försäkringen till stor del för just det skyddet. Riskbedömarna påpekar att den stulna portföljen precis har visat angriparna exakt vem som har det."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What happens to ransom cover?", "Vad händer med skyddet för lösensumma?"], ["Keeps the cover with stricter conditions, and stops putting limits where attackers can find them.", "Behåller skyddet med strängare villkor, och slutar lägga belopp där angripare kan hitta dem."], [
          opt(["Keep ransom cover with stricter conditions and better protection of policy data", "Behåll skyddet med strängare villkor och bättre skydd av försäkringsuppgifterna"], "c8", ["A middle path that clients and sales can accept.", "En mellanväg som kunder och säljare kan acceptera."]),
          opt(["Remove ransom cover at renewal", "Ta bort skyddet för lösensumma vid förnyelse"], "c8", ["Consistent, and many clients will leave.", "Konsekvent, och många kunder kommer att lämna."])
        ])
      }),

      pg("c8", ["Extorted with your data", "Pressade med era uppgifter"], [
        "Over the next week, {{num.extorted}} of your cyber clients are attacked by the same group. In each case, the ransom note quotes the client's own policy limit. Three of them pay.\n\nAll three claim the ransom from their policies. Two of them also write that {{org.name}}'s breach made them targets, and that they hold you responsible for the attack itself.",
        "Under den följande veckan angrips {{num.extorted}} av era cyberkunder av samma grupp. I varje fall anger utpressningsbrevet kundens eget försäkringsbelopp. Tre av dem betalar.\n\nAlla tre begär ersättning för lösensumman ur sina försäkringar. Två av dem skriver också att {{org.name}}s intrång gjorde dem till måltavlor, och att de håller er ansvariga för själva angreppet."
      ], {
        variants: [vr("clientsWarned", [
          "Over the next week, {{num.extorted}} of your cyber clients are attacked by the same group, the notes quoting their own policy limits. Because you warned them on the first day, several had already locked down remote access, and only one pays.\n\nThat client claims the ransom from its policy, and writes that it holds you partly responsible.",
          "Under den följande veckan angrips {{num.extorted}} av era cyberkunder av samma grupp, och breven anger deras egna försäkringsbelopp. Eftersom ni varnade dem första dagen hade flera redan låst ner sin fjärråtkomst, och bara en betalar.\n\nDen kunden begär ersättning för lösensumman ur sin försäkring, och skriver att den håller er delvis ansvariga."
        ], ["Because you warned clients early, fewer of them paid.", "Eftersom ni varnade kunderna tidigt var det färre som betalade."])],
        discuss: [q("What do you owe a client who was attacked because of your breach?", "Vad är ni skyldiga en kund som angreps på grund av ert intrång?", ["legal", "ceo"])],
        choice: ask(["How do you treat the clients who were extorted?", "Hur behandlar ni kunderna som pressades?"], ["Pays the policy claims promptly and accepts responsibility for its own part.", "Betalar försäkringsersättningen snabbt och tar ansvar för sin egen del."], [
          opt(["Pay their claims and accept your share of responsibility", "Betala deras ersättningar och acceptera er del av ansvaret"], "c9", ["Expensive, and it is what you would expect of others.", "Dyrt, och det är vad ni skulle förvänta er av andra."], { set: "acceptedLiability", effects: { trust: 1 } }),
          opt(["Pay the policy claims, and contest liability for the attacks", "Betala försäkringsersättningen, och bestrid ansvaret för angreppen"], "c9", ["Defensible in court, and clients will remember the argument.", "Försvarbart i domstol, och kunderna kommer att minnas argumentet."])
        ])
      }),

      pg("c9", ["Practise what you sell", "Att leva som man lär"], [
        "The forensic report is in. The group came in through a remote-access gateway that had not been patched for a known vulnerability, and an administrator account without multi-factor authentication. Both are on {{org.name}}'s own list of conditions for cyber cover; a client with either would have been refused.\n\nThe board asks what you will tell clients about this.",
        "Forensikrapporten har kommit. Gruppen kom in via en fjärråtkomstgateway som inte hade fått en känd säkerhetsuppdatering, och ett administratörskonto utan flerfaktorsautentisering. Båda finns på {{org.name}}s egen lista över villkor för cyberskydd; en kund med någon av dem hade nekats.\n\nStyrelsen frågar vad ni ska säga till kunderna om detta."
      ], {
        choice: ask(["What do you share about the cause?", "Vad delar ni om orsaken?"], ["Tells clients honestly that it failed its own standard, and what it has changed.", "Berättar ärligt för kunderna att bolaget inte levde upp till sin egen standard, och vad som har ändrats."], [
          opt(["Publish your own lessons openly to clients and brokers", "Publicera era egna lärdomar öppet för kunder och mäklare"], "c10", ["Humbling, and it is the most credible thing you can do.", "Ödmjukande, och det mest trovärdiga ni kan göra."], { set: "openLessons" }),
          opt(["Keep the findings internal and share only the fixes", "Behåll slutsatserna internt och dela bara åtgärderna"], "c10", ["Protects your position. Clients will compare it with what you ask of them.", "Skyddar er position. Kunderna kommer att jämföra det med vad ni kräver av dem."])
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "A month later the claims system is back, the backlog is shrinking and the extortion has moved on to other victims. The crisis team meets one last time.\n\nThere is budget for one real change this year. Everyone agrees on the uncomfortable point: {{org.name}} was held to a lower standard than it sets for the companies it insures.",
        "En månad senare är skadesystemet tillbaka, kön krymper och utpressningen har gått vidare till andra offer. Krisledningen träffas en sista gång.\n\nDet finns budget för en verklig förändring i år. Alla är överens om den obekväma punkten: {{org.name}} höll sig själv till en lägre standard än den bolaget ställer på företagen det försäkrar."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Applies its own underwriting standard to itself, audited independently.", "Tillämpar sin egen riskbedömningsstandard på sig själv, granskad av en oberoende part."], [
          opt(["Meet your own underwriting standard, independently audited every year", "Uppfyll er egen riskbedömningsstandard, granskad av oberoende part varje år"], "r-end", ["Closes the gap that let them in.", "Stänger luckan som släppte in dem."]),
          opt(["Separate and encrypt the cyber book so it cannot be taken again", "Separera och kryptera cyberportföljen så att den inte kan tas igen"], "r-end", ["Protects clients next time; the door stays the same.", "Skyddar kunderna nästa gång; dörren förblir densamma."]),
          opt(["Buy more cyber insurance for yourselves", "Köp mer cyberförsäkring åt er själva"], "r-end", ["Pays for the next one. Prevents nothing.", "Betalar för nästa gång. Förhindrar ingenting."])
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["refused", "clientsWarned", "notified"], "e1"],
          ["paid", "e4"],
          ["notified", "e2"],
          ["notifyLate", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Three months later", "Tre månader senare"], ["The cyber book was published on Friday, as threatened. By then every client had been warned, most had locked down, and your refusal had been explained publicly in the same words you use with clients.\n\nA few clients left. More stayed, and several brokers now cite your response as an example of how to handle it.", "Cyberportföljen publicerades på fredagen, som utlovat. Då hade varje kund redan varnats, de flesta hade låst ner sina system, och ert nej hade förklarats offentligt med samma ord som ni använder mot kunderna.\n\nNågra kunder lämnade. Fler stannade, och flera mäklare nämner nu ert agerande som ett exempel på hur det ska skötas."], {
        ending: end(1, ["You followed your own advice", "Ni följde era egna råd"], [
          "You refused to pay, warned clients the same day and notified in time. The data leaked, but clients were ready, and your credibility held.",
          "Ni vägrade betala, varnade kunderna samma dag och anmälde i tid. Uppgifterna läckte, men kunderna var förberedda, och er trovärdighet höll."
        ])
      }),
      pg("e2", ["Three months later", "Tre månader senare"], ["The regulator was notified in time, and the claims system is back. But clients learned about the stolen book later than they should have, and some learned it from their attackers.\n\nRenewals are down, and the brokers want a meeting about trust.", "Tillsynsmyndigheten fick sin anmälan i tid, och skadesystemet är tillbaka. Men kunderna fick veta om den stulna portföljen senare än de borde, och en del fick veta det av sina angripare.\n\nFörnyelserna har minskat, och mäklarna vill ha ett möte om förtroende."], {
        ending: end(2, ["Compliant, but late for clients", "Regelrätt, men sent för kunderna"], [
          "You met your duties to the regulator, but clients were warned late, and some were attacked first. Trust is damaged, not lost.",
          "Ni uppfyllde era skyldigheter mot tillsynsmyndigheten, men kunderna varnades sent, och några angreps först. Förtroendet är skadat, inte förlorat."
        ])
      }),
      pg("e3", ["Four months later", "Fyra månader senare"], ["The notification arrived after the deadline, after the cyber book had been published and clients' security weaknesses were online for anyone to read.\n\nThe regulator's investigation asks why an insurer that advises clients on breach response waited. Two clients have filed claims against you.", "Anmälan kom efter tidsfristen, efter att cyberportföljen publicerats och kundernas säkerhetsbrister låg ute på nätet för vem som helst att läsa.\n\nMyndighetens utredning frågar varför ett försäkringsbolag som ger kunder råd om incidenthantering väntade. Två kunder har väckt talan mot er."], {
        ending: end(3, ["Late, in your own field", "Sent, på ert eget område"], [
          "Your notification was late and clients were exposed before you acted. The regulator and two clients are now asking why.",
          "Er anmälan kom sent och kunderna exponerades innan ni agerade. Tillsynsmyndigheten och två kunder frågar nu varför."
        ])
      }),
      pg("e4", ["Six months later", "Sex månader senare"], ["Either you paid, or you treated the stolen book as nobody's business. Months later the files appeared anyway, on a second leak site, from a group that says it bought them.\n\nThe regulator has opened an investigation, and the industry press asks whether an insurer that pays ransoms, or hides breaches, can sell cyber cover at all.", "Antingen betalade ni, eller så behandlade ni den stulna portföljen som ingens sak. Månader senare dök filerna upp ändå, på en andra läcksajt, från en grupp som säger att den köpt dem.\n\nTillsynsmyndigheten har inlett en utredning, och branschpressen frågar om ett försäkringsbolag som betalar lösensummor, eller döljer intrång, över huvud taget kan sälja cyberskydd."], {
        ending: end(4, ["The advice you did not take", "Råden ni inte följde"], [
          "Paying or staying silent did not keep the book offline. The industry now questions whether you can sell what you did not practise.",
          "Att betala eller tiga höll inte portföljen borta från nätet. Branschen ifrågasätter nu om ni kan sälja det ni inte själva levde efter."
        ])
      }),

      // Break-away: denying that client data was taken.
      pg("x1", ["The denial", "Förnekandet"], [
        "The article runs at four, with your denial in the second paragraph. On Friday, the group publishes the first part of the cyber book on its leak site, including the journalist's own newspaper's insurance broker.\n\nBy Saturday, the story is no longer about a hack. It is about an insurer that said something untrue about its clients' data.",
        "Artikeln publiceras klockan fyra, med ert förnekande i andra stycket. På fredagen publicerar gruppen den första delen av cyberportföljen på sin läcksajt, där även journalistens egen tidnings försäkringsmäklare finns med.\n\nPå lördagen handlar nyheten inte längre om ett intrång. Den handlar om ett försäkringsbolag som sa något osant om sina kunders uppgifter."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Corrects the record at once and contacts every client directly.", "Rättar uppgifterna omedelbart och kontaktar varje kund direkt."], [
          opt(["Correct the statement and contact every client today", "Rätta uttalandet och kontakta varje kund i dag"], "x2", ["Necessary, and late.", "Nödvändigt, och sent."]),
          opt(["Say the published files are old and not from the breach", "Säg att de publicerade filerna är gamla och inte kommer från intrånget"], "x2", ["The files have this month's dates.", "Filerna har den här månadens datum."])
        ])
      }),
      pg("x2", ["The clients", "Kunderna"], [
        "Clients call their brokers before they call you. Several are furious that they learned from a leak site that their security weaknesses are public, after you had denied it.\n\nTwo brokers announce they will move all cyber business elsewhere at renewal. {{person.dpo.name}} points out that a notification now will be read next to your denial.",
        "Kunderna ringer sina mäklare innan de ringer er. Flera är rasande över att de fick veta via en läcksajt att deras säkerhetsbrister är offentliga, efter att ni förnekat det.\n\nTvå mäklare meddelar att de flyttar all cyberaffär någon annanstans vid förnyelsen. {{person.dpo.name}} påpekar att en anmälan nu kommer att läsas bredvid ert förnekande."
      ], {
        choice: ask(["What do you do now?", "Vad gör ni nu?"], ["Notifies immediately with a full, honest timeline.", "Anmäler omedelbart med en fullständig och ärlig tidslinje."], [
          opt(["Notify today with a full timeline, including the denial", "Anmäl i dag med en fullständig tidslinje, inklusive förnekandet"], "x3", ["The only option that still helps.", "Det enda alternativ som fortfarande hjälper."]),
          opt(["Wait for the regulator to contact you", "Vänta på att tillsynsmyndigheten kontaktar er"], "x3", ["They will, with the articles in hand.", "Det gör de, med artiklarna i handen."])
        ])
      }),
      pg("x3", ["The board", "Styrelsen"], [
        "The chair of the board learned of the denial from the newspaper. They want to know who approved it, whether the company paid, and what will be said to the supervisor, which has asked for a meeting.",
        "Styrelseordföranden fick veta om förnekandet via tidningen. Hen vill veta vem som godkände det, om bolaget har betalat och vad som ska sägas till tillsynen, som har begärt ett möte."
      ], {
        choice: ask(["How do you face the board?", "Hur möter ni styrelsen?"], ["Gives the board the full timeline, including who approved the denial.", "Ger styrelsen hela tidslinjen, inklusive vem som godkände förnekandet."], [
          opt(["The full timeline, including who approved the denial", "Hela tidslinjen, inklusive vem som godkände förnekandet"], "x4", ["Painful and necessary.", "Smärtsamt och nödvändigt."]),
          opt(["A summary focused on the recovery", "En sammanfattning med fokus på återställningen"], "x4", ["The board has read the newspapers.", "Styrelsen har läst tidningarna."])
        ])
      }),
      pg("x4", ["The supervisor", "Tillsynen"], [
        "The supervisor's questions are not about the gateway. They are about the decision to deny, about clients' data, and about whether management can be trusted to report honestly.\n\nThey ask for an independent review of governance within thirty days.",
        "Tillsynens frågor handlar inte om gatewayen. De handlar om beslutet att förneka, om kundernas uppgifter och om huruvida ledningen kan lita på att rapportera ärligt.\n\nDe begär en oberoende granskning av styrningen inom trettio dagar."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Answers fully and accepts the review.", "Svarar fullständigt och accepterar granskningen."], [
          opt(["Answer fully and accept the independent review", "Svara fullständigt och acceptera den oberoende granskningen"], "e5", ["It does not undo the week, but it helps.", "Det gör inte veckan ogjord, men det hjälper."]),
          opt(["Let lawyers answer in writing", "Låt jurister svara skriftligt"], "e5", ["Reads as if there is more to hide.", "Uppfattas som att det finns mer att dölja."])
        ])
      }),
      pg("e5", ["A year later", "Ett år senare"], ["A breach became a scandal about a false statement. Brokers moved their business, the supervisor ordered changes to governance, and the cyber book is still for sale on two leak sites.\n\nThe group that attacked you uses your story in its ransom notes to other insurers.", "Ett intrång blev en skandal om ett osant uttalande. Mäklare flyttade sina affärer, tillsynen beordrade förändringar i styrningen, och cyberportföljen är fortfarande till salu på två läcksajter.\n\nGruppen som angrep er använder er historia i sina utpressningsbrev till andra försäkringsbolag."], {
        ending: end(5, ["The denial became the story", "Förnekandet blev nyheten"], [
          "Denying that client data was taken, days before the attackers published it, turned a breach into a crisis of trust you could not recover from.",
          "Att förneka att kunduppgifter tagits, dagar innan angriparna publicerade dem, gjorde ett intrång till en förtroendekris som ni inte kunde ta er ur."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Follow the advice you give clients: isolate fast and rebuild clean.", "Följ de råd ni ger kunderna: isolera snabbt och bygg upp rent."]),
        L(["When your stolen data makes others targets, warn them before the attacker reaches them.", "När era stulna uppgifter gör andra till måltavlor, varna dem innan angriparen når dem."]),
        L(["Decisions on extortion must be consistent with what you say publicly.", "Beslut om utpressning måste stämma med det ni säger offentligt."]),
        L(["An insurer is judged by the standard it sets for others.", "Ett försäkringsbolag bedöms efter den standard det ställer på andra."])
      ],
      strengthsToLookFor: [
        L(["Warning cyber clients on the first day", "Att varna cyberkunderna första dagen"]),
        L(["Keeping urgent client claims moving during the outage", "Att hålla brådskande kundskador igång under avbrottet"]),
        L(["Telling an extorted client the truth about the source", "Att berätta sanningen om källan för en utpressad kund"])
      ],
      commonGaps: [
        L(["Treating the cyber book as business data only", "Att behandla cyberportföljen som enbart affärsuppgifter"]),
        L(["Refusing to pay while quietly delaying clients' ransom cover", "Att vägra betala och samtidigt i tysthet fördröja kundernas skydd för lösensumma"]),
        L(["Keeping the embarrassing cause internal", "Att hålla den pinsamma orsaken intern"])
      ],
      suggestedActions: [
        act(["Hold yourselves to your own underwriting standard, audited independently.", "Håll er själva till er egen riskbedömningsstandard, granskad av oberoende part."], "ciso", "high"),
        act(["Separate and encrypt client policy data, especially ransom and extortion limits.", "Separera och kryptera kundernas försäkringsuppgifter, särskilt belopp för lösensumma och utpressning."], "cio", "high"),
        act(["Prepare a plan to warn clients when your breach puts them at risk.", "Ta fram en plan för att varna kunder när ert intrång utsätter dem för risk."], "serviceOwner", "medium"),
        act(["Agree in advance how ransom decisions for yourself and clients will be made consistently.", "Kom överens i förväg om hur beslut om lösensummor för er själva och för kunderna ska fattas konsekvent."], "ceo", "medium")
      ]
    }
  });
})();
