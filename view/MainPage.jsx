import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsideMainPage from "../components/mainPage/AsideMainPage";
import BotonFlecha from "../components/mainPage/BotonFlecha";
import Colors from "../constants/Colors";
import CameraMain from "../components/mainPage/cameraMain";
import BotonConfiguracion from "../components/mainPage/BotonConfiguracion";
import { useRouter } from "expo-router";

function LineasDeEsquina() {
  return (
    <>
      <View style={stylesLineasDeEsquina.esquinaSuperiorDerecha} />
      <View style={stylesLineasDeEsquina.esquinaSuperiorIzquierda} />
      <View style={stylesLineasDeEsquina.esquinaInferiorIzquierda} />
      <View style={stylesLineasDeEsquina.esquinaInferiorDerecha} />
    </>
  );
}

const TAMAÑO_CAJA_ESQUINA = 80;

const stylesLineasDeEsquina = StyleSheet.create({
  esquinaSuperiorDerecha: {
    position: "absolute",
    top: 35,
    right: 15,
    width: TAMAÑO_CAJA_ESQUINA,
    height: TAMAÑO_CAJA_ESQUINA,
    borderRightColor: Colors.white,
    borderTopColor: Colors.white,
    borderWidth: 2,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    pointerEvents: "none",
  },
  esquinaSuperiorIzquierda: {
    position: "absolute",
    top: 35,
    left: 15,
    width: TAMAÑO_CAJA_ESQUINA,
    height: TAMAÑO_CAJA_ESQUINA,
    borderRightColor: "transparent",
    borderTopColor: Colors.white,
    borderWidth: 2,
    borderBottomColor: "transparent",
    borderLeftColor: Colors.white,
    pointerEvents: "none",
  },
  esquinaInferiorIzquierda: {
    position: "absolute",
    bottom: 15,
    left: 15,
    width: TAMAÑO_CAJA_ESQUINA,
    height: TAMAÑO_CAJA_ESQUINA,
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    borderWidth: 2,
    borderBottomColor: Colors.white,
    borderLeftColor: Colors.white,
    pointerEvents: "none",
  },
  esquinaInferiorDerecha: {
    position: "absolute",
    bottom: 15,
    right: 15,
    width: TAMAÑO_CAJA_ESQUINA,
    height: TAMAÑO_CAJA_ESQUINA,
    borderRightColor: Colors.white,
    borderTopColor: "transparent",
    borderWidth: 2,
    borderBottomColor: Colors.white,
    borderLeftColor: "transparent",
    pointerEvents: "none",
  },
});

export default function MainPage() {
  const [visible, setVisible] = useState(false);
  const navigate = useRouter();

  useEffect(() => {
    
  }, []);

  return (
    <View style={{ height: "100%", backgroundColor: Colors.primary }}>
      <CameraMain />
      <BotonFlecha
        onPress={() => {
          console.log("visible", visible);
          setVisible(!visible);
        }}
      />
      {/* <BotonConfiguracion /> */}
      <AsideMainPage setVisible={setVisible} visible={visible} />
      <LineasDeEsquina />
    </View>
  );
}
