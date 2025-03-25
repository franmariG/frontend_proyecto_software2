import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  Modal,
  Dimensions,
  Linking,
} from "react-native";
import { Tab, TabView } from "@rneui/themed";
import Icon from "@expo/vector-icons/FontAwesome";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useCookies } from "react-cookie";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PlaceholderFotoPerfil from "../components/PlaceholderFotoPerfil";
import ModalCrearComentario from "../components/ModalCrearComentario";
import TabDescripcion from "../components/Local/TabDescripcion";
import TabOpiniones from "../components/Local/TabOpiniones";
import PlaceholderFoto from "../components/PlaceHolderFoto";
import PlaceholderText from "../components/PlaceholderText";
import { jwtDecode as decode } from "jwt-decode";
import { set } from "react-hook-form";
import ModalEditarComentario from "../components/ModalEditarComentario";
import { useFonts } from "expo-font";
import ReportComment from "../view/ReportComment";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import ModalEditarLocal from "../components/ModalEditarLocal";
import ModalConfirmarAccion from "@/components/ModalConfirmarAccion";
import ModalNotificacion from "@/components/ModalNotificacion";
import ModalDeCarga from "@/components/ModalDeCarga";
import ReportLocal from "./ReportLocal";
import TabBrujula from "../components/Local/TabBrujula";
import url from "@/constants/url";

const ModalFoto = ({ foto, setDataModalFoto }) => {
  return (
    <Modal visible={foto != null} transparent animationType="slide">
      <Pressable
        onPress={() => {
          setDataModalFoto(null);
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor: "#000000ac",
          flex: 1,
          width: "100%",
          height: "100%",
        }}
      />
      <Pressable
        onPress={() => {
          setDataModalFoto(null);
        }}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          borderWidth: 1,
        }}
      >
        <Image
          source={{ uri: foto }}
          style={{
            width: "100%",
            height: 500,
            resizeMode: "contain",
          }}
        />
      </Pressable>
    </Modal>
  );
};

const Local = () => {
  const params = useLocalSearchParams();
  const navigate = useRouter();
  const [comentarios, setComentarios] = useState([]);
  const [restaurante, setRestaurante] = useState({
    fotoPerfil: "",
  });
  const [modalCrearComentarioVisible, setModalCrearComentarioVisible] =
    useState(false);
  const [cookies] = useCookies(["token"]);
  const [liked, setLiked] = useState(false);
  const [comentarioAEditar, setComentarioAEditar] = useState(null);
  const [comentarioADenunciar, setComentarioADenunciar] = useState(null);
  const [modalEditarComentario, setModalEditarComentario] = useState(false);
  const [modalReportComentario, setModalReportComentario] = useState(false);
  const [modalReportLocal, setModalReportLocal] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [idUser, setIdUser] = useState(null);
  const [modalEditaLocalVisible, setModalEditaLocalVisible] = useState(false);
  const [modalExito, setModalExito] = useState({
    isVisible: false,
    isSuccess: false,
    message: "",
  });
  const [modalConfirmarAccionVisible, setModalConfirmarAccionVisible] =
    useState(false);
  const [modalCarga, setModalCarga] = useState(false);
  const [dataModalFoto, setDataModalFoto] = useState(null);

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
    setIdUser(decoded.sub);
    return decoded.sub;
  };

  const getDatosDelRestaurante = async () => {
    const response = await fetch(
      url + "api/getRestaurant/" + params.restaurante,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + (await getToken()),
        },
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      setRestaurante(data.restaurantFound);
      setComentarios(data.restaurantFound.reviews);
      setLiked(data.liked);
    } else {
      console.log("error");
      console.log(response);
    }
  };

  useEffect(() => {
    if (!params.restaurante) {
      console.log("no hay restaurante");
      navigate.back();
      return;
    }

    getDatosDelRestaurante();
  }, [modalCrearComentarioVisible, modalEditarComentario]);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "League-Gothic": require("../assets/fonts/LeagueGothic-Regular.ttf"),
        "Open-Sans": require("../assets/fonts/OpenSans-Regular.ttf"),
      });
      setFontsLoaded(true);
    };
    loadFonts();
    getUserId();
  }, []);

  const [index, setIndex] = useState(0);

  const calcCantidadOpiniones = (comentarios) => {
    const cantidad = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    comentarios.forEach(({ calificacion }) => {
      cantidad[calificacion] += 1;
    });
    return cantidad;
  };

  const toggleLike = async () => {
    try {
      if (!liked) {
        setLiked(true);
        const response = await fetch(url + "api/addFavoriteRestaurant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (await getToken()),
          },
          body: JSON.stringify({
            restaurantId: restaurante._id,
          }),
        });

        if (response.status === 200) {
          const data = await response.json();
        } else {
          console.log("error Liked");
          setLiked(false);
        }
      } else {
        setLiked(false);
        const response = await fetch(
          url + "api/deleteRestaurantFromLiked/" + (await getUserId()),
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + (await getToken()),
            },
            body: JSON.stringify({
              idRestaurants: [restaurante._id],
            }),
          }
        );

        if (response.status === 200) {
          const data = await response.json();
        } else {
          console.log("error DisLiked");
          setLiked(true);
        }
      }
    } catch (error) {
      console.log(error);
      setLiked(!liked);
    }
  };

  const eliminarLocal = async () => {
    setModalCarga(true);
    try {
      const response = await fetch(
        url + "api/deleteRestaurant/" + restaurante._id,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + (await getToken()),
          },
        }
      );

      if (response.status == 200) {
        const data = await response.json();
        console.log(data);
        setModalConfirmarAccionVisible(false);
        setModalCarga(false);
        setModalExito({
          isVisible: true,
          message: "Local eliminado exitosamente",
          isSuccess: true,
        });
      } else {
        console.log("Error Eliminar Local");
        console.log(response);
        setModalConfirmarAccionVisible(false);
        setModalCarga(false);
        setModalExito({
          isVisible: true,
          message: "Error al eliminar local",
          isSuccess: false,
        });
      }
    } catch (err) {
      console.log("Error Eliminar Local");
      console.log(err);
      setModalConfirmarAccionVisible(false);
      setModalCarga(false);
      setModalExito({
        isVisible: true,
        message: "Error fulminante al eliminar local",
        isSuccess: false,
      });
    }
  };

  const cantidad = calcCantidadOpiniones(comentarios);
  const maxOpiniones = Math.max(...Object.values(cantidad));

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={{ paddingHorizontal: 10, paddingTop: 10 }}>
          <View style={styles.header}>
            <Pressable onPress={() => navigate.back()}>
              <Icon name="chevron-left" size={35} color="#8c0e03" />
            </Pressable>
            <Image
              source={require("../assets/images/logo_recortado.png")}
              style={styles.logo}
            />
            <Text style={styles.titulo}>FOODIGO</Text>

            {optionsVisible && (
              <View
                style={{
                  position: "absolute",
                  top: 25,
                  right: 33,
                  borderWidth: 1,
                  borderColor: "#00000098",
                  borderRadius: 4,
                  backgroundColor: "#FFF",
                  zIndex: 10,
                }}
              >
                {idUser != null && idUser == restaurante.own ? (
                  <>
                    <TouchableOpacity
                      style={{ paddingVertical: 15, paddingHorizontal: 20 }}
                      onPress={() => {
                        setOptionsVisible(false);
                        setModalEditaLocalVisible(true);
                      }}
                    >
                      <Text style={{ fontWeight: 500 }}>Editar Local</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ paddingVertical: 15, paddingHorizontal: 20 }}
                      onPress={() => {
                        setOptionsVisible(false);
                        setModalConfirmarAccionVisible(true);
                      }}
                    >
                      <Text style={{ fontWeight: 500 }}>Eliminar Local</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={{ paddingVertical: 15, paddingHorizontal: 20 }}
                      onPress={() => {
                        setModalReportLocal(true);
                        setOptionsVisible(false);
                      }}
                    >
                      <Text style={{ fontWeight: 500 }}>Denunciar Local</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            <TouchableOpacity
              onPress={() => setOptionsVisible(!optionsVisible)}
              style={{
                position: "absolute",
                right: 10,
                paddingLeft: 10,
                paddingVertical: 10,
              }}
            >
              <SimpleLineIcons
                name="options-vertical"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.restauranteInfo}>
            <Text style={styles.restauranteNombre}>{restaurante.name}</Text>
            {restaurante.own ? (
              <Text
                style={{
                  marginBottom: 10,
                  fontSize: 13,
                  letterSpacing: 1.1,
                  fontStyle: "italic",
                  fontWeight: 300,
                }}
              >
                {restaurante._id}
              </Text>
            ) : (
              <PlaceholderText
                width={200}
                fontSize={10}
                style={{ marginTop: 4 }}
              />
            )}
            <View style={styles.seccion}>
              {restaurante.own && restaurante.own != idUser && (
                <Pressable onPress={toggleLike} style={{ marginRight: 10 }}>
                  <Icon
                    name={liked ? "heart" : "heart-o"}
                    type="font-awesome"
                    size={30}
                    color="#8c0e03"
                    style={{ ...styles.iconos }}
                  />
                </Pressable>
              )}
              <Icon
                name="comments"
                type="font-awesome"
                size={30}
                color="#2199e4"
                style={styles.iconos}
              />

              {!restaurante.reviews ? (
                <PlaceholderText
                  style={{
                    width: "30",
                    marginRight: 8,
                  }}
                  width={30}
                  fontSize={20}
                />
              ) : (
                <Text style={styles.ratingText}>
                  {restaurante.reviews ? restaurante.reviews.length : 0}
                </Text>
              )}
              <Icon
                name="star"
                type="font-awesome"
                size={30}
                color="#e4dd21"
                style={styles.iconos}
              />
              {!restaurante.reviews ? (
                <PlaceholderText
                  style={{
                    width: "30",
                    marginRight: 8,
                  }}
                  width={30}
                  fontSize={20}
                />
              ) : (
                <Text style={styles.ratingText}>
                  {restaurante.reviews.length > 0 &&
                    (
                      restaurante.reviews.reduce(
                        (a, b) => parseInt(a) + parseInt(b.calification),
                        0
                      ) / restaurante.reviews.length
                    ).toFixed(1)}
                  {restaurante.reviews.length == 0 && "0"}
                </Text>
              )}
              <Pressable
                style={{
                  marginLeft: 5,
                  backgroundColor: "#f1c40f",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  gap: 7,
                }}
                onPress={() => {
                  console.log(
                    `https://www.google.com/maps/search/?api=1&query=${restaurante.latitude}%2C${restaurante.longitude}`
                  );
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=${restaurante.latitude}%2C${restaurante.longitude}`
                  );
                }}
              >
                <Icon name="map" size={20} color="#3498db" />
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>
                  Ver en Maps
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={{
              ...styles.imageLogoContainer,
            }}
          >
            {!restaurante.fotoPerfil ? (
              <PlaceholderFoto width={"100%"} height={"100%"} />
            ) : (
              <TouchableOpacity
                style={{ flex: 1, width: "100%", height: "100%" }}
                onPress={() => setDataModalFoto(restaurante.fotoPerfil)}
              >
                <Image
                  source={{ uri: restaurante.fotoPerfil }}
                  style={{ ...styles.fixedImage }}
                />
              </TouchableOpacity>
            )}
          </View>

          <Tab
            value={index}
            onChange={setIndex}
            indicatorStyle={{ backgroundColor: "#07f" }}
            style={styles.tabvistas}
            // scrollable={true}
          >
            <Tab.Item
              title="Descripcion"
              titleStyle={{
                color: index === 0 ? "#07f" : "gray",
              }}
            />
            <Tab.Item
              title="Opiniones"
              titleStyle={{
                color: index === 1 ? "#07f" : "gray",
              }}
            />
            {/* <Tab.Item
              title="Brujula"
              titleStyle={{
                color: index === 2 ? "#07f" : "gray",
              }}
            /> */}
          </Tab>
        </View>

        <TabView
          value={index}
          onChange={setIndex}
          animationType="spring"
          minSwipeRatio={0.3}
          containerStyle={{ width: Dimensions.get("window").width }}
          tabItemContainerStyle={{ paddingHorizontal: 10 }}
        >
          {/* Descripcion */}
          <TabDescripcion
            restaurante={restaurante}
            setDataModalFoto={setDataModalFoto}
          />

          {/* Opiniones */}
          <TabOpiniones
            restaurante={restaurante}
            setModalEditarComentarioVisible={setModalEditarComentario}
            setModalCrearComentarioVisible={setModalCrearComentarioVisible}
            setComentarioAEditar={setComentarioAEditar}
            setModalReportComentario={setModalReportComentario}
            setComentarioADenunciar={setComentarioADenunciar}
            getDatosDelRestaurante={getDatosDelRestaurante}
          />
          {/* <TabBrujula
            latitude={restaurante.latitude}
            longitude={restaurante.longitude}
          /> */}
        </TabView>
      </SafeAreaView>
      <ModalCrearComentario
        restaurante={restaurante}
        visible={modalCrearComentarioVisible}
        onClose={() => setModalCrearComentarioVisible(false)}
      />
      <ModalEditarComentario
        restaurante={restaurante}
        onClose={() => {
          setComentarioAEditar(null);
          setModalEditarComentario(false);
        }}
        visible={modalEditarComentario}
        comentario={comentarioAEditar}
      />
      <ReportComment
        visible={modalReportComentario}
        onClose={() => {
          setModalReportComentario(false);
        }}
        idRestaurante={restaurante.description ? restaurante._id : ""}
        idComentario={
          comentarioADenunciar != null ? comentarioADenunciar.idUser : ""
        }
      />
      {restaurante.own && (
        <ModalEditarLocal
          visible={modalEditaLocalVisible}
          onClose={() => {
            setRestaurante({
              fotoPerfil: "",
            });
            getDatosDelRestaurante();
            setModalEditaLocalVisible(false);
          }}
          localData={restaurante}
        />
      )}
      <ModalConfirmarAccion
        visible={modalConfirmarAccionVisible}
        setVisible={setModalConfirmarAccionVisible}
        accion={eliminarLocal}
        message="¿Desea Eliminar este Local?"
      />
      <ModalNotificacion
        isSuccess={modalExito.isSuccess}
        message={modalExito.message}
        isVisible={modalExito.isVisible}
        onClose={() => {
          setModalExito({
            isVisible: false,
            message: "",
            isSuccess: false,
          });
          navigate.replace("mainpage");
        }}
      />
      <ModalDeCarga visible={modalCarga} />
      {restaurante.own && (
        <ModalFoto foto={dataModalFoto} setDataModalFoto={setDataModalFoto} />
      )}
      {restaurante.own && (
        <ReportLocal
          visible={modalReportLocal}
          idRestaurante={restaurante._id}
          onClose={() => setModalReportLocal(false)}
        />
      )}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: "Open-Sans",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
  },
  titulo: {
    fontFamily: "League-Gothic",
    color: "#000",
    fontSize: 50,
    fontWeight: 700,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  CalificacionDistribucionContainer: {
    marginBottom: 20,
    width: "50%",
  },
  ratingBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },

  barraCalificacionFondo: {
    flex: 1,
    height: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "#656874",
    overflow: "hidden",
    padding: 1,
  },

  barraCalificacionRelleno: {
    height: "100%",
    backgroundColor: "#f4b400",
    borderRadius: 5,
  },

  ratingCount: {
    width: 30,
    textAlign: "center",
  },

  total: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#00000029",
  },

  promedioTexto: {
    fontWeight: "bold",
    fontSize: 10,
  },

  puntuacionContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    alignItems: "left",
  },
  seccion: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconos: {
    marginRight: 3,
    width: 30,
    height: 30,
  },

  restauranteInfo: {
    padding: 10,
  },

  restauranteNombre: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 0,
  },

  restauranteTipo: {
    color: "gray",
    fontSize: 16,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  ratingText: {
    marginRight: 8,
    fontSize: 16,
    alignItems: "center",
    fontWeight: "bold",
  },

  tabVista: {
    width: "100%",
    padding: 10,
  },
  tabVistaComentarios: {
    width: "100%",
    height: 500,
    padding: 10,
  },
  tabvistas: {},

  lista: {
    width: 100,
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    borderRadius: 2,
    color: "black",
  },

  image: {
    marginTop: 10,
    width: 100,
    height: 100,
    marginRight: 10,
    resizeMode: "contain",
  },
  descripcion: {
    fontSize: 16,
    marginVertical: 5,
    alignItems: "center",
    flexDirection: "row",
    padding: 5,
    marginLeft: 10,
  },

  imageLogoContainer: {
    position: "relative",
    alignItems: "center",
    height: 220,
  },

  fixedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },

  logoContainer: {
    position: "absolute",
    bottom: "65%",
    right: 20,
    transform: [{ translateY: -40 }],
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    padding: 3,
  },

  circularLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 40,
  },

  circularLogoComent: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 40,
    marginLeft: 40,
  },
  calificacion: {
    alignSelf: "flex-start",
    marginVertical: 5,
    heigth: 2,
    width: 2,
    backgroundColor: "#fff",
  },
  calificacion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
});

export default Local;
