/*
 * b12-logic-bomb.js — "The Payday Script" (branching, insider sabotage).
 *
 * At 03:00 on payday the ERP system wipes the payroll run and locks out the
 * administrators. A scheduled task planted by a system administrator laid off
 * three weeks ago. Spine: first move → not a crash → paying staff → the
 * access he kept → the police → the post → the auditor → the bank → the team
 * that stayed → what changes. Break-away at § "The post": naming him publicly.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, pb, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b12-logic-bomb",
    version: 1,
    format: "branching",
    category: "insider-sabotage",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "logic-bomb",
    title: L(["The Payday Script", "Lönedagsskriptet"]),
    summary: L([
      "On payday at three in the morning, the payroll run disappears and the administrators are locked out. It is not a crash. Someone who left the company three weeks ago did not leave everything behind.",
      "På lönedagen klockan tre på natten försvinner lönekörningen och administratörerna låses ute. Det är ingen krasch. Någon som lämnade företaget för tre veckor sedan lämnade inte allt bakom sig."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Recover from sabotage without destroying the evidence", "Återhämta sig från sabotage utan att förstöra bevisen"]), teaser: L(["Fixing and remembering", "Att laga och minnas"]) },
      { id: "lo2", text: L(["Find everything an insider may have planted", "Hitta allt en insider kan ha placerat ut"]), teaser: L(["One timer, or more?", "En timer, eller fler?"]) },
      { id: "lo3", text: L(["Keep staff paid when the payroll system is gone", "Se till att personalen får lön när lönesystemet är borta"]), teaser: L(["People before systems", "Människor före system"]) },
      { id: "lo4", text: L(["Close the offboarding gaps that made it possible", "Stänga luckorna i avvecklingen som gjorde det möjligt"]), teaser: L(["Doors left open on the way out", "Dörrar som lämnades öppna på vägen ut"]) }
    ],
    mitre: ["T1053", "T1078", "T1485", "T1531", "T1489"],
    frameworks: {
      nistCsf: ["PR.AA", "PR.PS", "DE.CM", "RS.AN", "RS.MI", "RC.RP", "GV.RR"],
      iso27001: ["A.5.11", "A.5.15", "A.5.18", "A.5.28", "A.6.5", "A.8.2", "A.8.5", "A.8.13", "A.8.15"]
    },
    constraints: { startWindow: "night", startTime: "03:00" },
    actor: { types: ["insider"], motivation: L(["Revenge for being laid off", "Hämnd för att ha blivit uppsagd"]), capability: "medium" },
    variables: {
      staff: { min: 120, max: 2400, scaleBy: "size", step: 10 },
      payroll: { min: 2000000, max: 80000000, scaleBy: "size", step: 100000, currency: true },
      serviceAccounts: { min: 6, max: 60, scaleBy: "size" }
    },
    roles: ["incidentCommander", "ciso", "itOps", "socLead", "hr", "legal", "cfo", "ceo", "comms"],

    flags: {
      reImaged: L(["Restored server taken down again for evidence", "Den återställda servern nedtagen igen för bevisning"]),
      restoredFast: L(["Restored before preserving evidence", "Återställt innan bevisen säkrades"]),
      evidenceKept: L(["Evidence preserved first", "Bevisen säkrade först"]),
      huntedTasks: L(["Searched for other planted tasks", "Sökte efter andra utplacerade uppgifter"]),
      paidOnTime: L(["Staff paid on time", "Personalen fick lön i tid"]),
      policeReport: L(["Reported to the police", "Polisanmält"]),
      rotated: L(["Every credential he knew was rotated", "Varje inloggning han kände till byttes"]),
      accused: L(["Named him publicly", "Pekade ut honom offentligt"])
    },

    start: "c1",
    pages: [
      pg("c1", ["Payday, 03:00", "Lönedag, 03.00"], [
        "{{time.T+0|weekday|cap}}, {{time.T+5|clock}}. The on-call engineer is woken by a flood of alerts from the ERP system. Today's payroll run, scheduled for the bank at 06:00, has been deleted. All four administrator accounts are locked.\n\nThe server itself is running normally. Nothing is encrypted and there is no ransom note. Everything simply stopped working at exactly three o'clock.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+5|clock}}. Beredskapsteknikern väcks av en flod av larm från affärssystemet. Dagens lönekörning, som skulle till banken klockan 06.00, har raderats. Alla fyra administratörskonton är låsta.\n\nSjälva servern går normalt. Inget är krypterat och det finns inget krav på lösensumma. Allt slutade helt enkelt fungera exakt klockan tre."
      ], {
        injects: [
          inj("b12-1", 5, "siemAlert", "siem", "critical", "confirmed", [
            "ERP: payroll batch PR-{{time.T+0|date}} deleted 03:00:02. Administrator accounts adm01–adm04 locked 03:00:04. Initiated by: scheduled task “maint_cleanup” (service account svc-erp-maint).",
            "Affärssystemet: lönekörningen PR-{{time.T+0|date}} raderad 03.00.02. Administratörskontona adm01–adm04 låsta 03.00.04. Startad av: schemalagd uppgift ”maint_cleanup” (tjänstekonto svc-erp-maint)."
          ], { tests: ["lo1"] })
        ],
        discuss: [q("What do you need to keep before anyone touches the server?", "Vad behöver ni spara innan någon rör servern?", ["socLead"]), q("Who must be awake before 06:00?", "Vem måste vara vaken före 06.00?", ["incidentCommander"])],
        facilitator: { notes: L(["The pressure is payday. Watch whether evidence survives the rush.", "Trycket är lönedagen. Se om bevisen överlever brådskan."]) },
        choice: ask(["What do you do first?", "Vad gör ni först?"], ["Snapshots the server and logs before restoring, then restores fast.", "Tar en ögonblicksbild av servern och loggarna före återställningen, och återställer sedan snabbt."], [
          opt(["Snapshot the server and logs, then restore", "Ta en ögonblicksbild av server och loggar, återställ sedan"], "c2", ["Costs twenty minutes. Keeps the story of what happened.", "Kostar tjugo minuter. Behåller berättelsen om vad som hände."], {
            set: "evidenceKept",
            pushback: [
              pb(["Twenty minutes becomes forty", "Tjugo minuter blir fyrtio"], ["The storage engineer says the snapshot of the database will take forty minutes, not twenty. The payroll file was due at the bank before anyone in the office is even awake. Do you stop the snapshot halfway and restore, or let payroll slip further?", "Lagringsteknikern säger att ögonblicksbilden av databasen tar fyrtio minuter, inte tjugo. Lönefilen skulle ha varit hos banken innan någon på kontoret ens vaknat. Avbryter ni ögonblicksbilden halvvägs och återställer, eller låter ni lönerna glida ännu mer?"]),
              pb(["The task is still there", "Uppgiften finns kvar"], ["While the snapshot runs, someone points out that “maint_cleanup” is still enabled on the server, and nobody knows whether it runs again. Disabling it changes the very thing you are trying to preserve. Do you touch it now, or leave a live trigger in place to keep the evidence clean?", "Medan ögonblicksbilden körs påpekar någon att ”maint_cleanup” fortfarande är aktiv på servern, och ingen vet om den körs igen. Att inaktivera den ändrar just det ni försöker bevara. Rör ni den nu, eller lämnar ni en aktiv utlösare kvar för att hålla bevisen rena?"]),
              pb(["“Why are you taking pictures?”", "”Varför tar ni bilder?”"], ["The CFO joins the call and asks why engineers are copying disks instead of fixing payroll, when thousands of people expect their salary today. Nobody has said the word sabotage yet. Who explains why evidence comes first, and would you say the same to the staff?", "Ekonomichefen ansluter till samtalet och frågar varför teknikerna kopierar diskar i stället för att laga lönerna, när tusentals väntar på lön i dag. Ingen har sagt ordet sabotage ännu. Vem förklarar varför bevisen går först, och skulle ni säga samma sak till personalen?"])
            ]
          }),
          opt(["Restore from last night's backup immediately", "Återställ från nattens säkerhetskopia omedelbart"], "c2", ["Fastest route to payroll. Overwrites the traces.", "Snabbaste vägen till lönekörningen. Skriver över spåren."], {
            set: "restoredFast",
            pushback: [
              pb(["Last night's backup", "Nattens säkerhetskopia"], ["If the scheduled task existed yesterday, it is in last night's backup too. The restore may bring back the exact thing that wiped payroll, ready to run again. Do you know what you are restoring, and are you willing to find out the hard way?", "Om den schemalagda uppgiften fanns i går finns den också i nattens säkerhetskopia. Återställningen kan ta tillbaka precis det som raderade lönerna, redo att köras igen. Vet ni vad ni återställer, och är ni beredda att ta reda på det den hårda vägen?"]),
              pb(["Nobody copied the logs", "Ingen kopierade loggarna"], ["Legal calls in and asks whether anyone saved the logs before the restore started. The answer is no, and the restore is already overwriting them. If this turns out to be deliberate, what will you show anyone? Do you pause the restore now?", "Juristen ringer in och frågar om någon sparade loggarna innan återställningen började. Svaret är nej, och återställningen skriver redan över dem. Om det här visar sig vara avsiktligt, vad ska ni då visa upp? Pausar ni återställningen nu?"]),
              pb(["The engineer wants it in writing", "Teknikern vill ha det skriftligt"], ["The on-call engineer hesitates: a deleted payroll and four locked administrators at exactly three o'clock does not look like an accident. They ask for written approval before overwriting the server. Who in the room signs that, by name?", "Beredskapsteknikern tvekar: en raderad lönekörning och fyra låsta administratörer exakt klockan tre ser inte ut som en olycka. Hen vill ha ett skriftligt godkännande innan servern skrivs över. Vem i rummet skriver under det, med namn?"])
            ]
          }),
          opt(["Disconnect the ERP server from the network", "Koppla bort affärssystemets server från nätverket"], "c2", ["Stops anything else firing. Also stops payroll.", "Stoppar allt annat från att starta. Stoppar också lönekörningen."], {
            pushback: [
              pb(["Payroll stops too", "Lönerna stoppas också"], ["With the server off the network, no payment file can leave the ERP system for the bank, and nobody can work on it remotely. The bank's same-day cut-off is getting closer by the hour. How long do you keep it disconnected, and how do people get paid meanwhile?", "Med servern bortkopplad kan ingen betalningsfil gå från affärssystemet till banken, och ingen kan arbeta i det på distans. Bankens brytpunkt för samma dag närmar sig för varje timme. Hur länge håller ni den bortkopplad, och hur får folk lön under tiden?"]),
              pb(["The morning shift can't clock in", "Morgonskiftet kan inte stämpla in"], ["Time reporting, invoicing and warehouse orders all run through the same ERP system. The first shift starts soon and their managers are already asking why nothing loads. Who tells them, what do you tell them, and for how long?", "Tidrapportering, fakturering och lagerorder går alla genom samma affärssystem. Första skiftet börjar snart och deras chefer frågar redan varför ingenting laddar. Vem berättar för dem, vad säger ni och hur länge gäller det?"]),
              pb(["It ran from the inside", "Den kördes inifrån"], ["The alert shows the task ran on the server itself, under its own service account. Pulling the network cable does not stop anything scheduled locally. What exactly does disconnecting protect you from, and is that worth stopping payroll for?", "Larmet visar att uppgiften kördes på själva servern, under dess eget tjänstekonto. Att dra ur nätverkskabeln stoppar inget som är schemalagt lokalt. Vad är det egentligen bortkopplingen skyddar er mot, och är det värt att stoppa lönerna för?"])
            ]
          })
        ])
      }),

      pg("c2", ["Not a crash", "Ingen krasch"], [
        "{{person.socLead.name}} reads the scheduled task. It was created six weeks ago, under the ERP maintenance service account, and given an innocent name. Its script deletes the payroll batch and locks every administrator.\n\nThe account that created it belongs to a system administrator who was laid off in the reorganisation three weeks ago. His personal accounts were closed on his last day. The service account was not.",
        "{{person.socLead.name}} läser den schemalagda uppgiften. Den skapades för sex veckor sedan, under affärssystemets tjänstekonto för underhåll, och fick ett oskyldigt namn. Skriptet raderar lönekörningen och låser varje administratör.\n\nKontot som skapade den tillhör en systemadministratör som sades upp i omorganisationen för tre veckor sedan. Hans personliga konton stängdes hans sista dag. Tjänstekontot gjorde det inte."
      ], {
        variants: [vr("restoredFast", [
          "The restore is running, and with it the scheduled task's own log is being overwritten. {{person.socLead.name}} manages to read part of it first: created six weeks ago, under the ERP maintenance service account, with an innocent name.\n\nThe account that created it belongs to a system administrator laid off three weeks ago. His personal accounts were closed. The service account was not.",
          "Återställningen pågår, och med den skrivs den schemalagda uppgiftens egen logg över. {{person.socLead.name}} hinner läsa en del av den först: skapad för sex veckor sedan, under affärssystemets tjänstekonto för underhåll, med ett oskyldigt namn.\n\nKontot som skapade den tillhör en systemadministratör som sades upp för tre veckor sedan. Hans personliga konton stängdes. Tjänstekontot gjorde det inte."
        ], ["Because you restored first, part of the trail is already gone.", "Eftersom ni återställde först är en del av spåret redan borta."])],
        choice: ask(["What now?", "Vad gör ni nu?"], ["Looks for other planted tasks across every system he could reach.", "Letar efter andra utplacerade uppgifter i varje system han kunde nå."], [
          opt(["Search every server for tasks he created", "Sök igenom varje server efter uppgifter han skapat"], "l1", ["If he planted one, he may have planted more.", "Om han placerade ut en kan han ha placerat ut fler."], {
            set: "huntedTasks",
            pushback: [
              pb(["Who leaves payroll?", "Vem lämnar lönerna?"], ["Searching every server takes hours, and the only people who know those servers are the ones rebuilding payroll. Every engineer you put on the hunt is one fewer on the payment file. Who do you take off payroll, knowing the bank's cut-off will not move?", "Att söka igenom varje server tar timmar, och de enda som känner servrarna är de som bygger om lönerna. Varje tekniker ni sätter på sökandet är en mindre på betalningsfilen. Vem tar ni från lönerna, när bankens brytpunkt inte flyttas?"]),
              pb(["“Are you searching us too?”", "”Söker ni igenom oss också?”"], ["The engineers who know where to look worked beside him for nine years. One asks quietly whether the search covers their own accounts as well. How do you run a hunt for his traces without making the people doing it feel like suspects?", "Teknikerna som vet var man ska leta arbetade bredvid honom i nio år. En av dem frågar tyst om sökningen också omfattar deras egna konton. Hur letar ni efter hans spår utan att de som letar känner sig misstänkta?"]),
              pb(["Looking for what?", "Letar efter vad?"], ["The search is for tasks created by one service account. Someone asks what happens if he used a different account, a different name or a different system. When will you know the search is finished, and who decides that it is?", "Sökningen gäller uppgifter skapade av ett tjänstekonto. Någon frågar vad som händer om han använde ett annat konto, ett annat namn eller ett annat system. När vet ni att sökningen är klar, och vem bestämmer det?"])
            ]
          }),
          opt(["Focus everything on getting payroll out today", "Lägg allt på att få ut lönerna i dag"], "l1", ["The urgent problem. Not the only one.", "Det brådskande problemet. Inte det enda."], {
            pushback: [
              pb(["The account still works", "Kontot fungerar fortfarande"], ["The maintenance service account he used is still enabled, with the same password as yesterday. With everyone on payroll, nobody owns that problem this morning. Who is watching what that account does while you build the payment file?", "Underhållskontot han använde är fortfarande aktivt, med samma lösenord som i går. När alla jobbar med lönerna äger ingen det problemet i morse. Vem bevakar vad det kontot gör medan ni bygger betalningsfilen?"]),
              pb(["The SOC lead objects", "SOC-chefen invänder"], ["{{person.socLead.name}} says that finding one planted task means nobody has looked for a second yet. Paying people today matters, but so does knowing what else is waiting. Is today's payroll really more urgent than finding out whether this happens again?", "{{person.socLead.name}} säger att en hittad utplacerad uppgift betyder att ingen har letat efter en andra ännu. Att betala folk i dag är viktigt, men det är också att veta vad mer som väntar. Är dagens löner verkligen mer brådskande än att ta reda på om det här händer igen?"]),
              pb(["The same server", "Samma server"], ["The payroll rebuild is running on the server he had access to for weeks after he left. Nobody has checked what else he changed on it. Do you trust the machine you are rebuilding payroll on, and what would it take to be sure?", "Lönerna byggs om på den server han hade åtkomst till i veckor efter att han slutade. Ingen har kontrollerat vad mer han ändrade där. Litar ni på maskinen ni bygger om lönerna på, och vad skulle det krävas för att vara säker?"])
            ]
          }),
          opt(["Call the former administrator and ask him directly", "Ring den tidigare administratören och fråga honom direkt"], "c3b", ["You will learn something, and so will he.", "Ni kommer att få veta något, och det kommer han också."], {
            pushback: [
              pb(["HR doesn't want to call", "HR vill inte ringa"], ["{{person.hr.name}} warns that calling a former employee in the early morning about a suspected crime, without a lawyer, could damage both the legal case and the employment dispute. Who makes the call, and what exactly are they allowed to say?", "{{person.hr.name}} varnar för att ringa en tidigare anställd tidigt på morgonen om ett misstänkt brott, utan jurist, kan skada både rättsfallet och den arbetsrättsliga tvisten. Vem ringer, och vad får den personen egentligen säga?"]),
              pb(["The door is still open", "Dörren står fortfarande öppen"], ["The service account he used still works. If he did this, a phone call tells him you have noticed before you have closed anything. Do you call first, or lock the account first, and what does the order say about your priorities?", "Tjänstekontot han använde fungerar fortfarande. Om det var han, så får han genom ett samtal veta att ni märkt det innan ni stängt något. Ringer ni först eller låser ni kontot först, och vad säger ordningen om era prioriteringar?"]),
              pb(["Is it really him?", "Är det verkligen han?"], ["What you know is that a shared service account created the task, and that the account was his to manage. Someone asks who else had that password. Do you have enough to put this to him directly, before dawn, as if you were sure?", "Det ni vet är att ett delat tjänstekonto skapade uppgiften, och att kontot var hans att förvalta. Någon frågar vem mer som hade det lösenordet. Har ni tillräckligt för att konfrontera honom direkt, före gryningen, som om ni vore säkra?"])
            ]
          })
        ])
      }),

      pg("l1", ["The other timers", "De andra timrarna"], [
        "The search takes two hours across every server the maintenance account could reach. It finds two more tasks with the same author and the same innocent naming.\n\nOne is set for the last day of next month, at the same minute. The other is set for quarter-end, and its script deletes the backup catalogue before doing anything else.",
        "Sökningen tar två timmar över varje server som underhållskontot kunde nå. Den hittar två uppgifter till med samma upphovsperson och samma oskyldiga namngivning.\n\nDen ena är inställd på sista dagen nästa månad, samma minut. Den andra är inställd på kvartalsskiftet, och dess skript raderar katalogen över säkerhetskopior innan det gör något annat."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you do with them?", "Vad gör ni med dem?"], ["Disables them, keeps copies as evidence, and keeps looking.", "Inaktiverar dem, behåller kopior som bevis och fortsätter leta."], [
          opt(["Disable both, keep copies, and widen the search", "Inaktivera båda, behåll kopior och bredda sökningen"], "c3", ["Thorough. The search may find nothing more, or something.", "Grundligt. Sökningen kanske inte hittar något mer, eller något."], {
            set: "huntedTasks",
            pushback: [
              pb(["Another day of searching", "Ännu en dag av sökande"], ["Widening the search means backup systems, network equipment and every cloud service the team uses, and it will take at least another day from people who have not slept. Where do you draw the line, and who decides it is enough?", "Att bredda sökningen betyder säkerhetskopiering, nätverksutrustning och varje molntjänst teamet använder, och det tar minst ett dygn till av folk som inte har sovit. Var drar ni gränsen, och vem bestämmer att det räcker?"]),
              pb(["Disabling changes the evidence", "Att inaktivera ändrar bevisen"], ["Disabling the tasks updates their timestamps and settings, and a defence lawyer may later ask what else you changed. Legal wants every step written down and witnessed. Do you slow the work down to document it, or disable now and explain later?", "Att inaktivera uppgifterna uppdaterar deras tidsstämplar och inställningar, och en försvarsadvokat kan senare fråga vad mer ni ändrade. Juristen vill ha varje steg nedskrivet och bevittnat. Saktar ni ner arbetet för att dokumentera, eller inaktiverar ni nu och förklarar sen?"]),
              pb(["Disabled is not gone", "Inaktiverad är inte borta"], ["Anyone with the maintenance account can simply re-enable a disabled task, and that account still works. Disabling two timers while the key to them is unchanged may be a comfort more than a fix. What have you really stopped?", "Vem som helst med underhållskontot kan helt enkelt aktivera en inaktiverad uppgift igen, och det kontot fungerar fortfarande. Att inaktivera två timrar medan nyckeln till dem är oförändrad kan vara mer tröst än åtgärd. Vad har ni egentligen stoppat?"])
            ]
          }),
          opt(["Delete both and move on", "Radera båda och gå vidare"], "c3", ["Safe for now, and the evidence goes with them.", "Säkert för stunden, och bevisen försvinner med dem."], {
            pushback: [
              pb(["Legal is not pleased", "Juristen är inte nöjd"], ["Two more planted tasks were the clearest proof that this was planned, not a mistake. {{person.legal.name}} asks whether they can be recovered, and whether you will say in a police report that you deleted them. What do you answer?", "Två till utplacerade uppgifter var det tydligaste beviset för att det här var planerat och inget misstag. {{person.legal.name}} frågar om de går att återskapa, och om ni tänker skriva i en polisanmälan att ni raderade dem. Vad svarar ni?"]),
              pb(["Why stop at two?", "Varför sluta vid två?"], ["Deleting them and moving on means the search ends with what it happened to find. The same author made three tasks; nothing says three is the total. What makes you confident there is not a fourth, and would you sign that?", "Att radera dem och gå vidare betyder att sökningen slutar med det den råkade hitta. Samma upphovsperson gjorde tre uppgifter; inget säger att tre är allt. Vad gör er säkra på att det inte finns en fjärde, och skulle ni skriva under på det?"]),
              pb(["The backups still have them", "Säkerhetskopiorna har dem kvar"], ["Both tasks are in every backup taken over the past weeks. The next restore, for any reason, brings them back silently. Do you clean the backups as well, destroying more evidence, or accept that a restore could re-arm them?", "Båda uppgifterna finns i varje säkerhetskopia från de senaste veckorna. Nästa återställning, av vilket skäl som helst, tar tillbaka dem i tysthet. Rensar ni säkerhetskopiorna också, och förstör mer bevis, eller accepterar ni att en återställning kan väcka dem igen?"])
            ]
          })
        ])
      }),

      pg("c3", ["Payday", "Lönedag"], [
        "{{time.T+300|clock}}. {{num.staff|number}} people expect their salaries today. The bank's cut-off for same-day payments is 14:00. The ERP system will not be trustworthy for hours, perhaps days.\n\n{{person.cfo.name}} has last month's payment file and a spreadsheet of this month's changes: new starters, leavers, overtime. It is rough, but it exists.",
        "Klockan {{time.T+300|clock}}. {{num.staff|number}} personer väntar sig lön i dag. Bankens brytpunkt för betalningar samma dag är 14.00. Affärssystemet kommer inte att vara pålitligt på flera timmar, kanske dagar.\n\n{{person.cfo.name}} har förra månadens betalningsfil och ett kalkylblad med den här månadens ändringar: nyanställda, avgångar, övertid. Det är grovt, men det finns."
      ], {
        chart: { id: "b12-kpi", type: "kpi", title: L(["Payday at risk", "Lönedagen i fara"]), data: kpi([
          { id: "k1", label: ["Employees to pay", "Anställda som ska få lön"], value: (v) => v.staff, tone: "warn" },
          { id: "k2", label: ["Payroll value (million)", "Lönesumma (miljoner)"], value: (v) => v.payroll, tone: "warn" },
          { id: "k3", label: ["Hours to bank cut-off", "Timmar till bankens brytpunkt"], value: 9, tone: "danger" }
        ]) },
        choice: ask(["How do you pay people today?", "Hur betalar ni folk i dag?"], ["Pays staff on time from the best available data, with corrections next month.", "Betalar personalen i tid utifrån bästa tillgängliga data, med rättelser nästa månad."], [
          opt(["Build a payment file from last month plus this month's changes", "Bygg en betalningsfil från förra månaden plus den här månadens ändringar"], "c4", ["Some errors, corrected later. Everyone is paid today.", "En del fel, som rättas senare. Alla får lön i dag."], {
            effects: { trust: 1 }, set: "paidOnTime",
            pushback: [
              pb(["The spreadsheet is wrong", "Kalkylbladet stämmer inte"], ["HR checks the spreadsheet and finds leavers still listed as paid and overtime that was never approved. Fixing it properly would take most of the time left before the bank's cut-off. Do you send a file you know contains errors, or risk missing the deadline?", "HR går igenom kalkylbladet och hittar personer som slutat men fortfarande står med lön, och övertid som aldrig godkänts. Att rätta det ordentligt tar det mesta av tiden som är kvar till bankens brytpunkt. Skickar ni en fil ni vet innehåller fel, eller riskerar ni att missa tiden?"]),
              pb(["Who approves it?", "Vem godkänner den?"], ["The ERP system normally enforces two approvals on payroll. This file was built by hand, in a spreadsheet, by two tired people. Who signs off on paying out a whole month's salaries from it, and what are they actually checking?", "Affärssystemet kräver normalt två godkännanden av lönerna. Den här filen byggdes för hand, i ett kalkylblad, av två trötta personer. Vem skriver under på att betala ut en hel månads löner från den, och vad kontrollerar den personen egentligen?"]),
              pb(["The union asks about corrections", "Facket frågar om rättelser"], ["A union representative asks how errors will be fixed, and whether anyone paid too much will have to pay it back. Some staff will notice the difference before you do. What do you promise today, and can you keep it?", "En facklig företrädare frågar hur felen ska rättas, och om de som fått för mycket måste betala tillbaka. En del anställda kommer att märka skillnaden före er. Vad lovar ni i dag, och kan ni hålla det?"])
            ]
          }),
          opt(["Delay payroll by a day and tell staff why", "Skjut upp lönen en dag och berätta varför"], "c4", ["Honest and safer, and some staff have bills due today.", "Ärligt och säkrare, och en del anställda har räkningar som förfaller i dag."], {
            effects: { trust: -1 },
            pushback: [
              pb(["Rent is due today", "Hyran ska betalas i dag"], ["Within an hour of the message, HR has calls from staff with rent, loans and childcare due today. One asks whether the company will cover late fees. Do you pay them, for everyone, and how will you know who was affected?", "Inom en timme efter beskedet får HR samtal från anställda med hyra, lån och barnomsorg som ska betalas i dag. En frågar om företaget står för förseningsavgifterna. Betalar ni dem, för alla, och hur vet ni vilka som drabbades?"]),
              pb(["“Can they pay us?”", "”Har de råd att betala oss?”"], ["In the canteen, a delayed payday is turning into a question about whether the company has money problems. A supplier has already heard the rumour. How do you stop a one-day delay from sounding like a solvency crisis, without saying why it happened?", "I personalmatsalen håller en försenad lönedag på att bli en fråga om företaget har pengaproblem. En leverantör har redan hört ryktet. Hur hindrar ni en dags försening från att låta som en betalningskris, utan att säga varför den hände?"]),
              pb(["Is tomorrow realistic?", "Är i morgon realistiskt?"], ["IT says the ERP system may not be trustworthy for days, not hours. You have just promised staff their pay tomorrow. If tomorrow fails too, what do you tell them, and would it have been better to pay roughly today?", "IT säger att affärssystemet kanske inte går att lita på på flera dagar, inte timmar. Ni har just lovat personalen lön i morgon. Om i morgon också misslyckas, vad säger ni då, och hade det varit bättre att betala ungefärligt i dag?"])
            ]
          }),
          opt(["Pay everyone exactly last month's amount", "Betala alla exakt förra månadens belopp"], "c4", ["Simple, and wrong for everyone who changed.", "Enkelt, och fel för alla som har förändringar."], {
            set: "paidOnTime",
            pushback: [
              pb(["Leavers get paid again", "De som slutat får lön igen"], ["Last month's file includes people who have since left, some of them in the same reorganisation. They will get a full extra salary today. Do you chase each of them for the money, and what does that conversation sound like right now?", "Förra månadens fil innehåller personer som har slutat sedan dess, en del i samma omorganisation. De får en hel extra lön i dag. Kräver ni tillbaka pengarna av var och en, och hur låter det samtalet just nu?"]),
              pb(["New starters get nothing", "Nyanställda får ingenting"], ["Everyone who started this month is not in last month's file. Their first payday at the company will be zero. Who calls them before they check their bank account, and what do you say?", "Alla som började den här månaden finns inte i förra månadens fil. Deras första lönedag hos er blir noll. Vem ringer dem innan de tittar på sitt bankkonto, och vad säger ni?"]),
              pb(["Knowingly wrong", "Medvetet fel"], ["Staff who worked heavy overtime will be underpaid, and the union says paying amounts you know are wrong may break the collective agreement. Fixing it next month is not the same as paying correctly. How do you defend a choice you know is wrong for so many people?", "Anställda som jobbat mycket övertid får för lite, och facket säger att betala belopp ni vet är fel kan bryta mot kollektivavtalet. Att rätta det nästa månad är inte samma sak som att betala rätt. Hur försvarar ni ett val ni vet är fel för så många?"])
            ]
          })
        ])
      }),

      pg("c3b", ["The phone call", "Telefonsamtalet"], [
        "{{person.hr.name}} calls the former administrator. He answers sleepily, listens, and denies everything. Then, after a pause, he says that perhaps the company should have thought about what it was doing before it let people go.\n\nHe ends the call by saying he will speak only through a lawyer. Whatever he knew before the call, he now knows that you know.",
        "{{person.hr.name}} ringer den tidigare administratören. Han svarar sömnigt, lyssnar och förnekar allt. Sedan, efter en paus, säger han att företaget kanske borde ha tänkt på vad det gjorde innan det sa upp folk.\n\nHan avslutar samtalet med att säga att han bara kommer att prata via en advokat. Vad han än visste före samtalet vet han nu att ni vet."
      ], {
        choice: ask(["What do you do after the call?", "Vad gör ni efter samtalet?"], ["Preserves everything and goes to the police; no further contact.", "Säkrar allt och går till polisen; ingen ytterligare kontakt."], [
          opt(["Preserve everything and report to the police", "Säkra allt och anmäl till polisen"], "c4", ["The right route, and he may already be cleaning up.", "Rätt väg, och han kanske redan städar."], {
            set: "policeReport",
            pushback: [
              pb(["The account is still open", "Kontot är fortfarande öppet"], ["While legal prepares the report, the maintenance service account is still enabled with the password he knew. Locking it may break overnight maintenance jobs; leaving it open after the call is a gamble. Which risk do you take while you wait for the police?", "Medan juristen förbereder anmälan är underhållskontot fortfarande aktivt med lösenordet han kände till. Att låsa det kan stoppa nattliga underhållsjobb; att lämna det öppet efter samtalet är ett vågspel. Vilken risk tar ni medan ni väntar på polisen?"]),
              pb(["Not today", "Inte i dag"], ["The police take the report and say an investigator will be in touch, probably within weeks. Nobody is coming this morning. Is a report enough on its own, or do you need to act yourselves in the meantime, and how without spoiling the case?", "Polisen tar emot anmälan och säger att en utredare hör av sig, troligen inom några veckor. Ingen kommer i morse. Räcker en anmälan i sig, eller måste ni agera själva under tiden, och hur utan att förstöra ärendet?"]),
              pb(["Who decided to call?", "Vem bestämde att ringa?"], ["{{person.hr.name}} wants it on record that the call was not their own idea, and the police will ask about it. The call warned him, and nobody wrote down who asked for it. Who in the room owns that decision now?", "{{person.hr.name}} vill ha det dokumenterat att samtalet inte var hens egen idé, och polisen kommer att fråga om det. Samtalet varnade honom, och ingen skrev ner vem som bad om det. Vem i rummet äger det beslutet nu?"])
            ]
          }),
          opt(["Send a letter threatening legal action", "Skicka ett brev med hot om rättsliga åtgärder"], "c4", ["Feels strong. Changes nothing he can still do.", "Känns kraftfullt. Ändrar inget av det han fortfarande kan göra."], {
            pushback: [
              pb(["His lawyer answers first", "Hans advokat svarar först"], ["Within a day, his lawyer replies: the accusation is unfounded, and what evidence do you have? Answering shows your hand; not answering makes the letter look empty. What do you send back?", "Inom ett dygn svarar hans advokat: anklagelsen är ogrundad, och vilka bevis har ni? Att svara visar era kort; att inte svara får brevet att se tomt ut. Vad skickar ni tillbaka?"]),
              pb(["A letter changes no passwords", "Ett brev byter inga lösenord"], ["{{person.itOps.name}} points out that the letter does nothing to the service account he used, which still works. If he wants to do more, a threat may only make him hurry. What does the letter actually protect?", "{{person.itOps.name}} påpekar att brevet inte gör något med tjänstekontot han använde, som fortfarande fungerar. Om han vill göra mer kan ett hot bara få honom att skynda sig. Vad skyddar brevet egentligen?"]),
              pb(["“That looks like pressure”", "”Det ser ut som påtryckning”"], ["{{person.legal.name}} warns that threatening a former employee directly, without going to the police, can look like trying to settle a crime privately. If you report later, the letter will be in the file. How will you explain why you warned him first?", "{{person.legal.name}} varnar för att hota en tidigare anställd direkt, utan att gå till polisen, kan se ut som ett försök att lösa ett brott privat. Om ni anmäler senare finns brevet i akten. Hur förklarar ni varför ni varnade honom först?"])
            ]
          })
        ])
      }),

      pg("c4", ["The access he kept", "Åtkomsten han behöll"], [
        "How did he do it after leaving? {{person.itOps.name}} explains. The maintenance service account's password has not changed in four years, and every administrator knew it. It is also used by the shared VPN profile that the IT team uses on call.\n\nThere are {{num.serviceAccounts}} service accounts like it. Nobody has a list of who knows which password.",
        "Hur gjorde han det efter att ha slutat? {{person.itOps.name}} förklarar. Underhållskontots lösenord har inte ändrats på fyra år, och varje administratör kände till det. Det används också av den delade vpn-profil som IT-teamet använder vid beredskap.\n\nDet finns {{num.serviceAccounts}} sådana tjänstekonton. Ingen har en lista över vem som känner till vilket lösenord."
      ], {
        discuss: [q("Which shared passwords did he know, and which do the rest of the team still know?", "Vilka delade lösenord kände han till, och vilka känner resten av teamet fortfarande till?", ["itOps"])],
        choice: ask(["How far do you go?", "Hur långt går ni?"], ["Rotates every shared credential he could have known, even at the cost of disruption.", "Byter varje delad inloggning han kan ha känt till, även om det stör."], [
          opt(["Rotate every service account and shared password he could have known", "Byt varje tjänstekonto och delat lösenord han kan ha känt till"], "l2", ["A day of breakage. The only way to be sure.", "Ett dygn av störningar. Det enda sättet att vara säker."], {
            set: "rotated",
            pushback: [
              pb(["Integrations start failing", "Integrationerna börjar fallera"], ["Within an hour of the first rotations, invoicing stops and warehouse scanners lose their connection. Each department asks for its account to be left alone for one more week. Which exemptions do you grant, and how is that different from not rotating at all?", "Inom en timme efter de första bytena stannar faktureringen och lagrets handdatorer tappar anslutningen. Varje avdelning ber att få sitt konto orört en vecka till. Vilka undantag ger ni, och hur skiljer det sig från att inte byta alls?"]),
              pb(["On call without VPN", "Beredskap utan vpn"], ["Rotating the shared VPN profile means tonight's on-call engineer cannot reach anything remotely until a new setup is in place. If something else breaks tonight, someone drives in. Do you accept a night without remote access, right after a sabotage?", "Att byta den delade vpn-profilen betyder att kvällens beredskapstekniker inte når något på distans förrän en ny lösning finns. Går något annat sönder i natt får någon åka in. Accepterar ni en natt utan fjärråtkomst, precis efter ett sabotage?"]),
              pb(["Nobody knows where they are used", "Ingen vet var de används"], ["There are {{num.serviceAccounts}} accounts and no list of where each password is configured. Something may break quietly and only be noticed at month-end. How will you know what you broke, and who is on the hook when payroll fails again for a new reason?", "Det finns {{num.serviceAccounts}} konton och ingen lista över var varje lösenord är inlagt. Något kan gå sönder i tysthet och märkas först vid månadsskiftet. Hur vet ni vad ni har förstört, och vem ansvarar när lönerna fallerar igen av en ny anledning?"])
            ]
          }),
          opt(["Rotate the ERP maintenance account only", "Byt bara affärssystemets underhållskonto"], "l2", ["Closes the door he used, and leaves the others.", "Stänger dörren han använde, och lämnar de andra."], {
            pushback: [
              pb(["He knew the others", "Han kände till de andra"], ["{{person.itOps.name}} confirms he knew most of the shared passwords, just like every administrator. You have closed the one door you know he used. Which of the others would you bet the next payday on?", "{{person.itOps.name}} bekräftar att han kände till de flesta delade lösenorden, precis som varje administratör. Ni har stängt den enda dörr ni vet att han använde. Vilken av de andra skulle ni satsa nästa lönedag på?"]),
              pb(["Sharing the new password", "Att dela det nya lösenordet"], ["The maintenance account is also in the shared VPN profile the on-call team uses, so the new password has to reach every administrator. It will travel the same way the old one did. Have you changed anything, or just reset the clock?", "Underhållskontot finns också i den delade vpn-profilen som beredskapen använder, så det nya lösenordet måste nå varje administratör. Det kommer att spridas på samma sätt som det gamla. Har ni ändrat något, eller bara nollställt klockan?"]),
              pb(["The CISO wants it signed", "CISO vill ha det påskrivet"], ["{{person.ciso.name}} says closing only the known door is a guess, not a security decision, and asks for whoever accepts the remaining risk to sign it. Nobody volunteers. Who in the room puts their name to leaving the other accounts as they are?", "{{person.ciso.name}} säger att stänga bara den kända dörren är en gissning, inte ett säkerhetsbeslut, och vill att den som accepterar den kvarvarande risken skriver under. Ingen anmäler sig. Vem i rummet sätter sitt namn på att lämna de andra kontona som de är?"])
            ]
          }),
          opt(["Block his home IP addresses", "Blockera hans hem-IP-adresser"], "l2", ["He has more than one internet connection.", "Han har fler än en internetanslutning."], {
            pushback: [
              pb(["Every café is an exit", "Varje kafé är en utgång"], ["He has a phone, friends and any public network he wants. The shared VPN profile he knows would even give him a company address. What exactly does blocking his home connection stop?", "Han har en telefon, vänner och vilket publikt nätverk han vill. Den delade vpn-profilen han känner till skulle till och med ge honom en adress inom företaget. Vad är det egentligen en blockering av hans hemanslutning stoppar?"]),
              pb(["Which addresses?", "Vilka adresser?"], ["HR has his home address, not his internet address. IT would have to guess from old logs which connections were his. How confident are you in the list you are about to block, and what if you block the wrong person?", "HR har hans hemadress, inte hans internetadress. IT skulle behöva gissa utifrån gamla loggar vilka anslutningar som var hans. Hur säkra är ni på listan ni ska blockera, och vad händer om ni blockerar fel person?"]),
              pb(["The password still works", "Lösenordet fungerar fortfarande"], ["The password has not changed in four years, and blocking an address does not change who knows it. An auditor will ask why the obvious step was skipped. What will you answer?", "Lösenordet har inte ändrats på fyra år, och att blockera en adress ändrar inte vem som känner till det. En revisor kommer att fråga varför det självklara steget hoppades över. Vad svarar ni?"])
            ]
          })
        ])
      }),

      pg("l2", ["The reorganisation file", "Omorganisationsmappen"], [
        "{{person.hr.name}} reads the reorganisation file. The administrator's manager noted two months ago that he was “very angry” about the plans and “has keys to everything”.\n\nThe note was filed. No security review of his access was done before the announcement, and his last day was handled with the standard checklist, which covers personal accounts only.",
        "{{person.hr.name}} läser omorganisationsmappen. Administratörens chef noterade för två månader sedan att han var ”mycket arg” över planerna och ”har nycklar till allt”.\n\nAnteckningen arkiverades. Ingen säkerhetsgenomgång av hans åtkomst gjordes före beskedet, och hans sista dag hanterades med standardchecklistan, som bara omfattar personliga konton."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you do with this?", "Vad gör ni med det här?"], ["Records it honestly as a process failure, not a personal one.", "Dokumenterar det ärligt som ett processfel, inte ett personligt."], [
          opt(["Record it as a process failure for the review", "Dokumentera det som ett processfel inför genomgången"], "c5", ["Fair to the manager, useful for the future.", "Rättvist mot chefen, användbart för framtiden."], {
            pushback: [
              pb(["“I warned them”", "”Jag varnade dem”"], ["The manager who wrote the note asks to be named in the review as the person who raised the alarm. Others want the note left out entirely. If the review says “process failure”, do you include who warned and who filed it away?", "Chefen som skrev anteckningen vill bli nämnd i genomgången som den som slog larm. Andra vill att anteckningen lämnas utanför helt. Om genomgången säger ”processfel”, tar ni då med vem som varnade och vem som arkiverade?"]),
              pb(["Who owns the process?", "Vem äger processen?"], ["A process failure points at whoever owns the process, and that leads to the people who ran the reorganisation. {{person.hr.name}} says HR followed the checklist it was given. Who in the room owns the gap, and will they say so?", "Ett processfel pekar på den som äger processen, och det leder till dem som drev omorganisationen. {{person.hr.name}} säger att HR följde checklistan de fick. Vem i rummet äger luckan, och kommer den personen att säga det?"]),
              pb(["Nobody is accountable", "Ingen är ansvarig"], ["{{person.ceo.name}} reads the draft and says it sounds as if nobody did anything wrong. The board will want to know who will make sure it cannot happen again. Without a name, who is accountable for fixing it?", "{{person.ceo.name}} läser utkastet och säger att det låter som att ingen gjorde något fel. Styrelsen kommer att vilja veta vem som ser till att det inte händer igen. Utan ett namn, vem ansvarar för att rätta det?"])
            ]
          }),
          opt(["Raise it as the manager's failure", "Lyft det som chefens misslyckande"], "c5", ["Finds a second person to blame.", "Hittar ytterligare en person att skylla på."], {
            pushback: [
              pb(["The note was filed correctly", "Anteckningen hanterades korrekt"], ["The manager sent the note to HR, exactly as the process says. Blaming the one person who did raise a concern is noticed across the company. What message does that send to the next manager who sees something worrying?", "Chefen skickade anteckningen till HR, precis som processen säger. Att skylla på den enda person som faktiskt lyfte en oro märks i hela företaget. Vilket budskap skickar det till nästa chef som ser något oroande?"]),
              pb(["The team takes sides", "Teamet tar ställning"], ["The IT team hears that their manager is being blamed, and the manager is well liked. Two senior engineers say they will not help with the investigation if this is how it ends. Do you stand by it?", "IT-teamet hör att deras chef får skulden, och chefen är omtyckt. Två seniora tekniker säger att de inte hjälper till med utredningen om det är så här det slutar. Står ni fast vid det?"]),
              pb(["In writing, forever", "Skriftligt, för alltid"], ["{{person.legal.name}} warns that a document blaming a named manager may end up in a police file and in an employment dispute. Once written, it cannot be taken back. Do you want that in the review?", "{{person.legal.name}} varnar för att ett dokument som skyller på en namngiven chef kan hamna i en polisutredning och i en arbetsrättslig tvist. När det väl är skrivet går det inte att ta tillbaka. Vill ni ha det i genomgången?"])
            ]
          })
        ])
      }),

      pg("c5", ["The police", "Polisen"], [
        "{{person.legal.name}} explains the options. Sabotage of a computer system is a crime. A police report needs evidence that shows what was done, from which account and when, preserved in a way that holds up.\n\nThe alternative is to handle it as an employment matter, quietly. Some in the room worry about publicity; others point out that he may do it to his next employer.",
        "{{person.legal.name}} förklarar alternativen. Sabotage av ett datasystem är ett brott. En polisanmälan behöver bevis som visar vad som gjordes, från vilket konto och när, säkrade på ett sätt som håller.\n\nAlternativet är att hantera det som en arbetsrättslig fråga, i tysthet. En del i rummet oroar sig för publicitet; andra påpekar att han kan göra samma sak hos sin nästa arbetsgivare."
      ], {
        variants: [vr("evidenceKept", [
          "{{person.legal.name}} has the snapshot from this morning and the untouched task logs. Sabotage of a computer system is a crime, and the evidence shows what was done, from which account and when.\n\nThe alternative is to handle it quietly as an employment matter. Some worry about publicity; others point out that he may do it again elsewhere.",
          "{{person.legal.name}} har ögonblicksbilden från i morse och de orörda uppgiftsloggarna. Sabotage av ett datasystem är ett brott, och bevisen visar vad som gjordes, från vilket konto och när.\n\nAlternativet är att hantera det i tysthet som en arbetsrättslig fråga. En del oroar sig för publicitet; andra påpekar att han kan göra det igen någon annanstans."
        ], ["Because you preserved evidence first, a police case is realistic.", "Eftersom ni säkrade bevisen först är ett polisärende realistiskt."])],
        choice: ask(["Do you report it?", "Polisanmäler ni?"], ["Reports to the police with preserved evidence.", "Polisanmäler med säkrade bevis."], [
          opt(["Report to the police with the evidence you have", "Polisanmäl med de bevis ni har"], "l3", ["The right step. It may become public.", "Rätt steg. Det kan bli offentligt."], {
            set: "policeReport",
            pushback: [
              pb(["The chain of custody", "Beviskedjan"], ["The investigator asks who handled each piece of evidence, when, and where it has been stored since the first morning. Several people copied logs to their own laptops. Can you account for every copy, and what if you cannot?", "Utredaren frågar vem som hanterat varje bevis, när, och var det har förvarats sedan den första morgonen. Flera personer kopierade loggar till sina egna datorer. Kan ni redogöra för varje kopia, och vad händer om ni inte kan?"]),
              pb(["The CEO fears headlines", "Vd:n är rädd för rubriker"], ["{{person.ceo.name}} worries that a police report will become public, and that customers will start asking whether your systems are safe. A local reporter has asked about “problems with salaries” already. Do you still report, and who handles the questions?", "{{person.ceo.name}} oroar sig för att en polisanmälan blir offentlig, och att kunder börjar fråga om era system är säkra. En lokal reporter har redan frågat om ”problem med lönerna”. Anmäler ni ändå, och vem tar frågorna?"]),
              pb(["Colleagues as witnesses", "Kollegor som vittnen"], ["The police will want to interview the IT team, who worked with him for nine years. Some are reluctant to give statements against a former friend. Are you ready to ask them, and what happens if they refuse?", "Polisen kommer att vilja höra IT-teamet, som arbetade med honom i nio år. En del är ovilliga att vittna mot en tidigare vän. Är ni beredda att be dem, och vad händer om de vägrar?"])
            ]
          }),
          opt(["Handle it through employment lawyers only", "Hantera det enbart via arbetsrättsjurister"], "l3", ["Quiet, and he faces no criminal consequence.", "Tyst, och han möter inga straffrättsliga följder."], {
            pushback: [
              pb(["He no longer works here", "Han jobbar inte här längre"], ["Your employment lawyers point out that he is already gone, so there is little left to discipline. A civil claim would take years. What exactly can they achieve that a police report cannot?", "Era arbetsrättsjurister påpekar att han redan har slutat, så det finns lite kvar att vidta åtgärder mot. En civilrättslig process tar år. Vad kan de egentligen uppnå som en polisanmälan inte kan?"]),
              pb(["His next employer", "Hans nästa arbetsgivare"], ["Someone has seen that he is applying for administrator roles elsewhere. Handled quietly, nobody there will ever know. Are you comfortable with what he might reach in his next job, knowing what you know?", "Någon har sett att han söker administratörstjänster på andra håll. Om det hanteras i tysthet får ingen där någonsin veta. Känner ni er bekväma med vad han kan nå på sitt nästa jobb, med det ni vet?"]),
              pb(["The insurer asks", "Försäkringsbolaget frågar"], ["Your insurer asks for the police report number before it will look at the cost of the payroll failure. Without one, the claim stalls. Is staying quiet worth paying for this yourselves?", "Försäkringsbolaget vill ha numret på polisanmälan innan det tittar på kostnaden för lönehaveriet. Utan det står ersättningen still. Är det värt att betala det här själva för att det ska förbli tyst?"])
            ]
          }),
          opt(["Do nothing formal; the damage is repaired", "Gör inget formellt; skadan är reparerad"], "l3", ["The cheapest today, and it tells everyone something.", "Billigast i dag, och det säger något till alla."], {
            pushback: [
              pb(["The next angry leaver", "Nästa arga person som slutar"], ["The IT team reads the silence as a message: sabotage has no consequences here. Another reorganisation is already being discussed. What do you think the next unhappy administrator will conclude?", "IT-teamet tolkar tystnaden som ett budskap: sabotage får inga följder här. En ny omorganisation diskuteras redan. Vad tror ni att nästa missnöjda administratör drar för slutsats?"]),
              pb(["Repaired is not free", "Reparerat är inte gratis"], ["{{person.cfo.name}} adds up the overtime, the bank fees, the correction work and the lost day. None of it is recoverable without a formal case. Who signs off on writing it all off, and how do you explain that to the board?", "{{person.cfo.name}} räknar ihop övertiden, bankavgifterna, rättelsearbetet och den förlorade dagen. Inget av det går att få tillbaka utan ett formellt ärende. Vem skriver under på att skriva av allt, och hur förklarar ni det för styrelsen?"]),
              pb(["Is it really over?", "Är det verkligen över?"], ["Doing nothing formal assumes the damage is done. Nobody can say for certain that he has no other way in, and without a case nobody will ever ask him. Are you sure enough to close the file today?", "Att inte göra något formellt förutsätter att skadan är över. Ingen kan säga säkert att han inte har någon annan väg in, och utan ett ärende kommer ingen någonsin att fråga honom. Är ni säkra nog för att stänga ärendet i dag?"])
            ]
          }),
          opt(["Take the restored server down again and image it after all, so the police have evidence", "Ta ner den återställda servern igen och avbilda den ändå, så att polisen får bevis"], "l3", ["Reverses your fast restore; the business loses another afternoon.", "Upphäver er snabba återställning; verksamheten förlorar ytterligare en eftermiddag."], {
            requires: "restoredFast", set: "reImaged", effects: { trust: -1 },
            pushback: [
              pb(["Another afternoon lost", "Ännu en förlorad eftermiddag"], ["Finance is in the middle of correcting this month's payments in the ERP system. Taking it down again stops that work and the invoicing with it. Is a second outage worth evidence you are not sure will be useful?", "Ekonomi är mitt i att rätta månadens betalningar i affärssystemet. Att ta ner det igen stoppar det arbetet och faktureringen med det. Är ett andra avbrott värt bevis ni inte vet om de blir användbara?"]),
              pb(["What is left to image?", "Vad finns kvar att avbilda?"], ["The restore has already overwritten part of the logs. An image taken now shows the server after the restore, not as it was on the first morning. Will the police be able to use it, and how will you explain the gap?", "Återställningen har redan skrivit över en del av loggarna. En avbildning nu visar servern efter återställningen, inte som den var den första morgonen. Kan polisen använda den, och hur förklarar ni luckan?"]),
              pb(["Two decisions, one record", "Två beslut, ett protokoll"], ["Reversing the fast restore raises an obvious question: who decided it this morning, and why? The people who made that call are in the room. Do you write down the reasons for both decisions honestly, even if it embarrasses someone here?", "Att backa från den snabba återställningen väcker en självklar fråga: vem bestämde den i morse, och varför? De som fattade det beslutet sitter i rummet. Skriver ni ärligt ner skälen till båda besluten, även om det blir pinsamt för någon här?"])
            ]
          })
        ])
      }),

      pg("l3", ["The team that stayed", "Teamet som stannade"], [
        "The remaining IT team is shaken. He was their colleague for nine years. Some are angry with him; some are angry with the company for the way the reorganisation was handled.\n\nRumours are spreading that there are more hidden scripts, and that the company now suspects everyone with administrator access.",
        "Det kvarvarande IT-teamet är skakat. Han var deras kollega i nio år. En del är arga på honom; en del är arga på företaget för hur omorganisationen sköttes.\n\nRykten sprids om att det finns fler dolda skript, och om att företaget nu misstänker alla med administratörsbehörighet."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["What do you say to the team?", "Vad säger ni till teamet?"], ["Tells them what is known, that they are not suspects, and what will change.", "Berättar vad som är känt, att de inte är misstänkta och vad som kommer att ändras."], [
          opt(["Meet them, share the facts and say they are not suspects", "Träffa dem, dela fakta och säg att de inte är misstänkta"], "c6", ["Reduces fear. They know more than anyone where to look.", "Minskar rädslan. De vet bättre än någon var man ska leta."], {
            pushback: [
              pb(["Can you promise that?", "Kan ni lova det?"], ["{{person.legal.name}} warns that you cannot promise nobody is a suspect while the police are still investigating. If anyone on the team turns out to have known something, the promise breaks in public. What exactly do you say in the meeting?", "{{person.legal.name}} varnar för att ni inte kan lova att ingen är misstänkt medan polisen fortfarande utreder. Om någon i teamet visar sig ha vetat något bryts löftet inför alla. Vad säger ni exakt på mötet?"]),
              pb(["They still talk to him", "De pratar fortfarande med honom"], ["One engineer admits they still chat with him most weeks; others may too. Whatever you share in the meeting may reach him the same evening. How much do you tell them, and does that defeat the point of the meeting?", "En tekniker medger att hen fortfarande pratar med honom de flesta veckor; andra kanske också gör det. Det ni delar på mötet kan nå honom samma kväll. Hur mycket berättar ni, och förstör det i så fall syftet med mötet?"]),
              pb(["The meeting turns", "Mötet vänder"], ["Ten minutes in, the questions are no longer about scripts but about the reorganisation: who decided, why nine-year colleagues were let go in half an hour. Nobody in the room came prepared for that. Do you answer, or try to steer back?", "Efter tio minuter handlar frågorna inte längre om skript utan om omorganisationen: vem som bestämde, varför kollegor med nio år bakom sig sades upp på en halvtimme. Ingen i rummet var förberedd på det. Svarar ni, eller försöker ni styra tillbaka?"])
            ]
          }),
          opt(["Say nothing while the investigation runs", "Säg ingenting medan utredningen pågår"], "c6", ["The rumours write the story instead.", "Ryktena skriver berättelsen i stället."], {
            pushback: [
              pb(["A resignation", "En uppsägning"], ["A senior administrator resigns, saying they will not work somewhere they are treated as a suspect. That is another person leaving with keys to everything, this time angry. Is silence still the right choice?", "En senior administratör säger upp sig och säger att hen inte tänker jobba där hen behandlas som misstänkt. Det är ännu en person som går med nycklar till allt, den här gången arg. Är tystnad fortfarande rätt val?"]),
              pb(["The rumour spreads", "Ryktet sprids"], ["The rumours have left IT. Staff in other departments now ask their managers whether the company was “hacked” and whether next month's salary is safe. Managers have nothing to say. How long can the investigation be your reason for saying nothing?", "Ryktena har lämnat IT. Anställda på andra avdelningar frågar nu sina chefer om företaget blivit ”hackat” och om nästa månads lön är säker. Cheferna har inget att säga. Hur länge kan utredningen vara skälet till att ni inte säger något?"]),
              pb(["They stop helping", "De slutar hjälpa till"], ["The engineers who know the systems best have gone quiet; nobody volunteers where else to look anymore. The investigation depends on exactly their knowledge. How do you get it without talking to them?", "Teknikerna som känner systemen bäst har tystnat; ingen föreslår längre var mer man borde leta. Utredningen hänger på just deras kunskap. Hur får ni den utan att prata med dem?"])
            ]
          })
        ])
      }),

      pg("c6", ["The post", "Inlägget"], [
        "{{time.T+2880|weekday|cap}}. The former administrator posts on a professional networking site about the reorganisation. He does not mention the sabotage. He writes about loyalty, about nine years, and about companies “that don't understand the systems they depend on”.\n\nThe post is getting sympathetic comments, including from some of your current staff. Several people in the room want to reply.",
        "{{time.T+2880|weekday|cap}}. Den tidigare administratören skriver ett inlägg på ett yrkesnätverk om omorganisationen. Han nämner inte sabotaget. Han skriver om lojalitet, om nio år och om företag ”som inte förstår systemen de är beroende av”.\n\nInlägget får medkännande kommentarer, även från en del av er nuvarande personal. Flera i rummet vill svara."
      ], {
        injects: [
          inj("b12-2", 2880, "socialPost", "socialMedia", "medium", "confirmed", [
            "Nine years. Nights, weekends, every outage. Then a thirty-minute meeting. Companies that don't understand the systems they depend on shouldn't be surprised when those systems surprise them.",
            "Nio år. Nätter, helger, varje avbrott. Sedan ett möte på trettio minuter. Företag som inte förstår systemen de är beroende av ska inte bli förvånade när de systemen överraskar dem."
          ], { headline: ["Post by a former employee", "Inlägg av en tidigare anställd"], tests: ["lo4"] })
        ],
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Stays silent publicly, gives the post to the police, and reassures staff internally.", "Är tyst offentligt, lämnar inlägget till polisen och lugnar personalen internt."], [
          opt(["Say nothing publicly and pass the post to the police", "Säg ingenting offentligt och lämna inlägget till polisen"], "c7", ["Frustrating, and correct.", "Frustrerande, och rätt."], {
            pushback: [
              pb(["Silence as an answer", "Tystnad som svar"], ["The post keeps growing, and some comments now ask why the company has nothing to say. To many readers, silence looks like agreement. How long can you hold the line while your own staff keep liking the post?", "Inlägget fortsätter växa, och en del kommentarer frågar nu varför företaget inte säger något. För många läsare ser tystnad ut som medhåll. Hur länge kan ni hålla linjen medan er egen personal fortsätter gilla inlägget?"]),
              pb(["A reporter calls", "En reporter ringer"], ["{{person.comms.name}} gets a call from a journalist who has seen the post and heard about payday problems. “No comment” will be printed as exactly that. What do you say when asked directly whether the two are connected?", "{{person.comms.name}} får ett samtal från en journalist som sett inlägget och hört om problem på lönedagen. ”Ingen kommentar” trycks precis så. Vad säger ni när någon frågar rakt ut om de två hänger ihop?"]),
              pb(["The police shrug", "Polisen rycker på axlarna"], ["The investigator thanks you for the post but says it is not a crime and does not change much. Passing it on has achieved nothing anyone can see. Is staying silent still right if the police are not acting on it?", "Utredaren tackar för inlägget men säger att det inte är ett brott och inte ändrar mycket. Att lämna det vidare har inte gett något någon kan se. Är det fortfarande rätt att vara tyst om polisen inte gör något med det?"])
            ]
          }),
          opt(["Send a calm internal message to staff", "Skicka ett lugnt internt meddelande till personalen"], "c7", ["Addresses the people who matter most.", "Vänder sig till dem som betyder mest."], {
            pushback: [
              pb(["It leaks within the hour", "Det läcker inom en timme"], ["A screenshot of your internal message appears under his post within an hour, with a sarcastic comment. Every word you chose for colleagues is now public. Did you write it to be read by him, and what do you do now?", "En skärmbild av ert interna meddelande dyker upp under hans inlägg inom en timme, med en sarkastisk kommentar. Varje ord ni valde för kollegorna är nu offentligt. Skrev ni det för att läsas av honom, och vad gör ni nu?"]),
              pb(["What can you actually say?", "Vad kan ni egentligen säga?"], ["{{person.legal.name}} says the message cannot mention the sabotage or him. What is left reads like something is being hidden. Is a calm message that says nothing better than no message at all?", "{{person.legal.name}} säger att meddelandet inte får nämna sabotaget eller honom. Det som blir kvar låter som att något döljs. Är ett lugnt meddelande som inte säger något bättre än inget meddelande alls?"]),
              pb(["The staff who commented", "Personalen som kommenterade"], ["Several managers ask whether employees who liked or commented on his post should be spoken to. The message promised calm, and this would not feel calm. Do you act on it, or let it go?", "Flera chefer frågar om anställda som gillade eller kommenterade hans inlägg ska få ett samtal. Meddelandet lovade lugn, och det här skulle inte kännas lugnt. Agerar ni, eller låter ni det vara?"])
            ]
          }),
          opt(["Reply publicly, naming him as the saboteur", "Svara offentligt och peka ut honom som sabotör"], "x1", ["Satisfying for a minute.", "Tillfredsställande i en minut."], {
            effects: { media: 2 }, set: "accused",
            pushback: [
              pb(["Legal says no", "Juristen säger nej"], ["{{person.legal.name}} is firm: there is no conviction, and naming him as a saboteur in public invites a defamation claim. Several people in the room still want to post. Who overrules legal, and will they sign it?", "{{person.legal.name}} är bestämd: det finns ingen dom, och att offentligt peka ut honom som sabotör bjuder in till ett ärekränkningsmål. Flera i rummet vill ändå publicera. Vem kör över juristen, och skriver den personen under?"]),
              pb(["The investigator asks you to wait", "Utredaren ber er vänta"], ["The police investigator calls before the reply goes out and asks you not to make any public statements about the case yet. The draft is ready. Do you post anyway, against the people handling your report?", "Polisens utredare ringer innan svaret publiceras och ber er att inte göra några offentliga uttalanden om ärendet ännu. Utkastet är klart. Publicerar ni ändå, mot dem som hanterar er anmälan?"]),
              pb(["The team reads it first in public", "Teamet läser det först offentligt"], ["Most of the IT team has not been told what he did. They would learn it from a public reply under a post they sympathise with. Is that how you want your own staff to find out?", "Det mesta av IT-teamet har inte fått veta vad han gjorde. De skulle få veta det från ett offentligt svar under ett inlägg de sympatiserar med. Är det så ni vill att er egen personal ska få reda på det?"])
            ]
          })
        ])
      }),

      pg("c7", ["The auditor", "Revisorn"], [
        "The external auditor has heard about the payroll failure and asks for a meeting. They want to know how a former employee could run code on the ERP system, and whether the payment file sent manually had proper approval.\n\nThe annual audit is in six weeks. Their questions will be in the management letter, whatever you answer.",
        "Den externa revisorn har hört om lönekörningen som misslyckades och ber om ett möte. Hen vill veta hur en tidigare anställd kunde köra kod i affärssystemet, och om betalningsfilen som skickades manuellt hade ett korrekt godkännande.\n\nÅrsrevisionen är om sex veckor. Frågorna kommer att stå i revisionsrapporten, vad ni än svarar."
      ], {
        choice: ask(["How do you meet the auditor?", "Hur möter ni revisorn?"], ["Gives a full account with the control failures and the fixes.", "Ger en fullständig redogörelse med kontrollbristerna och åtgärderna."], [
          opt(["A full account, control gaps included", "En fullständig redogörelse, inklusive kontrollbristerna"], "l4", ["Uncomfortable, and auditors respect it.", "Obekvämt, och revisorer respekterar det."], {
            effects: { regulator: -1 },
            pushback: [
              pb(["In the management letter", "I revisionsrapporten"], ["Every gap you list will appear in the management letter, which the board and the bank will read. A password unchanged for four years, known by every administrator, will be in it. Do you still list everything?", "Varje brist ni räknar upp hamnar i revisionsrapporten, som styrelsen och banken läser. Ett lösenord som inte ändrats på fyra år och som varje administratör kände till kommer att stå där. Räknar ni ändå upp allt?"]),
              pb(["The approval by phone", "Godkännandet per telefon"], ["{{person.cfo.name}} asks to leave out that the manual payment file was released on a single phone confirmation. It was the CFO's own call, and it worked. Does a full account include it, and who tells the CFO?", "{{person.cfo.name}} vill att det utelämnas att den manuella betalningsfilen släpptes efter en enda bekräftelse per telefon. Det var ekonomichefens eget beslut, och det fungerade. Ingår det i en fullständig redogörelse, och vem säger det till ekonomichefen?"]),
              pb(["Show us the fixes", "Visa oss åtgärderna"], ["The auditor thanks you for the honesty and asks for evidence that each fix is in place. Most are still plans on a slide. Is a full list of gaps with no finished fixes better than a shorter list you can back up?", "Revisorn tackar för ärligheten och ber om belägg för att varje åtgärd är på plats. De flesta är fortfarande planer i en presentation. Är en fullständig lista med brister utan färdiga åtgärder bättre än en kortare lista ni kan styrka?"])
            ]
          }),
          opt(["A short account focusing on the recovery", "En kort redogörelse med fokus på återställningen"], "l4", ["They will ask the other questions anyway.", "De kommer att ställa de andra frågorna ändå."], {
            effects: { regulator: 1 },
            pushback: [
              pb(["They already know", "De vet redan"], ["Halfway through, the auditor mentions they have heard from the bank about the flagged manual file. Your short account did not mention it. Do you correct yourselves now, and what does that do to everything else you said?", "Halvvägs nämner revisorn att hen hört från banken om den flaggade manuella filen. Er korta redogörelse nämnde den inte. Rättar ni er nu, och vad gör det med allt annat ni sagt?"]),
              pb(["The follow-up list", "Uppföljningslistan"], ["The auditor asks for the leaver checklist, the list of service accounts and who knows their passwords. A short account does not stop the request, and the documents tell the long story. What will they find, and what will they think you left out?", "Revisorn ber om checklistan för den som slutar, listan över tjänstekonton och vem som känner till lösenorden. En kort redogörelse stoppar inte begäran, och dokumenten berättar den långa historien. Vad hittar hen, och vad kommer hen att tro att ni utelämnade?"]),
              pb(["The CISO won't present it", "CISO vill inte presentera det"], ["{{person.ciso.name}} refuses to present a version that leaves out the control gaps, and says so in front of the team. Someone else has to stand in front of the auditor. Who will, and what does the auditor make of the change?", "{{person.ciso.name}} vägrar att presentera en version som utelämnar kontrollbristerna, och säger det inför teamet. Någon annan måste stå inför revisorn. Vem gör det, och vad tänker revisorn om bytet?"])
            ]
          })
        ])
      }),

      pg("l4", ["Offboarding", "Avveckling"], [
        "{{person.ciso.name}} compares the standard leaver checklist with what an administrator actually holds. The checklist covers the personal account, the badge and the laptop.\n\nIt says nothing about service accounts, shared passwords, scheduled tasks, VPN profiles or the keys to the server room. For most staff that is fine. For administrators it is almost nothing.",
        "{{person.ciso.name}} jämför standardchecklistan för den som slutar med vad en administratör faktiskt har. Checklistan omfattar det personliga kontot, passerkortet och datorn.\n\nDen säger ingenting om tjänstekonton, delade lösenord, schemalagda uppgifter, vpn-profiler eller nycklarna till serverrummet. För de flesta anställda räcker det. För administratörer är det nästan ingenting."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you change in offboarding?", "Vad ändrar ni i avvecklingen?"], ["Adds a privileged-leaver procedure that starts before the announcement.", "Lägger till en avvecklingsrutin för privilegierade användare som börjar före beskedet."], [
          opt(["A privileged leaver procedure, started before any notice is given", "En avvecklingsrutin för privilegierade användare, påbörjad innan något besked ges"], "c8", ["Hard to do kindly, and essential.", "Svårt att göra på ett vänligt sätt, och nödvändigt."], {
            pushback: [
              pb(["Unfair before notice", "Orättvist före beskedet"], ["{{person.hr.name}} says removing access before someone is told they are leaving tells them anyway, and the union will call it presumed guilt. It is also hard to do quietly. How do you do it kindly, and to whom first?", "{{person.hr.name}} säger att ta bort åtkomst innan någon fått beskedet att de ska sluta berättar det ändå, och facket kommer att kalla det förutsatt skuld. Det är också svårt att göra i tysthet. Hur gör ni det på ett vänligt sätt, och mot vem först?"]),
              pb(["Who removes whose access?", "Vem tar bort vems åtkomst?"], ["The only people who can quietly strip an administrator's access are the other administrators, their own colleagues. Someone has to do it, and someone has to check they did. Who carries that, and who checks the checker?", "De enda som i tysthet kan ta bort en administratörs åtkomst är de andra administratörerna, deras egna kollegor. Någon måste göra det, och någon måste kontrollera att det blev gjort. Vem bär det, och vem kontrollerar kontrollanten?"]),
              pb(["All at once", "Alla på en gång"], ["The next reorganisation may affect a dozen administrators or more. Starting the procedure before notice means reducing access for all of them at the same time, while they still keep the systems running. How many at once can operations survive?", "Nästa omorganisation kan beröra ett tiotal administratörer eller fler. Att starta rutinen före beskedet betyder att minska åtkomsten för alla samtidigt, medan de fortfarande håller systemen igång. Hur många på en gång klarar driften?"])
            ]
          }),
          opt(["Add service accounts to the existing checklist", "Lägg till tjänstekonton i den befintliga checklistan"], "c8", ["Better than before, still after the fact.", "Bättre än tidigare, fortfarande i efterhand."], {
            pushback: [
              pb(["Six weeks too late", "Sex veckor för sent"], ["The checklist runs on the last day. The task that wiped payroll was created six weeks earlier, before anyone was told anything. Would adding service accounts to the checklist have stopped this at all?", "Checklistan körs den sista dagen. Uppgiften som raderade lönerna skapades sex veckor tidigare, innan någon fått veta något. Hade tjänstekonton i checklistan stoppat det här överhuvudtaget?"]),
              pb(["A box nobody can tick", "En ruta ingen kan bocka i"], ["The new line says “rotate service accounts the leaver knew”. Nobody has a list of who knows which password. What will the leaving person's manager actually tick, and what does the tick mean?", "Den nya raden säger ”byt tjänstekonton som personen kände till”. Ingen har en lista över vem som känner till vilket lösenord. Vad bockar chefen för den som slutar egentligen i, och vad betyder bocken?"]),
              pb(["Still missing", "Saknas fortfarande"], ["{{person.ciso.name}} points out that the checklist still says nothing about scheduled tasks, VPN profiles or server-room keys. One extra line covers one door. Is that enough to tell the auditor this is fixed?", "{{person.ciso.name}} påpekar att checklistan fortfarande inte säger något om schemalagda uppgifter, vpn-profiler eller nycklarna till serverrummet. En extra rad täcker en dörr. Räcker det för att säga till revisorn att det är åtgärdat?"])
            ]
          })
        ])
      }),

      pg("c8", ["The bank", "Banken"], [
        "The bank's corporate desk calls about the manual payment file. It arrived from a different user than usual, with different formatting, on a day when the ERP system's usual file did not arrive.\n\nTheir fraud team flagged it, and released it only after {{person.cfo.name}} confirmed by phone. They want to know whether they should expect more of these.",
        "Bankens företagsavdelning ringer om den manuella betalningsfilen. Den kom från en annan användare än vanligt, med ett annat format, en dag då affärssystemets vanliga fil inte kom.\n\nDeras bedrägerigrupp flaggade den och släppte den först efter att {{person.cfo.name}} bekräftat per telefon. De vill veta om de ska vänta sig fler sådana."
      ], {
        choice: ask(["What do you agree with the bank?", "Vad kommer ni överens om med banken?"], ["Agrees a verified fallback route for payments with the bank.", "Kommer överens med banken om en verifierad reservväg för betalningar."], [
          opt(["Agree a documented fallback process with call-back verification", "Kom överens om en dokumenterad reservprocess med verifiering via återuppringning"], "c9", ["Next time the manual file is expected and checked.", "Nästa gång är den manuella filen väntad och kontrollerad."], {
            pushback: [
              pb(["Who answers the call-back?", "Vem svarar vid återuppringningen?"], ["The bank wants two named people it can call back to verify a manual file. Today it worked because the CFO picked up. What happens if both are on holiday, or it is three in the morning again?", "Banken vill ha två namngivna personer den kan ringa upp för att verifiera en manuell fil. I dag fungerade det för att ekonomichefen svarade. Vad händer om båda är på semester, eller om det åter är tre på natten?"]),
              pb(["The bank's terms", "Bankens villkor"], ["The bank agrees, but requires dual signatures, a fixed file format and weeks of setup. Until then, any manual file will be held for a day. The ERP system may not be fully trusted by next payday. Do you accept their terms?", "Banken går med på det, men kräver två underskrifter, ett fast filformat och flera veckors uppsättning. Till dess hålls varje manuell fil kvar en dag. Affärssystemet kanske inte är helt pålitligt till nästa lönedag. Accepterar ni deras villkor?"]),
              pb(["A map for fraudsters", "En karta för bedragare"], ["A documented fallback is also a description of how to get a payment file past the bank. Anyone who knows the process, and who to call, could imitate it. Who gets to know it exists, and where is it written down?", "En dokumenterad reservväg är också en beskrivning av hur man får en betalningsfil förbi banken. Den som känner till processen, och vem man ska ringa, kan härma den. Vem får veta att den finns, och var står den nedskriven?"])
            ]
          }),
          opt(["Thank them and return to normal", "Tacka dem och återgå till det normala"], "c9", ["Until the next manual file.", "Fram till nästa manuella fil."], {
            pushback: [
              pb(["Next month's file", "Nästa månads fil"], ["IT is not sure the ERP system will be fully trusted by next payday. If another manual file is needed, the bank's fraud team will flag it again, and may not release it in time. Are you betting next payday on that?", "IT är inte säker på att affärssystemet går att lita på till nästa lönedag. Behövs en manuell fil igen flaggar bankens bedrägerigrupp den igen, och kanske inte släpper den i tid. Satsar ni nästa lönedag på det?"]),
              pb(["“We'll hold the next one”", "”Nästa håller vi kvar”"], ["The bank's contact adds that without an agreed process, any unexpected file will be held until it can be verified, possibly a full day. Thanking them did not change that. Can your staff absorb another late payday?", "Bankens kontaktperson lägger till att utan en överenskommen process hålls varje oväntad fil kvar tills den kan verifieras, kanske ett helt dygn. Att tacka dem ändrade inte det. Klarar er personal ännu en försenad lönedag?"]),
              pb(["Luck is not a process", "Tur är ingen process"], ["Today's file was released only because the CFO happened to answer the phone. Nobody else is registered with the bank to confirm. If that call had gone to voicemail, would anyone have been paid?", "Dagens fil släpptes bara för att ekonomichefen råkade svara i telefon. Ingen annan är registrerad hos banken för att bekräfta. Om samtalet hade gått till röstbrevlådan, hade någon fått lön då?"])
            ]
          })
        ])
      }),

      pg("c9", ["Who watches the administrators?", "Vem bevakar administratörerna?"], [
        "{{person.ciso.name}} proposes monitoring administrator activity: alerts on new scheduled tasks, changes to service accounts and logins outside working hours.\n\nThe IT team reads the proposal as distrust. Their manager points out that the person who did this was one of them, and that most of them want the same thing he does: to never have this happen again.",
        "{{person.ciso.name}} föreslår bevakning av administratörernas aktivitet: larm vid nya schemalagda uppgifter, ändringar av tjänstekonton och inloggningar utanför arbetstid.\n\nIT-teamet läser förslaget som misstro. Deras chef påpekar att den som gjorde det här var en av dem, och att de flesta vill samma sak som hen: att det aldrig ska hända igen."
      ], {
        choice: ask(["How do you introduce oversight?", "Hur inför ni tillsyn?"], ["Builds oversight with the team, focused on actions not people.", "Bygger tillsynen tillsammans med teamet, med fokus på handlingar och inte personer."], [
          opt(["Design the alerts with the IT team, openly", "Utforma larmen tillsammans med IT-teamet, öppet"], "c10", ["They know where the traps are.", "De vet var fällorna finns."], {
            pushback: [
              pb(["Showing them the map", "Att visa dem kartan"], ["A sceptic points out that the person who did this would have known exactly where every alert was, because he would have helped build them. Designing openly with the team shows every administrator where the blind spots are. Is that a risk you accept?", "En skeptiker påpekar att den som gjorde det här hade vetat exakt var varje larm fanns, eftersom han hade hjälpt till att bygga dem. Att utforma öppet med teamet visar varje administratör var de blinda fläckarna finns. Är det en risk ni accepterar?"]),
              pb(["Months of workshops", "Månader av workshoppar"], ["Doing it together takes time: workshops, drafts, agreement. Meanwhile there is still no alert on a new scheduled task anywhere. What do you switch on now, before the team agrees, and does that undo the openness?", "Att göra det tillsammans tar tid: workshoppar, utkast, enighet. Under tiden finns det fortfarande inget larm för en ny schemalagd uppgift någonstans. Vad slår ni på nu, innan teamet är överens, och förstör det öppenheten?"]),
              pb(["Their conditions", "Deras villkor"], ["The team agrees, on conditions: the alerts may never be used in performance reviews, and they want to see who reads them. {{person.ciso.name}} thinks that limits the investigation next time. Do you accept their conditions?", "Teamet går med på det, på villkor: larmen får aldrig användas i medarbetarsamtal, och de vill se vem som läser dem. {{person.ciso.name}} tycker att det begränsar nästa utredning. Accepterar ni deras villkor?"])
            ]
          }),
          opt(["Introduce monitoring without consulting them", "Inför bevakning utan att rådfråga dem"], "c10", ["Effective on paper, corrosive in practice.", "Effektivt på papperet, frätande i praktiken."], {
            pushback: [
              pb(["The first alert", "Det första larmet"], ["The first alert fires on an administrator doing a legitimate night-time fix. They find out from a colleague that they were flagged by a system nobody told them about. What do you say to them, and to the rest of the team who heard?", "Det första larmet går på en administratör som gör en legitim nattlig åtgärd. Hen får veta av en kollega att hen flaggats av ett system ingen berättat om. Vad säger ni till hen, och till resten av teamet som hörde det?"]),
              pb(["Consultation required", "Förhandling krävs"], ["The employee representatives say that new monitoring of staff requires consultation, and {{person.legal.name}} agrees. Going ahead may mean a dispute. Do you pause the monitoring you have already switched on?", "De fackliga företrädarna säger att ny bevakning av personalen kräver förhandling, och {{person.legal.name}} håller med. Att gå vidare kan betyda en tvist. Pausar ni den bevakning ni redan har slagit på?"]),
              pb(["Changes go underground", "Ändringar går under jorden"], ["Within weeks, administrators start making changes in ways that avoid the alerts, simply to avoid the questions. The monitoring sees less than before. What now, when the people you watch know the system better than you?", "Inom några veckor börjar administratörerna göra ändringar på sätt som undviker larmen, bara för att slippa frågorna. Bevakningen ser mindre än tidigare. Vad gör ni nu, när de ni bevakar kan systemet bättre än ni?"])
            ]
          })
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "A month later. Payroll ran normally this month. The crisis team meets to agree what changes for good.\n\nEveryone agrees that the next reorganisation will come, and that some people will leave unhappy. The question is what they will still be able to reach on the way out.",
        "En månad senare. Lönekörningen gick normalt den här månaden. Krisledningen träffas för att komma överens om vad som ändras för gott.\n\nAlla är överens om att nästa omorganisation kommer, och att en del kommer att gå därifrån missnöjda. Frågan är vad de fortfarande kommer att kunna nå på vägen ut."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Removes shared credentials and adds alerts on new scheduled tasks.", "Tar bort delade inloggningar och lägger till larm vid nya schemalagda uppgifter."], [
          opt(["Personal admin accounts, a vault for service credentials, and alerts on new scheduled tasks", "Personliga administratörskonton, ett valv för tjänsteinloggningar och larm vid nya schemalagda uppgifter"], "r-end", ["Fixes the root of it.", "Rättar roten till det."], {
            pushback: [
              pb(["Who guards the vault?", "Vem vaktar valvet?"], ["The vault will hold every service credential, and the people who administer it are the same administrators. One unhappy vault administrator would have more than he ever had. Who watches the vault, and how?", "Valvet kommer att innehålla varje tjänsteinloggning, och de som administrerar det är samma administratörer. En missnöjd valvadministratör skulle ha mer än han någonsin hade. Vem bevakar valvet, och hur?"]),
              pb(["A year of migration", "Ett år av migrering"], ["Moving {{num.serviceAccounts}} accounts into a vault and personal accounts will take most of a year, and the next reorganisation may come sooner. Shared passwords stay until then. What do you do first, and what do you leave exposed?", "Att flytta {{num.serviceAccounts}} konton till ett valv och personliga konton tar större delen av ett år, och nästa omorganisation kan komma tidigare. De delade lösenorden finns kvar till dess. Vad gör ni först, och vad lämnar ni oskyddat?"]),
              pb(["Three in the morning", "Tre på natten"], ["The on-call team objects that a vault with approvals will slow them down when something breaks at night, exactly like the payday morning. They want a break-glass account. Doesn't a shared emergency password bring you right back to where you started?", "Beredskapen invänder att ett valv med godkännanden saktar ner dem när något går sönder på natten, precis som på lönedagsmorgonen. De vill ha ett nödkonto. För inte ett delat nödlösenord er rakt tillbaka till där ni började?"])
            ]
          }),
          opt(["Background checks for administrators", "Bakgrundskontroller för administratörer"], "r-end", ["He had nine clean years.", "Han hade nio fläckfria år."], {
            pushback: [
              pb(["He would have passed", "Han hade klarat den"], ["Every check you are considering would have come back clean for him after nine years. The trigger was the reorganisation, not his past. What would a background check have changed here?", "Varje kontroll ni överväger hade varit ren för honom efter nio år. Det som utlöste det var omorganisationen, inte hans bakgrund. Vad hade en bakgrundskontroll ändrat här?"]),
              pb(["Legal limits", "Rättsliga gränser"], ["{{person.legal.name}} says background checks on existing staff are restricted and need consent, and the union is already asking why administrators are being singled out. Do you push it through, and at what cost to the team?", "{{person.legal.name}} säger att bakgrundskontroller av befintlig personal är begränsade och kräver samtycke, och facket frågar redan varför just administratörerna pekas ut. Driver ni igenom det, och till vilket pris för teamet?"]),
              pb(["The passwords are still shared", "Lösenorden är fortfarande delade"], ["{{person.itOps.name}} notes that after the checks, every administrator will still know the same shared passwords. The next angry leaver walks out with them just as he did. What have you fixed?", "{{person.itOps.name}} påpekar att efter kontrollerna kommer varje administratör fortfarande att kunna samma delade lösenord. Nästa arga person som slutar går ut med dem precis som han gjorde. Vad har ni rättat?"])
            ]
          }),
          opt(["Longer notice periods with garden leave for IT staff", "Längre uppsägningstid med arbetsbefrielse för IT-personal"], "r-end", ["Helps on the day; does not find what was planted before.", "Hjälper på dagen; hittar inte det som placerades ut innan."], {
            pushback: [
              pb(["Planted before notice", "Utplacerat före beskedet"], ["The task that wiped payroll was created six weeks ago, well before his last day. Garden leave starts when notice is given. Would sending him home earlier have stopped anything he had already done?", "Uppgiften som raderade lönerna skapades för sex veckor sedan, långt före hans sista dag. Arbetsbefrielsen börjar när beskedet ges. Hade det stoppat något han redan gjort att skicka hem honom tidigare?"]),
              pb(["Paying people to stay home", "Att betala folk för att stanna hemma"], ["{{person.cfo.name}} asks how many months of salary this means for every IT person who leaves, and whether other departments will ask for the same. It is expensive and permanent. Is it worth it for a gap it does not close?", "{{person.cfo.name}} frågar hur många månadslöner det här blir för varje IT-person som slutar, och om andra avdelningar kommer att vilja ha samma sak. Det är dyrt och permanent. Är det värt det för en lucka det inte stänger?"]),
              pb(["Presumed saboteurs", "Förutsatta sabotörer"], ["The IT team hears that, from now on, anyone of them who gives notice is sent home the same day. Several say it feels like being treated as a suspect for life. What does this rule tell the people who stayed?", "IT-teamet hör att den av dem som säger upp sig från och med nu skickas hem samma dag. Flera säger att det känns som att vara misstänkt på livstid. Vad säger den här regeln till dem som stannade?"])
            ]
          })
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["evidenceKept", "huntedTasks", "rotated"], "e1"],
          ["huntedTasks", "e2"],
          ["rotated", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Three months later", "Tre månader senare"], ["The two other timers never fired. Every shared password he knew has been changed, and the police case rests on clean evidence from the first morning.\n\nThe former administrator has been charged. At the quarter-end, the backup catalogue was still there, and the IT team noticed that nobody mentioned it.", "De två andra timrarna startade aldrig. Varje delat lösenord han kände till har bytts, och polisärendet vilar på rena bevis från den första morgonen.\n\nDen tidigare administratören har åtalats. Vid kvartalsskiftet fanns katalogen över säkerhetskopior kvar, och IT-teamet märkte att ingen nämnde det."], {
        ending: end(1, ["Defused", "Desarmerat"], [
          "Evidence was kept, the other planted tasks were found, and every credential he knew was rotated. Nothing else fires, and the case holds.",
          "Bevisen bevarades, de andra utplacerade uppgifterna hittades och varje inloggning han kände till byttes. Inget mer startar, och ärendet håller."
        ])
      }),
      pg("e2", ["Three months later", "Tre månader senare"], ["The other timers were found and disabled before they fired. But some shared passwords stayed unchanged, or the evidence from the first morning was thin.\n\nThe police case is weaker than it could have been, and an audit finds two service accounts he knew that still work.", "De andra timrarna hittades och inaktiverades innan de startade. Men en del delade lösenord förblev oförändrade, eller så var bevisen från den första morgonen tunna.\n\nPolisärendet är svagare än det kunde ha varit, och en granskning hittar två tjänstekonton han kände till som fortfarande fungerar."], {
        ending: end(2, ["Found the timers, left doors", "Hittade timrarna, lämnade dörrar"], [
          "You found and disabled the other planted tasks, but some of his access or evidence was left behind. The risk is lower, not gone.",
          "Ni hittade och inaktiverade de andra utplacerade uppgifterna, men en del av hans åtkomst eller bevis lämnades kvar. Risken är lägre, inte borta."
        ])
      }),
      pg("e3", ["Next month", "Nästa månad"], ["You changed every password he knew, so he could not get back in. But nobody searched for what he had already left behind.\n\nOn the last day of the next month, at three in the morning, the second task deletes the payroll batch again. This time the team knows what it is, and the recovery takes an hour, not a day.", "Ni bytte varje lösenord han kände till, så han kunde inte ta sig in igen. Men ingen letade efter det han redan lämnat efter sig.\n\nSista dagen nästa månad, klockan tre på natten, raderar den andra uppgiften lönekörningen igen. Den här gången vet teamet vad det är, och återställningen tar en timme, inte en dag."], {
        ending: end(3, ["The second timer", "Den andra timern"], [
          "His access was cut, but the other planted tasks were never searched for. Next month's payroll is wiped again.",
          "Hans åtkomst kapades, men ingen letade efter de andra utplacerade uppgifterna. Nästa månads lönekörning raderas igen."
        ])
      }),
      pg("e4", ["Quarter-end", "Kvartalsskiftet"], ["Nobody searched for other scripts, and most of his shared passwords still work. Next month's payroll is wiped again.\n\nAt quarter-end, the third task deletes the backup catalogue first. When the payroll batch disappears an hour later, there is nothing left to restore it from, and the auditors arrive on Monday.", "Ingen letade efter andra skript, och de flesta av hans delade lösenord fungerar fortfarande. Nästa månads lönekörning raderas igen.\n\nVid kvartalsskiftet raderar den tredje uppgiften katalogen över säkerhetskopior först. När lönekörningen försvinner en timme senare finns det inget kvar att återställa från, och revisorerna kommer på måndag."], {
        ending: end(4, ["It kept going off", "Det fortsatte att smälla"], [
          "Without a search for other planted tasks or a rotation of his credentials, the sabotage repeats, and the last one takes the backups with it.",
          "Utan sökning efter andra utplacerade uppgifter eller byte av hans inloggningar upprepas sabotaget, och det sista tar säkerhetskopiorna med sig."
        ])
      }),

      // Break-away: naming him publicly.
      pg("x1", ["The reply", "Svaret"], [
        "The company's reply is posted under his: it names him and says he sabotaged the payroll system. Within an hour, it has more views than his post.\n\nBy evening, his lawyer has sent a letter: the accusation is defamatory, there is no conviction, and he will sue unless it is withdrawn and corrected.",
        "Företagets svar publiceras under hans inlägg: det namnger honom och säger att han saboterade lönesystemet. Inom en timme har det fler visningar än hans inlägg.\n\nPå kvällen har hans advokat skickat ett brev: anklagelsen är ärekränkande, det finns ingen dom och han kommer att stämma om den inte dras tillbaka och rättas."
      ], {
        choice: ask(["How do you respond to the lawyer?", "Hur svarar ni advokaten?"], ["Withdraws the post and lets the police process run.", "Drar tillbaka inlägget och låter polisprocessen ha sin gång."], [
          opt(["Withdraw the post and refer to the police process", "Dra tillbaka inlägget och hänvisa till polisprocessen"], "x2", ["Necessary, and the screenshots remain.", "Nödvändigt, och skärmbilderna finns kvar."], {
            pushback: [
              pb(["The screenshots remain", "Skärmbilderna finns kvar"], ["The reply has been screenshotted and shared hundreds of times. Withdrawing it now reads, to many, as admitting it was false. How do you withdraw it without seeming to clear him?", "Svaret har skärmdumpats och delats hundratals gånger. Att dra tillbaka det nu läses av många som ett erkännande att det var fel. Hur drar ni tillbaka det utan att verka frikänna honom?"]),
              pb(["“Were we wrong?”", "”Hade vi fel?”"], ["Staff who saw both the reply and its withdrawal ask their managers whether the company accused an innocent man. Managers have no answer. What do you tell your own people, when you cannot say what you know?", "Anställda som såg både svaret och att det drogs tillbaka frågar sina chefer om företaget anklagade en oskyldig. Cheferna har inget svar. Vad säger ni till er egen personal, när ni inte kan säga det ni vet?"]),
              pb(["Withdrawal is not enough", "Att dra tillbaka räcker inte"], ["His lawyer replies that removal is not enough: they want a public correction. You still believe he did it. Do you correct a statement you think is true, to avoid a lawsuit?", "Hans advokat svarar att det inte räcker att ta bort det: de vill ha en offentlig rättelse. Ni tror fortfarande att det var han. Rättar ni ett uttalande ni tror är sant, för att slippa en stämning?"])
            ]
          }),
          opt(["Stand by it", "Stå fast vid det"], "x2", ["Turns a crime case into a defamation case.", "Gör ett brottmål till ett ärekränkningsmål."], {
            pushback: [
              pb(["Prove it in court", "Bevisa det i domstol"], ["{{person.legal.name}} explains that standing by it means proving in a civil court that he sabotaged the system, before any criminal court has ruled. Your evidence would be tested twice. Are you ready to carry that?", "{{person.legal.name}} förklarar att stå fast vid det betyder att bevisa i en civil domstol att han saboterade systemet, innan någon brottmålsdomstol har avgjort saken. Era bevis prövas två gånger. Är ni beredda att bära det?"]),
              pb(["Who pays?", "Vem betalar?"], ["{{person.ceo.name}} learns that the company's insurance is unlikely to cover a defamation claim the company chose to fight. The board wants to know who approved the reply. Who carries this, by name?", "{{person.ceo.name}} får veta att företagets försäkring knappast täcker ett ärekränkningsmål som företaget valde att driva. Styrelsen vill veta vem som godkände svaret. Vem bär det här, med namn?"]),
              pb(["Witnesses pick sides", "Vittnen tar ställning"], ["Some of your staff who commented under his post are also the colleagues the police want to interview. Standing by the accusation forces them to pick a side in public. What does that do to their statements?", "En del av er personal som kommenterade under hans inlägg är också de kollegor polisen vill höra. Att stå fast vid anklagelsen tvingar dem att välja sida offentligt. Vad gör det med deras vittnesmål?"])
            ]
          })
        ])
      }),
      pg("x2", ["The newspaper", "Tidningen"], [
        "A regional newspaper picks up the exchange: a company publicly accusing a laid-off employee of sabotage, and the employee threatening to sue.\n\nThe article includes quotes from current staff about how the reorganisation was handled. The sabotage itself is described as “an alleged incident”.",
        "En regionaltidning plockar upp ordväxlingen: ett företag som offentligt anklagar en uppsagd anställd för sabotage, och den anställda som hotar att stämma.\n\nArtikeln innehåller citat från nuvarande personal om hur omorganisationen sköttes. Själva sabotaget beskrivs som ”en påstådd incident”."
      ], {
        choice: ask(["What do you say to the newspaper?", "Vad säger ni till tidningen?"], ["Declines to discuss an individual and refers to the police.", "Avböjer att diskutera en enskild person och hänvisar till polisen."], [
          opt(["Decline to discuss an individual; confirm a police report exists", "Avböj att diskutera en enskild person; bekräfta att det finns en polisanmälan"], "x3", ["Too late for restraint, but better than more.", "För sent för återhållsamhet, men bättre än mer."], {
            pushback: [
              pb(["“The company declined”", "”Företaget avböjde”"], ["The reporter says the article will note that the company declined to back up its own accusation. After naming him publicly, restraint now looks like retreat. Is that a headline you can live with?", "Reportern säger att artikeln kommer att nämna att företaget avböjde att styrka sin egen anklagelse. Efter att ha pekat ut honom offentligt ser återhållsamhet nu ut som reträtt. Är det en rubrik ni kan leva med?"]),
              pb(["Your staff are quoted", "Er personal citeras"], ["The article quotes current staff about the reorganisation. Several managers want to find out who spoke. Doing so would contradict everything restraint was meant to show. Do you look for them?", "Artikeln citerar nuvarande anställda om omorganisationen. Flera chefer vill ta reda på vem som pratade. Att göra det skulle motsäga allt som återhållsamheten skulle visa. Letar ni efter dem?"]),
              pb(["Confirming is naming", "Att bekräfta är att peka ut"], ["Confirming that a police report exists, in an article that already names him, is in effect naming him again. {{person.legal.name}} is not sure it is safer than silence. Do you confirm it?", "Att bekräfta att det finns en polisanmälan, i en artikel som redan namnger honom, är i praktiken att peka ut honom igen. {{person.legal.name}} är inte säker på att det är tryggare än tystnad. Bekräftar ni det?"])
            ]
          }),
          opt(["Give the newspaper the evidence", "Ge tidningen bevisen"], "x3", ["Undermines the police case.", "Undergräver polisärendet."], {
            pushback: [
              pb(["Did you ask the police?", "Frågade ni polisen?"], ["Nobody has asked the investigator whether the evidence can be shared. Once it is printed, the defence can say the case was tried in the newspaper first. Do you still hand it over without asking?", "Ingen har frågat utredaren om bevisen får delas. När de väl är tryckta kan försvaret säga att fallet avgjordes i tidningen först. Lämnar ni ändå över dem utan att fråga?"]),
              pb(["Other people's data", "Andras uppgifter"], ["The logs contain account names and activity of other employees, not just his. Giving them to a newspaper may be a data protection breach of your own. Who has checked what is in the file?", "Loggarna innehåller kontonamn och aktivitet för andra anställda, inte bara hans. Att ge dem till en tidning kan vara ett eget brott mot dataskyddet. Vem har kontrollerat vad som finns i filen?"]),
              pb(["He gets to see it too", "Han får också se det"], ["The newspaper will send the evidence to him for comment before publishing. He and his lawyer will see exactly what you have, and what you do not. Are you ready for that?", "Tidningen kommer att skicka bevisen till honom för kommentar innan publicering. Han och hans advokat får se exakt vad ni har, och vad ni inte har. Är ni beredda på det?"])
            ]
          })
        ])
      }),
      pg("x3", ["The prosecutor", "Åklagaren"], [
        "The prosecutor handling the police report calls {{person.legal.name}}. The public accusation has complicated things: the defence will argue that the company has prejudged the case and shaped witness statements.\n\nShe asks the company to say nothing more in public, and to explain who decided to post the reply.",
        "Åklagaren som handlägger polisanmälan ringer {{person.legal.name}}. Den offentliga anklagelsen har komplicerat saken: försvaret kommer att hävda att företaget har dömt i förväg och påverkat vittnesmål.\n\nHon ber företaget att inte säga något mer offentligt, och att förklara vem som beslutade att publicera svaret."
      ], {
        choice: ask(["How do you answer the prosecutor?", "Hur svarar ni åklagaren?"], ["Cooperates fully and stops all public comment.", "Samarbetar fullt ut och upphör med alla offentliga kommentarer."], [
          opt(["Cooperate fully and stop all public comment", "Samarbeta fullt ut och upphör med alla offentliga kommentarer"], "x4", ["The best that can be done now.", "Det bästa som kan göras nu."], {
            pushback: [
              pb(["A name, not “the company”", "Ett namn, inte ”företaget”"], ["The prosecutor asks who decided to post the reply. “The company” will not do; she wants the person. That person may be sitting in the room. Do you give her a name?", "Åklagaren frågar vem som beslutade att publicera svaret. ”Företaget” räcker inte; hon vill ha personen. Den personen kanske sitter i rummet. Ger ni henne ett namn?"]),
              pb(["The newspaper follows up", "Tidningen följer upp"], ["The newspaper calls again, asking why the company has suddenly gone quiet. After a loud start, silence looks like being told off. How do you hold it without explaining why?", "Tidningen ringer igen och frågar varför företaget plötsligt har tystnat. Efter en högljudd start ser tystnaden ut som att ni fått en tillrättavisning. Hur håller ni den utan att förklara varför?"]),
              pb(["Interviews for the room", "Förhör för rummet"], ["Full cooperation means the prosecutor wants to interview everyone involved in writing and approving the post. Some in the room ask whether they need their own lawyers. Do they, and who pays?", "Fullt samarbete betyder att åklagaren vill höra alla som var med och skrev och godkände inlägget. En del i rummet frågar om de behöver egna jurister. Gör de det, och vem betalar?"])
            ]
          }),
          opt(["Defend the decision to post", "Försvara beslutet att publicera"], "x4", ["Not to a prosecutor.", "Inte inför en åklagare."], {
            pushback: [
              pb(["Arguing with your own case", "Att bråka med sitt eget ärende"], ["The prosecutor is the person carrying your case. She has just told you the reply made her job harder. Defending it to her sounds like the company is running its own campaign. What do you gain by arguing?", "Åklagaren är den som driver ert ärende. Hon har just sagt att svaret gjort hennes arbete svårare. Att försvara det inför henne låter som att företaget driver en egen kampanj. Vad vinner ni på att argumentera?"]),
              pb(["Legal won't say it", "Juristen tänker inte säga det"], ["{{person.legal.name}} refuses to put the defence of the post to the prosecutor. Someone else in the room would have to make the argument. Who will, and are they ready to have it written down?", "{{person.legal.name}} vägrar att framföra försvaret av inlägget till åklagaren. Någon annan i rummet skulle behöva föra fram argumentet. Vem gör det, och är den personen beredd att få det nedskrivet?"]),
              pb(["It goes in the file", "Det hamnar i akten"], ["Whatever you tell the prosecutor goes into the case file, which the defence can read. Your defence of the post becomes their exhibit. Do you want those words on record?", "Det ni säger till åklagaren hamnar i akten, som försvaret kan läsa. Ert försvar av inlägget blir deras bevis. Vill ni ha de orden dokumenterade?"])
            ]
          })
        ])
      }),
      pg("x4", ["The settlement", "Förlikningen"], [
        "Months later, the criminal case is dropped for insufficient evidence, partly because of how the first morning was handled and partly because of the public accusation.\n\nThe former administrator's defamation claim is still open. His lawyer proposes a settlement and a public correction.",
        "Månader senare läggs brottmålet ner i brist på bevis, dels på grund av hur den första morgonen hanterades och dels på grund av den offentliga anklagelsen.\n\nDen tidigare administratörens ärekränkningsanspråk är fortfarande öppet. Hans advokat föreslår en förlikning och en offentlig rättelse."
      ], {
        choice: ask(["Do you settle?", "Förliker ni er?"], ["Settles and learns, rather than fighting a second case.", "Förliker sig och lär sig, i stället för att driva ett andra mål."], [
          opt(["Settle and publish a correction", "Förlik er och publicera en rättelse"], "e5", ["Painful, final.", "Smärtsamt, slutgiltigt."], {
            pushback: [
              pb(["The wording", "Ordalydelsen"], ["His lawyer's draft correction says the company's statement was “false”. You still believe he did it, and the criminal case was dropped, not lost. Can you sign that word, and what wording would you accept instead?", "Hans advokats utkast till rättelse säger att företagets uttalande var ”falskt”. Ni tror fortfarande att det var han, och brottmålet lades ner, det förlorades inte. Kan ni skriva under på det ordet, och vilken formulering skulle ni acceptera i stället?"]),
              pb(["The team reads it", "Teamet läser den"], ["The IT team who rebuilt payroll that morning will read a correction that seems to clear him. Some of them gave statements to the police. What do you tell them before it is published?", "IT-teamet som byggde om lönerna den morgonen kommer att läsa en rättelse som verkar frikänna honom. En del av dem lämnade uppgifter till polisen. Vad säger ni till dem innan den publiceras?"]),
              pb(["Paying him", "Att betala honom"], ["{{person.cfo.name}} points out that the settlement means paying the person you believe sabotaged payroll. The board is uneasy. How do you defend writing that cheque?", "{{person.cfo.name}} påpekar att förlikningen betyder att betala den person ni tror saboterade lönerna. Styrelsen är obekväm. Hur försvarar ni att skriva under den utbetalningen?"])
            ]
          }),
          opt(["Fight the defamation claim", "Bestrid ärekränkningsanspråket"], "e5", ["Years, and the same story told again in court.", "År, och samma historia berättad igen i domstol."], {
            pushback: [
              pb(["Everything comes out", "Allt kommer fram"], ["A court case means disclosing internal documents: the reorganisation file, the manager's note, the four-year-old shared password. All of it becomes public record. Is winning worth showing that?", "Ett domstolsmål betyder att lämna ut interna dokument: omorganisationsmappen, chefens anteckning, det fyra år gamla delade lösenordet. Allt blir offentligt. Är det värt att visa det för att vinna?"]),
              pb(["Years of leadership time", "År av ledningens tid"], ["{{person.ceo.name}} and others in the room would be witnesses, for years, retelling the payday morning in court. Every hearing is a new article. Who wants to spend the next years on this?", "{{person.ceo.name}} och andra i rummet skulle vara vittnen, i flera år, och återberätta lönedagsmorgonen i domstol. Varje förhandling blir en ny artikel. Vem vill lägga de kommande åren på det här?"]),
              pb(["The same evidence", "Samma bevis"], ["The criminal case was dropped for insufficient evidence. Your defence in a civil case would rest on that same evidence. Why do you expect a different result this time?", "Brottmålet lades ner i brist på bevis. Ert försvar i ett civilmål skulle vila på samma bevis. Varför väntar ni er ett annat resultat den här gången?"])
            ]
          })
        ])
      }),
      pg("e5", ["A year later", "Ett år senare"], ["A planted script on payday became a public accusation, a dropped criminal case and a settlement in which the company corrected its own statement.\n\nThe former administrator now works for another company. Nobody at {{org.name}} is sure what he could reach there.", "Ett utplacerat skript på lönedagen blev en offentlig anklagelse, ett nedlagt brottmål och en förlikning där företaget rättade sitt eget uttalande.\n\nDen tidigare administratören arbetar nu på ett annat företag. Ingen på {{org.name}} vet säkert vad han kan nå där."], {
        ending: end(5, ["The accusation backfired", "Anklagelsen slog tillbaka"], [
          "Naming him publicly turned a sabotage case into a defamation case. The criminal case was dropped and the company had to correct itself.",
          "Att peka ut honom offentligt gjorde ett sabotageärende till ett ärekränkningsärende. Brottmålet lades ner och företaget fick rätta sig själv."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Preserve evidence before restoring: sabotage is a crime, and the first hour decides the case.", "Säkra bevisen före återställningen: sabotage är ett brott, och den första timmen avgör ärendet."]),
        L(["An insider who planted one timer may have planted more: search everything they could reach.", "En insider som placerat ut en timer kan ha placerat ut fler: sök igenom allt hen kunde nå."]),
        L(["Offboarding for administrators must cover shared and service credentials, before notice is given.", "Avveckling av administratörer måste omfatta delade inloggningar och tjänsteinloggningar, innan beskedet ges."]),
        L(["Let the legal process speak; public accusations hurt the case.", "Låt rättsprocessen tala; offentliga anklagelser skadar ärendet."])
      ],
      strengthsToLookFor: [
        L(["Snapshotting before restoring", "Att ta en ögonblicksbild före återställningen"]),
        L(["Searching for other scheduled tasks", "Att söka efter andra schemalagda uppgifter"]),
        L(["Paying staff on time from rough data", "Att betala personalen i tid utifrån grova underlag"])
      ],
      commonGaps: [
        L(["Restoring first and losing the evidence", "Att återställa först och förlora bevisen"]),
        L(["Rotating only the account that was used", "Att bara byta det konto som användes"]),
        L(["Replying publicly to the former employee", "Att svara offentligt på den tidigare anställdes inlägg"])
      ],
      suggestedActions: [
        act(["Replace shared administrator and service passwords with personal accounts and a vault.", "Ersätt delade administratörs- och tjänstelösenord med personliga konton och ett valv."], "itOps", "high"),
        act(["Alert on new scheduled tasks and service account changes.", "Larma vid nya schemalagda uppgifter och ändringar av tjänstekonton."], "socLead", "high"),
        act(["Create a privileged leaver procedure started before notice.", "Skapa en avvecklingsrutin för privilegierade användare som påbörjas före beskedet."], "hr", "medium"),
        act(["Agree a verified fallback payment process with the bank.", "Kom överens med banken om en verifierad reservprocess för betalningar."], "cfo", "medium")
      ]
    }
  });
})();
