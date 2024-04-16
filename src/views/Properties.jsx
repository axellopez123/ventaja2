import { useEffect, useState } from "react"
import axiosClient from "../axios-client";
import { Link } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import {
    RiArrowDownSLine,
  } from "react-icons/ri";

import Card from "../components/shared/Card";


export default function Properties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const {setNotification} = useStateContext()

    useEffect(() => {
        getProperties();
    },[])

    const onDelete = (u) =>{
        if(!window.confirm("Are you sure you want to delete this property?")){
            return
        }

        axiosClient.delete(`/properties/${u.id}`)
        .then(() => {
            setNotification("Property was successfully deleted")
            getProperties()
        })
    }

    const getProperties = () =>{
        setLoading(false)
        axiosClient.get('/properties')
        .then(({data})=>{
            setLoading(false)
            setProperties(data.data)
            console.log(data);
        })
        .catch(() => {
            setLoading(false);
        })
    }

    return (
        <div>
             {/* Title content */}
            <div className="flex items-center justify-between mb-16">
              <h2 className="text-xl text-gray-300">Choose your sweet home</h2>
              <button className="border border-green-600 text-green-600 py-2 px-4 hover:bg-green-600 hover:text-white transition-colors">
                <Link to="/properties/new" className="btn-add">New</Link>
              </button>
              <button className="flex items-center gap-4 text-gray-300 bg-[#1F1D2B] py-2 px-4 rounded-lg">
                <RiArrowDownSLine /> Prices
              </button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                {properties.map( u =>(
                    <Card
                    id={u.id}
                    img="comida.png"
                    description={u.name}
                    price={u.price}
                    inventory={u.bedrooms}
                    />
                ))}

            </div>
        </div>
    )
}

