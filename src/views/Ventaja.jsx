import React, { useEffect, useRef, useState } from "react";
import axiosFastApi from "../axiosFastApi";

function Ventaja() {
  const entrenarModelo = async () => {
    try {
      const { data } = await axiosFastApi.post("/play/train");
      setPartida(data); // 👉 Guardamos la partida para mostrar el juego
      console.log(data);
    } catch (err) {
      console.error("❌ Error al entrenar:", err);
    } finally {
    }
  };

  return (
    <div>
      <button
        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-xl shadow-lg transition mb-4"
        onClick={entrenarModelo}
      >
        Entrenar modelo 
      </button>
    </div>
  );
}

export default Ventaja;
