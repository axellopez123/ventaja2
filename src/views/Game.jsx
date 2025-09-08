import React, { useEffect, useRef } from "react";
import ThreeScene from "../components/shared/ThreeScene";
const Game = () => {
  const wsRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
    const startWebRTC = async () => {
      // 1. Crear RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Puedes añadir TURN si tienes
        ],
      });
      pcRef.current = pc;

      // 2. Capturar audio
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        // video: true,
      });
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 3. Manejar ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          wsRef.current.send(
            JSON.stringify({
              type: "ice-candidate",
              candidate: event.candidate,
            })
          );
        }
      };

      // 4. Abrir WebSocket
      const ws = new WebSocket(
        "wss://ventaja-backend.arwax.pro/api/webrtc/ws/webrtc/123"
      );
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log("✅ WS conectado");

        // 5. Crear offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 6. Enviar offer al backend
        ws.send(JSON.stringify({ type: "offer", offer }));
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "answer") {
          await pc.setRemoteDescription(msg.answer);
          console.log("📥 Answer aplicada");
        } else if (msg.type === "vad") {
          console.log("Análisis de audio:", msg.data);
          // Actualiza UI
        } else if (msg.type === "ice-candidate") {
          try {
            await pc.addIceCandidate(msg.candidate);
          } catch (err) {
            console.warn("⚠️ Error agregando ICE candidate:", err);
          }
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

  return (
    <div className="p-4 max-w-lg mx-auto bg-gray-100 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Transmisión de audio WebRTC</h2>
      <p>Abre la consola para ver la negociación y los logs de audio 👀</p>
      {/* <ThreeScene /> */}
    </div>
  );
};

export default Game;
