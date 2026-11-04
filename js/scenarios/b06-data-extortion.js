/*
 * b06-data-extortion.js — "No Encryption, Just Threats" (branching, data extortion).
 *
 * An advisory firm's client files are stolen through a contractor's VPN account.
 * Nothing is encrypted; the attackers threaten to contact clients and publish.
 * Spine: the email → where from → professional secrecy → the drip to clients →
 * notification → the price → the leak site → staff → the supervisor → trust →
 * contractor access. Alternative: negotiating for "proof of deletion".
 * Break-away at the leak site: paying a "consultant" to take it down.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, kpi, pg, ask, opt, pb, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b06-data-extortion",
    version: 1,
    format: "branching",
    category: "extortion",
    archetype: "human-legal-reputational",
    emblem: "extortion",
    title: L(["No Encryption, Just Threats", "Ingen kryptering, bara hot"]),
    summary: L([
      "Every system works. But someone has your clients' files, and they say they will call your clients before you do.",
      "Alla system fungerar. Men någon har era klienters filer, och de säger att de kommer att ringa era klienter innan ni gör det."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Verify and scope a data-theft extortion", "Verifiera och avgränsa en utpressning efter datastöld"]), teaser: L(["Separating claims from facts", "Att skilja påståenden från fakta"]) },
      { id: "lo2", text: L(["Put client confidentiality duties first", "Sätta skyldigheten att skydda klienternas förtroende främst"]), teaser: L(["The promises you have made to others", "De löften ni har gett andra"]) },
      { id: "lo3", text: L(["Decide on paying, with no encryption to undo", "Ta ställning till betalning när det inte finns någon kryptering att häva"]), teaser: L(["Hard choices with no good options", "Svåra val utan bra alternativ"]) },
      { id: "lo4", text: L(["Control third-party remote access", "Kontrollera tredje parts fjärråtkomst"]), teaser: L(["Who else holds a key to your house", "Vem mer som har en nyckel till ert hus"]) }
    ],
    mitre: ["T1133", "T1078", "T1567.002", "T1657", "T1048"],
    frameworks: {
      nistCsf: ["GV.SC", "PR.AA", "DE.CM", "RS.AN", "RS.CO", "RS.MI", "RC.CO"],
      iso27001: ["A.5.14", "A.5.19", "A.5.24", "A.5.26", "A.5.34", "A.8.5", "A.8.16"]
    },
    constraints: { startWindow: "monday-morning", sectors: ["finance"] },
    actor: { types: ["criminal"], motivation: L(["Financial: extortion with stolen client data", "Ekonomisk: utpressning med stulna klientuppgifter"]), capability: "medium" },
    variables: {
      gigabytes: { min: 40, max: 900, scaleBy: "size", step: 10 },
      clients: { min: 30, max: 900, scaleBy: "size" },
      demand: { min: 3000000, max: 25000000, scaleBy: "size", step: 500000, currency: true }
    },
    roles: ["incidentCommander", "ceo", "legal", "ciso", "itOps", "socLead", "dpo", "comms", "supplierManager"],

    flags: {
      contactBroken: L(["Contact with the extortionists broken off", "Kontakten med utpressarna avbruten"]),
      ignored: L(["Treated the email as a bluff", "Behandlade mejlet som en bluff"]),
      engaged: L(["Replied to the extortionist", "Svarade utpressaren"]),
      wiped: L(["Wiped the file server", "Raderade filservern"]),
      clientsTold: L(["Clients told before the attacker reached them", "Klienterna informerade innan angriparen nådde dem"]),
      notified: L(["Notified the DPA", "Anmält till dataskyddsmyndigheten"]),
      refused: L(["Refused to pay", "Vägrade betala"]),
      paid: L(["Paid the extortionist", "Betalade utpressaren"])
    },

    start: "c1",
    pages: [
      pg("c1", ["The email", "Mejlet"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. {{person.ceo.name}} forwards an email that arrived overnight: “We have {{num.gigabytes}} GB of your client files. Proof attached. Contact us within 72 hours, or we contact your clients.”\n\nEvery system works. Nothing is encrypted, nobody has seen an alert, and the attached samples look like real client documents. The attackers are not asking you to recover anything; they are threatening your reputation.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. {{person.ceo.name}} vidarebefordrar ett mejl som kom under natten: ”Vi har {{num.gigabytes}} GB av era klientfiler. Bevis bifogat. Kontakta oss inom 72 timmar, annars kontaktar vi era klienter.”\n\nAlla system fungerar. Ingenting är krypterat, ingen har sett något larm och de bifogade proven ser ut som riktiga klientdokument. Angriparna ber er inte återställa något; de hotar ert rykte."
      ], {
        injects: [
          inj("b6-1", 0, "ransomNote", "attacker", "critical", "unverified", [
            "Your network was not encrypted. That is a courtesy. We have {{num.gigabytes}} GB: deal rooms, tax files, correspondence. Ten samples attached. 72 hours.",
            "Ert nätverk krypterades inte. Det är en artighet. Vi har {{num.gigabytes}} GB: datarum, skattefiler, korrespondens. Tio exempel bifogade. 72 timmar."
          ], { headline: ["Subject: your clients' files", "Ämne: era klienters filer"], tests: ["lo1"] })
        ],
        discuss: [q("How do you check the samples without making things worse?", "Hur kontrollerar ni exemplen utan att göra saken värre?", ["socLead", "legal"])],
        facilitator: { notes: L(["No encryption means no outage to fix. The whole crisis is about clients and confidentiality.", "Ingen kryptering betyder inget avbrott att åtgärda. Hela krisen handlar om klienter och sekretess."]) },
        choice: ask(["What is your first move?", "Vad gör ni först?"], ["Verifies the samples quietly and preserves evidence, without engaging yet.", "Verifierar exemplen i tysthet och säkrar bevis, utan att inleda kontakt ännu."], [
          opt(["Verify the samples with IT and a forensics firm", "Verifiera exemplen med IT och en forensikfirma"], "c2", ["A day to know what you're dealing with.", "Ett dygn för att veta vad ni har att göra med."], { pushback: [
            pb(["A day is a long time", "Ett dygn är lång tid"], ["The forensics firm can start tomorrow morning, not today, and the 72-hour clock is already running. Every hour spent verifying is an hour the attackers could use to reach clients. Do you start preparing client contacts before you know the samples are real, or hold everything until you do?", "Forensikfirman kan börja i morgon bitti, inte i dag, och 72-timmarsklockan tickar redan. Varje timme ni lägger på att verifiera är en timme angriparna kan använda för att nå klienterna. Börjar ni förbereda klientkontakter innan ni vet att proven är äkta, eller väntar ni med allt tills ni vet?"]),
            pb(["Who may open the files?", "Vem får öppna filerna?"], ["The samples are confidential client documents. Legal points out that handing them to an outside forensics firm shows privileged material to yet another party, without the clients' consent. Who in the firm is allowed to look at these files, and on what basis?", "Proven är konfidentiella klientdokument. Juristen påpekar att om ni lämnar dem till en extern forensikfirma visar ni sekretessbelagt material för ännu en part, utan klienternas samtycke. Vem på byrån får titta på filerna, och med vilket stöd?"]),
            pb(["Word is getting out", "Det börjar pratas"], ["To check the samples, IT has asked three partners whether they recognise the documents. One of them has already asked a colleague whether “we've been hacked”. Do you widen the circle to verify faster, or lock it down and verify more slowly?", "För att kontrollera proven har IT frågat tre delägare om de känner igen dokumenten. En av dem har redan frågat en kollega om ”vi har blivit hackade”. Vidgar ni kretsen för att verifiera snabbare, eller stänger ni den och verifierar långsammare?"])
          ] }),
          opt(["Treat it as a bluff", "Behandla det som en bluff"], "c2", ["Some are bluffs. These samples look real.", "En del är bluffar. De här exemplen ser äkta ut."], { set: "ignored", pushback: [
            pb(["A partner recognises it", "En delägare känner igen det"], ["A partner glances at one sample and goes pale: it is a draft letter sent to a client only last week. Bluffers rarely have last week's drafts. Do you still call it a bluff, and on what evidence?", "En delägare tittar på ett av proven och blir blek: det är ett utkast till ett brev som gick till en klient förra veckan. Bluffare brukar inte ha förra veckans utkast. Kallar ni det fortfarande en bluff, och med vilket underlag?"]),
            pb(["Who signs off on “ignore”?", "Vem skriver under på ”ignorera”?"], ["The compliance officer wants the decision in writing: who judged this a bluff, and on what basis? If even one client is contacted, the supervisor will read that note. Who puts their name to it?", "Complianceansvarig vill ha beslutet skriftligt: vem bedömde detta som en bluff, och på vilka grunder? Om så bara en klient kontaktas kommer tillsynen att läsa den anteckningen. Vem skriver under?"]),
            pb(["The clock keeps running", "Klockan går ändå"], ["Calling it a bluff does not stop the 72 hours. If you are wrong, you will have spent a day of them doing nothing, and from then on the attackers set the pace. How much of that time are you willing to bet?", "Att kalla det en bluff stoppar inte de 72 timmarna. Har ni fel har ni använt ett dygn av dem till ingenting, och sedan är det angriparna som bestämmer takten. Hur mycket av den tiden är ni beredda att satsa?"])
          ] }),
          opt(["Reply to buy time", "Svara för att vinna tid"], "c2", ["Opens a channel before you know what you'll say in it.", "Öppnar en kanal innan ni vet vad ni ska säga i den."], { set: "engaged", pushback: [
            pb(["Who is writing?", "Vem skriver?"], ["Someone has to write the reply. Legal says anything you send could later be quoted to clients, the press or a court, and nobody has agreed what the firm admits. Who drafts it, who approves it, and what exactly does it say?", "Någon måste skriva svaret. Juristen säger att allt ni skickar senare kan citeras för klienter, press eller domstol, och ingen har bestämt vad byrån erkänner. Vem skriver, vem godkänner, och vad står det egentligen?"]),
            pb(["You confirm you are listening", "Ni bekräftar att ni lyssnar"], ["The security team notes that a reply confirms the mailbox is read and that someone senior takes it seriously. That is exactly what an extortionist wants to know. What do you gain from replying that is worth telling them that?", "Säkerhetsteamet påpekar att ett svar bekräftar att brevlådan läses och att någon i ledningen tar det på allvar. Det är precis vad en utpressare vill veta. Vad vinner ni på att svara som är värt att avslöja det?"]),
            pb(["The police say wait", "Polisen säger vänta"], ["A police contact says they usually advise against replying before you have taken advice, and they want to see the original email untouched first. Do you send your reply anyway, or wait and lose the time you meant to buy?", "En kontakt hos polisen säger att de brukar avråda från att svara innan man har fått råd, och att de först vill se originalmejlet orört. Skickar ni svaret ändå, eller väntar ni och förlorar den tid ni ville vinna?"])
          ] })
        ])
      }),

      pg("c2", ["Where from?", "Varifrån?"], [
        "IT and the forensics firm confirm the samples are genuine. The file server logs show where they came from: large uploads to a cloud storage service, a little every night for two weeks.\n\nEvery upload went through the VPN account of an IT contractor who helped with a migration last year. The account had no MFA, and nobody had switched it off.",
        "IT och forensikfirman bekräftar att proven är äkta. Filserverns loggar visar var de kom ifrån: stora uppladdningar till en molnlagringstjänst, lite varje natt i två veckor.\n\nVarje uppladdning gick via vpn-kontot för en IT-konsult som hjälpte till med en migrering förra året. Kontot saknade MFA, och ingen hade stängt av det."
      ], {
        variants: [vr("engaged", [
          "Your reply was answered within minutes, with a second sample and a shorter deadline: 48 hours now, not 72. The attackers clearly have someone watching the mailbox.\n\nMeanwhile, the file server logs show uploads to a cloud storage service every night for two weeks, all through the VPN account of an IT contractor. The account had no MFA, and nobody had switched it off.",
          "Ert svar besvarades inom några minuter, med ett andra prov och en kortare tidsfrist: 48 timmar nu, inte 72. Angriparna har uppenbarligen någon som bevakar brevlådan.\n\nUnder tiden visar filserverns loggar uppladdningar till en molnlagringstjänst varje natt i två veckor, alla via vpn-kontot för en IT-konsult. Kontot saknade MFA, och ingen hade stängt av det."
        ], ["Because you replied, they know someone is listening.", "Eftersom ni svarade vet de att någon lyssnar."])],
        injects: [
          inj("b6-2", 240, "networkEvidence", "itOps", "high", "confirmed", [
            "VPN account ext-contractor-07 · 14 sessions over 15 days · outbound to cloud storage: {{num.gigabytes}} GB · no MFA on the account.",
            "VPN-kontot ext-contractor-07 · 14 sessioner under 15 dagar · utgående till molnlagring: {{num.gigabytes}} GB · ingen MFA på kontot."
          ], { tests: ["lo4"] })
        ],
        choice: ask(["What do you do about the access?", "Vad gör ni med åtkomsten?"], ["Closes the door and preserves evidence; destroying the server destroys the scope.", "Stänger dörren och bevarar bevis; att förstöra servern förstör möjligheten att avgränsa."], [
          opt(["Disable the account, reset credentials, preserve the logs", "Stäng kontot, återställ inloggningsuppgifter, bevara loggarna"], "l1", ["Clean containment with evidence intact.", "Ren begränsning med bevisen intakta."], { pushback: [
            pb(["The contractor objects", "Konsulten protesterar"], ["The contractor's owner calls, offended: the job ended a year ago and closing the account was your responsibility. They also want to know whether you are blaming them. Do you involve them in the investigation, or keep them out of it?", "Konsultfirmans ägare ringer, kränkt: uppdraget avslutades för ett år sedan och det var ert ansvar att stänga kontot. Ägaren vill också veta om ni lägger skulden på dem. Tar ni in dem i utredningen, eller håller ni dem utanför?"]),
            pb(["Is this the only door?", "Är det här den enda dörren?"], ["Disabling one account closes one door. IT cannot yet say whether the two weeks were used to create others, and checking every account will take days. Do you say the intrusion is contained now, or wait until you can stand behind it?", "Att stänga ett konto stänger en dörr. IT kan ännu inte säga om de två veckorna användes till att skapa fler, och att gå igenom alla konton tar dagar. Säger ni att intrånget är begränsat nu, eller väntar ni tills ni kan stå för det?"]),
            pb(["They will notice", "De kommer att märka det"], ["The attackers will see that their access is gone. Your security lead warns that this tells them you have found them, before you have told a single client. Do you close it anyway, or time it with your first client calls?", "Angriparna kommer att se att åtkomsten är borta. Er säkerhetschef varnar för att det talar om för dem att ni har hittat dem, innan ni har sagt något till en enda klient. Stänger ni ändå, eller samordnar ni det med de första klientsamtalen?"])
          ] }),
          opt(["Watch quietly to see whether they are still in", "Bevaka i tysthet för att se om de fortfarande är inne"], "l1", ["Intelligence at the cost of more exposure.", "Underrättelser till priset av mer exponering."], { pushback: [
            pb(["Another upload tonight", "Ännu en uppladdning i natt"], ["If they are still in, tonight's upload goes out while you watch, and it may include files from today's client work. Who decides how much more you are willing to lose for the sake of intelligence, and where is the line?", "Om de fortfarande är inne går nattens uppladdning ut medan ni tittar på, och den kan innehålla filer från dagens klientarbete. Vem bestämmer hur mycket mer ni är beredda att förlora för underrättelsernas skull, och var går gränsen?"]),
            pb(["Legal wants it shut", "Juristen vill stänga"], ["Your general counsel is blunt: knowingly leaving a door to client files open is hard to explain to any client or supervisor later. “We were watching” will not sound like protection. Can you defend this to the clients whose files leave tonight?", "Er chefsjurist är rak: att medvetet lämna en dörr till klientfilerna öppen är svårt att förklara för klienter eller tillsyn i efterhand. ”Vi höll koll” låter inte som skydd. Kan ni försvara det inför de klienter vars filer går ut i natt?"]),
            pb(["Nobody to watch", "Ingen som bevakar"], ["The forensics firm can set up proper monitoring, but not before tomorrow, and nobody in-house is used to reading VPN logs in real time. Who exactly is watching tonight, and what do they do if they see something?", "Forensikfirman kan sätta upp ordentlig bevakning, men inte före i morgon, och ingen internt är van att läsa vpn-loggar i realtid. Vem är det egentligen som bevakar i natt, och vad gör den personen om något händer?"])
          ] }),
          opt(["Wipe and rebuild the file server", "Radera och bygg om filservern"], "l1", ["Feels decisive. Destroys the evidence of what was taken.", "Känns beslutsamt. Förstör bevisen för vad som togs."], { set: "wiped", pushback: [
            pb(["Forensics says stop", "Forensikerna säger stopp"], ["The forensics firm asks you not to touch the server: its logs and access records are the only way to know exactly which client files were taken. Without them, every client becomes a maybe. Do you wipe it anyway?", "Forensikfirman ber er att inte röra servern: dess loggar och åtkomstposter är det enda sättet att veta exakt vilka klientfiler som togs. Utan dem blir varje klient ett kanske. Raderar ni ändå?"]),
            pb(["The work stops", "Arbetet stannar"], ["Rebuilding takes the file server offline for at least a day. Advisers on live deals lose their files, and they will ask why. What do you tell them, and does it give away more than you want?", "En ombyggnad tar filservern ur drift i minst ett dygn. Rådgivare i pågående affärer förlorar sina filer, och de kommer att fråga varför. Vad säger ni till dem, och avslöjar det mer än ni vill?"]),
            pb(["The door is still open", "Dörren står kvar öppen"], ["A rebuilt server is still reachable through the same contractor VPN account, which nobody has disabled. Wiping removes the evidence but not the way in. Is this decisive, or does it only look that way?", "En ombyggd server nås fortfarande via samma konsultkonto i vpn:et, som ingen har stängt av. Att radera tar bort bevisen men inte vägen in. Är det här beslutsamt, eller ser det bara ut så?"])
          ] })
        ])
      }),

      pg("l1", ["Which clients?", "Vilka klienter?"], [
        "The team starts matching the {{num.gigabytes}} GB of stolen files to clients.\n\nThe first count is {{num.clients}} clients. Among them are three active deal rooms for listed companies, where nothing has been announced to the market yet.",
        "Teamet börjar matcha de {{num.gigabytes}} GB stulna filerna mot klienter.\n\nDen första räkningen ger {{num.clients}} klienter. Bland dem finns tre aktiva datarum för börsnoterade bolag, där ingenting ännu har offentliggjorts för marknaden."
      ], {
        long: true,
        skipTo: "c3",
        variants: [vr("wiped", [
          "Because the file server was wiped and rebuilt, the evidence on it is gone. Matching the stolen files to clients now has to be pieced together from backups and the upload logs.\n\nThe first rough estimate is {{num.clients}} clients, including three active deal rooms for listed companies. It will take days to be sure.",
          "Eftersom filservern raderades och byggdes om är bevisen på den borta. Att matcha de stulna filerna mot klienter måste nu pusslas ihop från säkerhetskopior och uppladdningsloggar.\n\nDen första grova uppskattningen är {{num.clients}} klienter, däribland tre aktiva datarum för börsnoterade bolag. Det tar dagar att bli säker."
        ], ["Because the server was wiped, the scope is an estimate.", "Eftersom servern raderades är omfattningen en uppskattning."])],
        chart: { id: "b6-scope", type: "kpi", title: L(["What was taken", "Vad som togs"]), data: kpi([
          { id: "k1", label: ["Gigabytes", "Gigabyte"], value: (v) => v.gigabytes, tone: "warn" },
          { id: "k2", label: ["Clients affected", "Berörda klienter"], value: (v) => v.clients, tone: "danger" }
        ]) },
        choice: ask(["How far do you map it?", "Hur långt kartlägger ni?"], ["Builds the full client list; partial lists leave clients uninformed.", "Bygger hela klientlistan; ofullständiga listor lämnar klienter oinformerade."], [
          opt(["Every client, every file", "Varje klient, varje fil"], "c3", ["Days of work. Needed for every later decision.", "Dagar av arbete. Behövs för varje senare beslut."], { pushback: [
            pb(["Days you may not have", "Dagar ni kanske inte har"], ["The team estimates four or five days to map every file, and the attackers' deadline is shorter than that. Do you wait for a complete list before anyone calls a client, or start calling from an incomplete one?", "Teamet uppskattar fyra eller fem dagar för att kartlägga varje fil, och angriparnas tidsfrist är kortare än så. Väntar ni på en komplett lista innan någon ringer en klient, eller börjar ni ringa utifrån en ofullständig?"]),
            pb(["Who reads the files?", "Vem läser filerna?"], ["Mapping every file means people reading confidential documents they were never meant to see, including inside information from the deal rooms. Partners refuse to let juniors do it. Who does the reading, and how do you keep that circle closed?", "Att kartlägga varje fil innebär att personer läser konfidentiella dokument som de aldrig skulle ha sett, inklusive insiderinformation från datarummen. Delägarna vägrar låta juniorer göra det. Vem läser, och hur håller ni den kretsen sluten?"]),
            pb(["Where does it stop?", "Var tar det slut?"], ["Halfway through, the team finds documents about clients' own customers and employees: people who are not your clients at all. Every new name widens your duties. Where does the map stop, and who decides?", "Halvvägs hittar teamet dokument om klienternas egna kunder och anställda, personer som inte alls är era klienter. Varje nytt namn vidgar era skyldigheter. Var slutar kartan, och vem bestämmer det?"])
          ] }),
          opt(["The twenty biggest clients first", "De tjugo största klienterna först"], "c3", ["Pragmatic, until a small client finds out first.", "Pragmatiskt, tills en liten klient får veta det först."], { pushback: [
            pb(["A small client calls", "En liten klient ringer"], ["A sole trader calls reception: a friend at another firm heard a rumour, and they want to know whether their files are safe. They are not in your top twenty, so nobody knows yet. What do you tell them right now?", "En enskild näringsidkare ringer receptionen: en vän på en annan byrå har hört ett rykte, och klienten vill veta om filerna är säkra. Klienten är inte bland era tjugo största, så ingen vet ännu. Vad säger ni just nu?"]),
            pb(["Biggest by what?", "Störst efter vad?"], ["Biggest by fees, or by harm? A small family business may have its whole tax history in the stolen files, while a large client lost only invoices. Do you rank by revenue and defend that later?", "Störst efter arvoden, eller efter skada? Ett litet familjeföretag kan ha hela sin skattehistorik bland de stulna filerna, medan en stor klient bara har förlorat fakturor. Rangordnar ni efter intäkter och försvarar det sedan?"]),
            pb(["The duty has no size", "Plikten har ingen storlek"], ["Legal reminds you that confidentiality is owed to every client, not to the largest. If the supervisor later asks how you chose who came first, the answer on file is “by fees”. Are you comfortable with that?", "Juristen påminner om att tystnadsplikten gäller varje klient, inte de största. Om tillsynen senare frågar hur ni valde vem som kom först är svaret i akten ”efter arvoden”. Kan ni stå för det?"])
          ] })
        ])
      }),

      pg("c3", ["Professional secrecy", "Tystnadsplikt"], [
        "{{person.legal.name}} reminds the room what kind of firm this is. You owe your clients confidentiality, and for some of them professional secrecy is a legal duty, not a courtesy.\n\nSome of the files concern listed companies and may be inside information. The attackers have promised to contact clients. The question is who reaches them first.",
        "{{person.legal.name}} påminner rummet om vilken sorts byrå det här är. Ni är skyldiga era klienter konfidentialitet, och för en del av dem är tystnadsplikten en rättslig skyldighet, inte en artighet.\n\nEn del av filerna rör börsnoterade bolag och kan vara insiderinformation. Angriparna har lovat att kontakta klienterna. Frågan är vem som når dem först."
      ], {
        variants: [vr("ignored", [
          "Half of the 72 hours have gone while the threat was treated as a bluff, and the samples have turned out to be real.\n\n{{person.legal.name}} reminds the room that you owe clients confidentiality, and that some files concern listed companies and may be inside information. The attackers have promised to contact clients. The question is who reaches them first.",
          "Halva tiden av de 72 timmarna har gått medan hotet behandlades som en bluff, och proven har visat sig vara äkta.\n\n{{person.legal.name}} påminner rummet om att ni är skyldiga klienterna konfidentialitet, och att en del filer rör börsnoterade bolag och kan vara insiderinformation. Angriparna har lovat att kontakta klienterna. Frågan är vem som når dem först."
        ], ["Because it was treated as a bluff, the attacker's deadline is close.", "Eftersom det behandlades som en bluff är angriparens tidsgräns nära."])],
        discuss: [q("Which clients would you call yourself, today?", "Vilka klienter skulle ni själva ringa i dag?", ["ceo", "legal"])],
        choice: ask(["Do you tell clients before the attacker does?", "Berättar ni för klienterna innan angriparen gör det?"], ["Tells affected clients personally, first, with what is known.", "Berättar personligen för berörda klienter, först, med det som är känt."], [
          opt(["Call every affected client, starting today", "Ring varje berörd klient, med start i dag"], "c4", ["Hard conversations. Much harder if the attacker goes first.", "Svåra samtal. Mycket svårare om angriparen hinner först."], { set: "clientsTold", pushback: [
            pb(["Not enough callers", "För få som kan ringa"], ["There are {{num.clients}} clients and only a handful of partners who know them well enough to call. At this pace it takes days, and the first calls will spread the news to the rest. Who calls whom, and who hears it last?", "Det är {{num.clients}} klienter och bara en handfull delägare som känner dem tillräckligt väl för att ringa. I den takten tar det dagar, och de första samtalen sprider nyheten till resten. Vem ringer vem, och vem får höra det sist?"]),
            pb(["Insiders on the line", "Insiders i luren"], ["For the listed companies, the call itself may trigger their duty to inform the market, and everyone on it becomes an insider. Their own lawyers ask you to wait until they are ready. Do you still call today?", "För de börsnoterade bolagen kan själva samtalet utlösa deras plikt att informera marknaden, och alla som deltar blir insiders. Deras egna jurister ber er vänta tills de är redo. Ringer ni ändå i dag?"]),
            pb(["What do you actually know?", "Vad vet ni egentligen?"], ["The first client asks the obvious questions: exactly which of my files, who has them, and what will they do? You cannot answer any of them yet. Do you keep calling with half the facts, or pause until you know more?", "Den första klienten ställer de självklara frågorna: exakt vilka av mina filer, vem har dem, och vad tänker de göra? Ni kan inte svara på någon av dem ännu. Fortsätter ni ringa med halva fakta, eller pausar ni tills ni vet mer?"])
          ] }),
          opt(["Wait and see what the attacker does", "Vänta och se vad angriparen gör"], "c4", ["Lets the attacker set the order of events.", "Låter angriparen bestämma ordningen."], { pushback: [
            pb(["“All well on your side?”", "”Allt väl hos er?”"], ["An affected client emails a partner about something else entirely and ends with: “All well on your side?” Answering “yes” is a lie; not answering is a signal. What does the partner write back?", "En berörd klient mejlar en delägare om något helt annat och avslutar med: ”Allt väl hos er?” Att svara ”ja” är en lögn; att inte svara är en signal. Vad skriver delägaren tillbaka?"]),
            pb(["Waiting is dated too", "Även väntan dateras"], ["Legal points out that your duty of confidentiality and the data protection rules do not depend on what the attacker does next. Waiting is a decision, and it will be dated. Whose name goes next to it?", "Juristen påpekar att er tystnadsplikt och dataskyddsreglerna inte beror på vad angriparen gör härnäst. Att vänta är ett beslut, och det kommer att dateras. Vems namn står bredvid det?"]),
            pb(["Partners break ranks", "Delägare går sin egen väg"], ["Two partners say they will call their key clients tonight, decision or not: they would rather lose their jobs than those relationships. Do you forbid it, or let some clients hear it and others not?", "Två delägare säger att de tänker ringa sina viktigaste klienter i kväll, beslut eller inte: hellre förlora jobbet än de relationerna. Förbjuder ni det, eller låter ni vissa klienter få veta och andra inte?"])
          ] }),
          opt(["Only clients with active deals", "Bara klienter med pågående affärer"], "c4", ["Covers the market risk, not the duty.", "Täcker marknadsrisken, inte skyldigheten."], { pushback: [
            pb(["No deal, most to lose", "Ingen affär, mest att förlora"], ["A partner points to a private client whose personal tax files and family affairs are in the stolen data. No active deal, so not on your list, yet nobody has more to lose personally. How will you explain later that they were not a priority?", "En delägare pekar på en privatklient vars personliga skattefiler och familjeangelägenheter finns bland de stulna uppgifterna. Ingen pågående affär, alltså inte med på listan, men ingen har mer att förlora personligen. Hur förklarar ni senare att klienten inte prioriterades?"]),
            pb(["Two classes of client", "Två klasser av klienter"], ["Word will spread that some clients were told and others were not. Clients talk, and many share board members. What do you say when a client learns that you called their competitor first?", "Det kommer att spridas att vissa klienter fick veta och andra inte. Klienter pratar med varandra, och många har samma styrelseledamöter. Vad säger ni när en klient får veta att ni ringde deras konkurrent först?"]),
            pb(["The rules make no exception", "Reglerna gör inga undantag"], ["Your data protection officer notes that the personal data in the other files is just as stolen. The duty to inform those affected does not lapse because no deal is pending. Which duty is your list actually meeting?", "Ert dataskyddsombud påpekar att personuppgifterna i de andra filerna är lika stulna. Skyldigheten att informera de drabbade faller inte bort för att ingen affär pågår. Vilken skyldighet uppfyller er lista egentligen?"])
          ] })
        ])
      }),

      pg("c4", ["The drip", "Droppandet"], [
        "The attackers keep their promise. Three clients receive emails containing their own confidential documents, with a short note: “Ask your advisers why we have these.”\n\nOne of the three is a family business whose owner calls {{person.ceo.name}} directly, furious, within ten minutes.",
        "Angriparna håller sitt löfte. Tre klienter får mejl med sina egna konfidentiella dokument och en kort rad: ”Fråga era rådgivare varför vi har de här.”\n\nEn av de tre är ett familjeföretag vars ägare ringer {{person.ceo.name}} direkt, rasande, inom tio minuter."
      ], {
        variants: [vr("clientsTold", [
          "The attackers keep their promise and email three clients their own confidential documents.\n\nBecause you called first, two of the three already knew what had happened. They forward the email to you as evidence and ask what they should do. The third had not been reached yet.",
          "Angriparna håller sitt löfte och mejlar tre klienter deras egna konfidentiella dokument.\n\nEftersom ni ringde först visste två av de tre redan vad som hade hänt. De vidarebefordrar mejlet till er som bevis och frågar vad de ska göra. Den tredje hade ni ännu inte nått."
        ], ["Because you told clients first, the attacker's pressure lost its surprise.", "Eftersom ni informerade klienterna först förlorade angriparens påtryckning sin överraskning."])],
        choice: ask(["Who else do you tell?", "Vem mer informerar ni?"], ["Notifies the authority and the police; extortion and a breach are both crimes and duties.", "Anmäler till myndigheten och polisen; utpressning och en incident innebär både brott och skyldigheter."], [
          opt(["Notify {{reg.dpaShort}} and report to {{reg.police}}", "Anmäl till {{reg.dpaShort}} och polisanmäl till {{reg.police}}"], "l2", ["Both duties met.", "Båda skyldigheterna uppfyllda."], { set: "notified", pushback: [
            pb(["What goes in the form?", "Vad skriver ni i anmälan?"], ["The notification asks how many people are affected and which kinds of data. You still only have an estimate. Do you file now with numbers you may have to correct, or hold it back to get them right?", "Anmälan frågar hur många personer som berörs och vilka slags uppgifter. Ni har fortfarande bara en uppskattning. Skickar ni nu med siffror ni kanske måste rätta, eller håller ni inne den för att få dem rätt?"]),
            pb(["Clients want a say", "Klienterna vill bestämma"], ["Two clients ask you not to name them in any report to an authority, fearing it becomes public. The duty to notify is yours, not theirs. Do you go against your own clients' wishes, or try to leave them out?", "Två klienter ber er att inte nämna dem i någon anmälan till en myndighet, av rädsla för att det blir offentligt. Anmälningsplikten är er, inte deras. Går ni emot era egna klienters önskan, eller försöker ni utelämna dem?"]),
            pb(["The police want the files", "Polisen vill ha filerna"], ["The police ask you not to tip off the attackers, and they want copies of the stolen client documents as evidence. Handing client files to the police is itself a confidentiality question. What do you hand over, and with whose consent?", "Polisen ber er att inte varna angriparna, och de vill ha kopior av de stulna klientdokumenten som bevis. Att lämna ut klientfiler till polisen är i sig en sekretessfråga. Vad lämnar ni ut, och med vems samtycke?"])
          ] }),
          opt(["Report to the police only", "Polisanmäl bara"], "l2", ["The breach notification is still due.", "Anmälan av personuppgiftsincidenten kvarstår."], { pushback: [
            pb(["The other clock", "Den andra klockan"], ["Your data protection officer says the deadline for the breach notification started when you confirmed the samples were real, not today. A police report does not stop it. Do you still leave it out, and how will you explain the delay?", "Ert dataskyddsombud säger att fristen för anmälan av personuppgiftsincidenten började när ni bekräftade att proven var äkta, inte i dag. En polisanmälan stoppar den inte. Låter ni ändå bli att anmäla, och hur förklarar ni dröjsmålet?"]),
            pb(["Clients can complain", "Klienterna kan klaga"], ["The three clients who received the attackers' emails can complain to the data protection authority themselves. If they do, the authority hears about your breach from someone else first. Can you live with that?", "De tre klienterna som fick angriparnas mejl kan själva klaga hos dataskyddsmyndigheten. Gör de det får myndigheten höra om er incident från någon annan först. Kan ni leva med det?"]),
            pb(["Two stories on paper", "Två versioner på papper"], ["In the police report you describe stolen client data. In your own records you have decided it is not a notifiable breach. Legal warns that the two documents will one day be read side by side. Which one is true?", "I polisanmälan beskriver ni stulna klientuppgifter. I era egna noteringar har ni bestämt att det inte är en anmälningspliktig incident. Juristen varnar för att de två dokumenten en dag kommer att läsas sida vid sida. Vilket av dem stämmer?"])
          ] }),
          opt(["Hold off until the scope is known", "Vänta tills omfattningen är känd"], "l2", ["The 72 hours don't wait.", "De 72 timmarna väntar inte."], { pushback: [
            pb(["Scope may never be final", "Omfattningen blir kanske aldrig klar"], ["The forensics firm says a final scope is weeks away, if it is possible at all. The rules expect you to report what you know and update later. What exactly are you waiting for, and when will you have it?", "Forensikfirman säger att en slutlig avgränsning ligger veckor bort, om den ens går att få. Reglerna förutsätter att ni anmäler det ni vet och kompletterar senare. Vad är det exakt ni väntar på, och när har ni det?"]),
            pb(["“Have you reported it?”", "”Har ni anmält det?”"], ["One of the three clients who received the attackers' email asks a direct question: have you reported this to anyone? Saying “not yet” to a client who is already a victim is hard. What do you tell them?", "En av de tre klienterna som fick angriparnas mejl ställer en rak fråga: har ni anmält det här till någon? Att säga ”inte än” till en klient som redan är drabbad är svårt. Vad säger ni?"]),
            pb(["Whose timetable?", "Vems tidsplan?"], ["The attackers are contacting your clients right now. Your security lead argues the police might act against the attackers' accounts, but only if told now. Is holding off protecting the firm, or the attackers' timetable?", "Angriparna kontaktar era klienter just nu. Er säkerhetschef menar att polisen kanske kan agera mot angriparnas konton, men bara om de får veta nu. Skyddar väntan byrån, eller angriparnas tidsplan?"])
          ] })
        ])
      }),

      pg("l2", ["The insurer", "Försäkringsbolaget"], [
        "{{person.legal.name}} checks the cyber insurance policy. It covers extortion costs and legal fees, but only if you use the insurer's own negotiator and notify the insurer within 48 hours.\n\nThe insurer's involvement brings expertise, but also another party in the room, with its own interests.",
        "{{person.legal.name}} går igenom cyberförsäkringen. Den täcker kostnader för utpressning och juridiska avgifter, men bara om ni använder försäkringsbolagets egen förhandlare och anmäler till försäkringsbolaget inom 48 timmar.\n\nFörsäkringsbolagets medverkan ger expertis, men också ytterligare en part i rummet, med egna intressen."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["Do you bring the insurer in?", "Tar ni in försäkringsbolaget?"], ["Follows the policy's terms and gets expert help.", "Följer försäkringsvillkoren och får experthjälp."], [
          opt(["Notify the insurer and use their negotiator", "Anmäl till försäkringsbolaget och använd deras förhandlare"], "c5", ["Expertise and cover.", "Expertis och försäkringsskydd."], { pushback: [
            pb(["Whose interests?", "Vems intressen?"], ["The insurer's negotiator works for the insurer, whose brief is to limit the claim. A quick, cheap outcome may suit them better than your clients. Who in the room makes sure your clients' interests come first?", "Försäkringsbolagets förhandlare arbetar för försäkringsbolaget, vars uppdrag är att begränsa skadan. Ett snabbt, billigt utfall kan passa dem bättre än era klienter. Vem i rummet ser till att klienternas intressen kommer först?"]),
            pb(["Another party sees the files", "Ännu en part ser filerna"], ["The insurer asks for the samples and the list of affected clients to assess the claim. That is more confidential information leaving the firm. Do you share it, and what do you tell clients about who now knows?", "Försäkringsbolaget begär proven och listan över berörda klienter för att bedöma skadan. Det är ännu mer konfidentiell information som lämnar byrån. Delar ni den, och vad säger ni till klienterna om vilka som nu vet?"]),
            pb(["Their plan or yours?", "Deras plan eller er?"], ["The negotiator wants all contact with the attackers to go through them and asks you to make no public statement until they have spoken to them. Your own plans for clients are already in motion. Whose plan wins?", "Förhandlaren vill att all kontakt med angriparna ska gå via förhandlaren, och ber er att inte uttala er offentligt förrän den kontakten är tagen. Era egna planer för klienterna är redan i gång. Vems plan gäller?"])
          ] }),
          opt(["Handle it yourselves", "Hantera det själva"], "c5", ["Control, without experience.", "Kontroll, utan erfarenhet."], { pushback: [
            pb(["Giving up the cover", "Att avstå skyddet"], ["Finance points out that without the insurer's negotiator you lose cover for extortion costs and legal fees, and the legal fees alone could be large. Who approved giving that up, and will the board agree?", "Ekonomichefen påpekar att ni förlorar ersättningen för utpressningskostnader och juridiska avgifter utan försäkringsbolagets förhandlare, och bara de juridiska kostnaderna kan bli stora. Vem godkände att ni avstår, och håller styrelsen med?"]),
            pb(["Nobody has done this", "Ingen har gjort det här"], ["Nobody in the firm has ever dealt with extortionists. Their next message will be read by people learning as they go. Who speaks for the firm, and what must they never say?", "Ingen på byrån har någonsin hanterat utpressare. Deras nästa meddelande kommer att läsas av personer som lär sig under tiden. Vem talar för byrån, och vad får den personen aldrig säga?"]),
            pb(["Notify, then refuse?", "Anmäla, och sedan tacka nej?"], ["Legal advises notifying the insurer within 48 hours anyway, to keep the rest of the policy alive. That invites their negotiator in. Do you notify and turn down their help, or not notify at all?", "Juristen råder er att ändå anmäla till försäkringsbolaget inom 48 timmar, så att resten av försäkringen gäller. Det bjuder in deras förhandlare. Anmäler ni och tackar nej till hjälpen, eller anmäler ni inte alls?"])
          ] })
        ])
      }),

      pg("c5", ["The price", "Priset"], [
        "The attackers name their price: {{num.demand|currency}}, for what they call “permanent deletion and silence”.\n\nThey promise to delete every copy and never contact your clients again. There is no way to check whether they keep that promise, and paying criminals may also have legal consequences.",
        "Angriparna nämner sitt pris: {{num.demand|currency}}, för det de kallar ”permanent radering och tystnad”.\n\nDe lovar att radera varje kopia och aldrig kontakta era klienter igen. Det finns inget sätt att kontrollera om de håller det löftet, och att betala kriminella kan också få rättsliga följder."
      ], {
        discuss: [q("What would paying actually buy you?", "Vad skulle en betalning faktiskt ge er?", ["ceo", "legal"])],
        choice: ask(["Do you pay?", "Betalar ni?"], ["Recognises that without encryption, payment buys only a promise.", "Inser att utan kryptering köper en betalning bara ett löfte."], [
          opt(["Refuse to pay", "Vägra betala"], "l3", ["The data is out either way.", "Uppgifterna är ute oavsett."], { set: "refused", pushback: [
            pb(["A partner wants to pay", "En delägare vill betala"], ["The partner whose largest client has the most files in the stolen data asks for a vote. Refusing, they say, is principled for the firm and ruinous for their client. How do you hold the line when partners disagree?", "Delägaren vars största klient har flest filer bland de stulna uppgifterna begär en omröstning. Att vägra är principfast för byrån, säger delägaren, och förödande för klienten. Hur håller ni linjen när delägarna är oense?"]),
            pb(["A client offers to pay", "En klient erbjuder sig att betala"], ["A wealthy client says: if you won't pay, I will pay my share to protect my own files. Can you stop them, should you, and what happens to the firm if a client buys the silence you refused to buy?", "En förmögen klient säger: om ni inte betalar, betalar jag min del för att skydda mina egna filer. Kan ni stoppa det, bör ni, och vad händer med byrån om en klient köper den tystnad ni vägrade köpa?"]),
            pb(["How do you say no?", "Hur säger ni nej?"], ["The attackers want an answer. A clear “no” may provoke them; silence may too. Your security lead asks: do you tell them you refuse, or simply stop replying, and what do you tell clients either way?", "Angriparna vill ha ett svar. Ett tydligt ”nej” kan provocera dem; tystnad kan också göra det. Er säkerhetschef frågar: säger ni att ni vägrar, eller slutar ni bara svara, och vad säger ni till klienterna i båda fallen?"])
          ] }),
          opt(["Negotiate for proof of deletion", "Förhandla om bevis på radering"], "c5b", ["There is no such proof.", "Något sådant bevis finns inte."], { pushback: [
            pb(["What proof could exist?", "Vilket bevis kan finnas?"], ["Your forensics firm says there is no technical way to prove that copies on someone else's computers are gone. Whatever they offer, you will be judging a performance. What would actually convince you?", "Er forensikfirma säger att det inte finns något tekniskt sätt att bevisa att kopior på någon annans datorer är borta. Vad de än erbjuder kommer ni att bedöma en föreställning. Vad skulle egentligen övertyga er?"]),
            pb(["Haggling is a signal", "Köpslående är en signal"], ["To the attackers, haggling over proof means you are willing to pay, just not yet at this price. Legal warns that the next message may raise the stakes. Are you negotiating or stalling, and can the attackers tell the difference?", "För angriparna betyder köpslående om bevis att ni är villiga att betala, bara inte till det här priset ännu. Juristen varnar för att nästa meddelande kan höja insatsen. Förhandlar ni eller förhalar ni, och ser angriparna skillnaden?"]),
            pb(["Silence towards clients", "Tystnad mot klienterna"], ["While talks run, partners are told to say nothing to clients about payment. One partner refuses to mislead a client about what the firm is doing. How do you keep negotiations quiet without lying to the people whose files are at stake?", "Medan förhandlingarna pågår får delägarna besked att inte säga något till klienterna om betalning. En delägare vägrar vilseleda sin klient om vad byrån gör. Hur håller ni förhandlingarna tysta utan att ljuga för dem vars filer det gäller?"])
          ] }),
          opt(["Pay quietly to keep it out of the news", "Betala i tysthet för att hålla det borta från nyheterna"], "l3", ["You fund the next attack and keep no guarantee.", "Ni finansierar nästa angrepp och får ingen garanti."], { set: "paid", pushback: [
            pb(["Is it even lawful?", "Är det ens lagligt?"], ["Legal cannot rule out that the attackers are under sanctions or that paying them breaks money-laundering rules. Nobody can say who the money goes to. Who signs the payment, and will they answer for it personally?", "Juristen kan inte utesluta att angriparna omfattas av sanktioner eller att en betalning bryter mot penningtvättsreglerna. Ingen kan säga vem pengarna går till. Vem skriver under betalningen, och är den personen beredd att stå för den personligen?"]),
            pb(["Quiet is not possible", "Tyst går inte"], ["Moving {{num.demand|currency}} out of the firm means the bank, the auditors and the finance team all see it. Several people will know a payment was made. How long do you think it stays quiet?", "Att flytta {{num.demand|currency}} ut ur byrån innebär att banken, revisorerna och ekonomiavdelningen ser det. Flera personer kommer att veta att en betalning gjorts. Hur länge tror ni att det förblir tyst?"]),
            pb(["What are you buying?", "Vad köper ni?"], ["The promise is “permanent deletion and silence”. Nothing stops them selling the same files elsewhere, or asking again next month. If they come back, do you pay again, and if not, what did the first payment buy?", "Löftet är ”permanent radering och tystnad”. Ingenting hindrar dem från att sälja samma filer till någon annan, eller kräva igen nästa månad. Om de kommer tillbaka, betalar ni igen, och om inte, vad köpte då den första betalningen?"])
          ] }),
          opt(["Break off the contact you opened with the extortionists this morning", "Bryt kontakten som ni inledde med utpressarna i morse"], "l3", ["Reverses the channel you opened; they may publish sooner to make a point.", "Upphäver kanalen ni öppnade; de kan publicera tidigare för att markera."], { requires: "engaged", set: "contactBroken", effects: { media: 1 }, pushback: [
            pb(["The last message", "Det sista meddelandet"], ["Your security lead asks whether you simply go silent or send a final message. Silence may look like weakness or a trick; a final message is something they can publish. What, if anything, do you send?", "Er säkerhetschef frågar om ni bara tystnar eller skickar ett sista meddelande. Tystnad kan se ut som svaghet eller ett trick; ett sista meddelande är något de kan publicera. Vad skickar ni, om något?"]),
            pb(["We started this", "Det var vi som började"], ["A partner points out that the firm opened this channel only this morning. Breaking it off now looks like a panicked reversal, and the attackers may take it personally. Was opening it the mistake, or is closing it?", "En delägare påpekar att det var byrån som öppnade kanalen så sent som i morse. Att bryta den nu ser ut som en panikartad helomvändning, och angriparna kan ta det personligt. Var det misstaget att öppna den, eller är det att stänga den?"]),
            pb(["No more warnings", "Inga fler förvarningar"], ["While the channel was open, you at least heard what they planned next. Without it, you will learn their next step from clients or the press. How will you know what is coming, and who is watching for it?", "Så länge kanalen var öppen fick ni åtminstone höra vad de planerade härnäst. Utan den får ni veta deras nästa steg från klienterna eller pressen. Hur ska ni veta vad som kommer, och vem håller utkik?"])
          ] })
        ])
      }),

      pg("c5b", ["Proof of deletion", "Bevis på radering"], [
        "The negotiator asks for proof that the files will really be deleted. The attackers offer a video showing the files being deleted from a server.\n\nThe negotiator's view is blunt: a video proves only that one copy was deleted on camera. It says nothing about the other copies they almost certainly have.",
        "Förhandlaren ber om bevis för att filerna verkligen raderas. Angriparna erbjuder en video där filerna raderas från en server.\n\nFörhandlarens bedömning är rak: en video bevisar bara att en kopia raderades framför kameran. Den säger ingenting om de andra kopior som de nästan säkert har."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Stops paying for theatre.", "Slutar betala för teater."], [
          opt(["Stop negotiating", "Sluta förhandla"], "l3", ["Accepts reality.", "Accepterar verkligheten."], { set: "refused", pushback: [
            pb(["The pause ends", "Pausen tar slut"], ["The negotiator notes that the attackers held back while talks ran. Stopping now ends that pause, and not every affected client has heard from you yet. Do you stop now, or keep talking a little longer to buy time?", "Förhandlaren konstaterar att angriparna höll sig tillbaka medan samtalen pågick. Att sluta nu avslutar den pausen, och alla berörda klienter har ännu inte hört av er. Slutar ni nu, eller fortsätter ni prata lite till för att vinna tid?"]),
            pb(["Minute my objection", "Protokollför min invändning"], ["The partner who argued for negotiating says you are walking away from the only lever you had. If files appear tomorrow, they want it minuted that they disagreed. Do you minute it, and does it change your mind?", "Delägaren som drev på för förhandlingar säger att ni går ifrån den enda hävstång ni hade. Om filer dyker upp i morgon vill delägaren ha det protokollfört att hen var emot. Protokollför ni det, och ändrar det ert beslut?"]),
            pb(["Why talk at all?", "Varför förhandla alls?"], ["Clients will ask why you negotiated at all if you never meant to pay. Legal warns that “we were exploring proof of deletion” sounds like you were ready to pay. How do you explain the talks now that you have stopped?", "Klienterna kommer att fråga varför ni förhandlade överhuvudtaget om ni aldrig tänkte betala. Juristen varnar för att ”vi undersökte bevis på radering” låter som att ni var beredda att betala. Hur förklarar ni förhandlingarna nu när ni har slutat?"])
          ] }),
          opt(["Pay for the video", "Betala för videon"], "l3", ["A very expensive video.", "En mycket dyr video."], { set: "paid", pushback: [
            pb(["Against expert advice", "Mot expertråd"], ["Your own negotiator has said the video proves nothing about other copies, and now asks for that advice to be on record. If you pay, it is against written expert advice. Who takes responsibility for overruling it?", "Er egen förhandlare har sagt att videon inte bevisar något om andra kopior, och vill nu ha det rådet dokumenterat. Om ni betalar sker det mot skriftliga expertråd. Vem tar ansvar för att gå emot dem?"]),
            pb(["The bank calls", "Banken ringer"], ["The bank's compliance desk calls about an unusual outgoing transfer and asks what it is for. “A video” is not an answer they will accept. What do you tell your own bank?", "Bankens complianceavdelning ringer om en ovanlig utgående överföring och frågar vad den gäller. ”En video” är inget svar de godtar. Vad säger ni till er egen bank?"]),
            pb(["In the clients' name", "I klienternas namn"], ["You are spending the firm's money to protect client files without asking a single client. Some would rather you did not pay criminals in their name. Do you ask them first, and what if they say no?", "Ni lägger byråns pengar på att skydda klientfiler utan att fråga en enda klient. En del hade hellre sett att ni inte betalade kriminella i deras namn. Frågar ni dem först, och vad gör ni om de säger nej?"])
          ] })
        ])
      }),

      pg("l3", ["A client's lawyer", "En klients advokat"], [
        "A letter arrives from the lawyers of your largest client. They reserve the right to claim damages for breach of confidentiality.\n\nThey also ask for a meeting within the week, and a full account of what was taken and what you have done since.",
        "Ett brev kommer från juristerna för er största klient. De förbehåller sig rätten att kräva skadestånd för brott mot konfidentialiteten.\n\nDe begär också ett möte inom en vecka och en fullständig redogörelse för vad som togs och vad ni har gjort sedan dess."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Meets the client openly; transparency limits the claim more than silence.", "Möter klienten öppet; öppenhet begränsar kravet mer än tystnad."], [
          opt(["Meet them with a full account", "Träffa dem med en fullständig redogörelse"], "c6", ["Uncomfortable, and it keeps the relationship alive.", "Obekvämt, och det håller relationen vid liv."], { pushback: [
            pb(["Evidence for their claim", "Bevis för deras krav"], ["Outside counsel warns that a full account to a client threatening damages becomes evidence in their claim. Everything about the contractor account will be quoted back. Do you tell them everything, or a version your lawyers can live with?", "Er externa advokat varnar för att en fullständig redogörelse till en klient som hotar med skadestånd blir bevis i deras krav. Allt om konsultkontot kommer att citeras tillbaka. Berättar ni allt, eller en version som juristerna kan leva med?"]),
            pb(["Everyone will want one", "Alla kommer att vilja ha en"], ["If your largest client gets a full account in person, every other client will ask for the same, and you cannot hold {{num.clients}} meetings. Do you treat the largest client differently, and how do you defend that?", "Om er största klient får en fullständig redogörelse på ett möte kommer alla andra klienter att begära samma sak, och ni kan inte hålla {{num.clients}} möten. Behandlar ni den största klienten annorlunda, och hur försvarar ni det?"]),
            pb(["Full, with gaps", "Fullständig, med luckor"], ["The forensic work is not finished. A full account this week means saying “we don't know” about some of what the client cares about most. Do you meet them now with gaps, or ask for more time and look evasive?", "Forensikarbetet är inte klart. En fullständig redogörelse den här veckan innebär att säga ”vi vet inte” om en del av det klienten bryr sig mest om. Möter ni dem nu med luckor, eller ber ni om mer tid och ser undanglidande ut?"])
          ] }),
          opt(["Refer them to your insurer", "Hänvisa dem till ert försäkringsbolag"], "c6", ["Correct on paper, cold in practice.", "Korrekt på papperet, kallt i praktiken."], { pushback: [
            pb(["They wanted their advisers", "De ville träffa sina rådgivare"], ["The client's general counsel replies within the hour: they asked to meet their advisers, not a claims handler, and are now considering moving all their work. Do you call them back yourselves, and say what?", "Klientens chefsjurist svarar inom en timme: de bad om att träffa sina rådgivare, inte en skadehandläggare, och överväger nu att flytta alla sina uppdrag. Ringer ni upp dem själva, och vad säger ni?"]),
            pb(["The insurer declines", "Försäkringsbolaget tackar nej"], ["The insurer says it handles claims against you, not your client relationships, and will not take the meeting. A few days later the letter is back on your desk. Who meets them now, and what has the delay cost?", "Försäkringsbolaget säger att de hanterar krav mot er, inte era klientrelationer, och tackar nej till mötet. Några dagar senare ligger brevet på ert bord igen. Vem träffar dem nu, och vad har dröjsmålet kostat?"]),
            pb(["The relationship partner", "Den ansvariga delägaren"], ["The partner who has managed this client for fifteen years refuses to send them to an insurer and says they will meet the client alone if necessary. Do you hold the line and risk a partner going rogue, or give way?", "Delägaren som har haft hand om klienten i femton år vägrar hänvisa dem till ett försäkringsbolag och säger sig vara beredd att träffa klienten ensam om det behövs. Håller ni linjen och riskerar att delägaren går sin egen väg, eller ger ni efter?"])
          ] })
        ])
      }),

      pg("c6", ["The leak site", "Läcksajten"], [
        "{{org.name}} appears on the attackers' leak site, with a countdown to full publication.\n\nThe first sample is already public: a complete tax file for a well-known family business, with names and figures. A business news site has picked it up within the hour.",
        "{{org.name}} dyker upp på angriparnas läcksajt, med en nedräkning till fullständig publicering.\n\nDet första provet är redan offentligt: en komplett skatteakt för ett känt familjeföretag, med namn och siffror. En ekonominyhetssajt har plockat upp det inom en timme."
      ], {
        variants: [vr("paid", [
          "You paid. And {{org.name}} still appears on the attackers' leak site, marked “partial data, more available”.\n\nThe listing also mentions that you paid. A business news site picks it up within the hour, and the headline is about the payment as much as the leak.",
          "Ni betalade. Och {{org.name}} finns ändå på angriparnas läcksajt, märkt ”delvis data, mer finns”.\n\nAnnonsen nämner också att ni betalade. En ekonominyhetssajt plockar upp det inom en timme, och rubriken handlar lika mycket om betalningen som om läckan."
        ], ["Because you paid, they know you will pay again.", "Eftersom ni betalade vet de att ni betalar igen."])],
        injects: [
          inj("b6-3", 4320, "newsHeadline", "media", "high", "confirmed", [
            "Advisory firm {{org.name}} named on extortion site; client tax files published.",
            "Rådgivningsföretaget {{org.name}} utpekat på utpressningssajt; klienters skattefiler publicerade."
          ], { headline: ["Business news", "Ekonominyheter"], tests: ["lo2"] })
        ],
        choice: ask(["What do you do?", "Vad gör ni?"], ["Speaks publicly with care for clients, and uses lawful means against the site.", "Uttalar sig offentligt med omsorg om klienterna, och använder lagliga medel mot sajten."], [
          opt(["A short statement with guidance for clients", "Ett kort uttalande med vägledning för klienterna"], "c7", ["Shows you are in control of what you can control.", "Visar att ni har kontroll över det ni kan kontrollera."], { pushback: [
            pb(["Guidance means detail", "Vägledning kräver detaljer"], ["To guide clients, the statement must say what was taken. Saying “tax files” confirms the published sample is real and tells journalists what to look for. How much do you say, and what do you leave out?", "För att vägleda klienterna måste uttalandet säga vad som togs. Att skriva ”skattefiler” bekräftar att det publicerade provet är äkta och talar om för journalister vad de ska leta efter. Hur mycket säger ni, och vad utelämnar ni?"]),
            pb(["The family asks you to wait", "Familjen ber er vänta"], ["The family business whose tax file was published asks you not to mention them in any way, and to issue nothing until they have seen it. The press wants a statement within the hour. Do you wait for them?", "Familjeföretaget vars skatteakt publicerades ber er att inte nämna dem på något sätt och inte gå ut med något förrän de har sett det. Pressen vill ha ett uttalande inom en timme. Väntar ni på dem?"]),
            pb(["The follow-up questions", "Följdfrågorna"], ["Journalists answer your statement with questions: how did they get in, did you pay, how many clients? A short statement invites them all. Who answers the follow-ups, and what is your line on payment?", "Journalisterna svarar på ert uttalande med frågor: hur kom de in, betalade ni, hur många klienter? Ett kort uttalande bjuder in dem alla. Vem svarar på följdfrågorna, och vad är er linje om betalning?"])
          ] }),
          opt(["No comment", "Ingen kommentar"], "c7", ["The leak site does the talking.", "Läcksajten talar i stället."], { pushback: [
            pb(["Partners with nothing to say", "Delägare utan något att säga"], ["Clients are learning from a business news site that their files may be public. They call their partners, who have nothing they are allowed to say. What do the partners tell clients today?", "Klienterna får veta från en ekonominyhetssajt att deras filer kan vara offentliga. De ringer sina delägare, som inte har något de får säga. Vad säger delägarna till klienterna i dag?"]),
            pb(["Silence becomes the story", "Tystnaden blir nyheten"], ["The news site's follow-up runs with “firm refuses to comment as client files leak” and quotes an anonymous employee. Your silence is now the story. Do you keep it, or speak now from a weaker position?", "Nyhetssajtens uppföljning har rubriken ”byrån vägrar kommentera när klientfiler läcker” och citerar en anonym anställd. Er tystnad är nu nyheten. Håller ni fast vid den, eller uttalar ni er nu från ett sämre läge?"]),
            pb(["A client speaks instead", "En klient talar i stället"], ["The family business whose tax file was published issues its own statement: they were let down by their advisers, who still say nothing. Now there is a public version of events, and it is theirs. Do you answer it?", "Familjeföretaget vars skatteakt publicerades går ut med ett eget uttalande: de har svikits av sina rådgivare, som fortfarande inte säger något. Nu finns en offentlig version av händelserna, och den är deras. Svarar ni på den?"])
          ] }),
          opt(["Seek takedowns of mirrors through hosts and the courts", "Begär nedtagning av speglar via värdar och domstolar"], "c7", ["Lawful and slow; reduces spread a little.", "Lagligt och långsamt; minskar spridningen något."], { pushback: [
            pb(["Weeks, not hours", "Veckor, inte timmar"], ["Your lawyers say a court order will take weeks, and the hosts sit in jurisdictions that rarely respond. Meanwhile the countdown keeps running. What do you do before an order arrives, and is the cost worth it?", "Era jurister säger att ett domstolsbeslut tar veckor, och värdarna finns i jurisdiktioner som sällan svarar. Under tiden fortsätter nedräkningen. Vad gör ni innan ett beslut kommer, och är kostnaden värd det?"]),
            pb(["Court papers are public", "Domstolshandlingar är offentliga"], ["Going to court means public papers that name the firm, describe the leak and may list what was taken. You would be documenting the breach for anyone to read. Do you still file, and how do you protect clients' names?", "Att gå till domstol innebär offentliga handlingar som namnger byrån, beskriver läckan och kanske listar vad som togs. Ni skulle dokumentera intrånget så att vem som helst kan läsa. Lämnar ni ändå in, och hur skyddar ni klienternas namn?"]),
            pb(["Invisible to the client", "Osynligt för klienten"], ["The family business whose file was published says takedown requests are not enough: they want to know what you are doing about the next files. Legal steps are slow and invisible to them. What do you offer them today?", "Familjeföretaget vars skatteakt publicerades säger att begäranden om nedtagning inte räcker: de vill veta vad ni gör åt nästa filer. Rättsliga steg är långsamma och osynliga för dem. Vad erbjuder ni dem i dag?"])
          ] }),
          opt(["Pay a “consultant” who promises to take the site down", "Betala en ”konsult” som lovar att ta ned sajten"], "x1", ["Who exactly is this consultant?", "Vem är egentligen den här konsulten?"], { pushback: [
            pb(["How would it work?", "Hur skulle det gå till?"], ["Nobody in the firm can say who this consultant is, or how a site run by criminals comes down quickly by lawful means. Your security lead asks: if it works, how did it work? Are you prepared to fund something you cannot describe?", "Ingen på byrån kan säga vem den här konsulten är, eller hur en sajt som drivs av kriminella tas ned snabbt med lagliga medel. Er säkerhetschef frågar: om det fungerar, hur gick det till? Är ni beredda att finansiera något ni inte kan beskriva?"]),
            pb(["The payment will be read", "Betalningen kommer att granskas"], ["Every payment the firm makes this month will be examined by auditors, and perhaps by the financial supervisor. A fee to an unnamed fixer will need explaining. Can you write down what this payment was for?", "Varje betalning byrån gör den här månaden kommer att granskas av revisorer, och kanske av tillsynsmyndigheten. Ett arvode till en namnlös fixare måste förklaras. Kan ni skriva ned vad betalningen gällde?"]),
            pb(["Legal steps away", "Juristen kliver av"], ["Your general counsel refuses to be part of this decision and asks for that to be minuted. Without legal, you are acting on the word of a stranger. Do you go ahead without your own counsel?", "Er chefsjurist vägrar vara del av beslutet och ber att det protokollförs. Utan juristen agerar ni på en främlings ord. Går ni vidare utan er egen juridiska rådgivare?"])
          ] })
        ])
      }),

      pg("c7", ["Staff", "Personalen"], [
        "The firm's staff have seen the news. They are asking questions in corridors and chats: is my work affected, what can I tell my clients, can I trade shares?\n\nSome of them work on the affected deals and know exactly which documents are now in criminal hands.",
        "Byråns personal har sett nyheterna. De ställer frågor i korridorer och chattar: berörs mitt arbete, vad får jag säga till mina klienter, får jag handla aktier?\n\nEn del av dem arbetar med de berörda affärerna och vet exakt vilka dokument som nu finns i kriminella händer."
      ], {
        choice: ask(["What do you tell staff?", "Vad säger ni till personalen?"], ["Briefs staff, sets trading restrictions and a legal hold.", "Informerar personalen, inför handelsrestriktioner och bevarandeplikt."], [
          opt(["Brief everyone, restrict trading, preserve documents", "Informera alla, begränsa handel, bevara dokument"], "l4", ["Protects staff and clients.", "Skyddar personal och klienter."], { pushback: [
            pb(["A journalist calls", "En journalist ringer"], ["An hour after the all-staff briefing, a journalist calls asking about “the meeting you held this morning”. Telling everyone means telling the press. Do you brief in smaller groups from now on, and what do you say about the leak?", "En timme efter genomgången för all personal ringer en journalist och frågar om ”mötet ni höll i morse”. Att informera alla är att informera pressen. Informerar ni i mindre grupper framöver, och vad säger ni om läckan?"]),
            pb(["How wide is the ban?", "Hur brett är förbudet?"], ["Staff ask whether the trading restriction covers their pensions, their partners' accounts, and shares in clients they have never worked for. HR says a broad ban may not be enforceable. How wide is it, and who polices it?", "Personalen frågar om handelsrestriktionen gäller deras pensionssparande, deras partners konton och aktier i klienter de aldrig har arbetat med. HR säger att ett brett förbud kanske inte går att genomdriva. Hur brett är det, och vem kontrollerar det?"]),
            pb(["Keep or clean up?", "Bevara eller rensa?"], ["The legal hold means nobody may delete anything. But IT had planned to purge stray copies of client files from old laptops and shares to reduce exposure. Which comes first: preserving evidence, or cutting the risk of a second theft?", "Bevarandeplikten innebär att ingen får radera något. Men IT hade planerat att rensa bort lösa kopior av klientfiler från gamla datorer och utdelningar för att minska exponeringen. Vad går först: att bevara bevis, eller att minska risken för en andra stöld?"])
          ] }),
          opt(["Need-to-know only", "Bara de som behöver veta"], "l4", ["Rumours spread anyway.", "Rykten sprids ändå."], { pushback: [
            pb(["“Nobody said I couldn't”", "”Ingen sa att jag inte fick”"], ["An associate asks HR whether, since nobody has said otherwise, they may buy shares in a listed client mentioned in the news. Without a firm-wide rule, the honest answer is “probably”. Do you widen the restriction now, admitting need-to-know was too narrow?", "En biträdande jurist frågar HR om det, eftersom ingen har sagt något annat, går bra att köpa aktier i en börsnoterad klient som nämns i nyheterna. Utan en regel för hela byrån är det ärliga svaret ”förmodligen”. Vidgar ni restriktionen nu, och erkänner att behovsprincipen var för snäv?"]),
            pb(["The chat thread", "Chattråden"], ["An internal chat thread called “are we hacked?” has a hundred messages, half of them guesses, some naming clients. Need-to-know has created a vacuum, and rumour has filled it. Do you shut the thread down, or finally tell people what is true?", "En intern chattråd som heter ”är vi hackade?” har hundra meddelanden, hälften gissningar, några med klientnamn. Behovsprincipen har skapat ett tomrum, och rykten har fyllt det. Stänger ni tråden, eller berättar ni äntligen vad som är sant?"]),
            pb(["Who needs to know?", "Vem behöver veta?"], ["Partners disagree on who needs to know: some have briefed their whole teams, others nobody. Staff working for the same client are hearing different stories. Who draws the line, and how do you enforce it after the fact?", "Delägarna är oense om vilka som behöver veta: en del har informerat hela sina team, andra ingen. Medarbetare som arbetar för samma klient hör olika versioner. Vem drar gränsen, och hur upprätthåller ni den i efterhand?"])
          ] })
        ])
      }),

      pg("l4", ["The market moves", "Marknaden rör sig"], [
        "Shares in one of your listed clients rise eleven percent in an afternoon, on rumours of a takeover bid.\n\nThe bid is real, and the documents describing it were in the leaked deal room. Someone may be trading on what was stolen from you.",
        "Aktien i en av era börsnoterade klienter stiger elva procent på en eftermiddag, på rykten om ett uppköpserbjudande.\n\nBudet är verkligt, och dokumenten som beskriver det fanns i det läckta datarummet. Någon kanske handlar på det som stals från er."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you do?", "Vad gör ni?"], ["Informs the client so they can meet their own disclosure duties.", "Informerar klienten så att de kan uppfylla sin egen informationsplikt."], [
          opt(["Inform the client immediately", "Informera klienten omedelbart"], "c8", ["They may need to disclose the bid.", "De kan behöva offentliggöra budet."], { pushback: [
            pb(["The insider list", "Insiderförteckningen"], ["Telling the client their deal documents leaked means passing on inside information, and everyone on the call joins the insider list. Compliance asks who exactly makes the call. Who, and what do they say?", "Att berätta för klienten att affärsdokumenten har läckt innebär att ni förmedlar insiderinformation, och alla i samtalet hamnar på insiderförteckningen. Compliance frågar vem exakt som ringer. Vem, och vad säger den personen?"]),
            pb(["They may lose the deal", "De kan förlora affären"], ["Your partner on the deal warns that the client may have to disclose the bid early, at a moment they did not choose, and could lose the deal. They will remember who lost the documents. Do you still call?", "Er delägare i affären varnar för att klienten kan behöva offentliggöra budet i förtid, vid en tidpunkt de inte valt, och kanske förlorar affären. De kommer att minnas vem som tappade dokumenten. Ringer ni ändå?"]),
            pb(["Proof is thin", "Beläggen är tunna"], ["You cannot prove the share rise comes from your stolen files; the leak could be at the bidder or its bank. Telling the client it was you may concede something you do not know. Do you call with a certainty you don't have?", "Ni kan inte bevisa att kursuppgången beror på era stulna filer; läckan kan lika gärna finnas hos budgivaren eller dess bank. Att säga till klienten att det var ni kan innebära att ni medger något ni inte vet. Ringer ni med en säkerhet ni inte har?"])
          ] }),
          opt(["Not your concern", "Inte er sak"], "c8", ["It is very much your concern.", "Det är i högsta grad er sak."], { pushback: [
            pb(["The client calls you", "Klienten ringer er"], ["The client's finance director calls to ask whether the rumour has anything to do with the leak in the news. Your partner on the deal has been told to say nothing. What does the partner say, and how will it sound later?", "Klientens finanschef ringer och frågar om ryktet har något med läckan i nyheterna att göra. Er delägare i affären har fått besked att inte säga något. Vad säger delägaren, och hur kommer det att låta i efterhand?"]),
            pb(["The trail leads back", "Spåret leder tillbaka"], ["Compliance notes that market regulators examine unusual trading before bids, and the trail may lead to your stolen deal room. If you said nothing, you will be asked why. Is “not our concern” an answer you can give a regulator?", "Compliance påpekar att marknadstillsynen granskar ovanlig handel inför bud, och spåret kan leda till ert stulna datarum. Om ni inte sa något kommer ni att få frågan varför. Är ”inte vår sak” ett svar ni kan ge en tillsynsmyndighet?"]),
            pb(["Two more deal rooms", "Två datarum till"], ["There were three active deal rooms in the stolen data. If one is moving the market, the other two clients face the same risk. Does “not our concern” also mean not warning them?", "Det fanns tre aktiva datarum bland de stulna uppgifterna. Om ett av dem rör marknaden löper de två andra klienterna samma risk. Betyder ”inte vår sak” också att ni inte varnar dem?"])
          ] })
        ])
      }),

      pg("c8", ["The supervisor", "Tillsynen"], [
        "The financial supervisor writes. It wants a written account of the incident, your security controls, and how and when clients were informed.\n\nIt sets a deadline of two weeks. The answer will decide whether this becomes a formal investigation.",
        "Tillsynsmyndigheten för finansmarknaden skriver. Den vill ha en skriftlig redogörelse för incidenten, era säkerhetskontroller och hur och när klienterna informerades.\n\nDen sätter en tidsfrist på två veckor. Svaret avgör om det här blir en formell utredning."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Gives a complete, documented account including weaknesses.", "Ger en fullständig, dokumenterad redogörelse inklusive svagheter."], [
          opt(["A full account with the contractor weakness", "En fullständig redogörelse med konsultsvagheten"], "c9", ["Builds credibility with the supervisor.", "Bygger trovärdighet hos tillsynen."], { pushback: [
            pb(["Handing them their case", "Att ge dem deras sak"], ["Outside counsel warns that the account will reach clients considering claims: admitting the contractor account was left open without MFA hands them their case. Do you still write it that plainly?", "Er externa advokat varnar för att redogörelsen kommer att nå klienter som överväger krav: att medge att konsultkontot lämnades öppet utan MFA ger dem deras sak. Skriver ni det ändå så rakt?"]),
            pb(["The contractor disputes it", "Konsulten bestrider"], ["The contractor firm reads a draft and objects to being named as the weakness: their contract had ended and you never asked them to close anything. Do you change the wording, or let them dispute it with the supervisor?", "Konsultfirman läser ett utkast och protesterar mot att pekas ut som svagheten: avtalet hade upphört och ni bad dem aldrig stänga något. Ändrar ni formuleringen, eller låter ni dem bestrida det inför tillsynen?"]),
            pb(["Gaps in your timeline", "Luckor i tidslinjen"], ["Drafting it, you find gaps: nobody recorded exactly when each client was told, or why some heard later than others. That is precisely what the supervisor asked for. Do you reconstruct it as best you can, or admit you don't know?", "När ni skriver upptäcker ni luckor: ingen antecknade exakt när varje klient informerades, eller varför vissa fick veta senare än andra. Det är precis vad tillsynen frågade efter. Rekonstruerar ni så gott det går, eller medger ni att ni inte vet?"])
          ] }),
          opt(["A short, lawyer-drafted answer", "Ett kort svar skrivet av juristerna"], "c9", ["Invites follow-up questions.", "Bjuder in till följdfrågor."], { pushback: [
            pb(["Twenty follow-up questions", "Tjugo följdfrågor"], ["The supervisor replies within days with twenty detailed follow-up questions and a shorter deadline. The short answer bought more work, under more suspicion. Do you now give the full account, and how do you explain its absence the first time?", "Tillsynen svarar inom några dagar med tjugo detaljerade följdfrågor och en kortare tidsfrist. Det korta svaret gav mer arbete, under större misstanke. Ger ni nu den fullständiga redogörelsen, och hur förklarar ni att den saknades första gången?"]),
            pb(["The CISO won't sign", "CISO:n skriver inte under"], ["Your CISO refuses to sign an answer that leaves out the contractor account, saying the supervisor will find it anyway. A short answer without the CISO's name looks odd. Do you overrule them, or rewrite?", "Er CISO vägrar skriva under ett svar som utelämnar konsultkontot och säger att tillsynen ändå kommer att hitta det. Ett kort svar utan CISO:ns namn ser konstigt ut. Kör ni över CISO:n, eller skriver ni om?"]),
            pb(["Clients will be asked too", "Klienterna kommer också att få frågor"], ["The supervisor may also ask clients when they were told, and their accounts may not match your short version. Any gap between the two will be noticed. Are you sure your answer matches what clients will say?", "Tillsynen kan också fråga klienterna när de informerades, och deras version kanske inte stämmer med ert korta svar. Varje skillnad kommer att märkas. Är ni säkra på att ert svar stämmer med vad klienterna säger?"])
          ] })
        ])
      }),

      pg("c9", ["Rebuilding trust", "Bygga upp förtroendet"], [
        "A month on, the worst is over, but client meetings all start the same way.\n\nWhatever the meeting is about, clients ask the same question first: why should we trust you with our files again?",
        "En månad senare är det värsta över, men klientmötena börjar alla på samma sätt.\n\nVad mötet än handlar om ställer klienterna samma fråga först: varför ska vi lita på er med våra filer igen?"
      ], {
        choice: ask(["What is your answer?", "Vad är ert svar?"], ["Offers independent evidence, not reassurance.", "Erbjuder oberoende belägg, inte lugnande ord."], [
          opt(["An independent review, with a summary shared with clients", "En oberoende granskning, med en sammanfattning till klienterna"], "c10", ["Evidence they can check.", "Belägg de kan kontrollera."], { pushback: [
            pb(["The review finds more", "Granskningen hittar mer"], ["The reviewers' early findings go beyond the contractor account: old file shares nobody owns, admin rights nobody uses. All of it will be in the summary clients read. Do you still share it unedited?", "Granskarnas första iakttagelser går längre än konsultkontot: gamla utdelningar som ingen äger, administratörsrättigheter som ingen använder. Allt hamnar i sammanfattningen som klienterna läser. Delar ni den ändå oredigerad?"]),
            pb(["Counsel wants it privileged", "Advokaten vill skydda den"], ["Outside counsel warns that a shared summary could be used in any client claim, and suggests commissioning the review for legal advice instead, not for clients. Do you keep your promise of openness, or protect the firm?", "Er externa advokat varnar för att en delad sammanfattning kan användas i klienters krav, och föreslår att granskningen beställs som juridisk rådgivning i stället, inte för klienterna. Håller ni löftet om öppenhet, eller skyddar ni byrån?"]),
            pb(["Months, not weeks", "Månader, inte veckor"], ["The review will take three months. Clients are asking now, and “wait for the report” sounds like the reassurance it was meant to replace. What do you say in today's meetings?", "Granskningen tar tre månader. Klienterna frågar nu, och ”vänta på rapporten” låter som just de lugnande ord den skulle ersätta. Vad säger ni på dagens möten?"])
          ] }),
          opt(["A reassuring letter from the managing partner", "Ett lugnande brev från vd"], "c10", ["Words, again.", "Ord, igen."], { pushback: [
            pb(["“You said this before”", "”Det sa ni förra gången”"], ["A client replies to the letter with one line: “This is what you said before.” They want to see what changed, not read how sorry you are. What can you show them that a letter can't?", "En klient svarar på brevet med en enda rad: ”Det är vad ni sa förra gången.” De vill se vad som har ändrats, inte läsa hur ledsna ni är. Vad kan ni visa som ett brev inte kan?"]),
            pb(["Promises in writing", "Löften i skrift"], ["Legal points out that every “your data is now safe” in the letter is a promise you can be held to, and nobody has independently checked that it is true. Which sentences are you willing to stand behind?", "Juristen påpekar att varje ”era uppgifter är nu säkra” i brevet är ett löfte ni kan hållas till, och ingen har oberoende kontrollerat att det stämmer. Vilka meningar är ni beredda att stå för?"]),
            pb(["A competitor offers proof", "En konkurrent erbjuder belägg"], ["A competing firm has started telling your clients it offers independent security audits on request. A letter from the managing partner looks thin beside that. Do you hold your ground, or match them?", "En konkurrerande byrå har börjat berätta för era klienter att de erbjuder oberoende säkerhetsgranskningar på begäran. Ett brev från vd ser tunt ut bredvid det. Står ni fast, eller matchar ni dem?"])
          ] })
        ])
      }),

      pg("c10", ["Contractor access", "Konsulternas åtkomst"], [
        "Last item in the review. The way in was a contractor's VPN account without MFA, still active a year after the job ended.\n\nThe firm uses more than thirty external suppliers with some kind of remote access. Nobody has a full list.",
        "Sista punkten i genomgången. Vägen in var en konsults vpn-konto utan MFA, fortfarande aktivt ett år efter att uppdraget avslutades.\n\nByrån använder mer än trettio externa leverantörer med någon form av fjärråtkomst. Ingen har en fullständig lista."
      ], {
        choice: ask(["What do you change?", "Vad ändrar ni?"], ["Puts all third-party access behind MFA, time limits and monitoring.", "Sätter all tredjepartsåtkomst bakom MFA, tidsgränser och bevakning."], [
          opt(["MFA, time-limited and monitored access for all third parties", "MFA, tidsbegränsad och bevakad åtkomst för alla tredje parter"], "r-end", ["Closes the door you came through.", "Stänger dörren ni kom genom."], { pushback: [
            pb(["Suppliers push back", "Leverantörerna protesterar"], ["Several suppliers say their tools do not support MFA and that time-limited access will slow their support. One threatens to raise prices. Do you make exceptions, and if so, how is that different from before?", "Flera leverantörer säger att deras verktyg inte stöder MFA och att tidsbegränsad åtkomst gör deras support långsammare. En hotar att höja priset. Gör ni undantag, och i så fall, hur skiljer det sig från förut?"]),
            pb(["Accounts you can't find", "Konton ni inte hittar"], ["You cannot apply rules to accounts you cannot find, and nobody has a full list of the thirty-plus suppliers. Building one will take weeks. What do you do about the unknown accounts in the meantime?", "Ni kan inte tillämpa regler på konton ni inte hittar, och ingen har en fullständig lista över de mer än trettio leverantörerna. Att ta fram en tar veckor. Vad gör ni med de okända kontona under tiden?"]),
            pb(["Who reads the alerts?", "Vem läser larmen?"], ["Monitoring means someone reads the alerts. IT says it is already stretched, and the contractor's uploads happened at night. Who watches, at what hours, and who pays for it?", "Bevakning innebär att någon läser larmen. IT säger att de redan är hårt belastade, och konsultens uppladdningar skedde på natten. Vem bevakar, vilka tider, och vem betalar?"])
          ] }),
          opt(["A stricter clause in the contractor's contract", "En striktare klausul i konsultens avtal"], "r-end", ["Paper does not stop logins.", "Papper stoppar inga inloggningar."], { pushback: [
            pb(["The clause already existed", "Klausulen fanns redan"], ["Procurement digs out the old contract: it already required the contractor to follow your security policies. The account stayed open anyway, because nobody checked. What will a stricter clause change?", "Inköp letar fram det gamla avtalet: det krävde redan att konsulten följde era säkerhetsregler. Kontot förblev öppet ändå, eftersom ingen kontrollerade. Vad ändrar en striktare klausul?"]),
            pb(["One contractor of thirty", "En konsult av trettio"], ["The clause covers one contractor. More than thirty other suppliers still have remote access on terms nobody has reviewed. Do you rewrite thirty contracts, and who checks that any of them are followed?", "Klausulen gäller en konsult. Mer än trettio andra leverantörer har fortfarande fjärråtkomst på villkor som ingen har granskat. Skriver ni om trettio avtal, och vem kontrollerar att något av dem följs?"]),
            pb(["A clause is not a control", "En klausul är ingen kontroll"], ["The financial supervisor asked about your security controls. A contract clause is not a control. Will this answer satisfy them, or prompt the formal investigation you hoped to avoid?", "Tillsynsmyndigheten frågade om era säkerhetskontroller. En avtalsklausul är ingen kontroll. Kommer det här svaret att räcka för dem, eller utlösa den formella utredning ni hoppades slippa?"])
          ] })
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["clientsTold", "notified", "refused"], "e1"],
          [["notified", "refused"], "e2"],
          ["notified", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["Two months later", "Två månader senare"], ["Clients heard about the theft from you first, the authorities were told in time, and nobody was paid.\n\nThe leak hurt, and a few documents are still circulating. But your clients stayed, and several told you that the phone call on the first day was the reason.", "Klienterna fick höra om stölden från er först, myndigheterna informerades i tid och ingen fick betalt.\n\nLäckan gjorde ont, och några dokument cirkulerar fortfarande. Men klienterna stannade, och flera sa att telefonsamtalet den första dagen var anledningen."], {
        ending: end(1, ["Clients heard it from you", "Klienterna fick höra det av er"], [
          "Clients heard it from you first, the authorities were told on time, and nobody was paid. The leak hurt, but your clients stayed.",
          "Klienterna fick höra det av er först, myndigheterna informerades i tid och ingen fick betalt. Läckan gjorde ont, men klienterna stannade."
        ])
      }),
      pg("e2", ["Two months later", "Två månader senare"], ["You refused to pay and notified the authorities in time, which was right.\n\nBut the attackers reached some clients before you did, and those clients heard it from criminals rather than from their advisers. A few of them have moved their business elsewhere.", "Ni vägrade betala och anmälde till myndigheterna i tid, vilket var rätt.\n\nMen angriparna nådde en del klienter före er, och de klienterna fick höra det från kriminella i stället för från sina rådgivare. Några av dem har flyttat sina uppdrag till andra byråer."], {
        ending: end(2, ["Right, but second", "Rätt, men i andra hand"], [
          "You refused to pay and notified on time, but the attackers reached some clients before you did. A few move their business.",
          "Ni vägrade betala och anmälde i tid, men angriparna nådde en del klienter före er. Några flyttar sina uppdrag."
        ])
      }),
      pg("e3", ["Three months later", "Tre månader senare"], ["You notified the authorities, but you also paid for a promise the attackers never intended to keep.\n\nThe files appeared anyway, and the payment became part of the story. Clients ask why their fees helped fund the people who stole their documents.", "Ni anmälde till myndigheterna, men ni betalade också för ett löfte som angriparna aldrig tänkte hålla.\n\nFilerna dök upp ändå, och betalningen blev en del av historien. Klienterna frågar varför deras arvoden hjälpte till att finansiera dem som stal deras dokument."], {
        ending: end(3, ["Paid and published", "Betalat och publicerat"], [
          "You notified, but paid for a promise the attackers did not keep. The files appear anyway, and the payment becomes part of the story.",
          "Ni anmälde, men betalade för ett löfte angriparna inte höll. Filerna dyker upp ändå, och betalningen blir en del av historien."
        ])
      }),
      pg("e4", ["Four months later", "Fyra månader senare"], ["There was no notification, and clients learned about the theft from the attackers or from the news.\n\nThe supervisor has opened a formal investigation into your controls and your silence. Two clients are suing for breach of confidentiality.", "Någon anmälan gjordes inte, och klienterna fick veta om stölden från angriparna eller från nyheterna.\n\nTillsynsmyndigheten har inlett en formell utredning om era kontroller och er tystnad. Två klienter stämmer byrån för brott mot konfidentialiteten."], {
        ending: end(4, ["Silent until it was public", "Tysta tills det var offentligt"], [
          "No notification, and clients learned it from the attackers or the news. The supervisor opens an investigation and two clients sue.",
          "Ingen anmälan, och klienterna fick veta det av angriparna eller nyheterna. Tillsynen inleder en utredning och två klienter stämmer."
        ])
      }),

      // Break-away: the "consultant".
      pg("x1", ["The consultant", "Konsulten"], [
        "Through a friend of one of the partners, a man is introduced who says he can make leak sites disappear.\n\nHe promises the site will be gone within a day, for a fee paid in cryptocurrency. He will not say how he does it, and he does not want a contract.",
        "Via en vän till en av delägarna introduceras en man som säger att han kan få läcksajter att försvinna.\n\nHan lovar att sajten är borta inom ett dygn, mot ett arvode i kryptovaluta. Han vill inte säga hur han gör, och han vill inte ha något avtal."
      ], {
        choice: ask(["Do you go ahead?", "Går ni vidare?"], ["Walks away from unlawful or unknown actors.", "Går ifrån olagliga eller okända aktörer."], [
          opt(["Go ahead", "Gå vidare"], "x2", ["You are now in business with someone you can't name.", "Ni gör nu affärer med någon ni inte kan namnge."], { pushback: [
            pb(["No contract, no invoice", "Inget avtal, ingen faktura"], ["The fee goes out in cryptocurrency, with no contract and no invoice, and finance has to book it as something. Which line in the accounts does it go on, and who signs it?", "Arvodet betalas i kryptovaluta, utan avtal och utan faktura, och ekonomiavdelningen måste bokföra det som något. Vilken post i bokföringen hamnar det på, och vem skriver under?"]),
            pb(["Whose favour is this?", "Vems tjänst är det här?"], ["The partner whose friend made the introduction now owns this. The other partners ask how well anyone actually knows the man. Is this a firm decision or one partner's favour, and who carries it if it goes wrong?", "Delägaren vars vän gjorde introduktionen äger nu det här. De andra delägarna frågar hur väl någon egentligen känner mannen. Är det byråns beslut eller en delägares tjänst, och vem bär det om det går fel?"]),
            pb(["How does he do it?", "Hur gör han?"], ["He will not say how. The only ways to take a criminal site down within a day are to attack it or to pay the people running it. Either way, the firm becomes part of it. Can you go ahead without knowing which?", "Han vill inte säga hur. De enda sätten att ta ned en kriminell sajt inom ett dygn är att angripa den eller betala dem som driver den. Hur som helst blir byrån en del av det. Kan ni gå vidare utan att veta vilket?"])
          ] }),
          opt(["Go ahead, but only half up front", "Gå vidare, men bara hälften i förskott"], "x2", ["Half of a bad idea.", "Hälften av en dålig idé."], { pushback: [
            pb(["Half is still a payment", "Hälften är också en betalning"], ["Legal points out that half the fee is still a payment to an unknown person for an unknown act. The law does not care about the split. What, exactly, does paying half protect you from?", "Juristen påpekar att halva arvodet fortfarande är en betalning till en okänd person för en okänd handling. Lagen bryr sig inte om fördelningen. Vad skyddar halva betalningen er mot, egentligen?"]),
            pb(["His terms, not yours", "Hans villkor, inte era"], ["He accepts half, but says the rest is due the moment the site goes down, and that he does not do refunds. You now owe a stranger money on terms you cannot enforce. What if he decides you have not paid enough?", "Han godtar hälften, men säger att resten ska betalas i samma stund som sajten går ned, och att han inte betalar tillbaka något. Ni är nu skyldiga en främling pengar på villkor ni inte kan genomdriva. Vad händer om han tycker att ni inte har betalat tillräckligt?"]),
            pb(["Caution or evidence?", "Försiktighet eller bevis?"], ["The managing partner says paying half shows you doubted him from the start. If this ever comes out, a careful half-payment reads as knowing it was wrong. Is splitting the fee caution, or evidence?", "Vd säger att halva betalningen visar att ni tvivlade på honom från början. Om det här någonsin kommer ut läses en försiktig halv betalning som att ni visste att det var fel. Är uppdelningen försiktighet, eller bevis?"])
          ] })
        ])
      }),
      pg("x2", ["It's back", "Den är tillbaka"], [
        "The leak site goes down for six hours. Then it returns, on three mirror sites at once, with a new message at the top.\n\n“For the trick, everything goes public tomorrow.” The attackers know exactly what you tried.",
        "Läcksajten går ner i sex timmar. Sedan kommer den tillbaka, på tre spegelsajter samtidigt, med ett nytt meddelande överst.\n\n”För tricket blir allt offentligt i morgon.” Angriparna vet exakt vad ni försökte."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Stops, and goes to the police with everything.", "Stannar upp och går till polisen med allt."], [
          opt(["Go to the police with all of it", "Gå till polisen med alltihop"], "x3", ["Including the consultant.", "Inklusive konsulten."], { pushback: [
            pb(["Including your payment", "Inklusive er betalning"], ["Going to the police with everything means admitting you paid an unknown man in cryptocurrency to take down a site. Outside counsel asks whether you understand you may become part of the investigation. Do you still go today?", "Att gå till polisen med allt innebär att erkänna att ni betalade en okänd man i kryptovaluta för att ta ned en sajt. Er externa advokat frågar om ni förstår att ni själva kan bli en del av utredningen. Går ni ändå i dag?"]),
            pb(["Leave my friend out", "Håll min vän utanför"], ["The partner whose friend made the introduction asks you to keep the friend's name out of it, fearing serious trouble for them. Do you protect a partner's friend, or hand over all of it as you decided?", "Delägaren vars vän gjorde introduktionen ber er att hålla vännens namn utanför, av rädsla för att vännen hamnar i allvarliga problem. Skyddar ni en delägares vän, eller lämnar ni över allt som ni beslutat?"]),
            pb(["Publication is tomorrow", "Publiceringen är i morgon"], ["The police will need time, and the attackers have promised to publish everything tomorrow. Going to the police does nothing for your clients tonight. What else do you do before morning?", "Polisen behöver tid, och angriparna har lovat att publicera allt i morgon. Att gå till polisen gör ingenting för klienterna i natt. Vad mer gör ni före morgonen?"])
          ] }),
          opt(["Ask the consultant to try again", "Be konsulten försöka igen"], "x3", ["He is happy to.", "Det gör han gärna."], { pushback: [
            pb(["A bigger fee", "Ett större arvode"], ["He agrees, for a second fee, larger than the first and again up front. The site has already come back once, angrier. What makes you think the second attempt ends differently?", "Han går med på det, mot ett andra arvode, större än det första och återigen i förskott. Sajten har redan kommit tillbaka en gång, argare. Vad får er att tro att det andra försöket slutar annorlunda?"]),
            pb(["They are watching", "De ser på"], ["The attackers' message shows they know what you tried. A second attempt will be noticed too, and the countdown says tomorrow. Are you willing to bet the rest of the files on him?", "Angriparnas meddelande visar att de vet vad ni försökte. Ett andra försök kommer också att märkas, och nedräkningen säger i morgon. Är ni beredda att satsa resten av filerna på honom?"]),
            pb(["Counsel will resign", "Juristen tänker avgå"], ["Your general counsel says they will resign if you pay him again, and wants the objection minuted. A second payment is no longer a mistake; it is a pattern. Do you still go ahead?", "Er chefsjurist säger sig vara beredd att avgå om ni betalar honom igen, och vill ha invändningen protokollförd. En andra betalning är inte längre ett misstag; det är ett mönster. Går ni ändå vidare?"])
          ] })
        ])
      }),
      pg("x3", ["Everything", "Allt"], [
        "All {{num.gigabytes}} GB are published the next morning, searchable by anyone.\n\nJournalists start searching the files for famous names, and every client of the firm is now wondering whether their documents are in there.",
        "Alla {{num.gigabytes}} GB publiceras nästa morgon, sökbara för vem som helst.\n\nJournalister börjar söka i filerna efter kända namn, och varje klient till byrån undrar nu om deras dokument finns där."
      ], {
        choice: ask(["Who do you call first?", "Vem ringer ni först?"], ["Calls every client before the journalists do.", "Ringer varje klient innan journalisterna gör det."], [
          opt(["Every client, today", "Varje klient, i dag"], "x4", ["Too late to be first, not too late to be decent.", "För sent för att vara först, inte för sent för att vara anständig."], { pushback: [
            pb(["Too many calls", "För många samtal"], ["There are {{num.clients}} clients to call, and journalists are already searching the files. By the time the last client hears from you, many will have read about themselves. Who gets called first, and how do you choose?", "Det är {{num.clients}} klienter att ringa, och journalisterna söker redan i filerna. När den sista klienten hör av er har många redan läst om sig själva. Vem ringer ni först, och hur väljer ni?"]),
            pb(["“Did you pay someone?”", "”Betalade ni någon?”"], ["Some clients have heard that the site went down and came back. They ask straight out: did you pay someone? Do you tell them about the consultant on the phone, or say nothing and hope it doesn't come out?", "En del klienter har hört att sajten försvann och kom tillbaka. De frågar rakt ut: betalade ni någon? Berättar ni om konsulten i telefon, eller säger ni ingenting och hoppas att det inte kommer fram?"]),
            pb(["Nothing to offer", "Inget att erbjuda"], ["Every call ends with the same question: what are you doing for us? Everything is already public. What concrete help can you offer each client, beyond an apology?", "Varje samtal slutar med samma fråga: vad gör ni för oss? Allt är redan offentligt. Vilken konkret hjälp kan ni erbjuda varje klient, utöver en ursäkt?"])
          ] }),
          opt(["The press office", "Pressavdelningen"], "x4", ["Clients come second, again.", "Klienterna kommer i andra hand, igen."], { pushback: [
            pb(["The press heard first", "Pressen fick höra först"], ["Clients learn from your press statement that their files are public, before anyone at the firm has called them. Several say so on the record. How do you explain that the press heard it from you first?", "Klienterna får veta från ert pressmeddelande att deras filer är offentliga, innan någon på byrån har ringt dem. Flera säger det öppet till medierna. Hur förklarar ni att pressen fick höra det från er först?"]),
            pb(["Journalists know more", "Journalisterna vet mer"], ["Journalists who have searched the files call about specific clients by name. The press office has no idea which clients are in there. What do they say, and whom do they ask?", "Journalister som har sökt i filerna ringer och frågar om specifika klienter med namn. Pressavdelningen har ingen aning om vilka klienter som finns där. Vad säger de, och vem frågar de?"]),
            pb(["Partners go around you", "Delägarna går förbi er"], ["Partners refuse to wait for the press line and start calling their own clients with their own versions. The firm now speaks with many voices. Do you stop them, or admit the order was wrong?", "Delägarna vägrar vänta på presslinjen och börjar ringa sina egna klienter med egna versioner. Byrån talar nu med många röster. Stoppar ni dem, eller medger ni att ordningen var fel?"])
          ] })
        ])
      }),
      pg("x4", ["Questions", "Frågor"], [
        "The police contact you, not about the attackers, but about your payments to the “consultant”, whom they have been investigating for months.\n\nThe financial supervisor asks about the same payments a day later.",
        "Polisen kontaktar er, inte om angriparna, utan om era betalningar till ”konsulten”, som de har utrett i månader.\n\nTillsynsmyndigheten frågar om samma betalningar en dag senare."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Answers fully, with the documents.", "Svarar fullständigt, med dokumenten."], [
          opt(["Full disclosure", "Full öppenhet"], "e5", ["The only way through.", "Den enda vägen igenom."], { pushback: [
            pb(["It names a partner", "Det pekar ut en delägare"], ["Full disclosure means handing over the messages with the consultant, including how a partner's friend introduced him. The partner asks you to wait until they have their own lawyer. Do you hand it over now?", "Full öppenhet innebär att lämna över meddelandena med konsulten, inklusive hur en delägares vän introducerade honom. Delägaren ber er vänta tills hen har en egen advokat. Lämnar ni över det nu?"]),
            pb(["Client data in the evidence", "Klientuppgifter i bevisningen"], ["The payment records and messages include client names and the files you discussed. Handing everything to the police and the supervisor shares client data once again. How do you keep your duty of confidentiality while disclosing fully?", "Betalningsuppgifterna och meddelandena innehåller klientnamn och de filer ni diskuterade. Att lämna allt till polisen och tillsynen innebär att klientuppgifter delas ännu en gång. Hur uppfyller ni tystnadsplikten samtidigt som ni är helt öppna?"]),
            pb(["Tomorrow's headline", "Morgondagens rubrik"], ["What you give the police and the supervisor may surface in court and in the press. Full disclosure today is tomorrow's headline about the firm paying a suspected criminal. Will clients hear it from you first?", "Det ni ger polisen och tillsynen kan dyka upp i en rättegång och i pressen. Full öppenhet i dag är morgondagens rubrik om att byrån betalade en misstänkt brottsling. Får klienterna höra det från er först?"])
          ] }),
          opt(["Through lawyers only", "Bara via advokater"], "e5", ["Makes it look worse.", "Får det att se värre ut."], { pushback: [
            pb(["Noted in your file", "Noterat i er akt"], ["The supervisor replies that it expects regulated firms to cooperate directly, and notes that the answer came only through lawyers. That note goes in your file. How much is controlling the message worth against that?", "Tillsynen svarar att den förväntar sig att reglerade företag samarbetar direkt, och noterar att svaret enbart kom via advokater. Den noteringen hamnar i er akt. Hur mycket är kontrollen över budskapet värd mot det?"]),
            pb(["Partners want to talk", "Delägare vill prata"], ["Two partners want to explain themselves to the police in person and will not hide behind lawyers. If they talk and the firm does not, the stories will differ. Do you stop them, and can you?", "Två delägare vill förklara sig för polisen personligen och tänker inte gömma sig bakom advokater. Om de pratar och byrån inte gör det kommer versionerna att skilja sig. Stoppar ni dem, och kan ni det?"]),
            pb(["It looks like hiding", "Det ser ut som att ni döljer något"], ["A journalist asks whether it is true that the firm answers the police only through lawyers. Put that way, it sounds like you have something to hide. What do you say, and does it change your approach?", "En journalist frågar om det stämmer att byrån bara svarar polisen via advokater. Formulerat så låter det som att ni har något att dölja. Vad svarar ni, och ändrar det ert tillvägagångssätt?"])
          ] })
        ])
      }),
      pg("e5", ["Six months later", "Sex månader senare"], ["A shortcut through an unknown “consultant” made the attackers publish everything, and drew the police and the supervisor to your own payments.\n\nThe firm's name is now linked to both a data leak and a criminal investigation. Several partners have left, taking their clients with them.", "En genväg via en okänd ”konsult” fick angriparna att publicera allt och riktade polisens och tillsynsmyndighetens uppmärksamhet mot era egna betalningar.\n\nByråns namn förknippas nu med både en dataläcka och en brottsutredning. Flera delägare har lämnat och tagit med sig sina klienter."], {
        ending: end(5, ["Paying the wrong people", "Betalade fel personer"], [
          "A shortcut through an unknown “consultant” made the attackers publish everything and drew the police and the supervisor to your own payments.",
          "En genväg via en okänd ”konsult” fick angriparna att publicera allt och riktade polisens och tillsynens intresse mot era egna betalningar."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Data-theft extortion is a client and confidentiality crisis, not an IT outage.", "Utpressning efter datastöld är en kris för klienterna och förtroendet, inte ett IT-avbrott."]),
        L(["Tell affected clients before the attacker does.", "Informera berörda klienter innan angriparen gör det."]),
        L(["Without encryption, payment buys only a promise.", "Utan kryptering köper en betalning bara ett löfte."]),
        L(["Third-party remote access needs MFA, time limits and monitoring.", "Tredje parts fjärråtkomst kräver MFA, tidsgränser och bevakning."])
      ],
      strengthsToLookFor: [
        L(["Preserving evidence rather than wiping", "Att bevara bevis i stället för att radera"]),
        L(["Calling clients first", "Att ringa klienterna först"]),
        L(["Refusing to pay for deletion", "Att vägra betala för radering"])
      ],
      commonGaps: [
        L(["Treating the threat as a bluff", "Att behandla hotet som en bluff"]),
        L(["Mapping only the largest clients", "Att bara kartlägga de största klienterna"]),
        L(["Looking for shortcuts to take the site down", "Att leta genvägar för att ta ned sajten"])
      ],
      suggestedActions: [
        act(["Require MFA and time-limited access for all contractors.", "Kräv MFA och tidsbegränsad åtkomst för alla konsulter."], "itOps", "high"),
        act(["Alert on large outbound transfers from file servers.", "Larma på stora utgående överföringar från filservrar."], "socLead", "high"),
        act(["Prepare client notification scripts and a call tree.", "Förbered manus och ringlista för att informera klienter."], "legal", "medium")
      ]
    }
  });
})();
