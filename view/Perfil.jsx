import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  Platform,
} from "react-native";
import Icon from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import ModalOpcionesAvanzadas from "../components/Perfil/ModalOpcionesAvanzadas";
import { useRouter } from "expo-router";
import { useCookies } from "react-cookie";
import { jwtDecode as decode } from "jwt-decode";
import PlaceholderText from "../components/PlaceholderText";
import PlaceholderFotoPerfil from "../components/PlaceholderFotoPerfil";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import ModalNotificacion from "@/components/ModalNotificacion";
import ModalCerrarSesion from "@/components/Perfil/ModalCerrarSesion";
import url from "@/constants/url";
import ModalConfirmarAccion from "@/components/ModalConfirmarAccion";

export default function Perfil() {
  const router = useRouter();
  const [modalOpcionesAvanzadasVisible, setModalOpcionesAvanzadasVisile] =
    useState(false);
  const [cookies] = useCookies(["token"]);
  const [user, setUser] = useState(null);
  const [correo, setCorreo] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [defaultValue, setDefaultValue] = useState({});
  const [codigo, setCodigo] = useState();
  const [modalNotification, setModalNotification] = useState({
    visible: false,
    message: "",
    success: false,
  });
  const [modalCerrarSesion, setModalCerrarSesion] = useState(false);
  const [modalConfirmarAccion, setModalConfirmarAccion] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

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

      setUser(data.userFound);
      setCorreo(data.userFound.email);
      setNombre(data.userFound.name);
      setCodigo(data.userFound._id);
      setFotoPerfil(data.userFound.fotoPerfil);
      setDefaultValue({
        nombre: data.userFound.name,
        correo: data.userFound.email,
        fotoPerfil: data.userFound.fotoPerfil,
      });
      console.log(data);
    } else {
      console.log(await response.json());
      alert("Error");
    }
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
      setFotoPerfil(
        `data:${resultado.assets[0].mimeType};base64,${resultado.assets[0].base64}`
      );
    }
  };

  const modificarPerfil = async () => {
    const userId = await getUserId(); // Obtiene el ID del usuario desde el token
    const temp = {};

    if (fotoPerfil != defaultValue.fotoPerfil) {
      temp.fotoPerfil = fotoPerfil;
    }

    if (nombre != defaultValue.nombre) {
      temp.name = nombre;
    }

    if (correo != defaultValue.correo) {
      temp.email = correo;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      setModalNotification({
        visible: true,
        message: "El correo no es válido.",
        success: false,
      });
      return;
    }

    if (password != "") {
      temp.password = password;
    }

    const response = await fetch(url + "api/updateUser/" + userId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      body: JSON.stringify(temp),
    });

    if (response.status == 200) {
      setModalNotification({
        visible: true,
        message: "Perfil Modificado Exitosamente",
        success: true,
      });
    } else {
      alert("Error al modificar el perfil.");
      setModalNotification({
        visible: true,
        message: "Error al modificar el perfil",
        success: false,
      });
      setNombre(defaultValue.nombre);
      setCorreo(defaultValue.correo);
      setFotoPerfil(defaultValue.fotoPerfil);
      setPassword("");
    }
  };
  /* AGREGADO*/
  const eliminarCuenta = async () => {
    const userId = await getUserId(); // Obtener el ID del usuario desde el token
    const response = await fetch(url + `api/deleteUser/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
    });
    const responseData = await response.json();
    console.log("Respuesta de la API:", responseData);
    console.log("Código de estado:", response.status);
    console.log(userId);

    if (response.status === 200) {
      setModalNotification({
        visible: true,
        message: "Cuenta eliminada exitosamente",
        success: true,
      });

      // Cerrar sesión y redirigir a la pantalla de inicio
      AsyncStorage.clear();
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      alert("Error al eliminar la cuenta");
    }
  };
  /* AGREGADO*/
  const eliminarCuentaTest = () => {
    console.log("Botón de eliminar cuenta presionado.");
    setModalConfirmarAccion(false); // Cierra el modal
  };

  const cerrarSesion = () => {
    AsyncStorage.clear();
    router.push("/");
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        gap: 8,
      }}
    >
      <Image
        source={require("@/assets/images/tomar foto.png")}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#e5d0ac",
          position: "absolute",
          opacity: 0.75,
        }}
      />
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            {
              ...styles.boton,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          onPress={() => {
            router.push("/mainpage");
          }}
        >
          <Icon
            name="chevron-thin-down"
            size={17}
            style={{
              transform: [{ rotate: "90deg" }],
            }}
            color="white"
          />
        </Pressable>
        <Image
          source={require("@/assets/images/logo_recortado.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>FOODIGO</Text>
        <Pressable
          style={({ pressed }) => [
            {
              ...styles.boton,
              opacity: pressed ? 0.8 : 1,
              position: "absolute",
              top: 6,
              right: 30,
              marginRight: 0,
            },
          ]}
          onPress={() => {
            setModalCerrarSesion(true);
          }}
        >
          <Icon name="log-out" size={18} color="white" />
        </Pressable>
      </View>
      <View style={{ alignItems: "center", gap: 3 }}>
        <View style={{ marginBottom: 15 }}>
          <View style={styles.containerFotoPerfil}>
            {!defaultValue.nombre ? (
              <PlaceholderFotoPerfil size={100} fontSize={50} />
            ) : (
              <Image
                source={
                  fotoPerfil == ""
                    ? require("@/assets/images/avatarPrueba.png")
                    : fotoPerfil
                }
                style={styles.fotoPerfil}
              />
            )}
          </View>
          {modoEdicion && (
            <Pressable
              onPress={() => {
                seleccionarImagen();
              }}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "#FF9D23",
                padding: 5,
                borderRadius: 6,
              }}
            >
              <FontAwesome6 name="edit" size={22} color="#000" />
            </Pressable>
          )}
        </View>
        {/* Nombre */}
        {nombre != "" && (
          <Text style={{ textAlign: "center", fontWeight: 700, fontSize: 23 }}>
            {nombre}
          </Text>
        )}
        {nombre == "" && <PlaceholderText width={220} fontSize={23} />}

        {/* Codigo */}
        {codigo != "" && (
          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              letterSpacing: 1,
              fontWeight: 600,
              marginBottom: 25,
            }}
          >
            {codigo}
          </Text>
        )}
        {codigo == "" && <PlaceholderText width={150} fontSize={12} />}
      </View>
      <TextInput
        placeholder="Correo"
        style={styles.input}
        value={correo}
        onChangeText={setCorreo}
        editable={modoEdicion}
      />
      <TextInput
        placeholder="Nombre"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        editable={modoEdicion}
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        value={!modoEdicion ? "********" : password}
        onChangeText={setPassword}
        editable={modoEdicion}
      />
      {modoEdicion && (
        <Pressable
          onPress={() => {
            console.log("click");
            modificarPerfil();
            setModoEdicion(false);
          }}
          style={({ pressed }) => [
            {
              width: "80%",
              paddingHorizontal: 10,
              paddingVertical: 12,
              alignItems: "center",
              backgroundColor: !pressed ? "#EEAF5C" : "#E5Aa5a",
              borderRadius: 10,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 15,
              textTransform: "capitalize",
              fontWeight: 700,
            }}
          >
            Editar
          </Text>
        </Pressable>
      )}
      {!modoEdicion && (
        <Pressable
          onPress={() => {
            console.log("click");
            setModoEdicion(false);
          }}
          style={{
            width: "80%",
            paddingHorizontal: 10,
            paddingVertical: 12,
            alignItems: "center",
            backgroundColor: "#FEF9E1",
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              textTransform: "capitalize",
              fontWeight: 700,
              color: "#777",
            }}
          >
            Editar
          </Text>
        </Pressable>
      )}
      <View
        style={{
          position: "absolute",
          bottom: 15,
          width: "100%",
          flex: 1,
          alignItems: "center",
        }}
      >
        <Pressable
          style={({ pressed }) => [
            {
              alignItems: "center",
              opacity: pressed ? 0.8 : 1,
              marginBottom: 15,
            },
          ]}
          onPress={() => {
            console.log("click");
            setModalOpcionesAvanzadasVisile(true);
          }}
        >
          <Icon
            name="chevron-thin-down"
            size={22}
            style={{
              transform: [{ rotate: "180deg" }],
            }}
            color="red"
          />
          <Text style={styles.opcionesAvanzadas}>Opciones Avanzadas</Text>
        </Pressable>
      </View>
      <ModalOpcionesAvanzadas
        setModoEdicion={setModoEdicion}
        setVisible={setModalOpcionesAvanzadasVisile}
        visible={modalOpcionesAvanzadasVisible}
        setModalConfirmarAccion={setModalConfirmarAccion} /* AGREGADO*/
      />
      <ModalNotificacion
        isSuccess={modalNotification.success}
        message={modalNotification.message}
        isVisible={modalNotification.visible}
        onClose={() => {
          setModalNotification({
            visible: false,
            message: "",
            success: false,
          });
        }}

        /* AGREGADO*/
      />
      <ModalConfirmarAccion
        visible={modalConfirmarAccion}
        setVisible={setModalConfirmarAccion}
        accion={eliminarCuenta}
        //accion={eliminarCuenta} // Llamará a la función cuando el usuario confirme
        message="¿Esta seguro que desea eliminar su cuenta?"
      />

      <ModalCerrarSesion
        setVisible={setModalCerrarSesion}
        cerrarSesion={cerrarSesion}
        visible={modalCerrarSesion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  boton: {
    padding: 8,
    backgroundColor: Colors.darkRed,
    borderRadius: 50,
    marginRight: 15,
  },
  logo: {
    width: 25,
    height: 40,
    marginRight: 5,
  },
  header: {
    position: "absolute",
    top: 55,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    width: "100%",
    paddingHorizontal: 30,
  },
  title: {
    fontFamily: "League-Gothic",
    fontSize: 39,
    lineHeight: 45,
    color: "#fff",
  },
  input: {
    width: "80%",
    fontSize: 15,
    paddingTop: 12,
    paddingLeft: 12,
    paddingBottom: 12,
    paddingRight: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderColor: Colors.darkRed,
    borderWidth: 1,
    textAlign: "center",
    zIndex: 10,
  },
  opcionesAvanzadas: {
    textAlign: "center",
    fontWeight: 800,
    fontSize: 15,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  containerFotoPerfil: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ea7060",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 20,
  },
  fotoPerfil: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
});
