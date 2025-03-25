import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import Colors from "@/constants/Colors";
import Arrow from "@/components/Arrow";
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderRadius: 6,
    width: "100%",
    height: 35,
    borderWidth: .8,
    borderColor: Colors.white,
    borderStyle: "dashed",
  },
  textButton: {
    color: Colors.white,
    textTransform: "uppercase",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  container: {
    margin: 0,
    padding: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    position: "absolute",
  },
  containerButton: {
    margin: 0,
    padding: 0,
    width: 150,
    height: "100%",
    gap: 18,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 70,
  },
});

export default function Login() {
  const getToken = async () => {
    try {
      const value = await AsyncStorage.getItem('token');
      if (value !== null) {
        router.replace("mainpage");
      }
    } catch (e) {
      console.log(e)
    }
  };
  useEffect(() => {
    getToken();
  }, [])

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, height: "100%" }}>
          <View style={{ flex: 1, height: "100%" }}>
            <ImageBackground
              source={require("../assets/images/pantalla_principal.png")}
              resizeMode="stretch"
              style={styles.container}
            >
              <View style={styles.containerButton}>
                <Pressable
                  onPress={() => router.replace("login")}
                  style={{ ...styles.button, backgroundColor: "#850901" }}
                >
                  <Text style={{ ...styles.textButton, marginHorizontal: 10 }}>
                    INICIAR SESIÓN
                  </Text>
                  <View style={{ right: 5, position: "absolute" }}>
                    <Arrow />
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => router.replace("signup")}
                  style={{ ...styles.button, backgroundColor: "#5a1a11" }}
                >
                  <Text style={{ ...styles.textButton, marginHorizontal: 15 }}>
                    REGISTRARSE
                  </Text>
                  <View style={{ right: 5, position: "absolute" }}>
                    <Arrow />
                  </View>
                </Pressable>
              </View>
            </ImageBackground>
          </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
