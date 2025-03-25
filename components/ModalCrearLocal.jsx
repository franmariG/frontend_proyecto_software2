import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { jwtDecode as decode } from "jwt-decode";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import ModalDeCarga from "../components/ModalDeCarga"; // Importar el modal de carga
import AsyncStorage from "@react-native-async-storage/async-storage";
import url from "@/constants/url";

export default function ModalCrearLocal({ visible, onClose, onSuccess }) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [coordenadas, setCoordenadas] = useState({
    latitude: "",
    longitude: "",
  });
  const [imagenPrincipal, setImagenPrincipal] = useState(null);
  const [imagenesSecundarias, setImagenesSecundarias] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [loading, setLoading] = useState(false);
  const [botonHabilitado, setBotonHabilitado] = useState(false);
  const [botonTextHabilitado, setBotonTextHabilitado] = useState(false);

  const getToken = async () => {
    try {
      const value = await AsyncStorage.getItem("token");
      if (value != null) {
        return value;
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  const getUserId = async () => {
    const token = await getToken();
    if (!token) return null;

    const decoded = decode(token);
    return decoded.sub;
  };

  const validarInputs = () => {
    const coordenadasRegex = /^-?\d+(\.\d+)?$/; // Permite números positivos, negativos y decimales

    if (!nombre.trim()) {
      onSuccess("El campo Nombre es obligatorio.", false);
      return false;
    }
    if (!descripcion.trim()) {
      onSuccess("El campo Descripción es obligatorio.", false);
      return false;
    }
    if (!ubicacion.trim()) {
      onSuccess("El campo Ubicación es obligatorio.", false);
      return false;
    }
    if (!coordenadas.latitude.trim() || !coordenadas.longitude.trim()) {
      onSuccess("Debe ingresar las coordenadas para continuar.", false);
      return false;
    }
    if (
      !coordenadasRegex.test(coordenadas.latitude) ||
      !coordenadasRegex.test(coordenadas.longitude)
    ) {
      onSuccess("Debe ingresar coordenadas numéricas.", false);
      return false;
    }
    if (
      parseFloat(coordenadas.latitude) === 0 ||
      parseFloat(coordenadas.longitude) === 0
    ) {
      onSuccess("Las coordenadas no pueden ser 0.", false);
      return false;
    }
    if (imagenPrincipal === null) {
      onSuccess("Debe tomar una foto para continuar.", false);
      return false;
    }

    return true; // Si todo está bien, retorna true
  };

  useEffect(() => {
    const coordenadasRegex = /^-?\d+(\.\d+)?$/; // Permite números positivos, negativos y decimales
    if (
      !nombre.trim() ||
      !descripcion.trim() ||
      !ubicacion.trim() ||
      !coordenadas.latitude.trim() ||
      !coordenadas.longitude.trim() ||
      imagenPrincipal === null ||
      parseFloat(coordenadas.latitude) === 0 ||
      parseFloat(coordenadas.longitude) === 0 ||
      !coordenadasRegex.test(coordenadas.latitude) ||
      !coordenadasRegex.test(coordenadas.longitude)
    ) {
      setBotonHabilitado(true);
      setBotonTextHabilitado(true);
    } else {
      setBotonHabilitado(false);
      setBotonTextHabilitado(false);
    }
    console.log(botonHabilitado);
  }, [nombre, descripcion, ubicacion, coordenadas, imagenPrincipal]);

  const handleCrearLocal = async () => {
    if (!validarInputs()) return; // Si falla la validación, no ejecuta la petición

    setLoading(true); // Mostrar la pantalla de carga

    const userId = getUserId(); // Obtiene el ID del usuario desde el token
    if (!userId) {
      alert("Error: No se pudo obtener el usuario. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }
    const response = await fetch(url + "api/createRestaurant", {
      method: "POST",
      body: JSON.stringify({
        name: nombre,
        own: userId,
        fotoPerfil: imagenPrincipal,
        description: descripcion,
        etiquetas: etiquetas,
        address: ubicacion,
        latitude: parseFloat(coordenadas.latitude), // Convertir a número si es string
        longitude: parseFloat(coordenadas.longitude),
        viewed: 0, // Inicialmente en 0
        reviews: [], // Iniciar con un array vacío
        fotos: imagenesSecundarias,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (await getToken()),
      },
    });

    setLoading(false);

    if (response.status === 200) {
      const result = await response.json();
      onSuccess("Local creado correctamente.", true);
      setNombre("");
      setDescripcion("");
      setUbicacion("");
      setCoordenadas({ latitude: "", longitude: "" });
      setImagenPrincipal(null);
      setImagenesSecundarias([]);
      setEtiquetas([]);
    } else {
      onSuccess("Error al crear local. Inténtalo de nuevo.", false);
    }
  };

  const handleCancelar = () => {
    setNombre("");
    setDescripcion("");
    setUbicacion("");
    setCoordenadas({ latitude: "", longitude: "" });
    setImagenPrincipal(null);
    setImagenesSecundarias([]);
    setEtiquetas([]);
    onClose();
  };

  const getCoordenadas = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permiso denegado para acceder a la ubicación");
      return;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    setCoordenadas({
      latitude: location.coords.latitude.toString(),
      longitude: location.coords.longitude.toString(),
    });
  };

  const tomarFoto = async (tipo) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Se requiere permiso para acceder a la galería.");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      base64: true,
      quality: 0.4,
    });

    if (!resultado.canceled) {
      const nuevaFoto = `data:image/jpeg;base64,${resultado.assets[0].base64}`;
      if (tipo === "principal") {
        setImagenPrincipal(nuevaFoto);
      } else {
        setImagenesSecundarias([...imagenesSecundarias, nuevaFoto]);
      }
    }
  };

  const eliminarImagenPrincipal = () => {
    setImagenPrincipal(null);
  };

  const eliminarImagenSecundaria = (index) => {
    setImagenesSecundarias(imagenesSecundarias.filter((_, i) => i !== index));
  };

  const agregarEtiqueta = () => {
    if (nuevaEtiqueta.trim() !== "" && !etiquetas.includes(nuevaEtiqueta)) {
      setEtiquetas([...etiquetas, nuevaEtiqueta.trim()]);
      setNuevaEtiqueta("");
    }
  };

  const eliminarEtiqueta = (index) => {
    setEtiquetas(etiquetas.filter((_, i) => i !== index));
  };

  return (
    <>
      <Modal transparent={true} visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Text style={styles.modalTitle}>Nuevo Local</Text>

              <Text style={styles.label}>Nombre</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  maxLength={100}
                  value={nombre}
                  onChangeText={setNombre}
                  multiline
                />
                <Text style={styles.charCount}>{nombre.length}/100</Text>
                <Text style={styles.asterisk}>*</Text>
              </View>

              <Text style={styles.label}>Descripción</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  maxLength={400}
                  value={descripcion}
                  onChangeText={setDescripcion}
                  multiline
                />
                <Text style={styles.charCount}>{descripcion.length}/400</Text>
                <Text style={styles.asterisk}>*</Text>
              </View>

              <Text style={styles.label}>Ubicación</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  maxLength={200}
                  value={ubicacion}
                  onChangeText={setUbicacion}
                  multiline
                />
                <Text style={styles.charCount}>{ubicacion.length}/200</Text>
                <Text style={styles.asterisk}>*</Text>
              </View>

              <View style={styles.coorTextContainer}>
                <MaterialIcons
                  name="place"
                  size={20}
                  color="black"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.inputCoord}
                  maxLength={24}
                  value={`${coordenadas.latitude}, ${coordenadas.longitude}`}
                  onChangeText={(text) => {
                    const [lat, lon] = text
                      .split(",")
                      .map((item) => item.trim().slice(0, 11)); // Limita cada valor a 11 caracteres directamente

                    setCoordenadas({
                      latitude: lat || "",
                      longitude: lon || "",
                    });
                  }}
                />
                <Text style={styles.coordAsterisk}>*</Text>
              </View>

              <TouchableOpacity
                onPress={getCoordenadas}
                style={styles.coordButton}
              >
                <Text style={styles.coordButtonText}>
                  RECUPERAR COORDENADAS
                </Text>
                <Entypo name="location" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => tomarFoto("principal")}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>Foto del Local</Text>
                <MaterialIcons name="photo-camera" size={20} color="#fff" />
              </TouchableOpacity>

              {imagenPrincipal && (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: imagenPrincipal }}
                    style={styles.image}
                  />
                  <TouchableOpacity
                    onPress={eliminarImagenPrincipal}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                onPress={() => tomarFoto("secundaria")}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>Agregar Más Fotos</Text>
                <MaterialIcons name="add-a-photo" size={20} color="#fff" />
              </TouchableOpacity>

              <ScrollView horizontal>
                {imagenesSecundarias.map((img, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: img }} style={styles.image} />
                    <TouchableOpacity
                      onPress={() => eliminarImagenSecundaria(index)}
                      style={styles.deleteButton}
                    >
                      <MaterialIcons name="close" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <Text style={styles.label} marginTop={10}>
                Etiquetas
              </Text>

              <View style={styles.etiquetaInputContainer}>
                <TextInput
                  style={styles.inputEtiqueta}
                  value={nuevaEtiqueta}
                  onChangeText={setNuevaEtiqueta}
                />
                <TouchableOpacity
                  onPress={agregarEtiqueta}
                  style={styles.addEtiquetaButton}
                >
                  <MaterialIcons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal>
                {etiquetas.map((etiqueta, index) => (
                  <View key={index} style={styles.etiquetaContainer}>
                    <Text style={styles.etiquetaText}>{etiqueta}</Text>
                    <TouchableOpacity onPress={() => eliminarEtiqueta(index)}>
                      <MaterialIcons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelar}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.createButton,
                    {
                      borderColor: botonHabilitado ? "#736e69" : "#00bf62",
                    },
                  ]}
                  onPress={handleCrearLocal}
                >
                  <Text
                    style={[
                      styles.createButtonText,
                      { color: botonTextHabilitado ? "#736e69" : "#00bf62" },
                    ]}
                  >
                    Crear
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ModalDeCarga visible={loading} />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff9f1",
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
  },
  scrollContainer: {
    paddingBottom: 20, // Espacio para evitar que el contenido quede cortado
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 15,
    fontFamily: "OpenSans-Bold",
    marginBottom: 30,
  },
  inputContainer: {
    position: "relative",
    width: "100%",
  },
  asterisk: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -14 }],
    fontSize: 16,
    fontFamily: "Open-Sans",
  },
  coordAsterisk: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -2 }],
    fontSize: 16,
    fontFamily: "Open-Sans",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontFamily: "Open-Sans",
    marginLeft: 4,
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    fontFamily: "Open-Sans",
    marginTop: 2,
    marginRight: 10,
  },
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#736e69",
    borderRadius: 5,
    paddingRight: 20,
    paddingTop: 3,
    paddingBottom: 4,
  },
  inputCoord: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#736e69",
    borderRadius: 5,
    paddingLeft: 30,
    paddingRight: 25,
    paddingBottom: 4,
  },
  icon: {
    position: "absolute",
    left: 5,
    top: "50%",
    transform: [{ translateY: -8 }],
  },
  coorTextContainer: {
    position: "relative",
    width: "100%",
    marginBottom: 4,
  },
  coordButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8c1b1d",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  coordButtonText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 8,
    fontFamily: "Open-Sans",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0e87d6",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    marginRight: 8,
    fontFamily: "Open-Sans",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    padding: 6,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#736e69",
  },
  cancelButtonText: {
    color: "#007AFF",
    fontSize: 12,
    fontFamily: "OpenSans-Bold",
  },
  createButton: {
    flex: 1,
    alignItems: "center",
    padding: 6,
    borderRadius: 5,
    borderWidth: 1,
    marginLeft: 20,
  },
  createButtonText: {
    fontSize: 12,
    fontFamily: "OpenSans-Bold",
  },
  imageContainer: {
    position: "relative",
    margin: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    borderRadius: 15,
    padding: 3,
  },
  etiquetaContainer: {
    flexDirection: "row",
    backgroundColor: "#0e87d6",
    borderRadius: 8,
    padding: 8,
    margin: 10,
    alignItems: "center",
  },
  etiquetaText: {
    color: "#fff",
    marginRight: 5,
    fontFamily: "Open-Sans",
    fontSize: 12,
  },
  etiquetaInputContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 10,
  },
  inputEtiqueta: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#736e69",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  addEtiquetaButton: {
    marginLeft: 10,
    backgroundColor: "#8c1b1d",
    padding: 8,
    borderRadius: 8,
  },
});
