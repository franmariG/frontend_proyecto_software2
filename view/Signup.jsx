import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import Entypo from "@expo/vector-icons/Entypo";
import * as ImagePicker from "expo-image-picker";
import Notificacion from "@/components/ModalNotificacion";
import { useFetch } from "../utils/fetch/useFetch";
import endpoints from "../utils/fetch/endpoints-importantes.json";
import Arrow from "@/components/Arrow";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import ModalDeCarga from "@/components/ModalDeCarga";
import url from "@/constants/url";

export default function Signup() {
  const router = useRouter();

  //Handle verPassword
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmarPassword, setVerConfirmarPassword] = useState(false);

  //Handle onfocus
  const [nombreFocused, setNombreFocused] = React.useState(false);
  const [correoFocused, setCorreoFocused] = React.useState(false);
  const [PasswordFocused, setPasswordFocused] = React.useState(false);
  const [confirmarPasswordFocused, setConfirmarPasswordFocused] =
    React.useState(false);

  const [loadingModalVisible, setLoadingModalVisible] = useState(false);

  //Handle preview
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Estados para el formulario y userData
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    fotoPerfil: "",
    description: "",
    preguntasDeSeguridad: [
      {
        pregunta: "",
        respuesta: "",
      },
      {
        pregunta: "",
        respuesta: "",
      },
    ],
  });

  const handleInputChange = (name, value) => {
    setUserData({ ...userData, [name]: value });
  };

  const preguntasSeguridad = [
    "¿Cuál es el nombre de tu primera mascota?",
    "¿Cuál es tu ciudad natal?",
    "¿Cuál es tu comida favorita?",
    "¿Cuál es el nombre de tu escuela primaria?",
  ];

  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal
  const [modalMessage, setModalMessage] = useState(""); // Mensaje del modal
  const [modalSuccess, setModalSuccess] = useState(false); // Éxito del modal

  const [preguntaSeguridad1, setPreguntaSeguridad1] = useState(
    preguntasSeguridad[0]
  );
  const [respuestaSeguridad1, setRespuestaSeguridad1] = useState("");
  const [preguntaSeguridad2, setPreguntaSeguridad2] = useState(
    preguntasSeguridad[1]
  );
  const [respuestaSeguridad2, setRespuestaSeguridad2] = useState("");

  const { data, loading, error, fetchData } = useFetch();
  const {
    data: emailValidationData,
    loading: emailValidationLoading,
    error: emailValidationError,
    fetchData: validateEmail,
  } = useFetch();

  const validarFormulario = async () => {
    if (!userData.name) {
      setModalMessage("El nombre de usuario es obligatorio.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    if (userData.name.length < 3) {
      setModalMessage("El nombre de usuario debe tener al menos 3 caracteres.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    if (!userData.email) {
      setModalMessage("El correo electrónico es obligatorio.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    // Validación de formato de correo electrónico (usando una expresión regular)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setModalMessage("El correo electrónico no tiene un formato válido.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    if (userData.email.length > 50) {
      setModalMessage(
        "El correo electrónico debe tener menos de 50 caracteres."
      );
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    if (!userData.fotoPerfil) {
      setModalMessage("Es necesario que suba una foto de perfil");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    if (!userData.password) {
      setModalMessage("La contraseña es obligatoria.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    // Validación de longitud mínima de contraseña
    if (userData.password.length < 4) {
      setModalMessage("La contraseña debe tener al menos 4 caracteres.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    if (userData.password.length > 15) {
      setModalMessage("La contraseña debe tener menos de 15 caracteres.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    if (userData.password !== userData.confirmPassword) {
      setModalMessage("Las contraseñas no coinciden.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }

    if (!respuestaSeguridad1 || !respuestaSeguridad2) {
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

    //   SE ALCANZO EL LIMITE DE LA PRUEBA GRATUITA
    //  VALIDACION DESABILITADA TEMPORALMENTE

    // setLoadingModalVisible(true);

    // const emailValidationUrl = `https://emailverification.whoisxmlapi.com/api/v3?apiKey=at_iFCVm77T67rg3vK28nnSUdCUNkpwW&emailAddress=${userData.email}`;
    // const emailValidationOptions = {
    //   method: "GET",
    //   headers: { accept: "application/json" },
    // };

    // await validateEmail(emailValidationUrl, emailValidationOptions);

    // if (emailValidationError) {
    //   setModalMessage(
    //     "Error al validar el correo electrónico: " +
    //       (emailValidationError.message || "Error desconocido")
    //   );
    //   setModalSuccess(false);
    //   setModalVisible(true);
    //   setLoadingModalVisible(false);
    //   return false;
    // }

    // if (emailValidationData && emailValidationData.smtpCheck !== "true") {
    //   setModalMessage("El correo electrónico no existe o no es válido.");
    //   setModalSuccess(false);
    //   setModalVisible(true);
    //   setLoadingModalVisible(false);
    //   return false;
    // }

    return true;
  };

  const updatePreguntasUserData = async () => {
    setUserData({
      ...userData,
      preguntasDeSeguridad: [
        { pregunta: preguntaSeguridad1, respuesta: respuestaSeguridad1 },
        { pregunta: preguntaSeguridad2, respuesta: respuestaSeguridad2 },
      ],
    });
    return true;
  };

  const seleccionarImagen = async () => {
    // Pedir permiso de acceso a la galería
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Se requiere permiso para acceder a la galería.");
      return;
    }

    // Abrir la galería
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      base64: true,
      quality: 0.6, // Calidad de la imagen (1 = máxima calidad)
      allowsMultipleSelection: false,
    });

    // Si el usuario no cancela, guardar la imagen seleccionada
    if (!resultado.canceled) {
      setSelectedImage(resultado.assets[0]); // Guarda la imagen seleccionada
      setPreviewVisible(true);
    }
  };

  const aceptarImagen = () => {
    const fotoPerfilBase64 = `data:${selectedImage.mimeType};base64,${selectedImage.base64}`;
    setUserData({ ...userData, fotoPerfil: fotoPerfilBase64 });
    setPreviewVisible(false);
  };

  const rechazarImagen = () => {
    setSelectedImage(null);
    setPreviewVisible(false);
  };

  const handleSignup = async () => {
    if (!(await validarFormulario())) {
      console.log(userData);
      return;
    }

    if (!(await updatePreguntasUserData())) {
      return;
    }

    setLoadingModalVisible(true);

    await fetchData(url + "api/createUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  };

  const saveToken = async (value) => {
    try {
      await AsyncStorage.setItem("token", value);
      console.log("Token guardado correctamente");
    } catch (e) {
      console.log("Error al guardar el token:", e);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (emailValidationLoading) return;

    setLoadingModalVisible(false);

    if (error) {
      setModalMessage(error.message || "Error al crear usuario.");
      setModalSuccess(false);
      setModalVisible(true);
    } else if (data) {
      setModalMessage("Usuario creado correctamente.");
      setModalSuccess(true);
      setModalVisible(true);
      setUserData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        fotoPerfil: "",
        description: "",
        preguntasDeSeguridad: [
          {
            pregunta: "",
            respuesta: "",
          },
          {
            pregunta: "",
            respuesta: "",
          },
        ],
      });
      saveToken(data.token);
    }
  }, [loading, error, data]);

  const Signup = () => {
    router.replace("mainpage");
  };

  const closeModal = () => {
    setModalVisible(false);
    if (modalSuccess) {
      Signup();
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/registrarse (2).png")}
      style={styles.imageBackground}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/logo_recortado.png")}
          style={styles.logoImage}
        />
        <Text style={styles.logoText}>FOODIGO</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.titulo}>Registrarse</Text>
          <View style={styles.textInputContainer}>
            <TextInput
              placeholderTextColor={"#acacac"}
              style={[styles.textInput, nombreFocused && styles.inputFocused]}
              placeholder="Nombre Del Usuario"
              value={userData.name}
              onFocus={() => setNombreFocused(true)}
              onBlur={() => setNombreFocused(false)}
              onChangeText={(value) => handleInputChange("name", value)}
            />
            <Text style={styles.flag}>*</Text>
          </View>
          <View style={styles.textInputContainer}>
            <TextInput
              placeholderTextColor={"#acacac"}
              style={[styles.textInput, correoFocused && styles.inputFocused]}
              value={userData.email}
              placeholder="Correo"
              onFocus={() => setCorreoFocused(true)}
              onBlur={() => setCorreoFocused(false)}
              onChangeText={(value) => handleInputChange("email", value)}
            />
            <Text style={styles.flag}>*</Text>
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholderTextColor={"#acacac"}
              style={[
                styles.textInput,
                styles.passwordInput,
                PasswordFocused && styles.inputFocused,
              ]}
              placeholder="Contraseña"
              secureTextEntry={!verPassword}
              value={userData.password}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              onChangeText={(value) => handleInputChange("password", value)}
            />
            <Text style={styles.flag}>*</Text>
            {verPassword ? (
              <Pressable
                onPress={() => setVerPassword(false)}
                style={styles.eyeIcon}
              >
                <Entypo name="eye-with-line" size={24} color="#fff" />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setVerPassword(true)}
                style={styles.eyeIcon}
              >
                <Entypo name="eye" size={24} color="#fff" />
              </Pressable>
            )}
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholderTextColor={"#acacac"}
              style={[
                styles.textInput,
                styles.passwordInput,
                confirmarPasswordFocused && styles.inputFocused,
              ]}
              placeholder="Confirmar Contraseña"
              secureTextEntry={!verConfirmarPassword}
              value={userData.confirmPassword}
              onFocus={() => setConfirmarPasswordFocused(true)}
              onBlur={() => setConfirmarPasswordFocused(false)}
              onChangeText={(value) =>
                handleInputChange("confirmPassword", value)
              }
            />
            <Text style={styles.flag}>*</Text>
            {verConfirmarPassword ? (
              <Pressable
                onPress={() => setVerConfirmarPassword(false)}
                style={styles.eyeIcon}
              >
                <Entypo name="eye-with-line" size={24} color="#fff" />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setVerConfirmarPassword(true)}
                style={styles.eyeIcon}
              >
                <Entypo name="eye" size={24} color="#fff" />
              </Pressable>
            )}
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={preguntaSeguridad1}
              onValueChange={(itemValue) => setPreguntaSeguridad1(itemValue)}
              style={styles.picker}
              dropdownIconColor={Colors.lightGray}
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
          <View style={styles.textInputContainer}>
            <TextInput
              placeholderTextColor={"#acacac"}
              style={styles.textInput}
              placeholder="Respuesta"
              value={respuestaSeguridad1}
              onChangeText={(value) => setRespuestaSeguridad1(value)}
            />
            <Text style={styles.flag}>*</Text>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={preguntaSeguridad2}
              onValueChange={(itemValue) => setPreguntaSeguridad2(itemValue)}
              style={styles.picker}
              dropdownIconColor={Colors.lightGray}
              itemStyle={styles.pickerItem}
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
          <View style={styles.textInputContainer}>
            <TextInput
              placeholderTextColor={"#acacac"}
              style={styles.textInput}
              placeholder="Respuesta"
              value={respuestaSeguridad2}
              onChangeText={(value) => setRespuestaSeguridad2(value)}
            />
            <Text style={styles.flag}>*</Text>
          </View>
        </View>

        <Pressable
          onPress={() => seleccionarImagen()}
          style={({ pressed }) => [
            styles.button,
            styles.buttonWithIcon,
            pressed && { backgroundColor: Colors.primary },
          ]}
        >
          <Text style={[styles.textButton, { color: Colors.white }]}>
            Subir foto
          </Text>
          <Entypo
            name="camera"
            size={24}
            color={Colors.white}
            style={styles.buttonIcon}
          />
        </Pressable>

        <View style={styles.buttonGroup}>
          <Pressable
            onPress={() => router.replace("/")}
            style={({ pressed }) => [
              styles.buttonWithIcon,
              { padding: 15, borderRadius: 10 },
              { backgroundColor: Colors.vinoDark },
              pressed && { backgroundColor: Colors.vino },
            ]}
          >
            <Text
              style={[
                styles.textButton,
                { color: Colors.white, marginLeft: 30 },
              ]}
            >
              Volver
            </Text>
            <View
              style={{
                left: 15,
                position: "absolute",
                transform: [{ rotate: "180deg" }],
              }}
            >
              <Arrow />
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.buttonWithIcon,
              { backgroundColor: Colors.vino },
              { padding: 15, borderRadius: 10 },
              pressed && { backgroundColor: Colors.vinoDark },
            ]}
            onPress={() => handleSignup()}
          >
            <Text
              style={[
                styles.textButton,
                { color: Colors.white, marginRight: 30 },
              ]}
            >
              Aceptar
            </Text>
            <View style={{ right: 15, position: "absolute" }}>
              <Arrow />
            </View>
          </Pressable>
        </View>
      </View>
      <Notificacion
        isVisible={modalVisible}
        isSuccess={modalSuccess}
        message={modalMessage}
        onClose={closeModal}
      />
      <ModalDeCarga visible={loadingModalVisible} />
      {previewVisible && (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: selectedImage.uri }}
            style={styles.fotoPerfil}
          />
          <View style={styles.previewButtons}>
            <Pressable
              onPress={aceptarImagen}
              style={({ pressed }) => [
                styles.previewButton,
                { backgroundColor: Colors.blue },
                pressed && { backgroundColor: Colors.primary },
              ]}
            >
              <Text style={styles.previewButtonText}>Aceptar</Text>
            </Pressable>
            <Pressable
              onPress={rechazarImagen}
              style={({ pressed }) => [
                styles.previewButton,
                { backgroundColor: Colors.vino },
                pressed && { backgroundColor: Colors.vinoDark },
              ]}
            >
              <Text style={styles.previewButtonText}>Rechazar</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflowY: "scroll",
    maxHeight: 1000,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    marginLeft: 20,
  },
  logoImage: {
    width: "12%",
    height: "70%",
    resizeMode: "contain",
  },
  logoText: {
    color: "#FFF",
    fontFamily: "League-Gothic",
    fontSize: 70,
  },
  container: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0, 0.6)",
    padding: 20,
    width: "90%",
    gap: 10,
    borderRadius: 5,
  },
  inputContainer: {
    flexDirection: "column",
    width: "100%",
    gap: 5,
  },
  titulo: {
    color: Colors.white,
    fontFamily: "Helios-Bold",
    fontSize: 24,
  },
  textInput: {
    fontFamily: "Open-sans",
    width: "100%",
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomColor: Colors.white,
    borderBottomWidth: 1,
    backgroundColor: "transparent",
    color: Colors.white,
    fontSize: 14,
  },
  textInputContainer: {
    margin: 0,
    padding: 0,
    width: "100%",
    maxHeight: 40,
  },
  flag: {
    color: Colors.lightGray,
    position: "absolute",
    right: 5,
    bottom: 0,
  },
  passwordContainer: {
    justifyContent: "center",
    margin: 0,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
  },
  picker: {
    color: Colors.lightGray,
    backgroundColor: "transparent",
    width: "100%",
    fontFamily: "Open-sans",
    fontSize: 14,
  },
  pickerItem: {
    fontFamily: "Open-sans",
    fontSize: 14,
    width: "100%",
    color: Colors.black,
  },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    overflow: "hidden",
    height: 40,
    justifyContent: "center",
  },
  button: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    boxShadow: "6px 6px 10px rgba(0, 0, 0, 0.6)",
    borderWidth: 2,
    borderColor: Colors.white,
    borderStyle: "dashed",
  },
  buttonWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue,
    borderWidth: 0.8,
    borderColor: Colors.white,
    borderStyle: "dashed",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  textButton: {
    fontFamily: "Open-sans",
    textAlign: "center",
    color: Colors.primary,
    textTransform: "uppercase",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  buttonIcon: {
    paddingLeft: 5,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 25,
    width: "100%",
    marginTop: 10,
  },
  fotoPerfil: {
    width: 400,
    height: 400,
    borderRadius: "100%",
  },
  previewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewButtons: {
    flexDirection: "row",
    marginTop: 20,
  },
  previewButton: {
    backgroundColor: Colors.blue,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  previewButtonText: {
    color: Colors.white,
  },
});
