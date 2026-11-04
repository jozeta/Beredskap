/*
 * s07-mfa-fatigue-aitm.js — "Approve, Approve, Approve" (archetype A).
 *
 * Repeated MFA prompts at night → one user approved → but the real foothold is
 * a session token stolen through an adversary-in-the-middle page, which a
 * password reset does not revoke → mailbox and files searched → internal
 * phishing from a trusted account → an OAuth app consent keeps access after
 * every reset → personal data exposure → blame versus design → the cost of
 * phishing-resistant MFA.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s07-mfa-fatigue-aitm",
    version: 1,
    category: "identity",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "mfa",
    title: L(["Approve, Approve, Approve", "Godkänn, godkänn, godkänn"]),
    summary: L([
      "Dozens of sign-in prompts in the middle of the night, and finally someone taps “approve”. Resetting the password feels like the end of it. It is the beginning.",
      "Dussintals inloggningsförfrågningar mitt i natten, och till slut trycker någon på ”godkänn”. Att byta lösenordet känns som slutet på saken. Det är början."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Contain an identity compromise beyond a password reset", "Begränsa ett identitetsintrång bortom ett lösenordsbyte"]), teaser: L(["What it takes to be sure", "Vad som krävs för att vara säker"]) },
      { id: "lo2", text: L(["Scope mailbox and file access by an attacker", "Avgränsa en angripares åtkomst till e-post och filer"]), teaser: L(["Mapping what was touched", "Att kartlägga vad som har rörts"]) },
      { id: "lo3", text: L(["Stop internal phishing spreading through trust", "Stoppa intern nätfiske som sprids genom förtroende"]), teaser: L(["How trust spreads", "Hur förtroende sprids"]) },
      { id: "lo4", text: L(["Treat users as part of the defence, not the cause", "Behandla användare som en del av försvaret, inte som orsaken"]), teaser: L(["How you see your colleagues", "Hur ni ser på era kollegor"]) }
    ],
    mitre: ["T1621", "T1557", "T1539", "T1078", "T1114", "T1213", "T1534", "T1528", "T1098"],
    frameworks: {
      nistCsf: ["PR.AA", "PR.AT", "DE.CM", "DE.AE", "RS.MA", "RS.AN", "RS.MI", "RS.CO", "ID.IM"],
      iso27001: ["A.5.16", "A.5.17", "A.5.18", "A.5.24", "A.5.26", "A.5.34", "A.6.3", "A.6.8", "A.8.5", "A.8.16"]
    },
    minStages: 4,
    maxStages: 8,
    constraints: { startWindow: "night", sectors: ["finance", "public", "education", "technology", "healthcare"] },
    actor: { types: ["criminal"], motivation: L(["Access to mailboxes and data for fraud and resale", "Åtkomst till e-post och data för bedrägerier och vidareförsäljning"]), capability: "medium" },
    variables: {
      prompts: { min: 20, max: 90 },
      phished: { min: 40, max: 1200, scaleBy: "size" },
      clickers: { min: 3, max: 60, scaleBy: "size" },
      files: { min: 100, max: 6000, step: 10, scaleBy: "size" },
      employees: { min: 80, max: 9000, step: 10, scaleBy: "size" }
    },
    roles: ["incidentCommander", "ciso", "socLead", "itOps", "cloudLead", "hr", "legal", "dpo", "comms", "ceo"],

    groundTruth: {
      rootCause: L([
        "A payroll administrator entered their password on an adversary-in-the-middle page the previous afternoon; the attacker captured a session token. At night the attacker also triggered {{num.prompts}} push prompts until one was approved, to register a new device. The session token, which a password reset does not revoke, was used to search mail and files, send internal phishing, and grant an OAuth app permanent mail access.",
        "En löneadministratör angav sitt lösenord på en nätfiskesida av typen adversary-in-the-middle eftermiddagen innan; angriparen fångade en sessionstoken. På natten utlöste angriparen dessutom {{num.prompts}} MFA-förfrågningar tills en godkändes, för att registrera en ny enhet. Sessionstoken, som inte återkallas av ett lösenordsbyte, användes för att söka i e-post och filer, skicka internt nätfiske och ge en OAuth-app permanent åtkomst till e-posten."
      ]),
      attackerTimeline: [
        { at: -600, text: L(["Payroll administrator signs in through an adversary-in-the-middle page; session token captured.", "Löneadministratören loggar in via en nätfiskesida av typen adversary-in-the-middle; sessionstoken fångas."]) },
        { at: -20, text: L(["Push prompt flood begins.", "Flödet av MFA-förfrågningar börjar."]) },
        { at: 0, text: L(["A prompt is approved; a new device is registered.", "En förfrågan godkänns; en ny enhet registreras."]) },
        { at: 30, text: L(["Mailbox and file shares searched for salary, invoice and password.", "E-post och filresurser genomsöks efter lön, faktura och lösenord."]) },
        { at: 90, text: L(["OAuth app granted mail access.", "En OAuth-app ges åtkomst till e-posten."]) },
        { at: 380, text: L(["Internal phishing sent from the trusted account.", "Internt nätfiske skickas från det betrodda kontot."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-aitm", revealStage: "p2", text: L(["The foothold is a session token stolen through an adversary-in-the-middle page; resetting the password does not revoke it.", "Fotfästet är en sessionstoken som stulits via en nätfiskesida av typen adversary-in-the-middle; ett lösenordsbyte återkallar den inte."]) },
      { id: "hf-access", revealStage: "p3", text: L(["The attacker searched the mailbox and downloaded {{num.files}} files from shared folders.", "Angriparen sökte i e-posten och laddade ner {{num.files}} filer från delade mappar."]) },
      { id: "hf-spread", revealStage: "p4", text: L(["{{num.clickers}} colleagues entered credentials on the internal phishing page.", "{{num.clickers}} kollegor angav sina inloggningsuppgifter på den interna nätfiskesidan."]) },
      { id: "hf-oauth", revealStage: "p5", text: L(["An OAuth app with permanent mail access was granted consent and survives password resets.", "En OAuth-app med permanent åtkomst till e-posten har fått samtycke och överlever lösenordsbyten."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Prompts in the night", "Förfrågningar mitt i natten"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. The security on-call phone rings in the middle of the night. A payroll administrator's account received {{num.prompts}} sign-in prompts in twenty minutes, and the last one was approved.\n\nThe administrator is awake now, embarrassed, and says the phone would not stop buzzing. Somebody abroad is signed in to an account that can see every salary in the company. It is still dark, and most of the team is asleep.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. Säkerhetsjourens telefon ringer mitt i natten. En lönehandläggares konto fick {{num.prompts}} inloggningsförfrågningar på tjugo minuter, och den sista godkändes.\n\nHandläggaren är vaken nu, generad, och säger att telefonen inte slutade surra. Någon utomlands är inloggad på ett konto som kan se varje lön i företaget. Det är fortfarande mörkt, och större delen av teamet sover."
        ]),
        injects: [
          inj("i1-1", 0, "siemAlert", "siem", "high", "confirmed", [
            "{{num.prompts}} MFA push requests to one user in 20 minutes; the last approved. Successful sign-in from {{asset.attackerIp}} in another country, followed by a new authentication device being registered.",
            "{{num.prompts}} MFA-förfrågningar till en användare på 20 minuter; den sista godkänd. Lyckad inloggning från {{asset.attackerIp}} i ett annat land, följt av att en ny autentiseringsenhet registrerades."
          ], { headline: ["MFA fatigue pattern", "Mönster för MFA-trötthet"], tests: ["lo1"] }),
          inj("i1-2", 15, "sms", "employee", "medium", "confirmed", [
            "The administrator replies to the on-call text: “Sorry, my phone kept buzzing and I pressed yes to make it stop. Is something wrong?”",
            "Administratören svarar på jourens sms: ”Förlåt, telefonen slutade inte surra och jag tryckte ja för att få tyst på den. Är något fel?”"
          ], {
            tests: ["lo4"],
            meta: {
              thread: [
                { side: "out", name: L(["On call", "Jouren"]), text: L(["Your account approved 40 sign-in prompts in ten minutes. Was that you?", "Ditt konto har godkänt 40 inloggningsförfrågningar på tio minuter. Var det du?"]) },
                { side: "in", text: L(["Sorry, my phone kept buzzing and I pressed yes to make it stop. Is something wrong?", "Förlåt, telefonen slutade inte surra och jag tryckte ja för att få tyst på den. Är något fel?"]) }
              ]
            }
          })
        ],
        charts: [{
          id: "c1-prompts", type: "line", markers: "injects",
          title: L(["MFA prompts per minute", "MFA-förfrågningar per minut"]), unit: L(["prompts", "förfrågningar"]),
          data: line(["Prompts", "Förfrågningar"], -40, 10, 2, (x, ctx) => (x < -20 || x > 0 ? 0 : (ctx.vars.prompts / 10) * (0.6 + ctx.rng.float(0, 0.8))))
        }],
        questions: {
          technical: [
            q("What do you do to the account right now, at night?", "Vad gör ni med kontot just nu, mitt i natten?", ["socLead", "itOps"]),
            q("What can the attacker do with a newly registered device?", "Vad kan angriparen göra med en nyregistrerad enhet?", ["socLead", "cloudLead"]),
            q("Is a password reset enough?", "Räcker det med ett nytt lösenord?", ["ciso", "socLead"])
          ],
          executive: [
            q("Who can authorise disabling an account at night?", "Vem kan godkänna att ett konto spärras nattetid?", ["incidentCommander", "ciso"]),
            q("How do you respond to the user who approved the prompt?", "Hur bemöter ni användaren som godkände förfrågan?", ["hr", "ciso"]),
            q("Does anyone need to be woken up?", "Behöver någon väckas?", ["incidentCommander"])
          ]
        },
        challenges: [ch("Payroll runs tomorrow and this account is needed for it.", "Lönekörningen görs i morgon och det här kontot behövs för den.")],
        decision: dec("d1", "incidentCommander", ["What do you do with the account tonight?", "Vad gör ni med kontot i natt?"], [
          ["Disable it, revoke all sessions, remove the new device and reset the password.", "Spärra det, återkalla alla sessioner, ta bort den nya enheten och byt lösenord."],
          ["Reset the password and remove the new device; keep the account active for payroll.", "Byt lösenord och ta bort den nya enheten; låt kontot vara aktivt för lönekörningen."],
          ["Keep the account running for tonight's payroll run, tell the user to deny every prompt, and reset it at 06:00.", "Låt kontot vara igång för nattens lönekörning, be användaren neka varje förfrågan och återställ det klockan 06.00."]
        ], {
          knowns: [["A prompt was approved and a new device registered.", "En förfrågan godkändes och en ny enhet registrerades."]],
          uncertainties: [["How the attacker got the password in the first place.", "Hur angriparen fick tag på lösenordet från början."]],
          tradeoffs: {
            operational: ["Disabling the account may delay payroll.", "Att spärra kontot kan försena lönekörningen."],
            security: ["A reset alone may not end an active session.", "Ett nytt lösenord räcker kanske inte för att avsluta en aktiv session."],
            legal: ["Payroll data is personal data.", "Lönedata är personuppgifter."],
            reputational: ["Late salaries are visible to every employee.", "Försenade löner märks för varje anställd."]
          },
          evaluation: [["Revokes sessions, not just the password", "Återkallar sessioner, inte bara lösenordet"], ["Thanks the user for reporting", "Tackar användaren för rapporteringen"]],
          pushback: {
            A: [
              pb(["Payroll will not run", "Lönekörningen går inte"], ["Finance's duty manager calls back: the payroll batch runs under this account, and with it disabled, every employee may be paid late. They ask you to switch it back on for one hour, under supervision. Do you hold the line, or let the run through on an account someone abroad just used?", "Ekonomis jourhavande ringer tillbaka: lönekörningen går under det här kontot, och när det är spärrat kan varje anställd få lönen sent. Hen ber er slå på det i en timme, under uppsikt. Står ni fast, eller släpper ni igenom körningen på ett konto som någon utomlands nyss använde?"]),
              pb(["Who signed off?", "Vem godkände?"], ["The payroll administrator's manager is woken by the user's texts and is furious: nobody asked before a payroll account was locked in the middle of a pay cycle. Who in your organisation has the authority to do this at night, and can you show where that is written?", "Löneadministratörens chef väcks av användarens sms och är upprörd: ingen frågade innan ett lönekonto spärrades mitt i en lönecykel. Vem i er organisation har mandat att göra det här nattetid, och kan ni visa var det står?"]),
              pb(["No safe way back", "Ingen säker väg tillbaka"], ["With the device removed and the password reset, the user now has no working sign-in method at all. The service desk can only verify identity in person, during office hours. How do you hand the account back safely, and how do you know it is really the user asking for it?", "När enheten är borttagen och lösenordet bytt har användaren inte längre något sätt att logga in. Servicedesken kan bara kontrollera identitet på plats, under kontorstid. Hur lämnar ni tillbaka kontot på ett säkert sätt, och hur vet ni att det verkligen är användaren som ber om det?"])
            ],
            B: [
              pb(["Does a reset end it?", "Avslutar ett byte det?"], ["The SOC analyst asks a simple question: does a password reset end a session that is already open? Nobody on call can answer with certainty. Do you keep an account that can see every salary active on an assumption, or revoke the sessions too and risk payroll?", "SOC-analytikern ställer en enkel fråga: avslutar ett lösenordsbyte en session som redan är öppen? Ingen i jouren kan svara säkert. Låter ni ett konto som ser varje lön vara aktivt på ett antagande, eller återkallar ni sessionerna också och riskerar lönekörningen?"]),
              pb(["The data protection officer objects", "Dataskyddsombudet invänder"], ["Reached by phone, the data protection officer asks why an account with access to every salary stays open after a confirmed sign-in from abroad. If anything more is read before morning, how will you explain that payroll convenience outweighed it?", "Dataskyddsombudet nås på telefon och frågar varför ett konto med åtkomst till alla löner hålls öppet efter en bekräftad inloggning från utlandet. Om något mer läses före morgonen, hur förklarar ni att det var viktigare att lönen gick smidigt?"]),
              pb(["Enrolling again at night", "Ny registrering mitt i natten"], ["To run payroll, the user must now register a new device, at night, through the same kind of push prompt that was just abused. Nobody can see the user. Who confirms that the person enrolling is really them, and not whoever approved themselves in an hour ago?", "För att kunna köra lönen måste användaren nu registrera en ny enhet, mitt i natten, via samma sorts förfrågan som nyss missbrukades. Ingen ser användaren. Vem bekräftar att det verkligen är hen som registrerar sig, och inte den som släppte in sig själv för en timme sedan?"])
            ],
            C: [
              pb(["They no longer need prompts", "De behöver inga förfrågningar längre"], ["The SOC points out that the attacker already has a registered device of their own. It signs in without asking the user anything. What exactly does telling the user to deny every prompt protect against, and is it worth the hours until the reset?", "SOC påpekar att angriparen redan har en egen registrerad enhet. Den loggar in utan att fråga användaren om något. Vad exakt skyddar det mot att be användaren neka varje förfrågan, och är det värt timmarna fram till bytet?"]),
              pb(["One tired person on guard", "En trött person på vakt"], ["The user texts again: the phone keeps buzzing, they are exhausted and have to work in the morning. They ask whether they can switch the phone off. Do you really make the person who approved one prompt by mistake your only line of defence until morning?", "Användaren sms:ar igen: telefonen surrar fortfarande, hen är utmattad och ska jobba i morgon. Hen undrar om telefonen får stängas av. Gör ni verkligen den person som godkände en förfrågan av misstag till ert enda försvar fram till morgonen?"]),
              pb(["Who owns the open hours?", "Vem äger de öppna timmarna?"], ["Until the reset, someone abroad can see every salary and bank account number in the company. Your incident log will show you knew and chose to wait. Who signs off on that exposure window, by name, and would they sign it again if asked tomorrow?", "Fram till bytet kan någon utomlands se varje lön och kontonummer i företaget. Er incidentlogg kommer att visa att ni visste och valde att vänta. Vem står för det fönstret, med namn, och skulle hen skriva under igen om frågan kom i morgon?"])
            ]
          }
        }),
        facilitator: fac(
          ["Many groups stop at the password reset. Note whether anyone mentions sessions and tokens.", "Många grupper stannar vid lösenordsbytet. Notera om någon nämner sessioner och token."],
          ["All sessions revoked, the rogue device removed and the account locked until morning, with a plan for payroll.", "Alla sessioner återkallade, den okända enheten borttagen och kontot låst till morgonen, med en plan för lönekörningen."],
          [["Ask: what exactly does a password reset invalidate?", "Fråga: vad exakt blir ogiltigt vid ett lösenordsbyte?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 240,
        title: L(["The prompts were a distraction", "Förfrågningarna var en avledning"]),
        twist: L(["The attacker was already in through a stolen session token — the prompts were only to add a device.", "Angriparen var redan inne via en stulen sessionstoken – förfrågningarna var bara till för att lägga till en enhet."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the account was disabled, the payroll run that depended on it failed at 05:00, and finance asks who switched it off.", sv: "Eftersom kontot stängdes av misslyckades lönekörningen som var beroende av det klockan 05.00, och ekonomi frågar vem som stängde av det." } }
        ],
        assumptionChallenged: L(["The approved prompt was how the attacker got in.", "Den godkända förfrågan var vägen in för angriparen."]),
        reveals: ["hf-aitm"],
        narrative: L([
          "{{time.T+240|clock}}. The password was reset overnight and the attacker's sign-in was blocked. Most of the team believes the incident is over.\n\nThe morning shift reviews the sign-in logs from the previous day, to write up the night's events. They scroll back further than anyone did in the night, and stop at something that happened hours before the first prompt.",
          "Klockan {{time.T+240|clock}}. Lösenordet byttes under natten och angriparens inloggning blockerades. De flesta i teamet tror att incidenten är över.\n\nMorgonskiftet går igenom inloggningsloggarna från föregående dag för att skriva ihop nattens händelser. De bläddrar längre bakåt än någon gjorde under natten, och stannar vid något som hände timmar före den första förfrågan."
        ]),
        injects: [
          inj("i2-1", 240, "authLog", "siem", "critical", "confirmed", [
            "Yesterday at {{time.T-600|clock}} the user signed in through a page hosted on {{asset.phishDomain}} that relayed the real login. From then on, a second session from {{asset.attackerIp2}} used the same token — before any of the night's prompts.",
            "I går klockan {{time.T-600|clock}} loggade användaren in via en sida på {{asset.phishDomain}} som förmedlade den riktiga inloggningen. Därefter använde en andra session från {{asset.attackerIp2}} samma token – före alla nattens förfrågningar."
          ], { headline: ["Session token replayed", "Sessionstoken återanvänd"], reveals: ["hf-aitm"], tests: ["lo1"] }),
          inj("i2-2", 260, "email", "employee", "low", "confirmed", [
            "The user forwards the email they clicked yesterday: a “shared payroll document” with a sign-in page that looked exactly like yours.",
            "Användaren vidarebefordrar mejlet hen klickade på i går: ett ”delat lönedokument” med en inloggningssida som såg exakt ut som er."
          ], { optional: true, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which tokens and sessions must be revoked, and how do you confirm they are gone?", "Vilka token och sessioner måste återkallas, och hur bekräftar ni att de är borta?", ["cloudLead", "socLead"]),
            q("Who else received the same phishing email?", "Vilka fler fick samma nätfiskemejl?", ["socLead"]),
            q("Did last night's action actually cut off the attacker?", "Stängde nattens åtgärd verkligen ute angriparen?", ["socLead"], "d1")
          ],
          executive: [
            q("Does this change how you see the user's “mistake”?", "Ändrar det här hur ni ser på användarens ”misstag”?", ["hr", "ciso"]),
            q("Do you warn all staff about the phishing email now?", "Varnar ni all personal för nätfiskemejlet nu?", ["comms", "ciso"]),
            q("Would you choose differently last night, knowing this?", "Skulle ni ha valt annorlunda i natt, med den här vetskapen?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("MFA was on and working — and it did not stop this.", "MFA var påslaget och fungerade – och det stoppade inte det här.")],
        decision: dec("d2", "ciso", ["How do you contain the token theft?", "Hur begränsar ni tokenstölden?"], [
          ["Revoke all sessions for the user, block the phishing domain and hunt for other victims of the same email.", "Återkalla alla användarens sessioner, blockera nätfiskedomänen och sök efter fler offer för samma mejl."],
          ["Revoke the user's sessions only.", "Återkalla endast användarens sessioner."],
          ["Block the phishing domain and wait for more signs.", "Blockera nätfiskedomänen och invänta fler tecken."]
        ], {
          knowns: [["The token was replayed from another address.", "Token återanvändes från en annan adress."]],
          uncertainties: [["Who else entered credentials on the page.", "Vilka fler som angav inloggningsuppgifter på sidan."]],
          tradeoffs: {
            operational: ["Mass session revocation logs everyone out.", "Massåterkallelse av sessioner loggar ut alla."],
            security: ["Narrow action misses other victims.", "En snäv åtgärd missar andra offer."],
            legal: ["Unknown scope makes notification harder.", "En okänd omfattning gör anmälan svårare."],
            reputational: ["A second victim tomorrow undermines today's response.", "Ett andra offer i morgon undergräver dagens hantering."]
          },
          evaluation: [["Hunts for other recipients of the same lure", "Söker efter andra mottagare av samma bete"]],
          pushback: {
            A: [
              pb(["The hunt costs the morning", "Sökningen kostar förmiddagen"], ["Hunting for every recipient means the mail team searching all mailboxes and the sign-in logs of everyone who got the lure. Two people have to drop planned work all morning, on payroll day. Whose work stops, and for how long are you willing to keep looking?", "Att leta upp varje mottagare innebär att e-postteamet söker i alla brevlådor och i inloggningsloggarna för alla som fick betet. Två personer måste lägga undan planerat arbete hela förmiddagen, på lönedagen. Vems arbete stannar, och hur länge är ni beredda att fortsätta leta?"]),
              pb(["Signed out again", "Utloggad igen"], ["Revoking all sessions signs the payroll administrator out of everything, for the second time in a few hours, in the middle of fixing the night's payroll. Finance asks whether the user is being punished. How do you explain it, and do you hold off until payroll is done?", "Att återkalla alla sessioner loggar ut löneadministratören från allt, för andra gången på några timmar, mitt i arbetet med att rätta nattens lönekörning. Ekonomi undrar om användaren straffas. Hur förklarar ni det, och väntar ni tills lönen är klar?"]),
              pb(["One domain of many", "En domän av många"], ["Your threat intelligence contact notes that relay kits like this one usually move to a new domain within a day. You have blocked one name. Does the block give you real protection, or a feeling of closure that stops you looking further?", "Er kontakt inom hotunderrättelser påpekar att den här sortens förmedlingssidor brukar flytta till en ny domän inom ett dygn. Ni har blockerat ett namn. Ger blockeringen ett verkligt skydd, eller en känsla av att vara klara som gör att ni slutar leta?"])
            ],
            B: [
              pb(["Same email, next desk", "Samma mejl, nästa skrivbord"], ["The user mentions that a payroll colleague got the same “shared payroll document” email yesterday and asked whether it was real. You have only revoked one person's sessions. Do you still limit the action to one account?", "Användaren nämner att en kollega på lön fick samma mejl om ett ”delat lönedokument” i går och frågade om det var äkta. Ni har bara återkallat en persons sessioner. Begränsar ni fortfarande åtgärden till ett konto?"]),
              pb(["The page is still open", "Sidan är fortfarande öppen"], ["The phishing domain is still reachable from your network. Anyone who opens the same email today lands on the same relay page and loses their session the same way. Why leave it open, and who answers for the next victim?", "Nätfiskedomänen går fortfarande att nå från ert nät. Den som öppnar samma mejl i dag hamnar på samma förmedlande sida och förlorar sin session på samma sätt. Varför låta den vara öppen, och vem står till svars för nästa offer?"]),
              pb(["One person in the report", "En person i rapporten"], ["Management reads your summary: MFA was bypassed by a relay page, and the response was to sign out one employee. The CEO asks whether anyone looked further. What do you answer, and does a one-account action still feel proportionate?", "Ledningen läser er sammanfattning: MFA kringgicks via en förmedlande sida, och åtgärden var att logga ut en anställd. Vd frågar om någon har tittat vidare. Vad svarar ni, och känns en åtgärd för ett enda konto fortfarande rimlig?"])
            ],
            C: [
              pb(["The stolen session lives on", "Den stulna sessionen lever vidare"], ["Blocking the domain stops new victims, but the session already replayed from another address is untouched. Nothing on your list ends it. What signs are you waiting for that the logs have not already shown you?", "Att blockera domänen stoppar nya offer, men sessionen som redan återanvänts från en annan adress är orörd. Inget i er åtgärd avslutar den. Vilka tecken väntar ni på som loggarna inte redan har visat?"]),
              pb(["Is it safe to log in?", "Är det säkert att logga in?"], ["The payroll administrator asks whether it is safe to sign in and finish today's payroll. The session that was stolen has not been revoked. What do you tell them, and would you sign in to that account yourself?", "Löneadministratören frågar om det är säkert att logga in och slutföra dagens lönekörning. Sessionen som stals har inte återkallats. Vad säger ni till hen, och skulle ni själva logga in på det kontot?"]),
              pb(["Signs you will not see", "Tecken ni inte ser"], ["The SOC warns that a replayed token looks like an ordinary sign-in: right user, right password, MFA already satisfied. There may be no new sign to wait for. How will you know when to act, and what is the cost if you never do?", "SOC varnar för att en återanvänd token ser ut som en vanlig inloggning: rätt användare, rätt lösenord, MFA redan godkänd. Det kanske inte kommer några nya tecken att vänta på. Hur vet ni när ni ska agera, och vad kostar det om ni aldrig gör det?"])
            ]
          }
        }),
        facilitator: fac(
          ["The core misconception: MFA was beaten without being “broken”.", "Den centrala missuppfattningen: MFA kringgicks utan att ”knäckas”."],
          ["Token revocation, the phishing domain blocked and a hunt across all recipients.", "Återkallelse av token, nätfiskedomänen blockerad och en sökning bland alla mottagare."],
          [["Ask: what kind of MFA would have stopped a relayed login?", "Fråga: vilken typ av MFA hade stoppat en förmedlad inloggning?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 300,
        title: L(["What they read", "Vad de läste"]),
        twist: L(["The attacker spent hours in the mailbox and shared folders, not minutes.", "Angriparen tillbringade timmar i e-posten och de delade mapparna, inte minuter."]),
        twistKind: "scope",
        reconsider: { decision: "d1", pressure: { en: "The prompts were a distraction: the attacker was already in with a stolen session. If you disabled the account, payroll ran late for nothing. If you kept it active, the attacker kept reading.", sv: "Förfrågningarna var en avledning: angriparen var redan inne med en stulen session. Om ni stängde av kontot gick lönen sent i onödan. Om ni lät det vara aktivt fortsatte angriparen att läsa." } },
        assumptionChallenged: L(["The attacker only had a few minutes.", "Angriparen hade bara några minuter på sig."]),
        reveals: ["hf-access"],
        narrative: L([
          "{{time.T+300|clock}}. The audit logs for mail and file activity have been exported for the whole period the attacker was inside.\n\nThe analysts start reading them in silence. A payroll account opens doors to salaries, bank details and HR folders, and the logs show which of those doors were opened.",
          "Klockan {{time.T+300|clock}}. Granskningsloggarna för e-post och filaktivitet har exporterats för hela perioden då angriparen var inne.\n\nAnalytikerna börjar läsa dem under tystnad. Ett lönekonto öppnar dörrar till löner, bankuppgifter och HR-mappar, och loggarna visar vilka av de dörrarna som öppnades."
        ]),
        injects: [
          inj("i3-1", 300, "logExcerpt", "siem", "high", "confirmed", [
            "Mail searches for “salary”, “bank”, “invoice” and “password”. {{num.files}} files downloaded from payroll and HR folders in {{env.fileShare}}, including salary lists and sick-leave records.",
            "Sökningar i e-posten efter ”lön”, ”bank”, ”faktura” och ”lösenord”. {{num.files}} filer nedladdade från löne- och HR-mappar i {{env.fileShare}}, bland annat lönelistor och sjukfrånvarouppgifter."
          ], { headline: ["Mail and file access", "Åtkomst till e-post och filer"], reveals: ["hf-access"], tests: ["lo2"] })
        ],
        charts: [{
          id: "c3-actions", type: "bar",
          title: L(["Attacker actions per hour", "Angriparens åtgärder per timme"]), unit: L(["actions", "åtgärder"]),
          caption: L(["Hours after the stolen session was first used.", "Timmar efter att den stulna sessionen först användes."]),
          data: (ctx) => {
            const hours = [0, 1, 2, 3, 4, 5, 6];
            return { categories: hours, series: [
              { id: "search", label: L(["Searches", "Sökningar"]), values: hours.map(() => 4 + ctx.rng.int(0, 12)) },
              { id: "dl", label: L(["Downloads", "Nedladdningar"]), values: hours.map((h) => (h >= 2 ? Math.round(ctx.vars.files / 5) + ctx.rng.int(0, 20) : 0)) }
            ] };
          }
        }],
        questions: {
          technical: [
            q("Which files and messages contain personal data, and how many people?", "Vilka filer och meddelanden innehåller personuppgifter, och om hur många personer?", ["socLead", "itOps"]),
            q("What could the attacker do next with “password” search results?", "Vad kan angriparen göra härnäst med resultaten av sökningen på ”lösenord”?", ["ciso", "socLead"]),
            q("Did your containment cover file shares as well as mail?", "Omfattade er begränsning filresurser lika väl som e-post?", ["cloudLead"], "d2")
          ],
          executive: [
            q("Is this a reportable personal data breach?", "Är det här en anmälningspliktig personuppgiftsincident?", ["dpo", "legal"]),
            q("Do you tell all staff that salary data was taken?", "Berättar ni för all personal att löneuppgifter har tagits?", ["hr", "comms"]),
            q("Would a faster decision last night have limited this?", "Hade ett snabbare beslut i natt begränsat det här?", ["ceo"], "d1")
          ]
        },
        challenges: [ch("Employees' salaries and sick leave are in the downloaded files.", "Anställdas löner och sjukfrånvaro finns i de nedladdade filerna.")],
        decision: dec("d3", "legal", ["How do you handle the exposed personal data?", "Hur hanterar ni de exponerade personuppgifterna?"], [
          ["Notify {{reg.dpaShort}} and inform affected employees directly.", "Anmäl till {{reg.dpaShort}} och informera berörda anställda direkt."],
          ["Notify {{reg.dpaShort}}; inform employees after the investigation.", "Anmäl till {{reg.dpaShort}}; informera de anställda efter utredningen."],
          ["Assess further before deciding.", "Utred vidare innan ni beslutar."]
        ], {
          knowns: [["Salary and sick-leave data were downloaded.", "Löne- och sjukfrånvarouppgifter har laddats ner."]],
          uncertainties: [["Whether the data will be used for fraud.", "Om uppgifterna kommer att användas för bedrägerier."]],
          tradeoffs: {
            operational: ["Telling everyone triggers questions to HR.", "Att berätta för alla ger många frågor till HR."],
            security: ["Informed staff can spot follow-up fraud.", "Informerad personal kan känna igen bedrägeriförsök som följer."],
            legal: ["Health-related data raises the risk level.", "Hälsorelaterade uppgifter höjer risknivån."],
            reputational: ["Staff trust depends on hearing it from you.", "Personalens förtroende beror på att de får höra det från er."]
          },
          evaluation: [["Recognises health data in sick-leave records", "Ser hälsouppgifterna i sjukfrånvarouppgifterna"]],
          pushback: {
            A: [
              pb(["HR cannot take the calls", "HR klarar inte samtalen"], ["HR has a small team, and telling every affected employee today means hundreds of conversations about salaries and sick leave. Many will ask exactly which file held their data, which you cannot yet say. Who answers them, and what do you say when you do not know?", "HR är ett litet team, och att informera varje berörd anställd i dag innebär hundratals samtal om löner och sjukfrånvaro. Många kommer att fråga exakt vilken fil deras uppgifter låg i, vilket ni ännu inte kan svara på. Vem tar samtalen, och vad säger ni när ni inte vet?"]),
              pb(["Managers ask you to wait", "Cheferna ber er vänta"], ["Line managers ask to be told first: some employees on long sick leave are fragile, and a generic message saying their health data was taken could do real harm. Do you delay to tailor the message, or send it now as decided?", "Chefer ber om att få veta först: några medarbetare är långtidssjukskrivna och sköra, och ett allmänt meddelande om att deras hälsouppgifter har tagits kan göra verklig skada. Skjuter ni upp för att anpassa budskapet, eller skickar ni nu som beslutat?"]),
              pb(["The list may change", "Listan kan ändras"], ["The analysts warn that the log review is only half done: by tomorrow the list of affected people may grow, or some names may drop off. Do you inform now and correct later, and how many corrections can your staff's trust survive?", "Analytikerna varnar för att genomgången av loggarna bara är halvklar: i morgon kan listan över berörda ha vuxit, eller några namn ha fallit bort. Informerar ni nu och rättar senare, och hur många rättelser tål personalens förtroende?"])
            ],
            B: [
              pb(["The floor already knows", "Golvet vet redan"], ["Staff have noticed the night's commotion around payroll, and rumours are spreading that salary data was stolen. People stop HR in the corridor to ask if their details are safe. You decided not to tell them yet. What do you say now?", "Personalen har märkt nattens oro kring lön, och rykten sprids om att löneuppgifter har stulits. Folk stoppar HR i korridoren och frågar om deras uppgifter är säkra. Ni har beslutat att inte berätta än. Vad säger ni nu?"]),
              pb(["Without undue delay", "Utan onödigt dröjsmål"], ["Legal counsel points out that health data in sick-leave records probably means a high risk to the people concerned, and then they must be told without undue delay. Can you defend waiting for an investigation with no end date?", "Den juridiska rådgivaren påpekar att hälsouppgifter i sjukfrånvaroregister troligen innebär en hög risk för de berörda, och då ska de informeras utan onödigt dröjsmål. Kan ni försvara att vänta på en utredning utan slutdatum?"]),
              pb(["Weeks, not days", "Veckor, inte dagar"], ["The analysts estimate that a full investigation will take weeks. Employees would learn that their salary and sick leave were exposed long after the authority did. Will they accept that, and what will they think of the reason?", "Analytikerna bedömer att en fullständig utredning tar veckor. De anställda skulle få veta att deras lön och sjukfrånvaro exponerats långt efter att myndigheten fick veta det. Kommer de att acceptera det, och vad kommer de att tycka om skälet?"])
            ],
            C: [
              pb(["The deadline is running", "Fristen löper"], ["The notification deadline for {{reg.dpaShort}} started when you confirmed the download, not when you finish assessing. Nobody in the room has said when it ends. Who is tracking it, and what more do you need to know before it runs out?", "Fristen för anmälan till {{reg.dpaShort}} började löpa när ni bekräftade nedladdningen, inte när ni är klara med bedömningen. Ingen i rummet har sagt när den går ut. Vem håller koll på den, och vad mer behöver ni veta innan den löper ut?"]),
              pb(["The DPO sees no doubt", "Dataskyddsombudet ser inget tvivel"], ["The data protection officer says the assessment is already done: sick-leave records are health data, and they were downloaded. Further assessment looks like delay. What exactly are you still assessing, and would you put that in writing?", "Dataskyddsombudet säger att bedömningen redan är gjord: sjukfrånvarouppgifter är hälsouppgifter, och de har laddats ner. Mer utredning ser ut som förhalning. Vad exakt utreder ni fortfarande, och skulle ni skriva ner det?"]),
              pb(["A direct question", "En direkt fråga"], ["An employee who heard about the night writes to HR asking plainly whether their salary and sick leave were in the stolen files. HR asks you what to answer. Yes, no, or “we are looking into it” — and what will they think of that answer later?", "En anställd som hört om natten skriver till HR och frågar rakt ut om hens lön och sjukfrånvaro fanns i de stulna filerna. HR frågar er vad de ska svara. Ja, nej eller ”vi undersöker saken” – och vad kommer hen att tycka om svaret senare?"])
            ]
          }
        }),
        facilitator: fac(
          ["Scope grows quietly. Keep the focus on the people in the files.", "Omfattningen växer i det tysta. Håll fokus på människorna i filerna."],
          ["Notification, direct information to staff and a scoped list of affected people.", "Anmälan, direkt information till personalen och en avgränsad lista över berörda."],
          [["Ask: what would a fraudster do with a salary list?", "Fråga: vad skulle en bedragare göra med en lönelista?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 420,
        title: L(["From a colleague you trust", "Från en kollega ni litar på"]),
        twist: L(["The attacker sent phishing from the compromised account to {{num.phished}} colleagues — and some clicked.", "Angriparen skickade nätfiske från det kapade kontot till {{num.phished}} kollegor – och några klickade."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because employees were told directly what was read, several have asked for copies of everything the attacker saw about them.", sv: "Eftersom medarbetarna fick veta direkt vad som lästes har flera begärt kopior av allt som angriparen såg om dem." } }
        ],
        assumptionChallenged: L(["The compromise is contained to one user.", "Intrånget är begränsat till en användare."]),
        reveals: ["hf-spread"],
        narrative: L([
          "{{time.T+420|clock}}. The working day has started, and the service desk begins receiving calls.\n\nStaff are asking about a “salary adjustment” email that seems to come from payroll, from a colleague many of them know by name. It looks routine, and it arrived just as people sat down with their first coffee.",
          "Klockan {{time.T+420|clock}}. Arbetsdagen har börjat och servicedesken börjar ta emot samtal.\n\nPersonal frågar om ett mejl om ”lönejustering” som verkar komma från lön, från en kollega som många av dem känner till namnet. Det ser rutinmässigt ut, och det kom precis när folk satte sig med sitt första kaffe."
        ]),
        injects: [
          inj("i4-1", 420, "phishingEmail", "employee", "high", "confirmed", [
            "“Your salary adjustment for next month is ready. Please confirm your details in the attached link before Friday.” Sent from the compromised payroll account to {{num.phished}} colleagues.",
            "”Din lönejustering för nästa månad är klar. Bekräfta dina uppgifter via länken nedan före fredag.” Skickat från det kapade lönekontot till {{num.phished}} kollegor."
          ], { meta: { from: "{{person.hr.email}}", subject: L(["Your salary adjustment", "Din lönejustering"]) }, tests: ["lo3"] }),
          inj("i4-2", 450, "authLog", "siem", "critical", "confirmed", [
            "{{num.clickers}} users have signed in through the same relay page since the email was sent. Their sessions are now being replayed.",
            "{{num.clickers}} användare har loggat in via samma förmedlande sida sedan mejlet skickades. Deras sessioner återanvänds nu."
          ], { reveals: ["hf-spread"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["Internal phishing reach", "Det interna nätfiskets räckvidd"]),
          data: kpi([
            { id: "sent", label: ["Colleagues who received it", "Kollegor som fick det"], value: (v) => v.phished, tone: "warn" },
            { id: "clicked", label: ["Colleagues who entered credentials", "Kollegor som angav uppgifter"], value: (v) => v.clickers, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("How do you pull the email from every mailbox?", "Hur tar ni bort mejlet ur alla e-postlådor?", ["itOps", "socLead"]),
            q("How do you revoke sessions for everyone who clicked, fast?", "Hur återkallar ni snabbt sessionerna för alla som klickade?", ["cloudLead", "socLead"]),
            q("Did your hunt for other victims include internal senders?", "Omfattade er sökning efter fler offer även interna avsändare?", ["socLead"], "d2")
          ],
          executive: [
            q("What do you tell all staff — and through which channel, if email is not trusted?", "Vad säger ni till all personal – och genom vilken kanal, om e-posten inte är betrodd?", ["comms", "hr"]),
            q("How do people know which emails from colleagues to trust today?", "Hur ska medarbetarna veta vilka mejl från kollegor de kan lita på i dag?", ["ciso", "comms"]),
            q("Does this change the scope of what you notify?", "Ändrar det här omfattningen av det ni anmäler?", ["dpo"], "d3")
          ]
        },
        challenges: [ch("Your normal channel for warning staff is the email system being abused.", "Er vanliga kanal för att varna personalen är det e-postsystem som missbrukas.")],
        decision: dec("d4", "ciso", ["How do you stop the spread?", "Hur stoppar ni spridningen?"], [
          ["Purge the email everywhere, revoke sessions for all who clicked and warn staff through another channel.", "Rensa bort mejlet överallt, återkalla sessionerna för alla som klickade och varna personalen via en annan kanal."],
          ["Purge the email and reset passwords for those who clicked.", "Rensa bort mejlet och byt lösenord för dem som klickade."],
          ["Send an all-staff email warning.", "Skicka en varning via mejl till all personal."]
        ], {
          knowns: [["{{num.clickers}} colleagues entered credentials.", "{{num.clickers}} kollegor har angett sina uppgifter."]],
          uncertainties: [["Whether more lures are on the way.", "Om fler beten är på väg."]],
          tradeoffs: {
            operational: ["Mass revocation interrupts work.", "Massåterkallelse avbryter arbetet."],
            security: ["Password resets alone leave stolen sessions alive.", "Enbart nya lösenord låter stulna sessioner leva vidare."],
            legal: ["More victims, more personal data at risk.", "Fler offer innebär fler personuppgifter i riskzonen."],
            reputational: ["Staff will judge how quickly you warned them.", "Personalen kommer att bedöma hur snabbt ni varnade dem."]
          },
          evaluation: [["Revokes sessions for every victim", "Återkallar sessioner för varje offer"], ["Warns staff outside the compromised channel", "Varnar personalen utanför den komprometterade kanalen"]],
          pushback: {
            A: [
              pb(["Which channel reaches everyone?", "Vilken kanal når alla?"], ["The intranet uses the same sign-in, and HR only has mobile numbers for some staff. You need to reach {{num.phished}} recipients through something other than email, quickly. Which channel, and how will people know your warning is genuine and not the next lure?", "Intranätet använder samma inloggning, och HR har bara mobilnummer till en del av personalen. Ni behöver nå {{num.phished}} mottagare via något annat än e-post, snabbt. Vilken kanal, och hur ska folk veta att er varning är äkta och inte nästa bete?"]),
              pb(["Signed out mid-meeting", "Utloggad mitt i mötet"], ["Revoking sessions for everyone who clicked signs out a senior manager in the middle of a client presentation and several staff in the middle of urgent work. They demand to know who decided it. Do you make exceptions, and for whom?", "Att återkalla sessionerna för alla som klickade loggar ut en högre chef mitt i en kundpresentation och flera medarbetare mitt i brådskande arbete. De kräver att få veta vem som beslutade det. Gör ni undantag, och för vem?"]),
              pb(["Is the list complete?", "Är listan komplett?"], ["Your list of victims comes from sign-ins through the relay page. Some colleagues say they opened the link on personal phones, outside anything you log. Are you sure you have found everyone, and what do you do about those you cannot see?", "Er lista över offer bygger på inloggningar via den förmedlande sidan. Några kollegor säger att de öppnade länken i privata telefoner, utanför allt ni loggar. Är ni säkra på att ni har hittat alla, och vad gör ni med dem ni inte ser?"])
            ],
            B: [
              pb(["You learned this morning", "Ni lärde er det i morse"], ["Your own team found this morning that a password reset did not end the stolen session on the payroll account. The {{num.clickers}} colleagues who clicked lost their sessions the same way. Why should a reset work for them when it did not before?", "Ert eget team upptäckte i morse att ett lösenordsbyte inte avslutade den stulna sessionen på lönekontot. De {{num.clickers}} kollegor som klickade förlorade sina sessioner på samma sätt. Varför skulle ett byte fungera för dem när det inte gjorde det förut?"]),
              pb(["Nobody told the readers", "Ingen sa något till läsarna"], ["The email is gone from the inboxes, but nobody was told it was fake. Some recipients forwarded it to colleagues before the purge, and others are still waiting for their “salary adjustment”. What do those people believe right now, and who corrects it?", "Mejlet är borta ur inkorgarna, men ingen har fått veta att det var falskt. Några mottagare vidarebefordrade det till kollegor före rensningen, och andra väntar fortfarande på sin ”lönejustering”. Vad tror de personerna just nu, och vem rättar det?"]),
              pb(["The service desk drowns", "Servicedesken drunknar"], ["Forcing {{num.clickers}} password resets at once floods the service desk with locked-out colleagues, while staff with questions about the email cannot get through. Is the desk dealing with the right problem, and who decides which calls come first?", "Att tvinga fram {{num.clickers}} lösenordsbyten på en gång fyller servicedesken med utelåsta kollegor, medan personal med frågor om mejlet inte kommer fram. Hanterar desken rätt problem, och vem bestämmer vilka samtal som går först?"])
            ],
            C: [
              pb(["Your warning looks like phishing", "Er varning ser ut som nätfiske"], ["Your warning arrives in the same inbox, from an internal sender, about salaries — just like the lure. Several staff report your warning as phishing and delete it. How are people supposed to tell your email from the attacker's?", "Er varning kommer till samma inkorg, från en intern avsändare, och handlar om löner – precis som betet. Flera anställda rapporterar er varning som nätfiske och raderar den. Hur ska folk kunna skilja ert mejl från angriparens?"]),
              pb(["Sessions still being replayed", "Sessioner återanvänds fortfarande"], ["A warning tells people not to click. It does nothing for the {{num.clickers}} colleagues who already did, whose sessions are being replayed right now. What protects them while you wait for everyone to read their email?", "En varning säger åt folk att inte klicka. Den gör ingenting för de {{num.clickers}} kollegor som redan har gjort det, och vars sessioner återanvänds just nu. Vad skyddar dem medan ni väntar på att alla ska läsa sin e-post?"]),
              pb(["Reply-all storm", "Svara alla-storm"], ["Within minutes, dozens of colleagues reply to all, asking whether they are affected and whether they should click to check. Your warning is buried under questions, and some include the original link. Do you send another email, or stop using email for this?", "Inom några minuter svarar dussintals kollegor alla och frågar om de är drabbade och om de ska klicka för att kontrollera. Er varning drunknar i frågor, och några innehåller den ursprungliga länken. Skickar ni ett nytt mejl, eller slutar ni använda e-post för det här?"])
            ]
          }
        }),
        facilitator: fac(
          ["Trust is the attack surface. Watch whether the group reuses email to warn about email.", "Förtroende är angreppsytan. Se om gruppen använder e-post för att varna för e-post."],
          ["A purge, session revocation for every victim and a warning through a trusted channel.", "Rensning, återkallelse av sessioner för varje offer och en varning via en betrodd kanal."],
          [["Ask: how will staff know your warning is genuine?", "Fråga: hur ska personalen veta att er varning är äkta?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 1440,
        title: L(["An app that never logs out", "En app som aldrig loggar ut"]),
        twist: L(["An OAuth app the attacker consented to still reads the mailbox — after every reset.", "En OAuth-app som angriparen godkände läser fortfarande e-posten – efter varje byte."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "An app the attacker consented to still reads the mailbox after every reset. Was revoking sessions enough, or did it only look enough?", sv: "En app som angriparen gav sitt medgivande till läser fortfarande brevlådan efter varje återställning. Räckte det att återkalla sessionerna, eller såg det bara ut att räcka?" } },
        assumptionChallenged: L(["Resetting passwords and revoking sessions removed all access.", "Nya lösenord och återkallade sessioner tog bort all åtkomst."]),
        reveals: ["hf-oauth"],
        narrative: L([
          "The next day, {{time.T+1440|clock}}. Every affected password has been reset, every session revoked, and the relay page is blocked. The team expected a quiet day.\n\nInstead, the logs show mail still being read from an unfamiliar location. No password was used and no prompt was sent. Something is still inside, and it does not care about passwords.",
          "Nästa dag, klockan {{time.T+1440|clock}}. Varje berört lösenord har bytts, varje session har återkallats och den förmedlande sidan är blockerad. Teamet räknade med en lugn dag.\n\nI stället visar loggarna att e-post fortfarande läses från en okänd plats. Inget lösenord användes och ingen förfrågan skickades. Något finns fortfarande kvar, och det bryr sig inte om lösenord."
        ]),
        injects: [
          inj("i5-1", 1440, "forensicFinding", "soc", "critical", "confirmed", [
            "An application called “Mail Archive Helper” has delegated access to read and send mail for the payroll account and two of the users who clicked. Consent was granted through the stolen sessions. App access is not revoked by a password reset.",
            "En applikation som heter ”Mail Archive Helper” har delegerad åtkomst att läsa och skicka e-post för lönekontot och två av användarna som klickade. Samtycket gavs via de stulna sessionerna. Appens åtkomst återkallas inte av ett lösenordsbyte."
          ], { headline: ["Malicious app consent", "Skadligt samtycke till app"], reveals: ["hf-oauth"], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you find every app consent granted in the last weeks?", "Hur hittar ni varje samtycke till appar som har getts de senaste veckorna?", ["cloudLead", "socLead"]),
            q("Should users be able to consent to apps at all?", "Ska användare över huvud taget kunna ge samtycke till appar?", ["cloudLead", "ciso"]),
            q("Which of your earlier actions assumed a reset was enough?", "Vilka av era tidigare åtgärder förutsatte att ett lösenordsbyte räckte?", ["socLead"], "d4")
          ],
          executive: [
            q("Does the continued access change what you must notify?", "Ändrar den fortsatta åtkomsten vad ni måste anmäla?", ["dpo", "legal"]),
            q("Who signs off that the attacker is really out?", "Vem intygar att angriparen verkligen är ute?", ["ciso", "ceo"]),
            q("Does this change your view on last night's first decision?", "Ändrar det här er syn på nattens första beslut?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Blocking user consent will break apps some teams rely on.", "Att spärra användarnas samtycke kommer att slå ut appar som vissa team är beroende av.")],
        decision: dec("d5", "ciso", ["How do you remove persistent access?", "Hur tar ni bort den bestående åtkomsten?"], [
          ["Revoke the app everywhere, review all recent consents and require admin approval for new apps.", "Återkalla appen överallt, granska alla nya samtycken och kräv administratörsgodkännande för nya appar."],
          ["Revoke this app only.", "Återkalla bara den här appen."],
          ["Monitor the app to learn what it collects.", "Bevaka appen för att se vad den samlar in."]
        ], {
          knowns: [["App consent survived every reset.", "Samtycket till appen överlevde alla byten."]],
          uncertainties: [["Whether other apps were consented.", "Om andra appar har fått samtycke."]],
          tradeoffs: {
            operational: ["Admin approval slows legitimate tools.", "Administratörsgodkännande saktar ner legitima verktyg."],
            security: ["Any consent left behind is a backdoor.", "Varje samtycke som lämnas kvar är en bakdörr."],
            legal: ["Continued access extends the breach.", "Fortsatt åtkomst förlänger incidenten."],
            reputational: ["“Still reading our mail” would be devastating.", "”Läser fortfarande vår e-post” vore förödande."]
          },
          evaluation: [["Treats app consents as persistence", "Behandlar samtycken till appar som persistens"]],
          pushback: {
            A: [
              pb(["Apps teams depend on", "Appar som team är beroende av"], ["The consent review finds dozens of apps that staff have approved, including a scheduling tool one department uses every day. Nobody can vouch for half of them. Do you revoke everything you cannot vouch for, and who explains it to the teams that stop working?", "Granskningen av samtycken hittar dussintals appar som personalen har godkänt, bland annat ett planeringsverktyg som en avdelning använder varje dag. Ingen kan gå i god för hälften av dem. Återkallar ni allt ni inte kan gå i god för, och vem förklarar det för de team som slutar fungera?"]),
              pb(["A queue at the cloud team", "Kö hos molnteamet"], ["With admin approval required, every new app request now goes to a small cloud team that is still cleaning up the incident. Within a day the queue is long and managers complain. Who approves, how fast, and what happens when people find ways around it?", "När administratörsgodkännande krävs går varje ny appförfrågan till ett litet molnteam som fortfarande städar efter incidenten. Inom ett dygn är kön lång och chefer klagar. Vem godkänner, hur snabbt, och vad händer när folk hittar vägar runt det?"]),
              pb(["How far back?", "Hur långt bakåt?"], ["The audit log for app consents only goes back a limited time. Anything granted before that is just a list of apps with no record of who approved them or when. Does your review really cover everything, and what do you do about the consents you cannot explain?", "Granskningsloggen för samtycken till appar sträcker sig bara en begränsad tid bakåt. Allt som godkändes före det är bara en lista med appar utan uppgift om vem som godkände dem eller när. Täcker er granskning verkligen allt, och vad gör ni med samtyckena ni inte kan förklara?"])
            ],
            B: [
              pb(["Only one name checked", "Bara ett namn kontrollerat"], ["The stolen sessions could have approved other apps for other users, under other harmless-sounding names. You have removed the one you found. How do you know there is not another, and what would make you look?", "De stulna sessionerna kan ha godkänt andra appar för andra användare, under andra oskyldigt klingande namn. Ni har tagit bort den ni hittade. Hur vet ni att det inte finns fler, och vad skulle få er att leta?"]),
              pb(["Nothing stops the next one", "Inget stoppar nästa"], ["Users can still approve any app on their own. Tomorrow, one more phished session could grant the next “helper” app the same access. Have you removed the threat, or only this copy of it?", "Användarna kan fortfarande godkänna vilken app som helst på egen hand. I morgon kan ännu en kapad session ge nästa ”hjälpapp” samma åtkomst. Har ni tagit bort hotet, eller bara den här kopian av det?"]),
              pb(["Can you sign that it ended?", "Kan ni intyga att det är slut?"], ["The data protection officer needs to state in the notification when the attacker's access ended. With one app revoked and no wider review, can anyone sign that statement, and what happens if it later proves wrong?", "Dataskyddsombudet måste ange i anmälan när angriparens åtkomst upphörde. Med en enda app återkallad och ingen bredare granskning, kan någon skriva under på det, och vad händer om det senare visar sig vara fel?"])
            ],
            C: [
              pb(["It is reading your response", "Den läser er hantering"], ["Every hour you watch, the app keeps reading the payroll mailbox, including today's messages about the incident and about affected staff. Is what you learn worth letting the attacker read your response plans as you write them?", "Varje timme ni bevakar fortsätter appen att läsa lönebrevlådan, inklusive dagens meddelanden om incidenten och om berörd personal. Är det ni lär er värt att angriparen läser era planer medan ni skriver dem?"]),
              pb(["It can also send", "Den kan också skicka"], ["The app has permission to send mail as payroll, not only to read it. If it sends the next lure while you are watching, staff will have been phished by an account you knew was compromised. Who answers for that?", "Appen har behörighet att skicka e-post som lön, inte bara att läsa. Om den skickar nästa bete medan ni bevakar har personalen blivit lurad av ett konto som ni visste var kapat. Vem står till svars för det?"]),
              pb(["Legal wants it in writing", "Juristerna vill ha det skriftligt"], ["Legal says that knowingly letting an outsider keep access to personal data extends the breach, and must be reported that way. They want a written decision, with a name and a time limit. Who signs it?", "Juristerna säger att om ni medvetet låter en utomstående behålla åtkomst till personuppgifter förlängs incidenten, och det måste anmälas så. De vill ha ett skriftligt beslut, med namn och tidsgräns. Vem skriver under?"])
            ]
          }
        }),
        facilitator: fac(
          ["The persistence lesson for cloud identity.", "Lärdomen om persistens för identiteter i molnet."],
          ["All suspicious consents revoked and admin approval required for new apps.", "Alla misstänkta samtycken återkallade och administratörsgodkännande krävs för nya appar."],
          [["Ask: what else survives a password reset?", "Fråga: vad mer överlever ett lösenordsbyte?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 1500,
        title: L(["Salaries in the wrong hands", "Löner i fel händer"]),
        twist: L(["Employees start receiving fraud attempts that quote their own salary.", "Anställda börjar få bedrägeriförsök som citerar deras egen lön."]),
        twistKind: "impact",
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because sessions were revoked for everyone who clicked, the sales team was signed out in the middle of a customer tender and lost the morning.", sv: "Eftersom sessionerna återkallades för alla som klickade loggades säljteamet ut mitt i ett kundanbud och förlorade förmiddagen." } }
        ],
        assumptionChallenged: L(["The stolen data has not been used yet.", "De stulna uppgifterna har inte använts ännu."]),
        narrative: L([
          "{{time.T+1500|clock}}. HR forwards several text messages that employees received on their private phones over lunch.\n\nThe messages look like they come from payroll, and they are frighteningly specific. The staff who received them want to know how a stranger could know such details about them.",
          "Klockan {{time.T+1500|clock}}. HR vidarebefordrar flera sms som anställda fick på sina privata telefoner under lunchen.\n\nMeddelandena ser ut att komma från lön, och de är skrämmande specifika. De anställda som fick dem vill veta hur en främling kan känna till sådana detaljer om dem."
        ]),
        injects: [
          inj("i6-1", 1500, "sms", "employee", "high", "confirmed", [
            "“Hi, this is payroll. Your salary of [exact amount] could not be paid. Confirm your bank login here to receive it today.”",
            "”Hej, det här är lönefunktionen. Din lön på [exakt belopp] kunde inte betalas ut. Bekräfta din bankinloggning här för att få den i dag.”"
          ], { tests: ["lo2", "lo4"] })
        ],
        questions: {
          technical: [
            q("How can employees verify real messages from payroll?", "Hur kan anställda verifiera äkta meddelanden från lönefunktionen?", ["itOps", "ciso"]),
            q("What else from the files could be used against staff?", "Vad mer i filerna kan användas mot personalen?", ["socLead"]),
            q("Did the persistent access you removed still leak data first?", "Hann den bestående åtkomst ni tog bort läcka data först?", ["socLead"], "d5")
          ],
          executive: [
            q("What support do you give employees targeted by fraud?", "Vilket stöd ger ni anställda som utsätts för bedrägeriförsök?", ["hr", "ceo"]),
            q("Do you report the fraud attempts to the police?", "Polisanmäler ni bedrägeriförsöken?", ["legal"]),
            q("Did you inform staff early enough with your earlier decision?", "Informerade ni personalen tillräckligt tidigt med ert tidigare beslut?", ["hr"], "d3")
          ]
        },
        challenges: [ch("The fraud uses real salary figures, so it is very convincing.", "Bedrägerierna använder verkliga lönebelopp och är därför mycket övertygande.")],
        decision: dec("d6", "ceo", ["How do you protect employees?", "Hur skyddar ni de anställda?"], [
          ["A clear all-staff warning, a verification number and practical help for anyone who responded.", "En tydlig varning till all personal, ett nummer för verifiering och praktisk hjälp till alla som har svarat."],
          ["A warning on the intranet.", "En varning på intranätet."],
          ["Advise staff to contact their bank.", "Råd till personalen att kontakta sin bank."]
        ], {
          knowns: [["Fraud messages quote real salaries.", "Bedrägerimeddelandena citerar verkliga löner."]],
          uncertainties: [["How many employees have responded.", "Hur många anställda som har svarat."]],
          tradeoffs: {
            operational: ["Helping individuals takes HR time.", "Att hjälpa enskilda tar tid för HR."],
            security: ["Warnings reduce successful fraud.", "Varningar minskar antalet lyckade bedrägerier."],
            legal: ["Duty of care towards employees.", "Arbetsgivarens omsorgsplikt mot de anställda."],
            reputational: ["Staff will remember who helped them.", "Personalen kommer att minnas vem som hjälpte dem."]
          },
          evaluation: [["Offers practical help, not only warnings", "Erbjuder praktisk hjälp, inte bara varningar"]],
          pushback: {
            A: [
              pb(["Who answers the number?", "Vem svarar i numret?"], ["Within an hour of announcing the verification number, there is a queue of worried employees. HR and payroll are the only people who can answer, and they are also handling the incident. Who staffs the line, and for how many days?", "Inom en timme efter att verifieringsnumret gått ut finns en kö av oroliga anställda. HR och lön är de enda som kan svara, och de hanterar också incidenten. Vem bemannar linjen, och i hur många dagar?"]),
              pb(["Do you pay them back?", "Ersätter ni dem?"], ["One employee gave away their bank login and has lost money. They ask whether the employer will cover it, since the salary details came from your systems. If you pay one, you may have to pay all. What does “practical help” mean in money?", "En anställd lämnade ut sin bankinloggning och har förlorat pengar. Hen frågar om arbetsgivaren står för det, eftersom löneuppgifterna kom från era system. Betalar ni för en kan ni behöva betala för alla. Vad betyder ”praktisk hjälp” i pengar?"]),
              pb(["A fake verification number", "Ett falskt verifieringsnummer"], ["Hours after your warning, staff receive a new text claiming to come from your verification service, with a different number. Your own safeguard is now a lure. How do people know which number is real, and do you change it?", "Några timmar efter er varning får personal ett nytt sms som påstås komma från er verifieringstjänst, med ett annat nummer. Ert eget skydd har blivit ett bete. Hur ska folk veta vilket nummer som är äkta, och byter ni det?"])
            ],
            B: [
              pb(["The most exposed see it last", "De mest utsatta ser det sist"], ["Employees on sick leave, whose details were in the files, rarely open the intranet, and neither do many staff without desks. The people most likely to be targeted are the least likely to see your notice. How do you reach them?", "Sjukskrivna medarbetare, vars uppgifter fanns i filerna, öppnar sällan intranätet, och det gör inte heller många utan eget skrivbord. De som mest troligt blir måltavlor är de som minst troligt ser ert meddelande. Hur når ni dem?"]),
              pb(["Click here to stay safe", "Klicka här för att vara säker"], ["To read the warning, staff must follow a link and sign in, days after being told not to trust sign-in links about salaries. Some refuse to click. Is the intranet the right channel for a warning about this kind of fraud?", "För att läsa varningen måste personalen följa en länk och logga in, några dagar efter att de fått höra att de inte ska lita på inloggningslänkar om löner. En del vägrar klicka. Är intranätet rätt kanal för en varning om just det här bedrägeriet?"]),
              pb(["Already too late for some", "Redan för sent för några"], ["HR reports that several employees have already answered the texts and entered their bank logins. A notice on the intranet does nothing for them. Who helps the people who already fell for it, and is a notice really your whole response?", "HR meddelar att flera anställda redan har svarat på sms:en och angett sina bankinloggningar. Ett meddelande på intranätet gör ingenting för dem. Vem hjälper dem som redan har gått på det, och är ett meddelande verkligen hela er insats?"])
            ],
            C: [
              pb(["The bank needs a transaction", "Banken behöver en transaktion"], ["Employees who call their banks are told there is little to do until a specific fraudulent payment appears. They come back to HR, frustrated. Is pointing them to the bank help, or a way of passing the problem on?", "Anställda som ringer sin bank får höra att det inte går att göra mycket förrän en specifik bedräglig betalning syns. De kommer tillbaka till HR, frustrerade. Är det hjälp att hänvisa till banken, eller ett sätt att lämpa över problemet?"]),
              pb(["Your leak, our problem", "Er läcka, vårt problem"], ["The union representative puts it bluntly: the employer's systems leaked staff salaries, and the employer's advice is for staff to call their own banks. They ask what the company itself will do. What is your answer?", "Det fackliga ombudet säger det rakt ut: arbetsgivarens system läckte personalens löner, och arbetsgivarens råd är att de anställda ska ringa sin egen bank. Hen frågar vad företaget självt tänker göra. Vad svarar ni?"]),
              pb(["The next trick is different", "Nästa trick är ett annat"], ["The files contain more than salaries: names, managers, sick leave. The next message might not ask for a bank login at all, but pretend to be a manager or a health service. Does advice about the bank cover what is coming?", "Filerna innehåller mer än löner: namn, chefer, sjukfrånvaro. Nästa meddelande kanske inte alls ber om en bankinloggning, utan utger sig för att vara en chef eller vården. Täcker råd om banken det som kan komma?"])
            ]
          }
        }),
        facilitator: fac(
          ["The harm reaches people's private lives. Look for care.", "Skadan når människors privatliv. Se efter omsorg."],
          ["A fast, clear warning, verification routes and help for victims.", "En snabb och tydlig varning, sätt att verifiera och hjälp till de drabbade."],
          [["Ask: what would make this fraud fail?", "Fråga: vad skulle få det här bedrägeriet att misslyckas?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 2880,
        title: L(["Whose fault?", "Vems fel?"]),
        twist: L(["HR wants to discipline the user who pressed “approve”. Security says the design was the failure.", "HR vill vidta disciplinåtgärder mot användaren som tryckte ”godkänn”. Säkerhet menar att det var utformningen som brast."]),
        twistKind: "authority",
        reconsider: { decision: "d4", pressure: { en: "HR wants to discipline the user. Some of the colleagues who clicked are senior managers. Does the way you handled the spread treat everyone the same?", sv: "HR vill vidta disciplinåtgärder mot användaren. Några av kollegorna som klickade är högre chefer. Behandlar ert sätt att hantera spridningen alla lika?" } },
        assumptionChallenged: L(["User error caused this incident.", "Ett användarfel orsakade den här incidenten."]),
        narrative: L([
          "Two days later. The immediate incident is under control, and a meeting about consequences is called.\n\nIt quickly turns into an argument about responsibility. One person approved a prompt they did not start, and clicked a link before that. The room has to decide whether that person is the cause, or the last line of a defence that was built to fail.",
          "Två dagar senare. Den akuta incidenten är under kontroll, och ett möte om konsekvenser kallas in.\n\nDet blir snabbt ett gräl om ansvar. En person godkände en förfrågan som hen inte själv hade startat, och klickade på en länk innan dess. Rummet måste avgöra om den personen är orsaken, eller den sista linjen i ett försvar som var byggt för att brista."
        ]),
        injects: [
          inj("i7-1", 2880, "executiveMessage", "person.hr", "medium", "disputed", [
            "“The user approved a prompt they did not initiate and clicked a phishing link. Training was mandatory. There have to be consequences.”",
            "”Användaren godkände en förfrågan hen inte själv hade startat och klickade på en nätfiskelänk. Utbildningen var obligatorisk. Det måste få konsekvenser.”"
          ], { facilitatorNote: ["Disputed: the session was stolen before the prompts, by a page indistinguishable from the real one. Punishing the reporter discourages reporting.", "Omstritt: sessionen stals före förfrågningarna, av en sida som inte gick att skilja från den riktiga. Att straffa den som rapporterade avskräcker andra från att rapportera."], tests: ["lo4"] }),
          inj("i7-2", 2900, "employeeReport", "employee", "low", "confirmed", [
            "Two other employees admit they also approved strange prompts last month but didn't report it, “because people get in trouble”.",
            "Två andra anställda medger att de också godkände konstiga förfrågningar förra månaden men inte rapporterade det, ”för att man får problem”."
          ], { optional: true, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which technical controls would make this mistake impossible?", "Vilka tekniska kontroller skulle göra det här misstaget omöjligt?", ["ciso", "cloudLead"]),
            q("How do you encourage reporting of odd prompts?", "Hur uppmuntrar ni rapportering av konstiga förfrågningar?", ["socLead"]),
            q("Did your app-consent decision close what the user could not have prevented?", "Stängde ert beslut om samtycken det som användaren inte kunde ha förhindrat?", ["cloudLead"], "d5")
          ],
          executive: [
            q("What message does disciplining the user send to everyone else?", "Vilket budskap skickar en disciplinåtgärd mot användaren till alla andra?", ["hr", "ceo"]),
            q("Who is accountable for the MFA design?", "Vem ansvarar för hur MFA är utformat?", ["ciso", "ceo"]),
            q("How does this fit with how you have supported staff so far?", "Hur går det här ihop med hur ni har stöttat personalen hittills?", ["hr"], "d6")
          ]
        },
        challenges: [ch("Other employees hid similar events out of fear.", "Andra anställda har dolt liknande händelser av rädsla.")],
        decision: dec("d7", "ceo", ["How do you handle accountability?", "Hur hanterar ni ansvarsfrågan?"], [
          ["No sanctions for the user; thank them for reporting and fix the design.", "Inga sanktioner mot användaren; tacka för rapporteringen och rätta utformningen."],
          ["A formal reminder of training obligations.", "En formell påminnelse om utbildningskraven."],
          ["Disciplinary action as HR proposes.", "Disciplinåtgärder enligt HR:s förslag."]
        ], {
          knowns: [["The session was stolen before the prompts.", "Sessionen stals före förfrågningarna."]],
          uncertainties: [["How many similar events went unreported.", "Hur många liknande händelser som aldrig rapporterades."]],
          tradeoffs: {
            operational: ["Sanctions do not change how logins work.", "Sanktioner ändrar inte hur inloggningen fungerar."],
            security: ["Fear suppresses the reports you depend on.", "Rädsla kväver de rapporter ni är beroende av."],
            legal: ["Disciplinary action needs a fair basis.", "Disciplinåtgärder kräver ett rättvist underlag."],
            reputational: ["A just culture attracts honesty.", "En rättvis kultur lockar fram ärlighet."]
          },
          evaluation: [["Distinguishes design failure from individual blame", "Skiljer mellan brister i utformningen och individuell skuld"]],
          pushback: {
            A: [
              pb(["Then why mandatory training?", "Varför då obligatorisk utbildning?"], ["HR replies that the user also clicked the link before the prompts, and the training was mandatory. If nothing follows, staff who took it seriously will ask what it was for. What do you say to them?", "HR svarar att användaren också klickade på länken före förfrågningarna, och att utbildningen var obligatorisk. Om inget händer kommer de som tog den på allvar att fråga vad den var till för. Vad säger ni till dem?"]),
              pb(["Last year was different", "I fjol var det annorlunda"], ["An employee who received a written warning last year for a careless click asks why this case gets thanks instead. Is your new principle fair if it only applies from today, and do you revisit the old case?", "En anställd som fick en skriftlig varning i fjol för ett slarvigt klick frågar varför det här fallet får tack i stället. Är er nya princip rättvis om den bara gäller från i dag, och tar ni upp det gamla fallet igen?"]),
              pb(["Fix the design — who, when?", "Rätta utformningen – vem, när?"], ["“Fix the design” has no owner and no date yet. Without both, staff may hear “no sanctions” as “no change”. Who owns the fix, by when, and what will you tell people if it slips?", "”Rätta utformningen” har ännu ingen ägare och inget datum. Utan båda kan personalen höra ”inga sanktioner” som ”ingen förändring”. Vem äger åtgärden, till när, och vad säger ni om den drar ut på tiden?"])
            ],
            B: [
              pb(["Reminded of what?", "Påmind om vad?"], ["The training taught staff to look for spelling mistakes and odd senders. The page the user signed in to looked exactly like the real one. What exactly is the user being reminded to do that would have helped here?", "Utbildningen lärde personalen att leta efter stavfel och konstiga avsändare. Sidan som användaren loggade in på såg exakt ut som den riktiga. Vad exakt påminns användaren om att göra som hade hjälpt här?"]),
              pb(["A note in the file", "En anteckning i akten"], ["Two employees just admitted hiding strange prompts “because people get in trouble”. A formal reminder in the user's file is a mild version of exactly that. Will the next person who approves a prompt by mistake report it?", "Två anställda har just medgett att de dolde konstiga förfrågningar ”för att man får problem”. En formell påminnelse i användarens akt är en mild variant av just det. Kommer nästa person som godkänner en förfrågan av misstag att rapportera det?"]),
              pb(["The managers who clicked", "Cheferna som klickade"], ["Some of the colleagues who entered credentials on the internal phishing page are senior managers. Do they get the same formal reminder, and if not, what does that tell staff about who the rules are for?", "Några av kollegorna som angav sina uppgifter på den interna nätfiskesidan är högre chefer. Får de samma formella påminnelse, och om inte, vad säger det till personalen om vem reglerna gäller för?"])
            ],
            C: [
              pb(["Reports dry up", "Rapporterna tystnar"], ["A week after word of the disciplinary case spreads, the service desk notices that reports of suspicious prompts have stopped entirely. Either the attacks stopped, or the reporting did. Which is more likely, and how will you find out?", "En vecka efter att det spridits att ett disciplinärende har inletts märker servicedesken att rapporterna om misstänkta förfrågningar har upphört helt. Antingen upphörde angreppen, eller rapporteringen. Vilket är troligast, och hur tar ni reda på det?"]),
              pb(["The union will contest", "Facket kommer att bestrida"], ["The union says your own logs show the session was stolen before the prompts, through a page nobody could tell from the real one. They will contest any sanction and use your logs to do it. Can you defend the case with your own evidence against you?", "Facket säger att era egna loggar visar att sessionen stals före förfrågningarna, via en sida som ingen kunde skilja från den riktiga. De kommer att bestrida varje sanktion och använda era loggar för att göra det. Kan ni försvara ärendet när er egen bevisning talar emot er?"]),
              pb(["All of them, then?", "Alla, alltså?"], ["{{num.clickers}} colleagues entered their credentials on the internal phishing page, some of them senior managers. If one user is disciplined for being fooled, are they all? If not, how do you explain the difference?", "{{num.clickers}} kollegor angav sina uppgifter på den interna nätfiskesidan, några av dem högre chefer. Om en användare får en disciplinåtgärd för att ha blivit lurad, får alla det? Om inte, hur förklarar ni skillnaden?"])
            ]
          }
        }),
        facilitator: fac(
          ["A just-culture discussion. Don't lecture; let the evidence carry it.", "En diskussion om rättvis kultur. Föreläs inte; låt fakta tala."],
          ["No sanction for the reporter, and investment in phishing-resistant methods.", "Ingen sanktion för den som rapporterade, och investering i nätfiskeresistenta metoder."],
          [["Ask: would you have spotted the fake page?", "Fråga: hade ni själva upptäckt den falska sidan?"]]
        )
      },
      {
        id: "p8",
        priority: 4,
        clock: 4320,
        title: L(["The price of the fix", "Priset för lösningen"]),
        twist: L(["Phishing-resistant MFA breaks legacy apps — and last year's audit already recommended it.", "Nätfiskeresistent MFA slår ut äldre applikationer – och förra årets revision rekommenderade det redan."]),
        twistKind: "impact",
        assumptionChallenged: L(["The fix is a simple setting.", "Lösningen är en enkel inställning."]),
        narrative: L([
          "Three days later. The board receives the incident summary and asks for a remediation plan with costs and dates.\n\nEveryone agrees that pressing “approve” should never be enough again. The difficulty is what the real fix costs, what it breaks, and why it was not already in place.",
          "Tre dagar senare. Styrelsen får incidentsammanfattningen och begär en åtgärdsplan med kostnader och datum.\n\nAlla är överens om att ett tryck på ”godkänn” aldrig mer ska räcka. Svårigheten är vad den riktiga lösningen kostar, vad den slår ut och varför den inte redan fanns på plats."
        ]),
        injects: [
          inj("i8-1", 4320, "impactReport", "person.cloudLead", "medium", "confirmed", [
            "Moving all {{num.employees}} employees to security keys or device-bound passkeys means replacing three legacy applications that only support passwords, and buying keys. Estimated six months.",
            "Att flytta alla {{num.employees}} anställda till säkerhetsnycklar eller enhetsbundna passkeys innebär att tre äldre applikationer som bara stöder lösenord måste ersättas, och att nycklar måste köpas in. Uppskattningsvis sex månader."
          ], { fallbackRole: "itOps", tests: ["lo1"] }),
          inj("i8-2", 4340, "email", "management", "medium", "confirmed", [
            "The chair of the audit committee: “Last year's audit recommended phishing-resistant MFA for privileged and finance staff. Why was this not done?”",
            "Ordföranden i revisionsutskottet: ”Förra årets revision rekommenderade nätfiskeresistent MFA för privilegierad personal och ekonomipersonal. Varför genomfördes det inte?”"
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Who gets phishing-resistant MFA first, and why?", "Vem får nätfiskeresistent MFA först, och varför?", ["ciso", "cloudLead"]),
            q("What interim controls reduce risk until the rollout is done?", "Vilka tillfälliga kontroller minskar risken tills införandet är klart?", ["cloudLead", "socLead"]),
            q("Which of your containment steps would have been unnecessary with phishing-resistant MFA?", "Vilka av era begränsningssteg hade varit onödiga med nätfiskeresistent MFA?", ["ciso"], "d2")
          ],
          executive: [
            q("How do you answer the audit committee honestly?", "Hur svarar ni revisionsutskottet ärligt?", ["ceo", "ciso"]),
            q("Do you fund the full rollout now?", "Finansierar ni hela införandet nu?", ["ceo"]),
            q("Does your stance on accountability apply to the ignored audit too?", "Gäller er hållning i ansvarsfrågan även den ignorerade revisionen?", ["ceo"], "d7")
          ]
        },
        challenges: [ch("Six months and replacing legacy systems — for something that was recommended a year ago.", "Sex månader och utbyte av äldre system – för något som rekommenderades för ett år sedan.")],
        decision: dec("d8", "ceo", ["What is the remediation plan?", "Vilken är åtgärdsplanen?"], [
          ["Phishing-resistant MFA for privileged, finance and HR staff within a month, everyone within six.", "Nätfiskeresistent MFA för privilegierad personal, ekonomi och HR inom en månad, för alla inom sex."],
          ["Number matching and location rules now; phishing-resistant MFA next year.", "Sifferkontroll och platsregler nu; nätfiskeresistent MFA nästa år."],
          ["Awareness training for everyone now, and phishing-resistant MFA only where the legacy apps allow it.", "Utbildning i medvetenhet för alla nu, och nätfiskeresistent MFA bara där de äldre apparna tillåter det."]
        ], {
          knowns: [["Push MFA was bypassed by session theft.", "Push-MFA kringgicks genom stöld av sessionen."]],
          uncertainties: [["How quickly legacy apps can be replaced.", "Hur snabbt äldre applikationer kan ersättas."]],
          tradeoffs: {
            operational: ["Replacing legacy apps disrupts teams.", "Att ersätta äldre applikationer stör arbetet i flera team."],
            security: ["Number matching does not stop relayed logins.", "Sifferkontroll stoppar inte förmedlade inloggningar."],
            legal: ["Ignoring audit findings twice is hard to defend.", "Att ignorera revisionsfynd två gånger är svårt att försvara."],
            reputational: ["The board expects a credible plan.", "Styrelsen förväntar sig en trovärdig plan."]
          },
          evaluation: [["Prioritises the highest-risk users first", "Prioriterar användarna med högst risk först"], ["Addresses the root cause, not only awareness", "Åtgärdar grundorsaken, inte bara medvetenheten"]],
          pushback: {
            A: [
              pb(["First movers use old apps", "De första använder gamla appar"], ["The legacy applications that only support passwords are used mostly by finance and HR, exactly the groups you move first. Within a month they either lose those applications or get exceptions. Which, and how is an exception different from no change?", "De äldre applikationerna som bara stöder lösenord används mest av ekonomi och HR, just de grupper ni flyttar först. Inom en månad förlorar de antingen applikationerna eller får undantag. Vilket blir det, och hur skiljer sig ett undantag från ingen förändring?"]),
              pb(["Not in the budget", "Inte i budgeten"], ["The finance director says keys, replacement applications and project staff were not in this year's budget. The money has to come from somewhere. What do you stop doing to pay for it, and who agrees to that?", "Ekonomichefen säger att nycklar, nya applikationer och projektpersonal inte fanns i årets budget. Pengarna måste tas någonstans. Vad slutar ni göra för att betala för det, och vem går med på det?"]),
              pb(["Lost keys, locked-out staff", "Borttappade nycklar, utelåst personal"], ["The service desk asks what happens when someone loses their key on a business trip or leaves it at home. Every lost key is a locked-out employee and a recovery process an attacker could also try. Who designs that process before the rollout?", "Servicedesken frågar vad som händer när någon tappar sin nyckel på en tjänsteresa eller glömmer den hemma. Varje borttappad nyckel är en utelåst medarbetare och en återställningsprocess som en angripare också kan pröva. Vem utformar den processen före införandet?"])
            ],
            B: [
              pb(["It would not have stopped this", "Det hade inte stoppat det här"], ["Number matching asks the user to type a number shown on the login page. On the relay page, the user would have seen the right number and typed it. What does this plan stop that actually happened here?", "Sifferkontroll ber användaren skriva in en siffra som visas på inloggningssidan. På den förmedlande sidan hade användaren sett rätt siffra och skrivit in den. Vad stoppar planen som faktiskt hände här?"]),
              pb(["Deferred again", "Uppskjutet igen"], ["The audit committee chair notes that last year's recommendation was deferred, and the new plan defers it again, to next year. How is this different from what happened last time, and what would you say to the committee in twelve months?", "Ordföranden i revisionsutskottet konstaterar att förra årets rekommendation sköts upp, och den nya planen skjuter upp den igen, till nästa år. Hur skiljer sig det från förra gången, och vad skulle ni säga till utskottet om tolv månader?"]),
              pb(["Exceptions on day one", "Undantag redan första dagen"], ["Location rules block sign-ins from unexpected countries. On day one, staff who travel and colleagues working abroad ask for exceptions, and a manager insists. How many exceptions before the rule means nothing?", "Platsregler blockerar inloggningar från oväntade länder. Redan första dagen ber personal som reser och kollegor som arbetar utomlands om undantag, och en chef står på sig. Hur många undantag innan regeln inte betyder något?"])
            ],
            C: [
              pb(["Training against a perfect copy", "Utbildning mot en perfekt kopia"], ["The page that fooled the user was indistinguishable from the real sign-in. Your own accountability discussion concluded that much. What will awareness training teach people to spot that they could not have spotted this time?", "Sidan som lurade användaren gick inte att skilja från den riktiga inloggningen. Det kom ni själva fram till i diskussionen om ansvar. Vad ska utbildningen lära folk att upptäcka som de inte hade kunnat upptäcka den här gången?"]),
              pb(["Where the old apps live", "Där de gamla apparna finns"], ["The cloud lead points out that the legacy applications are mostly used by payroll, finance and HR. “Only where the apps allow it” means the people attackers target first stay on push prompts. Is that the plan you want to present?", "Molnansvarig påpekar att de äldre applikationerna främst används av lön, ekonomi och HR. ”Bara där apparna tillåter det” betyder att de som angripare riktar in sig på först blir kvar på push-förfrågningar. Är det den planen ni vill lägga fram?"]),
              pb(["It sounds like blame", "Det låter som skuld"], ["After the debate about accountability, staff hear “training for everyone” as “this was your fault”. Some say so openly. Does this plan undo the message you have just tried to send, and how would you explain it to the user who reported?", "Efter debatten om ansvar hör personalen ”utbildning för alla” som ”det här var ert fel”. En del säger det öppet. Upphäver planen det budskap ni just försökt skicka, och hur skulle ni förklara den för användaren som rapporterade?"])
            ]
          }
        }),
        facilitator: fac(
          ["Close on investment and governance.", "Avsluta med investeringar och styrning."],
          ["A phased, funded rollout of phishing-resistant MFA starting with high-risk roles.", "Ett stegvist och finansierat införande av nätfiskeresistent MFA, med början i roller med hög risk."],
          [["Ask: what would make you act on next year's audit finding?", "Fråga: vad skulle få er att agera på nästa års revisionsfynd?"]]
        )
      }
    ],

    resolution: {
      type: "resolved",
      text: L([
        "All sessions and malicious consents are removed, staff are supported, and phishing-resistant MFA is rolled out — starting with the people attackers target first.",
        "Alla sessioner och skadliga samtycken är borttagna, personalen får stöd och nätfiskeresistent MFA införs – med början hos dem som angripare riktar in sig på först."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Push MFA can be relayed and fatigued; phishing-resistant methods stop both.", "Push-MFA kan förmedlas och tröttas ut; nätfiskeresistenta metoder stoppar båda."]),
        L(["Password resets do not revoke sessions or app consents.", "Lösenordsbyten återkallar inte sessioner eller samtycken till appar."]),
        L(["A compromised colleague is the most convincing phishing source.", "En kapad kollega är den mest övertygande avsändaren av nätfiske."]),
        L(["Thank people who report; blame suppresses the signals you need.", "Tacka dem som rapporterar; skuldbeläggning kväver de signaler ni behöver."])
      ],
      assumptionsVsReality: [
        avr(["The approved prompt let them in.", "Den godkända förfrågan släppte in dem."], ["A stolen session token did.", "En stulen sessionstoken gjorde det."], "p2"),
        avr(["They had minutes.", "De hade minuter på sig."], ["They had hours in mail and files.", "De hade timmar i e-post och filer."], "p3"),
        avr(["One user affected.", "En användare drabbad."], ["Internal phishing spread it.", "Internt nätfiske spred det."], "p4"),
        avr(["A reset removes access.", "Ett lösenordsbyte tar bort åtkomsten."], ["An app consent survived.", "Ett samtycke till en app överlevde."], "p5")
      ],
      strengthsToLookFor: [
        L(["Revoking sessions, not just passwords", "Att återkalla sessioner, inte bara lösenord"]),
        L(["Warning staff through a trusted channel", "Att varna personalen via en betrodd kanal"]),
        L(["Supporting the user who reported", "Att stötta användaren som rapporterade"])
      ],
      commonGaps: [
        L(["Stopping at the password reset", "Att stanna vid lösenordsbytet"]),
        L(["Missing app consents as persistence", "Att missa samtycken till appar som persistens"]),
        L(["Blaming the user", "Att skylla på användaren"])
      ],
      suggestedActions: [
        act(["Roll out phishing-resistant MFA, starting with privileged, finance and HR staff.", "Inför nätfiskeresistent MFA, med början hos privilegierad personal, ekonomi och HR."], "ciso", "high"),
        act(["Require admin approval for app consents.", "Kräv administratörsgodkännande för samtycken till appar."], "cloudLead", "high"),
        act(["Alert on MFA prompt floods and new device registrations.", "Larma på flöden av MFA-förfrågningar och registrering av nya enheter."], "socLead", "high"),
        act(["Create a blame-free way to report suspicious prompts.", "Skapa ett sätt att rapportera misstänkta förfrågningar utan skuldbeläggning."], "hr", "medium"),
        act(["Track audit recommendations to closure.", "Följ upp revisionens rekommendationer tills de är åtgärdade."], "ceo", "medium")
      ]
    }
  });
})();
