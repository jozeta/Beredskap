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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

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
          minutes: 10,
          interrupts: [
            ir("i1", { chosen: "B" }, ["After the shutdown", "Efter nedstängningen"], [
              io(["No new notes", "Inga nya meddelanden"], ["Since everything went off, IT has seen no new ransom notes on any screen it can check. The on-call engineer calls it a success; nobody yet knows what the shutdown caught in the middle.", "Sedan allt stängdes av har IT inte sett några nya lösenmeddelanden på de skärmar de kan kontrollera. IT-beredskapen kallar det en framgång; ingen vet ännu vad avstängningen avbröt mitt i."], ["No new ransom notes appeared on checked screens after the shutdown.", "Inga nya lösenmeddelanden syntes på kontrollerade skärmar efter avstängningen."]),
              io(["The lab goes blind", "Labbet blir blint"], ["The lab analysers lost their link to the wards when the network went off. Samples are piling up with nowhere to send results, and the ED physician wants something switched back on now.", "Labbets analysinstrument tappade kopplingen till avdelningarna när nätverket stängdes av. Proverna hopar sig utan någonstans att skicka svaren, och akutläkaren vill att något slås på igen nu."], ["The shutdown cut lab results off from the wards.", "Avstängningen kopplade bort provsvaren från avdelningarna."], { reopen: true }),
              io(["One server still on", "En server är fortfarande på"], ["A server in a locked equipment room was missed in the rush and is still running. Nobody can say whether it is clean, infected or simply forgotten.", "En server i ett låst utrustningsrum missades i brådskan och är fortfarande igång. Ingen kan säga om den är ren, infekterad eller bara bortglömd."], ["One server was missed in the shutdown and kept running.", "En server missades vid avstängningen och fortsatte att gå."])
            ]),
            ir("i2", { notChosen: "B" }, ["Systems still running", "Systemen är fortfarande igång"], [
              io(["Another screen goes dark", "Ännu en skärm slocknar"], ["The outpatient pharmacy's computers now show the same ransom message. Whatever is encrypting is still moving, and what you decided has not stopped it.", "Datorerna på öppenvårdsapoteket visar nu samma lösenmeddelande. Det som krypterar rör sig fortfarande, och det ni beslutade har inte stoppat det."], ["The encryption reached the outpatient pharmacy after your first decision.", "Krypteringen nådde öppenvårdsapoteket efter ert första beslut."], { reopen: true }),
              io(["Results still arrive", "Svaren kommer fortfarande"], ["For now, lab results still reach the ED electronically. The emergency physician says this is the only thing keeping the department moving.", "Än så länge når provsvaren akuten elektroniskt. Akutläkaren säger att det är det enda som håller avdelningen igång."], ["Lab results kept reaching the ED electronically in the first half hour.", "Provsvaren fortsatte att nå akuten elektroniskt den första halvtimmen."]),
              io(["Which screens to trust?", "Vilka skärmar kan man lita på?"], ["Ward staff ask whether the systems still working are safe to use. IT says probably; the doctor in charge says probably is not good enough for a medication order.", "Personalen på avdelningarna frågar om systemen som fortfarande fungerar är säkra att använda. IT säger förmodligen; ansvarig läkare säger att förmodligen inte räcker för en läkemedelsordination."], ["Wards do not know which working systems they can trust.", "Avdelningarna vet inte vilka fungerande system de kan lita på."])
            ])
          ],
          pushback: {
            A: [
              pb(["Every ward wants an exception", "Varje avdelning vill ha undantag"], ["Agreeing the isolation order with clinicians is taking longer than planned: each ward argues its system must stay on. Meanwhile IT reports one more server showing the ransom note. Do you stop consulting and cut, or keep the clinical input you promised?", "Att komma överens om isoleringsordningen med vården tar längre tid än planerat: varje avdelning hävdar att just deras system måste vara på. Under tiden rapporterar IT att ännu en server visar lösenmeddelandet. Slutar ni samråda och kopplar bort, eller håller ni fast vid den kliniska medverkan ni lovade?"]),
              pb(["The call list is encrypted", "Larmlistan är krypterad"], ["Declaring a major incident means calling in off-duty staff, but the current call list was in one of the systems that went dark. The switchboard is phoning from memory and old printouts. Who do you actually need tonight, and who decides that without the list?", "Att larma särskild händelse innebär att kalla in ledig personal, men den aktuella larmlistan låg i ett av systemen som slocknade. Växeln ringer ur minnet och från gamla utskrifter. Vilka behöver ni egentligen i natt, och vem avgör det utan listan?"]),
              pb(["Folders that don't match", "Pärmar som inte stämmer"], ["The first downtime folder opened in the ED lists forms and phone extensions that were replaced last year. Staff are improvising their own versions on each ward. Do you let every ward improvise, or stop to issue one procedure while patients wait?", "Den första pärmen med reservrutiner som öppnas på akuten hänvisar till blanketter och anknytningar som byttes ut förra året. Personalen improviserar egna varianter på varje avdelning. Låter ni varje avdelning improvisera, eller stannar ni upp för att ta fram en gemensam rutin medan patienterna väntar?"])
            ],
            B: [
              pb(["Results now on foot", "Svaren går nu till fots"], ["Shutting everything down also cut the lab off from the wards: results that were still arriving electronically a minute ago now have to be carried by hand. The ED physician says this is worse than the encryption. Do you bring anything back up, and who chooses what?", "Avstängningen kopplade också bort labbet från avdelningarna: svar som kom elektroniskt för en minut sedan måste nu bäras för hand. Akutläkaren säger att det här är värre än krypteringen. Startar ni något igen, och vem väljer vad?"]),
              pb(["Nobody warned the wards", "Ingen varnade avdelningarna"], ["The intensive care lead calls, furious: the systems their team was still using went dark without a word of warning, in the middle of a medication round. They want to know who has the authority to switch off a hospital. Can you answer that, and would you do it the same way again?", "Ansvarig på intensiven ringer, rasande: systemen som deras team fortfarande använde slocknade utan förvarning, mitt i en läkemedelsrunda. Hen vill veta vem som har mandat att stänga av ett sjukhus. Kan ni svara på det, och skulle ni göra likadant igen?"]),
              pb(["Did it stop anything?", "Stoppade det något?"], ["IT cannot tell whether the shutdown came before or after the encryption finished; some servers were already halfway through. You have taken the full cost of a stop without knowing what it saved. Do you keep everything off while you find out, or start bringing systems back?", "IT kan inte säga om avstängningen kom före eller efter att krypteringen blev klar; vissa servrar var redan halvvägs. Ni har tagit hela kostnaden för ett stopp utan att veta vad det räddade. Håller ni allt avstängt medan ni tar reda på det, eller börjar ni starta system igen?"])
            ],
            C: [
              pb(["Another system goes dark", "Ännu ett system slocknar"], ["Twenty minutes in, the lab system that was still working shows the ransom note. IT has still not found what is doing the encrypting. Do you keep trying, or isolate now and accept you have lost what you were trying to protect?", "Efter tjugo minuter visar labbsystemet, som fortfarande fungerade, lösenmeddelandet. IT har ännu inte hittat det som krypterar. Fortsätter ni försöka, eller isolerar ni nu och accepterar att ni har förlorat det ni försökte skydda?"]),
              pb(["The doctors weren't asked", "Läkarna tillfrågades inte"], ["The doctor in charge learns that IT chose to keep systems running and asks who decided, and on whose clinical judgement. Staff are still entering orders into systems that may vanish at any moment. Do you move them to paper now, even though some systems still work?", "Ansvarig läkare får veta att IT valde att låta systemen vara igång och frågar vem som beslutade, och på vems kliniska bedömning. Personalen för fortfarande in ordinationer i system som kan försvinna när som helst. Flyttar ni dem till papper nu, trots att vissa system fortfarande fungerar?"]),
              pb(["Still an IT problem", "Fortfarande ett IT-problem"], ["Because you are treating this as a technical fight, no major incident has been declared and the region has not been told. Ambulances keep arriving as if nothing has happened. How long can you wait before that becomes a decision you have to defend?", "Eftersom ni behandlar det här som en teknisk strid har ingen särskild händelse larmats och regionen har inte fått veta något. Ambulanserna fortsätter att komma som om ingenting har hänt. Hur länge kan ni vänta innan det blir ett beslut ni måste försvara?"])
            ]
          }
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
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because downtime procedures started at once, the wards are on paper, and two medication orders were transcribed wrongly in the first hour.", sv: "Eftersom reservrutinerna startade direkt arbetar avdelningarna på papper, och två läkemedelsordinationer skrevs av fel under den första timmen." } }
        ],
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
          minutes: 10,
          interrupts: [
            ir("i1", { chosen: "C" }, ["The doors stay open", "Dörrarna står öppna"], [
              io(["The extra staff help", "Extrapersonalen hjälper"], ["The extra staff arrive and, for the first hour, the waiting room actually shrinks. Some in the room take it as proof that redirection was never needed.", "Extrapersonalen kommer och under den första timmen krymper faktiskt väntrummet. En del i rummet ser det som ett bevis på att omdirigering aldrig behövdes."], ["The ED queue shrank in the first hour after extra staff arrived.", "Kön på akuten krympte den första timmen efter att extrapersonalen kom."]),
              io(["A dose caught late", "En dos upptäckt i sista stund"], ["A nurse catches a wrongly transcribed dose seconds before giving it. The emergency physician reports it as a near miss and says the next one may not be caught.", "En sjuksköterska upptäcker en felaktigt avskriven dos några sekunder innan den ges. Akutläkaren rapporterar det som ett tillbud och säger att nästa kanske inte upptäcks."], ["A near-miss medication error in the ED has been formally reported.", "Ett tillbud med läkemedel på akuten har rapporterats formellt."], { reopen: true }),
              io(["The ambulances bunch up", "Ambulanserna klumpar ihop sig"], ["Three ambulances arrive within ten minutes, then none for half an hour. Nobody can tell whether the department is coping or just between waves.", "Tre ambulanser kommer inom tio minuter, sedan ingen på en halvtimme. Ingen kan säga om avdelningen klarar sig eller bara är mellan två vågor."], ["Ambulance arrivals have been uneven, making the ED's capacity hard to read.", "Ambulanserna har kommit ojämnt, vilket gör akutens kapacitet svår att bedöma."])
            ]),
            ir("i2", { notChosen: "C" }, ["Ambulances sent elsewhere", "Ambulanser skickas vidare"], [
              io(["The neighbour copes", "Grannen klarar det"], ["The neighbouring hospital takes the first redirected ambulances without complaint. Its doctor in charge says they are fine for now.", "Grannsjukhuset tar emot de första omdirigerade ambulanserna utan att klaga. Deras ansvariga läkare säger att det går bra för tillfället."], ["The neighbour handled the first redirected ambulances without problems.", "Grannen tog emot de första omdirigerade ambulanserna utan problem."]),
              io(["A patient worsens en route", "En patient försämras på vägen"], ["A redirected patient deteriorated during the 40-minute journey and arrived in a worse state than expected. The ambulance service has opened a review and asks whether the rule was right.", "En omdirigerad patient försämrades under den 40 minuter långa resan och kom fram i sämre skick än väntat. Ambulanssjukvården har inlett en granskning och frågar om regeln var rätt."], ["A redirected patient deteriorated en route; the case is under review.", "En omdirigerad patient försämrades under transporten; fallet granskas."], { reopen: true, meters: { regulator: 1 } }),
              io(["Some crews didn't hear", "Alla besättningar fick inte veta"], ["Two ambulances arrive at your door anyway: their crews say they were never told. The region says the message has gone out, but not to everyone yet.", "Två ambulanser kommer ändå till er dörr: besättningarna säger att de aldrig fick veta något. Regionen säger att beskedet har gått ut, men inte till alla än."], ["Some ambulance crews were not told about the redirection in time.", "En del ambulansbesättningar fick inte veta om omdirigeringen i tid."])
            ])
          ],
          pushback: {
            A: [
              pb(["Who counts as time-critical?", "Vem räknas som tidskritisk?"], ["Paramedics on the road now call the ED about every borderline case: a possible stroke, chest pain in a young patient. Each call takes a doctor off the floor to decide. Who makes the time-critical call each time, and on what criteria?", "Ambulanspersonalen ringer nu akuten om varje gränsfall: en möjlig stroke, bröstsmärta hos en ung patient. Varje samtal tar en läkare från golvet för att avgöra. Vem bedömer varje gång vad som är tidskritiskt, och efter vilka kriterier?"]),
              pb(["You keep the hardest cases", "Ni behåller de svåraste fallen"], ["The patients you still accept are the sickest ones, exactly those who most need the lab and imaging results you don't have. The ED says the exception rule keeps the cases they are least able to treat safely. Do you narrow the exception, or widen it?", "De patienter ni fortfarande tar emot är de sjukaste, precis de som mest behöver de provsvar och röntgenbilder ni saknar. Akuten säger att undantagsregeln behåller just de fall de har sämst förutsättningar att behandla säkert. Gör ni undantaget snävare eller bredare?"]),
              pb(["The neighbour may say no", "Grannen kan säga nej"], ["The neighbouring hospital accepted the redirection, but its doctor in charge now says they may not be able to keep it up past your first review. Your two-hour review may not be yours to make. What do you do if they say no before you are ready?", "Grannsjukhuset gick med på omdirigeringen, men deras ansvariga läkare säger nu att de kanske inte klarar att fortsätta efter er första omprövning. Omprövningen varannan timme kanske inte är er att göra. Vad gör ni om de säger nej innan ni är redo?"])
            ],
            B: [
              pb(["A stroke passing your door", "En stroke som passerar er dörr"], ["An ambulance with a suspected stroke patient is passing your hospital on its way to one 40 minutes away. The paramedic asks by radio for an exception. Do you break your own rule for this patient, and then for the next?", "En ambulans med en patient med misstänkt stroke passerar ert sjukhus på väg till ett som ligger 40 minuter bort. Ambulanssjuksköterskan ber via radio om ett undantag. Bryter ni er egen regel för den här patienten, och sedan för nästa?"]),
              pb(["The region wants an end time", "Regionen vill ha en sluttid"], ["The regional duty officer says full redirection puts everything on a neighbour that is already busy, and they need an end time now. You don't know how long the outage will last. What time do you give them, and what happens when you miss it?", "Regionens tjänsteman i beredskap säger att full omdirigering lägger allt på en granne som redan har mycket att göra, och att de behöver en sluttid nu. Ni vet inte hur länge avbrottet varar. Vilken tid ger ni dem, och vad händer när ni inte håller den?"]),
              pb(["Walk-ins keep coming", "Folk kommer ändå själva"], ["Redirecting ambulances does not stop people arriving by car. The ED has already taken several walk-in patients who are sicker than some of those you sent away. Was full redirection the safe choice, or only the visible one?", "Att omdirigera ambulanserna hindrar inte folk från att komma med bil. Akuten har redan tagit emot flera patienter som kommit själva och är sjukare än några av dem ni skickade vidare. Var full omdirigering det säkra valet, eller bara det synliga?"])
            ],
            C: [
              pb(["More hands, same blindness", "Fler händer, samma blindhet"], ["The extra staff arrive, but they have no records, lab results or imaging either. More people are now writing more paper orders, and transcription errors are rising. Does adding staff make the ED safer, or just faster at making mistakes?", "Den extra personalen kommer, men de har inte heller några journaler, provsvar eller bilder. Fler personer skriver nu fler ordinationer på papper, och felen vid avskrift ökar. Gör mer personal akuten säkrare, eller bara snabbare på att göra fel?"]),
              pb(["The physician wants it on record", "Läkaren vill ha det dokumenterat"], ["The emergency physician who asked for redirection states in writing that receiving at this pace is unsafe, and wants that in the log. You are overruling the clinician closest to the patients. Who signs that decision?", "Akutläkaren som bad om omdirigering skriver att mottagandet i den här takten inte är säkert och vill att det förs in i loggen. Ni kör över den kliniker som står närmast patienterna. Vem skriver under det beslutet?"]),
              pb(["Taken from the wards", "Tagna från avdelningarna"], ["The staff you called into the ED came from wards that are also on paper and already stretched. A ward manager says their night team is now below safe staffing. Are you reducing the risk, or just moving it upstairs?", "Personalen ni kallade till akuten kom från avdelningar som också arbetar på papper och redan är hårt pressade. En avdelningschef säger att nattlaget nu ligger under säker bemanning. Minskar ni risken, eller flyttar ni den bara upp en våning?"])
            ]
          }
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
        reconsider: { decision: "d1", pressure: { en: "The device servers are encrypted too. If you isolated in a controlled order with the clinicians, that took long enough for the spread to reach them. If you shut everything down at once, nobody could say which pumps were mid-infusion.", sv: "Även servrarna för den medicintekniska utrustningen är krypterade. Om ni isolerade i kontrollerad ordning tillsammans med vården tog det tillräckligt lång tid för att spridningen skulle nå dem. Om ni stängde ner allt på en gång kunde ingen säga vilka pumpar som var mitt i en infusion." } },
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
          evaluation: [["Uses manual safety checks rather than stopping care", "Använder manuella säkerhetskontroller i stället för att stoppa vården"]],
          interrupts: [
            ir("i1", { chosen: "B" }, ["Devices as normal", "Utrustningen som vanligt"], [
              io(["No alarms so far", "Inga larm hittills"], ["The first hours pass without a single pump error reported from the wards. Some in the room say the device problem was overstated.", "De första timmarna går utan att ett enda fel på pumparna rapporteras från avdelningarna. En del i rummet säger att problemet med utrustningen var överdrivet."], ["No pump errors were reported in the first hours.", "Inga fel på pumparna rapporterades under de första timmarna."]),
              io(["An unfamiliar dose limit", "En okänd doseringsgräns"], ["A pump on the medical ward rejects a routine dose with a limit nobody recognises. The nurse stops the infusion and refuses to restart it until someone can say which drug library the pump is running.", "En pump på medicinavdelningen avvisar en rutindos med en gräns som ingen känner igen. Sjuksköterskan stoppar infusionen och vägrar starta den igen förrän någon kan säga vilket läkemedelsbibliotek pumpen kör."], ["A pump rejected a routine dose; its drug library version is unknown.", "En pump avvisade en rutindos; dess version av läkemedelsbiblioteket är okänd."], { reopen: true }),
              io(["Two pumps disagree", "Två pumpar säger olika"], ["Pharmacy finds two pumps on the same ward showing different library versions. Both may be fine, or one may be wrong; nobody can check against the server.", "Apoteket hittar två pumpar på samma avdelning som visar olika biblioteksversioner. Båda kan vara rätt, eller så är den ena fel; ingen kan kontrollera mot servern."], ["Pumps on the same ward run different drug library versions.", "Pumpar på samma avdelning kör olika versioner av läkemedelsbiblioteket."])
            ]),
            ir("i2", { notChosen: "B" }, ["Devices held back", "Utrustningen hålls tillbaka"], [
              io(["The wards fall behind", "Avdelningarna halkar efter"], ["With every infusion and scan now slower or stopped, the wards are hours behind. The intensive care lead asks whether caution is now the bigger risk to patients.", "När varje infusion och undersökning nu går långsammare eller har stoppats ligger avdelningarna flera timmar efter. Ansvarig på intensiven frågar om försiktigheten nu är den större risken för patienterna."], ["The wards are hours behind on infusions and scans.", "Avdelningarna ligger flera timmar efter med infusioner och undersökningar."], { reopen: true }),
              io(["A vendor offers to dial in", "En leverantör erbjuder sig att koppla upp sig"], ["A device vendor's support line calls: they can connect remotely tonight and help get things running. It would save hours, if you let them in.", "Supporten hos en leverantör av medicinteknik ringer: de kan koppla upp sig på distans i natt och hjälpa till att få igång utrustningen. Det skulle spara flera timmar, om ni släpper in dem."], ["A device vendor has offered remote help tonight; nobody has answered yet.", "En leverantör av medicinteknik har erbjudit fjärrhjälp i natt; ingen har svarat än."]),
              io(["One nurse knows how", "En sjuksköterska kan"], ["An experienced nurse who worked before the pumps were networked starts showing colleagues how to set them by hand. Word spreads, and other wards ask for the same help.", "En erfaren sjuksköterska som arbetade innan pumparna var nätverksanslutna börjar visa kollegor hur de ställs in för hand. Det sprids, och andra avdelningar ber om samma hjälp."], ["One experienced nurse is teaching manual pump settings across wards.", "En erfaren sjuksköterska lär ut manuell inställning av pumparna på flera avdelningar."])
            ])
          ],
          pushback: {
            A: [
              pb(["Two nurses per pump", "Två sjuksköterskor per pump"], ["Every pump change now needs two nurses to check the dose by hand. On a ward with three nurses at night, that leaves one for everyone else. Do you keep the double-check for every infusion, or decide which ones can skip it?", "Varje ändring på en pump kräver nu två sjuksköterskor som kontrollerar dosen för hand. På en avdelning med tre sjuksköterskor på natten blir det en kvar till alla andra. Behåller ni dubbelkontrollen för varje infusion, eller bestämmer ni vilka som får hoppa över den?"]),
              pb(["Help arrives in the morning", "Hjälpen kommer i morgon bitti"], ["The device vendors say their engineers can be on site by morning at the earliest, and the biomedical team has only two people on call. Until then the double-checks rest on night staff who were never trained for this. Is your plan safe for the hours before help arrives?", "Leverantörerna säger att deras tekniker tidigast kan vara på plats i morgon bitti, och medicinteknik har bara två personer i beredskap. Fram till dess vilar dubbelkontrollerna på nattpersonal som aldrig utbildats för det här. Är er plan säker under timmarna innan hjälpen kommer?"]),
              pb(["The line keeps moving", "Gränsen flyttas hela tiden"], ["Widening redirection for imaging cases means every head injury now goes 40 minutes away. The region asks why your rules for which patients you keep have changed again in a few hours. Can you explain where the line is now, and why it will hold?", "Att utöka omdirigeringen för fall som kräver bilddiagnostik innebär att varje skallskada nu åker 40 minuter. Regionen frågar varför era regler för vilka patienter ni behåller har ändrats igen inom några timmar. Kan ni förklara var gränsen går nu, och varför den kommer att hålla?"])
            ],
            B: [
              pb(["Which drug library?", "Vilket läkemedelsbibliotek?"], ["Pharmacy says a dosing limit in the drug library was changed last week, and some pumps may not have received the update before the servers went down. Nobody can tell which. Do you keep using the pumps as normal when you can't say which version each one runs?", "Apoteket säger att en doseringsgräns i läkemedelsbiblioteket ändrades förra veckan, och att vissa pumpar kanske inte fick uppdateringen innan servrarna föll. Ingen kan säga vilka. Fortsätter ni använda pumparna som vanligt när ni inte vet vilken version varje pump kör?"]),
              pb(["Nurses refuse", "Sjuksköterskorna vägrar"], ["Two night-shift nurses refuse to start new infusions on pumps nobody can verify, and their ward manager backs them. Others are carrying on as told. Do you order them to continue, or admit that “as normal” no longer exists?", "Två sjuksköterskor på nattskiftet vägrar starta nya infusioner på pumpar som ingen kan verifiera, och deras avdelningschef stöttar dem. Andra fortsätter som de blivit tillsagda. Beordrar ni dem att fortsätta, eller medger ni att ”som vanligt” inte längre finns?"]),
              pb(["A fix without a date", "En lagning utan datum"], ["IT now estimates the device servers will take longer to rebuild than the patient record, because nobody has a rebuild procedure for them. “Fix the servers first” may mean days of unmanaged devices. Do you still plan around a fix you can't put a date on?", "IT bedömer nu att servrarna för medicinteknik tar längre tid att bygga upp än journalen, eftersom ingen har en rutin för att återskapa dem. ”Åtgärda servrarna först” kan betyda flera dagar med utrustning utan hantering. Planerar ni fortfarande kring en lagning ni inte kan sätta ett datum på?"])
            ],
            C: [
              pb(["Infusions already running", "Infusioner som redan pågår"], ["Stopping the affected pumps means stopping infusions already running: pain relief, insulin, drugs that cannot simply pause. The intensive care lead says some of those patients cannot be switched to manual methods safely tonight. Which patients are you willing to take off their pumps?", "Att sluta använda de drabbade pumparna innebär att stoppa infusioner som redan pågår: smärtlindring, insulin, läkemedel som inte bara kan pausas. Ansvarig på intensiven säger att en del av patienterna inte kan flyttas över till manuella metoder på ett säkert sätt i natt. Vilka patienter är ni beredda att koppla bort?"]),
              pb(["No scans tonight", "Inga undersökningar i natt"], ["Without the affected imaging equipment, the ED cannot rule out bleeding in head injuries. Every such patient must now travel 40 minutes to a hospital that is already busy. Is stopping the equipment really safer than using it carefully?", "Utan den drabbade utrustningen för bilddiagnostik kan akuten inte utesluta blödning vid skallskador. Varje sådan patient måste nu åka 40 minuter till ett sjukhus som redan har mycket att göra. Är det verkligen säkrare att stoppa utrustningen än att använda den försiktigt?"]),
              pb(["The devices look clean", "Utrustningen ser ren ut"], ["The biomedical engineer says there is no sign the pumps or scanners themselves are affected; only the servers that manage them are. Stopping the devices treats a server problem as a device problem. Do you keep the stop in place on a fear nobody can confirm?", "Den medicintekniska ingenjören säger att inget tyder på att pumparna eller röntgenutrustningen i sig är påverkade; det är bara servrarna som hanterar dem. Att stoppa utrustningen behandlar ett serverproblem som ett utrustningsproblem. Behåller ni stoppet på grund av en oro som ingen kan bekräfta?"])
            ]
          }
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
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because devices now run standalone with manual double-checks, every infusion takes twice as long, and the nurses on the wards are exhausted.", sv: "Eftersom utrustningen nu körs fristående med manuella dubbelkontroller tar varje infusion dubbelt så lång tid, och sjuksköterskorna på avdelningarna är utmattade." } }
        ],
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
          evaluation: [["Closes vendor access and reopens it under control", "Stänger leverantörsåtkomsten och öppnar den igen under kontroll"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Every vendor cut off", "Alla leverantörer avstängda"], [
              io(["The first session works", "Den första sessionen fungerar"], ["The first supervised, time-limited vendor session runs cleanly, with someone from your team watching every step. The supplier manager says the model works.", "Den första övervakade och tidsbegränsade leverantörssessionen går smidigt, med någon från ert team som följer varje steg. Leverantörsansvarig säger att modellen fungerar."], ["The first supervised vendor session completed without problems.", "Den första övervakade leverantörssessionen genomfördes utan problem."]),
              io(["A scanner loses support", "En röntgenapparat tappar supporten"], ["The vendor of a scanner the ED depends on says its remote monitoring has stopped and it cannot answer for faults until access is back. Radiology wants an exception tonight.", "Leverantören av en röntgenapparat som akuten är beroende av säger att fjärrövervakningen har slutat fungera och att de inte kan ta ansvar för fel förrän åtkomsten är tillbaka. Röntgen vill ha ett undantag i natt."], ["A critical scanner is without vendor support until access is restored.", "En kritisk röntgenapparat saknar leverantörssupport tills åtkomsten är tillbaka."], { reopen: true }),
              io(["A blocked login", "En blockerad inloggning"], ["Minutes after the cut, the firewall blocks a login attempt on another vendor's account. The vendor says it was not them, or at least nobody they can find.", "Några minuter efter avstängningen blockerar brandväggen ett inloggningsförsök på en annan leverantörs konto. Leverantören säger att det inte var de, eller i alla fall ingen de kan hitta."], ["A blocked login on another vendor's account is still unexplained.", "En blockerad inloggning på en annan leverantörs konto är fortfarande oförklarad."])
            ]),
            ir("i2", { notChosen: "A" }, ["Vendor doors left open", "Leverantörsdörrar lämnas öppna"], [
              io(["Fixed within the hour", "Lagat inom en timme"], ["A vendor uses its open access to fix a scanner fault remotely within the hour. Radiology is grateful and says this is exactly why access must stay.", "En leverantör använder sin öppna åtkomst för att laga ett fel på en röntgenapparat på distans inom en timme. Röntgen är tacksam och säger att det är precis därför åtkomsten måste finnas kvar."], ["A vendor fixed a scanner fault remotely through its open access.", "En leverantör lagade ett fel på en röntgenapparat på distans via sin öppna åtkomst."]),
              io(["“Is it closed?”", "”Är den stängd?”"], ["The region asks for written confirmation that all vendor access into the hospital is closed. You cannot give it, and the region says it will have to report that upwards.", "Regionen ber om en skriftlig bekräftelse på att all leverantörsåtkomst in till sjukhuset är stängd. Ni kan inte ge den, och regionen säger att den då måste rapportera det uppåt."], ["The region has been told vendor access is still open.", "Regionen har fått veta att leverantörsåtkomsten fortfarande är öppen."], { reopen: true, meters: { regulator: 1 } }),
              io(["A session at night", "En session mitt i natten"], ["An open vendor account logs in during the night. After an hour of calls, the vendor confirms it was one of their own technicians, doing routine work nobody had told you about.", "Ett öppet leverantörskonto loggar in under natten. Efter en timmes samtal bekräftar leverantören att det var en av deras egna tekniker, som gjorde rutinarbete som ingen hade berättat om."], ["A vendor session ran overnight unannounced; the vendor says it was theirs.", "En leverantörssession pågick oanmäld under natten; leverantören säger att det var deras."])
            ])
          ],
          pushback: {
            A: [
              pb(["Imaging stays stuck", "Bilddiagnostiken står still"], ["The imaging vendor says they cannot help restore the archive without remote access, and a supervised session needs someone from your own team watching it live. Radiology asks how long scans will stay stuck. Is the supervised route realistic tonight, or only correct on paper?", "Leverantören av bilddiagnostik säger att de inte kan hjälpa till att återställa arkivet utan fjärråtkomst, och en övervakad session kräver att någon i ert eget team följer den i realtid. Röntgen frågar hur länge undersökningarna ska fastna. Är den övervakade vägen realistisk i natt, eller bara korrekt på pappret?"]),
              pb(["No support, no liability", "Ingen support, inget ansvar"], ["Another device vendor writes that cutting their access breaches the service agreement, and that they will not answer for device faults while it lasts. Their equipment is on the wards right now. Do you accept unsupported equipment, or make your first exception on day one?", "En annan leverantör av medicinteknik skriver att avstängningen bryter mot serviceavtalet och att de inte tar ansvar för fel på utrustningen så länge den varar. Deras utrustning står på avdelningarna just nu. Accepterar ni utrustning utan support, eller gör ni ert första undantag redan första dygnet?"]),
              pb(["Who watches the session?", "Vem bevakar sessionen?"], ["The first request to reopen access arrives within the hour. Supervising it means someone watching every minute, and the only people who can do that are the ones rebuilding the patient record. Which matters more tonight?", "Den första begäran om att öppna åtkomsten igen kommer inom en timme. Att övervaka den kräver någon som följer varje minut, och de enda som kan det är de som bygger upp journalen igen. Vad är viktigast i natt?"])
            ],
            B: [
              pb(["How many other doors?", "Hur många andra dörrar?"], ["The supplier manager starts listing vendors with remote access and stops counting at a dozen. Nobody knows which of them have the same kind of always-on, password-only account. Is closing one door enough when you can't see the others?", "Leverantörsansvarig börjar lista leverantörer med fjärråtkomst och slutar räkna vid ett dussin. Ingen vet vilka av dem som har samma sorts ständigt öppna konto med bara lösenord. Räcker det att stänga en dörr när ni inte ser de andra?"]),
              pb(["Same setup, same person", "Samma upplägg, samma person"], ["IT finds that two other vendor accounts were set up the same way, by the same administrator, years ago. There is no sign yet that they were used. Do you leave them open because you have no evidence, or close them because you have no proof they are safe?", "IT upptäcker att två andra leverantörskonton sattes upp på samma sätt, av samma administratör, för flera år sedan. Ännu finns inga tecken på att de har använts. Låter ni dem vara öppna för att ni saknar bevis, eller stänger ni dem för att ni inte kan visa att de är säkra?"]),
              pb(["The vendor you need back", "Leverantören ni behöver tillbaka"], ["The vendor whose account you disabled supports equipment you badly need working again. Without remote access, they say their part of the recovery will take days longer. Do you reopen the very account the attackers used, and under what conditions?", "Leverantören vars konto ni spärrade ger support till utrustning ni verkligen behöver få igång. Utan fjärråtkomst säger de att deras del av återställningen tar flera dagar längre. Öppnar ni just det konto som angriparna använde, och på vilka villkor?"])
            ],
            C: [
              pb(["Theirs or the attacker's?", "Deras eller angriparens?"], ["The incident-response team points out that whoever used the vendor account may hold other vendor passwords too. With access left open, a login at three in the morning could be either. How will you tell the vendor's next session from the attacker's?", "Incidentteamet påpekar att den som använde leverantörskontot kan ha fler leverantörslösenord. När åtkomsten står öppen kan en inloggning mitt i natten vara vilken som helst av dem. Hur ska ni skilja leverantörens nästa session från angriparens?"]),
              pb(["The vendor wants it closed", "Leverantören vill stänga"], ["The vendor whose account was used asks you to suspend all their access while they check their own side. You are now keeping open a door that its owner doesn't trust. Can you still justify it for device support?", "Leverantören vars konto användes ber er stänga all deras åtkomst medan de kontrollerar sin egen sida. Ni håller nu öppen en dörr som inte ens dess ägare litar på. Kan ni fortfarande motivera det med supporten för utrustningen?"]),
              pb(["Still open, in writing", "Fortfarande öppen, skriftligt"], ["The CISO is asked to confirm in the incident log that the path the attackers used has been closed. The honest answer is no, by your own choice. Who signs a log entry saying the door into a hospital is still open?", "CISO ombeds bekräfta i incidentloggen att vägen som angriparna använde har stängts. Det ärliga svaret är nej, genom ert eget val. Vem skriver under en loggpost som säger att dörren in till ett sjukhus fortfarande står öppen?"])
            ]
          }
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
          minutes: 10,
          interrupts: [
            ir("i1", { chosen: "C" }, ["Back on the same servers", "Tillbaka på samma servrar"], [
              io(["The record is back", "Journalen är tillbaka"], ["Within hours the patient record is back on the wards. Clinicians are relieved, and some in the room say the evidence debate was a distraction.", "Inom några timmar är patientjournalen tillbaka på avdelningarna. Vårdpersonalen är lättad, och en del i rummet säger att diskussionen om spår var ett sidospår."], ["The record came back on the original servers within hours.", "Journalen kom tillbaka på originalservrarna inom några timmar."]),
              io(["Something left behind", "Något har lämnats kvar"], ["IT finds a scheduled task on a restored record server that nobody created. It has not run yet. Nobody can say what it does or whether the server can be trusted.", "IT hittar en schemalagd uppgift på en återställd journalserver som ingen har skapat. Den har inte körts än. Ingen kan säga vad den gör eller om servern går att lita på."], ["An unknown scheduled task was found on a restored record server.", "En okänd schemalagd uppgift hittades på en återställd journalserver."], { reopen: true }),
              io(["The police note it", "Polisen noterar det"], ["The police record that the servers were wiped after they asked for them to be preserved. They do not say whether that hurts the case; they only say it is in their file.", "Polisen antecknar att servrarna raderades efter att de bett om att de skulle säkras. De säger inte om det skadar utredningen; bara att det finns i deras akt."], ["The police have recorded that the servers were wiped against their request.", "Polisen har antecknat att servrarna raderades mot deras begäran."])
            ]),
            ir("i2", { notChosen: "C" }, ["The originals preserved", "Originalen bevaras"], [
              io(["Images complete", "Avbilderna är klara"], ["The images of the record servers are complete and verified. The police say they will be useful, and the incident-response team has its first clean copy to study.", "Avbilderna av journalservrarna är klara och kontrollerade. Polisen säger att de kommer att vara till nytta, och incidentteamet har sin första rena kopia att studera."], ["Verified images of the record servers are now secured.", "Kontrollerade avbilder av journalservrarna är nu säkrade."]),
              io(["The restore crawls", "Återställningen kryper fram"], ["The restore runs far slower than estimated. IT now says the record will not be back on the wards before the morning, and the clinical lead asks whether you would choose the same again.", "Återställningen går mycket långsammare än beräknat. IT säger nu att journalen inte är tillbaka på avdelningarna före morgonen, och den kliniska ledningen frågar om ni skulle välja likadant igen."], ["The record restore is running far behind its first estimate.", "Återställningen av journalen ligger långt efter den första bedömningen."], { reopen: true }),
              io(["Days missing", "Dagar saknas"], ["The backup chosen for the restore is older than anyone hoped. When the record returns, recent days of notes will be missing and must be filled in from paper.", "Säkerhetskopian som valts för återställningen är äldre än någon hoppats. När journalen kommer tillbaka saknas de senaste dagarnas anteckningar, och de måste fyllas i från papper."], ["The restored record will lack recent entries that must be added from paper.", "Den återställda journalen kommer att sakna de senaste anteckningarna, som måste föras in från papper."])
            ])
          ],
          pushback: {
            A: [
              pb(["How clean is clean?", "Hur ren är ren?"], ["The newest backup that survived was taken well after the vendor account was first used, {{num.vendorDays}} days ago. Nobody can yet say it is free of what the attackers left. Do you restore it to get the record back, or keep looking for an older one?", "Den nyaste säkerhetskopian som klarade sig togs långt efter att leverantörskontot först användes, för {{num.vendorDays}} dagar sedan. Ingen kan ännu säga att den är fri från det angriparna lämnade. Återställer ni den för att få tillbaka journalen, eller letar ni vidare efter en äldre?"]),
              pb(["No new hardware tonight", "Ingen ny hårdvara i natt"], ["Procurement can find new servers, but not before tomorrow afternoon. The region offers to lend machines, but you didn't build them and don't know what is on them. Do you wait for your own hardware, or restore onto machines you can't vouch for?", "Inköp kan få fram nya servrar, men inte före i morgon eftermiddag. Regionen erbjuder sig att låna ut maskiner, men ni har inte byggt dem och vet inte vad som finns på dem. Väntar ni på er egen hårdvara, eller återställer ni på maskiner ni inte kan gå i god för?"]),
              pb(["Evidence over patients?", "Spår före patienter?"], ["The clinical lead learns that new hardware adds hours compared with restoring straight onto the old servers. “So you are choosing evidence over patients after all,” they say. How do you defend those extra hours to the people still working on paper?", "Den kliniska ledningen får veta att ny hårdvara lägger till flera timmar jämfört med att återställa direkt på de gamla servrarna. ”Så ni väljer spår före patienter ändå”, säger hen. Hur försvarar ni de extra timmarna inför dem som fortfarande arbetar på papper?"])
            ],
            B: [
              pb(["Another night on paper", "Ännu en natt på papper"], ["Imaging the record servers takes six hours, and the restore only starts after that. The wards face another night on paper with staff who have not slept. Is the evidence worth a second night of transcription errors?", "Att avbilda journalservrarna tar sex timmar, och återställningen börjar först efter det. Avdelningarna går mot ännu en natt på papper med personal som inte har sovit. Är spåren värda en andra natt med fel vid avskrift?"]),
              pb(["The police can't promise", "Polisen kan inte lova"], ["Asked what the images will achieve, the police say they may help identify the group, but they cannot promise an arrest or a timeline. You are delaying the patient record for a maybe. Do you still wait?", "På frågan vad avbilderna ska ge svarar polisen att de kanske hjälper till att identifiera gruppen, men att de inte kan lova något gripande eller någon tidsplan. Ni skjuter upp journalen för ett kanske. Väntar ni ändå?"]),
              pb(["The region hears “police”", "Regionen hör ”polisen”"], ["The region asks when you will be back to full capacity. Your answer, “after the imaging”, is heard as “after the police”. How do you explain to an overloaded neighbour that their wait depends on your evidence?", "Regionen frågar när ni är tillbaka i full kapacitet. Ert svar, ”efter avbildningen”, uppfattas som ”efter polisen”. Hur förklarar ni för en överbelastad granne att deras väntan beror på era spår?"])
            ],
            C: [
              pb(["Same disks, same risk", "Samma diskar, samma risk"], ["IT warns that nobody has checked what the attackers may have left on those servers. If the record comes back and is encrypted again, you start over on paper with even less trust. Are you willing to bet the record on servers you haven't cleaned?", "IT varnar för att ingen har kontrollerat vad angriparna kan ha lämnat kvar på servrarna. Om journalen kommer tillbaka och krypteras igen börjar ni om på papper med ännu mindre förtroende. Är ni beredda att satsa journalen på servrar ni inte har rensat?"]),
              pb(["The police want it noted", "Polisen vill ha det noterat"], ["The police say wiping the servers destroys the best evidence they have, and they want it recorded that you were asked to preserve it. Who signs off on destroying it, and how will that decision read when the case is reviewed?", "Polisen säger att om servrarna raderas förstörs de bästa spår de har, och de vill att det dokumenteras att ni ombads säkra dem. Vem godkänner att de förstörs, och hur kommer det beslutet att se ut när ärendet granskas?"]),
              pb(["The shortcut stalls", "Genvägen fastnar"], ["Halfway through, the restore on the old servers stops with disk errors nobody can explain. The quick option is no longer quick. Do you push on, or switch to new hardware now and admit the shortcut cost you time?", "Halvvägs stannar återställningen på de gamla servrarna med diskfel som ingen kan förklara. Det snabba alternativet är inte längre snabbt. Kör ni vidare, eller byter ni till ny hårdvara nu och medger att genvägen kostade tid?"])
            ]
          }
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
        branches: [
          { when: { decision: "d5", option: "A" }, narrativeAppend: { en: "Because the record was restored on new hardware while the originals were imaged, the police say part of the evidence on the old disks was lost in the rush.", sv: "Eftersom journalen återställdes på ny hårdvara medan originalen avbildades säger polisen att en del av bevisen på de gamla diskarna gick förlorade i brådskan." } }
        ],
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
          evaluation: [["Reports promptly and supports patients", "Anmäler snabbt och stöttar patienterna"]],
          interrupts: [
            ir("i1", { chosen: "C" }, ["Paying on the table", "Betalning på bordet"], [
              io(["They answer fast", "De svarar snabbt"], ["Within minutes of first contact, the group replies with a new sample of records as “proof” and offers a lower price for a quick deal. The speed itself unsettles the room.", "Inom några minuter efter den första kontakten svarar gruppen med ett nytt urval journaler som ”bevis” och erbjuder ett lägre pris för en snabb uppgörelse. Själva snabbheten oroar rummet."], ["The group has replied and offered a lower price for a quick deal.", "Gruppen har svarat och erbjudit ett lägre pris för en snabb uppgörelse."]),
              io(["It gets out", "Det läcker ut"], ["A journalist calls: they have heard the hospital is considering paying. Staff are already discussing it on the wards, and patients' relatives are asking the switchboard.", "En journalist ringer: hen har hört att sjukhuset överväger att betala. Personalen diskuterar det redan på avdelningarna, och anhöriga frågar växeln."], ["It is publicly known that the hospital is considering paying.", "Det är offentligt känt att sjukhuset överväger att betala."], { reopen: true, meters: { media: 1 } }),
              io(["Legal is unsure", "Juristen är osäker"], ["Legal's first view is that a public hospital may not be allowed to pay at all, but the question has never been tested. It will take days to get a firm answer.", "Juristens första bedömning är att ett offentligt sjukhus kanske inte alls får betala, men frågan har aldrig prövats. Det tar flera dagar att få ett säkert svar."], ["Whether the hospital may lawfully pay is still unresolved.", "Om sjukhuset lagligt får betala är fortfarande oklart."])
            ]),
            ir("i2", { notChosen: "C" }, ["No payment considered", "Ingen betalning övervägs"], [
              io(["A countdown appears", "En nedräkning dyker upp"], ["The leak site now shows a countdown next to the hospital's name. The group says the first batch of records goes public when it reaches zero.", "Läcksajten visar nu en nedräkning bredvid sjukhusets namn. Gruppen säger att den första omgången journaler publiceras när den når noll."], ["A public countdown to publication runs on the leak site.", "En offentlig nedräkning till publicering pågår på läcksajten."], { meters: { media: 1 } }),
              io(["The regulator calls back", "Tillsynen ringer tillbaka"], ["{{reg.dpaShort}} acknowledges the matter and asks for the number of affected patients within days. You do not have that number, and may not have it in time.", "{{reg.dpaShort}} bekräftar ärendet och vill ha antalet berörda patienter inom några dagar. Ni har inte den siffran, och kanske inte heller i tid."], ["{{reg.dpaShort}} expects the number of affected patients within days.", "{{reg.dpaShort}} förväntar sig antalet berörda patienter inom några dagar."], { reopen: true, meters: { regulator: 1 } }),
              io(["Screenshots don't match", "Skärmbilderna stämmer inte"], ["In a first check, IT cannot match some of the leaked screenshots to any record it can find. They could be from an old system, or the check could simply be incomplete.", "Vid en första kontroll kan IT inte matcha en del av de läckta skärmbilderna mot någon journal de hittar. De kan komma från ett gammalt system, eller så är kontrollen helt enkelt ofullständig."], ["A first check could not match some leaked screenshots to known records.", "En första kontroll kunde inte matcha en del läckta skärmbilder mot kända journaler."])
            ])
          ],
          pushback: {
            A: [
              pb(["The helpline drowns", "Stödlinjen dränks"], ["Within an hour of opening, the helpline has a queue in the thousands, and the nurses answering it are the same ones still catching up on paper. Do you take more staff off the wards for worried callers, or let the line fail?", "Inom en timme efter öppningen har stödlinjen en kö på flera tusen, och sjuksköterskorna som svarar är samma som fortfarande arbetar ikapp på papper. Tar ni fler från avdelningarna för att svara oroliga, eller låter ni linjen haverera?"]),
              pb(["Open about what?", "Öppna om vad?"], ["You still cannot say which patients are in the copied data. Telling everyone openly means frightening people whose records may not be there at all. Is “we don't know yet” honest enough to send to every patient?", "Ni kan fortfarande inte säga vilka patienter som finns i de kopierade uppgifterna. Att berätta öppet för alla innebär att skrämma människor vars journaler kanske inte alls finns där. Är ”vi vet inte än” tillräckligt ärligt att skicka till varje patient?"]),
              pb(["Refusal answered", "Vägran besvarad"], ["Within hours of your public refusal, the group says it will publish one ward's records first and names the ward. Staff there are now taking calls from frightened patients. Does refusing in public still feel like the right way to have said it?", "Inom några timmar efter er offentliga vägran meddelar gruppen att den först kommer att publicera journaler från en avdelning, och namnger den. Personalen där tar nu emot samtal från rädda patienter. Känns det fortfarande rätt att ha vägrat offentligt?"])
            ],
            B: [
              pb(["Patients hear it from the press", "Patienter får veta via pressen"], ["A newspaper quotes a patient who recognised their own record in the leaked screenshots. They learned it from a journalist, not from you. How long can “until it's confirmed” last?", "En tidning citerar en patient som kände igen sin egen journal i de läckta skärmbilderna. Hen fick veta det av en journalist, inte av er. Hur länge kan ”tills det är bekräftat” hålla?"]),
              pb(["The DPO objects", "Dataskyddsombudet invänder"], ["The data protection officer says the rules for health data don't wait for full confirmation when the risk to patients is high, and wants their objection on record. Do you overrule your own DPO?", "Dataskyddsombudet säger att reglerna för hälsouppgifter inte väntar på full bekräftelse när risken för patienterna är hög, och vill att invändningen förs till protokollet. Kör ni över ert eget dataskyddsombud?"]),
              pb(["Confirmation takes weeks", "Bekräftelsen tar veckor"], ["IT estimates that checking the claimed {{num.records}} records against the reporting database could take weeks. Your wait has no end date. What, if anything, do patients hear from you in the meantime?", "IT bedömer att det kan ta veckor att stämma av de påstådda {{num.records}} journalerna mot rapportdatabasen. Er väntan har inget slutdatum. Vad får patienterna höra från er under tiden, om något?"])
            ],
            C: [
              pb(["Public money, whose call?", "Offentliga pengar, vems beslut?"], ["Legal points out that a public hospital paying criminals may not be allowed at all, and that the board would have to decide. Even “considering” it needs someone's authority. Who in this room has it?", "Juristen påpekar att det kanske inte alls är tillåtet för ett offentligt sjukhus att betala brottslingar, och att styrelsen i så fall måste besluta. Även att ”överväga” det kräver någons mandat. Vem i det här rummet har det?"]),
              pb(["A promise from thieves", "Ett löfte från tjuvar"], ["Your incident-response partner says groups that are paid often keep the data anyway, and some sell it later. You would be paying for a promise from the people who took it. What exactly are you buying?", "Er incidentpartner säger att grupper som får betalt ofta behåller uppgifterna ändå, och att en del säljer dem senare. Ni skulle betala för ett löfte från dem som tog uppgifterna. Vad är det egentligen ni köper?"]),
              pb(["The staff hear about it", "Personalen får höra det"], ["Word spreads that paying is being considered. A senior doctor says staff did not work two nights on paper so that management could fund the next attack on a hospital. How do you lead people who think this is wrong?", "Det sprids att en betalning övervägs. En överläkare säger att personalen inte slet två nätter på papper för att ledningen skulle finansiera nästa angrepp mot ett sjukhus. Hur leder ni människor som tycker att det här är fel?"])
            ]
          }
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
        reconsider: { decision: "d2", pressure: { en: "The neighbouring hospital is at capacity because of your redirection, and the region asks you to take patients back. Was redirecting the right call?", sv: "Grannsjukhuset är fullt på grund av er omdirigering, och regionen ber er ta tillbaka patienter. Var omdirigeringen rätt beslut?" } },
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
          evaluation: [["Ties the return to clinical readiness", "Kopplar återgången till klinisk beredskap"]],
          interrupts: [
            ir("i1", { chosen: "B" }, ["Fully open again", "Fullt öppet igen"], [
              io(["The first hours hold", "De första timmarna håller"], ["The first hours of full receiving go better than feared. The region thanks you publicly, and some in the room say the caution of the first night was overdone.", "De första timmarna med fullt mottagande går bättre än befarat. Regionen tackar er offentligt, och en del i rummet säger att försiktigheten den första natten var överdriven."], ["The first hours of full receiving went without incident.", "De första timmarna med fullt mottagande gick utan incidenter."], { meters: { trust: 1 } }),
              io(["A result goes missing", "Ett svar försvinner"], ["A critical lab result for an ED patient was lost between paper and the partly restored system, and was found hours late. The emergency physician says this is what full receiving looks like.", "Ett kritiskt provsvar för en patient på akuten försvann mellan papperet och det delvis återställda systemet och hittades flera timmar för sent. Akutläkaren säger att det är så här fullt mottagande ser ut."], ["A critical lab result was lost for hours after full receiving resumed.", "Ett kritiskt provsvar var borta i flera timmar efter att fullt mottagande återupptogs."], { reopen: true }),
              io(["The neighbour is still full", "Grannen är fortfarande full"], ["Even with your doors open, the neighbouring ED reports it is still overloaded. Nobody can say whether it will ease in hours or days.", "Trots att era dörrar är öppna rapporterar grannsjukhusets akut att den fortfarande är överbelastad. Ingen kan säga om det lättar inom timmar eller dagar."], ["The neighbouring ED remained overloaded after you reopened.", "Grannsjukhusets akut var fortfarande överbelastad efter att ni öppnat igen."])
            ]),
            ir("i2", { notChosen: "B" }, ["Not fully open", "Inte fullt öppet"], [
              io(["The region accepts, for now", "Regionen godtar, för tillfället"], ["The region accepts your terms until the next coordination meeting. It makes clear that it expects real progress by then.", "Regionen godtar era villkor fram till nästa samordningsmöte. Den gör klart att den förväntar sig verkliga framsteg till dess."], ["The region accepted your terms until the next coordination meeting.", "Regionen godtog era villkor fram till nästa samordningsmöte."]),
              io(["Queue in their ambulance bay", "Kö i deras ambulanshall"], ["Ambulances are queuing outside the neighbouring hospital, and a local news site has pictures. The caption asks why your hospital is still turning patients away.", "Ambulanser köar utanför grannsjukhuset, och en lokal nyhetssajt har bilder. Bildtexten frågar varför ert sjukhus fortfarande vänder bort patienter."], ["Pictures of ambulances queuing at the neighbour are in the news.", "Bilder på ambulanser som köar hos grannen finns i nyheterna."], { reopen: true, meters: { media: 1 } }),
              io(["Crews bring them anyway", "Besättningarna kommer ändå"], ["Some ambulance crews bring patients you said you could not take yet, saying the neighbour turned them away. Your rules and the region's reality do not quite match.", "En del ambulansbesättningar kommer med patienter som ni sa att ni inte kunde ta än, och säger att grannen vände bort dem. Era regler och regionens verklighet stämmer inte riktigt överens."], ["Crews have brought patients outside your agreed categories.", "Besättningar har kommit med patienter utanför de kategorier ni kommit överens om."])
            ])
          ],
          pushback: {
            A: [
              pb(["The region wants times", "Regionen vill ha tider"], ["The region's coordinator says “staged, tied to systems” is not something they can tell ambulance crews. They want patient categories and times by tonight. Can you commit to times when nobody knows when imaging returns?", "Regionens samordnare säger att ”stegvis, kopplat till systemen” inte är något de kan säga till ambulanspersonalen. De vill ha patientkategorier och tider i kväll. Kan ni lova tider när ingen vet när bilddiagnostiken är tillbaka?"]),
              pb(["Support, but not yet", "Stöd, men inte än"], ["National coordination replies that support can be arranged, but not within 12 hours. The neighbour's overload is happening now. Does your staged plan still work without the help it was built on?", "Den nationella samordningen svarar att stöd kan ordnas, men inte inom 12 timmar. Grannens överbelastning pågår nu. Fungerar er stegvisa plan fortfarande utan den hjälp den byggde på?"]),
              pb(["Whose patients first?", "Vems patienter först?"], ["Each specialty lead argues that their patients should be in the first category to return. Every category you name leaves another still redirected. Who decides the order, and how do you make it stick?", "Varje ansvarig för en specialitet hävdar att just deras patienter ska vara med i den första kategorin som kommer tillbaka. Varje kategori ni nämner lämnar en annan fortfarande omdirigerad. Vem bestämmer ordningen, och hur får ni den att hålla?"])
            ],
            B: [
              pb(["Same gaps as night one", "Samma luckor som första natten"], ["In 12 hours imaging will still be down and lab results will still come by runner. The ED physician says resuming fully means receiving patients you couldn't treat safely on the first night. What has actually changed since then?", "Om 12 timmar ligger bilddiagnostiken fortfarande nere och provsvaren kommer fortfarande med springpojke. Akutläkaren säger att full återgång innebär att ta emot patienter ni inte kunde behandla säkert den första natten. Vad har egentligen förändrats sedan dess?"]),
              pb(["The most tired take the most", "De tröttaste tar mest"], ["The nursing lead says several staff have worked double shifts for two days and are making small mistakes. Full receiving puts the heaviest load on the most exhausted people. Can you staff it safely, and who checks?", "Vårdenhetschefen säger att flera i personalen har arbetat dubbla pass i två dagar och börjar göra små misstag. Fullt mottagande lägger den tyngsta bördan på de mest utmattade. Kan ni bemanna det säkert, och vem kontrollerar det?"]),
              pb(["Checks or the deadline", "Kontroller eller tidsgränsen"], ["IT says meeting the 12-hour deadline means skipping checks on the systems it restores. A rushed restore risks bringing something back that should not be there. Do you trade the checks for the region's deadline?", "IT säger att om tidsgränsen på 12 timmar ska hållas måste kontrollerna av de återställda systemen hoppas över. En stressad återställning riskerar att föra tillbaka något som inte borde finnas där. Byter ni bort kontrollerna mot regionens tidsgräns?"])
            ],
            C: [
              pb(["“All systems” means weeks", "”Alla system” betyder veckor"], ["IT says some systems, such as scheduling, may take weeks to come back. Waiting for all of them could mean redirecting ambulances for weeks. Is that what you intend, and can the region carry it?", "IT säger att en del system, till exempel schemaläggningen, kan ta veckor att få tillbaka. Att vänta på alla kan betyda att ambulanser omdirigeras i veckor. Är det vad ni avser, och klarar regionen att bära det?"]),
              pb(["The decision may be taken from you", "Beslutet kan tas ifrån er"], ["The region replies that if you refuse, national coordination may step in and set the terms. You could lose the choice entirely. Is refusing worth losing control over when and how you reopen?", "Regionen svarar att om ni vägrar kan den nationella samordningen gå in och bestämma villkoren. Ni kan förlora valet helt. Är en vägran värd att tappa kontrollen över när och hur ni öppnar igen?"]),
              pb(["Waiting in their ambulance bay", "Väntan i deras ambulanshall"], ["The neighbouring hospital reports a patient who waited hours in an ambulance outside its overloaded ED. Its staff ask openly why yours is still closed. What do you say to them?", "Grannsjukhuset rapporterar en patient som fick vänta i flera timmar i en ambulans utanför deras överbelastade akut. Deras personal frågar öppet varför er akut fortfarande är stängd. Vad säger ni till dem?"])
            ]
          }
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
          evaluation: [["Combines technical prerequisites with clinical priority", "Förenar tekniska förutsättningar med klinisk prioritet"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["A joint order", "En gemensam ordning"], [
              io(["The first restores land", "De första återställningarna lyckas"], ["The first two systems in the joint order come back on schedule. Both IT and the clinicians point to it as proof their side was listened to.", "De två första systemen i den gemensamma ordningen kommer tillbaka enligt plan. Både IT och vårdpersonalen pekar på det som bevis för att deras sida blev lyssnad på."], ["The first two restores in the joint order finished on schedule.", "De två första återställningarna i den gemensamma ordningen blev klara enligt plan."]),
              io(["The signature is withdrawn", "Underskriften dras tillbaka"], ["Imaging slips by a day, and the clinical lead withdraws the sign-off: “This is not what I agreed to.” Work continues, but the order no longer has clinical backing.", "Bilddiagnostiken försenas en dag, och den kliniska ledningen drar tillbaka sitt godkännande: ”Det här är inte vad jag gick med på.” Arbetet fortsätter, men ordningen saknar nu klinisk förankring."], ["The clinical lead withdrew sign-off after imaging slipped.", "Den kliniska ledningen drog tillbaka sitt godkännande när bilddiagnostiken försenades."], { reopen: true }),
              io(["A hidden dependency", "Ett dolt beroende"], ["IT discovers that lab needs part of the scheduling system to print sample labels. Nobody knew. It may cost hours, or nothing at all.", "IT upptäcker att labbet behöver en del av schemaläggningssystemet för att skriva ut provetiketter. Ingen visste det. Det kan kosta flera timmar, eller ingenting alls."], ["Lab depends on part of scheduling for sample labels.", "Labbet är beroende av en del av schemaläggningen för provetiketter."])
            ]),
            ir("i2", { notChosen: "A" }, ["One side's order", "Den ena sidans ordning"], [
              io(["Wards go direct", "Avdelningarna går direkt"], ["Ward leads who feel unheard start calling IT directly with their own priorities. Each call pulls someone off the plan for half an hour.", "Avdelningschefer som känner sig överkörda börjar ringa IT direkt med sina egna prioriteringar. Varje samtal drar någon från planen en halvtimme."], ["Ward leads are bypassing the plan and calling IT directly.", "Avdelningschefer går förbi planen och ringer IT direkt."]),
              io(["Nobody owns the risk", "Ingen äger risken"], ["The side that was overruled puts in writing that it will not answer for the outcome. When something goes wrong, nobody in the room will own it.", "Den sida som kördes över skriver att den inte tar ansvar för resultatet. När något går fel kommer ingen i rummet att äga det."], ["Responsibility for the restore order is now disputed in writing.", "Ansvaret för ordningen för återställning är nu ifrågasatt skriftligt."], { reopen: true }),
              io(["Faster than expected", "Snabbare än väntat"], ["The first restores finish faster than estimated. It is unclear whether the order helped or the estimates were simply too cautious.", "De första återställningarna blir klara snabbare än beräknat. Det är oklart om ordningen hjälpte eller om bedömningarna bara var för försiktiga."], ["The first restores finished ahead of estimate, for unclear reasons.", "De första återställningarna blev klara före beräknad tid, av oklara skäl."])
            ])
          ],
          pushback: {
            A: [
              pb(["Everything is a prerequisite", "Allt är en förutsättning"], ["IT's list of “technical prerequisites” keeps growing: directory, backups, monitoring, network checks. The clinicians say the joint order is just IT's order with a signature on it. Where do you draw the line?", "IT:s lista över ”tekniska förutsättningar” växer hela tiden: katalogtjänst, säkerhetskopior, övervakning, nätverkskontroller. Klinikerna säger att den gemensamma ordningen bara är IT:s ordning med en underskrift. Var drar ni gränsen?"]),
              pb(["No signature", "Ingen underskrift"], ["The clinical lead refuses to sign while lab and imaging come after the full record. Without the sign-off, the joint order stalls. Do you change the order to get the signature, or decide without the approval you promised?", "Den kliniska ledningen vägrar skriva under så länge lab och bilddiagnostik kommer efter hela journalen. Utan godkännandet står den gemensamma ordningen still. Ändrar ni ordningen för att få underskriften, eller beslutar ni utan det godkännande ni lovade?"]),
              pb(["Half a day of meetings", "En halv dag av möten"], ["Agreeing the joint order has taken half a day, and nothing was restored while you negotiated. Capacity sat idle. Was agreement worth the hours it cost, and will the next change go through the same process?", "Att komma överens om den gemensamma ordningen har tagit en halv dag, och inget återställdes medan ni förhandlade. Kapaciteten stod oanvänd. Var enigheten värd timmarna den kostade, och ska nästa ändring gå igenom samma process?"])
            ],
            B: [
              pb(["Lab and imaging wait", "Lab och bilddiagnostik får vänta"], ["Under IT's order, lab and imaging come after the full record, which could take days. The ED keeps sending imaging cases away meanwhile. Is a technically sound order also a safe one for patients?", "Med IT:s ordning kommer lab och bilddiagnostik efter hela journalen, vilket kan ta dagar. Under tiden fortsätter akuten att skicka iväg fall som kräver bilddiagnostik. Är en tekniskt sund ordning också en säker ordning för patienterna?"]),
              pb(["“Just one quick restore”", "”Bara en snabb återställning”"], ["Ward leads say nobody asked them, and start calling IT directly for “just one quick” restore of their own system. Each request pulls people off the plan. Do you hold the line, or let exceptions eat the order?", "Avdelningscheferna säger att ingen frågade dem och börjar ringa IT direkt om ”bara en snabb” återställning av sitt eget system. Varje förfrågan drar folk från planen. Står ni fast, eller låter ni undantagen äta upp ordningen?"]),
              pb(["The dependency was a guess", "Beroendet var en gissning"], ["Halfway through, IT discovers that lab could have run with only the directory back, without the full record. The order was partly built on an assumption. Do you reshuffle now, or finish what was planned?", "Halvvägs upptäcker IT att labbet hade kunnat fungera med bara katalogtjänsten tillbaka, utan hela journalen. Ordningen byggde delvis på ett antagande. Kastar ni om nu, eller slutför ni det som var planerat?"])
            ],
            C: [
              pb(["Nobody can log in", "Ingen kan logga in"], ["Lab is restored first, but nobody can sign in because the directory isn't back. Hours of scarce capacity went into a system no one can use. Do you return to the dependencies, or keep forcing the clinical order?", "Labbet återställs först, men ingen kan logga in eftersom katalogtjänsten inte är tillbaka. Timmar av knapp kapacitet gick till ett system som ingen kan använda. Går ni tillbaka till beroendena, eller fortsätter ni att driva igenom den kliniska ordningen?"]),
              pb(["A shortcut on accounts", "En genväg för konton"], ["To make lab usable early, IT proposes temporary local accounts with shared passwords that bypass the directory. The CISO says that recreates exactly the kind of weak access that let the attackers in. Do you accept it to keep the clinical order?", "För att få labbet användbart tidigt föreslår IT tillfälliga lokala konton med delade lösenord som går förbi katalogtjänsten. CISO säger att det återskapar precis den sortens svaga åtkomst som släppte in angriparna. Accepterar ni det för att hålla fast vid den kliniska ordningen?"]),
              pb(["IT won't own it", "IT tar inte ansvaret"], ["The IT lead says the team will carry out the order but will not own the outcome if restores fail. Responsibility is now split from the decision. Who answers when the clinical order breaks something?", "IT-chefen säger att teamet genomför ordningen men inte tar ansvar för resultatet om återställningar misslyckas. Ansvaret är nu skilt från beslutet. Vem svarar när den kliniska ordningen förstör något?"])
            ]
          }
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
        reconsider: { decision: "d6", pressure: { en: "A politician on the board urges payment to save lives, and the group has doubled the demand. Does your answer to the leak still hold?", sv: "En politiker i styrelsen kräver betalning för att rädda liv, och gruppen har fördubblat kravet. Håller ert svar på läckan fortfarande?" } },
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
          evaluation: [["Explains the position with facts", "Förklarar hållningen med fakta"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["A public no", "Ett offentligt nej"], [
              io(["Staff stand behind you", "Personalen ställer sig bakom er"], ["Senior doctors and nurses publicly back the refusal, and the tone of the coverage shifts. Some in the room feel the pressure is over.", "Överläkare och sjuksköterskor ställer sig offentligt bakom vägran, och tonen i rapporteringen skiftar. En del i rummet känner att trycket har släppt."], ["Senior staff publicly backed the refusal to pay.", "Ledande personal ställde sig offentligt bakom vägran att betala."], { meters: { trust: 1 } }),
              io(["The board member calls a vote", "Ledamoten kräver omröstning"], ["The board member who urged payment demands an extraordinary board meeting to overturn your position. Several colleagues have signed the request.", "Styrelseledamoten som krävde betalning begär ett extra styrelsemöte för att ändra er hållning. Flera kollegor har skrivit under begäran."], ["An extraordinary board meeting on payment has been requested.", "Ett extra styrelsemöte om betalning har begärts."], { reopen: true }),
              io(["More screenshots", "Fler skärmbilder"], ["The group answers your statement with more screenshots and a new deadline, but publishes nothing else yet. Nobody can say whether that is a bluff.", "Gruppen svarar på ert uttalande med fler skärmbilder och en ny tidsgräns, men publicerar inget mer än så länge. Ingen kan säga om det är en bluff."], ["The group answered the refusal with more screenshots and a new deadline.", "Gruppen svarade på vägran med fler skärmbilder och en ny tidsgräns."], { meters: { media: 1 } })
            ]),
            ir("i2", { notChosen: "A" }, ["No clear refusal", "Ingen tydlig vägran"], [
              io(["Read as weakness", "Tolkas som svaghet"], ["Commentators read the lack of a clear public position as a hospital getting ready to pay. The group quotes the coverage on its leak site.", "Kommentatorer tolkar avsaknaden av en tydlig offentlig hållning som att sjukhuset förbereder sig på att betala. Gruppen citerar rapporteringen på sin läcksajt."], ["The hospital is widely seen as preparing to pay.", "Sjukhuset uppfattas allmänt som att det förbereder en betalning."], { reopen: true, meters: { media: 1 } }),
              io(["Recovery overtakes it", "Återställningen hinner före"], ["IT reports that the patient record is now fully restored from backups. A decryptor would change little, and the question is now almost only about the stolen data.", "IT rapporterar att patientjournalen nu är helt återställd från säkerhetskopior. En dekrypterare skulle ändra lite, och frågan handlar nu nästan bara om de stulna uppgifterna."], ["The patient record is fully restored without a decryptor.", "Patientjournalen är helt återställd utan dekrypterare."]),
              io(["A hospital abroad paid", "Ett sjukhus utomlands betalade"], ["News arrives that a hospital abroad paid a similar group last month. Some say it got its data back; others say the data appeared for sale anyway.", "Det kommer nyheter om att ett sjukhus utomlands betalade en liknande grupp förra månaden. Vissa säger att det fick tillbaka sina uppgifter; andra att uppgifterna ändå dök upp till försäljning."], ["Conflicting reports circulate about a hospital abroad that paid.", "Motstridiga uppgifter cirkulerar om ett sjukhus utomlands som betalade."])
            ])
          ],
          pushback: {
            A: [
              pb(["The board member hits back", "Styrelseledamoten slår tillbaka"], ["The board member who urged payment says on the radio that management is gambling with patients' lives. Your public explanation now sounds like an internal quarrel. Do you answer them in public, or take it inside the board?", "Styrelseledamoten som krävde betalning säger i radio att ledningen spelar med patienternas liv. Er offentliga förklaring låter nu som ett internt gräl. Svarar ni offentligt, eller tar ni det inom styrelsen?"]),
              pb(["“Recovery under way” — until when?", "”Återställningen pågår” – till när?"], ["Explaining that recovery is under way invites the obvious question: how long? If you give a date and miss it, the case for paying comes back stronger. What date are you willing to stand behind?", "Att förklara att återställningen pågår väcker den självklara frågan: hur länge? Om ni ger ett datum och missar det kommer argumentet för att betala tillbaka starkare. Vilket datum är ni beredda att stå för?"]),
              pb(["The clock runs out", "Tiden går ut"], ["Your refusal is public, and the group's deadline is running. Patients ask the switchboard whether your principle is worth their privacy. What do the people answering the phones tell them?", "Er vägran är offentlig, och gruppens tidsgräns löper. Patienter frågar växeln om er princip är värd deras integritet. Vad ska de som svarar i telefon säga?"])
            ],
            B: [
              pb(["“In talks”", "”Förhandlar”"], ["The group posts that the hospital is “in talks”. The board member takes it as proof you will pay, and the media follow. How do you deny planning to pay while you are negotiating?", "Gruppen publicerar att sjukhuset ”förhandlar”. Styrelseledamoten tar det som bevis på att ni kommer att betala, och medierna hänger på. Hur förnekar ni att ni planerar att betala samtidigt som ni förhandlar?"]),
              pb(["Who talks to them?", "Vem pratar med dem?"], ["Nobody in the hospital has done this before, and legal says a public body may need board approval even to negotiate. Someone has to speak to criminals in your name. Who is authorised to do that?", "Ingen på sjukhuset har gjort det här förut, och juristen säger att ett offentligt organ kan behöva styrelsens godkännande bara för att förhandla. Någon måste tala med brottslingar i ert namn. Vem har mandat att göra det?"]),
              pb(["Time for what?", "Tid för vad?"], ["IT says a decryptor would barely speed recovery now. You are buying time you don't seem to need, at the price of looking ready to pay. What exactly does the delay give you?", "IT säger att en dekrypterare knappt skulle påskynda återställningen nu. Ni köper tid ni inte verkar behöva, till priset av att se betalningsvilliga ut. Vad ger fördröjningen er egentligen?"])
            ],
            C: [
              pb(["The board splits", "Styrelsen splittras"], ["The board meets and divides along party lines; nobody wants to put their name to a vote. The group's deadline keeps running. Who decides when the board won't?", "Styrelsen sammanträder och delar sig efter partilinjer; ingen vill sätta sitt namn på en omröstning. Gruppens tidsgräns fortsätter att löpa. Vem beslutar när styrelsen inte gör det?"]),
              pb(["Into the politician's hands", "I politikerns händer"], ["Deferring puts the decision in a forum where one member has already said “pay” on television. The facts you hold about recovery may never reach the vote. Are you comfortable with that, and what will you put in front of them?", "Att lämna över beslutet lägger det i ett forum där en ledamot redan har sagt ”betala” i tv. Det ni vet om återställningen kanske aldrig når fram till beslutet. Känner ni er trygga med det, och vad lägger ni fram för dem?"]),
              pb(["Who is leading?", "Vem leder?"], ["Staff read the deferral as management stepping back. A senior consultant asks openly who is actually running the hospital this week. How do you answer that?", "Personalen uppfattar överlämnandet som att ledningen kliver åt sidan. En överläkare frågar öppet vem som egentligen leder sjukhuset den här veckan. Vad svarar ni?"])
            ]
          }
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
          evaluation: [["Addresses people, process and technology", "Tar itu med människor, processer och teknik"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["The full package", "Hela paketet"], [
              io(["Staff notice", "Personalen märker det"], ["Drill dates and a recovery programme for staff are announced. Staff say it is the first time they have felt the lessons were taken seriously.", "Datum för övningar och ett återhämtningsprogram för personalen annonseras. Personalen säger att det är första gången de känner att lärdomarna tas på allvar."], ["Staff see the announced changes as taking the lessons seriously.", "Personalen ser de aviserade förändringarna som att lärdomarna tas på allvar."], { meters: { trust: 1 } }),
              io(["Half the budget", "Halva budgeten"], ["Finance approves only half of the package for this year. Something on the list has to wait, and each part has someone in the room defending it.", "Ekonomi godkänner bara hälften av paketet i år. Något på listan måste vänta, och varje del har någon i rummet som försvarar den."], ["Only half of the improvement package is funded this year.", "Bara hälften av förbättringspaketet är finansierat i år."], { reopen: true }),
              io(["The first drill", "Den första övningen"], ["The first paper drill shows that half of the downtime folders are still out of date. Some say the drill worked; others say nothing has changed yet.", "Den första övningen på papper visar att hälften av pärmarna med reservrutiner fortfarande är inaktuella. Vissa säger att övningen fungerade; andra att ingenting har förändrats än."], ["The first drill found half the downtime folders still out of date.", "Den första övningen visade att hälften av pärmarna med reservrutiner fortfarande var inaktuella."])
            ]),
            ir("i2", { notChosen: "A" }, ["A narrower answer", "Ett smalare svar"], [
              io(["The supervisor asks", "Tillsynen frågar"], ["The supervisory authority asks how clinical continuity will improve, not just security. Your current answer does not cover it.", "Tillsynsmyndigheten frågar hur den kliniska kontinuiteten ska förbättras, inte bara säkerheten. Ert nuvarande svar täcker inte det."], ["The supervisory authority wants a plan for clinical continuity.", "Tillsynsmyndigheten vill ha en plan för klinisk kontinuitet."], { reopen: true, meters: { regulator: 1 } }),
              io(["An old habit returns", "En gammal vana kommer tillbaka"], ["During recovery, a vendor account was switched back to always-on to speed up support. It was not the one the attackers used, but it was set up the same way.", "Under återställningen ställdes ett leverantörskonto om till ständigt öppet för att snabba upp supporten. Det var inte det som angriparna använde, men det var uppsatt på samma sätt."], ["A vendor account was made always-on again during recovery.", "Ett leverantörskonto gjordes ständigt öppet igen under återställningen."]),
              io(["Quiet relief", "Tyst lättnad"], ["The wards are quiet and staff are relieved it is over. Nobody complains, and nobody can say what would go differently next time.", "Avdelningarna är lugna och personalen är lättad över att det är över. Ingen klagar, och ingen kan säga vad som skulle gå annorlunda nästa gång."], ["Staff are relieved, but little has visibly changed.", "Personalen är lättad, men lite har synbart förändrats."])
            ])
          ],
          pushback: {
            A: [
              pb(["Which part do you drop?", "Vilken del stryker ni?"], ["Finance says the full package costs more than this year's IT budget and asks which part to drop. Every part is a lesson from this week. Which one do you give up?", "Ekonomi säger att hela paketet kostar mer än årets IT-budget och frågar vilken del som ska strykas. Varje del är en lärdom från den här veckan. Vilken ger ni upp?"]),
              pb(["Drills or the backlog", "Övningar eller kön"], ["Practising downtime means taking clinicians off the floor while {{num.postponed}} postponed operations wait. The surgeons ask why drills should come before their patients. Do you start practising now, or after the backlog?", "Att öva reservrutinerna innebär att ta kliniker från golvet medan {{num.postponed}} uppskjutna operationer väntar. Kirurgerna frågar varför övningar ska gå före deras patienter. Börjar ni öva nu, eller efter att kön är avarbetad?"]),
              pb(["Vendors want more", "Leverantörerna vill ha mer"], ["Several device vendors say supervised, time-limited access will make their support slower and more expensive, and want new terms. Do you pay more, or accept slower support for equipment patients depend on?", "Flera leverantörer av medicinteknik säger att övervakad och tidsbegränsad åtkomst gör supporten långsammare och dyrare, och vill ha nya villkor. Betalar ni mer, eller accepterar ni långsammare support för utrustning som patienterna är beroende av?"])
            ],
            B: [
              pb(["Normal is what failed", "Det normala var det som brast"], ["The clinical lead points out that “normal” means paper procedures nobody practises and no agreed restore order. Security fixes alone would not have helped the ED on the first night. What does normal mean after this?", "Den kliniska ledningen påpekar att ”det normala” betyder reservrutiner som ingen övar och ingen överenskommen ordning för återställning. Säkerhetsåtgärder ensamma hade inte hjälpt akuten den första natten. Vad betyder normalt efter det här?"]),
              pb(["The staff aren't fine", "Personalen mår inte bra"], ["Occupational health reports rising sick leave among the staff who carried the first nights. Returning to normal says nothing about them. Who looks after the people who held the hospital together?", "Företagshälsovården rapporterar ökande sjukfrånvaro bland personalen som bar de första nätterna. En återgång till det normala säger ingenting om dem. Vem tar hand om de människor som höll ihop sjukhuset?"]),
              pb(["Half an answer", "Ett halvt svar"], ["The supervisory authority asks what you learned and how clinical continuity will improve. A list of security fixes answers only half the question. What will you send them?", "Tillsynsmyndigheten frågar vad ni har lärt er och hur den kliniska kontinuiteten ska förbättras. En lista över säkerhetsåtgärder besvarar bara halva frågan. Vad skickar ni till dem?"])
            ],
            C: [
              pb(["Frozen while you wait", "Stillastående under väntan"], ["The review will take months. Meanwhile vendors still connect the old way and nobody practises paper procedures. Do you freeze changes until it reports, or act now on what you already know?", "Granskningen kommer att ta månader. Under tiden ansluter leverantörerna fortfarande på det gamla sättet och ingen övar reservrutinerna. Fryser ni förändringarna tills den är klar, eller agerar ni nu på det ni redan vet?"]),
              pb(["A hunt for blame?", "En jakt på syndabockar?"], ["Staff fear the review is about finding someone to blame for the vendor account, and several say they won't speak openly. Without them, the review will miss what really happened. How do you get honest answers?", "Personalen är rädd att granskningen handlar om att hitta någon att skylla på för leverantörskontot, och flera säger att de inte tänker tala öppet. Utan dem missar granskningen vad som verkligen hände. Hur får ni ärliga svar?"]),
              pb(["Fast or good?", "Snabb eller bra?"], ["The board wants the review to report before next month's budget meeting. The reviewers say that is too fast to be thorough. Do you give the board a fast review, or a good one?", "Styrelsen vill att granskningen ska vara klar före nästa månads budgetmöte. Granskarna säger att det är för snabbt för att bli grundligt. Ger ni styrelsen en snabb granskning eller en bra?"])
            ]
          }
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
