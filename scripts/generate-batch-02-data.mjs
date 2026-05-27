/**
 * generate-batch-02-data.mjs — 第 02 批 A1 词卡数据生成
 *
 * 生成 DE-0326 到 DE-0650 共 325 张非名词为主的 A1 词卡。
 * 输出: data/batch-02-data.js (可追加到 js/data.js)
 */

const BATCH = '02';
const LEVEL = 'A1';
const START_ID = 326;
const START_ORDER = 326;
const TOTAL = 325;

function pad(n) { return String(n).padStart(4, '0'); }

function card(n, cat, word, wordDisplay, pos, article, plural, zh, exDe, exZh, wordAudioText, exampleAudioText) {
  const id = `DE-${pad(START_ID + n - 1)}`;
  const order = START_ORDER + n - 1;
  const wd = wordDisplay || word;
  const wt = wordAudioText || wd;
  const et = exampleAudioText || exDe;
  return {
    id, level: LEVEL, batch: BATCH, category: cat, globalOrder: order,
    word, wordDisplay: wd, copyText: wd,
    partOfSpeech: pos, article: article || '', plural: plural || '',
    shortMeaningZh: zh,
    exampleDe: exDe, exampleZh: exZh,
    wordAudioUrl: `/audio/de/words/${id}.mp3`,
    meaningAudioUrl: '',
    exampleAudioUrl: `/audio/de/examples/${id}.mp3`,
    wordAudioText: wt, exampleAudioText: et,
    pronunciationStatus: 'unchecked', pronunciationNote: '',
  };
}

const cards = [];

// ====================================================================
// 日常动作 (60) — DE-0326 to DE-0385 — verbs
// ====================================================================
const verbs = [
  ['kommen', '来', 'Ich komme aus China.', '我来自中国。'],
  ['gehen', '走', 'Ich gehe zur Schule.', '我去学校。'],
  ['machen', '做', 'Was machst du heute?', '你今天做什么？'],
  ['arbeiten', '工作', 'Mein Vater arbeitet in Berlin.', '我爸爸在柏林工作。'],
  ['lernen', '学习', 'Wir lernen jeden Tag Deutsch.', '我们每天学德语。'],
  ['sprechen', '说', 'Sprichst du Deutsch?', '你说德语吗？'],
  ['lesen', '读', 'Ich lese gern Bücher.', '我喜欢读书。'],
  ['schreiben', '写', 'Bitte schreiben Sie Ihren Namen.', '请写下您的名字。'],
  ['hören', '听', 'Hörst du gern Musik?', '你喜欢听音乐吗？'],
  ['sehen', '看', 'Siehst du den Mann da?', '你看到那边那个男人吗？'],
  ['kaufen', '买', 'Ich kaufe Brot beim Bäcker.', '我在面包店买面包。'],
  ['bezahlen', '付款', 'Kann ich mit Karte bezahlen?', '我可以用卡付款吗？'],
  ['kosten', '价格', 'Was kostet das?', '这个多少钱？'],
  ['helfen', '帮助', 'Kannst du mir bitte helfen?', '你能帮我一下吗？'],
  ['suchen', '找', 'Ich suche meine Brille.', '我在找我的眼镜。'],
  ['finden', '找到', 'Ich finde das Buch nicht.', '我找不到这本书。'],
  ['bringen', '带来', 'Bringst du mir ein Glas Wasser?', '你给我带杯水来好吗？'],
  ['nehmen', '拿', 'Ich nehme einen Kaffee, bitte.', '我要一杯咖啡。'],
  ['geben', '给', 'Gib mir bitte den Stift.', '请把笔给我。'],
  ['bekommen', '得到', 'Was bekommen Sie?', '您要什么？'],
  ['möchten', '想要', 'Ich möchte ein Eis, bitte.', '我想要一个冰淇淋。'],
  ['wollen', '要', 'Willst du mitkommen?', '你要一起来吗？'],
  ['können', '能够', 'Kannst du mir helfen?', '你能帮我吗？'],
  ['müssen', '必须', 'Ich muss heute arbeiten.', '我今天必须工作。'],
  ['dürfen', '允许', 'Darf ich hier sitzen?', '我可以坐这里吗？'],
  ['sollen', '应该', 'Du sollst mehr schlafen.', '你应该多睡觉。'],
  ['wissen', '知道', 'Ich weiß es nicht.', '我不知道。'],
  ['denken', '想', 'Was denkst du?', '你在想什么？'],
  ['glauben', '相信', 'Ich glaube, das ist richtig.', '我相信这是对的。'],
  ['fragen', '问', 'Darf ich Sie etwas fragen?', '我可以问您一个问题吗？'],
  ['antworten', '回答', 'Bitte antworten Sie auf Deutsch.', '请用德语回答。'],
  ['sagen', '说', 'Was hast du gesagt?', '你说了什么？'],
  ['rufen', '喊', 'Ruf mich morgen an!', '明天给我打电话！'],
  ['warten', '等待', 'Warte bitte einen Moment.', '请稍等片刻。'],
  ['stehen', '站', 'Stehen Sie bitte auf.', '请站起来。'],
  ['sitzen', '坐', 'Wir sitzen im Garten.', '我们坐在花园里。'],
  ['legen', '放平', 'Leg das Buch auf den Tisch.', '把书放在桌上。'],
  ['stellen', '放竖', 'Stell die Flasche in den Kühlschrank.', '把瓶子放进冰箱。'],
  ['laufen', '跑', 'Ich laufe jeden Morgen.', '我每天早上跑步。'],
  ['fahren', '行驶', 'Wir fahren mit dem Bus.', '我们坐公交去。'],
  ['fliegen', '飞', 'Wir fliegen nach Berlin.', '我们飞往柏林。'],
  ['schwimmen', '游泳', 'Im Sommer schwimme ich gern.', '夏天我喜欢游泳。'],
  ['spielen', '玩', 'Die Kinder spielen im Park.', '孩子们在公园玩。'],
  ['singen', '唱', 'Sie singt sehr schön.', '她唱得很好听。'],
  ['tanzen', '跳舞', 'Tanzt du gern?', '你喜欢跳舞吗？'],
  ['kochen', '做饭', 'Meine Mutter kocht sehr gut.', '我妈妈做饭很好吃。'],
  ['backen', '烤', 'Wir backen einen Kuchen.', '我们烤一个蛋糕。'],
  ['putzen', '打扫', 'Ich putze am Samstag die Wohnung.', '我周六打扫公寓。'],
  ['waschen', '洗', 'Ich wasche meine Hände.', '我洗手。'],
  ['schlafen', '睡觉', 'Ich schlafe acht Stunden.', '我睡八小时。'],
  ['aufstehen', '起床', 'Ich stehe um sieben Uhr auf.', '我七点起床。'],
  ['frühstücken', '吃早餐', 'Wir frühstücken um acht.', '我们八点吃早餐。'],
  ['essen', '吃', 'Ich esse gern Pizza.', '我喜欢吃披萨。'],
  ['trinken', '喝', 'Was möchtest du trinken?', '你想喝什么？'],
  ['anrufen', '打电话', 'Ich rufe dich später an.', '我晚点打给你。'],
  ['mitbringen', '顺便带来', 'Bringst du etwas zu trinken mit?', '你顺便带点喝的吗？'],
  ['vorbereiten', '准备', 'Ich bereite das Essen vor.', '我准备饭菜。'],
  ['auswählen', '选择', 'Wählen Sie eine Nummer.', '请选一个号码。'],
  ['drücken', '按', 'Drücken Sie die Taste.', '请按按钮。'],
  ['öffnen', '打开', 'Öffnen Sie das Fenster bitte.', '请打开窗户。'],
];

verbs.forEach(([w, zh, exDe, exZh], i) => {
  const idx = i + 1;
  cards.push(card(idx, '日常动作', w, w, 'verb', '', '', zh, exDe, exZh, w, exDe));
});

// ====================================================================
// 基础状态 (45) — DE-0386 to DE-0430 — adjectives & adverbs
// ====================================================================
const adjs = [
  ['gut', '好', 'Das Essen ist sehr gut.', '这顿饭很好吃。'],
  ['besser', '更好', 'Heute geht es mir besser.', '我今天感觉好多了。'],
  ['viel', '多', 'Ich habe viel Arbeit.', '我有很多工作。'],
  ['wenig', '少', 'Ich habe wenig Zeit.', '我时间很少。'],
  ['ganz', '完全', 'Das ist ganz einfach.', '这非常简单。'],
  ['halb', '一半', 'Ein halbes Kilo, bitte.', '请给我半公斤。'],
  ['voll', '满', 'Das Glas ist voll.', '杯子满了。'],
  ['leer', '空', 'Die Flasche ist leer.', '瓶子空了。'],
  ['offen', '开', 'Die Tür ist offen.', '门开着。'],
  ['geschlossen', '关', 'Das Geschäft ist geschlossen.', '商店关门了。'],
  ['frei', '自由', 'Ist dieser Platz frei?', '这个座位空着吗？'],
  ['billig', '便宜', 'Das ist sehr billig.', '这个很便宜。'],
  ['teuer', '贵', 'Das Restaurant ist teuer.', '这家餐厅很贵。'],
  ['dunkel', '暗', 'Es ist dunkel draußen.', '外面很暗。'],
  ['hell', '明亮', 'Das Zimmer ist hell.', '房间很明亮。'],
  ['laut', '大声', 'Die Musik ist zu laut.', '音乐太大声了。'],
  ['leise', '轻声', 'Sei bitte leise.', '请小声点。'],
  ['freundlich', '友好', 'Die Leute sind sehr freundlich.', '这里的人很友好。'],
  ['nett', '和蔼', 'Sie ist eine nette Frau.', '她是一位和蔼的女士。'],
  ['lustig', '有趣', 'Der Film ist lustig.', '这部电影很搞笑。'],
  ['ruhig', '安静', 'Die Straße ist sehr ruhig.', '这条街很安静。'],
  ['sauber', '干净', 'Das Zimmer ist sauber.', '房间很干净。'],
  ['schmutzig', '脏', 'Meine Schuhe sind schmutzig.', '我的鞋子脏了。'],
  ['breit', '宽', 'Die Straße ist breit.', '这条路很宽。'],
  ['eng', '窄', 'Das Zimmer ist sehr eng.', '这个房间很窄。'],
  ['hoch', '高', 'Das Gebäude ist sehr hoch.', '这栋楼很高。'],
  ['tief', '深', 'Der See ist sehr tief.', '这个湖很深。'],
  ['kurz', '短', 'Der Rock ist zu kurz.', '这条裙子太短了。'],
  ['lang', '长', 'Das Kleid ist lang.', '这条连衣裙很长。'],
  ['dick', '厚', 'Das Buch ist dick.', '这本书很厚。'],
  ['dünn', '薄', 'Das Papier ist sehr dünn.', '这张纸很薄。'],
  ['stark', '强壮', 'Mein Bruder ist sehr stark.', '我哥哥很强壮。'],
  ['schwach', '弱', 'Ich fühle mich schwach.', '我感觉很虚弱。'],
  ['rund', '圆', 'Der Tisch ist rund.', '桌子是圆的。'],
  ['gerade', '直的', 'Gehen Sie geradeaus.', '请直走。'],
  ['kaputt', '坏了', 'Mein Handy ist kaputt.', '我的手机坏了。'],
  ['fertig', '完成', 'Bist du fertig?', '你做完了吗？'],
  ['bereit', '准备好', 'Ich bin bereit.', '我准备好了。'],
  ['möglich', '可能', 'Ist das möglich?', '这可能吗？'],
  ['normal', '正常', 'Das ist ganz normal.', '这很正常。'],
  ['verschieden', '不同', 'Die Farben sind verschieden.', '颜色各不相同。'],
  ['einfach', '简单', 'Die Aufgabe ist einfach.', '这道题很简单。'],
  ['bequem', '舒服', 'Der Stuhl ist sehr bequem.', '这把椅子很舒服。'],
  ['gemütlich', '舒适', 'Das Café ist sehr gemütlich.', '这家咖啡馆很舒适。'],
  ['nützlich', '有用', 'Diese App ist sehr nützlich.', '这个应用很有用。'],
];

adjs.forEach(([w, zh, exDe, exZh], i) => {
  const idx = 61 + i;
  cards.push(card(idx, '基础状态', w, w, 'adj', '', '', zh, exDe, exZh, w, exDe));
});

// ====================================================================
// 时间数字 (35) — DE-0431 to DE-0465 — time & numbers
// ====================================================================
const timeNums = [
  ['heute', '今天', 'Heute ist Montag.', '今天是周一。', 'adv'],
  ['morgen', '明天', 'Morgen habe ich frei.', '明天我休息。', 'adv'],
  ['gestern', '昨天', 'Gestern war ich krank.', '昨天我生病了。', 'adv'],
  ['jetzt', '现在', 'Was machst du jetzt?', '你现在在做什么？', 'adv'],
  ['später', '以后', 'Ich rufe später an.', '我晚点打电话。', 'adv'],
  ['früh', '早', 'Stehst du früh auf?', '你早起吗？', 'adv'],
  ['spät', '晚', 'Es ist schon spät.', '已经很晚了。', 'adv'],
  ['morgens', '在早上', 'Morgens trinke ich Kaffee.', '我早上喝咖啡。', 'adv'],
  ['abends', '在晚上', 'Abends sehe ich fern.', '我晚上看电视。', 'adv'],
  ['nachts', '在夜里', 'Nachts schlafe ich.', '我夜里睡觉。', 'adv'],
  ['bald', '很快', 'Bis bald!', '回头见！', 'adv'],
  ['immer', '总是', 'Ich bin immer pünktlich.', '我总是准时。', 'adv'],
  ['oft', '经常', 'Ich gehe oft spazieren.', '我经常散步。', 'adv'],
  ['manchmal', '有时', 'Manchmal esse ich Schokolade.', '我有时吃巧克力。', 'adv'],
  ['selten', '很少', 'Ich esse selten Fleisch.', '我很少吃肉。', 'adv'],
  ['nie', '从不', 'Ich rauche nie.', '我从不抽烟。', 'adv'],
  ['wieder', '再次', 'Komm bald wieder!', '快再来！', 'adv'],
  ['schon', '已经', 'Ich bin schon fertig.', '我已经做完了。', 'adv'],
  ['erst', '才', 'Es ist erst zehn Uhr.', '才十点钟。', 'adv'],
  ['noch', '还', 'Ich habe noch Zeit.', '我还有时间。', 'adv'],
  ['Uhr', '点钟', 'Es ist drei Uhr.', '现在三点。', 'noun'],
  ['Stunde', '小时', 'Eine Stunde hat 60 Minuten.', '一小时有六十分钟。', 'noun'],
  ['Minute', '分钟', 'Warte eine Minute.', '等一分钟。', 'noun'],
  ['Sekunde', '秒', 'Nur eine Sekunde!', '就一秒！', 'noun'],
  ['Viertel', '一刻钟', 'Es ist Viertel nach drei.', '现在是三点一刻。', 'noun'],
  ['eins', '一', 'Ich habe ein Kind.', '我有一个孩子。', 'num'],
  ['zwei', '二', 'Ich habe zwei Schwestern.', '我有两个姐妹。', 'num'],
  ['drei', '三', 'Wir sind zu dritt.', '我们一共三个人。', 'num'],
  ['vier', '四', 'Vier mal vier ist sechzehn.', '四乘四是十六。', 'num'],
  ['fünf', '五', 'Fünf Euro, bitte.', '五欧元。', 'num'],
  ['sechs', '六', 'Die Party beginnt um sechs.', '派对六点开始。', 'num'],
  ['zehn', '十', 'Zehn Minuten noch.', '还有十分钟。', 'num'],
  ['zwanzig', '二十', 'Das kostet zwanzig Euro.', '这个二十欧元。', 'num'],
  ['hundert', '一百', 'Das ist hundert Prozent richtig.', '这是百分之百正确。', 'num'],
  ['tausend', '一千', 'Tausend Dank!', '万分感谢！', 'num'],
];

timeNums.forEach(([w, zh, exDe, exZh, pos], i) => {
  const idx = 106 + i;
  const article = pos === 'noun' ? (['Uhr', 'Stunde', 'Minute', 'Sekunde'].includes(w) ? 'die' : 'das') : '';
  const plural = pos === 'noun' ? (w === 'Uhr' ? 'die Uhren' : w === 'Stunde' ? 'die Stunden' : w === 'Minute' ? 'die Minuten' : w === 'Sekunde' ? 'die Sekunden' : 'die Viertel') : '';
  const wd = pos === 'noun' && article ? `${article} ${w}` : w;
  cards.push(card(idx, '时间数字', w, wd, pos, article, plural, zh, exDe, exZh, wd, exDe));
});

// ====================================================================
// 地点方位 (35) — DE-0466 to DE-0500 — prepositions & directions
// ====================================================================
const locations = [
  ['hier', '这里', 'Hier ist es schön.', '这里很美。', 'adv'],
  ['dort', '那里', 'Dort ist der Bahnhof.', '那里是火车站。', 'adv'],
  ['da', '那边', 'Da ist ein Supermarkt.', '那边有一家超市。', 'adv'],
  ['oben', '上面', 'Das Buch liegt oben.', '书在上面。', 'adv'],
  ['unten', '下面', 'Die Küche ist unten.', '厨房在下面。', 'adv'],
  ['vorne', '前面', 'Vorne ist die Bühne.', '前面是舞台。', 'adv'],
  ['hinten', '后面', 'Hinten ist der Garten.', '后面是花园。', 'adv'],
  ['vor', '在…前', 'Das Auto steht vor dem Haus.', '车停在房子前面。', 'prep'],
  ['hinter', '在…后', 'Der Garten ist hinter dem Haus.', '花园在房子后面。', 'prep'],
  ['neben', '在…旁', 'Die Apotheke ist neben der Bank.', '药店在银行旁边。', 'prep'],
  ['zwischen', '在…之间', 'Der Tisch steht zwischen den Stühlen.', '桌子在椅子之间。', 'prep'],
  ['auf', '在…上', 'Das Buch liegt auf dem Tisch.', '书在桌上。', 'prep'],
  ['unter', '在…下', 'Der Hund ist unter dem Tisch.', '狗在桌子下面。', 'prep'],
  ['in', '在…里', 'Ich bin in der Schule.', '我在学校里。', 'prep'],
  ['an', '在…旁', 'Das Bild hängt an der Wand.', '画挂在墙上。', 'prep'],
  ['aus', '从…来', 'Ich komme aus Deutschland.', '我来自德国。', 'prep'],
  ['bei', '在…处', 'Ich wohne bei meiner Tante.', '我住在我阿姨家。', 'prep'],
  ['mit', '和…一起', 'Ich gehe mit meinem Freund.', '我和我朋友一起去。', 'prep'],
  ['nach', '向…去', 'Wir fahren nach Berlin.', '我们去柏林。', 'prep'],
  ['seit', '自从', 'Ich lerne seit einem Jahr Deutsch.', '我学德语一年了。', 'prep'],
  ['von', '从', 'Das ist ein Geschenk von meiner Mutter.', '这是我妈妈送的礼物。', 'prep'],
  ['zu', '到', 'Ich gehe zum Arzt.', '我去看医生。', 'prep'],
  ['gegenüber', '对面', 'Die Post ist gegenüber der Bank.', '邮局在银行对面。', 'prep'],
  ['durch', '穿过', 'Wir gehen durch den Park.', '我们穿过公园。', 'prep'],
  ['für', '为了', 'Das Geschenk ist für dich.', '这个礼物是给你的。', 'prep'],
  ['gegen', '反对', 'Ich bin gegen diese Idee.', '我反对这个想法。', 'prep'],
  ['ohne', '没有', 'Kaffee ohne Zucker, bitte.', '请来不加糖的咖啡。', 'prep'],
  ['um', '围绕', 'Wir treffen uns um acht Uhr.', '我们八点见面。', 'prep'],
  ['bis', '直到', 'Ich warte bis morgen.', '我等到明天。', 'prep'],
  ['links', '左边', 'Links ist die Post.', '左边是邮局。', 'adv'],
  ['rechts', '右边', 'Rechts sehen Sie die Kirche.', '右边您会看到教堂。', 'adv'],
  ['geradeaus', '直走', 'Gehen Sie geradeaus.', '请直走。', 'adv'],
  ['zurück', '返回', 'Wann kommst du zurück?', '你什么时候回来？', 'adv'],
  ['weit', '远', 'Ist es weit von hier?', '离这里远吗？', 'adv'],
  ['nah', '近', 'Der Bahnhof ist sehr nah.', '火车站很近。', 'adj'],
];

locations.forEach(([w, zh, exDe, exZh, pos], i) => {
  const idx = 141 + i;
  cards.push(card(idx, '地点方位', w, w, pos, '', '', zh, exDe, exZh, w, exDe));
});

// ====================================================================
// 考试课堂 (30) — DE-0501 to DE-0530 — classroom expressions
// ====================================================================
const classroom = [
  ['üben', '练习', 'Wir üben jeden Tag.', '我们每天练习。', 'verb'],
  ['nachsprechen', '跟读', 'Sprechen Sie bitte nach.', '请跟读。', 'verb'],
  ['vorlesen', '朗读', 'Lesen Sie den Text vor.', '请朗读课文。', 'verb'],
  ['übersetzen', '翻译', 'Übersetzen Sie den Satz.', '请翻译这个句子。', 'verb'],
  ['vergleichen', '比较', 'Vergleichen Sie die Wörter.', '请比较这些词。', 'verb'],
  ['kontrollieren', '检查', 'Kontrollieren Sie Ihre Antworten.', '请检查您的答案。', 'verb'],
  ['verbessern', '改正', 'Bitte verbessern Sie den Fehler.', '请改正这个错误。', 'verb'],
  ['mitmachen', '参与', 'Machen Sie bitte mit.', '请一起参与。', 'verb'],
  ['zuhören', '倾听', 'Hören Sie gut zu.', '请仔细听。', 'verb'],
  ['aufpassen', '注意', 'Passen Sie gut auf.', '请注意。', 'verb'],
  ['verstehen', '理解', 'Verstehen Sie die Frage?', '您理解这个问题吗？', 'verb'],
  ['bedeuten', '意思是', 'Was bedeutet das Wort?', '这个词是什么意思？', 'verb'],
  ['buchstabieren', '拼写', 'Buchstabieren Sie Ihren Namen.', '请拼写您的名字。', 'verb'],
  ['ausfüllen', '填写', 'Füllen Sie das Formular aus.', '请填写表格。', 'verb'],
  ['unterschreiben', '签字', 'Unterschreiben Sie hier bitte.', '请在这里签字。', 'verb'],
  ['beschreiben', '描述', 'Beschreiben Sie das Bild.', '请描述这幅图。', 'verb'],
  ['erzählen', '讲述', 'Erzählen Sie von Ihrer Familie.', '请讲讲您的家庭。', 'verb'],
  ['diskutieren', '讨论', 'Wir diskutieren das Thema.', '我们讨论这个主题。', 'verb'],
  ['melden', '举手', 'Bitte melden Sie sich.', '请举手。', 'verb'],
  ['zusammenarbeiten', '合作', 'Arbeiten Sie zusammen.', '请合作。', 'verb'],
  ['aufschreiben', '写下', 'Schreiben Sie die Wörter auf.', '请写下这些词。', 'verb'],
  ['einstecken', '收起', 'Stecken Sie Ihr Handy ein.', '请收起您的手机。', 'verb'],
  ['ausschalten', '关掉', 'Schalten Sie das Handy aus.', '请关掉手机。', 'verb'],
  ['einschalten', '打开', 'Schalten Sie den Computer ein.', '请打开电脑。', 'verb'],
  ['drücken', '按', 'Drücken Sie den Knopf.', '请按下按钮。', 'verb'],
  ['ziehen', '拉', 'Ziehen Sie die Tür.', '请拉门。', 'verb'],
  ['aussprechen', '发音', 'Sprechen Sie das Wort aus.', '请发这个词的音。', 'verb'],
  ['betonen', '重读', 'Betonen Sie die erste Silbe.', '请重读第一个音节。', 'verb'],
  ['trennen', '分开', 'Trennen Sie die Wörter.', '请把单词分开。', 'verb'],
  ['ergänzen', '补充', 'Ergänzen Sie den Satz.', '请补充句子。', 'verb'],
];

classroom.forEach(([w, zh, exDe, exZh, pos], i) => {
  const idx = 176 + i;
  cards.push(card(idx, '考试课堂', w, w, pos, '', '', zh, exDe, exZh, w, exDe));
});

// ====================================================================
// 购物表达 (30) — DE-0531 to DE-0560
// ====================================================================
const shopping = [
  ['bestellen', '点餐', 'Ich möchte gern bestellen.', '我想点餐。', 'verb'],
  ['reservieren', '预订', 'Ich möchte einen Tisch reservieren.', '我想预订一张桌子。', 'verb'],
  ['anprobieren', '试穿', 'Kann ich das anprobieren?', '我可以试穿吗？', 'verb'],
  ['umtauschen', '换货', 'Kann ich das umtauschen?', '我可以换这个吗？', 'verb'],
  ['zurückgeben', '退货', 'Ich möchte das zurückgeben.', '我想退这个。', 'verb'],
  ['wiegen', '称重', 'Können Sie das bitte wiegen?', '您能称一下吗？', 'verb'],
  ['einpacken', '打包', 'Können Sie das einpacken?', '您能打包吗？', 'verb'],
  ['auspacken', '拆包', 'Ich packe die Sachen aus.', '我把东西拆开。', 'verb'],
  ['reduzieren', '降价', 'Der Preis ist reduziert.', '价格降低了。', 'verb'],
  ['sparen', '省钱', 'Ich will Geld sparen.', '我想省钱。', 'verb'],
  ['bar', '现金', 'Zahlen Sie bar?', '您付现金吗？', 'adv'],
  ['genug', '足够', 'Das ist genug.', '够了。', 'adv'],
  ['mehr', '更多', 'Möchten Sie mehr?', '您要更多吗？', 'adv'],
  ['weniger', '更少', 'Ich esse weniger Zucker.', '我少吃糖。', 'adv'],
  ['ungefähr', '大约', 'Das kostet ungefähr zehn Euro.', '这个大约十欧元。', 'adv'],
  ['vielleicht', '也许', 'Vielleicht kaufe ich es.', '也许我会买。', 'adv'],
  ['sicher', '肯定', 'Bist du sicher?', '你确定吗？', 'adv'],
  ['natürlich', '当然', 'Natürlich helfe ich dir.', '我当然帮你。', 'adv'],
  ['leider', '可惜', 'Das ist leider zu teuer.', '可惜太贵了。', 'adv'],
  ['gern', '乐意', 'Ich helfe gern.', '我很乐意帮忙。', 'adv'],
  ['lieber', '更喜欢', 'Ich trinke lieber Tee.', '我更喜欢喝茶。', 'adv'],
  ['anders', '不同', 'Haben Sie das auch anders?', '您有这个的其他款式吗？', 'adv'],
  ['genau', '正好', 'Das ist genau richtig.', '这正好。', 'adv'],
  ['zusammen', '一起', 'Das macht zusammen 20 Euro.', '一共20欧元。', 'adv'],
  ['extra', '额外', 'Das kostet extra.', '这要额外收费。', 'adv'],
  ['inklusive', '包含', 'Der Preis ist inklusive Steuer.', '价格含税。', 'adj'],
  ['kostenlos', '免费', 'Der Eintritt ist kostenlos.', '免费入场。', 'adj'],
  ['gebraucht', '二手', 'Ich kaufe gern gebrauchte Bücher.', '我喜欢买二手书。', 'adj'],
  ['neu', '全新', 'Das Handy ist neu.', '这部手机是全新的。', 'adj'],
  ['günstig', '优惠', 'Das Angebot ist sehr günstig.', '这个优惠很划算。', 'adj'],
];

shopping.forEach(([w, zh, exDe, exZh, pos], i) => {
  const idx = 206 + i;
  cards.push(card(idx, '购物表达', w, w, pos, '', '', zh, exDe, exZh, w, exDe));
});

// ====================================================================
// 健康天气 (30) — DE-0561 to DE-0590
// ====================================================================
const healthWeather = [
  ['regnen', '下雨', 'Es regnet heute.', '今天下雨。', 'verb'],
  ['schneien', '下雪', 'Im Winter schneit es oft.', '冬天下雪。', 'verb'],
  ['scheinen', '照耀', 'Die Sonne scheint.', '阳光照耀。', 'verb'],
  ['wehen', '吹', 'Der Wind weht stark.', '风很大。', 'verb'],
  ['frieren', '冻', 'Ich friere sehr.', '我很冷。', 'verb'],
  ['schwitzen', '出汗', 'Ich schwitze bei der Hitze.', '天热我出汗。', 'verb'],
  ['husten', '咳嗽', 'Ich huste seit drei Tagen.', '我咳嗽三天了。', 'verb'],
  ['niesen', '打喷嚏', 'Ich muss niesen.', '我要打喷嚏。', 'verb'],
  ['ausruhen', '休息', 'Ruh dich gut aus.', '你好好休息。', 'verb'],
  ['einnehmen', '服用', 'Nehmen Sie die Tabletten ein.', '请服用药片。', 'verb'],
  ['untersuchen', '检查', 'Der Arzt untersucht mich.', '医生在给我检查。', 'verb'],
  ['impfen', '接种疫苗', 'Lassen Sie sich impfen.', '请接种疫苗。', 'verb'],
  ['bewegen', '运动', 'Bewegen Sie sich regelmäßig.', '请经常运动。', 'verb'],
  ['entspannen', '放松', 'Entspann dich ein bisschen.', '放松一下。', 'verb'],
  ['sonnig', '晴', 'Heute ist es sonnig.', '今天是晴天。', 'adj'],
  ['bewölkt', '多云', 'Es ist bewölkt heute.', '今天多云。', 'adj'],
  ['windig', '有风', 'Es ist windig draußen.', '外面有风。', 'adj'],
  ['neblig', '有雾', 'Der Morgen ist neblig.', '早晨有雾。', 'adj'],
  ['stürmisch', '暴风雨', 'Das Wetter ist stürmisch.', '天气是暴风雨。', 'adj'],
  ['trocken', '干燥', 'Die Luft ist sehr trocken.', '空气很干燥。', 'adj'],
  ['nass', '湿', 'Meine Schuhe sind nass.', '我的鞋湿了。', 'adj'],
  ['müde', '疲劳', 'Ich bin sehr müde.', '我很疲劳。', 'adj'],
  ['wach', '清醒', 'Bist du noch wach?', '你还醒着吗？', 'adj'],
  ['fit', '健康', 'Ich fühle mich fit.', '我感觉很健康。', 'adj'],
  ['frisch', '新鲜', 'Die Luft ist frisch.', '空气很新鲜。', 'adj'],
  ['schlimm', '严重', 'Es ist nicht so schlimm.', '没那么严重。', 'adj'],
  ['gefährlich', '危险', 'Das ist gefährlich.', '这很危险。', 'adj'],
  ['vorsichtig', '小心', 'Sei bitte vorsichtig.', '请小心。', 'adj'],
  ['sicher', '安全', 'Hier ist es sicher.', '这里很安全。', 'adj'],
  ['wunderbar', '美妙', 'Das Wetter ist wunderbar.', '天气好极了。', 'adj'],
];

healthWeather.forEach(([w, zh, exDe, exZh, pos], i) => {
  const idx = 236 + i;
  cards.push(card(idx, '健康天气', w, w, pos, '', '', zh, exDe, exZh, w, exDe));
});

// ====================================================================
// 简单请求 (25) — DE-0591 to DE-0615
// ====================================================================
const requests = [
  ['Achtung', '注意', 'Achtung, der Zug kommt!', '注意，火车来了！', 'other'],
  ['Vorsicht', '小心', 'Vorsicht, Stufe!', '小心台阶！', 'other'],
  ['Los gehts', '开始吧', 'Los gehts, wir fahren!', '开始吧，我们出发！', 'phrase'],
  ['Kein Problem', '没问题', 'Kein Problem, ich helfe gern.', '没问题，我很乐意帮忙。', 'phrase'],
  ['Macht nichts', '没关系', 'Macht nichts, das passiert.', '没关系，这种事常发生。', 'phrase'],
  ['Schon gut', '没事了', 'Schon gut, ich verstehe.', '没事了，我理解。', 'phrase'],
  ['Es tut mir leid', '对不起', 'Es tut mir leid, ich bin zu spät.', '对不起，我迟到了。', 'phrase'],
  ['Herzlich willkommen', '热烈欢迎', 'Herzlich willkommen in Berlin!', '热烈欢迎来到柏林！', 'phrase'],
  ['Viel Erfolg', '祝成功', 'Viel Erfolg bei der Prüfung!', '祝你考试成功！', 'phrase'],
  ['Alles klar', '明白了', 'Alles klar, ich komme mit.', '明白了，我一起去。', 'phrase'],
  ['Wie bitte', '请再说一遍', 'Wie bitte? Können Sie das wiederholen?', '请再说一遍？您能重复吗？', 'phrase'],
  ['Entschuldigung', '劳驾', 'Entschuldigung, wo ist der Bahnhof?', '劳驾，火车站在哪里？', 'other'],
  ['leider nicht', '可惜不行', 'Das geht leider nicht.', '这恐怕不行。', 'phrase'],
  ['vielleicht später', '也许以后', 'Vielleicht später, ich habe viel zu tun.', '也许以后吧，我现在很忙。', 'phrase'],
  ['einen Moment', '稍等', 'Einen Moment, bitte.', '请稍等。', 'phrase'],
  ['gern geschehen', '不客气', 'Gern geschehen, kein Problem.', '不客气，没问题。', 'phrase'],
  ['sofort', '立刻', 'Ich komme sofort.', '我马上来。', 'adv'],
  ['endlich', '终于', 'Bist du endlich da!', '你终于来了！', 'adv'],
  ['hoffentlich', '希望', 'Hoffentlich regnet es nicht.', '希望不要下雨。', 'adv'],
  ['trotzdem', '尽管如此', 'Es regnet, aber ich komme trotzdem.', '下雨了，但我还是来。', 'adv'],
  ['eigentlich', '本来', 'Eigentlich wollte ich kommen.', '我本来想来的。', 'adv'],
  ['bestimmt', '一定', 'Das ist bestimmt richtig.', '这一定是对的。', 'adv'],
  ['wirklich', '真的', 'Das ist wirklich schön.', '这真的很美。', 'adv'],
  ['ziemlich', '相当', 'Es ist ziemlich kalt heute.', '今天相当冷。', 'adv'],
  ['besonders', '特别', 'Das schmeckt besonders gut.', '这味道特别好。', 'adv'],
];

requests.forEach(([w, zh, exDe, exZh, pos], i) => {
  const idx = 266 + i;
  cards.push(card(idx, '简单请求', w, w, pos, '', '', zh, exDe, exZh, w, exDe));
});

// ====================================================================
// 学习交流 (20) — DE-0616 to DE-0635
// ====================================================================
const communication = [
  ['auswendig', '背诵', 'Lernst du das auswendig?', '你背诵这个吗？', 'adv'],
  ['deutlich', '清楚', 'Sprechen Sie deutlich.', '请说清楚。', 'adv'],
  ['fließend', '流利', 'Sie spricht fließend Deutsch.', '她德语说得流利。', 'adv'],
  ['Schritt für Schritt', '一步一步', 'Wir lernen Schritt für Schritt.', '我们一步一步学。', 'adv'],
  ['miteinander', '互相', 'Wir helfen einander.', '我们互相帮助。', 'adv'],
  ['zweimal', '两次', 'Lesen Sie den Text zweimal.', '请读两遍课文。', 'adv'],
  ['allein', '独自', 'Ich lerne gern allein.', '我喜欢独自学习。', 'adv'],
  ['laut', '出声地', 'Lesen Sie laut.', '请出声读。', 'adv'],
  ['leise', '轻声地', 'Sprechen Sie bitte leise.', '请轻声说话。', 'adv'],
  ['richtig', '正确地', 'Das hast du richtig gemacht.', '你做对了。', 'adv'],
  ['falsch', '错误地', 'Das ist falsch geschrieben.', '这写错了。', 'adv'],
  ['nochmal', '再一次', 'Sagen Sie das nochmal, bitte.', '请再说一遍。', 'adv'],
  ['genauso', '同样', 'Mir geht es genauso.', '我也一样。', 'adv'],
  ['kurz', '简短地', 'Antworten Sie kurz.', '请简短回答。', 'adv'],
  ['der Reihe nach', '依次', 'Bitte der Reihe nach.', '请依次来。', 'phrase'],
  ['hin und her', '来回', 'Wir fahren hin und her.', '我们来来回回。', 'adv'],
  ['vorbei', '过去', 'Die Prüfung ist vorbei.', '考试结束了。', 'adv'],
  ['unterwegs', '在路上', 'Ich bin unterwegs.', '我在路上。', 'adv'],
  ['zu Hause', '在家', 'Ich lerne zu Hause.', '我在家学习。', 'adv'],
  ['nach Hause', '回家', 'Ich gehe nach Hause.', '我回家。', 'adv'],
];

communication.forEach(([w, zh, exDe, exZh, pos], i) => {
  const idx = 291 + i;
  cards.push(card(idx, '学习交流', w, w, pos, '', '', zh, exDe, exZh, w, exDe));
});

// ====================================================================
// 日常功能 (15) — DE-0636 to DE-0650
// ====================================================================
const dailyFunc = [
  ['sich anziehen', '穿衣', 'Ich ziehe mich warm an.', '我穿得暖和。', 'verb'],
  ['sich ausziehen', '脱衣', 'Zieh dir die Schuhe aus.', '把鞋脱了。', 'verb'],
  ['sich waschen', '洗漱', 'Ich wasche mich morgens.', '我早上洗漱。', 'verb'],
  ['sich kümmern', '照料', 'Ich kümmere mich um die Kinder.', '我照顾孩子们。', 'verb'],
  ['sich treffen', '见面', 'Wir treffen uns um drei.', '我们三点见面。', 'verb'],
  ['sich freuen', '高兴', 'Ich freue mich auf das Wochenende.', '我期待周末。', 'verb'],
  ['sich interessieren', '感兴趣', 'Ich interessiere mich für Musik.', '我对音乐感兴趣。', 'verb'],
  ['sich beeilen', '赶快', 'Beeil dich, wir sind spät.', '赶快，我们要迟到了。', 'verb'],
  ['sich setzen', '坐下', 'Setzen Sie sich bitte.', '请坐。', 'verb'],
  ['sich ausruhen', '休息', 'Ich ruhe mich kurz aus.', '我休息一下。', 'verb'],
  ['sich erinnern', '记得', 'Ich erinnere mich nicht.', '我不记得了。', 'verb'],
  ['sich vorstellen', '自我介绍', 'Darf ich mich vorstellen?', '我可以自我介绍吗？', 'verb'],
  ['sich bedanken', '道谢', 'Ich möchte mich bedanken.', '我想表示感谢。', 'verb'],
  ['sich verabschieden', '告别', 'Ich verabschiede mich von dir.', '我向你告别。', 'verb'],
  ['sich entschuldigen', '道歉', 'Ich möchte mich entschuldigen.', '我想道歉。', 'verb'],
];

dailyFunc.forEach(([w, zh, exDe, exZh, pos], i) => {
  const idx = 311 + i;
  cards.push(card(idx, '日常功能', w, w, pos, '', '', zh, exDe, exZh, w, exDe));
});

// ====================================================================
// 验证与输出
// ====================================================================

console.log(`Generated ${cards.length} cards`);
console.log(`ID range: ${cards[0].id} to ${cards[cards.length - 1].id}`);
console.log(`globalOrder range: ${cards[0].globalOrder} to ${cards[cards.length - 1].globalOrder}`);

// 检查连续
for (let i = 1; i < cards.length; i++) {
  if (cards[i].globalOrder !== cards[i - 1].globalOrder + 1) {
    console.error(`Order gap at index ${i}: ${cards[i - 1].globalOrder} -> ${cards[i].globalOrder}`);
  }
  const expectedIdNum = START_ID + i;
  const actualIdNum = parseInt(cards[i].id.split('-')[1], 10);
  if (actualIdNum !== expectedIdNum) {
    console.error(`ID gap at index ${i}: expected DE-${pad(expectedIdNum)}, got ${cards[i].id}`);
  }
}

// 检查字段
const errors = [];
cards.forEach((c, i) => {
  if (!c.id) errors.push(`${i}: missing id`);
  if (c.level !== 'A1') errors.push(`${c.id}: wrong level`);
  if (c.batch !== '02') errors.push(`${c.id}: wrong batch`);
  if (!c.word) errors.push(`${c.id}: missing word`);
  if (!c.wordDisplay) errors.push(`${c.id}: missing wordDisplay`);
  if (c.copyText !== c.wordDisplay) errors.push(`${c.id}: copyText != wordDisplay`);
  if (!c.shortMeaningZh) errors.push(`${c.id}: missing shortMeaningZh`);
  if (c.shortMeaningZh && /[，。！？、]/.test(c.shortMeaningZh)) errors.push(`${c.id}: shortMeaningZh has punctuation`);
  if (!c.exampleDe) errors.push(`${c.id}: missing exampleDe`);
  if (!c.exampleZh) errors.push(`${c.id}: missing exampleZh`);
  if (!c.wordAudioUrl || !c.wordAudioUrl.includes(c.id)) errors.push(`${c.id}: bad wordAudioUrl`);
  if (!c.exampleAudioUrl || !c.exampleAudioUrl.includes(c.id)) errors.push(`${c.id}: bad exampleAudioUrl`);
  if (c.meaningAudioUrl && c.meaningAudioUrl.includes('/zh/')) errors.push(`${c.id}: meaningAudioUrl should be empty`);
  if (!c.wordAudioText) errors.push(`${c.id}: missing wordAudioText`);
  if (!c.exampleAudioText) errors.push(`${c.id}: missing exampleAudioText`);
  if (c.pronunciationStatus !== 'unchecked') errors.push(`${c.id}: wrong pronunciationStatus`);
  if (c.pronunciationNote !== '') errors.push(`${c.id}: pronunciationNote not empty`);
  if (c.completed !== undefined) errors.push(`${c.id}: has completed field`);
});

if (errors.length > 0) {
  console.error('Validation errors:', errors.slice(0, 20));
} else {
  console.log('All validations passed!');
}

// Stats
const cats = {};
const poses = {};
cards.forEach(c => {
  cats[c.category] = (cats[c.category] || 0) + 1;
  poses[c.partOfSpeech] = (poses[c.partOfSpeech] || 0) + 1;
});
console.log('\nCategories:', JSON.stringify(cats, null, 2));
console.log('\nParts of speech:', JSON.stringify(poses, null, 2));

// 输出 JSON
console.log('\n--- JSON OUTPUT ---');
console.log(JSON.stringify(cards, null, 2));
