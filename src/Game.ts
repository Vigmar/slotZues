import Phaser from "phaser";

import { ResultScreen } from "./ResultScreen";

const COLS = 6;
const ROWS = 5;
const SYMBOL_TYPES = 9;
const CELL_SIZE = 80;
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

const maskWidth = COLS * CELL_SIZE;
const maskHeight = ROWS * CELL_SIZE;
const maskX = GRID_OFFSET_X;
const maskY = GRID_OFFSET_Y;

export default class MainGame extends Phaser.Scene {
    grid = []; // grid[row][col] = sprite
    symbols = [];
    isProcessing = false;
    gameContainer = null;
    maskGraphics = null;

    preload() {
        this.load.atlas("items", "assets/zeus1.png", "assets/zeus1.json");
        this.load.image("reel", "assets/table.png");
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

        // === КОНТЕЙНЕР ДЛЯ СИМВОЛОВ ===
        this.gameContainer = this.add.container();
        this.gameContainer.setMask(mask);

        // === КНОПКА ===
        const restartButton = this.add
            .rectangle(100, 50, 160, 50, 0x44cc44)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.startNewGame.call(this));
        this.add
            .text(100, 50, "Новая игра", {
                fontSize: "20px",
                color: "#fff",
                align: "center",
            })
            .setOrigin(0.5);

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
        this.startNewGame.call(this);
    }

    startNewGame() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        // Удаляем старые символы с анимацией
        if (this.symbols.length > 0) {
            this.slideDownAll.call(this, () => {
                this.resetGame.call(this);
            });
        } else {
            this.resetGame.call(this);
        }
    }

    resetGame() {
        // Очистка
        this.grid = Array(ROWS)
            .fill()
            .map(() => Array(COLS).fill(null));
        this.symbols = [];

        // Создаём новые символы ВНЕ ЭКРАНА (сверху)
        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row < ROWS; row++) {
                const type = Phaser.Math.Between(0, SYMBOL_TYPES - 1);
                const x = GRID_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2;
                const y = -100 - row * 30; // старт выше
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
        this.dropSymbols.call(this, () => {
            this.isProcessing = false;
            this.checkMatches.call(this);
        });
    }

    spawnNewSymbols() {
        for (let col = 0; col < COLS; col++) {
            for (let row = 0; row < ROWS; row++) {
                if (!this.grid[row][col]) {
                    const type = Phaser.Math.Between(0, SYMBOL_TYPES - 1);
                    const x = GRID_OFFSET_X + col * CELL_SIZE + CELL_SIZE / 2;
                    const y = -100 - row * (CELL_SIZE + 10); // Начинаем выше экрана
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

        // Поиск 2x2 блоков
        for (let row = 0; row < ROWS - 1; row++) {
            for (let col = 0; col < COLS - 1; col++) {
                const a = this.grid[row][col];
                const b = this.grid[row][col + 1];
                const c = this.grid[row + 1][col];
                const d = this.grid[row + 1][col + 1];

                /*
            if (a && b && c && d) {
                const type = a.getData('type');
                if (
                    b.getData('type') === type &&
                    c.getData('type') === type &&
                    d.getData('type') === type
                ) {
                    toRemove.add(a);
                    toRemove.add(b);
                    toRemove.add(c);
                    toRemove.add(d);
                }
            }
                */

                if (a && b) {
                    const type = a.getData("type");

                    if (b.getData("type") === type) {
                        toRemove.add(a);
                        toRemove.add(b);
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
                sym.setVisible(false);

                const effectBoom = this.add.sprite(
                    sym.x,
                    sym.y,
                    "items",
                    "boom/000.png"
                );
                effectBoom.setScale(sym.scale * 1.8);
                effectBoom.play("boom_gem");
                this.gameContainer.add(effectBoom);

                effectBoom.on("animationcomplete",()=>{
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

