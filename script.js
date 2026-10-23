
const $ = id => document.getElementById(id);

let values = [12, 5, 23, 8, 16, 42, 19];
let target = 16;
let steps = [];
let stepIndex = 0;
let comparisons = 0;
let foundIndex = -1;
let currentIndex = -1;
let timer = null;
let running = false;
let paused = false;
let finished = false;
let runToken = 0;

const algorithmData = {
    linear: {
        title: "Linear Search",
        description: "Checks every element from left to right. Works with unsorted arrays.",
        best: "O(1)",
        average: "O(n)",
        worst: "O(n)",
        pseudocode: `FOR i = 0 TO n - 1\n    IF array[i] == target\n        RETURN i\nRETURN -1`
    },
    binary: {
        title: "Binary Search",
        description: "Checks the middle element and halves the search range. Requires sorted data.",
        best: "O(1)",
        average: "O(log n)",
        worst: "O(log n)",
        pseudocode: `low = 0, high = n - 1\nWHILE low <= high\n    mid = (low + high) // 2\n    IF array[mid] == target\n        RETURN mid\n    ELSE IF array[mid] < target\n        low = mid + 1\n    ELSE\n        high = mid - 1\nRETURN -1`
    }
};

function algorithm() {
    return $("algorithm").value;
}

function delay() {
    return Number($("speedInput").value);
}

function setNotice(text) {
    $("notice").textContent = text;
}

function setMessage(text) {
    $("message").textContent = text;
}

function setStatus(text) {
    $("status").textContent = text;
}

function updateSpeed() {
    const speed = delay();
    $("speedLabel").textContent =
        speed <= 300 ? "Fast" :
        speed <= 800 ? "Normal" : "Slow";
}

function updateAlgorithmInfo() {
    const info = algorithmData[algorithm()];

    $("algorithmTitle").textContent = info.title;
    $("algorithmDescription").textContent = info.description;
    $("bestCase").textContent = info.best;
    $("averageCase").textContent = info.average;
    $("worstCase").textContent = info.worst;
    $("pseudocode").textContent = info.pseudocode;
}

function drawArray() {
    const container = $("arrayContainer");
    container.replaceChildren();

    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;

    values.forEach((value, index) => {
        const box = document.createElement("div");
        box.className = "array-item";

        const height = range === 0
            ? 110
            : 65 + ((value - min) / range) * 100;

        box.style.setProperty("--bar-height", `${height}px`);
        box.style.animationDelay = `${index * 35}ms`;

        const number = document.createElement("span");
        number.className = "value";
        number.textContent = value;

        const label = document.createElement("span");
        label.className = "index";
        label.textContent = index;

        box.append(number, label);
        container.append(box);
    });
}

function addHistory(message, number) {
    const empty = $("history").querySelector(".empty-history");
    if (empty) empty.remove();

    const row = document.createElement("div");
    row.className = "history-entry";

    const label = document.createElement("b");
    label.textContent = `STEP ${number}`;

    const text = document.createElement("span");
    text.textContent = message;

    row.append(label, text);
    $("history").prepend(row);
}

function updateStats() {
    $("comparisons").textContent = comparisons;
    $("currentIndex").textContent =
        currentIndex < 0 ? "—" : currentIndex;
    $("foundIndex").textContent =
        foundIndex < 0 ? "—" : foundIndex;
    $("targetBig").textContent = target;
    $("arraySize").textContent = values.length;

    const sorted = values.every(
        (value, i) => i === 0 || values[i - 1] <= value
    );

    $("arrayOrder").textContent = sorted ? "Sorted" : "Unsorted";

    const percent = steps.length
        ? Math.round(stepIndex / steps.length * 100)
        : 0;

    $("progressBar").style.width = `${percent}%`;
    $("progressPercent").textContent = `${percent}%`;
    $("progressText").textContent =
        `${stepIndex} / ${steps.length} steps`;

    if (finished) {
        $("result").textContent =
            foundIndex >= 0 ? "Found!" : "Not found";
    } else if (comparisons > 0) {
        $("result").textContent = "Searching";
    } else {
        $("result").textContent = "Waiting";
    }
}

function setControls() {
    $("startBtn").disabled = running || finished;
    $("pauseBtn").disabled = finished || (!running && !paused);
    $("pauseBtn").textContent = paused ? "▶ Resume" : "Ⅱ Pause";
    $("stepBtn").disabled = running || finished;
}

function makeStep(index, message, type, checked, excluded) {
    steps.push({
        index,
        message,
        type,
        checked: [...checked],
        excluded: [...excluded]
    });
}

function buildSteps() {
    steps = [];
    foundIndex = -1;

    const checked = new Set();

    if (algorithm() === "linear") {
        for (let i = 0; i < values.length; i++) {
            checked.add(i);

            if (values[i] === target) {
                foundIndex = i;
                makeStep(
                    i,
                    `Compare ${values[i]} with ${target}: match found at index ${i}!`,
                    "found",
                    [...checked],
                    []
                );
                break;
            }

            makeStep(
                i,
                `${values[i]} is not ${target}. Move to the next element.`,
                "check",
                [...checked],
                []
            );
        }
    } else {
        let low = 0;
        let high = values.length - 1;

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            checked.add(mid);

            const excluded = values
                .map((_, i) => i)
                .filter(i => i < low || i > high);

            if (values[mid] === target) {
                foundIndex = mid;

                makeStep(
                    mid,
                    `Middle value ${values[mid]} matches ${target} at index ${mid}!`,
                    "found",
                    [...checked],
                    excluded
                );
                break;
            }

            makeStep(
                mid,
                `${values[mid]} is ${values[mid] < target ? "less" : "greater"} than ${target}. ${
                    values[mid] < target
                        ? "Search the right half."
                        : "Search the left half."
                }`,
                "check",
                [...checked],
                excluded
            );

            if (values[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
    }

    steps.push({
        index: -1,
        message: foundIndex >= 0
            ? `Search complete! ${target} was found at index ${foundIndex}.`
            : `Search complete. ${target} is not present in the array.`,
        type: "finish",
        checked: [],
        excluded: foundIndex >= 0
            ? []
            : values.map((_, i) => i)
    });
}

function resetState(message = "Press Start to begin your search.") {
    runToken++;
    clearTimeout(timer);
    timer = null;

    running = false;
    paused = false;
    finished = false;
    stepIndex = 0;
    comparisons = 0;
    foundIndex = -1;
    currentIndex = -1;

    $("history").replaceChildren();

    const empty = document.createElement("p");
    empty.className = "empty-history";
    empty.textContent = "Your comparisons will appear here.";
    $("history").append(empty);

    setMessage(message);
    setStatus("READY");
    setControls();
    drawArray();
    updateStats();
}

function prepareSearch(message = "Configuration ready.") {
    resetState(message);
    buildSteps();
    updateAlgorithmInfo();
    updateStats();
}

function advanceStep() {
    if (finished || stepIndex >= steps.length) return;

    const step = steps[stepIndex];
    stepIndex++;

    const boxes = [...$("arrayContainer").children];

    boxes.forEach((box, i) => {
        box.classList.remove(
            "current", "checked", "found", "eliminated"
        );

        if (step.excluded.includes(i)) {
            box.classList.add("eliminated");
        } else if (step.checked.includes(i)) {
            box.classList.add("checked");
        }
    });

    if (step.type === "finish") {
        finished = true;
        running = false;
        paused = false;
        clearTimeout(timer);
        timer = null;

        setMessage(step.message);
        setStatus("COMPLETED");
        setControls();
        addHistory(step.message, stepIndex);
        updateStats();
        return;
    }

    currentIndex = step.index;
    comparisons++;

    const activeBox = boxes[step.index];

    if (activeBox) {
        activeBox.classList.remove("checked");

        activeBox.classList.add(
            step.type === "found" ? "found" : "current"
        );
    }

    setMessage(step.message);
    setStatus(step.type === "found" ? "MATCH FOUND" : "SEARCHING");

    addHistory(step.message, stepIndex);
    updateStats();
    setControls();
}

function startSearch() {
    if (running || finished) return;

    running = true;
    paused = false;
    setControls();
    setStatus("SEARCHING");

    const token = ++runToken;

    function tick() {
        if (token !== runToken || !running || paused) return;

        advanceStep();

        if (!finished && running) {
            timer = setTimeout(tick, delay());
        }
    }

    tick();
}

function pauseSearch() {
    if (finished) return;

    if (running) {
        running = false;
        paused = true;
        runToken++;

        clearTimeout(timer);
        timer = null;

        setStatus("PAUSED");
        setControls();
    } else if (paused) {
        paused = false;
        startSearch();
    }
}

function applyConfiguration() {
    const raw = $("arrayInput").value
        .split(",")
        .map(value => value.trim());

    if (
        raw.length === 0 ||
        raw.length > 30 ||
        raw.some(value => value === "")
    ) {
        setNotice("Enter between 1 and 30 comma-separated numbers.");
        return;
    }

    const parsed = raw.map(Number);
    const targetText = $("targetInput").value.trim();
    const parsedTarget = Number(targetText);

    if (
        parsed.some(value => !Number.isFinite(value)) ||
        targetText === "" ||
        !Number.isFinite(parsedTarget)
    ) {
        setNotice("Please enter valid numbers and a valid target.");
        return;
    }

    values = [...parsed];
    target = parsedTarget;

    if (algorithm() === "binary") {
        values.sort((a, b) => a - b);
        $("arrayInput").value = values.join(", ");
        setNotice("Binary Search requires sorted data. Array sorted automatically.");
    } else {
        setNotice("Linear Search is ready. Original array order preserved.");
    }

    prepareSearch("Configuration applied. Press Start or Next Step.");
}

function randomArray() {
    const set = new Set();

    while (set.size < 9) {
        set.add(Math.floor(Math.random() * 90) + 10);
    }

    values = [...set];

    if (algorithm() === "binary") {
        values.sort((a, b) => a - b);
    }

    target = values[Math.floor(Math.random() * values.length)];

    $("arrayInput").value = values.join(", ");
    $("targetInput").value = target;

    prepareSearch("Random array created. Find the target!");
    setNotice("New random array generated successfully.");
}

function loadExample() {
    values = [7, 14, 22, 31, 46, 58, 73, 89];
    target = 46;

    if (algorithm() === "linear") {
        values = [31, 7, 58, 22, 46, 14, 89, 73];
    }

    $("arrayInput").value = values.join(", ");
    $("targetInput").value = target;

    prepareSearch("Example loaded. Start the visualization.");
    setNotice("Example array loaded.");
}

$("applyBtn").addEventListener("click", applyConfiguration);
$("randomBtn").addEventListener("click", randomArray);
$("exampleBtn").addEventListener("click", loadExample);

$("algorithm").addEventListener("change", applyConfiguration);
$("startBtn").addEventListener("click", startSearch);
$("pauseBtn").addEventListener("click", pauseSearch);
$("resetBtn").addEventListener("click", () => {
    prepareSearch("Search reset. Ready to start again.");
});

$("stepBtn").addEventListener("click", () => {
    if (!running && !finished) advanceStep();
});

$("speedInput").addEventListener("input", updateSpeed);

function updateSpeed() {
    const ms = delay();
    $("speedLabel").textContent =
        ms <= 300 ? "Fast" : ms <= 800 ? "Normal" : "Slow";
}

updateSpeed();
prepareSearch();
