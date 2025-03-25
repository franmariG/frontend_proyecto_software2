import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import Icon from "@expo/vector-icons/Feather";
import Colors from "@/constants/Colors";
import ModalConfirmarAccion from "@/components/ModalConfirmarAccion";

export default function ModalOpcionesAvanzadas({ visible, setVisible, setModoEdicion, setModalConfirmarAccion }) {
  return (
    <Modal visible={visible} transparent animationType="slide"> 
      <Pressable
        onPress={() => {
          setVisible(false);
        }}
        style={styles.fondo}
      />
      <View style={styles.container}>
        <View style={styles.recuadro}>
          <Pressable
            style={{
              position: "absolute",
              width: 25,
              height: 25,
              top: 5,
              left: 5,
              zIndex: 10,
            }}
            onPress={() => {
              setVisible(false);
            }}
          >
            <Icon name="x" size={25} color="black" />
          </Pressable>
          <View style={styles.containerTextoRecuadro}>
            <Text
              style={{
                textTransform: "uppercase",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: 1.1,
              }}
            >
              Opciones avanzadas
            </Text>
          </View>
          <View style={styles.containerButtons}>
            <Pressable
              onPress={() => {
                setModoEdicion(true);
                setVisible(false);
              }}
              style={({ pressed }) => [
                styles.buttonEditarPerfil,
                { backgroundColor: pressed ? Colors.lightGray : Colors.white },
              ]}
            >
              <Text style={{ fontWeight: 600 }}>Editar Perfil</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setVisible(false); //AGREGADO
                setModalConfirmarAccion(true); // Abre el modal de confirmación
              }}
              style={({ pressed }) => [
                styles.buttonEliminarPerfil,
                { backgroundColor: pressed ? Colors.lightGray : Colors.white },
              ]}
            >
              <Text style={{ fontWeight: 600, color: "red" }}>Eliminar Perfil</Text>
            </Pressable>

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    backgroundColor: "#000000ac",
    flex: 1,
  },
  recuadro: {
    width: "80%",
    height: 150,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    position: "absolute",
    flex: 1,
    overflow: "hidden",
    borderWidth: 1,
    zIndex: 10,
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 70,
  },
  containerButtons: {
    flexDirection: "row",
    margin: 0,
    width: "100%",
  },
  buttonEditarPerfil: {
    height: 60,
    width: "50%",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
  buttonEliminarPerfil: {
    width: "50%",
    height: 60,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "#000",
  },
  containerTextoRecuadro: {
    width: "100%",
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
