import React, { useState } from "react";
import { Link } from "react-router-dom";
import ImageGallery from "react-image-gallery";
// import { LuToilet } from "react-icons/lu";
import { FaBed } from "react-icons/fa";
import { IoCarSport } from "react-icons/io5";
import { BiSolidWasher } from "react-icons/bi";
import { LuToilet } from "react-icons/lu";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiHeartFill,
  RiHeartLine,
} from "react-icons/ri";
import axiosClient from "../../axios-client";

const Card = (props) => {
  const {
    id,
    img,
    description,
    price,
    bedrooms,
    bathrooms,
    parkings,
    cleanrooms,
    typeMode,
    moodsBuy,
    status,
    isInitiallyFavorited,
  } = props;
  const [favorited, setFavorited] = useState(isInitiallyFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (favorited) {
        // Quitar favorito → DELETE
        await axiosClient.delete(`/products/favorites/${id}`);
        setFavorited(false);
      } else {
        // Agregar favorito → POST
        await axiosClient.post(`/products/favorites/${id}`, {
          comment: "Producto agregado a favoritos",
          rating: 5,
        });
        setFavorited(true);
      }
    } catch (error) {
      console.error("Error al actualizar favorito:", error);
      // opcional: mostrar notificación o revertir estado
    } finally {
      setLoading(false);
    }
  };

  console.log(typeMode);

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto bg-[#1F1D2B] rounded-xl shadow-lg hover:shadow-xl shadow-gray-700/70 transition-shadow duration-300 flex flex-col text-white">
      <div className="relative w-full h-[200px] md:h-[250px]">
        <button
          className="absolute -bottom-5 right-5 bg-white/90 hover:bg-white text-red-500 p-2 rounded-full shadow-md transition-all z-30"
          onClick={handleToggle}
          aria-label="Marcar como favorito"
        >
          {favorited ? (
            <RiHeartFill className="w-7 h-7" />
          ) : (
            <RiHeartLine className="w-7 h-7" />
          )}
        </button>
        {img.length > 0 ? (
          <ImageGallery
            items={img} // Este debe ser un array de objetos { original, thumbnail }
            showFullscreenButton={false}
            showPlayButton={false}
            showBullets={true}
            showThumbnails={false}
            showNav={true}
            slideDuration={250}
            slideInterval={500}
            renderItem={(item) => (
              <div className="w-full h-[200px] md:h-[250px] overflow-hidden rounded-t-xl bg-gray-100">
                <img
                  src={item.original}
                  alt={item.originalAlt || "Imagen"}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  style={{ imageRendering: "auto" }}
                />
              </div>
            )}
            renderLeftNav={(onClick, disabled) => (
              <button
                aria-label="Previous image"
                onClick={onClick}
                disabled={disabled}
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 bg-white/80 hover:bg-white shadow-lg rounded-full p-2 z-20 backdrop-blur-sm border border-gray-200 
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
                className={`w-3 h-3 mx-1 rounded-full transition-all duration-200 ${isSelected
                  ? "bg-blue-600 scale-110 shadow"
                  : "bg-gray-300 hover:bg-gray-500"
                  }`}
                onClick={() => onClick(index)}
              />
            )}
            additionalClass="chroma-gallery"
          />
        ) : (
          <Box className="w-full h-[200px] md:h-[250px] overflow-hidden rounded-t-xl">
            <Skeleton width="100%" height="100%" variant="rectangular" />
          </Box>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-start">
          {typeMode.map((type) => {
            <div className="bg-green-500 rounded-xl px-3 py-1 w-fit text-white text-sm font-semibold mr-2">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
          })}
        </div>
        {description ? (
          <Box sx={{ pr: 2 }}>
            <p className="text-xl font-bold">{description}</p>
          </Box>
        ) : (
          <Box sx={{ pt: 0.5 }}>
            <Skeleton width="60%" height={40} />
          </Box>
        )}
        {price ? (
          <Box sx={{ pr: 2 }}>
            <span className="text-gray-400 font-semibold">
              {new Intl.NumberFormat("es-MX", {
                style: "currency",
                currency: "MXN",
              }).format(price)}
            </span>
          </Box>
        ) : (
          <Box sx={{ pt: 0.5 }}>
            <Skeleton width="60%" height={40} />
          </Box>
        )}
        {/* Características scroll horizontal */}
        <div className="flex overflow-x-auto gap-4 py-2 snap-x px-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700 scroll-smooth hover:scrollbar-thumb-blue-400">
          {/* Características scroll horizontal */}
          <div className="w-full overflow-x-auto py-2 px-2 scroll-smooth scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700 hover:scrollbar-thumb-blue-400">
            <div className="flex items-center gap-4 snap-x snap-mandatory min-w-full">
              {/* Recámaras */}
              {bedrooms ? (
                <div className="snap-center flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md bg-[#2B2A3D] min-w-max">
                  <FaBed className="text-orange-500" />
                  <span>{bedrooms}</span>
                </div>
              ) : (
                <Box sx={{}}>
                  <Skeleton width={70} height={70} />
                </Box>
              )}
              {bathrooms ? (
                <div className="snap-center flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md bg-[#2B2A3D] min-w-max">
                  <LuToilet className="text-orange-500" />
                  <span>{bathrooms}</span>
                </div>
              ) : (
                <Box sx={{}}>
                  <Skeleton width={70} height={70} />
                </Box>
              )}
              {parkings ? (
                <div className="snap-center flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md bg-[#2B2A3D] min-w-max">
                  <IoCarSport className="text-orange-500" />
                  <span>{parkings}</span>
                </div>
              ) : (
                <Box sx={{}}>
                  <Skeleton width={70} height={70} />
                </Box>
              )}
              {cleanrooms ? (
                <div className="snap-center flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md bg-[#2B2A3D] min-w-max">
                  <BiSolidWasher className="text-orange-500" />
                  <span>{cleanrooms}</span>
                </div>
              ) : (
                <Box sx={{}}>
                  <Skeleton width={70} height={70} />
                </Box>
              )}
            </div>
          </div>
        </div>

        <Link
          to={`/properties/${id}`}
          className="text-blue-400 underline text-sm mt-2 self-start hover:text-blue-300"
        >
          Editar propiedad
        </Link>
      </div>
    </div>
  );
};

export default Card;
