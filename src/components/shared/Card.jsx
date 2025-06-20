import React, { useState } from "react";
import { Link } from "react-router-dom";
import ImageGallery from "react-image-gallery";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiHeartFill,
  RiHeartLine,
} from "react-icons/ri";

const Card = (props) => {
  const { id, img, description, price, inventory } = props;
  // const [favorited, setFavorited] = useState(isInitiallyFavorited);
  const [favorited, setFavorited] = useState(false);

  const handleToggle = () => {
    setFavorited((prev) => !prev);
    if (onToggle) onToggle(!favorited);
  };
  return (
    <div className="bg-[#1F1D2B] min-h-[300px] rounded-xl flex flex-col items-center gap-2 text-center text-gray-300 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full h-[200px] md:h-[250px] bg-gray-200">
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
              <div className="w-full h-[200px] md:h-[250px] overflow-hidden rounded-xl bg-gray-100">
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

      <p className="text-xl">{description}</p>
      <span className="text-gray-400">${price}</span>
      <p className="text-gray-600">{inventory} Bowls available</p>
      <Link to={"/properties/" + id}>Edit</Link>
    </div>
  );
};

export default Card;
