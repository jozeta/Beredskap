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
  const { L, q, inj, act, kpi, pg, ask, opt, end, vr, rt } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Verify and scope a data-theft extortion", "Verifiera och avgränsa en utpressning efter datastöld"]) },
      { id: "lo2", text: L(["Put client confidentiality duties first", "Sätta skyldigheten att skydda klienternas förtroende främst"]) },
      { id: "lo3", text: L(["Decide on paying, with no encryption to undo", "Ta ställning till betalning när det inte finns någon kryptering att häva"]) },
      { id: "lo4", text: L(["Control third-party remote access", "Kontrollera tredje parts fjärråtkomst"]) }
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
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. {{person.ceo.name}} forwards an email: “We have {{num.gigabytes}} GB of your client files. Proof attached. Contact us within 72 hours, or we contact your clients.”",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. {{person.ceo.name}} vidarebefordrar ett mejl: ”Vi har {{num.gigabytes}} GB av era klientfiler. Bevis bifogas. Kontakta oss inom 72 timmar, annars kontaktar vi era klienter.”"
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
          opt(["Verify the samples with IT and a forensics firm", "Verifiera exemplen med IT och en forensikfirma"], "c2", ["A day to know what you're dealing with.", "Ett dygn för att veta vad ni har att göra med."]),
          opt(["Treat it as a bluff", "Behandla det som en bluff"], "c2", ["Some are bluffs. These samples look real.", "En del är bluffar. De här exemplen ser äkta ut."], { set: "ignored" }),
          opt(["Reply to buy time", "Svara för att vinna tid"], "c2", ["Opens a channel before you know what you'll say in it.", "Öppnar en kanal innan ni vet vad ni ska säga i den."], { set: "engaged" })
        ])
      }),

      pg("c2", ["Where from?", "Varifrån?"], [
        "The file server logs show large uploads to a cloud storage service over two weeks, through the VPN account of an IT contractor.",
        "Filserverns loggar visar stora uppladdningar till en molnlagringstjänst under två veckor, via VPN-kontot för en IT-konsult."
      ], {
        variants: [vr("engaged", [
          "The attacker answered your reply within minutes, with a second sample and a lower deadline. The file server logs show uploads over two weeks, through an IT contractor's VPN account.",
          "Angriparen besvarade ert svar inom några minuter, med ett nytt exempel och en kortare tidsfrist. Filserverns loggar visar uppladdningar under två veckor, via en IT-konsults VPN-konto."
        ], ["Because you replied, they know someone is listening.", "Eftersom ni svarade vet de att någon lyssnar."])],
        injects: [
          inj("b6-2", 240, "networkEvidence", "itOps", "high", "confirmed", [
            "VPN account ext-contractor-07 · 14 sessions over 15 days · outbound to cloud storage: {{num.gigabytes}} GB · no MFA on the account.",
            "VPN-kontot ext-contractor-07 · 14 sessioner under 15 dagar · utgående till molnlagring: {{num.gigabytes}} GB · ingen MFA på kontot."
          ], { tests: ["lo4"] })
        ],
        choice: ask(["What do you do about the access?", "Vad gör ni med åtkomsten?"], ["Closes the door and preserves evidence; destroying the server destroys the scope.", "Stänger dörren och bevarar bevis; att förstöra servern förstör möjligheten att avgränsa."], [
          opt(["Disable the account, reset credentials, preserve the logs", "Stäng kontot, återställ inloggningsuppgifter, bevara loggarna"], "l1", ["Clean containment with evidence intact.", "Ren begränsning med bevisen intakta."]),
          opt(["Watch quietly to see whether they are still in", "Bevaka i tysthet för att se om de fortfarande är inne"], "l1", ["Intelligence at the cost of more exposure.", "Underrättelser till priset av mer exponering."]),
          opt(["Wipe and rebuild the file server", "Radera och bygg om filservern"], "l1", ["Feels decisive. Destroys the evidence of what was taken.", "Känns beslutsamt. Förstör bevisen för vad som togs."], { set: "wiped" })
        ])
      }),

      pg("l1", ["Which clients?", "Vilka klienter?"], [
        "Mapping the {{num.gigabytes}} GB to clients: {{num.clients}} clients, including three active deal rooms for listed companies.",
        "Kartläggningen av {{num.gigabytes}} GB till klienter: {{num.clients}} klienter, däribland tre aktiva datarum för börsnoterade bolag."
      ], {
        long: true,
        skipTo: "c3",
        variants: [vr("wiped", [
          "Because the file server was wiped, mapping the stolen files to clients has to be rebuilt from backups and upload logs. First estimate: {{num.clients}} clients, including three active deal rooms.",
          "Eftersom filservern raderades måste kartläggningen av de stulna filerna byggas upp igen från säkerhetskopior och uppladdningsloggar. Första uppskattning: {{num.clients}} klienter, däribland tre aktiva datarum."
        ], ["Because the server was wiped, the scope is an estimate.", "Eftersom servern raderades är omfattningen en uppskattning."])],
        chart: { id: "b6-scope", type: "kpi", title: L(["What was taken", "Vad som togs"]), data: kpi([
          { id: "k1", label: ["Gigabytes", "Gigabyte"], value: (v) => v.gigabytes, tone: "warn" },
          { id: "k2", label: ["Clients affected", "Berörda klienter"], value: (v) => v.clients, tone: "danger" }
        ]) },
        choice: ask(["How far do you map it?", "Hur långt kartlägger ni?"], ["Builds the full client list; partial lists leave clients uninformed.", "Bygger hela klientlistan; ofullständiga listor lämnar klienter oinformerade."], [
          opt(["Every client, every file", "Varje klient, varje fil"], "c3", ["Days of work. Needed for every later decision.", "Dagar av arbete. Behövs för varje senare beslut."]),
          opt(["The twenty biggest clients first", "De tjugo största klienterna först"], "c3", ["Pragmatic, until a small client finds out first.", "Pragmatiskt, tills en liten klient får veta det först."])
        ])
      }),

      pg("c3", ["Professional secrecy", "Tystnadsplikt"], [
        "{{person.legal.name}} reminds the room: you owe clients confidentiality. Some files concern listed companies and may be inside information.",
        "{{person.legal.name}} påminner rummet: ni har en skyldighet att skydda klienternas förtroende. En del filer gäller börsnoterade bolag och kan vara insiderinformation."
      ], {
        variants: [vr("ignored", [
          "Half of the 72 hours are gone while it was treated as a bluff. {{person.legal.name}} reminds the room: you owe clients confidentiality, and some files may be inside information.",
          "Hälften av de 72 timmarna har gått medan det behandlades som en bluff. {{person.legal.name}} påminner rummet: ni har en skyldighet mot klienterna, och en del filer kan vara insiderinformation."
        ], ["Because it was treated as a bluff, the attacker's deadline is close.", "Eftersom det behandlades som en bluff är angriparens tidsgräns nära."])],
        discuss: [q("Which clients would you call yourself, today?", "Vilka klienter skulle ni själva ringa i dag?", ["ceo", "legal"])],
        choice: ask(["Do you tell clients before the attacker does?", "Berättar ni för klienterna innan angriparen gör det?"], ["Tells affected clients personally, first, with what is known.", "Berättar personligen för berörda klienter, först, med det som är känt."], [
          opt(["Call every affected client, starting today", "Ring varje berörd klient, med start i dag"], "c4", ["Hard conversations. Much harder if the attacker goes first.", "Svåra samtal. Mycket svårare om angriparen hinner först."], { set: "clientsTold" }),
          opt(["Wait and see what the attacker does", "Vänta och se vad angriparen gör"], "c4", ["Lets the attacker set the order of events.", "Låter angriparen bestämma ordningen."]),
          opt(["Only clients with active deals", "Bara klienter med pågående affärer"], "c4", ["Covers the market risk, not the duty.", "Täcker marknadsrisken, inte skyldigheten."])
        ])
      }),

      pg("c4", ["The drip", "Droppandet"], [
        "Three clients receive emails from the attackers containing their own documents and an invitation to “ask your advisers why”.",
        "Tre klienter får mejl från angriparna med sina egna dokument och en uppmaning att ”fråga era rådgivare varför”."
      ], {
        variants: [vr("clientsTold", [
          "The attackers email three clients their own documents. Because you called them first, two of the three already knew and forward the email to you.",
          "Angriparna mejlar tre klienter deras egna dokument. Eftersom ni ringde dem först visste två av de tre redan och vidarebefordrar mejlet till er."
        ], ["Because you told clients first, the attacker's pressure lost its surprise.", "Eftersom ni informerade klienterna först förlorade angriparens påtryckning sin överraskning."])],
        choice: ask(["Who else do you tell?", "Vem mer informerar ni?"], ["Notifies the authority and the police; extortion and a breach are both crimes and duties.", "Anmäler till myndigheten och polisen; utpressning och en incident innebär både brott och skyldigheter."], [
          opt(["Notify {{reg.dpaShort}} and report to {{reg.police}}", "Anmäl till {{reg.dpaShort}} och polisanmäl till {{reg.police}}"], "l2", ["Both duties met.", "Båda skyldigheterna uppfyllda."], { set: "notified" }),
          opt(["Report to the police only", "Polisanmäl bara"], "l2", ["The breach notification is still due.", "Anmälan av personuppgiftsincidenten kvarstår."]),
          opt(["Hold off until the scope is known", "Vänta tills omfattningen är känd"], "l2", ["The 72 hours don't wait.", "De 72 timmarna väntar inte."])
        ])
      }),

      pg("l2", ["The insurer", "Försäkringsbolaget"], [
        "The cyber policy covers extortion costs only if you use the insurer's negotiator and notify within 48 hours.",
        "Cyberförsäkringen täcker utpressningskostnader bara om ni använder försäkringsbolagets förhandlare och anmäler inom 48 timmar."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["Do you bring the insurer in?", "Tar ni in försäkringsbolaget?"], ["Follows the policy's terms and gets expert help.", "Följer försäkringsvillkoren och får experthjälp."], [
          opt(["Notify the insurer and use their negotiator", "Anmäl till försäkringsbolaget och använd deras förhandlare"], "c5", ["Expertise and cover.", "Expertis och försäkringsskydd."]),
          opt(["Handle it yourselves", "Hantera det själva"], "c5", ["Control, without experience.", "Kontroll, utan erfarenhet."])
        ])
      }),

      pg("c5", ["The price", "Priset"], [
        "The attackers name a price: {{num.demand|currency}}, for “permanent deletion and silence”.",
        "Angriparna nämner ett pris: {{num.demand|currency}}, för ”permanent radering och tystnad”."
      ], {
        discuss: [q("What would paying actually buy you?", "Vad skulle en betalning faktiskt ge er?", ["ceo", "legal"])],
        choice: ask(["Do you pay?", "Betalar ni?"], ["Recognises that without encryption, payment buys only a promise.", "Inser att utan kryptering köper en betalning bara ett löfte."], [
          opt(["Refuse to pay", "Vägra betala"], "l3", ["The data is out either way.", "Uppgifterna är ute oavsett."], { set: "refused" }),
          opt(["Negotiate for proof of deletion", "Förhandla om bevis på radering"], "c5b", ["There is no such proof.", "Något sådant bevis finns inte."]),
          opt(["Pay quietly to keep it out of the news", "Betala i tysthet för att hålla det borta från nyheterna"], "l3", ["You fund the next attack and keep no guarantee.", "Ni finansierar nästa angrepp och får ingen garanti."], { set: "paid" })
        ])
      }),

      pg("c5b", ["Proof of deletion", "Bevis på radering"], [
        "The attackers offer a video of files being deleted. The negotiator's view: it proves nothing about other copies.",
        "Angriparna erbjuder en video där filer raderas. Förhandlarens bedömning: den bevisar ingenting om andra kopior."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Stops paying for theatre.", "Slutar betala för teater."], [
          opt(["Stop negotiating", "Sluta förhandla"], "l3", ["Accepts reality.", "Accepterar verkligheten."], { set: "refused" }),
          opt(["Pay for the video", "Betala för videon"], "l3", ["A very expensive video.", "En mycket dyr video."], { set: "paid" })
        ])
      }),

      pg("l3", ["A client's lawyer", "En klients advokat"], [
        "Your largest client's lawyers write: they reserve the right to claim damages for breach of confidentiality.",
        "Er största klients advokater skriver: de förbehåller sig rätten att kräva skadestånd för brott mot sekretessen."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Meets the client openly; transparency limits the claim more than silence.", "Möter klienten öppet; öppenhet begränsar kravet mer än tystnad."], [
          opt(["Meet them with a full account", "Träffa dem med en fullständig redogörelse"], "c6", ["Uncomfortable, and it keeps the relationship alive.", "Obekvämt, och det håller relationen vid liv."]),
          opt(["Refer them to your insurer", "Hänvisa dem till ert försäkringsbolag"], "c6", ["Correct on paper, cold in practice.", "Korrekt på papperet, kallt i praktiken."])
        ])
      }),

      pg("c6", ["The leak site", "Läcksajten"], [
        "{{org.name}} appears on a leak site with a countdown and a first sample: a tax file for a well-known family business.",
        "{{org.name}} dyker upp på en läcksajt med nedräkning och ett första utdrag: en skattefil för ett välkänt familjeföretag."
      ], {
        variants: [vr("paid", [
          "You paid, and {{org.name}} still appears on a leak site, marked “partial data, more available”.",
          "Ni betalade, och {{org.name}} finns ändå på en läcksajt, markerat ”delar av datan, mer finns”."
        ], ["Because you paid, they know you will pay again.", "Eftersom ni betalade vet de att ni betalar igen."])],
        injects: [
          inj("b6-3", 4320, "newsHeadline", "media", "high", "confirmed", [
            "Advisory firm {{org.name}} named on extortion site; client tax files published.",
            "Rådgivningsföretaget {{org.name}} utpekat på utpressningssajt; klienters skattefiler publicerade."
          ], { headline: ["Business news", "Ekonominyheter"], tests: ["lo2"] })
        ],
        choice: ask(["What do you do?", "Vad gör ni?"], ["Speaks publicly with care for clients, and uses lawful means against the site.", "Uttalar sig offentligt med omsorg om klienterna, och använder lagliga medel mot sajten."], [
          opt(["A short statement with guidance for clients", "Ett kort uttalande med vägledning för klienterna"], "c7", ["Shows you are in control of what you can control.", "Visar att ni har kontroll över det ni kan kontrollera."]),
          opt(["No comment", "Ingen kommentar"], "c7", ["The leak site does the talking.", "Läcksajten talar i stället."]),
          opt(["Seek takedowns of mirrors through hosts and the courts", "Begär nedtagning av speglar via värdar och domstolar"], "c7", ["Lawful and slow; reduces spread a little.", "Lagligt och långsamt; minskar spridningen något."]),
          opt(["Pay a “consultant” who promises to take the site down", "Betala en ”konsult” som lovar att ta ned sajten"], "x1", ["Who exactly is this consultant?", "Vem är egentligen den här konsulten?"])
        ])
      }),

      pg("c7", ["Staff", "Personalen"], [
        "Staff are asking questions, and some work on the affected deals.",
        "Personalen ställer frågor, och en del arbetar med de berörda affärerna."
      ], {
        choice: ask(["What do you tell staff?", "Vad säger ni till personalen?"], ["Briefs staff, sets trading restrictions and a legal hold.", "Informerar personalen, inför handelsrestriktioner och bevarandeplikt."], [
          opt(["Brief everyone, restrict trading, preserve documents", "Informera alla, begränsa handel, bevara dokument"], "l4", ["Protects staff and clients.", "Skyddar personal och klienter."]),
          opt(["Need-to-know only", "Bara de som behöver veta"], "l4", ["Rumours spread anyway.", "Rykten sprids ändå."])
        ])
      }),

      pg("l4", ["The market moves", "Marknaden rör sig"], [
        "Shares in a listed client rise sharply on rumours of a bid. The leaked deal room may be why.",
        "Aktien i en börsnoterad klient stiger kraftigt på rykten om ett bud. Det läckta datarummet kan vara orsaken."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you do?", "Vad gör ni?"], ["Informs the client so they can meet their own disclosure duties.", "Informerar klienten så att de kan uppfylla sin egen informationsplikt."], [
          opt(["Inform the client immediately", "Informera klienten omedelbart"], "c8", ["They may need to disclose the bid.", "De kan behöva offentliggöra budet."]),
          opt(["Not your concern", "Inte er sak"], "c8", ["It is very much your concern.", "Det är i högsta grad er sak."])
        ])
      }),

      pg("c8", ["The supervisor", "Tillsynen"], [
        "The financial supervisor asks for an account of the incident, your controls and how clients were informed.",
        "Finanstillsynen begär en redogörelse för incidenten, era kontroller och hur klienterna informerades."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Gives a complete, documented account including weaknesses.", "Ger en fullständig, dokumenterad redogörelse inklusive svagheter."], [
          opt(["A full account with the contractor weakness", "En fullständig redogörelse med konsultsvagheten"], "c9", ["Builds credibility with the supervisor.", "Bygger trovärdighet hos tillsynen."]),
          opt(["A short, lawyer-drafted answer", "Ett kort svar skrivet av juristerna"], "c9", ["Invites follow-up questions.", "Bjuder in till följdfrågor."])
        ])
      }),

      pg("c9", ["Rebuilding trust", "Bygga upp förtroendet"], [
        "Clients ask the same question: why should we trust you with our files again?",
        "Klienterna ställer samma fråga: varför ska vi anförtro er våra filer igen?"
      ], {
        choice: ask(["What is your answer?", "Vad är ert svar?"], ["Offers independent evidence, not reassurance.", "Erbjuder oberoende belägg, inte lugnande ord."], [
          opt(["An independent review, with a summary shared with clients", "En oberoende granskning, med en sammanfattning till klienterna"], "c10", ["Evidence they can check.", "Belägg de kan kontrollera."]),
          opt(["A reassuring letter from the managing partner", "Ett lugnande brev från vd"], "c10", ["Words, again.", "Ord, igen."])
        ])
      }),

      pg("c10", ["Contractor access", "Konsulternas åtkomst"], [
        "The way in was a contractor's VPN account without MFA. What changes?",
        "Vägen in var en konsults VPN-konto utan MFA. Vad ändras?"
      ], {
        choice: ask(["What do you change?", "Vad ändrar ni?"], ["Puts all third-party access behind MFA, time limits and monitoring.", "Sätter all tredjepartsåtkomst bakom MFA, tidsgränser och bevakning."], [
          opt(["MFA, time-limited and monitored access for all third parties", "MFA, tidsbegränsad och bevakad åtkomst för alla tredje parter"], "r-end", ["Closes the door you came through.", "Stänger dörren ni kom genom."]),
          opt(["A stricter clause in the contractor's contract", "En striktare klausul i konsultens avtal"], "r-end", ["Paper does not stop logins.", "Papper stoppar inga inloggningar."])
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

      pg("e1", ["Contained", "Begränsad"], ["Ending", "Slut"], {
        ending: end(1, ["Clients heard it from you", "Klienterna fick höra det av er"], [
          "Clients heard it from you first, the authorities were told on time, and nobody was paid. The leak hurt, but your clients stayed.",
          "Klienterna fick höra det av er först, myndigheterna informerades i tid och ingen fick betalt. Läckan gjorde ont, men klienterna stannade."
        ])
      }),
      pg("e2", ["Managed", "Hanterad"], ["Ending", "Slut"], {
        ending: end(2, ["Right, but second", "Rätt, men i andra hand"], [
          "You refused to pay and notified on time, but the attackers reached some clients before you did. A few move their business.",
          "Ni vägrade betala och anmälde i tid, men angriparna nådde en del klienter före er. Några flyttar sina uppdrag."
        ])
      }),
      pg("e3", ["Damaging", "Skadlig"], ["Ending", "Slut"], {
        ending: end(3, ["Paid and published", "Betalat och publicerat"], [
          "You notified, but paid for a promise the attackers did not keep. The files appear anyway, and the payment becomes part of the story.",
          "Ni anmälde, men betalade för ett löfte angriparna inte höll. Filerna dyker upp ändå, och betalningen blir en del av historien."
        ])
      }),
      pg("e4", ["Severe", "Allvarlig"], ["Ending", "Slut"], {
        ending: end(4, ["Silent until it was public", "Tysta tills det var offentligt"], [
          "No notification, and clients learned it from the attackers or the news. The supervisor opens an investigation and two clients sue.",
          "Ingen anmälan, och klienterna fick veta det av angriparna eller nyheterna. Tillsynen inleder en utredning och två klienter stämmer."
        ])
      }),

      // Break-away: the "consultant".
      pg("x1", ["The consultant", "Konsulten"], [
        "A man introduced through a friend of a partner promises the leak site will be gone within a day, for a fee in cryptocurrency.",
        "En man som introducerats via en bekant till en delägare lovar att läcksajten är borta inom ett dygn, mot ett arvode i kryptovaluta."
      ], {
        choice: ask(["Do you go ahead?", "Går ni vidare?"], ["Walks away from unlawful or unknown actors.", "Går ifrån olagliga eller okända aktörer."], [
          opt(["Go ahead", "Gå vidare"], "x2", ["You are now in business with someone you can't name.", "Ni gör nu affärer med någon ni inte kan namnge."]),
          opt(["Go ahead, but only half up front", "Gå vidare, men bara hälften i förskott"], "x2", ["Half of a bad idea.", "Hälften av en dålig idé."])
        ])
      }),
      pg("x2", ["It's back", "Den är tillbaka"], [
        "The site goes down for six hours, then returns on three mirrors, with a new message: “For the trick, everything goes public tomorrow.”",
        "Sajten ligger nere i sex timmar och kommer sedan tillbaka på tre speglar, med ett nytt meddelande: ”För tricket blir allt offentligt i morgon.”"
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Stops, and goes to the police with everything.", "Stannar upp och går till polisen med allt."], [
          opt(["Go to the police with all of it", "Gå till polisen med alltihop"], "x3", ["Including the consultant.", "Inklusive konsulten."]),
          opt(["Ask the consultant to try again", "Be konsulten försöka igen"], "x3", ["He is happy to.", "Det gör han gärna."])
        ])
      }),
      pg("x3", ["Everything", "Allt"], [
        "All {{num.gigabytes}} GB are published. Journalists search it for famous names.",
        "Alla {{num.gigabytes}} GB publiceras. Journalister söker igenom dem efter kända namn."
      ], {
        choice: ask(["Who do you call first?", "Vem ringer ni först?"], ["Calls every client before the journalists do.", "Ringer varje klient innan journalisterna gör det."], [
          opt(["Every client, today", "Varje klient, i dag"], "x4", ["Too late to be first, not too late to be decent.", "För sent för att vara först, inte för sent för att vara anständig."]),
          opt(["The press office", "Pressavdelningen"], "x4", ["Clients come second, again.", "Klienterna kommer i andra hand, igen."])
        ])
      }),
      pg("x4", ["Questions", "Frågor"], [
        "The police ask about your payments to the consultant. So does the financial supervisor.",
        "Polisen frågar om era betalningar till konsulten. Det gör även finanstillsynen."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Answers fully, with the documents.", "Svarar fullständigt, med dokumenten."], [
          opt(["Full disclosure", "Full öppenhet"], "e5", ["The only way through.", "Den enda vägen igenom."]),
          opt(["Through lawyers only", "Bara via advokater"], "e5", ["Makes it look worse.", "Får det att se värre ut."])
        ])
      }),
      pg("e5", ["Disaster", "Katastrof"], ["Ending", "Slut"], {
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
