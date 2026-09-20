// Wiring and entry point.
function bind() {
  document.body.addEventListener('click', e => {
    const treeJob = e.target.closest('[data-treejob]');
    if (treeJob) {
      sfx.unlock();
      if (evolveHero(save.heroes[treeHeroIdx], treeJob.dataset.treejob)) { sfx.master(); renderTree(); renderHome(); }
      return;
    }
    const b = e.target.closest('button');
    if (!b) return;
    sfx.unlock();

    if (b.dataset.go) {
      sfx.ui(); route(b.dataset.go);
      // President: データのセーブがなってない、理想は画面移動・戻るボタン押した時に保存.
      // Only the "戻る" arrows use data-go="v-home" (forward nav from the home menu uses other
      // targets), and v-home is also the page's own default view on load, so the publish-forced
      // reload lands on the exact same screen the player just asked for - no visible flash to a
      // different view, unlike the old "publish on every v-home visit" bug this once was.
      if (b.dataset.go === 'v-home') flushNow();
      return;
    }
    if (b.dataset.qdetail) { sfx.ui(); renderQuestDetail(b.dataset.qdetail); showView('v-quest-detail'); return; }
    if (b.id === 'questStartBtn') { if (selectedQuestId) { sfx.ui(); startQuest(selectedQuestId); } return; }
    if (b.dataset.result) {
      const act = b.dataset.result;
      if (act === 'retry' && lastBattleResult) { sfx.ui(); startQuest(lastBattleResult.questId); return; }
      if (act === 'home') { sfx.ui(); route('v-home'); return; }
      if (act === 'list') { sfx.ui(); route('v-quests'); return; }
    }
    if (b.dataset.qtab) {
      questFilter = ['all', 'exam', 'eq'].includes(b.dataset.qtab) ? b.dataset.qtab : +b.dataset.qtab;
      sfx.ui(); renderQuests();
      return;
    }

    if (b.dataset.partyhero) {
      partyHeroIdx = +b.dataset.partyhero;
      sfx.ui();
      renderParty();
      return;
    }
    if (b.dataset.shoptab) {
      shopTab = b.dataset.shoptab;
      sfx.ui();
      renderParty();
      return;
    }

    if (b.dataset.evolve) {
      const [idx, jobId] = b.dataset.evolve.split(':');
      if (evolveHero(save.heroes[+idx], jobId)) { sfx.master(); renderParty(); renderHome(); }
      return;
    }
    if (b.dataset.weapon) {
      const hero = save.heroes[+b.dataset.weapon];
      if (upgradeWeapon(hero)) { sfx.buy(); renderParty(); renderHome(); }
      return;
    }
    if (b.dataset.orb) {
      const [idx, orbId] = b.dataset.orb.split(':');
      const hero = save.heroes[+idx];
      const toggled = hero.orb === orbId ? null : orbId;
      if (equipOrb(hero, toggled)) { sfx.buy(); renderParty(); renderHome(); }
      return;
    }
    if (b.dataset.servantBuy) { if (buyServant(b.dataset.servantBuy)) { sfx.buy(); renderServant(); renderHome(); } return; }
    if (b.dataset.servant) { if (toggleServant(b.dataset.servant)) { sfx.ui(); renderServant(); } return; }
    if (b.dataset.trainhero) { trainHeroIdx = +b.dataset.trainhero; sfx.ui(); renderTraining(); return; }
    if (b.dataset.treehero) { treeHeroIdx = +b.dataset.treehero; sfx.ui(); renderTree(); return; }
    if (b.dataset.codextab) { codexTab = b.dataset.codextab; sfx.ui(); renderCodex(); return; }
    if (b.dataset.train) { doTrain(b.dataset.train); return; }

    if (b.id === 'speedBtn') {
      B.speed = B.speed === 1 ? 2 : B.speed === 2 ? 3 : 1;
      b.textContent = `×${B.speed}`;
      b.classList.toggle('on', B.speed !== 1);
      return;
    }
    if (b.id === 'quitBtn') { sfx.ui(); retireQuest(); return; }
    if (b.id === 'muteBtn' || b.id === 'settingsMuteBtn') {
      save.muted = !save.muted; persist();
      const homeMute = document.getElementById('muteBtn');
      const settingsMute = document.getElementById('settingsMuteBtn');
      if (homeMute) homeMute.textContent = save.muted ? '音 OFF' : '音 ON';
      if (settingsMute) settingsMute.textContent = save.muted ? '音 OFF' : '音 ON';
      if (!save.muted) { sfx.unlock(); sfx.ui(); }
      return;
    }
    if (b.id === 'resetBtn') {
      overlay('データを消す', 'すべての進行を初期化します。', [
        { label: 'やめる' },
        { label: '消す', primary: true, act: () => { resetSave(); route('v-home'); } },
      ]);
      return;
    }
  });

  window.addEventListener('resize', () => {
    if (document.getElementById('v-battle').classList.contains('active')) fitBoard();
  });
}

function route(id) {
  showView(id);
  // Navigation only ever persists (see persist()'s comment) - it never forces the
  // publish/reload itself, so moving between screens never visibly kicks the player back to
  // home mid-action.
  if (id === 'v-home') renderHome();
  if (id === 'v-quests') renderQuests();
  if (id === 'v-quest-detail' && selectedQuestId) renderQuestDetail(selectedQuestId);
  if (id === 'v-party') renderParty();
  if (id === 'v-tree') renderTree();
  if (id === 'v-train') renderTraining();
  if (id === 'v-titles') renderTitles();
  if (id === 'v-codex') renderCodex();
  if (id === 'v-servant') renderServant();
  if (id === 'v-settings') {
    const sb = document.getElementById('settingsMuteBtn');
    if (sb) sb.textContent = save.muted ? '音 OFF' : '音 ON';
  }
}

// The only moments that force an immediate publish: the tab going hidden or unloading. Both are
// invisible to the player (they're not looking at the screen when the reload happens), unlike
// forcing it on every route('v-home') navigation.
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushNow(); });
window.addEventListener('pagehide', () => flushNow());

(function init() {
  bind();
  document.getElementById('muteBtn').textContent = save.muted ? '音 OFF' : '音 ON';
  route('v-home');
})();
