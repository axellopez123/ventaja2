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
  const { conversations } = props;
  const { id } = useParams();
  const { user } = useStateContext();

  const [loading, setLoading] = useState(false);
  const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/`;
  const [content, setContent] = useState("Quiero mas detalles sobre ...");
  const [conversations2, setConversations2] = useState(conversations);

  console.log(user);

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-16">
        {/* {conversations2.map((msg, index) => (
          <div key={index} className="mb-2 bg-gray-500 rounded-md pl-2 py-1">
            <span>{msg}</span>
          </div>
        ))} */}
      </div>
    </div>

  );
}
