/*
 * s39-election-night.js — "Election Night" (archetype E, news media).
 *
 * Fifteen minutes after the polls close, ransomware stops the publishing system and
 * print production → the way in was the print contractor's remote access → a fake
 * results page imitating the newspaper spreads → before encrypting, the attackers had
 * altered the newspaper's own results table, and a candidate is quoting the wrong
 * numbers → the election authority asks you not to say "attack" yet → the morning:
 * stolen drafts, including an unverified story about a candidate, are published.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, pb } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s39-election-night",
    version: 1,
    category: "election-night",
    archetype: "compound-crisis",
    emblem: "election-night",
    title: L(["Election Night", "Valnatten"]),
    summary: L([
      "The polls closed fifteen minutes ago and your readers want the results. Your publishing system is encrypted, a fake version of your site is spreading, and the wrong numbers you published for twenty minutes are now someone's proof that the election was stolen.",
      "Vallokalerna stängde för en kvart sedan och läsarna vill ha resultaten. Ert publiceringssystem är krypterat, en falsk version av er sajt sprids, och de felaktiga siffror ni publicerade i tjugo minuter är nu någons bevis för att valet stals."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Keep publishing when the core system fails at the worst moment", "Fortsätta publicera när kärnsystemet fallerar i värsta tänkbara ögonblick"]), teaser: L(["The night that cannot move", "Natten som inte går att flytta"]) },
      { id: "lo2", text: L(["Contain an attack through a supplier without stopping the night's work", "Begränsa ett angrepp via en leverantör utan att stoppa nattens arbete"]), teaser: L(["The contractor's door", "Entreprenörens dörr"]) },
      { id: "lo3", text: L(["Correct your own errors fast, even when they help a false narrative", "Rätta era egna fel snabbt, även när de gynnar en falsk berättelse"]), teaser: L(["When your mistake becomes their proof", "När ert misstag blir deras bevis"]) },
      { id: "lo4", text: L(["Weigh authorities' requests against the duty to report", "Väga myndigheters önskemål mot skyldigheten att rapportera"]), teaser: L(["Who decides what is news", "Vem som avgör vad som är nyheter"]) }
    ],
    mitre: ["T1133", "T1486", "T1565", "T1491.002", "T1583"],
    frameworks: {
      nistCsf: ["GV.SC", "DE.AE", "RS.MA", "RS.CO", "RC.RP", "RC.CO"],
      iso27001: ["A.5.19", "A.5.21", "A.5.24", "A.5.26", "A.5.29", "A.5.30", "A.8.13"]
    },
    minStages: 4,
    maxStages: 6,
    constraints: { startWindow: "weekend", startTime: "20:15", sectors: ["media"] },
    actor: { types: ["criminal"], motivation: L(["Financial, timed for maximum pressure; the effect on trust in the election is a bonus they understand", "Ekonomisk, tajmad för största möjliga press; effekten på förtroendet för valet är en bonus de förstår"]), capability: "medium" },
    variables: {
      readers: { min: 200000, max: 4000000, scaleBy: "size", step: 10000 },
      minutesWrong: { min: 12, max: 40 },
      shares: { min: 8000, max: 140000, scaleBy: "size", step: 1000 },
      demand: { min: 2000000, max: 30000000, scaleBy: "size", step: 100000, currency: true }
    },
    roles: ["incidentCommander", "ceo", "ciso", "itOps", "serviceOwner", "comms", "legal", "supplierManager", "securityOfficer"],

    groundTruth: {
      rootCause: L([
        "The print contractor's support account had permanent remote access to {{org.name}}'s production network, protected by a password that had been reused on a breached site. The attackers logged in on Friday, mapped the network over the weekend and waited for election night. At 19:58 they changed the figures in the results table that feeds the live election page; at 20:12 they encrypted the publishing servers and print production, and they copied the editorial drafts folder, including stories not yet verified. The fake results site was registered on Saturday by the same group.",
        "Tryckentreprenörens supportkonto hade permanent fjärråtkomst till {{org.name}}s produktionsnät, skyddat av ett lösenord som återanvänts på en sajt som hackats. Angriparna loggade in i fredags, kartlade nätet under helgen och väntade på valnatten. Klockan 19.58 ändrade de siffrorna i resultattabellen som matar den direktsända valsidan; klockan 20.12 krypterade de publiceringsservrarna och tryckproduktionen, och de kopierade redaktionens mapp med utkast, även artiklar som ännu inte verifierats. Den falska resultatsajten registrerades i lördags av samma grupp."
      ]),
      attackerTimeline: [
        { at: -4320, text: L(["Attackers log in with the print contractor's support account.", "Angriparna loggar in med tryckentreprenörens supportkonto."]) },
        { at: -1440, text: L(["Look-alike results site registered.", "Förväxlingsbar resultatsajt registreras."]) },
        { at: -17, text: L(["Results table altered.", "Resultattabellen ändras."]) },
        { at: -3, text: L(["Publishing and print servers encrypted; drafts copied.", "Publicerings- och tryckservrar krypteras; utkast kopieras."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-contractor", revealStage: "p2", text: L(["The attackers came in through the print contractor's permanent support access.", "Angriparna kom in via tryckentreprenörens permanenta supportåtkomst."]) },
      { id: "hf-table", revealStage: "p4", text: L(["Before encrypting, the attackers changed the figures in your own results table.", "Innan de krypterade ändrade angriparna siffrorna i er egen resultattabell."]) },
      { id: "hf-drafts", revealStage: "p6", text: L(["The attackers copied unpublished drafts, including an unverified story about a candidate.", "Angriparna kopierade opublicerade utkast, däribland en overifierad artikel om en kandidat."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Fifteen minutes after the polls closed", "En kvart efter att vallokalerna stängt"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. Election night. The polls closed at 20:00, the exit poll is in, and {{num.readers|number}} people are expected on the site tonight. Then the publishing system stops responding, and the print production team reports that the page-layout servers show a ransom note.\n\nThe website still shows the 19:55 front page from the cache. The first official results arrive in about forty minutes. The newsroom is full and waiting for someone to say what to do.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Valnatt. Vallokalerna stängde klockan 20, vallokalsundersökningen har kommit, och {{num.readers|number}} personer väntas besöka sajten i kväll. Då slutar publiceringssystemet att svara, och tryckproduktionen rapporterar att sidlayoutservrarna visar ett utpressningsbrev.\n\nSajten visar fortfarande förstasidan från 19.55 ur cachen. De första officiella resultaten kommer om ungefär fyrtio minuter. Redaktionen är full och väntar på att någon ska säga vad som ska göras."
        ]),
        injects: [
          inj("i1-1", 0, "ransomNote", "attacker", "critical", "confirmed", [
            "“Your publishing and print systems are encrypted. Tonight is important for you. We also have your editorial drafts. {{num.demand|currency}} before midnight, or the drafts go public tomorrow.”",
            "”Era publicerings- och trycksystem är krypterade. I kväll är viktig för er. Vi har också era redaktionella utkast. {{num.demand|currency}} före midnatt, annars blir utkasten offentliga i morgon.”"
          ], { headline: ["On every layout server", "På varje layoutserver"], tests: ["lo1"] }),
          inj("i1-2", 10, "chat", "person.serviceOwner", "high", "confirmed", [
            "“We have the emergency publishing tool, a plain static site we've never used for real. Or IT says the cloud backup of the publishing system could be up in thirty minutes. Results start at 20:55.”",
            "”Vi har nödpubliceringsverktyget, en enkel statisk sajt som vi aldrig använt på riktigt. Eller så säger IT att molnkopian av publiceringssystemet kan vara uppe om trettio minuter. Resultaten börjar klockan 20.55.”"
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("What can you publish with, right now, that the attackers have not touched?", "Vad kan ni publicera med, just nu, som angriparna inte har rört?", ["itOps", "serviceOwner"]),
            q("Is the cloud backup safe to restore before you know how they got in?", "Är molnkopian säker att återställa innan ni vet hur de kom in?", ["ciso"]),
            q("What still connects the newsroom to the encrypted network?", "Vad kopplar fortfarande samman redaktionen med det krypterade nätet?", ["itOps"])
          ],
          executive: [
            q("What do readers need from you tonight, at a minimum?", "Vad behöver läsarna från er i kväll, som ett minimum?", ["ceo"]),
            q("Who decides what is published while the system is down?", "Vem bestämmer vad som publiceras medan systemet ligger nere?", ["ceo", "incidentCommander"]),
            q("Do you tell readers tonight that you have been attacked?", "Berättar ni för läsarna i kväll att ni har blivit angripna?", ["comms"])
          ]
        },
        challenges: [ch("The emergency tool has never carried live traffic; nobody knows how it behaves under load.", "Nödverktyget har aldrig burit verklig trafik; ingen vet hur det beter sig under belastning.")],
        decision: dec("d1", "ceo", ["How do you keep publishing tonight?", "Hur fortsätter ni publicera i kväll?"], [
          ["Switch to the emergency publishing tool now with a small team, and leave the publishing system down.", "Gå över till nödpubliceringsverktyget nu med ett litet team, och låt publiceringssystemet ligga nere."],
          ["Give IT thirty minutes to restore the publishing system from the cloud backup before results start.", "Ge IT trettio minuter att återställa publiceringssystemet från molnkopian innan resultaten börjar."],
          ["Publish results only on social channels and through the news agency feed tonight.", "Publicera resultaten bara i sociala kanaler och via nyhetsbyråns flöde i kväll."]
        ], {
          knowns: [["The publishing system and print production are encrypted; results start in forty minutes.", "Publiceringssystemet och tryckproduktionen är krypterade; resultaten börjar om fyrtio minuter."]],
          uncertainties: [["How the attackers got in, and whether the backup is clean.", "Hur angriparna kom in, och om säkerhetskopian är ren."]],
          tradeoffs: {
            operational: ["The emergency tool is untested; the restore may fail.", "Nödverktyget är otestat; återställningen kan misslyckas."],
            security: ["Restoring before you know the way in may bring the attackers back.", "Att återställa innan ni vet vägen in kan släppa in angriparna igen."],
            legal: ["Election results published wrongly carry real weight.", "Felaktigt publicerade valresultat väger tungt."],
            reputational: ["Going dark on election night is noticed by everyone.", "Att släckas ner på valnatten märks av alla."]
          },
          evaluation: [["Keeps readers informed tonight without restoring into a network the attackers still own", "Håller läsarna informerade i kväll utan att återställa in i ett nät som angriparna fortfarande äger"]],
          pushback: {
            A: [
              pb(["The tool buckles", "Nödverktyget viker sig"], ["The first results go out on the emergency tool and the page takes forty seconds to load; readers are posting screenshots of error messages. It has never carried this much traffic. Do you keep pushing readers to it, or switch to something else in the middle of the count?", "De första resultaten går ut i nödverktyget och sidan tar fyrtio sekunder att ladda; läsarna lägger ut skärmbilder av felmeddelanden. Verktyget har aldrig burit så mycket trafik. Fortsätter ni att leda läsarna dit, eller byter ni till något annat mitt i rösträkningen?"]),
              pb(["The newsroom left outside", "Redaktionen står utanför"], ["Only a handful of people can use the emergency tool, and the rest of the newsroom sits idle with stories nobody can publish. The political desk says you have turned election night into a press-release service. Do you open an untested tool to more people, or tell most of your reporters to wait?", "Bara en handfull personer kan använda nödverktyget, och resten av redaktionen sitter sysslolös med artiklar som ingen kan publicera. Politikredaktionen säger att ni har gjort valnatten till en pressmeddelandetjänst. Öppnar ni ett otestat verktyg för fler, eller ber ni de flesta reportrar att vänta?"]),
              pb(["Who checks the figures?", "Vem kontrollerar siffrorna?"], ["In the publishing system, results arrived automatically from the election feed. In the emergency tool, someone types them in by hand, under time pressure, with nobody checking. Do you slow down to double-check every figure, or accept the risk of a typo on election night?", "I publiceringssystemet kom resultaten automatiskt från valflödet. I nödverktyget skriver någon in dem för hand, under tidspress, utan att någon kontrollerar. Saktar ni ner för att dubbelkolla varje siffra, eller tar ni risken för ett skrivfel på valnatten?"])
            ],
            B: [
              pb(["The restore slows down", "Återställningen går trögt"], ["Twenty minutes in, IT says the restore is at forty per cent and slowing. The first results are about to arrive, and you have nothing ready to publish them with. Do you keep waiting, or switch now with even less time to prepare?", "Efter tjugo minuter säger IT att återställningen är på fyrtio procent och går allt långsammare. De första resultaten är på väg, och ni har inget redo att publicera dem med. Väntar ni vidare, eller byter ni nu med ännu mindre tid att förbereda?"]),
              pb(["Restoring into what?", "Återställa in i vad?"], ["{{person.ciso.name}} objects: nobody knows yet how the attackers got in, and the restored system will come up on the same network, with the same accounts and connections. Do you bring your main system back into a network the attackers may still be inside, against your security lead's advice?", "{{person.ciso.name}} invänder: ingen vet ännu hur angriparna kom in, och det återställda systemet kommer upp i samma nät, med samma konton och förbindelser. Tar ni tillbaka ert huvudsystem in i ett nät där angriparna kanske fortfarande finns, mot er säkerhetschefs råd?"]),
              pb(["A copy from when?", "En kopia från när?"], ["IT cannot say when the attackers first got in, so nobody knows whether the cloud backup was taken before or after. Do you restore it tonight, on trust, onto the site {{num.readers|number}} people are about to visit?", "IT kan inte säga när angriparna kom in första gången, så ingen vet om molnkopian togs före eller efter. Återställer ni den i kväll, på god tro, till sajten som {{num.readers|number}} personer snart ska besöka?"])
            ],
            C: [
              pb(["Your own front door is frozen", "Er egen ytterdörr står frusen"], ["Your site still shows the old front page, with nothing about the results. The readers who come to you directly, the ones who trust you most, find nothing and start asking online whether you have shut down. Do you leave your own site frozen on election night?", "Sajten visar fortfarande den gamla förstasidan, utan något om resultaten. Läsarna som går direkt till er, de som litar mest på er, hittar ingenting och börjar fråga på nätet om ni har lagt ner. Låter ni er egen sajt stå frusen på valnatten?"]),
              pb(["Someone else's night", "Någon annans natt"], ["The news agency feed carries its own results and analysis, under its own name. Your political editor says that for the first time in decades the paper has nothing of its own to say on election night. Is handing your biggest night to someone else really the least bad option?", "Nyhetsbyråns flöde bär sina egna resultat och sin egen analys, i eget namn. Er politiska redaktör säger att tidningen för första gången på decennier inte har något eget att säga på valnatten. Är det verkligen det minst dåliga alternativet att lämna över er största natt till någon annan?"]),
              pb(["Who controls the accounts?", "Vem styr kontona?"], ["The passwords for your social media accounts are kept in a shared document on the network that was just encrypted. Nobody can say whether the attackers read it first. Do you publish election results through accounts you cannot be sure only you control?", "Lösenorden till era konton i sociala medier ligger i ett delat dokument på det nät som just krypterades. Ingen kan säga om angriparna läste det först. Publicerar ni valresultat via konton som ni inte säkert vet att bara ni styr?"])
            ]
          }
        }),
        facilitator: fac(
          ["Time is the enemy. Watch whether the room decides before results start at 20:55.", "Tiden är fienden. Se om rummet beslutar innan resultaten börjar klockan 20.55."],
          ["A safe, separate channel for results tonight, and no restore until the way in is known.", "En säker, separat kanal för resultaten i kväll, och ingen återställning förrän vägen in är känd."],
          [["Ask: what is the least you must publish tonight to keep readers' trust?", "Fråga: vad är det minsta ni måste publicera i kväll för att behålla läsarnas förtroende?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 45,
        title: L(["The print plant's door", "Tryckeriets dörr"]),
        twist: L(["The way in was the print contractor's support account. It has had permanent remote access to the production network for years, and tonight's print run depends on it.", "Vägen in var tryckentreprenörens supportkonto. Det har haft permanent fjärråtkomst till produktionsnätet i åratal, och nattens tryckning är beroende av det."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "B" }, narrativeAppend: { en: "Because you waited for the restore, it failed at 20:50, and for the first hour of results your readers found only the 19:55 front page.", sv: "Eftersom ni väntade på återställningen misslyckades den klockan 20.50, och under resultatens första timme hittade läsarna bara förstasidan från 19.55." } }
        ],
        assumptionChallenged: L(["They came in through our newsroom.", "De kom in via vår redaktion."]),
        reveals: ["hf-contractor"],
        narrative: L([
          "{{time.T+45|clock}}. {{person.ciso.name}} has the access logs. The first login was on Friday afternoon, from the print contractor's support account, which has had round-the-clock access to the production network since the contract began. Its password matches one in a public breach list.\n\nThe contractor's night manager is on the phone. Tonight's pages must reach the print plant by 01:30 through that same connection, or the morning edition does not exist.",
          "Klockan {{time.T+45|clock}}. {{person.ciso.name}} har åtkomstloggarna. Den första inloggningen skedde i fredags eftermiddag, från tryckentreprenörens supportkonto, som haft åtkomst dygnet runt till produktionsnätet sedan avtalet började. Lösenordet stämmer med ett i en offentlig läcklista.\n\nEntreprenörens nattchef är i telefon. Nattens sidor måste nå tryckeriet senast klockan 01.30 via samma förbindelse, annars finns ingen morgonupplaga."
        ]),
        injects: [
          inj("i2-1", 45, "authLog", "soc", "high", "confirmed", [
            "Remote access gateway: account print-support, logins Friday 15:20, Saturday 02:10 and 23:40, Sunday 19:41. Source addresses abroad. No MFA on this account (exception granted 3 years ago).",
            "Gateway för fjärråtkomst: kontot print-support, inloggningar fredag 15.20, lördag 02.10 och 23.40, söndag 19.41. Källadresser utomlands. Ingen MFA på kontot (undantag beviljat för 3 år sedan)."
          ], { reveals: ["hf-contractor"], tests: ["lo2"] }),
          inj("i2-2", 55, "phoneTranscript", "person.supplierManager", "medium", "confirmed", [
            "Print contractor: “If you cut our line, we can't receive pages, and there's no paper tomorrow. Change the password, fine, but leave the link up until the run is done.”",
            "Tryckentreprenören: ”Om ni kapar vår förbindelse kan vi inte ta emot sidor, och då blir det ingen tidning i morgon. Byt lösenord, visst, men låt förbindelsen vara uppe tills tryckningen är klar.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Can the print run use a different, one-off path tonight?", "Kan tryckningen använda en annan, tillfällig väg i natt?", ["itOps", "supplierManager"]),
            q("What else can that support account reach?", "Vad mer kan det supportkontot nå?", ["ciso"]),
            q("Did the way you chose to publish tonight hold up?", "Höll det sätt ni valde att publicera på i kväll?", ["serviceOwner"], "d1")
          ],
          executive: [
            q("Is a printed edition tomorrow worth keeping the door open tonight?", "Är en tryckt upplaga i morgon värd att hålla dörren öppen i natt?", ["ceo"]),
            q("Who at the contractor do you trust tonight?", "Vem hos entreprenören litar ni på i natt?", ["supplierManager"]),
            q("Would you make the same call on publishing again?", "Skulle ni fatta samma beslut om publiceringen igen?", ["ceo"], "d1")
          ]
        },
        challenges: [ch("The attackers' note says they will wipe the backups too if they lose access.", "Angriparnas brev säger att de raderar säkerhetskopiorna också om de förlorar åtkomsten.")],
        decision: dec("d2", "ciso", ["What do you do with the contractor's access?", "Vad gör ni med entreprenörens åtkomst?"], [
          ["Cut all remote access now, the contractor's included, and send tonight's pages to the plant on encrypted media by courier.", "Kapa all fjärråtkomst nu, även entreprenörens, och skicka nattens sidor till tryckeriet på krypterade medier med bud."],
          ["Disable the hijacked account, open a temporary, monitored path for the print run only, and close it at 02:00.", "Stäng av det kapade kontot, öppna en tillfällig, bevakad väg enbart för tryckningen och stäng den klockan 02."],
          ["Leave the link up until the print run is done, and watch it closely.", "Låt förbindelsen vara uppe tills tryckningen är klar, och bevaka den noga."]
        ], {
          knowns: [["The attackers came in through the contractor's permanent support access.", "Angriparna kom in via entreprenörens permanenta supportåtkomst."]],
          uncertainties: [["Whether the attackers have other ways in, and whether they will act on their threat.", "Om angriparna har andra vägar in, och om de kommer att genomföra sitt hot."]],
          tradeoffs: {
            operational: ["A courier is slow and fragile; the open link is fast and compromised.", "Ett bud är långsamt och sårbart; den öppna förbindelsen är snabb och komprometterad."],
            security: ["Every hour the link stays open, the attackers can act again.", "Varje timme förbindelsen står öppen kan angriparna agera igen."],
            legal: ["The contract has no clause about who decides in an incident.", "Avtalet saknar en klausul om vem som bestämmer vid en incident."],
            reputational: ["No paper tomorrow, after election night, is a story of its own.", "Ingen tidning i morgon, efter valnatten, är en nyhet i sig."]
          },
          evaluation: [["Closes the attackers' door tonight and still finds a way to print", "Stänger angriparnas dörr i natt och hittar ändå ett sätt att trycka"]],
          pushback: {
            A: [
              pb(["One delay from no paper", "En försening från ingen tidning"], ["The courier needs about two hours each way, and the plant needs time to check unfamiliar media before it can print. One delay on the road, and there is no morning edition after election night. Do you accept that risk for a clean cut, or reopen a line just for tonight?", "Budet behöver ungefär två timmar åt varje håll, och tryckeriet behöver tid att kontrollera okända medier innan det kan trycka. En enda försening på vägen, och det blir ingen morgonupplaga efter valnatten. Tar ni den risken för ett rent snitt, eller öppnar ni en förbindelse bara för i natt?"]),
              pb(["The plant says no", "Tryckeriet säger nej"], ["The contractor's night manager says the plant will not plug an unknown drive into the press network, least of all from a customer that has just been hit by ransomware. Without their agreement, your courier carries files nobody will print. Do you pressure a supplier you have just locked out, or look for another printer tonight?", "Entreprenörens nattchef säger att tryckeriet inte kopplar in ett okänt minne i pressarnas nät, allra minst från en kund som just drabbats av utpressningsprogram. Utan deras medgivande bär budet på filer som ingen kommer att trycka. Pressar ni en leverantör som ni just stängt ute, eller letar ni efter ett annat tryckeri i natt?"]),
              pb(["Your own people locked out", "Era egna utestängda"], ["Cutting all remote access also locks out the reporters at the counting venues and the on-call IT staff working from home. Half the people you need tonight are now outside. Do you reopen access for some of them, and how do you know which connections are safe?", "Att kapa all fjärråtkomst stänger också ute reportrarna på rösträkningsplatserna och IT-jouren som arbetar hemifrån. Hälften av dem ni behöver i natt står nu utanför. Öppnar ni igen för några av dem, och hur vet ni vilka förbindelser som är säkra?"])
            ],
            B: [
              pb(["Built in an hour", "Byggd på en timme"], ["A new, monitored connection to the plant needs the contractor's technicians on their side and your IT on yours, on a night when both are stretched. Nobody has built one like it before. Do you bet the morning edition on a connection designed in the next hour?", "En ny, bevakad förbindelse till tryckeriet kräver entreprenörens tekniker på deras sida och er IT på er, en natt då båda är hårt pressade. Ingen har byggt en sådan förut. Satsar ni morgonupplagan på en förbindelse som utformas under den närmaste timmen?"]),
              pb(["“We have other doors”", "”Vi har fler dörrar”"], ["Minutes after the account is disabled, a new message appears on a layout server: “You closed one door. We still have others.” {{person.ciso.name}} cannot tell whether it is a bluff. Do you keep the temporary path open for the print run, knowing they may be watching it?", "Några minuter efter att kontot stängts av dyker ett nytt meddelande upp på en layoutserver: ”Ni stängde en dörr. Vi har fler.” {{person.ciso.name}} kan inte avgöra om det är en bluff. Håller ni den tillfälliga vägen öppen för tryckningen, med vetskap om att de kanske bevakar den?"]),
              pb(["Monitored by whom?", "Bevakad av vem?"], ["“Monitored” means someone watching the traffic all night. The only analyst who knows this network has been on duty since the morning. Who is really watching the path in the middle of the night, and would they recognise an attacker if they saw one?", "”Bevakad” betyder att någon tittar på trafiken hela natten. Den enda analytiker som känner det här nätet har varit i tjänst sedan i morse. Vem bevakar egentligen vägen mitt i natten, och skulle den personen känna igen en angripare?"])
            ],
            C: [
              pb(["The same open door", "Samma öppna dörr"], ["The link you are keeping open is the exact path the attackers used, through an account with no MFA. Watching it closely means seeing them come back, not stopping them. What exactly will you do, and how fast, if they log in again tonight?", "Förbindelsen ni håller öppen är exakt den väg angriparna använde, via ett konto utan MFA. Att bevaka den noga betyder att se dem komma tillbaka, inte att stoppa dem. Vad gör ni exakt, och hur snabbt, om de loggar in igen i natt?"]),
              pb(["An objection on record", "En reservation till protokollet"], ["{{person.ciso.name}} asks to have it minuted that they advised against keeping the link open. If the attackers act again tonight, the record will show the paper chose a print run over closing a known door. Who signs this decision, by name?", "{{person.ciso.name}} vill ha det till protokollet att hen avrådde från att hålla förbindelsen öppen. Om angriparna slår till igen i natt kommer det att framgå att tidningen valde tryckningen framför att stänga en känd dörr. Vem skriver under beslutet, med namn?"]),
              pb(["Watching with what?", "Bevaka med vad?"], ["The logs that showed the logins come from the gateway, which reports with a delay of several minutes. By the time an alert reaches anyone, an attacker could be finished. Is “watch it closely” a real control tonight, or just a reason to keep the door open?", "Loggarna som visade inloggningarna kommer från gatewayen, som rapporterar med flera minuters fördröjning. När ett larm når någon kan en angripare redan vara klar. Är ”bevaka noga” en verklig kontroll i natt, eller bara ett skäl att hålla dörren öppen?"])
            ]
          }
        }),
        facilitator: fac(
          ["The threat to wipe backups is designed to keep the door open. Watch whether the room is steered by it.", "Hotet om att radera säkerhetskopiorna är utformat för att hålla dörren öppen. Se om rummet styrs av det."],
          ["Close the compromised path and find a separate, controlled way to deliver pages.", "Stäng den komprometterade vägen och hitta ett separat, kontrollerat sätt att leverera sidor."],
          [["Ask: if you were the attackers, what would you do with an open link at 01:00?", "Fråga: om ni var angriparna, vad skulle ni göra med en öppen förbindelse klockan 01?"]]
        )
      },
      {
        id: "p3",
        clock: 90,
        title: L(["Results that are not yours", "Resultat som inte är era"]),
        twist: L(["A site that looks exactly like yours is spreading on social media, showing results that favour one party. It has been shared {{num.shares|number}} times, and people are quoting it as your reporting.", "En sajt som ser ut precis som er sprids i sociala medier och visar resultat som gynnar ett parti. Den har delats {{num.shares|number}} gånger, och folk citerar den som er rapportering."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "Readers who cannot find your real results are finding the fake ones. Whatever channel you chose tonight, is it loud enough to beat a copy of yourself?", sv: "Läsare som inte hittar era riktiga resultat hittar de falska. Vilken kanal ni än valde i kväll, hörs den tillräckligt för att slå en kopia av er själva?" } },
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because all remote access was cut, the print plant cannot receive pages, and the courier with tonight's files is stuck behind a closed bridge.", sv: "Eftersom all fjärråtkomst kapades kan tryckeriet inte ta emot sidor, och budet med nattens filer har fastnat bakom en stängd bro." } }
        ],
        assumptionChallenged: L(["Being offline is our biggest problem.", "Att vara nere är vårt största problem."]),
        narrative: L([
          "{{time.T+90|clock}}. {{person.comms.name}} shows the room a phone. The page has the newspaper's logo, its fonts, its election graphics, and a results table that is wrong in a way that is easy to believe: one party a few points stronger in the big cities.\n\nThe address differs from yours by one letter. Influencers on both sides are sharing it, some with outrage, some with celebration, all with your name attached.",
          "Klockan {{time.T+90|clock}}. {{person.comms.name}} visar rummet en telefon. Sidan har tidningens logotyp, dess typsnitt, dess valgrafik och en resultattabell som är fel på ett sätt som är lätt att tro på: ett parti några procentenheter starkare i storstäderna.\n\nAdressen skiljer sig från er med en bokstav. Profiler på båda sidor delar den, en del upprörda, en del firande, alla med ert namn bifogat."
        ]),
        injects: [
          inj("i3-1", 90, "socialPost", "socialMedia", "high", "misleading", [
            "“BREAKING from the paper itself: landslide in the cities! The establishment won't want you to see this. Share before they take it down.” (link to the look-alike site)",
            "”SENASTE från tidningen själv: jordskred i städerna! Etablissemanget vill inte att du ska se det här. Dela innan de tar bort det.” (länk till den förväxlingsbara sajten)"
          ], { headline: ["Shared {{num.shares|number}} times", "Delad {{num.shares|number}} gånger"], facilitatorNote: ["The fake is designed to be amplified by the act of debunking it.", "Förfalskningen är utformad för att spridas genom själva försöken att avslöja den."], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How fast can you get the look-alike site taken down, and by whom?", "Hur snabbt kan ni få den förväxlingsbara sajten nedtagen, och av vem?", ["ciso", "legal"]),
            q("How do readers tell your real channel from the copy tonight?", "Hur skiljer läsarna er riktiga kanal från kopian i kväll?", ["serviceOwner"]),
            q("Did cutting or keeping the contractor's link make tonight harder?", "Gjorde det i natt svårare att kapa eller behålla entreprenörens förbindelse?", ["itOps"], "d2")
          ],
          executive: [
            q("Does warning about the fake spread it further?", "Sprider en varning för förfalskningen den ytterligare?", ["comms"]),
            q("Who else should speak about this: the election authority, the platforms?", "Vem mer bör uttala sig om det här: valmyndigheten, plattformarna?", ["ceo"]),
            q("Would you handle the contractor the same way again, knowing the courier is stuck?", "Skulle ni hantera entreprenören på samma sätt igen, med vetskap om att budet har fastnat?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("One of the people sharing the fake is a sitting member of parliament.", "En av dem som delar förfalskningen är en sittande riksdagsledamot.")],
        decision: dec("d3", "ceo", ["How do you answer the fake results?", "Hur bemöter ni de falska resultaten?"], [
          ["Name it as a fake on every channel you control, and push the platforms and the registrar to take it down.", "Peka ut den som förfalskning i varje kanal ni styr, och pressa plattformarna och registraren att ta ner den."],
          ["Do not mention the fake; put all effort into getting the real results out faster and louder.", "Nämn inte förfalskningen; lägg all kraft på att få ut de riktiga resultaten snabbare och tydligare."],
          ["Ask the election authority to issue a statement on official results, and stay out of it yourselves.", "Be valmyndigheten gå ut med ett uttalande om de officiella resultaten, och håll er själva utanför."]
        ], {
          knowns: [["A convincing copy of your site is spreading false results under your name.", "En övertygande kopia av er sajt sprider falska resultat i ert namn."]],
          uncertainties: [["Whether a warning slows the fake or spreads it.", "Om en varning bromsar förfalskningen eller sprider den."]],
          tradeoffs: {
            operational: ["Every person on the fake is a person not on the results.", "Varje person som arbetar med förfalskningen arbetar inte med resultaten."],
            security: ["The look-alike site was registered in advance; this was planned.", "Den förväxlingsbara sajten registrerades i förväg; det här var planerat."],
            legal: ["Your name and logo are being used to mislead voters.", "Ert namn och er logotyp används för att vilseleda väljare."],
            reputational: ["Silence can look like agreement; noise can look like panic.", "Tystnad kan se ut som medhåll; oväsen kan se ut som panik."]
          },
          evaluation: [["Protects the public from false results without making the fake the main story", "Skyddar allmänheten från falska resultat utan att göra förfalskningen till huvudnyheten"]],
          pushback: {
            A: [
              pb(["Your warning spreads it", "Er varning sprider den"], ["Within twenty minutes of your warning, searches for the fake address triple. People share your post and the fake side by side, asking which one is real. Do you keep warning, knowing that every warning is also an advertisement?", "Inom tjugo minuter efter er varning har sökningarna på den falska adressen tredubblats. Folk delar ert inlägg och förfalskningen sida vid sida och frågar vilken som är äkta. Fortsätter ni varna, med vetskap om att varje varning också är en annons?"]),
              pb(["A politician hits back", "En politiker slår tillbaka"], ["A politician who shared the page says you are calling them a liar and accuses the paper of censoring inconvenient numbers. Their followers now attack your reporters by name. Do you answer the politician directly, or let the accusation stand?", "En politiker som delade sidan säger att ni kallar hen lögnare och anklagar tidningen för att censurera obekväma siffror. Hens följare angriper nu era reportrar med namn. Svarar ni politikern direkt, eller låter ni anklagelsen stå?"]),
              pb(["Not before morning", "Inte före morgonen"], ["The registrar replies that it needs a court order or proof of trademark infringement, and its lawyers work office hours. The platforms say they will “review” the posts. Do you keep spending people on a takedown that may not happen before morning?", "Registraren svarar att den behöver ett domstolsbeslut eller belägg för varumärkesintrång, och att dess jurister arbetar kontorstid. Plattformarna säger att de ska ”granska” inläggen. Fortsätter ni lägga folk på en nedtagning som kanske inte sker före morgonen?"])
            ],
            B: [
              pb(["Silence read as consent", "Tystnad som medhåll"], ["Readers tag your accounts under the fake page asking “is this yours?”, and your accounts post results without answering. Screenshots of your silence next to the question are spreading. How long can you leave a direct question about your own name unanswered?", "Läsare taggar era konton under den falska sidan och frågar ”är det här ert?”, och era konton lägger ut resultat utan att svara. Skärmbilder av er tystnad bredvid frågan sprids. Hur länge kan ni lämna en direkt fråga om ert eget namn obesvarad?"]),
              pb(["Louder is not faster", "Högre är inte snabbare"], ["Your real results go out only as fast as the official count allows. The fake has no such limit and keeps posting “new” figures before you can. Can you outrun a copy that never has to wait for facts?", "Era riktiga resultat går ut bara så snabbt som den officiella räkningen tillåter. Förfalskningen har ingen sådan gräns och lägger ut ”nya” siffror före er. Kan ni springa ifrån en kopia som aldrig behöver vänta på fakta?"]),
              pb(["Nothing on record", "Inget på pränt"], ["{{person.legal.name}} warns that if you never say publicly that the page is not yours, it will be harder later to show that you acted to protect your name and your readers. Do you stay silent at the cost of your own legal position?", "{{person.legal.name}} varnar för att om ni aldrig offentligt säger att sidan inte är er, blir det svårare att senare visa att ni agerade för att skydda ert namn och era läsare. Tiger ni, på bekostnad av er egen rättsliga ställning?"])
            ],
            C: [
              pb(["The authority won't name you", "Myndigheten nämner inte er"], ["The election authority agrees to a statement, but only about official results; it will not comment on a newspaper's website. Its statement says nothing about the fake page carrying your name. Do you stay out of it now that nobody else is going to say it?", "Valmyndigheten går med på ett uttalande, men bara om de officiella resultaten; den kommenterar inte en tidnings webbplats. Uttalandet säger ingenting om den falska sidan i ert namn. Håller ni er utanför nu när ingen annan tänker säga det?"]),
              pb(["Hiding behind the state", "Gömmer sig bakom staten"], ["A media critic posts: “The paper whose name is on the fake has asked the authorities to speak for it.” Your own staff ask why the newsroom will not report on its own impersonation. Can you defend staying out to your own journalists?", "En mediekritiker skriver: ”Tidningen vars namn står på förfalskningen har bett myndigheterna att tala för den.” Er egen personal frågar varför redaktionen inte rapporterar om att någon utger sig för att vara den. Kan ni försvara inför era egna journalister att ni håller er utanför?"]),
              pb(["It will take hours", "Det tar timmar"], ["The authority's press office says a statement needs approval and will come “within a few hours”. Meanwhile the fake keeps gaining shares under your logo. Do you wait for an official voice, or speak yourselves after all?", "Myndighetens pressavdelning säger att ett uttalande måste godkännas och kommer ”inom några timmar”. Under tiden fortsätter förfalskningen att delas under er logotyp. Väntar ni på en officiell röst, eller talar ni själva ändå?"])
            ]
          }
        }),
        facilitator: fac(
          ["This is the moment a ransomware incident becomes an information operation. The MP's share makes it political.", "Det är i det här ögonblicket som en incident med utpressningsprogram blir en informationsoperation. Riksdagsledamotens delning gör den politisk."],
          ["Get real results out loudly, have the fake taken down, and correct without amplifying.", "Få ut de riktiga resultaten tydligt, få förfalskningen nedtagen och rätta utan att förstärka."],
          [["Ask: what would a reader need to see to know which page is real?", "Fråga: vad skulle en läsare behöva se för att veta vilken sida som är äkta?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 180,
        title: L(["Our own wrong numbers", "Våra egna felaktiga siffror"]),
        twist: L(["It was not only the fake. Two minutes before the polls closed, the attackers changed your own results table. For {{num.minutesWrong}} minutes your real site showed wrong figures for one constituency, and screenshots of it are now being used as proof of election fraud.", "Det var inte bara förfalskningen. Två minuter innan vallokalerna stängde ändrade angriparna er egen resultattabell. Under {{num.minutesWrong}} minuter visade er riktiga sajt felaktiga siffror för en valkrets, och skärmbilder av den används nu som bevis för valfusk."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because you named the fake site publicly, it is now trending; many people sharing it say they are only “checking”.", sv: "Eftersom ni pekade ut den falska sajten offentligt trendar den nu; många som delar den säger att de bara ”kontrollerar”." } }
        ],
        assumptionChallenged: L(["Everything on our real site was correct.", "Allt på vår riktiga sajt var korrekt."]),
        reveals: ["hf-table"],
        narrative: L([
          "{{time.T+180|clock}}. A data journalist compares the cached front page with the official figures and goes quiet. The 19:58 update to the results table did not come from the election authority's feed. It came from a database session using the contractor's account.\n\nA losing candidate has already posted the screenshot: your logo, your page, the wrong numbers. “Even the newspaper showed it before they fixed it,” the post says.",
          "Klockan {{time.T+180|clock}}. En datajournalist jämför den cachade förstasidan med de officiella siffrorna och blir tyst. Uppdateringen av resultattabellen klockan 19.58 kom inte från valmyndighetens flöde. Den kom från en databassession som använde entreprenörens konto.\n\nEn förlorande kandidat har redan lagt ut skärmbilden: er logotyp, er sida, de felaktiga siffrorna. ”Till och med tidningen visade det innan de rättade det”, står det i inlägget."
        ]),
        injects: [
          inj("i4-1", 180, "logExcerpt", "person.itOps", "critical", "confirmed", [
            "results_db audit: 19:58:04 UPDATE constituency_results by session print-support (not the election feed service). Values changed for 1 constituency. Live page served the changed values until the cache froze at 20:12.",
            "Granskningslogg results_db: 19.58.04 UPDATE constituency_results av sessionen print-support (inte valmyndighetens flödestjänst). Värden ändrade för 1 valkrets. Direktsidan visade de ändrade värdena tills cachen frös klockan 20.12."
          ], { reveals: ["hf-table"], tests: ["lo3"] }),
          inj("i4-2", 190, "socialPost", "socialMedia", "high", "disputed", [
            "Candidate: “Even the newspaper showed it before they ‘fixed’ it. What else is being fixed tonight?” (screenshot of your site at 20:05)",
            "Kandidat: ”Till och med tidningen visade det innan de ’rättade’ det. Vad mer rättas i natt?” (skärmbild av er sajt klockan 20.05)"
          ], { facilitatorNote: ["The screenshot is genuine; the interpretation is false. A correction will be quoted either way.", "Skärmbilden är äkta; tolkningen är falsk. En rättelse kommer att citeras oavsett."], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Can you prove which figures were changed, when and by whom?", "Kan ni bevisa vilka siffror som ändrades, när och av vem?", ["itOps", "ciso"]),
            q("What else in the database could they have changed that nobody has noticed?", "Vad mer i databasen kan de ha ändrat som ingen har märkt?", ["ciso"]),
            q("Did naming the fake help or hurt, now that your own page is in the story?", "Hjälpte eller stjälpte det att peka ut förfalskningen, nu när er egen sida är en del av historien?", ["comms"], "d3")
          ],
          executive: [
            q("How do you correct your own error without feeding the fraud story?", "Hur rättar ni ert eget fel utan att mata berättelsen om valfusk?", ["ceo", "comms"]),
            q("Who must hear this before the public does?", "Vem måste få höra det här innan allmänheten gör det?", ["legal"]),
            q("Would you answer the fake the same way again?", "Skulle ni bemöta förfalskningen på samma sätt igen?", ["ceo"], "d3")
          ]
        },
        challenges: [ch("The editor-in-chief worries that any correction tonight will be read as “the paper admits the results were changed”.", "Chefredaktören oroar sig för att varje rättelse i natt kommer att läsas som ”tidningen medger att resultaten ändrades”.")],
        decision: dec("d4", "ceo", ["How do you correct your own page?", "Hur rättar ni er egen sida?"], [
          ["Publish a correction now: what was wrong, for how long, that it was an attack on your systems, not on the election.", "Publicera en rättelse nu: vad som var fel, hur länge, att det var ett angrepp på era system, inte på valet."],
          ["Fix the figures quietly tonight, and explain fully in tomorrow's edition.", "Rätta siffrorna i tysthet i natt, och förklara fullständigt i morgondagens upplaga."],
          ["Say nothing until every figure on the site has been checked against the official results.", "Säg ingenting förrän varje siffra på sajten har kontrollerats mot de officiella resultaten."]
        ], {
          knowns: [["Your real site showed altered figures for one constituency for {{num.minutesWrong}} minutes.", "Er riktiga sajt visade ändrade siffror för en valkrets i {{num.minutesWrong}} minuter."]],
          uncertainties: [["Whether anything else was altered.", "Om något annat ändrades."]],
          tradeoffs: {
            operational: ["Checking every figure takes hours; the story moves in minutes.", "Att kontrollera varje siffra tar timmar; historien rör sig på minuter."],
            security: ["You do not yet know the full extent of the tampering.", "Ni vet ännu inte hela omfattningen av manipulationen."],
            legal: ["A newspaper must correct significant errors promptly.", "En tidning måste rätta betydande fel skyndsamt."],
            reputational: ["A correction will be quoted; so will silence.", "En rättelse kommer att citeras; det kommer tystnad också."]
          },
          evaluation: [["Corrects its own error promptly and clearly, separating the attack on the paper from the election", "Rättar sitt eget fel skyndsamt och tydligt, och skiljer angreppet på tidningen från valet"]],
          pushback: {
            A: [
              pb(["How sure is “one constituency”?", "Hur säkert är ”en valkrets”?"], ["Your correction states that one constituency was affected. {{person.ciso.name}} says only the table you know about has been checked. If something more turns up tomorrow, your correction becomes the next thing you must correct. Do you publish a precise claim you cannot yet fully back?", "Er rättelse säger att en valkrets påverkades. {{person.ciso.name}} säger att bara den tabell ni känner till har kontrollerats. Om något mer dyker upp i morgon blir rättelsen nästa sak ni måste rätta. Publicerar ni ett exakt påstående som ni ännu inte helt kan belägga?"]),
              pb(["A fight over one sentence", "Strid om en mening"], ["Your political editor wants the correction to say nothing about an attack until it is confirmed, fearing the word will take over the night. {{person.legal.name}} wants the opposite: say exactly why the figures were wrong. Who writes the final sentence, and on whose authority?", "Er politiska redaktör vill att rättelsen inte säger något om ett angrepp förrän det är bekräftat, av rädsla för att ordet tar över natten. {{person.legal.name}} vill det motsatta: säg exakt varför siffrorna var fel. Vem skriver den sista meningen, och med vems mandat?"]),
              pb(["Others already quoted you", "Andra har redan citerat er"], ["Correcting properly also means contacting every outlet that quoted your figures before the cache froze, on a night when everyone is busy. Many have already moved on. Who calls them, and what do you do about those who never update?", "Att rätta ordentligt innebär också att kontakta varje medium som citerade era siffror innan cachen frös, en natt då alla har fullt upp. Många har redan gått vidare. Vem ringer dem, och vad gör ni med dem som aldrig uppdaterar?"])
            ],
            B: [
              pb(["Someone saw the change", "Någon såg ändringen"], ["A reader with before-and-after screenshots asks publicly why the numbers on your page changed without a note. The candidate shares it: “Now they're fixing it quietly.” How do you explain a silent fix on the night you are accused of fixing results?", "En läsare med skärmbilder före och efter frågar offentligt varför siffrorna på er sida ändrades utan en notis. Kandidaten delar det: ”Nu rättar de i tysthet.” Hur förklarar ni en tyst rättelse samma natt som ni anklagas för att fiffla med resultat?"]),
              pb(["Your own correction policy", "Er egen rättelsepolicy"], ["The editor responsible for standards says a silent change to published election figures breaks the paper's own correction policy, and refuses to sign it off. Other editors are listening. Do you overrule your own rules tonight, and say so openly to the newsroom?", "Redaktören som ansvarar för de publicistiska riktlinjerna säger att en tyst ändring av publicerade valsiffror bryter mot tidningens egen rättelsepolicy, och vägrar godkänna den. Andra redaktörer lyssnar. Kör ni över era egna regler i natt, och säger ni det öppet till redaktionen?"]),
              pb(["Morning is a long way off", "Morgonen är långt borta"], ["The full explanation is planned for tomorrow's paper. Until then, the candidate's screenshot is the only version of the story, and it is being shared all night while you say nothing. Can you leave it unanswered until morning?", "Den fullständiga förklaringen ska stå i morgondagens tidning. Fram till dess är kandidatens skärmbild den enda versionen av historien, och den delas hela natten medan ni tiger. Kan ni låta den stå obesvarad till i morgon?"])
            ],
            C: [
              pb(["Hours, not minutes", "Timmar, inte minuter"], ["Checking every figure means going through every constituency and every update since the polls closed. The data desk estimates four to six hours. Do you stay silent for half the night about an error you already know about?", "Att kontrollera varje siffra innebär att gå igenom varje valkrets och varje uppdatering sedan vallokalerna stängde. Datadesken räknar med fyra till sex timmar. Tiger ni halva natten om ett fel ni redan känner till?"]),
              pb(["Silence becomes the story", "Tystnaden blir nyheten"], ["The candidate now asks: “Why won't the paper say whether its numbers were right?” Reporters from other outlets are calling your duty editor directly. Can you say “no comment” about your own front page all night?", "Kandidaten frågar nu: ”Varför vill tidningen inte säga om dess siffror var rätt?” Reportrar från andra medier ringer direkt till er nyhetschef. Kan ni säga ”ingen kommentar” om er egen förstasida hela natten?"]),
              pb(["A moving target", "Ett rörligt mål"], ["The official count keeps changing through the night, so every figure you check is out of date an hour later. The check may never be complete. When, exactly, does your silence end?", "Den officiella sammanräkningen ändras hela natten, så varje siffra ni kontrollerar är inaktuell en timme senare. Kontrollen kanske aldrig blir klar. När, exakt, tar er tystnad slut?"])
            ]
          }
        }),
        facilitator: fac(
          ["The room's own mistake is now someone's weapon. The test is whether journalistic duty beats fear of being quoted.", "Rummets eget misstag är nu någons vapen. Provet är om den journalistiska plikten vinner över rädslan att bli citerad."],
          ["Correct promptly and precisely, and make clear that the attack was on the newspaper, not on the vote.", "Rätta skyndsamt och exakt, och gör tydligt att angreppet riktades mot tidningen, inte mot röstningen."],
          [["Ask: what would you demand of another newspaper that did this?", "Fråga: vad skulle ni kräva av en annan tidning som gjorde så här?"]]
        )
      },
      {
        id: "p5",
        clock: 300,
        title: L(["Please don't say attack", "Säg inte angrepp"]),
        twist: L(["The election authority and the security service call together. They ask you not to describe tonight as an attack until they have assessed it, because the word alone could damage trust in the election. Your own political reporters want to write the story tonight.", "Valmyndigheten och säkerhetstjänsten ringer tillsammans. De ber er att inte beskriva natten som ett angrepp förrän de har bedömt det, eftersom ordet i sig kan skada förtroendet för valet. Era egna politiska reportrar vill skriva artikeln i natt."]),
        twistKind: "authority",
        reconsider: { decision: "d4", pressure: { en: "The authorities now ask you to choose your words carefully. Whatever you said, or did not say, about your wrong numbers is the starting point for everything you say next.", sv: "Myndigheterna ber er nu att välja era ord med omsorg. Det ni sa, eller inte sa, om era felaktiga siffror är utgångspunkten för allt ni säger härnäst." } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because you corrected publicly at once, the candidate now quotes your own correction as proof that “the media manipulated results”.", sv: "Eftersom ni rättade offentligt direkt citerar kandidaten nu er egen rättelse som bevis för att ”medierna manipulerade resultaten”." } }
        ],
        assumptionChallenged: L(["Our only duty is to publish.", "Vår enda plikt är att publicera."]),
        narrative: L([
          "{{time.T+300|clock}}. The call is courteous and firm. The authority has no evidence that votes or official counts were affected, and it wants to keep it that way in the public mind. It asks for twelve hours.\n\nIn the newsroom, the political desk is unanimous: a newspaper attacked on election night is news, and the public has a right to know tonight. Two competitors are already asking why your site went down.",
          "Klockan {{time.T+300|clock}}. Samtalet är artigt och bestämt. Myndigheten har inga belägg för att röster eller officiella sammanräkningar påverkats, och vill att allmänheten ska förstå det. Den ber om tolv timmar.\n\nPå redaktionen är politikredaktionen enig: en tidning som angrips på valnatten är en nyhet, och allmänheten har rätt att få veta det i natt. Två konkurrenter frågar redan varför er sajt gick ner."
        ]),
        injects: [
          inj("i5-1", 300, "phoneTranscript", "regulator", "high", "confirmed", [
            "Election authority: “Nothing suggests the count is affected. If a major newspaper writes ‘attack’ tonight, many voters will hear ‘the election was hacked’. Twelve hours, please, while we assess.”",
            "Valmyndigheten: ”Ingenting tyder på att sammanräkningen påverkats. Om en stor tidning skriver ’angrepp’ i natt kommer många väljare att höra ’valet hackades’. Tolv timmar, snälla, medan vi gör en bedömning.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What can you state as fact tonight, with evidence?", "Vad kan ni slå fast som fakta i natt, med belägg?", ["ciso"]),
            q("Is there any sign that the official count was touched?", "Finns det några tecken på att den officiella sammanräkningen påverkats?", ["ciso"]),
            q("Did your correction make the authorities' request harder to meet?", "Gjorde er rättelse myndigheternas begäran svårare att uppfylla?", ["comms"], "d4")
          ],
          executive: [
            q("Does a newspaper ever hold a true story at the authorities' request?", "Håller en tidning någonsin inne med en sann nyhet på myndigheters begäran?", ["ceo", "legal"]),
            q("What will readers think if they learn tomorrow that you knew tonight?", "Vad kommer läsarna att tro om de i morgon får veta att ni visste redan i natt?", ["ceo"]),
            q("Would you correct your page the same way again?", "Skulle ni rätta er sida på samma sätt igen?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("A competitor publishes a speculative piece: “Newspaper silent as site goes dark on election night”.", "En konkurrent publicerar en spekulativ artikel: ”Tidning tyst när sajten släcks på valnatten”.")],
        decision: dec("d5", "ceo", ["What do you report tonight?", "Vad rapporterar ni i natt?"], [
          ["Report it now as news, factually: your systems were attacked, there is no sign the count was affected, and the authority is assessing.", "Rapportera det nu som nyhet, sakligt: era system angreps, inget tyder på att sammanräkningen påverkats, och myndigheten gör en bedömning."],
          ["Hold the story until the authority's assessment in the morning.", "Vänta med artikeln tills myndighetens bedömning i morgon bitti."],
          ["Say tonight that you have technical problems, and publish the full story in the morning.", "Säg i natt att ni har tekniska problem, och publicera hela artikeln i morgon."]
        ], {
          knowns: [["There is no sign the official count was affected; your systems were attacked.", "Inget tyder på att den officiella sammanräkningen påverkats; era system angreps."]],
          uncertainties: [["How the public will hear the word “attack” tonight.", "Hur allmänheten kommer att uppfatta ordet ”angrepp” i natt."]],
          tradeoffs: {
            operational: ["Writing it tonight takes reporters off the results.", "Att skriva det i natt tar reportrar från resultaten."],
            security: ["The authorities may know things you do not.", "Myndigheterna kan veta saker som ni inte vet."],
            legal: ["No authority can order a newspaper not to publish.", "Ingen myndighet kan beordra en tidning att inte publicera."],
            reputational: ["“Technical problems” that turn out to be an attack will not be forgiven.", "”Tekniska problem” som visar sig vara ett angrepp förlåts inte."]
          },
          evaluation: [["Tells the truth tonight in words that do not overstate it", "Berättar sanningen i natt med ord som inte överdriver den"]],
          pushback: {
            A: [
              pb(["The authority calls back", "Myndigheten ringer tillbaka"], ["The election authority says it asked for twelve hours and got none. It will now have to make its own statement tonight, before its assessment is done. Do you accept being the reason the authority speaks before it is ready?", "Valmyndigheten säger att den bad om tolv timmar och inte fick någon. Den måste nu gå ut med ett eget uttalande i natt, innan bedömningen är klar. Accepterar ni att vara orsaken till att myndigheten uttalar sig innan den är redo?"]),
              pb(["Headlines strip the nuance", "Rubrikerna skalar bort nyanserna"], ["Within half an hour, aggregators run your story as “Newspaper hacked on election night”. The sentence about the count being unaffected is gone. Is careful wording enough when you do not control the headline?", "Inom en halvtimme kör nyhetsaggregatorer er artikel som ”Tidning hackad på valnatten”. Meningen om att sammanräkningen inte påverkats är borta. Räcker det med omsorgsfulla formuleringar när ni inte styr rubriken?"]),
              pb(["Reporters off the count", "Reportrar bort från räkningen"], ["Writing the attack story tonight takes your best political reporters off the results while the closest constituencies are still being counted. The results desk is down to two people. Which story matters more tonight, and who decides?", "Att skriva om angreppet i natt tar era bästa politiska reportrar från resultaten medan de jämnaste valkretsarna fortfarande räknas. Resultatdesken är nere på två personer. Vilken nyhet är viktigast i natt, och vem bestämmer?"])
            ],
            B: [
              pb(["The newsroom revolts", "Redaktionen gör uppror"], ["The political desk writes to the editor-in-chief that holding a true story at the authorities' request breaks the paper's independence, and several reporters say they will post it themselves. Do you hold the line against your own journalists?", "Politikredaktionen skriver till chefredaktören att det bryter mot tidningens oberoende att hålla inne en sann nyhet på myndigheters begäran, och flera reportrar säger att de lägger ut den själva. Håller ni linjen mot era egna journalister?"]),
              pb(["A competitor gets there first", "En konkurrent hinner först"], ["A rival outlet calls for comment: its source says your paper was hit by ransomware tonight. It publishes in thirty minutes, with or without you. Do you still wait for the morning, and let someone else tell your story?", "Ett konkurrerande medium ringer för en kommentar: dess källa säger att er tidning drabbades av utpressningsprogram i natt. De publicerar om trettio minuter, med eller utan er. Väntar ni ändå till i morgon, och låter någon annan berätta er historia?"]),
              pb(["The attackers' own deadline", "Angriparnas egen tidsgräns"], ["The ransom note promised to publish your drafts tomorrow. If that happens before you have told readers about the attack, they will hear about it first from the attackers. Do you want the attackers to be the first to announce what happened to you?", "Utpressningsbrevet lovade att publicera era utkast i morgon. Om det sker innan ni har berättat om angreppet får läsarna höra det först från angriparna. Vill ni att angriparna ska vara först med att berätta vad som har hänt er?"])
            ],
            C: [
              pb(["Your own staff know", "Er egen personal vet"], ["Dozens of people in the newsroom saw the ransom note, and one has already told a friend at another paper. Is “technical problems” a line you can hold for even one night, when your own staff know it is not true?", "Dussintals personer på redaktionen såg utpressningsbrevet, och en av dem har redan berättat för en vän på en annan tidning. Är ”tekniska problem” något ni kan hålla fast vid ens en natt, när er egen personal vet att det inte är sant?"]),
              pb(["A half-truth in print", "En halvsanning i tryck"], ["The editor responsible for standards points out that the paper would be publishing something it knows to be misleading, about itself, on election night. Readers will judge every result you print by that. Can a newspaper defend a half-truth about its own systems?", "Redaktören som ansvarar för de publicistiska riktlinjerna påpekar att tidningen skulle publicera något den vet är vilseledande, om sig själv, på valnatten. Läsarna kommer att bedöma varje resultat ni publicerar utifrån det. Kan en tidning försvara en halvsanning om sina egna system?"]),
              pb(["Not what they asked for", "Inte vad myndigheten bad om"], ["The election authority asked you not to say “attack”; it did not ask you to say something else. Its press officer warns it will not stand behind “technical problems” if that turns out to be cover. Who carries the blame when the euphemism unravels?", "Valmyndigheten bad er att inte säga ”angrepp”; den bad er inte att säga något annat. Dess presschef varnar för att myndigheten inte ställer sig bakom ”tekniska problem” om det visar sig vara en täckmantel. Vem bär skulden när omskrivningen faller?"])
            ]
          }
        }),
        facilitator: fac(
          ["Editorial independence and responsibility collide. The competitor's piece removes the option of silence.", "Redaktionellt oberoende och ansvar krockar. Konkurrentens artikel tar bort möjligheten att tiga."],
          ["Report the facts carefully: the paper was attacked; there is no sign the count was.", "Rapportera fakta med omsorg: tidningen angreps; inget tyder på att sammanräkningen gjorde det."],
          [["Ask: which sentence would you be proud of in a year?", "Fråga: vilken mening skulle ni vara stolta över om ett år?"]]
        )
      },
      {
        id: "p6",
        clock: 720,
        title: L(["The morning after", "Morgonen efter"]),
        twist: L(["At 08:00 the attackers publish what they took: hundreds of editorial drafts, including an unverified story about a candidate that your editors had decided not to run. It is everywhere by nine.", "Klockan 08 publicerar angriparna det de tog: hundratals redaktionella utkast, däribland en overifierad artikel om en kandidat som era redaktörer hade beslutat att inte publicera. Klockan nio finns den överallt."]),
        twistKind: "impact",
        reconsider: { decision: "d5", pressure: { en: "Your drafts are public and the candidate is furious. What you reported, or held back, last night now shapes how anyone reads what you say this morning. Would you make the same call?", sv: "Era utkast är offentliga och kandidaten är rasande. Det ni rapporterade, eller höll inne, i natt avgör nu hur folk läser det ni säger i morse. Skulle ni fatta samma beslut?" } },
        branches: [
          { when: { decision: "d5", option: "C" }, narrativeAppend: { en: "Because you said “technical problems” last night, three outlets lead with the gap between that and what you knew.", sv: "Eftersom ni sa ”tekniska problem” i natt inleder tre medier med glappet mellan det och det ni visste." } }
        ],
        assumptionChallenged: L(["Unpublished means safe.", "Opublicerat betyder säkert."]),
        reveals: ["hf-drafts"],
        narrative: L([
          "{{time.T+720|weekday|cap}}, {{time.T+720|clock}}. The print edition reached some readers late, others not at all. The site runs on the emergency tool. Then the leak site goes live: the drafts folder, complete, with editors' notes in the margins.\n\nOne file is a story about a candidate's business dealings, marked “not verified, do not run”. It is being shared as “what the newspaper didn't want you to know”. The candidate's lawyer has already called.",
          "{{time.T+720|weekday|cap}}, klockan {{time.T+720|clock}}. Papperstidningen nådde en del läsare sent, andra inte alls. Sajten körs på nödverktyget. Sedan går läcksajten live: mappen med utkast, komplett, med redaktörernas anteckningar i marginalen.\n\nEn av filerna är en artikel om en kandidats affärer, märkt ”ej verifierad, publicera inte”. Den delas som ”det tidningen inte ville att du skulle veta”. Kandidatens advokat har redan ringt."
        ]),
        injects: [
          inj("i6-1", 720, "newsHeadline", "media", "high", "confirmed", [
            "“Hacked drafts reveal unpublished claims about candidate.” Rival outlets report on the leaked file; the newspaper's editors had marked it as unverified.",
            "”Hackade utkast avslöjar opublicerade påståenden om kandidat.” Konkurrerande medier rapporterar om den läckta filen; tidningens redaktörer hade märkt den som overifierad."
          ], { reveals: ["hf-drafts"], tests: ["lo3"] }),
          inj("i6-2", 740, "email", "person.legal", "high", "confirmed", [
            "“The candidate's lawyer holds us responsible for the leak of an unverified, damaging draft. They also ask whether our sources for that draft are now exposed. I think some may be.”",
            "”Kandidatens advokat håller oss ansvariga för läckan av ett overifierat och skadligt utkast. De frågar också om våra källor till utkastet nu är röjda. Jag tror att några kan vara det.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What should never have been on the production network in the first place?", "Vad borde aldrig ha legat på produktionsnätet från början?", ["ciso"]),
            q("Which sources are named in the leaked drafts, and who warns them?", "Vilka källor nämns i de läckta utkasten, och vem varnar dem?", ["legal", "securityOfficer"]),
            q("Did your reporting last night hold up this morning?", "Höll er rapportering i natt i morse?", ["comms"], "d5")
          ],
          executive: [
            q("What do you owe the candidate whose unverified story was leaked?", "Vad är ni skyldiga kandidaten vars overifierade artikel läckte?", ["ceo", "legal"]),
            q("Do you report on your own leaked drafts?", "Rapporterar ni om era egna läckta utkast?", ["ceo"]),
            q("Would you report or hold back the same way next election night?", "Skulle ni rapportera eller hålla inne på samma sätt nästa valnatt?", ["ceo"], "d5")
          ]
        },
        challenges: [ch("Your own political desk argues that the unverified draft is now public anyway, so you should finish verifying and publish it.", "Er egen politikredaktion menar att det overifierade utkastet ändå är offentligt nu, så ni borde slutföra verifieringen och publicera det.")],
        decision: dec("d6", "ceo", ["What do you change before the next election?", "Vad ändrar ni före nästa val?"], [
          ["Separate election-night systems, a rehearsed emergency publishing path, supplier access with MFA and time limits, and drafts kept off the production network.", "Separata system för valnatten, en inövad väg för nödpublicering, leverantörsåtkomst med MFA och tidsgränser, och utkast borta från produktionsnätet."],
          ["Better backups and a faster restore for the publishing system.", "Bättre säkerhetskopior och snabbare återställning av publiceringssystemet."],
          ["A new print contractor with stricter terms.", "En ny tryckentreprenör med strängare villkor."]
        ], {
          knowns: [["The way in, the tampering and the leak all came through one supplier account and one flat network.", "Vägen in, manipulationen och läckan kom alla via ett leverantörskonto och ett platt nät."]],
          uncertainties: [["How much separation the newsroom will accept in everyday work.", "Hur mycket separation redaktionen accepterar i det dagliga arbetet."]],
          tradeoffs: {
            operational: ["Separate systems add work on every ordinary night.", "Separata system ger extra arbete varje vanlig natt."],
            security: ["A faster restore does not stop the next tampering.", "En snabbare återställning stoppar inte nästa manipulation."],
            legal: ["Source material on a shared network is a source-protection risk.", "Källmaterial på ett delat nät är en risk för källskyddet."],
            reputational: ["The next election night will be watched for a repeat.", "Nästa valnatt kommer att bevakas för en upprepning."]
          },
          evaluation: [["Fixes the supplier door, the flat network and the drafts, not only the restore", "Åtgärdar leverantörsdörren, det platta nätet och utkasten, inte bara återställningen"]],
          pushback: {
            A: [
              pb(["Every night gets harder", "Varje natt blir tyngre"], ["The newsroom leadership says separate systems and drafts kept off the production network will add work to every ordinary night, not just election nights. Reporters ask where they are supposed to write, if not in the shared folders. Will the separation survive the first busy news week?", "Redaktionsledningen säger att separata system och utkast utanför produktionsnätet ger extra arbete varje vanlig natt, inte bara valnätter. Reportrarna frågar var de ska skriva, om inte i de delade mapparna. Överlever separationen den första hektiska nyhetsveckan?"]),
              pb(["The contractor pushes back", "Entreprenören protesterar"], ["The print contractor says MFA and time-limited access will slow every late fix on press nights, and asks who pays for the extra hours. The contract is up for renewal next year. Do you insist, even if it costs the relationship?", "Tryckentreprenören säger att MFA och tidsbegränsad åtkomst bromsar varje sen ändring på trycknätter, och frågar vem som betalar för de extra timmarna. Avtalet ska förnyas nästa år. Står ni på er, även om det kostar relationen?"]),
              pb(["Who owns the drill?", "Vem äger övningen?"], ["A rehearsed emergency path means a full drill before the next election, with the whole newsroom, against a real deadline. This time the emergency tool existed but had never been tried. Who owns the drill, by name, and what happens when it is postponed?", "En inövad väg för nödpublicering kräver en fullskalig övning före nästa val, med hela redaktionen, mot en verklig deadline. Den här gången fanns nödverktyget men hade aldrig prövats. Vem äger övningen, med namn, och vad händer när den skjuts upp?"])
            ],
            B: [
              pb(["Restore was not the problem", "Återställningen var inte problemet"], ["{{person.ciso.name}} points out that a faster restore would not have stopped the wrong numbers, the contractor's access or the stolen drafts. All three happened before anything was encrypted. Are you fixing the problem you had, or the one that is easiest to buy?", "{{person.ciso.name}} påpekar att en snabbare återställning inte hade stoppat de felaktiga siffrorna, entreprenörens åtkomst eller de stulna utkasten. Allt det hände innan något krypterades. Åtgärdar ni problemet ni hade, eller det som är enklast att köpa?"]),
              pb(["What about the sources?", "Och källorna då?"], ["{{person.legal.name}} asks what you will tell sources who may have been exposed in the leaked drafts. Your plan says better backups. Can you look a source in the eye and say that backups will protect them next time?", "{{person.legal.name}} frågar vad ni ska säga till källor som kan ha röjts i de läckta utkasten. Er plan säger bättre säkerhetskopior. Kan ni se en källa i ögonen och säga att säkerhetskopior skyddar dem nästa gång?"]),
              pb(["Promised, never tested", "Utlovat, aldrig testat"], ["On election night IT promised a restore in thirty minutes, and nobody had ever tried it under pressure. The new plan promises something faster. Who tests it, on a quiet night or a busy one, and how will you know it works before the next election?", "På valnatten lovade IT en återställning på trettio minuter, och ingen hade någonsin provat det under press. Den nya planen lovar något snabbare. Vem testar den, en vanlig natt eller en pressad, och hur vet ni att den fungerar före nästa val?"])
            ],
            C: [
              pb(["The exception was yours", "Undantaget var ert"], ["The exception that let the contractor's account skip MFA was granted by your own organisation three years ago. A new contractor gets the same network and the same exception process. What stops you granting the next one the same exception?", "Undantaget som lät entreprenörens konto slippa MFA beviljades av er egen organisation för tre år sedan. En ny entreprenör får samma nät och samma undantagsprocess. Vad hindrar er från att ge nästa entreprenör samma undantag?"]),
              pb(["Nobody else can print", "Ingen annan kan trycka"], ["Your supplier manager finds only one other plant in the region with capacity for your edition, and it cannot start for eight months. Until then you depend on the contractor you plan to drop. What do you change in the meantime?", "Den som ansvarar för era leverantörer hittar bara ett annat tryckeri i regionen med kapacitet för er upplaga, och det kan inte börja förrän om åtta månader. Fram till dess är ni beroende av den entreprenör ni tänker säga upp. Vad ändrar ni under tiden?"]),
              pb(["The drafts were on your network", "Utkasten låg i ert nät"], ["The stolen drafts and the altered results table sat on your own flat network, open to anything that got in. Your newsroom asks why the answer to its worst morning is a new printer. Does changing contractor fix what your journalists and sources actually lost?", "De stulna utkasten och den manipulerade resultattabellen låg i ert eget platta nät, öppna för allt som tog sig in. Redaktionen frågar varför svaret på dess värsta morgon är ett nytt tryckeri. Åtgärdar ett byte av entreprenör det som era journalister och källor faktiskt förlorade?"])
            ]
          }
        }),
        facilitator: fac(
          ["The last blow lands on the newsroom's own judgement: a story it chose not to run is now everywhere.", "Det sista slaget träffar redaktionens eget omdöme: en artikel som den valde att inte publicera finns nu överallt."],
          ["Close the supplier door, separate the networks, protect drafts and sources, and rehearse the night.", "Stäng leverantörsdörren, separera näten, skydda utkast och källor, och öva natten."],
          [["Ask: which of tonight's decisions would you want to have rehearsed?", "Fråga: vilka av nattens beslut hade ni velat ha övat på?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The results reached readers and the tampering was corrected, but the morning edition was late, an unverified draft is public, and some readers will remember the wrong numbers longer than the correction.",
        "Resultaten nådde läsarna och manipulationen rättades, men morgonupplagan kom sent, ett overifierat utkast är offentligt, och en del läsare kommer att minnas de felaktiga siffrorna längre än rättelsen."
      ])
    },

    debrief: {
      keyLessons: [
        L(["A rehearsed emergency publishing path is worth more than a fast restore into a compromised network.", "En inövad väg för nödpublicering är värd mer än en snabb återställning in i ett komprometterat nät."]),
        L(["A supplier's permanent access is your attack surface.", "En leverantörs permanenta åtkomst är er attackyta."]),
        L(["Correct your own errors promptly, even when someone will use the correction.", "Rätta era egna fel skyndsamt, även när någon kommer att använda rättelsen."]),
        L(["Authorities can ask; editors decide, and must choose their words with care.", "Myndigheter kan be; redaktörer beslutar, och måste välja sina ord med omsorg."])
      ],
      assumptionsVsReality: [
        avr(["They came in through our newsroom.", "De kom in via vår redaktion."], ["They came in through the print contractor's account.", "De kom in via tryckentreprenörens konto."], "p2"),
        avr(["Everything on our real site was correct.", "Allt på vår riktiga sajt var korrekt."], ["The attackers altered your results table first.", "Angriparna ändrade först er resultattabell."], "p4"),
        avr(["Unpublished means safe.", "Opublicerat betyder säkert."], ["Unverified drafts became the morning's story.", "Overifierade utkast blev morgonens nyhet."], "p6")
      ],
      strengthsToLookFor: [
        L(["Deciding how to publish before the first results", "Att besluta hur ni ska publicera innan de första resultaten"]),
        L(["Closing the contractor's door and still finding a way to print", "Att stänga entreprenörens dörr och ändå hitta ett sätt att trycka"]),
        L(["Correcting the wrong numbers clearly and fast", "Att rätta de felaktiga siffrorna tydligt och snabbt"])
      ],
      commonGaps: [
        L(["Restoring into the network before knowing the way in", "Att återställa in i nätet innan vägen in är känd"]),
        L(["Leaving the supplier link open for the print run", "Att lämna leverantörsförbindelsen öppen för tryckningen"]),
        L(["Calling an attack “technical problems”", "Att kalla ett angrepp för ”tekniska problem”"])
      ],
      suggestedActions: [
        act(["Rehearse an emergency publishing path for election nights and other big events.", "Öva en väg för nödpublicering inför valnätter och andra stora händelser."], "serviceOwner", "high"),
        act(["Remove permanent supplier access; require MFA, time limits and approval.", "Ta bort permanent leverantörsåtkomst; kräv MFA, tidsgränser och godkännande."], "ciso", "high"),
        act(["Keep editorial drafts and source material off the production network.", "Håll redaktionella utkast och källmaterial borta från produktionsnätet."], "securityOfficer", "high"),
        act(["Agree in advance how to report an attack on the newspaper during an election.", "Kom överens i förväg om hur ett angrepp på tidningen ska rapporteras under ett val."], "ceo", "medium")
      ]
    }
  });
})();
