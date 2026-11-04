/*
 * b16-restore-day.js — "Restore Day" (branching, recovery test).
 *
 * A planned Saturday test: restore the ERP system from backup, as the
 * continuity plan promises, within four hours. No attacker, no customers
 * affected, very revealing. Spine: where to restore → hour one → hour four →
 * the key → hour eleven → the report → the board → the fix order → the next
 * test → what changes. Break-away at § "The report": reporting green.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, line, pg, ask, opt, pb, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b16-restore-day",
    version: 1,
    format: "branching",
    category: "recovery-test",
    archetype: "benign-lookalike",
    emblem: "restore-day",
    title: L(["Restore Day", "Återställningsdagen"]),
    summary: L([
      "A calm Saturday, a planned test: restore the ERP system from backup within the four hours the continuity plan promises. Nobody is attacking you. That is what makes it the perfect day to find out the truth.",
      "En lugn lördag, ett planerat test: återställ affärssystemet från säkerhetskopia inom de fyra timmar som kontinuitetsplanen lovar. Ingen angriper er. Det är just därför det är den perfekta dagen att ta reda på sanningen."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Run a recovery test safely, without harming production", "Genomföra ett återställningstest säkert, utan att skada produktionen"]), teaser: L(["Practising without breaking things", "Att öva utan att förstöra"]) },
      { id: "lo2", text: L(["Find the hidden dependencies in a restore", "Hitta de dolda beroendena i en återställning"]), teaser: L(["What the plan forgot", "Vad planen glömde"]) },
      { id: "lo3", text: L(["Report recovery capability honestly to leadership", "Rapportera återställningsförmågan ärligt till ledningen"]), teaser: L(["Green, amber or true", "Grönt, gult eller sant"]) },
      { id: "lo4", text: L(["Turn findings into a funded improvement plan", "Göra fynden till en finansierad förbättringsplan"]), teaser: L(["From findings to fixes", "Från fynd till åtgärder"]) }
    ],
    mitre: ["T1490"],
    frameworks: {
      nistCsf: ["GV.OV", "ID.IM", "PR.DS", "PR.IR", "RC.RP", "RC.CO"],
      iso27001: ["A.5.29", "A.5.30", "A.8.13", "A.8.14", "A.8.31", "A.8.32"]
    },
    constraints: { startWindow: "weekend", startTime: "08:00" },
    actor: { types: ["unknown"], motivation: L(["None: a planned recovery test", "Ingen: ett planerat återställningstest"]), capability: "low" },
    variables: {
      rto: { min: 4, max: 4 },
      actual: { min: 14, max: 30 },
      days: { min: 6, max: 12 }
    },
    roles: ["incidentCommander", "cio", "itOps", "cloudLead", "serviceOwner", "ciso", "cfo", "ceo", "supplierManager"],

    flags: {
      testMoved: L(["Restore test moved out of isolation", "Återställningstestet flyttat ut ur isoleringen"]),
      isolatedTest: L(["Restored into an isolated environment", "Återställt i en isolerad miljö"]),
      logFindings: L(["Findings logged as they happened", "Fynd dokumenterade löpande"]),
      measuredReal: L(["Measured the real restore time", "Mätte den verkliga återställningstiden"]),
      keysFound: L(["Backup keys recovered properly", "Säkerhetskopieringsnycklar återställda korrekt"]),
      honestReport: L(["Reported the real numbers", "Rapporterade de verkliga siffrorna"]),
      rtoUpdated: L(["Recovery target updated and funded", "Återställningsmålet uppdaterat och finansierat"]),
      testPlanned: L(["Regular tests scheduled", "Regelbundna tester inplanerade"]),
      reportedGreen: L(["Reported the test as passed", "Rapporterade testet som godkänt"])
    },

    start: "c1",
    pages: [
      pg("c1", ["Saturday, 08:00", "Lördag, 08.00"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. Coffee, pastries and a whiteboard. Today the team will do something it has only ever described on paper: restore the ERP system from backup, from scratch, and time it.\n\nThe continuity plan approved by the board says the ERP system can be back within {{num.rto}} hours. Nobody in the room has ever seen that happen.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Kaffe, bullar och en whiteboard. I dag ska teamet göra något som det bara har beskrivit på papper: återställa affärssystemet från säkerhetskopia, från grunden, och ta tid på det.\n\nKontinuitetsplanen som styrelsen godkänt säger att affärssystemet kan vara tillbaka inom {{num.rto}} timmar. Ingen i rummet har någonsin sett det hända."
      ], {
        discuss: [q("What would make today a success, even if the restore fails?", "Vad skulle göra dagen till en framgång, även om återställningen misslyckas?", ["incidentCommander"])],
        facilitator: { notes: L(["Low stakes, high learning. Reward findings, not a green result.", "Låg insats, mycket lärande. Belöna fynd, inte ett grönt resultat."]) },
        choice: ask(["Where do you restore to?", "Var återställer ni till?"], ["Restores into an isolated environment so the test cannot touch production.", "Återställer i en isolerad miljö så att testet inte kan påverka produktionen."], [
          opt(["An isolated network with no route to production", "Ett isolerat nätverk utan väg till produktionen"], "c2", ["Safe. Takes an hour to prepare.", "Säkert. Tar en timme att förbereda."], {
            set: "isolatedTest",
            pushback: [
              pb(["The hour becomes a morning", "Timmen blir en förmiddag"], ["Building the isolated network needs a firewall change, and the only person who can approve it is off today. The team stands around with coffee while the clock runs. Do you bend change control for a test, or lose the morning waiting?", "Att bygga det isolerade nätverket kräver en brandväggsändring, och den enda som kan godkänna den är ledig i dag. Teamet står med kaffet medan klockan går. Tänjer ni på ändringsprocessen för ett test, eller tappar ni förmiddagen på att vänta?"]),
              pb(["Nothing like a real restore", "Inte som en verklig återställning"], ["{{person.cloudLead.name}} objects: in a real incident you would restore into production, not a clean lab with nothing around it. A sealed room may make everything look easier than it is. What exactly are you measuring if the environment is nothing like the real one?", "{{person.cloudLead.name}} invänder: vid en verklig incident återställer ni till produktionen, inte till ett rent labb där inget finns runtomkring. Ett förseglat rum kan få allt att se enklare ut än det är. Vad mäter ni egentligen om miljön inte liknar den riktiga?"]),
              pb(["A hole in the isolation", "Ett hål i isoleringen"], ["The backup server cannot reach a network with no routes either. Someone suggests opening one temporary route from it, just for today. Is an isolated network with a hole in it still isolated, and who makes sure the hole is closed tonight?", "Backupservern når inte heller ett nätverk utan vägar. Någon föreslår att öppna en tillfällig väg från den, bara för i dag. Är ett isolerat nätverk med ett hål i fortfarande isolerat, och vem ser till att hålet stängs i kväll?"])
            ]
          }),
          opt(["The existing staging environment", "Den befintliga testmiljön"], "c2", ["Ready now. It is connected to everything.", "Klar nu. Den är ansluten till allt."], {
            pushback: [
              pb(["Staging is not empty", "Testmiljön är inte tom"], ["The development team is testing Monday's release in staging this weekend. Overwriting it with a restored ERP system will wipe their work. Do you take staging from them anyway, or wait until they are done?", "Utvecklingsteamet testar måndagens release i testmiljön den här helgen. Att skriva över den med ett återställt affärssystem raderar deras arbete. Tar ni testmiljön från dem ändå, eller väntar ni tills de är klara?"]),
              pb(["It thinks it is production", "Den tror att den är produktion"], ["{{person.ciso.name}} asks what the restored server will be able to reach: staging shares the network, the mail relay and the service accounts with production. A restored copy does not know it is a copy. Who checks what it does when it starts?", "{{person.ciso.name}} frågar vad den återställda servern kommer att kunna nå: testmiljön delar nätverk, e-postrelä och tjänstekonton med produktionen. En återställd kopia vet inte att den är en kopia. Vem kontrollerar vad den gör när den startar?"]),
              pb(["Will the auditor accept it?", "Godtar revisorn det?"], ["The internal auditor who asked for this test says a restore into a shared environment with production accounts is not a controlled test. The hour you saved may cost you the result. Is a test the auditor might reject worth running at all?", "Internrevisorn som bad om testet säger att en återställning i en delad miljö med produktionskonton inte är ett kontrollerat test. Timmen ni sparade kan kosta er resultatet. Är ett test som revisorn kanske underkänner värt att köra alls?"])
            ]
          }),
          opt(["Just talk it through instead of restoring", "Gå bara igenom det muntligt i stället för att återställa"], "c2", ["Safe, and you will learn very little.", "Säkert, och ni kommer att lära er väldigt lite."], {
            pushback: [
              pb(["The board was promised a test", "Styrelsen lovades ett test"], ["The continuity plan says the restore is tested, and the board was told it would happen this weekend. A conversation is not what was promised. Who tells the risk committee that the test was a meeting?", "Kontinuitetsplanen säger att återställningen testas, och styrelsen fick veta att det skulle ske den här helgen. Ett samtal är inte vad som utlovades. Vem berättar för riskutskottet att testet var ett möte?"]),
              pb(["Everyone agrees", "Alla håller med"], ["Two hours in, the walkthrough has gone smoothly: every step on paper has an owner and a time. Then {{person.itOps.name}} admits that nobody here has ever run a full restore of this system. Is a plan that sounds right in the room any evidence that it works?", "Efter två timmar har genomgången gått smidigt: varje steg på papperet har en ägare och en tid. Sedan erkänner {{person.itOps.name}} att ingen här någonsin har gjort en fullständig återställning av systemet. Är en plan som låter rätt i rummet något bevis för att den fungerar?"]),
              pb(["A booked Saturday", "En bokad lördag"], ["Five people gave up their Saturday, and the restore hardware was reserved for today only. If you talk it through, the next free slot is months away. Can you justify sending everyone home with no measurement at all?", "Fem personer har offrat sin lördag, och hårdvaran för återställningen är bokad bara i dag. Om ni bara pratar igenom det dröjer nästa lediga tillfälle flera månader. Kan ni motivera att skicka hem alla utan någon mätning alls?"])
            ]
          })
        ])
      }),

      pg("c2", ["Hour one", "Timme ett"], [
        "{{time.T+60|clock}}. {{person.itOps.name}} opens the backup console to choose a restore point and goes quiet. The most recent full backup of the ERP database is {{num.days}} days old.\n\nThe nightly backups have been failing since then. Each failure sent an email. The emails went to a shared mailbox that nobody has opened since the person who set it up left.",
        "Klockan {{time.T+60|clock}}. {{person.itOps.name}} öppnar backupkonsolen för att välja en återställningspunkt och blir tyst. Den senaste fullständiga säkerhetskopian av affärssystemets databas är {{num.days}} dagar gammal.\n\nDe nattliga säkerhetskopieringarna har misslyckats sedan dess. Varje misslyckande skickade ett mejl. Mejlen gick till en gemensam brevlåda som ingen har öppnat sedan personen som satte upp den slutade."
      ], {
        variants: [vr("!isolatedTest", [
          "{{time.T+60|clock}}. The restore into staging has started, and {{person.itOps.name}} notices two things. The most recent full backup is {{num.days}} days old, because the nightly jobs have been failing silently.\n\nAnd the restored server has come up with the production hostname on a connected network. Its scheduled jobs have started running, including the one that sends invoices to customers.",
          "Klockan {{time.T+60|clock}}. Återställningen till testmiljön har startat, och {{person.itOps.name}} lägger märke till två saker. Den senaste fullständiga säkerhetskopian är {{num.days}} dagar gammal, eftersom de nattliga jobben har misslyckats i tysthet.\n\nOch den återställda servern har startat med produktionens värdnamn på ett anslutet nätverk. Dess schemalagda jobb har börjat köras, bland annat det som skickar fakturor till kunderna."
        ], ["Because you restored into a connected environment, the test is touching the real world.", "Eftersom ni återställde i en ansluten miljö påverkar testet den verkliga världen."])],
        injects: [
          inj("b16-1", 60, "backupReport", "backupSystem", "high", "confirmed", [
            "ERP database: last successful full backup {{num.days}} days ago. Nightly jobs since: failed (“insufficient space on target”). Notifications sent to backup-alerts@{{org.domain}}.",
            "Affärssystemets databas: senaste lyckade fullständiga säkerhetskopia för {{num.days}} dagar sedan. Nattliga jobb sedan dess: misslyckade (”otillräckligt utrymme på målet”). Aviseringar skickade till backup-alerts@{{org.domain}}."
          ], { tests: ["lo2"] })
        ],
        choice: ask(["How do you continue?", "Hur fortsätter ni?"], ["Keeps testing and writes down every finding as it happens.", "Fortsätter testa och skriver ner varje fynd när det inträffar."], [
          opt(["Keep going and log every finding", "Fortsätt och dokumentera varje fynd"], "l1", ["The test is already worth it.", "Testet är redan värt det."], {
            set: "logFindings",
            pushback: [
              pb(["Production stays exposed", "Produktionen förblir sårbar"], ["While you keep testing, tonight's backup job will fail again, as it has for {{num.days}} days. Production has no fresh backup, and writing that down does not change it. Do you really leave a live gap open until the test is over?", "Medan ni fortsätter testa kommer kvällens säkerhetskopiering att misslyckas igen, precis som i {{num.days}} dagar. Produktionen saknar en färsk säkerhetskopia, och att skriva ner det ändrar ingenting. Låter ni verkligen en öppen lucka i produktionen stå kvar tills testet är klart?"]),
              pb(["A name next to the finding", "Ett namn bredvid fyndet"], ["Someone asks whose name goes next to the mailbox finding. The person who set it up has left, and the manager who should have taken it over is in the room. Do you log findings without names, or let the log become a list of who failed?", "Någon frågar vems namn som ska stå bredvid fyndet om brevlådan. Personen som satte upp den har slutat, och chefen som borde ha tagit över den sitter i rummet. Dokumenterar ni fynd utan namn, eller låter ni loggen bli en lista över vem som brast?"]),
              pb(["Testing the wrong thing?", "Testar ni fel sak?"], ["{{person.serviceOwner.name}} asks what the test is worth now: you are restoring data {{num.days}} days old, which nobody would accept in a real incident. Is carrying on with this restore point a real test, or a test of the wrong thing?", "{{person.serviceOwner.name}} frågar vad testet är värt nu: ni återställer data som är {{num.days}} dagar gammal, något ingen skulle godta vid en verklig incident. Är det ett riktigt test att fortsätta med den här återställningspunkten, eller ett test av fel sak?"])
            ]
          }),
          opt(["Fix the backup job now, mid-test", "Rätta säkerhetskopieringsjobbet nu, mitt i testet"], "l1", ["Tempting. You will lose the measurement.", "Lockande. Ni förlorar mätningen."], {
            pushback: [
              pb(["Space means deleting", "Utrymme betyder radering"], ["The job failed for lack of space on the backup target. Freeing space means deleting older backups, possibly the one you are restoring from right now. Who decides which backups to delete, on a Saturday, in the middle of a test?", "Jobbet misslyckades på grund av utrymmesbrist på målet. Att frigöra utrymme innebär att radera äldre säkerhetskopior, kanske just den ni återställer från nu. Vem bestämmer vilka säkerhetskopior som raderas, en lördag, mitt i ett test?"]),
              pb(["The clock stops meaning anything", "Klockan slutar betyda något"], ["The point of today was to time the restore against the plan. If the team spends the morning on the backup job, the measured time will include a repair nobody would do mid-incident. What will you tell the board: that you fixed something, or how long a restore takes?", "Poängen med dagen var att ta tid på återställningen mot planen. Om teamet lägger förmiddagen på säkerhetskopieringen kommer den uppmätta tiden att innehålla en reparation som ingen skulle göra mitt i en incident. Vad säger ni till styrelsen: att ni rättade något, eller hur lång tid en återställning tar?"]),
              pb(["An unapproved change", "En ogodkänd ändring"], ["Changing a production backup job on a weekend is a production change, and it has not been through change control. If the first new backup slows or disrupts production, it is your test that broke it. Do you make the change anyway?", "Att ändra ett säkerhetskopieringsjobb i produktion en helg är en produktionsändring, och den har inte gått genom ändringshanteringen. Om den första nya säkerhetskopieringen saktar ner eller stör produktionen är det ert test som orsakade det. Gör ni ändringen ändå?"])
            ]
          }),
          opt(["Stop and escalate to the CIO", "Avbryt och eskalera till IT-chefen"], "c3b", ["Understandable, on a Saturday.", "Begripligt, en lördag."], {
            pushback: [
              pb(["Stopped or paused?", "Avbrutet eller pausat?"], ["The moment someone says “stop”, two people start packing up. If the test is to go on, getting the momentum back will cost an hour. Did you stop the test or pause it, and does the team know which?", "I samma stund som någon säger ”avbryt” börjar två personer packa ihop. Om testet ska fortsätta kostar det en timme att få fart igen. Avbröt ni testet eller pausade ni det, och vet teamet vilket?"]),
              pb(["Is this a leadership matter?", "Är det här en ledningsfråga?"], ["{{person.itOps.name}} feels singled out: calling the CIO about a backup finding on a Saturday makes it sound like an incident, and it is their team that runs the backups. Is this a finding for the test log or a problem for leadership, and what does the call say about the team?", "{{person.itOps.name}} känner sig utpekad: att ringa IT-chefen om ett backupfynd en lördag får det att låta som en incident, och det är hens team som sköter säkerhetskopieringen. Är det här ett fynd för testloggen eller ett problem för ledningen, och vad säger samtalet om teamet?"]),
              pb(["What are you asking for?", "Vad ber ni om?"], ["Escalating raises a fair question: if production has no fresh backup, should the team drop the test and protect the live system instead? Nobody has framed it that way yet. What exactly are you asking the CIO to decide?", "Eskaleringen väcker en rimlig fråga: om produktionen saknar en färsk säkerhetskopia, borde teamet släppa testet och skydda den skarpa miljön i stället? Ingen har formulerat det så än. Vad exakt ber ni IT-chefen att besluta?"])
            ]
          })
        ])
      }),

      pg("l1", ["The offsite copy", "Kopian utanför huset"], [
        "Maybe the offsite copy is newer. It is stored with a vault provider and can be retrieved, according to the plan, “on request”.\n\n{{person.supplierManager.name}} calls the provider. Weekend retrieval needs a courier, takes six hours, and costs extra. The copy is from the same failing job, so it is also {{num.days}} days old.",
        "Kanske är kopian utanför huset nyare. Den förvaras hos en leverantör och kan enligt planen hämtas ”på begäran”.\n\n{{person.supplierManager.name}} ringer leverantören. Hämtning på helgen kräver ett bud, tar sex timmar och kostar extra. Kopian kommer från samma misslyckade jobb, så den är också {{num.days}} dagar gammal."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you note?", "Vad noterar ni?"], ["Records that the offsite copy adds hours and no freshness.", "Noterar att kopian utanför huset lägger till timmar men ingen aktualitet."], [
          opt(["Record it as a finding", "Dokumentera det som ett fynd"], "c3", ["Another line on the whiteboard.", "Ytterligare en rad på whiteboarden."], {
            set: "logFindings",
            pushback: [
              pb(["More than one line", "Mer än en rad"], ["The plan promised offsite retrieval “on request”. Writing it up as a finding sounds modest; in practice the plan's fallback does not exist at weekends. Is this really one line on a whiteboard, or a reason to question the plan's other promises now?", "Planen lovade hämtning utanför huset ”på begäran”. Att skriva det som ett fynd låter blygsamt; i praktiken finns planens reserv inte på helger. Är det här verkligen en rad på whiteboarden, eller ett skäl att redan nu ifrågasätta planens andra löften?"]),
              pb(["A partner of many years", "En partner sedan många år"], ["{{person.supplierManager.name}} points out the vault provider is a long-standing partner, and the contract never promised weekend speed. A written finding may sour the renewal. Do you name the provider in the finding, or describe it vaguely?", "{{person.supplierManager.name}} påpekar att leverantören är en partner sedan många år, och att avtalet aldrig lovade snabbhet på helger. Ett skriftligt fynd kan försämra förnyelsen. Namnger ni leverantören i fyndet, eller beskriver ni det vagt?"]),
              pb(["Never actually tested", "Aldrig faktiskt testat"], ["By noting the delay and moving on, you never test the offsite retrieval at all. Nobody knows whether the courier would turn up, or whether the media can even be read. Is noting a delay the same as knowing the copy works?", "Genom att notera fördröjningen och gå vidare testar ni aldrig hämtningen alls. Ingen vet om budet skulle dyka upp, eller om mediet ens går att läsa. Är det samma sak att notera en fördröjning som att veta att kopian fungerar?"])
            ]
          }),
          opt(["Order the courier anyway", "Beställ budet ändå"], "c3", ["Six hours, for the same data.", "Sex timmar, för samma data."], {
            pushback: [
              pb(["Who signs the order?", "Vem skriver under beställningen?"], ["Finance asks why a weekend courier is being paid for a copy you already know is {{num.days}} days old. Nobody here can approve the extra cost on a Saturday. Who signs it, and what will you say it was for?", "Ekonomi frågar varför ni betalar för ett helgbud för en kopia som ni redan vet är {{num.days}} dagar gammal. Ingen här kan godkänna extrakostnaden en lördag. Vem skriver under, och vad säger ni att den var till för?"]),
              pb(["Split attention", "Splittrad uppmärksamhet"], ["The courier arrives in six hours at the earliest. The team must either wait or carry on with the onsite restore and treat the offsite copy as a side test. Doing both splits five tired people. Which one gets the attention?", "Budet kommer tidigast om sex timmar. Teamet måste antingen vänta eller fortsätta med återställningen på plats och se kopian som ett sidotest. Att göra båda splittrar fem trötta personer. Vilket får uppmärksamheten?"]),
              pb(["Company data in a car", "Företagets data i en bil"], ["The backup media will travel in a courier's car to an office that is closed on Saturdays. Nobody has arranged who signs for it or where it is kept tonight. Is a full copy of your company data on the road worth a result you can already predict?", "Backupmediet ska åka i ett buds bil till ett kontor som är stängt på lördagar. Ingen har ordnat vem som kvitterar det eller var det förvaras i natt. Är en fullständig kopia av företagets data på vägarna värd ett resultat ni redan kan förutse?"])
            ]
          })
        ])
      }),

      pg("c3", ["Hour four", "Timme fyra"], [
        "{{time.T+240|clock}}. The plan's recovery time has passed. The restore is at 30 percent. The data is moving across an old network link at a fifth of the speed everyone assumed.\n\n{{person.cloudLead.name}} does the arithmetic on the whiteboard. At this rate, the database alone will take most of the day, and nothing else in the plan has started yet.",
        "Klockan {{time.T+240|clock}}. Planens återställningstid har passerat. Återställningen är på 30 procent. Datan går över en gammal nätverksförbindelse med en femtedel av den hastighet alla hade antagit.\n\n{{person.cloudLead.name}} räknar på whiteboarden. I den här takten tar enbart databasen större delen av dagen, och inget annat i planen har ens börjat."
      ], {
        chart: { id: "b16-progress", type: "line", title: L(["Restore progress", "Återställningens förlopp"]), unit: L(["percent", "procent"]), caption: L(["Hours since the restore started.", "Timmar sedan återställningen startade."]), data: line(["Restored", "Återställt"], 0, 4, 1, (x) => x * 7.5, "hours") },
        choice: ask(["Do you keep going?", "Fortsätter ni?"], ["Keeps going to measure the real number, however embarrassing.", "Fortsätter för att mäta den verkliga siffran, hur pinsam den än blir."], [
          opt(["Keep going and measure the real time", "Fortsätt och mät den verkliga tiden"], "c4", ["A long day and a true number.", "En lång dag och en sann siffra."], {
            set: "measuredReal",
            pushback: [
              pb(["Past midnight", "Efter midnatt"], ["At this rate the team will be here late tonight, perhaps past midnight. Two people have family plans, and overtime for a test was never approved. Who stays, who goes, and does the measurement survive a smaller team?", "I den här takten blir teamet kvar sent i kväll, kanske efter midnatt. Två personer har planer med familjen, och övertid för ett test har aldrig godkänts. Vem stannar, vem går, och klarar mätningen ett mindre team?"]),
              pb(["The link is shared", "Förbindelsen är delad"], ["The network team says the restore has filled the old link for hours, and other weekend jobs that use it are running late. They want the restore throttled, which would make the measured time even worse. Do you keep the link to yourselves?", "Nätverksteamet säger att återställningen har fyllt den gamla förbindelsen i timmar, och att andra helgjobb som använder den blir försenade. De vill strypa återställningen, vilket skulle göra den uppmätta tiden ännu sämre. Behåller ni förbindelsen för er själva?"]),
              pb(["A number that will follow you", "En siffra som följer er"], ["Someone mutters that a measured all-day restore will be quoted in every budget meeting for years, against IT. An estimate would tell almost the same story with less noise. Is the exact number really worth what it will cost the team?", "Någon muttrar att en uppmätt återställning som tar hela dagen kommer att citeras på varje budgetmöte i flera år, mot IT. En uppskattning skulle berätta nästan samma sak med mindre oväsen. Är den exakta siffran verkligen värd vad den kostar teamet?"])
            ]
          }),
          opt(["Stop and extrapolate", "Avbryt och räkna fram en uppskattning"], "c4", ["Saves the evening; the later steps stay untested.", "Räddar kvällen; de senare stegen förblir otestade."], {
            pushback: [
              pb(["The steps nobody has seen", "Stegen ingen har sett"], ["The arithmetic covers copying the database. It says nothing about the steps the plan lists after that, which nobody has ever run. What does an estimate tell you about steps you have never seen work?", "Uträkningen täcker kopieringen av databasen. Den säger ingenting om stegen som planen listar därefter, och som ingen någonsin har kört. Vad säger en uppskattning om steg som ni aldrig har sett fungera?"]),
              pb(["A line drawn with a ruler", "En linje dragen med linjal"], ["{{person.cloudLead.name}} points out that restore speed varies with what is being copied: large files, small files, indexes. A straight line on the whiteboard could be hours out either way. Would you sign a number for the board that you drew with a ruler?", "{{person.cloudLead.name}} påpekar att återställningens hastighet varierar med vad som kopieras: stora filer, små filer, index. En rak linje på whiteboarden kan slå fel med flera timmar åt båda hållen. Skulle ni skriva under en siffra till styrelsen som ni ritat med linjal?"]),
              pb(["The team wants to finish", "Teamet vill bli klart"], ["{{person.itOps.name}} is frustrated: after all the preparation, the team wants to see the system come up, not leave with a projection. Some offer to stay on their own time. Do you send them home anyway, and what does that teach them about tests?", "{{person.itOps.name}} är frustrerad: efter alla förberedelser vill teamet se systemet starta, inte gå hem med en prognos. Några erbjuder sig att stanna på sin egen tid. Skickar ni hem dem ändå, och vad lär det dem om tester?"])
            ]
          })
        ])
      }),

      pg("c3b", ["The CIO", "IT-chefen"], [
        "{{person.cio.name}} answers on the second ring, at a child's football match. They listen to the news about the failed backups and the shared mailbox.\n\n“Don't stop,” they say. “This is exactly what the test is for. I'd rather know today than during a real incident. Keep going, write everything down, and call me tonight.”",
        "{{person.cio.name}} svarar på andra signalen, på ett barns fotbollsmatch. Hen lyssnar på beskedet om de misslyckade säkerhetskopieringarna och den gemensamma brevlådan.\n\n”Avbryt inte”, säger hen. ”Det är precis det testet är till för. Jag vill hellre veta i dag än under en verklig incident. Fortsätt, skriv ner allt och ring mig i kväll.”"
      ], {
        choice: ask(["How do you resume?", "Hur återupptar ni?"], ["Resumes with findings logged and the real time measured.", "Återupptar med fynden dokumenterade och den verkliga tiden mätt."], [
          opt(["Resume, log every finding, measure the real time", "Återuppta, dokumentera varje fynd, mät den verkliga tiden"], "c4", ["What the CIO asked for.", "Det IT-chefen bad om."], {
            set: ["logFindings", "measuredReal"],
            pushback: [
              pb(["The pause in the number", "Pausen i siffran"], ["The restore stood still while you called the CIO. The measured time now either includes the pause or has to be corrected for it, and someone will argue with whichever you choose. How will you record it so the result is still believed?", "Återställningen stod still medan ni ringde IT-chefen. Den uppmätta tiden innehåller nu antingen pausen eller måste justeras för den, och någon kommer att ifrågasätta vilket ni än väljer. Hur dokumenterar ni det så att resultatet fortfarande är trovärdigt?"]),
              pb(["Who guards production?", "Vem vaktar produktionen?"], ["With everyone busy on the test, the live system still has no fresh backup, and tonight's job will fail again. The CIO said keep testing, not leave production exposed. Who owns that gap until Monday?", "Medan alla är upptagna med testet saknar den skarpa miljön fortfarande en färsk säkerhetskopia, och kvällens jobb kommer att misslyckas igen. IT-chefen sa fortsätt testa, inte lämna produktionen sårbar. Vem äger den luckan fram till måndag?"]),
              pb(["A long day, fewer people", "En lång dag, färre personer"], ["Two people had planned to leave at lunch, and the CIO's answer has turned a morning test into a full day. Tired people log less carefully. Who decides when the team is too tired to trust its own notes?", "Två personer hade tänkt gå vid lunch, och IT-chefens svar har gjort ett förmiddagstest till en hel dag. Trötta människor dokumenterar mindre noggrant. Vem avgör när teamet är för trött för att lita på sina egna anteckningar?"])
            ]
          }),
          opt(["Postpone the rest to another weekend", "Skjut upp resten till en annan helg"], "c4", ["Safer for today's plans; loses the momentum.", "Säkrare för dagens planer; förlorar farten."], {
            pushback: [
              pb(["Overruling the CIO", "Att köra över IT-chefen"], ["The CIO asked you plainly not to stop. Postponing goes against that, from the person who owns the plan. Are you ready to explain on Monday why you decided otherwise?", "IT-chefen bad er tydligt att inte avbryta. Att skjuta upp går emot det, från den som äger planen. Är ni beredda att på måndag förklara varför ni beslutade annorlunda?"]),
              pb(["Months of false confidence", "Månader av falsk trygghet"], ["The next weekend when the people and the hardware are free is two months away. Until then, the board still believes the plan's {{num.rto}} hours. Are you willing to leave that belief in place for two months?", "Nästa helg då både personer och hårdvara är lediga ligger två månader bort. Fram till dess tror styrelsen fortfarande på planens {{num.rto}} timmar. Är ni beredda att låta den tron stå kvar i två månader?"]),
              pb(["Half a result", "Ett halvt resultat"], ["What you have is one finding about failed backups and no restore time. If anyone asks next week whether the plan works, the honest answer is still “we don't know”. Is that better or worse than before you started?", "Det ni har är ett fynd om misslyckade säkerhetskopieringar och ingen återställningstid. Om någon frågar nästa vecka om planen fungerar är det ärliga svaret fortfarande ”vi vet inte”. Är det bättre eller sämre än innan ni började?"])
            ]
          })
        ])
      }),

      pg("c4", ["The key", "Nyckeln"], [
        "{{time.T+420|clock}}. The database files are restored, and encrypted. The backup encryption key is stored in the company password vault.\n\nThe password vault runs on a server that is restored from the same backup system, after the ERP system in the plan's order. To open the backup, you need a system that the plan restores later, from the backup.",
        "Klockan {{time.T+420|clock}}. Databasfilerna är återställda, och krypterade. Säkerhetskopiornas krypteringsnyckel förvaras i företagets lösenordsvalv.\n\nLösenordsvalvet körs på en server som återställs från samma backupsystem, efter affärssystemet i planens ordning. För att öppna säkerhetskopian behöver ni ett system som planen återställer senare, från säkerhetskopian."
      ], {
        discuss: [q("How would this have gone at 03:00 during a real ransomware attack?", "Hur hade det här gått klockan 03.00 under ett verkligt ransomwareangrepp?", ["ciso", "itOps"])],
        choice: ask(["How do you get the key?", "Hur får ni tag i nyckeln?"], ["Retrieves the escrowed copy properly and notes the circular dependency.", "Hämtar den deponerade kopian på rätt sätt och noterar det cirkulära beroendet."], [
          opt(["Retrieve the sealed paper copy from the safe with two keyholders", "Hämta den förseglade papperskopian ur kassaskåpet med två nyckelinnehavare"], "l2", ["Slow, controlled, and it exists.", "Långsamt, kontrollerat, och den finns."], {
            set: "keysFound",
            pushback: [
              pb(["The second keyholder", "Den andra nyckelinnehavaren"], ["One keyholder is here; the other is at a family celebration two hours away. The safe needs both. Do you wait, break the two-person rule for a test, or find out whether anyone else has a key?", "En nyckelinnehavare är här; den andra är på ett familjekalas två timmar bort. Kassaskåpet kräver båda. Väntar ni, bryter ni tvåpersonsregeln för ett test, eller tar ni reda på om någon annan har en nyckel?"]),
              pb(["Is the envelope current?", "Är kuvertet aktuellt?"], ["The sealed envelope is dated several years back. Nobody in the room knows whether the backup key has been changed since. Do you still break the seal for a test, and how would you know beforehand that it is worth it?", "Det förseglade kuvertet är daterat flera år tillbaka. Ingen i rummet vet om nyckeln har bytts sedan dess. Bryter ni ändå förseglingen för ett test, och hur skulle ni veta i förväg att det är värt det?"]),
              pb(["After the seal is broken", "När förseglingen är bruten"], ["{{person.ciso.name}} points out that once opened, the key has to be re-sealed and re-witnessed, and until then it is a sheet of paper in an office on a weekend. Who is accountable for the key from the moment you open it?", "{{person.ciso.name}} påpekar att nyckeln måste förseglas och bevittnas på nytt när den väl öppnats, och fram till dess är den ett papper på ett kontor en helg. Vem ansvarar för nyckeln från det ögonblick ni öppnar den?"])
            ]
          }),
          opt(["Restore the vault first, out of order", "Återställ valvet först, i fel ordning"], "l2", ["Works today. Changes the plan on the fly.", "Fungerar i dag. Ändrar planen i farten."], {
            pushback: [
              pb(["The paper still says otherwise", "Papperet säger fortfarande annat"], ["Restoring the vault first works today, but the written plan still says the opposite. In a real incident, people will follow the paper. Do you change the plan document tonight, or trust that everyone remembers?", "Att återställa valvet först fungerar i dag, men den skrivna planen säger fortfarande motsatsen. Vid en verklig incident följer folk papperet. Ändrar ni plandokumentet i kväll, eller litar ni på att alla kommer ihåg?"]),
              pb(["Every secret, twice", "Varje hemlighet, två gånger"], ["The restored vault holds every password as it was {{num.days}} days ago. In the test environment, that is a second copy of every secret the company has. Who controls access to it, and when is it destroyed?", "Det återställda valvet innehåller varje lösenord som det såg ut för {{num.days}} dagar sedan. I testmiljön är det en andra kopia av varje hemlighet företaget har. Vem kontrollerar åtkomsten till den, och när förstörs den?"]),
              pb(["Another restore on the slow link", "Ännu en återställning på den långsamma förbindelsen"], ["{{person.cloudLead.name}} notes that the vault is one more restore over the same slow link, before the ERP data can even be opened. The day is already far past the plan. Is improvising the order worth more hours, and what does it do to the number you report?", "{{person.cloudLead.name}} konstaterar att valvet är ännu en återställning över samma långsamma förbindelse, innan affärssystemets data ens kan öppnas. Dagen är redan långt bortom planen. Är det värt fler timmar att improvisera ordningen, och vad gör det med siffran ni rapporterar?"])
            ]
          }),
          opt(["Ask the backup vendor to bypass the encryption", "Be backupleverantören att gå förbi krypteringen"], "l2", ["If they can, so can others.", "Om de kan, så kan andra också."], {
            pushback: [
              pb(["Remote access, please", "Fjärråtkomst, tack"], ["The vendor's support line says they may be able to help, if you send them the encrypted files and give them remote access to the backup server. That is your ERP data leaving the building. Do you agree, and who approves it?", "Leverantörens support säger att de kanske kan hjälpa till, om ni skickar de krypterade filerna och ger dem fjärråtkomst till backupservern. Det är affärssystemets data som lämnar huset. Går ni med på det, och vem godkänner det?"]),
              pb(["Then the encryption is fake", "Då är krypteringen på låtsas"], ["{{person.ciso.name}} is blunt: if the vendor can bypass your encryption, so can anyone who breaks into the vendor, and what you tell auditors about encrypted backups is not true. Do you still want the answer, and who do you tell if it is yes?", "{{person.ciso.name}} är rak: om leverantören kan gå förbi er kryptering kan också den som bryter sig in hos leverantören, och det ni säger till revisorerna om krypterade säkerhetskopior stämmer inte. Vill ni fortfarande ha svaret, och vem berättar ni för om det är ja?"]),
              pb(["Answer by Monday", "Svar på måndag"], ["Weekend support is a ticket queue with a response time of one business day. Unless you reach the account manager, who is on leave, the test stops until Monday. Is waiting for someone else's answer still a test of your plan?", "Helgsupporten är en ärendekö med en svarstid på en arbetsdag. Om ni inte når kontoansvarig, som är ledig, står testet still till måndag. Är det fortfarande ett test av er plan att vänta på någon annans svar?"])
            ]
          })
        ])
      }),

      pg("l2", ["What else it needs", "Vad mer det behöver"], [
        "The database is decrypted and the application server starts, and immediately stops. It cannot reach the identity service to check logins, or the licence server that the vendor requires.\n\nNeither appears in the restore plan. Both were added to the ERP setup years after the plan was written.",
        "Databasen är dekrypterad och applikationsservern startar, och stannar omedelbart. Den kan inte nå identitetstjänsten för att kontrollera inloggningar, eller licensservern som leverantören kräver.\n\nIngen av dem finns i återställningsplanen. Båda lades till i affärssystemets uppsättning flera år efter att planen skrevs."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you do?", "Vad gör ni?"], ["Restores the missing dependencies and adds them to the plan.", "Återställer de saknade beroendena och lägger till dem i planen."], [
          opt(["Restore them too, and update the plan", "Återställ dem också, och uppdatera planen"], "c5", ["Longer day, better plan.", "Längre dag, bättre plan."], {
            set: "logFindings",
            pushback: [
              pb(["A second licence server", "En andra licensserver"], ["{{person.supplierManager.name}} warns that the ERP vendor's licence terms may allow only one active licence server. Restoring a second copy, even in isolation, could breach them. Do you check with the vendor first, or restore it and hope?", "{{person.supplierManager.name}} varnar för att affärssystemsleverantörens licensvillkor kanske bara tillåter en aktiv licensserver. Att återställa en andra kopia, även isolerat, kan bryta mot dem. Stämmer ni av med leverantören först, eller återställer ni och hoppas?"]),
              pb(["Another team's weekend", "Ett annat teams helg"], ["Restoring the identity service needs the identity team, who are not here and were never told about the test. Calling them in turns your planned test into their unplanned weekend. Who calls them, and what do you promise them?", "Att återställa identitetstjänsten kräver identitetsteamet, som inte är här och aldrig fick veta om testet. Att kalla in dem gör ert planerade test till deras oplanerade helg. Vem ringer dem, och vad lovar ni dem?"]),
              pb(["How many more?", "Hur många till?"], ["If two dependencies were missing from the plan, there may be others. Someone asks whether you should stop and map every dependency properly before restoring anything else. Do you keep patching the restore as you go, or step back?", "Om två beroenden saknades i planen kan det finnas fler. Någon frågar om ni borde stanna och kartlägga varje beroende ordentligt innan ni återställer något mer. Fortsätter ni lappa återställningen allteftersom, eller tar ni ett steg tillbaka?"])
            ]
          }),
          opt(["Bypass the licence check for the test", "Gå förbi licenskontrollen för testet"], "c5", ["The test passes; a real restore would not.", "Testet går igenom; en verklig återställning skulle inte göra det."], {
            pushback: [
              pb(["Up, but only because", "Uppe, men bara för att"], ["With the licence check bypassed, the system starts, but in a real incident you could not do this, and the identity service is still missing. What will the result say: that the ERP came up, or that it came up only because you switched a check off?", "Med licenskontrollen förbigången startar systemet, men vid en verklig incident skulle ni inte kunna göra så, och identitetstjänsten saknas fortfarande. Vad ska resultatet säga: att affärssystemet kom upp, eller att det kom upp bara för att ni stängde av en kontroll?"]),
              pb(["A contract question", "En avtalsfråga"], ["{{person.supplierManager.name}} warns that bypassing the vendor's licence check, even in a test, probably breaches the licence agreement. If it ever comes out, it is the company that answers, not the test team. Who approved this?", "{{person.supplierManager.name}} varnar för att det troligen bryter mot licensavtalet att gå förbi leverantörens licenskontroll, även i ett test. Om det någonsin kommer fram är det företaget som får svara, inte testteamet. Vem godkände det här?"]),
              pb(["Workarounds stick", "Genvägar biter sig fast"], ["The bypass is a configuration change on the restored server. If someone reuses this environment, or writes the trick into the plan as a “workaround”, it becomes the method. How will you make sure the bypass dies with the test?", "Förbigången är en konfigurationsändring på den återställda servern. Om någon återanvänder miljön, eller skriver in tricket i planen som en ”lösning”, blir det metoden. Hur ser ni till att förbigången dör med testet?"])
            ]
          })
        ])
      }),

      pg("c5", ["Hour eleven", "Timme elva"], [
        "{{time.T+660|clock}}. The ERP system is running in the test environment. The team is tired and quietly pleased. {{person.serviceOwner.name}} logs in to check the data, as a real user would.\n\nThe last {{num.days}} days of orders, invoices and stock movements do not exist. In a real incident, someone would have to re-enter them from emails, paper and memory.",
        "Klockan {{time.T+660|clock}}. Affärssystemet körs i testmiljön. Teamet är trött och tyst nöjt. {{person.serviceOwner.name}} loggar in för att kontrollera datan, som en verklig användare skulle göra.\n\nDe senaste {{num.days}} dagarnas order, fakturor och lagerrörelser finns inte. Vid en verklig incident skulle någon behöva mata in dem igen från mejl, papper och minne."
      ], {
        chart: { id: "b16-kpi", type: "kpi", title: L(["Plan and reality", "Plan och verklighet"]), data: kpi([
          { id: "k1", label: ["Recovery time in the plan (hours)", "Återställningstid i planen (timmar)"], value: (v) => v.rto, tone: "info" },
          { id: "k2", label: ["Measured recovery time (hours)", "Uppmätt återställningstid (timmar)"], value: (v) => v.actual, tone: "danger" },
          { id: "k3", label: ["Days of data missing", "Dagar av data som saknas"], value: (v) => v.days, tone: "danger" }
        ]) },
        choice: ask(["How do you record the result?", "Hur dokumenterar ni resultatet?"], ["Records the real time and the data loss as the main results.", "Dokumenterar den verkliga tiden och dataförlusten som de viktigaste resultaten."], [
          opt(["Record the measured time and the data loss as headline results", "Dokumentera den uppmätta tiden och dataförlusten som huvudresultat"], "l3", ["The truth, on one page.", "Sanningen, på en sida."], {
            pushback: [
              pb(["Two findings, one headline", "Två fynd, en rubrik"], ["{{person.itOps.name}} argues the missing days come from the failed backups, not from the restore, and that one headline mixes two different problems. Do you keep both up front, and how will non-technical readers tell them apart?", "{{person.itOps.name}} menar att de saknade dagarna beror på de misslyckade säkerhetskopieringarna, inte på återställningen, och att en rubrik blandar två olika problem. Behåller ni båda överst, och hur ska läsare utan teknisk bakgrund skilja dem åt?"]),
              pb(["Where is the effort?", "Var syns insatsen?"], ["{{person.cio.name}} reads the draft: a measured time far beyond the plan and days of missing data, in large print. They ask whether the team's hard work is visible anywhere. Do you soften the headline, or add something next to it, and does that change what readers take away?", "{{person.cio.name}} läser utkastet: en uppmätt tid långt över planen och flera dagars saknad data, med stora bokstäver. Hen frågar om teamets hårda arbete syns någonstans. Tonar ni ner rubriken, eller lägger ni till något bredvid, och ändrar det vad läsarna tar med sig?"]),
              pb(["Measured from when?", "Mätt från när?"], ["Someone points out the clock started when the restore began, not when the team started preparing earlier in the morning. In a real incident, preparation would count too. Which number goes in the headline, and who decides?", "Någon påpekar att klockan startade när återställningen började, inte när teamet började förbereda tidigare på morgonen. Vid en verklig incident skulle förberedelserna också räknas. Vilken siffra hamnar i rubriken, och vem avgör det?"])
            ]
          }),
          opt(["Record “restore successful” with notes", "Dokumentera ”återställningen lyckades” med anteckningar"], "l3", ["Technically true.", "Tekniskt sant."], {
            pushback: [
              pb(["Nobody reads the notes", "Ingen läser anteckningarna"], ["The summary line is all most readers will see. “Restore successful” will be quoted on its own, in slides and minutes, without the days of missing orders. Is a technically true headline an honest one?", "Sammanfattningsraden är allt de flesta läsare ser. ”Återställningen lyckades” kommer att citeras för sig, i presentationer och protokoll, utan de saknade dagarnas order. Är en tekniskt sann rubrik en ärlig rubrik?"]),
              pb(["The service owner won't sign", "Tjänsteägaren skriver inte under"], ["{{person.serviceOwner.name}} refuses to sign off a “successful” restore that lost {{num.days}} days of orders and invoices. Their name is on the ERP service. Do you record the objection, or change the headline?", "{{person.serviceOwner.name}} vägrar godkänna en ”lyckad” återställning som förlorade {{num.days}} dagars order och fakturor. Det är hens namn som står på affärssystemet. Dokumenterar ni invändningen, eller ändrar ni rubriken?"]),
              pb(["Two records disagree", "Två underlag säger olika"], ["The whiteboard and the day's notes list every problem with a time next to it. Anyone who compares them with the summary will see the gap. Can “restore successful” survive an auditor reading both?", "Whiteboarden och dagens anteckningar listar varje problem med en tid bredvid. Den som jämför dem med sammanfattningen ser glappet. Klarar ”återställningen lyckades” att en revisor läser båda?"])
            ]
          }),
          opt(["Move the test into staging to finish today, abandoning the isolated restore", "Flytta testet till stagingmiljön för att bli klar i dag, och överge den isolerade återställningen"], "l3", ["Reverses your first choice to keep the test isolated; the result means less.", "Upphäver ert första val att hålla testet isolerat; resultatet blir mindre värt."], {
            requires: "isolatedTest", set: "testMoved", effects: { regulator: 1 },
            pushback: [
              pb(["Why isolation, this morning?", "Varför isolering i morse?"], ["You chose isolation this morning for a reason: staging is connected to everything. A restored ERP system on that network will believe it is production. What has changed since this morning, apart from everyone being tired?", "Ni valde isolering i morse av ett skäl: testmiljön är ansluten till allt. Ett återställt affärssystem i det nätverket tror att det är produktion. Vad har ändrats sedan i morse, förutom att alla är trötta?"]),
              pb(["Two half-tests", "Två halva tester"], ["Moving now means the hours spent on the isolated restore no longer lead to a result of their own. What you report will be a mix of an isolated restore and a rushed staging run. Which number will you give, and who will trust it?", "Att flytta nu innebär att timmarna på den isolerade återställningen inte längre leder till ett eget resultat. Det ni rapporterar blir en blandning av en isolerad återställning och en forcerad körning i testmiljön. Vilken siffra ger ni, och vem kommer att lita på den?"]),
              pb(["Who approves the move?", "Vem godkänner flytten?"], ["{{person.ciso.name}} insists that moving a restored copy of production data, passwords included, into a connected environment needs written approval. Nobody senior is here. Do you move without it, or stop for the night?", "{{person.ciso.name}} kräver att det ska finnas ett skriftligt godkännande för att flytta en återställd kopia av produktionsdata, lösenord inräknade, till en ansluten miljö. Ingen i ledningen är här. Flyttar ni utan det, eller avslutar ni för kvällen?"])
            ]
          })
        ])
      }),

      pg("l3", ["The users' view", "Användarnas syn"], [
        "On Monday, two people from finance and logistics look at the restored system with fresh eyes. They find what IT could not: price lists from last quarter, open orders that were closed weeks ago, a customer who has since gone bankrupt still marked as active.\n\nThey estimate three days of manual work to make the data usable again, after the restore.",
        "På måndagen tittar två personer från ekonomi och logistik på det återställda systemet med nya ögon. De hittar det IT inte kunde: prislistor från förra kvartalet, öppna order som stängdes för flera veckor sedan, en kund som sedan dess gått i konkurs fortfarande markerad som aktiv.\n\nDe uppskattar tre dagars manuellt arbete för att göra datan användbar igen, efter återställningen."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["Do you add this to the result?", "Lägger ni till det här i resultatet?"], ["Adds the business view to the recovery time.", "Lägger till verksamhetens syn i återställningstiden."], [
          opt(["Yes, the business view counts", "Ja, verksamhetens syn räknas"], "c6", ["Recovery is when people can work.", "Återställning är när folk kan arbeta."], {
            pushback: [
              pb(["Hours become days", "Timmar blir dagar"], ["Adding three days of manual work turns a recovery time measured in hours into one measured in days. {{person.cio.name}} worries the board will stop reading after that number. Is a bigger, truer figure worth a harder conversation about everything else in the report?", "Att lägga till tre dagars manuellt arbete gör en återställningstid i timmar till en i dagar. {{person.cio.name}} oroar sig för att styrelsen slutar läsa efter den siffran. Är en större, sannare siffra värd ett svårare samtal om allt annat i rapporten?"]),
              pb(["Whose problem is it?", "Vems problem är det?"], ["{{person.itOps.name}} objects: IT restored the system, and stale price lists and old customer records are a business data problem, not a restore problem. If you count it in the result, whose finding is it, and who has to fix it?", "{{person.itOps.name}} invänder: IT återställde systemet, och gamla prislistor och kundposter är ett problem med verksamhetens data, inte med återställningen. Om ni räknar in det i resultatet, vems fynd är det då, och vem ska rätta det?"]),
              pb(["A guess in the headline", "En gissning i rubriken"], ["The three days come from two people looking for one morning. Nobody knows whether the real figure is two days or ten. Do you put that estimate next to a measured number, and how do you label which is which?", "De tre dagarna kommer från två personer som tittade en förmiddag. Ingen vet om den verkliga siffran är två dagar eller tio. Sätter ni den uppskattningen bredvid en uppmätt siffra, och hur märker ni vilken som är vilken?"])
            ]
          }),
          opt(["Keep it as a separate note", "Behåll det som en separat anteckning"], "c6", ["It will be read separately, if at all.", "Den kommer att läsas separat, om alls."], {
            pushback: [
              pb(["Moved to an appendix", "Flyttat till en bilaga"], ["The two colleagues who gave up their Monday morning see their findings moved to an appendix. One asks whether recovery only counts when IT says so. What do you tell them?", "De två kollegorna som offrade sin måndagsförmiddag ser sina fynd flyttas till en bilaga. En av dem frågar om återställning bara räknas när IT säger det. Vad svarar ni?"]),
              pb(["The clock stops too early", "Klockan stannar för tidigt"], ["Without the business view, the result still treats recovery as the moment the server starts. In a real incident, the business would be stuck for days after that. Is a recovery time that stops before anyone can work a number you can defend?", "Utan verksamhetens syn behandlar resultatet fortfarande återställningen som ögonblicket då servern startar. Vid en verklig incident skulle verksamheten stå still i flera dagar efter det. Är en återställningstid som stannar innan någon kan arbeta en siffra ni kan försvara?"]),
              pb(["No owner, no deadline", "Ingen ägare, ingen tidsgräns"], ["A separate note has no owner and no deadline, and nobody tracks what is in an appendix. The three days of manual work may never be fixed. Who makes sure they are, if they are not in the main result?", "En separat anteckning har ingen ägare och ingen tidsgräns, och ingen följer upp vad som står i en bilaga. De tre dagarnas manuella arbete kanske aldrig åtgärdas. Vem ser till att det görs, om det inte står i huvudresultatet?"])
            ]
          })
        ])
      }),

      pg("c6", ["The report", "Rapporten"], [
        "The board's risk committee meets on Thursday, and the continuity test is on the agenda with a traffic light next to it. The plan says {{num.rto}} hours. The test measured {{num.actual}}, plus days of missing data and manual work.\n\nSome in the room worry that a red light will cost the IT budget its credibility. Others say a red light today is cheaper than a real incident tomorrow.",
        "Styrelsens riskutskott möts på torsdag, och kontinuitetstestet står på dagordningen med ett trafikljus bredvid. Planen säger {{num.rto}} timmar. Testet mätte {{num.actual}}, plus flera dagar av saknad data och manuellt arbete.\n\nEn del i rummet oroar sig för att ett rött ljus kommer att kosta IT-budgeten dess trovärdighet. Andra säger att ett rött ljus i dag är billigare än en verklig incident i morgon."
      ], {
        choice: ask(["What do you report?", "Vad rapporterar ni?"], ["Reports red, with the real numbers and a costed plan.", "Rapporterar rött, med de verkliga siffrorna och en kostnadsberäknad plan."], [
          opt(["Red, with the real numbers and a costed plan", "Rött, med de verkliga siffrorna och en kostnadsberäknad plan"], "c7", ["Uncomfortable, and useful.", "Obekvämt, och användbart."], {
            set: "honestReport",
            pushback: [
              pb(["Mid-budget timing", "Mitt i budgetarbetet"], ["{{person.cfo.name}} warns that a red light now, in the middle of the budget cycle, will make every IT request look like a rescue. The costed plan may be cut before anyone reads it. Do you change the timing, or keep the colour and take the risk?", "{{person.cfo.name}} varnar för att ett rött ljus nu, mitt i budgetarbetet, får varje IT-begäran att se ut som en räddningsaktion. Den kostnadsberäknade planen kan strykas innan någon har läst den. Ändrar ni tidpunkten, eller behåller ni färgen och tar risken?"]),
              pb(["Who signed the old plan?", "Vem godkände den gamla planen?"], ["A red light invites the obvious question: why was a plan promising {{num.rto}} hours approved and never tested? Some of the people who signed it will be at the table. Is the team ready for the report to become a question about them?", "Ett rött ljus inbjuder till den självklara frågan: varför godkändes en plan som lovade {{num.rto}} timmar utan att någonsin testas? Några av dem som skrev under den kommer att sitta vid bordet. Är teamet redo för att rapporten blir en fråga om dem?"]),
              pb(["A plan written in two days", "En plan skriven på två dagar"], ["The costed plan was put together in a few days, and some figures are guesses. If the committee challenges one number, the whole report could look unreliable. Do you present it now, or wait a meeting until the costs are solid?", "Den kostnadsberäknade planen togs fram på några dagar, och en del siffror är gissningar. Om utskottet ifrågasätter en siffra kan hela rapporten se opålitlig ut. Lägger ni fram den nu, eller väntar ni ett möte tills kostnaderna är säkra?"])
            ]
          }),
          opt(["Amber: “restore completed, improvements identified”", "Gult: ”återställning genomförd, förbättringar identifierade”"], "c7", ["Softer, and the board may not ask.", "Mjukare, och styrelsen kanske inte frågar."], {
            pushback: [
              pb(["Amber for a missed promise", "Gult för ett brutet löfte"], ["Amber says “improvements identified”. A measured time far beyond the plan is not an improvement area, it is a promise the company cannot keep. If the chair reads only the colour, what will they believe about recovery tomorrow?", "Gult säger ”förbättringar identifierade”. En uppmätt tid långt över planen är inte ett förbättringsområde, det är ett löfte företaget inte kan hålla. Om ordföranden bara läser färgen, vad kommer hen att tro om återställningen i morgon?"]),
              pb(["A colleague who won't nod", "En kollega som inte nickar"], ["{{person.serviceOwner.name}} says that if asked directly in the meeting, they will not call the result amber; they lived the eleven hours. Do you go in with a colour that one of your own team will contradict?", "{{person.serviceOwner.name}} säger att hen inte kommer att kalla resultatet gult om hen får frågan direkt på mötet; hen var med under de elva timmarna. Går ni in med en färg som någon i ert eget team kommer att motsäga?"]),
              pb(["The sentence that stays", "Meningen som blir kvar"], ["Whatever you report goes into the minutes, and auditors and insurers will quote it for a year. “Restore completed” is the phrase they will repeat. Are you comfortable with that sentence being the record?", "Det ni rapporterar hamnar i protokollet, och revisorer och försäkringsbolag kommer att citera det i ett år. ”Återställning genomförd” är frasen de kommer att upprepa. Är ni bekväma med att den meningen blir det som gäller?"])
            ]
          }),
          opt(["Green: the restore worked", "Grönt: återställningen fungerade"], "x1", ["It did, eventually.", "Det gjorde den, till slut."], {
            set: "reportedGreen",
            pushback: [
              pb(["The whiteboard photo", "Fotot av whiteboarden"], ["The team photographed the whiteboard with fourteen findings and shared it in the team channel. Anyone can hold it up next to a green light. Who in the team is now expected to stay quiet?", "Teamet fotograferade whiteboarden med fjorton fynd och delade bilden i teamets kanal. Vem som helst kan hålla upp den bredvid ett grönt ljus. Vem i teamet förväntas nu hålla tyst?"]),
              pb(["Green against what?", "Grönt jämfört med vad?"], ["The plan says {{num.rto}} hours; you measured {{num.actual}}. Green means the plan was met. If the chair asks for the number, who will stand up and say it was?", "Planen säger {{num.rto}} timmar; ni mätte {{num.actual}}. Grönt betyder att planen uppfylldes. Om ordföranden frågar efter siffran, vem reser sig och säger att den gjorde det?"]),
              pb(["No case for money", "Inget underlag för pengar"], ["{{person.cfo.name}} notes that a passed test means no case for extra funding: the backups, the key and the dependencies must be fixed from existing budgets. Can they really be, and who will say so if they can't?", "{{person.cfo.name}} konstaterar att ett godkänt test innebär att det inte finns något underlag för extra pengar: säkerhetskopiorna, nyckeln och beroendena måste rättas inom befintliga budgetar. Går det verkligen, och vem säger det om det inte gör det?"])
            ]
          })
        ])
      }),

      pg("c7", ["The board asks", "Styrelsen frågar"], [
        "The risk committee reads the report twice. The chair asks one question: “If we were hit by ransomware tonight, when would we be invoicing again?”\n\n{{person.cio.name}} answers with the measured number and the missing days. The committee asks what it would take to make the plan's promise true, and whether the promise should change.",
        "Riskutskottet läser rapporten två gånger. Ordföranden ställer en enda fråga: ”Om vi drabbades av ransomware i natt, när skulle vi fakturera igen?”\n\n{{person.cio.name}} svarar med den uppmätta siffran och de saknade dagarna. Utskottet frågar vad som krävs för att göra planens löfte sant, och om löftet borde ändras."
      ], {
        variants: [vr("!honestReport", [
          "The risk committee reads the amber report and almost moves on. Then the chair asks one question: “If we were hit by ransomware tonight, when would we be invoicing again?”\n\n{{person.cio.name}} hesitates, then gives the measured number. The committee asks why that number was not on the first page, and what it would take to make the plan's promise true.",
          "Riskutskottet läser den gula rapporten och går nästan vidare. Sedan ställer ordföranden en enda fråga: ”Om vi drabbades av ransomware i natt, när skulle vi fakturera igen?”\n\n{{person.cio.name}} tvekar och ger sedan den uppmätta siffran. Utskottet frågar varför den siffran inte stod på första sidan, och vad som krävs för att göra planens löfte sant."
        ], ["Because the report was softened, the board had to ask for the truth.", "Eftersom rapporten tonades ner fick styrelsen fråga efter sanningen."])],
        choice: ask(["What do you propose?", "Vad föreslår ni?"], ["Proposes a realistic target and the budget to meet it.", "Föreslår ett realistiskt mål och budgeten för att nå det."], [
          opt(["A realistic recovery target, funded, with dates", "Ett realistiskt återställningsmål, finansierat, med datum"], "l4", ["The board can decide on facts.", "Styrelsen kan besluta utifrån fakta."], {
            set: "rtoUpdated",
            pushback: [
              pb(["What waits?", "Vad får vänta?"], ["{{person.cfo.name}} asks for the cost of each step and whether some of it could wait until next year. A funded plan means choosing what not to fund. Which finding do you let wait, and can you defend that choice if it is the one that fails?", "{{person.cfo.name}} frågar vad varje steg kostar och om något kan vänta till nästa år. En finansierad plan innebär att välja vad som inte finansieras. Vilket fynd får vänta, och kan ni försvara det valet om det är just det som fallerar?"]),
              pb(["A longer promise to customers", "Ett längre löfte till kunderna"], ["A realistic target means telling customers, insurers and auditors that recovery will take longer than they were told. {{person.ceo.name}} asks who will explain why the old number was wrong. Are you ready to own that conversation?", "Ett realistiskt mål innebär att tala om för kunder, försäkringsbolag och revisorer att återställningen tar längre tid än de fått höra. {{person.ceo.name}} frågar vem som ska förklara varför den gamla siffran var fel. Är ni redo att äga det samtalet?"]),
              pb(["Dates you cannot control", "Datum ni inte styr över"], ["The committee wants firm dates. Some fixes depend on suppliers and on network work nobody has quoted yet. If you commit now and miss them, the next report is red again. Do you commit, or ask for time to plan properly?", "Utskottet vill ha fasta datum. En del åtgärder beror på leverantörer och på nätverksarbete som ingen har offererat än. Om ni lovar nu och missar dem blir nästa rapport röd igen. Lovar ni, eller ber ni om tid att planera ordentligt?"])
            ]
          }),
          opt(["Promise to fix it within the current budget", "Lova att rätta det inom nuvarande budget"], "l4", ["Brave. Unlikely.", "Modigt. Osannolikt."], {
            pushback: [
              pb(["What stops instead?", "Vad stoppas i stället?"], ["{{person.cfo.name}} asks which planned work will be dropped to make room. The current budget is already committed. Which project do you cancel, and have you told its owner?", "{{person.cfo.name}} frågar vilket planerat arbete som ska strykas för att ge plats. Den nuvarande budgeten är redan intecknad. Vilket projekt ställer ni in, och har ni berättat det för dess ägare?"]),
              pb(["Your own team doubts it", "Ert eget team tvivlar"], ["The slow network link alone needs new equipment and a contract change. Nobody in the team believes it fits in this year's budget. Are you promising the board something your own people don't believe?", "Bara den långsamma nätverksförbindelsen kräver ny utrustning och en avtalsändring. Ingen i teamet tror att det ryms i årets budget. Lovar ni styrelsen något som era egna medarbetare inte tror på?"]),
              pb(["The chair will check", "Ordföranden kommer att kontrollera"], ["The chair says the committee will ask for a new test in six months to see whether the fixes worked. If it fails, your promise is in the minutes. What will you say then?", "Ordföranden säger att utskottet kommer att begära ett nytt test om sex månader för att se om åtgärderna fungerade. Om det misslyckas står ert löfte i protokollet. Vad säger ni då?"])
            ]
          })
        ])
      }),

      pg("l4", ["The supplier", "Leverantören"], [
        "The backup vendor joins a call. Yes, the jobs failed for lack of space. Yes, the alerts were sent. No, the support contract does not include anyone watching your alerts for you.\n\nThey offer a monitoring add-on. {{person.supplierManager.name}} asks why the console showed a green tick on the main page while the jobs were failing.",
        "Backupleverantören deltar i ett samtal. Ja, jobben misslyckades på grund av utrymmesbrist. Ja, larmen skickades. Nej, supportavtalet omfattar inte att någon bevakar era larm åt er.\n\nDe erbjuder ett tillägg för övervakning. {{person.supplierManager.name}} frågar varför konsolen visade en grön bock på huvudsidan medan jobben misslyckades."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you change with the supplier?", "Vad ändrar ni med leverantören?"], ["Routes backup alerts to a watched queue and adds restore checks.", "Skickar backuplarm till en bevakad kö och lägger till återställningskontroller."], [
          opt(["Alerts to the on-call queue and automatic test restores", "Larm till beredskapskön och automatiska teståterställningar"], "c8", ["Failures become visible within a day.", "Misslyckanden blir synliga inom ett dygn."], {
            pushback: [
              pb(["On-call pushes back", "Beredskapen säger ifrån"], ["The on-call team already handles many alerts a night and says backup failures are not worth waking someone in the middle of the night. If they start ignoring them, you are back where you started. Who owns these alerts, and what makes them different from the last mailbox?", "Beredskapsteamet hanterar redan många larm per natt och tycker inte att misslyckade säkerhetskopieringar är värda att väcka någon för mitt i natten. Om de börjar ignorera dem är ni tillbaka där ni började. Vem äger larmen, och vad skiljer dem från den förra brevlådan?"]),
              pb(["Space for the test restores", "Utrymme för teståterställningarna"], ["Automatic test restores need storage, and the original failures were caused by lack of space. {{person.supplierManager.name}} asks where the extra space comes from. Do you buy it now, or risk the same failure for the same reason?", "Automatiska teståterställningar kräver lagring, och de ursprungliga felen orsakades av utrymmesbrist. {{person.supplierManager.name}} frågar var det extra utrymmet ska komma ifrån. Köper ni det nu, eller riskerar ni samma fel av samma skäl?"]),
              pb(["The green tick stays", "Den gröna bocken finns kvar"], ["The vendor says the green tick on the console's main page is “by design” and will not change. Anyone glancing at the console will still see all is well. How do you stop people trusting the tick over your new alerts?", "Leverantören säger att den gröna bocken på konsolens huvudsida är ”avsiktlig” och inte kommer att ändras. Den som snabbt tittar i konsolen ser fortfarande att allt är bra. Hur hindrar ni folk från att lita på bocken i stället för era nya larm?"])
            ]
          }),
          opt(["Buy the monitoring add-on", "Köp övervakningstillägget"], "c8", ["Someone still has to read it.", "Någon måste fortfarande läsa det."], {
            pushback: [
              pb(["Read by whom?", "Läst av vem?"], ["The add-on sends more alerts, to the same people who did not read the old ones. Nobody has been named to watch them. Who reads the add-on's reports, starting tonight?", "Tillägget skickar fler larm, till samma personer som inte läste de gamla. Ingen har utsetts att bevaka dem. Vem läser tilläggets rapporter, med början i kväll?"]),
              pb(["Paying for their console", "Att betala för deras konsol"], ["{{person.supplierManager.name}} points out that the vendor's own console hid the failures behind a green tick, and now the vendor is selling the fix. Do you reward that, or press the vendor to make the console honest before buying anything?", "{{person.supplierManager.name}} påpekar att leverantörens egen konsol dolde felen bakom en grön bock, och nu säljer leverantören lösningen. Belönar ni det, eller pressar ni leverantören att göra konsolen ärlig innan ni köper något?"]),
              pb(["Monitoring is not restoring", "Övervakning är inte återställning"], ["The add-on reports whether jobs succeed. It does not tell you whether a backup can actually be restored, which is what Saturday tested. Is buying it a fix, or a way of feeling fixed?", "Tillägget rapporterar om jobben lyckas. Det säger inte om en säkerhetskopia faktiskt går att återställa, vilket är vad lördagen testade. Är köpet en åtgärd, eller ett sätt att känna sig åtgärdad?"])
            ]
          })
        ])
      }),

      pg("c8", ["The fix order", "Ordningen för åtgärder"], [
        "The whiteboard from Saturday has fourteen findings. The team cannot fix them all at once, and some are cheap while others need money and months.\n\nThe obvious ones are the backup job and the shared mailbox. The less obvious ones are the key in the vault, the forgotten dependencies, and the network link that made everything five times slower.",
        "Whiteboarden från lördagen har fjorton fynd. Teamet kan inte rätta alla på en gång, och en del är billiga medan andra kräver pengar och månader.\n\nDe självklara är säkerhetskopieringsjobbet och den gemensamma brevlådan. De mindre självklara är nyckeln i valvet, de glömda beroendena och nätverksförbindelsen som gjorde allt fem gånger långsammare."
      ], {
        choice: ask(["What do you fix first?", "Vad rättar ni först?"], ["Fixes what makes a restore impossible before what makes it slow.", "Rättar det som gör en återställning omöjlig före det som gör den långsam."], [
          opt(["Backups that work, the key outside the vault, then the dependencies", "Säkerhetskopior som fungerar, nyckeln utanför valvet, sedan beroendena"], "c9", ["Possible first, fast later.", "Möjligt först, snabbt sedan."], {
            pushback: [
              pb(["Slow for months", "Långsamt i månader"], ["With the network link last, a restore will still take most of a day for months to come. If a real incident comes before then, you will restore correctly and very slowly. Can the business live without its ERP system that long?", "Med nätverksförbindelsen sist kommer en återställning fortfarande att ta större delen av en dag i flera månader framöver. Om en verklig incident kommer innan dess återställer ni korrekt och mycket långsamt. Klarar sig verksamheten utan affärssystemet så länge?"]),
              pb(["The longest lead time", "Längst ledtid"], ["The network team says the link upgrade has the longest lead time and must be ordered now, or it slips a whole year. Putting it last may mean it never starts. Do you change the order, or run two tracks with the same few people?", "Nätverksteamet säger att uppgraderingen av förbindelsen har längst ledtid och måste beställas nu, annars glider den ett helt år. Att lägga den sist kan betyda att den aldrig kommer i gång. Ändrar ni ordningen, eller kör ni två spår med samma få personer?"]),
              pb(["Outside the vault, but where?", "Utanför valvet, men var?"], ["“The key outside the vault” sounds simple, but {{person.ciso.name}} asks where exactly: a safe, a second vault, a separate service? Each has its own risks and its own owner. Who decides, and by when?", "”Nyckeln utanför valvet” låter enkelt, men {{person.ciso.name}} frågar var exakt: ett kassaskåp, ett andra valv, en separat tjänst? Varje alternativ har sina egna risker och sin egen ägare. Vem bestämmer, och när?"])
            ]
          }),
          opt(["The network link first: speed matters most", "Nätverksförbindelsen först: hastigheten betyder mest"], "c9", ["Fast restores of data you cannot decrypt.", "Snabba återställningar av data ni inte kan dekryptera."], {
            pushback: [
              pb(["Fast restores of old data", "Snabba återställningar av gammal data"], ["If the nightly backup job fails again next week, a faster link just restores old data faster. Nothing on your list fixes the job until the link is done. Would you restore quickly from a backup {{num.days}} days old?", "Om det nattliga jobbet misslyckas igen nästa vecka återställer en snabbare förbindelse bara gammal data snabbare. Inget på er lista rättar jobbet förrän förbindelsen är klar. Skulle ni återställa snabbt från en säkerhetskopia som är {{num.days}} dagar gammal?"]),
              pb(["Fast, and still locked", "Snabbt, och fortfarande låst"], ["{{person.ciso.name}} points out that without the key outside the vault, a fast restore still ends with encrypted files nobody can open. Speed is worthless if the restore cannot finish. Why should the key wait?", "{{person.ciso.name}} påpekar att utan nyckeln utanför valvet slutar en snabb återställning fortfarande med krypterade filer som ingen kan öppna. Hastighet är värdelös om återställningen inte kan slutföras. Varför ska nyckeln vänta?"]),
              pb(["The cheap fixes wait", "De billiga åtgärderna väntar"], ["The link upgrade needs a supplier contract and new equipment, months away. If speed truly comes first, the cheap fixes queue behind the expensive one. Do you leave a shared mailbox unread for months while you wait for cables?", "Uppgraderingen av förbindelsen kräver ett leverantörsavtal och ny utrustning, flera månader bort. Om hastigheten verkligen går först köar de billiga åtgärderna bakom den dyra. Låter ni en gemensam brevlåda vara oläst i månader medan ni väntar på kablar?"])
            ]
          })
        ])
      }),

      pg("c9", ["The next test", "Nästa test"], [
        "{{person.cio.name}} asks when the next test should be. Some in the team would rather not do this again for a year. Others point out that every finding today was invisible for years, and that the fixes themselves need testing.\n\nThe auditors will also want to know whether this was a one-off or the start of a habit.",
        "{{person.cio.name}} frågar när nästa test ska vara. En del i teamet vill helst inte göra det här igen på ett år. Andra påpekar att varje fynd i dag var osynligt i flera år, och att själva åtgärderna behöver testas.\n\nRevisorerna kommer också att vilja veta om det här var en engångsföreteelse eller början på en vana."
      ], {
        choice: ask(["When is the next test?", "När är nästa test?"], ["Schedules regular tests, starting soon, to prove the fixes.", "Planerar regelbundna tester, med början snart, för att bevisa åtgärderna."], [
          opt(["Quarterly, starting in three months", "Varje kvartal, med början om tre månader"], "c10", ["Turns a test into a habit.", "Gör ett test till en vana."], {
            set: "testPlanned",
            pushback: [
              pb(["Four Saturdays a year", "Fyra lördagar om året"], ["{{person.itOps.name}} says the team gave one Saturday gladly; four a year, on top of on-call, is another matter. Some will say no. Do you pay for weekend tests, run them on weekdays, or accept a smaller team?", "{{person.itOps.name}} säger att teamet gärna gav en lördag; fyra om året, ovanpå beredskapen, är en annan sak. En del kommer att säga nej. Betalar ni för helgtester, kör ni dem på vardagar, eller accepterar ni ett mindre team?"]),
              pb(["Testing half-done fixes", "Att testa halvfärdiga åtgärder"], ["In three months, several fixes will still be half-done. The next test may fail on the same findings. Is a second failing test useful, or will it be read as the team getting nowhere?", "Om tre månader är flera åtgärder fortfarande halvfärdiga. Nästa test kan falla på samma fynd. Är ett andra misslyckat test användbart, eller kommer det att läsas som att teamet inte kommer någonstans?"]),
              pb(["The yearly bill", "Årsnotan"], ["Each test needs the isolated environment, the hardware and a day of several people. {{person.cfo.name}} asks for the yearly cost and whether a smaller test would do. Do you defend a full restore every quarter?", "Varje test kräver den isolerade miljön, hårdvaran och en dag för flera personer. {{person.cfo.name}} frågar efter årskostnaden och om ett mindre test skulle räcka. Försvarar ni en fullständig återställning varje kvartal?"])
            ]
          }),
          opt(["Next year", "Nästa år"], "c10", ["The findings will be a year old.", "Fynden kommer att vara ett år gamla."], {
            pushback: [
              pb(["The auditors' question", "Revisorernas fråga"], ["The auditors want to know whether this was a one-off or the start of a habit. “Next year” sounds like the answer is a one-off. What will you show them in the meantime?", "Revisorerna vill veta om det här var en engångsföreteelse eller början på en vana. ”Nästa år” låter som att svaret är en engångsföreteelse. Vad visar ni dem under tiden?"]),
              pb(["A year of untested fixes", "Ett år av otestade åtgärder"], ["The team will spend the year fixing the backup job, the key and the dependencies, and nobody will know whether the fixes work until the next test. Would you accept that from a supplier?", "Teamet kommer att lägga året på att rätta säkerhetskopieringen, nyckeln och beroendena, och ingen vet om åtgärderna fungerar förrän vid nästa test. Skulle ni godta det från en leverantör?"]),
              pb(["People move on", "Folk går vidare"], ["In a year, some of the people who ran Saturday's test will have moved on. What they learned lives in their heads and a photo of a whiteboard. Who writes it down, and will the next team even know where to look?", "Om ett år har några av dem som genomförde lördagens test gått vidare. Det de lärde sig finns i deras huvuden och på ett foto av en whiteboard. Vem skriver ner det, och vet nästa team ens var det ska leta?"])
            ]
          })
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "A month later. The backups have run every night since, and someone now reads the alerts. The key has a sealed copy in two places. The plan has been rewritten.\n\nThe team meets one last time to agree what changes for good, now that everyone knows how far the old plan was from the truth.",
        "En månad senare. Säkerhetskopieringen har körts varje natt sedan dess, och någon läser nu larmen. Nyckeln har en förseglad kopia på två ställen. Planen har skrivits om.\n\nTeamet träffas en sista gång för att komma överens om vad som ändras för gott, nu när alla vet hur långt den gamla planen var från sanningen."
      ], {
        choice: ask(["What changes for good?", "Vad ändras för gott?"], ["Makes recovery testing a routine with honest reporting.", "Gör återställningstester till en rutin med ärlig rapportering."], [
          opt(["Regular restore tests with honest results to the board", "Regelbundna återställningstester med ärliga resultat till styrelsen"], "r-end", ["The plan stays true.", "Planen förblir sann."], {
            pushback: [
              pb(["Honest when it hurts", "Ärligt även när det svider"], ["The next test may go worse than the last, just after the board approved money. {{person.cio.name}} asks whether every result really has to go to the board, or only the progress. Where do you draw the line, and who decides?", "Nästa test kan gå sämre än det förra, precis efter att styrelsen beviljat pengar. {{person.cio.name}} frågar om verkligen varje resultat måste gå till styrelsen, eller bara framstegen. Var drar ni gränsen, och vem avgör?"]),
              pb(["Whose routine?", "Vems rutin?"], ["A routine needs an owner. IT says the business owns its continuity; the business says restores are an IT job. If nobody's name is on it, the routine will quietly stop. Whose name goes on it today?", "En rutin behöver en ägare. IT säger att verksamheten äger sin kontinuitet; verksamheten säger att återställningar är IT:s jobb. Om inget namn står på den kommer rutinen tyst att upphöra. Vems namn skriver ni dit i dag?"]),
              pb(["“For information”", "”För kännedom”"], ["The risk committee has a full agenda. After a couple of quarters, restore results may move to the “for information” section that nobody discusses. Does honest reporting still mean anything if no one reads it, and how do you keep it on the agenda?", "Riskutskottet har en full dagordning. Efter ett par kvartal kan återställningsresultaten hamna under ”för kännedom”, som ingen diskuterar. Betyder ärlig rapportering något om ingen läser den, och hur håller ni kvar den på dagordningen?"])
            ]
          }),
          opt(["A new backup product", "En ny backupprodukt"], "r-end", ["Different product, same untested plan.", "Annan produkt, samma otestade plan."], {
            pushback: [
              pb(["Same link, same key", "Samma förbindelse, samma nyckel"], ["A new product would restore over the same slow link, needing the same key and the same forgotten dependencies. Which of Saturday's findings does it actually fix?", "En ny produkt skulle återställa över samma långsamma förbindelse och behöva samma nyckel och samma glömda beroenden. Vilka av lördagens fynd åtgärdar den egentligen?"]),
              pb(["Months of migration", "Månader av migrering"], ["Switching means months of migration, with old and new backups overlapping and nobody fully trusting either. Your only tested restore was on the old product. Who tests the new one, and when?", "Ett byte innebär månader av migrering, där gamla och nya säkerhetskopior överlappar och ingen fullt litar på någon av dem. Er enda testade återställning gjordes med den gamla produkten. Vem testar den nya, och när?"]),
              pb(["The alerts were sent", "Larmen skickades"], ["{{person.supplierManager.name}} notes the current vendor did send every alert; the problem was who read them. A new vendor will send alerts too. What makes you think they will be read this time?", "{{person.supplierManager.name}} påpekar att den nuvarande leverantören faktiskt skickade varje larm; problemet var vem som läste dem. En ny leverantör kommer också att skicka larm. Vad får er att tro att de läses den här gången?"])
            ]
          }),
          opt(["A longer recovery target on paper", "Ett längre återställningsmål på papper"], "r-end", ["Honest, and nothing else changes.", "Ärligt, och inget annat ändras."], {
            pushback: [
              pb(["Contracts quote the old number", "Avtalen citerar den gamla siffran"], ["Some customer contracts refer to the continuity plan's recovery time. Changing it on paper may mean renegotiating them. Who tells sales, and do the contracts change too?", "En del kundavtal hänvisar till kontinuitetsplanens återställningstid. Att ändra den på papperet kan innebära att de måste omförhandlas. Vem berättar det för säljavdelningen, och ändras avtalen också?"]),
              pb(["Lowering the bar", "Att sänka ribban"], ["{{person.ciso.name}} says a longer target with no fixes just writes down today's weakness. Next year the same test will “pass” against a target set to match it. Is that honesty, or giving up?", "{{person.ciso.name}} säger att ett längre mål utan åtgärder bara skriver ner dagens svaghet. Nästa år kommer samma test att ”godkännas” mot ett mål som satts för att passa det. Är det ärlighet, eller att ge upp?"]),
              pb(["The insurer asks", "Försäkringsbolaget frågar"], ["The cyber insurance renewal asks for your recovery time objective. A longer one may change the premium or the terms. Do you give the insurer the new number, and who signs the form?", "Förnyelsen av cyberförsäkringen frågar efter ert återställningsmål. Ett längre mål kan ändra premien eller villkoren. Ger ni försäkringsbolaget den nya siffran, och vem skriver under formuläret?"])
            ]
          })
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["isolatedTest", "honestReport", "rtoUpdated"], "e1"],
          ["honestReport", "e2"],
          ["isolatedTest", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Six months later", "Sex månader senare"], ["The second quarterly test restores the ERP system in nine hours with one day of data lost, against a new, realistic target the board funded.\n\nWhen a supplier's ransomware attack later forces a real restore of a smaller system, the team follows a plan it has actually used.", "Det andra kvartalstestet återställer affärssystemet på nio timmar med ett dygns data förlorad, mot ett nytt, realistiskt mål som styrelsen finansierat.\n\nNär ett ransomwareangrepp hos en leverantör senare tvingar fram en verklig återställning av ett mindre system följer teamet en plan som det faktiskt har använt."], {
        ending: end(1, ["A plan that is true", "En plan som är sann"], [
          "A safe test, honest numbers and a funded, realistic target. The next restore follows a plan that works.",
          "Ett säkert test, ärliga siffror och ett finansierat, realistiskt mål. Nästa återställning följer en plan som fungerar."
        ])
      }),
      pg("e2", ["Six months later", "Sex månader senare"], ["The board heard the truth and the plan is better. But the test itself caused trouble, or the target was never properly funded.\n\nThe fixes are going slowly. The second test is better than the first, and still far from the promise.", "Styrelsen fick höra sanningen och planen är bättre. Men själva testet orsakade problem, eller så finansierades målet aldrig ordentligt.\n\nÅtgärderna går långsamt. Det andra testet är bättre än det första, och fortfarande långt från löftet."], {
        ending: end(2, ["Honest, but slow to fix", "Ärligt, men långsamt att rätta"], [
          "You reported the truth, but the test had side effects or the fix lacked funding. Progress is real and slow.",
          "Ni rapporterade sanningen, men testet hade bieffekter eller så saknade åtgärden finansiering. Framstegen är verkliga och långsamma."
        ])
      }),
      pg("e3", ["Five months later", "Fem månader senare"], ["The test was run safely and found everything. But the report to the board softened the result, and the budget for fixes never came.\n\nFive months later a real ransomware attack hits a smaller system. The backup alerts are being read now; the slow link and the missing dependencies are exactly as they were.", "Testet genomfördes säkert och hittade allt. Men rapporten till styrelsen tonade ner resultatet, och budgeten för åtgärder kom aldrig.\n\nFem månader senare drabbar ett verkligt ransomwareangrepp ett mindre system. Backuplarmen läses nu; den långsamma förbindelsen och de saknade beroendena är precis som de var."], {
        ending: end(3, ["Found it all, fixed little", "Hittade allt, rättade lite"], [
          "A safe test found every gap, but a softened report meant little was funded. The next real restore meets the same gaps.",
          "Ett säkert test hittade varje lucka, men en nedtonad rapport gjorde att lite finansierades. Nästa verkliga återställning möter samma luckor."
        ])
      }),
      pg("e4", ["Monday morning", "Måndag morgon"], ["The restore into the connected staging environment did more than test. Before anyone noticed, the restored server sent a batch of old invoices to customers and booked stock movements that never happened.\n\nMonday is spent apologising to customers and reversing transactions. The board hears about the test because of the mess, not the findings.", "Återställningen till den anslutna testmiljön gjorde mer än att testa. Innan någon märkte det skickade den återställda servern en omgång gamla fakturor till kunder och bokförde lagerrörelser som aldrig hade skett.\n\nMåndagen går åt till att be kunder om ursäkt och backa transaktioner. Styrelsen hör talas om testet på grund av röran, inte fynden."], {
        ending: end(4, ["The test became the incident", "Testet blev incidenten"], [
          "Restoring into a connected environment let the test touch production: old invoices to customers and false stock movements.",
          "Att återställa i en ansluten miljö lät testet påverka produktionen: gamla fakturor till kunder och falska lagerrörelser."
        ])
      }),

      // Break-away: reporting green.
      pg("x1", ["Green", "Grönt"], [
        "The risk committee sees a green light next to the continuity test and moves on in thirty seconds. The minutes say: “Recovery capability confirmed by test.”\n\nThe team's list of fourteen findings goes into a shared folder. Two of them are fixed in the following weeks. The others wait for budget that nobody requested.",
        "Riskutskottet ser ett grönt ljus bredvid kontinuitetstestet och går vidare efter trettio sekunder. Protokollet säger: ”Återställningsförmågan bekräftad genom test.”\n\nTeamets lista med fjorton fynd hamnar i en gemensam mapp. Två av dem rättas under de följande veckorna. De andra väntar på en budget som ingen har begärt."
      ], {
        choice: ask(["Do you correct the record?", "Rättar ni protokollet?"], ["Goes back to the committee with the real numbers.", "Går tillbaka till utskottet med de verkliga siffrorna."], [
          opt(["Go back to the committee with the real numbers", "Gå tillbaka till utskottet med de verkliga siffrorna"], "x2", ["Awkward, and right.", "Pinsamt, och rätt."], {
            pushback: [
              pb(["Correcting signed minutes", "Att rätta ett justerat protokoll"], ["The minutes saying “Recovery capability confirmed by test” have been signed by the chair. Going back means asking the committee to correct an official record that you gave them. Who goes, and what do you say about why it was green?", "Protokollet som säger ”Återställningsförmågan bekräftad genom test” är justerat av ordföranden. Att gå tillbaka innebär att be utskottet rätta ett officiellt dokument som ni själva gav dem underlag till. Vem går, och vad säger ni om varför det var grönt?"]),
              pb(["Relief in the team", "Lättnad i teamet"], ["Some in the team were relieved by the green light. {{person.itOps.name}} worries that going back now will make it look as if IT hid things on purpose. How do you correct the record without turning it into a hunt for who chose green?", "En del i teamet blev lättade av det gröna ljuset. {{person.itOps.name}} oroar sig för att det ska se ut som att IT medvetet dolde saker om ni går tillbaka nu. Hur rättar ni protokollet utan att det blir en jakt på vem som valde grönt?"]),
              pb(["Two months to the next meeting", "Två månader till nästa möte"], ["The next risk committee meeting is two months away. Writing to the chair before then makes it look like an emergency. Do you wait for the meeting, or ask for an extra one and explain why?", "Nästa möte i riskutskottet är om två månader. Att skriva till ordföranden innan dess får det att se ut som en nödsituation. Väntar ni till mötet, eller begär ni ett extra möte och förklarar varför?"])
            ]
          }),
          opt(["Leave it; the fixes can come from the normal budget", "Låt det vara; åtgärderna kan komma från den vanliga budgeten"], "x2", ["They will not.", "Det kommer de inte att göra."], {
            pushback: [
              pb(["Twelve findings waiting", "Tolv fynd som väntar"], ["Two findings have been fixed. The other twelve include the key and the network link, which need money the normal budget does not have. Who tells the team their findings will wait indefinitely?", "Två fynd har rättats. De andra tolv omfattar nyckeln och nätverksförbindelsen, som kräver pengar som den vanliga budgeten inte har. Vem säger till teamet att deras fynd får vänta på obestämd tid?"]),
              pb(["The service owner speaks up", "Tjänsteägaren säger ifrån"], ["{{person.serviceOwner.name}} lived the long restore and saw the missing days of data. They ask whether they should raise it with the committee themselves. Do you stop them, and on what grounds?", "{{person.serviceOwner.name}} var med under den långa återställningen och såg de saknade dagarnas data. Hen frågar om hen själv ska ta upp det med utskottet. Stoppar ni hen, och med vilket skäl?"]),
              pb(["The auditors compare", "Revisorerna jämför"], ["The internal auditors read the minutes and ask to see the test evidence. The evidence is a photo of fourteen findings. What happens when they put the two side by side?", "Internrevisorerna läser protokollet och ber att få se underlaget från testet. Underlaget är ett foto av fjorton fynd. Vad händer när de lägger dem bredvid varandra?"])
            ]
          })
        ])
      }),
      pg("x2", ["Three months later: Friday night", "Tre månader senare: fredag kväll"], [
        "Ransomware. The ERP system and its backups server are hit on a Friday night. The backups themselves survived, because two of the fourteen findings were fixed.\n\nThe board's minutes say recovery takes {{num.rto}} hours. The team knows it takes at least {{num.actual}}, if the key can be found and the dependencies remembered.",
        "Ransomware. Affärssystemet och backupservern drabbas en fredagskväll. Själva säkerhetskopiorna klarade sig, eftersom två av de fjorton fynden hade rättats.\n\nStyrelsens protokoll säger att återställningen tar {{num.rto}} timmar. Teamet vet att den tar minst {{num.actual}}, om nyckeln kan hittas och beroendena kommer ihåg."
      ], {
        choice: ask(["What do you tell the CEO at midnight?", "Vad säger ni till vd vid midnatt?"], ["Gives the real recovery estimate immediately.", "Ger den verkliga uppskattningen av återställningen omedelbart."], [
          opt(["The real estimate, and why it differs from the plan", "Den verkliga uppskattningen, och varför den skiljer sig från planen"], "x3", ["The hardest call of the night.", "Nattens svåraste samtal."], {
            pushback: [
              pb(["“Why were we told otherwise?”", "”Varför fick vi höra annat?”"], ["{{person.ceo.name}} asks, quietly, why the board was told three months ago that recovery was confirmed. Do you explain now, at midnight, or focus on the restore and leave that conversation for later?", "{{person.ceo.name}} frågar, lågt, varför styrelsen fick höra för tre månader sedan att återställningsförmågan var bekräftad. Förklarar ni nu, vid midnatt, eller fokuserar ni på återställningen och lämnar det samtalet till senare?"]),
              pb(["A range, not a time", "Ett intervall, inte en tid"], ["Your estimate rests on one test in which several steps took far longer than planned. Honestly, you can give a range, not a time. Will the CEO accept a range of many hours, or ask you to pick one number, and which do you pick?", "Er uppskattning vilar på ett enda test där flera steg tog mycket längre tid än planerat. Ärligt talat kan ni ge ett intervall, inte en tidpunkt. Godtar vd ett intervall på många timmar, eller ber hen er välja en siffra, och vilken väljer ni då?"]),
              pb(["Putting it in writing", "Att sätta det på pränt"], ["The CEO asks whether the insurer and the board chair should get the same number tonight. Once it is written down, the green report is contradicted on the record. Do you put it in writing, or keep it to this call?", "Vd frågar om försäkringsbolaget och styrelseordföranden ska få samma siffra i natt. När den väl är nedskriven motsägs den gröna rapporten officiellt. Skriver ni ner den, eller håller ni den till det här samtalet?"])
            ]
          }),
          opt(["“We're working to the plan”", "”Vi arbetar enligt planen”"], "x3", ["The plan says Saturday morning.", "Planen säger lördag morgon."], {
            pushback: [
              pb(["The plan says morning", "Planen säger morgon"], ["Working to the plan means {{num.rto}} hours, and the CEO will plan the morning around it. You know the test took {{num.actual}}. When do you correct it, and who carries the cost of the gap?", "Att arbeta enligt planen betyder {{num.rto}} timmar, och vd kommer att planera morgonen utifrån det. Ni vet att testet tog {{num.actual}}. När rättar ni det, och vem bär kostnaden för glappet?"]),
              pb(["The team heard you", "Teamet hörde er"], ["Your team heard what you told the CEO. {{person.itOps.name}} asks quietly whether the restore log should show real times or the plan's times. What do you tell them to write?", "Teamet hörde vad ni sa till vd. {{person.itOps.name}} frågar lågt om återställningsloggen ska visa de verkliga tiderna eller planens tider. Vad säger ni åt hen att skriva?"]),
              pb(["Which plan?", "Vilken plan?"], ["The written plan still restores the password vault after the ERP system, the order the test showed does not work. Following the plan to the letter walks straight into the key problem. Do you follow the plan as written, or the one the test taught you, and what do you then call it to the CEO?", "Den skrivna planen återställer fortfarande lösenordsvalvet efter affärssystemet, den ordning som testet visade inte fungerar. Att följa planen till punkt och pricka leder rakt in i nyckelproblemet. Följer ni planen som den står, eller den som testet lärde er, och vad kallar ni det då inför vd?"])
            ]
          })
        ])
      }),
      pg("x3", ["Saturday", "Lördag"], [
        "The restore hits every finding from the test, in order: the slow link, the key in the vault, the licence server, the identity service. The team has done it once before, which helps.\n\nCustomers were told on Friday night that systems would be back by Saturday morning, based on the plan. They are not.",
        "Återställningen stöter på varje fynd från testet, i tur och ordning: den långsamma förbindelsen, nyckeln i valvet, licensservern, identitetstjänsten. Teamet har gjort det en gång tidigare, vilket hjälper.\n\nKunderna fick på fredagskvällen höra att systemen skulle vara tillbaka till lördag morgon, utifrån planen. Det är de inte."
      ], {
        choice: ask(["What do you tell customers?", "Vad säger ni till kunderna?"], ["Corrects the estimate honestly.", "Rättar uppskattningen ärligt."], [
          opt(["A corrected, honest estimate", "En rättad, ärlig uppskattning"], "x4", ["Better late.", "Hellre sent."], {
            pushback: [
              pb(["The second estimate", "Den andra uppskattningen"], ["Customers were told Saturday morning. A corrected estimate admits the first one was wrong, and some will ask what else is. How do you make the second estimate more believable than the first?", "Kunderna fick höra lördag morgon. En rättad uppskattning erkänner att den första var fel, och en del kommer att fråga vad mer som är fel. Hur gör ni den andra uppskattningen mer trovärdig än den första?"]),
              pb(["Sales wants no time at all", "Säljarna vill inte ha någon tid alls"], ["Sales argues that a specific later time could be wrong again, and asks for no time at all. Two key customers are already talking about other suppliers. Do you give a time, a range, or nothing?", "Säljavdelningen menar att en ny tidpunkt kan bli fel igen och vill inte ange någon tid alls. Två viktiga kunder pratar redan om andra leverantörer. Ger ni en tid, ett intervall eller ingenting?"]),
              pb(["Steps still ahead", "Steg som återstår"], ["The licence server and the identity service are still ahead, and in the test they took hours. Any time you give is a bet that today goes no worse than the test. How much margin do you add, and who decides?", "Licensservern och identitetstjänsten återstår, och i testet tog de flera timmar. Varje tid ni anger är ett vad om att i dag inte går sämre än testet. Hur mycket marginal lägger ni på, och vem bestämmer?"])
            ]
          }),
          opt(["“Shortly”", "”Inom kort”"], "x4", ["Repeated every few hours.", "Upprepat med några timmars mellanrum."], {
            pushback: [
              pb(["The same calls, again", "Samma samtal, igen"], ["Every few hours “shortly” is repeated, and customer service is taking the same calls over and over. Some customers are planning their deliveries around your answer. How many more times can you say “shortly”?", "Med några timmars mellanrum upprepas ”inom kort”, och kundtjänst tar samma samtal om och om igen. En del kunder planerar sina leveranser utifrån ert svar. Hur många gånger till kan ni säga ”inom kort”?"]),
              pb(["A journalist calls", "En journalist ringer"], ["A trade journalist has heard about the outage and asks when systems will be back. “Shortly” will be printed next to however long it really takes. Are you comfortable with that story?", "En journalist på en branschtidning har hört talas om avbrottet och frågar när systemen är tillbaka. ”Inom kort” kommer att tryckas bredvid hur lång tid det verkligen tar. Är ni bekväma med den artikeln?"]),
              pb(["The team knows the number", "Teamet vet siffran"], ["Your own team has the test results and a realistic estimate. Customers hear “shortly”; the people doing the restore know otherwise. What happens when one of them tells a customer the truth?", "Ert eget team har testresultaten och en realistisk uppskattning. Kunderna hör ”inom kort”; de som gör återställningen vet bättre. Vad händer när någon av dem berättar sanningen för en kund?"])
            ]
          })
        ])
      }),
      pg("x4", ["The board", "Styrelsen"], [
        "On Monday the board asks the obvious question. Its minutes from three months ago say recovery capability was confirmed by test. The actual recovery took {{num.actual}} hours and lost {{num.days}} days of data.\n\nThe team's list of fourteen findings is still in the shared folder, dated the day of the test.",
        "På måndagen ställer styrelsen den självklara frågan. Dess protokoll från tre månader sedan säger att återställningsförmågan bekräftats genom test. Den faktiska återställningen tog {{num.actual}} timmar och förlorade {{num.days}} dagars data.\n\nTeamets lista med fjorton fynd ligger fortfarande i den gemensamma mappen, daterad dagen för testet."
      ], {
        choice: ask(["How do you answer the board?", "Hur svarar ni styrelsen?"], ["Shows the list and owns the green report.", "Visar listan och tar ansvar för den gröna rapporten."], [
          opt(["Show the list and own the decision", "Visa listan och ta ansvar för beslutet"], "e5", ["Painful and necessary.", "Smärtsamt och nödvändigt."], {
            pushback: [
              pb(["Whose decision?", "Vems beslut?"], ["Owning the decision means naming who chose green. Several people were in the room, and some argued for red. Do you take it alone, or say who argued what?", "Att ta ansvar för beslutet innebär att säga vem som valde grönt. Flera personer var i rummet, och några argumenterade för rött. Tar ni det ensamma, eller säger ni vem som argumenterade för vad?"]),
              pb(["Finance in the story", "Ekonomi i berättelsen"], ["The list shows fixes nobody asked to fund. {{person.cfo.name}} says finance was never told what they would cost. Showing the list puts finance in the story too. Do you share the blame, or keep it within IT?", "Listan visar åtgärder som ingen bad om pengar för. {{person.cfo.name}} säger att ekonomi aldrig fick veta vad de skulle kosta. Att visa listan drar in ekonomi i berättelsen också. Delar ni på skulden, eller håller ni den inom IT?"]),
              pb(["Someone's job", "Någons jobb"], ["The board chair hints that someone's job may be at stake. Showing the list makes it plain the team knew everything three months ago. Is owning it worth what it may cost the people who made the call?", "Styrelseordföranden antyder att någons jobb kan stå på spel. Att visa listan gör det tydligt att teamet visste allt för tre månader sedan. Är det värt att ta ansvar, med vad det kan kosta dem som fattade beslutet?"])
            ]
          }),
          opt(["Blame the backup vendor", "Skyll på backupleverantören"], "e5", ["The list says otherwise.", "Listan säger något annat."], {
            pushback: [
              pb(["The vendor has logs", "Leverantören har loggar"], ["The vendor replies within the hour: alerts were sent every night, to an address you own, and the logs are attached. The board now has both. What do you say?", "Leverantören svarar inom en timme: larmen skickades varje natt, till en adress som ni äger, och loggarna bifogas. Styrelsen har nu båda. Vad säger ni?"]),
              pb(["The list is dated", "Listan är daterad"], ["The board has the list of fourteen findings, dated the day of the test, and the failed backups are on it. Blaming the vendor implies you did not know. How long will that hold?", "Styrelsen har listan med fjorton fynd, daterad dagen för testet, och de misslyckade säkerhetskopieringarna står på den. Att skylla på leverantören antyder att ni inte visste. Hur länge håller det?"]),
              pb(["The team won't back it", "Teamet ställer inte upp"], ["{{person.itOps.name}} says they will not tell the board the vendor is to blame, because the team found and logged the problem themselves. If your own team contradicts you, what is left of the explanation?", "{{person.itOps.name}} säger att hen inte tänker säga till styrelsen att leverantören bär skulden, eftersom teamet självt hittade och dokumenterade problemet. Om ert eget team motsäger er, vad finns då kvar av förklaringen?"])
            ]
          })
        ])
      }),
      pg("e5", ["After the attack", "Efter angreppet"], ["The test found everything that went wrong in the real attack, three months before it happened. The green report made sure none of it was funded.\n\nThe board has asked for an independent review of how continuity is reported. The team's whiteboard photo from that Saturday is page one.", "Testet hittade allt som gick fel vid det verkliga angreppet, tre månader innan det hände. Den gröna rapporten såg till att inget av det finansierades.\n\nStyrelsen har begärt en oberoende granskning av hur kontinuitet rapporteras. Teamets foto av whiteboarden från den lördagen är sida ett."], {
        ending: end(5, ["Green on paper", "Grönt på papperet"], [
          "Reporting the test as passed hid every finding. A real attack three months later hits all of them.",
          "Att rapportera testet som godkänt dolde varje fynd. Ett verkligt angrepp tre månader senare träffar alla."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Test restores in isolation: a restored system on a live network acts like the real one.", "Testa återställningar isolerat: ett återställt system i ett anslutet nätverk beter sig som det riktiga."]),
        L(["A restore plan that has never run hides failures nobody can see from the console.", "En återställningsplan som aldrig har körts döljer fel som ingen kan se i konsolen."]),
        L(["Recovery is when people can work, not when the server starts.", "Återställning är när folk kan arbeta, inte när servern startar."]),
        L(["Report test results honestly; a green light that is not true costs the most later.", "Rapportera testresultat ärligt; ett grönt ljus som inte stämmer kostar mest senare."])
      ],
      strengthsToLookFor: [
        L(["Restoring into an isolated environment", "Att återställa i en isolerad miljö"]),
        L(["Measuring the real time instead of extrapolating", "Att mäta den verkliga tiden i stället för att räkna fram en uppskattning"]),
        L(["Reporting red with a costed plan", "Att rapportera rött med en kostnadsberäknad plan"])
      ],
      commonGaps: [
        L(["Restoring into a connected staging environment", "Att återställa i en ansluten testmiljö"]),
        L(["Stopping the test at the first bad news", "Att avbryta testet vid första dåliga nyheten"]),
        L(["Softening the result for the board", "Att tona ner resultatet inför styrelsen"])
      ],
      suggestedActions: [
        act(["Route backup failure alerts to the on-call queue.", "Skicka larm om misslyckade säkerhetskopieringar till beredskapskön."], "itOps", "high"),
        act(["Keep backup encryption keys outside the systems they protect.", "Förvara säkerhetskopiornas krypteringsnycklar utanför de system de skyddar."], "ciso", "high"),
        act(["Run isolated restore tests every quarter.", "Genomför isolerade återställningstester varje kvartal."], "cio", "medium"),
        act(["Report recovery tests with measured times to the board.", "Rapportera återställningstester med uppmätta tider till styrelsen."], "cio", "medium")
      ]
    }
  });
})();
