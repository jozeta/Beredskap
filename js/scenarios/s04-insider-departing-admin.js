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
  const { L, q, ch, inj, dec, fac, act, avr, kpi } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Investigate an insider alert proportionately and lawfully", "Utreda ett insiderlarm proportionerligt och lagligt"]) },
      { id: "lo2", text: L(["Coordinate security, HR, legal and privacy in one response", "Samordna säkerhet, HR, juridik och dataskydd i en och samma hantering"]) },
      { id: "lo3", text: L(["Remove persistent privileged access, not only a user account", "Ta bort bestående privilegierad åtkomst, inte bara ett användarkonto"]) },
      { id: "lo4", text: L(["Recognise coercion and protect the people involved", "Känna igen påtryckningar och skydda de inblandade"]) }
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
          evaluation: [["Separates handover needs from personal storage", "Skiljer överlämningsbehov från privat lagring"], ["Involves HR and legal before investigative steps", "Involverar HR och juridik före utredningsåtgärder"]]
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
          evaluation: [["Writes down the purpose and limits of the investigation", "Skriver ner utredningens syfte och gränser"], ["Keeps security and HR aligned", "Håller säkerhet och HR samspelta"]]
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
          evaluation: [["Treats the token as compromised immediately", "Behandlar token som komprometterad direkt"], ["Plans the conversation with care for the person", "Planerar samtalet med omsorg om personen"]]
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
          minutes: 10
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
          evaluation: [["Removes all persistence in one coordinated action", "Tar bort all persistens i en samordnad åtgärd"], ["Rotates credentials the backdoors could reach", "Byter inloggningsuppgifter som bakdörrarna kunde nå"]]
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
          evaluation: [["Separates investigative help from real exposure", "Skiljer hjälp till utredningen från verklig exponering"], ["Documents who accepted which risk", "Dokumenterar vem som accepterade vilken risk"]]
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
          evaluation: [["Puts customers in a position to protect themselves", "Ger kunderna möjlighet att skydda sig"], ["Balances disclosure against people's safety", "Väger öppenhet mot människors säkerhet"]]
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
          evaluation: [["Addresses coercion as a people risk, not only a technical one", "Hanterar påtryckningar som en personrisk, inte bara som en teknisk"], ["Reduces single points of privileged control", "Minskar beroendet av enskilda personer med privilegierad åtkomst"]]
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
