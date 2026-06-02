/* ============================================================
   Musikknøter — homepage interactive teaser
   Renders Norwegian words where note-letters (A B C D E F G H)
   become noteheads on a tiny 5-line staff; the rest stay plain.
   Type the word to decode it.
   ============================================================ */
(function () {
  var NOTES = { a: 3, b: 4, c: 5, d: 6, e: 0, f: 1, g: 2, h: 4 }; // diatonic degree, E4=0
  var WORDS = [
    { w: "hage", hint: { no: "Her vokser blomster.", en: "Flowers grow here. (garden)" }, pts: 10 },
    { w: "fugl", hint: { no: "Den flyr og kvitrer.", en: "It flies and chirps. (bird)" }, pts: 20 },
    { w: "dame", hint: { no: "En voksen kvinne.", en: "A grown woman. (lady)" }, pts: 30 },
    { w: "bade", hint: { no: "Å leke i vannet.", en: "To play in the water. (to bathe)" }, pts: 40 }
  ];

  var T = {
    badge: { no: "Prøv det", en: "Try it" },
    prompt: { no: "Hvilket ord staver notene?", en: "What word do the notes spell?" },
    placeholder: { no: "Skriv ordet …", en: "Type the word …" },
    check: { no: "Sjekk", en: "Check" },
    again: { no: "Prøv igjen", en: "Try again" },
    nice: { no: "Riktig!", en: "Correct!" },
    score: { no: "Poeng", en: "Score" },
    done: { no: "Bra jobba! Slik lærer barn å lese noter — ett ord om gangen.",
            en: "Well done! This is how kids learn to read notes — one word at a time." },
    reset: { no: "Spill igjen", en: "Play again" }
  };

  function lang() { return (window.IL && IL.currentLang && IL.currentLang()) || "no"; }
  function t(o) { return o[lang()] || o.no; }

  function noteCell(ch, degree, revealed) {
    // mini 5-line staff segment with a notehead
    var W = 30, lineGap = 9, top = 16, yBottom = top + 4 * lineGap;
    var y = yBottom - degree * (lineGap / 2);
    var lines = "";
    for (var i = 0; i < 5; i++) {
      var ly = yBottom - i * lineGap;
      lines += '<line x1="1" y1="' + ly + '" x2="' + (W - 1) + '" y2="' + ly + '" />';
    }
    var cx = W / 2, headFill = revealed ? "var(--mk-ok)" : "var(--klang)";
    var stemUp = degree <= 4;
    var stem = stemUp
      ? '<line class="mk-stem" x1="' + (cx + 4.6) + '" y1="' + (y - 1) + '" x2="' + (cx + 4.6) + '" y2="' + (y - 22) + '" />'
      : '<line class="mk-stem" x1="' + (cx - 4.6) + '" y1="' + (y + 1) + '" x2="' + (cx - 4.6) + '" y2="' + (y + 22) + '" />';
    var label = revealed
      ? '<text class="mk-notelabel" x="' + cx + '" y="9" text-anchor="middle">' + ch.toUpperCase() + "</text>"
      : "";
    return '<svg class="mk-note" width="' + W + '" height="' + (yBottom + 10) + '" viewBox="0 0 ' + W + " " + (yBottom + 10) + '">' +
      '<g class="mk-lines">' + lines + "</g>" + stem +
      '<ellipse class="mk-head" cx="' + cx + '" cy="' + y + '" rx="5.1" ry="3.7" transform="rotate(-18 ' + cx + " " + y + ')" fill="' + headFill + '" />' +
      label + "</svg>";
  }

  function render(host) {
    var idx = 0, score = 0, solved = false;

    host.innerHTML =
      '<div class="mk-head">' +
        '<span class="mk-badge"></span>' +
        '<span class="mk-score"><span class="mk-score-lbl"></span> <b class="mk-score-val">0</b></span>' +
      "</div>" +
      '<div class="mk-prompt"></div>' +
      '<div class="mk-word" aria-live="polite"></div>' +
      '<div class="mk-hint"></div>' +
      '<form class="mk-form" autocomplete="off">' +
        '<input class="mk-field" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" />' +
        '<button class="mk-go" type="submit"></button>' +
      "</form>" +
      '<div class="mk-msg" aria-live="polite"></div>';

    var elBadge = host.querySelector(".mk-badge");
    var elScoreLbl = host.querySelector(".mk-score-lbl");
    var elScoreVal = host.querySelector(".mk-score-val");
    var elPrompt = host.querySelector(".mk-prompt");
    var elWord = host.querySelector(".mk-word");
    var elHint = host.querySelector(".mk-hint");
    var elForm = host.querySelector(".mk-form");
    var elField = host.querySelector(".mk-field");
    var elGo = host.querySelector(".mk-go");
    var elMsg = host.querySelector(".mk-msg");

    function drawWord(reveal) {
      var w = WORDS[idx].w, html = "";
      for (var i = 0; i < w.length; i++) {
        var ch = w[i], deg = NOTES[ch.toLowerCase()];
        if (deg != null) html += noteCell(ch, deg, reveal);
        else html += '<span class="mk-plain">' + ch + "</span>";
      }
      elWord.innerHTML = html;
    }

    function refreshStatic() {
      elBadge.textContent = t(T.badge);
      elScoreLbl.textContent = t(T.score);
      elPrompt.textContent = t(T.prompt);
      elGo.textContent = t(T.check);
      elField.setAttribute("placeholder", t(T.placeholder));
      elHint.textContent = t(WORDS[idx].hint);
    }

    function floatPoints(pts) {
      var p = document.createElement("span");
      p.className = "mk-float";
      p.textContent = "+" + pts;
      host.querySelector(".mk-head").appendChild(p);
      setTimeout(function () { p.remove(); }, 1100);
    }

    function load() {
      solved = false;
      elField.value = "";
      elField.disabled = false;
      elGo.disabled = false;
      elMsg.textContent = "";
      elMsg.className = "mk-msg";
      refreshStatic();
      drawWord(false);
    }

    function finishWord() {
      solved = true;
      drawWord(true);
      score += WORDS[idx].pts;
      elScoreVal.textContent = score;
      floatPoints(WORDS[idx].pts);
      elField.disabled = true;
      elGo.disabled = true;
      elMsg.textContent = t(T.nice);
      elMsg.className = "mk-msg ok";
      setTimeout(function () {
        if (idx < WORDS.length - 1) { idx++; load(); elField.focus(); }
        else { allDone(); }
      }, 1150);
    }

    function allDone() {
      host.querySelector(".mk-prompt").textContent = "";
      elWord.innerHTML = "";
      elHint.textContent = "";
      elForm.style.display = "none";
      elMsg.className = "mk-msg done";
      elMsg.innerHTML = "<span>" + t(T.done) + "</span>";
      var btn = document.createElement("button");
      btn.className = "mk-replay";
      btn.type = "button";
      btn.textContent = t(T.reset);
      btn.addEventListener("click", function () {
        idx = 0; score = 0; elScoreVal.textContent = "0";
        elForm.style.display = ""; load(); elField.focus();
      });
      elMsg.appendChild(btn);
    }

    elForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (solved) return;
      var guess = (elField.value || "").trim().toLowerCase();
      if (!guess) return;
      if (guess === WORDS[idx].w) {
        finishWord();
      } else {
        elMsg.textContent = t(T.again);
        elMsg.className = "mk-msg err";
        elField.classList.remove("shake");
        void elField.offsetWidth;
        elField.classList.add("shake");
      }
    });

    window.addEventListener("il:lang", function () {
      if (elForm.style.display === "none") {
        // on the done screen — retranslate it
        elMsg.querySelector("span") && (elMsg.querySelector("span").textContent = t(T.done));
        var rb = elMsg.querySelector(".mk-replay"); if (rb) rb.textContent = t(T.reset);
        elScoreLbl.textContent = t(T.score);
        elBadge.textContent = t(T.badge);
      } else {
        refreshStatic();
        if (solved) drawWord(true);
      }
    });

    load();
  }

  function init() {
    var host = document.getElementById("musikk-demo");
    if (host) render(host);
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
