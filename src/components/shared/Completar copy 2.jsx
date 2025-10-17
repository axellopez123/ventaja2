import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const JuegoSilabas = () => {
  // Palabra con espacio vacío (por ejemplo, "CA__A" donde falta "SA")
  const palabraObjetivo = ["CA", "", "SA"];

  // Sílabas disponibles
  const [silabas, setSilabas] = useState([
    { id: "1", texto: "SA" },
    { id: "2", texto: "MA" },
    { id: "3", texto: "PA" },
  ]);

  // Sílabas colocadas en la palabra
  const [colocadas, setColocadas] = useState([""]);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Si no hay destino, no hacer nada
    if (!destination) return;

    // Si soltó en la misma posición, no hacer nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // Si arrastra de las sílabas disponibles a la palabra
    if (source.droppableId === "silabas" && destination.droppableId === "palabra") {
      const nuevaSilaba = silabas[source.index];
      setColocadas([nuevaSilaba.texto]);
      return;
    }

    // Si regresa una sílaba al banco
    if (source.droppableId === "palabra" && destination.droppableId === "silabas") {
      setColocadas([""]);
      return;
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-6">Arrastra la sílaba correcta</h2>

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Palabra objetivo */}
        <Droppable droppableId="palabra" direction="horizontal">
          {(provided) => (
            <div
              className="flex space-x-2 mb-10 border-b-2 border-gray-300 pb-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {palabraObjetivo.map((parte, index) => (
                <div
                  key={index}
                  className={`min-w-[60px] h-[60px] flex items-center justify-center text-xl font-semibold rounded ${
                    parte === ""
                      ? "bg-gray-100 border-2 border-dashed border-gray-400"
                      : "bg-blue-100 border border-blue-300"
                  }`}
                >
                  {parte === "" ? (
                    colocadas[0] ? (
                      <Draggable draggableId="colocada" index={0}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-green-300 px-4 py-2 rounded shadow cursor-grab active:cursor-grabbing select-none"
                          >
                            {colocadas[0]}
                          </div>
                        )}
                      </Draggable>
                    ) : (
                      <span className="text-gray-400">---</span>
                    )
                  ) : (
                    parte
                  )}
                </div>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Sílabas disponibles */}
        <Droppable droppableId="silabas" direction="horizontal">
          {(provided) => (
            <div
              className="flex space-x-3"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {silabas.map((s, index) => (
                <Draggable key={s.id} draggableId={s.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-yellow-300 px-4 py-2 rounded-lg shadow text-lg font-semibold cursor-grab active:cursor-grabbing select-none"
                    >
                      {s.texto}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default JuegoSilabas;
