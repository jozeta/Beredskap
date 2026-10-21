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
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

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
      { id: "lo1", text: L(["Protect staff when an attack becomes personal", "Skydda personalen när ett angrepp blir personligt"]) },
      { id: "lo2", text: L(["Restore public services under pressure", "Återställa offentliga tjänster under press"]) },
      { id: "lo3", text: L(["Work with the police on threats", "Samarbeta med polisen kring hot"]) },
      { id: "lo4", text: L(["Communicate without amplifying the attackers", "Kommunicera utan att förstärka angriparnas budskap"]) }
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
          "{{time.T+0|day}}, {{time.T+0|clock}}. The day after {{org.name}} announced a contested public decision, the front page of its website changes.",
          "{{time.T+0|day}}, klockan {{time.T+0|clock}}. Dagen efter att {{org.name}} tillkännagav ett omstritt offentligt beslut ändras startsidan på webbplatsen."
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
          ["Restore the pages immediately and say nothing.", "Återställ sidorna omedelbart och säg ingenting."],
          ["Leave the page up until the investigation is done.", "Låt sidan ligga kvar tills utredningen är klar."]
        ], {
          knowns: [["Content pages are defaced.", "Innehållssidorna är vandaliserade."], ["E-services still work.", "E-tjänsterna fungerar fortfarande."]],
          uncertainties: [["How they got in.", "Hur de tog sig in."]],
          tradeoffs: {
            operational: ["Taking pages offline removes public information.", "Att ta ned sidorna tar bort offentlig information."],
            security: ["Restoring without knowing the path invites a repeat.", "Att återställa utan att känna till vägen bjuder in till en upprepning."],
            legal: ["Public bodies must keep certain information available.", "Offentliga organ måste hålla viss information tillgänglig."],
            reputational: ["Silence lets the attackers tell the story.", "Tystnad låter angriparna berätta historien."]
          },
          evaluation: [["Preserves evidence while removing the defacement", "Säkrar spår och tar samtidigt bort vandaliseringen"]]
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
        assumptionChallenged: L(["The attackers exploited the website.", "Angriparna utnyttjade webbplatsen."]),
        reveals: ["hf-cms"],
        narrative: L([
          "{{time.T+90|clock}}. The publishing tool's audit log is reviewed.",
          "Klockan {{time.T+90|clock}}. Publiceringsverktygets granskningslogg gås igenom."
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
          evaluation: [["Fixes the access model, not just the password", "Rättar åtkomstmodellen, inte bara lösenordet"]]
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
        assumptionChallenged: L(["This is about the website.", "Det här handlar om webbplatsen."]),
        reveals: ["hf-dox"],
        narrative: L([
          "{{time.T+240|clock}}. An employee calls HR in tears.",
          "Klockan {{time.T+240|clock}}. En anställd ringer HR i tårar."
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
          minutes: 10
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
        assumptionChallenged: L(["The e-services are not a target.", "E-tjänsterna är inte en måltavla."]),
        narrative: L([
          "{{time.T+480|clock}}. Citizens can't book, apply or pay.",
          "Klockan {{time.T+480|clock}}. Medborgarna kan inte boka, ansöka eller betala."
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
          ["Wait it out; floods end.", "Vänta ut det; trafikfloder tar slut."]
        ], {
          knowns: [["E-services are down from a traffic flood.", "E-tjänsterna ligger nere på grund av en trafikflod."]],
          uncertainties: [["How long it will last.", "Hur länge den kommer att pågå."]],
          tradeoffs: {
            operational: ["Filtering may block some legitimate users.", "Filtrering kan blockera vissa legitima användare."],
            security: ["Pulling everyone to the flood neglects the bigger risk.", "Att dra alla till trafikfloden försummar den större risken."],
            legal: ["Citizens have a right to certain services.", "Medborgarna har rätt till vissa tjänster."],
            reputational: ["Visible manual alternatives show control.", "Synliga manuella alternativ visar kontroll."]
          },
          evaluation: [["Restores service without losing focus on staff", "Återställer tjänsterna utan att tappa fokus på personalen"]]
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
        assumptionChallenged: L(["We control our own crisis communication.", "Vi styr vår egen kriskommunikation."]),
        narrative: L([
          "The next day. Staff, unions and the press all want answers.",
          "Nästa dag. Personal, fackförbund och press vill alla ha svar."
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
          evaluation: [["Communicates care without amplifying the attackers", "Kommunicerar omsorg utan att förstärka angriparna"]]
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
        assumptionChallenged: L(["The group found staff details from public sources.", "Gruppen hittade personaluppgifterna i offentliga källor."]),
        reveals: ["hf-export"],
        narrative: L([
          "Two days later. The investigation compares the published list with internal records.",
          "Två dagar senare. Utredningen jämför den publicerade listan med interna register."
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
          ["Blame the agency.", "Skyll på byrån."]
        ], {
          knowns: [["The list came from your own export.", "Listan kom från er egen export."]],
          uncertainties: [["What else was shared.", "Vad mer som har delats."]],
          tradeoffs: {
            operational: ["A supplier data review is a big job.", "En granskning av uppgifter hos leverantörer är ett stort arbete."],
            security: ["Unnecessary data is a liability.", "Onödiga uppgifter är en belastning."],
            legal: ["The breach is reportable.", "Incidenten ska anmälas."],
            reputational: ["Staff trust depends on honesty now.", "Personalens förtroende hänger nu på ärlighet."]
          },
          evaluation: [["Owns the failure openly with staff", "Tar öppet ansvar för misstaget inför personalen"]]
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
        assumptionChallenged: L(["The attack is over.", "Angreppet är över."]),
        narrative: L([
          "Three days in. Things have calmed down — until a new post.",
          "Tre dagar in. Det har lugnat sig – tills ett nytt inlägg dyker upp."
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
          evaluation: [["Protects people and the process without giving in", "Skyddar människorna och processen utan att ge efter"]]
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
