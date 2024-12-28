import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const Rocket = ({ body }) => {
    const { position } = body;
    const collisionWidth = 45;
    const collisionHeight = 25;

    // Animation reference
    const bobbingAnimation = useRef(new Animated.Value(0)).current;

    // Continuous bobbing animation
    useEffect(() => {
        const startBobbing = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(bobbingAnimation, {
                        toValue: -2, // Move up by 5 units
                        duration: 500, // Half of the cycle duration
                        useNativeDriver: true,
                    }),
                    Animated.timing(bobbingAnimation, {
                        toValue: 0, // Move down by 5 units
                        duration: 500, // Half of the cycle duration
                        useNativeDriver: true,
                    }),
                    Animated.timing(bobbingAnimation, {
                        toValue: 2, // Move down by 5 units
                        duration: 500, // Half of the cycle duration
                        useNativeDriver: true,
                    }),
                    Animated.timing(bobbingAnimation, {
                        toValue: 0, // Move down by 5 units
                        duration: 500, // Half of the cycle duration
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        startBobbing();
    }, [bobbingAnimation]);

    return (
        <Animated.View
            style={[
                styles.collisionFrame,
                {
                    left: position.x - collisionWidth / 2,
                    top: position.y - collisionHeight / 1.3,
                    transform: [{ translateY: bobbingAnimation }], // Apply bobbing
                },
            ]}
        >
            <View style={styles.rocket}>
                <Text style={styles.rocketEmoji}>🚀</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    collisionFrame: {
        position: "absolute",
        width: 45,
        height: 25,
        justifyContent: "center",
        alignItems: "center",
        borderColor: "red",
        borderWidth: 0, // Set to 2 if debugging the collision frame
        overflow: "visible",
    },
    rocket: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        width: 40,
        height: 40,
        transform: [{ rotate: "45deg" }], // Initial rotation of the rocket
    },
    rocketEmoji: {
        fontSize: 40,
        userSelect: "none", // Prevent text selection
    },
});

export default Rocket;