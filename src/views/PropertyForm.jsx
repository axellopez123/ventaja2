import { React, useEffect, useState, useCallback, useMemo } from "react"
// import Image from 'next/image'
import { useNavigate, useParams } from "react-router-dom"
import axiosClient from "../axios-client"
import { useStateContext } from "../contexts/ContextProvider";
import {useDropzone} from 'react-dropzone'
import { RiCloseCircleLine, RiHotelBedFill, RiSparkling2Fill  } from "react-icons/ri";
import { LiaToiletSolid } from "react-icons/lia";
import { FaCarSide,FaWhatsapp,FaPhoneAlt } from "react-icons/fa";
import { BiSolidWasher } from "react-icons/bi";
import { SiGooglemaps } from "react-icons/si";
import { IoCameraOutline } from "react-icons/io5";





const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#ab79d5',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    color: '#000000',
    outline: 'none',
    transition: 'border .24s ease-in-out',
  };
  
  const focusedStyle = {
    borderColor: '#2196f3'
  };
  
  const acceptStyle = {
    borderColor: '#00e676'
  };
  
  const rejectStyle = {
    borderColor: '#ff1744'
  };

export default function PropertyForm(){
    const {id} = useParams()
    const navigate =useNavigate();
    const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/storage/`;
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(null)
    const {setNotification} = useStateContext()
    const [image,setImage] = useState(null)
    const [showShinner, setShowShinner] = useState(false)
    const [images,setImages] = useState(null)
    const [files, setFiles] = useState([])
    const [filesSelected, setFilesSelected] = useState([])
    const [imagePreview, setImagePreview] = useState(`${baseUrl}photos/default.jpg`)
    const [property,setProperty] = useState({
        id:null,
        name:'',
        bedrooms:undefined,
        bathrooms:undefined, 
        cleanrooms:undefined,
        parkings:undefined,
        address:undefined,
        moodsBuy:undefined,
        price:undefined,
        discount:undefined,
        sizeLength:undefined,
        sizeWidth:undefined,
        level:undefined,
        floors:undefined,
    })

    const onDrop = useCallback(acceptedFiles => {
        if(acceptedFiles?.length)
        {
            setFilesSelected(previusFiles => [
                ...previusFiles,
                ...acceptedFiles.map(file =>
                    Object.assign(file,{preview:URL.createObjectURL(file)})
                    )
            ])
        }
    },[])

    const {getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject,
        isDragActive} = useDropzone({onDrop})

    const removeFile = name => {
        setFiles(files => files.filter(file => file.name !== name))
    } 

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
    isFocused,
    isDragAccept,
    isDragReject
    ]);

    if(id){
        useEffect(() =>{
            setLoading(true)
            axiosClient.get(`/properties/${id}`)
            .then(({data})=>{
                setLoading(false)
                setProperty(data.data)
            })
            .catch(()=>{
                setLoading(false)
            })
            setShowShinner(true);
            axiosClient.get(`/imagesNames/${id}`)
            .then((res) => {
                setFiles(res.data);
                var main = files.find(e => e.main == true);
                if(main)
                {
                    setImagePreview(`${baseUrl}${main.preview}`)
                }else{
                    setImagePreview(`${baseUrl}${files[0].preview}`)
                }
                console.log(files);
            })
            .catch(err => {
                const response = err.response;
                if(response && response.status === 422)
                {
                    setErrors(response.data.errors);
                }
            })
        },[])
    }

    const uploadImage = (id,file) =>{
        const data = new FormData();
        data.append('file', file);
        data.append('id_property', id);

        axiosClient.post(`/upload/${id}`, data,{
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
        .then((res) => {
            //NOTIFICATION
            setNotification("Images was successfully created")
        })
        .catch(err => {
            const response = err.response;
            if(response && response.status === 422)
            {
                setErrors(response.data.errors);
            }
        })
    }


    const onSubmit = (ev) => {
        ev.preventDefault();

        if(property.id)
        {
            axiosClient.put(`/properties/${property.id}`, property)
            .then(() => {
                /////////////////
                // upload image
                ////////////////
                if(image){
                    // uploadImage(property.id,image)
                }
                if(filesSelected)
                {
                    // files.map(file => (uploadImage(property.id,file)))
                    filesSelected.map((file, index) => {
                        uploadImage(property.id,file)
                    });
                }

                //NOTIFICATION
                setNotification("Property was successfully updated")
                navigate('/properties')
            })
            .catch(err => {
                const response = err.response;
                if(response && response.status === 403)
                {
                    setErrors(response.data.errors);
                }
                if(response && response.status === 422)
                {
                    setErrors(response.data.errors);
                }
            })
        }else{
            axiosClient.post(`/properties`, property)
            .then((prop) => {
                /////////////////
                // upload image
                ////////////////

                filesSelected.map((file, index) => {
                    uploadImage(prop.data.id,file)
                });
                
                //NOTIFICATION
                setNotification("Property was successfully created")
                navigate('/properties')


            })
            .catch(err => {
                const response = err.response;
                if(response && response.status === 422)
                {
                    setErrors(response.data.errors);
                }
            })  
            
        }
    }

    return(
        <div>
            {property.id && <h2 className="text-xl text-gray-300">Update property: {property.name}</h2> }           
            {!property.id && <h2 className="text-xl text-gray-300">New property</h2>}


            <div>
                                {loading && (
                    <div>Loading...</div>
                )}
                {errors && <div className="alert">
                    <div className="max-w-md py-4 px-6 shadow-2xl shadow-red-800 rounded-lg bg-red-600">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <h3 className="text-xl text-white font-semibold">Error</h3>
                            </div>
                            {Object.keys(errors).map(key => (
                                <p key={key}>{errors[key][0]}</p>
                            ))}
                        </div>
                    </div>
                </div>
                }


                {!loading &&


                <div className="grid grid-cols-2 grid-row-1">

                    <div className="col-span-1 row-span-1 m-12">

                       
                      

                    </div>
                    {/* ----------------------------------- */}
                    <div className="col-span-1 row-span-1">
                    <form onSubmit={onSubmit}>
                        {/* <div>
                            <input type="file" onChange={ev => setImage(ev.target.files[0])}/>
                        </div> */}
{/* OTRO METODO CHIdO  */}
                        
                        
                            <div>
                                
                                <img src={imagePreview} alt="" className="w-full h-64 rounded-lg border-4 border-double border-indigo-500/75 hover:border-indigo-300"/>
                            </div>
                            <div className="relative">
                                <img src={imagePreview} alt="" className="w-full h-64 rounded-lg border-4 border-double border-indigo-500/75 hover:border-indigo-300"/>
                                {showShinner && (
                                <div  className="absolute top-0 left-0 w-full h-full flex justify-start items-start">
                                    <div className="bg-green-600 opacity-50 text-white m-4 p-2 rounded-full hover:opacity-90">
                                        <RiSparkling2Fill className="text-4xl text-yellow-600"/>
                                    </div>
                                </div>
                                )}

                            </div>
                            <div>
                                <div class="mt-8 flex overflow-x-scroll gap-4">
                                    {
                                        files.map((file,index) => (
                                            <div>
                                                {/* <button onClick={removeFile(file.preview)}>X</button> */}
                                                <img src={`${baseUrl}${file.preview}`} alt="" onLoad={() => {URL.revokeObjectURL(file.preview)}} onClick={() => {setImagePreview(`${baseUrl}${file.preview}`)}} className="w-16 md:w-32 lg:w-48 rounded-lg border-4 border-double border-indigo-500/75 hover:border-indigo-300"/>
                                            </div>
                                        ))
                                    }
                                    {
                                        filesSelected.map((file,index) => (
                                            <img src={file.preview} alt="" onLoad={() => {URL.revokeObjectURL(file.preview)}} onClick={() => {setImagePreview(file.preview)}} className="w-16 md:w-20 lg:w-48 rounded-lg border-4 border-double border-indigo-500/75 hover:border-indigo-300"/>
                                        ))
                                    }
                                </div>
                                <div>
                                    <div {...getRootProps({style})}>
                                        <input {...getInputProps()} />
                                        {isDragActive ? (
                                            <p>Suelta aqui tus imagenes...</p>
                                        ):(
                                            <div className="grid grid-cols-12">
                                                <div className="col-span-2">
                                                    <IoCameraOutline className="text-3xl"/>
                                                </div>
                                                <div className="col-span-10">
                                                    <p>Selecciona o arrastra tus fotos</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                        










                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
                            <div className="col-span-2 md:col-span-4 lg:col-span-4">
                            <span className="text-pink-700">Name</span>
                            <input type="text"
                                   class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black"
                                   value={property.name} 
                                   onChange={ev => setProperty({...property, name: ev.target.value})} 
                                   placeholder="Name" />
                            </div>
                            <div className="col-span-1 md:col-span-1 lg:col-span-1">
                                <span class="text-pink-700">Bedrooms</span>
                                <input type="number"
                                class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black"
                                value={property.bedrooms} 
                                onChange={ev => setProperty({...property, bedrooms: ev.target.value})} 
                                placeholder="Bedrooms" />
                            </div>
                            <div className="col-span-1 md:col-span-1 lg:col-span-1">
                                <span class="text-pink-700">Bathrooms</span>
                                <input type="number"
                                class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black"
                                 value={property.bathrooms} 
                                 onChange={ev => setProperty({...property, bathrooms: ev.target.value})} 
                                 placeholder="Bathrooms" />
                            </div>
                            <div className="col-span-1 md:col-span-1 lg:col-span-1">
                                <span class="text-pink-700">Cleanrooms</span>
                                <input type="number" 
                                class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black"
                                value={property.cleanrooms} 
                                onChange={ev => setProperty({...property, cleanrooms: ev.target.value})} 
                                placeholder="cleanrooms" />
                            </div>
                            <div className="col-span-1 md:col-span-1 lg:col-span-1">
                                <span class="text-pink-700">Parkings</span>
                                <input type="number"
                                class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black" 
                                value={property.parkings} 
                                onChange={ev => setProperty({...property, parkings: ev.target.value})} 
                                placeholder="parkings" />
                            </div>
                            <div className="col-span-2 md:col-span-3 lg:col-span-3">
                                <span class="text-pink-700">Address</span>
                                <input type="text"
                                class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black" 
                                alue={property.address} 
                                onChange={ev => setProperty({...property, address: ev.target.value})} 
                                placeholder="address" />
                            </div>
                            <div className="col-span-1 md:col-span-2 lg:col-span-2">
                                <span class="text-pink-700">Price</span>
                                <input type="number"
                                class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black" 
                                value={property.price} 
                                onChange={ev => setProperty({...property, price: ev.target.value})} 
                                placeholder="price" />
                            </div>
                            <div className="col-span-1 md:col-span-2 lg:col-span-2">
                                <span class="text-pink-700">Disccount</span>
                                <input type="number"
                                class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black" 
                                value={property.discount} 
                                onChange={ev => setProperty({...property, discount: ev.target.value})} 
                                placeholder="discount" />
                            </div>
                            <div className="col-span-1 md:col-span-1 lg:col-span-1">
                                <span class="text-pink-700">Length</span>
                                <input type="number"
                                class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black" 
                                value={property.sizeLength} 
                                onChange={ev => setProperty({...property, sizeLength: ev.target.value})} 
                                placeholder="sizeLength" />
                            </div>
                            <div className="col-span-1 md:col-span-1 lg:col-span-1">
                                <span class="text-pink-700">Width</span>
                                <input type="number"
                                class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black" 
                                value={property.sizeWidth} 
                                onChange={ev => setProperty({...property, sizeWidth: ev.target.value})} 
                                placeholder="sizeWidth" />
                            </div>
                            <div className="col-span-1 md:col-span-1 lg:col-span-1">
                                <span class="text-pink-700">Level</span>
                                <input type="number"
                                class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black" 
                                value={property.level} 
                                onChange={ev => setProperty({...property, level: ev.target.value})} 
                                placeholder="level" />
                            </div>
                            <div className="col-span-1 md:col-span-1 lg:col-span-1">
                                <span class="text-pink-700">Floors</span>
                                <input type="number"
                                class="mt-0 block w-full px-0.5 border-0 border-b-2 border-pink-600 focus:ring-0 focus:border-black" 
                                value={property.floors} 
                                onChange={ev => setProperty({...property, floors: ev.target.value})} 
                                placeholder="floors" />
                            </div>
                            <div className="lg:col-span-3">
                                <button className="border border-green-600 text-green-600 py-2 px-4 hover:bg-green-600 hover:text-white transition-colors">
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>
                    </div>
                    </div>
                }


            </div>

       </div>
    )
}