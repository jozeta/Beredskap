/*
 * b09-sim-swap.js — "The CFO's Phone Went Quiet" (branching, SIM swap).
 *
 * The CFO's phone loses service mid-meeting; minutes later the bank reports a
 * new device on the corporate banking account. Attackers moved the number to
 * their SIM and now receive every SMS code. Spine: no signal → the codes → the
 * payment → others → police and bank → approvals → the money → a second
 * attempt → the carrier contract → the board. Alternative: new numbers for
 * every executive. Break-away at approvals: a "recovery agent".
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, pb, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b09-sim-swap",
    version: 1,
    format: "branching",
    category: "sim-swap",
    archetype: "obvious-incident-hidden-secondary",
    emblem: "sim-swap",
    title: L(["The CFO's Phone Went Quiet", "Ekonomichefens telefon tystnade"]),
    summary: L([
      "In the middle of a meeting the CFO's phone loses service. Ten minutes later the bank asks why a new device was added to the company's account.",
      "Mitt under ett möte tappar ekonomichefens telefon täckningen. Tio minuter senare frågar banken varför en ny enhet har lagts till på företagets konto."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Recognise a SIM swap and act within minutes", "Känna igen en SIM-kapning och agera inom några minuter"]), teaser: L(["Minutes that matter", "Minuter som spelar roll"]) },
      { id: "lo2", text: L(["Stop and recall a fraudulent payment", "Stoppa och återkalla en bedräglig betalning"]), teaser: L(["Getting money back", "Att få tillbaka pengar"]) },
      { id: "lo3", text: L(["Remove SMS from critical authentication and approvals", "Ta bort sms från kritisk inloggning och attestering"]), teaser: L(["How you prove who someone is", "Hur ni bevisar vem någon är"]) },
      { id: "lo4", text: L(["Work with a telecom carrier under pressure", "Samarbeta med en teleoperatör under tidspress"]), teaser: L(["Depending on someone else's help", "Att vara beroende av någon annans hjälp"]) }
    ],
    mitre: ["T1451", "T1111", "T1078", "T1098", "T1657"],
    frameworks: {
      nistCsf: ["GV.SC", "PR.AA", "PR.AT", "DE.AE", "RS.MA", "RS.MI"],
      iso27001: ["A.5.16", "A.5.17", "A.5.19", "A.5.24", "A.5.26", "A.8.5"]
    },
    constraints: { startWindow: "business-hours" },
    actor: { types: ["criminal"], motivation: L(["Financial: payment fraud through intercepted SMS codes", "Ekonomisk: betalningsbedrägeri via uppfångade sms-koder"]), capability: "medium" },
    variables: {
      transfer: { min: 150000, max: 6000000, scaleBy: "size", step: 10000, currency: true },
      recoveredPct: { min: 40, max: 85 },
      execs: { min: 2, max: 5 }
    },
    roles: ["incidentCommander", "cfo", "ceo", "ciso", "socLead", "itOps", "legal", "comms", "supplierManager", "hr"],

    flags: {
      freezeLifted: L(["Payment freeze lifted under pressure", "Betalningsstoppet hävt under tryck"]),
      assumedFault: L(["Assumed a network fault", "Antog ett nätfel"]),
      paymentsFrozen: L(["Corporate payments frozen at once", "Företagets betalningar frysta direkt"]),
      smsRemoved: L(["SMS codes removed as a sign-in method", "Sms-koder borttagna som inloggningsmetod"]),
      portLock: L(["Executive numbers locked at the carrier", "Chefernas nummer låsta hos operatören"]),
      recallStarted: L(["Payment recall started within hours", "Återkallelse av betalningen startad inom några timmar"]),
      reported: L(["Reported to the police and the bank", "Anmält till polisen och banken"])
    },

    start: "c1",
    pages: [
      pg("c1", ["No signal", "Ingen täckning"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. In the middle of the budget meeting, {{person.cfo.name}} glances at their phone. It shows “No SIM”, with no signal and no calls.\n\nTen minutes later, at {{time.T+10|clock}}, an email arrives from {{supplier.bank}}: “A new device was registered for your corporate online banking.” Nobody in the meeting registered anything. Someone else now receives the CFO's text messages.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Mitt under budgetmötet tittar {{person.cfo.name}} på sin telefon. Den visar ”Inget SIM”, utan täckning och utan samtal.\n\nTio minuter senare, klockan {{time.T+10|clock}}, kommer ett mejl från {{supplier.bank}}: ”En ny enhet har registrerats för er företagsbank.” Ingen på mötet har registrerat något. Någon annan tar nu emot ekonomichefens sms."
      ], {
        injects: [
          inj("b9-1", 10, "email", "bank", "high", "confirmed", [
            "A new device was registered for corporate online banking user {{person.cfo.firstName}}. If this was not you, contact us immediately.",
            "En ny enhet har registrerats för företagsbankens användare {{person.cfo.firstName}}. Om det inte var du, kontakta oss omedelbart."
          ], { headline: ["Security notice from the bank", "Säkerhetsmeddelande från banken"], meta: { from: "security@{{supplier.bank.domain}}", subject: L(["New device registered", "Ny enhet registrerad"]) }, tests: ["lo1"] })
        ],
        discuss: [q("What else does the CFO's phone number unlock?", "Vad mer låser ekonomichefens telefonnummer upp?", ["ciso", "cfo"])],
        facilitator: { notes: L(["Lost signal plus a new bank device equals SIM swap until proven otherwise. Minutes matter.", "Tappad täckning plus en ny bankenhet betyder SIM-kapning tills motsatsen är bevisad. Minuterna räknas."]) },
        choice: ask(["What do you do first?", "Vad gör ni först?"], ["Treats it as a SIM swap and freezes payments before anything else.", "Behandlar det som en SIM-kapning och fryser betalningarna före allt annat."], [
          opt(["Call the bank's fraud line and freeze payments", "Ring bankens bedrägerilinje och frys betalningarna"], "c2", ["Stops the money first.", "Stoppar pengarna först."], { set: "paymentsFrozen", pushback: [
            pb(["Payroll goes out today", "Lönerna går i dag"], ["Treasury points out that the freeze also stops today's supplier run and a payroll file already sent to the bank. All you have so far is a lost signal and one email. Do you hold every payment on that, or carve out exceptions?", "Finansavdelningen påpekar att stoppet också stoppar dagens leverantörsbetalningar och en lönefil som redan skickats till banken. Allt ni har hittills är en tappad täckning och ett mejl. Stoppar ni varje betalning på det underlaget, eller gör ni undantag?"]),
            pb(["Prove it is you", "Bevisa att det är ni"], ["The fraud line asks how it can verify that the caller really speaks for the company. Its usual answer is a code sent to the CFO's phone, the very number you think is stolen. How do you prove who you are to the bank, right now?", "Bedrägerilinjen frågar hur den kan kontrollera att den som ringer verkligen företräder företaget. Det vanliga svaret är en kod till ekonomichefens telefon, just det nummer ni tror är stulet. Hur bevisar ni för banken vilka ni är, just nu?"]),
            pb(["Maybe just bad signal", "Kanske bara dålig täckning"], ["The CFO says the phone has dropped signal in this building before, and the bank's email could itself be phishing. Freezing everything on a guess will be noticed by the CEO and the bank alike. What would make you confident enough to keep the freeze?", "Ekonomichefen säger att telefonen har tappat täckningen i den här byggnaden förut, och bankens mejl kan i sig vara nätfiske. Att frysa allt på en gissning märks både hos vd och banken. Vad skulle göra er tillräckligt säkra för att behålla stoppet?"])
          ] }),
          opt(["Restart the phone; probably a network fault", "Starta om telefonen; troligen ett nätfel"], "c2", ["Ten more minutes for the attacker.", "Tio minuter till för angriparen."], { set: "assumedFault", pushback: [
            pb(["Still “No SIM”", "Fortfarande ”Inget SIM”"], ["The phone restarts and still shows “No SIM”. Ten minutes have gone, and the CFO suggests trying once more with the SIM card taken out. Do you keep troubleshooting the handset, or accept now that this is not a network fault?", "Telefonen startar om och visar fortfarande ”Inget SIM”. Tio minuter har gått, och ekonomichefen föreslår ett försök till med SIM-kortet uttaget. Fortsätter ni felsöka telefonen, eller accepterar ni nu att det inte är ett nätfel?"]),
            pb(["Everyone else has signal", "Alla andra har täckning"], ["Everyone else in the meeting room has full signal on the same carrier. A fault that hits only the CFO's phone, minutes before a new bank device appears, is hard to explain. Who is still willing to call it a network fault, and why?", "Alla andra i mötesrummet har full täckning hos samma operatör. Ett fel som bara drabbar ekonomichefens telefon, några minuter innan en ny bankenhet dyker upp, är svårt att förklara. Vem vill fortfarande kalla det ett nätfel, och varför?"]),
            pb(["The bank is waiting", "Banken väntar"], ["The bank's email asked you to get in touch immediately if the new device was not yours. Nobody has called while the phone restarts. If that device is someone else's, every minute it stays registered is theirs. Who calls the bank, and why hasn't anyone already?", "Bankens mejl bad er höra av er omedelbart om den nya enheten inte var er. Ingen har ringt medan telefonen startar om. Om enheten tillhör någon annan är varje minut den ligger kvar deras. Vem ringer banken, och varför har ingen redan gjort det?"])
          ] }),
          opt(["Call the carrier to get the number back", "Ring operatören för att få tillbaka numret"], "c2", ["Necessary, and slower than the bank.", "Nödvändigt, och långsammare än banken."], { pushback: [
            pb(["Stuck in the queue", "Fast i telefonkön"], ["The carrier's business line puts you in a queue with an estimated wait of half an hour. Meanwhile the new bank device stays registered and nobody has called the bank. Do you keep your place in the queue, or hang up and call the bank first?", "Operatörens företagslinje ställer er i en kö med en beräknad väntetid på en halvtimme. Under tiden ligger den nya bankenheten kvar och ingen har ringt banken. Behåller ni platsen i kön, eller lägger ni på och ringer banken först?"]),
            pb(["Prove you are the CFO", "Bevisa att du är ekonomichefen"], ["The carrier asks the CFO to verify their identity with a code texted to the number, or by visiting a shop with ID. The number is exactly what is missing. Do you send the CFO across town in the middle of this, and who takes over meanwhile?", "Operatören vill att ekonomichefen styrker sin identitet med en kod som sms:as till numret, eller genom att besöka en butik med legitimation. Numret är just det som saknas. Skickar ni ekonomichefen tvärs över stan mitt i det här, och vem tar över under tiden?"]),
            pb(["Number back, damage stays", "Numret tillbaka, skadan kvar"], ["Even if the carrier moves the number back within the hour, the device added to the bank account stays registered, and so does anything reset in the meantime. Getting the number back fixes the phone, not what it unlocked. What are you doing about the bank while you wait?", "Även om operatören flyttar tillbaka numret inom en timme ligger enheten i banken kvar, liksom allt som hunnit återställas under tiden. Att få tillbaka numret lagar telefonen, inte det den låste upp. Vad gör ni åt banken medan ni väntar?"])
          ] })
        ])
      }),

      pg("c2", ["The codes", "Koderna"], [
        "{{person.socLead.name}} sees it in the logs. The one-time codes sent by text message to the CFO's number, for email sign-in and for the bank, are being used from an unknown device.\n\nWhoever has the number can reset passwords and approve logins as if they were the CFO. The phone in the CFO's hand is now just a camera.",
        "{{person.socLead.name}} ser det i loggarna. Engångskoderna som skickas med sms till ekonomichefens nummer, för inloggning i e-posten och i banken, används från en okänd enhet.\n\nDen som har numret kan återställa lösenord och godkänna inloggningar som om de vore ekonomichefen. Telefonen i ekonomichefens hand är nu bara en kamera."
      ], {
        variants: [vr("assumedFault", [
          "While the phone was being restarted, someone reset the CFO's email password using a code sent by text message.\n\n{{person.socLead.name}} watches new mail rules being created in the CFO's inbox: anything mentioning “payment” is forwarded to an outside address. Restarting the phone did nothing. The number is somewhere else.",
          "Medan telefonen startades om återställde någon ekonomichefens e-postlösenord med en kod som skickades via sms.\n\n{{person.socLead.name}} ser nya regler skapas i ekonomichefens inkorg: allt som nämner ”betalning” vidarebefordras till en extern adress. Att starta om telefonen hjälpte inte. Numret finns någon annanstans."
        ], ["Because it was taken for a network fault, the attacker got into the mailbox.", "Eftersom det togs för ett nätfel kom angriparen in i brevlådan."])],
        injects: [
          inj("b9-2", 25, "authLog", "siem", "critical", "confirmed", [
            "{{person.cfo.email}} · password reset via SMS code · sign-in from new device · inbox rule created: forward messages containing 'payment'.",
            "{{person.cfo.email}} · lösenord återställt via sms-kod · inloggning från ny enhet · inkorgsregel skapad: vidarebefordra meddelanden som innehåller 'betalning'."
          ], { tests: ["lo3"] })
        ],
        choice: ask(["How do you cut the attacker off?", "Hur stänger ni ute angriparen?"], ["Removes SMS as a factor and revokes sessions, so the stolen number stops working.", "Tar bort sms som faktor och återkallar sessioner, så att det stulna numret slutar fungera."], [
          opt(["Revoke sessions and replace SMS with an app or key", "Återkalla sessioner och ersätt sms med app eller nyckel"], "l1", ["Makes the stolen number useless for sign-in.", "Gör det stulna numret oanvändbart för inloggning."], { set: "smsRemoved", pushback: [
            pb(["How do you enrol the CFO?", "Hur registrerar ni ekonomichefen?"], ["To set up an app or a key, the CFO must first sign in, and the helpdesk's usual check is a code or call-back to the phone number on file. That number is the stolen one. How does the helpdesk verify the CFO now, without trusting it?", "För att lägga till en app eller nyckel måste ekonomichefen först logga in, och supportens vanliga kontroll är en kod eller återuppringning till numret i registret. Det är det stulna numret. Hur kontrollerar supporten ekonomichefen nu, utan att lita på det?"]),
            pb(["Recovery still uses SMS", "Återställning använder fortfarande sms"], ["IT finds that SMS is still set as the account recovery method, separate from the sign-in setting. Removing it from sign-in did not remove it from “forgot password”. Do you tear SMS out everywhere now, even where you have not mapped what breaks?", "IT upptäcker att sms fortfarande är inställt som återställningsmetod, separat från inloggningen. Att ta bort det från inloggningen tog inte bort det från ”glömt lösenord”. River ni ut sms överallt nu, även där ni inte vet vad som går sönder?"]),
            pb(["Systems you don't control", "System ni inte styr över"], ["The CFO's number is also the second factor for the bank, the expense system and a supplier portal that IT does not manage. You can only change your own systems today. Which of the others do you accept are still open, and for how long?", "Ekonomichefens nummer är också andra faktor för banken, utläggssystemet och en leverantörsportal som IT inte förvaltar. I dag kan ni bara ändra era egna system. Vilka av de andra accepterar ni är öppna, och hur länge?"])
          ] }),
          opt(["Reset the CFO's password", "Återställ ekonomichefens lösenord"], "l1", ["The attacker resets it again with the next SMS code.", "Angriparen återställer det igen med nästa sms-kod."], { pushback: [
            pb(["Reset again", "Återställt igen"], ["Twenty minutes after your reset, the log shows another password reset on the CFO's account, completed with a text-message code. Your fix lasted one code. Do you reset a third time, or change approach?", "Tjugo minuter efter er återställning visar loggen en ny lösenordsåterställning på ekonomichefens konto, genomförd med en sms-kod. Er åtgärd höll i en kod. Återställer ni en tredje gång, eller byter ni spår?"]),
            pb(["The session lives on", "Sessionen lever vidare"], ["{{person.socLead.name}} notes that the reset did not sign out the unknown device: its session is still active. A new password does not end a session that already exists. Who decides whether to revoke sessions, and why wasn't that part of the plan?", "{{person.socLead.name}} ser att återställningen inte loggade ut den okända enheten: dess session är fortfarande aktiv. Ett nytt lösenord avslutar inte en session som redan finns. Vem beslutar om att återkalla sessioner, och varför var det inte en del av planen?"]),
            pb(["The wrong person locked out", "Fel person utelåst"], ["The CFO tries the new password, but sign-in still asks for a code sent to the stolen number. The attacker receives the code; the CFO does not. Have you locked out the right person or the wrong one?", "Ekonomichefen provar det nya lösenordet, men inloggningen kräver fortfarande en kod till det stulna numret. Angriparen får koden; ekonomichefen får den inte. Har ni låst ute rätt person eller fel?"])
          ] }),
          opt(["Lock the CFO's account completely", "Lås ekonomichefens konto helt"], "l1", ["Effective. The CFO is offline during the budget week.", "Effektivt. Ekonomichefen är utan konto under budgetveckan."], { pushback: [
            pb(["Budget week stops", "Budgetveckan stannar"], ["The CFO has budget papers due to the board this week and approvals waiting in the system. Finance asks who signs while the account is locked. Do you hand the CFO's authority to someone else today, without a plan for it?", "Ekonomichefen ska lämna budgetunderlag till styrelsen den här veckan och har attester som väntar i systemet. Ekonomi frågar vem som skriver under medan kontot är låst. Lämnar ni över ekonomichefens befogenheter till någon annan i dag, utan en plan för det?"]),
            pb(["The bank is not your directory", "Banken är inte er katalog"], ["Locking the CFO's account in your own systems does nothing at the bank, where the new device is still registered and text-message codes still work. Have you locked the door you can see and left the one that matters open?", "Att låsa ekonomichefens konto i era egna system påverkar inte banken, där den nya enheten fortfarande är registrerad och sms-koderna fortfarande fungerar. Har ni låst dörren ni ser och lämnat den som spelar roll öppen?"]),
            pb(["When do you unlock?", "När låser ni upp?"], ["Nobody has said what must be true before the account is unlocked. As long as text-message codes still work for sign-in, unlocking simply hands the account back to whoever holds the number. What is your condition for unlocking, and who owns that call?", "Ingen har sagt vad som måste gälla innan kontot låses upp. Så länge sms-koder fungerar för inloggning lämnar en upplåsning bara tillbaka kontot till den som har numret. Vad är ert villkor för att låsa upp, och vem äger det beslutet?"])
          ] })
        ])
      }),

      pg("l1", ["The carrier", "Operatören"], [
        "{{person.supplierManager.name}} gets through to the mobile carrier's fraud desk. The CFO's number was moved to a new SIM card after a phone call from someone claiming to be the CFO.\n\nThe caller knew the CFO's personal identity number and the amount on the last phone bill. That was enough for the carrier. Any of your executives' numbers could be moved the same way.",
        "{{person.supplierManager.name}} når mobiloperatörens bedrägeriavdelning. Ekonomichefens nummer flyttades till ett nytt SIM-kort efter ett samtal från någon som påstod sig vara ekonomichefen.\n\nDen som ringde kunde ekonomichefens personnummer och beloppet på den senaste telefonräkningen. Det räckte för operatören. Vilken som helst av era chefers nummer kan flyttas på samma sätt."
      ], {
        long: true,
        skipTo: "c3",
        choice: ask(["What do you ask the carrier for?", "Vad begär ni av operatören?"], ["Gets every executive number locked against porting now.", "Får varje chefsnummer låst mot flytt nu."], [
          opt(["A port-out lock and PIN on every executive number today", "Spärr mot flytt och PIN-kod på varje chefsnummer i dag"], "c3", ["Closes the method for the rest of the team.", "Stänger metoden för resten av ledningen."], { set: "portLock", pushback: [
            pb(["The lock has the same key", "Spärren har samma nyckel"], ["The fraud desk admits that a port lock can be lifted by calling in and passing an identity check, the same kind of check that just failed. A lock guarded by a personal identity number may stop nothing. What exactly are you asking them to guarantee?", "Bedrägeriavdelningen medger att en flyttspärr kan hävas genom att ringa in och klara en identitetskontroll, samma sorts kontroll som just misslyckades. En spärr som skyddas av ett personnummer kanske inte stoppar något. Vad är det egentligen ni ber dem garantera?"]),
            pb(["Who knows the PINs?", "Vem känner till pinkoderna?"], ["The carrier wants each executive to choose a PIN by phone today. Two are travelling and one is on leave. Do you set PINs on their behalf, and if so, who in the company then knows them?", "Operatören vill att varje chef väljer en pinkod per telefon i dag. Två är på resa och en är ledig. Väljer ni pinkoder åt dem, och vem i företaget känner i så fall till dem?"]),
            pb(["Who makes the list?", "Vem kommer med på listan?"], ["The list grows quickly: executives, their assistants, treasury, the IT administrators. The carrier says it can only handle about ten numbers today. Who makes the cut, and who explains to the rest why they did not?", "Listan växer snabbt: chefer, deras assistenter, finansavdelningen, IT-administratörerna. Operatören säger att den bara hinner med ett tiotal nummer i dag. Vem kommer med, och vem förklarar för de andra varför de inte gjorde det?"])
          ] }),
          opt(["A formal complaint after the incident", "Ett formellt klagomål efter incidenten"], "c3", ["Fair, and too late to help today.", "Rimligt, och för sent för att hjälpa i dag."], { pushback: [
            pb(["Open for everyone else", "Öppet för alla andra"], ["The carrier has just told you the same method works on any of your executives' numbers. A complaint next month changes nothing today. Who tells the CEO that their number stays unprotected because you chose to complain later?", "Operatören har just sagt att samma metod fungerar på vilken av era chefers nummer som helst. Ett klagomål nästa månad ändrar ingenting i dag. Vem säger till vd att hens nummer förblir oskyddat för att ni valde att klaga senare?"]),
            pb(["The recording disappears", "Inspelningen försvinner"], ["The fraud desk mentions that call recordings are kept only for a short time. Without a request now, the recording of the impostor's call may be deleted before your complaint arrives. Do you still wait?", "Bedrägeriavdelningen nämner att samtalsinspelningar bara sparas en kort tid. Utan en begäran nu kan inspelningen av bedragarens samtal vara raderad innan ert klagomål kommer fram. Väntar ni ändå?"]),
            pb(["Leverage is now", "Läget är nu"], ["{{person.supplierManager.name}} argues that the carrier is embarrassed and eager to help today, and that this willingness fades once things calm down. Waiting trades leverage for politeness. What do you gain by waiting?", "{{person.supplierManager.name}} menar att operatören är generad och angelägen om att hjälpa till i dag, och att viljan försvinner när det lugnat sig. Att vänta byter förhandlingsläge mot artighet. Vad vinner ni på att vänta?"])
          ] })
        ])
      }),

      pg("c3", ["The payment", "Betalningen"], [
        "Treasury checks the bank account and finds it: an urgent payment of {{num.transfer|currency}} to an account abroad, approved forty minutes ago with a code sent to the CFO's number.\n\nThe payment has already left. The bank's ability to recall money shrinks with every hour, because criminals move it on quickly.",
        "Finansavdelningen kontrollerar bankkontot och hittar den: en brådskande betalning på {{num.transfer|currency}} till ett konto utomlands, godkänd för fyrtio minuter sedan med en kod som skickades till ekonomichefens nummer.\n\nBetalningen har redan gått iväg. Bankens möjlighet att återkalla pengar minskar för varje timme, eftersom kriminella flyttar dem vidare snabbt."
      ], {
        variants: [vr("paymentsFrozen", [
          "Treasury finds an urgent payment of {{num.transfer|currency}} to an account abroad, approved with a code sent to the CFO's number.\n\nBecause you froze payments with the bank in the first minutes, it never left: the bank is holding it and wants to know what to do. The attacker does not know yet that it failed.",
          "Finansavdelningen hittar en brådskande betalning på {{num.transfer|currency}} till ett konto utomlands, godkänd med en kod som skickades till ekonomichefens nummer.\n\nEftersom ni frös betalningarna hos banken under de första minuterna gick den aldrig iväg: banken håller den och vill veta vad den ska göra. Angriparen vet ännu inte att det misslyckades."
        ], ["Because you froze payments first, the money hasn't left yet.", "Eftersom ni frös betalningarna först har pengarna inte lämnat banken ännu."])],
        chart: { id: "b9-money", type: "kpi", title: L(["The payment", "Betalningen"]), data: kpi([
          { id: "k1", label: ["Amount", "Belopp"], value: (v) => v.transfer, format: "currency", tone: "danger" },
          { id: "k2", label: ["Minutes since approval", "Minuter sedan attest"], value: 40, tone: "warn" }
        ]) },
        discuss: [q("Who at the bank can recall a payment, and how fast?", "Vem på banken kan återkalla en betalning, och hur snabbt?", ["cfo"])],
        choice: ask(["What do you do about the payment?", "Vad gör ni med betalningen?"], ["Starts a recall immediately; hours decide whether money comes back.", "Startar en återkallelse omedelbart; timmar avgör om pengarna kommer tillbaka."], [
          opt(["Ask the bank to recall it now", "Be banken återkalla den nu"], "c4", ["The best chance of getting it back.", "Den bästa chansen att få tillbaka pengarna."], { set: "recallStarted", pushback: [
            pb(["Are you sure it's fraud?", "Är ni säkra på att det är bedrägeri?"], ["The bank asks you to confirm in writing that the payment is fraudulent, and warns that recalling a genuine supplier payment damages the relationship. Nobody has yet checked whether anyone in finance expected it. Do you sign now, on what you know?", "Banken ber er bekräfta skriftligt att betalningen är bedräglig, och varnar för att en återkallad äkta leverantörsbetalning skadar relationen. Ingen har ännu kollat om någon på ekonomi väntade sig den. Skriver ni under nu, på det ni vet?"]),
            pb(["Who signs the request?", "Vem skriver under begäran?"], ["The bank needs the request from someone with signing rights. The obvious signatory is the CFO, whose credentials are exactly what was misused. Who signs, and how does the bank know it is really them?", "Banken behöver begäran från någon med teckningsrätt. Den självklara är ekonomichefen, vars inloggning är just det som missbrukats. Vem skriver under, och hur vet banken att det verkligen är den personen?"]),
            pb(["A request, not a return", "En begäran, inte en återbetalning"], ["The bank explains that a recall is a request to the receiving bank, not a guarantee, and that an answer may take days. Treasury asks whether to book the amount as lost. What do you tell them, and the CEO, today?", "Banken förklarar att en återkallelse är en begäran till mottagarbanken, inte en garanti, och att svaret kan dröja flera dagar. Finansavdelningen frågar om beloppet ska bokas som förlorat. Vad säger ni till dem, och till vd, i dag?"])
          ] }),
          opt(["Investigate internally first", "Utred internt först"], "c4", ["The money moves on while you investigate.", "Pengarna flyttas vidare medan ni utreder."], { pushback: [
            pb(["The hours are running", "Timmarna går"], ["The bank's fraud desk says that in cases like this money is usually moved on within hours. A proper internal investigation needs at least a day. What do you hope to learn that is worth that time?", "Bankens bedrägeriavdelning säger att pengar i sådana här fall oftast flyttas vidare inom några timmar. En ordentlig intern utredning behöver minst en dag. Vad hoppas ni få veta som är värt den tiden?"]),
            pb(["Treasury wants it in writing", "Finans vill ha det skriftligt"], ["The head of treasury thinks the payment is obviously fraudulent and that every hour lowers the chance of getting it back. They want it in writing that you chose to investigate first. Will you sign that?", "Finanschefen tycker att betalningen uppenbart är bedräglig och att varje timme minskar chansen att få tillbaka den. Hen vill ha skriftligt att ni valde att utreda först. Skriver ni under på det?"]),
            pb(["Investigating in their inbox", "Utreda i deras inkorg"], ["Much of the investigation would run through the CFO's email and phone, channels the attacker has had access to today. Anything said there may be read. How do you investigate without telling them what you know?", "Mycket av utredningen skulle gå via ekonomichefens e-post och telefon, kanaler som angriparen har haft åtkomst till i dag. Allt som sägs där kan läsas. Hur utreder ni utan att avslöja vad ni vet?"])
          ] }),
          opt(["Call the receiving bank yourselves", "Ring den mottagande banken själva"], "c4", ["They will only act on a request from your bank.", "De agerar bara på begäran från er bank."], { pushback: [
            pb(["Half an hour on hold", "En halvtimme i kö"], ["After half an hour, the receiving bank's switchboard says it cannot discuss any account with a third party and asks for a request from your own bank. You have used time you did not have. Do you keep trying, or go back to your own bank now?", "Efter en halvtimme säger mottagarbankens växel att den inte kan diskutera konton med utomstående och vill ha en begäran från er egen bank. Ni har använt tid ni inte hade. Fortsätter ni försöka, eller går ni tillbaka till er egen bank nu?"]),
            pb(["Whose number is it?", "Vems nummer är det?"], ["The phone number you are calling for the receiving bank came from a quick web search. Attackers this well prepared could easily have planted a fake one. How do you know who you are actually talking to?", "Telefonnumret ni ringer till mottagarbanken kom från en snabb sökning på nätet. Så här förberedda angripare skulle lätt kunna ha lagt ut ett falskt. Hur vet ni vem ni egentligen pratar med?"]),
            pb(["Your own bank objects", "Er egen bank invänder"], ["Your bank's fraud team hears you contacted the receiving bank directly and warns that parallel contacts confuse the formal process. They ask you to stop. Do you hand it back to them entirely and accept their pace?", "Er banks bedrägeriteam får höra att ni kontaktat mottagarbanken direkt och varnar för att parallella kontakter rör till den formella processen. De ber er sluta. Lämnar ni tillbaka allt till dem och accepterar deras takt?"])
          ] })
        ])
      }),

      pg("c4", ["Others", "Fler"], [
        "Within the hour, {{num.execs}} more executives report the same thing: their phones suddenly show “No SIM”.\n\nThis is not one unlucky person. Someone is working through your management team, one number at a time, and each of those numbers unlocks email, banking or approvals.",
        "Inom en timme rapporterar ytterligare {{num.execs}} chefer samma sak: deras telefoner visar plötsligt ”Inget SIM”.\n\nDet här är inte en person som haft otur. Någon arbetar sig igenom er ledningsgrupp, ett nummer i taget, och vart och ett av numren låser upp e-post, bank eller attester."
      ], {
        choice: ask(["How do you treat it?", "Hur hanterar ni det?"], ["Recognises a campaign and protects every target at once.", "Känner igen en kampanj och skyddar alla måltavlor på en gång."], [
          opt(["A campaign: carrier fraud team for all, remove their SMS sign-in", "En kampanj: operatörens bedrägeriteam för alla, ta bort deras sms-inloggning"], "l2", ["Matches the attacker's scale.", "Motsvarar angriparens omfattning."], { set: "smsRemoved", pushback: [
            pb(["Executives push back", "Cheferna protesterar"], ["Two executives refuse to give up text-message sign-in today: they are travelling and have no other way in. One calls it an IT overreaction. Do you force it and accept they are cut off until they return?", "Två chefer vägrar släppa sms-inloggningen i dag: de är på resa och har inget annat sätt att logga in. En kallar det en överreaktion från IT. Tvingar ni igenom det och accepterar att de är avstängda tills de är tillbaka?"]),
            pb(["Verify without a phone", "Styrka identitet utan telefon"], ["The carrier's fraud team will help, but each executive must call in and verify their identity personally. Several of them have no working number to call from. How do you verify people whose numbers are already gone?", "Operatörens bedrägeriteam hjälper till, men varje chef måste ringa in och styrka sin identitet själv. Flera av dem har inget fungerande nummer att ringa från. Hur styrker ni identiteten för personer vars nummer redan är borta?"]),
            pb(["Where does it end?", "Var går gränsen?"], ["If someone is working through a list, the next names may not be executives at all: assistants, treasury staff, IT administrators. Your response covers only those who have reported. Where do you draw the line, and on what basis?", "Om någon arbetar sig igenom en lista är nästa namn kanske inte chefer alls: assistenter, finanspersonal, IT-administratörer. Er åtgärd täcker bara dem som hört av sig. Var drar ni gränsen, och på vilken grund?"])
          ] }),
          opt(["Handle each executive as they report it", "Hantera varje chef när de hör av sig"], "l2", ["Always one step behind.", "Alltid ett steg efter."], { pushback: [
            pb(["Another one", "En till"], ["While you work on the first executive, another reports “No SIM”. Each case takes an hour of the same steps, and your best people are tied up. How many more do you handle one at a time before you change approach?", "Medan ni arbetar med den första chefen rapporterar ännu en ”Inget SIM”. Varje fall tar en timme med samma steg, och era bästa personer är uppbundna. Hur många fler hanterar ni ett i taget innan ni byter arbetssätt?"]),
            pb(["Not everyone notices", "Alla märker det inte"], ["Not everyone looks at their phone during a long workshop or a flight. An executive could be without their number for hours and never report it. Who is checking on the ones who have not called in?", "Alla tittar inte på telefonen under en lång workshop eller en flygresa. En chef kan vara utan sitt nummer i timmar utan att rapportera det. Vem kollar de som inte har hört av sig?"]),
            pb(["The CEO asks: am I next?", "Vd frågar: är det jag nu?"], ["The CEO has not reported anything and asks whether their own number is protected. Under your approach the honest answer is no, not until it is taken. What do you tell the CEO?", "Vd har inte rapporterat något och frågar om hens eget nummer är skyddat. Med ert arbetssätt är det ärliga svaret nej, inte förrän det har tagits. Vad säger ni till vd?"])
          ] }),
          opt(["Give every executive a new number today", "Ge varje chef ett nytt nummer i dag"], "c4b", ["Clean break, messy logistics.", "Ett rent snitt, rörig logistik."], { pushback: [
            pb(["The old numbers still work", "De gamla numren fungerar fortfarande"], ["New numbers help nothing while accounts still send codes to the old ones, and the carrier says closing the old numbers takes a day. Whoever holds them keeps receiving codes until then. What do the old numbers still unlock tonight?", "Nya nummer hjälper inte så länge kontona fortfarande skickar koder till de gamla, och operatören säger att det tar ett dygn att stänga dem. Den som har dem får koder fram till dess. Vad låser de gamla numren fortfarande upp i kväll?"]),
            pb(["Executives on the road", "Chefer på resande fot"], ["One executive is abroad and another is at a customer site, and new SIM cards must be collected in person. Until they arrive, both are unreachable by phone. Do you cut them off, or make an exception that leaves them on the old numbers?", "En chef är utomlands och en annan är hos en kund, och de nya SIM-korten måste hämtas personligen. Tills de kommer fram går ingen av dem att nå per telefon. Stänger ni av dem, eller gör ni ett undantag som låter dem ha kvar de gamla numren?"]),
            pb(["Same carrier, same check", "Samma operatör, samma kontroll"], ["The new numbers are with the same carrier and protected by the same identity check that just failed. Attackers who found the old numbers can find these too. Apart from the digits, what have you actually changed?", "De nya numren finns hos samma operatör och skyddas av samma identitetskontroll som just misslyckades. Angripare som hittade de gamla numren kan hitta de nya också. Vad har ni egentligen ändrat, förutom siffrorna?"])
          ] })
        ])
      }),

      pg("c4b", ["New numbers", "Nya nummer"], [
        "Every executive gets a new number by the afternoon. The SIM problem is solved, and a new one appears.\n\nBanks, suppliers and the board have the old numbers. When the bank wants to verify a payment by calling back, it reaches the attacker. When the chair calls the CEO, nobody answers.",
        "Alla chefer får nya nummer under eftermiddagen. SIM-problemet är löst, och ett nytt dyker upp.\n\nBanker, leverantörer och styrelsen har de gamla numren. När banken vill verifiera en betalning genom att ringa tillbaka når den angriparen. När ordföranden ringer vd svarar ingen."
      ], {
        choice: ask(["How do you tell people?", "Hur berättar ni det?"], ["Registers new numbers through verified channels, not by email.", "Registrerar de nya numren via verifierade kanaler, inte via e-post."], [
          opt(["Register new numbers with banks through verified channels", "Registrera de nya numren hos bankerna via verifierade kanaler"], "l2", ["Slow and safe.", "Långsamt och säkert."], { set: "smsRemoved", pushback: [
            pb(["Verified how?", "Verifierat hur?"], ["The bank's procedure for changing a contact number is to call the number already on file to confirm. That number is no longer yours. How do you prove to the bank that the request really comes from you?", "Bankens rutin för att byta kontaktnummer är att ringa det nummer som redan finns registrerat och bekräfta. Det numret är inte längre ert. Hur bevisar ni för banken att begäran verkligen kommer från er?"]),
            pb(["Days, not hours", "Dagar, inte timmar"], ["Every bank, supplier and board member needs a separate verified update, and the bank alone says it needs several working days. Until then, call-backs go to the old numbers. What happens to this week's payments?", "Varje bank, leverantör och styrelseledamot behöver en egen verifierad uppdatering, och bara banken säger att den behöver flera arbetsdagar. Fram till dess går återuppringningar till de gamla numren. Vad händer med veckans betalningar?"]),
            pb(["The chair is annoyed", "Ordföranden är irriterad"], ["The chair could not reach the CEO and is irritated to learn the number changed without anyone saying so. The verified route is slow, and the board wants the new numbers now. Do you make an exception for the board, and then for whom else?", "Ordföranden kom inte fram till vd och är irriterad över att numret bytts utan att någon sagt något. Den verifierade vägen är långsam, och styrelsen vill ha de nya numren nu. Gör ni ett undantag för styrelsen, och för vilka mer i så fall?"])
          ] }),
          opt(["Email everyone the new numbers", "Mejla alla de nya numren"], "l2", ["The attacker reads the CFO's email.", "Angriparen läser ekonomichefens e-post."], { pushback: [
            pb(["A reply from the CFO", "Ett svar från ekonomichefen"], ["Minutes after the email goes out, a reply appears from what looks like the CFO's address, asking a supplier to “also update the bank details”. You used a channel the attacker has had access to. How do you tell people which message to trust?", "Några minuter efter utskicket kommer ett svar från något som ser ut som ekonomichefens adress, där en leverantör ombeds att ”även uppdatera bankuppgifterna”. Ni använde en kanal som angriparen har haft åtkomst till. Hur ska folk veta vilket meddelande de kan lita på?"]),
            pb(["The bank won't accept it", "Banken godtar det inte"], ["The bank replies that it will not change a contact number on the strength of an email, for exactly this reason. Your fastest channel does nothing for the call-backs that matter most. How do you register the numbers with the bank now?", "Banken svarar att den inte byter kontaktnummer på grundval av ett mejl, av just det skälet. Er snabbaste kanal hjälper inte för de återuppringningar som betyder mest. Hur registrerar ni numren hos banken nu?"]),
            pb(["A second email", "Ett andra mejl"], ["Suppliers now expect an email announcing new executive numbers. A second one, with different numbers and the same tone, would look just as believable. How will anyone tell your email from a copy?", "Leverantörerna väntar sig nu ett mejl om nya nummer till cheferna. Ett andra, med andra nummer och samma ton, skulle se lika trovärdigt ut. Hur ska någon skilja ert mejl från en kopia?"])
          ] })
        ])
      }),

      pg("l2", ["How they knew", "Hur de visste"], [
        "How did the attackers know so much? {{person.socLead.name}} finds the answer online.\n\nThe executives' personal identity numbers, home addresses and phone contracts appear in a data broker's database, and in an old breach from another company. Anyone willing to pay or search could have built the same list.",
        "Hur kunde angriparna veta så mycket? {{person.socLead.name}} hittar svaret på nätet.\n\nChefernas personnummer, hemadresser och telefonabonnemang finns i en uppgiftsmäklares databas och i ett gammalt dataintrång hos ett annat företag. Vem som helst som var villig att betala eller leta kunde ha byggt samma lista."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["What do you do about exposure?", "Vad gör ni åt exponeringen?"], ["Reduces what attackers can learn and assumes the rest is known.", "Minskar vad angripare kan få veta och utgår från att resten redan är känt."], [
          opt(["Brief executives and reduce public information", "Informera cheferna och minska den offentliga informationen"], "c5", ["Helps a little; the rest must be designed around.", "Hjälper lite; resten måste hanteras med teknik."], { pushback: [
            pb(["It can't be unpublished", "Det går inte att avpublicera"], ["The data broker will remove entries on request, but the old breach data has been copied across many sites. Removal takes weeks and will never be complete. Is the effort worth it when the information is already out?", "Uppgiftsmäklaren tar bort uppgifter på begäran, men den gamla intrångsdatan är kopierad till många sajter. Borttagningen tar veckor och blir aldrig fullständig. Är det värt mödan när uppgifterna redan är ute?"]),
            pb(["Private lives", "Privatlivet"], ["Some executives object: their addresses are public through their own companies and board seats, and they do not want the security team going through their private lives. How far into personal data are you willing to push?", "Några chefer invänder: deras adresser är offentliga via egna bolag och styrelseuppdrag, och de vill inte att säkerhetsteamet går igenom deras privatliv. Hur långt in i privata uppgifter är ni beredda att gå?"]),
            pb(["False comfort", "Falsk trygghet"], ["The briefing tells executives the problem is being handled. But personal identity numbers cannot be changed, and the carrier still accepts them as proof. Are you treating a symptom and calling it a fix?", "Genomgången säger till cheferna att problemet hanteras. Men personnummer går inte att byta, och operatören godtar dem fortfarande som bevis. Behandlar ni ett symtom och kallar det en lösning?"])
          ] }),
          opt(["Nothing to be done about public data", "Inget att göra åt offentliga uppgifter"], "c5", ["True, and a reason to stop trusting knowledge as proof of identity.", "Sant, och ett skäl att sluta lita på kunskap som bevis på identitet."], { pushback: [
            pb(["The CEO disagrees", "Vd håller inte med"], ["The CEO hears that security “can do nothing” about the exposure and finds it unacceptable: the family's home address is on that list. Doing nothing is also a message to the people on it. How do you explain it to them?", "Vd får höra att säkerhet ”inte kan göra något” åt exponeringen och tycker att det är oacceptabelt: familjens hemadress finns på listan. Att inte göra något är också ett besked till dem som står där. Hur förklarar ni det för dem?"]),
            pb(["The carrier still trusts it", "Operatören litar fortfarande på det"], ["If nothing can be done about the data, then the carrier must stop treating it as proof of identity, and today it still does. Who takes that up with the carrier? And is “nothing to be done” really your answer?", "Om inget går att göra åt uppgifterna måste operatören sluta använda dem som bevis på identitet, och i dag gör den det fortfarande. Vem tar upp det med operatören? Och är ”inget att göra” verkligen ert svar?"]),
            pb(["Not only executives", "Inte bara chefer"], ["The same list includes staff in finance and IT, not just the management team. Doing nothing means they remain easy targets for the same method and do not even know it. Do you tell them, or leave them unaware?", "Samma lista innehåller personal inom ekonomi och IT, inte bara ledningsgruppen. Att inte göra något betyder att de förblir lätta mål för samma metod utan att ens veta om det. Berättar ni för dem, eller låter ni dem vara ovetande?"])
          ] })
        ])
      }),

      pg("c5", ["Police and bank", "Polis och bank"], [
        "{{person.legal.name}} raises reporting. A police report and a formal fraud report to the bank are usually needed for any attempt to recover the money, and for the insurance claim.\n\nSome in management worry that a police report will make the incident public, and that the company will look careless.",
        "{{person.legal.name}} tar upp frågan om anmälan. En polisanmälan och en formell bedrägerianmälan till banken krävs oftast för varje försök att få tillbaka pengarna, och för försäkringsanspråket.\n\nEn del i ledningen oroar sig för att en polisanmälan gör incidenten offentlig, och att företaget kommer att framstå som slarvigt."
      ], {
        choice: ask(["Do you report?", "Anmäler ni?"], ["Reports promptly; recalls and insurance depend on it.", "Anmäler snabbt; återkallelser och försäkring hänger på det."], [
          opt(["Report to both today", "Anmäl till båda i dag"], "l3", ["Required for recall and insurance.", "Krävs för återkallelse och försäkring."], { set: "reported", pushback: [
            pb(["The worst moment", "Sämsta tänkbara tillfälle"], ["A board member points out that the interim report is only weeks away, and a police report could surface just before it. Filing today means accepting that risk. Do you still file today, or wait until after the report?", "En styrelseledamot påpekar att delårsrapporten bara är några veckor bort, och att en polisanmälan kan bli känd strax innan. Att anmäla i dag betyder att ta den risken. Anmäler ni ändå i dag, eller väntar ni till efter rapporten?"]),
            pb(["Who fronts the report?", "Vem står för anmälan?"], ["The police want a named contact who can describe what happened. The obvious choice is the CFO: the victim, and also the person whose accounts were used. Is the CFO the right person to front this, or does that create a problem of its own?", "Polisen vill ha en namngiven kontaktperson som kan beskriva vad som hänt. Det självklara valet är ekonomichefen: offret, men också den vars konton användes. Är ekonomichefen rätt person att stå för detta, eller skapar det ett eget problem?"]),
            pb(["Paperwork or containment", "Pappersarbete eller begränsning"], ["Both reports need logs, a timeline and amounts, and the people who can produce them are still containing the attack. Writing reports today means pulling them off that work. Which matters more this afternoon?", "Båda anmälningarna kräver loggar, en tidslinje och belopp, och de som kan ta fram dem håller fortfarande på att begränsa angreppet. Att skriva anmälningar i dag betyder att dra dem från det arbetet. Vad är viktigast i eftermiddag?"])
          ] }),
          opt(["Avoid publicity; handle it internally", "Undvik publicitet; hantera det internt"], "l3", ["Recalls and claims will stall.", "Återkallelser och anspråk kommer att stanna av."], { pushback: [
            pb(["The policy says otherwise", "Villkoren säger annat"], ["{{person.legal.name}} reads the insurance terms aloud: payment fraud claims normally require a police report. Choosing silence today may mean carrying the loss yourselves. Who accepts that on behalf of the company?", "{{person.legal.name}} läser upp försäkringsvillkoren: anspråk vid betalningsbedrägeri kräver normalt en polisanmälan. Att välja tystnad i dag kan betyda att ni själva får bära förlusten. Vem tar det beslutet för företagets räkning?"]),
            pb(["The bank's hands are tied", "Bankens händer är bundna"], ["The bank says it can only push the case with other banks if it has a formal fraud report from you. Without one, it can do little more. Are you willing to lower the chance of getting money back to avoid a headline?", "Banken säger att den bara kan driva ärendet mot andra banker om den får en formell bedrägerianmälan från er. Utan den kan den inte göra mycket mer. Är ni beredda att minska chansen att få tillbaka pengar för att slippa en rubrik?"]),
            pb(["Others already know", "Andra vet redan"], ["The carrier's fraud desk, your bank and several executives' families already know something happened. This is no longer a secret you control. Is “internally” protecting the company, or just delaying the moment it gets out?", "Operatörens bedrägeriavdelning, er bank och flera chefers familjer vet redan att något har hänt. Det är inte längre en hemlighet ni styr över. Skyddar ”internt” företaget, eller skjuter det bara upp ögonblicket då det kommer ut?"])
          ] }),
          opt(["Lift the payment freeze: suppliers and payroll are blocked, and the bank says the fraud is contained", "Häv betalningsstoppet: leverantörer och löner är blockerade, och banken säger att bedrägeriet är under kontroll"], "l3", ["Reverses your first move on the bank's word; the attacker still has the number.", "Upphäver ert första drag på bankens ord; angriparen har fortfarande numret."], { requires: "paymentsFrozen", set: "freezeLifted", effects: { trust: 1 }, pushback: [
            pb(["What has changed?", "Vad har ändrats?"], ["The CFO's number is not back under your control, and you cannot say for certain that text-message codes no longer work anywhere. Lifting the freeze reopens the door the payment went through. What has changed since you froze it, apart from the pressure?", "Ekonomichefens nummer är inte tillbaka under er kontroll, och ni kan inte säkert säga att sms-koder inte längre fungerar någonstans. Att häva stoppet öppnar dörren som betalningen gick igenom. Vad har ändrats sedan ni frös betalningarna, förutom trycket?"]),
            pb(["Contained where?", "Under kontroll var?"], ["The bank says the fraud is “contained”, but it can only speak for its own systems. It cannot vouch for your mailboxes, your approvers or your phones. Are you lifting the freeze on the bank's assessment of your company?", "Banken säger att bedrägeriet är ”under kontroll”, men den kan bara tala för sina egna system. Den kan inte gå i god för era brevlådor, era attestanter eller era telefoner. Häver ni stoppet på bankens bedömning av ert företag?"]),
            pb(["A narrower option", "Ett smalare alternativ"], ["Treasury proposes another way: release only payroll and a short list of known suppliers, each confirmed by calling a number you already trust. It is slower, but much narrower. Why lift everything at once?", "Finansavdelningen föreslår en annan väg: släpp bara lönerna och en kort lista kända leverantörer, var och en bekräftad genom samtal till ett nummer ni redan litar på. Det är långsammare, men mycket smalare. Varför häva allt på en gång?"])
          ] })
        ])
      }),

      pg("l3", ["A journalist calls", "En journalist ringer"], [
        "A financial reporter calls the press office. They have heard from a source at the carrier that executives at {{org.name}} were targeted.\n\nTheir question is simple and will be printed either way: is the company's money safe?",
        "En ekonomireporter ringer pressavdelningen. Hen har hört från en källa hos operatören att chefer på {{org.name}} har varit måltavlor.\n\nFrågan är enkel och kommer att tryckas oavsett: är företagets pengar säkra?"
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["What do you say?", "Vad säger ni?"], ["Gives a short, factual statement without operational detail.", "Ger ett kort, sakligt uttalande utan operativa detaljer."], [
          opt(["A short factual statement", "Ett kort sakligt uttalande"], "c6", ["Ends the speculation.", "Avslutar spekulationerna."], { pushback: [
            pb(["Is the money safe?", "Är pengarna säkra?"], ["The draft says the company's money is “safe”. {{person.legal.name}} points out that a fraudulent payment was approved and the matter is not closed. Can you say anything factual that is also reassuring, or do you say less?", "Utkastet säger att företagets pengar är ”säkra”. {{person.legal.name}} påpekar att en bedräglig betalning har attesterats och att ärendet inte är avslutat. Kan ni säga något sakligt som också är lugnande, eller säger ni mindre?"]),
            pb(["The bank wants to see it", "Banken vill se det"], ["The bank asks to read the statement before it goes out, because naming the method could affect other customers and its own work on the case. Waiting for its approval may miss the reporter's deadline. Do you wait?", "Banken vill läsa uttalandet innan det går ut, eftersom en beskrivning av metoden kan påverka andra kunder och bankens eget arbete med ärendet. Att vänta på deras godkännande kan missa reporterns deadline. Väntar ni?"]),
            pb(["Advertising the method", "Att göra reklam för metoden"], ["Confirming that executives were hit through their phone numbers tells other criminals the method works here. The security team wants the method left out entirely. Is a statement that vague still factual?", "Att bekräfta att chefer drabbats via sina telefonnummer berättar för andra kriminella att metoden fungerar här. Säkerhetsteamet vill att metoden inte nämns alls. Är ett så vagt uttalande fortfarande sakligt?"])
          ] }),
          opt(["No comment", "Ingen kommentar"], "c6", ["Invites speculation.", "Bjuder in till spekulationer."], { pushback: [
            pb(["It runs tonight", "Det publiceras i kväll"], ["The reporter says the story runs tonight with or without you: executives targeted, company declines to comment. Staff will read it before they hear anything from you. Is silence still the safer choice?", "Reportern säger att artikeln publiceras i kväll med eller utan er: chefer drabbade, företaget avböjer att kommentera. Personalen läser den innan de hört något från er. Är tystnad fortfarande det säkraste valet?"]),
            pb(["Staff ask about their pay", "Personalen frågar om lönen"], ["Employees have heard about the reporter's questions and ask their managers whether their salaries are safe. “No comment” outside leaves managers with nothing to say inside. What do the managers tell them?", "Medarbetare har hört om reporterns frågor och frågar sina chefer om lönerna är säkra. ”Ingen kommentar” utåt lämnar cheferna utan något att säga inåt. Vad säger cheferna till dem?"]),
            pb(["The carrier's version", "Operatörens version"], ["The reporter's source is at the carrier, and the carrier may well give its own version of events. If you say nothing, theirs becomes the story. Are you willing to let your carrier speak for you?", "Reporterns källa finns hos operatören, och operatören kan mycket väl ge sin egen version. Om ni inte säger något blir deras version berättelsen. Är ni beredda att låta operatören tala för er?"])
          ] })
        ])
      }),

      pg("c6", ["The approvals", "Attesterna"], [
        "The review finds the root problem. Every payment approval in the company relies on a text-message code sent to the approver's phone.\n\nWhoever controls an approver's number controls the company's money. The attackers have just shown how easily a number can be controlled.",
        "Genomgången hittar grundproblemet. Varje betalningsattest i företaget bygger på en sms-kod som skickas till attestantens telefon.\n\nDen som kontrollerar en attestants nummer kontrollerar företagets pengar. Angriparna har just visat hur lätt ett nummer kan kontrolleras."
      ], {
        discuss: [q("What would a safe payment approval look like here?", "Hur skulle en säker betalningsattest se ut här?", ["cfo", "ciso"])],
        choice: ask(["What do you change?", "Vad ändrar ni?"], ["Removes SMS from approvals and adds a call-back to a known number for unusual payments.", "Tar bort sms från attester och lägger till återuppringning till ett känt nummer för ovanliga betalningar."], [
          opt(["App or hardware approvals, plus call-back for unusual payments", "Attest med app eller hårdvara, plus återuppringning för ovanliga betalningar"], "c7", ["Fixes the method, not just this case.", "Rättar metoden, inte bara det här fallet."], { pushback: [
            pb(["Call back to which number?", "Ringa tillbaka till vilket nummer?"], ["A call-back to a known number assumes you know which numbers are still good. Several numbers in the management team have been moved, changed or put in doubt in recent days. Which numbers will treasury trust for call-backs this week?", "En återuppringning till ett känt nummer förutsätter att ni vet vilka nummer som fortfarande är pålitliga. Flera nummer i ledningsgruppen har flyttats, bytts eller ifrågasatts de senaste dagarna. Vilka nummer ska finansavdelningen lita på för återuppringning den här veckan?"]),
            pb(["Weeks to roll out", "Veckor att införa"], ["App or hardware approvals take weeks to roll out, and some approvers travel without laptops. Until then, payments either wait or keep using text-message codes. Which do you choose for this month's supplier payments?", "Attest med app eller hårdvara tar veckor att införa, och vissa attestanter reser utan dator. Fram till dess får betalningarna antingen vänta eller fortsätta med sms-koder. Vilket väljer ni för månadens leverantörsbetalningar?"]),
            pb(["The bank's own platform", "Bankens egen plattform"], ["The bank's corporate platform only supports text-message codes or its own card readers, and the readers take two weeks to arrive. Do you accept SMS approvals until then, or stop paying suppliers?", "Bankens företagsplattform stöder bara sms-koder eller bankens egna kortläsare, och läsarna tar två veckor att leverera. Godtar ni sms-attester fram till dess, eller slutar ni betala leverantörerna?"])
          ] }),
          opt(["Add a second SMS approver", "Lägg till en andra sms-attestant"], "c7", ["Two phones to swap instead of one.", "Två telefoner att kapa i stället för en."], { pushback: [
            pb(["Two phones, one weakness", "Två telefoner, en svaghet"], ["The second approver's number is with the same carrier, protected by the same identity check that just failed. The attacker only needs to repeat the same phone call. What does a second text message really add?", "Den andra attestantens nummer finns hos samma operatör, skyddat av samma identitetskontroll som just misslyckades. Angriparen behöver bara upprepa samma samtal. Vad tillför egentligen ett andra sms?"]),
            pb(["Twice the workload", "Dubbla arbetsbördan"], ["The obvious second approver is the CFO's deputy, whose number is as easy to find as the CFO's. Treasury asks whether every payment now waits for two busy people. Have you doubled the workload and the targets?", "Den självklara andra attestanten är ekonomichefens ställföreträdare, vars nummer är lika lätt att hitta som ekonomichefens. Finansavdelningen frågar om varje betalning nu ska vänta på två upptagna personer. Har ni fördubblat både arbetsbördan och måltavlorna?"]),
            pb(["Will it survive review?", "Klarar det en granskning?"], ["The auditors and the insurer will both ask what changed after the fraud. “A second SMS” is a change, but one any reviewer will see through. Are you ready to defend it as your answer?", "Revisorerna och försäkringsbolaget kommer båda att fråga vad som ändrades efter bedrägeriet. ”Ett andra sms” är en ändring, men en som varje granskare genomskådar. Är ni beredda att försvara den som ert svar?"])
          ] }),
          opt(["Keep it as it is", "Behåll det som det är"], "c7", ["Same door, same attackers.", "Samma dörr, samma angripare."], { pushback: [
            pb(["The CEO's question", "Vd:s fråga"], ["The CEO asks one thing: if someone takes an approver's number tomorrow, can they pay out money again? The honest answer is yes. Who gives the CEO that answer?", "Vd frågar en sak: om någon tar en attestants nummer i morgon, kan de betala ut pengar igen? Det ärliga svaret är ja. Vem ger vd det svaret?"]),
            pb(["The insurer asks", "Försäkringsbolaget frågar"], ["The insurer asks which controls were changed after the incident. “None” may affect this claim and next year's terms. Are you prepared to write that down?", "Försäkringsbolaget frågar vilka kontroller som ändrades efter incidenten. ”Inga” kan påverka det här anspråket och nästa års villkor. Är ni beredda att skriva det?"]),
            pb(["Treasury refuses", "Finansavdelningen vägrar"], ["Treasury staff say they will no longer approve large payments with text-message codes alone without written instructions. Do you order them to keep using a method you now know is broken?", "Personalen på finansavdelningen säger att de inte längre attesterar stora betalningar med bara sms-koder utan skriftliga instruktioner. Beordrar ni dem att fortsätta med en metod ni nu vet är trasig?"])
          ] }),
          opt(["Hire a “recovery agent” who promises to get the money back", "Anlita en ”återvinningsagent” som lovar att få tillbaka pengarna"], "x1", ["Who found whom?", "Vem hittade vem?"], { pushback: [
            pb(["A stranger over your bank", "En främling före er bank"], ["Nobody in the room has worked with this agent or knows anyone who has. Your own bank, already working on the case, has never mentioned them. Why trust a stranger with this rather than the bank?", "Ingen i rummet har arbetat med agenten eller känner någon som har gjort det. Er egen bank, som redan arbetar med ärendet, har aldrig nämnt dem. Varför lita på en främling med det här i stället för på banken?"]),
            pb(["Your bank objects", "Er bank invänder"], ["Your bank's fraud team warns that a third party acting in parallel may disrupt its own efforts, and asks you not to share case details with anyone else. Do you go against the bank that is helping you?", "Er banks bedrägeriteam varnar för att en tredje part som agerar parallellt kan störa bankens eget arbete, och ber er att inte dela uppgifter om ärendet med någon annan. Går ni emot banken som hjälper er?"]),
            pb(["What does it cost?", "Vad kostar det?"], ["{{person.legal.name}} wants to know what the agent charges, to whom, and under what contract. Paying an unknown party days after an unknown party took your money needs an approver. Who signs that?", "{{person.legal.name}} vill veta vad agenten tar betalt, till vem och enligt vilket avtal. Att betala en okänd part några dagar efter att en okänd part tog era pengar kräver en attestant. Vem skriver under på det?"])
          ] })
        ])
      }),

      pg("c7", ["The money", "Pengarna"], [
        "The bank reports back. The receiving account was emptied within an hour of the payment arriving.\n\nThe bank's fraud team has traced the money through three further accounts in two countries. Getting any of it back now depends on how fast other banks act, and on the paperwork you have filed.",
        "Banken återkommer. Mottagarkontot tömdes inom en timme efter att betalningen kom in.\n\nBankens bedrägeriteam har spårat pengarna genom tre konton till i två länder. Om något kan återfås beror nu på hur snabbt andra banker agerar, och på de anmälningar ni har gjort."
      ], {
        variants: [vr("recallStarted", [
          "The bank reports back. Because the recall started within the hour, it reached the money while it was still moving.\n\nFunds were frozen in the second account in the chain: {{num.recoveredPct}} percent of the payment comes back. The rest went further than the bank could follow.",
          "Banken återkommer. Eftersom återkallelsen startade inom en timme nådde den pengarna medan de fortfarande var i rörelse.\n\nMedel frystes på det andra kontot i kedjan: {{num.recoveredPct}} procent av betalningen kommer tillbaka. Resten gick längre än banken kunde följa."
        ])],
        choice: ask(["What about the loss?", "Vad gör ni med förlusten?"], ["Claims under insurance with full documentation.", "Begär ersättning från försäkringen med fullständig dokumentation."], [
          opt(["Insurance claim with the bank's documentation", "Försäkringsanspråk med bankens dokumentation"], "l4", ["The orderly route.", "Den ordnade vägen."], { pushback: [
            pb(["Was SMS good enough?", "Var sms tillräckligt?"], ["The insurer asks whether text-message approvals were considered adequate, and whether anyone had warned against them. Your own review has just named SMS as the root problem. How do you answer without weakening the claim?", "Försäkringsbolaget frågar om sms-attester ansågs tillräckliga, och om någon hade varnat för dem. Er egen genomgång har just pekat ut sms som grundproblemet. Hur svarar ni utan att försvaga anspråket?"]),
            pb(["Who does the paperwork?", "Vem gör pappersarbetet?"], ["The insurer wants timelines, logs, carrier records and bank statements. Treasury and IT are still cleaning up. Who owns the claim, and what gets dropped so they can do it?", "Försäkringsbolaget vill ha tidslinjer, loggar, uppgifter från operatören och kontoutdrag. Finans och IT städar fortfarande upp. Vem äger anspråket, och vad får stå tillbaka för att de ska hinna?"]),
            pb(["A witness against a supplier", "Vittne mot en leverantör"], ["If the insurer pays, it may pursue the carrier that moved the number, and want your full cooperation. You still depend on that carrier every day. Are you ready to testify against a supplier you still need?", "Om försäkringsbolaget betalar kan det gå vidare mot operatören som flyttade numret, och vilja ha ert fulla samarbete. Ni är fortfarande beroende av operatören varje dag. Är ni beredda att vittna mot en leverantör ni fortfarande behöver?"])
          ] }),
          opt(["Pursue the carrier for damages", "Kräv operatören på skadestånd"], "l4", ["Possible, and slow.", "Möjligt, och långsamt."], { pushback: [
            pb(["Capped liability", "Begränsat ansvar"], ["The carrier contract limits liability to a few months of fees, and your lawyers say anything beyond that would take years to win. Is this about money, or about making a point?", "Operatörsavtalet begränsar ansvaret till några månaders avgifter, och era jurister säger att allt utöver det skulle ta år att vinna. Handlar det här om pengar, eller om att markera?"]),
            pb(["You still need them", "Ni behöver dem fortfarande"], ["You need the carrier's help every week: locks, recordings, investigations. Its fraud team becomes noticeably more careful once lawyers are involved. Can you sue a supplier you depend on this week?", "Ni behöver operatörens hjälp varje vecka: spärrar, inspelningar, utredningar. Bedrägeriteamet blir märkbart försiktigare när jurister kopplas in. Kan ni stämma en leverantör ni är beroende av den här veckan?"]),
            pb(["Your controls on trial", "Era kontroller prövas"], ["The carrier's lawyers will argue that your payments rested on text-message codes, which you chose. A case would put your own controls in front of a court. Are you ready for that?", "Operatörens jurister kommer att hävda att era betalningar vilade på sms-koder, som ni själva valde. En process skulle lägga fram era egna kontroller inför domstol. Är ni redo för det?"])
          ] })
        ])
      }),

      pg("l4", ["Everyone else", "Alla andra"], [
        "The review widens. Most staff, not only executives, also sign in with text-message codes, including the people in finance and IT who have the most access.\n\nThe attackers now know the method works at {{org.name}}, and they know your phone numbers are easy to find.",
        "Genomgången vidgas. De flesta anställda, inte bara cheferna, loggar också in med sms-koder, även personerna inom ekonomi och IT som har mest åtkomst.\n\nAngriparna vet nu att metoden fungerar på {{org.name}}, och de vet att era telefonnummer är lätta att hitta."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["How far do you go?", "Hur långt går ni?"], ["Moves everyone to phishing-resistant sign-in over time, starting with high-risk roles.", "Flyttar alla till nätfiskeresistent inloggning över tid, med början i högriskroller."], [
          opt(["Everyone, starting with finance and IT", "Alla, med början i ekonomi och IT"], "c8", ["A programme, not a patch.", "Ett program, inte en lapp."], { pushback: [
            pb(["The helpdesk drowns", "Supporten drunknar"], ["The helpdesk expects weeks of enrolments, lost devices and lockouts, with no extra staff. Every lockout will be blamed on security. Who pays for the extra support, and what else slips?", "Supporten räknar med veckor av registreringar, borttappade enheter och utelåsningar, utan extra personal. Varje utelåsning kommer att skyllas på säkerhet. Vem betalar för extra support, och vad annat får vänta?"]),
            pb(["Not on my phone", "Inte på min telefon"], ["Many staff use personal phones and refuse to install a work app on them; shift workers have no work phone at all. Hardware keys for everyone cost real money. Do you buy keys for all, or allow exceptions?", "Många använder privata telefoner och vägrar installera en jobbapp på dem; skiftarbetare har ingen jobbtelefon alls. Hårdvarunycklar till alla kostar på riktigt. Köper ni nycklar till alla, eller tillåter ni undantag?"]),
            pb(["Finance wants to wait", "Ekonomi vill vänta"], ["Finance asks to go after the quarter close, its busiest weeks, because lockouts now would delay the accounts. But finance is your highest-risk group. Do you let them wait?", "Ekonomi ber att få vänta till efter kvartalsbokslutet, deras mest pressade veckor, eftersom utelåsningar nu skulle försena redovisningen. Men ekonomi är er högsta riskgrupp. Låter ni dem vänta?"])
          ] }),
          opt(["Executives only", "Bara ledningen"], "c8", ["Attackers will go for their assistants.", "Angriparna kommer att gå på deras assistenter."], { pushback: [
            pb(["The person next to the boss", "Personen bredvid chefen"], ["Executive assistants manage calendars, can trigger some password resets and prepare payments, and they still sign in with text-message codes. Protecting the executive leaves the person next to them open. Why stop at the title?", "Chefsassistenterna sköter kalendrar, kan utlösa vissa lösenordsåterställningar och förbereder betalningar, och de loggar fortfarande in med sms-koder. Att skydda chefen lämnar personen bredvid öppen. Varför stanna vid titeln?"]),
            pb(["Treasury feels exposed", "Finans känner sig utsatt"], ["The treasury team, who actually move the money, ask why executives get protection and they do not. They are the ones the bank calls to confirm payments. How do you justify where you drew the line?", "Finansavdelningen, som faktiskt flyttar pengarna, frågar varför cheferna får skydd och inte de. Det är dem banken ringer för att bekräfta betalningar. Hur motiverar ni var ni drog gränsen?"]),
            pb(["It looks like a perk", "Det ser ut som en förmån"], ["Staff see executives getting new keys while they keep their text-message codes. It reads as a privilege, not a risk decision. Is executives-only a security choice, or just the easiest one?", "Personalen ser cheferna få nya nycklar medan de själva behåller sms-koderna. Det uppfattas som en förmån, inte ett riskbeslut. Är bara ledningen ett säkerhetsval, eller bara det enklaste?"])
          ] })
        ])
      }),

      pg("c8", ["A month later", "En månad senare"], [
        "A month later, the attackers try again. Someone calls the carrier claiming to be the CEO, and asks for the number to be moved to a new SIM card.\n\nThey have done their homework, as before: they know the personal identity number and the latest bill.",
        "En månad senare försöker angriparna igen. Någon ringer operatören och påstår sig vara vd, och ber att numret ska flyttas till ett nytt SIM-kort.\n\nDe har gjort sin läxa, precis som förra gången: de kan personnumret och den senaste räkningen."
      ], {
        variants: [
          vr("smsRemoved", [
            "A month later, the attackers try again. They manage to move the CEO's number to a new SIM card, just as before.\n\nThis time it achieves nothing. No sign-in and no payment approval accepts text-message codes any more, so the stolen number unlocks nothing at all.",
            "En månad senare försöker angriparna igen. De lyckas flytta vd:s nummer till ett nytt SIM-kort, precis som förra gången.\n\nDen här gången ger det ingenting. Ingen inloggning och ingen betalningsattest godtar längre sms-koder, så det stulna numret låser inte upp något alls."
          ], ["Because SMS was removed from sign-in, a stolen number is worthless.", "Eftersom sms togs bort från inloggningen är ett stulet nummer värdelöst."]),
          vr("portLock", [
            "A month later, the attackers try again. Someone calls the carrier claiming to be the CEO and asks for the number to be moved.\n\nBecause of the port lock, the carrier asks for the PIN code that only the real CEO knows. The caller cannot give it, and the carrier refuses and alerts you.",
            "En månad senare försöker angriparna igen. Någon ringer operatören, påstår sig vara vd och ber att numret ska flyttas.\n\nTack vare flyttspärren ber operatören om den pinkod som bara den riktiga vd:n känner till. Den som ringer kan inte uppge den, och operatören vägrar och larmar er."
          ])
        ],
        choice: ask(["How do you watch for the next one?", "Hur bevakar ni nästa försök?"], ["Gets alerts on porting and SIM changes from the carrier.", "Får larm om flytt och SIM-byten från operatören."], [
          opt(["Carrier alerts on any SIM change or port request", "Larm från operatören vid varje SIM-byte eller flyttbegäran"], "c9", ["Early warning for the next attempt.", "Tidig varning för nästa försök."], { pushback: [
            pb(["Who acts at night?", "Vem agerar på natten?"], ["The carrier's alerts go to a shared mailbox and can arrive at any hour. Nobody has said who acts on one at night or at the weekend. An alert nobody reads is no warning. Who is on the hook?", "Operatörens larm går till en gemensam brevlåda och kan komma när som helst på dygnet. Ingen har sagt vem som agerar på ett larm på natten eller i helgen. Ett larm som ingen läser är ingen varning. Vem är ansvarig?"]),
            pb(["Drowning in alerts", "Drunknar i larm"], ["In the first week the carrier sends a dozen alerts: lost phones, new handsets, someone switching SIM type. Each one has to be checked. How long before people stop looking at them?", "Första veckan skickar operatören ett dussin larm: borttappade telefoner, nya telefoner, någon som byter typ av SIM. Vart och ett måste kontrolleras. Hur lång tid tar det innan folk slutar titta på dem?"]),
            pb(["Private phones aren't covered", "Privata telefoner omfattas inte"], ["The carrier offers alerts only for company subscriptions, as a paid add-on per number. Several executives use private numbers for sign-in codes that the company does not pay for. Which numbers are worth covering, and who pays for the rest?", "Operatören erbjuder larm bara för företagsabonnemang, som ett tillägg per nummer. Flera chefer använder privata nummer för inloggningskoder som företaget inte betalar för. Vilka nummer är värda att täcka, och vem betalar för resten?"])
          ] }),
          opt(["Nothing more", "Inget mer"], "c9", ["Hope the lock holds.", "Hoppas att spärren håller."], { pushback: [
            pb(["Learning afterwards", "Att få veta efteråt"], ["You learned about this attempt after it had happened. Next time the attacker may choose a number you have not protected. Are you willing to find out about the next one the same way?", "Ni fick veta om det här försöket efter att det hade skett. Nästa gång kanske angriparen väljer ett nummer ni inte har skyddat. Är ni beredda att få veta om nästa försök på samma sätt?"]),
            pb(["The CEO was the target", "Vd var måltavlan"], ["This time the attackers went after the CEO by name, with the right details. The CEO asks what will warn the company if it happens again tomorrow. Is “nothing more” an answer you can give the CEO?", "Den här gången gick angriparna på vd med namn och med rätt uppgifter. Vd frågar vad som varnar företaget om det händer igen i morgon. Är ”inget mer” ett svar ni kan ge vd?"]),
            pb(["They are probing", "De känner sig för"], ["Each attempt teaches the attackers what you have changed and what you have not. Doing nothing more lets them probe for the next gap at their own pace. How will you know when they find one?", "Varje försök lär angriparna vad ni har ändrat och vad ni inte har ändrat. Att inte göra något mer låter dem leta efter nästa lucka i sin egen takt. Hur ska ni veta när de hittar en?"])
          ] })
        ])
      }),

      pg("c9", ["The carrier contract", "Operatörsavtalet"], [
        "The company's phone contracts are up for renewal, and the carrier's account manager would like to keep the business.\n\nThis is the moment when you can ask for things the carrier normally does not offer.",
        "Företagets telefoniavtal ska förnyas, och operatörens kundansvarige vill gärna behålla affären.\n\nDet här är tillfället då ni kan begära saker som operatören normalt inte erbjuder."
      ], {
        choice: ask(["What do you require?", "Vad kräver ni?"], ["Requires port locks, named authorised contacts and alerts in the contract.", "Kräver flyttspärrar, namngivna behöriga kontaktpersoner och larm i avtalet."], [
          opt(["Port locks, named contacts and alerts, in writing", "Flyttspärrar, namngivna kontakter och larm, skriftligt"], "c10", ["Turns lessons into terms.", "Gör lärdomar till villkor."], { pushback: [
            pb(["No liability offered", "Inget ansvar erbjuds"], ["The account manager agrees to named contacts and alerts, but not to any liability for an unauthorised SIM swap. Without liability, the terms are promises. Do you sign anyway, or walk away?", "Den kundansvarige går med på namngivna kontakter och larm, men inte på något ansvar vid ett obehörigt SIM-byte. Utan ansvar är villkoren löften. Skriver ni under ändå, eller går ni därifrån?"]),
            pb(["The named contacts", "De namngivna kontakterna"], ["The contract needs named people authorised to change numbers. Each of them becomes a new target for exactly the same trick. Who goes on the list, and how are they protected?", "Avtalet kräver namngivna personer med behörighet att ändra nummer. Var och en av dem blir en ny måltavla för exakt samma trick. Vem kommer med på listan, och hur skyddas de?"]),
            pb(["The price goes up", "Priset går upp"], ["The extra terms add a cost per number, and procurement points out that a competitor offers cheaper basic plans. After a costly year, finance wants the cheaper option. How do you defend paying more?", "De extra villkoren kostar per nummer, och inköp påpekar att en konkurrent erbjuder billigare grundabonnemang. Efter ett dyrt år vill ekonomi ha det billigare alternativet. Hur försvarar ni att betala mer?"])
          ] }),
          opt(["Switch to a different carrier", "Byt till en annan operatör"], "c10", ["The new one needs the same terms.", "Den nya behöver samma villkor."], { pushback: [
            pb(["Same check elsewhere", "Samma kontroll på annat håll"], ["The new carrier's standard identity check is the same: personal identity number and account details. Switching changes the logo, not the process. What will you require from them that you could not get from the current one?", "Den nya operatörens vanliga identitetskontroll är densamma: personnummer och kontouppgifter. Bytet ändrar logotypen, inte processen. Vad ska ni kräva av dem som ni inte kunde få av den nuvarande?"]),
            pb(["Numbers in transit", "Nummer under flytt"], ["Moving every number takes weeks, in batches. Moving numbers between SIM cards and carriers is exactly what the attackers abused. How do you protect the numbers while they are being moved?", "Att flytta alla nummer tar veckor, i omgångar. Att flytta nummer mellan SIM-kort och operatörer är exakt det som angriparna utnyttjade. Hur skyddar ni numren medan de flyttas?"]),
            pb(["Leverage thrown away", "Förhandlingsläget bortkastat"], ["The current carrier was ready to offer special terms to keep you. A new carrier, having already won the business, has less reason to bend. Have you given up your strongest moment to negotiate?", "Den nuvarande operatören var beredd att erbjuda särskilda villkor för att behålla er. En ny operatör, som redan vunnit affären, har mindre skäl att ge efter. Har ni gett upp ert starkaste förhandlingsläge?"])
          ] })
        ])
      }),

      pg("c10", ["The board", "Styrelsen"], [
        "The board asks for a final word: what does this incident say about the company's security as a whole?\n\nA phone number, something nobody had thought of as a security asset, turned out to be the key to the company's money.",
        "Styrelsen ber om ett avslutande ord: vad säger den här incidenten om företagets säkerhet som helhet?\n\nEtt telefonnummer, något som ingen hade tänkt på som en säkerhetstillgång, visade sig vara nyckeln till företagets pengar."
      ], {
        choice: ask(["What is your answer?", "Vad är ert svar?"], ["Names executive identities and payment approvals as critical assets with owners.", "Pekar ut chefernas identiteter och betalningsattester som kritiska tillgångar med ägare."], [
          opt(["Executive identities and approvals are critical assets, reviewed yearly", "Chefernas identiteter och attester är kritiska tillgångar, granskade årligen"], "r-end", ["A durable answer.", "Ett hållbart svar."], { pushback: [
            pb(["Whose asset?", "Vems tillgång?"], ["The board asks who owns “executive identities”: IT, security, HR, or each executive? Nobody wants it on their list, and without an owner the yearly review will not happen. Who is it?", "Styrelsen frågar vem som äger ”chefernas identiteter”: IT, säkerhet, HR eller varje chef? Ingen vill ha det på sin lista, och utan en ägare blir den årliga granskningen inte av. Vem är det?"]),
            pb(["Yearly is too slow", "Årligen är för sällan"], ["A board member notes that this attack went from a lost signal to a payment in under an hour. A yearly review checks things that change every week. Is “yearly” really enough?", "En ledamot påpekar att angreppet gick från tappad täckning till en betalning på under en timme. En årlig granskning kontrollerar saker som ändras varje vecka. Räcker verkligen ”årligen”?"]),
            pb(["Into private life", "In i privatlivet"], ["Treating identities as company assets means looking at executives' private phones, contracts and online exposure. Two executives say that goes too far. Where does the company's interest stop?", "Att behandla identiteter som företagets tillgångar betyder att granska chefernas privata telefoner, abonnemang och exponering på nätet. Två chefer säger att det går för långt. Var slutar företagets intresse?"])
          ] }),
          opt(["More security training", "Mer säkerhetsutbildning"], "r-end", ["The CFO did nothing wrong.", "Ekonomichefen gjorde inget fel."], { pushback: [
            pb(["What would it teach?", "Vad skulle den lära ut?"], ["The CFO asks which training would have stopped a stranger from calling the carrier. To the board it sounds as if the company is blaming the victim. What would the training actually teach?", "Ekonomichefen frågar vilken utbildning som skulle ha hindrat en främling från att ringa operatören. För styrelsen låter det som att företaget skyller på offret. Vad skulle utbildningen egentligen lära ut?"]),
            pb(["Nothing technical changes", "Inget tekniskt ändras"], ["The audit committee asks which controls change because of training. Text-message codes, carrier checks and payment approvals all stay as they were. What do you tell them is different?", "Revisionsutskottet frågar vilka kontroller som ändras genom utbildningen. Sms-koder, operatörens kontroller och betalningsattester förblir som de var. Vad säger ni till dem är annorlunda?"]),
            pb(["Staff resent it", "Personalen tar illa upp"], ["Staff are told to complete mandatory training after an attack they had no part in. Managers report that it is seen as shifting blame downwards. Is that the message you want to send?", "Personalen ska gå en obligatorisk utbildning efter ett angrepp de inte hade något med att göra. Cheferna rapporterar att det uppfattas som att skulden skjuts nedåt. Är det budskapet ni vill skicka?"])
          ] })
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["recallStarted", "smsRemoved", "reported"], "e1"],
          [["recallStarted", "reported"], "e2"],
          ["reported", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Two months later", "Två månader senare"], ["Most of the money came back, text-message codes no longer unlock anything important, and the reports were filed on the first day.\n\nWhen the attackers swapped another number a month later, it achieved nothing. A phone number is now just a phone number, not a key.", "Det mesta av pengarna kom tillbaka, sms-koder låser inte längre upp något viktigt och anmälningarna gjordes första dagen.\n\nNär angriparna bytte ett annat nummer en månad senare gav det ingenting. Ett telefonnummer är nu bara ett telefonnummer, inte en nyckel."], {
        ending: end(1, ["A number, not a key", "Ett nummer, inte en nyckel"], [
          "Most of the money came back, SMS no longer unlocks anything, and the reports were filed on day one. The next swap a month later achieved nothing.",
          "Det mesta av pengarna kom tillbaka, sms låser inte längre upp något och anmälningarna gjordes första dagen. Nästa kapning en månad senare gav ingenting."
        ])
      }),
      pg("e2", ["Two months later", "Två månader senare"], ["The recall worked and the reports were filed properly.\n\nBut text-message codes still unlock sign-in and payment approvals for most people, and the attackers know it works here. The incident is closed; the method is still open.", "Återkallelsen fungerade och anmälningarna gjordes korrekt.\n\nMen sms-koder låser fortfarande upp inloggning och betalningsattester för de flesta, och angriparna vet att det fungerar här. Incidenten är avslutad; metoden står fortfarande öppen."], {
        ending: end(2, ["Money back, method open", "Pengarna tillbaka, metoden öppen"], [
          "The recall worked and the reports were filed, but SMS still unlocks sign-in and approvals. The attackers know it.",
          "Återkallelsen fungerade och anmälningarna gjordes, men sms låser fortfarande upp inloggning och attester. Angriparna vet det."
        ])
      }),
      pg("e3", ["Five months later", "Fem månader senare"], ["The reports were filed, but the recall came too late to catch the money.\n\nThe full amount was lost. After months of paperwork, insurance covers part of it, and the rest lands on the year's result.", "Anmälningarna gjordes, men återkallelsen kom för sent för att hinna ifatt pengarna.\n\nHela beloppet gick förlorat. Efter månader av pappersarbete täcker försäkringen en del, och resten belastar årets resultat."], {
        ending: end(3, ["Reported, not recovered", "Anmält, inte återvunnet"], [
          "The reports were filed, but the recall came too late. The full amount is lost and insurance covers part of it after months.",
          "Anmälningarna gjordes, men återkallelsen kom för sent. Hela beloppet är förlorat och försäkringen täcker en del efter flera månader."
        ])
      }),
      pg("e4", ["Five months later", "Fem månader senare"], ["Without police or bank reports, the bank could not recall the funds in time.\n\nThe insurer refuses the claim because the conditions were not met, and the full loss lands on the year's result. The board asks who decided not to report, and why.", "Utan polisanmälan eller anmälan till banken kunde banken inte återkalla medlen i tid.\n\nFörsäkringsbolaget avslår anspråket eftersom villkoren inte uppfylldes, och hela förlusten belastar årets resultat. Styrelsen frågar vem som beslutade att inte anmäla, och varför."], {
        ending: end(4, ["Handled in silence", "Hanterat i tysthet"], [
          "Without reports, the bank could not recall the funds and the insurer refuses the claim. The loss lands on the year's result.",
          "Utan anmälningar kunde banken inte återkalla medlen och försäkringsbolaget avslår anspråket. Förlusten belastar årets resultat."
        ])
      }),

      // Break-away: the recovery agent.
      pg("x1", ["The recovery agent", "Återvinningsagenten"], [
        "The day after the theft, a “recovery agent” contacted the CFO on a business networking site. They claim to specialise in tracing stolen funds through the banking system.\n\nFor an upfront fee, they promise to trace the money and return it within weeks. They have glowing testimonials and a professional website.",
        "Dagen efter stölden kontaktade en ”återvinningsagent” ekonomichefen på ett professionellt nätverk. Hen påstår sig vara specialiserad på att spåra stulna pengar genom banksystemet.\n\nMot ett förskott lovar hen att spåra pengarna och lämna tillbaka dem inom några veckor. Hen har lysande omdömen och en professionell webbplats."
      ], {
        choice: ask(["Do you pay the fee?", "Betalar ni avgiften?"], ["Recognises recovery scams that target fraud victims.", "Känner igen återvinningsbedrägerier som riktar sig mot bedrägeriets offer."], [
          opt(["Pay the fee", "Betala avgiften"], "x2", ["Recovery scams target exactly this moment.", "Återvinningsbedrägerier riktar in sig på exakt det här ögonblicket."], { pushback: [
            pb(["How did they know?", "Hur visste de?"], ["Nobody at the company contacted the agent; the agent contacted the CFO, the day after the theft. Nobody has asked how they knew so quickly. Do you pay before you have an answer?", "Ingen på företaget kontaktade agenten; agenten kontaktade ekonomichefen dagen efter stölden. Ingen har frågat hur hen kunde veta så snabbt. Betalar ni innan ni har ett svar?"]),
            pb(["Legal wants checks", "Juridik vill kontrollera"], ["{{person.legal.name}} asks for a contract, a company registration and references they can call themselves. The agent says the fee must be paid this week, before the trail goes cold. Do you pay before legal has checked them?", "{{person.legal.name}} vill ha ett avtal, ett registreringsbevis och referenser hen kan ringa själv. Agenten säger att avgiften måste betalas den här veckan, innan spåret kallnar. Betalar ni innan juridik har kontrollerat dem?"]),
            pb(["A familiar kind of payment", "En välbekant sorts betalning"], ["The fee is an urgent payment to a new, unverified recipient abroad, exactly the kind of payment that started all this. Who approves it, and what check do you use that the first one did not have?", "Avgiften är en brådskande betalning till en ny, okontrollerad mottagare utomlands, precis den sortens betalning som startade allt det här. Vem attesterar den, och vilken kontroll använder ni som den första saknade?"])
          ] }),
          opt(["Pay half now", "Betala hälften nu"], "x2", ["Half a scam is still a scam.", "Ett halvt bedrägeri är fortfarande ett bedrägeri."], { pushback: [
            pb(["What did half check?", "Vad kontrollerade hälften?"], ["Treasury points out that paying half is still sending money to someone nobody has verified. If the agent is not genuine, the half is just as lost. What did splitting the fee actually test?", "Finansavdelningen påpekar att betala hälften fortfarande är att skicka pengar till någon som ingen har kontrollerat. Om agenten inte är äkta är hälften lika förlorad. Vad testade ni egentligen genom att dela avgiften?"]),
            pb(["Your bank isn't told", "Er bank får inte veta"], ["Your bank's fraud team is still working the official case and knows nothing about the agent. If they find out later, they may wonder what else you did not share. Do you tell them before you pay anything?", "Er banks bedrägeriteam arbetar fortfarande med det officiella ärendet och vet ingenting om agenten. Om de får veta det senare kan de undra vad mer ni inte berättade. Berättar ni för dem innan ni betalar något?"]),
            pb(["A compromise or a dodge?", "Kompromiss eller undanflykt?"], ["Paying half looks like a compromise, but it is still a decision to pay a stranger. The board will ask who agreed to it and on what evidence. Is splitting the fee a way of avoiding saying no?", "Att betala hälften ser ut som en kompromiss, men det är fortfarande ett beslut att betala en främling. Styrelsen kommer att fråga vem som gick med på det och på vilket underlag. Är det ett sätt att slippa säga nej?"])
          ] })
        ])
      }),
      pg("x2", ["One more fee", "En avgift till"], [
        "Two weeks later the agent reports good progress: the money has been located and frozen at a foreign bank.\n\nTo release it, the bank needs a “release fee”, payable to the agent's account within 48 hours.",
        "Två veckor senare rapporterar agenten goda framsteg: pengarna har hittats och frysts hos en utländsk bank.\n\nFör att frigöra dem behöver banken en ”frigörandeavgift”, som ska betalas till agentens konto inom 48 timmar."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Stops and checks with your own bank.", "Stannar upp och kontrollerar med er egen bank."], [
          opt(["Check with your own bank first", "Kontrollera med er egen bank först"], "x3", ["They have never heard of the agent.", "De har aldrig hört talas om agenten."], { pushback: [
            pb(["The deadline passes", "Tidsfristen går ut"], ["Your bank says enquiries with a foreign bank take several days. The agent's deadline is 48 hours, and they warn the money will be released back to the criminals. Are you willing to let the deadline pass?", "Er bank säger att förfrågningar till en utländsk bank tar flera dagar. Agentens tidsfrist är 48 timmar, och hen varnar för att pengarna då släpps tillbaka till de kriminella. Är ni beredda att låta tidsfristen gå ut?"]),
            pb(["The agent takes offence", "Agenten tar illa upp"], ["The agent says involving your bank will alert the criminals and undo the work already done, and threatens to drop the case and keep the first fee. Does that make you more or less suspicious, and does it change your plan?", "Agenten säger att om ni blandar in er bank varnas de kriminella och arbetet hittills går förlorat, och hotar att lägga ner ärendet och behålla den första avgiften. Gör det er mer eller mindre misstänksamma, och ändrar det er plan?"]),
            pb(["Admitting the first fee", "Att erkänna första avgiften"], ["To check, you must tell your bank that you have already paid a recovery agent without asking them. It is embarrassing, and the bank will note it in the case. Who makes that call?", "För att kontrollera måste ni berätta för banken att ni redan har betalat en återvinningsagent utan att fråga dem. Det är pinsamt, och banken kommer att notera det i ärendet. Vem ringer det samtalet?"])
          ] }),
          opt(["Pay the release fee", "Betala frisläppningsavgiften"], "x3", ["More money gone.", "Mer pengar borta."], { pushback: [
            pb(["Paid to the agent?", "Betalt till agenten?"], ["Treasury points out that the “release fee” goes to the agent's account, not to the foreign bank that supposedly holds the money. Why would a bank need its fee paid to someone else?", "Finansavdelningen påpekar att ”frigörandeavgiften” går till agentens konto, inte till den utländska bank som sägs hålla pengarna. Varför skulle en bank vilja ha sin avgift betald till någon annan?"]),
            pb(["Who signs this time?", "Vem skriver under den här gången?"], ["The fee needs an approver. The CFO, the original victim, would rather someone else signed this one. Who puts their name on a second payment to the agent?", "Avgiften behöver en attestant. Ekonomichefen, det ursprungliga offret, vill helst att någon annan skriver under den här. Vem sätter sitt namn på en andra betalning till agenten?"]),
            pb(["What is it buying?", "Vad köper den?"], ["The strongest argument for paying is that you have already paid once. {{person.legal.name}} asks whether anything new has been verified since then. If not, what is this payment actually buying?", "Det starkaste argumentet för att betala är att ni redan har betalat en gång. {{person.legal.name}} frågar om något nytt har kunnat kontrolleras sedan dess. Om inte, vad köper den här betalningen egentligen?"])
          ] })
        ])
      }),
      pg("x3", ["Gone", "Borta"], [
        "The agent's website disappears overnight. The profile on the business network is deleted, and the phone number no longer works.\n\nThe “recovery agent” was part of the same scheme, or another one just like it.",
        "Agentens webbplats försvinner under natten. Profilen på nätverket är raderad och telefonnumret fungerar inte längre.\n\n”Återvinningsagenten” var en del av samma upplägg, eller ett annat precis likadant."
      ], {
        choice: ask(["What do you do?", "Vad gör ni?"], ["Reports both frauds and documents everything.", "Anmäler båda bedrägerierna och dokumenterar allt."], [
          opt(["Report both frauds to the police", "Anmäl båda bedrägerierna till polisen"], "x4", ["Late, and necessary.", "Sent, och nödvändigt."], { pushback: [
            pb(["Admitting it twice", "Att erkänna det två gånger"], ["Reporting the second fraud means stating in writing that the company paid a stranger, after the first loss. Management worries how that reads if it leaks. Do you still report both?", "Att anmäla det andra bedrägeriet betyder att skriftligt intyga att företaget betalade en främling, efter den första förlusten. Ledningen oroar sig för hur det ser ut om det läcker. Anmäler ni ändå båda?"]),
            pb(["The CFO's private messages", "Ekonomichefens privata meddelanden"], ["The police want the agent's messages, and some of them exist only in the CFO's personal account on the networking site. Handing them over means opening a private account to the police. Will the CFO agree, and can you ask that of them?", "Polisen vill ha agentens meddelanden, och en del finns bara i ekonomichefens privata konto på nätverket. Att lämna över dem betyder att öppna ett privat konto för polisen. Går ekonomichefen med på det, och kan ni begära det?"]),
            pb(["Rarely solved", "Sällan uppklarat"], ["The officer is frank: scams run from abroad are rarely solved, and the report will take hours to prepare. Is it worth the effort, and who is it really for?", "Polisen är ärlig: bedrägerier som drivs från utlandet klaras sällan upp, och anmälan tar timmar att förbereda. Är det värt mödan, och vem är det egentligen till för?"])
          ] }),
          opt(["Write it off quietly", "Skriv av det i tysthet"], "x4", ["The auditors will ask.", "Revisorerna kommer att fråga."], { pushback: [
            pb(["Payments leave traces", "Betalningar lämnar spår"], ["The fees went out as approved payments with records. They cannot simply vanish from the books. Who explains them, and as what?", "Avgifterna gick ut som attesterade betalningar med underlag. De kan inte bara försvinna ur bokföringen. Vem förklarar dem, och som vad?"]),
            pb(["The first claim at risk", "Det första anspråket i fara"], ["Your insurer and bank are still working on the first fraud. Keeping a related second loss from them may breach the policy terms. Do you risk the first claim to keep the second one quiet?", "Ert försäkringsbolag och er bank arbetar fortfarande med det första bedrägeriet. Att hålla en relaterad andra förlust från dem kan bryta mot villkoren. Riskerar ni det första anspråket för att tysta ner det andra?"]),
            pb(["They will call again", "De kommer att ringa igen"], ["The same people may approach you again with a new story, or target other victims. Without a report, nobody is warned, not even your own staff. Is staying quiet really harmless?", "Samma personer kan höra av sig igen med en ny historia, eller ge sig på andra offer. Utan en anmälan varnas ingen, inte ens er egen personal. Är det verkligen ofarligt att tiga?"])
          ] })
        ])
      }),
      pg("x4", ["The auditors", "Revisorerna"], [
        "The annual audit begins. The auditors ask about two unexplained payments to a consultancy that no longer exists, and about the original fraud.\n\nThey want documentation, police reports and the board's approval for each payment.",
        "Den årliga revisionen börjar. Revisorerna frågar om två oförklarade betalningar till en konsultfirma som inte längre finns, och om det ursprungliga bedrägeriet.\n\nDe vill ha dokumentation, polisanmälningar och styrelsens godkännande för varje betalning."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Discloses everything.", "Redovisar allt."], [
          opt(["Full disclosure", "Full öppenhet"], "e5", ["The only answer auditors accept.", "Det enda svar revisorer godtar."], { pushback: [
            pb(["Who signed?", "Vem skrev under?"], ["Full disclosure means admitting the agent's fees were paid without board approval. Directors will want to know who signed each payment. Are you ready to have that conversation on the record?", "Full öppenhet betyder att erkänna att agentens avgifter betalades utan styrelsens godkännande. Ledamöterna kommer att vilja veta vem som attesterade varje betalning. Är ni redo att ta det samtalet till protokollet?"]),
            pb(["Personal responsibility", "Personligt ansvar"], ["Disclosure names the people who approved each payment. One of them asks whether they will be held personally responsible. What do you promise them, and can you keep that promise?", "Öppenheten pekar ut de personer som attesterade varje betalning. En av dem frågar om hen kommer att hållas personligt ansvarig. Vad lovar ni hen, och kan ni hålla det löftet?"]),
            pb(["How much detail?", "Hur detaljerat?"], ["Written out in full, the timeline shows the company paid a stranger twice within weeks of a fraud. The CEO asks whether it really has to be that detailed. How much detail is “full”?", "Utskriven i sin helhet visar tidslinjen att företaget betalade en främling två gånger inom några veckor efter ett bedrägeri. Vd frågar om det verkligen måste vara så detaljerat. Hur mycket detalj är ”full”?"])
          ] }),
          opt(["Call it consultancy", "Kalla det konsulttjänster"], "e5", ["Now it is an accounting problem too.", "Nu är det också ett redovisningsproblem."], { pushback: [
            pb(["Show us the contract", "Visa oss avtalet"], ["The auditors ask for the consultancy contract, the deliverables and the invoices. There are none, and the firm no longer exists. What do you hand them?", "Revisorerna ber om konsultavtalet, leveranserna och fakturorna. Det finns inga, och firman finns inte längre. Vad lämnar ni över?"]),
            pb(["Someone has to sign", "Någon måste skriva under"], ["Calling it consultancy means someone signs off a false description in the accounts. {{person.legal.name}} refuses to be that person. Who will?", "Att kalla det konsulttjänster betyder att någon godkänner en felaktig beskrivning i bokföringen. {{person.legal.name}} vägrar vara den personen. Vem gör det?"]),
            pb(["Two versions on record", "Två versioner i arkivet"], ["If the recovery scam was reported to the police, that report contradicts the “consultancy” label. The same payment would then be on record twice, described two ways. Which version do you stand behind?", "Om återvinningsbedrägeriet anmäldes till polisen motsäger den anmälan etiketten ”konsulttjänster”. Samma betalning finns då dokumenterad två gånger, beskriven på två sätt. Vilken version står ni för?"])
          ] })
        ])
      }),
      pg("e5", ["Six months later", "Sex månader senare"], ["After the SIM swap came a recovery scam: two losses instead of one.\n\nThe auditors have added a remark to the annual report, and the board wants to understand how the company was defrauded twice in a month, the second time by people who promised to help.", "Efter SIM-bytet kom ett återvinningsbedrägeri: två förluster i stället för en.\n\nRevisorerna har lagt till en anmärkning i årsredovisningen, och styrelsen vill förstå hur företaget kunde bli lurat två gånger på en månad, andra gången av personer som lovade att hjälpa till."], {
        ending: end(5, ["Scammed twice", "Lurade två gånger"], [
          "After the SIM swap came a recovery scam. Two losses, an auditors' remark and a board asking how it happened twice.",
          "Efter SIM-kapningen kom ett återvinningsbedrägeri. Två förluster, en anmärkning från revisorerna och en styrelse som frågar hur det kunde hända två gånger."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Lost signal plus a new device on a bank account means SIM swap: act in minutes.", "Tappad täckning plus en ny enhet på ett bankkonto betyder SIM-kapning: agera inom några minuter."]),
        L(["A phone number is not proof of identity; remove SMS from sign-in and approvals.", "Ett telefonnummer är inget bevis på identitet; ta bort sms från inloggning och attester."]),
        L(["Payment recalls succeed in hours, not days.", "Återkallelser av betalningar lyckas inom timmar, inte dagar."]),
        L(["Fraud victims are targeted again by recovery scams.", "Bedrägerioffer utsätts igen av återvinningsbedrägerier."])
      ],
      strengthsToLookFor: [
        L(["Freezing payments first", "Att frysa betalningarna först"]),
        L(["Removing SMS as an authentication factor", "Att ta bort sms som autentiseringsfaktor"]),
        L(["Locking executive numbers at the carrier", "Att låsa chefernas nummer hos operatören"])
      ],
      commonGaps: [
        L(["Assuming a network fault", "Att anta ett nätfel"]),
        L(["Resetting a password that SMS can reset again", "Att återställa ett lösenord som sms kan återställa igen"]),
        L(["Trusting a recovery agent", "Att lita på en återvinningsagent"])
      ],
      suggestedActions: [
        act(["Replace SMS codes with app or hardware authentication for all approvers.", "Ersätt sms-koder med app eller hårdvara för alla attestanter."], "ciso", "high"),
        act(["Port-lock all executive and finance numbers.", "Flyttspärra alla nummer för ledning och ekonomi."], "supplierManager", "high"),
        act(["Agree a payment-recall procedure with the bank.", "Kom överens med banken om en rutin för återkallelse av betalningar."], "cfo", "medium")
      ]
    }
  });
})();
