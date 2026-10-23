/*
 * s17-healthcare-ransomware.js — "Patients Still Arriving" (archetype A, healthcare).
 *
 * Obvious incident, hidden secondary: clinical systems encrypted and the
 * hospital falls back to paper → paper procedures strain and ambulance
 * redirection is on the table → the medical-device network is affected → the
 * way in was a device vendor's remote-support account → clinicians, police and
 * the region pull in different directions → patient data was taken → the
 * region overloads → restore order is a clinical decision → pressure to pay →
 * the long tail of recovery.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s17-healthcare-ransomware",
    version: 1,
    category: "healthcare",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "hospital",
    title: L(["Patients Still Arriving", "Patienterna fortsätter att komma"]),
    summary: L([
      "The electronic patient record goes dark in the middle of the night. The emergency department is full and ambulances are on their way. Paper is all you have.",
      "Den elektroniska patientjournalen slocknar mitt i natten. Akutmottagningen är full och ambulanser är på väg. Papper är allt ni har."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Keep patients safe on downtime procedures", "Hålla patienterna säkra med reservrutiner"]), teaser: L(["What matters most when it is real", "Vad som är viktigast när det är på riktigt"]) },
      { id: "lo2", text: L(["Decide on ambulance redirection with the region", "Besluta om omdirigering av ambulanser tillsammans med regionen"]), teaser: L(["Decisions shared with others", "Beslut som delas med andra"]) },
      { id: "lo3", text: L(["Balance patient safety with forensic preservation", "Väga patientsäkerhet mot säkring av spår"]), teaser: L(["Two good aims pulling apart", "Två goda mål som drar åt olika håll"]) },
      { id: "lo4", text: L(["Prioritise recovery by clinical need", "Prioritera återställningen efter kliniskt behov"]), teaser: L(["Choosing what comes first", "Att välja vad som kommer först"]) }
    ],
    mitre: ["T1486", "T1133", "T1078", "T1021", "T1490", "T1041", "T1657"],
    frameworks: {
      nistCsf: ["GV.SC", "GV.RR", "ID.AM", "PR.AA", "RS.MA", "RS.CO", "RS.MI", "RC.RP", "RC.CO"],
      iso27001: ["A.5.19", "A.5.24", "A.5.26", "A.5.29", "A.5.30", "A.5.34", "A.8.13", "A.8.20", "A.8.22"]
    },
    minStages: 5,
    maxStages: 10,
    constraints: { startWindow: "night", sectors: ["healthcare"] },
    actor: { types: ["criminal"], motivation: L(["Financial: extortion of a hospital that cannot wait", "Ekonomisk: utpressning av ett sjukhus som inte kan vänta"]), capability: "medium" },
    variables: {
      edPatients: { min: 18, max: 90, scaleBy: "size" },
      ambulancesHour: { min: 2, max: 12, scaleBy: "size" },
      devices: { min: 20, max: 400, scaleBy: "size" },
      records: { min: 20000, max: 900000, scaleBy: "size" },
      ransom: { min: 2000000, max: 60000000, step: 500000, scaleBy: "size", currency: true },
      postponed: { min: 40, max: 900, scaleBy: "size" },
      vendorDays: { min: 5, max: 30 }
    },
    roles: ["clinicalLead", "incidentCommander", "itOps", "ciso", "ceo", "comms", "dpo", "legal", "supplierManager", "networkLead", "socLead", "dutyOfficer"],

    groundTruth: {
      rootCause: L([
        "A criminal group used a medical-device vendor's always-on remote-support account, protected only by a password, to reach the hospital network {{num.vendorDays}} days ago. They copied patient data from a reporting database, then encrypted the patient-record servers and the device-management servers in the evening.",
        "En kriminell grupp använde ett ständigt öppet fjärrsupportkonto hos en leverantör av medicinteknisk utrustning, skyddat bara av ett lösenord, för att nå sjukhusets nätverk för {{num.vendorDays}} dagar sedan. De kopierade patientuppgifter från en rapportdatabas och krypterade sedan journalservrarna och servrarna för hantering av medicinteknisk utrustning under kvällen."
      ]),
      attackerTimeline: [
        { at: -43200, text: L(["Vendor remote-support account used from outside.", "Leverantörens fjärrsupportkonto används utifrån."]) },
        { at: -20160, text: L(["Patient data copied from the reporting database.", "Patientuppgifter kopieras från rapportdatabasen."]) },
        { at: -60, text: L(["Backups deleted where reachable.", "Säkerhetskopior raderas där de går att nå."]) },
        { at: 0, text: L(["Patient-record and device-management servers encrypted.", "Journalservrar och servrar för hantering av medicinteknisk utrustning krypteras."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-devices", revealStage: "p3", text: L(["The device-management servers for infusion pumps and imaging are encrypted too.", "Servrarna för hantering av infusionspumpar och bilddiagnostik är också krypterade."]) },
      { id: "hf-vendor", revealStage: "p4", text: L(["The attackers came in through a medical-device vendor's remote-support account.", "Angriparna kom in via ett fjärrsupportkonto hos en leverantör av medicinteknisk utrustning."]) },
      { id: "hf-exfil", revealStage: "p6", text: L(["Patient data was copied out weeks before the encryption.", "Patientuppgifter kopierades ut flera veckor före krypteringen."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["The record goes dark", "Journalen slocknar"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. At {{org.name}}, screens across the wards go dark one after another and show the same message. The electronic patient record, lab results and medication lists are gone from every computer.\n\nThe emergency department has {{num.edPatients}} patients and more ambulances on the way. Staff are pulling out the paper downtime folders, and the doctor in charge wants to know one thing: how long?",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. Hos {{org.name}} slocknar skärmarna på avdelningarna en efter en och visar samma meddelande. Den elektroniska patientjournalen, provsvaren och läkemedelslistorna är borta från varje dator.\n\nAkutmottagningen har {{num.edPatients}} patienter och fler ambulanser på väg. Personalen tar fram pärmarna med reservrutiner på papper, och ansvarig läkare vill veta en sak: hur länge?"
        ]),
        injects: [
          inj("i1-1", 0, "ransomNote", "attacker", "critical", "confirmed", [
            "“{{actor.name}}: your systems are encrypted ({{asset.ransomExt}}). Contact us at {{actor.contact}}. Lives depend on how fast you are.”",
            "”{{actor.name}}: era system är krypterade ({{asset.ransomExt}}). Kontakta oss på {{actor.contact}}. Liv hänger på hur snabba ni är.”"
          ], { headline: ["Patient record encrypted", "Patientjournalen krypterad"], tests: ["lo1"] }),
          inj("i1-2", 10, "impactReport", "person.clinicalLead", "critical", "confirmed", [
            "“We can't see medication lists, allergies or lab results. We're starting paper downtime procedures. I need to know: how long?”",
            "”Vi kan inte se läkemedelslistor, allergier eller provsvar. Vi startar reservrutinerna på papper. Jag behöver veta: hur länge?”"
          ], { tests: ["lo1"] }),
          inj("i1-3", 25, "chat", "itOps", "medium", "unverified", [
            "IT on call: “Some servers are still up. If we shut everything down now we might save them — but we'd also kill the systems that still work.”",
            "IT-beredskapen: ”Vissa servrar är fortfarande uppe. Om vi stänger ned allt nu kanske vi räddar dem – men då slår vi också ut de system som fortfarande fungerar.”"
          ], { statedReliability: ["On-call assessment", "Beredskapens bedömning"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c1-ed", type: "line", markers: "injects",
          title: L(["Patients waiting in the emergency department", "Patienter som väntar på akutmottagningen"]), unit: L(["patients", "patienter"]),
          data: line(["Waiting", "Väntande"], -120, 60, 15, (x, ctx) => ctx.vars.edPatients * (x < 0 ? 0.8 + x / 1200 : 1 + x / 180))
        }],
        questions: {
          technical: [
            q("What do you isolate first, and what stays on because patients need it?", "Vad isolerar ni först, och vad får vara på för att patienterna behöver det?", ["itOps", "networkLead"]),
            q("Which clinical systems still work?", "Vilka kliniska system fungerar fortfarande?", ["itOps", "clinicalLead"]),
            q("Are backups reachable from the network?", "Går säkerhetskopiorna att nå från nätverket?", ["itOps"])
          ],
          executive: [
            q("Who leads: the hospital's incident command or IT?", "Vem leder: sjukhusets ledning för särskild händelse eller IT?", ["incidentCommander", "clinicalLead"]),
            q("Do you declare a major incident?", "Larmar ni särskild händelse?", ["dutyOfficer", "clinicalLead"]),
            q("Who in the region needs to know tonight?", "Vilka i regionen behöver få veta det i natt?", ["dutyOfficer", "ceo"])
          ]
        },
        challenges: [ch("Paper procedures were last practised two years ago.", "Reservrutinerna på papper övades senast för två år sedan.")],
        decision: dec("d1", "incidentCommander", ["What do you do first?", "Vad gör ni först?"], [
          ["Declare a major incident, start downtime procedures and isolate the network in a controlled order with clinical input.", "Larma särskild händelse, starta reservrutinerna och isolera nätverket i en kontrollerad ordning med klinisk medverkan."],
          ["Shut down everything immediately.", "Stäng ned allt omedelbart."],
          ["Keep systems running and try to stop the encryption.", "Låt systemen vara igång och försök stoppa krypteringen."]
        ], {
          knowns: [["Patient records are encrypted.", "Patientjournalerna är krypterade."], ["The ED is full.", "Akutmottagningen är full."]],
          uncertainties: [["Which systems will still work in an hour.", "Vilka system som fortfarande fungerar om en timme."]],
          tradeoffs: {
            operational: ["Shutting everything down removes working clinical tools.", "Att stänga ned allt tar bort fungerande kliniska verktyg."],
            security: ["Keeping systems up lets encryption spread.", "Att hålla systemen igång låter krypteringen spridas."],
            legal: ["Patient safety is a legal duty.", "Patientsäkerhet är en lagstadgad skyldighet."],
            reputational: ["A hospital in crisis is national news.", "Ett sjukhus i kris blir riksnyheter."]
          },
          evaluation: [["Puts patients first in the containment order", "Sätter patienterna först i ordningen för begränsning"], ["Declares a major incident early", "Larmar särskild händelse tidigt"]],
          minutes: 10
        }),
        facilitator: fac(
          ["Clinical leadership must be in the room. If not, ask why.", "Den kliniska ledningen måste finnas i rummet. Om inte, fråga varför."],
          ["Major incident declared, paper procedures started and controlled isolation.", "Särskild händelse larmad, reservrutiner startade och kontrollerad isolering."],
          [["Ask: who decides what is switched off in a hospital?", "Fråga: vem bestämmer vad som stängs av på ett sjukhus?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["Paper is not enough", "Papper räcker inte"]),
        twist: L(["Paper procedures are slowing everything down. Lab results arrive by runner and the ED is backing up. Redirecting ambulances is on the table.", "Reservrutinerna på papper gör allt långsammare. Provsvar kommer med springpojke och akuten korkas igen. Omdirigering av ambulanser är på bordet."]),
        twistKind: "impact",
        assumptionChallenged: L(["Downtime procedures will carry us through.", "Reservrutinerna kommer att bära oss."]),
        narrative: L([
          "{{time.T+60|clock}}. The paper procedures are running, but every step takes longer: results are carried by hand, orders are written twice, and nobody can check a patient's history.\n\nThe emergency physician in charge calls the incident command. The question on the table is whether this hospital can still safely receive the ambulances that are coming.",
          "Klockan {{time.T+60|clock}}. Pappersrutinerna är igång, men varje steg tar längre tid: svar bärs för hand, ordinationer skrivs två gånger och ingen kan kontrollera en patients historik.\n\nAnsvarig akutläkare ringer incidentledningen. Frågan på bordet är om sjukhuset fortfarande kan ta emot de ambulanser som är på väg på ett säkert sätt."
        ]),
        injects: [
          inj("i2-1", 60, "phoneTranscript", "person.clinicalLead", "critical", "confirmed", [
            "“We receive about {{num.ambulancesHour}} ambulances an hour. Without lab and imaging results we can't treat them safely at this pace. I want ambulances redirected.”",
            "”Vi tar emot ungefär {{num.ambulancesHour}} ambulanser i timmen. Utan provsvar och röntgenbilder kan vi inte behandla dem säkert i den här takten. Jag vill att ambulanserna omdirigeras.”"
          ], { tests: ["lo2"] }),
          inj("i2-2", 80, "phoneTranscript", "regulator", "high", "confirmed", [
            "The regional duty officer: “The nearest other hospital is 40 minutes away and already busy. If you redirect, tell us now and for how long.”",
            "Regionens tjänsteman i beredskap: ”Närmaste andra sjukhus ligger 40 minuter bort och har redan mycket att göra. Om ni omdirigerar, säg det nu och för hur länge.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Can any results systems be restored separately and fast?", "Kan något system för provsvar återställas separat och snabbt?", ["itOps"]),
            q("Are lab and imaging machines working without the network?", "Fungerar lab- och röntgenutrustningen utan nätverket?", ["itOps", "clinicalLead"]),
            q("Did your isolation order protect the results systems?", "Skyddade er ordning för isoleringen systemen för provsvar?", ["networkLead"], "d1")
          ],
          executive: [
            q("Who has the authority to redirect ambulances?", "Vem har mandat att omdirigera ambulanser?", ["clinicalLead", "dutyOfficer"]),
            q("What does redirection mean for patients 40 minutes away?", "Vad innebär omdirigering för patienter 40 minuter bort?", ["clinicalLead"]),
            q("Was declaring a major incident the right call?", "Var det rätt att larma särskild händelse?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Redirecting stroke and heart patients 40 minutes costs lives too.", "Att omdirigera patienter med stroke och hjärtinfarkt 40 minuter kostar också liv.")],
        decision: dec("d2", "clinicalLead", ["Do you redirect ambulances?", "Omdirigerar ni ambulanser?"], [
          ["Redirect all but the most time-critical cases, agreed with the region and reviewed every two hours.", "Omdirigera alla utom de mest tidskritiska fallen, i samråd med regionen och med omprövning varannan timme."],
          ["Redirect all ambulances.", "Omdirigera alla ambulanser."],
          ["Keep receiving and add staff.", "Fortsätt ta emot och sätt in mer personal."]
        ], {
          knowns: [["The ED cannot keep pace safely.", "Akuten kan inte hålla takten på ett säkert sätt."], ["The nearest hospital is 40 minutes away.", "Närmaste sjukhus ligger 40 minuter bort."]],
          uncertainties: [["How long the outage will last.", "Hur länge avbrottet kommer att pågå."]],
          tradeoffs: {
            operational: ["Redirection moves the load to a busy neighbour.", "Omdirigering flyttar belastningen till en granne som redan har mycket att göra."],
            security: ["No direct security effect.", "Ingen direkt säkerhetspåverkan."],
            legal: ["Both choices carry patient-safety risk.", "Båda valen innebär risker för patientsäkerheten."],
            reputational: ["Redirection signals how serious this is.", "Omdirigering signalerar hur allvarligt det här är."]
          },
          evaluation: [["Makes a time-limited, coordinated decision", "Fattar ett tidsbegränsat och samordnat beslut"]],
          minutes: 10
        }),
        facilitator: fac(
          ["This is a clinical decision. IT should advise, not decide.", "Det här är ett kliniskt beslut. IT ska ge råd, inte besluta."],
          ["Selective, coordinated redirection with regular review.", "Selektiv och samordnad omdirigering med regelbunden omprövning."],
          [["Ask: what is the exception rule for time-critical patients?", "Fråga: vilken undantagsregel gäller för tidskritiska patienter?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 150,
        title: L(["The devices too", "Utrustningen också"]),
        twist: L(["The servers that manage infusion pumps and imaging are encrypted. {{num.devices}} devices can't receive drug libraries or send images.", "Servrarna som hanterar infusionspumpar och bilddiagnostik är krypterade. {{num.devices}} enheter kan inte ta emot läkemedelsbibliotek eller skicka bilder."]),
        twistKind: "scope",
        assumptionChallenged: L(["Only administrative and record systems are hit.", "Bara administrativa system och journalsystem är drabbade."]),
        reveals: ["hf-devices"],
        narrative: L([
          "{{time.T+150|clock}}. A biomedical engineer comes to the command room with a laptop and a worried face.\n\nUntil now the incident has been about the patient record and office systems. The engineer explains that medical devices also depend on servers in the same network, and some of those servers are now affected.",
          "Klockan {{time.T+150|clock}}. En medicinteknisk ingenjör kommer till ledningsrummet med en dator och en orolig min.\n\nHittills har incidenten handlat om journalen och kontorssystemen. Ingenjören förklarar att även medicintekniska apparater är beroende av servrar i samma nätverk, och en del av de servrarna är nu drabbade."
        ]),
        injects: [
          inj("i3-1", 150, "impactReport", "facilities", "critical", "confirmed", [
            "“The pump-management and imaging servers are encrypted. The pumps still run on their last settings, but we can't update drug libraries. New scans can't reach the radiologists.”",
            "”Servrarna för pumphantering och bilddiagnostik är krypterade. Pumparna går fortfarande på sina senaste inställningar, men vi kan inte uppdatera läkemedelsbiblioteken. Nya undersökningar når inte radiologerna.”"
          ], { headline: ["Medical-device servers encrypted", "Servrar för medicinteknik krypterade"], reveals: ["hf-devices"], tests: ["lo1"] })
        ],
        charts: [{
          id: "c3-deps", type: "blast",
          title: L(["What the encryption has reached", "Vad krypteringen har nått"]),
          data: () => ({
            center: { label: L(["Hospital network", "Sjukhusets nätverk"]), status: "compromised" },
            rings: [
              { label: L(["Records", "Journal"]), nodes: [{ label: L(["Patient record", "Patientjournal"]), status: "down" }, { label: L(["Lab results", "Provsvar"]), status: "degraded" }] },
              { label: L(["Devices", "Medicinteknik"]), nodes: [{ label: L(["Pump management", "Pumphantering"]), status: "down" }, { label: L(["Imaging archive", "Bildarkiv"]), status: "down" }] },
              { label: L(["Other", "Övrigt"]), nodes: [{ label: L(["Telephony", "Telefoni"]), status: "ok" }, { label: L(["Building systems", "Fastighetssystem"]), status: "unknown" }] }
            ]
          })
        }],
        questions: {
          technical: [
            q("Can the devices run safely in standalone mode, and for how long?", "Kan utrustningen köras säkert fristående, och hur länge?", ["clinicalLead", "itOps"]),
            q("Is the medical-device network separate from the rest?", "Är nätverket för medicinteknik åtskilt från resten?", ["networkLead"]),
            q("Did your isolation reach the device network in time?", "Nådde er isolering nätverket för medicinteknik i tid?", ["networkLead"], "d1")
          ],
          executive: [
            q("Which patients are at risk from devices without updates?", "Vilka patienter är i fara på grund av utrustning utan uppdateringar?", ["clinicalLead"]),
            q("Do you need the device vendors on site tonight?", "Behöver ni leverantörerna av medicinteknik på plats i natt?", ["supplierManager"]),
            q("Does redirection need to be widened?", "Behöver omdirigeringen utökas?", ["clinicalLead"], "d2")
          ]
        },
        challenges: [ch("Night-shift nurses don't know how to program the pumps manually.", "Sjuksköterskorna på nattskiftet vet inte hur pumparna programmeras manuellt.")],
        decision: dec("d3", "clinicalLead", ["How do you handle the devices?", "Hur hanterar ni utrustningen?"], [
          ["Run devices standalone with manual double-checks, call in biomedical staff and vendors, and widen redirection for imaging cases.", "Kör utrustningen fristående med manuella dubbelkontroller, kalla in medicintekniker och leverantörer och utöka omdirigeringen för fall som kräver bilddiagnostik."],
          ["Keep using devices as normal and fix the servers first.", "Fortsätt använda utrustningen som vanligt och åtgärda servrarna först."],
          ["Stop using affected devices.", "Sluta använda den drabbade utrustningen."]
        ], {
          knowns: [["Device management is down.", "Hanteringen av medicinteknik ligger nere."]],
          uncertainties: [["Whether any device itself is affected.", "Om någon enhet i sig är påverkad."]],
          tradeoffs: {
            operational: ["Manual checks are slow and need trained staff.", "Manuella kontroller är långsamma och kräver utbildad personal."],
            security: ["Devices on a compromised network need checking.", "Utrustning i ett komprometterat nätverk behöver kontrolleras."],
            legal: ["Medical-device safety is regulated.", "Säkerheten för medicinteknik är reglerad."],
            reputational: ["A device error would dominate the story.", "Ett fel i utrustningen skulle dominera berättelsen."]
          },
          evaluation: [["Uses manual safety checks rather than stopping care", "Använder manuella säkerhetskontroller i stället för att stoppa vården"]]
        }),
        facilitator: fac(
          ["The cyber incident now touches patients' bodies. Slow it down.", "Cyberincidenten berör nu patienternas kroppar. Sänk tempot."],
          ["Standalone devices with double-checks and expert support.", "Fristående utrustning med dubbelkontroller och expertstöd."],
          [["Ask: who can program a pump by hand tonight?", "Fråga: vem kan programmera en pump för hand i natt?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 300,
        title: L(["The vendor's door", "Leverantörens dörr"]),
        twist: L(["The attackers came in through a medical-device vendor's always-on remote-support account.", "Angriparna kom in via ett ständigt öppet fjärrsupportkonto hos en leverantör av medicinteknik."]),
        twistKind: "cause",
        assumptionChallenged: L(["A staff member clicked something.", "Någon i personalen klickade på något."]),
        reveals: ["hf-vendor"],
        narrative: L([
          "{{time.T+300|clock}}. The incident-response team has been tracing how the attackers first got into the hospital network, working backwards from the encrypted servers.\n\nThe trail leads not to a clicked email or a stolen staff password, but to an account that belongs to someone outside the hospital and is always switched on.",
          "Klockan {{time.T+300|clock}}. Incidentteamet har spårat hur angriparna först kom in i sjukhusets nätverk, bakåt från de krypterade servrarna.\n\nSpåret leder inte till ett klickat mejl eller ett stulet personallösenord, utan till ett konto som tillhör någon utanför sjukhuset och alltid är påslaget."
        ]),
        injects: [
          inj("i4-1", 300, "forensicFinding", "irRetainer", "critical", "confirmed", [
            "The first access, {{num.vendorDays}} days ago, used the remote-support account of {{supplier.vendor}} through {{asset.vpnGateway}}. The account is always on and has only a password.",
            "Den första åtkomsten, för {{num.vendorDays}} dagar sedan, använde fjärrsupportkontot för {{supplier.vendor}} via {{asset.vpnGateway}}. Kontot är alltid aktivt och har bara ett lösenord."
          ], { headline: ["Entry via vendor support account", "Intrång via leverantörens supportkonto"], reveals: ["hf-vendor"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Which other vendors have always-on access?", "Vilka andra leverantörer har ständigt öppen åtkomst?", ["networkLead", "supplierManager"]),
            q("What did the attackers do in {{num.vendorDays}} days?", "Vad gjorde angriparna under {{num.vendorDays}} dagar?", ["socLead"]),
            q("Did keeping the device vendors involved create risk?", "Skapade det en risk att involvera leverantörerna av medicinteknik?", ["supplierManager"], "d3")
          ],
          executive: [
            q("Do you cut off all vendor remote access tonight?", "Stänger ni av all fjärråtkomst för leverantörer i natt?", ["ciso", "supplierManager"]),
            q("What does that do to device support?", "Vad gör det med supporten för utrustningen?", ["clinicalLead", "supplierManager"]),
            q("Does this change your view of the first isolation order?", "Ändrar det här er syn på den första ordningen för isoleringen?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Several device vendors need remote access to keep critical equipment supported.", "Flera leverantörer av medicinteknik behöver fjärråtkomst för att kunna ge support till kritisk utrustning.")],
        decision: dec("d4", "ciso", ["What do you do with vendor access?", "Vad gör ni med leverantörernas åtkomst?"], [
          ["Cut all vendor remote access; allow it back case by case, supervised and time-limited.", "Stäng all fjärråtkomst för leverantörer; tillåt den igen från fall till fall, övervakad och tidsbegränsad."],
          ["Disable this vendor's account only.", "Spärra bara den här leverantörens konto."],
          ["Keep vendor access for device support.", "Behåll leverantörernas åtkomst för support av utrustningen."]
        ], {
          knowns: [["A vendor account was the way in.", "Ett leverantörskonto var vägen in."]],
          uncertainties: [["Whether other vendor accounts were used.", "Om andra leverantörskonton har använts."]],
          tradeoffs: {
            operational: ["Device support gets slower.", "Supporten för utrustningen blir långsammare."],
            security: ["Always-on vendor access is an open door.", "Ständigt öppen leverantörsåtkomst är en öppen dörr."],
            legal: ["Vendor contracts may not cover this.", "Leverantörsavtalen kanske inte täcker det här."],
            reputational: ["An open door into a hospital is indefensible.", "En öppen dörr in till ett sjukhus går inte att försvara."]
          },
          evaluation: [["Closes vendor access and reopens it under control", "Stänger leverantörsåtkomsten och öppnar den igen under kontroll"]]
        }),
        facilitator: fac(
          ["Healthcare is full of vendor access. This is the structural lesson.", "Vården är full av leverantörsåtkomst. Det här är den strukturella lärdomen."],
          ["All vendor access cut, then supervised and time-limited.", "All leverantörsåtkomst stängd, därefter övervakad och tidsbegränsad."],
          [["Ask: how many vendors can reach your network right now?", "Fråga: hur många leverantörer kan nå ert nätverk just nu?"]]
        )
      },
      {
        id: "p5",
        mandatory: true,
        clock: 480,
        title: L(["Restore now or preserve?", "Återställa nu eller säkra?"]),
        twist: L(["Clinicians want the record restored immediately. The police and forensics want the servers preserved. The region wants a say in both.", "Klinikerna vill att journalen återställs omedelbart. Polisen och forensikerna vill att servrarna bevaras. Regionen vill ha ett ord med i båda."]),
        twistKind: "authority",
        assumptionChallenged: L(["One person can decide how the hospital recovers.", "En person kan bestämma hur sjukhuset återhämtar sig."]),
        narrative: L([
          "{{time.T+480|clock}}. A rebuild of the patient record is possible, but the servers it runs on are also the best evidence of what happened.\n\nThree parties each have a legitimate demand: clinicians, the police and the region. The demands cannot all be met at the same time, and someone has to decide.",
          "Klockan {{time.T+480|clock}}. Det går att bygga upp journalsystemet igen, men servrarna det körs på är också det bästa beviset på vad som hände.\n\nTre parter har var sitt legitimt krav: vårdpersonalen, polisen och regionen. Kraven kan inte uppfyllas samtidigt, och någon måste besluta."
        ]),
        injects: [
          inj("i5-1", 480, "phoneTranscript", "police", "high", "confirmed", [
            "{{reg.police|cap}}: “Please preserve images of the encrypted servers before you wipe them. They may be needed to identify the group.”",
            "{{reg.police|cap}}: ”Säkra avbilder av de krypterade servrarna innan ni raderar dem. De kan behövas för att identifiera gruppen.”"
          ], { pressure: "lawEnforcement", substitute: { source: "irRetainer", content: ["Your response partner advises imaging the encrypted servers before wiping, to understand what happened.", "Er incidentpartner rekommenderar att de krypterade servrarna avbildas innan de raderas, för att förstå vad som hände."] }, tests: ["lo3"] }),
          inj("i5-2", 500, "executiveMessage", "person.clinicalLead", "critical", "confirmed", [
            "“Every hour without the record is a patient-safety risk. I need it back, not preserved.”",
            "”Varje timme utan journalen är en risk för patientsäkerheten. Jag behöver få tillbaka den, inte få den bevarad.”"
          ], { tests: ["lo3", "lo4"] })
        ],
        questions: {
          technical: [
            q("Can you image and restore in parallel?", "Kan ni avbilda och återställa parallellt?", ["itOps", "socLead"]),
            q("Is there a clean backup of the record?", "Finns det en ren säkerhetskopia av journalen?", ["itOps"]),
            q("Did cutting vendor access secure the restore path?", "Säkrade stängningen av leverantörsåtkomsten vägen för återställningen?", ["networkLead"], "d4")
          ],
          executive: [
            q("Who decides when evidence and patient care conflict?", "Vem beslutar när spår och patientvård står i konflikt?", ["ceo", "incidentCommander"]),
            q("What does the region need from you?", "Vad behöver regionen från er?", ["dutyOfficer"]),
            q("Is redirection still needed?", "Behövs omdirigeringen fortfarande?", ["clinicalLead"], "d2")
          ]
        },
        challenges: [ch("Imaging the record servers takes six hours.", "Att avbilda journalservrarna tar sex timmar.")],
        decision: dec("d5", "ceo", ["What do you do with the record servers?", "Vad gör ni med journalservrarna?"], [
          ["Restore the record on new hardware from a clean backup while imaging the originals in parallel.", "Återställ journalen på ny hårdvara från en ren säkerhetskopia och avbilda samtidigt originalen."],
          ["Image first, then restore.", "Avbilda först och återställ sedan."],
          ["Restore on the same servers now.", "Återställ på samma servrar nu."]
        ], {
          knowns: [["Patients need the record.", "Patienterna behöver journalen."], ["The police want evidence.", "Polisen vill ha spår."]],
          uncertainties: [["Whether new hardware is available.", "Om ny hårdvara finns tillgänglig."]],
          tradeoffs: {
            operational: ["Parallel work needs more people and hardware.", "Parallellt arbete kräver fler personer och mer hårdvara."],
            security: ["Restoring on the same servers destroys evidence and may reinfect.", "Att återställa på samma servrar förstör spår och kan leda till ny infektion."],
            legal: ["Patient safety outranks evidence, but both matter.", "Patientsäkerheten väger tyngre än spåren, men båda spelar roll."],
            reputational: ["A slow restore at a hospital will be questioned.", "En långsam återställning på ett sjukhus kommer att ifrågasättas."]
          },
          evaluation: [["Finds a way to serve both patient safety and evidence", "Hittar ett sätt att tillgodose både patientsäkerhet och spår"]],
          minutes: 10
        }),
        facilitator: fac(
          ["The core dilemma of the scenario. Push for creative, parallel answers.", "Scenariots centrala dilemma. Driv på för kreativa, parallella svar."],
          ["Clean restore on new hardware with parallel imaging.", "Ren återställning på ny hårdvara med parallell avbildning."],
          [["Ask: is this really either/or?", "Fråga: är det här verkligen antingen eller?"]]
        )
      },
      {
        id: "p6",
        priority: 1,
        clock: 1440,
        title: L(["Patient data taken", "Patientuppgifter tagna"]),
        twist: L(["The group posts samples of patient records. Data was copied out weeks ago.", "Gruppen publicerar prov på patientjournaler. Uppgifterna kopierades ut för flera veckor sedan."]),
        twistKind: "scope",
        assumptionChallenged: L(["This was only about availability.", "Det här handlade bara om tillgänglighet."]),
        reveals: ["hf-exfil"],
        narrative: L([
          "The next day. The patient record is partly back, and the wards are slowly catching up. Staff are exhausted but relieved.\n\nThen the attackers' leak site updates. The incident changes from a hospital that could not work to patients whose most private information may become public.",
          "Nästa dag. Patientjournalen är delvis tillbaka och avdelningarna kommer sakta ikapp. Personalen är utmattad men lättad.\n\nSedan uppdateras angriparnas läcksajt. Incidenten förvandlas från ett sjukhus som inte kunde arbeta till patienter vars mest privata uppgifter kan bli offentliga."
        ]),
        injects: [
          inj("i6-1", 1440, "socialPost", "attacker", "critical", "confirmed", [
            "{{actor.name}}'s leak site lists {{org.name}} with screenshots of patient records and claims {{num.records}} records. “Pay, or everyone sees.”",
            "Läckagesajten för {{actor.name}} listar {{org.name}} med skärmbilder av patientjournaler och påstår sig ha {{num.records}} journaler. ”Betala, annars får alla se.”"
          ], { headline: ["Patient records on a leak site", "Patientjournaler på en läckagesajt"], reveals: ["hf-exfil"], tests: ["lo3"] }),
          inj("i6-2", 1470, "mediaEnquiry", "media", "high", "confirmed", [
            "A national newspaper: “Are patients' medical records being published? What are you doing to protect them?”",
            "En rikstäckande tidning: ”Publiceras patienters journaler? Vad gör ni för att skydda dem?”"
          ], { pressure: "media", substitute: { source: "customer", content: ["Patients and relatives flood the switchboard asking whether their records have leaked.", "Patienter och anhöriga ringer växeln i stor mängd och frågar om deras journaler har läckt."] }, tests: ["lo3"] })
        ],
        charts: [{
          id: "c6-kpi", type: "kpi",
          title: L(["The incident in numbers", "Incidenten i siffror"]),
          data: kpi([
            { id: "records", label: ["Patient records claimed", "Påstått antal patientjournaler"], value: (v) => v.records, tone: "danger" },
            { id: "devices", label: ["Devices without management", "Enheter utan hantering"], value: (v) => v.devices, tone: "warn" },
            { id: "ransom", label: ["Demand", "Krav"], value: (v) => v.ransom, format: "currency", tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("Which database was copied, and what does it hold?", "Vilken databas kopierades, och vad innehåller den?", ["socLead", "itOps"]),
            q("Can you confirm the number of records?", "Kan ni bekräfta antalet journaler?", ["socLead"]),
            q("Did your parallel imaging help establish the copy?", "Hjälpte er parallella avbildning till att fastställa kopieringen?", ["socLead"], "d5")
          ],
          executive: [
            q("When do you report to {{reg.dpaShort}}, and what do you tell patients?", "När anmäler ni till {{reg.dpaShort}}, och vad säger ni till patienterna?", ["dpo", "legal"]),
            q("Does the leak change your view on paying?", "Ändrar läckan er syn på att betala?", ["ceo", "legal"]),
            q("Did your restore choice leave you in a better position now?", "Lämnade ert val av återställning er i ett bättre läge nu?", ["ceo"], "d5")
          ]
        },
        challenges: [ch("Some records are of public figures.", "En del journaler tillhör offentliga personer.")],
        decision: dec("d6", "ceo", ["How do you respond to the leak?", "Hur hanterar ni läckan?"], [
          ["Report to {{reg.dpaShort}}, inform patients openly, open a helpline and refuse to pay.", "Anmäl till {{reg.dpaShort}}, informera patienterna öppet, öppna en stödlinje och vägra betala."],
          ["Report, and wait to inform patients until the data is confirmed.", "Anmäl, och vänta med att informera patienterna tills uppgifterna är bekräftade."],
          ["Consider paying to prevent publication.", "Överväg att betala för att förhindra publicering."]
        ], {
          knowns: [["Patient data was copied.", "Patientuppgifter har kopierats."]],
          uncertainties: [["Exactly how many records.", "Exakt hur många journaler."]],
          tradeoffs: {
            operational: ["A helpline needs staff during a crisis.", "En stödlinje kräver personal mitt i en kris."],
            security: ["Payment does not guarantee deletion.", "En betalning garanterar inte att uppgifterna raderas."],
            legal: ["Health data breaches have strict reporting rules.", "Intrång i hälsouppgifter har strikta anmälningsregler."],
            reputational: ["Patients judge you on honesty.", "Patienterna dömer er efter ärligheten."]
          },
          evaluation: [["Reports promptly and supports patients", "Anmäler snabbt och stöttar patienterna"]]
        }),
        facilitator: fac(
          ["Double extortion of a hospital. Watch the ethics conversation.", "Dubbel utpressning av ett sjukhus. Följ samtalet om etik."],
          ["Prompt report, open patient communication and support.", "Snabb anmälan, öppen kommunikation med patienterna och stöd."],
          [["Ask: what would you want to be told as a patient?", "Fråga: vad skulle ni vilja få veta om ni var patient?"]]
        )
      },
      {
        id: "p7",
        priority: 2,
        clock: 2160,
        title: L(["The region overloads", "Regionen överbelastas"]),
        twist: L(["The neighbouring hospital is at capacity because of your redirection. The region asks you to take patients back — before you're ready.", "Grannsjukhuset är fullt på grund av er omdirigering. Regionen ber er ta tillbaka patienter – innan ni är redo."]),
        twistKind: "impact",
        assumptionChallenged: L(["Redirection only affects us.", "Omdirigeringen påverkar bara oss."]),
        narrative: L([
          "Day two. The regional coordination meeting brings together the hospitals and the ambulance service.\n\nYour decisions in the first night have had consequences beyond your walls. The region needs the healthcare system as a whole to work, and that may mean asking your hospital to do more than it feels ready for.",
          "Dag två. Regionens samordningsmöte samlar sjukhusen och ambulanssjukvården.\n\nEra beslut den första natten har fått följder utanför era väggar. Regionen behöver att vården som helhet fungerar, och det kan innebära att ert sjukhus ombeds göra mer än det känner sig redo för."
        ]),
        injects: [
          inj("i7-1", 2160, "email", "regulator", "high", "confirmed", [
            "The region: “The neighbouring emergency department is overloaded. We need you to resume receiving ambulances within 12 hours. National coordination has been informed.”",
            "Regionen: ”Grannsjukhusets akutmottagning är överbelastad. Vi behöver att ni återupptar mottagandet av ambulanser inom 12 timmar. Den nationella samordningen har informerats.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Which systems must work before you can receive ambulances safely?", "Vilka system måste fungera innan ni kan ta emot ambulanser på ett säkert sätt?", ["itOps", "clinicalLead"]),
            q("Can lab and imaging results flow by then?", "Kan provsvar och bilder flöda till dess?", ["itOps"]),
            q("Is the record restore on track?", "Går återställningen av journalen enligt plan?", ["itOps"], "d5")
          ],
          executive: [
            q("Who decides when you're ready — you or the region?", "Vem avgör när ni är redo – ni eller regionen?", ["clinicalLead", "dutyOfficer"]),
            q("What national support can you ask for?", "Vilket nationellt stöd kan ni be om?", ["ceo", "dutyOfficer"]),
            q("Would you redirect again in the same way?", "Skulle ni omdirigera igen på samma sätt?", ["clinicalLead"], "d2")
          ]
        },
        challenges: [ch("Your staff are exhausted from two days on paper.", "Er personal är utmattad efter två dagar på papper.")],
        decision: dec("d7", "clinicalLead", ["How do you respond to the region?", "Hur svarar ni regionen?"], [
          ["Agree a staged return by patient category, tied to which systems are back, and ask for national support.", "Kom överens om en stegvis återgång efter patientkategori, kopplad till vilka system som är tillbaka, och be om nationellt stöd."],
          ["Resume fully within 12 hours as asked.", "Återuppta fullt ut inom 12 timmar som begärt."],
          ["Refuse until all systems are back.", "Vägra tills alla system är tillbaka."]
        ], {
          knowns: [["The neighbour is overloaded.", "Grannsjukhuset är överbelastat."]],
          uncertainties: [["When imaging returns.", "När bilddiagnostiken kommer tillbaka."]],
          tradeoffs: {
            operational: ["A staged return is complex to coordinate.", "En stegvis återgång är komplicerad att samordna."],
            security: ["Rushing restore risks reinfection.", "Att stressa återställningen riskerar ny infektion."],
            legal: ["Regional patient safety is shared.", "Patientsäkerheten i regionen är gemensam."],
            reputational: ["Refusing looks uncooperative.", "En vägran ser osamarbetsvillig ut."]
          },
          evaluation: [["Ties the return to clinical readiness", "Kopplar återgången till klinisk beredskap"]]
        }),
        facilitator: fac(
          ["Your crisis is now the region's. Think system-wide.", "Er kris är nu regionens. Tänk på hela systemet."],
          ["A staged, capability-based return with national support.", "En stegvis återgång baserad på förmåga, med nationellt stöd."],
          [["Ask: what does ready mean, clinically?", "Fråga: vad betyder redo, kliniskt?"]]
        )
      },
      {
        id: "p8",
        priority: 3,
        clock: 2880,
        title: L(["What to restore first", "Vad som ska återställas först"]),
        twist: L(["There is capacity to restore only a few systems at a time. IT's order and the clinicians' order are different.", "Det finns bara kapacitet att återställa några system åt gången. IT:s ordning och klinikernas ordning är olika."]),
        twistKind: "impact",
        assumptionChallenged: L(["Restore order is a technical question.", "Ordningen för återställning är en teknisk fråga."]),
        narrative: L([
          "Day three. The recovery plan is on the wall of the command room, and capacity is limited: only a few systems can be restored at a time.\n\nIT has a technical order, based on what depends on what. The clinicians have a different order, based on what keeps patients safe. Both are reasonable.",
          "Dag tre. Återställningsplanen sitter på väggen i ledningsrummet, och kapaciteten är begränsad: bara några system kan återställas åt gången.\n\nIT har en teknisk ordning, baserad på vad som är beroende av vad. Vårdpersonalen har en annan ordning, baserad på vad som håller patienterna säkra. Båda är rimliga."
        ]),
        injects: [
          inj("i8-1", 2880, "impactReport", "itOps", "medium", "confirmed", [
            "IT proposes: directory, then record, then lab, then imaging, then scheduling. The clinicians want lab and imaging before the full record.",
            "IT föreslår: katalogtjänst, sedan journal, sedan lab, sedan bilddiagnostik, sedan schemaläggning. Klinikerna vill ha lab och bilddiagnostik före hela journalen."
          ], { tests: ["lo4"] })
        ],
        charts: [{
          id: "c8-rto", type: "rto",
          title: L(["Recovery target against estimated restore", "Mål för återställning jämfört med beräknad återställning"]),
          caption: L(["Hours.", "Timmar."]),
          data: (ctx) => ({
            services: Object.values(ctx.org.services).map((s, i) => ({ id: s.id, name: s.name, rto: s.rto, rpo: s.rpo, estimate: Math.round(s.rto * (3 + i) + 24) }))
          })
        }],
        questions: {
          technical: [
            q("What are the technical dependencies between these systems?", "Vilka tekniska beroenden finns mellan systemen?", ["itOps"]),
            q("Can lab and imaging work without the full record?", "Kan lab och bilddiagnostik fungera utan hela journalen?", ["itOps", "clinicalLead"]),
            q("Do your vendor-access rules slow device recovery?", "Gör era regler för leverantörsåtkomst återställningen av utrustningen långsammare?", ["supplierManager"], "d4")
          ],
          executive: [
            q("Who has the final say on restore order?", "Vem har sista ordet om ordningen för återställning?", ["clinicalLead", "incidentCommander"]),
            q("How do you explain the order to staff?", "Hur förklarar ni ordningen för personalen?", ["clinicalLead", "comms"]),
            q("Does the staged return to the region fit this order?", "Passar den stegvisa återgången till regionen med den här ordningen?", ["clinicalLead"], "d7")
          ]
        },
        challenges: [ch("Nobody had agreed a clinical restore order before the incident.", "Ingen hade kommit överens om en klinisk ordning för återställning före incidenten.")],
        decision: dec("d8", "incidentCommander", ["Whose order do you follow?", "Vems ordning följer ni?"], [
          ["A joint order: technical prerequisites first, then by clinical need, signed off by the clinical lead.", "En gemensam ordning: tekniska förutsättningar först, sedan efter kliniskt behov, godkänd av den kliniska ledningen."],
          ["IT's order; it is technically sound.", "IT:s ordning; den är tekniskt sund."],
          ["The clinicians' order, whatever the dependencies.", "Klinikernas ordning, oavsett beroenden."]
        ], {
          knowns: [["Capacity is limited.", "Kapaciteten är begränsad."]],
          uncertainties: [["How long each restore takes.", "Hur lång tid varje återställning tar."]],
          tradeoffs: {
            operational: ["Ignoring dependencies causes failed restores.", "Att bortse från beroenden leder till misslyckade återställningar."],
            security: ["Identity must be clean before anything else.", "Identiteten måste vara ren före allt annat."],
            legal: ["Patient safety decisions belong to clinicians.", "Beslut om patientsäkerhet tillhör klinikerna."],
            reputational: ["Staff need to see their needs reflected.", "Personalen behöver se sina behov återspeglas."]
          },
          evaluation: [["Combines technical prerequisites with clinical priority", "Förenar tekniska förutsättningar med klinisk prioritet"]]
        }),
        facilitator: fac(
          ["Recovery order is a clinical-technical negotiation. Make it explicit.", "Ordningen för återställning är en förhandling mellan klinik och teknik. Gör den uttalad."],
          ["A joint, signed-off restore order.", "En gemensam och godkänd ordning för återställning."],
          [["Ask: who should have agreed this order a year ago?", "Fråga: vem borde ha kommit överens om den här ordningen för ett år sedan?"]]
        )
      },
      {
        id: "p9",
        priority: 4,
        clock: 4320,
        title: L(["Pay to save lives?", "Betala för att rädda liv?"]),
        twist: L(["A politician on the board publicly urges payment “to save lives”. The group doubles the demand.", "En politiker i styrelsen uppmanar offentligt till betalning ”för att rädda liv”. Gruppen fördubblar kravet."]),
        twistKind: "authority",
        assumptionChallenged: L(["Hospital management decides on payment.", "Sjukhusledningen beslutar om betalning."]),
        narrative: L([
          "Day four. The hospital is coping, slowly, but the story has moved from the wards to politics.\n\nElected members of the hospital's board are being asked on television what they will do. One of them has already given an answer, and the attackers were listening.",
          "Dag fyra. Sjukhuset klarar sig, långsamt, men historien har flyttat från avdelningarna till politiken.\n\nFörtroendevalda i sjukhusets styrelse får frågor i tv om vad de tänker göra. En av dem har redan svarat, och angriparna lyssnade."
        ]),
        injects: [
          inj("i9-1", 4320, "newsHeadline", "media", "high", "confirmed", [
            "“Board member: ‘Pay the ransom — patients come first.’”",
            "”Styrelseledamot: ’Betala lösensumman – patienterna kommer först.’”"
          ], { pressure: "media", substitute: { source: "management", content: ["A board member emails the CEO urging that the ransom be paid “to save lives”.", "En styrelseledamot mejlar vd och uppmanar till att lösensumman betalas ”för att rädda liv”."] }, tests: ["lo3"] }),
          inj("i9-2", 4350, "ransomNote", "attacker", "high", "confirmed", [
            "“Your politicians agree with us. The price is now double. 48 hours.”",
            "”Era politiker håller med oss. Priset är nu det dubbla. 48 timmar.”"
          ], { optional: true, tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Would a decryptor even speed recovery now?", "Skulle en dekrypterare ens påskynda återställningen nu?", ["itOps"]),
            q("What is the realistic timeline without paying?", "Vilken är den realistiska tidsplanen utan betalning?", ["itOps"]),
            q("Does the restore order make paying less relevant?", "Gör ordningen för återställning betalningen mindre relevant?", ["itOps"], "d8")
          ],
          executive: [
            q("Who has authority over payment in a public hospital?", "Vem har mandat över betalning på ett offentligt sjukhus?", ["ceo", "legal"]),
            q("How do you respond to the board member?", "Hur bemöter ni styrelseledamoten?", ["ceo", "comms"]),
            q("Does your refusal from day two still stand?", "Står er vägran från dag två fortfarande fast?", ["ceo"], "d6")
          ]
        },
        challenges: [ch("Paying may be prohibited for a public body — and funds criminals who target hospitals.", "En betalning kan vara otillåten för ett offentligt organ – och finansierar brottslingar som riktar in sig på sjukhus.")],
        decision: dec("d9", "ceo", ["What is your position?", "Vilken är er hållning?"], [
          ["Do not pay; explain publicly that recovery is under way and why paying would not save lives.", "Betala inte; förklara offentligt att återställningen pågår och varför en betalning inte skulle rädda liv."],
          ["Open negotiations to buy time.", "Inled förhandlingar för att vinna tid."],
          ["Defer the decision to the board.", "Lämna över beslutet till styrelsen."]
        ], {
          knowns: [["Recovery is progressing without a decryptor.", "Återställningen går framåt utan dekrypterare."]],
          uncertainties: [["Whether publication will follow.", "Om publicering kommer att följa."]],
          tradeoffs: {
            operational: ["Negotiating takes leadership time.", "Förhandlingar tar ledningens tid."],
            security: ["Payment funds the next hospital attack.", "En betalning finansierar nästa angrepp mot ett sjukhus."],
            legal: ["Public bodies have strict rules on spending.", "Offentliga organ har strikta regler för hur pengar används."],
            reputational: ["A clear, reasoned position calms the debate.", "En tydlig och motiverad hållning lugnar debatten."]
          },
          evaluation: [["Explains the position with facts", "Förklarar hållningen med fakta"]]
        }),
        facilitator: fac(
          ["Politics enters the room. Hold to facts.", "Politiken kommer in i rummet. Håll fast vid fakta."],
          ["A clear, factual refusal communicated publicly.", "En tydlig och saklig vägran som kommuniceras offentligt."],
          [["Ask: what would paying actually change?", "Fråga: vad skulle en betalning egentligen ändra?"]]
        )
      },
      {
        id: "p10",
        priority: 5,
        clock: 10080,
        title: L(["The long tail", "Den långa svansen"]),
        twist: L(["Systems are back, but {{num.postponed}} operations were postponed and paper records must be entered by hand.", "Systemen är tillbaka, men {{num.postponed}} operationer har skjutits upp och pappersjournaler måste föras in för hand."]),
        twistKind: "impact",
        assumptionChallenged: L(["When systems are back, the crisis is over.", "När systemen är tillbaka är krisen över."]),
        narrative: L([
          "A week later. The hospital is running, but not normally.\n\nMost systems are back, and the crisis team is about to stand down. What remains is the long tail: work that was put off, paper that has to become data, and staff who have been running on adrenaline for a week.",
          "En vecka senare. Sjukhuset är i drift, men inte normalt.\n\nDe flesta system är tillbaka och krisledningen ska snart avvecklas. Det som återstår är den långa svansen: arbete som skjutits upp, papper som måste bli data och personal som har gått på adrenalin i en vecka."
        ]),
        injects: [
          inj("i10-1", 10080, "impactReport", "person.clinicalLead", "medium", "confirmed", [
            "“We have {{num.postponed}} postponed operations, a week of paper notes to enter and staff who are worn out. Mistakes in back-entry are a patient-safety risk too.”",
            "”Vi har {{num.postponed}} uppskjutna operationer, en veckas pappersanteckningar att föra in och personal som är slutkörd. Fel vid efterregistrering är också en risk för patientsäkerheten.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you make sure no attacker access remains?", "Hur ser ni till att ingen åtkomst för angriparen finns kvar?", ["socLead", "ciso"]),
            q("Which security changes come first?", "Vilka säkerhetsförändringar kommer först?", ["ciso"]),
            q("Is vendor access now properly controlled?", "Är leverantörsåtkomsten nu ordentligt kontrollerad?", ["supplierManager"], "d4")
          ],
          executive: [
            q("How do you support exhausted staff?", "Hur stöttar ni utmattad personal?", ["clinicalLead", "ceo"]),
            q("How do you clear the backlog safely?", "Hur arbetar ni av kön på ett säkert sätt?", ["clinicalLead"]),
            q("Which first-night decision would you most like to have made differently?", "Vilket beslut från den första natten skulle ni helst ha fattat annorlunda?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The backlog will take months.", "Kön kommer att ta månader att arbeta av.")],
        decision: dec("d10", "ceo", ["What do you change?", "Vad ändrar ni?"], [
          ["Fund an agreed clinical restore order, practised downtime procedures, controlled vendor access and staff recovery.", "Finansiera en överenskommen klinisk ordning för återställning, övade reservrutiner, kontrollerad leverantörsåtkomst och återhämtning för personalen."],
          ["Strengthen security and return to normal.", "Stärk säkerheten och återgå till det normala."],
          ["Commission an external review first.", "Beställ en extern granskning först."]
        ], {
          knowns: [["Recovery took a week; the backlog will take months.", "Återställningen tog en vecka; kön kommer att ta månader."]],
          uncertainties: [["What the review will find.", "Vad granskningen kommer att hitta."]],
          tradeoffs: {
            operational: ["Practising downtime takes clinical time.", "Att öva reservrutiner tar klinisk tid."],
            security: ["Vendor access was the root cause.", "Leverantörsåtkomsten var grundorsaken."],
            legal: ["Supervisors will expect lessons learned.", "Tillsynsmyndigheterna kommer att förvänta sig lärdomar."],
            reputational: ["Patients need to see change.", "Patienterna behöver se förändring."]
          },
          evaluation: [["Addresses people, process and technology", "Tar itu med människor, processer och teknik"]]
        }),
        facilitator: fac(
          ["End on the human cost and on preparation.", "Avsluta med den mänskliga kostnaden och med förberedelser."],
          ["Practised downtime, an agreed restore order, controlled vendor access and staff support.", "Övade reservrutiner, en överenskommen ordning för återställning, kontrollerad leverantörsåtkomst och stöd till personalen."],
          [["Ask: when will you next practise paper procedures?", "Fråga: när övar ni reservrutinerna på papper nästa gång?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The hospital recovers without paying, but patient data has leaked, operations are delayed for months and the region learns how dependent it is on one hospital's systems.",
        "Sjukhuset återhämtar sig utan att betala, men patientuppgifter har läckt, operationer försenas i månader och regionen inser hur beroende den är av ett enda sjukhus system."
      ])
    },

    debrief: {
      keyLessons: [
        L(["In a hospital, containment and recovery are clinical decisions as much as technical ones.", "På ett sjukhus är begränsning och återställning lika mycket kliniska beslut som tekniska."]),
        L(["Downtime procedures only work if they are practised.", "Reservrutiner fungerar bara om de övas."]),
        L(["Vendor remote access is a major entry point in healthcare.", "Leverantörers fjärråtkomst är en viktig väg in i vården."]),
        L(["Patient safety and evidence can often be served in parallel.", "Patientsäkerhet och spår kan ofta tillgodoses parallellt."])
      ],
      assumptionsVsReality: [
        avr(["Paper will carry us.", "Papper kommer att bära oss."], ["The ED backed up within an hour.", "Akuten korkades igen inom en timme."], "p2"),
        avr(["Only record systems.", "Bara journalsystem."], ["Medical-device servers too.", "Även servrar för medicinteknik."], "p3"),
        avr(["A staff click.", "Ett klick från personalen."], ["A vendor's always-on account.", "Ett ständigt öppet leverantörskonto."], "p4")
      ],
      strengthsToLookFor: [
        L(["Clinical leadership in containment decisions", "Klinisk ledning i besluten om begränsning"]),
        L(["Coordinated, time-limited redirection", "Samordnad och tidsbegränsad omdirigering"]),
        L(["Parallel restore and preservation", "Parallell återställning och säkring"])
      ],
      commonGaps: [
        L(["IT deciding what is switched off", "Att IT bestämmer vad som stängs av"]),
        L(["Forgetting medical devices", "Att glömma medicintekniken"]),
        L(["No agreed clinical restore order", "Ingen överenskommen klinisk ordning för återställning"])
      ],
      suggestedActions: [
        act(["Practise paper downtime procedures twice a year.", "Öva reservrutinerna på papper två gånger om året."], "clinicalLead", "high"),
        act(["Agree a clinical restore order in advance.", "Kom i förväg överens om en klinisk ordning för återställning."], "clinicalLead", "high"),
        act(["Replace always-on vendor access with supervised, time-limited sessions.", "Ersätt ständigt öppen leverantörsåtkomst med övervakade och tidsbegränsade sessioner."], "supplierManager", "high"),
        act(["Separate the medical-device network.", "Avskilj nätverket för medicinteknik."], "networkLead", "medium"),
        act(["Plan redirection criteria with the region.", "Planera kriterier för omdirigering tillsammans med regionen."], "dutyOfficer", "medium")
      ]
    }
  });
})();
