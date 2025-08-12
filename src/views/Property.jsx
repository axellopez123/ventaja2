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

export default function Property() {
  const { id } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/`;
  const [info, setInfo] = useState("Quiero mas detalles sobre ...");

  const [property, setProperty] = useState({
    id: null,
    name: "",
    bedrooms: undefined,
    bathrooms: undefined,
    cleanrooms: undefined,
    parkings: undefined,
    address: undefined,
    moodsBuy: [],
    price: undefined,
    discount: undefined,
    sizeLength: undefined,
    sizeWidth: undefined,
    level: undefined,
    floors: undefined,
    typeMode: [],
    type: [],
    appliances: undefined,
    status: undefined,
  });
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setInfo(value);
  };

  // const handleTextChange = (e) => {
  //   const { name, value } = e.target;
  //   setProperty((prev) => ({ ...prev, [name]: value }));
  // };

  useEffect(() => {
    if (!id) return; // modo “crear”, sin fetch

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Gei: ${id}`);

        // 1) producto
        const { data: prod } = await axiosClient.get(`/products/${id}`);
        setProperty(prod);
        console.log(`Property: ${property}`);

        // // 2) imágenes
        // const { data: imgs } = await axiosClient.get(`/imagesNames/${id}`);
        setImages(prod.images); // ya son { id, preview, main }
        console.log(`Images: ${images.length}`);

        // // opcional: portada
        const coverIdx = images.findIndex((i) => i.main);
        if (coverIdx !== -1) setCoverIndex(coverIdx);
      } catch (err) {
        console.error(err);
        setErrors(err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const imageGalleryItems = images.map((img) => ({
    original: `${baseUrl}${img.original}`,
    thumbnail: `${baseUrl}${img.thumbnail}`,
  }));
  return (
    <>
      <div>
        <ImageGallery
          items={imageGalleryItems}
          showThumbnails={false}
          showBullets={true}
          showFullscreenButton={false}
          showPlayButton={false}
          renderLeftNav={(onClick, disabled) => (
            <button
              aria-label="Previous image"
              onClick={onClick}
              disabled={disabled}
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 
        bg-white/80 hover:bg-white shadow-lg rounded-full p-2 z-20
        backdrop-blur-sm border border-gray-200 
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-105"}`}
            >
              <RiArrowLeftLine className="w-5 h-5 text-gray-800" />
            </button>
          )}
          renderRightNav={(onClick, disabled) => (
            <button
              aria-label="Next image"
              onClick={onClick}
              disabled={disabled}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-200 
        bg-white/80 hover:bg-white shadow-lg rounded-full p-2 z-20
        backdrop-blur-sm border border-gray-200 
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-105"}`}
            >
              <RiArrowRightLine className="w-5 h-5 text-gray-800" />
            </button>
          )}
          renderBullet={(index, className, isSelected, onClick) => (
            <button
              key={index}
              aria-label={`Select image ${index + 1}`}
              className={`w-3 h-3 mx-1 rounded-full transition-all duration-200 ${
                isSelected
                  ? "bg-blue-600 scale-110 shadow"
                  : "bg-gray-300 hover:bg-gray-500"
              }`}
              onClick={() => onClick(index)}
            />
          )}
        />
      </div>
      <div>
        <div className="pt-3 px-5 flex justify-between items-center">
          {/* Contenedor scroll para moodsBuy */}
          <div className="flex overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
            {property.moodsBuy &&
              property.moodsBuy.map((type) => {
                return (
                  <div className="bg-green-500 rounded-xl px-3 py-1 w-fit text-white text-sm font-semibold mr-2">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </div>
                );
              })}
          </div>
          
        </div>
       <Box className="px-3 pt-2 flex justify-between items-center">
  <p className="flex-1 text-white text-4xl font-bold truncate">{property.name}</p>
  <div className="flex ml-4">
    <GoHome className="text-4xl text-bold" />
  </div>
</Box>
        <Box className="pl-5">
          <span className="text-white font-semibold text-3xl">
            {new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: "MXN",
            }).format(property.price)}
          </span>
        </Box>
        {/* Características scroll horizontal */}
        <div className="flex overflow-x-auto gap-4 py-2 snap-x pl-5 sm:px-2  md:px-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700 scroll-smooth hover:scrollbar-thumb-blue-400">
          {/* Características scroll horizontal */}
          <div className="w-full overflow-x-auto py-2 scroll-smooth scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700 hover:scrollbar-thumb-blue-400">
            <div className="flex items-center gap-4 snap-x snap-mandatory min-w-full">
              {/* Recámaras */}
              {property.bedrooms ? (
                <div className="snap-center flex flex-col items-center gap-1 px-4 py-2 border-2 border-orange-500 rounded-lg bg-[#fcfcfc] min-w-max">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-bold">
                      {property.bedrooms}
                    </span>
                    <FaBed className="text-orange-500 text-xl" />
                  </div>
                  <span className="text-xs text-gray-600">Recs.</span>
                </div>
              ) : (
                <Box sx={{}}>
                  <Skeleton width={70} height={70} />
                </Box>
              )}
              {property.bathrooms ? (
                <div className="snap-center flex flex-col items-center gap-1 px-4 py-2 border-2 border-orange-500 rounded-lg bg-[#fcfcfc] min-w-max">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-bold">
                      {property.bathrooms}
                    </span>
                    <LuToilet className="text-orange-500 text-xl" />
                  </div>
                  <span className="text-xs text-gray-600">W.C.</span>
                </div>
              ) : (
                <Box sx={{}}>
                  <Skeleton width={70} height={70} />
                </Box>
              )}
              {property.parkings ? (
                <div className="snap-center flex flex-col items-center gap-1 px-4 py-2 border-2 border-orange-500 rounded-lg bg-[#fcfcfc] min-w-max">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-bold">
                      {property.parkings}
                    </span>
                    <IoCarSport className="text-orange-500 text-xl" />
                  </div>
                  <span className="text-xs text-gray-600">Cajón</span>
                </div>
              ) : (
                <Box sx={{}}>
                  <Skeleton width={70} height={70} />
                </Box>
              )}
              {property.cleanrooms ? (
                <div className="snap-center flex flex-col items-center gap-1 px-4 py-2 border-2 border-orange-500 rounded-lg bg-[#fcfcfc] min-w-max">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-bold">
                      {property.cleanrooms}
                    </span>
                    <BiSolidWasher className="text-orange-500 text-xl" />
                  </div>
                  <span className="text-xs text-gray-600">Lavado</span>
                </div>
              ) : (
                <Box sx={{}}>
                  <Skeleton width={70} height={70} />
                </Box>
              )}
            </div>
          </div>
        </div>
        <div className="w-full py-2">
          <p className="text-center text-2xl">Medidas</p>
        </div>
        <div className="flex items-center  justify-center gap-4 divide-x divide-gray-300">
          <div className="flex items-center gap-1 pl-3">
            <TbRulerMeasure2 className="text-orange-500 text-3xl" />
            <span className="text-3xl">20 m</span>
          </div>
          <div className="flex items-center gap-1 pl-3">
            <TbRulerMeasure className="text-orange-500 text-3xl" />
            <span className="text-3xl">10 m</span>
          </div>
          <div className="flex items-center gap-1 pl-3">
            <LuBrickWall className="text-orange-500 text-3xl" />
            <span className="text-3xl">80 m</span>
          </div>
        </div>
        <div className="w-full pt-2">
          <div className="px-3">
            <TextField
              id="info"
              name="info"
              label="Pedir más información"
              variant="standard"
              value={info}
              onChange={handleTextChange}
              fullWidth
              rows={4}
              defaultValue="Quiero mas detalles sobre ..."
              multiline
            />
          </div>
          <div className="flex justify-center pt-3 px-3">
            <Button variant="contained" className="w-full">
              Enviar
            </Button>
          </div>
          <Link
            to={`/properties/${id}`}
            className="flex justify-center pt-3 px-3"
          >
            <Button variant="contained" className="w-full">
              Editar
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
