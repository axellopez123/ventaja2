import React, { useEffect, useRef } from "react";

const Game = () => {
  const wsRef = useRef(null);
  const pcRef = useRef(null);

  useEffect(() => {
    const startWebRTC = async () => {
      // 1. Abrir WebSocket primero
      const ws = new WebSocket(
        "wss://ventaja-backend.arwax.pro/api/webrtc/ws/webrtc/123"
      );
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log("✅ WS conectado");

        // 2. Crear RTCPeerConnection
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        pcRef.current = pc;

        // 3. Capturar audio y añadir track
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // 4. Manejar ICE candidates
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

        // 5. Crear offer y enviarla
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.send(JSON.stringify({ type: "offer", offer }));
      };

      // 6. Respuesta del backend
      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "answer") {
          await pcRef.current.setRemoteDescription(msg.answer);
          console.log("📥 Answer aplicada");
        } else if (msg.type === "vad_advanced") {
          console.log(msg);
        } else if (msg.type === "audio_analysis") {
          console.log("🔎 Análisis:", msg.data);
        } else if (msg.type === "ice-candidate") {
          try {
            await pcRef.current.addIceCandidate(msg.candidate);
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
    </div>
  );
};

export default Game;
