#!/usr/bin/env node
/**
 * Build board categories from a spreadsheet CSV into a game profile.
 *
 * Usage:
 *   node scripts/import-from-csv.js
 *   node scripts/import-from-csv.js path/to/my-board.csv
 *   node scripts/import-from-csv.js path/to/my-board.csv demo
 *
 * Default input: config/categories.csv (copy from config/categories.example.csv)
 * Default profile: config/game-config.js → GAME_DEFAULT_PROFILE
 *
 * Columns (header row required):
 *   category, value, clue, answer, audio, song, artist, category_note
 *
 * audio / song / artist / category_note are optional.
 * category_note applies to that category (use on any row; first non-empty wins).
 */

const fs = require("fs");
const path = require("path");
const {
  CONFIG_DIR,
  REPO_ROOT,
  loadGameConfig,
  writeGameConfig,
  resolveProfileId,
  listProfileIds,
  CONFIG_JS,
} = require("./config-io");

const root = CONFIG_DIR;
const csvArg = process.argv[2];
const profileArg = process.argv[3];
// Allow: node scripts/import-from-csv.js demo   (profile only, default CSV)
const knownIds = listProfileIds(root);
let csvPath;
let profileId;
if (csvArg && knownIds.includes(csvArg)) {
  profileId = csvArg;
  csvPath = path.join(CONFIG_DIR, "categories.csv");
} else {
  const raw = csvArg || path.join("config", "categories.csv");
  csvPath = path.isAbsolute(raw) ? raw : path.resolve(REPO_ROOT, raw);
  profileId = profileArg || null;
}
profileId = resolveProfileId(root, profileId);

if (!fs.existsSync(csvPath)) {
  console.error("CSV not found: " + csvPath);
  console.error(
    "Copy config/categories.example.csv to config/categories.csv and fill it in."
  );
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

const raw = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const table = parseCsv(raw).filter((r) => r.some((c) => String(c).trim() !== ""));
if (table.length < 2) {
  console.error("CSV needs a header row and at least one clue row.");
  process.exit(1);
}

const headers = table[0].map(normalizeHeader);
const idx = (name) => headers.indexOf(name);

const need = ["category", "value", "clue", "answer"];
for (const col of need) {
  if (idx(col) === -1) {
    console.error('Missing required column: "' + col + '"');
    process.exit(1);
  }
}

const optional = ["audio", "song", "artist", "category_note"];
for (const col of optional) {
  if (idx(col) === -1) headers.push(col);
}

function cell(row, col) {
  const j = typeof col === "number" ? col : idx(col);
  if (j === -1 || j >= row.length) return "";
  return String(row[j]).trim();
}

const byCategory = new Map();

for (let r = 1; r < table.length; r++) {
  const row = table[r];
  const category = cell(row, "category");
  const clueText = cell(row, "clue");
  const answer = cell(row, "answer");
  if (!category && !clueText && !answer) continue;
  if (!category) {
    console.warn("Row " + (r + 1) + ": skipping — missing category");
    continue;
  }
  const valueRaw = cell(row, "value");
  const value = Number(String(valueRaw).replace(/[$,]/g, ""));
  if (!Number.isFinite(value)) {
    console.warn("Row " + (r + 1) + ": skipping — invalid value: " + valueRaw);
    continue;
  }
  if (!clueText || !answer) {
    console.warn("Row " + (r + 1) + ": skipping — need clue and answer");
    continue;
  }

  if (!byCategory.has(category)) {
    byCategory.set(category, { name: category, note: "", clues: [] });
  }
  const cat = byCategory.get(category);
  const note = cell(row, "category_note");
  if (note && !cat.note) cat.note = note;

  const clue = { value, clue: clueText, answer };
  const audio = cell(row, "audio");
  const song = cell(row, "song");
  const artist = cell(row, "artist");
  if (audio) clue.audio = audio;
  if (song) clue.song = song;
  if (artist) clue.artist = artist;
  cat.clues.push(clue);
}

const categories = [...byCategory.values()].map((cat) => {
  cat.clues.sort((a, b) => a.value - b.value);
  const out = { name: cat.name, clues: cat.clues };
  if (cat.note) out.note = cat.note;
  return out;
});

if (!categories.length) {
  console.error("No valid clue rows found in CSV.");
  process.exit(1);
}

let cfg = loadGameConfig(root, profileId);
if (!cfg) {
  cfg = {
    title: "JEOPARDY!",
    pageTitle: "Jeopardy! - Custom Game",
    themeMusic: "assets/audio/jeopardy-theme.mp3",
    themeVolume: 35,
    finalDurationSeconds: 40,
    teams: ["Team 1", "Team 2", "Team 3"],
    categories: [],
    finalJeopardy: {
      category: "Final Category",
      clue: "Your Final Jeopardy clue here.",
      answer: "What is …?",
    },
  };
}

cfg.categories = categories;
writeGameConfig(root, cfg, profileId);

console.log(
  'Updated slot "' +
    profileId +
    '" in config/' +
    CONFIG_JS +
    " from " +
    path.basename(csvPath) +
    " (" +
    categories.length +
    " categories, " +
    categories.reduce((n, c) => n + c.clues.length, 0) +
    " clues)."
);
console.log(
  "Run  node scripts/sync-answers.js " + profileId + "  to refresh host answer sheets."
);
