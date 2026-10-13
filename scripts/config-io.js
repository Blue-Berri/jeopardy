/**
 * Read/write multi-slot boards from config/game-config.js (single source of truth).
 *
 * Layout:
 *   config/game-config.js   — window.GAME_PROFILES array + GAME_DEFAULT_PROFILE
 *   config/game-config.json — JSON mirror of the same slots (handy for tooling)
 *   data/                   — host answer sheets (jeopardy-answers*.json/txt)
 *   assets/audio/           — theme music
 *   assets/snippets/        — clue audio clips
 *
 * Edit config/game-config.js to add/change games.
 * Run: node scripts/sync-answers.js
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const REPO_ROOT = path.join(__dirname, "..");
const CONFIG_DIR = path.join(REPO_ROOT, "config");
const DATA_DIR = path.join(REPO_ROOT, "data");
const CONFIG_JS = "game-config.js";
const CONFIG_JSON = "game-config.json";

const CONFIG_JS_HEADER = `/**
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

`;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadConfigBundle(root) {
  root = root || CONFIG_DIR;
  const jsPath = path.join(root, CONFIG_JS);
  if (fs.existsSync(jsPath)) {
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(jsPath, "utf8"), sandbox, {
      filename: CONFIG_JS,
    });
    const raw = sandbox.window.GAME_PROFILES;
    let profiles = [];
    if (Array.isArray(raw)) {
      profiles = raw.filter((p) => p && p.id);
    } else if (raw && typeof raw === "object") {
      profiles = Object.keys(raw).map((id) => {
        const p = raw[id] || {};
        return p.id ? p : { ...p, id };
      });
    }
    const defaultId =
      sandbox.window.GAME_DEFAULT_PROFILE ||
      (profiles[0] && profiles[0].id) ||
      null;
    return { profiles, defaultId };
  }

  const jsonPath = path.join(root, CONFIG_JSON);
  if (fs.existsSync(jsonPath)) {
    const data = readJson(jsonPath);
    if (Array.isArray(data.profiles)) {
      return {
        profiles: data.profiles.filter((p) => p && p.id),
        defaultId: data.default || (data.profiles[0] && data.profiles[0].id) || null,
      };
    }
    // Legacy single-board JSON
    if (data.categories) {
      const id = data.id || "default";
      return {
        profiles: [{ id, title: data.title || id, description: "", ...data }],
        defaultId: id,
      };
    }
  }

  return { profiles: [], defaultId: null };
}

function loadManifest(root) {
  const { profiles, defaultId } = loadConfigBundle(root);
  return {
    default: defaultId,
    profiles: profiles.map((p) => ({
      id: p.id,
      title: p.title || p.id,
      description: p.description || "",
    })),
  };
}

function resolveProfileId(root, profileId) {
  const { profiles, defaultId } = loadConfigBundle(root);
  if (profileId) return profileId;
  return defaultId || (profiles[0] && profiles[0].id) || "hack-retreat";
}

function loadGameConfig(root, profileId) {
  const { profiles } = loadConfigBundle(root);
  const id = resolveProfileId(root, profileId);
  return profiles.find((p) => p.id === id) || null;
}

function listProfileIds(root) {
  return loadConfigBundle(root).profiles.map((p) => p.id);
}

function normalizeBoard(cfg) {
  // Ensure the in-game heading has something to show.
  const out = { ...cfg };
  if (!out.gameTitle && out.title && /jeopardy/i.test(String(out.title))) {
    out.gameTitle = out.title;
  }
  if (!out.gameTitle) out.gameTitle = "JEOPARDY!";
  return out;
}

function writeConfigBundle(root, profiles, defaultId) {
  root = root || CONFIG_DIR;
  const list = (profiles || []).map(normalizeBoard);
  const def =
    defaultId && list.some((p) => p.id === defaultId)
      ? defaultId
      : (list[0] && list[0].id) || "hack-retreat";

  const js =
    CONFIG_JS_HEADER +
    "window.GAME_DEFAULT_PROFILE = " +
    JSON.stringify(def) +
    ";\n\n" +
    "window.GAME_PROFILES = " +
    JSON.stringify(list, null, 2) +
    ";\n\n" +
    "// Convenience: active board (default slot). The start screen lets you pick any slot.\n" +
    "window.GAME_CONFIG = (window.GAME_PROFILES.find(function (p) {\n" +
    "  return p.id === window.GAME_DEFAULT_PROFILE;\n" +
    "}) || window.GAME_PROFILES[0] || null);\n";

  fs.writeFileSync(path.join(root, CONFIG_JS), js, "utf8");

  const json = {
    default: def,
    profiles: list,
  };
  fs.writeFileSync(
    path.join(root, CONFIG_JSON),
    JSON.stringify(json, null, 2) + "\n",
    "utf8"
  );

  return { profiles: list, defaultId: def };
}

function writeGameConfig(root, cfg, profileId) {
  root = root || CONFIG_DIR;
  const { profiles, defaultId } = loadConfigBundle(root);
  const id = resolveProfileId(root, profileId);
  const next = normalizeBoard({ ...cfg, id });
  if (!next.title) next.title = cfg.title || id;
  if (next.description == null) next.description = cfg.description || "";

  const idx = profiles.findIndex((p) => p.id === id);
  if (idx >= 0) profiles[idx] = { ...profiles[idx], ...next, id };
  else profiles.push(next);

  writeConfigBundle(root, profiles, defaultId);
}

function rebuildProfilesBundle(root) {
  // Re-serialize game-config.js / .json from whatever is currently loaded.
  const { profiles, defaultId } = loadConfigBundle(root);
  return writeConfigBundle(root, profiles, defaultId);
}

module.exports = {
  REPO_ROOT,
  CONFIG_DIR,
  DATA_DIR,
  loadGameConfig,
  writeGameConfig,
  loadManifest,
  loadConfigBundle,
  writeConfigBundle,
  rebuildProfilesBundle,
  resolveProfileId,
  listProfileIds,
  CONFIG_JSON,
  CONFIG_JS,
};
