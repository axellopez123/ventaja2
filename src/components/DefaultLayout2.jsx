import { Link, Navigate, Outlet } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { useEffect } from "react";
import axiosClient from "../axios-client";
import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  RiMenu3Fill,
  RiUser3Line,
  RiAddLine,
  RiPieChartLine,
  RiCloseLine,
} from "react-icons/ri";
// Components
import Sidebar from "./shared/Sidebar";
import Car from "./shared/Car";
import Header from "./shared/Header";
import Card from "./shared/Card";

export default function DefaultLayout(){
    const {user,token, notification, setUser, setToken} = useStateContext()
    const [showMenu, setShowMenu] = useState(false);
    const [showOrder, setShowOrder] = useState(false);
    toast.success(notification, {
      position: "top-center",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      });

    if(!token)
    {
        return <Navigate to="/login"/>
    }
    const toggleMenu = () => {
        setShowMenu(!showMenu);
        setShowOrder(false);
      };
    
      const toggleOrders = () => {
        setShowOrder(!showOrder);
        setShowMenu(false);
      };

    const onLogout = (ev) => {
        ev.preventDefault()

        axiosClient.post('/logout')
        .then(() => {
            setUser({})
            setToken(null)
        })
    }

    useEffect(() => {
        axiosClient.get('/user')
        .then(({data}) => {
            setUser(data)
        })
    },[])

    return(
        <div className="bg-[#262837] w-full min-h-screen">
            <aside className="bg-[#1F1D2B] fixed lg:static top-0 left-0 h-full z-50 w-full lg:w-1/4 transition-transform duration-300 transform lg:translate-x-0" style={{ transform: showMenu ? 'translateX(0)' : 'translateX(-100%)' }}>
    <Sidebar />
  </aside>
        {/* <Sidebar showMenu={showMenu} />
        <Car showOrder={showOrder} setToken={setToken} setUser={setUser} setShowOrder={setShowOrder} /> */}
        {/* Menu movil */}
        <nav className="bg-[#1F1D2B] lg:hidden fixed w-full bottom-0 left-0 text-3xl text-gray-400 py-2 px-8 flex items-center justify-between rounded-tl-xl rounded-tr-xl">
          <button className="p-2">
            <RiUser3Line />
          </button>
          <button className="p-2">
            <RiAddLine />
          </button>
          <button onClick={toggleOrders} className="p-2">
            <RiPieChartLine />
          </button>
          <button onClick={toggleMenu} className="text-white p-2">
            {showMenu ? <RiCloseLine /> : <RiMenu3Fill />}
          </button>
        </nav>
        <main className="lg:pl-32 lg:pr-96 pb-20">
          <div className="md:p-8 p-4">
            {/* Header */}
            <Header />
            {/* Title content
            <div className="flex items-center justify-between mb-16">
              <h2 className="text-xl text-gray-300">Choose your sweet home</h2>
              <button className="border border-green-600 text-green-600 py-2 px-4 hover:bg-green-600 hover:text-white transition-colors">
                <Link to="/properties/new" className="btn-add">New</Link>
              </button>
              <button className="flex items-center gap-4 text-gray-300 bg-[#1F1D2B] py-2 px-4 rounded-lg">
                <RiArrowDownSLine /> Prices
              </button>
            </div> */}
            {/* Content */}
                <main>
                    <Outlet/>
                </main>
          </div>
        </main>
        {notification &&
            <div>
            <ToastContainer
            position="top-center"
            autoClose={6000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            />            
            </div>
            }
      </div>
    )
}