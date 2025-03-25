import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  Dimensions,
  Animated,
  useAnimatedValue,
} from "react-native";
import { DeviceMotion } from "expo-sensors";
import * as Font from "expo-font";
import { Tab, TabView } from "@rneui/themed";
import Icon from "@expo/vector-icons/FontAwesome";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import PlaceholderText from "../PlaceholderText";
import PlaceholderFoto from "../PlaceHolderFoto";
import * as Location from "expo-location";
import { set } from "react-hook-form";

const useHeading = (interval = 500) => {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    DeviceMotion.setUpdateInterval(interval)
    let deviceMotionSubscription = DeviceMotion.addListener(({ rotation }) => {
      // Extract rotation data
      const { alpha } = rotation;

      // Calculate heading
      let calculatedHeading = 360 - (alpha * 180) / Math.PI;
      if (calculatedHeading < 0) {
        calculatedHeading += 360;
      }
      if (calculatedHeading > 360) {
        calculatedHeading -= 360;
      }

      setHeading(parseInt(calculatedHeading));
    });

    return () => {
      deviceMotionSubscription && deviceMotionSubscription.remove();
    };
  }, [interval]);

  return heading;
};

export default function TabDescripcion({ latitude, longitude }) {
  const heading = useHeading(2000);
  const anguloAnimacion = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(anguloAnimacion, {
      toValue: heading,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    console.log(heading);
  }, [heading]);

  return (
    <TabView.Item>
      <Animated.View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: Dimensions.get("window").width - 20,
          height: "100%",
          borderWidth: 1,
          transform: [
            {
              rotate: heading
                ? anguloAnimacion.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  })
                : "0deg",
            },
          ],
        }}
      >
        <View
          style={{
            aspectRatio: 1,
            height: 250,
            borderWidth: 1,
            flexDirection: "row",
          }}
        >
          <View
            style={{
              height: "100%",
              justifyContent: "center",
              borderWidth: 1,
              width: 25,
            }}
          >
            <Text
              style={{
                transform: [{ rotate: "-90deg" }],
                width: 49,
                borderWidth: 1,
                position: "absolute",
                left: -13,
                fontSize: 18,
              }}
            >
              Oeste
            </Text>
          </View>
          <View style={{ height: "100%", borderWidth: 1, flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                borderWidth: 1,
                textAlign: "center",
              }}
            >
              Norte
            </Text>
            <View style={{ flex: 1, padding: 20 }}>
              <View
                style={{
                  flex: 1,
                  borderWidth: 1,
                  height: "100%",
                  borderRadius: 200,
                }}
              ></View>
            </View>
            <Text
              style={{
                fontSize: 18,
                borderWidth: 1,
                textAlign: "center",
                transform: [{ rotate: "180deg" }],
              }}
            >
              Sur
            </Text>
          </View>
          <View
            style={{
              height: "100%",
              justifyContent: "center",
              borderWidth: 1,
              width: 26,
            }}
          >
            <Text
              style={{
                transform: [{ rotate: "90deg" }],
                width: 38,
                borderWidth: 1,
                position: "absolute",
                left: -7,
                fontSize: 18,
              }}
            >
              Este
            </Text>
          </View>
        </View>
      </Animated.View>
    </TabView.Item>
  );
}
