/*
 * b02-saas-payroll.js — "Payday at Risk" (branching, SaaS provider).
 *
 * The payroll provider is breached on salary day and stops all payroll runs.
 * Spine: first move → what data is in scope → pay or wait → staff questions →
 * payday phishing → the 72 hours (controller vs processor) → a second wave →
 * the next payroll run → what changes. Break-away at the notification page:
 * blaming the provider in public. Endings by flags: notified + staff told +
 * paid (contained) … unpaid and late (severe).
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b02-saas-payroll",
    version: 1,
    format: "branching",
    category: "saas-provider",
    archetype: "third-party-origin",
    emblem: "payroll",
    title: L(["Payday at Risk", "Lönedag i fara"]),
    summary: L([
      "The day before payday, the payroll provider reports a breach and stops every payroll run. Thousands of people expect to be paid tomorrow, and their personal data may be gone.",
      "Dagen före lönedagen rapporterar lönetjänstleverantören ett intrång och stoppar alla lönekörningar. Tusentals personer räknar med lön i morgon, och deras personuppgifter kan vara borta."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Keep a critical business process running when a SaaS provider fails", "Hålla en kritisk process igång när en SaaS-leverantör fallerar"]), teaser: L(["Keeping the everyday working", "Att hålla vardagen igång"]) },
      { id: "lo2", text: L(["Understand controller duties when the breach is at a processor", "Förstå den personuppgiftsansvariges skyldigheter när intrånget sker hos ett biträde"]), teaser: L(["Whose problem it is when it happens somewhere else", "Vems problem det är när det händer någon annanstans"]) },
      { id: "lo3", text: L(["Communicate with staff whose own data is affected", "Kommunicera med personal vars egna uppgifter berörs"]), teaser: L(["Talking to the people closest to you", "Att tala med dem som står er närmast"]) },
      { id: "lo4", text: L(["Spot fraud that exploits an incident", "Upptäcka bedrägerier som utnyttjar en incident"]), teaser: L(["Staying alert while everyone is busy", "Att vara vaksam när alla har fullt upp"]) }
    ],
    mitre: ["T1199", "T1078", "T1530", "T1566", "T1657"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.RA", "RS.CO", "RS.MA", "RC.RP", "RC.CO"],
      iso27001: ["A.5.19", "A.5.20", "A.5.21", "A.5.22", "A.5.24", "A.5.26", "A.5.30"]
    },
    constraints: { startWindow: "business-hours", startTime: "07:10" },
    actor: { types: ["criminal"], motivation: L(["Financial: personal data for fraud and extortion of the provider", "Ekonomisk: personuppgifter för bedrägerier och utpressning av leverantören"]), capability: "medium" },
    variables: {
      payrollTotal: { min: 2000000, max: 90000000, scaleBy: "size", step: 100000, currency: true },
      fakeChanges: { min: 3, max: 40, scaleBy: "size" },
      payslipMonths: { min: 12, max: 36 }
    },
    roles: ["incidentCommander", "cfo", "hr", "ciso", "supplierManager", "legal", "dpo", "comms", "itOps", "ceo"],

    flags: {
      manualPrep: L(["Manual payroll prepared early", "Manuell löneutbetalning förberedd tidigt"]),
      paidManual: L(["Salaries paid manually", "Löner utbetalda manuellt"]),
      payDelayed: L(["Salaries delayed", "Lönerna försenade"]),
      staffTold: L(["Staff told early", "Personalen informerad tidigt"]),
      changesFrozen: L(["Bank-detail changes frozen", "Ändringar av bankuppgifter frysta"]),
      notified: L(["You notified the DPA yourselves", "Ni anmälde själva till dataskyddsmyndigheten"]),
      waitedProvider: L(["Waited for the provider to notify", "Väntade på att leverantören skulle anmäla"]),
      terminated: L(["Contract terminated", "Avtalet uppsagt"])
    },

    start: "c1",
    pages: [
      pg("c1", ["The day before payday", "Dagen före lönedagen"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. Tomorrow is payday. An email arrives from {{supplier.vendor}}, the cloud service that runs your payroll: “security incident under investigation, all payroll runs suspended until further notice”.\n\nFinance normally sends this month's payroll file to the bank this afternoon. The provider promises its next update at 09:00. Nobody in the building yet knows what “incident” means for your staff.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. I morgon är det lönedag. Ett mejl kommer från {{supplier.vendor}}, molntjänsten som sköter era löner: ”säkerhetsincident under utredning, alla lönekörningar stoppade tills vidare”.\n\nEkonomi brukar skicka månadens lönefil till banken i eftermiddag. Leverantören lovar nästa uppdatering klockan nio. Ingen i huset vet ännu vad ”incident” betyder för er personal."
      ], {
        injects: [
          inj("b2-1", 0, "supplierNotice", "vendor", "high", "confirmed", [
            "We are investigating unauthorised access to parts of our platform. As a precaution all payroll runs are suspended. Next update 09:00.",
            "Vi utreder obehörig åtkomst till delar av vår plattform. Av försiktighetsskäl är alla lönekörningar stoppade. Nästa uppdatering 09.00."
          ], { headline: ["Service notice: payroll suspended", "Driftmeddelande: lönekörningar stoppade"], tests: ["lo1"] })
        ],
        discuss: [q("Who owns payroll when the system that runs it is gone?", "Vem äger lönen när systemet som kör den är borta?", ["cfo", "hr"])],
        facilitator: { notes: L(["Fast format: two minutes per choice. The real question is whether anyone starts on a fallback now.", "Snabbt format: två minuter per val. Den verkliga frågan är om någon börjar på en reservlösning redan nu."]) },
        choice: ask(["What do you do before the 09:00 update?", "Vad gör ni före uppdateringen klockan nio?"], ["Starts a payroll fallback in parallel instead of waiting for the provider.", "Startar en reservlösning för lönerna parallellt i stället för att vänta på leverantören."], [
          opt(["Convene finance, HR and security now", "Samla ekonomi, HR och säkerhet nu"], "c2", ["Gets the right people talking. Nobody yet owns the fallback.", "Får rätt personer att prata. Ingen äger ännu reservlösningen."]),
          opt(["Wait for the 09:00 update", "Vänta på uppdateringen klockan nio"], "c2", ["Two hours less to build a fallback if the update is bad.", "Två timmar mindre att bygga en reservlösning om beskedet är dåligt."]),
          opt(["Have finance prepare a manual payment file now", "Låt ekonomi förbereda en manuell betalfil nu"], "c2", ["Possibly wasted work. Possibly the only way people get paid.", "Kanske bortkastat arbete. Kanske det enda sättet att få ut lönerna."], { set: "manualPrep" })
        ])
      }),

      pg("c2", ["What do they have?", "Vad har de kommit åt?"], [
        "09:00. {{supplier.vendor}}'s update is short: the attacker reached “a limited set of customer data”, and they cannot yet say whose.\n\nYour payroll file is not limited. It holds names, personal identity numbers, home addresses, bank account numbers and salaries for {{org.headcount|number}} people. Until you know otherwise, any of it could be in someone else's hands.",
        "Klockan 09.00. {{supplier.vendor}}s uppdatering är kort: angriparen kom åt ”en begränsad mängd kunddata”, och de kan ännu inte säga vems.\n\nEr lönefil är inte begränsad. Den innehåller namn, personnummer, hemadresser, bankkontonummer och löner för {{org.headcount|number}} personer. Tills ni vet något annat kan vad som helst av det finnas hos någon annan."
      ], {
        discuss: [q("What exactly do you need the provider to confirm, in writing?", "Vad exakt behöver leverantören bekräfta skriftligt?", ["supplierManager", "dpo"])],
        choice: ask(["How do you establish what is exposed?", "Hur tar ni reda på vad som är exponerat?"], ["Asks for a written scope from the processor and plans for the worst until it arrives.", "Begär en skriftlig avgränsning från biträdet och planerar för det värsta tills den kommer."], [
          opt(["Demand a written statement of your data in scope", "Kräv ett skriftligt besked om vilka av era uppgifter som berörs"], "l1", ["The right request. Providers in a crisis answer slowly.", "Rätt begäran. Leverantörer i kris svarar långsamt."]),
          opt(["Assume all employee data is exposed and plan for that", "Utgå från att alla personaluppgifter är exponerade och planera för det"], "l1", ["Safe planning basis. Might over-alarm staff if said too loudly.", "En säker grund för planeringen. Kan skrämma personalen i onödan om det sägs för högt."]),
          opt(["Rely on the provider's public FAQ", "Lita på leverantörens offentliga frågor och svar"], "c3b", ["Easy, and written for the provider's lawyers, not for you.", "Enkelt, och skrivet för leverantörens jurister, inte för er."])
        ])
      }),

      pg("l1", ["The contract", "Avtalet"], [
        "{{person.supplierManager.name}} digs out the data processing agreement signed four years ago. The provider must tell you about a breach within 24 hours, with details of the data involved.\n\nThere is also an audit right that nobody has ever used. Invoking it formally changes the tone of the relationship, on a day when you need the provider's help to pay people.",
        "{{person.supplierManager.name}} letar fram personuppgiftsbiträdesavtalet som skrevs under för fyra år sedan. Leverantören måste underrätta er om ett intrång inom 24 timmar, med uppgifter om vilken data som berörs.\n\nDär finns också en granskningsrätt som ingen någonsin har använt. Att åberopa den formellt ändrar tonen i relationen, en dag då ni behöver leverantörens hjälp för att kunna betala folk."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["How do you use the contract?", "Hur använder ni avtalet?"], ["Invokes contractual rights early and in writing, without wrecking the working relationship.", "Åberopar avtalets rättigheter tidigt och skriftligt, utan att förstöra samarbetet."], [
          opt(["Invoke the breach and audit clauses formally", "Åberopa klausulerna om incidenter och granskning formellt"], "c3", ["Creates a paper trail and pressure. The provider becomes guarded.", "Skapar ett skriftligt spår och tryck. Leverantören blir mer försiktig."]),
          opt(["Keep it friendly for now", "Håll det vänligt tills vidare"], "c3", ["Preserves goodwill. Leaves you without leverage when you need it.", "Bevarar välviljan. Lämnar er utan påtryckningsmedel när ni behöver dem."])
        ])
      }),

      pg("c3", ["Pay or wait", "Betala eller vänta"], [
        "Midday. The provider confirms it will not run any payroll today, and probably not tomorrow either. Salaries totalling {{num.payrollTotal|currency}} are due in people's accounts tomorrow morning.\n\nThe bank needs a payment file by 15:00 to make it. Some staff live from one salary to the next, and rent is due at the end of the week.",
        "Mitt på dagen. Leverantören bekräftar att den inte kör några löner i dag, och troligen inte i morgon heller. Löner på sammanlagt {{num.payrollTotal|currency}} ska finnas på folks konton i morgon bitti.\n\nBanken behöver en betalfil före klockan tre för att det ska hinna gå. En del anställda lever från lön till lön, och hyran ska betalas i slutet av veckan."
      ], {
        variants: [vr("manualPrep", [
          "Midday. The provider confirms it will not run any payroll today, and probably not tomorrow either. Salaries totalling {{num.payrollTotal|currency}} are due tomorrow morning.\n\nBecause finance started early, a manual payment file based on last month's salaries is ready to check. It will be wrong for anyone with overtime, sick leave or a new job this month, but it would get money into accounts.",
          "Mitt på dagen. Leverantören bekräftar att den inte kör några löner i dag, och troligen inte i morgon heller. Löner på sammanlagt {{num.payrollTotal|currency}} ska betalas ut i morgon bitti.\n\nEftersom ekonomi började tidigt finns en manuell betalfil baserad på förra månadens löner redo att granskas. Den blir fel för alla med övertid, sjukfrånvaro eller ny tjänst den här månaden, men den skulle få in pengar på kontona."
        ], ["Because a manual file was started early, paying on time is still possible.", "Eftersom en manuell fil påbörjades tidigt går det fortfarande att betala i tid."])],
        discuss: [q("What goes wrong if you pay everyone last month's amount?", "Vad blir fel om ni betalar alla förra månadens belopp?", ["cfo", "hr"])],
        choice: ask(["Do people get paid tomorrow?", "Får folk lön i morgon?"], ["Pays on time from a controlled fallback and corrects differences next month.", "Betalar i tid från en kontrollerad reservlösning och rättar skillnader nästa månad."], [
          opt(["Pay last month's amounts manually through the bank", "Betala förra månadens belopp manuellt via banken"], "c4", ["People are paid. Overtime and leavers will be wrong until corrected.", "Folk får betalt. Övertid och avslutade anställningar blir fel tills de rättas."], { set: "paidManual" }),
          opt(["Delay salaries and tell staff why", "Skjut upp lönerna och berätta varför"], "c4", ["Honest, and painful for everyone living month to month.", "Ärligt, och smärtsamt för alla som lever från månad till månad."], { set: "payDelayed" }),
          opt(["Ask the provider to run it from their backup system", "Be leverantören köra lönerna från sitt reservsystem"], "c4", ["Trusts a platform under investigation with your payments.", "Litar på en plattform under utredning med era utbetalningar."])
        ])
      }),

      pg("c3b", ["The FAQ", "Frågor och svar"], [
        "The provider's public FAQ says there is “no evidence of misuse” and advises customers to “remain calm”. It says nothing about which data was taken.\n\nOn your intranet, a thread has already started: staff are asking whether their bank details are safe and whether they will be paid tomorrow. Managers are forwarding the questions to HR.",
        "Leverantörens offentliga frågor och svar säger att det ”inte finns några tecken på missbruk” och råder kunderna att ”behålla lugnet”. Där står ingenting om vilken data som togs.\n\nPå ert intranät har en tråd redan startat: personalen frågar om deras bankuppgifter är säkra och om de får lön i morgon. Chefer vidarebefordrar frågorna till HR."
      ], {
        choice: ask(["What do you tell staff?", "Vad säger ni till personalen?"], ["Says what is known and not known instead of repeating a provider's reassurance.", "Säger vad som är känt och inte känt i stället för att upprepa leverantörens lugnande besked."], [
          opt(["What you know, what you don't, and what to watch for", "Vad ni vet, vad ni inte vet och vad de ska vara uppmärksamma på"], "c4", ["Builds trust even without answers.", "Bygger förtroende även utan svar."], { set: "staffTold" }),
          opt(["Repeat the provider's line", "Upprepa leverantörens formulering"], "c4", ["Ties your credibility to theirs.", "Knyter er trovärdighet till deras."])
        ])
      }),

      pg("c4", ["Staff are asking", "Personalen frågar"], [
        "The news has spread through the company. The union representative writes to {{person.hr.name}}: members want to know whether they should change bank accounts, and whether they will be paid on time.\n\nThey want an answer they can pass on today. Silence from HR is already being read as bad news.",
        "Nyheten har spridit sig i företaget. Den fackliga representanten skriver till {{person.hr.name}}: medlemmarna vill veta om de ska byta bankkonto och om de får lön i tid.\n\nDe vill ha ett svar som de kan föra vidare i dag. Tystnad från HR tolkas redan som dåliga nyheter."
      ], {
        variants: [
          vr("staffTold", [
            "Because staff were told early and honestly, the union representative's questions are practical rather than angry: should members change bank accounts, and what should they watch out for?\n\nThey want an answer they can pass on today, and they offer to help spread it.",
            "Eftersom personalen informerades tidigt och ärligt är den fackliga representantens frågor praktiska snarare än arga: ska medlemmarna byta bankkonto, och vad ska de vara uppmärksamma på?\n\nDe vill ha ett svar som de kan föra vidare i dag, och de erbjuder sig att hjälpa till att sprida det."
          ]),
          vr("payDelayed", [
            "Payday came and went without salaries. The union representative is angry: nobody has explained when the money will come, and some members cannot pay their rent.\n\nThey want answers today, and they are talking about going to the press if they do not get them.",
            "Lönedagen kom och gick utan löner. Den fackliga representanten är arg: ingen har förklarat när pengarna kommer, och en del medlemmar kan inte betala hyran.\n\nDe vill ha svar i dag, och de pratar om att gå till pressen om de inte får det."
          ], ["Because salaries were delayed, this is now an employment issue too.", "Eftersom lönerna försenades är det nu också en arbetsrättslig fråga."])
        ],
        injects: [
          inj("b2-2", 240, "email", "employee", "medium", "confirmed", [
            "Members are worried. Is our data stolen? Should we change bank accounts? Will we be paid on time? We need an answer we can pass on today.",
            "Medlemmarna är oroliga. Är våra uppgifter stulna? Ska vi byta bankkonto? Får vi lön i tid? Vi behöver ett svar vi kan föra vidare i dag."
          ], { headline: ["From the union representative", "Från den fackliga representanten"], meta: { from: "union rep", subject: L(["Payroll incident: questions", "Löneincidenten: frågor"]) }, tests: ["lo3"] })
        ],
        choice: ask(["How do you answer staff?", "Hur svarar ni personalen?"], ["One clear message to everyone, today, with practical advice.", "Ett tydligt besked till alla, i dag, med praktiska råd."], [
          opt(["All-staff message today with fraud advice", "Meddelande till all personal i dag med råd om bedrägerier"], "l2", ["Consistent and fast. Commits you to updates.", "Enhetligt och snabbt. Förpliktar till uppdateringar."], { set: "staffTold" }),
          opt(["Wait until the facts are clear", "Vänta tills fakta är klara"], "l2", ["Rumours fill the gap.", "Rykten fyller tomrummet."]),
          opt(["Let managers brief their teams", "Låt cheferna informera sina grupper"], "l2", ["Personal, but every manager tells a different story.", "Personligt, men varje chef berättar en egen version."])
        ])
      }),

      pg("l2", ["Change my bank account", "Byt mitt bankkonto"], [
        "HR's inbox fills with something new: {{num.fakeChanges}} emails asking to change the bank account a salary is paid into.\n\nSome come from worried staff who want to move their money. Others only look like they do, sent from personal addresses nobody recognises. Telling them apart by email is almost impossible.",
        "HR:s inkorg fylls av något nytt: {{num.fakeChanges}} mejl med begäran om att byta det bankkonto som lönen betalas till.\n\nEn del kommer från oroliga anställda som vill flytta sina pengar. Andra ser bara ut att göra det, skickade från privata adresser som ingen känner igen. Att skilja dem åt via mejl är nästan omöjligt."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you do with bank-detail changes?", "Vad gör ni med ändringar av bankuppgifter?"], ["Freezes changes and verifies through a known channel.", "Fryser ändringar och verifierar via en känd kanal."], [
          opt(["Freeze all changes; verify each one by phone", "Frys alla ändringar; verifiera var och en per telefon"], "c5", ["Slower for genuine requests, closes the obvious fraud.", "Långsammare för äkta ärenden, stänger det uppenbara bedrägeriet."], { set: "changesFrozen" }),
          opt(["Process them as normal", "Hantera dem som vanligt"], "c5", ["Some salaries will go to criminals.", "En del löner kommer att gå till kriminella."])
        ])
      }),

      pg("c5", ["Payday phishing", "Nätfiske på lönedagen"], [
        "The fraudsters have noticed the news too. Emails with your logo are reaching staff: “confirm your details to receive this month's salary”, with a link to a portal that looks exactly like your HR system.\n\nSeveral people have already clicked. The site asks for bank ID login and account numbers.",
        "Bedragarna har också sett nyheterna. Mejl med er logotyp når personalen: ”bekräfta dina uppgifter för att få månadens lön”, med en länk till en portal som ser exakt ut som ert HR-system.\n\nFlera personer har redan klickat. Sajten ber om inloggning med bank-id och kontonummer."
      ], {
        variants: [
          vr("changesFrozen", [
            "The fraudsters have noticed the news too. Emails with your logo invite staff to “confirm your details” on a portal that looks exactly like your HR system.\n\nThe freeze is already paying off: two fake bank-account changes are stuck in it, waiting for a phone call that will never come. But the phishing site is still live, and people are clicking.",
            "Bedragarna har också sett nyheterna. Mejl med er logotyp uppmanar personalen att ”bekräfta sina uppgifter” på en portal som ser exakt ut som ert HR-system.\n\nFrysningen lönar sig redan: två falska bankkontoändringar har fastnat i den och väntar på ett telefonsamtal som aldrig kommer. Men nätfiskesajten är fortfarande uppe, och folk klickar."
          ], ["Because changes were frozen, the first fraud attempts failed.", "Eftersom ändringarna frystes misslyckades de första bedrägeriförsöken."]),
          vr("paidManual", [
            "The manual payment went out and most people were paid, though some amounts were wrong. Now the fraudsters are using that: emails with your logo offer a “salary correction” to anyone who confirms their details on a look-alike portal.\n\nIt is the most believable lie they could tell, because some corrections really are needed.",
            "Den manuella utbetalningen gick iväg och de flesta fick lön, även om en del belopp blev fel. Nu utnyttjar bedragarna det: mejl med er logotyp erbjuder en ”lönekorrigering” till den som bekräftar sina uppgifter på en efterliknad portal.\n\nDet är den mest trovärdiga lögn de kunde komma på, eftersom en del korrigeringar faktiskt behövs."
          ])
        ],
        injects: [
          inj("b2-3", 300, "phishingEmail", "attacker", "high", "confirmed", [
            "Due to a technical issue with this month's payroll, please confirm your bank details within 24 hours to receive your salary.",
            "På grund av ett tekniskt fel med månadens lön, bekräfta dina bankuppgifter inom 24 timmar för att få din lön."
          ], { headline: ["Action required: confirm your salary details", "Åtgärd krävs: bekräfta dina löneuppgifter"], meta: { from: "payroll@{{asset.lookalikeDomain}}", subject: L(["Confirm your salary details", "Bekräfta dina löneuppgifter"]) }, tests: ["lo4"] })
        ],
        choice: ask(["How do you respond to the phishing?", "Hur hanterar ni nätfisket?"], ["Warns staff fast through a channel that doesn't look like the phishing.", "Varnar personalen snabbt via en kanal som inte liknar nätfisket."], [
          opt(["Warn staff, block the domain, report the site", "Varna personalen, blockera domänen, anmäl sidan"], "l3", ["Standard and effective if it happens within the hour.", "Standard och effektivt om det sker inom en timme."]),
          opt(["Leave it to IT security as a routine case", "Lämna det till IT-säkerhet som ett rutinärende"], "l3", ["Routine speed is too slow on payday.", "Rutintempo är för långsamt på lönedagen."])
        ])
      }),

      pg("l3", ["Personal identity numbers", "Personnummer"], [
        "The provider's written statement finally arrives. Personal identity numbers and bank account numbers for all your employees were in the stolen data, together with home addresses.\n\nThat combination is what identity thieves need to open loans and accounts in someone else's name. Staff will ask what you are doing to protect them.",
        "Leverantörens skriftliga redogörelse kommer till slut. Personnummer och bankkontonummer för alla era anställda fanns i den stulna datan, tillsammans med hemadresser.\n\nDen kombinationen är precis vad identitetstjuvar behöver för att ta lån och öppna konton i någon annans namn. Personalen kommer att fråga vad ni gör för att skydda dem."
      ], {
        long: true,
        skipTo: "c6",
        chart: { id: "b2-scope", type: "kpi", title: L(["Confirmed in the stolen data", "Bekräftat i den stulna datan"]), data: kpi([
          { id: "k1", label: ["Employees", "Anställda"], value: (v, ctx) => ctx.org.headcount, tone: "danger" },
          { id: "k2", label: ["Months of payslips", "Månader av lönebesked"], value: (v) => v.payslipMonths, tone: "warn" }
        ]) },
        choice: ask(["What do you offer staff?", "Vad erbjuder ni personalen?"], ["Gives practical protection, not only information.", "Ger praktiskt skydd, inte bara information."], [
          opt(["Identity-protection support and a helpline", "Stöd för id-skydd och en stödlinje"], "c6", ["Costs money, shows care, reduces real harm.", "Kostar pengar, visar omtanke, minskar verklig skada."]),
          opt(["No extra measures beyond the message", "Inga åtgärder utöver meddelandet"], "c6", ["Cheaper today. Staff will remember.", "Billigare i dag. Personalen kommer att minnas det."])
        ])
      }),

      pg("c6", ["Whose 72 hours?", "Vems 72 timmar?"], [
        "{{person.dpo.name}} sets out the legal position. You are the controller of your employees' data; the provider is only your processor.\n\nThe duty to notify {{reg.dpaShort}} within 72 hours is therefore yours, whatever the provider does or says. The clock started when you learned of the breach this morning.",
        "{{person.dpo.name}} går igenom det rättsliga läget. Ni är personuppgiftsansvariga för de anställdas uppgifter; leverantören är bara ert biträde.\n\nSkyldigheten att anmäla till {{reg.dpaShort}} inom 72 timmar är därför er, oavsett vad leverantören gör eller säger. Klockan började gå när ni fick veta om intrånget i morse."
      ], {
        discuss: [q("What do you write in a notification when the facts come from someone else?", "Vad skriver ni i en anmälan när fakta kommer från någon annan?", ["dpo", "legal"])],
        choice: ask(["How do you handle notification?", "Hur hanterar ni anmälan?"], ["Notifies as controller within 72 hours, based on what the processor has confirmed.", "Anmäler som personuppgiftsansvarig inom 72 timmar, utifrån det biträdet har bekräftat."], [
          opt(["Notify {{reg.dpaShort}} yourselves now", "Anmäl till {{reg.dpaShort}} själva nu"], "c7", ["Meets your own duty. The provider may not like your wording.", "Uppfyller er egen skyldighet. Leverantören kanske inte gillar formuleringarna."], { set: "notified" }),
          opt(["Wait for the provider to notify for everyone", "Vänta på att leverantören anmäler för alla"], "c7", ["Their notification does not discharge yours.", "Deras anmälan befriar inte er från er skyldighet."], { set: "waitedProvider" }),
          opt(["Notify only once misuse is confirmed", "Anmäl först när missbruk bekräftats"], "c7b", ["Wrong test: the duty is about risk, not proof of misuse.", "Fel måttstock: skyldigheten handlar om risk, inte bevis på missbruk."]),
          opt(["Name and shame the provider on social media", "Hänga ut leverantören i sociala medier"], "x1", ["Feels good for an hour.", "Känns bra i en timme."])
        ])
      }),

      pg("c7b", ["The provider's lawyer", "Leverantörens jurist"], [
        "Before you notify, the provider's lawyer calls. They ask politely but firmly: please do not notify anyone before their own public statement tomorrow evening.\n\nThey say an early notice from a customer could “compromise the investigation”. Tomorrow evening is after your 72 hours run out.",
        "Innan ni anmäler ringer leverantörens jurist. Hen ber artigt men bestämt: anmäl inte till någon innan deras eget offentliga uttalande i morgon kväll.\n\nHen säger att en tidig anmälan från en kund kan ”äventyra utredningen”. I morgon kväll är efter att era 72 timmar har gått ut."
      ], {
        choice: ask(["Do you agree to wait?", "Går ni med på att vänta?"], ["Keeps its own legal duties regardless of a supplier's preferences.", "Håller fast vid sina egna rättsliga skyldigheter oavsett leverantörens önskemål."], [
          opt(["No. Notify within your own deadline", "Nej. Anmäl inom er egen tidsfrist"], "c7", ["Correct, and it strains the relationship.", "Rätt, och det sätter relationen på prov."], { set: "notified" }),
          opt(["Yes, wait for their statement", "Ja, vänta på deras uttalande"], "c7", ["Their timeline is now your compliance problem.", "Deras tidsplan är nu ert efterlevnadsproblem."], { set: "waitedProvider" })
        ])
      }),

      pg("c7", ["A second wave", "En andra våg"], [
        "Day three. The provider's investigators have found more: the attacker also downloaded {{num.payslipMonths}} months of payslips.\n\nPayslips show far more than salary. They reveal sick pay, parental leave, wage garnishments and union fees, which is sensitive data about health, family and union membership.",
        "Dag tre. Leverantörens utredare har hittat mer: angriparen laddade också ned {{num.payslipMonths}} månader av lönebesked.\n\nLönebesked visar mycket mer än lön. De avslöjar sjuklön, föräldraledighet, löneutmätning och fackavgifter, alltså känsliga uppgifter om hälsa, familj och fackligt medlemskap."
      ], {
        variants: [
          vr("notified", [
            "Day three. Because you already notified, this is an update, not a first report. But the news is bad: the attacker also downloaded {{num.payslipMonths}} months of payslips.\n\nPayslips reveal sick pay, parental leave, wage garnishments and union fees, which is sensitive data about health, family and union membership.",
            "Dag tre. Eftersom ni redan har anmält är det här en komplettering, inte en första rapport. Men nyheten är dålig: angriparen laddade också ned {{num.payslipMonths}} månader av lönebesked.\n\nLönebesked avslöjar sjuklön, föräldraledighet, löneutmätning och fackavgifter, alltså känsliga uppgifter om hälsa, familj och fackligt medlemskap."
          ]),
          vr("waitedProvider", [
            "Day three. The provider still has not notified anyone, and your own deadline has passed while you waited. Now its investigators find that {{num.payslipMonths}} months of payslips were taken too.\n\nPayslips reveal sick pay, parental leave, wage garnishments and union fees: sensitive data about health, family and union membership.",
            "Dag tre. Leverantören har fortfarande inte anmält till någon, och er egen frist har gått ut medan ni väntade. Nu hittar dess utredare att även {{num.payslipMonths}} månader av lönebesked togs.\n\nLönebesked avslöjar sjuklön, föräldraledighet, löneutmätning och fackavgifter: känsliga uppgifter om hälsa, familj och fackligt medlemskap."
          ], ["Because you waited for the provider, you are now past your own 72 hours.", "Eftersom ni väntade på leverantören har ni nu passerat era egna 72 timmar."])
        ],
        choice: ask(["What do you do with the new facts?", "Vad gör ni med de nya uppgifterna?"], ["Updates staff and authorities the same day; sensitive data raises the stakes.", "Uppdaterar personal och myndigheter samma dag; känsliga uppgifter höjer insatsen."], [
          opt(["Update staff and the authority today", "Uppdatera personalen och myndigheten i dag"], "l4", ["Sick pay and union fees are sensitive data. Speed matters.", "Sjuklön och fackavgifter är känsliga uppgifter. Snabbhet spelar roll."]),
          opt(["Wait for the full forensic report", "Vänta på den fullständiga forensiska rapporten"], "l4", ["The report may take weeks.", "Rapporten kan ta veckor."]),
          opt(["Hand it to legal and say nothing yet", "Lämna det till juristen och säg inget ännu"], "l4", ["Legal advice is useful; silence is a decision too.", "Juridisk rådgivning är bra; tystnad är också ett beslut."])
        ])
      }),

      pg("l4", ["Stay or leave", "Stanna eller gå"], [
        "An extra board meeting. The directors ask {{person.cfo.name}} one question: should you leave {{supplier.vendor}}?\n\nMoving payroll to another provider normally takes six months of planning and testing. Staying means trusting a provider that lost your staff's data. Either answer will be quoted back to you later.",
        "Ett extra styrelsemöte. Ledamöterna ställer en fråga till {{person.cfo.name}}: ska ni lämna {{supplier.vendor}}?\n\nAtt flytta lönerna till en annan leverantör tar normalt sex månader av planering och tester. Att stanna innebär att lita på en leverantör som tappade bort personalens uppgifter. Båda svaren kommer att citeras för er senare."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you recommend?", "Vad rekommenderar ni?"], ["Separates the emotional answer from a planned, safe exit or remediation.", "Skiljer det känslomässiga svaret från en planerad, säker avveckling eller åtgärdsplan."], [
          opt(["Plan an exit, but stay until it is safe to move", "Planera för att lämna, men stanna tills det är säkert att flytta"], "c8", ["Sensible. Requires demanding evidence from the provider meanwhile.", "Förnuftigt. Kräver att ni begär underlag från leverantören under tiden."]),
          opt(["Terminate the contract now", "Säg upp avtalet nu"], "c8", ["Decisive. You have no other payroll system.", "Beslutsamt. Ni har inget annat lönesystem."], { set: "terminated" })
        ])
      }),

      pg("c8", ["The next payroll run", "Nästa lönekörning"], [
        "Two weeks on, the provider says its platform has been rebuilt and cleaned. It wants to run next month's payroll as normal, on schedule.\n\nYour security team has only the provider's word for it: there is no independent report yet. The payroll run is in two weeks, and nobody wants a second missed payday.",
        "Två veckor senare säger leverantören att plattformen är ombyggd och rensad. Den vill köra nästa månads löner som vanligt, enligt schemat.\n\nErt säkerhetsteam har bara leverantörens ord på det: det finns ännu ingen oberoende rapport. Lönekörningen är om två veckor, och ingen vill missa en lönedag till."
      ], {
        variants: [vr("terminated", [
          "You have terminated the contract, and the provider has started handing back your data.\n\nThe next payroll run is in two weeks, and there is no system to run it in. A new provider needs months. Finance has a spreadsheet and a lot of goodwill, but no tested way to calculate tax and deductions for {{org.headcount|number}} people.",
          "Ni har sagt upp avtalet och leverantören har börjat lämna tillbaka er data.\n\nNästa lönekörning är om två veckor, och det finns inget system att köra den i. En ny leverantör behöver månader. Ekonomi har ett kalkylark och mycket god vilja, men inget testat sätt att räkna ut skatt och avdrag för {{org.headcount|number}} personer."
        ], ["Because the contract was terminated, every option now involves manual work.", "Eftersom avtalet sades upp innebär varje alternativ nu manuellt arbete."])],
        choice: ask(["How do you run next month's payroll?", "Hur kör ni nästa månads löner?"], ["Demands evidence of remediation and adds its own controls before trusting the service again.", "Kräver bevis på åtgärder och lägger till egna kontroller innan tjänsten får förtroende igen."], [
          opt(["Use the provider, with your own checks on every output", "Använd leverantören, med egna kontroller av varje resultat"], "c9", ["Trust but verify. Extra work for finance.", "Lita men kontrollera. Extra arbete för ekonomi."]),
          opt(["Back to normal with the provider", "Tillbaka till det normala med leverantören"], "c9", ["Assumes the provider's word is enough.", "Förutsätter att leverantörens ord räcker."]),
          opt(["Manual payroll until the provider is independently cleared", "Manuell lönehantering tills leverantören granskats oberoende"], "c9", ["Safe and exhausting. Errors are likely.", "Säkert och utmattande. Fel är sannolika."])
        ])
      }),

      pg("c9", ["What changes", "Vad som ändras"], [
        "A month later. Everyone was paid in the end, some of them late and some with the wrong amount.\n\nThe management team meets to decide what to do differently. Payroll was not the only critical service you buy from the cloud; the same thing could happen to your ERP, your email or your customer system tomorrow.",
        "En månad senare. Alla fick lön till slut, en del sent och en del med fel belopp.\n\nLedningsgruppen träffas för att bestämma vad ni ska göra annorlunda. Lönerna var inte den enda kritiska tjänst ni köper från molnet; samma sak kan hända ert affärssystem, er e-post eller ert kundsystem i morgon."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Builds a tested fallback for critical processes, not only better questionnaires.", "Bygger en testad reservlösning för kritiska processer, inte bara bättre enkäter."], [
          opt(["A tested manual fallback and exit plan for each critical SaaS", "En testad manuell reservlösning och avvecklingsplan för varje kritisk SaaS-tjänst"], "c10", ["Addresses the failure you actually had.", "Tar itu med det som faktiskt brast."]),
          opt(["More security questions in procurement", "Fler säkerhetsfrågor vid upphandling"], "c10", ["Useful, and would not have paid anyone on time.", "Användbart, och hade inte fått ut några löner i tid."]),
          opt(["Rely on cyber insurance", "Förlita er på cyberförsäkringen"], "c10", ["Insurance pays later. Salaries are due tomorrow.", "Försäkringen betalar senare. Lönerna ska betalas i morgon."])
        ])
      }),

      pg("c10", ["The staff survey", "Medarbetarenkäten"], [
        "The annual staff survey comes back. Among the usual comments, one new free-text answer keeps returning in different words: “Can I trust the company with my data?”\n\nHR wants to answer it in the next all-staff meeting. How you answer will show whether anything has really changed.",
        "Den årliga medarbetarenkäten kommer tillbaka. Bland de vanliga kommentarerna återkommer ett nytt fritextsvar med olika ord: ”Kan jag lita på företaget med mina uppgifter?”\n\nHR vill svara på det på nästa personalmöte. Hur ni svarar kommer att visa om något verkligen har förändrats."
      ], {
        choice: ask(["How do you answer that question?", "Hur besvarar ni den frågan?"], ["Answers with concrete changes and owners, not reassurance.", "Svarar med konkreta förändringar och ansvariga, inte med lugnande ord."], [
          opt(["Publish what changed and who owns it", "Publicera vad som ändrats och vem som äger det"], "r-end", ["Specific and checkable.", "Konkret och möjligt att följa upp."]),
          opt(["A message from the CEO about values", "Ett meddelande från vd om värderingar"], "r-end", ["Warm words without evidence.", "Varma ord utan belägg."])
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["notified", "staffTold", "paidManual"], "e1"],
          ["notified", "e2"],
          ["paidManual", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["A month later", "En månad senare"], ["Payday went almost unnoticed. Your own fallback paid everyone on time, staff heard about the breach from you before they read it anywhere else, and the authority had your notification within 72 hours.\n\nWhen the provider's breach reaches the news, your company is mentioned only as a customer that handled it well.", "Lönedagen gick nästan obemärkt förbi. Er egen reservlösning betalade alla i tid, personalen fick höra om intrånget från er innan de läste om det någon annanstans och myndigheten hade er anmälan inom 72 timmar.\n\nNär leverantörens intrång når nyheterna nämns ert företag bara som en kund som hanterade det väl."], {
        ending: end(1, ["Paid, told and notified", "Betalt, informerat och anmält"], [
          "Everyone was paid on time from your own fallback, staff heard it from you first, and the authority got your notification within 72 hours. The provider's breach stayed the provider's crisis.",
          "Alla fick lön i tid från er egen reservlösning, personalen hörde det från er först och myndigheten fick er anmälan inom 72 timmar. Leverantörens intrång förblev leverantörens kris."
        ])
      }),
      pg("e2", ["A month later", "En månad senare"], ["The authority received your notification in time, and the paperwork is in order. But people noticed what went wrong for them: late salaries, or information that came after the rumours.\n\nIn the corridors, HR is “the department that didn't tell us”. Rebuilding that trust will take far longer than the breach did.", "Myndigheten fick er anmälan i tid och pappersarbetet är i ordning. Men folk märkte det som gick fel för dem: sena löner, eller information som kom efter ryktena.\n\nI korridorerna är HR ”avdelningen som inte berättade”. Att bygga upp det förtroendet igen tar mycket längre tid än intrånget gjorde."], {
        ending: end(2, ["Compliant, but people noticed", "Regelrätt, men folk märkte det"], [
          "The notification was on time, but late salaries or late information left staff angry. Trust in HR takes a year to rebuild.",
          "Anmälan kom i tid, men försenade löner eller sen information gjorde personalen arg. Förtroendet för HR tar ett år att bygga upp igen."
        ])
      }),
      pg("e3", ["Two months later", "Två månader senare"], ["Salaries went out, but you waited for the provider to act and missed your own notification deadline.\n\nThe authority's letter is blunt: as the controller, the breach was your responsibility from the first morning, and waiting for a processor is no excuse. The criticism is published on the authority's website.", "Lönerna betalades ut, men ni väntade på att leverantören skulle agera och missade er egen tidsfrist för anmälan.\n\nMyndighetens brev är rakt: som personuppgiftsansvariga var intrånget ert ansvar från första morgonen, och att vänta på ett biträde är ingen ursäkt. Kritiken publiceras på myndighetens webbplats."], {
        ending: end(3, ["Paid, but out of time", "Betalt, men för sent anmält"], [
          "Salaries went out, but you waited for the provider and missed your own deadline. The authority criticises you for treating the breach as someone else's problem.",
          "Lönerna betalades ut, men ni väntade på leverantören och missade er egen tidsfrist. Myndigheten kritiserar er för att ha behandlat intrånget som någon annans problem."
        ])
      }),
      pg("e4", ["Two months later", "Två månader senare"], ["Salaries were late, the notification later still, and the fraudsters reached your staff before you did. Several employees lost money to fake portals.\n\nThe union has filed a formal complaint, the authority has opened a case, and the story of the company that left its staff unpaid and uninformed is still circulating.", "Lönerna blev sena, anmälan ännu senare och bedragarna nådde personalen före er. Flera anställda förlorade pengar på falska portaler.\n\nFacket har lämnat in ett formellt klagomål, myndigheten har öppnat ett ärende och historien om företaget som lämnade sin personal utan lön och utan information cirkulerar fortfarande."], {
        ending: end(4, ["Unpaid and uninformed", "Utan lön och utan besked"], [
          "Salaries were late, notification later still, and fraudsters reached staff before you did. The union files a complaint and the authority opens a case.",
          "Lönerna blev sena, anmälan ännu senare och bedragarna nådde personalen före er. Facket lämnar in ett klagomål och myndigheten öppnar ett ärende."
        ])
      }),

      // Break-away: public blame.
      pg("x1", ["Public blame", "Offentlig skuld"], [
        "Your post naming {{supplier.vendor}} is shared widely and picked up by a trade site.\n\nWithin an hour the provider replies publicly: its investigation shows that the access to your data used valid credentials issued to your own company. Suddenly the question in the comments is not what the provider did, but what you did.",
        "Ert inlägg som pekar ut {{supplier.vendor}} sprids snabbt och plockas upp av en branschsajt.\n\nInom en timme svarar leverantören offentligt: dess utredning visar att åtkomsten till er data skedde med giltiga inloggningsuppgifter utfärdade till ert eget företag. Plötsligt handlar frågan i kommentarerna inte om vad leverantören gjorde, utan om vad ni gjorde."
      ], {
        injects: [
          inj("b2-4", 420, "socialPost", "socialMedia", "high", "disputed", [
            "{{supplier.vendor}}: “Our investigation shows the access to this customer's data used valid credentials issued to the customer. We are cooperating fully.”",
            "{{supplier.vendor}}: ”Vår utredning visar att åtkomsten till den här kundens data skedde med giltiga inloggningsuppgifter som kunden själv fått. Vi samarbetar fullt ut.”"
          ], { facilitatorNote: ["Disputed: it may be true for one account, and it changes the story completely.", "Omstritt: det kan stämma för ett konto, och det förändrar berättelsen helt."], tests: ["lo2"] })
        ],
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Stops the public argument and checks the claim internally.", "Avbryter den offentliga diskussionen och kontrollerar påståendet internt."], [
          opt(["Stand by the post", "Stå fast vid inlägget"], "x2", ["Now it is a public dispute you may lose.", "Nu är det en offentlig tvist ni kan förlora."]),
          opt(["Take it down and check the claim", "Ta bort inlägget och kontrollera påståendet"], "x2", ["Late but wise.", "Sent men klokt."])
        ])
      }),
      pg("x2", ["Fraudsters move in", "Bedragarna hakar på"], [
        "The public dispute has made your staff an easy target. Fake “compensation” sites appear overnight, promising payouts to affected employees of {{org.name}}.\n\nTo claim, visitors must log in with their bank ID. By morning, several employees have done so, and one reports money missing from their account.",
        "Det offentliga bråket har gjort er personal till ett lätt mål. Falska ”ersättningssidor” dyker upp under natten och lovar utbetalningar till drabbade anställda på {{org.name}}.\n\nFör att få ersättning måste besökarna logga in med bank-id. På morgonen har flera anställda gjort det, och en rapporterar att pengar saknas på kontot."
      ], {
        choice: ask(["What do you do?", "Vad gör ni?"], ["Warns staff directly and reports the sites.", "Varnar personalen direkt och anmäler sidorna."], [
          opt(["Warn staff and the public", "Varna personalen och allmänheten"], "x3", ["Necessary, and it keeps the story alive.", "Nödvändigt, och det håller liv i historien."]),
          opt(["Warn staff only", "Varna bara personalen"], "x3", ["Narrower, quieter.", "Smalare, tystare."])
        ])
      }),
      pg("x3", ["Unpaid", "Utan lön"], [
        "Salaries are still unpaid while you and the provider argue in public, and the dispute is now in the national news.\n\nThe union calls a meeting for all staff tomorrow morning and asks management to attend and explain. People want to know when they will be paid, not who is to blame.",
        "Lönerna är fortfarande obetalda medan ni och leverantören grälar offentligt, och tvisten finns nu i riksnyheterna.\n\nFacket kallar till ett möte för all personal i morgon bitti och ber ledningen att komma och förklara. Folk vill veta när de får lön, inte vem som bär skulden."
      ], {
        choice: ask(["What do you offer staff?", "Vad erbjuder ni personalen?"], ["Puts people's livelihoods first with an immediate advance.", "Sätter människors försörjning först med ett omedelbart förskott."], [
          opt(["Emergency salary advances today", "Akuta löneförskott i dag"], "x4", ["Expensive and right.", "Dyrt och rätt."]),
          opt(["Ask for patience", "Be om tålamod"], "x4", ["Patience ran out a week ago.", "Tålamodet tog slut för en vecka sedan."])
        ])
      }),
      pg("x4", ["The letter", "Brevet"], [
        "A registered letter from {{supplier.vendor}}'s lawyers: retract your public statements within five working days, or face a claim for damages to their reputation.\n\nYour own lawyers say the provider's claim about your credentials may well be true. The fight has become more expensive than the breach.",
        "Ett rekommenderat brev från {{supplier.vendor}}s jurister: ta tillbaka era offentliga uttalanden inom fem arbetsdagar, annars väntar ett skadeståndskrav för skadat anseende.\n\nEra egna jurister säger att leverantörens påstående om era inloggningsuppgifter mycket väl kan stämma. Bråket har blivit dyrare än intrånget."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Takes legal advice before saying anything else in public.", "Tar juridisk rådgivning innan något mer sägs offentligt."], [
          opt(["Retract and settle quietly", "Ta tillbaka och förlik er i tysthet"], "e5", ["Ends the dispute, not the damage.", "Avslutar tvisten, inte skadan."]),
          opt(["Fight it", "Ta striden"], "e5", ["Months of legal costs during a crisis.", "Månader av rättegångskostnader mitt i en kris."])
        ])
      }),
      pg("e5", ["Three months later", "Tre månader senare"], ["The public fight with your own provider became the story and buried everything that mattered. Staff went unpaid for days, fraudsters emptied accounts, and nobody remembered to notify the authority.\n\nThe provider's claim for damages is still in court, and so is the authority's case against you.", "Det offentliga bråket med er egen leverantör blev historien och begravde allt som var viktigt. Personalen blev utan lön i flera dagar, bedragare tömde konton och ingen kom ihåg att anmäla till myndigheten.\n\nLeverantörens skadeståndskrav ligger fortfarande i domstol, och det gör även myndighetens ärende mot er."], {
        ending: end(5, ["The fight became the story", "Bråket blev nyheten"], [
          "A public fight with your own provider buried the real issues: staff went unpaid, fraudsters had a field day and the notification was forgotten.",
          "Ett offentligt bråk med er egen leverantör begravde de verkliga frågorna: personalen blev utan lön, bedragarna fick fritt spelrum och anmälan glömdes bort."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["A SaaS outage on a critical day needs your own fallback, prepared before it is needed.", "Ett avbrott i en SaaS-tjänst en kritisk dag kräver en egen reservlösning, förberedd innan den behövs."]),
        L(["The controller's duty to notify does not move to the processor.", "Den personuppgiftsansvariges skyldighet att anmäla flyttar inte till biträdet."]),
        L(["Staff whose own data is affected need to hear it from you first.", "Personal vars egna uppgifter berörs behöver höra det från er först."]),
        L(["Fraudsters exploit incidents within hours: freeze changes to payment details.", "Bedragare utnyttjar incidenter inom några timmar: frys ändringar av betalningsuppgifter."])
      ],
      strengthsToLookFor: [
        L(["Starting a manual payroll fallback before the provider's update", "Att börja på en manuell reservlösning före leverantörens uppdatering"]),
        L(["Notifying as controller within 72 hours", "Att anmäla som personuppgiftsansvarig inom 72 timmar"]),
        L(["Freezing bank-detail changes", "Att frysa ändringar av bankuppgifter"])
      ],
      commonGaps: [
        L(["Waiting for the provider to solve it", "Att vänta på att leverantören ska lösa det"]),
        L(["Assuming the provider's notification covers you", "Att anta att leverantörens anmälan täcker er"]),
        L(["Arguing with the provider in public", "Att bråka med leverantören offentligt"])
      ],
      suggestedActions: [
        act(["Write and test a manual payroll fallback.", "Skriv och testa en manuell reservrutin för löner."], "cfo", "high"),
        act(["Map controller and processor duties for each critical SaaS provider.", "Kartlägg ansvaret som personuppgiftsansvarig och biträde för varje kritisk SaaS-leverantör."], "dpo", "high"),
        act(["Require phone verification of all bank-detail changes.", "Kräv telefonverifiering av alla ändringar av bankuppgifter."], "hr", "medium")
      ]
    }
  });
})();
