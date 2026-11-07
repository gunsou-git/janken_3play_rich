// 0 = グー, 1 = チョキ, 2 = パー
var names = ["グー", "チョキ", "パー"];
var icons = ["✊", "✌️", "✋"];

// プレイヤー（0 = あなた, 1 = 相手1, 2 = 相手2）
var cards = [".b", ".c", ".d"];
var playerNames = ["あなた", "相手1", "相手2"];
var avatars = ["😎", "🤖", "👾"];

// ===== ルール =====
var WIN_POINT = 1;    // 勝ったら +1
var SOLO_BONUS = 2;   // ひとり勝ち（2人に勝つ）なら +2
var LOSE_POINT = -1;  // 負けたら -1
var goal = 3;         // 目標ポイント（先に取った人が優勝）

// ===== ゲームの状態 =====
var points = [0, 0, 0]; // 3人のポイント
var streak = 0;         // あなたの連勝数
var round = 0;          // 何回戦目か
var playing = false;    // 対戦中かどうか（連打防止）
var gameOver = false;   // ゲームが終わったかどうか

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

// ポイント表示とゲージを更新する
function updatePoints() {
    for (var i = 0; i < 3; i++) {
        $(cards[i] + " .pt").html(points[i] + " pt");

        // ゲージ：0pt〜目標ptを 0%〜100% にする（マイナスは0%）
        var percent = points[i] / goal * 100;
        if (percent < 0) {
            percent = 0;
        }
        if (percent > 100) {
            percent = 100;
        }
        $(cards[i] + " .gauge-bar").css("width", percent + "%");

        // マイナスなら赤字にする
        if (points[i] < 0) {
            $(cards[i] + " .pt").addClass("minus");
        } else {
            $(cards[i] + " .pt").removeClass("minus");
        }
    }
    $(".round").html("第 " + round + " 回戦　／　" + goal + "ポイント先取");

    if (streak >= 2) {
        $(".streak").html("🔥 " + streak + " 連勝中！");
    } else {
        $(".streak").html("");
    }
}

// ポイントの増減をカードの上にふわっと出す
function floatPoint(i, value) {
    var text = value > 0 ? "+" + value : "" + value;
    var cls = value > 0 ? "float plus" : "float minus";
    var $f = $('<div class="' + cls + '">' + text + "</div>");
    $(cards[i]).append($f);
    setTimeout(function() {
        $f.remove();
    }, 1200);
}

// 履歴に1行追加する（新しいものが上）
function addLog(text) {
    $(".log").prepend("<li>" + text + "</li>");
    // 履歴は最大8件まで
    if ($(".log li").length > 8) {
        $(".log li").last().remove();
    }
}

function janken(me) {
    if (playing || gameOver) {
        return;
    }
    playing = true;
    round = round + 1;
    $(".hands button").prop("disabled", true);

    // 相手2人の手をランダムに決める
    var cpu1 = Math.floor(Math.random() * 3);
    var cpu2 = Math.floor(Math.random() * 3);
    console.log("あなた：" + names[me], "相手1：" + names[cpu1], "相手2：" + names[cpu2]);

    // 前回の結果をリセットして、全員グーで手をふる
    $(".player").removeClass("win lose draw");
    $(".badge").html("");
    $(".hand-name").html("…");
    $(".hand").html("✊").removeClass("pop").addClass("shake");
    $(".round").html("第 " + round + " 回戦　／　" + goal + "ポイント先取");

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
        var handText = icons[me] + " " + icons[cpu1] + " " + icons[cpu2];

        if (isDraw) {
            $(".player").addClass("draw");
            $(".badge").html("DRAW ±0");
            $(".a").html("あいこ！");
            addLog("第" + round + "回 " + handText + "　あいこ");
        } else {
            // まず勝った人を数える（1人なら「ひとり勝ち」）
            var isWin = [false, false, false];
            var winCount = 0;
            for (var i = 0; i < 3; i++) {
                // 自分が負ける手を誰も出していなければ勝ち
                if (hands.indexOf(loseToOf(hands[i])) === -1) {
                    isWin[i] = true;
                    winCount = winCount + 1;
                }
            }

            // ポイントを計算する
            for (var j = 0; j < 3; j++) {
                var change;
                if (isWin[j]) {
                    change = winCount === 1 ? SOLO_BONUS : WIN_POINT;
                    $(cards[j]).addClass("win");
                    $(cards[j] + " .badge").html(winCount === 1 ? "ひとり勝ち +" + change : "WIN +" + change);
                } else {
                    change = LOSE_POINT;
                    $(cards[j]).addClass("lose");
                    $(cards[j] + " .badge").html("LOSE " + change);
                }
                points[j] = points[j] + change;
                floatPoint(j, change);
            }

            // あなたの結果
            if (isWin[0]) {
                streak = streak + 1;
                if (winCount === 1) {
                    $(".a").html("ひとり勝ち！");
                } else {
                    $(".a").html("あなたの勝ち！");
                }
            } else {
                streak = 0;
                $(".a").html("あなたの負け…");
            }

            // 履歴に残す
            var winners = [];
            for (var k = 0; k < 3; k++) {
                if (isWin[k]) {
                    winners.push(playerNames[k]);
                }
            }
            addLog("第" + round + "回 " + handText + "　" + winners.join("・") + " の勝ち");
        }

        updatePoints();

        // 目標ポイントに届いた人がいたらゲーム終了
        if (checkGameOver()) {
            return;
        }

        playing = false;
        $(".hands button").prop("disabled", false);
    }, 600);
}

// 誰かが目標ポイントに届いたかを調べる
function checkGameOver() {
    var top = Math.max(points[0], points[1], points[2]);
    if (top < goal) {
        return false;
    }

    gameOver = true;

    // 一番ポイントが高い人が優勝（同点なら全員優勝）
    var champions = [];
    for (var i = 0; i < 3; i++) {
        if (points[i] === top) {
            champions.push(i);
        }
    }

    setTimeout(function() {
        showResult(champions);
    }, 900);
    return true;
}

// 結果画面を表示する
function showResult(champions) {
    var youWin = champions.indexOf(0) !== -1;

    if (youWin && champions.length === 1) {
        $(".result-icon").html("🏆");
        $(".result-title").html("あなたの優勝！");
    } else if (youWin) {
        $(".result-icon").html("🤝");
        $(".result-title").html("同点優勝！");
    } else {
        $(".result-icon").html("😢");
        $(".result-title").html(playerNames[champions[0]] + "の優勝…");
    }
    $(".result-sub").html(round + " 回戦で決着");

    // ポイントの高い順に並べる
    var order = [0, 1, 2];
    order.sort(function(x, y) {
        return points[y] - points[x];
    });

    var medals = ["🥇", "🥈", "🥉"];
    var html = "";
    var rank = 0;
    for (var i = 0; i < 3; i++) {
        // 同点なら同じ順位にする
        if (i === 0 || points[order[i]] !== points[order[i - 1]]) {
            rank = i;
        }
        var p = order[i];
        html += "<li" + (p === 0 ? ' class="me"' : "") + ">" +
            medals[rank] + " " + avatars[p] + " " + playerNames[p] +
            "<span>" + points[p] + " pt</span></li>";
    }
    $(".ranking").html(html);
    $(".overlay").addClass("show");
}

// ゲームを最初からやり直す
function resetGame() {
    points = [0, 0, 0];
    streak = 0;
    round = 0;
    playing = false;
    gameOver = false;

    $(".player").removeClass("win lose draw");
    $(".badge").html("");
    $(".hand").html("✊").removeClass("pop shake");
    $(".hand-name").html("－");
    $(".a").html("手を選んでね");
    $(".log").html("");
    $(".overlay").removeClass("show");
    $(".hands button").prop("disabled", false);
    updatePoints();
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

// 目標ポイントを変える（変えたらやり直し）
$(".goal-select").on("change", function() {
    goal = Number($(this).val());
    resetGame();
});

$(".retry").on("click", function() {
    resetGame();
});

// 最初の表示
updatePoints();
