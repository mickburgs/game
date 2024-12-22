import Matter from "matter-js";
import {
    PRIMARY_OBSTACE,
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

    // Move obstacles left and apply rotation
    Object.keys(entities)
        .filter((key) => key.includes("obstacle"))
        .forEach((key) => {
            const obstacleEntity = entities[key];
            if (obstacleEntity?.body) {
                const obstacle = obstacleEntity.body;

                // Move the obstacle
                Matter.Body.setPosition(obstacle, {
                    x: obstacle.position.x - entities.obstacleSpeed,
                    y: obstacle.position.y,
                });

                // Apply rotation
                obstacleEntity.rotation +=
                    obstacleEntity.rotationSpeed * obstacleEntity.rotationDirection;

                // Reset obstacle when it moves off-screen
                if (obstacle.position.x < -obstacleEntity.width) {
                    Matter.Body.setPosition(obstacle, {
                        x: width + obstacleEntity.width,
                        y: Math.random() * height,
                    });

                    obstacleEntity.rotation = 0; // Reset rotation angle

                    const newEmoji = getRandomEmoji();
                    obstacleEntity.emoji = newEmoji;

                    if (newEmoji !== PRIMARY_OBSTACE) {
                        // Larger size for random emojis
                        const newSize = MAX_OBSTACLE_SIZE;
                        obstacle.circleRadius = newSize / 2; // Update Matter.js circle size
                        obstacleEntity.width = newSize; // Update rendering size
                    } else {
                        // Standard size for primary obstacle
                        const newSize = getRandomBetween(MIN_OBSTACLE_SIZE, MAX_OBSTACLE_SIZE);
                        obstacle.circleRadius = (newSize * OBSTACLE_FRAME_SCALE) / 2;
                        obstacleEntity.width = newSize;
                    }
                }
            }
        });

    // Collision detection
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

function getRandomEmoji() {
    const rockProbability = 0.9; // 90% chance for rock
    if (Math.random() < rockProbability) {
        return PRIMARY_OBSTACE;
    }
    const randomIndex = Math.floor(Math.random() * OBSTACLE_EMOJIS.length);
    return OBSTACLE_EMOJIS[randomIndex];
}
