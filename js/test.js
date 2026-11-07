// 0 = グー, 1 = チョキ, 2 = パー
var names = ["グー", "チョキ", "パー"];
var icons = ["✊", "✌️", "✋"];

// 勝ち・負け・あいこの回数
var win = 0;
var lose = 0;
var draw = 0;

// 対戦中かどうか（連打防止）
var playing = false;

// その手が負ける手を返す
function loseToOf(hand) {
    if (hand === 0) {
        return 2; // グーはパーに負ける
    } else if (hand === 1) {
        return 0; // チョキはグーに負ける
    } else {
        return 1; // パーはチョキに負ける
    }
}

function janken(me) {
    if (playing) {
        return;
    }
    playing = true;
    $("button").prop("disabled", true);

    // 相手2人の手をランダムに決める
    var cpu1 = Math.floor(Math.random() * 3);
    var cpu2 = Math.floor(Math.random() * 3);
    console.log("あなた：" + names[me], "相手1：" + names[cpu1], "相手2：" + names[cpu2]);

    // 前回の結果をリセットして、全員グーで手をふる
    $(".player").removeClass("win lose draw");
    $(".badge").html("");
    $(".hand-name").html("…");
    $(".hand").html("✊").removeClass("pop").addClass("shake");

    // じゃん → けん → ぽん！
    $(".a").html("じゃん");
    setTimeout(function() {
        $(".a").html("けん");
    }, 500);
    setTimeout(function() {
        $(".a").html("ぽん！");
        show(me, cpu1, cpu2);
    }, 1000);
}

// 手を見せて、勝ち負けを判定する
function show(me, cpu1, cpu2) {
    var hands = [me, cpu1, cpu2];
    var cards = [".b", ".c", ".d"];

    // 3人の手を表示
    for (var i = 0; i < 3; i++) {
        $(cards[i] + " .hand").html(icons[hands[i]]).removeClass("shake").addClass("pop");
        $(cards[i] + " .hand-name").html(names[hands[i]]);
    }

    // ① 3人とも同じ手　② 3人ともバラバラ → あいこ
    var isDraw = false;
    if (me === cpu1 && cpu1 === cpu2) {
        isDraw = true;
    } else if (me !== cpu1 && cpu1 !== cpu2 && me !== cpu2) {
        isDraw = true;
    }

    // 少しだけ間をあけて結果を出す
    setTimeout(function() {
        if (isDraw) {
            $(".player").addClass("draw");
            $(".badge").html("DRAW");
            $(".a").html("あいこ！");
            draw = draw + 1;
        } else {
            // 自分が負ける手を誰も出していなければ勝ち
            for (var i = 0; i < 3; i++) {
                if (hands.indexOf(loseToOf(hands[i])) === -1) {
                    $(cards[i]).addClass("win");
                    $(cards[i] + " .badge").html("WIN");
                } else {
                    $(cards[i]).addClass("lose");
                    $(cards[i] + " .badge").html("LOSE");
                }
            }

            if ($(".b").hasClass("win")) {
                $(".a").html("あなたの勝ち！");
                win = win + 1;
            } else {
                $(".a").html("あなたの負け…");
                lose = lose + 1;
            }
        }

        $(".score").html("勝ち " + win + " ／ 負け " + lose + " ／ あいこ " + draw);
        playing = false;
        $("button").prop("disabled", false);
    }, 600);
}

$(".aa").on("click", function() {
    janken(0); // グー
});

$(".bb").on("click", function() {
    janken(1); // チョキ
});

$(".cc").on("click", function() {
    janken(2); // パー
});
