import Matter from "matter-js";

export const getRandomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

export const physics = (entities: any, { time, dispatch }: any, width: number, height: number) => {
    const engine = entities.physics?.engine;

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
