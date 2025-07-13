import React, { useState } from "react";
import { Link } from "react-router-dom";
import ImageGallery from "react-image-gallery";
// import { LuToilet } from "react-icons/lu";
import { FaBed } from "react-icons/fa";
import { IoCarSport } from "react-icons/io5";
import { BiSolidWasher } from "react-icons/bi";
import { LuToilet } from "react-icons/lu";

import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiHeartFill,
  RiHeartLine,
} from "react-icons/ri";
import axiosClient from "../../axios-client";

const Card = (props) => {
  const { id, img, description, price, bedrooms, bathrooms, isInitiallyFavorited } = props;
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

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto bg-[#1F1D2B] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col text-white">
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
                className={`w-3 h-3 mx-1 rounded-full transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-600 scale-110 shadow"
                    : "bg-gray-300 hover:bg-gray-500"
                }`}
                onClick={() => onClick(index)}
              />
            )}
            additionalClass="chroma-gallery"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400">Sin imágenes</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <p className="text-xl font-bold">{description}</p>
        <span className="text-gray-400 font-semibold">
          {new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
          }).format(price)}
        </span>

        {/* Características scroll horizontal */}
        <div className="flex overflow-x-auto gap-4 py-2 snap-x px-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-700 scroll-smooth hover:scrollbar-thumb-blue-400">
          <div className="snap-center flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md bg-[#2B2A3D] min-w-max">
            <FaBed className="text-blue-400" />
            <span>{bedrooms} </span>
          </div>
          <div className="snap-center flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md bg-[#2B2A3D] min-w-max">
            <LuToilet className="text-blue-400" />

            <span> {bathrooms} </span>
          </div>
          <div className="snap-center flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md bg-[#2B2A3D] min-w-max">
            <IoCarSport className="text-blue-400" />
            <span>3</span>
          </div>
          <div className="snap-center flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md bg-[#2B2A3D] min-w-max">
            <BiSolidWasher className="text-blue-400" />
            <span>4</span>
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
