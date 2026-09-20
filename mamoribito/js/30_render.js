// Battle rendering. Units draw from AI-generated original chibi art when available (see
// loadHeroArt below), falling back to hand-drawn Canvas primitives for every job that doesn't
// have a piece yet. Everything else (enemies, terrain, effects) stays purely geometric.
//
// Rebuild V2 character direction: the body is visually transparent/absent. Hat/helmet, clothes,
// gloves, boots and weapon may float with small gaps between them. No visible human face or skin.
// The readable class silhouette comes from oversized equipment and props, matching the original
// series' defining "まもりびと" visual grammar while using newly generated designs.

// Hero art pipeline: window.HERO_ART contains legacy build assets while
// window.REBUILD_HERO_ART contains validated Rebuild V2 overrides. The latter wins per key.
// Legacy JPEGs and current Rebuild V2 WebP may carry flat/checkerboard backgrounds; future
// cutouts may already have alpha. extractSubject() handles both paths and caches battle + UI art.
// Every character faces the same way (left) for a consistent battle-line look. Most generated
// art already comes out facing left; jobs whose source image faces right are listed here and
// get mirrored once at load time (president: キャラは全員左向きに統一).
const HERO_ART_FLIP = new Set(['yuusha', 'ningyoushi', 'dokuyashi']);

// Small per-job icon for non-battle UI (job tree, etc.): the real portrait's face region when
// one exists, otherwise a mini procedural helmet (drawHeadgear) in the job's own colour - every
// job gets a distinct icon even the ones without generated art yet. Only the real-art case is
// cached permanently - art loads asynchronously (see loadHeroArt below), so a job icon rendered
// before its portrait finishes loading must NOT be stuck on the procedural fallback forever.
const jobIconCache = {};
const heroPortraitCache = {};

function getHeroPortrait(jobId) {
  const art = heroArtCache[jobId];
  if (!art) return getJobIcon(jobId);
  if (heroPortraitCache[jobId]) return heroPortraitCache[jobId];
  const c = document.createElement('canvas');
  const h = 360, w = 280;
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const scale = Math.min(w / art.bw, h / art.bh);
  const dw = art.bw * scale, dh = art.bh * scale;
  ctx.drawImage(art.canvas, art.bx, art.by, art.bw, art.bh, (w - dw) / 2, h - dh, dw, dh);
  const url = c.toDataURL();
  heroPortraitCache[jobId] = url;
  return url;
}
function getJobIcon(jobId) {
  const size = 56;
  const art = heroArtCache[jobId];
  if (art) {
    if (jobIconCache[jobId]) return jobIconCache[jobId];
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const side = Math.min(art.bw, art.bh);
    const sx = art.bx + (art.bw - side) / 2, sy = art.by;
    ctx.drawImage(art.canvas, sx, sy, side, Math.min(side, art.bh - (sy - art.by)), 0, 0, size, size);
    const url = c.toDataURL();
    jobIconCache[jobId] = url;
    return url;
  }
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const j = JOBS[jobId];
  drawHeadgear(ctx, size / 2, size / 2 + 2, size * 0.36, j, j.color, darken(j.color, 40), '#1B1610', size * 0.05);
  return c.toDataURL();
}

// Small weapon-tier icon for the party screen (president: 武器見た目追加できるなら). The weapon
// itself has no generated art (it's just a numeric weaponLv stat purchased with gold), so this
// draws a simple procedural silhouette shaped by the job's attack line (sword/bow/dagger/staff/
// fan/ofuda) and coloured by a tier derived deterministically from weaponLv. This is NOT the
// rejected random-quality/refine system (see RESEARCH.md's 採用しない list) - the tier is a
// straight function of the gold-purchased weaponLv, never randomised.
const WEAPON_TIERS = [
  { max: 3, color: '#9C6B3E', glow: null, label: '並' },     // 初期: wood/bronze
  { max: 6, color: '#B8BEC8', glow: null, label: '上質' },   // 中級: iron/silver
  { max: 9, color: '#E0B23F', glow: null, label: '優良' },   // 上級: gold
  { max: 10, color: '#FFE8A0', glow: '#FFF6D8', label: '伝説' }, // 極: radiant white-gold
];
function weaponTier(weaponLv) {
  return WEAPON_TIERS.find(t => weaponLv <= t.max) || WEAPON_TIERS[WEAPON_TIERS.length - 1];
}
const weaponIconCache = {};
function drawWeaponShape(ctx, cx, cy, size, line, color, outline) {
  ctx.strokeStyle = outline; ctx.lineWidth = Math.max(1, size * 0.09); ctx.fillStyle = color;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (line === 'melee') { // sword: blade + crossguard + hilt
    ctx.beginPath(); ctx.moveTo(cx, cy - size * 0.42); ctx.lineTo(cx + size * 0.1, cy + size * 0.08);
    ctx.lineTo(cx - size * 0.1, cy + size * 0.08); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - size * 0.22, cy + size * 0.1); ctx.lineTo(cx + size * 0.22, cy + size * 0.1);
    ctx.stroke();
    ctx.strokeStyle = darken(color, 25); ctx.beginPath(); ctx.moveTo(cx, cy + size * 0.1); ctx.lineTo(cx, cy + size * 0.4); ctx.stroke();
  } else if (line === 'ranged') { // bow: curved arc + string
    ctx.beginPath(); ctx.arc(cx - size * 0.05, cy, size * 0.4, -Math.PI * 0.38, Math.PI * 0.38); ctx.stroke();
    ctx.strokeStyle = darken(color, 15); ctx.beginPath();
    ctx.moveTo(cx + size * 0.28, cy - size * 0.34); ctx.lineTo(cx + size * 0.28, cy + size * 0.34); ctx.stroke();
  } else if (line === 'scout') { // kunai/dagger
    ctx.beginPath(); ctx.moveTo(cx, cy - size * 0.4); ctx.lineTo(cx + size * 0.13, cy + size * 0.05);
    ctx.lineTo(cx, cy + size * 0.18); ctx.lineTo(cx - size * 0.13, cy + size * 0.05); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + size * 0.18); ctx.lineTo(cx, cy + size * 0.38); ctx.stroke();
  } else if (line === 'magic') { // staff: rod + orb
    ctx.beginPath(); ctx.moveTo(cx, cy - size * 0.22); ctx.lineTo(cx, cy + size * 0.42); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy - size * 0.32, size * 0.16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (line === 'support') { // folding fan
    ctx.beginPath(); ctx.moveTo(cx, cy + size * 0.3);
    ctx.arc(cx, cy + size * 0.3, size * 0.42, -Math.PI * 0.82, -Math.PI * 0.18); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = darken(color, 20); ctx.lineWidth = Math.max(1, size * 0.04);
    for (const a of [-0.72, -0.5, -0.28]) { ctx.beginPath(); ctx.moveTo(cx, cy + size * 0.3);
      ctx.lineTo(cx + Math.cos(a * Math.PI) * size * 0.4, cy + size * 0.3 + Math.sin(a * Math.PI) * size * 0.4); ctx.stroke(); }
  } else { // disrupt: ofuda talisman
    ctx.beginPath(); ctx.rect(cx - size * 0.16, cy - size * 0.36, size * 0.32, size * 0.6); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = darken(color, 30); ctx.lineWidth = Math.max(1, size * 0.05);
    ctx.beginPath(); ctx.moveTo(cx - size * 0.08, cy - size * 0.2); ctx.lineTo(cx + size * 0.08, cy + size * 0.1); ctx.stroke();
  }
}
function getWeaponIcon(line, weaponLv) {
  const tier = weaponTier(weaponLv);
  const key = line + '_' + tier.max;
  if (weaponIconCache[key]) return weaponIconCache[key];
  const size = 32;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  if (tier.glow) {
    ctx.save(); ctx.shadowColor = tier.glow; ctx.shadowBlur = size * 0.22;
    drawWeaponShape(ctx, size / 2, size / 2, size * 0.82, line, tier.color, '#1B1610');
    ctx.restore();
  }
  drawWeaponShape(ctx, size / 2, size / 2, size * 0.82, line, tier.color, '#1B1610');
  const url = c.toDataURL();
  weaponIconCache[key] = url;
  return url;
}

const heroArtCache = {};
function loadHeroArt() {
  // Existing build assets stay available as fallbacks until Rebuild V2 passes runtime QA.
  // Newly rebuilt portraits override only the matching keys, so validation is reversible.
  const art = Object.assign({}, window.HERO_ART || {}, window.REBUILD_HERO_ART || {});
  for (const key of Object.keys(art)) {
    if (!key.startsWith('hero_')) continue;
    const jobId = key.slice(5);
    const img = new Image();
    // Hosted build loads legacy art from raw.githubusercontent.com. Anonymous CORS keeps
    // extractSubject()/toDataURL canvas operations readable instead of tainting the canvas.
    const remoteArt = /^https?:\/\//.test(art[key]);
    if (remoteArt) img.crossOrigin = 'anonymous';
    img.onload = () => {
      // The hosted site may load legacy JPEGs cross-origin. Drawing those into a canvas and
      // reading pixels/toDataURL is browser-sensitive and caused visible corrupt fragments on
      // iPhone. Keep remote legacy art as a plain-image fallback; validated embedded rebuild
      // art still uses the transparent extraction pipeline.
      if (remoteArt) return;
      heroArtCache[jobId] = extractSubject(img, HERO_ART_FLIP.has(jobId));
      delete jobIconCache[jobId];
      delete heroPortraitCache[jobId];
      if (typeof renderHome === 'function' && document.getElementById('v-home')?.classList.contains('active')) renderHome();
      if (typeof refreshGuideArt === 'function') refreshGuideArt();
    };
    img.src = art[key];
  }
}

// Enemies share the same build.ps1 asset pipeline as heroes (any src/assets/<key>.jpg becomes
// window.HERO_ART[key]) - files named enemy_<id>.jpg just use the "enemy_" prefix instead, so no
// build-script changes were needed to add real enemy art on top of the existing hero art.
// Every enemy faces the same way (right) for a consistent battle-line look, mirroring the
// heroes-face-left rule above (president: 敵は右向き固定ね, confirmed again after the size
// bump made the remaining left-leaning ones obvious: 敵右向き). Most generated enemy art
// already comes out facing right or is direction-neutral; the ones whose source image leads
// with a weapon/paw/hand to the left (even if the pose reads as "mostly frontal" at a glance)
// are listed here and get mirrored once at load time.
const ENEMY_ART_FLIP = new Set(['kogami', 'hayaitachi', 'kanenezumi', 'bakeneko', 'ooari', 'yamabiko', 'boss_oomukade']);
const enemyArtCache = {};
function loadEnemyArt() {
  const art = window.HERO_ART || {};
  for (const key of Object.keys(art)) {
    if (!key.startsWith('enemy_')) continue;
    const enemyId = key.slice(6);
    const img = new Image();
    const remoteArt = /^https?:\/\//.test(art[key]);
    if (remoteArt) img.crossOrigin = 'anonymous';
    img.onload = () => { if (!remoteArt) enemyArtCache[enemyId] = extractSubject(img, ENEMY_ART_FLIP.has(enemyId)); };
    img.src = art[key];
  }
}

// Flood-fills the background out from the image's border inward, rather than a flat colour
// threshold, so it correctly clears a checkerboard (two alternating flat colours) without
// eating into genuinely grey/white parts of the character (like a silver sword blade) - those
// are enclosed by the character's own dark outline, which the fill can't cross.
function extractSubject(img, flip) {
  const c = document.createElement('canvas');
  const w = img.naturalWidth, h = img.naturalHeight;
  c.width = w; c.height = h;
  const cctx = c.getContext('2d');
  if (flip) { cctx.translate(w, 0); cctx.scale(-1, 1); }
  cctx.drawImage(img, 0, 0);
  cctx.setTransform(1, 0, 0, 1, 0, 0);
  const frame = cctx.getImageData(0, 0, w, h);
  const d = frame.data;

  // If an asset already has meaningful alpha, preserve its antialiased edge and only calculate
  // visible bounds. Opaque JPEG/WebP assets (including checkerboard-backed Rebuild art) continue
  // through the border flood-fill path below.
  let transparentCount = 0;
  for (let p = 0; p < w * h; p++) if (d[p * 4 + 3] < 16) transparentCount++;
  if (transparentCount > w * h * 0.01) {
    let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let p = 0; p < w * h; p++) {
      if (d[p * 4 + 3] < 8) continue;
      const px = p % w, py = (p / w) | 0;
      if (px < minX) minX = px; if (px > maxX) maxX = px;
      if (py < minY) minY = py; if (py > maxY) maxY = py;
    }
    if (maxX < minX) return { canvas: c, bx: 0, by: 0, bw: w, bh: h };
    return { canvas: c, bx: minX, by: minY, bw: maxX - minX + 1, bh: maxY - minY + 1 };
  }

  const close = (i, j) => Math.abs(d[i] - d[j]) + Math.abs(d[i + 1] - d[j + 1]) + Math.abs(d[i + 2] - d[j + 2]) < 26;
  const visited = new Uint8Array(w * h);
  // BFS queue of pixel indices, seeded with the whole border
  const bfs = [];
  for (let x = 0; x < w; x++) { bfs.push(x); bfs.push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { bfs.push(y * w); bfs.push(y * w + w - 1); }
  for (const p of bfs) visited[p] = 1;
  const removed = new Uint8Array(w * h);
  let head = 0;
  while (head < bfs.length) {
    const p = bfs[head++];
    const i = p * 4;
    removed[p] = 1;
    const px = p % w, py = (p / w) | 0;
    const neighbours = [];
    if (px > 0) neighbours.push(p - 1);
    if (px < w - 1) neighbours.push(p + 1);
    if (py > 0) neighbours.push(p - w);
    if (py < h - 1) neighbours.push(p + w);
    for (const n of neighbours) {
      if (visited[n]) continue;
      const j = n * 4;
      if (close(i, j)) { visited[n] = 1; bfs.push(n); }
    }
  }
  for (let p = 0; p < w * h; p++) {
    if (!removed[p]) continue;
    d[p * 4 + 3] = 0;
  }
  // soften the cut edge: any surviving pixel touching a removed one fades a little, so the
  // silhouette doesn't end in a hard aliased ring
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let p = 0; p < w * h; p++) {
    if (removed[p]) continue;
    const px = p % w, py = (p / w) | 0;
    let edge = false;
    if (px > 0 && removed[p - 1]) edge = true;
    else if (px < w - 1 && removed[p + 1]) edge = true;
    else if (py > 0 && removed[p - w]) edge = true;
    else if (py < h - 1 && removed[p + w]) edge = true;
    if (edge) d[p * 4 + 3] = Math.round(d[p * 4 + 3] * 0.7);
    // the actual character's bounding box, ignoring the alpha=0 padding around it - source
    // images vary in how tightly they crop the character, so drawChibi scales THIS box to a
    // consistent size instead of the whole (differently-padded) canvas (president:
    // キャラクターデザインのサイズ一緒にして).
    if (px < minX) minX = px; if (px > maxX) maxX = px;
    if (py < minY) minY = py; if (py > maxY) maxY = py;
  }
  cctx.putImageData(frame, 0, 0);
  if (maxX < minX) { minX = 0; minY = 0; maxX = w - 1; maxY = h - 1; } // fully-removed edge case
  return { canvas: c, bx: minX, by: minY, bw: maxX - minX + 1, bh: maxY - minY + 1 };
}
loadHeroArt();
loadEnemyArt();

function darken(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - amt), g = Math.max(0, ((n >> 8) & 0xFF) - amt), b = Math.max(0, (n & 0xFF) - amt);
  return `rgb(${r},${g},${b})`;
}
function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt), g = Math.min(255, ((n >> 8) & 0xFF) + amt), b = Math.min(255, (n & 0xFF) + amt);
  return `rgb(${r},${g},${b})`;
}

// Brief decaying side-to-side jolt right as a unit fires - reads as a swing/cast recoil without
// needing a whole animation rig. Only the character body/art shifts (see dcx below); the slot
// badge and cooldown bar stay put under the unit's true anchor.
const ATK_ANIM_MS = 200;
function drawChibi(ctx, cx, cy, size, u, j, stats, slotIdx) {
  const outline = '#1B1610';
  const lw = Math.max(1, size * 0.05);
  const bodyC = j.color, shadeC = darken(j.color, 40), capeC = darken(j.color, 15);

  let dcx = cx;
  if (u.attackT < ATK_ANIM_MS) {
    const p = 1 - u.attackT / ATK_ANIM_MS;
    dcx += Math.sin((u.attackT / ATK_ANIM_MS) * Math.PI * 3) * size * 0.05 * p;
  }

  ctx.save();
  ctx.translate(dcx - cx, 0);

  // Battle reliability first: some early generated masters contain checker/noise pixels that
  // become very visible after background extraction on iPhone. Keep those masters for UI QA,
  // but use the deterministic clean floating-equipment renderer in battle until each replacement
  // master has passed alpha-edge validation.
  const art = null;
  if (art) {
    // AI-generated original chibi art (see loadHeroArt) - already includes its own ground
    // shadow, so no procedural shadow/boots/cape/prop/body underneath it. Drawn from the
    // asset's cropped character bounding box (art.bx/by/bw/bh), not its full padded canvas,
    // and scaled by HEIGHT (a weapon held out sideways can widen the box without making the
    // character taller, but head-to-feet stature is the cue that reads as "size" in a lineup)
    // anchored to a common "feet" line, so every asset stands the same height regardless of
    // how much empty margin or outstretched gear its source image happened to have.
    const destH = size * 0.82, destW = destH * (art.bw / art.bh);
    const destX = cx - destW / 2, destY = cy + size * 0.30 - destH;
    ctx.drawImage(art.canvas, art.bx, art.by, art.bw, art.bh, destX, destY, destW, destH);
  } else {
    // Procedural fallback for every job without art yet.

    // soft ground shadow so the figure reads as standing on the field, not pasted onto it
    ctx.fillStyle = 'rgba(20,15,10,0.22)';
    ctx.beginPath(); ctx.ellipse(cx, cy + size * 0.36, size * 0.26, size * 0.07, 0, 0, Math.PI * 2); ctx.fill();

    // boots
    ctx.fillStyle = shadeC; ctx.strokeStyle = outline; ctx.lineWidth = lw * 0.7;
    ctx.beginPath(); ctx.ellipse(cx - size * 0.13, cy + size * 0.32, size * 0.10, size * 0.06, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + size * 0.13, cy + size * 0.32, size * 0.10, size * 0.06, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // cape: tiers 2+ and all support-line units get one, so promotion visibly reads as "fancier"
    if (j.tier >= 2 || j.line === 'support') {
      ctx.fillStyle = capeC; ctx.strokeStyle = outline; ctx.lineWidth = lw * 0.7;
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 0.14);
      ctx.lineTo(cx - size * 0.30, cy + size * 0.24);
      ctx.lineTo(cx - size * 0.05, cy + size * 0.16);
      ctx.lineTo(cx + size * 0.08, cy + size * 0.26);
      ctx.lineTo(cx + size * 0.30, cy + size * 0.20);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    // prop, drawn behind the body so the body outline reads cleanly on top
    drawProp(ctx, cx, cy, size, j, shadeC, outline, lw);

    // Floating garment torso. The physical body is absent: clothing, gloves and boots are
    // separated by visible air gaps, matching the defining transparent-body look.
    const bodyGrad = ctx.createLinearGradient(cx, cy - size * 0.06, cx, cy + size * 0.22);
    bodyGrad.addColorStop(0, lighten(bodyC, 24)); bodyGrad.addColorStop(1, bodyC);
    ctx.fillStyle = bodyGrad; ctx.strokeStyle = outline; ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.18, cy - size * 0.03);
    ctx.lineTo(cx + size * 0.18, cy - size * 0.03);
    ctx.lineTo(cx + size * 0.23, cy + size * 0.22);
    ctx.quadraticCurveTo(cx, cy + size * 0.29, cx - size * 0.23, cy + size * 0.22);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // Floating gloves: no arms are drawn between the sleeves and hands.
    for (const side of [-1, 1]) {
      const gx = cx + side * size * 0.29, gy = cy + size * 0.06;
      ctx.fillStyle = '#EEEAE0'; ctx.strokeStyle = outline; ctx.lineWidth = lw * 0.7;
      ctx.beginPath(); ctx.ellipse(gx, gy, size * 0.075, size * 0.065, side * 0.18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }

    // Large empty headgear floats above the garment with a clear neck gap. The dark hollow
    // inside is not a face; it is literal empty space.
    const headR = size * 0.30, headY = cy - size * 0.34;
    const headGrad = ctx.createRadialGradient(cx - headR * 0.3, headY - headR * 0.3, headR * 0.15, cx, headY, headR * 1.1);
    headGrad.addColorStop(0, lighten(bodyC, 30)); headGrad.addColorStop(1, bodyC);
    drawHeadgear(ctx, cx, headY, headR, j, headGrad, shadeC, outline, lw);
  }

  ctx.restore();

  // Numbered slot badge + gauge bar directly under the character, paired together exactly as
  // in the reference: a small coloured number tag (red/green/light-blue/orange, fixed per
  // slot #1-4) followed by a black bar that fills with the attack charge and resets on every hit.
  const rowY = cy + size * 0.46, rowH = size * 0.15;
  const badgeW = size * 0.17;
  const barX = cx - size * 0.32 + badgeW + size * 0.03, barW = size * 0.64 - badgeW - size * 0.03;
  if (slotIdx !== undefined && SLOT_COLORS[slotIdx]) {
    const bx = cx - size * 0.32;
    ctx.fillStyle = SLOT_COLORS[slotIdx];
    ctx.strokeStyle = outline; ctx.lineWidth = lw * 0.5;
    const br = rowH * 0.52, bcx = bx + br, bcy = rowY + rowH / 2;
    ctx.beginPath(); ctx.arc(bcx, bcy, br, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(rowH * 0.8)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(slotIdx + 1), bcx, bcy + rowH * 0.04);
  }
  ctx.fillStyle = '#181410';
  ctx.fillRect(barX, rowY, barW, rowH);
  if (stats) {
    const charge = 1 - Math.max(0, Math.min(1, u.cool / stats.cd));
    ctx.fillStyle = '#55C96B';
    ctx.fillRect(barX, rowY, barW * charge, rowH);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1;
  ctx.strokeRect(barX, rowY, barW, rowH);
}

function drawHeadgear(ctx, cx, cy, r, j, bodyC, shadeC, outline, lw) {
  ctx.fillStyle = bodyC; ctx.strokeStyle = outline; ctx.lineWidth = lw;
  if (j.line === 'magic' || j.line === 'disrupt') {
    // pointed cowl
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 1.15);
    ctx.quadraticCurveTo(cx - r * 1.0, cy - r * 0.15, cx - r * 0.85, cy + r * 0.35);
    ctx.arc(cx, cy + r * 0.35, r * 0.85, Math.PI, 0);
    ctx.quadraticCurveTo(cx + r * 1.0, cy - r * 0.15, cx, cy - r * 1.15);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = shadeC;
    ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.10, r * 0.36, r * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  } else if (j.line === 'scout') {
    // hood with an angled mask band, no face
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.95, Math.PI * 0.95, Math.PI * 2.15); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = outline;
    roundBar(ctx, cx, cy + r * 0.15, r * 1.8, r * 0.26);
  } else if (j.line === 'ranged') {
    // brimmed cap
    ctx.beginPath(); ctx.arc(cx, cy - r * 0.1, r * 0.78, Math.PI, 0); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.22, r * 0.95, r * 0.20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (j.line === 'support') {
    // full round hood with an open circlet band
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#FFE9A0'; ctx.lineWidth = lw * 0.8;
    ctx.beginPath(); ctx.arc(cx, cy - r * 0.15, r * 0.62, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  } else {
    // melee/default: rounded helm with a visor slit
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = outline;
    roundBar(ctx, cx, cy + r * 0.15, r * 1.2, r * 0.20);
  }

  // Higher-tier jobs read as visibly more decorated even without generated art: a thin gold
  // trim band for tier 4+ hybrids, plus a small crest gem for tier 5-6 (the fully-mastered
  // "極" special jobs) - so promotion keeps reading as "fancier" past the point where the
  // cape alone (tier 2+, see drawChibi) stops being enough signal.
  if (j.tier >= 4) {
    ctx.strokeStyle = '#F0CF6B'; ctx.lineWidth = Math.max(1, r * 0.09);
    ctx.beginPath(); ctx.arc(cx, cy + r * 0.05, r * 0.92, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
  }
  if (j.tier >= 5) {
    ctx.fillStyle = '#FFE9A0'; ctx.strokeStyle = outline; ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.beginPath(); ctx.arc(cx, cy - r * 0.85, r * 0.16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
}

// a pill-shaped bar, centred at (cx,cy), used for visor slits and mask bands
function roundBar(ctx, cx, cy, w, h) {
  const x = cx - w / 2, y = cy - h / 2, rad = h / 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, rad); else ctx.rect(x, y, w, h);
  ctx.fill();
}

function drawProp(ctx, cx, cy, size, j, shadeC, outline, lw) {
  ctx.strokeStyle = outline; ctx.lineWidth = lw;
  const px = cx + size * 0.30, py = cy + size * 0.02;
  if (j.line === 'melee') {
    ctx.save(); ctx.translate(px, py); ctx.rotate(-0.5);
    ctx.fillStyle = '#D8D4C8'; ctx.fillRect(-size * 0.05, -size * 0.32, size * 0.10, size * 0.40);
    ctx.strokeRect(-size * 0.05, -size * 0.32, size * 0.10, size * 0.40);
    ctx.fillStyle = shadeC; ctx.fillRect(-size * 0.08, 0, size * 0.16, size * 0.08);
    ctx.restore();
  } else if (j.line === 'ranged') {
    ctx.beginPath(); ctx.arc(px, py - size * 0.02, size * 0.24, -0.9, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + Math.cos(-0.9) * size * 0.24, py - size * 0.02 + Math.sin(-0.9) * size * 0.24);
    ctx.lineTo(px + Math.cos(0.9) * size * 0.24, py - size * 0.02 + Math.sin(0.9) * size * 0.24); ctx.stroke();
  } else if (j.line === 'scout') {
    ctx.save(); ctx.translate(px - size * 0.05, py); ctx.rotate(0.5);
    ctx.fillStyle = '#C9C4B6';
    ctx.beginPath(); ctx.moveTo(0, -size * 0.14); ctx.lineTo(size * 0.10, 0); ctx.lineTo(0, size * 0.14); ctx.lineTo(-size * 0.10, 0); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  } else if (j.line === 'magic') {
    ctx.beginPath(); ctx.moveTo(px, py + size * 0.20); ctx.lineTo(px, py - size * 0.30); ctx.stroke();
    ctx.fillStyle = shadeC;
    ctx.beginPath(); ctx.arc(px, py - size * 0.34, size * 0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (j.line === 'disrupt') {
    ctx.fillStyle = '#EDE7D6'; ctx.fillRect(px - size * 0.06, py - size * 0.26, size * 0.12, size * 0.30);
    ctx.strokeRect(px - size * 0.06, py - size * 0.26, size * 0.12, size * 0.30);
    ctx.strokeStyle = shadeC; ctx.lineWidth = lw * 0.6;
    ctx.beginPath(); ctx.moveTo(px - size * 0.04, py - size * 0.14); ctx.lineTo(px + size * 0.04, py - size * 0.14); ctx.stroke();
  } else if (j.line === 'support') {
    ctx.fillStyle = shadeC;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, size * 0.22, -0.7, 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

// Draws one enemy's body (shape/kind ears/highlight/eyes) at (px,py) with radius r - shared by
// the live battle board and getEnemyIcon (codex screen) so an enemy always looks the same both
// places, no separate "icon art" to keep in sync. enemyId is optional (drawBattle/getEnemyIcon
// pass it; callers that only have the def can omit it and just get the procedural shape) - when
// real art has loaded for that id, it's drawn instead, scaled by height and anchored to the same
// "feet" line the procedural shape sits on so real-art and not-yet-generated enemies read at a
// consistent size in the same wave.
function drawEnemyShape(ctx, px, py, r, def, enemyId) {
  const art = enemyId && enemyArtCache[enemyId];
  if (art) {
    const destH = r * 2.6, destW = destH * (art.bw / art.bh);
    const destX = px - destW / 2, destY = py + r * 0.9 - destH;
    ctx.drawImage(art.canvas, art.bx, art.by, art.bw, art.bh, destX, destY, destW, destH);
    return;
  }
  const outline = '#140F0A';
  ctx.fillStyle = def.color;
  ctx.strokeStyle = outline; ctx.lineWidth = Math.max(1, r * 0.16);
  // ears/horns by kind, drawn first so the body outline sits on top
  if (def.kind === 'metal' || def.kind === 'guard') {
    ctx.fillStyle = def.color;
    ctx.beginPath(); ctx.moveTo(px - r * 0.6, py - r * 0.7); ctx.lineTo(px - r * 0.9, py - r * 1.4); ctx.lineTo(px - r * 0.15, py - r * 0.9); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + r * 0.6, py - r * 0.7); ctx.lineTo(px + r * 0.9, py - r * 1.4); ctx.lineTo(px + r * 0.15, py - r * 0.9); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (def.kind === 'yokai') {
    ctx.fillStyle = def.color;
    ctx.beginPath(); ctx.ellipse(px - r * 0.85, py - r * 0.3, r * 0.32, r * 0.5, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(px + r * 0.85, py - r * 0.3, r * 0.32, r * 0.5, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (def.kind === 'fast') {
    ctx.fillStyle = def.color;
    ctx.beginPath(); ctx.moveTo(px - r * 0.5, py - r * 0.6); ctx.lineTo(px - r * 0.7, py - r * 1.3); ctx.lineTo(px - r * 0.1, py - r * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + r * 0.5, py - r * 0.6); ctx.lineTo(px + r * 0.7, py - r * 1.3); ctx.lineTo(px + r * 0.1, py - r * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = def.color;
  if (def.shape === 'diamond') {
    ctx.beginPath(); ctx.moveTo(px, py - r); ctx.lineTo(px + r, py); ctx.lineTo(px, py + r); ctx.lineTo(px - r, py); ctx.closePath();
    ctx.fill(); ctx.stroke();
  } else if (def.shape === 'square') {
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(px - r, py - r, r * 2, r * 2, r * 0.25) : ctx.rect(px - r, py - r, r * 2, r * 2);
    ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  // a soft highlight, matching the chibi units' cel-shaded look
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.arc(px - r * 0.3, py - r * 0.3, r * 0.4, 0, Math.PI * 2); ctx.fill();
  // dot eyes
  ctx.fillStyle = '#140F0A';
  ctx.beginPath(); ctx.arc(px - r * 0.28, py + r * 0.08, r * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + r * 0.28, py + r * 0.08, r * 0.11, 0, Math.PI * 2); ctx.fill();
}

const enemyIconCache = {};
function getEnemyIcon(enemyId) {
  const art = enemyArtCache[enemyId];
  if (art) {
    if (enemyIconCache[enemyId]) return enemyIconCache[enemyId];
    const size = 56;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const side = Math.min(art.bw, art.bh);
    const sx = art.bx + (art.bw - side) / 2, sy = art.by;
    ctx.drawImage(art.canvas, sx, sy, side, Math.min(side, art.bh - (sy - art.by)), 0, 0, size, size);
    const url = c.toDataURL();
    enemyIconCache[enemyId] = url;
    return url;
  }
  const size = 56;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  const def = ENEMIES[enemyId];
  const r = size * (def.boss ? 0.34 : 0.30);
  drawEnemyShape(ctx, size / 2, size / 2 + size * 0.06, r, def, enemyId);
  const url = c.toDataURL();
  enemyIconCache[enemyId] = url;
  return url;
}

function drawBattle() {
  const c = document.getElementById('board'), ctx = c.getContext('2d');
  const w = c.width, h = c.height;

  ctx.clearRect(0, 0, w, h);

  // Rebuild target: preserve the compact original smartphone battle composition.
  // No tile grid, no isometric depth, no oversized HUD. A bright horizon + grass + broad dirt
  // defence lane makes enemy motion immediately readable at phone size.
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.30);
  sky.addColorStop(0, '#A9D9F3'); sky.addColorStop(1, '#EAF2D8');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h * 0.30);

  // distant hills
  ctx.fillStyle = '#9BC66D';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.25);
  ctx.quadraticCurveTo(w * 0.18, h * 0.15, w * 0.34, h * 0.25);
  ctx.quadraticCurveTo(w * 0.52, h * 0.12, w * 0.70, h * 0.25);
  ctx.quadraticCurveTo(w * 0.86, h * 0.18, w, h * 0.25);
  ctx.lineTo(w, h * 0.38); ctx.lineTo(0, h * 0.38); ctx.closePath(); ctx.fill();

  // upper/lower grass banks and the broad horizontal defence lane
  const grass = ctx.createLinearGradient(0, h * 0.24, 0, h);
  grass.addColorStop(0, '#87BC4F'); grass.addColorStop(1, '#68A33D');
  ctx.fillStyle = grass;
  ctx.fillRect(0, h * 0.27, w, h * 0.12);
  ctx.fillRect(0, h * 0.76, w, h * 0.24);

  const dirt = ctx.createLinearGradient(0, h * 0.38, 0, h * 0.76);
  dirt.addColorStop(0, '#D8C99B'); dirt.addColorStop(0.5, '#CDBB8A'); dirt.addColorStop(1, '#E0D2AA');
  ctx.fillStyle = dirt; ctx.fillRect(0, h * 0.38, w, h * 0.38);

  // restrained field texture (deterministic, no per-frame random flicker)
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  for (let x = 12; x < w; x += 39) {
    const y = h * (0.31 + ((x / 39) % 3) * 0.018);
    ctx.fillRect(x, y, 2, 5);
  }
  ctx.fillStyle = 'rgba(90,70,45,0.10)';
  for (let x = 16; x < w; x += 47) {
    const y = h * (0.46 + ((x / 47) % 4) * 0.055);
    ctx.beginPath(); ctx.ellipse(x, y, 6, 2, 0, 0, Math.PI * 2); ctx.fill();
  }

  // Village defence marker at the right edge. It makes the fail condition visually obvious
  // without adding another HUD panel: one enemy crossing this gate ends the defence.
  const gateX = w * 0.958, gateTop = h * 0.365, gateBottom = h * 0.72;
  ctx.fillStyle = 'rgba(94,45,25,.18)';
  ctx.fillRect(gateX - w * 0.012, gateTop, w * 0.024, gateBottom - gateTop);
  ctx.strokeStyle = 'rgba(92,45,24,.68)';
  ctx.lineWidth = Math.max(2, w * 0.007);
  ctx.beginPath();
  ctx.moveTo(gateX - w * 0.018, gateTop + h * 0.02);
  ctx.lineTo(gateX - w * 0.018, gateBottom);
  ctx.moveTo(gateX + w * 0.018, gateTop + h * 0.02);
  ctx.lineTo(gateX + w * 0.018, gateBottom);
  ctx.moveTo(gateX - w * 0.035, gateTop + h * 0.035);
  ctx.lineTo(gateX + w * 0.035, gateTop + h * 0.035);
  ctx.stroke();

  // Short-lived attack tracers. They show who attacked whom without covering the field.
  for (const shot of B.shots) {
    const a = Math.max(0, shot.life / 150);
    const px = shot.x2 * w, py = shot.y2 * h;
    ctx.globalAlpha = a * 0.55;
    ctx.strokeStyle = shot.color; ctx.lineWidth = Math.max(2, w * 0.006);
    ctx.beginPath();
    ctx.moveTo(shot.x1 * w, shot.y1 * h);
    ctx.lineTo(px, py);
    ctx.stroke();

    if (shot.area === 'burst') {
      ctx.globalAlpha = a * 0.42;
      ctx.lineWidth = Math.max(2, w * 0.004);
      ctx.beginPath(); ctx.arc(px, py, w * (0.035 + (1 - a) * 0.025), 0, Math.PI * 2); ctx.stroke();
    } else if (shot.area === 'all') {
      ctx.globalAlpha = a * 0.30;
      ctx.lineWidth = Math.max(2, w * 0.004);
      ctx.beginPath(); ctx.arc(px, py, w * (0.07 + (1 - a) * 0.16), 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Original-style four-person formation: #1/#3 top, #2/#4 bottom, large enough to read on phone.
  const heroSize = w * 0.27;
  B.units.forEach((u, idx) => {
    const j = JOBS[u.hero.job], stats = heroStats(u.hero);
    drawChibi(ctx, u.x * w, u.y * h, heroSize, u, j, stats, idx);
  });

  for (const e of B.enemies) {
    if (e.hp <= 0) continue;
    const p = battlePoint(e.pos);
    const px = p.x * w, py = p.y * h;
    const r = w * (e.def.boss ? 0.135 : 0.076);

    // The original screen gives enemies a compact black ground-shadow directly above the red HP
    // bar. Keeping that pairing makes the moving target readable against the pale road.
    ctx.fillStyle = 'rgba(18,14,10,.86)';
    ctx.beginPath(); ctx.ellipse(px, py + r * 0.92, r * 0.54, r * 0.16, 0, 0, Math.PI * 2); ctx.fill();

    drawEnemyShape(ctx, px, py, r, e.def, e.id);

    // Enemy HP bar belongs directly to the enemy, matching the reference battle language.
    const barW = r * 1.95, barH = Math.max(4, w * 0.010);
    const barY = py + r * 1.03;
    ctx.fillStyle = '#17130F'; ctx.fillRect(px - barW / 2, barY, barW, barH);
    ctx.fillStyle = e.def.boss ? '#E7B63E' : '#E6505B';
    ctx.fillRect(px - barW / 2 + 1, barY + 1, (barW - 2) * Math.max(0, e.hp / e.maxHp), Math.max(2, barH - 2));


    // Small, readable status markers; no tap-to-open combat panel.
    if (e.invincibleT > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(px, py, r * 1.18, 0, Math.PI * 2); ctx.stroke();
    }
    if (e.stun > 0) {
      ctx.fillStyle = '#F5D84F';
      for (let n = 0; n < 3; n++) {
        const a = -Math.PI * 0.85 + n * 0.85;
        const sx = px + Math.cos(a) * r * 0.9, sy = py - r * 0.92 + Math.sin(a) * r * 0.22;
        ctx.beginPath(); ctx.arc(sx, sy, Math.max(2, w * 0.008), 0, Math.PI * 2); ctx.fill();
      }
    }
    if (e.slowAmt > 0) {
      ctx.strokeStyle = 'rgba(96,190,235,.85)';
      ctx.lineWidth = Math.max(2, w * 0.004);
      ctx.beginPath(); ctx.ellipse(px, py + r * 0.76, r * 0.72, r * 0.20, 0, 0, Math.PI * 2); ctx.stroke();
    }
    if (e.poison > 0) {
      ctx.fillStyle = 'rgba(92,180,82,.88)';
      for (let n = 0; n < 3; n++) {
        ctx.beginPath();
        ctx.arc(px + r * (0.55 + n * 0.18), py - r * (0.62 + n * 0.16), Math.max(2, w * (0.006 + n * 0.002)), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (e.debuffAmt > 0) {
      ctx.strokeStyle = 'rgba(160,95,190,.72)';
      ctx.lineWidth = Math.max(2, w * 0.006);
      ctx.beginPath(); ctx.arc(px, py, r * 1.04, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    }
  }

  // Impact effects and damage numbers use normalised battlefield coordinates.
  for (const fx of B.hitfx) {
    const t = 1 - Math.max(0, fx.life) / fx.maxLife;
    const alpha = Math.max(0, fx.life / fx.maxLife);
    const px = fx.x * w, py = fx.y * h;
    ctx.globalAlpha = alpha;
    if (fx.kind === 'slash') {
      ctx.save(); ctx.translate(px, py); ctx.rotate(-0.6 + fx.seed * 1.2);
      const len = w * (0.055 + t * 0.035);
      ctx.strokeStyle = 'rgba(20,15,10,0.55)'; ctx.lineWidth = Math.max(2, w * 0.010);
      ctx.beginPath(); ctx.moveTo(-len / 2, 0); ctx.lineTo(len / 2, 0); ctx.stroke();
      ctx.strokeStyle = '#FFFBEF'; ctx.lineWidth = Math.max(1, w * 0.005);
      ctx.beginPath(); ctx.moveTo(-len / 2, 0); ctx.lineTo(len / 2, 0); ctx.stroke();
      ctx.restore();
    } else {
      for (let n = 0; n < 6; n++) {
        const ang = (n / 6) * Math.PI * 2 + fx.seed * 6;
        const dist = w * 0.025 * (0.3 + t * 1.3);
        ctx.fillStyle = fx.color;
        ctx.beginPath(); ctx.arc(px + Math.cos(ang) * dist, py + Math.sin(ang) * dist, Math.max(1.5, w * 0.007), 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  for (const f of B.floats) {
    ctx.globalAlpha = Math.max(0, f.life / 520);
    ctx.font = `bold ${Math.round(w * 0.032)}px sans-serif`;
    ctx.textAlign = 'center';
    const fx = f.x * w, fy = f.y * h - (520 - f.life) * 0.025 - h * 0.045;
    ctx.strokeStyle = 'rgba(0,0,0,0.65)'; ctx.lineWidth = 3; ctx.strokeText(f.text, fx, fy);
    ctx.fillStyle = f.heal ? '#79D77A' : f.guard ? '#F2D27A' : f.poison ? '#68C568' : '#FFFFFF';
    ctx.fillText(f.text, fx, fy);
    ctx.globalAlpha = 1;
  }

}
