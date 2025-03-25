import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { jwtDecode as decode } from "jwt-decode";
import * as Location from "expo-location";
import { useCookies } from "react-cookie";
import * as ImagePicker from "expo-image-picker";
import Fontisto from "@expo/vector-icons/Fontisto";
import PlaceholderFotoPerfil from "./PlaceholderFotoPerfil";
import Icon from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { set } from "react-hook-form";
import ModalNotificacion from "./ModalNotificacion";
import ModalDeCarga from "./ModalDeCarga";
import url from "@/constants/url";

const StarRating = ({ setStarts, stars }) => {
  return (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {[...Array(5)].map((_, i) => (
        <Pressable onPress={() => setStarts(i + 1)} key={i}>
          <Icon
            key={i}
            name={i < stars ? "star" : "star"}
            color={i < stars ? "#FFD700" : "#E6E6E6"}
            size={25}
          />
        </Pressable>
      ))}
    </View>
  );
};

export default function ModalEditarComentario({
  visible,
  onClose,
  restaurante,
  comentario,
}) {
  const [comment, setComment] = useState("");
  const [stars, setStars] = useState(1);
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
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

  const [modalPeticion, setModalPeticion] = useState({
    visible: false,
    message: "",
    success: false,
  });

  const getUserId = async () => {
    const token = await getToken();
    if (!token) return null;

    const decoded = decode(token);
    return decoded.sub;
  };

  const setDefaultValues = () => {
    setComment("");
    setStars(1);
  };

  const getUser = async () => {
    const response = await fetch(url + "api/getUser/" + (await getUserId()), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status == 200) {
      const data = await response.json();

      setNombre(data.userFound.name);
      setCodigo(data.userFound._id);
      setFotoPerfil(data.userFound.fotoPerfil);
    } else {
      console.log(await response.json());
      alert("Error");
    }
  };

  const editarComentario = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        url + "api/updateComment/" + restaurante._id,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            comment: comment,
            calification: stars,
          }),
        }
      );

      if (response.status == 201 || response.status == 200) {
        console.log("Finalizo");
        const data = await response.json();
        setModalPeticion({
          visible: true,
          message: "Comentario editado.",
          success: true,
        });
        console.log(response);
        setLoading(false);
      } else {
        console.log("Error Editar Comentario");
        console.log(response);
        console.log(await response.json());
        setModalPeticion({
          visible: true,
          message: "Error al editar comentario.",
          success: false,
        });
        setLoading(false);
      }
    } catch (err) {
      console.log("Error Editar Comentario");
      console.log(err);
      setModalPeticion({
        visible: true,
        message: "Sucedio un error fulminante al editar el comentario.",
        success: false,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (comentario) {
      setComment(comentario.comment);
      setStars(comentario.calification);
    }
  }, [comentario]);

  return (
    <>
      <Modal transparent={true} visible={visible} animationType="fade">
        <Pressable
          style={styles.fondoModal}
          onPress={() => {
            setDefaultValues();
            onClose();
          }}
        />
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View
              style={{
                display: "flex",
                width: "100%",
                paddingLeft: 7,
                paddingRight: 7,
                marginBottom: 15,
              }}
            >
              <Text style={styles.tituloRestaurante}>{restaurante.name}</Text>

              <View style={{ display: "flex", flexDirection: "row" }}>
                <View style={styles.logoContainerComent}>
                  {fotoPerfil == null ? (
                    <PlaceholderFotoPerfil size={60} fontSize={50} />
                  ) : (
                    <Image
                      source={
                        fotoPerfil == ""
                          ? require("@/assets/images/avatarPrueba.png")
                          : { uri: fotoPerfil }
                      }
                      style={styles.fotoPerfil}
                    />
                  )}
                </View>
                <View style={styles.cardTexto}>
                  <Text style={styles.nombreCc}>{nombre}</Text>
                  <StarRating setStarts={setStars} stars={stars} />
                </View>
              </View>

              <Text
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  marginBottom: 10,
                }}
              >
                Comentario
              </Text>
              <View>
                <View
                  style={{
                    position: "absolute",
                    left: 15,
                    top: -4,
                    backgroundColor: "#FEF9E1",
                    paddingHorizontal: 4,
                    zIndex: 10,
                  }}
                >
                  <Fontisto name="quote-a-right" size={9} color="black" />
                </View>
                <Text
                  style={{
                    position: "absolute",
                    right: 15,
                    top: -16,
                    fontWeight: 400,
                    fontSize: 11,
                  }}
                >
                  {comment.length}/500
                </Text>
                <TextInput
                  style={styles.input}
                  onChangeText={setComment}
                  value={comment}
                  placeholder="Escribe un Comentario Sobre el Establecimiento"
                  maxLength={500}
                  multiline
                />

                <View
                  style={{
                    position: "absolute",
                    right: 15,
                    bottom: -4,
                    backgroundColor: "#FEF9E1",
                    paddingHorizontal: 4,
                    zIndex: 10,
                  }}
                >
                  <Fontisto name="quote-a-left" size={9} color="black" />
                </View>
              </View>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.boton,
                  {
                    borderColor: pressed ? "#3572CA" : "#000",
                  },
                ]}
                onPress={() => {
                  setDefaultValues();
                  onClose();
                }}
              >
                <Text style={{ ...styles.botonTexto, color: "#3572CA" }}>
                  Cancelar
                </Text>
              </Pressable>
              {comment.length == 0 ? (
                <Pressable style={styles.boton}>
                  <Text style={styles.botonTexto}>Comentar</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.boton,
                    {
                      borderColor: pressed ? "#C14600" : "#000",
                    },
                  ]}
                  onPress={() => {
                    editarComentario();
                  }}
                >
                  <Text style={{ ...styles.botonTexto, color: "#C14600" }}>
                    Editar
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
      <ModalNotificacion
        isSuccess={modalPeticion.success}
        message={modalPeticion.message}
        isVisible={modalPeticion.visible}
        onClose={() => {
          if (modalPeticion.success) {
            setDefaultValues();
            onClose();
          }
          setModalPeticion({ visible: false, message: "", success: false });
        }}
      />
      <ModalDeCarga visible={loading} />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#FFFAF1",
    borderRadius: 10,
    paddingTop: 15,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  fondoModal: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderColor: "#01041a98",
  },
  tituloRestaurante: {
    fontSize: 19,
    textAlign: "center",
    marginBottom: 25,
    fontWeight: 400,
  },
  boton: {
    width: 110,
    paddingVertical: 9,
    borderRadius: 5,
    borderColor: "#000",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    transitionDuration: 200,
  },
  botonTexto: {
    fontWeight: 600,
  },
  cardTexto: {
    justifyContent: "center",
    flex: 2,
  },
  logoContainerComent: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
    marginTop: "5%",
    marginBottom: "5%",
    borderWidth: 7,
    borderColor: "#fff",
    width: 80,
    height: 80,
    borderRadius: 35,
    overflow: "hidden",
  },
  fotoPerfil: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 60,
  },
  nombreCc: {
    fontSize: 16,
    fontWeight: "bold",
    margin: 5,
    color: "#000",
  },
});
