/*
 * b20-protected-identity.js — "Protected Identities" (branching, government agency).
 *
 * A woman living under a protected identity is found at her new address by the man she
 * fled. It looks like an insider lookup; it is a software update that, for weeks,
 * returned protected addresses to every company using the agency's address service.
 * Spine: first move → the update → the people-search site → who to tell → a second
 * case → the journalist → the regulator → the shelters → why the test missed it → what
 * changes. Break-away at § "The journalist": saying that nobody was harmed.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, pb, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b20-protected-identity",
    version: 1,
    format: "branching",
    category: "protected-identity",
    archetype: "benign-lookalike",
    emblem: "protected-identity",
    title: L(["Protected Identities", "Skyddade identiteter"]),
    summary: L([
      "A woman who fled a violent partner has been found at an address that only your register knew. It looks like one bad employee. It is something much bigger, and the people it exposed cannot be reached by an ordinary letter.",
      "En kvinna som flytt från en våldsam partner har hittats på en adress som bara ert register kände till. Det ser ut som en enskild anställd. Det är något mycket större, och de som röjts kan inte nås med ett vanligt brev."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Look for the system failure before blaming a person", "Leta efter felet i systemet innan ni skyller på en person"]), teaser: L(["One lookup", "En sökning"]) },
      { id: "lo2", text: L(["Stop a data leak even when the service is relied on by others", "Stoppa en dataläcka även när andra är beroende av tjänsten"]), teaser: L(["The address service", "Adresstjänsten"]) },
      { id: "lo3", text: L(["Tell people at risk without putting them at further risk", "Berätta för personer i riskzonen utan att utsätta dem för ytterligare risk"]), teaser: L(["Not by letter", "Inte per brev"]) },
      { id: "lo4", text: L(["Be honest about harm, even before it is proven", "Vara ärliga om skada, även innan den är bevisad"]), teaser: L(["Nobody was harmed?", "Ingen kom till skada?"]) }
    ],
    mitre: ["T1078", "T1213"],
    frameworks: {
      nistCsf: ["GV.SC", "PR.DS", "DE.CM", "RS.MA", "RS.CO", "RC.CO"],
      iso27001: ["A.5.12", "A.5.24", "A.5.26", "A.5.28", "A.5.34", "A.8.29", "A.8.32"]
    },
    constraints: { startWindow: "business-hours", startTime: "09:10", sectors: ["government"] },
    actor: { types: ["unknown"], motivation: L(["No attacker at first: a faulty update; then people who use leaked addresses to find those who are hiding", "Ingen angripare till en början: en felaktig uppdatering; sedan personer som använder läckta adresser för att hitta dem som håller sig gömda"]), capability: "low" },
    variables: {
      exposed: { min: 300, max: 4000, scaleBy: "size", step: 10 },
      clients: { min: 12, max: 60, scaleBy: "size" },
      days: { min: 11, max: 26 }
    },
    roles: ["incidentCommander", "ceo", "cio", "ciso", "serviceOwner", "comms", "legal", "dpo", "hr", "securityOfficer"],

    flags: {
      wideCheck: L(["Checked every lookup of protected records", "Kontrollerade varje sökning på skyddade poster"]),
      insiderBlamed: L(["Suspended the caseworker", "Stängde av handläggaren"]),
      reinstated: L(["Reinstated the caseworker with an apology", "Återinsatte handläggaren med en ursäkt"]),
      apiOff: L(["Shut down the address service", "Stängde ner adresstjänsten"]),
      apiRestoredEarly: L(["Restarted the address service before the fix was verified", "Startade adresstjänsten igen innan rättningen var verifierad"]),
      quietFix: L(["Fixed the fault without telling the clients", "Rättade felet utan att berätta för kunderna"]),
      takedown: L(["Had the people-search site take the addresses down", "Fick personsöksajten att ta ner adresserna"]),
      personalNotice: L(["Told people personally, with police support", "Berättade personligen, med stöd av polisen"]),
      publicFirst: L(["Announced the leak publicly first", "Gick först ut offentligt med läckan"]),
      relocation: L(["Funded emergency relocation", "Bekostade akuta flyttar"]),
      reportedFully: L(["Reported everything to the regulator, including the delay", "Anmälde allt till tillsynsmyndigheten, även förseningen"]),
      supportFund: L(["Set up support with the shelters", "Ordnade stöd tillsammans med skyddade boenden"]),
      fixedProcess: L(["Protected records added to every test", "Skyddade poster tillagda i varje test"])
    },

    start: "c1",
    pages: [
      pg("c1", ["Found", "Hittad"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. A police officer calls {{person.securityOfficer.name}}. Last night, a man with a conviction for violence turned up at the new address of his former partner. She and her children got out through a neighbour's flat.\n\nShe has lived under a protected identity for two years. Her address existed only in the agency's register. The audit log shows that one caseworker opened her record three weeks ago.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. En polis ringer {{person.securityOfficer.name}}. I natt dök en man som är dömd för våld upp på sin tidigare partners nya adress. Hon och barnen tog sig ut via en grannes lägenhet.\n\nHon har levt med skyddade personuppgifter i två år. Hennes adress fanns bara i myndighetens register. Granskningsloggen visar att en handläggare öppnade hennes post för tre veckor sedan."
      ], {
        injects: [
          inj("b20-1", 0, "phoneTranscript", "police", "critical", "confirmed", [
            "“He had the full address, including the flat number. She has not given it to anyone. Where did he get it?”",
            "”Han hade hela adressen, med lägenhetsnummer. Hon har inte gett ut den till någon. Var fick han den ifrån?”"
          ], { headline: ["From the police", "Från polisen"], tests: ["lo1"] }),
          inj("b20-2", 20, "logExcerpt", "person.ciso", "medium", "misleading", [
            "Audit log, record (protected): opened by caseworker H-1187, three weeks ago, 14:02. Reason code: “address change, mail returned”.",
            "Granskningslogg, post (skyddad): öppnad av handläggare H-1187, för tre veckor sedan, 14.02. Orsakskod: ”adressändring, post i retur”."
          ], { facilitatorNote: ["A legitimate lookup with a valid reason. It points the room at the wrong person.", "En legitim sökning med giltigt skäl. Den pekar rummet mot fel person."], tests: ["lo1"] })
        ],
        discuss: [q("What else, apart from a caseworker, knows a protected address?", "Vad mer, förutom en handläggare, känner till en skyddad adress?", ["ciso", "serviceOwner"])],
        facilitator: { notes: L(["The log is a lure. Watch whether the room looks at the system as well as the person.", "Loggen är ett lockbete. Se om rummet tittar på systemet lika väl som på personen."]) },
        choice: ask(["What is your first move?", "Vad är ert första drag?"], ["Protects the woman, and checks every way her address could have left the register.", "Skyddar kvinnan, och kontrollerar varje väg hennes adress kan ha lämnat registret."], [
                    opt(["Check every lookup of every protected record in the last month, not only hers", "Kontrollera varje sökning på varje skyddad post den senaste månaden, inte bara hennes"], "c2", ["Slower, and it finds what a single case would miss.", "Långsammare, och det hittar det som ett enskilt fall skulle missa."], {
            set: "wideCheck",
            pushback: [
              pb(["She needs a plan tonight", "Hon behöver en plan i kväll"], ["The police officer calls back: the woman and her children have a hotel room for one night, and nobody at the agency has decided what happens next. Every analyst you have is reading logs. Who in the room is looking after her while the review runs?", "Polisen ringer tillbaka: kvinnan och barnen har ett hotellrum för en natt, och ingen på myndigheten har bestämt vad som händer sedan. Alla analytiker ni har läser loggar. Vem i rummet tar hand om henne medan granskningen pågår?"]),
              pb(["A month of lookups", "En månad av sökningar"], ["A month of lookups on every protected record is a huge volume, nearly all of it staff doing their jobs. The first pass will take days, not hours. Do you narrow the check to get an answer today, and what would you stop looking at?", "En månad av sökningar på varje skyddad post är en enorm mängd, nästan allt handläggare som gör sitt jobb. Första genomgången tar dagar, inte timmar. Smalnar ni av kontrollen för att få ett svar i dag, och vad slutar ni i så fall titta på?"]),
              pb(["The union objects", "Facket protesterar"], ["The staff union hears that every caseworker who touched a protected record is being reviewed. Its representative calls it a mass investigation of colleagues over one incident. How do you explain reading everyone's lookups without implying that everyone is suspected?", "Facket får höra att varje handläggare som rört en skyddad post granskas. Ombudet kallar det en massutredning av kollegor efter en enda händelse. Hur förklarar ni att alla sökningar läses utan att det låter som att alla är misstänkta?"])
            ]
          }),
                    opt(["Suspend the caseworker who opened her record and hand the case to the police", "Stäng av handläggaren som öppnade hennes post och lämna ärendet till polisen"], "c2", ["Decisive, on a log line with a valid reason.", "Handlingskraftigt, på en loggrad med giltigt skäl."], {
            set: "insiderBlamed",
            pushback: [
              pb(["The reason code holds up", "Orsakskoden håller"], ["Her team leader confirms that the woman's mail really was coming back undeliverable, and the lookup followed the normal routine. The line you acted on shows a caseworker doing her job. What evidence, beyond that one log entry, justifies the suspension?", "Hennes gruppchef bekräftar att kvinnans post verkligen kom i retur, och sökningen följde den vanliga rutinen. Raden ni agerade på visar en handläggare som gör sitt jobb. Vilka bevis, utöver den enda loggraden, motiverar avstängningen?"]),
              pb(["The police want more", "Polisen vill ha mer"], ["The police accept the case but ask what else you have: other lookups, other systems, other ways the address could have left. You have given them one name and nothing more. Have you closed your own investigation by handing it over?", "Polisen tar emot ärendet men frågar vad ni mer har: andra sökningar, andra system, andra vägar adressen kan ha tagit. Ni har gett dem ett namn och inget annat. Har ni lagt ner er egen utredning genom att lämna över den?"]),
              pb(["Nobody opens protected records", "Ingen öppnar skyddade poster"], ["Within the hour, the whole office knows who was sent home, and some caseworkers refuse to open protected records in case they are next. Returned-mail cases start to pile up. How do you keep the work going while a colleague is suspended on one log line?", "Inom en timme vet hela kontoret vem som skickades hem, och en del handläggare vägrar öppna skyddade poster ifall de står på tur. Ärenden med post i retur börjar hopa sig. Hur håller ni arbetet igång när en kollega är avstängd på en enda loggrad?"])
            ]
          }),
                    opt(["Treat it as one police case and support the woman", "Behandla det som ett enskilt polisärende och stötta kvinnan"], "c2", ["Humane, and the register is not checked.", "Mänskligt, och registret kontrolleras inte."], {
            pushback: [
              pb(["What stops it happening again?", "Vad hindrar att det händer igen?"], ["{{person.ciso.name}} asks a plain question: if the address left the register once, what stops the next one leaving? Treating this as one police case means nobody at the agency is looking. Who owns the register's side of this?", "{{person.ciso.name}} ställer en enkel fråga: om adressen lämnade registret en gång, vad hindrar nästa från att göra det? Att behandla det som ett enskilt polisärende betyder att ingen på myndigheten letar. Vem äger registrets del av det här?"]),
              pb(["The police hand it back", "Polisen lämnar tillbaka frågan"], ["The investigating officer says they can deal with the man, but not with the agency's systems. They want to know who at the agency will explain how a protected address reached him. Are you ready to say that nobody has checked?", "Utredaren säger att polisen kan ta hand om mannen, men inte om myndighetens system. Hen vill veta vem på myndigheten som ska förklara hur en skyddad adress nådde honom. Är ni beredda att säga att ingen har kontrollerat?"]),
              pb(["Her question", "Hennes fråga"], ["Through the police, the woman sends a message: she has done everything right for two years, and wants to know how this happened before she accepts a new address. Can you promise her the next address will be safer, without knowing how the last one leaked?", "Via polisen skickar kvinnan ett besked: hon har gjort allt rätt i två år och vill veta hur det här hände innan hon tar emot en ny adress. Kan ni lova att nästa adress blir säkrare, utan att veta hur den förra läckte?"])
            ]
          })
        ])
      }),

      pg("c2", ["The address service", "Adresstjänsten"], [
        "{{person.cio.name}} finds something the caseworker could not have done. {{num.days}} days ago, an update to the agency's address service, which banks, insurers and debt collectors use to look up current addresses, stopped checking the protection flag. Since then, every protected address requested through the service has been returned in full.\n\nThe log shows {{num.exposed|number}} protected people looked up by {{num.clients}} companies. The man who found the woman works for one of them.",
        "{{person.cio.name}} hittar något som handläggaren inte kunde ha gjort. För {{num.days}} dagar sedan slutade en uppdatering av myndighetens adresstjänst, som banker, försäkringsbolag och inkassoföretag använder för att slå upp aktuella adresser, att kontrollera skyddsmarkeringen. Sedan dess har varje skyddad adress som efterfrågats via tjänsten lämnats ut i sin helhet.\n\nLoggen visar {{num.exposed|number}} skyddade personer uppslagna av {{num.clients}} företag. Mannen som hittade kvinnan arbetar på ett av dem."
      ], {
        variants: [vr("insiderBlamed", [
          "The caseworker has been suspended for an hour when {{person.cio.name}} finds the real cause. {{num.days}} days ago, an update to the agency's address service, used by banks, insurers and debt collectors, stopped checking the protection flag. Every protected address requested since then has been returned in full.\n\n{{num.exposed|number}} protected people were looked up by {{num.clients}} companies. The man who found the woman works for one of them. The caseworker had done nothing wrong.",
          "Handläggaren har varit avstängd i en timme när {{person.cio.name}} hittar den verkliga orsaken. För {{num.days}} dagar sedan slutade en uppdatering av myndighetens adresstjänst, som används av banker, försäkringsbolag och inkassoföretag, att kontrollera skyddsmarkeringen. Varje skyddad adress som efterfrågats sedan dess har lämnats ut i sin helhet.\n\n{{num.exposed|number}} skyddade personer slogs upp av {{num.clients}} företag. Mannen som hittade kvinnan arbetar på ett av dem. Handläggaren hade inte gjort något fel."
        ], ["Because you suspended the caseworker, an innocent colleague is now part of the story.", "Eftersom ni stängde av handläggaren är nu en oskyldig kollega en del av historien."])],
        chart: { id: "b20-kpi", type: "kpi", title: L(["The leak", "Läckan"]), data: kpi([
          { id: "k1", label: ["Protected people exposed", "Skyddade personer som röjts"], value: (v) => v.exposed, tone: "danger" },
          { id: "k2", label: ["Companies that received addresses", "Företag som fick adresser"], value: (v) => v.clients, tone: "warn" },
          { id: "k3", label: ["Days the fault was live", "Dagar felet var aktivt"], value: (v) => v.days, tone: "warn" }
        ]) },
        injects: [
          inj("b20-3", 60, "forensicFinding", "person.cio", "critical", "confirmed", [
            "Address service release {{num.days}} days ago: protection-flag filter skipped when request uses the new batch endpoint. Protected addresses returned in full: {{num.exposed|number}} people, {{num.clients}} client companies.",
            "Adresstjänstens version för {{num.days}} dagar sedan: filtret för skyddsmarkering hoppas över när anropet använder den nya batch-funktionen. Skyddade adresser utlämnade i sin helhet: {{num.exposed|number}} personer, {{num.clients}} kundföretag."
          ], { tests: ["lo1", "lo2"] })
        ],
        discuss: [q("Who relies on the address service, and what happens if it stops today?", "Vem är beroende av adresstjänsten, och vad händer om den stoppas i dag?", ["serviceOwner"])],
        choice: ask(["What do you do with the address service?", "Vad gör ni med adresstjänsten?"], ["Stops the leak now, even though the service stops for everyone.", "Stoppar läckan nu, även om tjänsten stoppas för alla."], [
                    opt(["Shut the address service down now, for every client", "Stäng ner adresstjänsten nu, för alla kunder"], "l1", ["The leak stops; banks and debt collectors are without lookups.", "Läckan stoppas; banker och inkassoföretag står utan uppslag."], {
            set: "apiOff",
            pushback: [
              pb(["The clients call the ministry", "Kunderna ringer departementet"], ["Within the hour, a bank says it cannot verify addresses for new customers and a debt collector says its letters will now go to old addresses. Both have already called the ministry. How long can you keep the service off, and who decides when it comes back?", "Inom en timme säger en bank att den inte kan kontrollera adresser för nya kunder, och ett inkassoföretag att dess brev nu går till gamla adresser. Båda har redan ringt departementet. Hur länge kan ni hålla tjänsten stängd, och vem bestämmer när den kommer tillbaka?"]),
              pb(["Only one endpoint leaked", "Bara en funktion läckte"], ["The fault sits in the new batch endpoint; ordinary single lookups were checking the flag all along. Your shutdown stops every lookup to block one narrow path. Could you have closed only the batch endpoint, and why didn't you?", "Felet sitter i den nya batch-funktionen; vanliga enskilda uppslag har hela tiden kontrollerat markeringen. Er nedstängning stoppar varje uppslag för att stänga en smal väg. Kunde ni ha stängt bara batch-funktionen, och varför gjorde ni inte det?"]),
              pb(["Days of testing", "Dagar av testning"], ["{{person.cio.name}} says a fix is written, but the team wants to test it properly before anything restarts, and that will take days. Every day off costs the clients and adds to the pressure. Do you accept a long outage, or restart sooner on less testing?", "{{person.cio.name}} säger att en rättning är skriven, men teamet vill testa den ordentligt innan något startas, och det tar dagar. Varje dag utan tjänst kostar kunderna och ökar trycket. Accepterar ni ett långt avbrott, eller startar ni tidigare med mindre testning?"])
            ]
          }),
                    opt(["Keep it running and deploy a fix within hours", "Låt den gå och driftsätt en rättning inom några timmar"], "l1", ["Clients barely notice. Every hour, more addresses can leave.", "Kunderna märker knappt något. Varje timme kan fler adresser lämna."], {
            pushback: [
              pb(["Calls this morning", "Anrop i morse"], ["The log shows the batch endpoint was called again this morning, after you knew. Each call can return protected addresses in full. Can you justify every lookup made between now and the fix, if one of them reaches someone like the man last night?", "Loggen visar att batch-funktionen anropades igen i morse, efter att ni visste. Varje anrop kan lämna ut skyddade adresser i sin helhet. Kan ni försvara varje uppslag mellan nu och rättningen, om ett av dem når någon som mannen i natt?"]),
              pb(["“Within hours” slips", "”Inom några timmar” glider"], ["The first version of the fix breaks address lookups for ordinary people in testing, and the team needs more time. “Within hours” is turning into “tomorrow”. Do you still keep the service running?", "Den första versionen av rättningen förstör adressuppslag för vanliga personer i testet, och teamet behöver mer tid. ”Inom några timmar” håller på att bli ”i morgon”. Låter ni fortfarande tjänsten gå?"]),
              pb(["Whose signature?", "Vems underskrift?"], ["{{person.legal.name}} asks who will sign the decision to keep running a service that is known to leak protected addresses. It will be read aloud in any review. Whose name goes on it?", "{{person.legal.name}} frågar vem som skriver under beslutet att låta en tjänst gå som man vet läcker skyddade adresser. Det kommer att läsas upp i varje granskning. Vems namn står på det?"])
            ]
          }),
                    opt(["Fix it quietly and say nothing to the clients for now", "Rätta det i det tysta och säg ingenting till kunderna tills vidare"], "c3b", ["No disruption, and {{num.clients}} companies keep data they should never have had.", "Inga störningar, och {{num.clients}} företag behåller uppgifter de aldrig borde ha fått."], {
            set: "quietFix",
            pushback: [
              pb(["A client asks", "En kund frågar"], ["A developer at one client e-mails: their system has received addresses carrying a protection marker, and they want to know whether that is right. Staying quiet now means answering this directly. What do you write back?", "En utvecklare hos en kund mejlar: deras system har fått adresser med skyddsmarkering, och de undrar om det stämmer. Att tiga nu betyder att svara på just den frågan. Vad skriver ni tillbaka?"]),
              pb(["The data travels on", "Uppgifterna sprids vidare"], ["{{person.dpo.name}} points out that some of the {{num.clients}} clients sell address data on. Every day you say nothing, protected addresses can travel further. How do you stop that without telling anyone?", "{{person.dpo.name}} påpekar att en del av de {{num.clients}} kunderna säljer adressdata vidare. Varje dag ni tiger kan skyddade adresser spridas längre. Hur stoppar ni det utan att berätta för någon?"]),
              pb(["His employer doesn't know", "Hans arbetsgivare vet inget"], ["The man who found the woman works for one of these clients. Saying nothing means his employer keeps the addresses and has no reason to check what he looked up. Are you comfortable leaving that company in the dark?", "Mannen som hittade kvinnan arbetar hos en av de här kunderna. Att tiga betyder att hans arbetsgivare behåller adresserna och inte har någon anledning att kontrollera vad han slog upp. Kan ni leva med att lämna det företaget ovetande?"])
            ]
          })
        ])
      }),

      pg("l1", ["The caseworker", "Handläggaren"], [
        "{{person.hr.name}} has the caseworker on the phone. Her name has spread in the office as “the one who leaked the address”. She opened the record because the woman's mail was being returned, as the reason code says.\n\nShe asks what the agency will say about her, and whether she will be cleared in writing.",
        "{{person.hr.name}} har handläggaren i telefon. Hennes namn har spridits på kontoret som ”den som läckte adressen”. Hon öppnade posten eftersom kvinnans post kom i retur, precis som orsakskoden säger.\n\nHon frågar vad myndigheten kommer att säga om henne, och om hon kommer att bli friad skriftligt."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you do for the caseworker?", "Vad gör ni för handläggaren?"], ["Clears her in writing and tells colleagues the truth.", "Friar henne skriftligt och berättar sanningen för kollegorna."], [
                    opt(["Clear her in writing, tell colleagues the cause was a system fault, and apologise", "Fria henne skriftligt, berätta för kollegorna att orsaken var ett systemfel, och be om ursäkt"], "c3", ["Costs a little pride, and restores a colleague.", "Kostar lite prestige, och återupprättar en kollega."], {
            set: "reinstated",
            pushback: [
              pb(["The police are not done", "Polisen är inte klar"], ["The police say their investigation is still open and nobody has been ruled out yet. Clearing her in writing now could look as if the agency is deciding the case for them. Do you still sign it today?", "Polisen säger att utredningen fortfarande pågår och att ingen har avskrivits ännu. Att fria henne skriftligt nu kan se ut som att myndigheten avgör ärendet åt dem. Skriver ni ändå under i dag?"]),
              pb(["A message to every inbox", "Ett besked i varje inkorg"], ["Telling all colleagues that the cause was a system fault puts the leak in hundreds of inboxes before you have told the clients or the people exposed. One forwarded e-mail could reach a journalist. How much do you say, and to whom?", "Att berätta för alla kollegor att orsaken var ett systemfel lägger läckan i hundratals inkorgar innan ni berättat för kunderna eller dem som röjts. Ett vidarebefordrat mejl kan nå en journalist. Hur mycket säger ni, och till vem?"]),
              pb(["She wants it said publicly", "Hon vill att det sägs offentligt"], ["The caseworker thanks you, then asks for the same statement to be made publicly, because the rumour about her has already spread beyond the office. Is a private letter enough to undo a public rumour?", "Handläggaren tackar, och ber sedan att samma besked ges offentligt, eftersom ryktet om henne redan spridits utanför kontoret. Räcker ett internt brev för att rätta ett offentligt rykte?"])
            ]
          }),
                    opt(["Wait until the investigation is formally closed", "Vänta tills utredningen formellt är avslutad"], "c3", ["Procedurally tidy; she carries the rumour for weeks.", "Formellt korrekt; hon bär ryktet i veckor."], {
            pushback: [
              pb(["She goes on sick leave", "Hon blir sjukskriven"], ["{{person.hr.name}} reports that the caseworker is on sick leave, and her union asks why the agency will not say what it already knows. Is a tidy procedure worth losing a colleague who did nothing wrong?", "{{person.hr.name}} meddelar att handläggaren är sjukskriven, och facket frågar varför myndigheten inte säger det den redan vet. Är en prydlig process värd att förlora en kollega som inte gjort något fel?"]),
              pb(["Silence reads as guilt", "Tystnaden tolkas som skuld"], ["With no word from management, the office reads the silence as confirmation, and other caseworkers start avoiding protected records. Who handles the growing pile of returned-mail cases while you wait?", "Utan besked från ledningen tolkar kontoret tystnaden som en bekräftelse, och andra handläggare börjar undvika skyddade poster. Vem tar hand om den växande högen ärenden med post i retur medan ni väntar?"]),
              pb(["No closing date", "Inget slutdatum"], ["Nobody can say when the investigation will formally close: with the police and the regulator involved, it could be months. Your wait has no end. What is the real reason not to clear her now?", "Ingen kan säga när utredningen formellt avslutas: med polisen och tillsynsmyndigheten inblandade kan det ta månader. Er väntan har inget slut. Vad är det verkliga skälet att inte fria henne nu?"])
            ]
          })
        ])
      }),

      pg("c3", ["The people-search site", "Personsöksajten"], [
        "{{person.ciso.name}} has found worse. A people-search website that buys data from one of the client companies has, for two weeks, been showing current addresses for some of the protected people. Anyone can search it by name.\n\nThe site's owner is abroad and answers e-mail slowly. A shelter organisation has already found two of its own residents on it.",
        "{{person.ciso.name}} har hittat något värre. En personsöksajt som köper data från ett av kundföretagen har i två veckor visat aktuella adresser för en del av de skyddade personerna. Vem som helst kan söka på namn.\n\nSajtens ägare finns utomlands och svarar långsamt på e-post. En organisation för skyddade boenden har redan hittat två av sina egna boende där."
      ], {
        injects: [
          inj("b20-4", 180, "email", "customer", "critical", "confirmed", [
            "Shelter organisation: “Two of the women living with us are on a people-search site with their current address. How did this happen, and how many more are there?”",
            "Organisation för skyddade boenden: ”Två av kvinnorna som bor hos oss finns på en personsöksajt med sin nuvarande adress. Hur kunde det här hända, och hur många fler finns det?”"
          ], { headline: ["From a shelter", "Från ett skyddat boende"], tests: ["lo2"] })
        ],
        choice: ask(["How do you get the addresses off the site?", "Hur får ni bort adresserna från sajten?"], ["Gets the addresses removed fast, through every lever, without drawing attention to them.", "Får bort adresserna snabbt, med alla medel, utan att dra uppmärksamhet till dem."], [
                    opt(["Have the client company demand removal, and seek an urgent court order at the same time", "Låt kundföretaget kräva borttagning, och begär samtidigt ett brådskande domstolsbeslut"], "c4", ["Fast where it works, with a legal backstop.", "Snabbt där det fungerar, med en rättslig reserv."], {
            set: "takedown",
            pushback: [
              pb(["The client stalls", "Kunden förhalar"], ["The client company's lawyer says it sold the data in good faith and wants to know who pays for the removal work. Meanwhile the addresses stay up. Do you negotiate with the company, or go around it?", "Kundföretagets jurist säger att de sålde uppgifterna i god tro och vill veta vem som betalar för borttagningen. Under tiden ligger adresserna kvar. Förhandlar ni med företaget, eller går ni förbi det?"]),
              pb(["Court files can be read", "Domstolens handlingar kan läsas"], ["{{person.legal.name}} warns that an urgent application must describe what you want removed, and court files can be requested by anyone. You could end up listing the very people you are trying to hide. How do you seek the order without exposing them?", "{{person.legal.name}} varnar för att en brådskande ansökan måste beskriva vad ni vill få bort, och att domstolens handlingar kan begäras ut av vem som helst. Ni kan sluta med att lista just de personer ni försöker gömma. Hur begär ni beslutet utan att röja dem?"]),
              pb(["A court order may not reach", "Domstolsbeslutet når kanske inte fram"], ["The first legal opinion says an order here may take weeks to bind an owner abroad. The shelter calls again: another resident has found herself on the site. What do you do in the meantime?", "Det första juridiska utlåtandet säger att ett beslut här kan ta veckor innan det binder en ägare utomlands. Boendet ringer igen: ytterligare en boende har hittat sig själv på sajten. Vad gör ni under tiden?"])
            ]
          }),
                    opt(["Publicly warn that the site holds protected addresses", "Varna offentligt för att sajten innehåller skyddade adresser"], "c4", ["Pressure on the site, and a map for everyone looking.", "Press på sajten, och en karta för alla som letar."], {
            set: "publicFirst",
            pushback: [
              pb(["Traffic jumps", "Trafiken ökar"], ["Within an hour of your warning, the site's traffic jumps: people are searching names to see who is on it. Your warning has told everyone looking for someone exactly where to look. Do you withdraw it, and would that help now?", "Inom en timme efter er varning ökar trafiken till sajten: folk söker på namn för att se vem som finns där. Er varning har talat om för alla som letar efter någon exakt var de ska leta. Drar ni tillbaka den, och skulle det hjälpa nu?"]),
              pb(["Nobody asked the shelters", "Ingen frågade boendena"], ["The shelter organisation calls, furious: nobody warned them, and residents learned from the news that their address may be online. Several are panicking. Do you have anyone ready to take those calls tonight?", "Organisationen för skyddade boenden ringer, rasande: ingen förvarnade dem, och boende fick veta via nyheterna att deras adress kan finnas på nätet. Flera är panikslagna. Har ni någon redo att ta de samtalen i kväll?"]),
              pb(["The owner shrugs", "Ägaren rycker på axlarna"], ["The site's owner answers the public pressure with one line: they publish what they bought legally. Public shame has no effect on them. Now that the warning is out, what is your next lever?", "Sajtens ägare besvarar trycket med en rad: de publicerar det de köpt lagligt. Offentlig skam biter inte på dem. Nu när varningen är ute, vad är ert nästa påtryckningsmedel?"])
            ]
          }),
                    opt(["E-mail the site owner and wait for an answer", "Mejla sajtens ägare och vänta på svar"], "c4", ["Polite, and slow while the addresses stay up.", "Artigt, och långsamt medan adresserna ligger kvar."], {
            pushback: [
              pb(["No reply after a day", "Inget svar efter ett dygn"], ["A day later there is still no answer, and the shelter has found a third resident on the site. Every hour the page stays up, someone can search it. How long do you wait before trying something else?", "Ett dygn senare har inget svar kommit, och boendet har hittat en tredje boende på sajten. Varje timme sidan ligger kvar kan någon söka på den. Hur länge väntar ni innan ni provar något annat?"]),
              pb(["“We sent an e-mail”", "”Vi har skickat ett mejl”"], ["The shelter organisation asks what the agency is doing, and all you can say is that you have sent an e-mail. Its staff are moving residents tonight because of the site. How do you defend that answer to them?", "Organisationen för skyddade boenden frågar vad myndigheten gör, och allt ni kan säga är att ni har skickat ett mejl. Personalen flyttar boende i natt på grund av sajten. Hur försvarar ni det svaret inför dem?"]),
              pb(["The client could act today", "Kunden kan agera i dag"], ["{{person.legal.name}} points out that the client company that sold the data has a contract with the site and could demand removal today. Nobody has asked it to. Why rely on a stranger abroad rather than a company you already work with?", "{{person.legal.name}} påpekar att kundföretaget som sålde uppgifterna har avtal med sajten och kan kräva borttagning i dag. Ingen har bett dem. Varför förlita sig på en okänd ägare utomlands i stället för ett företag ni redan samarbetar med?"])
            ]
          })
        ])
      }),

      pg("c3b", ["The quiet fix", "Den tysta rättningen"], [
        "The fix is in, and the service runs as before. But {{num.clients}} companies still hold protected addresses in their own systems, and some of them sell data on. Without being told, none of them will delete anything.\n\n{{person.legal.name}} warns that every day of silence will be read later as a decision.",
        "Rättningen är på plats, och tjänsten går som förut. Men {{num.clients}} företag har fortfarande skyddade adresser i sina egna system, och en del av dem säljer data vidare. Utan att få veta något kommer ingen av dem att radera något.\n\n{{person.legal.name}} varnar för att varje dag av tystnad senare kommer att läsas som ett beslut."
      ], {
        choice: ask(["Do you tell the clients?", "Berättar ni för kunderna?"], ["Tells every client what they received and requires deletion, today.", "Berättar för varje kund vad de fått och kräver radering, i dag."], [
                    opt(["Tell every client today and require proof of deletion", "Berätta för varje kund i dag och kräv bevis på radering"], "c4", ["Late, and the right correction.", "Sent, och den rätta korrigeringen."], {
            pushback: [
              pb(["“Why only now?”", "”Varför först nu?”"], ["The first client to reply asks when the agency found the fault, and why it is hearing about it only now. Any honest answer reveals the days of silence. What do you tell them?", "Den första kunden som svarar frågar när myndigheten hittade felet, och varför de får veta det först nu. Varje ärligt svar avslöjar dagarna av tystnad. Vad säger ni?"]),
              pb(["Proof nobody can give", "Bevis som ingen kan ge"], ["Several clients say they cannot prove deletion: the addresses have gone into backups and partner systems they do not control. A demand for proof may get you only promises. What will you accept as proof?", "Flera kunder säger att de inte kan bevisa radering: adresserna har hamnat i säkerhetskopior och partners system som de inte styr över. Ett krav på bevis ger er kanske bara löften. Vad godtar ni som bevis?"]),
              pb(["Already sold on", "Redan sålt vidare"], ["One client admits it has already passed address data on to its own buyers. Telling your clients does not reach theirs. How far down the chain are you prepared to chase it?", "En kund medger att den redan lämnat adressdata vidare till sina egna köpare. Att berätta för era kunder når inte deras. Hur långt ner i kedjan är ni beredda att jaga uppgifterna?"])
            ]
          }),
                    opt(["Wait for the internal review to finish first", "Vänta tills den interna granskningen är klar"], "c4", ["The data stays where it went.", "Uppgifterna stannar där de hamnade."], {
            pushback: [
              pb(["The warning is in writing", "Varningen finns skriftligt"], ["{{person.legal.name}} puts the warning in an e-mail: every day of silence is a decision, and this one is now documented. If another protected person is found, that e-mail will be read first. Do you still wait?", "{{person.legal.name}} skriver varningen i ett mejl: varje dag av tystnad är ett beslut, och det här är nu dokumenterat. Om ännu en skyddad person hittas blir det mejlet det första som läses. Väntar ni ändå?"]),
              pb(["A client notices", "En kund märker det"], ["A client's data team spots protection markers in records it received and asks you directly what they mean. Waiting for the review means answering vaguely or not at all. Which will it be?", "En kunds dataavdelning ser skyddsmarkeringar i poster de fått och frågar er rakt ut vad de betyder. Att vänta på granskningen innebär att svara vagt eller inte alls. Vilket blir det?"]),
              pb(["The review needs the clients", "Granskningen behöver kunderna"], ["The reviewers say they cannot finish without knowing what each client did with the addresses. The review you are waiting for depends on the clients you are not telling. How does this end?", "Granskarna säger att de inte kan bli klara utan att veta vad varje kund gjort med adresserna. Granskningen ni väntar på är beroende av kunderna ni inte berättar för. Hur slutar det här?"])
            ]
          })
        ])
      }),

      pg("c4", ["Who to tell", "Vem som ska få veta"], [
        "{{num.exposed|number}} people with protected identities must be told that their address may be known. The normal way to tell someone is a letter. For these people, a letter to the leaked address confirms it, and an unexpected letter can be opened by the very person they are hiding from.\n\nThe police can help with the highest-risk cases, but not with all of them, and not this week.",
        "{{num.exposed|number}} personer med skyddade personuppgifter måste få veta att deras adress kan vara känd. Det vanliga sättet att meddela någon är ett brev. För de här personerna bekräftar ett brev till den läckta adressen just den adressen, och ett oväntat brev kan öppnas av precis den person de gömmer sig för.\n\nPolisen kan hjälpa till med fallen med högst risk, men inte med alla, och inte den här veckan."
      ], {
        discuss: [q("How do you reach someone in hiding without revealing them?", "Hur når ni någon som håller sig gömd utan att avslöja hen?", ["securityOfficer", "dpo"])],
        choice: ask(["How do you tell the people exposed?", "Hur berättar ni för dem som röjts?"], ["Contacts them personally through trained staff and the police, highest risk first.", "Kontaktar dem personligen via utbildad personal och polisen, högst risk först."], [
                    opt(["Personal contact through trained staff, the police and shelters, highest risk first", "Personlig kontakt via utbildad personal, polisen och skyddade boenden, högst risk först"], "l2", ["Slow and careful; the last people are reached after a week.", "Långsamt och varsamt; de sista nås efter en vecka."], {
            set: "personalNotice",
            pushback: [
              pb(["Who is highest risk?", "Vem har högst risk?"], ["Ranking {{num.exposed|number}} people by risk needs facts the agency does not hold: who each person fled, and whether that person is still looking. Police records help for some, not most. How do you decide who waits a week?", "Att rangordna {{num.exposed|number}} personer efter risk kräver uppgifter som myndigheten inte har: vem varje person flytt från, och om den personen fortfarande letar. Polisens register hjälper för några, inte för de flesta. Hur bestämmer ni vem som får vänta en vecka?"]),
              pb(["A call can also expose", "Ett samtal kan också röja"], ["A shelter adviser warns that a call from an unknown number, or a stranger at the door, can be noticed by the wrong person in the home. Personal contact is not automatically safe. How will your staff know they are talking to the right person, alone?", "En rådgivare på ett skyddat boende varnar för att ett samtal från okänt nummer, eller en främling vid dörren, kan uppmärksammas av fel person i hemmet. Personlig kontakt är inte automatiskt säker. Hur vet er personal att de talar med rätt person, i enrum?"]),
              pb(["They hear it elsewhere first", "De hör det någon annanstans först"], ["With few trained staff and limited police help, most people will hear nothing for days. Some will learn about the leak from a friend, a shelter or a rumour before you reach them. What do you say to someone who calls angry that you never told them?", "Med få utbildade medarbetare och begränsad hjälp från polisen kommer de flesta inte att höra något på flera dagar. En del får veta om läckan från en vän, ett boende eller ett rykte innan ni når dem. Vad säger ni till den som ringer arg för att ni aldrig hörde av er?"])
            ]
          }),
                    opt(["A letter to everyone this week, marked confidential", "Ett brev till alla den här veckan, märkt konfidentiellt"], "l2", ["Fast, and each letter goes to an address that is no longer safe.", "Snabbt, och varje brev går till en adress som inte längre är säker."], {
            pushback: [
              pb(["Who opens the post?", "Vem öppnar posten?"], ["A shelter adviser points out that each letter goes to the very address that leaked, and an envelope from your agency confirms that the right person lives there. Some share post with relatives they are hiding from. Who opens the post in those homes?", "En rådgivare på ett skyddat boende påpekar att varje brev går till just den adress som läckt, och att ett kuvert från er myndighet bekräftar att rätt person bor där. En del delar post med släktingar de gömmer sig för. Vem öppnar posten i de hemmen?"]),
              pb(["Some have already moved", "En del har redan flyttat"], ["A number of the people exposed have already moved because they felt unsafe. Letters to their old addresses will be read by whoever lives there now. How do you stop a confidential letter from becoming a new leak?", "En del av dem som röjts har redan flyttat för att de inte kände sig trygga. Brev till deras gamla adresser läses av den som bor där nu. Hur hindrar ni att ett konfidentiellt brev blir en ny läcka?"]),
              pb(["Stop the print run", "Stoppa utskicket"], ["The shelter organisation asks you to stop the letters before they are printed, and offers to help reach people another way, more slowly. Halting the mailing costs you the week you promised. Do you stop it?", "Organisationen för skyddade boenden ber er stoppa breven innan de skrivs ut, och erbjuder hjälp att nå folk på ett annat, långsammare sätt. Att stoppa utskicket kostar er den vecka ni lovat. Stoppar ni det?"])
            ]
          }),
                    opt(["A public announcement asking protected people to contact you", "Ett offentligt meddelande där skyddade personer ombeds kontakta er"], "l2", ["Reaches many, and tells everyone else the addresses are out there.", "Når många, och talar om för alla andra att adresserna finns ute."], {
            set: "publicFirst",
            pushback: [
              pb(["The wrong people call", "Fel personer ringer"], ["Within hours the contact line is ringing, and not only with protected people. Some callers ask whether a particular named person is on the list. How will your staff tell a frightened victim from someone hunting for one?", "Inom några timmar ringer kontaktlinjen oavbrutet, och inte bara skyddade personer. En del frågar om en viss namngiven person finns på listan. Hur ska er personal skilja ett rädd offer från någon som jagar ett?"]),
              pb(["Everyone now knows", "Nu vet alla"], ["Your announcement tells everyone that protected addresses are out there, including people who have been searching for someone. Some of them will now search harder. Was reaching more people worth telling them that?", "Ert meddelande talar om för alla att skyddade adresser finns ute, även för dem som letat efter någon. En del av dem kommer nu att leta ännu mer. Var det värt det att nå fler, när de också fick veta det?"]),
              pb(["The careful ones miss it", "De försiktiga missar det"], ["Many people in hiding avoid the news and social media on purpose. A public appeal reaches the most careful people last. How will you reach the ones who are doing everything right?", "Många som håller sig gömda undviker medvetet nyheter och sociala medier. Ett offentligt upprop når de mest försiktiga sist. Hur når ni dem som gör allt rätt?"])
            ]
          }),
                    opt(["Restart the address service now, as banks and debt collectors are demanding, before the fix is fully verified", "Starta adresstjänsten igen nu, som banker och inkassoföretag kräver, innan rättningen är helt verifierad"], "l2", ["Reverses your shutdown under pressure from the clients.", "Upphäver er nedstängning under tryck från kunderna."], {
            requires: "apiOff", set: "apiRestoredEarly", effects: { trust: -1 },
            pushback: [
              pb(["One test, one endpoint", "Ett test, en funktion"], ["{{person.cio.name}} warns that the fix has passed one test, on the batch endpoint only. Nobody has yet checked whether any other path skips the protection flag. Are you willing to restart on that basis?", "{{person.cio.name}} varnar för att rättningen klarat ett test, och bara för batch-funktionen. Ingen har ännu kontrollerat om någon annan väg hoppar över skyddsmarkeringen. Är ni beredda att starta på den grunden?"]),
              pb(["Access for those still holding data", "Åtkomst för dem som har kvar uppgifterna"], ["Some of the clients pushing hardest for a restart received protected addresses during the fault and have not confirmed deletion. Restarting gives them full access again first. Do you restart for everyone, or only for clients who have cleaned up?", "En del av kunderna som trycker hårdast på för en omstart fick skyddade adresser under felet och har inte bekräftat radering. En omstart ger dem full åtkomst igen först av alla. Startar ni för alla, eller bara för kunder som städat upp?"]),
              pb(["The banks came first", "Bankerna gick först"], ["A shelter adviser hears that the service is back while people are still waiting to be told their address leaked. To the shelters, the agency has put the banks first. How do you explain the timing to them?", "En rådgivare på ett skyddat boende får höra att tjänsten är igång igen medan folk fortfarande väntar på besked om att deras adress läckt. För boendena ser det ut som att myndigheten satt bankerna först. Hur förklarar ni tidpunkten för dem?"])
            ]
          })
        ])
      }),

      pg("l2", ["The clients", "Kunderna"], [
        "The {{num.clients}} companies that received protected addresses react differently. Most banks promise deletion at once. Two debt collectors say the data is now part of their case files and that the law allows them to keep it. One company does not answer.\n\nThe man who found the woman worked at one of the debt collectors.",
        "De {{num.clients}} företag som fått skyddade adresser reagerar olika. De flesta banker lovar radering direkt. Två inkassoföretag säger att uppgifterna nu ingår i deras ärenden och att lagen tillåter dem att behålla dem. Ett företag svarar inte.\n\nMannen som hittade kvinnan arbetade på ett av inkassoföretagen."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["How hard do you push the clients?", "Hur hårt pressar ni kunderna?"], ["Requires deletion with proof and suspends access for anyone who refuses.", "Kräver radering med bevis och stänger av åtkomsten för den som vägrar."], [
                    opt(["Require deletion with proof, and suspend access for anyone who refuses", "Kräv radering med bevis, och stäng av åtkomsten för den som vägrar"], "c5", ["Firm; some clients will complain to the ministry.", "Bestämt; en del kunder kommer att klaga hos departementet."], {
            pushback: [
              pb(["The law may be on their side", "Lagen kan vara på deras sida"], ["The two debt collectors' lawyers reply that the law lets them keep data in active case files, and that suspending their access breaches the contract. {{person.legal.name}} is not sure they are wrong. Do you suspend them anyway and risk losing in court?", "De två inkassoföretagens jurister svarar att lagen tillåter dem att behålla uppgifter i pågående ärenden, och att en avstängning bryter mot avtalet. {{person.legal.name}} är inte säker på att de har fel. Stänger ni av dem ändå och riskerar att förlora i domstol?"]),
              pb(["“Punished for your fault”", "”Straffade för ert fel”"], ["A ministry official calls: the debt collectors have complained that the agency is punishing its clients for its own mistake. They did not ask for the protected addresses. Is it fair to cut off companies for holding data you sent them?", "En tjänsteman på departementet ringer: inkassoföretagen har klagat på att myndigheten straffar sina kunder för sitt eget misstag. De bad inte om de skyddade adresserna. Är det rimligt att stänga av företag för att de har uppgifter ni själva skickat?"]),
              pb(["A signed letter is not proof", "Ett undertecknat brev är inget bevis"], ["The banks send signed deletion certificates within a day, but nobody can check their backups or their partners. “Proof” is turning into a promise on letterhead. What does proof actually mean here, and will you audit it?", "Bankerna skickar undertecknade intyg om radering inom ett dygn, men ingen kan kontrollera deras säkerhetskopior eller partner. ”Bevis” håller på att bli ett löfte på brevpapper. Vad betyder bevis egentligen här, och kommer ni att granska det?"])
            ]
          }),
                    opt(["Ask politely and trust their answers", "Be artigt och lita på deras svar"], "c5", ["Easy, and two of them have already said no.", "Enkelt, och två av dem har redan sagt nej."], {
            pushback: [
              pb(["The silent company", "Företaget som tiger"], ["The company that did not answer still has not answered. Trusting their answers only works when there is an answer. What is your next step with them?", "Företaget som inte svarade har fortfarande inte svarat. Att lita på svaren fungerar bara när det finns ett svar. Vad är ert nästa steg med dem?"]),
              pb(["The man's employer", "Mannens arbetsgivare"], ["One of the debt collectors that refused is where the man who found the woman worked. Trusting its answer means trusting the company whose employee used the data. Can you defend that line?", "Ett av inkassoföretagen som vägrade är där mannen som hittade kvinnan arbetade. Att lita på deras svar är att lita på företaget vars anställd använde uppgifterna. Kan ni försvara den linjen?"]),
              pb(["What the shelters will hear", "Vad boendena kommer att höra"], ["A shelter adviser asks what the agency did when two companies said no. The honest answer is “we asked politely”. Will the shelters accept that their residents' addresses are still sitting in those case files?", "En rådgivare på ett skyddat boende frågar vad myndigheten gjorde när två företag sa nej. Det ärliga svaret är ”vi bad artigt”. Kommer boendena att godta att deras boendes adresser fortfarande ligger i de där ärendena?"])
            ]
          })
        ])
      }),

      pg("c5", ["A second case", "Ett andra fall"], [
        "{{time.T+2880|weekday|cap}}. A man with a protected identity calls the contact centre. Someone has been photographing his building and left a note in his mailbox with his old name on it. He is one of the {{num.exposed|number}}.\n\nHe wants to move today. The normal process for help with moving costs takes weeks and requires a police decision.",
        "{{time.T+2880|weekday|cap}}. En man med skyddade personuppgifter ringer kontaktcentret. Någon har fotograferat hans hus och lagt en lapp i hans brevlåda med hans gamla namn på. Han är en av de {{num.exposed|number}}.\n\nHan vill flytta i dag. Den vanliga processen för hjälp med flyttkostnader tar veckor och kräver ett beslut från polisen."
      ], {
        variants: [vr("apiRestoredEarly", [
          "{{time.T+2880|weekday|cap}}. The address service has been back for a day when a man with a protected identity calls: someone has photographed his building and left a note with his old name. His address was looked up again yesterday, through the restarted service, by a client that had not yet deployed your fix.\n\nHe wants to move today. The normal process takes weeks.",
          "{{time.T+2880|weekday|cap}}. Adresstjänsten har varit igång i ett dygn när en man med skyddade personuppgifter ringer: någon har fotograferat hans hus och lagt en lapp med hans gamla namn. Hans adress slogs upp igen i går, via den återstartade tjänsten, av en kund som ännu inte infört er rättning.\n\nHan vill flytta i dag. Den vanliga processen tar veckor."
        ], ["Because you restarted the service early, one more address leaked.", "Eftersom ni startade tjänsten för tidigt läckte ytterligare en adress."])],
        choice: ask(["How do you help him?", "Hur hjälper ni honom?"], ["Pays for an emergency move today and sorts out the paperwork later.", "Betalar en akut flytt i dag och ordnar pappersarbetet senare."], [
                    opt(["Fund emergency moves for anyone at immediate risk, decided today", "Bekosta akuta flyttar för alla med omedelbar risk, beslutat i dag"], "l3", ["Expensive, and the agency has no budget line for it.", "Dyrt, och myndigheten har ingen budgetpost för det."], {
            set: "relocation",
            pushback: [
              pb(["No authority to spend", "Inget mandat att betala"], ["The finance unit says there is no budget line and no clear legal basis for paying private moves, and that it may need government approval. Do you spend money you are not sure you are allowed to spend?", "Ekonomienheten säger att det saknas budgetpost och tydligt rättsligt stöd för att betala privata flyttar, och att det kan kräva regeringens godkännande. Lägger ni pengar som ni inte är säkra på att ni får lägga?"]),
              pb(["Everyone is at risk", "Alla är i riskzonen"], ["Once word spreads, dozens of the people exposed call asking to move too. All are frightened; few have a note in their mailbox. Who decides who counts as “immediate risk”, and on what evidence?", "När det sprids ringer dussintals av dem som röjts och vill också flytta. Alla är rädda; få har en lapp i brevlådan. Vem avgör vem som räknas som ”omedelbar risk”, och på vilka grunder?"]),
              pb(["A new address, same register", "Ny adress, samma register"], ["Moving him today gives him a new address, and it goes into the same register whose service just leaked. The review is not finished. Can you promise him the new address is safe?", "Att flytta honom i dag ger honom en ny adress, och den hamnar i samma register vars tjänst just läckt. Granskningen är inte klar. Kan ni lova honom att den nya adressen är säker?"])
            ]
          }),
                    opt(["Fast-track his case through the normal process", "Snabba på hans ärende inom den vanliga processen"], "l3", ["Faster than usual; still days.", "Snabbare än vanligt; fortfarande dagar."], {
            pushback: [
              pb(["Two days at best", "Två dagar i bästa fall"], ["Even fast-tracked, the move needs a police decision, and the police say two days at best. He calls back: the same car is parked outside again. What do you tell him tonight?", "Även med förtur kräver flytten ett beslut från polisen, och polisen säger två dagar i bästa fall. Han ringer igen: samma bil står parkerad utanför. Vad säger ni till honom i kväll?"]),
              pb(["Why him and not them?", "Varför han och inte de?"], ["Staff ask why this man gets priority while others exposed by the same fault wait the usual weeks. Next time, whoever calls loudest will expect the same. Do you fast-track everyone, or only those who call?", "Personalen frågar varför just den här mannen får förtur medan andra som röjts av samma fel väntar de vanliga veckorna. Nästa gång kommer den som ringer högst att vänta sig samma sak. Ger ni alla förtur, eller bara dem som ringer?"]),
              pb(["“You caused this”", "”Det är ni som orsakat det här”"], ["He says the agency caused this, and yet asks him to fill in the same forms as anyone else. He mentions that a journalist has already been in touch with him. Does the agency owe him more than a faster queue?", "Han säger att det är myndigheten som orsakat det här, och ändå ber den honom fylla i samma blanketter som alla andra. Han nämner att en journalist redan kontaktat honom. Är myndigheten skyldig honom mer än en snabbare kö?"])
            ]
          }),
                    opt(["Refer him to the police", "Hänvisa honom till polisen"], "l3", ["Correct on paper. He hears “not our problem”.", "Korrekt på papperet. Han hör ”inte vårt problem”."], {
            pushback: [
              pb(["Sent back again", "Skickad tillbaka igen"], ["The police say they can respond to threats, but they do not pay for moves and cannot give him a new address. He calls you back after being passed between two authorities in one afternoon. Who does he call next?", "Polisen säger att de kan agera på hot, men att de inte betalar flyttar och inte kan ge honom en ny adress. Han ringer er igen efter att ha skickats mellan två myndigheter på en eftermiddag. Vem ringer han nu?"]),
              pb(["“The police didn't leak it”", "”Polisen läckte den inte”"], ["He puts it plainly: the police did not leak his address, you did. A referral hands your consequence to someone else. Is that how you want this call recorded?", "Han säger det rakt ut: det var inte polisen som läckte hans adress, det var ni. En hänvisning lämnar över er konsekvens till någon annan. Är det så ni vill att samtalet ska dokumenteras?"]),
              pb(["Is that the policy?", "Är det policyn?"], ["A shelter adviser hears about the call and asks whether every exposed person will be told to call the police. If so, the shelters will be left with everything else. What is the agency's own role for the people its service exposed?", "En rådgivare på ett skyddat boende hör om samtalet och frågar om alla som röjts kommer att hänvisas till polisen. I så fall blir allt annat kvar hos boendena. Vilken är myndighetens egen roll för dem som dess tjänst röjt?"])
            ]
          })
        ])
      }),

      pg("l3", ["The ministry", "Departementet"], [
        "The ministry wants a written briefing by the end of the day: how many, how long, who knew, and whether anyone has been harmed. The minister has a question time in parliament tomorrow.\n\n{{person.legal.name}} notes that whatever you write will be a public document.",
        "Departementet vill ha en skriftlig lägesbild före dagens slut: hur många, hur länge, vem som visste och om någon har kommit till skada. Ministern har frågestund i riksdagen i morgon.\n\n{{person.legal.name}} påpekar att allt ni skriver blir en allmän handling."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["What do you put in the briefing?", "Vad skriver ni i lägesbilden?"], ["States the facts, including the harm already known and what is not yet known.", "Redovisar fakta, även den skada som redan är känd och det som ännu inte är känt."], [
                    opt(["All facts, including the woman who was found and the unknowns", "Alla fakta, även kvinnan som hittades och det som är okänt"], "c6", ["Uncomfortable reading for the minister, and accurate.", "Obekväm läsning för ministern, och korrekt."], {
            pushback: [
              pb(["Has anyone asked her?", "Har någon frågat henne?"], ["Nobody has asked the woman whether her case may be described in a document that will be public. Even without her name, the details could identify her. Do you ask her first, and what if she says no?", "Ingen har frågat kvinnan om hennes fall får beskrivas i en handling som blir allmän. Även utan namn kan detaljerna peka ut henne. Frågar ni henne först, och vad gör ni om hon säger nej?"]),
              pb(["The minister's office pushes back", "Ministerns kansli trycker på"], ["The minister's press secretary asks you to soften the unknowns: the minister cannot say “we don't know” in parliament tomorrow. Do you rewrite the briefing to help the minister, or hold to what is true?", "Ministerns pressekreterare ber er tona ner det okända: ministern kan inte säga ”vi vet inte” i riksdagen i morgon. Skriver ni om lägesbilden för att hjälpa ministern, eller håller ni fast vid det som är sant?"]),
              pb(["An unproven sentence", "En obevisad mening"], ["Listing the unknowns means writing that more people may already have been found, without any proof. The minister will be asked about that sentence. Can you stand behind something you have not confirmed?", "Att redovisa det okända innebär att skriva att fler kan ha hittats redan, utan bevis. Ministern kommer att få frågor om just den meningen. Kan ni stå för något ni inte har bekräftat?"])
            ]
          }),
                    opt(["Numbers and measures, without individual cases", "Siffror och åtgärder, utan enskilda fall"], "c6", ["Protects privacy, and leaves out the harm.", "Skyddar integriteten, och utelämnar skadan."], {
            pushback: [
              pb(["The question is not answered", "Frågan besvaras inte"], ["The ministry asked a direct question: has anyone been harmed? A briefing with numbers only does not answer it. What will the minister say in parliament when asked exactly that?", "Departementet ställde en direkt fråga: har någon kommit till skada? En lägesbild med bara siffror besvarar den inte. Vad säger ministern i riksdagen när just den frågan kommer?"]),
              pb(["It will come out", "Det kommer att komma fram"], ["The police and the shelters both know about the woman who was found. If it emerges after the minister has spoken, your briefing will look like concealment. Is privacy really the reason for leaving it out?", "Både polisen och boendena känner till kvinnan som hittades. Om det kommer fram efter att ministern talat kommer er lägesbild att se ut som ett mörkande. Är integriteten verkligen skälet att utelämna det?"]),
              pb(["Legal and comms disagree", "Juristen och kommunikatören är oense"], ["{{person.legal.name}} supports the narrow briefing; {{person.comms.name}} says a public document that leaves out known harm will become the story itself. Who decides, and on what grounds?", "{{person.legal.name}} stöder den smala lägesbilden; {{person.comms.name}} säger att en allmän handling som utelämnar känd skada själv blir nyheten. Vem avgör, och på vilka grunder?"])
            ]
          })
        ])
      }),

      pg("c6", ["The journalist", "Journalisten"], [
        "A reporter from a national newspaper has spoken to the shelter organisation. They ask {{person.comms.name}}: how many protected people were exposed, for how long, and has anyone been harmed?\n\nThe woman who was found has asked the agency not to mention her case. The article runs tomorrow.",
        "En reporter från en rikstidning har talat med organisationen för skyddade boenden. Hen frågar {{person.comms.name}}: hur många skyddade personer röjdes, hur länge, och har någon kommit till skada?\n\nKvinnan som hittades har bett myndigheten att inte nämna hennes fall. Artikeln publiceras i morgon."
      ], {
        injects: [
          inj("b20-5", 4320, "mediaEnquiry", "media", "high", "confirmed", [
            "“How many people with protected identities were exposed, for how long, and has anyone come to harm as a result? We publish tomorrow.”",
            "”Hur många personer med skyddade personuppgifter röjdes, hur länge, och har någon kommit till skada till följd av det? Vi publicerar i morgon.”"
          ], { headline: ["National newspaper", "Rikstidning"], tests: ["lo4"] })
        ],
        choice: ask(["What do you tell the journalist?", "Vad säger ni till journalisten?"], ["Gives the numbers and says that harm has occurred, without identifying anyone.", "Ger siffrorna och säger att skada har uppstått, utan att identifiera någon."], [
                    opt(["Give the numbers and the duration, and confirm that people have been put at risk, without details of any case", "Ge siffrorna och tiden, och bekräfta att människor har utsatts för risk, utan detaljer om något fall"], "c7", ["Honest and protective at once.", "Ärligt och skyddande på samma gång."], {
            pushback: [
              pb(["“Risk to whom?”", "”Risk för vem?”"], ["The reporter follows up at once: risk to whom, and has anyone actually been found? Confirming risk invites the next question. How do you answer without describing the case of the woman who asked you not to?", "Reportern följer genast upp: risk för vem, och har någon faktiskt hittats? Att bekräfta risk bjuder in nästa fråga. Hur svarar ni utan att beskriva fallet med kvinnan som bett er låta bli?"]),
              pb(["They read it in the paper", "De läser det i tidningen"], ["Publishing how many people were exposed will reach all of them, including those your staff have not yet contacted. Some will learn from the paper that their address is out. Is that how you want them to find out?", "När antalet röjda publiceras når det alla, även dem som er personal ännu inte kontaktat. En del kommer att läsa i tidningen att deras adress är ute. Är det så ni vill att de ska få veta?"]),
              pb(["The clients want out of it", "Kunderna vill hållas utanför"], ["A bank and a debt collector ask you not to say how many companies received the data, fearing their names will follow. They warn of legal action if they are identified. Do you give the full numbers anyway?", "En bank och ett inkassoföretag ber er att inte säga hur många företag som fått uppgifterna, av rädsla för att deras namn ska följa. De varnar för rättsliga åtgärder om de pekas ut. Ger ni ändå alla siffror?"])
            ]
          }),
                    opt(["Give the numbers, and decline to comment on harm", "Ge siffrorna, och avböj att kommentera skada"], "c7", ["Defensible, and the shelter will fill in the rest.", "Försvarbart, och boendet kommer att fylla i resten."], {
            pushback: [
              pb(["The shelters fill the gap", "Boendena fyller luckan"], ["The reporter has already heard from the shelters about frightened residents moving in the night. If you decline to comment on harm, their account stands alone. Do you want the shelters to be the only voice on harm?", "Reportern har redan hört från boendena om rädda boende som flyttat mitt i natten. Om ni avböjer att kommentera skada står deras berättelse ensam. Vill ni att boendena ska vara den enda rösten om skada?"]),
              pb(["The headline writes itself", "Rubriken skriver sig själv"], ["{{person.comms.name}} warns that the headline will likely read “Agency refuses to say whether anyone was harmed”. Silence about harm reads as hiding harm. Is that better than an answer?", "{{person.comms.name}} varnar för att rubriken troligen blir ”Myndigheten vägrar säga om någon kommit till skada”. Tystnad om skada uppfattas som att dölja skada. Är det bättre än ett svar?"]),
              pb(["Not false, not whole", "Inte falskt, inte helt"], ["You know of at least one family that fled their home in the night. Declining to comment is not a lie, but it is not the whole truth either. If you are asked later what you knew today, how will you explain this choice?", "Ni känner till minst en familj som flytt sitt hem mitt i natten. Att avböja kommentar är ingen lögn, men inte heller hela sanningen. Om ni senare får frågan vad ni visste i dag, hur förklarar ni valet?"])
            ]
          }),
                    opt(["Say it was a supplier's technical fault and that, as far as you know, nobody was harmed", "Säg att det var ett tekniskt fel hos en leverantör och att, så vitt ni vet, ingen har kommit till skada"], "x1", ["Calm, and untrue.", "Lugnt, och osant."], {
            effects: { media: 1, trust: -1 },
            pushback: [
              pb(["Everyone here knows", "Alla här vet"], ["Everyone in the room knows that a woman and her children escaped through a neighbour's flat. “As far as we know, nobody was harmed” is about to go on record. Who will put their name to that sentence?", "Alla i rummet vet att en kvinna och hennes barn flydde via en grannes lägenhet. ”Så vitt vi vet har ingen kommit till skada” ska just gå till publicering. Vem sätter sitt namn under den meningen?"]),
              pb(["The supplier objects", "Leverantören protesterar"], ["The supplier's account manager calls: naming them publicly before any review breaks the contract's confidentiality clause, and they dispute that the fault was theirs alone. Do you stand by blaming them in print?", "Leverantörens kundansvarige ringer: att peka ut dem offentligt innan någon granskning bryter mot avtalets sekretessklausul, och de bestrider att felet bara var deras. Står ni fast vid att skylla på dem i tidningen?"]),
              pb(["The reporter will check", "Reportern kommer att kontrollera"], ["The reporter has already spoken to the shelter organisation, which has told them about residents moving in fear. If they check your statement with the shelters, what will they hear?", "Reportern har redan talat med organisationen för skyddade boenden, som berättat om boende som flyttat i rädsla. Om reportern stämmer av ert uttalande med boendena, vad får hen höra?"])
            ]
          })
        ])
      }),

      pg("c7", ["The regulator", "Tillsynsmyndigheten"], [
        "The breach report to {{reg.dpaShort}} is due. The fault was live for {{num.days}} days before anyone noticed, and the agency's own monitoring never flagged it; a violent man's visit did.\n\n{{person.dpo.name}} asks how much of that goes into the report.",
        "Anmälan till {{reg.dpaShort}} ska in. Felet var aktivt i {{num.days}} dagar innan någon märkte det, och myndighetens egen övervakning flaggade det aldrig; en våldsam mans besök gjorde det.\n\n{{person.dpo.name}} frågar hur mycket av det som ska med i anmälan."
      ], {
        choice: ask(["What do you report?", "Vad anmäler ni?"], ["Reports everything, including how long it went unnoticed and how it was found.", "Anmäler allt, även hur länge det pågick obemärkt och hur det upptäcktes."], [
                    opt(["Everything, including how long it went unnoticed and how it was found", "Allt, även hur länge det pågick obemärkt och hur det upptäcktes"], "l4", ["Damning for your monitoring, and the regulator will find it anyway.", "Förödande för er övervakning, och tillsynsmyndigheten hittar det ändå."], {
            set: "reportedFully",
            pushback: [
              pb(["In your own words", "Med era egna ord"], ["The report will say, in your own words, that your monitoring never noticed and a violent man's visit did. It can be requested by anyone. Are you ready to see that sentence quoted?", "Anmälan kommer att säga, med era egna ord, att er övervakning aldrig märkte något men att en våldsam mans besök gjorde det. Vem som helst kan begära ut den. Är ni redo att se den meningen citerad?"]),
              pb(["Complete or on time", "Fullständig eller i tid"], ["Explaining exactly how long the fault went unnoticed needs analysis that will not be done before the deadline. Do you send a complete report late, or an on-time report with gaps you promise to fill?", "Att förklara exakt hur länge felet pågick obemärkt kräver analys som inte blir klar före tidsfristen. Skickar ni en fullständig anmälan för sent, eller en i tid med luckor som ni lovar att fylla?"]),
              pb(["Evidence for claimants", "Bevis för den som kräver skadestånd"], ["{{person.legal.name}} warns that the detection story is exactly what the people exposed would need for damages claims, and the report can be requested. Is full candour worth handing them their case?", "{{person.legal.name}} varnar för att berättelsen om upptäckten är precis vad de som röjts behöver för skadeståndskrav, och anmälan kan begäras ut. Är full öppenhet värd att ge dem deras fall?"])
            ]
          }),
                    opt(["The facts of the breach and the fix, without the detection story", "Fakta om incidenten och rättningen, utan berättelsen om upptäckten"], "l4", ["Shorter, and the first question will be how you found it.", "Kortare, och första frågan blir hur ni upptäckte det."], {
            pushback: [
              pb(["The first phone call", "Det första samtalet"], ["The case officer at {{reg.dpaShort}} calls the next day with one question: how did you find out? The honest answer is the part you left out. Do you tell them now, and what does that say about the report?", "Handläggaren hos {{reg.dpaShort}} ringer dagen efter med en fråga: hur fick ni veta det? Det ärliga svaret är den del ni utelämnade. Berättar ni nu, och vad säger det om anmälan?"]),
              pb(["The police already wrote it down", "Polisen har redan skrivit ner det"], ["The police report from the first morning records exactly how the leak came to light. The regulator can ask for it. Can you leave out what another authority has already written down?", "Polisens anmälan från första morgonen beskriver exakt hur läckan kom fram. Tillsynsmyndigheten kan begära ut den. Kan ni utelämna det som en annan myndighet redan har skrivit ner?"]),
              pb(["The DPO won't sign", "Dataskyddsombudet skriver inte under"], ["{{person.dpo.name}} says they will not sign a report that leaves out how long the fault went unnoticed. Do you overrule your own data protection officer, and put that on record too?", "{{person.dpo.name}} säger sig inte vilja skriva under en anmälan som utelämnar hur länge felet pågick obemärkt. Kör ni över ert eget dataskyddsombud, och dokumenterar ni det också?"])
            ]
          })
        ])
      }),

      pg("l4", ["The other agencies", "De andra myndigheterna"], [
        "The address service is not the only path out of the register. Two other agencies, for tax and healthcare, receive a nightly copy of address changes. Their copies honour the protection flag, according to their documentation.\n\n{{person.ciso.name}} would like to check, rather than trust the documentation, but it means asking two peer agencies to let you inspect their systems.",
        "Adresstjänsten är inte den enda vägen ut ur registret. Två andra myndigheter, för skatt och sjukvård, får varje natt en kopia av adressändringar. Deras kopior respekterar skyddsmarkeringen, enligt deras dokumentation.\n\n{{person.ciso.name}} vill hellre kontrollera än lita på dokumentationen, men det innebär att be två andra myndigheter låta er granska deras system."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["Do you check the other agencies?", "Kontrollerar ni de andra myndigheterna?"], ["Asks to verify the other copies, and offers the same openness in return.", "Ber att få verifiera de andra kopiorna, och erbjuder samma öppenhet tillbaka."], [
                    opt(["Ask to verify their copies together, this week", "Be att få verifiera deras kopior tillsammans, den här veckan"], "c8", ["Awkward between agencies, and thorough.", "Obekvämt mellan myndigheter, och grundligt."], {
            pushback: [
              pb(["“You leaked, not us”", "”Det var ni som läckte”"], ["The tax agency's security head replies that its documentation is accurate and that an inspection implies distrust. Your agency is the one that leaked. On what grounds do you ask to check theirs?", "Skattemyndighetens säkerhetschef svarar att dokumentationen stämmer och att en granskning antyder misstro. Det är er myndighet som har läckt. Med vilken rätt ber ni att få kontrollera deras?"]),
              pb(["No power to inspect", "Inget mandat att granska"], ["{{person.legal.name}} notes that you have no power to inspect another agency's systems; either of them can simply say no. What do you do if one refuses?", "{{person.legal.name}} påpekar att ni saknar mandat att granska en annan myndighets system; vilken som helst av dem kan helt enkelt säga nej. Vad gör ni om en av dem vägrar?"]),
              pb(["Something has to give", "Något måste stå tillbaka"], ["{{person.ciso.name}}'s team is still handling the address service, deletion proofs and the regulator's questions. Inspecting two agencies this week means pausing one of those. Which one?", "{{person.ciso.name}}s team hanterar fortfarande adresstjänsten, raderingsbevisen och tillsynsmyndighetens frågor. Att granska två myndigheter den här veckan innebär att pausa något av det. Vad?"])
            ]
          }),
                    opt(["Trust their documentation", "Lita på deras dokumentation"], "c8", ["Polite, and it is what you trusted last time.", "Artigt, och det är vad ni litade på förra gången."], {
            pushback: [
              pb(["So did the address service", "Det gjorde adresstjänsten också"], ["{{person.ciso.name}} points out that the address service also had documentation saying it honoured the protection flag. Why is documentation enough this time?", "{{person.ciso.name}} påpekar att adresstjänsten också hade dokumentation som sa att den respekterade skyddsmarkeringen. Varför räcker dokumentation den här gången?"]),
              pb(["The regulator asks", "Tillsynsmyndigheten frågar"], ["{{reg.dpaShort}} asks in writing whether other copies of the register have been checked. “We read their documentation” will be your answer on record. Are you comfortable with that?", "{{reg.dpaShort}} frågar skriftligt om andra kopior av registret har kontrollerats. ”Vi har läst deras dokumentation” blir ert svar i akten. Kan ni stå för det?"]),
              pb(["A shelter asks the same", "Ett boende frågar samma sak"], ["A shelter adviser asks whether protected addresses could also leak through tax or healthcare. You would have to answer that you assume not. Would you accept that answer from anyone else?", "En rådgivare på ett skyddat boende frågar om skyddade adresser också kan läcka via skatt eller sjukvård. Ni skulle få svara att ni utgår från att de inte gör det. Skulle ni godta det svaret från någon annan?"])
            ]
          })
        ])
      }),

      pg("c8", ["The shelters", "De skyddade boendena"], [
        "The national shelter organisation asks for a meeting. Its members are handling frightened residents, emergency moves and calls from people who were not told. It wants three things: a direct line to the agency, money for the extra work, and an apology.\n\n{{person.legal.name}} warns that money now may be read as an admission of liability.",
        "Riksorganisationen för skyddade boenden begär ett möte. Medlemmarna hanterar rädda boende, akuta flyttar och samtal från personer som inte fått besked. Organisationen vill ha tre saker: en direktlinje till myndigheten, pengar för merarbetet, och en ursäkt.\n\n{{person.legal.name}} varnar för att pengar nu kan uppfattas som ett medgivande av skadeståndsansvar."
      ], {
        variants: [vr("publicFirst", [
          "The national shelter organisation asks for a meeting, and it is angry. After the agency's public announcement, its members have had calls from people trying to find out which shelters house the people on the list. It wants a direct line, money for the extra work, and an apology.\n\n{{person.legal.name}} warns that money now may be read as an admission of liability.",
          "Riksorganisationen för skyddade boenden begär ett möte, och den är arg. Efter myndighetens offentliga meddelande har medlemmarna fått samtal från personer som försöker ta reda på vilka boenden som har personerna på listan. Organisationen vill ha en direktlinje, pengar för merarbetet och en ursäkt.\n\n{{person.legal.name}} varnar för att pengar nu kan uppfattas som ett medgivande av skadeståndsansvar."
        ], ["Because you went public first, the shelters are now being asked who they house.", "Eftersom ni gick ut offentligt först får boendena nu frågor om vilka de har boende."])],
        choice: ask(["What do you give the shelters?", "Vad ger ni de skyddade boendena?"], ["Gives them a direct line, funding for the extra work, and a plain apology.", "Ger dem en direktlinje, pengar för merarbetet och en rak ursäkt."], [
                    opt(["A direct line, funding for the extra work, and a plain apology", "En direktlinje, pengar för merarbetet och en rak ursäkt"], "c9", ["Costs money and admits fault. Buys trust where it matters most.", "Kostar pengar och medger fel. Köper förtroende där det betyder mest."], {
            set: "supportFund",
            pushback: [
              pb(["Money as admission", "Pengar som medgivande"], ["{{person.legal.name}} repeats that paying now may be read as admitting liability, and the people exposed may cite it in claims. Do you pay anyway, and how do you word it?", "{{person.legal.name}} upprepar att pengar nu kan läsas som ett medgivande av ansvar, och att de som röjts kan åberopa det i sina krav. Betalar ni ändå, och hur formulerar ni det?"]),
              pb(["Others want the same", "Andra vill ha samma sak"], ["Once the shelters are funded, victim support groups and municipalities handling moves ask for the same. Your offer has set a precedent. Where does the agency's responsibility end?", "När boendena fått pengar ber brottsofferjourer och kommuner som hanterar flyttar om samma sak. Ert erbjudande har skapat ett prejudikat. Var slutar myndighetens ansvar?"]),
              pb(["Sorry for what, exactly?", "Förlåt för vad, exakt?"], ["The draft apology has to say what it is for. The shelters want it to name not only the fault, but also how long the agency took to act. Do you apologise for the whole of it?", "Utkastet till ursäkt måste säga vad den gäller. Boendena vill att den nämner inte bara felet, utan också hur lång tid det tog för myndigheten att agera. Ber ni om ursäkt för allt?"])
            ]
          }),
                    opt(["A direct line and an apology; funding after legal review", "En direktlinje och en ursäkt; pengar efter juridisk granskning"], "c9", ["Careful, and they are working unpaid tonight.", "Försiktigt, och de arbetar oavlönat i natt."], {
            pushback: [
              pb(["Words without money", "Ord utan pengar"], ["The shelter organisation says its staff worked through the weekend moving residents, and that an apology without money is just words. Nobody can say how long the legal review will take. What do you tell them meanwhile?", "Organisationen säger att personalen arbetade hela helgen med att flytta boende, och att en ursäkt utan pengar bara är ord. Ingen kan säga hur lång tid den juridiska granskningen tar. Vad säger ni till dem under tiden?"]),
              pb(["The apology already admits it", "Ursäkten medger redan"], ["{{person.legal.name}} notes that a plain apology already admits fault, so holding back the money protects less than you think. Is the legal review still worth the delay?", "{{person.legal.name}} konstaterar att en rak ursäkt redan medger fel, så att hålla inne pengarna skyddar mindre än ni tror. Är den juridiska granskningen fortfarande värd fördröjningen?"]),
              pb(["The direct line rings", "Direktlinjen ringer"], ["The direct line opens and rings constantly, mostly with requests the agency cannot meet without funding: moves, hotel nights, extra staff. Who answers it, and with what?", "Direktlinjen öppnar och ringer oavbrutet, mest med önskemål som myndigheten inte kan möta utan pengar: flyttar, hotellnätter, extra personal. Vem svarar, och med vad?"])
            ]
          }),
                    opt(["Refer them to the normal channels", "Hänvisa dem till de vanliga kanalerna"], "c9", ["Nothing promised, nothing gained.", "Inget utlovat, inget vunnet."], {
            pushback: [
              pb(["It will be in the paper", "Det kommer i tidningen"], ["The shelter organisation says it will tell the reporter it has already spoken to exactly how the agency answered. “Normal channels” will be the quote. Do you reconsider?", "Organisationen säger att den kommer att berätta för reportern den redan talat med exakt hur myndigheten svarade. ”De vanliga kanalerna” blir citatet. Tänker ni om?"]),
              pb(["Residents lose faith", "De boende tappar tron"], ["A shelter adviser says residents are asking whether protection is worth having at all, if the agency treats them like any other case. Is that a risk you are willing to take?", "En rådgivare säger att boende frågar om skyddet ens är värt att ha, om myndigheten behandlar dem som vilket ärende som helst. Är det en risk ni är beredda att ta?"]),
              pb(["Which channel?", "Vilken kanal?"], ["Your contact centre does not know who handles requests from shelters; there is no normal channel for what they need. Where exactly are you referring them?", "Ert kontaktcenter vet inte vem som hanterar önskemål från skyddade boenden; det finns ingen vanlig kanal för det de behöver. Vart hänvisar ni dem, exakt?"])
            ]
          })
        ])
      }),

      pg("c9", ["Why the test missed it", "Varför testet missade det"], [
        "The review finds why the fault reached production. The supplier tested the new batch function against a copy of the register with every protected record removed, because protected data must not be used in testing. With no protected records in the test data, nothing could fail.\n\nThe rule that was meant to protect these people made the fault invisible.",
        "Granskningen visar varför felet nådde produktion. Leverantören testade den nya batch-funktionen mot en kopia av registret där varje skyddad post tagits bort, eftersom skyddade uppgifter inte får användas i test. Utan skyddade poster i testdatan kunde ingenting fallera.\n\nRegeln som skulle skydda de här personerna gjorde felet osynligt."
      ], {
        choice: ask(["What do you change in testing?", "Vad ändrar ni i testningen?"], ["Adds synthetic protected records to every test and a second check on any change to protection logic.", "Lägger till syntetiska skyddade poster i varje test och en andra kontroll av varje ändring i skyddslogiken."], [
                    opt(["Synthetic protected records in every test, and a second review of any change that touches protection", "Syntetiska skyddade poster i varje test, och en andra granskning av varje ändring som rör skyddet"], "c10", ["Cheap, and it closes exactly this gap.", "Billigt, och det täpper till exakt den här luckan."], {
            set: "fixedProcess",
            pushback: [
              pb(["Only the faults you imagine", "Bara de fel ni kan föreställa er"], ["Synthetic records catch the faults someone thinks to test for. The next fault may be in a route nobody thinks of. Is a better test enough, or does the design itself need to change?", "Syntetiska poster fångar de fel någon kommer på att testa. Nästa fel kan finnas i en väg som ingen tänker på. Räcker ett bättre test, eller måste själva konstruktionen ändras?"]),
              pb(["The supplier wants more money", "Leverantören vill ha mer betalt"], ["The supplier says realistic synthetic records and a second review will add weeks to every release, and wants the contract repriced. Do you pay, or water the change down?", "Leverantören säger att realistiska syntetiska poster och en andra granskning lägger veckor på varje leverans, och vill omförhandla priset. Betalar ni, eller urvattnar ni ändringen?"]),
              pb(["Who does the second review?", "Vem gör den andra granskningen?"], ["Nobody at the agency has the skills to review the supplier's code changes in depth. A second review signed by someone who cannot read the code is a formality. Who will actually do it?", "Ingen på myndigheten har kompetens att granska leverantörens kodändringar på djupet. En andra granskning signerad av någon som inte kan läsa koden är en formalitet. Vem ska faktiskt göra den?"])
            ]
          }),
                    opt(["Hold the supplier liable under the contract", "Utkräv ansvar av leverantören enligt avtalet"], "c10", ["Satisfying; the gap stays open for the next supplier.", "Tillfredsställande; luckan står kvar till nästa leverantör."], {
            pushback: [
              pb(["They followed your rule", "De följde er regel"], ["The supplier points out that it removed protected records from testing because the agency's own rules required it. Holding it liable means arguing that following your rules was negligent. Do you still pursue it?", "Leverantören påpekar att den tog bort skyddade poster ur testet för att myndighetens egna regler krävde det. Att utkräva ansvar innebär att hävda att det var vårdslöst att följa era regler. Går ni ändå vidare?"]),
              pb(["The next release", "Nästa leverans"], ["A routine release from the supplier is due next week, tested in exactly the same way. A claim does nothing for that release. What changes before it goes out?", "En rutinleverans från leverantören ska ut nästa vecka, testad på exakt samma sätt. Ett skadeståndskrav gör ingenting för den leveransen. Vad ändras innan den går ut?"]),
              pb(["A supplier to the letter", "En leverantör enligt avtalets bokstav"], ["{{person.serviceOwner.name}} warns that a dispute will slow every fix you need from the supplier for months. Is the claim worth a supplier who now works strictly to the contract?", "{{person.serviceOwner.name}} varnar för att en tvist kommer att bromsa varje rättning ni behöver från leverantören i månader. Är kravet värt en leverantör som nu bara gör det avtalet kräver?"])
            ]
          })
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "A month later. The addresses are off the people-search site, most clients have confirmed deletion, and dozens of people have moved. The woman who was found is safe, in another town.\n\nThe crisis team meets one last time. There is budget for one lasting change this year.",
        "En månad senare. Adresserna är borta från personsöksajten, de flesta kunder har bekräftat radering, och dussintals personer har flyttat. Kvinnan som hittades är i säkerhet, i en annan stad.\n\nKrisledningen träffas en sista gång. Det finns budget för en bestående förändring i år."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Stops protected addresses from leaving the register at all, by any route.", "Hindrar skyddade adresser från att lämna registret alls, oavsett väg."], [
                    opt(["Never send protected addresses out of the register: return “protected” to every external request, whatever the endpoint", "Skicka aldrig ut skyddade adresser ur registret: svara ”skyddad” på varje externt anrop, oavsett funktion"], "r-end", ["Closes the class of fault, not just this one.", "Stänger hela klassen av fel, inte bara det här."], {
            pushback: [
              pb(["Some have a right to reach them", "En del har rätt att nå dem"], ["Some clients have a legal duty to reach protected people, for example to serve court papers. Answering “protected” to everyone blocks them too. What route do they get instead, and isn't that a new way out of the register?", "En del kunder har en laglig skyldighet att nå skyddade personer, till exempel för att delge domstolshandlingar. Att svara ”skyddad” till alla stoppar dem också. Vilken väg får de i stället, och är inte det en ny väg ut ur registret?"]),
              pb(["The whole year's budget", "Hela årets budget"], ["{{person.cio.name}} estimates that the redesign uses the whole year's budget, leaving nothing for monitoring or for the shelters. Is one deep fix better than several smaller ones?", "{{person.cio.name}} uppskattar att omkonstruktionen tar hela årets budget och inte lämnar något till övervakning eller till boendena. Är en djup åtgärd bättre än flera mindre?"]),
              pb(["The trade moves elsewhere", "Handeln flyttar någon annanstans"], ["Clients warn that if your service no longer gives them what they need, they will buy addresses from data brokers instead. Does blocking at the register just push the problem somewhere you cannot see it?", "Kunderna varnar för att om er tjänst inte längre ger dem det de behöver kommer de att köpa adresser från datamäklare i stället. Flyttar en spärr i registret bara problemet dit ni inte ser det?"])
            ]
          }),
                    opt(["Alerting on unusual lookups of protected records", "Larm vid ovanliga sökningar på skyddade poster"], "r-end", ["Faster detection next time, after the leak.", "Snabbare upptäckt nästa gång, efter läckan."], {
            pushback: [
              pb(["An alarm after the fact", "Ett larm i efterhand"], ["An alert tells you that protected addresses have already left; it does not stop them. This time, someone was found before anyone looked. Would an alarm have helped her?", "Ett larm talar om att skyddade adresser redan lämnat registret; det stoppar dem inte. Den här gången hittades någon innan någon tittade. Hade ett larm hjälpt henne?"]),
              pb(["Who reads the alarms?", "Vem läser larmen?"], ["In the first week of testing, the alerts fire hundreds of times on normal lookups, and they go to a team that is already stretched. Who will still be reading them in a year?", "Under första testveckan går larmen hundratals gånger på vanliga uppslag, och de hamnar hos ett team som redan är hårt belastat. Vem läser dem fortfarande om ett år?"]),
              pb(["What counts as unusual?", "Vad räknas som ovanligt?"], ["The leak looked like ordinary traffic: known clients, normal volumes, a supported endpoint. {{person.ciso.name}} is not sure an alarm would have fired at all. What exactly would it have caught?", "Läckan såg ut som vanlig trafik: kända kunder, normala volymer, en godkänd funktion. {{person.ciso.name}} är inte säker på att ett larm ens hade gått. Vad exakt hade det fångat?"])
            ]
          }),
                    opt(["More training for caseworkers", "Mer utbildning för handläggare"], "r-end", ["Caseworkers were not the problem.", "Handläggarna var inte problemet."], {
            pushback: [
              pb(["The union asks why", "Facket frågar varför"], ["The caseworkers' union asks why the one lasting change is aimed at them, when the fault was in the software. A caseworker was the first to be suspected. What do you tell them?", "Handläggarnas fack frågar varför den enda bestående förändringen riktas mot dem, när felet satt i programvaran. En handläggare var den första som misstänktes. Vad säger ni till dem?"]),
              pb(["The shelters read the plan", "Boendena läser planen"], ["The shelter organisation reads the plan and asks what training would have changed about a faulty automated update. Its trust in your review is at stake. How do you answer?", "Organisationen för skyddade boenden läser planen och frågar vad utbildning hade ändrat i en felaktig automatisk uppdatering. Deras förtroende för er granskning står på spel. Vad svarar ni?"]),
              pb(["The cause stays in place", "Orsaken finns kvar"], ["{{person.cio.name}} notes that the register still sends protected addresses to external callers whenever a filter works as intended. One more faulty update and it all repeats. Will the review accept training as the answer?", "{{person.cio.name}} konstaterar att registret fortfarande skickar skyddade adresser till externa anropare så länge ett filter fungerar som tänkt. En till felaktig uppdatering och allt upprepas. Kommer granskningen att godta utbildning som svaret?"])
            ]
          })
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["wideCheck", "personalNotice", "supportFund"], "e1"],
          ["personalNotice", "e2"],
          ["insiderBlamed", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Six months later", "Sex månader senare"], ["You looked past the obvious suspect, reached the people at risk personally, and stood beside the shelters while they did the hardest work.\n\nThe review criticises the fault and praises the response. The shelter organisation now helps the agency test every change that touches protected records.", "Ni tittade förbi den uppenbara misstänkte, nådde de utsatta personligen och stod bredvid de skyddade boendena medan de gjorde det tyngsta arbetet.\n\nGranskningen kritiserar felet och berömmer hanteringen. Organisationen för skyddade boenden hjälper nu myndigheten att testa varje ändring som rör skyddade poster."], {
        ending: end(1, ["Careful, honest and on their side", "Varsamt, ärligt och på deras sida"], [
          "You found the real cause, warned people without exposing them further and supported those who protect them. Nobody else was found.",
          "Ni hittade den verkliga orsaken, varnade människor utan att röja dem ytterligare och stöttade dem som skyddar dem. Ingen mer blev hittad."
        ])
      }),
      pg("e2", ["Six months later", "Sex månader senare"], ["You reached the people at risk carefully, and nobody else was found. But the agency was slow to see the wider leak, or slow to support the shelters, and the review says so.\n\nTrust among protected people is damaged, not lost.", "Ni nådde de utsatta varsamt, och ingen mer blev hittad. Men myndigheten var långsam med att se den bredare läckan, eller med att stötta de skyddade boendena, och granskningen säger det.\n\nFörtroendet bland skyddade personer är skadat, inte förlorat."], {
        ending: end(2, ["Careful, but late", "Varsamt, men sent"], [
          "You protected the people exposed, but the agency's first instincts, or its support, fell short.",
          "Ni skyddade dem som röjts, men myndighetens första reaktion, eller dess stöd, räckte inte till."
        ])
      }),
      pg("e3", ["Six months later", "Sex månader senare"], ["The first thing the agency did was suspend a caseworker who had done nothing wrong. By the time the real cause was found, the story was already “insider leaks addresses”, and that is what most people still remember.\n\nThe caseworker has left the agency.", "Det första myndigheten gjorde var att stänga av en handläggare som inte gjort något fel. När den verkliga orsaken hittades var nyheten redan ”insider läcker adresser”, och det är vad de flesta fortfarande minns.\n\nHandläggaren har lämnat myndigheten."], {
        ending: end(3, ["The wrong suspect", "Fel misstänkt"], [
          "Blaming a person first delayed the search for the system fault and hurt a colleague who did nothing wrong.",
          "Att skylla på en person först försenade sökandet efter felet i systemet och skadade en kollega som inte gjort något fel."
        ])
      }),
      pg("e4", ["Six months later", "Sex månader senare"], ["Letters went to addresses that were no longer safe, or announcements told everyone the addresses were out there. Two more people were found before the year was out.\n\nThe review concludes that the agency treated a safety crisis as a data incident.", "Brev gick till adresser som inte längre var säkra, eller meddelanden talade om för alla att adresserna fanns ute. Ytterligare två personer hittades innan året var slut.\n\nGranskningen konstaterar att myndigheten behandlade en säkerhetskris som en dataincident."], {
        ending: end(4, ["A data incident, handled as one", "En dataincident, hanterad som en sådan"], [
          "You followed the normal process, and the normal process is not built for people in hiding.",
          "Ni följde den vanliga processen, och den vanliga processen är inte byggd för människor som håller sig gömda."
        ])
      }),

      // Break-away: telling the press that nobody was harmed.
      pg("x1", ["Nobody was harmed", "Ingen kom till skada"], [
        "The article runs with your words: “as far as the agency knows, nobody was harmed”. By lunchtime, the woman who was found has decided she will not stay silent. She tells a radio programme how she and her children escaped through a neighbour's flat, and that the agency knew.",
        "Artikeln publiceras med era ord: ”så vitt myndigheten vet har ingen kommit till skada”. Vid lunch har kvinnan som hittades bestämt sig för att inte tiga. Hon berättar i ett radioprogram hur hon och barnen flydde via en grannes lägenhet, och att myndigheten visste."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Corrects the statement at once and apologises to her.", "Rättar uttalandet direkt och ber henne om ursäkt."], [
                    opt(["Correct the statement and apologise to her publicly", "Rätta uttalandet och be henne om ursäkt offentligt"], "x2", ["Necessary, and late.", "Nödvändigt, och sent."], {
            pushback: [
              pb(["She asked not to be named", "Hon bad att inte bli nämnd"], ["A public apology to her draws even more attention to a woman who asked not to be mentioned. Her lawyer asks you to apologise privately instead. Do you still apologise in public?", "En offentlig ursäkt till henne drar ännu mer uppmärksamhet till en kvinna som bett att inte nämnas. Hennes jurist ber er be om ursäkt privat i stället. Ber ni ändå om ursäkt offentligt?"]),
              pb(["Who got it wrong?", "Vem gjorde fel?"], ["{{person.ceo.name}}'s office asks who approved the original statement; correcting it means saying someone got it wrong. Who takes that responsibility, by name?", "{{person.ceo.name}}s kansli frågar vem som godkände det ursprungliga uttalandet; att rätta det innebär att säga att någon gjorde fel. Vem tar det ansvaret, med namn?"]),
              pb(["“How many others?”", "”Hur många fler?”"], ["Once you admit harm, the reporter asks how many other people have been harmed. You do not know. Does the correction answer that, or set you up for a second correction?", "När ni medger skada frågar reportern hur många fler som kommit till skada. Ni vet inte. Besvarar rättelsen det, eller bäddar den för en andra rättelse?"])
            ]
          }),
                    opt(["Say you were respecting her wish not to be mentioned", "Säg att ni respekterade hennes önskan att inte nämnas"], "x2", ["True, and not what you said.", "Sant, och inte vad ni sa."], {
            pushback: [
              pb(["She hears it", "Hon hör det"], ["The woman hears your statement on the radio and says the agency is hiding behind her. She asked for her case to be left out, not for anyone to say nobody was harmed. What do you say to her now?", "Kvinnan hör ert uttalande på radion och säger att myndigheten gömmer sig bakom henne. Hon bad att hennes fall skulle hållas utanför, inte att någon skulle säga att ingen kommit till skada. Vad säger ni till henne nu?"]),
              pb(["The quote is on tape", "Citatet finns inspelat"], ["The reporter plays back your exact words: “nobody was harmed”. That is not the same as declining to comment. How does respecting her wish explain a denial?", "Reportern spelar upp era exakta ord: ”ingen har kommit till skada”. Det är inte samma sak som att avböja kommentar. Hur förklarar hennes önskan ett förnekande?"]),
              pb(["The worst possible answer", "Det sämsta tänkbara svaret"], ["The shelter organisation says that using a victim's request as cover is the worst answer the agency could give, and its residents are listening. Do you keep to this line?", "Organisationen för skyddade boenden säger att använda ett offers önskemål som skydd är det sämsta svar myndigheten kunde ge, och deras boende lyssnar. Håller ni fast vid den linjen?"])
            ]
          })
        ])
      }),
      pg("x2", ["Parliament", "Riksdagen"], [
        "At question time, the minister is asked whether the agency misled the public. The minister replies that the ministry was given the same information as the newspaper. The opposition calls for an independent inquiry.",
        "Vid frågestunden får ministern frågan om myndigheten vilselett allmänheten. Ministern svarar att departementet fått samma information som tidningen. Oppositionen kräver en oberoende utredning."
      ], {
        choice: ask(["What do you do now?", "Vad gör ni nu?"], ["Gives the ministry and the inquiry the full facts at once.", "Ger departementet och utredningen alla fakta direkt."], [
                    opt(["Send the ministry the full facts, including what was known when you spoke to the press", "Skicka departementet alla fakta, även vad som var känt när ni talade med pressen"], "x3", ["It will reach the inquiry anyway.", "Det når utredningen ändå."], {
            pushback: [
              pb(["It contradicts the minister", "Det motsäger ministern"], ["The facts show the agency knew of harm before it spoke to the press. Sending them now contradicts what the minister has just said in parliament. Do you warn the minister's office first, and what if they ask you to wait?", "Fakta visar att myndigheten kände till skada innan den talade med pressen. Att skicka dem nu motsäger det ministern just sagt i riksdagen. Varnar ni ministerns kansli först, och vad gör ni om de ber er vänta?"]),
              pb(["Evidence before review", "Bevis före granskning"], ["{{person.legal.name}} advises that anything you send now becomes evidence for the inquiry before your own review is done. Do you send it unreviewed?", "{{person.legal.name}} påpekar att allt ni skickar nu blir underlag för utredningen innan er egen genomgång är klar. Skickar ni det ogranskat?"]),
              pb(["Naming who knew", "Att namnge vem som visste"], ["Setting out what was known when you spoke to the press means naming who in the crisis team knew about the woman's case. Some of them approved the statement. Are you ready to name them?", "Att redovisa vad som var känt när ni talade med pressen innebär att namnge vem i krisledningen som kände till kvinnans fall. Några av dem godkände uttalandet. Är ni beredda att namnge dem?"])
            ]
          }),
                    opt(["Wait for the inquiry's questions", "Vänta på utredningens frågor"], "x3", ["The minister will not wait.", "Ministern kommer inte att vänta."], {
            pushback: [
              pb(["The ministry won't wait", "Departementet väntar inte"], ["The state secretary calls within the hour and wants everything you have by tonight. Waiting for the inquiry is not an answer the ministry accepts. Do you refuse your own ministry?", "Statssekreteraren ringer inom en timme och vill ha allt ni har före kvällen. Att vänta på utredningen är inget svar som departementet godtar. Säger ni nej till ert eget departement?"]),
              pb(["Others tell it for you", "Andra berättar åt er"], ["An opposition member says they have the agency's earlier briefing to the ministry, which is a public document. While you wait, others are telling the story with your own papers. Is waiting still the safe choice?", "En oppositionspolitiker säger sig ha myndighetens tidigare lägesbild till departementet, som är en allmän handling. Medan ni väntar berättar andra historien med era egna papper. Är det fortfarande det säkra valet att vänta?"]),
              pb(["A second cover-up?", "Ett andra mörkande?"], ["{{person.comms.name}} says that after “nobody was harmed”, silence will read as a second cover-up. Is procedure a good enough reason to stay quiet now?", "{{person.comms.name}} säger att efter ”ingen har kommit till skada” kommer tystnad att läsas som ett andra mörkande. Är formalia ett tillräckligt skäl att tiga nu?"])
            ]
          })
        ])
      }),
      pg("x3", ["The shelters walk away", "Boendena drar sig ur"], [
        "The national shelter organisation announces that it will no longer advise its residents to rely on the agency's protection. It tells them to use a post-box address and give nothing to any public body they do not have to.",
        "Riksorganisationen för skyddade boenden meddelar att den inte längre råder sina boende att lita på myndighetens skydd. Den uppmanar dem att använda en boxadress och inte lämna något till någon offentlig instans som de inte måste."
      ], {
        choice: ask(["How do you respond to the shelters?", "Hur bemöter ni de skyddade boendena?"], ["Meets them, admits the statement was wrong and asks what would rebuild trust.", "Träffar dem, medger att uttalandet var fel och frågar vad som skulle bygga upp förtroendet igen."], [
                    opt(["Meet them, admit the statement was wrong, and ask what they need", "Träffa dem, medge att uttalandet var fel, och fråga vad de behöver"], "x4", ["Humbling, and the only start.", "Ödmjukande, och den enda början."], {
            pushback: [
              pb(["Their conditions", "Deras villkor"], ["The shelters agree to meet only if {{person.ceo.name}} attends in person and the minutes are made public. Can you accept public minutes of an admission?", "Boendena går med på ett möte bara om {{person.ceo.name}} deltar personligen och protokollet blir offentligt. Kan ni godta ett offentligt protokoll över ett medgivande?"]),
              pb(["Quoted by the inquiry", "Citerat av utredningen"], ["{{person.legal.name}} warns that admitting the statement was wrong, before the inquiry has reported, will be quoted in its findings. Do you admit it anyway?", "{{person.legal.name}} varnar för att ett medgivande att uttalandet var fel, innan utredningen är klar, kommer att citeras i dess slutsatser. Medger ni det ändå?"]),
              pb(["What they need costs", "Det de behöver kostar"], ["The shelters' first request is that protected people may use a post-box address for every contact with the agency, which means changes across many systems. Do you promise it in the meeting?", "Boendenas första krav är att skyddade personer ska få använda en boxadress för all kontakt med myndigheten, vilket kräver ändringar i många system. Lovar ni det på mötet?"])
            ]
          }),
                    opt(["Issue a statement defending the agency's protection", "Gå ut med ett uttalande som försvarar myndighetens skydd"], "x4", ["Read by every shelter as proof.", "Läses av varje boende som ett bevis."], {
            pushback: [
              pb(["Your defence, their evidence", "Ert försvar, deras bevis"], ["Within the hour, the shelter organisation replies by quoting the woman's story next to your words “nobody was harmed”. Your defence has become their evidence. Do you answer again?", "Inom en timme svarar organisationen genom att citera kvinnans berättelse bredvid era ord ”ingen har kommit till skada”. Ert försvar har blivit deras bevis. Svarar ni igen?"]),
              pb(["People stop trusting you", "Folk slutar lita på er"], ["The contact centre reports that people with protected identities are calling to ask whether they should give the agency anything at all. Your statement has not reassured them. Who will?", "Kontaktcentret rapporterar att personer med skyddade personuppgifter ringer och frågar om de över huvud taget ska lämna något till myndigheten. Ert uttalande har inte lugnat dem. Vem ska göra det?"]),
              pb(["What exactly is safe?", "Vad är det som är säkert?"], ["{{person.ciso.name}} asks what, specifically, the statement claims is safe: the register's protection is the same as it was before the leak. Can you prove the claim you are making?", "{{person.ciso.name}} frågar vad uttalandet egentligen påstår är säkert: registrets skydd är detsamma som före läckan. Kan ni bevisa det ni påstår?"])
            ]
          })
        ])
      }),
      pg("x4", ["The inquiry", "Utredningen"], [
        "The independent inquiry begins. Its first question is not about the software fault. It is about why the agency told the public nobody was harmed when it knew of a woman who had fled her home in the night.",
        "Den oberoende utredningen inleds. Dess första fråga handlar inte om programfelet. Den handlar om varför myndigheten sa till allmänheten att ingen kommit till skada när den kände till en kvinna som flytt sitt hem mitt i natten."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Answers fully and accepts responsibility.", "Svarar fullständigt och tar ansvar."], [
                    opt(["Answer fully and accept responsibility", "Svara fullständigt och ta ansvar"], "e5", ["It does not undo the statement, but it helps.", "Det gör inte uttalandet ogjort, men det hjälper."], {
            pushback: [
              pb(["Responsibility needs a name", "Ansvar behöver ett namn"], ["Accepting responsibility means someone carries it. One person approved the press line; others drafted it. Who in the room takes it, by name?", "Att ta ansvar innebär att någon bär det. En person godkände presslinjen; andra skrev den. Vem i rummet tar det, med namn?"]),
              pb(["Answers become claims", "Svaren blir krav"], ["{{person.legal.name}} warns that full answers will be used in damages claims from the people exposed. Do you answer fully, knowing that?", "{{person.legal.name}} varnar för att fullständiga svar kommer att användas i skadeståndskrav från dem som röjts. Svarar ni fullständigt, med vetskap om det?"]),
              pb(["Staff ask for backing", "Personalen vill ha stöd"], ["The staff who drafted the statement ask whether the agency will stand behind them in their own interviews, or let them carry the blame alone. What do you promise them?", "Medarbetarna som skrev uttalandet frågar om myndigheten kommer att stå bakom dem i deras egna förhör, eller låta dem bära skulden ensamma. Vad lovar ni dem?"])
            ]
          }),
                    opt(["Answer through lawyers, in writing", "Svara via jurister, skriftligt"], "e5", ["Reads as more to hide.", "Uppfattas som att det finns mer att dölja."], {
            pushback: [
              pb(["The inquiry wants people", "Utredningen vill träffa människor"], ["The inquiry replies that it wants to hear in person from the people who made the decision. Written answers from lawyers will be noted as declining to appear. Do you still send lawyers?", "Utredningen svarar att den vill höra dem som fattade beslutet, personligen. Skriftliga svar från jurister kommer att noteras som att ni avböjt att medverka. Skickar ni ändå jurister?"]),
              pb(["She will speak in person", "Hon talar själv"], ["The woman's lawyer says she will give evidence in person. Next to her account, a lawyer's letter from the agency will read as hiding. How will that look?", "Kvinnans jurist säger att hon kommer att vittna personligen. Bredvid hennes berättelse kommer ett advokatbrev från myndigheten att läsas som att ni gömmer er. Hur kommer det att se ut?"]),
              pb(["The shelters' verdict", "Boendenas dom"], ["The shelter organisation says the lawyers' answers confirm its advice to residents to avoid the agency. Fewer people may seek protection as a result. Is defending the agency worth that?", "Organisationen för skyddade boenden säger att juristernas svar bekräftar deras råd till de boende att undvika myndigheten. Färre kan söka skydd som följd. Är det värt det för att försvara myndigheten?"])
            ]
          })
        ])
      }),
      pg("e5", ["A year later", "Ett år senare"], ["The software fault was fixed in a day. The sentence “nobody was harmed” took the director general's job, and it is still the first thing the shelters mention when the agency is named.\n\nFewer people now apply for protection. Some of them needed it.", "Programfelet rättades på en dag. Meningen ”ingen kom till skada” kostade generaldirektören jobbet, och den är fortfarande det första de skyddade boendena nämner när myndigheten kommer på tal.\n\nFärre ansöker nu om skydd. En del av dem behövde det."], {
        ending: end(5, ["“Nobody was harmed”", "”Ingen kom till skada”"], [
          "Saying nobody was harmed, when you knew otherwise, turned a fixable fault into a lasting loss of trust among the people who most need the state's protection.",
          "Att säga att ingen kommit till skada, när ni visste annat, gjorde ett åtgärdbart fel till en bestående förlust av förtroende hos dem som mest behöver statens skydd."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["When protected data leaks, check the system before suspecting a person.", "När skyddade uppgifter läcker, kontrollera systemet innan ni misstänker en person."]),
        L(["Stop the leak first, even if others rely on the service.", "Stoppa läckan först, även om andra är beroende av tjänsten."]),
        L(["People in hiding cannot be warned by ordinary letter or public notice.", "Människor som håller sig gömda kan inte varnas med vanliga brev eller offentliga meddelanden."]),
        L(["Never say nobody was harmed when you know of harm.", "Säg aldrig att ingen kommit till skada när ni känner till skada."])
      ],
      strengthsToLookFor: [
        L(["Checking every lookup, not only the obvious one", "Att kontrollera varje sökning, inte bara den uppenbara"]),
        L(["Personal, risk-ordered contact with the people exposed", "Personlig kontakt med dem som röjts, ordnad efter risk"]),
        L(["Working with shelters as partners", "Att arbeta med skyddade boenden som partner"])
      ],
      commonGaps: [
        L(["Suspending the caseworker on one log line", "Att stänga av handläggaren på en enda loggrad"]),
        L(["Letters to addresses that are no longer safe", "Brev till adresser som inte längre är säkra"]),
        L(["Testing without protected records", "Att testa utan skyddade poster"])
      ],
      suggestedActions: [
        act(["Make the register refuse to send protected addresses to any external caller, by design.", "Gör så att registret av konstruktion vägrar skicka skyddade adresser till externa anropare."], "cio", "high"),
        act(["Add synthetic protected records to every test of the register and its services.", "Lägg till syntetiska skyddade poster i varje test av registret och dess tjänster."], "serviceOwner", "high"),
        act(["Agree a notification plan for people in hiding with the police and shelter organisations.", "Ta fram en plan för att meddela människor som håller sig gömda, tillsammans med polisen och organisationer för skyddade boenden."], "securityOfficer", "high"),
        act(["Monitor lookups of protected records by every client, not only by staff.", "Bevaka sökningar på skyddade poster från varje kund, inte bara från personal."], "ciso", "medium")
      ]
    }
  });
})();
