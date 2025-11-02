import { Navigate, createBrowserRouter } from "react-router-dom";
import Login from "./views/Login.jsx";
import Signup from "./views/Signup.jsx";
import Users from "./views/Users.jsx";
import NotFound from "./views/NotFound.jsx";
import DefaultLayout from "./components/DefaultLayout.jsx";
import GuestLayout from "./components/GuestLayout.jsx";
import Dashboard from "./views/Dashboard.jsx";
import UserForm from "./views/UserForm.jsx";
import Game from "./views/Game.jsx";
import GameAdminForm from "./views/GameAdminForm.jsx";
import Levels from "./views/Levels.jsx";
import SilabasAdmin from "./views/SilabasAdmin.jsx";
import Ventaja from "./views/Ventaja.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "/",
        element: <Levels />,
      },
      {
        path: "/game/:level",
        element: <Game />,
      },
      {
        path: "/levels",
        element: <Levels />,
      },
      {
        path: "/admin",
        element: <GameAdminForm />,
      },
            {
        path: "/ventaja",
        element: <Ventaja />,
      },
      {
        path: "/silabas",
        element: <SilabasAdmin />,
      },
      {
        path: "/users",
        element: <Users />,
      },
      {
        path: "/users/new",
        element: <UserForm key="userCreate" />,
      },
      {
        path: "/users/:id",
        element: <UserForm key="userUpdate" />,
      },
    ],
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
