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
  Alert,
} from "@mui/material";
import axios from "axios";

const API = "https://ventaja-backend.arwax.pro/api";

export default function GameAdminForm() {
  const [nivelList, setNivelList] = useState([]);
  const [silabasList, setSilabasList] = useState([]);

  // Estados de los formularios
  const [silaba, setSilaba] = useState("");
  const [palabra, setPalabra] = useState("");
  const [selectedSilabas, setSelectedSilabas] = useState([]);
  const [nivel, setNivel] = useState({ descripcion: "" });
  const [juego, setJuego] = useState({ nombre: "", descripcion: "", nivel_id: "" });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [n, s] = await Promise.all([
        axios.get(`${API}/niveles`),
        axios.get(`${API}/silabas`),
      ]);
      setNivelList(n.data);
      setSilabasList(s.data);
      setErrorMsg("");
    } catch (err) {
      console.error(err);
      setErrorMsg("No se pudieron cargar los datos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // HANDLERS
  // ==============================
  const handleAddSilaba = async () => {
    if (!silaba.trim()) return;
    await axios.post(`${API}/silabas`, { silaba });
    setSilaba("");
    fetchData();
  };

  const handleAddPalabra = async () => {
    if (!palabra.trim() || selectedSilabas.length === 0) return;
    await axios.post(`${API}/palabras`, {
      texto: palabra,
      silabas: selectedSilabas,
    });
    setPalabra("");
    setSelectedSilabas([]);
    fetchData();
  };

  const handleAddNivel = async () => {
    if (!nivel.descripcion.trim()) return;
    await axios.post(`${API}/niveles`, nivel);
    setNivel({ descripcion: "" });
    fetchData();
  };

  const handleAddJuego = async () => {
    if (!juego.nombre.trim() || !juego.descripcion.trim() || !juego.nivel_id) return;
    await axios.post(`${API}/juegos`, juego);
    setJuego({ nombre: "", descripcion: "", nivel_id: "" });
    fetchData();
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        📚 Administración del Juego
      </Typography>

      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {loading && <Alert severity="info">Cargando datos...</Alert>}

      <Grid container spacing={4}>
        {/* FORM SÍLABA */}
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
            <Button
              variant="contained"
              onClick={handleAddSilaba}
              sx={{ mt: 2 }}
              disabled={!silaba.trim()}
            >
              Guardar Sí­laba
            </Button>
          </Paper>
        </Grid>

        {/* FORM PALABRA */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Agregar Palabras</Typography>

            {silabasList.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                ⚠️ No hay sílabas registradas. Agrega sílabas antes de crear palabras.
              </Alert>
            )}

            <TextField
              fullWidth
              label="Palabra"
              value={palabra}
              onChange={(e) => setPalabra(e.target.value)}
              sx={{ mt: 2 }}
              disabled={silabasList.length === 0}
            />

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Sílabas</InputLabel>
              <Select
                multiple
                value={selectedSilabas}
                onChange={(e) => setSelectedSilabas(e.target.value)}
                disabled={silabasList.length === 0}
              >
                {silabasList.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.silaba || s.texto}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleAddPalabra}
              sx={{ mt: 2 }}
              disabled={!palabra.trim() || selectedSilabas.length === 0}
            >
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
              label="Descripción del Nivel"
              value={nivel.descripcion}
              onChange={(e) => setNivel({ ...nivel, descripcion: e.target.value })}
              sx={{ mt: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleAddNivel}
              sx={{ mt: 2 }}
              disabled={!nivel.descripcion.trim()}
            >
              Guardar Nivel
            </Button>
          </Paper>
        </Grid>

        {/* FORM JUEGO */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Agregar Juego</Typography>

            {nivelList.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                ⚠️ No hay niveles registrados. Agrega niveles antes de crear juegos.
              </Alert>
            )}

            <TextField
              fullWidth
              label="Nombre del Juego"
              value={juego.nombre}
              onChange={(e) => setJuego({ ...juego, nombre: e.target.value })}
              sx={{ mt: 2 }}
              disabled={nivelList.length === 0}
            />
            <TextField
              fullWidth
              label="Descripción"
              value={juego.descripcion}
              onChange={(e) => setJuego({ ...juego, descripcion: e.target.value })}
              sx={{ mt: 2 }}
              disabled={nivelList.length === 0}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Nivel</InputLabel>
              <Select
                value={juego.nivel_id}
                onChange={(e) => setJuego({ ...juego, nivel_id: e.target.value })}
                disabled={nivelList.length === 0}
              >
                {nivelList.map((n) => (
                  <MenuItem key={n.id} value={n.id}>
                    {n.descripcion || n.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleAddJuego}
              sx={{ mt: 2 }}
              disabled={
                !juego.nombre.trim() ||
                !juego.descripcion.trim() ||
                !juego.nivel_id
              }
            >
              Guardar Juego
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
