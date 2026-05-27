/**
 * generate-batch-03-data.mjs — 第 03 批 A2 词卡数据生成
 *
 * 生成 DE-0651 到 DE-0975 共 325 张 A2 词卡。
 */

const BATCH = '03';
const LEVEL = 'A2';
const START_ID = 651;
const START_ORDER = 651;
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
// 日常安排 (40) — DE-0651 to DE-0690
// ====================================================================
const dailyPlan = [
  ['planen', '计划', 'verb', '', '', 'Ich plane eine Reise nach Berlin.', '我计划去柏林旅行。'],
  ['organisieren', '组织', 'verb', '', '', 'Wir organisieren ein Fest am Samstag.', '我们周六组织一个聚会。'],
  ['vereinbaren', '约定', 'verb', '', '', 'Wir haben einen Termin vereinbart.', '我们约好了一个时间。'],
  ['verschieben', '推迟', 'verb', '', '', 'Können wir den Termin verschieben?', '我们可以推迟这个预约吗？'],
  ['absagen', '取消', 'verb', '', '', 'Ich muss leider den Termin absagen.', '很遗憾我必须取消预约。'],
  ['bestätigen', '确认', 'verb', '', '', 'Bitte bestätigen Sie den Termin.', '请确认这个预约。'],
  ['notieren', '记下', 'verb', '', '', 'Ich notiere mir die Adresse.', '我把地址记下来。'],
  ['erledigen', '完成', 'verb', '', '', 'Ich muss noch viel erledigen.', '我还有很多事要完成。'],
  ['vorhaben', '打算', 'verb', '', '', 'Was hast du am Wochenende vor?', '你周末有什么打算？'],
  ['ausmachen', '约定', 'verb', '', '', 'Wir machen einen Treffpunkt aus.', '我们约定一个见面地点。'],
  ['der Termin', '预约', 'noun', 'der', 'die Termine', 'Ich habe einen Termin beim Arzt.','我在医生那里有个预约。'],
  ['der Plan', '计划', 'noun', 'der', 'die Pläne', 'Hast du einen Plan für morgen?','你明天有计划吗？'],
  ['die Verabredung', '约会', 'noun', 'die', 'die Verabredungen', 'Ich habe eine Verabredung um drei.','我三点有个约会。'],
  ['die Besprechung', '会议', 'noun', 'die', 'die Besprechungen', 'Die Besprechung beginnt um zehn.','会议十点开始。'],
  ['regelmäßig', '定期', 'adj', '', '', 'Ich mache regelmäßig Sport.','我定期做运动。'],
  ['täglich', '每天', 'adv', '', '', 'Ich lerne täglich Deutsch.','我每天学德语。'],
  ['wöchentlich', '每周', 'adv', '', '', 'Wir treffen uns wöchentlich.','我们每周见面。'],
  ['monatlich', '每月', 'adv', '', '', 'Die Miete ist monatlich zu zahlen.','房租每月支付。'],
  ['pünktlich', '准时', 'adj', '', '', 'Bitte sei pünktlich um acht.','请八点准时到。'],
  ['rechtzeitig', '及时', 'adv', '', '', 'Komm bitte rechtzeitig nach Hause.','请及时回家。'],
  ['vorher', '事先', 'adv', '', '', 'Ruf bitte vorher an.','请事先打电话。'],
  ['danach', '之后', 'adv', '', '', 'Was machst du danach?','你之后做什么？'],
  ['während', '在…期间', 'prep', '', '', 'Während des Kurses sprechen wir Deutsch.','课程期间我们说德语。'],
  ['solange', '只要', 'conj', '', '', 'Solange du lernst, wirst du besser.','只要你学习，你就会进步。'],
  ['sobald', '一旦', 'conj', '', '', 'Sobald ich fertig bin, rufe ich an.','我一完成就打电话。'],
  ['sowieso', '反正', 'adv', '', '', 'Ich komme sowieso mit.','我反正一起去。'],
  ['mindestens', '至少', 'adv', '', '', 'Du brauchst mindestens eine Stunde.','你至少需要一小时。'],
  ['höchstens', '最多', 'adv', '', '', 'Es dauert höchstens zehn Minuten.','最多十分钟。'],
  ['ungefähr', '大约', 'adv', '', '', 'Es ist ungefähr drei Uhr.','现在大约三点。'],
  ['circa', '大约', 'adv', '', '', 'Wir brauchen circa zwanzig Minuten.','我们需要大约二十分钟。'],
  ['endlich', '终于', 'adv', '', '', 'Endlich habe ich den Test bestanden.','我终于通过了考试。'],
  ['vor kurzem', '不久前', 'adv', '', '', 'Ich habe vor kurzem Deutsch gelernt.','我不久前学了德语。'],
  ['neulich', '最近', 'adv', '', '', 'Neulich habe ich Anna getroffen.','我最近遇到了安娜。'],
  ['inzwischen', '在此期间', 'adv', '', '', 'Inzwischen habe ich viel gelernt.','在此期间我学到了很多。'],
  ['mittlerweile', '与此同时', 'adv', '', '', 'Mittlerweile spreche ich gut Deutsch.','与此同时我德语说得不错。'],
  ['dringend', '紧急', 'adj', '', '', 'Ich muss dringend mit dir sprechen.','我必须紧急和你谈谈。'],
  ['wichtig', '重要', 'adj', '', '', 'Der Termin ist sehr wichtig.','这个预约很重要。'],
  ['notwendig', '必要', 'adj', '', '', 'Ein Pass ist notwendig für die Reise.','旅行需要护照。'],
  ['möglichst', '尽可能', 'adv', '', '', 'Bitte kommen Sie möglichst früh.','请尽可能早来。'],
  ['lieber', '宁可', 'adv', '', '', 'Ich bleibe lieber zu Hause.','我宁可待在家里。'],
];

dailyPlan.forEach(([w, zh, pos, article, plural, exDe, exZh], i) => {
  const idx = i + 1;
  const wd = (pos === 'noun' && article) ? `${article} ${w}` : w;
  cards.push(card(idx, '日常安排', w, wd, pos, article || '', plural || '', zh, exDe, exZh, wd, exDe));
});

// ====================================================================
// 学习工作 (40) — DE-0691 to DE-0730
// ====================================================================
const learnWork = [
  ['der Beruf', '职业', 'noun', 'der', 'die Berufe', 'Was ist dein Beruf?','你的职业是什么？'],
  ['die Erfahrung', '经验', 'noun', 'die', 'die Erfahrungen', 'Ich habe Erfahrung mit Kindern.','我有照顾孩子的经验。'],
  ['die Ausbildung', '培训', 'noun', 'die', 'die Ausbildungen', 'Sie macht eine Ausbildung zur Köchin.','她在接受厨师培训。'],
  ['das Praktikum', '实习', 'noun', 'das', 'die Praktika', 'Ich mache ein Praktikum bei Siemens.','我在西门子实习。'],
  ['die Bewerbung', '求职申请', 'noun', 'die', 'die Bewerbungen', 'Meine Bewerbung ist fertig.','我的求职申请准备好了。'],
  ['der Lebenslauf', '简历', 'noun', 'der', 'die Lebensläufe', 'Bitte schicken Sie Ihren Lebenslauf.','请发送您的简历。'],
  ['das Vorstellungsgespräch', '面试', 'noun', 'das', 'die Vorstellungsgespräche', 'Morgen habe ich ein Vorstellungsgespräch.','明天我有个面试。'],
  ['verdienen', '挣钱', 'verb', '', '', 'Wie viel verdienst du im Monat?','你每月挣多少钱？'],
  ['kündigen', '辞职', 'verb', '', '', 'Er hat seinen Job gekündigt.','他辞掉了他的工作。'],
  ['sich bewerben', '申请', 'verb', '', '', 'Ich bewerbe mich um die Stelle.','我申请这个职位。'],
  ['einstellen', '聘用', 'verb', '', '', 'Die Firma stellt neue Leute ein.','公司在招聘新人。'],
  ['überstunden machen', '加班', 'verb', '', '', 'Ich muss heute Überstunden machen.','我今天必须加班。'],
  ['frei haben', '休息', 'verb', '', '', 'Am Sonntag habe ich frei.','我周日休息。'],
  ['urlaub nehmen', '请假/休假', 'verb', '', '', 'Ich nehme nächste Woche Urlaub.','我下周休假。'],
  ['sich krankmelden', '请病假', 'verb', '', '', 'Ich muss mich heute krankmelden.','我今天必须请病假。'],
  ['zurückrufen', '回电话', 'verb', '', '', 'Kannst du mich später zurückrufen?','你能晚点回我电话吗？'],
  ['weiterleiten', '转发', 'verb', '', '', 'Ich leite Ihnen die E-Mail weiter.','我把邮件转发给您。'],
  ['sich vorbereiten', '准备', 'verb', '', '', 'Ich bereite mich auf die Prüfung vor.','我在为考试做准备。'],
  ['der Kollege', '同事', 'noun', 'der', 'die Kollegen', 'Mein Kollege hilft mir bei der Arbeit.','我同事在工作上帮我。'],
  ['die Kollegin', '女同事', 'noun', 'die', 'die Kolleginnen', 'Die Kollegin kommt aus Italien.','这位女同事来自意大利。'],
  ['die Bescheinigung', '证明', 'noun', 'die', 'die Bescheinigungen', 'Brauchen Sie eine Bescheinigung?','您需要一份证明吗？'],
  ['die Unterschrift', '签名', 'noun', 'die', 'die Unterschriften', 'Hier fehlt noch Ihre Unterschrift.','这里还缺您的签名。'],
  ['unterschreiben', '签字', 'verb', '', '', 'Unterschreiben Sie bitte hier.','请在这里签字。'],
  ['ausdrucken', '打印', 'verb', '', '', 'Kannst du das Formular ausdrucken?','你能打印这份表格吗？'],
  ['scannen', '扫描', 'verb', '', '', 'Ich scanne die Dokumente ein.','我扫描这些文件。'],
  ['kopieren', '复印', 'verb', '', '', 'Können Sie das bitte kopieren?','您能复印一下吗？'],
  ['die Notiz', '笔记', 'noun', 'die', 'die Notizen', 'Ich mache mir ein paar Notizen.','我做些笔记。'],
  ['der Zettel', '便条', 'noun', 'der', 'die Zettel', 'Schreib es auf einen Zettel.','写在便条上。'],
  ['der Bericht', '报告', 'noun', 'der', 'die Berichte', 'Der Bericht ist noch nicht fertig.','报告还没完成。'],
  ['zusammenfassen', '总结', 'verb', '', '', 'Fassen Sie den Text kurz zusammen.','请简短总结这篇课文。'],
  ['präsentieren', '展示', 'verb', '', '', 'Wir präsentieren unser Projekt morgen.','我们明天展示我们的项目。'],
  ['teilnehmen', '参加', 'verb', '', '', 'Ich nehme an einem Deutschkurs teil.','我参加一个德语课程。'],
  ['der Vortrag', '讲座', 'noun', 'der', 'die Vorträge', 'Der Vortrag war sehr interessant.','这个讲座很有趣。'],
  ['empfehlen', '推荐', 'verb', '', '', 'Kannst du ein gutes Buch empfehlen?','你能推荐一本好书吗？'],
  ['folgen', '跟随', 'verb', '', '', 'Folgen Sie mir bitte.','请跟我来。'],
  ['erreichen', '达到', 'verb', '', '', 'Wie kann ich Sie erreichen?','我怎么能联系到您？'],
  ['sich kümmern um', '负责', 'verb', '', '', 'Ich kümmere mich um das Problem.','我来处理这个问题。'],
  ['zuständig sein', '负责', 'adj', '', '', 'Wer ist dafür zuständig?','谁负责这个？'],
  ['verantwortlich', '有责任的', 'adj', '', '', 'Ich bin verantwortlich für das Team.','我负责这个团队。'],
  ['selbstständig', '独立地', 'adv', '', '', 'Sie arbeitet sehr selbstständig.','她工作非常独立。'],
];

learnWork.forEach(([w, zh, pos, article, plural, exDe, exZh], i) => {
  const idx = 41 + i;
  const wd = (pos === 'noun' && article) ? `${article} ${w}` : w;
  cards.push(card(idx, '学习工作', w, wd, pos, article || '', plural || '', zh, exDe, exZh, wd, exDe));
});

// ====================================================================
// 旅行交通 (35) — DE-0731 to DE-0765
// ====================================================================
const travel = [
  ['die Reise', '旅行', 'noun', 'die', 'die Reisen', 'Die Reise nach Berlin war toll.','柏林之旅很棒。'],
  ['der Flug', '航班', 'noun', 'der', 'die Flüge', 'Der Flug dauert zwei Stunden.','航班飞两小时。'],
  ['buchen', '预订', 'verb', '', '', 'Ich buche ein Hotelzimmer online.','我在网上订了一个酒店房间。'],
  ['stornieren', '取消', 'verb', '', '', 'Kann ich die Buchung stornieren?','我可以取消预订吗？'],
  ['umsteigen', '换乘', 'verb', '', '', 'Wir müssen in München umsteigen.','我们必须在慕尼黑换乘。'],
  ['der Anschluss', '衔接车次', 'noun', 'der', 'die Anschlüsse', 'Ich habe meinen Anschluss verpasst.','我错过了衔接车次。'],
  ['die Verspätung', '晚点', 'noun', 'die', 'die Verspätungen', 'Der Zug hat 20 Minuten Verspätung.','火车晚点20分钟。'],
  ['sich verspäten', '迟到', 'verb', '', '', 'Ich verspäte mich um zehn Minuten.','我迟到十分钟。'],
  ['abfahren', '出发', 'verb', '', '', 'Der Bus fährt um acht ab.','公交八点出发。'],
  ['ankommen', '到达', 'verb', '', '', 'Wann kommen wir in Berlin an?','我们什么时候到柏林？'],
  ['abholen', '接', 'verb', '', '', 'Kannst du mich vom Bahnhof abholen?','你能到火车站接我吗？'],
  ['hinbringen', '送去', 'verb', '', '', 'Ich bringe dich zum Flughafen.','我送你去机场。'],
  ['der Koffer', '行李箱', 'noun', 'der', 'die Koffer', 'Mein Koffer ist sehr schwer.','我的行李箱很重。'],
  ['das Gepäck', '行李', 'noun', 'das', '', 'Wo kann ich mein Gepäck abgeben?','我在哪里可以寄存行李？'],
  ['einchecken', '办理登机', 'verb', '', '', 'Wir checken online ein.','我们在网上办理登机。'],
  ['der Ausweis', '证件', 'noun', 'der', 'die Ausweise', 'Haben Sie Ihren Ausweis dabei?','您带证件了吗？'],
  ['der Reisepass', '护照', 'noun', 'der', 'die Reisepässe', 'Mein Reisepass ist noch gültig.','我的护照还有效。'],
  ['die Fahrkarte', '车票', 'noun', 'die', 'die Fahrkarten', 'Wo kann ich eine Fahrkarte kaufen?','我在哪里可以买车票？'],
  ['die Richtung', '方向', 'noun', 'die', 'die Richtungen', 'In welche Richtung fährt der Zug?','火车往哪个方向开？'],
  ['überqueren', '穿过', 'verb', '', '', 'Wir überqueren die Straße vorsichtig.','我们小心地过马路。'],
  ['die Kreuzung', '十字路口', 'noun', 'die', 'die Kreuzungen', 'Biegen Sie an der Kreuzung links ab.','请在十字路口左转。'],
  ['die Brücke', '桥', 'noun', 'die', 'die Brücken', 'Gehen Sie über die Brücke.','走过那座桥。'],
  ['der Stadtplan', '城市地图', 'noun', 'der', 'die Stadtpläne', 'Hast du einen Stadtplan von Berlin?','你有柏林的城市地图吗？'],
  ['sich verlaufen', '迷路', 'verb', '', '', 'Ich habe mich in der Stadt verlaufen.','我在城里迷路了。'],
  ['zeigen', '指', 'verb', '', '', 'Können Sie mir den Weg zeigen?','您能给我指路吗？'],
  ['entlang', '沿着', 'prep', '', '', 'Gehen Sie die Straße entlang.','沿着这条街走。'],
  ['vorbei an', '经过', 'prep', '', '', 'Wir kommen an der Kirche vorbei.','我们经过教堂。'],
  ['weit entfernt', '遥远', 'adj', '', '', 'Das ist nicht weit entfernt.','那不远。'],
  ['in der Nähe', '在附近', 'adv', '', '', 'Gibt es hier ein Restaurant in der Nähe?','这附近有餐厅吗？'],
  ['unterwegs', '在路上', 'adv', '', '', 'Ich bin schon unterwegs.','我已经在路上了。'],
  ['die Strecke', '路段', 'noun', 'die', 'die Strecken', 'Die Strecke ist etwa zehn Kilometer lang.','这段路大约十公里长。'],
  ['der Stau', '堵车', 'noun', 'der', 'die Staus', 'Es gibt viel Stau auf der Autobahn.','高速公路上有很多堵车。'],
  ['parken', '停车', 'verb', '', '', 'Wo kann ich hier parken?','我可以在哪里停车？'],
  ['das Parkhaus', '停车场', 'noun', 'das', 'die Parkhäuser', 'Das Parkhaus ist voll.','停车场满了。'],
  ['die Tankstelle', '加油站', 'noun', 'die', 'die Tankstellen', 'Wo ist die nächste Tankstelle?','最近的加油站在哪里？'],
];

travel.forEach(([w, zh, pos, article, plural, exDe, exZh], i) => {
  const idx = 81 + i;
  const wd = (pos === 'noun' && article) ? `${article} ${w}` : w;
  cards.push(card(idx, '旅行交通', w, wd, pos, article || '', plural || '', zh, exDe, exZh, wd, exDe));
});

// ====================================================================
// 预约沟通 (30) — DE-0766 to DE-0795
// ====================================================================
const appointments = [
  ['anrufen', '打电话', 'verb', '', '', 'Ich rufe Sie morgen Vormittag an.','我明天上午给您打电话。'],
  ['durchrufen', '拨通', 'verb', '', '', 'Können Sie bitte später durchrufen?','您能稍后再拨吗？'],
  ['die Leitung', '线路', 'noun', 'die', 'die Leitungen', 'Die Leitung ist leider besetzt.','很遗憾线路正忙。'],
  ['besetzt', '占线', 'adj', '', '', 'Es ist besetzt, ich rufe später an.','占线，我稍后打。'],
  ['die Nachricht', '消息', 'noun', 'die', 'die Nachrichten', 'Hinterlassen Sie eine Nachricht bitte.','请留言。'],
  ['hinterlassen', '留下', 'verb', '', '', 'Kann ich eine Nachricht hinterlassen?','我可以留个消息吗？'],
  ['weitergeben', '转达', 'verb', '', '', 'Ich gebe die Nachricht gern weiter.','我很乐意转达消息。'],
  ['sich melden', '联系', 'verb', '', '', 'Melden Sie sich bitte bald.','请尽快联系。'],
  ['die Rückmeldung', '回复', 'noun', 'die', 'die Rückmeldungen', 'Ich warte auf Ihre Rückmeldung.','我等待您的回复。'],
  ['besprechen', '讨论', 'verb', '', '', 'Wir müssen das noch besprechen.','我们还需要讨论这个。'],
  ['klären', '澄清', 'verb', '', '', 'Können wir das kurz klären?','我们能简短澄清一下吗？'],
  ['sich beschweren', '投诉', 'verb', '', '', 'Ich möchte mich über den Service beschweren.','我想投诉这个服务。'],
  ['sich entschuldigen', '道歉', 'verb', '', '', 'Ich möchte mich für den Fehler entschuldigen.','我想为这个错误道歉。'],
  ['mitteilen', '告知', 'verb', '', '', 'Ich möchte Ihnen etwas mitteilen.','我想告知您一些事情。'],
  ['ankündigen', '宣布', 'verb', '', '', 'Der Chef hat den Termin angekündigt.','老板宣布了这个日期。'],
  ['der Vorschlag', '建议', 'noun', 'der', 'die Vorschläge', 'Haben Sie einen besseren Vorschlag?','您有更好的建议吗？'],
  ['vorschlagen', '提议', 'verb', '', '', 'Ich schlage vor, dass wir später anfangen.','我提议我们晚一点开始。'],
  ['ablehnen', '拒绝', 'verb', '', '', 'Ich muss das Angebot leider ablehnen.','很遗憾我必须拒绝这个提议。'],
  ['annehmen', '接受', 'verb', '', '', 'Ich nehme den Vorschlag gern an.','我很乐意接受这个建议。'],
  ['sich einigen', '达成一致', 'verb', '', '', 'Wir haben uns auf einen Preis geeinigt.','我们就价格达成了一致。'],
  ['der Kompromiss', '妥协', 'noun', 'der', 'die Kompromisse', 'Wir finden einen Kompromiss.','我们找一个妥协方案。'],
  ['die Lösung', '解决方案', 'noun', 'die', 'die Lösungen', 'Gibt es eine andere Lösung?','有别的解决方案吗？'],
  ['die Bedingung', '条件', 'noun', 'die', 'die Bedingungen', 'Unter dieser Bedingung mache ich es.','在这个条件下我做。'],
  ['abhängig von', '取决于', 'adj', '', '', 'Das ist abhängig vom Wetter.','这取决于天气。'],
  ['eigentlich', '其实', 'adv', '', '', 'Eigentlich wollte ich früher kommen.','其实我想早点来的。'],
  ['jedenfalls', '无论如何', 'adv', '', '', 'Jedenfalls danke ich Ihnen sehr.','无论如何非常感谢您。'],
  ['trotzdem', '尽管如此', 'adv', '', '', 'Es war schwer, aber ich habe es trotzdem geschafft.','虽然很难，但我还是做到了。'],
  ['deshalb', '因此', 'adv', '', '', 'Ich war krank, deshalb bin ich zu Hause geblieben.','我生病了，因此待在家里。'],
  ['darum', '所以', 'adv', '', '', 'Es ist wichtig, darum mache ich es sofort.','这很重要，所以我马上去做。'],
  ['schließlich', '最终', 'adv', '', '', 'Schließlich haben wir es geschafft.','最终我们完成了。'],
];

appointments.forEach(([w, zh, pos, article, plural, exDe, exZh], i) => {
  const idx = 116 + i;
  const wd = (pos === 'noun' && article) ? `${article} ${w}` : w;
  cards.push(card(idx, '预约沟通', w, wd, pos, article || '', plural || '', zh, exDe, exZh, wd, exDe));
});

// ====================================================================
// 简单邮件 (25) — DE-0796 to DE-0820
// ====================================================================
const email = [
  ['die E-Mail', '电子邮件', 'noun', 'die', 'die E-Mails', 'Ich schreibe Ihnen eine kurze E-Mail.','我给您写一封简短的邮件。'],
  ['der Betreff', '主题', 'noun', 'der', 'die Betreffe', 'Bitte geben Sie einen Betreff an.','请填写主题。'],
  ['der Anhang', '附件', 'noun', 'der', 'die Anhänge', 'Den Vertrag finden Sie im Anhang.','合同在附件中。'],
  ['anhängen', '附上', 'verb', '', '', 'Ich hänge die Datei an.','我附上文件。'],
  ['erhalten', '收到', 'verb', '', '', 'Ich habe Ihre E-Mail erhalten.','我收到了您的邮件。'],
  ['beantworten', '回复', 'verb', '', '', 'Ich beantworte Ihre Frage gern.','我很乐意回答您的问题。'],
  ['senden', '发送', 'verb', '', '', 'Bitte senden Sie mir die Unterlagen.','请把材料发给我。'],
  ['verschicken', '寄出', 'verb', '', '', 'Ich verschicke das Paket heute.','我今天寄出包裹。'],
  ['die Adresse', '地址', 'noun', 'die', 'die Adressen', 'Wie ist Ihre E-Mail-Adresse?','您的电子邮件地址是什么？'],
  ['die Telefonnummer', '电话号码', 'noun', 'die', 'die Telefonnummern', 'Geben Sie mir Ihre Telefonnummer.','请给我您的电话号码。'],
  ['der Absender', '发件人', 'noun', 'der', 'die Absender', 'Wer ist der Absender?','发件人是谁？'],
  ['der Empfänger', '收件人', 'noun', 'der', 'die Empfänger', 'Der Empfänger ist nicht erreichbar.','收件人无法联系。'],
  ['sich bedanken', '感谢', 'verb', '', '', 'Ich möchte mich herzlich bedanken.','我想衷心感谢。'],
  ['sich verabschieden', '道别', 'verb', '', '', 'Ich verabschiede mich bis zum nächsten Mal.','我道别了，下次见。'],
  ['mit freundlichen Grüßen', '此致敬礼', 'phrase', '', '', 'Mit freundlichen Grüßen, Thomas Müller.','此致敬礼，托马斯·穆勒。'],
  ['baldmöglichst', '尽快', 'adv', '', '', 'Bitte antworten Sie baldmöglichst.','请尽快回复。'],
  ['die Unterlage', '文件', 'noun', 'die', 'die Unterlagen', 'Ich brauche die Unterlagen für morgen.','我需要这些文件明天用。'],
  ['das Formular', '表格', 'noun', 'das', 'die Formulare', 'Füllen Sie bitte das Formular aus.','请填写表格。'],
  ['ausfüllen', '填写', 'verb', '', '', 'Haben Sie das Formular ausgefüllt?','您填好表格了吗？'],
  ['einreichen', '提交', 'verb', '', '', 'Bitte reichen Sie die Unterlagen ein.','请提交这些材料。'],
  ['beilegen', '附入', 'verb', '', '', 'Ich lege eine Kopie des Passes bei.','我附上一份护照复印件。'],
  ['erwähnen', '提及', 'verb', '', '', 'Das habe ich schon in der E-Mail erwähnt.','我在邮件里已经提到了。'],
  ['die Information', '信息', 'noun', 'die', 'die Informationen', 'Vielen Dank für die Information.','感谢您的信息。'],
  ['die Anfrage', '询问', 'noun', 'die', 'die Anfragen', 'Vielen Dank für Ihre Anfrage.','感谢您的询问。'],
  ['die Bestätigung', '确认函', 'noun', 'die', 'die Bestätigungen', 'Ich warte noch auf die Bestätigung.','我还在等确认函。'],
];

email.forEach(([w, zh, pos, article, plural, exDe, exZh], i) => {
  const idx = 146 + i;
  const wd = (pos === 'noun' && article) ? `${article} ${w}` : w;
  cards.push(card(idx, '简单邮件', w, wd, pos, article || '', plural || '', zh, exDe, exZh, wd, exDe));
});

// ====================================================================
// 原因说明 (30) — DE-0821 to DE-0850
// ====================================================================
const reasons = [
  ['weil', '因为', 'conj', '', '', 'Ich lerne Deutsch, weil es mir gefällt.','我学德语，因为我喜欢它。'],
  ['denn', '因为', 'conj', '', '', 'Ich kann nicht kommen, denn ich bin krank.','我不能来，因为我生病了。'],
  ['deshalb', '所以', 'adv', '', '', 'Es regnet, deshalb bleibe ich zu Hause.','下雨了，所以我待在家。'],
  ['darum', '因此', 'adv', '', '', 'Das ist wichtig, darum sage ich es dir.','这很重要，所以我才告诉你。'],
  ['wegen', '由于', 'prep', '', '', 'Wegen des Regens bleiben wir drinnen.','由于下雨我们待在室内。'],
  ['aus diesem Grund', '出于这个原因', 'phrase', '', '', 'Aus diesem Grund kann ich heute nicht kommen.','出于这个原因我今天不能来。'],
  ['nämlich', '也就是说', 'adv', '', '', 'Ich kann nicht kommen, ich bin nämlich krank.','我不能来，也就是说我生病了。'],
  ['tatsächlich', '事实上', 'adv', '', '', 'Tatsächlich habe ich es schon erledigt.','事实上我已经做完了。'],
  ['ehrlich gesagt', '老实说', 'phrase', '', '', 'Ehrlich gesagt, ich weiß es nicht.','老实说，我不知道。'],
  ['der Grund', '原因', 'noun', 'der', 'die Gründe', 'Was ist der Grund dafür?','这是什么原因？'],
  ['die Ursache', '起因', 'noun', 'die', 'die Ursachen', 'Die Ursache des Problems ist unbekannt.','问题的起因不明。'],
  ['die Folge', '结果', 'noun', 'die', 'die Folgen', 'Das hat vielleicht negative Folgen.','这可能会有负面结果。'],
  ['sich lohnen', '值得', 'verb', '', '', 'Es lohnt sich, Deutsch zu lernen.','学德语是值得的。'],
  ['der Vorteil', '优点', 'noun', 'der', 'die Vorteile', 'Der Vorteil ist, dass es billiger ist.','优点是更便宜。'],
  ['der Nachteil', '缺点', 'noun', 'der', 'die Nachteile', 'Ein Nachteil ist der hohe Preis.','一个缺点是价格高。'],
  ['vergleichen mit', '与…相比', 'verb', '', '', 'Verglichen mit gestern ist es heute kalt.','与昨天相比今天很冷。'],
  ['je nach', '根据', 'prep', '', '', 'Je nach Wetter gehen wir spazieren.','根据天气我们可能去散步。'],
  ['laut', '根据', 'prep', '', '', 'Laut Wetterbericht regnet es morgen.','根据天气预报明天下雨。'],
  ['zufällig', '偶然', 'adv', '', '', 'Ich habe sie zufällig getroffen.','我偶然遇见了她。'],
  ['absichtlich', '故意', 'adv', '', '', 'Das habe ich nicht absichtlich gemacht.','我不是故意这么做的。'],
  ['aus Versehen', '不小心', 'adv', '', '', 'Ich habe aus Versehen den falschen Knopf gedrückt.','我不小心按错了按钮。'],
  ['mit Absicht', '故意', 'adv', '', '', 'Das war mit Absicht.','这是故意的。'],
  ['scheinbar', '看样子', 'adv', '', '', 'Scheinbar hat er keine Zeit.','看样子他没有时间。'],
  ['offenbar', '显然', 'adv', '', '', 'Offenbar ist etwas passiert.','显然发生了什么事。'],
  ['anscheinend', '似乎', 'adv', '', '', 'Anscheinend kommt der Zug zu spät.','火车似乎晚点了。'],
  ['möglicherweise', '可能', 'adv', '', '', 'Möglicherweise regnet es morgen.','明天可能下雨。'],
  ['bestimmt', '一定', 'adv', '', '', 'Das stimmt bestimmt so.','这样一定是对的。'],
  ['sicherlich', '肯定', 'adv', '', '', 'Sicherlich können wir das lösen.','我们肯定能解决这个问题。'],
  ['kaum', '几乎不', 'adv', '', '', 'Ich kann das kaum glauben.','我几乎不能相信。'],
  ['gar nicht', '完全不', 'adv', '', '', 'Das stimmt gar nicht.','这完全不对。'],
];

reasons.forEach(([w, zh, pos, article, plural, exDe, exZh], i) => {
  const idx = 171 + i;
  const wd = (pos === 'noun' && article) ? `${article} ${w}` : w;
  cards.push(card(idx, '原因说明', w, wd, pos, article || '', plural || '', zh, exDe, exZh, wd, exDe));
});

// ====================================================================
// 时间表达 (30) — DE-0851 to DE-0880
// ====================================================================
const timeExpr = [
  ['am Vormittag', '在上午', 'adv', '', '', 'Am Vormittag habe ich einen Kurs.','上午我有一节课。'],
  ['am Nachmittag', '在下午', 'adv', '', '', 'Am Nachmittag treffe ich Freunde.','下午我和朋友见面。'],
  ['gegen Mittag', '中午前后', 'adv', '', '', 'Wir essen gegen Mittag.','我们中午前后吃饭。'],
  ['am frühen Morgen', '清晨', 'adv', '', '', 'Am frühen Morgen ist es noch dunkel.','清晨天还黑。'],
  ['spät am Abend', '深夜', 'adv', '', '', 'Spät am Abend komme ich nach Hause.','深夜我回到家。'],
  ['die ganze Woche', '一整周', 'adv', '', '', 'Ich habe die ganze Woche gearbeitet.','我工作了一整周。'],
  ['jede Woche', '每周', 'adv', '', '', 'Jede Woche gehe ich zum Sport.','我每周去运动。'],
  ['zweimal pro Woche', '每周两次', 'adv', '', '', 'Ich lerne zweimal pro Woche Deutsch.','我每周学两次德语。'],
  ['vor einer Woche', '一周前', 'adv', '', '', 'Vor einer Woche war ich in Hamburg.','一周前我在汉堡。'],
  ['in einer Woche', '一周后', 'adv', '', '', 'In einer Woche fahre ich nach Berlin.','一周后我去柏林。'],
  ['am Wochenende', '在周末', 'adv', '', '', 'Am Wochenende habe ich frei.','我周末休息。'],
  ['nächstes Mal', '下次', 'adv', '', '', 'Nächstes Mal komme ich früher.','下次我早点来。'],
  ['letztes Mal', '上次', 'adv', '', '', 'Letztes Mal hat es gut geklappt.','上次很顺利。'],
  ['diesmal', '这次', 'adv', '', '', 'Diesmal mache ich es anders.','这次我换个方式做。'],
  ['beim nächsten Mal', '下次…时', 'adv', '', '', 'Beim nächsten Mal bringe ich Kuchen mit.','下次我带蛋糕来。'],
  ['in letzter Zeit', '最近', 'adv', '', '', 'In letzter Zeit habe ich viel zu tun.','最近我有很多事要做。'],
  ['seit kurzem', '从最近开始', 'adv', '', '', 'Seit kurzem wohne ich in Berlin.','我从最近开始住在柏林。'],
  ['seit langem', '很久以来', 'adv', '', '', 'Ich kenne ihn seit langem.','我认识他很久了。'],
  ['damals', '当时', 'adv', '', '', 'Damals war ich noch Student.','当时我还是学生。'],
  ['früher', '以前', 'adv', '', '', 'Früher habe ich in München gewohnt.','以前我住在慕尼黑。'],
  ['heutzutage', '如今', 'adv', '', '', 'Heutzutage ist alles teurer.','如今一切都更贵了。'],
  ['zurzeit', '目前', 'adv', '', '', 'Zurzeit arbeite ich bei einer Bank.','目前我在一家银行工作。'],
  ['momentan', '目前', 'adv', '', '', 'Momentan habe ich leider keine Zeit.','目前很遗憾我没有时间。'],
  ['vorläufig', '暂时', 'adv', '', '', 'Vorläufig bleibt das so.','暂时就这样。'],
  ['einstweilen', '暂时', 'adv', '', '', 'Einstweilen warten wir hier.','我们暂时在这里等。'],
  ['bisher', '迄今为止', 'adv', '', '', 'Bisher habe ich noch keine Antwort.','迄今为止我还没有回复。'],
  ['ab jetzt', '从现在起', 'adv', '', '', 'Ab jetzt sprechen wir nur Deutsch.','从现在起我们只说德语。'],
  ['ab morgen', '从明天起', 'adv', '', '', 'Ab morgen mache ich eine Diät.','从明天起我节食。'],
  ['so früh wie möglich', '尽可能早', 'adv', '', '', 'Bitte kommen Sie so früh wie möglich.','请尽可能早来。'],
  ['spätestens', '最迟', 'adv', '', '', 'Bitte melden Sie sich spätestens am Freitag.','请最迟周五回复。'],
];

timeExpr.forEach(([w, zh, pos, article, plural, exDe, exZh], i) => {
  const idx = 201 + i;
  const wd = (pos === 'noun' && article) ? `${article} ${w}` : w;
  cards.push(card(idx, '时间表达', w, wd, pos, article || '', plural || '', zh, exDe, exZh, wd, exDe));
});

// ====================================================================
// 过去经历 (35) — DE-0881 to DE-0915
// ====================================================================
const past = [
  ['gestern', '昨天', 'adv', '', '', 'Gestern war ich im Kino.','昨天我去看了电影。'],
  ['vorgestern', '前天', 'adv', '', '', 'Vorgestern habe ich Anna getroffen.','前天我遇到了安娜。'],
  ['letzte Woche', '上周', 'adv', '', '', 'Letzte Woche war ich krank.','上周我生病了。'],
  ['letzten Monat', '上个月', 'adv', '', '', 'Letzten Monat habe ich einen Kurs gemacht.','上个月我参加了一个课程。'],
  ['letztes Jahr', '去年', 'adv', '', '', 'Letztes Jahr war ich in Österreich.','去年我去了奥地利。'],
  ['vor einem Jahr', '一年前', 'adv', '', '', 'Vor einem Jahr konnte ich kein Deutsch.','一年前我不会德语。'],
  ['früher', '从前', 'adv', '', '', 'Früher bin ich viel gereist.','从前我经常旅行。'],
  ['zuerst', '起初', 'adv', '', '', 'Zuerst war alles schwer.','起初一切都很困难。'],
  ['dann', '然后', 'adv', '', '', 'Dann habe ich mehr geübt.','然后我更多练习了。'],
  ['plötzlich', '突然', 'adv', '', '', 'Plötzlich hat es angefangen zu regnen.','突然开始下雨了。'],
  ['auf einmal', '突然', 'adv', '', '', 'Auf einmal war die Straße leer.','突然街上就空了。'],
  ['passieren', '发生', 'verb', '', '', 'Was ist passiert?','发生了什么事？'],
  ['geschehen', '发生', 'verb', '', '', 'Ein Unfall ist geschehen.','发生了一起事故。'],
  ['erleben', '经历', 'verb', '', '', 'Ich habe viel Schönes erlebt.','我经历了很多美好的事。'],
  ['sich erinnern an', '回忆起', 'verb', '', '', 'Ich erinnere mich gern an die Reise.','我愉快地回忆起那次旅行。'],
  ['vergessen', '忘记', 'verb', '', '', 'Ich habe meinen Schlüssel vergessen.','我忘了我的钥匙。'],
  ['verlieren', '丢失', 'verb', '', '', 'Ich habe mein Handy verloren.','我丢了我的手机。'],
  ['wiedergefunden', '重新找到', 'verb', '', '', 'Zum Glück habe ich den Schlüssel wiedergefunden.','幸运的是我重新找到了钥匙。'],
  ['ausgehen', '外出', 'verb', '', '', 'Gestern Abend sind wir ausgegangen.','昨晚我们外出了。'],
  ['mitkommen', '一起去', 'verb', '', '', 'Willst du mitkommen?','你要一起去吗？'],
  ['dabeisein', '在场', 'verb', '', '', 'Ich war bei der Feier dabei.','我参加了庆祝会。'],
  ['stattfinden', '举行', 'verb', '', '', 'Das Konzert findet am Samstag statt.','音乐会周六举行。'],
  ['feiern', '庆祝', 'verb', '', '', 'Wir haben die ganze Nacht gefeiert.','我们庆祝了一整夜。'],
  ['einladen', '邀请', 'verb', '', '', 'Ich lade dich zu meiner Party ein.','我邀请你来我的派对。'],
  ['bekommen', '收到', 'verb', '', '', 'Was hast du zum Geburtstag bekommen?','你生日收到了什么？'],
  ['schenken', '赠送', 'verb', '', '', 'Ich schenke ihr eine Kette.','我送她一条项链。'],
  ['sich freuen über', '为…高兴', 'verb', '', '', 'Ich freue mich über das Geschenk.','我为这份礼物高兴。'],
  ['sich ärgern über', '为…生气', 'verb', '', '', 'Ich ärgere mich über den Stau.','我为堵车生气。'],
  ['sich wundern über', '对…感到惊讶', 'verb', '', '', 'Ich wundere mich über den Preis.','我对这个价格感到惊讶。'],
  ['sich gewöhnen an', '适应', 'verb', '', '', 'Ich gewöhne mich langsam an das Wetter.','我慢慢适应了天气。'],
  ['klappen', '成功', 'verb', '', '', 'Alles hat gut geklappt.','一切都很顺利。'],
  ['gelingen', '成功', 'verb', '', '', 'Die Prüfung ist mir gelungen.','我考试成功了。'],
  ['misslingen', '失败', 'verb', '', '', 'Der Versuch ist leider misslungen.','这次尝试不幸失败了。'],
  ['schaffen', '做到', 'verb', '', '', 'Ich habe es endlich geschafft!','我终于做到了！'],
  ['aufgeben', '放弃', 'verb', '', '', 'Gib nicht auf, du schaffst das.','别放弃，你能做到。'],
];

past.forEach(([w, zh, pos, article, plural, exDe, exZh], i) => {
  const idx = 231 + i;
  const wd = (pos === 'noun' && article) ? `${article} ${w}` : w;
  cards.push(card(idx, '过去经历', w, wd, pos, article || '', plural || '', zh, exDe, exZh, wd, exDe));
});

// ====================================================================
// 简单建议 (25) — DE-0916 to DE-0940
// ====================================================================
const advice = [
  ['sollten', '应该', 'verb', '', '', 'Du solltest mehr schlafen.','你应该多睡觉。'],
  ['könnten', '可以', 'verb', '', '', 'Sie könnten den Bus nehmen.','您可以坐公交。'],
  ['würden', '会', 'verb', '', '', 'Würden Sie mir bitte helfen?','您能帮我一下吗？'],
  ['hätten', '有（虚拟）', 'verb', '', '', 'Hätten Sie kurz Zeit für mich?','您能抽出一点时间给我吗？'],
  ['ich würde gern', '我很想', 'phrase', '', '', 'Ich würde gern einen Kaffee trinken.','我很想喝一杯咖啡。'],
  ['am besten', '最好', 'adv', '', '', 'Am besten rufst du später an.','你最好晚点打电话。'],
  ['lieber', '宁愿', 'adv', '', '', 'Ich würde lieber zu Hause bleiben.','我宁愿待在家里。'],
  ['vielleicht', '也许', 'adv', '', '', 'Vielleicht solltest du zum Arzt gehen.','也许你应该去看医生。'],
  ['es wäre gut', '最好还是', 'phrase', '', '', 'Es wäre gut, wenn du früher kommst.','如果你早点来就好了。'],
  ['es lohnt sich', '值得', 'phrase', '', '', 'Es lohnt sich, früh aufzustehen.','早起是值得的。'],
  ['nicht vergessen', '别忘了', 'verb', '', '', 'Vergiss nicht, die Tür abzuschließen.','别忘了锁门。'],
  ['achten auf', '注意', 'verb', '', '', 'Achte bitte auf den Verkehr.','请注意交通。'],
  ['aufpassen auf', '留心', 'verb', '', '', 'Pass auf deine Tasche auf.','留心你的包。'],
  ['nachdenken über', '思考', 'verb', '', '', 'Denk mal darüber nach.','你想想这个。'],
  ['sich überlegen', '考虑', 'verb', '', '', 'Überleg es dir gut.','你好好考虑一下。'],
  ['zögern', '犹豫', 'verb', '', '', 'Zögern Sie nicht, mich anzurufen.','别犹豫给我打电话。'],
  ['die Entscheidung', '决定', 'noun', 'die', 'die Entscheidungen', 'Das ist keine leichte Entscheidung.','这不是一个容易的决定。'],
  ['sich entscheiden', '决定', 'verb', '', '', 'Ich habe mich für Deutsch entschieden.','我决定学德语。'],
  ['der Tipp', '小建议', 'noun', 'der', 'die Tipps', 'Hast du einen guten Tipp für mich?','你有什么好建议给我吗？'],
  ['der Rat', '建议', 'noun', 'der', 'die Ratschläge', 'Danke für deinen Rat.','谢谢你的建议。'],
  ['raten', '建议', 'verb', '', '', 'Was rätst du mir?','你建议我做什么？'],
  ['empfehlen', '推荐', 'verb', '', '', 'Welches Restaurant empfiehlst du?','你推荐哪家餐厅？'],
  ['darauf achten', '注意', 'verb', '', '', 'Achte darauf, dass du genug trinkst.','注意喝足够的水。'],
  ['versuchen', '尝试', 'verb', '', '', 'Versuch es noch einmal.','再试一次。'],
  ['probieren', '试试', 'verb', '', '', 'Probier mal diese Soße.','试试这个酱。'],
];

advice.forEach(([w, zh, pos, article, plural, exDe, exZh], i) => {
  const idx = 266 + i;
  const wd = (pos === 'noun' && article) ? `${article} ${w}` : w;
  cards.push(card(idx, '简单建议', w, wd, pos, article || '', plural || '', zh, exDe, exZh, wd, exDe));
});

// ====================================================================
// 日常问题 (25) — DE-0941 to DE-0965
// ====================================================================
const problems = [
  ['kaputtgehen', '坏掉', 'verb', '', '', 'Mein Computer ist kaputtgegangen.','我的电脑坏了。'],
  ['reparieren', '修理', 'verb', '', '', 'Kannst du das reparieren?','你能修这个吗？'],
  ['funktionieren', '运转', 'verb', '', '', 'Die Heizung funktioniert nicht.','暖气不工作。'],
  ['der Fehler', '错误', 'noun', 'der', 'die Fehler', 'Da ist ein Fehler passiert.','出了个错误。'],
  ['der Schaden', '损坏', 'noun', 'der', 'die Schäden', 'Der Sturm hat großen Schaden gemacht.','暴风雨造成了很大的损坏。'],
  ['wechseln', '更换', 'verb', '', '', 'Ich muss die Batterie wechseln.','我需要换电池。'],
  ['die Störung', '故障', 'noun', 'die', 'die Störungen', 'Es gibt eine technische Störung.','有一个技术故障。'],
  ['der Strom', '电', 'noun', 'der', '', 'Der Strom ist ausgefallen.','停电了。'],
  ['ausfallen', '中断', 'verb', '', '', 'Der Zug fällt heute aus.','火车今天停运。'],
  ['sich kümmern um', '处理', 'verb', '', '', 'Kümmere dich bitte darum.','请处理这件事。'],
  ['melden', '报告', 'verb', '', '', 'Bitte melden Sie das Problem.','请报告这个问题。'],
  ['die Beschwerde', '投诉', 'noun', 'die', 'die Beschwerden', 'Wo kann ich eine Beschwerde einreichen?','我在哪里可以提交投诉？'],
  ['sich beschweren', '投诉', 'verb', '', '', 'Ich möchte mich über den Lärm beschweren.','我想投诉噪音问题。'],
  ['zurückgeben', '退回', 'verb', '', '', 'Kann ich das zurückgeben?','我可以退这个吗？'],
  ['umtauschen', '更换', 'verb', '', '', 'Möchten Sie das umtauschen?','您想换这个吗？'],
  ['die Garantie', '保修', 'noun', 'die', 'die Garantien', 'Haben Sie noch Garantie darauf?','这个还在保修期内吗？'],
  ['die Quittung', '收据', 'noun', 'die', 'die Quittungen', 'Haben Sie die Quittung noch?','您还保留着收据吗？'],
  ['der Kassenzettel', '购物小票', 'noun', 'der', 'die Kassenzettel', 'Ohne Kassenzettel kann ich das nicht umtauschen.','没有购物小票我不能换。'],
  ['die Rechnung', '账单', 'noun', 'die', 'die Rechnungen', 'Die Rechnung ist falsch.','账单有误。'],
  ['der Rabatt', '折扣', 'noun', 'der', 'die Rabatte', 'Gibt es einen Rabatt für Studenten?','学生有折扣吗？'],
  ['die Reklamation', '投诉', 'noun', 'die', 'die Reklamationen', 'Ich habe eine Reklamation.','我有一个投诉。'],
  ['die Hilfe', '帮助', 'noun', 'die', 'die Hilfen', 'Brauchen Sie Hilfe?','您需要帮助吗？'],
  ['unterstützen', '支持', 'verb', '', '', 'Kann ich Sie irgendwie unterstützen?','我可以以任何方式支持您吗？'],
  ['um Hilfe bitten', '求助', 'verb', '', '', 'Ich möchte um Hilfe bitten.','我想请求帮助。'],
  ['sich Sorgen machen', '担心', 'verb', '', '', 'Machen Sie sich keine Sorgen.','您别担心。'],
];

problems.forEach(([w, zh, pos, article, plural, exDe, exZh], i) => {
  const idx = 291 + i;
  const wd = (pos === 'noun' && article) ? `${article} ${w}` : w;
  cards.push(card(idx, '日常问题', w, wd, pos, article || '', plural || '', zh, exDe, exZh, wd, exDe));
});

// Add 10 more cards to reach 325 (currently at 315)
const extra = [
  ['die Voraussetzung', '前提条件', 'noun', 'die', 'die Voraussetzungen', 'Das ist eine wichtige Voraussetzung.','这是一个重要的前提条件。'],
  ['erwarten', '期待', 'verb', '', '', 'Was erwarten Sie von dem Kurs?','您对这个课程有什么期待？'],
  ['sich verlassen auf', '依靠', 'verb', '', '', 'Du kannst dich auf mich verlassen.','你可以依靠我。'],
  ['vertrauen', '信任', 'verb', '', '', 'Ich vertraue dir.','我信任你。'],
  ['die Meinung', '意见', 'noun', 'die', 'die Meinungen', 'Meiner Meinung nach ist das richtig.','依我看来这是对的。'],
  ['zustimmen', '同意', 'verb', '', '', 'Ich stimme dir zu.','我同意你。'],
  ['widersprechen', '反对', 'verb', '', '', 'Da muss ich dir widersprechen.','这点我必须反对你。'],
  ['der Zweifel', '疑问', 'noun', 'der', 'die Zweifel', 'Ich habe keine Zweifel daran.','我对此没有疑问。'],
  ['bezweifeln', '怀疑', 'verb', '', '', 'Ich bezweifle, dass das stimmt.','我怀疑这是否正确。'],
  ['die Ausnahme', '例外', 'noun', 'die', 'die Ausnahmen', 'Das ist eine Ausnahme.','这是一个例外。'],
];

extra.forEach(([w, zh, pos, article, plural, exDe, exZh], i) => {
  const idx = 316 + i;
  const wd = (pos === 'noun' && article) ? `${article} ${w}` : w;
  cards.push(card(idx, '日常问题', w, wd, pos, article || '', plural || '', zh, exDe, exZh, wd, exDe));
});

// ====================================================================
// 验证
// ====================================================================

console.log(`Generated ${cards.length} cards`);
console.log(`ID range: ${cards[0].id} to ${cards[cards.length - 1].id}`);
console.log(`globalOrder range: ${cards[0].globalOrder} to ${cards[cards.length - 1].globalOrder}`);

// 连续检查
for (let i = 1; i < cards.length; i++) {
  if (cards[i].globalOrder !== cards[i - 1].globalOrder + 1) {
    console.error(`Order gap at ${i}: ${cards[i-1].globalOrder} -> ${cards[i].globalOrder}`);
  }
  const expectedIdNum = START_ID + i;
  const actualIdNum = parseInt(cards[i].id.split('-')[1], 10);
  if (actualIdNum !== expectedIdNum) {
    console.error(`ID gap at ${i}: expected DE-${pad(expectedIdNum)}, got ${cards[i].id}`);
  }
}

const errors = [];
cards.forEach((c, i) => {
  if (!c.id) errors.push(`${i}: missing id`);
  if (c.level !== 'A2') errors.push(`${c.id}: wrong level`);
  if (c.batch !== '03') errors.push(`${c.id}: wrong batch`);
  if (!c.word) errors.push(`${c.id}: missing word`);
  if (!c.wordDisplay) errors.push(`${c.id}: missing wordDisplay`);
  if (c.copyText !== c.wordDisplay) errors.push(`${c.id}: copyText != wordDisplay`);
  if (!c.shortMeaningZh) errors.push(`${c.id}: missing shortMeaningZh`);
  if (c.shortMeaningZh && /[，。！？、]/.test(c.shortMeaningZh)) errors.push(`${c.id}: punctuation in shortMeaningZh`);
  if (!c.exampleDe) errors.push(`${c.id}: missing exampleDe`);
  if (!c.exampleZh) errors.push(`${c.id}: missing exampleZh`);
  if (c.meaningAudioUrl && c.meaningAudioUrl !== '') errors.push(`${c.id}: meaningAudioUrl should be empty`);
  if (c.completed !== undefined) errors.push(`${c.id}: has completed field`);
});

if (errors.length > 0) {
  console.error('Validation errors:', errors.slice(0, 20));
} else {
  console.log('All validations passed!');
}

const cats = {};
const poses = {};
cards.forEach(c => {
  cats[c.category] = (cats[c.category] || 0) + 1;
  poses[c.partOfSpeech] = (poses[c.partOfSpeech] || 0) + 1;
});
console.log('\nCategories:', JSON.stringify(cats, null, 2));
console.log('\nParts of speech:', JSON.stringify(poses, null, 2));

console.log('\n--- JSON OUTPUT ---');
console.log(JSON.stringify(cards, null, 2));
