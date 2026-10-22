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
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The storm hits. Head office and two sites lose power; mobile calls drop after a few seconds. The data room's batteries last 45 minutes.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Stormen slår till. Huvudkontoret och två anläggningar blir strömlösa; mobilsamtal bryts efter några sekunder. Datarummets batterier räcker i 45 minuter."
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
        "{{num.onShift}} people are on shift at the depot. Roads are closing because of fallen trees.",
        "{{num.onShift}} personer är i tjänst vid depån. Vägar stängs på grund av nedfallna träd."
      ], {
        variants: [vr("waited", [
          "By morning you learn that one of the {{num.onShift}} on the night shift drove home through a closed road and hit a fallen tree. They are injured but alive.",
          "På morgonen får ni veta att en av de {{num.onShift}} på nattskiftet körde hem på en avstängd väg och krockade med ett nedfallet träd. Hen är skadad men vid liv."
        ], ["Because nobody led the night, people made their own decisions.", "Eftersom ingen ledde under natten fattade folk egna beslut."])],
        discuss: [q("How do you know everyone is safe if you can't call them?", "Hur vet ni att alla är i säkerhet om ni inte kan ringa dem?", ["hr", "facilities"])],
        choice: ask(["What about the people on shift?", "Vad gäller för dem som är i tjänst?"], ["Accounts for everyone and keeps them safe where they are.", "Redovisar alla och håller dem säkra där de är."], [
          opt(["Account for everyone; keep them safe on site until roads open", "Redovisa alla; håll dem säkra på plats tills vägarna öppnar"], "l1", ["Food, heat and a list of names.", "Mat, värme och en lista med namn."], { set: "staffSafe" }),
          opt(["Send them home", "Skicka hem dem"], "l1", ["On closed roads, in the dark.", "På avstängda vägar, i mörker."]),
          opt(["Leave it to the site managers", "Låt platschefer avgöra"], "l1", ["Sensible delegation without a check that it happened.", "Förnuftig delegering utan kontroll av att det skedde."])
        ])
      }),

      pg("l1", ["Fuel", "Bränsle"], [
        "The data room's generator starts. It has fuel for {{num.fuelHours}} hours, and the fuel supplier cannot reach you before the roads clear.",
        "Datarummets reservkraftverk startar. Det har bränsle för {{num.fuelHours}} timmar, och bränsleleverantören kan inte ta sig fram förrän vägarna är röjda."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["How do you use the fuel?", "Hur använder ni bränslet?"], ["Sheds non-critical load to stretch the fuel.", "Kopplar bort det som inte är kritiskt för att dryga ut bränslet."], [
          opt(["Shut down everything non-critical to stretch it", "Stäng ned allt som inte är kritiskt för att dryga ut det"], "c3", ["Choices about what matters, made calmly now.", "Beslut om vad som är viktigt, fattade i lugn och ro nu."], { set: "fuelStretched" }),
          opt(["Run everything", "Kör allt"], "c3", ["Until the tank is empty.", "Tills tanken är tom."])
        ])
      }),

      pg("c3", ["The data room", "Datarummet"], [
        "The question is whether to keep the data room running, and for how long.",
        "Frågan är om datarummet ska hållas igång, och hur länge."
      ], {
        variants: [vr("fuelStretched", [
          "Because non-critical systems were shut down, the generator will last about thirty hours instead of {{num.fuelHours}}. The question is how to use them.",
          "Eftersom det icke-kritiska stängdes ned räcker reservkraften i ungefär trettio timmar i stället för {{num.fuelHours}}. Frågan är hur de ska användas."
        ], ["Because you stretched the fuel, you have time to choose.", "Eftersom ni drygade ut bränslet har ni tid att välja."])],
        choice: ask(["What do you do with the data room?", "Vad gör ni med datarummet?"], ["Shuts down in a controlled order rather than letting systems crash.", "Stänger ned i kontrollerad ordning i stället för att låta systemen krascha."], [
          opt(["A controlled shutdown before the fuel runs out", "En kontrollerad nedstängning innan bränslet tar slut"], "c4", ["Clean restart later.", "En ren omstart senare."]),
          opt(["Keep it running until the power dies", "Håll det igång tills strömmen dör"], "c4", ["Every hour of service, then a hard crash.", "Varje timme av drift, sedan en hård krasch."], { set: "hardCrash" }),
          opt(["Fail over to the secondary site", "Växla över till den sekundära anläggningen"], "c3b", ["Two hundred kilometres away, with power.", "Tvåhundra kilometer bort, med ström."])
        ])
      }),

      pg("c3b", ["The secondary site", "Den sekundära anläggningen"], [
        "The secondary site has power, but replication is {{num.replicationLag}} hours behind.",
        "Den sekundära anläggningen har ström, men replikeringen ligger {{num.replicationLag}} timmar efter."
      ], {
        choice: ask(["Do you run from there?", "Kör ni därifrån?"], ["Accepts known data loss deliberately, and records what must be re-entered.", "Accepterar en känd dataförlust medvetet, och dokumenterar vad som måste föras in igen."], [
          opt(["Yes, and list what must be re-entered", "Ja, och lista vad som måste föras in igen"], "c4", ["A deliberate trade.", "En medveten avvägning."]),
          opt(["No, wait for the primary", "Nej, vänta på den primära"], "c4", ["Back to the fuel question.", "Tillbaka till bränslefrågan."])
        ])
      }),

      pg("c4", ["Customers", "Kunderna"], [
        "Deliveries for tomorrow cannot leave. The customer portal is down and customers are calling numbers nobody can answer.",
        "Morgondagens leveranser kan inte gå iväg. Kundportalen ligger nere och kunderna ringer nummer som ingen kan svara på."
      ], {
        choice: ask(["How do you reach customers?", "Hur når ni kunderna?"], ["Uses whatever channel still works, with honest expectations.", "Använder den kanal som fortfarande fungerar, med ärliga förväntningar."], [
          opt(["A status page hosted elsewhere and messages where possible", "En statussida som ligger någon annanstans och meddelanden där det går"], "l2", ["Some reach, honest expectations.", "Viss räckvidd, ärliga förväntningar."]),
          opt(["Nothing until systems are back", "Ingenting tills systemen är tillbaka"], "l2", ["Customers fill the silence themselves.", "Kunderna fyller tystnaden själva."])
        ])
      }),

      pg("l2", ["The municipality", "Kommunen"], [
        "The municipality's crisis meeting asks whether you can lend trucks and fuel for priority needs.",
        "Kommunens krisledning frågar om ni kan låna ut lastbilar och bränsle till prioriterade behov."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["Do you help?", "Hjälper ni till?"], ["Contributes what it can spare without risking its own safety.", "Bidrar med det som kan avvaras utan att riskera den egna säkerheten."], [
          opt(["Offer what you can spare", "Erbjud det ni kan avvara"], "c5", ["Good for the region; you remember who helped.", "Bra för regionen; man minns vem som hjälpte."]),
          opt(["Decline; you need it all", "Tacka nej; ni behöver allt"], "c5", ["Sometimes true.", "Ibland sant."])
        ])
      }),

      pg("c5", ["Storm scams", "Stormbedrägerier"], [
        "Staff receive emails: “Storm emergency payment for employees, enter your bank details” and “IT: reset your password after the outage”.",
        "Personalen får mejl: ”Krisersättning för anställda efter stormen, ange dina bankuppgifter” och ”IT: återställ ditt lösenord efter avbrottet”."
      ], {
        variants: [vr("fallbackComms", [
          "Scam emails reach staff: a “storm emergency payment” and an “IT password reset”. Because the crisis team has a known, verified channel, staff know where real instructions come from.",
          "Bluffmejl når personalen: en ”krisersättning efter stormen” och en ”lösenordsåterställning från IT”. Eftersom krisgruppen har en känd, verifierad kanal vet personalen var de riktiga instruktionerna kommer ifrån."
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
        "Staff on the landline get calls from “IT support” asking for the code from their authenticator to “restore access after the outage”.",
        "Personal på fast telefon får samtal från ”IT-supporten” som ber om koden från deras autentiseringsapp för att ”återställa åtkomsten efter avbrottet”."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["How do you stop it?", "Hur stoppar ni det?"], ["Announces that IT never asks for codes, and gives a call-back route.", "Meddelar att IT aldrig ber om koder, och anger en väg för återuppringning."], [
          opt(["Announce: IT never asks for codes; call back on a known number", "Meddela: IT ber aldrig om koder; ring tillbaka på ett känt nummer"], "c6", ["Clear rule, easy to follow.", "Tydlig regel, lätt att följa."], { set: "phishWarned" }),
          opt(["Investigate the calls first", "Utred samtalen först"], "c6", ["While codes are handed over.", "Medan koder lämnas ut."])
        ])
      }),

      pg("c6", ["Day two", "Dag två"], [
        "Power returns to head office. Everyone wants everything back now.",
        "Strömmen kommer tillbaka till huvudkontoret. Alla vill ha allt tillbaka nu."
      ], {
        variants: [vr("hardCrash", [
          "Power returns. Two servers did not come back after the hard crash, and the warehouse database reports corruption. Everyone wants everything back now.",
          "Strömmen kommer tillbaka. Två servrar startade inte efter den hårda kraschen, och lagerdatabasen rapporterar fel. Alla vill ha allt tillbaka nu."
        ], ["Because the data room ran until it crashed, the restart is harder.", "Eftersom datarummet gick tills det kraschade blir omstarten svårare."])],
        choice: ask(["How do you restart?", "Hur startar ni igen?"], ["Restarts in priority order with checks at each step.", "Startar i prioritetsordning med kontroller i varje steg."], [
          opt(["In priority order, checking each system", "I prioritetsordning, med kontroll av varje system"], "c7", ["Slower first hour, fewer surprises.", "Långsammare första timme, färre överraskningar."]),
          opt(["Everything at once", "Allt på en gång"], "c7", ["The fastest way to find what's broken.", "Det snabbaste sättet att hitta det som är trasigt."]),
          opt(["Wait until power is stable everywhere", "Vänta tills strömmen är stabil överallt"], "c7", ["Safe, slow.", "Säkert, långsamt."]),
          opt(["Tell the press a cyberattack caused the delays", "Säg till pressen att ett cyberangrepp orsakade förseningarna"], "x1", ["Sounds better than “we weren't ready”.", "Låter bättre än ”vi var inte förberedda”."])
        ])
      }),

      pg("c7", ["The costs", "Kostnaderna"], [
        "Spoiled goods, overtime, hired generators. The insurer asks for documentation.",
        "Förstörda varor, övertid, hyrda reservkraftverk. Försäkringsbolaget vill ha dokumentation."
      ], {
        choice: ask(["How do you handle the claim?", "Hur hanterar ni anspråket?"], ["Documents decisions and costs as they happen.", "Dokumenterar beslut och kostnader allteftersom."], [
          opt(["Assemble the crisis log and receipts now", "Sammanställ krisloggen och kvittona nu"], "l4", ["Memory fades by the week.", "Minnet bleknar för varje vecka."]),
          opt(["Estimate later", "Uppskatta senare"], "l4", ["Estimates get cut.", "Uppskattningar skärs ned."])
        ])
      }),

      pg("l4", ["The suppliers", "Leverantörerna"], [
        "The telecom provider's service level promised four hours; it took thirty.",
        "Teleoperatörens servicenivå lovade fyra timmar; det tog trettio."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you do with that?", "Vad gör ni med det?"], ["Plans for suppliers failing in a regional event, not only for compensation.", "Planerar för att leverantörer fallerar vid en regional händelse, inte bara för ersättning."], [
          opt(["Plan for diverse connections and a satellite backup", "Planera för olika förbindelser och satellitreserv"], "c8", ["Assumes the region fails together.", "Utgår från att regionen fallerar samtidigt."]),
          opt(["Claim the service credit", "Kräv servicekompensationen"], "c8", ["A small cheque.", "En liten check."])
        ])
      }),

      pg("c8", ["Back to normal", "Tillbaka till det normala"], [
        "A week later everything runs again.",
        "En vecka senare fungerar allt igen."
      ], {
        choice: ask(["What happens now?", "Vad händer nu?"], ["Holds an after-action review with the people who were there.", "Håller en genomgång efteråt med dem som var där."], [
          opt(["An after-action review with staff from every site", "En genomgång efteråt med personal från alla anläggningar"], "c9", ["Captures what really happened.", "Fångar vad som verkligen hände."]),
          opt(["Move on", "Gå vidare"], "c9", ["And repeat it next storm.", "Och upprepa det vid nästa storm."])
        ])
      }),

      pg("c9", ["The continuity plan", "Kontinuitetsplanen"], [
        "The continuity plan assumed phones would work.",
        "Kontinuitetsplanen förutsatte att telefonerna skulle fungera."
      ], {
        choice: ask(["What do you change?", "Vad ändrar ni?"], ["Tests the plan in a blackout exercise and adds offline fallbacks.", "Testar planen i en övning med strömavbrott och lägger till reservlösningar som fungerar utan nät."], [
          opt(["A yearly blackout exercise and an offline crisis kit", "En årlig övning med strömavbrott och en krislåda som fungerar utan nät"], "c10", ["Practice, not paper.", "Övning, inte papper."]),
          opt(["Update the document", "Uppdatera dokumentet"], "c10", ["Paper again.", "Papper igen."])
        ])
      }),

      pg("c10", ["The scam lesson", "Lärdomen om bedrägerierna"], [
        "The review shows that scams peaked when people were most tired and least able to check.",
        "Genomgången visar att bedrägerierna nådde sin topp när folk var som tröttast och minst kunde kontrollera."
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

      pg("e1", ["Contained", "Begränsad"], ["Ending", "Slut"], {
        ending: end(1, ["Ready for the dark", "Redo för mörkret"], [
          "The crisis team met within the hour, everyone on shift was safe, and staff knew a scam when they saw one. The storm cost money, nothing more.",
          "Krisgruppen samlades inom en timme, alla i tjänst var i säkerhet och personalen kände igen ett bedrägeri när de såg det. Stormen kostade pengar, inget mer."
        ])
      }),
      pg("e2", ["Managed", "Hanterad"], ["Ending", "Slut"], {
        ending: end(2, ["Safe, but slow to gather", "Säkert, men långsamt att samlas"], [
          "Staff were safe and scams were blocked, but it took hours to get the crisis team together. The review asks for a fallback that works without phones.",
          "Personalen var i säkerhet och bedrägerierna stoppades, men det tog timmar att samla krisgruppen. Genomgången efterfrågar en reservlösning som fungerar utan telefoner."
        ])
      }),
      pg("e3", ["Damaging", "Skadlig"], ["Ending", "Slut"], {
        ending: end(3, ["Safe, then scammed", "I säkerhet, sedan lurade"], [
          "Everyone was safe, but staff handed over bank details and authenticator codes to storm scammers. Accounts must be cleaned and salaries checked.",
          "Alla var i säkerhet, men personal lämnade ut bankuppgifter och koder till stormbedragare. Konton måste saneras och löner kontrolleras."
        ])
      }),
      pg("e4", ["Severe", "Allvarlig"], ["Ending", "Slut"], {
        ending: end(4, ["Nobody counted", "Ingen räknade"], [
          "Nobody accounted for the night shift, and someone was hurt on a closed road. The work environment authority opens an inquiry.",
          "Ingen redovisade nattskiftet, och någon skadades på en avstängd väg. Arbetsmiljömyndigheten inleder en utredning."
        ])
      }),

      // Break-away: "it was a cyberattack".
      pg("x1", ["A convenient attack", "Ett lägligt angrepp"], [
        "The evening news reports that {{org.name}} was hit by a cyberattack during the storm. {{reg.csirt}} calls and asks for details.",
        "Kvällsnyheterna rapporterar att {{org.name}} drabbades av ett cyberangrepp under stormen. {{reg.csirt}} ringer och frågar efter detaljer."
      ], {
        choice: ask(["What do you tell the CSIRT?", "Vad säger ni till CSIRT?"], ["Tells the authority the truth immediately.", "Berättar sanningen för myndigheten omedelbart."], [
          opt(["The truth: it was the storm", "Sanningen: det var stormen"], "x2", ["Now the press statement is the problem.", "Nu är pressuttalandet problemet."]),
          opt(["Vague answers", "Vaga svar"], "x2", ["An authority now spends time on a false lead.", "En myndighet lägger nu tid på ett falskt spår."])
        ])
      }),
      pg("x2", ["Staff talk", "Personalen pratar"], [
        "Staff who worked through the night tell the local paper there was no attack, only a storm and no plan.",
        "Personal som arbetade genom natten berättar för lokaltidningen att det inte var något angrepp, bara en storm och ingen plan."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Corrects the record publicly.", "Rättar uppgifterna offentligt."], [
          opt(["Correct it publicly", "Rätta det offentligt"], "x3", ["Necessary.", "Nödvändigt."]),
          opt(["Say nothing more", "Säg inget mer"], "x3", ["The paper prints both stories.", "Tidningen trycker båda versionerna."])
        ])
      }),
      pg("x3", ["The insurer", "Försäkringsbolaget"], [
        "Your insurer notes the cyberattack claim and asks whether you intend to claim under the cyber policy.",
        "Ert försäkringsbolag noterar påståendet om ett cyberangrepp och frågar om ni tänker göra anspråk på cyberförsäkringen."
      ], {
        choice: ask(["What do you answer?", "Vad svarar ni?"], ["Keeps insurance claims strictly factual.", "Håller försäkringsanspråken strikt sakliga."], [
          opt(["No: the loss was weather", "Nej: förlusten berodde på vädret"], "x4", ["Correct, and awkward.", "Korrekt, och pinsamt."]),
          opt(["Keep the option open", "Håll möjligheten öppen"], "x4", ["That road leads to fraud.", "Den vägen leder till bedrägeri."])
        ])
      }),
      pg("x4", ["Trust", "Förtroende"], [
        "Customers and staff now question every statement from management.",
        "Kunder och personal ifrågasätter nu varje uttalande från ledningen."
      ], {
        choice: ask(["How do you rebuild it?", "Hur bygger ni upp det igen?"], ["Admits the misstatement and shares the honest review.", "Erkänner det felaktiga uttalandet och delar den ärliga genomgången."], [
          opt(["Admit it and publish the honest review", "Erkänn det och publicera den ärliga genomgången"], "e5", ["The slow way back.", "Den långsamma vägen tillbaka."]),
          opt(["Wait for it to blow over", "Vänta tills det blåser över"], "e5", ["It doesn't.", "Det gör det inte."])
        ])
      }),
      pg("e5", ["Disaster", "Katastrof"], ["Ending", "Slut"], {
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
