import {Text, View} from "react-native";
import React from "react";
import {OBSTACLE_FRAME_SCALE} from "@/app/gameConstants";
import exp from "node:constants";

const Obstacle = ({ body, width, rotation }: any) => {
    const { position } = body;

    // Calculate the frame size based on the scale
    const frameWidth = width * OBSTACLE_FRAME_SCALE;

    return (
        <View
            style={{
                position: "absolute",
                left: position.x - frameWidth / 2,
                top: position.y - frameWidth / 2, // Center the frame
                width: frameWidth,
                height: frameWidth, // Keep it a square
                borderRadius: frameWidth / 2, // Makes the frame circular
                borderColor: "blue", // Collision frame color
                borderWidth: 0, // Frame thickness
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <View
                style={{
                    position: "absolute",
                    width: width,
                    height: width,
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{ rotate: `${rotation}deg` }], // Apply rotation
                }}
            >
                <Text
                    style={{
                        fontSize: width * 0.8, // Scale emoji size
                        userSelect: "none",
                    }}
                >
                    🪨
                </Text>
            </View>
        </View>
    );
};

export default Obstacle;
