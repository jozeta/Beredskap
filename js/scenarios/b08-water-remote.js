/*
 * b08-water-remote.js — "Pressure in the Pipes" (branching, water utility / OT).
 *
 * At night an operator watches the mouse move on the treatment plant's control
 * workstation: someone is changing a dosing setpoint through an old remote
 * desktop tool. Safety first, then everything else. Spine: the night alarm →
 * water quality → manual operation → reporting → the public → the second
 * night → budget → restoring automation → the sector → remote access policy.
 * Alternative: a precautionary do-not-drink advisory. Break-away at the second
 * night: publicly naming a foreign state.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b08-water-remote",
    version: 1,
    format: "branching",
    category: "water-utility",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "water",
    title: L(["Pressure in the Pipes", "Tryck i ledningarna"]),
    summary: L([
      "Night shift at the water treatment plant. The mouse on the control screen moves by itself, and a chemical dosing value climbs.",
      "Nattskift på vattenverket. Muspekaren på styrskärmen rör sig av sig själv, och ett doseringsvärde för kemikalier stiger."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Put physical safety first in an OT incident", "Sätta den fysiska säkerheten först vid en OT-incident"]) },
      { id: "lo2", text: L(["Run critical processes manually while systems are untrusted", "Driva kritiska processer manuellt medan systemen inte är betrodda"]) },
      { id: "lo3", text: L(["Report to authorities and the sector", "Rapportera till myndigheter och sektorn"]) },
      { id: "lo4", text: L(["Talk to the public about water safety honestly", "Tala ärligt med allmänheten om vattensäkerhet"]) }
    ],
    mitre: ["T0822", "T0883", "T0836", "T0813", "T1219"],
    frameworks: {
      nistCsf: ["ID.AM", "PR.AA", "PR.IR", "DE.CM", "RS.MA", "RS.CO", "RC.RP"],
      iso27001: ["A.5.5", "A.5.24", "A.5.26", "A.5.29", "A.8.20", "A.8.22", "A.5.19"]
    },
    constraints: { startWindow: "night", sectors: ["utilities"] },
    actor: { types: ["unknown"], motivation: L(["Unknown: opportunistic access to an exposed remote tool", "Okänt: opportunistisk åtkomst till ett exponerat fjärrverktyg"]), capability: "low" },
    variables: {
      residents: { min: 8000, max: 250000, scaleBy: "size", step: 1000 },
      reserveHours: { min: 18, max: 60 },
      utilities: { min: 3, max: 12 }
    },
    roles: ["incidentCommander", "otEngineer", "itOps", "ciso", "ceo", "comms", "dutyOfficer", "legal", "serviceOwner"],

    flags: {
      manualOps: L(["Plant run manually", "Verket kört manuellt"]),
      watched: L(["Watched the intruder before cutting access", "Bevakade inkräktaren innan åtkomsten kapades"]),
      healthAlerted: L(["Health authority alerted early", "Hälsomyndigheten larmad tidigt"]),
      toolsRemoved: L(["Remote tools removed", "Fjärrverktyg borttagna"]),
      restoredEarly: L(["Automation restored early", "Automatiken återställd tidigt"]),
      reported: L(["Reported to the CSIRT and supervisor", "Rapporterat till CSIRT och tillsyn"]),
      publicTold: L(["Public told what happened", "Allmänheten informerad om vad som hänt"]),
      coverStory: L(["Called it routine maintenance", "Kallade det rutinunderhåll"])
    },

    start: "c1",
    pages: [
      pg("c1", ["The mouse moves", "Muspekaren rör sig"], [
        "{{time.T+0|clock}}. The night operator calls {{person.otEngineer.name}}: on the control workstation the pointer is moving by itself, and the dosing setpoint for one reservoir has been raised.",
        "Klockan {{time.T+0|clock}}. Nattoperatören ringer {{person.otEngineer.name}}: på styrdatorn rör sig pekaren av sig själv, och börvärdet för doseringen i en reservoar har höjts."
      ], {
        injects: [
          inj("b8-1", 0, "phoneTranscript", "facilities", "critical", "confirmed", [
            "“I'm watching it now. It opened the dosing screen and typed a new value. I put it back, and it changed it again. What do I do?”",
            "”Jag ser det just nu. Den öppnade doseringsbilden och skrev in ett nytt värde. Jag ändrade tillbaka, och den ändrade igen. Vad ska jag göra?”"
          ], { tests: ["lo1"] })
        ],
        discuss: [q("What protects the water if the screen can't be trusted?", "Vad skyddar vattnet om skärmen inte går att lita på?", ["otEngineer"])],
        facilitator: { notes: L(["Safety first: the right answer protects the water before it protects evidence.", "Säkerheten först: rätt svar skyddar vattnet innan det skyddar bevisen."]) },
        choice: ask(["What does the operator do right now?", "Vad gör operatören just nu?"], ["Cuts the remote connection and takes the process to manual control, then verifies the water.", "Kapar fjärranslutningen och tar processen till manuell styrning, och kontrollerar sedan vattnet."], [
          opt(["Unplug the workstation's network and dose by hand", "Dra ur nätverkskabeln och dosera manuellt"], "c2", ["Safe and immediate. Loses the live view of the intruder.", "Säkert och omedelbart. Förlorar direktbilden av inkräktaren."], { set: "manualOps" }),
          opt(["Watch what they do, and correct values as they go", "Se vad de gör och rätta värdena efter hand"], "c2", ["Learns more. Gambles with the dosing.", "Lär er mer. Spelar med doseringen."], { set: "watched" }),
          opt(["Call the vendor who uses the remote tool", "Ring leverantören som använder fjärrverktyget"], "c2", ["Maybe it's them. At 03:00, probably not.", "Kanske är det de. Klockan tre på natten, troligen inte."])
        ])
      }),

      pg("c2", ["The water", "Vattnet"], [
        "Samples from the reservoir show chemical levels above normal but within the safety limit. Water from it reaches {{num.residents|number}} residents from 06:00.",
        "Prover från reservoaren visar kemikalienivåer över det normala men inom säkerhetsgränsen. Vattnet därifrån når {{num.residents|number}} invånare från klockan 06.00."
      ], {
        chart: { id: "b8-water", type: "kpi", title: L(["The reservoir", "Reservoaren"]), data: kpi([
          { id: "k1", label: ["Residents served", "Invånare som försörjs"], value: (v) => v.residents, tone: "info" },
          { id: "k2", label: ["Hours of reserve", "Timmar i reserv"], value: (v) => v.reserveHours, tone: "warn" }
        ]) },
        discuss: [q("Who outside the utility needs to know before 06:00?", "Vem utanför verket behöver veta före klockan sex?", ["dutyOfficer", "ceo"])],
        choice: ask(["What do you do about the water?", "Vad gör ni med vattnet?"], ["Protects the public with sampling and the health authority, proportionate to the measured risk.", "Skyddar allmänheten med provtagning och hälsomyndigheten, i proportion till den uppmätta risken."], [
          opt(["Sample hourly and alert the health authority", "Ta prover varje timme och larma hälsomyndigheten"], "l1", ["Proportionate and documented.", "Proportionerligt och dokumenterat."], { set: "healthAlerted" }),
          opt(["No action: it is within limits", "Ingen åtgärd: det är inom gränserna"], "l1", ["Technically true, and someone was changing it.", "Tekniskt sant, och någon höll på att ändra det."]),
          opt(["Issue a precautionary do-not-drink advisory", "Utfärda en försiktighetsvarning om att inte dricka vattnet"], "c3b", ["Protects health. Alarms {{num.residents|number}} people.", "Skyddar hälsan. Oroar {{num.residents|number}} personer."])
        ])
      }),

      pg("l1", ["The tool", "Verktyget"], [
        "The remote desktop tool was installed three years ago by a contractor who has since left. Shared password, no second factor, reachable from the internet.",
        "Fjärrskrivbordsverktyget installerades för tre år sedan av en konsult som sedan har slutat. Delat lösenord, ingen andra faktor, nåbart från internet."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you do about remote access?", "Vad gör ni med fjärråtkomsten?"], ["Removes direct remote tools and routes vendor access through a controlled path.", "Tar bort direkta fjärrverktyg och leder leverantörsåtkomst via en kontrollerad väg."], [
          opt(["Remove every remote tool from the control network", "Ta bort alla fjärrverktyg från styrnätet"], "c3", ["Vendors will complain. The door is closed.", "Leverantörerna kommer att klaga. Dörren är stängd."], { set: "toolsRemoved" }),
          opt(["Change the password", "Byt lösenordet"], "c3", ["Same door, new key, same lack of a lock.", "Samma dörr, ny nyckel, samma brist på lås."])
        ])
      }),

      pg("c3", ["Manual operation", "Manuell drift"], [
        "The plant can run manually, but that needs two operators around the clock. You have four.",
        "Verket kan köras manuellt, men det kräver två operatörer dygnet runt. Ni har fyra."
      ], {
        choice: ask(["How do you run the plant?", "Hur driver ni verket?"], ["Runs manually until the control system is known to be clean, and gets help for staffing.", "Kör manuellt tills styrsystemet är känt rent, och tar hjälp med bemanningen."], [
          opt(["Manual operation until the network is cleaned", "Manuell drift tills nätverket är sanerat"], "c4", ["Exhausting and safe.", "Utmattande och säkert."], { set: "manualOps" }),
          opt(["Restore automation after a quick scan", "Återställ automatiken efter en snabb genomsökning"], "c4", ["A scan is not a clean bill of health.", "En genomsökning är inget friskintyg."], { set: "restoredEarly" }),
          opt(["Ask a neighbouring utility for operators", "Be ett grannverk om operatörer"], "c4", ["Mutual aid works if you have agreed it before.", "Ömsesidigt stöd fungerar om ni har kommit överens om det i förväg."], { set: "manualOps" })
        ])
      }),

      pg("c3b", ["Do not drink", "Drick inte vattnet"], [
        "The advisory goes out at 05:30. Shops run out of bottled water, and the hospital asks for an exemption.",
        "Varningen går ut klockan 05.30. Butikerna får slut på flaskvatten och sjukhuset ber om undantag."
      ], {
        choice: ask(["How long does the advisory last?", "Hur länge gäller varningen?"], ["Keeps it until sampling confirms safety, and supplies the vulnerable.", "Behåller den tills proverna bekräftar att vattnet är säkert, och försörjer de mest utsatta."], [
          opt(["Until samples confirm safety; water tanks for the hospital and care homes", "Tills proverna bekräftar säkerheten; vattentankar till sjukhuset och äldreboenden"], "c4", ["Responsible and costly.", "Ansvarsfullt och dyrt."], { set: ["healthAlerted", "manualOps"] }),
          opt(["Lift it by noon to calm things", "Häv den till lunch för att lugna läget"], "c4", ["Without data, lifting it is a guess.", "Utan data är det en gissning att häva den."])
        ])
      }),

      pg("c4", ["Who do you tell?", "Vem informerar ni?"], [
        "{{person.legal.name}}: as a provider of drinking water you have reporting duties under {{reg.nis2}}.",
        "{{person.legal.name}}: som dricksvattenleverantör har ni rapporteringsskyldighet enligt {{reg.nis2}}."
      ], {
        variants: [vr("watched", [
          "While you watched, the intruder changed a second setpoint before the operator caught it. {{person.legal.name}}: you have reporting duties under {{reg.nis2}}.",
          "Medan ni bevakade ändrade inkräktaren ett andra börvärde innan operatören upptäckte det. {{person.legal.name}}: ni har rapporteringsskyldighet enligt {{reg.nis2}}."
        ], ["Because you watched first, there was a second change.", "Eftersom ni bevakade först blev det en andra ändring."])],
        choice: ask(["Do you report now?", "Rapporterar ni nu?"], ["Reports early to the CSIRT and supervisor, without waiting for certainty.", "Rapporterar tidigt till CSIRT och tillsyn, utan att vänta på visshet."], [
          opt(["Report to {{reg.csirt}} and the supervisor today", "Rapportera till {{reg.csirt}} och tillsynen i dag"], "l2", ["Early warning is what the duty is for.", "Tidig varning är vad skyldigheten finns till för."], { set: "reported" }),
          opt(["Wait until you know it was an attack", "Vänta tills ni vet att det var ett angrepp"], "l2", ["Someone moved your mouse.", "Någon flyttade er muspekare."])
        ])
      }),

      pg("l2", ["The police", "Polisen"], [
        "{{person.ciso.name}} asks whether to report the intrusion to {{reg.police}}.",
        "{{person.ciso.name}} frågar om intrånget ska polisanmälas till {{reg.police}}."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["Do you report it?", "Polisanmäler ni?"], ["Reports and preserves evidence; interfering with drinking water is serious.", "Polisanmäler och bevarar bevis; att påverka dricksvatten är allvarligt."], [
          opt(["Report and image the workstation first", "Polisanmäl och ta en avbildning av datorn först"], "c5", ["Evidence for whoever investigates.", "Bevis för den som utreder."]),
          opt(["Skip it; nothing was damaged", "Hoppa över det; inget skadades"], "c5", ["Nothing yet.", "Inget ännu."])
        ])
      }),

      pg("c5", ["A resident asks", "En invånare frågar"], [
        "A resident posts that the treatment plant had “lots of cars at night”. A local reporter asks what happened.",
        "En invånare skriver att vattenverket hade ”massor av bilar i natt”. En lokalreporter frågar vad som hänt."
      ], {
        variants: [vr("healthAlerted", [
          "A local reporter asks about the night at the plant. Because the health authority was involved early, you can quote their sampling: the water is safe.",
          "En lokalreporter frågar om natten vid vattenverket. Eftersom hälsomyndigheten var involverad tidigt kan ni hänvisa till deras provtagning: vattnet är säkert."
        ], ["Because the health authority was alerted early, you have an independent voice on safety.", "Eftersom hälsomyndigheten larmades tidigt har ni en oberoende röst om säkerheten."])],
        discuss: [q("How do you say “someone accessed our control system” without causing panic?", "Hur säger man ”någon kom åt vårt styrsystem” utan att skapa panik?", ["comms", "ceo"])],
        choice: ask(["What do you say?", "Vad säger ni?"], ["Explains what happened, that the water is safe and how you know.", "Förklarar vad som hänt, att vattnet är säkert och hur ni vet det."], [
          opt(["What happened, why the water is safe, how you know", "Vad som hände, varför vattnet är säkert, hur ni vet det"], "l3", ["Honest and calming when backed by data.", "Ärligt och lugnande när det backas upp av data."], { set: "publicTold" }),
          opt(["“Routine maintenance”", "”Rutinunderhåll”"], "l3", ["Plausible until it isn't.", "Rimligt tills det inte är det."], { set: "coverStory" }),
          opt(["No comment", "Ingen kommentar"], "l3", ["Fills the space with speculation.", "Fyller tomrummet med spekulationer."])
        ])
      }),

      pg("l3", ["Other utilities", "Andra verk"], [
        "The same contractor serviced {{num.utilities}} other utilities in the region.",
        "Samma konsult har haft uppdrag hos {{num.utilities}} andra verk i regionen."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["Do you warn them?", "Varnar ni dem?"], ["Shares indicators through the CSIRT and sector channels.", "Delar indikatorer via CSIRT och sektorns kanaler."], [
          opt(["Share the details through the CSIRT and sector forum", "Dela detaljerna via CSIRT och sektorsforumet"], "c6", ["Protects neighbours; costs you some pride.", "Skyddar grannarna; kostar er lite stolthet."]),
          opt(["Keep it quiet", "Håll det tyst"], "c6", ["Their mice may be moving too.", "Deras muspekare kanske också rör sig."])
        ])
      }),

      pg("c6", ["The second night", "Den andra natten"], [
        "{{time.T+1440|clock}} the next night. An alarm: someone is trying the old remote access path again.",
        "Klockan {{time.T+1440|clock}} natten därpå. Ett larm: någon försöker använda den gamla fjärråtkomstvägen igen."
      ], {
        variants: [vr("toolsRemoved", [
          "The next night, an alarm: someone tries the old remote access path again. Because the tools were removed, the attempt finds nothing to connect to.",
          "Natten därpå, ett larm: någon försöker använda den gamla fjärråtkomstvägen igen. Eftersom verktygen togs bort finns inget att ansluta till."
        ], ["Because remote tools were removed, the door is closed.", "Eftersom fjärrverktygen togs bort är dörren stängd."])],
        choice: ask(["What do you do tonight?", "Vad gör ni i natt?"], ["Separates control systems from the rest until they are known clean.", "Skiljer styrsystemen från resten tills de är kända rena."], [
          opt(["Separate the control network from IT completely for now", "Skilj styrnätet helt från IT tills vidare"], "c7", ["Manual workarounds for reporting; safe control.", "Manuella lösningar för rapportering; säker styrning."]),
          opt(["Monitor and react", "Bevaka och reagera"], "c7", ["Reaction depends on someone watching at 03:00.", "Reaktionen hänger på att någon tittar klockan tre."]),
          opt(["Stop treatment; run on the reservoirs", "Stoppa beredningen; kör på reservoarerna"], "c7b", ["{{num.reserveHours}} hours of reserve.", "{{num.reserveHours}} timmars reserv."]),
          opt(["Tell the press a foreign state is attacking the water", "Säg till pressen att en främmande stat angriper vattnet"], "x1", ["Do you know that?", "Vet ni det?"])
        ])
      }),

      pg("c7b", ["Running on reserve", "Drift på reserven"], [
        "Treatment is stopped. The reservoirs last {{num.reserveHours}} hours.",
        "Beredningen är stoppad. Reservoarerna räcker i {{num.reserveHours}} timmar."
      ], {
        choice: ask(["How do you restart?", "Hur startar ni igen?"], ["Restarts under manual control before the reserve runs low.", "Startar igen under manuell styrning innan reserven tar slut."], [
          opt(["Restart under manual control", "Starta igen under manuell styrning"], "c7", ["Safe and staff-heavy.", "Säkert och personalkrävande."], { set: "manualOps" }),
          opt(["Ask the neighbouring utility to supply through the interconnection", "Be grannverket leverera via sammankopplingen"], "c7", ["Buys time if the pipes allow it.", "Ger tid om ledningarna tillåter det."])
        ])
      }),

      pg("c7", ["The budget", "Budgeten"], [
        "The board asks what it will cost to fix, and whether it means higher water rates.",
        "Styrelsen frågar vad det kostar att åtgärda, och om det innebär högre vattenavgifter."
      ], {
        variants: [vr("coverStory", [
          "A plant worker tells the local paper it was not maintenance. Now the board asks what it will cost to fix, and why the public was told otherwise.",
          "En anställd berättar för lokaltidningen att det inte var underhåll. Nu frågar styrelsen vad det kostar att åtgärda, och varför allmänheten fick en annan förklaring."
        ], ["Because you called it maintenance, the real story came out through someone else.", "Eftersom ni kallade det underhåll kom den verkliga historien ut via någon annan."])],
        choice: ask(["What do you ask the board for?", "Vad begär ni av styrelsen?"], ["Asks for the basics: asset inventory, segmentation, controlled remote access.", "Begär grunderna: tillgångsinventering, segmentering, kontrollerad fjärråtkomst."], [
          opt(["Fund OT security basics this year", "Finansiera grundläggande OT-säkerhet i år"], "l4", ["Cheaper than the next night.", "Billigare än nästa natt."]),
          opt(["Postpone to next year's budget", "Skjut upp till nästa års budget"], "l4", ["The attacker's budget is this year's.", "Angriparens budget är årets."])
        ])
      }),

      pg("l4", ["Practice", "Övning"], [
        "The operators managed manual operation, but only because two of them remembered how.",
        "Operatörerna klarade den manuella driften, men bara för att två av dem kom ihåg hur."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["Do you train for it?", "Övar ni på det?"], ["Makes manual operation a practised routine, not a memory.", "Gör manuell drift till en inövad rutin, inte ett minne."], [
          opt(["Manual-operation exercises twice a year", "Övningar i manuell drift två gånger om året"], "c8", ["Cheap insurance.", "Billig försäkring."]),
          opt(["Not needed; it worked", "Behövs inte; det fungerade"], "c8", ["It worked this time.", "Det fungerade den här gången."])
        ])
      }),

      pg("c8", ["Restoring automation", "Återställa automatiken"], [
        "After a week of manual operation, everyone wants automation back.",
        "Efter en vecka med manuell drift vill alla ha tillbaka automatiken."
      ], {
        variants: [vr("restoredEarly", [
          "Because automation was restored early, the investigators find the intruder's tool still installed on a second workstation that has been running all week.",
          "Eftersom automatiken återställdes tidigt hittar utredarna inkräktarens verktyg kvar på en andra dator som har varit igång hela veckan."
        ], ["Because automation came back after only a quick scan, the intruder had a second way in all week.", "Eftersom automatiken kom tillbaka efter bara en snabb genomsökning hade inkräktaren en andra väg in hela veckan."])],
        choice: ask(["When does it come back?", "När kommer den tillbaka?"], ["Restores from rebuilt, verified systems.", "Återställer från ombyggda, verifierade system."], [
          opt(["After rebuilding the workstations from verified media", "Efter att datorerna byggts om från verifierade medier"], "c9", ["Slower, clean.", "Långsammare, rent."]),
          opt(["Now, as it is", "Nu, som det är"], "c9", ["Hope as a control.", "Hopp som kontroll."])
        ])
      }),

      pg("c9", ["The sector", "Sektorn"], [
        "The national water association invites you to speak about the incident.",
        "Den nationella branschorganisationen för vatten bjuder in er att tala om incidenten."
      ], {
        choice: ask(["Do you speak?", "Talar ni?"], ["Shares lessons so others fix the same weakness.", "Delar lärdomarna så att andra kan åtgärda samma svaghet."], [
          opt(["Yes, openly", "Ja, öppet"], "c10", ["Helps the sector; builds trust.", "Hjälper sektorn; bygger förtroende."]),
          opt(["Decline", "Tacka nej"], "c10", ["Others learn it the hard way.", "Andra lär sig det den hårda vägen."])
        ])
      }),

      pg("c10", ["Remote access policy", "Policy för fjärråtkomst"], [
        "The last decision: the rule for remote access to control systems.",
        "Det sista beslutet: regeln för fjärråtkomst till styrsystem."
      ], {
        choice: ask(["What is the rule?", "Vad är regeln?"], ["No direct internet remote access to control systems; vendor access brokered and recorded.", "Ingen direkt fjärråtkomst från internet till styrsystem; leverantörsåtkomst förmedlad och loggad."], [
          opt(["Never directly from the internet; brokered, approved and recorded", "Aldrig direkt från internet; förmedlad, godkänd och loggad"], "r-end", ["Clear and enforceable.", "Tydlig och möjlig att följa upp."]),
          opt(["Case by case", "Från fall till fall"], "r-end", ["Every case becomes an exception.", "Varje fall blir ett undantag."])
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["manualOps", "reported", "publicTold"], "e1"],
          [["manualOps", "reported"], "e2"],
          ["reported", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Contained", "Begränsad"], ["Ending", "Slut"], {
        ending: end(1, ["Safe water, told straight", "Säkert vatten, rakt berättat"], [
          "The plant went to manual control within minutes, the authorities heard it the same day and the public heard the truth. Trust in the water held.",
          "Verket gick över till manuell styrning inom några minuter, myndigheterna fick veta det samma dag och allmänheten fick höra sanningen. Förtroendet för vattnet höll."
        ])
      }),
      pg("e2", ["Managed", "Hanterad"], ["Ending", "Slut"], {
        ending: end(2, ["Safe, but not said", "Säkert, men inte sagt"], [
          "The water stayed safe and the authorities were informed, but the public got a vague answer. The story leaks later and costs more trust than the truth would have.",
          "Vattnet förblev säkert och myndigheterna informerades, men allmänheten fick ett vagt svar. Historien läcker senare och kostar mer förtroende än sanningen hade gjort."
        ])
      }),
      pg("e3", ["Damaging", "Skadlig"], ["Ending", "Slut"], {
        ending: end(3, ["Reported, but automated too soon", "Rapporterat, men automatiserat för tidigt"], [
          "You reported the intrusion, but went back to automation before the systems were clean. A second intrusion is found weeks later.",
          "Ni rapporterade intrånget, men gick tillbaka till automatisk drift innan systemen var rena. Ett andra intrång upptäcks veckor senare."
        ])
      }),
      pg("e4", ["Severe", "Allvarlig"], ["Ending", "Slut"], {
        ending: end(4, ["Unreported", "Inte rapporterat"], [
          "The intrusion was never reported. When a neighbouring utility is hit the same way, the supervisor asks why you warned no one.",
          "Intrånget rapporterades aldrig. När ett grannverk drabbas på samma sätt frågar tillsynen varför ni inte varnade någon."
        ])
      }),

      // Break-away: naming a state.
      pg("x1", ["A foreign state", "En främmande stat"], [
        "The headline runs: “Foreign state attacks the water supply.” {{reg.csirt}} says it has seen no evidence of that.",
        "Rubriken lyder: ”Främmande stat angriper vattenförsörjningen.” {{reg.csirt}} säger att de inte sett några belägg för det."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Corrects the attribution quickly.", "Rättar tillskrivningen snabbt."], [
          opt(["Correct it: the attacker is unknown", "Rätta det: angriparen är okänd"], "x2", ["Right, and the headline stays.", "Rätt, och rubriken står kvar."]),
          opt(["Stand by it", "Stå fast vid det"], "x2", ["Now you must prove it.", "Nu måste ni bevisa det."])
        ])
      }),
      pg("x2", ["Fear", "Rädsla"], [
        "Residents stop drinking tap water. Bottled water sells out across the region.",
        "Invånarna slutar dricka kranvatten. Flaskvattnet tar slut i hela regionen."
      ], {
        choice: ask(["How do you restore trust in the water?", "Hur återställer ni förtroendet för vattnet?"], ["Publishes independent sample results daily.", "Publicerar oberoende provresultat varje dag."], [
          opt(["Daily independent sample results, published", "Dagliga oberoende provresultat, publicerade"], "x3", ["Slowly rebuilds trust.", "Bygger långsamt upp förtroendet."]),
          opt(["Reassuring statements", "Lugnande uttalanden"], "x3", ["Not after the headline.", "Inte efter rubriken."])
        ])
      }),
      pg("x3", ["Attention", "Uppmärksamhet"], [
        "Hacktivists, inspired by the coverage, start scanning every water utility in the country.",
        "Hacktivister, inspirerade av bevakningen, börjar skanna varje vattenverk i landet."
      ], {
        choice: ask(["What do you do?", "Vad gör ni?"], ["Works with the CSIRT to warn the sector.", "Arbetar med CSIRT för att varna sektorn."], [
          opt(["Work with {{reg.csirt}} to warn every utility", "Arbeta med {{reg.csirt}} för att varna alla verk"], "x4", ["Late, but useful.", "Sent, men användbart."]),
          opt(["Focus on your own plant", "Fokusera på ert eget verk"], "x4", ["Understandable.", "Begripligt."])
        ])
      }),
      pg("x4", ["The ministry", "Departementet"], [
        "The ministry asks for a briefing on the attribution and the evidence behind it.",
        "Departementet begär en dragning om tillskrivningen och beläggen för den."
      ], {
        choice: ask(["What do you brief?", "Vad redovisar ni?"], ["Gives the facts, including what you do not know.", "Ger fakta, inklusive det ni inte vet."], [
          opt(["The facts, and what you got wrong", "Fakta, och det ni gjorde fel"], "e5", ["Honest, and the damage is done.", "Ärligt, och skadan är skedd."]),
          opt(["A defence of the statement", "Ett försvar för uttalandet"], "e5", ["There is no evidence to defend.", "Det finns inga belägg att försvara."])
        ])
      }),
      pg("e5", ["Disaster", "Katastrof"], ["Ending", "Slut"], {
        ending: end(5, ["The headline poisoned the water", "Rubriken förgiftade vattnet"], [
          "The water was safe, but naming a foreign state without evidence made people stop drinking it and drew attackers to every utility in the country.",
          "Vattnet var säkert, men att utan belägg peka ut en främmande stat fick folk att sluta dricka det och lockade angripare till varje vattenverk i landet."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["In OT incidents, physical safety comes before evidence and before uptime.", "Vid OT-incidenter går den fysiska säkerheten före bevis och före drifttid."]),
        L(["Manual operation is a capability: staff it, practise it.", "Manuell drift är en förmåga: bemanna den, öva den."]),
        L(["Direct remote access to control systems from the internet must not exist.", "Direkt fjärråtkomst till styrsystem från internet får inte finnas."]),
        L(["Attribution without evidence harms more than it helps.", "Tillskrivning utan belägg skadar mer än den hjälper."])
      ],
      strengthsToLookFor: [
        L(["Going to manual control immediately", "Att direkt gå över till manuell styrning"]),
        L(["Involving the health authority early", "Att tidigt involvera hälsomyndigheten"]),
        L(["Reporting and sharing with the sector", "Att rapportera och dela med sektorn"])
      ],
      commonGaps: [
        L(["Watching instead of disconnecting", "Att bevaka i stället för att koppla bort"]),
        L(["Restoring automation after a quick scan", "Att återställa automatiken efter en snabb genomsökning"]),
        L(["“Routine maintenance” as a cover story", "”Rutinunderhåll” som täckhistoria"])
      ],
      suggestedActions: [
        act(["Remove every direct remote access tool from control networks.", "Ta bort alla direkta fjärråtkomstverktyg från styrnät."], "otEngineer", "high"),
        act(["Agree mutual aid for operators with neighbouring utilities.", "Avtala om ömsesidigt stöd med operatörer från grannverk."], "serviceOwner", "medium"),
        act(["Exercise manual operation twice a year.", "Öva manuell drift två gånger om året."], "otEngineer", "medium")
      ]
    }
  });
})();
