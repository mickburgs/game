import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Dimensions, PanResponder, TouchableOpacity } from "react-native";
import { GameEngine } from "react-native-game-engine";
import Matter from "matter-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const INITIAL_OBSTACLE_SPEED = 5;
const SPEED_INCREMENT_INTERVAL = 5;
const SPEED_INCREMENT = 1;

const SCORE_INCREMENT_INTERVAL = 0.1;
const SCORE_INCREMENT = 1;

const MIN_OBSTACLE_SIZE = 30;
const MAX_OBSTACLE_SIZE = 200;
const MIN_ROTATION_SPEED = 0.1;
const MAX_ROTATION_SPEED = 2;

const Rocket = ({ body }: any) => {
    const { position } = body;
    const collisionWidth = 20; // Exact collision size
    const collisionHeight = 40; // Exact collision size

    return (
        <View
            style={{
                position: "absolute",
                left: position.x - collisionWidth / 2,
                top: position.y - collisionHeight / 2,
                width: collisionWidth,
                height: collisionHeight,
                borderColor: "red", // Red border to visualize the collision frame
                borderWidth: 2, // Visible collision border
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text
                style={{
                    fontSize: 40, // UI size of the rocket emoji
                    transform: [{ rotate: "45deg" }], // Rotate the rocket emoji
                    userSelect: "none", // Prevent text selection
                }}
            >
                🚀
            </Text>
        </View>
    );
};

const Obstacle = ({ body, width, height, rotation }: any) => {
    const { position } = body;

    return (
        <View
            style={{
                position: "absolute",
                left: position.x - width / 2,
                top: position.y - height / 2,
                width,
                height,
                borderColor: "blue",
                borderWidth: 2,
                justifyContent: "center",
                alignItems: "center",
                transform: [{ rotate: `${rotation}deg` }], // Apply rotation
            }}
        >
            <Text
                style={{
                    fontSize: width, // Scale emoji size based on width
                    userSelect: "none",
                }}
            >
                🪨
            </Text>
        </View>
    );
};

const getRandomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const physics = (entities: any, { time, dispatch }: any) => {
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


export default function App() {
    const [running, setRunning] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [obstacleSpeed, setObstacleSpeed] = useState(INITIAL_OBSTACLE_SPEED);
    const [entities, setEntities] = useState(initializeEntities);
    const [showHint, setShowHint] = useState(true);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);


    useEffect(() => {
        let scoreInterval: NodeJS.Timeout;

        if (running) {
            scoreInterval = setInterval(() => {
                setScore((prevScore) => prevScore + SCORE_INCREMENT);
            }, SCORE_INCREMENT_INTERVAL * 1000); // Convert seconds to milliseconds
        }

        return () => clearInterval(scoreInterval); // Cleanup interval
    }, [running]);

    useEffect(() => {
        const hintTimeout = setTimeout(() => {
            setShowHint(false); // Hide the hint after 5 seconds
        }, 5000);

        return () => clearTimeout(hintTimeout); // Cleanup timeout if the component unmounts
    }, []);

    useEffect(() => {
        const loadHighScore = async () => {
            const storedHighScore = await AsyncStorage.getItem("highScore");
            if (storedHighScore) {
                setHighScore(parseInt(storedHighScore, 10));
            }
        };
        loadHighScore();
    }, []);


    useEffect(() => {
        let speedInterval: NodeJS.Timeout;
        if (running) {
            speedInterval = setInterval(() => {
                setObstacleSpeed((prevSpeed) => prevSpeed + SPEED_INCREMENT);
            }, SPEED_INCREMENT_INTERVAL * 1000);
        }
        return () => clearInterval(speedInterval);
    }, [running]);

    useEffect(() => {
        // Sync the updated obstacleSpeed with the entities object
        setEntities((prevEntities) => ({
            ...prevEntities,
            obstacleSpeed,
        }));
    }, [obstacleSpeed]);


    function initializeEntities() {
        const engine = Matter.Engine.create();
        const world = engine.world;

        const rocket = Matter.Bodies.rectangle(width / 4, height / 2, 20, 40, {
            isStatic: true,
        }); // Rocket collision size remains constant

        const obstacles = Array.from({ length: 3 }).map((_, index) => {
            const obstacleWidth = getRandomBetween(MIN_OBSTACLE_SIZE, MAX_OBSTACLE_SIZE);
            const obstacleHeight = getRandomBetween(MIN_OBSTACLE_SIZE, MAX_OBSTACLE_SIZE);
            const obstacle = Matter.Bodies.rectangle(
                width + index * 200,
                Math.random() * height,
                obstacleWidth,
                obstacleHeight,
                { isStatic: true }
            );

            obstacle.rotationSpeed = getRandomBetween(MIN_ROTATION_SPEED, MAX_ROTATION_SPEED);
            obstacle.rotationDirection = Math.random() > 0.5 ? 1 : -1; // Randomly rotate clockwise or counterclockwise

            return obstacle;
        });

        Matter.World.add(world, [rocket, ...obstacles]);

        return {
            physics: { engine, world },
            obstacleSpeed: INITIAL_OBSTACLE_SPEED,
            rocket: { body: rocket, renderer: Rocket },
            ...obstacles.reduce((acc, obstacle, index) => {
                acc[`obstacle${index}`] = {
                    body: obstacle,
                    width: obstacle.bounds.max.x - obstacle.bounds.min.x,
                    height: obstacle.bounds.max.y - obstacle.bounds.min.y,
                    rotation: 0, // Initial rotation angle
                    rotationSpeed: obstacle.rotationSpeed,
                    rotationDirection: obstacle.rotationDirection,
                    renderer: Obstacle,
                };
                return acc;
            }, {}),
        };
    }

    const restartGame = async () => {
        if (score > highScore) {
            setHighScore(score);
            await AsyncStorage.setItem("highScore", score.toString());
        }
        setEntities(initializeEntities());
        setObstacleSpeed(INITIAL_OBSTACLE_SPEED);
        setScore(0);
        setRunning(true);
        setGameOver(false);
        setShowHint(true);
    }

    let initialRocketY = 0; // Store the rocket's initial Y position when dragging starts
    let initialTouchY = 0; // Store the initial touch position

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gestureState) => {
            initialTouchY = gestureState.y0; // Capture the touch's Y position
            initialRocketY = entities.rocket.body.position.y; // Capture the rocket's current Y position
        },
        onPanResponderMove: (_, gestureState) => {
            // Calculate the new Y position based on the touch movement
            const deltaY = gestureState.moveY - initialTouchY;
            const newY = Math.max(
                0,
                Math.min(height, initialRocketY + deltaY) // Move relative to the rocket's initial position
            );
            Matter.Body.setPosition(entities.rocket.body, { x: width / 4, y: newY });
        },
        onPanResponderRelease: () => {
            // Optional: Add any release logic if needed
        },
    });

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <GameEngine
                systems={[
                    (entities, args) => {
                        entities.obstacleSpeed = obstacleSpeed; // Sync speed during the game loop
                        return physics(entities, args);
                    },
                ]}
                entities={entities}
                running={running}
                style={styles.gameContainer}
                onEvent={(e) => {
                    if (e.type === "game-over") {
                        setRunning(false);
                        setGameOver(true);
                    }
                }}
            >
                {gameOver && (
                    <View style={styles.overlay}>
                        <Text style={styles.gameOverText}>Game Over</Text>
                        <Text style={styles.gameOverText}>Score: {score}</Text>
                        <Text style={styles.highScoreText}>High Score: {score> highScore ? score : highScore}</Text>
                        <TouchableOpacity onPress={restartGame} style={styles.restartButton}>
                            <Text style={styles.restartButtonText}>Restart</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!gameOver && <Text style={styles.scoreCounter}>Score: {score}</Text>}
                {!gameOver && showHint && <Text style={styles.hintText}>Drag the Rocket Up or Down</Text>}
            </GameEngine>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    gameContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    gameText: {
        position: "absolute",
        top: 40,
        left: width / 2 - 150,
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        width: 300,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    gameOverText: {
        color: "white",
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
    },
    restartButton: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
    },
    restartButtonText: {
        color: "#000",
        fontSize: 20,
        fontWeight: "bold",
    },
    scoreCounter: {
        position: "absolute",
        top: 40,
        left: 20,
        color: "#fff",
        fontSize: 18,
    },
    highScoreText: {
        color: "white",
        fontSize: 24,
        marginBottom: 20,
    },
    hintText: {
        position: "absolute",
        top: 40,
        width: "100%",
        textAlign: "center",
        color: "#fff",
        fontSize: 18,
    },
});
