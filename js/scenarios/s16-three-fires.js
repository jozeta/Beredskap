/*
 * s16-three-fires.js — "Three Fires at Once" (archetype E, multi-incident).
 *
 * Compound crisis: a phishing campaign, a critical service outage and suspicious
 * privileged access all land within one hour → the outage is a failed change,
 * unrelated → the phishing and the privileged access are the same attack →
 * two leaders give contradictory orders → the privileged account reached the
 * backup console → response actions collide → the lure exploited the outage →
 * responders run out of energy.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, ch, inj, dec, fac, act, avr, kpi, line } = BK.scenarios.h;

  BK.scenarios.register({
    id: "s16-three-fires",
    version: 1,
    category: "multi-incident",
    archetype: "compound-crisis",
    emblem: "three-fires",
    title: L(["Three Fires at Once", "Tre bränder samtidigt"]),
    summary: L([
      "Within one hour: a phishing wave, a critical service down and an administrator account doing strange things. You have four responders. Two of the fires are connected.",
      "Inom en timme: en våg av nätfiske, en kritisk tjänst som ligger nere och ett administratörskonto som gör konstiga saker. Ni har fyra personer som kan hantera det. Två av bränderna hänger ihop."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Prioritise several incidents with too few people", "Prioritera flera incidenter med för få personer"]) },
      { id: "lo2", text: L(["Establish clear incident command", "Etablera en tydlig incidentledning"]) },
      { id: "lo3", text: L(["Separate connected incidents from coincidences", "Skilja sammanhängande incidenter från sammanträffanden"]) },
      { id: "lo4", text: L(["Coordinate response actions so they don't collide", "Samordna åtgärder så att de inte krockar"]) }
    ],
    mitre: ["T1566.002", "T1078", "T1098", "T1136", "T1021", "T1490"],
    frameworks: {
      nistCsf: ["GV.RR", "ID.RA", "DE.AE", "RS.MA", "RS.AN", "RS.CO", "RS.MI", "RC.RP"],
      iso27001: ["A.5.24", "A.5.25", "A.5.26", "A.5.29", "A.6.3", "A.8.2", "A.8.32"]
    },
    minStages: 4,
    maxStages: 8,
    constraints: { startWindow: "business-hours" },
    actor: { types: ["criminal"], motivation: L(["Financial: privileged access for later extortion", "Ekonomisk: privilegierad åtkomst för senare utpressning"]), capability: "medium" },
    variables: {
      phishSent: { min: 200, max: 6000, scaleBy: "size" },
      clickers: { min: 4, max: 90, scaleBy: "size" },
      customersAffected: { min: 500, max: 120000, scaleBy: "size" },
      responders: { min: 3, max: 6 },
      hoursAwake: { min: 16, max: 22 }
    },
    roles: ["incidentCommander", "socLead", "itOps", "serviceOwner", "ciso", "cio", "comms", "hr", "dutyOfficer", "networkLead"],

    groundTruth: {
      rootCause: L([
        "Three things happened at once. A failed database change took {{org.service.customer|lcfirst}} down — a coincidence. A criminal group saw the outage on the public status page and sent a phishing wave themed around it. One of the people who entered credentials was a service-desk administrator, and the group used that account within minutes.",
        "Tre saker hände samtidigt. En misslyckad databasändring slog ut {{org.service.customer|lcfirst}} – ett sammanträffande. En kriminell grupp såg avbrottet på den offentliga driftstatussidan och skickade en våg av nätfiske med avbrottet som tema. En av dem som angav sina inloggningsuppgifter var en administratör på servicedesken, och gruppen använde det kontot inom några minuter."
      ]),
      attackerTimeline: [
        { at: -25, text: L(["Database change fails; customer service goes down.", "Databasändringen misslyckas; kundtjänsten går ned."]) },
        { at: -12, text: L(["Group reads the status page.", "Gruppen läser driftstatussidan."]) },
        { at: -5, text: L(["Phishing wave themed on the outage.", "Våg av nätfiske med avbrottet som tema."]) },
        { at: 25, text: L(["Service-desk administrator enters credentials.", "En administratör på servicedesken anger sina inloggningsuppgifter."]) },
        { at: 35, text: L(["Privileged account used from outside.", "Det privilegierade kontot används utifrån."]) }
      ]
    },

    hiddenFacts: [
      { id: "hf-change", revealStage: "p2", text: L(["The outage was caused by a failed database change.", "Avbrottet orsakades av en misslyckad databasändring."]) },
      { id: "hf-link", revealStage: "p3", text: L(["The privileged account belongs to someone who entered credentials on the phishing page.", "Det privilegierade kontot tillhör någon som angav sina inloggningsuppgifter på nätfiskesidan."]) },
      { id: "hf-backup", revealStage: "p5", text: L(["The privileged account opened the backup console.", "Det privilegierade kontot öppnade administrationen för säkerhetskopiorna."]) },
      { id: "hf-lure", revealStage: "p7", text: L(["The phishing lure was written around your own outage.", "Nätfiskemeddelandet var skrivet kring ert eget avbrott."]) }
    ],

    stages: [
      {
        id: "p1",
        mandatory: true,
        clock: 0,
        title: L(["Everything at once", "Allt på en gång"]),
        narrative: L([
          "{{time.T+0|day}}, {{time.T+0|clock}}. At {{org.name}}, the duty officer's phone hasn't stopped for an hour.",
          "{{time.T+0|day}}, klockan {{time.T+0|clock}}. Hos {{org.name}} har tjänstgörande beredskapsansvarigs telefon inte slutat ringa på en timme."
        ]),
        injects: [
          inj("i1-1", 0, "statusPage", "itOps", "high", "confirmed", [
            "{{org.service.customer}} is down for about {{num.customersAffected}} customers since {{time.T-20|clock}}. Cause unknown.",
            "{{org.service.customer}} ligger nere för ungefär {{num.customersAffected}} kunder sedan klockan {{time.T-20|clock}}. Orsaken är okänd."
          ], { headline: ["Fire 1: customer service down", "Brand 1: kundtjänsten nere"], tests: ["lo1"] }),
          inj("i1-2", 10, "phishingEmail", "serviceDesk", "high", "confirmed", [
            "Staff report an email sent to {{num.phishSent}} people: “Service disruption — re-verify your account here.” At least {{num.clickers}} have clicked.",
            "Personal rapporterar ett e-postmeddelande som skickats till {{num.phishSent}} personer: ”Driftstörning – verifiera ditt konto här.” Minst {{num.clickers}} har klickat."
          ], { headline: ["Fire 2: phishing wave", "Brand 2: våg av nätfiske"], tests: ["lo1"] }),
          inj("i1-3", 40, "authLog", "siem", "high", "unverified", [
            "{{asset.adminAccount}} signed in from {{asset.attackerIp}} and listed all administrator groups. Could be someone working from home.",
            "{{asset.adminAccount}} loggade in från {{asset.attackerIp}} och listade alla administratörsgrupper. Kan vara någon som arbetar hemifrån."
          ], { headline: ["Fire 3: odd privileged access", "Brand 3: konstig privilegierad åtkomst"], statedReliability: ["Unconfirmed", "Obekräftat"], tests: ["lo1", "lo3"] })
        ],
        charts: [{
          id: "c1-kpi", type: "kpi",
          title: L(["Three fires, one team", "Tre bränder, ett team"]),
          data: kpi([
            { id: "cust", label: ["Customers without service", "Kunder utan tjänst"], value: (v) => v.customersAffected, tone: "danger" },
            { id: "clicks", label: ["Staff who clicked", "Anställda som klickade"], value: (v) => v.clickers, tone: "warn" },
            { id: "people", label: ["Responders available", "Tillgängliga personer för hanteringen"], value: (v) => v.responders, tone: "info" }
          ])
        }],
        questions: {
          technical: [
            q("Which fire could get worst fastest?", "Vilken brand kan bli värst snabbast?", ["socLead", "itOps"]),
            q("What one quick action limits each fire?", "Vilken snabb åtgärd begränsar varje brand?", ["socLead", "itOps"]),
            q("Could any of these be related?", "Kan någon av dem hänga ihop?", ["socLead"])
          ],
          executive: [
            q("Who is in charge of all three?", "Vem leder alla tre?", ["incidentCommander", "cio"]),
            q("Who can you call in to help?", "Vem kan ni kalla in som förstärkning?", ["dutyOfficer", "cio"]),
            q("Which fire do customers see, and does that decide your priority?", "Vilken brand ser kunderna, och avgör det er prioritering?", ["serviceOwner", "comms"])
          ]
        },
        challenges: [ch("Everyone wants the customer outage fixed first because it's the most visible.", "Alla vill att kundavbrottet ska lösas först eftersom det syns mest.")],
        decision: dec("d1", "incidentCommander", ["How do you deploy your {{num.responders}} people?", "Hur fördelar ni era {{num.responders}} personer?"], [
          ["Name one commander, put one person on each fire, and take the privileged account seriously until cleared.", "Utse en ledare, sätt en person på varje brand och ta det privilegierade kontot på allvar tills det är utrett."],
          ["Everyone on the customer outage first.", "Alla på kundavbrottet först."],
          ["Each team handles its own fire.", "Varje team hanterar sin egen brand."]
        ], {
          knowns: [["Three problems in one hour.", "Tre problem på en timme."], ["Only {{num.responders}} responders.", "Bara {{num.responders}} personer för hanteringen."]],
          uncertainties: [["Whether they are related.", "Om de hänger ihop."]],
          tradeoffs: {
            operational: ["The outage is the most visible to customers.", "Avbrottet är det som syns mest för kunderna."],
            security: ["Privileged access can do the most damage quietly.", "Privilegierad åtkomst kan göra störst skada i tysthet."],
            legal: ["Customer SLAs may be at stake.", "Kundernas servicenivåavtal kan stå på spel."],
            reputational: ["Visible fires get attention; quiet ones get worse.", "Synliga bränder får uppmärksamhet; tysta blir värre."]
          },
          evaluation: [["Names a single commander", "Utser en enda ledare"], ["Does not let visibility decide priority", "Låter inte synligheten avgöra prioriteringen"]],
          minutes: 10
        }),
        facilitator: fac(
          ["Overload is the point. Watch who takes command and who drifts to the loudest fire.", "Överbelastningen är poängen. Se vem som tar ledningen och vem som dras mot den högljuddaste branden."],
          ["One commander and a deliberate split that covers the privileged access.", "En ledare och en medveten fördelning som täcker den privilegierade åtkomsten."],
          [["Ask: which of the three could you still be dealing with in a month?", "Fråga: vilken av de tre kan ni fortfarande hålla på med om en månad?"]]
        )
      },
      {
        id: "p2",
        mandatory: true,
        clock: 60,
        title: L(["Just a bad change", "Bara en dålig ändring"]),
        twist: L(["The outage is a failed database change. It is unrelated to the other two.", "Avbrottet är en misslyckad databasändring. Det har inget med de andra två att göra."]),
        twistKind: "cause",
        assumptionChallenged: L(["Three incidents at once must be one attack.", "Tre incidenter samtidigt måste vara ett och samma angrepp."]),
        reveals: ["hf-change"],
        narrative: L([
          "{{time.T+60|clock}}. The operations engineer on the outage reports back.",
          "Klockan {{time.T+60|clock}}. Driftteknikern som arbetar med avbrottet återkommer."
        ]),
        injects: [
          inj("i2-1", 60, "logExcerpt", "itOps", "medium", "confirmed", [
            "A schema change to the customer database at {{time.T-25|clock}} locked a core table. Rolling back takes about two hours. No sign of anything malicious.",
            "En schemaändring i kunddatabasen klockan {{time.T-25|clock}} låste en central tabell. Att rulla tillbaka tar ungefär två timmar. Inga tecken på något skadligt."
          ], { headline: ["Outage: failed change", "Avbrott: misslyckad ändring"], reveals: ["hf-change"], tests: ["lo3"] }),
          inj("i2-2", 75, "chat", "soc", "medium", "disputed", [
            "The SOC analyst: “I don't buy it. Three things in one hour is not a coincidence.”",
            "SOC-analytikern: ”Det köper jag inte. Tre saker på en timme är inget sammanträffande.”"
          ], { facilitatorNote: ["Half right: two are linked, one isn't. Watch whether the group can hold both ideas.", "Halvt rätt: två hänger ihop, en gör det inte. Se om gruppen kan hålla båda tankarna samtidigt."], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How confident are you that the change is the whole story?", "Hur säkra är ni på att ändringen är hela förklaringen?", ["itOps"]),
            q("Can the rollback be done by one person?", "Kan tillbakarullningen göras av en person?", ["itOps"]),
            q("Did your split leave anyone on the privileged account?", "Lämnade er fördelning någon på det privilegierade kontot?", ["socLead"], "d1")
          ],
          executive: [
            q("Can you now move people from the outage to the other fires?", "Kan ni nu flytta personer från avbrottet till de andra bränderna?", ["incidentCommander"]),
            q("What do you tell customers about the outage?", "Vad säger ni till kunderna om avbrottet?", ["comms", "serviceOwner"]),
            q("Would you still split your people the same way?", "Skulle ni fortfarande fördela personerna på samma sätt?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The SOC and operations disagree openly in the bridge call.", "SOC och drift är öppet oense i samtalet.")],
        decision: dec("d2", "incidentCommander", ["How do you rebalance?", "Hur omfördelar ni?"], [
          ["Leave one person on the rollback and move the rest to the phishing and privileged access.", "Låt en person stanna på tillbakarullningen och flytta resten till nätfisket och den privilegierade åtkomsten."],
          ["Keep the current split until each fire is closed.", "Behåll nuvarande fördelning tills varje brand är släckt."],
          ["Finish the outage first, then turn to the others.", "Gör klart avbrottet först och vänd er sedan till de andra."]
        ], {
          knowns: [["The outage is a failed change.", "Avbrottet är en misslyckad ändring."]],
          uncertainties: [["Whether phishing and privileged access are linked.", "Om nätfisket och den privilegierade åtkomsten hänger ihop."]],
          tradeoffs: {
            operational: ["Fewer people on the rollback slows recovery.", "Färre personer på tillbakarullningen gör återställningen långsammare."],
            security: ["The security fires are the ones that grow.", "Det är säkerhetsbränderna som växer."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["Customers see the outage, not the rest.", "Kunderna ser avbrottet, inte resten."]
          },
          evaluation: [["Moves capacity to where risk is growing", "Flyttar kapacitet dit risken växer"]]
        }),
        facilitator: fac(
          ["A coincidence, confirmed. The skill is letting go of the visible fire.", "Ett sammanträffande, bekräftat. Konsten är att släppa den synliga branden."],
          ["Minimal staffing on the rollback and the rest on the security fires.", "Minimal bemanning på tillbakarullningen och resten på säkerhetsbränderna."],
          [["Ask: what is the outage costing compared to the other two?", "Fråga: vad kostar avbrottet jämfört med de andra två?"]]
        )
      },
      {
        id: "p3",
        mandatory: true,
        clock: 120,
        title: L(["Two fires, one attacker", "Två bränder, en angripare"]),
        twist: L(["The privileged account belongs to a service-desk administrator who entered their password on the phishing page.", "Det privilegierade kontot tillhör en administratör på servicedesken som angav sitt lösenord på nätfiskesidan."]),
        twistKind: "scope",
        assumptionChallenged: L(["The phishing is a nuisance; the privileged access is separate.", "Nätfisket är ett irritationsmoment; den privilegierade åtkomsten är något annat."]),
        reveals: ["hf-link"],
        narrative: L([
          "{{time.T+120|clock}}. The SOC matches the list of clickers with the privileged sign-ins.",
          "Klockan {{time.T+120|clock}}. SOC jämför listan över dem som klickade med de privilegierade inloggningarna."
        ]),
        injects: [
          inj("i3-1", 120, "forensicFinding", "soc", "critical", "confirmed", [
            "The owner of {{asset.adminAccount}} entered credentials on the phishing page at {{time.T+25|clock}}. Ten minutes later the account signed in from {{asset.attackerIp}} and added a new member to an administrator group.",
            "Ägaren till {{asset.adminAccount}} angav sina inloggningsuppgifter på nätfiskesidan klockan {{time.T+25|clock}}. Tio minuter senare loggade kontot in från {{asset.attackerIp}} och lade till en ny medlem i en administratörsgrupp."
          ], { headline: ["Phishing and privileged access are linked", "Nätfisket och den privilegierade åtkomsten hänger ihop"], reveals: ["hf-link"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How do you contain the account and the new admin it created?", "Hur begränsar ni kontot och den nya administratören det skapade?", ["socLead", "itOps"]),
            q("Which other clickers have privileged roles?", "Vilka andra som klickade har privilegierade roller?", ["socLead"]),
            q("Did moving people off the outage pay off?", "Lönade det sig att flytta personer från avbrottet?", ["socLead"], "d2")
          ],
          executive: [
            q("Is this now the main incident?", "Är det här nu huvudincidenten?", ["incidentCommander", "ciso"]),
            q("Do you need outside help?", "Behöver ni extern hjälp?", ["ciso", "cio"]),
            q("Did the first split of people delay this finding?", "Försenade den första fördelningen av personer det här fyndet?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("The administrator is on the bridge call and very upset.", "Administratören är med i samtalet och mycket upprörd.")],
        decision: dec("d3", "ciso", ["How do you contain the linked attack?", "Hur begränsar ni det sammanhängande angreppet?"], [
          ["Disable both admin accounts, revoke sessions for all clickers and call in your incident-response partner.", "Spärra båda administratörskontona, återkalla sessionerna för alla som klickade och kalla in er incidentpartner."],
          ["Reset the administrator's password and watch for more.", "Byt administratörens lösenord och håll utkik efter mer."],
          ["Reset all clickers' passwords tonight.", "Byt lösenord för alla som klickade i kväll."]
        ], {
          knowns: [["A phished admin account created another admin.", "Ett nätfiskat administratörskonto skapade en annan administratör."]],
          uncertainties: [["What else the attacker did.", "Vad mer angriparen gjorde."]],
          tradeoffs: {
            operational: ["Disabling accounts may block service-desk work.", "Att spärra konton kan blockera servicedeskens arbete."],
            security: ["A new admin means persistence.", "En ny administratör innebär fäste."],
            legal: ["No change yet.", "Ingen förändring ännu."],
            reputational: ["Waiting risks a far bigger incident.", "Att vänta riskerar en mycket större incident."]
          },
          evaluation: [["Removes persistence, not just the first account", "Tar bort fästet, inte bara det första kontot"]]
        }),
        facilitator: fac(
          ["The fires connect. Watch for relief that one was a coincidence turning into complacency.", "Bränderna hänger ihop. Se upp så att lättnaden över sammanträffandet inte blir till självbelåtenhet."],
          ["Both accounts disabled, sessions revoked and help called in.", "Båda kontona spärrade, sessionerna återkallade och hjälp inkallad."],
          [["Ask: what is the new admin account for?", "Fråga: vad är det nya administratörskontot till för?"]]
        )
      },
      {
        id: "p4",
        mandatory: true,
        clock: 180,
        title: L(["Two commanders", "Två ledare"]),
        twist: L(["The CIO and the CISO are giving contradictory orders to the same people.", "IT-chefen och säkerhetschefen ger motstridiga order till samma personer."]),
        twistKind: "authority",
        assumptionChallenged: L(["Everyone knows who is in charge.", "Alla vet vem som leder."]),
        narrative: L([
          "{{time.T+180|clock}}. Two leaders join the bridge from different meetings.",
          "Klockan {{time.T+180|clock}}. Två chefer ansluter till samtalet från olika möten."
        ]),
        injects: [
          inj("i4-1", 180, "chat", "person.cio", "high", "confirmed", [
            "“Everyone back on the customer outage. That's what the board is asking about.”",
            "”Alla tillbaka till kundavbrottet. Det är det styrelsen frågar om.”"
          ], { fallbackRole: "incidentCommander", tests: ["lo2"] }),
          inj("i4-2", 185, "chat", "person.ciso", "high", "confirmed", [
            "“Nobody leaves the security incident until the attacker is out.”",
            "”Ingen lämnar säkerhetsincidenten förrän angriparen är ute.”"
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What do responders do when given two orders?", "Vad gör personerna när de får två order?", ["socLead", "itOps"]),
            q("Which tasks can wait without harm?", "Vilka uppgifter kan vänta utan skada?", ["socLead", "itOps"]),
            q("Did your containment of the admin accounts hold?", "Höll er begränsning av administratörskontona?", ["socLead"], "d3")
          ],
          executive: [
            q("Who is the incident commander, and does everyone know?", "Vem är incidentledare, och vet alla om det?", ["incidentCommander", "cio", "ciso"]),
            q("How do senior leaders give input without giving orders?", "Hur ger chefer underlag utan att ge order?", ["cio", "ciso"]),
            q("Was your choice of commander in the first hour respected?", "Respekterades ert val av ledare under den första timmen?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Both leaders outrank the incident commander.", "Båda cheferna är högre i rang än incidentledaren.")],
        decision: dec("d4", "incidentCommander", ["How do you resolve the conflict?", "Hur löser ni konflikten?"], [
          ["Confirm one commander with authority over both fires; leaders feed priorities to them, not to responders.", "Bekräfta en ledare med mandat över båda bränderna; cheferna ger sina prioriteringar till ledaren, inte till personerna."],
          ["Let the CIO and CISO split the team between them.", "Låt IT-chefen och säkerhetschefen dela upp teamet mellan sig."],
          ["Escalate to the CEO to decide.", "Eskalera till vd för beslut."]
        ], {
          knowns: [["Two leaders gave conflicting orders.", "Två chefer har gett motstridiga order."]],
          uncertainties: [["Whether either will step back.", "Om någon av dem kommer att backa."]],
          tradeoffs: {
            operational: ["Splitting the team halves each response.", "Att dela teamet halverar varje insats."],
            security: ["Confusion lets the attacker regroup.", "Förvirring låter angriparen samla sig."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["Visible infighting erodes trust in the team.", "Synliga konflikter urholkar förtroendet för teamet."]
          },
          evaluation: [["Restores a single line of command", "Återställer en enda ledningslinje"]],
          minutes: 10
        }),
        facilitator: fac(
          ["Classic command failure. Let the tension land before resolving it.", "Klassiskt ledningsfel. Låt spänningen landa innan den löses."],
          ["One commander confirmed, leaders advising through them.", "En ledare bekräftad, cheferna ger råd via ledaren."],
          [["Ask: who can tell a CIO to step back?", "Fråga: vem kan säga till en IT-chef att backa?"]]
        )
      },
      {
        id: "p5",
        priority: 1,
        clock: 300,
        title: L(["The backup console", "Administrationen för säkerhetskopior"]),
        twist: L(["The new admin account opened the backup console and changed the retention policy.", "Det nya administratörskontot öppnade administrationen för säkerhetskopior och ändrade lagringspolicyn."]),
        twistKind: "scope",
        assumptionChallenged: L(["The attacker only had a foothold.", "Angriparen hade bara ett fotfäste."]),
        reveals: ["hf-backup"],
        narrative: L([
          "{{time.T+300|clock}}. The incident-response partner reviews the new account's activity.",
          "Klockan {{time.T+300|clock}}. Incidentpartnern granskar det nya kontots aktivitet."
        ]),
        injects: [
          inj("i5-1", 300, "backupReport", "backupSystem", "critical", "confirmed", [
            "The new admin opened the backup console on {{asset.backupServer}} and shortened retention to one day. Older restore points will be deleted tonight unless changed.",
            "Den nya administratören öppnade administrationen för säkerhetskopior på {{asset.backupServer}} och kortade lagringstiden till en dag. Äldre återställningspunkter raderas i natt om inget ändras."
          ], { headline: ["Backup retention changed", "Lagringstiden för säkerhetskopior ändrad"], reveals: ["hf-backup"], tests: ["lo3"] })
        ],
        questions: {
          technical: [
            q("How do you restore retention and protect the restore points?", "Hur återställer ni lagringstiden och skyddar återställningspunkterna?", ["itOps"]),
            q("What does this tell you about the attacker's plan?", "Vad säger det här om angriparens plan?", ["socLead"]),
            q("Did one commander make this finding faster?", "Gjorde en enda ledare att det här hittades snabbare?", ["socLead"], "d4")
          ],
          executive: [
            q("Is this now a likely ransomware precursor?", "Är det här nu ett troligt förstadium till utpressningsprogram?", ["ciso"]),
            q("What must be protected tonight, above all?", "Vad måste skyddas i natt, framför allt?", ["incidentCommander", "cio"]),
            q("Was disabling the admin accounts early enough?", "Var spärren av administratörskontona tillräckligt tidig?", ["ciso"], "d3")
          ]
        },
        challenges: [ch("The backup team is the same person doing the outage rollback.", "Backupteamet är samma person som gör tillbakarullningen av avbrottet.")],
        decision: dec("d5", "incidentCommander", ["Where do you put your scarce people now?", "Var sätter ni era få personer nu?"], [
          ["Pause the rollback, protect backups first, then resume.", "Pausa tillbakarullningen, skydda säkerhetskopiorna först och återuppta sedan."],
          ["Finish the rollback, then fix retention before tonight.", "Gör klart tillbakarullningen och rätta sedan lagringstiden före i natt."],
          ["Ask the backup vendor to restore retention remotely.", "Be backupleverantören återställa lagringstiden på distans."]
        ], {
          knowns: [["Backups will be deleted tonight.", "Säkerhetskopiorna raderas i natt."]],
          uncertainties: [["What else the attacker prepared.", "Vad mer angriparen har förberett."]],
          tradeoffs: {
            operational: ["Pausing the rollback extends the customer outage.", "En paus i tillbakarullningen förlänger kundavbrottet."],
            security: ["Losing backups would turn any attack into a disaster.", "Att förlora säkerhetskopiorna skulle göra varje angrepp till en katastrof."],
            legal: ["SLAs versus data protection.", "Servicenivåavtal mot dataskydd."],
            reputational: ["A longer outage is survivable.", "Ett längre avbrott går att överleva."]
          },
          evaluation: [["Protects recovery capability first", "Skyddar förmågan att återställa först"]]
        }),
        facilitator: fac(
          ["The coincidental fire now competes with the real one for the same person.", "Branden som var ett sammanträffande konkurrerar nu med den verkliga om samma person."],
          ["Backups protected before the rollback resumes.", "Säkerhetskopiorna skyddade innan tillbakarullningen återupptas."],
          [["Ask: which loss can you recover from?", "Fråga: vilken förlust går att återhämta sig från?"]]
        )
      },
      {
        id: "p6",
        priority: 2,
        clock: 420,
        title: L(["Actions that collide", "Åtgärder som krockar"]),
        twist: L(["Revoking sessions broke the deployment account used for the rollback. Your own response stopped your recovery.", "Återkallandet av sessioner slog ut driftsättningskontot som användes för tillbakarullningen. Er egen hantering stoppade er återställning."]),
        twistKind: "impact",
        assumptionChallenged: L(["Response actions on one fire don't affect another.", "Åtgärder för en brand påverkar inte en annan."]),
        narrative: L([
          "{{time.T+420|clock}}. The rollback fails halfway.",
          "Klockan {{time.T+420|clock}}. Tillbakarullningen misslyckas halvvägs."
        ]),
        injects: [
          inj("i6-1", 420, "logExcerpt", "itOps", "high", "confirmed", [
            "The rollback job failed: its service account {{asset.serviceAccount}} lost its session when sessions were revoked. The database is now half rolled back.",
            "Tillbakarullningsjobbet misslyckades: dess tjänstekonto {{asset.serviceAccount}} förlorade sin session när sessionerna återkallades. Databasen är nu halvvägs tillbakarullad."
          ], { tests: ["lo4"] })
        ],
        questions: {
          technical: [
            q("How do you recover the half-rolled-back database safely?", "Hur återställer ni den halvvägs tillbakarullade databasen säkert?", ["itOps"]),
            q("Which security actions could break other work?", "Vilka säkerhetsåtgärder kan slå ut annat arbete?", ["socLead", "itOps"]),
            q("Did you protect the backups before this happened?", "Skyddade ni säkerhetskopiorna innan det här hände?", ["itOps"], "d5")
          ],
          executive: [
            q("How do you coordinate actions across fires?", "Hur samordnar ni åtgärder mellan bränderna?", ["incidentCommander"]),
            q("What do customers hear about the longer outage?", "Vad får kunderna höra om det längre avbrottet?", ["comms", "serviceOwner"]),
            q("Does one commander make collisions like this less likely?", "Gör en enda ledare krockar som den här mindre sannolika?", ["incidentCommander"], "d4")
          ]
        },
        challenges: [ch("The customer outage is now in its eighth hour.", "Kundavbrottet är nu inne på sin åttonde timme.")],
        decision: dec("d6", "incidentCommander", ["How do you prevent this happening again?", "Hur förhindrar ni att det här händer igen?"], [
          ["A single action log where every change is announced before it's made.", "En gemensam åtgärdslogg där varje ändring meddelas innan den görs."],
          ["Separate the security and operations teams completely.", "Skilj säkerhets- och driftteamen åt helt."],
          ["Stop security actions until the outage is fixed.", "Stoppa säkerhetsåtgärder tills avbrottet är löst."]
        ], {
          knowns: [["A security action broke recovery.", "En säkerhetsåtgärd slog ut återställningen."]],
          uncertainties: [["What other dependencies exist.", "Vilka andra beroenden som finns."]],
          tradeoffs: {
            operational: ["Announcing every change slows response a little.", "Att meddela varje ändring gör hanteringen något långsammare."],
            security: ["Pausing security actions gives the attacker time.", "Att pausa säkerhetsåtgärder ger angriparen tid."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["Self-inflicted outages are hard to explain.", "Självförvållade avbrott är svåra att förklara."]
          },
          evaluation: [["Coordinates actions through one log", "Samordnar åtgärder via en gemensam logg"]]
        }),
        facilitator: fac(
          ["Response actions are changes too. Make that explicit.", "Åtgärder är också ändringar. Gör det uttalat."],
          ["One shared action log with announced changes.", "En gemensam åtgärdslogg med meddelade ändringar."],
          [["Ask: who knew the rollback used that account?", "Fråga: vem visste att tillbakarullningen använde det kontot?"]]
        )
      },
      {
        id: "p7",
        priority: 3,
        clock: 600,
        title: L(["They used your outage", "De använde ert avbrott"]),
        twist: L(["The phishing lure quoted your own status page. The attacker watched the outage and wrote the email around it.", "Nätfiskemeddelandet citerade er egen driftstatussida. Angriparen bevakade avbrottet och skrev meddelandet kring det."]),
        twistKind: "cause",
        assumptionChallenged: L(["The phishing was a coincidence too.", "Nätfisket var också ett sammanträffande."]),
        reveals: ["hf-lure"],
        narrative: L([
          "{{time.T+600|clock}}. The incident-response partner compares the email with your status page.",
          "Klockan {{time.T+600|clock}}. Incidentpartnern jämför meddelandet med er driftstatussida."
        ]),
        injects: [
          inj("i7-1", 600, "threatIntel", "irRetainer", "medium", "confirmed", [
            "The phishing email copies the wording of your status update at {{time.T-15|clock}}, and was sent ten minutes after it. This group watches status pages for opportunities.",
            "Nätfiskemeddelandet kopierar formuleringen i er driftstatusuppdatering klockan {{time.T-15|clock}} och skickades tio minuter efter den. Den här gruppen bevakar driftstatussidor efter möjligheter."
          ], { reveals: ["hf-lure"], tests: ["lo3"] })
        ],
        charts: [{
          id: "c7-timeline", type: "timeline",
          title: L(["How the fires lined up", "Hur bränderna föll på plats"]),
          data: () => ({ events: [
            { at: -25, kind: "inject", label: L(["Database change fails", "Databasändringen misslyckas"]) },
            { at: -15, kind: "inject", label: L(["Status page updated", "Driftstatussidan uppdateras"]) },
            { at: -5, kind: "attacker", label: L(["Phishing sent", "Nätfisket skickas"]) },
            { at: 25, kind: "attacker", label: L(["Admin enters password", "Administratören anger lösenordet"]) },
            { at: 35, kind: "attacker", label: L(["Admin account used", "Administratörskontot används"]) }
          ] })
        }],
        questions: {
          technical: [
            q("What should status updates say, and not say?", "Vad bör driftstatusuppdateringar säga, och inte säga?", ["itOps"]),
            q("How do you warn staff during the next outage?", "Hur varnar ni personalen under nästa avbrott?", ["socLead", "comms"]),
            q("Is your action log helping now?", "Hjälper er åtgärdslogg nu?", ["itOps"], "d6")
          ],
          executive: [
            q("Is transparency on the status page a risk?", "Är öppenheten på driftstatussidan en risk?", ["comms", "ciso"]),
            q("Should outages automatically trigger a phishing warning?", "Bör avbrott automatiskt utlösa en varning för nätfiske?", ["ciso"]),
            q("Would you rebalance your people differently in hour one, knowing this?", "Skulle ni ha fördelat personerna annorlunda den första timmen, med den här vetskapen?", ["incidentCommander"], "d2")
          ]
        },
        challenges: [ch("Customers rely on the status page.", "Kunderna förlitar sig på driftstatussidan.")],
        decision: dec("d7", "ciso", ["What do you change?", "Vad ändrar ni?"], [
          ["Keep the status page open, but send an automatic staff warning about themed phishing with every outage.", "Behåll en öppen driftstatussida, men skicka en automatisk varning till personalen om nätfiske med avbrottet som tema vid varje avbrott."],
          ["Make the status page less detailed.", "Gör driftstatussidan mindre detaljerad."],
          ["Leave it as it is.", "Låt det vara som det är."]
        ], {
          knowns: [["The attacker exploited your outage.", "Angriparen utnyttjade ert avbrott."]],
          uncertainties: [["Whether this will happen again.", "Om det här kommer att hända igen."]],
          tradeoffs: {
            operational: ["Less detail frustrates customers.", "Mindre detaljer frustrerar kunderna."],
            security: ["Staff warnings cost nothing.", "Varningar till personalen kostar ingenting."],
            legal: ["No change.", "Ingen förändring."],
            reputational: ["Transparency is worth keeping.", "Öppenheten är värd att behålla."]
          },
          evaluation: [["Keeps transparency and adds a staff warning", "Behåller öppenheten och lägger till en varning till personalen"]]
        }),
        facilitator: fac(
          ["Coincidences can be exploited. That's the nuance here.", "Sammanträffanden kan utnyttjas. Det är nyansen här."],
          ["An automatic phishing warning tied to outages.", "En automatisk varning för nätfiske kopplad till avbrott."],
          [["Ask: what did your status page say?", "Fråga: vad stod det på er driftstatussida?"]]
        )
      },
      {
        id: "p8",
        priority: 4,
        clock: 1080,
        title: L(["Running on empty", "På reservtanken"]),
        twist: L(["The same {{num.responders}} people have been working for {{num.hoursAwake}} hours. Mistakes are starting.", "Samma {{num.responders}} personer har arbetat i {{num.hoursAwake}} timmar. Misstagen börjar komma."]),
        twistKind: "impact",
        assumptionChallenged: L(["The team can keep going until it's over.", "Teamet kan hålla på tills det är över."]),
        narrative: L([
          "Late night. The service is back and the attacker is out — probably.",
          "Sent på natten. Tjänsten är tillbaka och angriparen är ute – troligen."
        ]),
        injects: [
          inj("i8-1", 1080, "employeeReport", "employee", "medium", "confirmed", [
            "A responder mistyped a firewall change and briefly blocked the VPN. They have been awake for {{num.hoursAwake}} hours.",
            "En av personerna i hanteringen skrev fel i en brandväggsändring och blockerade VPN en stund. De har varit vakna i {{num.hoursAwake}} timmar."
          ], { tests: ["lo2"] })
        ],
        questions: {
          technical: [
            q("What must be handed over, and to whom?", "Vad måste lämnas över, och till vem?", ["socLead", "itOps"]),
            q("What monitoring runs overnight?", "Vilken bevakning körs under natten?", ["socLead"]),
            q("Does the action log make handover possible?", "Gör åtgärdsloggen en överlämning möjlig?", ["itOps"], "d6")
          ],
          executive: [
            q("Who sends people home, and who takes over?", "Vem skickar hem folk, och vem tar över?", ["incidentCommander", "hr"]),
            q("How do you staff for three fires next time?", "Hur bemannar ni för tre bränder nästa gång?", ["cio", "ciso"]),
            q("Which first-hour decision would you most like to have made differently?", "Vilket beslut från den första timmen skulle ni helst ha fattat annorlunda?", ["incidentCommander"], "d1")
          ]
        },
        challenges: [ch("Nobody else knows the systems as well.", "Ingen annan känner systemen lika väl.")],
        decision: dec("d8", "incidentCommander", ["What do you do with the team?", "Vad gör ni med teamet?"], [
          ["Hand over to the response partner and a fresh shift, send the team home and resume in the morning.", "Lämna över till incidentpartnern och ett nytt skift, skicka hem teamet och återuppta på morgonen."],
          ["Keep a skeleton crew overnight.", "Behåll en minimal bemanning under natten."],
          ["Keep going until everything is closed.", "Fortsätt tills allt är stängt."]
        ], {
          knowns: [["The team is exhausted.", "Teamet är utmattat."]],
          uncertainties: [["Whether the attacker is truly out.", "Om angriparen verkligen är ute."]],
          tradeoffs: {
            operational: ["A handover risks losing context.", "En överlämning riskerar att sammanhang går förlorat."],
            security: ["Exhausted people make dangerous mistakes.", "Utmattade människor gör farliga misstag."],
            legal: ["Working-time rules apply in a crisis too.", "Arbetstidsreglerna gäller även i en kris."],
            reputational: ["Burnt-out staff leave.", "Utbränd personal slutar."]
          },
          evaluation: [["Plans rest and handover deliberately", "Planerar vila och överlämning medvetet"]]
        }),
        facilitator: fac(
          ["End on people and capacity. This is where many plans are silent.", "Avsluta med människor och kapacitet. Det är här många planer är tysta."],
          ["A structured handover and rest for the team.", "En strukturerad överlämning och vila för teamet."],
          [["Ask: does your plan say when people must rest?", "Fråga: säger er plan när folk måste vila?"]]
        )
      }
    ],

    resolution: {
      type: "resolved",
      text: L([
        "The outage is fixed, the attacker is removed before the backups go, and the organisation adopts single incident command, a shared action log and planned rest.",
        "Avbrottet åtgärdas, angriparen avlägsnas innan säkerhetskopiorna försvinner, och organisationen inför en enda incidentledning, en gemensam åtgärdslogg och planerad vila."
      ])
    },

    debrief: {
      keyLessons: [
        L(["Visibility is not priority; quiet incidents can be the worst.", "Synlighet är inte prioritet; tysta incidenter kan vara de värsta."]),
        L(["One incident commander, even when leaders outrank them.", "En incidentledare, även när cheferna har högre rang."]),
        L(["Coincidences happen, and attackers exploit them.", "Sammanträffanden händer, och angripare utnyttjar dem."]),
        L(["Response actions are changes; coordinate them.", "Åtgärder är ändringar; samordna dem."])
      ],
      assumptionsVsReality: [
        avr(["One attack behind everything.", "Ett angrepp bakom allt."], ["The outage was a failed change.", "Avbrottet var en misslyckad ändring."], "p2"),
        avr(["Phishing was a nuisance.", "Nätfisket var ett irritationsmoment."], ["It delivered privileged access.", "Det gav privilegierad åtkomst."], "p3"),
        avr(["Everyone knows who leads.", "Alla vet vem som leder."], ["Two leaders gave conflicting orders.", "Två chefer gav motstridiga order."], "p4")
      ],
      strengthsToLookFor: [
        L(["Naming a single commander early", "Att tidigt utse en enda ledare"]),
        L(["Moving people off the visible fire", "Att flytta personer från den synliga branden"]),
        L(["Protecting backups first", "Att skydda säkerhetskopiorna först"])
      ],
      commonGaps: [
        L(["Everyone on the customer outage", "Alla på kundavbrottet"]),
        L(["Leaders giving orders directly", "Chefer som ger order direkt"]),
        L(["No plan for rest", "Ingen plan för vila"])
      ],
      suggestedActions: [
        act(["Define incident command that applies across concurrent incidents.", "Definiera en incidentledning som gäller för samtidiga incidenter."], "incidentCommander", "high"),
        act(["Keep a shared action log during incidents.", "För en gemensam åtgärdslogg under incidenter."], "itOps", "medium"),
        act(["Send an automatic phishing warning with every outage notice.", "Skicka en automatisk varning för nätfiske vid varje meddelande om avbrott."], "comms", "medium"),
        act(["Arrange surge capacity with a response partner.", "Ordna förstärkning med en incidentpartner."], "ciso", "high"),
        act(["Plan shifts and rest for long incidents.", "Planera skift och vila för långa incidenter."], "hr", "medium")
      ]
    }
  });
})();
