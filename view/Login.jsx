import React, { useEffect, useState } from "react"; // Asegúrate de importar useState

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ImageBackground,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import Entypo from "@expo/vector-icons/Entypo";
import { useCookies } from "react-cookie";
import ModalNotificacion from "@/components/ModalNotificacion";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ModalDeCarga from "@/components/ModalDeCarga"; // Importa el componente ModalDeCarga
import { useFonts } from "expo-font";
import url from "@/constants/url";
import { set } from "react-hook-form";

export default function Login() {
  const navigate = useRouter();
  const [verContraseña, setVerContraseña] = React.useState(false);
  const [correoFocused, setCorreoFocused] = React.useState(false);
  const [PasswordFocused, setPasswordFocused] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [cookies, setCookie] = useCookies(["token"]);
  const [modalVisible, setModalVisible] = React.useState(false); // Estado para el modal
  const [modalMessage, setModalMessage] = React.useState(""); // Mensaje del modal
  const [modalSuccess, setModalSuccess] = React.useState(false); // Éxito del modal
  const [loading, setLoading] = React.useState(false); // Estado para el modal de carga

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar el correo
    return re.test(String(email).toLowerCase());
  };

  const [fontsLoaded] = useFonts({
    "League-Gothic": require("@/assets/fonts/LeagueGothic-Regular.ttf"),
    "Open-Sans": require("../assets/fonts/OpenSans-Regular.ttf"),
    "OpenSans-Bold": require("../assets/fonts/OpenSans-Bold.ttf"),
    "Helios-Bold": require("../assets/fonts/HeliosExtC-Bold.ttf"),
  });

  if (!fontsLoaded) {
    console.log("no cargado");
  }

  const iniciarSesion = async () => {
    // Validaciones
    if (!email || !validateEmail(email)) {
      setModalMessage("Por favor, ingresa un correo electrónico válido.");
      setModalSuccess(false);
      setModalVisible(true);
      return;
    }

    if (!password) {
      setModalMessage("La contraseña no puede estar vacía.");
      setModalSuccess(false);
      setModalVisible(true);
      return;
    }

    setLoading(true); // Mostrar el modal de carga

    try {
      const response = await fetch(url + "api/login", {
        method: "POST",
        body: JSON.stringify({
          email: email, // Usar el email ingresado
          password: password, // Usar la contraseña ingresada
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        try {
          await AsyncStorage.setItem("token", data.token);
          console.log(data);
          setModalMessage("Inicio de sesión exitoso."); // Mensaje de éxito
          setModalSuccess(true); // Indicar que la operación fue exitosa
          setModalVisible(true);
        } catch (error) {
          console.log(error);
          setModalMessage("Error en el inicio de sesión."); // Mensaje de error
          setModalSuccess(false); // Indicar que hubo un error
          setModalVisible(true);
          return;
        }
      } else if (response.status == 404) {
        setModalMessage("El usuario ha sido baneado.");
        setModalSuccess(false);
        setModalVisible(true);
      } else {
        const errorData = await response.json();
        //console.error("Error en el login:", errorData);
        setModalMessage(
          "Error en el inicio de sesión. Compruebe su correo electrónico y contraseña"
        ); // Mensaje de error
        setModalSuccess(false); // Indicar que hubo un error
        setModalVisible(true);
        console.log(errorData);
        console.log(response);
      }
    } catch (error) {
      //console.error("Error de red:", error);
      setModalMessage("Error de red. Por favor, intenta de nuevo."); // Mensaje de error
      setModalSuccess(false); // Indicar que hubo un error
      setModalVisible(true);
      console.log(error);
    } finally {
      setLoading(false); // Ocultar el modal de carga
    }
  };

  useEffect(() => {
    console.log(email);
  }, [email]);

  useEffect(() => {
    console.log(fontsLoaded);
  }, [fontsLoaded]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("@/assets/images/iniciar_sesion.png")}
        style={styles.backgroundImage}
      />
      <View
        style={{
          height: "100%",
          flex: 1,
          width: "100%",
          gap: 15,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo_recortado.png")}
            style={styles.logoImage}
            contentFit="contain"
          />
          <Text style={styles.logoText}>FOODIGO</Text>
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>INICIAR SESIÓN</Text>
          <View style={{ flexDirection: "column", gap: 15, width: "100%" }}>
            <TextInput
              placeholderTextColor={"#acacac"}
              style={[styles.textInput, correoFocused && { outline: "none" }]}
              placeholder="Correo electrónico"
              onFocus={() => {
                setCorreoFocused(true);
              }}
              onBlur={() => {
                setCorreoFocused(false);
              }}
              value={email}
              onChangeText={(value) => setEmail(value)}
            />
            <View
              style={{
                width: "100%",
                justifyContent: "center",
              }}
            >
              <TextInput
                placeholderTextColor={"#acacac"}
                style={[
                  styles.textInput,
                  { paddingRight: 40 },
                  PasswordFocused && { outline: "none" },
                ]}
                placeholder="Contraseña"
                onFocus={() => {
                  setPasswordFocused(true);
                }}
                onBlur={() => {
                  setPasswordFocused(false);
                }}
                secureTextEntry={!verContraseña}
                value={password}
                onChangeText={(value) => setPassword(value)}
              />
              {verContraseña ? (
                <Pressable
                  onPress={() => setVerContraseña(false)}
                  style={{ position: "absolute", right: 10 }}
                >
                  <Entypo name="eye-with-line" size={24} color="white" />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => setVerContraseña(true)}
                  style={{ position: "absolute", right: 10 }}
                >
                  <Entypo name="eye" size={24} color="white" />
                </Pressable>
              )}
            </View>
            <View style={{ paddingBottom: 40, paddingVertical: 15 }}>
              <Link
                style={{
                  fontSize: 11,
                  color: Colors.white,
                  textDecorationLine: "underline",
                  textAlign: "right",
                }}
                href={"/recuperarcontrasena"}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 25,
              width: "100%",
            }}
          >
            <Pressable
              onPress={() => {
                navigate.replace("/");
              }}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: pressed ? Colors.lightGray : "#8c0e03",
                  backgroundColor: "#5a1a12",
                },
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={28}
                color="white"
                style={styles.icon}
              />
              <Text style={styles.textButton}>VOLVER</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: pressed ? Colors.lightGray : "#8c0e03",
                },
              ]}
              onPress={() => iniciarSesion()}
            >
              <Text style={styles.textButton}>SIGUIENTE</Text>
              <Ionicons
                name="arrow-forward"
                size={28}
                color="white"
                style={styles.icon}
              />
            </Pressable>
          </View>
        </View>
      </View>
      <ModalNotificacion
        isVisible={modalVisible}
        isSuccess={modalSuccess}
        message={modalMessage}
        onClose={() => {
          setModalVisible(false);
          if (modalSuccess) {
            navigate.replace("/mainpage"); // Redirigir solo si la autenticación fue exitosa
          }
        }}
      />
      <ModalDeCarga visible={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#8c0e03", // Custom red color
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 0.8,
    borderColor: "white",
    borderStyle: "dashed",
  },
  textButton: {
    color: Colors.white,
    textTransform: "uppercase",
    fontWeight: "bold",
    fontFamily: "Helios Extended",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "column",
    alignItems: "center",
    gap: 25,
    padding: 30,
    width: "75%",
    justifyContent: "center",
  },
  textInput: {
    color: Colors.white,
    backgroundColor: "transparent",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: Colors.white,
    paddingLeft: 15,
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 15,
    fontFamily: "Open Sans",
    outline: "none",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.white,
    fontFamily: "Helios-Bold",
    textAlign: "left",
    width: "100%",
    letterSpacing: 0.7,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoImage: {
    width: "13%",
    height: "71%",
    resizeMode: "contain",
  },
  logoText: {
    color: "#FFF",
    fontFamily: "League-Gothic",
    fontSize: 90,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    position: "absolute",
  },
});
