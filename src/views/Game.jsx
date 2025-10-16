import React, { useEffect, useRef, useState } from "react";
import axiosFastApi from "../axiosFastApi";
import lata from "../assets/lata.png";
import hand from "../assets/hand.png";
import pato from "../assets/pato.png";
import { useNavigate, useParams } from "react-router-dom";

import Completar from "../components/shared/Completar";
const Game = () => {
  const { level } = useParams();
  const navigate = useNavigate();

  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const [partida, setPartida] = useState(null); // 👉 guarda la partida creada
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log(level);
    
    if (!partida) return; // solo abre WS cuando hay partida

    const startWebRTC = async () => {
      const ws = new WebSocket(
        "wss://ventaja-backend.arwax.pro/api/webrtc/ws/webrtc/123"
      );
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log("✅ WS conectado");

        const pc = new RTCPeerConnection({
          iceServers: [
            {
              urls: [
                "turn:arwax.pro:3478?transport=udp",
                "turn:arwax.pro:3478?transport=tcp",
              ],
              username: "master",
              credential: "weedgreen",
            },
          ],
        });
        pcRef.current = pc;

        // Capturar micrófono directo
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            ws.send(
              JSON.stringify({
                type: "ice-candidate",
                candidate: event.candidate,
              })
            );
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: "offer", offer }));
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "answer") {
          await pcRef.current.setRemoteDescription(msg.answer);
          console.log("📥 Answer aplicada");
        } else if (msg.type === "vosk_word") {
          // Aquí recibes la palabra detectada
          console.log("🔤 Palabra detectada por Vosk:", msg.word);
          // Si quieres mostrar en UI:
          // setDetectedWord(msg.word);
        }
      };

      ws.onerror = (err) => console.error("❌ WS error:", err);
      ws.onclose = () => console.warn("⚠️ WS cerrado");
    };

    startWebRTC();

    return () => {
      wsRef.current?.close();
      pcRef.current?.close();
    };
  }, [partida]);

  // ---- INICIAR PARTIDA ----
  const iniciarPartida = async () => {
    setLoading(true);
    try {
      const { data } = await axiosFastApi.post("/play/iniciar", {
        id_jugador: 1, // jugador actual
        id_nivel: 1, // nivel elegido
      });
      setPartida(data); // 👉 Guardamos la partida para mostrar el juego
      console.log("✅ Partida creada:", data);
    } catch (err) {
      console.error("❌ Error al iniciar partida:", err);
      alert("No se pudo iniciar la partida");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!partida ? (
        <button
          onClick={iniciarPartida}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Iniciando..." : "▶ Iniciar Partida"}
        </button>
      ) : (
        <Completar wsRef={wsRef} idPartida={partida.id} />
      )}
    </div>
  );
};

export default Game;
