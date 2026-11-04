/*
 * s31-browser-extension.js — "Under New Ownership" (archetype B, browser extension).
 *
 * Sign-ins to the CRM from strange places, with MFA satisfied → a popular
 * PDF helper extension was sold last month and yesterday's update steals
 * session cookies from every site → browsers are not centrally managed, so
 * removing it is a person-by-person job → the stolen sessions reached the
 * bank portal and admin consoles, and an API token was planted → the store is
 * slow and the new owner unreachable → 140 extensions, 31 that read every site.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, pb } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s31-browser-extension",
    version: 1,
    category: "browser-extension",
    archetype: "ambiguous-start",
    emblem: "extension",
    title: L(["Under New Ownership", "Ny ägare"]),
    summary: L([
      "Someone is signing in as your staff without passwords or MFA prompts. Nothing was phished. The culprit is a small, helpful tool that half the company installed years ago, and that recently changed owners.",
      "Någon loggar in som er personal utan lösenord eller MFA-förfrågningar. Inget har nätfiskats. Den skyldige är ett litet, hjälpsamt verktyg som halva företaget installerade för flera år sedan, och som nyligen bytte ägare."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Recognise session theft that bypasses passwords and MFA", "Känna igen sessionsstöld som går förbi lösenord och MFA"]), teaser: L(["When the door was never locked", "När dörren aldrig var låst"]) },
      { id: "lo2", text: L(["Contain a threat on endpoints you do not centrally manage", "Stoppa ett hot på enheter ni inte styr centralt"]), teaser: L(["Reaching every desk", "Att nå varje skrivbord"]) },
      { id: "lo3", text: L(["Scope what stolen sessions reached and remove persistence", "Kartlägga vad stulna sessioner nådde och ta bort fotfästen"]), teaser: L(["Following the footprints", "Att följa fotspåren"]) },
      { id: "lo4", text: L(["Govern software that users install themselves", "Styra programvara som användare installerar själva"]), teaser: L(["Small tools, big permissions", "Små verktyg, stora behörigheter"]) }
    ],
    mitre: ["T1176", "T1539", "T1550.001", "T1185", "T1098", "T1213"],
    frameworks: {
      nistCsf: ["ID.AM", "PR.AA", "PR.PS", "DE.CM", "DE.AE", "RS.AN", "RS.MI"],
      iso27001: ["A.5.9", "A.5.23", "A.8.1", "A.8.5", "A.8.7", "A.8.16", "A.8.19"]
    },
    minStages: 3,
    maxStages: 6,
    constraints: { startWindow: "monday-morning" },
    actor: { types: ["criminal"], motivation: L(["Financial: bought an extension to harvest sessions at scale", "Ekonomisk: köpte ett tillägg för att samla in sessioner i stor skala"]), capability: "medium" },
    variables: {
      installs: { min: 40, max: 900, scaleBy: "size", step: 10 },
      accounts: { min: 6, max: 80, scaleBy: "size" },
      exported: { min: 2000, max: 120000, scaleBy: "size", step: 100 }
    },
    roles: ["incidentCommander", "ciso", "socLead", "itOps", "cio", "serviceOwner", "cfo", "dpo", "comms", "legal"],

    groundTruth: {
      rootCause: L([
        "“PDF Quick Tools”, a free browser extension installed by {{num.installs}} staff over several years, was sold to a new owner last month. Its update on Sunday added code that copied session cookies from every website the browser visited. Because browsers were not centrally managed, {{org.name}} could not see or remove it. The attacker replayed sessions for {{num.accounts}} accounts, including the CRM, a finance user's bank portal and two cloud admin consoles, created a long-lived API token in the CRM and exported about {{num.exported|number}} customer records.",
        "”PDF Quick Tools”, ett kostnadsfritt webbläsartillägg som {{num.installs}} anställda installerat under flera år, såldes till en ny ägare förra månaden. Uppdateringen i söndags lade till kod som kopierade sessionskakor från varje webbplats webbläsaren besökte. Eftersom webbläsarna inte styrdes centralt kunde {{org.name}} varken se eller ta bort det. Angriparen återanvände sessioner för {{num.accounts}} konton, bland annat CRM-systemet, en ekonomianvändares bankportal och två administrationskonsoler i molnet, skapade en långlivad API-token i CRM-systemet och exporterade omkring {{num.exported|number}} kundposter."
      ]),
      attackerTimeline: [
        { at: -43200, text: L(["Extension sold to a new owner.", "Tillägget säljs till en ny ägare."]) },
        { at: -1500, text: L(["Malicious update pushed through the extension store.", "Skadlig uppdatering skickas ut via tilläggsbutiken."]) },
        { at: -600, text: L(["First session cookies received.", "De första sessionskakorna tas emot."]) },
        { at: -120, text: L(["Sessions replayed against the CRM; API token created.", "Sessioner återanvänds mot CRM-systemet; API-token skapas."]) },
        { at: 60, text: L(["Customer export begins.", "Kundexporten börjar."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-sold", revealStage: "p2", text: L(["The PDF helper's developer account changed hands last month and Sunday's version added cookie collection.", "Utvecklarkontot för PDF-verktyget bytte ägare förra månaden och söndagens version lade till insamling av kakor."]) },
      { id: "hf-token", revealStage: "p4", text: L(["A non-expiring CRM API token was created with a replayed session, alongside access to banking and cloud admin.", "En API-token i CRM-systemet utan utgångsdatum skapades med en återanvänd session, tillsammans med åtkomst till bank och molnadministration."]) },
      { id: "hf-ext", revealStage: "p6", text: L(["Dozens of installed extensions can read and change every website, and none has been reviewed.", "Dussintals installerade tillägg kan läsa och ändra varje webbplats, och inget av dem har granskats."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Signed in from elsewhere", "Inloggad från annat håll"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The SOC's Monday report has an odd pattern. Several staff appear to be using the CRM from two places at once: their usual office, and a hosting provider abroad.\n\nNone of them received an MFA prompt. None of them changed a password. And none of them clicked anything suspicious, as far as they know. The sessions simply carried on from somewhere else.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. SOC:s måndagsrapport visar ett konstigt mönster. Flera anställda verkar använda CRM-systemet från två ställen samtidigt: sitt vanliga kontor och en hostingleverantör utomlands.\n\nIngen av dem fick någon MFA-förfrågan. Ingen av dem bytte lösenord. Och ingen av dem klickade på något misstänkt, så vitt de vet. Sessionerna fortsatte helt enkelt från någon annanstans."
        ]),
        injects: [
          inj("i1-1", 0, "siemAlert", "soc", "high", "confirmed", [
            "Impossible travel: 9 CRM users active from the office and from {{asset.attackerIp}} within minutes. Authentication: existing session, no MFA challenge, no password entry.",
            "Omöjlig resa: 9 CRM-användare aktiva från kontoret och från {{asset.attackerIp}} inom några minuter. Autentisering: befintlig session, ingen MFA-kontroll, inget lösenord angivet."
          ], { tests: ["lo1"] }),
          inj("i1-2", 20, "chat", "person.itOps", "medium", "misleading", [
            "“Classic phishing. I'll reset their passwords and force MFA re-registration. Done by lunch.”",
            "”Klassiskt nätfiske. Jag återställer deras lösenord och tvingar fram ny MFA-registrering. Klart till lunch.”"
          ], { facilitatorNote: ["Password resets do not end a stolen session, and the source keeps stealing new ones.", "Lösenordsbyten avslutar inte en stulen session, och källan fortsätter att stjäla nya."], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How can someone use an account without a password or MFA prompt?", "Hur kan någon använda ett konto utan lösenord eller MFA-förfrågan?", ["socLead", "ciso"]),
            q("What do the nine users have in common?", "Vad har de nio användarna gemensamt?", ["socLead", "itOps"]),
            q("Does a password reset end an existing session in your systems?", "Avslutar ett lösenordsbyte en befintlig session i era system?", ["itOps"])
          ],
          executive: [
            q("Is this nine accounts, or the beginning of more?", "Är det här nio konton, eller början på fler?", ["incidentCommander", "ciso"]),
            q("What can someone do in the CRM with these accounts?", "Vad kan någon göra i CRM-systemet med de här kontona?", ["serviceOwner"]),
            q("Who needs to know before lunch?", "Vem behöver veta före lunch?", ["incidentCommander"])
          ]
        },
        challenges: [ch("All nine users swear they did nothing unusual.", "Alla nio användare svär på att de inte gjort något ovanligt.")],
        decision: dec("d1", "ciso", ["What is your first move?", "Vad är ert första drag?"], [
          ["Revoke all sessions for the nine users and look for what they share before resetting anything else.", "Återkalla alla sessioner för de nio användarna och leta efter vad de har gemensamt innan något annat återställs."],
          ["Reset passwords and MFA for the nine users.", "Återställ lösenord och MFA för de nio användarna."],
          ["Block the foreign address and keep watching.", "Blockera den utländska adressen och fortsätt bevaka."]
        ], {
          knowns: [["Sessions are being used from abroad without passwords or MFA.", "Sessioner används från utlandet utan lösenord eller MFA."]],
          uncertainties: [["How the sessions are being stolen.", "Hur sessionerna stjäls."]],
          tradeoffs: {
            operational: ["Revoking sessions logs people out of everything mid-task.", "Att återkalla sessioner loggar ut folk från allt mitt i arbetet."],
            security: ["Resets alone leave stolen sessions alive.", "Enbart återställningar lämnar stulna sessioner vid liv."],
            legal: ["Customer data in the CRM may already be exposed.", "Kunddata i CRM-systemet kan redan vara exponerade."],
            reputational: ["Nothing public yet.", "Inget offentligt ännu."]
          },
          evaluation: [["Kills the sessions and looks for the common source", "Dödar sessionerna och letar efter den gemensamma källan"]],
          pushback: {
            A: [
              pb(["Back within the hour", "Tillbaka inom en timme"], ["Forty minutes after you revoked everything, three of the nine are active again from the same foreign address, on brand-new sessions. Revoking bought you less than an hour. How many times do you revoke before you know what is handing the sessions over?", "Fyrtio minuter efter att ni återkallade allt är tre av de nio aktiva igen från samma utländska adress, med helt nya sessioner. Återkallelsen köpte er mindre än en timme. Hur många gånger återkallar ni innan ni vet vad det är som lämnar ut sessionerna?"]),
              pb(["Logged out mid-deal", "Utloggad mitt i en affär"], ["One of the nine was in a contract negotiation when every session died, and the sales director calls the CISO directly: “You logged out my best people on a hunch.” Do you keep revoking sessions for people who did nothing wrong, and how do you explain why?", "En av de nio satt i en avtalsförhandling när alla sessioner dog, och försäljningschefen ringer direkt till CISO: ”Ni loggade ut mina bästa säljare på en känsla.” Fortsätter ni att återkalla sessioner för folk som inte gjort något fel, och hur förklarar ni varför?"]),
              pb(["Nothing in common yet", "Inget gemensamt ännu"], ["The first comparison finds nothing shared: different teams, different offices, no common email or website. IT is pushing to start the resets “at least to do something”. How long do you keep looking for a common factor that may not exist?", "Den första jämförelsen hittar inget gemensamt: olika team, olika kontor, inget gemensamt mejl eller webbplats. IT driver på för att börja återställa ”för att åtminstone göra något”. Hur länge fortsätter ni att leta efter en gemensam faktor som kanske inte finns?"])
            ],
            B: [
              pb(["Still signed in", "Fortfarande inloggad"], ["An hour after the resets, the foreign address is still working in the CRM as the same nine people. Nobody needed their new passwords. Do you admit the resets missed, or reset again with stricter settings?", "En timme efter återställningarna arbetar den utländska adressen fortfarande i CRM-systemet som samma nio personer. Ingen behövde deras nya lösenord. Erkänner ni att återställningarna missade, eller återställer ni igen med strängare inställningar?"]),
              pb(["The helpdesk shortcut", "Supportens genväg"], ["Two of the nine are on customer calls and cannot re-enrol their phones until the afternoon. The helpdesk asks whether it can skip the identity check to get them working faster. Do you allow a shortcut in the middle of an account-takeover incident?", "Två av de nio sitter i kundsamtal och kan inte registrera om sina telefoner förrän i eftermiddag. Supporten frågar om de kan hoppa över identitetskontrollen för att få dem i arbete snabbare. Tillåter ni en genväg mitt i en incident med kapade konton?"]),
              pb(["No phishing found", "Inget nätfiske hittat"], ["The mail team has checked all nine mailboxes: no suspicious links, no fake login pages, nothing reported. If nobody was phished, what exactly did the resets fix? Do you keep treating this as phishing?", "Mejlteamet har gått igenom alla nio brevlådor: inga misstänkta länkar, inga falska inloggningssidor, inget rapporterat. Om ingen blev nätfiskad, vad var det då återställningarna åtgärdade? Fortsätter ni att behandla det här som nätfiske?"])
            ],
            C: [
              pb(["A new address", "En ny adress"], ["Twenty minutes after the block, the same nine accounts appear from a hosting provider in another country. Blocking one address cost the attacker nothing. Do you start blocking countries, or change approach?", "Tjugo minuter efter blockeringen dyker samma nio konton upp från en hostingleverantör i ett annat land. Att blockera en adress kostade angriparen ingenting. Börjar ni blockera länder, eller byter ni strategi?"]),
              pb(["What are you watching?", "Vad är det ni bevakar?"], ["The CRM owner reminds you that these accounts can view and export the full customer list. Every minute you watch is a minute someone else has that access. Who in the room accepts that customer data may be leaving while you observe?", "CRM-ägaren påminner om att de här kontona kan se och exportera hela kundlistan. Varje minut ni bevakar är en minut som någon annan har den åtkomsten. Vem i rummet accepterar att kunddata kanske lämnar företaget medan ni tittar på?"]),
              pb(["Does the clock start now?", "Startar klockan nu?"], ["Legal asks a pointed question: you know unknown people are inside a system full of personal data, and you chose to observe. Does a reporting duty start from this moment, and is “keep watching” something you would want to defend later?", "Juristen ställer en skarp fråga: ni vet att okända personer är inne i ett system fullt av personuppgifter, och ni valde att observera. Börjar en rapporteringsskyldighet löpa från nu, och är ”fortsätt bevaka” något ni vill försvara i efterhand?"])
            ]
          }
        }),
        facilitator: fac(
          ["The reflex is phishing and resets. Push the room to ask how a session moves without a password.", "Reflexen är nätfiske och återställningar. Driv rummet att fråga hur en session flyttar utan lösenord."],
          ["Revoke sessions, then find the common factor among the users.", "Återkalla sessioner och hitta sedan den gemensamma faktorn bland användarna."],
          [["Ask: where does a logged-in session actually live?", "Fråga: var finns en inloggad session egentligen?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 120,
        title: L(["PDF Quick Tools", "PDF Quick Tools"]),
        twist: L(["All nine have the same browser extension, a free PDF helper installed by {{num.installs}} staff. It was sold to a new owner last month, and Sunday's update sends session cookies from every website to an outside server.", "Alla nio har samma webbläsartillägg, ett kostnadsfritt PDF-verktyg som {{num.installs}} anställda installerat. Det såldes till en ny ägare förra månaden, och söndagens uppdatering skickar sessionskakor från varje webbplats till en extern server."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because all sessions were revoked, the nine were signed out in the middle of a quarter-end sales push, and sales leadership has complained to the CEO.", sv: "Eftersom alla sessioner återkallades loggades de nio ut mitt i kvartalets sista försäljningsrusch, och försäljningsledningen har klagat hos vd." } }
        ],
        assumptionChallenged: L(["Staff were phished.", "Personalen har blivit nätfiskad."]),
        reveals: ["hf-sold"],
        narrative: L([
          "{{time.T+120|clock}}. {{person.socLead.name}} compares the nine laptops and finds only one thing in common. It is not an email, not a website, not a file. It is a small icon in the corner of the browser that most people stopped noticing years ago.\n\nThe extension's store page still has thousands of good reviews. The most recent ones, from this week, say something different.",
          "Klockan {{time.T+120|clock}}. {{person.socLead.name}} jämför de nio datorerna och hittar bara en sak gemensamt. Det är inget mejl, ingen webbplats, ingen fil. Det är en liten ikon i webbläsarens hörn som de flesta slutade lägga märke till för flera år sedan.\n\nTilläggets sida i butiken har fortfarande tusentals bra omdömen. De senaste, från den här veckan, säger något annat."
        ]),
        injects: [
          inj("i2-1", 120, "forensicFinding", "forensics", "critical", "confirmed", [
            "Extension “PDF Quick Tools” v5.0.0 (updated Sunday 22:10): new background script reads cookies for all sites and posts them every 10 minutes to {{asset.c2Domain}}. Developer contact changed 34 days ago.",
            "Tillägget ”PDF Quick Tools” v5.0.0 (uppdaterat söndag 22.10): nytt bakgrundsskript läser kakor för alla webbplatser och skickar dem var tionde minut till {{asset.c2Domain}}. Utvecklarens kontaktuppgifter ändrades för 34 dagar sedan."
          ], { reveals: ["hf-sold"], tests: ["lo1"] }),
          inj("i2-2", 150, "socialPost", "socialMedia", "medium", "unverified", [
            "Heads up: PDF Quick Tools changed owners and the new version asks for access to all your data. Uninstall it.",
            "Varning: PDF Quick Tools har bytt ägare och den nya versionen vill ha åtkomst till all din data. Avinstallera det."
          ], { headline: ["Review, 1 star, posted yesterday", "Omdöme, 1 stjärna, publicerat i går"], optional: true, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Can you see which browsers have the extension installed?", "Kan ni se vilka webbläsare som har tillägget installerat?", ["itOps"]),
            q("Which websites' sessions should you assume are stolen?", "Vilka webbplatsers sessioner bör ni anta är stulna?", ["socLead", "ciso"]),
            q("Did revoking sessions first stop the attacker, or only slow them?", "Stoppade det angriparen att sessionerna återkallades först, eller bromsades hen bara?", ["socLead"], "d1")
          ],
          executive: [
            q("How many people and systems could be affected?", "Hur många personer och system kan vara drabbade?", ["incidentCommander", "cio"]),
            q("Do you tell all staff now, before you can remove it centrally?", "Berättar ni för all personal nu, innan ni kan ta bort det centralt?", ["comms", "ciso"]),
            q("If you had only reset passwords this morning, where would you be?", "Om ni bara hade återställt lösenord i morse, var hade ni varit?", ["itOps"], "d1")
          ]
        },
        challenges: [ch("The extension is used daily by finance to merge invoices.", "Tillägget används dagligen av ekonomiavdelningen för att slå ihop fakturor.")],
        decision: dec("d2", "cio", ["How do you stop it spreading sessions?", "Hur stoppar ni spridningen av sessioner?"], [
          ["Block the collection server, tell every employee to remove it now with simple steps, and revoke all sessions company-wide.", "Blockera insamlingsservern, be varje anställd ta bort det nu med enkla steg och återkalla alla sessioner i hela företaget."],
          ["Block the collection server and handle removal gradually.", "Blockera insamlingsservern och hantera borttagningen stegvis."],
          ["Remove it only from the nine affected users.", "Ta bara bort det från de nio drabbade användarna."]
        ], {
          knowns: [["A widely installed extension steals sessions from every site.", "Ett brett installerat tillägg stjäl sessioner från varje webbplats."]],
          uncertainties: [["How many sessions were already sent.", "Hur många sessioner som redan har skickats."]],
          tradeoffs: {
            operational: ["Company-wide logout disrupts everyone for an hour.", "Utloggning i hela företaget stör alla i en timme."],
            security: ["Every hour it stays installed, new sessions leave.", "Varje timme det ligger kvar lämnar nya sessioner företaget."],
            legal: ["Customer data access may already be a breach.", "Åtkomsten till kunddata kan redan vara en incident."],
            reputational: ["Staff will remember whether you explained or just ordered.", "Personalen kommer att minnas om ni förklarade eller bara beordrade."]
          },
          evaluation: [["Stops the source on every machine and kills the stolen sessions everywhere", "Stoppar källan på varje maskin och dödar de stulna sessionerna överallt"]],
          pushback: {
            A: [
              pb(["Everyone logged out at once", "Alla utloggade på en gång"], ["The company-wide revocation lands mid-morning. Customer service drops calls, the helpdesk gets hundreds of tickets in fifteen minutes, and many staff cannot remember passwords they have not typed in months. Do you pause the revocation for customer-facing teams, knowing their sessions may already be stolen?", "Återkallelsen i hela företaget slår till mitt på förmiddagen. Kundtjänst tappar samtal, supporten får hundratals ärenden på en kvart och många minns inte lösenord de inte skrivit på månader. Pausar ni återkallelsen för kundnära team, trots att deras sessioner kanske redan är stulna?"]),
              pb(["Finance asks for one day", "Ekonomi ber om en dag"], ["The finance lead says the invoice run cannot be done without the extension and asks to keep it until tomorrow on finance machines only. They promise to log out of everything else. Do you grant the exception, and who signs it?", "Ekonomichefen säger att fakturakörningen inte går att göra utan tillägget och ber att få behålla det till i morgon, bara på ekonomis datorer. De lovar att logga ut från allt annat. Beviljar ni undantaget, och vem skriver under?"]),
              pb(["Did they really remove it?", "Tog de verkligen bort det?"], ["An hour after the all-staff message, replies are a mess: some cannot find the icon, others removed a different PDF tool with a similar name, most have not answered. You told everyone to act, but you cannot see who did. How do you know who is still running it?", "En timme efter meddelandet till all personal är svaren röriga: en del hittar inte ikonen, andra tog bort ett annat PDF-verktyg med liknande namn, de flesta har inte svarat. Ni bad alla agera, men ni kan inte se vilka som gjorde det. Hur vet ni vem som fortfarande kör det?"])
            ],
            B: [
              pb(["The block is all you have", "Blockeringen är allt ni har"], ["A threat-intelligence contact warns that extensions like this often carry a backup address and switch when the first is blocked. With removal left for later, your block is the only thing between staff browsers and the thief. How long is “gradually” allowed to take?", "En kontakt inom hotunderrättelser varnar för att sådana här tillägg ofta har en reservadress och byter när den första blockeras. När borttagningen skjuts upp är blockeringen det enda som står mellan personalens webbläsare och tjuven. Hur lång tid får ”stegvis” ta?"]),
              pb(["Sessions already sent", "Sessioner som redan skickats"], ["The block stops new cookies leaving, but everything sent since Sunday night is still valid, and you chose not to revoke sessions company-wide. Those stolen sessions work from anywhere. Do you now take the company-wide logout you tried to avoid?", "Blockeringen stoppar nya kakor från att lämna, men allt som skickats sedan söndag kväll är fortfarande giltigt, och ni valde att inte återkalla sessioner i hela företaget. De stulna sessionerna fungerar varifrån som helst. Tar ni nu den utloggning i hela företaget som ni försökte undvika?"]),
              pb(["What do you tell staff today?", "Vad säger ni till personalen i dag?"], ["Comms asks what to say in the meantime. If you say nothing, people keep using a tool you know is malicious. If you say something, they ask why it is not being removed today. What message do you send, and can you stand behind it?", "Kommunikationsansvarig frågar vad som ska sägas under tiden. Säger ni inget fortsätter folk att använda ett verktyg ni vet är skadligt. Säger ni något frågar de varför det inte tas bort i dag. Vilket budskap skickar ni, och kan ni stå för det?"])
            ],
            C: [
              pb(["A tenth account", "Ett tionde konto"], ["The SOC sees two more accounts used from the foreign address, neither among the nine. Both have the same extension. Do you keep going one user at a time, a step behind each new victim?", "SOC ser ytterligare två konton som används från den utländska adressen, inget av dem bland de nio. Båda har samma tillägg. Fortsätter ni en användare i taget, ett steg efter varje nytt offer?"]),
              pb(["Why are the others safe?", "Varför är de andra säkra?"], ["The CISO points out that {{num.installs}} staff have the extension and the nine are simply the ones the CRM alarm happened to catch. Nobody can say why the rest are not leaking too. What is your answer if one of them is next?", "CISO påpekar att {{num.installs}} anställda har tillägget och att de nio bara är de som larmet i CRM-systemet råkade fånga. Ingen kan säga varför resten inte också läcker. Vad är ert svar om nästa drabbade är en av dem?"]),
              pb(["Not just the CRM", "Inte bara CRM-systemet"], ["The extension takes cookies from every site the browser visits, not only the CRM. The nine were also signed in to email, the intranet and whatever else they use. Removing it from nine laptops does nothing about what was already taken. Do you know where else those sessions work?", "Tillägget tar kakor från varje webbplats webbläsaren besöker, inte bara CRM-systemet. De nio var också inloggade i mejlen, intranätet och vad de nu använder. Att ta bort det från nio datorer gör inget åt det som redan tagits. Vet ni var mer de sessionerna fungerar?"])
            ]
          }
        }),
        facilitator: fac(
          ["The source is on hundreds of machines. Partial removal leaves the tap running.", "Källan finns på hundratals maskiner. En delvis borttagning lämnar kranen öppen."],
          ["Block the destination, remove everywhere, revoke all sessions.", "Blockera mottagaren, ta bort överallt, återkalla alla sessioner."],
          [["Ask: what other websites were those browsers logged in to?", "Fråga: vilka andra webbplatser var de webbläsarna inloggade på?"]]
        )
      },
      {
        id: "p3",
        clock: 300,
        priority: 1,
        title: L(["No central control", "Ingen central styrning"]),
        twist: L(["You cannot remove the extension centrally: browsers are not managed, staff use personal browser profiles, and a third of laptops are on home networks today.", "Ni kan inte ta bort tillägget centralt: webbläsarna styrs inte, personalen använder personliga webbläsarprofiler och en tredjedel av datorerna är på hemnätverk i dag."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "All nine share one extension, installed by {{num.installs}} staff. If you revoked sessions first, it kept stealing new ones. If you reset passwords, it did not matter: it steals sessions, not passwords.", sv: "Alla nio har samma tillägg, installerat av {{num.installs}} anställda. Om ni återkallade sessionerna först fortsatte det att stjäla nya. Om ni bytte lösenord spelade det ingen roll: det stjäl sessioner, inte lösenord." } },
        assumptionChallenged: L(["IT can push a removal to every machine.", "IT kan skicka ut en borttagning till varje maskin."]),
        narrative: L([
          "{{time.T+300|clock}}. {{person.itOps.name}} opens the endpoint management tool to push a removal and stops. The tool manages operating systems and updates, but nobody ever set up control of the browsers themselves.\n\nEvery browser is configured by whoever uses it. Some staff sync their work browser with their personal one at home, so the extension follows them from device to device.",
          "Klockan {{time.T+300|clock}}. {{person.itOps.name}} öppnar verktyget för klienthantering för att skicka ut en borttagning och stannar upp. Verktyget hanterar operativsystem och uppdateringar, men ingen har någonsin satt upp styrning av själva webbläsarna.\n\nVarje webbläsare är inställd av den som använder den. En del anställda synkar sin jobbwebbläsare med den privata hemma, så tillägget följer med dem från enhet till enhet."
        ]),
        injects: [
          inj("i3-1", 300, "impactReport", "person.itOps", "high", "confirmed", [
            "Browser policies: none deployed. Extensions visible to IT: none. Staff with work and personal profiles synced: estimated 40 percent. Self-reported removals so far: 212 of {{num.installs}}.",
            "Webbläsarpolicyer: inga utrullade. Tillägg som IT kan se: inga. Anställda med synkade jobb- och privatprofiler: uppskattningsvis 40 procent. Självrapporterade borttagningar hittills: 212 av {{num.installs}}."
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("How fast can you deploy a browser policy that blocks this extension?", "Hur snabbt kan ni rulla ut en webbläsarpolicy som blockerar tillägget?", ["itOps"]),
            q("How do you deal with synced personal profiles on home computers?", "Hur hanterar ni synkade privata profiler på hemdatorer?", ["itOps", "ciso"]),
            q("Is blocking the collection server holding?", "Håller blockeringen av insamlingsservern?", ["socLead"], "d2")
          ],
          executive: [
            q("Can you ask staff to clean their home computers?", "Kan ni be personalen rensa sina hemdatorer?", ["legal", "cio"]),
            q("Who decides that browsers will be centrally controlled from now on?", "Vem bestämmer att webbläsarna ska styras centralt från och med nu?", ["cio"]),
            q("Did telling everyone this morning speed up removal?", "Gick borttagningen snabbare för att ni berättade för alla i morse?", ["comms"], "d2")
          ]
        },
        challenges: [ch("Developers say a managed browser will break their testing tools.", "Utvecklarna säger att en styrd webbläsare kommer att förstöra deras testverktyg.")],
        decision: dec("d3", "cio", ["How do you reach every browser?", "Hur når ni varje webbläsare?"], [
          ["Deploy a browser policy today that blocks this extension and all unapproved ones, with an exception process.", "Rulla ut en webbläsarpolicy i dag som blockerar det här tillägget och alla ej godkända, med en process för undantag."],
          ["Rely on staff to remove it and check back in a week.", "Lita på att personalen tar bort det och följ upp om en vecka."],
          ["Require every laptop to be brought in for checking.", "Kräv att varje dator lämnas in för kontroll."]
        ], {
          knowns: [["Browsers are unmanaged and profiles are synced with home devices.", "Webbläsarna styrs inte och profilerna synkas med hemenheter."]],
          uncertainties: [["How many installs remain.", "Hur många installationer som finns kvar."]],
          tradeoffs: {
            operational: ["Blocking all unapproved extensions breaks some workflows.", "Att blockera alla ej godkända tillägg förstör vissa arbetsflöden."],
            security: ["Relying on staff leaves an unknown number of sources active.", "Att lita på personalen lämnar ett okänt antal källor aktiva."],
            legal: ["Home devices are outside your control.", "Hemenheter ligger utanför er kontroll."],
            reputational: ["Bringing in every laptop stops the company for days.", "Att samla in varje dator stoppar företaget i flera dagar."]
          },
          evaluation: [["Gains real control over browsers instead of relying on reminders", "Skaffar verklig kontroll över webbläsarna i stället för att lita på påminnelser"]],
          pushback: {
            A: [
              pb(["The exception queue", "Kön av undantag"], ["Within an hour of the policy, the exception process has dozens of requests, starting with the developers whose testing tools just stopped. Nobody has been named to review them. Who decides, how fast, and what stops people working around the block in the meantime?", "Inom en timme efter policyn har undantagsprocessen dussintals förfrågningar, först från utvecklarna vars testverktyg just slutade fungera. Ingen har utsetts att granska dem. Vem beslutar, hur snabbt, och vad hindrar folk från att gå runt blockeringen under tiden?"]),
              pb(["The home computer", "Hemdatorn"], ["The policy reaches the work browser, but around 40 percent of staff sync their profile with a personal computer at home, where the extension is still installed and still sending. Your policy cannot touch that machine. Do you ask staff to clean their private computers, and can you require it?", "Policyn når jobbwebbläsaren, men omkring 40 procent av personalen synkar sin profil med en privat dator hemma, där tillägget fortfarande är installerat och fortfarande skickar. Er policy kan inte nå den datorn. Ber ni personalen rensa sina privata datorer, och kan ni kräva det?"]),
              pb(["Contracts cannot be signed", "Avtal kan inte skrivas under"], ["Legal reports that the signing plug-in they use for customer contracts was not on any approved list and is now blocked. Two contracts due today are stuck. Do you approve tools on the spot under pressure, or hold the line and let the business wait?", "Juridik rapporterar att signeringstillägget de använder för kundavtal inte fanns på någon godkänd lista och nu är blockerat. Två avtal som ska skrivas i dag sitter fast. Godkänner ni verktyg på stående fot under tryck, eller håller ni linjen och låter verksamheten vänta?"])
            ],
            B: [
              pb(["The count stops moving", "Siffran slutar röra sig"], ["Self-reported removals stall at a little over two hundred of {{num.installs}}. Each remaining install sends fresh sessions every ten minutes, and you will not check again for a week. Who answers for what leaves the company in those seven days?", "De självrapporterade borttagningarna stannar på drygt tvåhundra av {{num.installs}}. Varje kvarvarande installation skickar nya sessioner var tionde minut, och ni följer inte upp förrän om en vecka. Vem står till svars för det som lämnar företaget under de sju dagarna?"]),
              pb(["“I removed it, it came back”", "”Jag tog bort det, det kom tillbaka”"], ["Several staff report that the extension reappeared after they removed it: browser sync restored it from their home profile. People did what you asked and it did not stick. Do you still rely on staff, or do you need control you do not yet have?", "Flera anställda rapporterar att tillägget dök upp igen efter att de tagit bort det: webbläsarsynken återställde det från hemprofilen. Folk gjorde som ni bad och det höll inte. Litar ni fortfarande på personalen, eller behöver ni en kontroll ni ännu inte har?"]),
              pb(["“Appropriate measures”", "”Lämpliga åtgärder”"], ["The DPO asks how you will describe your response if customer data turns out to be affected: a reminder email and a follow-up in a week. Would you be comfortable reading that out to {{reg.csirt}} or a regulator, and if not, why choose it?", "Dataskyddsombudet frågar hur ni ska beskriva er hantering om kunddata visar sig vara drabbade: ett påminnelsemejl och en uppföljning om en vecka. Skulle ni vara bekväma med att läsa upp det för {{reg.csirt}} eller en tillsynsmyndighet, och om inte, varför välja det?"])
            ],
            C: [
              pb(["A third are at home", "En tredjedel är hemma"], ["A third of laptops are on home networks today, some in other cities. Getting them all in takes days, and every one keeps sending sessions until it arrives. What do those people do in the meantime: keep working, or stop?", "En tredjedel av datorerna är på hemnätverk i dag, en del i andra städer. Att få in alla tar flera dagar, och varje dator fortsätter skicka sessioner tills den kommer in. Vad gör de personerna under tiden: fortsätter arbeta, eller slutar?"]),
              pb(["Who goes first?", "Vem går först?"], ["The service owner says handing in laptops will stop support and sales for at least a day per team. Every manager argues their team must go last. Who decides the order, and on what basis?", "Tjänsteägaren säger att inlämningen kommer att stoppa support och försäljning i minst en dag per team. Varje chef argumenterar för att just deras team ska gå sist. Vem bestämmer ordningen, och på vilka grunder?"]),
              pb(["Clean laptop, dirty profile", "Ren dator, smittad profil"], ["IT warns that a checked laptop will sync the same browser profile back the moment its owner signs in, extension included, from the computer at home. Checking laptops may not be checking the right thing. What is the point of the queue if the source is elsewhere?", "IT varnar för att en kontrollerad dator synkar tillbaka samma webbläsarprofil så snart ägaren loggar in, tillägget inräknat, från datorn hemma. Att kontrollera datorer är kanske inte att kontrollera rätt sak. Vad är poängen med kön om källan finns någon annanstans?"])
            ]
          }
        }),
        facilitator: fac(
          ["The gap is governance, exposed under pressure. Expect developer pushback.", "Luckan är styrning, blottlagd under tryck. Räkna med invändningar från utvecklarna."],
          ["Managed browser policy today, blocklist plus approved list, exception route.", "Styrd webbläsarpolicy i dag, blockeringslista plus godkänd lista, väg för undantag."],
          [["Ask: who decides what runs inside your staff's browsers?", "Fråga: vem bestämmer vad som körs i er personals webbläsare?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 600,
        title: L(["Where the sessions went", "Vart sessionerna tog vägen"]),
        twist: L(["The stolen sessions reached far beyond the CRM: a finance user's bank portal, two cloud admin consoles and the HR system. In the CRM, a non-expiring API token was created at 06:10 and is exporting customer records.", "De stulna sessionerna nådde långt bortom CRM-systemet: en ekonomianvändares bankportal, två administrationskonsoler i molnet och HR-systemet. I CRM-systemet skapades en API-token utan utgångsdatum 06.10, och den exporterar kundposter."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "Stolen sessions reached a bank portal and two cloud admin consoles. Was the way you stopped the spread fast enough?", sv: "Stulna sessioner nådde en bankportal och två administrationskonsoler i molnet. Var ert sätt att stoppa spridningen tillräckligt snabbt?" } },
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because the policy blocks every unapproved extension, accessibility tools that several colleagues rely on have stopped working.", sv: "Eftersom policyn blockerar varje ej godkänt tillägg har tillgänglighetsverktyg som flera kollegor är beroende av slutat fungera." } }
        ],
        assumptionChallenged: L(["It is a CRM incident.", "Det är en incident i CRM-systemet."]),
        reveals: ["hf-token"],
        narrative: L([
          "{{time.T+600|clock}}. Sessions have been revoked company-wide and the extension is being removed. {{person.socLead.name}} now has enough data to follow the stolen sessions from the collection server's point of view.\n\nThe CRM was just where the alarm happened to ring first. The question is where else those browsers were logged in on Sunday night, and what was done there while nobody was looking.",
          "Klockan {{time.T+600|clock}}. Sessionerna har återkallats i hela företaget och tillägget håller på att tas bort. {{person.socLead.name}} har nu tillräckligt med data för att följa de stulna sessionerna ur insamlingsserverns perspektiv.\n\nCRM-systemet var bara där larmet råkade gå först. Frågan är var mer de webbläsarna var inloggade på söndagskvällen, och vad som gjordes där medan ingen tittade."
        ]),
        injects: [
          inj("i4-1", 600, "authLog", "soc", "critical", "confirmed", [
            "Replayed sessions from {{asset.attackerIp}}: CRM ({{num.accounts}} accounts), bank portal (1, read-only so far), cloud admin consoles (2), HR system (1). CRM API token “sync-reports” created 06:10, no expiry.",
            "Återanvända sessioner från {{asset.attackerIp}}: CRM ({{num.accounts}} konton), bankportal (1, hittills bara läsning), administrationskonsoler i molnet (2), HR-system (1). API-token ”sync-reports” i CRM skapad 06.10, inget utgångsdatum."
          ], { reveals: ["hf-token"], tests: ["lo3"] }),
          inj("i4-2", 630, "logExcerpt", "person.serviceOwner", "high", "confirmed", [
            "CRM API: token “sync-reports” has paged through the contacts and accounts endpoints since 08:00. Records returned: {{num.exported|number}}.",
            "CRM-API: token ”sync-reports” har bläddrat igenom kontakt- och kundgränssnitten sedan 08.00. Returnerade poster: {{num.exported|number}}."
          ], { tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["Reach of the stolen sessions", "Räckvidden för de stulna sessionerna"]),
          data: kpi([
            { id: "inst", label: ["Staff with the extension", "Anställda med tillägget"], value: (v) => v.installs, tone: "warn" },
            { id: "acc", label: ["Accounts replayed", "Återanvända konton"], value: (v) => v.accounts, tone: "danger" },
            { id: "exp", label: ["Customer records exported", "Exporterade kundposter"], value: (v) => v.exported, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("Does revoking sessions also revoke the API token?", "Återkallar återkallelsen av sessioner också API-token?", ["serviceOwner", "itOps"]),
            q("What did the two cloud admin sessions do?", "Vad gjorde de två administrationssessionerna i molnet?", ["socLead"]),
            q("Is the browser policy deployed yet, or are new sessions still leaving?", "Är webbläsarpolicyn utrullad ännu, eller lämnar nya sessioner fortfarande företaget?", ["itOps"], "d3")
          ],
          executive: [
            q("Does the bank need to be told now?", "Behöver banken få veta nu?", ["cfo"]),
            q("Is this now a personal data breach with reporting duties?", "Är det här nu en personuppgiftsincident med rapporteringsskyldighet?", ["dpo", "legal"]),
            q("Would a gradual removal this morning have made this worse?", "Hade en stegvis borttagning i morse gjort det här värre?", ["cio"], "d2")
          ]
        },
        challenges: [ch("The CRM vendor says API tokens are not affected by session revocation.", "CRM-leverantören säger att API-token inte påverkas av att sessioner återkallas.")],
        decision: dec("d4", "ciso", ["What do you do now?", "Vad gör ni nu?"], [
          ["Revoke all API tokens and app grants in every affected system, alert the bank, review the admin console activity and notify the regulator.", "Återkalla alla API-token och appbehörigheter i varje drabbat system, varna banken, gå igenom aktiviteten i administrationskonsolerna och anmäl till tillsynsmyndigheten."],
          ["Revoke the one CRM token and keep looking.", "Återkalla den enda CRM-token och fortsätt leta."],
          ["Shut the CRM down until the investigation is complete.", "Stäng ner CRM-systemet tills utredningen är klar."]
        ], {
          knowns: [["Sessions reached banking, cloud admin and HR; a CRM token is exporting data.", "Sessioner nådde bank, molnadministration och HR; en CRM-token exporterar data."]],
          uncertainties: [["What changes the admin sessions made.", "Vilka ändringar administrationssessionerna gjorde."]],
          tradeoffs: {
            operational: ["Revoking all tokens breaks integrations that use them.", "Att återkalla alla token förstör integrationer som använder dem."],
            security: ["Revoking one token assumes the attacker made only one.", "Att återkalla en token förutsätter att angriparen bara skapade en."],
            legal: ["Customer data has been exported: the clock is running.", "Kunddata har exporterats: klockan går."],
            reputational: ["Shutting the CRM is visible to every customer-facing team.", "Att stänga CRM-systemet syns för varje kundnära team."]
          },
          evaluation: [["Removes persistence everywhere the sessions reached, not only where it was noticed", "Tar bort fotfästen överallt dit sessionerna nådde, inte bara där det upptäcktes"]],
          pushback: {
            A: [
              pb(["Integrations go dark", "Integrationerna slocknar"], ["Revoking every token also cut the web shop's order sync, the invoicing link and the marketing tool. Orders are piling up unsynced and nobody has a list of which tokens were legitimate. How do you turn the good ones back on without restoring the bad one?", "Att återkalla alla token klippte också webbutikens ordersynk, faktureringskopplingen och marknadsverktyget. Ordrar hopar sig osynkade och ingen har en lista över vilka token som var legitima. Hur slår ni på de rätta igen utan att återställa den felaktiga?"]),
              pb(["Notify with which number?", "Anmäla med vilken siffra?"], ["Legal points out that the export count is still being worked out, and the admin console review has barely started. Notifying now means a figure you will likely have to revise. Do you report an estimate today, or wait for a number you can defend?", "Juristen påpekar att antalet exporterade poster fortfarande räknas fram, och genomgången av administrationskonsolerna har knappt börjat. Att anmäla nu innebär en siffra ni troligen får revidera. Rapporterar ni en uppskattning i dag, eller väntar ni på en siffra ni kan försvara?"]),
              pb(["The bank pushes back", "Banken tar emot"], ["The bank says the session was read-only and suggests freezing the finance user's access, which would stop today's supplier payments. The CFO objects: “Nothing was moved. We cannot stop paying people over a maybe.” Do you insist on the freeze?", "Banken säger att sessionen bara kunde läsa och föreslår att ekonomianvändarens åtkomst fryses, vilket skulle stoppa dagens leverantörsbetalningar. Ekonomidirektören invänder: ”Inget har flyttats. Vi kan inte sluta betala folk för ett kanske.” Står ni fast vid frysningen?"])
            ],
            B: [
              pb(["What about the admin consoles?", "Vad gäller administrationskonsolerna?"], ["You revoked “sync-reports”, but two cloud admin sessions were also replayed and nobody has looked at what they did. Admins can create accounts and keys of their own. Is “keep looking” a plan, or a hope that the attacker stopped at one?", "Ni återkallade ”sync-reports”, men två administrationssessioner i molnet återanvändes också och ingen har tittat på vad de gjorde. Administratörer kan skapa egna konton och nycklar. Är ”fortsätt leta” en plan, eller en förhoppning om att angriparen nöjde sig med en?"]),
              pb(["Who calls the bank?", "Vem ringer banken?"], ["Nobody has told the bank yet. The log says the bank portal session was “read-only so far”, and the CFO wants to know what “so far” means. Do you wait until something moves before you call?", "Ingen har kontaktat banken ännu. Loggen säger att bankportalens session ”hittills bara läste”, och ekonomidirektören vill veta vad ”hittills” betyder. Väntar ni tills något flyttas innan ni ringer?"]),
              pb(["The records are already out", "Posterna är redan ute"], ["Revoking the token stops the export, but {{num.exported|number}} records have already left. The DPO says the reporting clock is running whether or not you keep looking. Does your choice quietly mean not notifying yet, and who decided that?", "Att återkalla token stoppar exporten, men {{num.exported|number}} poster har redan lämnat företaget. Dataskyddsombudet säger att rapporteringsklockan går oavsett om ni fortsätter leta. Betyder ert val i tysthet att ni inte anmäler ännu, och vem bestämde det?"])
            ],
            C: [
              pb(["The CRM was not the only door", "CRM-systemet var inte den enda dörren"], ["Switching off the CRM does nothing for the bank portal session, the two cloud admin consoles or the HR system. The attacker's other footholds are untouched. Is the CRM really the thing to turn off, or just the most visible one?", "Att stänga av CRM-systemet gör ingenting åt bankportalens session, de två administrationskonsolerna i molnet eller HR-systemet. Angriparens andra fotfästen är orörda. Är CRM-systemet verkligen det som ska stängas av, eller bara det mest synliga?"]),
              pb(["“Our system is down”", "”Vårt system ligger nere”"], ["Customer service cannot see any customer's history and starts telling callers the system is down. One customer has already posted it online and asked whether their data is safe. What do you tell them, and how long can you keep the CRM off?", "Kundtjänst kan inte se någon kunds historik och börjar säga till de som ringer att systemet ligger nere. En kund har redan skrivit om det på nätet och frågat om deras data är säker. Vad säger ni till dem, och hur länge kan ni hålla CRM-systemet avstängt?"]),
              pb(["The token survives the restart", "Token överlever omstarten"], ["The CRM vendor confirms the token has no expiry and will work again the moment the system comes back, unless it is revoked. Shutting down paused the export but removed nothing. When do you switch back on, and what will be different when you do?", "CRM-leverantören bekräftar att token saknar utgångsdatum och fungerar igen så snart systemet är tillbaka, om den inte återkallas. Avstängningen pausade exporten men tog inte bort något. När slår ni på igen, och vad är annorlunda när ni gör det?"])
            ]
          }
        }),
        facilitator: fac(
          ["Session theft is a skeleton key. Persistence (tokens, app grants) survives session revocation.", "Sessionsstöld är en huvudnyckel. Fotfästen (token, appbehörigheter) överlever att sessionerna återkallas."],
          ["Revoke tokens and grants everywhere, involve the bank, review admin activity, notify.", "Återkalla token och behörigheter överallt, involvera banken, granska administrativ aktivitet, anmäl."],
          [["Ask: what did the attacker leave behind so they would not need the sessions again?", "Fråga: vad lämnade angriparen efter sig för att inte behöva sessionerna igen?"]]
        )
      },
      {
        id: "p5",
        clock: 1440,
        priority: 2,
        title: L(["The store and the owner", "Butiken och ägaren"]),
        twist: L(["The extension store says its review takes up to 48 hours. The new owner's contact address bounces. Meanwhile, two partner companies ask whether their staff, who use the same extension, are at risk.", "Tilläggsbutiken säger att dess granskning tar upp till 48 timmar. Den nya ägarens kontaktadress studsar. Samtidigt frågar två partnerföretag om deras personal, som använder samma tillägg, är i fara."]),
        twistKind: "authority",
        assumptionChallenged: L(["The store will pull a malicious extension immediately.", "Butiken drar tillbaka ett skadligt tillägg omedelbart."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}. Inside {{org.name}} the extension is mostly gone. Outside, it is still in the store with thousands of good reviews, still updating itself on machines that belong to other people.\n\nYou know more about it than almost anyone. The question is what you do with that knowledge, and who you are allowed to tell.",
          "{{time.T+1440|weekday|cap}}. Inom {{org.name}} är tillägget i stort sett borta. Utanför finns det fortfarande kvar i butiken med tusentals bra omdömen, och uppdaterar sig fortfarande på maskiner som tillhör andra.\n\nNi vet mer om det än nästan någon annan. Frågan är vad ni gör med den kunskapen, och vem ni får berätta för."
        ]),
        injects: [
          inj("i5-1", 1440, "email", "vendor", "medium", "confirmed", [
            "Extension store support: “Thank you for your report. Our team will review the item within 48 hours. We cannot share information about developer accounts.”",
            "Tilläggsbutikens support: ”Tack för din rapport. Vårt team granskar tillägget inom 48 timmar. Vi kan inte dela information om utvecklarkonton.”"
          ], { headline: ["Re: Malicious extension report", "Sv: Rapport om skadligt tillägg"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What indicators could you share with partners and {{reg.csirt}}?", "Vilka indikatorer skulle ni kunna dela med partner och {{reg.csirt}}?", ["socLead"]),
            q("How will you know if the extension returns under a new name?", "Hur får ni veta om tillägget kommer tillbaka under ett nytt namn?", ["itOps"]),
            q("Did revoking every token yesterday break anything you have not restored?", "Slog återkallelsen av alla token i går ut något som ni inte har återställt?", ["serviceOwner"], "d4")
          ],
          executive: [
            q("Do you warn the public, or only partners?", "Varnar ni allmänheten, eller bara partner?", ["comms", "legal"]),
            q("What do you tell customers whose records were exported?", "Vad säger ni till kunder vars poster exporterades?", ["dpo", "comms"]),
            q("Did involving the bank early protect you?", "Skyddade det er att involvera banken tidigt?", ["cfo"], "d4")
          ]
        },
        challenges: [ch("A journalist has noticed the store reviews and asks whether any companies were affected.", "En journalist har lagt märke till omdömena i butiken och frågar om några företag drabbats.")],
        noDecision: L(["No vote: the store decides on its timeline. Let the room decide what to share, with whom, and how.", "Ingen omröstning: butiken bestämmer i sin egen takt. Låt rummet bestämma vad som ska delas, med vem och hur."]),
        facilitator: fac(
          ["You cannot force the store, but you can protect others through sharing.", "Ni kan inte tvinga butiken, men ni kan skydda andra genom att dela information."],
          ["Indicators to the CSIRT and partners, honest customer notification.", "Indikatorer till CSIRT och partner, ärlig information till kunderna."],
          [["Ask: who else uses this extension that you could warn today?", "Fråga: vem mer använder det här tillägget som ni skulle kunna varna i dag?"]]
        )
      },
      {
        id: "p6",
        clock: 10080,
        priority: 3,
        title: L(["140 extensions", "140 tillägg"]),
        twist: L(["With browser management finally in place, IT can see what is installed: 140 different extensions, 31 of which can read and change every website you visit.", "När webbläsarhanteringen äntligen är på plats kan IT se vad som är installerat: 140 olika tillägg, varav 31 kan läsa och ändra varje webbplats ni besöker."]),
        twistKind: "scope",
        reconsider: { decision: "d3", pressure: { en: "IT can now see 140 extensions, 31 of them able to read every website. Was the browser policy you chose the right first step?", sv: "IT kan nu se 140 tillägg, varav 31 kan läsa varje webbplats. Var webbläsarpolicyn ni valde rätt första steg?" } },
        branches: [
          { when: { decision: "d4", option: "C" }, narrativeAppend: { en: "Because the CRM was shut down, sales has worked from spreadsheets for two days, and two deals have slipped into next quarter.", sv: "Eftersom CRM-systemet stängdes ner har säljarna arbetat i kalkylblad i två dagar, och två affärer har glidit över till nästa kvartal." } }
        ],
        assumptionChallenged: L(["It was one bad extension.", "Det var ett dåligt tillägg."]),
        reveals: ["hf-ext"],
        narrative: L([
          "{{time.T+10080|weekday|cap}}. A week later. Browser management is rolled out and, for the first time, IT has a list of every extension running inside the company's browsers.\n\n{{person.itOps.name}} sorts the list by permissions. The top of it reads like a set of skeleton keys, each one installed by someone who just wanted a slightly easier day.",
          "{{time.T+10080|weekday|cap}}. En vecka senare. Webbläsarhanteringen är utrullad och för första gången har IT en lista över varje tillägg som körs i företagets webbläsare.\n\n{{person.itOps.name}} sorterar listan efter behörigheter. Toppen ser ut som en uppsättning huvudnycklar, var och en installerad av någon som bara ville ha en något enklare dag."
        ]),
        injects: [
          inj("i6-1", 10080, "impactReport", "person.itOps", "medium", "confirmed", [
            "Extensions installed: 140. With “read and change all your data on all websites”: 31. Changed owner in the last year: 4. Ever reviewed by IT or security: 0.",
            "Installerade tillägg: 140. Med ”läsa och ändra all din data på alla webbplatser”: 31. Har bytt ägare det senaste året: 4. Någonsin granskade av IT eller säkerhet: 0."
          ], { reveals: ["hf-ext"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which of the 31 do people genuinely need?", "Vilka av de 31 behöver folk verkligen?", ["itOps", "ciso"]),
            q("How would you notice the next change of owner?", "Hur skulle ni märka nästa ägarbyte?", ["socLead"]),
            q("Looking back, how much did the browser-policy decision change the week?", "När ni ser tillbaka, hur mycket ändrade beslutet om webbläsarpolicyn veckan?", ["cio"], "d3")
          ],
          executive: [
            q("Allow-list or block-list: which do you choose?", "Lista över tillåtna eller blockerade: vilket väljer ni?", ["cio", "ciso"]),
            q("Who approves a new extension, and how fast?", "Vem godkänner ett nytt tillägg, och hur snabbt?", ["cio"]),
            q("Which first-hour decision mattered most?", "Vilket beslut under den första timmen spelade störst roll?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("One of the 31 is the sales team's most loved productivity tool.", "En av de 31 är säljteamets mest älskade produktivitetsverktyg.")],
        decision: dec("d5", "ciso", ["What do you change?", "Vad ändrar ni?"], [
          ["An allow-list of reviewed extensions, alerts on permission or owner changes, and a quick request route.", "En lista över granskade tillåtna tillägg, larm vid ändrade behörigheter eller ägare och en snabb väg för förfrågningar."],
          ["Block all extensions permanently.", "Blockera alla tillägg permanent."],
          ["Block only the four that changed owners.", "Blockera bara de fyra som bytt ägare."]
        ], {
          knowns: [["Many powerful extensions run unreviewed.", "Många kraftfulla tillägg körs ogranskade."]],
          uncertainties: [["Which one is next to be sold.", "Vilket som blir nästa att säljas."]],
          tradeoffs: {
            operational: ["Blocking everything removes tools people rely on.", "Att blockera allt tar bort verktyg som folk är beroende av."],
            security: ["A block-list is always one extension behind.", "En blockeringslista ligger alltid ett tillägg efter."],
            legal: ["Some extensions process customer data on someone else's servers.", "En del tillägg behandlar kunddata på någon annans servrar."],
            reputational: ["A repeat would be hard to explain.", "En upprepning vore svår att förklara."]
          },
          evaluation: [["Controls what can run, with a route that keeps people from working around it", "Styr vad som får köras, med en väg som hindrar folk från att gå runt det"]],
          pushback: {
            A: [
              pb(["Sales will go around it", "Säljarna går runt det"], ["The sales team's favourite tool is one of the 31 and goes into review. The sales director says the team will simply use personal laptops until it is approved. Does your request route move fast enough that people do not route around it?", "Säljteamets favoritverktyg är ett av de 31 och hamnar i granskning. Försäljningschefen säger att teamet helt enkelt använder privata datorer tills det är godkänt. Går er väg för förfrågningar tillräckligt snabbt för att folk inte ska ta en omväg?"]),
              pb(["Who reviews 140?", "Vem granskar 140?"], ["Nobody in IT or security has time to review 140 extensions, and there are no agreed criteria for what “reviewed” means. Until the work is done, the 31 powerful ones keep running. Who does it, by when, and what happens to the 31 in the meantime?", "Ingen inom IT eller säkerhet har tid att granska 140 tillägg, och det finns inga överenskomna kriterier för vad ”granskat” betyder. Tills arbetet är gjort fortsätter de 31 kraftfulla att köras. Vem gör det, till när, och vad händer med de 31 under tiden?"]),
              pb(["Approved, then sold", "Godkänt, sedan sålt"], ["{{person.itOps.name}} points out that stores rarely announce a change of owner, and a buyer can keep the same developer name. Your owner-change alert would watch for something that may never show. Is an allow-list of today's extensions any protection against tomorrow's buyer?", "{{person.itOps.name}} påpekar att butikerna sällan meddelar ägarbyten, och att en köpare kan behålla samma utvecklarnamn. Ert larm om ägarbyten skulle bevaka något som kanske aldrig syns. Skyddar en lista över dagens tillägg mot morgondagens köpare?"])
            ],
            B: [
              pb(["Tools people need to work", "Verktyg folk behöver för att arbeta"], ["HR raises that several colleagues depend on reading and dictation extensions to do their jobs, and blocking them may breach your duty to accommodate. Any exception you grant is an allow-list by another name. Is “block everything” really what you are choosing?", "HR tar upp att flera kollegor är beroende av tillägg för uppläsning och diktering för att kunna göra sitt jobb, och att blockera dem kan strida mot er skyldighet att anpassa. Varje undantag ni beviljar är en lista över tillåtna under ett annat namn. Är ”blockera allt” verkligen det ni väljer?"]),
              pb(["A second browser", "En andra webbläsare"], ["Within a week, IT spots staff installing a second, unmanaged browser to get their extensions back. The ban moved the risk somewhere you cannot see it. Do you lock down software installs too, and how far are you willing to go?", "Inom en vecka ser IT att personal installerar en andra, ostyrd webbläsare för att få tillbaka sina tillägg. Förbudet flyttade risken till ett ställe där ni inte ser den. Låser ni också installationen av programvara, och hur långt är ni beredda att gå?"]),
              pb(["The password manager", "Lösenordshanteraren"], ["The password manager security has recommended for years runs as a browser extension and is now blocked. Staff go back to reusing and writing down passwords. Is the cure worse than the disease for this one?", "Lösenordshanteraren som säkerhet har rekommenderat i flera år körs som ett webbläsartillägg och är nu blockerad. Personalen går tillbaka till att återanvända och skriva ner lösenord. Är botemedlet värre än sjukdomen i just det här fallet?"])
            ],
            C: [
              pb(["The other 27", "De andra 27"], ["Blocking the four leaves 27 extensions that can read and change every website, none of them ever reviewed. The four are simply the ones already sold. What is your plan for the one that is sold next month?", "Att blockera de fyra lämnar 27 tillägg som kan läsa och ändra varje webbplats, och inget av dem har någonsin granskats. De fyra är bara de som redan har sålts. Vad är er plan för det som säljs nästa månad?"]),
              pb(["One of the four is needed", "Ett av de fyra behövs"], ["One of the four is the tool finance uses every day, and its new owner looks like a respectable company. Finance asks why a legitimate sale is treated as a threat. On what grounds do you block it and not the others?", "Ett av de fyra är verktyget som ekonomi använder varje dag, och den nya ägaren ser ut som ett seriöst företag. Ekonomi frågar varför en legitim försäljning behandlas som ett hot. På vilka grunder blockerar ni det och inte de andra?"]),
              pb(["“We blocked four” is not a policy", "”Vi blockerade fyra” är ingen policy"], ["The auditor asks for your rule on browser extensions after the incident. A list of four names describes what happened, not what you will do next time. What do you write down as the policy?", "Revisorn ber om er regel för webbläsartillägg efter incidenten. En lista med fyra namn beskriver vad som hände, inte vad ni gör nästa gång. Vad skriver ni ner som policy?"])
            ]
          }
        }),
        facilitator: fac(
          ["End on the class of risk: user-installed software with sweeping permissions.", "Avsluta med riskklassen: programvara som användare installerar själva med omfattande behörigheter."],
          ["Allow-list, change alerts, fast request route.", "Lista över tillåtna, larm vid ändringar, snabb väg för förfrågningar."],
          [["Ask: which tool on your own screen can read everything you do?", "Fråga: vilket verktyg på er egen skärm kan läsa allt ni gör?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The extension is gone and the tokens revoked, but customer records left the company and the browsers that let it happen are only now under control.",
        "Tillägget är borta och token återkallade, men kundposter lämnade företaget och webbläsarna som gjorde det möjligt är först nu under kontroll."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Stolen sessions bypass passwords and MFA; resets alone do not end them.", "Stulna sessioner går förbi lösenord och MFA; enbart återställningar avslutar dem inte."]),
        L(["Look for what affected users have in common before treating each one.", "Leta efter vad drabbade användare har gemensamt innan ni åtgärdar var och en."]),
        L(["Persistence like API tokens survives session revocation: hunt for it everywhere.", "Fotfästen som API-token överlever att sessioner återkallas: leta efter dem överallt."]),
        L(["Software that users install themselves needs governance, not trust.", "Programvara som användare installerar själva behöver styrning, inte förtroende."])
      ],
      assumptionsVsReality: [
        avr(["Staff were phished.", "Personalen har blivit nätfiskad."], ["A sold extension stole their sessions.", "Ett sålt tillägg stal deras sessioner."], "p2"),
        avr(["A CRM incident.", "En incident i CRM-systemet."], ["Banking, cloud admin and HR were reached too.", "Även bank, molnadministration och HR nåddes."], "p4"),
        avr(["One bad extension.", "Ett dåligt tillägg."], ["31 others can read every website.", "31 andra kan läsa varje webbplats."], "p6")
      ],
      strengthsToLookFor: [
        L(["Revoking sessions rather than only resetting passwords", "Att återkalla sessioner i stället för att bara återställa lösenord"]),
        L(["Finding the common factor across users", "Att hitta den gemensamma faktorn bland användarna"]),
        L(["Revoking API tokens and app grants in every reached system", "Att återkalla API-token och appbehörigheter i varje system som nåtts"])
      ],
      commonGaps: [
        L(["Assuming phishing and stopping at resets", "Att anta nätfiske och nöja sig med återställningar"]),
        L(["Not knowing browsers are unmanaged", "Att inte veta att webbläsarna inte styrs"]),
        L(["Missing persistence created with the stolen sessions", "Att missa fotfästen som skapats med de stulna sessionerna"])
      ],
      suggestedActions: [
        act(["Manage browsers centrally with an extension allow-list.", "Styr webbläsarna centralt med en lista över tillåtna tillägg."], "itOps", "high"),
        act(["Shorten session lifetimes and bind sessions to devices where possible.", "Korta sessionernas livslängd och knyt sessioner till enheter där det går."], "ciso", "high"),
        act(["Inventory and review API tokens and app grants in core systems.", "Inventera och granska API-token och appbehörigheter i kärnsystemen."], "serviceOwner", "medium"),
        act(["Separate work and personal browser profiles.", "Separera jobb- och privatprofiler i webbläsarna."], "cio", "medium")
      ]
    }
  });
})();
