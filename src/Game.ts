import Phaser from "phaser";

import { ResultScreen } from "./ResultScreen";

const COLS = 6;
const ROWS = 5;
const SYMBOL_TYPES = 9;
const CELL_SIZE = 80;
const CELL_SIZE_W = 105;
const GRID_OFFSET_X = 0;
const GRID_OFFSET_Y = 100;
const ITEM_NAMES = [
    "blue_gems.png",
    "crown.png",
    "cup.png",
    "green_gem.png",
    "purple_gem.png",
    "red_gems.png",
    "ring.png",
    "time.png",
    "yellow_gems.png",
];

const maskWidth = COLS * CELL_SIZE_W;
const maskHeight = ROWS * CELL_SIZE;
const maskX = GRID_OFFSET_X;
const maskY = GRID_OFFSET_Y;

const MATHCES = [[9], [8], [7], [8, 9], [9, 9]];
const PUSH_NAMES = [
    "push250.png",
    "",
    "push-200.png",
    "push570.png",
    "push5000.png",
];
const BONUS_NAMES = [
    "win_256.png",
    "bonus_free_spin.png",
    "",
    "win_570.png",
    "win_5000.png",
];

const BET_COUNT = [0, 250, 250, 820, 620, 5620];

export default class MainGame extends Phaser.Scene {
    grid = []; // grid[row][col] = sprite
    symbols = [];
    isProcessing = false;
    isMoving = false;
    gameContainer = null;
    gameBackContainer = null;
    cellsFrame = null;
    backContainer = null;
    uiContainer = null;
    maskGraphics = null;
    cashoutBtn = null;
    spinBtn = null;
    betBtn = null;
    betCount = null;
    betContainer = null;
    downloadBtn = null;
    endTitle = null;
    imageZeus = null;
    tweenZeus = null;
    fire1 = null;
    fire2 = null;
    pill1 = null;
    pill2 = null;
    pushSprite = null;
    bonusSprite = null;
    endEffect = null;
    endSprite = null;

    gameStep = 0;
    bg = null;
    bgScale = 1;
    bgItemScale = 1;
    fieldScale = 1;
    pushScale = 1;
    shiftX = 0;
    shiftY = 0;

    preload() {
        this.load.atlas("items", "assets/zeus1.png", "assets/zeus1.json");
        this.load.image("table", "assets/table.png");
        this.load.image("tframe", "assets/table_ram.png");
        this.load.image("bg", "assets/background.jpg");
        this.load.image("zeus", "assets/zimage.png");
        this.load.image("pillar", "assets/stolb.png");
        this.load.image("endbtn", "assets/endbtn.png");
        this.load.image("endeffect", "assets/endeffect.png");
    }

    create() {
        this.maskGraphics = this.add.graphics();
        this.maskGraphics.fillStyle(0xffffff, 1);
        this.maskGraphics.fillRect(maskX, maskY, maskWidth, maskHeight);
        const mask = new Phaser.Display.Masks.GeometryMask(
            this,
            this.maskGraphics
        );

        this.maskGraphics.setVisible(false); // саму маску не рисуем

        this.bgScale =
            this.scale.width > this.scale.height
                ? this.scale.width / 1920
                : this.scale.height / 1920;
        //this.bgItemScale = this.scale.width<this.scale.height?this.scale.width/1920:this.scale.height/1920;
        this.bgItemScale = this.scale.height / 1400;
        this.fieldScale =
            this.scale.width < this.scale.height
                ? this.scale.width /
                  (GRID_OFFSET_X * 2 + CELL_SIZE_W * COLS + 100)
                : this.scale.height /
                  (GRID_OFFSET_Y * 2 + CELL_SIZE * ROWS + 100);
        this.bg = this.add
            .sprite(this.scale.width / 2, this.scale.height / 2, "bg")
            .setOrigin(0.5, 0.5)
            .setScale(this.bgScale);

        this.backContainer = this.add.container();

        this.anims.create({
            key: "fire",
            frames: [
                { key: "items", frame: "fire/001.png" },
                { key: "items", frame: "fire/002.png" },
                { key: "items", frame: "fire/003.png" },
                { key: "items", frame: "fire/004.png" },
                { key: "items", frame: "fire/005.png" },
                { key: "items", frame: "fire/006.png" },
                { key: "items", frame: "fire/007.png" },
                { key: "items", frame: "fire/008.png" },
                { key: "items", frame: "fire/009.png" },
                { key: "items", frame: "fire/010.png" },
                { key: "items", frame: "fire/011.png" },
                { key: "items", frame: "fire/012.png" },
            ],
            frameRate: 6,
            repeat: -1,
        });

        console.log("SCR", this.scale.width, this.scale.height);
        if (this.scale.width > this.scale.height) {
            this.fire1 = this.add
                .sprite(
                    20 + 120 * this.bgItemScale,
                    this.scale.height / 2 - 400 * this.bgItemScale,
                    "items",
                    "fire/001.png"
                )
                .setOrigin(0.5, 1);
            this.fire1.play("fire");
            this.backContainer.add(this.fire1);

            this.fire2 = this.add
                .sprite(
                    this.scale.width - 20 - 140 * this.bgItemScale,
                    this.scale.height / 2 - 400 * this.bgItemScale,
                    "items",
                    "fire/001.png"
                )
                .setOrigin(0.5, 1);
            this.fire2.play("fire");
            this.backContainer.add(this.fire2);

            this.pill1 = this.add
                .sprite(
                    20 + 140 * this.bgItemScale,
                    this.scale.height / 2 + 20,
                    "pillar"
                )
                .setOrigin(0.5, 0.5)
                .setScale(this.bgItemScale);
            this.backContainer.add(this.pill1);
            this.pill2 = this.add
                .sprite(
                    this.scale.width - 20 - 140 * this.bgItemScale,
                    this.scale.height / 2 + 20,
                    "pillar"
                )
                .setOrigin(0.5, 0.5)
                .setScale(this.bgItemScale);
            this.backContainer.add(this.pill2);
        }

        this.imageZeus = this.add
            .sprite(this.scale.width - 40, this.scale.height / 2, "zeus")
            .setOrigin(1, 0.5)
            .setScale(this.bgItemScale * 0.8);
        this.backContainer.add(this.imageZeus);

        this.gameBackContainer = this.add.container();
        const cellsBack = this.add
            .sprite(GRID_OFFSET_X, GRID_OFFSET_Y - 5, "table")
            .setScale(0.33, 0.33)
            .setOrigin(0, 0);
        this.gameBackContainer.add(cellsBack);

        // === КОНТЕЙНЕР ДЛЯ СИМВОЛОВ ===
        this.gameContainer = this.add.container();
        this.gameContainer.setMask(mask);

        this.uiContainer = this.add.container();

        this.cellsFrame = this.add
            .sprite(GRID_OFFSET_X - 20, GRID_OFFSET_Y - 30, "tframe")
            .setScale(0.325, 0.325)
            .setOrigin(0);
        this.uiContainer.add(this.cellsFrame);

        this.gameBackContainer.setScale(this.fieldScale);
        this.gameContainer.setScale(this.fieldScale);
        this.uiContainer.setScale(this.fieldScale);
        this.maskGraphics.setScale(this.fieldScale);

        this.spinBtn = this.add
            .sprite(
                GRID_OFFSET_X + COLS * CELL_SIZE_W - CELL_SIZE_W / 2,
                GRID_OFFSET_Y + ROWS * CELL_SIZE + CELL_SIZE / 2,
                "items",
                "button1.png"
            )
            .setScale(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                if (!this.isMoving) {
                    console.log("click", this.gameStep);
                    this.gameStep += 1;
                    if (this.gameStep < MATHCES.length)
                        this.startNewGame(MATHCES[this.gameStep]);
                }
            });

        this.cashoutBtn = this.add
            .sprite(
                GRID_OFFSET_X + ((COLS + 1) * CELL_SIZE_W) / 2,
                GRID_OFFSET_Y + ROWS * CELL_SIZE + 66,
                "items",
                "cash out.png"
            )
            .setScale(0.45)
            .setInteractive()
            .on("pointerdown", () => {
                if (!this.isMoving) {
                    this.startEndScreen();
                }
            });

        this.betBtn = this.add
            .sprite(
                GRID_OFFSET_X,
                GRID_OFFSET_Y + ROWS * CELL_SIZE + 20,
                "items",
                "bet.png"
            )
            .setOrigin(0, 0)
            .setScale(0.4);

        this.betContainer = this.add.container();
        //this.betCount = this.createRouletteCounter(0,0, 0.22, 0, 0, 0);
        this.betCount = this.createRouletteCounter(0, 0, 0.22, 0, 0, 0);

        this.betContainer.x = GRID_OFFSET_X + 118;
        this.betContainer.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 55;

        this.uiContainer.add(this.spinBtn);
        this.uiContainer.add(this.betBtn);
        this.uiContainer.add(this.betContainer);
        this.uiContainer.add(this.cashoutBtn);
        this.betContainer.add(this.betCount);

        this.pushSprite = this.add
            .sprite(this.scale.width / 2, -200, "items", PUSH_NAMES[0])
            .setOrigin(0.5, 0)
            .setScale(1);

        this.bonusSprite = this.add
            .sprite(
                (COLS * CELL_SIZE_W) / 2,
                GRID_OFFSET_Y + (ROWS * CELL_SIZE) / 2,
                "items",
                BONUS_NAMES[0]
            )
            .setOrigin(0.5, 0.5)
            .setScale(0);

        this.uiContainer.add(this.bonusSprite);

        this.anims.create({
            key: "frame_gem",
            frames: [
                { key: "items", frame: "frames/tile000.png" },
                { key: "items", frame: "frames/tile001.png" },
                { key: "items", frame: "frames/tile002.png" },
                { key: "items", frame: "frames/tile003.png" },
                { key: "items", frame: "frames/tile004.png" },
                { key: "items", frame: "frames/tile005.png" },
                { key: "items", frame: "frames/tile006.png" },
                { key: "items", frame: "frames/tile007.png" },
            ],
            frameRate: 15,
            repeat: 2,
        });

        this.anims.create({
            key: "boom_gem",
            frames: [
                { key: "items", frame: "boom/001.png" },
                { key: "items", frame: "boom/002.png" },
                { key: "items", frame: "boom/003.png" },
                { key: "items", frame: "boom/004.png" },
                { key: "items", frame: "boom/005.png" },
                //{ key: "items", frame: "boom/006.png" },
                { key: "items", frame: "boom/007.png" },
                { key: "items", frame: "boom/008.png" },
                { key: "items", frame: "boom/009.png" },
                { key: "items", frame: "boom/010.png" },
                { key: "items", frame: "boom/011.png" },
                //{ key: "items", frame: "boom/012.png" },
                //{ key: "items", frame: "boom/013.png" },
                { key: "items", frame: "boom/014.png" },
                { key: "items", frame: "boom/015.png" },
                { key: "items", frame: "boom/016.png" },
                //{ key: "items", frame: "boom/017.png" },
                { key: "items", frame: "boom/0018.png" },
                { key: "items", frame: "boom/019.png" },
                { key: "items", frame: "boom/020.png" },
            ],
            frameRate: 15,
        });

        this.scale.on("resize", this.resizeGame, this);
        this.resizeGame();

        // Запуск первой игры
        this.startNewGame(MATHCES[0]);
    }

    startNewGame(arr) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        // Удаляем старые символы с анимацией
        if (this.symbols.length > 0) {
            this.slideDownAll(() => {
                console.log("aa", arr);
                this.resetGame(arr);
            });
        } else {
            this.resetGame(arr);
        }
    }

    // Вспомогательная функция: выбрать тип, у которого сейчас < maxCount на поле
    getSafeType(maxCount = 7) {
        const counts = this.getTypeCounts(); // подсчёт текущих типов
        const candidates = Object.keys(counts)
            .map(Number)
            .filter((type) => counts[type] < maxCount);

        // Если все типы уже по 8 — разрешаем любой (редкий крайний случай)
        if (candidates.length === 0) {
            return Phaser.Math.Between(0, SYMBOL_TYPES - 1);
        }

        // Выбираем случайный из допустимых
        return Phaser.Utils.Array.GetRandom(candidates);
    }

    // Подсчёт количества каждого типа на поле
    getTypeCounts() {
        const counts: { [key: number]: number } = {};
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = this.grid[row][col];
                if (cell) {
                    const type = cell.getData("type");
                    counts[type] = (counts[type] || 0) + 1;
                }
            }
        }
        return counts;
    }

    resetGame(targetCounts = []) {
        const totalCells = ROWS * COLS;

        this.isMoving = true;

        // 1. Определяем, сколько клеток уже занято "фиксированными" типами
        let fixedTotal = 0;
        let effectiveCounts = [];

        for (let type = 0; type < SYMBOL_TYPES; type++) {
            const desired = targetCounts[type];
            const count =
                typeof desired === "number" && desired >= 0 ? desired : null;
            effectiveCounts[type] = count;

            if (count !== null) {
                fixedTotal += count;
            }
        }

        if (this.gameStep == 2) {
            effectiveCounts = [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                8,
                null,
            ];
        }

        if (this.gameStep == 4) {
            effectiveCounts = [null, null, null, null, null, 9, null, null, 9];
        }

        console.log("EFF", effectiveCounts);

        if (fixedTotal > totalCells) {
            console.error(
                `resetGame: суммарное количество фиксированных символов (${fixedTotal}) превышает размер поля (${totalCells})`
            );
            // Можно уменьшить или обрезать — здесь просто обрежем до лимита
            // Но лучше бросить ошибку или нормализовать. Для простоты — нормализуем позже.
        }

        // 2. Очистка поля
        this.grid = Array(ROWS)
            .fill()
            .map(() => Array(COLS).fill(null));
        this.symbols = [];

        // 3. Генерируем список всех позиций
        const allPositions = [];
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                allPositions.push({ row, col });
            }
        }
        Phaser.Utils.Array.Shuffle(allPositions);

        // 4. Распределяем фиксированные типы
        let index = 0;
        const assigned: { row: number; col: number; type: number }[] = [];

        for (let type = 0; type < SYMBOL_TYPES; type++) {
            const count = effectiveCounts[type];
            if (count !== null) {
                for (let i = 0; i < count && index < allPositions.length; i++) {
                    assigned.push({ ...allPositions[index], type });
                    index++;
                }
            }
        }

        // 5. Оставшиеся клетки заполняем "свободными" типами (≤8 штук на тип)
        // Сначала посчитаем, сколько уже назначено для каждого типа
        const currentCounts: number[] = new Array(SYMBOL_TYPES).fill(0);
        for (const item of assigned) {
            currentCounts[item.type]++;
        }

        // Теперь заполним остаток
        while (index < allPositions.length) {
            const pos = allPositions[index];

            // Выбираем тип, который:
            // - либо не фиксирован (effectiveCounts[type] === null)
            // - либо фиксирован, но мы ещё не превысили его лимит (маловероятно, но на всякий)
            // И при этом currentCounts[type] < 8
            const candidates = [];
            for (let type = 0; type < SYMBOL_TYPES; type++) {
                const isFixed = effectiveCounts[type] !== null;
                const current = currentCounts[type];
                const limit = isFixed ? effectiveCounts[type]! : 8;

                if (current < limit) {
                    candidates.push(type);
                }
            }

            if (candidates.length === 0) {
                // Крайний случай: всё заполнено до лимита — просто берём любой тип
                console.warn(
                    "Нет доступных типов для заполнения — используем случайный"
                );
                const type = Phaser.Math.Between(0, SYMBOL_TYPES - 1);
                assigned.push({ ...pos, type });
                currentCounts[type]++;
            } else {
                const type = Phaser.Utils.Array.GetRandom(candidates);
                assigned.push({ ...pos, type });
                currentCounts[type]++;
            }

            index++;
        }

        let isX100 = false;

        // 6. Создаём спрайты
        for (const { row, col, type } of assigned) {
            const x = GRID_OFFSET_X + col * CELL_SIZE_W + CELL_SIZE_W / 2;
            const y = -100 - row * 30; // старт выше экрана

            let symbol = this.add
                .sprite(x, y, "items", "gems/" + ITEM_NAMES[type])
                .setScale(0.3);

            if (
                !isX100 &&
                type == ITEM_NAMES.length - 1 &&
                this.gameStep == 5
            ) {
                symbol = this.add
                    .sprite(x, y, "items", "sphere100x.png")
                    .setScale(0.3);
                isX100 = true;
            }

            symbol.setData("type", type);
            symbol.setData("row", row);
            symbol.setData("col", col);
            this.grid[row][col] = symbol;
            this.gameContainer.add(symbol);
            this.symbols.push(symbol);
        }

        // 7. Падение
        this.dropSymbols(() => {
            this.isProcessing = false;
            this.checkMatches();
        });
    }

    spawnNewSymbols() {
        // Подсчитываем текущие количества
        const counts = this.getTypeCounts();

        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row < ROWS; row++) {
                if (!this.grid[row][col]) {
                    // Выбираем тип, у которого < 8
                    const type = this.getSafeType(7); // гарантирует counts[type] < 8

                    const x =
                        GRID_OFFSET_X + col * CELL_SIZE_W + CELL_SIZE_W / 2;
                    const y = -100 - row * (CELL_SIZE + 10);
                    const symbol = this.add
                        .sprite(x, y, "items", "gems/" + ITEM_NAMES[type])
                        .setScale(0.3);

                    symbol.setData("type", type);
                    symbol.setData("row", row);
                    symbol.setData("col", col);
                    this.gameContainer.add(symbol);
                    this.grid[row][col] = symbol;
                    this.symbols.push(symbol);
                }
            }
        }
    }

    // dropSymbols остаётся без изменений, но можно оставить как есть
    dropSymbols(onComplete) {
        this.isProcessing = true;
        let drops = 0;
        const total = this.symbols.length;

        this.symbols.forEach((sym) => {
            const targetY =
                GRID_OFFSET_Y + sym.getData("row") * CELL_SIZE + CELL_SIZE / 2;
            this.tweens.add({
                targets: sym,
                y: targetY,
                duration: 1000 + sym.y * 0.5,
                ease: "Back.easeOut",
                onComplete: () => {
                    drops++;
                    if (drops === total && onComplete) onComplete();
                },
            });
        });
    }

    checkMatches() {
        if (this.isProcessing) return;

        const toRemove = new Set();

        const typeCounts = {};
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = this.grid[row][col];
                if (cell) {
                    const type = cell.getData("type");
                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                }
            }
        }

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = this.grid[row][col];
                if (cell) {
                    const type = cell.getData("type");
                    if (typeCounts[type] >= 8) {
                        toRemove.add(cell);
                    }
                }
            }
        }

        if (toRemove.size === 0) {
            // Нет совпадений — завершаем игру через паузу
            this.isMoving = false;
            /*
            this.time.delayedCall(500, () => {
                this.slideDownAll();
            });
            */
            return;
        }

        // Удаляем выигрышные
        this.isProcessing = true;
        toRemove.forEach((sym) => {
            const row = sym.getData("row");
            const col = sym.getData("col");
            this.grid[row][col] = null;

            const effect = this.add.sprite(
                sym.x,
                sym.y,
                "items",
                "frames/tile000.png"
            );
            effect.setScale(sym.scale * 1.8);

            effect.play("frame_gem");
            this.gameContainer.add(effect);

            effect.on("animationcomplete", () => {
                effect.destroy();
            });

            this.tweens.add({
                targets: sym,
                scale: 0.35,
                duration: 300,
                ease: "Power2",
                yoyo: true,
                onComplete: () => {
                    sym.setVisible(false);
                },
            });

            this.time.delayedCall(400, () => {
                const effectBoom = this.add.sprite(
                    sym.x,
                    sym.y,
                    "items",
                    "boom/001.png"
                );
                effectBoom.setScale(sym.scale * 1.8);
                effectBoom.play("boom_gem");
                this.gameContainer.add(effectBoom);

                effectBoom.on("animationcomplete", () => {
                    effectBoom.destroy();
                });
            });
        });

        // Сдвигаем оставшиеся вниз по колонкам
        this.shiftColumnsDown();

        // Заполняем новые сверху
        this.spawnNewSymbols();

        this.startPushes();

        // Падение новых
        this.time.delayedCall(1500, () => {
            this.dropSymbols(() => {
                this.isProcessing = false;
                this.checkMatches(); // рекурсивная проверка
            });
        });
    }

    shiftColumnsDown() {
        for (let col = 0; col < COLS; col++) {
            let writeRow = ROWS - 1;
            for (let readRow = ROWS - 1; readRow >= 0; readRow--) {
                if (this.grid[readRow][col]) {
                    if (writeRow !== readRow) {
                        // Перемещаем спрайт
                        const sym = this.grid[readRow][col];
                        sym.setData("row", writeRow);
                        this.grid[writeRow][col] = sym;
                        this.grid[readRow][col] = null;
                    }
                    writeRow--;
                }
            }
        }
    }

    slideDownAll(onEnd) {
        this.symbols.forEach((sym) => {
            this.tweens.add({
                targets: sym,
                y: GRID_OFFSET_Y + CELL_SIZE * ROWS + 100,
                duration: 1000,
                ease: "Power2",
            });
        });
        this.symbols = [];
        this.grid = Array(ROWS)
            .fill()
            .map(() => Array(COLS).fill(null));

        this.time.delayedCall(1000, () => {
            onEnd();
        });
    }

    update() {}

    startPushes() {
        if (BONUS_NAMES[this.gameStep]) {
            this.bonusSprite.setTexture("items", BONUS_NAMES[this.gameStep]);
            this.bonusSprite.setScale(0);

            this.tweens.add({
                targets: this.bonusSprite,
                scale: 0.8,
                duration: 700,
                ease: "Power2",
                yoyo: true,
                onComplete: () => {
                    this.bonusSprite.setScale(0);
                },
            });
        }

        if (PUSH_NAMES[this.gameStep]) {
            this.pushSprite.setTexture("items", PUSH_NAMES[this.gameStep]);

            const pushScale =
                this.scale.width > this.scale.height
                    ? this.scale.width / 2400
                    : this.scale.width / 1200;

            console.log(pushScale);

            this.pushSprite.setScale(pushScale);

            this.tweens.add({
                targets: this.pushSprite,
                y: 50 * pushScale,
                duration: 700,
                ease: "Power2",
                onComplete: () => {
                    this.time.delayedCall(1000, () => {
                        this.pushSprite.y = -200;
                    });
                },
            });
        }

        //this.betCount = this.createRouletteCounter(0,0, 0.22, BET_COUNT[this.gameStep-1], BET_COUNT[this.gameStep], 500);
        this.betCount.destroy();
        this.betCount = this.createRouletteCounter(
            0,
            0,
            0.22,
            BET_COUNT[this.gameStep],
            BET_COUNT[this.gameStep + 1],
            500
        );
        this.betContainer.add(this.betCount);
    }

    startEndScreen() {
        this.betBtn.setVisible(false);
        this.betContainer.setVisible(false);
        this.spinBtn.setVisible(false);
        this.cashoutBtn.setVisible(false);
        this.gameBackContainer.setVisible(false);
        this.gameContainer.setVisible(false);
        this.cellsFrame.setVisible(false);


        this.endEffect = this.add.sprite(COLS*CELL_SIZE_W/2,GRID_OFFSET_Y+ROWS*CELL_SIZE/2-20,'endeffect').setOrigin(0.5,1).setScale(0.7);
        this.uiContainer.add(this.endEffect);

        this.endSprite = this.add.sprite(COLS*CELL_SIZE_W/2,GRID_OFFSET_Y+ROWS*CELL_SIZE/2,'endbtn').setOrigin(0.5,0.5).setScale(0.4);
        this.uiContainer.add(this.endSprite);



        this.tweenZeus.stop();

        
        this.backContainer.remove(this.imageZeus);
        this.uiContainer.add(this.imageZeus);

        this.imageZeus.x = COLS*CELL_SIZE_W*3/4;
        this.imageZeus.y = GRID_OFFSET_Y+ROWS*CELL_SIZE/2;
        this.imageZeus.setOrigin(0.25, 0.5);
        this.imageZeus.setScale(0.5);

        const zeusY = this.imageZeus.y;

        if (this.tweenZeus) this.tweenZeus.stop();


        this.tweenZeus = this.tweens.add({
            targets: this.imageZeus,
            y: zeusY - 30,
            duration: 1000,
            ease: "Linear",
            yoyo: true,
            repeat: -1,
        });
    }

    resizeGame() {
        this.bgScale =
            this.scale.width > this.scale.height
                ? this.scale.width / 1920
                : this.scale.height / 1920;

        this.bgItemScale = this.scale.height / 1400;
        this.fieldScale =
            this.scale.width < this.scale.height
                ? this.scale.width /
                  (GRID_OFFSET_X * 2 + CELL_SIZE_W * COLS + 100)
                : this.scale.height /
                  (GRID_OFFSET_Y * 2 + CELL_SIZE * ROWS + 100);

        this.shiftX =
            (this.scale.width -
                this.fieldScale * (GRID_OFFSET_X * 2 + CELL_SIZE_W * COLS)) /
            2;
        this.shiftY =
            (this.scale.height -
                this.fieldScale * (GRID_OFFSET_Y * 2 + CELL_SIZE * ROWS)) /
                2 -
            20;

        this.gameBackContainer.setScale(this.fieldScale);
        this.gameContainer.setScale(this.fieldScale);
        this.uiContainer.setScale(this.fieldScale);
        this.maskGraphics.setScale(this.fieldScale);
        this.gameBackContainer.x = this.shiftX;
        this.gameContainer.x = this.shiftX;
        this.uiContainer.x = this.shiftX;
        this.maskGraphics.x = this.shiftX;
        this.gameBackContainer.y = this.shiftY;
        this.gameContainer.y = this.shiftY;
        this.uiContainer.y = this.shiftY;
        this.maskGraphics.y = this.shiftY;

        this.bg.setScale(this.bgScale);
        this.bg.x = this.scale.width / 2;
        this.bg.y = this.scale.height / 2;

        if (this.scale.width > this.scale.height) {
            (this.cashoutBtn.x =
                GRID_OFFSET_X + ((COLS + 1) * CELL_SIZE_W) / 2),
                (this.cashoutBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 66),
                (this.betBtn.x = GRID_OFFSET_X);
            (this.betBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 20),
                (this.spinBtn.x =
                    GRID_OFFSET_X + COLS * CELL_SIZE_W - CELL_SIZE_W / 2);
            this.spinBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + CELL_SIZE / 2;
            this.spinBtn.setOrigin(0.5, 0.5);
            this.betBtn.setOrigin(0, 0);
            this.cashoutBtn.setOrigin(0.5, 0.5);
            this.cashoutBtn.setScale(0.45);
            this.betBtn.setScale(0.4);
            this.betContainer.setScale(1);
            this.betContainer.x = GRID_OFFSET_X + 118;
            this.betContainer.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 55;

            this.imageZeus.x = this.scale.width - 40;
            this.imageZeus.y = this.scale.height / 2;
            this.imageZeus.setOrigin(1, 0.5);
            this.imageZeus.setScale(this.bgItemScale * 0.8);

            const zeusY = this.imageZeus.y;

            if (this.tweenZeus) this.tweenZeus.stop();

            this.tweenZeus = this.tweens.add({
                targets: this.imageZeus,
                y: zeusY - 30,
                duration: 1000,
                ease: "Linear",
                yoyo: true,
                repeat: -1,
            });
        } else {
            this.cashoutBtn.x = GRID_OFFSET_X + (3 * COLS * CELL_SIZE_W) / 4;
            this.cashoutBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 80;
            this.betBtn.x = GRID_OFFSET_X + (COLS * CELL_SIZE_W) / 4;
            (this.betBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 80),
                (this.spinBtn.x = GRID_OFFSET_X + (COLS * CELL_SIZE_W) / 2);
            this.spinBtn.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + CELL_SIZE * 2;
            this.spinBtn.setOrigin(0.5, 0);
            this.betBtn.setOrigin(0.5, 0.5);
            this.cashoutBtn.setOrigin(0.5, 0.5);
            this.cashoutBtn.setScale(0.55);
            this.betBtn.setScale(0.55);
            this.betContainer.setScale(50 / 40);
            this.betContainer.x = GRID_OFFSET_X + 185;
            this.betContainer.y = GRID_OFFSET_Y + ROWS * CELL_SIZE + 65;

            this.imageZeus.x = (this.scale.width * 3) / 4;
            this.imageZeus.y = this.scale.height / 2 + 20;
            this.imageZeus.setOrigin(0.5, 1);
            this.imageZeus.setScale(this.bgItemScale * 0.7);

            const zeusY = this.imageZeus.y;

            if (this.tweenZeus) this.tweenZeus.stop();

            this.tweenZeus = this.tweens.add({
                targets: this.imageZeus,
                y: zeusY - 20,
                duration: 1000,
                ease: "Linear",
                yoyo: true,
                repeat: -1,
            });
        }
    }

    createRouletteCounter(x, y, scale, min, max, duration) {
        const atlasKey = "items";
        const container = this.add.container(x, y);
        container.setScale(scale);

        const spacing = 55;
        const decimals = 2;
        const formatWidth = 7; // Максимум: "1000.00" → 7 символов

        let currentVal = min;
        const totalFrames = duration / 16.6; // ~60 FPS
        const increment = (max - min) / totalFrames;

        const self = this;

        // Функция форматирования числа: 12.3 → "12.30", 5 → "5.00", 1000 → "1000.00"
        function formatNumber(num) {
            const fixed = num.toFixed(decimals);
            return fixed
                .padStart(formatWidth - decimals - 1, " ")
                .replace(" ", "0"); // Дополняем нулями слева
        }

        // Функция обновления отображения
        function updateDisplay(value) {
            const str = "" + Math.floor(value);
            //formatNumber(value);
            container.removeAll(true);

            let offsetX = 0;

            let frameName = "nums/$.png";
            const sprite = self.add
                .sprite(offsetX, 0, atlasKey, frameName)
                .setScale(0.8);
            container.add(sprite);
            offsetX += spacing;

            for (let char of str) {
                if (char === " ") continue;

                let frameName;
                if (char === ".") {
                    frameName = "nums/dot.png";
                } else if (/[0-9]/.test(char)) {
                    frameName = `nums/${char}.png`;
                } else {
                    continue;
                }

                const sprite = self.add.sprite(offsetX, 0, atlasKey, frameName);
                container.add(sprite);
                offsetX += spacing;
            }

            offsetX -= spacing / 3;
        }

        // Первое отображение
        updateDisplay(currentVal);

        // Анимация
        if (duration > 0) {
            const timer = this.time.addEvent({
                delay: 16.6, // ~60 FPS
                callback: () => {
                    currentVal += increment;
                    if (currentVal >= max) {
                        currentVal = max;
                        updateDisplay(currentVal);
                        timer.remove(); // Завершаем
                    } else {
                        updateDisplay(currentVal);
                    }
                },
                repeat: Math.floor(totalFrames),
            });
        }

        // Добавим метод для остановки вручную
        container.stop = () => {
            if (timer) timer.remove();
            updateDisplay(max);
        };

        return container;
    }
}

