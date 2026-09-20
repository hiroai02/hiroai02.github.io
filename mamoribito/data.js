window.GAMEDATA={"balance":{
  "jobExp": { "base": { "1": 12, "2": 20, "3": 30, "4": 45, "5": 60 }, "power": 1.25, "maxLevel": 20 },
  "combat": {
    "strongMultiplier": 1.6,
    "knockbackDiminishMs": 500,
    "knockbackDiminishFactor": 0.5,
    "bossLifeCost": 3
  },
  "weapon": {
    "maxLevel": 10,
    "atkPerLevel": 0.07,
    "cdMulPerLevel": 0.98,
    "costBase": 80,
    "costPower": 1.55
  },
  "training": {
    "ticketMax": 20,
    "ticketRegenMs": 180000,
    "greatRate": 0.15,
    "critRate": 0.03,
    "greatMultiplier": 2,
    "critMultiplier": 3,
    "affinityBonus": 0.3,
    "baseExp": 55
  }
},"enemies":{
  "kogami": {
    "name": "小鬼",
    "kind": "normal",
    "hp": 60,
    "atk": 1,
    "speed": 1.5,
    "def": 2,
    "res": {
      "kb": 0,
      "stun": 0,
      "debuff": 0,
      "slow": 0
    },
    "gold": 12,
    "shape": "circle",
    "color": "#C4633F"
  },
  "hayaitachi": {
    "name": "疾風鼬",
    "kind": "fast",
    "hp": 34,
    "atk": 1,
    "speed": 3.1,
    "def": 0,
    "res": {
      "kb": 0.1,
      "stun": 0,
      "debuff": 0,
      "slow": 0
    },
    "gold": 14,
    "shape": "circle",
    "color": "#D8A03F"
  },
  "tsuchigumo": {
    "name": "土蜘蛛",
    "kind": "tanky",
    "hp": 210,
    "atk": 1,
    "speed": 0.85,
    "def": 5,
    "res": {
      "kb": 0.45,
      "stun": 0.2,
      "debuff": 0,
      "slow": 0.2
    },
    "gold": 26,
    "shape": "circle",
    "color": "#8A5A3C"
  },
  "kanenezumi": {
    "name": "鉄鼠",
    "kind": "metal",
    "hp": 90,
    "atk": 1,
    "speed": 1.2,
    "def": 6,
    "res": {
      "kb": 0.6,
      "stun": 0.3,
      "debuff": 0.4,
      "slow": 0.3
    },
    "gold": 30,
    "shape": "square",
    "color": "#9AA0AC",
    "poisonImmune": true
  },
  "tengugarasu": {
    "name": "天狗烏",
    "kind": "flyer",
    "hp": 70,
    "atk": 1,
    "speed": 2.2,
    "def": 3,
    "res": {
      "kb": 0.3,
      "stun": 0,
      "debuff": 0,
      "slow": 0
    },
    "gold": 20,
    "shape": "diamond",
    "color": "#5FA9D6"
  },
  "bakeneko": {
    "name": "化け猫",
    "kind": "yokai",
    "hp": 110,
    "atk": 1,
    "speed": 1.8,
    "def": 5,
    "res": {
      "kb": 0.2,
      "stun": 0.2,
      "debuff": 0.6,
      "slow": 0.1
    },
    "gold": 28,
    "shape": "circle",
    "color": "#A46FC4"
  },
  "koramusha": {
    "name": "甲羅武者",
    "kind": "guard",
    "hp": 160,
    "atk": 1,
    "speed": 1,
    "def": 5,
    "res": {
      "kb": 0.7,
      "stun": 0.4,
      "debuff": 0.2,
      "slow": 0.3
    },
    "gold": 30,
    "shape": "square",
    "color": "#6E8A5E"
  },
  "kagebozu": {
    "name": "影法師",
    "kind": "yokai",
    "hp": 85,
    "atk": 1,
    "speed": 1.6,
    "def": 4,
    "res": {
      "kb": 0.25,
      "stun": 0.5,
      "debuff": 0.3,
      "slow": 0.2
    },
    "gold": 32,
    "shape": "circle",
    "color": "#5B5470",
    "ability": "split",
    "splitInto": "kogami",
    "splitCount": 1
  },
  "ooari": {
    "name": "大蟻",
    "kind": "normal",
    "hp": 95,
    "atk": 1,
    "speed": 1.7,
    "def": 4,
    "res": {
      "kb": 0.15,
      "stun": 0,
      "debuff": 0,
      "slow": 0
    },
    "gold": 18,
    "shape": "circle",
    "color": "#B0763F"
  },
  "yamabiko": {
    "name": "山彦",
    "kind": "yokai",
    "hp": 150,
    "atk": 1,
    "speed": 1.4,
    "def": 6,
    "res": {
      "kb": 0.3,
      "stun": 0.3,
      "debuff": 0.5,
      "slow": 0.2
    },
    "gold": 34,
    "shape": "circle",
    "color": "#7FA07F",
    "ability": "haste",
    "hasteAt": 0.4,
    "hasteMul": 1.8
  },
  "boss_oomukade": {
    "name": "大百足",
    "hp": 508,
    "kind": "tanky",
    "atk": 1,
    "speed": 0.9,
    "def": 2,
    "res": {
      "kb": 0.85,
      "stun": 0.7,
      "debuff": 0.4,
      "slow": 0.5
    },
    "gold": 220,
    "shape": "square",
    "color": "#B4523C",
    "boss": true,
    "ability": "invincible",
    "invincibleAt": 0.6,
    "invincibleMs": 3000
  },
  "boss_nue": {
    "name": "鵺",
    "hp": 1025,
    "kind": "yokai",
    "atk": 1,
    "speed": 1.2,
    "def": 4,
    "res": {
      "kb": 0.8,
      "stun": 0.8,
      "debuff": 0.7,
      "slow": 0.4
    },
    "gold": 300,
    "shape": "diamond",
    "color": "#7A5FA8",
    "boss": true,
    "ability": "summon",
    "summonId": "hayaitachi",
    "summonMs": 5000,
    "summonCount": 2
  },
  "boss_tetsuoni": {
    "name": "鉄鬼",
    "hp": 1230,
    "kind": "metal",
    "atk": 1,
    "speed": 0.8,
    "def": 9,
    "res": {
      "kb": 0.9,
      "stun": 0.8,
      "debuff": 0.6,
      "slow": 0.6
    },
    "gold": 420,
    "shape": "square",
    "color": "#8F98A8",
    "boss": true,
    "poisonImmune": true,
    "ability": "armorbreak",
    "breakAt": 0.5,
    "breakMul": 0.35
  },
  "kekkaiwarashi": {
    "name": "結界童子",
    "kind": "yokai",
    "hp": 150,
    "atk": 1,
    "speed": 1.15,
    "def": 3,
    "res": {
      "kb": 0.25,
      "stun": 0.25,
      "debuff": 0.2,
      "slow": 0.2
    },
    "gold": 34,
    "shape": "diamond",
    "color": "#B99AD8",
    "ability": "barrier",
    "barrierCutoff": 45
  },
  "iyashikodama": {
    "name": "癒木霊",
    "kind": "yokai",
    "hp": 175,
    "atk": 1,
    "speed": 1,
    "def": 3,
    "res": {
      "kb": 0.25,
      "stun": 0.2,
      "debuff": 0.25,
      "slow": 0.2
    },
    "gold": 36,
    "shape": "circle",
    "color": "#78AD68",
    "ability": "heal",
    "healRate": 0.085
  },
  "kaeriinoshishi": {
    "name": "返り猪",
    "kind": "tanky",
    "hp": 220,
    "atk": 1,
    "speed": 0.95,
    "def": 4,
    "res": {
      "kb": 0.45,
      "stun": 0.25,
      "debuff": 0.2,
      "slow": 0.25
    },
    "gold": 38,
    "shape": "circle",
    "color": "#8F654A",
    "ability": "recoil",
    "recoilStep": 0.34
  },
  "dokugaeru": {
    "name": "毒喰蛙",
    "kind": "yokai",
    "hp": 145,
    "atk": 1,
    "speed": 1.3,
    "def": 3,
    "res": {
      "kb": 0.2,
      "stun": 0.25,
      "debuff": 0.2,
      "slow": 0.2
    },
    "gold": 36,
    "shape": "circle",
    "color": "#73964F",
    "ability": "poisonreact",
    "poisonHasteMul": 1.18,
    "poisonHasteCap": 2.6
  },
  "ishigame": {
    "name": "石鎧虫",
    "kind": "guard",
    "hp": 14,
    "atk": 1,
    "speed": 1.05,
    "def": 99,
    "res": {
      "kb": 0.35,
      "stun": 0.2,
      "debuff": 1,
      "slow": 0.25
    },
    "gold": 40,
    "shape": "square",
    "color": "#777D78",
    "ability": "sturdy"
  }
},"jobs":{
  "ashigaru": {
    "name": "剣士",
    "tier": 1,
    "line": "melee",
    "atk": 22,
    "cd": 900,
    "kb": 0.3,
    "color": "#C9743A",
    "desc": "冒険の基本。安定した攻撃力と軽いノックバック",
    "master": {
      "id": "questExp",
      "value": 0.05,
      "label": "任務経験値 +5%"
    }
  },
  "shashu": {
    "name": "弓使い",
    "tier": 1,
    "line": "ranged",
    "atk": 15,
    "cd": 1250,
    "strong": "flyer",
    "color": "#4F8FBF",
    "desc": "飛行に強いが、矢をつがえるのが遅い",
    "master": {
      "id": "orbCost",
      "value": -0.05,
      "label": "オーブ購入費用 -5%"
    }
  },
  "jumi": {
    "name": "忍び",
    "tier": 1,
    "line": "scout",
    "atk": 9,
    "cd": 560,
    "color": "#9B6FD8",
    "desc": "素早いが一撃は軽い。倒すと得られる銭が3倍",
    "master": {
      "id": "weaponCost",
      "value": -0.05,
      "label": "武器強化費用 -5%"
    },
    "coin": 3
  },
  "kagura": {
    "name": "旅芸人",
    "tier": 1,
    "line": "support",
    "atk": 6,
    "cd": 1100,
    "buff": 0.12,
    "color": "#D8B23F",
    "desc": "味方の攻撃力を上げる支援役",
    "master": {
      "id": "trainExp",
      "value": 0.1,
      "label": "修行経験値 +10%"
    }
  },
  "samurai": {
    "name": "剣豪",
    "tier": 2,
    "line": "melee",
    "atk": 34,
    "cd": 1000,
    "kb": 0.55,
    "color": "#E08A3C",
    "from": [
      "ashigaru"
    ],
    "desc": "高火力と強いノックバック。攻撃間隔は長い",
    "master": {
      "id": "questGold",
      "value": 0.08,
      "label": "任務報酬金 +8%"
    },
    "examReq": "exam_ashigaru"
  },
  "yariashi": {
    "name": "槍術士",
    "tier": 2,
    "line": "melee",
    "atk": 24,
    "cd": 880,
    "pierce": 0.5,
    "color": "#B8863C",
    "from": [
      "ashigaru"
    ],
    "desc": "防御を半分無視する。金属に特効",
    "master": {
      "id": "weaponCost",
      "value": -0.1,
      "label": "武器強化費用 -10%"
    },
    "strong": "metal",
    "examReq": "exam_ashigaru"
  },
  "kyousenshi": {
    "name": "狂戦士",
    "tier": 2,
    "line": "melee",
    "atk": 40,
    "cd": 700,
    "kb": 0.2,
    "color": "#6E4A44",
    "from": [
      "ashigaru"
    ],
    "desc": "鬼の血を宿し、我を忘れて斬り続ける。制御は利かないが手数が多い",
    "master": {
      "id": "trainGreat",
      "value": 0.08,
      "label": "修行の大成功率 +8%"
    },
    "examReq": "exam_ashigaru"
  },
  "sogeki": {
    "name": "狙撃手",
    "tier": 2,
    "line": "ranged",
    "atk": 30,
    "cd": 1250,
    "strong": "flyer",
    "color": "#3FA0D8",
    "from": [
      "shashu"
    ],
    "desc": "会心必中の腕。放つ矢はことごとく急所を射抜く",
    "master": {
      "id": "trainGreat",
      "value": 0.03,
      "label": "修行の大成功率 +3%"
    },
    "examReq": "exam_shashu"
  },
  "meigen": {
    "name": "鳴弦師",
    "tier": 2,
    "line": "disrupt",
    "atk": 12,
    "cd": 1400,
    "stun": 900,
    "color": "#68B8C8",
    "from": [
      "shashu"
    ],
    "desc": "弦の音で敵を短時間止める",
    "master": {
      "id": "trainGreat",
      "value": 0.05,
      "label": "修行の大成功率 +5%"
    },
    "examReq": "exam_shashu"
  },
  "fufushi": {
    "name": "火術師",
    "tier": 2,
    "line": "magic",
    "atk": 24,
    "cd": 1300,
    "color": "#E0663C",
    "from": [
      "jumi"
    ],
    "desc": "広い爆風。単体火力は控えめ",
    "master": {
      "id": "legendGain",
      "value": 0.04,
      "label": "伝説度獲得 +4%"
    },
    "examReq": "exam_jumi"
  },
  "hyofushi": {
    "name": "氷術師",
    "tier": 2,
    "line": "disrupt",
    "atk": 15,
    "cd": 1050,
    "slow": 0.45,
    "color": "#63C8D8",
    "from": [
      "jumi"
    ],
    "desc": "敵を鈍らせる。足止めの要",
    "master": {
      "id": "trainSpeed",
      "value": 0.15,
      "label": "修行札の回復速度 +15%"
    },
    "examReq": "exam_jumi"
  },
  "kunoichi": {
    "name": "くノ一",
    "tier": 2,
    "line": "scout",
    "atk": 16,
    "cd": 400,
    "color": "#4A3560",
    "from": [
      "jumi"
    ],
    "desc": "忍びの中でも最速の連撃。倒すと得られる銭が2倍",
    "master": {
      "id": "weaponCost",
      "value": -0.08,
      "label": "武器強化費用 -8%"
    },
    "coin": 2,
    "examReq": "exam_jumi"
  },
  "miko": {
    "name": "巫女",
    "tier": 2,
    "line": "support",
    "atk": 8,
    "cd": 1000,
    "buff": 0.22,
    "color": "#E8A0B8",
    "from": [
      "kagura"
    ],
    "desc": "味方を大きく強化する",
    "master": {
      "id": "trainExp",
      "value": 0.1,
      "label": "修行経験値 +10%"
    },
    "examReq": "exam_kagura"
  },
  "haraite": {
    "name": "祓い手",
    "tier": 2,
    "line": "disrupt",
    "atk": 12,
    "cd": 1000,
    "debuff": 0.25,
    "poison": 5,
    "color": "#5EA85E",
    "from": [
      "kagura"
    ],
    "desc": "敵を弱らせ、毒で削る",
    "master": {
      "id": "trainGreat",
      "value": 0.03,
      "label": "修行の大成功率 +3%"
    },
    "examReq": "exam_kagura"
  },
  "odachi": {
    "name": "剣聖",
    "tier": 3,
    "line": "melee",
    "atk": 58,
    "cd": 1150,
    "kb": 0.8,
    "color": "#EFA046",
    "from": [
      "samurai"
    ],
    "desc": "圧倒的な一撃と強力なノックバック",
    "master": {
      "id": "questGold",
      "value": 0.16,
      "label": "任務報酬金 +16%"
    }
  },
  "nagae": {
    "name": "大槍使い",
    "tier": 3,
    "line": "melee",
    "atk": 38,
    "cd": 900,
    "pierce": 0.75,
    "color": "#C99A46",
    "from": [
      "yariashi"
    ],
    "desc": "防御をほぼ無視し、前後をまとめて突く。金属に特効",
    "master": {
      "id": "weaponCost",
      "value": -0.2,
      "label": "武器強化費用 -20%"
    },
    "strong": "metal"
  },
  "karyudo": {
    "name": "狩人",
    "tier": 3,
    "line": "ranged",
    "atk": 48,
    "cd": 1350,
    "strong": "flyer",
    "color": "#57BFF0",
    "from": [
      "sogeki"
    ],
    "desc": "盤面のほぼ全域を射程に収める",
    "master": {
      "id": "trainGreat",
      "value": 0.06,
      "label": "修行の大成功率 +6%"
    }
  },
  "hamashi": {
    "name": "破魔師",
    "tier": 3,
    "line": "disrupt",
    "atk": 22,
    "cd": 1300,
    "stun": 1400,
    "strong": "yokai",
    "color": "#8FD8E8",
    "from": [
      "meigen"
    ],
    "desc": "長いスタン。魔物に特効",
    "master": {
      "id": "trainGreat",
      "value": 0.1,
      "label": "修行の大成功率 +10%"
    }
  },
  "enjin": {
    "name": "炎陣師",
    "tier": 3,
    "line": "magic",
    "atk": 38,
    "cd": 1400,
    "color": "#F0743C",
    "from": [
      "fufushi"
    ],
    "desc": "巨大な爆風で群れを焼く",
    "master": {
      "id": "legendGain",
      "value": 0.08,
      "label": "伝説度獲得 +8%"
    }
  },
  "hyosetsu": {
    "name": "氷雪師",
    "tier": 3,
    "line": "disrupt",
    "atk": 24,
    "cd": 1150,
    "slow": 0.6,
    "color": "#8FE0F0",
    "from": [
      "hyofushi"
    ],
    "desc": "広範囲を凍らせて足を止める",
    "master": {
      "id": "trainSpeed",
      "value": 0.3,
      "label": "修行札の回復速度 +30%"
    }
  },
  "omiko": {
    "name": "大聖女",
    "tier": 3,
    "line": "support",
    "atk": 12,
    "cd": 950,
    "buff": 0.38,
    "color": "#F0B8C8",
    "from": [
      "miko"
    ],
    "desc": "広範囲の味方を大幅に強化",
    "master": {
      "id": "trainExp",
      "value": 0.2,
      "label": "修行経験値 +20%"
    }
  },
  "chobuku": {
    "name": "調伏師",
    "tier": 3,
    "line": "disrupt",
    "atk": 20,
    "cd": 1000,
    "debuff": 0.45,
    "poison": 12,
    "strong": "yokai",
    "color": "#7FC87F",
    "from": [
      "haraite"
    ],
    "desc": "強力な弱体と毒。魔物に特効",
    "master": {
      "id": "trainGreat",
      "value": 0.06,
      "label": "修行の大成功率 +6%"
    }
  },
  "nitomusha": {
    "name": "二刀流剣士",
    "tier": 4,
    "line": "melee",
    "atk": 46,
    "cd": 620,
    "kb": 0.4,
    "pierce": 0.4,
    "color": "#FFB765",
    "masterReq": [
      "samurai",
      "yariashi"
    ],
    "desc": "速射と貫通を兼ねる複合職",
    "master": {
      "id": "questExp",
      "value": 0.15,
      "label": "任務経験値 +15%"
    }
  },
  "raifushi": {
    "name": "雷術師",
    "tier": 4,
    "line": "magic",
    "atk": 40,
    "cd": 1150,
    "stun": 700,
    "color": "#F0E060",
    "masterReq": [
      "fufushi",
      "meigen"
    ],
    "desc": "落雷で範囲を焼き、痺れさせる",
    "master": {
      "id": "weaponCost",
      "value": -0.15,
      "label": "武器強化費用 -15%"
    }
  },
  "reikyu": {
    "name": "霊弓師",
    "tier": 4,
    "line": "ranged",
    "atk": 52,
    "cd": 1150,
    "strong": "yokai",
    "buff": 0.15,
    "color": "#A8E0F0",
    "masterReq": [
      "sogeki",
      "miko"
    ],
    "desc": "遠射しつつ味方を支える",
    "master": {
      "id": "orbCost",
      "value": -0.1,
      "label": "オーブ購入費用 -10%"
    }
  },
  "jubaku": {
    "name": "呪縛師",
    "tier": 4,
    "line": "disrupt",
    "atk": 26,
    "cd": 1000,
    "slow": 0.55,
    "debuff": 0.4,
    "stun": 600,
    "color": "#9FD8B8",
    "masterReq": [
      "hyofushi",
      "haraite"
    ],
    "desc": "鈍足・弱体・スタンを同時に振り撒く",
    "master": {
      "id": "trainExp",
      "value": 0.25,
      "label": "修行経験値 +25%"
    }
  },
  "ningyoushi": {
    "name": "人形師",
    "tier": 4,
    "line": "disrupt",
    "atk": 20,
    "cd": 1100,
    "stun": 800,
    "debuff": 0.5,
    "slow": 0.3,
    "color": "#7A2E30",
    "masterReq": [
      "haraite",
      "miko"
    ],
    "desc": "からくり人形で敵を搦め捕り、弱らせる複合職",
    "master": {
      "id": "trainGreat",
      "value": 0.15,
      "label": "修行の大成功率 +15%"
    }
  },
  "bukyuushi": {
    "name": "武弓士",
    "tier": 4,
    "line": "ranged",
    "atk": 56,
    "cd": 1100,
    "kb": 0.5,
    "strong": "flyer",
    "color": "#3A3168",
    "masterReq": [
      "odachi",
      "karyudo"
    ],
    "desc": "弓と刀を極めた武人。射撃に斬撃の重さを併せ持つ",
    "master": {
      "id": "orbCost",
      "value": -0.15,
      "label": "オーブ購入費用 -15%"
    }
  },
  "onikiri": {
    "name": "鬼斬り",
    "tier": 5,
    "line": "melee",
    "atk": 96,
    "cd": 1000,
    "kb": 0.9,
    "pierce": 0.6,
    "strong": "yokai",
    "color": "#FF9040",
    "masterReq": [
      "odachi",
      "hamashi",
      "chobuku"
    ],
    "desc": "極級。鬼を断つ一撃",
    "master": {
      "id": "questGold",
      "value": 0.3,
      "label": "任務報酬金 +30%"
    }
  },
  "daionmyo": {
    "name": "大陰陽師",
    "tier": 5,
    "line": "magic",
    "atk": 62,
    "cd": 1200,
    "slow": 0.4,
    "stun": 800,
    "color": "#C89AF0",
    "masterReq": [
      "enjin",
      "hyosetsu",
      "raifushi"
    ],
    "desc": "極級。天災のごとき大術",
    "master": {
      "id": "legendGain",
      "value": 0.15,
      "label": "伝説度獲得 +15%"
    }
  },
  "byakko": {
    "name": "白狐の巫女",
    "tier": 6,
    "line": "support",
    "atk": 30,
    "cd": 900,
    "buff": 0.6,
    "strong": "yokai",
    "color": "#FFE0F0",
    "titleReq": "hyakki",
    "questReq": "eq_hyakki",
    "masterReq": [
      "omiko"
    ],
    "desc": "特殊職。里全体を守護する",
    "master": {
      "id": "trainExp",
      "value": 0.4,
      "label": "修行経験値 +40%"
    }
  },
  "kakurizato": {
    "name": "隠里の守人",
    "tier": 6,
    "line": "melee",
    "atk": 70,
    "cd": 800,
    "kb": 0.6,
    "pierce": 0.5,
    "color": "#D8C89A",
    "masterReq": [
      "ashigaru",
      "shashu",
      "jumi",
      "kagura"
    ],
    "questReq": "eq_kakuri",
    "desc": "特殊職。初級四職を極めた者のみが至る",
    "master": {
      "id": "questExp",
      "value": 0.3,
      "label": "任務経験値 +30%"
    }
  },
  "yuusha": {
    "name": "勇者",
    "tier": 6,
    "line": "melee",
    "atk": 105,
    "cd": 950,
    "kb": 0.75,
    "pierce": 0.3,
    "color": "#8C2A2A",
    "titleReq": "densetsu",
    "questReq": "eq_yuusha",
    "masterReq": [
      "odachi"
    ],
    "desc": "特殊職。剣の道を極め、里の伝説となった者",
    "master": {
      "id": "questGold",
      "value": 0.25,
      "label": "任務報酬金 +25%"
    }
  },
  "genjuukishi": {
    "name": "幻獣騎士",
    "tier": 6,
    "line": "melee",
    "atk": 110,
    "cd": 1000,
    "kb": 0.85,
    "strong": "flyer",
    "color": "#2E7A78",
    "titleReq": "jushi",
    "questReq": "eq_genjuu",
    "masterReq": [
      "karyudo"
    ],
    "desc": "特殊職。幻の獣と心を通わせ、共に駆ける狩人の到達点",
    "master": {
      "id": "trainExp",
      "value": 0.35,
      "label": "修行経験値 +35%"
    }
  },
  "dokuyashi": {
    "name": "毒矢師",
    "tier": 2,
    "line": "ranged",
    "atk": 20,
    "cd": 1150,
    "poison": 8,
    "color": "#4F7A2E",
    "from": [
      "shashu"
    ],
    "desc": "矢に毒を塗り、当てた敵を時間差でじわじわ削る",
    "master": {
      "id": "trainGreat",
      "value": 0.03,
      "label": "修行の大成功率 +3%"
    },
    "examReq": "exam_shashu"
  },
  "douchi": {
    "name": "銅鑼打ち",
    "tier": 2,
    "line": "support",
    "atk": 7,
    "cd": 1300,
    "kb": 0.4,
    "color": "#B8895A",
    "from": [
      "kagura"
    ],
    "desc": "太鼓と銅鑼の音で敵をひるませつつ後方を支える",
    "master": {
      "id": "trainExp",
      "value": 0.1,
      "label": "修行経験値 +10%"
    },
    "examReq": "exam_kagura"
  },
  "onmyouji": {
    "name": "陰陽頭",
    "tier": 6,
    "line": "magic",
    "atk": 108,
    "cd": 1000,
    "stun": 750,
    "color": "#5A3D8C",
    "titleReq": "onmyou",
    "questReq": "eq_onmyou",
    "masterReq": [
      "daionmyo"
    ],
    "desc": "特殊職。陰と陽、氷と炎の理を統べ、あらゆる怪異を祓う",
    "master": {
      "id": "legendGain",
      "value": 0.3,
      "label": "伝説度獲得 +30%"
    }
  }
},"maps":{
    "sato":  {
                 "name":  "里の一本道",
                 "cols":  13,
                 "rows":  9,
                 "path":  [
                              [
                                  0,
                                  4
                              ],
                              [
                                  1,
                                  4
                              ],
                              [
                                  2,
                                  4
                              ],
                              [
                                  3,
                                  4
                              ],
                              [
                                  4,
                                  4
                              ],
                              [
                                  5,
                                  4
                              ],
                              [
                                  6,
                                  4
                              ],
                              [
                                  7,
                                  4
                              ],
                              [
                                  8,
                                  4
                              ],
                              [
                                  9,
                                  4
                              ],
                              [
                                  10,
                                  4
                              ],
                              [
                                  11,
                                  4
                              ],
                              [
                                  12,
                                  4
                              ]
                          ]
             },
    "tanida":  {
                   "name":  "谷戸の一本道",
                   "cols":  13,
                   "rows":  9,
                   "path":  [
                                [
                                    0,
                                    4
                                ],
                                [
                                    1,
                                    4
                                ],
                                [
                                    2,
                                    4
                                ],
                                [
                                    3,
                                    4
                                ],
                                [
                                    4,
                                    4
                                ],
                                [
                                    5,
                                    4
                                ],
                                [
                                    6,
                                    4
                                ],
                                [
                                    7,
                                    4
                                ],
                                [
                                    8,
                                    4
                                ],
                                [
                                    9,
                                    4
                                ],
                                [
                                    10,
                                    4
                                ],
                                [
                                    11,
                                    4
                                ],
                                [
                                    12,
                                    4
                                ]
                            ]
               },
    "yamaji":  {
                   "name":  "山路の一本道",
                   "cols":  13,
                   "rows":  9,
                   "path":  [
                                [
                                    0,
                                    4
                                ],
                                [
                                    1,
                                    4
                                ],
                                [
                                    2,
                                    4
                                ],
                                [
                                    3,
                                    4
                                ],
                                [
                                    4,
                                    4
                                ],
                                [
                                    5,
                                    4
                                ],
                                [
                                    6,
                                    4
                                ],
                                [
                                    7,
                                    4
                                ],
                                [
                                    8,
                                    4
                                ],
                                [
                                    9,
                                    4
                                ],
                                [
                                    10,
                                    4
                                ],
                                [
                                    11,
                                    4
                                ],
                                [
                                    12,
                                    4
                                ]
                            ]
               }
},"quests":[
  {
    "id": "q01",
    "name": "夜明け前の防衛線",
    "map": "sato",
    "difficulty": 1,
    "lives": 1,
    "reward": {
      "gold": 120,
      "jobExp": 90,
      "legendScore": 10
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "kogami",
            "count": 5,
            "gap": 1800
          },
          {
            "enemy": "ooari",
            "count": 2,
            "gap": 1900,
            "delay": 6200
          }
        ]
      }
    ]
  },
  {
    "id": "q02",
    "name": "空渡る影",
    "map": "sato",
    "difficulty": 2,
    "lives": 1,
    "reward": {
      "gold": 170,
      "jobExp": 130,
      "legendScore": 20
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "tengugarasu",
            "count": 5,
            "gap": 1500
          },
          {
            "enemy": "kogami",
            "count": 3,
            "gap": 1700,
            "delay": 5000
          }
        ]
      }
    ]
  },
  {
    "id": "q03",
    "name": "鉄鼠の進軍",
    "map": "tanida",
    "difficulty": 3,
    "lives": 1,
    "reward": {
      "gold": 230,
      "jobExp": 190,
      "legendScore": 30
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "kanenezumi",
            "count": 5,
            "gap": 1750
          },
          {
            "enemy": "ooari",
            "count": 3,
            "gap": 1500,
            "delay": 4400
          }
        ]
      }
    ]
  },
  {
    "id": "q04",
    "name": "疾風を押し返せ",
    "map": "tanida",
    "difficulty": 4,
    "lives": 1,
    "reward": {
      "gold": 300,
      "jobExp": 260,
      "legendScore": 40
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "hayaitachi",
            "count": 8,
            "gap": 900
          },
          {
            "enemy": "tsuchigumo",
            "count": 2,
            "gap": 2300,
            "delay": 4300
          }
        ]
      }
    ]
  },
  {
    "id": "q05",
    "name": "癒しの森を断て",
    "map": "yamaji",
    "difficulty": 5,
    "lives": 1,
    "reward": {
      "gold": 380,
      "jobExp": 340,
      "legendScore": 50
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "iyashikodama",
            "count": 5,
            "gap": 1650
          },
          {
            "enemy": "bakeneko",
            "count": 3,
            "gap": 1500,
            "delay": 5000
          }
        ]
      }
    ]
  },
  {
    "id": "q06",
    "name": "結界を砕く夜",
    "map": "yamaji",
    "difficulty": 6,
    "lives": 1,
    "reward": {
      "gold": 470,
      "jobExp": 440,
      "legendScore": 60
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "kekkaiwarashi",
            "count": 5,
            "gap": 1700
          },
          {
            "enemy": "kanenezumi",
            "count": 3,
            "gap": 1850,
            "delay": 5200
          }
        ]
      }
    ]
  },
  {
    "id": "q07",
    "name": "返り牙の獣道",
    "map": "yamaji",
    "difficulty": 7,
    "lives": 1,
    "reward": {
      "gold": 580,
      "jobExp": 580,
      "legendScore": 70
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "kaeriinoshishi",
            "count": 6,
            "gap": 1900
          },
          {
            "enemy": "hayaitachi",
            "count": 3,
            "gap": 1000,
            "delay": 6600
          }
        ]
      }
    ]
  },
  {
    "id": "q08",
    "name": "毒を喰らうもの",
    "map": "tanida",
    "difficulty": 8,
    "lives": 1,
    "reward": {
      "gold": 720,
      "jobExp": 760,
      "legendScore": 80
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "dokugaeru",
            "count": 7,
            "gap": 1450
          },
          {
            "enemy": "kagebozu",
            "count": 3,
            "gap": 1700,
            "delay": 5800
          }
        ]
      }
    ]
  },
  {
    "id": "q09",
    "name": "石鎧の行列",
    "map": "sato",
    "difficulty": 9,
    "lives": 1,
    "reward": {
      "gold": 920,
      "jobExp": 1000,
      "legendScore": 90
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "ishigame",
            "count": 9,
            "gap": 1300
          },
          {
            "enemy": "tengugarasu",
            "count": 3,
            "gap": 1350,
            "delay": 7600
          }
        ]
      }
    ]
  },
  {
    "id": "q10",
    "name": "百鬼、里へ還る",
    "map": "yamaji",
    "difficulty": 10,
    "lives": 1,
    "reward": {
      "gold": 1250,
      "jobExp": 1350,
      "legendScore": 120
    },
    "waves": [
      {
        "boss": true,
        "spawns": [
          {
            "enemy": "kekkaiwarashi",
            "count": 2,
            "gap": 1800
          },
          {
            "enemy": "iyashikodama",
            "count": 2,
            "gap": 1900,
            "delay": 3500
          },
          {
            "enemy": "kaeriinoshishi",
            "count": 2,
            "gap": 2200,
            "delay": 7200
          },
          {
            "enemy": "dokugaeru",
            "count": 2,
            "gap": 1500,
            "delay": 11000
          },
          {
            "enemy": "ishigame",
            "count": 4,
            "gap": 1000,
            "delay": 13800
          },
          {
            "enemy": "boss_nue",
            "count": 1,
            "gap": 0,
            "delay": 18500
          }
        ]
      }
    ]
  },
  {
    "id": "exam_ashigaru",
    "name": "剣士転職試験",
    "map": "sato",
    "difficulty": 2,
    "isExam": true,
    "lives": 5,
    "reward": {
      "gold": 150,
      "jobExp": 0,
      "legendScore": 5
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "kogami",
            "count": 6,
            "gap": 700
          },
          {
            "enemy": "ooari",
            "count": 3,
            "gap": 900,
            "delay": 3500
          }
        ]
      }
    ]
  },
  {
    "id": "exam_shashu",
    "name": "弓使い転職試験",
    "map": "sato",
    "difficulty": 2,
    "isExam": true,
    "lives": 5,
    "reward": {
      "gold": 150,
      "jobExp": 0,
      "legendScore": 5
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "tengugarasu",
            "count": 5,
            "gap": 750
          },
          {
            "enemy": "hayaitachi",
            "count": 3,
            "gap": 700,
            "delay": 3000
          }
        ]
      }
    ]
  },
  {
    "id": "exam_jumi",
    "name": "忍び転職試験",
    "map": "tanida",
    "difficulty": 2,
    "isExam": true,
    "lives": 5,
    "reward": {
      "gold": 150,
      "jobExp": 0,
      "legendScore": 5
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "ooari",
            "count": 5,
            "gap": 700
          },
          {
            "enemy": "hayaitachi",
            "count": 4,
            "gap": 600,
            "delay": 2800
          }
        ]
      }
    ]
  },
  {
    "id": "exam_kagura",
    "name": "旅芸人転職試験",
    "map": "tanida",
    "difficulty": 2,
    "isExam": true,
    "lives": 5,
    "reward": {
      "gold": 150,
      "jobExp": 0,
      "legendScore": 5
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "kogami",
            "count": 5,
            "gap": 750
          },
          {
            "enemy": "bakeneko",
            "count": 3,
            "gap": 900,
            "delay": 3200
          }
        ]
      }
    ]
  },
  {
    "id": "eq_kakuri",
    "name": "隠里の守人選抜試験",
    "map": "yamaji",
    "difficulty": 7,
    "isExam": true,
    "lives": 5,
    "reward": {
      "gold": 400,
      "jobExp": 0,
      "legendScore": 40
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "koramusha",
            "count": 3,
            "gap": 900
          },
          {
            "enemy": "kagebozu",
            "count": 2,
            "gap": 1000,
            "delay": 2600
          }
        ]
      },
      {
        "spawns": [
          {
            "enemy": "kanenezumi",
            "count": 3,
            "gap": 800
          },
          {
            "enemy": "yamabiko",
            "count": 2,
            "gap": 900,
            "delay": 2400
          }
        ]
      },
      {
        "boss": true,
        "spawns": [
          {
            "enemy": "boss_nue",
            "count": 1,
            "gap": 0
          }
        ]
      }
    ]
  },
  {
    "id": "eq_hyakki",
    "name": "白狐降臨の儀",
    "map": "yamaji",
    "difficulty": 7,
    "isExam": true,
    "lives": 5,
    "reward": {
      "gold": 400,
      "jobExp": 0,
      "legendScore": 40
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "bakeneko",
            "count": 3,
            "gap": 900
          },
          {
            "enemy": "kagebozu",
            "count": 2,
            "gap": 1000,
            "delay": 2600
          }
        ]
      },
      {
        "spawns": [
          {
            "enemy": "yamabiko",
            "count": 3,
            "gap": 900
          },
          {
            "enemy": "tsuchigumo",
            "count": 2,
            "gap": 1200,
            "delay": 2400
          }
        ]
      },
      {
        "boss": true,
        "spawns": [
          {
            "enemy": "boss_nue",
            "count": 1,
            "gap": 0
          }
        ]
      }
    ]
  },
  {
    "id": "eq_yuusha",
    "name": "剣の頂",
    "map": "sato",
    "difficulty": 10,
    "isExam": true,
    "lives": 5,
    "reward": {
      "gold": 1000,
      "jobExp": 0,
      "legendScore": 100
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "hayaitachi",
            "count": 4,
            "gap": 500
          },
          {
            "enemy": "kanenezumi",
            "count": 3,
            "gap": 800,
            "delay": 2000
          }
        ]
      },
      {
        "spawns": [
          {
            "enemy": "bakeneko",
            "count": 3,
            "gap": 700
          },
          {
            "enemy": "koramusha",
            "count": 3,
            "gap": 900,
            "delay": 2500
          }
        ]
      },
      {
        "boss": true,
        "spawns": [
          {
            "enemy": "boss_oomukade",
            "count": 1,
            "gap": 0
          },
          {
            "enemy": "boss_nue",
            "count": 1,
            "gap": 0,
            "delay": 3000
          },
          {
            "enemy": "boss_tetsuoni",
            "count": 1,
            "gap": 0,
            "delay": 6000
          }
        ]
      }
    ]
  },
  {
    "id": "eq_genjuu",
    "name": "幻獣招来の儀",
    "map": "yamaji",
    "difficulty": 8,
    "isExam": true,
    "lives": 5,
    "reward": {
      "gold": 500,
      "jobExp": 0,
      "legendScore": 50
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "tengugarasu",
            "count": 3,
            "gap": 800
          },
          {
            "enemy": "hayaitachi",
            "count": 3,
            "gap": 600,
            "delay": 2200
          }
        ]
      },
      {
        "spawns": [
          {
            "enemy": "yamabiko",
            "count": 3,
            "gap": 900
          },
          {
            "enemy": "tengugarasu",
            "count": 2,
            "gap": 800,
            "delay": 2400
          }
        ]
      },
      {
        "boss": true,
        "spawns": [
          {
            "enemy": "boss_nue",
            "count": 1,
            "gap": 0
          }
        ]
      }
    ]
  },
  {
    "id": "eq_onmyou",
    "name": "陰陽秘儀の関門",
    "map": "yamaji",
    "difficulty": 9,
    "isExam": true,
    "lives": 5,
    "reward": {
      "gold": 700,
      "jobExp": 0,
      "legendScore": 70
    },
    "waves": [
      {
        "spawns": [
          {
            "enemy": "bakeneko",
            "count": 4,
            "gap": 800
          },
          {
            "enemy": "kagebozu",
            "count": 3,
            "gap": 900,
            "delay": 2600
          }
        ]
      },
      {
        "spawns": [
          {
            "enemy": "yamabiko",
            "count": 3,
            "gap": 900
          },
          {
            "enemy": "kanenezumi",
            "count": 3,
            "gap": 850,
            "delay": 2400
          }
        ]
      },
      {
        "boss": true,
        "spawns": [
          {
            "enemy": "boss_nue",
            "count": 1,
            "gap": 0
          },
          {
            "enemy": "bakeneko",
            "count": 2,
            "gap": 1000,
            "delay": 4000
          }
        ]
      }
    ]
  }
]};