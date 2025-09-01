import { Link, useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

export default function Game() {
  const pcRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    // 1. Abrir WebSocket con backend
    const ws = new WebSocket("wss://ventaja-backend.arwax.pro/ws/webrtc/123");
    wsRef.current = ws;

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "answer") {
        const answer = msg.answer;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Answer recibida y aplicada");
      } else if (msg.type === "ice-candidate") {
        await pc.addIceCandidate(msg.candidate);
      }
    };

    ws.onopen = async () => {
      // 2. Capturar audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // 3. Crear offer y enviarla al backend
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      ws.send(
        JSON.stringify({
          type: "offer",
          offer: {
            sdp: offer.sdp,
            type: offer.type,
          },
        })
      );

      // 4. Manejar ICE candidates y enviarlos
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
    };

    return () => {
      pc.close();
      ws.close();
    };
  }, []);

  return <p>🎮 Conectando con WebRTC...</p>;
}