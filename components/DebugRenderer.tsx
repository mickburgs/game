import React from "react";
import { View, StyleSheet } from "react-native";

const DebugRenderer = ({ bodies }) => {
    return (
        <>
            {bodies.map((body, index) => {
                const circleRadius = body.circleRadius;
                const width = body.bounds.max.x - body.bounds.min.x;
                const height = body.bounds.max.y - body.bounds.min.y;

                if (circleRadius) {
                    return (
                        <View
                            key={index}
                            style={[
                                styles.debugCircle,
                                {
                                    left: body.position.x - circleRadius,
                                    top: body.position.y - circleRadius,
                                    width: circleRadius * 2,
                                    height: circleRadius * 2,
                                    borderRadius: circleRadius, // Make it circular
                                },
                            ]}
                        />
                    );
                }

                return (
                    <View
                        key={index}
                        style={[
                            styles.debugFrame,
                            {
                                left: body.position.x - width / 2,
                                top: body.position.y - height / 2,
                                width: width,
                                height: height,
                                transform: [
                                    { rotate: `${body.angle}rad` }, // Match rotation
                                ],
                            },
                        ]}
                    />
                );
            })}
        </>
    );
};

const styles = StyleSheet.create({
    debugFrame: {
        position: "absolute",
        borderWidth: 2,
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
    },
    debugCircle: {
        position: "absolute",
        borderWidth: 2,
        borderColor: "blue",
    },
});

export default DebugRenderer;