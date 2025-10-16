import React, { useEffect, useRef, useState } from "react";
import axiosFastApi from "../axiosFastApi";
import lata from "../assets/lata.png";
import hand from "../assets/hand.png";
import pato from "../assets/pato.png";
import { Link } from "react-router-dom";

const Levels = () => {

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gradient-to-b from-amber-50 to-amber-100 min-h-screen">
      {/* Título */}
      <p className="text-5xl font-extrabold uppercase text-amber-800 drop-shadow-sm tracking-widest">
        Niveles
      </p>

      {/* Contenedor de niveles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        {/* Tarjeta Nivel 1 */}
                    <Link
              to={`/game/1`}>
        <div className="flex items-center justify-between border-4 border-amber-300 rounded-2xl bg-white shadow-lg p-4 hover:scale-105 transition-transform">
          <div className="flex flex-col justify-center text-amber-900">
            <p className="text-2xl font-bold uppercase tracking-wide">
              Nivel 1
            </p>
            <p className="text-xl font-medium mt-1">ma • me • mi • mo • mu</p>
          </div>
          <img
            src={hand}
            alt="mano"
            className="w-28 h-28 object-contain animate-pulse"
          />
        </div>
        </Link>

        {/* Tarjeta Nivel 2 */}
        <div className="flex items-center justify-between border-4 border-green-300 rounded-2xl bg-white shadow-lg p-4 hover:scale-105 transition-transform">
          <div className="flex flex-col justify-center text-green-900">
            <p className="text-2xl font-bold uppercase tracking-wide">
              Nivel 2
            </p>
            <p className="text-xl font-medium mt-1">la • le • li • lo • lu</p>
          </div>
          <img
            src={lata}
            alt="lata"
            className="w-28 h-28 object-contain opacity-80 hover:opacity-100"
          />
        </div>
        {/* Tarjeta Nivel 2 */}
        <div className="flex items-center justify-between border-4 border-green-300 rounded-2xl bg-white shadow-lg p-4 hover:scale-105 transition-transform">
          <div className="flex flex-col justify-center text-green-900">
            <p className="text-2xl font-bold uppercase tracking-wide">
              Nivel 3
            </p>
            <p className="text-xl font-medium mt-1">pa • pe • pi • po • pu</p>
          </div>
          <img
            src={pato}
            alt="lata"
            className="w-28 h-28 object-contain opacity-80 hover:opacity-100"
          />
        </div>
      </div>

    </div>
  );
};

export default Levels;
