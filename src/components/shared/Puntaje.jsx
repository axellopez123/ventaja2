import React from "react";
import { Box, Typography, Button, LinearProgress } from "@mui/material";
import { motion } from "framer-motion";
import StarIcon from "@mui/icons-material/Star";

const Puntaje = ({
  puntaje,
  total,
  onReintentar,
  onContinuar,
  setMostrar,
  setPartida,
}) => {
  const porcentaje = Math.round((puntaje / total) * 100);
  const color =
    porcentaje >= 80 ? "#4CAF50" : porcentaje >= 50 ? "#FFC107" : "#F44336";

  // const toLevels = () => {
  //   // setPartida(null);
  //   setMostrar(true);
  // };
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box
        sx={{
          maxWidth: 400,
          mx: "auto",
          mt: 6,
          p: 4,
          borderRadius: 4,
          boxShadow: 4,
          textAlign: "center",
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
          🎯 Resultado Final
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          {[...Array(3)].map((_, i) => (
            <StarIcon
              key={i}
              sx={{
                fontSize: 40,
                color:
                  i < Math.round((porcentaje / 100) * 3) ? color : "#E0E0E0",
              }}
            />
          ))}
        </Box>

        <Typography variant="h5" sx={{ color, fontWeight: "bold" }}>
          {puntaje} / {total}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={porcentaje}
          sx={{
            height: 10,
            borderRadius: 5,
            mt: 2,
            backgroundColor: "#eee",
            "& .MuiLinearProgress-bar": { backgroundColor: color },
          }}
        />

        <Typography variant="body1" sx={{ mt: 2 }}>
          {porcentaje >= 80
            ? "¡Excelente trabajo!"
            : porcentaje >= 50
              ? "¡Buen intento!"
              : "Sigue practicando, tú puedes 💪"}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
          <Button variant="contained" color="success"
          //  onClick={toLevels()}
           >
            🚀 Continuar
          </Button>
        </Box>
        {/* <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={onReintentar}
          >
            🔁 Reintentar
          </Button>
          <Button variant="contained" color="success" onClick={onContinuar}>
            🚀 Continuar
          </Button>
        </Box> */}
      </Box>
    </motion.div>
  );
};

export default Puntaje;
