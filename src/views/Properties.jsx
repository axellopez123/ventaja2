import { useEffect, useState } from "react"
import axiosClient from "../axios-client";
import { Link } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import {
    RiArrowDownSLine,
  } from "react-icons/ri";

import Card from "../components/shared/Card";
import Grid from "../components/shared/Grid";

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
            setProperties(data)
            console.log(data);
        })
        .catch(() => {
            setLoading(false);
        })
    }

    const items = [
  {
    image: "https://i.pravatar.cc/300?img=1",
    title: "Sarah Johnson",
    subtitle: "Frontend Developer",
    handle: "@sarahjohnson",
    borderColor: "#3B82F6",
    gradient: "linear-gradient(145deg, #3B82F6, #000)",
    url: "https://github.com/sarahjohnson"
  },
  {
    image: "https://i.pravatar.cc/300?img=2",
    title: "Mike Chen",
    subtitle: "Backend Engineer",
    handle: "@mikechen",
    borderColor: "#10B981",
    gradient: "linear-gradient(180deg, #10B981, #000)",
    url: "https://linkedin.com/in/mikechen"
  }
];

    return (
        <div>
            <button className="border border-green-600 text-green-600 py-2 px-4 hover:bg-green-600 hover:text-white transition-colors">
                <Link to="/properties/new" className="btn-add">New</Link>
              </button>
             {/* Title content
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

            </div> */}
            <div style={{ height: '600px', position: 'relative' }}>
  <Grid 
    items={properties}
    radius={300}
    damping={0.45}
    fadeOut={0.6}
    ease="power3.out"
  />
</div>
        </div>
    )
}

