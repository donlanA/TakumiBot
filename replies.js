const lots = require("./lots.json");

//以下是這個機器人在處理指令的核心。
function parseInput(rplyToken, inputStr, guildFlag = false) {
  //此處傳入的變數inputStr是大家輸入的文字訊息。
  //其實LineBot可以讀取的不只有文字訊息，貼圖、圖片等都可辨識。
  //但有看得懂上半段的程式碼的人可能會注意到，我們擋掉了其他的種類。只留文字訊息。
  //這是因為這個機器人的主要目的是擲骰，所以專注以處理文字指令為主。
  //而這個函數最後return的也將會以文字訊息的方式回覆給使用者。
  //回傳非文字訊息的方式，下文會另外敘述。

  //這一段不要理他，因為我看不懂，總之留著。
  console.log('InputStr: ' + inputStr);
  _isNaN = function (obj) {
    return isNaN(parseInt(obj));
  }

  //以下這一串是一連串的判定，用來判斷是否有觸發條件的關鍵字。

  //這是我用來測試用的，可以刪掉。
  // if (inputStr.match(/^DvTest/) != null) return DvTest(rplyToken, inputStr) ;
  // else   

  //底下是做為一個擲骰機器人的核心功能。
  //CoC7th系統的判定在此，關鍵字是「句首的cc」，在此的判定使用正則表達式。
  //用 / / 框起來的部分就是正則表達式的範圍， ^ 代表句首，所以 ^cc 就代表句首的cc。
  if (inputStr.toLowerCase().match(/^cc/) != null) return CoC7th(rplyToken, inputStr.toLowerCase(), guildFlag);
  else

    //pbta系統判定在此，關鍵字是「句首的pb」。
    if (inputStr.toLowerCase().match(/^pb/) != null) return pbta(inputStr.toLowerCase());
    else

      //使用說明
      if (inputStr.match('使用說明') != null) return TakumiManual();
      else

        //聊天指令
        if (inputStr.match('takumi') != null) return TakumiReply(inputStr, guildFlag);
        else

          //圖片訊息
          // if (inputStr.toLowerCase().match('.jpg') != null) return SendImg(rplyToken, inputStr) ;      
          // else

          //入幫測驗功能判定
          // if (inputStr.match('鴨霸幫入幫測驗') != null) return Yababang(inputStr) ;      
          // else 

          //通用擲骰判定在此，這邊的判定比較寬鬆。
          //第一部分的 \w 代表「包括底線的任何單詞字元」，所以兩個部份的意涵就是：
          //「不是全部都是空白或中文字，而且裡面含有d的訊息」都會觸發這個判定。
          //為了要正確運作，剩下的判定式還有很多，寫在這邊太冗長所以擺在nomalDiceRoller裡面了。
          //為什麼判定要放最後呢，不然只要有d都會被當成這個，很不方便
          if (inputStr.match(/\w/) != null && inputStr.toLowerCase().match(/d/) != null) {
            return nomalDiceRoller(inputStr);
          }

          else return undefined;

}

//開發者測試
function DvTest(rplyToken, inputStr) {
  let rePly = '開發者測試：\n';
  let fumbleImgArr = ['https://i.imgur.com/ju9UQzA.png', 'https://i.imgur.com/M3meWXu.png'];
  let fumbleImg = fumbleImgArr[Dice(fumbleImgArr.length) - 1];
  let fumble = [
    {
      type: "text",
      text: rePly
    },
    {
      type: "image",
      originalContentUrl: fumbleImg,
      previewImageUrl: fumbleImg
    }
  ]
  SendMsg(rplyToken, fumble);
  return undefined;

  //let testStr = '2d10+10';
  //rePly=rePly + DiceCal(testStr).eq + '\n' + DiceCal(testStr).eqStr ;
  let i = 1;
  let testStr = '200 =1.2a3456';
  //rePly=rePly + parseInt(testStr.split('=',2)[1]) ;
  return rePly + (i + 1 + 2);

  let testValue = inputStr.toLowerCase().split(' ', 2)[1];
  let a;
  let b = 3;
  //if,else簡寫
  // (布林值)?為真時的狀況:不為真時狀況;
  (testValue > 5) ? a = 5 : a = 10, b = 20;
  rePly = rePly + a + ':' + b;
  return rePly;

}

//這可能是整個程式中最重要的一個函數。它是用來做「擲骰」的最基本部份，會一直被叫出來用。
//它的功能是，打 Dice(6) ，就會像骰六面骰一樣骰出一個介於1和6間的整數。
function Dice(diceSided) {
  //首先，Math.random()是一個製造亂數的函數，它會產生一個介於0～1的隨機數（不包含1）
  //然後我們將它乘上diceSided，就是我們指定的骰子面數。以剛剛的六面骰為例，它會產生一個0~6之間的隨機數（不包含6）。
  //接下來就要說 Math.floor() 了，它會把數字的小數部分無條件捨棄掉，變成整數。所以把上面那個餵他之後就會出現0~5這六個整數。
  //但是我們要的是1~6不是0~5，所以要找個地方+1，大概就是這樣啦。
  return Math.floor((Math.random() * diceSided) + 1)
}

//這個就是通用擲骰啦！
//但這是一個很大的東西，我拆成幾個不同的部分。
//nomalDiceRoller是程式的最外圍，主要是做複數擲骰與否的判定和最終輸出，然後加上「基本擲骰」的字樣。
//DiceCal和RollDice是計算的函數，RollDice把骰子骰出來變成數字，DiceCal負責把算式算出來變成值。
//舉例來說，2D10+3D8 這串，其中的2D10和3D8只要進到RollDice裡面，它會把裡面的骰子骰出來。
//2D10 會變成 (5+2) ，3D8 會變成像 (2+7+5) 。最後輸出回 DiceCal 組合成像 (5+2)+(2+7+5) 的算式。
//DiceCal他會計算出結果，然後加上等號，變成 (5+2)+(2+7+5)=21
//之所以拆開，是因為RollDice和DiceCal在其他地方還可以拿來用，所以才拆開。
function nomalDiceRoller(inputStr) {

  //先定義要輸出的Str
  //先把這個打出來，然後在過程中一點一點把它補上去，大部分的思路是這樣的。
  let finalStr = '';

  //首先判斷是否是誤啟動，檢查是否有符合骰子格式，就是d的前後有沒有都是數字。
  //這邊就複雜一點，我們拆開來看： \d+ d \d+
  //先看 \d ，這代表「數字字元」。再來是 + ，他是指「前面這個東西至少要出現一次（可以超過一次）」
  //因此 \d+ 代表「至少要有一個數字」。
  //所以在中間的 d 的前後各有一個 \d+ ，就是「緊鄰 d 的前後都至少要有一個數字。」
  if (inputStr.toLowerCase().match(/\d+d\d+/) == null) return undefined;

  //再來先把第一個分段拆出來，待會判斷是否是複數擲骰
  //match這個函數本來就是用來把符合的部分摘取出來，那 \S 代表的是「句首的非空白字元」的意思。
  //所以 \S+ 就是句首的所有非空白字元，舉例來說就是 "Hello World!" 的話，他會從第一個字元一直抓到遇到空白為止，
  //因此會抓出 Hello 這個部份。
  let mutiOrNot = inputStr.toLowerCase().match(/\S+/);

  //排除小數點，其實我也不知道為什麼不能用 '.' ，總之就是會報錯。
  //注意 . 這個字元在正則表達式裡面有特殊意義，所以單指小數點的時候要加 \ ，變成 \.
  if (mutiOrNot.toString().match(/\./) != null) return undefined;

  //把剛剛的第一個分段拉出來看，我們這裡設定的複數擲骰語法是這樣： 3 2d6+1
  //這樣就會輸出三次 2d6+1 ，所以最前面那個一定要是整數。
  //這裡的 \D 代表非數字字元；如果所有的字元都不是非數字，那就是只有整數，那就抓出來做複數擲骰。
  //如果不是只有整數，就丟進去DiceCal裡面算算看。
  if (mutiOrNot.toString().match(/\D/) == null) {
    finalStr = '複數擲骰：'
    if (mutiOrNot > 20) return '不支援20次以上的複數擲骰。這裡只有20顆骰子，所以……';

    //把第二部份分拆出來，丟進去待會要介紹的擲骰計算函數當中
    let DiceToRoll = inputStr.toLowerCase().split(' ', 2)[1];
    if (DiceToRoll.match('d') == null) return undefined;

    for (i = 1; i <= mutiOrNot; i++) {
      finalStr = finalStr + '\n' + i + '# ' + DiceCal(DiceToRoll).eqStr;
    }
    //報錯，不解釋。
    if (finalStr.match('200D') != null) finalStr = '複數擲骰：\n等等，200D以上沒辦法啦！說到底什麼時候會骰到兩百次以上？';
    if (finalStr.match('D500') != null) finalStr = '複數擲骰：\n不支援D1跟超過D500的擲骰……1根本不用骰嘛。500太多了啦。';

  }

  //走到這邊，表示可能是單次擲骰，丟進去DiceCal裡面算算看。
  else {
    //丟進去前檢查，第一部分是檢查如果沒有任何一部份符合骰子格式就回報undefined
    //第二部份是 d 的前後有非數字
    //第三部份是檢查是否有數字或運算符之外的字元
    if (mutiOrNot.toString().match(/\d+d\d+/) == null ||
      mutiOrNot.toString().match(/\Dd|d\D/) != null ||
      mutiOrNot.toString().match(/[^0-9dD+\-*\/()]/) != null)
      return undefined;

    finalStr = '基本擲骰：\n' + DiceCal(mutiOrNot.toString()).eqStr;
  }

  if (finalStr.match('NaN') != null || finalStr.match('undefined') != null) return undefined;
  return finalStr;
}

//這就是作計算的函數，負責把骰子算出來。
function DiceCal(inputStr) {

  //首先判斷是否是誤啟動（檢查是否有符合骰子格式）
  //你可能會想說上面不是檢查過了，但是因為在別的地方還機會呼叫所以不能省
  if (inputStr.toLowerCase().match(/\d+d\d+/) == null) return undefined;

  //排除小數點
  if (inputStr.toString().match(/\./) != null) return undefined;

  //一樣先定義要輸出的Str
  let equationStr = '';

  //一般單次擲骰，先把字串讀進來轉小寫
  let DiceToRoll = inputStr.toString().toLowerCase();

  //再檢查一次
  if (DiceToRoll.match(/\d+d\d+/) == null ||
    DiceToRoll.match(/\Dd|d\D/) != null ||
    DiceToRoll.match(/[^0-9dD+\-*\/()]/) != null)
    return undefined;

  //寫出算式，這裡使用while將所有「幾d幾」的骰子找出來，一個一個帶入RollDice並取代原有的部分
  while (DiceToRoll.match(/\d+d\d+/) != null) {
    let tempMatch = DiceToRoll.match(/\d+d\d+/);
    if (tempMatch.toString().split('d')[0] > 200) return { eqStr: '等等，200D以上沒辦法啦！說到底什麼時候會骰到兩百次以上？' };
    if (tempMatch.toString().split('d')[1] == 1 || tempMatch.toString().split('d')[1] > 500) return { eqStr: '不支援D1跟超過D500的擲骰……1根本不用骰嘛。500太多了啦。' };
    DiceToRoll = DiceToRoll.replace(/\d+d\d+/, RollDice(tempMatch));
  }

  //計算算式
  let answer = eval(DiceToRoll.toString());
  equationStr = DiceToRoll + ' = ' + answer;

  //在這裡設定兩個子參數，eq是只有算式，eqStr是把算式加總。
  //在不同情形下可能會有不同應用，所以拆開來，這樣可以少寫一個函數。
  let Final = {
    eq: DiceToRoll.toString(),
    eqStr: equationStr
  }

  return Final;
}

//用來把d給展開成算式的函數
function RollDice(inputStr) {
  //先把inputStr變成字串（不知道為什麼非這樣不可）
  let comStr = inputStr.toString().toLowerCase();

  //若是要把 3d6 變成 (2+1+4) ，那就先要有個 (
  let finalStr = '(';

  //接下來就是看有幾d幾，就要骰幾次骰，像是 3d6 就要做 3 次 Dice(6)，還要補上加號
  for (let i = 1; i <= comStr.split('d')[0]; i++) {
    finalStr = finalStr + Dice(comStr.split('d')[1]) + '+';
  }

  //那這樣會多一個+號，所以要去掉，再補上 ) ，這樣就完成了。
  finalStr = finalStr.substring(0, finalStr.length - 1) + ')';
  return finalStr;
}

//PBTA判定
function pbta(inputStr) {

  //先把句首前面的一段拆出來，我不知道為什麼如果用 \S+ 會報錯，多半是變數種類的問題但我不太懂。
  let input = inputStr.toLowerCase().split(' ', 2)[0];

  //同樣先處理報錯，先確定pb後面只有加或減
  if (input.match(/^pb[^+\-]/) != null ||
    input.match(/[^0-9pb+\-]/) != null)
    return undefined;

  //把pb去掉，留下後面的+-值，處理報錯
  bonus = input.replace('pb', '');
  if (bonus != '' && bonus.match(/-\d|\+\d/) == null) return undefined;

  //開始算咯，你看我們用到DiceCal.eq了吧
  let CalStr = DiceCal('2d6' + bonus).eq;

  if (eval(CalStr.toString()) >= 10) {
    return 'pbta擲骰：\n' + CalStr + '=' + eval(CalStr.toString()) + '，成功！';
  }
  else if (eval(CalStr.toString()) <= 6) {
    return 'pbta擲骰：\n' + CalStr + '=' + eval(CalStr.toString()) + '，失敗。';
  }
  else {
    return 'pbta擲骰：\n' + CalStr + '=' + eval(CalStr.toString()) + '，部分成功。';
  }


}

//cc創角
function ccCreate(inputStr) {
  //大致上的精神是，後面有數字就當作是有年齡調整的傳統創角，沒有的話就是常見的房規創角
  //如果最後面不是數字，就當作是常見的房規創角
  if (inputStr.toLowerCase().match(/\d+$/) == null) {
    let finalStr = '《悠子、冷嵐房規創角擲骰》\n==\n骰七次3D6取五次，\n決定STR、CON、DEX、APP、POW。\n';

    //DiceCal又被拿出來用了
    for (i = 1; i <= 7; i++) {
      finalStr = finalStr + '\n' + i + '# ' + DiceCal('3d6*5').eqStr;
    }

    finalStr = finalStr + '\n==\n骰四次2D6+6取三次，\n決定SIZ、INT、EDU。\n';

    for (i = 1; i <= 4; i++) {
      finalStr = finalStr + '\n' + i + '# ' + DiceCal('(2d6+6)*5').eqStr;
    }

    finalStr = finalStr + '\n==\n骰兩次3D6取一次，\n決定LUK。\n';
    for (i = 1; i <= 2; i++) {
      finalStr = finalStr + '\n' + i + '# ' + DiceCal('3d6*5').eqStr;
    }

    return finalStr;
  }

  //這是傳統創角，要抓年齡出來做年齡調整值的
  if (inputStr.toLowerCase().match(/\d+$/) != null) {

    //讀取年齡

    let old = inputStr.toLowerCase().match(/\d+$/);


    let ReStr = '《CoC7版核心規則創角擲骰》\n調查員年齡設為：' + old + '\n';
    if (old < 15) return ReStr + '等等，核心規則不允許小於15歲的人物哦。';
    if (old >= 90) return ReStr + '等等，核心規則不允許90歲以上的人物哦。';


    //設定 因年齡減少的點數 和 EDU加骰次數，預設為零
    let AdjustValue = {
      Debuff: 0,
      AppDebuff: 0,
      EDUinc: 0
    }

    //這裡是不同年齡的資料
    let AdjustData = {
      old: [15, 20, 40, 50, 60, 70, 80],
      Debuff: [5, 0, 5, 10, 20, 40, 80],
      AppDebuff: [0, 0, 5, 10, 15, 20, 25],
      EDUinc: [0, 1, 2, 3, 4, 4, 4]
    }

    for (i = 0; old >= AdjustData.old[i]; i++) {

      AdjustValue.Debuff = AdjustData.Debuff[i];
      AdjustValue.AppDebuff = AdjustData.AppDebuff[i];
      AdjustValue.EDUinc = AdjustData.EDUinc[i];

    }

    ReStr = ReStr + '==\n年齡調整：';

    if (old < 20) {
      ReStr = ReStr + '從STR、SIZ擇一減去' + AdjustValue.Debuff + '點\n（請自行手動選擇計算）。\n將EDU減去5點。LUK可擲兩次取高。';
    }
    else if (old >= 40) {
      ReStr = ReStr + '從STR、CON或DEX中「總共」減去' + AdjustValue.Debuff + '點\n（請自行手動選擇計算）。\n將APP減去' + AdjustValue.AppDebuff + '點。可做' + AdjustValue.EDUinc + '次EDU的成長擲骰。';
    }
    else {
      ReStr = ReStr + '可做' + AdjustValue.EDUinc + '次EDU的成長擲骰。';
    }

    ReStr = ReStr + '\n==';

    if (old >= 40) ReStr = ReStr + '\n（以下箭號三項，自選共減' + AdjustValue.Debuff + '點。）';
    if (old < 20) ReStr = ReStr + '\n（以下箭號兩項，擇一減去' + AdjustValue.Debuff + '點。）';
    ReStr = ReStr + '\nＳＴＲ：' + DiceCal('3d6*5').eqStr;
    if (old >= 40) ReStr = ReStr + ' ← 共減' + AdjustValue.Debuff;
    if (old < 20) ReStr = ReStr + ' ←擇一減' + AdjustValue.Debuff;
    ReStr = ReStr + '\nＣＯＮ：' + DiceCal('3d6*5').eqStr;
    if (old >= 40) ReStr = ReStr + ' ← 共減' + AdjustValue.Debuff;
    ReStr = ReStr + '\nＤＥＸ：' + DiceCal('3d6*5').eqStr;
    if (old >= 40) ReStr = ReStr + ' ← 共減' + AdjustValue.Debuff;
    if (old >= 40) ReStr = ReStr + '\nＡＰＰ：' + DiceCal('3d6*5-' + AdjustValue.AppDebuff).eqStr;
    else ReStr = ReStr + '\nＡＰＰ：' + DiceCal('3d6*5').eqStr;
    ReStr = ReStr + '\nＰＯＷ：' + DiceCal('3d6*5').eqStr;
    ReStr = ReStr + '\nＳＩＺ：' + DiceCal('(2d6+6)*5').eqStr;
    if (old < 20) ReStr = ReStr + ' ←擇一減' + AdjustValue.Debuff;
    ReStr = ReStr + '\nＩＮＴ：' + DiceCal('(2d6+6)*5').eqStr;
    if (old < 20) ReStr = ReStr + '\nＥＤＵ：' + DiceCal('(2d6+6)*5-5').eqStr;
    else {
      ReStr = ReStr + '\n==';

      let firstEDU = DiceCal('(2d6+6)*5').eq;
      let tempEDU = eval(firstEDU);

      ReStr = ReStr + '\nＥＤＵ初始值：' + firstEDU + ' = ' + tempEDU;

      for (i = 1; i <= AdjustValue.EDUinc; i++) {
        let EDURoll = Dice(100);
        ReStr = ReStr + '\n第' + i + '次EDU成長 → ' + EDURoll;


        if (EDURoll > tempEDU) {
          let EDUplus = Dice(10);
          ReStr = ReStr + ' → 成長' + EDUplus + '點';
          tempEDU = tempEDU + EDUplus;
        }
        else {
          ReStr = ReStr + ' → 沒有成長';
        }
      }
      ReStr = ReStr + '\n';
      ReStr = ReStr + '\nＥＤＵ最終值：' + tempEDU;
    }
    ReStr = ReStr + '\n==';

    ReStr = ReStr + '\nＬＵＫ：' + DiceCal('3d6*5').eqStr;
    if (old < 20) ReStr = ReStr + '\nＬＵＫ加骰：' + DiceCal('3D6*5').eqStr;


    return ReStr;
  }

}

//隨機產生角色背景
function ccbg() {

  let bg = {
    //基本描述
    //PersonalDescription
    PD: ['結實的', '英俊的', '粗鄙的', '機靈的', '迷人的', '娃娃臉的', '聰明的', '蓬頭垢面的', '愚鈍的', '骯髒的', '耀眼的', '有書卷氣的', '青春洋溢的', '感覺疲憊的', '豐滿的', '粗壯的', '毛髮茂盛的', '苗條的', '優雅的', '邋遢的', '敦實的', '蒼白的', '陰沉的', '平庸的', '臉色紅潤的', '皮膚黝黑色', '滿臉皺紋的', '古板的', '有狐臭的', '狡猾的', '健壯的', '嬌俏的', '筋肉發達的', '魁梧的', '遲鈍的', '虛弱的'],

    //信念
    //IdeologyBeliefs
    IB: ['虔誠信仰著某個神祈', '覺得人類不需要依靠宗教也可以好好生活', '覺得科學可以解釋所有事，並對某種科學領域有獨特的興趣', '相信因果循環與命運', '是一個政黨、社群或秘密結社的成員', '覺得這個社會已經病了，而其中某些病灶需要被剷除', '是神秘學的信徒', '是積極參與政治的人，有特定的政治立場', '覺得金錢至上，且為了金錢不擇手段', '是一個激進主義分子，活躍於社會運動'],

    //重要之人
    //SignificantPeople
    SP: ['他的父母', '他的祖父母', '他的兄弟姐妹', '他的孩子', '他的另一半', '那位曾經教導調查員最擅長的技能（點數最高的職業技能）的人', '他的兒時好友', '他心目中的偶像或是英雄', '在遊戲中的另一位調查員', '一個由KP指定的NPC'],

    //這個人為什麼重要
    //SignificantPeopleWhy
    SPW: ['調查員在某種程度上受了他的幫助，欠了人情', '調查員從他那裡學到了些什麼重要的東西', '他給了調查員生活的意義', '調查員曾經傷害過他，尋求他的原諒', '和他曾有過無可磨滅的經驗與回憶', '調查員想要對他證明自己', '調查員崇拜著他', '調查員對他有著某些使調查員後悔的過往', '調查員試圖證明自己和他不同，比他更出色', '他讓調查員的人生變得亂七八糟，因此調查員試圖復仇'],

    //意義非凡之地
    //MeaningfulLocations
    ML: ['過去就讀的學校', '他的故鄉', '與他的初戀之人相遇之處', '某個可以安靜沉思的地方', '某個類似酒吧或是熟人的家那樣的社交場所', '與他的信念息息相關的地方', '埋葬著某個對調查員別具意義的人的墓地', '他從小長大的那個家', '他生命中最快樂時的所在', '他的工作場所'],

    //寶貴之物
    //TreasuredPossessions
    TP: ['一個與他最擅長的技能（點數最高的職業技能）相關的物品', '一件他的在工作上需要用到的必需品', '一個從他童年時就保存至今的寶物', '一樣由調查員最重要的人給予他的物品', '一件調查員珍視的蒐藏品', '一件調查員無意間發現，但不知道到底是什麼的東西，調查員正努力尋找答案', '某種體育用品', '一把特別的武器', '他的寵物'],

    //特徵
    //Traits
    T: ['慷慨大方的人', '對動物很友善的人', '善於夢想的人', '享樂主義者', '甘冒風險的賭徒或冒險者', '善於料理的人', '萬人迷', '忠心耿耿的人', '有好名聲的人', '充滿野心的人']

  }


  return 'CoC7th背景描述生成器\n（僅供娛樂用，不具實際參考價值）\n==\n調查員是一個' + bg.PD[Dice(bg.PD.length) - 1] + '人。\n【信念】：說到這個人，他' + bg.IB[Dice(bg.IB.length) - 1] + '。\n【重要之人】：對他來說，最重要的人是' + bg.SP[Dice(bg.SP.length) - 1] + '，這個人對他來說之所以重要，是因為' + bg.SPW[Dice(bg.SPW.length) - 1] + '。\n【意義非凡之地】：對他而言，最重要的地點是' + bg.ML[Dice(bg.ML.length) - 1] + '。\n【寶貴之物】：他最寶貴的東西就是' + bg.TP[Dice(bg.TP.length) - 1] + '。\n【特徵】：總括來說，調查員是一個' + bg.T[Dice(bg.T.length) - 1] + '。';

}

//cc指令，也就是CoC的主要擲骰控制位置。
function CoC7th(rplyToken, inputStr, guildFlag = false) {

  //創角
  if (inputStr.toLowerCase().match('創角') != null || inputStr.toLowerCase().match('crt') != null)
    return ccCreate(inputStr);

  //隨機產生角色背景
  if (inputStr.toLowerCase().match('bg') != null) return ccbg();

  //接下來就是主要的擲骰部分啦！
  //如果不是正確的格式，直接跳出
  if (inputStr.match('<=') == null && inputStr.match('cc>') == null) return undefined;

  //記錄檢定要求值，簡單來說就是取 = 後的「整數」部分，parseInt就是強制取整
  let chack = parseInt(inputStr.split('=', 2)[1]);

  //設定回傳訊息
  let ReStr = 'CoC7th擲骰：\n(1D100<=' + chack + ') → ';

  //先骰兩次十面骰作為起始值。為什麼要這樣呢，因為獎懲骰的部分十面骰需要重骰，這樣到時候會簡單一點。
  let TenRoll = Dice(10);
  let OneRoll = Dice(10) - 1;

  //把剛剛的十面骰組合成百面
  let firstRoll = TenRoll * 10 + OneRoll;
  if (firstRoll > 100) firstRoll = firstRoll - 100;


  //先設定最終結果等於第一次擲骰
  let finalRoll = firstRoll;


  //判斷是否為成長骰
  if (inputStr.match(/^cc>\d+/) != null) {
    chack = parseInt(inputStr.split('>', 2)[1]);
    if (finalRoll > chack || finalRoll > 95) {
      let plus = Dice(10);
      ReStr = 'CoC7th擲骰【技能成長】：\n(1D100>' + chack + ') → ' + finalRoll + ' → 成功成長' + plus + '點！\n最終值為：' + chack + '+' + plus + '=' + (chack + plus);
      return ReStr;
    }
    else if (finalRoll <= chack) {
      ReStr = 'CoC7th擲骰【技能成長】：\n(1D100>' + chack + ') → ' + finalRoll + ' → 沒有成長！';
      return ReStr;
    }
    else return undefined;
  }


  //判斷是否為獎懲骰
  let BPDice = null;

  //if(inputStr.match(/^cc\(-?[12]\)/)!=null) BPDice = parseInt(inputStr.split('(',2)[1]) ;
  if (inputStr.match(/^cc\(-?\d+\)/) != null) BPDice = parseInt(inputStr.split('(', 2)[1]);

  if (Math.abs(BPDice) != 1 && Math.abs(BPDice) != 2 && BPDice != null) return 'CoC7th的獎懲骰，允許的範圍是一到兩顆哦。';

  //如果是獎勵骰
  if (BPDice != null) {
    let tempStr = firstRoll;
    for (let i = 1; i <= Math.abs(BPDice); i++) {
      let OtherTenRoll = Dice(10);
      let OtherRoll = OtherTenRoll.toString() + OneRoll.toString();

      if (OtherRoll > 100) OtherRoll = parseInt(OtherRoll) - 100;

      tempStr = tempStr + '、' + OtherRoll;
    }
    let countArr = tempStr.split('、');
    if (BPDice > 0) finalRoll = Math.min(...countArr), ReStr = 'CoC7th擲骰【獎勵骰取低】：\n(1D100<=' + chack + ') → ';
    if (BPDice < 0) finalRoll = Math.max(...countArr), ReStr = 'CoC7th擲骰【懲罰骰取高】：\n(1D100<=' + chack + ') → ';

    ReStr = ReStr + tempStr + ' \n→ ';
  }

  //結果判定
  if (finalRoll == 1) ReStr = ReStr + finalRoll + ' → 恭喜！大成功！';
  else
    if (finalRoll == 100) ReStr = ReStr + finalRoll + ' → 啊！大失敗！';
    else
      if (finalRoll <= 99 && finalRoll > 95 && chack < 50) ReStr = ReStr + finalRoll + ' → 啊！大失敗！';
      else
        if (finalRoll <= chack / 5) ReStr = ReStr + finalRoll + ' → 極限成功！';
        else
          if (finalRoll <= chack / 2) ReStr = ReStr + finalRoll + ' → 困難成功！';
          else
            if (finalRoll <= chack) ReStr = ReStr + finalRoll + ' → 通常成功！';
            else ReStr = ReStr + finalRoll + ' → 失敗了……';

  //浮動大失敗運算
  if (finalRoll <= 99 && finalRoll > 95 && chack >= 50) {
    if (chack / 2 < 50) ReStr = ReStr + '\n（若要求困難成功則為大失敗）';
    else
      if (chack / 5 < 50) ReStr = ReStr + '\n（若要求極限成功則為大失敗）';
  }


  //傳送表情符號
  if (guildFlag) {

    if (ReStr.match('恭喜！大成功！') != null) ReStr = ReStr + '\n<:TakumiyaSleep:1408877984105894001>';
    else
      if (ReStr.match('啊！大失敗！') != null) ReStr = ReStr + '\n<:TakumiyaAngry:1407737950862577875>';
      else
        if (ReStr.match('極限成功！') != null) ReStr = ReStr + '\n<:TakumiyaSandwitch:1407738773139226644>';
        else
          if (ReStr.match('困難成功！') != null) ReStr = ReStr + '\n<:Takumiya:1409221651467468921>';
          else
            if (ReStr.match('通常成功！') != null) ReStr = ReStr + '\n<:Takumiya:1409221651467468921>';
            else
              if (ReStr.match('失敗了……') != null) ReStr = ReStr + '\n<:TakumiyaCry:1407737942780416080>';

  }

  return ReStr;
}

//依照關鍵字傳送圖片的函數
function SendImg(rplyToken, inputStr) {
  let message = [
    {
      chack: ['想相離家出走', '阿想離家出走'],
      img: ['https://i.imgur.com/FItqGSH.jpg']
    },
    {
      chack: ['我什麼都沒有'],
      img: ['https://i.imgur.com/k4QE5Py.png']
    }

  ]

  for (i = 0; i < message.length; i++) {
    for (j = 0; j < message[i].chack.length; j++) {
      if (inputStr.toLowerCase().match(message[i].chack[j]) != null) {
        let tempImgUrl = message[i].img[Dice(message[i].img.length) - 1];
        let rplyVal = [
          {
            type: "image",
            originalContentUrl: tempImgUrl,
            previewImageUrl: tempImgUrl
          }
        ]
        SendMsg(rplyToken, rplyVal);
        return undefined;
      }
    }

  }

  return undefined;
}

function TakumiManual(guildFlag = false) {
  //一般功能說明
  let manual = '\
    呃……嗨。因為這樣那樣的原因，總而言之，我現在就負責擲骰了。\
    \n喊出骰子的個數、面數，我就會幫你丟出結果，大家應該都很熟悉了吧。\
    \n修正也交給我吧，簡單的加減運算我還是有信心的！例如：2d4+1、2D10+1d2。\
    \n需要多筆輸出的話，就先打次數再空一格打骰數。例如：7 3d6、5 2d6+6。\
    \n對了，用大寫D或是小寫d都沒問題喔。 \
    \n \
    \n接下來，跟我聊天的指令是……「takumi」。有種似乎用了代稱又沒用的微妙感覺……\
    \n總之，目前也支援多數CoC 7th指令，可打「takumi cc」取得更多說明。 \
    \n初步支持pbta擲骰……這是什麼？不，沒事。語法為pb、pb+2。\
    \n似乎還有一些額外功能，想知道的話就輸入「takumi 額外功能」吧。\
    \n \
    \n以上功能均繼承至RoboYabaso（HTKRPG的前身）！幫大忙了，謝謝！ \
    ';

  if (guildFlag) manual = manual + '\n<:Takumiya:1409221651467468921>';

  return manual;
}

function TakumiReply(inputStr, guildFlag = false) {

  //功能說明
  if (inputStr.match('額外功能') != null) return '\
    我看看喔……目前實裝的功能有以下這些：\
    \n \
    \n運勢：只要提到我的名字和[運勢]，我就會回答你的運勢。 \
    \n隨機選擇：只要提到我的名字和[選、挑、決定]，然後空一格打選項。 \
    \n選項之間也要用空格隔開，我就會幫你挑一個。\
    \n抽籤：只要提到我的名字和[抽籤]，我就會幫你從100個籤裡面抽一張。 \
    \n內容出自東京淺草寺一百籤，最後會附上參考資料網址。\
    \n \
    \n話說這種事交給我沒問題嗎？感覺更適合讓蒼月來做啊……那傢伙的特異科目不是占卜嘛。\
    ';
  else

    //CC功能說明
    if (inputStr.match('cc') != null) return '\
      【CC功能說明】\
      \n \
      \n基礎指令：\
      \ncc<=[數字]：和凍豆腐一樣，最常用的一般檢定。\
      \ncc([-2~2])<=[數字]：獎懲骰。\
      \ncc>[數字]：幕間成長骰，用於幕間技能成長。\
      \n \
      \n額外指令：\
      \ncc 創角/crt [年齡]」：一鍵創角。\n若不加上年齡參數，則以悠子/冷嵐房規創角。若加上年齡，則以核心規則創角（含年齡調整）。\
      \ncc bg：娛樂性質居多的調查員背景產生器。\
      ';
    else

      //幫我選
      if (inputStr.match('選') != null || inputStr.match('決定') != null || inputStr.match('挑') != null) {
        let rplyArr = inputStr.split(' ');

        if (rplyArr.length == 1) return '你好像還沒打完訊息的樣子？慢慢來也沒關係喔。';

        rplyArr.shift();

        //20%機率不給答案
        if (Dice(5) == 1) {
          rplyArr = ['這個……你還是自己決定吧？',
                     '人生是掌握在自己手裡的！……我的一位朋友曾經這麼說。',
                     '總覺得沒有差很多……',
                     '抱歉，我也不清楚……',
                     '就算是我，也不想做這種選擇啊……',
                     '不要把這種事交給我決定比較好吧。'];
          return rplyArr[Dice(rplyArr.length) - 1];
        }

        let prefixArr = ['我想想喔……我覺得，',
                         '這個嘛……那就，',
                         '嗯……'];

        let suffixArr = ['吧。',
                         '好了。',
                         '怎麼樣？'];

        let prefix = prefixArr[Dice(prefixArr.length) - 1];
        let Answer = rplyArr[Dice(rplyArr.length) - 1];
        let suffix = suffixArr[Dice(suffixArr.length) - 1];

        return prefix + Answer + suffix;
      }

  // 特定關鍵字回應
  let message = [
    {
      chack: ['蒼月', '蒼月衛人'],
      text: ['什麼，難道蒼月那傢伙又怎麼了嗎！？',
             '蒼月那傢伙，真讓人頭痛……',
             '蒼月他……應該不在這裡吧……？']
    },
    {
      chack: ['狗叫'],
      text: ['不要。',
             '不要！',
             '……汪。',
             '哈？',
             '你、你說什麼？',
             '……什麼？',
             '不。',
             '夠了！']
    },
    {
      chack: ['喵'],
      text: ['喵喵。',
             '喵？',
             '喵！',
             '喵。',
             '玩夠了吧。',
             '喵……',
             '呼嚕呼嚕。',
             '喵喵……']
    },
    {
      chack: ['睡覺'],
      text: ['可以休息了嗎？',
             '我也想睡……',
             '好。',
             '晚安。']
    },
    {
      chack: ['早安'],
      text: ['早啊，昨晚有睡好嗎？',
             '呼啊……早。',
             '大家，早安啊！有沒有充滿幹勁啊——！？',
             '早安，今天也要加油喔。',
             '早安，吃過早餐了嗎？']
    },
    {
      chack: ['午安'],
      text: ['午安。今天過得如何？',
             '嗯，午安。',
             '午安。下午有想做的事嗎？',
             '午安。有什麼需要幫忙的，隨時告訴我。']
    },
    {
      chack: ['晚安'],
      text: ['晚安，我也要去睡了。',
             '晚安，有個好夢。',
             '呼啊……晚安……',
             '晚安，明天見。']
    },
    {
      chack: ['唸一下那個'],
      text: ['特防部隊！世界第一！永生不滅！所向無敵！風霜雨雪！絕不氣餒！特防部隊！曠世無匹！',
             '特防隊是宇宙第一！永遠不滅的無敵部隊！無論遇見什麼都不會氣餒！特防隊是……最強的！',
             '你的笑容有如太陽般燦爛，照亮了我的心靈……\n你的手有如花瓣，溫柔地包覆我的身體……\n令我心頭小鹿亂撞，如夢一般的時光……\n和你在一起時，我是多麼希望時間能就此停止……',
             '是夢！這全部都是夢啊！啊哈哈哈哈！這是夢結局！一定是夢結局啦！',
             '川奈……可以再幫我按摩穴道嗎……猛力地……按下去……',
             '唔喔喔喔喔！這就是最後的防衛戰啊啊啊啊啊啊啊！',
             '就像那懸掛在澄澈原野上空的蒼藍之月……一樣。']
    }

  ]
  // 加入表情符號
  if (guildFlag) {
    message[1].text.push('<:TakumiyaAngry:1407737950862577875>');
    message[2].text.push('<:TakumiyaSandwitch:1407738773139226644>');
    message[3].text.push('<:TakumiyaSleep:1408877984105894001>');
  }

  // 檢查關鍵字
  for (i = 0; i < message.length; i++) {
    for (j = 0; j < message[i].chack.length; j++) {
      if (inputStr.toLowerCase().match(message[i].chack[j]) != null) {
        return message[i].text[Dice(message[i].text.length) - 1];
      }
    }

  }

  //以下是運勢功能
  if (inputStr.match('運勢') != null) {
    let rplyArr = ['超大吉', '大吉', '大吉', '中吉', '中吉', '中吉', '小吉', '小吉', '小吉', '小吉', '凶', '凶', '凶', '大凶', '大凶', '還、還是不要知道比較好'];
    let Future = rplyArr[Dice(rplyArr.length) - 1];

    let command = '';

    if (Future == '還、還是不要知道比較好') command = '保持現狀總比一整天都被影響心情更好嘛。';
    else if (Future == '大凶') command = '別擔心，一切都會過去的！';
    else if (Future == '凶') command = '嘛……總會有辦法的啦。';
    else if (Future == '小吉') command = '只要是好運就沒問題啦。';
    else if (Future == '中吉') command = '今天會是好運的一天喔！';
    else if (Future == '大吉') command = '太好了，今天會是非常幸運的一天！';
    else if (Future == '超大吉') command = '哇，好強！今天是你超級幸運的一天啊！';

    return '你今天的運勢是——' + Future + '！\n' + command;
  }

  // 以下是抽籤功能
  if (inputStr.match('抽籤') != null) {
    const number = Dice(100);
    const result = lots[number];
    const lines = result.split("\n");
    let rplyArr = [`你抽到的是——第 ${number} 籤！`];
    rplyArr.push('========================');

    lines.forEach((line, index) => {

      if (index === 0) {
        rplyArr.push(`【${line}】\n`);
      } else if ([1, 3, 5, 7].includes(index)) {
        rplyArr.push(`**${line}**`);
      } else if (index === 9) {
        rplyArr.push('\n' + line);
      } else {
        rplyArr.push(line);
      }
    });
    rplyArr.push('========================');

    const numStr = number.toString().padStart(3, '0');
    rplyArr.push(`http://www.chance.org.tw/籤詩集/淺草金龍山觀音寺一百籤/籤詩網‧淺草金龍山觀音寺一百籤__第${numStr}籤.htm`);

    return rplyArr.join("\n");
  }

  //沒有觸發關鍵字則是這個
  else {
    let rplyArr = ['在叫我嗎？',
                   '我在這裡。',
                   '我想回去睡覺了……',
                   '怎麼了？',
                   '……我可以走了嗎？',
                   '我？需要幫忙嗎？',
                   '好睏……',
                   '哇！是骰子！骰子真有趣！',
                   '（難道喊我的名字本身就很開心？）',
                   '（又在叫我了……）'];
    return rplyArr[Dice(rplyArr.length) - 1];
  }

}

function Yababang(inputStr) {
  let rplyArr = inputStr.split(' ');
  let pl = rplyArr[1];
  if (rplyArr.length == 1) return '想要挑戰入幫測驗，就把格式打好啊幹！';
  if (inputStr.match('yabaso') != null || inputStr.match('巴獸') != null || inputStr.match('鴨巴') != null || inputStr.match('鴨嘴獸') != null || inputStr.match('幫主') != null || inputStr.match('泰瑞') != null) return '幫主好！幹，那邊那個菜比巴，看到幫主不會敬禮啊，想被淨灘是不是？！';

  //關卡設定
  let challenge = [
    {
      stage: 1,
      good: [
        '「口桀口桀口桀，沒有大捏捏的人是無法通過我言青問這一關的。」請問站在通往下一關的通道前對著你這樣說。\n' + pl + '拿出手機，在請問的面前課了一單明星三缺一，成為了請問的衣食父母，通過了關卡。',

        '你看到一個牌子寫著測驗入口，鴨霸幫的傳統測驗第一關就是攀登末日火山，穿越幽暗水道，戰勝九頭蜥蜴，並且躍過無底深淵。\n\n但' + pl + '偵查大成功，看到底下的小字寫著「抖內幫主吃上引水產就可以直接通過第一關」，你拿出魔法小卡結束了這個回合。',

        '一陣寒風襲來，讓你不寒而慄，眼前的人影逐漸顯現，披著披風掩蓋著對方的面孔。他問你：\n「你吃薯餅都沾什麼醬？」\n\n' + pl + '岔開了話題，「先不提這個了，你先來幫我查一下高鐵。」\n\n眼前的人影親切的教了你高鐵時刻表要怎麼訂票，心滿意足的離去了。真是親切的人呢。',

        '走進房間，你面前出現一張小桌子，兩旁放著椅子。桌上有著一盒十二顆裝的馬卡龍，上面寫著「for Dear」。\n當你開心的拿起時，你看到了下面的字樣寫著：「給ㄌㄒ。」\n\n' + pl + '不屑的翻掉桌子，嘲諷的說：「我不需要女朋友也可以寫出超華麗的開場啦幹！」\n你瀟灑離開，無視身後好像有人哭著大喊我的：「我的馬卡龍！！！」',

        '你的眼前出現了一個正在嚎啕大哭的貓耳小女孩，眼淚彷彿噴泉一樣\n一邊哭一邊喊道，「為什麼你們每天都可以一直玩？」\n\n'
        + pl + '面無表情的說：「因為我有本錢玩阿，關你屁事。」\n你無視了錯愕的女孩，拂袖離去。'],

      bad: [
        '「口桀口桀口桀，沒有大捏捏的人是無法通過我言青問這一關的。」請問站在通往下一關的通道前對著你這樣說。\n\n' + pl + '抓了抓頭，請問覺得你抓頭的樣子很像猴子，於是用慘絕人寰的方式殺害了你。',

        '你看到一個牌子寫著測驗入口，鴨霸幫的傳統測驗第一關就是攀登末日火山，穿越幽暗水道，戰勝九頭蜥蜴，並且躍過無底深淵。\n\n' + pl + '奮勇的接受挑戰，但是在和九頭蜥蜴PK脫衣麻將的時候輸到連內褲都不剩了。',

        '一陣寒風襲來，讓你不寒而慄，眼前的人影逐漸顯現，披著披風掩蓋著對方的面孔。他問你：\n「你吃薯餅都沾什麼醬？」\n\n' + pl + '戰戰兢兢的回答：「番、番茄醬……？」\n\n於是迎來了殘忍的死亡。',

        '走進房間，你面前出現一張小桌子，兩旁放著椅子。桌上有著一盒十二顆裝的馬卡龍，上面寫著「for Dear」。\n當你開心的拿起時，你看到了下面的字樣寫著：「給ㄌㄒ。」\n\n' + pl + '忽然眼前一黑，你才想起今天出門的時候忘了戴墨鏡，看來是被閃瞎了。',

        '你的眼前出現了一個正在嚎啕大哭的貓耳小女孩，眼淚彷彿噴泉一樣\n一邊哭一邊喊道，「為什麼你們每天都可以一直玩？」\n\n「我…我才沒有一直在玩呢！」' + pl + '這樣辯解道。\n但女孩忽然衝上前來抓住你，強迫你在Steam上買了一個叫做「100% Orange juice」的遊戲。\n\n女孩把你養在地下室裡，只有她需要橘子汁的咖的時候才會把你放出來。']
    },
    {
      stage: 2,
      good: [
        '「科科科，沒想到你能走到這裡，不過也到極限了，接下來就讓柯基來當你的對手吧！」一群柯基科科科的叫著撲了上去。\n\n' + pl + '成功將柯基做成三杯基，配著台啤吃得酒足飯飽。',

        '一位男子出現在' + pl + '的眼前，他說「辛苦你能來到這裡呢，接下來就由我默兒陪你繼續踏上旅途吧。」\n\n你的靈感忽然過了，用了百米25秒的速度逃離了默兒。',

        '你的手機突然亮起，Line上傳來了不知名的訊息。\n\n「巴獸真的很嚴格。」\n「比我想像的嚴格！」\n「幫我把這幾句Keep起來。」\n\n奇怪的訊息出現了，到底要怎麼Keep才是正確的呢？\n\n﹁\n巴\n比\n幫\n﹂\n\n你把這三句話的頭三個字Keep了下來然後回傳了回去，雖然甚麼事情都沒發現，但是你感覺你似乎度過了這場試煉。',

        '在你面前突然出現了一座小島！！！\n該怎麼辦呢？\n\n「這座小島陸沉了！」你指著小島大喊，小島彷彿有生命一般的直接沉入了海底。\n你昂首闊步，完全不回頭。',

        '一名穿著粉色變身少女服裝的男子出現在你的面前，比出了代替月亮逞罰你的姿勢      「別想，接下來就由我光之美少女——閃亮黑熊作你的對手吧，理性閃亮史巴扣！」\n\n' + pl + '不慌不忙的詠唱著「黑熊熊穿浴衣👘～黑熊熊穿浴衣👘～耶嘿～」，黑熊醬害羞的帶起馬頭面具，抱著巫女服跑走了。'
      ],


      bad: [
        '「科科科，沒想到你能走到這裡，不過也到極限了，接下來就讓柯基來當你的對手吧！」一群柯基科科科的叫著撲了上去。\n\n' + pl + '的line群頁面充斥著柯基的貼圖，從此你看到柯基的line貼圖都會喚起現在的心靈創傷。',

        '一位男子出現在' + pl + '的眼前，他說「辛苦你能來到這裡呢，接下來就由我默兒陪你繼續踏上旅途吧。」\n\n你與默兒踏上了旅途之後，不知為何敵人的攻擊總是落到了你的身上，漸漸的你也失去了繼續前進的力量，倒在了不知名的路上。',

        '你的手機突然亮起，Line上傳來了不知名的訊息。\n\n「巴獸真的很嚴格。」\n「比我想像的嚴格！」\n「幫我把這幾句Keep起來。」\n\n奇怪的訊息出現了，到底要怎麼Keep才是正確的呢？\n\n你穩扎穩打的把三句話都完完整整的Keep下來。就在你信心滿滿的回傳回去的瞬間……\n\n你被一個布袋給蓋住了頭，遮蔽了視野。\n\n「居然敢瞧不起我們巴比幫的，來人！給我打！」\n\n你就這樣在一陣混亂中，被亂棍打死了……',

        '在你面前突然出現了一座小島！！！\n該怎麼辦呢？\n\n「小島上出現了許多柯基！」你大喊。\n彷彿應和你的要求一般，小島上出現了大量的柯基犬，屁顛屁顛的蹭著你。\n\n「然後出現了大量的高麗菜！」你興致更高的大喊。隨即小島上就出現了大量的高麗菜，柯基們都像發了瘋似的瘋狂啃食這些不速之菜。\n\n你玩的不亦樂乎，沉醉在這個自己可以呼風喚雨的小島上。\n但你沒發現，這座小島在你不注意的時候，已經漂離凡世越來越遠、越來越遠……你就這樣與這座小島消失在虛空之中。',

        '一名穿著粉色變身少女服裝的男子出現在你的面前，比出了代替月亮逞罰你的姿勢      「別想，接下來就由我光之美少女——閃亮黑熊作你的對手吧，理性閃亮史巴扣！」\n\n看見除此的美貌，' + pl + '不由得心動，口中喃喃的說著，「…黑熊醬…像黑熊醬這麼可愛的女孩，沒有男朋友，實在…太不可思議了。」\n\nこのあと滅茶苦茶セックスした'
      ]
    },
    {
      stage: 3,
      good: [
        '「cc(2)<=1 古小蜜學」「(1D100<=1) → 46、96、16 → 16 → 失敗」' + pl + '看到一群人說著你不懂的語言。\n\n你露出了輕蔑的微笑說「cc(2)<=1 請問佑我！」\n「(1D100<=1) → 21、1、91 → 1 → 恭喜！大成功！」\n\n區區2.7%的機率對天選之人算得了什麼，你揚長而去。',

        '一頭巨大的，頭上寫著「大家的小三」的倉鼠出現在' + pl + '的眼前，他說：「你怎麼會玩這個一點意義都沒有的無聊遊戲？聽話，乖，回去吃你的飯備你的團寫你的程式背你的英文單字好好的過你的生活，放棄入幫測驗吧。」\n\n你不慌不忙的拿出line keep，倉鼠就一邊哭一邊拖著行李箱離家出走了。',

        '你踏進第三關的房間。突然，你周遭的空氣變得非常寒冷，燈光也變得幽暗下來。你感到一股由骨髓深處竄出的寒冷。正當你不知所措的時候。從你背後傳來了一個可怕的聲音……\n\n「……你４不４……」話語到這裡就中斷了。\n\n話語到這裡就中斷了。你站立在原地，不知如何是好。\n但聲音也沒有進一步的舉動，看來是在等待你的回應。\n\n「你４不４想拔嘴人家！！！」你毫不猶豫的大聲回答。\n「你４在大聲甚麼啦！」後面的聲音也７ｐｕｐｕ的吼了回來！\n\n就當你猛然轉頭回去的瞬間，周遭的空氣變回平常的溫度，而燈光也不知何時恢復了。\n你似乎突破了這個試煉。'],
      bad: [
        '「cc(2)<=1 古小蜜學」「(1D100<=1) → 46、96、16 → 16 → 失敗」' + pl + '看到一群人說著你不懂的語言。\n\n當你正準備逃跑的時候他們忽然衝了上來，口吐褻瀆的語句：\n「cc(2)<=10 請問學」「cc(2)<=10 柯基學」「cc(2)<=10 ㄌㄌ學」將你淹沒了。',

        '一頭巨大的，頭上寫著「大家的小三」的倉鼠出現在' + pl + '的眼前，他說：「你怎麼會玩這個一點意義都沒有的無聊遊戲？聽話，乖，回去吃你的飯備你的團寫你的程式背你的英文單字好好的過你的生活，放棄入幫測驗吧。」\n\n看著倉鼠柔軟的毛皮和水靈靈的大眼睛，你的鬥志全消，覺得自己被掰彎了。',

        '你踏進第三關的房間。突然，你周遭的空氣變得非常寒冷，燈光也變得幽暗下來。你感到一股由骨髓深處竄出的寒冷。正當你不知所措的時候。從你背後傳來了一個可怕的聲音……\n\n「……你４不４……」話語到這裡就中斷了。\n\n話語到這裡就中斷了。你站立在原地，不知如何是好。\n但聲音也沒有進一步的舉動，看來是在等待你的回應。\n\n「……想幹人家？」思考了一陣子，你把這句句子給完成了。\n「…答錯惹……」聲音顯得有點哀傷。\n\n七天之後，你那嘴巴被拔掉的悽慘屍體被人發現在東海岸的沙灘上。']
    },
    {
      stage: 4,
      good: [
        '「可惡！我也想上鴨霸幫挑戰！」一隻非常擅長密室逃脫的他口擋住了你的去路，「我也想要當關主啊！」\n\n' + pl + '正想說什麼的時候，忽然有個人跳出來說，「那你就去投稿啊幹！」，他口就哭著跑走了。雖然你一頭霧水但還是平安的通過了這一關。',

        '「哼哼哼，沒想到你能到第四關呢，不過也到極限了，接下來就讓我鎖鏈桑尼來當你的對手吧！」桑尼揮舞著鎖鏈，虎虎生風。\n\n' + pl + '淡定的說出：「神奇寶貝主題曲」這幾個字，桑尼便跪倒在地，默默流下兩行眼淚。',

        '你來到了一個舊玩具回收站。一個面容和善、但似乎好像在電視上看過的女性靠近了你。\n\n「你好，我想問你，要如何才能把舊玩具變成新玩具呢？」\n\n「當然是學習交換與分享！」你豎起大拇指。\n女性高興的點點頭，遞給你一塊栗子泥蛋糕作為通關的證明，然後一個轉眼就消失了。'],
      bad: [
        '「可惡！我也想上鴨霸幫挑戰！」一隻非常擅長密室逃脫的他口擋住了你的去路，「我也想要當關主啊！」\n\n' + pl + '躡手躡腳地想要從他身邊繞過去，殊不知他忽然說「算了，反正就算我當不成關主，我還有很多妹子。要妹子，找他口。」\n你聽到這樣的話之後受到了相當的心靈創傷，一蹶不振。',

        '「哼哼哼，沒想到你能到第四關呢，不過也到極限了，接下來就讓我鎖鏈桑尼來當你的對手吧！」桑尼揮舞著鎖鏈，虎虎生風。\n\n' + pl + '被飛舞的鎖鏈給迷惑，陷入了深深的幻境……當你重新醒過來的時候，什麼都不記得，只留下深深的恐懼。',

        '你來到了一個舊玩具回收站。一個面容和善、但似乎好像在電視上看過的女性靠近了你。\n\n「你好，我想問你，要如何才能把舊玩具變成新玩具呢？」\n\n「當然是課金抽抽抽！」你豎起大拇指。\n\n女性的臉沉了下來，正當你想開口再說些甚麼時，你的視線卻突然越來越後退。在你的視野中，你只看到那個女性，以及站在女性前面的那個。已失去頭顱的、你的身體……\n\n還有被撕裂的小腿肚。']
    },
    {
      stage: 5,
      good: [
        '終於來到最後的考驗現場，只見一個男子站在房間的正中，他說：「你以為你現在正在參加鴨霸幫的入幫測驗嗎？不，這都是你的錯覺，其實你只不過是我的副人格而已。」\n\n' + pl + '聽到這樣的話語，只遲疑了一下，說：「阿歐西，你有空在這邊練肖威，還不快去把你的協作平台弄好，都拖多久了？」\n\n男子聽到之後，不由自主的雙腿一軟，但你還是繼續說道：「有空在這邊加鴨霸獸的功能，不會去把復興南村的下一個劇本寫出來嗎？」\n\n男子咳出一口鮮血，倒臥在地。你就這樣跨過了他的身體，通過了最後的試煉。',

        pl + '來到了最後考驗的現場，鴨霸幫的幫主——鴨巴獸坐在王座上，她的左手拿著包子、右手拿著鍋貼，眼神似乎要你選擇的樣子。\n\n你微微一笑，指著座上的鴨巴獸說：「真正的鴨巴獸根本不會拿著這種東西，你一定是軒哥假扮的！」\n軒哥冷笑了兩聲，扯下面具，「真虧你能看得出來，看來我該讓腎了。」他打開了最後的大門，你走出大門，通過了最後的試煉。'],
      bad: [
        '終於來到最後的考驗現場，只見一個男子站在房間的正中，他說：「你以為你現在正在參加鴨霸幫的入幫測驗嗎？不，這都是你的錯覺，其實你只不過是我的副人格而已。」\n\n' + pl + '聽到這樣的話語，陷入了長考——難、難道我，只是一個幻想出來的人格嗎？我所認知的世界，都是虛幻嗎？！' + pl + '的身軀逐漸崩解，被吸入男子的影子當中。他微笑著說，「整個湯群，都是我的副人格。」',

        pl + '來到了最後考驗的現場，鴨霸幫的幫主——鴨巴獸坐在王座上，她的左手拿著包子、右手拿著鍋貼，眼神似乎要你選擇的樣子。\n\n你戰戰兢兢的，指著她右手的鍋貼，此時巴獸用迅雷不及掩耳盜鈴的速度用鍋貼把你的眼睛挖出來，再把包子塞到你的鼻孔裡，最後撕裂了你的小腿肚。\n\n在你朦朧的意識即將消失前，你聽到幫主說：「幹你媽的我最討厭的就是包子和鍋貼。」']
    }


  ]


  //開始迴圈部分

  let stage = 1;
  let DeadOrNot = 0;
  let pinch = 50 + Dice(50);
  let reply = '本次入幫測驗挑戰者是【' + pl + '】，鴨霸幫萬歲！';

  for (; DeadOrNot == 0; stage++) {
    reply = reply + '\n\n================\n' + '【' + pl + '挑戰第' + stage + '關】\n';

    if (Dice(100) <= pinch) {
      reply = reply + challenge[stage - 1].good[Dice(challenge[stage - 1].good.length) - 1];
      pinch = pinch - Dice(8);
    }
    else {
      reply = reply + challenge[stage - 1].bad[Dice(challenge[stage - 1].bad.length) - 1];
      DeadOrNot = 1;
      reply = reply + '\n\n================\n勝敗乃兵家常事，大俠請重新來過吧。\n或者你可以直接月付1999加入白銀幫眾。';
    }

    if (stage == 5 && DeadOrNot == 0) {
      DeadOrNot = 2;
    }
  }

  if (DeadOrNot == 2) reply = reply + '\n\n================\n恭喜【' + pl + '】成功存活，成為新一代的鴨霸幫幫眾。\n請到隔壁的櫃檯繳納會費，然後期待下一次淨灘的時候你還可以存活下來。';

  return reply;
}


module.exports = {
  parseInput
};