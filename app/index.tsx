import React, {useState, useEffect} from "react";
import {StyleSheet, View, Text, Dimensions, PanResponder, TouchableOpacity} from "react-native";
import {GameEngine} from "react-native-game-engine";
import Matter from "matter-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Rocket from "@/components/Rocket";
import {getRandomBetween, physics} from "@/utils/gameUtils";
import {
    INITIAL_OBSTACLE_SPEED,
    MAX_OBSTACLE_SIZE,
    MAX_ROTATION_SPEED,
    MIN_OBSTACLE_SIZE,
    MIN_ROTATION_SPEED,
    OBSTACLE_FRAME_SCALE, PRIMARY_OBSTACLE,
    SCORE_INCREMENT,
    SCORE_INCREMENT_INTERVAL,
    SPEED_INCREMENT,
    SPEED_INCREMENT_INTERVAL
} from "@/app/gameConstants";
import Obstacle from "@/components/Obstacle";

const {width, height} = Dimensions.get("window");

export default function App() {
    const [running, setRunning] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [obstacleSpeed, setObstacleSpeed] = useState(INITIAL_OBSTACLE_SPEED);
    const [entities, setEntities] = useState(initializeEntities);
    const [showHint, setShowHint] = useState(true);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [componentKey, setComponentKey] = useState(0);

    useEffect(() => {
        let scoreInterval: NodeJS.Timeout;

        if (running) {
            scoreInterval = setInterval(() => {
                setScore((prevScore) => prevScore + SCORE_INCREMENT);
            }, SCORE_INCREMENT_INTERVAL * 1000);
        }

        return () => clearInterval(scoreInterval);
    }, [running]);

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
        });

        const obstacles = Array.from({length: 3}).map((_, index) => {
            const size = getRandomBetween(MIN_OBSTACLE_SIZE, MAX_OBSTACLE_SIZE);
            const scaledSize = size * OBSTACLE_FRAME_SCALE;
            const obstacle = Matter.Bodies.circle(
                width + index * 200,
                Math.random() * height,
                scaledSize / 2,
                {isStatic: true}
            );

            obstacle.emoji = PRIMARY_OBSTACLE;
            obstacle.rotationSpeed = getRandomBetween(MIN_ROTATION_SPEED, MAX_ROTATION_SPEED);
            obstacle.rotationDirection = Math.random() > 0.5 ? 1 : -1;

            return obstacle;
        });

        Matter.World.add(world, [rocket, ...obstacles]);

        return {
            physics: {engine, world},
            obstacleSpeed: INITIAL_OBSTACLE_SPEED,
            rocket: {body: rocket, renderer: Rocket},
            ...obstacles.reduce((acc, obstacle, index) => {
                const size = obstacle.circleRadius * 2 / OBSTACLE_FRAME_SCALE;
                acc[`obstacle${index}`] = {
                    body: obstacle,
                    width: size,
                    rotation: 0,
                    rotationSpeed: obstacle.rotationSpeed,
                    rotationDirection: obstacle.rotationDirection,
                    emoji: obstacle.emoji,
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
        setComponentKey((prevKey) => prevKey + 1);
    }

    let initialRocketY = 0;
    let initialTouchY = 0;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gestureState) => {
            initialTouchY = gestureState.y0;
            initialRocketY = entities.rocket.body.position.y;
            setShowHint(false);
        },
        onPanResponderMove: (_, gestureState) => {
            const deltaY = gestureState.moveY - initialTouchY;
            const newY = Math.max(
                0,
                Math.min(height, initialRocketY + deltaY)
            );
            Matter.Body.setPosition(entities.rocket.body, {x: width / 4, y: newY});
        },
        onPanResponderRelease: () => {
            // Optional: Add any release logic if needed
        },
    });

    return (
        <View key={componentKey} style={styles.container} {...panResponder.panHandlers}>
            <GameEngine
                systems={[
                    (entities: { obstacleSpeed: number; }, args: any) => {
                        entities.obstacleSpeed = obstacleSpeed;
                        return physics(entities, args, width, height);
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
                        <Text style={styles.highScoreText}>
                            High Score: {score > highScore ? score : highScore}
                        </Text>
                        <TouchableOpacity onPress={restartGame} style={styles.restartButton}>
                            <Text style={styles.restartButtonText}>Restart</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {!gameOver && <Text style={styles.scoreCounter}>Score: {score}</Text>}
                {!gameOver && showHint && (
                    <Text style={styles.hintText}>Drag the Rocket Up or Down</Text>
                )}
            </GameEngine>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        overflow: "visible",
    },
    gameContainer: {
        flex: 1,
        width: "100%",
        height: Dimensions.get('window').height,
        overflow: "visible",
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
        // backgroundColor: "rgba(0, 0, 0, 0.8)",
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
