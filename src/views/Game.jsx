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
import CompletarMesa from "../components/shared/CompletarMesa";
import CompletarMiel from "../components/shared/CompletarMiel";
import CompletarMono from "../components/shared/CompletarMono";
import CompletarMuro from "../components/shared/CompletarMuro";
import Puntaje from "../components/shared/Puntaje";
const Game = () => {
  const { level } = useParams();
  const navigate = useNavigate();

  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const [partida, setPartida] = useState(null); // 👉 guarda la partida creada
  const [loading, setLoading] = useState(false);
  const [mostrar, setMostrar] = useState(true);
  const [letra, setLetra] = useState(null);
  const [puntos, setPuntos] = useState(false);

  const [juego, setJuego] = useState(0);
  const speak = (text) => {
    // Detiene cualquier audio anterior
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 1;
    utterance.pitch = 1;

    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    setPartida(partida);
  }, [partida]);
  useEffect(() => {
    console.log(level);
    if (!partida) return; // solo abre WS cuando hay partida
    // speak(partida.feedback);
    const startWebRTC = async () => {
      const ws = new WebSocket(
        "wss://ventaja-backend.arwax.pro/api/webrtc/ws/webrtc/1"
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
        ws.send(
          JSON.stringify({
            type: "start",
            id_partida: partida.partida.id,
            id_ronda: partida.ronda.id,
          })
        );
        console.log("▶️ Juego iniciado para partida:", partida.id);
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "answer":
            await pcRef.current.setRemoteDescription(msg.answer);
            console.log("📥 Answer aplicada");
            break;
          case "vosk_word":
            // Aquí recibes la palabra detectada
            console.log("🔤 Palabra detectada por Vosk:", msg.word);
            // Si quieres mostrar en UI:
            // setDetectedWord(msg.word);
            break;
          case "analysis_feedback":
            console.log("🔤 RETRO:", msg);
            if (msg.evaluacion) {
              // speak(msg.feedback.feedback_text + msg.evaluacion.feedback);
              console.log(msg.feedback.feedback_text);
              speak(msg.feedback.feedback_text);
              setPartida(msg.evaluacion);
              if (letra != msg.evaluacion.nivel.letra_objetivo) {
                setPuntos(true);
              }
              console.log(partida);
            }
            break;
          case "next_play":
            // Aquí recibes la palabra detectada
            console.log("🔤 Siguiente:", msg);
            // Si quieres mostrar en UI:
            // setDetectedWord(msg.word);
            break;
          case "error":
            console.error("⚠️ Error recibido:", msg.message);
            break;

          default:
            console.warn("📦 Tipo de mensaje desconocido:", msg);
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
    setMostrar(false);
    setLoading(true);
    try {
      const { data } = await axiosFastApi.post("/play/iniciar", {
        id_jugador: 1, // jugador actual
        id_nivel: level, // nivel elegido
      });
      setPartida(data); // 👉 Guardamos la partida para mostrar el juego
      setLetra(data.nivel.letra_objetivo);
      console.log("✅ Partida creada:", data);
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
      >
        {" "}
        {/* 📹 Sección de video + controles (en columna en móvil, fila en desktop) */}
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
          <div className="flex  justify-center items-center gap-6 p-4 md:w-1/4 hidden lg:block">
            <button
              onClick={handlePlayPause}
              className="bg-orange-500 hover:bg-orange-600 text-white p-7 rounded-full shadow-md transition"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            {/* <button
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
            </button> */}
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
          <button
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-xl shadow-lg transition mb-4"
            onClick={iniciarPartida}
          >
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
          {/* <div className="mt-5">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={loading}
              onClick={iniciarPartida}
            >
              {loading ? "Iniciando..." : "▶ Iniciar Partida"}
            </button>
          </div> */}
        </div>
      </div>
            {puntos ? (
        <div>
          <Puntaje wsRef={wsRef} Partida={partida} setPuntos={setPuntos} setLetra={setLetra} />
        </div>
      ) : (
        <div></div>
      )}
      {partida && !puntos ? (
        <div>
          <Completar wsRef={wsRef} Partida={partida} />
        </div>
      ) : (
        <div></div>
      )}

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
      {/* {partida && juego === 1 ? (
        <Completar wsRef={wsRef} idPartida={partida.id} silabasParecidas={silabas} />
      ) : (
        <div></div>
      )}
      {partida && juego === 2 ? (
        <CompletarMano
          wsRef={wsRef}
          idPartida={partida.id}
          setJuego={setJuego}
        />
      ) : (
        <div></div>
      )}
      {partida && juego === 3 ? (
        <CompletarMesa
          wsRef={wsRef}
          idPartida={partida.id}
          setJuego={setJuego}
        />
      ) : (
        <div></div>
      )}
      {partida && juego === 4 ? (
        <CompletarMiel
          wsRef={wsRef}
          idPartida={partida.id}
          setJuego={setJuego}
        />
      ) : (
        <div></div>
      )}
      {partida && juego === 5 ? (
        <CompletarMono
          wsRef={wsRef}
          idPartida={partida.id}
          setJuego={setJuego}
        />
      ) : (
        <div></div>
      )}
      {partida && juego === 6 ? (
        <CompletarMuro
          wsRef={wsRef}
          idPartida={partida.id}
          setJuego={setJuego}
        />
      ) : (
        <div></div>
      )}
      {partida && juego === 7 ? (
        <Puntaje
          puntaje={8}
          total={10}
        // setPartida={setPartida} setMostrar={setMostrar}
        ></Puntaje>
      ) : (
        <div></div>
      )} */}
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
