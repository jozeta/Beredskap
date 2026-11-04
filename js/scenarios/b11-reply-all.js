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
  const { L, q, inj, act, kpi, pg, ask, opt, pb, end, vr, rt } = BK.scenarios.h;

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
      deleteRequestRetracted: L(["“Delete unopened” request retracted", "Uppmaningen att radera oöppnat tillbakadragen"]),
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
          opt(["Have IT purge the email from every mailbox now", "Låt IT rensa bort mejlet ur varje brevlåda nu"], "c2", ["The fastest real fix. It cannot reach the outside address or anyone who already saved the file.", "Den snabbaste verkliga åtgärden. Den når inte den externa adressen eller den som redan sparat filen."], { set: "purged", pushback: [
              pb(["Phones already have it", "Telefonerna har den redan"], ["IT warns that the purge removes the message from mailboxes, not from phones that already downloaded the attachment for offline reading. Dozens of devices synced it in the first minutes. Do you also wipe mail on phones, staff's private ones included, or accept a gap you cannot see?", "IT varnar för att rensningen tar bort meddelandet ur brevlådorna, men inte från telefoner som redan har laddat ner bilagan. Dussintals enheter synkade den under de första minuterna. Rensar ni även e-posten i telefonerna, personalens privata inräknade, eller godtar ni en lucka ni inte kan se?"]),
              pb(["Who signed off?", "Vem godkände?"], ["The mail administrator hesitates: searching and deleting in every mailbox, managers' and union representatives' included, normally needs a documented approval. Nobody senior has signed anything. Do you order it on your own authority and write it down afterwards, or stop for a signature while the file stays in inboxes?", "E-postadministratören tvekar: att söka och radera i varje brevlåda, även chefers och fackliga ombuds, kräver normalt ett dokumenterat godkännande. Ingen i ledningen har skrivit under något. Beordrar ni det på eget mandat och dokumenterar efteråt, eller väntar ni på en underskrift medan filen ligger kvar?"]),
              pb(["“Where did my email go?”", "”Vart tog mitt mejl vägen?”"], ["Minutes into the purge, staff notice that an email they had already seen has vanished, and the rumours start: hacked, cover-up, someone fired. Nobody has told them anything. Do you explain the purge now, and admit what was in the file, or let it disappear quietly?", "Några minuter in i rensningen märker personalen att ett mejl de redan har sett har försvunnit, och ryktena börjar: hackad, mörkläggning, någon har fått sparken. Ingen har sagt något till dem. Förklarar ni rensningen nu, och erkänner vad som fanns i filen, eller låter ni den försvinna i tysthet?"])
            ]
          }),
          opt(["Email everyone asking them to delete it unopened", "Mejla alla och be dem radera det oöppnat"], "c2", ["Polite, and it makes curious people open it.", "Artigt, och det får nyfikna att öppna det."], { effects: { trust: -1 }, set: "askedDelete", pushback: [
              pb(["The open count climbs", "Antalet öppningar stiger"], ["Within five minutes of your request, the number of people who opened the attachment roughly doubles. Many say they opened it to check whether it concerned them. Do you send a second message, or switch to the central removal you could have started already?", "Inom fem minuter efter er uppmaning har antalet som öppnat bilagan ungefär fördubblats. Många säger att de öppnade den för att se om den gällde dem. Skickar ni ett andra meddelande, eller byter ni till den centrala rensning ni redan kunde ha startat?"]),
              pb(["Reply-all to your request", "Svara alla på er uppmaning"], ["Several people reply-all to your request asking what was in the file, and each reply lands in {{num.staff|number}} inboxes. The thread now draws even more attention to the original. Do you lock the list and leave the questions unanswered, or answer them in the open?", "Flera svarar alla på er uppmaning och frågar vad som fanns i filen, och varje svar hamnar i {{num.staff|number}} inkorgar. Tråden drar nu ännu mer uppmärksamhet till originalet. Låser ni listan och lämnar frågorna obesvarade, eller svarar ni öppet?"]),
              pb(["Deleted is not gone", "Raderat är inte borta"], ["IT points out that “delete” only moves the message to a deleted-items folder, where it stays for weeks, and you have no way to check who complied. Do you still call this containment, and what would you say if someone asked you to prove it?", "IT påpekar att ”radera” bara flyttar meddelandet till en mapp för borttagna objekt, där det ligger kvar i veckor, och att ni inte kan kontrollera vem som gjorde det. Kallar ni det fortfarande begränsning, och vad skulle ni svara om någon bad er bevisa det?"])
            ]
          }),
          opt(["Call the DPO and legal before doing anything", "Ring dataskyddsombudet och juristen innan ni gör något"], "c2", ["Good advice arrives, but the email stays in inboxes while you talk.", "Goda råd kommer, men mejlet ligger kvar i inkorgarna medan ni pratar."], { set: "dpoEarly", pushback: [
              pb(["Voicemail", "Röstbrevlåda"], ["The DPO is in a meeting and legal's line goes to voicemail. Ten minutes pass, and the attachment keeps being opened while you wait for a call back. Do you keep waiting for advice, or let IT act now without it?", "Dataskyddsombudet sitter i möte och juristens telefon går till röstbrevlådan. Tio minuter går, och bilagan fortsätter att öppnas medan ni väntar på att bli uppringda. Fortsätter ni vänta på råd, eller låter ni IT agera nu utan dem?"]),
              pb(["The assistant is alone", "Assistenten är ensam"], ["While you are on the phone, the assistant sits at their desk waiting for an instruction that does not come, and colleagues are already asking them about the email. Who is looking after them, and who tells them what to do right now?", "Medan ni sitter i telefon sitter assistenten vid sitt skrivbord och väntar på besked som inte kommer, och kollegor frågar redan hen om mejlet. Vem tar hand om hen, och vem säger åt hen vad hen ska göra just nu?"]),
              pb(["The advice is “act”", "Rådet är ”agera”"], ["When legal finally answers, their first question is why nothing has been removed yet: how fast you contained it will matter later. The minutes you spent asking will appear in any timeline. Do you start removing it now, and how will you explain the delay?", "När juristen till slut svarar är den första frågan varför ingenting har tagits bort än: hur snabbt ni begränsade det kommer att spela roll senare. Minuterna ni lade på att fråga kommer att synas i varje tidslinje. Börjar ni ta bort det nu, och hur förklarar ni dröjsmålet?"])
            ]
          })
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
          opt(["Find the external recipient and call them", "Ta reda på vem den externa mottagaren är och ring hen"], "l1", ["The copy you cannot purge is the one that matters most.", "Kopian ni inte kan rensa är den som betyder mest."], { set: "externalContacted", pushback: [
              pb(["Who makes the call?", "Vem ringer?"], ["Nobody in the room knows the external person, and the only one who has dealt with them is the assistant, who is in no state to call. A stranger phoning about a payroll file may sound like a scam. Who calls, and what exactly do they say?", "Ingen i rummet känner den externa personen, och den enda som har haft med hen att göra är assistenten, som inte är i skick att ringa. En okänd som ringer om en lönefil kan låta som ett bedrägeri. Vem ringer, och vad säger hen exakt?"]),
              pb(["Nobody minds the inside", "Ingen sköter insidan"], ["Managers are calling HR to ask what to tell their teams, and nobody answers, because everyone is busy with the external call. Inside, staff are still passing the file around. Who owns the inside while you chase one address?", "Chefer ringer HR och frågar vad de ska säga till sina team, och ingen svarar, eftersom alla är upptagna med det externa samtalet. Internt skickar personalen fortfarande runt filen. Vem äger insidan medan ni jagar en adress?"]),
              pb(["What are you asking for?", "Vad begär ni?"], ["Legal asks what you actually want from the recipient: delete it, confirm it, sign something? Calling without a clear request may get you a polite promise and nothing you can show anyone later. Do you call now and improvise, or spend ten minutes deciding what to demand?", "Juristen frågar vad ni egentligen vill ha av mottagaren: radering, en bekräftelse, en underskrift? Att ringa utan en tydlig begäran kan ge ett artigt löfte och inget ni kan visa upp senare. Ringer ni nu och improviserar, eller lägger ni tio minuter på att bestämma vad ni kräver?"])
            ]
          }),
          opt(["Track who opened and forwarded it internally", "Spåra vem som öppnade och vidarebefordrade det internt"], "l1", ["Useful scoping. The external copy waits.", "Nyttig kartläggning. Den externa kopian får vänta."], {
            pushback: [
              pb(["Security or surveillance?", "Säkerhet eller övervakning?"], ["The union representative hears that IT is pulling lists of who opened the email, and asks whether this is incident response or surveillance of staff. Most opened it simply because it arrived. What will you use the list for, and who gets to see it?", "Fackets ombud får höra att IT tar fram listor över vem som öppnade mejlet, och frågar om det är incidenthantering eller övervakning av personalen. De flesta öppnade det bara för att det kom. Vad ska listan användas till, och vem får se den?"]),
              pb(["The outside copy waits", "Den externa kopian väntar"], ["Every minute spent on the internal trace is a minute the external recipient holds the file without a word from you. Not knowing what it is, they may save it or pass it on. Is mapping the inside really worth more than one phone call outside?", "Varje minut som går åt till den interna spårningen är en minut då den externa mottagaren har filen utan ett ord från er. Utan att veta vad den är kan hen spara den eller skicka den vidare. Är kartläggningen internt verkligen värd mer än ett samtal utåt?"]),
              pb(["The trace has blind spots", "Spårningen har döda vinklar"], ["IT says the trace shows opens and forwards in company mail, but not downloads, screenshots or copies on phones. A tidy list may give you false comfort. How much will you rely on it when you decide what to tell staff?", "IT säger att spårningen visar öppningar och vidarebefordringar i företagets e-post, men inte nedladdningar, skärmbilder eller kopior i telefoner. En prydlig lista kan ge falsk trygghet. Hur mycket litar ni på den när ni bestämmer vad ni ska säga till personalen?"])
            ]
          }),
          opt(["Find out exactly how the assistant made the mistake", "Ta reda på exakt hur assistenten gjorde misstaget"], "c3b", ["You will learn something, but it is not the most urgent question.", "Ni kommer att lära er något, men det är inte den mest brådskande frågan."], {
            pushback: [
              pb(["It feels like an interrogation", "Det känns som ett förhör"], ["The assistant is asked to go through every click again, with two managers in the room. They are shaking and keep apologising. Is this learning, or the start of a blame process, and how would the assistant tell the difference?", "Assistenten får gå igenom varje klick igen, med två chefer i rummet. Hen skakar och ber om ursäkt gång på gång. Är det här lärande eller början på en skuldprocess, och hur skulle assistenten kunna se skillnaden?"]),
              pb(["Meanwhile, the copies", "Under tiden, kopiorna"], ["While the room reconstructs the mistake, nobody has contacted the external recipient, and staff are still opening the attachment. Knowing how it happened stops nothing that is happening now. What does it cost to answer the interesting question before the urgent one?", "Medan rummet rekonstruerar misstaget har ingen kontaktat den externa mottagaren, och personalen öppnar fortfarande bilagan. Att veta hur det gick till stoppar inget av det som händer nu. Vad kostar det att svara på den intressanta frågan före den brådskande?"]),
              pb(["The answer is “anyone”", "Svaret är ”vem som helst”"], ["It quickly becomes clear the mistake took three letters and one key. Anyone in HR could have made it, including people in this room. If that is the finding, what does knowing it change in the next hour?", "Det blir snabbt tydligt att misstaget krävde tre bokstäver och en tangent. Vem som helst på HR kunde ha gjort det, även folk i det här rummet. Om det är slutsatsen, vad ändrar den kunskapen under den närmaste timmen?"])
            ]
          })
        ])
      }),

      pg("l1", ["The outside address", "Den externa adressen"], [
        "The external address belongs to a consultant at a partner firm that helps with recruitment. Their name sits right below the payroll provider's in the address book.\n\nThe consultant answers on the second ring, sounds embarrassed, and says they saw the file arrive but did not open it. Their company's systems, they add, copy every incoming email into a shared case archive automatically.",
        "Den externa adressen tillhör en konsult på ett partnerföretag som hjälper till med rekrytering. Hens namn står direkt under löneleverantörens i adressboken.\n\nKonsulten svarar på andra signalen, låter generad och säger att hen såg filen komma men inte öppnade den. Deras system, tillägger hen, kopierar automatiskt varje inkommande mejl till ett gemensamt ärendearkiv."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you ask of the partner?", "Vad begär ni av partnern?"], ["Asks for deletion everywhere, including archives, with written confirmation.", "Begär radering överallt, även i arkiv, med skriftlig bekräftelse."], [
          opt(["Written confirmation of deletion, including the archive", "Skriftlig bekräftelse på radering, även i arkivet"], "c3", ["Slower, and the only kind of answer you can rely on later.", "Långsammare, och den enda sortens svar ni kan lita på senare."], { set: "externalDeleted", pushback: [
              pb(["“Are you accusing us?”", "”Anklagar ni oss?”"], ["The consultant's manager says your request reads like an accusation: they follow their own data protection routines and do not sign documents for other companies. Do you push, go to their leadership, or settle for a verbal promise?", "Konsultens chef säger att er begäran låter som en anklagelse: de följer sina egna dataskyddsrutiner och skriver inte under dokument åt andra företag. Trycker ni på, går ni till deras ledning, eller nöjer ni er med ett muntligt löfte?"]),
              pb(["It will take days", "Det tar flera dagar"], ["The partner says their archive is run by an outside IT supplier, and written confirmation will take days. Your regulator decision may come before then. What will you say about a copy you have asked to have deleted but cannot yet confirm is gone?", "Partnern säger att arkivet sköts av en extern IT-leverantör, och att en skriftlig bekräftelse tar flera dagar. Ert beslut om anmälan kan behöva fattas innan dess. Vad säger ni om en kopia ni har begärt raderad men ännu inte kan bekräfta är borta?"]),
              pb(["Others can search it", "Andra kan söka i det"], ["The archive is shared: colleagues at the partner firm can search it. The consultant did not open the file, but cannot say whether anyone else has. Does a deletion confirmation answer the question you actually need answered?", "Arkivet är gemensamt: kollegor på partnerföretaget kan söka i det. Konsulten öppnade inte filen, men kan inte säga om någon annan har gjort det. Svarar en bekräftelse på radering på den fråga ni egentligen behöver svar på?"])
            ]
          }),
          opt(["Take the consultant's word that it was not opened", "Lita på konsultens ord att det inte öppnades"], "c3", ["Kind, and it leaves the archive copy untouched.", "Vänligt, och det lämnar kopian i arkivet orörd."], {
            pushback: [
              pb(["You forgot the archive", "Ni glömde arkivet"], ["Ten minutes after the call, someone points out that the consultant also mentioned the automatic archive, and you hung up without asking about it. Who goes back to them, and how do you ask without sounding as if you didn't believe them?", "Tio minuter efter samtalet påpekar någon att konsulten också nämnde det automatiska arkivet, och att ni lade på utan att fråga om det. Vem ringer tillbaka, och hur frågar ni utan att det låter som att ni inte trodde på hen?"]),
              pb(["A word is not evidence", "Ett ord är inget bevis"], ["The DPO asks how you will describe the external copy if the regulator asks. “The consultant said they didn't open it” is all you have. Will that sentence hold up if someone asks for evidence?", "Dataskyddsombudet frågar hur ni ska beskriva den externa kopian om tillsynsmyndigheten frågar. ”Konsulten sa att hen inte öppnade den” är allt ni har. Håller den meningen om någon ber om bevis?"]),
              pb(["Not only their inbox", "Inte bara hens inkorg"], ["The consultant mentions in passing that a colleague handles their inbox while they travel. The file arrived in a mailbox more than one person reads. Is one person's word enough when they are not the only one with access?", "Konsulten nämner i förbigående att en kollega sköter hens inkorg när hen reser. Filen kom till en brevlåda som fler än en person läser. Räcker en persons ord när hen inte är den enda med åtkomst?"])
            ]
          })
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
          opt(["Contact each person who forwarded it and ask them to delete it", "Kontakta varje person som vidarebefordrade det och be dem radera det"], "c4", ["Personal, calm and effective for most of them.", "Personligt, lugnt och effektivt för de flesta."], {
            pushback: [
              pb(["The spouse is not staff", "Maken är inte anställd"], ["Three forwards went to private addresses, one to a colleague's spouse. You can ask politely, but you cannot check what anyone outside the company does. What do you ask a person who never worked for you to do, and how will you know they did it?", "Tre vidarebefordringar gick till privata adresser, en till en kollegas make. Ni kan be artigt, men ni kan inte kontrollera vad någon utanför företaget gör. Vad ber ni en person som aldrig har arbetat hos er att göra, och hur får ni veta att det blev gjort?"]),
              pb(["A morning of phone calls", "En förmiddag i telefon"], ["{{num.forwards}} conversations, each one delicate, and HR is already overloaded. At ten minutes each, this takes the rest of the morning. Who makes these calls, and what is left undone while they do?", "{{num.forwards}} samtal, vart och ett känsligt, och HR är redan överbelastat. Med tio minuter per samtal tar det resten av förmiddagen. Vem ringer, och vad blir ogjort under tiden?"]),
              pb(["“Why me?”", "”Varför jag?”"], ["The first person you call is defensive: they forward everything to their private mail to read later. They ask why they are singled out when hundreds opened the file. Does the gentle approach still work when people push back, and what do you answer?", "Den första ni ringer går i försvar: hen vidarebefordrar allt till sin privata e-post för att läsa senare. Hen frågar varför just hen pekas ut när hundratals öppnade filen. Fungerar det mjuka förhållningssättet när folk tar emot, och vad svarar ni?"])
            ]
          }),
          opt(["Send a warning that sharing it is a disciplinary matter", "Skicka en varning om att spridning är en disciplinär fråga"], "c4", ["Stops some sharing, and makes everyone feel suspected.", "Stoppar en del spridning, och får alla att känna sig misstänkta."], {
            pushback: [
              pb(["The union calls", "Facket ringer"], ["Within half an hour the union representative calls: staff received a file they never asked for, through no fault of their own, and are now threatened with discipline. Does the warning also apply to the HR assistant? How do you answer that?", "Inom en halvtimme ringer fackets ombud: personalen fick en fil de aldrig bad om, utan egen förskyllan, och hotas nu med disciplinåtgärder. Gäller varningen också HR-assistenten? Hur svarar ni på det?"]),
              pb(["Sharing goes underground", "Spridningen går under jord"], ["After the warning, the group chat goes quiet, but people start moving the file to private storage and messaging each other directly instead. The sharing has not stopped; you just can no longer see it. Has the warning helped containment or hurt it?", "Efter varningen tystnar gruppchatten, men folk börjar flytta filen till privat lagring och skriva direkt till varandra i stället. Spridningen har inte upphört; ni ser den bara inte längre. Har varningen hjälpt begränsningen eller skadat den?"]),
              pb(["A victim is warned", "Ett offer får en varning"], ["An employee whose own sick leave is in the file writes to HR: they forwarded it to their partner because they were upset, and now they are told they may be disciplined. Do you apply the warning to the people whose data was exposed?", "En anställd vars egen sjukfrånvaro finns i filen skriver till HR: hen skickade den vidare till sin partner för att hen var upprörd, och nu får hen veta att det kan bli disciplinära åtgärder. Gäller varningen även dem vars uppgifter exponerades?"])
            ]
          }),
          opt(["Have the group chat admin remove the screenshot and leave the rest", "Låt gruppchattens administratör ta bort skärmbilden och lämna resten"], "c4", ["Fixes the visible part and leaves the private copies.", "Rättar det synliga och lämnar de privata kopiorna."], {
            pushback: [
              pb(["Not your chat", "Inte er chatt"], ["The group chat runs on a private app, not on company systems, and the admin asks on what authority you want the post removed. Do you order it, ask nicely, or accept that the company cannot control staff's private chats?", "Gruppchatten ligger i en privat app, inte i företagets system, och administratören frågar med vilket mandat ni vill ha inlägget borttaget. Beordrar ni, ber ni snällt, eller godtar ni att företaget inte styr personalens privata chattar?"]),
              pb(["“Why was that deleted?”", "”Varför togs det bort?”"], ["The screenshot is removed, but several people have already saved it, and a new message asks “why was that deleted?”. Removing it has made it more interesting. What, if anything, do you say in the chat?", "Skärmbilden tas bort, men flera har redan sparat den, och ett nytt meddelande frågar ”varför togs det bort?”. Borttagningen har gjort den mer intressant. Vad säger ni i chatten, om något?"]),
              pb(["Contained, or unknown?", "Begränsat eller okänt?"], ["Three copies went to private addresses, and you have chosen to leave them. The DPO asks how you will describe those copies if asked: as contained, or as unknown. Can you justify fixing only what is visible?", "Tre kopior gick till privata adresser, och ni har valt att låta dem vara. Dataskyddsombudet frågar hur ni ska beskriva dem om någon frågar: som begränsade eller som okända. Kan ni försvara att bara rätta det synliga?"])
            ]
          })
        ])
      }),

      pg("c3b", ["The assistant", "Assistenten"], [
        "{{person.hr.name}} sits down with the assistant, who has been with the company for two years and is shaking. The mistake is simple: two contacts with similar names, and an email client that offers the most recent one first.\n\nTheir manager has already sent {{person.hr.name}} a message: “This is a sackable offence.” The assistant has seen it.",
        "{{person.hr.name}} sätter sig med assistenten, som har varit på företaget i två år och skakar. Misstaget är enkelt: två kontakter med liknande namn, och ett e-postprogram som först föreslår den som användes senast.\n\nHens chef har redan skickat ett meddelande till {{person.hr.name}}: ”Det här är skäl för uppsägning.” Assistenten har sett det."
      ], {
        choice: ask(["How do you treat the assistant?", "Hur bemöter ni assistenten?"], ["Supports the person and keeps the focus on the data and the system that made the error easy.", "Stöttar personen och håller fokus på datan och systemet som gjorde misstaget lätt."], [
          opt(["Support them, and say clearly that the system made this easy", "Stötta hen, och säg tydligt att systemet gjorde det här lätt"], "c4", ["Keeps a colleague and keeps the lessons honest.", "Behåller en kollega och håller lärdomarna ärliga."], { set: "supportive", pushback: [
              pb(["“So nobody is responsible?”", "”Så ingen är ansvarig?”"], ["The assistant's manager replies within minutes: “So nobody is responsible? I want it in writing that this was not negligence.” They copy in their own director. Do you hold your position against a senior manager, and on what grounds?", "Assistentens chef svarar inom några minuter: ”Så ingen är ansvarig? Jag vill ha det skriftligt att det här inte var vårdslöshet.” Chefen sätter sin egen direktör på kopia. Står ni fast mot en högre chef, och med vilka skäl?"]),
              pb(["Who supports us?", "Vem stöttar oss?"], ["An employee whose sick leave is in the file hears that the assistant is being supported and asks HR who is supporting them. To the people exposed, it can sound as if the company protects its own. How do you balance care for one against care for many?", "En anställd vars sjukfrånvaro finns i filen hör att assistenten får stöd och frågar HR vem som stöttar hen. För dem som exponerades kan det låta som att företaget skyddar sina egna. Hur väger ni omsorgen om en mot omsorgen om många?"]),
              pb(["Too early to say", "För tidigt att säga"], ["Legal warns that “the system made this easy” is a conclusion nobody has checked yet, and it could later be read as an admission of weak controls. Do you say it anyway, now, or wait until you actually know?", "Juristen varnar för att ”systemet gjorde det lätt” är en slutsats som ingen har kontrollerat än, och att den senare kan läsas som ett erkännande av svaga kontroller. Säger ni det ändå, nu, eller väntar ni tills ni faktiskt vet?"])
            ]
          }),
          opt(["Start a formal disciplinary process now", "Inled en formell disciplinär process nu"], "c4", ["Satisfies the manager. Everyone else learns to hide mistakes.", "Tillfredsställer chefen. Alla andra lär sig att dölja misstag."], { set: "blamed", pushback: [
              pb(["The one who knows has gone", "Den som vet har gått"], ["The assistant leaves for home in tears and switches off their phone. They are the only person who knows exactly which address was used and when. Who answers the questions you still have, and how will you get them back?", "Assistenten går hem i tårar och stänger av telefonen. Hen är den enda som vet exakt vilken adress som användes och när. Vem svarar på de frågor ni fortfarande har, och hur får ni tillbaka hen?"]),
              pb(["Which rule was broken?", "Vilken regel bröts?"], ["The union representative asks to see the rule the assistant broke, and points out that the payroll routine itself required emailing personal ID numbers. Is the process on trial too, and are you ready for that comparison?", "Fackets ombud ber att få se regeln som assistenten bröt mot, och påpekar att lönerutinen i sig krävde att personnummer mejlades. Står processen också på tur, och är ni redo för den jämförelsen?"]),
              pb(["“Note to self”", "”Påminnelse till mig själv”"], ["In the HR team chat, someone writes: “Note to self: never tell anyone.” The assistant reported within a minute; that is why you could act at all. What have you just told the next person who makes a mistake?", "I HR-teamets chatt skriver någon: ”Påminnelse till mig själv: berätta aldrig för någon.” Assistenten rapporterade inom en minut; det är därför ni alls kunde agera. Vad har ni just sagt till nästa person som gör ett misstag?"])
            ]
          })
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
          opt(["An honest message to all staff today, and personal calls to those with sick leave noted", "Ett ärligt meddelande till all personal i dag, och personliga samtal till dem med sjukfrånvaro noterad"], "l2", ["Hard to write, and it lowers the temperature.", "Svårt att skriva, och det sänker temperaturen."], { effects: { trust: 1 }, set: "staffInformed", pushback: [
              pb(["They had not heard", "Hen hade inte hört"], ["The first call reaches an employee on long sick leave who had not heard the news. Your call is how they learn that the whole company can see their absence. Should HR call people who may not know, and what do you say in the first sentence?", "Det första samtalet når en långtidssjukskriven som inte hade hört något. Ert samtal blir hur hen får veta att hela företaget kan se hens frånvaro. Ska HR ringa personer som kanske inte vet, och vad säger ni i första meningen?"]),
              pb(["How honest?", "Hur ärligt?"], ["Legal wants the message not to mention the sick-leave column until the assessment is done. The DPO says leaving it out would be misleading, since half the building has seen it. Who wins, and what is the one sentence both can live with?", "Juristen vill att meddelandet inte nämner kolumnen med sjukfrånvaro förrän bedömningen är klar. Dataskyddsombudet säger att det vore vilseledande att utelämna den, eftersom halva huset redan har sett den. Vem vinner, och vilken mening kan båda leva med?"]),
              pb(["Managers want it first", "Cheferna vill ha det först"], ["Managers ask to see the message a few hours before staff so they can prepare. But the corridor is moving fast, and a leaked draft would be worse than no message. Do you brief managers first and wait, or send to everyone at once and leave managers unprepared?", "Cheferna vill se meddelandet några timmar före personalen för att kunna förbereda sig. Men korridoren rör sig snabbt, och ett läckt utkast vore värre än inget meddelande. Informerar ni cheferna först och väntar, eller skickar ni till alla på en gång och lämnar cheferna oförberedda?"])
            ]
          }),
          opt(["A short note asking people to delete the file", "En kort notis som ber folk radera filen"], "l2", ["Quick, and it says nothing to the people who were hurt.", "Snabbt, och det säger ingenting till dem som skadades."], {
            pushback: [
              pb(["“Is that all?”", "”Är det allt?”"], ["Within minutes, a reply-all asks: “Is that all? My sick leave was in that file.” Others add their names. Your short note has become a public thread of hurt people. Do you answer in the thread, or start over with a longer message?", "Inom några minuter kommer ett svar till alla: ”Är det allt? Min sjukfrånvaro fanns i den filen.” Fler skriver under. Er korta notis har blivit en öppen tråd med sårade människor. Svarar ni i tråden, eller börjar ni om med ett längre meddelande?"]),
              pb(["The same note for everyone", "Samma notis till alla"], ["The two employees on sick leave who called HR this morning get the same short note as everyone else. One writes back that they now understand where they stand. Who calls them, and why didn't the note?", "De två långtidssjukskrivna som ringde HR i morse får samma korta notis som alla andra. En av dem svarar att hen nu förstår var hen står. Vem ringer dem, och varför gjorde inte notisen det?"]),
              pb(["No way to check", "Inget sätt att kontrollera"], ["IT points out that you cannot see who deleted the file, and the note gives no deadline or way to confirm. The union asks what happens to those who don't. Is a request without follow-up containment, or only a record that you asked?", "IT påpekar att ni inte kan se vem som raderade filen, och notisen saknar tidsgräns och sätt att bekräfta. Facket frågar vad som händer med dem som inte gör det. Är en begäran utan uppföljning en begränsning, eller bara ett bevis på att ni frågade?"])
            ]
          }),
          opt(["Say nothing more until the investigation is done", "Säg inget mer förrän utredningen är klar"], "l2", ["The corridor fills the silence.", "Korridoren fyller tystnaden."], { effects: { trust: -1 }, pushback: [
              pb(["Managers fill the gap", "Cheferna fyller tomrummet"], ["By lunch, managers have told their teams different stories: one says it was a hack, another blames HR. Your own managers are filling the silence. Do you still hold back, and how will you correct versions you have not even heard?", "Vid lunch har cheferna sagt olika saker till sina team: en säger att det var ett dataintrång, en annan skyller på HR. Era egna chefer fyller tystnaden. Håller ni fortfarande inne med det, och hur rättar ni versioner ni inte ens har hört?"]),
              pb(["The union will speak", "Facket tänker tala"], ["The union representative says that if nothing is said today, the union will send its own message to all members. Staff will then hear the story from the union, not from you. Is waiting still your choice?", "Fackets ombud säger att om inget sägs i dag skickar facket ett eget meddelande till alla medlemmar. Då får personalen höra historien från facket, inte från er. Är det fortfarande ert val att vänta?"]),
              pb(["Done when?", "Klar när?"], ["Nobody can say when the investigation will be done: days, perhaps weeks. Meanwhile, people whose sick leave was exposed are calling HR today. What do the people answering the phone say to them?", "Ingen kan säga när utredningen blir klar: dagar, kanske veckor. Under tiden ringer personer vars sjukfrånvaro exponerades till HR i dag. Vad ska de som svarar i telefon säga till dem?"])
            ]
          }),
          opt(["Retract the “delete it unopened” email and admit the file was opened by many", "Ta tillbaka mejlet om att radera oöppnat och medge att filen har öppnats av många"], "l2", ["Contradicts your first message; staff will compare the two.", "Motsäger ert första meddelande; personalen kommer att jämföra de två."], { requires: "askedDelete", set: "deleteRequestRetracted", effects: { trust: 1 }, pushback: [
              pb(["“Which one was true?”", "”Vilket var sant?”"], ["Staff put your two emails side by side in the group chat: the first asked them to delete it unopened, the second admits many opened it. Someone asks: “So which one was true?” How do you explain the first message without making things worse?", "Personalen lägger era två mejl bredvid varandra i gruppchatten: det första bad dem radera oöppnat, det andra medger att många öppnade. Någon frågar: ”Så vilket var sant?” Hur förklarar ni det första meddelandet utan att göra saken värre?"]),
              pb(["Was opening it wrong?", "Var det fel att öppna?"], ["Your admission makes people wonder whether they will be blamed for opening a file they were asked not to open. Some are anxious, some are angry. Do you say plainly that opening it was not wrong, even though your first message implied it was?", "Ert medgivande får folk att undra om de kommer att klandras för att de öppnade en fil de ombads låta bli. En del är oroliga, andra arga. Säger ni rakt ut att det inte var fel att öppna den, trots att ert första meddelande antydde det?"]),
              pb(["Admission in writing", "Ett skriftligt medgivande"], ["Legal is uneasy: “opened by many” in an email to all staff is a sentence that will be quoted in any complaint. They suggest saying it in meetings instead. Do you send the retraction as written, or soften it?", "Juristen är orolig: ”öppnad av många” i ett mejl till all personal är en mening som kommer att citeras i varje klagomål. Hen föreslår att ni säger det på möten i stället. Skickar ni tillbakadragandet som det står, eller mildrar ni det?"])
            ]
          })
        ])
      }),

      pg("l2", ["The union", "Facket"], [
        "The union representative is calm and precise. Members want to know who could see their data, whether it has left the company, and what will be done to stop it happening again.\n\nThey also want an assurance that nobody will be punished for a mistake the system made easy, and a written answer by tomorrow. The meeting ends politely, and with a deadline.",
        "Fackets ombud är lugn och exakt. Medlemmarna vill veta vem som kunde se deras uppgifter, om de har lämnat företaget och vad som görs för att det inte ska hända igen.\n\nDe vill också ha en försäkran om att ingen straffas för ett misstag som systemet gjorde lätt, och ett skriftligt svar senast i morgon. Mötet slutar artigt, och med en tidsfrist."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["How do you answer the union?", "Hur svarar ni facket?"], ["Answers in writing with facts, open questions and a commitment on the system, not on individuals.", "Svarar skriftligt med fakta, öppna frågor och ett åtagande om systemet, inte om individer."], [
          opt(["A written answer tomorrow with what you know and do not know", "Ett skriftligt svar i morgon med vad ni vet och inte vet"], "c5", ["Builds trust and costs an evening.", "Bygger förtroende och kostar en kväll."], {
            pushback: [
              pb(["Half the answers are “unknown”", "Hälften av svaren är ”okänt”"], ["Drafting tonight, you notice that half the answers say “we don't know yet”. The union asked for facts, and what you have is a list of open questions. Do you send it as it is, or delay to fill gaps you may never be able to fill?", "När ni skriver i kväll märker ni att hälften av svaren lyder ”vi vet inte än”. Facket bad om fakta, och det ni har är en lista med öppna frågor. Skickar ni det som det är, eller skjuter ni upp för att fylla luckor ni kanske aldrig kan fylla?"]),
              pb(["The assurance", "Försäkran"], ["The union asked for a written assurance that nobody will be punished. The assistant's manager insists that question is not settled. Do you put the assurance in writing, leave it out, or write something vague the union will see straight through?", "Facket bad om en skriftlig försäkran om att ingen straffas. Assistentens chef hävdar att den frågan inte är avgjord. Skriver ni in försäkran, utelämnar ni den, eller skriver ni något vagt som facket genast ser igenom?"]),
              pb(["It will travel", "Det kommer att spridas"], ["Whatever you write, the union will share with its members, and probably beyond. A written answer becomes a public document. Who signs it, and are you ready for it to be read by people outside the company?", "Vad ni än skriver kommer facket att dela med sina medlemmar, och troligen vidare. Ett skriftligt svar blir ett offentligt dokument. Vem skriver under, och är ni redo för att det läses av folk utanför företaget?"])
            ]
          }),
          opt(["A verbal update at next month's meeting", "En muntlig uppdatering på nästa månads möte"], "c5", ["Easier now, harder later.", "Enklare nu, svårare sedan."], {
            pushback: [
              pb(["The union writes its own", "Facket skriver själv"], ["The union replies that a month is unacceptable and that it will send members its own summary today. You no longer decide how the facts are first described. Is the easier option still easier?", "Facket svarar att en månad är oacceptabelt och att det skickar en egen sammanfattning till medlemmarna i dag. Ni bestämmer inte längre hur fakta först beskrivs. Är det enklare alternativet fortfarande enklare?"]),
              pb(["The questions come anyway", "Frågorna kommer ändå"], ["Without a written answer, members take the same questions to their managers, who have nothing to give them. The questions still come, just to people less prepared to answer. Who answers them in the meantime?", "Utan ett skriftligt svar tar medlemmarna samma frågor till sina chefer, som inte har något att ge dem. Frågorna kommer ändå, bara till personer som är sämre förberedda. Vem svarar på dem under tiden?"]),
              pb(["No record", "Inget som finns kvar"], ["The DPO notes that the union's written questions will stay on file, and so will the absence of a written reply. A verbal update next month leaves no record of what you said now. How would you explain that month to someone reviewing it later?", "Dataskyddsombudet påpekar att fackets skriftliga frågor finns kvar, och det gör också avsaknaden av ett skriftligt svar. En muntlig uppdatering nästa månad lämnar inga spår av vad ni sa nu. Hur förklarar ni den månaden för någon som granskar det i efterhand?"])
            ]
          })
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
          opt(["Notify within 72 hours and supplement later", "Anmäl inom 72 timmar och komplettera senare"], "l3", ["Meets the duty. The regulator will ask what you are changing.", "Uppfyller skyldigheten. Myndigheten kommer att fråga vad ni ändrar."], { effects: { regulator: -1 }, set: "notified", pushback: [
              pb(["Reporting what you can't describe", "Att anmäla det ni inte kan beskriva"], ["The draft has gaps: you do not know how many people read the sick-leave column, or where the private forwards ended up. The CEO asks why you would report to a regulator something you cannot yet describe. How do you convince them?", "Utkastet har luckor: ni vet inte hur många som läste kolumnen med sjukfrånvaro, eller var de privata vidarebefordringarna hamnade. Vd frågar varför ni ska anmäla något till en myndighet som ni ännu inte kan beskriva. Hur övertygar ni hen?"]),
              pb(["Employees first?", "De anställda först?"], ["Once you notify, the people whose health data was exposed will also need to hear from you, and some have heard nothing from HR at all. Should they learn from you before {{reg.dpaShort}} does, and can you manage both within 72 hours?", "När ni anmäler behöver även de vars hälsouppgifter exponerades höra från er, och en del har inte hört något alls från HR. Ska de få veta det från er innan {{reg.dpaShort}} gör det, och hinner ni båda inom 72 timmar?"]),
              pb(["A thin list of measures", "En tunn lista med åtgärder"], ["The notification asks what you have done to limit the harm, and today your list is short. Someone suggests rushing out a policy change first so the notification reads better. Do you notify with a thin list, or fix something hastily just to have more to write?", "Anmälan frågar vad ni har gjort för att begränsa skadan, och i dag är er lista kort. Någon föreslår att ni snabbt tar fram en ändrad riktlinje först så att anmälan ser bättre ut. Anmäler ni med en tunn lista, eller lagar ni något i hast bara för att ha mer att skriva?"])
            ]
          }),
          opt(["Wait to see whether it spreads further", "Vänta och se om det sprids vidare"], "l3", ["Likely to miss the deadline.", "Missar troligen tidsfristen."], { effects: { regulator: 1 }, set: "notifyLate", pushback: [
              pb(["The clock is running", "Klockan går"], ["{{person.dpo.name}} points out that the 72 hours started when you became aware, this morning, not when you finish watching. Waiting does not pause the clock. How many of those hours will you spend watching, and who decides when to stop?", "{{person.dpo.name}} påpekar att de 72 timmarna började när ni fick kännedom, i morse, inte när ni har sett färdigt. Att vänta stoppar inte klockan. Hur många av de timmarna tänker ni lägga på att vänta, och vem bestämmer när det räcker?"]),
              pb(["You cannot see it spread", "Ni kan inte se spridningen"], ["The private forwards and the external copy are outside your systems. If the file spreads further, you are unlikely to know until someone else tells you. What exactly are you waiting for, and how would you recognise it?", "De privata vidarebefordringarna och den externa kopian ligger utanför era system. Om filen sprids vidare får ni troligen inte veta det förrän någon annan berättar. Vad är det egentligen ni väntar på, och hur skulle ni känna igen det?"]),
              pb(["Objection on record", "Invändning till protokollet"], ["The DPO asks for the decision to wait to be minuted, with their objection noted. Giving independent advice is their job, and they have given it. Do you put your names to waiting, or reconsider?", "Dataskyddsombudet begär att beslutet att vänta protokollförs, med hens invändning antecknad. Att ge oberoende råd är hens uppgift, och det har hen gjort. Skriver ni under på att vänta, eller tänker ni om?"])
            ]
          }),
          opt(["Decide it was internal and not notifiable", "Bedöm att det var internt och inte anmälningspliktigt"], "l3", ["Hard to defend with private forwards and an external copy.", "Svårt att försvara med privata vidarebefordringar och en extern kopia."], { effects: { regulator: 2 }, set: "denied", pushback: [
              pb(["Write the reasoning down", "Skriv ner resonemanget"], ["Legal asks you to write down why this counts as internal, so it can be defended later. The external address and three private forwards have to appear somewhere in that text. What exactly do you write about the copies outside?", "Juristen ber er skriva ner varför det här räknas som internt, så att det går att försvara senare. Den externa adressen och tre privata vidarebefordringar måste stå någonstans i den texten. Vad skriver ni exakt om kopiorna utanför?"]),
              pb(["Overruling the DPO", "Att köra över dataskyddsombudet"], ["{{person.dpo.name}} says plainly that they cannot support this and will document their advice. If anyone ever asks, their note will sit in the file next to your decision. Do you overrule your own data protection officer?", "{{person.dpo.name}} säger rakt ut att hen inte kan stå bakom det här och kommer att dokumentera sitt råd. Om någon någonsin frågar ligger hens anteckning bredvid ert beslut. Kör ni över ert eget dataskyddsombud?"]),
              pb(["Say it aloud", "Säg det högt"], ["Employees on sick leave are already asking HR whether {{reg.dpaShort}} has been told. The answer would be: “We decided it wasn't necessary.” Does that sound defensible said aloud to someone whose health data everyone saw?", "Sjukskrivna anställda frågar redan HR om {{reg.dpaShort}} har informerats. Svaret skulle bli: ”Vi bedömde att det inte behövdes.” Låter det försvarbart sagt högt till någon vars hälsouppgifter alla har sett?"])
            ]
          })
        ])
      }),

      pg("l3", ["The screenshot travels", "Skärmbilden sprids"], [
        "The salary screenshot has left the group chat. Someone posted it in a public forum about workplace pay, with the company name and the manager's job title.\n\nThe manager is upset and asks HR to “find out who did this”. The post has a few hundred views so far, but forums like this are read by journalists looking for stories.",
        "Skärmbilden på lönen har lämnat gruppchatten. Någon har lagt upp den i ett offentligt forum om löner på arbetsplatser, med företagsnamnet och chefens titel.\n\nChefen är upprörd och ber HR ”ta reda på vem som gjorde det här”. Inlägget har hittills några hundra visningar, men sådana forum läses av journalister som letar efter nyheter."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["How do you handle the public post?", "Hur hanterar ni det offentliga inlägget?"], ["Asks the forum to remove it and supports the manager without starting a hunt.", "Ber forumet ta bort det och stöttar chefen utan att starta en jakt."], [
          opt(["Ask the forum to remove it and support the manager", "Be forumet ta bort det och stötta chefen"], "c6", ["Removes the most visible copy without escalating.", "Tar bort den mest synliga kopian utan att trappa upp."], {
            pushback: [
              pb(["The forum says no", "Forumet säger nej"], ["The forum's moderators reply that pay transparency is the forum's purpose, and a salary without a name breaks none of their rules. The post stays up. What else can you do that does not make the story bigger?", "Forumets moderatorer svarar att öppenhet kring löner är forumets syfte, och att en lön utan namn inte bryter mot någon regel. Inlägget ligger kvar. Vad mer kan ni göra som inte gör nyheten större?"]),
              pb(["Support is not enough", "Stöd räcker inte"], ["The manager says support is not enough: they want whoever posted it found and dealt with, and will take it to the CEO if HR won't. Do you hold off on a hunt while a senior colleague feels exposed and ignored?", "Chefen säger att stöd inte räcker: hen vill att den som publicerade hittas och hanteras, och tänker gå till vd om HR inte gör det. Avstår ni från en jakt medan en högre kollega känner sig utlämnad och förbisedd?"]),
              pb(["The request becomes a post", "Begäran blir ett inlägg"], ["A forum user posts a screenshot of your removal request: “Company tries to hide salaries.” It gets more replies than the original. Do you respond on the forum, or stay silent while your request becomes the story?", "En forumanvändare lägger upp en skärmbild av er begäran om borttagning: ”Företag försöker dölja löner.” Den får fler svar än originalet. Svarar ni i forumet, eller tiger ni medan er begäran blir nyheten?"])
            ]
          }),
          opt(["Investigate which employee posted it", "Utred vilken anställd som publicerade det"], "c6", ["Satisfies the manager and sours the building further.", "Tillfredsställer chefen och försämrar stämningen ytterligare."], { effects: { trust: -1 }, pushback: [
              pb(["On what basis?", "Med vilken grund?"], ["The union representative asks what the investigation will look at: staff's private phones, private accounts, chat histories? And on what legal basis? Are you prepared to justify that search, during a breach of the same staff's data?", "Fackets ombud frågar vad utredningen ska granska: personalens privata telefoner, privata konton, chatthistorik? Och med vilken rättslig grund? Är ni beredda att försvara den granskningen, mitt i en incident som rör samma personals uppgifter?"]),
              pb(["Everyone is a suspect", "Alla är misstänkta"], ["Hundreds opened the file and the screenshot passed through a group chat with most of the company in it. The pool of suspects is nearly everyone. Is this an investigation, or a message to staff that they are all under suspicion?", "Hundratals öppnade filen och skärmbilden gick genom en gruppchatt där större delen av företaget finns. Kretsen av misstänkta är nästan alla. Är det här en utredning, eller ett budskap till personalen att alla är misstänkta?"]),
              pb(["And if you find them?", "Och om ni hittar hen?"], ["Several staff argue that the poster did no worse than what was said in the kitchen this morning, and that pay is a fair topic. If you find the person, what will you actually do, and how will it look if that comes out?", "Flera i personalen menar att den som publicerade inte gjorde värre än det som sades i köket i morse, och att lön är ett rimligt ämne. Om ni hittar personen, vad gör ni då egentligen, och hur ser det ut om det kommer fram?"])
            ]
          })
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
          opt(["Confirm briefly and describe what you have done", "Bekräfta kortfattat och beskriv vad ni har gjort"], "c7", ["A small story, accurately told.", "En liten nyhet, korrekt berättad."], { effects: { media: -1 }, pushback: [
              pb(["“Yes or no?”", "”Ja eller nej?”"], ["The journalist presses: “Yes or no, did it include sick leave?” A brief statement that steps around the question will read as a dodge. Do you confirm the sick-leave column, and how, without exposing any individual?", "Journalisten trycker på: ”Ja eller nej, fanns sjukfrånvaro med?” Ett kort uttalande som går runt frågan kommer att uppfattas som en undanmanöver. Bekräftar ni kolumnen med sjukfrånvaro, och hur, utan att utlämna någon enskild?"]),
              pb(["The outside copy", "Den externa kopian"], ["The journalist also asked whether it left the company. A brief answer still has to say something about the external recipient. What exactly do you say about that copy, and can you back up every word if they check?", "Journalisten frågade också om den lämnade företaget. Även ett kort svar måste säga något om den externa mottagaren. Vad säger ni exakt om den kopian, och kan ni stå för varje ord om de kontrollerar?"]),
              pb(["Staff read it first", "Personalen läser det först"], ["Staff will read the article this afternoon, and some will learn things from it that HR never told them directly. Do you send staff a message before it is published, and what if that message reaches the journalist too?", "Personalen läser artikeln i eftermiddag, och en del kommer att få veta saker där som HR aldrig sa direkt till dem. Skickar ni ett meddelande till personalen innan den publiceras, och vad händer om det också når journalisten?"])
            ]
          }),
          opt(["Confirm, apologise and offer a short interview", "Bekräfta, be om ursäkt och erbjud en kort intervju"], "c7", ["Open and human. Prepare the spokesperson well.", "Öppet och mänskligt. Förbered talespersonen väl."], {
            pushback: [
              pb(["Who goes on record?", "Vem ställer upp?"], ["Comms suggests the CEO; the CEO suggests HR; HR is exhausted and has been in the middle of it since the first minute. The spokesperson will be asked about salaries, sick leave and the assistant. Who speaks, and how much time do they get to prepare?", "Kommunikation föreslår vd; vd föreslår HR; HR är utmattade och har stått mitt i det sedan första minuten. Talespersonen kommer att få frågor om löner, sjukfrånvaro och assistenten. Vem ställer upp, och hur lång tid får hen att förbereda sig?"]),
              pb(["Was anyone disciplined?", "Fick någon en påföljd?"], ["Before the interview, the journalist asks whether the person who made the mistake has been disciplined. Whatever you say will be quoted. What do you answer, and does it match what the assistant has been told?", "Före intervjun frågar journalisten om personen som gjorde misstaget har fått någon påföljd. Vad ni än säger kommer att citeras. Vad svarar ni, och stämmer det med vad assistenten har fått höra?"]),
              pb(["An apology on tape", "En ursäkt på band"], ["Legal warns that an apology in a recorded interview may be quoted in every later complaint or claim. They want a written statement only. Is the human approach worth that risk, and who decides?", "Juristen varnar för att en ursäkt i en inspelad intervju kan citeras i varje senare klagomål eller krav. Hen vill bara ha ett skriftligt uttalande. Är det mänskliga förhållningssättet värt den risken, och vem bestämmer?"])
            ]
          }),
          opt(["Deny that any sensitive data was involved", "Förneka att några känsliga uppgifter berördes"], "x1", ["The journalist has a source inside the building.", "Journalisten har en källa inne i byggnaden."], { effects: { media: 2, trust: -1 }, pushback: [
              pb(["They have a source", "De har en källa"], ["Comms reminds you that the journalist heard this from an employee. Anyone with the file can photograph the sick-leave column and send it in. Are you certain enough to stake the company's credibility on this statement?", "Kommunikation påminner om att journalisten har hört det från en anställd. Vem som helst med filen kan fotografera kolumnen med sjukfrånvaro och skicka in den. Är ni säkra nog att sätta företagets trovärdighet på det här uttalandet?"]),
              pb(["Staff saw it themselves", "Personalen såg det själva"], ["Hundreds of staff opened the file and saw the sick-leave column with their own eyes. They will read your denial this afternoon. What will you say to them tomorrow morning?", "Hundratals anställda öppnade filen och såg kolumnen med sjukfrånvaro med egna ögon. De kommer att läsa ert förnekande i eftermiddag. Vad säger ni till dem i morgon bitti?"]),
              pb(["Who signs this?", "Vem står för det här?"], ["{{person.dpo.name}}, who has called sick-leave days health data from the start, asks who is approving a statement that says no sensitive data was involved. Who signs off on it, by name?", "{{person.dpo.name}}, som från början har kallat sjukdagar för hälsouppgifter, frågar vem som godkänner ett uttalande om att inga känsliga uppgifter berördes. Vem står för det, med namn?"])
            ]
          })
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
          opt(["Ask for deletion from the backup too, with written confirmation", "Begär radering även ur säkerhetskopian, med skriftlig bekräftelse"], "l4", ["Some effort for them. A clean answer for you.", "Lite besvär för dem. Ett rent besked för er."], { set: "externalDeleted", pushback: [
              pb(["Who pays?", "Vem betalar?"], ["The partner's IT manager says pulling one email out of a backup is a day's work, and asks who will pay for it. Their tone has cooled. Do you offer to pay, insist it is their duty, or settle for less?", "Partnerns IT-chef säger att det tar en arbetsdag att plocka ut ett mejl ur en säkerhetskopia, och frågar vem som betalar. Tonen har svalnat. Erbjuder ni er att betala, hävdar ni att det är deras skyldighet, eller nöjer ni er med mindre?"]),
              pb(["Another copy to delete one", "En kopia till för att radera en"], ["To remove the email from the backup, they must restore it first, which briefly creates yet another copy in another system. Their IT manager asks whether you really want that. Is the cleanest answer worth a new copy?", "För att ta bort mejlet ur säkerhetskopian måste de först återställa den, vilket en kort stund skapar ännu en kopia i ett annat system. IT-chefen frågar om ni verkligen vill det. Är det renaste beskedet värt en ny kopia?"]),
              pb(["A partner who did nothing wrong", "En partner som inte gjort fel"], ["The partner's director calls your CEO: they made no mistake, received a file they never asked for, and now face demands and paperwork. Recruitment work for you is due next week. How hard do you push a partner who did nothing wrong?", "Partnerns vd ringer er vd: de har inte gjort något fel, fick en fil de aldrig bad om och möts nu av krav och pappersarbete. Ett rekryteringsuppdrag åt er ska levereras nästa vecka. Hur hårt pressar ni en partner som inte har gjort något fel?"])
            ]
          }),
          opt(["Accept the thirty-day expiry", "Godta att kopian går ut efter trettio dagar"], "l4", ["Reasonable, and your notification must then say so.", "Rimligt, och då måste er anmälan säga det."], {
            pushback: [
              pb(["Write it down", "Skriv ner det"], ["Your notification now has to say that the health data of {{num.sick}} people will sit in a third party's backup for a month. The DPO asks how you will explain accepting that when deletion was on offer. What do you write?", "Er anmälan måste nu säga att hälsouppgifter om {{num.sick}} personer ligger kvar i en annan organisations säkerhetskopia i en månad. Dataskyddsombudet frågar hur ni förklarar att ni godtog det när radering fanns att få. Vad skriver ni?"]),
              pb(["“Is my data still there?”", "”Finns mina uppgifter kvar där?”"], ["An employee asks HR directly whether their data is still at the other company. The honest answer is yes, for thirty more days. Are you willing to say that, to them and to the union?", "En anställd frågar HR rakt ut om hens uppgifter fortfarande finns hos det andra företaget. Det ärliga svaret är ja, i trettio dagar till. Är ni beredda att säga det, till hen och till facket?"]),
              pb(["Backups get restored", "Säkerhetskopior återställs"], ["The partner mentions that they restore from backup now and then, when someone deletes a file by mistake. A restore within the month could put your email back in the live archive. Who would notice, and would anyone tell you?", "Partnern nämner att de då och då återställer från säkerhetskopian när någon raderat en fil av misstag. En återställning inom månaden kan lägga tillbaka ert mejl i det aktiva arkivet. Vem skulle märka det, och skulle någon säga till er?"])
            ]
          })
        ])
      }),

      pg("l4", ["Why it was so easy", "Varför det var så lätt"], [
        "{{person.itOps.name}} reconstructs the mistake. The email client suggests recent contacts first, the all-staff list has a short name, and nothing warns when an attachment with personal ID numbers goes to more than a handful of people.\n\nThe payroll provider has offered a secure upload portal for two years. Nobody used it, because email was quicker.",
        "{{person.itOps.name}} återskapar misstaget. E-postprogrammet föreslår de senaste kontakterna först, listan för all personal har ett kort namn och ingenting varnar när en bilaga med personnummer skickas till fler än ett fåtal personer.\n\nLöneleverantören har erbjudit en säker uppladdningsportal i två år. Ingen använde den, eftersom e-post gick snabbare."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you fix first?", "Vad rättar ni först?"], ["Removes email from the payroll process and adds a warning for sensitive attachments.", "Tar bort e-post ur löneprocessen och lägger till en varning för känsliga bilagor."], [
          opt(["Move payroll to the secure portal and block personal ID numbers in mass email", "Flytta lönehanteringen till den säkra portalen och blockera personnummer i massutskick"], "c8", ["Fixes the path, not the person.", "Rättar vägen, inte personen."], {
            pushback: [
              pb(["The block catches real mail", "Spärren fångar riktig post"], ["IT warns that blocking personal ID numbers in mass email will also stop pension statements, benefit letters and some contracts that go out the same way. The first test blocks a dozen legitimate messages. Do you go ahead and fix things as they break, or narrow the rule?", "IT varnar för att en spärr mot personnummer i massutskick också stoppar pensionsbesked, förmånsbrev och en del avtal som skickas samma väg. Det första testet stoppar ett dussin legitima meddelanden. Kör ni ändå och rättar det som går sönder, eller snävar ni in regeln?"]),
              pb(["Next payroll is soon", "Nästa lönekörning är snart"], ["The payroll provider says setting up the portal takes a few weeks, and next month's file is due in ten days. Do you send one more payroll file by email in the meantime, and with what safeguards?", "Löneleverantören säger att det tar några veckor att sätta upp portalen, och nästa månads fil ska in om tio dagar. Skickar ni en lönefil till med e-post under tiden, och med vilka skyddsåtgärder?"]),
              pb(["The old path stays open", "Den gamla vägen står öppen"], ["The portal has been available for two years and nobody used it, because email was quicker. HR asks what stops people drifting back to email the first time the portal is slow. Is a better path enough while the old one stays open?", "Portalen har funnits i två år utan att någon använt den, eftersom e-post gick snabbare. HR frågar vad som hindrar folk från att glida tillbaka till e-post första gången portalen är seg. Räcker en bättre väg så länge den gamla står öppen?"])
            ]
          }),
          opt(["Restrict who can send to the all-staff list", "Begränsa vem som får skicka till listan för all personal"], "c8", ["Helpful, and the external address remains a risk.", "Hjälpsamt, och den externa adressen förblir en risk."], {
            pushback: [
              pb(["It misses the outside copy", "Den missar den externa kopian"], ["The DPO points out that restricting the all-staff list would not have stopped the external copy, the one you worked hardest to recover. The same autocomplete could pick one wrong outside address tomorrow. What protects that path?", "Dataskyddsombudet påpekar att en begränsning av listan för all personal inte hade stoppat den externa kopian, den ni kämpade mest för att få tillbaka. Samma automatiska ifyllning kan välja fel extern adress i morgon. Vad skyddar den vägen?"]),
              pb(["Is HR on the list?", "Står HR på listan?"], ["Dozens of people send to the all-staff list today: managers, comms, facilities. Each asks to stay on the allowed list, HR included. If HR keeps its right to send, would this restriction have stopped the mistake at all?", "Dussintals personer skickar till listan för all personal i dag: chefer, kommunikation, fastighet. Alla vill stå kvar på listan över tillåtna avsändare, HR inräknat. Om HR får behålla rätten att skicka, hade begränsningen alls stoppat misstaget?"]),
              pb(["Lists multiply", "Listorna förökar sig"], ["IT expects that a restriction will push people to build their own large lists from department groups, which nobody controls. Within a week there may be several unofficial all-staff lists. Have you removed the risk, or only moved it?", "IT räknar med att en begränsning får folk att bygga egna stora listor av avdelningsgrupper, som ingen har koll på. Inom en vecka kan det finnas flera inofficiella listor till all personal. Har ni tagit bort risken, eller bara flyttat den?"])
            ]
          })
        ])
      }),

      pg("c8", ["Who saw mine?", "Vem såg mitt?"], [
        "HR's inbox fills with the same question in a hundred forms. Who opened my row? Did my manager see my sick leave? Can I find out who forwarded it?\n\nThe message trace can show who opened the email, not who read which row. Some employees ask whether they can file a complaint with the regulator themselves. They can.",
        "HR:s inkorg fylls av samma fråga i hundra former. Vem öppnade min rad? Såg min chef min sjukfrånvaro? Kan jag få veta vem som vidarebefordrade det?\n\nMeddelandespårningen kan visa vem som öppnade mejlet, inte vem som läste vilken rad. En del anställda frågar om de själva kan klaga hos tillsynsmyndigheten. Det kan de."
      ], {
        discuss: [q("What can you honestly tell someone who asks who saw their sick leave?", "Vad kan ni ärligt säga till någon som frågar vem som såg deras sjukfrånvaro?", ["dpo", "hr"])],
        choice: ask(["How do you answer individual employees?", "Hur svarar ni enskilda anställda?"], ["Answers each person honestly about what can and cannot be known, and offers support.", "Svarar varje person ärligt om vad som går och inte går att veta, och erbjuder stöd."], [
          opt(["Personal answers with what you know, and support where needed", "Personliga svar med det ni vet, och stöd där det behövs"], "c9", ["Time-consuming and respectful.", "Tidskrävande och respektfullt."], {
            pushback: [
              pb(["Hundreds in the queue", "Hundratals i kön"], ["HR counts several hundred questions and has a handful of people to answer them. Personal answers will take weeks, and the most distressed wait as long as the merely curious. How do you decide who hears back first?", "HR räknar till flera hundra frågor och har en handfull personer som kan svara. Personliga svar tar veckor, och de mest drabbade får vänta lika länge som de bara nyfikna. Hur bestämmer ni vem som får svar först?"]),
              pb(["“Did my manager see it?”", "”Såg min chef det?”"], ["An employee on sick leave asks whether their manager opened the file. The trace shows the manager did. Do you tell them, knowing it may damage their working relationship, or say you cannot know which row anyone read?", "En sjukskriven anställd frågar om hens chef öppnade filen. Spårningen visar att chefen gjorde det. Berättar ni det, trots att det kan skada deras arbetsrelation, eller säger ni att ni inte kan veta vilken rad någon läste?"]),
              pb(["Different answers", "Olika svar"], ["Different people in HR give slightly different answers to the same question, and employees compare them in the group chat. One was told “nobody outside saw it”, another was not. How do you keep answers personal and still consistent?", "Olika personer på HR ger lite olika svar på samma fråga, och de anställda jämför dem i gruppchatten. En fick höra att ”ingen utanför såg det”, en annan inte. Hur håller ni svaren personliga och ändå samstämmiga?"])
            ]
          }),
          opt(["A standard FAQ for everyone", "En standardiserad fråga-svar-sida för alla"], "c9", ["Efficient, and cold for those who were hurt most.", "Effektivt, och kallt för dem som skadades mest."], {
            pushback: [
              pb(["Processed, not heard", "Hanterad, inte hörd"], ["An employee on long sick leave writes that being sent an FAQ about their own illness felt like being processed. They copy the union. Who calls them, and should an FAQ have been the first answer for anyone in that group?", "En långtidssjukskriven skriver att det kändes som att bli hanterad att få en fråga-svar-sida om sin egen sjukdom. Hen sätter facket på kopia. Vem ringer hen, och borde en fråga-svar-sida ha varit det första svaret till någon i den gruppen?"]),
              pb(["The question it can't answer", "Frågan den inte kan svara på"], ["The most common question, “who saw my row?”, has only one FAQ answer: “we cannot know”. Written once for everyone, it reads as evasive. Do you add more detail about the trace, and risk saying too much?", "Den vanligaste frågan, ”vem såg min rad?”, har bara ett svar på sidan: ”det kan vi inte veta”. Skrivet en gång för alla låter det undvikande. Lägger ni till mer om spårningen, och riskerar att säga för mycket?"]),
              pb(["Formal requests arrive", "Formella begäranden kommer"], ["Some employees respond to the FAQ with formal requests for access to the data held about them, including who opened the email. Those come with legal deadlines. Who handles them, and did the FAQ just create more work than it saved?", "En del anställda svarar på sidan med formella begäranden om tillgång till de uppgifter som finns om dem, inklusive vem som öppnade mejlet. De har lagstadgade tidsfrister. Vem hanterar dem, och skapade sidan just mer arbete än den sparade?"])
            ]
          })
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
          opt(["No sanction; thank them for reporting within a minute", "Ingen påföljd; tacka hen för att hen rapporterade inom en minut"], "c10", ["Tells everyone that reporting fast is safe.", "Visar alla att det är tryggt att rapportera snabbt."], { set: "supportive", pushback: [
              pb(["“No consequences?”", "”Inga konsekvenser?”"], ["The assistant's manager says the outcome tells everyone that a mistake affecting {{num.staff|number}} people has no consequences, and threatens to take it to the CEO. How do you explain “no sanction” to someone who sees it as unfair?", "Assistentens chef säger att utfallet visar alla att ett misstag som drabbade {{num.staff|number}} personer saknar konsekvenser, och hotar att gå till vd. Hur förklarar ni ”ingen påföljd” för någon som tycker att det är orättvist?"]),
              pb(["“Please don't thank me”", "”Tacka mig inte, snälla”"], ["HR wants to thank the assistant in front of the team for reporting quickly. The assistant asks you not to: they just want it to be over. Do you make the lesson public against their wishes, or keep it private and lose the message?", "HR vill tacka assistenten inför teamet för den snabba rapporten. Assistenten ber er låta bli: hen vill bara att det ska vara över. Gör ni lärdomen offentlig mot hens vilja, eller håller ni den privat och tappar budskapet?"]),
              pb(["Who is accountable?", "Vem står till svars?"], ["An employee whose sick leave was in the file asks whether anyone is being held accountable. To them, “no sanction” can sound like “nobody cares”. What do you say about accountability that is not about the assistant?", "En anställd vars sjukfrånvaro fanns i filen frågar om någon ställs till svars. För hen kan ”ingen påföljd” låta som ”ingen bryr sig”. Vad säger ni om ansvar som inte handlar om assistenten?"])
            ]
          }),
          opt(["A written warning", "En skriftlig varning"], "c10", ["Proportionate on paper, and it will be remembered.", "Proportionerligt på papperet, och det kommer att minnas."], { set: "blamed", pushback: [
              pb(["The union contests it", "Facket bestrider det"], ["The union says a written warning for an error the process made easy is disproportionate, and will contest it formally. The case could run for months. Is the warning worth that fight?", "Facket menar att en skriftlig varning för ett misstag som processen gjorde lätt är oproportionerlig, och tänker bestrida den formellt. Ärendet kan pågå i månader. Är varningen värd den striden?"]),
              pb(["The inbox goes quiet", "Inkorgen tystnar"], ["Since the warning became known, HR's incident inbox has been silent: not one near-miss reported. Is that good news, or exactly what you were afraid of?", "Sedan varningen blev känd har HR:s inkorg för incidenter varit tyst: inte ett enda tillbud rapporterat. Är det goda nyheter, eller precis det ni var rädda för?"]),
              pb(["Only the last link", "Bara sista länken"], ["The assistant asks quietly whether the people who set up the email-based payroll routine were also warned. They were not. How do you explain why the person at the end of the chain carries it alone?", "Assistenten frågar lågt om de som byggde den e-postbaserade lönerutinen också fick en varning. Det fick de inte. Hur förklarar ni att personen längst bort i kedjan bär det ensam?"])
            ]
          })
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "Three weeks later. The file is mostly gone, the regulator's questions are answered or being answered, and the kitchen conversations have moved on to other things.\n\nThe crisis team meets one last time. There is budget for one real change this quarter, and everyone agrees that the next mistake is coming; the question is how small it will be.",
        "Tre veckor senare. Filen är i stort sett borta, myndighetens frågor är besvarade eller håller på att besvaras, och samtalen i köket har gått vidare till annat.\n\nKrisledningen träffas en sista gång. Det finns budget för en verklig förändring det här kvartalet, och alla är överens om att nästa misstag kommer; frågan är hur litet det blir."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Removes sensitive files from email workflows and adds automatic warnings.", "Tar bort känsliga filer ur e-postflöden och lägger till automatiska varningar."], [
          opt(["Secure transfer for payroll and warnings for sensitive attachments", "Säker överföring för lönehantering och varningar för känsliga bilagor"], "r-end", ["Makes the same mistake much harder.", "Gör samma misstag mycket svårare."], {
            pushback: [
              pb(["Two half-done projects", "Två halvfärdiga projekt"], ["Secure transfer and attachment warnings together need the whole quarter's budget and more, and the CFO asks whether two half-finished projects beat one finished one. Which do you finish first?", "Säker överföring och varningar för bilagor kräver tillsammans hela kvartalets budget och mer, och ekonomichefen frågar om två halvfärdiga projekt är bättre än ett färdigt. Vilket gör ni klart först?"]),
              pb(["Click-through fatigue", "Klicka-förbi-tröttheten"], ["In the pilot, the warning appears so often for ordinary attachments that people click past it without reading. The CISO asks whether a warning everyone ignores is a control at all. How do you tune it, and who decides what counts as sensitive?", "I testet dyker varningen upp så ofta för vanliga bilagor att folk klickar förbi utan att läsa. Säkerhetschefen frågar om en varning som alla ignorerar alls är en kontroll. Hur finjusterar ni den, och vem avgör vad som räknas som känsligt?"]),
              pb(["Payroll is not the only file", "Lönefilen är inte den enda"], ["HR points out that payroll is not the only sensitive file sent by email: medical certificates, rehabilitation plans, disciplinary letters. Fixing payroll first leaves those on the old path. Is fixing the file that hurt you the same as fixing the risk?", "HR påpekar att lönefilen inte är den enda känsliga fil som mejlas: läkarintyg, rehabiliteringsplaner, disciplinära brev. Att rätta lönen först lämnar dem på den gamla vägen. Är det samma sak att rätta filen som skadade er som att rätta risken?"])
            ]
          }),
          opt(["Training on careful emailing", "Utbildning i att mejla försiktigt"], "r-end", ["Worth doing; it would not have stopped this.", "Värt att göra; det hade inte stoppat det här."], {
            pushback: [
              pb(["What would it have changed?", "Vad hade det ändrat?"], ["The assistant pressed Enter on an autocomplete suggestion in under a second, having worked carefully for two years. The DPO asks what training would have changed in that second. What will you tell {{reg.dpaShort}} you changed?", "Assistenten tryckte Enter på ett förslag på under en sekund, efter två år av noggrant arbete. Dataskyddsombudet frågar vad en utbildning hade ändrat i den sekunden. Vad säger ni till {{reg.dpaShort}} att ni har ändrat?"]),
              pb(["It sounds like a verdict", "Det låter som en dom"], ["Staff read the training as the company's verdict: the problem was people, not systems. The union asks whether the assistant will be first in the room. How do you stop training from feeling like a public reprimand?", "Personalen uppfattar utbildningen som företagets dom: problemet var människor, inte system. Facket frågar om assistenten ska sitta först i rummet. Hur förhindrar ni att utbildningen känns som en offentlig tillrättavisning?"]),
              pb(["The budget is gone", "Budgeten är slut"], ["The training uses the quarter's budget, and the secure transfer is postponed again. Next month's payroll file goes by email, as before. Are you comfortable signing off on that?", "Utbildningen tar kvartalets budget, och den säkra överföringen skjuts upp igen. Nästa månads lönefil går med e-post, som förut. Är ni bekväma med att godkänna det?"])
            ]
          }),
          opt(["Remove sick-leave data from the payroll file", "Ta bort sjukfrånvaron ur lönefilen"], "r-end", ["Reduces harm next time, and fixes nothing else.", "Minskar skadan nästa gång, och rättar inget annat."], {
            pushback: [
              pb(["Payroll needs it", "Lönen behöver det"], ["The payroll provider says sick-leave days affect pay and must reach them somehow. Removing the column means a second file, sent another way. How will that second file travel, and is it any safer?", "Löneleverantören säger att sjukdagar påverkar lönen och måste nå dem på något sätt. Att ta bort kolumnen innebär en andra fil, skickad en annan väg. Hur ska den andra filen färdas, och är den säkrare?"]),
              pb(["Still a breach next time", "Fortfarande en incident nästa gång"], ["Without the sick-leave column, the file still holds personal ID numbers, bank accounts and salaries. The next misdirected email would still be a breach. Have you reduced the harm, or only removed the part that embarrassed you most?", "Utan kolumnen med sjukfrånvaro innehåller filen fortfarande personnummer, bankkonton och löner. Nästa felskickade mejl vore fortfarande en incident. Har ni minskat skadan, eller bara tagit bort det som var mest pinsamt?"]),
              pb(["A different question", "En annan fråga"], ["The regulator's follow-up asks what you changed to stop misdirected email. “We removed one column” answers a different question. How do you present this as enough, and would you believe it yourselves?", "Myndighetens följdfråga gäller vad ni har ändrat för att stoppa felskickad e-post. ”Vi tog bort en kolumn” svarar på en annan fråga. Hur framställer ni det som tillräckligt, och skulle ni själva tro på det?"])
            ]
          })
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
          opt(["Correct the statement and apologise publicly", "Rätta uttalandet och be om ursäkt offentligt"], "x2", ["Necessary, and late.", "Nödvändigt, och sent."], {
            pushback: [
              pb(["Mistake or decision?", "Misstag eller beslut?"], ["The correction must explain why the company said something untrue yesterday. Journalists will ask whether it was a mistake or a decision. Which was it, and who will say so on the record?", "Rättelsen måste förklara varför företaget sa något osant i går. Journalisterna kommer att fråga om det var ett misstag eller ett beslut. Vilket var det, och vem säger det öppet?"]),
              pb(["Staff before press?", "Personalen före pressen?"], ["Staff learned the truth first from colleagues and then from the newspaper. Do they hear your correction before the press does, and how will the people on sick leave hear it?", "Personalen fick veta sanningen först från kollegor och sedan från tidningen. Får de höra er rättelse före pressen, och hur får de sjukskrivna höra den?"]),
              pb(["Apology as evidence", "Ursäkten som bevis"], ["Legal warns that a public apology for the denial confirms, in writing, that health data was exposed and that the company knew. It will be quoted in every complaint. Do you apologise in full, or correct the facts and leave the apology out?", "Juristen varnar för att en offentlig ursäkt för förnekandet skriftligt bekräftar att hälsouppgifter exponerades och att företaget visste om det. Den kommer att citeras i varje klagomål. Ber ni om ursäkt fullt ut, eller rättar ni fakta och utelämnar ursäkten?"])
            ]
          }),
          opt(["Stand by the statement on a technicality", "Stå fast vid uttalandet med en teknisk förklaring"], "x2", ["Makes the next article easier to write.", "Gör nästa artikel lättare att skriva."], {
            pushback: [
              pb(["Which technicality?", "Vilken teknikalitet?"], ["Comms asks what the technicality actually is: that sick-leave days are not “sensitive”? {{person.dpo.name}} says they are health data, by law. Who will stand up and defend that argument in public?", "Kommunikation frågar vad den tekniska förklaringen egentligen är: att sjukdagar inte är ”känsliga”? {{person.dpo.name}} säger att de är hälsouppgifter enligt lag. Vem ska stå upp och försvara det argumentet offentligt?"]),
              pb(["One photo away", "En bild bort"], ["The employee quoted in the article still has the file. A follow-up story with a photo of the sick-leave column would end your technicality in a single picture. Are you prepared for that?", "Den anställda som citeras i artikeln har fortfarande filen. En uppföljning med en bild av kolumnen med sjukfrånvaro skulle avsluta er tekniska förklaring med en enda bild. Är ni beredda på det?"]),
              pb(["What else aren't they saying?", "Vad mer säger de inte?"], ["Staff saw the sick-leave column themselves and have now read your statement. A manager reports that their team asks what else the company is not telling them. How do you lead people who know you said something untrue?", "Personalen såg kolumnen med sjukfrånvaro själva och har nu läst ert uttalande. En chef berättar att teamet frågar vad mer företaget inte berättar. Hur leder ni människor som vet att ni sa något osant?"])
            ]
          })
        ])
      }),
      pg("x2", ["Staff go to the regulator", "Personalen går till tillsynsmyndigheten"], [
        "The next morning, the regulator receives eleven complaints from employees, several of them on sick leave, each attaching the article and your denial.\n\nThe union announces that it has advised members to complain individually. {{person.dpo.name}} points out that a notification now will arrive after the complaints, and will be read alongside them.",
        "Nästa morgon tar tillsynsmyndigheten emot elva klagomål från anställda, flera av dem sjukskrivna, som alla bifogar artikeln och ert förnekande.\n\nFacket meddelar att det har rått medlemmarna att klaga var för sig. {{person.dpo.name}} påpekar att en anmälan nu kommer fram efter klagomålen, och kommer att läsas tillsammans med dem."
      ], {
        choice: ask(["What do you do now?", "Vad gör ni nu?"], ["Notifies at once with a full timeline and cooperates.", "Anmäler omedelbart med en fullständig tidslinje och samarbetar."], [
          opt(["Notify today with a full, honest timeline", "Anmäl i dag med en fullständig och ärlig tidslinje"], "x3", ["The only option left that helps.", "Det enda alternativ som återstår som hjälper."], {
            pushback: [
              pb(["The denial goes in too", "Förnekandet ska också med"], ["A full timeline has to include the statement to the journalist, when it was made and who approved it. Legal suggests leaving that part out, since it concerns the press, not the data. Is a timeline without it full and honest?", "En fullständig tidslinje måste ta med uttalandet till journalisten, när det gjordes och vem som godkände det. Juristen föreslår att den delen utelämnas, eftersom den handlar om pressen och inte om datan. Är en tidslinje utan den fullständig och ärlig?"]),
              pb(["After eleven complaints", "Efter elva klagomål"], ["{{reg.dpaShort}} already has eleven complaints. Whatever it says, your notification will be read as a reaction to them. How do you write it so it reads as cooperation, not damage control?", "{{reg.dpaShort}} har redan elva klagomål. Vad den än säger kommer er anmälan att läsas som en reaktion på dem. Hur skriver ni den så att den läses som samarbete och inte som skadebegränsning?"]),
              pb(["The gaps show", "Luckorna syns"], ["Writing the full timeline today exposes questions you have not closed, such as where the copies outside the company are now. Do you send it today with those gaps visible, or take one more day to close them?", "När ni skriver hela tidslinjen i dag syns frågor ni inte har stängt, till exempel var kopiorna utanför företaget finns nu. Skickar ni den i dag med luckorna synliga, eller tar ni en dag till för att stänga dem?"])
            ]
          }),
          opt(["Wait for the regulator to contact you", "Vänta på att tillsynsmyndigheten kontaktar er"], "x3", ["They will, and they will ask about the delay.", "Det kommer de att göra, och de kommer att fråga om dröjsmålet."], {
            pushback: [
              pb(["A joint complaint", "Ett gemensamt klagomål"], ["The union says that if the company will not notify, it will help members submit a joint complaint describing the denial in detail. Your silence becomes their account of events. Is waiting still the safer option?", "Facket säger att om företaget inte anmäler hjälper det medlemmarna att lämna ett gemensamt klagomål som beskriver förnekandet i detalj. Er tystnad blir deras berättelse. Är det fortfarande säkrast att vänta?"]),
              pb(["What the DPO will say", "Vad dataskyddsombudet säger"], ["{{person.dpo.name}} reminds you they are the regulator's contact point, and will not pretend the company is unaware if asked directly. What will you instruct them to say when the call comes, and will they say it?", "{{person.dpo.name}} påminner om att hen är kontaktpunkt mot tillsynsmyndigheten, och inte tänker låtsas att företaget är omedvetet om hen får en direkt fråga. Vad ska ni be hen säga när samtalet kommer, och kommer hen att säga det?"]),
              pb(["Every day is another question", "Varje dag är en fråga till"], ["The 72 hours ran out long ago, and each further day is one more the regulator will ask about. What reason for the delay would you put in writing today?", "De 72 timmarna gick ut för länge sedan, och varje ytterligare dag är en till som myndigheten kommer att fråga om. Vilket skäl för dröjsmålet skulle ni skriva ner i dag?"])
            ]
          })
        ])
      }),
      pg("x3", ["The board", "Styrelsen"], [
        "The chair of the board calls the CEO. The board learned about the file from the newspaper, and about the denial from the second newspaper.\n\nThey want to know who approved the statement to the journalist, and why. They also want to know what the company will say to the regulator, which has asked for a meeting next week.",
        "Styrelseordföranden ringer vd. Styrelsen fick veta om filen från tidningen, och om förnekandet från den andra tidningen.\n\nDe vill veta vem som godkände uttalandet till journalisten, och varför. De vill också veta vad företaget ska säga till tillsynsmyndigheten, som har begärt ett möte nästa vecka."
      ], {
        choice: ask(["How do you face the board?", "Hur möter ni styrelsen?"], ["Gives the board the full timeline, including the denial and who approved it.", "Ger styrelsen hela tidslinjen, inklusive förnekandet och vem som godkände det."], [
          opt(["The full timeline, including who approved the denial", "Hela tidslinjen, inklusive vem som godkände förnekandet"], "x4", ["Painful and necessary.", "Smärtsamt och nödvändigt."], {
            pushback: [
              pb(["They are in the room", "Hen sitter i rummet"], ["The person who approved the denial is sitting at this table. Naming them to the board may end their role. Do you name them, or call it a collective decision, and would that be true?", "Personen som godkände förnekandet sitter vid det här bordet. Att namnge hen inför styrelsen kan kosta hen tjänsten. Namnger ni hen, eller kallar ni det ett gemensamt beslut, och vore det sant?"]),
              pb(["Paper travels", "Papper sprids"], ["A written timeline naming who approved the denial will be in the board papers, and the story is already in the press. If it leaks, the names become tomorrow's headline. Do you put it in writing anyway, or brief the board orally?", "En skriftlig tidslinje som namnger den som godkände förnekandet hamnar i styrelsehandlingarna, och nyheten finns redan i pressen. Om den läcker blir namnen morgondagens rubrik. Skriver ni ändå, eller informerar ni styrelsen muntligt?"]),
              pb(["“And then what?”", "”Och sedan då?”"], ["The chair asks the obvious next question: if someone senior approved the denial, what happens to them now? The board expects an answer, not a process. Are you ready to give one tonight?", "Ordföranden ställer den självklara följdfrågan: om någon i ledningen godkände förnekandet, vad händer med hen nu? Styrelsen väntar sig ett svar, inte en process. Är ni redo att ge ett i kväll?"])
            ]
          }),
          opt(["A summary focused on the technical fix", "En sammanfattning som fokuserar på den tekniska åtgärden"], "x4", ["The board has read the newspapers.", "Styrelsen har läst tidningarna."], {
            pushback: [
              pb(["The first question", "Den första frågan"], ["The chair's first question is about the denial, not the email client. Your summary does not mention it. Do you answer from the summary, or put it aside and start again in front of the board?", "Ordförandens första fråga handlar om förnekandet, inte om e-postprogrammet. Er sammanfattning nämner det inte. Svarar ni utifrån sammanfattningen, eller lägger ni den åt sidan och börjar om inför styrelsen?"]),
              pb(["It will be minuted", "Det protokollförs"], ["What the board is told goes into the minutes. If the regulator later sees board minutes that leave out the denial, it will look as if the company hid it from its own board. Do you want that on record?", "Det styrelsen får höra hamnar i protokollet. Om myndigheten senare ser ett styrelseprotokoll där förnekandet saknas ser det ut som att företaget dolde det för sin egen styrelse. Vill ni ha det i protokollet?"]),
              pb(["The board has its own source", "Styrelsen har en egen källa"], ["One board member says an employee contacted them directly about the file and the statement. The board may already know more than your summary says. How do you handle being corrected by your own board?", "En ledamot säger att en anställd har hört av sig direkt om filen och uttalandet. Styrelsen kan redan veta mer än er sammanfattning säger. Hur hanterar ni att bli rättade av er egen styrelse?"])
            ]
          })
        ])
      }),
      pg("x4", ["The meeting with the regulator", "Mötet med tillsynsmyndigheten"], [
        "The regulator's case officer is courteous and thorough. They have the complaints, the articles, your late notification and the original statement to the press.\n\nTheir questions are not about the email client. They are about the decision to deny, and about what the company did for the employees whose health data was shared.",
        "Myndighetens handläggare är artig och noggrann. Hen har klagomålen, artiklarna, er sena anmälan och det ursprungliga uttalandet till pressen.\n\nFrågorna handlar inte om e-postprogrammet. De handlar om beslutet att förneka, och om vad företaget gjorde för de anställda vars hälsouppgifter delades."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Answers fully and accepts responsibility for the denial.", "Svarar fullständigt och tar ansvar för förnekandet."], [
          opt(["Answer fully and accept responsibility", "Svara fullständigt och ta ansvar"], "e5", ["It does not undo the week, but it helps.", "Det gör inte veckan ogjord, men det hjälper."], {
            pushback: [
              pb(["Your lawyers object", "Era jurister invänder"], ["Your lawyers advise that accepting responsibility in the meeting could increase any fine and strengthen employees' claims. They want to review every answer first. Do you follow the advice, or speak as you planned?", "Era jurister avråder: att ta ansvar på mötet kan höja en eventuell sanktionsavgift och stärka de anställdas krav. De vill granska varje svar först. Följer ni rådet, eller talar ni som ni hade tänkt?"]),
              pb(["“Who decided?”", "”Vem beslutade?”"], ["The case officer asks who decided to deny. The person who approved it is sitting beside you. Who answers that question, and in what words?", "Handläggaren frågar vem som beslutade att förneka. Personen som godkände det sitter bredvid er. Vem svarar på frågan, och med vilka ord?"]),
              pb(["Responsibility for what?", "Ansvar för vad?"], ["Accepting responsibility invites the follow-up: what has the company done for the employees whose health data was shared? If the honest answer is “not much yet”, is accepting responsibility enough without a plan to show?", "Att ta ansvar bjuder in följdfrågan: vad har företaget gjort för de anställda vars hälsouppgifter delades? Om det ärliga svaret är ”inte mycket än”, räcker det att ta ansvar utan en plan att visa?"])
            ]
          }),
          opt(["Let lawyers answer in writing", "Låt jurister svara skriftligt"], "e5", ["Reads as if there is more to hide.", "Uppfattas som att det finns mer att dölja."], {
            pushback: [
              pb(["Noted in the file", "Antecknat i ärendet"], ["The case officer says they had expected to hear from the people who made the decisions, and notes your choice in the case file. Is a written legal answer worth that note?", "Handläggaren säger att hen hade väntat sig att få höra dem som fattade besluten, och antecknar ert val i ärendet. Är ett skriftligt juridiskt svar värt den anteckningen?"]),
              pb(["Staff see it again", "Personalen ser det igen"], ["The union hears that the company sent lawyers instead of managers and tells its members. To staff it looks like the denial again, in a different form. How do you explain this choice internally?", "Facket får veta att företaget skickade jurister i stället för chefer och berättar det för medlemmarna. För personalen ser det ut som förnekandet igen, i en annan form. Hur förklarar ni det valet internt?"]),
              pb(["A longer story", "En längre historia"], ["Written answers through lawyers take weeks to draft, and the regulator keeps sending questions. The case stays open, and in the news, for longer. Is control over the wording worth a longer story?", "Skriftliga svar via jurister tar veckor att formulera, och myndigheten fortsätter att skicka frågor. Ärendet förblir öppet, och i nyheterna, längre. Är kontrollen över formuleringarna värd en längre historia?"])
            ]
          })
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
