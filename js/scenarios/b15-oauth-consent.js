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
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

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
          opt(["Disable the app and revoke its tokens company-wide", "Inaktivera appen och återkalla dess token i hela företaget"], "c2", ["Cuts the access at the source.", "Kapar åtkomsten vid källan."], { set: "appRevoked" }),
          opt(["Reset the passwords of the users who consented", "Återställ lösenorden för användarna som gav samtycke"], "c2", ["Feels decisive. The app's tokens keep working.", "Känns kraftfullt. Appens token fortsätter att fungera."]),
          opt(["Block the sender's domain", "Blockera avsändarens domän"], "c2", ["Stops new victims. Existing access remains.", "Stoppar nya offer. Befintlig åtkomst finns kvar."])
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
          opt(["Audit everything the app accessed and changed", "Granska allt appen kom åt och ändrade"], "l1", ["The only way to know the damage.", "Det enda sättet att få veta skadan."], { set: "scoped" }),
          opt(["Check a sample of the affected mailboxes", "Kontrollera ett urval av de drabbade brevlådorna"], "l1", ["Faster, and partial.", "Snabbare, och ofullständigt."]),
          opt(["Ask the users what they remember", "Fråga användarna vad de minns"], "c3b", ["Human, and they did not see what the app did.", "Mänskligt, och de såg inte vad appen gjorde."])
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
          opt(["Classify everything read and downloaded", "Klassificera allt som lästes och laddades ner"], "c3", ["Days of work, and the basis for every later decision.", "Flera dagars arbete, och grunden för varje senare beslut."], { set: "scoped" }),
          opt(["Estimate from the file names", "Uppskatta utifrån filnamnen"], "c3", ["Quick, and often wrong.", "Snabbt, och ofta fel."])
        ])
      }),

      pg("c3", ["Anyone can say yes", "Vem som helst kan säga ja"], [
        "{{person.ciso.name}} checks the platform's settings. Any employee can grant any app access to their own mail and files, without asking anyone. It has been that way since the company moved to the platform.\n\nIt is the default setting. It is also the reason a single convincing email could open thirty mailboxes in an hour.",
        "{{person.ciso.name}} kontrollerar plattformens inställningar. Vilken anställd som helst kan ge vilken app som helst åtkomst till sin egen e-post och sina filer, utan att fråga någon. Det har varit så sedan företaget flyttade till plattformen.\n\nDet är standardinställningen. Det är också anledningen till att ett enda övertygande mejl kunde öppna trettio brevlådor på en timme."
      ], {
        choice: ask(["Do you change the setting?", "Ändrar ni inställningen?"], ["Requires admin approval for apps asking for broad access, with a fast request route.", "Kräver administratörsgodkännande för appar som begär bred åtkomst, med en snabb väg för förfrågningar."], [
          opt(["Require admin approval for apps that request broad access", "Kräv administratörsgodkännande för appar som begär bred åtkomst"], "c4", ["Closes the door; needs a quick approval route.", "Stänger dörren; kräver en snabb godkännandeväg."], { set: "consentLocked" }),
          opt(["Block this one publisher", "Blockera just den här utgivaren"], "c4", ["The next app will have a different name.", "Nästa app kommer att ha ett annat namn."]),
          opt(["Block all third-party apps", "Blockera alla tredjepartsappar"], "c4", ["Safe, and breaks dozens of tools people use.", "Säkert, och förstör dussintals verktyg som folk använder."], { set: "consentLocked" })
        ])
      }),

      pg("c3b", ["The users", "Användarna"], [
        "{{person.hr.name}} talks to some of the {{num.users}}. They all say the same thing: the email looked like the signing service HR used last year, the sign-in page was the real company login, and the permission screen looked like every other one they have clicked through.\n\nSeveral are frightened that they will be disciplined. One manager wants exactly that.",
        "{{person.hr.name}} pratar med några av de {{num.users}}. Alla säger samma sak: mejlet såg ut som signeringstjänsten som HR använde förra året, inloggningssidan var företagets riktiga inloggning och behörighetsskärmen såg ut som alla andra de har klickat sig igenom.\n\nFlera är rädda för att de kommer att få disciplinära åtgärder. En chef vill just det."
      ], {
        choice: ask(["How do you treat the users?", "Hur bemöter ni användarna?"], ["Treats them as victims of a convincing attack and learns from them.", "Behandlar dem som offer för ett övertygande angrepp och lär sig av dem."], [
          opt(["Reassure them and ask what would have warned them", "Lugna dem och fråga vad som hade kunnat varna dem"], "c4", ["They become your best source.", "De blir er bästa källa."]),
          opt(["Note it as a breach of the security policy", "Notera det som ett brott mot säkerhetsriktlinjerna"], "c4", ["The next person will not report.", "Nästa person kommer inte att rapportera."], { set: "usersBlamed" })
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
          opt(["Remove them and search every mailbox for similar rules", "Ta bort dem och sök igenom varje brevlåda efter liknande regler"], "l2", ["Finds any you missed.", "Hittar de ni missat."], { set: "rulesRemoved" }),
          opt(["Remove the four rules", "Ta bort de fyra reglerna"], "l2", ["Fixes what you found.", "Rättar det ni hittade."])
        ])
      }),

      pg("l2", ["Open invoices", "Öppna fakturor"], [
        "Finance lists every invoice conversation the four mailboxes were part of in the last month: about forty customers, some with large payments due this week.\n\nThe forwarded copies mean someone outside knows who owes what, when, and what the emails look like. That is everything needed to send a convincing “our bank details have changed” message.",
        "Ekonomi listar varje fakturakonversation som de fyra brevlådorna deltog i den senaste månaden: omkring fyrtio kunder, en del med stora betalningar som förfaller den här veckan.\n\nDe vidarebefordrade kopiorna innebär att någon utanför vet vem som är skyldig vad, när, och hur mejlen ser ut. Det är allt som behövs för att skicka ett övertygande meddelande om att ”våra bankuppgifter har ändrats”."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["Do you act on the invoice threads now?", "Agerar ni på fakturatrådarna nu?"], ["Prepares to warn every customer in an active thread.", "Förbereder en varning till varje kund i en aktiv tråd."], [
          opt(["Prepare a warning for every customer with an open invoice", "Förbered en varning till varje kund med en öppen faktura"], "c5", ["Ready before the fraud attempt arrives.", "Klar innan bedrägeriförsöket kommer."]),
          opt(["Wait and see whether any fraud happens", "Vänta och se om något bedrägeri sker"], "c5", ["The fraud will arrive first.", "Bedrägeriet kommer först."])
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
          opt(["Within 72 hours, supplementing later", "Inom 72 timmar, med senare kompletteringar"], "l3", ["Meets the duty.", "Uppfyller skyldigheten."], { set: "notified" }),
          opt(["After the scoping is complete", "När kartläggningen är klar"], "l3", ["More complete, probably late.", "Mer komplett, troligen sent."], { set: "notifyLate" })
        ])
      }),

      pg("l3", ["Verified?", "Verifierad?"], [
        "{{person.socLead.name}} looks at the app's registration. It was created in another company's account on the same platform, a small firm whose own admin account appears to have been compromised.\n\nThe app used that firm's name and logo. To the platform, it looked like a legitimate business app from a real company.",
        "{{person.socLead.name}} tittar på appens registrering. Den skapades i ett annat företags konto på samma plattform, ett litet företag vars eget administratörskonto verkar ha komprometterats.\n\nAppen använde det företagets namn och logotyp. För plattformen såg den ut som en legitim affärsapp från ett riktigt företag."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["Do you tell the other company?", "Berättar ni för det andra företaget?"], ["Warns the firm whose account was abused.", "Varnar företaget vars konto missbrukades."], [
          opt(["Warn them directly", "Varna dem direkt"], "c6", ["They are victims too.", "De är också offer."]),
          opt(["Leave it to the platform", "Lämna det åt plattformen"], "c6", ["Slower.", "Långsammare."])
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
          opt(["Warn every customer with an open invoice, today", "Varna varje kund med en öppen faktura, i dag"], "c7", ["Embarrassing, and it stops the fraud.", "Pinsamt, och det stoppar bedrägeriet."], { set: "customersWarned" }),
          opt(["Confirm to this customer that it is fake", "Bekräfta för den här kunden att det är falskt"], "c7", ["Saves one payment.", "Räddar en betalning."]),
          opt(["Keep quiet and fix it internally", "Håll tyst och åtgärda det internt"], "x1", ["Avoids embarrassment, for now.", "Undviker pinsamhet, för stunden."])
        ])
      }),

      pg("c7", ["Every other app", "Alla andra appar"], [
        "Now that everyone is looking, {{person.itOps.name}} lists every third-party app with permission to company data. There are {{num.apps}}.\n\nSome are well-known business tools. Many were connected by a single employee years ago and never looked at again. Several have permission to read all mail.",
        "Nu när alla tittar listar {{person.itOps.name}} varje tredjepartsapp med behörighet till företagets data. Det finns {{num.apps}}.\n\nEn del är välkända affärsverktyg. Många kopplades in av en enskild anställd för flera år sedan och har aldrig granskats sedan dess. Flera har behörighet att läsa all e-post."
      ], {
        choice: ask(["What do you do about the other apps?", "Vad gör ni med de andra apparna?"], ["Reviews all of them, removing broad permissions nobody can justify.", "Granskar alla, och tar bort breda behörigheter som ingen kan motivera."], [
          opt(["Review all of them and remove what nobody needs", "Granska alla och ta bort det ingen behöver"], "l4", ["Tedious, and you will find surprises.", "Tråkigt, och ni kommer att hitta överraskningar."], { set: "allAppsReviewed" }),
          opt(["Review only apps that can read mail", "Granska bara appar som kan läsa e-post"], "l4", ["A sensible start.", "En vettig början."])
        ])
      }),

      pg("l4", ["What would have warned them?", "Vad hade kunnat varna dem?"], [
        "The users who were willing to talk give the same answer: nothing looked wrong. The permission screen showed a name, a logo, and a list of permissions in small grey text.\n\nNone of them had ever been told that “allow this app to read your mail” is as serious as giving someone your password.",
        "De användare som var villiga att prata ger samma svar: inget såg fel ut. Behörighetsskärmen visade ett namn, en logotyp och en lista med behörigheter i liten grå text.\n\nIngen av dem hade någonsin fått höra att ”tillåt den här appen att läsa din e-post” är lika allvarligt som att ge någon sitt lösenord."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["How do you change awareness?", "Hur förändrar ni medvetenheten?"], ["Explains consent screens with real examples, and relies on settings rather than training alone.", "Förklarar samtyckesskärmar med verkliga exempel, och förlitar sig på inställningar snarare än enbart utbildning."], [
          opt(["Short, real examples of consent screens for all staff", "Korta, verkliga exempel på samtyckesskärmar för all personal"], "c8", ["Memorable, if short.", "Minnesvärt, om det är kort."]),
          opt(["Add it to the annual security course", "Lägg till det i den årliga säkerhetskursen"], "c8", ["Next year.", "Nästa år."])
        ])
      }),

      pg("c8", ["The platform", "Plattformen"], [
        "The platform provider has a process for reporting malicious apps. Reporting it could get the app disabled for every company it has reached, not only yours.\n\nIt takes a careful write-up with the app's identifiers and evidence, at a time when the team is busy with customers.",
        "Plattformsleverantören har en process för att rapportera skadliga appar. En rapport kan leda till att appen inaktiveras för varje företag den har nått, inte bara för er.\n\nDet kräver en noggrann sammanställning med appens identifierare och belägg, vid en tidpunkt då teamet har fullt upp med kunderna."
      ], {
        choice: ask(["Do you report the app?", "Rapporterar ni appen?"], ["Reports it with evidence, protecting others.", "Rapporterar den med belägg, och skyddar andra."], [
          opt(["Report it with evidence", "Rapportera den med belägg"], "c9", ["Helps everyone it targeted.", "Hjälper alla den riktade sig mot."], { set: "vendorReported" }),
          opt(["Not now", "Inte nu"], "c9", ["It will keep working elsewhere.", "Den fortsätter att fungera på andra håll."])
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
          opt(["Tell them they were deceived, not careless, and what changed", "Säg att de lurades, inte var slarviga, och vad som ändrats"], "c10", ["Brings reporting back.", "Får tillbaka rapporteringen."]),
          opt(["Say nothing further", "Säg inget mer"], "c10", ["Leaves the rumours in place.", "Lämnar ryktena kvar."])
        ])
      }),

      pg("c10", ["What changes", "Vad som ändras"], [
        "Three weeks later. The app is gone, the rules are removed and the regulator has your account of events. Most customers were warned in time.\n\nThe crisis team meets one last time. The question is not QuickSign, but the next app with a friendly name and a long list of permissions in small grey text.",
        "Tre veckor senare. Appen är borta, reglerna borttagna och tillsynsmyndigheten har er redogörelse. De flesta kunder varnades i tid.\n\nKrisledningen träffas en sista gång. Frågan är inte QuickSign, utan nästa app med ett vänligt namn och en lång lista behörigheter i liten grå text."
      ], {
        choice: ask(["What do you change first?", "Vad ändrar ni först?"], ["Makes broad app access require approval and alerts on new consents.", "Gör bred appåtkomst godkännandepliktig och larmar vid nya samtycken."], [
          opt(["Admin approval for broad permissions and alerts on new consents", "Administratörsgodkännande för breda behörigheter och larm vid nya samtycken"], "r-end", ["Closes the technique.", "Stänger tekniken."]),
          opt(["A blocklist of known malicious apps", "En blockeringslista med kända skadliga appar"], "r-end", ["Always one app behind.", "Alltid en app efter."]),
          opt(["Phishing simulations every month", "Nätfiskesimuleringar varje månad"], "r-end", ["Useful, and the setting is still open.", "Användbart, och inställningen är fortfarande öppen."])
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
          opt(["Warn everyone now and help with a recall", "Varna alla nu och hjälp till med en återkallelse"], "x2", ["Three days late.", "Tre dagar för sent."]),
          opt(["Tell the customer it was their responsibility to verify", "Säg till kunden att det var deras ansvar att kontrollera"], "x2", ["Technically arguable. Commercially disastrous.", "Tekniskt försvarbart. Kommersiellt katastrofalt."])
        ])
      }),
      pg("x2", ["More payments", "Fler betalningar"], [
        "Once you start asking, two more customers find they paid the new account. The bank can recall part of one payment. The rest is gone.\n\nThe customers ask the same question: you knew on Tuesday that your email was compromised, so why did you not tell us?",
        "När ni väl börjar fråga upptäcker ytterligare två kunder att de betalat till det nya kontot. Banken kan återkalla en del av en betalning. Resten är borta.\n\nKunderna ställer samma fråga: ni visste i tisdags att er e-post var komprometterad, så varför sa ni inget till oss?"
      ], {
        choice: ask(["How do you answer the customers?", "Hur svarar ni kunderna?"], ["Takes responsibility and discusses compensation.", "Tar ansvar och diskuterar ersättning."], [
          opt(["Take responsibility and discuss compensation", "Ta ansvar och diskutera ersättning"], "x3", ["Expensive and honest.", "Dyrt och ärligt."]),
          opt(["Point to the customers' own controls", "Hänvisa till kundernas egna kontroller"], "x3", ["Their lawyers will point back.", "Deras jurister kommer att peka tillbaka."])
        ])
      }),
      pg("x3", ["The regulator and the press", "Tillsynsmyndigheten och pressen"], [
        "One of the customers has complained to the regulator and talked to a trade journalist. The story is simple: a company knew its email was hijacked and let customers pay fraudsters for three days.\n\nThe regulator asks for your timeline, including when you first knew about the forwarding rules.",
        "En av kunderna har klagat hos tillsynsmyndigheten och pratat med en fackjournalist. Historien är enkel: ett företag visste att dess e-post var kapad och lät kunder betala bedragare i tre dagar.\n\nTillsynsmyndigheten begär er tidslinje, inklusive när ni först kände till vidarebefordringsreglerna."
      ], {
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Gives the full timeline, including the decision to keep quiet.", "Lämnar hela tidslinjen, inklusive beslutet att hålla tyst."], [
          opt(["The full timeline, including the silence", "Hela tidslinjen, inklusive tystnaden"], "x4", ["It will hurt; it is the truth.", "Det kommer att göra ont; det är sanningen."]),
          opt(["A timeline that starts with the first fraud", "En tidslinje som börjar med det första bedrägeriet"], "x4", ["The logs start earlier.", "Loggarna börjar tidigare."])
        ])
      }),
      pg("x4", ["The customers leave", "Kunderna lämnar"], [
        "Two of the defrauded customers end their contracts. A third agrees to stay if you cover its loss.\n\nInside the company, the decision to stay quiet has become the story everyone tells about the incident, more than the app itself.",
        "Två av de lurade kunderna säger upp sina avtal. En tredje går med på att stanna om ni täcker dess förlust.\n\nInom företaget har beslutet att hålla tyst blivit den historia alla berättar om incidenten, mer än själva appen."
      ], {
        choice: ask(["What do you take from it?", "Vad tar ni med er?"], ["Writes customer warning into the incident plan.", "Skriver in varningar till kunder i incidentplanen."], [
          opt(["Customer warning becomes a fixed step in the plan", "Varningar till kunder blir ett fast steg i planen"], "e5", ["Learned the hard way.", "En dyrköpt lärdom."]),
          opt(["Treat it as bad luck", "Betrakta det som otur"], "e5", ["It was a decision.", "Det var ett beslut."])
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
