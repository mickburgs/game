import {Text, View} from "react-native";
import React from "react";
import {OBSTACLE_FRAME_SCALE} from "@/app/gameConstants";

const Obstacle = ({ body, width, rotation, emoji }: any) => {
    const { position } = body;

    const frameWidth = width * OBSTACLE_FRAME_SCALE;

    function calculateOffset(rotation: number, width: number) {
        const offsetRange = width * 0.1; // Maximum offset value
        const normalizedRotation = rotation % 360; // Ensure rotation is within 0-360

        // Map rotation to the range of -offsetRange to +offsetRange
        const offset = Math.cos((normalizedRotation * Math.PI) / 180) * offsetRange;

        return offset;
    }

    return (
        <View
            style={{
                position: "absolute",
                left: position.x - width / 2,
                top: (position.y - width / 2) - calculateOffset(rotation, width),
                width: width,
                height: width,
                borderRadius: frameWidth / 2,
                borderColor: "blue",
                borderWidth: 0,
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
                    transform: [{ rotate: `${rotation}deg` }],
                }}
            >
                <Text
                    style={{
                        fontSize: width * 0.8,
                        userSelect: "none",
                    }}
                >
                    {emoji}
                </Text>
            </View>
        </View>
    );
};

export default Obstacle;
