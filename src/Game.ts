import Phaser from "phaser";

import { ResultScreen } from "./ResultScreen";

const COLS = 6;
const ROWS = 5;
const SYMBOL_TYPES = 9;
const CELL_SIZE = 80;
const CELL_SIZE_W = 105;
const GRID_OFFSET_X = 100;
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

export default class MainGame extends Phaser.Scene {
    grid = []; // grid[row][col] = sprite
    symbols = [];
    isProcessing = false;
    gameContainer = null;
    gameBackContainer = null;
    backContainer = null;
    uiContainer = null;
    maskGraphics = null;
    gameStep = 0;
    bg = null;
    bgScale = 1;
    bgItemScale = 1;
    fieldScale = 1;

    preload() {
        this.load.atlas("items", "assets/zeus1.png", "assets/zeus1.json");
        this.load.image("table", "assets/table.png");
        this.load.image("tframe", "assets/table_ram.png");
        this.load.image("bg", "assets/background.jpg");
        this.load.image("zeus", "assets/zimage.png");
        this.load.image("pillar", "assets/stolb.png");
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
        this.bgItemScale = this.scale.height / 1220;
        this.fieldScale =
            this.scale.width < this.scale.height
                ? this.scale.width / (GRID_OFFSET_X * 2 + CELL_SIZE_W * COLS)
                : this.scale.height / (GRID_OFFSET_Y * 2 + CELL_SIZE * ROWS);
        this.bg = this.add
            .sprite(this.scale.width / 2, this.scale.height / 2, "bg")
            .setOrigin(0.5, 0.5)
            .setScale(this.bgScale);

        this.backContainer = this.add.container();

        console.log("SCR", this.scale.width, this.scale.height);
        if (this.scale.width > this.scale.height) {
            const pill1 = this.add
                .sprite(20, this.scale.height / 2, "pillar")
                .setOrigin(0, 0.5)
                .setScale(this.bgItemScale);
            this.backContainer.add(pill1);
            const pill2 = this.add
                .sprite(this.scale.width - 20, this.scale.height / 2, "pillar")
                .setOrigin(1, 0.5)
                .setScale(this.bgItemScale);
            this.backContainer.add(pill2);
            const zImage = this.add
                .sprite(this.scale.width - 40, this.scale.height / 2, "zeus")
                .setOrigin(1, 0.5)
                .setScale(this.bgItemScale * 0.8);
            this.backContainer.add(zImage);
        }

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

        const cellsFrame = this.add
            .sprite(GRID_OFFSET_X - 20, GRID_OFFSET_Y - 30, "tframe")
            .setScale(0.325, 0.325)
            .setOrigin(0);
        this.uiContainer.add(cellsFrame);

        this.gameBackContainer.setScale(this.fieldScale);
        this.gameContainer.setScale(this.fieldScale);
        this.uiContainer.setScale(this.fieldScale);
        this.maskGraphics.setScale(this.fieldScale);

        const restartButton = this.add
            .rectangle(100, 50, 160, 50, 0x44cc44)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                if (this.gameStep < MATHCES.length)
                    this.startNewGame(MATHCES[this.gameStep]);
                else alert("final");
            });

        this.add
            .text(100, 50, "Новая игра", {
                fontSize: "20px",
                color: "#fff",
                align: "center",
            })
            .setOrigin(0.5);

        this.uiContainer.add(restartButton);

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

        // Запуск первой игры
        this.startNewGame(MATHCES[this.gameStep]);
    }

    startNewGame(arr) {
        if (this.isProcessing) return;
        this.isProcessing = true;

        // Удаляем старые символы с анимацией
        if (this.symbols.length > 0) {
            this.slideDownAll.call(this, () => {
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

    /*
    resetGame(N) {
        // Очистка
        this.grid = Array(ROWS)
            .fill()
            .map(() => Array(COLS).fill(null));
        this.symbols = [];

        // Шаг 1: выбрать "особый" тип для N элементов
        const specialType = Phaser.Math.Between(0, SYMBOL_TYPES - 1);

        console.log("SP",N,specialType);

        // Шаг 2: сгенерировать N позиций для specialType
        const allPositions = [];

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                allPositions.push({ row, col });
            }
        }

        Phaser.Utils.Array.Shuffle(allPositions);
        const specialPositions = allPositions.slice(0, N);
        const specialSet = new Set(
            specialPositions.map((p) => `${p.row},${p.col}`)
        );

        // Шаг 3: заполнить поле
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {

                let type: number;
                if (specialSet.has(`${row},${col}`)) {
                    type = specialType;
                } else {
                    // Выбираем тип, который пока < 8 (и не обязательно specialType)
                    // Но specialType уже имеет N ≥8, поэтому он исключён из safe-выбора
                    const counts = {}; // временный подсчёт (можно оптимизировать, но для сброса — ок)
                    // На этапе генерации мы ещё не добавили символы, кроме specialType,
                    // поэтому просто избегаем specialType, если N >= 8
                    let tries = 0;
                    do {
                        type = Phaser.Math.Between(0, SYMBOL_TYPES - 1);
                        tries++;
                    } while (type === specialType && N >= 8 && tries < 100);
                    // Если N < 8 — можно оставить и specialType, но по условию N ≥8, так что ок.
                }

                const x = GRID_OFFSET_X + col * CELL_SIZE_W + CELL_SIZE_W / 2;
                const y = -100 - row * 30;
                const symbol = this.add
                    .sprite(x, y, "items", "gems/" + ITEM_NAMES[type])
                    .setScale(0.3);

                symbol.setData("type", type);
                symbol.setData("row", row);
                symbol.setData("col", col);
                this.grid[row][col] = symbol;
                this.gameContainer.add(symbol);
                this.symbols.push(symbol);
            }
        }

        // Падение
        this.dropSymbols(() => {
            this.isProcessing = false;
            this.checkMatches();
        });
    }
        */

    resetGame(targetCounts = []) {
        const totalCells = ROWS * COLS;
        this.gameStep += 1;

        // 1. Определяем, сколько клеток уже занято "фиксированными" типами
        let fixedTotal = 0;
        const effectiveCounts: number[] = [];

        for (let type = 0; type < SYMBOL_TYPES; type++) {
            const desired = targetCounts[type];
            const count =
                typeof desired === "number" && desired >= 0 ? desired : null;
            effectiveCounts[type] = count;
            if (count !== null) {
                fixedTotal += count;
            }
        }

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

        // 6. Создаём спрайты
        for (const { row, col, type } of assigned) {
            const x = GRID_OFFSET_X + col * CELL_SIZE_W + CELL_SIZE_W / 2;
            const y = -100 - row * 30; // старт выше экрана
            const symbol = this.add
                .sprite(x, y, "items", "gems/" + ITEM_NAMES[type])
                .setScale(0.3);

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
            this.time.delayedCall(500, () => {
                this.slideDownAll();
            });
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

    slideDownAll() {
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
    }

    update() {}
}

