/*
 * s16-three-fires.js — "Three Fires at Once" (archetype E, multi-incident).
 *
 * Compound crisis: a phishing campaign, a critical service outage and suspicious
 * privileged access all land within one hour → the outage is a failed change,
 * unrelated → the phishing and the privileged access are the same attack →
 * two leaders give contradictory orders → the privileged account reached the
 * backup console → response actions collide → the lure exploited the outage →
 * responders run out of energy.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s16-three-fires",
    version: 1,
    category: "multi-incident",
    archetype: "compound-crisis",
    emblem: "three-fires",
    title: L(["Three Fires at Once", "Tre bränder samtidigt"]),
    summary: L([
      "Within one hour: a phishing wave, a critical service down and an administrator account doing strange things. You have four responders. Two of the fires are connected.",
      "Inom en timme: en våg av nätfiske, en kritisk tjänst som ligger nere och ett administratörskonto som gör konstiga saker. Ni har fyra personer som kan hantera det. Två av bränderna hänger ihop."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Prioritise several incidents with too few people", "Prioritera flera incidenter med för få personer"]), teaser: L(["Too much, too few", "För mycket, för få"]) },
      { id: "lo2", text: L(["Establish clear incident command", "Etablera en tydlig incidentledning"]), teaser: L(["Who is in charge", "Vem som leder"]) },
      { id: "lo3", text: L(["Separate connected incidents from coincidences", "Skilja sammanhängande incidenter från sammanträffanden"]), teaser: L(["Seeing patterns, and seeing too many", "Att se mönster – och att se för många"]) },
      { id: "lo4", text: L(["Coordinate response actions so they don't collide", "Samordna åtgärder så att de inte krockar"]), teaser: L(["Keeping efforts from colliding", "Att hindra insatser från att krocka"]) }
    ],
    mitre: ["T1566.002", "T1078", "T1098", "T1136", "T1021", "T1490"],
    frameworks: {
      nistCsf: ["GV.RR", "ID.RA", "DE.AE", "RS.MA", "RS.AN", "RS.CO", "RS.MI", "RC.RP"],
      iso27001: ["A.5.24", "A.5.25", "A.5.26", "A.5.29", "A.6.3", "A.8.2", "A.8.32"]
    },
    minStages: 4,
    maxStages: 8,
    constraints: { startWindow: "business-hours" },
    actor: { types: ["criminal"], motivation: L(["Financial: privileged access for later extortion", "Ekonomisk: privilegierad åtkomst för senare utpressning"]), capability: "medium" },
    variables: {
      phishSent: { min: 200, max: 6000, scaleBy: "size" },
      clickers: { min: 4, max: 90, scaleBy: "size" },
      customersAffected: { min: 500, max: 120000, scaleBy: "size" },
      responders: { min: 3, max: 6 },
      hoursAwake: { min: 16, max: 22 }
    },
    roles: ["incidentCommander", "socLead", "itOps", "serviceOwner", "ciso", "cio", "comms", "hr", "dutyOfficer", "networkLead"],

    groundTruth: {
      rootCause: L([
        "Three things happened at once. A failed database change took {{org.service.customer|lcfirst}} down — a coincidence. A criminal group saw the outage on the public status page and sent a phishing wave themed around it. One of the people who entered credentials was a service-desk administrator, and the group used that account within minutes.",
        "Tre saker hände samtidigt. En misslyckad databasändring slog ut {{org.service.customer|lcfirst}} – ett sammanträffande. En kriminell grupp såg avbrottet på den offentliga driftstatussidan och skickade en våg av nätfiske med avbrottet som tema. En av dem som angav sina inloggningsuppgifter var en administratör på servicedesken, och gruppen använde det kontot inom några minuter."
      ]),
      attackerTimeline: [
        { at: -25, text: L(["Database change fails; customer service goes down.", "Databasändringen misslyckas; kundtjänsten går ned."]) },
        { at: -12, text: L(["Group reads the status page.", "Gruppen läser driftstatussidan."]) },
        { at: -5, text: L(["Phishing wave themed on the outage.", "Våg av nätfiske med avbrottet som tema."]) },
        { at: 25, text: L(["Service-desk administrator enters credentials.", "En administratör på servicedesken anger sina inloggningsuppgifter."]) },
        { at: 35, text: L(["Privileged account used from outside.", "Det privilegierade kontot används utifrån."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-change", revealStage: "p2", text: L(["The outage was caused by a failed database change.", "Avbrottet orsakades av en misslyckad databasändring."]) },
      { id: "hf-link", revealStage: "p3", text: L(["The privileged account belongs to someone who entered credentials on the phishing page.", "Det privilegierade kontot tillhör någon som angav sina inloggningsuppgifter på nätfiskesidan."]) },
      { id: "hf-backup", revealStage: "p5", text: L(["The privileged account opened the backup console.", "Det privilegierade kontot öppnade administrationen för säkerhetskopiorna."]) },
      { id: "hf-lure", revealStage: "p7", text: L(["The phishing lure was written around your own outage.", "Nätfiskemeddelandet var skrivet kring ert eget avbrott."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Everything at once", "Allt på en gång"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. At {{org.name}}, the duty officer's phone has not stopped for an hour. Three things are happening at once: a customer service is down, a phishing email has reached hundreds of staff, and an administrator account is doing strange things.\n\nYou have {{num.responders}} people available to respond. Each fire looks urgent, and each has someone in the room arguing that it should come first.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. Hos {{org.name}} har jourhavandes telefon inte slutat ringa på en timme. Tre saker pågår samtidigt: en kundtjänst ligger nere, ett nätfiskemejl har nått hundratals anställda och ett administratörskonto gör konstiga saker.\n\nNi har {{num.responders}} personer tillgängliga. Varje brand ser brådskande ut, och för varje brand finns någon i rummet som hävdar att den ska komma först."
        ]),
        injects: [
          inj("i1-1", 0, "statusPage", "itOps", "high", "confirmed", [
            "{{org.service.customer}} is down for about {{num.customersAffected}} customers since {{time.T-20|clock}}. Cause unknown.",
            "{{org.service.customer}} ligger nere för ungefär {{num.customersAffected}} kunder sedan klockan {{time.T-20|clock}}. Orsaken är okänd."
          ], { headline: ["Fire 1: customer service down", "Brand 1: kundtjänsten nere"], tests: ["lo1"] }),
          inj("i1-2", 10, "phishingEmail", "serviceDesk", "high", "confirmed", [
            "Staff report an email sent to {{num.phishSent}} people: “Service disruption — re-verify your account here.” At least {{num.clickers}} have clicked.",
            "Personal rapporterar ett e-postmeddelande som skickats till {{num.phishSent}} personer: ”Driftstörning – verifiera ditt konto här.” Minst {{num.clickers}} har klickat."
          ], { headline: ["Fire 2: phishing wave", "Brand 2: våg av nätfiske"], tests: ["lo1"] }),
          inj("i1-3", 40, "authLog", "siem", "high", "unverified", [
            "{{asset.adminAccount}} signed in from {{asset.attackerIp}} and listed all administrator groups. Could be someone working from home.",
            "{{asset.adminAccount}} loggade in från {{asset.attackerIp}} och listade alla administratörsgrupper. Kan vara någon som arbetar hemifrån."
          ], { headline: ["Fire 3: odd privileged access", "Brand 3: konstig privilegierad åtkomst"], statedReliability: ["Unconfirmed", "Obekräftat"], tests: ["lo1", "lo3"] })
        ],
        charts: [{
          id: "c1-kpi", type: "kpi",
          title: L(["Three fires, one team", "Tre bränder, ett team"]),
          data: kpi([
            { id: "cust", label: ["Customers without service", "Kunder utan tjänst"], value: (v) => v.customersAffected, tone: "danger" },
            { id: "clicks", label: ["Staff who clicked", "Anställda som klickade"], value: (v) => v.clickers, tone: "warn" },
            { id: "people", label: ["Responders available", "Tillgängliga personer för hanteringen"], value: (v) => v.responders, tone: "info" }
          ])
        }],
        questions: {
          technical: [
            q("Which fire could get worst fastest?", "Vilken brand kan bli värst snabbast?", ["socLead", "itOps"]),
            q("What one quick action limits each fire?", "Vilken snabb åtgärd begränsar varje brand?", ["socLead", "itOps"]),
            q("Could any of these be related?", "Kan någon av dem hänga ihop?", ["socLead"])
          ],
          executive: [
            q("Who is in charge of all three?", "Vem leder alla tre?", ["incidentCommander", "cio"]),
            q("Who can you call in to help?", "Vem kan ni kalla in som förstärkning?", ["dutyOfficer", "cio"]),
            q("Which fire do customers see, and does that decide your priority?", "Vilken brand ser kunderna, och avgör det er prioritering?", ["serviceOwner", "comms"])
          ]
        },
        challenges: [ch("Everyone wants the customer outage fixed first because it's the most visible.", "Alla vill att kundavbrottet ska lösas först eftersom det syns mest.")],
        decision: dec("d1", "incidentCommander", ["How do you deploy your {{num.responders}} people?", "Hur fördelar ni era {{num.responders}} personer?"], [
          ["Name one commander, put one person on each fire, and take the privileged account seriously until cleared.", "Utse en ledare, sätt en person på varje brand och ta det privilegierade kontot på allvar tills det är utrett."],
          ["Everyone on the customer outage first.", "Alla på kundavbrottet först."],
          ["Each team handles its own fire.", "Varje team hanterar sin egen brand."]
        ], {
          knowns: [["Three problems in one hour.", "Tre problem på en timme."], ["Only {{num.responders}} responders.", "Bara {{num.responders}} personer för hanteringen."]],
          uncertainties: [["Whether they are related.", "Om de hänger ihop."]],
          tradeoffs: {
            operational: ["The outage is the most visible to customers.", "Avbrottet är det som syns mest för kunderna."],
            security: ["Privileged access can do the most damage quietly.", "Privilegierad åtkomst kan göra störst skada i tysthet."],
            legal: ["Customer SLAs may be at stake.", "Kundernas servicenivåavtal kan stå på spel."],
            reputational: ["Visible fires get attention; quiet ones get worse.", "Synliga bränder får uppmärksamhet; tysta blir värre."]
          },
          evaluation: [["Names a single commander", "Utser en enda ledare"], ["Does not let visibility decide priority", "Låter inte synligheten avgöra prioriteringen"]],
          minutes: 10,
          pushback: {
            A: [
              pb(["One engineer for the outage", "En tekniker för avbrottet"], ["The service owner objects: {{num.customersAffected}} customers are without service and you have put one person on it. The customer phone lines are already full. Do you move a second person over, and which fire loses them?", "Tjänsteägaren protesterar: {{num.customersAffected}} kunder är utan tjänst och ni har satt en person på det. Kundtelefonerna är redan fulla. Flyttar ni över en person till, och vilken brand förlorar hen?"]),
              pb(["Locking out a colleague", "Att låsa ute en kollega"], ["Taking the account seriously means treating a colleague as a suspect. Their manager says they often work from home and asks you not to lock them out over a hunch. Do you act on the account before you can reach its owner?", "Att ta kontot på allvar innebär att behandla en kollega som misstänkt. Chefen säger att personen ofta arbetar hemifrån och ber er att inte låsa ute hen på en känsla. Agerar ni mot kontot innan ni har nått ägaren?"]),
              pb(["A commander with hands full", "En ledare med fulla händer"], ["With {{num.responders}} people, three fires and a commander, the commander is also doing hands-on work. Twice in ten minutes nobody answers the bridge because the commander is head-down in a console. Who coordinates when the coordinator is busy?", "Med {{num.responders}} personer, tre bränder och en ledare måste ledaren också arbeta praktiskt. Två gånger på tio minuter svarar ingen i samtalet eftersom ledaren sitter fast i en konsol. Vem samordnar när samordnaren är upptagen?"])
            ],
            B: [
              pb(["The clicks keep coming", "Klicken fortsätter"], ["While everyone works on the outage, reports of the phishing email keep arriving and the number of clickers grows. Nobody is resetting anything or warning staff. How many more clicks are you willing to accept?", "Medan alla arbetar med avbrottet fortsätter anmälningarna om nätfiskemejlet att komma, och antalet som klickat växer. Ingen återställer något eller varnar personalen. Hur många fler klick är ni beredda att acceptera?"]),
              pb(["The account is still busy", "Kontot är fortfarande aktivt"], ["The SIEM flags {{asset.adminAccount}} again: it is now reading settings on several servers. Nobody is watching it, because everyone is on the database. Do you pull someone off the outage, admitting the split was wrong?", "SIEM larmar om {{asset.adminAccount}} igen: kontot läser nu inställningar på flera servrar. Ingen bevakar det, eftersom alla sitter med databasen. Tar ni någon från avbrottet och erkänner att fördelningen var fel?"]),
              pb(["Too many on one database", "För många på en databas"], ["The operations engineer says {{num.responders}} people on one database are getting in each other's way, and two would be enough. The rest are waiting for instructions. What are they for, if not the other two fires?", "Driftteknikern säger att {{num.responders}} personer på en databas står i vägen för varandra, och att två skulle räcka. Resten väntar på instruktioner. Vad ska de göra, om inte de andra två bränderna?"])
            ],
            C: [
              pb(["Nobody sees the whole", "Ingen ser helheten"], ["Three teams now report to three different managers, and nobody is collecting the picture. The SOC analyst asks who would notice if two of the fires had something in common. Who would?", "Tre team rapporterar nu till tre olika chefer, och ingen samlar ihop bilden. SOC-analytikern frågar vem som skulle märka om två av bränderna hade något gemensamt. Vem skulle göra det?"]),
              pb(["One expert, two teams", "En expert, två team"], ["Your network lead is needed by the outage team and the security team at the same moment. Both teams claim priority, and there is no one above them to decide. Who settles it, and how long does it take?", "Er nätverksansvarige behövs av avbrottsteamet och säkerhetsteamet i samma ögonblick. Båda teamen kräver förtur, och det finns ingen över dem som kan avgöra. Vem löser det, och hur lång tid tar det?"]),
              pb(["Whose fire is it?", "Vems brand är det?"], ["The SOC thinks the odd admin activity is an IT matter, since it may be someone working from home. IT thinks it is a SOC matter. Nobody has called the account owner. Whose fire is it, and who decides that?", "SOC tycker att den konstiga administratörsaktiviteten är en IT-fråga, eftersom det kan vara någon som arbetar hemifrån. IT tycker att det är en SOC-fråga. Ingen har ringt kontots ägare. Vems brand är det, och vem avgör det?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["One on each fire", "En på varje brand"], [
              io(["One picture", "En samlad bild"], ["Within fifteen minutes the commander has a short update from each fire, and for the first time someone holds all three at once.", "Inom en kvart har ledaren en kort lägesbild från varje brand, och för första gången har någon alla tre samtidigt framför sig."], ["One commander holds the picture of all three fires.", "En ledare har bilden av alla tre bränderna."]),
              io(["The outage starves", "Avbrottet svälter"], ["The single engineer on the outage is still searching for a cause, and the customer phone queue is overflowing. The service owner says customers are being sacrificed.", "Den enda teknikern på avbrottet letar fortfarande efter orsaken, och kundtelefonkön svämmar över. Tjänsteägaren säger att kunderna offras."], ["The customer outage has one engineer, and the phone queue is overflowing.", "Kundavbrottet har en tekniker, och telefonkön svämmar över."], { reopen: true, meters: { trust: -1 } }),
              io(["Owner out of reach", "Ägaren går inte att nå"], ["The person assigned to the admin account calls its owner twice and gets voicemail. The activity could still be them working from home.", "Personen som fått administratörskontot ringer ägaren två gånger och hamnar i röstbrevlådan. Aktiviteten kan fortfarande vara hen som arbetar hemifrån."], ["The admin account's owner could not be reached in the first hour.", "Administratörskontots ägare gick inte att nå under den första timmen."])
            ]),
            ir("i2", { notChosen: "A" }, ["Nobody on the account", "Ingen på kontot"], [
              io(["It goes quiet", "Det blir tyst"], ["The SIEM shows no further activity from {{asset.adminAccount}} for twenty minutes. Perhaps it really was someone working from home.", "SIEM visar ingen mer aktivitet från {{asset.adminAccount}} på tjugo minuter. Kanske var det verkligen någon som arbetade hemifrån."], ["The admin account showed no activity for twenty minutes.", "Administratörskontot visade ingen aktivitet på tjugo minuter."]),
              io(["Busy again", "Aktivt igen"], ["The SIEM flags {{asset.adminAccount}} again: it is now reading settings on several servers. Nobody is watching it.", "SIEM larmar om {{asset.adminAccount}} igen: kontot läser nu inställningar på flera servrar. Ingen bevakar det."], ["The admin account is reading settings on several servers, unwatched.", "Administratörskontot läser inställningar på flera servrar, utan bevakning."], { reopen: true }),
              io(["Not my alert", "Inte mitt larm"], ["The SOC thinks the admin alert belongs to IT; IT thinks it belongs to the SOC. Both have seen it, and neither has acted.", "SOC tycker att administratörslarmet hör till IT; IT tycker att det hör till SOC. Båda har sett det, och ingen har agerat."], ["Nobody has formally taken ownership of the admin account alert.", "Ingen har formellt tagit ansvar för larmet om administratörskontot."])
            ])
          ]
        }),
        facilitator: fac(
          ["Overload is the point. Watch who takes command and who drifts to the loudest fire.", "Överbelastningen är poängen. Se vem som tar ledningen och vem som dras mot den högljuddaste branden."],
          ["One commander and a deliberate split that covers the privileged access.", "En ledare och en medveten fördelning som täcker den privilegierade åtkomsten."],
          [["Ask: which of the three could you still be dealing with in a month?", "Fråga: vilken av de tre kan ni fortfarande hålla på med om en månad?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["Just a bad change", "Bara en dålig ändring"]),
        twist: L(["The outage is a failed database change. It is unrelated to the other two.", "Avbrottet är en misslyckad databasändring. Det har inget med de andra två att göra."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because one person went to each fire, the customer outage has a single engineer, and the rollback is moving slowly.", sv: "Eftersom en person gick till varje brand har kundavbrottet en enda tekniker, och återställningen går långsamt." } }
        ],
        assumptionChallenged: L(["Three incidents at once must be one attack.", "Tre incidenter samtidigt måste vara ett och samma angrepp."]),
        reveals: ["hf-change"],
        narrative: L([
          "{{time.T+60|clock}}. The operations engineer working on the outage reports back with a clear explanation.\n\nFor a moment the room relaxes: one fire has a simple cause and a known fix. But the SOC analyst is not convinced that three problems in one hour can be a coincidence.",
          "Klockan {{time.T+60|clock}}. Driftteknikern som arbetar med avbrottet återkommer med en tydlig förklaring.\n\nEtt ögonblick slappnar rummet av: en av bränderna har en enkel orsak och en känd lösning. Men SOC-analytikern är inte övertygad om att tre problem på en timme kan vara en slump."
        ]),
        injects: [
          inj("i2-1", 60, "logExcerpt", "itOps", "medium", "confirmed", [
            "A schema change to the customer database at {{time.T-25|clock}} locked a core table. Rolling back takes about two hours. No sign of anything malicious.",
            "En schemaändring i kunddatabasen klockan {{time.T-25|clock}} låste en central tabell. Att rulla tillbaka tar ungefär två timmar. Inga tecken på något skadligt."
          ], { headline: ["Outage: failed change", "Avbrott: misslyckad ändring"], reveals: ["hf-change"], tests: ["lo3"] }),
          inj("i2-2", 75, "chat", "soc", "medium", "disputed", [
            "The SOC analyst: “I don't buy it. Three things in one hour is not a coincidence.”",
            "SOC-analytikern: ”Det köper jag inte. Tre saker på en timme är inget sammanträffande.”"
          ], { facilitatorNote: ["Half right: two are linked, one isn't. Watch whether the group can hold both ideas.", "Halvt rätt: två hänger ihop, en gör det inte. Se om gruppen kan hålla båda tankarna samtidigt."], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How confident are you that the change is the whole story?", "Hur säkra är ni på att ändringen är hela förklaringen?", ["itOps"]),
            q("Can the rollback be done by one person?", "Kan tillbakarullningen göras av en person?", ["itOps"]),
            q("Did your split leave anyone on the privileged account?", "Lämnade er fördelning någon på det privilegierade kontot?", ["socLead"], "d1")
          ],
          executive: [
            q("Can you now move people from the outage to the other fires?", "Kan ni nu flytta personer från avbrottet till de andra bränderna?", ["incidentCommander"]),
            q("What do you tell customers about the outage?", "Vad säger ni till kunderna om avbrottet?", ["comms", "serviceOwner"]),
            q("Would you still split your people the same way?", "Skulle ni fortfarande fördela personerna på samma sätt?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The SOC and operations disagree openly in the bridge call.", "SOC och drift är öppet oense i samtalet.")],
        decision: dec("d2", "incidentCommander", ["How do you rebalance?", "Hur omfördelar ni?"], [
          ["Leave one person on the rollback and move the rest to the phishing and privileged access.", "Låt en person stanna på tillbakarullningen och flytta resten till nätfisket och den privilegierade åtkomsten."],
          ["Keep the current split until each fire is closed.", "Behåll nuvarande fördelning tills varje brand är släckt."],
          ["Finish the outage first, then turn to the others.", "Gör klart avbrottet först och vänd er sedan till de andra."]
        ], {
          knowns: [["The outage is a failed change.", "Avbrottet är en misslyckad ändring."]],
          uncertainties: [["Whether phishing and privileged access are linked.", "Om nätfisket och den privilegierade åtkomsten hänger ihop."]],
          tradeoffs: {
            operational: ["Fewer people on the rollback slows recovery.", "Färre personer på tillbakarullningen gör återställningen långsammare."],
            security: ["The security fires are the ones that grow.", "Det är säkerhetsbränderna som växer."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["Customers see the outage, not the rest.", "Kunderna ser avbrottet, inte resten."]
          },
          evaluation: [["Moves capacity to where risk is growing", "Flyttar kapacitet dit risken växer"]],
          pushback: {
            A: [
              pb(["Rolling back alone", "Att rulla tillbaka ensam"], ["The engineer on the rollback says two hours of changes to a core table with nobody checking each step is how mistakes happen. They ask for a second pair of eyes. Do you give them one, and from which fire?", "Teknikern på tillbakarullningen säger att två timmars ändringar i en central tabell utan att någon kontrollerar varje steg är hur misstag uppstår. Hen ber om ett extra par ögon. Får hen det, och från vilken brand?"]),
              pb(["Fewer on what customers see", "Färre på det kunderna ser"], ["The service owner asks why fewer people are on the outage now than an hour ago, when {{num.customersAffected}} customers are still without service. Customer support wants a line to give callers. How do you explain moving people away from the problem customers can see?", "Tjänsteägaren frågar varför färre personer arbetar med avbrottet nu än för en timme sedan, när {{num.customersAffected}} kunder fortfarande är utan tjänst. Kundtjänst vill ha något att säga till dem som ringer. Hur förklarar ni att ni flyttar folk från det problem kunderna ser?"]),
              pb(["Sure it's just a change?", "Säkra på att det bara är en ändring?"], ["You accepted the explanation for the outage within the hour. The SOC analyst asks whether anyone has checked who made the change and from which account. Are you sure enough to bet your staffing on it?", "Ni godtog förklaringen till avbrottet inom en timme. SOC-analytikern frågar om någon har kontrollerat vem som gjorde ändringen och från vilket konto. Är ni tillräckligt säkra för att satsa er bemanning på det?"])
            ],
            B: [
              pb(["A plan made blind", "En plan gjord i blindo"], ["The SOC analyst points out that the split was made when all three fires looked equal. One now has a known cause and a known fix. Why keep a plan built on information you no longer have?", "SOC-analytikern påpekar att fördelningen gjordes när alla tre bränderna såg lika ut. En av dem har nu en känd orsak och en känd lösning. Varför behålla en plan byggd på information ni inte längre har?"]),
              pb(["Watching a progress bar", "Att titta på en förloppsindikator"], ["The rollback is a job that runs by itself for two hours. The people assigned to the outage are mostly watching it. Is that really the best use of them while the other two fires are unexplained?", "Tillbakarullningen är ett jobb som går av sig självt i två timmar. De som är satta på avbrottet tittar mest på det. Är det verkligen den bästa användningen av dem medan de andra två bränderna är oförklarade?"]),
              pb(["The phishing desk is swamped", "Nätfiskebordet drunknar"], ["The one person on the phishing wave cannot keep up: staff reports arrive faster than they can be read, and more people have clicked. They ask for help. Do you hold the split until each fire is closed, or give it to them?", "Den enda personen på nätfiskevågen hinner inte med: anmälningarna från personalen kommer snabbare än de kan läsas, och fler har klickat. Hen ber om hjälp. Håller ni fast vid fördelningen tills varje brand är släckt, eller ger ni hen den?"])
            ],
            C: [
              pb(["Two hours unwatched", "Två timmar utan bevakning"], ["The rollback takes about two hours. For all of that time nobody watches the phishing wave or {{asset.adminAccount}}. What could happen in those two hours, and are you ready to own it?", "Tillbakarullningen tar ungefär två timmar. Under hela den tiden bevakar ingen nätfiskevågen eller {{asset.adminAccount}}. Vad kan hända under de två timmarna, och är ni beredda att ta ansvar för det?"]),
              pb(["The analyst won't move", "Analytikern vägrar flytta sig"], ["The SOC analyst refuses to leave the admin account: “I don't buy the coincidence.” Ordering them onto the outage means overruling the one person who sees a pattern. Do you?", "SOC-analytikern vägrar lämna administratörskontot: ”Jag köper inte sammanträffandet.” Att beordra hen till avbrottet innebär att köra över den enda person som ser ett mönster. Gör ni det?"]),
              pb(["More hands, same speed", "Fler händer, samma fart"], ["Operations confirms the rollback cannot go faster with more people; it is one job that has to run its course. Everyone you assigned to it will be waiting. What are they doing for two hours?", "Driften bekräftar att tillbakarullningen inte går fortare med fler personer; det är ett jobb som måste gå klart. Alla ni satte på det kommer att vänta. Vad gör de i två timmar?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Hands moved to security", "Händer flyttade till säkerheten"], [
              io(["The clicker list", "Listan över klickare"], ["With extra hands, the SOC builds a complete list of everyone who clicked the phishing link and when. It is the first solid ground in the security fires.", "Med fler händer tar SOC fram en fullständig lista över alla som klickade på nätfiskelänken och när. Det är den första fasta marken i säkerhetsbränderna."], ["The SOC has a full list of staff who clicked, with times.", "SOC har en fullständig lista över alla som klickade, med tidpunkter."]),
              io(["The rollback restarts", "Tillbakarullningen börjar om"], ["Working alone, the engineer on the rollback skips a step and has to start again. The outage gets about an hour longer.", "Teknikern på tillbakarullningen arbetar ensam, hoppar över ett steg och måste börja om. Avbrottet blir ungefär en timme längre."], ["The rollback had to restart, adding about an hour to the outage.", "Tillbakarullningen fick börja om, vilket förlänger avbrottet med ungefär en timme."], { reopen: true, meters: { trust: -1 } }),
              io(["Over your head", "Över ert huvud"], ["The service owner, unhappy that the outage now has one person, has gone straight to the CIO. Nobody knows yet what the CIO will do with it.", "Tjänsteägaren, missnöjd med att avbrottet nu har en person, har gått direkt till IT-chefen. Ingen vet ännu vad IT-chefen tänker göra med det."], ["The service owner has complained to the CIO about the staffing.", "Tjänsteägaren har klagat hos IT-chefen på bemanningen."])
            ]),
            ir("i2", { notChosen: "A" }, ["The outage keeps its people", "Avbrottet behåller sitt folk"], [
              io(["Ahead of schedule", "Före tidsplanen"], ["With several people checking each step, the rollback runs smoothly and ahead of schedule. Customer support finally has good news to give.", "Med flera personer som kontrollerar varje steg går tillbakarullningen smidigt och före tidsplanen. Kundtjänst har äntligen goda nyheter att ge."], ["The rollback was ahead of schedule in its first hour.", "Tillbakarullningen låg före tidsplanen under sin första timme."]),
              io(["More clicks", "Fler klick"], ["Reports of the phishing email keep arriving faster than they can be read, and the number of clickers has grown. The one person on it asks for help.", "Anmälningarna om nätfiskemejlet kommer snabbare än de hinner läsas, och antalet som klickat har ökat. Den enda personen på det ber om hjälp."], ["More staff have clicked, and the phishing desk is falling behind.", "Fler anställda har klickat, och nätfiskebordet hinner inte med."], { reopen: true }),
              io(["The analyst alone", "Analytikern ensam"], ["The SOC analyst is working the admin account alone and says they may have “something”, but need another hour to be sure.", "SOC-analytikern arbetar ensam med administratörskontot och säger att hen kanske har ”något”, men behöver en timme till för att vara säker."], ["The SOC analyst is working the admin account alone.", "SOC-analytikern arbetar ensam med administratörskontot."])
            ])
          ]
        }),
        facilitator: fac(
          ["A coincidence, confirmed. The skill is letting go of the visible fire.", "Ett sammanträffande, bekräftat. Konsten är att släppa den synliga branden."],
          ["Minimal staffing on the rollback and the rest on the security fires.", "Minimal bemanning på tillbakarullningen och resten på säkerhetsbränderna."],
          [["Ask: what is the outage costing compared to the other two?", "Fråga: vad kostar avbrottet jämfört med de andra två?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 120,
        title: L(["Two fires, one attacker", "Två bränder, en angripare"]),
        twist: L(["The privileged account belongs to a service-desk administrator who entered their password on the phishing page.", "Det privilegierade kontot tillhör en administratör på servicedesken som angav sitt lösenord på nätfiskesidan."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "The privileged account and the phishing were one attack. If you moved people off the outage, customers are still down. If you kept the split, the attacker had the time.", sv: "Det privilegierade kontot och nätfisket var ett och samma angrepp. Om ni flyttade folk från avbrottet är kunderna fortfarande drabbade. Om ni behöll fördelningen fick angriparen tiden." } },
        assumptionChallenged: L(["The phishing is a nuisance; the privileged access is separate.", "Nätfisket är ett irritationsmoment; den privilegierade åtkomsten är något annat."]),
        reveals: ["hf-link"],
        narrative: L([
          "{{time.T+120|clock}}. The SOC puts two lists side by side: the staff who clicked the phishing link, and the privileged sign-ins of the last two hours.\n\nUntil now the phishing wave and the strange admin activity have been handled as separate problems, by different people. The two lists share a name.",
          "Klockan {{time.T+120|clock}}. SOC lägger två listor bredvid varandra: de anställda som klickade på nätfiskelänken, och de privilegierade inloggningarna under de senaste två timmarna.\n\nHittills har nätfiskevågen och den konstiga administratörsaktiviteten hanterats som separata problem, av olika personer. De två listorna har ett namn gemensamt."
        ]),
        injects: [
          inj("i3-1", 120, "forensicFinding", "soc", "critical", "confirmed", [
            "The owner of {{asset.adminAccount}} entered credentials on the phishing page at {{time.T+25|clock}}. Ten minutes later the account signed in from {{asset.attackerIp}} and added a new member to an administrator group.",
            "Ägaren till {{asset.adminAccount}} angav sina inloggningsuppgifter på nätfiskesidan klockan {{time.T+25|clock}}. Tio minuter senare loggade kontot in från {{asset.attackerIp}} och lade till en ny medlem i en administratörsgrupp."
          ], { headline: ["Phishing and privileged access are linked", "Nätfisket och den privilegierade åtkomsten hänger ihop"], reveals: ["hf-link"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How do you contain the account and the new admin it created?", "Hur begränsar ni kontot och den nya administratören det skapade?", ["socLead", "itOps"]),
            q("Which other clickers have privileged roles?", "Vilka andra som klickade har privilegierade roller?", ["socLead"]),
            q("Did moving people off the outage pay off?", "Lönade det sig att flytta personer från avbrottet?", ["socLead"], "d2")
          ],
          executive: [
            q("Is this now the main incident?", "Är det här nu huvudincidenten?", ["incidentCommander", "ciso"]),
            q("Do you need outside help?", "Behöver ni extern hjälp?", ["ciso", "cio"]),
            q("Did the first split of people delay this finding?", "Försenade den första fördelningen av personer det här fyndet?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The administrator is on the bridge call and very upset.", "Administratören är med i samtalet och mycket upprörd.")],
        decision: dec("d3", "ciso", ["How do you contain the linked attack?", "Hur begränsar ni det sammanhängande angreppet?"], [
          ["Disable both admin accounts, revoke sessions for all clickers and call in your incident-response partner.", "Spärra båda administratörskontona, återkalla sessionerna för alla som klickade och kalla in er incidentpartner."],
          ["Reset the administrator's password and watch for more.", "Byt administratörens lösenord och håll utkik efter mer."],
          ["Reset all clickers' passwords tonight.", "Byt lösenord för alla som klickade i kväll."]
        ], {
          knowns: [["A phished admin account created another admin.", "Ett nätfiskat administratörskonto skapade en annan administratör."]],
          uncertainties: [["What else the attacker did.", "Vad mer angriparen gjorde."]],
          tradeoffs: {
            operational: ["Disabling accounts may block service-desk work.", "Att spärra konton kan blockera servicedeskens arbete."],
            security: ["A new admin means persistence.", "En ny administratör innebär fäste."],
            legal: ["No change yet.", "Ingen förändring ännu."],
            reputational: ["Waiting risks a far bigger incident.", "Att vänta riskerar en mycket större incident."]
          },
          evaluation: [["Removes persistence, not just the first account", "Tar bort fästet, inte bara det första kontot"]],
          pushback: {
            A: [
              pb(["Logged out mid-call", "Utloggade mitt i samtalet"], ["Revoking sessions for {{num.clickers}} clickers logs them out in the middle of work, several of them in customer-facing roles during the outage. They cannot get back in until their passwords are reset. Do you stagger it, and who decides the order?", "När sessionerna återkallas för {{num.clickers}} personer som klickat loggas de ut mitt i arbetet, flera av dem i kundnära roller under avbrottet. De kommer inte in igen förrän deras lösenord är återställda. Gör ni det i omgångar, och vem bestämmer ordningen?"]),
              pb(["Keys for the partner", "Nycklar till partnern"], ["Your incident-response partner can start remotely now, but needs administrator access to do anything useful. You have just disabled two admin accounts because of a stolen login. Do you hand a third party new privileged access in the middle of an attack?", "Er incidentpartner kan börja på distans direkt, men behöver administratörsbehörighet för att göra något användbart. Ni har just spärrat två administratörskonton på grund av en stulen inloggning. Ger ni en tredje part ny privilegierad åtkomst mitt i ett angrepp?"]),
              pb(["“I need that account”", "”Jag behöver det kontot”"], ["The administrator, still upset on the bridge, says that without the account nobody at the service desk can help the staff now locked out. They ask for it back under supervision. Do you say no, and who does their work instead?", "Administratören, fortfarande upprörd i samtalet, säger att utan kontot kan ingen på servicedesken hjälpa personalen som nu är utelåst. Hen ber att få tillbaka det under uppsikt. Säger ni nej, och vem gör hens arbete i stället?"])
            ],
            B: [
              pb(["The new admin stays", "Den nya administratören finns kvar"], ["A password reset does nothing to the new member the account added to an administrator group. Watching for more means waiting until that new access is used. How long are you willing to let it exist?", "Ett lösenordsbyte gör ingenting åt den nya medlemmen som kontot lade till i en administratörsgrupp. Att hålla utkik efter mer innebär att vänta tills den nya åtkomsten används. Hur länge är ni beredda att låta den finnas?"]),
              pb(["Sessions that survive", "Sessioner som överlever"], ["The SOC lead warns that changing the password does not end sessions already open from {{asset.attackerIp}}. The attacker may still be signed in right now. Is anyone actually out?", "SOC-ansvarig varnar för att ett lösenordsbyte inte avslutar sessioner som redan är öppna från {{asset.attackerIp}}. Angriparen kan fortfarande vara inloggad just nu. Är någon faktiskt utestängd?"]),
              pb(["Who is watching?", "Vem håller utkik?"], ["With {{num.responders}} people and one on the rollback, nobody has been assigned to watch. Watching for more needs someone who knows what normal looks like. Who is watching, for what, and until when?", "Med {{num.responders}} personer och en på tillbakarullningen har ingen fått uppdraget att bevaka. Att hålla utkik kräver någon som vet hur det normala ser ut. Vem håller utkik, efter vad och hur länge?"])
            ],
            C: [
              pb(["Why tonight?", "Varför i kväll?"], ["The account was used from outside ten minutes after the password was entered. Waiting until tonight gives the attacker the rest of the afternoon with every clicker's login. What do you gain by waiting?", "Kontot användes utifrån tio minuter efter att lösenordet hade angetts. Att vänta till i kväll ger angriparen resten av eftermiddagen med inloggningarna för alla som klickat. Vad vinner ni på att vänta?"]),
              pb(["Not the account they made", "Inte kontot de skapade"], ["Resetting the clickers' passwords does not touch the new administrator the attacker created, which never clicked anything. Your plan removes the door but not the person already inside. What removes them?", "Att byta lösenord för dem som klickade påverkar inte den nya administratören som angriparen skapade, och den har aldrig klickat på något. Er plan tar bort dörren men inte den som redan är inne. Vad tar bort hen?"]),
              pb(["A service desk buried", "En servicedesk som drunknar"], ["Resetting {{num.clickers}} passwords will flood the service desk with calls tonight, while the outage is still running. The service desk is also where the phished administrator works. Who handles the calls, and can you trust the process?", "Att byta {{num.clickers}} lösenord kommer att översvämma servicedesken med samtal i kväll, medan avbrottet fortfarande pågår. Servicedesken är också där den nätfiskade administratören arbetar. Vem tar samtalen, och kan ni lita på rutinen?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Accounts disabled, sessions revoked", "Kontona spärrade, sessionerna återkallade"], [
              io(["Cut off", "Avskurna"], ["Sign-ins from {{asset.attackerIp}} stop, and the incident-response partner is on the call within the hour. The room breathes out.", "Inloggningarna från {{asset.attackerIp}} upphör, och incidentpartnern är med i samtalet inom en timme. Rummet andas ut."], ["No sign-ins from the attacker's address were seen in the first hour after containment.", "Inga inloggningar från angriparens adress syntes under den första timmen efter begränsningen."]),
              io(["Logged out mid-call", "Utloggade mitt i samtal"], ["Revoking sessions logs out clickers in customer-facing roles in the middle of calls, during the outage. Customers are left on hold while staff wait for new passwords.", "När sessionerna återkallas loggas klickare i kundnära roller ut mitt i samtal, under avbrottet. Kunderna får vänta medan personalen väntar på nya lösenord."], ["Customer-facing staff were logged out mid-call during the outage.", "Kundnära personal loggades ut mitt i samtal under avbrottet."], { meters: { trust: -1 } }),
              io(["Keys for the partner", "Nycklar till partnern"], ["The partner can start remotely, but needs administrator access to do anything. You have just disabled two admin accounts, and agreeing how to grant a third takes time.", "Partnern kan börja på distans, men behöver administratörsbehörighet för att göra något. Ni har just spärrat två administratörskonton, och att komma överens om hur en tredje ska ges tar tid."], ["The response partner's start was delayed while access was agreed.", "Incidentpartnerns start försenades medan åtkomsten förhandlades."])
            ]),
            ir("i2", { notChosen: "A" }, ["Partial containment", "Delvis begränsning"], [
              io(["Nothing new", "Inget nytt"], ["The SIEM shows nothing new for the next half hour. It looks as if what you did was enough.", "SIEM visar inget nytt under den följande halvtimmen. Det ser ut som att det ni gjorde räckte."], ["The SIEM showed nothing new in the half hour after your decision.", "SIEM visade inget nytt under halvtimmen efter ert beslut."]),
              io(["The new admin signs in", "Den nya administratören loggar in"], ["The account the attacker added to the administrator group signs in from outside and starts listing servers. Nothing you did touched it.", "Kontot som angriparen lade till i administratörsgruppen loggar in utifrån och börjar lista servrar. Inget av det ni gjorde påverkade det."], ["The attacker-created admin account has signed in from outside.", "Administratörskontot som angriparen skapade har loggat in utifrån."], { reopen: true }),
              io(["Still signed in?", "Fortfarande inloggad?"], ["The SOC lead points out that sessions already open from {{asset.attackerIp}} may still be alive. Nobody can confirm either way.", "SOC-ansvarig påpekar att sessioner som redan är öppna från {{asset.attackerIp}} fortfarande kan vara aktiva. Ingen kan bekräfta det ena eller det andra."], ["Nobody can confirm whether the attacker's sessions are closed.", "Ingen kan bekräfta om angriparens sessioner är stängda."])
            ])
          ]
        }),
        facilitator: fac(
          ["The fires connect. Watch for relief that one was a coincidence turning into complacency.", "Bränderna hänger ihop. Se upp så att lättnaden över sammanträffandet inte blir till självbelåtenhet."],
          ["Both accounts disabled, sessions revoked and help called in.", "Båda kontona spärrade, sessionerna återkallade och hjälp inkallad."],
          [["Ask: what is the new admin account for?", "Fråga: vad är det nya administratörskontot till för?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 180,
        title: L(["Two commanders", "Två ledare"]),
        twist: L(["The CIO and the CISO are giving contradictory orders to the same people.", "IT-chefen och säkerhetschefen ger motstridiga order till samma personer."]),
        twistKind: "authority",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because both admin accounts were disabled, the service desk cannot unlock anyone, and the phone queue is growing.", sv: "Eftersom båda administratörskontona stängdes av kan servicedesken inte låsa upp någon, och telefonkön växer." } }
        ],
        assumptionChallenged: L(["Everyone knows who is in charge.", "Alla vet vem som leder."]),
        narrative: L([
          "{{time.T+180|clock}}. Two senior leaders join the incident bridge from different meetings, each briefed by different people.\n\nWithin minutes they are giving orders to the same four responders, and the orders point in opposite directions. The responders look at the incident lead to find out whom to follow.",
          "Klockan {{time.T+180|clock}}. Två höga chefer ansluter till incidentmötet från olika möten, informerade av olika personer.\n\nInom några minuter ger de order till samma fyra personer, och orderna pekar åt motsatta håll. De som arbetar med incidenten tittar på incidentledaren för att se vem de ska följa."
        ]),
        injects: [
          inj("i4-1", 180, "chat", "person.cio", "high", "confirmed", [
            "“Everyone back on the customer outage. That's what the board is asking about.”",
            "”Alla tillbaka till kundavbrottet. Det är det styrelsen frågar om.”"
          ], { fallbackRole: "incidentCommander", tests: ["lo2"] }),
          inj("i4-2", 185, "chat", "person.ciso", "high", "confirmed", [
            "“Nobody leaves the security incident until the attacker is out.”",
            "”Ingen lämnar säkerhetsincidenten förrän angriparen är ute.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What do responders do when given two orders?", "Vad gör personerna när de får två order?", ["socLead", "itOps"]),
            q("Which tasks can wait without harm?", "Vilka uppgifter kan vänta utan skada?", ["socLead", "itOps"]),
            q("Did your containment of the admin accounts hold?", "Höll er begränsning av administratörskontona?", ["socLead"], "d3")
          ],
          executive: [
            q("Who is the incident commander, and does everyone know?", "Vem är incidentledare, och vet alla om det?", ["incidentCommander", "cio", "ciso"]),
            q("How do senior leaders give input without giving orders?", "Hur ger chefer underlag utan att ge order?", ["cio", "ciso"]),
            q("Was your choice of commander in the first hour respected?", "Respekterades ert val av ledare under den första timmen?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Both leaders outrank the incident commander.", "Båda cheferna är högre i rang än incidentledaren.")],
        decision: dec("d4", "incidentCommander", ["How do you resolve the conflict?", "Hur löser ni konflikten?"], [
          ["Confirm one commander with authority over both fires; leaders feed priorities to them, not to responders.", "Bekräfta en ledare med mandat över båda bränderna; cheferna ger sina prioriteringar till ledaren, inte till personerna."],
          ["Let the CIO and CISO split the team between them.", "Låt IT-chefen och säkerhetschefen dela upp teamet mellan sig."],
          ["Escalate to the CEO to decide.", "Eskalera till vd för beslut."]
        ], {
          knowns: [["Two leaders gave conflicting orders.", "Två chefer har gett motstridiga order."]],
          uncertainties: [["Whether either will step back.", "Om någon av dem kommer att backa."]],
          tradeoffs: {
            operational: ["Splitting the team halves each response.", "Att dela teamet halverar varje insats."],
            security: ["Confusion lets the attacker regroup.", "Förvirring låter angriparen samla sig."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["Visible infighting erodes trust in the team.", "Synliga konflikter urholkar förtroendet för teamet."]
          },
          evaluation: [["Restores a single line of command", "Återställer en enda ledningslinje"]],
          minutes: 10,
          pushback: {
            A: [
              pb(["“Two levels below me”", "”Två nivåer under mig”"], ["The CIO says: “I don't take instructions from someone two levels below me. The board is calling me, not you.” Nobody in the room has said who backs the commander. Who does, and will they say it out loud?", "IT-chefen säger: ”Jag tar inte order från någon två nivåer under mig. Det är mig styrelsen ringer, inte dig.” Ingen i rummet har sagt vem som står bakom ledaren. Vem gör det, och säger hen det högt?"]),
              pb(["Did the CISO just win?", "Vann säkerhetschefen just?"], ["The commander keeps most people on the security fires. The CIO says that is not neutral command, it is taking the CISO's side while customers wait. Can one commander be seen as fair when one priority wins?", "Ledaren behåller de flesta på säkerhetsbränderna. IT-chefen säger att det inte är neutral ledning utan att ta säkerhetschefens parti medan kunderna väntar. Kan en enda ledare uppfattas som rättvis när en prioritering vinner?"]),
              pb(["Three jobs, one person", "Tre jobb, en person"], ["The commander now fields two senior leaders, updates the board and still does hands-on work with only {{num.responders}} people. Messages to the commander are piling up unanswered. Who takes part of the load without creating a second line of command?", "Ledaren hanterar nu två höga chefer, informerar styrelsen och arbetar fortfarande praktiskt med bara {{num.responders}} personer. Meddelandena till ledaren hopar sig obesvarade. Vem tar en del av lasset utan att det blir en andra ledningslinje?"])
            ],
            B: [
              pb(["Half a team each", "Ett halvt team var"], ["Split two ways, {{num.responders}} people leave the security side unable to cover the phishing and the admin accounts at once. The CISO asks the CIO for one more person, and they start negotiating. Do you reopen the split every time someone needs help?", "Uppdelat i två räcker {{num.responders}} personer inte för att säkerhetssidan ska klara nätfisket och administratörskontona samtidigt. Säkerhetschefen ber IT-chefen om en person till, och de börjar förhandla. Öppnar ni fördelningen igen varje gång någon behöver hjälp?"]),
              pb(["Nobody owns the middle", "Ingen äger det som är mittemellan"], ["The staff warning about the phishing and the update on the status page belong to neither half. Each leader assumes the other has it. Who answers for the work that falls between them?", "Varningen till personalen om nätfisket och uppdateringen av driftstatussidan hör inte till någon av halvorna. Varje chef utgår från att den andra har det. Vem ansvarar för det arbete som hamnar mellan dem?"]),
              pb(["Two answers for the board", "Två svar till styrelsen"], ["The board receives two separate briefings, one from each leader, with different priorities and different numbers. The chair asks which one is the organisation's position. What do you tell them?", "Styrelsen får två separata genomgångar, en från varje chef, med olika prioriteringar och olika siffror. Ordföranden frågar vilken som är organisationens hållning. Vad svarar ni?"])
            ],
            C: [
              pb(["The CEO is unreachable", "Vd går inte att nå"], ["The CEO is in a meeting that cannot be interrupted for at least an hour. Until then both leaders keep giving orders. Who leads in the meantime?", "Vd sitter i ett möte som inte kan avbrytas på minst en timme. Fram till dess fortsätter båda cheferna att ge order. Vem leder under tiden?"]),
              pb(["The CEO picks the visible fire", "Vd väljer den synliga branden"], ["The CEO decides for the customer outage, because that is what the board is asking about. The security responders say it is the wrong call. Do you follow a decision you asked for but disagree with?", "Vd beslutar för kundavbrottet, eftersom det är det styrelsen frågar om. De som arbetar med säkerheten säger att det är fel beslut. Följer ni ett beslut som ni bad om men inte håller med om?"]),
              pb(["Every conflict goes up", "Varje konflikt går uppåt"], ["Half an hour later there is a new disagreement, and the responders wait for the CEO again. Each escalation costs time you do not have. Is the CEO now your incident commander?", "En halvtimme senare uppstår en ny oenighet, och personerna väntar på vd igen. Varje eskalering kostar tid som ni inte har. Är vd nu er incidentledare?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["One commander confirmed", "En ledare bekräftad"], [
              io(["Leaders step back", "Cheferna backar"], ["After a short, tense exchange both leaders agree to give their priorities to the commander. The responders visibly relax.", "Efter en kort, spänd ordväxling går båda cheferna med på att ge sina prioriteringar till ledaren. De som arbetar med incidenten slappnar synbart av."], ["Both leaders now route their priorities through the commander.", "Båda cheferna ger nu sina prioriteringar via ledaren."]),
              io(["A separate briefing", "En separat genomgång"], ["The CIO briefs the board directly, with different numbers and a different priority from the commander's. The chair asks which version is the organisation's.", "IT-chefen informerar styrelsen direkt, med andra siffror och en annan prioritering än ledarens. Ordföranden frågar vilken version som är organisationens."], ["The board has had a separate briefing from the CIO.", "Styrelsen har fått en separat genomgång från IT-chefen."], { reopen: true }),
              io(["“Your call”", "”Ditt beslut”"], ["Asked to back the commander, the CEO replies with two words: “Your call.” Both leaders read it as support for their own side.", "När vd ombeds stötta ledaren svarar vd med två ord: ”Ditt beslut.” Båda cheferna tolkar det som stöd för sin egen sida."], ["The CEO replied only “your call”, and both leaders claim it.", "Vd svarade bara ”ditt beslut”, och båda cheferna tar det till intäkt."])
            ]),
            ir("i2", { notChosen: "A" }, ["No single line of command", "Ingen enda ledningslinje"], [
              io(["A calmer bridge", "Ett lugnare samtal"], ["The arguing stops and the bridge call goes quiet. Work seems to flow again, at least for now.", "Grälet tystnar och samtalet blir lugnt. Arbetet verkar flyta igen, åtminstone för tillfället."], ["The bridge call has gone quiet for now.", "Samtalet har blivit lugnt för tillfället."]),
              io(["Work falls between", "Arbete hamnar mittemellan"], ["Nobody has sent staff a warning about the phishing, and nobody has updated the status page in hours. Each side assumed the other had it.", "Ingen har skickat en varning om nätfisket till personalen, och ingen har uppdaterat driftstatussidan på flera timmar. Varje sida utgick från att den andra hade det."], ["By the fourth hour, nobody had warned staff or updated the status page.", "Vid den fjärde timmen hade ingen varnat personalen eller uppdaterat driftstatussidan."], { reopen: true, meters: { trust: -1 } }),
              io(["Two sets of numbers", "Två uppsättningar siffror"], ["The board receives two briefings with different numbers and different priorities. Neither is wrong, exactly.", "Styrelsen får två genomgångar med olika siffror och olika prioriteringar. Ingen av dem är direkt fel."], ["The board has received two briefings with different numbers.", "Styrelsen har fått två genomgångar med olika siffror."])
            ])
          ]
        }),
        facilitator: fac(
          ["Classic command failure. Let the tension land before resolving it.", "Klassiskt ledningsfel. Låt spänningen landa innan den löses."],
          ["One commander confirmed, leaders advising through them.", "En ledare bekräftad, cheferna ger råd via ledaren."],
          [["Ask: who can tell a CIO to step back?", "Fråga: vem kan säga till en IT-chef att backa?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 300,
        title: L(["The backup console", "Administrationen för säkerhetskopior"]),
        twist: L(["The new admin account opened the backup console and changed the retention policy.", "Det nya administratörskontot öppnade administrationen för säkerhetskopior och ändrade lagringspolicyn."]),
        twistKind: "scope",
        assumptionChallenged: L(["The attacker only had a foothold.", "Angriparen hade bara ett fotfäste."]),
        reveals: ["hf-backup"],
        narrative: L([
          "{{time.T+300|clock}}. The incident-response partner has been going through everything the attacker's accounts did since the phishing click.\n\nMost of it is reconnaissance: listing groups, reading settings. One action is different. It is quiet, small and set to take effect tonight.",
          "Klockan {{time.T+300|clock}}. Incidentpartnern har gått igenom allt som angriparens konton har gjort sedan klicket på nätfiskelänken.\n\nDet mesta är kartläggning: listning av grupper, läsning av inställningar. En åtgärd skiljer sig. Den är tyst, liten och inställd att få effekt i natt."
        ]),
        injects: [
          inj("i5-1", 300, "backupReport", "backupSystem", "critical", "confirmed", [
            "The new admin opened the backup console on {{asset.backupServer}} and shortened retention to one day. Older restore points will be deleted tonight unless changed.",
            "Den nya administratören öppnade administrationen för säkerhetskopior på {{asset.backupServer}} och kortade lagringstiden till en dag. Äldre återställningspunkter raderas i natt om inget ändras."
          ], { headline: ["Backup retention changed", "Lagringstiden för säkerhetskopior ändrad"], reveals: ["hf-backup"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How do you restore retention and protect the restore points?", "Hur återställer ni lagringstiden och skyddar återställningspunkterna?", ["itOps"]),
            q("What does this tell you about the attacker's plan?", "Vad säger det här om angriparens plan?", ["socLead"]),
            q("Did one commander make this finding faster?", "Gjorde en enda ledare att det här hittades snabbare?", ["socLead"], "d4")
          ],
          executive: [
            q("Is this now a likely ransomware precursor?", "Är det här nu ett troligt förstadium till utpressningsprogram?", ["ciso"]),
            q("What must be protected tonight, above all?", "Vad måste skyddas i natt, framför allt?", ["incidentCommander", "cio"]),
            q("Was disabling the admin accounts early enough?", "Var spärren av administratörskontona tillräckligt tidig?", ["ciso"], "d3")
          ]
        },
        challenges: [ch("The backup team is the same person doing the outage rollback.", "Backupteamet är samma person som gör tillbakarullningen av avbrottet.")],
        decision: dec("d5", "incidentCommander", ["Where do you put your scarce people now?", "Var sätter ni era få personer nu?"], [
          ["Pause the rollback, protect backups first, then resume.", "Pausa tillbakarullningen, skydda säkerhetskopiorna först och återuppta sedan."],
          ["Finish the rollback, then fix retention before tonight.", "Gör klart tillbakarullningen och rätta sedan lagringstiden före i natt."],
          ["Ask the backup vendor to restore retention remotely.", "Be backupleverantören återställa lagringstiden på distans."]
        ], {
          knowns: [["Backups will be deleted tonight.", "Säkerhetskopiorna raderas i natt."]],
          uncertainties: [["What else the attacker prepared.", "Vad mer angriparen har förberett."]],
          tradeoffs: {
            operational: ["Pausing the rollback extends the customer outage.", "En paus i tillbakarullningen förlänger kundavbrottet."],
            security: ["Losing backups would turn any attack into a disaster.", "Att förlora säkerhetskopiorna skulle göra varje angrepp till en katastrof."],
            legal: ["SLAs versus data protection.", "Servicenivåavtal mot dataskydd."],
            reputational: ["A longer outage is survivable.", "Ett längre avbrott går att överleva."]
          },
          evaluation: [["Protects recovery capability first", "Skyddar förmågan att återställa först"]],
          pushback: {
            A: [
              pb(["Stop means restart", "Att stoppa är att börja om"], ["The engineer says the rollback cannot be paused, only stopped, and restarting it will add another two hours. The outage is now well into its sixth hour. Is protecting the backups worth doubling what is left?", "Teknikern säger att tillbakarullningen inte kan pausas, bara stoppas, och att starta om den lägger till ytterligare två timmar. Avbrottet är nu en bra bit in på sin sjätte timme. Är skyddet av säkerhetskopiorna värt att dubbla det som återstår?"]),
              pb(["Your choice, their delay", "Ert val, deras försening"], ["The service owner says the longer outage will break customer SLAs, and asks who tells {{num.customersAffected}} customers that the delay was a choice. Customer support needs a line within the hour. What is it?", "Tjänsteägaren säger att det längre avbrottet bryter mot kundernas servicenivåavtal, och frågar vem som berättar för {{num.customersAffected}} kunder att förseningen var ett val. Kundtjänst behöver något att säga inom en timme. Vad är det?"]),
              pb(["Is the setting enough?", "Räcker inställningen?"], ["The backup vendor warns that restore points already marked for deletion may not be unmarked by changing the policy back. Making an offline copy would take the rest of the evening. Do you trust the setting, or spend the time?", "Backupleverantören varnar för att återställningspunkter som redan är markerade för radering kanske inte avmarkeras när policyn ändras tillbaka. En kopia utanför nätet skulle ta resten av kvällen. Litar ni på inställningen, eller lägger ni tiden?"])
            ],
            B: [
              pb(["Tonight is not a time", "”I natt” är inget klockslag"], ["The rollback has slipped and needs a few more hours. Nobody can say exactly when tonight the deletion job runs. How much margin are you willing to bet the backups on?", "Tillbakarullningen har dragit ut och behöver några timmar till. Ingen kan säga exakt när i natt raderingsjobbet körs. Hur liten marginal är ni beredda att satsa säkerhetskopiorna på?"]),
              pb(["One tired person, one fix", "En trött person, en åtgärd"], ["The same person finishing the rollback will then change the retention policy in a hurry, after hours of work. A typo there loses everything. Who checks their work?", "Samma person som gör klart tillbakarullningen ska sedan ändra lagringspolicyn i all hast, efter flera timmars arbete. Ett skrivfel där förlorar allt. Vem kontrollerar hens arbete?"]),
              pb(["“You're betting the backups”", "”Ni satsar säkerhetskopiorna”"], ["The CISO says: “You are betting our ability to recover on a customer outage that can wait.” The CIO says the customers cannot wait any longer. Can you defend the order to both of them?", "Säkerhetschefen säger: ”Ni satsar vår förmåga att återställa på ett kundavbrott som kan vänta.” IT-chefen säger att kunderna inte kan vänta längre. Kan ni försvara ordningen inför båda?"])
            ],
            C: [
              pb(["Another privileged door", "Ytterligare en privilegierad dörr"], ["The vendor needs remote administrator access to the backup console to do it. You have just learned what one stolen admin login can do there. Do you open another privileged door, tonight?", "Leverantören behöver administratörsåtkomst på distans till backupadministrationen för att göra det. Ni har just sett vad en stulen administratörsinloggning kan göra där. Öppnar ni ytterligare en privilegierad dörr, i natt?"]),
              pb(["Next in the queue", "Nästa i kön"], ["Vendor support logs your call and says the next engineer is free in about four hours. Nobody can say whether that is before the deletion runs. Do you wait, or pull your own person off the rollback after all?", "Leverantörens support registrerar ärendet och säger att nästa tekniker är ledig om ungefär fyra timmar. Ingen kan säga om det är före raderingen. Väntar ni, eller tar ni ändå er egen person från tillbakarullningen?"]),
              pb(["“Done”, says the email", "”Klart”, står det i mejlet"], ["The vendor emails that retention is restored. Nobody inside has time to check the console. Do you trust an email for the one thing you cannot afford to get wrong?", "Leverantören mejlar att lagringstiden är återställd. Ingen internt har tid att kontrollera administrationen. Litar ni på ett mejl i den enda fråga ni inte har råd att få fel?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Backups first", "Säkerhetskopiorna först"], [
              io(["Retention restored", "Lagringstiden återställd"], ["Retention is back to normal and the backup team confirms the restore points are intact. Whatever else happens tonight, you can recover.", "Lagringstiden är normal igen och backupteamet bekräftar att återställningspunkterna är intakta. Vad som än händer i natt kan ni återställa."], ["Backup retention is restored and the restore points are intact.", "Lagringstiden är återställd och återställningspunkterna är intakta."]),
              io(["Stopping costs hours", "Att stoppa kostar timmar"], ["The rollback could not be paused, only stopped. Restarting it adds about two hours, and the service owner wants to know who tells the customers.", "Tillbakarullningen gick inte att pausa, bara att stoppa. Att starta om den lägger till ungefär två timmar, och tjänsteägaren vill veta vem som berättar det för kunderna."], ["Stopping the rollback added about two hours to the outage.", "Att stoppa tillbakarullningen förlängde avbrottet med ungefär två timmar."], { meters: { trust: -1 } }),
              io(["Already marked?", "Redan markerade?"], ["The backup vendor says some restore points may already have been marked for deletion, and changing the policy back may not unmark them. They cannot say which.", "Backupleverantören säger att vissa återställningspunkter kanske redan har markerats för radering, och att det kanske inte räcker att ändra tillbaka policyn. De kan inte säga vilka."], ["Some restore points may still be marked for deletion.", "Vissa återställningspunkter kan fortfarande vara markerade för radering."], { reopen: true })
            ]),
            ir("i2", { notChosen: "A" }, ["Backups wait", "Säkerhetskopiorna får vänta"], [
              io(["Plenty of margin", "Gott om marginal"], ["The backup team checks the schedule: the deletion job runs in the small hours. There seems to be more time than anyone feared.", "Backupteamet kontrollerar schemat: raderingsjobbet körs under småtimmarna. Det verkar finnas mer tid än någon hade befarat."], ["The deletion job is scheduled for the small hours.", "Raderingsjobbet är schemalagt till småtimmarna."]),
              io(["Nobody knows when", "Ingen vet när"], ["Nobody can find when the deletion job runs. It could be at midnight, or in an hour. The backups are waiting on a clock nobody can read.", "Ingen kan hitta när raderingsjobbet körs. Det kan vara vid midnatt, eller om en timme. Säkerhetskopiorna väntar på en klocka som ingen kan läsa."], ["Nobody knows exactly when the deletion job runs.", "Ingen vet exakt när raderingsjobbet körs."], { reopen: true }),
              io(["The CISO dissents", "Säkerhetschefen reserverar sig"], ["The CISO formally records disagreement: “We are betting our ability to recover on something that can wait.” The CIO backs your order.", "Säkerhetschefen reserverar sig formellt: ”Vi satsar vår förmåga att återställa på något som kan vänta.” IT-chefen står bakom er ordning."], ["The CISO has formally recorded disagreement with the order.", "Säkerhetschefen har formellt reserverat sig mot ordningen."])
            ])
          ]
        }),
        facilitator: fac(
          ["The coincidental fire now competes with the real one for the same person.", "Branden som var ett sammanträffande konkurrerar nu med den verkliga om samma person."],
          ["Backups protected before the rollback resumes.", "Säkerhetskopiorna skyddade innan tillbakarullningen återupptas."],
          [["Ask: which loss can you recover from?", "Fråga: vilken förlust går att återhämta sig från?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 420,
        title: L(["Actions that collide", "Åtgärder som krockar"]),
        twist: L(["Revoking sessions broke the deployment account used for the rollback. Your own response stopped your recovery.", "Återkallandet av sessioner slog ut driftsättningskontot som användes för tillbakarullningen. Er egen hantering stoppade er återställning."]),
        twistKind: "impact",
        reconsider: { decision: "d3", pressure: { en: "Revoking sessions broke your own rollback. Was containing the linked attack the right priority in that hour?", sv: "Att återkalla sessionerna slog ut er egen återställning. Var det rätt att prioritera det sammanlänkade angreppet just den timmen?" } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because one commander now leads both fires, the leader who was passed over has stopped attending the briefings.", sv: "Eftersom en enda incidentledare nu leder båda bränderna har den chef som förbigicks slutat komma till genomgångarna." } }
        ],
        assumptionChallenged: L(["Response actions on one fire don't affect another.", "Åtgärder för en brand påverkar inte en annan."]),
        narrative: L([
          "{{time.T+420|clock}}. The security team revoked every session on the network an hour ago, to throw the attacker out.\n\nAt the same time, the operations team was in the middle of rolling back the failed database change. Nobody told them about the revocation, and nobody told the security team about the rollback.",
          "Klockan {{time.T+420|clock}}. Säkerhetsteamet återkallade alla sessioner i nätverket för en timme sedan, för att kasta ut angriparen.\n\nSamtidigt var driftteamet mitt i att rulla tillbaka den misslyckade databasändringen. Ingen berättade om återkallandet för dem, och ingen berättade om tillbakarullningen för säkerhetsteamet."
        ]),
        injects: [
          inj("i6-1", 420, "logExcerpt", "itOps", "high", "confirmed", [
            "The rollback job failed: its service account {{asset.serviceAccount}} lost its session when sessions were revoked. The database is now half rolled back.",
            "Tillbakarullningsjobbet misslyckades: dess tjänstekonto {{asset.serviceAccount}} förlorade sin session när sessionerna återkallades. Databasen är nu halvvägs tillbakarullad."
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you recover the half-rolled-back database safely?", "Hur återställer ni den halvvägs tillbakarullade databasen säkert?", ["itOps"]),
            q("Which security actions could break other work?", "Vilka säkerhetsåtgärder kan slå ut annat arbete?", ["socLead", "itOps"]),
            q("Did you protect the backups before this happened?", "Skyddade ni säkerhetskopiorna innan det här hände?", ["itOps"], "d5")
          ],
          executive: [
            q("How do you coordinate actions across fires?", "Hur samordnar ni åtgärder mellan bränderna?", ["incidentCommander"]),
            q("What do customers hear about the longer outage?", "Vad får kunderna höra om det längre avbrottet?", ["comms", "serviceOwner"]),
            q("Does one commander make collisions like this less likely?", "Gör en enda ledare krockar som den här mindre sannolika?", ["incidentCommander"], "d4")
          ]
        },
        challenges: [ch("The customer outage is now in its eighth hour.", "Kundavbrottet är nu inne på sin åttonde timme.")],
        decision: dec("d6", "incidentCommander", ["How do you prevent this happening again?", "Hur förhindrar ni att det här händer igen?"], [
          ["A single action log where every change is announced before it's made.", "En gemensam åtgärdslogg där varje ändring meddelas innan den görs."],
          ["Separate the security and operations teams completely.", "Skilj säkerhets- och driftteamen åt helt."],
          ["Stop security actions until the outage is fixed.", "Stoppa säkerhetsåtgärder tills avbrottet är löst."]
        ], {
          knowns: [["A security action broke recovery.", "En säkerhetsåtgärd slog ut återställningen."]],
          uncertainties: [["What other dependencies exist.", "Vilka andra beroenden som finns."]],
          tradeoffs: {
            operational: ["Announcing every change slows response a little.", "Att meddela varje ändring gör hanteringen något långsammare."],
            security: ["Pausing security actions gives the attacker time.", "Att pausa säkerhetsåtgärder ger angriparen tid."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["Self-inflicted outages are hard to explain.", "Självförvållade avbrott är svåra att förklara."]
          },
          evaluation: [["Coordinates actions through one log", "Samordnar åtgärder via en gemensam logg"]],
          pushback: {
            A: [
              pb(["Wait to block?", "Vänta med att blockera?"], ["The SOC wants to block a suspicious address immediately, but the new log means announcing it and waiting for objections. The SOC lead calls it giving the attacker a head start. Who may skip the log, and who decides that in the moment?", "SOC vill blockera en misstänkt adress direkt, men den nya loggen innebär att det ska meddelas och att man väntar på invändningar. SOC-ansvarig kallar det att ge angriparen ett försprång. Vem får hoppa över loggen, och vem avgör det i stunden?"]),
              pb(["Who keeps the log?", "Vem för loggen?"], ["Someone has to keep the log up to date, and with {{num.responders}} people that is one fewer pair of hands. Every name you suggest is already working a fire. Who takes it, and what do they stop doing?", "Någon måste hålla loggen uppdaterad, och med {{num.responders}} personer är det ett par händer mindre. Varje namn ni föreslår arbetar redan med en brand. Vem tar det, och vad slutar hen göra?"]),
              pb(["Announcing isn't knowing", "Att meddela är inte att veta"], ["Operations points out that announcing the revocation would not have helped: nobody on either team knew the rollback depended on {{asset.serviceAccount}}. A log shows what you do, not what depends on it. Is the log the fix, or a ritual?", "Driften påpekar att det inte hade hjälpt att meddela återkallandet: ingen i något av teamen visste att tillbakarullningen var beroende av {{asset.serviceAccount}}. En logg visar vad ni gör, inte vad som hänger på det. Är loggen lösningen, eller en ritual?"])
            ],
            B: [
              pb(["The same systems", "Samma system"], ["Both teams still work in the same directory, on the same accounts and servers. Separating the people does not separate what their actions touch. How does this stop the next collision?", "Båda teamen arbetar fortfarande i samma katalog, med samma konton och servrar. Att skilja på personerna skiljer inte på det deras åtgärder påverkar. Hur hindrar det här nästa krock?"]),
              pb(["No one to ask", "Ingen att fråga"], ["Operations now needs to know whether {{asset.serviceAccount}} is safe to bring back. The people who could answer are on the other side of the wall you just built. Who decides, and how fast?", "Driften behöver nu veta om {{asset.serviceAccount}} är säkert att återaktivera. De som kan svara sitter på andra sidan muren ni just byggde. Vem avgör, och hur snabbt?"]),
              pb(["Two stories", "Två berättelser"], ["Customers hear one explanation from operations and the board another from security. Neither mentions what the other team did. Who now holds the whole picture of the incident?", "Kunderna får en förklaring från driften och styrelsen en annan från säkerheten. Ingen av dem nämner vad det andra teamet gjorde. Vem har nu hela bilden av incidenten?"])
            ],
            C: [
              pb(["“Reopening the door”", "”Att öppna dörren igen”"], ["The CISO says halting security work while nobody can confirm the attacker is out is reopening the door. Every hour of the pause is an hour they could use. Do you accept that risk for a faster fix?", "Säkerhetschefen säger att stoppa säkerhetsarbetet medan ingen kan bekräfta att angriparen är ute är att öppna dörren igen. Varje timme av pausen är en timme som angriparen kan använda. Accepterar ni den risken för en snabbare lösning?"]),
              pb(["A pause with no end", "En paus utan slut"], ["Operations cannot say how long it will take to repair a half-rolled-back database. It might be hours, it might be tomorrow. How long is your pause, and who decides when it ends?", "Driften kan inte säga hur lång tid det tar att laga en halvvägs tillbakarullad databas. Det kan ta timmar, det kan bli i morgon. Hur lång är er paus, och vem bestämmer när den slutar?"]),
              pb(["The partner objects", "Partnern invänder"], ["Your incident-response partner says they cannot be responsible for containment if every action has to wait for operations. They ask to be released or allowed to act. Which do you choose?", "Er incidentpartner säger att de inte kan ansvara för att begränsa angreppet om varje åtgärd måste vänta på driften. De ber att få avsluta uppdraget eller få agera. Vilket väljer ni?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["One action log", "En gemensam åtgärdslogg"], [
              io(["A collision caught", "En krock upptäckt"], ["Within the hour, an announced firewall change is flagged by operations: it would have cut the database team off mid-repair. It is rescheduled.", "Inom en timme flaggar driften en meddelad brandväggsändring: den skulle ha stängt ute databasteamet mitt i lagningen. Den flyttas."], ["The action log has already caught one conflicting change.", "Åtgärdsloggen har redan fångat en ändring som skulle ha krockat."]),
              io(["The block waited", "Blockeringen fick vänta"], ["The SOC announced a block on a suspicious address and waited for objections. Meanwhile the address probed the VPN. The SOC lead says the log gave it a head start.", "SOC meddelade en blockering av en misstänkt adress och väntade på invändningar. Under tiden sonderade adressen VPN. SOC-ansvarig säger att loggen gav den ett försprång."], ["A suspicious address probed the VPN while a block waited in the log.", "En misstänkt adress sonderade VPN medan en blockering väntade i loggen."], { reopen: true }),
              io(["Falling behind", "Halkar efter"], ["Nobody was given the job of keeping the log. Entries are an hour old, and people have started to skip it when in a hurry.", "Ingen fick uppdraget att föra loggen. Posterna är en timme gamla, och folk har börjat hoppa över den när det är bråttom."], ["The action log is already falling behind.", "Åtgärdsloggen halkar redan efter."])
            ]),
            ir("i2", { notChosen: "A" }, ["No shared log", "Ingen gemensam logg"], [
              io(["No more collisions", "Inga fler krockar"], ["Nothing else breaks over the next hour. Perhaps the revocation was a one-off.", "Inget annat går sönder under den följande timmen. Kanske var återkallandet en engångsföreteelse."], ["No further collisions were seen in the next hour.", "Inga fler krockar syntes under den följande timmen."]),
              io(["Another collision", "Ännu en krock"], ["Operations restarts a server to clear the stuck rollback while the SOC is still collecting its logs. The logs the SOC needed are gone.", "Driften startar om en server för att få loss den fastnade tillbakarullningen medan SOC fortfarande samlar in dess loggar. Loggarna som SOC behövde är borta."], ["An operations restart wiped logs the SOC needed.", "En omstart från driften raderade loggar som SOC behövde."], { reopen: true }),
              io(["Hidden dependencies", "Dolda beroenden"], ["Asked which other jobs depend on accounts that are now disabled, nobody on either team can answer. There may be none, or several.", "När någon frågar vilka andra jobb som är beroende av konton som nu är spärrade kan ingen i något av teamen svara. Det kan vara inga, eller flera."], ["Nobody knows which other jobs depend on disabled accounts.", "Ingen vet vilka andra jobb som är beroende av spärrade konton."])
            ])
          ]
        }),
        facilitator: fac(
          ["Response actions are changes too. Make that explicit.", "Åtgärder är också ändringar. Gör det uttalat."],
          ["One shared action log with announced changes.", "En gemensam åtgärdslogg med meddelade ändringar."],
          [["Ask: who knew the rollback used that account?", "Fråga: vem visste att tillbakarullningen använde det kontot?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 600,
        title: L(["They used your outage", "De använde ert avbrott"]),
        twist: L(["The phishing lure quoted your own status page. The attacker watched the outage and wrote the email around it.", "Nätfiskemeddelandet citerade er egen driftstatussida. Angriparen bevakade avbrottet och skrev meddelandet kring det."]),
        twistKind: "cause",
        assumptionChallenged: L(["The phishing was a coincidence too.", "Nätfisket var också ett sammanträffande."]),
        reveals: ["hf-lure"],
        narrative: L([
          "{{time.T+600|clock}}. With the immediate threats under control, the incident-response partner looks again at the phishing email itself.\n\nThe email was well written and timely, which is why so many people clicked. The partner compares its wording with your own public messages from the afternoon.",
          "Klockan {{time.T+600|clock}}. Med de akuta hoten under kontroll tittar incidentpartnern igen på själva nätfiskemejlet.\n\nMejlet var välskrivet och kom vid rätt tidpunkt, vilket är varför så många klickade. Partnern jämför formuleringarna med era egna offentliga meddelanden från eftermiddagen."
        ]),
        injects: [
          inj("i7-1", 600, "threatIntel", "irRetainer", "medium", "confirmed", [
            "The phishing email copies the wording of your status update at {{time.T-15|clock}}, and was sent ten minutes after it. This group watches status pages for opportunities.",
            "Nätfiskemeddelandet kopierar formuleringen i er driftstatusuppdatering klockan {{time.T-15|clock}} och skickades tio minuter efter den. Den här gruppen bevakar driftstatussidor efter möjligheter."
          ], { reveals: ["hf-lure"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c7-timeline", type: "timeline",
          title: L(["How the fires lined up", "Hur bränderna föll på plats"]),
          data: () => ({ events: [
            { at: -25, kind: "inject", label: L(["Database change fails", "Databasändringen misslyckas"]) },
            { at: -15, kind: "inject", label: L(["Status page updated", "Driftstatussidan uppdateras"]) },
            { at: -5, kind: "attacker", label: L(["Phishing sent", "Nätfisket skickas"]) },
            { at: 25, kind: "attacker", label: L(["Admin enters password", "Administratören anger lösenordet"]) },
            { at: 35, kind: "attacker", label: L(["Admin account used", "Administratörskontot används"]) }
          ] })
        }],
        questions: {
          technical: [
            q("What should status updates say, and not say?", "Vad bör driftstatusuppdateringar säga, och inte säga?", ["itOps"]),
            q("How do you warn staff during the next outage?", "Hur varnar ni personalen under nästa avbrott?", ["socLead", "comms"]),
            q("Is your action log helping now?", "Hjälper er åtgärdslogg nu?", ["itOps"], "d6")
          ],
          executive: [
            q("Is transparency on the status page a risk?", "Är öppenheten på driftstatussidan en risk?", ["comms", "ciso"]),
            q("Should outages automatically trigger a phishing warning?", "Bör avbrott automatiskt utlösa en varning för nätfiske?", ["ciso"]),
            q("Would you rebalance your people differently in hour one, knowing this?", "Skulle ni ha fördelat personerna annorlunda den första timmen, med den här vetskapen?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("Customers rely on the status page.", "Kunderna förlitar sig på driftstatussidan.")],
        decision: dec("d7", "ciso", ["What do you change?", "Vad ändrar ni?"], [
          ["Keep the status page open, but send an automatic staff warning about themed phishing with every outage.", "Behåll en öppen driftstatussida, men skicka en automatisk varning till personalen om nätfiske med avbrottet som tema vid varje avbrott."],
          ["Make the status page less detailed.", "Gör driftstatussidan mindre detaljerad."],
          ["Leave the status page as it is: customers need the detail, and attackers will read it anyway.", "Låt statussidan vara som den är: kunderna behöver detaljerna, och angriparna läser den ändå."]
        ], {
          knowns: [["The attacker exploited your outage.", "Angriparen utnyttjade ert avbrott."]],
          uncertainties: [["Whether this will happen again.", "Om det här kommer att hända igen."]],
          tradeoffs: {
            operational: ["Less detail frustrates customers.", "Mindre detaljer frustrerar kunderna."],
            security: ["Staff warnings cost nothing.", "Varningar till personalen kostar ingenting."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["Transparency is worth keeping.", "Öppenheten är värd att behålla."]
          },
          evaluation: [["Keeps transparency and adds a staff warning", "Behåller öppenheten och lägger till en varning till personalen"]],
          pushback: {
            A: [
              pb(["Warning fatigue", "Varningströtthet"], ["You have several outages a month, so staff will get this warning again and again. Within weeks people stop reading it. Will the warning still work the tenth time, when it really matters?", "Ni har flera avbrott i månaden, så personalen kommer att få varningen om och om igen. Inom några veckor slutar folk läsa den. Fungerar varningen fortfarande den tionde gången, när den verkligen behövs?"]),
              pb(["A warning worth copying", "En varning värd att kopiera"], ["The SOC lead points out that an automatic message sent at every outage is a perfect template: the next phishing email could look exactly like your own warning. How will staff tell the real warning from a fake one?", "SOC-ansvarig påpekar att ett automatiskt meddelande vid varje avbrott är en perfekt mall: nästa nätfiskemejl kan se ut precis som er egen varning. Hur ska personalen skilja den riktiga varningen från en falsk?"]),
              pb(["Customers read it too", "Kunderna läser den också"], ["The warning reaches staff, but customers read the same status page and can be sent the same kind of lure. The service owner asks who warns them. Is protecting only your own people enough?", "Varningen når personalen, men kunderna läser samma driftstatussida och kan få samma slags lockbete. Tjänsteägaren frågar vem som varnar dem. Räcker det att bara skydda er egen personal?"])
            ],
            B: [
              pb(["The phones ring instead", "Telefonerna ringer i stället"], ["With less on the status page, customers call support to find out what is going on. The service owner says every outage now costs twice the support time. Who absorbs that, and was it worth it?", "Med mindre på driftstatussidan ringer kunderna supporten för att få veta vad som händer. Tjänsteägaren säger att varje avbrott nu kostar dubbelt så mycket supporttid. Vem tar den kostnaden, och var det värt det?"]),
              pb(["The lure needs one line", "Lockbetet behöver en rad"], ["The phishing email only needed to know that something was down. Even a vague status page says that. What does less detail actually stop?", "Nätfiskemejlet behövde bara veta att något låg nere. Även en vag driftstatussida säger det. Vad stoppar mindre detaljer egentligen?"]),
              pb(["Looking like hiding", "Att se ut att dölja"], ["Comms says customers have praised your open status page, and a sudden drop in detail will be read as hiding something. A trade magazine has already noticed the change. How do you explain it without mentioning the attack?", "Kommunikation säger att kunderna har berömt er öppna driftstatussida, och att plötsligt färre detaljer kommer att tolkas som att ni döljer något. En branschtidning har redan märkt förändringen. Hur förklarar ni det utan att nämna angreppet?"])
            ],
            C: [
              pb(["Next outage, same lure", "Nästa avbrott, samma lockbete"], ["The partner says this group watches status pages for a living. At your next outage the same kind of email will arrive, and nothing will be different. What do you do differently next time, if anything?", "Partnern säger att den här gruppen bevakar driftstatussidor som sitt levebröd. Vid ert nästa avbrott kommer samma slags mejl, och ingenting kommer att vara annorlunda. Vad gör ni annorlunda nästa gång, om något?"]),
              pb(["“So next time it's me again?”", "”Så nästa gång är det jag igen?”"], ["The administrator who entered their password asks whether anything will change, or whether the next person to click will simply be blamed too. Your decision says nothing will. What do you tell them?", "Administratören som angav sitt lösenord frågar om något kommer att ändras, eller om nästa person som klickar också bara kommer att få skulden. Ert beslut säger att ingenting ändras. Vad säger ni till hen?"]),
              pb(["Attackers read, staff don't", "Angriparna läser, personalen inte"], ["You accept that attackers will read the page anyway. Staff still do not know that outages bring themed phishing. Is “they'll read it anyway” a reason to do nothing for the people inside?", "Ni accepterar att angriparna ändå läser sidan. Personalen vet fortfarande inte att avbrott för med sig nätfiske med avbrottet som tema. Är ”de läser den ändå” ett skäl att inte göra något för dem som finns inne i organisationen?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Open page, staff warning", "Öppen sida, varning till personalen"], [
              io(["Reported in minutes", "Anmält på minuter"], ["In a trial run of the warning, staff report a test lure within minutes. The SOC says it is the fastest reporting they have seen.", "I en provkörning av varningen anmäler personalen ett testmejl inom några minuter. SOC säger att det är den snabbaste rapportering de har sett."], ["Staff reported a test lure within minutes of the trial warning.", "Personalen anmälde ett testmejl inom några minuter efter provvarningen."]),
              io(["Customers get lures", "Kunderna får lockbeten"], ["A customer forwards an email themed on your outage, asking them to “re-verify” their account. The warning protects staff; nobody warned the customers.", "En kund vidarebefordrar ett mejl med ert avbrott som tema, som ber hen att ”verifiera” sitt konto igen. Varningen skyddar personalen; ingen varnade kunderna."], ["A customer has forwarded a lure themed on your outage.", "En kund har vidarebefordrat ett lockbete med ert avbrott som tema."], { reopen: true, meters: { trust: -1 } }),
              io(["Whose message?", "Vems meddelande?"], ["Operations writes the status page; the SOC writes security warnings. Each assumes the other will send the automatic warning.", "Driften skriver driftstatussidan; SOC skriver säkerhetsvarningarna. Var och en utgår från att den andra skickar den automatiska varningen."], ["No one yet owns sending the automatic warning.", "Ingen äger ännu utskicket av den automatiska varningen."])
            ]),
            ir("i2", { notChosen: "A" }, ["No staff warning", "Ingen varning till personalen"], [
              io(["No new lures", "Inga nya lockbeten"], ["The partner sees no new outage-themed phishing this evening. It may have been a one-time opportunity.", "Partnern ser inget nytt nätfiske med avbrottet som tema i kväll. Det kanske var ett engångstillfälle."], ["No new outage-themed phishing was seen this evening.", "Inget nytt nätfiske med avbrottet som tema syntes i kväll."]),
              io(["Staff still unaware", "Personalen vet fortfarande inte"], ["A quick check by the partner shows most staff still do not know that outages bring themed phishing. The next outage will find them just as open.", "En snabb kontroll från partnern visar att de flesta i personalen fortfarande inte vet att avbrott för med sig nätfiske med avbrottet som tema. Nästa avbrott hittar dem lika öppna."], ["Most staff still do not know outages bring themed phishing.", "De flesta i personalen vet fortfarande inte att avbrott för med sig riktat nätfiske."], { reopen: true }),
              io(["“What changes?”", "”Vad ändras?”"], ["The administrator who entered their password asks what will be different next time. The answer they hear is not much.", "Administratören som angav sitt lösenord frågar vad som kommer att vara annorlunda nästa gång. Svaret hen får är: inte mycket."], ["The phished administrator has asked what will change.", "Den nätfiskade administratören har frågat vad som kommer att ändras."])
            ])
          ]
        }),
        facilitator: fac(
          ["Coincidences can be exploited. That's the nuance here.", "Sammanträffanden kan utnyttjas. Det är nyansen här."],
          ["An automatic phishing warning tied to outages.", "En automatisk varning för nätfiske kopplad till avbrott."],
          [["Ask: what did your status page say?", "Fråga: vad stod det på er driftstatussida?"]]
        )
      },
      {
        id: "p8",
        priority: 4,
        clock: 1080,
        title: L(["Running on empty", "På reservtanken"]),
        twist: L(["The same {{num.responders}} people have been working for {{num.hoursAwake}} hours. Mistakes are starting.", "Samma {{num.responders}} personer har arbetat i {{num.hoursAwake}} timmar. Misstagen börjar komma."]),
        twistKind: "impact",
        reconsider: { decision: "d5", pressure: { en: "Your team has been awake for {{num.hoursAwake}} hours. Looking back, was your order between the backups and the rollback the right one?", sv: "Ert team har varit vaket i {{num.hoursAwake}} timmar. I efterhand, var er ordning mellan säkerhetskopiorna och återställningen den rätta?" } },
        assumptionChallenged: L(["The team can keep going until it's over.", "Teamet kan hålla på tills det är över."]),
        narrative: L([
          "{{time.T+720|daypart|cap}}, {{time.T+720|clock}}. The customer service is back and the attacker is out, probably.\n\nThe same {{num.responders}} people have handled all three fires since the first alarm, without a proper break. Small mistakes are starting to appear, and tomorrow is a normal working day.",
          "{{time.T+720|daypart|cap}}, klockan {{time.T+720|clock}}. Kundtjänsten fungerar igen och angriparen är ute, troligen.\n\nSamma {{num.responders}} personer har hanterat alla tre bränderna sedan första larmet, utan ordentlig paus. Små misstag börjar dyka upp, och i morgon är en vanlig arbetsdag."
        ]),
        injects: [
          inj("i8-1", 1080, "employeeReport", "employee", "medium", "confirmed", [
            "A responder mistyped a firewall change and briefly blocked the VPN. They have been awake for {{num.hoursAwake}} hours.",
            "En av personerna i hanteringen skrev fel i en brandväggsändring och blockerade VPN en stund. De har varit vakna i {{num.hoursAwake}} timmar."
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What must be handed over, and to whom?", "Vad måste lämnas över, och till vem?", ["socLead", "itOps"]),
            q("What monitoring runs overnight?", "Vilken bevakning körs under natten?", ["socLead"]),
            q("Does the action log make handover possible?", "Gör åtgärdsloggen en överlämning möjlig?", ["itOps"], "d6")
          ],
          executive: [
            q("Who sends people home, and who takes over?", "Vem skickar hem folk, och vem tar över?", ["incidentCommander", "hr"]),
            q("How do you staff for three fires next time?", "Hur bemannar ni för tre bränder nästa gång?", ["cio", "ciso"]),
            q("Which first-hour decision would you most like to have made differently?", "Vilket beslut från den första timmen skulle ni helst ha fattat annorlunda?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Nobody else knows the systems as well.", "Ingen annan känner systemen lika väl.")],
        decision: dec("d8", "incidentCommander", ["What do you do with the team?", "Vad gör ni med teamet?"], [
          ["Hand over to the response partner and a fresh shift, send the team home and resume in the morning.", "Lämna över till incidentpartnern och ett nytt skift, skicka hem teamet och återuppta på morgonen."],
          ["Keep a skeleton crew overnight.", "Behåll en minimal bemanning under natten."],
          ["Keep going until everything is closed.", "Fortsätt tills allt är stängt."]
        ], {
          knowns: [["The team is exhausted.", "Teamet är utmattat."]],
          uncertainties: [["Whether the attacker is truly out.", "Om angriparen verkligen är ute."]],
          tradeoffs: {
            operational: ["A handover risks losing context.", "En överlämning riskerar att sammanhang går förlorat."],
            security: ["Exhausted people make dangerous mistakes.", "Utmattade människor gör farliga misstag."],
            legal: ["Working-time rules apply in a crisis too.", "Arbetstidsreglerna gäller även i en kris."],
            reputational: ["Burnt-out staff leave.", "Utbränd personal slutar."]
          },
          evaluation: [["Plans rest and handover deliberately", "Planerar vila och överlämning medvetet"]],
          pushback: {
            A: [
              pb(["The new shift is lost", "Det nya skiftet är vilset"], ["One of the fresh shift says: “I don't know which accounts are disabled, or why.” The handover notes are patchy because nobody had time to write them. Do you keep one of the tired team back to explain, and for how long?", "En i det nya skiftet säger: ”Jag vet inte vilka konton som är spärrade, eller varför.” Överlämningsanteckningarna är bristfälliga eftersom ingen hade tid att skriva dem. Behåller ni någon från det trötta teamet för att förklara, och hur länge?"]),
              pb(["Probably out", "Troligen ute"], ["The attacker is only probably out. Overnight, the partner and a fresh shift who do not know your systems will be the ones to notice if that is wrong. Who on that shift has the authority to act if it is?", "Angriparen är bara troligen ute. Under natten är det partnern och ett nytt skift som inte känner era system som ska märka om det är fel. Vem i det skiftet har mandat att agera om det är så?"]),
              pb(["“I'm not leaving”", "”Jag går inte hem”"], ["The SOC analyst refuses to go home: “I'm the only one who knows what we found.” Some of that is true. Do you order them home, knowing what goes with them?", "SOC-analytikern vägrar gå hem: ”Jag är den enda som vet vad vi har hittat.” En del av det stämmer. Beordrar ni hen hem, när ni vet vad som försvinner med hen?"])
            ],
            B: [
              pb(["Who is the skeleton?", "Vilka är den minimala bemanningen?"], ["The skeleton crew can only come from the same {{num.responders}} exhausted people, and the volunteers are the most tired. Whom do you keep, and who decides they are fit to work?", "Den minimala bemanningen kan bara komma från samma {{num.responders}} utmattade personer, och de som anmäler sig är de tröttaste. Vilka behåller ni, och vem avgör att de är i skick att arbeta?"]),
              pb(["Tomorrow is a working day", "I morgon är en vanlig arbetsdag"], ["Whoever stays overnight will be expected at work in the morning, with no sleep. HR asks who covers their day. Have you solved the problem, or just moved it to tomorrow?", "Den som stannar under natten förväntas vara på jobbet på morgonen, utan sömn. HR frågar vem som täcker deras dag. Har ni löst problemet, eller bara flyttat det till i morgon?"]),
              pb(["No second check", "Ingen som dubbelkollar"], ["A skeleton crew means people working alone at night with nobody to check their changes. The firewall typo that blocked the VPN happened with others still awake. Who reviews what the night crew does?", "Minimal bemanning innebär att personer arbetar ensamma i natt utan någon som kontrollerar deras ändringar. Skrivfelet i brandväggen som blockerade VPN hände medan andra fortfarande var vakna. Vem granskar vad nattbemanningen gör?"])
            ],
            C: [
              pb(["A near miss", "Nära ögat"], ["An hour later a responder almost re-enables a disabled account by mistake. A colleague catches it by luck. How many more mistakes are you willing to risk?", "En timme senare återaktiverar en av personerna nästan ett spärrat konto av misstag. En kollega upptäcker det av ren tur. Hur många fler misstag är ni beredda att riskera?"]),
              pb(["HR says stop", "HR säger stopp"], ["HR says the hours already break working-time rules and must be reported. Continuing means overriding HR on the record. Do you, and who signs it?", "HR säger att timmarna redan bryter mot arbetstidsreglerna och måste rapporteras. Att fortsätta innebär att köra över HR, och det dokumenteras. Gör ni det, och vem skriver under?"]),
              pb(["When is everything closed?", "När är allt stängt?"], ["Nobody can say what “closed” means: the attacker is only probably out, and the database still needs checking. Without an end point, keeping going has no end either. When do you stop?", "Ingen kan säga vad ”stängt” betyder: angriparen är bara troligen ute, och databasen behöver fortfarande kontrolleras. Utan en slutpunkt har det inte heller något slut att fortsätta. När slutar ni?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Handover and home", "Överlämning och hem"], [
              io(["A clean handover", "En ren överlämning"], ["The partner and the fresh shift take over, and the team goes home. The first hour of the new shift is quiet.", "Partnern och det nya skiftet tar över, och teamet går hem. Den första timmen för det nya skiftet är lugn."], ["The fresh shift has taken over and the team has gone home.", "Det nya skiftet har tagit över och teamet har gått hem."]),
              io(["The shift is lost", "Skiftet är vilset"], ["The fresh shift does not know which accounts are disabled or why, and the handover notes are patchy. They are already ringing a responder who has just got home.", "Det nya skiftet vet inte vilka konton som är spärrade eller varför, och överlämningsanteckningarna är bristfälliga. De ringer redan en av personerna som just har kommit hem."], ["The fresh shift lacks a clear record of which accounts are disabled.", "Det nya skiftet saknar en tydlig bild av vilka konton som är spärrade."], { reopen: true }),
              io(["An odd alert", "Ett konstigt larm"], ["Shortly after handover an alert fires that the fresh shift cannot explain. It might be nothing; nobody who would know is awake.", "Strax efter överlämningen går ett larm som det nya skiftet inte kan förklara. Det kan vara ingenting; ingen som skulle veta är vaken."], ["An unexplained alert is waiting for the morning team.", "Ett oförklarat larm väntar på morgonteamet."])
            ]),
            ir("i2", { notChosen: "A" }, ["The tired team stays", "Det trötta teamet stannar"], [
              io(["They pull through", "De tar sig igenom"], ["The team closes several open items over the next hours without new errors. Perhaps they had more left than anyone thought.", "Teamet stänger flera öppna punkter under de följande timmarna utan nya fel. Kanske hade de mer kvar än någon trodde."], ["The team closed several open items without new errors.", "Teamet stängde flera öppna punkter utan nya fel."]),
              io(["A near miss", "Nära ögat"], ["A responder almost re-enables one of the disabled accounts by mistake. A colleague catches it by luck.", "En av personerna återaktiverar nästan ett av de spärrade kontona av misstag. En kollega upptäcker det av ren tur."], ["A tired responder nearly re-enabled a disabled account.", "En trött person återaktiverade nästan ett spärrat konto."], { reopen: true }),
              io(["HR on record", "HR dokumenterar"], ["HR records that the hours already break working-time rules. It does not stop the work, but someone will have to answer for it.", "HR dokumenterar att timmarna redan bryter mot arbetstidsreglerna. Det stoppar inte arbetet, men någon kommer att få stå till svars för det."], ["HR has recorded a breach of working-time rules.", "HR har dokumenterat ett brott mot arbetstidsreglerna."])
            ])
          ]
        }),
        facilitator: fac(
          ["End on people and capacity. This is where many plans are silent.", "Avsluta med människor och kapacitet. Det är här många planer är tysta."],
          ["A structured handover and rest for the team.", "En strukturerad överlämning och vila för teamet."],
          [["Ask: does your plan say when people must rest?", "Fråga: säger er plan när folk måste vila?"]]
        )
      }
    ],

    resolution: {
      type: "resolved",
      text: L([
        "The outage is fixed, the attacker is removed before the backups go, and the organisation adopts single incident command, a shared action log and planned rest.",
        "Avbrottet åtgärdas, angriparen avlägsnas innan säkerhetskopiorna försvinner, och organisationen inför en enda incidentledning, en gemensam åtgärdslogg och planerad vila."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Visibility is not priority; quiet incidents can be the worst.", "Synlighet är inte prioritet; tysta incidenter kan vara de värsta."]),
        L(["One incident commander, even when leaders outrank them.", "En incidentledare, även när cheferna har högre rang."]),
        L(["Coincidences happen, and attackers exploit them.", "Sammanträffanden händer, och angripare utnyttjar dem."]),
        L(["Response actions are changes; coordinate them.", "Åtgärder är ändringar; samordna dem."])
      ],
      assumptionsVsReality: [
        avr(["One attack behind everything.", "Ett angrepp bakom allt."], ["The outage was a failed change.", "Avbrottet var en misslyckad ändring."], "p2"),
        avr(["Phishing was a nuisance.", "Nätfisket var ett irritationsmoment."], ["It delivered privileged access.", "Det gav privilegierad åtkomst."], "p3"),
        avr(["Everyone knows who leads.", "Alla vet vem som leder."], ["Two leaders gave conflicting orders.", "Två chefer gav motstridiga order."], "p4")
      ],
      strengthsToLookFor: [
        L(["Naming a single commander early", "Att tidigt utse en enda ledare"]),
        L(["Moving people off the visible fire", "Att flytta personer från den synliga branden"]),
        L(["Protecting backups first", "Att skydda säkerhetskopiorna först"])
      ],
      commonGaps: [
        L(["Everyone on the customer outage", "Alla på kundavbrottet"]),
        L(["Leaders giving orders directly", "Chefer som ger order direkt"]),
        L(["No plan for rest", "Ingen plan för vila"])
      ],
      suggestedActions: [
        act(["Define incident command that applies across concurrent incidents.", "Definiera en incidentledning som gäller för samtidiga incidenter."], "incidentCommander", "high"),
        act(["Keep a shared action log during incidents.", "För en gemensam åtgärdslogg under incidenter."], "itOps", "medium"),
        act(["Send an automatic phishing warning with every outage notice.", "Skicka en automatisk varning för nätfiske vid varje meddelande om avbrott."], "comms", "medium"),
        act(["Arrange surge capacity with a response partner.", "Ordna förstärkning med en incidentpartner."], "ciso", "high"),
        act(["Plan shifts and rest for long incidents.", "Planera skift och vila för långa incidenter."], "hr", "medium")
      ]
    }
  });
})();
