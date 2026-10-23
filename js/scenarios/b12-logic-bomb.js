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
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

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
      payroll: { min: 2, max: 80, scaleBy: "size", currency: true },
      serviceAccounts: { min: 6, max: 60, scaleBy: "size" }
    },
    roles: ["incidentCommander", "ciso", "itOps", "socLead", "hr", "legal", "cfo", "ceo", "comms"],

    flags: {
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
          opt(["Snapshot the server and logs, then restore", "Ta en ögonblicksbild av server och loggar, återställ sedan"], "c2", ["Costs twenty minutes. Keeps the story of what happened.", "Kostar tjugo minuter. Behåller berättelsen om vad som hände."], { set: "evidenceKept" }),
          opt(["Restore from last night's backup immediately", "Återställ från nattens säkerhetskopia omedelbart"], "c2", ["Fastest route to payroll. Overwrites the traces.", "Snabbaste vägen till lönekörningen. Skriver över spåren."], { set: "restoredFast" }),
          opt(["Disconnect the ERP server from the network", "Koppla bort affärssystemets server från nätverket"], "c2", ["Stops anything else firing. Also stops payroll.", "Stoppar allt annat från att starta. Stoppar också lönekörningen."])
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
          opt(["Search every server for tasks he created", "Sök igenom varje server efter uppgifter han skapat"], "l1", ["If he planted one, he may have planted more.", "Om han placerade ut en kan han ha placerat ut fler."], { set: "huntedTasks" }),
          opt(["Focus everything on getting payroll out today", "Lägg allt på att få ut lönerna i dag"], "l1", ["The urgent problem. Not the only one.", "Det brådskande problemet. Inte det enda."]),
          opt(["Call the former administrator and ask him directly", "Ring den tidigare administratören och fråga honom direkt"], "c3b", ["You will learn something, and so will he.", "Ni kommer att få veta något, och det kommer han också."])
        ])
      }),

      pg("l1", ["The other timers", "De andra timrarna"], [
        "The search takes two hours across every server the maintenance account could reach. It finds two more tasks with the same author and the same innocent naming.\n\nOne is set for the last day of next month, at the same minute. The other is set for quarter-end, and its script deletes the backup catalogue before doing anything else.",
        "Sökningen tar två timmar över varje server som underhållskontot kunde nå. Den hittar två uppgifter till med samma upphovsperson och samma oskyldiga namngivning.\n\nDen ena är inställd på sista dagen nästa månad, samma minut. Den andra är inställd på kvartalsskiftet, och dess skript raderar katalogen över säkerhetskopior innan det gör något annat."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you do with them?", "Vad gör ni med dem?"], ["Disables them, keeps copies as evidence, and keeps looking.", "Inaktiverar dem, behåller kopior som bevis och fortsätter leta."], [
          opt(["Disable both, keep copies, and widen the search", "Inaktivera båda, behåll kopior och bredda sökningen"], "c3", ["Thorough. The search may find nothing more, or something.", "Grundligt. Sökningen kanske inte hittar något mer, eller något."], { set: "huntedTasks" }),
          opt(["Delete both and move on", "Radera båda och gå vidare"], "c3", ["Safe for now, and the evidence goes with them.", "Säkert för stunden, och bevisen försvinner med dem."])
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
          opt(["Build a payment file from last month plus this month's changes", "Bygg en betalningsfil från förra månaden plus den här månadens ändringar"], "c4", ["Some errors, corrected later. Everyone is paid today.", "En del fel, som rättas senare. Alla får lön i dag."], { effects: { trust: 1 }, set: "paidOnTime" }),
          opt(["Delay payroll by a day and tell staff why", "Skjut upp lönen en dag och berätta varför"], "c4", ["Honest and safer, and some staff have bills due today.", "Ärligt och säkrare, och en del anställda har räkningar som förfaller i dag."], { effects: { trust: -1 } }),
          opt(["Pay everyone exactly last month's amount", "Betala alla exakt förra månadens belopp"], "c4", ["Simple, and wrong for everyone who changed.", "Enkelt, och fel för alla som har förändringar."], { set: "paidOnTime" })
        ])
      }),

      pg("c3b", ["The phone call", "Telefonsamtalet"], [
        "{{person.hr.name}} calls the former administrator. He answers sleepily, listens, and denies everything. Then, after a pause, he says that perhaps the company should have thought about what it was doing before it let people go.\n\nHe ends the call by saying he will speak only through a lawyer. Whatever he knew before the call, he now knows that you know.",
        "{{person.hr.name}} ringer den tidigare administratören. Han svarar sömnigt, lyssnar och förnekar allt. Sedan, efter en paus, säger han att företaget kanske borde ha tänkt på vad det gjorde innan det sa upp folk.\n\nHan avslutar samtalet med att säga att han bara kommer att prata via en advokat. Vad han än visste före samtalet vet han nu att ni vet."
      ], {
        choice: ask(["What do you do after the call?", "Vad gör ni efter samtalet?"], ["Preserves everything and goes to the police; no further contact.", "Säkrar allt och går till polisen; ingen ytterligare kontakt."], [
          opt(["Preserve everything and report to the police", "Säkra allt och anmäl till polisen"], "c4", ["The right route, and he may already be cleaning up.", "Rätt väg, och han kanske redan städar."], { set: "policeReport" }),
          opt(["Send a letter threatening legal action", "Skicka ett brev med hot om rättsliga åtgärder"], "c4", ["Feels strong. Changes nothing he can still do.", "Känns kraftfullt. Ändrar inget av det han fortfarande kan göra."])
        ])
      }),

      pg("c4", ["The access he kept", "Åtkomsten han behöll"], [
        "How did he do it after leaving? {{person.itOps.name}} explains. The maintenance service account's password has not changed in four years, and every administrator knew it. It is also used by the shared VPN profile that the IT team uses on call.\n\nThere are {{num.serviceAccounts}} service accounts like it. Nobody has a list of who knows which password.",
        "Hur gjorde han det efter att ha slutat? {{person.itOps.name}} förklarar. Underhållskontots lösenord har inte ändrats på fyra år, och varje administratör kände till det. Det används också av den delade vpn-profil som IT-teamet använder vid beredskap.\n\nDet finns {{num.serviceAccounts}} sådana tjänstekonton. Ingen har en lista över vem som känner till vilket lösenord."
      ], {
        discuss: [q("Which shared passwords did he know, and which do the rest of the team still know?", "Vilka delade lösenord kände han till, och vilka känner resten av teamet fortfarande till?", ["itOps"])],
        choice: ask(["How far do you go?", "Hur långt går ni?"], ["Rotates every shared credential he could have known, even at the cost of disruption.", "Byter varje delad inloggning han kan ha känt till, även om det stör."], [
          opt(["Rotate every service account and shared password he could have known", "Byt varje tjänstekonto och delat lösenord han kan ha känt till"], "l2", ["A day of breakage. The only way to be sure.", "Ett dygn av störningar. Det enda sättet att vara säker."], { set: "rotated" }),
          opt(["Rotate the ERP maintenance account only", "Byt bara affärssystemets underhållskonto"], "l2", ["Closes the door he used, and leaves the others.", "Stänger dörren han använde, och lämnar de andra."]),
          opt(["Block his home IP addresses", "Blockera hans hem-IP-adresser"], "l2", ["He has more than one internet connection.", "Han har fler än en internetanslutning."])
        ])
      }),

      pg("l2", ["The reorganisation file", "Omorganisationsmappen"], [
        "{{person.hr.name}} reads the reorganisation file. The administrator's manager noted two months ago that he was “very angry” about the plans and “has keys to everything”.\n\nThe note was filed. No security review of his access was done before the announcement, and his last day was handled with the standard checklist, which covers personal accounts only.",
        "{{person.hr.name}} läser omorganisationsmappen. Administratörens chef noterade för två månader sedan att han var ”mycket arg” över planerna och ”har nycklar till allt”.\n\nAnteckningen arkiverades. Ingen säkerhetsgenomgång av hans åtkomst gjordes före beskedet, och hans sista dag hanterades med standardchecklistan, som bara omfattar personliga konton."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you do with this?", "Vad gör ni med det här?"], ["Records it honestly as a process failure, not a personal one.", "Dokumenterar det ärligt som ett processfel, inte ett personligt."], [
          opt(["Record it as a process failure for the review", "Dokumentera det som ett processfel inför genomgången"], "c5", ["Fair to the manager, useful for the future.", "Rättvist mot chefen, användbart för framtiden."]),
          opt(["Raise it as the manager's failure", "Lyft det som chefens misslyckande"], "c5", ["Finds a second person to blame.", "Hittar ytterligare en person att skylla på."])
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
          opt(["Report to the police with the evidence you have", "Polisanmäl med de bevis ni har"], "l3", ["The right step. It may become public.", "Rätt steg. Det kan bli offentligt."], { set: "policeReport" }),
          opt(["Handle it through employment lawyers only", "Hantera det enbart via arbetsrättsjurister"], "l3", ["Quiet, and he faces no criminal consequence.", "Tyst, och han möter inga straffrättsliga följder."]),
          opt(["Do nothing formal; the damage is repaired", "Gör inget formellt; skadan är reparerad"], "l3", ["The cheapest today, and it tells everyone something.", "Billigast i dag, och det säger något till alla."])
        ])
      }),

      pg("l3", ["The team that stayed", "Teamet som stannade"], [
        "The remaining IT team is shaken. He was their colleague for nine years. Some are angry with him; some are angry with the company for the way the reorganisation was handled.\n\nRumours are spreading that there are more hidden scripts, and that the company now suspects everyone with administrator access.",
        "Det kvarvarande IT-teamet är skakat. Han var deras kollega i nio år. En del är arga på honom; en del är arga på företaget för hur omorganisationen sköttes.\n\nRykten sprids om att det finns fler dolda skript, och om att företaget nu misstänker alla med administratörsbehörighet."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["What do you say to the team?", "Vad säger ni till teamet?"], ["Tells them what is known, that they are not suspects, and what will change.", "Berättar vad som är känt, att de inte är misstänkta och vad som kommer att ändras."], [
          opt(["Meet them, share the facts and say they are not suspects", "Träffa dem, dela fakta och säg att de inte är misstänkta"], "c6", ["Reduces fear. They know more than anyone where to look.", "Minskar rädslan. De vet bättre än någon var man ska leta."]),
          opt(["Say nothing while the investigation runs", "Säg ingenting medan utredningen pågår"], "c6", ["The rumours write the story instead.", "Ryktena skriver berättelsen i stället."])
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
          opt(["Say nothing publicly and pass the post to the police", "Säg ingenting offentligt och lämna inlägget till polisen"], "c7", ["Frustrating, and correct.", "Frustrerande, och rätt."]),
          opt(["Send a calm internal message to staff", "Skicka ett lugnt internt meddelande till personalen"], "c7", ["Addresses the people who matter most.", "Vänder sig till dem som betyder mest."]),
          opt(["Reply publicly, naming him as the saboteur", "Svara offentligt och peka ut honom som sabotör"], "x1", ["Satisfying for a minute.", "Tillfredsställande i en minut."], { effects: { media: 2 }, set: "accused" })
        ])
      }),

      pg("c7", ["The auditor", "Revisorn"], [
        "The external auditor has heard about the payroll failure and asks for a meeting. They want to know how a former employee could run code on the ERP system, and whether the payment file sent manually had proper approval.\n\nThe annual audit is in six weeks. Their questions will be in the management letter, whatever you answer.",
        "Den externa revisorn har hört om lönekörningen som misslyckades och ber om ett möte. Hen vill veta hur en tidigare anställd kunde köra kod i affärssystemet, och om betalningsfilen som skickades manuellt hade ett korrekt godkännande.\n\nÅrsrevisionen är om sex veckor. Frågorna kommer att stå i revisionsrapporten, vad ni än svarar."
      ], {
        choice: ask(["How do you meet the auditor?", "Hur möter ni revisorn?"], ["Gives a full account with the control failures and the fixes.", "Ger en fullständig redogörelse med kontrollbristerna och åtgärderna."], [
          opt(["A full account, control gaps included", "En fullständig redogörelse, inklusive kontrollbristerna"], "l4", ["Uncomfortable, and auditors respect it.", "Obekvämt, och revisorer respekterar det."], { effects: { regulator: -1 } }),
          opt(["A short account focusing on the recovery", "En kort redogörelse med fokus på återställningen"], "l4", ["They will ask the other questions anyway.", "De kommer att ställa de andra frågorna ändå."], { effects: { regulator: 1 } })
        ])
      }),

      pg("l4", ["Offboarding", "Avveckling"], [
        "{{person.ciso.name}} compares the standard leaver checklist with what an administrator actually holds. The checklist covers the personal account, the badge and the laptop.\n\nIt says nothing about service accounts, shared passwords, scheduled tasks, VPN profiles or the keys to the server room. For most staff that is fine. For administrators it is almost nothing.",
        "{{person.ciso.name}} jämför standardchecklistan för den som slutar med vad en administratör faktiskt har. Checklistan omfattar det personliga kontot, passerkortet och datorn.\n\nDen säger ingenting om tjänstekonton, delade lösenord, schemalagda uppgifter, vpn-profiler eller nycklarna till serverrummet. För de flesta anställda räcker det. För administratörer är det nästan ingenting."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you change in offboarding?", "Vad ändrar ni i avvecklingen?"], ["Adds a privileged-leaver procedure that starts before the announcement.", "Lägger till en avvecklingsrutin för privilegierade användare som börjar före beskedet."], [
          opt(["A privileged leaver procedure, started before any notice is given", "En avvecklingsrutin för privilegierade användare, påbörjad innan något besked ges"], "c8", ["Hard to do kindly, and essential.", "Svårt att göra på ett vänligt sätt, och nödvändigt."]),
          opt(["Add service accounts to the existing checklist", "Lägg till tjänstekonton i den befintliga checklistan"], "c8", ["Better than before, still after the fact.", "Bättre än tidigare, fortfarande i efterhand."])
        ])
      }),

      pg("c8", ["The bank", "Banken"], [
        "The bank's corporate desk calls about the manual payment file. It arrived from a different user than usual, with different formatting, on a day when the ERP system's usual file did not arrive.\n\nTheir fraud team flagged it, and released it only after {{person.cfo.name}} confirmed by phone. They want to know whether they should expect more of these.",
        "Bankens företagsavdelning ringer om den manuella betalningsfilen. Den kom från en annan användare än vanligt, med ett annat format, en dag då affärssystemets vanliga fil inte kom.\n\nDeras bedrägerigrupp flaggade den och släppte den först efter att {{person.cfo.name}} bekräftat per telefon. De vill veta om de ska vänta sig fler sådana."
      ], {
        choice: ask(["What do you agree with the bank?", "Vad kommer ni överens om med banken?"], ["Agrees a verified fallback route for payments with the bank.", "Kommer överens med banken om en verifierad reservväg för betalningar."], [
          opt(["Agree a documented fallback process with call-back verification", "Kom överens om en dokumenterad reservprocess med verifiering via återuppringning"], "c9", ["Next time the manual file is expected and checked.", "Nästa gång är den manuella filen väntad och kontrollerad."]),
          opt(["Thank them and return to normal", "Tacka dem och återgå till det normala"], "c9", ["Until the next manual file.", "Fram till nästa manuella fil."])
        ])
      }),

      pg("c9", ["Who watches the administrators?", "Vem bevakar administratörerna?"], [
        "{{person.ciso.name}} proposes monitoring administrator activity: alerts on new scheduled tasks, changes to service accounts and logins outside working hours.\n\nThe IT team reads the proposal as distrust. Their manager points out that the person who did this was one of them, and that most of them want the same thing he does: to never have this happen again.",
        "{{person.ciso.name}} föreslår bevakning av administratörernas aktivitet: larm vid nya schemalagda uppgifter, ändringar av tjänstekonton och inloggningar utanför arbetstid.\n\nIT-teamet läser förslaget som misstro. Deras chef påpekar att den som gjorde det här var en av dem, och att de flesta vill samma sak som hen: att det aldrig ska hända igen."
      ], {
        choice: ask(["How do you introduce oversight?", "Hur inför ni tillsyn?"], ["Builds oversight with the team, focused on actions not people.", "Bygger tillsynen tillsammans med teamet, med fokus på handlingar och inte personer."], [
          opt(["Design the alerts with the IT team, openly", "Utforma larmen tillsammans med IT-teamet, öppet"], "c10", ["They know where the traps are.", "De vet var fällorna finns."]),
          opt(["Introduce monitoring without consulting them", "Inför bevakning utan att rådfråga dem"], "c10", ["Effective on paper, corrosive in practice.", "Effektivt på papperet, frätande i praktiken."])
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "A month later. Payroll ran normally this month. The crisis team meets to agree what changes for good.\n\nEveryone agrees that the next reorganisation will come, and that some people will leave unhappy. The question is what they will still be able to reach on the way out.",
        "En månad senare. Lönekörningen gick normalt den här månaden. Krisledningen träffas för att komma överens om vad som ändras för gott.\n\nAlla är överens om att nästa omorganisation kommer, och att en del kommer att gå därifrån missnöjda. Frågan är vad de fortfarande kommer att kunna nå på vägen ut."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Removes shared credentials and adds alerts on new scheduled tasks.", "Tar bort delade inloggningar och lägger till larm vid nya schemalagda uppgifter."], [
          opt(["Personal admin accounts, a vault for service credentials, and alerts on new scheduled tasks", "Personliga administratörskonton, ett valv för tjänsteinloggningar och larm vid nya schemalagda uppgifter"], "r-end", ["Fixes the root of it.", "Rättar roten till det."]),
          opt(["Background checks for administrators", "Bakgrundskontroller för administratörer"], "r-end", ["He had nine clean years.", "Han hade nio fläckfria år."]),
          opt(["Longer notice periods with garden leave for IT staff", "Längre uppsägningstid med arbetsbefrielse för IT-personal"], "r-end", ["Helps on the day; does not find what was planted before.", "Hjälper på dagen; hittar inte det som placerades ut innan."])
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
          opt(["Withdraw the post and refer to the police process", "Dra tillbaka inlägget och hänvisa till polisprocessen"], "x2", ["Necessary, and the screenshots remain.", "Nödvändigt, och skärmbilderna finns kvar."]),
          opt(["Stand by it", "Stå fast vid det"], "x2", ["Turns a crime case into a defamation case.", "Gör ett brottmål till ett ärekränkningsmål."])
        ])
      }),
      pg("x2", ["The newspaper", "Tidningen"], [
        "A regional newspaper picks up the exchange: a company publicly accusing a laid-off employee of sabotage, and the employee threatening to sue.\n\nThe article includes quotes from current staff about how the reorganisation was handled. The sabotage itself is described as “an alleged incident”.",
        "En regionaltidning plockar upp ordväxlingen: ett företag som offentligt anklagar en uppsagd anställd för sabotage, och den anställda som hotar att stämma.\n\nArtikeln innehåller citat från nuvarande personal om hur omorganisationen sköttes. Själva sabotaget beskrivs som ”en påstådd incident”."
      ], {
        choice: ask(["What do you say to the newspaper?", "Vad säger ni till tidningen?"], ["Declines to discuss an individual and refers to the police.", "Avböjer att diskutera en enskild person och hänvisar till polisen."], [
          opt(["Decline to discuss an individual; confirm a police report exists", "Avböj att diskutera en enskild person; bekräfta att det finns en polisanmälan"], "x3", ["Too late for restraint, but better than more.", "För sent för återhållsamhet, men bättre än mer."]),
          opt(["Give the newspaper the evidence", "Ge tidningen bevisen"], "x3", ["Undermines the police case.", "Undergräver polisärendet."])
        ])
      }),
      pg("x3", ["The prosecutor", "Åklagaren"], [
        "The prosecutor handling the police report calls {{person.legal.name}}. The public accusation has complicated things: the defence will argue that the company has prejudged the case and shaped witness statements.\n\nShe asks the company to say nothing more in public, and to explain who decided to post the reply.",
        "Åklagaren som handlägger polisanmälan ringer {{person.legal.name}}. Den offentliga anklagelsen har komplicerat saken: försvaret kommer att hävda att företaget har dömt i förväg och påverkat vittnesmål.\n\nHon ber företaget att inte säga något mer offentligt, och att förklara vem som beslutade att publicera svaret."
      ], {
        choice: ask(["How do you answer the prosecutor?", "Hur svarar ni åklagaren?"], ["Cooperates fully and stops all public comment.", "Samarbetar fullt ut och upphör med alla offentliga kommentarer."], [
          opt(["Cooperate fully and stop all public comment", "Samarbeta fullt ut och upphör med alla offentliga kommentarer"], "x4", ["The best that can be done now.", "Det bästa som kan göras nu."]),
          opt(["Defend the decision to post", "Försvara beslutet att publicera"], "x4", ["Not to a prosecutor.", "Inte inför en åklagare."])
        ])
      }),
      pg("x4", ["The settlement", "Förlikningen"], [
        "Months later, the criminal case is dropped for insufficient evidence, partly because of how the first morning was handled and partly because of the public accusation.\n\nThe former administrator's defamation claim is still open. His lawyer proposes a settlement and a public correction.",
        "Månader senare läggs brottmålet ner i brist på bevis, dels på grund av hur den första morgonen hanterades och dels på grund av den offentliga anklagelsen.\n\nDen tidigare administratörens ärekränkningsanspråk är fortfarande öppet. Hans advokat föreslår en förlikning och en offentlig rättelse."
      ], {
        choice: ask(["Do you settle?", "Förliker ni er?"], ["Settles and learns, rather than fighting a second case.", "Förliker sig och lär sig, i stället för att driva ett andra mål."], [
          opt(["Settle and publish a correction", "Förlik er och publicera en rättelse"], "e5", ["Painful, final.", "Smärtsamt, slutgiltigt."]),
          opt(["Fight the defamation claim", "Bestrid ärekränkningsanspråket"], "e5", ["Years, and the same story told again in court.", "År, och samma historia berättad igen i domstol."])
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
