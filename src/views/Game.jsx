import React, { useEffect, useRef, useState } from "react";
import axiosFastApi from "../axiosFastApi";
import lata from "../assets/lata.png";
import hand from "../assets/hand.png";
import pato from "../assets/pato.png";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaPlay,
  FaPause,
  FaRedoAlt,
  FaVolumeUp,
  FaArrowRight,
} from "react-icons/fa";
import m_ins from "../assets/m_ins.mp4";
import Completar from "../components/shared/Completar";
import CompletarMano from "../components/shared/CompletarMano";
const Game = () => {
  const { level } = useParams();
  const navigate = useNavigate();

  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const [partida, setPartida] = useState(null); // 👉 guarda la partida creada
  const [loading, setLoading] = useState(false);
    const [mostrar, setMostrar] = useState(true);
    const [juego, setJuego] = useState(1);

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
    setMostrar(false)
    setLoading(true);
    try {
      // const { data } = await axiosFastApi.post("/play/iniciar", {
      //   id_jugador: 1, // jugador actual
      //   id_nivel: 1, // nivel elegido
      // });
      // setPartida(data); // 👉 Guardamos la partida para mostrar el juego
      // console.log("✅ Partida creada:", data);
      setPartida(1);
    } catch (err) {
      console.error("❌ Error al iniciar partida:", err);
      alert("No se pudo iniciar la partida");
    } finally {
      setLoading(false);
    }
  };

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
  };

  const handleVolume = () => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = volume === 1 ? 0 : 1;
    video.volume = newVolume;
    setVolume(newVolume);
  };
  return (
    <div>

<div
  className={`flex flex-col md:flex-row items-center justify-center min-h-screen bg-gradient-to-b from-orange-100 to-white p-4 ${
    mostrar ? "" : "hidden"
  }`}
>        {/* 📹 Sección de video + controles (en columna en móvil, fila en desktop) */}
        <div className="flex flex-col md:flex-row items-center md:items-start bg-amber-200/40 rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
          {/* 🎬 Video */}
          <div className="relative w-full md:w-3/4 aspect-square bg-amber-200/10">
            <video
              ref={videoRef}
              className="w-full h-full object-contain rounded-l-2xl"
              src={m_ins}
              poster="/images/cover_m.png"
              controls={false}
            />
          </div>

          {/* 🎛️ Controles a la derecha (desktop) */}
          <div className="flex md:flex-col justify-center items-center gap-6 p-4 md:w-1/4 hidden lg:block">
            <button
              onClick={handlePlayPause}
              className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-md transition"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <button
              // onClick={handleRestart}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md transition"
            >
              <FaRedoAlt />
            </button>

            <button
              // onClick={toggleVolume}
              className={`p-3 rounded-full shadow-md transition ${
                volume === 1
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-400"
              }`}
            >
              <FaVolumeUp />
            </button>
            <div className="mt-5 flex justify-center">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                disabled={loading}
                onClick={iniciarPartida}
              >
                {loading ? "Iniciando..." : "▶ Iniciar Partida"}
              </button>
            </div>
          </div>
        </div>

        {/* 🚀 Botón Comenzar (y en móvil, los controles debajo) */}
        <div className="mt-6 md:mt-0 text-center md:hidden w-full flex flex-col items-center block md:hidden">
          <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-xl shadow-lg transition mb-4">
            Comenzar Juego <FaArrowRight className="inline ml-2" />
          </button>

          {/* Controles en móvil (debajo) */}
          <div className="flex justify-center gap-6">
            <button
              onClick={handlePlayPause}
              className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-md transition"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <button
              // onClick={handleRestart}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-md transition"
            >
              <FaRedoAlt />
            </button>

            <button
              // onClick={toggleVolume}
              className={`p-3 rounded-full shadow-md transition ${
                volume === 1
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-400"
              }`}
            >
              <FaVolumeUp />
            </button>
          </div>
          <div className="mt-5">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={loading}
              onClick={iniciarPartida}
            >
              {loading ? "Iniciando..." : "▶ Iniciar Partida"}
            </button>
          </div>
        </div>
      </div>
      {/* {!partida ? (
      
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={loading}
          onClick={iniciarPartida}
        >
          {loading ? "Iniciando..." : "▶ Iniciar Partida"}
        </button>
      ) : (
        <Completar wsRef={wsRef} idPartida={partida.id} />
      )} */}
      {partida && juego === 1 ? (
        <Completar wsRef={wsRef} idPartida={partida.id} setJuego={setJuego} />
      ) : (
        <div></div>
      )}
      {partida && juego === 2 ? (
        <CompletarMano wsRef={wsRef} idPartida={partida.id} setJuego={setJuego} />
      ) : (
        <div></div>
      )}
      {/* 🚀 Botón continuar */}
      {/* <div className="mt-8 text-center">
      <button
        // onClick={goToNext}
        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-xl shadow-lg transition"
      >
        Comenzar Juego <FaArrowRight className="inline ml-2" />
      </button>
    </div> */}
    </div>
  );
};

export default Game;
