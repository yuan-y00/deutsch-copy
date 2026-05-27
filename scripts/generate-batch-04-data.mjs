/**
 * generate-batch-04-data.mjs — 第 04 批 A2 词卡数据生成 (完整 325 张)
 * 输出: data/batch-04-cards-part1.json + data/batch-04-cards-part2.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const BATCH = '04';
const LEVEL = 'A2';
const TOTAL = 325;

function pad(n) { return String(n).padStart(4, '0'); }

let seq = 0;
function nextId() { seq++; return { id: `DE-${pad(975 + seq)}`, order: 975 + seq }; }

function card(cat, word, wordDisplay, pos, article, plural, zh, exDe, exZh, wAudioText, eAudioText) {
  const { id, order } = nextId();
  const wd = wordDisplay || word;
  const wat = wAudioText || wd;
  const eat = eAudioText || exDe;
  return {
    id, level: LEVEL, batch: BATCH, category: cat, globalOrder: order,
    word, wordDisplay: wd, copyText: wd,
    partOfSpeech: pos, article: article || '', plural: plural || '',
    shortMeaningZh: zh,
    exampleDe: exDe, exampleZh: exZh,
    wordAudioUrl: `/audio/de/words/${id}.mp3`,
    meaningAudioUrl: '',
    exampleAudioUrl: `/audio/de/examples/${id}.mp3`,
    wordAudioText: wat, exampleAudioText: eat,
    pronunciationStatus: 'unchecked', pronunciationNote: '',
  };
}

// Helper: [word, zh, pos, article, plural, exDe, exZh]
function c(cat, arr) { return card(cat, arr[0], arr[0], arr[2], arr[3]||'', arr[4]||'', arr[1], arr[5], arr[6]); }

const cards = [];

// ====================================================================
// 住宿搬家 (33) — DE-0976 to DE-1008
// ====================================================================
const wohnen = [
  ['die Wohnung','公寓','noun','die','die Wohnungen','Ich habe eine neue Wohnung gefunden.','我找到了一间新公寓。'],
  ['der Mietvertrag','租赁合同','noun','der','die Mietverträge','Der Mietvertrag läuft zwei Jahre.','租赁合同为期两年。'],
  ['die Kaution','押金','noun','die','die Kautionen','Die Kaution beträgt drei Monatsmieten.','押金是三个月房租。'],
  ['der Vermieter','房东','noun','der','die Vermieter','Der Vermieter hat die Heizung repariert.','房东修好了暖气。'],
  ['die Nebenkosten','杂费','noun','die','die Nebenkosten','Die Nebenkosten sind in der Miete enthalten.','杂费已包含在房租里。'],
  ['möbliert','带家具的','adj','','','Die Wohnung ist möbliert.','这间公寓带家具。'],
  ['die Besichtigung','看房','noun','die','die Besichtigungen','Wir haben morgen eine Besichtigung.','我们明天有一个看房预约。'],
  ['der Umzug','搬家','noun','der','die Umzüge','Der Umzug war sehr anstrengend.','搬家非常累。'],
  ['umziehen','搬家','verb','','','Wir ziehen nächsten Monat um.','我们下个月搬家。'],
  ['einziehen','搬入','verb','','','Wann kannst du in die Wohnung einziehen?','你什么时候能搬进公寓？'],
  ['ausziehen','搬出','verb','','','Er ist letzte Woche ausgezogen.','他上周搬出去了。'],
  ['kündigen','解约','verb','','','Ich möchte den Mietvertrag kündigen.','我想解除租赁合同。'],
  ['renovieren','装修','verb','','','Wir müssen das Bad renovieren.','我们必须装修浴室。'],
  ['hell','明亮的','adj','','','Das Zimmer ist sehr hell.','房间非常明亮。'],
  ['gemütlich','舒适的','adj','','','Das Wohnzimmer ist sehr gemütlich.','客厅非常舒适。'],
  ['die Küche','厨房','noun','die','die Küchen','Die Küche ist voll ausgestattet.','厨房设备齐全。'],
  ['das Schlafzimmer','卧室','noun','das','die Schlafzimmer','Das Schlafzimmer ist groß genug.','卧室足够大。'],
  ['das Badezimmer','浴室','noun','das','die Badezimmer','Das Badezimmer hat ein Fenster.','浴室有一扇窗户。'],
  ['der Balkon','阳台','noun','der','die Balkone','Vom Balkon aus sieht man den Park.','从阳台可以看到公园。'],
  ['der Aufzug','电梯','noun','der','die Aufzüge','Der Aufzug ist leider kaputt.','电梯坏了。'],
  ['die Heizung','暖气','noun','die','die Heizungen','Die Heizung funktioniert nicht richtig.','暖气不太好用。'],
  ['die Miete','房租','noun','die','die Mieten','Die Miete ist jeden Monat pünktlich zu zahlen.','房租每月准时支付。'],
  ['der Nachbar','邻居','noun','der','die Nachbarn','Unser Nachbar ist sehr freundlich.','我们的邻居非常友好。'],
  ['die WG','合租公寓','noun','die','die WGs','Ich wohne in einer WG.','我住在一个合租公寓里。'],
  ['die Lage','位置','noun','die','die Lagen','Die Wohnung hat eine gute Lage.','这间公寓位置很好。'],
  ['der Keller','地下室','noun','der','die Keller','Der Keller ist trocken und sauber.','地下室干燥干净。'],
  ['die Terrasse','露台','noun','die','die Terrassen','Im Sommer frühstücken wir auf der Terrasse.','夏天我们在露台上吃早餐。'],
  ['das Erdgeschoss','底层','noun','das','die Erdgeschosse','Die Wohnung liegt im Erdgeschoss.','公寓在底层。'],
  ['streichen','粉刷','verb','','','Wir wollen die Wände neu streichen.','我们想重新粉刷墙壁。'],
  ['tapezieren','贴墙纸','verb','','','Sie hat das Schlafzimmer tapeziert.','她给卧室贴了墙纸。'],
  ['der Umzugswagen','搬家卡车','noun','der','die Umzugswagen','Der Umzugswagen kommt um acht.','搬家卡车八点来。'],
  ['die Besenreinigung','简单打扫','noun','die','','Die Wohnung wird besenrein übergeben.','公寓以简单打扫的状态交付。'],
  ['hinterlassen','留下','verb','','','Bitte hinterlassen Sie die Wohnung sauber.','请保持公寓干净。'],
];
wohnen.forEach(a => cards.push(c('住宿搬家', a)));

// ====================================================================
// 医生健康 (33) — DE-1009 to DE-1041
// ====================================================================
const gesundheit = [
  ['der Termin','预约','noun','der','die Termine','Ich habe morgen einen Termin beim Arzt.','我明天在医生那里有个预约。'],
  ['die Praxis','诊所','noun','die','die Praxen','Die Praxis öffnet um acht Uhr.','诊所八点开门。'],
  ['die Erkältung','感冒','noun','die','die Erkältungen','Ich habe eine starke Erkältung.','我感冒很严重。'],
  ['das Rezept','处方','noun','das','die Rezepte','Der Arzt hat mir ein Rezept gegeben.','医生给我开了一张处方。'],
  ['die Apotheke','药店','noun','die','die Apotheken','Die Apotheke ist gleich um die Ecke.','药店就在拐角处。'],
  ['der Schmerz','疼痛','noun','der','die Schmerzen','Ich habe Schmerzen im Rücken.','我背痛。'],
  ['untersuchen','检查','verb','','','Der Arzt wird Sie gründlich untersuchen.','医生会仔细检查您。'],
  ['krankmelden','请病假','verb','','','Ich muss mich heute krankmelden.','我今天必须请病假。'],
  ['die Krankenkasse','医保公司','noun','die','die Krankenkassen','Die Krankenkasse übernimmt die Kosten.','医保公司承担费用。'],
  ['verschreiben','开药','verb','','','Der Arzt hat mir Tabletten verschrieben.','医生给我开了药片。'],
  ['sich fühlen','感觉','verb','','','Ich fühle mich heute nicht gut.','我今天感觉不舒服。'],
  ['wehtun','疼','verb','','','Mein Kopf tut mir weh.','我头疼。'],
  ['fehlen','缺少/生病','verb','','','Was fehlt Ihnen denn?','您哪里不舒服？'],
  ['die Sprechstunde','门诊时间','noun','die','die Sprechstunden','Die Sprechstunde ist von neun bis zwölf.','门诊时间是九点到十二点。'],
  ['das Wartezimmer','候诊室','noun','das','die Wartezimmer','Bitte nehmen Sie im Wartezimmer Platz.','请在候诊室坐下。'],
  ['die Versicherungskarte','医保卡','noun','die','die Versicherungskarten','Haben Sie Ihre Versicherungskarte dabei?','您带医保卡了吗？'],
  ['der Hausarzt','家庭医生','noun','der','die Hausärzte','Ich gehe zuerst zu meinem Hausarzt.','我先去找我的家庭医生。'],
  ['die Überweisung','转诊单','noun','die','die Überweisungen','Sie brauchen eine Überweisung zum Facharzt.','您需要一张转诊单才能看专科医生。'],
  ['das Fieber','发烧','noun','das','','Ich habe Fieber und Halsschmerzen.','我发烧了而且喉咙痛。'],
  ['der Husten','咳嗽','noun','der','','Der Husten geht einfach nicht weg.','咳嗽就是好不了。'],
  ['die Tablette','药片','noun','die','die Tabletten','Nehmen Sie die Tabletten nach dem Essen.','请在饭后服用这些药片。'],
  ['die Salbe','药膏','noun','die','die Salben','Diese Salbe hilft gegen den Ausschlag.','这个药膏对皮疹有帮助。'],
  ['der Verband','绷带','noun','der','die Verbände','Der Verband muss täglich gewechselt werden.','绷带需要每天更换。'],
  ['gesund','健康的','adj','','','Bleib gesund und pass auf dich auf.','保持健康，照顾好自己。'],
  ['krank','生病的','adj','','','Er ist seit drei Tagen krank.','他已经病了三天了。'],
  ['müde','疲劳的','adj','','','Ich bin sehr müde in letzter Zeit.','我最近很疲劳。'],
  ['gestresst','有压力的','adj','','','Ich fühle mich im Moment sehr gestresst.','我目前感到很紧张。'],
  ['sich ausruhen','休息','verb','','','Sie sollten sich ein paar Tage ausruhen.','您应该休息几天。'],
  ['der Schnupfen','流鼻涕','noun','der','','Ich habe Schnupfen und niese viel.','我流鼻涕还一直打喷嚏。'],
  ['die Krankschreibung','病假条','noun','die','die Krankschreibungen','Ich brauche eine Krankschreibung für die Arbeit.','我需要一张给公司的病假条。'],
  ['bluten','流血','verb','','','Die Wunde blutet noch etwas.','伤口还在出一点血。'],
  ['schwindlig','头晕的','adj','','','Mir ist plötzlich schwindlig geworden.','我突然感到头晕。'],
  ['sich erholen','康复','verb','','','Erholen Sie sich gut!','祝您早日康复！'],
];
gesundheit.forEach(a => cards.push(c('医生健康', a)));

// ====================================================================
// 购物退换 (33) — DE-1042 to DE-1074
// ====================================================================
const einkaufen = [
  ['zurückgeben','退还','verb','','','Ich möchte diese Jacke zurückgeben.','我想退还这件夹克。'],
  ['umtauschen','换货','verb','','','Kann ich das Hemd umtauschen?','我可以换这件衬衫吗？'],
  ['die Quittung','收据','noun','die','die Quittungen','Haben Sie die Quittung noch?','您还留着收据吗？'],
  ['der Kassenbon','购物小票','noun','der','die Kassenbons','Ohne Kassenbon kann ich das nicht umtauschen.','没有购物小票我不能换货。'],
  ['anprobieren','试穿','verb','','','Darf ich die Schuhe anprobieren?','我可以试穿这双鞋吗？'],
  ['die Größe','尺码','noun','die','die Größen','Haben Sie das auch in Größe 38?','这个也有38码的吗？'],
  ['der Rabatt','折扣','noun','der','die Rabatte','Gibt es heute einen Rabatt?','今天有折扣吗？'],
  ['die Garantie','保修','noun','die','die Garantien','Auf das Gerät gibt es zwei Jahre Garantie.','这个设备有两年保修。'],
  ['beschädigt','损坏的','adj','','','Die Verpackung war leider beschädigt.','包装损坏了。'],
  ['stornieren','取消订单','verb','','','Kann ich meine Bestellung stornieren?','我可以取消我的订单吗？'],
  ['reklamieren','投诉','verb','','','Ich möchte dieses Produkt reklamieren.','我想投诉这个产品。'],
  ['bar zahlen','现金支付','verb','','','Kann ich bar zahlen?','我可以用现金支付吗？'],
  ['die Umkleidekabine','试衣间','noun','die','die Umkleidekabinen','Die Umkleidekabinen sind dort hinten.','试衣间在后面。'],
  ['die Kasse','收银台','noun','die','die Kassen','Bitte zahlen Sie an der Kasse.','请在收银台付款。'],
  ['das Sonderangebot','特价商品','noun','das','die Sonderangebote','Das ist ein echtes Sonderangebot.','这是一个真正的特价商品。'],
  ['der Ausverkauf','清仓','noun','der','die Ausverkäufe','Im Ausverkauf gibt es alles billiger.','清仓时所有东西都更便宜。'],
  ['reduziert','降价的','adj','','','Alle Winterjacken sind reduziert.','所有冬季夹克都降价了。'],
  ['günstig','便宜的','adj','','','Das ist wirklich sehr günstig.','这真的很便宜。'],
  ['die Reklamation','投诉','noun','die','die Reklamationen','Wir nehmen Ihre Reklamation ernst.','我们认真对待您的投诉。'],
  ['kaputt','坏的','adj','','','Der Reißverschluss ist kaputt.','拉链坏了。'],
  ['der Umtausch','更换','noun','der','','Der Umtausch ist nur mit Beleg möglich.','只有凭票据才能换货。'],
  ['das Etikett','标签','noun','das','die Etiketten','Das Etikett muss noch dran sein.','标签必须在上面。'],
  ['die Verpackung','包装','noun','die','die Verpackungen','Bitte bewahren Sie die Verpackung auf.','请保留包装。'],
  ['auspacken','拆开','verb','','','Ich habe das Paket noch nicht ausgepackt.','我还没有拆开包裹。'],
  ['einpacken','包装','verb','','','Können Sie es als Geschenk einpacken?','您可以把它包装成礼物吗？'],
  ['das Schaufenster','橱窗','noun','das','die Schaufenster','Ich habe das Kleid im Schaufenster gesehen.','我在橱窗里看到了那条裙子。'],
  ['anstehen','排队','verb','','','Wir mussten lange an der Kasse anstehen.','我们不得不在收银台排长队。'],
  ['das Rückgaberecht','退货权','noun','das','','Sie haben 14 Tage Rückgaberecht.','您有14天退货权。'],
  ['die Lieferzeit','送货时间','noun','die','die Lieferzeiten','Die Lieferzeit beträgt etwa eine Woche.','送货时间大约一周。'],
  ['zurückschicken','寄回','verb','','','Sie können die Ware zurückschicken.','您可以把商品寄回。'],
  ['fehlerhaft','有缺陷的','adj','','','Das Gerät war leider fehlerhaft.','这个设备有缺陷。'],
  ['die Bestellung','订单','noun','die','die Bestellungen','Ihre Bestellung wurde heute verschickt.','您的订单今天已发出。'],
  ['Lieferung','送货','noun','die','die Lieferungen','Wann kommt die Lieferung an?','送货什么时候到？'],
];
einkaufen.forEach(a => cards.push(c('购物退换', a)));

// ====================================================================
// 交通问题 (33) — DE-1075 to DE-1107
// ====================================================================
const verkehr = [
  ['die Verspätung','晚点','noun','die','die Verspätungen','Der Zug hat 20 Minuten Verspätung.','火车晚点20分钟。'],
  ['der Fahrplan','时刻表','noun','der','die Fahrpläne','Der Fahrplan hat sich geändert.','时刻表变了。'],
  ['umsteigen','换乘','verb','','','Du musst am Hauptbahnhof umsteigen.','你必须在总站换乘。'],
  ['die Haltestelle','车站','noun','die','die Haltestellen','Die nächste Haltestelle ist hier.','下一站在这里。'],
  ['die Durchsage','广播通知','noun','die','die Durchsagen','Hast du die Durchsage gehört?','你听到广播通知了吗？'],
  ['der Stau','堵车','noun','der','die Staus','Auf der Autobahn ist ein Stau.','高速公路上堵车了。'],
  ['das Gleis','站台/轨道','noun','das','die Gleise','Der Zug fährt von Gleis 3 ab.','火车从3号站台出发。'],
  ['die Fahrkarte','车票','noun','die','die Fahrkarten','Hast du eine Fahrkarte gekauft?','你买车票了吗？'],
  ['entwerten','打票验证','verb','','','Du musst die Fahrkarte entwerten.','你必须打票验证车票。'],
  ['sich verlaufen','迷路','verb','','','Ich habe mich in der Stadt verlaufen.','我在城里迷路了。'],
  ['die Kreuzung','十字路口','noun','die','die Kreuzungen','An der Kreuzung musst du links abbiegen.','在十字路口你得左转。'],
  ['die Ampel','红绿灯','noun','die','die Ampeln','Die Ampel ist rot geblieben.','红绿灯一直是红的。'],
  ['die Baustelle','施工地','noun','die','die Baustellen','Vorsicht, hier ist eine Baustelle.','小心，这里有个施工地。'],
  ['überholen','超车','verb','','','Hier darf man nicht überholen.','这里不能超车。'],
  ['der Führerschein','驾照','noun','der','die Führerscheine','Ich mache gerade meinen Führerschein.','我正在考驾照。'],
  ['das Navi','导航仪','noun','das','die Navis','Das Navi zeigt den falschen Weg.','导航仪显示了错误的路线。'],
  ['tanken','加油','verb','','','Wir müssen unterwegs tanken.','我们得在路上加油。'],
  ['die Tankstelle','加油站','noun','die','die Tankstellen','Die nächste Tankstelle ist 5 km entfernt.','最近的加油站在5公里外。'],
  ['das Parkhaus','停车楼','noun','das','die Parkhäuser','Wir parken im Parkhaus am Bahnhof.','我们把车停在火车站旁的停车楼。'],
  ['die Parklücke','停车位','noun','die','die Parklücken','Ich habe keine Parklücke gefunden.','我找不到停车位。'],
  ['der Reifen','轮胎','noun','der','die Reifen','Ein Reifen ist platt.','一个轮胎瘪了。'],
  ['die Panne','故障','noun','die','die Pannen','Wir hatten eine Panne auf der Autobahn.','我们在高速公路上出了故障。'],
  ['abschleppen','拖车','verb','','','Das Auto musste abgeschleppt werden.','这辆车必须被拖走。'],
  ['der Stau','堵车','noun','der','die Staus','Wegen des Staus komme ich später.','因为堵车我会晚点到。'],
  ['die Umleitung','绕行','noun','die','die Umleitungen','Folgen Sie der Umleitung.','请跟着绕行标志走。'],
  ['der Fahrradweg','自行车道','noun','der','die Fahrradwege','Hier gibt es einen Fahrradweg.','这里有一条自行车道。'],
  ['bremsen','刹车','verb','','','Du musst vor der Kurve bremsen.','你必须在弯道前刹车。'],
  ['aussteigen','下车','verb','','','Wir steigen an der nächsten Station aus.','我们在下一站下车。'],
  ['einsteigen','上车','verb','','','Bitte schnell einsteigen!','请快上车！'],
  ['verpassen','错过','verb','','','Ich habe den Bus verpasst.','我错过了公交车。'],
  ['der Fahrgast','乘客','noun','der','die Fahrgäste','Alle Fahrgäste bitte aussteigen.','请所有乘客下车。'],
  ['die Parkuhr','停车计时器','noun','die','die Parkuhren','Wirf eine Münze in die Parkuhr.','往停车计时器里投一枚硬币。'],
  ['das Benzin','汽油','noun','das','','Das Benzin ist teurer geworden.','汽油涨价了。'],
];
verkehr.forEach(a => cards.push(c('交通问题', a)));

// ====================================================================
// 休闲活动 (33) — DE-1108 to DE-1140
// ====================================================================
const freizeit = [
  ['die Freizeit','休闲时间','noun','die','','In meiner Freizeit lese ich gern.','我休闲时间喜欢读书。'],
  ['sich verabreden','约好见面','verb','','','Wir haben uns für Samstag verabredet.','我们约好了周六见面。'],
  ['vorschlagen','建议','verb','','','Was schlägst du für heute Abend vor?','今晚你建议做什么？'],
  ['auswählen','挑选','verb','','','Du darfst einen Film auswählen.','你来选一部电影。'],
  ['das Hobby','爱好','noun','das','die Hobbys','Mein Hobby ist Gitarre spielen.','我的爱好是弹吉他。'],
  ['wandern','徒步','verb','','','Am Wochenende gehen wir wandern.','周末我们去徒步。'],
  ['spazieren','散步','verb','','','Lass uns ein bisschen spazieren gehen.','我们去散散步吧。'],
  ['das Konzert','音乐会','noun','das','die Konzerte','Das Konzert war wirklich toll.','音乐会真的很棒。'],
  ['die Ausstellung','展览','noun','die','die Ausstellungen','Die Ausstellung ist noch bis Sonntag geöffnet.','展览开放到周日。'],
  ['vorhaben','打算做','verb','','','Hast du heute Abend etwas vor?','今晚你有什么打算？'],
  ['Spaß machen','带来乐趣','verb','','','Das Spiel macht mir viel Spaß.','这个游戏给我带来很多乐趣。'],
  ['sich treffen','见面','verb','','','Wir treffen uns um sieben vor dem Kino.','我们七点在电影院前见面。'],
  ['der Verein','协会/俱乐部','noun','der','die Vereine','Ich bin Mitglied im Sportverein.','我是体育俱乐部的会员。'],
  ['trainieren','训练','verb','','','Wir trainieren jeden Dienstag.','我们每周二训练。'],
  ['das Training','训练','noun','das','die Trainings','Das Training fällt heute leider aus.','今天的训练取消了。'],
  ['gewinnen','赢','verb','','','Wir haben das Spiel gewonnen.','我们赢了比赛。'],
  ['verlieren','输','verb','','','Leider haben wir verloren.','可惜我们输了。'],
  ['das Spiel','游戏/比赛','noun','das','die Spiele','Das Spiel beginnt um drei.','比赛三点开始。'],
  ['die Mannschaft','队伍','noun','die','die Mannschaften','Unsere Mannschaft hat gut gespielt.','我们的队伍打得很好。'],
  ['fotografieren','拍照','verb','','','Ich fotografiere gern Landschaften.','我喜欢拍风景。'],
  ['malen','画画','verb','','','Sie malt am liebsten Blumen.','她最喜欢画花。'],
  ['basteln','做手工','verb','','','Die Kinder basteln gerne mit Papier.','孩子们喜欢用纸做手工。'],
  ['singen','唱歌','verb','','','Wir singen zusammen im Chor.','我们一起在合唱团唱歌。'],
  ['tanzen','跳舞','verb','','','Tanzt du gern?','你喜欢跳舞吗？'],
  ['kochen','烹饪','verb','','','Wir kochen heute zusammen italienisch.','今天我们一起来做意大利菜。'],
  ['backen','烘焙','verb','','','Am Sonntag backe ich einen Kuchen.','周日我烤一个蛋糕。'],
  ['grillen','烧烤','verb','','','Im Sommer grillen wir oft im Garten.','夏天我们经常在花园里烧烤。'],
  ['picknicken','野餐','verb','','','Lass uns am See picknicken.','我们去湖边野餐吧。'],
  ['angeln','钓鱼','verb','','','Mein Opa geht gern angeln.','我爷爷喜欢钓鱼。'],
  ['segeln','帆船','verb','','','Wir segeln jedes Jahr auf der Ostsee.','我们每年在波罗的海玩帆船。'],
  ['das Schwimmbad','游泳池','noun','das','die Schwimmbäder','Gehen wir heute ins Schwimmbad?','我们今天去游泳池吗？'],
  ['die Eintrittskarte','门票','noun','die','die Eintrittskarten','Ich habe zwei Eintrittskarten fürs Kino.','我有两张电影票。'],
  ['die Reservierung','预订','noun','die','die Reservierungen','Hast du eine Reservierung fürs Restaurant?','你订了餐厅的位置吗？'],
];
freizeit.forEach(a => cards.push(c('休闲活动', a)));

// ====================================================================
// 家庭生活 (32) — DE-1141 to DE-1172
// ====================================================================
const familie = [
  ['aufräumen','整理','verb','','','Ich muss mein Zimmer aufräumen.','我必须整理我的房间。'],
  ['putzen','打扫','verb','','','Wir putzen das Haus jeden Samstag.','我们每周六打扫房子。'],
  ['die Spülmaschine','洗碗机','noun','die','die Spülmaschinen','Räumst du die Spülmaschine ein?','你把碗放进洗碗机好吗？'],
  ['babysitten','照看小孩','verb','','','Ich babysitte heute Abend bei den Nachbarn.','我今晚在邻居家照看小孩。'],
  ['sich kümmern um','照顾','verb','','','Wer kümmert sich um die Kinder?','谁来照顾孩子们？'],
  ['der Haushalt','家务','noun','der','die Haushalte','Wir teilen uns den Haushalt.','我们分担家务。'],
  ['streiten','争吵','verb','','','Die Geschwister streiten oft.','兄弟姐妹经常争吵。'],
  ['sich vertragen','和好','verb','','','Zum Glück vertragen sie sich wieder.','幸好他们又和好了。'],
  ['erziehen','教育','verb','','','Kinder zu erziehen ist nicht einfach.','教育孩子并不容易。'],
  ['das Haustier','宠物','noun','das','die Haustiere','Hast du ein Haustier?','你有宠物吗？'],
  ['füttern','喂食','verb','','','Ich füttere den Hund jeden Morgen.','我每天早上喂狗。'],
  ['Gassi gehen','遛狗','verb','','','Wann gehst du mit dem Hund Gassi?','你什么时候去遛狗？'],
  ['der Müll','垃圾','noun','der','','Bringst du bitte den Müll raus?','你把垃圾拿出去好吗？'],
  ['abwaschen','洗碗','verb','','','Wer wäscht heute ab?','今天谁洗碗？'],
  ['aufhängen','晾挂','verb','','','Ich hänge die Wäsche auf.','我把洗好的衣服晾起来。'],
  ['bügeln','熨烫','verb','','','Ich bügle meine Hemden selbst.','我自己熨衬衫。'],
  ['staubsaugen','吸尘','verb','','','Kannst du das Wohnzimmer staubsaugen?','你能给客厅吸尘吗？'],
  ['wischen','擦拭','verb','','','Ich wische noch schnell den Boden.','我很快擦一下地板。'],
  ['ordentlich','整齐的','adj','','','Dein Zimmer ist sehr ordentlich.','你的房间很整齐。'],
  ['unordentlich','凌乱的','adj','','','Das Kinderzimmer ist immer unordentlich.','儿童房总是凌乱的。'],
  ['vermisst','想念','adj','','','Ich habe dich sehr vermisst.','我很想念你。'],
  ['der Alltag','日常生活','noun','der','','Im Alltag bleibt wenig Zeit für Hobbys.','日常生活中留给爱好的时间很少。'],
  ['das Chaos','混乱','noun','das','','In der Küche herrscht Chaos.','厨房里一片混乱。'],
  ['die Verwandten','亲戚','noun','die','die Verwandten','Zu Weihnachten besuchen wir die Verwandten.','圣诞节我们去看望亲戚们。'],
  ['der Onkel','叔叔/舅舅','noun','der','die Onkel','Mein Onkel wohnt in Hamburg.','我叔叔住在汉堡。'],
  ['die Tante','阿姨/姑姑','noun','die','die Tanten','Meine Tante backt den besten Kuchen.','我姑姑烤的蛋糕最好吃。'],
  ['die Großeltern','祖父母','noun','die','die Großeltern','Meine Großeltern leben auf dem Land.','我的祖父母住在乡下。'],
  ['der Enkel','孙子','noun','der','die Enkel','Die Großeltern freuen sich über die Enkel.','祖父母为孙辈感到高兴。'],
  ['die Nichte','侄女/外甥女','noun','die','die Nichten','Meine Nichte kommt mich besuchen.','我的侄女要来看我。'],
  ['verwöhnen','溺爱','verb','','','Die Großeltern verwöhnen die Enkel.','祖父母溺爱孙辈。'],
  ['sich verstehen','相处融洽','verb','','','Wir verstehen uns sehr gut.','我们相处得很好。'],
  ['das Familienfest','家庭聚会','noun','das','die Familienfeste','Das Familienfest war sehr schön.','家庭聚会很美好。'],
];
familie.forEach(a => cards.push(c('家庭生活', a)));

// ====================================================================
// 学校课程 (32) — DE-1173 to DE-1204
// ====================================================================
const schule = [
  ['der Kurs','课程','noun','der','die Kurse','Ich habe mich für einen Deutschkurs angemeldet.','我报了一个德语课程。'],
  ['die Prüfung','考试','noun','die','die Prüfungen','Die Prüfung war nicht so schwer.','考试不是很难。'],
  ['die Hausaufgabe','家庭作业','noun','die','die Hausaufgaben','Hast du deine Hausaufgaben gemacht?','你做家庭作业了吗？'],
  ['sich anmelden','报名','verb','','','Du musst dich für den Kurs anmelden.','你必须报名这个课程。'],
  ['nachholen','补上','verb','','','Ich muss den Stoff nachholen.','我必须把课程内容补上。'],
  ['üben','练习','verb','','','Du solltest jeden Tag Vokabeln üben.','你应该每天练习单词。'],
  ['die Note','成绩/分数','noun','die','die Noten','Ich habe eine gute Note bekommen.','我得了一个好成绩。'],
  ['bestehen','通过','verb','','','Ich habe die Prüfung bestanden.','我通过了考试。'],
  ['durchfallen','不及格','verb','','','Leider bin ich durchgefallen.','可惜我不及格了。'],
  ['der Stundenplan','课程表','noun','der','die Stundenpläne','Der neue Stundenplan hängt an der Tür.','新课程表贴在门上。'],
  ['unterrichten','教学','verb','','','Sie unterrichtet Deutsch an einer Schule.','她在一所学校教德语。'],
  ['die Fremdsprache','外语','noun','die','die Fremdsprachen','Welche Fremdsprachen sprichst du?','你会说哪些外语？'],
  ['der Unterricht','课堂/课程','noun','der','','Der Unterricht beginnt um acht.','八点开始上课。'],
  ['die Pause','休息','noun','die','die Pausen','In der Pause esse ich einen Apfel.','休息时我吃一个苹果。'],
  ['die Klasse','班级','noun','die','die Klassen','Unsere Klasse hat 20 Schüler.','我们班有20个学生。'],
  ['das Klassenzimmer','教室','noun','das','die Klassenzimmer','Das Klassenzimmer ist hell und groß.','教室明亮宽敞。'],
  ['die Tafel','黑板','noun','die','die Tafeln','Der Lehrer schreibt an die Tafel.','老师在黑板上写字。'],
  ['der Rucksack','背包','noun','der','die Rucksäcke','Mein Rucksack ist viel zu schwer.','我的背包太重了。'],
  ['das Heft','练习本','noun','das','die Hefte','Schreib die Übung ins Heft.','把练习写到练习本里。'],
  ['der Kugelschreiber','圆珠笔','noun','der','die Kugelschreiber','Kann ich deinen Kugelschreiber leihen?','我能借你的圆珠笔吗？'],
  ['der Bleistift','铅笔','noun','der','die Bleistifte','Hast du einen Bleistift für mich?','你有铅笔给我用吗？'],
  ['auswendig lernen','背诵','verb','','','Wir müssen das Gedicht auswendig lernen.','我们必须背诵这首诗。'],
  ['nachschlagen','查阅','verb','','','Das Wort musst du im Wörterbuch nachschlagen.','这个词你得查词典。'],
  ['erklären','解释','verb','','','Kannst du mir die Aufgabe erklären?','你能给我解释一下这道题吗？'],
  ['verstehen','理解','verb','','','Ich habe die Regel nicht verstanden.','我没听懂这个规则。'],
  ['die Lösung','答案','noun','die','die Lösungen','Weißt du die Lösung?','你知道答案吗？'],
  ['das Ergebnis','结果','noun','das','die Ergebnisse','Das Ergebnis der Prüfung kommt nächste Woche.','考试结果下周出来。'],
  ['korrigieren','改正','verb','','','Der Lehrer korrigiert die Tests.','老师批改试卷。'],
  ['wiederholen','复习','verb','','','Vor der Prüfung müssen wir alles wiederholen.','考试前我们必须把所有内容复习一遍。'],
  ['die Bibliothek','图书馆','noun','die','die Bibliotheken','Ich lerne am liebsten in der Bibliothek.','我最喜欢在图书馆学习。'],
  ['der Mitschüler','同学','noun','der','die Mitschüler','Mein Mitschüler hat mir geholfen.','我的同学帮助了我。'],
  ['das Zeugnis','成绩单','noun','das','die Zeugnisse','Am Freitag bekommen wir unsere Zeugnisse.','周五我们拿到成绩单。'],
];
schule.forEach(a => cards.push(c('学校课程', a)));

// ====================================================================
// 工作时间 (32) — DE-1205 to DE-1236
// ====================================================================
const arbeit = [
  ['die Überstunden','加班','noun','die','die Überstunden','Ich mache diese Woche viele Überstunden.','我这周加了很多班。'],
  ['die Besprechung','会议','noun','die','die Besprechungen','Die Besprechung dauert eine Stunde.','会议持续一小时。'],
  ['der Feierabend','下班','noun','der','','Endlich Feierabend!','终于下班了！'],
  ['beantragen','申请','verb','','','Ich möchte Urlaub beantragen.','我想申请休假。'],
  ['genehmigen','批准','verb','','','Der Chef hat meinen Urlaub genehmigt.','老板批准了我的休假。'],
  ['der Urlaub','休假','noun','der','die Urlaube','Ich habe im August zwei Wochen Urlaub.','我八月有两周休假。'],
  ['pünktlich','准时的','adj','','','Sei bitte pünktlich zur Besprechung.','请准时参加会议。'],
  ['sich beeilen','赶快','verb','','','Wir müssen uns beeilen, sonst kommen wir zu spät.','我们得赶快，不然会迟到。'],
  ['die Schicht','班次','noun','die','die Schichten','Ich arbeite diese Woche in der Spätschicht.','我这周上晚班。'],
  ['der Lohn','工资','noun','der','die Löhne','Der Lohn wird am Ende des Monats gezahlt.','月底发工资。'],
  ['das Gehalt','薪水','noun','das','die Gehälter','Mit dem Gehalt bin ich zufrieden.','我对薪水满意。'],
  ['kündigen','辞职/解雇','verb','','','Er hat seinen Job gekündigt.','他辞掉了工作。'],
  ['sich bewerben','申请工作','verb','','','Ich bewerbe mich um die Stelle.','我在申请这个职位。'],
  ['die Stelle','职位','noun','die','die Stellen','Die Stelle ist noch frei.','这个职位还空缺。'],
  ['der Chef','老板','noun','der','die Chefs','Mein Chef ist sehr zufrieden mit mir.','我的老板对我很满意。'],
  ['der Kollege','同事','noun','der','die Kollegen','Meine Kollegen sind sehr nett.','我的同事们很好。'],
  ['das Team','团队','noun','das','die Teams','Wir arbeiten im Team.','我们在团队中工作。'],
  ['die Abteilung','部门','noun','die','die Abteilungen','Ich arbeite in der IT-Abteilung.','我在IT部门工作。'],
  ['das Büro','办公室','noun','das','die Büros','Das Büro ist im dritten Stock.','办公室在三楼。'],
  ['der Schreibtisch','办公桌','noun','der','die Schreibtische','Mein Schreibtisch ist immer ordentlich.','我的办公桌总是很整齐。'],
  ['anrufen','打电话','verb','','','Ich rufe den Kunden morgen an.','我明天给客户打电话。'],
  ['zurückrufen','回电话','verb','','','Können Sie mich bitte zurückrufen?','您能给我回电话吗？'],
  ['die E-Mail','邮件','noun','die','die E-Mails','Ich schicke dir eine E-Mail.','我给你发一封邮件。'],
  ['beantworten','回复','verb','','','Bitte beantworten Sie meine E-Mail.','请回复我的邮件。'],
  ['speichern','保存','verb','','','Vergiss nicht, die Datei zu speichern.','别忘了保存文件。'],
  ['ausdrucken','打印','verb','','','Kannst du das Dokument ausdrucken?','你能打印这份文件吗？'],
  ['sich konzentrieren','集中注意力','verb','','','Ich kann mich heute nicht gut konzentrieren.','我今天没办法好好集中注意力。'],
  ['die Kantine','食堂','noun','die','die Kantinen','Das Essen in der Kantine ist gut.','食堂的饭菜不错。'],
  ['die Probezeit','试用期','noun','die','','Ich bin noch in der Probezeit.','我还在试用期。'],
  ['der Lebenslauf','简历','noun','der','die Lebensläufe','Ich habe meinen Lebenslauf aktualisiert.','我更新了我的简历。'],
  ['das Vorstellungsgespräch','面试','noun','das','die Vorstellungsgespräche','Morgen habe ich ein Vorstellungsgespräch.','明天我有一场面试。'],
  ['Teilzeit','兼职','noun','die','','Ich arbeite in Teilzeit.','我兼职工作。'],
];
arbeit.forEach(a => cards.push(c('工作时间', a)));

// ====================================================================
// 节日邀请 (32) — DE-1237 to DE-1268
// ====================================================================
const feste = [
  ['einladen','邀请','verb','','','Ich lade dich zu meiner Geburtstagsparty ein.','我邀请你参加我的生日派对。'],
  ['die Einladung','邀请函','noun','die','die Einladungen','Hast du die Einladung bekommen?','你收到邀请函了吗？'],
  ['vorbereiten','准备','verb','','','Wir bereiten alles für die Feier vor.','我们在为庆祝活动准备一切。'],
  ['dekorieren','装饰','verb','','','Wir dekorieren den Raum mit Luftballons.','我们用气球装饰房间。'],
  ['mitbringen','带来','verb','','','Was soll ich zur Party mitbringen?','我该带什么来派对？'],
  ['schenken','赠送','verb','','','Was schenkst du ihm zum Geburtstag?','你送他什么生日礼物？'],
  ['die Überraschung','惊喜','noun','die','die Überraschungen','Die Party war eine tolle Überraschung.','派对是一个很棒的惊喜。'],
  ['feiern','庆祝','verb','','','Heute Abend feiern wir!','今晚我们庆祝！'],
  ['das Geschenk','礼物','noun','das','die Geschenke','Das Geschenk hat ihr sehr gefallen.','她很喜欢这个礼物。'],
  ['der Geburtstag','生日','noun','der','die Geburtstage','Wann hast du Geburtstag?','你什么时候生日？'],
  ['gratulieren','祝贺','verb','','','Ich gratuliere dir zum Geburtstag.','祝你生日快乐。'],
  ['Weihnachten','圣诞节','noun','das','','Was machst du zu Weihnachten?','圣诞节你做什么？'],
  ['Silvester','除夕','noun','das','','An Silvester gibt es bei uns Raclette.','除夕夜我们家吃奶酪烧烤。'],
  ['Ostern','复活节','noun','das','','An Ostern suchen die Kinder Eier.','复活节孩子们找彩蛋。'],
  ['die Feier','庆祝活动','noun','die','die Feiern','Die Feier war sehr schön.','庆祝活动很美好。'],
  ['die Party','派对','noun','die','die Partys','Kommst du zur Party am Samstag?','你周六来派对吗？'],
  ['der Gast','客人','noun','der','die Gäste','Die Gäste kommen um sieben.','客人七点来。'],
  ['der Gastgeber','主人/东道主','noun','der','die Gastgeber','Der Gastgeber hat alles gut vorbereitet.','主人一切准备得很好。'],
  ['die Kerze','蜡烛','noun','die','die Kerzen','Wir zünden die Kerzen am Tisch an.','我们点燃桌上的蜡烛。'],
  ['der Kuchen','蛋糕','noun','der','die Kuchen','Der Kuchen schmeckt fantastisch.','蛋糕好吃极了。'],
  ['anstoßen','碰杯','verb','','','Lasst uns auf das neue Jahr anstoßen!','让我们为新的一年干杯！'],
  ['die Glückwunschkarte','贺卡','noun','die','die Glückwunschkarten','Ich habe eine Glückwunschkarte geschrieben.','我写了一张贺卡。'],
  ['der Blumenstrauß','花束','noun','der','die Blumensträuße','Sie hat einen Blumenstrauß mitgebracht.','她带来了一束花。'],
  ['der Besuch','来访/客人','noun','der','die Besuche','Wir bekommen am Sonntag Besuch.','我们周日有客人来。'],
  ['abholen','接人','verb','','','Ich hole dich um sechs ab.','我六点来接你。'],
  ['stattfinden','举行','verb','','','Die Feier findet im Garten statt.','庆祝活动在花园里举行。'],
  ['absagen','取消','verb','','','Leider muss ich die Party absagen.','可惜我必须取消派对。'],
  ['zusagen','答应','verb','','','Kannst du mir bis morgen zusagen?','你明天之前能答应我吗？'],
  ['der Sekt','气泡酒','noun','der','','Wir trinken Sekt zur Feier.','我们庆祝时喝气泡酒。'],
  ['die Hochzeit','婚礼','noun','die','die Hochzeiten','Die Hochzeit war wunderschön.','婚礼美极了。'],
  ['das Jubiläum','周年纪念','noun','das','die Jubiläen','Wir feiern unser zehnjähriges Jubiläum.','我们庆祝十周年纪念。'],
  ['der Neujahrsvorsatz','新年决心','noun','der','die Neujahrsvorsätze','Hast du einen Neujahrsvorsatz?','你有新年决心吗？'],
];
feste.forEach(a => cards.push(c('节日邀请', a)));

// ====================================================================
// 拒绝解释 (32) — DE-1269 to DE-1300
// ====================================================================
const ablehnung = [
  ['ablehnen','拒绝','verb','','','Ich muss das Angebot leider ablehnen.','我不得不拒绝这个提议。'],
  ['begründen','解释原因','verb','','','Kannst du deine Entscheidung begründen?','你能解释一下你的决定吗？'],
  ['sich entschuldigen','道歉','verb','','','Ich möchte mich für den Fehler entschuldigen.','我想为这个错误道歉。'],
  ['leidtun','感到抱歉','verb','','','Es tut mir leid, das habe ich nicht gewusst.','很抱歉，我不知道这件事。'],
  ['verstehen','理解','verb','','','Ich verstehe deine Situation.','我理解你的处境。'],
  ['die Absage','拒绝/取消','noun','die','die Absagen','Ich habe eine Absage von der Firma bekommen.','我收到了公司的拒绝信。'],
  ['verschieben','推迟','verb','','','Können wir den Termin verschieben?','我们可以把预约推迟吗？'],
  ['keine Zeit haben','没时间','verb','','','Leider habe ich am Freitag keine Zeit.','可惜我周五没时间。'],
  ['keine Lust haben','没兴趣','verb','','','Ich habe heute einfach keine Lust auszugehen.','我今天就是没兴趣出门。'],
  ['einen Vorschlag machen','提议','verb','','','Darf ich einen anderen Vorschlag machen?','我能提另一个建议吗？'],
  ['die Begründung','理由','noun','die','die Begründungen','Deine Begründung verstehe ich.','我理解你的理由。'],
  ['der Grund','原因','noun','der','die Gründe','Aus welchem Grund kannst du nicht kommen?','你因为什么原因不能来？'],
  ['das Missverständnis','误会','noun','das','die Missverständnisse','Das war nur ein Missverständnis.','那只是一个误会。'],
  ['klappen','成功/顺利','verb','','','Leider hat es nicht geklappt.','可惜没能成功。'],
  ['funktionieren','起作用','verb','','','Der Plan funktioniert leider nicht.','这个计划行不通。'],
  ['passen','合适','verb','','','Der Termin passt mir leider nicht.','这个时间对我不合适。'],
  ['schade','可惜','adj','','','Das ist wirklich schade.','这真的很可惜。'],
  ['hoffentlich','希望','adv','','','Hoffentlich klappt es nächstes Mal.','希望下次能行。'],
  ['nächstes Mal','下次','adv','','','Nächstes Mal komme ich bestimmt.','下次我一定来。'],
  ['lieber','宁愿','adv','','','Ich würde lieber zu Hause bleiben.','我更愿意待在家里。'],
  ['stattdessen','取而代之','adv','','','Ich kann leider nicht, aber wir können stattdessen morgen treffen.','我去不了，不过我们可以改为明天见面。'],
  ['trotzdem','尽管如此','adv','','','Ich bin krank, aber ich komme trotzdem.','我病了，不过我还是会来。'],
  ['zwar ... aber','虽然但是','conj','','','Ich habe zwar Zeit, aber keine Lust.','我虽然有时间，但没兴趣。'],
  ['eigentlich','其实','adv','','','Eigentlich wollte ich kommen, aber es geht nicht.','其实我想来的，但是不行。'],
  ['bedauern','遗憾','verb','','','Ich bedauere die Entscheidung sehr.','我非常遗憾这个决定。'],
  ['verzeihen','原谅','verb','','','Kannst du mir verzeihen?','你能原谅我吗？'],
  ['die Entschuldigung','道歉','noun','die','die Entschuldigungen','Bitte nimm meine Entschuldigung an.','请接受我的道歉。'],
  ['die Ausrede','借口','noun','die','die Ausreden','Das ist nur eine Ausrede.','这只是一个借口。'],
  ['ehrlich','诚实的','adj','','','Um ehrlich zu sein, ich habe es vergessen.','说实话，我忘了。'],
  ['zugeben','承认','verb','','','Ich muss zugeben, dass du recht hast.','我必须承认你是对的。'],
  ['die Erklärung','解释','noun','die','die Erklärungen','Danke für deine Erklärung.','谢谢你的解释。'],
  ['der Alternativvorschlag','替代建议','noun','der','die Alternativvorschläge','Hast du einen Alternativvorschlag?','你有替代建议吗？'],
];
ablehnung.forEach(a => cards.push(c('拒绝解释', a)));

// ============================================================================
// 输出
// ============================================================================
console.log(`Total cards generated: ${cards.length}`);

// Verify count
if (cards.length !== TOTAL) {
  console.error(`ERROR: Expected ${TOTAL} cards, got ${cards.length}`);
  process.exit(1);
}

// Split into two parts
const part1 = cards.slice(0, 165);
const part2 = cards.slice(165);

console.log(`Part 1: ${part1.length} cards (DE-0976 to DE-1140)`);
console.log(`Part 2: ${part2.length} cards (DE-1141 to DE-1300)`);

const dataDir = join(ROOT, 'data');
mkdirSync(dataDir, { recursive: true });

writeFileSync(join(dataDir, 'batch-04-cards-part1.json'), JSON.stringify(part1, null, 2), 'utf8');
writeFileSync(join(dataDir, 'batch-04-cards-part2.json'), JSON.stringify(part2, null, 2), 'utf8');

console.log('\nDone! Files written:');
console.log('  data/batch-04-cards-part1.json');
console.log('  data/batch-04-cards-part2.json');

// Quick stats
const catCounts = {};
const posCounts = {};
cards.forEach(c => {
  catCounts[c.category] = (catCounts[c.category] || 0) + 1;
  posCounts[c.partOfSpeech] = (posCounts[c.partOfSpeech] || 0) + 1;
});
console.log('\nCategory distribution:');
for (const [cat, count] of Object.entries(catCounts).sort()) {
  console.log(`  ${cat}: ${count}`);
}
console.log('\nPart of speech distribution:');
for (const [pos, count] of Object.entries(posCounts).sort()) {
  console.log(`  ${pos}: ${count}`);
}
const nounCount = posCounts['noun'] || 0;
const nonNounCount = cards.length - nounCount;
console.log(`\nNouns: ${nounCount} (${(nounCount/cards.length*100).toFixed(1)}%)`);
console.log(`Non-nouns: ${nonNounCount} (${(nonNounCount/cards.length*100).toFixed(1)}%)`);
