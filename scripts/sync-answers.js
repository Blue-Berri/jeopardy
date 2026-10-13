#!/usr/bin/env node
/**
 * Regenerates data/jeopardy-answers.json and .txt from a game slot.
 *
 * Usage:
 *   node scripts/sync-answers.js              # default slot from config/game-config.js
 *   node scripts/sync-answers.js demo         # specific slot id
 *   node scripts/sync-answers.js --all        # every slot in config/game-config.js
 *
 * Edit config/game-config.js first (add/edit a slot), then run this so host
 * answer sheets stay in sync. Also refreshes config/game-config.json.
 */

const fs = require("fs");
const path = require("path");
const {
  CONFIG_DIR,
  DATA_DIR,
  loadGameConfig,
  rebuildProfilesBundle,
  resolveProfileId,
  listProfileIds,
  CONFIG_JS,
} = require("./config-io");

const root = CONFIG_DIR;
const arg = process.argv[2];

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function syncOne(profileId) {
  const id = resolveProfileId(root, profileId);
  const cfg = loadGameConfig(root, id);
  if (!cfg || !Array.isArray(cfg.categories)) {
    console.error(
      'Could not load categories for slot "' + id + '" from config/' + CONFIG_JS
    );
    process.exit(1);
  }

  const sourceLabel = "config/" + CONFIG_JS + ' → slot "' + id + '"';
  const defaultId = resolveProfileId(root, null);
  const suffix = id === defaultId ? "" : "-" + id;
  const outJson = path.join(DATA_DIR, "jeopardy-answers" + suffix + ".json");
  const outTxt = path.join(DATA_DIR, "jeopardy-answers" + suffix + ".txt");

  const fj = cfg.finalJeopardy || {};
  const json = {
    title: "Jeopardy — clues and correct responses",
    _generatedFrom: sourceLabel,
    _profileId: id,
    _note: "Do not edit by hand — run: node scripts/sync-answers.js " + id,
    finalJeopardy: {
      category: fj.category,
      clue: fj.clue,
      answer: fj.answer,
    },
    categories: cfg.categories.map((cat) => {
      const out = { name: cat.name, clues: [] };
      if (cat.note) out.note = cat.note;
      out.clues = cat.clues.map((q) => {
        const c = {
          value: q.value,
          clue: q.clue,
          answer: q.answer,
        };
        if (q.audio) c.audio = q.audio;
        if (q.song) c.song = q.song;
        if (q.artist) c.artist = q.artist;
        if (q.track) c.track = q.track;
        return c;
      });
      return out;
    }),
  };

  fs.writeFileSync(outJson, JSON.stringify(json, null, 2) + "\n", "utf8");

  const lines = [];
  lines.push("JEOPARDY — CLUES & CORRECT RESPONSES");
  lines.push("=====================================");
  lines.push("Profile: " + id);
  lines.push(
    "(Generated from " +
      sourceLabel +
      " — edit that file, then run: node scripts/sync-answers.js " +
      id +
      ")"
  );
  lines.push("");
  lines.push("--- FINAL JEOPARDY ---");
  lines.push("Category: " + (fj.category || ""));
  lines.push("Clue: " + (fj.clue || ""));
  lines.push("Answer: " + (fj.answer || ""));
  lines.push("");

  for (const cat of cfg.categories) {
    const label = cat.name.toUpperCase() + (cat.note ? " (" + cat.note + ")" : "");
    lines.push("--- " + label + " ---");
    for (const q of cat.clues) {
      lines.push("$" + q.value);
      if (q.song || q.artist) {
        lines.push(
          "Song: " + (q.song || "?") + " — Artist: " + (q.artist || "?")
        );
      }
      if (q.audio) lines.push("Audio: " + q.audio);
      lines.push("Clue: " + q.clue);
      lines.push("Answer: " + q.answer);
      lines.push("");
    }
  }

  fs.writeFileSync(outTxt, lines.join("\n") + "\n", "utf8");
  console.log(
    "Updated data/" +
      path.basename(outJson) +
      " and data/" +
      path.basename(outTxt) +
      " from " +
      sourceLabel
  );
}

if (arg === "--all") {
  const ids = listProfileIds(root);
  if (!ids.length) {
    console.error("No slots in config/" + CONFIG_JS);
    process.exit(1);
  }
  for (const id of ids) syncOne(id);
} else {
  syncOne(arg || null);
}

rebuildProfilesBundle(root);
console.log("Refreshed config/" + CONFIG_JS + " / config/game-config.json");
