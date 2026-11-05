/*
 * s22-physical-intrusion.js — "The Visitor Who Stayed" (archetype B, physical intrusion).
 *
 * A cleaner finds a small box plugged in behind the reception printer. It might
 * be a vendor's → it is a mini-computer with its own mobile connection that has
 * scanned the network for nine days → CCTV shows a visitor who followed staff
 * in without signing the log → the box captured credentials, an admin account
 * reached HR files, and a second box is found → who owns physical security
 * when facilities is outsourced → what to tell staff about holding doors.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s22-physical-intrusion",
    version: 1,
    category: "physical-intrusion",
    archetype: "ambiguous-start",
    emblem: "visitor",
    title: L(["The Visitor Who Stayed", "Besökaren som blev kvar"]),
    summary: L([
      "A cleaner finds a small box plugged in behind the reception printer. Nobody ordered it, nobody signed it in, and it has been talking to the network for more than a week.",
      "En lokalvårdare hittar en liten låda inkopplad bakom receptionens skrivare. Ingen har beställt den, ingen har skrivit in den, och den har pratat med nätverket i mer än en vecka."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Handle a suspicious device without destroying evidence", "Hantera en misstänkt enhet utan att förstöra bevis"]), teaser: L(["Careful hands", "Försiktiga händer"]) },
      { id: "lo2", text: L(["Connect physical security and cyber security in one response", "Förena fysisk säkerhet och cybersäkerhet i en och samma insats"]), teaser: L(["Where the physical and the digital meet", "Där det fysiska och det digitala möts"]) },
      { id: "lo3", text: L(["Scope credential theft from inside the network", "Avgränsa stöld av inloggningsuppgifter inifrån nätverket"]), teaser: L(["Mapping what was touched", "Att kartlägga vad som har rörts"]) },
      { id: "lo4", text: L(["Change behaviour around doors and visitors without blaming staff", "Förändra beteenden kring dörrar och besökare utan att skuldbelägga personalen"]), teaser: L(["Changing habits without blame", "Att ändra vanor utan att skuldbelägga"]) }
    ],
    mitre: ["T1200", "T1557", "T1078", "T1021", "T1213"],
    frameworks: {
      nistCsf: ["ID.AM", "PR.AA", "PR.AT", "DE.CM", "DE.AE", "RS.AN", "RS.MA"],
      iso27001: ["A.7.2", "A.7.4", "A.5.15", "A.5.24", "A.5.28", "A.6.3", "A.8.20"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "monday-morning" },
    actor: { types: ["criminal", "unknown"], motivation: L(["Unclear: espionage or groundwork for a later attack", "Oklart: spionage eller förberedelser för ett senare angrepp"]), capability: "medium" },
    variables: {
      daysActive: { min: 6, max: 14 },
      hostsScanned: { min: 200, max: 6000, scaleBy: "size", step: 10 },
      hashesCaptured: { min: 12, max: 300, scaleBy: "size" }
    },
    roles: ["incidentCommander", "securityOfficer", "facilities", "itOps", "networkLead", "socLead", "ciso", "hr", "legal", "dpo", "comms", "ceo", "supplierManager"],

    groundTruth: {
      rootCause: L([
        "A person in a contractor's high-visibility vest followed staff through the staff entrance without a badge and placed two small computers with their own mobile connections on open network ports. For {{num.daysActive}} days they mapped the network and captured login attempts; one cracked administrator password was used from the device to read files on the HR share.",
        "En person i en entreprenörs varselväst följde med personal genom personalingången utan passerkort och placerade två små datorer med egen mobilanslutning i öppna nätverksuttag. Under {{num.daysActive}} dagar kartlade de nätverket och fångade inloggningsförsök; ett knäckt administratörslösenord användes från enheten för att läsa filer på HR-utdelningen."
      ]),
      attackerTimeline: [
        { at: -14400, text: L(["Visitor follows staff through the staff entrance at 07:52.", "Besökaren följer med personal genom personalingången klockan 07.52."]) },
        { at: -14390, text: L(["First device placed behind the reception printer.", "Den första enheten placeras bakom receptionens skrivare."]) },
        { at: -14370, text: L(["Second device placed in a meeting room.", "Den andra enheten placeras i ett mötesrum."]) },
        { at: -12000, text: L(["Network mapping begins over the mobile link.", "Kartläggningen av nätverket börjar via mobilanslutningen."]) },
        { at: -2880, text: L(["Cracked administrator password used to read the HR share.", "Knäckt administratörslösenord används för att läsa HR-utdelningen."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-device", revealStage: "p2", text: L(["The box is a mini-computer with its own mobile modem, controlled from outside.", "Lådan är en minidator med eget mobilmodem som styrs utifrån."]) },
      { id: "hf-visit", revealStage: "p3", text: L(["A person in a contractor vest followed staff in without a badge and was never signed in.", "En person i entreprenörsväst följde med personalen in utan passerkort och skrevs aldrig in."]) },
      { id: "hf-second", revealStage: "p4", text: L(["A second device sits in a meeting room, and a captured admin password reached the HR files.", "En andra enhet sitter i ett mötesrum, och ett fångat administratörslösenord nådde HR-filerna."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["A box behind the printer", "En låda bakom skrivaren"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The working week has just started at {{org.name}}. A cleaner reports a small black box with a network cable and a power adapter, plugged in behind the printer in reception.\n\nThe light on it is blinking. Nobody remembers ordering anything like it, and it was not there last month. It could be a vendor's monitoring device, or it could be something much worse.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Arbetsveckan har just börjat hos {{org.name}}. En städare rapporterar en liten svart låda med nätverkskabel och nätadapter, inkopplad bakom skrivaren i receptionen.\n\nLampan på den blinkar. Ingen minns att något sådant har beställts, och den fanns inte där förra månaden. Det kan vara en leverantörs övervakningsenhet, eller något mycket värre."
        ]),
        injects: [
          inj("i1-1", 0, "employeeReport", "facilities", "medium", "unverified", [
            "“There's a little box behind the printer with a light blinking. It wasn't there last month. Should I unplug it?”",
            "”Det sitter en liten låda bakom skrivaren som blinkar. Den fanns inte där förra månaden. Ska jag dra ur den?”"
          ], { tests: ["lo1"] }),
          inj("i1-2", 20, "ticket", "serviceDesk", "low", "confirmed", [
            "Facilities asks IT: is the box behind the reception printer ours? Photo attached.",
            "Fastighet frågar IT: är lådan bakom receptionsskrivaren vår? Foto bifogat."
          ], { tests: ["lo2"] }),
          inj("i1-3", 30, "chat", "itOps", "low", "misleading", [
            "IT: “Probably the printer vendor's monitoring box. They install those sometimes.”",
            "IT: ”Förmodligen skrivarleverantörens övervakningslåda. Sådana installerar de ibland.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Plausible: vendors do install devices. This one is not theirs.", "Rimligt: leverantörer installerar ibland enheter. Den här är inte deras."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you find out what is plugged into that network port?", "Hur tar ni reda på vad som är inkopplat i det nätverksuttaget?", ["networkLead"]),
            q("What would you lose by unplugging it now?", "Vad skulle ni förlora på att dra ur den nu?", ["socLead"]),
            q("Who keeps a record of devices vendors install?", "Vem håller ordning på vilka enheter leverantörer installerar?", ["itOps", "supplierManager"])
          ],
          executive: [
            q("Is this worth more than a ticket?", "Är det här värt mer än ett ärende?", ["incidentCommander"]),
            q("Who in the building is responsible for physical security?", "Vem i byggnaden ansvarar för den fysiska säkerheten?", ["securityOfficer", "facilities"]),
            q("Who should the cleaner have reported this to, and did that work?", "Till vem borde lokalvårdaren ha rapporterat det här, och fungerade det?", ["facilities"])
          ]
        },
        challenges: [ch("The printer vendor's support line opens at nine.", "Skrivarleverantörens support öppnar klockan nio.")],
        decision: dec("d1", "securityOfficer", ["What do you do with the box?", "Vad gör ni med lådan?"], [
          ["Photograph it, leave it powered, isolate its port at the switch, and call security and IT.", "Fotografera den, låt den vara strömsatt, isolera dess port i switchen och kalla in säkerhet och IT."],
          ["Unplug it at once: a device nobody recognises should not stay on your network one minute longer.", "Dra ur den direkt: en enhet som ingen känner igen ska inte sitta kvar i ert nät en minut till."],
          ["Leave it untouched and call the printer vendor first; if it is theirs, pulling it breaks the service contract.", "Rör den inte och ring skrivarleverantören först; om den är deras bryter ni serviceavtalet genom att dra ur den."]
        ], {
          knowns: [["The box is plugged into the network.", "Lådan är inkopplad i nätverket."]],
          uncertainties: [["Whether it belongs to a vendor.", "Om den tillhör en leverantör."]],
          tradeoffs: {
            operational: ["Isolating the port takes the printer offline.", "Att isolera porten kopplar bort skrivaren."],
            security: ["Unplugging loses what is in its memory.", "Att dra ur den förlorar det som finns i dess minne."],
            legal: ["It may become evidence.", "Den kan bli bevis."],
            reputational: ["A false alarm costs little.", "Ett falsklarm kostar lite."]
          },
          evaluation: [["Cuts the network path while keeping the device intact", "Kapar nätverksvägen men behåller enheten intakt"]],
          pushback: {
            A: [
              pb(["Which port is it?", "Vilken port är det?"], ["The network documentation for reception is years old. Two ports in that wall show traffic, and one of them may be the card reader at the door. Do you isolate both and risk locking the entrance, or wait until you are sure?", "Nätverksdokumentationen för receptionen är flera år gammal. Två uttag i den väggen visar trafik, och ett av dem kan vara kortläsaren vid dörren. Isolerar ni båda och riskerar att låsa entrén, eller väntar ni tills ni är säkra?"]),
              pb(["Reception without a printer", "Reception utan skrivare"], ["Isolating the port takes the reception printer offline on a Monday with visitors arriving for meetings all morning. The receptionist cannot print visitor badges. Do you accept unbadged visitors today, of all days?", "Att isolera porten kopplar bort receptionsskrivaren en måndag då besökare kommer till möten hela förmiddagen. Receptionisten kan inte skriva ut besöksbrickor. Accepterar ni besökare utan bricka i dag, av alla dagar?"]),
              pb(["Who guards it?", "Vem vaktar den?"], ["The box stays powered, in a public reception, with no one assigned to watch it. The receptionist asks what to do if a visitor or a “technician” comes to collect it. Who stands next to it, and with what instructions?", "Lådan förblir strömsatt, i en allmän reception, utan att någon har fått i uppgift att bevaka den. Receptionisten frågar vad hen ska göra om en besökare eller en ”tekniker” kommer för att hämta den. Vem står bredvid den, och med vilka instruktioner?"])
            ],
            B: [
              pb(["The light went out", "Lampan slocknade"], ["The SOC lead arrives and asks what the box was doing and who it was talking to. With the power gone, whatever was running in memory is gone too. How will you ever answer what it did?", "SOC-chefen kommer och frågar vad lådan gjorde och vem den pratade med. När strömmen bröts försvann också det som körde i minnet. Hur ska ni någonsin kunna svara på vad den gjorde?"]),
              pb(["The vendor calls back", "Leverantören ringer tillbaka"], ["The printer vendor's account manager calls: it might be one of theirs, and an unplugged monitoring unit counts as tampering under the service agreement. They need to check. Do you plug it back in while you wait?", "Skrivarleverantörens kundansvarige ringer: den kan vara deras, och en urdragen övervakningsenhet räknas som manipulation enligt serviceavtalet. De behöver kontrollera. Kopplar ni in den igen medan ni väntar?"]),
              pb(["Four sets of hands", "Fyra par händer"], ["In the rush, the box went from the cleaner to the receptionist to a colleague who put it in a desk drawer. Nobody wrote down who touched it, or when. If this becomes evidence, what can you say about it?", "I brådskan gick lådan från lokalvårdaren till receptionisten till en kollega som lade den i en skrivbordslåda. Ingen skrev upp vem som rörde den, eller när. Om det här blir bevis, vad kan ni säga om den?"])
            ],
            C: [
              pb(["No serial number", "Inget serienummer"], ["The vendor's support line needs a serial number to check its records. The box has no label of any kind. Their best offer is a technician visit later this week. How long do you leave it plugged in while they look?", "Leverantörens support behöver ett serienummer för att kontrollera sina register. Lådan saknar etikett helt och hållet. Deras bästa erbjudande är ett teknikerbesök senare i veckan. Hur länge låter ni den sitta i medan de letar?"]),
              pb(["Every minute on the network", "Varje minut i nätverket"], ["The SOC lead objects: whatever the box is, it is on your network right now, doing whatever it does, while you wait for a phone call. A contract fee is a small price next to that. Why is the contract the first thing you protect?", "SOC-chefen protesterar: vad lådan än är sitter den i ert nätverk just nu och gör vad den gör, medan ni väntar på ett telefonsamtal. En avtalsavgift är ett litet pris jämfört med det. Varför är avtalet det första ni skyddar?"]),
              pb(["Someone else pulls it", "Någon annan drar ur den"], ["While you wait for the vendor, a helpful colleague from another floor hears about the box and pulls the plug “to be safe”. Your careful hands-off decision has been made for you. How do you stop people acting on their own?", "Medan ni väntar på leverantören hör en hjälpsam kollega från en annan våning talas om lådan och drar ur kontakten ”för säkerhets skull”. Ert försiktiga beslut att inte röra den har fattats åt er. Hur hindrar ni folk från att agera på egen hand?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Powered and isolated", "Strömsatt och isolerad"], [
              io(["A clean record", "En ren dokumentation"], ["The switch shows the port go dark while the box stays powered on the floor. Photos, cabling and times are all written down before anyone touches it. The room feels in control.", "Switchen visar att porten släcks medan lådan förblir strömsatt på golvet. Foton, kablage och tider är nedskrivna innan någon rör den. Rummet känner att det har kontroll."], ["The box is isolated, powered and documented with photos and times.", "Lådan är isolerad, strömsatt och dokumenterad med foton och tider."]),
              io(["The door stops reading badges", "Dörren slutar läsa kort"], ["The port you isolated also fed the card reader at the staff entrance. Badges stop working, and someone props the door open so people can get in. It stays open for twenty minutes.", "Porten ni isolerade försörjde också kortläsaren vid personalingången. Korten slutar fungera, och någon ställer upp dörren så att folk kan komma in. Den står öppen i tjugo minuter."], ["The staff entrance was propped open while the card reader was down.", "Personalingången stod uppställd medan kortläsaren låg nere."], { reopen: true }),
              io(["The light changes", "Lampan ändras"], ["A few minutes after the port goes dark, the light on the box starts blinking faster, in a new pattern. Nobody knows whether it noticed anything, or whether it always does that.", "Några minuter efter att porten släckts börjar lampan på lådan blinka snabbare, i ett nytt mönster. Ingen vet om den märkte något, eller om den alltid gör så."], ["The box's light pattern changed after the port was isolated.", "Lådans blinkmönster ändrades efter att porten isolerades."])
            ]),
            ir("i2", { notChosen: "A" }, ["No careful hands", "Inga försiktiga händer"], [
              io(["An old invoice", "En gammal faktura"], ["IT finds an old invoice from the printer vendor for “remote monitoring units” and declares the case closed. It does not say what the units look like, or where they went.", "IT hittar en gammal faktura från skrivarleverantören för ”fjärrövervakningsenheter” och förklarar ärendet avslutat. Den säger inte hur enheterna ser ut, eller var de hamnade."], ["An old vendor invoice mentions monitoring units; IT calls it closed.", "En gammal leverantörsfaktura nämner övervakningsenheter; IT anser ärendet avslutat."]),
              io(["No record of anything", "Ingen dokumentation alls"], ["Legal asks how the box was connected and who has touched it, in case it becomes evidence. Nobody photographed it, noted its port or wrote down who handled it.", "Juristen frågar hur lådan var inkopplad och vem som har rört den, ifall den blir bevis. Ingen fotograferade den, noterade dess uttag eller skrev upp vem som hanterade den."], ["There is no photo or record of how the box was first connected.", "Det finns inget foto eller någon dokumentation av hur lådan först var inkopplad."], { reopen: true }),
              io(["A slow printer", "En långsam skrivare"], ["The receptionist mentions that the printer has been slow for more than a week, and once printed a page of nonsense. It might be related. It might just be an old printer.", "Receptionisten nämner att skrivaren har varit långsam i mer än en vecka, och en gång skrev ut en sida med obegripliga tecken. Det kan hänga ihop. Det kan bara vara en gammal skrivare."], ["The reception printer has been slow for over a week; cause unknown.", "Receptionsskrivaren har varit långsam i över en vecka; orsaken är okänd."])
            ])
          ]
        }),
        facilitator: fac(
          ["The best move separates the device from the network at the switch, without pulling the plug.", "Det bästa draget skiljer enheten från nätverket i switchen, utan att dra ur kontakten."],
          ["Photos, port isolation, chain of custody, and security and IT together.", "Foton, isolerad port, spårbar hantering och säkerhet och IT tillsammans."],
          [["Ask: if this were a weapon, would you put it in a drawer?", "Fråga: om det här vore ett vapen, skulle ni lägga det i en låda?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 90,
        title: L(["Not ours", "Inte vår"]),
        twist: L(["The printer vendor has never seen it. Inside is a small computer with a mobile data card, and the switch logs show it has been active on your network for {{num.daysActive}} days.", "Skrivarleverantören har aldrig sett den. Inuti finns en liten dator med ett mobildatakort, och switchens loggar visar att den har varit aktiv i ert nätverk i {{num.daysActive}} dagar."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the box was left powered, it sent one last burst of data over its mobile card before the port was isolated.", sv: "Eftersom lådan lämnades strömsatt hann den skicka en sista mängd data över sitt mobilkort innan porten isolerades." } }
        ],
        assumptionChallenged: L(["It is a vendor's monitoring device.", "Det är en leverantörs övervakningsenhet."]),
        reveals: ["hf-device"],
        narrative: L([
          "{{time.T+90|clock}}. The printer vendor has been asked, and does not recognise the box. {{person.networkLead.name}} and {{person.socLead.name}} look at the switch logs and open the box itself.\n\nWhat they find is not an office gadget. Someone built it on purpose, and it has been busy.",
          "Klockan {{time.T+90|clock}}. Skrivarleverantören har tillfrågats och känner inte igen lådan. {{person.networkLead.name}} och {{person.socLead.name}} tittar på switchens loggar och öppnar själva lådan.\n\nDet de hittar är ingen kontorspryl. Någon har byggt den med avsikt, och den har varit flitig."
        ]),
        injects: [
          inj("i2-1", 90, "networkEvidence", "itOps", "high", "confirmed", [
            "Port 2/0/14 (reception): unknown device, first seen {{num.daysActive}} days ago. Since then it has contacted {{num.hostsScanned|number}} internal addresses.",
            "Port 2/0/14 (receptionen): okänd enhet, sågs första gången för {{num.daysActive}} dagar sedan. Sedan dess har den kontaktat {{num.hostsScanned|number}} interna adresser."
          ], { tests: ["lo3"] }),
          inj("i2-2", 120, "forensicFinding", "forensics", "high", "confirmed", [
            "The box contains a single-board computer, a mobile data card and a battery. It does not use your internet connection at all; it talks out through the mobile network.",
            "Lådan innehåller en enkortsdator, ett mobildatakort och ett batteri. Den använder inte er internetuppkoppling alls; den kommunicerar ut via mobilnätet."
          ], { reveals: ["hf-device"], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Why did nothing on your network notice traffic going out?", "Varför märkte ingenting i ert nätverk att trafik gick ut?", ["socLead", "networkLead"]),
            q("What would it have seen from that port?", "Vad skulle den ha sett från den porten?", ["networkLead"]),
            q("Was leaving it powered the right call?", "Var det rätt att låta den vara strömsatt?", ["socLead"], "d1")
          ],
          executive: [
            q("Is this a police matter now?", "Är det här en polissak nu?", ["legal", "securityOfficer"]),
            q("Who leads: physical security or cyber security?", "Vem leder: fysisk säkerhet eller cybersäkerhet?", ["incidentCommander"]),
            q("Looking back at this morning, who should have been called first?", "Om ni ser tillbaka på i morse, vem borde ha kallats in först?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Facilities and IT each assume the other is handling it.", "Fastighet och IT tror var och en att den andra hanterar det.")],
        decision: dec("d2", "incidentCommander", ["How do you organise the response?", "Hur organiserar ni insatsen?"], [
          ["One incident team with security, facilities and IT under a single lead, and the police informed.", "En incidentgrupp med säkerhet, fastighet och IT under en gemensam ledning, och polisen informerad."],
          ["IT handles the device; facilities handles the building.", "IT hanterar enheten; fastighet hanterar byggnaden."],
          ["Keep it low-key: security and IT look into it quietly, and nobody else is told until you know what it is.", "Håll det lågmält: säkerhet och IT undersöker det i tysthet, och ingen annan får veta förrän ni vet vad det är."]
        ], {
          knowns: [["The device is not a vendor's and talks out over mobile data.", "Enheten är inte en leverantörs och kommunicerar ut via mobildata."]],
          uncertainties: [["Who placed it, and whether there are more.", "Vem som placerade den, och om det finns fler."]],
          tradeoffs: {
            operational: ["A joint team takes people from their normal work.", "En gemensam grupp tar personal från deras ordinarie arbete."],
            security: ["Split teams miss what lies between them.", "Uppdelade grupper missar det som ligger mellan dem."],
            legal: ["Police involvement changes how evidence is handled.", "Polisens inblandning ändrar hur bevis hanteras."],
            reputational: ["Staff will hear about it either way.", "Personalen kommer att höra talas om det oavsett."]
          },
          evaluation: [["Puts physical and cyber security under one lead", "Samlar fysisk säkerhet och cybersäkerhet under en ledning"]],
          pushback: {
            A: [
              pb(["Police rules for the box", "Polisens regler för lådan"], ["The police ask you not to open the box further until their own technicians have seen it, and they cannot come today. Your analysts want to copy its storage now. Do you follow police rules and wait, or do your own analysis and risk the evidence?", "Polisen ber er att inte öppna lådan mer förrän deras egna tekniker har sett den, och de kan inte komma i dag. Era analytiker vill kopiera dess lagring nu. Följer ni polisens regler och väntar, eller gör ni er egen analys och riskerar bevisen?"]),
              pb(["Two people want the lead", "Två vill leda"], ["The security officer says a physical intrusion is theirs to lead; the CISO says a device on the network is a cyber incident. Both have a point, and both are waiting for you to choose. Who leads, and how do you keep the other one fully in?", "Säkerhetschefen säger att ett fysiskt intrång är hens att leda; CISO:n säger att en enhet i nätverket är en cyberincident. Båda har en poäng, och båda väntar på att ni ska välja. Vem leder, och hur håller ni den andra helt delaktig?"]),
              pb(["Meetings, not work", "Möten i stället för arbete"], ["The joint team is nine people in one room, and the first hour has gone on agreeing who does what. Nobody has yet looked at which other ports were live. Is one big team faster, or just slower together?", "Den gemensamma gruppen är nio personer i ett rum, och den första timmen har gått åt till att komma överens om vem som gör vad. Ingen har ännu tittat på vilka andra uttag som var aktiva. Är en stor grupp snabbare, eller bara långsammare tillsammans?"])
            ],
            B: [
              pb(["Building work tonight", "Byggarbete i kväll"], ["Facilities plans to replace the wall ports in reception tonight to “make it safe”. IT wanted those ports and their cabling untouched. Each side is acting correctly in its own lane. Who stops whom?", "Fastighet planerar att byta vägguttagen i receptionen i kväll för att ”göra det säkert”. IT ville att uttagen och kablarna skulle lämnas orörda. Var och en agerar korrekt i sin egen fil. Vem stoppar vem?"]),
              pb(["Nobody asked for the date", "Ingen bad om datumet"], ["The switch logs show when the box first appeared. The entrance logs and cameras could show who was in the building then. IT has the date, facilities has the cameras, and nobody has connected them. Who owns the question that lies between?", "Switchens loggar visar när lådan först dök upp. Passerloggarna och kamerorna skulle kunna visa vem som var i byggnaden då. IT har datumet, fastighet har kamerorna, och ingen har kopplat ihop dem. Vem äger frågan som ligger mittemellan?"]),
              pb(["Two answers for the police", "Två svar till polisen"], ["A police officer calls asking for one contact person for the case. IT and facilities each give a different name and a different account of what was found. How do you look to the police, and who speaks for the company?", "En polis ringer och ber om en kontaktperson för ärendet. IT och fastighet anger var sitt namn och var sin beskrivning av fyndet. Hur framstår ni för polisen, och vem talar för företaget?"])
            ],
            C: [
              pb(["Already in the canteen", "Redan i lunchrummet"], ["The receptionist has already told colleagues that “IT found a bug behind the printer”. By lunch the story is everywhere, without your version in it. What does keeping it quiet protect now?", "Receptionisten har redan berättat för kollegor att ”IT hittade en bugg bakom skrivaren”. Vid lunch är historien överallt, utan er version. Vad skyddar det nu att hålla tyst?"]),
              pb(["The DPO was not told", "Dataskyddsombudet fick inte veta"], ["The data protection officer hears about the box by chance and asks why they were left out: it has been on the network for days, and a notification clock may already be running. Who decided the DPO did not need to know?", "Dataskyddsombudet hör talas om lådan av en slump och frågar varför hen hölls utanför: den har suttit i nätverket i flera dagar, och en tidsfrist för anmälan kan redan löpa. Vem bestämde att dataskyddsombudet inte behövde veta?"]),
              pb(["The insurer's deadline", "Försäkringsbolagets tidsfrist"], ["Legal finds a clause in the cyber policy: suspected incidents must be reported promptly, or cover may be refused. A quiet investigation means not reporting. Is staying low-key worth losing the insurance?", "Juristen hittar en klausul i cyberförsäkringen: misstänkta incidenter ska anmälas skyndsamt, annars kan ersättning nekas. En tyst utredning innebär att inte anmäla. Är det värt att förlora försäkringen för att hålla det lågmält?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["One team, police told", "En grupp, polisen informerad"], [
              io(["The dates meet", "Datumen möts"], ["With IT and facilities in the same room, the switch's first-seen date goes straight to the person who holds the camera archive. The footage review starts within the hour.", "Med IT och fastighet i samma rum går switchens datum för första observation direkt till den som har kameraarkivet. Genomgången av inspelningarna börjar inom en timme."], ["The first-seen date has gone to facilities for camera review.", "Datumet för första observation har gått till fastighet för kameragenomgång."]),
              io(["The police say wait", "Polisen säger vänta"], ["The police ask you to pause any analysis of the box until their own technician has seen it. Your analysts sit idle for hours while the box sits in a bag.", "Polisen ber er pausa all analys av lådan tills deras egen tekniker har sett den. Era analytiker sitter sysslolösa i flera timmar medan lådan ligger i en påse."], ["Analysis of the box paused for some hours at police request.", "Analysen av lådan pausades i några timmar på polisens begäran."]),
              io(["A case number, no one assigned", "Ett diarienummer, ingen handläggare"], ["The police register the report and give you a case number, but nobody is assigned yet. It is unclear whether they see a crime, a curiosity or a civil matter.", "Polisen registrerar anmälan och ger er ett diarienummer, men ingen handläggare är utsedd än. Det är oklart om de ser ett brott, en kuriositet eller en civilrättslig fråga."], ["The police registered the case but have assigned no one yet.", "Polisen har registrerat ärendet men ännu inte utsett någon handläggare."])
            ]),
            ir("i2", { notChosen: "A" }, ["Separate lanes", "Separata filer"], [
              io(["The cabling is changed", "Kablaget byts"], ["Without telling IT, facilities has an electrician tidy the cabling behind the reception printer. The original connection, and whatever it showed, is gone.", "Utan att säga något till IT låter fastighet en elektriker städa kablaget bakom receptionsskrivaren. Den ursprungliga inkopplingen, och det den kunde visa, är borta."], ["Reception cabling was changed before IT could document it.", "Kablaget i receptionen byttes innan IT hann dokumentera det."], { reopen: true }),
              io(["No interruptions", "Inga avbrott"], ["The small group works through the afternoon without meetings or questions from anyone else. The analysis moves fast, and the room takes that as proof the set-up works.", "Den lilla gruppen arbetar hela eftermiddagen utan möten eller frågor från någon annan. Analysen går snabbt, och rummet tar det som bevis på att upplägget fungerar."], ["The investigation has run without interruptions so far.", "Utredningen har hittills löpt utan avbrott."]),
              io(["Two timelines", "Två tidslinjer"], ["IT dates the box from the switch logs; facilities dates it from what the cleaner remembers. The two do not match, and nobody owns the job of finding out which is right.", "IT daterar lådan utifrån switchens loggar; fastighet daterar den utifrån vad lokalvårdaren minns. De stämmer inte överens, och ingen äger uppgiften att ta reda på vilken som är rätt."], ["IT and facilities hold different timelines for when the box appeared.", "IT och fastighet har olika tidslinjer för när lådan dök upp."])
            ])
          ]
        }),
        facilitator: fac(
          ["The device lives where the two disciplines meet. Watch for teams handing it to each other.", "Enheten finns där de två disciplinerna möts. Var uppmärksam på grupper som skickar den mellan sig."],
          ["A joint team, the police informed, the hunt for more devices started.", "En gemensam grupp, polisen informerad, sökandet efter fler enheter påbörjat."],
          [["Ask: if one box was placed, how many could have been?", "Fråga: om en låda placerades, hur många kan det ha varit?"]]
        )
      },
      {
        id: "p3",
        clock: 240,
        priority: 1,
        title: L(["The vest", "Västen"]),
        twist: L(["Camera footage from {{num.daysActive}} days ago shows a person in a contractor's vest following two employees through the staff entrance. The visitor log has no entry that morning.", "Kameror från för {{num.daysActive}} dagar sedan visar en person i entreprenörsväst som följer två anställda genom personalingången. Besöksliggaren har ingen post den morgonen."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "The box was active for {{num.daysActive}} days. If you left it powered and isolated, you kept the evidence and its owner's attention. If you unplugged it, whoever placed it knows they have been found.", sv: "Lådan var aktiv i {{num.daysActive}} dagar. Om ni lät den vara strömsatt och isolerad behöll ni bevisen, och dess ägares uppmärksamhet. Om ni drog ur den vet den som placerade den att den har hittats." } },
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because the police were told early, a uniformed patrol arrived at reception, and the story is spreading among staff.", sv: "Eftersom polisen kontaktades tidigt kom en polispatrull i uniform till receptionen, och historien sprids bland personalen." } }
        ],
        assumptionChallenged: L(["Our badge system keeps strangers out.", "Vårt passersystem håller främlingar ute."]),
        reveals: ["hf-visit"],
        narrative: L([
          "{{time.T+240|clock}}. The box has been there for days. Someone must have carried it in and plugged it in. {{person.securityOfficer.name}} goes through the camera recordings for the morning the box first appeared on the network.\n\nThe cameras at the staff entrance are good. It takes twenty minutes to find the moment.",
          "Klockan {{time.T+240|clock}}. Lådan har funnits där i flera dagar. Någon måste ha burit in och kopplat in den. {{person.securityOfficer.name}} går igenom kamerainspelningarna från morgonen då lådan först dök upp i nätverket.\n\nKamerorna vid personalingången är bra. Det tar tjugo minuter att hitta ögonblicket."
        ]),
        injects: [
          inj("i3-1", 240, "impactReport", "facilities", "high", "confirmed", [
            "07:52: two employees badge in at the staff entrance; a third person in a vest walks in behind them carrying a toolbox. No badge, no sign-in. 08:31: the same person leaves.",
            "07.52: två anställda passerar personalingången med kort; en tredje person i väst går in bakom dem med en verktygslåda. Inget kort, ingen inskrivning. 08.31: samma person lämnar."
          ], { headline: ["Camera review, staff entrance", "Kameragenomgång, personalingången"], reveals: ["hf-visit"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Where did the visitor go in those 39 minutes, and which ports are there?", "Vart gick besökaren under de 39 minuterna, och vilka uttag finns där?", ["securityOfficer", "networkLead"]),
            q("Can you turn off open network ports in public areas?", "Kan ni stänga av öppna nätverksuttag i allmänna utrymmen?", ["networkLead"]),
            q("Did the joint team find this faster than separate teams would have?", "Hittade den gemensamma gruppen det här snabbare än separata grupper hade gjort?", ["securityOfficer"], "d2")
          ],
          executive: [
            q("The two employees held the door. What, if anything, do you say to them?", "De två anställda höll upp dörren. Vad, om något, säger ni till dem?", ["hr"]),
            q("Do you share the footage with the police?", "Delar ni filmerna med polisen?", ["legal"]),
            q("Would you organise the response the same way, knowing it started at the door?", "Skulle ni organisera insatsen likadant, när ni vet att det började vid dörren?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("Camera recordings are kept for 14 days; the earliest relevant day is about to be overwritten.", "Kamerainspelningarna sparas i 14 dagar; den tidigaste relevanta dagen håller på att skrivas över.")],
        decision: dec("d3", "securityOfficer", ["What do you do now?", "Vad gör ni nu?"], [
          ["Preserve all footage, walk the visitor's route and sweep every area for devices.", "Säkra alla inspelningar, gå besökarens väg och genomsök alla utrymmen efter enheter."],
          ["Preserve the footage and wait for the police.", "Säkra inspelningarna och vänta på polisen."],
          ["Send a calm reminder about badges today and sweep the building tonight, without alarming staff during the working day.", "Skicka en lugn påminnelse om passerkort i dag och genomsök byggnaden i kväll, utan att oroa personalen under arbetsdagen."]
        ], {
          knowns: [["The visitor was inside for 39 minutes.", "Besökaren var inne i 39 minuter."]],
          uncertainties: [["Where else they went.", "Var de mer gick."]],
          tradeoffs: {
            operational: ["A sweep disrupts every floor for a day.", "En genomsökning stör varje våning i ett dygn."],
            security: ["An unfound device keeps working.", "En enhet som inte hittas fortsätter att arbeta."],
            legal: ["Footage is personal data and evidence at once.", "Inspelningarna är både personuppgifter och bevis."],
            reputational: ["A reminder alone looks like blaming staff.", "Enbart en påminnelse ser ut som att skylla på personalen."]
          },
          evaluation: [["Follows the visitor's route physically before the footage is lost", "Följer besökarens väg fysiskt innan inspelningarna försvinner"]],
          pushback: {
            A: [
              pb(["The cameras stop at the stairs", "Kamerorna slutar vid trappan"], ["Camera coverage ends at the stairwell. After that, the visitor's route is a guess across four floors. Walking “the route” means walking the whole building. How wide do you go, and how will you know you are finished?", "Kamerabevakningen slutar vid trapphuset. Därefter är besökarens väg en gissning över fyra våningar. Att gå ”vägen” innebär att gå igenom hela byggnaden. Hur brett går ni, och hur vet ni att ni är klara?"]),
              pb(["The client workshop", "Kundworkshopen"], ["The meeting rooms are booked all day for a workshop with an important client. The sales director asks you not to send people crawling under the tables in front of them. Do you clear the rooms, or skip them for now?", "Mötesrummen är bokade hela dagen för en workshop med en viktig kund. Försäljningschefen ber er att inte skicka in folk som kryper under borden framför dem. Tömmer ni rummen, eller hoppar ni över dem tills vidare?"]),
              pb(["Faces in the footage", "Ansikten i filmerna"], ["To follow the route, the sweep team is shown the footage, including the two employees who held the door. HR objects: by tonight, everyone will know who they are. Do you limit who sees it, even if it slows the sweep?", "För att kunna följa vägen får sökteamet se filmerna, även de två anställda som höll upp dörren. HR protesterar: i kväll kommer alla att veta vilka de är. Begränsar ni vilka som får se dem, även om det bromsar genomsökningen?"])
            ],
            B: [
              pb(["Two days away", "Två dagar bort"], ["The police can send someone in two days and ask you not to disturb anything until then. Meanwhile staff use every room the visitor walked through. Is waiting preserving evidence, or just leaving the building as the visitor left it?", "Polisen kan skicka någon om två dagar och ber er att inte rubba något till dess. Under tiden använder personalen varje rum som besökaren gick igenom. Bevarar väntan bevis, eller lämnar den bara byggnaden som besökaren lämnade den?"]),
              pb(["Thirty-nine minutes", "Trettionio minuter"], ["Placing one box behind a printer takes a couple of minutes. The visitor was inside for thirty-nine, carrying a toolbox. Can you explain the rest of that time without looking?", "Att placera en låda bakom en skrivare tar ett par minuter. Besökaren var inne i trettionio, med en verktygslåda. Kan ni förklara resten av tiden utan att leta?"]),
              pb(["“So we just sit here?”", "”Så vi bara sitter här?”"], ["The CEO asks why, hours after learning a stranger walked through the building, the company is waiting for someone else to look. Staff ask whether their floor is safe. What do you say you are doing?", "Vd frågar varför företaget, flera timmar efter att ha fått veta att en främling gick genom byggnaden, väntar på att någon annan ska leta. Personalen frågar om deras våning är säker. Vad säger ni att ni gör?"])
            ],
            C: [
              pb(["The footage expires tonight", "Inspelningarna försvinner i natt"], ["Your plan sends a reminder and sweeps tonight, but says nothing about the recordings. The oldest relevant day is overwritten before your sweep even starts. Who saves the footage, and when?", "Er plan skickar en påminnelse och genomsöker i kväll, men säger inget om inspelningarna. Den äldsta relevanta dagen skrivs över innan genomsökningen ens har börjat. Vem säkrar filmerna, och när?"]),
              pb(["Two people read the reminder", "Två personer läser påminnelsen"], ["The two employees on the footage read the badge reminder and recognise that morning. They ask HR whether the message is about them. What does HR tell them, when you have said nothing else?", "De två anställda på filmerna läser påminnelsen om passerkort och känner igen morgonen. De frågar HR om budskapet handlar om dem. Vad säger HR till dem, när ni inte har sagt något annat?"]),
              pb(["Locked doors at night", "Låsta dörrar på natten"], ["At night there is nobody to open locked offices, cabinets and server cupboards, and the cleaners' keys do not reach them all. Meanwhile, anything planted keeps working all day. Is a quiet evening sweep a full sweep?", "På natten finns ingen som kan låsa upp kontor, skåp och serverskåp, och lokalvårdarnas nycklar räcker inte till alla. Under tiden fortsätter det som kan ha placerats ut att arbeta hela dagen. Är en tyst kvällsgenomsökning en fullständig genomsökning?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The sweep", "Genomsökningen"], [
              io(["Clean so far", "Rent hittills"], ["The first floors come back clean: nothing under desks, nothing behind screens. The sweep team reports “nothing so far”, and the mood in the room lifts.", "De första våningarna är rena: inget under skrivborden, inget bakom skärmarna. Sökteamet rapporterar ”inget hittills”, och stämningen i rummet lättar."], ["The first floors searched came back clean.", "De första genomsökta våningarna var rena."]),
              io(["The client sees it", "Kunden ser det"], ["The sweep team walks into a room where an important client is waiting. The client asks, politely, what has happened, and whether their own information is safe here.", "Sökteamet går in i ett rum där en viktig kund väntar. Kunden frågar artigt vad som har hänt, och om deras egen information är säker här."], ["A client saw the sweep and asked what had happened.", "En kund såg genomsökningen och frågade vad som hade hänt."], { meters: { trust: -1 } }),
              io(["A cable to nothing", "En kabel till ingenting"], ["In a corridor, the team finds a network cable plugged into a live wall port and connected to nothing at the other end. It could be years old. It could be new.", "I en korridor hittar teamet en nätverkskabel som sitter i ett aktivt vägguttag och inte är kopplad till något i andra änden. Den kan vara flera år gammal. Den kan vara ny."], ["A live cable to nothing was found in a corridor; nobody knows why.", "En aktiv kabel utan något i andra änden hittades i en korridor; ingen vet varför."])
            ]),
            ir("i2", { notChosen: "A" }, ["The route is not walked", "Vägen gås inte"], [
              io(["Nothing reported", "Inget rapporterat"], ["Nobody on any floor reports anything unusual during the day. The room reads this as a sign that one box was all there was.", "Ingen på någon våning rapporterar något ovanligt under dagen. Rummet tolkar det som ett tecken på att det bara fanns en låda."], ["No one has reported anything unusual on any floor.", "Ingen har rapporterat något ovanligt på någon våning."]),
              io(["Rooms rearranged", "Rummen möbleras om"], ["The rooms on the visitor's likely route are cleaned and their furniture moved for the afternoon's meetings. Whatever the visitor left as they were, nobody saw it first.", "Rummen längs besökarens troliga väg städas och möbleras om inför eftermiddagens möten. Det som besökaren lämnade som det var fick ingen se först."], ["Rooms on the visitor's likely route were cleaned and rearranged.", "Rummen längs besökarens troliga väg städades och möblerades om."]),
              io(["The CEO asks why", "Vd frågar varför"], ["{{person.ceo.name}} asks why, hours after learning a stranger walked through the building, nobody is searching it. The CEO wants an answer within the hour.", "{{person.ceo.name}} frågar varför ingen genomsöker byggnaden, flera timmar efter att ni fick veta att en främling gick genom den. Vd vill ha ett svar inom en timme."], ["The CEO has demanded to know why nobody is searching the building.", "Vd har krävt att få veta varför ingen genomsöker byggnaden."], { reopen: true })
            ])
          ]
        }),
        facilitator: fac(
          ["Thirty-nine minutes is long enough for more than one box.", "Trettionio minuter räcker för mer än en låda."],
          ["Footage preserved, route walked, full sweep.", "Inspelningar säkrade, vägen gången, fullständig genomsökning."],
          [["Ask: what would you carry in a toolbox?", "Fråga: vad skulle ni bära i en verktygslåda?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 480,
        title: L(["What it caught", "Vad den fångade"]),
        twist: L(["The box was not only watching. It answered login requests on the network and collected password hashes; one administrator password was cracked and used to open the HR file share. A second box is found in a meeting room.", "Lådan bara iakttog inte. Den besvarade inloggningsförfrågningar i nätverket och samlade in lösenordshashar; ett administratörslösenord knäcktes och användes för att öppna HR:s filutdelning. En andra låda hittas i ett mötesrum."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "A second box has turned up in a meeting room. Whoever leads this now answers to IT, facilities and the police at once.", sv: "En andra låda har dykt upp i ett mötesrum. Den som leder arbetet svarar nu inför IT, fastighet och polisen på en gång." } },
        assumptionChallenged: L(["It only mapped the network.", "Den kartlade bara nätverket."]),
        reveals: ["hf-second"],
        narrative: L([
          "{{time.T+480|clock}}. The forensic team has made a copy of the box's storage and gone through it. Meanwhile, a sweep team is walking through every room of the office.\n\nUntil now, the box has been treated as a spy: something that listened. The analysis shows whether it only listened, and the sweep shows whether it was alone.",
          "Klockan {{time.T+480|clock}}. Forensikteamet har kopierat lådans lagring och gått igenom den. Samtidigt går ett sökteam igenom varje rum på kontoret.\n\nHittills har lådan behandlats som en spion: något som lyssnade. Analysen visar om den bara lyssnade, och genomsökningen visar om den var ensam."
        ]),
        injects: [
          inj("i4-1", 480, "forensicFinding", "forensics", "critical", "confirmed", [
            "Tools on the box impersonate network services to collect login attempts. {{num.hashesCaptured}} password hashes collected; one administrator account cracked. That account read the HR share two days ago.",
            "Verktygen på lådan utger sig för att vara nätverkstjänster för att samla in inloggningsförsök. {{num.hashesCaptured}} lösenordshashar insamlade; ett administratörskonto knäckt. Det kontot läste HR-utdelningen för två dagar sedan."
          ], { tests: ["lo3"] }),
          inj("i4-2", 510, "employeeReport", "facilities", "high", "confirmed", [
            "Sweep team: a second box, identical, under the table in meeting room 3, behind the screen's power strip.",
            "Genomsökningen: en andra låda, likadan, under bordet i mötesrum 3, bakom skärmens grenuttag."
          ], { reveals: ["hf-second"], tests: ["lo2"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["What the boxes did", "Vad lådorna gjorde"]),
          data: kpi([
            { id: "days", label: ["Days on the network", "Dagar i nätverket"], value: (v) => v.daysActive, tone: "warn" },
            { id: "hosts", label: ["Internal hosts contacted", "Interna värdar kontaktade"], value: (v) => v.hostsScanned, tone: "warn" },
            { id: "hashes", label: ["Password hashes collected", "Insamlade lösenordshashar"], value: (v) => v.hashesCaptured, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("Which accounts need new passwords, and in what order?", "Vilka konton behöver nya lösenord, och i vilken ordning?", ["itOps", "ciso"]),
            q("How do you stop the network from answering such requests at all?", "Hur stoppar ni nätverket från att alls besvara sådana förfrågningar?", ["networkLead"]),
            q("Did the sweep plan find everything, or did you get lucky?", "Hittade genomsökningen allt, eller hade ni tur?", ["securityOfficer"], "d3")
          ],
          executive: [
            q("HR files were read. What is in them, and whose data is it?", "HR-filerna lästes. Vad finns i dem, och vems uppgifter är det?", ["hr", "dpo"]),
            q("Do you notify {{reg.dpaShort}}?", "Anmäler ni till {{reg.dpaShort}}?", ["dpo", "legal"]),
            q("Given the HR data, would you still have waited for the police?", "Med tanke på HR-uppgifterna, skulle ni fortfarande ha väntat på polisen?", ["incidentCommander"], "d3")
          ]
        },
        challenges: [ch("The administrator whose password was cracked uses the same password for the building's access-control system.", "Administratören vars lösenord knäcktes använder samma lösenord till byggnadens passersystem.")],
        decision: dec("d4", "ciso", ["How do you clean up the credentials?", "Hur städar ni upp inloggningsuppgifterna?"], [
          ["Reset every captured account, starting with administrators and the access-control system, and notify the DPA about the HR files.", "Återställ varje fångat konto, med början i administratörer och passersystemet, och anmäl HR-filerna till dataskyddsmyndigheten."],
          ["Reset the cracked administrator account only.", "Återställ bara det knäckta administratörskontot."],
          ["Force a company-wide password change tonight, before you know exactly which accounts were captured.", "Tvinga fram ett lösenordsbyte för hela företaget i kväll, innan ni vet exakt vilka konton som fångades."]
        ], {
          knowns: [["One admin account was cracked and used.", "Ett administratörskonto knäcktes och användes."]],
          uncertainties: [["Which other hashes are being cracked right now.", "Vilka andra hashar som knäcks just nu."]],
          tradeoffs: {
            operational: ["Mass resets lock people out on a busy day.", "Massåterställningar låser ute folk en hektisk dag."],
            security: ["Every collected hash is a password being cracked.", "Varje insamlad hash är ett lösenord som håller på att knäckas."],
            legal: ["HR data includes health and union information.", "HR-uppgifter innehåller uppgifter om hälsa och fackmedlemskap."],
            reputational: ["Staff whose files were read deserve to hear it from you.", "Personal vars filer lästes förtjänar att få höra det av er."]
          },
          evaluation: [["Treats every collected hash as compromised", "Behandlar varje insamlad hash som komprometterad"]],
          pushback: {
            A: [
              pb(["Payroll runs tomorrow", "Lönekörningen är i morgon"], ["Among the captured accounts are service accounts behind tomorrow's payroll run. Resetting them tonight means updating systems nobody has touched in years, with no time to test. Do you reset now and risk pay day, or leave them for a day?", "Bland de fångade kontona finns tjänstekonton bakom morgondagens lönekörning. Att återställa dem i kväll innebär att uppdatera system som ingen har rört på flera år, utan tid att testa. Återställer ni nu och riskerar lönen, eller låter ni dem vara ett dygn?"]),
              pb(["Staff before the regulator", "Personalen före myndigheten"], ["HR asks to tell the staff whose files were read before the DPA hears about it, and the union wants a list of names today. Nobody yet knows exactly which files were opened. Who hears first, and what can you actually tell them?", "HR vill informera personalen vars filer lästes innan dataskyddsmyndigheten får veta, och facket vill ha en namnlista i dag. Ingen vet ännu exakt vilka filer som öppnades. Vem får veta först, och vad kan ni faktiskt säga?"]),
              pb(["The second box's list", "Den andra lådans lista"], ["Your reset list comes from the first box. The second box has not been analysed yet, and it sat on a different part of the network. “Every captured account” may be half the list. Do you reset now, or wait for the second analysis?", "Er lista för återställning kommer från den första lådan. Den andra lådan har inte analyserats än, och den satt i en annan del av nätverket. ”Varje fångat konto” kan vara halva listan. Återställer ni nu, eller väntar ni på den andra analysen?"])
            ],
            B: [
              pb(["Cracking continues", "Knäckandet fortsätter"], ["Forensics flags a second administrator hash in the collection with a short, simple password. Whoever cracked the first may already have this one. You reset one account out of {{num.hashesCaptured}}. Why that one only?", "Forensikerna pekar ut ytterligare en administratörshash i samlingen med ett kort, enkelt lösenord. Den som knäckte den första kan redan ha den här. Ni återställde ett konto av {{num.hashesCaptured}}. Varför bara det?"]),
              pb(["Same password, other doors", "Samma lösenord, andra dörrar"], ["The administrator account now has a new password, but the access-control system still accepts the old one. Resetting the network account did nothing for the doors. Do you widen the reset, or accept that the building is still open?", "Administratörskontot har nu ett nytt lösenord, men passersystemet accepterar fortfarande det gamla. Att återställa nätverkskontot gjorde ingenting för dörrarna. Utvidgar ni återställningen, eller accepterar ni att byggnaden fortfarande står öppen?"]),
              pb(["The DPO objects", "Dataskyddsombudet protesterar"], ["The DPO points out that resetting one password does nothing about the HR files that were already read, and your plan does not mention notification. Health and union data are in those files. Who decides not to notify, and on what basis?", "Dataskyddsombudet påpekar att ett nytt lösenord inte gör något åt HR-filerna som redan har lästs, och er plan nämner ingen anmälan. Uppgifter om hälsa och fackmedlemskap finns i de filerna. Vem beslutar att inte anmäla, och på vilka grunder?"])
            ],
            C: [
              pb(["The accounts that matter most", "Kontona som betyder mest"], ["A company-wide password change reaches staff accounts, but not service accounts, local administrator accounts or the access-control system, which is where the real risk sits. Everyone changes a password; the attacker keeps the keys. Is that the reset you meant?", "Ett lösenordsbyte för hela företaget når personalens konton, men inte tjänstekonton, lokala administratörskonton eller passersystemet, där den verkliga risken finns. Alla byter lösenord; angriparen behåller nycklarna. Är det den återställning ni menade?"]),
              pb(["Tomorrow's queue", "Morgondagens kö"], ["Staff on leave, travelling or working remotely cannot change their passwords tonight. The service desk expects hundreds of calls at opening time and has four people. Who answers them, and how do you verify callers who say they are locked out?", "Personal som är ledig, på resa eller arbetar på distans kan inte byta lösenord i kväll. Servicedesken räknar med hundratals samtal när den öppnar och har fyra personer. Vem svarar, och hur kontrollerar ni att den som säger sig vara utelåst är den hen säger?"]),
              pb(["“Why are we doing this?”", "”Varför gör vi det här?”"], ["A forced change for everyone tells the whole company that something happened, tonight. Staff will ask why, and some of them are the people whose HR files were read. What do you tell them, and in which order?", "Ett tvingat byte för alla talar om för hela företaget att något har hänt, i kväll. Personalen kommer att fråga varför, och några av dem är just de vars HR-filer lästes. Vad säger ni till dem, och i vilken ordning?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The wide reset", "Den breda återställningen"], [
              io(["The old password is refused", "Det gamla lösenordet nekas"], ["An hour after the reset, the access-control system logs a sign-in attempt with the old administrator password. It is refused. The reset closed a door someone was still trying.", "En timme efter återställningen loggar passersystemet ett inloggningsförsök med det gamla administratörslösenordet. Det nekas. Återställningen stängde en dörr som någon fortfarande försökte öppna."], ["The old admin password was tried after the reset and refused.", "Det gamla administratörslösenordet provades efter återställningen och nekades."]),
              io(["Payroll test fails", "Lönetestet fallerar"], ["A reset service account sits behind tomorrow's payroll run, and the test run fails. Finance asks whether staff will be paid on time.", "Ett återställt tjänstekonto ligger bakom morgondagens lönekörning, och testkörningen fallerar. Ekonomi frågar om personalen får lön i tid."], ["The payroll test run failed after a service-account reset.", "Testkörningen av lönerna fallerade efter att ett tjänstekonto återställts."]),
              io(["Was health data in it?", "Fanns hälsouppgifter med?"], ["{{reg.dpaShort}} acknowledges the notification and asks one question: did the files read include health data? Nobody can answer yet, and the answer changes everything that follows.", "{{reg.dpaShort}} bekräftar anmälan och ställer en fråga: innehöll filerna som lästes uppgifter om hälsa? Ingen kan svara än, och svaret påverkar allt som följer."], ["{{reg.dpaShort}} asked whether health data was in the files read.", "{{reg.dpaShort}} har frågat om hälsouppgifter fanns i filerna som lästes."], { meters: { regulator: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["Hashes still out there", "Hasharna finns kvar där ute"], [
              io(["The doors still trust it", "Dörrarna litar fortfarande på det"], ["A check shows the building's access-control system still accepts the cracked administrator password. Whoever holds it can still manage the doors.", "En kontroll visar att byggnadens passersystem fortfarande accepterar det knäckta administratörslösenordet. Den som har det kan fortfarande styra dörrarna."], ["The access-control system still accepts the cracked admin password.", "Passersystemet accepterar fortfarande det knäckta administratörslösenordet."], { reopen: true }),
              io(["A quiet night", "En lugn natt"], ["The overnight logs show no unusual sign-ins anywhere. The room starts to feel that the reset you chose was enough.", "Nattens loggar visar inga ovanliga inloggningar någonstans. Rummet börjar känna att återställningen ni valde räckte."], ["No unusual sign-ins were seen overnight.", "Inga ovanliga inloggningar syntes under natten."]),
              io(["The union asks", "Facket frågar"], ["A union representative asks whether members' HR files were read, and why nobody has told them. They have heard it from someone in IT.", "En facklig företrädare frågar om medlemmarnas HR-filer har lästs, och varför ingen har sagt något. De har hört det från någon på IT."], ["The union has asked whether members' HR files were read.", "Facket har frågat om medlemmarnas HR-filer har lästs."])
            ])
          ]
        }),
        facilitator: fac(
          ["A device on the inside turns into a credential harvester; the HR read makes it a personal-data breach.", "En enhet på insidan blir en insamlare av inloggningsuppgifter; läsningen av HR-filerna gör det till en personuppgiftsincident."],
          ["Broad resets including the access-control system; DPA notified; affected staff told.", "Breda återställningar inklusive passersystemet; dataskyddsmyndigheten anmäld; berörd personal informerad."],
          [["Ask: which of your systems trusts that same admin password?", "Fråga: vilka av era system litar på samma administratörslösenord?"]]
        )
      },
      {
        id: "p5",
        clock: 1440,
        priority: 2,
        title: L(["Whose job was it?", "Vems jobb var det?"]),
        twist: L(["Reception and the staff entrance are run by an outsourced facilities company. Their contract says nothing about tailgating, network ports or reporting suspicious objects.", "Receptionen och personalingången sköts av ett anlitat fastighetsföretag. Deras avtal säger ingenting om medföljande obehöriga, nätverksuttag eller rapportering av misstänkta föremål."]),
        twistKind: "authority",
        assumptionChallenged: L(["Physical security is handled by the facilities company.", "Den fysiska säkerheten sköts av fastighetsföretaget."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}. The immediate technical response is under way. The question now is how a stranger could walk in, plant devices and leave twice without anyone stopping them.\n\n{{person.supplierManager.name}} reads the contract with {{supplier.facilities}}, the company that runs reception and the staff entrance.",
          "{{time.T+1440|weekday|cap}}. Den akuta tekniska hanteringen pågår. Frågan nu är hur en främling kunde gå in, placera ut enheter och gå därifrån två gånger utan att någon stoppade hen.\n\n{{person.supplierManager.name}} läser avtalet med {{supplier.facilities}}, företaget som sköter receptionen och personalingången."
        ]),
        injects: [
          inj("i5-1", 1440, "supplierNotice", "supplier", "medium", "disputed", [
            "{{supplier.facilities}}: “Our staff are not security guards. Access control is the tenant's responsibility under the contract.”",
            "{{supplier.facilities}}: ”Vår personal är inte väktare. Passerkontroll är hyresgästens ansvar enligt avtalet.”"
          ], { facilitatorNote: ["Partly true: the contract is silent, which is the real finding.", "Delvis sant: avtalet är tyst, vilket är det verkliga fyndet."], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Which network ports in public areas need to be live at all?", "Vilka nätverksuttag i allmänna utrymmen behöver alls vara aktiva?", ["networkLead"]),
            q("How would you detect the next unknown device in minutes, not days?", "Hur skulle ni upptäcka nästa okända enhet inom minuter, inte dagar?", ["socLead"]),
            q("Did the credential clean-up reach the building systems?", "Nådde städningen av inloggningsuppgifter byggnadens system?", ["itOps"], "d4")
          ],
          executive: [
            q("Who owns physical security now, by name?", "Vem äger den fysiska säkerheten nu, med namn?", ["ceo", "securityOfficer"]),
            q("What changes in the facilities contract?", "Vad ändras i fastighetsavtalet?", ["supplierManager", "legal"]),
            q("Would you have notified differently if the HR files had been payroll data?", "Skulle ni ha anmält annorlunda om HR-filerna hade varit löneuppgifter?", ["dpo"], "d4")
          ]
        },
        challenges: [ch("The facilities company points out that your own staff held the door.", "Fastighetsföretaget påpekar att er egen personal höll upp dörren.")],
        noDecision: L(["No single decision here: let the room settle who owns physical security, and record it.", "Inget enskilt beslut här: låt rummet komma fram till vem som äger den fysiska säkerheten, och dokumentera det."]),
        facilitator: fac(
          ["Ownership gaps between tenant and contractor are the root of this incident.", "Ägarskapsluckor mellan hyresgäst och entreprenör är grunden till den här incidenten."],
          ["A named owner, contract changes and port control in public areas.", "En namngiven ägare, avtalsändringar och kontroll av uttag i allmänna utrymmen."],
          [["Ask: who would have stopped the vest at the door?", "Fråga: vem skulle ha stoppat västen vid dörren?"]]
        )
      },
      {
        id: "p6",
        clock: 2880,
        priority: 3,
        title: L(["Holding the door", "Att hålla upp dörren"]),
        twist: L(["The story spreads internally in a version where “two colleagues let a burglar in”. The two employees are on sick leave, and a local paper is asking.", "Historien sprids internt i en version där ”två kollegor släppte in en inbrottstjuv”. De två anställda är sjukskrivna, och en lokaltidning ställer frågor."]),
        twistKind: "impact",
        reconsider: { decision: "d4", pressure: { en: "The HR files were opened with a cracked administrator password. Was your reset wide enough, and was it fast enough?", sv: "HR-filerna öppnades med ett knäckt administratörslösenord. Var er återställning tillräckligt bred, och tillräckligt snabb?" } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because every captured account was reset, including access control, staff were locked out of the building for an hour this morning.", sv: "Eftersom varje fångat konto återställdes, även passersystemet, var personalen utelåst från byggnaden i en timme i morse." } }
        ],
        assumptionChallenged: L(["This is a technical incident with technical fixes.", "Det här är en teknisk incident med tekniska lösningar."]),
        narrative: L([
          "{{time.T+2880|weekday|cap}}. The devices are gone, the passwords changed and the investigation is with the police. Inside the office, a different story has taken hold.\n\n{{person.hr.name}} asks for a plan before the rumours settle into the version everyone remembers. Two colleagues are at the centre of that version, and a local journalist has started asking questions.",
          "{{time.T+2880|weekday|cap}}. Enheterna är borta, lösenorden bytta och utredningen ligger hos polisen. Inne på kontoret har en annan historia tagit form.\n\n{{person.hr.name}} vill ha en plan innan ryktena sätter sig i den version som alla kommer att minnas. Två kollegor står i centrum för den versionen, och en lokaljournalist har börjat ställa frågor."
        ]),
        injects: [
          inj("i6-1", 2880, "mediaEnquiry", "media", "medium", "confirmed", [
            "“We hear there was a break-in at {{org.name}} and that devices were found in the office. Can you confirm, and was any data stolen?”",
            "”Vi hör att det har varit ett inbrott hos {{org.name}} och att enheter hittades på kontoret. Kan ni bekräfta, och stals några uppgifter?”"
          ], { pressure: "media", substitute: { type: "employeeReport", source: "employee", content: ["“People are saying a burglar planted bugs and it's the fault of two people in finance. Is that true?”", "”Folk säger att en inbrottstjuv planterade buggar och att det är två personer på ekonomi som bär skulden. Stämmer det?”"] }, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What will make tailgating harder without making the building unpleasant?", "Vad gör det svårare att följa med in obehörigt utan att göra byggnaden obehaglig att vistas i?", ["securityOfficer", "facilities"]),
            q("How do you check the building regularly for unknown devices?", "Hur kontrollerar ni byggnaden regelbundet efter okända enheter?", ["securityOfficer"]),
            q("Looking back, did you reset enough accounts?", "I efterhand, återställde ni tillräckligt många konton?", ["ciso"], "d4")
          ],
          executive: [
            q("What do you say to the two employees, and to everyone else?", "Vad säger ni till de två anställda, och till alla andra?", ["hr", "ceo"]),
            q("How do you make challenging a stranger feel normal?", "Hur gör ni det normalt att fråga en främling vem hen är?", ["hr", "securityOfficer"]),
            q("Would you organise the response differently next time?", "Skulle ni organisera insatsen annorlunda nästa gång?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("A manager proposes disciplinary action against the two employees.", "En chef föreslår disciplinära åtgärder mot de två anställda.")],
        decision: dec("d5", "ceo", ["How do you close this with staff?", "Hur avslutar ni det här med personalen?"], [
          ["A no-blame message from the CEO, support for the two employees, and a simple rule: everyone badges in, everyone may ask.", "Ett budskap utan skuldbeläggning från vd, stöd till de två anställda och en enkel regel: alla passerar med kort, alla får fråga."],
          ["A strict new policy with sanctions for holding doors.", "En strikt ny policy med sanktioner för att hålla upp dörrar."],
          ["Say nothing more internally while the police investigate; any statement could reach the local paper.", "Säg inget mer internt medan polisen utreder; varje uttalande kan nå lokaltidningen."]
        ], {
          knowns: [["The employees were polite, not careless.", "De anställda var artiga, inte slarviga."]],
          uncertainties: [["Whether staff will report the next stranger.", "Om personalen kommer att rapportera nästa främling."]],
          tradeoffs: {
            operational: ["Badge rules slow everyone at the door.", "Passerregler gör alla långsammare vid dörren."],
            security: ["Fear of blame stops people reporting.", "Rädsla för skuld gör att folk slutar rapportera."],
            legal: ["Disciplinary action needs a rule that existed.", "Disciplinära åtgärder kräver en regel som fanns."],
            reputational: ["The press will ask who is to blame.", "Pressen kommer att fråga vem som bär skulden."]
          },
          evaluation: [["Changes the norm without punishing the people who were tricked", "Ändrar normen utan att straffa dem som blev lurade"]],
          pushback: {
            A: [
              pb(["“Nobody is responsible”", "”Ingen är ansvarig”"], ["The local paper asks whether anyone has been held responsible. Your no-blame message is quoted back as “nobody is responsible for the break-in”. How do you explain no blame without sounding like no accountability?", "Lokaltidningen frågar om någon har ställts till svars. Ert budskap utan skuldbeläggning citeras tillbaka som ”ingen är ansvarig för inbrottet”. Hur förklarar ni att ingen skuldbeläggs utan att det låter som att ingen tar ansvar?"]),
              pb(["The first week of asking", "Första veckan med frågor"], ["In the first week, staff challenge a real electrician, a courier refuses to wait, and visitors queue at reception. Reception asks whether the rule is worth the friction. Do you hold the line, or let it soften quietly?", "Den första veckan ifrågasätter personalen en riktig elektriker, ett bud vägrar vänta och besökare köar i receptionen. Receptionen frågar om regeln är värd friktionen. Står ni fast, eller låter ni den tyst mjukas upp?"]),
              pb(["The manager disagrees", "Chefen håller inte med"], ["The manager who wanted disciplinary action says no-blame sends the message that security rules are optional. Others in the management team nod. Do you overrule a manager in front of their own team, or soften the message?", "Chefen som ville ha disciplinära åtgärder säger att ingen skuldbeläggning signalerar att säkerhetsregler är frivilliga. Andra i ledningsgruppen nickar. Kör ni över en chef inför hens egen grupp, eller mildrar ni budskapet?"])
            ],
            B: [
              pb(["The union and the door", "Facket och dörren"], ["The union says sanctions for holding doors must be negotiated first, and points to a colleague in a wheelchair who depends on doors being held. The rule as written would punish helping them. Do you rewrite it, or defend it?", "Facket säger att sanktioner för att hålla upp dörrar måste förhandlas först, och pekar på en kollega i rullstol som är beroende av att dörrar hålls upp. Regeln som den är skriven skulle straffa den som hjälper. Skriver ni om den, eller försvarar ni den?"]),
              pb(["The report that never came", "Rapporten som aldrig kom"], ["A week later, a receptionist admits they noticed a stranger in the corridor but said nothing: they had held the door themselves and feared the sanction. Your rule just cost you a report. What is it really protecting?", "En vecka senare medger en receptionist att hen såg en främling i korridoren men sa ingenting: hen hade själv hållit upp dörren och var rädd för sanktionen. Er regel kostade er just en rapport. Vad skyddar den egentligen?"]),
              pb(["It reads as aimed at them", "Den läses som riktad mot dem"], ["The two employees on sick leave read the new policy as written about them, after the fact. HR says their return just got harder. Can you apply a strict rule from now on without it being heard as a verdict on them?", "De två sjukskrivna anställda läser den nya policyn som skriven om dem, i efterhand. HR säger att deras återgång just blev svårare. Kan ni tillämpa en strikt regel framåt utan att den uppfattas som en dom över dem?"])
            ],
            C: [
              pb(["The rumour becomes the truth", "Ryktet blir sanningen"], ["With nothing official to correct it, the version where “two colleagues let a burglar in” is now what everyone believes. The two employees hear only that version from home. How long can you stay silent before silence agrees with it?", "Utan något officiellt som rättar den har versionen där ”två kollegor släppte in en inbrottstjuv” blivit det alla tror. De två anställda hör bara den versionen hemifrån. Hur länge kan ni tiga innan tystnaden håller med?"]),
              pb(["The paper runs it anyway", "Tidningen publicerar ändå"], ["The local paper publishes based on anonymous staff, and your “no comment” is the last line of the article. Your silence is now part of the story. Did saying nothing protect the investigation, or just leave others to tell it?", "Lokaltidningen publicerar utifrån anonym personal, och ert ”inga kommentarer” är artikelns sista rad. Er tystnad är nu en del av historien. Skyddade det utredningen att inte säga något, eller lämnade det bara åt andra att berätta?"]),
              pb(["“What do I do next time?”", "”Vad gör jag nästa gång?”"], ["An employee asks the security officer: if someone in a vest follows them in tomorrow, are they allowed to ask, or will they be the next one in the story? Nobody has told them. What is the answer, and who gives it?", "En anställd frågar säkerhetschefen: om någon i väst följer efter hen in i morgon, får hen fråga, eller blir hen nästa person i historien? Ingen har sagt något. Vad är svaret, och vem ger det?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The no-blame message", "Budskapet utan skuld"], [
              io(["People start asking", "Folk börjar fråga"], ["Within two days, staff challenge three strangers in the corridors and report them. All three turn out to be legitimate, and all three were glad someone asked.", "Inom två dagar frågar personalen ut tre främlingar i korridorerna och rapporterar dem. Alla tre visar sig vara behöriga, och alla tre var glada att någon frågade."], ["Staff have started challenging and reporting strangers.", "Personalen har börjat fråga ut och rapportera främlingar."]),
              io(["“Nobody to blame”", "”Ingen bär skulden”"], ["The local paper quotes your message under the headline “Company says nobody to blame for break-in”. Readers ask whether anyone is in charge.", "Lokaltidningen citerar ert budskap under rubriken ”Företaget: ingen bär skulden för inbrottet”. Läsarna undrar om någon har ansvaret."], ["The local paper framed the message as “nobody to blame”.", "Lokaltidningen beskrev budskapet som att ”ingen bär skulden”."], { meters: { media: 1 } }),
              io(["One comes back", "En kommer tillbaka"], ["One of the two employees returns to work after reading the message. The other stays on sick leave and has not replied to HR.", "En av de två anställda återgår till arbetet efter att ha läst budskapet. Den andra är kvar i sjukskrivning och har inte svarat HR."], ["One of the two employees is back; the other is still on leave.", "En av de två anställda är tillbaka; den andra är fortfarande sjukskriven."])
            ]),
            ir("i2", { notChosen: "A" }, ["No word of support", "Inget stöd uttalat"], [
              io(["A formal grievance", "En formell anmälan"], ["One of the two employees files a formal grievance through the union: they say the company has let them carry the blame. HR asks for a different approach.", "En av de två anställda lämnar in en formell anmälan via facket: hen menar att företaget har låtit dem bära skulden. HR ber om ett annat förhållningssätt."], ["One of the two employees has filed a formal grievance.", "En av de två anställda har lämnat in en formell anmälan."], { reopen: true }),
              io(["It dies down", "Det lägger sig"], ["Within days, talk in the canteen moves on to other things. Some managers say this proves there was no need to say more.", "Inom några dagar handlar pratet i lunchrummet om annat. Vissa chefer säger att det bevisar att det inte behövdes sägas mer."], ["The rumours have quietened, for now.", "Ryktena har tystnat, åtminstone tills vidare."]),
              io(["The article runs", "Artikeln publiceras"], ["The local paper publishes its story, built on anonymous staff quotes. The two employees are not named, but everyone in the building knows who is meant.", "Lokaltidningen publicerar sin artikel, byggd på citat från anonym personal. De två anställda nämns inte vid namn, men alla i byggnaden vet vilka som avses."], ["The local paper published a story based on anonymous staff.", "Lokaltidningen har publicerat en artikel byggd på anonym personal."], { meters: { media: 1 } })
            ])
          ]
        }),
        facilitator: fac(
          ["Social engineering at the door works because people are kind. Punishment makes the next report less likely.", "Social manipulation vid dörren fungerar för att folk är vänliga. Straff gör nästa rapport mindre sannolik."],
          ["No-blame culture, support for the two employees, clear badge rules and permission to challenge.", "En kultur utan skuldbeläggning, stöd till de två anställda, tydliga passerregler och tillåtelse att fråga."],
          [["Ask: who reported the box in the first place, and how do you get more of that?", "Fråga: vem rapporterade lådan från början, och hur får ni mer av det?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Both devices are removed and the stolen credentials reset, but the HR files were read and the visitor is never identified.",
        "Båda enheterna tas bort och de stulna inloggningsuppgifterna återställs, men HR-filerna lästes och besökaren identifieras aldrig."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Isolate a suspicious device at the switch; do not pull its plug.", "Isolera en misstänkt enhet i switchen; dra inte ur dess kontakt."]),
        L(["Physical and cyber security need one lead when an incident crosses both.", "Fysisk säkerhet och cybersäkerhet behöver en ledning när en incident berör båda."]),
        L(["A device inside the network collects credentials: treat every captured hash as lost.", "En enhet inne i nätverket samlar in inloggningsuppgifter: behandla varje fångad hash som förlorad."]),
        L(["Tailgating is beaten by culture and design, not by blame.", "Medföljande obehöriga stoppas med kultur och utformning, inte med skuld."])
      ],
      assumptionsVsReality: [
        avr(["A vendor's monitoring box.", "En leverantörs övervakningslåda."], ["An attacker's computer with its own mobile link.", "En angripares dator med egen mobilanslutning."], "p2"),
        avr(["Badges keep strangers out.", "Passerkort håller främlingar ute."], ["Kindness let one in.", "Vänlighet släppte in en."], "p3"),
        avr(["It only watched.", "Den bara iakttog."], ["It harvested and used passwords.", "Den samlade in och använde lösenord."], "p4")
      ],
      strengthsToLookFor: [
        L(["Keeping the device intact for evidence", "Att hålla enheten intakt som bevis"]),
        L(["Sweeping the visitor's route quickly", "Att snabbt genomsöka besökarens väg"]),
        L(["Supporting the employees who held the door", "Att stötta de anställda som höll upp dörren"])
      ],
      commonGaps: [
        L(["Physical and IT teams working separately", "Att fysisk säkerhet och IT arbetar var för sig"]),
        L(["Live network ports in public areas", "Aktiva nätverksuttag i allmänna utrymmen"]),
        L(["Blaming staff for social engineering", "Att skylla på personalen för social manipulation"])
      ],
      suggestedActions: [
        act(["Disable network ports in public areas and require device authentication on the rest.", "Stäng av nätverksuttag i allmänna utrymmen och kräv enhetsautentisering på resten."], "networkLead", "high"),
        act(["Name an owner for physical security and add it to the facilities contract.", "Utse en ägare för den fysiska säkerheten och skriv in det i fastighetsavtalet."], "securityOfficer", "high"),
        act(["Alert on unknown devices appearing on the network.", "Larma när okända enheter dyker upp i nätverket."], "socLead", "medium"),
        act(["Run a no-blame campaign: everyone may ask a stranger who they are.", "Genomför en kampanj utan skuldbeläggning: alla får fråga en främling vem hen är."], "hr", "medium")
      ]
    }
  });
})();
