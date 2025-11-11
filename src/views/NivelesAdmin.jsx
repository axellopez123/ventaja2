import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://ventaja-backend.arwax.pro/api/play";

export default function NivelesAdmin() {
  const [niveles, setNiveles] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [letraObjetivo, setLetraObjetivo] = useState("");
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    fetchNiveles();
  }, []);

  const fetchNiveles = async () => {
    try {
      const { data } = await axios.get(`${API}/niveles`);
      setNiveles(data.data);
    } catch (err) {
      console.error("Error cargando niveles:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { descripcion, letra_objetivo: letraObjetivo };

    try {
      if (editando) {
        await axios.put(`${API_URL}/niveles/${editando}`, data);
      } else {
        await axios.post(API_URL, data);
      }
      setDescripcion("");
      setLetraObjetivo("");
      setEditando(null);
      fetchNiveles();
    } catch (err) {
      console.error("Error guardando nivel:", err);
    }
  };

  const handleEdit = (nivel) => {
    setDescripcion(nivel.descripcion);
    setLetraObjetivo(nivel.letra_objetivo);
    setEditando(nivel.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este nivel?")) return;
    try {
      await axios.delete(`${API_URL}/niveles/${id}`);
      fetchNiveles();
    } catch (err) {
      console.error("Error eliminando nivel:", err);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">📘 Gestión de Niveles</h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Descripción del nivel"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
        <input
          type="text"
          placeholder="Letra objetivo (ej. M)"
          value={letraObjetivo}
          onChange={(e) => setLetraObjetivo(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          {editando ? "Actualizar Nivel" : "Crear Nivel"}
        </button>
      </form>

      <ul className="space-y-3">
        {niveles.map((nivel) => (
          <li
            key={nivel.id}
            className="bg-gray-800 p-3 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{nivel.descripcion}</p>
              <p className="text-sm text-gray-400">
                Letra objetivo: {nivel.letra_objetivo}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(nivel)}
                className="bg-yellow-500 text-black px-3 py-1 rounded"
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => handleDelete(nivel.id)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                🗑️ Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
