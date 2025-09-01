import { Navigate, createBrowserRouter } from "react-router-dom";
import Login from "./views/Login.jsx";
import Signup from "./views/Signup.jsx";
import Users from "./views/Users.jsx";
import UserForm from "./views/UserForm.jsx";
import PropertyForm from "./views/PropertyForm.jsx";
import NotFound from "./views/NotFound.jsx";
import DefaultLayout from "./components/DefaultLayout.jsx";
import GuestLayout from "./components/GuestLayout.jsx";
import Dashboard from "./views/Dashboard.jsx";
import Property from "./views/Property.jsx";
import Conversation from "./views/Conversation.jsx";
import Conversations from "./views/Conversations.jsx";
import Game from "./views/Game.jsx";
const router = createBrowserRouter([
    {
        path: '/',
        element: <DefaultLayout />,
        children: [
            {
                path: "/",
                element: <Game />
            },
            {
                path: '/users',
                element: <Users />
            },
            {
                path: '/users/new',
                element: <UserForm key="userCreate" />
            },
            {
                path: '/users/:id',
                element: <UserForm key="userUpdate" />
            },
            {
                path: '/game',
                element: <Game />
            },
        ]

    },
    {
        path: '/',
        element: <GuestLayout />,
        children: [
            {
                path: '/signup',
                element: <Signup />
            },
            {
                path: '/login',
                element: <Login />
            },
        ]
    },
    {
        path: '*',
        element: <NotFound />
    },
])

export default router;