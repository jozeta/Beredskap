/*
 * s24-acquisition-compromise.js — "The Company We Just Bought" (archetype D, acquisition).
 *
 * The day after the networks of a newly acquired software company are joined,
 * alerts fire on your file servers from the new side → the acquired company's
 * directory has been controlled by an attacker for months, and the new trust
 * opened the way → due diligence said "no known incidents" → the attacker
 * reached your finance mailboxes and copied the acquired product's
 * code-signing key → who decides inside a company that is yours on paper but
 * not yet in practice → a delayed integration and a dispute with the sellers.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, pb } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s24-acquisition-compromise",
    version: 1,
    category: "acquisition",
    archetype: "third-party-origin",
    emblem: "merger",
    title: L(["The Company We Just Bought", "Företaget vi just köpte"]),
    summary: L([
      "The day after you connect the networks of the software company you just acquired, the alarms start. They came with the purchase.",
      "Dagen efter att ni kopplat ihop nätverken med mjukvaruföretaget ni just förvärvat börjar larmen. De följde med köpet."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Contain an incident that crosses a new trust boundary", "Begränsa en incident som korsar en ny förtroendegräns"]), teaser: L(["Where your organisation ends", "Var er organisation slutar"]) },
      { id: "lo2", text: L(["Assess security in acquisitions before connecting", "Bedöma säkerheten vid förvärv innan ni kopplar ihop"]), teaser: L(["What you take on when you join with others", "Vad ni tar på er när ni går samman med andra"]) },
      { id: "lo3", text: L(["Handle a code-signing compromise in a product you now own", "Hantera en komprometterad kodsigneringsnyckel i en produkt ni nu äger"]), teaser: L(["Inheriting other people's problems", "Att ärva andras problem"]) },
      { id: "lo4", text: L(["Lead across two organisations in the middle of integration", "Leda över två organisationer mitt i en integration"]), teaser: L(["Leading in the middle of change", "Att leda mitt i en förändring"]) }
    ],
    mitre: ["T1199", "T1484.002", "T1078", "T1003", "T1114", "T1552", "T1554"],
    frameworks: {
      nistCsf: ["GV.OC", "GV.RM", "GV.SC", "ID.AM", "PR.AA", "DE.CM", "RS.MA", "RS.CO"],
      iso27001: ["A.5.19", "A.5.20", "A.5.21", "A.5.24", "A.5.26", "A.8.20", "A.8.24", "A.5.35"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "business-hours" },
    actor: { types: ["criminal", "state"], motivation: L(["Long-term access for espionage and later resale", "Långsiktig åtkomst för spionage och senare vidareförsäljning"]), capability: "high" },
    variables: {
      monthsInside: { min: 4, max: 11 },
      dealValue: { min: 20, max: 600, scaleBy: "size", step: 5 },
      softwareCustomers: { min: 150, max: 6000, scaleBy: "size", step: 10 },
      mailboxes: { min: 3, max: 25 }
    },
    roles: ["incidentCommander", "ciso", "cio", "itOps", "socLead", "networkLead", "legal", "cfo", "ceo", "comms", "dpo", "devLead", "supplierManager"],

    groundTruth: {
      rootCause: L([
        "An attacker had controlled the acquired company's directory for {{num.monthsInside}} months through a vulnerable remote-access gateway. When the two networks were joined and a directory trust created, the attacker used it to reach file servers and finance mailboxes at {{org.name}}. Months earlier they had also copied the acquired product's code-signing key from its build server.",
        "En angripare hade kontrollerat det förvärvade företagets katalogtjänst i {{num.monthsInside}} månader via en sårbar gateway för fjärråtkomst. När nätverken kopplades ihop och ett förtroende mellan katalogerna skapades använde angriparen det för att nå filservrar och ekonomibrevlådor hos {{org.name}}. Flera månader tidigare hade de också kopierat den förvärvade produktens kodsigneringsnyckel från dess byggserver."
      ]),
      attackerTimeline: [
        { at: -302400, text: L(["Remote-access gateway at the acquired company exploited.", "Gatewayen för fjärråtkomst hos det förvärvade företaget utnyttjas."]) },
        { at: -259200, text: L(["Domain administrator rights obtained in the acquired company.", "Domänadministratörsrättigheter erhålls i det förvärvade företaget."]) },
        { at: -216000, text: L(["Code-signing key copied from the build server.", "Kodsigneringsnyckeln kopieras från byggservern."]) },
        { at: -1440, text: L(["Network link and directory trust created during integration.", "Nätverkslänk och katalogförtroende skapas under integrationen."]) },
        { at: -600, text: L(["First logons into {{org.name}} across the new trust.", "De första inloggningarna hos {{org.name}} via det nya förtroendet."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-months", revealStage: "p2", text: L(["The acquired company's directory has been under an attacker's control for months, through its remote-access gateway.", "Det förvärvade företagets katalogtjänst har varit under en angripares kontroll i månader, via dess gateway för fjärråtkomst."]) },
      { id: "hf-diligence", revealStage: "p3", text: L(["The sellers' own IT team had flagged the gateway as compromised before the sale closed.", "Säljarnas eget IT-team hade flaggat gatewayen som komprometterad innan affären slutfördes."]) },
      { id: "hf-signing", revealStage: "p4", text: L(["The acquired product's code-signing key was copied from its build server long before the deal.", "Den förvärvade produktens kodsigneringsnyckel kopierades från byggservern långt före affären."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Connected", "Ihopkopplade"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. Yesterday {{org.name}} connected its network to {{supplier.vendor}}, the software company it bought last month. The integration project celebrated with cake.\n\nSince early today the security centre has had alerts on your file servers, all from addresses on the new side of the connection. The integration team is sure it is just a migration script, and the deal team does not want any delays.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. I går kopplade {{org.name}} ihop sitt nätverk med {{supplier.vendor}}, mjukvaruföretaget som köptes förra månaden. Integrationsprojektet firade med tårta.\n\nSedan tidigt i dag har säkerhetscentralen haft larm på era filservrar, alla från adresser på den nya sidan av förbindelsen. Integrationsteamet är säkert på att det bara är ett migreringsskript, och affärsteamet vill inte ha några förseningar."
        ]),
        injects: [
          inj("i1-1", 0, "edrAlert", "edr", "high", "confirmed", [
            "Credential-dumping tool blocked on {{asset.fileServer}}. Source: a server account belonging to the acquired company's domain, logged on across the new trust.",
            "Verktyg för att dumpa inloggningsuppgifter blockerat på {{asset.fileServer}}. Källa: ett serverkonto i det förvärvade företagets domän, inloggat via det nya förtroendet."
          ], { tests: ["lo1"] }),
          inj("i1-2", 15, "chat", "itOps", "medium", "misleading", [
            "Integration team: “Their admins are migrating files today. Probably one of their scripts.”",
            "Integrationsgruppen: ”Deras administratörer flyttar filer i dag. Förmodligen ett av deras skript.”"
          ], { facilitatorNote: ["Plausible on integration day; migration scripts don't dump credentials.", "Rimligt en integrationsdag; migreringsskript dumpar inte inloggningsuppgifter."], tests: ["lo1"] }),
          inj("i1-3", 30, "ticket", "serviceDesk", "low", "confirmed", [
            "Two finance staff report odd sign-in prompts after the integration window.",
            "Två personer på ekonomi rapporterar konstiga inloggningsrutor efter integrationsfönstret."
          ], { optional: true, tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("What exactly did yesterday's integration open between the networks?", "Vad exakt öppnade gårdagens integration mellan nätverken?", ["networkLead", "itOps"]),
            q("Can you cut the link without stopping the acquired company's business?", "Kan ni kapa länken utan att stoppa det förvärvade företagets verksamhet?", ["networkLead"]),
            q("Whose security team watches the other side?", "Vems säkerhetsgrupp bevakar den andra sidan?", ["socLead"])
          ],
          executive: [
            q("Who decides to cut the link: you, or the integration programme?", "Vem beslutar att kapa länken: ni, eller integrationsprogrammet?", ["cio", "incidentCommander"]),
            q("Who do you call at the acquired company, and do they know yet?", "Vem ringer ni på det förvärvade företaget, och vet de redan?", ["incidentCommander"]),
            q("What did the deal assume about their security?", "Vad förutsatte affären om deras säkerhet?", ["cfo", "legal"])
          ]
        },
        challenges: [ch("The integration has a public go-live date next week, announced to customers.", "Integrationen har ett offentligt startdatum nästa vecka, som meddelats kunderna.")],
        decision: dec("d1", "cio", ["What do you do with the connection?", "Vad gör ni med anslutningen?"], [
          ["Cut the link and the directory trust now, and investigate both sides.", "Kapa länken och katalogförtroendet nu, och utred båda sidorna."],
          ["Keep it, but block the accounts that triggered alerts.", "Behåll den, men spärra de konton som utlöste larm."],
          ["Ask the acquired company's IT to look at their scripts.", "Be det förvärvade företagets IT titta på sina skript."]
        ], {
          knowns: [["Credential theft was attempted from the new side.", "Försök till stöld av inloggningsuppgifter gjordes från den nya sidan."]],
          uncertainties: [["Whether the acquired company is compromised.", "Om det förvärvade företaget är komprometterat."]],
          tradeoffs: {
            operational: ["Cutting the link halts the integration.", "Att kapa länken stoppar integrationen."],
            security: ["The trust lets anything on their side reach yours.", "Förtroendet låter allt på deras sida nå er."],
            legal: ["Their systems may not be yours to investigate yet.", "Deras system kanske ännu inte är era att utreda."],
            reputational: ["A delayed go-live will be noticed.", "Ett försenat startdatum kommer att märkas."]
          },
          evaluation: [["Closes the trust before investigating", "Stänger förtroendet innan utredningen"]],
          pushback: {
            A: [
              pb(["On whose authority?", "På vems mandat?"], ["The deal team calls: the go-live date is public, customers have been told, and cutting the trust stops every migration in the plan. They ask who halted the integration on the strength of a single alert. Who answers them, and how long can you keep the link down?", "Affärsteamet ringer: startdatumet är offentligt, kunderna har informerats, och att kapa förtroendet stoppar varje migrering i planen. De frågar vem som stoppade integrationen på grund av ett enda larm. Vem svarar dem, och hur länge kan ni hålla länken nere?"]),
              pb(["They cannot work", "De kan inte arbeta"], ["Without the link, staff at {{supplier.vendor}} lose the shared systems they were moved onto yesterday, and their managers start calling. Some of your own teams already depend on the link too. What do you restore, if anything, and how do you decide it is safe?", "Utan länken förlorar personalen på {{supplier.vendor}} de gemensamma system de flyttades över till i går, och deras chefer börjar ringa. En del av era egna team är redan beroende av länken också. Vad återställer ni, om något, och hur avgör ni att det är säkert?"]),
              pb(["Not your network yet", "Inte ert nätverk ännu"], ["Their IT manager says your responders may not touch their systems: the companies are not yet one in practice, and their own policies apply. Investigating both sides needs their cooperation. Do you insist, ask nicely, or investigate only your own side?", "Deras IT-chef säger att era incidenthanterare inte får röra deras system: företagen är ännu inte ett i praktiken, och deras egna regler gäller. Att utreda båda sidorna kräver deras samarbete. Kräver ni, ber ni snällt, eller utreder ni bara er egen sida?"])
            ],
            B: [
              pb(["Another account", "Ett konto till"], ["Twenty minutes after you blocked the accounts, the same tool is blocked again on another file server, this time from a different account in their domain. Blocking accounts one by one keeps you a step behind. Do you keep blocking, or cut the trust now?", "Tjugo minuter efter att ni spärrade kontona blockeras samma verktyg igen på en annan filserver, den här gången från ett annat konto i deras domän. Att spärra konton ett i taget håller er ett steg efter. Fortsätter ni att spärra, eller kapar ni förtroendet nu?"]),
              pb(["The migration stops anyway", "Migreringen stannar ändå"], ["One of the blocked accounts runs the file migration. The integration team says the migration has stopped and the plan is behind anyway. You now have the delay without the protection of cutting the link. Do you unblock it, or go further?", "Ett av de spärrade kontona kör filmigreringen. Integrationsteamet säger att migreringen har stannat och att planen ändå är försenad. Ni har nu förseningen utan skyddet av att kapa länken. Häver ni spärren, eller går ni längre?"]),
              pb(["Only the ones you saw", "Bara de ni såg"], ["{{person.socLead.name}} points out that blocking an account does not end sessions already open, and the trust still lets every other account on their side try. You have blocked only the accounts you happened to see. Are you protecting the network, or just reacting to alerts?", "{{person.socLead.name}} påpekar att en spärr inte avslutar sessioner som redan är öppna, och att förtroendet fortfarande låter alla andra konton på deras sida försöka. Ni har bara spärrat de konton ni råkade se. Skyddar ni nätverket, eller reagerar ni bara på larm?"])
            ],
            C: [
              pb(["Scripts don't dump credentials", "Skript dumpar inte lösenord"], ["{{person.socLead.name}} says no migration script they know of runs a credential-dumping tool, and the endpoint protection named it as exactly that. While you wait for an answer, the account stays logged on across the trust. How long do you wait for someone else to explain what you can already see?", "{{person.socLead.name}} säger att inget migreringsskript hen känner till kör ett verktyg för att dumpa inloggningsuppgifter, och att endpointskyddet pekade ut det som just det. Medan ni väntar på svar är kontot fortfarande inloggat via förtroendet. Hur länge väntar ni på att någon annan ska förklara det ni redan ser?"]),
              pb(["“Our scripts are fine”", "”Våra skript är okej”"], ["Their IT team replies within the hour: the scripts look normal, and they would rather you stopped blocking their tools. They are new colleagues and proud of their systems. Do you take their word for it, and what would it take for you to overrule them?", "Deras IT-team svarar inom en timme: skripten ser normala ut, och de vill helst att ni slutar blockera deras verktyg. De är nya kollegor och stolta över sina system. Tar ni dem på orden, och vad skulle krävas för att ni ska köra över dem?"]),
              pb(["You told the source", "Ni berättade för källan"], ["Asking them puts the question in the hands of the team whose network the alert came from. If something is wrong over there, you may have just told whoever is responsible that you noticed. What do you do on your own side while they look?", "Att fråga dem lägger frågan i händerna på det team vars nätverk larmet kom från. Om något är fel där borta kan ni just ha berättat för den som ligger bakom att ni har märkt det. Vad gör ni på er egen sida medan de tittar?"])
            ]
          }
        }),
        facilitator: fac(
          ["The trust is the risk. Every hour it stays, their problem is yours.", "Förtroendet är risken. Varje timme det står kvar är deras problem ert."],
          ["Cut the link and trust, and start a joint investigation.", "Kapa länken och förtroendet, och starta en gemensam utredning."],
          [["Ask: what did you check before you connected?", "Fråga: vad kontrollerade ni innan ni kopplade ihop?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 120,
        title: L(["Theirs for months", "Deras i månader"]),
        twist: L(["The acquired company's network has been under someone else's control for about {{num.monthsInside}} months. The attacker held administrator rights over their whole directory and simply walked across the new trust.", "Det förvärvade företagets nätverk har varit under någon annans kontroll i ungefär {{num.monthsInside}} månader. Angriparen hade administratörsrättigheter över hela deras katalog och gick helt enkelt över det nya förtroendet."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the link and the trust were cut, the acquired company's staff lost access to the shared finance system on the day of their first month-end close with you.", sv: "Eftersom länken och förtroendet kapades förlorade det förvärvade företagets personal åtkomsten till det gemensamma ekonomisystemet samma dag som deras första månadsbokslut med er." } }
        ],
        assumptionChallenged: L(["A migration script misbehaved.", "Ett migreringsskript betedde sig fel."]),
        reveals: ["hf-months"],
        narrative: L([
          "{{time.T+120|clock}}. The connection has been cut, and your incident responders have been given access to the acquired company's logs for the first time.\n\nUntil now, everyone assumed the problem started yesterday, when the networks were joined. The logs on the other side go back much further.",
          "Klockan {{time.T+120|clock}}. Förbindelsen är bruten, och era incidenthanterare har för första gången fått tillgång till det förvärvade företagets loggar.\n\nHittills har alla antagit att problemet började i går, när näten kopplades ihop. Loggarna på andra sidan går mycket längre tillbaka."
        ]),
        injects: [
          inj("i2-1", 120, "forensicFinding", "irRetainer", "critical", "confirmed", [
            "Acquired company: a known vulnerability in its remote-access gateway was exploited about {{num.monthsInside}} months ago; persistent administrator accounts and scheduled tasks on every domain controller.",
            "Det förvärvade företaget: en känd sårbarhet i gatewayen för fjärråtkomst utnyttjades för ungefär {{num.monthsInside}} månader sedan; beständiga administratörskonton och schemalagda aktiviteter på alla domänkontrollanter."
          ], { reveals: ["hf-months"], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("Can the acquired company's directory be trusted at all?", "Går det att lita på det förvärvade företagets katalog överhuvudtaget?", ["ciso", "itOps"]),
            q("Which of your systems did the trust expose overnight?", "Vilka av era system exponerades av förtroendet under natten?", ["socLead"]),
            q("Did cutting the link early make a difference?", "Gjorde det skillnad att kapa länken tidigt?", ["networkLead"], "d1")
          ],
          executive: [
            q("Who leads the response inside a company you own but don't yet run?", "Vem leder insatsen i ett företag ni äger men ännu inte driver?", ["ceo", "incidentCommander"]),
            q("Who must be told: the sellers, your board, the acquired company's customers?", "Vilka måste informeras: säljarna, er styrelse, det förvärvade företagets kunder?", ["legal", "cfo"]),
            q("Looking back at this morning, was the connection decision made by the right person?", "Om ni ser tillbaka på i morse, fattades beslutet om anslutningen av rätt person?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The acquired company's IT manager says the gateway was “on the list to replace”.", "Det förvärvade företagets IT-chef säger att gatewayen var ”på listan för att bytas ut”.")],
        decision: dec("d2", "ciso", ["How do you handle their directory?", "Hur hanterar ni deras katalog?"], [
          ["Treat it as lost: rebuild their identity platform, and reconnect only through a new, clean design.", "Behandla den som förlorad: bygg om deras identitetsplattform, och koppla ihop igen bara via en ny, ren lösning."],
          ["Clean it in place: remove the attacker's accounts and tasks.", "Sanera på plats: ta bort angriparens konton och aktiviteter."],
          ["Let the acquired company's IT clean it, with your team reviewing; they know their own systems, and the trust is already cut.", "Låt det förvärvade företagets IT sanera, med ert team som granskar; de känner sina egna system, och förtroendet är redan kapat."]
        ], {
          knowns: [["The attacker had full control for months.", "Angriparen har haft full kontroll i månader."]],
          uncertainties: [["Every way back in the attacker created.", "Varje väg tillbaka in som angriparen skapat."]],
          tradeoffs: {
            operational: ["A rebuild disrupts the acquired company for weeks.", "En ombyggnad stör det förvärvade företaget i veckor."],
            security: ["Cleaning in place after months of control rarely finds everything.", "Sanering på plats efter månader av kontroll hittar sällan allt."],
            legal: ["Costs may be recoverable from the sellers.", "Kostnaderna kan eventuellt krävas av säljarna."],
            reputational: ["Their staff are new and nervous.", "Deras personal är ny och orolig."]
          },
          evaluation: [["Rebuilds rather than trusting a directory controlled for months", "Bygger om i stället för att lita på en katalog som kontrollerats i månader"]],
          pushback: {
            A: [
              pb(["Weeks without identity", "Veckor utan identiteter"], ["A rebuild gives every user and service at {{supplier.vendor}} new accounts, and their customer-facing systems depend on that directory. Their delivery manager says customer releases will stop for weeks. Can the company you just bought survive the rebuild, and who tells its customers?", "En ombyggnad ger varje användare och tjänst på {{supplier.vendor}} nya konton, och deras kundnära system är beroende av katalogen. Deras leveransansvarige säger att kundreleaser stannar i veckor. Klarar företaget ni just köpt ombyggnaden, och vem berättar för dess kunder?"]),
              pb(["Who pays for it?", "Vem betalar?"], ["{{person.cfo.name}} asks who pays for a rebuild nobody budgeted, in a deal that was meant to start saving money this year. The business case assumed their systems would simply be absorbed. Do you have a figure, and is it worth more than cleaning?", "{{person.cfo.name}} frågar vem som betalar för en ombyggnad som ingen budgeterat, i en affär som skulle börja spara pengar redan i år. Affärskalkylen förutsatte att deras system helt enkelt skulle tas över. Har ni en siffra, och är den värd mer än en sanering?"]),
              pb(["Rebuild from what?", "Bygga om från vad?"], ["To rebuild, you need software, configurations and backups from their environment, and the attacker could reach all of it for months. Your responders cannot yet say which backups are clean. What do you trust as a starting point, and how do you know?", "För att bygga om behöver ni programvara, konfigurationer och säkerhetskopior från deras miljö, och angriparen har kunnat nå allt det i månader. Era incidenthanterare kan ännu inte säga vilka säkerhetskopior som är rena. Vad litar ni på som utgångspunkt, och hur vet ni det?"])
            ],
            B: [
              pb(["One more found", "En till hittad"], ["After the cleanup, your responders find another scheduled task on a domain controller that the first sweep missed. Each sweep finds one more thing. How many rounds before you trust it, and when do you stop looking?", "Efter saneringen hittar era incidenthanterare ytterligare en schemalagd aktivitet på en domänkontrollant som den första genomgången missade. Varje genomgång hittar en sak till. Hur många varv innan ni litar på den, och när slutar ni leta?"]),
              pb(["Who signs off?", "Vem godkänner?"], ["The deal team hears “cleaned” and asks when the link can come back. Nobody in the room wants to sign that a directory controlled by someone else for months is now clean. Who puts their name on reconnecting?", "Affärsteamet hör ”sanerat” och frågar när länken kan komma tillbaka. Ingen i rummet vill skriva under på att en katalog som någon annan kontrollerat i månader nu är ren. Vem sätter sitt namn på att koppla ihop igen?"]),
              pb(["The door is still open", "Dörren står kvar öppen"], ["Cleaning removes the attacker's accounts, but the remote-access gateway they came in through is still in daily use by staff working remotely. Replacing it takes weeks. Does the cleanup mean anything while the way in stays open?", "Saneringen tar bort angriparens konton, men gatewayen för fjärråtkomst som de kom in genom används fortfarande dagligen av personal som arbetar på distans. Att byta ut den tar veckor. Betyder saneringen något så länge vägen in står öppen?"])
            ],
            C: [
              pb(["Cleaning with known keys", "Sanera med kända nycklar"], ["The attacker held administrator rights for months, and their IT staff sign in to the same directory. Any of their admin accounts may be known to the attacker. Can people working inside a compromised directory clean it, and how would your reviewers tell?", "Angriparen hade administratörsrättigheter i månader, och deras IT-personal loggar in i samma katalog. Vilket som helst av deras administratörskonton kan vara känt för angriparen. Kan de som arbetar inifrån en komprometterad katalog sanera den, och hur skulle era granskare märka skillnad?"]),
              pb(["Review without access", "Granska utan åtkomst"], ["Your reviewers ask for full administrator access to check the work, and their IT manager refuses, saying it undermines the team. Without access, your review is a reading of their report. Do you insist, and on what authority?", "Era granskare ber om full administratörsåtkomst för att kontrollera arbetet, och deras IT-chef vägrar med motiveringen att det undergräver teamet. Utan åtkomst blir er granskning en läsning av deras rapport. Kräver ni åtkomst, och med vilket mandat?"]),
              pb(["A small, busy team", "Ett litet, pressat team"], ["Their IT team is a handful of people who are also running the migration and the daily service. They estimate the cleanup at a month. Is a month of a partly trusted directory acceptable, and what keeps the link closed until then?", "Deras IT-team är en handfull personer som också sköter migreringen och den dagliga driften. De uppskattar saneringen till en månad. Är en månad med en delvis betrodd katalog acceptabelt, och vad håller länken stängd till dess?"])
            ]
          }
        }),
        facilitator: fac(
          ["Months of domain control means the directory is the attacker's as much as theirs.", "Månader av kontroll över domänen betyder att katalogen är lika mycket angriparens som deras."],
          ["Rebuild the identity platform; reconnect through a new design.", "Bygg om identitetsplattformen; koppla ihop igen via en ny lösning."],
          [["Ask: how long would cleaning take, and how sure would you be?", "Fråga: hur lång tid skulle saneringen ta, och hur säkra skulle ni vara?"]]
        )
      },
      {
        id: "p3",
        clock: 480,
        priority: 1,
        title: L(["The due diligence", "Företagsgranskningen"]),
        twist: L(["An email in the acquired company's archive, sent before the deal closed, warns management that the remote-access gateway “looks compromised”. The due diligence questionnaire said “no known incidents”.", "Ett mejl i det förvärvade företagets arkiv, skickat innan affären slutfördes, varnar ledningen för att gatewayen för fjärråtkomst ”ser komprometterad ut”. Frågeformuläret i företagsgranskningen angav ”inga kända incidenter”."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "The sellers knew. If you cut the link, the integration team has stood idle for a week. If you kept it open, the attacker had another week of walking across.", sv: "Säljarna visste. Om ni kapade länken har integrationsteamet stått still i en vecka. Om ni lät den vara öppen fick angriparen ytterligare en vecka att gå över." } },
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because their identity platform is being rebuilt, the acquired company's sales team cannot sign in, and two key engineers have hinted that they may leave.", sv: "Eftersom deras identitetsplattform byggs om kan det förvärvade företagets säljteam inte logga in, och två nyckelpersoner bland utvecklarna har antytt att de kan sluta." } }
        ],
        assumptionChallenged: L(["The sellers told us everything they knew.", "Säljarna berättade allt de visste."]),
        reveals: ["hf-diligence"],
        narrative: L([
          "{{time.T+480|clock}}. A long-compromised network raises an obvious question: did anyone know before you signed? {{person.legal.name}} reads the due diligence file next to the acquired company's email archive.\n\nThe due diligence questionnaire was answered by the sellers a few months ago. The email archive shows what they were saying to each other at the same time.",
          "Klockan {{time.T+480|clock}}. Ett nätverk som varit komprometterat länge väcker en självklar fråga: visste någon innan ni skrev under? {{person.legal.name}} läser företagsgranskningens dokument bredvid det förvärvade företagets mejlarkiv.\n\nFrågeformuläret i granskningen besvarades av säljarna för några månader sedan. Mejlarkivet visar vad de sa till varandra vid samma tid."
        ]),
        injects: [
          inj("i3-1", 480, "email", "employee", "high", "confirmed", [
            "Archived email, eight weeks before closing, from the acquired company's IT manager to its CEO: “The VPN gateway shows logins I can't explain. I think we have a problem.”",
            "Arkiverat mejl, åtta veckor före tillträdet, från det förvärvade företagets IT-chef till dess vd: ”VPN-gatewayen visar inloggningar jag inte kan förklara. Jag tror att vi har ett problem.”"
          ], { reveals: ["hf-diligence"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What security questions did your due diligence ask, and what evidence did it require?", "Vilka säkerhetsfrågor ställdes i er företagsgranskning, och vilka belägg krävdes?", ["ciso"]),
            q("Is the archive now evidence you need to preserve?", "Är arkivet nu bevis som ni måste bevara?", ["legal", "socLead"]),
            q("Does this change how far you rebuild?", "Ändrar det här hur långt ni bygger om?", ["itOps"], "d2")
          ],
          executive: [
            q("Do you raise a warranty claim against the sellers now?", "Ställer ni ett garantikrav mot säljarna nu?", ["cfo", "legal"]),
            q("How do you treat the acquired company's former leadership, who now work for you?", "Hur behandlar ni det förvärvade företagets tidigare ledning, som nu arbetar för er?", ["ceo"]),
            q("Would you rebuild or clean differently, knowing they knew?", "Skulle ni bygga om eller sanera annorlunda, när ni vet att de visste?", ["ciso"], "d2")
          ]
        },
        challenges: [ch("The former CEO of the acquired company now sits in your management team.", "Det förvärvade företagets tidigare vd sitter nu i er ledningsgrupp.")],
        decision: dec("d3", "ceo", ["What do you do about the sellers?", "Vad gör ni med säljarna?"], [
          ["Preserve the evidence, notify the sellers of a warranty claim, and keep the incident response separate from the dispute.", "Säkra bevisen, underrätta säljarna om ett garantikrav, och håll incidenthanteringen åtskild från tvisten."],
          ["Raise it with the former CEO directly before any claim, and give them the chance to explain.", "Ta upp det direkt med den tidigare vd:n innan något krav ställs, och ge hen chansen att förklara."],
          ["Park the dispute for six months, so the integration and the people who must deliver it are not poisoned by it.", "Lägg tvisten på is i sex månader, så att integrationen och de som ska genomföra den inte förgiftas av den."]
        ], {
          knowns: [["The risk was known before closing and not disclosed.", "Risken var känd före tillträdet och redovisades inte."]],
          uncertainties: [["What the contract's warranties actually cover.", "Vad avtalets garantier faktiskt täcker."]],
          tradeoffs: {
            operational: ["A dispute can poison cooperation in the response.", "En tvist kan förgifta samarbetet i insatsen."],
            security: ["The people who knew may know more.", "De som visste kan veta mer."],
            legal: ["Claims have notice deadlines.", "Krav har tidsfrister för underrättelse."],
            reputational: ["The board will ask why diligence missed it.", "Styrelsen kommer att fråga varför granskningen missade det."]
          },
          evaluation: [["Protects the legal position without derailing the response", "Skyddar den rättsliga positionen utan att spåra ur insatsen"]],
          pushback: {
            A: [
              pb(["A colleague on the other side", "En kollega på andra sidan"], ["The former CEO sits in your management team and hears about the claim the same afternoon. Their knowledge, and the staff loyal to them, are still central to the response. Can you really keep the dispute separate when the other side is a colleague?", "Den tidigare vd:n sitter i er ledningsgrupp och hör om kravet samma eftermiddag. Hens kunskap, och personalen som är lojal mot hen, är fortfarande centrala för insatsen. Kan ni verkligen hålla tvisten åtskild när motparten är en kollega?"]),
              pb(["Reading staff mail", "Att läsa personalens e-post"], ["{{person.dpo.name}} asks on what basis you keep and search the mailboxes of staff who had no part in the decision and now work for you. Preserving everything may not be lawful. Do you narrow the preservation, and risk losing what matters?", "{{person.dpo.name}} frågar med vilket stöd ni behåller och söker i brevlådorna hos personal som inte hade någon del i beslutet och som nu arbetar för er. Att bevara allt är kanske inte lagligt. Begränsar ni bevarandet, och riskerar att förlora det som spelar roll?"]),
              pb(["Notice before facts", "Krav före fakta"], ["The agreement requires a claim to be notified within a set period and to specify the breach. You do not yet know the full damage. Do you notify now with what you have and risk a weak claim, or wait and risk missing the window?", "Avtalet kräver att ett krav anmäls inom en viss tid och anger vilket avtalsbrott det gäller. Ni vet ännu inte hela skadan. Anmäler ni nu med det ni har och riskerar ett svagt krav, eller väntar ni och riskerar att missa fristen?"])
            ],
            B: [
              pb(["Warning the other side", "Att förvarna motparten"], ["{{person.legal.name}} warns that once you raise it, the former CEO can speak to the other sellers and their lawyers before you have preserved anything. A fair conversation may cost you your evidence. Do you secure the archive first, and is it still a fair conversation if you do?", "{{person.legal.name}} varnar för att den tidigare vd:n, så fort ni tar upp det, kan prata med de andra säljarna och deras jurister innan ni har säkrat något. Ett rättvist samtal kan kosta er bevisen. Säkrar ni arkivet först, och är det i så fall fortfarande ett rättvist samtal?"]),
              pb(["A plausible explanation", "En rimlig förklaring"], ["The former CEO says the IT manager's email was one worry among many, that an outside firm checked and found nothing, and that the questionnaire was answered in good faith. You cannot check that firm's report today. Do you accept the explanation, and what would change your mind?", "Den tidigare vd:n säger att IT-chefens mejl var en oro bland många, att en extern firma kontrollerade och inte hittade något, och att frågeformuläret besvarades i god tro. Ni kan inte granska firmans rapport i dag. Godtar ni förklaringen, och vad skulle få er att ändra er?"]),
              pb(["Protecting a colleague?", "Skyddar ni en kollega?"], ["The board chair hears that you spoke privately to a seller about a possible warranty breach before involving legal. The chair asks whether you have just weakened the company's claim to protect a colleague. How do you defend going to them first?", "Styrelseordföranden får höra att ni pratade privat med en säljare om ett möjligt garantibrott innan juristerna kopplades in. Ordföranden frågar om ni just har försvagat bolagets krav för att skydda en kollega. Hur försvarar ni att ni gick till hen först?"])
            ],
            C: [
              pb(["The window closes", "Fristen löper ut"], ["{{person.legal.name}} reads the agreement: warranty claims must be notified within a fixed period of discovery, and six months is longer. Parking the dispute may mean losing it. Is goodwill in the integration worth the whole claim?", "{{person.legal.name}} läser avtalet: garantikrav ska anmälas inom en bestämd tid från upptäckten, och sex månader är längre än så. Att lägga tvisten på is kan betyda att ni förlorar den. Är god stämning i integrationen värd hela kravet?"]),
              pb(["Silent then, silent now?", "Tysta då, tysta nu?"], ["The people who knew about the gateway now run parts of the response. If they kept quiet before the sale, what else might they not be telling you? Can you rely on them for six months without asking?", "De som kände till gatewayen sköter nu delar av insatsen. Om de teg före försäljningen, vad mer kanske de inte berättar? Kan ni lita på dem i sex månader utan att fråga?"]),
              pb(["The archive expires", "Arkivet gallras"], ["Without a formal claim, nothing obliges anyone to keep the email archive, and the acquired company's retention rules delete mail after a fixed period. Parking the dispute may quietly erase its evidence. Do you preserve it anyway, and is that still parking it?", "Utan ett formellt krav är ingen skyldig att behålla mejlarkivet, och det förvärvade företagets gallringsregler raderar e-post efter en viss tid. Att lägga tvisten på is kan i tysthet radera bevisen. Bevarar ni arkivet ändå, och är tvisten då fortfarande på is?"])
            ]
          }
        }),
        facilitator: fac(
          ["Keep the dispute and the response apart: you need the former team's knowledge.", "Håll isär tvisten och insatsen: ni behöver det tidigare teamets kunskap."],
          ["Evidence preserved, claim notified, response cooperation kept.", "Bevis säkrade, krav anmält, samarbetet i insatsen bevarat."],
          [["Ask: what would a security question with required evidence have looked like?", "Fråga: hur hade en säkerhetsfråga med krav på belägg sett ut?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 1440,
        title: L(["What came across", "Vad som kom över"]),
        twist: L(["Overnight the attacker read {{num.mailboxes}} of your finance and M&A mailboxes. And the acquired product's code-signing key was copied months ago: anything signed with it can no longer be trusted.", "Under natten läste angriparen {{num.mailboxes}} av era brevlådor inom ekonomi och förvärv. Och den förvärvade produktens kodsigneringsnyckel kopierades för flera månader sedan: inget som signerats med den går längre att lita på."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "Overnight the attacker read {{num.mailboxes}} of your own finance and M&A mailboxes. Was your plan for their directory fast enough?", sv: "I natt läste angriparen {{num.mailboxes}} av era egna brevlådor inom ekonomi och företagsförvärv. Var er plan för deras katalog tillräckligt snabb?" } },
        assumptionChallenged: L(["The damage is limited to the acquired company.", "Skadan är begränsad till det förvärvade företaget."]),
        reveals: ["hf-signing"],
        narrative: L([
          "{{time.T+1440|weekday|cap}}. The investigation teams on both sides report their findings from the first full day.\n\nTwo questions matter most: what did the attacker reach on your side during the night the networks were connected, and what did they take from the acquired company over the months before? Both answers matter to people outside the company.",
          "{{time.T+1440|weekday|cap}}. Utredningsteamen på båda sidor redovisar sina fynd från det första hela dygnet.\n\nTvå frågor är viktigast: vad nådde angriparen på er sida under natten då näten var ihopkopplade, och vad tog de från det förvärvade företaget under månaderna innan? Båda svaren betyder något för människor utanför företaget."
        ]),
        injects: [
          inj("i4-1", 1440, "logExcerpt", "siem", "critical", "confirmed", [
            "Mail access across the trust: {{num.mailboxes}} mailboxes in finance and corporate development read between 02:10 and 05:40.",
            "E-poståtkomst via förtroendet: {{num.mailboxes}} brevlådor inom ekonomi och affärsutveckling lästa mellan 02.10 och 05.40."
          ], { tests: ["lo1"] }),
          inj("i4-2", 1500, "forensicFinding", "irRetainer", "critical", "confirmed", [
            "Build server, acquired company: the code-signing certificate's private key was exported to an external address months ago. {{num.softwareCustomers|number}} customers run software signed with it.",
            "Byggservern, det förvärvade företaget: kodsigneringscertifikatets privata nyckel exporterades till en extern adress för flera månader sedan. {{num.softwareCustomers|number}} kunder kör programvara som signerats med den."
          ], { reveals: ["hf-signing"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["Reach of the compromise", "Intrångets räckvidd"]),
          data: kpi([
            { id: "months", label: ["Months inside the acquired company", "Månader inne i det förvärvade företaget"], value: (v) => v.monthsInside, tone: "warn" },
            { id: "mail", label: ["Your mailboxes read", "Era brevlådor lästa"], value: (v) => v.mailboxes, tone: "danger" },
            { id: "cust", label: ["Customers running signed software", "Kunder som kör signerad programvara"], value: (v) => v.softwareCustomers, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("How do you revoke the certificate without breaking every customer installation?", "Hur återkallar ni certifikatet utan att slå ut varje kundinstallation?", ["devLead"]),
            q("Was anything malicious ever signed with the stolen key?", "Har något skadligt någonsin signerats med den stulna nyckeln?", ["devLead", "socLead"]),
            q("Does the rebuild plan now need to include the build pipeline?", "Behöver ombyggnadsplanen nu omfatta byggkedjan?", ["ciso"], "d2")
          ],
          executive: [
            q("The M&A mailboxes held deal plans. Who else is affected by that?", "Brevlådorna för förvärv innehöll affärsplaner. Vilka andra berörs av det?", ["cfo", "legal"]),
            q("What do you tell the acquired company's customers, and when?", "Vad säger ni till det förvärvade företagets kunder, och när?", ["comms", "ceo"]),
            q("Would you have kept the link open longer if you had known this?", "Hade ni hållit länken öppen längre om ni hade vetat det här?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Revoking the certificate stops customers' software updates until a new one is issued.", "Att återkalla certifikatet stoppar kundernas programuppdateringar tills ett nytt har utfärdats.")],
        decision: dec("d4", "ciso", ["How do you deal with the signing key?", "Hur hanterar ni signeringsnyckeln?"], [
          ["Revoke it, issue a new key from a clean build environment, and tell customers how to verify their installations.", "Återkalla den, utfärda en ny nyckel från en ren byggmiljö och berätta för kunderna hur de kontrollerar sina installationer."],
          ["Issue a new key quietly and stop using the old one.", "Utfärda en ny nyckel i tysthet och sluta använda den gamla."],
          ["Keep the old key valid for now and watch for misuse; revoking it breaks every customer installation tonight.", "Låt den gamla nyckeln vara giltig tills vidare och bevaka missbruk; att återkalla den slår ut varje kundinstallation i natt."]
        ], {
          knowns: [["The private key left the build server months ago.", "Den privata nyckeln lämnade byggservern för flera månader sedan."]],
          uncertainties: [["Whether anything malicious has been signed.", "Om något skadligt har signerats."]],
          tradeoffs: {
            operational: ["Revocation breaks updates until customers move to the new key.", "Återkallelsen bryter uppdateringar tills kunderna gått över till den nya nyckeln."],
            security: ["Without revocation, malware can be signed as your product.", "Utan återkallelse kan skadlig kod signeras som er produkt."],
            legal: ["Customers may have contractual rights to be told.", "Kunderna kan ha avtalsenlig rätt att bli informerade."],
            reputational: ["A quiet change is found by the first researcher who looks.", "En tyst ändring upptäcks av den första forskare som tittar."]
          },
          evaluation: [["Revokes and informs customers instead of rotating quietly", "Återkallar och informerar kunderna i stället för att byta i tysthet"]],
          pushback: {
            A: [
              pb(["The update wave", "Uppdateringsvågen"], ["Revocation stops updates for {{num.softwareCustomers|number}} customers until they install software signed with the new key, and some update by hand in places that are hard to reach. The product's support team is small. Who handles the wave, and how long can customers wait?", "Återkallelsen stoppar uppdateringar för {{num.softwareCustomers|number}} kunder tills de installerat programvara signerad med den nya nyckeln, och en del uppdaterar för hand på svåråtkomliga platser. Produktens supportteam är litet. Vem tar hand om vågen, och hur länge kan kunderna vänta?"]),
              pb(["“Was anything signed?”", "”Har något signerats?”"], ["The first replies to your customer message ask the obvious question: was anything malicious signed with the stolen key? You do not know yet. What do you say, and are you ready to write “we don't know”?", "De första svaren på ert kundmeddelande ställer den självklara frågan: har något skadligt signerats med den stulna nyckeln? Ni vet inte ännu. Vad säger ni, och är ni beredda att skriva ”vi vet inte”?"]),
              pb(["Sales asks for a delay", "Försäljning vill vänta"], ["The product's sales lead says customers will read “revoked certificate” as “hacked product”, and two large renewals are due this month. They ask whether revocation could wait until after the renewals. Do you hold the line, and who tells sales?", "Produktens försäljningsansvarige säger att kunderna kommer att läsa ”återkallat certifikat” som ”hackad produkt”, och två stora förnyelser ska göras den här månaden. Hen frågar om återkallelsen kan vänta tills efter förnyelserna. Står ni fast, och vem säger det till försäljning?"])
            ],
            B: [
              pb(["The old key still works", "Den gamla nyckeln fungerar"], ["Stopping your own use of the old key does not stop the attacker using it: anything they sign still looks like your product to every customer. The quiet change protects nothing already out there. Why keep a stolen key valid?", "Att ni själva slutar använda den gamla nyckeln hindrar inte angriparen från att göra det: allt de signerar ser fortfarande ut som er produkt för varje kund. Det tysta bytet skyddar inget som redan finns ute. Varför låta en stulen nyckel vara giltig?"]),
              pb(["A customer notices", "En kund märker det"], ["A customer's security team notices that the latest update is signed with a new certificate and asks why, in writing. Any answer that leaves out the theft becomes a statement you will have to stand by. What do you reply?", "En kunds säkerhetsteam märker att den senaste uppdateringen är signerad med ett nytt certifikat och frågar skriftligt varför. Varje svar som utelämnar stölden blir ett påstående ni måste stå för. Vad svarar ni?"]),
              pb(["What the contracts say", "Vad avtalen säger"], ["{{person.legal.name}} finds that several customer contracts require notice of security incidents affecting the product. A quiet change may breach them, and the breach surfaces the day the theft becomes known. Is silence still the cheaper option?", "{{person.legal.name}} hittar flera kundavtal som kräver underrättelse om säkerhetsincidenter som rör produkten. Ett tyst byte kan bryta mot dem, och avtalsbrottet kommer fram samma dag som stölden blir känd. Är tystnad fortfarande det billigare alternativet?"])
            ],
            C: [
              pb(["Watching what?", "Bevaka vad?"], ["{{person.socLead.name}} asks how you would ever see misuse: malware signed with your key runs on other people's machines, not yours. You would hear about it from a customer or the news. What exactly are you watching, and who would tell you?", "{{person.socLead.name}} frågar hur ni över huvud taget skulle se missbruk: skadlig kod signerad med er nyckel körs på andras datorer, inte era. Ni skulle få höra det från en kund eller via nyheterna. Vad är det egentligen ni bevakar, och vem skulle berätta det för er?"]),
              pb(["Customers trust it blindly", "Kunderna litar blint"], ["Every day the key stays valid, {{num.softwareCustomers|number}} customers trust anything signed with it, without knowing there is a reason not to. If something signed turns up, they will ask when you knew. What will you say?", "Varje dag nyckeln förblir giltig litar {{num.softwareCustomers|number}} kunder på allt som signerats med den, utan att veta att det finns skäl att låta bli. Om något signerat dyker upp kommer de att fråga när ni visste. Vad säger ni då?"]),
              pb(["“For now” has no end", "”Tills vidare” har inget slut"], ["{{person.devLead.name}} says that even once you decide to revoke, a clean build environment for a new key takes days to set up. Waiting to decide only adds to that. When does “for now” end, and who decides?", "{{person.devLead.name}} säger att även när ni väl bestämmer er för att återkalla tar det dagar att bygga en ren byggmiljö för en ny nyckel. Att vänta med beslutet lägger bara till tid. När tar ”tills vidare” slut, och vem bestämmer det?"])
            ]
          }
        }),
        facilitator: fac(
          ["The signing key turns an internal incident into your customers' supply-chain risk.", "Signeringsnyckeln gör en intern incident till en risk i era kunders leveranskedja."],
          ["Revocation, a clean new key and clear customer guidance.", "Återkallelse, en ny ren nyckel och tydlig vägledning till kunderna."],
          [["Ask: who could sign malware as your product today?", "Fråga: vem skulle kunna signera skadlig kod som er produkt i dag?"]]
        )
      },
      {
        id: "p5",
        clock: 2880,
        priority: 2,
        title: L(["Whose decision?", "Vems beslut?"]),
        twist: L(["The acquired company is still a separate legal entity with its own board. Its managing director refuses to rebuild during their busiest quarter and says the decision is theirs.", "Det förvärvade företaget är fortfarande en egen juridisk person med egen styrelse. Dess vd vägrar att bygga om under deras mest hektiska kvartal och säger att beslutet är deras."]),
        twistKind: "authority",
        assumptionChallenged: L(["We own the company, so we decide.", "Vi äger företaget, så vi bestämmer."]),
        narrative: L([
          "{{time.T+2880|weekday|cap}}. The security team has a clear recommendation: rebuild the acquired company's directory and systems before any connection is restored.\n\nThe integration steering committee meets with the acquired company's managing director to agree on it. The managing director arrives with a different view, and a different reading of who decides.",
          "{{time.T+2880|weekday|cap}}. Säkerhetsteamet har en tydlig rekommendation: bygg om det förvärvade företagets katalogtjänst och system innan någon förbindelse återställs.\n\nIntegrationens styrgrupp möts med det förvärvade företagets vd för att komma överens om det. Vd kommer med en annan uppfattning, och en annan tolkning av vem som bestämmer."
        ]),
        injects: [
          inj("i5-1", 2880, "executiveMessage", "management", "high", "disputed", [
            "Acquired company's managing director: “Our board decides how our systems are run until integration is complete. A rebuild now will cost us our three largest customers.”",
            "Det förvärvade företagets vd: ”Vår styrelse beslutar om hur våra system drivs tills integrationen är klar. En ombyggnad nu kostar oss våra tre största kunder.”"
          ], { facilitatorNote: ["Formally partly right; practically, the parent carries the risk.", "Formellt delvis rätt; i praktiken bär moderbolaget risken."], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What is the minimum that must be rebuilt now to keep your side safe?", "Vad är det minsta som måste byggas om nu för att hålla er sida säker?", ["ciso", "itOps"]),
            q("Can the acquired company keep working while isolated from you?", "Kan det förvärvade företaget fortsätta arbeta medan det är isolerat från er?", ["networkLead"]),
            q("Is the new signing key in place and trusted by customers?", "Är den nya signeringsnyckeln på plats och betrodd av kunderna?", ["devLead"], "d4")
          ],
          executive: [
            q("How do you use ownership without breaking the people you bought?", "Hur använder ni ägarskapet utan att bryta ned de människor ni köpte?", ["ceo"]),
            q("Who in the group has the final word on security?", "Vem i koncernen har sista ordet om säkerhet?", ["ceo", "ciso"]),
            q("Would the customer message on the signing key look different if they decided?", "Skulle meddelandet till kunderna om signeringsnyckeln se annorlunda ut om de beslutade?", ["comms"], "d4")
          ]
        },
        challenges: [ch("The acquired company's staff worry the incident will be used to replace them.", "Det förvärvade företagets personal oroar sig för att incidenten ska användas för att ersätta dem.")],
        noDecision: L(["Resolve the authority question as a group: record who decides on security in subsidiaries, and how.", "Lös befogenhetsfrågan gemensamt: dokumentera vem som beslutar om säkerhet i dotterbolag, och hur."]),
        facilitator: fac(
          ["Ownership and authority are not the same thing during integration.", "Ägarskap och befogenhet är inte samma sak under en integration."],
          ["A group decision that isolates the acquired company until rebuilt, with support for its business.", "Ett koncernbeslut som isolerar det förvärvade företaget tills det är ombyggt, med stöd till dess verksamhet."],
          [["Ask: who would answer for this if the attacker came back across?", "Fråga: vem skulle stå till svars om angriparen kom tillbaka över?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        priority: 3,
        title: L(["Six months later", "Sex månader senare"]),
        twist: L(["The integration is six months late. The sellers dispute the warranty claim, and the board wants to know why security was not part of the deal.", "Integrationen är sex månader försenad. Säljarna bestrider garantikravet, och styrelsen vill veta varför säkerheten inte var en del av affären."]),
        twistKind: "impact",
        reconsider: { decision: "d3", pressure: { en: "The sellers dispute the warranty claim, and the integration is six months late. Did the way you handled them help you, or hurt you?", sv: "Säljarna bestrider garantikravet, och integrationen är sex månader försenad. Hjälpte eller stjälpte det sätt ni hanterade dem på?" } },
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because a warranty claim was served, the former CEO, still on the acquired company's board, has stopped cooperating with the investigation.", sv: "Eftersom ett garantikrav framställdes har den tidigare vd:n, som fortfarande sitter i det förvärvade företagets styrelse, slutat samarbeta med utredningen." } }
        ],
        assumptionChallenged: L(["Security is an IT question after the deal.", "Säkerhet är en IT-fråga efter affären."]),
        narrative: L([
          "Six months later. The board reviews a deal worth {{num.dealValue}} million, and the integration is far behind plan.\n\nThe incident is closed, but its costs are still arriving: the rebuild, the warranty dispute with the sellers and the customers who left. The chair wants to know what will be different in the next acquisition.",
          "Sex månader senare. Styrelsen går igenom en affär värd {{num.dealValue}} miljoner, och integrationen ligger långt efter plan.\n\nIncidenten är avslutad, men kostnaderna fortsätter att komma: ombyggnaden, garantitvisten med säljarna och kunderna som lämnade. Ordföranden vill veta vad som blir annorlunda vid nästa förvärv."
        ]),
        injects: [
          inj("i6-1", 10080, "executiveMessage", "management", "medium", "confirmed", [
            "Board chair: “Next time I want security findings in the investment memo, not in an incident report.”",
            "Styrelseordföranden: ”Nästa gång vill jag ha säkerhetsfynden i investeringsunderlaget, inte i en incidentrapport.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What would a security assessment before closing have needed to see?", "Vad skulle en säkerhetsbedömning före tillträdet ha behövt se?", ["ciso"]),
            q("What is the rule for connecting an acquired network from now on?", "Vad är regeln för att koppla in ett förvärvat nätverk framöver?", ["cio", "networkLead"]),
            q("Did the decision on the signing key hold up with customers?", "Höll beslutet om signeringsnyckeln inför kunderna?", ["devLead"], "d4")
          ],
          executive: [
            q("Who owns cyber risk in deals?", "Vem äger cyberrisken i affärer?", ["cfo", "ceo"]),
            q("What do you change in the acquisition process?", "Vad ändrar ni i förvärvsprocessen?", ["cfo", "legal"]),
            q("Looking back, was the decision on the sellers right?", "I efterhand, var beslutet om säljarna rätt?", ["ceo"], "d3")
          ]
        },
        challenges: [ch("The next acquisition is already in negotiation.", "Nästa förvärv förhandlas redan.")],
        decision: dec("d5", "cfo", ["What changes in your acquisition process?", "Vad ändras i er förvärvsprocess?"], [
          ["Security assessment with evidence before signing, specific warranties, and no network connection until a compromise assessment is clean.", "En säkerhetsbedömning med belägg före undertecknandet, särskilda garantier och ingen nätverksanslutning förrän en intrångsbedömning är ren."],
          ["Add more security questions to the questionnaire.", "Lägg till fler säkerhetsfrågor i frågeformuläret."],
          ["Keep the process, but turn the security questionnaire into a signed warranty, so a false answer costs the seller.", "Behåll processen, men gör säkerhetsformuläret till en undertecknad garanti, så att ett felaktigt svar kostar säljaren."]
        ], {
          knowns: [["A questionnaire answer hid a known compromise.", "Ett svar i frågeformuläret dolde ett känt intrång."]],
          uncertainties: [["How common this is in deals.", "Hur vanligt det här är i affärer."]],
          tradeoffs: {
            operational: ["Assessments add weeks to deals.", "Bedömningar lägger veckor till affärerna."],
            security: ["Connecting first and checking later imports the attacker.", "Att koppla ihop först och kontrollera sedan importerar angriparen."],
            legal: ["Specific warranties shift risk back to sellers.", "Särskilda garantier flyttar tillbaka risken till säljarna."],
            reputational: ["The board has asked twice.", "Styrelsen har frågat två gånger."]
          },
          evaluation: [["Requires evidence and a clean assessment before connecting", "Kräver belägg och en ren bedömning innan ihopkoppling"]],
          pushback: {
            A: [
              pb(["The next sellers refuse", "Nästa säljare vägrar"], ["In the deal already under negotiation, the sellers refuse any access to their systems before signing, citing confidentiality. Your new rule would stop the deal or delay it by weeks. Do you apply it anyway, or make an exception the very first time?", "I affären som redan förhandlas vägrar säljarna all åtkomst till sina system före undertecknandet, med hänvisning till sekretess. Er nya regel skulle stoppa affären eller försena den i veckor. Tillämpar ni den ändå, eller gör ni ett undantag redan första gången?"]),
              pb(["Losing bids", "Förlorade bud"], ["A compromise assessment on every target costs time and money even for deals that never close, and the deal team says you will lose bids to faster buyers. Who carries that cost, and are you ready to lose deals over it?", "En intrångsbedömning av varje uppköpsobjekt kostar tid och pengar även för affärer som aldrig blir av, och affärsteamet säger att ni kommer att förlora bud till snabbare köpare. Vem bär den kostnaden, och är ni beredda att förlora affärer för den?"]),
              pb(["Clean is a snapshot", "Ren är en ögonblicksbild"], ["A clean assessment says what was found on the day, not that nothing is there. The attacker in this deal stayed hidden for months. How will you decide that “clean” is clean enough to connect?", "En ren bedömning säger vad som hittades den dagen, inte att inget finns där. Angriparen i den här affären höll sig dold i månader. Hur ska ni avgöra att ”ren” är tillräckligt ren för att koppla ihop?"])
            ],
            B: [
              pb(["The question was asked", "Frågan ställdes redan"], ["The questionnaire already asked about incidents, and the answer was false. More questions give sellers more places to answer the same way. Why would a longer form have caught this?", "Frågeformuläret frågade redan om incidenter, och svaret var felaktigt. Fler frågor ger säljarna fler ställen att svara likadant. Varför skulle ett längre formulär ha fångat det här?"]),
              pb(["Not what the board asked", "Inte vad styrelsen bad om"], ["The board chair asked for security findings in the investment memo, not a longer appendix. A few extra questions will look like nothing has changed. How do you present this to the board?", "Styrelseordföranden bad om säkerhetsfynd i investeringsunderlaget, inte en längre bilaga. Några extra frågor kommer att se ut som att inget har ändrats. Hur presenterar ni det här för styrelsen?"]),
              pb(["Nobody reads the answers", "Ingen läser svaren"], ["The deal team admits that the last questionnaire's answers were filed, not reviewed by security. Adding questions does not add a reader. Who will read the answers, and with what authority to stop a deal?", "Affärsteamet medger att svaren i det senaste frågeformuläret arkiverades utan att säkerhet granskade dem. Fler frågor ger inte fler läsare. Vem ska läsa svaren, och med vilket mandat att stoppa en affär?"])
            ],
            C: [
              pb(["Paid after the damage", "Betalt efter skadan"], ["A warranty pays out after the harm, and only if you win. This time the sellers are disputing the claim six months on. Does a warranty protect your network on connection day, or only your lawyers afterwards?", "En garanti betalar ut efter skadan, och bara om ni vinner. Den här gången bestrider säljarna kravet sex månader senare. Skyddar en garanti ert nätverk den dag ni kopplar ihop, eller bara era jurister efteråt?"]),
              pb(["Sellers won't sign", "Säljarna skriver inte under"], ["The sellers in the next deal refuse to sign a security warranty they say they cannot verify themselves, or want a higher price for it. Your negotiators say it will slow the deal. Do you insist, or soften the wording?", "Säljarna i nästa affär vägrar att skriva under en säkerhetsgaranti som de säger att de inte själva kan verifiera, eller vill ha ett högre pris för den. Era förhandlare säger att det bromsar affären. Står ni på er, eller mildrar ni formuleringen?"]),
              pb(["Still connecting first", "Fortfarande ihopkoppling först"], ["Nothing in this change stops the next integration team from joining networks the day after closing. The warranty would have changed who pays, not what happened. What stops the connection itself?", "Inget i den här ändringen hindrar nästa integrationsteam från att koppla ihop nätverken dagen efter tillträdet. Garantin hade ändrat vem som betalar, inte vad som hände. Vad stoppar själva ihopkopplingen?"])
            ]
          }
        }),
        facilitator: fac(
          ["End on the process: questionnaires record claims, not facts.", "Avsluta med processen: frågeformulär dokumenterar påståenden, inte fakta."],
          ["Evidence-based assessment, warranties and a connect-only-when-clean rule.", "Bedömning baserad på belägg, garantier och en regel om att bara koppla ihop när det är rent."],
          [["Ask: what will you check before the next connection?", "Fråga: vad kommer ni att kontrollera före nästa ihopkoppling?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The trust is cut, the acquired company rebuilt and the signing key replaced, but deal plans were read and the integration slips by months.",
        "Förtroendet kapas, det förvärvade företaget byggs om och signeringsnyckeln byts ut, men affärsplaner lästes och integrationen försenas i flera månader."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Connecting an acquired network imports its attackers: assess before you connect.", "Att koppla in ett förvärvat nätverk importerar dess angripare: bedöm innan ni kopplar ihop."]),
        L(["A directory controlled for months is rebuilt, not cleaned.", "En katalog som kontrollerats i månader byggs om, den saneras inte."]),
        L(["A stolen code-signing key is your customers' problem too: revoke and tell them.", "En stulen kodsigneringsnyckel är också era kunders problem: återkalla och berätta för dem."]),
        L(["Settle who decides on security in subsidiaries before you need to.", "Bestäm vem som beslutar om säkerhet i dotterbolag innan ni behöver det."])
      ],
      assumptionsVsReality: [
        avr(["A migration script.", "Ett migreringsskript."], ["An attacker inside for months.", "En angripare som funnits inne i månader."], "p2"),
        avr(["The sellers told us everything.", "Säljarna berättade allt."], ["They knew and didn't say.", "De visste och sa inget."], "p3"),
        avr(["Only the acquired company is affected.", "Bara det förvärvade företaget är drabbat."], ["Your mail and your customers are too.", "Även er e-post och era kunder är drabbade."], "p4")
      ],
      strengthsToLookFor: [
        L(["Cutting the trust early", "Att kapa förtroendet tidigt"]),
        L(["Keeping the dispute separate from the response", "Att hålla tvisten åtskild från insatsen"]),
        L(["Revoking the signing key openly", "Att återkalla signeringsnyckeln öppet"])
      ],
      commonGaps: [
        L(["Connecting networks on integration day without an assessment", "Att koppla ihop nätverk på integrationsdagen utan bedömning"]),
        L(["Trusting questionnaire answers", "Att lita på svar i frågeformulär"]),
        L(["Unclear authority over the subsidiary", "Oklar befogenhet över dotterbolaget"])
      ],
      suggestedActions: [
        act(["Require a compromise assessment before connecting any acquired network.", "Kräv en intrångsbedömning innan ett förvärvat nätverk kopplas in."], "ciso", "high"),
        act(["Add security evidence and warranties to the acquisition process.", "För in säkerhetsbelägg och garantier i förvärvsprocessen."], "cfo", "high"),
        act(["Keep code-signing keys in hardware modules, separate from build servers.", "Förvara kodsigneringsnycklar i hårdvarumoduler, åtskilda från byggservrar."], "devLead", "high"),
        act(["Define group authority over subsidiaries' security.", "Fastställ koncernens befogenhet över dotterbolagens säkerhet."], "ceo", "medium")
      ]
    }
  });
})();
