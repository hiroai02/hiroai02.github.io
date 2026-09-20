// Battle: path traversal, enemy AI, fixed four-person single-target combat, knockback/status effects,
// quest lifecycle. Four heroes are fixed from the start (no hiring/placement) - growth comes
// entirely from job level, weapon level and orb (see 10_core.js). Heroes always attack; there
// is no rest-to-train toggle (president: 休憩システムいらない).
const B = {
  quest: null, map: null, cell: 40,
  units: [], enemies: [], shots: [], floats: [], hitfx: [],
  gold: 0, waveIdx: -1, pending: [], alive: 0,
  phase: 'idle',   // idle | wave | between | done
  timer: 0, running: false, lastT: 0, speed: 1,
};

function enemyAbilities(def) {
  if (Array.isArray(def.abilities)) return def.abilities;
  return def.ability ? [def.ability] : [];
}
function hasEnemyAbility(def, id) { return enemyAbilities(def).includes(id); }

// Enemy position is a scalar distance along the path. Knockback is then just a subtraction,
// which stays correct on corners where an (x,y) nudge would push a unit off the road.
function pathPoint(map, pos) {
  const p = map.path;
  const i = Math.max(0, Math.min(Math.floor(pos), p.length - 2));
  const f = Math.max(0, Math.min(1, pos - i));
  return { x: p[i][0] + (p[i + 1][0] - p[i][0]) * f + 0.5, y: p[i][1] + (p[i + 1][1] - p[i][1]) * f + 0.5 };
}

// The original battle screen is a fixed four-person formation around one horizontal defence
// lane. Coordinates here are NORMALISED screen positions (0..1), not map tiles. Slot order is
// #1 upper-left, #2 lower-left, #3 upper-right, #4 lower-right, matching the original layout.
function heroAnchors(map) {
  // Tall-phone composition: keep the four defenders grouped around the actual combat lane
  // instead of letting the lower pair drift into the bottom controls area.
  return [[0.57, 0.27], [0.57, 0.69], [0.82, 0.27], [0.82, 0.69]];
}

// Enemy movement still uses the data map's scalar path distance, but rendering/effects use a
// single horizontal defence line like the original: enemies enter from the left and a leak at
// the right edge is failure.
function battlePoint(pos) {
  const len = Math.max(1, B.map.path.length - 1);
  const t = Math.max(0, Math.min(1, pos / len));
  return { x: 0.055 + t * 0.89, y: 0.48 };
}

function heroStats(hero) {
  const j = JOBS[hero.job];
  const orb = hero.orb ? ORBS[hero.orb] : null;
  const w = BAL.weapon;
  const atkMul = (1 + (hero.lv - 1) * 0.05) * (1 + hero.weaponLv * w.atkPerLevel) * (orb && orb.atkMul || 1) * servantMul('atkMul');
  const cdMul = Math.pow(w.cdMulPerLevel, hero.weaponLv) * (orb && orb.cdMul || 1) * servantMul('cdMul');
  return {
    atk: j.atk * atkMul,
    cd: Math.max(180, j.cd * cdMul),
    pierce: (j.pierce || 0) + (orb && orb.pierceAdd || 0),
    poison: Math.max(j.poison || 0, orb && orb.poisonAdd || 0),
    kb: (j.kb || 0) + (orb && orb.kbAdd || 0),
    coin: (j.coin || 1) * (orb && orb.coinMul || 1),
    strong: j.strong,
    bonusVs: orb && orb.bonusVs || null,
    stun: (j.stun || 0) + (orb && orb.stunAdd || 0),
    slow: (j.slow || 0) + (orb && orb.slowAdd || 0),
    debuff: (j.debuff || 0) + (orb && orb.debuffAdd || 0),
    buff: j.buff,
    area: orb && orb.area || null,
    color: j.color, name: j.name, line: j.line, tier: j.tier,
  };
}

function startQuest(questId) {
  const q = QUESTS.find(x => x.id === questId);

  B.quest = q; B.map = MAPS[q.map];
  B.enemies = []; B.shots = []; B.floats = []; B.hitfx = []; B.gold = 0;
  B.waveIdx = -1; B.pending = []; B.alive = 0;
  B.phase = 'between'; B.timer = 650; B.speed = 1;

  const anchors = heroAnchors(B.map);
  B.units = save.heroes.map((hero, i) => ({
    hero, x: anchors[i][0], y: anchors[i][1], cool: 0, killCoin: 1, attackT: 9999,
  }));

  showView('v-battle');
  fitBoard();
  renderBattleBar();
  B.running = true; B.lastT = performance.now();
  requestAnimationFrame(battleLoop);
  return true;
}

// The reference battle screen reads as a compact, near-square field with large characters
// filling most of it - not a long thin strip. The road's tile grid stays fixed (already tuned
// for wave pacing via simulation), but cells are capped by height as well as width so scaling
// toward a wider phone doesn't shrink the characters back down.
function fitBoard() {
  const c = document.getElementById('board');
  const stage = c.closest('.battle-stage');
  const head = document.querySelector('#v-battle .battle-head');
  const viewportH = Math.round((window.visualViewport && window.visualViewport.height) || window.innerHeight || 720);
  const maxW = Math.min(window.innerWidth, 568);
  c.width = Math.max(280, Math.floor(maxW));

  // The hosted phone build must own the whole visible battle viewport. The previous fixed
  // 0.86 ratio left roughly half of a modern iPhone as an empty green slab below the field.
  // Keep a minimum compact composition, then extend the painted field to the bottom of the
  // visible viewport. All unit positions remain normalized, so formation stays deterministic.
  const headH = head ? Math.ceil(head.getBoundingClientRect().height) : 70;
  const availableH = Math.max(360, viewportH - headH);
  c.height = Math.max(Math.floor(c.width * 0.98), availableH);
  if (stage) stage.style.height = c.height + 'px';
  B.cell = c.width / Math.max(1, B.map.cols);
}

function beginWave() {
  B.waveIdx++;
  const w = B.quest.waves[B.waveIdx];
  B.phase = 'wave';
  B.pending = [];
  for (const s of w.spawns) {
    for (let i = 0; i < s.count; i++) B.pending.push({ enemy: s.enemy, at: (s.delay || 0) + i * s.gap });
  }
  B.pending.sort((a, b) => a.at - b.at);
  B.timer = 0;
  renderBattleBar();
}

function battleLoop(now) {
  if (!B.running) return;
  const raw = Math.min(50, now - B.lastT);
  B.lastT = now;
  stepBattle(raw * B.speed);
  drawBattle();
  requestAnimationFrame(battleLoop);
}

function stepBattle(dt) {
  if (B.phase === 'done') return;

  if (B.phase === 'between') {
    B.timer -= dt;
    if (B.timer <= 0) {
      if (B.waveIdx + 1 >= B.quest.waves.length) return finishQuest(true);
      beginWave();
    }
  } else if (B.phase === 'wave') {
    B.timer += dt;
    while (B.pending.length && B.pending[0].at <= B.timer) spawnEnemy(B.pending.shift().enemy);
    if (!B.pending.length && B.alive === 0) {
      if (B.waveIdx + 1 >= B.quest.waves.length) return finishQuest(true);
      B.phase = 'between'; B.timer = 850; renderBattleBar();
    }
  }

  stepEnemies(dt);
  if (B.phase === 'done') return;
  stepUnits(dt);

  for (let i = B.shots.length - 1; i >= 0; i--) { B.shots[i].life -= dt; if (B.shots[i].life <= 0) B.shots.splice(i, 1); }
  for (let i = B.floats.length - 1; i >= 0; i--) { B.floats[i].life -= dt; if (B.floats[i].life <= 0) B.floats.splice(i, 1); }
  for (let i = B.hitfx.length - 1; i >= 0; i--) { B.hitfx[i].life -= dt; if (B.hitfx[i].life <= 0) B.hitfx.splice(i, 1); }
}

function stepEnemies(dt) {
  const len = B.map.path.length - 1;
  for (const e of B.enemies) {
    if (e.hp <= 0) continue;
    if (e.stun > 0) e.stun -= dt;
    if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slowAmt = 0; }
    if (e.debuffT > 0) { e.debuffT -= dt; if (e.debuffT <= 0) e.debuffAmt = 0; }
    if (e.invincibleT > 0) e.invincibleT -= dt;
    if (e.poison > 0 && e.invincibleT <= 0) { e.poisonT -= dt; if (e.poisonT <= 0) { damage(e, e.poison, true); e.poisonT = 1000; } }
    if (hasEnemyAbility(e.def, 'haste') && !e.hasted && e.hp / e.maxHp <= e.def.hasteAt) { e.hasted = true; e.baseSpeed *= e.def.hasteMul; }
    if (hasEnemyAbility(e.def, 'armorbreak') && !e.armorBroken && e.hp / e.maxHp <= e.def.breakAt) { e.armorBroken = true; e.defMul = e.def.breakMul; }
    if (hasEnemyAbility(e.def, 'invincible') && !e.wasInvincible && e.hp / e.maxHp <= e.def.invincibleAt) { e.wasInvincible = true; e.invincibleT = e.def.invincibleMs; }
    if (hasEnemyAbility(e.def, 'summon')) {
      e.summonT -= dt;
      if (e.summonT <= 0) { e.summonT = e.def.summonMs; for (let i = 0; i < e.def.summonCount; i++) spawnAt(e.def.summonId, e.pos); }
    }
    if (hasEnemyAbility(e.def, 'heal') && e.hp > 0 && e.hp < e.maxHp) {
      e.healT -= dt;
      if (e.healT <= 0) {
        e.healT += 1000;
        // Poison is the intended counter to regeneration: while poisoned, healing is
        // heavily suppressed instead of merely racing the poison DPS.
        const healRate = e.poison > 0 ? Math.min(0.012, (e.def.healRate || 0.04) * 0.18) : (e.def.healRate || 0.04);
        const heal = Math.max(1, Math.round(e.maxHp * healRate));
        e.hp = Math.min(e.maxHp, e.hp + heal);
        const p = battlePoint(e.pos);
        B.floats.push({ x: p.x, y: p.y, text: '+' + heal, life: 520, heal: true });
      }
    }
    if (e.stun <= 0) e.pos += (e.baseSpeed * (1 - e.slowAmt) * dt) / 1000;
    if (e.pos >= len) { e.reached = true; e.hp = 0; }
  }

  for (let i = B.enemies.length - 1; i >= 0; i--) {
    const e = B.enemies[i];
    if (e.hp > 0) continue;
    B.alive--;
    if (e.reached) {
      // Original rule: a single monster reaching the right edge fails the defence.
      sfx.leak();
      B.enemies.splice(i, 1);
      return finishQuest(false);
    }
    if (hasEnemyAbility(e.def, 'split') && !e.wasSplit) {
      for (let k = 0; k < e.def.splitCount; k++) spawnAt(e.def.splitInto, e.pos, true);
    }
    B.gold += Math.round(e.def.gold * (e.killCoin || 1));
    sfx.kill(); renderBattleBar();
    B.enemies.splice(i, 1);
  }
}

function spawnEnemy(id) { spawnAt(id, 0, false); }

function spawnAt(id, pos, isSplit) {
  const e = ENEMIES[id];
  discoverEnemy(id);
  const sc = 1 + B.quest.difficulty * 0.045;
  B.enemies.push({
    id, def: e, hp: Math.round(e.hp * sc), maxHp: Math.round(e.hp * sc),
    pos, speed: e.speed, baseSpeed: e.speed, stun: 0, slowT: 0, slowAmt: 0,
    debuffT: 0, debuffAmt: 0, poison: 0, poisonT: 0, lastKb: -9999, hasted: false,
    summonT: e.summonMs || 0, healT: 1000, wasSplit: !!isSplit, defMul: 1, armorBroken: false,
    invincibleT: 0, wasInvincible: false,
  });
  B.alive++;
}

function stepUnits(dt) {
  for (const u of B.units) {
    const stats = heroStats(u.hero);
    u.cool -= dt;
    u.attackT += dt;
    if (u.cool > 0) continue;
    const alive = B.enemies.filter(e => e.hp > 0);
    if (!alive.length) continue;
    // Defenders automatically focus the enemy closest to breaking through the right edge.
    // Normal attacks are SINGLE-TARGET; area effects belong to explicit 炸裂/爆風 systems,
    // which will be restored separately instead of making every attack an implicit AoE.
    const target = alive.reduce((a, b) => (b.pos > a.pos ? b : a));
    u.cool = stats.cd;
    fire(u, stats, target);
  }
}

function grantExp(hero, amount) {
  const res = addHeroExp(hero, amount);
  if (res.mastered) sfx.master(); else if (res.leveled) sfx.level();
}

function buffFor(u) {
  // The whole party stands together, so a support buff simply covers everyone - no range gate.
  let mul = 1;
  for (const o of B.units) {
    if (o === u) continue;
    const os = heroStats(o.hero);
    if (!os.buff) continue;
    mul += os.buff;
  }
  return mul;
}

// Normal attacks strike one target. This preserves the original game's reason for having
// separate effects such as 炸裂/爆風 instead of making every class an automatic full-screen AoE.
function fire(u, stats, target) {
  const now = performance.now();
  const base = stats.atk * buffFor(u);
  u.attackT = 0;

  // Default attack is one target. Permanent orb unlocks can deliberately add the original
  // 炸裂/爆風-style area behaviour.
  applyHit(u, stats, target, base, now);

  if (stats.area) {
    const others = B.enemies.filter(e => e.hp > 0 && e !== target);
    let extra = [];
    if (stats.area.type === 'burst') {
      extra = others
        .sort((a, b) => Math.abs(a.pos - target.pos) - Math.abs(b.pos - target.pos))
        .slice(0, stats.area.targets || 2);
    } else if (stats.area.type === 'all') {
      extra = others;
    }
    for (const e of extra) applyHit(u, stats, e, base * (stats.area.multiplier || 0.35), now, true);
  }

  const p = battlePoint(target.pos);
  B.shots.push({ x1: u.x, y1: u.y, x2: p.x, y2: p.y, life: 150, color: stats.color, area: stats.area && stats.area.type || null });
  sfx.hit();
}

// melee/scout read as a blade, everything else (magic/ranged/disrupt/support) as an elemental
// hit - two distinct visual languages so a lineup's mixed attacks stay readable at a glance.
function hitfxKind(line) {
  return (line === 'melee' || line === 'scout') ? 'slash' : 'magic';
}

function applyHit(u, stats, e, rawAtk, now, secondary = false) {
  if (e.invincibleT > 0) {
    const p = battlePoint(e.pos);
    B.hitfx.push({ x: p.x, y: p.y, life: 220, maxLife: 220, kind: 'magic', color: '#FFFFFF', seed: Math.random() });
    return;
  }
  const strong = stats.strong && stats.strong === e.def.kind;
  const orbVs = stats.bonusVs && stats.bonusVs[e.def.kind] || 0;
  const atk = rawAtk * (strong ? BAL.combat.strongMultiplier : 1) * (1 + orbVs);
  const def = e.def.def * e.defMul * (1 - (e.debuffAmt || 0));
  let dmg = Math.max(1, Math.floor(atk - def * (1 - stats.pierce)));

  // Original enemy traits restored as actual mechanics rather than flavour text.
  if (hasEnemyAbility(e.def, 'sturdy')) dmg = 1;
  if (hasEnemyAbility(e.def, 'barrier') && dmg <= (e.def.barrierCutoff || 12)) dmg = 0;

  const wasAlive = e.hp > 0;
  if (dmg > 0) damage(e, dmg);
  else {
    const p = battlePoint(e.pos);
    B.floats.push({ x: p.x, y: p.y, text: 'GUARD', life: 440, guard: true });
  }

  // 反動: every damaging hit pushes the enemy toward the village, so mindless rapid-fire can
  // be actively dangerous. This recreates the original counter-intuitive enemy property.
  if (dmg > 0 && hasEnemyAbility(e.def, 'recoil')) {
    e.pos = Math.min(B.map.path.length - 1, e.pos + (e.def.recoilStep || 0.18));
  }
  // "任務経験値" master bonus (ashigaru/nitomusha/kakurizato line) was never actually applied to
  // the kill-exp that job levels come from (see addHeroExp's comment: kills feed the same exp bar
  // as 修行) - wiring it here now instead of leaving it decorative on the job tree screen.
  if (wasAlive && e.hp <= 0) {
    e.killCoin = stats.coin;
    grantExp(u.hero, Math.round((e.def.boss ? 70 : 12) * (1 + supportTotal('questExp'))));
  }
  if (wasAlive) {
    const p = battlePoint(e.pos);
    B.hitfx.push({ x: p.x, y: p.y, life: 220, maxLife: 220, kind: hitfxKind(stats.line), color: stats.color, seed: Math.random() });
  }

  if (stats.stun) { const t = stats.stun * (1 - (e.def.res.stun || 0)); if (t > 0) e.stun = Math.max(e.stun, t); }
  if (stats.slow) { const a = stats.slow * (1 - (e.def.res.slow || 0)); if (a > 0) { e.slowAmt = Math.max(e.slowAmt, a); e.slowT = 1500; } }
  if (stats.debuff) { const a = stats.debuff * (1 - (e.def.res.debuff || 0)); if (a > 0) { e.debuffAmt = Math.max(e.debuffAmt, a); e.debuffT = 3000; } }
  if (stats.poison && !e.def.poisonImmune) {
    e.poison = Math.max(e.poison, stats.poison);
    if (hasEnemyAbility(e.def, 'poisonreact')) {
      const mul = e.def.poisonHasteMul || 1.12;
      const cap = e.def.poisonHasteCap || 2.3;
      e.baseSpeed = Math.min(e.def.speed * cap, e.baseSpeed * mul);
    }
  }
  if (stats.kb) {
    let amt = stats.kb * (1 - (e.def.res.kb || 0));
    if (now - e.lastKb < BAL.combat.knockbackDiminishMs) amt *= BAL.combat.knockbackDiminishFactor;
    e.lastKb = now;
    e.pos = Math.max(0, e.pos - amt);
  }
}

function damage(e, amount, isPoison) {
  e.hp -= amount;
  const p = battlePoint(e.pos);
  B.floats.push({ x: p.x, y: p.y, text: String(amount), life: 520, poison: !!isPoison });
}

function retireQuest() {
  if (!B.running || B.phase === 'done') return;
  finishQuest(false, true);
}

function finishQuest(won, retired = false) {
  B.phase = 'done'; B.running = false;
  let text, resultGold = 0, resultLegend = 0;
  if (won) {
    sfx.win();
    const goldGain = Math.round(B.quest.reward.gold * (1 + supportTotal('questGold')) * servantMul('goldMul'));
    const legendGain = Math.round((B.quest.reward.legendScore || 0) * (1 + supportTotal('legendGain')));
    save.gold += goldGain + B.gold;
    save.legendScore += legendGain;
    resultGold = goldGain + B.gold;
    resultLegend = legendGain;
    save.questCleared[B.quest.id] = true;
    persist();
    text = `獲得した銭: ${goldGain + B.gold}文 ・ 伝説度 +${legendGain}`;
    checkTitles();
  } else {
    sfx.lose();
    text = retired ? '任務を断念した。' : `第${B.waveIdx + 1}波で防衛線を突破された。`;
  }
  renderBattleResult(won, retired, resultGold, resultLegend);
}
