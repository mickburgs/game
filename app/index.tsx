import React, { useState } from "react";
import { StyleSheet, View, Text, Dimensions, PanResponder } from "react-native";
import { GameEngine } from "react-native-game-engine";
import Matter from "matter-js";

const { width, height } = Dimensions.get("window");
const OBSTACLE_SPEED = 5;

const Rocket = ({ body }: any) => {
    const { position } = body;
    const width = 40;
    const height = 60;

    return (
        <View
            style={{
                position: "absolute",
                left: position.x - width / 2,
                top: position.y - height / 2,
                width,
                height,
                backgroundColor: "red",
                borderRadius: 10,
            }}
        />
    );
};

const Obstacle = ({ body }: any) => {
    const { position } = body;
    const width = 50;
    const height = 150;

    return (
        <View
            style={{
                position: "absolute",
                left: position.x - width / 2,
                top: position.y - height / 2,
                width,
                height,
                backgroundColor: "blue",
            }}
        />
    );
};


const physics = (entities: any, { time, dispatch }: any) => {
    const engine = entities.physics?.engine;

    if (!engine) {
        console.error("Physics engine is not initialized!");
        return entities;
    }

    Matter.Engine.update(engine, time.delta);

    // Move obstacles left at the configured speed
    Object.keys(entities)
        .filter((key) => key.includes("obstacle"))
        .forEach((key) => {
            const obstacle = entities[key].body;
            Matter.Body.setPosition(obstacle, { x: obstacle.position.x - OBSTACLE_SPEED, y: obstacle.position.y });

            // Reset obstacle when it moves off-screen
            if (obstacle.position.x < -50) {
                Matter.Body.setPosition(obstacle, {
                    x: width + 50,
                    y: Math.random() * height,
                });
            }
        });

    // Collision detection
    const rocket = entities.rocket.body;
    Object.keys(entities)
        .filter((key) => key.includes("obstacle"))
        .forEach((key) => {
            const obstacle = entities[key].body;
            const collision = Matter.SAT.collides(rocket, obstacle);
            if (collision?.collided) {
                dispatch({ type: "game-over" }); // Emit a custom event
            }
        });

    return entities;
};

export default function App() {
    const [running, setRunning] = useState(true);
    const [gameOver, setGameOver] = useState(false);

    // Initialize Matter.js
    const engine = Matter.Engine.create();
    const world = engine.world;

    // Rocket (static in horizontal axis)
    const rocket = Matter.Bodies.rectangle(width / 4, height / 2, 40, 60, {
        isStatic: true,
    });

    // Obstacles
    const obstacles = Array.from({ length: 3 }).map((_, index) =>
        Matter.Bodies.rectangle(width + index * 200, Math.random() * height, 50, 150, {
            isStatic: true,
        })
    );

    // Add bodies to world
    Matter.World.add(world, [rocket, ...obstacles]);

    // Initialize entities
    const entities = {
        physics: { engine, world },
        rocket: { body: rocket, renderer: Rocket },
        ...obstacles.reduce((acc, obstacle, index) => {
            acc[`obstacle${index}`] = { body: obstacle, renderer: Obstacle };
            return acc;
        }, {}),
    };

    let initialTouchY = 0;

    // PanResponder for dragging the rocket vertically
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gestureState) => {
            // Capture the initial touch position
            initialTouchY = gestureState.y0;
        },
        onPanResponderMove: (_, gestureState) => {
            // Calculate new Y position relative to the initial touch
            const deltaY = gestureState.moveY - initialTouchY;
            const newY = Math.max(0, Math.min(height, rocket.position.y + deltaY));
            Matter.Body.setPosition(rocket, { x: width / 4, y: newY });

            // Update initial touch position to avoid jumping
            initialTouchY = gestureState.moveY;
        },
        onPanResponderRelease: () => {},
    });


    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <GameEngine
                systems={[physics]}
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
                    </View>
                )}
                <Text style={styles.gameText}>Drag the Rocket Up or Down</Text>
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
    },
});
