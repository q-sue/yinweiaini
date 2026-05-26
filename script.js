const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

const state = {
  activeView: "coach",
  dialect: "mandarin",
  lastLyrics: "",
  lastBlessing: "小云，愿你的歌声像清晨的山风，带着勇气和光。",
  mediaRecorder: null,
  chunks: [],
  audioContext: null,
  currentMelody: null,
  feedbackRound: 0,
};

const plans = {
  starter: [
    ["暖声小台阶", "哼鸣 3 分钟，找到轻轻的头声"],
    ["入门曲目", "《小星星》齐唱两遍，第二遍放慢"],
    ["节奏游戏", "四拍一次拍手，跟着节拍器走"],
    ["打卡作业", "录 30 秒最稳定的一句"],
  ],
  growing: [
    ["气息接力", "四拍吸气，六拍唱长音"],
    ["进阶曲目", "《让我们荡起双桨》二声部跟唱"],
    ["咬字训练", "慢读歌词，再按原速演唱"],
    ["打卡作业", "提交高低声部各 20 秒"],
  ],
  lead: [
    ["领唱稳定", "主旋律完整演唱一遍"],
    ["声部校准", "带同学练习二声部入口"],
    ["舞台表达", "设计 2 个简单队形动作"],
    ["打卡作业", "录制 1 分钟排练示范"],
  ],
};

const focusLabels = {
  pitch: "音准",
  rhythm: "节奏",
  diction: "咬字",
  breath: "气息",
};

const linePool = [
  "第一句开头像清晨推开窗",
  "第二句的长音像山谷回声",
  "第三句的歌词像小溪往前跑",
  "副歌进来的地方像小伙伴排队",
  "结尾这一拍像星星慢慢落下",
  "换气前的两个字像轻轻敲门",
  "高声部抬起来的地方很有光",
  "低声部托住旋律的地方很温柔",
  "重复句第二遍比第一遍更勇敢",
  "最后收声像把声音放回手心",
];

const childPraise = [
  "这句像小鸟唱歌超好听",
  "声音像早上的太阳，一下子亮起来了",
  "你把这句唱得像小溪一样清清的",
  "这一句很像小火车开稳了，队伍很齐",
  "这个开头像星星眨眼，很轻也很亮",
  "你今天的声音有小铃铛的感觉",
  "这句一出来，像山谷里有回声在抱你",
  "这一拍很勇敢，像小旗子被风吹起来",
  "你把歌词唱出了笑脸",
  "这个长音站得稳稳的，像小树扎住根",
];

const focusTips = {
  pitch: [
    "把第一个音轻轻抬高一点，像踮脚摘星星。",
    "先听一遍示范再开口，音会更容易站住。",
    "高音不要喊，像把声音放到头顶的小帽子上。",
    "低音别掉太快，慢慢落下来会更暖。",
    "这句先用“啦”唱一遍，再换成歌词。",
  ],
  rhythm: [
    "再慢半拍，队伍会像小火车一样稳。",
    "遇到短音先拍拍手，再唱就不会跑太快。",
    "把脚步放轻，心里数一二三四。",
    "第二小节别急着冲，等同伴一起进来。",
    "先用 72 BPM 练两遍，再回到原速。",
  ],
  diction: [
    "把最后一个字唱圆一点，老师就能听见笑脸。",
    "“山”和“星”的尾巴轻轻收住，不要一下子丢掉。",
    "先像讲故事一样读清楚，再唱会更自然。",
    "嘴巴打开一点点，字就会像小灯一样亮。",
    "每个字都别挤，留一点空气给它。",
  ],
  breath: [
    "换气像闻花香，轻轻吸，不要耸肩。",
    "长句前先准备一口小气，别等快没气了再补。",
    "唱完别马上放松，尾音托住一小会儿。",
    "把气息想成一条细线，慢慢往前送。",
    "这一句可以在逗号前偷偷换一口气。",
  ],
};

const yunnanTips = [
  "莫慌，慢慢唱，声音会更稳呢。",
  "这一拍稳住点，像走山路一样一步一步来。",
  "尾音收圆点，会更亲切、更好听。",
  "先轻轻唱一遍，再放开唱，莫一下子冲出去。",
  "这个字咬清楚点，同伴就更容易跟上。",
];

const summaryOpeners = [
  "AI 老师听完啦：",
  "这一遍有进步：",
  "今天的声音很认真：",
  "这段练唱已经很有样子：",
  "我听见你在努力控制声音：",
];

const keywordFallback = ["大山", "星星", "妈妈", "学校", "梯田", "伙伴"];

const lyricImages = {
  nature: ["山风", "小河", "梯田", "云朵", "月光", "竹林", "花香", "晨雾"],
  school: ["铃声", "书包", "操场", "黑板", "课桌", "小路", "校门", "红旗"],
  family: ["妈妈", "爸爸", "奶奶", "家门", "晚饭", "灯光", "手心", "窗前"],
  dream: ["愿望", "勇气", "星光", "明天", "翅膀", "远方", "笑脸", "掌声"],
};

const lyricBuilders = [
  ({ a, b, c, d, place, warm }) => `${a}轻轻醒来，${b}落在${place}旁`,
  ({ a, b, c, d, place, warm }) => `${c}在窗前笑，听我把${d}唱亮`,
  ({ a, b, c, d, place, warm }) => `${place}的小路弯又弯，我们排队去歌唱`,
  ({ a, b, c, d, place, warm }) => `${warm}抱着小书包，把心愿放进合唱`,
  ({ a, b, c, d, place, warm }) => `${b}眨呀眨，陪我练到月亮上`,
  ({ a, b, c, d, place, warm }) => `${a}有回声，告诉我别怕、慢慢唱`,
  ({ a, b, c, d, place, warm }) => `${d}响起来，高声部像风一样飞翔`,
  ({ a, b, c, d, place, warm }) => `${c}说我很勇敢，明天还要更明亮`,
  ({ a, b, c, d, place, warm }) => `伙伴牵着手，把${a}和${b}唱成光`,
  ({ a, b, c, d, place, warm }) => `低声部轻轻托，高声部稳稳往上`,
];

const melodyPatterns = [
  {
    mood: "温暖",
    jianpu: "1 2 3 5 | 5 6 5 - | 3 2 1 2 | 3 - - -",
    low: "5, 6, 1 3 | 3 4 3 - | 1 7, 6, 7, | 1 - - -",
    chords: "C · G · Am · F",
    notes: [261.63, 293.66, 329.63, 392, 392, 440, 392, 329.63, 293.66, 261.63, 293.66, 329.63],
  },
  {
    mood: "明亮",
    jianpu: "3 5 6 5 | 3 2 1 - | 1 2 3 5 | 6 - 5 -",
    low: "1 3 4 3 | 1 7, 6, - | 6, 7, 1 3 | 4 - 3 -",
    chords: "Am · F · C · G",
    notes: [329.63, 392, 440, 392, 329.63, 293.66, 261.63, 261.63, 293.66, 329.63, 392, 440, 392],
  },
  {
    mood: "安静",
    jianpu: "5 6 1 2 | 3 2 1 6 | 5 - 1 - | 2 3 1 -",
    low: "3 4 5 6 | 1 6, 5, 4, | 3, - 5, - | 6, 1 5, -",
    chords: "G · Em · C · D",
    notes: [392, 440, 523.25, 587.33, 659.25, 587.33, 523.25, 440, 392, 523.25, 587.33, 659.25, 523.25],
  },
  {
    mood: "轻快",
    jianpu: "1 3 5 6 | 5 3 2 - | 2 3 5 3 | 1 - - -",
    low: "5, 1 3 4 | 3 1 7, - | 7, 1 3 1 | 5, - - -",
    chords: "C · F · G · C",
    notes: [261.63, 329.63, 392, 440, 392, 329.63, 293.66, 293.66, 329.63, 392, 329.63, 261.63],
  },
];

const nurserySongs = {
  twinkle: {
    title: "小星星",
    tag: "入门齐唱",
    info: "适合入门齐唱，音域窄，孩子容易跟唱。",
    jianpu: "1 1 5 5 | 6 6 5 - | 4 4 3 3 | 2 2 1 -",
    chords: "C · F · C · G",
    low: "5, 5, 1 1 | 4 4 1 - | 2 2 1 1 | 5, 5, 1 -",
    notes: [523.25, 523.25, 783.99, 783.99, 880, 880, 783.99, 698.46, 698.46, 659.25, 659.25, 587.33, 587.33, 523.25],
  },
  frere: {
    title: "两只老虎",
    tag: "轮唱练习",
    info: "适合做轮唱入口，第二组可以晚两小节进入。",
    jianpu: "1 2 3 1 | 1 2 3 1 | 3 4 5 - | 3 4 5 -",
    chords: "C · G · C · G",
    low: "5, 5, 1 5, | 5, 5, 1 5, | 1 2 3 - | 1 2 3 -",
    notes: [523.25, 587.33, 659.25, 523.25, 523.25, 587.33, 659.25, 523.25, 659.25, 698.46, 783.99, 659.25, 698.46, 783.99],
  },
  ode: {
    title: "欢乐颂",
    tag: "明亮合唱",
    info: "适合练整齐进入和结尾收声，旋律线清楚。",
    jianpu: "3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 3 2 2 -",
    chords: "C · G · Am · G",
    low: "1 1 2 3 | 3 2 1 7, | 6, 6, 7, 1 | 1 7, 7, -",
    notes: [659.25, 659.25, 698.46, 783.99, 783.99, 698.46, 659.25, 587.33, 523.25, 523.25, 587.33, 659.25, 659.25, 587.33, 587.33],
  },
  mary: {
    title: "玛丽有只小羊羔",
    tag: "轻快童声",
    info: "适合练轻快咬字，短音清楚，节奏不拖。",
    jianpu: "3 2 1 2 | 3 3 3 - | 2 2 2 - | 3 5 5 -",
    chords: "C · G · C · G",
    low: "1 7, 6, 7, | 1 1 1 - | 7, 7, 7, - | 1 3 3 -",
    notes: [659.25, 587.33, 523.25, 587.33, 659.25, 659.25, 659.25, 587.33, 587.33, 587.33, 659.25, 783.99, 783.99],
  },
};

const arrangementIdeas = [
  "第一句全员齐唱，身体面向观众，双手从胸前轻轻打开。",
  "第二句高声部唱主旋律，低声部在弱拍进入，音量保持柔和。",
  "第三句加入左右踏步，队形从一排变成浅弧形。",
  "副歌第一遍小声唱，第二遍打开音量，让孩子听见层次。",
  "结尾全员看向指挥，尾音收在同一拍，动作回到胸前。",
  "低声部先由两名稳定孩子带入，其他同学轻轻跟上。",
  "唱到“星星”时抬头，唱到“妈妈”时手放胸前，动作简单不抢歌声。",
  "中间留半拍安静，让下一句进来更整齐。",
];

const moodLabels = {
  1: "有点难过",
  2: "有些累",
  3: "平平稳稳",
  4: "有一点开心",
  5: "很有力量",
};

const companionBanks = {
  school: {
    hear: [
      "我听见你今天有点不想上学，这句话说出来已经很勇敢。",
      "有时候上学像爬一段山路，会累，也会想停一下。",
      "你不是坏孩子，只是今天心里有点重。",
    ],
    step: [
      "我们先把目标变小：明天只完成一件事，进教室后先和一个同学打招呼。",
      "今晚先唱一句最喜欢的旋律，让心慢慢回到身体里。",
      "如果明天还是很难受，可以把这句话告诉老师或家里大人，让他们陪你一起想办法。",
    ],
  },
  tired: {
    hear: [
      "累的时候还愿意练一会儿，说明你已经很努力了。",
      "今天的你不用很厉害，能慢慢说出来就很好。",
      "身体累了，声音也会想休息，这很正常。",
    ],
    step: [
      "先喝口水，唱三拍就停一下，别逼自己一口气唱完。",
      "我们把练习改成轻轻哼唱，像给自己盖一条小毯子。",
      "今天只保留最稳的一句，成长报告也会记住这一步。",
    ],
  },
  stage: {
    hear: [
      "紧张说明你很在乎这次表演。",
      "上台前心跳快，不代表你唱不好，只是身体在准备。",
      "你可以害怕，也可以一边害怕一边唱完。",
    ],
    step: [
      "上台前先看指挥，再吸一口小小的气，第一句轻轻开始。",
      "把脚站稳，想象同伴的声音在旁边托着你。",
      "不需要最大声，只要真诚、整齐，就会被听见。",
    ],
  },
  family: {
    hear: [
      "想妈妈、想家，说明你心里有很柔软的地方。",
      "把想念说出来，不会让你变脆弱，反而会让歌更温暖。",
      "有些话不好直接说，可以先放进歌里。",
    ],
    step: [
      "我们把这份想念写成一句歌词，唱出来时心会轻一点。",
      "等你练好，可以把最温柔的一句唱给家里人听。",
      "今晚睡前轻轻哼一遍，把想说的话放在旋律里。",
    ],
  },
  default: {
    hear: [
      "我听见了，你愿意说出来就很重要。",
      "这件事可能不大，但它在你心里是真实的。",
      "谢谢你把心里的小声音交给我听。",
    ],
    step: [
      "我们先唱一句慢的，把心里的结松开一点。",
      "给自己一点掌声，明天再往前走一小步。",
      "如果这件事一直让你难受，记得找老师或家里大人一起聊聊。",
    ],
  },
};

const blessingCopy = {
  birthday: [
    "{name}，生日快乐。愿你的歌声像清晨的山风，吹亮新一岁的勇气。",
    "{name}，今天的祝福只唱给你。愿你每长大一岁，都更敢把心里的旋律唱出来。",
    "{name}，愿生日蜡烛像小星星，照着你在合唱里稳稳发光。",
  ],
  children: [
    "{name}，六一快乐。愿你的童声像山间清泉，和伙伴们一起唱到云朵边。",
    "{name}，今天把快乐唱大声一点，让学校、操场和小路都听见你。",
    "{name}，愿你一直有唱歌的自由，也有被认真听见的快乐。",
  ],
  graduation: [
    "{name}，毕业不是结束，是下一首歌的前奏。把勇气带上，新学校也会听见你。",
    "{name}，愿这段合唱记忆像一颗星，陪你走到更远的地方。",
    "{name}，今天把告别唱温柔，把明天唱明亮。",
  ],
};

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function hashText(text) {
  return [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3200);
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function speak(text, rate = 0.95, pitch = 1.12) {
  if (!("speechSynthesis" in window)) {
    showToast("当前浏览器不支持语音朗读");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = rate;
  utterance.pitch = pitch;
  window.speechSynthesis.speak(utterance);
}

function setView(view, updateHash = true) {
  const valid = ["coach", "studio", "explore", "library", "rehearsal", "treehole", "report", "volunteer"];
  const next = valid.includes(view) ? view : "coach";
  state.activeView = next;

  $$("[data-view]").forEach((section) => {
    section.classList.toggle("view-active", section.dataset.view === next);
  });
  $$(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.hash === `#${next}`);
  });

  if (updateHash && location.hash !== `#${next}`) {
    history.pushState(null, "", `#${next}`);
  }
  window.scrollTo({ top: 0, behavior: "auto" });
  window.setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 40);
  if (next === "coach") window.setTimeout(drawHeroCanvas, 80);
}

function setDialect(dialect) {
  state.dialect = dialect;
  $$("[data-dialect]").forEach((button) => {
    button.classList.toggle("active", button.dataset.dialect === dialect);
  });
  const intro =
    dialect === "yunnan"
      ? "已切换云南方言陪练。AI 老师会说得更亲切：莫慌，慢慢唱，声音会更稳呢。"
      : "已切换普通话陪练。AI 老师会逐句听音准、节奏和咬字。";
  $("#coachMessage").textContent = intro;
  showToast(intro);
}

function randomScore(min, max, salt = 0) {
  return Math.max(min, Math.min(max, Math.round(min + Math.random() * (max - min) + salt)));
}

function chooseFocus(scores, index) {
  const entries = [
    ["pitch", scores.pitch],
    ["rhythm", scores.rhythm],
    ["diction", scores.diction],
    ["breath", scores.breath],
  ].sort((a, b) => a[1] - b[1]);
  return entries[index % entries.length][0];
}

function buildSentenceFeedback(scores) {
  const lines = shuffle(linePool).slice(0, 4);
  return lines.map((line, index) => {
    const focus = chooseFocus(scores, index);
    const text = `${pick(childPraise)}，${line}。`;
    const tip = state.dialect === "yunnan" && index % 2 === 1 ? pick(yunnanTips) : pick(focusTips[focus]);
    return {
      line: `第 ${index + 1} 句`,
      focus,
      text,
      tip,
      score: Math.max(72, Math.min(98, scores[focus] + randomScore(-3, 4))),
    };
  });
}

function analyzePractice(sourceLabel = "练唱片段") {
  state.feedbackRound += 1;
  const base = hashText(`${sourceLabel}-${state.feedbackRound}-${Date.now()}`);
  const pitch = randomScore(78, 96, base % 3);
  const rhythm = randomScore(72, 94, (base % 5) - 2);
  const diction = randomScore(80, 97, (base % 4) - 1);
  const breath = randomScore(74, 95, (base % 6) - 3);
  const scores = { pitch, rhythm, diction, breath };

  $("#pitchScore").textContent = `${pitch}`;
  $("#rhythmScore").textContent = `${rhythm}`;
  $("#dictionScore").textContent = `${diction}`;
  $("#todayMinutes").textContent = `${Number($("#todayMinutes").textContent) + 3}`;
  $(".waveform").classList.remove("paused");

  const weakest = chooseFocus(scores, 0);
  const summary =
    state.dialect === "yunnan"
      ? `${pick(summaryOpeners)}${pick(childPraise)}。${pick(yunnanTips)}重点听 ${focusLabels[weakest]}，下一遍会更稳。`
      : `${pick(summaryOpeners)}${pick(childPraise)}！${pick(focusTips[weakest])}下一遍重点照顾 ${focusLabels[weakest]}。`;
  $("#coachMessage").textContent = summary;
  speak(summary, 0.94, 1.18);

  $("#sentenceList").innerHTML = buildSentenceFeedback(scores)
    .map(
      (item) => `
        <article class="sentence-card">
          <strong>${item.line} · ${focusLabels[item.focus]} <span>${item.score}</span></strong>
          <p>${item.text}</p>
          <p>${item.tip}</p>
        </article>
      `,
    )
    .join("");

  showToast("AI 已生成新的逐句点评");
}

async function toggleRecording() {
  const button = $("#recordPractice");
  const status = $("#recordStatus");
  if (state.mediaRecorder && state.mediaRecorder.state === "recording") {
    state.mediaRecorder.stop();
    button.innerHTML = `<i data-lucide="radio" aria-hidden="true"></i><span>录一段</span>`;
    refreshIcons();
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    status.textContent = "当前浏览器不支持录音，可直接上传文件。";
    showToast("无法调用麦克风");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.chunks = [];
    state.mediaRecorder = new MediaRecorder(stream);
    state.mediaRecorder.ondataavailable = (event) => state.chunks.push(event.data);
    state.mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      status.textContent = "已录好一段练唱，可点 AI 点评。";
      analyzePractice("实时录音");
    };
    state.mediaRecorder.start();
    status.textContent = "正在录音，唱完后再点一次停止。";
    button.innerHTML = `<i data-lucide="square" aria-hidden="true"></i><span>停止</span>`;
    refreshIcons();
  } catch {
    status.textContent = "麦克风权限未开启，可直接上传文件。";
    showToast("麦克风权限未开启");
  }
}

function renderPlan(level = $("#levelSelect").value) {
  $("#planList").innerHTML = plans[level]
    .map(
      ([title, detail], index) => `
        <label class="plan-item">
          <input type="checkbox" ${index < 1 ? "checked" : ""} />
          <span><strong>${title}</strong><br />${detail}</span>
          <i data-lucide="${index < 1 ? "check-circle-2" : "circle"}" aria-hidden="true"></i>
        </label>
      `,
    )
    .join("");
  refreshIcons();
}

async function setReminder() {
  const time = $("#reminderTime").value || "19:30";
  localStorage.setItem("choirReminder", time);
  $("#reminderStatus").textContent = `已设置每日 ${time} 打卡提醒`;
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("音为爱你合唱教室", { body: `已设置每日 ${time} 练唱打卡。` });
  }
  showToast(`已设置 ${time} 打卡提醒`);
}

function getKeywords() {
  return $("#keywordInput")
    .value.split(/[、,，;；\s]+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function inferTheme(words) {
  const text = words.join("");
  if (/妈妈|爸爸|奶奶|爷爷|家|想家/.test(text)) return "family";
  if (/学校|老师|书包|课堂|操场|同学/.test(text)) return "school";
  if (/梦想|未来|勇气|远方|毕业|星光/.test(text)) return "dream";
  return "nature";
}

function normalizeKeywords(words) {
  const keywords = words.length ? [...words] : [...keywordFallback];
  while (keywords.length < 6) {
    const next = keywordFallback.find((word) => !keywords.includes(word)) || pick(keywordFallback);
    keywords.push(next);
  }
  return keywords.slice(0, 6);
}

function generateLyrics(event) {
  event?.preventDefault();
  const keywords = normalizeKeywords(getKeywords());
  const theme = inferTheme(keywords);
  const context = {
    a: keywords[0],
    b: keywords[1],
    c: keywords[2],
    d: keywords[3],
    place: pick(lyricImages.school.concat(lyricImages.nature)),
    warm: pick(lyricImages[theme]),
  };
  const chosenBuilders = shuffle(lyricBuilders).slice(0, 6);
  const title = `《${keywords[0]}把${keywords[1]}唱亮》`;
  const lyrics = [
    title,
    "童声齐唱：",
    ...chosenBuilders.slice(0, 3).map((builder) => builder(context)),
    "二声部进入：",
    ...chosenBuilders.slice(3).map((builder) => builder(context)),
  ].join("\n");

  state.lastLyrics = lyrics;
  $("#lyricsText").textContent = lyrics;
  generateMelody(keywords, theme);
  showToast("歌词、旋律和合唱编排已重新生成");
}

function generateMelody(keywords, theme = inferTheme(keywords)) {
  const styleIndex = { warm: 0, bright: 1, quiet: 2, march: 3 };
  const style = $("#styleSelect")?.value;
  const selected =
    melodyPatterns[styleIndex[style] ?? ((hashText(keywords.join("")) + theme.length) % melodyPatterns.length)];
  state.currentMelody = selected;
  $("#jianpuLine").textContent = selected.jianpu;
  $("#chordLine").textContent = `${selected.chords} · ${selected.mood}童声`;
  $("#voiceMap").innerHTML = `
    <span>高声部：${selected.jianpu}</span>
    <span>低声部：${selected.low}</span>
  `;
  $("#arrangementList").innerHTML = shuffle(arrangementIdeas)
    .slice(0, 4)
    .map((idea) => `<li>${idea}</li>`)
    .join("");
}

function getSampleSong() {
  const key = $("#sampleSongSelect")?.value || "twinkle";
  return nurserySongs[key] || nurserySongs.twinkle;
}

function updateSampleSongInfo() {
  const song = getSampleSong();
  $("#sampleSongInfo").innerHTML = `
    <strong>${song.title} · ${song.tag}</strong>
    <span>${song.info}</span>
  `;
}

function playTone(ctx, frequency, start, duration, gainValue, type = "sine") {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function playNurserySong(song = getSampleSong()) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    showToast("当前浏览器不支持音频示范");
    return;
  }
  state.audioContext = state.audioContext || new AudioContext();
  const ctx = state.audioContext;
  const notes = song.notes;
  const now = ctx.currentTime + 0.05;
  const tempo = $("#tempoSelect")?.value || "medium";
  const step = tempo === "slow" ? 0.36 : tempo === "lively" ? 0.22 : 0.28;
  notes.forEach((frequency, index) => {
    const start = now + index * step;
    playTone(ctx, frequency, start, step * 0.82, 0.12, index % 3 === 0 ? "triangle" : "sine");
    if (index % 2 === 0) playTone(ctx, frequency * 0.5, start, step * 0.86, 0.035, "sine");
  });

  $("#jianpuLine").textContent = song.jianpu;
  $("#chordLine").textContent = `${song.chords} · ${song.tag}`;
  $("#voiceMap").innerHTML = `
    <span>高声部：${song.jianpu}</span>
    <span>低声部：${song.low}</span>
  `;
  showToast(`正在播放《${song.title}》童声音色示范`);
}

function playDemo() {
  playNurserySong(getSampleSong());
}

function downloadScore() {
  const content = [
    "音为爱你合唱谱",
    "",
    "歌词：",
    state.lastLyrics || $("#lyricsText").textContent,
    "",
    `简谱：${$("#jianpuLine").textContent}`,
    `和弦：${$("#chordLine").textContent}`,
    "",
    "编排：",
    ...$$("li", $("#arrangementList")).map((li, index) => `${index + 1}. ${li.textContent}`),
  ].join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "音为爱你合唱谱.txt";
  link.click();
  URL.revokeObjectURL(url);
}

function listenKeywords() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    showToast("当前浏览器不支持语音识别，可直接输入关键词");
    return;
  }
  const recognition = new Recognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.replace(/[，。；\s]+/g, "、");
    $("#keywordInput").value = transcript;
    generateLyrics();
  };
  recognition.start();
  showToast("正在听关键词");
}

function useKeywordTheme(rawKeywords) {
  const normalized = rawKeywords
    .split(/[、,，;；\s]+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 8)
    .join("、");
  $("#keywordInput").value = normalized || keywordFallback.join("、");
  setView("studio");
  window.setTimeout(() => generateLyrics(), 80);
}

function createFromExplore() {
  const prompt = $("#explorePrompt")?.value || keywordFallback.join(" ");
  useKeywordTheme(prompt);
}

function playSongFromButton(button) {
  const key = button.dataset.demoSong;
  const select = $("#sampleSongSelect");
  if (select && nurserySongs[key]) {
    select.value = key;
    updateSampleSongInfo();
  }
  playNurserySong(nurserySongs[key] || getSampleSong());
}

function detectCompanionType(message) {
  if (/不想上学|厌学|逃学|不想去|上学/.test(message)) return "school";
  if (/累|难过|哭|烦|孤单|害怕|不开心/.test(message)) return "tired";
  if (/比赛|表演|上台|紧张|害羞/.test(message)) return "stage";
  if (/妈妈|爸爸|奶奶|爷爷|家|想家/.test(message)) return "family";
  return "default";
}

function companionReply(message) {
  const type = detectCompanionType(message.trim());
  const bank = companionBanks[type];
  const mood = Number($("#moodRange").value);
  const moodLine =
    mood <= 2
      ? "今天我们把练习放小一点，不用一下子变好。"
      : mood >= 5
        ? "这份力量很好，可以先存进一小段歌里。"
        : "我们慢慢来，一句一句就够了。";
  return `${pick(bank.hear)}${moodLine}${pick(bank.step)}`;
}

function sendChat(event) {
  event.preventDefault();
  const input = $("#chatInput");
  const text = input.value.trim();
  if (!text) return;
  const windowEl = $("#chatWindow");
  windowEl.insertAdjacentHTML("beforeend", `<div class="bubble user">${escapeHtml(text)}</div>`);
  const reply = companionReply(text);
  window.setTimeout(() => {
    windowEl.insertAdjacentHTML("beforeend", `<div class="bubble ai">${reply}</div>`);
    windowEl.scrollTop = windowEl.scrollHeight;
    state.lastBlessing = reply;
  }, 260);
  input.value = "";
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return entities[char];
  });
}

function updateMood() {
  const value = $("#moodRange").value;
  $("#moodLabel").textContent = moodLabels[value];
}

function generateBlessing() {
  const type = $("#festivalSelect").value;
  const name = $("#childName").value.trim() || "小朋友";
  const text = pick(blessingCopy[type]).replaceAll("{name}", name);
  $("#blessingText").textContent = text;
  state.lastBlessing = text;
  showToast("专属祝福片段已生成");
}

function updateReport(type) {
  const isMonth = type === "month";
  $("#stabilityValue").textContent = isMonth ? "84%" : "78%";
  $("#lyricsCount").textContent = isMonth ? "18 首" : "6 首";
  $("#checkinDays").textContent = isMonth ? "23 天" : "9 天";
  $("[data-report='week']").classList.toggle("active", !isMonth);
  $("[data-report='month']").classList.toggle("active", isMonth);
}

async function copyLyrics() {
  const text = $("#lyricsText").textContent;
  try {
    await navigator.clipboard.writeText(text);
    showToast("歌词已复制");
  } catch {
    showToast("复制失败，可手动选择文本");
  }
}

async function copyHandoff() {
  const text = $$(".handoff-card, .queue-list article")
    .map((card) => card.textContent.replace(/\s+/g, " ").trim())
    .join("\n");
  try {
    await navigator.clipboard.writeText(text);
    showToast("交接摘要已复制");
  } catch {
    showToast("复制失败，可手动选择交接内容");
  }
}

function syncRehearsal() {
  showToast("已把本周排练计划同步到打卡提醒");
  $("#reminderStatus").textContent = "已同步本周 3 次排练提醒";
}

function drawHeroCanvas() {
  const canvas = $("#heroCanvas");
  if (!canvas) return;
  const box = canvas.getBoundingClientRect();
  if (!box.width || !box.height) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(720, Math.floor(box.width * ratio));
  canvas.height = Math.max(520, Math.floor(box.height * ratio));
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#bfe7f4");
  sky.addColorStop(0.46, "#f8edd2");
  sky.addColorStop(1, "#d9efe2");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  drawRidge(ctx, w, h, 0.58, "#87b89e");
  drawRidge(ctx, w, h, 0.72, "#5f9d80");

  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = Math.max(3, w * 0.006);
  for (let i = 0; i < 7; i += 1) {
    const y = h * 0.58 + i * h * 0.045;
    ctx.beginPath();
    ctx.moveTo(w * 0.06, y);
    ctx.bezierCurveTo(w * 0.24, y - h * 0.04, w * 0.44, y + h * 0.025, w * 0.66, y - h * 0.018);
    ctx.bezierCurveTo(w * 0.82, y - h * 0.036, w * 0.91, y + h * 0.01, w * 0.99, y - h * 0.012);
    ctx.stroke();
  }

  const schoolX = w * 0.57;
  const schoolY = h * 0.36;
  ctx.fillStyle = "#fff7e6";
  ctx.fillRect(schoolX, schoolY, w * 0.23, h * 0.16);
  ctx.fillStyle = "#f46a6a";
  ctx.beginPath();
  ctx.moveTo(schoolX - w * 0.02, schoolY);
  ctx.lineTo(schoolX + w * 0.12, schoolY - h * 0.07);
  ctx.lineTo(schoolX + w * 0.25, schoolY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2c82b8";
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(schoolX + w * (0.035 + i * 0.058), schoolY + h * 0.045, w * 0.032, h * 0.045);
  }

  drawChoirKids(ctx, w, h);
  drawSoundLine(ctx, w, h);
}

function drawRidge(ctx, w, h, base, color) {
  ctx.beginPath();
  ctx.moveTo(0, h * base);
  ctx.lineTo(w * 0.16, h * (base - 0.2));
  ctx.lineTo(w * 0.34, h * (base - 0.08));
  ctx.lineTo(w * 0.5, h * (base - 0.25));
  ctx.lineTo(w * 0.72, h * (base - 0.08));
  ctx.lineTo(w, h * (base - 0.23));
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawChoirKids(ctx, w, h) {
  const colors = ["#0e8f88", "#5caee8", "#f46a6a", "#f2b84b", "#4f9d62", "#6e4aa8"];
  const baseX = w * 0.2;
  const baseY = h * 0.72;
  for (let i = 0; i < 8; i += 1) {
    const x = baseX + i * w * 0.045;
    const y = baseY + Math.sin(i * 0.9) * h * 0.012;
    ctx.fillStyle = "#5c3a2c";
    ctx.beginPath();
    ctx.arc(x, y - h * 0.075, w * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(x - w * 0.014, y - h * 0.055, w * 0.028, h * 0.075);
    ctx.strokeStyle = "#5c3a2c";
    ctx.lineWidth = Math.max(2, w * 0.004);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.008, y + h * 0.02);
    ctx.lineTo(x - w * 0.018, y + h * 0.06);
    ctx.moveTo(x + w * 0.008, y + h * 0.02);
    ctx.lineTo(x + w * 0.018, y + h * 0.06);
    ctx.stroke();
  }
}

function drawSoundLine(ctx, w, h) {
  ctx.strokeStyle = "#0e8f88";
  ctx.lineWidth = Math.max(4, w * 0.006);
  ctx.beginPath();
  for (let x = w * 0.12; x < w * 0.9; x += w * 0.016) {
    const y = h * 0.24 + Math.sin(x / (w * 0.035)) * h * 0.026;
    if (x === w * 0.12) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function init() {
  refreshIcons();
  renderPlan();
  updateSampleSongInfo();
  $(".waveform").classList.add("paused");

  const hashView = location.hash.replace("#", "");
  setView(hashView || "coach", false);

  $$("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.scroll.replace("#", "")));
  });
  $$(".nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setView(link.hash.replace("#", ""));
    });
  });
  $$("[data-dialect]").forEach((button) =>
    button.addEventListener("click", () => setDialect(button.dataset.dialect)),
  );
  $$(".keyword-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const input = $("#keywordInput");
      const values = getKeywords();
      if (!values.includes(chip.textContent)) values.push(chip.textContent);
      input.value = values.join("、");
    });
  });
  $$("#exploreCreate").forEach((button) => button.addEventListener("click", createFromExplore));
  $$("[data-use-keywords]").forEach((button) => {
    button.addEventListener("click", () => useKeywordTheme(button.dataset.useKeywords));
  });
  $$("[data-demo-song]").forEach((button) => {
    button.addEventListener("click", () => playSongFromButton(button));
  });
  $$(".report-tabs .segment").forEach((button) =>
    button.addEventListener("click", () => updateReport(button.dataset.report)),
  );

  $("#practiceFile").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    $("#recordStatus").textContent = file ? `已选择：${file.name}` : "等待练唱音频";
    if (file) analyzePractice(file.name);
  });
  $("#practiceForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const file = $("#practiceFile").files?.[0];
    analyzePractice(file?.name || "示范练唱");
  });
  $("#recordPractice").addEventListener("click", toggleRecording);
  $("#levelSelect").addEventListener("change", () => renderPlan());
  $("#refreshPlan").addEventListener("click", () => {
    renderPlan();
    showToast("今日练习计划已刷新");
  });
  $("#setReminder").addEventListener("click", setReminder);
  $("#lyricsForm").addEventListener("submit", generateLyrics);
  $("#voiceKeywords").addEventListener("click", listenKeywords);
  $("#playDemo").addEventListener("click", playDemo);
  $("#playSongDemo").addEventListener("click", () => playNurserySong(getSampleSong()));
  $("#sampleSongSelect").addEventListener("change", updateSampleSongInfo);
  $("#styleSelect").addEventListener("change", () => {
    const keywords = normalizeKeywords(getKeywords());
    generateMelody(keywords, inferTheme(keywords));
  });
  $("#copyLyrics").addEventListener("click", copyLyrics);
  $("#downloadScore").addEventListener("click", downloadScore);
  $("#syncRehearsal")?.addEventListener("click", syncRehearsal);
  $("#copyHandoff")?.addEventListener("click", copyHandoff);
  $$(".quick-prompt").forEach((button) => {
    button.addEventListener("click", () => {
      $("#chatInput").value = button.dataset.prompt;
      $("#chatInput").focus();
    });
  });
  $("#chatForm").addEventListener("submit", sendChat);
  $("#moodRange").addEventListener("input", updateMood);
  $("#generateBlessing").addEventListener("click", generateBlessing);
  $("#playBlessing").addEventListener("click", () => speak($("#blessingText").textContent, 0.92, 1.28));
  $("#speakCompanion").addEventListener("click", () => {
    const lastAi = $$(".bubble.ai", $("#chatWindow")).at(-1)?.textContent || state.lastBlessing;
    speak(lastAi, 0.92, 1.18);
  });
  $("#readHero").addEventListener("click", () =>
    speak("今天也很棒。我们一句一句唱，一天一天听见自己的进步。", 0.94, 1.18),
  );
  window.addEventListener("resize", drawHeroCanvas);
  window.addEventListener("hashchange", () => setView(location.hash.replace("#", ""), false));
}

document.addEventListener("DOMContentLoaded", init);
