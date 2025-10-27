import React, { useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import mano from "../../assets/hand.png";

const syllables = ["na", "ma", "la"];
const correctSyllable = "ma";

export default function CompletarMano({ wsRef, idPartida, setJuego }) {
  const [placed, setPlaced] = useState(null);
  const [attempts, setAttempts] = useState(3);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState(syllables);

  const handleStartGame = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: "start",
        id_partida: idPartida,
      })
    );
    console.log("▶️ Juego iniciado para partida:", idPartida);
  };
  const speak = (text) => {
    // Detiene cualquier audio anterior
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 1;
    utterance.pitch = 1;

    speechSynthesis.speak(utterance);
  };
  const handleDrop = async (result) => {
    if (!result.destination) return;

    const draggedSyllable = items[result.source.index];

    if (result.destination.droppableId === "target") {
      if (draggedSyllable === correctSyllable) {
        setPlaced(draggedSyllable);
        setMessage("✅ ¡Correcto!");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        speak("¡Muy bien! Estás mejorando mucho.");
        await new Promise((resolve) => setTimeout(resolve, 5000));

        setJuego(3);
      } else {
        speak("¡Muy bien! Estás mejorando mucho.");

        setJuego(3);
        // setAttempts((prev) => {
        //   const newAttempts = prev - 1;
        //   if (newAttempts <= 0) setMessage("💔 Se acabaron los intentos");
        //   else setMessage("❌ Incorrecto, intenta otra vez");
        //   return newAttempts;
        // });
      }
    }
  };

  const resetGame = () => {
    setPlaced(null);
    setAttempts(3);
    setMessage("");
    setItems(syllables);
  };

  return (
    <DragDropContext onDragEnd={handleDrop}>
      <Box sx={{ p: 4, textAlign: "center" }}>
        {/* <Button
          variant="contained"
          color="success"
          onClick={handleStartGame}
          sx={{ mb: 3 }}
        >
          ▶️ Comenzar Juego
        </Button> */}

        {/* <Typography variant="h5" gutterBottom>
          Arrastra la sílaba correcta para completar la palabra
        </Typography> */}
        <Box
          component="img"
          src={mano}
          alt="Ilustración de mamá"
          sx={{
            width: { xs: "70%", md: "300px" },
            height: "auto",
            // my: 3,
            borderRadius: 3,
            boxShadow: 3,
            mx: "auto",
          }}
        />
        {/* ZONA OBJETIVO */}
        <Droppable droppableId="target" direction="horizontal">
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                mt: 4,
                fontSize: "2rem",
              }}
            >
              {/* <span>ca</span> */}
              <Paper
                elevation={3}
                sx={{
                  width: 100,
                  height: 70,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "1.5rem",
                  border: placed
                    ? "3px solid green"
                    : snapshot.isDraggingOver
                      ? "3px dashed orange"
                      : "3px dashed gray",
                  backgroundColor: placed ? "#c8f7c5" : "transparent",
                }}
              >
                {placed ? placed : "___"}
              </Paper>
              <span>no</span>
              {provided.placeholder}
            </Box>
          )}
        </Droppable>

        {/* OPCIONES DE SÍLABAS */}
        <Droppable droppableId="source" direction="horizontal">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                mt: 6,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {items.map((s, index) => (
                <Draggable
                  key={s}
                  draggableId={s}
                  index={index}
                  isDragDisabled={!!placed || attempts <= 0}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        opacity: snapshot.isDragging ? 0.6 : 1,
                        cursor: "grab",
                      }}
                    >
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2,
                          m: 1,
                          width: 80,
                          textAlign: "center",
                          fontSize: "1.2rem",
                          backgroundColor:
                            placed || attempts <= 0 ? "#ccc" : "#1976d2",
                          color: "white",
                          borderRadius: "12px",
                        }}
                      >
                        {s}
                      </Paper>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>

        {/* <Typography
          variant="h6"
          sx={{ mt: 3, color: attempts > 0 ? "black" : "red" }}
        >
          {message}
        </Typography>

        <Typography variant="body1" sx={{ mt: 1 }}>
          Intentos restantes: {attempts}
        </Typography>

        {(placed || attempts <= 0) && (
          <Button variant="contained" sx={{ mt: 2 }} onClick={resetGame}>
            Reiniciar
          </Button>
        )} */}
      </Box>
    </DragDropContext>
  );
}
