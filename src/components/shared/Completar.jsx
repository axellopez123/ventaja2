import React, { useState } from "react";

/**
 * Props esperadas:
 *  - imagen: URL de la imagen de la palabra
 *  - palabra: palabra incompleta (ej. "_LO")
 *  - silabasOpciones: array de sílabas a escoger (ej. ["BA", "LA", "LE", "LO"])
 *  - silabaCorrecta: la sílaba que completa la palabra (ej. "LA")
 *  - onResultado: callback que recibe true/false al seleccionar
 */
function Completar({
  imagen,
  palabra,
  silabasOpciones,
  silabaCorrecta,
  onResultado
}) {
  const [seleccion, setSeleccion] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const manejarSeleccion = (silaba) => {
    setSeleccion(silaba);

    if (silaba === silabaCorrecta) {
      setMensaje("✅ ¡Correcto!");
      if (onResultado) onResultado(true);
    } else {
      setMensaje("❌ Intenta de nuevo");
      if (onResultado) onResultado(false);
    }
  };

  return (
    <div>
      {/* Imagen */}
      <img src={imagen} alt="Palabra" />

      {/* Palabra incompleta */}
      <h2>{palabra}</h2>

      {/* Opciones de sílabas */}
      <div>
        {silabasOpciones.map((silaba, idx) => (
          <button
            key={idx}
            onClick={() => manejarSeleccion(silaba)}
            disabled={seleccion === silaba}
            style={{
              backgroundColor:
                seleccion === silaba
                  ? silaba === silabaCorrecta
                    ? "#4CAF50" // verde si es correcta
                    : "#F44336" // rojo si es incorrecta
                  : "#2196F3" // azul normal
            }}
          >
            {silaba}
          </button>
        ))}
      </div>

      {/* Mensaje */}
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
}

export default Completar;
