import os
import json
import uuid
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, MediaStreamTrack, MediaStreamTrack
from aiortc.contrib.media import MediaBlackhole, MediaRecorder
from aiortc.sdp import candidate_from_sdp

from pydub import AudioSegment
import io
import speech_recognition as sr
import asyncio
import av
import numpy as np
import webrtcvad

from ..core.connection_manager import manager as connection_manager
from ..core.turn_manager import get_turn_credentials
from ..schemas.webrtc import (
    WebRTCOffer,
    WebRTCAnswer,
    WebRTCICECandidate,
    AudioAnalysisResponse
)

router = APIRouter()
logger = logging.getLogger("webrtc")

# Configuración de audio
AUDIO_SETTINGS = {
    "sample_rate": 16000,
    "channels": 1,
    "sample_width": 2,  # 16-bit
    "format": "wav",
    "recording_dir": "recordings"
}

os.makedirs(AUDIO_SETTINGS["recording_dir"], exist_ok=True)
pcs: dict[str, RTCPeerConnection] = {}
recorders: dict[str, MediaRecorder] = {}

async def cleanup(client_id: str):
    logger.info(f"🧹 Limpiando conexión {client_id}")

    recorder = recorders.pop(client_id, None)
    if recorder:
        try:
            await recorder.stop()
        except Exception as e:
            logger.warning(f"No se pudo detener recorder: {e}")

    pc = pcs.pop(client_id, None)
    if pc:
        await pc.close()

    logger.info(f"✅ Conexión {client_id} cerrada limpiamente")
    
    
class AudioAnalysisTrack1(MediaStreamTrack):
    kind = "audio"

    def __init__(self, track, websocket):
        super().__init__()
        self.track = track
        # self.callback = callback  # Función a llamar con audio PCM
        self.websocket = websocket

    async def recv(self):
        frame = await self.track.recv()
        # pcm = frame.to_ndarray()  # Numpy array de audio (canales, muestras)
        # self.callback(pcm, frame.sample_rate)
        pcm = frame.to_ndarray().flatten()
        # Llamar análisis asincrónico
        asyncio.create_task(analyze_audio(pcm, frame.sample_rate, self.websocket))
        return frame
    
class AudioAnalysisTrack(MediaStreamTrack):
    kind = "audio"

    def __init__(self, track, websocket, frame_duration_ms=30):
        super().__init__()
        self.track = track
        self.websocket = websocket
        self.frame_duration_ms = frame_duration_ms
        self.buffer = bytearray()  # buffer de PCM
        self.sample_rate = None

    async def recv(self):
        frame = await self.track.recv()
        pcm = frame.to_ndarray().flatten()
        self.sample_rate = frame.sample_rate

        # Convertimos a bytes y acumulamos
        self.buffer.extend(pcm.tobytes())

        frame_len_bytes = int(self.sample_rate * self.frame_duration_ms / 1000) * 2  # 2 bytes int16

        # Procesar todos los frames completos en buffer
        while len(self.buffer) >= frame_len_bytes:
            frame_bytes = self.buffer[:frame_len_bytes]
            self.buffer = self.buffer[frame_len_bytes:]

            is_speech = vad.is_speech(frame_bytes, self.sample_rate)
            # Enviar resultado inmediato
            if self.websocket.application_state == "connected":
                await self.websocket.send_json({
                    "type": "vad",
                    "is_speech": is_speech
                })
            # Opcional: imprimir en consola sin acumular tareas
            print("WW" if is_speech else "ZZ", end="")

        return frame
    
vad = webrtcvad.Vad(2)  # 0-3 agresividad

async def analyze_audio(pcm, sample_rate, websocket):
    # pcm: shape (samples,) - mono, int16
    # fragmentar en frames de 10/20/30ms
    frame_duration = 30  # ms
    frame_len = int(sample_rate * frame_duration / 1000)
    results = []

    for i in range(0, len(pcm), frame_len):
        frame = pcm[i:i+frame_len].tobytes()
        if len(frame) < frame_len * 2:
            continue
        is_speech = vad.is_speech(frame, sample_rate)
        print("WW" if is_speech else "ZZ", end="")
        results.append({"frame_index": i // frame_len, "is_speech": is_speech})

    if websocket.application_state == "connected":
        await websocket.send_json({
            "type": "audio_analysis",
            "data": {
                "speech_frames": results
            }
        })

#------------------------------------

pcs = {}
@router.websocket("/ws/webrtc/{client_id}")
async def webrtc_ws(websocket: WebSocket, client_id: str):
    await websocket.accept()
    pc = RTCPeerConnection()
    pcs[client_id] = pc
    ice_buffer = []
    recorder = None
    remote_set = asyncio.Event()

    @pc.on("track")
    def on_track(track: MediaStreamTrack):
        if track.kind == "audio":
            analysis_track = AudioAnalysisTrack(track, websocket)

            filename = os.path.join(AUDIO_SETTINGS["recording_dir"], f"{client_id}.wav")
            recorder = MediaRecorder(filename)
            recorder.addTrack(track)
            recorders[client_id] = recorder
            asyncio.create_task(recorder.start())
            #Esto funcionaba con el otro track class
            # asyncio.ensure_future(recorder.start())
            # pc.addTrack(analysis_track)

    # remote_set = asyncio.Event()

    try:
        while True:
            msg = await websocket.receive_json()
            msg_type = msg.get("type")
            print(msg)
            if msg_type == "offer":
                offer = RTCSessionDescription(**msg["offer"])
                await pc.setRemoteDescription(offer)
                remote_set.set()

                # Procesar ICE buffer
                for c in ice_buffer:
                    await pc.addIceCandidate(c)
                ice_buffer.clear()

                answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)

                await websocket.send_json({
                    "type": "answer",
                    "answer": {
                        "sdp": pc.localDescription.sdp,
                        "type": pc.localDescription.type
                    }
                })

            elif msg_type == "ice-candidate":
                candidate = msg["candidate"]
                c = msg["candidate"]
                
                if c and c.get("candidate"):
                    parsed = candidate_from_sdp(c["candidate"])
                    candidate = RTCIceCandidate(
                        foundation=parsed.foundation,
                        component=parsed.component,
                        priority=parsed.priority,
                        ip=parsed.ip,
                        protocol=parsed.protocol,
                        port=parsed.port,
                        type=parsed.type,
                        # tcpType=parsed.tcptype,
                        relatedAddress=parsed.relatedAddress,
                        relatedPort=parsed.relatedPort,
                        sdpMid=c.get("sdpMid"),
                        sdpMLineIndex=c.get("sdpMLineIndex"),
                    )

                    if remote_set.is_set():
                        await pc.addIceCandidate(candidate)
                    else:
                        ice_buffer.append(candidate)

    except WebSocketDisconnect:
        logger.info(f"Cliente {client_id} desconectado")
    except Exception as e:
        logger.error(f"Error WebSocket {client_id}: {str(e)}")
    finally:
        await cleanup(client_id)
        try:
            await websocket.close()
        except Exception:
            pass

#------------------------------------


@router.websocket("/ws/webrtc2/{client_id}")
async def webrtc_websocket(websocket: WebSocket, client_id: str):
    try:
  # 2. Registrar la conexión
        await connection_manager.connect(websocket, client_id)
        data = await websocket.receive_text()
        print(f"Cliente dice: {data}")

        # 3. Enviar configuración ICE inicial
        await connection_manager.send_message({
            "type": "ice-servers",
            "servers": connection_manager.get_ice_servers()
        }, client_id)
        # await connection_manager.broadcast(f"Client #{client_id} says: {data}")
        # await connection_manager.broadcast({
        #     "type": "client-message",
        #     "client_id": client_id,
        #     "data": data
        # })

        # 4. Bucle principal de mensajes
        while True:
            try:
                data = await websocket.receive_json()
                message_type = data.get("type")

                if message_type == "offer":
                    await handle_offer(client_id, data)
                elif message_type == "answer":
                    await handle_answer(client_id, data)
                elif message_type == "ice-candidate":
                    await handle_ice_candidate(client_id, data)
                elif message_type == "close":
                    break

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON from {client_id}")
                await connection_manager.send_error(client_id, "Invalid message format")
            except Exception as e:
                logger.error(f"Processing error for {client_id}: {str(e)}")
                await connection_manager.send_error(client_id, f"Processing error: {str(e)}")

    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected")
    except Exception as e:
        logger.error(f"Connection error for {client_id}: {str(e)}")
    finally:
        await connection_manager.disconnect(client_id)

@router.websocket("/ws/webrtc3/{client_id}")
async def webrtc_websocket2(websocket: WebSocket, client_id: str):
    # Añade headers manualmente si es necesario
    await websocket.accept(headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true"
    })
    """Endpoint WebSocket para comunicación WebRTC"""
    await connection_manager.connect(websocket, client_id)
    
    try:
        # Enviar configuración ICE inicial
        await connection_manager.send_message({
            "type": "ice-servers",
            "servers": connection_manager.get_ice_servers()
        }, client_id)

        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")

            if message_type == "offer":
                await handle_offer(client_id, data)
            elif message_type == "answer":
                await handle_answer(client_id, data)
            elif message_type == "ice-candidate":
                await handle_ice_candidate(client_id, data)
            elif message_type == "close":
                await connection_manager.disconnect(client_id)
                break

    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected normally")
        await connection_manager.disconnect(client_id)
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON received from {client_id}")
        await connection_manager.send_error(client_id, "Invalid message format")
    except Exception as e:
        logger.error(f"Unexpected error with {client_id}: {str(e)}")
        await connection_manager.send_error(client_id, f"Server error: {str(e)}")
        await connection_manager.disconnect(client_id)

async def handle_offer(client_id: str, data: dict):
    """Maneja una oferta WebRTC entrante"""
    try:
        # Validar y parsear la oferta
        offer = WebRTCOffer(**data["offer"])
        pc = connection_manager.create_peer_connection(client_id)
        
        if not pc:
            raise ValueError("Failed to create peer connection")

        # Configurar manejadores de eventos
        @pc.on("icecandidate")
        async def on_icecandidate(candidate):
            if candidate:
                await connection_manager.send_message({
                    "type": "ice-candidate",
                    "candidate": {
                        "candidate": candidate.candidate,
                        "sdpMid": candidate.sdpMid,
                        "sdpMLineIndex": candidate.sdpMLineIndex
                    }
                }, client_id)

        @pc.on("track")
        def on_track(track):
            logger.info(f"Track received from {client_id}: {track.kind}")
            print(1)
            if track.kind == "audio":
                print("x")
                setup_audio_processing(client_id, pc, track)

        # Procesar la oferta
        await pc.setRemoteDescription(
            RTCSessionDescription(sdp=offer.sdp, type=offer.type)
        )
        
        # Crear y enviar respuesta
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        
        await connection_manager.send_message({
            "type": "answer",
            "answer": {
                "sdp": pc.localDescription.sdp,
                "type": pc.localDescription.type
            }
        }, client_id)

    except Exception as e:
        logger.error(f"Error handling offer from {client_id}: {str(e)}")
        await connection_manager.send_error(client_id, f"Offer processing failed: {str(e)}")
        raise

def setup_audio_processing(client_id: str, pc: RTCPeerConnection, track):
    print(1)
    """Configura el procesamiento de audio en tiempo real"""
    recognizer = sr.Recognizer()
    
    # async def process_audio():
    #         buffer = bytearray()
    #         sample_rate = None

    #         while True:
    #             try:
    #                 frame: AudioFrame = await track.recv()

    #                 # Conversión del frame a PCM (mono, 16 bits)
    #                 samples = frame.to_ndarray()
    #                 sample_rate = frame.sample_rate

    #                 # Normaliza a mono si es estéreo
    #                 if samples.ndim == 2:
    #                     samples = samples.mean(axis=0)

    #                 # Convertir a int16 PCM
    #                 pcm_data = samples.astype(np.int16).tobytes()
    #                 buffer.extend(pcm_data)

    #                 # Procesar cada 2 segundos (2 segundos * 16000 muestras/seg * 2 bytes = 64000 bytes aprox)
    #                 if len(buffer) > sample_rate * 2 * 2:
    #                     audio_data = sr.AudioData(bytes(buffer), sample_rate, 2)
    #                     try:
    #                         text = recognizer.recognize_google(audio_data, language="es-ES")
    #                         logger.info(f"[{client_id}] Reconocido: {text}")
    #                     except sr.UnknownValueError:
    #                         logger.warning(f"[{client_id}] No se pudo reconocer el audio")
    #                     except sr.RequestError as e:
    #                         logger.error(f"[{client_id}] Error con el servicio de reconocimiento: {e}")

    #                     buffer.clear()

    #             except asyncio.CancelledError:
    #                 break
    #             except Exception as e:
    #                 logger.exception(f"[{client_id}] Error al procesar audio: {e}")
    #                 break

    # # Lanzamos la tarea de procesamiento
    # asyncio.ensure_future(process_audio())


    audio_buffer = io.BytesIO()
    
    @track.on("ended")
    async def on_ended():
        logger.info(f"Audio track ended for {client_id}")
        await connection_manager.send_message({
            "type": "audio-analysis",
            "status": "ended"
        }, client_id)

    @track.on("data")
    async def on_audio_data(data):
        try:
            print(f"Received audio data from {client_id}")

            # Convertir datos de audio a formato procesable
            audio_segment = AudioSegment(
                data=data.to_ndarray().tobytes(),
                sample_width=AUDIO_SETTINGS["sample_width"],
                frame_rate=AUDIO_SETTINGS["sample_rate"],
                channels=AUDIO_SETTINGS["channels"]
            )
            
            # Guardar en buffer
            audio_segment.export(audio_buffer, format=AUDIO_SETTINGS["format"])
            audio_buffer.seek(0)
            
            # Procesar audio con SpeechRecognition
            with sr.AudioFile(audio_buffer) as source:
                audio_data = recognizer.record(source)
                text = recognizer.recognize_google(
                    audio_data,
                    language="es-ES",
                    show_all=False
                )
                
                # Enviar transcripción al cliente
                await connection_manager.send_message({
                    "type": "audio-analysis",
                    "text": text,
                    "is_final": True
                }, client_id)
                
        except sr.UnknownValueError:
            await connection_manager.send_message({
                "type": "audio-analysis",
                "error": "No se pudo reconocer el audio"
            }, client_id)
        except Exception as e:
            logger.error(f"Audio processing error for {client_id}: {str(e)}")
            await connection_manager.send_error(client_id, f"Audio processing error: {str(e)}")

async def handle_answer(client_id: str, data: dict):
    """Maneja una respuesta WebRTC entrante"""
    try:
        pc = connection_manager.active_connections[client_id].peer_connection
        if not pc:
            raise ValueError("No active peer connection")
        
        answer = WebRTCAnswer(**data["answer"])
        await pc.setRemoteDescription(
            RTCSessionDescription(sdp=answer.sdp, type=answer.type)
        )
    except Exception as e:
        logger.error(f"Error handling answer from {client_id}: {str(e)}")
        await connection_manager.send_error(client_id, f"Answer processing failed: {str(e)}")
        raise

async def handle_ice_candidate(client_id: str, data: dict):
    """Maneja un candidato ICE entrante"""
    try:
        pc = connection_manager.active_connections[client_id].peer_connection
        if not pc:
            raise ValueError("No active peer connection")
        
        candidate = WebRTCICECandidate(**data["candidate"])
        await pc.addIceCandidate(
            RTCIceCandidate(
                candidate.candidate,
                candidate.sdpMid,
                candidate.sdpMLineIndex
            )
        )
    except Exception as e:
        logger.error(f"Error handling ICE candidate from {client_id}: {str(e)}")
        await connection_manager.send_error(client_id, f"ICE candidate processing failed: {str(e)}")

@router.get("/turn-credentials")
async def get_turn_config():
    """Endpoint para obtener credenciales TURN actualizadas"""
    credentials = get_turn_credentials()
    return JSONResponse(
        content=credentials,
        headers={"Cache-Control": "public, max-age=1800"}  # Cache de 30 minutos
    )