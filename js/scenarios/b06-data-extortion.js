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
          opt(["Verify the samples with IT and a forensics firm", "Verifiera exemplen med IT och en forensikfirma"], "c2", ["A day to know what you're dealing with.", "Ett dygn för att veta vad ni har att göra med."]),
          opt(["Treat it as a bluff", "Behandla det som en bluff"], "c2", ["Some are bluffs. These samples look real.", "En del är bluffar. De här exemplen ser äkta ut."], { set: "ignored" }),
          opt(["Reply to buy time", "Svara för att vinna tid"], "c2", ["Opens a channel before you know what you'll say in it.", "Öppnar en kanal innan ni vet vad ni ska säga i den."], { set: "engaged" })
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
          opt(["Disable the account, reset credentials, preserve the logs", "Stäng kontot, återställ inloggningsuppgifter, bevara loggarna"], "l1", ["Clean containment with evidence intact.", "Ren begränsning med bevisen intakta."]),
          opt(["Watch quietly to see whether they are still in", "Bevaka i tysthet för att se om de fortfarande är inne"], "l1", ["Intelligence at the cost of more exposure.", "Underrättelser till priset av mer exponering."]),
          opt(["Wipe and rebuild the file server", "Radera och bygg om filservern"], "l1", ["Feels decisive. Destroys the evidence of what was taken.", "Känns beslutsamt. Förstör bevisen för vad som togs."], { set: "wiped" })
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
          opt(["Every client, every file", "Varje klient, varje fil"], "c3", ["Days of work. Needed for every later decision.", "Dagar av arbete. Behövs för varje senare beslut."]),
          opt(["The twenty biggest clients first", "De tjugo största klienterna först"], "c3", ["Pragmatic, until a small client finds out first.", "Pragmatiskt, tills en liten klient får veta det först."])
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
          opt(["Call every affected client, starting today", "Ring varje berörd klient, med start i dag"], "c4", ["Hard conversations. Much harder if the attacker goes first.", "Svåra samtal. Mycket svårare om angriparen hinner först."], { set: "clientsTold" }),
          opt(["Wait and see what the attacker does", "Vänta och se vad angriparen gör"], "c4", ["Lets the attacker set the order of events.", "Låter angriparen bestämma ordningen."]),
          opt(["Only clients with active deals", "Bara klienter med pågående affärer"], "c4", ["Covers the market risk, not the duty.", "Täcker marknadsrisken, inte skyldigheten."])
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
          opt(["Notify {{reg.dpaShort}} and report to {{reg.police}}", "Anmäl till {{reg.dpaShort}} och polisanmäl till {{reg.police}}"], "l2", ["Both duties met.", "Båda skyldigheterna uppfyllda."], { set: "notified" }),
          opt(["Report to the police only", "Polisanmäl bara"], "l2", ["The breach notification is still due.", "Anmälan av personuppgiftsincidenten kvarstår."]),
          opt(["Hold off until the scope is known", "Vänta tills omfattningen är känd"], "l2", ["The 72 hours don't wait.", "De 72 timmarna väntar inte."])
        ])
      }),

      pg("l2", ["The insurer", "Försäkringsbolaget"], [
        "{{person.legal.name}} checks the cyber insurance policy. It covers extortion costs and legal fees, but only if you use the insurer's own negotiator and notify the insurer within 48 hours.\n\nThe insurer's involvement brings expertise, but also another party in the room, with its own interests.",
        "{{person.legal.name}} går igenom cyberförsäkringen. Den täcker kostnader för utpressning och juridiska avgifter, men bara om ni använder försäkringsbolagets egen förhandlare och anmäler till försäkringsbolaget inom 48 timmar.\n\nFörsäkringsbolagets medverkan ger expertis, men också ytterligare en part i rummet, med egna intressen."
      ], {
        long: true,
        skipTo: "c5",
        choice: ask(["Do you bring the insurer in?", "Tar ni in försäkringsbolaget?"], ["Follows the policy's terms and gets expert help.", "Följer försäkringsvillkoren och får experthjälp."], [
          opt(["Notify the insurer and use their negotiator", "Anmäl till försäkringsbolaget och använd deras förhandlare"], "c5", ["Expertise and cover.", "Expertis och försäkringsskydd."]),
          opt(["Handle it yourselves", "Hantera det själva"], "c5", ["Control, without experience.", "Kontroll, utan erfarenhet."])
        ])
      }),

      pg("c5", ["The price", "Priset"], [
        "The attackers name their price: {{num.demand|currency}}, for what they call “permanent deletion and silence”.\n\nThey promise to delete every copy and never contact your clients again. There is no way to check whether they keep that promise, and paying criminals may also have legal consequences.",
        "Angriparna nämner sitt pris: {{num.demand|currency}}, för det de kallar ”permanent radering och tystnad”.\n\nDe lovar att radera varje kopia och aldrig kontakta era klienter igen. Det finns inget sätt att kontrollera om de håller det löftet, och att betala kriminella kan också få rättsliga följder."
      ], {
        discuss: [q("What would paying actually buy you?", "Vad skulle en betalning faktiskt ge er?", ["ceo", "legal"])],
        choice: ask(["Do you pay?", "Betalar ni?"], ["Recognises that without encryption, payment buys only a promise.", "Inser att utan kryptering köper en betalning bara ett löfte."], [
          opt(["Refuse to pay", "Vägra betala"], "l3", ["The data is out either way.", "Uppgifterna är ute oavsett."], { set: "refused" }),
          opt(["Negotiate for proof of deletion", "Förhandla om bevis på radering"], "c5b", ["There is no such proof.", "Något sådant bevis finns inte."]),
          opt(["Pay quietly to keep it out of the news", "Betala i tysthet för att hålla det borta från nyheterna"], "l3", ["You fund the next attack and keep no guarantee.", "Ni finansierar nästa angrepp och får ingen garanti."], { set: "paid" })
        ])
      }),

      pg("c5b", ["Proof of deletion", "Bevis på radering"], [
        "The negotiator asks for proof that the files will really be deleted. The attackers offer a video showing the files being deleted from a server.\n\nThe negotiator's view is blunt: a video proves only that one copy was deleted on camera. It says nothing about the other copies they almost certainly have.",
        "Förhandlaren ber om bevis för att filerna verkligen raderas. Angriparna erbjuder en video där filerna raderas från en server.\n\nFörhandlarens bedömning är rak: en video bevisar bara att en kopia raderades framför kameran. Den säger ingenting om de andra kopior som de nästan säkert har."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Stops paying for theatre.", "Slutar betala för teater."], [
          opt(["Stop negotiating", "Sluta förhandla"], "l3", ["Accepts reality.", "Accepterar verkligheten."], { set: "refused" }),
          opt(["Pay for the video", "Betala för videon"], "l3", ["A very expensive video.", "En mycket dyr video."], { set: "paid" })
        ])
      }),

      pg("l3", ["A client's lawyer", "En klients advokat"], [
        "A letter arrives from the lawyers of your largest client. They reserve the right to claim damages for breach of confidentiality.\n\nThey also ask for a meeting within the week, and a full account of what was taken and what you have done since.",
        "Ett brev kommer från juristerna för er största klient. De förbehåller sig rätten att kräva skadestånd för brott mot konfidentialiteten.\n\nDe begär också ett möte inom en vecka och en fullständig redogörelse för vad som togs och vad ni har gjort sedan dess."
      ], {
        long: true,
        skipTo: "c6",
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Meets the client openly; transparency limits the claim more than silence.", "Möter klienten öppet; öppenhet begränsar kravet mer än tystnad."], [
          opt(["Meet them with a full account", "Träffa dem med en fullständig redogörelse"], "c6", ["Uncomfortable, and it keeps the relationship alive.", "Obekvämt, och det håller relationen vid liv."]),
          opt(["Refer them to your insurer", "Hänvisa dem till ert försäkringsbolag"], "c6", ["Correct on paper, cold in practice.", "Korrekt på papperet, kallt i praktiken."])
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
          opt(["A short statement with guidance for clients", "Ett kort uttalande med vägledning för klienterna"], "c7", ["Shows you are in control of what you can control.", "Visar att ni har kontroll över det ni kan kontrollera."]),
          opt(["No comment", "Ingen kommentar"], "c7", ["The leak site does the talking.", "Läcksajten talar i stället."]),
          opt(["Seek takedowns of mirrors through hosts and the courts", "Begär nedtagning av speglar via värdar och domstolar"], "c7", ["Lawful and slow; reduces spread a little.", "Lagligt och långsamt; minskar spridningen något."]),
          opt(["Pay a “consultant” who promises to take the site down", "Betala en ”konsult” som lovar att ta ned sajten"], "x1", ["Who exactly is this consultant?", "Vem är egentligen den här konsulten?"])
        ])
      }),

      pg("c7", ["Staff", "Personalen"], [
        "The firm's staff have seen the news. They are asking questions in corridors and chats: is my work affected, what can I tell my clients, can I trade shares?\n\nSome of them work on the affected deals and know exactly which documents are now in criminal hands.",
        "Byråns personal har sett nyheterna. De ställer frågor i korridorer och chattar: berörs mitt arbete, vad får jag säga till mina klienter, får jag handla aktier?\n\nEn del av dem arbetar med de berörda affärerna och vet exakt vilka dokument som nu finns i kriminella händer."
      ], {
        choice: ask(["What do you tell staff?", "Vad säger ni till personalen?"], ["Briefs staff, sets trading restrictions and a legal hold.", "Informerar personalen, inför handelsrestriktioner och bevarandeplikt."], [
          opt(["Brief everyone, restrict trading, preserve documents", "Informera alla, begränsa handel, bevara dokument"], "l4", ["Protects staff and clients.", "Skyddar personal och klienter."]),
          opt(["Need-to-know only", "Bara de som behöver veta"], "l4", ["Rumours spread anyway.", "Rykten sprids ändå."])
        ])
      }),

      pg("l4", ["The market moves", "Marknaden rör sig"], [
        "Shares in one of your listed clients rise eleven percent in an afternoon, on rumours of a takeover bid.\n\nThe bid is real, and the documents describing it were in the leaked deal room. Someone may be trading on what was stolen from you.",
        "Aktien i en av era börsnoterade klienter stiger elva procent på en eftermiddag, på rykten om ett uppköpserbjudande.\n\nBudet är verkligt, och dokumenten som beskriver det fanns i det läckta datarummet. Någon kanske handlar på det som stals från er."
      ], {
        long: true,
        skipTo: "c8",
        choice: ask(["What do you do?", "Vad gör ni?"], ["Informs the client so they can meet their own disclosure duties.", "Informerar klienten så att de kan uppfylla sin egen informationsplikt."], [
          opt(["Inform the client immediately", "Informera klienten omedelbart"], "c8", ["They may need to disclose the bid.", "De kan behöva offentliggöra budet."]),
          opt(["Not your concern", "Inte er sak"], "c8", ["It is very much your concern.", "Det är i högsta grad er sak."])
        ])
      }),

      pg("c8", ["The supervisor", "Tillsynen"], [
        "The financial supervisor writes. It wants a written account of the incident, your security controls, and how and when clients were informed.\n\nIt sets a deadline of two weeks. The answer will decide whether this becomes a formal investigation.",
        "Tillsynsmyndigheten för finansmarknaden skriver. Den vill ha en skriftlig redogörelse för incidenten, era säkerhetskontroller och hur och när klienterna informerades.\n\nDen sätter en tidsfrist på två veckor. Svaret avgör om det här blir en formell utredning."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Gives a complete, documented account including weaknesses.", "Ger en fullständig, dokumenterad redogörelse inklusive svagheter."], [
          opt(["A full account with the contractor weakness", "En fullständig redogörelse med konsultsvagheten"], "c9", ["Builds credibility with the supervisor.", "Bygger trovärdighet hos tillsynen."]),
          opt(["A short, lawyer-drafted answer", "Ett kort svar skrivet av juristerna"], "c9", ["Invites follow-up questions.", "Bjuder in till följdfrågor."])
        ])
      }),

      pg("c9", ["Rebuilding trust", "Bygga upp förtroendet"], [
        "A month on, the worst is over, but client meetings all start the same way.\n\nWhatever the meeting is about, clients ask the same question first: why should we trust you with our files again?",
        "En månad senare är det värsta över, men klientmötena börjar alla på samma sätt.\n\nVad mötet än handlar om ställer klienterna samma fråga först: varför ska vi lita på er med våra filer igen?"
      ], {
        choice: ask(["What is your answer?", "Vad är ert svar?"], ["Offers independent evidence, not reassurance.", "Erbjuder oberoende belägg, inte lugnande ord."], [
          opt(["An independent review, with a summary shared with clients", "En oberoende granskning, med en sammanfattning till klienterna"], "c10", ["Evidence they can check.", "Belägg de kan kontrollera."]),
          opt(["A reassuring letter from the managing partner", "Ett lugnande brev från vd"], "c10", ["Words, again.", "Ord, igen."])
        ])
      }),

      pg("c10", ["Contractor access", "Konsulternas åtkomst"], [
        "Last item in the review. The way in was a contractor's VPN account without MFA, still active a year after the job ended.\n\nThe firm uses more than thirty external suppliers with some kind of remote access. Nobody has a full list.",
        "Sista punkten i genomgången. Vägen in var en konsults vpn-konto utan MFA, fortfarande aktivt ett år efter att uppdraget avslutades.\n\nByrån använder mer än trettio externa leverantörer med någon form av fjärråtkomst. Ingen har en fullständig lista."
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
          opt(["Go ahead", "Gå vidare"], "x2", ["You are now in business with someone you can't name.", "Ni gör nu affärer med någon ni inte kan namnge."]),
          opt(["Go ahead, but only half up front", "Gå vidare, men bara hälften i förskott"], "x2", ["Half of a bad idea.", "Hälften av en dålig idé."])
        ])
      }),
      pg("x2", ["It's back", "Den är tillbaka"], [
        "The leak site goes down for six hours. Then it returns, on three mirror sites at once, with a new message at the top.\n\n“For the trick, everything goes public tomorrow.” The attackers know exactly what you tried.",
        "Läcksajten går ner i sex timmar. Sedan kommer den tillbaka, på tre spegelsajter samtidigt, med ett nytt meddelande överst.\n\n”För tricket blir allt offentligt i morgon.” Angriparna vet exakt vad ni försökte."
      ], {
        choice: ask(["What now?", "Vad gör ni nu?"], ["Stops, and goes to the police with everything.", "Stannar upp och går till polisen med allt."], [
          opt(["Go to the police with all of it", "Gå till polisen med alltihop"], "x3", ["Including the consultant.", "Inklusive konsulten."]),
          opt(["Ask the consultant to try again", "Be konsulten försöka igen"], "x3", ["He is happy to.", "Det gör han gärna."])
        ])
      }),
      pg("x3", ["Everything", "Allt"], [
        "All {{num.gigabytes}} GB are published the next morning, searchable by anyone.\n\nJournalists start searching the files for famous names, and every client of the firm is now wondering whether their documents are in there.",
        "Alla {{num.gigabytes}} GB publiceras nästa morgon, sökbara för vem som helst.\n\nJournalister börjar söka i filerna efter kända namn, och varje klient till byrån undrar nu om deras dokument finns där."
      ], {
        choice: ask(["Who do you call first?", "Vem ringer ni först?"], ["Calls every client before the journalists do.", "Ringer varje klient innan journalisterna gör det."], [
          opt(["Every client, today", "Varje klient, i dag"], "x4", ["Too late to be first, not too late to be decent.", "För sent för att vara först, inte för sent för att vara anständig."]),
          opt(["The press office", "Pressavdelningen"], "x4", ["Clients come second, again.", "Klienterna kommer i andra hand, igen."])
        ])
      }),
      pg("x4", ["Questions", "Frågor"], [
        "The police contact you, not about the attackers, but about your payments to the “consultant”, whom they have been investigating for months.\n\nThe financial supervisor asks about the same payments a day later.",
        "Polisen kontaktar er, inte om angriparna, utan om era betalningar till ”konsulten”, som de har utrett i månader.\n\nTillsynsmyndigheten frågar om samma betalningar en dag senare."
      ], {
        choice: ask(["How do you answer?", "Hur svarar ni?"], ["Answers fully, with the documents.", "Svarar fullständigt, med dokumenten."], [
          opt(["Full disclosure", "Full öppenhet"], "e5", ["The only way through.", "Den enda vägen igenom."]),
          opt(["Through lawyers only", "Bara via advokater"], "e5", ["Makes it look worse.", "Får det att se värre ut."])
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
