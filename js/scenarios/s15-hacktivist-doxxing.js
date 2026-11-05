/*
 * s15-hacktivist-doxxing.js — "Defaced and Exposed" (archetype F, hacktivism).
 *
 * Reputational and human first: the website is defaced over a public decision
 * → it came in through a contractor's publishing account → staff personal data
 * is published, with threats → public e-services are flooded → the police take
 * the lead on threats → the data came from a directory export shared with the
 * contractor → a second wave is announced for the day of the vote.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s15-hacktivist-doxxing",
    version: 1,
    category: "hacktivism",
    archetype: "human-legal-reputational",
    emblem: "hacktivist",
    title: L(["Defaced and Exposed", "Vandaliserad och utlämnad"]),
    summary: L([
      "A group angry about a public decision defaces your website. Then they publish the home addresses of the staff behind the decision.",
      "En grupp som är arg över ett offentligt beslut vandaliserar er webbplats. Sedan publicerar de hemadresserna till personalen bakom beslutet."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Protect staff when an attack becomes personal", "Skydda personalen när ett angrepp blir personligt"]), teaser: L(["When it gets personal", "När det blir personligt"]) },
      { id: "lo2", text: L(["Restore public services under pressure", "Återställa offentliga tjänster under press"]), teaser: L(["Serving the public under pressure", "Att tjäna allmänheten under press"]) },
      { id: "lo3", text: L(["Work with the police on threats", "Samarbeta med polisen kring hot"]), teaser: L(["Working with outside bodies", "Att samarbeta med aktörer utanför"]) },
      { id: "lo4", text: L(["Communicate without amplifying the attackers", "Kommunicera utan att förstärka angriparnas budskap"]), teaser: L(["Choosing your words", "Att välja sina ord"]) }
    ],
    mitre: ["T1491.002", "T1078", "T1498", "T1589", "T1213", "T1199"],
    frameworks: {
      nistCsf: ["GV.SC", "GV.RR", "PR.AA", "PR.DS", "RS.CO", "RS.MA", "RS.MI", "RC.CO"],
      iso27001: ["A.5.19", "A.5.20", "A.5.24", "A.5.26", "A.5.34", "A.6.3", "A.7.11", "A.8.20"]
    },
    minStages: 3,
    maxStages: 7,
    constraints: { startWindow: "business-hours", sectors: ["public", "energy", "transport", "utilities", "education"] },
    actor: { types: ["hacktivist"], motivation: L(["Ideological: opposition to a public decision", "Ideologisk: motstånd mot ett offentligt beslut"]), capability: "low" },
    variables: {
      staffDoxxed: { min: 8, max: 60 },
      threats: { min: 5, max: 120 },
      gbps: { min: 4, max: 60 },
      followers: { min: 3000, max: 90000 },
      daysToVote: { min: 3, max: 9 }
    },
    roles: ["comms", "hr", "securityOfficer", "ciso", "itOps", "incidentCommander", "ceo", "legal", "dpo", "supplierManager", "networkLead"],

    groundTruth: {
      rootCause: L([
        "A hacktivist group opposed to a public decision by {{org.name}} used a web contractor's publishing account, whose password had leaked in an unrelated breach, to deface the website. The staff details they published came from a staff-directory export that had been shared with the contractor for a redesign. The flood of traffic was rented.",
        "En hacktivistgrupp som motsätter sig ett offentligt beslut av {{org.name}} använde ett publiceringskonto hos en webbkonsult, vars lösenord hade läckt i ett annat intrång, för att vandalisera webbplatsen. Personaluppgifterna de publicerade kom från en export av personalkatalogen som hade delats med konsulten inför en omgörning av webbplatsen. Trafikfloden var hyrd."
      ]),
      attackerTimeline: [
        { at: -43200, text: L(["Staff-directory export shared with the web contractor.", "En export av personalkatalogen delas med webbkonsulten."]) },
        { at: -20160, text: L(["Contractor's password appears in an unrelated breach.", "Konsultens lösenord dyker upp i ett annat intrång."]) },
        { at: -2880, text: L(["Group logs in to the publishing tool and finds the export.", "Gruppen loggar in i publiceringsverktyget och hittar exporten."]) },
        { at: 0, text: L(["Website defaced.", "Webbplatsen vandaliseras."]) },
        { at: 240, text: L(["Staff details posted.", "Personaluppgifter publiceras."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-cms", revealStage: "p2", text: L(["The defacement used a web contractor's publishing account.", "Vandaliseringen gjordes via ett publiceringskonto hos en webbkonsult."]) },
      { id: "hf-dox", revealStage: "p3", text: L(["Home addresses and phone numbers of staff are being published.", "Hemadresser och telefonnummer till personal publiceras."]) },
      { id: "hf-export", revealStage: "p6", text: L(["The staff data came from a directory export shared with the contractor.", "Personaluppgifterna kom från en export av personalkatalogen som delats med konsulten."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Our front page, their message", "Vår startsida, deras budskap"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. Yesterday {{org.name}} announced a contested public decision, and the reaction online was angry. This morning the front page of the website changes.\n\nScreenshots are spreading fast: your logo has been replaced with a group's symbol and a message to the people who made the decision. The public e-services still work. A local reporter is already asking whether citizens' data is safe.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. I går tillkännagav {{org.name}} ett omstritt offentligt beslut, och reaktionerna på nätet var arga. I dag ändras webbplatsens förstasida.\n\nSkärmbilder sprids snabbt: er logotyp har ersatts av en grupps symbol och ett meddelande till dem som fattade beslutet. De offentliga e-tjänsterna fungerar fortfarande. En lokalreporter frågar redan om medborgarnas uppgifter är säkra."
        ]),
        injects: [
          inj("i1-1", 0, "socialPost", "socialMedia", "high", "confirmed", [
            "Screenshots are spreading: your front page now shows {{actor.name}}'s logo and “You decided without us. Now we decide.”",
            "Skärmbilder sprids: er startsida visar nu logotypen för {{actor.name}} och texten ”Ni beslutade utan oss. Nu beslutar vi.”"
          ], { headline: ["Website defaced", "Webbplatsen vandaliserad"], tests: ["lo2", "lo4"] }),
          inj("i1-2", 10, "ticket", "serviceDesk", "medium", "confirmed", [
            "The public e-services are still working. Only the content pages are changed.",
            "De offentliga e-tjänsterna fungerar fortfarande. Bara innehållssidorna är ändrade."
          ], { tests: ["lo2"] }),
          inj("i1-3", 25, "mediaEnquiry", "media", "medium", "confirmed", [
            "A local reporter: “Have you been hacked because of the decision? Is citizens' data safe?”",
            "En lokalreporter: ”Har ni blivit hackade på grund av beslutet? Är medborgarnas uppgifter säkra?”"
          ], { pressure: "media", substitute: { source: "customer", content: ["Citizens call the switchboard asking whether their data is safe.", "Medborgare ringer växeln och frågar om deras uppgifter är säkra."] }, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How did they change the pages, and is that path still open?", "Hur ändrade de sidorna, och är den vägen fortfarande öppen?", ["itOps"]),
            q("Do you restore now or preserve evidence first?", "Återställer ni nu eller säkrar ni spår först?", ["itOps", "ciso"]),
            q("Are the e-services and their data separate from the content pages?", "Är e-tjänsterna och deras data åtskilda från innehållssidorna?", ["itOps", "networkLead"])
          ],
          executive: [
            q("What do you say publicly, and do you name the group?", "Vad säger ni offentligt, och nämner ni gruppen vid namn?", ["comms", "ceo"]),
            q("Is anyone at personal risk because of the decision?", "Är någon personligen i fara på grund av beslutet?", ["securityOfficer", "hr"]),
            q("Who leads: comms, IT or security?", "Vem leder: kommunikation, IT eller säkerhet?", ["incidentCommander"])
          ]
        },
        challenges: [ch("Every hour the page stays up, more screenshots spread.", "För varje timme sidan ligger kvar sprids fler skärmbilder.")],
        decision: dec("d1", "incidentCommander", ["What do you do first?", "Vad gör ni först?"], [
          ["Take the content pages offline, preserve evidence, restore from a clean copy and issue a short factual statement.", "Ta ned innehållssidorna, säkra spår, återställ från en ren kopia och gå ut med ett kort sakligt uttalande."],
          ["Restore the pages from a backup at once and let the clean site speak for itself.", "Återställ sidorna från en säkerhetskopia direkt och låt den rena webbplatsen tala för sig själv."],
          ["Leave the defaced page up for an hour, so the police can capture it exactly as it is.", "Låt den vandaliserade sidan ligga kvar en timme, så att polisen kan säkra den precis som den är."]
        ], {
          knowns: [["Content pages are defaced.", "Innehållssidorna är vandaliserade."], ["E-services still work.", "E-tjänsterna fungerar fortfarande."]],
          uncertainties: [["How they got in.", "Hur de tog sig in."]],
          tradeoffs: {
            operational: ["Taking pages offline removes public information.", "Att ta ned sidorna tar bort offentlig information."],
            security: ["Restoring without knowing the path invites a repeat.", "Att återställa utan att känna till vägen bjuder in till en upprepning."],
            legal: ["Public bodies must keep certain information available.", "Offentliga organ måste hålla viss information tillgänglig."],
            reputational: ["Silence lets the attackers tell the story.", "Tystnad låter angriparna berätta historien."]
          },
          evaluation: [["Preserves evidence while removing the defacement", "Säkrar spår och tar samtidigt bort vandaliseringen"]],
          pushback: {
            A: [
              pb(["The decision page is gone", "Beslutssidan är borta"], ["Residents searching for facts about yesterday's decision now find nothing at all. A councillor calls: taking the pages down makes it look as if you are hiding the decision itself. Do you bring the pages back before you know how they were changed?", "Invånare som söker fakta om gårdagens beslut hittar nu ingenting alls. En förtroendevald ringer: att ta ned sidorna får det att se ut som om ni gömmer själva beslutet. Lägger ni tillbaka sidorna innan ni vet hur de ändrades?"]),
              pb(["Which copy is clean?", "Vilken kopia är ren?"], ["IT cannot say when the attackers first got in, so nobody knows whether last night's backup is clean. An older copy would lose a week of published updates, including yesterday's decision. Which copy do you trust, and on what grounds?", "IT kan inte säga när angriparna först tog sig in, så ingen vet om nattens säkerhetskopia är ren. En äldre kopia skulle förlora en veckas publicerade uppdateringar, inklusive gårdagens beslut. Vilken kopia litar ni på, och varför?"]),
              pb(["“So is our data safe?”", "”Är våra uppgifter säkra, alltså?”"], ["The reporter reads your short statement back to you: “So you can't say whether citizens' data is safe?” A factual statement cannot yet answer the one question people are asking. Do you say the e-services are unaffected before anyone has confirmed it?", "Reportern läser upp ert korta uttalande: ”Så ni kan inte säga om medborgarnas uppgifter är säkra?” Ett sakligt uttalande kan ännu inte besvara den enda fråga folk ställer. Säger ni att e-tjänsterna är opåverkade innan någon har bekräftat det?"])
            ],
            B: [
              pb(["“Restore all you like”", "”Återställ hur mycket ni vill”"], ["Minutes after the clean pages go live, the group posts: “Restore all you like. We still have the keys.” You do not know how they got in, so you cannot say they are wrong. Do you keep the site up, or take it down until you know?", "Några minuter efter att de rena sidorna är uppe skriver gruppen: ”Återställ hur mycket ni vill. Vi har fortfarande nycklarna.” Ni vet inte hur de tog sig in, så ni kan inte säga att de har fel. Låter ni webbplatsen ligga uppe, eller tar ni ned den tills ni vet?"]),
              pb(["The evidence is overwritten", "Spåren är överskrivna"], ["The police ask for the defaced pages and the server state as they were. The restore overwrote both, and all you have left are screenshots taken by strangers. Do you tell the police that, and do you stop restoring anything else until evidence is secured?", "Polisen ber om de vandaliserade sidorna och serverns tillstånd som de var. Återställningen skrev över båda, och det enda ni har kvar är skärmbilder tagna av okända. Berättar ni det för polisen, och slutar ni återställa något mer tills spåren är säkrade?"]),
              pb(["The silence becomes the story", "Tystnaden blir nyheten"], ["The local paper runs “Council silent after hack”. The group's screenshots are now the only version people have seen. Do you make a statement after all, which admits there was something to fix?", "Lokaltidningen publicerar ”Kommunen tyst efter hackerangrepp”. Gruppens skärmbilder är nu den enda version folk har sett. Går ni ut med ett uttalande ändå, vilket erkänner att det fanns något att rätta?"])
            ],
            C: [
              pb(["An hour of screenshots", "En timme av skärmbilder"], ["Twenty minutes in, the screenshots have been shared thousands of times and a national outlet has picked up the story. The page is still up, on your own domain. Is the rest of the hour worth it?", "Efter tjugo minuter har skärmbilderna delats tusentals gånger och en riksmedia har plockat upp nyheten. Sidan ligger fortfarande kvar, på er egen domän. Är resten av timmen värd det?"]),
              pb(["The police didn't ask", "Polisen bad inte om det"], ["The police duty officer says screenshots and server logs are enough, and they never asked for the page to stay up. The hour was your own idea. Do you end it now, and who explains why it was up so long?", "Polisens vakthavande säger att skärmbilder och serverloggar räcker, och att de aldrig bad om att sidan skulle ligga kvar. Timmen var er egen idé. Avslutar ni den nu, och vem förklarar varför den låg uppe så länge?"]),
              pb(["A message aimed at us", "Ett budskap riktat mot oss"], ["Staff who worked on the decision ask HR why their own employer is still showing a message aimed at them on its front page. They feel exposed. Do you cut the hour short against your own plan, and what do you say to them?", "Medarbetare som arbetade med beslutet frågar HR varför deras egen arbetsgivare fortfarande visar ett budskap riktat mot dem på sin startsida. De känner sig utpekade. Avbryter ni timmen i förtid mot er egen plan, och vad säger ni till dem?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Pages offline", "Sidorna nedtagna"], [
              io(["Evidence secured", "Spåren säkrade"], ["IT has a full copy of the defaced pages and the server state from before the restore. The police duty officer says it is exactly what they need, and the clean site is back up.", "IT har en fullständig kopia av de ändrade sidorna och serverns tillstånd från före återställningen. Polisens vakthavande säger att det är precis vad de behöver, och den rena webbplatsen är uppe igen."], ["A full copy of the defaced site and server state is preserved.", "En fullständig kopia av den vandaliserade webbplatsen och serverns tillstånd är säkrad."]),
              io(["A week-old copy", "En vecka gammal kopia"], ["The only copy IT trusts as clean is a week old. The restored site is missing a week of updates, including yesterday's decision, and a councillor calls to ask why the council is hiding it.", "Den enda kopia som IT litar på som ren är en vecka gammal. Den återställda webbplatsen saknar en veckas uppdateringar, inklusive gårdagens beslut, och en förtroendevald ringer och frågar varför kommunen gömmer det."], ["The restored site lacks a week of updates, including the decision page.", "Den återställda webbplatsen saknar en veckas uppdateringar, inklusive beslutssidan."], { meters: { trust: -1 } }),
              io(["Read two ways", "Läses på två sätt"], ["The local paper runs your statement under “Council website offline after attack”. Residents read it as if the e-services are down too, and the switchboard fills with calls asking whether they can still apply.", "Lokaltidningen publicerar ert uttalande under rubriken ”Kommunens webbplats nere efter angrepp”. Invånarna läser det som att även e-tjänsterna ligger nere, och växeln fylls av samtal från folk som undrar om de fortfarande kan ansöka."], ["Some residents believe all e-services are down.", "En del invånare tror att alla e-tjänster ligger nere."])
            ]),
            ir("i2", { notChosen: "A" }, ["No preserved, clean restore", "Ingen säkrad, ren återställning"], [
              io(["The story fades", "Nyheten klingar av"], ["By lunchtime the reporter has moved on to another story, and the screenshots are shared less. It looks as if the whole thing will blow over.", "Vid lunch har reportern gått vidare till en annan nyhet, och skärmbilderna delas mindre. Det ser ut som om det hela kommer att blåsa över."], ["The local reporter has moved on, for now.", "Lokalreportern har gått vidare, för tillfället."]),
              io(["“We still have the keys”", "”Vi har fortfarande nycklarna”"], ["The group posts: “Change what you like. We can come back whenever we want.” Nobody in the room can say how they got in, so nobody can say they are wrong.", "Gruppen skriver: ”Ändra vad ni vill. Vi kan komma tillbaka när vi vill.” Ingen i rummet kan säga hur de tog sig in, så ingen kan säga att de har fel."], ["The group claims it can still change the site at will.", "Gruppen påstår att den fortfarande kan ändra webbplatsen när den vill."], { reopen: true }),
              io(["National pick-up", "Riksmedia tar upp det"], ["A national outlet runs the story, illustrated only with the group's screenshots. Your side of it does not appear anywhere.", "En riksmedia tar upp nyheten, illustrerad enbart med gruppens skärmbilder. Er version syns ingenstans."], ["A national outlet is running the group's screenshots.", "En riksmedia publicerar gruppens skärmbilder."], { meters: { media: 1 } })
            ])
          ]
        }),
        facilitator: fac(
          ["It looks like a website problem. It isn't only that.", "Det ser ut som ett webbplatsproblem. Det är inte bara det."],
          ["Defacement removed with evidence preserved and a calm statement.", "Vandaliseringen borttagen med spåren säkrade och ett lugnt uttalande."],
          [["Ask: does naming the group help them?", "Fråga: hjälper det gruppen om ni nämner dem vid namn?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 90,
        title: L(["Through the contractor", "Via konsulten"]),
        twist: L(["The pages were changed through a web contractor's publishing account, not a flaw in your site.", "Sidorna ändrades via ett publiceringskonto hos en webbkonsult, inte genom en brist i er webbplats."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the pages were taken offline, residents could not reach the council's information about the decision for half a day.", sv: "Eftersom sidorna togs ner kunde invånarna inte nå kommunens information om beslutet under en halv dag." } }
        ],
        assumptionChallenged: L(["The attackers exploited the website.", "Angriparna utnyttjade webbplatsen."]),
        reveals: ["hf-cms"],
        narrative: L([
          "{{time.T+90|clock}}. The defaced pages have been taken down and the original content restored. Now the team reviews the publishing tool's audit log to see how the changes were made.\n\nEveryone expected a technical flaw in the website. The log points somewhere else: to someone who was allowed to publish.",
          "Klockan {{time.T+90|clock}}. De ändrade sidorna har tagits ned och det ursprungliga innehållet är återställt. Nu går teamet igenom publiceringsverktygets granskningslogg för att se hur ändringarna gjordes.\n\nAlla väntade sig en teknisk brist i webbplatsen. Loggen pekar någon annanstans: på någon som hade behörighet att publicera."
        ]),
        injects: [
          inj("i2-1", 90, "authLog", "itOps", "high", "confirmed", [
            "The changes were made by the account of the agency that maintains the site, from {{asset.attackerIp}}. The account has no MFA and access to all pages and the file library.",
            "Ändringarna gjordes med kontot för byrån som förvaltar webbplatsen, från {{asset.attackerIp}}. Kontot saknar MFA och har åtkomst till alla sidor och filbiblioteket."
          ], { headline: ["Contractor account used", "Konsultens konto användes"], reveals: ["hf-cms"], tests: ["lo2"] }),
          inj("i2-2", 110, "phoneTranscript", "supplier", "medium", "confirmed", [
            "The agency: “That's a shared login for our team. We'll change the password. Nobody here did this.”",
            "Byrån: ”Det är en gemensam inloggning för vårt team. Vi byter lösenordet. Ingen här har gjort det.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What is in the file library the account could reach?", "Vad finns i filbiblioteket som kontot kunde nå?", ["itOps"]),
            q("Which other contractor accounts lack MFA?", "Vilka andra konsultkonton saknar MFA?", ["itOps", "ciso"]),
            q("Did your restore close this path?", "Stängde er återställning den här vägen?", ["itOps"], "d1")
          ],
          executive: [
            q("What does the contract say about the agency's security?", "Vad säger avtalet om byråns säkerhet?", ["supplierManager", "legal"]),
            q("Do you suspend the agency's access entirely?", "Stänger ni av byråns åtkomst helt?", ["supplierManager"]),
            q("Was your first statement accurate, given this?", "Var ert första uttalande korrekt, med tanke på det här?", ["comms"], "d1")
          ]
        },
        challenges: [ch("The agency is the only one who knows how to run the site.", "Byrån är den enda som vet hur webbplatsen sköts.")],
        decision: dec("d2", "ciso", ["What do you do with contractor access?", "Vad gör ni med konsultens åtkomst?"], [
          ["Disable the shared account, require named accounts with MFA and review what it could reach.", "Spärra det gemensamma kontot, kräv namngivna konton med MFA och granska vad det kunde nå."],
          ["Let the agency change the password.", "Låt byrån byta lösenordet."],
          ["Remove the agency's access until the contract is reviewed.", "Ta bort byråns åtkomst tills avtalet är granskat."]
        ], {
          knowns: [["A shared, MFA-less contractor account was used.", "Ett gemensamt konsultkonto utan MFA användes."]],
          uncertainties: [["What else the account reached.", "Vad mer kontot nådde."]],
          tradeoffs: {
            operational: ["Removing the agency leaves the site unmaintained.", "Att ta bort byrån lämnar webbplatsen utan förvaltning."],
            security: ["A password change on a shared login fixes little.", "Ett lösenordsbyte på en gemensam inloggning löser lite."],
            legal: ["The contract may not require MFA.", "Avtalet kanske inte kräver MFA."],
            reputational: ["Blaming the contractor publicly looks evasive.", "Att offentligt skylla på konsulten ser undanglidande ut."]
          },
          evaluation: [["Fixes the access model, not just the password", "Rättar åtkomstmodellen, inte bara lösenordet"]],
          pushback: {
            A: [
              pb(["No one can publish", "Ingen kan publicera"], ["Without the shared login, the agency cannot publish the corrected information about the decision today. Setting up named accounts with MFA will take them several days. Do you allow a temporary exception for the account that was just abused?", "Utan den gemensamma inloggningen kan byrån inte publicera den rättade informationen om beslutet i dag. Att sätta upp namngivna konton med MFA tar dem flera dagar. Ger ni ett tillfälligt undantag för kontot som just missbrukades?"]),
              pb(["“Who pays for this?”", "”Vem betalar för det här?”"], ["The agency's manager says the contract never required named accounts or MFA, and asks who pays for the change. They hint that the work will be invoiced as extra. Do you pay, push back on the contract, or accept the delay?", "Byråns chef säger att avtalet aldrig krävde namngivna konton eller MFA, och frågar vem som betalar för ändringen. Hen antyder att arbetet kommer att faktureras som extra. Betalar ni, bråkar ni om avtalet eller accepterar ni förseningen?"]),
              pb(["A review of everything", "En granskning av allt"], ["The file library holds years of uploads, and nobody knows who put most of them there. Reviewing it properly will take someone days you do not have. What do you look at first, and what are you prepared to leave unchecked?", "Filbiblioteket innehåller år av uppladdningar, och ingen vet vem som lade dit det mesta. En ordentlig granskning tar dagar som ni inte har. Vad tittar ni på först, och vad är ni beredda att lämna ogranskat?"])
            ],
            B: [
              pb(["Same login, new password", "Samma inloggning, nytt lösenord"], ["The agency confirms the new password has been shared with their whole team, in the same group chat as before. Nobody can say how many people now hold it. Do you still count the path as closed?", "Byrån bekräftar att det nya lösenordet har delats med hela deras team, i samma gruppchatt som förut. Ingen kan säga hur många som nu har det. Räknar ni fortfarande vägen som stängd?"]),
              pb(["What did it already do?", "Vad har det redan gjort?"], ["Your security officer points out that a new password says nothing about what the account already did with access to every page and the file library. Nobody has looked yet. Do you call this fixed without a review?", "Er säkerhetschef påpekar att ett nytt lösenord inte säger något om vad kontot redan har gjort med åtkomst till alla sidor och filbiblioteket. Ingen har tittat än. Kallar ni det här åtgärdat utan en granskning?"]),
              pb(["“Do you require MFA?”", "”Kräver ni MFA?”"], ["The reporter has heard the pages were changed with a contractor's login, and asks whether you require two-step login from suppliers. The honest answer is still no. What do you say, given that you have only changed a password?", "Reportern har hört att sidorna ändrades med en konsults inloggning och frågar om ni kräver tvåstegsinloggning av leverantörer. Det ärliga svaret är fortfarande nej. Vad säger ni, när ni bara har bytt ett lösenord?"])
            ],
            C: [
              pb(["A site with no keeper", "En webbplats utan förvaltare"], ["The decision page needs updating today, and the agency is the only one who knows how the site is built. Your own web editor can change text but not fix anything else. Who keeps the site running for the weeks the contract review will take?", "Beslutssidan behöver uppdateras i dag, och byrån är den enda som vet hur webbplatsen är byggd. Er egen webbredaktör kan ändra text men inte rätta något annat. Vem håller webbplatsen igång under de veckor avtalsgranskningen tar?"]),
              pb(["The agency walks away", "Byrån drar sig ur"], ["The agency says cutting their access breaches the contract, and that they will stop all work and invoice for standby until it is restored. They also deny any fault. Do you hold your line or back down?", "Byrån säger att det strider mot avtalet att stänga deras åtkomst, och att de stoppar allt arbete och fakturerar för beredskap tills den är återställd. De förnekar också allt ansvar. Står ni fast eller backar ni?"]),
              pb(["Contract or login?", "Avtalet eller inloggningen?"], ["Removing the agency does not explain how its password got out. Your IT lead asks whether other suppliers use the same kind of shared login without MFA. Is this really a contract problem, or one you will find again with the next supplier?", "Att ta bort byrån förklarar inte hur deras lösenord kom ut. Er IT-ansvarige frågar om andra leverantörer använder samma typ av gemensam inloggning utan MFA. Är det här verkligen ett avtalsproblem, eller ett ni kommer att hitta igen hos nästa leverantör?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Shared login disabled", "Gemensam inloggning spärrad"], [
              io(["A clean first pass", "En ren första genomgång"], ["The first pass over the account's recent activity finds nothing beyond the defaced pages. The agency is already setting up named accounts with MFA.", "Den första genomgången av kontots senaste aktivitet hittar inget utöver de ändrade sidorna. Byrån håller redan på att sätta upp namngivna konton med MFA."], ["The first pass of the account's recent activity found nothing more.", "Den första genomgången av kontots senaste aktivitet hittade inget mer."]),
              io(["Nobody can publish", "Ingen kan publicera"], ["Without the shared login, nobody can publish the corrected information about the decision today. The agency says named accounts will take days, and asks for a temporary exception.", "Utan den gemensamma inloggningen kan ingen publicera den rättade informationen om beslutet i dag. Byrån säger att namngivna konton tar flera dagar, och ber om ett tillfälligt undantag."], ["The decision page cannot be updated until named accounts exist.", "Beslutssidan kan inte uppdateras förrän det finns namngivna konton."], { reopen: true, meters: { trust: -1 } }),
              io(["A second shared login", "En andra gemensam inloggning"], ["While checking access, IT finds another supplier login with no MFA, shared by a whole team and last used months ago. Nobody knows who still has the password.", "När IT går igenom åtkomsten hittar de ytterligare en leverantörsinloggning utan MFA, delad av ett helt team och senast använd för flera månader sedan. Ingen vet vem som fortfarande har lösenordet."], ["A second shared supplier login without MFA has been found.", "Ytterligare en gemensam leverantörsinloggning utan MFA har hittats."])
            ]),
            ir("i2", { notChosen: "A" }, ["The shared login lives on", "Den gemensamma inloggningen finns kvar"], [
              io(["Nothing new", "Inget nytt"], ["The afternoon passes without any new changes to the site. The agency says the matter is closed on their side.", "Eftermiddagen går utan nya ändringar på webbplatsen. Byrån säger att saken är avslutad från deras sida."], ["No further changes to the site have been seen since the defacement.", "Inga fler ändringar på webbplatsen har setts sedan vandaliseringen."]),
              io(["Someone keeps trying", "Någon fortsätter försöka"], ["The publishing tool logs a string of failed sign-ins on the contractor login from an unknown address abroad. Somebody is still trying the door.", "Publiceringsverktyget loggar en rad misslyckade inloggningsförsök på konsultinloggningen från en okänd adress utomlands. Någon prövar fortfarande dörren."], ["Someone is still trying the contractor login from abroad.", "Någon prövar fortfarande konsultinloggningen från utlandet."], { reopen: true }),
              io(["“Do you require MFA?”", "”Kräver ni MFA?”"], ["The reporter has heard a contractor's login was used, and asks whether you require two-step login from suppliers. The honest answer is no, and it will be in tomorrow's paper.", "Reportern har hört att en konsults inloggning användes och frågar om ni kräver tvåstegsinloggning av leverantörer. Det ärliga svaret är nej, och det kommer att stå i morgondagens tidning."], ["A reporter knows supplier accounts had no two-step login.", "En reporter vet att leverantörskontona saknade tvåstegsinloggning."], { meters: { media: 1 } })
            ])
          ]
        }),
        facilitator: fac(
          ["Third parties hold your keys. Ask what the account could see.", "Tredje parter har era nycklar. Fråga vad kontot kunde se."],
          ["Named, MFA-protected contractor accounts and a review of exposure.", "Namngivna konsultkonton med MFA och en granskning av exponeringen."],
          [["Ask: what else is in that file library?", "Fråga: vad mer finns i det filbiblioteket?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 240,
        title: L(["Names and addresses", "Namn och adresser"]),
        twist: L(["The group publishes names, home addresses and phone numbers of {{num.staffDoxxed}} staff linked to the decision. Threats follow.", "Gruppen publicerar namn, hemadresser och telefonnummer till {{num.staffDoxxed}} anställda med koppling till beslutet. Hot följer."]),
        twistKind: "scope",
        reconsider: { decision: "d1", pressure: { en: "Staff names and home addresses are now public. Whatever you said, or did not say, on the first day is being quoted by the group.", sv: "Personalens namn och hemadresser är nu offentliga. Det ni sa, eller inte sa, den första dagen citeras nu av gruppen." } },
        assumptionChallenged: L(["This is about the website.", "Det här handlar om webbplatsen."]),
        reveals: ["hf-dox"],
        narrative: L([
          "{{time.T+240|clock}}. The website is back to normal and the incident seemed to be winding down. Then an employee calls HR, in tears.\n\nThe group has moved from your website to your people. This is no longer an IT incident or a communication problem; it is about the personal safety of staff and their families.",
          "Klockan {{time.T+240|clock}}. Webbplatsen fungerar normalt igen och incidenten verkade klinga av. Sedan ringer en anställd till HR, i tårar.\n\nGruppen har gått från er webbplats till era medarbetare. Det här är inte längre en IT-incident eller ett kommunikationsproblem; det handlar om personalens och deras familjers personliga säkerhet."
        ]),
        injects: [
          inj("i3-1", 240, "socialPost", "socialMedia", "critical", "confirmed", [
            "{{actor.name}} posts a list: “The people who decided.” Names, home addresses and private phone numbers of {{num.staffDoxxed}} employees. The account has {{num.followers}} followers.",
            "{{actor.name}} publicerar en lista: ”De som bestämde.” Namn, hemadresser och privata telefonnummer till {{num.staffDoxxed}} anställda. Kontot har {{num.followers}} följare."
          ], { headline: ["Staff details published", "Personaluppgifter publicerade"], reveals: ["hf-dox"], tests: ["lo1"] }),
          inj("i3-2", 270, "employeeReport", "employee", "critical", "confirmed", [
            "“Someone just called my private number and said they know where my children go to school.”",
            "”Någon ringde precis mitt privata nummer och sa att de vet var mina barn går i skolan.”"
          ], { tests: ["lo1", "lo3"] })
        ],
        charts: [{
          id: "c3-threats", type: "line",
          title: L(["Threats reported by staff", "Hot som rapporterats av personal"]), unit: L(["reports", "rapporter"]),
          data: line(["Reports", "Rapporter"], 0, 10, 1, (x, ctx) => ctx.vars.threats * Math.min(1, x / 8), "hours")
        }],
        questions: {
          technical: [
            q("Where did these details come from?", "Var kom de här uppgifterna ifrån?", ["ciso", "itOps"]),
            q("Can the posts be taken down, and by whom?", "Kan inläggen tas bort, och av vem?", ["comms", "legal"]),
            q("Did the contractor account reach staff data?", "Nådde konsultkontot personaluppgifter?", ["itOps"], "d2")
          ],
          executive: [
            q("What do you do for the named staff today?", "Vad gör ni för den namngivna personalen i dag?", ["hr", "securityOfficer"]),
            q("Do you report to the police and {{reg.dpaShort}}?", "Anmäler ni till polisen och {{reg.dpaShort}}?", ["legal", "dpo"]),
            q("Does your statement need to change?", "Behöver ert uttalande ändras?", ["comms"], "d1")
          ]
        },
        challenges: [ch("Some named staff are working from home today.", "En del av den namngivna personalen arbetar hemifrån i dag.")],
        decision: dec("d3", "ceo", ["How do you protect the staff?", "Hur skyddar ni personalen?"], [
          ["Contact every named person today, report threats to the police, offer security advice, alternative housing and support.", "Kontakta varje namngiven person i dag, anmäl hoten till polisen och erbjud säkerhetsråd, alternativt boende och stöd."],
          ["Send all staff a general warning and report to the police.", "Skicka en allmän varning till all personal och anmäl till polisen."],
          ["Report to the police and let them advise staff.", "Anmäl till polisen och låt dem ge personalen råd."]
        ], {
          knowns: [["Staff details and threats are public.", "Personaluppgifter och hot är offentliga."]],
          uncertainties: [["Whether anyone will act on the threats.", "Om någon kommer att agera på hoten."]],
          tradeoffs: {
            operational: ["Personal support takes HR and security all day.", "Personligt stöd tar HR och säkerhet hela dagen."],
            security: ["Physical safety now outranks the IT investigation.", "Den fysiska säkerheten väger nu tyngre än IT-utredningen."],
            legal: ["The employer has a duty of care.", "Arbetsgivaren har ett omsorgsansvar."],
            reputational: ["Staff will remember how they were treated.", "Personalen kommer att minnas hur de blev bemötta."]
          },
          evaluation: [["Personal contact and practical protection for each named person", "Personlig kontakt och praktiskt skydd för varje namngiven person"]],
          minutes: 10,
          pushback: {
            A: [
              pb(["Not enough hands", "För få händer"], ["HR and security have a handful of people for {{num.staffDoxxed}} named staff. Some are on leave, some do not answer, and by evening only half have been reached. Who goes without a call tonight, and who decides the order?", "HR och säkerhet har en handfull personer för {{num.staffDoxxed}} namngivna anställda. Några är lediga, några svarar inte, och till kvällen har bara hälften nåtts. Vem blir utan samtal i kväll, och vem bestämmer ordningen?"]),
              pb(["Where housing ends", "Var boendet tar slut"], ["Finance asks how long alternative housing will last and who qualifies. One employee wants to move the whole family for weeks; another refuses to leave home at all. Where do you draw the line, and who tells them?", "Ekonomi frågar hur länge det alternativa boendet ska gälla och vem som har rätt till det. En anställd vill flytta hela familjen i flera veckor; en annan vägrar lämna hemmet. Var drar ni gränsen, och vem säger det till dem?"]),
              pb(["“What about us?”", "”Och vi då?”"], ["Colleagues who also worked on the decision, but are not on the list, ask why they get nothing. They expect to be next. Do you widen the support to people who have not been named, and can you afford to?", "Kollegor som också arbetade med beslutet, men som inte står på listan, frågar varför de inte får något. De räknar med att stå på tur. Utvidgar ni stödet till personer som inte har namngetts, och har ni råd med det?"])
            ],
            B: [
              pb(["The warning spreads the list", "Varningen sprider listan"], ["After your all-staff warning, people go looking for the list to see if they are on it. Links to it now circulate in internal chats. Did your warning just spread the addresses further, and how do you stop it?", "Efter er varning till all personal letar folk upp listan för att se om de står med. Länkar till den cirkulerar nu i interna chattar. Spred er varning just adresserna vidare, och hur stoppar ni det?"]),
              pb(["“Same email as everyone”", "”Samma mejl som alla andra”"], ["A named employee writes: “I got the same email as everyone else. Nobody has called me, and my address is online.” The union asks the same question an hour later. Do you change your approach while the threats are still coming?", "En namngiven anställd skriver: ”Jag fick samma mejl som alla andra. Ingen har ringt mig, och min adress finns på nätet.” Facket ställer samma fråga en timme senare. Ändrar ni ert sätt att agera medan hoten fortfarande kommer?"]),
              pb(["A car outside", "En bil utanför"], ["A named employee working from home reports a car that has been parked outside for an hour. The general warning gave them no number to call and nothing to do. Who do they call now, and what does that say about your plan?", "En namngiven anställd som arbetar hemifrån rapporterar en bil som har stått parkerad utanför i en timme. Den allmänna varningen gav ingen att ringa och inget att göra. Vem ringer hen nu, och vad säger det om er plan?"])
            ],
            C: [
              pb(["The police are queued", "Polisen har kö"], ["The police confirm your report but say they cannot contact individual staff today. Advice will come within a few days. Who protects the named staff tonight?", "Polisen bekräftar er anmälan men säger att de inte kan kontakta enskilda anställda i dag. Råd kommer inom några dagar. Vem skyddar den namngivna personalen i natt?"]),
              pb(["Duty of care stays with you", "Omsorgsansvaret är ert"], ["Legal reminds you that the employer's duty of care does not pass to the police because you filed a report. If something happens tonight, it is your name on the decision. Do you still leave the staff to the police?", "Juristerna påminner om att arbetsgivarens omsorgsansvar inte går över till polisen för att ni har gjort en anmälan. Om något händer i natt är det ert namn på beslutet. Låter ni fortfarande polisen sköta personalen?"]),
              pb(["The second call", "Det andra samtalet"], ["The employee who called HR in tears calls again: “Is anyone from work going to contact me?” Hours have passed and nobody has. What does the employer's silence tell them?", "Den anställda som ringde HR i tårar ringer igen: ”Kommer någon från jobbet att höra av sig?” Timmar har gått och ingen har gjort det. Vad säger arbetsgivarens tystnad till hen?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Every named person called", "Varje namngiven person kontaktad"], [
              io(["The calls land", "Samtalen tas emot väl"], ["By evening most of the named staff have had a personal call. Several say it mattered more than anything else the employer has done, and they now know whom to ring.", "Till kvällen har de flesta av de namngivna fått ett personligt samtal. Flera säger att det betydde mer än något annat arbetsgivaren har gjort, och de vet nu vem de ska ringa."], ["Most named staff have had a personal call and know whom to ring.", "De flesta namngivna har fått ett personligt samtal och vet vem de ska ringa."]),
              io(["Housing without end", "Boende utan slut"], ["More families accept alternative housing tonight than anyone planned for. Finance asks who approved it, for how long, and who qualifies next.", "Fler familjer tackar ja till alternativt boende i natt än någon hade räknat med. Ekonomi frågar vem som godkände det, hur länge det gäller och vem som har rätt till det härnäst."], ["Several families are in alternative housing with no end date set.", "Flera familjer bor i alternativt boende utan något slutdatum."]),
              io(["One doesn't answer", "En svarar inte"], ["One named employee working from home has not answered calls or messages all afternoon. It may be nothing, or it may not.", "En namngiven anställd som arbetar hemifrån har inte svarat på samtal eller meddelanden under hela eftermiddagen. Det kan vara ingenting, eller så är det inte det."], ["One named employee could not be reached during the afternoon.", "En namngiven anställd gick inte att nå under eftermiddagen."])
            ]),
            ir("i2", { notChosen: "A" }, ["No personal contact", "Ingen personlig kontakt"], [
              io(["Patrols promised", "Utlovade patruller"], ["The police promise extra patrols near the most exposed addresses tonight. It sounds like the staff are covered.", "Polisen lovar extra patrullering nära de mest utsatta adresserna i natt. Det låter som att personalen är skyddad."], ["The police have promised extra patrols near the most exposed addresses.", "Polisen har lovat extra patrullering nära de mest utsatta adresserna."]),
              io(["The union steps in", "Facket kliver in"], ["The union tells its members that the employer has not called a single named person, and opens its own helpline. Named staff start calling the union instead of you.", "Facket meddelar sina medlemmar att arbetsgivaren inte har ringt en enda namngiven person, och öppnar en egen stödlinje. Namngiven personal börjar ringa facket i stället för er."], ["The union runs its own helpline for named staff.", "Facket har en egen stödlinje för den namngivna personalen."], { reopen: true, meters: { trust: -1 } }),
              io(["A car outside", "En bil utanför"], ["A named employee working from home reports a car that has been parked outside for an hour. It could be a neighbour's visitor. They have nobody at work to ask.", "En namngiven anställd som arbetar hemifrån rapporterar en bil som har stått parkerad utanför i en timme. Det kan vara en grannes besökare. Hen har ingen på jobbet att fråga."], ["A named employee reported an unknown car outside their home.", "En namngiven anställd har rapporterat en okänd bil utanför sitt hem."])
            ])
          ]
        }),
        facilitator: fac(
          ["The crisis is now about people's safety. Slow the room down.", "Krisen handlar nu om människors säkerhet. Sänk tempot i rummet."],
          ["Each named person contacted with practical protection, and threats reported.", "Varje namngiven person kontaktad med praktiskt skydd, och hoten anmälda."],
          [["Ask: what would you need if your address was on that list?", "Fråga: vad skulle ni behöva om er adress stod på den listan?"]]
        )
      },
      {
        id: "p4",
        priority: 1,
        clock: 480,
        title: L(["E-services down", "E-tjänsterna ligger nere"]),
        twist: L(["A traffic flood of {{num.gbps}} Gbit/s takes down the public e-services.", "En trafikflod på {{num.gbps}} Gbit/s slår ut de offentliga e-tjänsterna."]),
        twistKind: "impact",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because every named person was contacted today, the group posts that the council protects its decision-makers, not its residents.", sv: "Eftersom varje namngiven person kontaktades i dag skriver gruppen att kommunen skyddar sina beslutsfattare, inte sina invånare." } }
        ],
        assumptionChallenged: L(["The e-services are not a target.", "E-tjänsterna är inte en måltavla."]),
        narrative: L([
          "{{time.T+480|clock}}. While HR and security deal with the threats, a new problem appears on the public side.\n\nCitizens cannot book, apply or pay: the e-services are unreachable, and so is the call-back system the switchboard uses. People who need the services today have no way to reach you.",
          "Klockan {{time.T+480|clock}}. Medan HR och säkerhet hanterar hoten dyker ett nytt problem upp på den publika sidan.\n\nMedborgarna kan inte boka, ansöka eller betala: e-tjänsterna går inte att nå, och inte heller växelns system för återuppringning. Den som behöver tjänsterna i dag har inget sätt att nå er."
        ]),
        injects: [
          inj("i4-1", 480, "networkEvidence", "itOps", "high", "confirmed", [
            "Inbound traffic at {{num.gbps}} Gbit/s from thousands of addresses. The e-services and the public switchboard's call-back system are unreachable.",
            "Inkommande trafik på {{num.gbps}} Gbit/s från tusentals adresser. E-tjänsterna och växelns system för återuppringning går inte att nå."
          ], { tests: ["lo2"] }),
          inj("i4-2", 500, "statusPage", "supplier", "medium", "confirmed", [
            "{{supplier.isp}}: “We can enable filtering for your address range within two hours. It may block some legitimate foreign traffic.”",
            "{{supplier.isp}}: ”Vi kan aktivera filtrering för ert adressintervall inom två timmar. Det kan blockera viss legitim utländsk trafik.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What filtering can you put in place, and how fast?", "Vilken filtrering kan ni införa, och hur snabbt?", ["networkLead"]),
            q("Can critical e-services be moved behind protection first?", "Kan kritiska e-tjänster flyttas bakom skydd först?", ["networkLead", "itOps"]),
            q("Are the threats to staff still being handled while IT fights this?", "Hanteras hoten mot personalen fortfarande medan IT kämpar med det här?", ["itOps"], "d3")
          ],
          executive: [
            q("Which services must citizens have today, and what's the manual fallback?", "Vilka tjänster måste medborgarna ha i dag, och vad är den manuella reservrutinen?", ["incidentCommander"]),
            q("Do you say who is behind this?", "Säger ni vem som ligger bakom?", ["comms"]),
            q("Did your statement draw more attention to the group?", "Drog ert uttalande mer uppmärksamhet till gruppen?", ["comms"], "d1")
          ]
        },
        challenges: [ch("The group posts a live counter of your downtime.", "Gruppen publicerar en levande räknare för hur länge ni ligger nere.")],
        decision: dec("d4", "incidentCommander", ["How do you restore service?", "Hur återställer ni tjänsterna?"], [
          ["Enable provider filtering, publish manual alternatives for critical services and keep staff protection as top priority.", "Aktivera leverantörens filtrering, publicera manuella alternativ för kritiska tjänster och behåll skyddet av personalen som högsta prioritet."],
          ["Shift all IT staff to the flood and pause other work.", "Flytta all IT-personal till trafikfloden och pausa annat arbete."],
          ["Ride it out behind a static notice: the flood is noise, and your staff need you more.", "Rid ut stormen bakom ett statiskt meddelande: trafikfloden är brus, och personalen behöver er mer."]
        ], {
          knowns: [["E-services are down from a traffic flood.", "E-tjänsterna ligger nere på grund av en trafikflod."]],
          uncertainties: [["How long it will last.", "Hur länge den kommer att pågå."]],
          tradeoffs: {
            operational: ["Filtering may block some legitimate users.", "Filtrering kan blockera vissa legitima användare."],
            security: ["Pulling everyone to the flood neglects the bigger risk.", "Att dra alla till trafikfloden försummar den större risken."],
            legal: ["Citizens have a right to certain services.", "Medborgarna har rätt till vissa tjänster."],
            reputational: ["Visible manual alternatives show control.", "Synliga manuella alternativ visar kontroll."]
          },
          evaluation: [["Restores service without losing focus on staff", "Återställer tjänsterna utan att tappa fokus på personalen"]],
          pushback: {
            A: [
              pb(["Two hours of nothing", "Två timmar av ingenting"], ["Filtering takes up to two hours, and until then nothing changes. The group's downtime counter keeps ticking, and management wants something visible now. Do you wait, or pull people off staff protection to try something faster?", "Filtreringen tar upp till två timmar, och fram till dess händer ingenting. Gruppens räknare för driftstoppet tickar vidare, och ledningen vill se något nu. Väntar ni, eller tar ni folk från skyddet av personalen för att prova något snabbare?"]),
              pb(["Counters full of people", "Disken full av folk"], ["The manual alternatives send residents to your offices in person, the same buildings where named staff work. Your security officer cannot vet who walks in. Do you keep the counters open, and who stands at them?", "De manuella alternativen skickar invånarna till era kontor, samma byggnader där namngiven personal arbetar. Er säkerhetschef kan inte kontrollera vem som kommer in. Håller ni diskarna öppna, och vem står i dem?"]),
              pb(["“Payments are due today”", "”Utbetalningarna ska ut i dag”"], ["The head of a service area says applications due today matter more than staff support, and wants HR and security staff to help man the phones. Staff protection as top priority is now being argued against inside your own house. Who wins, and how do you explain it?", "Chefen för en förvaltning säger att ansökningar med sista dag i dag väger tyngre än stödet till personalen, och vill att HR och säkerhet hjälper till i telefonerna. Personalskyddet som högsta prioritet ifrågasätts nu inifrån. Vem vinner, och hur förklarar ni det?"])
            ],
            B: [
              pb(["Staff protection stalls", "Personalskyddet står still"], ["IT was removing named staff from the online directory and rerouting their work phones. That work has stopped. A named employee asks why their number is still listed. Is the flood worth it?", "IT höll på att ta bort namngiven personal från den publika katalogen och koppla om deras arbetstelefoner. Det arbetet har stannat. En namngiven anställd frågar varför hens nummer fortfarande syns. Är trafikfloden värd det?"]),
              pb(["Watching graphs", "Att titta på grafer"], ["Your network lead says the flood can only be stopped upstream, by the provider. Most of the IT staff you moved are watching traffic graphs. What are they actually achieving, and what did you stop to free them?", "Er nätverksansvarige säger att floden bara kan stoppas uppströms, av leverantören. Det mesta av IT-personalen ni flyttade tittar på trafikgrafer. Vad åstadkommer de egentligen, och vad stoppade ni för att frigöra dem?"]),
              pb(["The contractor review waits", "Konsultgranskningen får vänta"], ["Pausing other work also paused the review of what the contractor account could reach. Nobody knows when it will restart. Do you let the flood decide what you stop looking into?", "När annat arbete pausades pausades också granskningen av vad konsultkontot kunde nå. Ingen vet när den startar igen. Låter ni trafikfloden bestämma vad ni slutar undersöka?"])
            ],
            C: [
              pb(["A deadline missed", "En missad tidsfrist"], ["A resident with an application due today cannot submit it, and your static notice offers no other way. The local paper is already asking about people losing support because of the outage. Who answers for that?", "En invånare vars ansökan måste in i dag kan inte skicka den, och ert statiska meddelande erbjuder ingen annan väg. Lokaltidningen frågar redan om människor som förlorar stöd på grund av avbrottet. Vem står till svars för det?"]),
              pb(["Noise that doesn't stop", "Brus som inte slutar"], ["Evening comes and the flood is still running. The group takes credit and promises more, and management asks whether “noise” is still the right word. How long do you ride it out before you act?", "Kvällen kommer och floden pågår fortfarande. Gruppen tar på sig ansvaret och lovar mer, och ledningen frågar om ”brus” fortfarande är rätt ord. Hur länge rider ni ut stormen innan ni agerar?"]),
              pb(["Some services must be open", "Vissa tjänster måste vara öppna"], ["Legal points out that some of the e-services are ones you are required to provide, and a static notice may not meet that duty. Riding it out may be a breach in itself. Do you still wait?", "Juristerna påpekar att vissa av e-tjänsterna är sådana ni är skyldiga att tillhandahålla, och ett statiskt meddelande uppfyller kanske inte den skyldigheten. Att rida ut stormen kan i sig vara ett brott mot den. Väntar ni ändå?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["Filtering switched on", "Filtreringen påslagen"], [
              io(["Traffic drops", "Trafiken sjunker"], ["Within two hours the provider's filtering cuts the flood, and the core e-services are reachable again. The group's downtime counter stops.", "Inom två timmar stryper leverantörens filtrering floden, och de viktigaste e-tjänsterna går att nå igen. Gruppens räknare för driftstoppet stannar."], ["Provider filtering is on and the core e-services are reachable.", "Leverantörens filtrering är på och de viktigaste e-tjänsterna går att nå."]),
              io(["Legitimate users blocked", "Legitima användare blockerade"], ["The filtering also blocks residents working abroad and a partner authority's systems. Complaints arrive that the council has shut people out to stop a handful of attackers.", "Filtreringen blockerar också invånare som arbetar utomlands och en samverkande myndighets system. Klagomål kommer om att kommunen har stängt ute folk för att stoppa en handfull angripare."], ["Filtering blocks some legitimate users outside the country.", "Filtreringen blockerar vissa legitima användare utanför landet."], { meters: { trust: -1 } }),
              io(["Crowded counters", "Fulla diskar"], ["The manual alternatives send residents to your offices in person, the same buildings where named staff work. Queues are forming, and your security officer cannot vet who walks in.", "De manuella alternativen skickar invånarna till era kontor, samma byggnader där namngiven personal arbetar. Köer bildas, och er säkerhetschef kan inte kontrollera vem som kommer in."], ["Queues of residents are forming at offices where named staff work.", "Köer av invånare bildas vid kontor där namngiven personal arbetar."], { reopen: true })
            ]),
            ir("i2", { notChosen: "A" }, ["No filtering, no fallback", "Ingen filtrering, ingen reserv"], [
              io(["It stops by itself", "Det upphör av sig självt"], ["After a few hours the flood stops on its own. The group posts that it was “just a taste”, and the e-services come back.", "Efter några timmar upphör floden av sig själv. Gruppen skriver att det var ”bara ett smakprov”, och e-tjänsterna kommer tillbaka."], ["The flood stopped by itself; the group called it “just a taste”.", "Floden upphörde av sig själv; gruppen kallade det ”bara ett smakprov”."]),
              io(["A missed deadline", "En missad tidsfrist"], ["Residents with applications due today could not submit them, and no other route was offered. The local paper has a resident on record who has lost support because of it.", "Invånare vars ansökningar skulle in i dag kunde inte skicka dem, och ingen annan väg erbjöds. Lokaltidningen har en invånare som berättar att hen har förlorat stöd på grund av det."], ["Residents missed an application deadline during the outage.", "Invånare missade en tidsfrist för ansökan under avbrottet."], { reopen: true, meters: { trust: -1 } }),
              io(["Comes and goes", "Kommer och går"], ["The flood drops away, then returns twenty minutes later, then drops again. Your network lead cannot see a pattern, or say whether it is over.", "Floden försvinner, kommer tillbaka tjugo minuter senare och försvinner igen. Er nätverksansvarige kan inte se något mönster, eller säga om det är över."], ["The flood comes and goes, with no pattern anyone can see.", "Floden kommer och går, utan något mönster som någon kan se."])
            ])
          ]
        }),
        facilitator: fac(
          ["Noise competes with people. Check that HR hasn't been forgotten.", "Bruset konkurrerar med människorna. Kontrollera att HR inte har glömts bort."],
          ["Filtering, manual alternatives and staff protection kept first.", "Filtrering, manuella alternativ och skyddet av personalen kvar som första prioritet."],
          [["Ask: who is with the named staff right now?", "Fråga: vem är med den namngivna personalen just nu?"]]
        )
      },
      {
        id: "p5",
        priority: 2,
        clock: 1440,
        title: L(["The police take the lead", "Polisen tar ledningen"]),
        twist: L(["{{reg.police|cap}} takes over the threat investigation and asks you not to comment on the group or contact them.", "{{reg.police|cap}} tar över utredningen av hoten och ber er att inte kommentera gruppen eller ta kontakt med dem."]),
        twistKind: "authority",
        reconsider: { decision: "d3", pressure: { en: "The threats keep coming, and the police now lead. Was your protection for the named staff enough, or only a first step?", sv: "Hoten fortsätter, och polisen leder nu arbetet. Räckte ert skydd för den namngivna personalen, eller var det bara ett första steg?" } },
        assumptionChallenged: L(["We control our own crisis communication.", "Vi styr vår egen kriskommunikation."]),
        narrative: L([
          "The next day. Staff are frightened, the unions want answers and the press is covering every development.\n\nThe threats against staff have been reported, and the police have taken a close interest. Their involvement brings protection, but also conditions on what the organisation may say, and to whom.",
          "Nästa dag. Personalen är rädd, facken vill ha svar och pressen bevakar varje utveckling.\n\nHoten mot personalen har polisanmälts, och polisen visar stort intresse. Deras medverkan ger skydd, men också villkor för vad organisationen får säga, och till vem."
        ]),
        injects: [
          inj("i5-1", 1440, "phoneTranscript", "police", "high", "confirmed", [
            "“We are treating the threats as a serious crime. Please don't comment on the group, don't engage with them and route staff reports through us.”",
            "”Vi behandlar hoten som ett allvarligt brott. Kommentera inte gruppen, ta ingen kontakt med dem och skicka personalens anmälningar via oss.”"
          ], { pressure: "lawEnforcement", substitute: { source: "management", content: ["Legal advises that public comment on the group could prejudice any prosecution.", "Juristerna råder att offentliga kommentarer om gruppen kan skada ett eventuellt åtal."] }, tests: ["lo3"] }),
          inj("i5-2", 1470, "email", "employee", "medium", "confirmed", [
            "A union representative: “Our members want to know what the employer is doing to keep them safe. We want an answer today.”",
            "Ett fackligt ombud: ”Våra medlemmar vill veta vad arbetsgivaren gör för att hålla dem säkra. Vi vill ha svar i dag.”"
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("What evidence do the police need from you?", "Vilka bevis behöver polisen från er?", ["ciso", "itOps"]),
            q("How do you keep staff reports organised for the police?", "Hur håller ni ordning på personalens anmälningar till polisen?", ["securityOfficer"]),
            q("Did your restore and filtering preserve what the police need?", "Bevarade er återställning och filtrering det polisen behöver?", ["itOps"], "d4")
          ],
          executive: [
            q("What can you say to staff and unions if you can't talk about the group?", "Vad kan ni säga till personal och fack om ni inte kan prata om gruppen?", ["hr", "comms"]),
            q("Who coordinates between you and the police?", "Vem samordnar mellan er och polisen?", ["securityOfficer", "incidentCommander"]),
            q("Does your staff support plan meet the union's expectations?", "Motsvarar er plan för stöd till personalen fackets förväntningar?", ["hr"], "d3")
          ]
        },
        challenges: [ch("The press is quoting the group's posts.", "Pressen citerar gruppens inlägg.")],
        decision: dec("d5", "comms", ["How do you communicate now?", "Hur kommunicerar ni nu?"], [
          ["Speak about what you do for staff and services, not about the group, coordinated with the police.", "Prata om vad ni gör för personalen och tjänsterna, inte om gruppen, i samordning med polisen."],
          ["Stay silent until the police finish.", "Var tysta tills polisen är klar."],
          ["Answer the group's claims publicly.", "Bemöt gruppens påståenden offentligt."]
        ], {
          knowns: [["The police ask you not to comment on the group.", "Polisen ber er att inte kommentera gruppen."]],
          uncertainties: [["How long the investigation will take.", "Hur lång tid utredningen kommer att ta."]],
          tradeoffs: {
            operational: ["Coordination slows every statement.", "Samordning gör varje uttalande långsammare."],
            security: ["Engaging the group can escalate it.", "Att bemöta gruppen kan trappa upp det."],
            legal: ["Comments could harm a prosecution.", "Kommentarer kan skada ett åtal."],
            reputational: ["Silence looks like you don't care about staff.", "Tystnad ser ut som att ni inte bryr er om personalen."]
          },
          evaluation: [["Communicates care without amplifying the attackers", "Kommunicerar omsorg utan att förstärka angriparna"]],
          pushback: {
            A: [
              pb(["Waiting for sign-off", "I väntan på godkännande"], ["The police want to see each statement first. Your reply to the union has waited half a day for their sign-off, and the union says the employer is hiding behind the police. Do you send it without their approval?", "Polisen vill se varje uttalande först. Ert svar till facket har väntat en halv dag på deras godkännande, och facket säger att arbetsgivaren gömmer sig bakom polisen. Skickar ni det utan deras godkännande?"]),
              pb(["“Why won't you say who?”", "”Varför säger ni inte vem?”"], ["A reporter asks why you will not say who is behind the attack when the group is openly taking credit. Your careful line sounds evasive next to their posts. How do you answer without commenting on the group?", "En reporter frågar varför ni inte säger vem som ligger bakom när gruppen öppet tar på sig angreppet. Er försiktiga linje låter undanglidande bredvid deras inlägg. Hur svarar ni utan att kommentera gruppen?"]),
              pb(["“That's not what I got”", "”Det är inte vad jag fick”"], ["A named employee reads your statement about the support offered to staff and posts that it does not match what they have actually received. Journalists pick it up. Do you correct the statement, or the support?", "En namngiven anställd läser ert uttalande om stödet till personalen och skriver att det inte stämmer med vad hen faktiskt har fått. Journalister plockar upp det. Rättar ni uttalandet, eller stödet?"])
            ],
            B: [
              pb(["The union speaks instead", "Facket talar i stället"], ["The union announces it will brief the press on staff safety itself, since the employer says nothing. Your silence now has a spokesperson you do not control. Is it still your silence to keep?", "Facket meddelar att de själva tänker informera pressen om personalens säkerhet, eftersom arbetsgivaren inte säger något. Er tystnad har nu en talesperson som ni inte styr över. Är det fortfarande er tystnad att hålla?"]),
              pb(["Months, not days", "Månader, inte dagar"], ["The police say the investigation may take months. Staying silent until they finish means saying nothing to staff or residents for the foreseeable future. Can you really keep that up?", "Polisen säger att utredningen kan ta månader. Att vara tysta tills de är klara innebär att inte säga något till personal eller invånare under överskådlig tid. Kan ni verkligen hålla fast vid det?"]),
              pb(["More silence than asked", "Tystare än nödvändigt"], ["The police only asked you not to comment on the group. A columnist now writes that you are hiding something, and staff read your silence as indifference. Did you go further than you needed to, and why?", "Polisen bad er bara att inte kommentera gruppen. En krönikör skriver nu att ni döljer något, och personalen tolkar er tystnad som likgiltighet. Gick ni längre än ni behövde, och varför?"])
            ],
            C: [
              pb(["The police object", "Polisen invänder"], ["The police call within the hour: your public rebuttal may harm the investigation, and they ask you to stop. Your statement is already being quoted. Do you retract it, and how does that look?", "Polisen ringer inom en timme: ert offentliga bemötande kan skada utredningen, och de ber er att sluta. Ert uttalande citeras redan. Tar ni tillbaka det, och hur ser det ut?"]),
              pb(["The group replies", "Gruppen svarar"], ["The group quotes your rebuttal line by line, and its {{num.followers}} followers share the exchange. New posts now name your spokesperson. Was answering worth the attention it gave them?", "Gruppen citerar ert bemötande rad för rad, och dess {{num.followers}} följare delar ordväxlingen. Nya inlägg nämner nu er talesperson vid namn. Var det värt uppmärksamheten det gav dem att svara?"]),
              pb(["Back in the spotlight", "Tillbaka i strålkastarljuset"], ["Named staff say that every rebuttal pulls them back into the story. One asks that the decision they worked on never be mentioned again. Do you keep engaging the group, knowing who pays for it?", "Namngiven personal säger att varje bemötande drar in dem i historien igen. En ber att beslutet hen arbetade med aldrig nämns igen. Fortsätter ni att bemöta gruppen, när ni vet vem som betalar för det?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["A coordinated line", "En samordnad linje"], [
              io(["The line holds", "Linjen håller"], ["The police thank you for the statement, and the union calls it a start. Coverage shifts from the group's posts to what the employer is doing for staff.", "Polisen tackar för uttalandet, och facket kallar det en början. Bevakningen flyttas från gruppens inlägg till vad arbetsgivaren gör för personalen."], ["The police and the union accept the coordinated line.", "Polisen och facket accepterar den samordnade linjen."]),
              io(["Stuck in sign-off", "Fast i godkännandet"], ["The police take half a day to clear the statement. By then the union has briefed the press itself, and the story is “employer hides behind police”.", "Polisen tar en halv dag på sig att godkänna uttalandet. Då har facket redan informerat pressen själva, och nyheten blir ”arbetsgivaren gömmer sig bakom polisen”."], ["The union spoke to the press before your statement was cleared.", "Facket talade med pressen innan ert uttalande var godkänt."], { reopen: true, meters: { media: 1 } }),
              io(["“Afraid to name us”", "”Rädda att nämna oss”"], ["The group posts that the council is too afraid to say its name. Some followers read your restraint as weakness; others say it shows you are not rising to the bait.", "Gruppen skriver att kommunen är för rädd för att säga dess namn. En del följare tolkar er återhållsamhet som svaghet; andra säger att den visar att ni inte nappar på betet."], ["The group says the council is afraid to name it.", "Gruppen säger att kommunen är rädd för att nämna den vid namn."])
            ]),
            ir("i2", { notChosen: "A" }, ["Not the coordinated line", "Inte den samordnade linjen"], [
              io(["The group goes quiet", "Gruppen tystnar"], ["The group posts nothing for the rest of the day. It looks as if the worst may be over.", "Gruppen publicerar ingenting under resten av dagen. Det ser ut som att det värsta kanske är över."], ["The group posted nothing for the rest of the day.", "Gruppen publicerade ingenting under resten av dagen."]),
              io(["Staff in the dark", "Personalen i mörker"], ["The union passes on what members are saying: they do not know what the employer is doing to keep them safe. Several named staff say they learn more from the press than from you.", "Facket förmedlar vad medlemmarna säger: de vet inte vad arbetsgivaren gör för att hålla dem säkra. Flera namngivna säger att de får veta mer från pressen än från er."], ["Staff say they do not know what the employer is doing for them.", "Personalen säger att de inte vet vad arbetsgivaren gör för dem."], { reopen: true, meters: { trust: -1 } }),
              io(["Police set terms", "Polisen ställer villkor"], ["The police ask that every public word about the incident is checked with them first from now on. It protects the case, and slows you down.", "Polisen ber att varje offentligt ord om händelsen stäms av med dem först från och med nu. Det skyddar utredningen, och gör er långsammare."], ["The police want to see every public statement first.", "Polisen vill se varje offentligt uttalande först."])
            ])
          ]
        }),
        facilitator: fac(
          ["Authority shifts outside the organisation. Find what you can still say.", "Mandatet flyttas utanför organisationen. Hitta det ni fortfarande kan säga."],
          ["Messages about staff and services, coordinated with the police.", "Budskap om personalen och tjänsterna, i samordning med polisen."],
          [["Ask: what is your one sentence to a frightened employee?", "Fråga: vilken är er enda mening till en rädd anställd?"]]
        )
      },
      {
        id: "p6",
        priority: 3,
        clock: 2160,
        title: L(["Where the list came from", "Var listan kom ifrån"]),
        twist: L(["The staff data came from a directory export sent to the web contractor for a redesign — stored in the publishing tool.", "Personaluppgifterna kom från en export av personalkatalogen som skickats till webbkonsulten inför en omgörning – lagrad i publiceringsverktyget."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because manual alternatives were published, the phone lines are overwhelmed, and elderly residents who depend on the e-services are waiting hours.", sv: "Eftersom manuella alternativ publicerades är telefonlinjerna överbelastade, och äldre invånare som är beroende av e-tjänsterna väntar i timmar." } }
        ],
        assumptionChallenged: L(["The group found staff details from public sources.", "Gruppen hittade personaluppgifterna i offentliga källor."]),
        reveals: ["hf-export"],
        narrative: L([
          "Two days later. The investigators compare the published list of staff with the organisation's own records, field by field.\n\nUntil now everyone assumed the group had collected the details from public sources and social media. The comparison shows where the list really came from, and it is uncomfortably close to home.",
          "Två dagar senare. Utredarna jämför den publicerade listan över personal med organisationens egna register, fält för fält.\n\nHittills har alla antagit att gruppen samlat uppgifterna från öppna källor och sociala medier. Jämförelsen visar var listan egentligen kom ifrån, och det är obehagligt nära."
        ]),
        injects: [
          inj("i6-1", 2160, "forensicFinding", "forensics", "high", "confirmed", [
            "The published list matches, field for field, a staff-directory export from HR sent to the agency for a redesign. It sat in the publishing tool's file library, including private addresses that should never have been exported.",
            "Den publicerade listan stämmer, fält för fält, med en export av personalkatalogen från HR som skickades till byrån inför en omgörning. Den låg i publiceringsverktygets filbibliotek, inklusive privata adresser som aldrig borde ha exporterats."
          ], { headline: ["Leak traced to an internal export", "Läckan spårad till en intern export"], reveals: ["hf-export"], tests: ["lo1"] })
        ],
        charts: [{
          id: "c6-kpi", type: "kpi",
          title: L(["What the export exposed", "Vad exporten exponerade"]),
          data: kpi([
            { id: "named", label: ["Staff named publicly", "Offentligt namngiven personal"], value: (v) => v.staffDoxxed, tone: "danger" },
            { id: "threats", label: ["Threats reported", "Rapporterade hot"], value: (v) => v.threats, tone: "danger" },
            { id: "vote", label: ["Days to the vote", "Dagar till omröstningen"], value: (v) => v.daysToVote, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("Who else has received exports of staff data?", "Vilka andra har fått exporter av personaluppgifter?", ["dpo", "ciso"]),
            q("How do you make sure exports only contain what is needed?", "Hur ser ni till att exporter bara innehåller det som behövs?", ["dpo"]),
            q("Did your review of the contractor account find this file?", "Hittade er granskning av konsultkontot den här filen?", ["itOps"], "d2")
          ],
          executive: [
            q("Do you tell staff the leak came from inside?", "Berättar ni för personalen att läckan kom inifrån?", ["hr", "ceo"]),
            q("Is this a personal-data breach you must report?", "Är det här en personuppgiftsincident som ni måste anmäla?", ["dpo", "legal"]),
            q("Does this change your public line?", "Ändrar det här er offentliga linje?", ["comms"], "d5")
          ]
        },
        challenges: [ch("Staff assumed the group found them online.", "Personalen trodde att gruppen hade hittat dem på nätet.")],
        decision: dec("d6", "ceo", ["How do you handle the internal source?", "Hur hanterar ni den interna källan?"], [
          ["Tell staff the truth, apologise, report the breach and review all data shared with suppliers.", "Berätta sanningen för personalen, be om ursäkt, anmäl incidenten och granska alla uppgifter som delats med leverantörer."],
          ["Report the breach but keep the source internal to management.", "Anmäl incidenten men håll källan inom ledningen."],
          ["Report the breach and name the agency's storage as the source: the contract made them responsible for it.", "Anmäl incidenten och ange byråns lagring som källan: avtalet gjorde dem ansvariga för den."]
        ], {
          knowns: [["The list came from your own export.", "Listan kom från er egen export."]],
          uncertainties: [["What else was shared.", "Vad mer som har delats."]],
          tradeoffs: {
            operational: ["A supplier data review is a big job.", "En granskning av uppgifter hos leverantörer är ett stort arbete."],
            security: ["Unnecessary data is a liability.", "Onödiga uppgifter är en belastning."],
            legal: ["The breach is reportable.", "Incidenten ska anmälas."],
            reputational: ["Staff trust depends on honesty now.", "Personalens förtroende hänger nu på ärlighet."]
          },
          evaluation: [["Owns the failure openly with staff", "Tar öppet ansvar för misstaget inför personalen"]],
          pushback: {
            A: [
              pb(["“Who approved this?”", "”Vem godkände det här?”"], ["The staff meeting turns hostile. A named employee asks who decided to send home addresses to a web agency, and whether that person will face consequences. Do you name the unit responsible, in front of everyone?", "Personalmötet blir fientligt. En namngiven anställd frågar vem som bestämde att hemadresser skulle skickas till en webbyrå, och om den personen får några konsekvenser. Pekar ni ut den ansvariga enheten, inför alla?"]),
              pb(["An apology as evidence", "En ursäkt som bevis"], ["Legal warns that a written apology may be used by named staff seeking damages, and the union has already mentioned compensation. Your honesty now has a price. Do you still apologise in those words?", "Juristerna varnar för att en skriftlig ursäkt kan användas av namngiven personal som kräver skadestånd, och facket har redan nämnt ersättning. Er ärlighet har nu ett pris. Ber ni fortfarande om ursäkt med de orden?"]),
              pb(["The review keeps finding", "Granskningen fortsätter hitta"], ["The first day of the supplier review shows staff data has been sent to other suppliers too, and nobody can say how much or why. You promised staff the whole truth. Do you tell them about these files before you know whether any have leaked?", "Första dagen av leverantörsgranskningen visar att personaluppgifter även har skickats till andra leverantörer, och ingen kan säga hur mycket eller varför. Ni lovade personalen hela sanningen. Berättar ni om de här filerna innan ni vet om något har läckt?"])
            ],
            B: [
              pb(["A report anyone can request", "En anmälan som alla kan begära ut"], ["As a public body, your breach report to {{reg.dpaShort}} may be released to anyone who asks for it. Staff could read where the list came from in the newspaper. Do you want them to learn it that way?", "Som offentlig myndighet kan er anmälan till {{reg.dpaShort}} lämnas ut till vem som helst som begär den. Personalen kan få läsa i tidningen var listan kom ifrån. Vill ni att de ska få veta det så?"]),
              pb(["Acting on a false belief", "De agerar på en felaktig bild"], ["Named staff still think the group found them online. Some are deleting their social media and changing their routines because of it. Can you let them keep protecting themselves against the wrong thing?", "Namngiven personal tror fortfarande att gruppen hittade dem på nätet. Några raderar sina sociala medier och ändrar sina rutiner på grund av det. Kan ni låta dem fortsätta skydda sig mot fel sak?"]),
              pb(["HR already knows", "HR vet redan"], ["The HR staff who made the export know exactly what happened, and one of them is distressed and wants to tell colleagues. Keeping it within management now means asking them to stay quiet. How long do you think this stays inside?", "HR-personalen som gjorde exporten vet precis vad som hände, och en av dem mår dåligt och vill berätta för kollegorna. Att hålla det inom ledningen innebär nu att be dem tiga. Hur länge tror ni att det här stannar inom huset?"])
            ],
            C: [
              pb(["The agency hits back", "Byrån slår tillbaka"], ["The agency tells the press that you sent them home addresses they never asked for. The story is now about your export, not their storage. Do you keep blaming them in public?", "Byrån berättar för pressen att ni skickade hemadresser som de aldrig bad om. Nyheten handlar nu om er export, inte deras lagring. Fortsätter ni att skylla på dem offentligt?"]),
              pb(["What the paper says", "Vad pappret säger"], ["Legal cannot find a data processing agreement covering the export, and the contract says nothing about staff data. The responsibility you named may not be theirs on paper. Do you still stand behind it?", "Juristerna hittar inget personuppgiftsbiträdesavtal som omfattar exporten, och avtalet säger inget om personaluppgifter. Ansvaret ni pekade ut ligger kanske inte hos dem på papperet. Står ni fortfarande bakom det?"]),
              pb(["“Why was it sent at all?”", "”Varför skickades den alls?”"], ["Named staff ask why their home addresses were in a file sent for a website redesign. Naming the agency's storage does not answer that. What do you tell them?", "Namngiven personal frågar varför deras hemadresser fanns i en fil som skickades inför en omgörning av webbplatsen. Att peka på byråns lagring besvarar inte det. Vad säger ni till dem?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The truth to staff", "Sanningen till personalen"], [
              io(["Better from you", "Hellre från er"], ["The staff meeting is tense, but most say they would rather hear it from you than from the press. The union welcomes the apology.", "Personalmötet är spänt, men de flesta säger att de hellre hör det från er än från pressen. Facket välkomnar ursäkten."], ["Most staff say they would rather hear it from you.", "De flesta i personalen säger att de hellre hör det från er."]),
              io(["The review keeps finding", "Granskningen fortsätter hitta"], ["The supplier review shows staff data has been sent to other suppliers too, and nobody can say how much. You promised staff the whole truth.", "Leverantörsgranskningen visar att personaluppgifter även har skickats till andra leverantörer, och ingen kan säga hur mycket. Ni lovade personalen hela sanningen."], ["Staff data has also been sent to other suppliers.", "Personaluppgifter har även skickats till andra leverantörer."], { reopen: true }),
              io(["The apology quoted", "Ursäkten citeras"], ["The union says it will support named staff seeking compensation, and quotes your apology. Some managers say the honesty was right; others say it was naive.", "Facket säger att det kommer att stötta namngiven personal som kräver ersättning, och citerar er ursäkt. En del chefer säger att ärligheten var rätt; andra att den var naiv."], ["The union is preparing compensation claims citing your apology.", "Facket förbereder ersättningskrav med hänvisning till er ursäkt."])
            ]),
            ir("i2", { notChosen: "A" }, ["The source kept off the record", "Källan hålls utanför"], [
              io(["No questions", "Inga frågor"], ["Staff take the update without asking where the list came from. For now, the matter seems settled.", "Personalen tar emot informationen utan att fråga var listan kom ifrån. För tillfället verkar saken avgjord."], ["Staff have not yet asked where the list came from.", "Personalen har ännu inte frågat var listan kom ifrån."]),
              io(["It comes out", "Det kommer ut"], ["A journalist requests your breach report and publishes that the list came from your own HR export. Named staff read it in the paper.", "En journalist begär ut er anmälan och publicerar att listan kom från er egen HR-export. Namngiven personal läser det i tidningen."], ["The press has reported that the list came from your own export.", "Pressen har rapporterat att listan kom från er egen export."], { reopen: true, meters: { trust: -1, media: 1 } }),
              io(["A question from {{reg.dpaShort}}", "En fråga från {{reg.dpaShort}}"], ["{{reg.dpaShort}} acknowledges your report and asks one question: why did an export for a website redesign contain home addresses at all?", "{{reg.dpaShort}} bekräftar er anmälan och ställer en fråga: varför innehöll en export inför en omgörning av webbplatsen över huvud taget hemadresser?"], ["{{reg.dpaShort}} has asked why home addresses were exported.", "{{reg.dpaShort}} har frågat varför hemadresser exporterades."], { meters: { regulator: 1 } })
            ])
          ]
        }),
        facilitator: fac(
          ["Uncomfortable honesty. Let the group feel the weight.", "Obekväm ärlighet. Låt gruppen känna tyngden."],
          ["Truth to staff, an apology, a breach report and a supplier data review.", "Sanningen till personalen, en ursäkt, en anmälan och en granskning av uppgifter hos leverantörer."],
          [["Ask: how would you want to hear this as one of the named staff?", "Fråga: hur skulle ni vilja få höra det här om ni var en av de namngivna?"]]
        )
      },
      {
        id: "p7",
        priority: 4,
        clock: 2880,
        title: L(["The second wave", "Den andra vågen"]),
        twist: L(["The group announces a “second wave” for the day of the council vote, {{num.daysToVote}} days away.", "Gruppen tillkännager en ”andra våg” till dagen för omröstningen, om {{num.daysToVote}} dagar."]),
        twistKind: "impact",
        reconsider: { decision: "d6", pressure: { en: "The second wave is set for the day of the vote, and staff now know where the list came from. Does your decision about the source still hold?", sv: "Den andra vågen är utlyst till omröstningsdagen, och personalen vet nu var listan kom ifrån. Håller ert beslut om källan fortfarande?" } },
        assumptionChallenged: L(["The attack is over.", "Angreppet är över."]),
        narrative: L([
          "Three days in. Things have calmed down. The website is secure, the e-services are back and the threatened staff have support.\n\nThen a new post from the group appears, with a date. The council vote on the decision is coming up, and the group has noticed.",
          "Tre dagar in. Det har lugnat sig. Webbplatsen är säkrad, e-tjänsterna är tillbaka och den hotade personalen har stöd.\n\nSedan dyker ett nytt inlägg från gruppen upp, med ett datum. Fullmäktiges omröstning om beslutet närmar sig, och gruppen har märkt det."
        ]),
        injects: [
          inj("i7-1", 2880, "socialPost", "socialMedia", "high", "unverified", [
            "{{actor.name}}: “On vote day we come back. Harder. More names.”",
            "{{actor.name}}: ”På omröstningsdagen kommer vi tillbaka. Hårdare. Fler namn.”"
          ], { statedReliability: ["Claim by the group", "Påstående från gruppen"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What do you harden before vote day?", "Vad förstärker ni före omröstningsdagen?", ["ciso", "networkLead"]),
            q("Where else might staff data be exposed?", "Var mer kan personaluppgifter vara exponerade?", ["dpo", "ciso"]),
            q("Did the filtering you enabled stay in place?", "Fanns filtreringen som ni aktiverade kvar?", ["networkLead"], "d4")
          ],
          executive: [
            q("What protection do the decision-makers need on vote day?", "Vilket skydd behöver beslutsfattarna på omröstningsdagen?", ["securityOfficer"]),
            q("Do you adjust the meeting or keep it as planned?", "Ändrar ni mötet eller genomför ni det som planerat?", ["ceo"]),
            q("Does your communication line still hold?", "Håller er kommunikationslinje fortfarande?", ["comms"], "d5")
          ]
        },
        challenges: [ch("Moving the vote would look like giving in.", "Att flytta omröstningen skulle se ut som att ge efter.")],
        decision: dec("d7", "ceo", ["How do you prepare for vote day?", "Hur förbereder ni er för omröstningsdagen?"], [
          ["Hold the vote as planned with physical and digital protection, staff support and a joint plan with the police.", "Genomför omröstningen som planerat med fysiskt och digitalt skydd, stöd till personalen och en gemensam plan med polisen."],
          ["Move the vote online and closed.", "Flytta omröstningen till ett slutet digitalt möte."],
          ["Postpone the vote.", "Skjut upp omröstningen."]
        ], {
          knowns: [["A second wave is announced.", "En andra våg har tillkännagetts."]],
          uncertainties: [["Whether it is real.", "Om den är på riktigt."]],
          tradeoffs: {
            operational: ["Protection for a public meeting takes planning.", "Skydd för ett offentligt möte kräver planering."],
            security: ["The group's capability seems limited but determined.", "Gruppens förmåga verkar begränsad men målmedveten."],
            legal: ["Democratic processes have rules about openness.", "Demokratiska processer har regler om öppenhet."],
            reputational: ["Giving in rewards the tactic.", "Att ge efter belönar taktiken."]
          },
          evaluation: [["Protects people and the process without giving in", "Skyddar människorna och processen utan att ge efter"]],
          pushback: {
            A: [
              pb(["Empty seats", "Tomma platser"], ["Two councillors say they will not attend in person while the group is promising “more names”. Without them the vote may not be representative. Do you allow remote participation, and is the vote then still as planned?", "Två förtroendevalda säger att de inte kommer på plats så länge gruppen lovar ”fler namn”. Utan dem blir omröstningen kanske inte representativ. Tillåter ni deltagande på distans, och är omröstningen då fortfarande som planerat?"]),
              pb(["An open gallery", "En öppen läktare"], ["An open meeting means anyone can come in, including the group's supporters. The police say they cannot check everyone at the door. Do you limit the public gallery, and is the meeting still open if you do?", "Ett öppet möte innebär att vem som helst kan komma in, även gruppens anhängare. Polisen säger att de inte kan kontrollera alla vid dörren. Begränsar ni åhörarplatserna, och är mötet fortfarande öppet om ni gör det?"]),
              pb(["“Don't make me present”", "”Tvinga inte mig att föredra”"], ["One of the named staff is scheduled to present the decision at the meeting and asks not to be seen in public. No one else knows the matter as well. Do you require them to attend, or change the plan you called “as planned”?", "En av de namngivna är inplanerad att föredra beslutet på mötet och ber att slippa synas offentligt. Ingen annan kan ärendet lika väl. Kräver ni att hen deltar, eller ändrar ni planen som ni kallade ”som planerat”?"])
            ],
            B: [
              pb(["Closed may mean invalid", "Slutet kan betyda ogiltigt"], ["Legal warns that the meeting is required to be public, and a closed digital vote could be appealed and overturned. You may end up voting twice. Is a decision that might not stand worth the protection?", "Juristerna varnar för att mötet måste vara offentligt, och en sluten digital omröstning kan överklagas och upphävas. Ni kan få rösta två gånger. Är ett beslut som kanske inte håller värt skyddet?"]),
              pb(["“They're hiding from us”", "”De gömmer sig för oss”"], ["The group posts that the council is hiding from the people, and its followers celebrate. Moving the vote is being read as the tactic working. Did you just reward it?", "Gruppen skriver att kommunen gömmer sig för folket, och följarna jublar. Att flytta omröstningen tolkas som att taktiken fungerar. Belönade ni den precis?"]),
              pb(["A digital target", "En digital måltavla"], ["An online meeting depends on the kind of service this group has already flooded once. If the platform goes down mid-vote, the decision fails in public. What is your fallback, and have you tested it?", "Ett digitalt möte är beroende av samma slags tjänst som den här gruppen redan har överbelastat en gång. Om plattformen går ned mitt i omröstningen faller beslutet inför allmänheten. Vad är er reservplan, och har ni testat den?"])
            ],
            C: [
              pb(["New date, same threat", "Nytt datum, samma hot"], ["Within the hour the group posts: “We'll be there on the new date too.” The threat has simply moved. Do you postpone again, and when does it stop?", "Inom en timme skriver gruppen: ”Vi kommer på det nya datumet också.” Hotet har bara flyttat. Skjuter ni upp igen, och när tar det slut?"]),
              pb(["Deadlines don't wait", "Tidsfrister väntar inte"], ["The decision is tied to deadlines for funding and contracts that cannot easily move. Postponing has costs that someone else will carry. Who decided those costs were acceptable?", "Beslutet är kopplat till tidsfrister för finansiering och avtal som inte enkelt kan flyttas. Uppskjutandet har kostnader som någon annan får bära. Vem bestämde att de kostnaderna var acceptabla?"]),
              pb(["Councillors split", "Splittrade förtroendevalda"], ["Several councillors say publicly that postponing gives in to threats, and refuse to accept it. The disagreement is now in the press. Who actually has the power to postpone, and is it you?", "Flera förtroendevalda säger offentligt att uppskjutandet är att ge efter för hot, och vägrar acceptera det. Oenigheten finns nu i pressen. Vem har egentligen makten att skjuta upp, och är det ni?"])
            ]
          },
          interrupts: [
            ir("i1", { chosen: "A" }, ["The vote as planned", "Omröstningen som planerat"], [
              io(["Police commit", "Polisen ställer upp"], ["The police agree a joint plan and commit officers for vote day. The security officer says the meeting can be held safely.", "Polisen går med på en gemensam plan och avdelar poliser till omröstningsdagen. Säkerhetschefen säger att mötet kan hållas på ett säkert sätt."], ["The police have committed officers to vote day.", "Polisen har avdelat poliser till omröstningsdagen."]),
              io(["Empty seats", "Tomma platser"], ["Two councillors say they will not attend in person while the group promises “more names”. Without them the vote may not be representative.", "Två förtroendevalda säger att de inte kommer på plats så länge gruppen lovar ”fler namn”. Utan dem blir omröstningen kanske inte representativ."], ["Two councillors will not attend the vote in person.", "Två förtroendevalda kommer inte till omröstningen på plats."], { reopen: true }),
              io(["A new list?", "En ny lista?"], ["An account linked to the group posts a blurred screenshot claiming a new list of names is ready for vote day. Nobody can tell whether it is real.", "Ett konto med koppling till gruppen publicerar en suddig skärmbild och påstår att en ny lista med namn är klar till omröstningsdagen. Ingen kan avgöra om den är äkta."], ["An unverified post claims a new list of names is ready.", "Ett overifierat inlägg påstår att en ny lista med namn är klar."])
            ]),
            ir("i2", { notChosen: "A" }, ["The vote changed", "Omröstningen ändrad"], [
              io(["No reaction", "Ingen reaktion"], ["The group does not react to the change. It looks as if taking the meeting out of reach has worked.", "Gruppen reagerar inte på ändringen. Det ser ut som att det fungerade att ta mötet utom räckhåll."], ["The group has not reacted to the change.", "Gruppen har inte reagerat på ändringen."]),
              io(["“They gave in”", "”De gav efter”"], ["The group celebrates, and the press frames the change as the council giving in to threats. Councillors who opposed it say so on the record.", "Gruppen firar, och pressen beskriver ändringen som att kommunen ger efter för hot. Förtroendevalda som var emot det säger det offentligt."], ["The press reports that the council gave in to threats.", "Pressen rapporterar att kommunen gav efter för hot."], { reopen: true, meters: { media: 1 } }),
              io(["Will it stand?", "Håller det?"], ["Legal cannot confirm that the new arrangement meets the rules on open meetings. It may hold, or the decision may be appealed and overturned.", "Juristerna kan inte bekräfta att det nya upplägget uppfyller reglerna om offentliga sammanträden. Det kan hålla, eller så kan beslutet överklagas och upphävas."], ["Legal cannot confirm the new arrangement will survive an appeal.", "Juristerna kan inte bekräfta att det nya upplägget håller vid en överklagan."])
            ])
          ]
        }),
        facilitator: fac(
          ["End on resilience and democratic values.", "Avsluta med motståndskraft och demokratiska värden."],
          ["The vote held as planned with protection and support.", "Omröstningen genomförd som planerat med skydd och stöd."],
          [["Ask: what message does your choice send to the next group?", "Fråga: vilket budskap sänder ert val till nästa grupp?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The site and services are restored and the vote goes ahead, but the named staff live with the exposure, and the organisation learns that its own data handling made the attack personal.",
        "Webbplatsen och tjänsterna återställs och omröstningen genomförs, men den namngivna personalen lever med exponeringen, och organisationen lär sig att dess egen hantering av uppgifter gjorde angreppet personligt."
      ])
    },

    debrief: {
      keyLessons: [
        L(["When an attack becomes personal, people come before systems.", "När ett angrepp blir personligt kommer människor före system."]),
        L(["Contractor accounts need named access and MFA.", "Konsultkonton behöver namngiven åtkomst och MFA."]),
        L(["Data shared with suppliers should be minimal.", "Uppgifter som delas med leverantörer bör vara minimala."]),
        L(["Communicate care without amplifying the attackers.", "Kommunicera omsorg utan att förstärka angriparna."])
      ],
      assumptionsVsReality: [
        avr(["The website was exploited.", "Webbplatsen utnyttjades."], ["A contractor account was used.", "Ett konsultkonto användes."], "p2"),
        avr(["A website problem.", "Ett webbplatsproblem."], ["Staff safety at risk.", "Personalens säkerhet i fara."], "p3"),
        avr(["Data came from public sources.", "Uppgifterna kom från offentliga källor."], ["It came from an internal export.", "De kom från en intern export."], "p6")
      ],
      strengthsToLookFor: [
        L(["Personal contact with every named employee", "Personlig kontakt med varje namngiven anställd"]),
        L(["Coordination with the police", "Samordning med polisen"]),
        L(["Honesty about the internal source", "Ärlighet om den interna källan"])
      ],
      commonGaps: [
        L(["Focusing on the website while staff are threatened", "Att fokusera på webbplatsen medan personalen hotas"]),
        L(["Engaging the group publicly", "Att bemöta gruppen offentligt"]),
        L(["Over-sharing data with suppliers", "Att dela för mycket uppgifter med leverantörer"])
      ],
      suggestedActions: [
        act(["Require named, MFA-protected accounts for all contractors.", "Kräv namngivna konton med MFA för alla konsulter."], "ciso", "high"),
        act(["Minimise and track personal data shared with suppliers.", "Minimera och spåra personuppgifter som delas med leverantörer."], "dpo", "high"),
        act(["Prepare a staff-protection plan for threats and doxxing.", "Ta fram en plan för skydd av personal vid hot och utlämnande av personuppgifter."], "securityOfficer", "high"),
        act(["Agree DDoS filtering with the provider in advance.", "Kom överens med leverantören om filtrering mot överbelastningsattacker i förväg."], "networkLead", "medium"),
        act(["Prepare a communication line for hacktivist attacks.", "Förbered en kommunikationslinje för hacktivistangrepp."], "comms", "medium")
      ]
    }
  });
})();
