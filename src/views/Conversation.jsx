import {
  React,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
// import Image from 'next/image'
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import Card from "../components/shared/Card";
import { FaBed } from "react-icons/fa";
import { IoCarSport } from "react-icons/io5";
import { LuToilet } from "react-icons/lu";
import { GoHome } from "react-icons/go";
import { TbRulerMeasure2 } from "react-icons/tb";
import { TbRulerMeasure } from "react-icons/tb";
import { LuBrickWall } from "react-icons/lu";
import { Link } from "react-router-dom";
import { BsBuilding, BsHouse } from "react-icons/bs";
import { CgTerrain } from "react-icons/cg";
import { MdOutlineTerrain } from "react-icons/md";
import { IoSendSharp } from "react-icons/io5";

import {
  RiCloseCircleLine,
  RiHotelBedFill,
  RiSparkling2Fill,
} from "react-icons/ri";
import { LiaToiletSolid } from "react-icons/lia";
import { FaCarSide, FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { BiSolidWasher } from "react-icons/bi";
import { SiGooglemaps } from "react-icons/si";
import { IoCameraOutline, IoClose } from "react-icons/io5";
import TextField from "@mui/material/TextField";
import { NumericFormat } from "react-number-format";
import Skeleton from "@mui/material/Skeleton";

export default function Conversation() {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/`;
  const [content, setContent] = useState("Quiero mas detalles sobre ...");
  const [messages, setMessages] = useState([]);


  const ws = useRef(null);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    ws.current = new WebSocket(`wss://back-properties.arwax.pro/ws/chat/${id}`);

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return () => ws.current.close();
  }, [id]);

  const handleSend = async () => {
    if (!content.trim()) return;

    try {
      setLoading(true);

      const { data } = await axiosClient.post(`/messages/`, {
        content,
        // conversation_id: null, // dejar null para que cree nueva si no existe
      });

      console.log("Mensaje enviado:", data);
      setContent("");
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      // setErrors(err.response?.data);
    } finally {
      // setLoading(false);
    }
  };


  useEffect(() => {

    const fetchData = async () => {
      try {
        setLoading(true);

        await axiosClient.get(`/messages/conversations/${id}/messages`)
          .then(({ data }) => {
            setMessages(data);
            console.log(data);
          })
          .catch(({ }) => {

          })


      } catch (err) {
        console.error(err);
        // setErrors(err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="relative h-full flex flex-col">
      {/* Contenedor de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 pb-16">
        {messages.map((msg) => (
          <div className="mb-2 bg-gray-500 rounded-md pl-2 py-1">
            {/* <div key={msg.id} className="mb-2"> */}

            <span>{msg.content}</span>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="absolute bottom-0 w-full bg-gray-500 px-4 py-2 flex items-center gap-2">
        <TextField
          id="content"
          name="content"
          label="Pedir más información"
          variant="standard"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          placeholder="Quiero más detalles sobre ..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <IoSendSharp />
        </button>
      </div>
    </div>

  );
}
