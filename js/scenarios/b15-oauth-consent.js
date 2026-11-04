/*
 * b15-oauth-consent.js — "QuickSign" (branching, OAuth consent phishing).
 *
 * Thirty staff click "Accept" on a convincing "QuickSign PDF" app that asks to
 * read their mail and files. No password is stolen; the app simply has
 * permission. Spine: first move → no password needed → consent settings →
 * hidden rules → the data and the regulator → a customer's email → every
 * other app → the platform → the thirty → what changes. Break-away at § "A
 * customer's email": keeping quiet.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, pb, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b15-oauth-consent",
    version: 1,
    format: "branching",
    category: "oauth-consent",
    archetype: "ambiguous-start",
    emblem: "oauth",
    title: L(["QuickSign", "QuickSign"]),
    summary: L([
      "Thirty colleagues clicked “Accept” on a document-signing app. Nobody gave away a password, and resetting passwords will not help. The app simply has permission to read everything, and it is using it.",
      "Trettio kollegor klickade på ”Godkänn” för en app för dokumentsignering. Ingen lämnade ut något lösenord, och lösenordsbyten hjälper inte. Appen har helt enkelt behörighet att läsa allt, och den använder den."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Recognise and remove access granted by consent, not by stolen passwords", "Känna igen och ta bort åtkomst som getts genom samtycke, inte genom stulna lösenord"]), teaser: L(["A door opened from the inside", "En dörr som öppnats inifrån"]) },
      { id: "lo2", text: L(["Scope what an app read and what it changed", "Kartlägga vad en app läste och vad den ändrade"]), teaser: L(["Following quiet footsteps", "Att följa tysta fotsteg"]) },
      { id: "lo3", text: L(["Protect customers from fraud using your hijacked threads", "Skydda kunder mot bedrägerier via era kapade e-posttrådar"]), teaser: L(["Your name in someone else's hands", "Ert namn i någon annans händer"]) },
      { id: "lo4", text: L(["Control which apps can be connected to your platform", "Styra vilka appar som kan kopplas till er plattform"]), teaser: L(["Who is allowed in", "Vem som släpps in"]) }
    ],
    mitre: ["T1566.002", "T1528", "T1550.001", "T1114", "T1564.008"],
    frameworks: {
      nistCsf: ["PR.AA", "PR.AT", "PR.PS", "DE.CM", "RS.AN", "RS.MI", "RS.CO"],
      iso27001: ["A.5.15", "A.5.18", "A.5.23", "A.5.24", "A.6.3", "A.8.5", "A.8.16"]
    },
    constraints: { startWindow: "business-hours" },
    actor: { types: ["criminal"], motivation: L(["Financial: invoice fraud using hijacked email threads", "Ekonomisk: fakturabedrägeri med kapade e-posttrådar"]), capability: "medium" },
    variables: {
      users: { min: 8, max: 60 },
      files: { min: 400, max: 20000, scaleBy: "size", step: 100 },
      apps: { min: 60, max: 600, scaleBy: "size", step: 10 }
    },
    roles: ["incidentCommander", "ciso", "socLead", "itOps", "cfo", "dpo", "legal", "comms", "hr", "serviceOwner"],

    flags: {
      appRestored: L(["App re-enabled for finance", "Appen påslagen igen för ekonomi"]),
      appRevoked: L(["App and its tokens revoked company-wide", "Appen och dess token återkallade i hela företaget"]),
      scoped: L(["Full audit of what the app accessed", "Fullständig granskning av vad appen kom åt"]),
      consentLocked: L(["Admin approval required for new apps", "Administratörsgodkännande krävs för nya appar"]),
      usersBlamed: L(["Users blamed", "Användarna skuldbelagda"]),
      rulesRemoved: L(["Hidden mail rules hunted and removed", "Dolda e-postregler eftersökta och borttagna"]),
      notified: L(["Notified the regulator in time", "Anmält till tillsynsmyndigheten i tid"]),
      notifyLate: L(["Notification delayed", "Anmälan försenad"]),
      customersWarned: L(["Customers in active threads warned", "Kunder i aktiva trådar varnade"]),
      allAppsReviewed: L(["All connected apps reviewed", "Alla anslutna appar granskade"]),
      vendorReported: L(["App reported to the platform", "Appen rapporterad till plattformen"])
    },

    start: "c1",
    pages: [
      pg("c1", ["An app called QuickSign", "En app som heter QuickSign"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The SOC sees something new: an app called “QuickSign PDF” has been granted access by {{num.users}} staff in the last hour. It can read and send their email, read their files, and keep that access while they are offline.\n\nAll of them received the same email: “Your updated contract is ready to sign.” They clicked, saw a familiar-looking sign-in screen, and pressed Accept.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. SOC ser något nytt: en app som heter ”QuickSign PDF” har fått åtkomst av {{num.users}} anställda den senaste timmen. Den kan läsa och skicka deras e-post, läsa deras filer och behålla åtkomsten när de är frånkopplade.\n\nAlla fick samma mejl: ”Ditt uppdaterade avtal är klart att signera.” De klickade, såg en bekant inloggningsskärm och tryckte på Godkänn."
      ], {
        injects: [
          inj("b15-1", 0, "siemAlert", "soc", "high", "confirmed", [
            "New application consent: “QuickSign PDF” (publisher: unverified). Permissions: Mail.ReadWrite, Mail.Send, Files.Read.All, offline_access. Consented by {{num.users}} users in 58 minutes.",
            "Nytt appsamtycke: ”QuickSign PDF” (utgivare: ej verifierad). Behörigheter: Mail.ReadWrite, Mail.Send, Files.Read.All, offline_access. Samtycke från {{num.users}} användare på 58 minuter."
          ], { tests: ["lo1"] })
        ],
        discuss: [q("If nobody gave away a password, what exactly did they give away?", "Om ingen lämnade ut något lösenord, vad lämnade de då ut?", ["socLead"])],
        facilitator: { notes: L(["Many groups reach for password resets. Let them, then show it changes nothing.", "Många grupper tar till lösenordsbyten. Låt dem, och visa sedan att det inte ändrar något."]) },
        choice: ask(["What do you do first?", "Vad gör ni först?"], ["Revokes the app and its tokens for everyone, not the users' passwords.", "Återkallar appen och dess token för alla, inte användarnas lösenord."], [
          opt(["Disable the app and revoke its tokens company-wide", "Inaktivera appen och återkalla dess token i hela företaget"], "c2", ["Cuts the access at the source.", "Kapar åtkomsten vid källan."], {
            set: "appRevoked",
            pushback: [
              pb(["Tipping them off", "Att varna angriparen"], ["The SOC lead points out that revoking now tells whoever runs the app that they have been seen. Watching for an hour would show what they are after and where the data goes. Do you cut the access now, or let it run while you learn more?", "SOC-chefen påpekar att en återkallelse nu talar om för den som styr appen att de har upptäckts. En timmes bevakning skulle visa vad de är ute efter och vart datan tar vägen. Kapar ni åtkomsten nu, eller låter ni den löpa medan ni lär er mer?"]),
              pb(["“That might be ours”", "”Den kan vara vår”"], ["A sales manager calls: the team was told this week to start using a new signing tool with a customer, and they think this is it. Revoking it company-wide would stop deals being signed today. Do you cut off something that might be legitimate on the strength of one alert?", "En försäljningschef ringer: teamet fick i veckan besked om att börja använda ett nytt signeringsverktyg med en kund, och de tror att det är det här. En återkallelse i hela företaget stoppar avtal som ska signeras i dag. Kapar ni något som kan vara legitimt på grund av ett enda larm?"]),
              pb(["Nobody has done this", "Ingen har gjort det förut"], ["{{person.itOps.name}} has never revoked an app for the whole company. The console warns that the action affects every user and every integration tied to the app. Do you press the button on a setting nobody in the room has tested, or spend time reading up first?", "{{person.itOps.name}} har aldrig återkallat en app för hela företaget. Konsolen varnar för att åtgärden påverkar alla användare och alla integrationer som hör till appen. Trycker ni på knappen för en inställning som ingen i rummet har testat, eller läser ni på först?"])
            ]
          }),
          opt(["Reset the passwords of the users who consented", "Återställ lösenorden för användarna som gav samtycke"], "c2", ["Feels decisive. The app's tokens keep working.", "Känns kraftfullt. Appens token fortsätter att fungera."], {
            pushback: [
              pb(["Thirty people locked out", "Trettio personer utelåsta"], ["The resets lock {{num.users}} people out in the middle of the working day. The helpdesk line is jammed and several of them had customer meetings this afternoon. Is the disruption buying you the protection you think it is?", "Återställningarna låser ute {{num.users}} personer mitt under arbetsdagen. Supportlinjen är överbelastad och flera av dem hade kundmöten i eftermiddag. Köper störningen er verkligen det skydd ni tror?"]),
              pb(["Still reading", "Läser fortfarande"], ["Twenty minutes after the resets, the SOC sees QuickSign PDF still reading mail from one of the accounts whose password was just changed. Nothing in its activity has slowed down. What exactly did the resets cut off, and what do you do now?", "Tjugo minuter efter återställningarna ser SOC att QuickSign PDF fortfarande läser e-post från ett av kontona vars lösenord just byttes. Inget i dess aktivitet har saktat ner. Vad var det egentligen återställningarna kapade, och vad gör ni nu?"]),
              pb(["Why is the app still approved?", "Varför är appen fortfarande godkänd?"], ["{{person.socLead.name}} asks why QuickSign itself is still listed in the platform with all its permissions. Resetting passwords treats the users as the problem and leaves the app alone. Who in the room decided the app can stay?", "{{person.socLead.name}} frågar varför QuickSign själv fortfarande finns listad i plattformen med alla sina behörigheter. Lösenordsbytena behandlar användarna som problemet och lämnar appen orörd. Vem i rummet beslutade att appen får vara kvar?"])
            ]
          }),
          opt(["Block the sender's domain", "Blockera avsändarens domän"], "c2", ["Stops new victims. Existing access remains.", "Stoppar nya offer. Befintlig åtkomst finns kvar."], {
            pushback: [
              pb(["A new sender", "En ny avsändare"], ["Within the hour, the same “contract ready to sign” email arrives from a different domain, and a user forwards it to the SOC asking whether it is safe. Your block caught nothing. Do you keep blocking domains one by one, or change what you are aiming at?", "Inom en timme kommer samma mejl om att ”avtalet är klart att signera” från en annan domän, och en användare vidarebefordrar det till SOC och frågar om det är säkert. Er spärr fångade ingenting. Fortsätter ni spärra domäner en i taget, eller byter ni mål?"]),
              pb(["The thirty are still open", "De trettio är fortfarande öppna"], ["{{person.socLead.name}} points out that blocking the domain does nothing to the access the app already has. It is reading {{num.users}} mailboxes right now, and the block does not touch it. What are you doing about the door that is already open?", "{{person.socLead.name}} påpekar att en domänspärr inte gör något åt den åtkomst appen redan har. Den läser {{num.users}} brevlådor just nu, och spärren rör den inte. Vad gör ni åt dörren som redan står öppen?"]),
              pb(["The email is already delivered", "Mejlet är redan levererat"], ["The phishing email is already sitting in hundreds of inboxes, and blocking the domain does not pull a single copy back. People are still opening it. Do you also remove it and warn all staff, and who sends that warning without spreading panic?", "Nätfiskemejlet ligger redan i hundratals inkorgar, och domänspärren drar inte tillbaka ett enda exemplar. Folk öppnar det fortfarande. Tar ni också bort det och varnar all personal, och vem skickar den varningen utan att sprida panik?"])
            ]
          })
        ])
      }),

      pg("c2", ["No password needed", "Inget lösenord behövs"], [
        "{{person.itOps.name}} explains what happened. The users did not sign in to a fake site; they signed in to your real platform, which then asked whether a third-party app could access their data. They said yes.\n\nThe app received tokens that work without a password and renew themselves. Changing a password does not cancel them. Only revoking the app's permission does.",
        "{{person.itOps.name}} förklarar vad som hände. Användarna loggade inte in på en falsk webbplats; de loggade in på er riktiga plattform, som sedan frågade om en tredjepartsapp fick komma åt deras data. De sa ja.\n\nAppen fick token som fungerar utan lösenord och förnyar sig själva. Ett lösenordsbyte upphäver dem inte. Det gör bara en återkallelse av appens behörighet."
      ], {
        variants: [vr("appRevoked", [
          "The app is disabled and its tokens revoked. {{person.itOps.name}} explains why that was the right lever: the users signed in to your real platform, which asked whether a third-party app could access their data. They said yes.\n\nThe app's tokens worked without a password and renewed themselves. A password reset would have left them working. Now the question is what the app did while it had access.",
          "Appen är inaktiverad och dess token återkallade. {{person.itOps.name}} förklarar varför det var rätt åtgärd: användarna loggade in på er riktiga plattform, som frågade om en tredjepartsapp fick komma åt deras data. De sa ja.\n\nAppens token fungerade utan lösenord och förnyade sig själva. Ett lösenordsbyte hade låtit dem fungera vidare. Nu är frågan vad appen gjorde medan den hade åtkomst."
        ], ["Because you revoked the app, its access ended immediately.", "Eftersom ni återkallade appen upphörde dess åtkomst omedelbart."])],
        choice: ask(["What do you look at next?", "Vad tittar ni på härnäst?"], ["Audits everything the app read and changed.", "Granskar allt appen läste och ändrade."], [
          opt(["Audit everything the app accessed and changed", "Granska allt appen kom åt och ändrade"], "l1", ["The only way to know the damage.", "Det enda sättet att få veta skadan."], {
            set: "scoped",
            pushback: [
              pb(["Days, not hours", "Dagar, inte timmar"], ["{{person.itOps.name}} estimates a full audit will take the team days, and they are the same people who are needed for containment and for the helpdesk. Do you take them off everything else for this, and what goes undone while they dig?", "{{person.itOps.name}} uppskattar att en fullständig granskning tar teamet flera dagar, och det är samma personer som behövs för inneslutning och support. Tar ni bort dem från allt annat för det här, och vad blir ogjort medan de gräver?"]),
              pb(["Reading colleagues' mail", "Att läsa kollegors e-post"], ["HR objects: auditing everything the app read means your security team will go through the private mail and HR files of {{num.users}} colleagues. Some of them are already asking who will see their messages. Who is allowed to look, and how do you justify it to them?", "HR invänder: att granska allt appen läste innebär att säkerhetsteamet går igenom privat e-post och HR-filer för {{num.users}} kollegor. En del frågar redan vem som kommer att se deras meddelanden. Vem får titta, och hur motiverar ni det för dem?"]),
              pb(["Looking back, not forward", "Att titta bakåt, inte framåt"], ["{{person.socLead.name}} argues that an audit is backward-looking: it tells you what happened, not what is still happening. The SOC would rather hunt for anything the app is doing right now. Do you put your few analysts on history or on the present?", "{{person.socLead.name}} menar att en granskning tittar bakåt: den visar vad som hänt, inte vad som fortfarande pågår. SOC vill hellre jaga det appen gör just nu. Sätter ni era få analytiker på historiken eller på nuet?"])
            ]
          }),
          opt(["Check a sample of the affected mailboxes", "Kontrollera ett urval av de drabbade brevlådorna"], "l1", ["Faster, and partial.", "Snabbare, och ofullständigt."], {
            pushback: [
              pb(["A clean sample", "Ett rent urval"], ["The five mailboxes you checked show only reading: nothing sent, nothing changed. It is tempting to call that good news. Is a clean sample evidence of a clean incident, or only of the five mailboxes you happened to pick?", "De fem brevlådorna ni kontrollerade visar bara läsning: inget skickat, inget ändrat. Det är frestande att kalla det goda nyheter. Är ett rent urval bevis för en ren incident, eller bara för de fem brevlådor ni råkade välja?"]),
              pb(["The DPO needs numbers", "Dataskyddsombudet behöver siffror"], ["{{person.dpo.name}} says a sample cannot tell you how many people's data was read, and that number will be the first question in any breach notification. How do you defend a sample when someone asks for a total?", "{{person.dpo.name}} säger att ett urval inte kan visa hur många personers uppgifter som lästes, och den siffran blir första frågan i en incidentanmälan. Hur försvarar ni ett urval när någon frågar efter en totalsiffra?"]),
              pb(["Who chose the sample?", "Vem valde urvalet?"], ["The sample happens to be the mailboxes of people the SOC could reach quickly, mostly in one department. Others had different jobs and different data. If the app behaved differently elsewhere, how would your sample ever show it?", "Urvalet råkar vara brevlådorna för de personer SOC nådde snabbt, mest på en avdelning. Andra har andra jobb och andra data. Om appen betedde sig annorlunda på andra håll, hur skulle ert urval någonsin visa det?"])
            ]
          }),
          opt(["Ask the users what they remember", "Fråga användarna vad de minns"], "c3b", ["Human, and they did not see what the app did.", "Mänskligt, och de såg inte vad appen gjorde."], {
            pushback: [
              pb(["Nothing to remember", "Inget att minnas"], ["The first five interviews say the same thing: an email, a sign-in screen, a click on Accept, and then nothing. An hour has gone. What will the next {{num.users}} conversations tell you that the platform's own logs would not?", "De fem första intervjuerna säger samma sak: ett mejl, en inloggningsskärm, ett klick på Godkänn, och sedan ingenting. En timme har gått. Vad kommer de kommande samtalen att berätta som plattformens egna loggar inte skulle göra?"]),
              pb(["The rumour spreads", "Ryktet sprids"], ["Once HR starts calling people one by one, word spreads that “a list of names” exists. Staff who were not contacted start asking whether they are in trouble too. Did you mean to start an investigation of people rather than of an app?", "När HR börjar ringa folk ett i taget sprids det att det finns ”en lista med namn”. Personal som inte kontaktats börjar fråga om de också är illa ute. Var det meningen att starta en utredning av människor snarare än av en app?"]),
              pb(["Nobody is reading the logs", "Ingen läser loggarna"], ["{{person.socLead.name}} notes that the platform has recorded every message and file the app touched, and nobody is looking at that record while the interviews go on. Who is checking what the app actually did, and when?", "{{person.socLead.name}} påpekar att plattformen har loggat varje meddelande och fil appen rört, och att ingen tittar på den loggen medan intervjuerna pågår. Vem kontrollerar vad appen faktiskt gjorde, och när?"])
            ]
          })
        ])
      }),

      pg("l1", ["What it read", "Vad den läste"], [
        "The audit log is long. In under two hours, the app read every message in {{num.users}} mailboxes and downloaded {{num.files|number}} files from their shared drives: HR documents, finance spreadsheets, customer contracts.\n\nIt also created something in four mailboxes, all of them in finance or sales. The log calls it an inbox rule.",
        "Granskningsloggen är lång. På under två timmar läste appen varje meddelande i {{num.users}} brevlådor och laddade ner {{num.files|number}} filer från deras delade mappar: HR-dokument, ekonomikalkyler, kundavtal.\n\nDen skapade också något i fyra brevlådor, alla inom ekonomi eller försäljning. Loggen kallar det en inkorgsregel."
      ], {
        long: true,
        skipTo: "c3",
        chart: { id: "b15-kpi", type: "kpi", title: L(["What the app reached", "Vad appen nådde"]), data: kpi([
          { id: "k1", label: ["Users who consented", "Användare som gav samtycke"], value: (v) => v.users, tone: "warn" },
          { id: "k2", label: ["Files downloaded", "Nedladdade filer"], value: (v) => v.files, tone: "danger" },
          { id: "k3", label: ["Mailboxes with new rules", "Brevlådor med nya regler"], value: 4, tone: "danger" }
        ]) },
        choice: ask(["How far do you scope?", "Hur långt kartlägger ni?"], ["Classifies the files and messages read, so notification and customer decisions rest on facts.", "Klassificerar filerna och meddelandena som lästes, så att beslut om anmälan och kunder vilar på fakta."], [
          opt(["Classify everything read and downloaded", "Klassificera allt som lästes och laddades ner"], "c3", ["Days of work, and the basis for every later decision.", "Flera dagars arbete, och grunden för varje senare beslut."], {
            set: "scoped",
            pushback: [
              pb(["The rules are waiting", "Reglerna väntar"], ["While the team works through {{num.files|number}} files, nobody has yet opened the inbox rules in the four mailboxes. Those were changes, not just reading. Is the file inventory really more urgent than understanding what the app left behind?", "Medan teamet går igenom {{num.files|number}} filer har ingen ännu öppnat inkorgsreglerna i de fyra brevlådorna. De var ändringar, inte bara läsning. Är filinventeringen verkligen mer brådskande än att förstå vad appen lämnade efter sig?"]),
              pb(["Who opens the HR files?", "Vem öppnar HR-filerna?"], ["Classifying means someone must open salary lists, sick notes and performance reviews. {{person.hr.name}} does not want the IT team reading them, and the IT team does not want to either. Who classifies the most sensitive files, and how long will that take?", "Klassificering innebär att någon måste öppna lönelistor, sjukintyg och medarbetarbedömningar. {{person.hr.name}} vill inte att IT-teamet läser dem, och IT-teamet vill inte heller. Vem klassificerar de känsligaste filerna, och hur lång tid tar det?"]),
              pb(["The clock runs meanwhile", "Klockan går under tiden"], ["{{person.dpo.name}} reminds you that the notification clock started when you became aware of the breach, not when the classification ends. The classification will take days. Do you let the inventory decide the timing of everything else?", "{{person.dpo.name}} påminner om att klockan för anmälan startade när ni fick kännedom om incidenten, inte när klassificeringen är klar. Klassificeringen tar flera dagar. Låter ni inventeringen styra tidpunkten för allt annat?"])
            ]
          }),
          opt(["Estimate from the file names", "Uppskatta utifrån filnamnen"], "c3", ["Quick, and often wrong.", "Snabbt, och ofta fel."], {
            pushback: [
              pb(["Names lie", "Namn ljuger"], ["A quick spot-check of ten files finds three with personal data their names never suggested: “notes_final.xlsx” holds staff ID numbers. Would you sign a breach assessment built on file names after seeing that?", "En snabb stickprovskontroll av tio filer hittar tre med personuppgifter som namnen aldrig antydde: ”anteckningar_slutlig.xlsx” innehåller personnummer. Skulle ni skriva under en incidentbedömning byggd på filnamn efter det?"]),
              pb(["Mail has no file names", "E-post har inga filnamn"], ["File names cover the shared drives, but the app also read every message in {{num.users}} mailboxes, and mail has no file names. Your estimate says nothing about them. How do you estimate what was in those inboxes?", "Filnamn täcker de delade mapparna, men appen läste också varje meddelande i {{num.users}} brevlådor, och e-post har inga filnamn. Er uppskattning säger ingenting om dem. Hur uppskattar ni vad som fanns i de inkorgarna?"]),
              pb(["The DPO will not sign", "Dataskyddsombudet skriver inte under"], ["{{person.dpo.name}} says plainly that an estimate from file names is not something they will put their name to. If the regulator asks how you know what was taken, the answer would be “we guessed”. Do you overrule the DPO, or pay for the full classification?", "{{person.dpo.name}} säger rakt ut att en uppskattning utifrån filnamn inte är något hen sätter sitt namn på. Om tillsynsmyndigheten frågar hur ni vet vad som togs blir svaret ”vi gissade”. Kör ni över dataskyddsombudet, eller betalar ni för den fullständiga klassificeringen?"])
            ]
          })
        ])
      }),

      pg("c3", ["Anyone can say yes", "Vem som helst kan säga ja"], [
        "{{person.ciso.name}} checks the platform's settings. Any employee can grant any app access to their own mail and files, without asking anyone. It has been that way since the company moved to the platform.\n\nIt is the default setting. It is also the reason a single convincing email could open thirty mailboxes in an hour.",
        "{{person.ciso.name}} kontrollerar plattformens inställningar. Vilken anställd som helst kan ge vilken app som helst åtkomst till sin egen e-post och sina filer, utan att fråga någon. Det har varit så sedan företaget flyttade till plattformen.\n\nDet är standardinställningen. Det är också anledningen till att ett enda övertygande mejl kunde öppna trettio brevlådor på en timme."
      ], {
        choice: ask(["Do you change the setting?", "Ändrar ni inställningen?"], ["Requires admin approval for apps asking for broad access, with a fast request route.", "Kräver administratörsgodkännande för appar som begär bred åtkomst, med en snabb väg för förfrågningar."], [
          opt(["Require admin approval for apps that request broad access", "Kräv administratörsgodkännande för appar som begär bred åtkomst"], "c4", ["Closes the door; needs a quick approval route.", "Stänger dörren; kräver en snabb godkännandeväg."], {
            set: "consentLocked",
            pushback: [
              pb(["The first morning's queue", "Kön första morgonen"], ["By the next morning there are twenty-five approval requests, for apps people use every day, and one administrator to handle them. Staff are already complaining that their tools stopped asking and started waiting. Who approves, how fast, and on what criteria?", "Nästa morgon finns tjugofem godkännandeförfrågningar, för appar som folk använder varje dag, och en administratör som ska hantera dem. Personalen klagar redan på att verktygen slutat fråga och börjat vänta. Vem godkänner, hur snabbt och efter vilka kriterier?"]),
              pb(["Sales wants an exception", "Försäljning vill ha ett undantag"], ["The head of sales says customers regularly send them tools to connect, and a deal is waiting on one right now. They ask for sales to be exempt from the approval step. Do you make an exception for the team that handles the most outside email?", "Försäljningschefen säger att kunder ofta skickar verktyg som ska kopplas in, och att en affär väntar på ett sådant just nu. Hen vill att försäljning undantas från godkännandesteget. Gör ni ett undantag för det team som hanterar mest extern e-post?"]),
              pb(["Only future consents", "Bara framtida samtycken"], ["{{person.itOps.name}} points out that the new setting only applies to consents given from now on. Every app already connected keeps exactly the access it has today. Does changing the setting give you a false sense that the door is closed?", "{{person.itOps.name}} påpekar att den nya inställningen bara gäller samtycken som ges från och med nu. Varje app som redan är ansluten behåller exakt den åtkomst den har i dag. Ger inställningsändringen er en falsk känsla av att dörren är stängd?"])
            ]
          }),
          opt(["Block this one publisher", "Blockera just den här utgivaren"], "c4", ["The next app will have a different name.", "Nästa app kommer att ha ett annat namn."], {
            pushback: [
              pb(["There is no publisher", "Det finns ingen utgivare"], ["The platform lists the publisher as “unverified”: there is no real name to block, only this one app's identifier. Whoever made it can register another in minutes. Are you blocking an attacker, or just one of their disguises?", "Plattformen anger utgivaren som ”ej verifierad”: det finns inget riktigt namn att spärra, bara den här appens identifierare. Den som skapade den kan registrera en ny på några minuter. Spärrar ni en angripare, eller bara en av dess förklädnader?"]),
              pb(["Who owns the open door?", "Vem äger den öppna dörren?"], ["{{person.ciso.name}} will not leave the default setting open without a written risk acceptance, signed by name. Blocking one publisher means anyone can still grant any other app access to their mail. Who in the room signs that?", "{{person.ciso.name}} vill inte lämna standardinställningen öppen utan ett skriftligt riskaccepterande, undertecknat med namn. Att spärra en utgivare innebär att vem som helst fortfarande kan ge vilken annan app som helst åtkomst till sin e-post. Vem i rummet skriver under?"]),
              pb(["“Is this one safe?”", "”Är den här säker?”"], ["A user forwards a new email to the SOC: a different signing app, a different logo, the same request to read mail and files. They ask whether it is safe to accept. Your block does not cover it. What do you tell them, and the next person who does not ask?", "En användare vidarebefordrar ett nytt mejl till SOC: en annan signeringsapp, en annan logotyp, samma begäran om att läsa e-post och filer. Hen frågar om det är säkert att godkänna. Er spärr täcker den inte. Vad svarar ni, och vad händer med nästa person som inte frågar?"])
            ]
          }),
          opt(["Block all third-party apps", "Blockera alla tredjepartsappar"], "c4", ["Safe, and breaks dozens of tools people use.", "Säkert, och förstör dussintals verktyg som folk använder."], {
            set: "consentLocked",
            pushback: [
              pb(["Everything breaks at once", "Allt går sönder på en gång"], ["Within an hour, the meeting scheduler, the expense app and the CRM add-in all stop working. The helpdesk has a queue it cannot clear and managers are calling the crisis team directly. Do you hold the line, or start granting exceptions before lunch?", "Inom en timme slutar mötesbokningen, utläggsappen och CRM-tillägget att fungera. Supporten har en kö den inte kan beta av och chefer ringer krisledningen direkt. Står ni fast, eller börjar ni bevilja undantag före lunch?"]),
              pb(["Finance cannot close", "Ekonomi kan inte stänga"], ["{{person.cfo.name}} reports that a reporting integration finance relies on has stopped along with everything else. The month-end close cannot be done without it. Is a blanket block worth breaking the finance function in the middle of a crisis?", "{{person.cfo.name}} meddelar att en rapportintegration som ekonomi är beroende av har slutat fungera tillsammans med allt annat. Månadsbokslutet går inte att göra utan den. Är en total spärr värd att slå ut ekonomifunktionen mitt i en kris?"]),
              pb(["The workarounds begin", "Genvägarna börjar"], ["The SOC notices staff forwarding work mail to private accounts, so they can use their tools there instead. The block has moved company data somewhere you cannot see at all. Is the company actually safer tonight than it was this morning?", "SOC märker att personal vidarebefordrar jobbmejl till privata konton för att kunna använda sina verktyg där i stället. Spärren har flyttat företagsdata dit ni inte ser något alls. Är företaget faktiskt säkrare i kväll än det var i morse?"])
            ]
          })
        ])
      }),

      pg("c3b", ["The users", "Användarna"], [
        "{{person.hr.name}} talks to some of the {{num.users}}. They all say the same thing: the email looked like the signing service HR used last year, the sign-in page was the real company login, and the permission screen looked like every other one they have clicked through.\n\nSeveral are frightened that they will be disciplined. One manager wants exactly that.",
        "{{person.hr.name}} pratar med några av de {{num.users}}. Alla säger samma sak: mejlet såg ut som signeringstjänsten som HR använde förra året, inloggningssidan var företagets riktiga inloggning och behörighetsskärmen såg ut som alla andra de har klickat sig igenom.\n\nFlera är rädda för att de kommer att få disciplinära åtgärder. En chef vill just det."
      ], {
        choice: ask(["How do you treat the users?", "Hur bemöter ni användarna?"], ["Treats them as victims of a convincing attack and learns from them.", "Behandlar dem som offer för ett övertygande angrepp och lär sig av dem."], [
          opt(["Reassure them and ask what would have warned them", "Lugna dem och fråga vad som hade kunnat varna dem"], "c4", ["They become your best source.", "De blir er bästa källa."], {
            pushback: [
              pb(["The manager disagrees", "Chefen håller inte med"], ["The manager who wanted discipline says reassuring everyone sends the message that clicking Accept on anything has no consequences. Others in the management team nod. How do you answer them without sounding as if nobody is responsible for anything?", "Chefen som ville ha disciplinära åtgärder säger att det sänder budskapet att det saknar konsekvenser att klicka Godkänn på vad som helst om alla lugnas. Andra i ledningsgruppen nickar. Hur svarar ni utan att det låter som att ingen ansvarar för något?"]),
              pb(["“We were told to click”", "”Vi blev tillsagda att klicka”"], ["One of the users shows you an internal guide telling staff to “just click Accept” when connecting tools. Several say nobody ever explained what a permission screen means. Reassurance is easy; are you ready to admit the company taught them this?", "En av användarna visar en intern guide som säger åt personalen att ”bara klicka Godkänn” när de kopplar in verktyg. Flera säger att ingen någonsin förklarat vad en behörighetsskärm innebär. Att lugna är lätt; är ni beredda att erkänna att företaget lärde dem det här?"]),
              pb(["Thirty conversations", "Trettio samtal"], ["{{person.hr.name}} estimates that talking properly with all {{num.users}} will take days, and HR is the only team doing it. Meanwhile nobody is yet looking at what the app actually did. Is this the best use of your people right now?", "{{person.hr.name}} uppskattar att ordentliga samtal med alla {{num.users}} tar flera dagar, och HR är det enda team som gör det. Under tiden tittar ingen ännu på vad appen faktiskt gjorde. Är det här den bästa användningen av era människor just nu?"])
            ]
          }),
          opt(["Note it as a breach of the security policy", "Notera det som ett brott mot säkerhetsriktlinjerna"], "c4", ["The next person will not report.", "Nästa person kommer inte att rapportera."], {
            set: "usersBlamed",
            pushback: [
              pb(["Someone stays quiet", "Någon håller tyst"], ["The SOC finds another user who also accepted the app, and who deleted the email instead of coming forward. When asked why, they say they saw what happened to the others. How many more are hiding now, and how will you find them?", "SOC hittar ytterligare en användare som också godkände appen, och som raderade mejlet i stället för att höra av sig. På frågan varför svarar hen att hen såg vad som hände med de andra. Hur många fler gömmer sig nu, och hur ska ni hitta dem?"]),
              pb(["Which rule did they break?", "Vilken regel bröt de?"], ["{{person.legal.name}} reads the security policy: it forbids sharing your password, and says nothing about apps or permission screens. Nobody shared a password. Can you record a breach of a rule that does not exist?", "{{person.legal.name}} läser säkerhetsriktlinjerna: de förbjuder att man lämnar ut sitt lösenord, och säger ingenting om appar eller behörighetsskärmar. Ingen lämnade ut något lösenord. Kan ni notera ett brott mot en regel som inte finns?"]),
              pb(["A senior name on the list", "Ett högt uppsatt namn på listan"], ["One of the people who clicked Accept is a member of the management team. HR asks whether they get the same note as everyone else. Do you apply the policy to them too, and what happens to the message if you do not?", "En av dem som klickade Godkänn sitter i ledningsgruppen. HR frågar om hen ska få samma notering som alla andra. Tillämpar ni riktlinjerna på hen också, och vad händer med budskapet om ni inte gör det?"])
            ]
          })
        ])
      }),

      pg("c4", ["Hidden rules", "Dolda regler"], [
        "The four inbox rules are quiet and clever. Any email containing the words “invoice”, “payment” or “bank” is moved to a hidden folder and a copy is forwarded to an outside address.\n\nThe four mailboxes belong to people who handle customer billing. Whoever made the rules can now read every invoice conversation, and reply to it.",
        "De fyra inkorgsreglerna är tysta och listiga. Varje mejl som innehåller orden ”faktura”, ”betalning” eller ”bank” flyttas till en dold mapp och en kopia vidarebefordras till en extern adress.\n\nDe fyra brevlådorna tillhör personer som hanterar fakturering mot kunder. Den som skapade reglerna kan nu läsa varje fakturakonversation, och svara på den."
      ], {
        injects: [
          inj("b15-2", 120, "logExcerpt", "person.socLead", "critical", "confirmed", [
            "Inbox rule “.” created by app QuickSign PDF in 4 mailboxes: if subject or body contains invoice|payment|bank → move to RSS Subscriptions, forward to billing-desk@{{asset.lookalikeDomain}}.",
            "Inkorgsregel ”.” skapad av appen QuickSign PDF i 4 brevlådor: om ämne eller text innehåller faktura|betalning|bank → flytta till RSS-prenumerationer, vidarebefordra till billing-desk@{{asset.lookalikeDomain}}."
          ], { tests: ["lo2", "lo3"] })
        ],
        choice: ask(["What do you do about the rules?", "Vad gör ni med reglerna?"], ["Removes the rules and searches every mailbox for similar ones.", "Tar bort reglerna och söker igenom varje brevlåda efter liknande."], [
          opt(["Remove them and search every mailbox for similar rules", "Ta bort dem och sök igenom varje brevlåda efter liknande regler"], "l2", ["Finds any you missed.", "Hittar de ni missat."], {
            set: "rulesRemoved",
            pushback: [
              pb(["The evidence goes with them", "Bevisen försvinner med dem"], ["{{person.legal.name}} warns that deleting the rules removes the clearest record of the outside address, when they were made and what they caught. The police and your insurer may want exactly that. Do you remove first, or document before you touch anything?", "{{person.legal.name}} varnar för att en radering av reglerna tar bort den tydligaste uppgiften om den externa adressen, när de skapades och vad de fångade. Polisen och försäkringsbolaget kan vilja ha just det. Tar ni bort först, eller dokumenterar ni innan ni rör något?"]),
              pb(["Hundreds of rules", "Hundratals regler"], ["The company-wide search returns hundreds of forwarding rules, almost all made by staff themselves, many sending work mail to private accounts. None of them came from QuickSign. Do you remove those too, and who tells the staff why?", "Sökningen i hela företaget ger hundratals vidarebefordringsregler, nästan alla skapade av personalen själv, många som skickar jobbmejl till privata konton. Ingen av dem kommer från QuickSign. Tar ni bort dem också, och vem förklarar för personalen varför?"]),
              pb(["Looking in everyone's mailbox", "Att titta i allas brevlådor"], ["A staff representative asks on what basis IT is going through the settings of every employee's mailbox, including people who never clicked anything. They want it in writing. How do you justify a search of everyone to stop four rules?", "Ett personalombud frågar med vilken rätt IT går igenom inställningarna i varje anställds brevlåda, även för dem som aldrig klickade på något. Ombudet vill ha det skriftligt. Hur motiverar ni en genomsökning av alla för att stoppa fyra regler?"])
            ]
          }),
          opt(["Remove the four rules", "Ta bort de fyra reglerna"], "l2", ["Fixes what you found.", "Rättar det ni hittade."], {
            pushback: [
              pb(["Only four?", "Bara fyra?"], ["{{person.socLead.name}} points out that the app could change any of the {{num.users}} mailboxes it reached. You found four rules by searching for the app's name. Are you certain that is everything it left behind, and how would you know?", "{{person.socLead.name}} påpekar att appen kunde ändra i alla {{num.users}} brevlådor den nådde. Ni hittade fyra regler genom att söka på appens namn. Är ni säkra på att det är allt den lämnade efter sig, och hur skulle ni veta det?"]),
              pb(["The hidden folder", "Den dolda mappen"], ["Removing the rules leaves the hidden folder in place, full of invoice and payment emails the four users never saw. Some customers have been waiting days for an answer. Who goes through that folder, and what do you tell those customers?", "När reglerna tas bort ligger den dolda mappen kvar, full av faktura- och betalningsmejl som de fyra användarna aldrig såg. En del kunder har väntat i dagar på svar. Vem går igenom mappen, och vad säger ni till de kunderna?"]),
              pb(["Back to work as usual", "Tillbaka till vardagen"], ["Nobody has told the four billing staff what was in their mailboxes. They are sending invoices from them today as if nothing happened. Do you tell them, and should they keep working in mailboxes an outsider has been reading?", "Ingen har berättat för de fyra faktureringshandläggarna vad som fanns i deras brevlådor. De skickar fakturor därifrån i dag som om ingenting hänt. Berättar ni det för dem, och ska de fortsätta arbeta i brevlådor som en utomstående har läst?"])
            ]
          })
        ])
      }),

      pg("l2", ["Open invoices", "Öppna fakturor"], [
        "Finance lists every invoice conversation the four mailboxes were part of in the last month: about forty customers, some with large payments due this week.\n\nThe forwarded copies mean someone outside knows who owes what, when, and what the emails look like. That is everything needed to send a convincing “our bank details have changed” message.",
        "Ekonomi listar varje fakturakonversation som de fyra brevlådorna deltog i den senaste månaden: omkring fyrtio kunder, en del med stora betalningar som förfaller den här veckan.\n\nDe vidarebefordrade kopiorna innebär att någon utanför vet vem som är skyldig vad, när, och hur mejlen ser ut. Det är allt som behövs för att skicka ett övertygande meddelande om att ”våra bankuppgifter har ändrats”."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["Do you act on the invoice threads now?", "Agerar ni på fakturatrådarna nu?"], ["Prepares to warn every customer in an active thread.", "Förbereder en varning till varje kund i en aktiv tråd."], [
          opt(["Prepare a warning for every customer with an open invoice", "Förbered en varning till varje kund med en öppen faktura"], "c5", ["Ready before the fraud attempt arrives.", "Klar innan bedrägeriförsöket kommer."], {
            pushback: [
              pb(["Prepared is not sent", "Förberedd är inte skickad"], ["The warning is drafted and approved, and sits in a folder. Several large payments fall due this week. Prepared protects nobody. What exactly are you waiting for before you send it, and who decides that moment?", "Varningen är skriven och godkänd, och ligger i en mapp. Flera stora betalningar förfaller den här veckan. En förberedd varning skyddar ingen. Vad är det exakt ni väntar på innan ni skickar den, och vem bestämmer när?"]),
              pb(["Sales wants to choose", "Försäljning vill välja"], ["Account managers ask to remove their biggest customers from the list: a warning that your email was compromised, in the middle of renewals, could cost more than any fraud. Do you let sales decide who gets warned?", "Kundansvariga vill stryka sina största kunder från listan: en varning om att er e-post har komprometterats, mitt i förlängningar, kan kosta mer än något bedrägeri. Låter ni försäljning bestämma vem som varnas?"]),
              pb(["Through which channel?", "Genom vilken kanal?"], ["An email warning would land in the very threads someone outside has been reading. Whoever reads them could reply with a “correction” of their own. How do you reach about forty customers in a way they can actually trust?", "En varning via e-post skulle hamna i just de trådar som någon utanför har läst. Den som läser dem kan svara med en egen ”rättelse”. Hur når ni ett fyrtiotal kunder på ett sätt de faktiskt kan lita på?"])
            ]
          }),
          opt(["Wait and see whether any fraud happens", "Vänta och se om något bedrägeri sker"], "c5", ["The fraud will arrive first.", "Bedrägeriet kommer först."], {
            pushback: [
              pb(["How would you notice?", "Hur skulle ni märka det?"], ["{{person.cfo.name}} points out that if a customer is tricked, the first sign will be a payment that simply never arrives, possibly weeks from now. Nobody is watching for it. How exactly do you plan to see the fraud you are waiting for?", "{{person.cfo.name}} påpekar att om en kund luras blir det första tecknet en betalning som helt enkelt aldrig kommer, kanske om flera veckor. Ingen håller utkik efter det. Hur exakt tänker ni upptäcka bedrägeriet ni väntar på?"]),
              pb(["“When did you know?”", "”När visste ni?”"], ["{{person.legal.name}} warns that if a customer loses money, the first question will be when you knew the invoice threads were exposed. The honest answer would be “before it happened”. Is “we were waiting to see” a position you can defend?", "{{person.legal.name}} varnar för att om en kund förlorar pengar blir första frågan när ni visste att fakturatrådarna var exponerade. Det ärliga svaret blir ”innan det hände”. Är ”vi väntade och såg” en hållning ni kan försvara?"]),
              pb(["Your own payments too", "Era egna betalningar också"], ["The forwarded threads also include suppliers sending invoices to you. Someone could just as easily ask your accounts payable to update a supplier's bank details. Is waiting also putting your own outgoing payments at risk?", "De vidarebefordrade trådarna innehåller också leverantörer som skickar fakturor till er. Någon kan lika gärna be er leverantörsreskontra uppdatera en leverantörs bankuppgifter. Utsätter väntan också era egna utgående betalningar för risk?"])
            ]
          })
        ])
      }),

      pg("c5", ["The data", "Datan"], [
        "{{person.dpo.name}} looks at what was read: HR files with personal details, customer contracts with named contacts, and mailboxes full of personal messages.\n\nIt is a personal data breach. The question is when you notify {{reg.dpaShort}}: now, with what you know, or after the scoping is complete.",
        "{{person.dpo.name}} går igenom vad som lästes: HR-filer med personuppgifter, kundavtal med namngivna kontakter och brevlådor fulla av personliga meddelanden.\n\nDet är en personuppgiftsincident. Frågan är när ni anmäler till {{reg.dpaShort}}: nu, med det ni vet, eller när kartläggningen är klar."
      ], {
        variants: [vr("scoped", [
          "{{person.dpo.name}} has the classification from the audit: HR files with personal details, customer contracts with named contacts, and mailboxes containing personal and health-related messages.\n\nIt is a personal data breach, and because the scoping is thorough, the notification can be precise about what was taken. The question is only when to send it.",
          "{{person.dpo.name}} har klassificeringen från granskningen: HR-filer med personuppgifter, kundavtal med namngivna kontakter och brevlådor med personliga och hälsorelaterade meddelanden.\n\nDet är en personuppgiftsincident, och eftersom kartläggningen är grundlig kan anmälan bli exakt om vad som togs. Frågan är bara när den ska skickas."
        ], ["Because you scoped fully, the notification can be precise.", "Eftersom ni kartlade fullständigt kan anmälan bli exakt."])],
        choice: ask(["When do you notify?", "När anmäler ni?"], ["Notifies within 72 hours with what is known and supplements.", "Anmäler inom 72 timmar med det som är känt och kompletterar."], [
          opt(["Within 72 hours, supplementing later", "Inom 72 timmar, med senare kompletteringar"], "l3", ["Meets the duty.", "Uppfyller skyldigheten."], {
            effects: { regulator: -1 }, set: "notified",
            pushback: [
              pb(["The first number sticks", "Den första siffran fastnar"], ["{{person.legal.name}} warns that whatever numbers you send {{reg.dpaShort}} now become the baseline. If the count of affected people grows later, it may look as if you held it back. Do you send a range, a minimum, or wait for a better number?", "{{person.legal.name}} varnar för att de siffror ni skickar till {{reg.dpaShort}} nu blir utgångspunkten. Om antalet berörda växer senare kan det se ut som att ni höll inne med det. Skickar ni ett intervall, ett minimum, eller väntar ni på en bättre siffra?"]),
              pb(["The same people write it", "Samma personer skriver den"], ["The only people who can describe what was taken are the ones scoping it. Writing the notification pulls them off the work for most of a day. Does meeting the deadline slow down the very facts you will need to supplement it?", "De enda som kan beskriva vad som togs är de som kartlägger det. Att skriva anmälan tar dem från arbetet större delen av en dag. Bromsar tidsgränsen just de fakta ni behöver för att komplettera anmälan?"]),
              pb(["What about the staff?", "Hur blir det med personalen?"], ["{{person.dpo.name}} points out that notifying the regulator does not settle whether you must tell the people whose HR files and messages were read. Some of them will hear about the notification anyway. Who learns first: the regulator or your own staff?", "{{person.dpo.name}} påpekar att en anmälan till tillsynsmyndigheten inte avgör om ni måste berätta för dem vars HR-filer och meddelanden lästes. En del av dem kommer att höra om anmälan ändå. Vem får veta först: tillsynsmyndigheten eller er egen personal?"])
            ]
          }),
          opt(["After the scoping is complete", "När kartläggningen är klar"], "l3", ["More complete, probably late.", "Mer komplett, troligen sent."], {
            effects: { regulator: 1 }, set: "notifyLate",
            pushback: [
              pb(["The scoping will overrun", "Kartläggningen drar över"], ["{{person.itOps.name}} says honestly that the scoping will take longer than 72 hours. The notification will be late by design, not by accident. Who in the room signs the explanation for why you chose to wait?", "{{person.itOps.name}} säger ärligt att kartläggningen kommer att ta mer än 72 timmar. Anmälan blir sen med avsikt, inte av misstag. Vem i rummet skriver under förklaringen till varför ni valde att vänta?"]),
              pb(["The DPO objects", "Dataskyddsombudet invänder"], ["{{person.dpo.name}} says the duty is to report what you know now and add the rest later, and asks for the disagreement to be minuted. If the regulator asks, they will say they advised otherwise. Do you still overrule them?", "{{person.dpo.name}} säger att skyldigheten är att anmäla det ni vet nu och komplettera senare, och vill att oenigheten protokollförs. Om tillsynsmyndigheten frågar kommer hen att säga att hen avrådde. Kör ni ändå över hen?"]),
              pb(["An employee asks first", "En anställd frågar först"], ["One of the {{num.users}} emails {{person.dpo.name}} directly: were their medical notes in the files that were read? The answer is probably yes. Can you tell an employee before you have told the regulator, and if not, what do you say?", "En av de {{num.users}} mejlar {{person.dpo.name}} direkt: fanns hens läkarintyg bland filerna som lästes? Svaret är troligen ja. Kan ni berätta det för en anställd innan ni berättat det för tillsynsmyndigheten, och om inte, vad säger ni?"])
            ]
          }),
          opt(["Re-enable the app for the finance team: their month-end reports depend on it", "Slå på appen igen för ekonomiteamet: deras månadsrapporter är beroende av den"], "l3", ["Reverses your first containment for one team, on a deadline.", "Upphäver er första inneslutning för ett team, på grund av en tidsgräns."], {
            requires: "appRevoked", set: "appRestored", effects: { regulator: 1 },
            pushback: [
              pb(["New tokens, same stranger", "Nya token, samma främling"], ["{{person.itOps.name}} explains that re-enabling the app means finance staff consent again and new tokens are issued, to whoever is behind QuickSign. Nothing about the app has changed since you revoked it. What makes it safe for finance now?", "{{person.itOps.name}} förklarar att om appen slås på igen ger ekonomipersonalen samtycke på nytt och nya token utfärdas, till den som står bakom QuickSign. Inget med appen har ändrats sedan ni återkallade den. Vad gör den säker för ekonomi nu?"]),
              pb(["In the same notification", "I samma anmälan"], ["{{person.dpo.name}} asks how you will describe this to {{reg.dpaShort}}: a breach caused by an app, followed by turning the same app back on for the team that handles payments. Can you write that sentence and stand behind it?", "{{person.dpo.name}} frågar hur ni ska beskriva det här för {{reg.dpaShort}}: en incident orsakad av en app, följd av att samma app slås på igen för teamet som hanterar betalningar. Kan ni skriva den meningen och stå för den?"]),
              pb(["It can be done by hand", "Det går att göra för hand"], ["Pressed on it, {{person.cfo.name}}'s team admits the month-end reports could be produced manually with a couple of extra days' work. The deadline is real, but not impossible. Is a reporting date worth reopening the door you just closed?", "När {{person.cfo.name}}s team pressas medger de att månadsrapporterna kan tas fram manuellt med ett par dagars extra arbete. Tidsgränsen är verklig, men inte omöjlig. Är ett rapportdatum värt att öppna dörren ni just stängde?"])
            ]
          })
        ])
      }),

      pg("l3", ["Verified?", "Verifierad?"], [
        "{{person.socLead.name}} looks at the app's registration. It was created in another company's account on the same platform, a small firm whose own admin account appears to have been compromised.\n\nThe app used that firm's name and logo. To the platform, it looked like a legitimate business app from a real company.",
        "{{person.socLead.name}} tittar på appens registrering. Den skapades i ett annat företags konto på samma plattform, ett litet företag vars eget administratörskonto verkar ha komprometterats.\n\nAppen använde det företagets namn och logotyp. För plattformen såg den ut som en legitim affärsapp från ett riktigt företag."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["Do you tell the other company?", "Berättar ni för det andra företaget?"], ["Warns the firm whose account was abused.", "Varnar företaget vars konto missbrukades."], [
          opt(["Warn them directly", "Varna dem direkt"], "c6", ["They are victims too.", "De är också offer."], {
            pushback: [
              pb(["Who do you contact?", "Vem kontaktar ni?"], ["The only contact details you have are on the firm's website, and its admin account is compromised. An email to them may be read by the same people who built the app. How do you reach the right person safely, and how do you know it is them?", "De enda kontaktuppgifter ni har finns på företagets webbplats, och dess administratörskonto är komprometterat. Ett mejl till dem kan läsas av samma personer som byggde appen. Hur når ni rätt person säkert, och hur vet ni att det är rätt person?"]),
              pb(["What do you share?", "Vad delar ni?"], ["{{person.legal.name}} hesitates: to be useful, the warning needs log extracts and details of your own breach, sent to a firm whose security has just failed. Do you share evidence with them, and who decides how much?", "{{person.legal.name}} tvekar: för att vara till nytta behöver varningen loggutdrag och detaljer om er egen incident, skickade till ett företag vars säkerhet just har fallerat. Delar ni belägg med dem, och vem bestämmer hur mycket?"]),
              pb(["“That's not us”", "”Det är inte vi”"], ["The firm's owner answers quickly and defensively: they have never built any app, and they do not like the suggestion that they are behind an attack. They mention their lawyer. Do you press on, or step back and let the platform handle it?", "Företagets ägare svarar snabbt och defensivt: de har aldrig byggt någon app, och de uppskattar inte antydan om att de ligger bakom ett angrepp. Ägaren nämner sin jurist. Fortsätter ni, eller backar ni och låter plattformen sköta det?"])
            ]
          }),
          opt(["Leave it to the platform", "Lämna det åt plattformen"], "c6", ["Slower.", "Långsammare."], {
            pushback: [
              pb(["Days of silence", "Dagar av tystnad"], ["The platform's process promises a response “in due course”, with no date. Meanwhile the firm's compromised admin account is still there, able to register a new app tomorrow under the same real name. Are you comfortable knowing that and saying nothing?", "Plattformens process utlovar svar ”i sinom tid”, utan datum. Under tiden finns företagets komprometterade administratörskonto kvar och kan registrera en ny app i morgon under samma riktiga namn. Känns det bra att veta det och inte säga något?"]),
              pb(["Their customers next", "Deras kunder härnäst"], ["The firm's own customers may be receiving the same kind of email in that firm's name right now. You know something that could stop it, and they do not. Is waiting for a platform process the fair thing to do to a fellow victim?", "Företagets egna kunder kan just nu få samma slags mejl i företagets namn. Ni vet något som kan stoppa det, och det gör inte de. Är det rimligt mot ett annat offer att vänta på en plattformsprocess?"]),
              pb(["Your name in their logs", "Ert namn i deras loggar"], ["{{person.socLead.name}} notes that when the firm does find out, its logs will show your company's users granting access. Without a word from you, they may assume you were part of the problem. Is staying out of it really the cautious option?", "{{person.socLead.name}} påpekar att när företaget väl får veta kommer deras loggar att visa att era användare gav åtkomst. Utan ett ord från er kan de anta att ni var en del av problemet. Är det verkligen det försiktiga valet att hålla sig utanför?"])
            ]
          })
        ])
      }),

      pg("c6", ["A customer's email", "En kunds mejl"], [
        "{{time.T+1440|weekday|cap}}. A customer's accounts payable team forwards an email to your finance department. It came from what looks like your billing address, in the middle of a real invoice thread, saying that your bank details have changed.\n\nThe customer is asking politely whether it is genuine before paying this week's invoices, which are large. Others may not ask.",
        "{{time.T+1440|weekday|cap}}. En kunds leverantörsreskontra vidarebefordrar ett mejl till er ekonomiavdelning. Det kom från något som ser ut som er faktureringsadress, mitt i en verklig fakturatråd, och säger att era bankuppgifter har ändrats.\n\nKunden frågar artigt om det är äkta innan de betalar veckans fakturor, som är stora. Andra kanske inte frågar."
      ], {
        injects: [
          inj("b15-3", 1440, "email", "customer", "high", "confirmed", [
            "“We received the attached message from your billing team about new bank details. Before we pay this week's invoices, can you confirm it is genuine?”",
            "”Vi fick bifogade meddelande från er faktureringsavdelning om nya bankuppgifter. Innan vi betalar veckans fakturor, kan ni bekräfta att det är äkta?”"
          ], { headline: ["Fwd: Updated bank details", "Vb: Uppdaterade bankuppgifter"], meta: { subject: L(["Fwd: Updated bank details", "Vb: Uppdaterade bankuppgifter"]) }, tests: ["lo3"] })
        ],
        choice: ask(["What do you do?", "Vad gör ni?"], ["Warns every customer in an active invoice thread today, by phone where payments are large.", "Varnar varje kund i en aktiv fakturatråd i dag, per telefon där beloppen är stora."], [
          opt(["Warn every customer with an open invoice, today", "Varna varje kund med en öppen faktura, i dag"], "c7", ["Embarrassing, and it stops the fraud.", "Pinsamt, och det stoppar bedrägeriet."], {
            effects: { trust: 1 }, set: "customersWarned",
            pushback: [
              pb(["Forty calls, three people", "Fyrtio samtal, tre personer"], ["Finance has three people who know the customers well enough to call them, and about forty calls to make today. Each call takes longer than planned because customers ask questions. Who else makes the calls, and what do they say when they do not know the answers?", "Ekonomi har tre personer som känner kunderna tillräckligt väl för att ringa dem, och ett fyrtiotal samtal att göra i dag. Varje samtal tar längre tid än planerat eftersom kunderna ställer frågor. Vem mer ringer, och vad säger de när de inte kan svaren?"]),
              pb(["“Not this customer”", "”Inte den här kunden”"], ["An account manager begs you to leave one customer off the list: they are in the final week of a major contract renewal, and a call about compromised email could end it. Do you make an exception, and what if that is the customer who gets the next fake email?", "En kundansvarig ber er stryka en kund från listan: de är inne i sista veckan av en stor avtalsförlängning, och ett samtal om komprometterad e-post kan sätta stopp för den. Gör ni ett undantag, och vad händer om det är den kunden som får nästa falska mejl?"]),
              pb(["Questions you can't answer", "Frågor ni inte kan svara på"], ["Several customers ask straight away whether their own contract details were read, and whether they need to report anything to their own regulator. Your scoping cannot tell them yet. Do you keep calling without answers, or pause until you have them?", "Flera kunder frågar direkt om deras egna avtalsuppgifter lästes, och om de måste anmäla något till sin egen tillsynsmyndighet. Er kartläggning kan inte svara på det ännu. Fortsätter ni ringa utan svar, eller pausar ni tills ni har dem?"])
            ]
          }),
          opt(["Confirm to this customer that it is fake", "Bekräfta för den här kunden att det är falskt"], "c7", ["Saves one payment.", "Räddar en betalning."], {
            pushback: [
              pb(["The ones who don't ask", "De som inte frågar"], ["Finance's list shows about forty customers in invoice threads that were forwarded. This customer was careful enough to ask; the next one may simply pay. What is your plan for the customers who will not forward the email to you?", "Ekonomis lista visar ett fyrtiotal kunder i fakturatrådar som vidarebefordrades. Den här kunden var noggrann nog att fråga; nästa kanske bara betalar. Vad är er plan för de kunder som inte kommer att vidarebefordra mejlet till er?"]),
              pb(["“Are others affected?”", "”Är andra drabbade?”"], ["The customer thanks you, then asks directly: have other customers received the same email, and are you telling them? Their accounts team works with several of your other customers. What do you answer, truthfully?", "Kunden tackar och frågar sedan rakt ut: har andra kunder fått samma mejl, och berättar ni det för dem? Deras ekonomiavdelning arbetar med flera av era andra kunder. Vad svarar ni, sanningsenligt?"]),
              pb(["Knowing and not telling", "Att veta och inte säga"], ["{{person.legal.name}} warns that you now know your invoice threads are being used for fraud. Warning one customer and not the others could make the company liable for any payment that goes astray. Is saving one payment worth that exposure?", "{{person.legal.name}} varnar för att ni nu vet att era fakturatrådar används för bedrägeri. Att varna en kund men inte de andra kan göra företaget ansvarigt för varje betalning som hamnar fel. Är det värt den exponeringen att rädda en betalning?"])
            ]
          }),
          opt(["Keep quiet and fix it internally", "Håll tyst och åtgärda det internt"], "x1", ["Avoids embarrassment, for now.", "Undviker pinsamhet, för stunden."], {
            effects: { trust: -2 },
            pushback: [
              pb(["The customer already knows", "Kunden vet redan"], ["The customer who forwarded the email knows your threads are compromised, and their accounts team talks to other suppliers and customers. You are not the only one who decides whether this stays quiet. What happens when your customers hear it from someone else?", "Kunden som vidarebefordrade mejlet vet att era trådar är komprometterade, och deras ekonomiavdelning pratar med andra leverantörer och kunder. Det är inte bara ni som avgör om det här förblir tyst. Vad händer när era kunder hör det från någon annan?"]),
              pb(["What do we say on the phone?", "Vad säger vi i telefon?"], ["The four billing staff ask what they should say when a customer calls about an odd email. Keeping quiet means asking them to deflect or mislead people they work with every day. Are you prepared to give them that instruction, out loud?", "De fyra faktureringshandläggarna frågar vad de ska säga när en kund ringer om ett konstigt mejl. Att hålla tyst innebär att be dem undvika eller vilseleda människor de arbetar med varje dag. Är ni beredda att ge dem den instruktionen, högt?"]),
              pb(["Each invoice due this week", "Varje faktura som förfaller i veckan"], ["{{person.cfo.name}} puts the list of large invoices due this week on the table. Every one of those customers is in a thread someone outside has read. If one of them pays the wrong account, who in this room explains why you said nothing?", "{{person.cfo.name}} lägger listan över stora fakturor som förfaller den här veckan på bordet. Varje kund på den finns i en tråd som någon utanför har läst. Om en av dem betalar till fel konto, vem i rummet förklarar varför ni inte sa något?"])
            ]
          })
        ])
      }),

      pg("c7", ["Every other app", "Alla andra appar"], [
        "Now that everyone is looking, {{person.itOps.name}} lists every third-party app with permission to company data. There are {{num.apps}}.\n\nSome are well-known business tools. Many were connected by a single employee years ago and never looked at again. Several have permission to read all mail.",
        "Nu när alla tittar listar {{person.itOps.name}} varje tredjepartsapp med behörighet till företagets data. Det finns {{num.apps}}.\n\nEn del är välkända affärsverktyg. Många kopplades in av en enskild anställd för flera år sedan och har aldrig granskats sedan dess. Flera har behörighet att läsa all e-post."
      ], {
        choice: ask(["What do you do about the other apps?", "Vad gör ni med de andra apparna?"], ["Reviews all of them, removing broad permissions nobody can justify.", "Granskar alla, och tar bort breda behörigheter som ingen kan motivera."], [
          opt(["Review all of them and remove what nobody needs", "Granska alla och ta bort det ingen behöver"], "l4", ["Tedious, and you will find surprises.", "Tråkigt, och ni kommer att hitta överraskningar."], {
            set: "allAppsReviewed",
            pushback: [
              pb(["Apps without owners", "Appar utan ägare"], ["Many of the {{num.apps}} apps were connected by people who have since left. Nobody can say what they do or whether anything depends on them. Do you remove an app nobody can explain, and risk breaking something nobody knew was there?", "Många av de {{num.apps}} apparna kopplades in av personer som sedan har slutat. Ingen kan säga vad de gör eller om något är beroende av dem. Tar ni bort en app som ingen kan förklara, och riskerar att något ingen visste om slutar fungera?"]),
              pb(["“Not now”", "”Inte nu”"], ["Department heads push back: in the middle of a crisis, they are being asked to justify every tool their teams use, by Friday. Two say they will simply not answer. Do you make them, and what do you do with the apps of those who refuse?", "Avdelningscheferna protesterar: mitt i en kris ombeds de motivera varje verktyg deras team använder, senast på fredag. Två säger att de helt enkelt inte tänker svara. Tvingar ni dem, och vad gör ni med apparna för dem som vägrar?"]),
              pb(["The same tired team", "Samma trötta team"], ["The people who would do the review are the same ones still handling customers and the regulator. A full review will take weeks. What do you take off their plate, and is that a trade you would defend if something slips?", "De som skulle göra granskningen är samma personer som fortfarande hanterar kunder och tillsynsmyndigheten. En fullständig granskning tar veckor. Vad tar ni bort från deras bord, och är det ett byte ni skulle försvara om något glider?"])
            ]
          }),
          opt(["Review only apps that can read mail", "Granska bara appar som kan läsa e-post"], "l4", ["A sensible start.", "En vettig början."], {
            pushback: [
              pb(["QuickSign took files too", "QuickSign tog filer också"], ["QuickSign did not only read mail: it downloaded {{num.files|number}} files from shared drives. Apps that can read files, calendars or chat are outside your review. Why is mail the line, when the attack you just had crossed it?", "QuickSign läste inte bara e-post: den laddade ner {{num.files|number}} filer från delade mappar. Appar som kan läsa filer, kalendrar eller chatt hamnar utanför er granskning. Varför går gränsen vid e-post, när angreppet ni just hade gick över den?"]),
              pb(["The first one on the list", "Den första på listan"], ["The first mail-reading app on the list is a scheduling tool the executive assistants use every day. Nobody knows who approved it, and its permissions are as broad as QuickSign's were. Do you remove it, and who tells the management team?", "Den första appen på listan som läser e-post är ett bokningsverktyg som ledningens assistenter använder varje dag. Ingen vet vem som godkände det, och dess behörigheter är lika breda som QuickSigns var. Tar ni bort den, och vem berättar det för ledningsgruppen?"]),
              pb(["The insurer's questionnaire", "Försäkringsbolagets frågeformulär"], ["Your insurer's renewal questionnaire asks a plain question: have all third-party apps with access to company data been reviewed? The honest answer is “only some”. Do you answer honestly and risk the terms, or widen the review?", "Försäkringsbolagets frågeformulär inför förnyelsen ställer en enkel fråga: har alla tredjepartsappar med åtkomst till företagets data granskats? Det ärliga svaret är ”bara en del”. Svarar ni ärligt och riskerar villkoren, eller vidgar ni granskningen?"])
            ]
          })
        ])
      }),

      pg("l4", ["What would have warned them?", "Vad hade kunnat varna dem?"], [
        "The users who were willing to talk give the same answer: nothing looked wrong. The permission screen showed a name, a logo, and a list of permissions in small grey text.\n\nNone of them had ever been told that “allow this app to read your mail” is as serious as giving someone your password.",
        "De användare som var villiga att prata ger samma svar: inget såg fel ut. Behörighetsskärmen visade ett namn, en logotyp och en lista med behörigheter i liten grå text.\n\nIngen av dem hade någonsin fått höra att ”tillåt den här appen att läsa din e-post” är lika allvarligt som att ge någon sitt lösenord."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["How do you change awareness?", "Hur förändrar ni medvetenheten?"], ["Explains consent screens with real examples, and relies on settings rather than training alone.", "Förklarar samtyckesskärmar med verkliga exempel, och förlitar sig på inställningar snarare än enbart utbildning."], [
          opt(["Short, real examples of consent screens for all staff", "Korta, verkliga exempel på samtyckesskärmar för all personal"], "c8", ["Memorable, if short.", "Minnesvärt, om det är kort."], {
            pushback: [
              pb(["Everyone knows who", "Alla vet vem"], ["The most real example you have is QuickSign itself. Show it, and colleagues will know exactly which {{num.users}} people fell for it. Leave it out, and the training loses its force. Do you use the real screen?", "Det mest verkliga exemplet ni har är QuickSign själv. Visar ni det kommer kollegorna att veta exakt vilka {{num.users}} som gick på det. Utelämnar ni det förlorar utbildningen sin kraft. Använder ni den riktiga skärmen?"]),
              pb(["“I would still click”", "”Jag skulle ändå klicka”"], ["In a test run, most staff say they would still click Accept: the screens look routine, and the grey text is as small as ever. Training cannot change what the screen looks like. What does knowing the risk change, if the screen stays the same?", "I en testomgång säger de flesta att de ändå skulle klicka Godkänn: skärmarna ser rutinmässiga ut och den grå texten är lika liten som förut. Utbildning kan inte ändra hur skärmen ser ut. Vad förändrar kunskap om risken, om skärmen förblir densamma?"]),
              pb(["Another mandatory video", "Ännu en obligatorisk video"], ["Managers in operations complain: shift workers have had three mandatory items this month and complete them on their own time. Making this mandatory will be resented; optional means few will watch it. Which do you choose, and who will actually see it?", "Chefer i verksamheten klagar: skiftarbetare har fått tre obligatoriska moment den här månaden och gör dem på sin egen tid. Görs det här obligatoriskt blir det illa sett; frivilligt innebär att få tittar. Vilket väljer ni, och vem kommer faktiskt att se det?"])
            ]
          }),
          opt(["Add it to the annual security course", "Lägg till det i den årliga säkerhetskursen"], "c8", ["Next year.", "Nästa år."], {
            pushback: [
              pb(["Months away", "Månader bort"], ["The next run of the annual course is months away, and emails like QuickSign's are arriving now. Until then, staff know nothing new. What should someone do tomorrow when the next permission screen appears?", "Nästa omgång av den årliga kursen ligger månader bort, och mejl som QuickSigns kommer nu. Fram till dess vet personalen inget nytt. Vad ska någon göra i morgon när nästa behörighetsskärm dyker upp?"]),
              pb(["Already too long", "Redan för lång"], ["{{person.hr.name}} says the annual course is already long and many people click through it without reading. One more slide will vanish among the rest. Is adding it to the course training anyone, or just ticking a box?", "{{person.hr.name}} säger att den årliga kursen redan är lång och att många klickar sig igenom den utan att läsa. En bild till försvinner bland de andra. Utbildar det någon att lägga till den i kursen, eller bockar ni bara av en ruta?"]),
              pb(["The thirty want to know now", "De trettio vill veta nu"], ["Several of the people who clicked Accept ask what they should have looked for, so it does not happen again. Telling them “it will be in next year's course” is not an answer. What do you tell them this week?", "Flera av dem som klickade Godkänn frågar vad de borde ha tittat efter, så att det inte händer igen. Att säga ”det kommer i nästa års kurs” är inget svar. Vad säger ni till dem den här veckan?"])
            ]
          })
        ])
      }),

      pg("c8", ["The platform", "Plattformen"], [
        "The platform provider has a process for reporting malicious apps. Reporting it could get the app disabled for every company it has reached, not only yours.\n\nIt takes a careful write-up with the app's identifiers and evidence, at a time when the team is busy with customers.",
        "Plattformsleverantören har en process för att rapportera skadliga appar. En rapport kan leda till att appen inaktiveras för varje företag den har nått, inte bara för er.\n\nDet kräver en noggrann sammanställning med appens identifierare och belägg, vid en tidpunkt då teamet har fullt upp med kunderna."
      ], {
        choice: ask(["Do you report the app?", "Rapporterar ni appen?"], ["Reports it with evidence, protecting others.", "Rapporterar den med belägg, och skyddar andra."], [
          opt(["Report it with evidence", "Rapportera den med belägg"], "c9", ["Helps everyone it targeted.", "Hjälper alla den riktade sig mot."], {
            set: "vendorReported",
            pushback: [
              pb(["Evidence full of personal data", "Belägg fulla av personuppgifter"], ["The evidence the provider asks for includes log extracts with staff names, mailbox addresses and subject lines. {{person.dpo.name}} wants them redacted before they leave the company, which takes time. Do you send them as they are, or slow the report down?", "Beläggen leverantören vill ha innehåller loggutdrag med personalens namn, brevlådeadresser och ämnesrader. {{person.dpo.name}} vill att de maskeras innan de lämnar företaget, vilket tar tid. Skickar ni dem som de är, eller bromsar ni rapporten?"]),
              pb(["Who writes it?", "Vem skriver den?"], ["Only {{person.socLead.name}} knows the app's identifiers and timeline well enough to write the report, and they are also the person customers' IT teams want to talk to. Half a day goes to one or the other. Which waits?", "Bara {{person.socLead.name}} känner appens identifierare och tidslinje tillräckligt väl för att skriva rapporten, och det är också den person som kundernas IT-team vill prata med. En halv dag går till det ena eller det andra. Vad får vänta?"]),
              pb(["A form and no reply", "Ett formulär och inget svar"], ["The provider's reporting page says reports are reviewed “as capacity allows” and that reporters will not normally hear back. You may never know whether it helped. Is it still worth a careful half-day while your customers need you?", "Leverantörens rapportsida säger att rapporter granskas ”i mån av kapacitet” och att den som rapporterar normalt inte får svar. Ni får kanske aldrig veta om det hjälpte. Är det ändå värt en noggrann halv dag medan era kunder behöver er?"])
            ]
          }),
          opt(["Not now", "Inte nu"], "c9", ["It will keep working elsewhere.", "Den fortsätter att fungera på andra håll."], {
            pushback: [
              pb(["A peer calls", "En kollega ringer"], ["A security lead at another company in your sector calls: their staff received the same signing email this morning. They ask whether you have reported the app to the platform. What do you tell them, and does “not now” still sound reasonable?", "En säkerhetsansvarig på ett annat företag i er bransch ringer: deras personal fick samma signeringsmejl i morse. Hen frågar om ni har rapporterat appen till plattformen. Vad svarar ni, och låter ”inte nu” fortfarande rimligt?"]),
              pb(["Not now becomes never", "Inte nu blir aldrig"], ["{{person.socLead.name}} points out that the details needed for a good report are fresh in people's heads today and will fade within weeks. Nobody has been given the task of coming back to it. Who owns “later”, and when exactly is it?", "{{person.socLead.name}} påpekar att detaljerna som behövs för en bra rapport finns i folks huvuden i dag och bleknar inom några veckor. Ingen har fått uppgiften att återkomma till det. Vem äger ”senare”, och när är det exakt?"]),
              pb(["You knew", "Ni visste"], ["{{person.legal.name}} asks how this will look if the app goes on to defraud other companies' customers, and it emerges that you had the evidence and chose not to send it. Can you explain that choice to someone it harmed?", "{{person.legal.name}} frågar hur det kommer att se ut om appen fortsätter att lura andra företags kunder, och det kommer fram att ni hade beläggen men valde att inte skicka dem. Kan ni förklara det valet för någon som drabbades?"])
            ]
          })
        ])
      }),

      pg("c9", ["The thirty", "De trettio"], [
        "The {{num.users}} people who clicked Accept are still waiting to hear what happens to them. Some have heard rumours that names were sent to management.\n\nTheir colleagues are watching too. How you close this will decide whether the next person who clicks something strange reports it within minutes or hides it.",
        "De {{num.users}} personer som klickade på Godkänn väntar fortfarande på att få höra vad som händer med dem. En del har hört rykten om att namn skickats till ledningen.\n\nDeras kollegor ser också på. Hur ni avslutar det här avgör om nästa person som klickar på något konstigt rapporterar det inom några minuter eller döljer det."
      ], {
        variants: [vr("usersBlamed", [
          "The {{num.users}} people who clicked Accept have each received a note saying they breached the security policy. Two have asked HR whether it will affect their reviews.\n\nTheir colleagues have noticed. Since the notes went out, the SOC has received no reports of suspicious emails at all, which nobody believes means there were none.",
          "De {{num.users}} personer som klickade på Godkänn har var och en fått ett meddelande om att de brutit mot säkerhetsriktlinjerna. Två har frågat HR om det påverkar deras medarbetarsamtal.\n\nDeras kollegor har märkt det. Sedan meddelandena skickades har SOC inte fått en enda rapport om misstänkta mejl, och ingen tror att det betyder att det inte fanns några."
        ], ["Because users were blamed, reporting has stopped.", "Eftersom användarna skuldbelades har rapporteringen upphört."])],
        choice: ask(["How do you close it with the users?", "Hur avslutar ni det med användarna?"], ["Tells them plainly they were deceived by a convincing attack and that the fix is in the settings.", "Säger rakt ut att de lurades av ett övertygande angrepp och att lösningen finns i inställningarna."], [
          opt(["Tell them they were deceived, not careless, and what changed", "Säg att de lurades, inte var slarviga, och vad som ändrats"], "c10", ["Brings reporting back.", "Får tillbaka rapporteringen."], {
            pushback: [
              pb(["“So nobody is responsible?”", "”Så ingen ansvarar?”"], ["A senior manager objects in the meeting: if the message is that nobody was careless, why should anyone be careful next time? Others are quietly nodding. How do you answer without taking the message back?", "En högre chef invänder på mötet: om budskapet är att ingen var slarvig, varför ska någon vara försiktig nästa gång? Andra nickar tyst. Hur svarar ni utan att ta tillbaka budskapet?"]),
              pb(["What exactly changed?", "Vad exakt har ändrats?"], ["The message promises to tell them what changed. Someone asks: can anyone in the company still grant any app access to their mail today? If the answer is not a clear no, what exactly are you going to tell them changed?", "Budskapet lovar att berätta vad som har ändrats. Någon frågar: kan vem som helst i företaget fortfarande ge vilken app som helst åtkomst till sin e-post i dag? Om svaret inte är ett tydligt nej, vad exakt ska ni säga har ändrats?"]),
              pb(["Are names on file?", "Finns namnen sparade?"], ["Several of the {{num.users}} ask the same thing: was their name sent to management, and is it on their record? A reassuring message is easy; a promise that nothing is recorded may not be true. Can you make that promise, and who checks first?", "Flera av de {{num.users}} frågar samma sak: skickades deras namn till ledningen, och finns det i deras personalakt? Ett lugnande budskap är lätt; ett löfte om att inget är registrerat kanske inte stämmer. Kan ni ge det löftet, och vem kontrollerar först?"])
            ]
          }),
          opt(["Say nothing further", "Säg inget mer"], "c10", ["Leaves the rumours in place.", "Lämnar ryktena kvar."], {
            pushback: [
              pb(["“Am I under investigation?”", "”Är jag utredd?”"], ["One of the people who clicked Accept asks HR directly whether they are under investigation. HR has no instruction on what to say. Silence from the crisis team leaves HR to make it up. What should HR answer, today?", "En av dem som klickade Godkänn frågar HR rakt ut om hen är föremål för en utredning. HR har inga instruktioner om vad de ska säga. Krisledningens tystnad lämnar HR att hitta på ett svar. Vad ska HR svara, i dag?"]),
              pb(["Fewer reports", "Färre rapporter"], ["{{person.socLead.name}} notices that reports of suspicious emails from staff have dropped since the incident. Nobody wants to be the next name on a list. Is silence the message you want the whole company to take away?", "{{person.socLead.name}} märker att personalens rapporter om misstänkta mejl har minskat sedan incidenten. Ingen vill bli nästa namn på en lista. Är tystnad det budskap ni vill att hela företaget tar med sig?"]),
              pb(["A request in writing", "En begäran skriftligen"], ["A staff representative asks for a written statement on whether anyone will face consequences for clicking Accept. Saying nothing is no longer an option they will accept. Do you put an answer in writing, and what does it say?", "Ett personalombud begär ett skriftligt besked om huruvida någon kommer att få konsekvenser för att ha klickat Godkänn. Att inte säga något accepterar ombudet inte längre. Ger ni ett skriftligt svar, och vad står det i det?"])
            ]
          })
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "Three weeks later. The app is gone, the rules are removed and the regulator has your account of events. Most customers were warned in time.\n\nThe crisis team meets one last time. The question is not QuickSign, but the next app with a friendly name and a long list of permissions in small grey text.",
        "Tre veckor senare. Appen är borta, reglerna borttagna och tillsynsmyndigheten har er redogörelse. De flesta kunder varnades i tid.\n\nKrisledningen träffas en sista gång. Frågan är inte QuickSign, utan nästa app med ett vänligt namn och en lång lista behörigheter i liten grå text."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Makes broad app access require approval and alerts on new consents.", "Gör bred appåtkomst godkännandepliktig och larmar vid nya samtycken."], [
          opt(["Admin approval for broad permissions and alerts on new consents", "Administratörsgodkännande för breda behörigheter och larm vid nya samtycken"], "r-end", ["Closes the technique.", "Stänger tekniken."], {
            pushback: [
              pb(["Alerts at night", "Larm på natten"], ["The SOC estimates dozens of new-consent alerts a day, most of them harmless. Nobody is staffed to triage them at night or at weekends. Who looks at the alert that matters when it arrives on a Saturday?", "SOC uppskattar dussintals larm om nya samtycken om dagen, de flesta ofarliga. Ingen är bemannad för att sortera dem på nätter och helger. Vem tittar på larmet som spelar roll när det kommer en lördag?"]),
              pb(["Rubber stamps", "Gummistämplar"], ["{{person.itOps.name}} worries that approvers will face a steady stream of requests from colleagues who need their tools today. Within weeks, approval may become a click as automatic as the Accept that caused this. What criteria will the approvers actually use?", "{{person.itOps.name}} oroar sig för att godkännarna kommer att möta en jämn ström av förfrågningar från kollegor som behöver sina verktyg i dag. Inom några veckor kan godkännandet bli ett klick lika automatiskt som det Godkänn som orsakade allt. Vilka kriterier ska godkännarna egentligen använda?"]),
              pb(["The business pays", "Verksamheten betalar"], ["{{person.serviceOwner.name}} says the approval step will slow every new customer integration by days, and the business was not asked. The crisis team is making a permanent decision for everyone. Who should own this trade-off?", "{{person.serviceOwner.name}} säger att godkännandesteget kommer att fördröja varje ny kundintegration med flera dagar, och att verksamheten inte tillfrågades. Krisledningen fattar ett permanent beslut åt alla. Vem borde äga den avvägningen?"])
            ]
          }),
          opt(["A blocklist of known malicious apps", "En blockeringslista med kända skadliga appar"], "r-end", ["Always one app behind.", "Alltid en app efter."], {
            pushback: [
              pb(["QuickSign was on no list", "QuickSign fanns inte på någon lista"], ["{{person.socLead.name}} asks a simple question: when QuickSign arrived, was it on any list of known malicious apps? It was not. What would a blocklist have stopped in this incident?", "{{person.socLead.name}} ställer en enkel fråga: när QuickSign dök upp, fanns den på någon lista över kända skadliga appar? Det gjorde den inte. Vad hade en blockeringslista stoppat i den här incidenten?"]),
              pb(["Who keeps it up to date?", "Vem håller den aktuell?"], ["A blocklist needs a source and someone to maintain it every week. Nobody has that in their job, and there is no feed you trust. Who owns the list, and what will it look like in six months?", "En blockeringslista behöver en källa och någon som underhåller den varje vecka. Ingen har det i sina arbetsuppgifter, och det finns inget flöde ni litar på. Vem äger listan, och hur ser den ut om sex månader?"]),
              pb(["Is the door closed?", "Är dörren stängd?"], ["{{person.ciso.name}} expects the auditors to ask whether the root cause has been fixed. With a blocklist, anyone can still grant any unknown app access to their mail. Can you honestly say the door is closed?", "{{person.ciso.name}} räknar med att revisorerna frågar om grundorsaken har åtgärdats. Med en blockeringslista kan vem som helst fortfarande ge vilken okänd app som helst åtkomst till sin e-post. Kan ni ärligt säga att dörren är stängd?"])
            ]
          }),
          opt(["Phishing simulations every month", "Nätfiskesimuleringar varje månad"], "r-end", ["Useful, and the setting is still open.", "Användbart, och inställningen är fortfarande öppen."], {
            pushback: [
              pb(["Tricked again", "Lurade igen"], ["{{person.hr.name}} warns that, straight after this incident, monthly fake emails from your own security team will feel like traps set for the people who were just fooled. Will reporting go up, or will people start hiding again?", "{{person.hr.name}} varnar för att månatliga falska mejl från ert eget säkerhetsteam, direkt efter den här incidenten, kommer att kännas som fällor för dem som just blev lurade. Kommer rapporteringen att öka, eller börjar folk gömma sig igen?"]),
              pb(["Person or setting?", "Människa eller inställning?"], ["The setting that let one email open {{num.users}} mailboxes is unchanged, so the simulations will measure people against a screen that will keep fooling some of them. When someone fails, who is at fault: the person, or the setting you left open?", "Inställningen som lät ett enda mejl öppna {{num.users}} brevlådor är oförändrad, så simuleringarna mäter människor mot en skärm som fortsätter att lura en del av dem. När någon misslyckas, vems är felet: personens, eller inställningen ni lät stå öppen?"]),
              pb(["Every month, forever", "Varje månad, för alltid"], ["Monthly simulations need someone to design, run and follow up every one, and the security team is already stretched. The first time a real incident clashes with the schedule, something gives. Who runs them, and what happens when they stop?", "Månatliga simuleringar kräver någon som utformar, genomför och följer upp varje omgång, och säkerhetsteamet är redan hårt belastat. Första gången en riktig incident krockar med schemat ger något vika. Vem genomför dem, och vad händer när de upphör?"])
            ]
          })
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["appRevoked", "consentLocked", "scoped"], "e1"],
          ["appRevoked", "e2"],
          ["consentLocked", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["A month later", "En månad senare"], ["The app lost its access within the first hour, the audit gave an exact picture for the regulator, and no new app can ask for broad access without approval.\n\nTwo weeks later, a different “signing app” email arrives. Three people click; the platform asks an administrator, who says no.", "Appen förlorade sin åtkomst inom den första timmen, granskningen gav en exakt bild till tillsynsmyndigheten och ingen ny app kan begära bred åtkomst utan godkännande.\n\nTvå veckor senare kommer ett mejl om en annan ”signeringsapp”. Tre personer klickar; plattformen frågar en administratör, som säger nej."], {
        ending: end(1, ["The door is closed", "Dörren är stängd"], [
          "The app was revoked at once, the damage scoped precisely, and consent now requires approval. The next attempt fails.",
          "Appen återkallades direkt, skadan kartlades exakt och samtycke kräver nu godkännande. Nästa försök misslyckas."
        ])
      }),
      pg("e2", ["A month later", "En månad senare"], ["The app was cut off quickly, so the damage stopped early. But the setting that let anyone consent is unchanged, or the scoping was rough.\n\nA month later, a “calendar assistant” app gets the same broad access from eleven people before the SOC notices.", "Appen kapades snabbt, så skadan stoppades tidigt. Men inställningen som låter vem som helst ge samtycke är oförändrad, eller så var kartläggningen grov.\n\nEn månad senare får en app som kallar sig ”kalenderassistent” samma breda åtkomst av elva personer innan SOC märker det."], {
        ending: end(2, ["Cut off, door still open", "Avkapad, dörren fortfarande öppen"], [
          "You revoked the app quickly, but the consent setting or the scoping was left unfinished. A similar app returns.",
          "Ni återkallade appen snabbt, men samtyckesinställningen eller kartläggningen lämnades oavslutad. En liknande app kommer tillbaka."
        ])
      }),
      pg("e3", ["A month later", "En månad senare"], ["New apps now need approval, but QuickSign itself kept its tokens for two days, because passwords were reset instead of the app being revoked.\n\nIn those two days it read the finance mailboxes again, and one customer paid a large invoice to the attacker's account.", "Nya appar kräver nu godkännande, men QuickSign behöll själv sina token i två dygn, eftersom lösenord återställdes i stället för att appen återkallades.\n\nUnder de två dygnen läste den ekonomibrevlådorna igen, och en kund betalade en stor faktura till angriparens konto."], {
        ending: end(3, ["Locked the wrong door first", "Låste fel dörr först"], [
          "Consent is now controlled, but the app kept its tokens for days. A customer pays the attacker.",
          "Samtycke styrs nu, men appen behöll sina token i flera dygn. En kund betalar till angriparen."
        ])
      }),
      pg("e4", ["Six weeks later", "Sex veckor senare"], ["The app kept its access for days, nobody scoped what it read, and anyone can still connect any app.\n\nSeveral customers paid invoices to the attacker. The regulator learned about it from one of them, and asks why the company did not know what the app had taken.", "Appen behöll sin åtkomst i flera dygn, ingen kartlade vad den läste och vem som helst kan fortfarande koppla in vilken app som helst.\n\nFlera kunder betalade fakturor till angriparen. Tillsynsmyndigheten fick veta det från en av dem, och frågar varför företaget inte visste vad appen hade tagit."], {
        ending: end(4, ["Permission granted", "Behörighet beviljad"], [
          "Without revoking the app, scoping the damage or controlling consent, the attacker kept reading and customers paid them.",
          "Utan att appen återkallades, skadan kartlades eller samtycket styrdes fortsatte angriparen att läsa och kunderna betalade till hen."
        ])
      }),

      // Break-away: keeping quiet.
      pg("x1", ["Quiet", "Tyst"], [
        "Finance confirms to the one customer that the email was fake, and says nothing to anyone else. The rules are removed, and the team hopes that is the end of it.\n\nThree days later, a different customer's payment for a large order does not arrive. Their accounts team says they paid, to the new bank details in your email.",
        "Ekonomi bekräftar för den enda kunden att mejlet var falskt och säger ingenting till någon annan. Reglerna tas bort, och teamet hoppas att det är slutet på det.\n\nTre dagar senare kommer en annan kunds betalning för en stor order inte fram. Deras ekonomiavdelning säger att de har betalat, till de nya bankuppgifterna i ert mejl."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Warns every customer at once and helps the victim recall the payment.", "Varnar alla kunder omedelbart och hjälper offret att återkalla betalningen."], [
          opt(["Warn everyone now and help with a recall", "Varna alla nu och hjälp till med en återkallelse"], "x2", ["Three days late.", "Tre dagar för sent."], {
            pushback: [
              pb(["Admitting the three days", "Att erkänna de tre dagarna"], ["{{person.comms.name}} asks how to word the warning: any honest version reveals that you knew about the hijacked threads three days ago. Customers will do the arithmetic. Do you say it plainly, or write around it?", "{{person.comms.name}} frågar hur varningen ska formuleras: varje ärlig version avslöjar att ni kände till de kapade trådarna för tre dagar sedan. Kunderna kommer att räkna. Säger ni det rakt ut, eller skriver ni runt det?"]),
              pb(["The bank wants a report", "Banken vill ha en anmälan"], ["The customer's bank will only try a recall with a formal fraud report and the details of the fake email, today. The customer asks you to supply them, which means handing over the thread and admitting what you knew. Who prepares it, right now?", "Kundens bank försöker bara återkalla betalningen med en formell bedrägerianmälan och uppgifterna om det falska mejlet, i dag. Kunden ber er ta fram dem, vilket innebär att lämna över tråden och erkänna vad ni visste. Vem tar fram det, just nu?"]),
              pb(["Is the invoice paid?", "Är fakturan betald?"], ["The customer asks whether you will treat their invoice as paid, since they paid in good faith to details from your own thread. Saying yes costs you the invoice; saying no costs you the customer. What do you answer while helping with the recall?", "Kunden frågar om ni betraktar fakturan som betald, eftersom de betalade i god tro till uppgifter från er egen tråd. Ett ja kostar er fakturan; ett nej kostar er kunden. Vad svarar ni medan ni hjälper till med återkallelsen?"])
            ]
          }),
          opt(["Tell the customer it was their responsibility to verify", "Säg till kunden att det var deras ansvar att kontrollera"], "x2", ["Technically arguable. Commercially disastrous.", "Tekniskt försvarbart. Kommersiellt katastrofalt."], {
            pushback: [
              pb(["Their lawyer replies", "Deras jurist svarar"], ["Within the hour, the customer's lawyer writes back with one question: on what date did you first know your mailboxes were compromised? You have a record of that date. Do you answer, and does your position survive the answer?", "Inom en timme svarar kundens jurist med en enda fråga: vilket datum visste ni första gången att era brevlådor var komprometterade? Ni har det datumet dokumenterat. Svarar ni, och håller er ståndpunkt när ni gör det?"]),
              pb(["The account manager", "Den kundansvarige"], ["The account manager for this customer says it is one of your largest, and this answer will end the relationship. They ask who approved sending it. Is being technically right worth losing the customer?", "Den kundansvarige för den här kunden säger att det är en av era största, och att det här svaret avslutar relationen. Hen frågar vem som godkände att det skickades. Är det värt att förlora kunden för att ha tekniskt rätt?"]),
              pb(["What should they have checked?", "Vad borde de ha kontrollerat?"], ["The customer points out that the email arrived in the middle of a real thread, from your billing address, with your own invoice attached. They ask what more they were supposed to check. Can you name the check you expected, and did you tell them to do it?", "Kunden påpekar att mejlet kom mitt i en verklig tråd, från er faktureringsadress, med er egen faktura bifogad. De frågar vad mer de borde ha kontrollerat. Kan ni nämna kontrollen ni förväntade er, och bad ni dem någonsin göra den?"])
            ]
          })
        ])
      }),
      pg("x2", ["More payments", "Fler betalningar"], [
        "Once you start asking, two more customers find they paid the new account. The bank can recall part of one payment. The rest is gone.\n\nThe customers ask the same question: you knew on Tuesday that your email was compromised, so why did you not tell us?",
        "När ni väl börjar fråga upptäcker ytterligare två kunder att de betalat till det nya kontot. Banken kan återkalla en del av en betalning. Resten är borta.\n\nKunderna ställer samma fråga: ni visste i tisdags att er e-post var komprometterad, så varför sa ni inget till oss?"
      ], {
        choice: ask(["How do you answer the customers?", "Hur svarar ni kunderna?"], ["Takes responsibility and discusses compensation.", "Tar ansvar och diskuterar ersättning."], [
          opt(["Take responsibility and discuss compensation", "Ta ansvar och diskutera ersättning"], "x3", ["Expensive and honest.", "Dyrt och ärligt."], {
            pushback: [
              pb(["The insurer's warning", "Försäkringsbolagets varning"], ["Your insurer warns that admitting liability before they have assessed the claim may affect your cover. The customers want an answer this week. Do you admit responsibility now, or make the customers wait for the insurer?", "Försäkringsbolaget varnar för att ett erkännande av ansvar innan de har bedömt skadan kan påverka ert skydd. Kunderna vill ha svar den här veckan. Erkänner ni ansvar nu, eller låter ni kunderna vänta på försäkringsbolaget?"]),
              pb(["Whose budget?", "Vems budget?"], ["{{person.cfo.name}} asks who has the authority to approve compensation that no budget covers, and from which department's money it comes. Nobody in the room has that mandate on their own. Who decides, and how fast?", "{{person.cfo.name}} frågar vem som har mandat att godkänna en ersättning som ingen budget täcker, och från vilken avdelnings pengar den ska tas. Ingen i rummet har det mandatet på egen hand. Vem bestämmer, och hur snabbt?"]),
              pb(["Where does it end?", "Var tar det slut?"], ["A fourth customer, who did not pay the fake account, asks for a discount for the disruption and the extra checks they now have to do. Once you accept responsibility for some, where do you draw the line?", "En fjärde kund, som inte betalade till det falska kontot, begär rabatt för störningen och de extra kontroller de nu måste göra. När ni väl tagit ansvar för några, var drar ni gränsen?"])
            ]
          }),
          opt(["Point to the customers' own controls", "Hänvisa till kundernas egna kontroller"], "x3", ["Their lawyers will point back.", "Deras jurister kommer att peka tillbaka."], {
            pushback: [
              pb(["They compare notes", "De jämför"], ["The three customers talk to each other and find they all received the same email, from inside your real threads, after you knew. Their joint letter asks whose controls failed first. What is your answer?", "De tre kunderna pratar med varandra och upptäcker att alla fick samma mejl, inifrån era verkliga trådar, efter att ni visste. Deras gemensamma brev frågar vems kontroller som brast först. Vad svarar ni?"]),
              pb(["Logs on request", "Loggar på begäran"], ["One customer's lawyer formally requests your audit logs and the timeline of what you knew about the forwarding rules. Refusing looks like hiding; handing them over shows the days of silence. Which do you choose?", "En kunds jurist begär formellt era granskningsloggar och tidslinjen över vad ni visste om vidarebefordringsreglerna. Att vägra ser ut som att dölja; att lämna ut dem visar dagarna av tystnad. Vad väljer ni?"]),
              pb(["Sales sees the exits", "Försäljning ser utgångarna"], ["Account managers report that all three customers have mentioned ending their contracts, and one is talking to a competitor. Winning the argument about controls will not keep them. Is being right worth more than the customers?", "De kundansvariga rapporterar att alla tre kunder har nämnt att säga upp sina avtal, och att en pratar med en konkurrent. Att vinna diskussionen om kontroller håller inte kvar dem. Är det värt mer att ha rätt än att ha kunderna?"])
            ]
          })
        ])
      }),
      pg("x3", ["The regulator and the press", "Tillsynsmyndigheten och pressen"], [
        "One of the customers has complained to the regulator and talked to a trade journalist. The story is simple: a company knew its email was hijacked and let customers pay fraudsters for three days.\n\nThe regulator asks for your timeline, including when you first knew about the forwarding rules.",
        "En av kunderna har klagat hos tillsynsmyndigheten och pratat med en fackjournalist. Historien är enkel: ett företag visste att dess e-post var kapad och lät kunder betala bedragare i tre dagar.\n\nTillsynsmyndigheten begär er tidslinje, inklusive när ni först kände till vidarebefordringsreglerna."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Gives the full timeline, including the decision to keep quiet.", "Lämnar hela tidslinjen, inklusive beslutet att hålla tyst."], [
          opt(["The full timeline, including the silence", "Hela tidslinjen, inklusive tystnaden"], "x4", ["It will hurt; it is the truth.", "Det kommer att göra ont; det är sanningen."], {
            pushback: [
              pb(["Evidence against you", "Bevis mot er"], ["{{person.legal.name}} warns that writing down the decision to keep quiet hands the regulator and the customers' lawyers the strongest evidence they will ever have. They ask you to reconsider the wording. Do you keep it in, word for word?", "{{person.legal.name}} varnar för att en nedskriven redogörelse för beslutet att tiga ger tillsynsmyndigheten och kundernas jurister det starkaste belägg de någonsin kommer att få. Juristen ber er överväga formuleringen. Behåller ni den, ord för ord?"]),
              pb(["Who decided?", "Vem beslutade?"], ["A full timeline must say who decided to keep quiet, and when. Some of those people are in this room. Do you name them, and how do you protect the ones who argued against it?", "En fullständig tidslinje måste ange vem som beslutade att tiga, och när. En del av de personerna sitter i det här rummet. Namnger ni dem, och hur skyddar ni dem som argumenterade emot?"]),
              pb(["The journalist calls", "Journalisten ringer"], ["The trade journalist asks for comment the same day you send the timeline. Anything you tell the regulator may become public anyway. Do you say the same thing to the press, and who says it?", "Fackjournalisten ber om en kommentar samma dag som ni skickar tidslinjen. Allt ni berättar för tillsynsmyndigheten kan bli offentligt ändå. Säger ni samma sak till pressen, och vem säger det?"])
            ]
          }),
          opt(["A timeline that starts with the first fraud", "En tidslinje som börjar med det första bedrägeriet"], "x4", ["The logs start earlier.", "Loggarna börjar tidigare."], {
            pushback: [
              pb(["The logs start earlier", "Loggarna börjar tidigare"], ["The regulator can ask for your audit logs, which show the forwarding rules found and removed days before the first fraud. Anyone comparing them with your timeline will see the gap. What do you say when they ask about it?", "Tillsynsmyndigheten kan begära era granskningsloggar, som visar att vidarebefordringsreglerna hittades och togs bort dagar före det första bedrägeriet. Den som jämför dem med er tidslinje ser luckan. Vad säger ni när de frågar om den?"]),
              pb(["The DPO will not sign", "Dataskyddsombudet skriver inte under"], ["{{person.dpo.name}} refuses to put their name to a timeline they know is incomplete, and says so in writing. The regulator will expect the DPO's name on it. Do you send it without them?", "{{person.dpo.name}} vägrar att sätta sitt namn på en tidslinje hen vet är ofullständig, och säger det skriftligt. Tillsynsmyndigheten förväntar sig dataskyddsombudets namn på den. Skickar ni den utan hen?"]),
              pb(["The customer's copy", "Kundens kopia"], ["The customer who complained still has your email confirming that the first fake message was fraudulent, dated days before your timeline begins. They have already shared it with the regulator. How does your timeline survive that one email?", "Kunden som klagade har fortfarande ert mejl som bekräftade att det första falska meddelandet var ett bedrägeri, daterat dagar innan er tidslinje börjar. De har redan delat det med tillsynsmyndigheten. Hur klarar sig er tidslinje mot det enda mejlet?"])
            ]
          })
        ])
      }),
      pg("x4", ["The customers leave", "Kunderna lämnar"], [
        "Two of the defrauded customers end their contracts. A third agrees to stay if you cover its loss.\n\nInside the company, the decision to stay quiet has become the story everyone tells about the incident, more than the app itself.",
        "Två av de lurade kunderna säger upp sina avtal. En tredje går med på att stanna om ni täcker dess förlust.\n\nInom företaget har beslutet att hålla tyst blivit den historia alla berättar om incidenten, mer än själva appen."
      ], {
        choice: ask(["What do you take from it?", "Vad tar ni med er?"], ["Writes customer warning into the incident plan.", "Skriver in varningar till kunder i incidentplanen."], [
          opt(["Customer warning becomes a fixed step in the plan", "Varningar till kunder blir ett fast steg i planen"], "e5", ["Learned the hard way.", "En dyrköpt lärdom."], {
            pushback: [
              pb(["A step nobody owns", "Ett steg som ingen äger"], ["Finance thinks comms should own customer warnings; comms thinks security should; security thinks finance knows the customers. If the step belongs to everyone, it belongs to no one. Who, by name, owns it?", "Ekonomi tycker att kommunikation ska äga kundvarningar; kommunikation tycker att säkerhet ska; säkerhet tycker att ekonomi känner kunderna. Om steget tillhör alla tillhör det ingen. Vem, med namn, äger det?"]),
              pb(["Warning too early", "För tidig varning"], ["{{person.legal.name}} worries that a fixed step means warning customers in every incident, including false alarms, before facts are known. Customers will learn to ignore you. Where exactly is the threshold, and who decides it in the moment?", "{{person.legal.name}} oroar sig för att ett fast steg innebär att kunder varnas vid varje incident, även falsklarm, innan fakta är kända. Kunderna lär sig att ignorera er. Var går tröskeln exakt, och vem avgör den i stunden?"]),
              pb(["The third customer waits", "Den tredje kunden väntar"], ["A plan protects the next customers. The third customer is still waiting to hear whether you will cover its loss, and has asked twice. Is writing the plan a way of avoiding that decision?", "En plan skyddar nästa kunder. Den tredje kunden väntar fortfarande på besked om ni täcker dess förlust, och har frågat två gånger. Är arbetet med planen ett sätt att slippa det beslutet?"])
            ]
          }),
          opt(["Treat it as bad luck", "Betrakta det som otur"], "e5", ["It was a decision.", "Det var ett beslut."], {
            pushback: [
              pb(["Staff know better", "Personalen vet bättre"], ["Inside the company, everyone tells the story of the decision to stay quiet. Calling it bad luck tells staff that decisions in a crisis carry no accountability. Is that the lesson you want the next crisis team to learn?", "Inom företaget berättar alla historien om beslutet att tiga. Att kalla det otur säger till personalen att beslut i en kris inte medför något ansvar. Är det den lärdomen ni vill att nästa krisledning ska dra?"]),
              pb(["The regulator asks", "Tillsynsmyndigheten frågar"], ["The regulator's open case includes a question: what have you changed since? “It was bad luck” is not a change. What will you write in the reply?", "Tillsynsmyndighetens öppna ärende innehåller en fråga: vad har ni ändrat sedan dess? ”Det var otur” är ingen förändring. Vad skriver ni i svaret?"]),
              pb(["Bad luck for whom?", "Otur för vem?"], ["The third customer, still waiting for an answer on its loss, hears how the incident is being described internally. They ask whether your company also considers their payment bad luck. What do you tell them?", "Den tredje kunden, som fortfarande väntar på besked om sin förlust, hör hur incidenten beskrivs internt. De frågar om ert företag också betraktar deras betalning som otur. Vad säger ni till dem?"])
            ]
          })
        ])
      }),
      pg("e5", ["Three months later", "Tre månader senare"], ["A consent prompt became stolen mail, and staying quiet turned stolen mail into customers paying criminals for three days.\n\nTwo customers are gone and the regulator's case is open. The app was revoked on the first day; the silence lasted longer.", "En samtyckesfråga blev stulen e-post, och tystnaden gjorde stulen e-post till kunder som betalade brottslingar i tre dagar.\n\nTvå kunder är borta och tillsynsmyndighetens ärende är öppet. Appen återkallades den första dagen; tystnaden varade längre."], {
        ending: end(5, ["The silence cost the most", "Tystnaden kostade mest"], [
          "Keeping quiet about the hijacked threads let the fraud run for days. Customers paid the attacker and two of them left.",
          "Att tiga om de kapade trådarna lät bedrägeriet pågå i flera dagar. Kunder betalade till angriparen och två av dem lämnade."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Consent phishing steals permission, not passwords: revoke the app and its tokens.", "Nätfiske via samtycke stjäl behörighet, inte lösenord: återkalla appen och dess token."]),
        L(["Audit what the app read and changed; hidden mail rules are the attacker's foothold.", "Granska vad appen läste och ändrade; dolda e-postregler är angriparens fotfäste."]),
        L(["Warn customers in hijacked threads quickly; silence funds the fraud.", "Varna kunder i kapade trådar snabbt; tystnad finansierar bedrägeriet."]),
        L(["Require approval for apps that ask for broad access.", "Kräv godkännande för appar som begär bred åtkomst."])
      ],
      strengthsToLookFor: [
        L(["Revoking the app instead of resetting passwords", "Att återkalla appen i stället för att återställa lösenord"]),
        L(["Hunting for inbox rules across all mailboxes", "Att leta efter inkorgsregler i alla brevlådor"]),
        L(["Warning every customer with an open invoice", "Att varna varje kund med en öppen faktura"])
      ],
      commonGaps: [
        L(["Password resets as the main response", "Lösenordsbyten som huvudsaklig åtgärd"]),
        L(["Missing the forwarding rules", "Att missa vidarebefordringsreglerna"]),
        L(["Blaming the users who clicked", "Att skuldbelägga användarna som klickade"])
      ],
      suggestedActions: [
        act(["Require admin approval for apps requesting mail or file access.", "Kräv administratörsgodkännande för appar som begär åtkomst till e-post eller filer."], "itOps", "high"),
        act(["Alert on new app consents and new forwarding rules.", "Larma vid nya appsamtycken och nya vidarebefordringsregler."], "socLead", "high"),
        act(["Review all connected apps twice a year.", "Granska alla anslutna appar två gånger om året."], "ciso", "medium"),
        act(["Add customer warnings to the payment fraud runbook.", "Lägg till varningar till kunder i rutinen för betalningsbedrägerier."], "cfo", "medium")
      ]
    }
  });
})();
