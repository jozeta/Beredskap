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
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. One operator is on duty at the water treatment plant, as on every night. They call {{person.otEngineer.name}}, the plant's control-systems engineer, at home.\n\nOn the control workstation, the mouse pointer is moving by itself. It has opened the chemical dosing screen and raised the setpoint for one reservoir. The operator put the value back, and it was changed again.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. En operatör har jouren på vattenverket, som varje natt. Hen ringer {{person.otEngineer.name}}, verkets ingenjör för styrsystemen, i hemmet.\n\nPå styrdatorn rör sig muspekaren av sig själv. Den har öppnat skärmen för kemikaliedosering och höjt börvärdet för en av reservoarerna. Operatören ställde tillbaka värdet, och det ändrades igen."
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
        "Samples from the reservoir come back an hour later. The chemical level is above normal, but still within the safety limit.\n\nWater from that reservoir starts reaching {{num.residents|number}} residents from 06:00, when the morning demand begins. Nobody yet knows whether the intruder will try again, or how far they would push the dosing.",
        "Proverna från reservoaren kommer tillbaka en timme senare. Kemikalienivån är högre än normalt, men fortfarande inom säkerhetsgränsen.\n\nVattnet från den reservoaren börjar nå {{num.residents|number}} invånare från klockan sex, när morgonens förbrukning börjar. Ingen vet ännu om inkräktaren försöker igen, eller hur långt de skulle driva doseringen."
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
        "The way in is found quickly. A remote desktop tool was installed on the control workstation three years ago by a contractor, so they could help from home. The contractor has since left.\n\nThe tool uses a shared password, has no second factor, and can be reached from anywhere on the internet. Nobody remembered it was there.",
        "Vägen in hittas snabbt. Ett verktyg för fjärrskrivbord installerades på styrdatorn för tre år sedan av en konsult, så att hen kunde hjälpa till hemifrån. Konsulten har sedan dess slutat.\n\nVerktyget använder ett delat lösenord, saknar andra faktor och kan nås från var som helst på internet. Ingen kom ihåg att det fanns där."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you do about remote access?", "Vad gör ni med fjärråtkomsten?"], ["Removes direct remote tools and routes vendor access through a controlled path.", "Tar bort direkta fjärrverktyg och leder leverantörsåtkomst via en kontrollerad väg."], [
          opt(["Remove every remote tool from the control network", "Ta bort alla fjärrverktyg från styrnätet"], "c3", ["Vendors will complain. The door is closed.", "Leverantörerna kommer att klaga. Dörren är stängd."], { set: "toolsRemoved" }),
          opt(["Change the password", "Byt lösenordet"], "c3", ["Same door, new key, same lack of a lock.", "Samma dörr, ny nyckel, samma brist på lås."])
        ])
      }),

      pg("c3", ["Manual operation", "Manuell drift"], [
        "The plant can be run without the control network: operators walk the plant, read the gauges and adjust the pumps and dosing by hand.\n\nBut manual operation needs two operators on site around the clock. You have four trained operators in total, and one of them is on holiday.",
        "Verket kan köras utan styrnätet: operatörerna går runt i anläggningen, läser av mätarna och justerar pumpar och dosering för hand.\n\nMen manuell drift kräver två operatörer på plats dygnet runt. Ni har totalt fyra utbildade operatörer, och en av dem har semester."
      ], {
        choice: ask(["How do you run the plant?", "Hur driver ni verket?"], ["Runs manually until the control system is known to be clean, and gets help for staffing.", "Kör manuellt tills styrsystemet är känt rent, och tar hjälp med bemanningen."], [
          opt(["Manual operation until the network is cleaned", "Manuell drift tills nätverket är sanerat"], "c4", ["Exhausting and safe.", "Utmattande och säkert."], { set: "manualOps" }),
          opt(["Restore automation after a quick scan", "Återställ automatiken efter en snabb genomsökning"], "c4", ["A scan is not a clean bill of health.", "En genomsökning är inget friskintyg."], { set: "restoredEarly" }),
          opt(["Ask a neighbouring utility for operators", "Be ett grannverk om operatörer"], "c4", ["Mutual aid works if you have agreed it before.", "Ömsesidigt stöd fungerar om ni har kommit överens om det i förväg."], { set: "manualOps" })
        ])
      }),

      pg("c3b", ["Do not drink", "Drick inte vattnet"], [
        "The do-not-drink advisory goes out at 05:30, by text message, local radio and the municipality's website.\n\nBy eight, shops have run out of bottled water and the municipality's phone lines are jammed. The hospital calls: it needs water for patients and asks for an exemption, or for water tanks.",
        "Rådet att inte dricka vattnet går ut klockan 05.30, via sms, lokalradio och kommunens webbplats.\n\nKlockan åtta har butikerna slut på flaskvatten och kommunens telefonlinjer är överbelastade. Sjukhuset ringer: det behöver vatten till patienterna och ber om undantag, eller om vattentankar."
      ], {
        choice: ask(["How long does the advisory last?", "Hur länge gäller varningen?"], ["Keeps it until sampling confirms safety, and supplies the vulnerable.", "Behåller den tills proverna bekräftar att vattnet är säkert, och försörjer de mest utsatta."], [
          opt(["Until samples confirm safety; water tanks for the hospital and care homes", "Tills proverna bekräftar säkerheten; vattentankar till sjukhuset och äldreboenden"], "c4", ["Responsible and costly.", "Ansvarsfullt och dyrt."], { set: ["healthAlerted", "manualOps"] }),
          opt(["Lift it by noon to calm things", "Häv den till lunch för att lugna läget"], "c4", ["Without data, lifting it is a guess.", "Utan data är det en gissning att häva den."])
        ])
      }),

      pg("c4", ["Who do you tell?", "Vem informerar ni?"], [
        "Morning. {{person.legal.name}} reminds the room that a provider of drinking water is an essential service.\n\nUnder {{reg.nis2}} you have a duty to report significant incidents quickly, with an early warning within 24 hours. Someone changed chemical dosing from the internet; few things are more significant for a water utility.",
        "Morgon. {{person.legal.name}} påminner rummet om att en leverantör av dricksvatten är en samhällsviktig tjänst.\n\nEnligt {{reg.nis2}} har ni skyldighet att rapportera betydande incidenter snabbt, med en tidig varning inom 24 timmar. Någon ändrade kemikaliedoseringen från internet; få saker är mer betydande för ett vattenverk."
      ], {
        variants: [vr("watched", [
          "While you watched to learn what the intruder was after, they changed a second setpoint, on a different reservoir, before the operator caught it.\n\n{{person.legal.name}} reminds the room that a provider of drinking water has a duty under {{reg.nis2}} to report significant incidents quickly, with an early warning within 24 hours.",
          "Medan ni iakttog för att förstå vad inkräktaren var ute efter ändrade de ett andra börvärde, på en annan reservoar, innan operatören hann upptäcka det.\n\n{{person.legal.name}} påminner rummet om att en leverantör av dricksvatten enligt {{reg.nis2}} har skyldighet att rapportera betydande incidenter snabbt, med en tidig varning inom 24 timmar."
        ], ["Because you watched first, there was a second change.", "Eftersom ni bevakade först blev det en andra ändring."])],
        choice: ask(["Do you report now?", "Rapporterar ni nu?"], ["Reports early to the CSIRT and supervisor, without waiting for certainty.", "Rapporterar tidigt till CSIRT och tillsyn, utan att vänta på visshet."], [
          opt(["Report to {{reg.csirt}} and the supervisor today", "Rapportera till {{reg.csirt}} och tillsynen i dag"], "l2", ["Early warning is what the duty is for.", "Tidig varning är vad skyldigheten finns till för."], { set: "reported" }),
          opt(["Wait until you know it was an attack", "Vänta tills ni vet att det var ett angrepp"], "l2", ["Someone moved your mouse.", "Någon flyttade er muspekare."])
        ])
      }),

      pg("l2", ["The police", "Polisen"], [
        "{{person.ciso.name}} raises the police. Someone deliberately tampered with the treatment of drinking water, which is a crime, whoever did it.\n\nA police investigation will want the workstation untouched, as evidence. The operators want it cleaned and back in service as soon as possible.",
        "{{person.ciso.name}} tar upp frågan om polisen. Någon manipulerade medvetet behandlingen av dricksvatten, vilket är ett brott, vem som än gjorde det.\n\nEn polisutredning vill ha arbetsstationen orörd, som bevis. Operatörerna vill ha den rensad och i drift så snart som möjligt."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["Do you report it?", "Polisanmäler ni?"], ["Reports and preserves evidence; interfering with drinking water is serious.", "Polisanmäler och bevarar bevis; att påverka dricksvatten är allvarligt."], [
          opt(["Report and image the workstation first", "Polisanmäl och ta en avbildning av datorn först"], "c5", ["Evidence for whoever investigates.", "Bevis för den som utreder."]),
          opt(["Skip it; nothing was damaged", "Hoppa över det; inget skadades"], "c5", ["Nothing yet.", "Inget ännu."])
        ])
      }),

      pg("c5", ["A resident asks", "En invånare frågar"], [
        "A resident posts in the local community group that the treatment plant had “lots of cars outside at night”, and asks whether something is wrong with the water.\n\nThe post is shared hundreds of times. A local reporter calls: what happened at the plant last night?",
        "En invånare skriver i den lokala gruppen att vattenverket hade ”massor av bilar utanför i natt” och frågar om något är fel med vattnet.\n\nInlägget delas hundratals gånger. En lokalreporter ringer: vad hände på vattenverket i natt?"
      ], {
        variants: [vr("healthAlerted", [
          "A local reporter calls, asking about the cars at the plant last night. Residents are worried about their water.\n\nBecause the health authority was involved early, you have something better than reassurance: their own sampling results, showing the water is safe to drink.",
          "En lokalreporter ringer och frågar om bilarna vid vattenverket i natt. Invånarna är oroliga för sitt vatten.\n\nEftersom hälsoskyddsmyndigheten kopplades in tidigt har ni något bättre än lugnande ord: deras egna provresultat, som visar att vattnet är säkert att dricka."
        ], ["Because the health authority was alerted early, you have an independent voice on safety.", "Eftersom hälsomyndigheten larmades tidigt har ni en oberoende röst om säkerheten."])],
        discuss: [q("How do you say “someone accessed our control system” without causing panic?", "Hur säger man ”någon kom åt vårt styrsystem” utan att skapa panik?", ["comms", "ceo"])],
        choice: ask(["What do you say?", "Vad säger ni?"], ["Explains what happened, that the water is safe and how you know.", "Förklarar vad som hänt, att vattnet är säkert och hur ni vet det."], [
          opt(["What happened, why the water is safe, how you know", "Vad som hände, varför vattnet är säkert, hur ni vet det"], "l3", ["Honest and calming when backed by data.", "Ärligt och lugnande när det backas upp av data."], { set: "publicTold" }),
          opt(["“Routine maintenance”", "”Rutinunderhåll”"], "l3", ["Plausible until it isn't.", "Rimligt tills det inte är det."], { set: "coverStory" }),
          opt(["No comment", "Ingen kommentar"], "l3", ["Fills the space with speculation.", "Fyller tomrummet med spekulationer."])
        ])
      }),

      pg("l3", ["Other utilities", "Andra verk"], [
        "The contractor who installed the remote tool did not only work for you.\n\nThe same company serviced {{num.utilities}} other water utilities in the region, and probably installed the same tool, with the same habits, at each of them.",
        "Konsulten som installerade fjärrverktyget arbetade inte bara för er.\n\nSamma företag servade {{num.utilities}} andra vattenverk i regionen, och installerade troligen samma verktyg, med samma vanor, hos vart och ett av dem."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["Do you warn them?", "Varnar ni dem?"], ["Shares indicators through the CSIRT and sector channels.", "Delar indikatorer via CSIRT och sektorns kanaler."], [
          opt(["Share the details through the CSIRT and sector forum", "Dela detaljerna via CSIRT och sektorsforumet"], "c6", ["Protects neighbours; costs you some pride.", "Skyddar grannarna; kostar er lite stolthet."]),
          opt(["Keep it quiet", "Håll det tyst"], "c6", ["Their mice may be moving too.", "Deras muspekare kanske också rör sig."])
        ])
      }),

      pg("c6", ["The second night", "Den andra natten"], [
        "{{time.T+1440|clock}}, the next night. An alarm on the firewall: someone is trying the old remote access path again, from a new address.\n\nThe intruder has not given up. Whatever you do tonight shows whether the plant is really back in your hands.",
        "Klockan {{time.T+1440|clock}}, natten därpå. Ett larm i brandväggen: någon försöker igen med den gamla vägen för fjärråtkomst, från en ny adress.\n\nInkräktaren har inte gett upp. Det ni gör i natt visar om verket verkligen är tillbaka i era händer."
      ], {
        variants: [vr("toolsRemoved", [
          "{{time.T+1440|clock}}, the next night. An alarm on the firewall: someone is trying the old remote access path again, from a new address.\n\nBecause every remote tool was removed from the control network, the attempt finds nothing to connect to. But the intruder has not given up, and they may try another way in.",
          "Klockan {{time.T+1440|clock}}, natten därpå. Ett larm i brandväggen: någon försöker igen med den gamla vägen för fjärråtkomst, från en ny adress.\n\nEftersom alla fjärrverktyg togs bort från styrnätet hittar försöket ingenting att ansluta till. Men inkräktaren har inte gett upp, och de kan försöka en annan väg in."
        ], ["Because remote tools were removed, the door is closed.", "Eftersom fjärrverktygen togs bort är dörren stängd."])],
        choice: ask(["What do you do tonight?", "Vad gör ni i natt?"], ["Separates control systems from the rest until they are known clean.", "Skiljer styrsystemen från resten tills de är kända rena."], [
          opt(["Separate the control network from IT completely for now", "Skilj styrnätet helt från IT tills vidare"], "c7", ["Manual workarounds for reporting; safe control.", "Manuella lösningar för rapportering; säker styrning."]),
          opt(["Monitor and react", "Bevaka och reagera"], "c7", ["Reaction depends on someone watching at 03:00.", "Reaktionen hänger på att någon tittar klockan tre."]),
          opt(["Stop treatment; run on the reservoirs", "Stoppa beredningen; kör på reservoarerna"], "c7b", ["{{num.reserveHours}} hours of reserve.", "{{num.reserveHours}} timmars reserv."]),
          opt(["Tell the press a foreign state is attacking the water", "Säg till pressen att en främmande stat angriper vattnet"], "x1", ["Do you know that?", "Vet ni det?"])
        ])
      }),

      pg("c7b", ["Running on reserve", "Drift på reserven"], [
        "Treatment is stopped, and the plant feeds the network from the reservoirs alone.\n\nAt normal demand they last {{num.reserveHours}} hours. After that, taps in part of the region run dry, starting with the highest houses and the hospital's upper floors.",
        "Behandlingen är stoppad och verket försörjer nätet enbart från reservoarerna.\n\nVid normal förbrukning räcker de i {{num.reserveHours}} timmar. Därefter sinar kranarna i delar av regionen, med början i de högst belägna husen och sjukhusets övre våningar."
      ], {
        choice: ask(["How do you restart?", "Hur startar ni igen?"], ["Restarts under manual control before the reserve runs low.", "Startar igen under manuell styrning innan reserven tar slut."], [
          opt(["Restart under manual control", "Starta igen under manuell styrning"], "c7", ["Safe and staff-heavy.", "Säkert och personalkrävande."], { set: "manualOps" }),
          opt(["Ask the neighbouring utility to supply through the interconnection", "Be grannverket leverera via sammankopplingen"], "c7", ["Buys time if the pipes allow it.", "Ger tid om ledningarna tillåter det."])
        ])
      }),

      pg("c7", ["The budget", "Budgeten"], [
        "A week on, the board of the utility meets. They ask two questions: what will it cost to fix, and does it mean higher water rates for residents?\n\nThe engineers have a list of basics that were never done: network separation, removing remote tools, logging, spare parts for manual operation.",
        "En vecka senare sammanträder vattenbolagets styrelse. De ställer två frågor: vad kostar det att åtgärda, och betyder det högre vattenavgifter för invånarna?\n\nIngenjörerna har en lista över grundläggande saker som aldrig gjordes: nätseparering, borttagning av fjärrverktyg, loggning, reservdelar för manuell drift."
      ], {
        variants: [vr("coverStory", [
          "A plant worker tells the local paper, anonymously, that it was not maintenance: someone took over the control system. The article runs on the front page.\n\nNow the board asks what it will cost to fix, whether it means higher water rates, and why the public was told something else.",
          "En anställd på verket berättar anonymt för lokaltidningen att det inte var underhåll: någon tog över styrsystemet. Artikeln hamnar på förstasidan.\n\nNu frågar styrelsen vad det kostar att åtgärda, om det betyder högre vattenavgifter och varför allmänheten fick höra något annat."
        ], ["Because you called it maintenance, the real story came out through someone else.", "Eftersom ni kallade det underhåll kom den verkliga historien ut via någon annan."])],
        choice: ask(["What do you ask the board for?", "Vad begär ni av styrelsen?"], ["Asks for the basics: asset inventory, segmentation, controlled remote access.", "Begär grunderna: tillgångsinventering, segmentering, kontrollerad fjärråtkomst."], [
          opt(["Fund OT security basics this year", "Finansiera grundläggande OT-säkerhet i år"], "l4", ["Cheaper than the next night.", "Billigare än nästa natt."]),
          opt(["Postpone to next year's budget", "Skjut upp till nästa års budget"], "l4", ["The attacker's budget is this year's.", "Angriparens budget är årets."])
        ])
      }),

      pg("l4", ["Practice", "Övning"], [
        "In the review, the operators say manual operation worked, but only just. It worked because two of the four operators had done it before, years ago, and remembered how.\n\nThe written procedures were out of date, and the newer operators had never tried.",
        "Vid genomgången säger operatörerna att den manuella driften fungerade, men med knapp marginal. Den fungerade för att två av de fyra operatörerna hade gjort det förut, för flera år sedan, och kom ihåg hur.\n\nDe skrivna rutinerna var inaktuella, och de nyare operatörerna hade aldrig provat."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["Do you train for it?", "Övar ni på det?"], ["Makes manual operation a practised routine, not a memory.", "Gör manuell drift till en inövad rutin, inte ett minne."], [
          opt(["Manual-operation exercises twice a year", "Övningar i manuell drift två gånger om året"], "c8", ["Cheap insurance.", "Billig försäkring."]),
          opt(["Not needed; it worked", "Behövs inte; det fungerade"], "c8", ["It worked this time.", "Det fungerade den här gången."])
        ])
      }),

      pg("c8", ["Restoring automation", "Återställa automatiken"], [
        "After a week of manual operation, the operators are exhausted and everyone wants the automation back.\n\nThe control workstations have been scanned and nothing has been found, but they have not been rebuilt. A full rebuild from verified media would take another week.",
        "Efter en vecka med manuell drift är operatörerna utmattade och alla vill ha tillbaka automationen.\n\nStyrdatorerna har genomsökts utan fynd, men de har inte byggts om. En fullständig ominstallation från verifierade medier skulle ta en vecka till."
      ], {
        variants: [vr("restoredEarly", [
          "Automation was restored early, after a quick scan. Now the investigators make an unwelcome discovery.\n\nThe intruder's tool is still installed on a second control workstation, which has been running all week. Nobody knows whether it was used.",
          "Automationen återställdes tidigt, efter en snabb genomsökning. Nu gör utredarna en ovälkommen upptäckt.\n\nInkräktarens verktyg finns fortfarande installerat på en andra styrdator, som har varit igång hela veckan. Ingen vet om det har använts."
        ], ["Because automation came back after only a quick scan, the intruder had a second way in all week.", "Eftersom automatiken kom tillbaka efter bara en snabb genomsökning hade inkräktaren en andra väg in hela veckan."])],
        choice: ask(["When does it come back?", "När kommer den tillbaka?"], ["Restores from rebuilt, verified systems.", "Återställer från ombyggda, verifierade system."], [
          opt(["After rebuilding the workstations from verified media", "Efter att datorerna byggts om från verifierade medier"], "c9", ["Slower, clean.", "Långsammare, rent."]),
          opt(["Now, as it is", "Nu, som det är"], "c9", ["Hope as a control.", "Hopp som kontroll."])
        ])
      }),

      pg("c9", ["The sector", "Sektorn"], [
        "Two months later. The national water association invites you to speak about the incident at its annual conference.\n\nMany smaller utilities have the same contractors, the same tools and the same staffing. Some of your board would prefer the plant not to be associated with the incident at all.",
        "Två månader senare. Den nationella branschorganisationen för vatten bjuder in er att tala om incidenten på årskonferensen.\n\nMånga mindre vattenverk har samma konsulter, samma verktyg och samma bemanning. En del i er styrelse vill helst inte att verket förknippas med incidenten alls."
      ], {
        choice: ask(["Do you speak?", "Talar ni?"], ["Shares lessons so others fix the same weakness.", "Delar lärdomarna så att andra kan åtgärda samma svaghet."], [
          opt(["Yes, openly", "Ja, öppet"], "c10", ["Helps the sector; builds trust.", "Hjälper sektorn; bygger förtroende."]),
          opt(["Decline", "Tacka nej"], "c10", ["Others learn it the hard way.", "Andra lär sig det den hårda vägen."])
        ])
      }),

      pg("c10", ["Remote access policy", "Policy för fjärråtkomst"], [
        "The last decision before the review is closed: the rule for remote access to control systems in the future.\n\nContractors and vendors will keep asking for remote access, because it saves them hours of travel, and sometimes it really is the fastest way to fix a fault at night.",
        "Det sista beslutet innan genomgången avslutas: regeln för fjärråtkomst till styrsystem i framtiden.\n\nKonsulter och leverantörer kommer att fortsätta be om fjärråtkomst, eftersom det sparar dem timmar av resor, och ibland är det verkligen det snabbaste sättet att åtgärda ett fel på natten."
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

      pg("e1", ["Three months later", "Tre månader senare"], ["The plant went to manual control within minutes, the authorities heard about it the same day, and the public heard the truth from you.\n\nTrust in the water held: sampling results were published, nobody stopped drinking, and other utilities removed the same remote tool after your warning.", "Verket gick över till manuell drift inom några minuter, myndigheterna fick veta det samma dag och allmänheten fick höra sanningen från er.\n\nFörtroendet för vattnet höll: provresultaten publicerades, ingen slutade dricka och andra vattenverk tog bort samma fjärrverktyg efter er varning."], {
        ending: end(1, ["Safe water, told straight", "Säkert vatten, rakt berättat"], [
          "The plant went to manual control within minutes, the authorities heard it the same day and the public heard the truth. Trust in the water held.",
          "Verket gick över till manuell styrning inom några minuter, myndigheterna fick veta det samma dag och allmänheten fick höra sanningen. Förtroendet för vattnet höll."
        ])
      }),
      pg("e2", ["Three months later", "Tre månader senare"], ["The water stayed safe and the authorities were informed properly.\n\nBut the public got a vague answer, and the real story leaked out later through a plant worker. It cost more trust than the truth would have on the first day, and the board now spends its meetings on communication rather than security.", "Vattnet förblev säkert och myndigheterna informerades korrekt.\n\nMen allmänheten fick ett vagt svar, och den riktiga historien läckte ut senare via en anställd. Det kostade mer förtroende än sanningen hade gjort första dagen, och styrelsen ägnar nu sina möten åt kommunikation i stället för säkerhet."], {
        ending: end(2, ["Safe, but not said", "Säkert, men inte sagt"], [
          "The water stayed safe and the authorities were informed, but the public got a vague answer. The story leaks later and costs more trust than the truth would have.",
          "Vattnet förblev säkert och myndigheterna informerades, men allmänheten fick ett vagt svar. Historien läcker senare och kostar mer förtroende än sanningen hade gjort."
        ])
      }),
      pg("e3", ["Two months later", "Två månader senare"], ["You reported the intrusion properly, but went back to automation before the systems were clean.\n\nWeeks later, a second intrusion is found, through the tool left on the other workstation. This time the supervisor asks to see your whole recovery plan.", "Ni rapporterade intrånget korrekt, men gick tillbaka till automation innan systemen var rensade.\n\nVeckor senare upptäcks ett andra intrång, via verktyget som fanns kvar på den andra datorn. Den här gången vill tillsynsmyndigheten se hela er återställningsplan."], {
        ending: end(3, ["Reported, but automated too soon", "Rapporterat, men automatiserat för tidigt"], [
          "You reported the intrusion, but went back to automation before the systems were clean. A second intrusion is found weeks later.",
          "Ni rapporterade intrånget, men gick tillbaka till automatisk drift innan systemen var rena. Ett andra intrång upptäcks veckor senare."
        ])
      }),
      pg("e4", ["Four months later", "Fyra månader senare"], ["The intrusion was never reported to anyone.\n\nWhen a neighbouring utility is hit in exactly the same way, through the same contractor's tool, the investigation finds your incident too. The supervisor asks why you warned no one, and opens a case.", "Intrånget rapporterades aldrig till någon.\n\nNär ett grannverk drabbas på exakt samma sätt, via samma konsults verktyg, hittar utredningen även er incident. Tillsynsmyndigheten frågar varför ni inte varnade någon, och öppnar ett ärende."], {
        ending: end(4, ["Unreported", "Inte rapporterat"], [
          "The intrusion was never reported. When a neighbouring utility is hit the same way, the supervisor asks why you warned no one.",
          "Intrånget rapporterades aldrig. När ett grannverk drabbas på samma sätt frågar tillsynen varför ni inte varnade någon."
        ])
      }),

      // Break-away: naming a state.
      pg("x1", ["A foreign state", "En främmande stat"], [
        "Your statement to the press says the plant was attacked by a foreign state. By morning the headline runs everywhere: “Foreign state attacks the water supply.”\n\nWithin hours, {{reg.csirt}} says publicly that it has seen no evidence of that, and asks what your claim is based on.",
        "Ert uttalande till pressen säger att verket attackerades av en främmande stat. På morgonen finns rubriken överallt: ”Främmande stat attackerar vattenförsörjningen.”\n\nInom några timmar säger {{reg.csirt}} offentligt att man inte har sett några belägg för det och frågar vad påståendet bygger på."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Corrects the attribution quickly.", "Rättar tillskrivningen snabbt."], [
          opt(["Correct it: the attacker is unknown", "Rätta det: angriparen är okänd"], "x2", ["Right, and the headline stays.", "Rätt, och rubriken står kvar."]),
          opt(["Stand by it", "Stå fast vid det"], "x2", ["Now you must prove it.", "Nu måste ni bevisa det."])
        ])
      }),
      pg("x2", ["Fear", "Rädsla"], [
        "The fear spreads faster than any correction. Residents stop drinking tap water, and schools send children with bottles.\n\nBottled water sells out across the region, and elderly residents call the municipality asking whether it is safe to wash.",
        "Rädslan sprids snabbare än någon rättelse. Invånarna slutar dricka kranvatten och skolorna skickar med barnen flaskor.\n\nFlaskvatten tar slut i hela regionen, och äldre invånare ringer kommunen och frågar om det är säkert att tvätta sig."
      ], {
        choice: ask(["How do you restore trust in the water?", "Hur återställer ni förtroendet för vattnet?"], ["Publishes independent sample results daily.", "Publicerar oberoende provresultat varje dag."], [
          opt(["Daily independent sample results, published", "Dagliga oberoende provresultat, publicerade"], "x3", ["Slowly rebuilds trust.", "Bygger långsamt upp förtroendet."]),
          opt(["Reassuring statements", "Lugnande uttalanden"], "x3", ["Not after the headline.", "Inte efter rubriken."])
        ])
      }),
      pg("x3", ["Attention", "Uppmärksamhet"], [
        "The coverage has drawn attention. Hacktivist groups, inspired by the headlines, start scanning every water utility in the country for open remote access.\n\n{{reg.csirt}} reports a sharp rise in attempts against small utilities that have never been targeted before.",
        "Bevakningen har väckt uppmärksamhet. Hacktivistgrupper, inspirerade av rubrikerna, börjar söka igenom varje vattenverk i landet efter öppen fjärråtkomst.\n\n{{reg.csirt}} rapporterar en kraftig ökning av försök mot små vattenverk som aldrig tidigare har varit måltavlor."
      ], {
        choice: ask(["What do you do?", "Vad gör ni?"], ["Works with the CSIRT to warn the sector.", "Arbetar med CSIRT för att varna sektorn."], [
          opt(["Work with {{reg.csirt}} to warn every utility", "Arbeta med {{reg.csirt}} för att varna alla verk"], "x4", ["Late, but useful.", "Sent, men användbart."]),
          opt(["Focus on your own plant", "Fokusera på ert eget verk"], "x4", ["Understandable.", "Begripligt."])
        ])
      }),
      pg("x4", ["The ministry", "Departementet"], [
        "The ministry asks for a briefing. It wants to understand the attribution to a foreign state and the evidence behind it.\n\nThere is no evidence. The briefing is in two days.",
        "Departementet begär en föredragning. Det vill förstå tillskrivningen till en främmande stat och vilka belägg som finns för den.\n\nDet finns inga belägg. Föredragningen är om två dagar."
      ], {
        choice: ask(["What do you brief?", "Vad redovisar ni?"], ["Gives the facts, including what you do not know.", "Ger fakta, inklusive det ni inte vet."], [
          opt(["The facts, and what you got wrong", "Fakta, och det ni gjorde fel"], "e5", ["Honest, and the damage is done.", "Ärligt, och skadan är skedd."]),
          opt(["A defence of the statement", "Ett försvar för uttalandet"], "e5", ["There is no evidence to defend.", "Det finns inga belägg att försvara."])
        ])
      }),
      pg("e5", ["Six months later", "Sex månader senare"], ["The water was safe the whole time. But naming a foreign state without evidence made people stop drinking it, and drew attackers to every utility in the country.\n\nThe ministry's review is critical, and residents still buy bottled water. The headline is quoted in every report on the incident.", "Vattnet var säkert hela tiden. Men att peka ut en främmande stat utan belägg fick folk att sluta dricka det och lockade angripare till varje vattenverk i landet.\n\nDepartementets granskning är kritisk, och invånarna köper fortfarande flaskvatten. Rubriken citeras i varje rapport om incidenten."], {
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
