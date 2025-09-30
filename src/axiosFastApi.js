import axios from "axios";

const axiosFastApi = axios.create({
  baseURL: import.meta.env.VITE_FASTAPI_API_URL,  // 👉 URL del backend FastAPI
  withCredentials: false,                         // normalmente no se necesitan cookies
});

export default axiosFastApi;
