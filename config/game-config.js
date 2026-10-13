/**
 * game-config.js — ALL game boards live here (multiple slots in one file).
 *
 * HOW TO ADD ANOTHER GAME:
 *   1. Copy an existing slot object inside window.GAME_PROFILES (the array).
 *   2. Change id (unique), title, description.
 *   3. Edit teams (defaults), categories (clues/answers), finalJeopardy, themeMusic, etc.
 *   4. Reload the page — the new slot appears on the Before We Begin screen.
 *   5. Optional host sheets: node scripts/sync-answers.js <id>
 *
 * HOW TO SYNC ANSWER SHEETS:
 *   node scripts/sync-answers.js           # default slot (GAME_DEFAULT_PROFILE)
 *   node scripts/sync-answers.js demo      # a specific slot id
 *   node scripts/sync-answers.js --all     # every slot
 *
 * Slot fields:
 *   id, title, description  — shown on the start-screen picker
 *   gameTitle, pageTitle    — in-game heading / browser tab
 *   teams                   — default team names (editable on start screen)
 *   categories, finalJeopardy, themeMusic, themeVolume, finalDurationSeconds
 */

window.GAME_DEFAULT_PROFILE = "hack-retreat";

window.GAME_PROFILES = [
  {
    "id": "hack-retreat",
    "title": "Hack Retreat",
    "description": "Hack, CS/Informatics, Ian, Trivia, and Music — the full party board.",
    "gameTitle": "JEOPARDY!",
    "pageTitle": "Jeopardy! - Hack Retreat",
    "themeMusic": "assets/audio/jeopardy-theme.mp3",
    "themeVolume": 35,
    "finalDurationSeconds": 40,
    "teams": [
      "Team 1",
      "Team 2",
      "Team 3",
      "Team 4",
      "Team 5"
    ],
    "categories": [
      {
        "name": "Hack",
        "clues": [
          {
            "value": 200,
            "clue": "Hack at UCI's Platinum sponsorship tier costs this many U.S. dollars.",
            "answer": "What is $6,000?"
          },
          {
            "value": 400,
            "clue": "The year Hack at UCI hosted its first hackathon.",
            "answer": "What is 2014?"
          },
          {
            "value": 600,
            "clue": "This conference started after organizers from VH modeled their event on Hack at UCI's structure.",
            "answer": "What is Designathon?"
          },
          {
            "value": 800,
            "clue": "She has been a Hack CEO, WiCS copresident, and judged at Irvine Hacks this year.",
            "answer": "Who is Angela Liu?"
          },
          {
            "value": 1000,
            "clue": "The venue where the very first HackUCI was held. (Host: bonus if they explain why it was there.)",
            "answer": "What is the OC Esports Arena? (accept: Orange County Esports Arena)"
          }
        ]
      },
      {
        "name": "CS / Informatics",
        "clues": [
          {
            "value": 200,
            "clue": "This traversal uses a queue and explores a graph level by level from a start node.",
            "answer": "What is BFS (Breadth-First Search)?"
          },
          {
            "value": 400,
            "clue": "This low-cost method has participants think aloud while trying tasks on an interface.",
            "answer": "What is usability testing? (accept: think-aloud usability test)"
          },
          {
            "value": 600,
            "clue": "This umbrella process organizes work into short cycles with standups, backlog grooming, and sprint reviews.",
            "answer": "What is Agile (Scrum)?"
          },
          {
            "value": 800,
            "clue": "This optimization approach updates model parameters from one example (or a tiny mini-batch) at a time instead of waiting for the full dataset pass.",
            "answer": "What is stochastic gradient descent (SGD)?"
          },
          {
            "value": 1000,
            "clue": "In HCI, this Don Norman concept describes the actions an object suggests to a user before any instructions are read.",
            "answer": "What is an affordance?"
          }
        ]
      },
      {
        "name": "Ian",
        "clues": [
          {
            "value": 200,
            "clue": "Ian was born on this date.",
            "answer": "What is April 30?"
          },
          {
            "value": 400,
            "clue": "This is Ian's username on Discord.",
            "answer": "What is \"ianwearshat\"?"
          },
          {
            "value": 600,
            "clue": "Ian is minoring in this minor.",
            "answer": "What is Statistics?"
          },
          {
            "value": 800,
            "clue": "This is one of Ian's favorite franchises.",
            "answer": "What is Star Wars?"
          },
          {
            "value": 1000,
            "clue": "Before college, Ian competed in this robotics league.",
            "answer": "What is FIRST Tech Challenge (robotics)?"
          }
        ]
      },
      {
        "name": "Trivia",
        "clues": [
          {
            "value": 200,
            "clue": "The only U.S. state that begins with two vowels.",
            "answer": "What is Iowa?"
          },
          {
            "value": 400,
            "clue": "This planet rotates on its side, with an axial tilt of about 98°.",
            "answer": "What is Uranus?"
          },
          {
            "value": 600,
            "clue": "Many tourists picture Sydney or Melbourne — but this planned city inland is Australia's actual national capital.",
            "answer": "What is Canberra?"
          },
          {
            "value": 800,
            "clue": "This Italian Renaissance artist painted the Mona Lisa.",
            "answer": "Who is Leonardo da Vinci?"
          },
          {
            "value": 1000,
            "clue": "Earth's deepest measured ocean floor lies along this trench east of the Philippines.",
            "answer": "What is the Mariana Trench?"
          }
        ]
      },
      {
        "name": "Music",
        "note": "Name that tune — put clips in assets/snippets/ and set each clue's audio path.",
        "clues": [
          {
            "value": 200,
            "clue": "Name the song and the artist from the clip.",
            "answer": "What is Every Summertime by NIKI?",
            "audio": "assets/snippets/music-200.mp3",
            "song": "Every Summertime",
            "artist": "NIKI"
          },
          {
            "value": 400,
            "clue": "Name the song and the artist from the clip.",
            "answer": "What is Beaches by beabadoobee?",
            "audio": "assets/snippets/music-400.mp3",
            "song": "Beaches",
            "artist": "beabadoobee"
          },
          {
            "value": 600,
            "clue": "Name the song and the artist from the clip.",
            "answer": "What is Get Up by NewJeans?",
            "audio": "assets/snippets/music-600.mp3",
            "song": "Get Up",
            "artist": "NewJeans"
          },
          {
            "value": 800,
            "clue": "Name the song and the artist from the clip.",
            "answer": "What is Smooth Criminal by Michael Jackson?",
            "audio": "assets/snippets/music-800.mp3",
            "song": "Smooth Criminal",
            "artist": "Michael Jackson"
          },
          {
            "value": 1000,
            "clue": "Name the song and the artist from the clip.",
            "answer": "What is Good Days by SZA?",
            "audio": "assets/snippets/music-1000.mp3",
            "song": "Good Days",
            "artist": "SZA"
          }
        ]
      }
    ],
    "finalJeopardy": {
      "category": "VenusHacks",
      "clue": "How many hours is VenusHacks 2026?",
      "answer": "What is 26 hours?"
    }
  },
  {
    "id": "demo",
    "title": "Demo Board",
    "description": "Short 3-category sample. Copy this whole object to add another game slot.",
    "gameTitle": "DEMO JEOPARDY!",
    "pageTitle": "Jeopardy! - Demo / Template",
    "themeMusic": "assets/audio/jeopardy-theme.mp3",
    "themeVolume": 35,
    "finalDurationSeconds": 40,
    "teams": [
      "Alpha",
      "Bravo"
    ],
    "categories": [
      {
        "name": "Animals",
        "clues": [
          {
            "value": 200,
            "clue": "This tall African mammal is known for its long neck.",
            "answer": "What is a giraffe?"
          },
          {
            "value": 400,
            "clue": "A group of these birds is called a murder.",
            "answer": "What are crows?"
          },
          {
            "value": 600,
            "clue": "This marine mammal is the largest animal that has ever lived.",
            "answer": "What is the blue whale?"
          }
        ]
      },
      {
        "name": "Food",
        "clues": [
          {
            "value": 200,
            "clue": "This Italian dish is basically flatbread with tomato sauce and cheese.",
            "answer": "What is pizza?"
          },
          {
            "value": 400,
            "clue": "Guacamole's star ingredient is this green fruit.",
            "answer": "What is an avocado?"
          },
          {
            "value": 600,
            "clue": "This breakfast spread is made by churning cream.",
            "answer": "What is butter?"
          }
        ]
      },
      {
        "name": "Silly Science",
        "clues": [
          {
            "value": 200,
            "clue": "Water freezes at this temperature in Celsius.",
            "answer": "What is 0°C?"
          },
          {
            "value": 400,
            "clue": "Humans typically have this many teeth as adults (if none are missing).",
            "answer": "What is 32?"
          },
          {
            "value": 600,
            "clue": "This force keeps your feet on the ground and apples near trees.",
            "answer": "What is gravity?"
          }
        ]
      }
    ],
    "finalJeopardy": {
      "category": "Template",
      "clue": "This placeholder Final Jeopardy clue is meant to be replaced when you copy this demo board.",
      "answer": "What is a custom clue?"
    }
  }
];

// Convenience: active board (default slot). The start screen lets you pick any slot.
window.GAME_CONFIG = (window.GAME_PROFILES.find(function (p) {
  return p.id === window.GAME_DEFAULT_PROFILE;
}) || window.GAME_PROFILES[0] || null);
