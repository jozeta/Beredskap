/*
 * help.js — The in-app guide, as data. Every text is an { en, sv } pair and is
 * rendered as plain text by ui/help.js (never markup). Blocks:
 *   { p }        paragraph
 *   { list }     bullet list
 *   { steps }    numbered steps
 *   { tip }      highlighted hint
 *   { terms }    [[term, explanation], …] definition list
 *   { shortcuts: "discussion" | "branching" }  the live keyboard map from the stage
 */
(function () {
  "use strict";

  const BK = window.BK;
  const P = (en, sv) => ({ en, sv });

  const SECTIONS = [
    {
      id: "start",
      icon: "flag",
      title: P("Getting started", "Kom igång"),
      blocks: [
        { p: P("Beredskap runs tabletop exercises for cyber crises: a facilitator leads a group through a realistic incident, one stage or decision at a time, and the room discusses what they would do. Everything runs in this browser. Nothing is sent anywhere.", "Beredskap används för att genomföra skrivbordsövningar om cyberkriser. En övningsledare leder gruppen genom en realistisk incident, ett skede eller beslut i taget, och rummet diskuterar vad de skulle göra. Allt körs i den här webbläsaren. Ingenting skickas någonstans.") },
        { steps: [
          P("Pick a scenario in the Scenario library, or build your own exercise from slide templates.", "Välj ett scenario i Scenariobiblioteket eller bygg en egen övning av bildmallar."),
          P("Set it up: organisation, length, audience, roles and objectives. Defaults give a sound exercise.", "Ställ in den: organisation, längd, målgrupp, roller och mål. Standardvalen ger en välbalanserad övning."),
          P("Review and, if you like, edit the generated exercise.", "Granska den genererade övningen och redigera den om du vill."),
          P("Present it: the presenter view on your screen, the stage window on the projector or shared screen.", "Presentera den: presentatörsvyn på din skärm och presentationsfönstret på projektorn eller den delade skärmen."),
          P("Debrief: assess the objectives, review decisions and agree an improvement plan with owners and dates.", "Utvärdera: bedöm målen, gå igenom besluten och kom överens om en förbättringsplan med ansvariga och datum.")
        ] },
        { tip: P("Plan for two screens: one only you can see (presenter view) and one for the room (stage window). With a single screen you can still present; switch to the stage window in full screen and use the keyboard.", "Planera för två skärmar: en som bara du ser (presentatörsvyn) och en för rummet (presentationsfönstret). Med en skärm går det också: visa presentationsfönstret i helskärm och styr med tangentbordet.") }
      ]
    },
    {
      id: "library",
      icon: "book",
      title: P("Choosing a scenario", "Välja scenario"),
      blocks: [
        { p: P("The Scenario library holds professionally authored templates. Each generation varies the organisation, people, threat actor and numbers, while the incident logic stays the same, so a scenario can be run many times.", "Scenariobiblioteket innehåller färdiga, genomarbetade mallar. Varje generering varierar organisation, personer, hotaktör och siffror medan händelseförloppet är detsamma, så ett scenario kan köras många gånger.") },
        { list: [
          P("Search by title, technique or objective, and filter by category, structure and format.", "Sök på titel, teknik eller mål och filtrera på kategori, struktur och format."),
          P("Open a card to read the summary, objectives, stages and frameworks before you choose.", "Öppna ett kort för att läsa sammanfattning, mål, skeden och ramverk innan du väljer."),
          P("“Use scenario” opens the setup with that scenario selected.", "”Använd scenario” öppnar inställningarna med scenariot förvalt."),
          P("“My exercises” at the top lists the exercises you built yourself in the exercise builder.", "”Mina övningar” överst listar övningar du byggt själv i övningsbyggaren.")
        ] },
        { terms: [
          [P("Discussion format", "Diskussionsformat"), P("Stages that escalate over time. Each stage shows the situation, injects (emails, alerts, calls, news) and questions with a discussion timer.", "Skeden som eskalerar över tid. Varje skede visar läget, inspel (mejl, larm, samtal, nyheter) och frågor med diskussionstimer.")],
          [P("Branching format", "Förgreningsformat"), P("A gamebook: the room picks an option at each decision, and the story follows. Several endings, from contained to disaster.", "En spelbok: rummet väljer ett alternativ vid varje beslut och berättelsen följer valen. Flera slut, från avvärjt till katastrof.")],
          [P("Custom", "Egen"), P("Slides you built yourself in the exercise builder.", "Bilder du byggt själv i övningsbyggaren.")]
        ] }
      ]
    },
    {
      id: "setup",
      icon: "list-ol",
      title: P("Setting up an exercise", "Ställa in en övning"),
      blocks: [
        { p: P("The setup has Basic and Advanced sections. Basic is enough for most exercises; Advanced tailors the exercise to your organisation.", "Inställningarna har en grunddel och en avancerad del. Grunddelen räcker för de flesta övningar; den avancerade anpassar övningen till er organisation.") },
        { terms: [
          [P("Language", "Språk"), P("English or Swedish. You can switch the stage language during the run as well.", "Engelska eller svenska. Du kan också byta presentationsspråk under övningen.")],
          [P("Duration and stages", "Längd och skeden"), P("Discussion exercises: pick a duration and the number of stages; the discussion time per stage follows unless you set it. Branching exercises: pick short or long, and run as decisions only or with discussion stops.", "Diskussionsövningar: välj längd och antal skeden; diskussionstiden per skede räknas fram om du inte anger den. Förgreningsövningar: välj kort eller lång och kör med enbart beslut eller med diskussionsstopp.")],
          [P("Audience", "Målgrupp"), P("Technical, executive or mixed. Changes which questions are asked and how many slides there are.", "Teknisk, ledning eller blandad. Styr vilka frågor som ställs och hur många bilder det blir.")],
          [P("Difficulty", "Svårighetsgrad"), P("Higher difficulty adds misleading or disputed information that the room has to question.", "Högre svårighetsgrad lägger till vilseledande eller omtvistad information som rummet måste ifrågasätta.")],
          [P("Organisation", "Organisation"), P("Sector, size and an optional name. Leave the name empty for a generated fictional one.", "Sektor, storlek och ett valfritt namn. Lämna namnet tomt för ett genererat, fiktivt namn.")],
          [P("Technology environment", "Teknikmiljö"), P("Changes vocabulary only, so alerts and systems sound like your environment.", "Ändrar bara ordval, så att larm och system låter som er miljö.")],
          [P("Jurisdiction", "Jurisdiktion"), P("Sets the regulator, reporting rules and currency referred to in the exercise.", "Styr vilken tillsynsmyndighet, vilka rapporteringsregler och vilken valuta övningen hänvisar till.")],
          [P("External pressure and inject density", "Yttre tryck och inspelstäthet"), P("Turn off pressures you do not want (for example media) and choose how many injects each stage gets.", "Stäng av tryck ni inte vill ha (till exempel media) och välj hur många inspel varje skede får.")],
          [P("Participating roles", "Deltagande roller"), P("Untick roles that are not in the room. Injects aimed at them are re-targeted or flagged “Role not present — who covers this?”. You can enter real participant names.", "Bocka ur roller som inte är med. Inspel till dem riktas om eller markeras ”Rollen saknas — vem täcker upp?”. Du kan ange deltagarnas riktiga namn.")],
          [P("Learning objectives", "Lärandemål"), P("Deselect objectives you do not need and add your own. The audience sees only vague teasers; the full objectives are for you and the debrief.", "Välj bort mål ni inte behöver och lägg till egna. Publiken ser bara antydningar; de fullständiga målen är för dig och utvärderingen.")],
          [P("Seed", "Frö"), P("The same scenario, settings and seed always produce the same exercise. Reroll for a different organisation and cast.", "Samma scenario, inställningar och frö ger alltid samma övning. Slumpa om för en annan organisation och andra personer.")],
          [P("Extra pressure", "Extra tryck"), P("Optional pressure meters and a complication deck; see their own section below.", "Valfria tryckmätare och en komplikationslek; se avsnittet längre ned.")]
        ] }
      ]
    },
    {
      id: "edit",
      icon: "edit",
      title: P("Reviewing and editing", "Granska och redigera"),
      blocks: [
        { p: P("After generating, the exercise opens in the editor. Read it through before the session: it shows every slide, inject and facilitator note.", "Efter genereringen öppnas övningen i redigeraren. Läs igenom den före övningen: där syns alla bilder, inspel och anteckningar för övningsledaren.") },
        { list: [
          P("Change any text. Edits apply to one language at a time, so check both if you run bilingual sessions.", "Ändra valfri text. Ändringar gäller ett språk i taget, så kontrollera båda om ni kör på två språk."),
          P("Exclude optional injects you do not want; mandatory ones carry the story and stay.", "Uteslut valfria inspel ni inte vill ha; obligatoriska bär berättelsen och ligger kvar."),
          P("Move inject times within their stage, and reorder slides within a stage.", "Flytta inspelens tider inom sitt skede och ändra ordning på bilder inom ett skede."),
          P("Regenerate with a different number of stages, or duplicate the exercise to keep a variant.", "Generera om med ett annat antal skeden, eller duplicera övningen för att spara en variant."),
          P("Print the facilitator guide and role cards from here.", "Skriv ut handledning och rollkort härifrån.")
        ] },
        { tip: P("Branching exercises have a fixed structure: you can edit the text, but not the paths between pages.", "Förgreningsövningar har en fast struktur: du kan redigera texten men inte vägarna mellan sidorna.") }
      ]
    },
    {
      id: "builder",
      icon: "layout",
      title: P("Building your own exercise", "Bygga en egen övning"),
      blocks: [
        { p: P("The exercise builder works like a slide editor. Open it with “New custom exercise” in the Scenario library. Slides are listed on the left, the selected slide is edited in the middle and the toolbar sits on top. Changes save automatically.", "Övningsbyggaren fungerar som ett presentationsprogram. Öppna den med ”Ny egen övning” i Scenariobiblioteket. Bilderna listas till vänster, den valda bilden redigeras i mitten och verktygsfältet ligger överst. Ändringar sparas automatiskt.") },
        { steps: [
          P("Click “New slide” to open the template gallery: title and agenda slides, situations, discussion questions, A–D decisions, twists, key figures, timelines, emails, chats, text messages, phone calls, social posts, news, regulator letters, alerts, logs, forensic findings and reports.", "Klicka på ”Ny bild” för att öppna mallgalleriet: titel- och agendabilder, lägesbilder, diskussionsfrågor, beslut A–D, vändningar, nyckeltal, tidslinjer, mejl, chattar, sms, telefonsamtal, inlägg i sociala medier, nyheter, myndighetsbrev, larm, loggar, forensiska fynd och rapporter."),
          P("Click into any text on the slide and type. Use the toolbar for bold, italic, underline, heading size, text size, alignment and callout tone.", "Klicka i valfri text på bilden och skriv. Använd verktygsfältet för fetstil, kursiv, understrykning, rubrikstorlek, textstorlek, justering och ton på markeringar."),
          P("Insert blocks such as text, lists, quotes, callouts, icons, key figures, timelines, A–D options, images and dividers. Select a block to move it up or down or delete it.", "Infoga block som text, listor, citat, markeringar, ikoner, nyckeltal, tidslinjer, alternativ A–D, bilder och avdelare. Markera ett block för att flytta det upp eller ned eller radera det."),
          P("On message and call slides, change the type and sender and add incoming or outgoing messages to build a conversation.", "På meddelande- och samtalsbilder byter du typ och avsändare och lägger till inkommande eller utgående meddelanden för att bygga en konversation."),
          P("Give question slides a discussion timer in minutes. On the stage, the first click after the slide starts the timer and the next click moves on.", "Ge frågebilder en diskussionstimer i minuter. På presentationen startar första klicket timern och nästa klick går vidare."),
          P("Write presenter notes under the slide. Only you see them, in the presenter view.", "Skriv presentatörsanteckningar under bilden. Bara du ser dem, i presentatörsvyn."),
          P("Rearrange slides by dragging them in the list, or with Alt+↑ / Alt+↓. Duplicate or delete the selected slide from the toolbar.", "Ändra ordning genom att dra bilderna i listan, eller med Alt+↑ / Alt+↓. Duplicera eller radera vald bild i verktygsfältet."),
          P("Use “Exercise settings” for the title, summary, language and planned length, then “Start exercise”.", "Använd ”Övningsinställningar” för titel, sammanfattning, språk och planerad längd, och sedan ”Starta övning”.")
        ] },
        { list: [
          P("Images must be PNG, JPEG, WebP or GIF. Large images are shrunk automatically and stored in the exercise.", "Bilder ska vara PNG, JPEG, WebP eller GIF. Stora bilder förminskas automatiskt och sparas i övningen."),
          P("Pasted text is always inserted as plain text, so formatting from other programs does not come along.", "Inklistrad text infogas alltid som ren text, så formatering från andra program följer inte med."),
          P("“Export JSON” saves the exercise as a file you can share; import it from History.", "”Exportera JSON” sparar övningen som en fil du kan dela; importera den från Historik.")
        ] },
        { tip: P("Use fictional names, example.com-style domains and documentation IP addresses on your slides, as the built-in scenarios do.", "Använd fiktiva namn, domäner av typen example.com och dokumentations-IP-adresser på dina bilder, precis som de inbyggda scenarierna.") }
      ]
    },
    {
      id: "run",
      icon: "play",
      title: P("Running the exercise", "Genomföra övningen"),
      blocks: [
        { p: P("Starting an exercise opens the presenter view. Use “Open stage window” and move that window to the projector or shared screen, then press F for full screen.", "När övningen startar öppnas presentatörsvyn. Använd ”Öppna presentationsfönster”, flytta fönstret till projektorn eller den delade skärmen och tryck F för helskärm.") },
        { list: [
          P("Now on stage and Next show exactly what the room sees and what comes next. The side panel holds facilitator notes, expected discussion points and hints that never reach the stage.", "Nu på scen och Nästa visar exakt vad rummet ser och vad som kommer. Sidopanelen har anteckningar, förväntade diskussionspunkter och tips som aldrig visas för publiken."),
          P("Clicking the stage, or pressing → or Space, advances one step. When the last question of a stage is showing, the first advance starts the discussion timer and the next one moves on.", "Klick på presentationen, → eller mellanslag går ett steg framåt. När sista frågan i ett skede visas startar första steget diskussionstimern och nästa går vidare."),
          P("Injects can be released now, skipped (optional ones) or postponed to the next stage.", "Inspel kan släppas direkt, hoppas över (valfria) eller skjutas till nästa skede."),
          P("Record decisions with rationale, dissent and owners, and log observations as they happen.", "Registrera beslut med motivering, avvikande meningar och ansvariga, och logga iakttagelser medan de sker."),
          P("Screen: Normal, Black or White to hide the stage while you talk. You can also switch stage language and theme live.", "Skärm: Normal, Svart eller Vit för att dölja presentationen medan du pratar. Du kan också byta presentationsspråk och tema direkt."),
          P("In branching exercises, choose the room's option on the choice slide (or press 1–4). Undo takes back the last choice.", "I förgreningsövningar väljer du rummets alternativ på valbilden (eller trycker 1–4). Ångra tar tillbaka senaste valet."),
          P("Pause stops both clocks. If the browser is closed, the session is restored with timers paused.", "Paus stoppar båda klockorna. Om webbläsaren stängs återställs övningen med pausade timers.")
        ] },
        { tip: P("A clicker works too: most send arrow keys or Page Up / Page Down.", "En presentationsklickare fungerar också: de flesta skickar piltangenter eller Page Up / Page Down.") }
      ]
    },
    {
      id: "keys",
      icon: "keyboard",
      title: P("Keyboard shortcuts", "Kortkommandon"),
      blocks: [
        { p: P("These work in the presenter view and the stage window. They are ignored while you type in a field. Press ? on the stage to show them there.", "De fungerar i presentatörsvyn och presentationsfönstret. De ignoreras medan du skriver i ett fält. Tryck ? på presentationen för att visa dem där.") },
        { shortcuts: "discussion" },
        { p: P("In branching exercises the digit keys choose an option instead of jumping to a stage.", "I förgreningsövningar väljer siffertangenterna ett alternativ i stället för att hoppa till ett skede.") }
      ]
    },
    {
      id: "pressure",
      icon: "gauge",
      title: P("Pressure meters and complications", "Tryckmätare och komplikationer"),
      blocks: [
        { p: P("Two optional tools add tension. Switch them on under “Extra pressure” in the setup.", "Två valfria verktyg ökar trycket. Slå på dem under ”Extra tryck” i inställningarna.") },
        { terms: [
          [P("Pressure meters", "Tryckmätare"), P("Customer trust, regulator attention and media pressure, shown on the stage from 0 to 5. Move them from the presenter view. In branching exercises some choices move them automatically.", "Kundförtroende, myndighetens uppmärksamhet och medietryck, visade på presentationen från 0 till 5. Flytta dem från presentatörsvyn. I förgreningsövningar flyttar vissa val dem automatiskt.")],
          [P("Complication deck", "Komplikationslek"), P("Short, unforeseen twists such as an unreachable incident lead or a full mailbox. Draw a card, read its private note, then show it on the stage or put it back. In automatic mode one card is readied per stage.", "Korta, oväntade vändningar, till exempel att incidentledaren inte går att nå eller att en brevlåda är full. Dra ett kort, läs den privata anteckningen och visa det sedan på presentationen eller lägg tillbaka det. I automatiskt läge förbereds ett kort per skede.")]
        ] },
        { tip: P("Meters are a storytelling device, not a score. They are listed in the debrief for discussion only.", "Mätarna är ett berättargrepp, inte ett betyg. De visas i utvärderingen bara som underlag för diskussion.") }
      ]
    },
    {
      id: "debrief",
      icon: "notes",
      title: P("Debrief and improvement plan", "Utvärdering och förbättringsplan"),
      blocks: [
        { p: P("End the exercise and open the debrief, ideally while the room is still together (a “hot wash”).", "Avsluta övningen och öppna utvärderingen, helst medan rummet fortfarande är samlat (en snabb genomgång direkt efteråt).") },
        { list: [
          P("Assess each learning objective as addressed, partly addressed or not addressed, with a note.", "Bedöm varje lärandemål som uppnått, delvis uppnått eller inte uppnått, med en kommentar."),
          P("“What actually happened” reveals what was really going on, including what the room could not know.", "”Det som faktiskt hände” visar vad som egentligen pågick, även det rummet inte kunde veta."),
          P("In branching exercises, the route map shows the path taken. Hover over or tab to a decision point to see the options and the choice made.", "I förgreningsövningar visar vägkartan vägen som togs. Håll muspekaren över eller tabba till en beslutspunkt för att se alternativen och valet."),
          P("The scorecard is a facilitator's assessment against the scenario's criteria. It is not a maturity or compliance score.", "Bedömningen är övningsledarens omdöme mot scenariots kriterier. Det är inte ett mognads- eller efterlevnadsbetyg."),
          P("Build the improvement plan: each action gets an owner, a due date, how it will be verified and a status. Scenario suggestions and observations can be adopted with one click.", "Bygg förbättringsplanen: varje åtgärd får ansvarig, slutdatum, hur den ska verifieras och status. Scenariots förslag och iakttagelser kan tas in med ett klick.")
        ] },
        { tip: P("Open actions from every debrief are collected under History, so you can follow them up before the next exercise.", "Öppna åtgärder från alla utvärderingar samlas under Historik, så att ni kan följa upp dem före nästa övning.") }
      ]
    },
    {
      id: "exports",
      icon: "download",
      title: P("Exports, printing and history", "Export, utskrift och historik"),
      blocks: [
        { terms: [
          [P("Print report", "Skriv ut rapport"), P("An after-action report with decisions, observations, the improvement plan and the timeline. Print or save as PDF.", "En efterhandsrapport med beslut, iakttagelser, förbättringsplan och tidslinje. Skriv ut eller spara som PDF.")],
          [P("Markdown", "Markdown"), P("The same report as text, for wikis and tickets.", "Samma rapport som text, för wikis och ärenden.")],
          [P("CSV", "CSV"), P("Inject log, decision log, observations and the action plan, for spreadsheets.", "Inspelslogg, beslutslogg, iakttagelser och åtgärdsplan, för kalkylark.")],
          [P("Export JSON", "Exportera JSON"), P("The complete exercise and session. Import it on another computer from History.", "Hela övningen och genomförandet. Importera på en annan dator från Historik.")],
          [P("Facilitator guide and role cards", "Handledning och rollkort"), P("Printed from the editor before the session. Role cards give each role only its own private information.", "Skrivs ut från redigeraren före övningen. Rollkorten ger varje roll bara dess egen information.")]
        ] },
        { p: P("History lists every session. The icons on each row open the presenter (while the exercise is running), open the debrief, export JSON, run again with the same exercise, archive or delete. Greyed-out icons are not available for that session.", "Historik listar alla genomföranden. Ikonerna på varje rad öppnar presentatörsvyn (medan övningen pågår), öppnar utvärderingen, exporterar JSON, kör samma övning igen, arkiverar eller raderar. Gråade ikoner är inte tillgängliga för det genomförandet.") }
      ]
    },
    {
      id: "settings",
      icon: "settings",
      title: P("Settings and customisation", "Inställningar och anpassning"),
      blocks: [
        { list: [
          P("Language: switch EN / SV in the top bar at any time.", "Språk: byt EN / SV i toppfältet när du vill."),
          P("Theme: the round button in the top bar cycles light, dark and system.", "Tema: den runda knappen i toppfältet växlar mellan ljust, mörkt och system."),
          P("Settings holds the default stage theme and default duration for new exercises.", "Inställningar har standardtema för presentationen och standardlängd för nya övningar."),
          P("“Export raw data” saves everything stored in this browser as one file. “Clear all local data” removes it after two confirmations.", "”Exportera rådata” sparar allt som lagras i webbläsaren som en fil. ”Radera all lokal data” tar bort det efter två bekräftelser.")
        ] }
      ]
    },
    {
      id: "privacy",
      icon: "shield",
      title: P("Privacy and data", "Integritet och data"),
      blocks: [
        { list: [
          P("No account, no server and no tracking. The app makes no network requests.", "Inget konto, ingen server och ingen spårning. Appen gör inga nätverksanrop."),
          P("Exercises, sessions and your own decks are stored only in this browser's local storage. Clearing site data removes them, so export what you want to keep.", "Övningar, genomföranden och egna övningar lagras bara i webbläsarens lokala lagring. Rensas webbplatsdata försvinner de, så exportera det du vill behålla."),
          P("All organisations, people, domains and addresses in the scenarios are fictional.", "Alla organisationer, personer, domäner och adresser i scenarierna är fiktiva."),
          P("Facilitator notes, hidden facts and presenter notes are never drawn on the stage.", "Anteckningar för övningsledaren, dolda fakta och presentatörsanteckningar visas aldrig på presentationen.")
        ] }
      ]
    },
    {
      id: "tips",
      icon: "users",
      title: P("Tips for a good exercise", "Tips för en bra övning"),
      blocks: [
        { list: [
          P("Agree the rules first: no fault, the plans are tested and not the people, and “I don't know” is a useful answer.", "Kom överens om spelreglerna först: ingen skuld, det är planerna som testas och inte personerna, och ”jag vet inte” är ett bra svar."),
          P("Invite the people who would really be called: IT, security, communications, legal, management and key suppliers.", "Bjud in dem som verkligen skulle kallas in: IT, säkerhet, kommunikation, juridik, ledning och viktiga leverantörer."),
          P("Name an observer who takes notes, so you can focus on facilitating.", "Utse en observatör som antecknar, så att du kan fokusera på att leda."),
          P("Keep to time: use the timer, and park side discussions for the debrief.", "Håll tiden: använd timern och parkera sidodiskussioner till utvärderingen."),
          P("Ask open questions: who decides, who needs to know, and what would change your mind?", "Ställ öppna frågor: vem beslutar, vem behöver veta och vad skulle få er att ändra er?"),
          P("End with three to five concrete actions with owners, not a long wish list.", "Avsluta med tre till fem konkreta åtgärder med ansvariga, inte en lång önskelista.")
        ] }
      ]
    },
    {
      id: "trouble",
      icon: "warning",
      title: P("Troubleshooting", "Felsökning"),
      blocks: [
        { terms: [
          [P("Full screen does not start", "Helskärm startar inte"), P("Some browsers only allow full screen after a click. Click the stage and press F, or use F11.", "Vissa webbläsare tillåter bara helskärm efter ett klick. Klicka på presentationen och tryck F, eller använd F11.")],
          [P("The stage window does not open", "Presentationsfönstret öppnas inte"), P("Allow pop-ups for this page, or open the stage link in a new window yourself.", "Tillåt popup-fönster för sidan, eller öppna presentationslänken i ett nytt fönster själv.")],
          [P("Changes are not saved", "Ändringar sparas inte"), P("Private browsing or blocked site data can disable local storage. A banner says so at the top. Use a normal window, or export before closing.", "Privat surfning eller blockerad webbplatsdata kan stänga av den lokala lagringen. En banderoll överst visar det. Använd ett vanligt fönster eller exportera innan du stänger.")],
          [P("Storage is full", "Lagringen är full"), P("Export and delete old sessions, or remove large images from your own exercises.", "Exportera och radera gamla genomföranden, eller ta bort stora bilder från egna övningar.")],
          [P("The stage and presenter disagree", "Presentation och presentatörsvy skiljer sig åt"), P("Both windows must be in the same browser. Reload the stage window; it picks up the current slide.", "Båda fönstren måste vara i samma webbläsare. Ladda om presentationsfönstret; det hämtar aktuell bild.")]
        ] }
      ]
    }
  ];

  BK.data = BK.data || {};
  BK.data.help = { SECTIONS };
})();
