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

export default function Property() {
    const { id } = useParams();
    const [images, setImages] = useState([]);
      const [loading, setLoading] = useState(false);
      const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/`;

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
        <p>{property.name}</p>
                <p>{property.price}</p>

      </div>
    </>
  );
}
