import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ModalNotificacion from "@/components/ModalNotificacion";
import ModalDeCarga from "@/components/ModalDeCarga";
import url from "@/constants/url";

export default function ReportLocal({ idRestaurante, visible, onClose }) {
  const [textComment, setTextComment] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("");
  const [token, setToken] = useState("");
  const [modalPeticion, setModalPeticion] = useState({
    visible: false,
    message: "",
    success: false,
  });
  const [loading, setLoading] = useState(false);

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
      width: "80%",
      backgroundColor: "#fff9f1",
      borderRadius: 5,
      overflow: "hidden",
    },
    header: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#8c0e02",
      height: 40,
      width: "100%",
    },
    headerText: {
      color: "white",
      fontSize: 17,
      fontWeight: "bold",
    },
    button: {
      borderRadius: 2,
      padding: 10,
      backgroundColor: "#f0f0f0",
      marginHorizontal: 5,
    },
    input: {
      width: "100%",
      height: 40,
      borderWidth: 0.2,
      fontSize: 10,
      paddingLeft: 16,
      marginVertical: 10,
    },
    checkboxContainer: {
      marginLeft: 20,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    checkboxOuter: {
      width: 15,
      height: 15,
      borderWidth: 1,
      borderColor: "#545351",
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    checkboxInner: {
      width: 10,
      height: 10,
      borderRadius: 60,
    },
    messageText: {
      fontSize: 12,
      textAlign: "center",
      marginVertical: 10,
    },
    contentContainer: {
      padding: 15,
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 10,
    },
  });

  const getToken = async () => {
    try {
      const value = await AsyncStorage.getItem("token");
      if (value) {
        setToken(value);
      }
    } catch (e) {
      console.log(e);
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
      <View style={styles.checkboxOuter}>
        <View
          style={[
            styles.checkboxInner,
            selectedOption === option && { backgroundColor: "#1f6bdc" },
          ]}
        />
      </View>
      <Text style={{ fontSize: 12, color: "#1e1b17" }}>{label}</Text>
    </Pressable>
  );

  const handleSubmit = async () => {
    if (!selectedOption) {
      setMessage("Selecciona el tipo de denuncia");
      setColor("red");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        url + `api/denunciarRestaurante/${idRestaurante}`,
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

      if (response.status == 200 || response.status == 201) {
        setModalPeticion({
          visible: true,
          message:
            "Su denuncia sera tomada en cuenta y tomaremos acciones lo mas rapido posible",
          success: true,
        });
      } else {
        setModalPeticion({
          visible: false,
          message: "Sucedio un error al poner la denuncia",
          success: false,
        });
      }
    } catch (error) {
      setModalPeticion({
        visible: false,
        message: "Sucedio un error fulminante al poner la denuncia",
        success: false,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
            }}
            onPress={onClose}
          />
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Denunciar este local</Text>
            </View>

            <View style={styles.contentContainer}>
              {renderCheckbox("inapropiado", "Contenido inapropiado")}
              {renderCheckbox("engañoso", "Negocio Engañoso")}
              {renderCheckbox("estafa", "Estafa")}
              {renderCheckbox("sexual", "Contenido Sexual")}

              <Text style={{ fontSize: 12, marginVertical: 10 }}>
                Comentario
              </Text>
              <TextInput
                style={styles.input}
                onChangeText={setTextComment}
                value={textComment}
                placeholder="Comparte detalles sobre tu denuncia (opcional)"
                multiline
              />

              <View style={styles.buttonsContainer}>
                <Pressable style={styles.button} onPress={onClose}>
                  <Text style={{ color: "#545351", fontWeight: "bold" }}>
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleSubmit}>
                  <Text style={{ color: "#545351", fontWeight: "bold" }}>
                    Denunciar
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <ModalDeCarga visible={loading} />
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
