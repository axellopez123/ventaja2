import { Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

export default function GuestLayout(){

      const { user, loading } = useStateContext();
  if (loading) return <p>Cargando...</p>;

    if (user)
    {
        return <Navigate to={"/dashboard"}/>
    }

    return(
        <div>
            <Outlet/>
        </div>
    )
}