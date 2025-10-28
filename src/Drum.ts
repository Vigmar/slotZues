import Phaser from "phaser";
import { DRUM_Y, ITEM_HEIGHT, ITEM_WIDTH, TOTAL_ITEMS } from "./constants";
import { SeededRandom } from "./SeedRandom";

export class Drum extends Phaser.GameObjects.Container {
    private items: Phaser.GameObjects.Sprite[] = [];
    private currentSpeed: number = 0;
    private isSpinning: boolean = false;
    private isBraking: boolean = false;
    private randomGenerator: SeededRandom;

    private elapsedBrakeTime: number = 0;
    private acceleration: number = 0;
    private distanceToGo: number = 0;

    constructor(
        scene: Phaser.Scene,
        randomGenerator: SeededRandom,
        x: number,
        y: number,
        private drumY: number = DRUM_Y,
        private onStopCallback: (icons: string[]) => void,
        private startSpeed: number = 1000,
        private brakeDuration: number = 1000
    ) {
        super(scene, x, y);
        this.randomGenerator = randomGenerator;

        this.initItems();
        scene.add.existing(this);
    }

    private initItems(): void {
        for (let i = 0; i < TOTAL_ITEMS; i++) {
            const iconKey = this.randomGenerator.getRandomIconKey();
            const item = this.scene.add.sprite(
                ITEM_WIDTH / 2,
                this.drumY + (i - 1) * ITEM_HEIGHT,
                "items",
                iconKey
            );

            this.add(item);
            item.setOrigin(0.5, 0.5);
            this.items.push(item);
        }
    }

    public startSpin(): void {
        this.isSpinning = true;
        this.isBraking = false;
        this.currentSpeed = this.startSpeed;
    }

    public stopSpin(): void {
        if (!this.isSpinning || this.isBraking) return;

        this.isBraking = true;
        this.elapsedBrakeTime = 0;
        let itemShiftY = (this.items[0].y - DRUM_Y) % ITEM_HEIGHT;

        const timeInSec = this.brakeDuration / 1000;

        // Calculate how far the drum element will move before stopping
        this.distanceToGo = (this.startSpeed * timeInSec) / 2;

        // Add an offset to ensure it lands exactly on the grid position
        const shiftDist =
            (itemShiftY + this.distanceToGo - DRUM_Y) % ITEM_HEIGHT;
        this.distanceToGo += ITEM_HEIGHT / 2 - shiftDist;

        if (this.distanceToGo < 0) this.distanceToGo += ITEM_HEIGHT;

        this.acceleration =
            (2 * (this.distanceToGo - timeInSec * this.startSpeed)) /
            (timeInSec * timeInSec);
    }

    public update(dt: number): void {
        if (!this.isSpinning) return;

        if (!this.isSpinning) return;

        if (this.isBraking) {
            this.elapsedBrakeTime += dt;

            const brakeProgress = Phaser.Math.Clamp(
                this.elapsedBrakeTime / this.brakeDuration,
                0,
                1
            );
            const remainingTime =
                (this.brakeDuration - this.elapsedBrakeTime) / 1000;

            this.currentSpeed += (this.acceleration * dt) / 1000;

            if (
                brakeProgress >= 1 ||
                this.distanceToGo < 0 ||
                this.currentSpeed < 0
            ) {
                this.isSpinning = false;
                this.isBraking = false;

                // Align elements to the grid finally
                this.items.forEach((item, index) => {
                    let shiftY = (item.y - DRUM_Y) % ITEM_HEIGHT;
                    if (shiftY > ITEM_HEIGHT / 2) shiftY = shiftY - ITEM_HEIGHT;

                    item.y -= shiftY;
                });

                this.onStopCallback(
                    this.items
                        .filter(
                            (e) => e.y > ITEM_HEIGHT && e.y < 4 * ITEM_HEIGHT
                        )
                        .map((e) => e.frame.name)
                );
            }
        }

        const delta = (this.currentSpeed * dt) / 1000;

        if (this.isBraking) this.distanceToGo -= delta;

        this.updateItemsPosition(delta);
    }

    private updateItemsPosition(delta: number): void {
        this.items.forEach((item, index) => {
            item.y += delta;

            if (item.y > this.drumY + TOTAL_ITEMS * ITEM_HEIGHT) {
                item.y -= TOTAL_ITEMS * ITEM_HEIGHT;
                item.setTexture(
                    "items",
                    this.randomGenerator.getRandomIconKey()
                );
            }
        });
    }
}
