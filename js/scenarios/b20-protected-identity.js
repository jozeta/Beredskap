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
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

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
          opt(["Check every lookup of every protected record in the last month, not only hers", "Kontrollera varje sökning på varje skyddad post den senaste månaden, inte bara hennes"], "c2", ["Slower, and it finds what a single case would miss.", "Långsammare, och det hittar det som ett enskilt fall skulle missa."], { set: "wideCheck" }),
          opt(["Suspend the caseworker who opened her record and hand the case to the police", "Stäng av handläggaren som öppnade hennes post och lämna ärendet till polisen"], "c2", ["Decisive, on a log line with a valid reason.", "Handlingskraftigt, på en loggrad med giltigt skäl."], { set: "insiderBlamed" }),
          opt(["Treat it as one police case and support the woman", "Behandla det som ett enskilt polisärende och stötta kvinnan"], "c2", ["Humane, and the register is not checked.", "Mänskligt, och registret kontrolleras inte."])
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
          opt(["Shut the address service down now, for every client", "Stäng ner adresstjänsten nu, för alla kunder"], "l1", ["The leak stops; banks and debt collectors are without lookups.", "Läckan stoppas; banker och inkassoföretag står utan uppslag."], { set: "apiOff" }),
          opt(["Keep it running and deploy a fix within hours", "Låt den gå och driftsätt en rättning inom några timmar"], "l1", ["Clients barely notice. Every hour, more addresses can leave.", "Kunderna märker knappt något. Varje timme kan fler adresser lämna."]),
          opt(["Fix it quietly and say nothing to the clients for now", "Rätta det i det tysta och säg ingenting till kunderna tills vidare"], "c3b", ["No disruption, and {{num.clients}} companies keep data they should never have had.", "Inga störningar, och {{num.clients}} företag behåller uppgifter de aldrig borde ha fått."], { set: "quietFix" })
        ])
      }),

      pg("l1", ["The caseworker", "Handläggaren"], [
        "{{person.hr.name}} has the caseworker on the phone. Her name has spread in the office as “the one who leaked the address”. She opened the record because the woman's mail was being returned, as the reason code says.\n\nShe asks what the agency will say about her, and whether she will be cleared in writing.",
        "{{person.hr.name}} har handläggaren i telefon. Hennes namn har spridits på kontoret som ”den som läckte adressen”. Hon öppnade posten eftersom kvinnans post kom i retur, precis som orsakskoden säger.\n\nHon frågar vad myndigheten kommer att säga om henne, och om hon kommer att bli friad skriftligt."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you do for the caseworker?", "Vad gör ni för handläggaren?"], ["Clears her in writing and tells colleagues the truth.", "Friar henne skriftligt och berättar sanningen för kollegorna."], [
          opt(["Clear her in writing, tell colleagues the cause was a system fault, and apologise", "Fria henne skriftligt, berätta för kollegorna att orsaken var ett systemfel, och be om ursäkt"], "c3", ["Costs a little pride, and restores a colleague.", "Kostar lite prestige, och återupprättar en kollega."], { set: "reinstated" }),
          opt(["Wait until the investigation is formally closed", "Vänta tills utredningen formellt är avslutad"], "c3", ["Procedurally tidy; she carries the rumour for weeks.", "Formellt korrekt; hon bär ryktet i veckor."])
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
          opt(["Have the client company demand removal, and seek an urgent court order at the same time", "Låt kundföretaget kräva borttagning, och begär samtidigt ett brådskande domstolsbeslut"], "c4", ["Fast where it works, with a legal backstop.", "Snabbt där det fungerar, med en rättslig reserv."], { set: "takedown" }),
          opt(["Publicly warn that the site holds protected addresses", "Varna offentligt för att sajten innehåller skyddade adresser"], "c4", ["Pressure on the site, and a map for everyone looking.", "Press på sajten, och en karta för alla som letar."], { set: "publicFirst" }),
          opt(["E-mail the site owner and wait for an answer", "Mejla sajtens ägare och vänta på svar"], "c4", ["Polite, and slow while the addresses stay up.", "Artigt, och långsamt medan adresserna ligger kvar."])
        ])
      }),

      pg("c3b", ["The quiet fix", "Den tysta rättningen"], [
        "The fix is in, and the service runs as before. But {{num.clients}} companies still hold protected addresses in their own systems, and some of them sell data on. Without being told, none of them will delete anything.\n\n{{person.legal.name}} warns that every day of silence will be read later as a decision.",
        "Rättningen är på plats, och tjänsten går som förut. Men {{num.clients}} företag har fortfarande skyddade adresser i sina egna system, och en del av dem säljer data vidare. Utan att få veta något kommer ingen av dem att radera något.\n\n{{person.legal.name}} varnar för att varje dag av tystnad senare kommer att läsas som ett beslut."
      ], {
        choice: ask(["Do you tell the clients?", "Berättar ni för kunderna?"], ["Tells every client what they received and requires deletion, today.", "Berättar för varje kund vad de fått och kräver radering, i dag."], [
          opt(["Tell every client today and require proof of deletion", "Berätta för varje kund i dag och kräv bevis på radering"], "c4", ["Late, and the right correction.", "Sent, och den rätta korrigeringen."]),
          opt(["Wait for the internal review to finish first", "Vänta tills den interna granskningen är klar"], "c4", ["The data stays where it went.", "Uppgifterna stannar där de hamnade."])
        ])
      }),

      pg("c4", ["Who to tell", "Vem som ska få veta"], [
        "{{num.exposed|number}} people with protected identities must be told that their address may be known. The normal way to tell someone is a letter. For these people, a letter to the leaked address confirms it, and an unexpected letter can be opened by the very person they are hiding from.\n\nThe police can help with the highest-risk cases, but not with all of them, and not this week.",
        "{{num.exposed|number}} personer med skyddade personuppgifter måste få veta att deras adress kan vara känd. Det vanliga sättet att meddela någon är ett brev. För de här personerna bekräftar ett brev till den läckta adressen just den adressen, och ett oväntat brev kan öppnas av precis den person de gömmer sig för.\n\nPolisen kan hjälpa till med fallen med högst risk, men inte med alla, och inte den här veckan."
      ], {
        discuss: [q("How do you reach someone in hiding without revealing them?", "Hur når ni någon som håller sig gömd utan att avslöja hen?", ["securityOfficer", "dpo"])],
        choice: ask(["How do you tell the people exposed?", "Hur berättar ni för dem som röjts?"], ["Contacts them personally through trained staff and the police, highest risk first.", "Kontaktar dem personligen via utbildad personal och polisen, högst risk först."], [
          opt(["Personal contact through trained staff, the police and shelters, highest risk first", "Personlig kontakt via utbildad personal, polisen och skyddade boenden, högst risk först"], "l2", ["Slow and careful; the last people are reached after a week.", "Långsamt och varsamt; de sista nås efter en vecka."], { set: "personalNotice" }),
          opt(["A letter to everyone this week, marked confidential", "Ett brev till alla den här veckan, märkt konfidentiellt"], "l2", ["Fast, and each letter goes to an address that is no longer safe.", "Snabbt, och varje brev går till en adress som inte längre är säker."]),
          opt(["A public announcement asking protected people to contact you", "Ett offentligt meddelande där skyddade personer ombeds kontakta er"], "l2", ["Reaches many, and tells everyone else the addresses are out there.", "Når många, och talar om för alla andra att adresserna finns ute."], { set: "publicFirst" }),
          opt(["Restart the address service now, as banks and debt collectors are demanding, before the fix is fully verified", "Starta adresstjänsten igen nu, som banker och inkassoföretag kräver, innan rättningen är helt verifierad"], "l2", ["Reverses your shutdown under pressure from the clients.", "Upphäver er nedstängning under tryck från kunderna."], { requires: "apiOff", set: "apiRestoredEarly", effects: { trust: -1 } })
        ])
      }),

      pg("l2", ["The clients", "Kunderna"], [
        "The {{num.clients}} companies that received protected addresses react differently. Most banks promise deletion at once. Two debt collectors say the data is now part of their case files and that the law allows them to keep it. One company does not answer.\n\nThe man who found the woman worked at one of the debt collectors.",
        "De {{num.clients}} företag som fått skyddade adresser reagerar olika. De flesta banker lovar radering direkt. Två inkassoföretag säger att uppgifterna nu ingår i deras ärenden och att lagen tillåter dem att behålla dem. Ett företag svarar inte.\n\nMannen som hittade kvinnan arbetade på ett av inkassoföretagen."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["How hard do you push the clients?", "Hur hårt pressar ni kunderna?"], ["Requires deletion with proof and suspends access for anyone who refuses.", "Kräver radering med bevis och stänger av åtkomsten för den som vägrar."], [
          opt(["Require deletion with proof, and suspend access for anyone who refuses", "Kräv radering med bevis, och stäng av åtkomsten för den som vägrar"], "c5", ["Firm; some clients will complain to the ministry.", "Bestämt; en del kunder kommer att klaga hos departementet."]),
          opt(["Ask politely and trust their answers", "Be artigt och lita på deras svar"], "c5", ["Easy, and two of them have already said no.", "Enkelt, och två av dem har redan sagt nej."])
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
          opt(["Fund emergency moves for anyone at immediate risk, decided today", "Bekosta akuta flyttar för alla med omedelbar risk, beslutat i dag"], "l3", ["Expensive, and the agency has no budget line for it.", "Dyrt, och myndigheten har ingen budgetpost för det."], { set: "relocation" }),
          opt(["Fast-track his case through the normal process", "Snabba på hans ärende inom den vanliga processen"], "l3", ["Faster than usual; still days.", "Snabbare än vanligt; fortfarande dagar."]),
          opt(["Refer him to the police", "Hänvisa honom till polisen"], "l3", ["Correct on paper. He hears “not our problem”.", "Korrekt på papperet. Han hör ”inte vårt problem”."])
        ])
      }),

      pg("l3", ["The ministry", "Departementet"], [
        "The ministry wants a written briefing by the end of the day: how many, how long, who knew, and whether anyone has been harmed. The minister has a question time in parliament tomorrow.\n\n{{person.legal.name}} notes that whatever you write will be a public document.",
        "Departementet vill ha en skriftlig lägesbild före dagens slut: hur många, hur länge, vem som visste och om någon har kommit till skada. Ministern har frågestund i riksdagen i morgon.\n\n{{person.legal.name}} påpekar att allt ni skriver blir en allmän handling."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["What do you put in the briefing?", "Vad skriver ni i lägesbilden?"], ["States the facts, including the harm already known and what is not yet known.", "Redovisar fakta, även den skada som redan är känd och det som ännu inte är känt."], [
          opt(["All facts, including the woman who was found and the unknowns", "Alla fakta, även kvinnan som hittades och det som är okänt"], "c6", ["Uncomfortable reading for the minister, and accurate.", "Obekväm läsning för ministern, och korrekt."]),
          opt(["Numbers and measures, without individual cases", "Siffror och åtgärder, utan enskilda fall"], "c6", ["Protects privacy, and leaves out the harm.", "Skyddar integriteten, och utelämnar skadan."])
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
          opt(["Give the numbers and the duration, and confirm that people have been put at risk, without details of any case", "Ge siffrorna och tiden, och bekräfta att människor har utsatts för risk, utan detaljer om något fall"], "c7", ["Honest and protective at once.", "Ärligt och skyddande på samma gång."]),
          opt(["Give the numbers, and decline to comment on harm", "Ge siffrorna, och avböj att kommentera skada"], "c7", ["Defensible, and the shelter will fill in the rest.", "Försvarbart, och boendet kommer att fylla i resten."]),
          opt(["Say it was a supplier's technical fault and that, as far as you know, nobody was harmed", "Säg att det var ett tekniskt fel hos en leverantör och att, så vitt ni vet, ingen har kommit till skada"], "x1", ["Calm, and untrue.", "Lugnt, och osant."], { effects: { media: 1, trust: -1 } })
        ])
      }),

      pg("c7", ["The regulator", "Tillsynsmyndigheten"], [
        "The breach report to {{reg.dpaShort}} is due. The fault was live for {{num.days}} days before anyone noticed, and the agency's own monitoring never flagged it; a violent man's visit did.\n\n{{person.dpo.name}} asks how much of that goes into the report.",
        "Anmälan till {{reg.dpaShort}} ska in. Felet var aktivt i {{num.days}} dagar innan någon märkte det, och myndighetens egen övervakning flaggade det aldrig; en våldsam mans besök gjorde det.\n\n{{person.dpo.name}} frågar hur mycket av det som ska med i anmälan."
      ], {
        choice: ask(["What do you report?", "Vad anmäler ni?"], ["Reports everything, including how long it went unnoticed and how it was found.", "Anmäler allt, även hur länge det pågick obemärkt och hur det upptäcktes."], [
          opt(["Everything, including how long it went unnoticed and how it was found", "Allt, även hur länge det pågick obemärkt och hur det upptäcktes"], "l4", ["Damning for your monitoring, and the regulator will find it anyway.", "Förödande för er övervakning, och tillsynsmyndigheten hittar det ändå."], { set: "reportedFully" }),
          opt(["The facts of the breach and the fix, without the detection story", "Fakta om incidenten och rättningen, utan berättelsen om upptäckten"], "l4", ["Shorter, and the first question will be how you found it.", "Kortare, och första frågan blir hur ni upptäckte det."])
        ])
      }),

      pg("l4", ["The other agencies", "De andra myndigheterna"], [
        "The address service is not the only path out of the register. Two other agencies, for tax and healthcare, receive a nightly copy of address changes. Their copies honour the protection flag, according to their documentation.\n\n{{person.ciso.name}} would like to check, rather than trust the documentation, but it means asking two peer agencies to let you inspect their systems.",
        "Adresstjänsten är inte den enda vägen ut ur registret. Två andra myndigheter, för skatt och sjukvård, får varje natt en kopia av adressändringar. Deras kopior respekterar skyddsmarkeringen, enligt deras dokumentation.\n\n{{person.ciso.name}} vill hellre kontrollera än lita på dokumentationen, men det innebär att be två andra myndigheter låta er granska deras system."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["Do you check the other agencies?", "Kontrollerar ni de andra myndigheterna?"], ["Asks to verify the other copies, and offers the same openness in return.", "Ber att få verifiera de andra kopiorna, och erbjuder samma öppenhet tillbaka."], [
          opt(["Ask to verify their copies together, this week", "Be att få verifiera deras kopior tillsammans, den här veckan"], "c8", ["Awkward between agencies, and thorough.", "Obekvämt mellan myndigheter, och grundligt."]),
          opt(["Trust their documentation", "Lita på deras dokumentation"], "c8", ["Polite, and it is what you trusted last time.", "Artigt, och det är vad ni litade på förra gången."])
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
          opt(["A direct line, funding for the extra work, and a plain apology", "En direktlinje, pengar för merarbetet och en rak ursäkt"], "c9", ["Costs money and admits fault. Buys trust where it matters most.", "Kostar pengar och medger fel. Köper förtroende där det betyder mest."], { set: "supportFund" }),
          opt(["A direct line and an apology; funding after legal review", "En direktlinje och en ursäkt; pengar efter juridisk granskning"], "c9", ["Careful, and they are working unpaid tonight.", "Försiktigt, och de arbetar oavlönat i natt."]),
          opt(["Refer them to the normal channels", "Hänvisa dem till de vanliga kanalerna"], "c9", ["Nothing promised, nothing gained.", "Inget utlovat, inget vunnet."])
        ])
      }),

      pg("c9", ["Why the test missed it", "Varför testet missade det"], [
        "The review finds why the fault reached production. The supplier tested the new batch function against a copy of the register with every protected record removed, because protected data must not be used in testing. With no protected records in the test data, nothing could fail.\n\nThe rule that was meant to protect these people made the fault invisible.",
        "Granskningen visar varför felet nådde produktion. Leverantören testade den nya batch-funktionen mot en kopia av registret där varje skyddad post tagits bort, eftersom skyddade uppgifter inte får användas i test. Utan skyddade poster i testdatan kunde ingenting fallera.\n\nRegeln som skulle skydda de här personerna gjorde felet osynligt."
      ], {
        choice: ask(["What do you change in testing?", "Vad ändrar ni i testningen?"], ["Adds synthetic protected records to every test and a second check on any change to protection logic.", "Lägger till syntetiska skyddade poster i varje test och en andra kontroll av varje ändring i skyddslogiken."], [
          opt(["Synthetic protected records in every test, and a second review of any change that touches protection", "Syntetiska skyddade poster i varje test, och en andra granskning av varje ändring som rör skyddet"], "c10", ["Cheap, and it closes exactly this gap.", "Billigt, och det täpper till exakt den här luckan."], { set: "fixedProcess" }),
          opt(["Hold the supplier liable under the contract", "Utkräv ansvar av leverantören enligt avtalet"], "c10", ["Satisfying; the gap stays open for the next supplier.", "Tillfredsställande; luckan står kvar till nästa leverantör."])
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "A month later. The addresses are off the people-search site, most clients have confirmed deletion, and dozens of people have moved. The woman who was found is safe, in another town.\n\nThe crisis team meets one last time. There is budget for one lasting change this year.",
        "En månad senare. Adresserna är borta från personsöksajten, de flesta kunder har bekräftat radering, och dussintals personer har flyttat. Kvinnan som hittades är i säkerhet, i en annan stad.\n\nKrisledningen träffas en sista gång. Det finns budget för en bestående förändring i år."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Stops protected addresses from leaving the register at all, by any route.", "Hindrar skyddade adresser från att lämna registret alls, oavsett väg."], [
          opt(["Never send protected addresses out of the register: return “protected” to every external request, whatever the endpoint", "Skicka aldrig ut skyddade adresser ur registret: svara ”skyddad” på varje externt anrop, oavsett funktion"], "r-end", ["Closes the class of fault, not just this one.", "Stänger hela klassen av fel, inte bara det här."]),
          opt(["Alerting on unusual lookups of protected records", "Larm vid ovanliga sökningar på skyddade poster"], "r-end", ["Faster detection next time, after the leak.", "Snabbare upptäckt nästa gång, efter läckan."]),
          opt(["More training for caseworkers", "Mer utbildning för handläggare"], "r-end", ["Caseworkers were not the problem.", "Handläggarna var inte problemet."])
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
          opt(["Correct the statement and apologise to her publicly", "Rätta uttalandet och be henne om ursäkt offentligt"], "x2", ["Necessary, and late.", "Nödvändigt, och sent."]),
          opt(["Say you were respecting her wish not to be mentioned", "Säg att ni respekterade hennes önskan att inte nämnas"], "x2", ["True, and not what you said.", "Sant, och inte vad ni sa."])
        ])
      }),
      pg("x2", ["Parliament", "Riksdagen"], [
        "At question time, the minister is asked whether the agency misled the public. The minister replies that the ministry was given the same information as the newspaper. The opposition calls for an independent inquiry.",
        "Vid frågestunden får ministern frågan om myndigheten vilselett allmänheten. Ministern svarar att departementet fått samma information som tidningen. Oppositionen kräver en oberoende utredning."
      ], {
        choice: ask(["What do you do now?", "Vad gör ni nu?"], ["Gives the ministry and the inquiry the full facts at once.", "Ger departementet och utredningen alla fakta direkt."], [
          opt(["Send the ministry the full facts, including what was known when you spoke to the press", "Skicka departementet alla fakta, även vad som var känt när ni talade med pressen"], "x3", ["It will reach the inquiry anyway.", "Det når utredningen ändå."]),
          opt(["Wait for the inquiry's questions", "Vänta på utredningens frågor"], "x3", ["The minister will not wait.", "Ministern kommer inte att vänta."])
        ])
      }),
      pg("x3", ["The shelters walk away", "Boendena drar sig ur"], [
        "The national shelter organisation announces that it will no longer advise its residents to rely on the agency's protection. It tells them to use a post-box address and give nothing to any public body they do not have to.",
        "Riksorganisationen för skyddade boenden meddelar att den inte längre råder sina boende att lita på myndighetens skydd. Den uppmanar dem att använda en boxadress och inte lämna något till någon offentlig instans som de inte måste."
      ], {
        choice: ask(["How do you respond to the shelters?", "Hur bemöter ni de skyddade boendena?"], ["Meets them, admits the statement was wrong and asks what would rebuild trust.", "Träffar dem, medger att uttalandet var fel och frågar vad som skulle bygga upp förtroendet igen."], [
          opt(["Meet them, admit the statement was wrong, and ask what they need", "Träffa dem, medge att uttalandet var fel, och fråga vad de behöver"], "x4", ["Humbling, and the only start.", "Ödmjukande, och den enda början."]),
          opt(["Issue a statement defending the agency's protection", "Gå ut med ett uttalande som försvarar myndighetens skydd"], "x4", ["Read by every shelter as proof.", "Läses av varje boende som ett bevis."])
        ])
      }),
      pg("x4", ["The inquiry", "Utredningen"], [
        "The independent inquiry begins. Its first question is not about the software fault. It is about why the agency told the public nobody was harmed when it knew of a woman who had fled her home in the night.",
        "Den oberoende utredningen inleds. Dess första fråga handlar inte om programfelet. Den handlar om varför myndigheten sa till allmänheten att ingen kommit till skada när den kände till en kvinna som flytt sitt hem mitt i natten."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Answers fully and accepts responsibility.", "Svarar fullständigt och tar ansvar."], [
          opt(["Answer fully and accept responsibility", "Svara fullständigt och ta ansvar"], "e5", ["It does not undo the statement, but it helps.", "Det gör inte uttalandet ogjort, men det hjälper."]),
          opt(["Answer through lawyers, in writing", "Svara via jurister, skriftligt"], "e5", ["Reads as more to hide.", "Uppfattas som att det finns mer att dölja."])
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
