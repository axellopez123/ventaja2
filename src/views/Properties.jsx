import { useEffect, useState } from "react";
import axiosClient from "../axios-client";
import { Link } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import { RiArrowDownSLine } from "react-icons/ri";
import Button from "@mui/material/Button";
import { RiHomeHeartFill } from "react-icons/ri";

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
    <div className="px-16 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Explora propiedades</h2>

        <Link to="/properties/new">
          <Button
            variant="contained"
            size="medium"
            endIcon={<RiHomeHeartFill />}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {properties.map((u) => {
            const galleryItems = Array.isArray(u.images)
              ? imageGalleryItems(u.images)
              : [];
            return (
              <Card
                key={u.id}
                id={u.id}
                img={galleryItems}
                description={u.name}
                price={u.price}
                inventory={u.bedrooms}
                isInitiallyFavorited={user?.favorites?.some(
                  (f) => f.product_id === u.id
                )}
              />
            );
          })}
        </div>
      </InfiniteScroll>
    </div>
    // <div>
    //   <button className="border border-green-600 text-green-600 py-2 px-4 hover:bg-green-600 hover:text-white transition-colors">
    //     <Link to="/properties/new" className="btn-add">
    //       New
    //     </Link>
    //   </button>

    //   {/* Title content
    //         <div className="flex items-center justify-between mb-16">
    //           <h2 className="text-xl text-gray-300">Choose your sweet home</h2>
    //           <button className="border border-green-600 text-green-600 py-2 px-4 hover:bg-green-600 hover:text-white transition-colors">
    //             <Link to="/properties/new" className="btn-add">New</Link>
    //           </button>
    //           <button className="flex items-center gap-4 text-gray-300 bg-[#1F1D2B] py-2 px-4 rounded-lg">
    //             <RiArrowDownSLine /> Prices
    //           </button>
    //         </div>
    //         <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
    //             {properties.map( u =>(
    //                 <Card
    //                 id={u.id}
    //                 img="comida.png"
    //                 description={u.name}
    //                 price={u.price}
    //                 inventory={u.bedrooms}
    //                 />
    //             ))}

    //         </div> */}
    //   {/* <div style={{ height: "600px", position: "relative" }}></div> */}
    // </div>
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
