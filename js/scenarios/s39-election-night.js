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
  const { L, q, ch, inj, dec, fac, act, avr } = BK.scenarios.h;

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
          evaluation: [["Keeps readers informed tonight without restoring into a network the attackers still own", "Håller läsarna informerade i kväll utan att återställa in i ett nät som angriparna fortfarande äger"]]
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
          evaluation: [["Closes the attackers' door tonight and still finds a way to print", "Stänger angriparnas dörr i natt och hittar ändå ett sätt att trycka"]]
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
          evaluation: [["Protects the public from false results without making the fake the main story", "Skyddar allmänheten från falska resultat utan att göra förfalskningen till huvudnyheten"]]
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
          evaluation: [["Corrects its own error promptly and clearly, separating the attack on the paper from the election", "Rättar sitt eget fel skyndsamt och tydligt, och skiljer angreppet på tidningen från valet"]]
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
          evaluation: [["Tells the truth tonight in words that do not overstate it", "Berättar sanningen i natt med ord som inte överdriver den"]]
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
          evaluation: [["Fixes the supplier door, the flat network and the drafts, not only the restore", "Åtgärdar leverantörsdörren, det platta nätet och utkasten, inte bara återställningen"]]
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
