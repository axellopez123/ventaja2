import { React, useEffect, useState, useCallback, useMemo } from "react";
// import Image from 'next/image'
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";

import {
  RiCloseCircleLine,
  RiHotelBedFill,
  RiSparkling2Fill,
} from "react-icons/ri";
import { LiaToiletSolid } from "react-icons/lia";
import { FaCarSide, FaWhatsapp, FaPhoneAlt } from "react-icons/fa";
import { BiSolidWasher } from "react-icons/bi";
import { SiGooglemaps } from "react-icons/si";
import { IoCameraOutline, IoClose } from "react-icons/io5";
import TextField from "@mui/material/TextField";
import { NumericFormat } from 'react-number-format';

const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "3px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#ab79d5",
  borderStyle: "dashed",
  backgroundColor: "transparent",
  color: "#000000",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/storage/`;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const { setNotification } = useStateContext();
  const [image, setImage] = useState(null);
  const [showShinner, setShowShinner] = useState(false);
  const [images, setImages] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);

  const [files, setFiles] = useState([]);
  const [filesSelected, setFilesSelected] = useState([]);
  const [imagePreview, setImagePreview] = useState(
    `${baseUrl}photos/default.jpg`
  );
  const [property, setProperty] = useState({
    id: null,
    name: "",
    bedrooms: undefined,
    bathrooms: undefined,
    cleanrooms: undefined,
    parkings: undefined,
    address: undefined,
    moodsBuy: undefined,
    price: undefined,
    discount: undefined,
    sizeLength: undefined,
    sizeWidth: undefined,
    level: undefined,
    floors: undefined,
    typeMode: undefined,
    type: undefined,
    appliances: undefined,
    status: undefined,
  });

  const normalizeImage = (file) => ({
    id: uuidv4(),
    name: file.name,
    preview: URL.createObjectURL(file),
    file,
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length) {
      const normalized = acceptedFiles.map(normalizeImage);
      setImages((prev) => [...prev, ...normalized]);
    }
  }, []);

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    // Ajustar el índice de la portada si es necesario
    if (coverIndex === index) {
      setCoverIndex(0);
    } else if (coverIndex > index) {
      setCoverIndex(prev => prev - 1);
    }
  };
  // const onDrop = useCallback((acceptedFiles) => {
  //   if (acceptedFiles?.length) {
  //     setImages((previusFiles) => [
  //       ...previusFiles,
  //       ...acceptedFiles.map((image) =>
  //         Object.assign(image, {id: uuidv4(),preview: URL.createObjectURL(image) })
  //       ),
  //     ]);      
  //   }
  // }, []);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setProperty((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumericChange = (name) => (values) => {
    setProperty((prev) => ({
      ...prev,
      [name]: values.floatValue ?? '',
    }));
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(images);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setImages(reordered);

    // actualizar portada si se movió
    if (result.source.index === coverIndex) {
      setCoverIndex(result.destination.index);
    } else if (
      result.source.index < coverIndex &&
      result.destination.index >= coverIndex
    ) {
      setCoverIndex((prev) => prev - 1);
    } else if (
      result.source.index > coverIndex &&
      result.destination.index <= coverIndex
    ) {
      setCoverIndex((prev) => prev + 1);
    }
    console.log(images);
    
  };


  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removeFile = (name) => {
    setFiles((files) => files.filter((file) => file.name !== name));
  };

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  if (id) {
    useEffect(() => {
      setLoading(true);
      axiosClient
        .get(`/properties/${id}`)
        .then(({ data }) => {
          setLoading(false);
          setProperty(data.data);
        })
        .catch(() => {
          setLoading(false);
        });
      setShowShinner(true);
      axiosClient
        .get(`/imagesNames/${id}`)
        .then((res) => {
          setFiles(res.data);
          var main = files.find((e) => e.main == true);
          if (main) {
            setImagePreview(`${baseUrl}${main.preview}`);
          } else {
            setImagePreview(`${baseUrl}${files[0].preview}`);
          }
          console.log(files);
        })
        .catch((err) => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors);
          }
        });
    }, []);
  }

  const uploadImage = (id, file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("id_property", id);

    axiosClient
      .post(`/upload/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        //NOTIFICATION
        setNotification("Images was successfully created");
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors);
        }
      });
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();

    if (property.id) {
      axiosClient
        .put(`/properties/${property.id}`, property)
        .then(() => {
          /////////////////
          // upload image
          ////////////////
          if (image) {
            // uploadImage(property.id,image)
          }
          if (filesSelected) {
            // files.map(file => (uploadImage(property.id,file)))
            filesSelected.map((file, index) => {
              uploadImage(property.id, file);
            });
          }

          //NOTIFICATION
          setNotification("Property was successfully updated");
          navigate("/properties");
        })
        .catch((err) => {
          const response = err.response;
          if (response && response.status === 403) {
            setErrors(response.data.errors);
          }
          if (response && response.status === 422) {
            setErrors(response.data.errors);
          }
        });
    } else {
      axiosClient
        .post(`/products`, property)
        .then((prop) => {
          const formData = new FormData();
          images.forEach((img, index) => {
            formData.append("files", img);
          });
          formData.append("cover_index", coverIndex);
          formData.append("order", JSON.stringify(images.map((img) => img.id)));

          axiosClient.post(`/api/products/${prop.id}/images`, formData);

          // filesSelected.map((file, index) => {
          //   uploadImage(prop.data.id, file);
          // });

          //NOTIFICATION
          setNotification("Property was successfully created");
          navigate("/properties");
        })
        .catch((err) => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors);
          }
        });
    }
  };

  return (
    <div>
      {property.id && (
        <h2 className="text-xl text-gray-300">
          Update property: {property.name}
        </h2>
      )}
      {!property.id && <h2 className="text-xl text-gray-300">New property</h2>}

      <div>
        {loading && <div>Loading...</div>}
        {errors && (
          <div className="alert">
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <h3 className="text-xl text-white font-semibold">Error</h3>
                </div>
                {Object.keys(errors).map((key) => (
                  <p key={key}>{errors[key][0]}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 grid-row-1">
            <div className="col-span-1 row-span-1 m-12"></div>
            {/* ----------------------------------- */}
            <div className="col-span-1 row-span-1">
              <form onSubmit={onSubmit}>
                {/* <div>
                            <input type="file" onChange={ev => setImage(ev.target.files[0])}/>
                        </div> */}
                {/* OTRO METODO CHIdO  */}

                <div>
                  <img
                    src={imagePreview}
                    alt=""
                    className="w-full h-64 rounded-lg border-4 border-double border-indigo-500/75 hover:border-indigo-300"
                  />
                </div>
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt=""
                    className="w-full h-64 rounded-lg border-4 border-double border-indigo-500/75 hover:border-indigo-300"
                  />
                  {showShinner && (
                    <div className="absolute top-0 left-0 w-full h-full flex justify-start items-start">
                      <div className="bg-green-600 opacity-50 text-white m-4 p-2 rounded-full hover:opacity-90">
                        <RiSparkling2Fill className="text-4xl text-yellow-600" />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div class="mt-8 flex overflow-x-scroll gap-4">
                    {files.map((file, index) => (
                      <div>
                        {/* <button onClick={removeFile(file.preview)}>X</button> */}
                        <img
                          src={`${baseUrl}${file.preview}`}
                          alt=""
                          onLoad={() => {
                            URL.revokeObjectURL(file.preview);
                          }}
                          onClick={() => {
                            setImagePreview(`${baseUrl}${file.preview}`);
                          }}
                          className="w-16 md:w-32 lg:w-48 rounded-lg border-4 border-double border-indigo-500/75 hover:border-indigo-300"
                        />
                      </div>
                    ))}
                    {filesSelected.map((file, index) => (
                      <img
                        src={file.preview}
                        alt=""
                        onLoad={() => {
                          URL.revokeObjectURL(file.preview);
                        }}
                        onClick={() => {
                          setImagePreview(file.preview);
                        }}
                        className="w-16 md:w-20 lg:w-48 rounded-lg border-4 border-double border-indigo-500/75 hover:border-indigo-300"
                      />
                    ))}
                  </div>
                  <div>
                    <div {...getRootProps({ style })}>
                      <input {...getInputProps()} />
                      {isDragActive ? (
                        <p>Suelta aqui tus imagenes...</p>
                      ) : (
                        <div className="grid grid-cols-12">
                          <div className="col-span-2">
                            <IoCameraOutline className="text-3xl" />
                          </div>
                          <div className="col-span-10">
                            <p>Selecciona o arrastra tus fotos</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>

                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="images" direction="horizontal">
                      {(provided) => (
                        <div
                          className="flex overflow-auto gap-4 mt-4 pb-2"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {images.map((img, index) => (
                            <Draggable key={img.id} draggableId={String(img.id)} index={index}>
                              {(provided) => {
                                return (

                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`relative w-24 h-24 rounded overflow-hidden border-4 ${index === coverIndex ? 'border-blue-500' : 'border-gray-300'
                                      }`}
                                  >
                                    <img
                                      src={img.preview}
                                      // onMouseDown={(e) => e.stopPropagation()} // evita conflicto con drag
                                      alt="preview"
                                      className="w-full h-full object-cover"
                                      onClick={() => setCoverIndex(index)}
                                    />
                                    <button
                                      onClick={() => {
                                        // e.stopPropagation();
                                        removeImage(index);
                                      }
                                      }
                                      className="absolute top-0 right-0 p-1 bg-white rounded-bl-lg hover:bg-red-200"
                                      title="Eliminar"
                                    >
                                      <IoClose className="text-red-500" />
                                    </button>
                                    {index === coverIndex && (
                                      <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs px-1 rounded-tr">
                                        Portada
                                      </div>
                                    )}
                                  </div>
                                )
                              }}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} />

                  <div className="col-span-2 md:col-span-4 lg:col-span-4">


                    <TextField
                      id="name"
                      name="name"
                      label="Aliás"
                      variant="standard"
                      value={property.name}
                      onChange={handleTextChange}

                    />
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">

                    <NumericFormat
                      value={property.bedrooms || ''}
                      onValueChange={handleNumericChange("bedrooms")}
                      name="bedrooms"
                      allowNegative={false}
                      customInput={TextField}
                      label="Habitaciones"
                      variant="standard"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">
                    <NumericFormat
                      value={property.bathrooms || ''}
                      onValueChange={handleNumericChange("bathrooms")}
                      name="bathrooms"
                      allowNegative={false}
                      decimalScale={1}
                      fixedDecimalScale={true}
                      customInput={TextField}
                      label="Baños"
                      variant="standard"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">

                    <NumericFormat
                      value={property.cleanrooms || ''}
                      onValueChange={handleNumericChange("cleanrooms")}
                      name="cleanrooms"
                      allowNegative={false}
                      customInput={TextField}
                      label="Cuarto de servicio"
                      variant="standard"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">

                    <NumericFormat
                      value={property.parkings || ''}
                      onValueChange={handleNumericChange("parkings")}
                      name="parkings"
                      allowNegative={false}
                      customInput={TextField}
                      label="Estacionamiento"
                      variant="standard"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-3 lg:col-span-3">

                    <TextField
                      id="address"
                      name="address"
                      label="Dirección"
                      variant="standard"
                      value={property.address}
                      onChange={handleTextChange}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-3 lg:col-span-3">

                    <TextField
                      id="moodsBuy"
                      name="moodsBuy"
                      label="MoodsBuy"
                      variant="standard"
                      value={property.moodsBuy}
                      onChange={handleTextChange}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-3 lg:col-span-3">

                    <TextField
                      id="typeMode"
                      name="typeMode"
                      label="typeMode"
                      variant="standard"
                      value={property.typeMode}
                      onChange={handleTextChange}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-3 lg:col-span-3">

                    <TextField
                      id="type"
                      name="type"
                      label="type"
                      variant="standard"
                      value={property.type}
                      onChange={handleTextChange}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 lg:col-span-2">

                    <NumericFormat
                      value={property.price}
                      onValueChange={handleNumericChange("price")}
                      customInput={TextField}
                      thousandSeparator
                      valueIsNumericString
                      prefix="$"
                      name="price"
                      variant="standard"
                      label="Precio"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <NumericFormat
                      value={property.discount}
                      onValueChange={handleNumericChange("discount")}
                      customInput={TextField}
                      thousandSeparator
                      valueIsNumericString
                      name="discount"
                      prefix="$"
                      variant="standard"
                      label="Descuento"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">

                    <NumericFormat
                      value={property.sizeLength}
                      onValueChange={handleNumericChange("sizeLength")}
                      customInput={TextField}
                      thousandSeparator
                      name="sizeLength"
                      suffix=" m²"
                      label="Largo (m²)"
                      variant="standard"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">

                    <NumericFormat
                      value={property.sizeWidth}
                      onValueChange={handleNumericChange("sizeWidth")}
                      customInput={TextField}
                      thousandSeparator
                      suffix=" m²"
                      label="Ancho (m²)"
                      name="sizeWidth"
                      variant="standard"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">

                    <NumericFormat
                      value={property.level || ''}
                      onValueChange={handleNumericChange("level")}
                      name="level"
                      allowNegative={false}
                      customInput={TextField}
                      label="Nivel"
                      variant="standard"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1 lg:col-span-1">

                    <NumericFormat
                      value={property.floors || ''}
                      onValueChange={handleNumericChange("floors")}
                      name="floors"
                      allowNegative={false}
                      customInput={TextField}
                      label="Pisos"
                      variant="standard"
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <button className="border border-green-600 text-green-600 py-2 px-4 hover:bg-green-600 hover:text-white transition-colors">
                      Guardar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
