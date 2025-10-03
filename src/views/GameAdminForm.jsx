import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import axios from "axios";

const API = "https://ventaja-backend.arwax.pro/api"; // Ajusta el endpoint

export default function GameAdminForm() {
  const [nivelList, setNivelList] = useState([]);
  const [silabasList, setSilabasList] = useState([]);

  // Estados de los formularios
  const [silaba, setSilaba] = useState("");
  const [palabra, setPalabra] = useState("");
  const [selectedSilabas, setSelectedSilabas] = useState([]);
  const [nivel, setNivel] = useState({ nombre: "", dificultad: "" });
  const [juego, setJuego] = useState({ nombre: "", descripcion: "", nivel_id: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const n = await axios.get(`${API}/niveles`);
      const s = await axios.get(`${API}/silabas`);
      setNivelList(n.data);
      setSilabasList(s.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSilaba = async () => {
    if (!silaba) return;
    await axios.post(`${API}/silabas`, { texto: silaba });
    setSilaba("");
    fetchData();
  };

  const handleAddPalabra = async () => {
    if (!palabra) return;
    await axios.post(`${API}/palabras`, {
      texto: palabra,
      silabas: selectedSilabas,
    });
    setPalabra("");
    setSelectedSilabas([]);
    fetchData();
  };

  const handleAddNivel = async () => {
    await axios.post(`${API}/niveles`, nivel);
    setNivel({ nombre: "", dificultad: "" });
    fetchData();
  };

  const handleAddJuego = async () => {
    await axios.post(`${API}/juegos`, juego);
    setJuego({ nombre: "", descripcion: "", nivel_id: "" });
    fetchData();
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>📚 Administración del Juego</Typography>
      <Grid container spacing={4}>
        
        {/* FORM SILABA */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Agregar Sílabas</Typography>
            <TextField
              fullWidth
              label="Sí­laba"
              value={silaba}
              onChange={(e) => setSilaba(e.target.value)}
              sx={{ mt: 2 }}
            />
            <Button variant="contained" onClick={handleAddSilaba} sx={{ mt: 2 }}>
              Guardar Sí­laba
            </Button>
          </Paper>
        </Grid>

        {/* FORM PALABRA */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Agregar Palabras</Typography>
            <TextField
              fullWidth
              label="Palabra"
              value={palabra}
              onChange={(e) => setPalabra(e.target.value)}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Sílabas</InputLabel>
              <Select
                multiple
                value={selectedSilabas}
                onChange={(e) => setSelectedSilabas(e.target.value)}
              >
                {silabasList.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.texto}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAddPalabra} sx={{ mt: 2 }}>
              Guardar Palabra
            </Button>
          </Paper>
        </Grid>

        {/* FORM NIVEL */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Agregar Nivel</Typography>
            <TextField
              fullWidth
              label="Nombre del Nivel"
              value={nivel.nombre}
              onChange={(e) => setNivel({ ...nivel, nombre: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Dificultad"
              value={nivel.dificultad}
              onChange={(e) => setNivel({ ...nivel, dificultad: e.target.value })}
              sx={{ mt: 2 }}
            />
            <Button variant="contained" onClick={handleAddNivel} sx={{ mt: 2 }}>
              Guardar Nivel
            </Button>
          </Paper>
        </Grid>

        {/* FORM JUEGO */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Agregar Juego</Typography>
            <TextField
              fullWidth
              label="Nombre del Juego"
              value={juego.nombre}
              onChange={(e) => setJuego({ ...juego, nombre: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Descripción"
              value={juego.descripcion}
              onChange={(e) => setJuego({ ...juego, descripcion: e.target.value })}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Nivel</InputLabel>
              <Select
                value={juego.nivel_id}
                onChange={(e) => setJuego({ ...juego, nivel_id: e.target.value })}
              >
                {nivelList.map((n) => (
                  <MenuItem key={n.id} value={n.id}>{n.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleAddJuego} sx={{ mt: 2 }}>
              Guardar Juego
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
