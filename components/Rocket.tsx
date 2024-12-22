import React from 'react';
import { View, Text } from 'react-native';

const Rocket = ({ body }: any) => {
    const { position } = body;
    const collisionWidth = 40;
    const collisionHeight = 20;

    return (
        <View
            style={{
                position: "absolute",
                left: position.x - collisionWidth / 2,
                top: position.y - collisionHeight / 2,
                width: collisionWidth,
                height: collisionHeight,
                borderColor: "red", // Red border for collision frame
                borderWidth: 2, // Border thickness
                overflow: "visible", // Ensure the rocket is visible outside the collision frame
                zIndex: 1, // Ensure visibility above other elements
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <View
                style={{
                    position: "absolute", // Independent positioning for the rocket
                    width: 40,
                    height: 40,
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "visible", // Ensure the rocket is not clipped
                    transform: [{ rotate: "45deg" }], // Rotate the rocket
                }}
            >
                <Text
                    style={{
                        fontSize: 40, // Size of the rocket emoji
                        userSelect: "none", // Prevent text selection
                    }}
                >
                    🚀
                </Text>
            </View>
        </View>
    );
};

export default Rocket;