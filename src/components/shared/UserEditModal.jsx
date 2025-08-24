import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from "@mui/material";
import axiosClient from "../axios-client";

export default function UserEditModal({ user, open, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    disabled: false,
  });

  useEffect(() => {
    if (user) setFormData({
      username: user.username || "",
      email: user.email || "",
      role: user.role || "cliente",
      disabled: user.disabled || false
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    setFormData(prev => ({ ...prev, disabled: e.target.checked }));
  };

  const handleSubmit = async () => {
    try {
      const { data } = await axiosClient.put(`/auth/users/${user.id}`, formData);
      onUpdated(data);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Usuario</DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          label="Usuario"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="normal"
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="role-label">Rol</InputLabel>
          <Select
            labelId="role-label"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="cliente">Cliente</MenuItem>
            <MenuItem value="vendedor">Vendedor</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={formData.disabled}
              onChange={handleSwitchChange}
              color="primary"
            />
          }
          label="Deshabilitado"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
