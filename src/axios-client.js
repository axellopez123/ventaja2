import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true,  // ✅ necesario para enviar cookies HttpOnly al backend
});

// 🚫 Ya no necesitas interceptores para agregar Authorization

// axiosClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const { response } = error;

//     if (response && response.status === 401) {
//       // Aquí puedes redirigir al login o limpiar el estado global (no localStorage)
//       console.warn("No autenticado. Redirigir al login.");
//     }

//     return Promise.reject(error);
//   }
// );

export default axiosClient;


// import axios from "axios";

// const axiosClient = axios.create({
//    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`
//    // baseURL: `${import.meta.env.BASE_URL}/api`

// })

// axiosClient.interceptors.request.use((config) => {
//    const token = localStorage.getItem('ACCESS_TOKEN')
//    config.headers.Authorization = `Bearer ${token}`
//    return config;
// })

// axiosClient.interceptors.response.use((response)=>{
//    return response
// }, (error)=>{
//   try{
//      const {response} = error;
//      if(response.status === 401)
//      {
//          localStorage.removeItem('ACCESS_TOKEN')
//      }
//   }catch(e){
//      console.error(e);
//   }
   
   
//    throw error;
// })

// export default axiosClient;