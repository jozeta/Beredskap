/*
 * b10-storm-outage.js — "The Storm and the Silence" (branching, regional crisis).
 *
 * A storm takes out power and most mobile coverage across the region on a
 * weekday evening. No attacker at first; then opportunists phish staff and
 * pose as the helpdesk. Spine: lights out → staff safety → the data room →
 * customers → the phishing → day two → costs → back to normal → the
 * continuity plan → lessons. Alternative: failing over to the secondary site.
 * Break-away on day two: telling the press it was a cyberattack.
 */
(function () {
  "use strict";

  const BK = window.BK;
  const { L, q, inj, act, pg, ask, opt, pb, ir, io, end, vr, rt } = BK.scenarios.h;

  BK.scenarios.register({
    id: "b10-storm-outage",
    version: 1,
    format: "branching",
    category: "regional-crisis",
    archetype: "compound-crisis",
    emblem: "blackout",
    title: L(["The Storm and the Silence", "Stormen och tystnaden"]),
    summary: L([
      "A storm takes out power and most mobile coverage across the region. Nobody attacked you, until the scammers notice that nobody can check anything.",
      "En storm slår ut strömmen och nästan all mobiltäckning i regionen. Ingen har angripit er, tills bedragarna märker att ingen kan kontrollera något."
    ]),
    learningObjectives: [
      { id: "lo1", text: L(["Lead when normal communication channels fail", "Leda när de vanliga kommunikationskanalerna fallerar"]), teaser: L(["Leading when the usual ways are gone", "Att leda när de vanliga vägarna är borta"]) },
      { id: "lo2", text: L(["Put staff safety first in a physical crisis", "Sätta personalens säkerhet först i en fysisk kris"]), teaser: L(["People before systems", "Människor före system"]) },
      { id: "lo3", text: L(["Shut down and restart IT in a controlled order", "Stänga ned och starta upp IT i kontrollerad ordning"]), teaser: L(["Order in stopping and starting", "Ordning när man stänger av och startar"]) },
      { id: "lo4", text: L(["Expect opportunistic attacks during a crisis", "Räkna med opportunistiska angrepp under en kris"]), teaser: L(["Staying alert while everyone is busy", "Att vara vaksam när alla har fullt upp"]) }
    ],
    mitre: ["T1566", "T1656", "T1078", "T1204"],
    frameworks: {
      nistCsf: ["GV.OC", "ID.IM", "PR.AT", "PR.IR", "RS.CO", "RC.RP", "RC.CO"],
      iso27001: ["A.5.24", "A.5.29", "A.5.30", "A.6.3", "A.7.11", "A.8.13", "A.8.14"]
    },
    constraints: { startWindow: "any", sectors: ["logistics", "transport", "manufacturing", "retail"] },
    actor: { types: ["criminal"], motivation: L(["Opportunistic: phishing and fake helpdesk calls during the outage", "Opportunistisk: nätfiske och falska samtal från ”IT-support” under avbrottet"]), capability: "low" },
    variables: {
      onShift: { min: 12, max: 180, scaleBy: "size" },
      fuelHours: { min: 10, max: 24 },
      replicationLag: { min: 2, max: 12 }
    },
    roles: ["incidentCommander", "ceo", "itOps", "facilities", "hr", "comms", "serviceOwner", "dutyOfficer", "ciso", "supplierManager"],

    flags: {
      calledIn: L(["Team called in after waiting overnight", "Teamet inkallat efter att ha väntat över natten"]),
      fallbackComms: L(["Crisis team reached through the fallback channel", "Krisgruppen nådd via reservkanalen"]),
      waited: L(["Waited until morning", "Väntade till morgonen"]),
      staffSafe: L(["Every person on shift accounted for", "Alla i tjänst redovisade"]),
      fuelStretched: L(["Generator fuel stretched", "Generatorbränslet drygat ut"]),
      hardCrash: L(["Data room ran until the power died", "Datarummet gick tills strömmen dog"]),
      phishWarned: L(["Staff warned about storm scams", "Personalen varnad för stormbedrägerier"])
    },

    start: "c1",
    pages: [
      pg("c1", ["Lights out", "Mörker"], [
        "{{time.T+0|weekday|cap}}, {{time.T+0|clock}}. The storm that was forecast for tonight arrives early and harder than expected. Within an hour, head office and two sites have lost power.\n\nMobile calls drop after a few seconds, and messages arrive late or not at all. In the data room, the batteries give you 45 minutes before the generator has to take over. Nobody has attacked you. Nothing works anyway.",
        "{{time.T+0|weekday|cap}}, klockan {{time.T+0|clock}}. Stormen som var utlovad till i natt kommer tidigt och hårdare än väntat. Inom en timme har huvudkontoret och två anläggningar förlorat strömmen.\n\nMobilsamtal bryts efter några sekunder, och meddelanden kommer fram sent eller inte alls. I datahallen ger batterierna er 45 minuter innan reservkraften måste ta över. Ingen har attackerat er. Ingenting fungerar ändå."
      ], {
        injects: [
          inj("b10-1", 5, "advisory", "management", "high", "confirmed", [
            "Extreme weather warning: widespread power cuts expected to last more than 24 hours. Mobile networks degraded. Avoid travel.",
            "Varning för extremt väder: omfattande strömavbrott väntas pågå mer än ett dygn. Mobilnäten är störda. Undvik att resa."
          ], { headline: ["Regional emergency warning", "Regional varning"], tests: ["lo1"] })
        ],
        discuss: [q("If phones and chat don't work, how does the crisis team find each other?", "Om telefon och chatt inte fungerar, hur hittar krisgruppen varandra?", ["incidentCommander", "dutyOfficer"])],
        facilitator: { notes: L(["No attacker yet. The test is whether the organisation can lead without its normal tools.", "Ingen angripare ännu. Provet är om organisationen kan leda utan sina vanliga verktyg."]) },
        interrupts: [
          ir("i1", { chosen: "A" }, ["The fallback in use", "Reservlösningen används"], [
            io(["The team assembles", "Gruppen samlas"], ["One by one the crisis team reaches the meeting point. Within the hour most of them are there, and the satellite phone gets a line out.", "En efter en når krisgruppen mötesplatsen. Inom en timme är de flesta på plats, och satellittelefonen får en förbindelse."], ["Most of the crisis team gathered at the meeting point on the first evening.", "Större delen av krisgruppen samlades på mötesplatsen den första kvällen."]),
            io(["The road is blocked", "Vägen är blockerad"], ["Fallen trees block the only road to the meeting point. Half the team turns back, and the other half is stuck on the wrong side. You need another way to gather.", "Nedfallna träd blockerar den enda vägen till mötesplatsen. Halva gruppen vänder, och andra halvan sitter fast på fel sida. Ni behöver ett annat sätt att samlas."], ["The road to the meeting point was blocked on the first evening.", "Vägen till mötesplatsen var blockerad den första kvällen."], { reopen: true }),
            io(["An old contact list", "En gammal kontaktlista"], ["The satellite phone works, but the printed contact list beside it is years old. Some numbers ring strangers, others nobody at all.", "Satellittelefonen fungerar, men den utskrivna kontaktlistan bredvid den är flera år gammal. En del nummer går till okända, andra till ingen alls."], ["The fallback kit's contact list was years out of date.", "Kontaktlistan i reservlösningen var flera år gammal."])
          ]),
          ir("i2", { notChosen: "A" }, ["No agreed meeting place", "Ingen överenskommen mötesplats"], [
            io(["The chat holds up", "Chatten håller"], ["Enough messages get through for three members of the crisis team to start coordinating. It feels like the team is working.", "Tillräckligt många meddelanden går fram för att tre i krisgruppen ska kunna börja samordna. Det känns som att gruppen fungerar."], ["On the first evening, three crisis team members coordinated over a patchy chat.", "Den första kvällen samordnade tre i krisgruppen via en ostadig chatt."]),
            io(["The network goes silent", "Nätet tystnar"], ["The last mast nearby loses power. No calls, no messages, nothing. Whatever you planned to do now depends on a network that is gone for the night.", "Den sista masten i närheten förlorar strömmen. Inga samtal, inga meddelanden, ingenting. Det ni tänkt göra hänger nu på ett nät som är borta för natten."], ["The mobile network went completely silent for hours on the first evening.", "Mobilnätet var helt tyst i flera timmar den första kvällen."], { reopen: true }),
            io(["Conflicting orders", "Motstridiga besked"], ["The depot gets two instructions through two channels from two managers: one says stay, one says go home. Nobody knows which came last.", "Depån får två besked via två kanaler från två chefer: det ena säger stanna, det andra åk hem. Ingen vet vilket som kom sist."], ["The depot received conflicting instructions on the first evening.", "Depån fick motstridiga besked den första kvällen."])
          ])
        ],
        choice: ask(["How do you get the crisis team together?", "Hur samlar ni krisgruppen?"], ["Uses a pre-agreed fallback: meeting point, landline or radio, without waiting for the network.", "Använder en förutbestämd reservlösning: mötesplats, fast telefon eller radio, utan att vänta på nätet."], [
          opt(["The agreed fallback: meeting point and satellite phone", "Den överenskomna reservlösningen: mötesplats och satellittelefon"], "c2", ["Works if it was agreed and the phone is charged.", "Fungerar om den var överenskommen och telefonen är laddad."], {
            set: "fallbackComms",
            pushback: [
              pb(["The battery is flat", "Batteriet är urladdat"], ["The satellite phone is in a cupboard at head office, and nobody has charged it since it was bought. The meeting point is across town, past fallen trees. Do you send people out on the roads to reach a fallback that may not work?", "Satellittelefonen ligger i ett skåp på huvudkontoret, och ingen har laddat den sedan den köptes. Mötesplatsen ligger på andra sidan stan, förbi nedfallna träd. Skickar ni ut folk på vägarna för att nå en reservlösning som kanske inte fungerar?"]),
              pb(["Half the team never heard of it", "Halva gruppen har aldrig hört talas om den"], ["Several members of the crisis team joined after the fallback was agreed and do not know the meeting point. The others are already driving there in the storm. Who goes to find the rest, and can you lead with half a team?", "Flera i krisgruppen kom till efter att reservlösningen bestämdes och känner inte till mötesplatsen. De andra är redan på väg dit i stormen. Vem letar upp resten, och kan ni leda med en halv grupp?"]),
              pb(["“Isn't this an overreaction?”", "”Är inte det här en överreaktion?”"], ["The CEO, reached on a landline, asks whether it is really necessary to make people drive through a storm for a power cut. Activating the fallback feels bigger than the event. Who decides that tonight is a crisis, and on what grounds?", "Vd, som ni når via fast telefon, undrar om det verkligen behövs att folk kör genom en storm för ett strömavbrott. Att aktivera reservlösningen känns större än händelsen. Vem avgör att det är en kris i kväll, och på vilka grunder?"])
            ]
          }),
          opt(["Keep trying mobile and chat", "Fortsätt försöka med mobil och chatt"], "c2", ["Some messages get through, eventually.", "En del meddelanden kommer fram, till slut."], {
            pushback: [
              pb(["Three replies", "Tre svar"], ["After an hour, three members of the crisis team have replied in the chat. Nobody knows whether the others have seen anything, and decisions are being made by whoever happens to have a signal. Is that a crisis team, and how long do you keep trying?", "Efter en timme har tre i krisgruppen svarat i chatten. Ingen vet om de andra har sett något, och besluten fattas av den som råkar ha täckning. Är det en krisgrupp, och hur länge fortsätter ni försöka?"]),
              pb(["Phones are dying", "Telefonerna dör"], ["Without power, everyone's phones are draining fast from constant retrying. By midnight several will be dead, with nowhere to charge them. Do you keep burning batteries on a network that barely works?", "Utan ström laddas allas telefoner ur snabbt av alla nya försök. Vid midnatt är flera döda, och det finns ingenstans att ladda dem. Fortsätter ni bränna batteri på ett nät som knappt fungerar?"]),
              pb(["Messages out of order", "Meddelanden i fel ordning"], ["Two messages from the depot arrive at once: one says all is fine, the other asks for help. Nobody can tell which was sent last. How do you lead on messages that arrive late and out of sequence?", "Två meddelanden från depån kommer samtidigt: ett säger att allt är lugnt, det andra ber om hjälp. Ingen kan avgöra vilket som skickades sist. Hur leder ni utifrån meddelanden som kommer sent och i fel ordning?"])
            ]
          }),
          opt(["Wait until morning", "Vänta till morgonen"], "c2", ["The night shift is on its own until then.", "Nattskiftet är på egen hand till dess."], {
            set: "waited",
            pushback: [
              pb(["The batteries won't wait", "Batterierna väntar inte"], ["The data room batteries last 45 minutes before the generator must take over. If it fails to start, nobody with authority is there to decide what to shut down. Who owns the data room tonight, if the crisis team meets in the morning?", "Batterierna i datahallen räcker i 45 minuter innan reservkraften måste ta över. Om den inte startar finns ingen med mandat där som kan bestämma vad som ska stängas av. Vem äger datahallen i natt, om krisgruppen samlas först i morgon?"]),
              pb(["The depot asks for orders", "Depån vill ha besked"], ["A landline call gets through from the depot: the night shift wants to know whether to stay or go home, and the roads are closing. Nobody who can answer is reachable. Who gives them an answer tonight?", "Ett samtal från depån går fram på fast telefon: nattskiftet vill veta om de ska stanna eller åka hem, och vägarna stängs. Ingen som kan svara går att nå. Vem ger dem besked i natt?"]),
              pb(["What will morning change?", "Vad ändras på morgonen?"], ["The warning says the power cuts may last more than a day. In the morning the network will be just as poor, and you will have lost a night. What do you expect to be easier then than now?", "Varningen säger att strömavbrotten kan pågå mer än ett dygn. På morgonen är nätet lika dåligt, och ni har förlorat en natt. Vad räknar ni med ska vara lättare då än nu?"])
            ]
          })
        ])
      }),

      pg("c2", ["The night shift", "Nattskiftet"], [
        "{{num.onShift}} people are on the night shift at the depot, loading tomorrow's deliveries.\n\nThe police are closing roads because of fallen trees, and some of the staff live far out in the countryside. Their families are calling, when the calls get through, to ask whether they are coming home.",
        "{{num.onShift}} personer arbetar nattskift på depån och lastar morgondagens leveranser.\n\nPolisen stänger vägar på grund av nedfallna träd, och en del av personalen bor långt ute på landet. Deras familjer ringer, när samtalen går fram, och frågar om de kommer hem."
      ], {
        variants: [vr("waited", [
          "Nobody gathered the crisis team overnight. By morning you learn that one of the {{num.onShift}} people on the night shift drove home through a closed road and hit a fallen tree.\n\nThey are injured but alive, and in hospital. Nobody at the company knew where they were for six hours. The rest of the shift is still at the depot, waiting for instructions.",
          "Ingen samlade krisledningen under natten. På morgonen får ni veta att en av de {{num.onShift}} personerna på nattskiftet körde hem på en avstängd väg och krockade med ett nedfallet träd.\n\nPersonen är skadad men vid liv, och ligger på sjukhus. Ingen på företaget visste var hen var på sex timmar. Resten av skiftet är fortfarande kvar på depån och väntar på besked."
        ], ["Because nobody led the night, people made their own decisions.", "Eftersom ingen ledde under natten fattade folk egna beslut."])],
        discuss: [q("How do you know everyone is safe if you can't call them?", "Hur vet ni att alla är i säkerhet om ni inte kan ringa dem?", ["hr", "facilities"])],
        interrupts: [
          ir("i1", { chosen: "A" }, ["Holding the night shift", "Nattskiftet stannar"], [
            io(["Everyone counted", "Alla räknade"], ["HR and the shift leader go through the list name by name. Every person on the night shift is accounted for, and families are told where they are.", "HR och skiftledaren går igenom listan namn för namn. Varje person på nattskiftet är redovisad, och familjerna får veta var de är."], ["Every person on the night shift was accounted for on the first night.", "Varje person på nattskiftet var redovisad den första natten."]),
            io(["The loading bay roof", "Taket över lastkajen"], ["The wind tears open the roof over the loading bay. Nobody is hurt, but that part of the depot is no longer a safe place to keep people.", "Vinden river upp taket över lastkajen. Ingen skadas, men den delen av depån är inte längre en säker plats att hålla folk på."], ["The loading bay roof was torn open on the first night; that area is closed.", "Taket över lastkajen slets upp den första natten; den delen är avstängd."], { reopen: true }),
            io(["One name too many", "Ett namn för mycket"], ["The headcount comes out one higher than the shift rota. Someone is on site whom nobody listed, and nobody can yet say who.", "Räkningen ger en person mer än skiftschemat. Någon är på plats som ingen har listat, och ingen kan ännu säga vem."], ["One person on site that night was not on the shift rota.", "En person på plats den natten fanns inte med på skiftschemat."])
          ]),
          ir("i2", { notChosen: "A" }, ["Nobody holds the shift", "Ingen håller ihop skiftet"], [
            io(["Most made it home", "De flesta kom hem"], ["Word trickles in through the night: most of the shift say they got home. It looks as if things worked out.", "Under natten droppar beskeden in: de flesta i skiftet säger att de kom hem. Det ser ut som att det ordnade sig."], ["By morning, most of the night shift had reported getting home.", "På morgonen hade de flesta på nattskiftet meddelat att de kommit hem."]),
            io(["A family calls", "En familj ringer"], ["A landline call gets through: a family says their relative left the depot hours ago and has not arrived. Nobody at the company can say where they are.", "Ett samtal på fast telefon går fram: en familj säger att deras anhörige lämnade depån för flera timmar sedan och inte har kommit fram. Ingen på företaget kan säga var personen är."], ["A family reported a night-shift worker missing during the first night.", "En familj anmälde en person på nattskiftet som saknad under den första natten."], { reopen: true }),
            io(["Nobody has the count", "Ingen har siffran"], ["Some staff stayed, some left on their own, some are sleeping in their cars in the yard. Nobody can give you a number.", "En del stannade, en del åkte på eget initiativ, några sover i bilarna på gården. Ingen kan ge er en siffra."], ["Nobody had a full count of who stayed at the depot on the first night.", "Ingen hade en fullständig bild av vilka som stannade på depån den första natten."])
          ])
        ],
        choice: ask(["What about the people on shift?", "Vad gäller för dem som är i tjänst?"], ["Accounts for everyone and keeps them safe where they are.", "Redovisar alla och håller dem säkra där de är."], [
          opt(["Account for everyone; keep them safe on site until roads open", "Redovisa alla; håll dem säkra på plats tills vägarna öppnar"], "l1", ["Food, heat and a list of names.", "Mat, värme och en lista med namn."], {
            set: "staffSafe",
            pushback: [
              pb(["No heat, no beds", "Ingen värme, inga sängar"], ["Without power the depot has no heating, a few vending machines and nowhere to sleep. Keeping {{num.onShift}} people there all night means cold, hungry and exhausted staff by dawn. How long can you hold them, and what do you give them?", "Utan ström har depån ingen värme, några varuautomater och ingenstans att sova. Att hålla kvar {{num.onShift}} personer hela natten betyder frusen, hungrig och utmattad personal i gryningen. Hur länge kan ni hålla dem kvar, och vad ger ni dem?"]),
              pb(["A child at home", "Ett barn hemma"], ["One of the shift has a small child at home with a babysitter who must leave soon. They say they are driving home, closed road or not. Do you order them to stay, help them get home, or let them decide?", "En i skiftet har ett litet barn hemma med en barnvakt som snart måste gå. Personen säger att hen kör hem, avstängd väg eller inte. Beordrar ni hen att stanna, hjälper ni hen hem, eller låter ni hen bestämma själv?"]),
              pb(["Is the depot safer?", "Är depån säkrare?"], ["Facilities reports that the wind has torn part of the depot roof and is still getting stronger. Keeping people on site assumes the building is safer than the roads. Who has checked that, and what if it isn't?", "Fastighet rapporterar att vinden har slitit upp en del av depåns tak och fortfarande tilltar. Att hålla kvar folk förutsätter att byggnaden är säkrare än vägarna. Vem har kontrollerat det, och vad gör ni om den inte är det?"])
            ]
          }),
          opt(["Send them home", "Skicka hem dem"], "l1", ["On closed roads, in the dark.", "På avstängda vägar, i mörker."], {
            pushback: [
              pb(["Back roads in the dark", "Småvägar i mörkret"], ["Since the decision, the police have closed the main road out of the depot. Staff are looking for back roads in the dark, through forest. Do you know which routes they are taking, and who checks that they arrive?", "Sedan beslutet har polisen stängt huvudvägen från depån. Personalen letar efter småvägar i mörkret, genom skog. Vet ni vilka vägar de tar, och vem kontrollerar att de kommer fram?"]),
              pb(["Nobody counts them home", "Ingen räknar in dem"], ["With mobile coverage down, nobody can confirm who got home. By midnight you have heard from a handful. If a family calls asking where someone is, is “we sent them home” an answer?", "Med mobilnätet nere kan ingen bekräfta vem som kom hem. Vid midnatt har ni hört av ett fåtal. Om en familj ringer och frågar var någon är, är ”vi skickade hem dem” ett svar?"]),
              pb(["The safety rep objects", "Skyddsombudet protesterar"], ["The safety representative at the depot says sending people out on closed roads in a storm breaks your duty of care, and asks for the decision in writing. Do you put your name to it, or reverse it?", "Skyddsombudet på depån säger att det strider mot ert arbetsgivaransvar att skicka ut folk på avstängda vägar i en storm, och begär beslutet skriftligt. Skriver ni under, eller ändrar ni beslutet?"])
            ]
          }),
          opt(["Leave it to the site managers", "Låt platschefer avgöra"], "l1", ["Sensible delegation without a check that it happened.", "Förnuftig delegering utan kontroll av att det skedde."], {
            pushback: [
              pb(["One manager isn't there", "En chef är inte på plats"], ["The manager at one of the sites left early this evening to check on family. Nobody is in charge there, and the staff don't know they were supposed to wait for a decision. Who picks up a site you delegated to someone who is not there?", "Chefen på en av anläggningarna gick tidigt i kväll för att se till sin familj. Ingen har ansvaret där, och personalen vet inte att de skulle vänta på ett beslut. Vem tar hand om en anläggning som ni delegerade till någon som inte är där?"]),
              pb(["Two sites, two rules", "Två anläggningar, två regler"], ["One site manager keeps everyone on site; another sends them all home. Staff compare notes on the few calls that get through and ask why the rules differ. Do you let both stand, or overrule one of your managers?", "En platschef håller kvar alla; en annan skickar hem alla. Personalen jämför på de få samtal som går fram och undrar varför reglerna skiljer sig. Låter ni båda gälla, eller kör ni över en av era chefer?"]),
              pb(["No list of names", "Ingen namnlista"], ["HR asks for a list of everyone on shift and where they are now. The site managers have their own lists, which you cannot reach. If something happens tonight, can you say who was at work?", "HR ber om en lista över alla i tjänst och var de är just nu. Platscheferna har egna listor, som ni inte kommer åt. Om något händer i natt, kan ni då säga vem som var på jobbet?"])
            ]
          })
        ])
      }),

      pg("l1", ["Fuel", "Bränsle"], [
        "The data room's generator starts as it should. But someone checks the tank: it holds fuel for {{num.fuelHours}} hours at full load.\n\nThe fuel supplier cannot reach you until the roads are cleared, and nobody knows when that will be. Every system you keep running burns fuel you may need later.",
        "Datahallens reservkraft startar som den ska. Men någon kontrollerar tanken: den räcker i {{num.fuelHours}} timmar vid full last.\n\nBränsleleverantören kan inte nå er förrän vägarna är röjda, och ingen vet när det blir. Varje system ni låter vara igång förbrukar bränsle som ni kanske behöver senare."
      ], {
        long: true,
        skipTo: "c3",
        interrupts: [
          ir("i1", { chosen: "A" }, ["Load shed", "Lasten bortkopplad"], [
            io(["The tank stretches", "Tanken räcker längre"], ["The generator settles at a low, steady load. Facilities recalculates and now expects the fuel to last well beyond {{num.fuelHours}} hours.", "Reservkraften stabiliseras på en låg, jämn last. Fastighet räknar om och tror nu att bränslet räcker en bra bit längre än {{num.fuelHours}} timmar."], ["With load shed, the fuel lasts well beyond {{num.fuelHours}} hours.", "Med lasten bortkopplad räcker bränslet en bra bit längre än {{num.fuelHours}} timmar."]),
            io(["The wrong system went down", "Fel system gick ned"], ["Switching off a “non-critical” server takes the warehouse system's database with it. The depot loses sight of what is loaded where. What is critical has to be decided again.", "När en ”icke-kritisk” server stängs av följer lagersystemets databas med. Depån ser inte längre vad som är lastat var. Vad som är kritiskt måste avgöras igen."], ["A shutdown on the first night briefly took the warehouse system down with it.", "En avstängning den första natten tog en stund ned lagersystemet också."], { reopen: true }),
            io(["Two readings", "Två mätvärden"], ["The tank gauge and a manual dip give different readings, hours apart in what they mean. Nobody knows which one to trust.", "Tankmätaren och en manuell pejling visar olika värden, som skiljer flera timmar. Ingen vet vilket man ska lita på."], ["On the first night the tank gauge and the manual reading disagreed.", "Den första natten stämde inte tankmätaren och den manuella pejlingen överens."])
          ]),
          ir("i2", { notChosen: "A" }, ["Everything still running", "Allt går fortfarande"], [
            io(["A tanker, maybe", "En tankbil, kanske"], ["The fuel supplier gets through on a landline: they hope to get a tanker to you once a road is cleared. They promise nothing.", "Bränsleleverantören når fram via fast telefon: de hoppas få fram en tankbil när en väg är röjd. De lovar ingenting."], ["The fuel supplier hopes to get a tanker through, but promises nothing.", "Bränsleleverantören hoppas få fram en tankbil, men lovar ingenting."]),
            io(["Burning faster", "Förbrukar snabbare"], ["Facilities checks the tank again an hour later. At full load the generator is burning faster than its rating, and the fuel will run out hours sooner than you thought.", "Fastighet kontrollerar tanken igen en timme senare. Vid full last förbrukar reservkraften mer än den är märkt för, och bränslet tar slut flera timmar tidigare än ni trodde."], ["The generator is burning fuel faster than its rating at full load.", "Reservkraften förbrukar mer bränsle än den är märkt för vid full last."], { reopen: true }),
            io(["Nobody owns the reserve", "Ingen äger reserven"], ["Facilities says IT decides what runs, and IT says facilities owns the fuel. Nobody will name a reserve level.", "Fastighet säger att IT bestämmer vad som går, och IT säger att fastighet äger bränslet. Ingen vill ange en reservnivå."], ["Nobody has formally taken ownership of the fuel reserve.", "Ingen har formellt tagit ansvar för bränslereserven."])
          ])
        ],
        choice: ask(["How do you use the fuel?", "Hur använder ni bränslet?"], ["Sheds non-critical load to stretch the fuel.", "Kopplar bort det som inte är kritiskt för att dryga ut bränslet."], [
          opt(["Shut down everything non-critical to stretch it", "Stäng ned allt som inte är kritiskt för att dryga ut det"], "c3", ["Choices about what matters, made calmly now.", "Beslut om vad som är viktigt, fattade i lugn och ro nu."], {
            set: "fuelStretched",
            pushback: [
              pb(["Everyone is critical", "Alla är kritiska"], ["Sales says the order system is critical, the warehouse says theirs is, and finance wants email. Nobody wrote down a priority list beforehand. Who has the final word tonight, and on what basis?", "Försäljning säger att ordersystemet är kritiskt, lagret säger att deras är det, och ekonomi vill ha e-posten. Ingen skrev ned en prioriteringslista i förväg. Vem har sista ordet i natt, och på vilken grund?"]),
              pb(["The cold room", "Kylrummet"], ["Facilities points out that the cold room for chilled goods shares the same generator and is not on the IT list of critical load. Switching it off saves fuel and spoils stock. Do you spend diesel on goods or on servers?", "Fastighet påpekar att kylrummet för kylvaror går på samma reservkraft och inte finns med på IT:s lista över kritisk last. Att stänga av det sparar bränsle men förstör varor. Lägger ni dieseln på varorna eller på servrarna?"]),
              pb(["Will they start again?", "Startar de igen?"], ["IT warns that some of the older servers on the shutdown list have not been restarted in years, and nobody is sure they will come back. Saving fuel may mean breaking them. Do you take that risk now?", "IT varnar för att några av de äldre servrarna på avstängningslistan inte har startats om på flera år, och ingen vet säkert att de kommer tillbaka. Att spara bränsle kan innebära att de går sönder. Tar ni den risken nu?"])
            ]
          }),
          opt(["Run everything", "Kör allt"], "c3", ["Until the tank is empty.", "Tills tanken är tom."], {
            pushback: [
              pb(["The hour the tank runs dry", "Timmen då tanken tar slut"], ["{{num.fuelHours}} hours at full load, and the supplier cannot say when the roads will clear. If the outage lasts longer, the generator stops in the night with everything running. What is your plan for that hour?", "{{num.fuelHours}} timmar vid full last, och leverantören kan inte säga när vägarna röjs. Om avbrottet varar längre stannar reservkraften mitt i natten med allt igång. Vad är er plan för den timmen?"]),
              pb(["Burning diesel on nothing", "Diesel till ingenting"], ["IT notes that the offices are dark and empty, yet test servers, meeting-room screens and backup jobs all run on the generator. Is “run everything” a decision, or just not deciding?", "IT konstaterar att kontoren är mörka och tomma, men testservrar, skärmar i mötesrum och säkerhetskopieringar går ändå på reservkraften. Är ”kör allt” ett beslut, eller bara att låta bli att besluta?"]),
              pb(["Facilities wants it in writing", "Fastighet vill ha det skriftligt"], ["The facilities lead asks for a written decision on how much fuel to keep in reserve, since they will be the one blamed if it runs out. Can you give a number, and who signs it?", "Fastighetsansvarig ber om ett skriftligt beslut om hur mycket bränsle som ska hållas i reserv, eftersom det är hen som får skulden om det tar slut. Kan ni ge en siffra, och vem skriver under?"])
            ]
          })
        ])
      }),

      pg("c3", ["The data room", "Datarummet"], [
        "Day one, evening. Power is still out and the forecast says it may take another day.\n\nThe data room runs everything: the warehouse system, orders, email and the customer portal. If the fuel runs out with the servers still running, they crash hard, and some may not come back.",
        "Dag ett, kväll. Strömmen är fortfarande borta och prognosen säger att det kan ta ett dygn till.\n\nDatahallen driver allt: lagersystemet, orderhanteringen, e-posten och kundportalen. Om bränslet tar slut medan servrarna är igång kraschar de hårt, och en del kanske inte kommer tillbaka."
      ], {
        variants: [vr("fuelStretched", [
          "Day one, evening. Because non-critical systems were shut down, the generator will last about thirty hours instead of {{num.fuelHours}}.\n\nPower is still out, and the forecast says it may take another day. Thirty hours is more time, but not enough to be sure. The question is how to use it.",
          "Dag ett, kväll. Eftersom icke-kritiska system stängdes av räcker reservkraften i ungefär trettio timmar i stället för {{num.fuelHours}}.\n\nStrömmen är fortfarande borta, och prognosen säger att det kan ta ett dygn till. Trettio timmar är mer tid, men inte tillräckligt för att vara säker. Frågan är hur ni använder den."
        ], ["Because you stretched the fuel, you have time to choose.", "Eftersom ni drygade ut bränslet har ni tid att välja."])],
        interrupts: [
          ir("i1", { chosen: "A" }, ["The controlled shutdown", "Den kontrollerade nedstängningen"], [
            io(["Clean and quiet", "Rent och lugnt"], ["System by system, the data room goes quiet. Every server stops cleanly, and IT is confident the restart will be easy.", "System för system tystnar datahallen. Varje server stannar rent, och IT är säkra på att omstarten blir enkel."], ["The data room was shut down cleanly, one system at a time.", "Datahallen stängdes ned rent, ett system i taget."]),
            io(["The depot goes blind", "Depån blir blind"], ["With the warehouse system down, the depot cannot see what is loaded on which truck. Staff start unloading to check by hand. The warehouse lead demands the system back on.", "Med lagersystemet nere kan depån inte se vad som är lastat på vilken bil. Personalen börjar lasta av för att kontrollera för hand. Lageransvarig kräver att systemet startas igen."], ["With systems shut down, the depot could not see what was loaded where.", "Med systemen nedstängda kunde depån inte se vad som var lastat var."], { reopen: true }),
            io(["One server refuses", "En server vägrar"], ["One old server will not shut down and has to be switched off at the plug. Nobody can say whether it will come back.", "En gammal server går inte att stänga ned och måste slås av vid kontakten. Ingen kan säga om den kommer tillbaka."], ["One old server had to be switched off at the plug.", "En gammal server fick slås av vid kontakten."])
          ]),
          ir("i2", { notChosen: "A" }, ["No clean shutdown", "Ingen ren nedstängning"], [
            io(["Orders still coming", "Ordrarna kommer fortfarande"], ["For now, the order system keeps taking orders and sales are delighted. Keeping things running looks like the right call.", "Än så länge tar ordersystemet emot beställningar och försäljning är förtjust. Att hålla igång ser ut att vara rätt beslut."], ["The order system kept taking orders into the first night.", "Ordersystemet fortsatte ta emot beställningar en bit in på första natten."]),
            io(["A generator stutter", "Reservkraften hackar"], ["The generator stutters for a few seconds. Several systems restart on their own and come back slowly. IT asks whether you really want to ride this out.", "Reservkraften hackar några sekunder. Flera system startar om av sig själva och kommer långsamt tillbaka. IT frågar om ni verkligen vill rida ut det här."], ["A brief generator stutter restarted several systems; all came back.", "Ett kort avbrott i reservkraften startade om flera system; alla kom tillbaka."], { reopen: true }),
            io(["IT is split", "IT är oense"], ["Half the IT team wants to shut down now, the other half wants to run on. Both have good arguments, and nobody is sure.", "Halva IT-teamet vill stänga ned nu, andra halvan vill köra vidare. Båda har goda argument, och ingen är säker."], ["The IT team was split over whether to shut down.", "IT-teamet var oense om huruvida man skulle stänga ned."])
          ])
        ],
        choice: ask(["What do you do with the data room?", "Vad gör ni med datarummet?"], ["Shuts down in a controlled order rather than letting systems crash.", "Stänger ned i kontrollerad ordning i stället för att låta systemen krascha."], [
          opt(["A controlled shutdown before the fuel runs out", "En kontrollerad nedstängning innan bränslet tar slut"], "c4", ["Clean restart later.", "En ren omstart senare."], {
            pushback: [
              pb(["Going dark on purpose", "Att släcka ned med flit"], ["A shutdown takes the customer portal, orders and email offline while the fuel could still last for hours. Customers who could still reach you will now find nothing. Are you ready to switch off service you could still give?", "En nedstängning tar ned kundportalen, ordrarna och e-posten medan bränslet fortfarande skulle räcka i timmar. Kunder som fortfarande kunde nå er hittar nu ingenting. Är ni beredda att stänga av drift som ni fortfarande kunde leverera?"]),
              pb(["The warehouse wants an exception", "Lagret vill ha ett undantag"], ["The warehouse lead objects: without the warehouse system, the depot cannot even see what is loaded on which truck. They want it kept running as long as there is fuel. Do you make an exception, and is it still a controlled shutdown if you do?", "Lageransvarig protesterar: utan lagersystemet kan depån inte ens se vad som är lastat på vilken bil. Hen vill att det går så länge det finns bränsle. Gör ni ett undantag, och är det då fortfarande en kontrollerad nedstängning?"]),
              pb(["Nobody knows the order", "Ingen kan ordningen"], ["Nobody can find a written shutdown order. The one person who knows which systems depend on which is at home with no signal. Do you shut down from memory and guesswork, or wait until you reach them?", "Ingen hittar en skriven ordning för nedstängning. Den enda som vet vilka system som hänger ihop är hemma utan täckning. Stänger ni ned efter minne och gissningar, eller väntar ni tills ni når hen?"])
            ]
          }),
          opt(["Keep it running until the power dies", "Håll det igång tills strömmen dör"], "c4", ["Every hour of service, then a hard crash.", "Varje timme av drift, sedan en hård krasch."], {
            set: "hardCrash",
            pushback: [
              pb(["Who stays on watch?", "Vem håller vakt?"], ["If the tank runs dry in the night, someone should be in the data room when it happens. The IT team has been awake since the storm began. Who stays, for how long, and what do they do when the lights go out?", "Om tanken tar slut i natt borde någon vara i datahallen när det händer. IT-teamet har varit vaket sedan stormen började. Vem stannar, hur länge, och vad gör den personen när ljuset går?"]),
              pb(["When was the last restore?", "När gjordes senaste återläsningen?"], ["IT admits that a full restore from backup has not been tested in a long time. Letting the servers crash means trusting those backups if something does not come back. How sure are you that they work?", "IT medger att en fullständig återläsning från säkerhetskopia inte har testats på länge. Att låta servrarna krascha innebär att ni litar på de kopiorna om något inte kommer tillbaka. Hur säkra är ni på att de fungerar?"]),
              pb(["Hours now, nothing later", "Timmar nu, ingenting sen"], ["The forecast is uncertain: power may take longer than a day. Running until the end buys a few more hours of portal and spends your whole reserve at once. Is that worth having nothing left if the outage drags on?", "Prognosen är osäker: strömmen kan dröja längre än ett dygn. Att köra till slutet ger några timmar till med kundportal och gör av med hela reserven på en gång. Är det värt att inte ha något kvar om avbrottet drar ut på tiden?"])
            ]
          }),
          opt(["Fail over to the secondary site", "Växla över till den sekundära anläggningen"], "c3b", ["Two hundred kilometres away, with power.", "Tvåhundra kilometer bort, med ström."], {
            pushback: [
              pb(["Nobody on site there", "Ingen på plats där"], ["Nobody from IT is at the secondary site, and the roads between the towns are closed. Anything that breaks there must be fixed remotely, over connections that keep dropping. Who runs your systems if something goes wrong there tonight?", "Ingen från IT finns på reservanläggningen, och vägarna mellan orterna är avstängda. Allt som går sönder där måste lagas på distans, över förbindelser som hela tiden bryts. Vem driver era system om något går fel där i natt?"]),
              pb(["Tested once, years ago", "Testat en gång, för länge sedan"], ["IT admits the switchover has been tested once, years ago, and only for email. Doing it for the warehouse and order systems during a storm would be a first. Do you try something new in the middle of a crisis?", "IT medger att övergången har testats en gång, för flera år sedan, och bara för e-posten. Att göra det för lager- och ordersystemen mitt i en storm vore första gången. Provar ni något nytt mitt i en kris?"]),
              pb(["The other site has its own work", "Den andra anläggningen har eget arbete"], ["The manager at the secondary site warns that capacity there is limited: moving your full load will slow their own local systems. They did not agree to this tonight. Who decides whose work comes first?", "Chefen på reservanläggningen varnar för att kapaciteten där är begränsad: hela er last kommer att göra deras egna system långsamma. De har inte gått med på det här i kväll. Vem avgör vems arbete som går först?"])
            ]
          })
        ])
      }),

      pg("c3b", ["The secondary site", "Den sekundära anläggningen"], [
        "The secondary site, in another town, still has power and working connections.\n\nBut data replication between the sites runs {{num.replicationLag}} hours behind. Switching over means losing the most recent orders, deliveries and changes, which someone will have to find and re-enter by hand.",
        "Reservanläggningen, i en annan ort, har fortfarande ström och fungerande förbindelser.\n\nMen datareplikeringen mellan anläggningarna ligger {{num.replicationLag}} timmar efter. Att växla över innebär att de senaste beställningarna, leveranserna och ändringarna försvinner, och någon måste leta upp och lägga in dem för hand."
      ], {
        interrupts: [
          ir("i1", { chosen: "A" }, ["Running from the other site", "Drift från den andra anläggningen"], [
            io(["The switch holds", "Övergången håller"], ["The warehouse and order systems come up at the secondary site, slowly. The customer portal does not come up with them, but the core is running.", "Lager- och ordersystemen kommer igång på reservanläggningen, långsamt. Kundportalen följer inte med, men kärnan är igång."], ["Warehouse and order systems run from the secondary site; the portal does not.", "Lager- och ordersystemen körs från reservanläggningen; kundportalen gör det inte."]),
            io(["A bigger gap", "Ett större glapp"], ["IT finds that some records never reached the secondary site at all, not just the last {{num.replicationLag}} hours. Nobody knows how much is missing.", "IT upptäcker att en del poster aldrig nådde reservanläggningen alls, inte bara de senaste {{num.replicationLag}} timmarna. Ingen vet hur mycket som saknas."], ["Some records never reached the secondary site at all.", "En del poster nådde aldrig reservanläggningen alls."], { reopen: true, meters: { trust: -1 } }),
            io(["Under protest", "Under protest"], ["The secondary site takes your load, but its manager sends a formal complaint: their own systems have slowed to a crawl.", "Reservanläggningen tar er last, men chefen där skickar ett formellt klagomål: deras egna system har blivit mycket långsamma."], ["The secondary site accepted your load under formal protest.", "Reservanläggningen tog emot er last under formell protest."])
          ]),
          ir("i2", { notChosen: "A" }, ["Staying on the primary", "Kvar på den primära"], [
            io(["The generator holds", "Reservkraften håller"], ["The primary generator runs steadily, and nobody has to re-enter anything. For now, staying put looks wise.", "Den primära reservkraften går jämnt, och ingen behöver mata in något igen. Just nu ser det klokt ut att stanna kvar."], ["The primary generator was running steadily when the failover was declined.", "Den primära reservkraften gick jämnt när övergången valdes bort."]),
            io(["The window closes", "Fönstret stängs"], ["The secondary site reports that the storm has reached them. Their connections are dropping, and a failover is no longer possible tonight.", "Reservanläggningen rapporterar att stormen har nått dem. Förbindelserna bryts, och en övergång är inte längre möjlig i natt."], ["Failover to the secondary site was not possible on the first night.", "En övergång till reservanläggningen var inte möjlig den första natten."]),
            io(["An objection on file", "En invändning till protokollet"], ["The service owner puts a written objection on file: declining the failover was, in their view, the riskier choice.", "Tjänsteägaren lämnar en skriftlig invändning: att avstå från övergången var enligt hen det mer riskfyllda valet."], ["The service owner formally objected to declining the failover.", "Tjänsteägaren invände formellt mot att övergången valdes bort."])
          ])
        ],
        choice: ask(["Do you run from there?", "Kör ni därifrån?"], ["Accepts known data loss deliberately, and records what must be re-entered.", "Accepterar en känd dataförlust medvetet, och dokumenterar vad som måste föras in igen."], [
          opt(["Yes, and list what must be re-entered", "Ja, och lista vad som måste föras in igen"], "c4", ["A deliberate trade.", "En medveten avvägning."], {
            pushback: [
              pb(["Who types it all in?", "Vem matar in allt?"], ["{{num.replicationLag}} hours of orders and changes must be found and entered again by hand. The people who know them are the same tired staff running the crisis. Who does this work, and what stops while they do it?", "{{num.replicationLag}} timmar av beställningar och ändringar måste letas upp och föras in igen för hand. De som känner till dem är samma trötta personal som sköter krisen. Vem gör jobbet, och vad blir liggande medan de gör det?"]),
              pb(["Confirmed, then gone", "Bekräftad, sedan borta"], ["Some customers already received confirmations for orders that no longer exist at the secondary site. When they call, nobody will find their order. What do you tell them, and who tells them first?", "En del kunder har redan fått bekräftelser på beställningar som inte finns på reservanläggningen. När de ringer hittar ingen deras order. Vad säger ni till dem, och vem hör av sig först?"]),
              pb(["Two versions of the truth", "Två versioner av sanningen"], ["When the primary site comes back, it will hold newer data than the copy you are now running on. IT asks which version wins when you switch back. Do you know the answer before you switch over?", "När den primära anläggningen kommer tillbaka har den nyare data än kopian ni nu kör på. IT frågar vilken version som gäller när ni växlar tillbaka. Vet ni svaret innan ni växlar över?"])
            ]
          }),
          opt(["No, wait for the primary", "Nej, vänta på den primära"], "c4", ["Back to the fuel question.", "Tillbaka till bränslefrågan."], {
            pushback: [
              pb(["Back to the fuel", "Tillbaka till bränslet"], ["Waiting puts you back where you started: a generator with limited fuel and no date for the roads. You still have to choose between shutting down and running until it stops. Which is it, and why was that better than switching?", "Att vänta tar er tillbaka dit ni började: reservkraft med begränsat bränsle och inget datum för vägarna. Ni måste fortfarande välja mellan att stänga ned och att köra tills det stannar. Vilket blir det, och varför var det bättre än att växla?"]),
              pb(["The service owner objects", "Tjänsteägaren protesterar"], ["The service owner argues that the secondary site is the only option that keeps orders flowing if the generator fails. Turning it down to avoid re-entry work trades a known, small loss for an unknown, larger one. Can you defend that?", "Tjänsteägaren menar att reservanläggningen är det enda alternativet som håller ordrarna igång om reservkraften fallerar. Att tacka nej för att slippa mata in igen byter en känd, liten förlust mot en okänd, större. Kan ni försvara det?"]),
              pb(["The window may close", "Fönstret kan stängas"], ["The secondary site reports that its connections are holding for now, but the storm is moving their way. If you wait, the option may be gone by tomorrow. Do you decide now, knowing you may not get to change your mind?", "Reservanläggningen rapporterar att förbindelserna håller just nu, men stormen rör sig åt deras håll. Om ni väntar kan alternativet vara borta i morgon. Bestämmer ni er nu, med vetskap om att ni kanske inte kan ändra er?"])
            ]
          })
        ])
      }),

      pg("c4", ["Customers", "Kunderna"], [
        "Tomorrow's deliveries cannot leave the depot: the roads are closed and the warehouse system is struggling.\n\nThe customer portal is down. Customers are calling the usual phone numbers, which ring in offices without power where nobody can answer. Some of your customers are shops and care homes waiting for supplies.",
        "Morgondagens leveranser kan inte lämna depån: vägarna är avstängda och lagersystemet har problem.\n\nKundportalen ligger nere. Kunderna ringer de vanliga telefonnumren, som ringer på kontor utan ström där ingen kan svara. En del av era kunder är butiker och äldreboenden som väntar på leveranser."
      ], {
        interrupts: [
          ir("i1", { chosen: "A" }, ["The status page is up", "Statussidan är uppe"], [
            io(["Customers read it", "Kunderna läser den"], ["Calls to colleagues' private phones drop. Customers say the page is the only place they get straight answers.", "Samtalen till kollegornas privata telefoner minskar. Kunderna säger att sidan är det enda ställe där de får raka besked."], ["The status page is customers' main source of news about deliveries.", "Statussidan är kundernas viktigaste källa till besked om leveranserna."], { meters: { trust: 1 } }),
            io(["An update missed", "En missad uppdatering"], ["The page promised an update by morning. Nobody posted one. Customers share screenshots of the stale page and ask whether anyone is there.", "Sidan lovade en uppdatering till morgonen. Ingen lade ut någon. Kunderna delar skärmbilder av den inaktuella sidan och undrar om det finns någon där."], ["An update promised on the status page was missed.", "En uppdatering som statussidan utlovade uteblev."], { reopen: true, meters: { trust: -1 } }),
            io(["They want a date", "De vill ha ett datum"], ["Care homes have read the page and call back: they need a delivery date to plan around. Nobody can give one.", "Äldreboendena har läst sidan och ringer tillbaka: de behöver ett leveransdatum att planera efter. Ingen kan ge något."], ["Care homes are asking for delivery dates nobody can give.", "Äldreboendena frågar efter leveransdatum som ingen kan ge."])
          ]),
          ir("i2", { notChosen: "A" }, ["No word to customers", "Inget besked till kunderna"], [
            io(["Few complaints", "Få klagomål"], ["Most customers are without power too, and only a handful complain. Silence seems to be costing nothing.", "De flesta kunder är också utan ström, och bara ett fåtal klagar. Tystnaden verkar inte kosta något."], ["So far few customers have complained; most are without power too.", "Hittills har få kunder klagat; de flesta är också utan ström."]),
            io(["The rumour spreads", "Ryktet sprids"], ["A local online group claims you have stopped deliveries for good. It is shared widely, and customers start asking competitors instead.", "En lokal grupp på nätet påstår att ni har slutat leverera för gott. Inlägget delas flitigt, och kunderna börjar fråga konkurrenterna i stället."], ["A rumour that you stopped deliveries for good is circulating locally.", "Ett rykte om att ni slutat leverera för gott sprids lokalt."], { reopen: true, meters: { trust: -1, media: 1 } }),
            io(["Answers from private phones", "Svar från privata telefoner"], ["Staff are answering customers from their private phones, each with their own idea of when deliveries will resume.", "Personalen svarar kunder från sina privata telefoner, var och en med sin egen bild av när leveranserna kommer igång."], ["Staff are giving customers differing answers from private phones.", "Personalen ger kunderna olika besked från privata telefoner."])
          ])
        ],
        choice: ask(["How do you reach customers?", "Hur når ni kunderna?"], ["Uses whatever channel still works, with honest expectations.", "Använder den kanal som fortfarande fungerar, med ärliga förväntningar."], [
          opt(["A status page hosted elsewhere and messages where possible", "En statussida som ligger någon annanstans och meddelanden där det går"], "l2", ["Some reach, honest expectations.", "Viss räckvidd, ärliga förväntningar."], {
            pushback: [
              pb(["Who keeps it updated?", "Vem håller den uppdaterad?"], ["The status page needs someone with power and a connection to update it every few hours, through the night. Promise updates and then miss them, and customers trust it less than silence. Who owns it, by name?", "Statussidan behöver någon med ström och uppkoppling som uppdaterar den med några timmars mellanrum, hela natten. Lovar ni uppdateringar och sedan missar dem litar kunderna mindre på den än på tystnad. Vem äger den, med namn?"]),
              pb(["The care homes can't see it", "Äldreboendena ser den inte"], ["The care homes waiting for supplies have no power either. A web page they cannot load does nothing for them. Do you call them separately, and who decides which customers get a call and which only get a page?", "Äldreboendena som väntar på leveranser är också utan ström. En webbsida de inte kan öppna hjälper dem inte. Ringer ni dem separat, och vem avgör vilka kunder som får ett samtal och vilka som bara får en sida?"]),
              pb(["Sales wants a date", "Försäljning vill ha ett datum"], ["Sales wants the page to promise a delivery date to keep customers calm. Nobody knows when the roads will open. Do you publish a date you cannot keep, or tell customers who need supplies that you simply don't know?", "Försäljning vill att sidan lovar ett leveransdatum för att lugna kunderna. Ingen vet när vägarna öppnar. Publicerar ni ett datum ni inte kan hålla, eller säger ni till kunder som behöver varor att ni helt enkelt inte vet?"])
            ]
          }),
          opt(["Nothing until systems are back", "Ingenting tills systemen är tillbaka"], "l2", ["Customers fill the silence themselves.", "Kunderna fyller tystnaden själva."], {
            pushback: [
              pb(["A care home gets through", "Ett äldreboende kommer fram"], ["A care home manager reaches a colleague's private number: they have supplies for two days and must decide whether to find another source. Silence is also an answer. Do you still say nothing to them?", "En föreståndare på ett äldreboende når en kollegas privata nummer: de har förnödenheter för två dagar och måste bestämma sig för om de ska hitta en annan leverantör. Tystnad är också ett svar. Säger ni fortfarande ingenting till dem?"]),
              pb(["Rumours fill the gap", "Rykten fyller tomrummet"], ["A local online group claims the company has stopped deliveries for good. Customers read it because there is nothing else to read. How long can you stay silent before the rumour becomes the story?", "En lokal grupp på nätet påstår att företaget har slutat leverera för gott. Kunderna läser det eftersom det inte finns något annat att läsa. Hur länge kan ni tiga innan ryktet blir sanningen?"]),
              pb(["A competitor calls them", "En konkurrent ringer dem"], ["A competitor with a depot outside the storm area is calling your largest customers, offering to deliver tomorrow. Your silence makes their offer easy to accept. Do you still wait until your systems are back?", "En konkurrent med en depå utanför stormområdet ringer era största kunder och erbjuder leverans i morgon. Er tystnad gör deras erbjudande lätt att tacka ja till. Väntar ni ändå tills systemen är tillbaka?"])
            ]
          })
        ])
      }),

      pg("l2", ["The municipality", "Kommunen"], [
        "Someone from the municipality's crisis meeting gets through on a landline. They know you have trucks and diesel.\n\nThey ask whether you can lend vehicles and fuel for priority needs: moving elderly residents and supplying water to an area without it. Your own generator is running on the same diesel.",
        "Någon från kommunens krisledning når fram via en fast telefon. De vet att ni har lastbilar och diesel.\n\nDe frågar om ni kan låna ut fordon och bränsle för prioriterade behov: att flytta äldre invånare och leverera vatten till ett område som saknar det. Er egen reservkraft går på samma diesel."
      ], {
        long: true,
        skipTo: "c5",
        interrupts: [
          ir("i1", { chosen: "A" }, ["Trucks on loan", "Utlånade lastbilar"], [
            io(["Mentioned on the radio", "Nämnda i radion"], ["Local radio reports that your trucks are moving elderly residents and water. People notice who is helping.", "Lokalradion berättar att era lastbilar flyttar äldre invånare och kör ut vatten. Folk lägger märke till vem som hjälper."], ["Local radio reported that your trucks are helping the municipality.", "Lokalradion rapporterade att era lastbilar hjälper kommunen."], { meters: { trust: 1 } }),
            io(["A truck is stuck", "En lastbil sitter fast"], ["One lent truck is stranded on a cut-off road with your driver inside. The driver is safe but cannot get out for hours. Do you keep lending?", "En utlånad lastbil sitter fast på en avskuren väg med er förare i. Föraren är oskadd men kommer inte loss på flera timmar. Fortsätter ni låna ut?"], ["A lent truck and its driver were stuck for hours on a cut-off road.", "En utlånad lastbil och dess förare satt fast i flera timmar på en avskuren väg."], { reopen: true }),
            io(["They want more", "De vill ha mer"], ["The municipality thanks you and asks for more diesel than you offered. Saying no now feels harder than saying no at the start.", "Kommunen tackar och ber om mer diesel än ni erbjöd. Att säga nej nu känns svårare än att ha sagt nej från början."], ["The municipality has asked for more diesel than you offered.", "Kommunen har bett om mer diesel än ni erbjöd."])
          ]),
          ir("i2", { notChosen: "A" }, ["The request declined", "Förfrågan avböjd"], [
            io(["They found others", "De hittade andra"], ["The municipality calls back: other vehicles have been found. Nobody mentions your answer again.", "Kommunen ringer tillbaka: andra fordon har ordnats. Ingen nämner ert svar igen."], ["The municipality found other vehicles for its priority needs.", "Kommunen hittade andra fordon för sina prioriterade behov."]),
            io(["Another cold night", "Ännu en kall natt"], ["Local news reports that elderly residents spent another night without heat because no vehicles were available. Your depot is mentioned by name.", "Lokala nyheter rapporterar att äldre invånare tillbringade ännu en natt utan värme eftersom inga fordon fanns. Er depå nämns vid namn."], ["Local news reported residents left without heat for another night.", "Lokala nyheter rapporterade att invånare blev utan värme ännu en natt."], { reopen: true, meters: { media: 1 } }),
            io(["The clearing list changes", "Röjningslistan ändras"], ["The municipality revises its road-clearing priorities. Nobody can tell you whether your depot moved up or down.", "Kommunen gör om sin prioritering av vägröjningen. Ingen kan säga om er depå flyttades upp eller ned."], ["Road-clearing priorities changed; your depot's place on the list is unclear.", "Prioriteringen av vägröjningen ändrades; er depås plats på listan är oklar."])
          ])
        ],
        choice: ask(["Do you help?", "Hjälper ni till?"], ["Contributes what it can spare without risking its own safety.", "Bidrar med det som kan avvaras utan att riskera den egna säkerheten."], [
          opt(["Offer what you can spare", "Erbjud det ni kan avvara"], "c5", ["Good for the region; you remember who helped.", "Bra för regionen; man minns vem som hjälpte."], {
            pushback: [
              pb(["What counts as spare?", "Vad räknas som överskott?"], ["Nobody knows how much diesel you will need, because nobody knows when the power returns. Every litre you lend is a litre the generator cannot burn. How do you decide what is spare, and who signs off on it?", "Ingen vet hur mycket diesel ni kommer att behöva, eftersom ingen vet när strömmen kommer tillbaka. Varje liter ni lånar ut är en liter reservkraften inte kan använda. Hur avgör ni vad som är överskott, och vem godkänner det?"]),
              pb(["Who drives the trucks?", "Vem kör bilarna?"], ["The only drivers available are night-shift staff who have been at the depot since yesterday. Lending vehicles means sending tired people out on storm-damaged roads. Do you lend trucks without drivers, or put your own staff at risk?", "De enda förare som finns är nattskiftet, som har varit på depån sedan i går. Att låna ut fordon innebär att skicka ut trött personal på stormskadade vägar. Lånar ni ut bilar utan förare, eller utsätter ni er egen personal för risk?"]),
              pb(["Nothing in writing", "Inget på papper"], ["Nothing is agreed in writing with the municipality, and nobody can reach your legal advisers. If a lent truck crashes, it is unclear whose insurance pays. Do you still hand over the keys tonight?", "Inget är skriftligt överenskommet med kommunen, och ingen når era jurister. Om en utlånad lastbil krockar är det oklart vems försäkring som betalar. Lämnar ni ändå över nycklarna i kväll?"])
            ]
          }),
          opt(["Decline; you need it all", "Tacka nej; ni behöver allt"], "c5", ["Sometimes true.", "Ibland sant."], {
            pushback: [
              pb(["Another night without heat", "Ännu en natt utan värme"], ["The caller explains that without vehicles, elderly residents in an area without heat will stay where they are another night. Your diesel is keeping servers running. Can you defend that choice if someone asks later?", "Den som ringer förklarar att äldre invånare i ett område utan värme blir kvar ännu en natt om det inte finns fordon. Er diesel håller servrar igång. Kan ni försvara det valet om någon frågar efteråt?"]),
              pb(["Everyone remembers", "Alla minns"], ["The municipality is also setting priorities for clearing roads, and your depot is on the list. Nobody is threatening anything, but everyone will remember who helped and who didn't. Does that change your answer?", "Kommunen prioriterar också vilka vägar som ska röjas, och er depå står på listan. Ingen hotar med något, men alla kommer att minnas vem som hjälpte och vem som inte gjorde det. Ändrar det ert svar?"]),
              pb(["Do you really need it all?", "Behöver ni verkligen allt?"], ["Facilities calculates that one truck's worth of diesel would barely change how long the generator lasts. Declining assumes you need every litre. Is “we need it all” a calculation, or a reflex?", "Fastighet räknar ut att en lastbils diesel knappt skulle påverka hur länge reservkraften räcker. Att tacka nej förutsätter att ni behöver varenda liter. Är ”vi behöver allt” en kalkyl, eller en reflex?"])
            ]
          })
        ])
      }),

      pg("c5", ["Storm scams", "Stormbedrägerier"], [
        "The first scams arrive while people are tired and cut off. Staff receive emails: “Storm emergency payment for employees, enter your bank details” and “IT: reset your password after the outage”.\n\nBoth look official, both use the company logo, and both arrive when nobody can easily call anyone to check. Several people have already clicked.",
        "De första bedrägerierna kommer medan folk är trötta och avskurna. Personalen får mejl: ”Krisersättning för anställda på grund av stormen, ange dina bankuppgifter” och ”IT: återställ ditt lösenord efter avbrottet”.\n\nBåda ser officiella ut, båda använder företagets logotyp och båda kommer när ingen enkelt kan ringa någon och kontrollera. Flera personer har redan klickat."
      ], {
        variants: [vr("fallbackComms", [
          "The first scams arrive while people are tired and cut off: a “storm emergency payment” asking for bank details, and an “IT password reset after the outage”.\n\nBecause the crisis team has a known, agreed channel, staff know where real instructions come from. Several forward the emails to the crisis team instead of clicking. A few have already clicked.",
          "De första bedrägerierna kommer medan folk är trötta och avskurna: en ”krisersättning på grund av stormen” som ber om bankuppgifter, och en ”lösenordsåterställning efter avbrottet” från IT.\n\nEftersom krisledningen har en känd, överenskommen kanal vet personalen var riktiga instruktioner kommer ifrån. Flera vidarebefordrar mejlen till krisledningen i stället för att klicka. Några har redan klickat."
        ], ["Because the crisis channel was established, fakes stand out.", "Eftersom krisgruppens kanal var etablerad sticker förfalskningarna ut."])],
        injects: [
          inj("b10-2", 1200, "phishingEmail", "attacker", "high", "confirmed", [
            "Due to the storm, all employees are entitled to an emergency payment. Register your bank details by 18:00 today to receive it this week.",
            "På grund av stormen har alla anställda rätt till en krisersättning. Registrera dina bankuppgifter före klockan 18 i dag för att få den den här veckan."
          ], { headline: ["Storm emergency payment for employees", "Krisersättning för anställda efter stormen"], meta: { from: "hr-support@{{asset.lookalikeDomain}}", subject: L(["Emergency payment", "Krisersättning"]) }, tests: ["lo4"] })
        ],
        discuss: [q("Why do scams work so well during a real crisis?", "Varför fungerar bedrägerier så bra under en verklig kris?", ["ciso", "hr"])],
        interrupts: [
          ir("i1", { chosen: "A" }, ["The warning goes out", "Varningen går ut"], [
            io(["Reports flood in", "Anmälningarna strömmar in"], ["Within the hour staff forward dozens of suspicious emails to the crisis team. It looks as if the warning is working.", "Inom en timme vidarebefordrar personalen dussintals misstänkta mejl till krisgruppen. Det ser ut som att varningen fungerar."], ["Staff are forwarding suspicious emails to the crisis team.", "Personalen vidarebefordrar misstänkta mejl till krisgruppen."]),
            io(["A fake warning", "En falsk varning"], ["A copy of your own warning starts circulating, word for word, with one change: a link to “check whether your account is affected”. Staff cannot tell which one is real.", "En kopia av er egen varning börjar cirkulera, ord för ord, med en ändring: en länk för att ”kontrollera om ditt konto är drabbat”. Personalen kan inte avgöra vilken som är äkta."], ["A fake copy of your scam warning is circulating with a malicious link.", "En falsk kopia av er varning cirkulerar med en skadlig länk."], { reopen: true }),
            io(["Not sure if they did", "Osäkra på om de gjorde det"], ["Several staff write that they opened the email on a phone in the dark and cannot remember whether they entered anything.", "Flera anställda skriver att de öppnade mejlet på telefonen i mörkret och inte minns om de fyllde i något."], ["Several staff are unsure whether they entered details on the fake page.", "Flera anställda är osäkra på om de lämnade uppgifter på den falska sidan."])
          ]),
          ir("i2", { notChosen: "A" }, ["No warning yet", "Ingen varning än"], [
            io(["The filter catches some", "Filtret fångar en del"], ["IT notices the mail filter has quarantined a batch of the scam emails. It seems the problem is partly handling itself.", "IT ser att e-postfiltret har satt en del av bedrägerimejlen i karantän. Problemet verkar delvis lösa sig självt."], ["The mail filter quarantined some, but not all, of the scam emails.", "E-postfiltret satte en del av bedrägerimejlen i karantän, men inte alla."]),
            io(["An unfamiliar sign-in", "En okänd inloggning"], ["IT sees a staff mailbox signed into from an unfamiliar location, minutes after the password-reset email arrived. Waiting no longer looks like an option.", "IT ser att en anställds brevlåda har loggats in i från en okänd plats, några minuter efter att mejlet om lösenordsåterställning kom. Att vänta ser inte längre ut som ett alternativ."], ["A staff mailbox was signed into from an unfamiliar location.", "En anställds brevlåda loggades in i från en okänd plats."], { reopen: true }),
            io(["Replies to the fake HR", "Svar till falska HR"], ["Staff are replying to the fake HR address with questions about the payment, and some get friendly answers back.", "Personalen svarar den falska HR-adressen med frågor om ersättningen, och en del får vänliga svar tillbaka."], ["Staff are corresponding with the fake HR address.", "Personalen brevväxlar med den falska HR-adressen."])
          ])
        ],
        choice: ask(["What do you do?", "Vad gör ni?"], ["Warns staff through the crisis channel and states what real messages will look like.", "Varnar personalen via krisgruppens kanal och anger hur riktiga meddelanden kommer att se ut."], [
          opt(["Warn through the crisis channel; block the senders", "Varna via krisgruppens kanal; blockera avsändarna"], "l3", ["Fast and believable.", "Snabbt och trovärdigt."], {
            set: "phishWarned",
            pushback: [
              pb(["A new sender every time", "Ny avsändare varje gång"], ["Minutes after you block the sender, the same email arrives from a new address on a new lookalike domain. Blocking them one by one is a race you are losing. What do you do beyond blocking?", "Några minuter efter att ni blockerat avsändaren kommer samma mejl från en ny adress på en ny förväxlingsbar domän. Att blockera dem en i taget är ett lopp ni förlorar. Vad gör ni utöver att blockera?"]),
              pb(["Your warning looks like the scam", "Er varning liknar bedrägeriet"], ["Several staff reply to your warning asking how they can tell it is real: it arrives by email, with the logo, just like the scam. How do people tell your warning from the next fake?", "Flera anställda svarar på varningen och frågar hur de ska veta att den är äkta: den kommer via mejl, med logotypen, precis som bedrägeriet. Hur ska folk skilja er varning från nästa förfalskning?"]),
              pb(["Those who already clicked", "De som redan klickat"], ["The warning tells people not to click. It says nothing to those who already gave their bank details or passwords, and they are now embarrassed to admit it. How do you get them to come forward, and what do you do for them tonight?", "Varningen säger åt folk att inte klicka. Den säger ingenting till dem som redan lämnat bankuppgifter eller lösenord, och som nu skäms för att erkänna det. Hur får ni dem att höra av sig, och vad gör ni för dem i kväll?"])
            ]
          }),
          opt(["Too busy; deal with it later", "För mycket att göra; ta det senare"], "l3", ["The scammers aren't busy.", "Bedragarna har inte för mycket att göra."], {
            pushback: [
              pb(["“Where is my payment?”", "”Var är min ersättning?”"], ["Payroll reports that two employees have asked why the storm emergency payment has not arrived. They entered their bank details as asked. Is this still something for later?", "Lönekontoret rapporterar att två anställda har frågat varför krisersättningen inte har kommit. De lämnade sina bankuppgifter som det stod. Är det här fortfarande något för senare?"]),
              pb(["Passwords are going out", "Lösenorden lämnas ut"], ["IT points out that the second email asks staff to reset their password on a fake page. Every password handed over tonight is a way into email while nobody is watching. How much later is later?", "IT påpekar att det andra mejlet ber personalen återställa lösenordet på en falsk sida. Varje lösenord som lämnas ut i kväll är en väg in i e-posten medan ingen håller koll. Hur mycket senare är senare?"]),
              pb(["HR's name is on it", "HR:s namn står på det"], ["HR is getting calls from staff asking about an emergency payment HR never announced. Staff believe it because it uses HR's name. Can HR stay quiet while the scam speaks in its name?", "HR får samtal från anställda som frågar om en krisersättning som HR aldrig har utlyst. Personalen tror på den eftersom den använder HR:s namn. Kan HR tiga medan bedrägeriet talar i dess namn?"])
            ]
          }),
          opt(["Call everyone in now, reversing last night's decision to wait until morning", "Kalla in alla nu, och upphäv gårdagens beslut att vänta till morgonen"], "l3", ["Reverses your first call; the night is already lost.", "Upphäver ert första beslut; natten är redan förlorad."], {
            requires: "waited",
            set: "calledIn",
            effects: { trust: 1 },
            pushback: [
              pb(["Roads are still closed", "Vägarna är fortfarande stängda"], ["Calling everyone in means asking people to drive on roads that are still partly closed, the same roads that already hurt a colleague. Do you call in the whole team, or only those who can get there safely?", "Att kalla in alla betyder att be folk köra på vägar som fortfarande delvis är avstängda, samma vägar där en kollega redan har skadats. Kallar ni in hela gruppen, eller bara dem som kan ta sig dit säkert?"]),
              pb(["What goes in the log?", "Vad står i loggen?"], ["Calling the team in now makes it obvious that nobody led overnight. The CEO asks whether the decision to wait has to be written down. Do you record why you waited, or let the log start this morning?", "Att kalla in gruppen nu gör det tydligt att ingen ledde under natten. Vd frågar om beslutet att vänta måste skrivas ned. Dokumenterar ni varför ni väntade, eller låter ni loggen börja i morse?"]),
              pb(["Gather first, or warn first?", "Samlas först, eller varna först?"], ["Getting everyone together will take hours on poor roads and weak signals. The scam emails are landing in inboxes right now. Do you warn staff before the team has gathered, and who has the authority to do it?", "Att samla alla tar timmar på dåliga vägar och med svag täckning. Bedrägerimejlen landar i inkorgarna just nu. Varnar ni personalen innan gruppen har samlats, och vem har mandat att göra det?"])
            ]
          })
        ])
      }),

      pg("l3", ["The helpdesk calls", "”IT-supporten” ringer"], [
        "The scammers switch to the phone. Staff working from the few landlines still in service get calls from “IT support”.\n\nThe caller is friendly and patient, and asks for the code from the staff member's authenticator app “to restore your access after the outage”. One person in finance has already read out a code.",
        "Bedragarna byter till telefonen. Anställda som arbetar vid de få fasta telefoner som fortfarande fungerar får samtal från ”IT-supporten”.\n\nDen som ringer är vänlig och tålmodig, och ber om koden från den anställdes autentiseringsapp ”för att återställa din åtkomst efter avbrottet”. En person på ekonomi har redan läst upp en kod."
      ], {
        long: true,
        skipTo: "c6",
        interrupts: [
          ir("i1", { chosen: "A" }, ["IT never asks", "IT frågar aldrig"], [
            io(["Callers hang up", "Uppringarna lägger på"], ["A warehouse clerk asks the next “IT” caller for a call-back number. The line goes dead. The rule is spreading.", "En lagerarbetare ber nästa ”IT”-uppringare om ett nummer att ringa tillbaka till. Linjen dör. Regeln sprider sig."], ["Staff have started challenging callers who claim to be IT.", "Personalen har börjat ifrågasätta uppringare som säger att de är IT."]),
            io(["The call-back number is dead", "Återuppringningsnumret är dött"], ["Staff who call the announced number get no answer: it rings in an office without power. Some give up, and one answers the next caller instead.", "De som ringer det utlysta numret får inget svar: det ringer på ett kontor utan ström. En del ger upp, och en svarar nästa uppringare i stället."], ["The announced IT call-back number rang unanswered on the first day.", "Det utlysta numret till IT gick inte att nå den första dagen."], { reopen: true }),
            io(["A quick check", "En snabb kontroll"], ["IT takes a quick look at the finance employee's account and finds nothing unusual. The check took five minutes.", "IT tittar snabbt på kontot för personen på ekonomi och hittar inget ovanligt. Kontrollen tog fem minuter."], ["A quick first check of the finance account found nothing unusual.", "En snabb första kontroll av ekonomikontot visade inget ovanligt."])
          ]),
          ir("i2", { notChosen: "A" }, ["Investigating first", "Utredning först"], [
            io(["A pattern emerges", "Ett mönster framträder"], ["IT links several calls to the same range of numbers. It feels like progress, though it leads nowhere yet.", "IT kopplar flera samtal till samma nummerserie. Det känns som ett framsteg, även om det inte leder någonstans än."], ["IT linked several calls to one number range that leads nowhere yet.", "IT kopplade flera samtal till en nummerserie som ännu inte leder någonstans."]),
            io(["The code was used", "Koden användes"], ["IT sees a successful sign-in to the finance employee's account from somewhere else, minutes after the call. Someone else is in.", "IT ser en lyckad inloggning på ekonomipersonens konto från en annan plats, några minuter efter samtalet. Någon annan är inne."], ["Someone else signed in to the finance employee's account.", "Någon annan loggade in på ekonomipersonens konto."], { reopen: true }),
            io(["The calls stop", "Samtalen upphör"], ["The fake helpdesk calls suddenly stop. Nobody knows whether the scammers gave up or got what they wanted.", "De falska supportsamtalen upphör plötsligt. Ingen vet om bedragarna gav upp eller fick det de ville ha."], ["The fake helpdesk calls stopped suddenly; nobody knows why.", "De falska supportsamtalen upphörde plötsligt; ingen vet varför."])
          ])
        ],
        choice: ask(["How do you stop it?", "Hur stoppar ni det?"], ["Announces that IT never asks for codes, and gives a call-back route.", "Meddelar att IT aldrig ber om koder, och anger en väg för återuppringning."], [
          opt(["Announce: IT never asks for codes; call back on a known number", "Meddela: IT ber aldrig om koder; ring tillbaka på ett känt nummer"], "c6", ["Clear rule, easy to follow.", "Tydlig regel, lätt att följa."], {
            set: "phishWarned",
            pushback: [
              pb(["The real IT is calling too", "Den riktiga IT ringer också"], ["Your own IT team is in fact phoning staff today to help them back online after the outage. After the announcement, some staff refuse to talk to them at all. How do your real helpers prove who they are?", "Ert eget IT-team ringer faktiskt runt till personalen i dag för att hjälpa dem tillbaka efter avbrottet. Efter meddelandet vägrar en del att prata med dem över huvud taget. Hur bevisar era riktiga hjälpare vilka de är?"]),
              pb(["The known number is dead", "Det kända numret är dött"], ["The usual IT number rings in an office without power. Staff who call back get nothing and give up, or answer the next caller instead. Which number do you actually give them, and who answers it?", "Det vanliga IT-numret ringer på ett kontor utan ström. Den som ringer tillbaka får inget svar och ger upp, eller svarar nästa uppringare i stället. Vilket nummer ger ni dem egentligen, och vem svarar där?"]),
              pb(["The code already given", "Koden som redan lämnats ut"], ["The announcement stops the next code, but the finance employee has already read one out. Their account may be open to someone right now. Do you lock it, knowing finance needs that person working today?", "Meddelandet stoppar nästa kod, men personen på ekonomi har redan läst upp en. Kontot kan vara öppet för någon just nu. Låser ni det, trots att ekonomi behöver att personen jobbar i dag?"])
            ]
          }),
          opt(["Investigate the calls first", "Utred samtalen först"], "c6", ["While codes are handed over.", "Medan koder lämnas ut."], {
            pushback: [
              pb(["A second code", "En andra kod"], ["While IT is tracing the calls, a second person, this time in the warehouse office, reads out a code. Each one is a possible login to your systems. How many more before you warn everyone?", "Medan IT spårar samtalen läser en andra person, den här gången på lagerkontoret, upp en kod. Varje kod är en möjlig inloggning i era system. Hur många till innan ni varnar alla?"]),
              pb(["Numbers that lead nowhere", "Nummer som inte leder någonstans"], ["The calls come from numbers that change every time. IT says tracing them could take days and may never name anyone. What will the investigation tell you that changes what staff should do today?", "Samtalen kommer från nummer som byts varje gång. IT säger att det kan ta dagar att spåra dem och att det kanske aldrig pekar ut någon. Vad kommer utredningen att ge som ändrar vad personalen ska göra i dag?"]),
              pb(["Should they still approve payments?", "Ska hen fortfarande attestera?"], ["The finance lead asks whether the colleague who read out a code should keep approving payments today. Investigating first leaves that question open. Do you suspend their access while you look, or let them carry on?", "Ekonomichefen frågar om kollegan som läste upp en kod ska fortsätta attestera betalningar i dag. Att utreda först lämnar den frågan öppen. Stänger ni av hens åtkomst under tiden, eller låter ni hen fortsätta?"])
            ]
          })
        ])
      }),

      pg("c6", ["Day two", "Dag två"], [
        "Day two. Power returns to head office in the afternoon, and the network starts coming back.\n\nEvery department wants its systems back immediately: the warehouse, sales, finance, customer service. The IT team is small and has been awake for thirty hours.",
        "Dag två. Strömmen kommer tillbaka till huvudkontoret på eftermiddagen och nätet börjar fungera igen.\n\nVarje avdelning vill ha sina system tillbaka omedelbart: lagret, försäljningen, ekonomi, kundtjänst. IT-teamet är litet och har varit vakna i trettio timmar."
      ], {
        variants: [vr("hardCrash", [
          "Day two. Power returns to head office in the afternoon.\n\nTwo servers did not come back after the hard crash when the fuel ran out, and the warehouse database reports corruption. Every department still wants everything back immediately, and the IT team has been awake for thirty hours.",
          "Dag två. Strömmen kommer tillbaka till huvudkontoret på eftermiddagen.\n\nTvå servrar kom inte tillbaka efter den hårda kraschen när bränslet tog slut, och lagerdatabasen rapporterar skadad data. Alla avdelningar vill ändå ha allt tillbaka omedelbart, och IT-teamet har varit vakna i trettio timmar."
        ], ["Because the data room ran until it crashed, the restart is harder.", "Eftersom datarummet gick tills det kraschade blir omstarten svårare."])],
        interrupts: [
          ir("i1", { chosen: "A" }, ["Restart in order", "Omstart i ordning"], [
            io(["A smooth first hour", "En lugn första timme"], ["The first two systems on the list come back cleanly and pass their checks. The order looks right.", "De två första systemen på listan kommer tillbaka rent och klarar kontrollerna. Ordningen ser ut att stämma."], ["The first two systems on the restart list came back cleanly.", "De två första systemen på omstartslistan kom tillbaka rent."]),
            io(["An unlisted server", "En olistad server"], ["The third system will not start: it needs a server nobody put on the whiteboard. The order has to be worked out again.", "Det tredje systemet startar inte: det behöver en server som ingen skrev upp på whiteboarden. Ordningen måste göras om."], ["An unlisted server blocked the restart order on day two.", "En server som inte fanns med stoppade omstartsordningen dag två."], { reopen: true }),
            io(["Sales goes ahead", "Försäljning kör själva"], ["A sales manager gets a contractor to start the order system out of turn. It works, for now, and nobody checked it.", "En försäljningschef får en konsult att starta ordersystemet före sin tur. Det fungerar, just nu, och ingen har kontrollerat det."], ["Sales restarted its own system out of turn on day two.", "Försäljning startade sitt eget system före sin tur dag två."])
          ]),
          ir("i2", { notChosen: "A" }, ["No restart order", "Ingen omstartsordning"], [
            io(["Departments help themselves", "Avdelningarna tar själva"], ["Department leads with admin passwords start bringing their own systems up. Some of them work.", "Avdelningschefer med administratörslösenord börjar starta sina egna system. En del av dem fungerar."], ["Some departments restarted their own systems on day two.", "Några avdelningar startade sina egna system dag två."]),
            io(["The power trips", "Strömmen löser ut"], ["A surge of load trips the power at head office. Everything that was running goes down again, hard. Facilities asks for a plan before anyone touches a switch.", "En lasttopp får strömmen på huvudkontoret att lösa ut. Allt som var igång går ned igen, hårt. Fastighet vill ha en plan innan någon rör en strömbrytare."], ["Head office power tripped once on the afternoon of day two.", "Strömmen på huvudkontoret löste ut en gång på eftermiddagen dag två."], { reopen: true }),
            io(["A few hours of sleep", "Några timmars sömn"], ["With no clear order to follow, part of the IT team takes the chance to sleep for a few hours. Nobody is sure whether that helps or hurts.", "Utan någon tydlig ordning att följa passar en del av IT-teamet på att sova några timmar. Ingen vet om det hjälper eller stjälper."], ["Part of the IT team slept for a few hours on day two.", "En del av IT-teamet sov några timmar dag två."])
          ])
        ],
        choice: ask(["How do you restart?", "Hur startar ni igen?"], ["Restarts in priority order with checks at each step.", "Startar i prioritetsordning med kontroller i varje steg."], [
          opt(["In priority order, checking each system", "I prioritetsordning, med kontroll av varje system"], "c7", ["Slower first hour, fewer surprises.", "Långsammare första timme, färre överraskningar."], {
            pushback: [
              pb(["Who goes last?", "Vem får vänta sist?"], ["Sales says every hour without orders sends customers to competitors; the warehouse says nothing ships without their system. Your order puts one of them behind the other. Who do you tell to wait, and how do you explain it?", "Försäljning säger att varje timme utan order skickar kunder till konkurrenter; lagret säger att inget skickas utan deras system. Er ordning sätter den ena efter den andra. Vem säger ni åt att vänta, och hur förklarar ni det?"]),
              pb(["Thirty hours awake", "Trettio timmar utan sömn"], ["Careful checks on every system mean another long night for an IT team that has been awake for thirty hours. Do you keep the checks thorough, send people to sleep and go slower, or cut corners on the checks?", "Noggranna kontroller av varje system betyder ännu en lång natt för ett IT-team som har varit vaket i trettio timmar. Håller ni fast vid noggrannheten, skickar ni hem folk att sova och går långsammare, eller slarvar ni med kontrollerna?"]),
              pb(["An order invented in the room", "En ordning som hittas på i rummet"], ["Nobody has mapped what depends on what: the warehouse system needs a database, which needs a server nobody has listed. The priority order is being worked out on a whiteboard right now. How sure are you that it is right?", "Ingen har kartlagt vad som hänger ihop: lagersystemet behöver en databas, som behöver en server som ingen har listat. Prioriteringsordningen tas fram på en whiteboard just nu. Hur säkra är ni på att den stämmer?"])
            ]
          }),
          opt(["Everything at once", "Allt på en gång"], "c7", ["The fastest way to find what's broken.", "Det snabbaste sättet att hitta det som är trasigt."], {
            pushback: [
              pb(["Errors everywhere", "Fel överallt"], ["Within minutes several systems report errors, and IT cannot tell which one is causing the others. Fixing them all in parallel needs more people than you have. Do you stop and go back to one at a time?", "Inom några minuter rapporterar flera system fel, och IT kan inte avgöra vilket som orsakar de andra. Att laga allt parallellt kräver fler personer än ni har. Stoppar ni och går tillbaka till ett i taget?"]),
              pb(["The grid is fragile", "Elnätet är skört"], ["Facilities warns that the power is still unstable, and starting everything at once draws a heavy load. If it trips, everything goes down again, hard. Do you take that chance?", "Fastighet varnar för att strömmen fortfarande är instabil, och att starta allt på en gång drar mycket last. Om den löser ut går allt ned igen, hårt. Tar ni den risken?"]),
              pb(["Speed or mistakes", "Fart eller misstag"], ["The IT lead says the team, awake for thirty hours, cannot watch every system at once. Mistakes will be made, and nobody will know which ones. What do you tell them: speed, or care?", "IT-chefen säger att teamet, som varit vaket i trettio timmar, inte kan bevaka alla system samtidigt. Det kommer att bli fel, och ingen vet vilka. Vad säger ni till dem: fart eller noggrannhet?"])
            ]
          }),
          opt(["Wait until power is stable everywhere", "Vänta tills strömmen är stabil överallt"], "c7", ["Safe, slow.", "Säkert, långsamt."], {
            pushback: [
              pb(["When is everywhere?", "När är överallt?"], ["The outer sites may not get stable power for days. Head office is ready now. Waiting for “everywhere” means waiting for the slowest site. How long are you prepared to wait?", "De yttre anläggningarna kanske inte får stabil ström på flera dagar. Huvudkontoret är redo nu. Att vänta på ”överallt” betyder att vänta på den långsammaste anläggningen. Hur länge är ni beredda att vänta?"]),
              pb(["Customers see the lights on", "Kunderna ser att lamporna lyser"], ["Customers can see that head office has power and ask why orders still cannot be placed. Sales says competitors are taking the business. Is “safe and slow” still the right call?", "Kunderna ser att huvudkontoret har ström och undrar varför de fortfarande inte kan beställa. Försäljning säger att konkurrenterna tar affärerna. Är ”säkert och långsamt” fortfarande rätt beslut?"]),
              pb(["Staff with nothing to do", "Personal utan något att göra"], ["Staff are back at work with no systems. Managers ask whether to send them home or pay them to sit idle. How long can you hold the whole company still for the last site?", "Personalen är tillbaka på jobbet utan system. Cheferna frågar om de ska skicka hem dem eller betala dem för att sitta sysslolösa. Hur länge kan ni hålla hela företaget stilla för den sista anläggningen?"])
            ]
          }),
          opt(["Tell the press a cyberattack caused the delays", "Säg till pressen att ett cyberangrepp orsakade förseningarna"], "x1", ["Sounds better than “we weren't ready”.", "Låter bättre än ”vi var inte förberedda”."], {
            pushback: [
              pb(["What attack?", "Vilket angrepp?"], ["Communications asks for details for the statement: what kind of attack, when, and what was hit. Nobody can give any. What do you say when the first journalist asks a follow-up question?", "Kommunikation ber om detaljer till uttalandet: vilken sorts angrepp, när och vad som drabbades. Ingen kan ge några. Vad säger ni när den första journalisten ställer en följdfråga?"]),
              pb(["Comms won't sign it", "Kommunikation skriver inte under"], ["The head of communications says they will not put their name to a statement they know is untrue, and asks who will. Do you overrule them, sign it yourself, or drop the idea?", "Kommunikationschefen säger att hen inte sätter sitt namn på ett uttalande hen vet är osant, och frågar vem som gör det. Kör ni över hen, skriver ni under själva, eller släpper ni idén?"]),
              pb(["Staff who clicked", "Personal som klickade"], ["Staff really did get scam emails this week. If the delays are blamed on a cyberattack, every employee who clicked will wonder whether they caused it. Do you want them believing that?", "Personalen fick verkligen bedrägerimejl den här veckan. Om förseningarna skylls på ett cyberangrepp kommer alla anställda som klickade att undra om det var de som orsakade det. Vill ni att de ska tro det?"])
            ]
          })
        ])
      }),

      pg("c7", ["The costs", "Kostnaderna"], [
        "The bills start arriving: spoiled chilled goods, overtime for everyone who worked through, hired generators and emergency repairs.\n\nThe insurer asks for documentation of every cost, with dates and decisions. Nobody kept a proper log during the first night.",
        "Räkningarna börjar komma: förstörda kylvaror, övertid för alla som arbetade igenom, hyrda elverk och akuta reparationer.\n\nFörsäkringsbolaget begär dokumentation för varje kostnad, med datum och beslut. Ingen förde en ordentlig logg under den första natten."
      ], {
        interrupts: [
          ir("i1", { chosen: "A" }, ["Building the log", "Loggen sammanställs"], [
            io(["Receipts come in", "Kvittona kommer in"], ["Staff hand in receipts within days, and the claim starts to look solid.", "Personalen lämnar in kvitton inom några dagar, och anspråket börjar se stabilt ut."], ["Most receipts from the storm have been collected.", "De flesta kvitton från stormen har samlats in."]),
            io(["The accounts disagree", "Berättelserna går isär"], ["The rebuilt timeline contradicts itself: three people give three times for the same first-night decision. The insurer queries the whole log.", "Den återskapade tidslinjen motsäger sig själv: tre personer anger tre olika tider för samma beslut den första natten. Försäkringsbolaget ifrågasätter hela loggen."], ["The rebuilt log disagrees with itself on first-night times.", "Den återskapade loggen är motsägelsefull om tiderna den första natten."], { reopen: true }),
            io(["The adjuster wants interviews", "Skadereglerare vill intervjua"], ["The insurer's adjuster asks to interview staff directly about the first night, without managers present.", "Försäkringsbolagets skadereglerare vill intervjua personalen direkt om den första natten, utan chefer närvarande."], ["The insurer's adjuster wants to interview staff directly.", "Försäkringsbolagets skadereglerare vill intervjua personalen direkt."])
          ]),
          ir("i2", { notChosen: "A" }, ["Estimates later", "Uppskattningar senare"], [
            io(["Estimates accepted, for now", "Uppskattningar godtas, tills vidare"], ["The insurer agrees to work from estimates for now, pending receipts. It seems there is no hurry.", "Försäkringsbolaget går med på att utgå från uppskattningar tills vidare, i väntan på kvitton. Det verkar inte brådska."], ["The insurer accepted estimates for now, pending receipts.", "Försäkringsbolaget godtog uppskattningar tills vidare, i väntan på kvitton."]),
            io(["Receipts lost", "Kvitton borta"], ["Several receipts for hired generators have been thrown away. Staff who paid on their own cards are out of pocket and asking who will repay them.", "Flera kvitton för hyrda elverk har slängts. Anställda som betalade med egna kort står för kostnaden och frågar vem som ska betala tillbaka."], ["Some storm receipts were lost; staff are out of pocket.", "En del kvitton från stormen har försvunnit; anställda står för kostnaden."], { reopen: true }),
            io(["Overtime that doesn't add up", "Övertid som inte går ihop"], ["Overtime claims from the storm do not match the shift rota. It may be honest confusion, or not.", "Övertidsanspråken från stormen stämmer inte med skiftschemat. Det kan vara ärlig förvirring, eller inte."], ["Overtime claims from the storm do not match the shift rota.", "Övertidsanspråken från stormen stämmer inte med skiftschemat."])
          ])
        ],
        choice: ask(["How do you handle the claim?", "Hur hanterar ni anspråket?"], ["Documents decisions and costs as they happen.", "Dokumenterar beslut och kostnader allteftersom."], [
          opt(["Assemble the crisis log and receipts now", "Sammanställ krisloggen och kvittona nu"], "l4", ["Memory fades by the week.", "Minnet bleknar för varje vecka."], {
            pushback: [
              pb(["Whose memory counts?", "Vems minne gäller?"], ["Nobody kept a log on the first night. Rebuilding it means asking tired staff to write down what they remember, and their accounts already disagree on times and decisions. Whose version goes into the claim?", "Ingen förde logg den första natten. Att återskapa den betyder att be trött personal skriva ned vad de minns, och deras berättelser skiljer sig redan om tider och beslut. Vems version hamnar i anspråket?"]),
              pb(["Paperwork or recovery?", "Pappersarbete eller återställning?"], ["The people who know what was spent are the same people still restoring systems and catching up on deliveries. Do you take them off recovery to do paperwork, and what slips while they do?", "De som vet vad som köptes är samma personer som fortfarande återställer system och kommer ikapp med leveranserna. Tar ni dem från återställningen för pappersarbete, och vad blir liggande under tiden?"]),
              pb(["Every decision on record", "Varje beslut på pränt"], ["A full log also records the decisions that went badly, with times. The CEO asks whether all of that really has to be in a document the insurer will read. Does it?", "En fullständig logg dokumenterar också de beslut som gick dåligt, med tidpunkter. Vd frågar om allt det verkligen måste stå i ett dokument som försäkringsbolaget ska läsa. Måste det det?"])
            ]
          }),
          opt(["Estimate later", "Uppskatta senare"], "l4", ["Estimates get cut.", "Uppskattningar skärs ned."], {
            pushback: [
              pb(["The insurer's deadline", "Försäkringsbolagets tidsfrist"], ["The insurer's letter sets a deadline for documenting the claim and says that costs without receipts may be reduced. Nobody in the room knows exactly when the deadline falls. How much later can later be?", "Försäkringsbolagets brev anger en tidsfrist för att dokumentera anspråket och säger att kostnader utan kvitton kan sättas ned. Ingen i rummet vet exakt när fristen går ut. Hur mycket senare kan senare vara?"]),
              pb(["Receipts going missing", "Kvitton som försvinner"], ["The hired generators and emergency repairs were paid by several people, some on their own cards. Every week some of those receipts get lost or thrown away. Who is collecting them, starting now?", "De hyrda elverken och akuta reparationerna betalades av flera personer, en del med egna kort. Varje vecka försvinner eller slängs några av kvittona. Vem samlar in dem, från och med nu?"]),
              pb(["Overtime unpaid", "Obetald övertid"], ["Staff who worked through the storm want their overtime paid with this month's salary. Without a record of who worked when, payroll cannot pay it. Do they wait for your estimate?", "Personalen som arbetade igenom stormen vill ha övertiden utbetald med månadens lön. Utan en sammanställning av vem som arbetade när kan lönekontoret inte betala. Ska de vänta på er uppskattning?"])
            ]
          })
        ])
      }),

      pg("l4", ["The suppliers", "Leverantörerna"], [
        "The review of suppliers finds a gap between paper and reality. The telecom provider's service level promised to restore your connections within four hours.\n\nIt took thirty. The contract gives you a small service credit, which does nothing for the deliveries that never left.",
        "Genomgången av leverantörerna visar ett glapp mellan papper och verklighet. Teleoperatörens servicenivå lovade att återställa era förbindelser inom fyra timmar.\n\nDet tog trettio. Avtalet ger er en liten kreditering, som inte hjälper de leveranser som aldrig lämnade depån."
      ], {
        long: true,
        skipTo: "c8",
        interrupts: [
          ir("i1", { chosen: "A" }, ["Diverse connections", "Olika förbindelser"], [
            io(["Budget approved", "Budget beviljad"], ["Management approves the budget for a second carrier and satellite backup without a fight. The storm made the case.", "Ledningen beviljar budgeten för en andra operatör och satellitreserv utan strid. Stormen gjorde argumenten åt er."], ["Budget for diverse connections has been approved.", "Budget för olika förbindelser har beviljats."]),
            io(["Same poles", "Samma stolpar"], ["A route survey shows the proposed second carrier runs its cables along the same road and poles as the first. On paper it is diverse; in a storm it is not.", "En kartläggning visar att den föreslagna andra operatören drar sina kablar längs samma väg och stolpar som den första. På papperet är det olika; i en storm är det inte det."], ["The proposed second carrier shares the first carrier's cable route.", "Den föreslagna andra operatören delar kabelsträckning med den första."], { reopen: true }),
            io(["A box nobody can use", "En låda ingen kan använda"], ["A satellite terminal arrives quickly. Nobody on staff has been trained to set it up.", "En satellitterminal levereras snabbt. Ingen i personalen har utbildats i att koppla upp den."], ["A satellite terminal has arrived; nobody is trained to use it.", "En satellitterminal har kommit; ingen är utbildad att använda den."])
          ]),
          ir("i2", { notChosen: "A" }, ["Only the credit", "Bara krediteringen"], [
            io(["Paid promptly", "Snabbt utbetald"], ["The telecom provider pays the service credit without argument. The matter feels closed.", "Teleoperatören betalar krediteringen utan diskussion. Ärendet känns avslutat."], ["The telecom provider paid the service credit promptly.", "Teleoperatören betalade krediteringen snabbt."]),
            io(["A contract condition", "Ett avtalsvillkor"], ["A large customer makes connectivity resilience a condition of renewing its contract. The credit does not answer that.", "En stor kund gör robusta förbindelser till ett villkor för att förnya avtalet. Krediteringen besvarar inte det."], ["A large customer made connectivity resilience a contract condition.", "En stor kund har gjort robusta förbindelser till ett avtalsvillkor."], { reopen: true, meters: { trust: -1 } }),
            io(["A priority tier", "En prioriterad nivå"], ["The provider offers a paid “priority” tier. The small print says emergency services still come first in a regional event.", "Operatören erbjuder en betald ”prioriterad” nivå. Det finstilta säger att samhällsviktiga tjänster ändå går först vid en regional händelse."], ["The provider offered a paid priority tier that still yields to emergency services.", "Operatören erbjöd en betald prioriterad nivå som ändå viker för samhällsviktiga tjänster."])
          ])
        ],
        choice: ask(["What do you do with that?", "Vad gör ni med det?"], ["Plans for suppliers failing in a regional event, not only for compensation.", "Planerar för att leverantörer fallerar vid en regional händelse, inte bara för ersättning."], [
          opt(["Plan for diverse connections and a satellite backup", "Planera för olika förbindelser och satellitreserv"], "c8", ["Assumes the region fails together.", "Utgår från att regionen fallerar samtidigt."], {
            pushback: [
              pb(["Who pays every year?", "Vem betalar varje år?"], ["Finance asks what a second carrier and satellite backup cost every year, for an event that may not happen again for a decade. Who argues for that budget, and what gets cut to pay for it?", "Ekonomi frågar vad en andra operatör och satellitreserv kostar varje år, för en händelse som kanske inte inträffar igen på tio år. Vem argumenterar för den budgeten, och vad stryks för att betala den?"]),
              pb(["Same poles, same ditch", "Samma stolpar, samma dike"], ["The second provider you were offered turns out to run its cables along the same road and poles as the first. Diverse on paper, it would fail in the same storm. Who checks the physical routes, and how?", "Den andra operatör ni erbjuds visar sig dra sina kablar längs samma väg och stolpar som den första. Olika på papperet, men den skulle falla i samma storm. Vem kontrollerar de fysiska sträckningarna, och hur?"]),
              pb(["Another device in a cupboard", "Ännu en pryl i ett skåp"], ["A satellite terminal is only useful if someone can set it up in the dark. Nobody on staff knows how, and the obvious person to train is already responsible for every other backup. Is this a plan, or another box in a cupboard?", "En satellitterminal är bara till nytta om någon kan koppla upp den i mörker. Ingen i personalen kan det, och den självklara att utbilda ansvarar redan för alla andra reservlösningar. Är det här en plan, eller ännu en låda i ett skåp?"])
            ]
          }),
          opt(["Claim the service credit", "Kräv servicekompensationen"], "c8", ["A small cheque.", "En liten check."], {
            pushback: [
              pb(["Closing the matter", "Att avsluta ärendet"], ["The credit is a fraction of one day's lost deliveries. Your contract manager notes that accepting it may also close the matter for good. Is that small sum worth giving up any further claim?", "Krediteringen är en bråkdel av en dags uteblivna leveranser. Er avtalsansvarige påpekar att om ni tar emot den kan ärendet också vara avslutat för gott. Är den lilla summan värd att avstå från alla vidare krav?"]),
              pb(["The same next time", "Samma sak nästa gång"], ["The telecom provider makes clear that in a regional event it will again prioritise emergency services before business customers. The next storm will look exactly like this one. What has claiming the credit changed?", "Teleoperatören gör klart att den vid en regional händelse återigen prioriterar samhällsviktiga tjänster före företagskunder. Nästa storm kommer att se ut precis som den här. Vad har krediteringen ändrat?"]),
              pb(["Customers want to know", "Kunderna vill veta"], ["Two large customers ask what you are doing so that a storm cannot cut your communications again. The honest answer is “we claimed the credit”. Will that satisfy them?", "Två stora kunder frågar vad ni gör för att en storm inte ska kunna slå ut er kommunikation igen. Det ärliga svaret är ”vi krävde krediteringen”. Kommer det att räcka för dem?"])
            ]
          })
        ])
      }),

      pg("c8", ["Back to normal", "Tillbaka till det normala"], [
        "A week later, everything runs again. The roads are clear, deliveries have caught up and the depot is back to normal routines.\n\nEveryone is tired, and many would like to put the storm behind them as quickly as possible.",
        "En vecka senare fungerar allt igen. Vägarna är röjda, leveranserna har kommit ikapp och depån är tillbaka i sina vanliga rutiner.\n\nAlla är trötta, och många vill gärna lägga stormen bakom sig så fort som möjligt."
      ], {
        interrupts: [
          ir("i1", { chosen: "A" }, ["The review meets", "Genomgången hålls"], [
            io(["Staff speak up", "Personalen säger sitt"], ["Night-shift staff and site managers speak frankly, and the room hears things nobody had written down.", "Nattskiftet och platscheferna talar öppet, och rummet får höra saker som ingen hade skrivit ned."], ["The review gathered frank accounts from every site.", "Genomgången samlade in öppna berättelser från alla anläggningar."]),
            io(["It turns into blame", "Det blir skuldbeläggning"], ["The first session turns into an argument about who decided what on the first night. Two site managers walk out.", "Det första mötet blir ett gräl om vem som beslutade vad den första natten. Två platschefer går därifrån."], ["The first review session turned into an argument about blame.", "Det första mötet i genomgången blev ett gräl om skuld."], { reopen: true }),
            io(["A different story", "En annan berättelse"], ["The night shift's account of the first night differs from management's on several points. Both sides are sure they are right.", "Nattskiftets berättelse om den första natten skiljer sig från ledningens på flera punkter. Båda sidor är säkra på att de har rätt."], ["The night shift's account of the first night differs from management's.", "Nattskiftets bild av den första natten skiljer sig från ledningens."])
          ]),
          ir("i2", { notChosen: "A" }, ["Moving on", "Vidare"], [
            io(["Relief", "Lättnad"], ["Most staff seem relieved not to go through it all again. Work settles back into routine.", "De flesta verkar lättade över att slippa gå igenom allt igen. Arbetet faller tillbaka i sina rutiner."], ["Most staff seemed relieved to move on.", "De flesta i personalen verkade lättade över att gå vidare."]),
            io(["A formal request", "En formell begäran"], ["The safety representative files a formal request for a review of how staff were protected during the storm. Moving on now means refusing it in writing.", "Skyddsombudet lämnar in en formell begäran om en genomgång av hur personalen skyddades under stormen. Att gå vidare nu betyder att neka skriftligt."], ["The safety representative formally requested a review of the storm.", "Skyddsombudet har formellt begärt en genomgång av stormen."], { reopen: true }),
            io(["An unofficial version", "En inofficiell version"], ["An unofficial account of the storm, written by staff, is circulating internally. Parts of it are accurate.", "En inofficiell berättelse om stormen, skriven av personal, cirkulerar internt. Delar av den stämmer."], ["An unofficial staff account of the storm is circulating internally.", "En inofficiell berättelse om stormen, skriven av personal, cirkulerar internt."])
          ])
        ],
        choice: ask(["What happens now?", "Vad händer nu?"], ["Holds an after-action review with the people who were there.", "Håller en genomgång efteråt med dem som var där."], [
          opt(["An after-action review with staff from every site", "En genomgång efteråt med personal från alla anläggningar"], "c9", ["Captures what really happened.", "Fångar vad som verkligen hände."], {
            pushback: [
              pb(["Nobody wants to relive it", "Ingen vill uppleva det igen"], ["Several night-shift staff say they would rather not go through the storm again in a meeting, and some are still angry. Do you require them to attend, or hold the review without the people who were there?", "Flera i nattskiftet säger att de helst inte vill gå igenom stormen igen på ett möte, och några är fortfarande arga. Kräver ni att de kommer, eller håller ni genomgången utan dem som var där?"]),
              pb(["Managers fear blame", "Cheferna fruktar skuld"], ["Site managers worry the review will be used to blame them for decisions they made without any contact with the crisis team. If they get defensive, you learn nothing. Who leads the review, and what do you promise them?", "Platscheferna oroar sig för att genomgången ska användas för att skylla på dem för beslut de fattade utan kontakt med krisgruppen. Om de går i försvarsställning lär ni er ingenting. Vem leder genomgången, och vad lovar ni dem?"]),
              pb(["Another day without deliveries", "Ännu en dag utan leveranser"], ["Bringing staff from every site together means pausing deliveries for a day, just after you finally caught up. Operations asks whether a short survey would do instead. Would it?", "Att samla personal från alla anläggningar betyder att leveranserna står still en dag, precis när ni äntligen kommit ikapp. Verksamheten frågar om det inte räcker med en kort enkät. Gör det det?"])
            ]
          }),
          opt(["Move on", "Gå vidare"], "c9", ["And repeat it next storm.", "Och upprepa det vid nästa storm."], {
            pushback: [
              pb(["The safety rep asks formally", "Skyddsombudet begär formellt"], ["The safety representative formally requests a review of how staff were protected during the storm. Refusing it in writing will be on record. Do you still move on?", "Skyddsombudet begär formellt en genomgång av hur personalen skyddades under stormen. Ett skriftligt nej kommer att finnas dokumenterat. Går ni ändå vidare?"]),
              pb(["Another storm is coming", "En ny storm är på väg"], ["The forecast warns of another autumn storm within weeks. Nothing has changed since the last one. If it arrives next week, what will you do differently?", "Prognosen varnar för ännu en höststorm inom några veckor. Ingenting har ändrats sedan förra. Om den kommer nästa vecka, vad gör ni annorlunda?"]),
              pb(["Staff write their own version", "Personalen skriver sin egen version"], ["Without a review, staff tell each other their own version of what went wrong, and it does not flatter management. Are you sure that moving on means the story stops?", "Utan en genomgång berättar personalen sin egen version för varandra om vad som gick fel, och den är inte smickrande för ledningen. Är ni säkra på att historien tar slut bara för att ni går vidare?"])
            ]
          })
        ])
      }),

      pg("c9", ["The continuity plan", "Kontinuitetsplanen"], [
        "Someone reads the business continuity plan aloud. It assumed, on almost every page, that phones would work and that people could be reached.\n\nIt was written four years ago, and nobody had ever tested it.",
        "Någon läser kontinuitetsplanen högt. På nästan varje sida utgick den från att telefonerna skulle fungera och att folk gick att nå.\n\nDen skrevs för fyra år sedan, och ingen hade någonsin testat den."
      ], {
        interrupts: [
          ir("i1", { chosen: "A" }, ["Exercise and kit", "Övning och krislåda"], [
            io(["A date is set", "Ett datum är satt"], ["Management backs the plan and the first blackout exercise gets a date in the calendar.", "Ledningen ställer sig bakom planen och den första övningen med strömavbrott får ett datum i kalendern."], ["The first blackout exercise has a date in the calendar.", "Den första övningen med strömavbrott har ett datum i kalendern."]),
            io(["Operations says no", "Verksamheten säger nej"], ["Operations refuses to give up a delivery day for the exercise and takes it to the CEO. Without that day, the exercise is paper again.", "Verksamheten vägrar avstå en leveransdag för övningen och tar det till vd. Utan den dagen blir övningen papper igen."], ["Operations refused to give up a delivery day for the exercise.", "Verksamheten vägrade avstå en leveransdag för övningen."], { reopen: true }),
            io(["An old kit", "En gammal krislåda"], ["Someone finds an old crisis kit in a storeroom: a radio with no batteries and a list of people who have left.", "Någon hittar en gammal krislåda i ett förråd: en radio utan batterier och en lista med personer som har slutat."], ["An old, half-stocked crisis kit was found in a storeroom.", "En gammal, halvtom krislåda hittades i ett förråd."])
          ]),
          ir("i2", { notChosen: "A" }, ["Only the document", "Bara dokumentet"], [
            io(["Approved as written", "Godkänt som det är"], ["The updated plan is approved without changes and praised for being clear. It reads well.", "Den uppdaterade planen godkänns utan ändringar och får beröm för att vara tydlig. Den är bra att läsa."], ["The updated continuity plan was approved without changes.", "Den uppdaterade kontinuitetsplanen godkändes utan ändringar."]),
            io(["The insurer wants a test", "Försäkringsbolaget vill se ett test"], ["The insurer makes a tested continuity plan a condition of renewing your cover. An updated document does not meet it.", "Försäkringsbolaget gör en testad kontinuitetsplan till villkor för att förnya försäkringen. Ett uppdaterat dokument uppfyller inte det."], ["The insurer made a tested plan a condition of renewal.", "Försäkringsbolaget har gjort en testad plan till villkor för förnyelse."], { reopen: true }),
            io(["No owner", "Ingen ägare"], ["The updated plan is finished, but the cover page has no owner's name. Nobody volunteers.", "Den uppdaterade planen är klar, men försättsbladet saknar en ägare. Ingen anmäler sig."], ["The updated plan has no named owner yet.", "Den uppdaterade planen har ännu ingen namngiven ägare."])
          ])
        ],
        choice: ask(["What do you change?", "Vad ändrar ni?"], ["Tests the plan in a blackout exercise and adds offline fallbacks.", "Testar planen i en övning med strömavbrott och lägger till reservlösningar som fungerar utan nät."], [
          opt(["A yearly blackout exercise and an offline crisis kit", "En årlig övning med strömavbrott och en krislåda som fungerar utan nät"], "c10", ["Practice, not paper.", "Övning, inte papper."], {
            pushback: [
              pb(["A day without systems", "En dag utan system"], ["A real blackout exercise means switching things off for a day, and operations refuse to lose a day of deliveries every year. Do you exercise on paper after all, or pay for doing it properly?", "En riktig övning med strömavbrott innebär att stänga av saker en hel dag, och verksamheten vägrar förlora en leveransdag varje år. Övar ni på papper ändå, eller betalar ni för att göra det ordentligt?"]),
              pb(["Who owns the kit?", "Vem äger krislådan?"], ["The offline kit needs charged batteries, current contact lists and someone who checks it every quarter. Kits like this are usually forgotten within a year. Who owns it, by name?", "Krislådan behöver laddade batterier, aktuella kontaktlistor och någon som kontrollerar den varje kvartal. Sådana lådor brukar vara bortglömda inom ett år. Vem äger den, med namn?"]),
              pb(["Exercising a broken plan", "Att öva på en trasig plan"], ["An exercise tests the plan, but the plan still assumes working phones on almost every page. Do you rewrite it before the first exercise, which delays it, or exercise a plan you already know is wrong?", "En övning testar planen, men planen förutsätter fortfarande fungerande telefoner på nästan varje sida. Skriver ni om den före första övningen, vilket skjuter upp den, eller övar ni på en plan ni redan vet är fel?"])
            ]
          }),
          opt(["Update the document", "Uppdatera dokumentet"], "c10", ["Paper again.", "Papper igen."], {
            pushback: [
              pb(["Untested again", "Otestad igen"], ["The updated document will read better, but nobody will know whether it works until the next storm. That is exactly what happened last time. What makes this version different?", "Det uppdaterade dokumentet blir bättre att läsa, men ingen vet om det fungerar förrän nästa storm. Det är precis vad som hände förra gången. Vad gör den här versionen annorlunda?"]),
              pb(["Nobody owns it", "Ingen äger den"], ["The person who wrote the plan four years ago has since moved to another role, and nobody owns it now. Who updates it, and who checks that they actually did?", "Den som skrev planen för fyra år sedan har bytt roll, och ingen äger den nu. Vem uppdaterar den, och vem kontrollerar att det faktiskt blev gjort?"]),
              pb(["The insurer wants a test", "Försäkringsbolaget vill se ett test"], ["The insurer asks whether the continuity plan has been tested, as a condition for renewing your cover. An updated document is not a test. What do you answer?", "Försäkringsbolaget frågar om kontinuitetsplanen har testats, som villkor för att förnya försäkringen. Ett uppdaterat dokument är inget test. Vad svarar ni?"])
            ]
          })
        ])
      }),

      pg("c10", ["The scam lesson", "Lärdomen om bedrägerierna"], [
        "The last finding of the review is about the scams. They peaked exactly when people were most tired and least able to check anything: on the first night and the morning after.\n\nThe crisis plan says nothing about fraud. Next time, the scammers will be just as quick.",
        "Det sista fyndet i genomgången handlar om bedrägerierna. De nådde sin topp precis när folk var som tröttast och minst kunde kontrollera något: den första natten och morgonen efter.\n\nKrisplanen säger ingenting om bedrägerier. Nästa gång kommer bedragarna att vara lika snabba."
      ], {
        interrupts: [
          ir("i1", { chosen: "A" }, ["The warning line", "Varningsraden"], [
            io(["Template ready", "Mallen är klar"], ["Communications adds a short scam warning to the first-message template. It took an afternoon.", "Kommunikation lägger till en kort varning för bedrägerier i mallen för det första krismeddelandet. Det tog en eftermiddag."], ["A scam warning line is now in the first crisis message template.", "En varningsrad om bedrägerier finns nu i mallen för det första krismeddelandet."]),
            io(["The safety line is missed", "Säkerhetsbeskedet missas"], ["In a test send, most staff remember the scam warning and miss the instruction about where to go. The first message is now too crowded.", "I ett testutskick minns de flesta varningen för bedrägerier men missar beskedet om vart de ska ta vägen. Det första meddelandet är nu för fullt."], ["In a test send, staff missed the safety instruction.", "I ett testutskick missade personalen säkerhetsbeskedet."], { reopen: true }),
            io(["Scammers copy warnings", "Bedragare kopierar varningar"], ["A peer network of security leads reports that scammers now copy crisis warnings word for word. A warning is only as good as its channel.", "Ett nätverk av säkerhetsansvariga rapporterar att bedragare nu kopierar krisvarningar ord för ord. En varning är bara så bra som sin kanal."], ["Scammers are known to copy crisis warnings word for word.", "Bedragare är kända för att kopiera krisvarningar ord för ord."])
          ]),
          ir("i2", { notChosen: "A" }, ["Nothing in the plan", "Inget i planen"], [
            io(["Quiet months", "Lugna månader"], ["Since the storm, no new scams have been reported. It does look like a one-off.", "Sedan stormen har inga nya bedrägerier rapporterats. Det ser faktiskt ut som en engångsföreteelse."], ["No new storm-related scams have been reported since.", "Inga nya stormrelaterade bedrägerier har rapporterats sedan dess."]),
            io(["A new scam", "Ett nytt bedrägeri"], ["Weeks later, staff receive an email about a “storm compensation fund” asking for bank details. It is the same trick, back again.", "Några veckor senare får personalen ett mejl om en ”stormersättningsfond” som ber om bankuppgifter. Det är samma knep, tillbaka igen."], ["A new storm-themed scam reached staff weeks after the storm.", "Ett nytt stormtema-bedrägeri nådde personalen några veckor efter stormen."], { reopen: true }),
            io(["A written dissent", "En skriftlig reservation"], ["The CISO puts a written dissent on file. It changes nothing today, and it will be read after the next crisis.", "Säkerhetschefen lämnar en skriftlig reservation. Den ändrar ingenting i dag, och den kommer att läsas efter nästa kris."], ["The CISO has put a written dissent on file.", "Säkerhetschefen har lämnat en skriftlig reservation."])
          ])
        ],
        choice: ask(["What goes into the crisis plan?", "Vad förs in i krisplanen?"], ["Puts security warnings into crisis communications from the first hour.", "För in säkerhetsvarningar i kriskommunikationen från första timmen."], [
          opt(["Scam warnings in the first crisis message", "Varningar för bedrägerier i det första krismeddelandet"], "r-end", ["Prevents the predictable.", "Förebygger det förutsägbara."], {
            pushback: [
              pb(["The first message is crowded", "Det första meddelandet är fullt"], ["Communications argues that the first crisis message must be short: are you safe, and where do you go. A fraud warning may bury what matters most. What comes out to make room?", "Kommunikation menar att det första krismeddelandet måste vara kort: är du i säkerhet, och vart ska du. En varning för bedrägerier kan dränka det viktigaste. Vad stryks för att ge plats?"]),
              pb(["Warnings become wallpaper", "Varningar blir tapet"], ["Staff already get phishing warnings every month and have stopped reading them. A standard line in every crisis message may be ignored just the same. How do you make it noticed when it counts?", "Personalen får redan varningar för nätfiske varje månad och har slutat läsa dem. En standardrad i varje krismeddelande kan ignoreras på samma sätt. Hur får ni den att märkas när det gäller?"]),
              pb(["Which channel is real?", "Vilken kanal är äkta?"], ["A warning only works if people know where real messages come from. If the crisis message arrives by email with the logo, it looks just like the scams. Which channel carries the warning, and does everyone know it?", "En varning fungerar bara om folk vet varifrån de riktiga meddelandena kommer. Om krismeddelandet kommer via mejl med logotypen ser det ut precis som bedrägerierna. Vilken kanal bär varningen, och känner alla till den?"])
            ]
          }),
          opt(["Nothing; it was a one-off", "Ingenting; det var en engångsföreteelse"], "r-end", ["It never is.", "Det är det aldrig."], {
            pushback: [
              pb(["Staff who lost out", "Personal som drabbades"], ["Some staff gave away bank details and codes during the storm. HR asks what to tell them about next time. Is “it was a one-off” something you can say to their faces?", "En del anställda lämnade ut bankuppgifter och koder under stormen. HR frågar vad de ska säga till dem om nästa gång. Är ”det var en engångsföreteelse” något ni kan säga till dem öga mot öga?"]),
              pb(["The CISO disagrees", "Säkerhetschefen håller inte med"], ["The CISO points out that scammers follow every regional crisis, not only this one. Leaving fraud out of the plan leaves the same gap next time. On what basis do you call it a one-off?", "Säkerhetschefen påpekar att bedragare följer varje regional kris, inte bara den här. Att lämna bedrägerier utanför planen lämnar samma lucka nästa gång. På vilken grund kallar ni det en engångsföreteelse?"]),
              pb(["The insurer asks about controls", "Försäkringsbolaget frågar om åtgärder"], ["The insurer notes that staff fraud losses during the storm fell outside your cover, and asks what controls you have added since. Do you want to answer “none”?", "Försäkringsbolaget noterar att personalens bedrägeriförluster under stormen inte omfattades av försäkringen, och frågar vilka åtgärder ni har infört sedan dess. Vill ni svara ”inga”?"])
            ]
          })
        ])
      }),

      pg("r-end", ["Outcome", "Utfall"], ["Routing to the ending.", "Vidare till slutet."], {
        route: rt([
          [["fallbackComms", "staffSafe", "phishWarned"], "e1"],
          [["staffSafe", "phishWarned"], "e2"],
          ["staffSafe", "e3"],
          [null, "e4"]
        ])
      }),

      pg("e1", ["A month later", "En månad senare"], ["The crisis team met within the hour, everyone on the night shift was accounted for and safe, and staff recognised a scam when they saw one.\n\nThe storm cost money, in spoiled goods and overtime, but nothing more. The municipality thanked you publicly for the trucks.", "Krisledningen möttes inom en timme, alla på nattskiftet var kontrollerade och i säkerhet, och personalen kände igen ett bedrägeri när de såg ett.\n\nStormen kostade pengar, i förstörda varor och övertid, men inget mer. Kommunen tackade er offentligt för lastbilarna."], {
        ending: end(1, ["Ready for the dark", "Redo för mörkret"], [
          "The crisis team met within the hour, everyone on shift was safe, and staff knew a scam when they saw one. The storm cost money, nothing more.",
          "Krisgruppen samlades inom en timme, alla i tjänst var i säkerhet och personalen kände igen ett bedrägeri när de såg det. Stormen kostade pengar, inget mer."
        ])
      }),
      pg("e2", ["A month later", "En månad senare"], ["Staff were safe and the scams were blocked.\n\nBut it took hours to get the crisis team together, because the plan depended on phones that did not work. The review asks for a fallback that works without phones, and a date when it will be tested.", "Personalen var i säkerhet och bedrägerierna stoppades.\n\nMen det tog timmar att samla krisledningen, eftersom planen byggde på telefoner som inte fungerade. Genomgången kräver en reservlösning som fungerar utan telefoner, och ett datum då den ska testas."], {
        ending: end(2, ["Safe, but slow to gather", "Säkert, men långsamt att samlas"], [
          "Staff were safe and scams were blocked, but it took hours to get the crisis team together. The review asks for a fallback that works without phones.",
          "Personalen var i säkerhet och bedrägerierna stoppades, men det tog timmar att samla krisgruppen. Genomgången efterfrågar en reservlösning som fungerar utan telefoner."
        ])
      }),
      pg("e3", ["A month later", "En månad senare"], ["Everyone was safe, which mattered most.\n\nBut staff handed over bank details and authenticator codes to the storm scammers. Accounts have to be cleaned, salary payments checked by hand, and one employee's salary went to a criminal's account.", "Alla var i säkerhet, vilket var det viktigaste.\n\nMen personalen lämnade ut bankuppgifter och autentiseringskoder till stormbedragarna. Konton måste rensas, lönebetalningar kontrolleras för hand, och en anställds lön gick till en kriminells konto."], {
        ending: end(3, ["Safe, then scammed", "I säkerhet, sedan lurade"], [
          "Everyone was safe, but staff handed over bank details and authenticator codes to storm scammers. Accounts must be cleaned and salaries checked.",
          "Alla var i säkerhet, men personal lämnade ut bankuppgifter och koder till stormbedragare. Konton måste saneras och löner kontrolleras."
        ])
      }),
      pg("e4", ["Two months later", "Två månader senare"], ["Nobody accounted for the night shift, and someone was hurt on a closed road on their way home.\n\nThe work environment authority has opened an inquiry into how the company protects staff in a crisis. The colleague is recovering, but the question of why nobody called them is still unanswered.", "Ingen kontrollerade nattskiftet, och en person skadades på en avstängd väg på väg hem.\n\nArbetsmiljömyndigheten har inlett en utredning om hur företaget skyddar personalen i en kris. Kollegan återhämtar sig, men frågan om varför ingen ringde är fortfarande obesvarad."], {
        ending: end(4, ["Nobody counted", "Ingen räknade"], [
          "Nobody accounted for the night shift, and someone was hurt on a closed road. The work environment authority opens an inquiry.",
          "Ingen redovisade nattskiftet, och någon skadades på en avstängd väg. Arbetsmiljömyndigheten inleder en utredning."
        ])
      }),

      // Break-away: "it was a cyberattack".
      pg("x1", ["A convenient attack", "Ett lägligt angrepp"], [
        "Your statement to the press blames a cyberattack for the delays. It sounds better than “we had no plan for a storm”.\n\nThe evening news reports that {{org.name}} was hit by a cyberattack during the storm. The next morning {{reg.csirt}} calls: they want details of the attack, so they can warn others.",
        "Ert uttalande till pressen skyller förseningarna på en cyberattack. Det låter bättre än ”vi hade ingen plan för en storm”.\n\nKvällsnyheterna rapporterar att {{org.name}} drabbades av en cyberattack under stormen. Nästa morgon ringer {{reg.csirt}}: de vill ha detaljer om attacken, så att de kan varna andra."
      ], {
        interrupts: [
          ir("i1", { chosen: "A" }, ["The truth to the CSIRT", "Sanningen till CSIRT"], [
            io(["Closed quietly", "Stängt i tysthet"], ["{{reg.csirt}} thanks you for being straight and closes the report as a non-incident.", "{{reg.csirt}} tackar för ett rakt besked och stänger rapporten som en icke-incident."], ["{{reg.csirt}} closed the report as a non-incident.", "{{reg.csirt}} stängde rapporten som en icke-incident."]),
            io(["A journalist checks", "En journalist kontrollerar"], ["A journalist calls {{reg.csirt}} to follow up the story. They confirm they have no record of an attack.", "En journalist ringer {{reg.csirt}} för att följa upp nyheten. De bekräftar att de inte har något angrepp registrerat."], ["{{reg.csirt}} told a journalist it has no record of an attack.", "{{reg.csirt}} har sagt till en journalist att de inte har något angrepp registrerat."], { meters: { media: 1 } }),
            io(["A written summary", "En skriftlig sammanfattning"], ["{{reg.csirt}} asks for a short written summary of the outage, for their records. It will sit next to your press statement.", "{{reg.csirt}} ber om en kort skriftlig sammanfattning av avbrottet, för sina arkiv. Den kommer att ligga bredvid ert pressuttalande."], ["{{reg.csirt}} asked for a written summary of the outage.", "{{reg.csirt}} har bett om en skriftlig sammanfattning av avbrottet."])
          ]),
          ir("i2", { notChosen: "A" }, ["Vague with the CSIRT", "Vaga mot CSIRT"], [
            io(["Accepted, for now", "Godtaget, tills vidare"], ["{{reg.csirt}} takes your answers without pushing. For the moment, it seems to have worked.", "{{reg.csirt}} tar emot era svar utan att trycka på. För stunden verkar det ha fungerat."], ["{{reg.csirt}} accepted your vague answers for now.", "{{reg.csirt}} godtog era vaga svar tills vidare."]),
            io(["A regional warning", "En regional varning"], ["{{reg.csirt}} drafts a warning to other companies in the region, based on your report. They send you the draft to check.", "{{reg.csirt}} skriver ett utkast till en varning till andra företag i regionen, utifrån er rapport. De skickar utkastet till er för granskning."], ["{{reg.csirt}} drafted a regional warning based on your report.", "{{reg.csirt}} har skrivit ett utkast till regional varning utifrån er rapport."], { reopen: true, meters: { regulator: 1 } }),
            io(["A meeting request", "En begäran om möte"], ["{{reg.csirt}} asks for a meeting with your technical staff next week. They are polite, and they are not dropping it.", "{{reg.csirt}} ber om ett möte med er tekniska personal nästa vecka. De är artiga, och de släpper det inte."], ["{{reg.csirt}} has requested a meeting with your technical staff.", "{{reg.csirt}} har begärt ett möte med er tekniska personal."])
          ])
        ],
        choice: ask(["What do you tell the CSIRT?", "Vad säger ni till CSIRT?"], ["Tells the authority the truth immediately.", "Berättar sanningen för myndigheten omedelbart."], [
          opt(["The truth: it was the storm", "Sanningen: det var stormen"], "x2", ["Now the press statement is the problem.", "Nu är pressuttalandet problemet."], {
            pushback: [
              pb(["“Will you correct it?”", "”Tänker ni rätta det?”"], ["Once you tell {{reg.csirt}} the truth, an authority knows your public statement is false. They ask whether you intend to correct it, and when. What do you answer, and are you ready to do it?", "När ni berättar sanningen för {{reg.csirt}} vet en myndighet att ert offentliga uttalande är falskt. De frågar om ni tänker rätta det, och när. Vad svarar ni, och är ni redo att göra det?"]),
              pb(["Leave the statement out", "Nämn inte uttalandet"], ["The CEO, whose name is on the press statement, asks you to tell the CSIRT it was the storm without mentioning the statement at all. They have already seen the news. Can you tell half the truth to an authority?", "Vd, vars namn står på pressuttalandet, ber er säga till CSIRT att det var stormen utan att nämna uttalandet alls. De har redan sett nyheterna. Kan ni berätta halva sanningen för en myndighet?"]),
              pb(["Two records disagree", "Två versioner som går isär"], ["The CSIRT notes that the reported attack was not an attack. Your press statement and their records now say opposite things. What happens when a journalist calls them to check?", "CSIRT noterar att det rapporterade angreppet inte var något angrepp. Ert pressuttalande och deras anteckningar säger nu motsatta saker. Vad händer när en journalist ringer dem för att kontrollera?"])
            ]
          }),
          opt(["Vague answers", "Vaga svar"], "x2", ["An authority now spends time on a false lead.", "En myndighet lägger nu tid på ett falskt spår."], {
            pushback: [
              pb(["They want logs", "De vill ha loggar"], ["The CSIRT asks for logs, times and technical details. Vague answers only bring more questions and a request for a meeting. How long can you stay vague with an authority?", "CSIRT ber om loggar, tidpunkter och tekniska detaljer. Vaga svar leder bara till fler frågor och en begäran om ett möte. Hur länge kan ni vara vaga mot en myndighet?"]),
              pb(["A warning to others", "En varning till andra"], ["Based on your report, the CSIRT is considering warning other companies in the region about an attack. Do you let them warn others about something that never happened?", "Utifrån er rapport överväger CSIRT att varna andra företag i regionen för ett angrepp. Låter ni dem varna andra för något som aldrig hände?"]),
              pb(["IT won't play along", "IT ställer inte upp"], ["The IT staff asked to join the call refuse to describe an attack they never saw. Without them, nobody in the room can answer a technical question. Who speaks to the authority now?", "IT-personalen som ombeds delta i samtalet vägrar beskriva ett angrepp de aldrig har sett. Utan dem kan ingen i rummet svara på en teknisk fråga. Vem talar med myndigheten nu?"])
            ]
          })
        ])
      }),
      pg("x2", ["Staff talk", "Personalen pratar"], [
        "Staff who worked through the night read the news. Several of them tell the local paper there was no attack, only a storm and no plan.\n\nThe article quotes them by name, next to your statement.",
        "Anställda som arbetade igenom natten läser nyheterna. Flera av dem berättar för lokaltidningen att det inte var någon attack, bara en storm och ingen plan.\n\nArtikeln citerar dem med namn, bredvid ert uttalande."
      ], {
        interrupts: [
          ir("i1", { chosen: "A" }, ["The correction", "Rättelsen"], [
            io(["Printed prominently", "Tryckt tydligt"], ["The local paper prints the correction prominently and calls it unusual candour.", "Lokaltidningen trycker rättelsen tydligt och kallar den ovanligt uppriktig."], ["The local paper printed your correction prominently.", "Lokaltidningen tryckte er rättelse tydligt."], { meters: { media: -1 } }),
            io(["A bigger story", "En större nyhet"], ["Regional news picks up the correction: “Company admits inventing cyberattack.” More people now know than ever read the first story.", "Regionala nyheter tar upp rättelsen: ”Företag erkänner påhittad cyberattack.” Fler känner nu till det än någonsin läste den första nyheten."], ["Regional news reported that you admitted inventing the attack.", "Regionala nyheter rapporterade att ni erkänt att angreppet var påhittat."], { meters: { media: 1 } }),
            io(["Staff left out", "Personalen utelämnad"], ["The staff quoted in the paper say the correction does not mention them, and they still do not know whether they will be punished.", "De anställda som citerades i tidningen säger att rättelsen inte nämner dem, och de vet fortfarande inte om de kommer att straffas."], ["The quoted staff say the correction ignored them.", "De citerade anställda säger att rättelsen förbigick dem."])
          ]),
          ir("i2", { notChosen: "A" }, ["Saying nothing more", "Inget mer sägs"], [
            io(["No follow-up", "Ingen uppföljning"], ["The next day the paper moves on to storm damage elsewhere. It looks as if the story has died.", "Dagen efter går tidningen vidare till stormskador på annat håll. Det ser ut som att nyheten har dött."], ["The local paper ran no follow-up the next day.", "Lokaltidningen gjorde ingen uppföljning dagen efter."]),
            io(["A second article", "En andra artikel"], ["A second article adds more staff accounts by name, and asks why management still says nothing.", "En andra artikel lägger till fler anställdas berättelser med namn, och frågar varför ledningen fortfarande tiger."], ["A second article added more named staff accounts.", "En andra artikel lade till fler namngivna anställdas berättelser."], { reopen: true, meters: { media: 1 } }),
            io(["Private questions", "Frågor i det tysta"], ["Customers are asking account managers privately whether there was an attack. The answers vary.", "Kunder frågar kundansvariga i det tysta om det var ett angrepp. Svaren varierar."], ["Customers are asking privately whether there was an attack.", "Kunder frågar i det tysta om det var ett angrepp."])
          ])
        ],
        choice: ask(["How do you respond?", "Hur svarar ni?"], ["Corrects the record publicly.", "Rättar uppgifterna offentligt."], [
          opt(["Correct it publicly", "Rätta det offentligt"], "x3", ["Necessary.", "Nödvändigt."], {
            pushback: [
              pb(["“Wrong” or “misunderstood”?", "”Fel” eller ”missförstått”?"], ["Your lawyers worry that admitting a false statement could be used against you in later disputes. They suggest saying the statement was “misunderstood”. Do you say you were wrong, or that you were misunderstood?", "Era jurister oroar sig för att ett erkännande av ett falskt uttalande kan användas mot er i senare tvister. De föreslår att ni säger att uttalandet ”missförstods”. Säger ni att ni hade fel, eller att ni blev missförstådda?"]),
              pb(["Who faces the press?", "Vem möter pressen?"], ["The CEO, whose name was on the first statement, wants the communications team to issue the correction. Comms says the correction must come from the person who made the claim. Who stands up?", "Vd, vars namn stod på det första uttalandet, vill att kommunikationsavdelningen går ut med rättelsen. Kommunikation säger att rättelsen måste komma från den som gjorde påståendet. Vem ställer sig upp?"]),
              pb(["Staff quoted by name", "Personal citerad med namn"], ["The staff quoted in the paper fear they will be punished for talking. A correction that ignores them looks like you are only reacting to being caught. What do you say to them, and in public?", "De anställda som citeras i tidningen är rädda för att straffas för att de pratat. En rättelse som inte nämner dem ser ut som att ni bara reagerar på att ha blivit avslöjade. Vad säger ni till dem, och offentligt?"])
            ]
          }),
          opt(["Say nothing more", "Säg inget mer"], "x3", ["The paper prints both stories.", "Tidningen trycker båda versionerna."], {
            pushback: [
              pb(["“No comment”, next to their names", "”Ingen kommentar”, bredvid deras namn"], ["The local paper asks for comment on the staff's account and will print “no comment” next to their names. Silence reads as admission. Do you still say nothing?", "Lokaltidningen ber om en kommentar till personalens berättelse och kommer att trycka ”ingen kommentar” bredvid deras namn. Tystnad läses som ett erkännande. Säger ni fortfarande ingenting?"]),
              pb(["Managers want discipline", "Chefer vill ha disciplinåtgärder"], ["Some managers want to discipline the staff who spoke to the press. Doing so would confirm everything they said and could breach their right to speak out. Do you stop them?", "Några chefer vill vidta disciplinåtgärder mot de anställda som pratade med pressen. Det skulle bekräfta allt de sa och kan bryta mot deras rätt att uttala sig. Stoppar ni cheferna?"]),
              pb(["Customers ask directly", "Kunderna frågar rakt ut"], ["Two customers ask you directly: was there an attack or not? Saying nothing in public does not answer them in private. What do you tell customers that you will not say to the paper?", "Två kunder frågar er rakt ut: var det ett angrepp eller inte? Att tiga offentligt besvarar inte deras fråga. Vad säger ni till kunderna som ni inte säger till tidningen?"])
            ]
          })
        ])
      }),
      pg("x3", ["The insurer", "Försäkringsbolaget"], [
        "Your insurer has seen the news too. It notes the claim of a cyberattack, and asks whether you intend to claim under the cyber policy rather than the property policy.\n\nThe answer will be put in writing and compared with the evidence.",
        "Ert försäkringsbolag har också sett nyheterna. Det noterar påståendet om en cyberattack och frågar om ni tänker göra anspråk på cyberförsäkringen i stället för egendomsförsäkringen.\n\nSvaret kommer att dokumenteras skriftligt och jämföras med bevisen."
      ], {
        interrupts: [
          ir("i1", { chosen: "A" }, ["Weather, in writing", "Vädret, skriftligt"], [
            io(["The claim proceeds", "Anspråket går vidare"], ["The insurer starts processing the claim under the property policy, with no further questions for now.", "Försäkringsbolaget börjar hantera anspråket under egendomsförsäkringen, utan fler frågor för stunden."], ["The insurer is processing the claim under the property policy.", "Försäkringsbolaget hanterar anspråket under egendomsförsäkringen."]),
            io(["Explain the difference", "Förklara skillnaden"], ["The insurer asks, in writing, why your answer to them contradicts your public statement. The letter is copied to their legal team.", "Försäkringsbolaget frågar skriftligt varför ert svar till dem motsäger ert offentliga uttalande. Brevet går också till deras juridiska avdelning."], ["The insurer asked in writing why your statements differ.", "Försäkringsbolaget har skriftligt frågat varför era uttalanden skiljer sig."]),
            io(["Finance grumbles", "Ekonomi muttrar"], ["Finance estimates that the cyber policy would have paid more, and says so in a meeting.", "Ekonomi uppskattar att cyberförsäkringen hade betalat mer, och säger det på ett möte."], ["Finance believes the cyber policy would have paid more.", "Ekonomi tror att cyberförsäkringen hade betalat mer."])
          ]),
          ir("i2", { notChosen: "A" }, ["The option kept open", "Möjligheten hålls öppen"], [
            io(["Noted, no comment", "Noterat, ingen kommentar"], ["The insurer notes your answer without comment. Nothing seems to happen.", "Försäkringsbolaget noterar ert svar utan kommentar. Ingenting verkar hända."], ["The insurer recorded that you kept the cyber option open.", "Försäkringsbolaget noterade att ni höll cybermöjligheten öppen."]),
            io(["All payouts paused", "Alla utbetalningar pausade"], ["The insurer pauses every payout, property claim included, until the cause of the loss is clear.", "Försäkringsbolaget pausar alla utbetalningar, även egendomsanspråket, tills orsaken till förlusten är klarlagd."], ["The insurer paused all payouts until the cause is clear.", "Försäkringsbolaget har pausat alla utbetalningar tills orsaken är klarlagd."], { reopen: true }),
            io(["Sent for review", "Skickat för granskning"], ["The insurer refers the file to its claims investigation team. It may be routine.", "Försäkringsbolaget skickar ärendet till sin utredningsgrupp för skador. Det kan vara rutin."], ["The insurer referred the file to its claims investigation team.", "Försäkringsbolaget har skickat ärendet till sin utredningsgrupp."])
          ])
        ],
        choice: ask(["What do you answer?", "Vad svarar ni?"], ["Keeps insurance claims strictly factual.", "Håller försäkringsanspråken strikt sakliga."], [
          opt(["No: the loss was weather", "Nej: förlusten berodde på vädret"], "x4", ["Correct, and awkward.", "Korrekt, och pinsamt."], {
            pushback: [
              pb(["In writing, against your statement", "Skriftligt, mot ert uttalande"], ["Your written answer to the insurer will say the opposite of your public statement, and the insurer can read both. They ask you to explain the difference. What do you put in writing?", "Ert skriftliga svar till försäkringsbolaget kommer att säga motsatsen till ert offentliga uttalande, och bolaget kan läsa båda. De ber er förklara skillnaden. Vad skriver ni?"]),
              pb(["The cyber policy covers more", "Cyberförsäkringen täcker mer"], ["Finance points out that the cyber policy might cover more of the losses than the property policy. Answering “weather” closes that door for good. Is anyone in the room tempted to keep it open?", "Ekonomi påpekar att cyberförsäkringen kanske täcker mer av förlusterna än egendomsförsäkringen. Att svara ”vädret” stänger den dörren för gott. Är någon i rummet frestad att hålla den öppen?"]),
              pb(["Prove it was only weather", "Bevisa att det bara var vädret"], ["Because you publicly blamed an attack, the insurer now asks for evidence that the losses were caused by the storm alone. Your records of the first night are thin. Can you document it?", "Eftersom ni offentligt skyllde på ett angrepp begär försäkringsbolaget nu bevis för att förlusterna orsakades av stormen enbart. Er dokumentation från första natten är tunn. Kan ni styrka det?"])
            ]
          }),
          opt(["Keep the option open", "Håll möjligheten öppen"], "x4", ["That road leads to fraud.", "Den vägen leder till bedrägeri."], {
            pushback: [
              pb(["What exactly is open?", "Vad är det som hålls öppet?"], ["The insurer reminds you that your answer is recorded and will be compared with the evidence. There is no evidence of an attack. What exactly are you keeping open, and for whom?", "Försäkringsbolaget påminner om att svaret dokumenteras och jämförs med bevisen. Det finns inga bevis för ett angrepp. Vad är det egentligen ni håller öppet, och för vem?"]),
              pb(["Finance won't sign", "Ekonomi skriver inte under"], ["The finance lead says they will not sign any claim that suggests an attack. Do you overrule them, find someone else to sign, or stop here?", "Ekonomichefen säger att hen inte skriver under något anspråk som antyder ett angrepp. Kör ni över hen, hittar ni någon annan som skriver under, eller stannar ni här?"]),
              pb(["All the money on hold", "Alla pengar på is"], ["The insurer says that until the cause is clear, it will pause the property claim as well. Keeping the option open may delay every payout you were counting on. Is it worth it?", "Försäkringsbolaget säger att det pausar även egendomsanspråket tills orsaken är klarlagd. Att hålla möjligheten öppen kan försena varje utbetalning ni räknade med. Är det värt det?"])
            ]
          })
        ])
      }),
      pg("x4", ["Trust", "Förtroende"], [
        "Customers and staff now question every statement from management, not only about the storm.\n\nThe union asks for an independent review, and two large customers ask for written assurances about your continuity planning.",
        "Kunder och personal ifrågasätter nu varje uttalande från ledningen, inte bara om stormen.\n\nFacket begär en oberoende granskning, och två stora kunder ber om skriftliga försäkringar om er kontinuitetsplanering."
      ], {
        interrupts: [
          ir("i1", { chosen: "A" }, ["The admission", "Erkännandet"], [
            io(["The union steps back", "Facket backar"], ["The union welcomes the honest review and drops its demand for an independent one.", "Facket välkomnar den ärliga genomgången och släpper kravet på en oberoende granskning."], ["The union dropped its demand for an independent review.", "Facket släppte kravet på en oberoende granskning."]),
            io(["Used against you", "Används mot er"], ["A large customer cites your admission in contract talks and asks for a lower price.", "En stor kund hänvisar till ert erkännande i avtalsförhandlingarna och begär ett lägre pris."], ["A large customer is using your admission in contract talks.", "En stor kund använder ert erkännande i avtalsförhandlingarna."], { meters: { trust: -1 } }),
            io(["Divided staff", "Delad personal"], ["Some staff say the admission took courage; others say it came too late.", "En del i personalen säger att erkännandet krävde mod; andra säger att det kom för sent."], ["Staff reaction to the admission is divided.", "Personalens reaktion på erkännandet är delad."])
          ]),
          ir("i2", { notChosen: "A" }, ["Waiting it out", "Att vänta ut det"], [
            io(["A quiet week", "En lugn vecka"], ["A week passes without new coverage. Waiting seems to be working.", "En vecka går utan nya artiklar. Att vänta verkar fungera."], ["A week passed without new coverage.", "En vecka gick utan nya artiklar."]),
            io(["The union goes public", "Facket går ut"], ["The union publicly demands an independent review and tells the press why.", "Facket kräver offentligt en oberoende granskning och berättar för pressen varför."], ["The union publicly demanded an independent review.", "Facket har offentligt krävt en oberoende granskning."], { reopen: true, meters: { media: 1 } }),
            io(["An audit request", "En begäran om revision"], ["A large customer asks to audit your continuity planning before signing the written assurances.", "En stor kund vill granska er kontinuitetsplanering innan den skriver under de skriftliga försäkringarna."], ["A large customer has asked to audit your continuity planning.", "En stor kund har begärt att få granska er kontinuitetsplanering."])
          ])
        ],
        choice: ask(["How do you rebuild it?", "Hur bygger ni upp det igen?"], ["Admits the misstatement and shares the honest review.", "Erkänner det felaktiga uttalandet och delar den ärliga genomgången."], [
          opt(["Admit it and publish the honest review", "Erkänn det och publicera den ärliga genomgången"], "e5", ["The slow way back.", "Den långsamma vägen tillbaka."], {
            pushback: [
              pb(["All of it, or edited?", "Allt, eller redigerat?"], ["An honest review shows not only the false statement but every decision that went wrong during the storm. Some managers ask to edit it before it goes out. Do you publish all of it?", "En ärlig genomgång visar inte bara det falska uttalandet utan varje beslut som gick fel under stormen. Några chefer vill redigera den innan den publiceras. Publicerar ni allt?"]),
              pb(["Who decided?", "Vem beslutade?"], ["Staff and the union ask who decided to blame a cyberattack. An admission without a name sounds as if nobody did it. Do you name the person who made the decision?", "Personalen och facket frågar vem som beslutade att skylla på ett cyberangrepp. Ett erkännande utan namn låter som om ingen gjorde det. Pekar ni ut den som fattade beslutet?"]),
              pb(["Honesty has a price", "Ärlighet har ett pris"], ["A large customer says it will use your admission in the coming contract negotiations. Being honest now will cost money. Do you still publish?", "En stor kund säger att den kommer att använda ert erkännande i de kommande avtalsförhandlingarna. Att vara ärlig nu kommer att kosta pengar. Publicerar ni ändå?"])
            ]
          }),
          opt(["Wait for it to blow over", "Vänta tills det blåser över"], "e5", ["It doesn't.", "Det gör det inte."], {
            pushback: [
              pb(["The union goes public", "Facket går ut offentligt"], ["The union presses its demand for an independent review and says it will take it to the press if there is no answer this week. Waiting hands them the stage. How long can you wait?", "Facket står fast vid kravet på en oberoende granskning och säger att det går till pressen om det inte får svar i veckan. Att vänta ger dem scenen. Hur länge kan ni vänta?"]),
              pb(["The assurances are due", "Försäkringarna ska lämnas"], ["The two large customers want their written assurances about continuity planning by a set date. What do you write to them, if you have not admitted what happened?", "De två stora kunderna vill ha sina skriftliga försäkringar om kontinuitetsplaneringen till ett visst datum. Vad skriver ni till dem, om ni inte har erkänt vad som hände?"]),
              pb(["People are leaving", "Folk slutar"], ["Two experienced night-shift workers hand in their notice and say plainly that it is because they no longer trust management. Is waiting still the strategy?", "Två erfarna medarbetare i nattskiftet säger upp sig och säger rakt ut att det beror på att de inte längre litar på ledningen. Är väntan fortfarande strategin?"])
            ]
          })
        ])
      }),
      pg("e5", ["Three months later", "Tre månader senare"], ["Blaming an invented cyberattack misled an authority, your insurer and your own staff.\n\nThe storm passed in two days. The loss of trust did not: customers want written guarantees, staff doubt management's word, and {{reg.csirt}} remembers the wasted morning.", "Att skylla på en påhittad cyberattack vilseledde en myndighet, ert försäkringsbolag och er egen personal.\n\nStormen drog förbi på två dagar. Förtroendeförlusten gjorde det inte: kunderna vill ha skriftliga garantier, personalen tvivlar på ledningens ord och {{reg.csirt}} minns den bortkastade morgonen."], {
        ending: end(5, ["The storm after the storm", "Stormen efter stormen"], [
          "Blaming an invented cyberattack misled an authority, your insurer and your own staff. The storm passed; the loss of trust did not.",
          "Att skylla på ett påhittat cyberangrepp vilseledde en myndighet, ert försäkringsbolag och er egen personal. Stormen gick över; förtroendeförlusten gjorde det inte."
        ])
      })
    ],

    debrief: {
      keyLessons: [
        L(["Crisis leadership needs a channel that works without power or mobile networks.", "Krisledning behöver en kanal som fungerar utan ström och mobilnät."]),
        L(["Account for every person on shift before anything else.", "Redovisa varje person i tjänst före allt annat."]),
        L(["Controlled shutdowns make restarts easier than crashes.", "Kontrollerade nedstängningar gör omstarter enklare än krascher."]),
        L(["Scammers follow every crisis: warn staff in the first message.", "Bedragare följer varje kris: varna personalen i det första meddelandet."])
      ],
      strengthsToLookFor: [
        L(["Using a pre-agreed fallback to gather the team", "Att använda en förutbestämd reservlösning för att samla gruppen"]),
        L(["Keeping the night shift safe on site", "Att hålla nattskiftet säkert på plats"]),
        L(["Warning staff about storm scams early", "Att tidigt varna personalen för stormbedrägerier"])
      ],
      commonGaps: [
        L(["Plans that assume phones work", "Planer som förutsätter att telefonerna fungerar"]),
        L(["Running systems until they crash", "Att köra system tills de kraschar"]),
        L(["Ignoring scams while busy", "Att ignorera bedrägerier när man har mycket att göra"])
      ],
      suggestedActions: [
        act(["Set up an offline crisis kit: meeting points, satellite phone, printed contacts.", "Ta fram en krislåda som fungerar utan nät: mötesplatser, satellittelefon, utskrivna kontakter."], "incidentCommander", "high"),
        act(["Write a controlled shutdown and restart order for the data room.", "Skriv en ordning för kontrollerad nedstängning och omstart av datarummet."], "itOps", "medium"),
        act(["Add scam warnings to crisis communication templates.", "Lägg till varningar för bedrägerier i mallarna för kriskommunikation."], "comms", "medium")
      ]
    }
  });
})();
