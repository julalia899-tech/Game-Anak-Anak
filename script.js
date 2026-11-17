
// ======================================
// PETUALANGAN SI PINTAR
// JAVASCRIPT GAME EDUKASI ANAK TK
// ======================================

const $ = id => document.getElementById(id);

let currentGame = "";
let questionIndex = 0;
let score = 0;
let soundOn = true;
let answered = false;
let spinnerRotation = 0;

let pairState = {
    cards: [],
    first: null,
    lock: false,
    matches: 0
};

const gameNames = {
    count: "Kebun Berhitung",
    letters: "Dunia Huruf",
    animals: "Tebak Siapa Aku?",
    shapes: "Warna dan Bentuk",
    pairs: "Pasangan Pintar",
    spinner: "Roda Kejutan"
};

const fruits = [
    "🍎", "🍌", "🍊", "🍓", "🍇",
    "🍉", "🥕", "🐟", "🦋", "🌼"
];

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const animals = [
    {name:"Kucing", emoji:"🐱"},
    {name:"Anjing", emoji:"🐶"},
    {name:"Sapi", emoji:"🐮"},
    {name:"Bebek", emoji:"🦆"},
    {name:"Gajah", emoji:"🐘"},
    {name:"Ayam", emoji:"🐔"},
    {name:"Kelinci", emoji:"🐰"},
    {name:"Singa", emoji:"🦁"},
    {name:"Ikan", emoji:"🐟"},
    {name:"Kupu-kupu", emoji:"🦋"}
];

const colors = [
    {name:"Merah", color:"#ef5350", emoji:"🔴"},
    {name:"Biru", color:"#3995e8", emoji:"🔵"},
    {name:"Kuning", color:"#f5c542", emoji:"🟡"},
    {name:"Hijau", color:"#48b66b", emoji:"🟢"},
    {name:"Ungu", color:"#9564d8", emoji:"🟣"},
    {name:"Oranye", color:"#f28b35", emoji:"🟠"}
];

const shapes = [
    {name:"Lingkaran", emoji:"⚪"},
    {name:"Persegi", emoji:"🟥"},
    {name:"Segitiga", emoji:"🔺"},
    {name:"Bintang", emoji:"⭐"}
];

const challenges = [
    "Sebutkan satu nama hewan!",
    "Hitung angka 1 sampai 5!",
    "Sebutkan huruf A!",
    "Sebutkan warna kesukaanmu!",
    "Tirukan suara ayam!",
    "Tepuk tangan tiga kali!",
    "Sebutkan nama buah!",
    "Sebutkan bentuk lingkaran!",
    "Lompat kecil dua kali!",
    "Sebutkan angka 10!"
];

// ======================================
// FITUR SUARA BAHASA INDONESIA
// ======================================

function speak(text) {

    if (!soundOn) return;

    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const suara = new SpeechSynthesisUtterance(text);

    suara.lang = "id-ID";
    suara.rate = 0.85;
    suara.pitch = 1.1;
    suara.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    const indonesia = voices.find(v =>
        v.lang.toLowerCase().startsWith("id")
    );

    if (indonesia) {
        suara.voice = indonesia;
    }

    window.speechSynthesis.speak(suara);
}

function toggleSound() {

    soundOn = !soundOn;

    $("soundButton").textContent =
        soundOn ? "🔊 Suara Aktif" : "🔇 Suara Mati";

    if (!soundOn && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
}

// ======================================
// NAVIGASI HALAMAN
// ======================================

function showHome() {

    $("homeScreen").classList.remove("hidden");
    $("gameScreen").classList.add("hidden");
    $("resultScreen").classList.add("hidden");

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
}

function scrollToGames() {

    $("gameMenu").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function startGame(type) {

    currentGame = type;
    questionIndex = 0;
    score = 0;
    answered = false;

    $("homeScreen").classList.add("hidden");
    $("resultScreen").classList.add("hidden");
    $("gameScreen").classList.remove("hidden");

    $("gameTitle").textContent = gameNames[type];

    $("nextButton").textContent = "Lanjut ➜";

    if (type === "pairs") {

        setupPairs();
        renderPairs();
        updateProgress();

        return;
    }

    renderQuestion();
}

// ======================================
// PROGRESS DAN SKOR
// ======================================

function updateProgress() {

    let current;
    let total;

    if (currentGame === "pairs") {

        current = pairState.matches;
        total = 5;

    } else {

        current = questionIndex + 1;
        total = 10;
    }

    $("progressText").textContent =
        currentGame === "pairs"
        ? `Pasangan ${current} dari ${total}`
        : `Soal ${current} dari ${total}`;

    $("questionNumber").textContent =
        `${current}/${total}`;

    $("progressFill").style.width =
        `${(current / total) * 100}%`;

    $("scoreText").textContent = score;
}

// ======================================
// MEMBUAT PILIHAN JAWABAN ACAK
// ======================================

function makeOptions(correct, pool, amount = 4) {

    const others = pool
        .filter(item => item !== correct)
        .sort(() => Math.random() - 0.5)
        .slice(0, amount - 1);

    return [correct, ...others]
        .sort(() => Math.random() - 0.5);
}

// ======================================
// MENAMPILKAN SOAL
// ======================================

function renderQuestion() {

    answered = false;

    $("feedback").textContent = "";
    $("feedback").className = "feedback";

    $("nextButton").classList.add("hidden");
    $("nextButton").textContent = "Lanjut ➜";

    updateProgress();

    const content = $("gameContent");

    content.innerHTML = "";

    switch (currentGame) {

        case "count":
            renderCount(content);
            break;

        case "letters":
            renderLetters(content);
            break;

        case "animals":
            renderAnimals(content);
            break;

        case "shapes":
            renderShapes(content);
            break;

        case "spinner":
            renderSpinner(content);
            break;
    }
}

// ======================================
// TAMPILKAN PILIHAN JAWABAN
// ======================================

function renderChoices(options, correct, formatter) {

    const grid = document.createElement("div");

    grid.className = "answer-grid";

    options.forEach(option => {

        const button = document.createElement("button");

        button.className = "answer-btn";

        button.innerHTML = formatter(option);

        button.onclick = () => {

            checkAnswer(
                option === correct,
                button,
                grid
            );

        };

        grid.appendChild(button);

    });

    $("gameContent").appendChild(grid);
}

// ======================================
// CEK JAWABAN
// ======================================

function checkAnswer(isCorrect, button, grid) {

    if (answered) return;

    answered = true;

    grid.querySelectorAll("button").forEach(btn => {
        btn.disabled = true;
    });

    if (isCorrect) {

        score += 10;

        button.classList.add("correct");

        $("feedback").textContent =
            "🎉 Hebat! Jawabanmu benar! ⭐";

        $("feedback").className = "feedback";

        speak("Hebat! Jawabanmu benar!");

    } else {

        button.classList.add("wrong");

        $("feedback").textContent =
            "😊 Tidak apa-apa, ayo belajar lagi!";

        $("feedback").className = "feedback bad";

        speak("Tidak apa-apa. Ayo semangat belajar!");

    }

    $("scoreText").textContent = score;

    $("nextButton").classList.remove("hidden");
}

// ======================================
// GAME 1: KEBUN BERHITUNG
// ======================================

function renderCount(content) {

    const amount = 2 + Math.floor(Math.random() * 9);

    const fruit = fruits[
        Math.floor(Math.random() * fruits.length)
    ];

    $("questionText").textContent =
        `Ada berapa ${fruit} di bawah ini?`;

    const visual = document.createElement("div");

    visual.className = "visual-items";

    visual.textContent =
        Array(amount).fill(fruit).join(" ");

    content.appendChild(visual);

    const pool = Array.from(
        {length: 10},
        (_, i) => i + 1
    );

    const options = makeOptions(amount, pool);

    renderChoices(
        options,
        amount,
        number => String(number)
    );

    speak(`Ayo hitung bersama. Ada berapa ${fruit}?`);
}

// ======================================
// GAME 2: DUNIA HURUF
// ======================================

function renderLetters(content) {

    const target = letters[
        Math.floor(Math.random() * letters.length)
    ];

    $("questionText").textContent =
        `Manakah huruf ${target}?`;

    const visual = document.createElement("div");

    visual.className = "visual-items";

    visual.textContent = "🔤";

    content.appendChild(visual);

    const options = makeOptions(
        target,
        letters
    );

    renderChoices(
        options,
        target,
        letter => `<span style="font-size:45px">${letter}</span>`
    );

    speak(`Ayo cari huruf ${target}.`);
}

// ======================================
// GAME 3: TEBAK HEWAN
// ======================================

function renderAnimals(content) {

    const target = animals[
        Math.floor(Math.random() * animals.length)
    ];

    $("questionText").textContent =
        `Manakah gambar ${target.name}?`;

    const visual = document.createElement("div");

    visual.className = "visual-items";

    visual.textContent = "🐾";

    content.appendChild(visual);

    const options = makeOptions(
        target,
        animals
    );

    renderChoices(
        options,
        target,
        animal => `
            <span class="option-emoji">
                ${animal.emoji}
            </span>
            <span style="font-size:19px">
                ${animal.name}
            </span>
        `
    );

    speak(`Cari gambar ${target.name}.`);
}

// ======================================
// GAME 4: WARNA DAN BENTUK
// ======================================

function renderShapes(content) {

    const useColor = Math.random() > 0.5;

    if (useColor) {

        const target = colors[
            Math.floor(Math.random() * colors.length)
        ];

        $("questionText").textContent =
            `Manakah warna ${target.name}?`;

        const visual = document.createElement("div");

        visual.className = "color-swatch";

        visual.style.background = target.color;

        content.appendChild(visual);

        const options = makeOptions(
            target,
            colors
        );

        renderChoices(
            options,
            target,
            color => `
                <span
                    class="color-swatch"
                    style="
                        display:inline-block;
                        width:48px;
                        height:48px;
                        background:${color.color};
                    ">
                </span>
                <span style="display:block;font-size:18px">
                    ${color.name}
                </span>
            `
        );

        speak(`Ayo cari warna ${target.name}.`);

    } else {

        const target = shapes[
            Math.floor(Math.random() * shapes.length)
        ];

        $("questionText").textContent =
            `Manakah bentuk ${target.name}?`;

        const visual = document.createElement("div");

        visual.className = "visual-items";

        visual.textContent = "🔷";

        content.appendChild(visual);

        const options = makeOptions(
            target,
            shapes
        );

        renderChoices(
            options,
            target,
            shape => `
                <span class="option-emoji">
                    ${shape.emoji}
                </span>
                <span style="font-size:18px">
                    ${shape.name}
                </span>
            `
        );

        speak(`Ayo cari bentuk ${target.name}.`);
    }
}

// ======================================
// GAME 5: PASANGAN PINTAR
// ======================================

function setupPairs() {

    const selected = [...animals]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

    const cards = [
        ...selected,
        ...selected
    ].map((animal, index) => ({

        id: index,
        pair: animal.name,
        emoji: animal.emoji,
        open: false,
        matched: false

    }));

    cards.sort(() => Math.random() - 0.5);

    pairState = {
        cards: cards,
        first: null,
        lock: false,
        matches: 0
    };

    $("questionText").textContent =
        "Temukan dua gambar hewan yang sama!";

}

function renderPairs() {

    $("feedback").textContent = "";

    $("nextButton").classList.add("hidden");

    updateProgress();

    const content = $("gameContent");

    content.innerHTML = "";

    const board = document.createElement("div");

    board.className = "pair-board";

    pairState.cards.forEach(card => {

        const button = document.createElement("button");

        button.className = "pair-card";

        if (card.open) {
            button.classList.add("flipped");
        }

        if (card.matched) {
            button.classList.add("matched");
        }

        button.textContent =
            card.open || card.matched
            ? card.emoji
            : "❔";

        button.disabled =
            card.matched || pairState.lock;

        button.onclick = () => flipPair(card.id);

        board.appendChild(button);

    });

    content.appendChild(board);
}

function flipPair(id) {

    if (pairState.lock) return;

    const card = pairState.cards.find(
        item => item.id === id
    );

    if (!card || card.open || card.matched) return;

    card.open = true;

    renderPairs();

    if (pairState.first === null) {

        pairState.first = id;

        return;
    }

    const first = pairState.cards.find(
        item => item.id === pairState.first
    );

    if (first.pair === card.pair) {

        first.matched = true;
        card.matched = true;

        pairState.first = null;

        pairState.matches++;

        score += 20;

        $("scoreText").textContent = score;

        $("feedback").textContent =
            "🎉 Pasangan cocok! Hebat!";

        $("feedback").className = "feedback";

        speak("Pasangan cocok! Hebat!");

        renderPairs();

        if (pairState.matches === 5) {

            $("nextButton").textContent = "Lihat Hasil 🏆";

            $("nextButton").classList.remove("hidden");
        }

    } else {

        pairState.lock = true;

        $("feedback").textContent =
            "Belum cocok, ayo coba lagi!";

        $("feedback").className = "feedback bad";

        setTimeout(() => {

            first.open = false;
            card.open = false;

            pairState.first = null;
            pairState.lock = false;

            renderPairs();

        }, 1000);
    }
}

// ======================================
// GAME 6: RODA KEJUTAN
// ======================================

function renderSpinner(content) {

    $("questionText").textContent =
        "Putar roda dan dapatkan tantangan!";

    const wrap = document.createElement("div");

    wrap.className = "spinner-wrap";

    wrap.innerHTML = `
        <div style="font-size:30px">🔻</div>

        <div class="spinner-wheel" id="wheel">
            🎡
        </div>

        <button class="main-button" id="spinButton">
            Putar Roda!
        </button>

        <div id="spinChallenge"
             style="
                font:800 23px 'Baloo 2';
                text-align:center;
                min-height:40px;
             ">
        </div>
    `;

    content.appendChild(wrap);

    $("spinButton").onclick = () => {

        if (answered) return;

        $("spinButton").disabled = true;

        spinnerRotation +=
            1440 + Math.floor(Math.random() * 360);

        $("wheel").style.transform =
            `rotate(${spinnerRotation}deg)`;

        const challenge = challenges[
            Math.floor(Math.random() * challenges.length)
        ];

        setTimeout(() => {

            $("spinChallenge").textContent = challenge;

            $("feedback").textContent =
                "🌟 Ayo lakukan tantangannya!";

            score += 10;

            $("scoreText").textContent = score;

            answered = true;

            $("nextButton").classList.remove("hidden");

            speak(challenge);

        }, 2500);
    };

    speak("Sentuh tombol putar roda untuk mendapatkan tantangan.");
}

// ======================================
// LANJUT KE SOAL BERIKUTNYA
// ======================================

function nextQuestion() {

    if (
        currentGame === "pairs" &&
        pairState.matches === 5
    ) {
        showResult();
        return;
    }

    questionIndex++;

    if (questionIndex >= 10) {

        showResult();

        return;
    }

    renderQuestion();
}

// ======================================
// HALAMAN HASIL DAN PENGHARGAAN
// ======================================

function showResult() {

    $("gameScreen").classList.add("hidden");

    $("resultScreen").classList.remove("hidden");

    $("finalScore").textContent = score;

    const maxScore = currentGame === "pairs" ? 100 : 100;

    const percentage = score / maxScore;

    if (percentage >= 0.8) {

        $("starsResult").textContent = "⭐⭐⭐";

        $("resultMessage").textContent =
            "Luar biasa! Kamu bintang pintar hari ini!";

    } else if (percentage >= 0.5) {

        $("starsResult").textContent = "⭐⭐";

        $("resultMessage").textContent =
            "Bagus sekali! Terus berlatih, ya!";

    } else {

        $("starsResult").textContent = "⭐";

        $("resultMessage").textContent =
            "Terima kasih sudah bermain. Yuk, coba lagi!";

    }

    speak(
        "Hebat! Kamu sudah menyelesaikan permainan. Terus semangat belajar!"
    );
}

// ======================================
// MAIN LAGI
// ======================================

function replayGame() {

    startGame(currentGame);

}

// ======================================
// MEMUAT SUARA BROWSER
// ======================================

if ("speechSynthesis" in window) {

    speechSynthesis.onvoiceschanged = function() {
        speechSynthesis.getVoices();
    };

}
