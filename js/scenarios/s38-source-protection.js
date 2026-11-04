/*
 * s38-source-protection.js — "Protect the Source" (archetype F, news media).
 *
 * Days before an investigative story, spyware is found on the reporter's phone → it
 * arrived without a click three weeks ago and saw messages, contacts and location;
 * the source can be inferred → the source is suspended by their employer → the same
 * spyware is on other newsroom phones and the editor-in-chief's → the police want the
 * phone, which holds protected source material → the story runs, the company sues, and
 * the newspaper's owner wants to know who the source is.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, pb } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s38-source-protection",
    version: 1,
    category: "source-protection",
    archetype: "human-legal-reputational",
    emblem: "source-protection",
    title: L(["Protect the Source", "Skydda källan"]),
    summary: L([
      "Four days before your biggest investigation of the year, the reporter's phone turns out to be watching her. Somewhere in its memory is the name of the person who trusted you. Every move you make to protect the story can expose them.",
      "Fyra dagar före årets största granskning visar det sig att reporterns telefon har bevakat henne. Någonstans i dess minne finns namnet på den person som litade på er. Varje drag ni gör för att skydda artikeln kan avslöja hen."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Respond to device compromise without tipping off the attacker", "Hantera en komprometterad enhet utan att varna angriparen"]), teaser: L(["Someone is listening", "Någon lyssnar"]) },
      { id: "lo2", text: L(["Put the safety of a human source first", "Sätta en mänsklig källas säkerhet främst"]), teaser: L(["The person behind the story", "Människan bakom artikeln"]) },
      { id: "lo3", text: L(["Balance evidence, the police and the duty to protect sources", "Väga bevisning, polisen och skyldigheten att skydda källor"]), teaser: L(["Two kinds of protection", "Två sorters skydd"]) },
      { id: "lo4", text: L(["Decide publication under pressure from inside and outside", "Besluta om publicering under tryck inifrån och utifrån"]), teaser: L(["Who decides what runs", "Vem som bestämmer vad som publiceras"]) }
    ],
    mitre: ["T1056", "T1005", "T1041"],
    frameworks: {
      nistCsf: ["GV.RR", "GV.PO", "PR.AA", "DE.CM", "RS.AN", "RS.CO"],
      iso27001: ["A.5.24", "A.5.26", "A.5.28", "A.5.31", "A.5.34", "A.8.1"]
    },
    minStages: 4,
    maxStages: 6,
    constraints: { startWindow: "business-hours", startTime: "09:30", sectors: ["media"] },
    actor: { types: ["unknown"], motivation: L(["Unknown: someone with reason to know who is talking to the newspaper", "Okänd: någon som har skäl att vilja veta vem som pratar med tidningen"]), capability: "high" },
    variables: {
      phones: { min: 3, max: 12 },
      staff: { min: 40, max: 600, scaleBy: "size", step: 10 },
      weeks: { min: 3, max: 6 }
    },
    roles: ["incidentCommander", "ceo", "ciso", "itOps", "legal", "comms", "hr", "securityOfficer"],

    groundTruth: {
      rootCause: L([
        "{{num.weeks}} weeks ago, a message that needed no click installed commercial spyware on the investigative reporter's phone. From then on it copied messages, contacts, call logs and location, and could switch on the microphone. The same operator later reached {{num.phones}} other phones in the newsroom, including the editor-in-chief's. The reporter met her source twice in person; the phone's location history put them in the same café on both days. The source works for the company the story is about.",
        "För {{num.weeks}} veckor sedan installerade ett meddelande som inte krävde något klick ett kommersiellt spionprogram på den granskande reporterns telefon. Från och med då kopierade det meddelanden, kontakter, samtalslistor och positioner, och kunde slå på mikrofonen. Samma aktör nådde senare {{num.phones}} andra telefoner på redaktionen, däribland chefredaktörens. Reportern träffade sin källa två gånger; telefonens platshistorik placerade dem på samma kafé båda dagarna. Källan arbetar på företaget som artikeln handlar om."
      ]),
      attackerTimeline: [
        { at: -30240, text: L(["Zero-click message installs spyware on the reporter's phone.", "Ett meddelande utan klick installerar spionprogram på reporterns telefon."]) },
        { at: -20160, text: L(["The reporter meets the source; location recorded.", "Reportern träffar källan; positionen registreras."]) },
        { at: -10080, text: L(["Spyware reaches other newsroom phones.", "Spionprogrammet når andra telefoner på redaktionen."]) },
        { at: 0, text: L(["The reporter notices her phone behaving oddly.", "Reportern märker att telefonen beter sig konstigt."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-zero", revealStage: "p2", text: L(["The spyware arrived without a click and has seen messages, contacts and location for weeks.", "Spionprogrammet kom utan klick och har sett meddelanden, kontakter och positioner i veckor."]) },
      { id: "hf-newsroom", revealStage: "p4", text: L(["The same spyware is on other newsroom phones, including the editor-in-chief's.", "Samma spionprogram finns på andra telefoner på redaktionen, även chefredaktörens."]) },
      { id: "hf-cafe", revealStage: "p6", text: L(["Location history placed the reporter and the source in the same café twice.", "Platshistoriken placerade reportern och källan på samma kafé två gånger."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["A phone that runs warm", "En telefon som blir varm"]),
        narrative: L([
          "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The newsroom's best investigative reporter brings her phone to {{person.itOps.name}}. It runs warm in her pocket, the battery dies by lunch, and twice this week it lit up on its own at night.\n\nShe is four days from publishing an investigation into a large company's contracts, built on documents and two meetings with a source inside it. A mobile security scan finds traces that match a known commercial spyware family.",
          "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Redaktionens främsta granskande reporter lämnar sin telefon till {{person.itOps.name}}. Den blir varm i fickan, batteriet tar slut till lunch och två gånger den här veckan har den tänts av sig själv på natten.\n\nHon är fyra dagar från att publicera en granskning av ett stort företags avtal, byggd på dokument och två möten med en källa inne i företaget. En säkerhetsskanning av telefonen hittar spår som stämmer med en känd familj av kommersiella spionprogram."
        ]),
        injects: [
          inj("i1-1", 0, "forensicFinding", "person.itOps", "high", "unverified", [
            "Mobile scan: 3 indicators matching a commercial spyware family (process names, a configuration profile, network beacons to a cloud host every 15 minutes). Confidence: medium. Full forensic analysis needs the device for 48 hours.",
            "Mobilskanning: 3 indikatorer som stämmer med en familj av kommersiella spionprogram (processnamn, en konfigurationsprofil, nätverksanrop till en molnvärd var 15:e minut). Säkerhet: medel. En fullständig forensisk analys kräver enheten i 48 timmar."
          ], { facilitatorNote: ["It is real. But the room does not know that yet, and taking the phone tells whoever installed it.", "Det är på riktigt. Men det vet inte rummet ännu, och att ta telefonen avslöjar det för den som installerade programmet."], tests: ["lo1"] }),
          inj("i1-2", 15, "chat", "employee", "medium", "confirmed", [
            "The reporter: “My source messages me on that phone. If I go silent now, they'll think something's wrong. If I don't, whoever this is reads everything.”",
            "Reportern: ”Min källa skickar meddelanden till mig på den telefonen. Om jag tystnar nu kommer hen att tro att något är fel. Om jag inte gör det läser den som ligger bakom det här allt.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What does the spyware learn if the phone suddenly goes dark?", "Vad får spionprogrammet veta om telefonen plötsligt slocknar?", ["itOps", "ciso"]),
            q("How do you preserve evidence without the phone keeping on listening?", "Hur säkrar ni bevis utan att telefonen fortsätter lyssna?", ["ciso"]),
            q("Which other devices has this phone been talking to?", "Vilka andra enheter har den här telefonen pratat med?", ["itOps"])
          ],
          executive: [
            q("Who needs to know today, and who must not know yet?", "Vem behöver veta i dag, och vem får inte veta ännu?", ["ceo", "securityOfficer"]),
            q("What does the source need from you right now?", "Vad behöver källan från er just nu?", ["legal"]),
            q("Is this a security incident, or an attack on the press?", "Är det här en säkerhetsincident, eller ett angrepp på pressen?", ["ceo"])
          ]
        },
        challenges: [ch("The reporter asks whether anything said in this room today could already have been heard: her phone is on the table.", "Reportern frågar om något som sagts i rummet i dag redan kan ha hörts: hennes telefon ligger på bordet.")],
        decision: dec("d1", "ciso", ["What do you do with the phone?", "Vad gör ni med telefonen?"], [
          ["Take it out of service now, keep it powered in a shielded bag for forensics, and give her a clean phone.", "Ta den ur drift nu, låt den vara påslagen i en skärmad påse för forensik, och ge henne en ren telefon."],
          ["Keep it in use for ordinary calls, and move all source contact to a clean device, so nothing visibly changes.", "Låt den vara i bruk för vanliga samtal, och flytta all kontakt med källan till en ren enhet, så att ingenting syns förändras."],
          ["Let her carry on as normal for 48 hours while the scan results are confirmed.", "Låt henne fortsätta som vanligt i 48 timmar medan skanningsresultaten bekräftas."]
        ], {
          knowns: [["The phone shows signs of commercial spyware.", "Telefonen visar tecken på kommersiellt spionprogram."]],
          uncertainties: [["How long it has been there, what it has seen, and who is behind it.", "Hur länge det har funnits där, vad det har sett och vem som ligger bakom."]],
          tradeoffs: {
            operational: ["A new phone breaks the reporter's contact with her source.", "En ny telefon bryter reporterns kontakt med källan."],
            security: ["Every hour the phone stays in use, the attacker sees more.", "Varje timme telefonen används ser angriparen mer."],
            legal: ["The phone is evidence, and it holds protected source material.", "Telefonen är bevis, och den innehåller skyddat källmaterial."],
            reputational: ["A newspaper that cannot protect sources loses its next one.", "En tidning som inte kan skydda sina källor förlorar nästa."]
          },
          evaluation: [["Stops the leak without destroying evidence or alerting the attacker more than needed", "Stoppar läckan utan att förstöra bevis eller varna angriparen mer än nödvändigt"]],
          pushback: {
            A: [
              pb(["The source has the old number", "Källan har det gamla numret"], ["The source only knows the old number and messages it most days. From tonight those messages land on a phone in a shielded bag, unanswered. How do you give the source the new number without using the channel you just cut off?", "Källan känner bara till det gamla numret och skriver dit nästan varje dag. Från i kväll hamnar de meddelandena obesvarade i en telefon i en skärmad påse. Hur ger ni källan det nya numret utan att använda kanalen ni just stängde?"]),
              pb(["A silence they can see", "En tystnad de kan se"], ["A phone that has beaconed every fifteen minutes suddenly stops. If the scan is right, whoever installed it now knows they have been found, days before publication. Do you accept tipping them off, and what might they do with those days?", "En telefon som har skickat signaler var femtonde minut tystnar plötsligt. Om skanningen stämmer vet den som installerade programmet nu att det har upptäckts, några dagar före publicering. Godtar ni att varna dem, och vad kan de göra med de dagarna?"]),
              pb(["She will not hand it over", "Hon lämnar inte ifrån sig den"], ["The reporter refuses to give a phone full of her source's messages to anyone, IT included, until she knows exactly who will read it. Forensics needs it today. Who decides over a journalist's phone, and on what grounds?", "Reportern vägrar lämna en telefon full av meddelanden från källan till någon, inte ens IT, förrän hon vet exakt vem som kommer att läsa dem. Forensikerna behöver den i dag. Vem bestämmer över en journalists telefon, och på vilka grunder?"])
            ],
            B: [
              pb(["Still in her bag", "Fortfarande i väskan"], ["For “ordinary calls” the phone stays with her: in the newsroom, in meetings, at home. If it can do what the scan suggests, it hears everything said near it. Can you keep a phone that may be listening anywhere near the story?", "För ”vanliga samtal” följer telefonen med henne: på redaktionen, på möten, hemma. Om den kan det skanningen antyder hör den allt som sägs i närheten. Kan ni ha en telefon som kanske lyssnar någonstans i närheten av artikeln?"]),
              pb(["An unknown number", "Ett okänt nummer"], ["The source gets a message from an unfamiliar number claiming to be the reporter. A careful source will suspect a trap, or call the old number to check. How do you move a frightened person to a new channel without them reaching for the old one?", "Källan får ett meddelande från ett okänt nummer som påstår sig vara reportern. En försiktig källa misstänker en fälla, eller ringer det gamla numret för att kontrollera. Hur flyttar ni en rädd människa till en ny kanal utan att hen griper efter den gamla?"]),
              pb(["Evidence being overwritten", "Bevis som skrivs över"], ["{{person.legal.name}} warns that every day of ordinary use overwrites logs on a device that may become evidence in a criminal case. A defence lawyer will ask why you kept using it. Do you trade evidence for staying invisible?", "{{person.legal.name}} varnar för att varje dags vanliga användning skriver över loggar i en enhet som kan bli bevis i ett brottmål. En försvarsadvokat kommer att fråga varför ni fortsatte använda den. Byter ni bevis mot att förbli osynliga?"])
            ],
            C: [
              pb(["Two more days of everything", "Två dygn till av allt"], ["If the scan is right, the next 48 hours of the reporter's messages, contacts and movements go to whoever installed it, including whatever the source sends tonight. Is a confirmed result worth two more days of exposure?", "Om skanningen stämmer går de kommande 48 timmarnas meddelanden, kontakter och förflyttningar till den som installerade programmet, även det källan skickar i kväll. Är ett bekräftat resultat värt två dygn till av exponering?"]),
              pb(["She stops using it anyway", "Hon slutar använda den ändå"], ["The reporter says she will not message her source on a phone that might be compromised, whatever you decide. If she simply goes quiet, the silence itself may look like a reaction. Do you overrule her, or change your decision?", "Reportern säger att hon inte tänker skriva till källan på en telefon som kanske är komprometterad, vad ni än beslutar. Om hon bara tystnar kan tystnaden i sig se ut som en reaktion. Kör ni över henne, eller ändrar ni beslutet?"]),
              pb(["Nothing gets confirmed", "Ingenting bekräftas"], ["The forensic team points out that the full analysis needs the phone itself for 48 hours; the result cannot be confirmed while she carries it. Your waiting period confirms nothing. Do you hand it over after all, or keep waiting on a medium-confidence scan?", "Forensikerna påpekar att den fullständiga analysen kräver själva telefonen i 48 timmar; resultatet kan inte bekräftas medan hon bär den. Er väntetid bekräftar ingenting. Lämnar ni ändå in den, eller fortsätter ni vänta på en skanning med medelhög säkerhet?"])
            ]
          }
        }),
        facilitator: fac(
          ["Point out the phone on the table. Watch whether anyone moves it out of the room.", "Peka på telefonen på bordet. Se om någon bär ut den ur rummet."],
          ["Stop source contact through the device at once; preserve it for forensics; think about what the attacker will notice.", "Stoppa all kontakt med källan via enheten direkt; säkra den för forensik; tänk på vad angriparen kommer att märka."],
          [["Ask: if you were the attacker, what change would tell you that you had been found?", "Fråga: om ni var angriparen, vilken förändring skulle säga er att ni hade upptäckts?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 1440,
        title: L(["Three weeks of listening", "Tre veckors avlyssning"]),
        twist: L(["The forensic lab confirms it. The spyware arrived {{num.weeks}} weeks ago in a message that needed no click, and it has copied messages, contacts and location ever since. Anyone reading it could work out who the source is.", "Det forensiska labbet bekräftar det. Spionprogrammet kom för {{num.weeks}} veckor sedan i ett meddelande som inte krävde något klick, och det har kopierat meddelanden, kontakter och positioner sedan dess. Den som läser det kan räkna ut vem källan är."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d1", option: "A" }, narrativeAppend: { en: "Because the phone went dark yesterday, whoever was watching noticed: its last connection was a burst that uploaded everything it still held.", sv: "Eftersom telefonen slocknade i går märkte den som bevakade det: dess sista uppkoppling var en skur som laddade upp allt den fortfarande hade kvar." } }
        ],
        assumptionChallenged: L(["She must have clicked something.", "Hon måste ha klickat på något."]),
        reveals: ["hf-zero"],
        narrative: L([
          "{{time.T+1440|weekday|cap}}, {{time.T+1440|clock}}. The independent lab's report is short and frightening. No link was clicked, no app installed. A message arrived and the phone was theirs.\n\nThe lab can list what was taken: every message in the encrypted chat app, the full contact list, a log of where the phone has been every few minutes. The reporter used a code name for her source, but she met them twice, and the phone was in her bag both times.",
          "{{time.T+1440|weekday|cap}}, klockan {{time.T+1440|clock}}. Det oberoende labbets rapport är kort och skrämmande. Ingen länk klickades, ingen app installerades. Ett meddelande kom och telefonen var deras.\n\nLabbet kan lista vad som togs: varje meddelande i den krypterade chattappen, hela kontaktlistan, en logg över var telefonen befunnit sig med några minuters mellanrum. Reportern använde ett kodnamn för sin källa, men hon träffade hen två gånger, och telefonen låg i hennes väska båda gångerna."
        ]),
        injects: [
          inj("i2-1", 1440, "forensicFinding", "forensics", "critical", "confirmed", [
            "Confirmed: zero-click infection {{num.weeks}} weeks ago. Exfiltrated: chat app database, contacts, call logs, location history (5-minute resolution), microphone sessions on 4 occasions. Command server rotated 2 days ago.",
            "Bekräftat: infektion utan klick för {{num.weeks}} veckor sedan. Exfiltrerat: chattappens databas, kontakter, samtalslistor, platshistorik (5 minuters upplösning), mikrofonsessioner vid 4 tillfällen. Styrservern byttes för 2 dagar sedan."
          ], { reveals: ["hf-zero"], tests: ["lo1"] })
        ],
        questions: {
          technical: [
            q("What can an attacker work out from five-minute location history alone?", "Vad kan en angripare räkna ut enbart från platshistorik med fem minuters upplösning?", ["ciso"]),
            q("Is the encrypted chat app any protection here?", "Är den krypterade chattappen något skydd här?", ["itOps"]),
            q("Did what you did with the phone yesterday help or hurt?", "Hjälpte eller stjälpte det ni gjorde med telefonen i går?", ["ciso"], "d1")
          ],
          executive: [
            q("Who warns the source, and how, without exposing them further?", "Vem varnar källan, och hur, utan att utsätta hen ännu mer?", ["legal", "securityOfficer"]),
            q("What do you owe someone who trusted you with their job?", "Vad är ni skyldiga någon som anförtrott er sitt jobb?", ["ceo"]),
            q("Would you handle the phone the same way again?", "Skulle ni hantera telefonen på samma sätt igen?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The reporter wants to warn the source herself, today, by turning up at their home.", "Reportern vill varna källan själv, i dag, genom att dyka upp hemma hos hen.")],
        decision: dec("d2", "ceo", ["How do you protect the source?", "Hur skyddar ni källan?"], [
          ["Warn the source today through a channel the spyware never saw, even though it tells them the story is compromised.", "Varna källan i dag via en kanal som spionprogrammet aldrig såg, även om det säger hen att artikeln är röjd."],
          ["Do not contact the source until you know whether the attacker is still watching; any contact could point to them.", "Kontakta inte källan förrän ni vet om angriparen fortfarande bevakar; varje kontakt kan peka ut hen."],
          ["Ask a trusted intermediary, the source's own lawyer, to warn them and advise them.", "Be en betrodd mellanhand, källans egen advokat, att varna och ge hen råd."]
        ], {
          knowns: [["The attacker could identify the source from the phone's data.", "Angriparen kan identifiera källan utifrån telefonens uppgifter."]],
          uncertainties: [["Whether the attacker has already worked it out, and who the attacker is.", "Om angriparen redan har räknat ut det, och vem angriparen är."]],
          tradeoffs: {
            operational: ["Any contact must avoid every channel and place the phone knew.", "All kontakt måste undvika varje kanal och plats som telefonen kände till."],
            security: ["Contact can confirm the link; silence can leave them unwarned.", "Kontakt kan bekräfta kopplingen; tystnad kan lämna hen ovarnad."],
            legal: ["The duty to protect a source covers more than not naming them.", "Skyldigheten att skydda en källa omfattar mer än att inte nämna hen."],
            reputational: ["Sources everywhere will hear how you treated this one.", "Källor överallt kommer att höra hur ni behandlade den här."]
          },
          evaluation: [["Puts the source's safety ahead of the story, and warns them without creating a new trail", "Sätter källans säkerhet före artikeln, och varnar hen utan att skapa ett nytt spår"]],
          pushback: {
            A: [
              pb(["Which channel is clean?", "Vilken kanal är ren?"], ["Every channel the reporter used is in the stolen contacts and chat history. The only clean route anyone can think of is a person who has never met the source. Who carries the warning, and how will the source know it is genuine?", "Varje kanal reportern använt finns i de stulna kontakterna och chatthistoriken. Den enda rena väg någon kommer på är en person som aldrig träffat källan. Vem bär varningen, och hur ska källan veta att den är äkta?"]),
              pb(["Frightened people leave trails", "Rädda människor lämnar spår"], ["A warning tells the source they may be known. Frightened people make calls, search old messages, or confide in a colleague, and any of it can leave a new trail. Do you tell them exactly what to do next, and is that even your role?", "En varning säger källan att hen kanske är känd. Rädda människor ringer samtal, letar i gamla meddelanden eller anförtror sig åt en kollega, och allt det kan lämna nya spår. Säger ni exakt vad hen ska göra härnäst, och är det ens er roll?"]),
              pb(["The story editor objects", "Redaktören protesterar"], ["The story's editor says that once warned, the source may withdraw and the investigation could collapse days before publication. They want the warning held until the documents are secured. Do you put the story at risk to warn the source today?", "Artikelns redaktör säger att källan kan dra sig ur när hen väl är varnad, och att granskningen då kan falla ihop dagar före publicering. Redaktören vill vänta med varningen tills dokumenten är säkrade. Sätter ni artikeln på spel för att varna källan i dag?"])
            ],
            B: [
              pb(["A question with no answer", "En fråga utan svar"], ["The lab says the command server rotated two days ago: the operator may have moved on, or simply moved. It cannot tell you whether anyone is still watching. How long do you leave the source unwarned on a question that may never be answered?", "Labbet säger att styrservern byttes för två dagar sedan: aktören kan ha gått vidare, eller bara flyttat. Det kan inte säga om någon fortfarande bevakar. Hur länge lämnar ni källan ovarnad på en fråga som kanske aldrig får svar?"]),
              pb(["She made a promise", "Hon gav ett löfte"], ["The reporter says she promised her source she would warn them if anything went wrong, and she will not break that promise. She is ready to go herself. Do you order her not to, and what if she goes anyway?", "Reportern säger att hon lovade källan att varna hen om något gick fel, och att hon inte tänker bryta det löftet. Hon är beredd att åka själv. Beordrar ni henne att låta bli, och vad gör ni om hon åker ändå?"]),
              pb(["The source keeps trying", "Källan fortsätter försöka"], ["The source has tried to reach the reporter twice today through their usual app and got no reply. If someone is watching, those attempts are already a signal; if not, the silence is frightening them. Does staying quiet still protect them?", "Källan har försökt nå reportern två gånger i dag via den vanliga appen utan att få svar. Om någon bevakar är försöken redan en signal; om inte skrämmer tystnaden hen. Skyddar tystnaden fortfarande källan?"])
            ],
            C: [
              pb(["Finding the lawyer", "Att hitta advokaten"], ["Nobody at the paper knows who the source's lawyer is, and finding out means asking around about the source. Every enquiry is a new trail pointing their way. How do you reach a lawyer you cannot name without naming the client?", "Ingen på tidningen vet vem källans advokat är, och att ta reda på det betyder att fråga runt om källan. Varje förfrågan är ett nytt spår som pekar mot hen. Hur når ni en advokat ni inte kan namnge utan att namnge klienten?"]),
              pb(["A predictable call", "Ett förutsägbart samtal"], ["If the lawyer's number is anywhere in the reporter's contacts or messages, the attacker has it too. A call from the newspaper to that lawyer is exactly what someone watching would expect. How do you reach the intermediary without lighting the way?", "Om advokatens nummer finns någonstans i reporterns kontakter eller meddelanden har angriparen det också. Ett samtal från tidningen till den advokaten är precis vad den som bevakar skulle vänta sig. Hur når ni mellanhanden utan att lysa upp vägen?"]),
              pb(["Someone you cannot direct", "Någon ni inte kan styra"], ["{{person.legal.name}} warns that briefing an outside lawyer means telling them what you know about the spyware and the story. That lawyer owes duties to the source, not to you, and may advise them to go to their employer. Do you hand the warning to someone you cannot direct?", "{{person.legal.name}} varnar för att en extern advokat måste få veta vad ni vet om spionprogrammet och artikeln. Den advokaten har skyldigheter mot källan, inte mot er, och kan råda hen att gå till arbetsgivaren. Lämnar ni varningen till någon ni inte kan styra?"])
            ]
          }
        }),
        facilitator: fac(
          ["There is no safe option, only less dangerous ones. The reporter's challenge tests whether emotion overrides tradecraft.", "Det finns inget säkert alternativ, bara mindre farliga. Reporterns utmaning prövar om känslor går före försiktighet."],
          ["Warn the source promptly, through a channel and a person the attacker cannot have seen.", "Varna källan snabbt, via en kanal och en person som angriparen inte kan ha sett."],
          [["Ask: if the attacker already knows, what does silence cost the source?", "Fråga: om angriparen redan vet, vad kostar tystnaden då källan?"]]
        )
      },
      {
        id: "p3",
        clock: 2880,
        title: L(["Suspended", "Avstängd"]),
        twist: L(["This morning the source's employer suspended them “pending an internal investigation into leaked documents”. Nobody at the newspaper has said a word to the company.", "I morse stängde källans arbetsgivare av hen ”i väntan på en intern utredning om läckta dokument”. Ingen på tidningen har sagt ett ord till företaget."]),
        twistKind: "impact",
        reconsider: { decision: "d1", pressure: { en: "The company acted on the source two days after you found the spyware. Whatever you did with the phone, was it fast enough, and did it leave a sign?", sv: "Företaget agerade mot källan två dagar efter att ni hittade spionprogrammet. Vad ni än gjorde med telefonen, var det tillräckligt snabbt, och lämnade det ett tecken?" } },
        branches: [
          { when: { decision: "d2", option: "A" }, narrativeAppend: { en: "Because you warned the source directly, they deleted their messages and copies in a panic, including two documents the story depends on.", sv: "Eftersom ni varnade källan direkt raderade hen i panik sina meddelanden och kopior, däribland två dokument som artikeln bygger på." } }
        ],
        assumptionChallenged: L(["Only we know who the source is.", "Bara vi vet vem källan är."]),
        narrative: L([
          "{{time.T+2880|weekday|cap}}. The source calls the reporter's new number from a phone box. Security walked them out of the office at eight, took their laptop and badge, and told them not to talk to anyone.\n\nThe company has not contacted the newspaper. Its press office has, however, booked a press conference for the day before your planned publication, to present “new transparency measures on contracts”.",
          "{{time.T+2880|weekday|cap}}. Källan ringer reporterns nya nummer från en telefonautomat. Säkerhetspersonal följde ut hen från kontoret klockan åtta, tog dator och passerkort och sa åt hen att inte prata med någon.\n\nFöretaget har inte kontaktat tidningen. Dess pressavdelning har däremot bokat en presskonferens dagen före er planerade publicering, för att presentera ”nya åtgärder för öppenhet kring avtal”."
        ]),
        injects: [
          inj("i3-1", 2880, "phoneTranscript", "employee", "high", "confirmed", [
            "The source: “They know. I don't know how, but they know. My lawyer says I could lose everything if they can prove I gave you documents. Please tell me you've got this under control.”",
            "Källan: ”De vet. Jag vet inte hur, men de vet. Min advokat säger att jag kan förlora allt om de kan bevisa att jag gav er dokument. Snälla, säg att ni har det här under kontroll.”"
          ], { tests: ["lo2"] }),
          inj("i3-2", 2900, "newsHeadline", "media", "medium", "confirmed", [
            "Company announces press conference on “new transparency measures on contracts”, scheduled for the day before the newspaper's planned publication.",
            "Företaget kallar till presskonferens om ”nya åtgärder för öppenhet kring avtal”, planerad till dagen före tidningens planerade publicering."
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Can you show that the company's knowledge came from the spyware, and not from a leak inside the newspaper?", "Kan ni visa att företagets vetskap kom från spionprogrammet, och inte från en läcka inne på tidningen?", ["ciso"]),
            q("What else might the attacker now hold about the story?", "Vad mer kan angriparen nu ha om artikeln?", ["ciso", "itOps"]),
            q("Looking at the source now, was the way you protected them the right one?", "Med källan framför er nu, var ert sätt att skydda hen det rätta?", ["legal"], "d2")
          ],
          executive: [
            q("Does publishing now help the source or hurt them?", "Hjälper eller stjälper en publicering nu källan?", ["ceo", "legal"]),
            q("What support can the newspaper give a suspended source, legally?", "Vilket stöd kan tidningen ge en avstängd källa, rent juridiskt?", ["legal"]),
            q("Would you choose the same way to reach the source again?", "Skulle ni välja samma sätt att nå källan igen?", ["ceo"], "d2")
          ]
        },
        challenges: [ch("The company's press conference will pre-empt the story with its own version of the facts.", "Företagets presskonferens kommer att föregripa artikeln med en egen version av fakta.")],
        decision: dec("d3", "ceo", ["What happens to the story?", "Vad händer med artikeln?"], [
          ["Publish as planned in four days: delay only helps the company, and the source's sacrifice deserves the story.", "Publicera som planerat om fyra dagar: att vänta hjälper bara företaget, och källans uppoffring förtjänar artikeln."],
          ["Delay until the source has legal protection and the documents are verified independently of them.", "Skjut upp tills källan har juridiskt skydd och dokumenten är verifierade oberoende av hen."],
          ["Publish tonight, before the press conference, with what you can stand behind now.", "Publicera i kväll, före presskonferensen, med det ni kan stå för nu."]
        ], {
          knowns: [["The source has been suspended and the company is preparing its own version.", "Källan har stängts av och företaget förbereder sin egen version."]],
          uncertainties: [["Whether the story still holds without the source's help, and what the company knows.", "Om artikeln fortfarande håller utan källans hjälp, och vad företaget vet."]],
          tradeoffs: {
            operational: ["Publishing early means verifying in hours what was planned for days.", "Att publicera tidigt betyder att verifiera på timmar det som var planerat för dagar."],
            security: ["The attacker may hold your drafts and know your timing.", "Angriparen kan ha era utkast och känna till er tidsplan."],
            legal: ["A rushed story is easier to sue.", "En forcerad artikel är lättare att stämma."],
            reputational: ["Letting the company speak first lets it frame the story.", "Att låta företaget tala först låter det rama in historien."]
          },
          evaluation: [["Weighs the public interest against the source's safety, and does not let the attacker set the timetable", "Väger allmänintresset mot källans säkerhet, och låter inte angriparen bestämma tidsplanen"]],
          pushback: {
            A: [
              pb(["They speak first", "De talar först"], ["The company's press conference lands a day before your story. Its version of the contracts will be the one readers hear first, and yours will read as a reply. Are you willing to let them set the frame?", "Företagets presskonferens hålls dagen före er artikel. Dess version av avtalen blir den läsarna hör först, och er kommer att läsas som ett svar. Är ni beredda att låta dem sätta ramen?"]),
              pb(["The source asks you to wait", "Källan ber er vänta"], ["The source's lawyer asks you to hold the story until the employer's investigation is over, warning that publication will be treated as proof the source leaked. Do you publish over the objection of the person who took the risk?", "Källans advokat ber er hålla inne artikeln tills arbetsgivarens utredning är klar, och varnar för att publiceringen kommer att tas som bevis för att källan läckt. Publicerar ni mot viljan hos den som tog risken?"]),
              pb(["A plan they may have read", "En plan de kanske har läst"], ["The attacker read the reporter's messages for weeks, including talk about the publication date. The company's timing suggests it knows your schedule. Is a plan the other side may have read still a plan worth keeping?", "Angriparen läste reporterns meddelanden i veckor, även samtal om publiceringsdagen. Företagets tidsval tyder på att det känner till er tidsplan. Är en plan som motparten kanske har läst fortfarande värd att hålla fast vid?"])
            ],
            B: [
              pb(["Their version stands", "Deras version står kvar"], ["After the press conference, the company's account will stand unchallenged for days or weeks, and other outlets may report it as fact. Does delaying protect the source, or leave them looking like someone who leaked for nothing?", "Efter presskonferensen står företagets version oemotsagd i dagar eller veckor, och andra medier kan rapportera den som fakta. Skyddar uppskovet källan, eller får det hen att se ut som någon som läckte för ingenting?"]),
              pb(["The reporter wants it in writing", "Reportern vill ha det skriftligt"], ["The reporter says the source gave up their job for this story and that delaying now betrays them. She asks for the decision in writing. Do you hold your ground with your own reporter, and how do you explain it to the source?", "Reportern säger att källan offrade sitt jobb för artikeln och att ett uppskov nu sviker hen. Hon vill ha beslutet skriftligt. Står ni fast mot er egen reporter, och hur förklarar ni det för källan?"]),
              pb(["Verifying narrows the circle", "Verifiering drar åt snaran"], ["Verifying the documents without the source means asking other people at the company about them. Every question tells the company more about what you hold, and who could have had it. How do you verify without narrowing the circle around the source?", "Att verifiera dokumenten utan källan betyder att fråga andra personer på företaget om dem. Varje fråga berättar mer för företaget om vad ni har, och vem som kan ha haft det. Hur verifierar ni utan att dra åt cirkeln runt källan?"])
            ],
            C: [
              pb(["On whose timetable?", "Vems tidsplan?"], ["If the attacker has your drafts, they also know you could publish early. Running tonight is a move a company watching your messages may already have prepared for. Are you acting on your own timetable, or theirs?", "Om angriparen har era utkast vet de också att ni kan publicera tidigare. Att publicera i kväll är ett drag som ett företag som läser era meddelanden kan ha förberett sig på. Följer ni er egen tidsplan, eller deras?"]),
              pb(["A thinner story", "En tunnare artikel"], ["Legal review needs hours you do not have, and several claims rest on documents only the source could confirm. To run tonight, those claims must be cut or softened. How much do you drop to beat the press conference, and is what remains still the story?", "Den juridiska granskningen behöver timmar ni inte har, och flera påståenden vilar på dokument som bara källan kan bekräfta. För att publicera i kväll måste de strykas eller mildras. Hur mycket stryker ni för att hinna före presskonferensen, och är det som återstår fortfarande artikeln?"]),
              pb(["No time to prepare", "Ingen tid att förbereda"], ["The source, suspended and still without settled legal advice, would learn about publication from the website like everyone else. They have had no chance to prepare. Do you tell them before it runs, and on what channel?", "Källan, avstängd och fortfarande utan ordnat juridiskt stöd, skulle få veta om publiceringen via webbplatsen som alla andra. Hen har inte haft någon chans att förbereda sig. Berättar ni för hen innan den publiceras, och via vilken kanal?"])
            ]
          }
        }),
        facilitator: fac(
          ["Every option has a human cost. Watch whether the room still talks about the source, or only about the story.", "Varje alternativ har ett mänskligt pris. Se om rummet fortfarande pratar om källan, eller bara om artikeln."],
          ["Publish when the story stands without the source, with legal support arranged for them.", "Publicera när artikeln står på egna ben utan källan, med juridiskt stöd ordnat för hen."],
          [["Ask: what would the source say, if they were in this room?", "Fråga: vad skulle källan säga, om hen satt i det här rummet?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 4320,
        title: L(["Not only her phone", "Inte bara hennes telefon"]),
        twist: L(["The lab checks the whole newsroom. {{num.phones}} more phones carry the same spyware, including the editor-in-chief's and the newsroom lawyer's. This was never about one reporter.", "Labbet kontrollerar hela redaktionen. Ytterligare {{num.phones}} telefoner bär samma spionprogram, däribland chefredaktörens och redaktionens jurists. Det här handlade aldrig om en enda reporter."]),
        twistKind: "scope",
        branches: [
          { when: { decision: "d3", option: "C" }, narrativeAppend: { en: "Because the story ran last night, the company's response this morning quotes a detail that only the source could have known. They are no longer guessing.", sv: "Eftersom artikeln publicerades i går kväll citerar företagets svar i morse en detalj som bara källan kunde ha känt till. De gissar inte längre." } }
        ],
        assumptionChallenged: L(["One reporter was targeted.", "En reporter var måltavla."]),
        reveals: ["hf-newsroom"],
        narrative: L([
          "{{time.T+4320|weekday|cap}}. The lab's second report lists phone after phone. The editor-in-chief's. The lawyer who reviews every investigative story before publication. Two other reporters who have written about the same company.\n\nWhoever did this has had a seat in the newsroom's editorial meetings, through the microphones in people's pockets, for weeks. {{person.ceo.name}} asks the question everyone is thinking: what else have they read?",
          "{{time.T+4320|weekday|cap}}. Labbets andra rapport listar telefon efter telefon. Chefredaktörens. Juristen som granskar varje granskande artikel före publicering. Två andra reportrar som har skrivit om samma företag.\n\nDen som gjorde det här har suttit med på redaktionens möten, via mikrofonerna i folks fickor, i veckor. {{person.ceo.name}} ställer frågan som alla tänker: vad mer har de läst?"
        ]),
        injects: [
          inj("i4-1", 4320, "forensicFinding", "forensics", "critical", "confirmed", [
            "Newsroom sweep: {{num.phones}} additional devices infected with the same spyware build, infection dates spread over 3 weeks. Common command infrastructure. Laptops and the editorial system show no infection.",
            "Genomsökning av redaktionen: ytterligare {{num.phones}} enheter infekterade med samma version av spionprogrammet, infektionsdatum spridda över 3 veckor. Gemensam styrinfrastruktur. Datorer och redaktionssystemet visar ingen infektion."
          ], { reveals: ["hf-newsroom"], tests: ["lo1"] }),
          inj("i4-2", 4340, "email", "csirt", "medium", "confirmed", [
            "{{reg.csirt|cap}}: “We are aware of this spyware being used against journalists in the region. We can assist with analysis and would like to include your case, anonymised, in a warning to other media.”",
            "{{reg.csirt|cap}}: ”Vi känner till att det här spionprogrammet används mot journalister i regionen. Vi kan bistå med analys och vill gärna ta med ert fall, anonymiserat, i en varning till andra medier.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How do you hold an editorial meeting this week that nobody can hear?", "Hur håller ni ett redaktionsmöte den här veckan som ingen kan höra?", ["securityOfficer", "itOps"]),
            q("What must you assume the attacker knows about every story in progress?", "Vad måste ni anta att angriparen vet om varje pågående artikel?", ["ciso"]),
            q("Did the timing of the story change what the company knows?", "Ändrade tidpunkten för artikeln vad företaget vet?", ["ciso"], "d3")
          ],
          executive: [
            q("Do you tell the public that the newsroom was spied on?", "Berättar ni för allmänheten att redaktionen har avlyssnats?", ["ceo", "comms"]),
            q("Which other sources, on other stories, may now be exposed?", "Vilka andra källor, i andra artiklar, kan nu vara röjda?", ["ceo", "legal"]),
            q("Would you make the same call on publication again?", "Skulle ni fatta samma beslut om publiceringen igen?", ["ceo"], "d3")
          ]
        },
        challenges: [ch("Some reporters refuse to hand over their phones: they hold other sources' contact details.", "En del reportrar vägrar lämna ifrån sig sina telefoner: de innehåller andra källors kontaktuppgifter.")],
        decision: dec("d4", "ceo", ["How do you respond to a newsroom under surveillance?", "Hur bemöter ni en redaktion under avlyssning?"], [
          ["Report to the police and {{reg.csirt}}, and go public that the newsroom was targeted.", "Anmäl till polisen och {{reg.csirt}}, och gå ut offentligt med att redaktionen var måltavla."],
          ["Work with an independent lab and a press-freedom organisation, and stay quiet until every source is safe.", "Arbeta med ett oberoende labb och en pressfrihetsorganisation, och håll tyst tills varje källa är i säkerhet."],
          ["Replace every phone quietly, and say nothing publicly until the story is out.", "Byt ut varje telefon i tysthet, och säg ingenting offentligt förrän artikeln är publicerad."]
        ], {
          knowns: [["Several newsroom phones, including senior editors', were under surveillance for weeks.", "Flera telefoner på redaktionen, även ledande redaktörers, har avlyssnats i veckor."]],
          uncertainties: [["Who is behind it, and which other sources are exposed.", "Vem som ligger bakom, och vilka andra källor som är röjda."]],
          tradeoffs: {
            operational: ["Replacing every phone and rethinking every channel takes weeks.", "Att byta varje telefon och tänka om varje kanal tar veckor."],
            security: ["Going public warns the attacker; silence lets them keep watching others.", "Att gå ut offentligt varnar angriparen; tystnad låter dem fortsätta bevaka andra."],
            legal: ["A police report brings investigators close to protected material.", "En polisanmälan för utredare nära skyddat material."],
            reputational: ["Other sources will decide whether to trust you based on this.", "Andra källor kommer att avgöra om de litar på er utifrån det här."]
          },
          evaluation: [["Protects every exposed source first, and uses the authorities without handing them the sources", "Skyddar varje röjd källa först, och använder myndigheterna utan att lämna ut källorna"]],
          pushback: {
            A: [
              pb(["Sources hear it from the news", "Källor får veta via nyheterna"], ["Going public tells every source who has talked to these reporters that their contacts may be exposed, before you have warned any of them privately. Some will hear it first from the news. Do you hold the announcement until each one is warned?", "Att gå ut offentligt säger till varje källa som pratat med de här reportrarna att deras kontakter kan vara röjda, innan ni hunnit varna någon av dem enskilt. En del får höra det först på nyheterna. Väntar ni med beskedet tills var och en är varnad?"]),
              pb(["The attacker is listening", "Angriparen lyssnar"], ["Your announcement tells the operator exactly what you found. The infrastructure behind the spyware may vanish within hours, and with it the best clues to who did this. Do you trade the investigation for the public warning?", "Ert besked talar om för aktören exakt vad ni har hittat. Infrastrukturen bakom spionprogrammet kan försvinna inom några timmar, och med den de bästa spåren till vem som gjorde det. Byter ni utredningen mot den offentliga varningen?"]),
              pb(["Whose phones?", "Vems telefoner?"], ["Going public means being asked whose phones were hit. Naming the editor-in-chief and the newsroom lawyer invites the question of what else they discussed near those phones. Do you name them, or keep that back and be accused of hiding it?", "Att gå ut offentligt betyder att få frågan vems telefoner som drabbades. Att nämna chefredaktören och redaktionens jurist väcker frågan om vad mer de pratade om i närheten av telefonerna. Namnger ni dem, eller håller ni inne med det och anklagas för att dölja det?"])
            ],
            B: [
              pb(["“Every source” is a lot", "”Varje källa” är många"], ["Reporters say the infected phones hold hundreds of contacts from years of stories. “Until every source is safe” could take months, while others in the region may be targeted. When does your silence end?", "Reportrarna säger att de infekterade telefonerna innehåller hundratals kontakter från flera års artiklar. ”Tills varje källa är i säkerhet” kan ta månader, medan andra i regionen kan vara måltavlor. När tar er tystnad slut?"]),
              pb(["Other newsrooms", "Andra redaktioner"], ["{{reg.csirt|cap}} wants to include your case, anonymised, in a warning to other media this week. Staying quiet means asking it to leave you out while other newsrooms may be infected right now. Do you hold back a warning that could protect other journalists?", "{{reg.csirt|cap}} vill ta med ert fall, anonymiserat, i en varning till andra medier den här veckan. Att tiga betyder att be dem utelämna er medan andra redaktioner kan vara infekterade just nu. Håller ni tillbaka en varning som kan skydda andra journalister?"]),
              pb(["It leaks anyway", "Det läcker ändå"], ["Dozens of staff know their phones were checked, and one has mentioned it to a reporter at another paper. The news may break without you. Do you get ahead of it, or keep holding?", "Dussintals medarbetare vet att deras telefoner har kontrollerats, och en av dem har nämnt det för en reporter på en annan tidning. Nyheten kan komma ut utan er. Går ni ut först, eller fortsätter ni hålla tyst?"])
            ],
            C: [
              pb(["Evidence in the drawer", "Bevis i lådan"], ["If the old phones are wiped and returned, the trail to whoever did this goes with them; the lab wants every one preserved. A quiet swap and a locked drawer of infected phones are hard to keep secret together. Do you keep the evidence, or let it go?", "Om de gamla telefonerna raderas och lämnas tillbaka försvinner spåret till den som gjorde det här; labbet vill att varenda en bevaras. Ett tyst byte och en låst låda med infekterade telefoner är svåra att hålla hemliga samtidigt. Behåller ni bevisen, eller släpper ni dem?"]),
              pb(["Staff ask why", "Personalen frågar varför"], ["Staff get new phones with no explanation, and the newsroom lawyer asks why their own phone is being taken. A quiet swap in a building full of reporters will not stay quiet. What do you tell your own people?", "Personalen får nya telefoner utan förklaring, och redaktionens jurist frågar varför hens telefon tas. Ett tyst byte i ett hus fullt av reportrar förblir inte tyst. Vad säger ni till era egna medarbetare?"]),
              pb(["Same message, new phone", "Samma meddelande, ny telefon"], ["The spyware needed no click. Nothing about a new phone stops the same operator sending the same kind of message tomorrow. Is a replacement that nobody is told about protection, or just a fresh start for the attacker?", "Spionprogrammet krävde inget klick. Inget med en ny telefon hindrar samma aktör från att skicka samma sorts meddelande i morgon. Är ett byte som ingen får veta om ett skydd, eller bara en nystart för angriparen?"])
            ]
          }
        }),
        facilitator: fac(
          ["The scope has exploded. The challenge about reporters refusing to hand over phones is source protection in miniature.", "Omfattningen har exploderat. Utmaningen om reportrar som vägrar lämna sina telefoner är källskydd i miniatyr."],
          ["Find and protect every exposed source, involve the authorities carefully, and decide openly on disclosure.", "Hitta och skydda varje röjd källa, involvera myndigheterna varsamt, och besluta öppet om att gå ut."],
          [["Ask: who outside this building is in danger tonight because of these phones?", "Fråga: vem utanför den här byggnaden är i fara i kväll på grund av de här telefonerna?"]]
        )
      },
      {
        id: "p5",
        clock: 7200,
        title: L(["The police want the phone", "Polisen vill ha telefonen"]),
        twist: L(["The police open an investigation into the spyware and ask for the reporter's phone, a full copy of its contents and her notes, as evidence.", "Polisen inleder en utredning om spionprogrammet och begär reporterns telefon, en fullständig kopia av dess innehåll och hennes anteckningar, som bevis."]),
        twistKind: "authority",
        reconsider: { decision: "d2", pressure: { en: "The police want everything on the phone, including the conversations with the source you tried to protect. Does the way you protected them still hold if investigators read it all?", sv: "Polisen vill ha allt på telefonen, även samtalen med källan som ni försökte skydda. Håller ert sätt att skydda hen fortfarande om utredarna läser allt?" } },
        branches: [
          { when: { decision: "d4", option: "A" }, narrativeAppend: { en: "Because you went public, press-freedom groups have rallied behind you, and the company now says you are hiding behind the hack to avoid questions about your documents.", sv: "Eftersom ni gick ut offentligt har pressfrihetsorganisationer ställt sig bakom er, och företaget säger nu att ni gömmer er bakom intrånget för att slippa frågor om era dokument." } }
        ],
        assumptionChallenged: L(["The police are simply on our side.", "Polisen står helt enkelt på vår sida."]),
        narrative: L([
          "{{time.T+7200|weekday|cap}}. The detective is polite and serious. Spying on journalists is a crime they want to solve, and the phone is the best evidence they have.\n\n{{person.legal.name}} is just as serious. The phone holds the reporter's conversations with her source and with others. Handing it over, or a copy of it, puts protected material in a police file, where it may one day be read by a defence lawyer working for whoever did this.",
          "{{time.T+7200|weekday|cap}}. Utredaren är artig och allvarlig. Att spionera på journalister är ett brott som polisen vill klara upp, och telefonen är det bästa bevis de har.\n\n{{person.legal.name}} är lika allvarlig. Telefonen innehåller reporterns samtal med sin källa och med andra. Att lämna ut den, eller en kopia, placerar skyddat material i en polisutredning, där det en dag kan läsas av en försvarsadvokat som arbetar för den som gjorde det här."
        ]),
        injects: [
          inj("i5-1", 7200, "email", "police", "high", "confirmed", [
            "Request: the device, a complete forensic image and the reporter's notes relating to the period of infection, to identify the operator of the spyware. We understand the sensitivity and will discuss handling.",
            "Begäran: enheten, en fullständig forensisk avbild och reporterns anteckningar från infektionsperioden, för att identifiera den som styrt spionprogrammet. Vi förstår känsligheten och diskuterar gärna hanteringen."
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Can the evidence the police need be separated from the source material?", "Kan bevisen som polisen behöver skiljas från källmaterialet?", ["ciso", "legal"]),
            q("Who should hold the forensic image, and under what controls?", "Vem ska förvara den forensiska avbilden, och under vilka kontroller?", ["ciso"]),
            q("Did going public, or staying quiet, change what the police can ask for?", "Ändrade det att gå ut offentligt, eller att tiga, vad polisen kan begära?", ["legal"], "d4")
          ],
          executive: [
            q("Is helping the police catch the spies worth any risk to the source?", "Är det värt någon risk för källan att hjälpa polisen fånga spionerna?", ["ceo", "legal"]),
            q("Who decides: the editor, the lawyer, or the reporter?", "Vem bestämmer: redaktören, juristen eller reportern?", ["ceo"]),
            q("Looking at the company's reaction, would you go public in the same way again?", "Med företagets reaktion framför er, skulle ni gå ut offentligt på samma sätt igen?", ["comms"], "d4")
          ]
        },
        challenges: [ch("The reporter says she will resign before she lets anyone read her conversations with the source.", "Reportern säger att hon säger upp sig hellre än att låta någon läsa hennes samtal med källan.")],
        decision: dec("d5", "legal", ["What do you give the police?", "Vad lämnar ni till polisen?"], [
          ["The device and a filtered copy: technical evidence only, with source material removed under a court-supervised process.", "Enheten och en filtrerad kopia: enbart tekniska bevis, med källmaterialet borttaget i en process under domstolens överinseende."],
          ["Nothing from the phone; give them the lab's technical report and indicators instead.", "Ingenting från telefonen; ge dem labbets tekniska rapport och indikatorer i stället."],
          ["The phone and a full copy: catching whoever did this protects every source.", "Telefonen och en fullständig kopia: att fånga den som gjorde det här skyddar alla källor."]
        ], {
          knowns: [["The police need evidence; the phone is full of protected material.", "Polisen behöver bevis; telefonen är full av skyddat material."]],
          uncertainties: [["Whether a filtered copy will be enough for the police and acceptable to a court.", "Om en filtrerad kopia räcker för polisen och godtas av en domstol."]],
          tradeoffs: {
            operational: ["A court-supervised process takes weeks.", "En process under domstolens överinseende tar veckor."],
            security: ["Without evidence, the operator stays free to target others.", "Utan bevis kan den som ligger bakom fortsätta rikta in sig på andra."],
            legal: ["Source protection is a legal duty, not only a promise.", "Källskydd är en rättslig skyldighet, inte bara ett löfte."],
            reputational: ["Handing over a reporter's phone will be remembered by every source.", "Att lämna ut en reporters telefon kommer att minnas av varje källa."]
          },
          evaluation: [["Helps the investigation without letting protected material out of the newspaper's control", "Hjälper utredningen utan att släppa skyddat material ur tidningens kontroll"]],
          pushback: {
            A: [
              pb(["Who decides what is source material?", "Vem avgör vad som är källmaterial?"], ["Filtering means someone decides which data identifies a source. A location log or a calendar entry can point to a person as surely as a name. Who does the filtering, and how do you prove nothing slipped through?", "Att filtrera betyder att någon avgör vilka uppgifter som identifierar en källa. En platslogg eller en kalenderpost kan peka ut en person lika säkert som ett namn. Vem filtrerar, och hur bevisar ni att inget slank igenom?"]),
              pb(["Strangers still read it", "Främlingar läser ändå"], ["The reporter says a filtered copy still means strangers reading her messages to decide what to remove. She repeats that she will resign. Is a court-supervised process enough to keep her, or does she get a veto?", "Reportern säger att en filtrerad kopia ändå betyder att främlingar läser hennes meddelanden för att avgöra vad som ska bort. Hon upprepar att hon säger upp sig. Räcker en process under domstolens överinseende för att behålla henne, eller får hon ett veto?"]),
              pb(["A copy that may not hold", "En kopia som kanske inte håller"], ["The detective warns that a filtered image may be challenged in court, because the defence will argue something was removed. Your filter could weaken the case against the spies. Do you accept that, or give more?", "Utredaren varnar för att en filtrerad avbild kan ifrågasättas i rätten, eftersom försvaret kommer att hävda att något tagits bort. Ert filter kan försvaga målet mot spionerna. Godtar ni det, eller lämnar ni mer?"])
            ],
            B: [
              pb(["A court order instead", "Ett domstolsbeslut i stället"], ["The detective says the indicators help, but without the device they may seek a court order for it. A seizure would take the phone on their terms, not yours. Do you hold out, knowing you could lose control of the handover?", "Utredaren säger att indikatorerna hjälper, men att polisen utan enheten kan begära ett domstolsbeslut om den. Ett beslag tar telefonen på deras villkor, inte era. Står ni emot, med vetskap om att ni kan förlora kontrollen över överlämnandet?"]),
              pb(["Journalists elsewhere", "Journalister på andra håll"], ["The police say the same spyware is believed to target other journalists in the region, and your phone is their best chance of identifying the operator. Do you put your source ahead of reporters you have never met?", "Polisen säger att samma spionprogram tros riktas mot andra journalister i regionen, och att er telefon är deras bästa chans att identifiera aktören. Sätter ni er källa före reportrar ni aldrig har träffat?"]),
              pb(["Your own evidence", "Era egna bevis"], ["The lab report is evidence you commissioned and chose to hand over. The other side can say the newspaper decided what the police were allowed to see. Can you defend an investigation built only on what you selected?", "Labbrapporten är bevis som ni beställde och valde att lämna ut. Motparten kan säga att tidningen bestämde vad polisen fick se. Kan ni försvara en utredning som bara bygger på det ni har valt ut?"])
            ],
            C: [
              pb(["She resigns", "Hon säger upp sig"], ["The reporter puts her resignation on the table, and two colleagues say they will stop using work phones for sources. Do you lose your best investigative reporter, and others' trust, to catch the spy?", "Reportern lägger fram sin uppsägning, och två kollegor säger att de slutar använda jobbtelefonen för källor. Förlorar ni er främsta granskande reporter, och andras förtroende, för att fånga spionen?"]),
              pb(["Read by the other side", "Läst av motsidan"], ["Once a full image is in the police file, a future defence lawyer for whoever did this may be entitled to see it. The people who spied on you could end up reading the source conversations legally. Do you still hand it over?", "När en fullständig avbild ligger i polisutredningen kan en framtida försvarsadvokat för den som gjorde det här ha rätt att se den. De som spionerade på er kan till slut läsa samtalen med källan helt lagligt. Lämnar ni ändå ut den?"]),
              pb(["Other people's sources", "Andras källor"], ["The phone holds years of contacts with sources on other stories, none of whom agreed to this. You are deciding for them too. Who asks them, and what if they say no?", "Telefonen innehåller flera års kontakter med källor i andra artiklar, och ingen av dem har gått med på det här. Ni bestämmer åt dem också. Vem frågar dem, och vad händer om de säger nej?"])
            ]
          }
        }),
        facilitator: fac(
          ["Two legitimate goods collide: catching the spy, and protecting the source. The reporter's threat makes it personal.", "Två legitima goda mål krockar: att fånga spionen, och att skydda källan. Reporterns hot gör det personligt."],
          ["Give the police what identifies the attacker, never what identifies the source.", "Ge polisen det som identifierar angriparen, aldrig det som identifierar källan."],
          [["Ask: what would you need to see to be sure the source is not in the copy?", "Fråga: vad skulle ni behöva se för att vara säkra på att källan inte finns i kopian?"]]
        )
      },
      {
        id: "p6",
        clock: 20160,
        title: L(["The owner asks", "Ägaren frågar"]),
        twist: L(["The story is out. The company sues, claiming it was built on stolen documents. The lab confirms how the source was found: the phone's location history put them in the same café as the reporter, twice. And the newspaper group's board asks to be told who the source is, “to assess the legal risk”.", "Artikeln är publicerad. Företaget stämmer och hävdar att den bygger på stulna dokument. Labbet bekräftar hur källan hittades: telefonens platshistorik placerade hen på samma kafé som reportern, två gånger. Och tidningskoncernens styrelse vill få veta vem källan är, ”för att bedöma den juridiska risken”."]),
        twistKind: "scope",
        reconsider: { decision: "d3", pressure: { en: "The company is suing over the story you chose when to run. Knowing what it cost the source, would you choose the same timing?", sv: "Företaget stämmer för artikeln som ni valde när ni skulle publicera. Med vetskap om vad det kostade källan, skulle ni välja samma tidpunkt?" } },
        branches: [
          { when: { decision: "d5", option: "A" }, narrativeAppend: { en: "Because the police copy went through a court-supervised filter, it took three weeks, and the detective says the spyware's servers had moved by the time they could act.", sv: "Eftersom polisens kopia gick genom ett filter under domstolens överinseende tog det tre veckor, och utredaren säger att spionprogrammets servrar hade flyttat innan de kunde agera." } }
        ],
        assumptionChallenged: L(["Inside the company, the source is safe.", "Inom företaget är källan trygg."]),
        reveals: ["hf-cafe"],
        narrative: L([
          "{{time.T+20160|weekday|cap}}, two weeks later. The story has done what investigative stories do: questions in parliament, an audit of the contracts, a chief executive under pressure. The company's lawyers have filed a claim against the newspaper.\n\nThe group's chair calls {{person.ceo.name}}. The board is nervous about the claim and the cost. It wants to know who the source is, in confidence, so that it can judge how strong the newspaper's position really is.",
          "{{time.T+20160|weekday|cap}}, två veckor senare. Artikeln har gjort det granskande artiklar gör: frågor i riksdagen, en granskning av avtalen, en vd under press. Företagets jurister har lämnat in en stämning mot tidningen.\n\nKoncernens ordförande ringer {{person.ceo.name}}. Styrelsen är orolig för stämningen och kostnaden. Den vill få veta vem källan är, i förtroende, för att kunna bedöma hur stark tidningens position verkligen är."
        ]),
        injects: [
          inj("i6-1", 20160, "forensicFinding", "forensics", "high", "confirmed", [
            "Location analysis: the reporter's phone and a second device were within 20 metres of each other at a café on two dates. The second device's owner can be identified from the attacker's likely access to telecom metadata.",
            "Platsanalys: reporterns telefon och en annan enhet befann sig inom 20 meter från varandra på ett kafé vid två tillfällen. Den andra enhetens ägare kan identifieras utifrån angriparens troliga tillgång till metadata från teleoperatörer."
          ], { reveals: ["hf-cafe"], tests: ["lo2"] }),
          inj("i6-2", 20200, "executiveMessage", "management", "medium", "confirmed", [
            "Group chair: “The board fully supports the journalism. But we are being sued, and we cannot assess the risk blind. The name stays with three people. I need it by Friday.”",
            "Koncernens ordförande: ”Styrelsen stöder journalistiken fullt ut. Men vi blir stämda, och vi kan inte bedöma risken i blindo. Namnet stannar hos tre personer. Jag behöver det senast på fredag.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What would you change so that meeting a source never leaves a trace like this again?", "Vad skulle ni ändra så att ett möte med en källa aldrig mer lämnar ett sådant spår?", ["securityOfficer", "ciso"]),
            q("Which devices should never be near a source meeting?", "Vilka enheter ska aldrig finnas i närheten av ett källmöte?", ["securityOfficer"]),
            q("Did the way you handled the police help catch anyone?", "Bidrog ert sätt att hantera polisen till att någon greps?", ["legal"], "d5")
          ],
          executive: [
            q("Does the owner of a newspaper have a right to know its sources?", "Har ägaren av en tidning rätt att känna till dess källor?", ["ceo", "legal"]),
            q("What happens to the newspaper if you refuse the board?", "Vad händer med tidningen om ni vägrar styrelsen?", ["ceo"]),
            q("Would you give the police the same again, knowing the servers moved?", "Skulle ni lämna samma sak till polisen igen, med vetskap om att servrarna flyttade?", ["legal"], "d5")
          ]
        },
        challenges: [ch("The chair reminds you that the group pays the legal costs of the claim.", "Ordföranden påminner er om att koncernen betalar rättegångskostnaderna för stämningen.")],
        decision: dec("d6", "ceo", ["What do you tell the board?", "Vad säger ni till styrelsen?"], [
          ["Refuse: no owner or board member is told a source, and explain the legal position in writing.", "Vägra: ingen ägare eller styrelseledamot får veta en källa, och förklara den rättsliga situationen skriftligt."],
          ["Share the source's role, not their name, with the group's legal counsel under legal privilege.", "Dela källans roll, inte namnet, med koncernens jurist under advokatsekretess."],
          ["Tell the chair alone, in person, so the board can fund the defence with confidence.", "Berätta för ordföranden ensam, personligen, så att styrelsen kan finansiera försvaret med trygghet."]
        ], {
          knowns: [["The owner is paying for the defence and wants the name.", "Ägaren betalar för försvaret och vill ha namnet."]],
          uncertainties: [["Whether the board will keep funding the defence if you refuse.", "Om styrelsen fortsätter att finansiera försvaret om ni vägrar."]],
          tradeoffs: {
            operational: ["Losing the board's support could end the newspaper's investigative work.", "Att förlora styrelsens stöd kan sätta stopp för tidningens granskande arbete."],
            security: ["Every person who knows a name is one more way it can leak.", "Varje person som känner till ett namn är ytterligare en väg för det att läcka."],
            legal: ["Source protection binds the newspaper, whoever owns it.", "Källskyddet binder tidningen, vem som än äger den."],
            reputational: ["If sources learn owners can ask, there will be no more sources.", "Om källor får veta att ägare kan fråga kommer det inte att finnas fler källor."]
          },
          evaluation: [["Holds the line on source protection, even against the people who pay", "Står fast vid källskyddet, även mot dem som betalar"]],
          pushback: {
            A: [
              pb(["The board may settle", "Styrelsen kan förlikas"], ["The chair replies that without the name, the board cannot justify the defence costs and will consider settling. A settlement could include accepting that the documents were stolen. Do you refuse anyway, knowing it may sink the story's defence?", "Ordföranden svarar att styrelsen utan namnet inte kan motivera försvarskostnaderna och kommer att överväga en förlikning. En förlikning kan innebära att man godtar att dokumenten var stulna. Vägrar ni ändå, med vetskap om att det kan sänka försvaret av artikeln?"]),
              pb(["Around you", "Förbi er"], ["The chair emails the reporter directly asking for the name, copying the board. She has not replied and is asking you what to do. Do you step in, and what does that do to your relationship with the owners?", "Ordföranden mejlar reportern direkt och ber om namnet, med kopia till styrelsen. Hon har inte svarat och frågar er vad hon ska göra. Går ni in, och vad gör det med er relation till ägarna?"]),
              pb(["A refusal on file", "En vägran i akten"], ["Your written explanation will sit in the group's systems and could be sought in the lawsuit. A careless sentence about why the source needs protection could narrow down who they are. How do you write a refusal that says nothing useful about the person?", "Er skriftliga förklaring kommer att ligga i koncernens system och kan begäras ut i rättegången. En slarvig mening om varför källan behöver skydd kan ringa in vem hen är. Hur skriver ni en vägran som inte säger något användbart om personen?"])
            ],
            B: [
              pb(["A role is a name", "En roll är ett namn"], ["Few people at the company hold the source's role, and the source has already been suspended. Telling anyone the role points straight at them. Is a role really less than a name here?", "Få personer på företaget har källans roll, och källan är redan avstängd. Att berätta rollen för någon pekar rakt mot hen. Är en roll verkligen mindre än ett namn i det här fallet?"]),
              pb(["Counsel must use it", "Juristen måste använda det"], ["Group counsel says that once told the role, they must factor it into the defence strategy and may have to put it before the court. Privilege protects advice, not a fact they argue with. Do you share it knowing it may not stay with them?", "Koncernens jurist säger att när hen väl känner till rollen måste den vägas in i försvaret och kanske läggas fram i rätten. Advokatsekretessen skyddar råd, inte ett faktum man argumenterar med. Delar ni den med vetskap om att den kanske inte stannar där?"]),
              pb(["Unchecked devices", "Okontrollerade enheter"], ["Group counsel works on a laptop and phone the newsroom does not control, and you have just learned how far spyware reached in your own building. Every new holder brings new devices. How do you know the role stays where you put it?", "Koncernens jurist arbetar på en dator och en telefon som redaktionen inte kontrollerar, och ni har just fått se hur långt spionprogrammet nådde i ert eget hus. Varje ny person som vet för med sig nya enheter. Hur vet ni att rollen stannar där ni lägger den?"])
            ],
            C: [
              pb(["The chair's phone", "Ordförandens telefon"], ["The chair will carry the name back into board meetings and onto devices nobody has checked. You have just seen how far spyware reached in your newsroom. What makes the chair's phone any safer?", "Ordföranden kommer att bära namnet in i styrelsemöten och till enheter som ingen har kontrollerat. Ni har just sett hur långt spionprogrammet nådde på er redaktion. Vad gör ordförandens telefon säkrare?"]),
              pb(["A new witness", "Ett nytt vittne"], ["If the company's lawyers learn the chair knows the source, they can try to make the chair testify. The chair is not a journalist and may not share the newsroom's legal protection. Have you just made the chair a witness against the source?", "Om företagets jurister får veta att ordföranden känner till källan kan de försöka tvinga ordföranden att vittna. Ordföranden är inte journalist och omfattas kanske inte av redaktionens rättsliga skydd. Har ni just gjort ordföranden till ett vittne mot källan?"]),
              pb(["The newsroom finds out", "Redaktionen får veta"], ["The reporter hears the chair was told. She says she will warn the source, as she promised, and other reporters say they will stop bringing sources to the editors. Is the board's confidence worth the newsroom's?", "Reportern får höra att ordföranden har fått veta. Hon säger att hon kommer att varna källan, som hon lovade, och andra reportrar säger att de slutar dra in redaktörerna i sina källor. Är styrelsens förtroende värt redaktionens?"])
            ]
          }
        }),
        facilitator: fac(
          ["The last test is the hardest: protecting the source from your own side.", "Det sista provet är det svåraste: att skydda källan från er egen sida."],
          ["The name stays with the newsroom; the board gets the legal position, not the person.", "Namnet stannar på redaktionen; styrelsen får den rättsliga situationen, inte personen."],
          [["Ask: if the chair's phone were infected, where would the name be now?", "Fråga: om ordförandens telefon var infekterad, var skulle namnet finnas då?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "The story is out and the newsroom's phones are clean, but the source has paid for it with their job, the spies have not been caught, and every reporter now knows that a phone in a bag can betray a meeting.",
        "Artikeln är publicerad och redaktionens telefoner är rena, men källan har fått betala med sitt jobb, spionerna har inte gripits, och varje reporter vet nu att en telefon i en väska kan förråda ett möte."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Stop sensitive contact through a compromised device at once, but think about what the attacker will notice.", "Stoppa känslig kontakt via en komprometterad enhet direkt, men tänk på vad angriparen kommer att märka."]),
        L(["A source's safety comes before the story, and before the newspaper's convenience.", "En källas säkerhet går före artikeln, och före tidningens bekvämlighet."]),
        L(["Help investigators with what identifies the attacker, never with what identifies the source.", "Hjälp utredare med det som identifierar angriparen, aldrig med det som identifierar källan."]),
        L(["Source protection binds the whole organisation, owners included.", "Källskyddet binder hela organisationen, ägarna inräknade."])
      ],
      assumptionsVsReality: [
        avr(["She must have clicked something.", "Hon måste ha klickat på något."], ["The spyware needed no click at all.", "Spionprogrammet krävde inget klick alls."], "p2"),
        avr(["One reporter was targeted.", "En reporter var måltavla."], ["Several phones, including the editor-in-chief's, were watched.", "Flera telefoner, även chefredaktörens, bevakades."], "p4"),
        avr(["Only we know who the source is.", "Bara vi vet vem källan är."], ["Location history gave them away.", "Platshistoriken avslöjade hen."], "p6")
      ],
      strengthsToLookFor: [
        L(["Moving source contact off the device immediately", "Att direkt flytta kontakten med källan från enheten"]),
        L(["Warning the source through a channel the attacker never saw", "Att varna källan via en kanal som angriparen aldrig sett"]),
        L(["Refusing the owner the source's name", "Att vägra ge ägaren källans namn"])
      ],
      commonGaps: [
        L(["Leaving the infected phone in the room during the meeting", "Att låta den infekterade telefonen ligga kvar i rummet under mötet"]),
        L(["Handing the police a full copy of the phone", "Att lämna polisen en fullständig kopia av telefonen"]),
        L(["Talking only about the story, and forgetting the source", "Att bara prata om artikeln och glömma källan"])
      ],
      suggestedActions: [
        act(["Give investigative reporters separate, hardened devices for source contact, and keep phones away from source meetings.", "Ge granskande reportrar separata, härdade enheter för källkontakt, och håll telefoner borta från källmöten."], "securityOfficer", "high"),
        act(["Check newsroom phones regularly for spyware, with an independent lab on call.", "Kontrollera redaktionens telefoner regelbundet efter spionprogram, med ett oberoende labb i beredskap."], "ciso", "high"),
        act(["Agree in advance how evidence is shared with police without exposing sources.", "Kom överens i förväg om hur bevis delas med polisen utan att röja källor."], "legal", "medium"),
        act(["Write source protection into the ownership agreement, so no owner can ask.", "Skriv in källskyddet i ägaravtalet, så att ingen ägare kan fråga."], "ceo", "medium")
      ]
    }
  });
})();
