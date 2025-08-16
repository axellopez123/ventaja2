import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { Link } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { RiArrowDownSLine } from "react-icons/ri";
import Button from "@mui/material/Button";
import { RiHomeHeartFill } from "react-icons/ri";
import { BiMessageAltDetail } from "react-icons/bi";

import Card from "../components/shared/Card";
import Grid from "../components/shared/Grid";
import InfiniteScroll from "react-infinite-scroll-component";
const LIMIT = 6;

export default function Properties() {
  const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/`;
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, setNotification } = useStateContext();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  useEffect(() => {
    getProperties();
  }, []);

  const onDelete = (u) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    axiosClient.delete(`/properties/${u.id}`).then(() => {
      setNotification("Property was successfully deleted");
      getProperties();
    });
  };

  const getProperties = async () => {
    setLoading(false);
    console.log(page);
    console.log(properties);

    await axiosClient
      .get(`/products/?page=${page}&limit=${LIMIT}`)
      .then(({ data }) => {
        // Si ya no hay más propiedades
        if (data.length < LIMIT) setHasMore(false);
        // setProperties(data);

        setProperties((prev) => [...prev, ...data]);
        // pageRef.current += 1;
        setPage((prev) => prev + 1);

        setLoading(false);
      })
      .catch(() => {
        setHasMore(false);

        setLoading(false);
      });
  };
  const imageGalleryItems = (data = []) =>
    Array.isArray(data)
      ? data.map((img) => ({
          original: `${baseUrl}${img.original}`,
          thumbnail: `${baseUrl}${img.thumbnail}`,
        }))
      : [];
  const items = [
    {
      image: "https://i.pravatar.cc/300?img=1",
      title: "Sarah Johnson",
      subtitle: "Frontend Developer",
      handle: "@sarahjohnson",
      borderColor: "#3B82F6",
      gradient: "linear-gradient(145deg, #3B82F6, #000)",
      url: "https://github.com/sarahjohnson",
    },
    {
      image: "https://i.pravatar.cc/300?img=2",
      title: "Mike Chen",
      subtitle: "Backend Engineer",
      handle: "@mikechen",
      borderColor: "#10B981",
      gradient: "linear-gradient(180deg, #10B981, #000)",
      url: "https://linkedin.com/in/mikechen",
    },
  ];

  return (
    <div className="text-white h-full pl-5 pr-3 pt-3 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white dark:text-orange-500">
          Explora propiedades
        </h2>

        <Link to="/properties/new">
          <Button
            variant="contained"
            size="medium"
            endIcon={<RiHomeHeartFill />}
            sx={{
              backgroundColor: "#f97316", // orange-500 en Tailwind
              color: "#fff",
              "&:hover": {
                backgroundColor: "#ea580c", // orange-600 para hover
              },
            }}
          >
            Nueva
          </Button>
        </Link>
      </div>
      {/* <p> {user.id} </p> */}
      <InfiniteScroll
        dataLength={properties.length}
        next={() => {
          console.log("Fire");

          getProperties();
        }}
        hasMore={hasMore}
        loader={<Loader />}
        endMessage={
          <p className="text-center text-gray-500 mt-6">
            Ya no hay más propiedades por cargar.
          </p>
        }
        scrollThreshold="250px"
        scrollableTarget="scrollableDiv"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 h-full">
          {properties.map((u) => {
            const galleryItems = Array.isArray(u.images)
              ? imageGalleryItems(u.images)
              : [];
            return (
              
              // <Link to={`/property/${u.id}`} className="block">
              <Card
                key={u.id}
                id={u.id}
                img={galleryItems}
                description={u.name}
                price={u.price}
                bedrooms={u.bedrooms}
                bathrooms={u.bathrooms}
                status={u.status}
                parkings={u.bathrooms}
                cleanrooms={u.cleanrooms}
                isInitiallyFavorited={user?.favorites?.some(
                  (f) => f.product_id === u.id && f.is_active
                )}
              />
              // </Link>
            );
          })}
        </div>
      </InfiniteScroll>
          <button
      className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-full shadow-lg transition"
      onClick={() => console.log("Botón clickeado")}
    >
      <BiMessageAltDetail/>
    </button>
    </div>

  );
}

function Loader() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-[#1F2937] animate-pulse p-4 rounded-2xl h-64 shadow-md" />
      ))} */}
      <p>Loading...</p>
    </div>
  );
}
