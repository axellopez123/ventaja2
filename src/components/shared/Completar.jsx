import React, { useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const syllables = ["rro", "to", "pa"];
const correctSyllable = "rro";

function Syllable({ text, disabled }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "SILABA",
    item: { text },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: "grab" }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          m: 1,
          width: 80,
          textAlign: "center",
          fontSize: "1.2rem",
          backgroundColor: disabled ? "#ccc" : "#1976d2",
          color: "white",
          borderRadius: "12px",
        }}
      >
        {text}
      </Paper>
    </div>
  );
}

function DropZone({ onDrop, placed }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "SILABA",
    drop: (item) => onDrop(item.text),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <Paper
      ref={drop}
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
          : isOver
          ? "3px dashed orange"
          : "3px dashed gray",
        backgroundColor: placed ? "#c8f7c5" : "transparent",
      }}
    >
      {placed ? placed : "___"}
    </Paper>
  );
}

export default function Completar({ wsRef, idPartida }) {
  const [placed, setPlaced] = useState(null);
  const [attempts, setAttempts] = useState(3);
  const [message, setMessage] = useState("");

  // 👉 BOTÓN PARA ENVIAR START AL WS
  const handleStartGame = () => {
    wsRef.current?.send(
      JSON.stringify({
        type: "start",
        id_partida: idPartida,
      })
    );
    console.log("▶️ Juego iniciado para partida:", idPartida);
  };

  const handleDrop = (syll) => {
    if (syll === correctSyllable) {
      setPlaced(syll);
      setMessage("✅ ¡Correcto!");
    } else {
      setAttempts((prev) => prev - 1);
      setMessage("❌ Incorrecto, intenta otra vez");

      if (attempts - 1 <= 0) setMessage("💔 Se acabaron los intentos");
    }
  };

  const resetGame = () => {
    setPlaced(null);
    setAttempts(3);
    setMessage("");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleStartGame}
          sx={{ mb: 3 }}
        >
          ▶️ Comenzar Juego
        </Button>

        <Typography variant="h5" gutterBottom>
          Arrastra la sílaba correcta para completar la palabra
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 4, fontSize: "2rem" }}>
          <span>ca</span>
          <DropZone onDrop={handleDrop} placed={placed} />
          <span>ro</span>
        </Box>

        <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
          {syllables.map((s) => (
            <Syllable key={s} text={s} disabled={!!placed || attempts <= 0} />
          ))}
        </Box>

        <Typography variant="h6" sx={{ mt: 3, color: attempts > 0 ? "black" : "red" }}>
          {message}
        </Typography>

        <Typography variant="body1" sx={{ mt: 1 }}>
          Intentos restantes: {attempts}
        </Typography>

        {(placed || attempts <= 0) && (
          <Button variant="contained" sx={{ mt: 2 }} onClick={resetGame}>
            Reiniciar
          </Button>
        )}
      </Box>
    </DndProvider>
  );
}
