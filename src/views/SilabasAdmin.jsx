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
  Paper,
  Chip,
  OutlinedInput,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useTheme } from "@mui/material/styles";

const API = "https://ventaja-backend.arwax.pro/api/play";

export default function SilabasAdmin() {
  const theme = useTheme();
  const [silaba, setSilaba] = useState("");
  const [silabasList, setSilabasList] = useState([]);
  const [silabasParecidas, setSilabasParecidas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/silabas`);
      setSilabasList(data);
      setErrorMsg("");
    } catch (err) {
      console.error(err);
      setErrorMsg("No se pudieron cargar las sílabas. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSilaba = async () => {
    if (!silaba.trim()) return;

    try {
      await axios.post(`${API}/silabas`, {
        silaba,
        parecidas: silabasParecidas,
      });
      setSilaba("");
      setSilabasParecidas([]);
      setSuccessMsg("Sí­laba agregada correctamente.");
      fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al guardar la sílaba.");
    }
  };

  const handleSelectChange = (event) => {
    const { value } = event.target;
    setSilabasParecidas(typeof value === "string" ? value.split(",") : value);
  };

  const getStyles = (name, selected) => ({
    fontWeight: selected.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  });

  return (
    <Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 5,
          px: 2,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            width: "100%",
            maxWidth: 600, // <-- Controla el ancho máximo
            textAlign: "center",
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Administrar Sílabas
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}
          {successMsg && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMsg}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Campo de sílaba */}
            <TextField
              label="Sí­laba"
              value={silaba}
              onChange={(e) => setSilaba(e.target.value)}
              fullWidth
              sx={{ maxWidth: 100, mx: "auto" }} // <-- centrado y ancho máximo
            />

            {/* Selector de sílabas parecidas */}
            <FormControl fullWidth sx={{ maxWidth: 300, mx: "auto" }}>
              <InputLabel id="silabas-parecidas-label">
                Sílabas parecidas
              </InputLabel>
              <Select
                labelId="silabas-parecidas-label"
                multiple
                value={silabasParecidas}
                onChange={handleSelectChange}
                input={<OutlinedInput label="Sílabas parecidas" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {silabasList.map((s) => (
                  <MenuItem
                    key={s.id}
                    value={s.silaba}
                    style={getStyles(s.silaba, silabasParecidas)}
                  >
                    {s.silaba}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Botón */}
            <Button
              variant="contained"
              sx={{
                mt: 2,
                py: 1.2,
                fontWeight: "bold",
                backgroundColor: "#2e7d32",
                "&:hover": { backgroundColor: "#1b5e20" },
                maxWidth: 500,
                mx: "auto",
              }}
              onClick={handleAddSilaba}
              disabled={!silaba.trim() || loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Guardar Sí­laba"
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
      <Box>
        <Paper>
          {/* Lista rápida de sílabas cargadas */}
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            Sílabas registradas
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
              mt: 1,
            }}
          >
            {silabasList.map((s) => (
              <Chip key={s.id} label={s.silaba} variant="outlined" />
            ))}
          </Box>
        </Paper>
      </Box>

    </Box>
  );
}
