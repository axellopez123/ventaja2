import React, { useEffect, useRef } from "react";

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
