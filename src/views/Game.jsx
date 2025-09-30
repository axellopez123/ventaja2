import React, { useEffect, useRef } from "react";
import axiosFastApi from "../axiosFastApi";

const Game = () => {
  const wsRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
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
  }, []);

const iniciarPartida = async (idJugador, idNivel) => {
  try {
    const payload = {
      id_jugador: idJugador,
      id_nivel: idNivel
    };

    const { data } = await axiosFastApi.post("/play/iniciar", payload);

    console.log("✅ Partida creada:", data);
    // data.id_partida → usar al abrir el WebSocket
    // data.palabra → mostrar en el UI
    // data.imagen → renderizar la imagen
    return data;

  } catch (error) {
    console.error("❌ Error al iniciar partida:", error.response?.data || error.message);
    throw error;
  }
};

const handleStart = async () => {
  try {
    // ejemplo: jugador logueado id=7 y nivel=2 (Colores)
    const partida = await iniciarPartida(7, 2);
    
    // // renderiza la palabra e imagen en pantalla
    // setPalabraActual(partida.palabra);
    // setImagen(partida.imagen);

    // // abrir el WebSocket y comenzar el juego
    // openWebSocket(partida.id_partida);

  } catch (e) {
    alert("No se pudo iniciar la partida");
  }
};

  const handleStartGame = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: "start",
        id_partida: 1,   // usa el ID real de la partida
      })
    );
  };


  return (
    <div className="p-4 max-w-lg mx-auto bg-gray-100 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Transmisión de audio WebRTC</h2>
      <p>Abre la consola para ver la negociación y los logs de audio 👀</p>
            <button className="bg-green-500" onClick={handleStart}>▶Partida</button>

      <button className="bg-red-500" onClick={handleStartGame}>▶️ Comenzar</button>

      <button
        onClick={async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
            console.log("🎙️ Micrófono activado:", stream);
          } catch (err) {
            console.error("Error accediendo al micrófono:", err);
            alert("Permiso denegado o no disponible");
          }
        }}
      >
        Activar micrófono
      </button>
    </div>
  );
};

export default Game;
