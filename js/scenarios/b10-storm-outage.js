/*
 * b10-storm-outage.js — "The Storm and the Silence" (branching, regional crisis).
 *
 * A storm takes out power and most mobile coverage across the region on a
 * weekday evening. No attacker at first; then opportunists phish staff and
 * pose as the helpdesk. Spine: lights out → staff safety → the data room →
 * customers → the phishing → day two → costs → back to normal → the
 * continuity plan → lessons. Alternative: failing over to the secondary site.
 * Break-away on day two: telling the press it was a cyberattack.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b10-storm-outage",
    version: 1,
    format: "branching",
    category: "regional-crisis",
    archetype: "compound-crisis",
    emblem: "blackout",
    title: L(["The Storm and the Silence", "Stormen och tystnaden"]),
    summary: L([
      "A storm takes out power and most mobile coverage across the region. Nobody attacked you, until the scammers notice that nobody can check anything.",
      "En storm slår ut strömmen och nästan all mobiltäckning i regionen. Ingen har angripit er, tills bedragarna märker att ingen kan kontrollera något."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Lead when normal communication channels fail", "Leda när de vanliga kommunikationskanalerna fallerar"]) },
      { id: "lo2", text: L(["Put staff safety first in a physical crisis", "Sätta personalens säkerhet först i en fysisk kris"]) },
      { id: "lo3", text: L(["Shut down and restart IT in a controlled order", "Stänga ned och starta upp IT i kontrollerad ordning"]) },
      { id: "lo4", text: L(["Expect opportunistic attacks during a crisis", "Räkna med opportunistiska angrepp under en kris"]) }
    ],
    mitre: ["T1566", "T1656", "T1078", "T1204"],
    frameworks: {
      nistCsf: ["GV.OC", "ID.IM", "PR.AT", "PR.IR", "RS.CO", "RC.RP", "RC.CO"],
      iso27001: ["A.5.24", "A.5.29", "A.5.30", "A.6.3", "A.7.11", "A.8.13", "A.8.14"]
    },
    constraints: { startWindow: "any", sectors: ["logistics", "transport", "manufacturing", "retail"] },
    actor: { types: ["criminal"], motivation: L(["Opportunistic: phishing and fake helpdesk calls during the outage", "Opportunistisk: nätfiske och falska samtal från ”IT-support” under avbrottet"]), capability: "low" },
    variables: {
      onShift: { min: 12, max: 180, scaleBy: "size" },
      fuelHours: { min: 10, max: 24 },
      replicationLag: { min: 2, max: 12 }
    },
    roles: ["incidentCommander", "ceo", "itOps", "facilities", "hr", "comms", "serviceOwner", "dutyOfficer", "ciso", "supplierManager"],

    flags: {
      fallbackComms: L(["Crisis team reached through the fallback channel", "Krisgruppen nådd via reservkanalen"]),
      waited: L(["Waited until morning", "Väntade till morgonen"]),
      staffSafe: L(["Every person on shift accounted for", "Alla i tjänst redovisade"]),
      fuelStretched: L(["Generator fuel stretched", "Generatorbränslet drygat ut"]),
      hardCrash: L(["Data room ran until the power died", "Datarummet gick tills strömmen dog"]),
      phishWarned: L(["Staff warned about storm scams", "Personalen varnad för stormbedrägerier"])
    },

    start: "c1",
    pages: [
      pg("c1", ["Lights out", "Mörker"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The storm that was forecast for tonight arrives early and harder than expected. Within an hour, head office and two sites have lost power.\n\nMobile calls drop after a few seconds, and messages arrive late or not at all. In the data room, the batteries give you 45 minutes before the generator has to take over. Nobody has attacked you. Nothing works anyway.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Stormen som var utlovad till i natt kommer tidigt och hårdare än väntat. Inom en timme har huvudkontoret och två anläggningar förlorat strömmen.\n\nMobilsamtal bryts efter några sekunder, och meddelanden kommer fram sent eller inte alls. I datahallen ger batterierna er 45 minuter innan reservkraften måste ta över. Ingen har attackerat er. Ingenting fungerar ändå."
      ], {
        injects: [
          inj("b10-1", 5, "advisory", "management", "high", "confirmed", [
            "Extreme weather warning: widespread power cuts expected to last more than 24 hours. Mobile networks degraded. Avoid travel.",
            "Varning för extremt väder: omfattande strömavbrott väntas pågå mer än ett dygn. Mobilnäten är störda. Undvik att resa."
          ], { headline: ["Regional emergency warning", "Regional varning"], tests: ["lo1"] })
        ],
        discuss: [q("If phones and chat don't work, how does the crisis team find each other?", "Om telefon och chatt inte fungerar, hur hittar krisgruppen varandra?", ["incidentCommander", "dutyOfficer"])],
        facilitator: { notes: L(["No attacker yet. The test is whether the organisation can lead without its normal tools.", "Ingen angripare ännu. Provet är om organisationen kan leda utan sina vanliga verktyg."]) },
        choice: ask(["How do you get the crisis team together?", "Hur samlar ni krisgruppen?"], ["Uses a pre-agreed fallback: meeting point, landline or radio, without waiting for the network.", "Använder en förutbestämd reservlösning: mötesplats, fast telefon eller radio, utan att vänta på nätet."], [
          opt(["The agreed fallback: meeting point and satellite phone", "Den överenskomna reservlösningen: mötesplats och satellittelefon"], "c2", ["Works if it was agreed and the phone is charged.", "Fungerar om den var överenskommen och telefonen är laddad."], { set: "fallbackComms" }),
          opt(["Keep trying mobile and chat", "Fortsätt försöka med mobil och chatt"], "c2", ["Some messages get through, eventually.", "En del meddelanden kommer fram, till slut."]),
          opt(["Wait until morning", "Vänta till morgonen"], "c2", ["The night shift is on its own until then.", "Nattskiftet är på egen hand till dess."], { set: "waited" })
        ])
      }),

      pg("c2", ["The night shift", "Nattskiftet"], [
        "{{num.onShift}} people are on the night shift at the depot, loading tomorrow's deliveries.\n\nThe police are closing roads because of fallen trees, and some of the staff live far out in the countryside. Their families are calling, when the calls get through, to ask whether they are coming home.",
        "{{num.onShift}} personer arbetar nattskift på depån och lastar morgondagens leveranser.\n\nPolisen stänger vägar på grund av nedfallna träd, och en del av personalen bor långt ute på landet. Deras familjer ringer, när samtalen går fram, och frågar om de kommer hem."
      ], {
        variants: [vr("waited", [
          "Nobody gathered the crisis team overnight. By morning you learn that one of the {{num.onShift}} people on the night shift drove home through a closed road and hit a fallen tree.\n\nThey are injured but alive, and in hospital. Nobody at the company knew where they were for six hours. The rest of the shift is still at the depot, waiting for instructions.",
          "Ingen samlade krisledningen under natten. På morgonen får ni veta att en av de {{num.onShift}} personerna på nattskiftet körde hem på en avstängd väg och krockade med ett nedfallet träd.\n\nPersonen är skadad men vid liv, och ligger på sjukhus. Ingen på företaget visste var hen var på sex timmar. Resten av skiftet är fortfarande kvar på depån och väntar på besked."
        ], ["Because nobody led the night, people made their own decisions.", "Eftersom ingen ledde under natten fattade folk egna beslut."])],
        discuss: [q("How do you know everyone is safe if you can't call them?", "Hur vet ni att alla är i säkerhet om ni inte kan ringa dem?", ["hr", "facilities"])],
        choice: ask(["What about the people on shift?", "Vad gäller för dem som är i tjänst?"], ["Accounts for everyone and keeps them safe where they are.", "Redovisar alla och håller dem säkra där de är."], [
          opt(["Account for everyone; keep them safe on site until roads open", "Redovisa alla; håll dem säkra på plats tills vägarna öppnar"], "l1", ["Food, heat and a list of names.", "Mat, värme och en lista med namn."], { set: "staffSafe" }),
          opt(["Send them home", "Skicka hem dem"], "l1", ["On closed roads, in the dark.", "På avstängda vägar, i mörker."]),
          opt(["Leave it to the site managers", "Låt platschefer avgöra"], "l1", ["Sensible delegation without a check that it happened.", "Förnuftig delegering utan kontroll av att det skedde."])
        ])
      }),

      pg("l1", ["Fuel", "Bränsle"], [
        "The data room's generator starts as it should. But someone checks the tank: it holds fuel for {{num.fuelHours}} hours at full load.\n\nThe fuel supplier cannot reach you until the roads are cleared, and nobody knows when that will be. Every system you keep running burns fuel you may need later.",
        "Datahallens reservkraft startar som den ska. Men någon kontrollerar tanken: den räcker i {{num.fuelHours}} timmar vid full last.\n\nBränsleleverantören kan inte nå er förrän vägarna är röjda, och ingen vet när det blir. Varje system ni låter vara igång förbrukar bränsle som ni kanske behöver senare."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["How do you use the fuel?", "Hur använder ni bränslet?"], ["Sheds non-critical load to stretch the fuel.", "Kopplar bort det som inte är kritiskt för att dryga ut bränslet."], [
          opt(["Shut down everything non-critical to stretch it", "Stäng ned allt som inte är kritiskt för att dryga ut det"], "c3", ["Choices about what matters, made calmly now.", "Beslut om vad som är viktigt, fattade i lugn och ro nu."], { set: "fuelStretched" }),
          opt(["Run everything", "Kör allt"], "c3", ["Until the tank is empty.", "Tills tanken är tom."])
        ])
      }),

      pg("c3", ["The data room", "Datarummet"], [
        "Day one, evening. Power is still out and the forecast says it may take another day.\n\nThe data room runs everything: the warehouse system, orders, email and the customer portal. If the fuel runs out with the servers still running, they crash hard, and some may not come back.",
        "Dag ett, kväll. Strömmen är fortfarande borta och prognosen säger att det kan ta ett dygn till.\n\nDatahallen driver allt: lagersystemet, orderhanteringen, e-posten och kundportalen. Om bränslet tar slut medan servrarna är igång kraschar de hårt, och en del kanske inte kommer tillbaka."
      ], {
        variants: [vr("fuelStretched", [
          "Day one, evening. Because non-critical systems were shut down, the generator will last about thirty hours instead of {{num.fuelHours}}.\n\nPower is still out, and the forecast says it may take another day. Thirty hours is more time, but not enough to be sure. The question is how to use it.",
          "Dag ett, kväll. Eftersom icke-kritiska system stängdes av räcker reservkraften i ungefär trettio timmar i stället för {{num.fuelHours}}.\n\nStrömmen är fortfarande borta, och prognosen säger att det kan ta ett dygn till. Trettio timmar är mer tid, men inte tillräckligt för att vara säker. Frågan är hur ni använder den."
        ], ["Because you stretched the fuel, you have time to choose.", "Eftersom ni drygade ut bränslet har ni tid att välja."])],
        choice: ask(["What do you do with the data room?", "Vad gör ni med datarummet?"], ["Shuts down in a controlled order rather than letting systems crash.", "Stänger ned i kontrollerad ordning i stället för att låta systemen krascha."], [
          opt(["A controlled shutdown before the fuel runs out", "En kontrollerad nedstängning innan bränslet tar slut"], "c4", ["Clean restart later.", "En ren omstart senare."]),
          opt(["Keep it running until the power dies", "Håll det igång tills strömmen dör"], "c4", ["Every hour of service, then a hard crash.", "Varje timme av drift, sedan en hård krasch."], { set: "hardCrash" }),
          opt(["Fail over to the secondary site", "Växla över till den sekundära anläggningen"], "c3b", ["Two hundred kilometres away, with power.", "Tvåhundra kilometer bort, med ström."])
        ])
      }),

      pg("c3b", ["The secondary site", "Den sekundära anläggningen"], [
        "The secondary site, in another town, still has power and working connections.\n\nBut data replication between the sites runs {{num.replicationLag}} hours behind. Switching over means losing the most recent orders, deliveries and changes, which someone will have to find and re-enter by hand.",
        "Reservanläggningen, i en annan ort, har fortfarande ström och fungerande förbindelser.\n\nMen datareplikeringen mellan anläggningarna ligger {{num.replicationLag}} timmar efter. Att växla över innebär att de senaste beställningarna, leveranserna och ändringarna försvinner, och någon måste leta upp och lägga in dem för hand."
      ], {
        choice: ask(["Do you run from there?", "Kör ni därifrån?"], ["Accepts known data loss deliberately, and records what must be re-entered.", "Accepterar en känd dataförlust medvetet, och dokumenterar vad som måste föras in igen."], [
          opt(["Yes, and list what must be re-entered", "Ja, och lista vad som måste föras in igen"], "c4", ["A deliberate trade.", "En medveten avvägning."]),
          opt(["No, wait for the primary", "Nej, vänta på den primära"], "c4", ["Back to the fuel question.", "Tillbaka till bränslefrågan."])
        ])
      }),

      pg("c4", ["Customers", "Kunderna"], [
        "Tomorrow's deliveries cannot leave the depot: the roads are closed and the warehouse system is struggling.\n\nThe customer portal is down. Customers are calling the usual phone numbers, which ring in offices without power where nobody can answer. Some of your customers are shops and care homes waiting for supplies.",
        "Morgondagens leveranser kan inte lämna depån: vägarna är avstängda och lagersystemet har problem.\n\nKundportalen ligger nere. Kunderna ringer de vanliga telefonnumren, som ringer på kontor utan ström där ingen kan svara. En del av era kunder är butiker och äldreboenden som väntar på leveranser."
      ], {
        choice: ask(["How do you reach customers?", "Hur når ni kunderna?"], ["Uses whatever channel still works, with honest expectations.", "Använder den kanal som fortfarande fungerar, med ärliga förväntningar."], [
          opt(["A status page hosted elsewhere and messages where possible", "En statussida som ligger någon annanstans och meddelanden där det går"], "l2", ["Some reach, honest expectations.", "Viss räckvidd, ärliga förväntningar."]),
          opt(["Nothing until systems are back", "Ingenting tills systemen är tillbaka"], "l2", ["Customers fill the silence themselves.", "Kunderna fyller tystnaden själva."])
        ])
      }),

      pg("l2", ["The municipality", "Kommunen"], [
        "Someone from the municipality's crisis meeting gets through on a landline. They know you have trucks and diesel.\n\nThey ask whether you can lend vehicles and fuel for priority needs: moving elderly residents and supplying water to an area without it. Your own generator is running on the same diesel.",
        "Någon från kommunens krisledning når fram via en fast telefon. De vet att ni har lastbilar och diesel.\n\nDe frågar om ni kan låna ut fordon och bränsle för prioriterade behov: att flytta äldre invånare och leverera vatten till ett område som saknar det. Er egen reservkraft går på samma diesel."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["Do you help?", "Hjälper ni till?"], ["Contributes what it can spare without risking its own safety.", "Bidrar med det som kan avvaras utan att riskera den egna säkerheten."], [
          opt(["Offer what you can spare", "Erbjud det ni kan avvara"], "c5", ["Good for the region; you remember who helped.", "Bra för regionen; man minns vem som hjälpte."]),
          opt(["Decline; you need it all", "Tacka nej; ni behöver allt"], "c5", ["Sometimes true.", "Ibland sant."])
        ])
      }),

      pg("c5", ["Storm scams", "Stormbedrägerier"], [
        "The first scams arrive while people are tired and cut off. Staff receive emails: “Storm emergency payment for employees, enter your bank details” and “IT: reset your password after the outage”.\n\nBoth look official, both use the company logo, and both arrive when nobody can easily call anyone to check. Several people have already clicked.",
        "De första bedrägerierna kommer medan folk är trötta och avskurna. Personalen får mejl: ”Krisersättning för anställda på grund av stormen, ange dina bankuppgifter” och ”IT: återställ ditt lösenord efter avbrottet”.\n\nBåda ser officiella ut, båda använder företagets logotyp och båda kommer när ingen enkelt kan ringa någon och kontrollera. Flera personer har redan klickat."
      ], {
        variants: [vr("fallbackComms", [
          "The first scams arrive while people are tired and cut off: a “storm emergency payment” asking for bank details, and an “IT password reset after the outage”.\n\nBecause the crisis team has a known, agreed channel, staff know where real instructions come from. Several forward the emails to the crisis team instead of clicking. A few have already clicked.",
          "De första bedrägerierna kommer medan folk är trötta och avskurna: en ”krisersättning på grund av stormen” som ber om bankuppgifter, och en ”lösenordsåterställning efter avbrottet” från IT.\n\nEftersom krisledningen har en känd, överenskommen kanal vet personalen var riktiga instruktioner kommer ifrån. Flera vidarebefordrar mejlen till krisledningen i stället för att klicka. Några har redan klickat."
        ], ["Because the crisis channel was established, fakes stand out.", "Eftersom krisgruppens kanal var etablerad sticker förfalskningarna ut."])],
        injects: [
          inj("b10-2", 1200, "phishingEmail", "attacker", "high", "confirmed", [
            "Due to the storm, all employees are entitled to an emergency payment. Register your bank details by 18:00 today to receive it this week.",
            "På grund av stormen har alla anställda rätt till en krisersättning. Registrera dina bankuppgifter före klockan 18 i dag för att få den den här veckan."
          ], { headline: ["Storm emergency payment for employees", "Krisersättning för anställda efter stormen"], meta: { from: "hr-support@{{asset.lookalikeDomain}}", subject: L(["Emergency payment", "Krisersättning"]) }, tests: ["lo4"] })
        ],
        discuss: [q("Why do scams work so well during a real crisis?", "Varför fungerar bedrägerier så bra under en verklig kris?", ["ciso", "hr"])],
        choice: ask(["What do you do?", "Vad gör ni?"], ["Warns staff through the crisis channel and states what real messages will look like.", "Varnar personalen via krisgruppens kanal och anger hur riktiga meddelanden kommer att se ut."], [
          opt(["Warn through the crisis channel; block the senders", "Varna via krisgruppens kanal; blockera avsändarna"], "l3", ["Fast and believable.", "Snabbt och trovärdigt."], { set: "phishWarned" }),
          opt(["Too busy; deal with it later", "För mycket att göra; ta det senare"], "l3", ["The scammers aren't busy.", "Bedragarna har inte för mycket att göra."])
        ])
      }),

      pg("l3", ["The helpdesk calls", "”IT-supporten” ringer"], [
        "The scammers switch to the phone. Staff working from the few landlines still in service get calls from “IT support”.\n\nThe caller is friendly and patient, and asks for the code from the staff member's authenticator app “to restore your access after the outage”. One person in finance has already read out a code.",
        "Bedragarna byter till telefonen. Anställda som arbetar vid de få fasta telefoner som fortfarande fungerar får samtal från ”IT-supporten”.\n\nDen som ringer är vänlig och tålmodig, och ber om koden från den anställdes autentiseringsapp ”för att återställa din åtkomst efter avbrottet”. En person på ekonomi har redan läst upp en kod."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["How do you stop it?", "Hur stoppar ni det?"], ["Announces that IT never asks for codes, and gives a call-back route.", "Meddelar att IT aldrig ber om koder, och anger en väg för återuppringning."], [
          opt(["Announce: IT never asks for codes; call back on a known number", "Meddela: IT ber aldrig om koder; ring tillbaka på ett känt nummer"], "c6", ["Clear rule, easy to follow.", "Tydlig regel, lätt att följa."], { set: "phishWarned" }),
          opt(["Investigate the calls first", "Utred samtalen först"], "c6", ["While codes are handed over.", "Medan koder lämnas ut."])
        ])
      }),

      pg("c6", ["Day two", "Dag två"], [
        "Day two. Power returns to head office in the afternoon, and the network starts coming back.\n\nEvery department wants its systems back immediately: the warehouse, sales, finance, customer service. The IT team is small and has been awake for thirty hours.",
        "Dag två. Strömmen kommer tillbaka till huvudkontoret på eftermiddagen och nätet börjar fungera igen.\n\nVarje avdelning vill ha sina system tillbaka omedelbart: lagret, försäljningen, ekonomi, kundtjänst. IT-teamet är litet och har varit vakna i trettio timmar."
      ], {
        variants: [vr("hardCrash", [
          "Day two. Power returns to head office in the afternoon.\n\nTwo servers did not come back after the hard crash when the fuel ran out, and the warehouse database reports corruption. Every department still wants everything back immediately, and the IT team has been awake for thirty hours.",
          "Dag två. Strömmen kommer tillbaka till huvudkontoret på eftermiddagen.\n\nTvå servrar kom inte tillbaka efter den hårda kraschen när bränslet tog slut, och lagerdatabasen rapporterar skadad data. Alla avdelningar vill ändå ha allt tillbaka omedelbart, och IT-teamet har varit vakna i trettio timmar."
        ], ["Because the data room ran until it crashed, the restart is harder.", "Eftersom datarummet gick tills det kraschade blir omstarten svårare."])],
        choice: ask(["How do you restart?", "Hur startar ni igen?"], ["Restarts in priority order with checks at each step.", "Startar i prioritetsordning med kontroller i varje steg."], [
          opt(["In priority order, checking each system", "I prioritetsordning, med kontroll av varje system"], "c7", ["Slower first hour, fewer surprises.", "Långsammare första timme, färre överraskningar."]),
          opt(["Everything at once", "Allt på en gång"], "c7", ["The fastest way to find what's broken.", "Det snabbaste sättet att hitta det som är trasigt."]),
          opt(["Wait until power is stable everywhere", "Vänta tills strömmen är stabil överallt"], "c7", ["Safe, slow.", "Säkert, långsamt."]),
          opt(["Tell the press a cyberattack caused the delays", "Säg till pressen att ett cyberangrepp orsakade förseningarna"], "x1", ["Sounds better than “we weren't ready”.", "Låter bättre än ”vi var inte förberedda”."])
        ])
      }),

      pg("c7", ["The costs", "Kostnaderna"], [
        "The bills start arriving: spoiled chilled goods, overtime for everyone who worked through, hired generators and emergency repairs.\n\nThe insurer asks for documentation of every cost, with dates and decisions. Nobody kept a proper log during the first night.",
        "Räkningarna börjar komma: förstörda kylvaror, övertid för alla som arbetade igenom, hyrda elverk och akuta reparationer.\n\nFörsäkringsbolaget begär dokumentation för varje kostnad, med datum och beslut. Ingen förde en ordentlig logg under den första natten."
      ], {
        choice: ask(["How do you handle the claim?", "Hur hanterar ni anspråket?"], ["Documents decisions and costs as they happen.", "Dokumenterar beslut och kostnader allteftersom."], [
          opt(["Assemble the crisis log and receipts now", "Sammanställ krisloggen och kvittona nu"], "l4", ["Memory fades by the week.", "Minnet bleknar för varje vecka."]),
          opt(["Estimate later", "Uppskatta senare"], "l4", ["Estimates get cut.", "Uppskattningar skärs ned."])
        ])
      }),

      pg("l4", ["The suppliers", "Leverantörerna"], [
        "The review of suppliers finds a gap between paper and reality. The telecom provider's service level promised to restore your connections within four hours.\n\nIt took thirty. The contract gives you a small service credit, which does nothing for the deliveries that never left.",
        "Genomgången av leverantörerna visar ett glapp mellan papper och verklighet. Teleoperatörens servicenivå lovade att återställa era förbindelser inom fyra timmar.\n\nDet tog trettio. Avtalet ger er en liten kreditering, som inte hjälper de leveranser som aldrig lämnade depån."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you do with that?", "Vad gör ni med det?"], ["Plans for suppliers failing in a regional event, not only for compensation.", "Planerar för att leverantörer fallerar vid en regional händelse, inte bara för ersättning."], [
          opt(["Plan for diverse connections and a satellite backup", "Planera för olika förbindelser och satellitreserv"], "c8", ["Assumes the region fails together.", "Utgår från att regionen fallerar samtidigt."]),
          opt(["Claim the service credit", "Kräv servicekompensationen"], "c8", ["A small cheque.", "En liten check."])
        ])
      }),

      pg("c8", ["Back to normal", "Tillbaka till det normala"], [
        "A week later, everything runs again. The roads are clear, deliveries have caught up and the depot is back to normal routines.\n\nEveryone is tired, and many would like to put the storm behind them as quickly as possible.",
        "En vecka senare fungerar allt igen. Vägarna är röjda, leveranserna har kommit ikapp och depån är tillbaka i sina vanliga rutiner.\n\nAlla är trötta, och många vill gärna lägga stormen bakom sig så fort som möjligt."
      ], {
        choice: ask(["What happens now?", "Vad händer nu?"], ["Holds an after-action review with the people who were there.", "Håller en genomgång efteråt med dem som var där."], [
          opt(["An after-action review with staff from every site", "En genomgång efteråt med personal från alla anläggningar"], "c9", ["Captures what really happened.", "Fångar vad som verkligen hände."]),
          opt(["Move on", "Gå vidare"], "c9", ["And repeat it next storm.", "Och upprepa det vid nästa storm."])
        ])
      }),

      pg("c9", ["The continuity plan", "Kontinuitetsplanen"], [
        "Someone reads the business continuity plan aloud. It assumed, on almost every page, that phones would work and that people could be reached.\n\nIt was written four years ago, and nobody had ever tested it.",
        "Någon läser kontinuitetsplanen högt. På nästan varje sida utgick den från att telefonerna skulle fungera och att folk gick att nå.\n\nDen skrevs för fyra år sedan, och ingen hade någonsin testat den."
      ], {
        choice: ask(["What do you change?", "Vad ändrar ni?"], ["Tests the plan in a blackout exercise and adds offline fallbacks.", "Testar planen i en övning med strömavbrott och lägger till reservlösningar som fungerar utan nät."], [
          opt(["A yearly blackout exercise and an offline crisis kit", "En årlig övning med strömavbrott och en krislåda som fungerar utan nät"], "c10", ["Practice, not paper.", "Övning, inte papper."]),
          opt(["Update the document", "Uppdatera dokumentet"], "c10", ["Paper again.", "Papper igen."])
        ])
      }),

      pg("c10", ["The scam lesson", "Lärdomen om bedrägerierna"], [
        "The last finding of the review is about the scams. They peaked exactly when people were most tired and least able to check anything: on the first night and the morning after.\n\nThe crisis plan says nothing about fraud. Next time, the scammers will be just as quick.",
        "Det sista fyndet i genomgången handlar om bedrägerierna. De nådde sin topp precis när folk var som tröttast och minst kunde kontrollera något: den första natten och morgonen efter.\n\nKrisplanen säger ingenting om bedrägerier. Nästa gång kommer bedragarna att vara lika snabba."
      ], {
        choice: ask(["What goes into the crisis plan?", "Vad förs in i krisplanen?"], ["Puts security warnings into crisis communications from the first hour.", "För in säkerhetsvarningar i kriskommunikationen från första timmen."], [
          opt(["Scam warnings in the first crisis message", "Varningar för bedrägerier i det första krismeddelandet"], "r-end", ["Prevents the predictable.", "Förebygger det förutsägbara."]),
          opt(["Nothing; it was a one-off", "Ingenting; det var en engångsföreteelse"], "r-end", ["It never is.", "Det är det aldrig."])
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["fallbackComms", "staffSafe", "phishWarned"], "e1"],
          [["staffSafe", "phishWarned"], "e2"],
          ["staffSafe", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["A month later", "En månad senare"], ["The crisis team met within the hour, everyone on the night shift was accounted for and safe, and staff recognised a scam when they saw one.\n\nThe storm cost money, in spoiled goods and overtime, but nothing more. The municipality thanked you publicly for the trucks.", "Krisledningen möttes inom en timme, alla på nattskiftet var kontrollerade och i säkerhet, och personalen kände igen ett bedrägeri när de såg ett.\n\nStormen kostade pengar, i förstörda varor och övertid, men inget mer. Kommunen tackade er offentligt för lastbilarna."], {
        ending: end(1, ["Ready for the dark", "Redo för mörkret"], [
          "The crisis team met within the hour, everyone on shift was safe, and staff knew a scam when they saw one. The storm cost money, nothing more.",
          "Krisgruppen samlades inom en timme, alla i tjänst var i säkerhet och personalen kände igen ett bedrägeri när de såg det. Stormen kostade pengar, inget mer."
        ])
      }),
      pg("e2", ["A month later", "En månad senare"], ["Staff were safe and the scams were blocked.\n\nBut it took hours to get the crisis team together, because the plan depended on phones that did not work. The review asks for a fallback that works without phones, and a date when it will be tested.", "Personalen var i säkerhet och bedrägerierna stoppades.\n\nMen det tog timmar att samla krisledningen, eftersom planen byggde på telefoner som inte fungerade. Genomgången kräver en reservlösning som fungerar utan telefoner, och ett datum då den ska testas."], {
        ending: end(2, ["Safe, but slow to gather", "Säkert, men långsamt att samlas"], [
          "Staff were safe and scams were blocked, but it took hours to get the crisis team together. The review asks for a fallback that works without phones.",
          "Personalen var i säkerhet och bedrägerierna stoppades, men det tog timmar att samla krisgruppen. Genomgången efterfrågar en reservlösning som fungerar utan telefoner."
        ])
      }),
      pg("e3", ["A month later", "En månad senare"], ["Everyone was safe, which mattered most.\n\nBut staff handed over bank details and authenticator codes to the storm scammers. Accounts have to be cleaned, salary payments checked by hand, and one employee's salary went to a criminal's account.", "Alla var i säkerhet, vilket var det viktigaste.\n\nMen personalen lämnade ut bankuppgifter och autentiseringskoder till stormbedragarna. Konton måste rensas, lönebetalningar kontrolleras för hand, och en anställds lön gick till en kriminells konto."], {
        ending: end(3, ["Safe, then scammed", "I säkerhet, sedan lurade"], [
          "Everyone was safe, but staff handed over bank details and authenticator codes to storm scammers. Accounts must be cleaned and salaries checked.",
          "Alla var i säkerhet, men personal lämnade ut bankuppgifter och koder till stormbedragare. Konton måste saneras och löner kontrolleras."
        ])
      }),
      pg("e4", ["Two months later", "Två månader senare"], ["Nobody accounted for the night shift, and someone was hurt on a closed road on their way home.\n\nThe work environment authority has opened an inquiry into how the company protects staff in a crisis. The colleague is recovering, but the question of why nobody called them is still unanswered.", "Ingen kontrollerade nattskiftet, och en person skadades på en avstängd väg på väg hem.\n\nArbetsmiljömyndigheten har inlett en utredning om hur företaget skyddar personalen i en kris. Kollegan återhämtar sig, men frågan om varför ingen ringde är fortfarande obesvarad."], {
        ending: end(4, ["Nobody counted", "Ingen räknade"], [
          "Nobody accounted for the night shift, and someone was hurt on a closed road. The work environment authority opens an inquiry.",
          "Ingen redovisade nattskiftet, och någon skadades på en avstängd väg. Arbetsmiljömyndigheten inleder en utredning."
        ])
      }),

      // Break-away: "it was a cyberattack".
      pg("x1", ["A convenient attack", "Ett lägligt angrepp"], [
        "Your statement to the press blames a cyberattack for the delays. It sounds better than “we had no plan for a storm”.\n\nThe evening news reports that {{org.name}} was hit by a cyberattack during the storm. The next morning {{reg.csirt}} calls: they want details of the attack, so they can warn others.",
        "Ert uttalande till pressen skyller förseningarna på en cyberattack. Det låter bättre än ”vi hade ingen plan för en storm”.\n\nKvällsnyheterna rapporterar att {{org.name}} drabbades av en cyberattack under stormen. Nästa morgon ringer {{reg.csirt}}: de vill ha detaljer om attacken, så att de kan varna andra."
      ], {
        choice: ask(["What do you tell the CSIRT?", "Vad säger ni till CSIRT?"], ["Tells the authority the truth immediately.", "Berättar sanningen för myndigheten omedelbart."], [
          opt(["The truth: it was the storm", "Sanningen: det var stormen"], "x2", ["Now the press statement is the problem.", "Nu är pressuttalandet problemet."]),
          opt(["Vague answers", "Vaga svar"], "x2", ["An authority now spends time on a false lead.", "En myndighet lägger nu tid på ett falskt spår."])
        ])
      }),
      pg("x2", ["Staff talk", "Personalen pratar"], [
        "Staff who worked through the night read the news. Several of them tell the local paper there was no attack, only a storm and no plan.\n\nThe article quotes them by name, next to your statement.",
        "Anställda som arbetade igenom natten läser nyheterna. Flera av dem berättar för lokaltidningen att det inte var någon attack, bara en storm och ingen plan.\n\nArtikeln citerar dem med namn, bredvid ert uttalande."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Corrects the record publicly.", "Rättar uppgifterna offentligt."], [
          opt(["Correct it publicly", "Rätta det offentligt"], "x3", ["Necessary.", "Nödvändigt."]),
          opt(["Say nothing more", "Säg inget mer"], "x3", ["The paper prints both stories.", "Tidningen trycker båda versionerna."])
        ])
      }),
      pg("x3", ["The insurer", "Försäkringsbolaget"], [
        "Your insurer has seen the news too. It notes the claim of a cyberattack, and asks whether you intend to claim under the cyber policy rather than the property policy.\n\nThe answer will be put in writing and compared with the evidence.",
        "Ert försäkringsbolag har också sett nyheterna. Det noterar påståendet om en cyberattack och frågar om ni tänker göra anspråk på cyberförsäkringen i stället för egendomsförsäkringen.\n\nSvaret kommer att dokumenteras skriftligt och jämföras med bevisen."
      ], {
        choice: ask(["What do you answer?", "Vad svarar ni?"], ["Keeps insurance claims strictly factual.", "Håller försäkringsanspråken strikt sakliga."], [
          opt(["No: the loss was weather", "Nej: förlusten berodde på vädret"], "x4", ["Correct, and awkward.", "Korrekt, och pinsamt."]),
          opt(["Keep the option open", "Håll möjligheten öppen"], "x4", ["That road leads to fraud.", "Den vägen leder till bedrägeri."])
        ])
      }),
      pg("x4", ["Trust", "Förtroende"], [
        "Customers and staff now question every statement from management, not only about the storm.\n\nThe union asks for an independent review, and two large customers ask for written assurances about your continuity planning.",
        "Kunder och personal ifrågasätter nu varje uttalande från ledningen, inte bara om stormen.\n\nFacket begär en oberoende granskning, och två stora kunder ber om skriftliga försäkringar om er kontinuitetsplanering."
      ], {
        choice: ask(["How do you rebuild it?", "Hur bygger ni upp det igen?"], ["Admits the misstatement and shares the honest review.", "Erkänner det felaktiga uttalandet och delar den ärliga genomgången."], [
          opt(["Admit it and publish the honest review", "Erkänn det och publicera den ärliga genomgången"], "e5", ["The slow way back.", "Den långsamma vägen tillbaka."]),
          opt(["Wait for it to blow over", "Vänta tills det blåser över"], "e5", ["It doesn't.", "Det gör det inte."])
        ])
      }),
      pg("e5", ["Three months later", "Tre månader senare"], ["Blaming an invented cyberattack misled an authority, your insurer and your own staff.\n\nThe storm passed in two days. The loss of trust did not: customers want written guarantees, staff doubt management's word, and {{reg.csirt}} remembers the wasted morning.", "Att skylla på en påhittad cyberattack vilseledde en myndighet, ert försäkringsbolag och er egen personal.\n\nStormen drog förbi på två dagar. Förtroendeförlusten gjorde det inte: kunderna vill ha skriftliga garantier, personalen tvivlar på ledningens ord och {{reg.csirt}} minns den bortkastade morgonen."], {
        ending: end(5, ["The storm after the storm", "Stormen efter stormen"], [
          "Blaming an invented cyberattack misled an authority, your insurer and your own staff. The storm passed; the loss of trust did not.",
          "Att skylla på ett påhittat cyberangrepp vilseledde en myndighet, ert försäkringsbolag och er egen personal. Stormen gick över; förtroendeförlusten gjorde det inte."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Crisis leadership needs a channel that works without power or mobile networks.", "Krisledning behöver en kanal som fungerar utan ström och mobilnät."]),
        L(["Account for every person on shift before anything else.", "Redovisa varje person i tjänst före allt annat."]),
        L(["Controlled shutdowns make restarts easier than crashes.", "Kontrollerade nedstängningar gör omstarter enklare än krascher."]),
        L(["Scammers follow every crisis: warn staff in the first message.", "Bedragare följer varje kris: varna personalen i det första meddelandet."])
      ],
      strengthsToLookFor: [
        L(["Using a pre-agreed fallback to gather the team", "Att använda en förutbestämd reservlösning för att samla gruppen"]),
        L(["Keeping the night shift safe on site", "Att hålla nattskiftet säkert på plats"]),
        L(["Warning staff about storm scams early", "Att tidigt varna personalen för stormbedrägerier"])
      ],
      commonGaps: [
        L(["Plans that assume phones work", "Planer som förutsätter att telefonerna fungerar"]),
        L(["Running systems until they crash", "Att köra system tills de kraschar"]),
        L(["Ignoring scams while busy", "Att ignorera bedrägerier när man har mycket att göra"])
      ],
      suggestedActions: [
        act(["Set up an offline crisis kit: meeting points, satellite phone, printed contacts.", "Ta fram en krislåda som fungerar utan nät: mötesplatser, satellittelefon, utskrivna kontakter."], "incidentCommander", "high"),
        act(["Write a controlled shutdown and restart order for the data room.", "Skriv en ordning för kontrollerad nedstängning och omstart av datarummet."], "itOps", "medium"),
        act(["Add scam warnings to crisis communication templates.", "Lägg till varningar för bedrägerier i mallarna för kriskommunikation."], "comms", "medium")
      ]
    }
  });
})();
