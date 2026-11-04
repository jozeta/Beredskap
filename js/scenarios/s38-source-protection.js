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
  const { L, q, ch, inj, dec, fac, act, avr } = BK.scenarios.h;

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
          evaluation: [["Stops the leak without destroying evidence or alerting the attacker more than needed", "Stoppar läckan utan att förstöra bevis eller varna angriparen mer än nödvändigt"]]
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
          evaluation: [["Puts the source's safety ahead of the story, and warns them without creating a new trail", "Sätter källans säkerhet före artikeln, och varnar hen utan att skapa ett nytt spår"]]
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
          evaluation: [["Weighs the public interest against the source's safety, and does not let the attacker set the timetable", "Väger allmänintresset mot källans säkerhet, och låter inte angriparen bestämma tidsplanen"]]
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
          evaluation: [["Protects every exposed source first, and uses the authorities without handing them the sources", "Skyddar varje röjd källa först, och använder myndigheterna utan att lämna ut källorna"]]
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
          evaluation: [["Helps the investigation without letting protected material out of the newspaper's control", "Hjälper utredningen utan att släppa skyddat material ur tidningens kontroll"]]
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
          evaluation: [["Holds the line on source protection, even against the people who pay", "Står fast vid källskyddet, även mot dem som betalar"]]
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
