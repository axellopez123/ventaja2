import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridActionsCellItem
} from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from "@mui/material";
import axiosClient from "../axios-client";

export default function UsersGrid() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/auth/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    setSelectedUser(prev => ({ ...prev, disabled: e.target.checked }));
  };

  const handleSave = async () => {
    try {
      const { data } = await axiosClient.put(`/auth/users/${selectedUser.id}`, {
        username: selectedUser.username,
        email: selectedUser.email,
        role: selectedUser.role,
        disabled: selectedUser.disabled
      });
      // Actualizar la lista de usuarios localmente
      setUsers(prev => prev.map(u => u.id === data.id ? data : u));
      handleCloseModal();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "username", headerName: "Usuario", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "role", headerName: "Rol", width: 120 },
    {
      field: "disabled",
      headerName: "Deshabilitado",
      width: 130,
      renderCell: (params) => (params?.value ? "Sí" : "No"),
    },
    {
      field: "favorites_count",
      headerName: "Favoritos",
      width: 100,
      valueGetter: (params) => (params?.row?.favorites?.length || 0),
    },
    {
      field: "conversations_count",
      headerName: "Conversaciones",
      width: 130,
      valueGetter: (params) =>
        (params?.row?.conversations?.length || 0) +
        (params?.row?.conversations_participating?.length || 0),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Acciones",
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          label="Ver / Editar"
          onClick={() => handleViewDetails(params?.row)}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <div style={{ height: 600, width: "100%" }}>
      <h2>Administración de Usuarios</h2>
      <DataGrid
        rows={users}
        columns={columns}
        loading={loading}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        disableSelectionOnClick
        getRowId={(row) => row.id}
      />

      {/* Modal de edición */}
      <Dialog
        open={!!selectedUser}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar Usuario: {selectedUser?.username}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Usuario"
            name="username"
            value={selectedUser?.username || ""}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Email"
            name="email"
            value={selectedUser?.email || ""}
            onChange={handleFormChange}
            fullWidth
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Rol</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={selectedUser?.role || "cliente"}
              onChange={handleFormChange}
            >
              <MenuItem value="cliente">Cliente</MenuItem>
              <MenuItem value="vendedor">Vendedor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={selectedUser?.disabled || false}
                onChange={handleSwitchChange}
                color="primary"
              />
            }
            label="Deshabilitado"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
