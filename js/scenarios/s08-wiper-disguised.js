/*
 * s08-wiper-disguised.js — "Ransom Note Without a Way Back" (archetype A).
 *
 * Apparent ransomware → nobody is waiting for payment → it is a wiper and
 * nothing can be decrypted → authorities link it to a state actor and set terms
 * for information sharing → identity and backup management are destroyed too →
 * weeks of manual operation → pressure to attribute publicly → the insurer
 * invokes a war exclusion.
 *
 * Ground truth: a state-linked group had access for months, staged a wiper
 * disguised as ransomware, and triggered it to cause disruption, not to earn
 * money. No country is named; attribution is left to authorities.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s08-wiper-disguised",
    version: 1,
    category: "malware",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "wiper",
    title: L(["Ransom Note Without a Way Back", "Lösensumma utan väg tillbaka"]),
    summary: L([
      "Screens fill with a ransom note and systems stop booting. It looks like every ransomware case the team has read about — except nobody seems to want the money.",
      "Skärmarna fylls av ett utpressningsmeddelande och systemen slutar starta. Det ser ut som alla ransomwarefall teamet har läst om – förutom att ingen verkar vilja ha pengarna."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Recognise when an incident is destruction, not extortion", "Känna igen när en incident handlar om förstörelse, inte utpressning"]), teaser: L(["Understanding what you are really facing", "Att förstå vad ni egentligen står inför"]) },
      { id: "lo2", text: L(["Work with national authorities under information-sharing constraints", "Samarbeta med nationella myndigheter med begränsningar i informationsdelningen"]), teaser: L(["Working with outside bodies", "Att samarbeta med aktörer utanför"]) },
      { id: "lo3", text: L(["Plan a rebuild from scratch, including identity", "Planera en ombyggnad från grunden, inklusive identitetsmiljön"]), teaser: L(["Starting over", "Att börja om"]) },
      { id: "lo4", text: L(["Keep the organisation running on manual procedures", "Hålla verksamheten igång med manuella rutiner"]), teaser: L(["Keeping going by hand", "Att hålla igång för hand"]) }
    ],
    mitre: ["T1485", "T1561", "T1490", "T1078", "T1021", "T1484"],
    frameworks: {
      nistCsf: ["GV.OC", "GV.RM", "ID.RA", "PR.IR", "PR.DS", "RS.MA", "RS.CO", "RC.RP", "RC.CO"],
      iso27001: ["A.5.5", "A.5.6", "A.5.7", "A.5.24", "A.5.26", "A.5.29", "A.5.30", "A.8.13", "A.8.14"]
    },
    minStages: 4,
    maxStages: 8,
    constraints: { startWindow: "business-hours", sectors: ["energy", "transport", "telecom", "logistics", "utilities", "public"] },
    actor: { types: ["state"], motivation: L(["Disruption of critical services as a political signal", "Störning av samhällsviktiga tjänster som en politisk signal"]), capability: "high" },
    variables: {
      hosts: { min: 60, max: 2500, step: 10, scaleBy: "size" },
      servers: { min: 10, max: 300, scaleBy: "size" },
      weeks: { min: 3, max: 10 },
      dwellDays: { min: 40, max: 140 },
      rebuildCost: { min: 2000000, max: 60000000, step: 500000, scaleBy: "size", currency: true }
    },
    roles: ["incidentCommander", "ciso", "cio", "socLead", "itOps", "serviceOwner", "securityOfficer", "legal", "comms", "ceo"],

    groundTruth: {
      rootCause: L([
        "A state-linked group had access for about {{num.dwellDays}} days, obtained through an exposed management interface. They mapped the network, took over domain administration and planted a wiper disguised as ransomware, which they triggered through a group policy to overwrite boot records and files on {{num.hosts}} machines, including domain controllers and backup consoles. The goal was disruption, not payment.",
        "En statskopplad grupp hade åtkomst i ungefär {{num.dwellDays}} dagar, via ett exponerat förvaltningsgränssnitt. De kartlade nätverket, tog över domänadministrationen och placerade ut ett raderingsprogram förklätt till ransomware, som de utlöste via en grupprincip för att skriva över startsektorer och filer på {{num.hosts}} datorer, däribland domänkontrollanter och backupkonsoler. Målet var störning, inte betalning."
      ]),
      attackerTimeline: [
        { at: -201600, text: L(["Access through an exposed management interface.", "Åtkomst via ett exponerat förvaltningsgränssnitt."]) },
        { at: -172800, text: L(["Domain administration taken over.", "Domänadministrationen tas över."]) },
        { at: -2880, text: L(["Wiper staged on file shares and a group policy prepared.", "Raderingsprogrammet placeras ut på filresurser och en grupprincip förbereds."]) },
        { at: -10, text: L(["Group policy pushes the wiper to all machines.", "Grupprincipen skickar ut raderingsprogrammet till alla datorer."]) },
        { at: 0, text: L(["Boot records and files overwritten; fake ransom note displayed.", "Startsektorer och filer skrivs över; ett falskt utpressningsmeddelande visas."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-fake", revealStage: "p2", text: L(["The ransom note is a decoy: no payment infrastructure exists.", "Utpressningsmeddelandet är en kuliss: det finns ingen infrastruktur för betalning."]) },
      { id: "hf-wiper", revealStage: "p3", text: L(["The malware overwrites boot records and files; nothing can be decrypted.", "Skadekoden skriver över startsektorer och filer; ingenting kan dekrypteras."]) },
      { id: "hf-actor", revealStage: "p4", text: L(["Authorities assess the attack as the work of a state-linked group that had access for {{num.dwellDays}} days.", "Myndigheterna bedömer angreppet som utfört av en statskopplad grupp som hade åtkomst i {{num.dwellDays}} dagar."]) },
      { id: "hf-identity", revealStage: "p5", text: L(["Domain controllers and backup consoles were wiped as well; identity must be rebuilt from nothing.", "Domänkontrollanter och backupkonsoler raderades också; identitetsmiljön måste byggas upp från ingenting."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Every screen at once", "Alla skärmar på en gång"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. Within minutes, computers across {{org.name}} restart on their own and show the same red message: your files are encrypted, pay within 48 hours.\n\nServers stop responding one after another. {{org.service.primary|cap}} has stopped, field staff cannot see their work orders, and customer service has no system access. Phones still work. It looks like every ransomware case the team has read about.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. Inom några minuter startar datorer över hela {{org.name}} om av sig själva och visar samma röda meddelande: era filer är krypterade, betala inom 48 timmar.\n\nServrarna slutar svara en efter en. {{org.service.primary|cap}} har stannat, fältpersonalen ser inte sina arbetsordrar och kundtjänst har ingen åtkomst till systemen. Telefonerna fungerar fortfarande. Det ser ut som varje fall av utpressningsprogram som teamet har läst om."
        ]),
        injects: [
          inj("i1-1", 0, "ransomNote", "attacker", "critical", "unverified", [
            "“Your files are encrypted. To recover them, send payment to the wallet below and email your ID to the address below. You have 48 hours.”",
            "”Era filer är krypterade. För att få tillbaka dem, skicka betalning till plånboken nedan och mejla ert ID till adressen nedan. Ni har 48 timmar.”"
          ], { headline: ["Red screen", "Röd skärm"], facilitatorNote: ["A decoy. Let the room treat it as ransomware for now.", "En kuliss. Låt gruppen behandla det som ransomware tills vidare."], tests: ["lo1"] }),
          inj("i1-2", 15, "impactReport", "person.serviceOwner", "critical", "confirmed", [
            "{{org.service.primary|cap}} has stopped. Field staff cannot see work orders. Customer service has no system access.",
            "{{org.service.primary|cap}} har stannat. Fältpersonalen ser inga arbetsordrar. Kundtjänst har ingen åtkomst till system."
          ], { tests: ["lo4"] }),
          inj("i1-3", 30, "chat", "person.itOps", "high", "confirmed", [
            "“The machines aren't just locked — some won't boot at all. I've never seen ransomware do that.”",
            "”Datorerna är inte bara låsta – en del går inte att starta alls. Jag har aldrig sett ransomware göra så.”"
          ], { optional: true, tests: ["lo1"] })
        ],
        charts: [{
          id: "c1-offline", type: "line", markers: "injects",
          title: L(["Machines offline", "Datorer som inte svarar"]), unit: L(["machines", "datorer"]),
          data: line(["Machines offline", "Datorer som inte svarar"], -20, 60, 5, (x, ctx) => (x < -5 ? ctx.rng.int(0, 3) : ctx.vars.hosts * (1 - Math.exp(-(x + 5) / 6))))
        }],
        questions: {
          technical: [
            q("What can still be saved — machines that have not restarted yet?", "Vad går fortfarande att rädda – datorer som ännu inte har startat om?", ["itOps", "socLead"]),
            q("How is this spreading so fast, everywhere at once?", "Hur kan det här spridas så snabbt, överallt samtidigt?", ["socLead", "ciso"]),
            q("What must be preserved for later investigation?", "Vad måste säkras för en senare utredning?", ["socLead"])
          ],
          executive: [
            q("Which services must keep running, and how without IT?", "Vilka tjänster måste fortsätta fungera, och hur utan IT?", ["serviceOwner", "ceo"]),
            q("Who do you call first — outside the organisation?", "Vem ringer ni först – utanför organisationen?", ["ceo", "securityOfficer"]),
            q("How do staff communicate if computers are down?", "Hur kommunicerar personalen om datorerna ligger nere?", ["comms", "incidentCommander"])
          ]
        },
        challenges: [ch("Some essential services depend on systems that just stopped.", "Vissa samhällsviktiga tjänster är beroende av system som just har stannat.")],
        decision: dec("d1", "incidentCommander", ["What do you do in the first hour?", "Vad gör ni den första timmen?"], [
          ["Disconnect all networks now, including from the internet, to save what has not been hit.", "Koppla bort alla nät nu, även från internet, för att rädda det som ännu inte har drabbats."],
          ["Isolate affected segments and keep critical systems connected.", "Isolera drabbade segment och låt kritiska system vara uppkopplade."],
          ["Power off the servers that are still running, so whatever is wiping them cannot reach them.", "Stäng av de servrar som fortfarande är igång, så att det som raderar dem inte kan nå dem."]
        ], {
          knowns: [["Machines across the organisation are failing at once.", "Datorer i hela organisationen slutar fungera samtidigt."]],
          uncertainties: [["What is still untouched.", "Vad som fortfarande är opåverkat."]],
          tradeoffs: {
            operational: ["A full disconnect stops everything still working.", "En fullständig frånkoppling stoppar allt som fortfarande fungerar."],
            security: ["Keeping anything connected risks losing it too.", "Att låta något vara uppkopplat riskerar att också det går förlorat."],
            legal: ["Powering off destroys evidence authorities may need.", "Att stänga av strömmen förstör spår som myndigheterna kan behöva."],
            reputational: ["Essential services failing is a public matter.", "När samhällsviktiga tjänster faller blir det en offentlig fråga."]
          },
          evaluation: [["Protects what is not yet hit", "Skyddar det som ännu inte har drabbats"], ["Activates manual continuity procedures", "Aktiverar manuella kontinuitetsrutiner"]],
          pushback: {
            A: [
              pb(["A working system, switched off", "Ett fungerande system, avstängt"], ["The service owner says some systems behind {{org.service.primary}} were still running until the network was cut, and now they cannot reach anything either. You stopped what the attack had not stopped. Who decided that an unaffected system should go dark, and do you reconnect any of it?", "Tjänsteägaren säger att vissa system bakom {{org.service.primary}} fortfarande gick tills nätet kopplades bort, och nu når de inte heller något. Ni stoppade det som angreppet inte hade stoppat. Vem beslutade att ett opåverkat system skulle släckas, och kopplar ni upp något av det igen?"]),
              pb(["Your partner cannot get in", "Er partner kommer inte in"], ["Your incident response partner needs remote access to start collecting evidence, and with the internet cut they cannot reach a single machine. Driving a team on site takes hours. Do you open one connection for them, on the day you do not know how this got in?", "Er incidentresponspartner behöver fjärråtkomst för att börja samla spår, och när internet är bortkopplat når de inte en enda dator. Att köra ut ett team tar timmar. Öppnar ni en förbindelse för dem, samma dag som ni inte vet hur det här tog sig in?"]),
              pb(["Still restarting", "Startar fortfarande om"], ["Twenty minutes after the cut, machines inside the disconnected network are still restarting with the red screen. Whatever is doing this does not seem to need the internet. Was the disconnect worth what it cost, and what do you try next?", "Tjugo minuter efter frånkopplingen startar datorer i det bortkopplade nätet fortfarande om med den röda skärmen. Det som gör det här verkar inte behöva internet. Var frånkopplingen värd vad den kostade, och vad prövar ni härnäst?"])
            ],
            B: [
              pb(["Every segment is affected", "Alla segment är drabbade"], ["IT asks which segments count as affected: machines are failing in every part of the network at the same time. Isolating the affected ones would mean isolating nearly everything. What does your decision mean in practice, and who draws the line?", "IT frågar vilka segment som räknas som drabbade: datorer slutar fungera i alla delar av nätet samtidigt. Att isolera de drabbade skulle innebära att isolera nästan allt. Vad betyder ert beslut i praktiken, och vem drar gränsen?"]),
              pb(["A critical server goes red", "En kritisk server blir röd"], ["Fifteen minutes after you isolated the affected segments, one of the critical servers you kept connected restarts with the same red message. Do you widen the isolation now, admitting the line was in the wrong place, or protect the critical systems that are left?", "Femton minuter efter att ni isolerade de drabbade segmenten startar en av de kritiska servrar ni höll uppkopplade om med samma röda meddelande. Utvidgar ni isoleringen nu, och medger att gränsen drogs fel, eller skyddar ni de kritiska system som är kvar?"]),
              pb(["The security officer objects", "Säkerhetsskyddschefen invänder"], ["Your security officer asks why systems behind essential services stay connected to a network where something is destroying machines every minute. If they go down next, it will be because you kept them online. Who takes that responsibility, by name?", "Er säkerhetsskyddschef frågar varför system bakom samhällsviktiga tjänster hålls uppkopplade mot ett nät där något förstör datorer varje minut. Om de faller härnäst är det för att ni höll dem uppkopplade. Vem tar det ansvaret, med namn?"])
            ],
            C: [
              pb(["They may not come back", "De kanske inte kommer tillbaka"], ["IT reminds you that machines that restarted today did not come back up. If the servers you power off do the same on restart, you have finished the job yourselves. How sure are you that a clean shutdown is safe?", "IT påminner om att de datorer som startade om i dag inte kom upp igen. Om servrarna ni stänger av gör likadant vid omstart har ni själva gjort klart jobbet. Hur säkra är ni på att en kontrollerad avstängning är ofarlig?"]),
              pb(["Evidence in memory", "Spår i minnet"], ["Your incident response partner says that what is running in memory on those servers may be the best evidence of what is happening, and powering off erases it for good. Do you lose that to protect the disks, or leave a few running for the investigators?", "Er incidentresponspartner säger att det som körs i minnet på servrarna kan vara det bästa spåret av vad som händer, och att en avstängning raderar det för gott. Offrar ni det för att skydda diskarna, eller låter ni några gå för utredarnas skull?"]),
              pb(["The last servers standing", "De sista servrarna som står"], ["Among the servers still running are the ones keeping {{org.service.primary}} partly alive. The service owner begs you to leave them: they are the only thing working. Do you switch off the last working service yourselves?", "Bland servrarna som fortfarande går finns de som håller {{org.service.primary}} delvis vid liv. Tjänsteägaren ber er att låta dem vara: de är det enda som fungerar. Stänger ni själva av den sista tjänsten som fungerar?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Everything disconnected", "Allt bortkopplat"], [
              io(["Some servers survive", "Några servrar klarar sig"], ["A handful of servers that had not yet restarted are still running after the cut. They are alive, but nobody can reach them from outside the server room.", "En handfull servrar som ännu inte hade startat om är fortfarande igång efter frånkopplingen. De lever, men ingen kan nå dem utanför serverrummet."], ["Some servers that had not restarted are still running, cut off.", "Några servrar som inte hade startat om är fortfarande igång, avskurna."]),
              io(["It keeps going inside", "Det fortsätter inifrån"], ["Twenty minutes after the disconnect, machines inside the network are still restarting with the red screen. Whatever is doing this does not need the internet.", "Tjugo minuter efter frånkopplingen startar datorer inne i nätet fortfarande om med den röda skärmen. Det som gör det här behöver inte internet."], ["Machines kept failing inside the network after the disconnect.", "Datorer fortsatte att falla inne i nätet efter frånkopplingen."], { reopen: true }),
              io(["The desk phones die", "Bordstelefonerna dör"], ["The office phone system ran over the data network and goes silent with it. Staff switch to personal mobiles, and nobody has a current list of numbers.", "Kontorets telefonsystem gick över datanätet och tystnar med det. Personalen går över till privata mobiler, och ingen har en aktuell nummerlista."], ["The internal phone system is down; staff are using personal mobiles.", "Det interna telefonsystemet ligger nere; personalen använder privata mobiler."])
            ]),
            ir("i2", { notChosen: "A" }, ["The network stays up", "Nätet är kvar uppe"], [
              io(["A second wave", "En andra våg"], ["Within twenty minutes another wave of machines restarts with the red screen, including some you were counting on keeping. The line you drew did not hold.", "Inom tjugo minuter startar en ny våg datorer om med den röda skärmen, däribland några ni räknade med att behålla. Gränsen ni drog höll inte."], ["A second wave of machines failed after the decision.", "En andra våg datorer föll efter beslutet."], { reopen: true }),
              io(["Remote help connects", "Fjärrhjälpen kopplar upp"], ["Your incident response partner gets remote access within the hour and starts collecting evidence from machines that are still running.", "Er incidentresponspartner får fjärråtkomst inom en timme och börjar samla spår från datorer som fortfarande är igång."], ["The response partner has remote access and is collecting evidence.", "Incidentpartnern har fjärråtkomst och samlar in spår."]),
              io(["Is it slowing?", "Avtar det?"], ["The rate of new failures drops. Some say your decision is working; others think there is simply less left to hit.", "Takten i nya haverier sjunker. Några säger att ert beslut fungerar; andra tror att det helt enkelt finns mindre kvar att träffa."], ["New failures slowed; nobody knows whether that is containment.", "Nya haverier avtog; ingen vet om det beror på begränsningen."])
            ])
          ]
        }),
        facilitator: fac(
          ["Speed of loss is the shock. Note who thinks about manual operations early.", "Takten i förlusten är chocken. Notera vem som tidigt tänker på manuell drift."],
          ["Full network disconnect, manual continuity activated, external contacts started.", "Full frånkoppling av nätverken, manuell kontinuitet aktiverad och externa kontakter påbörjade."],
          [["Ask: which phone numbers do you have on paper?", "Fråga: vilka telefonnummer har ni på papper?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 120,
        title: L(["Nobody to pay", "Ingen att betala"]),
        twist: L(["Nobody is waiting for payment. This is not about money.", "Ingen väntar på betalning. Det här handlar inte om pengar."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because every network was disconnected, the control room lost contact with the field sites and is running on radio and telephone.", sv: "Eftersom alla nät kopplades bort förlorade kontrollrummet kontakten med fältanläggningarna och arbetar nu med radio och telefon." } }
        ],
        assumptionChallenged: L(["Criminals want money, so paying is an option.", "Kriminella vill ha pengar, så att betala är ett alternativ."]),
        reveals: ["hf-fake"],
        narrative: L([
          "{{time.T+120|clock}}. The incident response partner has had two hours with the ransom note and the first affected machines.\n\nEveryone in the room is preparing for a negotiation: the insurer wants to know whether you are in contact with the attackers, and management wants to know the price. The partner asks for a few minutes to explain something about the note.",
          "Klockan {{time.T+120|clock}}. Incidentpartnern har haft två timmar med utpressningsmeddelandet och de första drabbade datorerna.\n\nAlla i rummet förbereder sig på en förhandling: försäkringsbolaget vill veta om ni har kontakt med angriparna, och ledningen vill veta priset. Partnern ber om några minuter för att förklara något om meddelandet."
        ]),
        injects: [
          inj("i2-1", 120, "forensicFinding", "irRetainer", "critical", "confirmed", [
            "{{supplier.irRetainer}}: the email domain in the note was never registered, the wallet address is invalid, and the note is identical on every machine — no victim ID. There is no way to pay.",
            "{{supplier.irRetainer}}: e-postdomänen i meddelandet har aldrig registrerats, plånboksadressen är ogiltig och meddelandet är identiskt på alla datorer – inget offer-ID. Det finns inget sätt att betala."
          ], { headline: ["No payment channel", "Ingen betalningskanal"], reveals: ["hf-fake"], tests: ["lo1"] }),
          inj("i2-2", 150, "email", "insurer", "medium", "confirmed", [
            "{{supplier.insurer}}: “Please confirm whether you are in contact with the threat actor. Do not negotiate without our approval.”",
            "{{supplier.insurer}}: ”Bekräfta om ni har kontakt med hotaktören. Förhandla inte utan vårt godkännande.”"
          ], { optional: true, tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("If it isn't about money, what is it about — and what does that predict?", "Om det inte handlar om pengar, vad handlar det då om – och vad säger det om vad som kommer?", ["ciso", "socLead"]),
            q("What would destroying, rather than locking, data look like on disk?", "Hur skulle det se ut på disken om data förstörts snarare än låsts?", ["socLead", "itOps"]),
            q("Did your first-hour decision save anything?", "Räddade ert beslut den första timmen något?", ["itOps"], "d1")
          ],
          executive: [
            q("Who needs to know that this may be an attack on society, not just you?", "Vilka behöver få veta att det här kan vara ett angrepp mot samhället, inte bara mot er?", ["ceo", "securityOfficer"]),
            q("What changes when paying is no longer an option?", "Vad förändras när betalning inte längre är ett alternativ?", ["ceo", "cio"]),
            q("Would you have acted differently in the first hour, knowing this?", "Skulle ni ha agerat annorlunda under den första timmen, med den här vetskapen?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The board asks how fast you can “get the key”.", "Styrelsen frågar hur snabbt ni kan ”få nyckeln”.")],
        decision: dec("d2", "ceo", ["Who do you bring in now?", "Vilka tar ni in nu?"], [
          ["Report to {{reg.csirt}} and {{reg.police}} now, and treat it as a potential attack on essential services.", "Rapportera till {{reg.csirt}} och {{reg.police}} nu, och behandla det som ett möjligt angrepp på samhällsviktiga tjänster."],
          ["Keep it with your incident response partner until you know more.", "Håll det hos er incidentresponspartner tills ni vet mer."],
          ["Report to the insurer first.", "Rapportera till försäkringsbolaget först."]
        ], {
          knowns: [["There is no payment channel.", "Det finns ingen betalningskanal."]],
          uncertainties: [["Who is behind it, and why.", "Vem som ligger bakom, och varför."]],
          tradeoffs: {
            operational: ["Authorities bring help and constraints.", "Myndigheter bidrar med hjälp och med begränsningar."],
            security: ["Others may be next; early reporting helps them.", "Andra kan stå på tur; tidig rapportering hjälper dem."],
            legal: ["Essential-service operators may have reporting duties.", "Verksamheter med samhällsviktiga tjänster kan ha rapporteringsskyldighet."],
            reputational: ["Silence about an attack on essential services is hard to defend.", "Tystnad om ett angrepp på samhällsviktiga tjänster är svår att försvara."]
          },
          evaluation: [["Escalates to national bodies early", "Eskalerar tidigt till nationella myndigheter"]],
          pushback: {
            A: [
              pb(["And if it is only criminals?", "Och om det bara är kriminella?"], ["Treating this as an attack on essential services sets national machinery in motion. If it turns out to be a criminal group with a broken ransom note, you will have raised a national alarm over an ordinary crime. How sure are you, and does that matter?", "Att behandla det här som ett angrepp på samhällsviktiga tjänster sätter nationella resurser i rörelse. Om det visar sig vara en kriminell grupp med ett trasigt utpressningsmeddelande har ni larmat nationellt om ett vanligt brott. Hur säkra är ni, och spelar det någon roll?"]),
              pb(["The insurer was not first", "Försäkringsbolaget var inte först"], ["The insurer calls back: your policy says they must be informed before outside parties are involved, and they want their own response firm in charge. You have already gone to the authorities. Have you put your cover at risk, and how do you repair that conversation?", "Försäkringsbolaget ringer tillbaka: enligt er försäkring ska de informeras innan utomstående blandas in, och de vill att deras egen incidentfirma leder arbetet. Ni har redan gått till myndigheterna. Har ni äventyrat skyddet, och hur reparerar ni det samtalet?"]),
              pb(["More people, more leaks", "Fler som vet, fler läckor"], ["Within an hour of your report, a journalist calls asking about “an attack on essential services” at {{org.name}}. You have not said that to anyone outside the authorities. Do you still trust the circle you just widened, and what do you say to the journalist?", "Inom en timme efter er rapport ringer en journalist och frågar om ”ett angrepp på samhällsviktiga tjänster” hos {{org.name}}. Ni har inte sagt så till någon utanför myndigheterna. Litar ni fortfarande på kretsen ni just vidgade, och vad säger ni till journalisten?"])
            ],
            B: [
              pb(["A duty to report", "En skyldighet att rapportera"], ["Legal points out that as an operator of essential services you may have a duty to report a significant incident within hours, not when you feel ready. Who decided to wait, is it written down, and would you defend it to a regulator?", "Juristerna påpekar att ni som verksamhet med samhällsviktiga tjänster kan ha en skyldighet att rapportera en betydande incident inom timmar, inte när ni känner er redo. Vem beslutade att vänta, finns det nedskrivet, och skulle ni försvara det inför en tillsynsmyndighet?"]),
              pb(["Your partner sees only you", "Er partner ser bara er"], ["Your incident response partner can only see your network. If this is aimed at operators like you, nobody else is being warned while you wait. Is keeping it in-house protecting you, or leaving the next target in the dark?", "Er incidentresponspartner ser bara ert nät. Om det här riktar sig mot verksamheter som er får ingen annan någon varning medan ni väntar. Skyddar det er att hålla det internt, eller lämnar det nästa måltavla i mörker?"]),
              pb(["The partner is stretched", "Partnern räcker inte till"], ["Your partner has a small team on site and says the scale is beyond what your contract covers: they can analyse a handful of machines, not every one. National bodies could add people. How long do you wait for “more” with this few people looking?", "Er partner har ett litet team på plats och säger att omfattningen går utöver vad avtalet täcker: de kan analysera ett fåtal datorer, inte alla. Nationella myndigheter skulle kunna bidra med folk. Hur länge väntar ni på ”mer” med så få som letar?"])
            ],
            C: [
              pb(["Nothing to negotiate", "Inget att förhandla om"], ["There is no way to pay, so the insurer's ransom process has nothing to do. Their hotline asks you to wait for a case handler to call back. What exactly do you need from the insurer first, and is it worth the hours?", "Det finns inget sätt att betala, så försäkringsbolagets process för utpressning har inget att göra. Deras jourlinje ber er vänta på att en handläggare ringer upp. Vad exakt behöver ni från försäkringsbolaget först, och är det värt timmarna?"]),
              pb(["Change firms mid-analysis?", "Byta firma mitt i analysen?"], ["The insurer wants its own panel firm to take over from the partner who has spent two hours on your machines. Switching means briefing a new team from scratch. Do you change horses now to keep the insurer happy?", "Försäkringsbolaget vill att dess egen firma tar över från partnern som har lagt två timmar på era datorer. Ett byte innebär att ett nytt team måste sättas in från början. Byter ni häst nu för att hålla försäkringsbolaget nöjt?"]),
              pb(["Who hears it first?", "Vem hör det först?"], ["While you wait for the insurer, nobody in national authorities knows that an essential service is down. If {{reg.csirt}} learns it from the news, they will ask why your insurer heard first. What is your answer?", "Medan ni väntar på försäkringsbolaget vet ingen på de nationella myndigheterna att en samhällsviktig tjänst ligger nere. Om {{reg.csirt}} får veta det via nyheterna kommer de att fråga varför ert försäkringsbolag fick höra det först. Vad svarar ni?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The authorities are told", "Myndigheterna får veta"], [
              io(["A liaison within minutes", "En kontaktperson inom minuter"], ["{{reg.csirt}} answers within minutes, assigns a named liaison and asks for the first disk images. For the first time today, someone outside seems to take it as seriously as you do.", "{{reg.csirt}} svarar inom några minuter, utser en namngiven kontaktperson och ber om de första diskavbildningarna. För första gången i dag verkar någon utanför ta det lika allvarligt som ni."], ["{{reg.csirt}} has assigned a liaison and asked for disk images.", "{{reg.csirt}} har utsett en kontaktperson och begärt diskavbildningar."]),
              io(["Do not touch the machines", "Rör inte datorerna"], ["{{reg.police}} asks that affected machines are left untouched until they can be imaged. IT had planned to start reinstalling this afternoon.", "{{reg.police}} begär att drabbade datorer lämnas orörda tills de har avbildats. IT hade planerat att börja installera om i eftermiddag."], ["The police have asked that affected machines stay untouched until imaged.", "Polisen har begärt att drabbade datorer lämnas orörda tills de har avbildats."], { reopen: true }),
              io(["No call back yet", "Ingen har ringt tillbaka"], ["The report is filed and an automatic receipt arrives. Then nothing for hours. The room cannot tell whether anyone has read it.", "Rapporten är inskickad och ett automatiskt kvitto kommer. Sedan ingenting på flera timmar. Rummet kan inte avgöra om någon har läst den."], ["The report was filed, but nobody had called back hours later.", "Rapporten skickades in, men ingen hade ringt tillbaka timmar senare."])
            ]),
            ir("i2", { notChosen: "A" }, ["Nobody outside knows", "Ingen utanför vet"], [
              io(["The CSIRT calls you", "CSIRT ringer er"], ["{{reg.csirt}} calls: they have seen photos of red screens at {{org.name}} on social media and ask why an essential-service operator has not reported anything.", "{{reg.csirt}} ringer: de har sett bilder på röda skärmar hos {{org.name}} i sociala medier och frågar varför en verksamhet med samhällsviktiga tjänster inte har rapporterat något."], ["{{reg.csirt}} learned of the outage from social media and called you.", "{{reg.csirt}} fick veta om avbrottet via sociala medier och ringde er."], { reopen: true, meters: { regulator: 1 } }),
              io(["A second team", "Ett andra team"], ["Your incident response partner sends a second team on site, and the analysis speeds up. Keeping it small seems to be working.", "Er incidentresponspartner skickar ett andra team till platsen, och analysen går snabbare. Att hålla kretsen liten verkar fungera."], ["The response partner has added a second team on site.", "Incidentpartnern har satt in ett andra team på plats."]),
              io(["A customer asks", "En kund frågar"], ["A large customer asks whether you have reported the incident to the authorities, because their contract with you says you must. You are not sure what the contract says.", "En stor kund frågar om ni har rapporterat incidenten till myndigheterna, eftersom deras avtal med er säger att ni måste. Ni är inte säkra på vad avtalet säger."], ["A major customer has asked whether the authorities were informed.", "En stor kund har frågat om myndigheterna har informerats."])
            ])
          ]
        }),
        facilitator: fac(
          ["The frame shifts from crime to something larger. Let the room feel that.", "Ramen skiftar från brott till något större. Låt gruppen känna det."],
          ["Early reporting to national authorities and a mindset shift from recovery-by-key to rebuild.", "Tidig rapportering till nationella myndigheter och ett skifte i synsätt från återställning med nyckel till ombyggnad."],
          [["Ask: who benefits from your services stopping?", "Fråga: vem tjänar på att era tjänster stannar?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 300,
        title: L(["Nothing to decrypt", "Inget att dekryptera"]),
        twist: L(["It is a wiper. The data is not encrypted — it is gone.", "Det är ett raderingsprogram. Datan är inte krypterad – den är borta."]),
        twistKind: "scope",
        reconsider: { decision: "d1", pressure: { en: "It is a wiper: nothing will come back. If you disconnected everything, the systems still running are cut off from the people who need them. If you kept critical systems connected, they may be the next to be wiped.", sv: "Det är ett raderingsprogram: ingenting kommer tillbaka. Om ni kopplade bort allt är de system som fortfarande fungerar avskurna från dem som behöver dem. Om ni höll kritiska system uppkopplade kan de bli nästa att raderas." } },
        assumptionChallenged: L(["Data is encrypted and could be recovered with a key.", "Datan är krypterad och skulle kunna återställas med en nyckel."]),
        reveals: ["hf-wiper"],
        narrative: L([
          "{{time.T+300|clock}}. The first disk images have been analysed in the partner's lab.\n\nThe recovery plan so far has assumed that the data is still there, locked behind a key someone could buy or crack. The analysis tests that assumption, and the room waits for the answer.",
          "Klockan {{time.T+300|clock}}. De första diskavbildningarna har analyserats i partnerns labb.\n\nÅterställningsplanen har hittills utgått från att datan finns kvar, låst bakom en nyckel som någon kan köpa eller knäcka. Analysen prövar det antagandet, och rummet väntar på svaret."
        ]),
        injects: [
          inj("i3-1", 300, "forensicFinding", "forensics", "critical", "confirmed", [
            "The malware overwrites the boot record and then fills files with random data. There is no key, because there is no encryption. {{num.hosts}} machines and {{num.servers}} servers are affected.",
            "Skadekoden skriver över startsektorn och fyller sedan filer med slumpdata. Det finns ingen nyckel, eftersom det inte finns någon kryptering. {{num.hosts}} datorer och {{num.servers}} servrar är drabbade."
          ], { headline: ["Wiper confirmed", "Raderingsprogram bekräftat"], reveals: ["hf-wiper"], tests: ["lo1", "lo3"] })
        ],
        charts: [{
          id: "c3-kpi", type: "kpi",
          title: L(["Destruction so far", "Förstörelsen hittills"]),
          data: kpi([
            { id: "hosts", label: ["Machines wiped", "Raderade datorer"], value: (v) => v.hosts, tone: "danger" },
            { id: "servers", label: ["Servers wiped", "Raderade servrar"], value: (v) => v.servers, tone: "danger" },
            { id: "keys", label: ["Decryption keys possible", "Möjliga dekrypteringsnycklar"], value: 0, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("What survived: offline backups, unaffected segments, cloud services?", "Vad överlevde: frånkopplade säkerhetskopior, opåverkade segment, molntjänster?", ["itOps", "cio"]),
            q("Can anything be rebuilt on the existing infrastructure safely?", "Kan något byggas upp på den befintliga infrastrukturen på ett säkert sätt?", ["ciso", "itOps"]),
            q("Was disconnecting the networks enough to stop further wiping?", "Räckte det att koppla bort nätverken för att stoppa ytterligare radering?", ["itOps"], "d1")
          ],
          executive: [
            q("How long can the organisation run manually?", "Hur länge kan organisationen drivas manuellt?", ["serviceOwner", "ceo"]),
            q("What do you tell staff and customers now?", "Vad säger ni till personal och kunder nu?", ["comms", "ceo"]),
            q("Does involving authorities change how you plan recovery?", "Ändrar myndigheternas inblandning hur ni planerar återställningen?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("Recovery now means rebuilding, not restoring — and it will take weeks.", "Återställning innebär nu ombyggnad, inte återläsning – och det kommer att ta veckor.")],
        decision: dec("d3", "cio", ["What is the recovery approach?", "Vilken väg väljer ni för återställningen?"], [
          ["Rebuild critical services from scratch in a new, clean environment, using offline backups only for data.", "Bygg upp kritiska tjänster från grunden i en ny, ren miljö och använd frånkopplade säkerhetskopior endast för data."],
          ["Restore servers from backups into the existing environment.", "Läs tillbaka servrar från säkerhetskopior till den befintliga miljön."],
          ["Wait for the authorities' assessment before rebuilding anything.", "Invänta myndigheternas bedömning innan något byggs upp."]
        ], {
          knowns: [["Data on wiped machines is gone.", "Datan på raderade datorer är borta."]],
          uncertainties: [["Whether the attacker still has access to anything.", "Om angriparen fortfarande har åtkomst till något."]],
          tradeoffs: {
            operational: ["A clean rebuild is slower at first.", "En ren ombyggnad går långsammare i början."],
            security: ["Restoring into the old environment may restore the attacker's access.", "Att läsa tillbaka till den gamla miljön kan återställa angriparens åtkomst."],
            legal: ["Evidence must be kept for the authorities.", "Spår måste bevaras åt myndigheterna."],
            reputational: ["A second wipe would be catastrophic.", "En andra radering vore katastrofal."]
          },
          evaluation: [["Chooses a clean environment over speed", "Väljer en ren miljö framför snabbhet"]],
          pushback: {
            A: [
              pb(["Clean takes days to start", "Rent tar dagar att starta"], ["A new, clean environment needs new hardware or a new cloud tenancy, and procurement says days, not hours. Meanwhile field staff stay on paper. Can you justify building something new before anything old is back?", "En ny, ren miljö kräver ny hårdvara eller en ny molnmiljö, och inköp säger dagar, inte timmar. Under tiden arbetar fältpersonalen på papper. Kan ni motivera att bygga något nytt innan något gammalt är tillbaka?"]),
              pb(["Untested backups", "Otestade säkerhetskopior"], ["Your whole plan rests on the offline backups, and nobody can remember the last time a full restore from them was tested. If the tapes are incomplete, the clean environment will be clean and empty. Do you have a fallback?", "Hela er plan vilar på de frånkopplade säkerhetskopiorna, och ingen minns när en fullständig återläsning från dem senast testades. Om banden är ofullständiga blir den rena miljön ren och tom. Har ni en reservplan?"]),
              pb(["Just give us the old server", "Ge oss bara den gamla servern"], ["The service owner pushes back: the field system ran on two servers they know well, and reinstalling those would take a day. A clean room means weeks of new configuration. Who tells the field staff they wait longer so the new platform is perfect?", "Tjänsteägaren protesterar: fältsystemet gick på två servrar de känner väl, och att installera om dem skulle ta en dag. En ren miljö innebär veckor av ny konfiguration. Vem säger till fältpersonalen att de får vänta längre för att den nya plattformen ska bli perfekt?"])
            ],
            B: [
              pb(["What stops it happening again?", "Vad hindrar att det händer igen?"], ["Nobody yet knows how the malware reached every machine at once. If you restore into the same environment, whatever sent it out may still be there. What stops the restored servers being wiped again tonight?", "Ingen vet ännu hur skadekoden nådde alla datorer samtidigt. Om ni läser tillbaka till samma miljö kan det som skickade ut den fortfarande finnas kvar. Vad hindrar att de återlästa servrarna raderas igen i natt?"]),
              pb(["Restoring over the evidence", "Att läsa tillbaka över spåren"], ["Restoring onto the existing servers overwrites the disks the investigators have not imaged yet. Your incident response partner asks for two more days before anything is touched. Do you wait, or let recovery win over evidence?", "Att läsa tillbaka till de befintliga servrarna skriver över diskar som utredarna ännu inte har avbildat. Er incidentresponspartner ber om två dagar till innan något rörs. Väntar ni, eller får återställningen gå före spåren?"]),
              pb(["The CISO will not sign", "CISO skriver inte under"], ["Your CISO refuses to sign off on putting critical services back into an environment that was destroyed from the inside a few hours ago. The CIO says speed matters more. Who decides when two of your leaders disagree on this?", "Er CISO vägrar godkänna att kritiska tjänster läggs tillbaka i en miljö som förstördes inifrån för några timmar sedan. CIO säger att snabbhet är viktigare. Vem avgör när två av era ledare är oense om det här?"])
            ],
            C: [
              pb(["No date from the authorities", "Inget datum från myndigheterna"], ["{{reg.csirt}} says its assessment may take days and it cannot promise when. Your plan now depends on a timeline you do not control. How long are you prepared to wait, and what happens on the day you stop?", "{{reg.csirt}} säger att bedömningen kan ta dagar och att de inte kan lova när. Er plan hänger nu på en tidslinje som ni inte styr över. Hur länge är ni beredda att vänta, och vad händer den dag ni slutar?"]),
              pb(["Staff with nothing to do", "Personal utan något att göra"], ["Staff across the organisation have no systems and no plan for when they will. The CFO asks what the organisation is paying them to do while you wait. Is waiting a decision you can explain to them, and to the customers who rely on {{org.name}}?", "Medarbetare i hela organisationen har inga system och ingen plan för när de får dem. Ekonomichefen frågar vad organisationen betalar dem för att göra medan ni väntar. Är väntan ett beslut ni kan förklara för dem, och för kunderna som är beroende av {{org.name}}?"]),
              pb(["Waiting is also a choice", "Att vänta är också ett val"], ["The authorities say clearly that recovery decisions are yours, not theirs. They will advise, not approve. If they never give the go-ahead you are waiting for, what were you waiting for?", "Myndigheterna säger tydligt att besluten om återställning är era, inte deras. De ger råd, inte godkännanden. Om de aldrig ger det klartecken ni väntar på, vad väntade ni då på?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["A clean environment", "En ren miljö"], [
              io(["Hardware tomorrow", "Hårdvara i morgon"], ["A supplier can lend servers from stock, and the clean environment can start being built tomorrow instead of next week.", "En leverantör kan låna ut servrar ur lager, och den rena miljön kan börja byggas i morgon i stället för nästa vecka."], ["Loaned hardware for the clean environment arrives tomorrow.", "Lånad hårdvara till den rena miljön kommer i morgon."]),
              io(["The first tape test", "Det första bandtestet"], ["IT tests a read from one of the offline tapes. It is slow, and parts of it cannot be read. Nobody can yet say how much of the data the clean environment will actually get.", "IT testar att läsa ett av de frånkopplade banden. Det går långsamt, och delar av det går inte att läsa. Ingen kan ännu säga hur mycket data den rena miljön faktiskt kommer att få."], ["The first offline tape test was slow and partly unreadable.", "Det första testet av ett frånkopplat band var långsamt och delvis oläsbart."], { reopen: true }),
              io(["Another week on paper", "En vecka till på papper"], ["The service owner tells field staff to expect at least another week on paper forms. The reply from the field is short and angry.", "Tjänsteägaren meddelar fältpersonalen att de får räkna med minst en vecka till på pappersblanketter. Svaret från fältet är kort och argt."], ["Field staff were told to expect at least another week on paper.", "Fältpersonalen har fått besked om minst en vecka till på papper."])
            ]),
            ir("i2", { notChosen: "A" }, ["No clean room", "Ingen ren miljö"], [
              io(["The partner will not vouch", "Partnern går inte i god"], ["Your incident response partner says they still cannot explain how the malware reached every machine at once, and will not vouch for anything built in the existing environment.", "Er incidentresponspartner säger att de fortfarande inte kan förklara hur skadekoden nådde alla datorer samtidigt, och går inte i god för något som byggs i den befintliga miljön."], ["The response partner will not vouch for the existing environment.", "Incidentpartnern går inte i god för den befintliga miljön."], { reopen: true }),
              io(["The board likes it", "Styrelsen gillar det"], ["The board welcomes not having to pay for a whole new environment, and finance is relieved. The decision is praised as level-headed.", "Styrelsen välkomnar att slippa betala för en helt ny miljö, och ekonomi är lättad. Beslutet beröms som sansat."], ["The board welcomed avoiding the cost of a new environment.", "Styrelsen välkomnade att slippa kostnaden för en ny miljö."]),
              io(["A few servers boot", "Några servrar startar"], ["IT finds a few servers that seem untouched and boot normally. Nobody can say whether they are clean or simply have not been hit yet.", "IT hittar några servrar som verkar orörda och startar normalt. Ingen kan säga om de är rena eller bara inte har drabbats ännu."], ["A few servers seem untouched; nobody can say whether they are clean.", "Några servrar verkar orörda; ingen kan säga om de är rena."])
            ])
          ]
        }),
        facilitator: fac(
          ["Grief, then planning. Give the room a moment.", "Sorg, sedan planering. Ge gruppen ett ögonblick."],
          ["A clean-room rebuild for critical services, with evidence preserved.", "En ren ombyggnad av kritiska tjänster, med spåren bevarade."],
          [["Ask: what is the minimum that must work in 48 hours?", "Fråga: vad är det minsta som måste fungera inom 48 timmar?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 720,
        title: L(["The authorities arrive", "Myndigheterna kommer"]),
        twist: L(["The authorities link the attack to a state actor — and set rules for what you may share.", "Myndigheterna kopplar angreppet till en statlig aktör – och sätter regler för vad ni får dela."]),
        twistKind: "authority",
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because the authorities were alerted early, investigators have seized three servers you had planned to rebuild first.", sv: "Eftersom myndigheterna larmades tidigt har utredarna beslagtagit tre servrar som ni tänkt bygga om först." } }
        ],
        assumptionChallenged: L(["This is our incident to manage and talk about as we see fit.", "Det här är vår incident att hantera och tala om som vi själva vill."]),
        reveals: ["hf-actor"],
        narrative: L([
          "{{time.T+720|weekday|cap}} {{time.T+720|daypart}}, {{time.T+720|clock}}. Representatives from {{reg.csirt}} and the national security service arrive and meet the crisis management team behind closed doors.\n\nThey bring information they cannot fully share, and requests you did not expect. Outside, journalists have started calling: the outage is visible to everyone who relies on {{org.name}}.",
          "{{time.T+720|weekday|cap}} {{time.T+720|daypart}}, klockan {{time.T+720|clock}}. Företrädare för {{reg.csirt}} och säkerhetstjänsten kommer och möter krisledningsgruppen bakom stängda dörrar.\n\nDe har med sig information som de inte kan dela fullt ut, och önskemål ni inte hade väntat er. Utanför har journalister börjat ringa: avbrottet syns för alla som är beroende av {{org.name}}."
        ]),
        injects: [
          inj("i4-1", 720, "advisory", "csirt", "critical", "confirmed", [
            "Assessment: the attack matches a state-linked group with access for about {{num.dwellDays}} days. Other operators may be targeted. Indicators are shared with you in confidence and must not be published.",
            "Bedömning: angreppet stämmer med en statskopplad grupp som har haft åtkomst i ungefär {{num.dwellDays}} dagar. Andra aktörer kan vara måltavlor. Indikatorer delas med er i förtroende och får inte publiceras."
          ], { headline: ["Assessment shared in confidence", "Bedömning delad i förtroende"], reveals: ["hf-actor"], tests: ["lo2"] }),
          inj("i4-2", 760, "mediaEnquiry", "media", "high", "confirmed", [
            "A national broadcaster: “Sources say your outage is a cyberattack by a foreign state. Can you confirm?”",
            "En rikstäckande kanal: ”Källor säger att ert avbrott är en cyberattack från en främmande stat. Kan ni bekräfta?”"
          ], { optional: true, pressure: "media", tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("How do you use confidential indicators to check what survived?", "Hur använder ni de konfidentiella indikatorerna för att kontrollera det som överlevde?", ["socLead", "ciso"]),
            q("What does {{num.dwellDays}} days of access mean for your rebuild?", "Vad innebär {{num.dwellDays}} dagars åtkomst för er ombyggnad?", ["ciso", "itOps"]),
            q("Does your recovery approach still fit with a state actor in the picture?", "Passar er väg för återställningen fortfarande när en statlig aktör finns med i bilden?", ["cio"], "d3")
          ],
          executive: [
            q("What can you say publicly without breaking the authorities' trust?", "Vad kan ni säga offentligt utan att bryta myndigheternas förtroende?", ["comms", "legal"]),
            q("Who in your organisation may know the confidential details?", "Vilka i er organisation får känna till de konfidentiella detaljerna?", ["securityOfficer", "ceo"]),
            q("Did reporting early pay off?", "Lönade det sig att rapportera tidigt?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("The media know more than you are allowed to confirm.", "Media vet mer än ni får bekräfta.")],
        decision: dec("d4", "ceo", ["What do you say publicly?", "Vad säger ni offentligt?"], [
          ["Confirm a serious cyberattack and cooperation with authorities; do not attribute.", "Bekräfta ett allvarligt cyberangrepp och samarbete med myndigheterna; peka inte ut någon."],
          ["Confirm the authorities' assessment openly.", "Bekräfta myndigheternas bedömning öppet."],
          ["Describe it as a technical fault until the authorities speak.", "Beskriv det som ett tekniskt fel tills myndigheterna uttalar sig."]
        ], {
          knowns: [["Authorities ask you not to publish indicators or attribution.", "Myndigheterna ber er att inte publicera indikatorer eller peka ut någon."]],
          uncertainties: [["When authorities will speak publicly.", "När myndigheterna kommer att uttala sig offentligt."]],
          tradeoffs: {
            operational: ["Saying little keeps cooperation smooth.", "Att säga lite håller samarbetet smidigt."],
            security: ["Attribution can tip off the attacker and harm others' defence.", "Att peka ut någon kan varna angriparen och skada andras försvar."],
            legal: ["Sharing confidential information may breach terms.", "Att dela konfidentiell information kan bryta mot villkoren."],
            reputational: ["Calling it a technical fault would later be exposed.", "Att kalla det ett tekniskt fel skulle senare avslöjas."]
          },
          evaluation: [["Communicates truthfully within the authorities' limits", "Kommunicerar sanningsenligt inom myndigheternas gränser"]],
          pushback: {
            A: [
              pb(["No comment means yes", "Inga kommentarer betyder ja"], ["The broadcaster runs with its sources: “a foreign state”. Your statement neither confirms nor denies, and viewers read that as a yes. Do you stay with the line while the story is told without you?", "Kanalen går ut med sina källor: ”en främmande stat”. Ert uttalande varken bekräftar eller förnekar, och tittarna tolkar det som ett ja. Står ni fast vid linjen medan historien berättas utan er?"]),
              pb(["Did you pay?", "Betalade ni?"], ["Without attribution, the public assumes ordinary ransomware. Customers and journalists now ask the obvious question: did you pay the ransom? You cannot explain why that question makes no sense. How do you answer without saying more than you are allowed?", "Utan något utpekande antar allmänheten att det är vanlig ransomware. Kunder och journalister ställer nu den självklara frågan: betalade ni lösensumman? Ni kan inte förklara varför frågan saknar mening. Hur svarar ni utan att säga mer än ni får?"]),
              pb(["Your own staff talk", "Er egen personal pratar"], ["Word has spread among staff that national security people were in the building, and some are already saying “state actor”. One has already hinted at it on social media. Your public line is careful; your organisation is not. How do you keep the two consistent?", "Det har spridits bland personalen att säkerhetstjänsten var i huset, och några säger redan ”statlig aktör”. En har redan antytt det i sociala medier. Er offentliga linje är försiktig; er organisation är det inte. Hur får ni de två att hänga ihop?"])
            ],
            B: [
              pb(["Shared in confidence", "Delat i förtroende"], ["{{reg.csirt}} reminds you that the assessment was shared in confidence and was not for publication. If you confirm it openly, they warn, future information will come more slowly and with more conditions. Is being open worth losing their trust?", "{{reg.csirt}} påminner om att bedömningen delades i förtroende och inte var för publicering. Om ni bekräftar den öppet, varnar de, kommer framtida information långsammare och med fler villkor. Är öppenheten värd att förlora deras förtroende?"]),
              pb(["An assessment, not a fact", "En bedömning, inte ett faktum"], ["The authorities called it an assessment. If it is revised next week, you will be the organisation that named a state actor on the record. Are you ready to stand behind a conclusion that is not yours?", "Myndigheterna kallade det en bedömning. Om den ändras nästa vecka är det ni som på öppen scen har pekat ut en statlig aktör. Är ni beredda att stå bakom en slutsats som inte är er egen?"]),
              pb(["Others are still exposed", "Andra är fortfarande utsatta"], ["Your security officer warns that other operators may be targets and are still checking their own networks. Telling the attacker publicly that they have been identified could make them move faster against the rest. Is your openness someone else's risk?", "Er säkerhetsskyddschef varnar för att andra verksamheter kan vara måltavlor och fortfarande går igenom sina nät. Att offentligt tala om för angriparen att de har identifierats kan få dem att agera snabbare mot de andra. Är er öppenhet någon annans risk?"])
            ],
            C: [
              pb(["Everyone saw the red screen", "Alla såg den röda skärmen"], ["Employees across the organisation saw a ransom note on their screens, and photos are already circulating. A “technical fault” will be contradicted by your own staff within hours. Who will they believe, and what is your credibility worth afterwards?", "Anställda i hela organisationen såg ett utpressningsmeddelande på sina skärmar, och bilder cirkulerar redan. Ett ”tekniskt fel” kommer att motsägas av er egen personal inom några timmar. Vem kommer folk att tro på, och vad är er trovärdighet värd efteråt?"]),
              pb(["The broadcaster has sources", "Kanalen har källor"], ["The broadcaster already has sources saying cyberattack. Your “technical fault” turns the story into “operator denies cyberattack”. Do you want to be the headline, and how do you walk it back when the authorities speak?", "Kanalen har redan källor som säger cyberangrepp. Ert ”tekniska fel” gör nyheten till ”verksamheten förnekar cyberangrepp”. Vill ni vara rubriken, och hur backar ni när myndigheterna uttalar sig?"]),
              pb(["The authorities object", "Myndigheterna invänder"], ["{{reg.csirt}} asked you not to attribute, not to mislead. They point out that calling an attack on essential services a fault may stop others from checking their own systems. Is that a cost you are willing to carry?", "{{reg.csirt}} bad er att inte peka ut någon, inte att vilseleda. De påpekar att om ett angrepp på samhällsviktiga tjänster kallas ett fel kan andra låta bli att kontrollera sina egna system. Är det en kostnad ni är beredda att bära?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["A careful statement", "Ett försiktigt uttalande"], [
              io(["The authorities approve", "Myndigheterna uppskattar det"], ["{{reg.csirt}} thanks you for keeping to what was agreed, and the next set of indicators arrives faster than the first.", "{{reg.csirt}} tackar er för att ni höll er till det som överenskommits, och nästa omgång indikatorer kommer snabbare än den första."], ["{{reg.csirt}} has thanked you for your restraint.", "{{reg.csirt}} har tackat er för er återhållsamhet."]),
              io(["The story without you", "Historien utan er"], ["The broadcaster reports, citing sources, that a foreign state is behind the attack. Next to that, your statement looks evasive, and the evening debate is about what you are hiding.", "Kanalen rapporterar, med hänvisning till källor, att en främmande stat ligger bakom angreppet. Bredvid det ser ert uttalande undanglidande ut, och kvällens debatt handlar om vad ni döljer."], ["The broadcaster has reported that a foreign state is behind it.", "Kanalen har rapporterat att en främmande stat ligger bakom."], { meters: { media: 1 } }),
              io(["An employee posts", "En anställd skriver"], ["An employee posts that “the security service” was in the building today. It is not quite what happened, and it is not quite wrong.", "En anställd skriver i sociala medier att ”säkerhetstjänsten” var i huset i dag. Det är inte riktigt vad som hände, och inte riktigt fel heller."], ["An employee has posted that the security service was in the building.", "En anställd har skrivit att säkerhetstjänsten var i huset."])
            ]),
            ir("i2", { notChosen: "A" }, ["Off the agreed line", "Utanför den överenskomna linjen"], [
              io(["The authorities pull back", "Myndigheterna drar sig tillbaka"], ["{{reg.csirt}} says your statement was not what was agreed, and that for now they will share less with you and with conditions attached.", "{{reg.csirt}} säger att ert uttalande inte var det som överenskommits, och att de tills vidare kommer att dela mindre med er och med villkor."], ["{{reg.csirt}} says it will share less with you for now.", "{{reg.csirt}} säger att de tills vidare kommer att dela mindre med er."], { reopen: true, meters: { regulator: 1 } }),
              io(["The headline", "Rubriken"], ["Your statement leads the evening news, and the story is no longer the outage but what {{org.name}} chose to say about it.", "Ert uttalande toppar kvällsnyheterna, och nyheten är inte längre avbrottet utan vad {{org.name}} valde att säga om det."], ["Your statement became the evening's headline.", "Ert uttalande blev kvällens förstanyhet."], { meters: { media: 1 } }),
              io(["Is our data safe?", "Är våra uppgifter säkra?"], ["Customers call to ask whether their personal data is safe. Customer service has no script, and the answers given vary from call to call.", "Kunder ringer och frågar om deras personuppgifter är säkra. Kundtjänst har inget manus, och svaren varierar från samtal till samtal."], ["Customer service has no agreed answer on customer data.", "Kundtjänst har inget överenskommet svar om kunduppgifterna."], { meters: { trust: -1 } })
            ])
          ]
        }),
        facilitator: fac(
          ["Shared authority. Watch whether comms and security stay aligned.", "Delat mandat. Se om kommunikation och säkerhet håller ihop."],
          ["Truthful public statements, no attribution and a controlled circle of knowledge.", "Sanningsenliga offentliga uttalanden, ingen utpekning och en avgränsad krets som känner till detaljerna."],
          [["Ask: what is true and sayable right now?", "Fråga: vad är sant och går att säga just nu?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 1440,
        title: L(["No identity left", "Ingen identitet kvar"]),
        twist: L(["Domain controllers and backup consoles were wiped too. Nobody can log in to anything.", "Domänkontrollanter och backupkonsoler raderades också. Ingen kan logga in någonstans."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "The authorities now set rules for what you may share. If you reported early, you lost control of the timeline. If you waited, they ask why they heard it from someone else first.", sv: "Myndigheterna bestämmer nu vad ni får dela. Om ni rapporterade tidigt förlorade ni kontrollen över tidslinjen. Om ni väntade frågar de varför de hörde det från någon annan först." } },
        assumptionChallenged: L(["Our identity and backup management survived.", "Vår identitetsmiljö och backupförvaltning klarade sig."]),
        reveals: ["hf-identity"],
        narrative: L([
          "The next day, {{time.T+1440|clock}}. The rebuild team starts with what everything else depends on: the directory that lets people and systems log in.\n\nThey expected to restore it from backup in a few hours. Instead, they spend the morning discovering how far the damage reaches, and why the obvious first step cannot be the first step.",
          "Nästa dag, klockan {{time.T+1440|clock}}. Ombyggnadsteamet börjar med det som allt annat är beroende av: katalogtjänsten som låter människor och system logga in.\n\nDe räknade med att återställa den från säkerhetskopia på några timmar. I stället ägnar de förmiddagen åt att upptäcka hur långt skadan når, och varför det självklara första steget inte kan vara det första."
        ]),
        injects: [
          inj("i5-1", 1440, "forensicFinding", "itOps", "critical", "confirmed", [
            "All domain controllers and both backup management consoles were wiped. Offline backup tapes exist but can only be read once a backup server is rebuilt — which needs accounts that no longer exist.",
            "Alla domänkontrollanter och båda backupkonsolerna har raderats. Frånkopplade backupband finns men kan bara läsas när en backupserver har byggts upp – vilket kräver konton som inte längre finns."
          ], { reveals: ["hf-identity"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c5-blast", type: "blast",
          title: L(["What the wiper reached", "Vad raderingsprogrammet nådde"]),
          data: () => ({
            center: { label: L(["Group policy", "Grupprincip"]), status: "compromised" },
            rings: [
              { label: L(["Identity", "Identitet"]), nodes: [{ label: L(["Domain controllers", "Domänkontrollanter"]), status: "down" }, { label: L(["Admin workstations", "Administratörsdatorer"]), status: "down" }] },
              { label: L(["Infrastructure", "Infrastruktur"]), nodes: [{ label: L(["Backup consoles", "Backupkonsoler"]), status: "down" }, { label: L(["File servers", "Filservrar"]), status: "down" }] },
              { label: L(["Survived", "Klarade sig"]), nodes: [{ label: L(["Offline tapes", "Frånkopplade band"]), status: "ok" }, { label: L(["Cloud email", "E-post i molnet"]), status: "unknown" }] }
            ]
          })
        }],
        questions: {
          technical: [
            q("In what order do you rebuild identity, backup and critical services?", "I vilken ordning bygger ni upp identitet, backup och kritiska tjänster?", ["itOps", "cio"]),
            q("How do you make the new environment trustworthy from the first account?", "Hur gör ni den nya miljön pålitlig redan från det första kontot?", ["ciso"]),
            q("Did your choice of recovery approach anticipate this?", "Förutsåg er väg för återställningen det här?", ["cio"], "d3")
          ],
          executive: [
            q("How long can essential services run on paper?", "Hur länge kan samhällsviktiga tjänster drivas på papper?", ["serviceOwner", "ceo"]),
            q("Do you bring in outside help for the rebuild, and at what cost?", "Tar ni in extern hjälp för ombyggnaden, och till vilken kostnad?", ["cio", "ceo"]),
            q("Does the authorities' involvement help or slow the rebuild?", "Hjälper eller bromsar myndigheternas inblandning ombyggnaden?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("Rebuilding identity from nothing takes days before anything else can start.", "Att bygga upp identitetsmiljön från ingenting tar dagar innan något annat kan börja.")],
        decision: dec("d5", "cio", ["What is the rebuild order?", "Vilken ordning väljer ni för ombyggnaden?"], [
          ["Identity and backup first in a clean environment, then services by business priority.", "Identitet och backup först i en ren miljö, därefter tjänsterna efter verksamhetens prioritering."],
          ["The most critical business service first on stand-alone accounts, identity later.", "Den mest kritiska verksamhetstjänsten först med fristående konton, identiteten senare."],
          ["Rebuild everything in parallel with external teams.", "Bygg upp allt parallellt med externa team."]
        ], {
          knowns: [["Identity and backup management are gone.", "Identitetsmiljön och backupförvaltningen är borta."]],
          uncertainties: [["How much of the offline backup is usable.", "Hur mycket av de frånkopplade säkerhetskopiorna som går att använda."]],
          tradeoffs: {
            operational: ["Identity first delays visible progress.", "Identitet först fördröjer synliga framsteg."],
            security: ["Stand-alone accounts create new risks.", "Fristående konton skapar nya risker."],
            legal: ["Essential services may have minimum service obligations.", "Samhällsviktiga tjänster kan ha krav på lägsta servicenivå."],
            reputational: ["The public will measure progress by visible services.", "Allmänheten mäter framsteg utifrån synliga tjänster."]
          },
          evaluation: [["Builds trustworthy identity before dependent services", "Bygger upp en pålitlig identitetsmiljö före de tjänster som är beroende av den"]],
          pushback: {
            A: [
              pb(["Field crews make mistakes", "Fältpersonalen gör misstag"], ["While IT rebuilds identity and backup, field crews work from paper lists, and the first serious error comes in: a crew sent to the wrong site. Every day without work orders adds risk. How many days of that does identity first cost?", "Medan IT bygger upp identitet och backup arbetar fältpersonalen från papperslistor, och det första allvarliga misstaget rapporteras: ett lag skickat till fel plats. Varje dag utan arbetsordrar ökar risken. Hur många sådana dagar kostar det att börja med identiteten?"]),
              pb(["Who creates the first account?", "Vem skapar det första kontot?"], ["The new directory needs its first administrators. The only people who know how to build it were administrators in the environment that was just taken over. Do you trust them with the keys to the new one, and how would you check?", "Den nya katalogtjänsten behöver sina första administratörer. De enda som kan bygga den var administratörer i miljön som just togs över. Litar ni på dem med nycklarna till den nya, och hur skulle ni kontrollera det?"]),
              pb(["Days for maybe", "Dagar för kanske"], ["Nobody knows how much of the offline tapes can be read. Rebuilding backup first could spend days building a server for tapes that turn out to be unusable. Is it the right first step when you are not sure what it unlocks?", "Ingen vet hur mycket av de frånkopplade banden som går att läsa. Att bygga upp backup först kan innebära dagar för en server till band som visar sig vara oanvändbara. Är det rätt första steg när ni inte vet vad det öppnar?"])
            ],
            B: [
              pb(["Passwords on paper", "Lösenord på papper"], ["Within a day, the stand-alone accounts for the critical service are shared by whole shifts, and passwords are taped to screens. Nobody can tell who did what. Is a working service on uncontrolled accounts better than a slower one you can trust?", "Inom ett dygn delas de fristående kontona till den kritiska tjänsten av hela skift, och lösenorden sitter på skärmarna. Ingen kan se vem som gjort vad. Är en fungerande tjänst på okontrollerade konton bättre än en långsammare ni kan lita på?"]),
              pb(["Building it twice", "Att bygga det två gånger"], ["When identity is rebuilt later, the critical service has to be moved onto it and reconfigured, a second rebuild in the middle of running it. IT estimates another outage. Do you accept doing the hardest part twice?", "När identiteten byggs upp senare måste den kritiska tjänsten flyttas in i den och konfigureras om, en andra ombyggnad mitt i driften. IT räknar med ett nytt avbrott. Accepterar ni att göra det svåraste två gånger?"]),
              pb(["Invisible to security", "Osynligt för säkerheten"], ["The security team says it cannot monitor stand-alone accounts on an isolated service: no central logs, no alerts. The first system back is the one you can see least of. Do you accept that blindness on the service that matters most?", "Säkerhetsteamet säger att de inte kan övervaka fristående konton på en isolerad tjänst: inga centrala loggar, inga larm. Det första systemet som kommer tillbaka är det ni ser minst av. Accepterar ni den blindheten för den tjänst som betyder mest?"])
            ],
            C: [
              pb(["Everyone waits for identity", "Alla väntar på identiteten"], ["The external teams arrive, and each one finds the same thing: nothing can be built without accounts, and identity is not ready. Parallel teams are queuing for the same first step. Are you paying for speed you cannot use?", "De externa teamen kommer, och alla upptäcker samma sak: inget kan byggas utan konton, och identiteten är inte klar. Parallella team köar för samma första steg. Betalar ni för en snabbhet ni inte kan använda?"]),
              pb(["Who holds the admin rights?", "Vem har administratörsrätten?"], ["Each external team asks for administrator access to do its part. Soon a dozen people from four companies hold the highest rights in an environment you are trying to keep clean. Who controls who gets in, and who checks what they do?", "Varje externt team ber om administratörsrätt för att göra sin del. Snart har ett tiotal personer från fyra företag de högsta rättigheterna i en miljö ni försöker hålla ren. Vem styr vilka som kommer in, och vem kontrollerar vad de gör?"]),
              pb(["The bill and the board", "Notan och styrelsen"], ["Finance sees the first invoices from the external teams and asks who approved the spending, and whether anyone knows how many weeks it will run. Do you have a budget for this, and what do you tell the board?", "Ekonomi ser de första fakturorna från de externa teamen och frågar vem som godkände kostnaderna, och om någon vet hur många veckor det håller på. Har ni en budget för det här, och vad säger ni till styrelsen?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Identity first", "Identiteten först"], [
              io(["The first clean account", "Det första rena kontot"], ["A day and a half in, a clean directory is running and the first admin accounts exist, each tied to new hardware. The rebuild team says it is the first thing they fully trust.", "Efter ett och ett halvt dygn är en ren katalogtjänst igång och de första administratörskontona finns, vart och ett knutet till ny hårdvara. Ombyggnadsteamet säger att det är det första de litar fullt på."], ["A clean directory is running with new admin accounts.", "En ren katalogtjänst är igång med nya administratörskonton."]),
              io(["Nothing to show", "Inget att visa"], ["The service owner escalates to the CEO: field staff have been on paper for days and see no progress at all. They want one service back before anything else.", "Tjänsteägaren eskalerar till vd: fältpersonalen har arbetat på papper i flera dagar och ser inga framsteg alls. Hen vill ha tillbaka en tjänst före allt annat."], ["The service owner has escalated the lack of visible progress to the CEO.", "Tjänsteägaren har eskalerat bristen på synliga framsteg till vd."], { reopen: true }),
              io(["No tape catalogue", "Ingen bandkatalog"], ["The backup server is back, but its catalogue of what is on which tape was lost with the consoles. Every tape must be indexed by hand before anything can be restored from it.", "Backupservern är tillbaka, men katalogen över vad som finns på vilket band försvann med konsolerna. Varje band måste indexeras för hand innan något kan läsas tillbaka från det."], ["The tape catalogue was lost; tapes must be indexed by hand.", "Bandkatalogen gick förlorad; banden måste indexeras för hand."])
            ]),
            ir("i2", { notChosen: "A" }, ["Services before identity", "Tjänster före identitet"], [
              io(["Accounts nobody tracks", "Konton som ingen håller reda på"], ["To get things running, teams have created temporary local accounts, several with shared passwords. Nobody has a full list of them.", "För att få igång saker har teamen skapat tillfälliga lokala konton, flera med delade lösenord. Ingen har en fullständig lista över dem."], ["Temporary accounts with shared passwords exist and nobody has a list.", "Tillfälliga konton med delade lösenord finns och ingen har en lista."], { reopen: true }),
              io(["Something works", "Något fungerar"], ["A critical service is partly working again, and field staff can see some of their work orders. The public notices, and the mood in the room lifts.", "En kritisk tjänst fungerar delvis igen, och fältpersonalen kan se en del av sina arbetsordrar. Allmänheten märker det, och stämningen i rummet lättar."], ["A critical service is partly working again.", "En kritisk tjänst fungerar delvis igen."]),
              io(["Who owns the order?", "Vem äger ordningen?"], ["IT and the outside teams disagree about which service waits for which. Each has a plan, and nobody has the authority to settle it.", "IT och de externa teamen är oense om vilken tjänst som ska vänta på vilken. Alla har en plan, och ingen har mandat att avgöra det."], ["Teams disagree on the rebuild order and nobody owns it.", "Teamen är oense om ordningen för ombyggnaden och ingen äger den."])
            ])
          ]
        }),
        facilitator: fac(
          ["Deep technical planning; let the IT voices lead, with business priorities in view.", "Djup teknisk planering; låt IT leda, med verksamhetens prioriteringar i sikte."],
          ["Clean identity and backup first, then services in an agreed order.", "Ren identitet och backup först, därefter tjänsterna i en överenskommen ordning."],
          [["Ask: what is the first account in the new environment, and who creates it?", "Fråga: vilket är det första kontot i den nya miljön, och vem skapar det?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 2880,
        title: L(["Weeks on paper", "Veckor på papper"]),
        twist: L(["The rebuild will take {{num.weeks}} weeks. The organisation must run manually far longer than anyone planned.", "Ombyggnaden kommer att ta {{num.weeks}} veckor. Organisationen måste drivas manuellt betydligt längre än någon har planerat för."]),
        twistKind: "impact",
        branches: [
          { when: { decision: "d5", option: "A" }, narrativeAppend: { en: "Because identity and backup were rebuilt first, customer-facing services stay down another week, and the supervisory authority for essential services asks why.", sv: "Eftersom identitet och säkerhetskopiering byggdes om först förblir kundnära tjänster nere ytterligare en vecka, och tillsynsmyndigheten för samhällsviktiga tjänster frågar varför." } }
        ],
        assumptionChallenged: L(["Our continuity plan covers a few days without IT.", "Vår kontinuitetsplan täcker några dagar utan IT."]),
        narrative: L([
          "Two days in. Field staff, customer service and finance are improvising with paper forms, personal phones and spreadsheets on the few laptops that still work.\n\nIt is working for the most urgent jobs, but people are tired and mistakes are creeping in. Everyone is asking the same question: how long?",
          "Två dagar in. Fältpersonal, kundtjänst och ekonomi improviserar med pappersblanketter, privata telefoner och kalkylark på de få datorer som fortfarande fungerar.\n\nDet fungerar för de mest brådskande uppdragen, men folk är trötta och misstagen börjar smyga sig in. Alla ställer samma fråga: hur länge?"
        ]),
        injects: [
          inj("i6-1", 2880, "impactReport", "person.serviceOwner", "high", "confirmed", [
            "Paper processes work for urgent jobs but are slowing. Staff are exhausted. Invoicing has stopped. The continuity plan assumed 72 hours without IT.",
            "Pappersrutinerna fungerar för akuta uppdrag men går allt långsammare. Personalen är utmattad. Faktureringen har stannat. Kontinuitetsplanen förutsatte 72 timmar utan IT."
          ], { fallbackRole: "itOps", tests: ["lo4"] })
        ],
        charts: [{
          id: "c6-rto", type: "rto",
          title: L(["Recovery time objective against estimated rebuild", "Mål för återställningstid jämfört med beräknad ombyggnad"]),
          caption: L(["Hours.", "Timmar."]),
          data: (ctx) => ({
            services: Object.values(ctx.org.services).map((s, i) => ({ id: s.id, name: s.name, rto: s.rto, rpo: s.rpo, estimate: Math.round(ctx.vars.weeks * 168 * (0.25 + 0.2 * i)) }))
          })
        }],
        questions: {
          technical: [
            q("Which temporary tools could support manual work safely?", "Vilka tillfälliga verktyg skulle kunna stödja det manuella arbetet på ett säkert sätt?", ["itOps", "ciso"]),
            q("How do you prevent shadow IT from creating new risks?", "Hur förhindrar ni att skugg-IT skapar nya risker?", ["ciso"]),
            q("Does your rebuild order still match what the business most needs?", "Stämmer er ordning för ombyggnaden fortfarande med det verksamheten behöver mest?", ["cio"], "d5")
          ],
          executive: [
            q("How do you protect staff from burning out?", "Hur skyddar ni personalen från att gå in i väggen?", ["ceo", "incidentCommander"]),
            q("Which services do you reduce or stop?", "Vilka tjänster minskar ni eller stoppar ni?", ["serviceOwner", "ceo"]),
            q("Did your early continuity decisions hold up?", "Höll era tidiga beslut om kontinuitet?", ["ceo"], "d1")
          ]
        },
        challenges: [ch("Staff are using personal phones and free cloud tools to keep work going.", "Personalen använder privata telefoner och gratis molntjänster för att hålla arbetet igång.")],
        decision: dec("d6", "ceo", ["How do you sustain operations for weeks?", "Hur håller ni verksamheten igång i flera veckor?"], [
          ["Formally reduce services, set shifts and rest, and provide approved temporary tools.", "Minska tjänsterna formellt, inför skift och vila och tillhandahåll godkända tillfälliga verktyg."],
          ["Keep all services running on paper with overtime.", "Håll alla tjänster igång på papper med övertid."],
          ["Let teams find their own solutions.", "Låt teamen hitta egna lösningar."]
        ], {
          knowns: [["Estimated rebuild time: {{num.weeks}} weeks of manual operation.", "Beräknad tid för ombyggnad: {{num.weeks}} veckor med manuell drift."]],
          uncertainties: [["How long staff can sustain the pace.", "Hur länge personalen orkar hålla takten."]],
          tradeoffs: {
            operational: ["Reducing services is visible and unpopular.", "Att minska tjänster märks och är impopulärt."],
            security: ["Uncontrolled tools create new exposure.", "Okontrollerade verktyg skapar ny exponering."],
            legal: ["Working-time and duty-of-care rules apply.", "Regler om arbetstid och arbetsgivarens omsorgsplikt gäller."],
            reputational: ["A controlled reduction is better than a collapse.", "En kontrollerad neddragning är bättre än en kollaps."]
          },
          evaluation: [["Plans for endurance, not only the first days", "Planerar för uthållighet, inte bara för de första dagarna"]],
          pushback: {
            A: [
              pb(["Which services go?", "Vilka tjänster stryks?"], ["Formally reducing services means naming which customers or areas get less. Some essential services have minimum obligations, and every reduction will be noticed. Who chooses what stops, and how do you defend it to those affected?", "Att formellt minska tjänsterna innebär att peka ut vilka kunder eller områden som får mindre. Vissa samhällsviktiga tjänster har krav på lägsta nivå, och varje neddragning kommer att märkas. Vem väljer vad som stoppas, och hur försvarar ni det inför de drabbade?"]),
              pb(["Approved tools take time", "Godkända verktyg tar tid"], ["Security needs days to vet and set up temporary tools properly. Until then, staff keep using messaging apps on personal phones. Do you allow the workaround in the meantime, or ban it before there is anything to replace it?", "Säkerhet behöver dagar för att granska och sätta upp tillfälliga verktyg ordentligt. Till dess fortsätter personalen att använda meddelandeappar i privata telefoner. Tillåter ni den lösningen så länge, eller förbjuder ni den innan det finns något som ersätter den?"]),
              pb(["A supervisor refuses", "En arbetsledare vägrar"], ["A supervisor refuses to stop a service the plan removes: their team has run it for years and the customers depend on it. They say they will keep going on overtime. Do you order them to stop, and what does that do to a tired team?", "En arbetsledare vägrar stoppa en tjänst som planen tar bort: teamet har skött den i åratal och kunderna är beroende av den. Hen säger att de fortsätter på övertid. Beordrar ni dem att sluta, och vad gör det med ett trött team?"])
            ],
            B: [
              pb(["A mistake on paper", "Ett misstag på papper"], ["On the second week of overtime, a tired dispatcher mixes up two paper forms and a crew goes to the wrong address on an urgent job. Nobody is hurt this time. How many more weeks of this pace do you accept?", "Under andra veckan med övertid blandar en trött arbetsledare ihop två pappersblanketter och ett lag åker till fel adress på ett brådskande uppdrag. Ingen skadas den här gången. Hur många fler veckor i den här takten accepterar ni?"]),
              pb(["Working-time rules", "Arbetstidsreglerna"], ["HR reports that several staff will pass the legal limits on overtime within days, and the union has started asking questions. Keeping everything running means breaking the rules or finding people you do not have. Which do you choose?", "HR rapporterar att flera medarbetare passerar de lagliga gränserna för övertid inom några dagar, och facket har börjat ställa frågor. Att hålla allt igång innebär att bryta mot reglerna eller hitta folk ni inte har. Vad väljer ni?"]),
              pb(["Weeks of overtime", "Veckor med övertid"], ["The rebuild is estimated at {{num.weeks}} weeks. Finance asks what overtime for that long will cost and who approved it. Is the plan to keep everything running really a plan, or a hope that it will be over sooner?", "Ombyggnaden beräknas ta {{num.weeks}} veckor. Ekonomi frågar vad övertid under så lång tid kostar och vem som godkände den. Är planen att hålla allt igång verkligen en plan, eller en förhoppning om att det går över fortare?"])
            ],
            C: [
              pb(["Customer data in a free tool", "Kunddata i ett gratisverktyg"], ["One team now keeps its customer list and work orders in a free online spreadsheet, shared by a link anyone could forward. It works well. Do you shut it down without an alternative, and who is responsible if that link leaks?", "Ett team har nu sin kundlista och sina arbetsordrar i ett gratis kalkylark på nätet, delat via en länk som vem som helst kan vidarebefordra. Det fungerar bra. Stänger ni det utan alternativ, och vem ansvarar om länken läcker?"]),
              pb(["Five ways of doing it", "Fem sätt att göra det"], ["Each team records jobs its own way. When systems return, finance will have to rebuild weeks of invoices from five different formats, some on paper. Who reconciles it, and how much revenue will be lost in the gaps?", "Varje team registrerar uppdragen på sitt eget sätt. När systemen kommer tillbaka måste ekonomi rekonstruera veckor av fakturor från fem olika format, en del på papper. Vem stämmer av det, och hur mycket intäkter går förlorade i glappen?"]),
              pb(["Whose decision was it?", "Vems beslut var det?"], ["A team's improvised process causes a serious mistake, and a regulator asks who approved the way the work was done. The answer is nobody. Can you defend letting teams decide alone for {{num.weeks}} weeks?", "Ett teams improviserade arbetssätt orsakar ett allvarligt misstag, och en tillsynsmyndighet frågar vem som godkände hur arbetet utfördes. Svaret är ingen. Kan ni försvara att teamen fick bestämma själva i {{num.weeks}} veckor?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["A planned reduction", "En planerad neddragning"], [
              io(["Fewer mistakes", "Färre misstag"], ["A week into shifts and rest, fewer errors turn up on the paper forms and sick leave stops rising. The service owner calls it the first good news in days.", "En vecka in i skift och vila dyker färre fel upp på pappersblanketterna och sjukfrånvaron slutar öka. Tjänsteägaren kallar det de första goda nyheterna på flera dagar."], ["Errors on paper forms have dropped since shifts began.", "Felen på pappersblanketterna har minskat sedan skiften infördes."]),
              io(["The supervisor asks why", "Tillsynen frågar varför"], ["The supervisory authority for essential services asks you to justify formally reducing services, and reminds you of your minimum service obligations.", "Tillsynsmyndigheten för samhällsviktiga tjänster ber er motivera den formella neddragningen av tjänsterna, och påminner om era krav på lägsta servicenivå."], ["The supervisory authority has asked you to justify the reduced service.", "Tillsynsmyndigheten har bett er motivera den sänkta servicenivån."], { reopen: true, meters: { regulator: 1 } }),
              io(["Where is the data?", "Var finns datan?"], ["Legal asks where the approved temporary tool actually stores its data. Nobody checked before it was rolled out, and nobody knows.", "Juristerna frågar var det godkända tillfälliga verktyget faktiskt lagrar sin data. Ingen kontrollerade det innan det infördes, och ingen vet."], ["Legal has questioned where the temporary tool stores data.", "Juristerna har ifrågasatt var det tillfälliga verktyget lagrar data."])
            ]),
            ir("i2", { notChosen: "A" }, ["No plan for endurance", "Ingen plan för uthållighet"], [
              io(["A supervisor collapses", "En arbetsledare kollapsar"], ["A control room supervisor collapses from exhaustion halfway through a double shift. They will recover, but will be off for at least a week, and colleagues ask who is next.", "En arbetsledare i kontrollrummet kollapsar av utmattning mitt i ett dubbelpass. Hen kommer att återhämta sig men blir borta minst en vecka, och kollegorna frågar vem som står på tur."], ["A control room supervisor is off after collapsing from exhaustion.", "En arbetsledare i kontrollrummet är borta efter att ha kollapsat av utmattning."], { reopen: true }),
              io(["A link anyone can open", "En länk som alla kan öppna"], ["A team has been sharing a spreadsheet of customer addresses through a free file service. The link turns out to be reachable by anyone who has it, and it has been forwarded outside.", "Ett team har delat ett kalkylark med kundadresser via en gratis filtjänst. Det visar sig att länken går att öppna för alla som har den, och den har vidarebefordrats utanför."], ["A shared link with customer addresses was reachable from outside.", "En delad länk med kundadresser gick att nå utifrån."], { meters: { trust: -1 } }),
              io(["It holds, for now", "Det håller, än så länge"], ["The most urgent jobs are covered this week and morale seems to be holding. Some in the room say the worry about endurance was overdone.", "De mest brådskande uppdragen är täckta den här veckan och moralen verkar hålla. Några i rummet säger att oron för uthålligheten var överdriven."], ["Urgent work is covered for now and morale seems to hold.", "Det akuta arbetet är täckt än så länge och moralen verkar hålla."])
            ])
          ]
        }),
        facilitator: fac(
          ["Continuity is a people problem. Let HR-type concerns surface.", "Kontinuitet är en fråga om människor. Låt frågor om personal och arbetsmiljö komma upp."],
          ["A formally reduced service level, rest and shifts, and approved temporary tools.", "En formellt sänkt servicenivå, vila och skift samt godkända tillfälliga verktyg."],
          [["Ask: who is checking on the people doing the work?", "Fråga: vem tar hand om dem som utför arbetet?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 4320,
        title: L(["Pressure to name names", "Press att peka ut"]),
        twist: L(["Politicians and media demand that you name the country; the government asks you not to.", "Politiker och media kräver att ni namnger landet; regeringen ber er att inte göra det."]),
        twistKind: "authority",
        assumptionChallenged: L(["Being open about who attacked us is always right.", "Det är alltid rätt att vara öppen om vem som angrep oss."]),
        narrative: L([
          "Three days in. The outage is national news. A parliamentary committee wants a briefing, and journalists have heard a country named by their sources.\n\nThe public wants to know who did this. The people who know most about the attack are asking you to say less, not more.",
          "Tre dagar in. Avbrottet är riksnyheter. Ett riksdagsutskott vill ha en föredragning, och journalister har hört ett land nämnas av sina källor.\n\nAllmänheten vill veta vem som gjorde det här. De som vet mest om angreppet ber er att säga mindre, inte mer."
        ]),
        injects: [
          inj("i7-1", 4320, "email", "management", "high", "confirmed", [
            "Government officials: “Attribution is a matter for the state. Please do not name any country, publicly or in briefings, until the government has decided.”",
            "Regeringstjänstemän: ”Attribution är en fråga för staten. Namnge inget land, varken offentligt eller i dragningar, förrän regeringen har beslutat.”"
          ], { tests: ["lo2"] }),
          inj("i7-2", 4350, "socialPost", "socialMedia", "medium", "misleading", [
            "A widely shared post names a country and claims your systems were “wide open”, citing an anonymous employee.",
            "Ett spritt inlägg namnger ett land och påstår att era system var ”vidöppna”, med hänvisning till en anonym anställd."
          ], { optional: true, pressure: "media", facilitatorNote: ["Part speculation, part rumour. Watch whether the group is drawn into correcting details it may not share.", "Delvis spekulation, delvis rykte. Se om gruppen dras in i att rätta detaljer som den inte får dela."], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What technical facts can you share without revealing confidential indicators?", "Vilka tekniska fakta kan ni dela utan att avslöja konfidentiella indikatorer?", ["ciso", "socLead"]),
            q("Is the exposed management interface closed everywhere?", "Är det exponerade förvaltningsgränssnittet stängt överallt?", ["itOps"]),
            q("Did your public line from the first evening hold?", "Höll er offentliga linje från den första kvällen?", ["ciso"], "d4")
          ],
          executive: [
            q("What do you say to the committee?", "Vad säger ni till utskottet?", ["ceo", "legal"]),
            q("How do you answer claims about being “wide open”?", "Hur bemöter ni påståendena om att ni var ”vidöppna”?", ["comms", "ceo"]),
            q("Does your public line still hold, given the pressure?", "Står sig er offentliga linje trots trycket?", ["comms"], "d4")
          ]
        },
        challenges: [ch("Some criticism of your security is fair; some is not.", "En del av kritiken mot er säkerhet är rimlig; en del är det inte.")],
        decision: dec("d7", "ceo", ["How do you handle the political pressure?", "Hur hanterar ni det politiska trycket?"], [
          ["Brief the committee on facts and impact, decline to attribute, and acknowledge your own weaknesses.", "Ge utskottet en dragning om fakta och konsekvenser, avstå från att peka ut någon och erkänn era egna brister."],
          ["Decline the briefing until the authorities speak.", "Tacka nej till dragningen tills myndigheterna har uttalat sig."],
          ["Confirm the country privately to the committee.", "Bekräfta landet för utskottet i förtroende."]
        ], {
          knowns: [["The government asks you not to attribute.", "Regeringen ber er att inte peka ut någon."]],
          uncertainties: [["How long the political pressure will last.", "Hur länge det politiska trycket kommer att vara."]],
          tradeoffs: {
            operational: ["Briefings take leadership time during recovery.", "Dragningar tar ledningens tid under återställningen."],
            security: ["Leaks of confidential details help the attacker.", "Läckor av konfidentiella detaljer hjälper angriparen."],
            legal: ["Breaking confidentiality may have consequences.", "Att bryta sekretessen kan få konsekvenser."],
            reputational: ["Admitting weaknesses builds credibility.", "Att erkänna brister bygger trovärdighet."]
          },
          evaluation: [["Respects the boundary between operator and state", "Respekterar gränsen mellan verksamhet och stat"]],
          pushback: {
            A: [
              pb(["Which country, then?", "Vilket land, då?"], ["Committee members ask the same question three ways: which country? Each time you decline, it sounds more like you are covering for someone. How do you hold the line in the room without looking evasive?", "Utskottets ledamöter ställer samma fråga på tre sätt: vilket land? Varje gång ni avböjer låter det mer som att ni skyddar någon. Hur håller ni linjen i rummet utan att verka undanglidande?"]),
              pb(["Admissions on the record", "Medgivanden till protokollet"], ["Legal warns that weaknesses you acknowledge in a parliamentary briefing will be quoted, by journalists and by anyone who later sues you over the outage. Do you name the weaknesses specifically, or stay general, and is “general” still honest?", "Juristerna varnar för att brister ni medger i en dragning för riksdagen kommer att citeras, av journalister och av alla som senare stämmer er för avbrottet. Nämner ni bristerna konkret, eller håller ni det allmänt, och är ”allmänt” fortfarande ärligt?"]),
              pb(["Is it closed everywhere?", "Är det stängt överallt?"], ["Acknowledging your weaknesses means mentioning the exposed management interface. IT is not yet sure it is closed on every site. Do you tell a committee about a door that may still be open, and what if someone tries it?", "Att erkänna era brister innebär att nämna det exponerade förvaltningsgränssnittet. IT är ännu inte säkra på att det är stängt på alla platser. Berättar ni för ett utskott om en dörr som kanske fortfarande står öppen, och vad händer om någon prövar den?"])
            ],
            B: [
              pb(["“Refuses to answer”", "”Vägrar svara”"], ["The committee chair tells the press that {{org.name}} has declined to brief parliament. The headline writes itself. Is your silence protecting the authorities' work, or just making you look like you have something to hide?", "Utskottets ordförande säger till pressen att {{org.name}} har tackat nej till att informera riksdagen. Rubriken skriver sig själv. Skyddar er tystnad myndigheternas arbete, eller får den er bara att se ut att ha något att dölja?"]),
              pb(["Rumours fill the gap", "Rykten fyller tomrummet"], ["With no word from you, the post claiming your systems were “wide open” keeps spreading and is now quoted by politicians. Nobody is there to correct it. How long can you let others tell your story?", "När ni inte säger något fortsätter inlägget som påstår att era system var ”vidöppna” att spridas och citeras nu av politiker. Ingen finns där för att rätta det. Hur länge kan ni låta andra berätta er historia?"]),
              pb(["They never asked for silence", "De bad aldrig om tystnad"], ["Government officials point out that they asked you not to name a country, not to refuse briefings. Declining the committee puts them in a difficult position too. Who were you protecting by saying no?", "Regeringstjänstemännen påpekar att de bad er att inte namnge något land, inte att tacka nej till dragningar. Att avböja utskottet sätter dem också i en svår sits. Vem skyddade ni genom att säga nej?"])
            ],
            C: [
              pb(["Against an explicit request", "Mot en uttrycklig begäran"], ["The officials' request said: no country, publicly or in briefings. A private confirmation to the committee breaks it word for word. If the government asks who decided to go against it, who in the room answers?", "Tjänstemännens begäran löd: inget land, varken offentligt eller i dragningar. En bekräftelse för utskottet i förtroende bryter mot den ord för ord. Om regeringen frågar vem som beslutade att gå emot den, vem i rummet svarar?"]),
              pb(["Committees leak", "Utskott läcker"], ["By the evening, a journalist quotes “sources in parliament” confirming the country, and says the information came from {{org.name}}. Your private confirmation is now public. How do you face the authorities tomorrow?", "Till kvällen citerar en journalist ”källor i riksdagen” som bekräftar landet, och uppger att uppgiften kom från {{org.name}}. Er bekräftelse i förtroende är nu offentlig. Hur möter ni myndigheterna i morgon?"]),
              pb(["What do you actually know?", "Vad vet ni egentligen?"], ["What you were given was a confidential assessment of a state-linked group, not a finished attribution for you to pass on. Are you sure enough of what you would confirm to put your name to it in front of parliament?", "Det ni fick var en konfidentiell bedömning av en statskopplad grupp, inte en färdig attribution att föra vidare. Är ni tillräckligt säkra på det ni skulle bekräfta för att stå för det inför riksdagen?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The briefing", "Dragningen"], [
              io(["Respect from the chair", "Respekt från ordföranden"], ["The committee chair thanks you publicly for a frank briefing and says it is the first time an operator has admitted its own weaknesses so plainly.", "Utskottets ordförande tackar er offentligt för en öppen dragning och säger att det är första gången en verksamhet så tydligt har erkänt sina egna brister."], ["The committee chair has publicly praised your frankness.", "Utskottets ordförande har offentligt berömt er öppenhet."]),
              io(["Your words, quoted", "Era ord, citerade"], ["A committee member quotes your admission to the press: “the operator admits its systems were exposed”. The nuance is gone.", "En ledamot citerar ert medgivande för pressen: ”verksamheten medger att systemen var exponerade”. Nyanserna är borta."], ["Your admitted weaknesses were quoted in the press.", "Era erkända brister citerades i pressen."], { meters: { media: 1 } }),
              io(["Off the record", "Utanför protokollet"], ["After the briefing, a committee member takes you aside and asks, “off the record”, which country it was.", "Efter dragningen tar en ledamot er åt sidan och frågar, ”utanför protokollet”, vilket land det var."], ["A committee member has asked you privately to name the country.", "En ledamot har bett er i förtroende att namnge landet."])
            ]),
            ir("i2", { notChosen: "A" }, ["No open briefing", "Ingen öppen dragning"], [
              io(["Your critics speak", "Era kritiker får ordet"], ["The committee invites the people behind the “wide open” claims instead, and their version of events is what reaches the evening news.", "Utskottet bjuder i stället in dem som står bakom påståendena om att ni var ”vidöppna”, och det är deras version som når kvällsnyheterna."], ["The committee's public picture of the attack came from your critics.", "Utskottets offentliga bild av angreppet kom från era kritiker."], { meters: { media: 1 } }),
              io(["What are you hiding?", "Vad döljer ni?"], ["Journalists now ask what {{org.name}} is keeping from Parliament. Your silence on your own weaknesses has become the story.", "Journalister frågar nu vad {{org.name}} håller undan för riksdagen. Er tystnad om era egna brister har blivit nyheten."], ["Journalists are asking what you are keeping from Parliament.", "Journalister frågar vad ni håller undan för riksdagen."], { reopen: true }),
              io(["A quieter day", "En lugnare dag"], ["The committee moves on to other business and the pressure eases for a day. Some in the room say the storm has passed.", "Utskottet går vidare till andra frågor och trycket lättar för en dag. Några i rummet säger att stormen har passerat."], ["The political pressure eased for a day.", "Det politiska trycket lättade för en dag."])
            ])
          ]
        }),
        facilitator: fac(
          ["Pressure from above and outside. Integrity and boundaries.", "Tryck uppifrån och utifrån. Integritet och gränser."],
          ["Transparent on facts and impact, silent on attribution, honest about weaknesses.", "Öppna om fakta och konsekvenser, tysta om utpekande och ärliga om brister."],
          [["Ask: what will you be glad you said in a year?", "Fråga: vad kommer ni om ett år att vara glada att ni sa?"]]
        )
      },
      {
        id: "p8",
        priority: 4,
        clock: 10080,
        title: L(["The war exclusion", "Krigsundantaget"]),
        twist: L(["The insurer invokes the war exclusion: a state-linked attack may not be covered.", "Försäkringsbolaget åberopar krigsundantaget: ett statskopplat angrepp kanske inte omfattas."]),
        twistKind: "impact",
        reconsider: { decision: "d3", pressure: { en: "The insurer invokes the war exclusion. The rebuild you chose will now be paid from your own reserves. Would you still choose it?", sv: "Försäkringsbolaget åberopar krigsundantaget. Den återuppbyggnad ni valde ska nu betalas ur egna reserver. Skulle ni fortfarande välja den?" } },
        assumptionChallenged: L(["Our cyber insurance will cover the rebuild.", "Vår cyberförsäkring täcker ombyggnaden."]),
        narrative: L([
          "A week later. The rebuild is under way and the first budget estimate is on the table: it is large. Finance assumed the cyber insurance would cover most of it.\n\nThen a letter arrives from the insurer, written by its lawyers rather than its claims team.",
          "En vecka senare. Ombyggnaden pågår och den första budgetuppskattningen ligger på bordet: den är stor. Ekonomi utgick från att cyberförsäkringen skulle täcka det mesta.\n\nSedan kommer ett brev från försäkringsbolaget, skrivet av dess jurister snarare än skadeavdelningen."
        ]),
        injects: [
          inj("i8-1", 10080, "email", "insurer", "high", "confirmed", [
            "{{supplier.insurer}}: “Given the authorities' assessment, we reserve our position under the policy's exclusion for acts of war and state-sponsored operations. Coverage for the rebuild, estimated at {{num.rebuildCost|currency}}, is under review.”",
            "{{supplier.insurer}}: ”Med hänsyn till myndigheternas bedömning förbehåller vi oss rätten att åberopa försäkringens undantag för krigshandlingar och statsstödda operationer. Ersättning för ombyggnaden, beräknad till {{num.rebuildCost|currency}}, prövas.”"
          ], { tests: ["lo3"] })
        ],
        charts: [{
          id: "c8-kpi", type: "kpi",
          title: L(["Cost of the attack", "Angreppets kostnad"]),
          data: kpi([
            { id: "cost", label: ["Estimated rebuild cost", "Beräknad kostnad för ombyggnad"], value: (v) => v.rebuildCost, format: "currency", tone: "danger" },
            { id: "weeks", label: ["Weeks of manual operation", "Veckor med manuell drift"], value: (v) => v.weeks, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("What would a resilient architecture look like next time?", "Hur skulle en motståndskraftig arkitektur se ut nästa gång?", ["cio", "ciso"]),
            q("How do you keep backups and identity recoverable after a total wipe?", "Hur ser ni till att säkerhetskopior och identitet går att återställa efter en total radering?", ["itOps", "ciso"]),
            q("Would a different rebuild order have reduced the cost?", "Hade en annan ordning för ombyggnaden minskat kostnaden?", ["cio"], "d5")
          ],
          executive: [
            q("How do you fund the rebuild if insurance refuses?", "Hur finansierar ni ombyggnaden om försäkringen inte betalar?", ["ceo", "legal"]),
            q("Do you contest the exclusion — and on what basis?", "Bestrider ni undantaget – och på vilken grund?", ["legal"]),
            q("Did your public statements affect the insurer's position?", "Påverkade era offentliga uttalanden försäkringsbolagets hållning?", ["legal"], "d7")
          ]
        },
        challenges: [ch("The same attribution that brought national support may now cost you your insurance.", "Samma utpekande som gav nationellt stöd kan nu kosta er försäkringsskyddet.")],
        decision: dec("d8", "ceo", ["How do you respond to the insurer?", "Hur svarar ni försäkringsbolaget?"], [
          ["Contest the exclusion with legal advice while securing interim funding.", "Bestrid undantaget med juridiskt stöd och säkra samtidigt tillfällig finansiering."],
          ["Accept and fund the rebuild from reserves.", "Acceptera och finansiera ombyggnaden med egna reserver."],
          ["Seek state support as an essential-service operator.", "Sök statligt stöd som verksamhet med samhällsviktiga tjänster."]
        ], {
          knowns: [["The insurer reserves its position.", "Försäkringsbolaget förbehåller sig sin rätt."]],
          uncertainties: [["How a court would view the exclusion.", "Hur en domstol skulle se på undantaget."]],
          tradeoffs: {
            operational: ["The rebuild cannot wait for a legal dispute.", "Ombyggnaden kan inte vänta på en rättslig tvist."],
            security: ["Underfunding the rebuild repeats the weakness.", "En underfinansierad ombyggnad upprepar svagheten."],
            legal: ["War exclusions in cyber policies are contested.", "Krigsundantag i cyberförsäkringar är omstridda."],
            reputational: ["Owners and the public watch how this is handled.", "Ägare och allmänhet följer hur det här hanteras."]
          },
          evaluation: [["Secures recovery funding regardless of the dispute", "Säkrar finansieringen av återställningen oavsett tvisten"]],
          pushback: {
            A: [
              pb(["Arguing against the authorities", "Att argumentera mot myndigheterna"], ["To contest the exclusion, your lawyers may have to argue that the attack was not a state operation, against the assessment of the authorities you work alongside. Are you willing to make that argument in court?", "För att bestrida undantaget kan era jurister behöva hävda att angreppet inte var en statlig operation, mot bedömningen från de myndigheter ni samarbetar med. Är ni beredda att driva den linjen i domstol?"]),
              pb(["Years, not months", "År, inte månader"], ["Your lawyers estimate that a dispute like this could take years, with large legal fees whatever the outcome. The rebuild cannot wait for a verdict. How much are you willing to spend to maybe recover {{num.rebuildCost|currency}}?", "Era jurister bedömer att en sådan tvist kan ta år, med höga advokatkostnader oavsett utgång. Ombyggnaden kan inte vänta på en dom. Hur mycket är ni beredda att lägga för att kanske få tillbaka {{num.rebuildCost|currency}}?"]),
              pb(["The bank's conditions", "Bankens villkor"], ["The bank will lend the interim funding, but wants security and a say in major spending until the loan is repaid. Your rebuild decisions now need a lender's approval. Is that the price of fighting the insurer?", "Banken kan låna ut den tillfälliga finansieringen, men vill ha säkerhet och inflytande över större utgifter tills lånet är återbetalt. Era beslut om ombyggnaden kräver nu en långivares godkännande. Är det priset för att strida mot försäkringsbolaget?"])
            ],
            B: [
              pb(["What else does not happen?", "Vad blir inte av?"], ["The reserves were set aside for other investments, some of them planned resilience work. Paying the rebuild from them means those plans stop. The board asks which. What do you give up, and is any of it what would prevent the next attack?", "Reserverna var avsatta för andra investeringar, en del av dem planerat arbete med motståndskraft. Att betala ombyggnaden med dem gör att de planerna stannar. Styrelsen frågar vilka. Vad ger ni upp, och är något av det just det som skulle förhindra nästa angrepp?"]),
              pb(["Why did we pay premiums?", "Varför betalade vi premier?"], ["The owners ask why the organisation paid insurance premiums for years only to accept the first refusal without a fight. Accepting may also set a precedent for others in your sector. How do you explain giving up so quickly?", "Ägarna frågar varför organisationen betalade försäkringspremier i åratal för att sedan acceptera det första avslaget utan strid. Att acceptera kan också bli ett prejudikat för andra i er bransch. Hur förklarar ni att ni gav upp så fort?"]),
              pb(["Trimming the rebuild", "Att banta ombyggnaden"], ["To make the reserves stretch, finance proposes cutting the parts of the rebuild that are about resilience rather than getting services back. It would save a lot. Do you rebuild the same weaknesses to stay within your own money?", "För att reserverna ska räcka föreslår ekonomi att stryka de delar av ombyggnaden som handlar om motståndskraft snarare än om att få tillbaka tjänsterna. Det skulle spara mycket. Bygger ni upp samma svagheter igen för att hålla er inom de egna pengarna?"])
            ],
            C: [
              pb(["The insurer's own argument", "Försäkringsbolagets eget argument"], ["To get state support, you must argue that this was an attack on the state through your services. That is exactly the argument the insurer uses to refuse. Can you make it to one party and dispute it with the other?", "För att få statligt stöd måste ni hävda att detta var ett angrepp på staten via era tjänster. Det är precis det argument som försäkringsbolaget använder för att neka. Kan ni driva det mot den ena parten och bestrida det mot den andra?"]),
              pb(["Support with strings", "Stöd med villkor"], ["Officials say support may be possible, but with conditions: state oversight of the rebuild and requirements on how you run your security in future. Are you ready to give up that much control over your own organisation?", "Tjänstemännen säger att stöd kan vara möjligt, men med villkor: statlig insyn i ombyggnaden och krav på hur ni sköter er säkerhet framöver. Är ni beredda att lämna ifrån er så mycket kontroll över er egen organisation?"]),
              pb(["Months away", "Månader bort"], ["Nobody can say when a decision on state support would come; officials talk about months. The rebuild needs money this week. Who pays in the meantime, and what happens if the answer is no?", "Ingen kan säga när ett beslut om statligt stöd skulle komma; tjänstemännen talar om månader. Ombyggnaden behöver pengar den här veckan. Vem betalar under tiden, och vad händer om svaret blir nej?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Contesting the exclusion", "Att bestrida undantaget"], [
              io(["A bridging loan", "Ett överbryggningslån"], ["The bank agrees a bridging loan against the expected claim, and the rebuild continues without a pause.", "Banken går med på ett överbryggningslån mot det förväntade ersättningsanspråket, och ombyggnaden fortsätter utan uppehåll."], ["A bridging loan is funding the rebuild for now.", "Ett överbryggningslån finansierar ombyggnaden tills vidare."]),
              io(["The insurer digs in", "Försäkringsbolaget gräver ner sig"], ["The insurer's lawyers request every communication you have had with the authorities and every public statement, to support the exclusion. Your own words are now evidence.", "Försäkringsbolagets jurister begär all kommunikation ni har haft med myndigheterna och alla offentliga uttalanden, för att stödja undantaget. Era egna ord är nu bevisning."], ["The insurer has requested your communications with the authorities.", "Försäkringsbolaget har begärt er kommunikation med myndigheterna."], { reopen: true }),
              io(["Split advice", "Delade råd"], ["Two law firms give opposite views: one calls your case strong, the other says it could take years and still be lost.", "Två advokatbyråer ger motsatta besked: den ena kallar ert fall starkt, den andra säger att det kan ta flera år och ändå förloras."], ["Legal advice on the exclusion is split.", "De juridiska råden om undantaget går isär."])
            ]),
            ir("i2", { notChosen: "A" }, ["The exclusion stands unchallenged", "Undantaget står obestritt"], [
              io(["Resilience gets cut", "Motståndskraften stryks"], ["Without insurance money, the CFO says the rebuild can only be paid for by cutting the resilience investments planned for next year.", "Utan försäkringspengarna säger ekonomichefen att ombyggnaden bara kan betalas genom att stryka de investeringar i motståndskraft som planerats för nästa år."], ["Funding the rebuild means cutting planned resilience investments.", "Att finansiera ombyggnaden innebär att planerade investeringar i motståndskraft stryks."], { reopen: true }),
              io(["The owners ask why", "Ägarna frågar varför"], ["The owners ask why you did not contest an exclusion that many lawyers consider contestable.", "Ägarna frågar varför ni inte bestred ett undantag som många jurister anser går att bestrida."], ["The owners have asked why the exclusion was not contested.", "Ägarna har frågat varför undantaget inte bestreds."]),
              io(["A partial offer", "Ett delvis erbjudande"], ["The insurer offers a partial goodwill payment, on condition that you waive all further claims under the policy.", "Försäkringsbolaget erbjuder en delvis ersättning av goodwillskäl, på villkor att ni avstår från alla vidare anspråk enligt försäkringen."], ["The insurer has offered a partial payment if you waive further claims.", "Försäkringsbolaget har erbjudit en delvis ersättning om ni avstår från vidare anspråk."])
            ])
          ]
        }),
        facilitator: fac(
          ["Close on strategic risk: insurance is not a recovery plan.", "Avsluta med strategisk risk: en försäkring är ingen återställningsplan."],
          ["Interim funding secured, the exclusion contested and resilience investments planned.", "Tillfällig finansiering säkrad, undantaget bestritt och investeringar i motståndskraft planerade."],
          [["Ask: what did you assume insurance would do for you?", "Fråga: vad antog ni att försäkringen skulle göra för er?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Essential services return in stages over several weeks on a newly built, cleaner infrastructure. Funding and the insurance dispute continue, as does the authorities' investigation.",
        "De samhällsviktiga tjänsterna kommer tillbaka stegvis under flera veckor på en nybyggd och renare infrastruktur. Finansieringen och tvisten med försäkringsbolaget fortsätter, liksom myndigheternas utredning."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Not every ransom note means ransomware; check whether payment is even possible.", "Alla utpressningsmeddelanden betyder inte ransomware; kontrollera om betalning ens är möjlig."]),
        L(["Plan continuity for weeks without IT, not days.", "Planera kontinuitet för veckor utan IT, inte dagar."]),
        L(["Identity and backup management must survive a total wipe.", "Identitet och backupförvaltning måste klara en total radering."]),
        L(["Work with authorities early and respect their boundaries.", "Samarbeta tidigt med myndigheterna och respektera deras gränser."])
      ],
      assumptionsVsReality: [
        avr(["Criminals want money.", "Kriminella vill ha pengar."], ["Nobody could be paid.", "Det fanns ingen att betala."], "p2"),
        avr(["Data is encrypted.", "Datan är krypterad."], ["Data was destroyed.", "Datan förstördes."], "p3"),
        avr(["Identity survived.", "Identitetsmiljön klarade sig."], ["Identity and backup consoles were wiped.", "Identitetsmiljön och backupkonsolerna raderades."], "p5"),
        avr(["Insurance will pay.", "Försäkringen betalar."], ["A war exclusion was invoked.", "Ett krigsundantag åberopades."], "p8")
      ],
      strengthsToLookFor: [
        L(["Fast network disconnection", "Snabb frånkoppling av nätverken"]),
        L(["Early escalation to national bodies", "Tidig eskalering till nationella myndigheter"]),
        L(["A clean-room rebuild", "En ren ombyggnad"])
      ],
      commonGaps: [
        L(["Planning around a decryption key", "Att planera utifrån en dekrypteringsnyckel"]),
        L(["Continuity plans that assume days, not weeks", "Kontinuitetsplaner som räknar med dagar, inte veckor"]),
        L(["Restoring into a compromised environment", "Att läsa tillbaka till en komprometterad miljö"])
      ],
      suggestedActions: [
        act(["Keep offline, immutable backups and a recovery path for identity that does not depend on the production directory.", "Ha frånkopplade, oföränderliga säkerhetskopior och en återställningsväg för identitet som inte är beroende av produktionskatalogen."], "cio", "high"),
        act(["Extend continuity plans to several weeks without IT, with tested paper procedures.", "Utöka kontinuitetsplanerna till flera veckor utan IT, med testade pappersrutiner."], "serviceOwner", "high"),
        act(["Remove management interfaces from the internet.", "Ta bort förvaltningsgränssnitt från internet."], "itOps", "high"),
        act(["Review insurance exclusions and plan funding for a total rebuild.", "Granska försäkringens undantag och planera finansieringen av en total ombyggnad."], "legal", "medium"),
        act(["Agree contacts and information-sharing terms with national authorities in advance.", "Kom i förväg överens med nationella myndigheter om kontaktvägar och villkor för informationsdelning."], "securityOfficer", "medium")
      ]
    }
  });
})();
