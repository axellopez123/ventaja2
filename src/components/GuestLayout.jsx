import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

export default function GuestLayout(){

      const { user, loading, token } = useStateContext();
  if (loading) return <p>Cargando...</p>;

    if (token)
    {
        return <Navigate to={"/"}/>
    }

    return(
        <div>
            <Outlet/>
        </div>
    )
}