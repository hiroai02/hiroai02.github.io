// Foundation: data access, save/load, hero progression, legend score, audio, view routing.
// All content (jobs/enemies/maps/quests/balance) lives in data/*.json, inlined at build time as
// window.GAMEDATA - see DESIGN.md section 13. No hardcoded balance numbers in code.
const D = window.GAMEDATA;
const JOBS = D.jobs, ENEMIES = D.enemies, MAPS = D.maps, QUESTS = D.quests, BAL = D.balance;

const HERO_COUNT = 4;
const START_JOBS = ['ashigaru', 'shashu', 'jumi', 'kagura'];

// Slot identity is red/green/light-blue/orange for #1-4, independent of job - a fixed,
// functional labelling scheme (not the reference's own art or text) that we reproduce exactly.
const SLOT_COLORS = ['#C32626', '#26963B', '#4AA8D8', '#D87524'];

// Orbs: a small fixed catalog, bought outright with gold. One equips per hero and swaps freely.
const ORBS = {
  power:  { name: 'パワーオーブ',  cost: 600,  reqQuest: 'q02', reqLegend: 20,  desc: '攻撃力 +12%', atkMul: 1.12 },
  quick:  { name: 'クイックオーブ', cost: 800,  reqQuest: 'q03', reqLegend: 40,  desc: '攻撃速度 +18%', cdMul: 0.82 },
  fly:    { name: 'フライオーブ',   cost: 750,  reqQuest: 'q02', reqLegend: 20,  desc: '飛行へのダメージ +35%', bonusVs: { flyer: 0.35 } },
  metal:  { name: 'メタルオーブ',   cost: 1000, reqQuest: 'q03', reqLegend: 40,  desc: 'メタルへのダメージ +40%', bonusVs: { metal: 0.40 } },
  demon:  { name: 'デーモンオーブ', cost: 1200, reqQuest: 'q04', reqLegend: 70,  desc: '魔物へのダメージ +40%', bonusVs: { yokai: 0.40 } },
  push:   { name: 'プッシュオーブ', cost: 1100, reqQuest: 'q04', reqLegend: 70,  desc: 'ノックバック +0.35', kbAdd: 0.35 },
  stun:   { name: 'スタンオーブ',   cost: 1400, reqQuest: 'q05', reqLegend: 100, desc: 'スタン +0.45秒', stunAdd: 450 },
  weak:   { name: 'ウィークオーブ', cost: 1400, reqQuest: 'q05', reqLegend: 100, desc: '弱体 +18%', debuffAdd: 0.18 },
  slow:   { name: 'スロウオーブ',   cost: 1600, reqQuest: 'q06', reqLegend: 140, desc: '鈍足 +22%', slowAdd: 0.22 },
  venom:  { name: 'ドクオーブ',     cost: 1600, reqQuest: 'q05', reqLegend: 100, desc: '毒 +7', poisonAdd: 7 },
  pierce: { name: 'カンツウオーブ', cost: 1800, reqQuest: 'q06', reqLegend: 140, desc: '防御貫通 +35%', pierceAdd: 0.35 },

  // 原作の炸裂/爆風系を永久コレクション向けに再設計。
  // 炸裂: 主標的+近接2体。爆風: 画面上の全敵へ減衰ダメージ。
  spark:  { name: 'スパークオーブ', cost: 2400, reqQuest: 'q07', reqLegend: 200,
            desc: '炸裂：主標的の近く2体へ45%ダメージ', area: { type: 'burst', targets: 2, multiplier: 0.45 } },
  storm:  { name: 'ストームオーブ', cost: 5000, reqQuest: 'q09', reqLegend: 350,
            desc: '爆風：主標的以外の全敵へ32%ダメージ', area: { type: 'all', multiplier: 0.32 } },
};

// Job-tree unlock thresholds are the CURRENT job's level, not full mastery - branches open at
// Lv5/9/14/18 of the job being left, each gated by a dedicated 転職試験 exam quest.
const EVOLVE_LV = { 2: 5, 3: 9, 4: 14, 5: 18 };

// Servants (従者, DESIGN.md §19's 編成/派遣 companion system, renamed away from "仲間" - that
// word is already the 4-hero party screen's name in this build, and reusing it for a second,
// unrelated roster would be confusing). Scoped down to just the "編成: 1-3体まで同行し、配置枠
// とは別枠で支援効果を出す" half - 派遣(sending one off to boost 採取/精錬) has no target system
// since RESEARCH.md rejected both. Bought outright with gold (once each, no duplicates), then
// toggled active/inactive up to SERVANT_MAX_ACTIVE at a time; active ones apply a flat party-wide
// multiplier/bonus, separate from the per-hero orb slot and from job mastery bonuses.
const SERVANTS = {
  hikitsune: { name: '火狐', cost: 800, desc: '攻撃力 +8%', color: '#D8623F', atkMul: 1.08 },
  fuusei: { name: '風精', cost: 800, desc: '攻撃間隔 -8%', color: '#7FD0C8', cdMul: 0.92 },
  iwakoma: { name: '岩狛', cost: 1000, desc: '人形 +1', color: '#8A7550', livesAdd: 1 },
  kodama: { name: '木霊', cost: 700, desc: '任務報酬金 +10%', color: '#6FA85E', goldMul: 1.10 },
};
const SERVANT_MAX_ACTIVE = 2;
function servantMul(key) {
  let mul = 1;
  for (const id of save.servants.active) { const v = SERVANTS[id][key]; if (v) mul *= v; }
  return mul;
}
function servantLivesBonus() {
  let add = 0;
  for (const id of save.servants.active) add += SERVANTS[id].livesAdd || 0;
  return add;
}
function buyServant(id) {
  if (save.servants.owned.includes(id)) return false;
  const cost = SERVANTS[id].cost;
  if (save.gold < cost) return false;
  save.gold -= cost;
  save.servants.owned.push(id);
  persist();
  return true;
}
function toggleServant(id) {
  const active = save.servants.active;
  const at = active.indexOf(id);
  if (at >= 0) { active.splice(at, 1); persist(); return true; }
  if (active.length >= SERVANT_MAX_ACTIVE) return false;
  active.push(id);
  persist();
  return true;
}

const SAVE_KEY = 'legend_boei_save_v1';
function defaultHeroes() {
  return START_JOBS.map(job => ({ job, lv: 1, exp: 0, weaponLv: 0, orb: null, history: [job] }));
}
const DEFAULT_SAVE = {
  version: 1,
  gold: 0,
  legendScore: 0,         // 伝説度: cumulative, never spent, only ever grows
  heroes: null,
  mastered: [],           // jobId[] - every job any hero has ever evolved past, for party-wide bonuses
  ownedOrbs: null,        // orbId[] - permanent collection. Once acquired, never consumed.
  unlockedJobs: null,     // jobId[] - every job any hero has ever reached; any hero can freely
                          // switch into these (president: 操作キャラ全員　解放済みの職業に転職できるように)
  questCleared: {},
  enemySeen: null,        // enemyId[] - gallery discovery; recorded when an enemy actually spawns
  titles: [],
  servants: null,         // { owned: servantId[], active: servantId[] } - see SERVANTS above
  trainTickets: BAL.training.ticketMax,
  trainCount: 0,
  lastTicketAt: 0,
  muted: false,
};

// Persistence: an Artifact's localStorage does NOT reliably survive reopening the page (the
// runtime says as much - "nothing is kept unless the page publishes it"), which is exactly the
// bug the president hit (進行が保存されない). The real save lives baked into the page itself:
// window.SAVE_STATE is what this exact page was published with, and window.PAGE_TEMPLATE (see
// build.ps1) is this page's own source with the save data left as a hole, so a running page can
// regenerate a fresh, correctly self-referencing copy of itself and publish that via the
// `artifact` capability. localStorage is kept too, but only as a same-tab/same-session nicety -
// never the thing actually relied on to survive a reopen.
let save = load();

function load() {
  const embedded = window.SAVE_STATE;
  let s;
  if (embedded && embedded.heroes) s = { ...DEFAULT_SAVE, ...embedded };
  else {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
      s = (raw && raw.heroes) ? { ...DEFAULT_SAVE, ...raw } : { ...DEFAULT_SAVE, heroes: defaultHeroes() };
    } catch { s = { ...DEFAULT_SAVE, heroes: defaultHeroes() }; }
  }
  // self-healing: older saves predate permanent orb ownership. Any orb already equipped in an
  // old save is grandfathered into permanent ownership so no progress is lost.
  if (!s.ownedOrbs) s.ownedOrbs = [];
  for (const h of s.heroes) if (h.orb && !s.ownedOrbs.includes(h.orb)) s.ownedOrbs.push(h.orb);
  // self-healing: older saves predate unlockedJobs, and every hero's CURRENT job must count as
  // unlocked regardless of when it was reached
  if (!s.unlockedJobs) s.unlockedJobs = [...START_JOBS];
  for (const h of s.heroes) if (!s.unlockedJobs.includes(h.job)) s.unlockedJobs.push(h.job);
  // self-healing: older saves predate per-hero history (president: なったことない職業だけ
  // 表示して転職 - hide jobs a hero has already personally held from their own transfer list,
  // since specialJobsAvailable() is party-wide and kept re-showing the same hybrid/special
  // job to every hero once anyone unlocked it). Seed with at least the hero's current job.
  for (const h of s.heroes) if (!h.history) h.history = [h.job];
  // self-healing: older saves predate the monster-gallery discovery list.
  if (!s.enemySeen) s.enemySeen = [];
  // self-healing: older saves predate the servant roster
  if (!s.servants) s.servants = { owned: [], active: [] };
  return s;
}

let saveDirty = false, publishTimer = null, artifactCapPromise;
// A successful publish reloads THIS tab too (that's how the artifact capability works). Calling
// flushNow() on every route('v-home') turned out to still be jarring even though the player was
// "already heading there" (president: 初期画面に戻るバグがひどい) - home is visited constantly
// (after every quest/purchase/menu-back), so that was really a reload-on-every-navigation bug in
// practice. Fix: normal navigation only ever calls persist() (localStorage + dirty flag, no
// reload). The real publish only fires when the player can't see it happen - tab hidden/closed
// (see the visibilitychange/pagehide listeners in 50_main.js) - or as a last-resort long idle
// fallback, never as a side effect of moving between screens.
function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* best-effort only */ }
  saveDirty = true;
  clearTimeout(publishTimer);
  publishTimer = setTimeout(flushSave, 60000);
}
function flushNow() { clearTimeout(publishTimer); flushSave(); }
function resetSave() {
  save = { ...DEFAULT_SAVE, heroes: defaultHeroes(), mastered: [], ownedOrbs: [], unlockedJobs: [...START_JOBS], questCleared: {}, enemySeen: [], titles: [], servants: { owned: [], active: [] } };
  persist();
}

function discoverEnemy(id) {
  if (!id || save.enemySeen.includes(id)) return false;
  save.enemySeen.push(id);
  persist();
  return true;
}

async function getArtifactCap() {
  if (artifactCapPromise === undefined) {
    artifactCapPromise = (window.claude && window.claude.use) ? window.claude.use('artifact').catch(() => null) : Promise.resolve(null);
  }
  return artifactCapPromise;
}

// Publishing reloads the tab that calls it, so this never fires mid-battle - it just keeps
// deferring itself every 2.5s until B.running is false, then republishes the whole page with
// the current save baked in. B is declared later in the concatenated build but always exists
// by the time this actually runs.
async function flushSave() {
  if (typeof B !== 'undefined' && B.running) { publishTimer = setTimeout(flushSave, 2500); return; }
  if (!saveDirty || !window.PAGE_TEMPLATE) return;
  const cap = await getArtifactCap();
  if (!cap) return; // capability not granted in this view - localStorage-only for this tab
  // BUG HISTORY - read before touching this function: this whole feature silently corrupted
  // every save for a while because this file's own source is concatenated verbatim into the
  // page's one real game-logic tag, so ANY markup-sensitive sequence typed literally ANYWHERE
  // in this file (code or comments) - the tag-open word, the tag-close word, or an HTML
  // comment-opener - gets parsed as real markup right there and corrupts the tag boundary.
  // Two independent bugs, found one after the other: a literal copy of the tag-close word in
  // a comment, and a literal copy of the self-slot's HTML-comment marker in the replace() call
  // below. Both are now built from split fragments (never a contiguous literal), and this
  // comment deliberately never spells either sequence out either.
  // Same split-fragment rule applies to the save-slot marker below, for a THIRD reason beyond
  // the two above: build.ps1's own build-time substitution for this exact marker is a REPLACE
  // ALL (PowerShell's .Replace(), unlike JS's first-occurrence-only string .replace()), so a
  // contiguous copy of the marker sitting in this source file - even inside a quoted JS string,
  // never mind a comment - gets overwritten by the build too, silently turning this very call's
  // own search string into the literal word the marker resolves to. Three independent ways for
  // a contiguous literal to break the build; the fix is the same fragment trick every time.
  const openTag = '<scr' + 'ipt>', closeTag = '<' + '/scr' + 'ipt>';
  const closeSeq = '<' + '/scr' + 'ipt';
  const selfMarker = '<' + '!--__SELF__--' + '>';
  const saveSlot = '/*' + '__SAVE__' + '*/';
  const templateJson = JSON.stringify(window.PAGE_TEMPLATE).replace(new RegExp(closeSeq, 'gi'), '<\\/script');
  const selfScript = openTag + 'window.PAGE_TEMPLATE = ' + templateJson + ';' + closeTag;
  const html = window.PAGE_TEMPLATE
    .replace(saveSlot, JSON.stringify(save))
    .replace(selfMarker, selfScript);
  saveDirty = false;
  try { await cap.publish(html); }
  catch { saveDirty = true; } // 'conflict' means another view already won and is reloading; anything else, just retry on the next trigger
}

// --- hero progression ---
function expNeeded(jobId, lv) {
  const tier = JOBS[jobId].tier;
  const base = BAL.jobExp.base[String(Math.min(tier, 5))] || 40;
  return Math.round(base * Math.pow(lv, BAL.jobExp.power));
}
function isMastered(id) { return save.mastered.includes(id); }

// Kills and training both feed the same hero-instance exp bar - each of the four is its own
// persistent character, not a shared per-job pool.
function addHeroExp(hero, amount) {
  if (hero.lv >= BAL.jobExp.maxLevel) return { leveled: 0, mastered: false };
  hero.exp += Math.round(amount);
  let leveled = 0;
  while (hero.lv < BAL.jobExp.maxLevel && hero.exp >= expNeeded(hero.job, hero.lv)) {
    hero.exp -= expNeeded(hero.job, hero.lv);
    hero.lv++; leveled++;
  }
  let mastered = false;
  if (hero.lv >= BAL.jobExp.maxLevel && !isMastered(hero.job)) {
    save.mastered.push(hero.job); mastered = true;
  }
  persist();
  return { leveled, mastered };
}

// What a hero currently at fromJob/fromLv can evolve into right now.
function evolutionsFor(fromJob, fromLv) {
  return Object.keys(JOBS).filter(id => {
    const t = JOBS[id];
    if (t.titleReq || t.questReq) return false; // special jobs are granted separately, not chosen here
    // Hybrids: only offer this as a next step to a hero whose CURRENT job is actually one of the
    // listed prerequisite lineages (not every prerequisite mastered by anyone in the party) -
    // otherwise any hero, regardless of their own job, could "転職" into an unrelated hybrid the
    // moment two OTHER heroes happened to master its prerequisites (president: この転職ボタン邪魔
    // ここで出来るのは未進化の転職のみにして - spotted on 勇者, who was showing unrelated
    // hybrid transfer buttons that had nothing to do with its own odachi->yuusha lineage).
    if (t.masterReq) return t.masterReq.includes(fromJob) && t.masterReq.every(isMastered);
    if (t.from && t.from.includes(fromJob)) {
      const lvOk = fromLv >= (EVOLVE_LV[t.tier] || 5);
      const examOk = !t.examReq || !!save.questCleared[t.examReq];
      return lvOk && examOk;
    }
    return false;
  });
}
function specialJobsAvailable() {
  return Object.keys(JOBS).filter(id => {
    const t = JOBS[id];
    if (!t.titleReq && !t.questReq) return false;
    if (t.titleReq && !save.titles.includes(t.titleReq)) return false;
    if (t.questReq && !save.questCleared[t.questReq]) return false;
    if (t.masterReq && !t.masterReq.every(isMastered)) return false;
    return true;
  });
}

// Any hero can switch into any job the party has already unlocked (reached before, by any
// hero), free and instant, alongside the normal tree-gated evolution options (president:
// 操作キャラ全員　解放済みの職業に転職できるように).
function evolveHero(hero, toJob) {
  const viaTree = evolutionsFor(hero.job, hero.lv).includes(toJob) || specialJobsAvailable().includes(toJob);
  const viaUnlocked = save.unlockedJobs.includes(toJob);
  if (!viaTree && !viaUnlocked) return false;
  if (!isMastered(hero.job)) save.mastered.push(hero.job); // the job just left behind still banks its bonus
  hero.job = toJob; hero.lv = 1; hero.exp = 0; // weaponLv/orb are the character's own gear - carries over
  if (!hero.history) hero.history = [];
  if (!hero.history.includes(toJob)) hero.history.push(toJob);
  if (!save.unlockedJobs.includes(toJob)) save.unlockedJobs.push(toJob);
  persist();
  return true;
}

// Mastered jobs grant permanent party-wide bonuses - the reason to fully master a job before
// moving on, even once evolving further is already available.
function supportTotal(id) {
  let total = 0;
  for (const jid of save.mastered) {
    const m = JOBS[jid] && JOBS[jid].master;
    if (m && m.id === id) total += m.value;
  }
  return total;
}

// --- weapons ---
// "武器強化費用" master bonus (jumi/yariashi/kunoichi/nagae/raifushi lines) used to be labelled
// refineCost/materialCost for the rejected 精錬/採取 systems (RESEARCH.md's 採用しない list) and
// did nothing - remapped onto this real, already-live cost formula instead of staying dead flavor
// text on the job tree screen.
function weaponCost(lv) {
  return Math.round(BAL.weapon.costBase * Math.pow(BAL.weapon.costPower, lv) * (1 + supportTotal('weaponCost')));
}
function upgradeWeapon(hero) {
  if (hero.weaponLv >= BAL.weapon.maxLevel) return false;
  const cost = weaponCost(hero.weaponLv);
  if (save.gold < cost) return false;
  save.gold -= cost; hero.weaponLv++;
  persist();
  return true;
}
// "オーブ購入費用" master bonus (shashu/reikyu/bukyuushi line) used to be labelled gatherBonus
// for the rejected 採取 system and did nothing - remapped onto this real, already-live cost.
function orbCost(orbId) { return Math.round(ORBS[orbId].cost * (1 + supportTotal('orbCost'))); }
function ownsOrb(orbId) { return save.ownedOrbs.includes(orbId); }
function orbRequirementsMet(orbId) {
  const o = ORBS[orbId];
  if (o.reqQuest && !save.questCleared[o.reqQuest]) return false;
  if ((o.reqLegend || 0) > save.legendScore) return false;
  return true;
}
function orbRequirementText(orbId) {
  const o = ORBS[orbId], needs = [];
  if (o.reqQuest && !save.questCleared[o.reqQuest]) {
    const q = QUESTS.find(x => x.id === o.reqQuest);
    needs.push((q ? q.name : o.reqQuest) + '突破');
  }
  if ((o.reqLegend || 0) > save.legendScore) needs.push('伝説度' + o.reqLegend);
  return needs.join(' / ');
}
function acquireOrb(orbId) {
  if (ownsOrb(orbId)) return true;
  if (!orbRequirementsMet(orbId)) return false;
  const cost = orbCost(orbId);
  if (save.gold < cost) return false;
  save.gold -= cost;
  save.ownedOrbs.push(orbId);
  persist();
  return true;
}
function equipOrb(hero, orbId) {
  if (hero.orb === orbId) return true;
  if (orbId && !ownsOrb(orbId) && !acquireOrb(orbId)) return false;
  hero.orb = orbId || null;
  persist();
  return true;
}

// --- audio ---
const sfx = (() => {
  let ac = null;
  function ctx() {
    if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ac = new AC(); }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  function tone(f, dur, type, vol, when = 0, glide = null) {
    const c = ctx(); if (!c || save.muted) return;
    const t0 = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  return {
    unlock() { ctx(); },
    ui() { tone(430, 0.06, 'triangle', 0.05); },
    buy() { tone(320, 0.09, 'triangle', 0.06); tone(480, 0.09, 'triangle', 0.045, 0.05); },
    hit() { tone(220, 0.04, 'square', 0.022); },
    kill() { tone(520, 0.07, 'triangle', 0.04); },
    leak() { tone(190, 0.24, 'sawtooth', 0.07, 0, 95); },
    level() { [523, 659, 784].forEach((f, i) => tone(f, 0.15, 'triangle', 0.07, i * 0.07)); },
    master() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.26, 'triangle', 0.08, i * 0.09)); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.08, i * 0.1)); },
    lose() { [400, 320, 240].forEach((f, i) => tone(f, 0.34, 'sawtooth', 0.07, i * 0.14)); },
  };
})();

// --- view routing ---
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === id));
  window.scrollTo(0, 0);
}
function overlay(title, text, buttons) {
  const ov = document.getElementById('ov');
  ov.querySelector('h2').textContent = title;
  ov.querySelector('p').textContent = text;
  const row = ov.querySelector('.row');
  row.innerHTML = '';
  for (const b of buttons) {
    const el = document.createElement('button');
    el.className = 'btn' + (b.primary ? ' primary' : '');
    el.textContent = b.label;
    el.onclick = () => { ov.classList.remove('show'); b.act && b.act(); };
    row.appendChild(el);
  }
  ov.classList.add('show');
}
