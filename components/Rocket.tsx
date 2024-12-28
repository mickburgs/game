import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Rocket = ({ body }) => {
    const { position } = body;
    const collisionWidth = 45;
    const collisionHeight = 25;

    return (
        <View
            style={[
                styles.collisionFrame,
                {
                    left: position.x - collisionWidth / 2,
                    top: position.y - collisionHeight / 2,
                },
            ]}
        >
            <View style={styles.rocket}>
                <Text style={styles.rocketEmoji}>🚀</Text>
            </View>
        </View>
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
        borderWidth: 2,
        overflow: "visible",
    },
    rocket: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        width: 40,
        height: 40,
        transform: [
            { rotate: "45deg" },
        ],
    },
    rocketEmoji: {
        fontSize: 40,
        userSelect: "none",
    },
});

export default Rocket;