import React, { useEffect, useRef,useState } from "react";

const Game = () => {
  const wsRef = useRef(null);
  const pcRef = useRef(null);
    const [estado, setEstado] = useState("Desconocido");

function activarMicrofono() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => console.log('Micrófono activado'))
    .catch(err => console.error(err));
}
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
          // iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          iceServers: [
            // { urls: "stun:stun.l.google.com:19302" }, // respaldo STUN público
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

        // 3. Capturar audio y añadir track
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1, // mono (o 2 si quieres estéreo)
            sampleRate: 16000, // más calidad
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
          // video: true,
        });
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        // 3. Preferir códec Opus 48kHz
        pc.getTransceivers().forEach((transceiver) => {
          if (transceiver.sender?.track?.kind === "audio") {
            const capabilities = RTCRtpSender.getCapabilities("audio");
            if (capabilities?.codecs) {
              const opus = capabilities.codecs.find(
                (c) => c.mimeType.toLowerCase() === "audio/opus"
              );
              if (opus) {
                transceiver.setCodecPreferences([opus]);
                console.log("🎵 Usando codec:", opus);
              }
            }
          }
        });

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
  const pedirPermiso = async () => {
    try {
      // Primero verificamos el estado del permiso
      const permiso = await navigator.permissions.query({ name: "microphone" });

      console.log("Estado del permiso:", permiso.state);
      setEstado(permiso.state);

      if (permiso.state === "granted") {
        // Ya tiene permiso → activamos el micrófono
        activarMicrofono();
      } else if (permiso.state === "prompt") {
        // Pedimos permiso
        activarMicrofono();
      } else {
        // Denegado
        alert("Permiso de micrófono denegado, cambia la configuración del navegador");
      }

      // Escuchar cambios en el permiso
      permiso.onchange = () => {
        console.log("Cambio de permiso:", permiso.state);
        setEstado(permiso.state);
      };
    } catch (err) {
      console.error("No se pudo verificar el permiso:", err);
    }
  };
  return (
    <div className="p-4 max-w-lg mx-auto bg-gray-100 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Transmisión de audio WebRTC</h2>
      <p>Abre la consola para ver la negociación y los logs de audio 👀</p>
      <button onClick={pedirPermiso}>Activar micrófono</button>
<button onClick={async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Micrófono activado", stream);
  } catch (err) {
    console.error("Error accediendo al micrófono:", err);
    alert("Permiso denegado o no disponible");
  }
}}>
  Activar micrófono2
</button>
    </div>
  );
};

export default Game;
