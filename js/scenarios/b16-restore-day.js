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
  const { L, q, inj, act, kpi, line, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

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
          opt(["An isolated network with no route to production", "Ett isolerat nätverk utan väg till produktionen"], "c2", ["Safe. Takes an hour to prepare.", "Säkert. Tar en timme att förbereda."], { set: "isolatedTest" }),
          opt(["The existing staging environment", "Den befintliga testmiljön"], "c2", ["Ready now. It is connected to everything.", "Klar nu. Den är ansluten till allt."]),
          opt(["Just talk it through instead of restoring", "Gå bara igenom det muntligt i stället för att återställa"], "c2", ["Safe, and you will learn very little.", "Säkert, och ni kommer att lära er väldigt lite."])
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
          opt(["Keep going and log every finding", "Fortsätt och dokumentera varje fynd"], "l1", ["The test is already worth it.", "Testet är redan värt det."], { set: "logFindings" }),
          opt(["Fix the backup job now, mid-test", "Rätta säkerhetskopieringsjobbet nu, mitt i testet"], "l1", ["Tempting. You will lose the measurement.", "Lockande. Ni förlorar mätningen."]),
          opt(["Stop and escalate to the CIO", "Avbryt och eskalera till IT-chefen"], "c3b", ["Understandable, on a Saturday.", "Begripligt, en lördag."])
        ])
      }),

      pg("l1", ["The offsite copy", "Kopian utanför huset"], [
        "Maybe the offsite copy is newer. It is stored with a vault provider and can be retrieved, according to the plan, “on request”.\n\n{{person.supplierManager.name}} calls the provider. Weekend retrieval needs a courier, takes six hours, and costs extra. The copy is from the same failing job, so it is also {{num.days}} days old.",
        "Kanske är kopian utanför huset nyare. Den förvaras hos en leverantör och kan enligt planen hämtas ”på begäran”.\n\n{{person.supplierManager.name}} ringer leverantören. Hämtning på helgen kräver ett bud, tar sex timmar och kostar extra. Kopian kommer från samma misslyckade jobb, så den är också {{num.days}} dagar gammal."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you note?", "Vad noterar ni?"], ["Records that the offsite copy adds hours and no freshness.", "Noterar att kopian utanför huset lägger till timmar men ingen aktualitet."], [
          opt(["Record it as a finding", "Dokumentera det som ett fynd"], "c3", ["Another line on the whiteboard.", "Ytterligare en rad på whiteboarden."], { set: "logFindings" }),
          opt(["Order the courier anyway", "Beställ budet ändå"], "c3", ["Six hours, for the same data.", "Sex timmar, för samma data."])
        ])
      }),

      pg("c3", ["Hour four", "Timme fyra"], [
        "{{time.T+240|clock}}. The plan's recovery time has passed. The restore is at 30 percent. The data is moving across an old network link at a fifth of the speed everyone assumed.\n\n{{person.cloudLead.name}} does the arithmetic on the whiteboard. At this rate, the database alone will take most of the day, and nothing else in the plan has started yet.",
        "Klockan {{time.T+240|clock}}. Planens återställningstid har passerat. Återställningen är på 30 procent. Datan går över en gammal nätverksförbindelse med en femtedel av den hastighet alla hade antagit.\n\n{{person.cloudLead.name}} räknar på whiteboarden. I den här takten tar enbart databasen större delen av dagen, och inget annat i planen har ens börjat."
      ], {
        chart: { id: "b16-progress", type: "line", title: L(["Restore progress", "Återställningens förlopp"]), unit: L(["percent", "procent"]), caption: L(["Hours since the restore started.", "Timmar sedan återställningen startade."]), data: line(["Restored", "Återställt"], 0, 4, 1, (x) => x * 7.5, "hours") },
        choice: ask(["Do you keep going?", "Fortsätter ni?"], ["Keeps going to measure the real number, however embarrassing.", "Fortsätter för att mäta den verkliga siffran, hur pinsam den än blir."], [
          opt(["Keep going and measure the real time", "Fortsätt och mät den verkliga tiden"], "c4", ["A long day and a true number.", "En lång dag och en sann siffra."], { set: "measuredReal" }),
          opt(["Stop and extrapolate", "Avbryt och räkna fram en uppskattning"], "c4", ["Saves the evening; the later steps stay untested.", "Räddar kvällen; de senare stegen förblir otestade."])
        ])
      }),

      pg("c3b", ["The CIO", "IT-chefen"], [
        "{{person.cio.name}} answers on the second ring, at a child's football match. They listen to the news about the failed backups and the shared mailbox.\n\n“Don't stop,” they say. “This is exactly what the test is for. I'd rather know today than during a real incident. Keep going, write everything down, and call me tonight.”",
        "{{person.cio.name}} svarar på andra signalen, på ett barns fotbollsmatch. Hen lyssnar på beskedet om de misslyckade säkerhetskopieringarna och den gemensamma brevlådan.\n\n”Avbryt inte”, säger hen. ”Det är precis det testet är till för. Jag vill hellre veta i dag än under en verklig incident. Fortsätt, skriv ner allt och ring mig i kväll.”"
      ], {
        choice: ask(["How do you resume?", "Hur återupptar ni?"], ["Resumes with findings logged and the real time measured.", "Återupptar med fynden dokumenterade och den verkliga tiden mätt."], [
          opt(["Resume, log every finding, measure the real time", "Återuppta, dokumentera varje fynd, mät den verkliga tiden"], "c4", ["What the CIO asked for.", "Det IT-chefen bad om."], { set: ["logFindings", "measuredReal"] }),
          opt(["Postpone the rest to another weekend", "Skjut upp resten till en annan helg"], "c4", ["Safer for today's plans; loses the momentum.", "Säkrare för dagens planer; förlorar farten."])
        ])
      }),

      pg("c4", ["The key", "Nyckeln"], [
        "{{time.T+420|clock}}. The database files are restored, and encrypted. The backup encryption key is stored in the company password vault.\n\nThe password vault runs on a server that is restored from the same backup system, after the ERP system in the plan's order. To open the backup, you need a system that the plan restores later, from the backup.",
        "Klockan {{time.T+420|clock}}. Databasfilerna är återställda, och krypterade. Säkerhetskopiornas krypteringsnyckel förvaras i företagets lösenordsvalv.\n\nLösenordsvalvet körs på en server som återställs från samma backupsystem, efter affärssystemet i planens ordning. För att öppna säkerhetskopian behöver ni ett system som planen återställer senare, från säkerhetskopian."
      ], {
        discuss: [q("How would this have gone at 03:00 during a real ransomware attack?", "Hur hade det här gått klockan 03.00 under ett verkligt ransomwareangrepp?", ["ciso", "itOps"])],
        choice: ask(["How do you get the key?", "Hur får ni tag i nyckeln?"], ["Retrieves the escrowed copy properly and notes the circular dependency.", "Hämtar den deponerade kopian på rätt sätt och noterar det cirkulära beroendet."], [
          opt(["Retrieve the sealed paper copy from the safe with two keyholders", "Hämta den förseglade papperskopian ur kassaskåpet med två nyckelinnehavare"], "l2", ["Slow, controlled, and it exists.", "Långsamt, kontrollerat, och den finns."], { set: "keysFound" }),
          opt(["Restore the vault first, out of order", "Återställ valvet först, i fel ordning"], "l2", ["Works today. Changes the plan on the fly.", "Fungerar i dag. Ändrar planen i farten."]),
          opt(["Ask the backup vendor to bypass the encryption", "Be backupleverantören att gå förbi krypteringen"], "l2", ["If they can, so can others.", "Om de kan, så kan andra också."])
        ])
      }),

      pg("l2", ["What else it needs", "Vad mer det behöver"], [
        "The database is decrypted and the application server starts, and immediately stops. It cannot reach the identity service to check logins, or the licence server that the vendor requires.\n\nNeither appears in the restore plan. Both were added to the ERP setup years after the plan was written.",
        "Databasen är dekrypterad och applikationsservern startar, och stannar omedelbart. Den kan inte nå identitetstjänsten för att kontrollera inloggningar, eller licensservern som leverantören kräver.\n\nIngen av dem finns i återställningsplanen. Båda lades till i affärssystemets uppsättning flera år efter att planen skrevs."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you do?", "Vad gör ni?"], ["Restores the missing dependencies and adds them to the plan.", "Återställer de saknade beroendena och lägger till dem i planen."], [
          opt(["Restore them too, and update the plan", "Återställ dem också, och uppdatera planen"], "c5", ["Longer day, better plan.", "Längre dag, bättre plan."], { set: "logFindings" }),
          opt(["Bypass the licence check for the test", "Gå förbi licenskontrollen för testet"], "c5", ["The test passes; a real restore would not.", "Testet går igenom; en verklig återställning skulle inte göra det."])
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
          opt(["Record the measured time and the data loss as headline results", "Dokumentera den uppmätta tiden och dataförlusten som huvudresultat"], "l3", ["The truth, on one page.", "Sanningen, på en sida."]),
          opt(["Record “restore successful” with notes", "Dokumentera ”återställningen lyckades” med anteckningar"], "l3", ["Technically true.", "Tekniskt sant."])
        ])
      }),

      pg("l3", ["The users' view", "Användarnas syn"], [
        "On Monday, two people from finance and logistics look at the restored system with fresh eyes. They find what IT could not: price lists from last quarter, open orders that were closed weeks ago, a customer who has since gone bankrupt still marked as active.\n\nThey estimate three days of manual work to make the data usable again, after the restore.",
        "På måndagen tittar två personer från ekonomi och logistik på det återställda systemet med nya ögon. De hittar det IT inte kunde: prislistor från förra kvartalet, öppna order som stängdes för flera veckor sedan, en kund som sedan dess gått i konkurs fortfarande markerad som aktiv.\n\nDe uppskattar tre dagars manuellt arbete för att göra datan användbar igen, efter återställningen."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["Do you add this to the result?", "Lägger ni till det här i resultatet?"], ["Adds the business view to the recovery time.", "Lägger till verksamhetens syn i återställningstiden."], [
          opt(["Yes, the business view counts", "Ja, verksamhetens syn räknas"], "c6", ["Recovery is when people can work.", "Återställning är när folk kan arbeta."]),
          opt(["Keep it as a separate note", "Behåll det som en separat anteckning"], "c6", ["It will be read separately, if at all.", "Den kommer att läsas separat, om alls."])
        ])
      }),

      pg("c6", ["The report", "Rapporten"], [
        "The board's risk committee meets on Thursday, and the continuity test is on the agenda with a traffic light next to it. The plan says {{num.rto}} hours. The test measured {{num.actual}}, plus days of missing data and manual work.\n\nSome in the room worry that a red light will cost the IT budget its credibility. Others say a red light today is cheaper than a real incident tomorrow.",
        "Styrelsens riskutskott möts på torsdag, och kontinuitetstestet står på dagordningen med ett trafikljus bredvid. Planen säger {{num.rto}} timmar. Testet mätte {{num.actual}}, plus flera dagar av saknad data och manuellt arbete.\n\nEn del i rummet oroar sig för att ett rött ljus kommer att kosta IT-budgeten dess trovärdighet. Andra säger att ett rött ljus i dag är billigare än en verklig incident i morgon."
      ], {
        choice: ask(["What do you report?", "Vad rapporterar ni?"], ["Reports red, with the real numbers and a costed plan.", "Rapporterar rött, med de verkliga siffrorna och en kostnadsberäknad plan."], [
          opt(["Red, with the real numbers and a costed plan", "Rött, med de verkliga siffrorna och en kostnadsberäknad plan"], "c7", ["Uncomfortable, and useful.", "Obekvämt, och användbart."], { set: "honestReport" }),
          opt(["Amber: “restore completed, improvements identified”", "Gult: ”återställning genomförd, förbättringar identifierade”"], "c7", ["Softer, and the board may not ask.", "Mjukare, och styrelsen kanske inte frågar."]),
          opt(["Green: the restore worked", "Grönt: återställningen fungerade"], "x1", ["It did, eventually.", "Det gjorde den, till slut."], { set: "reportedGreen" })
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
          opt(["A realistic recovery target, funded, with dates", "Ett realistiskt återställningsmål, finansierat, med datum"], "l4", ["The board can decide on facts.", "Styrelsen kan besluta utifrån fakta."], { set: "rtoUpdated" }),
          opt(["Promise to fix it within the current budget", "Lova att rätta det inom nuvarande budget"], "l4", ["Brave. Unlikely.", "Modigt. Osannolikt."])
        ])
      }),

      pg("l4", ["The supplier", "Leverantören"], [
        "The backup vendor joins a call. Yes, the jobs failed for lack of space. Yes, the alerts were sent. No, the support contract does not include anyone watching your alerts for you.\n\nThey offer a monitoring add-on. {{person.supplierManager.name}} asks why the console showed a green tick on the main page while the jobs were failing.",
        "Backupleverantören deltar i ett samtal. Ja, jobben misslyckades på grund av utrymmesbrist. Ja, larmen skickades. Nej, supportavtalet omfattar inte att någon bevakar era larm åt er.\n\nDe erbjuder ett tillägg för övervakning. {{person.supplierManager.name}} frågar varför konsolen visade en grön bock på huvudsidan medan jobben misslyckades."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you change with the supplier?", "Vad ändrar ni med leverantören?"], ["Routes backup alerts to a watched queue and adds restore checks.", "Skickar backuplarm till en bevakad kö och lägger till återställningskontroller."], [
          opt(["Alerts to the on-call queue and automatic test restores", "Larm till beredskapskön och automatiska teståterställningar"], "c8", ["Failures become visible within a day.", "Misslyckanden blir synliga inom ett dygn."]),
          opt(["Buy the monitoring add-on", "Köp övervakningstillägget"], "c8", ["Someone still has to read it.", "Någon måste fortfarande läsa det."])
        ])
      }),

      pg("c8", ["The fix order", "Ordningen för åtgärder"], [
        "The whiteboard from Saturday has fourteen findings. The team cannot fix them all at once, and some are cheap while others need money and months.\n\nThe obvious ones are the backup job and the shared mailbox. The less obvious ones are the key in the vault, the forgotten dependencies, and the network link that made everything five times slower.",
        "Whiteboarden från lördagen har fjorton fynd. Teamet kan inte rätta alla på en gång, och en del är billiga medan andra kräver pengar och månader.\n\nDe självklara är säkerhetskopieringsjobbet och den gemensamma brevlådan. De mindre självklara är nyckeln i valvet, de glömda beroendena och nätverksförbindelsen som gjorde allt fem gånger långsammare."
      ], {
        choice: ask(["What do you fix first?", "Vad rättar ni först?"], ["Fixes what makes a restore impossible before what makes it slow.", "Rättar det som gör en återställning omöjlig före det som gör den långsam."], [
          opt(["Backups that work, the key outside the vault, then the dependencies", "Säkerhetskopior som fungerar, nyckeln utanför valvet, sedan beroendena"], "c9", ["Possible first, fast later.", "Möjligt först, snabbt sedan."]),
          opt(["The network link first: speed matters most", "Nätverksförbindelsen först: hastigheten betyder mest"], "c9", ["Fast restores of data you cannot decrypt.", "Snabba återställningar av data ni inte kan dekryptera."])
        ])
      }),

      pg("c9", ["The next test", "Nästa test"], [
        "{{person.cio.name}} asks when the next test should be. Some in the team would rather not do this again for a year. Others point out that every finding today was invisible for years, and that the fixes themselves need testing.\n\nThe auditors will also want to know whether this was a one-off or the start of a habit.",
        "{{person.cio.name}} frågar när nästa test ska vara. En del i teamet vill helst inte göra det här igen på ett år. Andra påpekar att varje fynd i dag var osynligt i flera år, och att själva åtgärderna behöver testas.\n\nRevisorerna kommer också att vilja veta om det här var en engångsföreteelse eller början på en vana."
      ], {
        choice: ask(["When is the next test?", "När är nästa test?"], ["Schedules regular tests, starting soon, to prove the fixes.", "Planerar regelbundna tester, med början snart, för att bevisa åtgärderna."], [
          opt(["Quarterly, starting in three months", "Varje kvartal, med början om tre månader"], "c10", ["Turns a test into a habit.", "Gör ett test till en vana."], { set: "testPlanned" }),
          opt(["Next year", "Nästa år"], "c10", ["The findings will be a year old.", "Fynden kommer att vara ett år gamla."])
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "A month later. The backups have run every night since, and someone now reads the alerts. The key has a sealed copy in two places. The plan has been rewritten.\n\nThe team meets one last time to agree what changes for good, now that everyone knows how far the old plan was from the truth.",
        "En månad senare. Säkerhetskopieringen har körts varje natt sedan dess, och någon läser nu larmen. Nyckeln har en förseglad kopia på två ställen. Planen har skrivits om.\n\nTeamet träffas en sista gång för att komma överens om vad som ändras för gott, nu när alla vet hur långt den gamla planen var från sanningen."
      ], {
        choice: ask(["What changes for good?", "Vad ändras för gott?"], ["Makes recovery testing a routine with honest reporting.", "Gör återställningstester till en rutin med ärlig rapportering."], [
          opt(["Regular restore tests with honest results to the board", "Regelbundna återställningstester med ärliga resultat till styrelsen"], "r-end", ["The plan stays true.", "Planen förblir sann."]),
          opt(["A new backup product", "En ny backupprodukt"], "r-end", ["Different product, same untested plan.", "Annan produkt, samma otestade plan."]),
          opt(["A longer recovery target on paper", "Ett längre återställningsmål på papper"], "r-end", ["Honest, and nothing else changes.", "Ärligt, och inget annat ändras."])
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
          opt(["Go back to the committee with the real numbers", "Gå tillbaka till utskottet med de verkliga siffrorna"], "x2", ["Awkward, and right.", "Pinsamt, och rätt."]),
          opt(["Leave it; the fixes can come from the normal budget", "Låt det vara; åtgärderna kan komma från den vanliga budgeten"], "x2", ["They will not.", "Det kommer de inte att göra."])
        ])
      }),
      pg("x2", ["Three months later: Friday night", "Tre månader senare: fredag kväll"], [
        "Ransomware. The ERP system and its backups server are hit on a Friday night. The backups themselves survived, because two of the fourteen findings were fixed.\n\nThe board's minutes say recovery takes {{num.rto}} hours. The team knows it takes at least {{num.actual}}, if the key can be found and the dependencies remembered.",
        "Ransomware. Affärssystemet och backupservern drabbas en fredagskväll. Själva säkerhetskopiorna klarade sig, eftersom två av de fjorton fynden hade rättats.\n\nStyrelsens protokoll säger att återställningen tar {{num.rto}} timmar. Teamet vet att den tar minst {{num.actual}}, om nyckeln kan hittas och beroendena kommer ihåg."
      ], {
        choice: ask(["What do you tell the CEO at midnight?", "Vad säger ni till vd vid midnatt?"], ["Gives the real recovery estimate immediately.", "Ger den verkliga uppskattningen av återställningen omedelbart."], [
          opt(["The real estimate, and why it differs from the plan", "Den verkliga uppskattningen, och varför den skiljer sig från planen"], "x3", ["The hardest call of the night.", "Nattens svåraste samtal."]),
          opt(["“We're working to the plan”", "”Vi arbetar enligt planen”"], "x3", ["The plan says Saturday morning.", "Planen säger lördag morgon."])
        ])
      }),
      pg("x3", ["Saturday", "Lördag"], [
        "The restore hits every finding from the test, in order: the slow link, the key in the vault, the licence server, the identity service. The team has done it once before, which helps.\n\nCustomers were told on Friday night that systems would be back by Saturday morning, based on the plan. They are not.",
        "Återställningen stöter på varje fynd från testet, i tur och ordning: den långsamma förbindelsen, nyckeln i valvet, licensservern, identitetstjänsten. Teamet har gjort det en gång tidigare, vilket hjälper.\n\nKunderna fick på fredagskvällen höra att systemen skulle vara tillbaka till lördag morgon, utifrån planen. Det är de inte."
      ], {
        choice: ask(["What do you tell customers?", "Vad säger ni till kunderna?"], ["Corrects the estimate honestly.", "Rättar uppskattningen ärligt."], [
          opt(["A corrected, honest estimate", "En rättad, ärlig uppskattning"], "x4", ["Better late.", "Hellre sent."]),
          opt(["“Shortly”", "”Inom kort”"], "x4", ["Repeated every few hours.", "Upprepat med några timmars mellanrum."])
        ])
      }),
      pg("x4", ["The board", "Styrelsen"], [
        "On Monday the board asks the obvious question. Its minutes from three months ago say recovery capability was confirmed by test. The actual recovery took {{num.actual}} hours and lost {{num.days}} days of data.\n\nThe team's list of fourteen findings is still in the shared folder, dated the day of the test.",
        "På måndagen ställer styrelsen den självklara frågan. Dess protokoll från tre månader sedan säger att återställningsförmågan bekräftats genom test. Den faktiska återställningen tog {{num.actual}} timmar och förlorade {{num.days}} dagars data.\n\nTeamets lista med fjorton fynd ligger fortfarande i den gemensamma mappen, daterad dagen för testet."
      ], {
        choice: ask(["How do you answer the board?", "Hur svarar ni styrelsen?"], ["Shows the list and owns the green report.", "Visar listan och tar ansvar för den gröna rapporten."], [
          opt(["Show the list and own the decision", "Visa listan och ta ansvar för beslutet"], "e5", ["Painful and necessary.", "Smärtsamt och nödvändigt."]),
          opt(["Blame the backup vendor", "Skyll på backupleverantören"], "e5", ["The list says otherwise.", "Listan säger något annat."])
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
