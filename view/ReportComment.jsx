import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  TouchableHighlight,
} from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode as decode } from "jwt-decode";
import url from "@/constants/url";
import ModalNotificacion from "@/components/ModalNotificacion";

export default function ReportComment({
  idRestaurante,
  idComentario,
  visible,
  onClose,
}) {
  const [textComment, setTextComment] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("");
  const [token, setToken] = useState("");
  const styles = StyleSheet.create({
    container: {
      justifyContent: "center",
      itemsAlign: "center",
      height: "100%",
    },
    containerCard: {
      marginLeft: 50,
      marginRight: 50,
      alignItems: "center",
      height: "50vh",
      backgroundColor: "#fff9f1",
    },
    header: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#8c0e02",
      paddingVertical: 10,
      width: "100%",
    },
    headerText: {
      color: "white",
      fontSize: 17,
      fontWeight: "bold",
    },
    button: {
      borderRadius: 2,
      textAlign: "center",
      color: "white",
      width: 90,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
    },
    input: {
      width: "100%",
      paddingVertical: 5,
      paddingHorizontal: 16,
      borderWidth: 0.2,
      fontSize: 8,
    },
    checkbox: {
      width: 6,
      height: 6,
      borderWidth: 1,
      borderColor: "#545351",
      borderRadius: 8,
      backgroundColor: "#545351",
    },
    checkboxText: {
      fontSize: 10,
      color: "#1e1b17",
    },
    checkboxChecked: {
      backgroundColor: "#1f6bdc",
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
  });
  const [modalPeticion, setModalPeticion] = useState({
    visible: false,
    message: "",
    success: false,
  });

  const getToken = async () => {
    try {
      const value = await AsyncStorage.getItem("token");
      if (value != null) {
        setToken(value);
      } else {
        throw new Error("Token No encontrado");
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  useEffect(() => {
    getToken();
  }, []);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const renderCheckbox = (option, label) => (
    <Pressable
      style={styles.checkboxContainer}
      onPress={() => handleOptionSelect(option)}
    >
      <View
        style={{
          width: 15,
          height: 15,
          borderWidth: 1,
          borderColor: "#545351",
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 8,
        }}
      >
        <View
          style={[
            styles.checkbox,
            selectedOption === option && styles.checkboxChecked, // Aplica el estilo si está seleccionado
          ]}
        ></View>
      </View>

      <Text style={styles.checkboxText}>{label}</Text>
    </Pressable>
  );

  const handleSubmit = async () => {
    if (selectedOption === null) {
      setMessage("Selecciona el tipo de denuncia ");
      setColor("red");
    }

    console.log(token);

    try {
      const response = await fetch(
        url + `api/denunciarComentario/${idRestaurante}/${idComentario}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            observacion: textComment,
            razon: selectedOption,
          }),
        }
      );

      if (response.status == 200) {
        setModalPeticion({
          visible: true,
          message: "Comentario denunciado exitosamente.",
          success: true,
        });
        console.log(await response.json());
      } else {
        setModalPeticion({
          visible: true,
          message: "Error al denunciar comentario.",
          success: false,
        });
        console.log(response);
        console.log(await response.json());
      }
    } catch (error) {
      setModalPeticion({
        visible: true,
        message: "Error Fulminante al denunciar comentario.",
        success: false,
      });
      console.log(error);
    }
  };

  return (
    <>
      <Modal transparent visible={visible} animationType="slide">
        <Pressable
          onPress={onClose}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            position: "absolute",
          }}
        />
        <View style={styles.container}>
          <View style={styles.containerCard}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Denunciar este comentario</Text>
            </View>

            <View style={{ paddingVertical: 20 }}>
              <View
                style={{
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                {renderCheckbox("inapropiado", "Contenido inapropiado")}
                {renderCheckbox("engañoso", "Negocio Engañoso")}
                {renderCheckbox("estafa", "Estafa")}
                {renderCheckbox("sexual", "Contenido Sexual")}
              </View>

              <View
                style={{
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    fontWeight: 500,
                    fontSize: 10,
                    marginBottom: 15,
                    marginTop: 15,
                  }}
                >
                  Comentario
                </Text>
                <TextInput
                  style={styles.input}
                  onChangeText={setTextComment}
                  value={textComment}
                  placeholder="Comparte detalles sobre tu denuncia (opcional)"
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  gap: 16,
                  marginTop: 30,
                  justifyContent: "center",
                }}
              >
                <TouchableHighlight
                  onPress={() => {
                    setTextComment("");
                    setSelectedOption(null);
                    onClose();
                  }}
                  style={styles.button}
                >
                  <Text
                    style={{ color: "#545351", fontWeight: 600, fontSize: 12 }}
                  >
                    Cancelar
                  </Text>
                </TouchableHighlight>
                <TouchableHighlight
                  style={styles.button}
                  onPress={handleSubmit}
                >
                  <Text
                    style={{ color: "#545351", fontWeight: 600, fontSize: 12 }}
                  >
                    Denunciar
                  </Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <ModalNotificacion
        isVisible={modalPeticion.visible}
        isSuccess={modalPeticion.success}
        message={modalPeticion.message}
        onClose={() => {
          setModalPeticion({ visible: false, message: "", success: false });
          onClose();
        }}
      />
    </>
  );
}
