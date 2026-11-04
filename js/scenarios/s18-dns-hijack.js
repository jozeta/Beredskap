/*
 * s18-dns-hijack.js — "Your Domain, Their Server" (archetype B, network/identity).
 *
 * Ambiguous start: certificate warnings and resolution failures that look like
 * a provider misconfiguration → the registrar account was taken over and the
 * name servers changed → mail was redirected and password-reset emails
 * intercepted → only a departed employee can recover the registrar account →
 * the attacker holds a valid certificate for your domain → cleaning up the
 * tokens, sessions and trust.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s18-dns-hijack",
    version: 1,
    category: "network-identity",
    archetype: "ambiguous-start",
    emblem: "dns",
    title: L(["Your Domain, Their Server", "Er domän, deras server"]),
    summary: L([
      "On a quiet weekend, customers report certificate warnings and some can't reach you at all. It looks like the hosting provider has misconfigured something. It isn't the provider.",
      "En lugn helg rapporterar kunder certifikatvarningar och en del når er inte alls. Det ser ut som att driftleverantören har konfigurerat något fel. Det är inte leverantören."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Recognise a domain hijack early", "Känna igen en domänkapning tidigt"]), teaser: L(["Noticing early", "Att upptäcka tidigt"]) },
      { id: "lo2", text: L(["Understand how DNS control leads to account takeover", "Förstå hur kontroll över DNS leder till kapade konton"]), teaser: L(["How one thing leads to another", "Hur en sak leder till en annan"]) },
      { id: "lo3", text: L(["Recover critical external accounts with slow third parties", "Återta kritiska externa konton med långsamma tredje parter"]), teaser: L(["Depending on someone else's pace", "Att vara beroende av någon annans takt"]) },
      { id: "lo4", text: L(["Restore trust in your domain for customers", "Återställa kundernas förtroende för er domän"]), teaser: L(["Earning trust back", "Att förtjäna förtroendet igen"]) }
    ],
    mitre: ["T1584", "T1078", "T1114", "T1588", "T1539", "T1098"],
    frameworks: {
      nistCsf: ["GV.SC", "ID.AM", "PR.AA", "DE.CM", "RS.MA", "RS.CO", "RS.MI", "RC.CO"],
      iso27001: ["A.5.19", "A.5.20", "A.5.17", "A.5.18", "A.5.24", "A.5.26", "A.8.20", "A.8.24"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "weekend" },
    actor: { types: ["criminal"], motivation: L(["Financial: taking over accounts through intercepted mail", "Ekonomisk: att ta över konton genom uppfångad e-post"]), capability: "medium" },
    variables: {
      resetsIntercepted: { min: 6, max: 300, scaleBy: "size" },
      customersAffected: { min: 200, max: 90000, scaleBy: "size" },
      ttlHours: { min: 12, max: 48 },
      registrarHours: { min: 24, max: 72 }
    },
    roles: ["networkLead", "itOps", "ciso", "socLead", "comms", "incidentCommander", "serviceOwner", "dpo", "legal", "supplierManager", "cio"],

    groundTruth: {
      rootCause: L([
        "An attacker phished the password of the registrar account for {{org.domain}}, which was registered to a former employee's mailbox and had no MFA. They changed the name servers to their own, issued a valid certificate, redirected mail and intercepted password-reset emails for staff and customer accounts.",
        "En angripare kom över lösenordet till registrarkontot för {{org.domain}} genom nätfiske. Kontot var registrerat på en tidigare anställds e-postlåda och saknade MFA. Angriparen ändrade namnservrarna till sina egna, utfärdade ett giltigt certifikat, styrde om e-posten och fångade upp e-post för lösenordsåterställning till personal- och kundkonton."
      ]),
      attackerTimeline: [
        { at: -4320, text: L(["Phishing email to the registrar contact address.", "Nätfiskemeddelande till kontaktadressen hos registraren."]) },
        { at: -180, text: L(["Registrar account logged into; name servers changed.", "Inloggning på registrarkontot; namnservrarna ändras."]) },
        { at: -120, text: L(["Valid certificate issued for the domain.", "Giltigt certifikat utfärdas för domänen."]) },
        { at: -90, text: L(["Mail records point to attacker server.", "E-postposterna pekar på angriparens server."]) },
        { at: -30, text: L(["First password-reset emails intercepted.", "De första e-postmeddelandena för lösenordsåterställning fångas upp."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-registrar", revealStage: "p2", text: L(["The registrar account was taken over and the name servers changed.", "Registrarkontot har tagits över och namnservrarna ändrats."]) },
      { id: "hf-mx", revealStage: "p3", text: L(["Mail to the domain is redirected and password-reset emails are being intercepted.", "E-post till domänen styrs om och e-post för lösenordsåterställning fångas upp."]) },
      { id: "hf-cert", revealStage: "p5", text: L(["A certificate authority issued a trusted certificate for the domain to the attacker's key.", "En certifikatutfärdare utfärdade ett betrott certifikat för domänen till angriparens nyckel."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Certificate warnings", "Certifikatvarningar"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. A quiet weekend, until the duty phone at {{org.name}} rings: customers cannot log in to {{org.service.customer|lcfirst}}.\n\nSome see a browser warning that the site is not secure; for others it loads one minute and fails the next. From the office network everything looks normal. The hosting provider had maintenance this week, and it is tempting to wait until Monday.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. En lugn helg, tills jourtelefonen hos {{org.name}} ringer: kunder kan inte logga in i {{org.service.customer|lcfirst}}.\n\nEn del ser en varning i webbläsaren om att sajten inte är säker; för andra laddas den ena minuten och fungerar inte nästa. Från kontorsnätet ser allt normalt ut. Driftleverantören hade underhåll i veckan, och det är frestande att vänta till måndag."
        ]),
        injects: [
          inj("i1-1", 0, "customerComplaint", "customer", "medium", "unverified", [
            "“My browser warns that the site isn't secure. Sometimes it loads, sometimes it doesn't. Is something wrong?”",
            "”Min webbläsare varnar för att sidan inte är säker. Ibland laddas den, ibland inte. Är något fel?”"
          ], { statedReliability: ["Single customer", "Enskild kund"], tests: ["lo1"] }),
          inj("i1-2", 15, "ticket", "serviceDesk", "medium", "confirmed", [
            "Several similar reports. From the office network, the site works normally. Staff at home see errors.",
            "Flera liknande rapporter. Från kontorsnätet fungerar webbplatsen normalt. Personal hemma ser fel."
          ], { tests: ["lo1"] }),
          inj("i1-3", 30, "chat", "itOps", "low", "misleading", [
            "IT on call: “Classic hosting provider problem. They had maintenance this week. I'll open a ticket on Monday.”",
            "IT-beredskapen: ”Klassiskt problem hos driftleverantören. De hade underhåll i veckan. Jag öppnar ett ärende på måndag.”"
          ], { optional: true, difficulties: ["intermediate", "advanced", "executive"], facilitatorNote: ["Plausible and wrong. Waiting until Monday gives the attacker two days of intercepted mail.", "Rimligt och fel. Att vänta till måndag ger angriparen två dagar av uppfångad e-post."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("What does the domain resolve to from outside your network?", "Vad pekar domänen på utanför ert nätverk?", ["networkLead"]),
            q("Why would the office see something different from home?", "Varför skulle kontoret se något annat än de som sitter hemma?", ["networkLead", "itOps"]),
            q("Who can check the domain's registration at the registrar?", "Vem kan kontrollera domänens registrering hos registraren?", ["networkLead"])
          ],
          executive: [
            q("Is this worth calling people in on a weekend?", "Är det här värt att kalla in folk på en helg?", ["incidentCommander"]),
            q("What do customers see, and what should you tell them?", "Vad ser kunderna, och vad bör ni säga till dem?", ["comms", "serviceOwner"]),
            q("Who owns your domain name, as a business asset?", "Vem äger ert domännamn, som tillgång i verksamheten?", ["cio"])
          ]
        },
        challenges: [ch("The hosting provider's support doesn't answer on weekends.", "Driftleverantörens support svarar inte på helger.")],
        decision: dec("d1", "networkLead", ["What do you do?", "Vad gör ni?"], [
          ["Check public DNS and the registrar records now, from outside the office network.", "Kontrollera publik DNS och registrarens uppgifter nu, utanför kontorsnätet."],
          ["Open a ticket with the hosting provider and wait.", "Öppna ett ärende hos driftleverantören och vänta."],
          ["Restart the web servers: a stuck certificate on one node causes exactly these warnings.", "Starta om webbservrarna: ett fastnat certifikat på en nod ger exakt de här varningarna."]
        ], {
          knowns: [["Customers see certificate warnings.", "Kunderna ser certifikatvarningar."], ["The office sees no problem.", "Kontoret ser inget problem."]],
          uncertainties: [["Whether this is a fault or an attack.", "Om det här är ett fel eller ett angrepp."]],
          tradeoffs: {
            operational: ["Calling people in on a weekend for a provider fault is costly.", "Att kalla in folk på en helg för ett leverantörsfel kostar."],
            security: ["Certificate warnings plus inconsistent results suggest redirection.", "Certifikatvarningar och olika resultat tyder på omdirigering."],
            legal: ["No change yet.", "Ingen förändring ännu."],
            reputational: ["Customers are already worried.", "Kunderna är redan oroliga."]
          },
          evaluation: [["Checks resolution from outside before assuming a fault", "Kontrollerar namnuppslagningen utifrån innan ett fel antas"]],
          pushback: {
            A: [
              pb(["Where is the registrar login?", "Var finns inloggningen till registraren?"], ["To check the registrar records, someone needs the registrar login. Nobody on call knows where it is kept or whose name the account is under. Do you start phoning people at home on a weekend for a check that may show nothing?", "För att kontrollera registrarens uppgifter behövs inloggningen till registraren. Ingen i beredskapen vet var den förvaras eller i vems namn kontot står. Börjar ni ringa folk hemma en helg för en kontroll som kanske inte visar något?"]),
              pb(["“You're overreacting”", "”Ni överreagerar”"], ["The on-call IT engineer says this is obviously the provider's maintenance and that checking DNS on a weekend is overkill. The network lead is at a family event. Do you pull someone in on a hunch, against your own on-call's judgement?", "IT-beredskapen säger att det här uppenbart beror på leverantörens underhåll och att kontrollera DNS en helg är överdrivet. Nätverksansvarig är på en familjetillställning. Kallar ni in någon på en känsla, mot er egen beredskaps bedömning?"]),
              pb(["The first check looks fine", "Den första kontrollen ser bra ut"], ["The first lookup from a phone on mobile data returns your normal address; that phone's network may still be serving an old cached answer. One outside check now says nothing is wrong. Do you stop there, or keep checking from more places?", "Den första uppslagningen från en telefon på mobildata ger er vanliga adress; telefonens nät kan fortfarande ge ett gammalt cachat svar. En kontroll utifrån säger nu att inget är fel. Stannar ni där, eller fortsätter ni kontrollera från fler ställen?"])
            ],
            B: [
              pb(["Monday, says the robot", "Måndag, säger roboten"], ["The provider's automatic reply says weekend tickets are handled on Monday. Customer complaints have doubled since you opened the ticket. How many complaints is enough to stop waiting?", "Leverantörens automatiska svar säger att ärenden som kommer in under helgen hanteras på måndag. Klagomålen från kunderna har fördubblats sedan ni öppnade ärendet. Hur många klagomål krävs för att ni ska sluta vänta?"]),
              pb(["What do we tell callers?", "Vad säger vi till dem som ringer?"], ["Customer service asks what to tell people who can't log in or see security warnings. “The provider is looking at it” is all you have, and the provider isn't looking. What do they say to a customer asking if it is safe?", "Kundtjänst frågar vad de ska säga till dem som inte kan logga in eller får säkerhetsvarningar. ”Leverantören tittar på det” är allt ni har, och leverantören tittar inte. Vad ska de svara en kund som frågar om det är säkert?"]),
              pb(["The provider says it's not them", "Leverantören säger att det inte är de"], ["A contact at the provider answers informally: their maintenance finished midweek and their monitoring shows your servers healthy. If it isn't them, nobody is looking at all. Do you still wait for the ticket?", "En kontakt hos leverantören svarar informellt: underhållet blev klart i mitten av veckan och deras övervakning visar att era servrar mår bra. Om det inte är de tittar ingen alls. Väntar ni fortfarande på ärendet?"])
            ],
            C: [
              pb(["Nothing changes", "Ingenting ändras"], ["The restart is done and the servers come back clean, but customers report exactly the same warnings. You have spent an hour fixing a node that may have been fine. What does that tell you, and what do you try next?", "Omstarten är klar och servrarna kommer upp utan fel, men kunderna rapporterar exakt samma varningar. Ni har lagt en timme på att laga en nod som kanske var hel. Vad säger det er, och vad provar ni härnäst?"]),
              pb(["Everyone logged out", "Alla utloggade"], ["The restart logged out every customer who could still reach you, so now they are complaining too. Service owners ask for a warning next time. Do you keep restarting nodes one by one, or stop and look somewhere else?", "Omstarten loggade ut alla kunder som fortfarande nådde er, så nu klagar även de. Tjänsteägaren vill ha en förvarning nästa gång. Fortsätter ni starta om noder en i taget, eller slutar ni och letar någon annanstans?"]),
              pb(["Why only from home?", "Varför bara hemifrån?"], ["From the office, the site worked before the restart and works after it. The warnings seem to depend on where people are, not on your servers. Why would a stuck certificate on one node do that?", "Från kontoret fungerade sajten före omstarten och fungerar efter den. Varningarna verkar bero på var folk befinner sig, inte på era servrar. Varför skulle ett fastnat certifikat på en nod ge det mönstret?"])
            ]
          }
        }),
        facilitator: fac(
          ["The office uses internal DNS and sees nothing. That's the clue.", "Kontoret använder intern DNS och ser ingenting. Det är ledtråden."],
          ["An outside-in check of DNS and registrar records.", "En kontroll av DNS och registrarens uppgifter utifrån."],
          [["Ask: what is different between the office and home?", "Fråga: vad skiljer kontoret från hemmet?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["Someone else's name servers", "Någon annans namnservrar"]),
        twist: L(["The domain's name servers were changed at the registrar three hours ago. The registrar account was taken over.", "Domänens namnservrar ändrades hos registraren för tre timmar sedan. Registrarkontot har tagits över."]),
        twistKind: "cause",
        assumptionChallenged: L(["The hosting provider misconfigured something.", "Driftleverantören har konfigurerat något fel."]),
        reveals: ["hf-registrar"],
        narrative: L([
          "{{time.T+60|clock}}. The network lead wants to see what the outside world sees, so they run a lookup from a phone on mobile data instead of the office network.\n\nThe answer is not a hosting problem. The address book of the internet now sends people looking for {{org.domain}} somewhere you do not control.",
          "Klockan {{time.T+60|clock}}. Nätverksansvarig vill se det som omvärlden ser, så hen gör en uppslagning från en telefon med mobildata i stället för kontorsnätet.\n\nSvaret är inget driftproblem. Internets adressbok skickar nu den som letar efter {{org.domain}} till ett ställe ni inte kontrollerar."
        ]),
        injects: [
          inj("i2-1", 60, "networkEvidence", "itOps", "critical", "confirmed", [
            "{{org.domain}} now uses name servers you don't recognise, changed at {{time.T-180|clock}}. The web address points to {{asset.attackerIp}}. The registrar portal rejects your login: the password was changed.",
            "{{org.domain}} använder nu namnservrar som ni inte känner igen, ändrade klockan {{time.T-180|clock}}. Webbadressen pekar på {{asset.attackerIp}}. Registrarens portal avvisar er inloggning: lösenordet har ändrats."
          ], { headline: ["Domain hijacked", "Domänen kapad"], reveals: ["hf-registrar"], tests: ["lo1"] })
        ],
        charts: [{
          id: "c2-resolve", type: "line",
          title: L(["Share of lookups going to the attacker's server", "Andel uppslagningar som går till angriparens server"]), unit: L(["per cent", "procent"]),
          caption: L(["Rises as cached records expire.", "Ökar i takt med att cachade poster löper ut."]),
          data: line(["Redirected", "Omdirigerade"], -180, 120, 30, (x, ctx) => Math.min(100, Math.max(0, (x + 180) / (ctx.vars.ttlHours * 60) * 100 * 3)))
        }],
        questions: {
          technical: [
            q("How do you reach the registrar out of hours?", "Hur når ni registraren utanför kontorstid?", ["networkLead", "supplierManager"]),
            q("What else did the attacker change: mail records, certificates?", "Vad mer ändrade angriparen: e-postposter, certifikat?", ["networkLead"]),
            q("Did checking from outside save you time?", "Sparade kontrollen utifrån tid åt er?", ["networkLead"], "d1")
          ],
          executive: [
            q("Do you warn customers now that the site isn't yours?", "Varnar ni kunderna nu för att webbplatsen inte är er?", ["comms", "serviceOwner"]),
            q("Is this a matter for the police?", "Är det här en fråga för polisen?", ["legal", "ciso"]),
            q("Would you have waited until Monday?", "Skulle ni ha väntat till måndag?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Cached records keep some customers on the real site for hours, hiding the scale.", "Cachade poster håller kvar en del kunder på den riktiga webbplatsen i flera timmar och döljer omfattningen.")],
        decision: dec("d2", "incidentCommander", ["What do you do now?", "Vad gör ni nu?"], [
          ["Escalate to the registrar's emergency line, warn customers on other channels and call in the team.", "Eskalera till registrarens nödlinje, varna kunderna via andra kanaler och kalla in teamet."],
          ["Email the registrar and wait for an answer.", "Mejla registraren och vänta på svar."],
          ["Take the real site offline.", "Ta ned den riktiga webbplatsen."]
        ], {
          knowns: [["The domain points to the attacker.", "Domänen pekar på angriparen."]],
          uncertainties: [["What the attacker is doing with it.", "Vad angriparen gör med den."]],
          tradeoffs: {
            operational: ["Warning customers off your own domain is unusual.", "Att varna kunderna för er egen domän är ovanligt."],
            security: ["Every hour gives the attacker more traffic.", "Varje timme ger angriparen mer trafik."],
            legal: ["Customers' data may be harvested.", "Kundernas uppgifter kan samlas in."],
            reputational: ["Customers will remember how quickly they were warned.", "Kunderna kommer att minnas hur snabbt de blev varnade."]
          },
          evaluation: [["Warns customers through channels the attacker doesn't control", "Varnar kunderna via kanaler som angriparen inte kontrollerar"]],
          pushback: {
            A: [
              pb(["The emergency line rings out", "Nödlinjen svarar inte"], ["The registrar's emergency number goes to voicemail, and its website says weekend support is “limited”. The team you called in is sitting around waiting. Who keeps calling, and what does everyone else do in the meantime?", "Registrarens nödnummer går till röstbrevlådan, och webbplatsen säger att helgsupporten är ”begränsad”. Teamet ni kallade in sitter och väntar. Vem fortsätter ringa, och vad gör alla andra under tiden?"]),
              pb(["“Don't use our website”", "”Använd inte vår webbplats”"], ["Comms drafts the warning. Sales says it will cause panic and drive away customers whose caches still send them to the real site. Do you send it as written, or soften it and risk people missing the point?", "Kommunikation skriver varningen. Försäljning säger att den kommer att skapa panik och skrämma bort kunder vars cache fortfarande skickar dem till den riktiga sajten. Skickar ni den som den är, eller mildrar ni den och riskerar att folk missar poängen?"]),
              pb(["Which channels are really yours?", "Vilka kanaler är verkligen era?"], ["Your social media and SMS accounts log in with addresses on {{org.domain}}. If any of them asks to confirm a login by email mid-warning, you may not get in. Do you know which of your channels you actually still control?", "Era konton i sociala medier och för sms loggar in med adresser på {{org.domain}}. Om något av dem ber om en bekräftelse via e-post mitt i varningen kanske ni inte kommer in. Vet ni vilka av era kanaler ni faktiskt fortfarande kontrollerar?"])
            ],
            B: [
              pb(["Two business days", "Två arbetsdagar"], ["The registrar's auto-reply promises an answer within two business days. It is the weekend, and the redirected share of traffic keeps rising as caches expire. Is an email queue really how you want to fight for your own domain?", "Registrarens automatiska svar utlovar besked inom två arbetsdagar. Det är helg, och andelen omdirigerad trafik fortsätter att öka i takt med att cachen löper ut. Är en e-postkö verkligen sättet ni vill slåss för er egen domän på?"]),
              pb(["Passwords typed into their page", "Lösenord på deras sida"], ["While you wait, every customer who logs in may be typing their password into a server you don't control. Customer service has already had a caller who “logged in fine”. How many hours of that is waiting worth?", "Medan ni väntar kan varje kund som loggar in skriva sitt lösenord på en server ni inte kontrollerar. Kundtjänst har redan haft en kund som ringde och sa att inloggningen ”gick bra”. Hur många timmar av det är väntan värd?"]),
              pb(["Nobody is watching", "Ingen håller koll"], ["You chose not to call the team in for an email. The network lead asks who will notice if the attacker changes something else tonight. Is anyone watching, and who decided that was acceptable?", "Ni valde att inte kalla in teamet för ett mejl. Nätverksansvarig frågar vem som märker om angriparen ändrar något mer i natt. Håller någon koll, och vem bestämde att det var acceptabelt?"])
            ],
            C: [
              pb(["The domain still points there", "Domänen pekar fortfarande dit"], ["Taking your servers offline doesn't change where the domain points. Customers who reach the attacker see no difference; those still reaching your real site now see nothing. Who exactly did you protect?", "Att ta ned era servrar ändrar inte vart domänen pekar. Kunder som hamnar hos angriparen märker ingen skillnad; de som fortfarande når er riktiga sajt ser nu ingenting. Vem var det egentligen ni skyddade?"]),
              pb(["Customers keep retrying", "Kunderna försöker igen och igen"], ["With the real site gone, customers assume an outage and keep retrying until they land on the attacker's page. Nobody has told them why. Do you need a warning more than you needed the shutdown?", "När den riktiga sajten är borta tror kunderna att det är ett avbrott och försöker igen tills de hamnar på angriparens sida. Ingen har berättat varför. Behöver ni en varning mer än ni behövde nedstängningen?"]),
              pb(["The service owner objects", "Tjänsteägaren invänder"], ["The service owner says the real site was the only genuine page some customers could still reach, and switching it off hands the attacker all your traffic. Do you bring it back up, and what does that say about the decision?", "Tjänsteägaren säger att den riktiga sajten var den enda äkta sidan som en del kunder fortfarande nådde, och att stänga den ger angriparen all er trafik. Startar ni den igen, och vad säger det om beslutet?"])
            ]
          }
        }),
        facilitator: fac(
          ["Your own domain is now hostile. Which channels can you trust?", "Er egen domän är nu fientlig. Vilka kanaler kan ni lita på?"],
          ["Registrar emergency escalation and customer warnings on other channels.", "Eskalering till registrarens nödlinje och varningar till kunderna via andra kanaler."],
          [["Ask: if your website and email are the attacker's, how do you speak?", "Fråga: om er webbplats och e-post tillhör angriparen, hur kommunicerar ni?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 150,
        title: L(["Their mail, your resets", "Deras e-post, era återställningar"]),
        twist: L(["Mail to your domain now goes to the attacker. Password-reset emails for staff and customer accounts are being intercepted.", "E-post till er domän går nu till angriparen. E-post för lösenordsåterställning till personal- och kundkonton fångas upp."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "Mail to your domain now goes to the attacker. If you warned customers on other channels, the attacker has seen the warning too. If you waited for the registrar, resets have been intercepted for hours.", sv: "E-post till er domän går nu till angriparen. Om ni varnade kunderna i andra kanaler har angriparen också sett varningen. Om ni väntade på registraren har återställningar fångats upp i flera timmar." } },
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because customers were warned on other channels, many now ignore every email from you, including the real one with the recovery steps.", sv: "Eftersom kunderna varnades i andra kanaler ignorerar många nu varje mejl från er, även det äkta med instruktionerna för återställning." } }
        ],
        assumptionChallenged: L(["This is only about the website.", "Det här handlar bara om webbplatsen."]),
        reveals: ["hf-mx"],
        narrative: L([
          "{{time.T+150|clock}}. The SOC notices a wave of password-reset activity, for staff and customer accounts alike.\n\nYour website is only part of what the domain does. Every email sent to an address at {{org.domain}} also depends on it, and that includes the emails that let people reset forgotten passwords.",
          "Klockan {{time.T+150|clock}}. SOC ser en våg av lösenordsåterställningar, för både personal- och kundkonton.\n\nEr webbplats är bara en del av det domänen gör. Varje mejl till en adress på {{org.domain}} är också beroende av den, och det gäller även de mejl som låter folk återställa glömda lösenord."
        ]),
        injects: [
          inj("i3-1", 150, "authLog", "siem", "critical", "confirmed", [
            "{{num.resetsIntercepted}} password resets requested since {{time.T-30|clock}} for staff accounts at external services — payroll, cloud, the code platform — and for customer accounts. The reset emails were delivered to the attacker's mail server.",
            "{{num.resetsIntercepted}} lösenordsåterställningar har begärts sedan klockan {{time.T-30|clock}} för personalkonton i externa tjänster – lön, moln, kodplattformen – och för kundkonton. E-posten för återställning levererades till angriparens e-postserver."
          ], { headline: ["Reset emails intercepted", "E-post för återställning uppfångad"], reveals: ["hf-mx"], tests: ["lo2"] })
        ],
        charts: [{
          id: "c3-kpi", type: "kpi",
          title: L(["Exposure so far", "Exponeringen hittills"]),
          data: kpi([
            { id: "resets", label: ["Resets intercepted", "Uppfångade återställningar"], value: (v) => v.resetsIntercepted, tone: "danger" },
            { id: "cust", label: ["Customers possibly redirected", "Kunder som kan ha omdirigerats"], value: (v) => v.customersAffected, tone: "warn" },
            { id: "ttl", label: ["Hours until caches clear", "Timmar tills cachen töms"], value: (v) => v.ttlHours, tone: "info" }
          ])
        }],
        questions: {
          technical: [
            q("Which external services use your domain for resets?", "Vilka externa tjänster använder er domän för återställningar?", ["itOps", "socLead"]),
            q("How do you lock those accounts without email?", "Hur låser ni de kontona utan e-post?", ["itOps"]),
            q("Did the team you called in have the right access?", "Hade teamet som ni kallade in rätt behörigheter?", ["itOps"], "d2")
          ],
          executive: [
            q("Which accounts matter most: payroll, cloud, code?", "Vilka konton är viktigast: lön, moln, kod?", ["cio", "ciso"]),
            q("What do you tell customers whose resets were intercepted?", "Vad säger ni till kunderna vars återställningar fångades upp?", ["comms", "dpo"]),
            q("Did warning customers early limit this?", "Begränsade den tidiga varningen till kunderna det här?", ["comms"], "d2")
          ]
        },
        challenges: [ch("You don't have a list of every external service that uses your domain.", "Ni har ingen lista över alla externa tjänster som använder er domän.")],
        decision: dec("d3", "ciso", ["How do you stop the account takeovers?", "Hur stoppar ni kapningarna av konton?"], [
          ["Lock the most critical external accounts by phone and in-app, revoke sessions and suspend email-based resets.", "Lås de mest kritiska externa kontona via telefon och i tjänsterna, återkalla sessioner och stoppa återställningar via e-post."],
          ["Put everything into getting the domain back: every account you lock now is one more customer locked out.", "Lägg allt på att få tillbaka domänen: varje konto ni låser nu är ytterligare en utelåst kund."],
          ["Change all staff passwords.", "Byt alla lösenord för personalen."]
        ], {
          knowns: [["Reset emails go to the attacker.", "E-post för återställning går till angriparen."]],
          uncertainties: [["Which resets succeeded.", "Vilka återställningar som lyckades."]],
          tradeoffs: {
            operational: ["Locking accounts stops legitimate work.", "Att låsa konton stoppar legitimt arbete."],
            security: ["Password changes are useless if resets still go to the attacker.", "Lösenordsbyten är meningslösa om återställningarna fortfarande går till angriparen."],
            legal: ["Customer accounts may hold personal data.", "Kundkonton kan innehålla personuppgifter."],
            reputational: ["Account takeovers spread the damage.", "Kapade konton sprider skadan."]
          },
          evaluation: [["Recognises that email itself is compromised", "Inser att e-posten i sig är komprometterad"]],
          minutes: 10,
          pushback: {
            A: [
              pb(["Customers locked out", "Kunder utelåsta"], ["With email resets suspended, any customer who forgets a password simply can't get back in. Customer service is already taking angry calls. How long can you keep resets off when there is no date for getting the domain back?", "När återställning via e-post är avstängd kommer en kund som glömt sitt lösenord helt enkelt inte in. Kundtjänst tar redan emot arga samtal. Hur länge kan ni hålla återställningarna stängda när det inte finns något datum för att få tillbaka domänen?"]),
              pb(["Critical, but what else?", "Kritiska, men vad mer?"], ["You lock payroll, cloud and the code platform. The SOC now sees reset attempts for services nobody in the room recognises, signed up with staff addresses on your domain. What about the accounts you didn't know you had?", "Ni låser lön, moln och kodplattformen. SOC ser nu försök till återställning för tjänster som ingen i rummet känner igen, registrerade med personalens adresser på er domän. Vad gör ni med kontona ni inte visste att ni hade?"]),
              pb(["Prove who you are", "Bevisa vem ni är"], ["The cloud provider's support line asks you to verify the request by replying to an email sent to your admin address. That address is on your domain. How do you prove you are you, when the proof goes to the attacker?", "Molnleverantörens support ber er verifiera begäran genom att svara på ett mejl till er administratörsadress. Den adressen ligger på er domän. Hur bevisar ni att ni är ni, när beviset går till angriparen?"])
            ],
            B: [
              pb(["Resets keep completing", "Återställningarna fortsätter"], ["While everyone works on the registrar, the SOC watches reset after reset go through for staff accounts. Each one may be an account the attacker keeps after the domain is back. How many are you willing to lose?", "Medan alla arbetar mot registraren ser SOC den ena återställningen efter den andra gå igenom för personalkonton. Varje sådan kan vara ett konto som angriparen behåller även när domänen är tillbaka. Hur många är ni beredda att förlora?"]),
              pb(["Payroll is calling", "Lönetjänsten ringer"], ["The payroll service phones to say bank details on a staff account were just changed after a password reset. They ask whether to block further changes. Is the domain still the only priority?", "Lönetjänsten ringer och säger att bankuppgifterna på ett personalkonto just ändrades efter en lösenordsåterställning. De frågar om de ska spärra fler ändringar. Är domänen fortfarande det enda som gäller?"]),
              pb(["Nothing protected meanwhile", "Inget skyddas under tiden"], ["The registrar still hasn't given a timeline. “Get the domain back” has no end date, and nothing else is being protected while you wait. What happens to the accounts if it takes days?", "Registraren har fortfarande inte gett någon tidsplan. ”Få tillbaka domänen” har inget slutdatum, och inget annat skyddas medan ni väntar. Vad händer med kontona om det tar flera dagar?"])
            ],
            C: [
              pb(["Confirmations go to them", "Bekräftelserna går till dem"], ["Several services confirm a password change by email, and some send a link to finish it. Those emails go to your domain, which the attacker now receives. Did changing passwords just hand them fresh links?", "Flera tjänster bekräftar ett lösenordsbyte via e-post, och en del skickar en länk för att slutföra det. De mejlen går till er domän, som angriparen nu tar emot. Gav lösenordsbytet dem just nya länkar?"]),
              pb(["Customers forgotten", "Kunderna glömda"], ["Changing staff passwords does nothing for customer accounts, whose resets are being intercepted too. Customer service asks what customers should do right now. What is your answer?", "Att byta personalens lösenord gör ingenting för kundkontona, vars återställningar också fångas upp. Kundtjänst frågar vad kunderna ska göra just nu. Vad är ert svar?"]),
              pb(["A weekend of lockouts", "En helg av utelåsningar"], ["Staff at home are locked out after the forced change, and the service desk is two people. The SOC can't reach colleagues it needs. Was the disruption worth what it actually protected?", "Personal hemma är utelåst efter det tvingade bytet, och servicedesk består av två personer. SOC når inte de kollegor de behöver. Var störningen värd det den faktiskt skyddade?"])
            ]
          }
        }),
        facilitator: fac(
          ["DNS control is identity control. This is the key insight.", "Kontroll över DNS är kontroll över identitet. Det här är den viktigaste insikten."],
          ["Critical accounts locked without relying on email.", "Kritiska konton låsta utan att förlita sig på e-post."],
          [["Ask: what does password reset by email assume?", "Fråga: vad förutsätter lösenordsåterställning via e-post?"]]
        )
      },
      {
        id: "p4",
        priority: 1,
        clock: 300,
        title: L(["Only the former owner can ask", "Bara den tidigare ägaren kan begära"]),
        twist: L(["The registrar says only the registered contact can request recovery — a former employee who left last year.", "Registraren säger att bara den registrerade kontaktpersonen kan begära återställning – en tidigare anställd som slutade förra året."]),
        twistKind: "authority",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because email-based resets were suspended, customer service has taken five hundred calls from people locked out of their accounts.", sv: "Eftersom återställning via e-post stängdes av har kundtjänst tagit emot femhundra samtal från personer som är utelåsta från sina konton." } }
        ],
        assumptionChallenged: L(["We own our domain; recovery is a formality.", "Vi äger vår domän; återtagandet är en formalitet."]),
        narrative: L([
          "{{time.T+300|clock}}. After hours of trying, the registrar's weekend support finally answers the phone.\n\nGetting the domain back should be simple: you have owned it for fifteen years. The registrar's rules say otherwise, and the person those rules point to is no longer anywhere near the company.",
          "Klockan {{time.T+300|clock}}. Efter flera timmars försök svarar registrarens helgsupport till slut i telefon.\n\nAtt få tillbaka domänen borde vara enkelt: ni har ägt den i femton år. Registrarens regler säger något annat, och den person som reglerna pekar på finns inte längre i närheten av företaget."
        ]),
        injects: [
          inj("i4-1", 300, "phoneTranscript", "supplier", "high", "confirmed", [
            "{{supplier.registrar}}: “The account holder is listed as a person at an address on your domain. We need them, or a formal company request with identification. That takes {{num.registrarHours}} hours.”",
            "{{supplier.registrar}}: ”Kontoinnehavaren är registrerad som en person med en adress på er domän. Vi behöver den personen, eller en formell begäran från företaget med legitimation. Det tar {{num.registrarHours}} timmar.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Can the domain's top-level registry help faster?", "Kan registret för toppdomänen hjälpa till snabbare?", ["networkLead"]),
            q("Can you protect services meanwhile, for example by moving logins elsewhere?", "Kan ni skydda tjänsterna under tiden, till exempel genom att flytta inloggningar någon annanstans?", ["itOps", "networkLead"]),
            q("Are the locked accounts holding?", "Håller de låsta kontona?", ["socLead"], "d3")
          ],
          executive: [
            q("Who can sign a formal company request today?", "Vem kan skriva under en formell begäran från företaget i dag?", ["legal", "cio"]),
            q("Do you contact the former employee?", "Kontaktar ni den tidigare anställda?", ["cio", "legal"]),
            q("Is waiting {{num.registrarHours}} hours acceptable?", "Är det acceptabelt att vänta i {{num.registrarHours}} timmar?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("The former employee's email address is on the hijacked domain.", "Den tidigare anställdas e-postadress ligger på den kapade domänen.")],
        decision: dec("d4", "cio", ["How do you speed up recovery?", "Hur påskyndar ni återtagandet?"], [
          ["Submit a formal request signed by an authorised officer, escalate to the registry and reach the former employee by phone.", "Lämna in en formell begäran som undertecknats av en behörig firmatecknare, eskalera till registret och nå den tidigare anställda per telefon."],
          ["Wait for the standard process.", "Vänta på den vanliga processen."],
          ["Register a new domain and move customers.", "Registrera en ny domän och flytta kunderna."]
        ], {
          knowns: [["Recovery needs the registered contact or a formal request.", "Återtagandet kräver den registrerade kontaktpersonen eller en formell begäran."]],
          uncertainties: [["Whether the registrar will act faster.", "Om registraren kommer att agera snabbare."]],
          tradeoffs: {
            operational: ["Formal requests need signatories on a weekend.", "Formella begäranden kräver firmatecknare på en helg."],
            security: ["Every hour, more resets are intercepted.", "För varje timme fångas fler återställningar upp."],
            legal: ["Proof of ownership must be solid.", "Beviset på ägarskap måste vara stabilt."],
            reputational: ["A new domain confuses customers and helps phishers.", "En ny domän förvirrar kunderna och hjälper nätfiskare."]
          },
          evaluation: [["Pursues every route to recovery at once", "Driver alla vägar till återtagande samtidigt"]],
          pushback: {
            A: [
              pb(["“Why should I help?”", "”Varför ska jag hjälpa er?”"], ["You reach the former employee by phone. They left on bad terms, ask why they should give up their weekend, and whether they are being accused of something. Do you push, offer something, or carry on without them?", "Ni når den tidigare anställda per telefon. Hen slutade i osämja, frågar varför hen ska offra sin helg och om hen anklagas för något. Pressar ni på, erbjuder ni något, eller fortsätter ni utan hen?"]),
              pb(["No signatory in reach", "Ingen firmatecknare inom räckhåll"], ["The only people authorised to sign for the company are abroad until after the weekend. A scanned signature may not satisfy the registrar. Who signs, and will it hold up?", "De enda som får teckna firman är utomlands tills helgen är över. En inskannad underskrift kanske inte räcker för registraren. Vem skriver under, och kommer det att hålla?"]),
              pb(["The registry sends you back", "Registret skickar tillbaka er"], ["The registry replies that it only acts through the registrar, and points you back to the {{num.registrarHours}}-hour process. Your team is now spread over three routes. Do you keep pushing all of them, or focus where it can make a difference?", "Registret svarar att det bara agerar via registraren och hänvisar er tillbaka till processen på {{num.registrarHours}} timmar. Ert team är nu utspritt på tre spår. Fortsätter ni driva alla, eller fokuserar ni där det kan göra skillnad?"])
            ],
            B: [
              pb(["Hours of their mail", "Timmar av deras e-post"], ["{{num.registrarHours}} more hours means the attacker keeps receiving every email sent to your domain. The SOC expects reset attempts all weekend. Is the standard process fast enough for what is at stake?", "{{num.registrarHours}} timmar till innebär att angriparen fortsätter ta emot varje mejl till er domän. SOC räknar med försök till återställning hela helgen. Är den vanliga processen snabb nog för det som står på spel?"]),
              pb(["Customer service can't keep saying it", "Kundtjänst orkar inte säga det"], ["Customer service says they cannot keep telling callers for {{num.registrarHours}} hours that nothing can be done. Some customers say they are leaving. What do you want them to say instead of “we are waiting”?", "Kundtjänst säger att de inte kan fortsätta säga till dem som ringer i {{num.registrarHours}} timmar att inget går att göra. En del kunder säger att de tänker lämna. Vad vill ni att de ska säga i stället för ”vi väntar”?"]),
              pb(["Could they move it?", "Kan de flytta den?"], ["The network lead asks what stops the attacker, who controls the account, from transferring the domain to another registrar while you wait. Nobody in the room knows. Are you sure waiting keeps the domain where it is?", "Nätverksansvarig frågar vad som hindrar angriparen, som styr kontot, från att flytta domänen till en annan registrar medan ni väntar. Ingen i rummet vet. Är ni säkra på att väntan håller kvar domänen där den är?"])
            ],
            C: [
              pb(["It looks like phishing", "Det ser ut som nätfiske"], ["Customers receive a message from an unfamiliar domain telling them to log in there instead. To them it looks exactly like the phishing you warned them about. How do you prove the new domain is yours?", "Kunderna får ett meddelande från en okänd domän som säger att de ska logga in där i stället. För dem ser det ut precis som nätfisket ni varnade dem för. Hur bevisar ni att den nya domänen är er?"]),
              pb(["Everything uses the old name", "Allt använder det gamla namnet"], ["Every integration, partner contract, app and invoice uses {{org.domain}}. The service owner estimates weeks to move them all. Is the new domain a rescue, or a second project in the middle of the first?", "Varje integration, partneravtal, app och faktura använder {{org.domain}}. Tjänsteägaren bedömer att det tar veckor att flytta allt. Är den nya domänen en räddning, eller ett andra projekt mitt i det första?"]),
              pb(["The old one stays theirs", "Den gamla förblir deras"], ["Moving customers does nothing to recover {{org.domain}}. The attacker keeps receiving its mail and resets for as long as they hold it. Have you given up on the thing you most need back?", "Att flytta kunderna gör ingenting för att återta {{org.domain}}. Angriparen fortsätter ta emot dess e-post och återställningar så länge hen har den. Har ni gett upp det ni mest behöver få tillbaka?"])
            ]
          }
        }),
        facilitator: fac(
          ["A governance gap revealed: who owns the domain on paper?", "En brist i styrningen blottläggs: vem äger domänen på pappret?"],
          ["Formal request, registry escalation and contact with the former employee.", "Formell begäran, eskalering till registret och kontakt med den tidigare anställda."],
          [["Ask: who is the registered owner of your domain today?", "Fråga: vem är registrerad ägare av er domän i dag?"]]
        )
      },
      {
        id: "p5",
        priority: 2,
        clock: 720,
        title: L(["A valid padlock", "Ett giltigt hänglås"]),
        twist: L(["The attacker obtained a valid certificate for your domain. Their copy of your login page now shows no warning at all.", "Angriparen har skaffat ett giltigt certifikat för er domän. Deras kopia av er inloggningssida visar nu ingen varning alls."]),
        twistKind: "scope",
        reconsider: { decision: "d3", pressure: { en: "The attacker's copy of your login page now shows a valid padlock. Was the way you protected accounts strong enough?", sv: "Angriparens kopia av er inloggningssida visar nu ett giltigt hänglås. Var ert sätt att skydda kontona tillräckligt starkt?" } },
        assumptionChallenged: L(["Customers will see a warning and stay away.", "Kunderna kommer att se en varning och hålla sig borta."]),
        reveals: ["hf-cert"],
        narrative: L([
          "{{time.T+720|clock}}. The certificate warnings that customers reported this morning have stopped. Some in the room take it as a sign that things are improving.\n\nThe network lead does not. The warnings were the one thing that told customers something was wrong. Without them, the attacker's site looks exactly like yours.",
          "Klockan {{time.T+720|clock}}. Certifikatvarningarna som kunderna rapporterade i morse har upphört. En del i rummet ser det som ett tecken på att det blir bättre.\n\nNätverksansvarig gör det inte. Varningarna var det enda som sa till kunderna att något var fel. Utan dem ser angriparens sajt exakt ut som er."
        ]),
        injects: [
          inj("i5-1", 720, "threatIntel", "threatIntel", "high", "confirmed", [
            "Certificate transparency logs show a certificate for {{org.domain}} issued at {{time.T-120|clock}} to a key you don't hold. The fake login page now looks perfect.",
            "Loggar för certifikattransparens visar ett certifikat för {{org.domain}} som utfärdades klockan {{time.T-120|clock}} till en nyckel som ni inte har. Den falska inloggningssidan ser nu perfekt ut."
          ], { headline: ["Valid certificate for the attacker", "Giltigt certifikat för angriparen"], reveals: ["hf-cert"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you get the certificate revoked?", "Hur får ni certifikatet återkallat?", ["networkLead"]),
            q("Which controls would stop unauthorised certificates in future?", "Vilka kontroller skulle stoppa obehöriga certifikat framöver?", ["networkLead", "ciso"]),
            q("Did your account lockdown protect customers too?", "Skyddade er låsning av konton även kunderna?", ["itOps"], "d3")
          ],
          executive: [
            q("How do you warn customers when the fake looks real?", "Hur varnar ni kunderna när förfalskningen ser äkta ut?", ["comms"]),
            q("Do you force a password reset for all customers once recovered?", "Tvingar ni fram ett lösenordsbyte för alla kunder när domänen är återtagen?", ["serviceOwner", "dpo"]),
            q("Is your formal recovery request moving?", "Går er formella begäran om återtagande framåt?", ["cio"], "d4")
          ]
        },
        challenges: [ch("Revocation doesn't reach every browser quickly.", "En återkallelse når inte alla webbläsare snabbt.")],
        decision: dec("d5", "ciso", ["How do you protect customers now?", "Hur skyddar ni kunderna nu?"], [
          ["Request revocation, warn customers on every channel you control and plan forced resets with fresh sessions after recovery.", "Begär återkallelse, varna kunderna i varje kanal ni kontrollerar och planera tvingade lösenordsbyten med nya sessioner efter återtagandet."],
          ["Request revocation and wait.", "Begär återkallelse och vänta."],
          ["Say nothing more until the domain is back, so you do not send customers to links the attacker controls.", "Säg inget mer tills domänen är tillbaka, så att ni inte skickar kunderna till länkar som angriparen styr."]
        ], {
          knowns: [["The fake page has a valid certificate.", "Den falska sidan har ett giltigt certifikat."]],
          uncertainties: [["How many customers entered credentials.", "Hur många kunder som har angett sina inloggningsuppgifter."]],
          tradeoffs: {
            operational: ["Forced resets create support load.", "Tvingade lösenordsbyten skapar belastning på supporten."],
            security: ["Harvested passwords will be reused elsewhere.", "Insamlade lösenord kommer att återanvändas på andra ställen."],
            legal: ["Customer credentials are personal data.", "Kundernas inloggningsuppgifter är personuppgifter."],
            reputational: ["Silence now would be hard to forgive.", "Tystnad nu vore svår att förlåta."]
          },
          evaluation: [["Protects customers through every trusted channel", "Skyddar kunderna via varje betrodd kanal"]],
          pushback: {
            A: [
              pb(["Your warning looks like a scam", "Er varning ser ut som bedrägeri"], ["Your warning tells customers to be careful and expect a password reset. Phishers send exactly that message, and some customers report yours as a scam. How do you make a real warning believable?", "Er varning säger åt kunderna att vara försiktiga och räkna med ett lösenordsbyte. Nätfiskare skickar exakt det meddelandet, och en del kunder anmäler ert som bedrägeri. Hur gör ni en äkta varning trovärdig?"]),
              pb(["Force everyone?", "Tvinga alla?"], ["Forced resets for up to {{num.customersAffected}} customers mean a wave of support calls on the very day you recover, to a team already exhausted. Do you force everyone, or only those you can show were exposed?", "Tvingade lösenordsbyten för upp till {{num.customersAffected}} kunder innebär en våg av supportsamtal samma dag som ni återtar domänen, till ett team som redan är slut. Tvingar ni alla, eller bara dem ni kan visa var exponerade?"]),
              pb(["Those who already logged in", "De som redan loggat in"], ["Revocation and warnings protect the next customer, not those who already typed their password into the fake page. The DPO asks what they will be told, and when. Is planning resets for later enough for them?", "Återkallelse och varningar skyddar nästa kund, inte dem som redan har skrivit sitt lösenord på den falska sidan. Dataskyddsombudet frågar vad de ska få veta, och när. Räcker det för dem att planera lösenordsbyten till senare?"])
            ],
            B: [
              pb(["The padlock stays", "Hänglåset sitter kvar"], ["Even once the certificate is revoked, many browsers won't notice for some time. Customers keep seeing a valid padlock on the fake page. What protects them while you wait?", "Även när certifikatet har återkallats märker många webbläsare det inte på ett tag. Kunderna fortsätter att se ett giltigt hänglås på den falska sidan. Vad skyddar dem medan ni väntar?"]),
              pb(["Comms wants to speak", "Kommunikation vill gå ut"], ["Comms says customers are logging in to a perfect fake page right now, and asks why you are silent when you know. Every hour of waiting is another batch of passwords. Who answers for the customers who log in today?", "Kommunikation säger att kunder loggar in på en perfekt falsk sida just nu och frågar varför ni tiger när ni vet. Varje timmes väntan är ännu en omgång lösenord. Vem står till svars för de kunder som loggar in i dag?"]),
              pb(["Prove the domain is yours", "Bevisa att domänen är er"], ["The certificate authority asks you to prove you control the domain before it acts on the revocation. Right now, you can't. Waiting may mean waiting for the domain itself. What else are you doing in the meantime?", "Certifikatutfärdaren ber er visa att ni kontrollerar domänen innan den agerar på återkallelsen. Just nu kan ni inte det. Att vänta kan betyda att vänta på själva domänen. Vad mer gör ni under tiden?"])
            ],
            C: [
              pb(["“Is it safe now?”", "”Är det säkert nu?”"], ["Customers who saw the warnings this morning call to ask whether it is safe now, since the padlock looks fine. Customer service has been told to say nothing. What exactly do they say to that caller?", "Kunder som såg varningarna i morse ringer och frågar om det är säkert nu, eftersom hänglåset ser bra ut. Kundtjänst har fått order att inte säga något. Vad ska de egentligen svara den som ringer?"]),
              pb(["The DPO objects", "Dataskyddsombudet invänder"], ["The DPO says knowingly letting customers enter credentials on a fake page while staying silent may itself breach your duties to them. They want their objection recorded. Do you overrule them?", "Dataskyddsombudet säger att det i sig kan strida mot era skyldigheter att medvetet låta kunder ange inloggningsuppgifter på en falsk sida och tiga. Hen vill att invändningen dokumenteras. Kör ni över hen?"]),
              pb(["Silence with no end", "Tystnad utan slut"], ["The registrar's process may still take most of {{num.registrarHours}} hours. Silence until the domain is back could mean days of a perfect fake page. Is a warning without any links really more dangerous than that?", "Registrarens process kan fortfarande ta större delen av {{num.registrarHours}} timmar. Tystnad tills domänen är tillbaka kan betyda flera dagar med en perfekt falsk sida. Är en varning utan länkar verkligen farligare än det?"])
            ]
          }
        }),
        facilitator: fac(
          ["The padlock lies. Customers can't defend themselves without you.", "Hänglåset ljuger. Kunderna kan inte försvara sig utan er."],
          ["Revocation, broad warnings and planned forced resets.", "Återkallelse, breda varningar och planerade tvingade lösenordsbyten."],
          [["Ask: which channels do you still control?", "Fråga: vilka kanaler kontrollerar ni fortfarande?"]]
        )
      },
      {
        id: "p6",
        priority: 3,
        clock: 3600,
        title: L(["Domain back, trust not", "Domänen tillbaka, förtroendet inte"]),
        twist: L(["The domain is back, but intercepted resets mean some staff and customer accounts may still be controlled by the attacker.", "Domänen är tillbaka, men de uppfångade återställningarna innebär att en del personal- och kundkonton fortfarande kan styras av angriparen."]),
        twistKind: "impact",
        reconsider: { decision: "d4", pressure: { en: "The domain is back, but some accounts may still be in the attacker's hands. Was the way you sped up recovery worth what it cost?", sv: "Domänen är tillbaka, men vissa konton kan fortfarande vara i angriparens händer. Var ert sätt att skynda på återtagandet värt vad det kostade?" } },
        branches: [
          { when: { decision: "d4", option: "C" }, narrativeAppend: { en: "Because you began moving customers to a new domain, the attacker registered a look-alike of the new one within the hour.", sv: "Eftersom ni började flytta kunderna till en ny domän registrerade angriparen en förväxlingsbar kopia av den nya inom en timme." } }
        ],
        assumptionChallenged: L(["Getting the domain back ends the incident.", "Att få tillbaka domänen avslutar incidenten."]),
        narrative: L([
          "Two and a half days later. The registrar has restored your name servers, and the domain points to your own systems again.\n\nIt feels like the end of the incident. But for two days the attacker received every email sent to your domain, and some of what they did in that time is still in place.",
          "Två och en halv dag senare. Registraren har återställt era namnservrar, och domänen pekar på era egna system igen.\n\nDet känns som slutet på incidenten. Men i två dagar fick angriparen varje mejl som skickades till er domän, och en del av det de gjorde under den tiden finns fortfarande kvar."
        ]),
        injects: [
          inj("i6-1", 3600, "impactReport", "soc", "medium", "confirmed", [
            "Of {{num.resetsIntercepted}} intercepted resets, some were completed. Those accounts have attacker-registered MFA devices or recovery emails on other domains.",
            "Av {{num.resetsIntercepted}} uppfångade återställningar slutfördes en del. De kontona har MFA-enheter som angriparen registrerat eller återställningsadresser på andra domäner."
          ], { tests: ["lo2", "lo4"] })
        ],
        questions: {
          technical: [
            q("How do you find every account the attacker changed?", "Hur hittar ni varje konto som angriparen har ändrat?", ["socLead", "itOps"]),
            q("What protections do you add at the registrar?", "Vilka skydd lägger ni till hos registraren?", ["networkLead"]),
            q("Did your forced-reset plan work?", "Fungerade er plan för tvingade lösenordsbyten?", ["itOps"], "d5")
          ],
          executive: [
            q("Who owns the domain and registrar account from now on?", "Vem äger domänen och registrarkontot framöver?", ["cio"]),
            q("Do you report this as a personal-data breach?", "Anmäler ni det här som en personuppgiftsincident?", ["dpo", "legal"]),
            q("Which weekend decision would you most like to have made differently?", "Vilket beslut under helgen skulle ni helst ha fattat annorlunda?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Some external services won't reset MFA without the original email.", "Vissa externa tjänster återställer inte MFA utan den ursprungliga e-postadressen.")],
        decision: dec("d6", "cio", ["What do you change?", "Vad ändrar ni?"], [
          ["Registry lock, a company-owned registrar account with hardware MFA and named owners, and an inventory of services tied to the domain.", "Registerlås, ett registrarkonto som ägs av företaget med hårdvaru-MFA och utsedda ägare, samt en förteckning över tjänster kopplade till domänen."],
          ["Change the registrar password and add MFA.", "Byt lösenordet hos registraren och lägg till MFA."],
          ["Move to a different registrar.", "Byt till en annan registrar."]
        ], {
          knowns: [["The domain was held by a former employee's account.", "Domänen låg på en tidigare anställds konto."]],
          uncertainties: [["Which external services still trust the attacker's changes.", "Vilka externa tjänster som fortfarande litar på angriparens ändringar."]],
          tradeoffs: {
            operational: ["Registry lock slows legitimate changes.", "Registerlås gör legitima ändringar långsammare."],
            security: ["Your domain is a root of trust for everything.", "Er domän är en grund för förtroendet för allt."],
            legal: ["Domain ownership must be formally documented.", "Ägarskapet av domänen måste dokumenteras formellt."],
            reputational: ["Customers need to see it won't happen again.", "Kunderna behöver se att det inte kommer att hända igen."]
          },
          evaluation: [["Treats the domain as critical infrastructure", "Behandlar domänen som kritisk infrastruktur"]],
          pushback: {
            A: [
              pb(["Every change takes a day", "Varje ändring tar en dag"], ["The web team says registry lock means every DNS change now needs a call and a day's wait. They have a launch next week that needs new records. Do you accept slower changes, or make your first exception before the lock has even settled in?", "Webbteamet säger att registerlås innebär att varje DNS-ändring nu kräver ett samtal och en dags väntan. De har en lansering nästa vecka som kräver nya poster. Accepterar ni långsammare ändringar, eller gör ni ert första undantag innan låset ens har satt sig?"]),
              pb(["An inventory without end", "En förteckning utan slut"], ["The first pass of the inventory finds over a hundred services tied to staff addresses on your domain, many bought on company cards without IT knowing. Who owns keeping that list alive next year?", "Den första genomgången hittar över hundra tjänster kopplade till personalens adresser på er domän, många köpta med företagskort utan att IT vet om det. Vem ansvarar för att hålla listan levande nästa år?"]),
              pb(["Named owners leave too", "Även utsedda ägare slutar"], ["The named owners are two people, and one is already looking for a new job. A hardware key in a drawer doesn't help if nobody knows which drawer. What stops this becoming the former-employee problem again in two years?", "De utsedda ägarna är två personer, och den ena söker redan nytt jobb. En hårdvarunyckel i en låda hjälper inte om ingen vet vilken låda. Vad hindrar det här från att bli samma problem som med den tidigare anställda om två år?"])
            ],
            B: [
              pb(["Still in their name", "Fortfarande i hens namn"], ["The registrar account is still registered to the former employee. MFA on it is MFA for someone who no longer works here. Have you fixed the cause, or only the way the attacker got in this time?", "Registrarkontot står fortfarande på den tidigare anställda. MFA på kontot är MFA för någon som inte längre arbetar här. Har ni åtgärdat orsaken, eller bara den väg angriparen tog den här gången?"]),
              pb(["The accounts still aren't yours", "Kontona är fortfarande inte era"], ["Some accounts still carry attacker-registered MFA devices and recovery addresses on other domains. A stronger registrar password doesn't touch them. Where does the cleanup sit in your plan?", "En del konton har fortfarande MFA-enheter som angriparen registrerat och återställningsadresser på andra domäner. Ett starkare lösenord hos registraren påverkar inte dem. Var i er plan finns uppstädningen?"]),
              pb(["“We added MFA”", "”Vi lade till MFA”"], ["The board asks whether this can happen again. “We added MFA” is the honest answer. Is that enough for customers who spent two days on a perfect fake of your site?", "Styrelsen frågar om det här kan hända igen. ”Vi lade till MFA” är det ärliga svaret. Räcker det för kunder som i två dagar hamnade på en perfekt kopia av er sajt?"])
            ],
            C: [
              pb(["A transfer mid-cleanup", "En flytt mitt i städningen"], ["A registrar transfer takes days and blocks some changes while it runs, just as you need to fix records left behind by the attack. Is now the moment to move the domain?", "En flytt till en annan registrar tar flera dagar och spärrar vissa ändringar medan den pågår, precis när ni behöver rätta poster som angreppet lämnat efter sig. Är det nu ni ska flytta domänen?"]),
              pb(["Same problem, new address", "Samma problem, ny adress"], ["The new registrar account will still need an owner, MFA and a recovery contact. Moving decides none of that. What actually changes, apart from the name on the invoice?", "Det nya registrarkontot kommer fortfarande att behöva en ägare, MFA och en kontakt för återställning. Flytten avgör inget av det. Vad förändras egentligen, förutom namnet på fakturan?"]),
              pb(["Blaming the registrar?", "Skyller ni på registraren?"], ["Legal points out that the registrar followed its own rules: the account was in a former employee's name without MFA. Moving looks like blaming them for your gap. What will you say when customers ask why you switched?", "Juristen påpekar att registraren följde sina egna regler: kontot stod på en tidigare anställd och saknade MFA. Flytten ser ut som att ni skyller er egen brist på dem. Vad säger ni när kunderna frågar varför ni bytte?"])
            ]
          }
        }),
        facilitator: fac(
          ["End on ownership. Most organisations don't know who holds their domain.", "Avsluta med ägarskap. De flesta organisationer vet inte vem som innehar deras domän."],
          ["Registry lock, company ownership and an inventory of dependent services.", "Registerlås, företagets ägarskap och en förteckning över beroende tjänster."],
          [["Ask: what else is registered to a person rather than the company?", "Fråga: vad mer är registrerat på en person i stället för på företaget?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The domain is recovered and locked, but cleaning up intercepted resets takes weeks and some customers move to competitors.",
        "Domänen återtas och låses, men att städa upp efter de uppfångade återställningarna tar veckor och en del kunder går över till konkurrenter."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Whoever controls your DNS controls your email and every reset that uses it.", "Den som kontrollerar er DNS kontrollerar er e-post och varje återställning som använder den."]),
        L(["Check from outside; internal views can hide external attacks.", "Kontrollera utifrån; interna vyer kan dölja externa angrepp."]),
        L(["Domains and registrar accounts must be owned by the company, with strong MFA.", "Domäner och registrarkonton måste ägas av företaget, med stark MFA."]),
        L(["Have channels to customers that don't depend on your domain.", "Ha kanaler till kunderna som inte är beroende av er domän."])
      ],
      assumptionsVsReality: [
        avr(["A provider misconfiguration.", "En felkonfiguration hos leverantören."], ["A registrar account takeover.", "Ett kapat registrarkonto."], "p2"),
        avr(["Only the website.", "Bara webbplatsen."], ["Mail and password resets.", "E-post och lösenordsåterställningar."], "p3"),
        avr(["We own our domain.", "Vi äger vår domän."], ["A former employee did, on paper.", "En tidigare anställd gjorde det, på pappret."], "p4")
      ],
      strengthsToLookFor: [
        L(["Checking DNS from outside early", "Att tidigt kontrollera DNS utifrån"]),
        L(["Warning customers on independent channels", "Att varna kunderna via oberoende kanaler"]),
        L(["Locking accounts without relying on email", "Att låsa konton utan att förlita sig på e-post"])
      ],
      commonGaps: [
        L(["Waiting for Monday", "Att vänta till måndag"]),
        L(["Changing passwords while resets still go to the attacker", "Att byta lösenord medan återställningarna fortfarande går till angriparen"]),
        L(["Not knowing who owns the domain", "Att inte veta vem som äger domänen"])
      ],
      suggestedActions: [
        act(["Put the domain under registry lock with company-owned, MFA-protected registrar access.", "Sätt domänen under registerlås med registraråtkomst som ägs av företaget och skyddas med MFA."], "networkLead", "high"),
        act(["Monitor certificate transparency logs for your domains.", "Bevaka loggar för certifikattransparens för era domäner."], "socLead", "medium"),
        act(["Keep an inventory of external services tied to your domain.", "Håll en förteckning över externa tjänster som är kopplade till er domän."], "itOps", "medium"),
        act(["Prepare customer channels independent of your domain.", "Förbered kanaler till kunderna som är oberoende av er domän."], "comms", "medium")
      ]
    }
  });
})();
