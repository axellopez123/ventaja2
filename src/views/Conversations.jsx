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

export default function Conversations(props) {
  const {} = props;
  const { id } = useParams();
  const { user } = useStateContext();

  const [loading, setLoading] = useState(false);
  const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/`;
  const [content, setContent] = useState("Quiero mas detalles sobre ...");
  const [conversations, setConversations] = useState([]);
  useEffect(() => {
    if (user?.conversations) {
      setConversations(user.conversations);
    }
  }, [user]);
  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-2 pb-16">
        {conversations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-4">
            No tienes conversaciones todavía.
          </p>
        ) : (
          conversations.map((msg) => {
            const lastMessage = msg.last_message || {};
            return (
              <Link
                key={msg.id}
                to={`/conversation/${msg.id}`}
                className="flex items-center justify-between p-3 mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition"
              >
                {/* Parte izquierda (producto + mensaje) */}
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {msg.product_info?.name || "Sin producto asignado"}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 text-sm truncate max-w-[220px]">
                    <span className="font-medium">
                      {lastMessage.sender_username || "Sistema"}:{" "}
                    </span>
                    {lastMessage.content || "Sin mensajes"}
                  </span>
                </div>

                {/* Parte derecha (fecha) */}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-3 whitespace-nowrap">
                  {lastMessage.created_at
                    ? new Date(lastMessage.created_at).toLocaleString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                      })
                    : ""}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
