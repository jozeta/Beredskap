/*
 * b11-reply-all.js — "Sent to Everyone" (branching, misdirected data).
 *
 * An HR assistant's autocomplete sends the payroll file, with salaries,
 * personal ID numbers and sick leave, to every employee and one external
 * consultant. Spine: first move → what was in it → forwards → the corridor →
 * health data and the 72 hours → the partner's systems → staff questions →
 * the assistant → what changes. Break-away at § "The journalist": denying it.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b11-reply-all",
    version: 1,
    format: "branching",
    category: "misdirected-data",
    archetype: "human-legal-reputational",
    emblem: "reply-all",
    title: L(["Sent to Everyone", "Skickat till alla"]),
    summary: L([
      "One wrong address in the To field, and the whole company now has everyone's salary, personal ID number and sick leave. Nobody attacked you. Every choice decides how much this hurts.",
      "En felaktig adress i mottagarfältet, och hela företaget har nu allas lön, personnummer och sjukfrånvaro. Ingen har angripit er. Varje val avgör hur ont det här gör."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Contain misdirected data quickly, inside and outside the company", "Snabbt begränsa felskickad data, inom och utanför företaget"]), teaser: L(["Getting words back", "Att ta tillbaka ord"]) },
      { id: "lo2", text: L(["Recognise health data and its notification duties", "Känna igen hälsouppgifter och deras anmälningsskyldighet"]), teaser: L(["What kind of information this is", "Vilken sorts information det här är"]) },
      { id: "lo3", text: L(["Look after the people whose data was exposed", "Ta hand om de personer vars data exponerades"]), teaser: L(["Colleagues on both sides", "Kollegor på båda sidor"]) },
      { id: "lo4", text: L(["Fix the system behind a human error", "Rätta systemet bakom ett mänskligt misstag"]), teaser: L(["Why it was so easy", "Varför det var så lätt"]) }
    ],
    mitre: ["T1114", "T1213"],
    frameworks: {
      nistCsf: ["PR.AT", "PR.DS", "RS.MA", "RS.CO", "RS.MI", "GV.PO"],
      iso27001: ["A.5.10", "A.5.12", "A.5.14", "A.5.24", "A.5.26", "A.5.34", "A.6.3", "A.8.12"]
    },
    constraints: { startWindow: "business-hours", startTime: "08:52" },
    actor: { types: ["insider"], motivation: L(["None: a hurried mistake with email autocomplete", "Ingen: ett stressat misstag med e-postens automatiska ifyllning"]), capability: "low" },
    variables: {
      staff: { min: 120, max: 2400, scaleBy: "size", step: 10 },
      forwards: { min: 6, max: 40 },
      sick: { min: 20, max: 400, scaleBy: "size" }
    },
    roles: ["incidentCommander", "hr", "dpo", "legal", "itOps", "ciso", "comms", "ceo", "cfo"],

    flags: {
      purged: L(["Mail purged centrally", "E-post rensad centralt"]),
      askedDelete: L(["Asked staff to delete it", "Bad personalen radera det"]),
      dpoEarly: L(["DPO involved in the first hour", "Dataskyddsombudet inkopplat första timmen"]),
      externalContacted: L(["External recipient contacted quickly", "Extern mottagare kontaktad snabbt"]),
      externalDeleted: L(["Deletion confirmed by the partner", "Radering bekräftad av partnern"]),
      staffInformed: L(["Staff informed honestly", "Personalen informerad ärligt"]),
      blamed: L(["The assistant was blamed publicly", "Assistenten pekades ut offentligt"]),
      supportive: L(["The assistant was supported", "Assistenten fick stöd"]),
      notified: L(["Notified the regulator in time", "Anmält till tillsynsmyndigheten i tid"]),
      notifyLate: L(["Notification delayed", "Anmälan försenad"]),
      denied: L(["Decided not to notify", "Beslutat att inte anmäla"])
    },

    start: "c1",
    pages: [
      pg("c1", ["Sent", "Skickat"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. An HR assistant meant to send next month's payroll file to the payroll provider. The email client suggested a different address after three letters, and they pressed Enter.\n\nThe file went to the all-staff list, {{num.staff|number}} people, and to one outside address. The assistant realises within a minute and calls {{person.hr.name}}, close to tears.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. En HR-assistent skulle skicka nästa månads lönefil till löneleverantören. E-postprogrammet föreslog en annan adress efter tre bokstäver, och hen tryckte på Enter.\n\nFilen gick till listan för all personal, {{num.staff|number}} personer, och till en extern adress. Assistenten inser det inom en minut och ringer {{person.hr.name}}, nära gråten."
      ], {
        injects: [
          inj("b11-1", 0, "phoneTranscript", "employee", "high", "confirmed", [
            "The HR assistant: “I sent the payroll file to everyone. All of it. And to someone outside, I think a consultant. I'm so sorry. What do I do?”",
            "HR-assistenten: ”Jag skickade lönefilen till alla. Hela. Och till någon utanför, jag tror en konsult. Förlåt, förlåt. Vad ska jag göra?”"
          ], { tests: ["lo1"] })
        ],
        discuss: [q("Who can actually pull an email back out of {{num.staff|number}} inboxes?", "Vem kan faktiskt plocka tillbaka ett mejl ur {{num.staff|number}} inkorgar?", ["itOps"]), q("What is the first thing you say to the assistant?", "Vad är det första ni säger till assistenten?", ["hr"])],
        facilitator: { notes: L(["Move fast. Every minute more people open the attachment.", "Håll tempot. Varje minut öppnar fler personer bilagan."]) },
        choice: ask(["What do you do first?", "Vad gör ni först?"], ["Uses central tools to remove the email before more people open it, and brings in the DPO early.", "Använder centrala verktyg för att ta bort mejlet innan fler öppnar det, och tar in dataskyddsombudet tidigt."], [
          opt(["Have IT purge the email from every mailbox now", "Låt IT rensa bort mejlet ur varje brevlåda nu"], "c2", ["The fastest real fix. It cannot reach the outside address or anyone who already saved the file.", "Den snabbaste verkliga åtgärden. Den når inte den externa adressen eller den som redan sparat filen."], { set: "purged" }),
          opt(["Email everyone asking them to delete it unopened", "Mejla alla och be dem radera det oöppnat"], "c2", ["Polite, and it makes curious people open it.", "Artigt, och det får nyfikna att öppna det."], { set: "askedDelete" }),
          opt(["Call the DPO and legal before doing anything", "Ring dataskyddsombudet och juristen innan ni gör något"], "c2", ["Good advice arrives, but the email stays in inboxes while you talk.", "Goda råd kommer, men mejlet ligger kvar i inkorgarna medan ni pratar."], { set: "dpoEarly" })
        ])
      }),

      pg("c2", ["What was in it", "Vad som fanns i den"], [
        "{{person.hr.name}} opens the file. It is not only salaries. Every row has a personal ID number, a bank account, the employee's tax table and a column of sick-leave days for the last twelve months.\n\n{{num.sick}} people have long sick-leave periods noted. Some have notes in the comments field. Everyone in the company can now see who has been ill, and for how long.",
        "{{person.hr.name}} öppnar filen. Det är inte bara löner. Varje rad har personnummer, bankkonto, skattetabell och en kolumn med sjukdagar för de senaste tolv månaderna.\n\n{{num.sick}} personer har långa sjukperioder noterade. En del har anteckningar i kommentarsfältet. Alla i företaget kan nu se vem som har varit sjuk, och hur länge."
      ], {
        variants: [vr("purged", [
          "IT has started the purge; it will take about twenty minutes to reach every mailbox. Meanwhile {{person.hr.name}} opens the file. Every row has a personal ID number, a bank account, the tax table and twelve months of sick-leave days.\n\n{{num.sick}} people have long sick-leave periods noted, some with comments. Anyone who opened the file in the first minutes has seen who has been ill.",
          "IT har påbörjat rensningen; den tar omkring tjugo minuter att nå varje brevlåda. Under tiden öppnar {{person.hr.name}} filen. Varje rad har personnummer, bankkonto, skattetabell och tolv månaders sjukdagar.\n\n{{num.sick}} personer har långa sjukperioder noterade, en del med kommentarer. Den som öppnade filen de första minuterna har sett vem som har varit sjuk."
        ], ["Because IT started the purge at once, the file disappears from inboxes within the half hour.", "Eftersom IT påbörjade rensningen direkt försvinner filen ur inkorgarna inom en halvtimme."])],
        injects: [
          inj("b11-2", 10, "logExcerpt", "itOps", "medium", "confirmed", [
            "Message trace: 1 message, {{num.staff|number}} internal recipients + 1 external (partner domain). Attachment opened at least 312 times in 9 minutes.",
            "Meddelandespårning: 1 meddelande, {{num.staff|number}} interna mottagare + 1 extern (partnerdomän). Bilagan öppnad minst 312 gånger på 9 minuter."
          ], { tests: ["lo1"] })
        ],
        discuss: [q("Which column in this file worries you most, and why?", "Vilken kolumn i filen oroar er mest, och varför?", ["dpo", "hr"])],
        choice: ask(["Where do you put your effort now?", "Var lägger ni kraften nu?"], ["Moves on the outside copy, which internal tools cannot reach.", "Agerar på den externa kopian, som interna verktyg inte når."], [
          opt(["Find the external recipient and call them", "Ta reda på vem den externa mottagaren är och ring hen"], "l1", ["The copy you cannot purge is the one that matters most.", "Kopian ni inte kan rensa är den som betyder mest."], { set: "externalContacted" }),
          opt(["Track who opened and forwarded it internally", "Spåra vem som öppnade och vidarebefordrade det internt"], "l1", ["Useful scoping. The external copy waits.", "Nyttig kartläggning. Den externa kopian får vänta."]),
          opt(["Find out exactly how the assistant made the mistake", "Ta reda på exakt hur assistenten gjorde misstaget"], "c3b", ["You will learn something, but it is not the most urgent question.", "Ni kommer att lära er något, men det är inte den mest brådskande frågan."])
        ])
      }),

      pg("l1", ["The outside address", "Den externa adressen"], [
        "The external address belongs to a consultant at a partner firm that helps with recruitment. Their name sits right below the payroll provider's in the address book.\n\nThe consultant answers on the second ring, sounds embarrassed, and says they saw the file arrive but did not open it. Their company's systems, they add, copy every incoming email into a shared case archive automatically.",
        "Den externa adressen tillhör en konsult på ett partnerföretag som hjälper till med rekrytering. Hens namn står direkt under löneleverantörens i adressboken.\n\nKonsulten svarar på andra signalen, låter generad och säger att hen såg filen komma men inte öppnade den. Deras system, tillägger hen, kopierar automatiskt varje inkommande mejl till ett gemensamt ärendearkiv."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you ask of the partner?", "Vad begär ni av partnern?"], ["Asks for deletion everywhere, including archives, with written confirmation.", "Begär radering överallt, även i arkiv, med skriftlig bekräftelse."], [
          opt(["Written confirmation of deletion, including the archive", "Skriftlig bekräftelse på radering, även i arkivet"], "c3", ["Slower, and the only kind of answer you can rely on later.", "Långsammare, och den enda sortens svar ni kan lita på senare."], { set: "externalDeleted" }),
          opt(["Take the consultant's word that it was not opened", "Lita på konsultens ord att det inte öppnades"], "c3", ["Kind, and it leaves the archive copy untouched.", "Vänligt, och det lämnar kopian i arkivet orörd."])
        ])
      }),

      pg("c3", ["Already forwarded", "Redan vidarebefordrat"], [
        "The message trace comes back with a list nobody likes. {{num.forwards}} people forwarded the email in the first quarter of an hour, three of them to private addresses, one to a colleague's spouse.\n\nIn the staff group chat, someone has posted a screenshot of a single line: a manager's salary. It already has a row of reactions under it.",
        "Meddelandespårningen ger en lista som ingen tycker om. {{num.forwards}} personer vidarebefordrade mejlet under den första kvarten, tre av dem till privata adresser, en till en kollegas make.\n\nI personalens gruppchatt har någon lagt upp en skärmbild av en enda rad: en chefs lön. Den har redan en rad reaktioner under sig."
      ], {
        injects: [
          inj("b11-3", 25, "chat", "employee", "medium", "confirmed", [
            "Screenshot in the staff group chat: one row of the payroll file, a department manager's monthly salary, with the comment “interesting…”.",
            "Skärmbild i personalens gruppchatt: en rad ur lönefilen, en avdelningschefs månadslön, med kommentaren ”intressant…”."
          ], { tests: ["lo3"] })
        ],
        choice: ask(["How do you deal with the copies that left the mail system?", "Hur hanterar ni kopiorna som lämnat e-postsystemet?"], ["Contacts those who forwarded it individually and asks for deletion, without threats.", "Kontaktar dem som vidarebefordrade det en och en och ber om radering, utan hot."], [
          opt(["Contact each person who forwarded it and ask them to delete it", "Kontakta varje person som vidarebefordrade det och be dem radera det"], "c4", ["Personal, calm and effective for most of them.", "Personligt, lugnt och effektivt för de flesta."]),
          opt(["Send a warning that sharing it is a disciplinary matter", "Skicka en varning om att spridning är en disciplinär fråga"], "c4", ["Stops some sharing, and makes everyone feel suspected.", "Stoppar en del spridning, och får alla att känna sig misstänkta."]),
          opt(["Have the group chat admin remove the screenshot and leave the rest", "Låt gruppchattens administratör ta bort skärmbilden och lämna resten"], "c4", ["Fixes the visible part and leaves the private copies.", "Rättar det synliga och lämnar de privata kopiorna."])
        ])
      }),

      pg("c3b", ["The assistant", "Assistenten"], [
        "{{person.hr.name}} sits down with the assistant, who has been with the company for two years and is shaking. The mistake is simple: two contacts with similar names, and an email client that offers the most recent one first.\n\nTheir manager has already sent {{person.hr.name}} a message: “This is a sackable offence.” The assistant has seen it.",
        "{{person.hr.name}} sätter sig med assistenten, som har varit på företaget i två år och skakar. Misstaget är enkelt: två kontakter med liknande namn, och ett e-postprogram som först föreslår den som användes senast.\n\nHens chef har redan skickat ett meddelande till {{person.hr.name}}: ”Det här är skäl för uppsägning.” Assistenten har sett det."
      ], {
        choice: ask(["How do you treat the assistant?", "Hur bemöter ni assistenten?"], ["Supports the person and keeps the focus on the data and the system that made the error easy.", "Stöttar personen och håller fokus på datan och systemet som gjorde misstaget lätt."], [
          opt(["Support them, and say clearly that the system made this easy", "Stötta hen, och säg tydligt att systemet gjorde det här lätt"], "c4", ["Keeps a colleague and keeps the lessons honest.", "Behåller en kollega och håller lärdomarna ärliga."], { set: "supportive" }),
          opt(["Start a formal disciplinary process now", "Inled en formell disciplinär process nu"], "c4", ["Satisfies the manager. Everyone else learns to hide mistakes.", "Tillfredsställer chefen. Alla andra lär sig att dölja misstag."], { set: "blamed" })
        ])
      }),

      pg("c4", ["The corridor", "Korridoren"], [
        "By ten o'clock, the whole building is talking. People compare salaries in the kitchen, and two employees on long sick leave have called HR in distress after colleagues sent them sympathetic messages.\n\nThe union representative wants a meeting today. Managers are asking what they should say to their teams, and nobody has told them anything yet.",
        "Vid tio pratar hela byggnaden. Folk jämför löner i köket, och två anställda som är långtidssjukskrivna har ringt HR upprörda efter att kollegor skickat medkännande meddelanden till dem.\n\nFackets ombud vill ha ett möte i dag. Cheferna frågar vad de ska säga till sina team, och ingen har ännu sagt något till dem."
      ], {
        variants: [vr("blamed", [
          "By ten o'clock, the whole building is talking, and the news that the assistant faces disciplinary action has spread faster than the file. People compare salaries in the kitchen, and two employees on long sick leave have called HR in distress.\n\nThe union representative wants a meeting today, about the data and about the assistant. Managers are asking what to say.",
          "Vid tio pratar hela byggnaden, och nyheten om att assistenten står inför disciplinära åtgärder har spridits snabbare än filen. Folk jämför löner i köket, och två långtidssjukskrivna har ringt HR upprörda.\n\nFackets ombud vill ha ett möte i dag, om datan och om assistenten. Cheferna frågar vad de ska säga."
        ], ["Because the assistant was blamed, the union now has two issues.", "Eftersom assistenten pekades ut har facket nu två frågor."])],
        discuss: [q("What do the people on sick leave need from you today?", "Vad behöver de sjukskrivna från er i dag?", ["hr"])],
        choice: ask(["What do you tell staff?", "Vad säger ni till personalen?"], ["Tells everyone the truth today, with an apology and a clear request, and contacts the most affected individually.", "Berättar sanningen för alla i dag, med en ursäkt och en tydlig begäran, och kontaktar de mest berörda personligen."], [
          opt(["An honest message to all staff today, and personal calls to those with sick leave noted", "Ett ärligt meddelande till all personal i dag, och personliga samtal till dem med sjukfrånvaro noterad"], "l2", ["Hard to write, and it lowers the temperature.", "Svårt att skriva, och det sänker temperaturen."], { set: "staffInformed" }),
          opt(["A short note asking people to delete the file", "En kort notis som ber folk radera filen"], "l2", ["Quick, and it says nothing to the people who were hurt.", "Snabbt, och det säger ingenting till dem som skadades."]),
          opt(["Say nothing more until the investigation is done", "Säg inget mer förrän utredningen är klar"], "l2", ["The corridor fills the silence.", "Korridoren fyller tystnaden."])
        ])
      }),

      pg("l2", ["The union", "Facket"], [
        "The union representative is calm and precise. Members want to know who could see their data, whether it has left the company, and what will be done to stop it happening again.\n\nThey also want an assurance that nobody will be punished for a mistake the system made easy, and a written answer by tomorrow. The meeting ends politely, and with a deadline.",
        "Fackets ombud är lugn och exakt. Medlemmarna vill veta vem som kunde se deras uppgifter, om de har lämnat företaget och vad som görs för att det inte ska hända igen.\n\nDe vill också ha en försäkran om att ingen straffas för ett misstag som systemet gjorde lätt, och ett skriftligt svar senast i morgon. Mötet slutar artigt, och med en tidsfrist."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["How do you answer the union?", "Hur svarar ni facket?"], ["Answers in writing with facts, open questions and a commitment on the system, not on individuals.", "Svarar skriftligt med fakta, öppna frågor och ett åtagande om systemet, inte om individer."], [
          opt(["A written answer tomorrow with what you know and do not know", "Ett skriftligt svar i morgon med vad ni vet och inte vet"], "c5", ["Builds trust and costs an evening.", "Bygger förtroende och kostar en kväll."]),
          opt(["A verbal update at next month's meeting", "En muntlig uppdatering på nästa månads möte"], "c5", ["Easier now, harder later.", "Enklare nu, svårare sedan."])
        ])
      }),

      pg("c5", ["Health data", "Hälsouppgifter"], [
        "{{person.dpo.name}} is clear about one column. Sick-leave days are health data, a special category with stricter rules. A personal data breach involving health data is very likely notifiable to {{reg.dpaShort}} within 72 hours of becoming aware.\n\nSome in the room argue that the data never left the company, apart from one address. Others point out the private forwards.",
        "{{person.dpo.name}} är tydlig om en kolumn. Sjukdagar är hälsouppgifter, en särskild kategori med strängare regler. En personuppgiftsincident som rör hälsouppgifter är mycket sannolikt anmälningspliktig till {{reg.dpaShort}} inom 72 timmar från kännedom.\n\nEn del i rummet menar att datan aldrig lämnade företaget, bortsett från en adress. Andra påpekar de privata vidarebefordringarna."
      ], {
        variants: [vr("dpoEarly", [
          "{{person.dpo.name}} has been involved since the first hour and has already drafted a notification. Sick-leave days are health data, and the breach is very likely notifiable to {{reg.dpaShort}} within 72 hours.\n\nThe draft lists what is known, what is still being checked, and the steps already taken. It needs a decision, not more research.",
          "{{person.dpo.name}} har varit inkopplad sedan första timmen och har redan skrivit ett utkast till anmälan. Sjukdagar är hälsouppgifter, och incidenten är mycket sannolikt anmälningspliktig till {{reg.dpaShort}} inom 72 timmar.\n\nUtkastet listar vad som är känt, vad som fortfarande kontrolleras och de åtgärder som redan vidtagits. Det behöver ett beslut, inte mer utredning."
        ], ["Because the DPO was involved early, a draft is ready.", "Eftersom dataskyddsombudet kopplades in tidigt finns ett utkast klart."])],
        chart: { id: "b11-kpi", type: "kpi", title: L(["The file", "Filen"]), data: kpi([
          { id: "k1", label: ["Employees in the file", "Anställda i filen"], value: (v) => v.staff, tone: "warn" },
          { id: "k2", label: ["With sick leave noted", "Med sjukfrånvaro noterad"], value: (v) => v.sick, tone: "danger" },
          { id: "k3", label: ["Forwards found", "Hittade vidarebefordringar"], value: (v) => v.forwards, tone: "danger" }
        ]) },
        choice: ask(["Do you notify the regulator?", "Anmäler ni till tillsynsmyndigheten?"], ["Notifies in time with what is known; health data and external copies make it clear.", "Anmäler i tid med det som är känt; hälsouppgifter och externa kopior gör saken tydlig."], [
          opt(["Notify within 72 hours and supplement later", "Anmäl inom 72 timmar och komplettera senare"], "l3", ["Meets the duty. The regulator will ask what you are changing.", "Uppfyller skyldigheten. Myndigheten kommer att fråga vad ni ändrar."], { set: "notified" }),
          opt(["Wait to see whether it spreads further", "Vänta och se om det sprids vidare"], "l3", ["Likely to miss the deadline.", "Missar troligen tidsfristen."], { set: "notifyLate" }),
          opt(["Decide it was internal and not notifiable", "Bedöm att det var internt och inte anmälningspliktigt"], "l3", ["Hard to defend with private forwards and an external copy.", "Svårt att försvara med privata vidarebefordringar och en extern kopia."], { set: "denied" })
        ])
      }),

      pg("l3", ["The screenshot travels", "Skärmbilden sprids"], [
        "The salary screenshot has left the group chat. Someone posted it in a public forum about workplace pay, with the company name and the manager's job title.\n\nThe manager is upset and asks HR to “find out who did this”. The post has a few hundred views so far, but forums like this are read by journalists looking for stories.",
        "Skärmbilden på lönen har lämnat gruppchatten. Någon har lagt upp den i ett offentligt forum om löner på arbetsplatser, med företagsnamnet och chefens titel.\n\nChefen är upprörd och ber HR ”ta reda på vem som gjorde det här”. Inlägget har hittills några hundra visningar, men sådana forum läses av journalister som letar efter nyheter."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["How do you handle the public post?", "Hur hanterar ni det offentliga inlägget?"], ["Asks the forum to remove it and supports the manager without starting a hunt.", "Ber forumet ta bort det och stöttar chefen utan att starta en jakt."], [
          opt(["Ask the forum to remove it and support the manager", "Be forumet ta bort det och stötta chefen"], "c6", ["Removes the most visible copy without escalating.", "Tar bort den mest synliga kopian utan att trappa upp."]),
          opt(["Investigate which employee posted it", "Utred vilken anställd som publicerade det"], "c6", ["Satisfies the manager and sours the building further.", "Tillfredsställer chefen och försämrar stämningen ytterligare."])
        ])
      }),

      pg("c6", ["The journalist", "Journalisten"], [
        "{{time.T+1440|weekday|cap}}. A business journalist calls the press office. They have seen the forum post and heard from an employee that “the whole payroll file” was sent to everyone.\n\nThey ask three questions: did it happen, did it include sick leave, and has anyone outside the company received it? They publish this afternoon.",
        "{{time.T+1440|weekday|cap}}. En ekonomijournalist ringer pressavdelningen. Hen har sett foruminlägget och hört från en anställd att ”hela lönefilen” skickades till alla.\n\nHen ställer tre frågor: hände det, innehöll den sjukfrånvaro, och har någon utanför företaget fått den? Hen publicerar i eftermiddag."
      ], {
        injects: [
          inj("b11-4", 1440, "mediaEnquiry", "media", "high", "confirmed", [
            "“An employee tells us your entire payroll file, including sick leave, was emailed to all staff. Can you confirm, and did it go outside the company? We publish at 15:00.”",
            "”En anställd berättar att hela er lönefil, inklusive sjukfrånvaro, mejlades till all personal. Kan ni bekräfta, och gick den utanför företaget? Vi publicerar klockan 15.”"
          ], { headline: ["Business desk enquiry", "Fråga från ekonomiredaktionen"], tests: ["lo3"] })
        ],
        choice: ask(["What do you tell the journalist?", "Vad säger ni till journalisten?"], ["Confirms the facts briefly and describes what has been done, without details about individuals.", "Bekräftar fakta kortfattat och beskriver vad som gjorts, utan detaljer om enskilda."], [
          opt(["Confirm briefly and describe what you have done", "Bekräfta kortfattat och beskriv vad ni har gjort"], "c7", ["A small story, accurately told.", "En liten nyhet, korrekt berättad."]),
          opt(["Confirm, apologise and offer a short interview", "Bekräfta, be om ursäkt och erbjud en kort intervju"], "c7", ["Open and human. Prepare the spokesperson well.", "Öppet och mänskligt. Förbered talespersonen väl."]),
          opt(["Deny that any sensitive data was involved", "Förneka att några känsliga uppgifter berördes"], "x1", ["The journalist has a source inside the building.", "Journalisten har en källa inne i byggnaden."])
        ])
      }),

      pg("c7", ["The partner's archive", "Partnerns arkiv"], [
        "The partner firm's IT manager calls back. The email was automatically copied into their case archive, which is backed up nightly. Deleting it from the archive is simple; deleting it from last night's backup is not.\n\nThey offer to delete it from the live archive today and to let the backup copy expire in thirty days, unless you ask for more.",
        "Partnerföretagets IT-chef ringer tillbaka. Mejlet kopierades automatiskt till deras ärendearkiv, som säkerhetskopieras varje natt. Att radera det ur arkivet är enkelt; att radera det ur nattens säkerhetskopia är det inte.\n\nDe erbjuder sig att radera det ur det aktiva arkivet i dag och låta kopian i säkerhetskopian gå ut om trettio dagar, om ni inte begär mer."
      ], {
        variants: [vr("externalDeleted", [
          "The partner firm's IT manager calls back with the written confirmation you asked for. The email had been copied into their case archive and last night's backup; both have been deleted, and the confirmation lists exactly where it was found.\n\nThey ask, politely, whether you could stop sending them payroll files.",
          "Partnerföretagets IT-chef ringer tillbaka med den skriftliga bekräftelse ni bad om. Mejlet hade kopierats till deras ärendearkiv och nattens säkerhetskopia; båda har raderats, och bekräftelsen listar exakt var det fanns.\n\nDe frågar, artigt, om ni kanske kunde sluta skicka lönefiler till dem."
        ], ["Because you asked for written confirmation, the external copy is gone.", "Eftersom ni bad om skriftlig bekräftelse är den externa kopian borta."])],
        choice: ask(["What do you accept from the partner?", "Vad godtar ni från partnern?"], ["Asks for deletion including backups, with confirmation, under the data protection rules.", "Begär radering även i säkerhetskopior, med bekräftelse, enligt dataskyddsreglerna."], [
          opt(["Ask for deletion from the backup too, with written confirmation", "Begär radering även ur säkerhetskopian, med skriftlig bekräftelse"], "l4", ["Some effort for them. A clean answer for you.", "Lite besvär för dem. Ett rent besked för er."], { set: "externalDeleted" }),
          opt(["Accept the thirty-day expiry", "Godta att kopian går ut efter trettio dagar"], "l4", ["Reasonable, and your notification must then say so.", "Rimligt, och då måste er anmälan säga det."])
        ])
      }),

      pg("l4", ["Why it was so easy", "Varför det var så lätt"], [
        "{{person.itOps.name}} reconstructs the mistake. The email client suggests recent contacts first, the all-staff list has a short name, and nothing warns when an attachment with personal ID numbers goes to more than a handful of people.\n\nThe payroll provider has offered a secure upload portal for two years. Nobody used it, because email was quicker.",
        "{{person.itOps.name}} återskapar misstaget. E-postprogrammet föreslår de senaste kontakterna först, listan för all personal har ett kort namn och ingenting varnar när en bilaga med personnummer skickas till fler än ett fåtal personer.\n\nLöneleverantören har erbjudit en säker uppladdningsportal i två år. Ingen använde den, eftersom e-post gick snabbare."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you fix first?", "Vad rättar ni först?"], ["Removes email from the payroll process and adds a warning for sensitive attachments.", "Tar bort e-post ur löneprocessen och lägger till en varning för känsliga bilagor."], [
          opt(["Move payroll to the secure portal and block personal ID numbers in mass email", "Flytta lönehanteringen till den säkra portalen och blockera personnummer i massutskick"], "c8", ["Fixes the path, not the person.", "Rättar vägen, inte personen."]),
          opt(["Restrict who can send to the all-staff list", "Begränsa vem som får skicka till listan för all personal"], "c8", ["Helpful, and the external address remains a risk.", "Hjälpsamt, och den externa adressen förblir en risk."])
        ])
      }),

      pg("c8", ["Who saw mine?", "Vem såg mitt?"], [
        "HR's inbox fills with the same question in a hundred forms. Who opened my row? Did my manager see my sick leave? Can I find out who forwarded it?\n\nThe message trace can show who opened the email, not who read which row. Some employees ask whether they can file a complaint with the regulator themselves. They can.",
        "HR:s inkorg fylls av samma fråga i hundra former. Vem öppnade min rad? Såg min chef min sjukfrånvaro? Kan jag få veta vem som vidarebefordrade det?\n\nMeddelandespårningen kan visa vem som öppnade mejlet, inte vem som läste vilken rad. En del anställda frågar om de själva kan klaga hos tillsynsmyndigheten. Det kan de."
      ], {
        discuss: [q("What can you honestly tell someone who asks who saw their sick leave?", "Vad kan ni ärligt säga till någon som frågar vem som såg deras sjukfrånvaro?", ["dpo", "hr"])],
        choice: ask(["How do you answer individual employees?", "Hur svarar ni enskilda anställda?"], ["Answers each person honestly about what can and cannot be known, and offers support.", "Svarar varje person ärligt om vad som går och inte går att veta, och erbjuder stöd."], [
          opt(["Personal answers with what you know, and support where needed", "Personliga svar med det ni vet, och stöd där det behövs"], "c9", ["Time-consuming and respectful.", "Tidskrävande och respektfullt."]),
          opt(["A standard FAQ for everyone", "En standardiserad fråga-svar-sida för alla"], "c9", ["Efficient, and cold for those who were hurt most.", "Effektivt, och kallt för dem som skadades mest."])
        ])
      }),

      pg("c9", ["The assistant, a week later", "Assistenten, en vecka senare"], [
        "A week on, the assistant is back at their desk, quiet and careful. Their manager still wants a formal outcome, and the union is watching closely.\n\nEveryone in HR knows that any of them could have pressed Enter on the wrong suggestion. What the company decides now will tell staff whether it is safe to report the next mistake quickly.",
        "En vecka senare är assistenten tillbaka vid sitt skrivbord, tyst och försiktig. Chefen vill fortfarande ha ett formellt utfall, och facket följer det noga.\n\nAlla på HR vet att vem som helst av dem kunde ha tryckt Enter på fel förslag. Det företaget bestämmer nu kommer att visa personalen om det är tryggt att snabbt rapportera nästa misstag."
      ], {
        variants: [vr("blamed", [
          "A week on, the disciplinary process against the assistant is under way, and the union has filed a formal objection. The assistant is on sick leave.\n\nTwo other HR staff have quietly admitted to near-misses they never reported. The company must decide how this ends, and staff are watching what happens to someone who reported their own mistake within a minute.",
          "En vecka senare pågår den disciplinära processen mot assistenten, och facket har lämnat en formell invändning. Assistenten är sjukskriven.\n\nTvå andra på HR har i tysthet erkänt tillbud som de aldrig rapporterade. Företaget måste bestämma hur det här slutar, och personalen ser vad som händer med någon som rapporterade sitt eget misstag inom en minut."
        ], ["Because the assistant was blamed, colleagues stopped reporting near-misses.", "Eftersom assistenten pekades ut slutade kollegorna rapportera tillbud."])],
        choice: ask(["How does it end for the assistant?", "Hur slutar det för assistenten?"], ["Closes it without sanction, thanks them for reporting quickly, and fixes the process.", "Avslutar utan påföljd, tackar hen för den snabba rapporten och rättar processen."], [
          opt(["No sanction; thank them for reporting within a minute", "Ingen påföljd; tacka hen för att hen rapporterade inom en minut"], "c10", ["Tells everyone that reporting fast is safe.", "Visar alla att det är tryggt att rapportera snabbt."], { set: "supportive" }),
          opt(["A written warning", "En skriftlig varning"], "c10", ["Proportionate on paper, and it will be remembered.", "Proportionerligt på papperet, och det kommer att minnas."], { set: "blamed" })
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "Three weeks later. The file is mostly gone, the regulator's questions are answered or being answered, and the kitchen conversations have moved on to other things.\n\nThe crisis team meets one last time. There is budget for one real change this quarter, and everyone agrees that the next mistake is coming; the question is how small it will be.",
        "Tre veckor senare. Filen är i stort sett borta, myndighetens frågor är besvarade eller håller på att besvaras, och samtalen i köket har gått vidare till annat.\n\nKrisledningen träffas en sista gång. Det finns budget för en verklig förändring det här kvartalet, och alla är överens om att nästa misstag kommer; frågan är hur litet det blir."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Removes sensitive files from email workflows and adds automatic warnings.", "Tar bort känsliga filer ur e-postflöden och lägger till automatiska varningar."], [
          opt(["Secure transfer for payroll and warnings for sensitive attachments", "Säker överföring för lönehantering och varningar för känsliga bilagor"], "r-end", ["Makes the same mistake much harder.", "Gör samma misstag mycket svårare."]),
          opt(["Training on careful emailing", "Utbildning i att mejla försiktigt"], "r-end", ["Worth doing; it would not have stopped this.", "Värt att göra; det hade inte stoppat det här."]),
          opt(["Remove sick-leave data from the payroll file", "Ta bort sjukfrånvaron ur lönefilen"], "r-end", ["Reduces harm next time, and fixes nothing else.", "Minskar skadan nästa gång, och rättar inget annat."])
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["purged", "notified", "staffInformed"], "e1"],
          ["notified", "e2"],
          ["notifyLate", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["A month later", "En månad senare"], ["The regulator closed the case with a short letter noting the quick purge, the honest message to staff and the changes to the payroll process.\n\nThe union's follow-up meeting was brief. In the staff survey, more people than last year said they would report a mistake straight away.", "Tillsynsmyndigheten avslutade ärendet med ett kort brev som noterade den snabba rensningen, det ärliga beskedet till personalen och ändringarna i löneprocessen.\n\nFackets uppföljningsmöte blev kort. I personalenkäten sa fler än förra året att de skulle rapportera ett misstag direkt."], {
        ending: end(1, ["A bad morning, handled", "En dålig morgon, hanterad"], [
          "The email was purged within minutes, staff heard the truth the same day, and the regulator was notified in time. The case closes quickly.",
          "Mejlet rensades inom några minuter, personalen fick höra sanningen samma dag och tillsynsmyndigheten fick sin anmälan i tid. Ärendet avslutas snabbt."
        ])
      }),
      pg("e2", ["A month later", "En månad senare"], ["The notification reached the regulator in time, but its follow-up questions are pointed: why the file stayed in inboxes for so long, and why staff learned more from the corridor than from management.\n\nThe answers take weeks. Trust in HR is lower than it was.", "Anmälan nådde tillsynsmyndigheten i tid, men följdfrågorna är skarpa: varför filen låg kvar i inkorgarna så länge, och varför personalen fick veta mer i korridoren än från ledningen.\n\nSvaren tar veckor. Förtroendet för HR är lägre än det var."], {
        ending: end(2, ["Notified, but slow inside", "Anmält, men långsamt internt"], [
          "You notified in time, but the file lingered or staff were left to the corridor. The regulator and the union both want more.",
          "Ni anmälde i tid, men filen låg kvar eller personalen lämnades åt korridoren. Både tillsynsmyndigheten och facket vill ha mer."
        ])
      }),
      pg("e3", ["Two months later", "Två månader senare"], ["The notification arrived after 72 hours, after three employees had already complained to the regulator themselves.\n\nThe regulator's letter asks why the company waited, and whether it understood that sick-leave days are health data. The answer is in the timeline, and it is not flattering.", "Anmälan kom efter 72 timmar, efter att tre anställda redan hade klagat hos tillsynsmyndigheten själva.\n\nMyndighetens brev frågar varför företaget väntade, och om det förstod att sjukdagar är hälsouppgifter. Svaret finns i tidslinjen, och det är inte smickrande."], {
        ending: end(3, ["Employees got there first", "De anställda hann först"], [
          "The notification was late, and employees complained to the regulator before you notified. The investigation looks at why you waited.",
          "Anmälan kom sent, och anställda klagade hos tillsynsmyndigheten innan ni anmälde. Utredningen granskar varför ni väntade."
        ])
      }),
      pg("e4", ["Four months later", "Fyra månader senare"], ["You decided it was not notifiable. Months later, an employee on long sick leave complained to the regulator after a colleague mentioned their absence at a party.\n\nThe regulator has opened an investigation, and it is asking who decided that health data sent to a whole company and an outside firm was not a breach.", "Ni beslutade att det inte var anmälningspliktigt. Flera månader senare klagade en långtidssjukskriven anställd hos tillsynsmyndigheten efter att en kollega nämnt frånvaron på en fest.\n\nMyndigheten har inlett en utredning, och den frågar vem som beslutade att hälsouppgifter som skickats till ett helt företag och en extern firma inte var en incident."], {
        ending: end(4, ["The regulator asks why not", "Tillsynsmyndigheten frågar varför inte"], [
          "You never notified. A complaint months later starts an investigation into why health data sent to everyone was not treated as a breach.",
          "Ni anmälde aldrig. Ett klagomål månader senare startar en utredning om varför hälsouppgifter som skickats till alla inte behandlades som en incident."
        ])
      }),

      // Break-away: denying it to the press.
      pg("x1", ["The denial", "Förnekandet"], [
        "The article runs at three. It quotes your denial in the second paragraph, and in the fourth it quotes an employee who still has the file and confirms the sick-leave column.\n\nBy evening, the story has been picked up by two other outlets. The headline is no longer about a mistake; it is about a company that said something untrue.",
        "Artikeln publiceras klockan tre. Den citerar ert förnekande i andra stycket, och i fjärde stycket citerar den en anställd som fortfarande har filen och bekräftar kolumnen med sjukfrånvaro.\n\nPå kvällen har två andra medier plockat upp nyheten. Rubriken handlar inte längre om ett misstag; den handlar om ett företag som sa något osant."
      ], {
        choice: ask(["How do you respond to the article?", "Hur bemöter ni artikeln?"], ["Corrects the record immediately and apologises.", "Rättar uppgifterna omedelbart och ber om ursäkt."], [
          opt(["Correct the statement and apologise publicly", "Rätta uttalandet och be om ursäkt offentligt"], "x2", ["Necessary, and late.", "Nödvändigt, och sent."]),
          opt(["Stand by the statement on a technicality", "Stå fast vid uttalandet med en teknisk förklaring"], "x2", ["Makes the next article easier to write.", "Gör nästa artikel lättare att skriva."])
        ])
      }),
      pg("x2", ["Staff go to the regulator", "Personalen går till tillsynsmyndigheten"], [
        "The next morning, the regulator receives eleven complaints from employees, several of them on sick leave, each attaching the article and your denial.\n\nThe union announces that it has advised members to complain individually. {{person.dpo.name}} points out that a notification now will arrive after the complaints, and will be read alongside them.",
        "Nästa morgon tar tillsynsmyndigheten emot elva klagomål från anställda, flera av dem sjukskrivna, som alla bifogar artikeln och ert förnekande.\n\nFacket meddelar att det har rått medlemmarna att klaga var för sig. {{person.dpo.name}} påpekar att en anmälan nu kommer fram efter klagomålen, och kommer att läsas tillsammans med dem."
      ], {
        choice: ask(["What do you do now?", "Vad gör ni nu?"], ["Notifies at once with a full timeline and cooperates.", "Anmäler omedelbart med en fullständig tidslinje och samarbetar."], [
          opt(["Notify today with a full, honest timeline", "Anmäl i dag med en fullständig och ärlig tidslinje"], "x3", ["The only option left that helps.", "Det enda alternativ som återstår som hjälper."]),
          opt(["Wait for the regulator to contact you", "Vänta på att tillsynsmyndigheten kontaktar er"], "x3", ["They will, and they will ask about the delay.", "Det kommer de att göra, och de kommer att fråga om dröjsmålet."])
        ])
      }),
      pg("x3", ["The board", "Styrelsen"], [
        "The chair of the board calls the CEO. The board learned about the file from the newspaper, and about the denial from the second newspaper.\n\nThey want to know who approved the statement to the journalist, and why. They also want to know what the company will say to the regulator, which has asked for a meeting next week.",
        "Styrelseordföranden ringer vd. Styrelsen fick veta om filen från tidningen, och om förnekandet från den andra tidningen.\n\nDe vill veta vem som godkände uttalandet till journalisten, och varför. De vill också veta vad företaget ska säga till tillsynsmyndigheten, som har begärt ett möte nästa vecka."
      ], {
        choice: ask(["How do you face the board?", "Hur möter ni styrelsen?"], ["Gives the board the full timeline, including the denial and who approved it.", "Ger styrelsen hela tidslinjen, inklusive förnekandet och vem som godkände det."], [
          opt(["The full timeline, including who approved the denial", "Hela tidslinjen, inklusive vem som godkände förnekandet"], "x4", ["Painful and necessary.", "Smärtsamt och nödvändigt."]),
          opt(["A summary focused on the technical fix", "En sammanfattning som fokuserar på den tekniska åtgärden"], "x4", ["The board has read the newspapers.", "Styrelsen har läst tidningarna."])
        ])
      }),
      pg("x4", ["The meeting with the regulator", "Mötet med tillsynsmyndigheten"], [
        "The regulator's case officer is courteous and thorough. They have the complaints, the articles, your late notification and the original statement to the press.\n\nTheir questions are not about the email client. They are about the decision to deny, and about what the company did for the employees whose health data was shared.",
        "Myndighetens handläggare är artig och noggrann. Hen har klagomålen, artiklarna, er sena anmälan och det ursprungliga uttalandet till pressen.\n\nFrågorna handlar inte om e-postprogrammet. De handlar om beslutet att förneka, och om vad företaget gjorde för de anställda vars hälsouppgifter delades."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Answers fully and accepts responsibility for the denial.", "Svarar fullständigt och tar ansvar för förnekandet."], [
          opt(["Answer fully and accept responsibility", "Svara fullständigt och ta ansvar"], "e5", ["It does not undo the week, but it helps.", "Det gör inte veckan ogjord, men det hjälper."]),
          opt(["Let lawyers answer in writing", "Låt jurister svara skriftligt"], "e5", ["Reads as if there is more to hide.", "Uppfattas som att det finns mer att dölja."])
        ])
      }),
      pg("e5", ["Six months later", "Sex månader senare"], ["A wrong address in an email became a national news story, eleven complaints, a regulatory investigation and a board inquiry into a false statement.\n\nThe regulator's decision is expected next month. The assistant who reported the mistake within a minute has left the company.", "En felaktig adress i ett mejl blev en riksnyhet, elva klagomål, en utredning hos tillsynsmyndigheten och en granskning i styrelsen av ett osant uttalande.\n\nMyndighetens beslut väntas nästa månad. Assistenten som rapporterade misstaget inom en minut har lämnat företaget."], {
        ending: end(5, ["The denial became the story", "Förnekandet blev nyheten"], [
          "Denying the facts to a journalist with a source inside turned a mistake into a public scandal and a regulatory investigation.",
          "Att förneka fakta inför en journalist med en källa inifrån gjorde ett misstag till en offentlig skandal och en utredning hos tillsynsmyndigheten."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Misdirected data is contained centrally and fast; asking people to delete it is not containment.", "Felskickad data begränsas centralt och snabbt; att be folk radera den är ingen begränsning."]),
        L(["The copy outside your systems matters most: get deletion confirmed, archives and backups included.", "Kopian utanför era system betyder mest: få raderingen bekräftad, arkiv och säkerhetskopior inräknade."]),
        L(["Sick leave is health data; that usually settles the notification question.", "Sjukfrånvaro är hälsouppgifter; det avgör oftast frågan om anmälan."]),
        L(["Blaming the person who reported fast teaches everyone to report slowly.", "Att peka ut den som rapporterade snabbt lär alla att rapportera långsamt."])
      ],
      strengthsToLookFor: [
        L(["Purging the email centrally within minutes", "Att rensa mejlet centralt inom några minuter"]),
        L(["Calling the external recipient early", "Att tidigt ringa den externa mottagaren"]),
        L(["Supporting the assistant", "Att stötta assistenten"])
      ],
      commonGaps: [
        L(["Emailing everyone to ask them to delete it", "Att mejla alla och be dem radera det"]),
        L(["Treating it as internal and not notifiable", "Att behandla det som internt och inte anmälningspliktigt"]),
        L(["Forgetting the partner's archives and backups", "Att glömma partnerns arkiv och säkerhetskopior"])
      ],
      suggestedActions: [
        act(["Move payroll and HR files to secure transfer, never email.", "Flytta lön- och HR-filer till säker överföring, aldrig e-post."], "hr", "high"),
        act(["Block or warn on personal ID numbers in emails to large or external recipient lists.", "Blockera eller varna för personnummer i mejl till stora eller externa mottagarlistor."], "itOps", "high"),
        act(["Write a misdirected-email runbook starting with central purge.", "Skriv en rutin för felskickad e-post som börjar med central rensning."], "ciso", "medium"),
        act(["State in policy that quickly reported mistakes are not punished.", "Skriv in i riktlinjerna att misstag som rapporteras snabbt inte bestraffas."], "hr", "medium")
      ]
    }
  });
})();
