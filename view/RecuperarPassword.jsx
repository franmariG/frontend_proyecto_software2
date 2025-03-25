import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ModalNotificacion from "@/components/ModalNotificacion";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ModalDeCarga from "@/components/ModalDeCarga"; // Importa el componente ModalDeCarga
import { useFonts } from "expo-font";
import url from "@/constants/url";

export default function RecuperarPassword() {
  const navigate = useRouter();
  const [email, setEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resp1, setResp1] = useState("");
  const [resp2, setResp2] = useState("");
  const [verRespuesta1, setVerRespuesta1] = useState(false);
  const [verRespuesta2, setVerRespuesta2] = useState(false);

  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [nuevaPassword, NuevaPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [verNuevaPassword, setVerNuevaPassword] = useState(false);
  const [verConfirmNuevaPassword, setVerConfirmNuevaPassword] = useState(false);
  const [userID, setUserID] = useState("");

  const preguntasSeguridad = [
    "¿Cuál es el nombre de tu primera mascota?",
    "¿Cuál es tu ciudad natal?",
    "¿Cuál es tu comida favorita?",
    "¿Cuál es el nombre de tu escuela primaria?",
  ];

  const [preguntaSeguridad1, setPreguntaSeguridad1] = useState(
    preguntasSeguridad[0]
  );
  const [preguntaSeguridad2, setPreguntaSeguridad2] = useState(
    preguntasSeguridad[1]
  );

  const setDefaultValues = () => {
    setResp1("");
    setResp2("");
    setVerRespuesta1(false);
    setVerRespuesta2(false);
    setShowPasswordReset(false);
    NuevaPassword("");
    setConfirmNewPassword("");
    setVerNuevaPassword(false);
    setVerConfirmNuevaPassword(false);
    setUserID("");
    setPreguntaSeguridad1(preguntasSeguridad[0]);
    setPreguntaSeguridad2(preguntasSeguridad[1]);
  };

  const [fontsLoaded] = useFonts({
    "League-Gothic": require("@/assets/fonts/LeagueGothic-Regular.ttf"),
    "Open-Sans": require("../assets/fonts/OpenSans-Regular.ttf"),
    "OpenSans-Bold": require("../assets/fonts/OpenSans-Bold.ttf"),
    "Helios-Bold": require("../assets/fonts/HeliosExtC-Bold.ttf"),
  });

  // Validar correo
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validarYContinuar = async () => {
    if (!showPasswordReset) {
      const validacionExitosa = await verificarUsuario();
      if (validacionExitosa) {
        setShowPasswordReset(true);
      }
    } else {
      cambiarPassword();
      console.log("Contraseña actualizada");
    }
  };

  const cambiarPassword = async () => {
    if (!nuevaPassword || !confirmNewPassword) {
      setModalMessage("Por favor, completa ambos campos.");
      setModalSuccess(false);
      setModalVisible(true);
      return;
    }

    if (nuevaPassword !== confirmNewPassword) {
      setModalMessage("Las contraseñas no coinciden.");
      setModalSuccess(false);
      setModalVisible(true);
      return;
    }

    if (!userID) {
      setModalMessage("Error: No se encontró el usuario.");
      setModalSuccess(false);
      setModalVisible(true);
      return;
    }

    setLoading(true); // Mostrar el modal de carga

    try {
      const response = await fetch(url + `api/changePassword/${userID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: nuevaPassword }),
      });

      const data = await response.json(); // Obtener la respuesta JSON

      if (response.ok && data.isPasswordChanged) {
        setModalMessage("Contraseña cambiada exitosamente.");
        setModalSuccess(true);
      } else {
        setModalMessage("Error al cambiar la contraseña.");
        setModalSuccess(false);
      }
    } catch (error) {
      console.log("Error en la API:", error);
      setModalMessage("Error de red. Por favor, intenta de nuevo.");
      setModalSuccess(false);
    } finally {
      setLoading(false);
      setModalVisible(true);
    }
  };

  const verificarUsuario = async () => {
    if (!email || !validateEmail(email)) {
      setModalMessage("Por favor, ingresa un correo electrónico válido.");
      setModalSuccess(false);
      setModalVisible(true);
      return;
    }

    if (!resp1 || !resp2) {
      setModalMessage(
        "Por favor, complete todas las preguntas y respuestas de seguridad."
      );
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    if (preguntaSeguridad1 === preguntaSeguridad2) {
      setModalMessage(
        "Por favor, seleccione preguntas de seguridad diferentes."
      );
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    setLoading(true); // Mostrar el modal de carga

    try {
      const response = await fetch(url + "api/forgotPassword", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json(); // Obtener la respuesta JSON

      if (response.ok) {
        if (data.isValidEmail) {
          console.log("Usuario encontrado:", data.user);
          console.log("Correo encontrado:", data.isValidEmail);
          setUserID(data.user._id);
          console.log("USerID:", data.user._id);
          setModalMessage("El correo existe en la base de datos.");
          setModalSuccess(true);
        } else {
          setModalMessage("No se encontró un usuario con este correo.");
          setModalSuccess(false);
        }
      } else {
        setModalMessage("Error en la verificación del correo.");
        setModalSuccess(false);
      }
    } catch (error) {
      console.log("Error en la API:", error);
      setModalMessage("Error de red. Por favor, intenta de nuevo.");
      setModalSuccess(false);
    } finally {
      setModalVisible(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(email);
  }, [email]);

  useEffect(() => {
    console.log(fontsLoaded);
  }, [fontsLoaded]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/logo_recortado.png")}
          style={styles.logoImage}
          contentFit="contain"
        />
        <Text style={styles.logoText}>FOODIGO</Text>
      </View>
      <Text style={styles.title}>RECUPERAR CONTRASEÑA</Text>

      <View style={styles.infoContainer}>
        {!showPasswordReset ? (
          // Primera Vista: Validación de Correo y Preguntas de Seguridad
          <>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Ingresa tu correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <View style={styles.questionContainer}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={preguntaSeguridad1}
                  onValueChange={(itemValue) =>
                    setPreguntaSeguridad1(itemValue)
                  }
                  style={styles.picker}
                >
                  {preguntasSeguridad.map((pregunta, index) => (
                    <Picker.Item
                      key={index}
                      label={pregunta}
                      value={pregunta}
                      style={styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
              <View style={styles.rptaContainer}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Respuesta"
                  value={resp1}
                  onChangeText={setResp1}
                  secureTextEntry={!verRespuesta1}
                  numberOfLines={1}
                  multiline={false}
                  ellipsizeMode="tail"
                  scrollEnabled={true}
                />
                <Pressable
                  onPress={() => setVerRespuesta1(!verRespuesta1)}
                  style={styles.ojoIcono}
                >
                  <Ionicons
                    name={verRespuesta1 ? "eye" : "eye-off"}
                    size={22}
                    color="#777"
                  />
                </Pressable>
              </View>
            </View>
            <View style={styles.questionContainer}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={preguntaSeguridad2}
                  onValueChange={(itemValue) =>
                    setPreguntaSeguridad2(itemValue)
                  }
                  style={styles.picker}
                >
                  {preguntasSeguridad.map((pregunta, index) => (
                    <Picker.Item
                      key={index}
                      label={pregunta}
                      value={pregunta}
                      style={styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
              <View style={styles.rptaContainer}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Respuesta"
                  value={resp2}
                  onChangeText={setResp2}
                  secureTextEntry={!verRespuesta2}
                  numberOfLines={1}
                  multiline={false}
                  ellipsizeMode="tail"
                  scrollEnabled={true}
                />
                <Pressable
                  onPress={() => setVerRespuesta2(!verRespuesta2)}
                  style={styles.ojoIcono}
                >
                  <Ionicons
                    name={verRespuesta2 ? "eye" : "eye-off"}
                    size={22}
                    color="#777"
                  />
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>Nueva Contraseña</Text>
            <View style={styles.rptaContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="Nueva contraseña"
                secureTextEntry={!verNuevaPassword}
                value={nuevaPassword}
                onChangeText={NuevaPassword}
              />
              <Pressable
                onPress={() => setVerNuevaPassword(!verNuevaPassword)}
                style={styles.ojoIconoPassword}
              >
                <Ionicons
                  name={verNuevaPassword ? "eye" : "eye-off"}
                  size={22}
                  color="#777"
                />
              </Pressable>
            </View>

            <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
            <View style={styles.rptaContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="Confirmar contraseña"
                secureTextEntry={!verConfirmNuevaPassword}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
              <Pressable
                onPress={() =>
                  setVerConfirmNuevaPassword(!verConfirmNuevaPassword)
                }
                style={styles.ojoIconoPassword}
              >
                <Ionicons
                  name={verConfirmNuevaPassword ? "eye" : "eye-off"}
                  size={22}
                  color="#777"
                />
              </Pressable>
            </View>
          </>
        )}
      </View>

      <View style={styles.botonCont}>
        <Pressable
          style={styles.cancelarBoton}
          onPress={() => navigate.push("/")}
        >
          <Text style={styles.cancelarTexto}>Cancelar</Text>
        </Pressable>
        <Pressable
          onPress={() => validarYContinuar()}
          style={styles.aceptarBoton}
        >
          <Text style={styles.aceptarTexto}>
            {showPasswordReset ? "Aceptar" : "Validar"}
          </Text>
        </Pressable>
      </View>

      <ModalNotificacion
        isVisible={modalVisible}
        isSuccess={modalSuccess}
        message={modalMessage}
        onClose={() => {
          setModalVisible(false);
          if (modalSuccess) {
            if (!showPasswordReset) {
              setShowPasswordReset(true);
            } else {
              setDefaultValues();
              navigate.replace("/"); // Solo redirige si ya está en la pantalla de cambiar contraseña
            }
          }
        }}
      />
      <ModalDeCarga visible={loading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 50,
    backgroundColor: "#fff",
  },
  logoImage: {
    width: "13%",
    height: "71%",
    resizeMode: "contain",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingBottom: 20,
    paddingTop: 20,
  },
  logoText: {
    color: "#000",
    fontFamily: "League-Gothic",
    fontSize: 90,
    textShadowColor: "#808080",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    letterSpacing: -1,
  },
  title: {
    fontFamily: "Open-Sans",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#0056b3",
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "bold",
    marginTop: 20,
  },
  botonCont: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelarBoton: {
    backgroundColor: "#fff",
    padding: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#b9b4b1",
  },
  aceptarBoton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#b9b4b1",
    flex: 1,
    alignItems: "center",
  },
  cancelarTexto: {
    color: "#333",
    fontWeight: "bold",
  },
  aceptarTexto: {
    color: "#fff",
    fontWeight: "bold",
  },

  rptaContainer: {
    marginTop: 5,
    marginBottom: 5,
    justifyContent: "center",
  },

  questionContainer: {
    marginTop: 20,
  },
  infoContainer: {
    marginTop: 10,
    margingBottom: 20,
  },

  inputField: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#b9b4b1",
    width: "90%",
  },
  picker: {
    color: "#4f504e",
    backgroundColor: "transparent",
    width: "100%",
    fontFamily: "Open-Sans",
    fontSize: 14,
  },
  pickerItem: {
    fontFamily: "Open-Sans",
    fontSize: 14,
    width: "100%",
    color: "#000",
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#cfcfc4",
    borderRadius: 10,
    overflow: "hidden",
    height: 40,
    justifyContent: "center",
    marginBottom: 10,
  },
  ojoIcono: {
    position: "absolute",
    right: 10,
  },

  ojoIconoPassword: {
    position: "absolute",
    right: 10,
  },
});
