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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Contain an identity compromise beyond a password reset", "Begränsa ett identitetsintrång bortom ett lösenordsbyte"]) },
      { id: "lo2", text: L(["Scope mailbox and file access by an attacker", "Avgränsa en angripares åtkomst till e-post och filer"]) },
      { id: "lo3", text: L(["Stop internal phishing spreading through trust", "Stoppa intern nätfiske som sprids genom förtroende"]) },
      { id: "lo4", text: L(["Treat users as part of the defence, not the cause", "Behandla användare som en del av försvaret, inte som orsaken"]) }
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
          ], { tests: ["lo4"] })
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
          ["Leave it until the morning and ask the user to deny further prompts.", "Låt det vara till i morgon och be användaren neka fler förfrågningar."]
        ], {
          knowns: [["A prompt was approved and a new device registered.", "En förfrågan godkändes och en ny enhet registrerades."]],
          uncertainties: [["How the attacker got the password in the first place.", "Hur angriparen fick tag på lösenordet från början."]],
          tradeoffs: {
            operational: ["Disabling the account may delay payroll.", "Att spärra kontot kan försena lönekörningen."],
            security: ["A reset alone may not end an active session.", "Ett nytt lösenord räcker kanske inte för att avsluta en aktiv session."],
            legal: ["Payroll data is personal data.", "Lönedata är personuppgifter."],
            reputational: ["Late salaries are visible to every employee.", "Försenade löner märks för varje anställd."]
          },
          evaluation: [["Revokes sessions, not just the password", "Återkallar sessioner, inte bara lösenordet"], ["Thanks the user for reporting", "Tackar användaren för rapporteringen"]]
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
          evaluation: [["Hunts for other recipients of the same lure", "Söker efter andra mottagare av samma bete"]]
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
          evaluation: [["Recognises health data in sick-leave records", "Ser hälsouppgifterna i sjukfrånvarouppgifterna"]]
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
          evaluation: [["Revokes sessions for every victim", "Återkallar sessioner för varje offer"], ["Warns staff outside the compromised channel", "Varnar personalen utanför den komprometterade kanalen"]]
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
          evaluation: [["Treats app consents as persistence", "Behandlar samtycken till appar som persistens"]]
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
          evaluation: [["Offers practical help, not only warnings", "Erbjuder praktisk hjälp, inte bara varningar"]]
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
          evaluation: [["Distinguishes design failure from individual blame", "Skiljer mellan brister i utformningen och individuell skuld"]]
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
          ["More awareness training.", "Mer utbildning i medvetenhet."]
        ], {
          knowns: [["Push MFA was bypassed by session theft.", "Push-MFA kringgicks genom stöld av sessionen."]],
          uncertainties: [["How quickly legacy apps can be replaced.", "Hur snabbt äldre applikationer kan ersättas."]],
          tradeoffs: {
            operational: ["Replacing legacy apps disrupts teams.", "Att ersätta äldre applikationer stör arbetet i flera team."],
            security: ["Number matching does not stop relayed logins.", "Sifferkontroll stoppar inte förmedlade inloggningar."],
            legal: ["Ignoring audit findings twice is hard to defend.", "Att ignorera revisionsfynd två gånger är svårt att försvara."],
            reputational: ["The board expects a credible plan.", "Styrelsen förväntar sig en trovärdig plan."]
          },
          evaluation: [["Prioritises the highest-risk users first", "Prioriterar användarna med högst risk först"], ["Addresses the root cause, not only awareness", "Åtgärdar grundorsaken, inte bara medvetenheten"]]
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
