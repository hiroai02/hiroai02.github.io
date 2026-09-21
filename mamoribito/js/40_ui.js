// Screens: home, quests, party (evolve/weapon/orb), job tree, training, titles, battle panel.
let trainHeroIdx = 0;

function ensureHomePhoneLayout() {
  if (document.getElementById('home-phone-layout-v4')) return;
  const style = document.createElement('style');
  style.id = 'home-phone-layout-v4';
  style.textContent = `
    /* Phone-first home status proportions: preserve the original two-pair rhythm,
       but scale widths and type with the actual handset instead of fixed legacy pixels. */
    #v-home .home-status,
    #v-home .home-bonus {
      width: 100% !important;
      max-width: none !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
    #v-home .home-status {
      font-size: clamp(11px, 3.35vw, 13px) !important;
      line-height: 1.15 !important;
    }
    #v-home .home-status > div {
      min-height: clamp(26px, 7.6vw, 32px) !important;
      height: auto !important;
      grid-template-columns:
        clamp(54px, 18vw, 72px) minmax(0, 1fr)
        clamp(54px, 18vw, 72px) minmax(0, 1fr) !important;
    }
    #v-home .home-status > .wide {
      grid-template-columns: clamp(54px, 18vw, 72px) minmax(0, 1fr) !important;
    }
    #v-home .home-status span {
      padding: 0 clamp(5px, 1.8vw, 8px) !important;
      font-size: clamp(11px, 3.2vw, 13px) !important;
      line-height: 1.15 !important;
    }
    #v-home .home-status b {
      padding: 0 clamp(6px, 2vw, 9px) !important;
      font-size: clamp(11.5px, 3.45vw, 13.5px) !important;
      line-height: 1.15 !important;
    }
    #v-home .home-hero {
      min-height: clamp(150px, 45vw, 245px);
    }
    #v-home .home-hero-art {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    @media (max-width: 340px) {
      #v-home .home-status > div {
        grid-template-columns:
          52px minmax(0, 1fr)
          52px minmax(0, 1fr) !important;
      }
      #v-home .home-status > .wide {
        grid-template-columns: 52px minmax(0, 1fr) !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function renderHome() {
  ensureHomePhoneLayout();
  const hero = save.heroes[0];
  const j = JOBS[hero.job];

  // Phone-width My Page layout. Inline sizing prevents older packed CSS from shrinking the
  // status table back to the legacy ~190px width.
  const homeStatus = document.querySelector('#v-home .home-status');
  if (homeStatus) {
    homeStatus.style.setProperty('width', 'calc(100% - 16px)', 'important');
    homeStatus.style.setProperty('max-width', 'none', 'important');
    homeStatus.style.setProperty('margin', '0 8px', 'important');
  }
  const need = hero.lv < BAL.jobExp.maxLevel ? expNeeded(hero.job, hero.lv) : 0;
  const EN_LINE = { melee:'FENCER', ranged:'ARCHER', scout:'SCOUT', magic:'MAGE', disrupt:'HEXER', support:'SUPPORT' };

  document.getElementById('homeJobName').textContent = j.name;
  document.getElementById('homeJobSub').textContent = EN_LINE[j.line] || 'DEFENDER';
  const band = document.getElementById('homeClassBand');
  if (band) { const cls = j.tier <= 1 ? 'Basic Class' : j.tier === 2 ? 'High Class' : j.tier === 3 ? 'Master Class' : 'Legend Class'; band.textContent = '>> ' + cls + ' <<'; }
  document.getElementById('homeJobLv').textContent = `${hero.lv}/${BAL.jobExp.maxLevel}`;
  document.getElementById('homeGold').textContent = save.gold + 'z';
  document.getElementById('homeWeaponLv').textContent = hero.weaponLv + '/' + BAL.weapon.maxLevel;
  document.getElementById('homeOrb').textContent = hero.orb ? ORBS[hero.orb].name : 'なし';
  document.getElementById('homeLegend').textContent = save.legendScore;
  document.getElementById('homeExp').textContent = hero.lv >= BAL.jobExp.maxLevel ? 'MASTER' : `${hero.exp}（あと${Math.max(0, need - hero.exp)}）`;

  const art = document.getElementById('homeHeroArt');
  if (art) {
    const isStarter = typeof STARTER_JOB_IDS !== 'undefined' && STARTER_JOB_IDS.has(hero.job);
    const latestArt = !isStarter && window.REBUILD_HERO_ART && window.REBUILD_HERO_ART['hero_' + hero.job];
    const approvedPortrait = getHeroPortrait(hero.job);
    art.onerror = () => {
      art.onerror = null;
      art.src = getHeroPortrait(hero.job);
    };
    // Starter jobs are locked to starter-jobs-v4 via heroArtCache. Never point the
    // home screen back at an older embedded starter portrait.
    art.src = isStarter
      ? approvedPortrait
      : (latestArt || approvedPortrait);
  }

  const bonus = [];
  const labels = { questGold:'報酬金', trainExp:'修行EXP', questExp:'任務EXP', trainGreat:'大成功',
    weaponCost:'武器費', orbCost:'オーブ費', legendGain:'伝説度', trainSpeed:'修行札' };
  for (const key of Object.keys(labels)) {
    const v = supportTotal(key);
    if (v) bonus.push(`${labels[key]}${v > 0 ? '+' : ''}${Math.round(v * 100)}%`);
  }
  document.getElementById('homeBonus').textContent = `マスター ${save.mastered.length}職` + (bonus.length ? '　' + bonus.join('　') : '　守りを固め、任務へ向かえ。');
  refreshGuideArt();
}

function refreshGuideArt() {
  const q = document.getElementById('questGuideArt');
  if (q) {
    q.src = (typeof UI_NPC_ART !== 'undefined' && UI_NPC_ART.questGuide) || getHeroPortrait('kagura');
    q.onerror = () => { q.onerror = null; q.src = getHeroPortrait('kagura'); };
  }
  const shop = document.getElementById('shopGuideArt');
  if (shop) {
    shop.src = (typeof UI_NPC_ART !== 'undefined' && UI_NPC_ART.shopkeeper) || getHeroPortrait('samurai');
    shop.onerror = () => { shop.onerror = null; shop.src = getHeroPortrait('samurai'); };
  }
}

// --- quests ---
let questFilter = 1;
function questStar(difficulty) {
  if (difficulty <= 1) return 1;
  if (difficulty <= 3) return 2;
  if (difficulty <= 5) return 3;
  if (difficulty <= 7) return 4;
  return 5;
}

// DESIGN.md §7.1 lists 推奨戦力 (recommended power) as a per-quest field, but quests.json never
// carried one and the quest list never showed one - a player had only the ★difficulty stars to
// go on. Derived from difficulty rather than hand-authored per quest (matches the balance-QA
// methodology used to fix q03/q04/q09: recommended level/weaponLv scale with difficulty, capped
// at the game's actual maxes).
function recommendedPower(q) {
  return { lv: Math.min(BAL.jobExp.maxLevel, q.difficulty * 2), weaponLv: Math.min(BAL.weapon.maxLevel, q.difficulty) };
}

function renderQuests() {
  const list = document.getElementById('questList');
  list.innerHTML = '';
  const campaign = QUESTS.filter(q => !q.isExam);
  const exams = QUESTS.filter(q => q.isExam);

  function enemyList(q) {
    const counts = {};
    q.waves.forEach(w => w.spawns.forEach(sp => { counts[sp.enemy] = (counts[sp.enemy] || 0) + (sp.count || 1); }));
    return Object.keys(counts).map(id => {
      const e = ENEMIES[id];
      return `<div class="quest-enemy-row">
        <img src="${getEnemyIcon(id)}" alt="">
        <span>${e.name}</span><b>×${counts[id]}</b>
      </div>`;
    }).join('');
  }

  // The original game rewarded preparation before the automatic battle. Keep information here,
  // not behind battle-screen taps: a compact summary of enemy types/traits and useful counters.
  function questIntel(q) {
    const ids = [...new Set(q.waves.flatMap(w => w.spawns.map(sp => sp.enemy)))];
    const defs = ids.map(id => ENEMIES[id]);
    const traits = new Set();
    const counters = new Set();

    for (const e of defs) {
      if (e.kind === 'flyer') { traits.add('飛行'); counters.add('対飛行'); }
      if (e.kind === 'metal') { traits.add('メタル'); counters.add('対メタル'); counters.add('貫通'); }
      if (e.kind === 'yokai') { traits.add('魔物'); counters.add('対魔物'); }
      if ((e.def || 0) >= 6 || e.kind === 'guard') { traits.add('高防御'); counters.add('貫通'); }
      if ((e.speed || 0) >= 2.4) { traits.add('高速'); counters.add('鈍足/スタン'); }
      if (e.poisonImmune) traits.add('毒無効');
      if ((e.res && e.res.kb || 0) >= 0.7) traits.add('ノクバ耐性');
      if ((e.res && e.res.stun || 0) >= 0.7) traits.add('スタン耐性');
      const abilities = enemyAbilities(e);
      if (abilities.includes('summon')) { traits.add('召喚'); counters.add('高火力'); }
      if (abilities.includes('split')) { traits.add('分裂'); counters.add('手数'); }
      if (abilities.includes('haste')) { traits.add('加速'); counters.add('鈍足'); }
      if (abilities.includes('invincible')) traits.add('一時無敵');
      if (abilities.includes('barrier')) { traits.add('障壁'); counters.add('高火力'); }
      if (abilities.includes('heal')) { traits.add('回復'); counters.add('毒'); }
      if (abilities.includes('recoil')) { traits.add('反動'); counters.add('高威力/低手数'); }
      if (abilities.includes('poisonreact')) { traits.add('毒反応'); counters.add('毒を外す'); }
      if (abilities.includes('sturdy')) { traits.add('頑丈'); counters.add('攻撃速度'); }
    }
    if (!traits.size) traits.add('通常');
    if (!counters.size) counters.add('火力');
    return {
      traits: [...traits].slice(0, 6),
      counters: [...counters].slice(0, 5),
    };
  }

  // Two-column layout (enemies left, reward breakdown right) matches the reference 任務 screen's
  // per-quest entry: enemy icon+count list on the left, 職Exp/ゼニー/伝説度スコア on the right.
  function card(q, prevId) {
    const locked = prevId && !save.questCleared[prevId];
    const cleared = !!save.questCleared[q.id];
    const r = q.reward;
    const el = document.createElement('div');
    el.className = 'card' + (locked ? ' locked' : '');
    // DESIGN.md distinguishes 転職試験(tier-2 job-promotion tests) from 緊急任務(special-job
    // unlock quests dropping conditions no normal quest gives, id-prefixed eq_) - both used the
    // same generic "試験" tag before, blurring a real conceptual difference from the original.
    const examTag = q.isExam ? (q.id.startsWith('eq_') ? '<span class="tag warn">緊急任務</span>' : '<span class="tag">転職試験</span>') : '';
    const intel = questIntel(q);
    el.innerHTML = `<h3>${q.name} ${examTag}</h3>
      <div class="quest-main">
        <div class="enemies">${enemyList(q)}</div>
        <div class="rewards">
          <div class="${cleared ? 'defended' : 'uncleared'}">${cleared ? '♜完全防衛済' : '未防衛'}</div>
          <div><span class="qicon">†</span>職Exp: ${r.jobExp || 0}</div>
          <div class="zeni"><span class="qicon">銭</span>ゼニー: ${r.gold || 0}z</div>
          <div><span class="qicon">冠</span>伝説度: ${r.legendScore || 0}</div>
        </div>
      </div>
      <div class="quest-action">${locked ? '<span class="s">前の任務を完全防衛で解放</span>' : `<button class="btn link" data-qdetail="${q.id}">⇒ 任務を受ける</button>`}</div>`;
    return el;
  }

  // 試験(転職試験)と緊急任務は原作でも別概念(DESIGN.md §7.2/§12) - 同じ「試験」タブに
  // まとめていたのを分離し、緊急任務専用タブを新設(president: 原作に近づけて)
  const tabs = document.getElementById('questTabs');
  const diff = [[1, '★1'], [2, '★2'], [3, '★3'], [4, '★4'], [5, '★5'], ['exam', '試験']];
  tabs.innerHTML =
    '<div class="qdiff-row">' +
      diff.map(([id, label]) => `<button class="btn link${questFilter === id ? ' on' : ''}" data-qtab="${id}">${label}</button>`).join('<span class="qsep">/</span>') +
    '</div>' +
    '<div class="qspecial-row">[ <button class="btn link emergency' + (questFilter === 'eq' ? ' on' : '') + '" data-qtab="eq">緊急任務</button> ]</div>';

  if (questFilter === 'exam' || questFilter === 'eq') {
    const isEq = questFilter === 'eq';
    exams.filter(q => q.id.startsWith('eq_') === isEq).forEach(q => list.appendChild(card(q, null)));
  } else {
    const filtered = campaign.filter(q => questStar(q.difficulty) === questFilter);
    filtered.forEach(q => {
      const i = campaign.indexOf(q);
      list.appendChild(card(q, i === 0 ? null : campaign[i - 1].id));
    });
  }
}

let selectedQuestId = null;
let lastBattleResult = null;

function questEnemyCounts(q) {
  const counts = {};
  q.waves.forEach(w => w.spawns.forEach(sp => { counts[sp.enemy] = (counts[sp.enemy] || 0) + (sp.count || 1); }));
  return counts;
}

function questIntelSummary(q) {
  const ids = [...new Set(q.waves.flatMap(w => w.spawns.map(sp => sp.enemy)))];
  const traits = new Set(), counters = new Set();
  for (const id of ids) {
    const e = ENEMIES[id];
    if (e.kind === 'flyer') { traits.add('飛行'); counters.add('対飛行'); }
    if (e.kind === 'metal') { traits.add('メタル'); counters.add('対メタル'); counters.add('貫通'); }
    if (e.kind === 'yokai') { traits.add('魔物'); counters.add('対魔物'); }
    if ((e.def || 0) >= 6 || e.kind === 'guard') { traits.add('高防御'); counters.add('貫通'); }
    if ((e.speed || 0) >= 2.4) { traits.add('高速'); counters.add('鈍足/スタン'); }
    if (e.poisonImmune) traits.add('毒無効');
    if ((e.res && e.res.kb || 0) >= 0.7) traits.add('ノクバ耐性');
    if ((e.res && e.res.stun || 0) >= 0.7) traits.add('スタン耐性');
    const abilities = enemyAbilities(e);
    if (abilities.includes('summon')) { traits.add('召喚'); counters.add('高火力'); }
    if (abilities.includes('split')) { traits.add('分裂'); counters.add('手数'); }
    if (abilities.includes('haste')) { traits.add('加速'); counters.add('鈍足'); }
    if (abilities.includes('invincible')) traits.add('一時無敵');
    if (abilities.includes('barrier')) { traits.add('障壁'); counters.add('高火力'); }
    if (abilities.includes('heal')) { traits.add('回復'); counters.add('毒'); }
    if (abilities.includes('recoil')) { traits.add('反動'); counters.add('高威力/低手数'); }
    if (abilities.includes('poisonreact')) { traits.add('毒反応'); counters.add('毒を外す'); }
    if (abilities.includes('sturdy')) { traits.add('頑丈'); counters.add('攻撃速度'); }
  }
  if (!traits.size) traits.add('通常');
  if (!counters.size) counters.add('火力');
  return { traits:[...traits].slice(0,6), counters:[...counters].slice(0,5) };
}

function renderQuestDetail(id) {
  const q = QUESTS.find(x => x.id === id);
  if (!q) return route('v-quests');
  selectedQuestId = id;
  const title = document.getElementById('questDetailTitle');
  if (title) title.textContent = q.name;
  const counts = questEnemyCounts(q);
  const intel = questIntelSummary(q);
  const power = recommendedPower(q);
  const enemies = Object.keys(counts).map(eid => {
    const e = ENEMIES[eid];
    return `<div class="quest-detail-enemy"><img src="${getEnemyIcon(eid)}" alt=""><span><b>${e.name}</b><small>${e.kind === 'flyer' ? '飛行' : e.kind === 'metal' ? 'メタル' : e.kind === 'yokai' ? '魔物' : '通常'}</small></span><strong>×${counts[eid]}</strong></div>`;
  }).join('');
  document.getElementById('questDetailBody').innerHTML = `
    <div class="quest-detail-section"><div class="section-bar">出現モンスター</div><div class="quest-detail-enemies">${enemies}</div></div>
    <div class="quest-detail-section"><div class="section-bar">任務情報</div>
      <div class="quest-detail-line"><b>敵傾向</b><span>${intel.traits.join(' / ')}</span></div>
      <div class="quest-detail-line good"><b>有効</b><span>${intel.counters.join(' / ')}</span></div>
      <div class="quest-detail-line"><b>目安</b><span>職Lv ${power.lv} / 武器Lv ${power.weaponLv}</span></div>
    </div>
    <div class="quest-detail-section"><div class="section-bar">報酬</div>
      <div class="quest-detail-reward"><span>職Exp <b>${q.reward.jobExp || 0}</b></span><span>ゼニー <b>${q.reward.gold || 0}z</b></span><span>伝説度 <b>+${q.reward.legendScore || 0}</b></span></div>
    </div>`;
}

function renderBattleResult(won, retired, goldGain, legendGain) {
  lastBattleResult = { won, retired, questId: B.quest.id };
  document.getElementById('resultTitle').textContent = won ? (B.quest.isExam ? '試験合格!' : '完全防衛') : (retired ? 'リタイア' : '防衛失敗');
  document.getElementById('resultQuestName').textContent = B.quest.name;
  document.getElementById('resultMark').textContent = won ? '勝' : '敗';
  document.getElementById('resultText').textContent = won
    ? `ゼニー ${goldGain}z　伝説度 +${legendGain}`
    : retired ? '任務を断念した。' : `第${B.waveIdx + 1}波で防衛線を突破された。`;
  document.getElementById('resultActions').innerHTML = won
    ? '<button class="btn result-sub" data-result="list">任務一覧へ</button><button class="btn primary result-main" data-result="home">拠点へ</button>'
    : '<button class="btn result-sub" data-result="list">任務一覧へ</button><button class="btn primary result-main" data-result="retry">もう一度</button>';
  showView('v-result');
}

// --- party / equipment shop ---
let partyHeroIdx = 0;
let shopTab = 'weapon';

function renderParty() {
  const picker = document.getElementById('partyHeroPicker');
  picker.innerHTML = save.heroes.map((h, i) =>
    `<button class="party-slot slot-${i + 1}${i === partyHeroIdx ? ' on' : ''}" data-partyhero="${i}">
      <span>${i + 1}</span><b>${JOBS[h.job].name}</b>
    </button>`).join('');

  const hero = save.heroes[partyHeroIdx];
  const j = JOBS[hero.job];
  const stats = heroStats(hero);
  const list = document.getElementById('partyList');
  const wCost = weaponCost(hero.weaponLv);
  const wMax = hero.weaponLv >= BAL.weapon.maxLevel;
  const wTier = weaponTier(hero.weaponLv);

  const tabs = `<div class="shop-tabs">
    [ <button class="shop-tab${shopTab === 'weapon' ? ' on' : ''}" data-shoptab="weapon">武器</button> ]
    [ <button class="shop-tab${shopTab === 'orb' ? ' on' : ''}" data-shoptab="orb">オーブ</button> ]
  </div>`;

  const target = `<div class="shop-target">
    <span class="slot-badge" style="background:${SLOT_COLORS[partyHeroIdx]}">${partyHeroIdx + 1}</span>
    <b>${j.name}</b>
    <span>職Lv${hero.lv}</span>
    <span>攻撃${Math.round(stats.atk)}</span>
    <span>間隔${(stats.cd / 1000).toFixed(2)}秒</span>
  </div>`;

  if (shopTab === 'weapon') {
    list.innerHTML = tabs + target + `
      <div class="shop-section-title">一覧</div>
      <div class="shop-row weapon-row">
        <img class="weapon-thumb" src="${getWeaponIcon(j.line, hero.weaponLv)}" alt="">
        <span class="shop-row-main">
          <span class="shop-name">得物・${wTier.label}</span>
          <span class="shop-stat">攻撃力補正 +${Math.round(hero.weaponLv * BAL.weapon.atkPerLevel * 100)}%</span>
          <span class="shop-need">武器Lv ${hero.weaponLv}/${BAL.weapon.maxLevel}</span>
        </span>
        <button class="shop-buy" ${wMax || save.gold < wCost ? 'disabled' : ''} data-weapon="${partyHeroIdx}">
          ${wMax ? '最大' : `${wCost}z 強化`}
        </button>
      </div>`;
    return;
  }

  const orbRows = Object.keys(ORBS).map(oid => {
    const o = ORBS[oid];
    const cost = orbCost(oid);
    const equipped = hero.orb === oid;
    const owned = ownsOrb(oid);
    const reqOk = orbRequirementsMet(oid);
    const canAcquire = !owned && reqOk && save.gold >= cost;
    const canUse = owned || canAcquire || equipped;
    const reqText = orbRequirementText(oid);
    let status = '';
    if (equipped) status = '<span class="shop-state equipped">装備中</span>';
    else if (owned) status = '<span class="shop-state owned">所持済</span>';
    else if (reqOk) status = `<span class="shop-price">${cost}zで永久獲得</span>`;
    else status = '<span class="shop-state locked">未解放</span>';

    return `<button class="shop-row orb-item" ${canUse ? '' : 'disabled'} data-orb="${partyHeroIdx}:${oid}">
      <span class="orb-gem"></span>
      <span class="shop-row-main">
        <span class="shop-name">${o.name} ${status}</span>
        <span class="shop-stat">${o.desc}</span>
        ${!owned && !reqOk ? `<span class="shop-need">条件: ${reqText}</span>` : ''}
      </span>
    </button>`;
  }).join('');

  list.innerHTML = tabs + target + `
    <div class="shop-section-title">一覧</div>
    <div class="shop-orb-list">${orbRows}</div>`;
}

// --- job tree ---
// A branching tree diagram (icon + name per job, indented children linked by a connector line,
// the level/exam gate labelled at each fork) instead of a flat tier list - matching the
// reference's job-tree diagram structure (structure only; names/art are original). Pick a hero
// above the tree, then tap any job that hero can reach (tree progression OR a free re-pick among
// already-unlocked jobs) to transfer them there directly (president: 職業ツリーに職業のアイコン
// 入れて、そこから転職するようにして).
let treeHeroIdx = 0;
function renderTree() {
  const el = document.getElementById('treeList');
  const heroJobs = new Set(save.heroes.map(h => h.job));
  const hero = save.heroes[treeHeroIdx];
  const atCapstone = !!(JOBS[hero.job].titleReq || JOBS[hero.job].questReq);
  // unlockedJobs (free re-pick) mirrors the party screen's freeEvo: hybrid/special jobs
  // (masterReq) are never a free re-pick target for anyone, only reachable through the
  // properly-gated evolutionsFor/specialJobsAvailable lists above.
  const freeReachable = save.unlockedJobs.filter(id => !JOBS[id].masterReq);
  const reachable = new Set([...evolutionsFor(hero.job, hero.lv), ...(atCapstone ? [] : specialJobsAvailable()), ...freeReachable]);

  const picker = document.getElementById('treeHeroPicker');
  if (picker) {
    picker.innerHTML = save.heroes.map((h, i) =>
      `<button class="party-slot slot-${i + 1}${i === treeHeroIdx ? ' on' : ''}" data-treehero="${i}">
        <span>${i + 1}</span><b>${JOBS[h.job].name}</b>
      </button>`).join('');
  }

  function childrenOf(id) {
    return Object.keys(JOBS).filter(cid => JOBS[cid].from && JOBS[cid].from.includes(id));
  }
  // Colour alone (a background tint) turned out not to read clearly enough - president reported
  // the tree as hard to parse and a specific reachable job (剣豪) as un-tappable, when the real
  // issue was that a node's state wasn't obvious enough to know WHY tapping did nothing (the
  // node belonged to a different hero's lineage / that hero hadn't reached it yet). Every node
  // now carries an explicit text badge for its state, not just a colour, and locked nodes are
  // visibly dimmed so they read as "reference only" rather than "broken button".
  function nodeHtml(id) {
    const j = JOBS[id];
    const done = isMastered(id), active = heroJobs.has(id);
    const isCurrent = id === hero.job, isReachable = !isCurrent && reachable.has(id);
    const status = done ? '<span class="tag good">極</span>' : active ? '<span class="tag warn">就業中</span>' : '';
    const state = isCurrent ? '<span class="tag current">現在の職業</span>'
      : isReachable ? '<span class="tag go">タップで転職 &rarr;</span>'
      : '<span class="tag locked">未到達</span>';
    const cls = 'tree-node' + (isCurrent ? ' current' : isReachable ? ' reachable' : ' locked');
    const attr = isReachable ? `data-treejob="${id}"` : '';
    return `<div class="${cls}" ${attr}><img class="tree-icon" src="${getJobIcon(id)}" alt="">
      <span class="tree-name">${j.name}</span> ${status}${state}</div>`;
  }
  function branchHtml(id) {
    const kids = childrenOf(id);
    let html = nodeHtml(id);
    if (kids.length) {
      const lv = EVOLVE_LV[JOBS[kids[0]].tier] || 5;
      const examTxt = kids[0] && JOBS[kids[0]].examReq ? '・試験クエスト' : '';
      html += `<div class="tree-children"><div class="tree-gate">Lv${lv}${examTxt}で転職可</div>`;
      for (const kid of kids) html += branchHtml(kid);
      html += `</div>`;
    }
    return html;
  }

  const treesHtml = START_JOBS.map(r => `<div class="card tree-root">${branchHtml(r)}</div>`).join('');

  const hybrids = Object.keys(JOBS).filter(id => JOBS[id].masterReq);
  const hybridHtml = hybrids.map(id => {
    const j = JOBS[id];
    const reqNames = j.masterReq.map(r => JOBS[r].name).join('・');
    const cond = j.titleReq ? `称号必要` : j.questReq ? `専用クエスト必要` : '';
    const done = isMastered(id), active = heroJobs.has(id);
    const isCurrent = id === hero.job, isReachable = !isCurrent && reachable.has(id);
    const status = done ? '<span class="tag good">極</span>' : active ? '<span class="tag warn">就業中</span>' : '';
    const state = isCurrent ? '<span class="tag current">現在の職業</span>'
      : isReachable ? '<span class="tag go">タップで転職 &rarr;</span>'
      : '<span class="tag locked">未解放</span>';
    const cls = 'tree-node hybrid' + (isCurrent ? ' current' : isReachable ? ' reachable' : ' locked');
    const attr = isReachable ? `data-treejob="${id}"` : '';
    return `<div class="${cls}" ${attr}><img class="tree-icon" src="${getJobIcon(id)}" alt="">
      <span class="tree-name">${j.name}</span> ${status}${state}
      <div class="s">${reqNames}をすべてマスター${cond ? '・' + cond : ''}すると解放</div></div>`;
  }).join('');

  el.innerHTML = treesHtml + `<div class="card"><h3>複合職・特殊職</h3>${hybridHtml}</div>`;
  document.getElementById('treeSummary').innerHTML = `<b>マスター</b><span>${save.mastered.length} / ${Object.keys(JOBS).length} 職</span><small>#${treeHeroIdx + 1} ${JOBS[hero.job].name}を選択中　「転職可」をタップで転職</small>`;
}

// --- training ---
const TRAIN_KINDS = [
  { id: 'suburi', name: '素振り', line: 'melee' },
  { id: 'matoi', name: '的射', line: 'ranged' },
  { id: 'dokyo', name: '読経', line: 'magic' },
  { id: 'hono', name: '奉納', line: 'support' },
];

function regenTickets() {
  const now = Date.now();
  if (!save.lastTicketAt) { save.lastTicketAt = now; persist(); return; }
  // "修行札の回復速度" master bonus (hyofushi/hyosetsu line) used to be labelled gatherTime for
  // the rejected 採取 system and did nothing - remapped onto this real regen interval.
  const interval = BAL.training.ticketRegenMs / (1 + supportTotal('trainSpeed'));
  const gained = Math.floor((now - save.lastTicketAt) / interval);
  if (gained > 0) {
    save.trainTickets = Math.min(BAL.training.ticketMax, save.trainTickets + gained);
    save.lastTicketAt += Math.round(gained * interval);
    persist();
  }
}

function renderTraining() {
  regenTickets();
  document.getElementById('trainTickets').textContent = `${save.trainTickets} / ${BAL.training.ticketMax}`;

  const picker = document.getElementById('trainHeroPicker');
  picker.innerHTML = save.heroes.map((h, i) =>
    `<button class="party-slot slot-${i + 1}${i === trainHeroIdx ? ' on' : ''}" data-trainhero="${i}">
      <span>${i + 1}</span><b>${JOBS[h.job].name}</b>
    </button>`).join('');

  const hero = save.heroes[trainHeroIdx];
  const j = JOBS[hero.job];
  const need = expNeeded(hero.job, hero.lv);
  const bar = document.getElementById('trainBar');
  bar.innerHTML = `<b><span class="slot-badge" style="background:${SLOT_COLORS[trainHeroIdx]}">${trainHeroIdx + 1}</span>${j.name}</b>
    <span>職Lv ${hero.lv}/${BAL.jobExp.maxLevel}</span>
    <span>${hero.lv >= BAL.jobExp.maxLevel ? 'MASTER' : `職Exp ${hero.exp}/${need}`}</span>`;

  const el = document.getElementById('trainList');
  el.innerHTML = TRAIN_KINDS.map(k => {
    const fit = j.line === k.line;
    return `<div class="training-row">
      <span class="training-mark">${({suburi:'斬',matoi:'射',dokyo:'術',hono:'祈'})[k.id] || '修'}</span>
      <span class="training-main">
        <b>${k.name}${fit ? ' <em>適性</em>' : ''}</b>
        <small>${fit ? `${j.name}に適性あり（職Exp +30%）` : `${j.name}の職Expを得る（適性補正なし）`}</small>
      </span>
      <button class="btn link" data-train="${k.id}" ${save.trainTickets <= 0 ? 'disabled' : ''}>修行する</button>
    </div>`;
  }).join('');
}

function doTrain(kindId) {
  regenTickets();
  if (save.trainTickets <= 0) return;
  save.trainTickets--;
  save.trainCount++;
  if (!save.lastTicketAt) save.lastTicketAt = Date.now();

  const hero = save.heroes[trainHeroIdx];
  const kind = TRAIN_KINDS.find(k => k.id === kindId);
  const fit = JOBS[hero.job].line === kind.line;
  const t = BAL.training;
  const greatRate = t.greatRate + supportTotal('trainGreat');
  const r = Math.random();
  let mul = 1, label = '成功';
  if (r < t.critRate) { mul = t.critMultiplier; label = '会心'; }
  else if (r < t.critRate + greatRate) { mul = t.greatMultiplier; label = '大成功'; }

  let exp = t.baseExp * mul;
  if (fit) exp *= (1 + t.affinityBonus);
  exp *= (1 + supportTotal('trainExp'));
  exp = Math.round(exp);

  const res = addHeroExp(hero, exp);
  if (res.mastered) sfx.master(); else if (res.leveled) sfx.level(); else sfx.ui();
  checkTitles();
  renderTraining();

  let msg = `${label}! ${JOBS[hero.job].name}の経験値 +${exp}`;
  if (res.mastered) msg += ' ― マスター!';
  else if (res.leveled) msg += ` ― Lv${hero.lv}`;
  document.getElementById('trainMsg').textContent = msg;
}

// --- servants ---
function renderServant() {
  const list = document.getElementById('servantList');
  const count = document.getElementById('servantActiveCount');
  if (count) count.textContent = `${save.servants.active.length} / ${SERVANT_MAX_ACTIVE}`;
  list.innerHTML = '<div class="section-bar">一覧</div>' + Object.keys(SERVANTS).map(id => {
    const s = SERVANTS[id];
    const owned = save.servants.owned.includes(id);
    const active = save.servants.active.includes(id);
    const canBuy = !owned && save.gold >= s.cost;
    const canToggle = owned && (active || save.servants.active.length < SERVANT_MAX_ACTIVE);
    const actionBtn = owned
      ? `<button class="btn sm${active ? '' : ' primary'}" ${canToggle ? '' : 'disabled'} data-servant="${id}">${active ? '外す' : '同行させる'}</button>`
      : `<button class="btn sm primary" ${canBuy ? '' : 'disabled'} data-servant-buy="${id}">雇う</button>`;
    return `<div class="shop-item">
      <span class="ic lg" style="background:${s.color};border-radius:50%"></span>
      <span style="flex:1">
        <div class="name">${s.name}${active ? ' <span class="tag good">同行中</span>' : owned ? '' : ` <span class="cost">${s.cost}z</span>`}</div>
        <div class="stat">${s.desc}</div>
        <div class="row" style="margin-top:6px">${actionBtn}</div>
      </span>
    </div>`;
  }).join('');
}

// --- titles ---
const TITLES = [
  { id: 'satomori', name: '里の守り手', desc: '任務を3回クリア', test: () => Object.keys(save.questCleared).filter(id => !id.startsWith('exam_')).length >= 3 },
  { id: 'kensan', name: '研鑽者', desc: '修行を30回', test: () => save.trainCount >= 30 },
  { id: 'banshoku', name: '万職の徒', desc: '初級職4種をマスター', test: () => ['ashigaru', 'shashu', 'jumi', 'kagura'].every(isMastered) },
  { id: 'hyakki', name: '百鬼夜行を退けし者', desc: '難度7以上の任務をクリア', test: () => QUESTS.some(q => q.difficulty >= 7 && !q.isExam && save.questCleared[q.id]) },
  { id: 'densetsu', name: '伝説を継ぐ者', desc: '最難関の任務をクリア', test: () => QUESTS.some(q => q.difficulty >= 10 && !q.isExam && save.questCleared[q.id]) },
  { id: 'jushi', name: '百獣を制する者', desc: '狙撃手と狩人をマスター', test: () => ['sogeki', 'karyudo'].every(isMastered) },
  { id: 'onmyou', name: '陰陽の頭領', desc: '火術師と氷術師をマスター', test: () => ['fufushi', 'hyofushi'].every(isMastered) },
];
function checkTitles() {
  let gained = null;
  for (const t of TITLES) if (!save.titles.includes(t.id) && t.test()) { save.titles.push(t.id); gained = t; }
  if (gained) { persist(); sfx.master(); }
  return gained;
}
function renderTitles() {
  const el = document.getElementById('titleList');
  const count = document.getElementById('titleCount');
  if (count) count.textContent = `${save.titles.length} / ${TITLES.length}`;
  el.innerHTML = '<div class="section-bar">称号一覧</div>' + TITLES.map(t => {
    const has = save.titles.includes(t.id);
    return `<div class="record-row${has ? ' earned' : ' locked'}">
      <span class="record-mark">${has ? '称' : '？'}</span>
      <span class="record-main"><b>${t.name}</b><small>${t.desc}</small></span>
      <span class="record-state">${has ? '獲得' : '未獲得'}</span>
    </div>`;
  }).join('');
}

// --- gallery (モンスター・職業図鑑) ---
const ENEMY_KIND_LABEL = { normal: '通常', fast: '高速', tanky: '高HP', metal: '金属', flyer: '飛行', yokai: '魔物', guard: '防御型' };
let codexTab = 'enemy';

function renderCodex() {
  const tabs = document.getElementById('codexTabs');
  const enemyFound = save.enemySeen.length;
  const jobFound = save.unlockedJobs.length;
  tabs.innerHTML = [
    ['enemy', `モンスター図鑑 ${enemyFound}/${Object.keys(ENEMIES).length}`],
    ['job', `職業図鑑 ${jobFound}/${Object.keys(JOBS).length}`]
  ].map(([id, label]) =>
    `<button class="btn link${codexTab === id ? ' on' : ''}" data-codextab="${id}">${label}</button>`).join('');

  const list = document.getElementById('codexList');

  if (codexTab === 'enemy') {
    const abilityNames = {
      split: '撃破時に分裂', summon: '雑魚を召喚', haste: 'HP減少で加速',
      armorbreak: 'HP減少で防御低下', invincible: 'HP減少で一時無敵',
      barrier: '一定以下のダメージを無効化', heal: '時間経過で回復（毒で抑制）',
      recoil: '攻撃を受けるたび前進', poisonreact: '毒を受けるたび加速',
      sturdy: 'どんな攻撃も1ダメージ'
    };

    list.innerHTML = '<div class="section-bar">モンスター一覧</div>' + Object.keys(ENEMIES).map(id => {
      const e = ENEMIES[id];
      const seen = save.enemySeen.includes(id);
      if (!seen) {
        return `<div class="shop-item gallery-unknown">
          <span class="ic lg gallery-silhouette">？</span>
          <span>
            <div class="name">？？？</div>
            <div class="stat">まだ出会っていないモンスター</div>
          </span>
        </div>`;
      }

      const resTags = Object.entries(e.res || {}).filter(([, v]) => v >= 0.5).map(([k]) =>
        `<span class="tag">${{ kb: 'ノックバック耐性', stun: 'スタン耐性', debuff: '弱体耐性', slow: '鈍足耐性' }[k]}</span>`).join('');
      const abilities = enemyAbilities(e);
      const abilityNote = abilities.length
        ? `<div class="s">特殊: ${abilities.map(a => abilityNames[a] || a).join(' / ')}</div>`
        : '';

      return `<div class="shop-item">
        <img class="ic lg" src="${getEnemyIcon(id)}" alt="">
        <span>
          <div class="name">${e.name} ${e.boss ? '<span class="tag warn">ボス</span>' : ''}<span class="tag">${ENEMY_KIND_LABEL[e.kind] || e.kind}</span></div>
          <div class="stat">HP${e.hp} / 速度${e.speed} / 防御${e.def}</div>
          ${resTags ? `<div class="s">${resTags}</div>` : ''}
          ${abilityNote}
        </span>
      </div>`;
    }).join('');
    return;
  }

  list.innerHTML = '<div class="section-bar">職業一覧</div>' + Object.keys(JOBS).map(id => {
    const j = JOBS[id];
    const seen = save.unlockedJobs.includes(id);
    const done = isMastered(id);

    if (!seen) {
      return `<div class="shop-item gallery-unknown">
        <span class="ic lg gallery-silhouette">？</span>
        <span>
          <div class="name">？？？</div>
          <div class="stat">まだ習得していない職業</div>
        </span>
      </div>`;
    }

    return `<div class="shop-item">
      <img class="ic lg" src="${getJobIcon(id)}" alt="">
      <span>
        <div class="name">${j.name} <span class="cost">Tier${j.tier}</span> ${done ? '<span class="tag good">極</span>' : '<span class="tag">習得済</span>'}</div>
        <div class="stat">${j.desc}</div>
        <div class="s">マスター効果: ${j.master.label}</div>
      </span>
    </div>`;
  }).join('');
}

// --- battle UI ---
// Original-style battle screen: the top area is the four defender names/slot colors.
// Battle itself is automatic. Only speed change and retire are interactive.
function renderBattleBar() {
  const roster = document.getElementById('battleRoster');
  if (roster) {
    const order = [0, 2, 1, 3]; // reference layout: top row #1/#3, bottom row #2/#4
    roster.innerHTML = order.map(i => {
      const u = B.units[i], j = JOBS[u.hero.job];
      return `<div class="battle-member slot-${i + 1}"><span class="battle-num">${i + 1}</span><b>${j.name}</b></div>`;
    }).join('');
  }
  const speed = document.getElementById('speedBtn');
  if (speed) speed.textContent = `×${B.speed}`;
}
