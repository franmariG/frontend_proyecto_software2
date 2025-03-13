import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import Zocial from "@expo/vector-icons/Zocial";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ModalNotificacion from "@/components/ModalNotificacion";

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

const Denuncia = ({ item, userNames, handleAction }) => {
  const [comentario, setComentario] = useState(null);

  const getComentario = async () => {
    try {
      const response = await fetch(
        `https://backend-swii.vercel.app/api/getCommentByIdUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (await getToken()),
          },
          body: JSON.stringify({
            restaurantId: item.idDenunciado,
            userId: item.idComentario,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        setComentario(data.comment.comment);
      } else {
        console.log("Unexpected response format:", data);
      }
    } catch (error) {
      console.log("Error fetching comentario:", error);
    }
  };

  useEffect(() => {
    getComentario();
  }, []);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.textContainer}>
          <View style={styles.iconCircle}>
            <FontAwesome name="home" size={12} color="white" />
          </View>
          <Text>
            <Text style={styles.bold}>Denunciante:</Text>{" "}
            {userNames[item.idDenunciante] || item.idDenunciante}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.iconCircle}>
            <FontAwesome name="user" size={12} color="white" />
          </View>
          <Text>
            <Text style={styles.bold}>Denunciado:</Text>{" "}
            {userNames[item.idComentario] || item.idComentario}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.iconCircle}>
            <FontAwesome name="question" size={12} color="white" />
          </View>
          <Text>
            <Text style={styles.bold}>Razón:</Text> {item.razon}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.iconCircle}>
            <Zocial name="email" size={12} color="white" />
          </View>
          <Text>
            <Text style={styles.bold}>Comentario:</Text> {item.observacion}
          </Text>
        </View>
        <View
          style={{
            width: "100%",
            height: 1,
            backgroundColor: "#000",
            marginVertical: 7,
          }}
        ></View>
        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Comentario Denunciado:
          </Text>
          <Text>{comentario}</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.blockButton}
          onPress={() => handleAction(item._id, false)}
        >
          <Text style={styles.buttonText}>Bloquear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.omitButton}
          onPress={() => handleAction(item._id, true)}
        >
          <Text style={styles.buttonText}>Omitir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DenunciasScreenUsuarios = () => {
  const router = useRouter();
  // Estado con las denuncias
  const [denuncias, setDenuncias] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = React.useState(false); // Estado para el modal
  const [modalMessage, setModalMessage] = React.useState(""); // Mensaje del modal
  const [modalSuccess, setModalSuccess] = React.useState(false);
  const [userDataLoading, setUserDataLoading] = useState(true);

  const fetchDenuncias = async () => {
    try {
      const response = await fetch(
        "https://backend-swii.vercel.app/api/getDenuncias",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (await getToken()),
          },
        }
      );
      const data = await response.json();
      if (data && Array.isArray(data.denuncias)) {
        const filteredDenuncias = data.denuncias.filter(
          (denuncia) =>
            denuncia.idComentario !== "" && denuncia.tipo !== "BANEADO"
        );
        console.log(filteredDenuncias);
        if (filteredDenuncias.length > 0) {
          setLoading(false);
          setUserDataLoading(false);
        } else {
          setDenuncias(filteredDenuncias);
        }
      } else {
        console.log("Unexpected response format:", data);
      }
    } catch (error) {
      console.log("Error fetching denuncias:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (id) => {
    try {
      const response = await fetch(
        `https://backend-swii.vercel.app/api/getUser/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (await getToken()),
          },
        }
      );
      const data = await response.json();
      if (data && data.userFound && data.userFound.name) {
        setUserNames((prevUserNames) => ({
          ...prevUserNames,
          [id]: data.userFound.name,
        }));
      } else {
        console.log("Unexpected response format:", data);
      }
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  };

  const deleteDenuncia = async (denunciaId) => {
    try {
      const response = await fetch(
        `https://backend-swii.vercel.app/api/deleteDenuncia/${denunciaId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (await getToken()),
          },
        }
      );
      if (response.ok) {
        console.log(`Denuncia ${denunciaId} eliminada exitosamente`);
        setDenuncias((prevDenuncias) =>
          prevDenuncias.filter((denuncia) => denuncia._id !== denunciaId)
        );
      } else {
        console.error("Error eliminando la denuncia:", response.statusText);
      }
    } catch (error) {
      console.error("Error eliminando la denuncia:", error);
    }
  };

  const processDenuncia = async (denunciaId) => {
    try {
      const response = await fetch(
        `https://backend-swii.vercel.app/api/procesarDenuncia/${denunciaId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (await getToken()),
          },
          body: JSON.stringify({
            tipo: "BANEADO",
            tiempoBaneo: 86400, //variable puesta en segundos equivalente a 1 dia
          }),
        }
      );
      if (response.ok) {
        console.log(`Denuncia ${denunciaId} procesada exitosamente`);
        setModalMessage("Denuncia procesada exitosamente."); // Mensaje de éxito
        setModalSuccess(true); // Indicar que la operación fue exitosa
        setModalVisible(true);
      } else {
        console.error(
          `Error procesando la denuncia ${denunciaId}:`,
          response.statusText
        );
        setModalMessage("Error procesando la denuncia."); // Mensaje de error
        setModalSuccess(false); // Indicar que hubo un error
        setModalVisible(true);
      }
    } catch (error) {
      console.error(`Error procesando la denuncia ${denunciaId}:`, error);
      setModalMessage("Error procesando la denuncia."); // Mensaje de error
      setModalSuccess(false); // Indicar que hubo un error
      setModalVisible(true);
    }
  };

  useEffect(() => {
    fetchDenuncias();
  }, []);

  useEffect(() => {
    if (denuncias.length > 0) {
      const uniqueDenunciantes = new Set();
      const uniqueDenunciados = new Set();

      denuncias.forEach((denuncia) => {
        uniqueDenunciantes.add(denuncia.idDenunciante);
        uniqueDenunciados.add(denuncia.idComentario);
      });

      Promise.all(
        Array.from(uniqueDenunciantes).map((id) => fetchUserData(id))
      ).then(() => setUserDataLoading(false));

      Promise.all(
        Array.from(uniqueDenunciados).map((id) => fetchUserData(id))
      ).then(() => setUserDataLoading(false));
    }
  }, [denuncias]);

  // Función para eliminar una denuncia al bloquear u omitir
  const handleAction = (id, isOmit) => {
    if (isOmit) {
      deleteDenuncia(id);
    } else {
      processDenuncia(id);
      setDenuncias(denuncias.filter((denuncia) => denuncia._id !== id));
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/mainpage")}>
          <Image
            source={require("@/assets/images/backButtonLocal.png")}
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Image
          source={require("@/assets/images/Logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>FOODIGO</Text>
      </View>

      <Text style={styles.heading}>DENUNCIAS</Text>
      <Text style={styles.subheading}>Usuarios</Text>
      <View style={styles.separator} />

      {loading || userDataLoading ? (
        <ActivityIndicator size="large" color="#5a1a11" />
      ) : (
        <>
          {denuncias.length === 0 ? (
            <Text style={styles.noDenunciasText}>
              No se han encontrado denuncias
            </Text>
          ) : (
            <FlatList
              data={denuncias}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <Denuncia
                  userNames={userNames}
                  item={item}
                  handleAction={handleAction}
                />
              )}
            />
          )}
        </>
      )}
      <ModalNotificacion
        isVisible={modalVisible}
        isSuccess={modalSuccess}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  backButton: {
    width: 35,
    height: 35,
    marginRight: 15,
  },
  logo: {
    width: 30,
    height: 39,
    marginRight: 1,
  },
  title: {
    fontFamily: "League-Gothic",
    fontSize: 32,
    color: "black",
  },
  heading: {
    fontFamily: "Helios-Bold",
    fontSize: 24,
    color: "#black",
    marginVertical: 10,
    marginLeft: 20,
  },
  subheading: {
    fontSize: 14,
    fontFamily: "Times New Roman",
    color: "black",
    marginBottom: 10,
    marginLeft: 20,
  },
  separator: {
    height: 1.5,
    backgroundColor: "gray",
    width: "100%",
    marginVertical: 20,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    gap: 5,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
    flex: 1,
    borderWidth: 1,
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "column",
  },
  blockButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  omitButton: {
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  iconCircle: {
    backgroundColor: "#900d05",
    borderRadius: 16,
    padding: 4,
    marginRight: 5,
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
  },
  noDenunciasText: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    marginTop: 20,
  },
});

export default DenunciasScreenUsuarios;
