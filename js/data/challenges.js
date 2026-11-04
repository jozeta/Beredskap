/*
 * challenges.js — Challenge cards: pushback the facilitator can play against the option
 * the room has just chosen, at any decision point, to make them defend it or change it.
 *
 * Unlike the complication deck, these cards are built around the decision itself. Text
 * placeholders are filled from public exercise data only, never from facilitator notes:
 *   {option}  the option the room chose      {other}  an option the room did not choose
 *   {owner}   the person who owns the call   {person}, {role}  someone who was not asked
 * `needs` lists the placeholders a card requires; a card is only drawn when they exist.
 * Bilingual, fictional, no real names. Draws are seeded from the exercise seed.
 */
(function () {
  "use strict";

  const BK = window.BK;

  const CARDS = [
    {
      id: "ch-owner-doubts", needs: ["owner"],
      title: ["{owner} has doubts", "{owner} tvivlar"],
      text: ["{owner} takes you aside: “I'm not convinced by “{option}”. Convince me in one minute, or we change it.”", "{owner} tar er åt sidan: ”Jag är inte övertygad om ”{option}”. Övertyga mig på en minut, annars ändrar vi det.”"]
    },
    {
      id: "ch-other-side", needs: ["other"],
      title: ["The case for the road not taken", "Argumenten för vägen ni inte valde"],
      text: ["Someone in the room now argues hard for “{other}” instead. Give them one minute to make the case. What do they see that the rest of you do not?", "Någon i rummet argumenterar nu hårt för ”{other}” i stället. Ge hen en minut att lägga fram sin sak. Vad ser hen som ni andra inte ser?"]
    },
    {
      id: "ch-worst-case", needs: [],
      title: ["It went wrong", "Det gick fel"],
      text: ["Fast-forward a week: “{option}” went wrong in the worst way you can imagine. What happened? Knowing that, would you still choose it?", "Spola fram en vecka: ”{option}” gick fel på värsta tänkbara sätt. Vad hände? Med vetskap om det, skulle ni fortfarande välja det?"]
    },
    {
      id: "ch-headline", needs: [],
      title: ["Tomorrow's headline", "Morgondagens rubrik"],
      text: ["A hostile journalist writes tomorrow's headline about your decision: “{option}”. Say the headline out loud. Can you defend the decision on air?", "En fientlig journalist skriver morgondagens rubrik om ert beslut: ”{option}”. Säg rubriken högt. Kan ni försvara beslutet i direktsändning?"]
    },
    {
      id: "ch-not-asked", needs: ["person"],
      title: ["Nobody asked {person}", "Ingen frågade {person}"],
      text: ["{person}, {role}, says nobody asked them before you chose “{option}”, and their team will carry the cost. What do you say to them?", "{person}, {role}, säger att ingen frågade hen innan ni valde ”{option}”, och att hens team får bära kostnaden. Vad säger ni till hen?"]
    },
    {
      id: "ch-wrong-fact", needs: [],
      title: ["What if you were wrong?", "Tänk om ni hade fel?"],
      text: ["Name the one thing you were most sure of when you chose “{option}”. Now suppose it turns out to be false. Does the choice survive?", "Nämn det ni var mest säkra på när ni valde ”{option}”. Anta nu att det visar sig vara fel. Håller valet fortfarande?"]
    },
    {
      id: "ch-undo", needs: [],
      title: ["Undo it in two hours", "Ångra det om två timmar"],
      text: ["In two hours you are told to reverse “{option}”. What will undoing it cost, and who has to explain it in public?", "Om två timmar får ni order om att backa från ”{option}”. Vad kostar det att ångra, och vem måste förklara det offentligt?"]
    },
    {
      id: "ch-hands", needs: [],
      title: ["Hands up", "Upp med händerna"],
      text: ["No discussion: hands up if you would still choose “{option}” if the decision were yours alone. Ask the people who kept their hands down why.", "Ingen diskussion: upp med handen om du fortfarande skulle välja ”{option}” om beslutet var ditt ensamt. Fråga dem som inte räckte upp handen varför."]
    },
    {
      id: "ch-board", needs: [],
      title: ["The board's one question", "Styrelsens enda fråga"],
      text: ["The chair of the board asks one question about “{option}”: “What did you consider and reject, and why?” Who answers, and what do they say?", "Styrelseordföranden ställer en enda fråga om ”{option}”: ”Vad övervägde ni och valde bort, och varför?” Vem svarar, och vad säger hen?"]
    },
    {
      id: "ch-half-time", needs: [],
      title: ["Half the time", "Halva tiden"],
      text: ["Imagine you had to make this call in half the time. Would you still have chosen “{option}”? If not, what was the extra time buying you?", "Tänk er att ni hade fått fatta beslutet på halva tiden. Hade ni ändå valt ”{option}”? Om inte, vad köpte den extra tiden er?"]
    },
    {
      id: "ch-other-wins", needs: ["other"],
      title: ["A rival chose differently", "En konkurrent valde annorlunda"],
      text: ["An organisation like yours faced the same call last year and chose “{other}”. It worked out for them. Why is your situation different?", "En organisation som er stod inför samma beslut i fjol och valde ”{other}”. Det gick bra för dem. Varför är er situation annorlunda?"]
    },
    {
      id: "ch-owner-away", needs: ["owner"],
      title: ["{owner} is not here", "{owner} är inte här"],
      text: ["{owner} has just left for a flight and cannot be reached for six hours. Does “{option}” still stand without them, and who now owns it?", "{owner} har just åkt till ett flyg och går inte att nå på sex timmar. Står ”{option}” sig utan hen, och vem äger beslutet nu?"]
    }
  ];

  const L = (pair) => ({ en: pair[0], sv: pair[1] });
  const cards = CARDS.map((c) => ({ id: c.id, needs: c.needs, title: L(c.title), text: L(c.text) }));
  const byId = new Map(cards.map((c) => [c.id, c]));

  BK.data.challenges = { cards, get: (id) => byId.get(id) || null, OUTCOMES: ["held", "changed", "unsure"] };
})();
