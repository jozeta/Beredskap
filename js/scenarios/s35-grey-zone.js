/*
 * s35-grey-zone.js — "Grey-Zone Week" (archetype E, hybrid threats; long).
 *
 * Monday: false posts claim a data cover-up → the website and app go down
 * under a DDoS that "proves" it → Tuesday: satellite interference stalls the
 * fleet → Wednesday: two fibre routes to the main site are cut, deliberately,
 * and the authorities link everything to one coordinated campaign → the
 * authorities ask for information and restraint → an employee is offered
 * money for site plans → next week: how long can you keep this up?
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s35-grey-zone",
    version: 1,
    category: "hybrid-threat",
    archetype: "compound-crisis",
    emblem: "grey-zone",
    title: L(["Grey-Zone Week", "Gråzonsveckan"]),
    summary: L([
      "A false story, an overloaded website, satellite signals that come and go, and a cut cable. Each one alone is manageable. The question is whether they are alone, and how long your organisation can keep going if they are not.",
      "En falsk berättelse, en överbelastad webbplats, satellitsignaler som kommer och går och en kapad kabel. Var för sig går de att hantera. Frågan är om de är var för sig, och hur länge er organisation orkar om de inte är det."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Counter disinformation without amplifying it", "Bemöta desinformation utan att förstärka den"]), teaser: L(["When a story travels faster than the truth", "När en berättelse färdas snabbare än sanningen"]) },
      { id: "lo2", text: L(["Connect separate incidents into a common picture", "Sätta samman separata händelser till en gemensam lägesbild"]), teaser: L(["Seeing the shape of the week", "Att se veckans mönster"]) },
      { id: "lo3", text: L(["Work with authorities in a national security context", "Samarbeta med myndigheter i ett säkerhetspolitiskt sammanhang"]), teaser: L(["Part of something larger", "En del av något större"]) },
      { id: "lo4", text: L(["Protect staff targeted for recruitment and pressure", "Skydda personal som utsätts för värvningsförsök och påtryckningar"]), teaser: L(["The people behind the systems", "Människorna bakom systemen"]) },
      { id: "lo5", text: L(["Sustain a crisis organisation over many days", "Hålla en krisorganisation igång under många dagar"]), teaser: L(["Endurance", "Uthållighet"]) }
    ],
    mitre: ["T1498", "T1491", "T1585", "T1566", "T1589"],
    frameworks: {
      nistCsf: ["GV.OC", "GV.RR", "ID.RA", "PR.AT", "PR.IR", "DE.AE", "RS.MA", "RS.CO", "RC.CO"],
      iso27001: ["A.5.5", "A.5.6", "A.5.7", "A.5.24", "A.5.26", "A.5.29", "A.6.3", "A.7.4", "A.7.5", "A.8.20"]
    },
    minStages: 4,
    maxStages: 7,
    constraints: { startWindow: "monday-morning" },
    actor: { types: ["state"], motivation: L(["Destabilisation: eroding trust in critical services without open conflict", "Destabilisering: att urholka förtroendet för samhällsviktiga tjänster utan öppen konflikt"]), capability: "high" },
    variables: {
      shares: { min: 4000, max: 90000, step: 100 },
      gbps: { min: 20, max: 160, step: 5 },
      vehicles: { min: 12, max: 300, scaleBy: "size" }
    },
    roles: ["incidentCommander", "ceo", "comms", "ciso", "socLead", "networkLead", "itOps", "securityOfficer", "facilities", "legal", "hr", "serviceOwner"],

    groundTruth: {
      rootCause: L([
        "A state-sponsored influence and sabotage campaign targeted organisations running critical services in the region over one week. It combined fabricated posts and fake leaked documents, a DDoS timed to make the false story look true, local satellite-navigation interference, two deliberate fibre cuts near {{org.name}}'s main site, phishing that reused the false story, and an attempt to recruit an employee for site plans. No single event was severe; together they were designed to exhaust crisis organisations and erode public trust.",
        "En statsunderstödd påverkans- och sabotagekampanj riktades under en vecka mot organisationer som driver samhällsviktiga tjänster i regionen. Den kombinerade påhittade inlägg och falska läckta dokument, en överbelastningsattack tajmad för att få den falska berättelsen att verka sann, lokal störning av satellitnavigering, två avsiktliga fiberavbrott nära {{org.name}}s huvudanläggning, nätfiske som återanvände den falska berättelsen och ett försök att värva en anställd för att få ritningar över anläggningen. Ingen enskild händelse var allvarlig; tillsammans var de utformade för att utmatta krisorganisationer och urholka allmänhetens förtroende."
      ]),
      attackerTimeline: [
        { at: -10080, text: L(["Fake accounts and look-alike news sites prepared.", "Falska konton och efterliknande nyhetssajter förbereds."]) },
        { at: 0, text: L(["False posts and a fake “leaked memo” published.", "Falska inlägg och en falsk ”läckt promemoria” publiceras."]) },
        { at: 480, text: L(["DDoS on the website and customer app.", "Överbelastningsattack mot webbplatsen och kundappen."]) },
        { at: 1440, text: L(["Satellite-navigation interference in the region.", "Störning av satellitnavigering i regionen."]) },
        { at: 2880, text: L(["Two fibre routes to the main site cut.", "Två fibervägar till huvudanläggningen kapas."]) },
        { at: 4320, text: L(["Employee approached with a paid offer for site plans.", "En anställd kontaktas med ett betalt erbjudande om ritningar över anläggningen."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-timed", revealStage: "p2", text: L(["The traffic flood started forty minutes after the false posts peaked, from rented infrastructure.", "Trafikfloden började fyrtio minuter efter att de falska inläggen nått sin topp, från hyrd infrastruktur."]) },
      { id: "hf-campaign", revealStage: "p4", text: L(["Authorities assess all the week's events as one state-backed campaign against several organisations.", "Myndigheterna bedömer veckans alla händelser som en statsunderstödd kampanj mot flera organisationer."]) },
      { id: "hf-recruit", revealStage: "p6", text: L(["A recruiter persona has messaged four employees with access to site plans, offering cash.", "En påhittad rekryterare har skickat meddelanden till fyra anställda med åtkomst till ritningar och erbjudit kontanter."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Monday: the story", "Måndag: berättelsen"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. A post goes viral before most staff have finished their coffee. It claims that {{org.name}} has suffered a huge data breach and is covering it up, and it attaches a “leaked internal memo” on what looks like your letterhead.\n\nThe memo is fake: wrong logo version, a manager who left last year. But it has been shared {{num.shares|number}} times in two hours, and customers are calling to ask whether they should be worried.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Ett inlägg sprids explosionsartat innan de flesta i personalen har druckit upp sitt kaffe. Det påstår att {{org.name}} har drabbats av ett enormt dataintrång och mörkar det, och bifogar en ”läckt intern promemoria” på något som ser ut som ert brevhuvud.\n\nPromemorian är falsk: fel version av logotypen, en chef som slutade förra året. Men den har delats {{num.shares|number}} gånger på två timmar, och kunder ringer för att fråga om de borde vara oroliga."
        ]),
        injects: [
          inj("i1-1", 0, "socialPost", "socialMedia", "high", "misleading", [
            "BREAKING: Leaked memo shows they've known about the breach for weeks and told staff to keep quiet. Your data is out there. Share before they delete this.",
            "JUST NU: Läckt promemoria visar att de har känt till intrånget i flera veckor och sagt åt personalen att hålla tyst. Din data finns där ute. Dela innan de raderar det här."
          ], { headline: ["Shared {{num.shares|number}} times", "Delat {{num.shares|number}} gånger"], facilitatorNote: ["Fabricated. Watch whether the room engages with the claim or checks the document.", "Påhittat. Se om rummet går in i påståendet eller kontrollerar dokumentet."], tests: ["lo1"] }),
          inj("i1-2", 30, "employeeReport", "person.comms", "medium", "confirmed", [
            "The memo uses our 2019 letterhead and is signed by a manager who left last year. The phrasing is close to ours, but some of the Swedish reads like a translation.",
            "Promemorian använder vårt brevhuvud från 2019 och är undertecknad av en chef som slutade förra året. Formuleringarna ligger nära våra, men en del av svenskan låter som en översättning."
          ], { tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("How do you check quickly that there really is no breach?", "Hur kontrollerar ni snabbt att det verkligen inte finns något intrång?", ["ciso", "socLead"]),
            q("Where did the post start, and what accounts are spreading it?", "Var startade inlägget, och vilka konton sprider det?", ["comms", "socLead"]),
            q("What would a real leak of an internal memo look like in your logs?", "Hur skulle en verklig läcka av en intern promemoria se ut i era loggar?", ["socLead"])
          ],
          executive: [
            q("Do you respond publicly, and with what?", "Svarar ni offentligt, och med vad?", ["comms", "ceo"]),
            q("Does denying it make the story bigger?", "Gör ett förnekande berättelsen större?", ["comms"]),
            q("What do you tell staff who are being asked by friends?", "Vad säger ni till personal som får frågor av vänner?", ["hr", "comms"])
          ]
        },
        challenges: [ch("A local radio station asks for an interview within the hour.", "En lokal radiostation vill ha en intervju inom en timme.")],
        decision: dec("d1", "comms", ["How do you respond to the story?", "Hur bemöter ni berättelsen?"], [
          ["Check for a breach, then publish one calm factual statement on your own channels and brief staff and customer service.", "Kontrollera om det skett ett intrång, publicera sedan ett lugnt sakligt uttalande i era egna kanaler och informera personal och kundtjänst."],
          ["Respond directly under the viral post to correct it.", "Svara direkt under det virala inlägget för att rätta det."],
          ["Say nothing publicly until you have checked for a breach; any statement now becomes part of the story.", "Säg ingenting offentligt förrän ni har kontrollerat om det skett ett intrång; varje uttalande nu blir en del av berättelsen."]
        ], {
          knowns: [["A fabricated memo is spreading fast.", "En påhittad promemoria sprids snabbt."]],
          uncertainties: [["Who is behind it and what comes next.", "Vem som ligger bakom och vad som kommer härnäst."]],
          tradeoffs: {
            operational: ["Customer service is overloaded either way.", "Kundtjänst är överbelastad oavsett."],
            security: ["Dismissing it without checking would be careless.", "Att avfärda det utan att kontrollera vore slarvigt."],
            legal: ["Fake documents on your letterhead may be a crime to report.", "Falska dokument på ert brevhuvud kan vara ett brott att anmäla."],
            reputational: ["Replying under the post feeds its reach.", "Att svara under inlägget ökar dess spridning."]
          },
          evaluation: [["Checks the facts and speaks on its own channels without feeding the false post", "Kontrollerar fakta och talar i egna kanaler utan att ge näring åt det falska inlägget"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["After the statement", "Efter uttalandet"], [
              io(["Nothing found", "Inget hittat"], ["The first pass of the logs and mail archive shows no sign of a breach and no internal copy of the memo. Your statement says exactly that, and customer service now has something solid to read out.", "Den första genomgången av loggar och e-postarkiv visar inga tecken på intrång och ingen intern kopia av promemorian. Ert uttalande säger precis det, och kundtjänst har nu något säkert att läsa upp."], ["The first-pass check found no sign of a breach.", "Den första kontrollen hittade inga tecken på intrång."]),
              io(["A doctored copy", "En förfalskad kopia"], ["A look-alike news site publishes your statement with one sentence added: “a limited incident is being investigated”. Customers are quoting the fake version back to customer service as your own words.", "En efterliknande nyhetssajt publicerar ert uttalande med en mening tillagd: ”en begränsad incident utreds”. Kunder citerar den falska versionen för kundtjänst som era egna ord."], ["A doctored version of your statement is circulating as genuine.", "En förfalskad version av ert uttalande sprids som äkta."], { reopen: true, meters: { media: 1 } }),
              io(["An old ticket", "Ett gammalt ärende"], ["The check turns up a closed ticket from last year: a customer email sent to the wrong address and reported at the time. It is not a breach of the kind the post claims, but {{person.legal.name}} asks whether your statement should mention it.", "Kontrollen hittar ett avslutat ärende från förra året: ett kundmejl som skickades till fel adress och anmäldes då. Det är inte ett intrång av det slag inlägget påstår, men {{person.legal.name}} frågar om ert uttalande borde nämna det."], ["The check found an old, closed ticket about a misdirected customer email.", "Kontrollen hittade ett gammalt, avslutat ärende om ett felskickat kundmejl."])
            ]),
            ir("i2", { notChosen: "A" }, ["No calm statement", "Inget lugnt uttalande"], [
              io(["Staff improvise", "Personalen improviserar"], ["Without a checked line, a customer service agent tells a caller that “we are looking into the breach”. The caller posts it within minutes, and it is now the most shared quote of the day.", "Utan en kontrollerad linje säger en handläggare i kundtjänst till en kund att ”vi håller på att utreda intrånget”. Kunden lägger ut det inom några minuter, och det är nu dagens mest delade citat."], ["An agent's “looking into the breach” quote is spreading as confirmation.", "En handläggares citat om att ”utreda intrånget” sprids som en bekräftelse."], { reopen: true, meters: { trust: -1 } }),
              io(["The radio runs it", "Radion sänder"], ["The local radio station leads its bulletin with the memo. Your side of the story is not in it in any form the presenter could read out, and listeners start calling in.", "Lokalradion inleder sin nyhetssändning med promemorian. Er sida av saken finns inte med i någon form som programledaren kunde läsa upp, och lyssnare börjar ringa in."], ["The radio led with the memo, without your position.", "Radion inledde med promemorian, utan er ståndpunkt."], { meters: { media: 1 } }),
              io(["It slows anyway", "Det mattas ändå"], ["By lunchtime the share rate drops on its own. Some in the room say this proves your approach worked; nobody can say whether it was you, the algorithm, or the people behind the post pausing.", "Vid lunch sjunker delningstakten av sig själv. Några i rummet säger att det bevisar att ert sätt fungerade; ingen kan säga om det var ni, algoritmen eller de som ligger bakom inlägget som tog en paus."], ["Shares slowed by lunchtime, and nobody knows why.", "Delningarna mattades av vid lunch, och ingen vet varför."])
            ])
          ],
          pushback: {
            A: [
              pb(["The check takes all day", "Kontrollen tar hela dagen"], ["The security team says a check you can stand behind will take until late afternoon. Meanwhile the shares keep climbing and the radio station wants its interview now. Do you publish before the check is finished, or let silence speak for you for six more hours?", "Säkerhetsteamet säger att en kontroll ni kan stå för tar till sen eftermiddag. Under tiden fortsätter delningarna att öka och radiostationen vill ha sin intervju nu. Publicerar ni innan kontrollen är klar, eller låter ni tystnaden tala för er i sex timmar till?"]),
              pb(["“Can you guarantee it?”", "”Kan ni garantera det?”"], ["Customer service has the script, but callers ask one question it does not answer: “Can you guarantee my data is safe?” Agents who hesitate are being quoted online as proof. What exactly are your agents allowed to promise, when the check only says you found nothing?", "Kundtjänst har manuset, men de som ringer ställer en fråga det inte svarar på: ”Kan ni garantera att min data är säker?” Handläggare som tvekar citeras på nätet som bevis. Vad får era handläggare egentligen lova, när kontrollen bara säger att ni inte hittat något?"]),
              pb(["Your statement, reposted", "Ert uttalande, återpublicerat"], ["The accounts spreading the memo have screenshotted your calm statement and reposted it with one line: “That's what they always say.” Your own words are now part of the story. Do you keep posting updates on your channels, or stop at one statement?", "Kontona som sprider promemorian har tagit en skärmbild av ert lugna uttalande och lagt ut det igen med en rad: ”Det är vad de alltid säger.” Era egna ord är nu en del av berättelsen. Fortsätter ni att lägga ut uppdateringar i era kanaler, eller stannar ni vid ett uttalande?"])
            ],
            B: [
              pb(["Your reply goes viral", "Ert svar sprids"], ["Your reply under the post is now the most shared part of the thread, and every share pushes the original memo to new people. The quote-posts are mocking it. Do you keep replying, delete the reply and look like you are hiding, or let it stand?", "Ert svar under inlägget är nu den mest delade delen av tråden, och varje delning sprider den ursprungliga promemorian till nya människor. Citatinläggen hånar svaret. Fortsätter ni att svara, raderar ni svaret och ser ut att gömma er, eller låter ni det stå kvar?"]),
              pb(["A denial nobody checked", "Ett förnekande ingen kontrollerat"], ["{{person.legal.name}} points out that your public reply says there was no breach, but nobody has checked yet. If the check finds anything at all, that reply becomes the screenshot that proves the cover-up. Do you stand behind a denial you have not verified?", "{{person.legal.name}} påpekar att ert offentliga svar säger att inget intrång har skett, men att ingen har kontrollerat det än. Om kontrollen hittar något alls blir svaret skärmbilden som bevisar mörkläggningen. Står ni bakom ett förnekande ni inte har verifierat?"]),
              pb(["Hundreds of questions", "Hundratals frågor"], ["Under your reply, hundreds of people now ask specific questions: was my account affected, why did you not tell us? Every unanswered question is read as evasion. Who in your team answers them, all day, and with what?", "Under ert svar ställer hundratals personer nu konkreta frågor: drabbades mitt konto, varför sa ni inget? Varje obesvarad fråga tolkas som att ni smiter undan. Vem i ert team svarar på dem, hela dagen, och med vad?"])
            ],
            C: [
              pb(["“No comment”", "”Ingen kommentar”"], ["The radio station reports that {{org.name}} declined to comment, and new posts count the hours of silence. The check is still running. Do you break your silence before you have the answer you were waiting for?", "Radiostationen rapporterar att {{org.name}} avböjt att kommentera, och nya inlägg räknar timmarna av tystnad. Kontrollen pågår fortfarande. Bryter ni tystnaden innan ni har svaret ni väntade på?"]),
              pb(["Staff answer for you", "Personalen svarar åt er"], ["Employees are answering friends online in their own words. One has written: “No idea, nobody tells us anything.” That post is now being shared alongside the memo. Does silence apply to your own staff too, and how do you stop them filling the gap?", "Anställda svarar vänner på nätet med egna ord. En har skrivit: ”Ingen aning, ingen berättar något för oss.” Det inlägget delas nu tillsammans med promemorian. Gäller tystnaden även er egen personal, och hur hindrar ni dem från att fylla tomrummet?"]),
              pb(["Customer service has nothing", "Kundtjänst har ingenting"], ["The queue is growing, and agents have been told to say nothing. Callers are hearing “we cannot comment” and threatening to cancel. How long can customer service hold that line, and who decides when it ends?", "Kön växer, och handläggarna har fått besked att inte säga något. De som ringer får höra ”vi kan inte kommentera” och hotar att säga upp sina avtal. Hur länge kan kundtjänst hålla den linjen, och vem bestämmer när den upphör?"])
            ]
          }
        }),
        facilitator: fac(
          ["Disinformation wants engagement. A calm statement on owned channels beats arguing in replies.", "Desinformation vill ha engagemang. Ett lugnt uttalande i egna kanaler slår att argumentera i svarstrådar."],
          ["Verify, one factual statement on own channels, brief staff and customer service.", "Verifiera, ett sakligt uttalande i egna kanaler, informera personal och kundtjänst."],
          [["Ask: who benefits if you spend the day arguing with this post?", "Fråga: vem tjänar på att ni ägnar dagen åt att argumentera med det här inlägget?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 480,
        title: L(["Monday evening: the proof", "Måndag kväll: beviset"]),
        twist: L(["At 16:40 the website and customer app collapse under a {{num.gbps}} Gbit/s flood. Within minutes, new posts call it proof: “They've taken the site down to hide the breach.”", "Klockan 16.40 kollapsar webbplatsen och kundappen under en flod på {{num.gbps}} Gbit/s. Inom några minuter kallar nya inlägg det för ett bevis: ”De har tagit ner sajten för att dölja intrånget.”"]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because you checked for a breach before saying anything, your first statement came four hours after the story, and many followers read the silence as a confession.", sv: "Eftersom ni kontrollerade intrång innan ni sa något kom ert första uttalande fyra timmar efter berättelsen, och många följare tolkade tystnaden som ett erkännande." } }
        ],
        assumptionChallenged: L(["This is a communications problem.", "Det här är ett kommunikationsproblem."]),
        reveals: ["hf-timed"],
        narrative: L([
          "{{time.T+480|clock}}. The calm statement was working. The share rate had dropped, customer service had a script, and the radio interview went well.\n\nThen the website stops loading, and the customer app with it. {{person.networkLead.name}} watches the traffic graph turn into a wall. On social media, the people who shared the memo this morning have an explanation ready.",
          "Klockan {{time.T+480|clock}}. Det lugna uttalandet fungerade. Delningstakten hade minskat, kundtjänst hade ett manus och radiointervjun gick bra.\n\nSedan slutar webbplatsen ladda, och kundappen med den. {{person.networkLead.name}} ser trafikdiagrammet förvandlas till en vägg. I sociala medier har de som delade promemorian i morse en förklaring färdig."
        ]),
        injects: [
          inj("i2-1", 480, "networkEvidence", "person.networkLead", "critical", "confirmed", [
            "Inbound {{num.gbps}} Gbit/s from rented servers in many countries, starting 16:40, forty minutes after the second wave of posts peaked. Website and app unreachable.",
            "Inkommande {{num.gbps}} Gbit/s från hyrda servrar i många länder, med start 16.40, fyrtio minuter efter att den andra vågen av inlägg nått sin topp. Webbplats och app onåbara."
          ], { reveals: ["hf-timed"], tests: ["lo2"] }),
          inj("i2-2", 500, "socialPost", "socialMedia", "high", "misleading", [
            "And now their website is “down”. Funny how that happens the day the memo leaks. They're deleting evidence.",
            "Och nu ligger deras webbplats ”nere”. Konstigt att det händer samma dag som promemorian läcker. De raderar bevis."
          ], { facilitatorNote: ["The DDoS is being used as narrative fuel. Technical and communication responses must be linked.", "Överbelastningsattacken används som bränsle för berättelsen. Det tekniska och det kommunikativa svaret måste hänga ihop."], tests: ["lo1", "lo2"] })
        ],
        charts: [{
          id: "c2-flood", type: "line",
          title: L(["Inbound traffic", "Inkommande trafik"]), unit: L(["Gbit/s", "Gbit/s"]),
          caption: L(["Minutes around the flood.", "Minuter kring floden."]),
          data: line(["Traffic", "Trafik"], -60, 60, 10, (x, ctx) => (x < 0 ? 2 : ctx.vars.gbps))
        }],
        questions: {
          technical: [
            q("How fast can your provider filter this, and what does it cost?", "Hur snabbt kan er leverantör filtrera det här, och vad kostar det?", ["networkLead"]),
            q("Is anything else happening behind the flood?", "Händer något annat bakom floden?", ["socLead", "ciso"]),
            q("Did checking for a breach this morning give you something solid to say now?", "Gav kontrollen av ett eventuellt intrång i morse er något säkert att säga nu?", ["ciso"], "d1")
          ],
          executive: [
            q("Are the story and the attack connected, and does it matter?", "Hänger berättelsen och angreppet ihop, och spelar det någon roll?", ["incidentCommander", "ceo"]),
            q("What do you tell customers who cannot reach you?", "Vad säger ni till kunder som inte når er?", ["comms", "serviceOwner"]),
            q("Did your calm statement this morning hold up?", "Höll ert lugna uttalande från i morse?", ["comms"], "d1")
          ]
        },
        challenges: [ch("Your own statement is on the website that is now unreachable.", "Ert eget uttalande ligger på webbplatsen som nu är onåbar.")],
        decision: dec("d2", "incidentCommander", ["How do you respond?", "Hur svarar ni?"], [
          ["Treat it as one coordinated incident: filter the traffic, post the facts on channels that still work, and report to {{reg.csirt}}.", "Behandla det som en samordnad incident: filtrera trafiken, lägg ut fakta i de kanaler som fortfarande fungerar och rapportera till {{reg.csirt}}."],
          ["Handle the DDoS technically and leave the story to communications.", "Hantera överbelastningsattacken tekniskt och lämna berättelsen till kommunikationsavdelningen."],
          ["Take the website offline yourselves and serve a static status page, so the attackers no longer set the pace.", "Ta ner webbplatsen själva och visa en statisk statussida, så att angriparna inte längre bestämmer takten."]
        ], {
          knowns: [["A DDoS followed the false story and is being used to support it.", "En överbelastningsattack följde på den falska berättelsen och används för att stödja den."]],
          uncertainties: [["Whether more is coming, and from whom.", "Om mer är på väg, och från vem."]],
          tradeoffs: {
            operational: ["Filtering may block some real customers.", "Filtrering kan blockera en del riktiga kunder."],
            security: ["Separating the two hides the pattern.", "Att skilja de två åt döljer mönstret."],
            legal: ["Reporting to the CSIRT helps others in the region.", "Rapportering till CSIRT hjälper andra i regionen."],
            reputational: ["Taking the site down yourselves confirms the false story.", "Att ta ner sajten själva bekräftar den falska berättelsen."]
          },
          evaluation: [["Links the technical and narrative attack and shares with authorities early", "Kopplar ihop det tekniska och det berättelsebaserade angreppet och delar tidigt med myndigheterna"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["One incident, reported", "En incident, rapporterad"], [
              io(["Back within hours", "Uppe inom några timmar"], ["The provider's filtering, tuned with advice from {{reg.csirt}}, brings the website back within a few hours. Your factual post was already out on the channels that worked, and the “deleting evidence” posts lose their momentum.", "Leverantörens filtrering, justerad med råd från {{reg.csirt}}, får tillbaka webbplatsen inom några timmar. Ert sakliga inlägg låg redan ute i de kanaler som fungerade, och inläggen om att ”radera bevis” tappar fart."], ["Filtering with CSIRT advice had the site back within hours.", "Filtrering med råd från CSIRT fick upp webbplatsen inom några timmar."]),
              io(["The filter fails", "Filtret håller inte"], ["The first filtering attempt collapses when the flood changes shape. The site stays down into the night, and your post saying the attack is “being handled” is now being quoted next to a dead website.", "Det första filtreringsförsöket faller när floden byter form. Sajten ligger nere till långt in på natten, och ert inlägg om att angreppet ”hanteras” citeras nu bredvid en död webbplats."], ["The first filtering attempt failed; the site stayed down into the night.", "Det första filtreringsförsöket misslyckades; sajten låg nere till långt in på natten."], { reopen: true, meters: { media: 1 } }),
              io(["An automatic receipt", "Ett automatiskt kvitto"], ["{{reg.csirt}} answers your report with an automatic receipt and a case number, nothing more. The room cannot tell whether anyone has read it, or whether reporting it publicly as one incident was premature.", "{{reg.csirt}} svarar på er rapport med ett automatiskt kvitto och ett ärendenummer, inget mer. Rummet kan inte avgöra om någon har läst den, eller om det var förhastat att offentligt kalla det en incident."], ["The CSIRT has acknowledged the report, but said nothing yet.", "CSIRT har kvitterat rapporten men ännu inte sagt något."])
            ]),
            ir("i2", { notChosen: "A" }, ["Not joined up", "Inte sammankopplat"], [
              io(["The CSIRT calls", "CSIRT ringer"], ["{{reg.csirt}} calls: they heard about your outage from the news, not from you, and ask why nothing was reported. They want a timeline tonight.", "{{reg.csirt}} ringer: de fick höra om ert avbrott via nyheterna, inte från er, och undrar varför inget rapporterades. De vill ha en tidslinje i kväll."], ["The CSIRT learned of the outage from the news, not from you.", "CSIRT fick veta om avbrottet via nyheterna, inte från er."], { meters: { regulator: 1 } }),
              io(["The story wins the evening", "Berättelsen vinner kvällen"], ["The evening news runs the outage beside this morning's memo, with the posts' explanation and no answer from you on the technical side. Your morning statement is no longer the version people repeat.", "Kvällsnyheterna visar avbrottet bredvid morgonens promemoria, med inläggens förklaring och inget svar från er om det tekniska. Ert uttalande från i morse är inte längre den version folk upprepar."], ["The evening news paired the outage with the memo.", "Kvällsnyheterna kopplade ihop avbrottet med promemorian."], { reopen: true, meters: { media: 1 } }),
              io(["It stops by itself", "Det upphör av sig självt"], ["Late in the evening the flood simply stops. Some in the room say it was a one-off rented attack and the story was a coincidence after all. Nobody knows why it stopped.", "Sent på kvällen upphör floden helt enkelt. Några i rummet säger att det var ett enstaka hyrt angrepp och att berättelsen var en slump trots allt. Ingen vet varför det slutade."], ["The flood stopped on its own late in the evening.", "Floden upphörde av sig själv sent på kvällen."])
            ])
          ],
          pushback: {
            A: [
              pb(["The filter blocks customers", "Filtret blockerar kunder"], ["The provider's filtering is working, but it also drops customers on some mobile networks and abroad. New posts say: “Now they're blocking us so we can't see.” Do you loosen the filter and let more of the flood through, or accept locking out real customers?", "Leverantörens filtrering fungerar, men den stoppar också kunder på vissa mobilnät och i utlandet. Nya inlägg säger: ”Nu blockerar de oss så att vi inte kan se.” Lättar ni på filtret och släpper igenom mer av floden, eller accepterar ni att stänga ute riktiga kunder?"]),
              pb(["The CSIRT wants more", "CSIRT vill ha mer"], ["{{reg.csirt}} thanks you for the report and asks for full traffic logs and a named contact on call through the night. Your network team is already fighting the flood. Who do you take off the incident to serve the report, and is that worth it tonight?", "{{reg.csirt}} tackar för rapporten och ber om fullständiga trafikloggar och en namngiven kontaktperson i beredskap hela natten. Ert nätverksteam slåss redan mot floden. Vem tar ni bort från incidenten för att sköta rapporteringen, och är det värt det i kväll?"]),
              pb(["Maybe it is a coincidence", "Kanske är det en slump"], ["{{person.networkLead.name}} objects: floods like this can be rented by anyone for very little, and an opportunist may simply be riding the story. Calling it one incident in public implies an organised enemy you cannot prove. Do you say the two are linked, or only that both are happening?", "{{person.networkLead.name}} invänder: sådana här trafikfloder kan vem som helst hyra för en struntsumma, och en opportunist kanske bara rider på berättelsen. Att offentligt kalla det en incident antyder en organiserad fiende ni inte kan bevisa. Säger ni att de hänger ihop, eller bara att båda pågår?"])
            ],
            B: [
              pb(["Two teams, two messages", "Två team, två budskap"], ["The network team has told the provider it is “a routine attack”; communications has posted “technical problems”. Posts now put the two side by side as proof that you are lying. Who owns the one message, and how do you take back the other?", "Nätverksteamet har sagt till leverantören att det är ”ett rutinmässigt angrepp”; kommunikationsavdelningen har skrivit ”tekniska problem”. Inlägg ställer nu de två sida vid sida som bevis för att ni ljuger. Vem äger det enda budskapet, och hur tar ni tillbaka det andra?"]),
              pb(["Comms is guessing", "Kommunikation gissar"], ["Communications told customers the site would be back within the hour. Nobody in the technical room had said so, and it is still down. The posts are counting. Does communications get a seat at the technical table after all, or keep guessing?", "Kommunikationsavdelningen sa till kunderna att sajten skulle vara tillbaka inom en timme. Ingen i det tekniska rummet hade sagt det, och den ligger fortfarande nere. Inläggen räknar. Får kommunikation en plats vid det tekniska bordet trots allt, eller fortsätter de att gissa?"]),
              pb(["Forty minutes", "Fyrtio minuter"], ["A journalist has noticed what your network data shows: the flood began forty minutes after the posts peaked. “Coincidence?” Communications has no technical answer, and the technical team is not speaking to the press. Do you keep the two apart, or admit they are one problem?", "En journalist har lagt märke till det era nätverksdata visar: floden började fyrtio minuter efter att inläggen nått sin topp. ”En slump?” Kommunikation har inget tekniskt svar, och det tekniska teamet pratar inte med pressen. Håller ni isär de två, eller medger ni att det är ett problem?"])
            ],
            C: [
              pb(["“Now they admit it”", "”Nu erkänner de”"], ["A screenshot of your static status page is spreading with the caption: “They pulled the site themselves. Draw your own conclusions.” You chose the outage, and the story uses it. Do you bring the site back under attack just to prove there is nothing to hide?", "En skärmbild av er statiska statussida sprids med texten: ”De tog ner sajten själva. Dra era egna slutsatser.” Ni valde avbrottet, och berättelsen använder det. Tar ni upp sajten igen under angrepp bara för att visa att ni inte har något att dölja?"]),
              pb(["No end date", "Inget slutdatum"], ["{{person.serviceOwner.name}} reports that customers cannot log in, pay or book anything. The provider says filtering could have had the site back tonight; now the outage is yours, and nobody has set an end. Who decides when it comes back, and on what signal?", "{{person.serviceOwner.name}} rapporterar att kunderna inte kan logga in, betala eller boka något. Leverantören säger att filtrering kunde ha haft sajten uppe i kväll; nu är avbrottet ert, och ingen har bestämt när det tar slut. Vem bestämmer när den kommer tillbaka, och på vilken signal?"]),
              pb(["The flood moves", "Floden flyttar"], ["With the website gone, the traffic has shifted to your mail gateway and the customer phone system's web interface. The attackers still set the pace; they just picked a new target. Do you take those offline too, and where does that stop?", "När webbplatsen är borta har trafiken flyttat till er e-postgateway och kundtelefonins webbgränssnitt. Angriparna bestämmer fortfarande takten; de valde bara ett nytt mål. Tar ni ner dem också, och var slutar det?"])
            ]
          }
        }),
        facilitator: fac(
          ["Hybrid threats are designed to be handled in silos. The point is to join them up.", "Hybridhot är utformade för att hanteras i stuprör. Poängen är att koppla ihop dem."],
          ["One incident, technical filtering plus factual messaging on alternative channels, CSIRT report.", "En incident, teknisk filtrering plus saklig kommunikation i alternativa kanaler, rapport till CSIRT."],
          [["Ask: if this was planned, what would the planner want you to do next?", "Fråga: om det här var planerat, vad skulle den som planerade vilja att ni gör härnäst?"]]
        )
      },
      {
        id: "p3",
        clock: 1440,
        priority: 1,
        title: L(["Tuesday: lost signals", "Tisdag: förlorade signaler"]),
        twist: L(["Satellite navigation is disrupted across the region. {{num.vehicles}} vehicles in your fleet lose positioning, route planning fails, and two time-dependent systems start drifting.", "Satellitnavigeringen störs i hela regionen. {{num.vehicles}} fordon i er fordonsflotta tappar positioneringen, ruttplaneringen fallerar och två tidsberoende system börjar glida."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "The viral post now has a million views and has been quoted by a member of parliament. Does your Monday answer still stand?", sv: "Det virala inlägget har nu en miljon visningar och har citerats av en riksdagsledamot. Står ert svar från i måndags sig?" } },
        assumptionChallenged: L(["The website and the story are the whole problem.", "Webbplatsen och berättelsen är hela problemet."]),
        narrative: L([
          "{{time.T+1440|weekday|cap}}. The website is back behind filtering and the story is fading. The crisis team had planned to scale down to a morning meeting.\n\nAt eight, the fleet coordinator calls. Vehicles across the region are showing positions in the sea or at the airport, and the route planning system has given up. {{person.facilities.name}} reports odd behaviour on the building's own clocks.",
          "{{time.T+1440|weekday|cap}}. Webbplatsen är tillbaka bakom filtrering och berättelsen klingar av. Krisledningen hade planerat att trappa ner till ett morgonmöte.\n\nKlockan åtta ringer fordonssamordnaren. Fordon i hela regionen visar positioner ute i havet eller på flygplatsen, och ruttplaneringssystemet har gett upp. {{person.facilities.name}} rapporterar konstigt beteende i byggnadens egna klockor."
        ]),
        injects: [
          inj("i3-1", 1440, "advisory", "csirt", "high", "confirmed", [
            "Satellite navigation interference is affecting the region since 06:30. Expect positioning and timing errors. Use fallback procedures.",
            "Störning av satellitnavigering påverkar regionen sedan 06.30. Räkna med fel i positionering och tid. Använd reservrutiner."
          ], { headline: ["Navigation interference in the region", "Störning av navigering i regionen"], tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("Which of your systems depend on satellite positioning or timing?", "Vilka av era system är beroende av satellitbaserad positionering eller tid?", ["itOps", "facilities"]),
            q("What are your fallback procedures, and does anyone know them?", "Vilka är era reservrutiner, och kan någon dem?", ["facilities", "serviceOwner"]),
            q("Did reporting to the CSIRT yesterday bring anything back to you today?", "Gav rapporten till CSIRT i går er något tillbaka i dag?", ["socLead"], "d2")
          ],
          executive: [
            q("Is this part of the same thing?", "Är det här en del av samma sak?", ["incidentCommander"]),
            q("How long can the fleet run on paper maps and phone calls?", "Hur länge kan fordonsflottan klara sig på papperskartor och telefonsamtal?", ["serviceOwner"]),
            q("Is treating everything as one incident still right, or is that overthinking?", "Är det fortfarande rätt att behandla allt som en incident, eller är det att överanalysera?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("The crisis team has slept four hours each and has meetings scheduled all week.", "Krisledningen har sovit fyra timmar var och har möten inbokade hela veckan.")],
        decision: dec("d3", "incidentCommander", ["How do you organise for the rest of the week?", "Hur organiserar ni er för resten av veckan?"], [
          ["Move to a shift pattern for the crisis team, switch the fleet to manual routines, and keep one common picture.", "Gå över till skiftschema i krisledningen, ställ om fordonsflottan till manuella rutiner och behåll en gemensam lägesbild."],
          ["Keep the same team going until it is over.", "Låt samma team fortsätta tills det är över."],
          ["Scale the central team down to a daily check-in and let each department run its own disruption.", "Skala ner den centrala krisledningen till en daglig avstämning och låt varje avdelning hantera sin egen störning."]
        ], {
          knowns: [["A third, unrelated-looking disruption has started.", "En tredje störning, som ser orelaterad ut, har börjat."]],
          uncertainties: [["How long the week will last.", "Hur länge veckan kommer att pågå."]],
          tradeoffs: {
            operational: ["Shifts need deputies who know the picture.", "Skift kräver ersättare som känner till läget."],
            security: ["Tired people miss patterns.", "Trötta människor missar mönster."],
            legal: ["Working-time rules still apply in a crisis.", "Arbetstidsreglerna gäller även i en kris."],
            reputational: ["Fragmented responses send mixed messages.", "Splittrade insatser ger motstridiga budskap."]
          },
          evaluation: [["Plans for endurance and keeps a single common picture", "Planerar för uthållighet och behåller en gemensam lägesbild"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["The first shift change", "Det första skiftbytet"], [
              io(["A clean handover", "En ren överlämning"], ["The first handover works. The night shift reads the common picture and notices that the drifting clocks in facilities and the time errors in an IT log server started at the same moment as the fleet's problems.", "Den första överlämningen fungerar. Nattskiftet läser den gemensamma lägesbilden och ser att klockorna som glider hos fastighetsavdelningen och tidsfelen i en loggserver hos IT började samtidigt som fordonsflottans problem."], ["The first handover went smoothly and linked the time errors.", "Den första överlämningen gick smidigt och kopplade ihop tidsfelen."]),
              io(["Out-of-date routes", "Inaktuella rutter"], ["The fleet's manual routine turns out to list depots and contact numbers that changed two years ago. Deliveries to municipalities miss their slots all morning while drivers phone around.", "Fordonsflottans manuella rutin visar sig innehålla depåer och telefonnummer som ändrades för två år sedan. Leveranser till kommunerna missar sina tider hela förmiddagen medan förarna ringer runt."], ["The manual fleet routine was out of date; morning deliveries were missed.", "Fordonsflottans manuella rutin var inaktuell; förmiddagens leveranser missades."], { reopen: true, meters: { trust: -1 } }),
              io(["A quiet night", "En lugn natt"], ["The interference eases overnight and the night shift has little to do. {{person.ceo.name}} asks over breakfast whether paying for shifts was necessary, or whether the room overreacted.", "Störningen lättar under natten och nattskiftet har lite att göra. {{person.ceo.name}} frågar vid frukosten om det var nödvändigt att betala för skift, eller om rummet överreagerade."], ["The interference eased overnight; the CEO questions the cost of shifts.", "Störningen lättade under natten; vd ifrågasätter kostnaden för skiften."])
            ]),
            ir("i2", { notChosen: "A" }, ["No shifts, no fallback", "Inga skift, ingen reserv"], [
              io(["A tired mistake", "Ett trött misstag"], ["Late in the evening an exhausted coordinator sends a priority delivery to the wrong municipality. It is found two hours later, by the customer, not by you.", "Sent på kvällen skickar en utmattad samordnare en prioriterad leverans till fel kommun. Det upptäcks två timmar senare, av kunden och inte av er."], ["An exhausted coordinator misrouted a priority delivery.", "En utmattad samordnare skickade en prioriterad leverans fel."], { reopen: true, meters: { trust: -1 } }),
              io(["Clocks out of step", "Klockor i otakt"], ["Two systems now disagree on the time by several minutes, and a night of log entries carries the wrong timestamps. Nobody had the overview to notice until the morning.", "Två system är nu oense om tiden med flera minuter, och en natts loggposter har fel tidsstämplar. Ingen hade överblicken att märka det förrän på morgonen."], ["A night of logs carries the wrong timestamps.", "En natts loggar har fel tidsstämplar."]),
              io(["Holding up fine", "Det håller bra"], ["Positioning comes back in the afternoon, and the team says it can keep going as it is. Nobody has slept much, but nobody has made a visible mistake either.", "Positioneringen kommer tillbaka på eftermiddagen, och teamet säger att det kan fortsätta som nu. Ingen har sovit mycket, men ingen har heller gjort något synligt misstag."], ["Positioning returned for now; the team says it can keep going.", "Positioneringen är tillbaka tills vidare; teamet säger att det orkar fortsätta."])
            ])
          ],
          pushback: {
            A: [
              pb(["No deputies who know", "Inga ersättare som kan läget"], ["Drawing up the shift plan shows that half the crisis roles have no deputy who was here on Monday. The night shift would be people learning the picture from a handover note. Do you accept a less informed night, or keep the experts on and call it shifts?", "När skiftschemat ritas upp visar det sig att hälften av krisrollerna saknar en ersättare som var med i måndags. Nattskiftet skulle bestå av personer som lär sig läget från en överlämningsanteckning. Accepterar ni en sämre informerad natt, eller låter ni experterna stanna kvar och kallar det skift?"]),
              pb(["The drivers push back", "Förarna säger ifrån"], ["Drivers say manual routes on paper maps double their working day, and one depot refuses to send vehicles to addresses nobody can find. The fleet's manual routine exists only on paper. Do you cut the service you promised, or overrule the depot?", "Förarna säger att manuella rutter med papperskartor fördubblar deras arbetsdag, och en depå vägrar skicka fordon till adresser ingen hittar. Fordonsflottans manuella rutin finns bara på papper. Drar ni ner på tjänsten ni har lovat, eller kör ni över depån?"]),
              pb(["Is this overreacting?", "Är det här en överreaktion?"], ["{{person.ceo.name}} questions the plan: the website is back, the story is fading, and the navigation problem is regional, not yours. A shift-based crisis organisation all week costs overtime and signals panic. Can you defend a full crisis footing for three disruptions that each look minor?", "{{person.ceo.name}} ifrågasätter planen: webbplatsen är tillbaka, berättelsen klingar av och navigeringsproblemet är regionalt, inte ert. En skiftbaserad krisorganisation hela veckan kostar övertid och signalerar panik. Kan ni försvara full krisberedskap för tre störningar som var för sig ser små ut?"])
            ],
            B: [
              pb(["The first mistake", "Det första misstaget"], ["A tired coordinator has sent three vehicles to the wrong district, and {{person.networkLead.name}} nearly removed the website filtering by mistake. Nobody wants to be the one who goes home. Who decides that someone must leave, and who takes their place?", "En trött samordnare har skickat tre fordon till fel område, och {{person.networkLead.name}} tog nästan bort webbplatsens filtrering av misstag. Ingen vill vara den som går hem. Vem bestämmer att någon måste gå, och vem tar deras plats?"]),
              pb(["HR draws a line", "HR drar en gräns"], ["{{person.hr.name}} reports that two members of the team have been working for over thirty hours and one nearly fell asleep at the wheel driving home last night. Working-time rules still apply. Do you send people home against their will, in the middle of a crisis?", "{{person.hr.name}} rapporterar att två i teamet har arbetat i över trettio timmar och att en nästan somnade vid ratten på väg hem i natt. Arbetstidsreglerna gäller fortfarande. Skickar ni hem folk mot deras vilja, mitt i en kris?"]),
              pb(["Until when?", "Till när?"], ["The CSIRT cannot say how long the navigation interference will last. “Until it is over” has no date, and the team is already planning around it. How do you run a team with no finish line, and what happens if it lasts all week?", "CSIRT kan inte säga hur länge störningen av navigeringen kommer att pågå. ”Tills det är över” har inget datum, och teamet planerar redan utifrån det. Hur leder ni ett team utan mållinje, och vad händer om det pågår hela veckan?"])
            ],
            C: [
              pb(["Nobody joins the dots", "Ingen ser sambanden"], ["Facilities is handling the drifting clocks, IT has found the same time drift in a log server, and the fleet is fighting positioning errors. The three departments have not spoken. With the central team on a daily check-in, who sees that it is one problem?", "Fastighetsavdelningen hanterar klockorna som glider, IT har hittat samma tidsavvikelse i en loggserver och fordonsflottan kämpar med positioneringsfel. De tre avdelningarna har inte pratat med varandra. Med krisledningen nere på en daglig avstämning, vem ser att det är ett problem?"]),
              pb(["Three versions", "Tre versioner"], ["Customer service blames delays on “IT problems”, the fleet tells municipalities it is satellite interference, and the website says all is normal. A local reporter has collected all three. Who now decides what {{org.name}} says, if not the central team?", "Kundtjänst skyller förseningarna på ”IT-problem”, fordonsflottan säger till kommunerna att det är satellitstörningar och webbplatsen säger att allt är normalt. En lokal reporter har samlat alla tre. Vem bestämmer nu vad {{org.name}} säger, om inte krisledningen?"]),
              pb(["One contact, please", "En kontaktperson, tack"], ["{{reg.csirt}} asks for a single point of contact for the regional picture. Three departments have each sent their own reports, with different times and different numbers. Who answers for {{org.name}}, and from what picture?", "{{reg.csirt}} ber om en enda kontaktpunkt för den regionala lägesbilden. Tre avdelningar har skickat var sin rapport, med olika tider och olika siffror. Vem svarar för {{org.name}}, och utifrån vilken lägesbild?"])
            ]
          }
        }),
        facilitator: fac(
          ["The campaign is designed to exhaust. Endurance becomes a decision, not an afterthought.", "Kampanjen är utformad för att utmatta. Uthållighet blir ett beslut, inte en eftertanke."],
          ["Shifts, deputies, manual fallbacks, one common picture.", "Skift, ersättare, manuella reservrutiner, en gemensam lägesbild."],
          [["Ask: who in this room should be asleep right now?", "Fråga: vem i det här rummet borde sova just nu?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 2880,
        title: L(["Wednesday: the cable", "Onsdag: kabeln"]),
        twist: L(["Both fibre routes to the main site are cut, at two places a kilometre apart, within ten minutes of each other. The police say it was deliberate, and the security service tells you that this week's events are assessed as one coordinated campaign against several organisations in the region.", "Båda fibervägarna till huvudanläggningen kapas, på två platser en kilometer ifrån varandra, inom tio minuter. Polisen säger att det var avsiktligt, och säkerhetstjänsten meddelar att veckans händelser bedöms som en samordnad kampanj mot flera organisationer i regionen."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because the crisis team moved to shifts, the night shift did not know what the day shift had promised the authorities, and the first fibre cut was logged as a routine fault.", sv: "Eftersom krisledningen gick över till skift visste nattskiftet inte vad dagskiftet hade lovat myndigheterna, och det första fiberavbrottet loggades som ett vanligt fel." } }
        ],
        assumptionChallenged: L(["We are having a run of bad luck.", "Vi har en period av otur."]),
        reveals: ["hf-campaign"],
        narrative: L([
          "{{time.T+2880|weekday|cap}}, morning. The main site goes offline: no internet, no connection to the data centre, no phones on the fixed network. {{person.networkLead.name}} switches to the backup mobile links, which carry about a tenth of the normal traffic.\n\nAt eleven, two plain-clothes officers ask for {{person.securityOfficer.name}} at reception. What they have to say changes how everyone in the room sees Monday and Tuesday.",
          "{{time.T+2880|weekday|cap}}, förmiddag. Huvudanläggningen tappar förbindelsen: inget internet, ingen anslutning till datahallen, inga telefoner på det fasta nätet. {{person.networkLead.name}} går över till reservförbindelserna via mobilnätet, som klarar ungefär en tiondel av den normala trafiken.\n\nKlockan elva frågar två civilklädda polisanställda efter {{person.securityOfficer.name}} i receptionen. Det de har att säga ändrar hur alla i rummet ser på måndagen och tisdagen."
        ]),
        injects: [
          inj("i4-1", 2880, "ticket", "person.networkLead", "critical", "confirmed", [
            "Both fibre routes to the main site down at 05:52 and 06:01. The carrier reports physical cuts at two locations, 1.1 km apart. Backup mobile links active at about 10 percent capacity.",
            "Båda fibervägarna till huvudanläggningen nere 05.52 och 06.01. Operatören rapporterar fysiska avbrott på två platser, 1,1 km ifrån varandra. Reservförbindelser via mobilnätet aktiva med ungefär 10 procents kapacitet."
          ], { tests: ["lo2"] }),
          inj("i4-2", 2940, "phoneTranscript", "police", "high", "confirmed", [
            "The officers: “The cuts were made with tools, by people who knew where to dig. Together with the security service, we assess the posts, the overload, the interference and this as one campaign. You are not the only target.”",
            "Polisen: ”Kablarna kapades med verktyg, av personer som visste var de skulle gräva. Tillsammans med säkerhetstjänsten bedömer vi inläggen, överbelastningen, störningen och det här som en kampanj. Ni är inte det enda målet.”"
          ], { reveals: ["hf-campaign"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c4-kpi", type: "kpi",
          title: L(["The week so far", "Veckan hittills"]),
          data: kpi([
            { id: "sh", label: ["Shares of the false memo", "Delningar av den falska promemorian"], value: (v) => v.shares, tone: "warn" },
            { id: "gb", label: ["Peak flood (Gbit/s)", "Toppflöde (Gbit/s)"], value: (v) => v.gbps, tone: "warn" },
            { id: "veh", label: ["Vehicles without positioning", "Fordon utan positionering"], value: (v) => v.vehicles, tone: "warn" },
            { id: "fib", label: ["Fibre routes cut", "Kapade fibervägar"], value: 2, tone: "danger" }
          ])
        }],
        questions: {
          technical: [
            q("What must run on ten percent of normal capacity, and what can wait?", "Vad måste köras på tio procent av normal kapacitet, och vad kan vänta?", ["networkLead", "itOps"]),
            q("What else at the site is physically exposed in the same way?", "Vad mer vid anläggningen är fysiskt exponerat på samma sätt?", ["facilities", "securityOfficer"]),
            q("Did the shift pattern help you meet this with rested people?", "Hjälpte skiftschemat er att möta det här med utvilade personer?", ["incidentCommander"], "d3")
          ],
          executive: [
            q("What changes now that you know it is a campaign?", "Vad ändras nu när ni vet att det är en kampanj?", ["ceo", "incidentCommander"]),
            q("What can you say publicly, and what must you not?", "Vad kan ni säga offentligt, och vad får ni inte säga?", ["comms", "legal"]),
            q("Looking at the whole week, was joining the incidents up on Monday right?", "När ni ser på hela veckan, var det rätt att koppla ihop händelserna i måndags?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("Staff are frightened, and some ask whether they are safe coming to work.", "Personalen är rädd, och en del frågar om det är säkert att komma till jobbet.")],
        decision: dec("d4", "ceo", ["How do you respond to a campaign?", "Hur svarar ni på en kampanj?"], [
          ["Raise physical security, prioritise essential services on the backup links, share fully with authorities, and brief staff honestly about their safety.", "Höj det fysiska skyddet, prioritera samhällsviktiga tjänster på reservförbindelserna, dela fullt ut med myndigheterna och informera personalen ärligt om deras säkerhet."],
          ["Focus on restoring connectivity and leave the rest to the authorities.", "Fokusera på att återställa förbindelserna och lämna resten till myndigheterna."],
          ["Go public that you are under attack by a foreign state.", "Gå ut offentligt med att ni angrips av en främmande stat."]
        ], {
          knowns: [["The week's events are one deliberate campaign.", "Veckans händelser är en avsiktlig kampanj."]],
          uncertainties: [["What the campaign's next step is.", "Vad kampanjens nästa steg är."]],
          tradeoffs: {
            operational: ["Raising security slows everyday work.", "Att höja skyddet bromsar vardagsarbetet."],
            security: ["Leaving it all to authorities ignores what only you can protect.", "Att lämna allt till myndigheterna bortser från det som bara ni kan skydda."],
            legal: ["Attributing to a state is not your call to make publicly.", "Att peka ut en stat är inte ert beslut att fatta offentligt."],
            reputational: ["Fear among staff spreads faster than any post.", "Rädsla bland personalen sprids snabbare än något inlägg."]
          },
          evaluation: [["Protects people and essential services and stays aligned with authorities", "Skyddar människor och samhällsviktiga tjänster och håller linje med myndigheterna"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["On a raised footing", "Med höjd beredskap"], [
              io(["The guards notice", "Vakterna lägger märke"], ["On the first extra round, a guard notices a car parked by the perimeter with someone photographing the fence and the cable ducts. The plate is noted and passed to the police, who thank you.", "Under den första extra ronden ser en vakt en bil parkerad vid staketet, där någon fotograferar stängslet och kabelkanalerna. Registreringsnumret noteras och lämnas till polisen, som tackar."], ["Guards logged someone photographing the perimeter and told the police.", "Vakterna noterade någon som fotograferade staketet och meddelade polisen."]),
              io(["The backup links drop", "Reservförbindelserna faller"], ["Applying the new priority rules on the backup links overloads them, and they drop out completely for almost an hour. For that hour, the essential services you meant to protect had no connection at all.", "När de nya prioriteringsreglerna läggs på reservförbindelserna överbelastas de, och de faller helt i nästan en timme. Under den timmen hade de samhällsviktiga tjänster ni ville skydda ingen förbindelse alls."], ["The backup links dropped for an hour under the new priority rules.", "Reservförbindelserna föll i en timme under de nya prioriteringsreglerna."], { reopen: true }),
              io(["Nothing back", "Inget tillbaka"], ["The police receive everything you share and confirm it has arrived, but say they cannot tell you anything in return. Some in the room wonder what sharing fully has bought you.", "Polisen tar emot allt ni delar och bekräftar att det har kommit fram, men säger att de inte kan berätta något i gengäld. Några i rummet undrar vad det har gett er att dela fullt ut."], ["The police accepted your material but shared nothing back.", "Polisen tog emot ert material men delade inget tillbaka."])
            ]),
            ir("i2", { notChosen: "A" }, ["Without the full response", "Utan hela insatsen"], [
              io(["A lifted cover", "Ett lyft lock"], ["Facilities finds a manhole cover near the cooling intake lifted overnight. Nothing inside is damaged, and nobody knows whether it was a contractor, curiosity or someone checking what is there.", "Fastighetsavdelningen hittar ett brunnslock nära kylintaget som har lyfts under natten. Inget därnere är skadat, och ingen vet om det var en entreprenör, nyfikenhet eller någon som kontrollerade vad som finns där."], ["A manhole cover near the cooling intake was found lifted; nothing was damaged.", "Ett brunnslock nära kylintaget hittades lyft; inget var skadat."]),
              io(["Staff hear it elsewhere", "Personalen hör det på annat håll"], ["A repair crew tells staff at the gate that the cables were cut on purpose. By lunch, rumours of sabotage are all over the building, and employees ask why management told them nothing.", "Ett reparationslag berättar för personal vid grinden att kablarna kapades med avsikt. Vid lunch går rykten om sabotage i hela huset, och de anställda frågar varför ledningen inte berättade något."], ["Staff heard about the sabotage from a repair crew, not from management.", "Personalen fick höra om sabotaget från ett reparationslag, inte från ledningen."], { reopen: true }),
              io(["One route back", "En väg tillbaka"], ["The carrier gets one fibre route partly working by evening, faster than expected. The mood in the room lifts, and some say the worst is over.", "Operatören får en fiberväg delvis i drift till kvällen, snabbare än väntat. Stämningen i rummet lättar, och några säger att det värsta är över."], ["One fibre route was partly restored by the evening.", "En fiberväg var delvis återställd till kvällen."])
            ])
          ],
          pushback: {
            A: [
              pb(["A tenth is not enough", "En tiondel räcker inte"], ["Putting essential services first on the backup links leaves nothing for payroll, email to customers or the planning tools at the main site, possibly for days. Department heads are already at the door. Which of them do you tell they are switched off, and for how long?", "Att prioritera samhällsviktiga tjänster på reservförbindelserna lämnar ingenting kvar till lönesystemet, e-post till kunder eller planeringsverktygen på huvudanläggningen, kanske i flera dagar. Avdelningscheferna står redan i dörren. Vem av dem säger ni att de är avstängda, och hur länge?"]),
              pb(["Honesty empties the building", "Ärligheten tömmer huset"], ["After the honest briefing, staff ask whether they could be targeted at home, and several on tonight's shift at the main site have called in. The site now runs short-handed. How honest can you be about a threat without emptying the place you need to protect?", "Efter den ärliga informationen frågar personalen om de kan bli måltavlor hemma, och flera i kvällens skift på huvudanläggningen har sjukanmält sig. Anläggningen är nu underbemannad. Hur ärliga kan ni vara om ett hot utan att tömma den plats ni behöver skydda?"]),
              pb(["Sharing “fully”", "Att dela ”fullt ut”"], ["{{person.legal.name}} warns that the logs you want to hand over contain customer data, staff names and details covered by supplier contracts. A legal review takes days; the police want it today. Do you share everything now, or slow down the one thing the authorities asked for?", "{{person.legal.name}} varnar för att loggarna ni vill lämna över innehåller kunduppgifter, personalnamn och detaljer som omfattas av leverantörsavtal. En juridisk granskning tar dagar; polisen vill ha det i dag. Delar ni allt nu, eller bromsar ni det enda myndigheterna bad om?"])
            ],
            B: [
              pb(["The crime scene", "Brottsplatsen"], ["The carrier's repair crews are ready, but the police have cordoned off both cut sites as crime scenes. Restoring connectivity now depends on the authorities you planned to leave everything to. Do you press the police to release the sites, and what do you do while you wait?", "Operatörens reparationslag står redo, men polisen har spärrat av båda platserna som brottsplatser. Att återställa förbindelserna hänger nu på de myndigheter ni tänkte lämna allt åt. Pressar ni polisen att släppa platserna, och vad gör ni medan ni väntar?"]),
              pb(["Staff saw the officers", "Personalen såg poliserna"], ["Half the building saw two plain-clothes officers at reception, and rumours are spreading faster than the facts. A union representative asks what management is doing to keep people safe. “The authorities are handling it” is not an answer they will accept. What do you tell them?", "Halva huset såg två civilklädda poliser i receptionen, och ryktena sprids snabbare än fakta. En fackligt förtroendevald frågar vad ledningen gör för att skydda personalen. ”Myndigheterna hanterar det” är inget svar de godtar. Vad säger ni till dem?"]),
              pb(["Only you know the site", "Bara ni känner anläggningen"], ["The police ask which other cables, power feeds and cooling intakes run outside your fence, and who knows where they are. Nobody outside {{org.name}} can answer. If the rest is left to the authorities, who answers that question, and protects what it reveals?", "Polisen frågar vilka andra kablar, elmatningar och kylintag som går utanför ert staket, och vem som vet var de finns. Ingen utanför {{org.name}} kan svara. Om resten lämnas åt myndigheterna, vem besvarar den frågan och skyddar det svaret avslöjar?"])
            ],
            C: [
              pb(["The security service objects", "Säkerhetstjänsten invänder"], ["The security service has not named anyone publicly and says your statement could damage an investigation involving other organisations. They ask you to withdraw the attribution. Do you stand by a claim you cannot prove yourselves, or retract it in public?", "Säkerhetstjänsten har inte pekat ut någon offentligt och säger att ert uttalande kan skada en utredning som rör flera organisationer. De ber er att ta tillbaka utpekandet. Står ni fast vid ett påstående ni inte själva kan bevisa, eller tar ni tillbaka det offentligt?"]),
              pb(["Questions you raised", "Frågor ni själva väckte"], ["Customers now ask whether your services are safe to rely on, and municipalities ask whether they should activate their own contingency plans. Your statement raised these questions. Can you answer them, and who handles the calls?", "Kunderna frågar nu om de kan lita på era tjänster, och kommunerna frågar om de ska aktivera sina egna reservplaner. Ert uttalande väckte de här frågorna. Kan ni besvara dem, och vem tar hand om samtalen?"]),
              pb(["The story feeds on it", "Berättelsen lever på det"], ["The accounts that spread Monday's memo are now quoting your statement: “Even they admit it's a war, and they still won't tell you about your data.” Your words have become fuel for the next wave. How do you take the initiative back without saying more?", "Kontona som spred måndagens promemoria citerar nu ert uttalande: ”Till och med de erkänner att det är krig, och de berättar ändå inget om din data.” Era ord har blivit bränsle för nästa våg. Hur tar ni tillbaka initiativet utan att säga mer?"])
            ]
          }
        }),
        facilitator: fac(
          ["The reframe: not bad luck but a campaign. The organisation becomes part of a national picture.", "Omtolkningen: inte otur utan en kampanj. Organisationen blir en del av en nationell lägesbild."],
          ["Physical security up, essential services first, full sharing, honest staff briefing.", "Höjt fysiskt skydd, samhällsviktiga tjänster först, fullt informationsutbyte, ärlig information till personalen."],
          [["Ask: what does a campaign want that a single incident does not?", "Fråga: vad vill en kampanj som en enskild incident inte vill?"]]
        )
      },
      {
        id: "p5",
        clock: 3600,
        priority: 2,
        title: L(["Wednesday evening: restraint", "Onsdag kväll: återhållsamhet"]),
        twist: L(["The authorities ask you to share all logs and observations with them, and to say nothing publicly about the campaign or the fibre cuts while they work. A journalist already knows about the cables.", "Myndigheterna ber er dela alla loggar och iakttagelser med dem, och att inte säga något offentligt om kampanjen eller fiberavbrotten medan de arbetar. En journalist känner redan till kablarna."]),
        twistKind: "authority",
        assumptionChallenged: L(["We decide what we tell the public.", "Vi bestämmer vad vi berättar för allmänheten."]),
        narrative: L([
          "{{time.T+3600|clock}}. A liaison officer from the regional civil preparedness authority joins the crisis meeting by phone, along with the police. They thank the team for the reports sent on Monday and Tuesday.\n\nThey also have two requests. One is easy. The other puts {{person.comms.name}} in a difficult position, because a local reporter called an hour ago asking about “sabotage near your site”.",
          "Klockan {{time.T+3600|clock}}. En sambandsperson från den regionala beredskapsmyndigheten ansluter till krismötet per telefon, tillsammans med polisen. De tackar teamet för rapporterna som skickades i måndags och tisdags.\n\nDe har också två önskemål. Det ena är enkelt. Det andra sätter {{person.comms.name}} i en svår sits, eftersom en lokal reporter ringde för en timme sedan och frågade om ”sabotage nära er anläggning”."
        ]),
        injects: [
          inj("i5-1", 3600, "regulatorLetter", "regulator", "high", "confirmed", [
            "Request: share all technical indicators, logs and observations from this week with the national coordination cell. Do not comment publicly on the fibre cuts or a possible campaign while the investigation is under way.",
            "Begäran: dela alla tekniska indikatorer, loggar och iakttagelser från veckan med den nationella samordningsfunktionen. Kommentera inte offentligt fiberavbrotten eller en möjlig kampanj medan utredningen pågår."
          ], { headline: ["Request from the coordination cell", "Begäran från samordningsfunktionen"], tests: ["lo3"] }),
          inj("i5-2", 3660, "mediaEnquiry", "media", "medium", "confirmed", [
            "“We hear two fibre cables near your site were cut on purpose this morning. Is this connected to Monday's website problems and the leaked memo?”",
            "”Vi hör att två fiberkablar nära er anläggning kapades med avsikt i morse. Hänger det ihop med måndagens problem med webbplatsen och den läckta promemorian?”"
          ], { tests: ["lo1", "lo3"] })
        ],
        questions: {
          technical: [
            q("What can you share quickly that is actually useful to others?", "Vad kan ni dela snabbt som faktiskt är till nytta för andra?", ["socLead", "networkLead"]),
            q("How do you share logs safely when your main site is half offline?", "Hur delar ni loggar säkert när huvudanläggningen är halvt nedkopplad?", ["itOps"]),
            q("Did raising physical security change anything you have seen since?", "Ändrade det höjda fysiska skyddet något ni har sett sedan dess?", ["securityOfficer"], "d4")
          ],
          executive: [
            q("What do you tell the journalist without breaking the request?", "Vad säger ni till journalisten utan att bryta mot begäran?", ["comms", "legal"]),
            q("Who decides when your duty to customers outweighs the authorities' request?", "Vem bestämmer när er skyldighet mot kunderna väger tyngre än myndigheternas begäran?", ["ceo", "legal"]),
            q("Was briefing staff honestly the right call, given the request for restraint?", "Var det rätt att informera personalen ärligt, med tanke på begäran om återhållsamhet?", ["hr"], "d4")
          ]
        },
        challenges: [ch("A false post now claims the fibre cuts were done by your own staff to hide evidence.", "Ett falskt inlägg påstår nu att fiberavbrotten utfördes av er egen personal för att dölja bevis.")],
        noDecision: L(["No vote: the authorities lead on the campaign. Let the room agree what to share, what to say to the journalist, and where its own line is.", "Ingen omröstning: myndigheterna leder arbetet med kampanjen. Låt rummet komma överens om vad som ska delas, vad som ska sägas till journalisten och var den egna gränsen går."]),
        facilitator: fac(
          ["Coordination with authorities limits your voice. Agree a line that is true and says little.", "Samordning med myndigheter begränsar er röst. Kom överens om en linje som är sann och säger lite."],
          ["Share fully, give the journalist a short, true holding line, and agree on escalation with the authorities.", "Dela fullt ut, ge journalisten en kort och sann första kommentar och kom överens med myndigheterna om eskalering."],
          [["Ask: what is the shortest true answer you can give the journalist?", "Fråga: vilket är det kortaste sanna svaret ni kan ge journalisten?"]]
        )
      },
      {
        id: "p6",
        mandatory: true,
        clock: 4320,
        title: L(["Thursday: the offer", "Torsdag: erbjudandet"]),
        twist: L(["An engineer tells HR she was offered cash on a professional networking site for “a consulting job”: drawings of the main site's power and cooling. The same recruiter profile has messaged three other employees with access to site plans.", "En tekniker berättar för HR att hon via ett yrkesnätverk har erbjudits kontanter för ”ett konsultuppdrag”: ritningar över huvudanläggningens el och kylning. Samma rekryterarprofil har skickat meddelanden till tre andra anställda med åtkomst till ritningar."]),
        twistKind: "scope",
        reconsider: { decision: "d4", pressure: { en: "The authorities asked you to say nothing. A journalist already knows about the cables, and your staff are frightened. Whatever you told people on Wednesday is being tested now.", sv: "Myndigheterna bad er att inte säga något. En journalist känner redan till kablarna, och personalen är rädd. Det ni sa till folk i onsdags sätts på prov nu." } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because staff were told honestly that the attacks may be deliberate, two engineers have asked not to work alone at the main site.", sv: "Eftersom personalen fick veta ärligt att angreppen kan vara avsiktliga har två tekniker bett att slippa arbeta ensamma på huvudanläggningen." } }
        ],
        assumptionChallenged: L(["The campaign attacks our systems and reputation, not our people.", "Kampanjen angriper våra system och vårt anseende, inte vår personal."]),
        reveals: ["hf-recruit"],
        narrative: L([
          "{{time.T+4320|weekday|cap}}. The fibre is spliced and the main site is back. The posts have slowed down. {{person.hr.name}} asks for five minutes alone with {{person.securityOfficer.name}} before the morning meeting starts.\n\nAn engineer came to HR in tears. She had not done anything wrong. She had only answered a friendly message from a recruiter, and the questions became more specific with every reply.",
          "{{time.T+4320|weekday|cap}}. Fibern är skarvad och huvudanläggningen är tillbaka. Inläggen har saktat in. {{person.hr.name}} ber om fem minuter ensam med {{person.securityOfficer.name}} innan morgonmötet börjar.\n\nEn tekniker kom till HR i tårar. Hon hade inte gjort något fel. Hon hade bara svarat på ett vänligt meddelande från en rekryterare, och frågorna blev mer specifika för varje svar."
        ]),
        injects: [
          inj("i6-1", 4320, "employeeReport", "person.hr", "high", "confirmed", [
            "“He said he worked for an engineering firm and needed reference drawings for a similar site. He offered more than my monthly salary. When I asked why he needed ours specifically, he stopped answering, then wrote again with a higher offer.”",
            "”Han sa att han arbetade för en ingenjörsfirma och behövde referensritningar för en liknande anläggning. Han erbjöd mer än min månadslön. När jag frågade varför han behövde just våra slutade han svara, och skrev sedan igen med ett högre bud.”"
          ], { reveals: ["hf-recruit"], tests: ["lo4"] }),
          inj("i6-2", 4380, "phishingEmail", "attacker", "medium", "confirmed", [
            "Following this week's security incidents, all staff must re-confirm their credentials on the new secure portal by Friday.",
            "Efter veckans säkerhetsincidenter måste all personal bekräfta sina inloggningsuppgifter på den nya säkra portalen senast fredag."
          ], { headline: ["Mandatory security update", "Obligatorisk säkerhetsuppdatering"], meta: { from: "security@{{asset.lookalikeDomain}}", subject: L(["Mandatory security update", "Obligatorisk säkerhetsuppdatering"]) }, optional: true, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Who has access to site plans and drawings, and where are they stored?", "Vem har åtkomst till ritningar över anläggningen, och var förvaras de?", ["securityOfficer", "facilities"]),
            q("How do you warn staff about the phishing that reuses this week's news?", "Hur varnar ni personalen för nätfisket som återanvänder veckans nyheter?", ["ciso", "comms"]),
            q("Did the sharing with authorities give them what they needed to act on this?", "Gav informationsutbytet med myndigheterna dem det de behövde för att agera på det här?", ["securityOfficer"], "d4")
          ],
          executive: [
            q("How do you protect the four employees, and the next ones?", "Hur skyddar ni de fyra anställda, och nästa som kontaktas?", ["hr", "securityOfficer"]),
            q("What do you tell all staff without causing suspicion of colleagues?", "Vad säger ni till all personal utan att väcka misstankar mot kollegor?", ["hr", "comms"]),
            q("Would leaving the campaign to the authorities have missed this?", "Hade det här missats om kampanjen lämnats åt myndigheterna?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("One of the four has not replied to HR and is on leave this week.", "En av de fyra har inte svarat HR och är ledig den här veckan.")],
        decision: dec("d5", "securityOfficer", ["How do you respond?", "Hur svarar ni?"], [
          ["Thank and protect the engineer, contact the other three supportively, restrict access to drawings, report to the police, and brief all staff on approaches like this.", "Tacka och skydda teknikern, kontakta de tre andra på ett stödjande sätt, begränsa åtkomsten till ritningar, anmäl till polisen och informera all personal om sådana här kontaktförsök."],
          ["Investigate the other three quietly before talking to them.", "Utred de tre andra i tysthet innan ni pratar med dem."],
          ["Keep it within HR and security for now, so the recruiter does not learn that you know.", "Håll det inom HR och säkerhet tills vidare, så att rekryteraren inte får veta att ni vet."]
        ], {
          knowns: [["Several employees with access to site plans were targeted for recruitment.", "Flera anställda med åtkomst till ritningar har utsatts för värvningsförsök."]],
          uncertainties: [["Whether anyone has already shared something.", "Om någon redan har delat något."]],
          tradeoffs: {
            operational: ["Restricting drawings slows maintenance work.", "Att begränsa ritningarna bromsar underhållsarbetet."],
            security: ["Treating targets as suspects stops people from reporting.", "Att behandla måltavlor som misstänkta får folk att sluta rapportera."],
            legal: ["Approaches like this may be crimes the police must know about.", "Kontaktförsök som detta kan vara brott som polisen måste känna till."],
            reputational: ["Staff will remember how the engineer was treated.", "Personalen kommer att minnas hur teknikern behandlades."]
          },
          evaluation: [["Protects the people who report and closes the access that was targeted", "Skyddar dem som rapporterar och stänger den åtkomst som var måltavla"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["After the briefing", "Efter informationen"], [
              io(["Staff report in", "Personalen rapporterar"], ["Within an hour of the briefing, staff forward several suspicious messages to security, including one that reuses this week's news. People are reporting instead of wondering.", "Inom en timme efter informationen skickar personal vidare flera misstänkta meddelanden till säkerhet, bland annat ett som återanvänder veckans nyheter. Folk rapporterar i stället för att undra."], ["Staff forwarded suspicious messages within an hour of the briefing.", "Personalen skickade vidare misstänkta meddelanden inom en timme efter informationen."]),
              io(["Change nothing visible", "Ändra inget synligt"], ["The police thank you for the report, then ask you to change nothing the recruiter could notice for a few days, so they can follow the profile. Restricting the drawings is exactly that kind of change.", "Polisen tackar för anmälan och ber er sedan att inte ändra något som rekryteraren kan märka på några dagar, så att de kan följa profilen. Att begränsa ritningarna är precis en sådan ändring."], ["The police asked you to change nothing visible for a few days.", "Polisen bad er att inte ändra något synligt på några dagar."], { reopen: true }),
              io(["The profile vanishes", "Profilen försvinner"], ["A few hours after the all-staff briefing, the recruiter profile is deleted. Nobody can say whether the briefing tipped them off, or whether they were finished anyway.", "Några timmar efter informationen till all personal raderas rekryterarprofilen. Ingen kan säga om informationen varnade dem, eller om de ändå var klara."], ["The recruiter profile was deleted hours after the briefing.", "Rekryterarprofilen raderades några timmar efter informationen."])
            ]),
            ir("i2", { notChosen: "A" }, ["Kept quiet", "Tyst hållet"], [
              io(["A higher offer", "Ett högre bud"], ["The recruiter sends the other three a higher offer this evening. None of them has been warned or spoken to, and you cannot see who has replied.", "Rekryteraren skickar ett högre bud till de tre andra i kväll. Ingen av dem har varnats eller fått något samtal, och ni kan inte se vem som har svarat."], ["The recruiter raised the offer to the other three, unwarned.", "Rekryteraren höjde budet till de tre andra, som inte varnats."], { reopen: true }),
              io(["The engineer pulls back", "Teknikern drar sig tillbaka"], ["The engineer notices that nothing visible has happened since she came forward, and hears that colleagues are being looked at. She tells HR she is not sure she would report something like this again.", "Teknikern märker att inget synligt har hänt sedan hon berättade, och hör att kollegor granskas. Hon säger till HR att hon inte är säker på att hon skulle rapportera något sådant igen."], ["The engineer says she is unsure she would report again.", "Teknikern säger att hon är osäker på om hon skulle rapportera igen."]),
              io(["The quiet holds", "Tystnaden håller"], ["The recruiter keeps writing to the engineer in the same friendly tone, as if nothing has changed. Some in the room take that as proof the approach is working.", "Rekryteraren fortsätter skriva till teknikern i samma vänliga ton, som om ingenting har förändrats. Några i rummet tar det som bevis för att ert sätt fungerar."], ["The recruiter is still writing as if nothing has changed.", "Rekryteraren skriver fortfarande som om ingenting har förändrats."])
            ])
          ],
          pushback: {
            A: [
              pb(["Maintenance stops", "Underhållet stannar"], ["With the drawings restricted, the contractor repairing the cooling system cannot see where the pipes run, and the job is on hold. {{person.facilities.name}} wants an exception today. Who grants exceptions, and does each one reopen the access you just closed?", "När ritningarna är begränsade kan entreprenören som reparerar kylsystemet inte se var rören går, och jobbet står still. {{person.facilities.name}} vill ha ett undantag i dag. Vem beviljar undantag, och öppnar varje undantag den åtkomst ni just stängde?"]),
              pb(["The one on leave", "Den som är ledig"], ["The employee on leave has still not answered. The all-staff briefing is ready, which means that person will learn about the approaches together with everyone else, perhaps before you have spoken. Do you hold the briefing until you reach them, or send it now?", "Den anställda som är ledig har fortfarande inte svarat. Informationen till all personal är klar, vilket betyder att personen får veta om kontaktförsöken samtidigt som alla andra, kanske innan ni har pratat. Väntar ni med informationen tills ni når hen, eller skickar ni den nu?"]),
              pb(["Colleagues start guessing", "Kollegorna börjar gissa"], ["After the briefing, the internal chat fills with guesses about who was approached, and someone names the engineer's team. She asks HR whether coming forward was a mistake. How do you protect the person who reported from the briefing you sent?", "Efter informationen fylls den interna chatten med gissningar om vilka som kontaktades, och någon nämner teknikerns team. Hon frågar HR om det var ett misstag att berätta. Hur skyddar ni den som rapporterade från informationen ni skickade?"])
            ],
            B: [
              pb(["“Am I being checked too?”", "”Blir jag också kontrollerad?”"], ["The engineer hears that colleagues' access logs are being pulled and asks HR directly whether she is under investigation as well. She came forward voluntarily. What do you tell her, and what will the next person who gets an offer conclude?", "Teknikern hör att kollegors åtkomstloggar tas fram och frågar HR rakt ut om hon också utreds. Hon kom fram frivilligt. Vad säger ni till henne, och vilken slutsats drar nästa person som får ett erbjudande?"]),
              pb(["The investigation leaks", "Utredningen läcker ut"], ["One of the three noticed their manager asking odd questions and has gone to the union. The story inside the building is now “management suspects us”. Do you carry on quietly, or come clean to all three and lose what you hoped to learn?", "En av de tre märkte att chefen ställde konstiga frågor och har vänt sig till facket. Historien i huset är nu ”ledningen misstänker oss”. Fortsätter ni i tysthet, eller berättar ni öppet för alla tre och förlorar det ni hoppades få veta?"]),
              pb(["The offer is still open", "Erbjudandet gäller fortfarande"], ["While you check them, nobody has warned the three, and the recruiter has already raised the offer once. Any one of them may answer tonight. Is the quiet investigation worth the risk that someone says yes before you have spoken to them?", "Medan ni kontrollerar dem har ingen varnat de tre, och rekryteraren har redan höjt budet en gång. Vem som helst av dem kan svara i kväll. Är den tysta utredningen värd risken att någon säger ja innan ni har pratat med dem?"])
            ],
            C: [
              pb(["The police want it now", "Polisen vill ha det nu"], ["The police contact you about the campaign and ask whether any staff have been approached. Approaches for site plans of an essential service may be crimes, and the recruiter profile may disappear. Who decides to hold back from the police, and on whose behalf?", "Polisen hör av sig om kampanjen och frågar om någon i personalen har kontaktats. Kontaktförsök för att få ritningar över en samhällsviktig anläggning kan vara brott, och rekryterarprofilen kan försvinna. Vem beslutar att hålla inne med det mot polisen, och för vems räkning?"]),
              pb(["The next one doesn't know", "Nästa vet ingenting"], ["Another employee with access to drawings receives the same friendly message tomorrow. Nobody has warned them, because the approaches are being kept within HR and security. If they reply, was keeping the secret worth it?", "En annan anställd med åtkomst till ritningar får samma vänliga meddelande i morgon. Ingen har varnat hen, eftersom kontaktförsöken hålls inom HR och säkerhet. Om hen svarar, var hemlighållandet värt det?"]),
              pb(["The drawings are still open", "Ritningarna är fortfarande öppna"], ["Restricting access to the drawings would signal that you know, so access is unchanged. Anyone who has been approached can still download everything the recruiter asked for. How long can you leave the door open to keep the secret?", "Att begränsa åtkomsten till ritningarna skulle avslöja att ni vet, så åtkomsten är oförändrad. Alla som har kontaktats kan fortfarande ladda ner allt rekryteraren bad om. Hur länge kan ni lämna dörren öppen för att bevara hemligheten?"])
            ]
          }
        }),
        facilitator: fac(
          ["The campaign reaches people. How you treat the engineer decides whether the next approach is reported.", "Kampanjen når människor. Hur ni behandlar teknikern avgör om nästa kontaktförsök rapporteras."],
          ["Protect and thank, supportive outreach, restrict drawings, police report, staff briefing.", "Skydda och tacka, stödjande kontakt, begränsade ritningar, polisanmälan, information till personalen."],
          [["Ask: what would make someone tell you about an offer like this?", "Fråga: vad skulle få någon att berätta för er om ett sådant erbjudande?"]]
        )
      },
      {
        id: "p7",
        clock: 10080,
        priority: 3,
        title: L(["The week after", "Veckan efter"]),
        twist: L(["The regional preparedness authority warns that campaigns like this tend to return in waves, and asks each organisation running essential services to show how it would sustain operations through a month of similar disruption.", "Den regionala beredskapsmyndigheten varnar för att kampanjer som den här brukar återkomma i vågor, och ber varje organisation som driver samhällsviktiga tjänster visa hur den skulle upprätthålla verksamheten under en månad av liknande störningar."]),
        twistKind: "scope",
        reconsider: { decision: "d2", pressure: { en: "Looking back at Monday evening: the flood and the story were one operation. Would you handle the next wave the same way?", sv: "Med facit i hand från måndagskvällen: överbelastningen och berättelsen var en och samma operation. Skulle ni hantera nästa våg på samma sätt?" } },
        assumptionChallenged: L(["It is over.", "Det är över."]),
        narrative: L([
          "{{time.T+10080|weekday|cap}}. A week later. Services are normal, the false posts are gone, and the police investigation continues out of sight. The crisis team meets one last time, and most of its members look as though they need a holiday.\n\nA letter from the regional preparedness authority turns the review into a different conversation. The question is no longer what happened last week, but what you would do if it happened every week for a month.",
          "{{time.T+10080|weekday|cap}}. En vecka senare. Tjänsterna fungerar normalt, de falska inläggen är borta och polisutredningen fortsätter i det tysta. Krisledningen träffas en sista gång, och de flesta ser ut att behöva semester.\n\nEtt brev från den regionala beredskapsmyndigheten gör genomgången till ett annat samtal. Frågan är inte längre vad som hände förra veckan, utan vad ni skulle göra om det hände varje vecka i en månad."
        ]),
        injects: [
          inj("i7-1", 10080, "regulatorLetter", "regulator", "medium", "confirmed", [
            "We expect further campaigns of this kind. Please describe within 30 days how you would sustain essential services through a month of combined disinformation, cyber attacks and physical disruption, including staffing.",
            "Vi räknar med fler kampanjer av det här slaget. Beskriv inom 30 dagar hur ni skulle upprätthålla samhällsviktiga tjänster under en månad av kombinerad desinformation, cyberangrepp och fysiska störningar, inklusive bemanning."
          ], { tests: ["lo5"] })
        ],
        questions: {
          technical: [
            q("Which of last week's workarounds could last a month?", "Vilka av förra veckans nödlösningar skulle hålla i en månad?", ["itOps", "networkLead"]),
            q("Where are you still physically exposed?", "Var är ni fortfarande fysiskt exponerade?", ["facilities", "securityOfficer"]),
            q("Looking back, how did the shift pattern work?", "När ni ser tillbaka, hur fungerade skiftschemat?", ["incidentCommander"], "d3")
          ],
          executive: [
            q("How many people does your crisis organisation really have, two deep?", "Hur många personer har er krisorganisation egentligen, med ersättare?", ["incidentCommander", "hr"]),
            q("What did you learn about speaking when others lead?", "Vad lärde ni er om att kommunicera när andra leder?", ["comms"]),
            q("Which decision of the week mattered most?", "Vilket beslut under veckan spelade störst roll?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("Two members of the crisis team have reported sick from exhaustion.", "Två medlemmar i krisledningen har sjukskrivit sig på grund av utmattning.")],
        decision: dec("d6", "ceo", ["What do you build?", "Vad bygger ni?"], [
          ["A crisis organisation two deep, rehearsed fallbacks for communications and positioning, physical protection of key routes, and a standing link to authorities.", "En krisorganisation med dubbla ersättare, inövade reservrutiner för kommunikation och positionering, fysiskt skydd av viktiga ledningar och en stående kontakt med myndigheterna."],
          ["A detailed plan document for the authority.", "Ett detaljerat plandokument till myndigheten."],
          ["A larger communications team for the next disinformation wave.", "Ett större kommunikationsteam inför nästa desinformationsvåg."]
        ], {
          knowns: [["The campaign may return, and the team is exhausted.", "Kampanjen kan komma tillbaka, och teamet är utmattat."]],
          uncertainties: [["When the next wave comes and what form it takes.", "När nästa våg kommer och vilken form den tar."]],
          tradeoffs: {
            operational: ["Deputies and exercises cost time every month.", "Ersättare och övningar kostar tid varje månad."],
            security: ["A plan on paper does not keep people awake for a month.", "En plan på papper håller inte folk vakna i en månad."],
            legal: ["Essential-service duties include preparedness.", "Skyldigheterna för samhällsviktig verksamhet omfattar beredskap."],
            reputational: ["The public will judge the second wave harder than the first.", "Allmänheten kommer att döma den andra vågen hårdare än den första."]
          },
          evaluation: [["Builds endurance in people and fallbacks, not only in documents", "Bygger uthållighet hos människor och i reservrutiner, inte bara i dokument"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Building it for real", "Att bygga det på riktigt"], [
              io(["The authority approves", "Myndigheten godkänner"], ["The liaison officer calls your outline one of the strongest the authority has received, and asks whether you would share it with other organisations in the region.", "Sambandspersonen kallar ert utkast ett av de starkaste som myndigheten har fått, och frågar om ni vill dela det med andra organisationer i regionen."], ["The authority praised your plan and asked to share it.", "Myndigheten berömde er plan och bad att få dela den."], { meters: { regulator: -1 } }),
              io(["Half the budget", "Halva budgeten"], ["The board approves only half of what you asked for. Deputies can be trained for half the crisis roles this year; the rest stay one deep.", "Styrelsen beviljar bara hälften av det ni bad om. Ersättare kan utbildas för hälften av krisrollerna i år; resten förblir utan ersättare."], ["Only half the crisis roles will get a trained deputy this year.", "Bara hälften av krisrollerna får en utbildad ersättare i år."], { reopen: true }),
              io(["The first exercise", "Den första övningen"], ["The first short exercise with the new deputies runs out of time halfway. Some say that proves the plan is needed; others say it proves the plan is too big.", "Den första korta övningen med de nya ersättarna hinner bara halvvägs. En del säger att det visar att planen behövs; andra att det visar att planen är för stor."], ["The first deputy exercise ran out of time halfway.", "Den första övningen med ersättarna hann bara halvvägs."])
            ]),
            ir("i2", { notChosen: "A" }, ["One layer deep", "Bara ett lager"], [
              io(["“Show us the names”", "”Visa oss namnen”"], ["The authority's liaison replies within a day: they want named deputies for every crisis role and a date for your next exercise. Your answer has neither.", "Myndighetens sambandsperson svarar inom ett dygn: de vill ha namngivna ersättare för varje krisroll och ett datum för nästa övning. Ert svar innehåller inget av det."], ["The authority asked for named deputies and an exercise date.", "Myndigheten begärde namngivna ersättare och ett övningsdatum."], { reopen: true, meters: { regulator: 1 } }),
              io(["A small wave", "En liten våg"], ["A small new wave of false posts appears and fades within a day, handled by the usual people. Some in the room take it as proof you are ready for the next one.", "En liten ny våg av falska inlägg dyker upp och klingar av inom ett dygn, hanterad av de vanliga personerna. Några i rummet tar det som bevis för att ni är redo för nästa."], ["A small new wave of false posts was handled without trouble.", "En liten ny våg av falska inlägg hanterades utan problem."]),
              io(["Someone steps down", "Någon kliver av"], ["One of the crisis team members who carried last week asks to leave the crisis team for good. Nobody has been named to take their place.", "En av medlemmarna i krisledningen som bar förra veckan ber att få lämna krisledningen för gott. Ingen har utsetts att ta platsen."], ["A crisis team member has asked to leave the team; nobody replaces them yet.", "En medlem i krisledningen har bett att få lämna; ingen ersätter hen ännu."])
            ])
          ],
          pushback: {
            A: [
              pb(["Who gives up their best?", "Vem lämnar ifrån sig sina bästa?"], ["Two deep means taking capable people from their day jobs for training and monthly exercises. Department heads are already refusing to give up their best. Which department pays for the second layer, and who forces it?", "Dubbla ersättare betyder att duktiga personer tas från sina ordinarie jobb för utbildning och månatliga övningar. Avdelningscheferna vägrar redan lämna ifrån sig sina bästa. Vilken avdelning betalar för det andra lagret, och vem driver igenom det?"]),
              pb(["Built by the exhausted", "Byggt av de utmattade"], ["The people who know what to build are the same people who have just come through the week, and two of them are on sick leave. Starting now means asking them for more. Do you start before the next wave, or let them rest and start late?", "De som vet vad som ska byggas är samma personer som just har tagit sig igenom veckan, och två av dem är sjukskrivna. Att börja nu betyder att be dem om mer. Börjar ni före nästa våg, eller låter ni dem vila och börjar sent?"]),
              pb(["Routes that aren't yours", "Ledningar som inte är era"], ["The fibre routes run through land owned by the carrier and the municipality, and the carrier says protecting them is its business. You cannot fence what you do not own. What does “physical protection of key routes” actually mean, and who pays for it?", "Fibervägarna går genom mark som ägs av operatören och kommunen, och operatören säger att skyddet är deras sak. Ni kan inte stängsla in det ni inte äger. Vad betyder ”fysiskt skydd av viktiga ledningar” egentligen, och vem betalar?"])
            ],
            B: [
              pb(["“Show us it works”", "”Visa att det fungerar”"], ["The authority's liaison replies to your draft with two questions: when did you last exercise this, and who covers each role in week three? The document cannot answer either. Do you send it anyway?", "Myndighetens sambandsperson svarar på ert utkast med två frågor: när övade ni det senast, och vem täcker varje roll vecka tre? Dokumentet kan inte svara på någon av dem. Skickar ni det ändå?"]),
              pb(["Nobody read the last one", "Ingen läste den förra"], ["A spot check finds that most of the crisis team did not know where last week's fallback procedures were kept, though they existed. The new plan will live in the same place. What makes this document different from the one nobody opened on Tuesday?", "En stickprovskontroll visar att de flesta i krisledningen inte visste var förra veckans reservrutiner fanns, trots att de fanns. Den nya planen hamnar på samma ställe. Vad gör det här dokumentet annorlunda än det som ingen öppnade i tisdags?"]),
              pb(["Names on sick leave", "Namn som är sjukskrivna"], ["The plan's staffing table names the same people who ran last week, including the two now on sick leave. If the next wave comes next month, the plan assigns it to people who cannot answer. Who writes the names that are not there?", "Planens bemanningstabell namnger samma personer som drev förra veckan, inklusive de två som nu är sjukskrivna. Om nästa våg kommer nästa månad tilldelar planen den till personer som inte kan svara. Vem skriver in de namn som inte finns?"])
            ],
            C: [
              pb(["The story was one of five", "Berättelsen var en av fem"], ["{{person.networkLead.name}} asks why communications gets new staff when the backup links carried a tenth of normal traffic and the fleet ran on paper maps. Disinformation was only one part of the week. How do you defend putting the money there?", "{{person.networkLead.name}} frågar varför kommunikationsavdelningen får ny personal när reservförbindelserna klarade en tiondel av den normala trafiken och fordonsflottan körde på papperskartor. Desinformation var bara en del av veckan. Hur försvarar ni att pengarna läggs där?"]),
              pb(["More voices, more risk", "Fler röster, mer risk"], ["Last week the authorities limited what you could say, and getting the line right took experienced people. New communicators will not have those relationships or that judgement. In the next wave, who makes sure a larger team says less, not more?", "Förra veckan begränsade myndigheterna vad ni fick säga, och det krävdes erfarna personer för att få linjen rätt. Nya kommunikatörer har varken de kontakterna eller det omdömet. Vem ser till att ett större team säger mindre, inte mer, i nästa våg?"]),
              pb(["Who covers the sick?", "Vem täcker för de sjuka?"], ["The two people on sick leave are from the crisis team, not communications. A bigger communications team does not replace either of them. If the next wave starts next week, who does their jobs?", "De två som är sjukskrivna kommer från krisledningen, inte från kommunikation. Ett större kommunikationsteam ersätter ingen av dem. Om nästa våg börjar nästa vecka, vem gör deras jobb?"])
            ]
          }
        }),
        facilitator: fac(
          ["End on endurance and preparedness: hybrid threats are long games.", "Avsluta med uthållighet och beredskap: hybridhot är ett långt spel."],
          ["Two-deep crisis roles, rehearsed fallbacks, protected key routes, standing authority links.", "Krisroller med dubbla ersättare, inövade reservrutiner, skyddade viktiga ledningar, stående kontakt med myndigheter."],
          [["Ask: who covers for each of you in week three?", "Fråga: vem ersätter var och en av er vecka tre?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Services held through the week and the false story faded, but the crisis team is exhausted, and the authorities expect the campaign to return.",
        "Tjänsterna höll genom veckan och den falska berättelsen bleknade, men krisledningen är utmattad och myndigheterna räknar med att kampanjen kommer tillbaka."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Answer disinformation with facts on your own channels; arguing in replies feeds it.", "Bemöt desinformation med fakta i egna kanaler; att argumentera i svarstrådar ger den näring."]),
        L(["Hybrid threats are designed to be handled in silos: join the incidents into one picture.", "Hybridhot är utformade för att hanteras i stuprör: sätt samman händelserna till en lägesbild."]),
        L(["Campaigns target people as well as systems; protect those who report approaches.", "Kampanjer riktar sig mot människor lika väl som system; skydda dem som rapporterar kontaktförsök."]),
        L(["Endurance is a decision: shifts, deputies and fallbacks you have practised.", "Uthållighet är ett beslut: skift, ersättare och reservrutiner ni har övat."])
      ],
      assumptionsVsReality: [
        avr(["A communications problem.", "Ett kommunikationsproblem."], ["A DDoS timed to make the story look true.", "En överbelastningsattack tajmad för att få berättelsen att verka sann."], "p2"),
        avr(["A run of bad luck.", "En period av otur."], ["One coordinated campaign against the region.", "En samordnad kampanj mot regionen."], "p4"),
        avr(["Only systems and reputation are targeted.", "Bara system och anseende är måltavlor."], ["Staff with site access were approached for cash.", "Personal med åtkomst till anläggningen kontaktades med erbjudanden om pengar."], "p6")
      ],
      strengthsToLookFor: [
        L(["Joining the incidents up early", "Att koppla ihop händelserna tidigt"]),
        L(["Shift patterns for the crisis team", "Skiftschema för krisledningen"]),
        L(["Treating the engineer as a reporter, not a suspect", "Att behandla teknikern som någon som rapporterar, inte som en misstänkt"])
      ],
      commonGaps: [
        L(["Arguing with false posts in the replies", "Att argumentera med falska inlägg i svarstrådarna"]),
        L(["Handling each disruption in its own silo", "Att hantera varje störning i sitt eget stuprör"]),
        L(["Running the same people for five days", "Att låta samma personer arbeta i fem dagar"])
      ],
      suggestedActions: [
        act(["Staff every crisis role two deep and rehearse handovers.", "Bemanna varje krisroll med dubbla ersättare och öva överlämningar."], "incidentCommander", "high"),
        act(["Prepare fallbacks for communications, positioning and timing.", "Förbered reservrutiner för kommunikation, positionering och tid."], "itOps", "high"),
        act(["Train staff with access to sensitive plans to recognise and report approaches.", "Utbilda personal med åtkomst till känsliga ritningar att känna igen och rapportera kontaktförsök."], "securityOfficer", "medium"),
        act(["Agree communication lines with authorities before the next campaign.", "Kom överens om kommunikationslinjer med myndigheterna före nästa kampanj."], "comms", "medium")
      ]
    }
  });
})();
