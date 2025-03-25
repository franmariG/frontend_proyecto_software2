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
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import ModalDeCarga from "../components/ModalDeCarga";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Notificacion from "../components/ModalNotificacion";
import url from "@/constants/url";

export default function ModalEditarLocal({ visible, onClose, localData }) {
  const [nombre, setNombre] = useState(localData.name);
  const [descripcion, setDescripcion] = useState(localData.description);
  const [ubicacion, setUbicacion] = useState(localData.address);
  const [coordenadas, setCoordenadas] = useState({
    latitude: localData.latitude.toString(),
    longitude: localData.longitude.toString(),
  });
  const [imagenPrincipal, setImagenPrincipal] = useState(localData.fotoPerfil);
  const [imagenesSecundarias, setImagenesSecundarias] = useState(
    localData.fotos
  );
  const [etiquetas, setEtiquetas] = useState(localData.etiquetas);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal
  const [modalMessage, setModalMessage] = useState(""); // Mensaje del modal
  const [modalSuccess, setModalSuccess] = useState(false); // Éxito del modal
  const [botonHabilitado, setBotonHabilitado] = useState(true);
  const [botonTextHabilitado, setBotonTextHabilitado] = useState(true);
  const [loading, setLoading] = useState(false);

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

  const validarInputs = () => {
    const coordenadasRegex = /^-?\d+(\.\d+)?$/; // Permite números positivos, negativos y decimales

    if (!nombre.trim()) {
      setModalMessage("El campo Nombre es obligatorio.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }
    if (!descripcion.trim()) {
      setModalMessage("El campo Descripción es obligatorio.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }
    if (!ubicacion.trim()) {
      setModalMessage("El campo Ubicación es obligatorio.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }
    if (!coordenadas.latitude.trim() || !coordenadas.longitude.trim()) {
      setModalMessage("Debe ingresar las coordenadas para continuar.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }
    if (
      !coordenadasRegex.test(coordenadas.latitude) ||
      !coordenadasRegex.test(coordenadas.longitude)
    ) {
      setModalMessage("Debe ingresar coordenadas numéricas.");
      setModalSuccess(false);
      setModalVisible(true);
      return false;
    }
    if (
      parseFloat(coordenadas.latitude) === 0 ||
      parseFloat(coordenadas.longitude) === 0
    ) {
      setModalMessage("Las coordenadas no pueden ser 0.");
      setModalSuccess(false);
      setModalVisible(true);
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
      parseFloat(coordenadas.latitude) === 0 ||
      parseFloat(coordenadas.longitude) === 0 ||
      !coordenadasRegex.test(coordenadas.latitude) ||
      !coordenadasRegex.test(coordenadas.longitude)
    ) {
      setBotonHabilitado(false);
      setBotonTextHabilitado(false);
    } else {
      setBotonHabilitado(true);
      setBotonTextHabilitado(true);
    }
    console.log(botonHabilitado);
  }, [nombre, descripcion, ubicacion, coordenadas]);

  const actualizarLocal = async () => {
    if (!validarInputs()) return; // Si falla la validación, no ejecuta la petición

    setLoading(true);
    const response = await fetch(
      url + `api/updateRestaurant/${localData._id}`,
      {
        method: "PUT",

        body: JSON.stringify({
          name: nombre,
          own: localData.own,
          fotoPerfil: imagenPrincipal,
          description: descripcion,
          etiquetas: etiquetas,
          address: ubicacion,
          latitude: parseFloat(coordenadas.latitude),
          longitude: parseFloat(coordenadas.longitude),
          viewed: localData.viewed,
          reviews: localData.reviews,
          fotos: imagenesSecundarias,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (await getToken()),
        },
      }
    );
    setLoading(false);

    if (response.status === 200) {
      const data = await response.json();
      setModalMessage("Local editado correctamente");
      setModalSuccess(true);
      setModalVisible(true);
    } else {
      setModalMessage("Error al editar local. Inténtalo de nuevo.");
      setModalSuccess(false);
      setModalVisible(true);
    }
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
      tipo === "principal"
        ? setImagenPrincipal(nuevaFoto)
        : setImagenesSecundarias([...imagenesSecundarias, nuevaFoto]);
    }
  };

  const eliminarImagenSecundaria = (index) => {
    setImagenesSecundarias(imagenesSecundarias.filter((_, i) => i !== index));
  };

  const handleGuardar = () => {
    actualizarLocal();
  };

  const agregarEtiqueta = () => {
    if (
      nuevaEtiqueta.trim() !== "" &&
      !etiquetas.includes(nuevaEtiqueta.trim())
    ) {
      setEtiquetas([...etiquetas, nuevaEtiqueta.trim()]);
      setNuevaEtiqueta("");
    }
  };

  const eliminarEtiqueta = (index) => {
    setEtiquetas(etiquetas.filter((_, i) => i !== index));
  };

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.modalTitle}>Editar Local</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                maxLength={100}
                multiline
                placeholder="Nombre"
              />
              <Text style={styles.charCount}>{nombre.length}/100</Text>
              <MaterialIcons
                name="edit"
                size={18}
                color="#0e87d6"
                style={styles.editIcon}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción"
                maxLength={400}
                multiline
              />
              <Text style={styles.charCount}>{descripcion.length}/400</Text>
              <MaterialIcons
                name="edit"
                size={18}
                color="#0e87d6"
                style={styles.editIcon}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={ubicacion}
                placeholder="Ubicación"
                onChangeText={setUbicacion}
                maxLength={200}
                multiline
              />
              <Text style={styles.charCount}>{ubicacion.length}/200</Text>
              <MaterialIcons
                name="edit"
                size={18}
                color="#0e87d6"
                style={styles.editIcon}
              />
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
              <MaterialIcons
                name="edit"
                size={18}
                color="#0e87d6"
                style={styles.editIconCoord}
              />
            </View>
            <TouchableOpacity
              onPress={getCoordenadas}
              style={styles.coordButton}
            >
              <Text style={styles.coordButtonText}>RECUPERAR COORDENADAS</Text>
              <Entypo name="location" size={20} color="#fff" />
            </TouchableOpacity>

            {imagenPrincipal && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imagenPrincipal }} style={styles.image} />
              </View>
            )}

            <TouchableOpacity
              onPress={() => tomarFoto("principal")}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Cambiar Foto Principal</Text>
              <MaterialIcons name="camera-alt" size={20} color="#fff" />
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

            <TouchableOpacity
              onPress={() => tomarFoto("secundaria")}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Añadir Foto</Text>
              <MaterialIcons name="add-a-photo" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.etiquetaInputContainer}>
              <TextInput
                style={styles.inputEtiqueta}
                placeholder="Agregar Etiqueta"
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
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    borderColor: botonHabilitado ? "#ff8800" : "#736e69",
                  },
                ]}
                onPress={handleGuardar}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    { color: botonTextHabilitado ? "#ff8800" : "#736e69" },
                  ]}
                >
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
      <ModalDeCarga visible={loading} />
      <Notificacion
        isVisible={modalVisible}
        isSuccess={modalSuccess}
        message={modalMessage}
        onClose={() => {
          setModalVisible(false);
          onClose();
        }}
      />
    </Modal>
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
    paddingBottom: 20,
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
    marginBottom: 15,
  },
  editIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -18 }],
  },
  editIconCoord: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -6 }],
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
    paddingRight: 30,
    paddingTop: 3,
    paddingBottom: 4,
  },
  inputCoord: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#736e69",
    borderRadius: 5,
    paddingLeft: 30,
    paddingRight: 30,
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    marginTop: 10,
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
  saveButton: {
    flex: 1,
    alignItems: "center",
    padding: 6,
    borderRadius: 5,
    borderWidth: 1,
    marginLeft: 20,
  },
  saveButtonText: {
    fontSize: 12,
    fontFamily: "OpenSans-Bold",
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
