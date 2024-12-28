import Matter from "matter-js";
import {
    PRIMARY_OBSTACLE,
    MAX_OBSTACLE_SIZE,
    OBSTACLE_FRAME_SCALE,
    MIN_OBSTACLE_SIZE,
    OBSTACLE_EMOJIS
} from "@/app/gameConstants";

export const getRandomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

export const physics = (entities: any, { time, dispatch }: any, width: number, height: number) => {
    const engine = entities.physics.engine;

    if (!engine) {
        console.error("Physics engine is not initialized!");
        return entities;
    }

    Matter.Engine.update(engine, time.delta);

    Object.keys(entities)
        .filter((key) => key.includes("obstacle"))
        .forEach((key) => {
            const obstacleEntity = entities[key];
            if (obstacleEntity?.body) {
                const obstacle = obstacleEntity.body;

                Matter.Body.setPosition(obstacle, {
                    x: obstacle.position.x - entities.obstacleSpeed,
                    y: obstacle.position.y,
                });

                obstacleEntity.rotation +=
                    obstacleEntity.rotationSpeed * obstacleEntity.rotationDirection;

                if (obstacle.position.x < -obstacleEntity.width) {
                    Matter.Body.setPosition(obstacle, {
                        x: width + obstacleEntity.width,
                        y: Math.random() * height,
                    });

                    obstacleEntity.rotation = 0;

                    const newEmoji = getRandomEmoji();
                    obstacleEntity.emoji = newEmoji;

                    let minSize = MIN_OBSTACLE_SIZE;
                    let maxSize = MAX_OBSTACLE_SIZE;
                    if (newEmoji !== PRIMARY_OBSTACLE) {
                        minSize += 50;
                        maxSize -= 80;
                    }
                    const newSize = getRandomBetween(minSize, maxSize);
                    obstacle.circleRadius = (newSize * OBSTACLE_FRAME_SCALE) / 2;
                    obstacleEntity.width = newSize;
                }
            }
        });

    if (entities.rocket?.body) {
        const rocket = entities.rocket.body;
        Object.keys(entities)
            .filter((key) => key.includes("obstacle"))
            .forEach((key) => {
                const obstacleEntity = entities[key];
                if (obstacleEntity?.body) {
                    const obstacle = obstacleEntity.body;
                    const collision = Matter.SAT.collides(rocket, obstacle);
                    if (collision?.collided) {
                        dispatch({ type: "game-over" });
                    }
                }
            });
    }

    return entities;
};

let lastUsedEmoji: string | null = null;
function getRandomEmoji() {
    const rockProbability = 0.9; // 90% chance for rock
    if (Math.random() < rockProbability) {
        return PRIMARY_OBSTACLE;
    }

    let newEmoji;
    do {
        const randomIndex = Math.floor(Math.random() * OBSTACLE_EMOJIS.length);
        newEmoji = OBSTACLE_EMOJIS[randomIndex];
    } while (newEmoji === lastUsedEmoji);
    lastUsedEmoji = newEmoji;
    return newEmoji;


}
