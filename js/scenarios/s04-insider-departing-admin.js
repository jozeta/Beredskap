/*
 * s04-insider-departing-admin.js — "The Last Week of Employment" (archetype B).
 *
 * Ambiguous start: a DLP alert on large uploads by a departing administrator,
 * partly consistent with normal handover work → HR and legal set limits on
 * monitoring → the account was active while the employee was on sick leave,
 * from abroad → the employee was coerced, not disloyal → backdoor service
 * accounts exist → police ask to keep access open → uploaded data includes
 * customer configurations → other administrators have been approached too.
 *
 * Ground truth: a criminal group identified the administrator through social
 * media, coerced them with threats six weeks ago, obtained their VPN token and
 * instructed them to create service accounts and export configuration data.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, pb, ir, io } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s04-insider-departing-admin",
    version: 1,
    category: "insider",
    archetype: "ambiguous-start",
    emblem: "insider",
    title: L(["The Last Week of Employment", "Den sista anställningsveckan"]),
    summary: L([
      "A departing administrator is uploading gigabytes to personal cloud storage. Handover work, or theft? Every answer the room reaches turns out to be only half the story — and the person at the centre may be a victim.",
      "En administratör som ska sluta laddar upp gigabyte till privat molnlagring. Överlämning eller stöld? Varje svar gruppen kommer fram till visar sig vara halva historien – och personen i centrum kan vara ett offer."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Investigate an insider alert proportionately and lawfully", "Utreda ett insiderlarm proportionerligt och lagligt"]), teaser: L(["Fairness and proportion", "Rättvisa och proportioner"]) },
      { id: "lo2", text: L(["Coordinate security, HR, legal and privacy in one response", "Samordna säkerhet, HR, juridik och dataskydd i en och samma hantering"]), teaser: L(["Many functions, one response", "Många funktioner, en hantering"]) },
      { id: "lo3", text: L(["Remove persistent privileged access, not only a user account", "Ta bort bestående privilegierad åtkomst, inte bara ett användarkonto"]), teaser: L(["What it really takes to close a door", "Vad som krävs för att verkligen stänga en dörr"]) },
      { id: "lo4", text: L(["Recognise coercion and protect the people involved", "Känna igen påtryckningar och skydda de inblandade"]), teaser: L(["The people behind the event", "Människorna bakom händelsen"]) }
    ],
    mitre: ["T1078", "T1133", "T1136", "T1098", "T1567.002", "T1213"],
    frameworks: {
      nistCsf: ["GV.RR", "GV.PO", "PR.AA", "PR.DS", "DE.CM", "DE.AE", "RS.MA", "RS.AN"],
      iso27001: ["A.5.15", "A.5.18", "A.5.24", "A.5.26", "A.5.28", "A.5.34", "A.6.5", "A.8.2", "A.8.12", "A.8.16"]
    },
    minStages: 4,
    maxStages: 8,
    constraints: { startWindow: "business-hours", sectors: ["technology", "finance", "manufacturing", "energy", "public"] },
    actor: { types: ["criminal"], motivation: L(["Persistent access to resell, obtained through coercion of an employee", "Bestående åtkomst för vidareförsäljning, skaffad genom påtryckningar mot en anställd"]), capability: "medium" },
    variables: {
      gbUploaded: { min: 2, max: 60, scaleBy: "size" },
      daysLeft: { min: 4, max: 12 },
      files: { min: 300, max: 9000, step: 10, scaleBy: "size" },
      backdoors: { min: 2, max: 5 },
      customersAffected: { min: 4, max: 90, scaleBy: "size" }
    },
    roles: ["incidentCommander", "ciso", "cio", "socLead", "itOps", "hr", "legal", "dpo", "securityOfficer", "ceo"],

    groundTruth: {
      rootCause: L([
        "A criminal group identified the administrator through social media and coerced them with threats six weeks ago. Under instruction the administrator handed over their VPN token, created {{num.backdoors}} service accounts with administrator rights and exported configuration data to personal cloud storage. The group also used the token directly while the administrator was on sick leave.",
        "En kriminell grupp identifierade administratören via sociala medier och utsatte hen för hot för sex veckor sedan. På order lämnade administratören över sin VPN-token, skapade {{num.backdoors}} tjänstekonton med administratörsrättigheter och exporterade konfigurationsdata till privat molnlagring. Gruppen använde också token själv medan administratören var sjukskriven."
      ]),
      attackerTimeline: [
        { at: -60480, text: L(["Group profiles administrators at the organisation on social media.", "Gruppen kartlägger organisationens administratörer i sociala medier."]) },
        { at: -60000, text: L(["First threatening contact with the administrator.", "Första hotfulla kontakten med administratören."]) },
        { at: -50400, text: L(["Administrator hands over the VPN token.", "Administratören lämnar över sin VPN-token."]) },
        { at: -40320, text: L(["{{num.backdoors}} service accounts with administrator rights created and named like ordinary integrations.", "{{num.backdoors}} tjänstekonton med administratörsrättigheter skapas och namnges som vanliga integrationer."]) },
        { at: -14400, text: L(["Token used from abroad while the administrator is on sick leave.", "Token används från utlandet medan administratören är sjukskriven."]) },
        { at: -1440, text: L(["Configuration exports uploaded to personal cloud storage.", "Konfigurationsexporter laddas upp till privat molnlagring."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-leave", revealStage: "p3", text: L(["The administrator's account and VPN token were used from abroad while the administrator was on sick leave at home.", "Administratörens konto och VPN-token användes från utlandet medan administratören var sjukskriven hemma."]) },
      { id: "hf-coerced", revealStage: "p4", text: L(["The administrator has been threatened by a criminal group for six weeks and acted under coercion.", "Administratören har hotats av en kriminell grupp i sex veckor och har agerat under tvång."]) },
      { id: "hf-backdoors", revealStage: "p5", text: L(["{{num.backdoors}} service accounts with administrator rights were created as backdoors.", "{{num.backdoors}} tjänstekonton med administratörsrättigheter skapades som bakdörrar."]) },
      { id: "hf-approach", revealStage: "p8", text: L(["The same group has approached other administrators at the organisation.", "Samma grupp har tagit kontakt med andra administratörer i organisationen."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Handover or exfiltration?", "Överlämning eller dataläcka?"]),
        narrative: L([
          "{{time.T+0|day|cap}}, {{time.T+0|clock}}. Data-loss prevention flags large uploads to a personal cloud storage service from {{asset.adminAccount}}.\n\nThe account belongs to a senior administrator, fifteen years at the company, who has resigned and leaves in {{num.daysLeft}} days. They hold the keys to almost everything: firewalls, the directory and customer systems. Their manager says they are simply documenting before they go.",
          "{{time.T+0|day|cap}}, klockan {{time.T+0|clock}}. Dataförlustskyddet larmar om stora uppladdningar till en privat molnlagringstjänst från {{asset.adminAccount}}.\n\nKontot tillhör en erfaren administratör, femton år på företaget, som har sagt upp sig och slutar om {{num.daysLeft}} dagar. Hen har nycklarna till nästan allt: brandväggar, katalogtjänsten och kundsystem. Chefen säger att hen bara dokumenterar innan hen slutar."
        ]),
        injects: [
          inj("i1-1", 0, "siemAlert", "siem", "medium", "confirmed", [
            "{{num.gbUploaded}} GB uploaded over three days to a personal storage account. File names include “firewall-config”, “ad-export” and “runbook”. Activity during normal working hours.",
            "{{num.gbUploaded}} GB uppladdat under tre dagar till ett privat lagringskonto. Filnamnen innehåller bland annat ”firewall-config”, ”ad-export” och ”runbook”. Aktiviteten skedde under normal arbetstid."
          ], { headline: ["Data-loss prevention: large personal uploads", "Dataförlustskydd: stora privata uppladdningar"], tests: ["lo1"] }),
          inj("i1-2", 20, "chat", "person.itOps", "low", "disputed", [
            "“They're documenting everything before leaving — I asked for the runbooks myself. Exporting configs is part of that. I'd be careful about making this a big deal.”",
            "”Hen dokumenterar allt innan hen slutar – jag bad själv om driftinstruktionerna. Att exportera konfigurationer är en del av det. Jag skulle vara försiktig med att göra en stor sak av det här.”"
          ], { facilitatorNote: ["Partly true: a handover was requested. But a handover never needs personal cloud storage. Watch whether the group separates the two.", "Delvis sant: en överlämning har begärts. Men en överlämning kräver aldrig privat molnlagring. Se om gruppen skiljer på de två."], tests: ["lo1"] }),
          inj("i1-3", 40, "logExcerpt", "itOps", "low", "confirmed", [
            "The company's own documentation site shows no new pages from this account in the last month.",
            "Företagets egen dokumentationssida visar inga nya sidor från det här kontot den senaste månaden."
          ], { optional: true, tests: ["lo1"] })
        ],
        charts: [{
          id: "c1-uploads", type: "bar",
          title: L(["Uploads to personal cloud storage per day", "Uppladdningar till privat molnlagring per dag"]), unit: L(["GB", "GB"]),
          caption: L(["Days before the alert.", "Dagar före larmet."]),
          data: (ctx) => {
            const days = [-13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0];
            return { categories: days, categoryUnit: "days", series: [{ id: "gb", label: L(["Uploaded", "Uppladdat"]), values: days.map((d) => (d >= -2 ? Math.round(ctx.vars.gbUploaded / 3) : ctx.rng.chance(0.2) ? 1 : 0)) }] };
          }
        }],
        questions: {
          technical: [
            q("What can you check without monitoring the person — logs you already keep?", "Vad kan ni kontrollera utan att övervaka personen – loggar ni redan har?", ["socLead", "itOps"]),
            q("What does this account have access to, and what could it do in the remaining days?", "Vad har kontot åtkomst till, och vad kan det göra under de återstående dagarna?", ["itOps", "ciso"]),
            q("How do you preserve evidence without alerting anyone?", "Hur säkrar ni spår utan att varna någon?", ["socLead", "ciso"])
          ],
          executive: [
            q("Who needs to know now — and who must not know yet?", "Vem behöver veta nu – och vem får inte veta ännu?", ["ciso", "hr"]),
            q("What are the legal limits on investigating an employee?", "Vilka rättsliga gränser finns för att utreda en anställd?", ["legal", "dpo"]),
            q("Is there an innocent explanation you should rule out first?", "Finns det en oskyldig förklaring som ni bör utesluta först?", ["ciso", "hr"])
          ]
        },
        challenges: [ch("The administrator's manager vouches for them and asked for the handover.", "Administratörens chef går i god för hen och har själv begärt överlämningen.")],
        decision: dec("d1", "ciso", ["What do you do about the account today?", "Vad gör ni med kontot i dag?"], [
          ["Quietly restrict privileged rights and preserve evidence, without confronting anyone yet.", "Begränsa i tysthet de privilegierade rättigheterna och säkra spår, utan att konfrontera någon ännu."],
          ["Talk to the administrator now and ask for an explanation.", "Prata med administratören nu och be om en förklaring."],
          ["Treat it as handover work and keep an eye on it.", "Behandla det som överlämningsarbete och håll ett öga på det."]
        ], {
          knowns: [["Configuration exports went to personal storage.", "Konfigurationsexporter har gått till privat lagring."], ["A handover was requested by the manager.", "En överlämning har begärts av chefen."]],
          uncertainties: [["Why personal storage was used.", "Varför privat lagring användes."], ["Whether the person is acting alone.", "Om personen agerar ensam."]],
          tradeoffs: {
            operational: ["Restricting rights may disrupt the handover.", "Att begränsa rättigheterna kan störa överlämningen."],
            security: ["Waiting leaves powerful access in place.", "Att vänta lämnar kraftfull åtkomst kvar."],
            legal: ["Investigations of employees must be proportionate and documented.", "Utredningar av anställda måste vara proportionerliga och dokumenterade."],
            reputational: ["Accusing a respected colleague wrongly is costly.", "Att felaktigt anklaga en respekterad kollega kostar mycket."]
          },
          evaluation: [["Separates handover needs from personal storage", "Skiljer överlämningsbehov från privat lagring"], ["Involves HR and legal before investigative steps", "Involverar HR och juridik före utredningsåtgärder"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Rights pulled quietly", "Rättigheter dras in i tysthet"], [
              io(["The uploads stop", "Uppladdningarna upphör"], ["Since the rights were restricted, no new uploads have reached personal storage, and the logs from the last three days are safely copied. It looks as if you caught it in time.", "Sedan rättigheterna begränsades har inga nya uppladdningar gått till privat lagring, och loggarna från de senaste tre dagarna är säkert kopierade. Det ser ut som att ni hann i tid."], ["No new uploads since the restriction; recent logs are preserved.", "Inga nya uppladdningar sedan begränsningen; de senaste loggarna är säkrade."]),
              io(["HR was not asked", "HR tillfrågades inte"], ["The HR director hears from the administrator's manager that a fifteen-year employee lost their rights without HR being told. HR wants the rights restored until a proper process is agreed.", "HR-chefen får höra av administratörens chef att en medarbetare med femton år i företaget har förlorat sina rättigheter utan att HR har fått veta något. HR vill att rättigheterna återställs tills en ordentlig process är överenskommen."], ["HR objected that rights were cut without its involvement.", "HR invände mot att rättigheterna drogs in utan HR:s medverkan."], { reopen: true }),
              io(["Called in sick", "Sjukanmäld"], ["The next morning the administrator calls in sick. Nobody can tell whether they noticed the change, or whether it is a coincidence.", "Nästa morgon sjukanmäler sig administratören. Ingen kan avgöra om hen märkte förändringen, eller om det är en slump."], ["The administrator called in sick the day after the restriction.", "Administratören sjukanmälde sig dagen efter begränsningen."])
            ]),
            ir("i2", { notChosen: "A" }, ["Access stays in place", "Åtkomsten finns kvar"], [
              io(["The manager vouches", "Chefen går i god"], ["The manager sends a written statement: they asked for the exports and take full responsibility for the handover. It sounds settled. It says nothing about personal storage.", "Chefen skickar ett skriftligt intyg: hen bad om exporterna och tar fullt ansvar för överlämningen. Det låter avgjort. Det säger ingenting om privat lagring."], ["The manager vouched in writing for the exports, not for personal storage.", "Chefen gick skriftligt i god för exporterna, inte för den privata lagringen."]),
              io(["Logs about to roll over", "Loggarna skrivs snart över"], ["IT operations warns that the firewall logs covering the upload days roll over tonight, and the account can still clear them. Nobody has copied them.", "IT-driften varnar för att brandväggsloggarna från uppladdningsdagarna skrivs över i natt, och kontot kan fortfarande rensa dem. Ingen har kopierat dem."], ["Nobody had copied the firewall logs when the warning came.", "Ingen hade kopierat brandväggsloggarna när varningen kom."], { reopen: true }),
              io(["A thin handover", "En tunn överlämning"], ["The only handover document anyone can find is a two-page draft the administrator emailed last week, mostly copied from old documentation. It could be a start. It could be cover.", "Det enda överlämningsdokument som någon hittar är ett utkast på två sidor som administratören mejlade förra veckan, mest kopierat från gammal dokumentation. Det kan vara en början. Det kan vara en täckmantel."], ["The only handover document found is a thin two-page draft.", "Det enda överlämningsdokument som hittats är ett tunt utkast på två sidor."])
            ])
          ],
          pushback: {
            A: [
              pb(["They will notice", "Hen kommer att märka det"], ["Within the hour, a firewall change the administrator was making fails, and they message the service desk asking why their rights have gone. A fifteen-year veteran does not miss that. What does the service desk answer, and is “quietly” still possible?", "Inom en timme misslyckas en brandväggsändring som administratören höll på med, och hen skriver till servicedesken och frågar varför rättigheterna har försvunnit. Den som har femton år på företaget missar inte sådant. Vad svarar servicedesken, och går det fortfarande att göra det ”i tysthet”?"]),
              pb(["The manager's handover", "Chefens överlämning"], ["The administrator's manager is angry: the runbooks they asked for are now blocked, and the person who knows the firewalls leaves in {{num.daysLeft}} days. “If the handover fails, we are blind.” Do you give some rights back for the handover, and how do you limit them?", "Administratörens chef är arg: driftinstruktionerna hen själv bad om är nu blockerade, och den som kan brandväggarna slutar om {{num.daysLeft}} dagar. ”Om överlämningen misslyckas står vi utan kunskap.” Ger ni tillbaka en del rättigheter för överlämningen, och hur begränsar ni dem?"]),
              pb(["Rights you cannot see", "Rättigheter ni inte ser"], ["After fifteen years, much of this person's access lives outside the directory: local accounts on firewalls, shared emergency passwords they know by heart, admin consoles at customers. Removing group memberships touches none of it. Have you actually restricted anything that matters?", "Efter femton år finns mycket av personens åtkomst utanför katalogtjänsten: lokala konton i brandväggar, gemensamma nödlösenord som hen kan utantill, administrationskonsoler hos kunder. Att ta bort gruppmedlemskap rör inget av det. Har ni egentligen begränsat något som spelar roll?"])
            ],
            B: [
              pb(["A plausible answer", "Ett rimligt svar"], ["The administrator explains calmly: the company file share has a size limit, so they used personal storage to move the exports to a laptop at home to write the runbooks. It sounds reasonable and you cannot check it today. Do you accept it, and what would make you stop accepting it?", "Administratören förklarar lugnt: företagets filyta har en storleksgräns, så hen använde privat lagring för att flytta exporterna till en dator hemma och skriva driftinstruktionerna där. Det låter rimligt och ni kan inte kontrollera det i dag. Godtar ni det, och vad skulle få er att sluta godta det?"]),
              pb(["Nothing was preserved", "Inget säkrades"], ["You talked before securing anything. The firewall logs roll over within days, and the administrator still has the rights to clear them. If the explanation turns out to be false, what evidence will you have left?", "Ni pratade innan något var säkrat. Brandväggsloggarna skrivs över inom några dagar, och administratören har fortfarande rättigheter att rensa dem. Om förklaringen visar sig vara falsk – vilka spår har ni kvar då?"]),
              pb(["Treated like a thief", "Behandlad som en tjuv"], ["The manager hears about the conversation from the administrator, not from you. “Fifteen years, and you treat them like a thief in their last week.” The rest of the team is talking about it. How do you repair this if the alert turns out to be nothing, and what if it does not?", "Chefen får höra om samtalet från administratören, inte från er. ”Femton år, och ni behandlar hen som en tjuv sista veckan.” Resten av teamet pratar om det. Hur reparerar ni det här om larmet visar sig vara ingenting – och om det inte gör det?"])
            ],
            C: [
              pb(["Keep an eye how?", "Hålla ett öga hur?"], ["The data-loss alerts go to a shared mailbox that someone reads once a day, and nobody has been named to watch this account. The person leaves in {{num.daysLeft}} days. Who is actually watching, and what would make them act?", "Larmen från dataförlustskyddet går till en gemensam brevlåda som någon läser en gång om dagen, och ingen har utsetts att bevaka det här kontot. Personen slutar om {{num.daysLeft}} dagar. Vem bevakar egentligen, och vad skulle få hen att agera?"]),
              pb(["No runbooks have arrived", "Inga driftinstruktioner har kommit"], ["The manager checks and finds that none of the runbooks they asked for have been delivered, and the documentation site has no new pages from this account. The handover explanation rests on documents nobody has seen. Is it still a handover?", "Chefen kontrollerar och ser att inga av de driftinstruktioner hen bad om har levererats, och dokumentationssidan har inga nya sidor från kontot. Förklaringen om överlämning vilar på dokument som ingen har sett. Är det fortfarande en överlämning?"]),
              pb(["The SOC lead disagrees", "SOC-ansvarig håller inte med"], ["The SOC lead asks for it to be recorded that they advised against this: “A handover never needs personal cloud storage.” If something goes wrong, the note will be read first. Do you stand by the decision with that on file?", "SOC-ansvarig ber att det antecknas att hen avrådde: ”En överlämning kräver aldrig privat molnlagring.” Om något går fel är det anteckningen som läses först. Står ni fast vid beslutet med det i akten?"])
            ]
          }
        }),
        facilitator: fac(
          ["Genuinely ambiguous. Reward groups that keep two hypotheses open.", "Verkligt tvetydigt. Belöna grupper som håller två hypoteser öppna."],
          ["Proportionate first steps: restrict privileges quietly, preserve logs, involve HR and legal, no confrontation yet.", "Proportionerliga första steg: begränsa rättigheterna i tysthet, säkra loggar, involvera HR och juridik, ingen konfrontation ännu."],
          [["Ask: what would make you change your mind either way?", "Fråga: vad skulle få er att ändra uppfattning åt något håll?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 240,
        title: L(["Not so fast", "Inte så fort"]),
        twist: L(["HR and legal stop the investigation as planned: you need a documented, proportionate basis before looking further.", "HR och juridik stoppar utredningen i den planerade formen: ni behöver ett dokumenterat, proportionerligt underlag innan ni går vidare."]),
        twistKind: "authority",
        branches: [
          { when: { decision: "d1", option: "B" }, narrativeAppend: { en: "Because the administrator was asked for an explanation on the first day, they went home sick, and the exports stopped, for now.", sv: "Eftersom administratören ombads förklara sig redan första dagen gick hen hem sjuk, och exporterna upphörde, tills vidare." } }
        ],
        assumptionChallenged: L(["Security can investigate an employee freely when there is a risk.", "Säkerhetsfunktionen kan utreda en anställd fritt när det finns en risk."]),
        narrative: L([
          "{{time.T+240|clock}}. A meeting with HR, legal and the data protection officer turns tense.\n\nThe security team arrived with a plan to review the administrator's mailbox and browsing history. It is stopped at the door. Employees have rights too, even when they have access to everything, and the company has to be able to defend whatever it does next.",
          "Klockan {{time.T+240|clock}}. Ett möte med HR, juridik och dataskyddsombudet blir spänt.\n\nSäkerhetsteamet kom med en plan att gå igenom administratörens e-post och webbhistorik. Den stoppas redan vid dörren. Även anställda med åtkomst till allt har rättigheter, och företaget måste kunna försvara det som görs härnäst."
        ]),
        injects: [
          inj("i2-1", 240, "executiveMessage", "person.hr", "medium", "confirmed", [
            "“This person has fifteen years of good service. We will not have a fishing expedition. If you need to look further, write down why, what exactly, and why less intrusive steps are not enough.”",
            "”Den här personen har femton år av gott arbete bakom sig. Vi ska inte bedriva någon fiskeexpedition. Om ni behöver titta vidare – skriv ner varför, exakt vad och varför mindre ingripande steg inte räcker.”"
          ], { tests: ["lo2"] }),
          inj("i2-2", 260, "executiveMessage", "person.dpo", "medium", "confirmed", [
            "“Security logs we already keep for security purposes can be used. Reading private messages cannot, without a much stronger case.”",
            "”Säkerhetsloggar som vi redan sparar i säkerhetssyfte får användas. Att läsa privata meddelanden får inte göras utan betydligt starkare skäl.”"
          ], { fallbackRole: "legal", tests: ["lo1", "lo2"] }),
          inj("i2-3", 280, "employeeReport", "employee", "low", "unverified", [
            "A colleague mentions, unprompted, that the administrator has seemed frightened lately and has been taking calls outside.",
            "En kollega nämner på eget initiativ att administratören har verkat rädd på sistone och tagit samtal utomhus."
          ], { optional: true, tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("Which existing security logs answer the most important questions?", "Vilka befintliga säkerhetsloggar besvarar de viktigaste frågorna?", ["socLead", "itOps"]),
            q("How do you document each investigative step so it can be defended later?", "Hur dokumenterar ni varje utredningssteg så att det kan försvaras i efterhand?", ["socLead", "ciso"]),
            q("Do the access restrictions you chose still make sense under these limits?", "Är de åtkomstbegränsningar ni valde fortfarande rimliga med de här gränserna?", ["ciso", "itOps"], "d1")
          ],
          executive: [
            q("Who owns the decision to go further — security, HR or legal?", "Vem äger beslutet att gå vidare – säkerhet, HR eller juridik?", ["ceo", "hr"]),
            q("Does the employee's representative have to be involved, and when?", "Måste den anställdas fackliga företrädare involveras, och när?", ["hr", "legal"]),
            q("Looking at your first decision — would you have taken it if HR had been in the room?", "Om ni ser på ert första beslut – hade ni fattat det om HR hade suttit i rummet?", ["ciso", "hr"], "d1")
          ]
        },
        challenges: [ch("Security wants answers today; HR wants a defensible process.", "Säkerhetsfunktionen vill ha svar i dag; HR vill ha en process som håller.")],
        decision: dec("d2", "legal", ["On what basis do you continue?", "På vilket underlag fortsätter ni?"], [
          ["Use existing security logs only, under a written, proportionate investigation plan.", "Använd bara befintliga säkerhetsloggar, enligt en skriftlig och proportionerlig utredningsplan."],
          ["Ask the administrator for consent to review their activity.", "Be administratören om samtycke till att granska aktiviteten."],
          ["Pause the investigation until the employee has left.", "Pausa utredningen tills den anställda har slutat."]
        ], {
          knowns: [["Security logs may be used for security purposes.", "Säkerhetsloggar får användas i säkerhetssyfte."]],
          uncertainties: [["Whether the case will become a dismissal or a police matter.", "Om ärendet blir en uppsägningsfråga eller ett polisärende."]],
          tradeoffs: {
            operational: ["A careful process is slower.", "En noggrann process går långsammare."],
            security: ["Pausing leaves the question open while access remains.", "En paus lämnar frågan öppen medan åtkomsten finns kvar."],
            legal: ["Evidence gathered unlawfully may be useless and harmful.", "Spår som samlats in olagligt kan vara oanvändbara och skadliga."],
            reputational: ["Staff trust depends on fair processes.", "Personalens förtroende beror på rättvisa processer."]
          },
          evaluation: [["Writes down the purpose and limits of the investigation", "Skriver ner utredningens syfte och gränser"], ["Keeps security and HR aligned", "Håller säkerhet och HR samspelta"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["The plan is written", "Planen skrivs"], [
              io(["Signed by evening", "Underskriven till kvällen"], ["HR, legal and the data protection officer sign the plan by evening. The log review can start, and everyone agrees on what may and may not be looked at.", "HR, juridik och dataskyddsombudet skriver under planen till kvällen. Logggenomgången kan börja, och alla är överens om vad som får och inte får granskas."], ["A signed plan limits the review to existing security logs.", "En underskriven plan begränsar granskningen till befintliga säkerhetsloggar."]),
              io(["One signature missing", "En underskrift saknas"], ["The data protection officer refuses to sign: the draft quietly includes reading the content of the uploaded files, which goes beyond existing security logs. The plan must be rewritten before anything starts.", "Dataskyddsombudet vägrar skriva under: utkastet innehåller i det tysta att läsa innehållet i de uppladdade filerna, vilket går utöver befintliga säkerhetsloggar. Planen måste skrivas om innan något kan börja."], ["The data protection officer refused to sign the first draft of the plan.", "Dataskyddsombudet vägrade skriva under det första utkastet till planen."], { reopen: true }),
              io(["“Am I being investigated?”", "”Utreds jag?”"], ["The administrator asks HR directly whether they are under investigation. HR has not been told what it may say, and gives a non-answer that satisfies nobody.", "Administratören frågar HR rakt ut om hen är föremål för en utredning. HR har inte fått veta vad som får sägas och ger ett undanglidande svar som ingen blir nöjd med."], ["The administrator has asked HR whether they are under investigation.", "Administratören har frågat HR om hen utreds."])
            ]),
            ir("i2", { notChosen: "A" }, ["No written plan", "Ingen skriftlig plan"], [
              io(["The alerts go quiet", "Larmen tystnar"], ["No new data-loss alerts fire over the next day. Some in the room start to say the problem may have solved itself.", "Inga nya larm från dataförlustskyddet utlöses under det följande dygnet. Några i rummet börjar säga att problemet kanske har löst sig självt."], ["No new data-loss alerts fired over the following day.", "Inga nya larm från dataförlustskyddet utlöstes under det följande dygnet."]),
              io(["Legal draws a line", "Juristen sätter gränsen"], ["Legal reviews the steps taken so far and finds none of them documented. Without a written basis, anything found may be unusable, and the company exposed. Legal wants a different approach today.", "Juristen går igenom de steg som tagits hittills och finner att inget av dem är dokumenterat. Utan skriftligt underlag kan allt som hittas bli oanvändbart, och företaget utsatt. Juristen vill ha ett annat upplägg i dag."], ["Legal found the steps so far undocumented and possibly unusable.", "Juristen fann att stegen hittills var odokumenterade och kanske oanvändbara."], { reopen: true }),
              io(["Rumours in the team", "Rykten i teamet"], ["Word has got out that HR and security met about someone. A colleague messages the administrator to ask whether it is about them. Nobody knows what they answered.", "Det har läckt ut att HR och säkerhet har haft möte om någon. En kollega skriver till administratören och frågar om det gäller hen. Ingen vet vad hen svarade."], ["Rumours of an investigation are circulating in the team.", "Rykten om en utredning cirkulerar i teamet."])
            ])
          ],
          pushback: {
            A: [
              pb(["The logs stop short", "Loggarna räcker inte hela vägen"], ["Your security logs show file names and sizes, but not what is inside the files now sitting in personal storage. The most important question cannot be answered within the plan. Do you widen the plan, or accept not knowing what left?", "Era säkerhetsloggar visar filnamn och storlekar, men inte vad som finns i filerna som nu ligger i privat lagring. Den viktigaste frågan kan inte besvaras inom planen. Vidgar ni planen, eller accepterar ni att inte veta vad som har lämnat företaget?"]),
              pb(["The plan takes a day", "Planen tar en dag"], ["Writing a plan that HR, legal and the data protection officer all sign takes until tomorrow afternoon. Meanwhile the account keeps its access and the days left keep shrinking. Do you act before the plan is signed, or let the clock run?", "Att skriva en plan som HR, juridik och dataskyddsombudet alla skriver under tar till i morgon eftermiddag. Under tiden behåller kontot sin åtkomst och de återstående dagarna blir färre. Agerar ni innan planen är underskriven, eller låter ni klockan gå?"]),
              pb(["The representative asks", "Den fackliga företrädaren frågar"], ["The employee's union representative has heard that “something is going on” and asks to see any investigation plan concerning their member. Sharing it would tell the administrator everything. Do you show it, refuse, or delay, and can you defend that later?", "Den anställdas fackliga företrädare har hört att ”något pågår” och vill se eventuella utredningsplaner som rör medlemmen. Att visa den skulle berätta allt för administratören. Visar ni den, vägrar ni eller skjuter ni upp det – och kan ni försvara det i efterhand?"])
            ],
            B: [
              pb(["Consent from an employee", "Samtycke från en anställd"], ["The data protection officer warns that consent from an employee to their employer is rarely seen as freely given, especially in their last week. A court may treat it as worthless. Are you building the investigation on something that will not hold?", "Dataskyddsombudet varnar för att samtycke från en anställd till arbetsgivaren sällan ses som frivilligt, särskilt under den sista veckan. En domstol kan betrakta det som värdelöst. Bygger ni utredningen på något som inte håller?"]),
              pb(["They say no", "Hen säger nej"], ["The administrator politely declines, and asks what exactly they are suspected of. They now know there is an investigation, and you have no basis to continue without their consent. What is your next step?", "Administratören tackar artigt nej och frågar vad hen egentligen misstänks för. Nu vet hen att det pågår en utredning, och ni har inget underlag att fortsätta utan samtycke. Vad är ert nästa steg?"]),
              pb(["Yes, but tomorrow", "Ja, men i morgon"], ["The administrator agrees at once, but asks for a day first to “clear out some personal things” from the storage account. Refusing looks like an accusation; agreeing may mean you review an emptied account. Do you accept the condition?", "Administratören går med på det direkt, men ber om en dag först för att ”rensa bort lite privata saker” från lagringskontot. Att neka ser ut som en anklagelse; att gå med på det kan innebära att ni granskar ett tömt konto. Godtar ni villkoret?"])
            ],
            C: [
              pb(["Who owns the access?", "Vem äger åtkomsten?"], ["For {{num.daysLeft}} more days the account keeps the keys to firewalls, the directory and customer systems, and nobody is looking. If anything happens in that time, someone will ask who decided to stop. Whose name is on the pause?", "I ytterligare {{num.daysLeft}} dagar har kontot nycklarna till brandväggar, katalogtjänsten och kundsystem, och ingen tittar. Om något händer under den tiden kommer någon att fråga vem som beslutade att stoppa. Vems namn står på pausen?"]),
              pb(["Too late once they leave", "För sent när hen har slutat"], ["Once the employee has left, you cannot ask them anything, the personal storage is out of reach, and an exit interview is no longer possible. The pause gives away the only window you have. What do you hope to learn after the door has closed?", "När den anställda har slutat kan ni inte fråga hen något, den privata lagringen går inte att nå och något avgångssamtal blir inte av. Pausen ger bort det enda fönster ni har. Vad hoppas ni få veta när dörren redan har stängts?"]),
              pb(["A colleague is worried", "En kollega är orolig"], ["A colleague mentions that the administrator has seemed frightened lately and keeps taking calls outside. If something is wrong, a pause leaves them alone with it until they are gone. Does pausing protect the person, or only the process?", "En kollega nämner att administratören har verkat rädd på sistone och ofta tar samtal utomhus. Om något är fel lämnar en paus hen ensam med det tills hen har slutat. Skyddar pausen personen, eller bara processen?"])
            ]
          }
        }),
        facilitator: fac(
          ["Many technical teams find this stage frustrating. That frustration is the learning point.", "Många tekniska team tycker att det här skedet är frustrerande. Den frustrationen är själva lärdomen."],
          ["A written investigation plan using existing security logs, with HR, legal and the DPO agreed.", "En skriftlig utredningsplan som bygger på befintliga säkerhetsloggar, med HR, juridik och dataskyddsombudet överens."],
          [["Ask: if this ends in court, which of your steps would you want to explain?", "Fråga: om det här hamnar i domstol, vilka av era steg vill ni då behöva förklara?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 2880,
        title: L(["Someone else at the keyboard", "Någon annan vid tangentbordet"]),
        twist: L(["The account was active while the administrator was on sick leave at home — from another country.", "Kontot var aktivt medan administratören var sjukskriven hemma – från ett annat land."]),
        twistKind: "scope",
        reconsider: { decision: "d1", pressure: { en: "Someone else was at the keyboard, from another country. If you restricted rights quietly, the account still worked for them. If you talked to the administrator, whoever is behind this may now know you are looking.", sv: "Någon annan satt vid tangentbordet, från ett annat land. Om ni begränsade rättigheterna i tysthet fungerade kontot ändå för dem. Om ni pratade med administratören kan den som ligger bakom nu veta att ni letar." } },
        assumptionChallenged: L(["Everything was done by the employee personally.", "Allt gjordes av den anställda personligen."]),
        reveals: ["hf-leave"],
        narrative: L([
          "Two days later, {{time.T+2880|clock}}. The log review agreed under the plan is done, limited to the security logs the company already keeps.\n\nThe VPN records do not fit the story anyone has been telling, neither the “innocent handover” nor the “disloyal employee”. The account was used in a way the administrator could not have used it.",
          "Två dagar senare, klockan {{time.T+2880|clock}}. Logggenomgången enligt planen är klar, begränsad till de säkerhetsloggar som företaget redan sparar.\n\nVPN-loggarna stämmer inte med den bild som någon hittills har haft, varken ”den oskyldiga överlämningen” eller ”den illojala medarbetaren”. Kontot användes på ett sätt som administratören inte kan ha använt det."
        ]),
        injects: [
          inj("i3-1", 2880, "authLog", "siem", "high", "confirmed", [
            "Ten days ago the administrator's VPN token was used from {{asset.attackerIp}} abroad on four evenings. HR records show the administrator was on sick leave at home those days. The sessions ran administrative tools on {{asset.domainController}}.",
            "För tio dagar sedan användes administratörens VPN-token från {{asset.attackerIp}} i utlandet under fyra kvällar. Enligt HR var administratören sjukskriven hemma de dagarna. Sessionerna körde administrativa verktyg på {{asset.domainController}}."
          ], { headline: ["Sign-ins from abroad during sick leave", "Inloggningar från utlandet under sjukskrivning"], reveals: ["hf-leave"], tests: ["lo1", "lo3"] }),
          inj("i3-2", 2900, "chat", "person.socLead", "medium", "confirmed", [
            "“Either the token was stolen, or the administrator lent it to someone. Neither explanation is good.”",
            "”Antingen har token stulits, eller så har administratören lånat ut den till någon. Ingen av förklaringarna är bra.”"
          ], { fallbackRole: "ciso", tests: ["lo1"] })
        ],
        charts: [{
          id: "c3-signins", type: "bar",
          title: L(["VPN sign-ins by location", "VPN-inloggningar per plats"]), unit: L(["sessions", "sessioner"]),
          caption: L(["Days before today. Shaded days are sick leave.", "Dagar före i dag. Under de markerade dagarna var administratören sjukskriven."]),
          data: (ctx) => {
            const days = [-14, -13, -12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1];
            const leave = (d) => d >= -12 && d <= -9;
            return {
              categories: days, categoryUnit: "days",
              series: [
                { id: "office", label: L(["Home country", "Hemlandet"]), values: days.map((d) => (leave(d) ? 0 : 2 + ctx.rng.int(0, 2))) },
                { id: "abroad", label: L(["Abroad", "Utlandet"]), values: days.map((d) => (leave(d) ? 1 + ctx.rng.int(0, 1) : 0)) }
              ]
            };
          }
        }],
        questions: {
          technical: [
            q("What did those sessions do on the domain controller?", "Vad gjorde sessionerna på domänkontrollanten?", ["socLead", "itOps"]),
            q("Is the token still valid, and what else can it reach?", "Är token fortfarande giltig, och vad mer kan den nå?", ["itOps", "ciso"]),
            q("Was restricting privileges enough, now that someone else holds the token?", "Räckte det att begränsa rättigheterna, nu när någon annan har token?", ["ciso"], "d1")
          ],
          executive: [
            q("Does this change the case from an HR matter to a security incident?", "Ändrar det här ärendet från en HR-fråga till en säkerhetsincident?", ["ceo", "ciso"]),
            q("Who talks to the administrator now, and how?", "Vem pratar med administratören nu, och hur?", ["hr", "securityOfficer"]),
            q("Does the investigation basis you agreed still cover what you need?", "Täcker det utredningsunderlag ni kom överens om fortfarande det ni behöver?", ["legal", "hr"], "d2")
          ]
        },
        challenges: [ch("Disabling the token now ends any chance of quietly learning more.", "Att spärra token nu gör slut på alla möjligheter att i tysthet ta reda på mer.")],
        decision: dec("d3", "ciso", ["What do you do with the token and the account?", "Vad gör ni med token och kontot?"], [
          ["Revoke the token and account now, and invite the administrator to a meeting with HR and security.", "Spärra token och kontot nu och kalla administratören till ett möte med HR och säkerhet."],
          ["Revoke the token, keep the account, and watch for further attempts.", "Spärra token, behåll kontot och bevaka nya försök."],
          ["Leave everything as is and gather more evidence.", "Låt allt vara som det är och samla mer underlag."]
        ], {
          knowns: [["Someone used the token from abroad during sick leave.", "Någon använde token från utlandet under sjukskrivningen."]],
          uncertainties: [["Whether the administrator is a willing participant.", "Om administratören deltar frivilligt."]],
          tradeoffs: {
            operational: ["Removing the account ends the handover.", "Att ta bort kontot avslutar överlämningen."],
            security: ["Any delay keeps a foreign party inside.", "Varje fördröjning håller kvar en utomstående part i miljön."],
            legal: ["The meeting must respect employment rights.", "Mötet måste respektera arbetsrättsliga regler."],
            reputational: ["A badly handled confrontation harms trust with all staff.", "En illa hanterad konfrontation skadar förtroendet hos all personal."]
          },
          evaluation: [["Treats the token as compromised immediately", "Behandlar token som komprometterad direkt"], ["Plans the conversation with care for the person", "Planerar samtalet med omsorg om personen"]],
          interrupts: [
            ir("i1", { chosen: "C" }, ["The token stays live", "Token förblir aktiv"], [
              io(["A quiet night", "En lugn natt"], ["The first evening passes without any session from abroad. The log team uses the time to build a cleaner timeline, and the room feels patience was the wise choice.", "Den första kvällen går utan någon session från utlandet. Loggteamet använder tiden till att bygga en tydligare tidslinje, och rummet känner att tålamodet var ett klokt val."], ["No session from abroad appeared on the first evening.", "Ingen session från utlandet dök upp den första kvällen."]),
              io(["Watching it happen", "Att se det hända"], ["That evening a session from abroad opens on the token and starts running administrative tools on {{asset.domainController}}. The SOC is watching live, and nobody has said who may pull the plug.", "Samma kväll öppnas en session från utlandet med token och börjar köra administrativa verktyg på {{asset.domainController}}. SOC tittar i realtid, och ingen har sagt vem som får dra ur sladden."], ["A new session from abroad used the token while the SOC watched.", "En ny session från utlandet använde token medan SOC tittade på."], { reopen: true }),
              io(["In and out", "In och ut"], ["A session from abroad connects for two minutes and disconnects without doing anything visible. It might be a routine check by whoever holds the token, or a sign they suspect something.", "En session från utlandet ansluter i två minuter och kopplar ner utan att göra något synligt. Det kan vara en rutinkontroll av den som har token, eller ett tecken på att de misstänker något."], ["A brief session from abroad connected and left without visible action.", "En kort session från utlandet anslöt och försvann utan synlig åtgärd."])
            ]),
            ir("i2", { notChosen: "C" }, ["Token revoked", "Token spärras"], [
              io(["The door is shut", "Dörren är stängd"], ["Since the revocation, the token has not been tried again. Several in the room start talking about closing the incident.", "Sedan spärren har token inte prövats igen. Flera i rummet börjar prata om att avsluta incidenten."], ["The revoked token has not been tried again.", "Den spärrade token har inte prövats igen."]),
              io(["They know", "De vet"], ["Within the hour, the revoked token is tried from abroad six times in a row. Whoever holds it now knows it has stopped working, and that someone has noticed.", "Inom en timme prövas den spärrade token från utlandet sex gånger i rad. Den som har den vet nu att den har slutat fungera, och att någon har märkt något."], ["Someone abroad tried the revoked token and knows it stopped working.", "Någon i utlandet prövade den spärrade token och vet att den slutat fungera."], { reopen: true }),
              io(["A call from home", "Ett samtal hemifrån"], ["The administrator calls the service desk from home asking why their VPN has stopped working. The service desk has no script, and promises that someone will call back.", "Administratören ringer servicedesken hemifrån och frågar varför VPN:en har slutat fungera. Servicedesken har inget manus och lovar att någon ska ringa tillbaka."], ["The administrator has asked why their VPN stopped working.", "Administratören har frågat varför VPN:en slutat fungera."])
            ])
          ],
          pushback: {
            A: [
              pb(["Tonight's change cannot happen", "Kvällens ändring blir inte av"], ["A planned firewall change for a customer tonight depended on this administrator's account. Operations says nobody else knows the setup well enough to do it. Do you postpone and explain to the customer, or give someone else rights they have never used?", "En planerad brandväggsändring för en kund i kväll byggde på administratörens konto. Driften säger att ingen annan kan uppsättningen tillräckligt väl. Skjuter ni upp den och förklarar för kunden, eller ger ni någon annan rättigheter hen aldrig har använt?"]),
              pb(["The invitation reads like a charge", "Kallelsen låter som en anklagelse"], ["The administrator, still on sick leave, replies to the meeting invitation asking whether they need a lawyer. HR says the wording made it sound like a disciplinary hearing. Do you rewrite it, and what do you want this meeting to be?", "Administratören, fortfarande sjukskriven, svarar på kallelsen och frågar om hen behöver ett juridiskt ombud. HR säger att formuleringen fick det att låta som ett disciplinärende. Skriver ni om den, och vad vill ni att mötet ska vara?"]),
              pb(["Four evenings unexplained", "Fyra kvällar utan förklaring"], ["Revoking the token stops new sessions. It does not undo anything those four evenings did on the domain controller, and nobody has checked that yet. Leadership already treats the matter as closed. How do you keep the room from relaxing too early?", "Att spärra token stoppar nya sessioner. Det gör inte ogjort det som de fyra kvällarna gjorde på domänkontrollanten, och ingen har kontrollerat det än. Ledningen behandlar redan ärendet som avslutat. Hur hindrar ni rummet från att slappna av för tidigt?"])
            ],
            B: [
              pb(["The account still works", "Kontot fungerar fortfarande"], ["Without the token, the account can still sign in from the office network and to admin consoles that are not behind the VPN. Whoever used the token may also know the password. Is keeping the account really keeping it under watch, or keeping a door open?", "Utan token kan kontot fortfarande logga in från kontorsnätet och i administrationskonsoler som inte ligger bakom VPN:en. Den som använde token kan också känna till lösenordet. Är det verkligen bevakning att behålla kontot, eller att hålla en dörr öppen?"]),
              pb(["Who watches at night?", "Vem bevakar på natten?"], ["The sessions from abroad all happened in the evenings. Your SOC is staffed during office hours, and alerts after that wait until morning. Watching for further attempts means someone awake at night. Who, and from when?", "Sessionerna från utlandet skedde alla på kvällarna. Er SOC är bemannad under kontorstid, och larm därefter väntar till morgonen. Att bevaka nya försök kräver någon som är vaken på natten. Vem, och från när?"]),
              pb(["“My VPN stopped working”", "”Min VPN har slutat fungera”"], ["The administrator calls the service desk from sick leave: the token no longer works, and they ask why. The service desk asks you what to say. What is the answer, and does it reveal what you know?", "Administratören ringer servicedesken under sjukskrivningen: token fungerar inte längre, och hen frågar varför. Servicedesken frågar er vad de ska säga. Vad är svaret, och avslöjar det vad ni vet?"])
            ],
            C: [
              pb(["What is the trigger?", "Vad är utlösaren?"], ["The foreign sessions came in the evenings, and it is late afternoon now. If another one starts tonight, you will be watching someone abroad work as an administrator on your domain controller. At what point do you pull the plug, and who is allowed to?", "Sessionerna från utlandet kom på kvällarna, och nu är det sen eftermiddag. Om en ny startar i kväll ser ni någon i utlandet arbeta som administratör på er domänkontrollant. Vid vilken punkt drar ni ur sladden, och vem får göra det?"]),
              pb(["Knowingly left open", "Medvetet lämnad öppen"], ["Legal warns that once you know a foreign party is using a privileged token, leaving it active makes the company answerable for whatever happens next, including in systems you run for customers. Is more evidence worth that liability?", "Juristen varnar för att när ni vet att en utomstående part använder en privilegierad token blir företaget ansvarigt för det som händer härnäst om den lämnas aktiv, även i system som ni driver åt kunder. Är mer underlag värt det ansvaret?"]),
              pb(["Not in the plan", "Inte i planen"], ["The agreed plan covers reviewing existing security logs. Watching live sessions to gather more evidence is new monitoring, and HR reminds you it was not part of what was agreed. Do you go back to HR and legal first, while the token stays active?", "Den överenskomna planen omfattar granskning av befintliga säkerhetsloggar. Att följa sessioner i realtid för att samla mer underlag är ny övervakning, och HR påminner om att det inte ingick i överenskommelsen. Går ni tillbaka till HR och juridik först, medan token fortfarande är aktiv?"])
            ]
          }
        }),
        facilitator: fac(
          ["The story stops being simple. Some groups now harden towards the employee; plant the seed of an alternative.", "Historien slutar vara enkel. En del grupper hårdnar nu mot den anställda; så fröet till en annan förklaring."],
          ["Token revoked at once, and a carefully planned conversation with HR present.", "Token spärrad direkt och ett noga planerat samtal med HR närvarande."],
          [["Ask: what would make someone hand over their token?", "Fråga: vad skulle få någon att lämna över sin token?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 3000,
        title: L(["“They know where my children go to school”", "”De vet vilken skola mina barn går i”"]),
        twist: L(["The administrator was coerced. This is extortion of an employee, not disloyalty.", "Administratören har utsatts för påtryckningar. Det här är utpressning av en anställd, inte illojalitet."]),
        twistKind: "cause",
        branches: [
          { when: { decision: "d3", option: "A" }, narrativeAppend: { en: "Because the account and token were revoked, the extortionists sent the administrator a new message: they know you know.", sv: "Eftersom kontot och token återkallades skickade utpressarna ett nytt meddelande till administratören: de vet att ni vet." } }
        ],
        assumptionChallenged: L(["This is a disloyal employee stealing data on the way out.", "Det här är en illojal anställd som stjäl data på vägen ut."]),
        reveals: ["hf-coerced"],
        narrative: L([
          "{{time.T+3000|clock}}. A meeting with the administrator is planned for the afternoon, with HR present.\n\nBefore it starts, the administrator asks to speak to {{person.securityOfficer.name}} alone, in a room without windows. They look as if they have not slept, and they ask whether the conversation can stay confidential.",
          "Klockan {{time.T+3000|clock}}. Ett möte med administratören är planerat till eftermiddagen, med HR närvarande.\n\nInnan det börjar ber administratören om att få prata ensam med {{person.securityOfficer.name}}, i ett rum utan fönster. Hen ser ut som om hen inte har sovit, och frågar om samtalet kan förbli konfidentiellt."
        ]),
        injects: [
          inj("i4-1", 3000, "phoneTranscript", "person.securityOfficer", "high", "confirmed", [
            "Notes from the conversation: six weeks ago the administrator was contacted by people who knew their address and their children's school. They demanded the VPN token, then specific exports and “a few accounts”. The resignation was an attempt to get away from it.",
            "Anteckningar från samtalet: för sex veckor sedan kontaktades administratören av personer som kände till hens adress och barnens skola. De krävde VPN-token, sedan särskilda exporter och ”några konton”. Uppsägningen var ett försök att komma undan."
          ], { headline: ["Disclosure under threat", "Berättelse under hot"], fallbackRole: "hr", reveals: ["hf-coerced"], tests: ["lo4"] }),
          inj("i4-2", 3030, "executiveMessage", "person.legal", "medium", "confirmed", [
            "“This is a serious crime against our employee. The employee needs protection, and the police must be involved — but the employee's safety comes first in how we do it.”",
            "”Det här är ett allvarligt brott mot vår medarbetare. Medarbetaren behöver skydd, och polisen måste involveras – men medarbetarens säkerhet går först i hur vi gör det.”"
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("What did the group ask for — and what does that tell you about their goal?", "Vad bad gruppen om – och vad säger det om deras mål?", ["socLead", "ciso"]),
            q("Which “few accounts” might exist, and how do you find them?", "Vilka ”några konton” kan finnas, och hur hittar ni dem?", ["itOps", "socLead"]),
            q("Was revoking the token the right first step, knowing this?", "Var det rätt första steg att spärra token, med den här vetskapen?", ["ciso"], "d3")
          ],
          executive: [
            q("How do you protect the employee and their family?", "Hur skyddar ni medarbetaren och familjen?", ["hr", "securityOfficer"]),
            q("Does this change how you see the employee's responsibility?", "Ändrar det här hur ni ser på medarbetarens ansvar?", ["hr", "legal"]),
            q("What would you do differently in the meeting you planned?", "Vad skulle ni göra annorlunda på mötet ni planerade?", ["hr"], "d3")
          ]
        },
        challenges: [ch("The employee broke security rules — and is also the victim of a crime.", "Medarbetaren har brutit mot säkerhetsregler – och är samtidigt utsatt för ett brott.")],
        decision: dec("d4", "ceo", ["How do you treat the employee?", "Hur behandlar ni medarbetaren?"], [
          ["As a victim first: protection, support, police contact; the employment question later.", "Som ett brottsoffer i första hand: skydd, stöd och polisanmälan; anställningsfrågan senare."],
          ["Protection and support, but terminate employment for the rule breaches.", "Skydd och stöd, men avsluta anställningen för regelbrotten."],
          ["Report to the police and let them handle the employee.", "Polisanmäl och låt polisen hantera medarbetaren."]
        ], {
          knowns: [["The employee was threatened for six weeks.", "Medarbetaren har hotats i sex veckor."]],
          uncertainties: [["Whether the threats are ongoing.", "Om hoten fortfarande pågår."]],
          tradeoffs: {
            operational: ["Support takes management time.", "Stöd tar ledningens tid."],
            security: ["Others facing threats need to see that coming forward is safe.", "Andra som utsätts för hot behöver se att det är tryggt att berätta."],
            legal: ["Employment and criminal processes must not collide.", "Arbetsrättsliga och straffrättsliga processer får inte krocka."],
            reputational: ["Staff will remember how the organisation treated a colleague under threat.", "Personalen kommer att minnas hur organisationen behandlade en hotad kollega."]
          },
          evaluation: [["Puts safety of people before process", "Sätter människors säkerhet före processen"], ["Makes it safe for others to report coercion", "Gör det tryggt för andra att berätta om påtryckningar"]],
          minutes: 10,
          interrupts: [
            ir("i1", { chosen: "A" }, ["Treated as a victim", "Behandlad som brottsoffer"], [
              io(["They start talking", "Hen börjar berätta"], ["Visibly relieved, the administrator agrees to go through what they handed over, step by step, with {{person.securityOfficer.name}}. It is slow, but it is the first account anyone has had from the inside.", "Synbart lättad går administratören med på att gå igenom vad hen lämnade ut, steg för steg, med {{person.securityOfficer.name}}. Det går långsamt, men det är den första berättelsen inifrån som någon har fått."], ["The administrator is cooperating and going through what was handed over.", "Administratören samarbetar och går igenom vad som lämnades ut."]),
              io(["A board member objects", "En styrelseledamot invänder"], ["A board member hears the plan and calls it rewarding a security breach. The board member demands disciplinary action now, and wants the CEO to explain the decision to the board.", "En styrelseledamot hör om planen och kallar det att belöna ett säkerhetsbrott. Ledamoten kräver disciplinåtgärder nu och vill att vd förklarar beslutet för styrelsen."], ["A board member has demanded disciplinary action against the administrator.", "En styrelseledamot har krävt disciplinåtgärder mot administratören."], { reopen: true }),
              io(["Gaps in the story", "Luckor i berättelsen"], ["Some details of the administrator's account do not match the times in the logs. It could be fear and exhaustion, or something they are still holding back.", "En del detaljer i administratörens berättelse stämmer inte med tiderna i loggarna. Det kan bero på rädsla och utmattning, eller på något som hen fortfarande håller inne med."], ["Parts of the administrator's account do not yet match the logs.", "Delar av administratörens berättelse stämmer ännu inte med loggarna."])
            ]),
            ir("i2", { notChosen: "A" }, ["Not a victim first", "Inte offer i första hand"], [
              io(["A clear signal", "En tydlig signal"], ["Several managers say the decision shows that rules apply to everyone, whatever the reason. The security team feels backed.", "Flera chefer säger att beslutet visar att reglerna gäller alla, oavsett skäl. Säkerhetsteamet känner sig uppbackat."], ["Some managers see the decision as proof that rules apply to all.", "En del chefer ser beslutet som ett bevis på att reglerna gäller alla."]),
              io(["They stop talking", "Hen slutar prata"], ["On legal advice, the administrator stops answering questions about what they handed over. The person who knew most about what was done is now silent.", "På inrådan av sitt ombud slutar administratören svara på frågor om vad hen lämnade ut. Den som visste mest om vad som gjordes är nu tyst."], ["The administrator has stopped cooperating, on legal advice, for now.", "Administratören har slutat samarbeta, på inrådan av ombud, tills vidare."], { reopen: true }),
              io(["The union calls", "Facket ringer"], ["The administrator's union asks for a meeting this week. The representative will not say whether they intend to challenge anything, only that they have questions.", "Administratörens fack begär ett möte i veckan. Företrädaren vill inte säga om facket tänker ifrågasätta något, bara att det finns frågor."], ["The administrator's union has asked for a meeting.", "Administratörens fack har begärt ett möte."])
            ])
          ],
          pushback: {
            A: [
              pb(["“So rules don't matter?”", "”Så reglerna spelar ingen roll?”"], ["Word spreads in the team. An administrator asks their manager whether breaking security rules is fine as long as you say you were threatened afterwards. How do you protect the victim without sending that message to everyone else?", "Ryktet sprids i teamet. En administratör frågar sin chef om det är okej att bryta mot säkerhetsregler så länge man säger efteråt att man var hotad. Hur skyddar ni offret utan att skicka det budskapet till alla andra?"]),
              pb(["Which “few accounts”?", "Vilka ”några konton”?"], ["You need to know exactly what was handed over and created, but the administrator is exhausted and frightened, and keeps saying they cannot remember. Pressing a crime victim for details feels wrong; not knowing is dangerous. How hard do you push, and who does it?", "Ni behöver veta exakt vad som lämnades ut och skapades, men administratören är utmattad och rädd och säger gång på gång att hen inte minns. Att pressa ett brottsoffer på detaljer känns fel; att inte veta är farligt. Hur hårt trycker ni på, och vem gör det?"]),
              pb(["Still on the payroll", "Fortfarande anställd"], ["With the employment question deferred, the administrator is still employed for {{num.daysLeft}} days, and the group knows where they live. If the group demands more, will they be able to refuse? Do they keep any access at all, and who tells them?", "Med anställningsfrågan uppskjuten är administratören fortfarande anställd i {{num.daysLeft}} dagar, och gruppen vet var hen bor. Om gruppen kräver mer, kommer hen att kunna säga nej? Behåller hen någon åtkomst alls, och vem säger det till hen?"])
            ],
            B: [
              pb(["What others will learn", "Vad andra kommer att lära sig"], ["HR warns that whatever the reasons, staff will hear one thing: the person who came forward about threats lost their job. Anyone else in the same position will now stay silent. Is that a price you are willing to pay?", "HR varnar för att personalen, oavsett skälen, kommer att höra en sak: den som berättade om hoten förlorade jobbet. Den som hamnar i samma läge kommer nu att tiga. Är det ett pris ni är beredda att betala?"]),
              pb(["Acts under duress", "Handlingar under tvång"], ["Legal doubts that a dismissal for acts done under threats to the family will hold, and the employee's union has already asked for a meeting. A lost dispute would be public. Do you still terminate now, or wait until you know more?", "Juristen tvivlar på att en uppsägning för handlingar som utförts under hot mot familjen håller, och den anställdas fack har redan begärt ett möte. En förlorad tvist blir offentlig. Avslutar ni ändå anställningen nu, eller väntar ni tills ni vet mer?"]),
              pb(["The help stops", "Hjälpen upphör"], ["Told that their employment will end, the administrator stops cooperating and will no longer go through what they gave the group. They were your best source on what was done. Was the termination worth losing that?", "När administratören får veta att anställningen ska avslutas slutar hen samarbeta och vill inte längre gå igenom vad hen lämnade till gruppen. Hen var er bästa källa till vad som har gjorts. Var uppsägningen värd att förlora det?"])
            ],
            C: [
              pb(["A suspect, not a victim", "Misstänkt, inte offer"], ["Handed over without the company's support, the administrator is treated by the police first as a suspect. Their lawyer advises them to say nothing to anyone, including you. How will you now find out what was done in your systems?", "Utan företagets stöd behandlas administratören av polisen först som misstänkt. Ombudet råder hen att inte säga något till någon, inte heller till er. Hur ska ni nu få veta vad som gjorts i era system?"]),
              pb(["The family tonight", "Familjen i kväll"], ["The police say a protection assessment for the family will take a few days. The administrator asks you what the company will do tonight, when the people who know their children's school are still out there. Is “the police handle it” your answer?", "Polisen säger att en skyddsbedömning för familjen tar några dagar. Administratören frågar er vad företaget gör i kväll, när de som vet vilken skola barnen går i fortfarande finns där ute. Är ”polisen sköter det” ert svar?"]),
              pb(["Your systems are not their job", "Era system är inte deras uppgift"], ["The police investigate the crime, not your network. They will not tell you what the group was given or what is still open. Leaving the employee to them leaves your own questions unanswered. Who in the company asks them now?", "Polisen utreder brottet, inte ert nätverk. De kommer inte att berätta vad gruppen fick eller vad som fortfarande står öppet. Att lämna medarbetaren till dem lämnar era egna frågor obesvarade. Vem i företaget ställer dem nu?"])
            ]
          }
        }),
        facilitator: fac(
          ["A tonal shift. Give the room time; the right answer is humane and firm at once.", "Ett tonläge som skiftar. Ge gruppen tid; rätt svar är både mänskligt och bestämt."],
          ["Protection and support for the employee, a police report, and the employment question deferred.", "Skydd och stöd för medarbetaren, en polisanmälan och anställningsfrågan skjuten på framtiden."],
          [["Ask: what would make the next threatened colleague come forward earlier?", "Fråga: vad skulle få nästa hotade kollega att berätta tidigare?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 3120,
        title: L(["The accounts nobody owns", "Kontona som ingen äger"]),
        twist: L(["Disabling one account was not enough: there are {{num.backdoors}} backdoor service accounts.", "Det räckte inte att spärra ett konto: det finns {{num.backdoors}} tjänstekonton som bakdörrar."]),
        twistKind: "scope",
        reconsider: { decision: "d3", pressure: { en: "Whatever you did with that one account and token, there are {{num.backdoors}} more backdoor accounts. Does your call still stand?", sv: "Vad ni än gjorde med det enda kontot och dess token finns det {{num.backdoors}} bakdörrskonton till. Står ert beslut sig?" } },
        assumptionChallenged: L(["Disabling the employee's account removes the attacker's access.", "Att spärra medarbetarens konto tar bort angriparens åtkomst."]),
        reveals: ["hf-backdoors"],
        narrative: L([
          "{{time.T+3120|clock}}. The administrator's account and token have been dealt with. But the security team is not satisfied that the problem ends there.\n\nA search of the privileged groups for recently created accounts returns names that look like ordinary integrations: monitoring, backup, synchronisation. Nobody can say who asked for them.",
          "Klockan {{time.T+3120|clock}}. Administratörens konto och token är omhändertagna. Men säkerhetsteamet är inte övertygat om att problemet slutar där.\n\nEn sökning i de privilegierade grupperna efter nyligen skapade konton ger träffar med namn som ser ut som vanliga integrationer: övervakning, säkerhetskopiering, synkronisering. Ingen kan säga vem som beställde dem."
        ]),
        injects: [
          inj("i5-1", 3120, "forensicFinding", "forensics", "critical", "confirmed", [
            "{{num.backdoors}} service accounts created five to six weeks ago, named like monitoring and backup integrations, all members of the administrators group. Two signed in from {{asset.attackerIp2}} this week.",
            "{{num.backdoors}} tjänstekonton skapade för fem till sex veckor sedan, namngivna som övervaknings- och backupintegrationer, alla medlemmar i administratörsgruppen. Två loggade in från {{asset.attackerIp2}} i veckan."
          ], { headline: ["Backdoor service accounts", "Tjänstekonton som bakdörrar"], reveals: ["hf-backdoors"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c5-kpi", type: "kpi",
          title: L(["Privileged access found", "Upptäckt privilegierad åtkomst"]),
          data: kpi([
            { id: "backdoors", label: ["Backdoor service accounts", "Tjänstekonton som bakdörrar"], value: (v) => v.backdoors, tone: "danger" },
            { id: "active", label: ["Used this week", "Använda i veckan"], value: 2, tone: "danger" },
            { id: "files", label: ["Files exported", "Exporterade filer"], value: (v) => v.files, tone: "warn" }
          ])
        }],
        questions: {
          technical: [
            q("How do you remove the backdoors without the attacker noticing and reacting first?", "Hur tar ni bort bakdörrarna utan att angriparen hinner märka det och reagera?", ["itOps", "socLead"]),
            q("Which credentials must be rotated because these accounts could read them?", "Vilka inloggningsuppgifter måste bytas eftersom de här kontona kunde läsa dem?", ["itOps", "ciso"]),
            q("Would you still have revoked the token the way you did?", "Skulle ni fortfarande ha spärrat token på det sätt ni gjorde?", ["ciso"], "d3")
          ],
          executive: [
            q("How do you explain to the board that the problem is larger than one person?", "Hur förklarar ni för styrelsen att problemet är större än en person?", ["ceo", "ciso"]),
            q("Who verifies that no other backdoors remain?", "Vem kontrollerar att inga andra bakdörrar finns kvar?", ["cio", "ciso"]),
            q("Does this change how you treat the employee?", "Ändrar det här hur ni behandlar medarbetaren?", ["hr", "ceo"], "d4")
          ]
        },
        challenges: [ch("Two of the backdoors were used this week — the attacker is still active.", "Två av bakdörrarna användes i veckan – angriparen är fortfarande aktiv.")],
        decision: dec("d5", "cio", ["How do you clean up privileged access?", "Hur städar ni upp den privilegierade åtkomsten?"], [
          ["Disable all backdoors at once, rotate privileged credentials and review every admin account.", "Spärra alla bakdörrar på en gång, byt privilegierade inloggningsuppgifter och granska alla administratörskonton."],
          ["Disable the two active accounts now, the rest after investigation.", "Spärra de två aktiva kontona nu och resten efter utredning."],
          ["Leave them active, monitored, to identify the group.", "Låt dem vara aktiva och bevakade för att kunna identifiera gruppen."]
        ], {
          knowns: [["{{num.backdoors}} accounts have administrator rights.", "{{num.backdoors}} konton har administratörsrättigheter."]],
          uncertainties: [["What the accounts have already done.", "Vad kontona redan har gjort."]],
          tradeoffs: {
            operational: ["Mass credential rotation breaks integrations.", "Massbyte av inloggningsuppgifter slår ut integrationer."],
            security: ["Partial removal warns the attacker and leaves doors open.", "Delvis borttagning varnar angriparen och lämnar dörrar öppna."],
            legal: ["Keeping access open as bait needs police coordination.", "Att hålla åtkomsten öppen som lockbete kräver samordning med polisen."],
            reputational: ["Customers will ask whether their data was reachable.", "Kunderna kommer att fråga om deras data gick att nå."]
          },
          evaluation: [["Removes all persistence in one coordinated action", "Tar bort all persistens i en samordnad åtgärd"], ["Rotates credentials the backdoors could reach", "Byter inloggningsuppgifter som bakdörrarna kunde nå"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["One coordinated sweep", "En samordnad städning"], [
              io(["A clean sweep", "Rent hus"], ["Every backdoor account is disabled within minutes and the privileged credentials are changed. No new sign-ins appear anywhere. The CIO tells leadership the door is closed.", "Alla bakdörrskonton spärras inom några minuter och de privilegierade inloggningsuppgifterna byts. Inga nya inloggningar syns någonstans. It-chefen meddelar ledningen att dörren är stängd."], ["All known backdoor accounts were disabled in one action.", "Alla kända bakdörrskonton spärrades i en enda åtgärd."]),
              io(["Backups stop", "Säkerhetskopieringen stannar"], ["The rotation breaks real integrations too: tonight's backups fail and the directory sync stops. Operations wants to roll part of it back before morning.", "Bytet slår ut riktiga integrationer också: nattens säkerhetskopiering misslyckas och synkroniseringen av katalogen stannar. Driften vill rulla tillbaka en del innan morgonen."], ["The mass rotation broke backups and directory sync for a night.", "Massbytet slog ut säkerhetskopiering och katalogsynk under en natt."], { reopen: true }),
              io(["One more try", "Ett försök till"], ["An hour after the sweep, one of the disabled accounts is tried once from an address you have not seen before. Then nothing.", "En timme efter städningen prövas ett av de spärrade kontona en gång från en adress som ni inte har sett tidigare. Sedan ingenting."], ["A disabled backdoor account was tried once from a new address.", "Ett spärrat bakdörrskonto prövades en gång från en ny adress."])
            ]),
            ir("i2", { notChosen: "A" }, ["Some doors still open", "Några dörrar står öppna"], [
              io(["A quiet night", "En lugn natt"], ["Overnight, monitoring shows no sign-ins from {{asset.attackerIp2}} and nothing else unusual. The cautious approach seems to be working.", "Under natten visar bevakningen inga inloggningar från {{asset.attackerIp2}} och inget annat ovanligt. Det försiktiga upplägget verkar fungera."], ["No sign-ins from the known attacker address overnight.", "Inga inloggningar från angriparens kända adress under natten."]),
              io(["Logging switched off", "Loggningen stängs av"], ["Overnight, an account with administrator rights changes the audit policy on a server and part of the logging stops. Nobody can yet say which account did it.", "Under natten ändrar ett konto med administratörsrättigheter granskningsinställningarna på en server, och en del av loggningen upphör. Ingen kan ännu säga vilket konto som gjorde det."], ["Part of the audit logging was switched off by an admin account.", "En del av granskningsloggningen stängdes av av ett administratörskonto."], { reopen: true }),
              io(["An unknown address", "En okänd adress"], ["A privileged account signs in from an address nobody recognises. It might be a contractor's new connection. Nobody can confirm it before morning.", "Ett privilegierat konto loggar in från en adress som ingen känner igen. Det kan vara en konsults nya uppkoppling. Ingen kan bekräfta det före morgonen."], ["An unrecognised address signed in to a privileged account.", "En okänd adress loggade in på ett privilegierat konto."])
            ])
          ],
          pushback: {
            A: [
              pb(["Backups stop tonight", "Säkerhetskopieringen stannar i natt"], ["Rotating every privileged credential at once breaks real integrations as well: tonight's backups, the monitoring agents and the directory sync all fail. Operations wants a staged rotation. Do you accept a night without backups to close everything at once?", "Att byta alla privilegierade inloggningsuppgifter på en gång slår också ut riktiga integrationer: nattens säkerhetskopiering, övervakningsagenterna och synkroniseringen av katalogen fallerar. Driften vill byta i etapper. Accepterar ni en natt utan säkerhetskopior för att stänga allt på en gång?"]),
              pb(["“All” is a promise", "”Alla” är ett löfte"], ["Reviewing every admin account will take days, and until it is done nobody can say the list is complete. Management wants to tell the board it is cleaned up. What do you allow them to say, and on what basis?", "Att granska alla administratörskonton tar flera dagar, och tills det är gjort kan ingen säga att listan är komplett. Ledningen vill meddela styrelsen att allt är städat. Vad låter ni dem säga, och på vilket underlag?"]),
              pb(["No rollback", "Ingen återgång"], ["The CIO's change team objects: one large change across the whole environment, without testing, breaks every change rule you have. If something critical stops, there is no plan to roll back. Do you override your own change process tonight?", "Förändringsteamet under it-chefen invänder: en enda stor ändring i hela miljön, utan test, bryter mot alla förändringsregler ni har. Om något kritiskt stannar finns ingen plan för att återgå. Kör ni över er egen förändringsprocess i kväll?"])
            ],
            B: [
              pb(["The rest are warned", "Resten är varnade"], ["The two active accounts stop working within minutes of each other. Anyone watching from outside now knows you have found them, and still holds the others. Do you close the rest tonight after all, before the investigation is done?", "De två aktiva kontona slutar fungera inom några minuter från varandra. Den som tittar utifrån vet nu att ni har hittat dem, och har fortfarande de andra. Stänger ni resten i natt ändå, innan utredningen är klar?"]),
              pb(["Inactive is not unused", "Inaktiv är inte oanvänd"], ["Your sign-in logs only go back a few weeks, about as long as the accounts have existed. “Not used this week” says nothing about what they did before, or what they can still do. Are the remaining accounts really less dangerous?", "Era inloggningsloggar sträcker sig bara några veckor bakåt, ungefär lika länge som kontona har funnits. ”Inte använda i veckan” säger inget om vad de gjorde innan, eller vad de fortfarande kan göra. Är de återstående kontona verkligen mindre farliga?"]),
              pb(["Explaining open doors", "Att förklara öppna dörrar"], ["The CIO must tell the board that known backdoor accounts with administrator rights are being left active on purpose while the investigation continues. A board member asks who accepted that risk and for how long. What is the answer?", "It-chefen måste berätta för styrelsen att kända bakdörrskonton med administratörsrättigheter medvetet lämnas aktiva medan utredningen pågår. En ledamot frågar vem som accepterade risken och hur länge. Vad är svaret?"])
            ],
            C: [
              pb(["They can switch off the camera", "De kan stänga av kameran"], ["These are administrator accounts. Anyone using them can change logging, add new accounts or disable the very alerts you are relying on. Monitoring something that can blind your monitoring: how sure are you that you will see the next step?", "Det här är administratörskonton. Den som använder dem kan ändra loggningen, lägga till nya konton eller stänga av just de larm ni förlitar er på. Att bevaka något som kan göra er bevakning blind – hur säkra är ni på att ni ser nästa steg?"]),
              pb(["Round the clock, for how long?", "Dygnet runt, hur länge?"], ["The SOC lead says watching these accounts properly means people awake all night, every night, pulled away from cleaning up. Nobody has said for how long. How long can you carry this, and what ends it?", "SOC-ansvarig säger att en ordentlig bevakning av kontona kräver folk som är vakna varje natt, och som då inte kan arbeta med städningen. Ingen har sagt hur länge. Hur länge orkar ni bära det här, och vad avslutar det?"]),
              pb(["Knowingly left in place", "Medvetet kvarlämnade"], ["Legal points out that if any of these accounts is used to cause harm, the company knowingly left administrator access in criminal hands. Your insurer will ask the same question. Who signs that risk acceptance, in writing?", "Juristen påpekar att om något av kontona används för att orsaka skada har företaget medvetet lämnat administratörsåtkomst i kriminella händer. Försäkringsbolaget kommer att ställa samma fråga. Vem skriver under den riskacceptansen?"])
            ]
          }
        }),
        facilitator: fac(
          ["Shift from people to persistence. A good place for the technical team to lead.", "Skifta fokus från människor till persistens. Ett bra tillfälle för det tekniska teamet att leda."],
          ["Coordinated removal of every backdoor, privileged credential rotation and a full admin-account review.", "Samordnad borttagning av alla bakdörrar, byte av privilegierade inloggningsuppgifter och en fullständig granskning av administratörskontona."],
          [["Ask: how would you know if a sixth account exists?", "Fråga: hur skulle ni veta om ett sjätte konto finns?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 4320,
        title: L(["The police have a request", "Polisen har en begäran"]),
        twist: L(["The police ask you to keep one backdoor open so they can trace the group.", "Polisen ber er hålla en bakdörr öppen så att de kan spåra gruppen."]),
        twistKind: "authority",
        branches: [
          { when: { decision: "d5", option: "A" }, narrativeAppend: { en: "Because every backdoor was disabled at once, the police say the group went silent, and their trace has gone cold.", sv: "Eftersom alla bakdörrar stängdes på en gång säger polisen att gruppen har tystnat, och deras spår har kallnat." } }
        ],
        assumptionChallenged: L(["We decide when to close the door on the attacker.", "Vi bestämmer när vi stänger dörren för angriparen."]),
        narrative: L([
          "Three days after the first alert. {{reg.police|cap}} has taken the case seriously: threats against an employee's family are a serious crime, and the same group may be behind other cases.\n\nThe investigators have a request, and it makes the security team uncomfortable. Saying yes could help catch the group. Saying no keeps your network simpler to defend.",
          "Tre dagar efter det första larmet. {{reg.police|cap}} tar ärendet på stort allvar: hot mot en anställds familj är ett allvarligt brott, och samma grupp kan ligga bakom andra fall.\n\nUtredarna har en begäran, och den gör säkerhetsteamet obekvämt. Att säga ja kan hjälpa till att gripa gruppen. Att säga nej gör ert nätverk enklare att försvara."
        ]),
        injects: [
          inj("i6-1", 4320, "phoneTranscript", "police", "high", "confirmed", [
            "“This group has threatened employees at several companies. If you can keep one of their accounts reachable for a week, under our guidance, we have a real chance of identifying them.”",
            "”Den här gruppen har hotat anställda på flera företag. Om ni kan hålla ett av deras konton åtkomligt i en vecka, enligt våra anvisningar, har vi en verklig chans att identifiera dem.”"
          ], { pressure: "lawEnforcement", substitute: { source: "irRetainer", content: ["{{supplier.irRetainer}}: “The group has hit other companies. Keeping a monitored decoy account for a week could help identify them — but it is your risk to carry.”", "{{supplier.irRetainer}}: ”Gruppen har slagit till mot andra företag. Att ha ett bevakat lockbeteskonto i en vecka kan hjälpa till att identifiera dem – men det är er risk att bära.”"] }, tests: ["lo3"] }),
          inj("i6-2", 4350, "executiveMessage", "person.ciso", "medium", "confirmed", [
            "“If we do this, it must be a single account with no real rights, in an isolated segment, watched around the clock — not a real backdoor.”",
            "”Om vi gör det här måste det vara ett enda konto utan verkliga rättigheter, i ett isolerat segment och bevakat dygnet runt – inte en verklig bakdörr.”"
          ], { tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Can you offer a decoy without leaving real access open?", "Kan ni erbjuda ett lockbete utan att lämna verklig åtkomst öppen?", ["itOps", "socLead"]),
            q("How would you detect the attacker moving beyond the decoy?", "Hur skulle ni upptäcka att angriparen tar sig vidare från lockbetet?", ["socLead"]),
            q("Does your backdoor clean-up need to change to make room for this?", "Behöver städningen av bakdörrarna ändras för att ge utrymme åt det här?", ["cio"], "d5")
          ],
          executive: [
            q("Who can accept the risk of keeping a door open — and in writing?", "Vem kan acceptera risken att hålla en dörr öppen – och skriftligt?", ["ceo", "legal"]),
            q("How does this affect the employee who is still under threat?", "Hur påverkar det här medarbetaren som fortfarande är hotad?", ["hr", "securityOfficer"]),
            q("Does helping the police fit with how you chose to treat the employee?", "Går det att förena att hjälpa polisen med hur ni valde att behandla medarbetaren?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("Helping the investigation means accepting some risk for a week.", "Att hjälpa utredningen innebär att acceptera en viss risk i en vecka.")],
        decision: dec("d6", "ceo", ["Do you keep a door open for the investigation?", "Håller ni en dörr öppen för utredningen?"], [
          ["Yes, as an isolated decoy with no real rights, under written terms and constant monitoring.", "Ja, som ett isolerat lockbete utan verkliga rättigheter, med skriftliga villkor och ständig bevakning."],
          ["No — close everything; the organisation's risk comes first.", "Nej – stäng allt; organisationens risk går först."],
          ["Yes, keep one real backdoor open as requested.", "Ja, håll en verklig bakdörr öppen enligt begäran."]
        ], {
          knowns: [["The group has targeted other companies.", "Gruppen har riktat in sig på andra företag."]],
          uncertainties: [["Whether the group will notice a decoy.", "Om gruppen kommer att märka ett lockbete."]],
          tradeoffs: {
            operational: ["Running a decoy needs round-the-clock attention.", "Ett lockbete kräver bevakning dygnet runt."],
            security: ["Any real access left open is a real risk.", "All verklig åtkomst som lämnas öppen är en verklig risk."],
            legal: ["Cooperation must be documented with clear responsibilities.", "Samarbetet måste dokumenteras med tydliga ansvarsgränser."],
            reputational: ["Helping catch the group protects others — and your staff.", "Att hjälpa till att gripa gruppen skyddar andra – och er personal."]
          },
          evaluation: [["Separates investigative help from real exposure", "Skiljer hjälp till utredningen från verklig exponering"], ["Documents who accepted which risk", "Dokumenterar vem som accepterade vilken risk"]],
          interrupts: [
            ir("i1", { chosen: "B" }, ["Every door closed", "Alla dörrar stängda"], [
              io(["Nothing more", "Inget mer"], ["The following days bring no sign of the group anywhere in the network. The clean-up finishes ahead of plan, and the team gets its first full night's sleep.", "De följande dagarna syns inga spår av gruppen någonstans i nätverket. Städningen blir klar före plan, och teamet får sin första hela natts sömn."], ["The clean-up finished with no further sign of the group.", "Städningen avslutades utan fler spår av gruppen."]),
              io(["Another family threatened", "Ännu en familj hotad"], ["The investigators call back: an employee at another company was threatened by the same group this week. They ask you formally, in writing, to reconsider.", "Utredarna ringer tillbaka: en anställd på ett annat företag hotades av samma grupp i veckan. De ber er formellt, skriftligt, att ompröva beslutet."], ["Investigators report another company's employee was threatened this week.", "Utredarna uppger att en anställd på ett annat företag hotades i veckan."], { reopen: true }),
              io(["“Will they come back?”", "”Kommer de tillbaka?”"], ["The administrator asks whether closing everything will make the group give up, or make them angry. Nobody in the room can honestly answer.", "Administratören frågar om gruppen ger upp när allt stängs, eller om den blir arg. Ingen i rummet kan svara ärligt."], ["The administrator fears closing everything may provoke the group.", "Administratören är rädd att det kan provocera gruppen när allt stängs."])
            ]),
            ir("i2", { notChosen: "B" }, ["A door kept open", "En dörr hålls öppen"], [
              io(["A liaison assigned", "En kontaktperson utses"], ["The investigators thank you and assign a liaison to work with your SOC. They say this is exactly the kind of help they needed.", "Utredarna tackar och utser en kontaktperson som ska arbeta med er SOC. De säger att det är precis den sortens hjälp de behövde."], ["A liaison from the investigators now works with your SOC.", "En kontaktperson från utredarna arbetar nu med er SOC."]),
              io(["Beyond the agreed scope", "Utanför det överenskomna"], ["On the second night, the open account tries to reach systems outside what was agreed. The investigators ask you to let it run a little longer.", "Den andra natten försöker det öppna kontot nå system utanför det som avtalats. Utredarna ber er låta det pågå lite till."], ["The open account tried to reach systems outside the agreed scope.", "Det öppna kontot försökte nå system utanför det avtalade."], { reopen: true }),
              io(["Silence", "Tystnad"], ["Two days pass with no activity on the open account at all. The investigators cannot say whether the group has noticed something, or is simply waiting.", "Två dagar går utan någon aktivitet alls på det öppna kontot. Utredarna kan inte säga om gruppen har märkt något, eller bara väntar."], ["The open account saw no activity in its first two days.", "Det öppna kontot hade ingen aktivitet de första två dagarna."])
            ])
          ],
          pushback: {
            A: [
              pb(["A decoy looks like a decoy", "Ett lockbete ser ut som ett lockbete"], ["The group used accounts with real administrator rights. An account that suddenly cannot do anything may tell them they have been found, and they know where your employee lives. If the decoy is spotted, who feels it first?", "Gruppen använde konton med verkliga administratörsrättigheter. Ett konto som plötsligt inte kan göra något kan avslöja att de har upptäckts, och de vet var er medarbetare bor. Om lockbetet genomskådas – vem drabbas först?"]),
              pb(["Not enough for the police", "Inte tillräckligt för polisen"], ["The investigators say an empty decoy may not hold the group's interest long enough to trace them. They ask for “something that looks real”. Each step towards realism is a step towards a real backdoor. Where do you draw the line, and in writing?", "Utredarna säger att ett tomt lockbete kanske inte håller kvar gruppens intresse tillräckligt länge för att spåra dem. De ber om ”något som ser äkta ut”. Varje steg mot det äkta är ett steg mot en verklig bakdörr. Var drar ni gränsen, och skriftligt?"]),
              pb(["A week of night shifts", "En vecka med nattpass"], ["The SOC lead points out that constant monitoring for a week means pulling people off the clean-up and putting them on night shifts. The team is already tired. What gets dropped to make room for the decoy?", "SOC-ansvarig påpekar att ständig bevakning i en vecka innebär att folk tas bort från städningen och sätts på nattpass. Teamet är redan trött. Vad prioriteras bort för att ge plats åt lockbetet?"])
            ],
            B: [
              pb(["Other companies' staff", "Andra företags personal"], ["The investigators say this was their best chance: the group has threatened employees at several companies, and without your help the trace may end here. Your refusal protects your network. Does it leave other people's families exposed?", "Utredarna säger att detta var deras bästa chans: gruppen har hotat anställda på flera företag, och utan er hjälp kan spåret ta slut här. Ert nej skyddar ert nätverk. Lämnar det andra människors familjer utsatta?"]),
              pb(["Closing does not end the threat", "Att stänga avslutar inte hotet"], ["Closing every door protects your systems, but the people who threatened your administrator's family are still unidentified. The employee asks whether anything is being done to find them. What do you answer?", "Att stänga alla dörrar skyddar era system, men de som hotade administratörens familj är fortfarande oidentifierade. Medarbetaren frågar om något görs för att hitta dem. Vad svarar ni?"]),
              pb(["“Everything” you know of", "”Allt” som ni känner till"], ["“Close everything” only covers the doors you have found. If the group still has a way in that nobody has discovered, you have given up the investigators' eyes on them for nothing. How sure are you that everything is everything?", "”Stäng allt” omfattar bara de dörrar ni har hittat. Om gruppen har en väg in som ingen har upptäckt, har ni avstått från utredarnas insyn helt i onödan. Hur säkra är ni på att allt verkligen är allt?"])
            ],
            C: [
              pb(["The CISO said no", "Säkerhetschefen sa nej"], ["The CISO said clearly that it must not be a real backdoor, and now asks for the decision to be recorded with the name of whoever overruled that advice. The police will not take responsibility for your network. Whose name goes on it?", "Säkerhetschefen sa tydligt att det inte får vara en verklig bakdörr, och ber nu att beslutet antecknas med namnet på den som gick emot rådet. Polisen tar inget ansvar för ert nätverk. Vems namn står där?"]),
              pb(["Admin rights create more", "Adminrättigheter skapar fler"], ["A real backdoor with administrator rights can create new accounts. If the group makes another one during the week, you are back where you started, with one more door you may not see. How will you know, and what then?", "En verklig bakdörr med administratörsrättigheter kan skapa nya konton. Om gruppen skapar ett till under veckan är ni tillbaka där ni började, med ännu en dörr som ni kanske inte ser. Hur får ni veta det, och vad gör ni då?"]),
              pb(["The employee finds out", "Medarbetaren får veta"], ["The administrator learns that the door they were forced to open is being kept open, by your choice. “They know where my children go to school.” How do you explain that decision to someone whose family was threatened over that same access?", "Administratören får veta att dörren hen tvingades öppna hålls öppen, genom ert val. ”De vet vilken skola mina barn går i.” Hur förklarar ni det beslutet för någon vars familj hotades för just den åtkomsten?"])
            ]
          }
        }),
        facilitator: fac(
          ["Authority is shared with an outside body. Look for creative, bounded answers.", "Mandatet delas med en extern part. Se efter kreativa men avgränsade svar."],
          ["A bounded decoy agreed in writing, with every real backdoor removed.", "Ett avgränsat lockbete som avtalats skriftligt, med alla verkliga bakdörrar borttagna."],
          [["Ask: what is the worst thing that could happen during that week?", "Fråga: vad är det värsta som kan hända under den veckan?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 5760,
        title: L(["Customer configurations", "Kundkonfigurationer"]),
        twist: L(["The exports included configuration data for {{num.customersAffected}} customers' systems.", "Exporterna innehöll konfigurationsdata för {{num.customersAffected}} kunders system."]),
        twistKind: "impact",
        assumptionChallenged: L(["Only our internal data was taken.", "Bara vår interna data har tagits."]),
        narrative: L([
          "{{time.T+5760|clock}}. The forensic review of the uploaded files is complete. Until now the room has focused on the company's own systems.\n\nThe file list tells a different story about who is affected. Some of the files concern systems you run on behalf of others, and those others do not yet know anything has happened.",
          "Klockan {{time.T+5760|clock}}. Den forensiska genomgången av de uppladdade filerna är klar. Hittills har rummet fokuserat på företagets egna system.\n\nFillistan berättar något annat om vilka som berörs. En del av filerna rör system som ni driver åt andra, och de andra vet ännu inte att något har hänt."
        ]),
        injects: [
          inj("i7-1", 5760, "forensicFinding", "forensics", "high", "confirmed", [
            "Among the {{num.files}} exported files are firewall and remote-access configurations for systems you operate for {{num.customersAffected}} customers, including some stored administrator passwords.",
            "Bland de {{num.files}} exporterade filerna finns brandväggs- och fjärråtkomstkonfigurationer för system som ni driver åt {{num.customersAffected}} kunder, däribland några sparade administratörslösenord."
          ], { tests: ["lo3"] }),
          inj("i7-2", 5790, "email", "customer", "medium", "confirmed", [
            "A large customer's security manager: “We heard rumours that you have had an insider incident. Is anything of ours involved?”",
            "Säkerhetschefen hos en stor kund: ”Vi har hört rykten om att ni har haft en insiderincident. Berörs något av vårt?”"
          ], { optional: true, pressure: "customers", tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("Which customer credentials must be changed, and who does it?", "Vilka kundinloggningar måste bytas, och vem gör det?", ["itOps", "ciso"]),
            q("How do you help customers check for misuse?", "Hur hjälper ni kunderna att kontrollera om något har missbrukats?", ["socLead", "ciso"]),
            q("Does the decoy arrangement still make sense with customer data at stake?", "Är lockbetet fortfarande rimligt när kunddata står på spel?", ["ciso"], "d6")
          ],
          executive: [
            q("How and when do you tell affected customers?", "Hur och när berättar ni för de berörda kunderna?", ["ceo", "legal"]),
            q("What can you say without endangering the employee or the police case?", "Vad kan ni säga utan att utsätta medarbetaren eller polisutredningen för fara?", ["legal", "securityOfficer"]),
            q("Would you still make the same choice about the police request?", "Skulle ni fortfarande göra samma val om polisens begäran?", ["ceo"], "d6")
          ]
        },
        challenges: [ch("Telling customers may alert the group and endanger the employee.", "Att informera kunderna kan varna gruppen och utsätta medarbetaren för fara.")],
        decision: dec("d7", "ceo", ["How do you inform the affected customers?", "Hur informerar ni de berörda kunderna?"], [
          ["Tell each affected customer now, in confidence, and rotate their credentials with them.", "Informera varje berörd kund nu, i förtroende, och byt deras inloggningsuppgifter tillsammans med dem."],
          ["Rotate customer credentials first and inform customers after the police operation.", "Byt kundernas inloggningsuppgifter först och informera kunderna efter polisinsatsen."],
          ["Inform only customers with stored passwords in the files.", "Informera bara de kunder vars lösenord fanns i filerna."]
        ], {
          knowns: [["Customer configurations with some passwords were exported.", "Kundkonfigurationer med vissa lösenord har exporterats."]],
          uncertainties: [["Whether any customer has been attacked yet.", "Om någon kund redan har angripits."]],
          tradeoffs: {
            operational: ["Coordinated rotation with customers takes days.", "Samordnade byten med kunderna tar dagar."],
            security: ["Customers cannot defend themselves without knowing.", "Kunderna kan inte skydda sig utan att veta."],
            legal: ["Contracts may require prompt notification.", "Avtal kan kräva snabb underrättelse."],
            reputational: ["Customers forgive incidents more readily than silence.", "Kunder förlåter incidenter lättare än tystnad."]
          },
          evaluation: [["Puts customers in a position to protect themselves", "Ger kunderna möjlighet att skydda sig"], ["Balances disclosure against people's safety", "Väger öppenhet mot människors säkerhet"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Customers told now", "Kunderna informeras nu"], [
              io(["Thanks for calling", "Tack för samtalet"], ["Most customers thank you for the call and start changing credentials with your team. The large customer's security manager says they will remember who told them first.", "De flesta kunder tackar för samtalet och börjar byta inloggningsuppgifter tillsammans med ert team. Säkerhetschefen hos den stora kunden säger att de kommer att minnas vem som berättade först."], ["Most informed customers welcomed being told early.", "De flesta informerade kunder uppskattade att få veta tidigt."], { meters: { trust: 1 } }),
              io(["It leaks", "Det läcker"], ["Within a day, someone at one customer's supplier posts about “an insider case” in an industry chat group. The investigators worry it will reach the group, and the employee asks what it means for the family.", "Inom ett dygn skriver någon hos en kunds leverantör om ”ett insiderärende” i en chattgrupp för branschen. Utredarna oroar sig för att det når gruppen, och medarbetaren frågar vad det innebär för familjen."], ["News of the incident has leaked into an industry chat group.", "Nyheten om incidenten har läckt ut i en chattgrupp för branschen."], { reopen: true, meters: { media: 1 } }),
              io(["A failed login", "En misslyckad inloggning"], ["One customer checks its firewall and finds a failed administrator login from last week. It may be linked to the exports, or it may be the usual background noise.", "En kund kontrollerar sin brandvägg och hittar en misslyckad administratörsinloggning från förra veckan. Den kan ha samband med exporterna, eller vara det vanliga bakgrundsbruset."], ["One customer found an unexplained failed login on its firewall.", "En kund hittade en oförklarad misslyckad inloggning i sin brandvägg."])
            ]),
            ir("i2", { notChosen: "A" }, ["Customers not told yet", "Kunderna vet inte än"], [
              io(["Quiet rotation", "Tysta byten"], ["The credential changes are going smoothly, and no uninformed customer has asked why. The plan seems to be holding.", "Bytena av inloggningsuppgifter går smidigt, och ingen oinformerad kund har frågat varför. Planen verkar hålla."], ["Rotation is under way and no uninformed customer has asked why.", "Bytena pågår och ingen oinformerad kund har frågat varför."]),
              io(["A formal question", "En formell fråga"], ["The large customer's security manager asks again, now in writing, with their own CEO copied and the contract's notification clause quoted.", "Säkerhetschefen hos den stora kunden frågar igen, nu skriftligt, med sin egen vd på kopia och avtalets klausul om underrättelse citerad."], ["A large customer has formally asked whether its data is involved.", "En stor kund har formellt frågat om dess data berörs."], { reopen: true, meters: { trust: -1 } }),
              io(["Odd attempts elsewhere", "Märkliga försök hos en kund"], ["A customer you have not informed reports odd remote-access attempts and asks whether you know anything. It may be unrelated.", "En kund som ni inte har informerat rapporterar märkliga försök till fjärråtkomst och frågar om ni vet något. Det kan sakna samband."], ["An uninformed customer reported odd remote-access attempts.", "En oinformerad kund rapporterade märkliga försök till fjärråtkomst."])
            ])
          ],
          pushback: {
            A: [
              pb(["Confidence does not hold", "Förtroendet håller inte"], ["{{num.customersAffected}} customers, each with their own staff and suppliers, now know in confidence. Within a day the rumour is out, and the police worry that it reaches the group before their investigation is done. Do you slow down the remaining notifications?", "{{num.customersAffected}} kunder, var och en med egen personal och egna leverantörer, vet nu i förtroende. Inom ett dygn är ryktet ute, och polisen oroar sig för att det når gruppen innan utredningen är klar. Bromsar ni de återstående underrättelserna?"]),
              pb(["Everyone wants it tonight", "Alla vill ha det i kväll"], ["Each customer, once told, wants their credentials changed today. Your operations team can do a handful per day properly. Do you prioritise, and how do you tell the rest that they must wait with known exposed passwords?", "Varje kund som får veta vill att inloggningsuppgifterna byts i dag. Er driftorganisation hinner göra ett fåtal per dag ordentligt. Prioriterar ni, och hur säger ni till resten att de måste vänta med kända exponerade lösenord?"]),
              pb(["“How did this happen?”", "”Hur kunde det här hända?”"], ["The first customer asks the obvious question: how did their configurations leave your company? The honest answer involves an employee under threat and an open police case. What can you say that is true, without endangering either?", "Den första kunden ställer den självklara frågan: hur kunde deras konfigurationer lämna ert företag? Det ärliga svaret rymmer en hotad medarbetare och en pågående polisutredning. Vad kan ni säga som är sant, utan att utsätta någon av dem för fara?"])
            ],
            B: [
              pb(["“Why are you changing this?”", "”Varför byter ni det här?”"], ["A customer's security manager notices their firewall passwords changing without warning and asks why. Answering truthfully breaks the plan; a vague answer is a lie they will remember. What do you tell them?", "Säkerhetschefen hos en kund ser att brandväggslösenorden byts utan förvarning och frågar varför. Ett ärligt svar bryter planen; ett vagt svar är en lögn som de kommer att minnas. Vad säger ni?"]),
              pb(["The contracts say “promptly”", "Avtalen säger ”skyndsamt”"], ["Legal finds that several customer contracts require prompt notification of any incident involving their data. Waiting for the police operation could breach them, with penalties. Is a police request enough to justify that, and have you got it in writing?", "Juristen ser att flera kundavtal kräver skyndsam underrättelse om varje incident som rör deras data. Att vänta på polisinsatsen kan bryta mot dem, med vite. Räcker en begäran från polisen för att motivera det, och har ni den skriftligt?"]),
              pb(["A map, not just passwords", "En karta, inte bara lösenord"], ["The exported files describe how each customer's firewall and remote access are built. New passwords do not change what the group has learned about getting in. Without being told, customers cannot close those other gaps. Is rotation alone really protection?", "De exporterade filerna beskriver hur varje kunds brandvägg och fjärråtkomst är uppbyggd. Nya lösenord ändrar inte det gruppen har lärt sig om hur man tar sig in. Utan att få veta kan kunderna inte täppa till de andra luckorna. Är lösenordsbyten verkligen ett tillräckligt skydd?"])
            ],
            C: [
              pb(["Configurations are a map", "Konfigurationer är en karta"], ["The customers without stored passwords in the files still had their firewall and remote-access designs exported. That is a guide to getting in. Leaving them uninformed means they cannot defend themselves. Is “no password, no notice” a line you can defend?", "Kunderna utan sparade lösenord i filerna har ändå fått sina brandväggs- och fjärråtkomstupplägg exporterade. Det är en vägledning för att ta sig in. Att lämna dem ovetande innebär att de inte kan skydda sig. Är ”inget lösenord, ingen underrättelse” en gräns ni kan försvara?"]),
              pb(["The customer who asked", "Kunden som frågade"], ["The large customer whose security manager asked about rumours is not on your list: no passwords in their files, only configurations. They asked you directly. Do you tell them “nothing of yours is involved”?", "Den stora kunden vars säkerhetschef frågade om ryktena finns inte på er lista: inga lösenord i deras filer, bara konfigurationer. De frågade er rakt ut. Säger ni ”inget av ert berörs”?"]),
              pb(["Sorting takes days", "Sorteringen tar dagar"], ["Finding which of the {{num.files}} files contain stored passwords is manual work, and the first pass already found passwords in places nobody expected. Until it is done, you do not know who is on your list. Do you notify while the list is still changing?", "Att ta reda på vilka av de {{num.files}} filerna som innehåller sparade lösenord är manuellt arbete, och första genomgången har redan hittat lösenord där ingen väntade sig det. Tills det är klart vet ni inte vilka som står på listan. Underrättar ni medan listan fortfarande ändras?"])
            ]
          }
        }),
        facilitator: fac(
          ["Competing duties: customers, the employee, the police case. There is no clean answer — look for reasoning.", "Konkurrerande skyldigheter: kunderna, medarbetaren, polisutredningen. Det finns inget enkelt svar – se efter resonemanget."],
          ["Confidential, prompt notice to affected customers and joint credential rotation, coordinated with the police.", "Snabb och konfidentiell information till berörda kunder och gemensamma byten av inloggningsuppgifter, samordnat med polisen."],
          [["Ask: what would you expect if you were the customer?", "Fråga: vad skulle ni förvänta er om ni var kunden?"]]
        )
      },
      {
        id: "p8",
        priority: 4,
        clock: 10080,
        title: L(["Not the only one", "Inte den enda"]),
        twist: L(["Two other administrators say the same people approached them.", "Två andra administratörer berättar att samma personer har kontaktat dem."]),
        twistKind: "scope",
        reconsider: { decision: "d4", pressure: { en: "Two more administrators were approached by the same people. How you treated the first one is now what they expect for themselves.", sv: "Ytterligare två administratörer har kontaktats av samma personer. Hur ni behandlade den första är nu vad de förväntar sig för egen del." } },
        assumptionChallenged: L(["This was an isolated case.", "Det här var ett enstaka fall."]),
        reveals: ["hf-approach"],
        narrative: L([
          "A week later. Management sent a careful message to all technical staff: threats against employees happen, they are not your fault, and the company will protect anyone who comes forward.\n\nWithin two days, two more administrators ask to talk. The room has to decide what the company changes for good, not just for this case.",
          "En vecka senare. Ledningen skickade ett varsamt budskap till all teknisk personal: hot mot anställda förekommer, det är inte ert fel, och företaget skyddar den som träder fram.\n\nInom två dagar ber ytterligare två administratörer om att få prata. Rummet måste bestämma vad företaget ändrar på riktigt, inte bara för det här fallet."
        ]),
        injects: [
          inj("i8-1", 10080, "employeeReport", "person.securityOfficer", "high", "confirmed", [
            "Two administrators report contact through social media and messaging apps over the past month. One refused; the other “didn't know who to tell”. Neither gave anything — as far as they know.",
            "Två administratörer berättar om kontakter via sociala medier och meddelandeappar den senaste månaden. En sa nej; den andra ”visste inte vem hen skulle berätta för”. Ingen av dem har lämnat ut något – så vitt de vet."
          ], { fallbackRole: "hr", reveals: ["hf-approach"], tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you reduce the power of any single administrator?", "Hur minskar ni den makt som en enskild administratör har?", ["cio", "ciso"]),
            q("Which detections would have caught the backdoors on day one?", "Vilka detektioner hade fångat bakdörrarna första dagen?", ["socLead", "ciso"]),
            q("Looking back at your first decision on the account, what would you change?", "Om ni ser tillbaka på ert första beslut om kontot – vad skulle ni ändra?", ["ciso"], "d1")
          ],
          executive: [
            q("How do you make it safe and easy for staff to report threats?", "Hur gör ni det tryggt och enkelt för personalen att berätta om hot?", ["hr", "securityOfficer"]),
            q("What does the organisation owe staff in exposed roles?", "Vad är organisationen skyldig personal i utsatta roller?", ["ceo", "hr"]),
            q("Did your treatment of the first employee make these reports possible?", "Var det ert sätt att behandla den första medarbetaren som gjorde de här berättelserna möjliga?", ["ceo"], "d4")
          ]
        },
        challenges: [ch("The more you publicise the issue, the more you reveal to the group.", "Ju mer ni lyfter frågan, desto mer avslöjar ni för gruppen.")],
        decision: dec("d8", "ceo", ["What lasting changes do you make?", "Vilka bestående förändringar gör ni?"], [
          ["Shared control of privileged actions, a confidential threat-reporting line and protection for exposed staff.", "Delad kontroll över privilegierade åtgärder, en konfidentiell kanal för att anmäla hot och skydd för utsatt personal."],
          ["Tighter monitoring of administrators.", "Skärpt övervakning av administratörer."],
          ["Background checks for all privileged roles.", "Bakgrundskontroller för alla privilegierade roller."]
        ], {
          knowns: [["The group targets people, not systems.", "Gruppen riktar in sig på människor, inte system."]],
          uncertainties: [["Whether others have been approached and kept quiet.", "Om fler har kontaktats och tigit."]],
          tradeoffs: {
            operational: ["Shared control slows urgent admin work.", "Delad kontroll saktar ner brådskande administrationsarbete."],
            security: ["Monitoring alone does not stop coercion.", "Enbart övervakning stoppar inte påtryckningar."],
            legal: ["Background checks and monitoring have legal limits.", "Bakgrundskontroller och övervakning har rättsliga gränser."],
            reputational: ["Staff loyalty depends on feeling protected, not watched.", "Personalens lojalitet beror på att de känner sig skyddade, inte övervakade."]
          },
          evaluation: [["Addresses coercion as a people risk, not only a technical one", "Hanterar påtryckningar som en personrisk, inte bara som en teknisk"], ["Reduces single points of privileged control", "Minskar beroendet av enskilda personer med privilegierad åtkomst"]],
          interrupts: [
            ir("i1", { chosen: "A" }, ["Shared control, safe line", "Delad kontroll, trygg kanal"], [
              io(["The line is used", "Kanalen används"], ["Within a week, another member of staff uses the new reporting line about a strange message. They gave nothing away, and say they would not have spoken up before.", "Inom en vecka använder ytterligare en medarbetare den nya kanalen för att berätta om ett märkligt meddelande. Hen lämnade inte ut något och säger att hen inte hade sagt något tidigare."], ["The new reporting line received its first report within a week.", "Den nya kanalen fick sin första anmälan inom en vecka."]),
              io(["Waiting for a second approver", "I väntan på en andra godkännare"], ["On the first night under shared control, an outage waits forty minutes for a second administrator to wake up and approve the fix. Operations asks for an exception.", "Första natten med delad kontroll väntar ett avbrott i fyrtio minuter på att en andra administratör ska vakna och godkänna åtgärden. Driften ber om ett undantag."], ["A night outage was prolonged waiting for a second approver.", "Ett nattligt avbrott förlängdes i väntan på en andra godkännare."], { reopen: true }),
              io(["Split reactions", "Delade reaktioner"], ["Some administrators say shared control shows they are protected; others say it shows they are suspected. Both groups point to the same message from management.", "En del administratörer säger att den delade kontrollen visar att de skyddas; andra att den visar att de misstänks. Båda grupperna hänvisar till samma budskap från ledningen."], ["Administrators are split on whether shared control means trust.", "Administratörerna är oense om den delade kontrollen betyder förtroende."])
            ]),
            ir("i2", { notChosen: "A" }, ["No safe way to tell", "Inget tryggt sätt att berätta"], [
              io(["Accepted without fuss", "Godtas utan protester"], ["Most administrators sign the new rules without objection. Leadership takes it as a sign the measures were well received.", "De flesta administratörer skriver under de nya reglerna utan invändningar. Ledningen tar det som ett tecken på att åtgärderna togs emot väl."], ["Most administrators accepted the new measures without objection.", "De flesta administratörer godtog de nya åtgärderna utan invändningar."]),
              io(["Keeping it quiet", "Att tiga"], ["A manager hears that one administrator received another strange approach but will not report it formally: “I would only end up under the microscope.” Speaking up now feels risky.", "En chef får höra att en administratör har fått ännu en märklig kontakt men inte vill anmäla den formellt: ”Jag skulle bara hamna under lupp.” Att säga något känns nu riskabelt."], ["An administrator received an approach but will not report it formally.", "En administratör har kontaktats men vill inte anmäla det formellt."], { reopen: true }),
              io(["The union asks to review", "Facket vill granska"], ["The union asks to review the new measures before they apply. It does not say whether it opposes them, only that it was not consulted.", "Facket vill granska de nya åtgärderna innan de börjar gälla. Det säger inte om det motsätter sig dem, bara att det inte har tillfrågats."], ["The union has asked to review the new measures.", "Facket har begärt att få granska de nya åtgärderna."])
            ])
          ],
          pushback: {
            A: [
              pb(["Two people, every night", "Två personer, varje natt"], ["Operations points out that the on-call rota has one administrator per night. With shared control, an outage in the middle of the night needs a second person who is asleep. Do you double the on-call cost, or allow exceptions that reopen the gap?", "Driften påpekar att beredskapsschemat har en administratör per natt. Med delad kontroll kräver ett avbrott mitt i natten en andra person som sover. Dubblerar ni kostnaden för beredskapen, eller tillåter ni undantag som öppnar luckan igen?"]),
              pb(["Who answers the line?", "Vem svarar i kanalen?"], ["A confidential threat-reporting line needs someone to answer it. If an employee reports a crime, can that person really promise confidentiality, or must they pass it on? Staff will ask before they call. What do you promise, and can you keep it?", "En konfidentiell kanal för att anmäla hot behöver någon som svarar. Om en anställd berättar om ett brott, kan den personen verkligen lova sekretess, eller måste hen föra det vidare? Personalen kommer att fråga innan de ringer. Vad lovar ni, och kan ni hålla det?"]),
              pb(["What does protection mean?", "Vad betyder skydd?"], ["The board asks what “protection for exposed staff” means in practice, for how many people, and at what cost. Nobody can answer yet, and without a figure, the budget will not be approved. Do you narrow the promise, or argue for an open commitment?", "Styrelsen frågar vad ”skydd för utsatt personal” betyder i praktiken, för hur många och till vilken kostnad. Ingen kan svara än, och utan en siffra godkänns ingen budget. Snävar ni in löftet, eller argumenterar ni för ett öppet åtagande?"])
            ],
            B: [
              pb(["“I would not have come forward”", "”Jag hade inte berättat”"], ["One of the two administrators who came forward says that if they had known monitoring would be tightened afterwards, they would have kept quiet. The people you want to hear from feel punished. Is more watching worth fewer reports?", "En av de två administratörer som berättade säger att om hen hade vetat att övervakningen skulle skärpas efteråt hade hen tigit. De ni vill höra från känner sig straffade. Är mer övervakning värd färre anmälningar?"]),
              pb(["It would not have caught it", "Det hade inte fångat det"], ["The first administrator worked in office hours with ordinary tools, and the threats happened outside work entirely. Tighter monitoring would have shown the same uploads you already saw. What exactly would it have caught?", "Den första administratören arbetade under kontorstid med vanliga verktyg, och hoten skedde helt utanför jobbet. Skärpt övervakning hade visat samma uppladdningar som ni redan såg. Vad exakt hade den fångat?"]),
              pb(["The limits from day one", "Gränserna från första dagen"], ["The data protection officer reminds you of the limits set at the start of this case: monitoring a small, named group of staff more closely needs a strong, documented reason. “They might be threatened” may not be enough. Can you write that justification?", "Dataskyddsombudet påminner om de gränser som sattes i början av ärendet: att övervaka en liten, namngiven grupp anställda närmare kräver ett starkt och dokumenterat skäl. ”De kan bli hotade” räcker kanske inte. Kan ni skriva den motiveringen?"])
            ],
            C: [
              pb(["A clean record", "Ett fläckfritt förflutet"], ["The administrator at the centre of this case had fifteen years of good service and nothing in their past. A background check would have found nothing, because the threat came later and from outside. What problem does this measure actually solve?", "Administratören i centrum av ärendet hade femton år av gott arbete och ingenting i sitt förflutna. En bakgrundskontroll hade inte hittat något, eftersom hotet kom senare och utifrån. Vilket problem löser den här åtgärden egentligen?"]),
              pb(["Checks after coming forward", "Kontroller efter att ha berättat"], ["The union says that checking current administrators right after two of them reported being approached looks like suspicion, not support. Morale in the team is already low. Do you apply the checks to existing staff too, and how do you explain the timing?", "Facket säger att det ser ut som misstanke, inte stöd, att kontrollera nuvarande administratörer just efter att två av dem berättat att de blivit kontaktade. Stämningen i teamet är redan låg. Gäller kontrollerna även befintlig personal, och hur förklarar ni tidpunkten?"]),
              pb(["A register worth stealing", "Ett register värt att stjäla"], ["Background checks mean collecting personal details on exactly the people the group targets: family, addresses, finances. That file becomes something worth taking. Who protects it, and are you creating the next target?", "Bakgrundskontroller innebär att samla personuppgifter om just de personer som gruppen riktar in sig på: familj, adresser, ekonomi. Den samlingen blir något värt att ta. Vem skyddar den, och skapar ni nästa måltavla?"])
            ]
          }
        }),
        facilitator: fac(
          ["Close on culture: the best detection here was a frightened person feeling safe to talk.", "Avsluta med kulturen: den bästa detektionen här var en rädd människa som kände sig trygg nog att prata."],
          ["Shared privileged control, a protected reporting channel, and support for staff in exposed roles.", "Delad privilegierad kontroll, en skyddad kanal för anmälan och stöd för personal i utsatta roller."],
          [["Ask: how would someone in your organisation report a threat today?", "Fråga: hur skulle någon i er organisation anmäla ett hot i dag?"]]
        )
      }
    ],

    resolution: {
      type: "partial",
      text: L([
        "Persistence is removed and customers are informed. The police investigation continues, the employee is supported, and the organisation changes how it protects people in privileged roles.",
        "Persistensen är borttagen och kunderna är informerade. Polisutredningen fortsätter, medarbetaren får stöd och organisationen ändrar hur den skyddar personer i privilegierade roller."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Insider alerts are ambiguous; keep hypotheses open and steps proportionate.", "Insiderlarm är tvetydiga; håll flera hypoteser öppna och stegen proportionerliga."]),
        L(["Security, HR, legal and privacy must act as one team from the start.", "Säkerhet, HR, juridik och dataskydd måste agera som ett team från början."]),
        L(["“Insider” can mean “victim”: coercion is a real and growing threat.", "”Insider” kan betyda ”offer”: påtryckningar är ett verkligt och växande hot."]),
        L(["Removing a person's account does not remove the access they created.", "Att ta bort en persons konto tar inte bort den åtkomst personen har skapat."])
      ],
      assumptionsVsReality: [
        avr(["Security may investigate freely.", "Säkerhetsfunktionen får utreda fritt."], ["Investigation needs a lawful, proportionate basis.", "En utredning kräver ett lagligt och proportionerligt underlag."], "p2"),
        avr(["The employee did everything.", "Medarbetaren gjorde allt."], ["Someone else used the token from abroad.", "Någon annan använde token från utlandet."], "p3"),
        avr(["A disloyal employee.", "En illojal medarbetare."], ["A coerced employee.", "En medarbetare under tvång."], "p4"),
        avr(["Disabling the account ends access.", "Att spärra kontot avslutar åtkomsten."], ["Backdoor accounts remained.", "Bakdörrskonton fanns kvar."], "p5")
      ],
      strengthsToLookFor: [
        L(["Proportionate, documented investigative steps", "Proportionerliga och dokumenterade utredningssteg"]),
        L(["Humane handling of the employee's disclosure", "Mänsklig hantering av medarbetarens berättelse"]),
        L(["A full hunt for persistence", "En fullständig sökning efter persistens"])
      ],
      commonGaps: [
        L(["Jumping to conclusions about guilt", "Att dra förhastade slutsatser om skuld"]),
        L(["Monitoring beyond what the law allows", "Övervakning utöver vad lagen tillåter"]),
        L(["Stopping at the person and missing the backdoors", "Att stanna vid personen och missa bakdörrarna"])
      ],
      suggestedActions: [
        act(["Require dual control for creating privileged accounts.", "Kräv dubbelkontroll när privilegierade konton skapas."], "cio", "high"),
        act(["Alert on new members of privileged groups.", "Larma på nya medlemmar i privilegierade grupper."], "socLead", "high"),
        act(["Create a confidential channel to report threats and coercion.", "Inrätta en konfidentiell kanal för att anmäla hot och påtryckningar."], "securityOfficer", "high"),
        act(["Agree a joint insider-investigation procedure for security, HR, legal and the DPO.", "Ta fram en gemensam rutin för insiderutredningar för säkerhet, HR, juridik och dataskyddsombud."], "hr", "medium"),
        act(["Revoke tokens and access promptly when staff resign, with a handover process that never uses personal storage.", "Spärra token och åtkomst skyndsamt när personal säger upp sig, med en överlämningsprocess som aldrig använder privat lagring."], "itOps", "medium")
      ]
    }
  });
})();
