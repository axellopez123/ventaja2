import { React, useEffect, useState, useCallback, useMemo } from "react";
// import Image from 'next/image'
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import Card from "../components/shared/Card";
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
import { NumericFormat } from "react-number-format";

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
  const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/`;
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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
  const typeMode = ["venta", "renta"];
  const type = ["casa", "departamento", "terrano"];
  const moodsBuy = [
    "contado",
    "infonavit",
    "bancario",
    "fovissste",
    "trato",
    "pensiones",
    "traspaso",
  ];

  const [property, setProperty] = useState({
    id: null,
    name: "",
    bedrooms: undefined,
    bathrooms: undefined,
    cleanrooms: undefined,
    parkings: undefined,
    address: undefined,
    moodsBuy: [],
    price: undefined,
    discount: undefined,
    sizeLength: undefined,
    sizeWidth: undefined,
    level: undefined,
    floors: undefined,
    typeMode: [],
    type: [],
    appliances: undefined,
    status: undefined,
  });
  const [isDraggingOverWindow, setIsDraggingOverWindow] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  useEffect(() => {
    const handleDragEnter = (e) => {
      e.preventDefault();
      setDragCounter((prev) => prev + 1);
      setIsDraggingOverWindow(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      setDragCounter((prev) => {
        const newCount = prev - 1;
        if (newCount <= 0) setIsDraggingOverWindow(false);
        return newCount;
      });
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setDragCounter(0);
      setIsDraggingOverWindow(false);
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);
  const handleSubmitStep = async (ev) => {
    ev.preventDefault();

    if (activeStep === 0) {
      if (id) {
        // 🔁 ACTUALIZAR propiedad
        try {
          await axiosClient.put(`/products/${property.id}`, property);
          setActiveStep(1);
        } catch (err) {
          const response = err.response;
          if (response?.status === 403 || response?.status === 422) {
            setErrors(response.data.errors);
          }
        }
      } else {
        // Validación básica
        if (!property.name || !property.bedrooms) {
          alert("Completa todos los campos antes de continuar.");
          return;
        }
        // if (!property.id) {
        //   alert("Debes completar el paso 1 antes de continuar.");
        //   return;
        // }

        try {
          const res = await axiosClient.post(`/products/`, property);
          // setPropertyId(res.data.id);
          const created = res.data;

          setProperty((prev) => ({
            ...prev,
            id: created.id,
          }));
          setActiveStep(1);
        } catch (err) {
          console.error("Error al crear propiedad:", err);
          alert("No se pudo crear la propiedad.");
        } finally {
          setLoading(false);
        }
      }
    }
    if (activeStep === 1) {
      if (property.id) {
        // 🔁 ACTUALIZAR propiedad
        try {
          await axiosClient.put(`/products/${property.id}`, property);
          setActiveStep(2);
        } catch (err) {
          const response = err.response;
          if (response?.status === 403 || response?.status === 422) {
            setErrors(response.data.errors);
          }
        }
      }
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      // Validación básica
      if (!property.name || !property.bedrooms) {
        alert("Completa todos los campos antes de continuar.");
        return;
      }
      // if (!property.id) {
      //   alert("Debes completar el paso 1 antes de continuar.");
      //   return;
      // }

      try {
        setLoading(true);
        const res = await axiosClient.post("/properties", property);
        // setPropertyId(res.data.id);
        const created = res.data;

        setProperty((prev) => ({
          ...prev,
          id: created.id,
        }));
        setActiveStep(1);
      } catch (err) {
        console.error("Error al crear propiedad:", err);
        alert("No se pudo crear la propiedad.");
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (!acceptedFiles?.length) return;

      const startOrder = images.length;

      acceptedFiles.forEach((file, index) => {
        const order = startOrder + index;
        const isCover = images.length === 0 && index === 0; // portada si no hay ninguna imagen

        const tempId = uuidv4();
        const tempImage = {
          id: tempId,
          name: file.name,
          original: URL.createObjectURL(file),
          file,
          order,
          uploading: true,
          progress: 0,
        };

        setImages((prev) => [...prev, tempImage]);

        const formData = new FormData();
        formData.append("file", file); // ahora es "file", no "files"
        formData.append("order", order.toString());
        formData.append("cover_index", isCover ? 0 : 1);

        axiosClient
          .post(`/products/${property.id}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (event) => {
              const percent = Math.round(
                (event.loaded * 100) / (event.total || 1)
              );
              setImages((prev) =>
                prev.map((img) =>
                  img.id === tempId ? { ...img, progress: percent } : img
                )
              );
            },
          })
          .then((res) => {
            setImages((prev) =>
              prev.map((img) =>
                img.id === tempId
                  ? {
                      ...img,
                      id: res.data.id,
                      original: res.data.original,
                      uploading: false,
                      is_cover: res.data.is_cover,
                    }
                  : img
              )
            );
            // console.log(images);
          })
          .catch((err) => {
            console.error("Error al subir imagen", err);
            setImages((prev) => prev.filter((img) => img.id !== tempId));
          });
      });
    },
    [images, property.id]
  );

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    // Ajustar el índice de la portada si es necesario
    if (coverIndex === index) {
      setCoverIndex(0);
    } else if (coverIndex > index) {
      setCoverIndex((prev) => prev - 1);
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
      [name]: values.floatValue ?? "",
    }));
  };

  const handleKeyDown = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };
  const saveImageOrder = async (productId, images, coverIndex) => {
    try {
      const body = {
        order: images.map((img, index) => ({
          id: img.id,
          order: index,
          is_cover: index === coverIndex,
        })),
      };

      const response = await axiosClient.put(
        `/products/${productId}/images/reorder`,
        body
      );

      console.log("Orden actualizado correctamente", response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error("Error del servidor:", error.response.data);
      } else {
        console.error("Error de red o desconocido:", error.message);
      }
      throw error; // Re-lanza si quieres manejarlo más arriba
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
    const allImagesHaveId = reordered.every((img) => img.id);
    if (allImagesHaveId) {
      saveImageOrder(property.id, reordered, coverIndex);
    }
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
  useEffect(() => {
    if (!id) return; // modo “crear”, sin fetch

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`Gei: ${id}`);

        // 1) producto
        const { data: prod } = await axiosClient.get(`/products/${id}`);
        setProperty(prod);
        console.log(`Property: ${property}`);

        // // 2) imágenes
        // const { data: imgs } = await axiosClient.get(`/imagesNames/${id}`);
        setImages(prod.images); // ya son { id, preview, main }
        console.log(`Images: ${images.length}`);

        // // opcional: portada
        const coverIdx = images.findIndex((i) => i.main);
        if (coverIdx !== -1) setCoverIndex(coverIdx);
      } catch (err) {
        console.error(err);
        setErrors(err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // if (id) {
  //   useEffect(() => {
  //     setLoading(true);
  //     axiosClient
  //       .get(`/products/${id}`)
  //       .then(({ data }) => {
  //         setLoading(false);
  //         setProperty(data.data);
  //       })
  //       .catch(() => {
  //         setLoading(false);
  //       });
  //     setShowShinner(true);
  //     // axiosClient
  //     //   .get(`/imagesNames/${id}`)
  //     //   .then((res) => {
  //     //     setFiles(res.data);
  //     //     var main = files.find((e) => e.main == true);
  //     //     if (main) {
  //     //       setImagePreview(`${baseUrl}${main.preview}`);
  //     //     } else {
  //     //       setImagePreview(`${baseUrl}${files[0].preview}`);
  //     //     }
  //     //     console.log(files);
  //     //   })
  //     //   .catch((err) => {
  //     //     const response = err.response;
  //     //     if (response && response.status === 422) {
  //     //       setErrors(response.data.errors);
  //     //     }
  //     //   });
  //   }, [id]);
  // }

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
      // 🔁 ACTUALIZAR propiedad
      try {
        await axiosClient.put(`/products/${property.id}`, property);

        // 🆕 Subir imágenes nuevas
        const newImages = images.filter((img) => img.file);
        if (newImages.length > 0) {
          const formData = new FormData();
          newImages.forEach((img) => {
            formData.append("files", img.file);
          });
          formData.append("cover_index", coverIndex);
          await axiosClient.post(`/products/${property.id}/images`, formData);
        }

        // 🔃 Reordenar imágenes si todas tienen ID
        const existingImages = images.filter((img) => img.id);
        if (existingImages.length === images.length) {
          const body = {
            order: images.map((img, index) => ({
              id: img.id,
              order: index,
              is_cover: index === coverIndex,
            })),
          };
          await axiosClient.put(
            `/products/${property.id}/images/reorder`,
            body
          );
        }

        setNotification("Property was successfully updated");
        navigate("/properties");
      } catch (err) {
        const response = err.response;
        if (response?.status === 403 || response?.status === 422) {
          setErrors(response.data.errors);
        }
      }
    } else {
      // ➕ CREAR propiedad
      try {
        const prop = await axiosClient.post(`/products`, property);

        const formData = new FormData();
        images.forEach((img) => {
          formData.append("files", img.file); // solo nuevos
        });
        formData.append("cover_index", coverIndex);
        formData.append("order", JSON.stringify(images.map((_, idx) => idx)));

        await axiosClient.post(`/products/${prop.data.id}/images`, formData);

        setNotification("Property was successfully created");
        navigate("/properties");
      } catch (err) {
        const response = err.response;
        if (response?.status === 422) {
          setErrors(response.data.errors);
        }
      }
    }
  };
  const toggleTipoCompra = (tipo) => {
    setProperty((prev) => {
      const typeMode = Array.isArray(prev.typeMode) ? prev.typeMode : [];
      const yaSeleccionado = typeMode.includes(tipo);
      const typeModeActualizado = yaSeleccionado
        ? typeMode.filter((t) => t !== tipo)
        : [...typeMode, tipo];
      console.log(typeModeActualizado);
      return { ...prev, typeMode: typeModeActualizado };
    });
  };
  const toggleTipoVenta = (tipo) => {
    setProperty((prev) => {
      const moodsBuy = Array.isArray(prev.moodsBuy) ? prev.moodsBuy : [];
      const yaSeleccionado = moodsBuy.includes(tipo);
      const moodsBuyActualizado = yaSeleccionado
        ? moodsBuy.filter((t) => t !== tipo)
        : [...moodsBuy, tipo];
      console.log(moodsBuyActualizado);

      return { ...prev, moodsBuy: moodsBuyActualizado };
    });
  };
  const onSubmit2 = async (ev) => {
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
          console.log(prop);
          const formData = new FormData();
          images.forEach((img, index) => {
            formData.append("files", img);
          });
          formData.append("cover_index", coverIndex);
          formData.append("order", JSON.stringify(images.map((img) => img.id)));

          axiosClient.post(`/products/${prop.data.id}/images`, formData);

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

  const imageGalleryItems = images.map((img) => ({
    original: `${baseUrl}${img.original}`,
    thumbnail: `${baseUrl}${img.thumbnail}`,
  }));
  const shouldShowDropZone = isDragActive || images.length === 0;

  const steps = [
    {
      label: "Datos principales",
      content: (
        <div>
          <form onSubmit={handleSubmitStep}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-4 lg:col-span-4">
                <TextField
                  id="name"
                  name="name"
                  label="Aliás"
                  variant="standard"
                  value={property.name}
                  onChange={handleTextChange}
                  fullWidth
                />
              </div>
              <div className="col-span-2 md:col-span-2 lg:col-span-2">
                <NumericFormat
                  value={property.bedrooms || ""}
                  onValueChange={handleNumericChange("bedrooms")}
                  name="bedrooms"
                  allowNegative={false}
                  customInput={TextField}
                  label="Habitaciones"
                  variant="standard"
                  fullWidth
                />
              </div>
              <div className="col-span-2 md:col-span-2 lg:col-span-2">
                <NumericFormat
                  value={property.bathrooms || ""}
                  onValueChange={handleNumericChange("bathrooms")}
                  name="bathrooms"
                  allowNegative={false}
                  decimalScale={1}
                  fixedDecimalScale={true}
                  customInput={TextField}
                  label="Baños"
                  variant="standard"
                  fullWidth
                />
              </div>
              <div className="col-span-2 md:col-span-2 lg:col-span-2">
                <NumericFormat
                  value={property.parkings || ""}
                  onValueChange={handleNumericChange("parkings")}
                  name="parkings"
                  allowNegative={false}
                  customInput={TextField}
                  label="Estacionamiento"
                  variant="standard"
                  fullWidth
                />
              </div>
              <div className="col-span-2 md:col-span-2 lg:col-span-2">
                <NumericFormat
                  value={property.cleanrooms || ""}
                  onValueChange={handleNumericChange("cleanrooms")}
                  name="cleanrooms"
                  allowNegative={false}
                  customInput={TextField}
                  label="Cuarto de servicio"
                  variant="standard"
                  fullWidth
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
                  fullWidth
                />
              </div>
              <div className="col-span-2 md:col-span-3 lg:col-span-3">
                <div className="flex justify-start">
                  {typeMode.map((tipo) => (
                    <div
                      key={tipo}
                      onClick={() => toggleTipoCompra(tipo)}
                      className={`cursor-pointer rounded-xl px-3 py-1 w-fit text-sm font-semibold mr-2 transition ${
                        Array.isArray(property.typeMode) &&
                        property.typeMode.includes(tipo)
                          ? "bg-green-700 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 md:col-span-3 lg:col-span-3">
                <div className="flex justify-start">
                  {moodsBuy.map((tipo) => (
                    <div
                      key={tipo}
                      onClick={() => toggleTipoVenta(tipo)}
                      className={`cursor-pointer rounded-xl px-3 py-1 w-fit text-sm font-semibold mr-2 transition ${
                        Array.isArray(property.moodsBuy) &&
                        property.moodsBuy.includes(tipo)
                          ? "bg-green-700 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-2 md:col-span-3 lg:col-span-3">
                <div className="flex justify-start">
                  {type.map((tipo) => (
                    <div
                      key={tipo}
                      onClick={() =>
                        setProperty((prev) => ({
                          ...prev,
                          type: tipo,
                        }))
                      }
                      className={`cursor-pointer rounded-xl px-3 py-1 w-fit text-sm font-semibold mr-2 ${
                        property.type === tipo
                          ? "bg-green-700 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Button variant="contained" type="submit" sx={{ mt: 1, mr: 1 }}>
                  Siguiente
                </Button>
              </div>
            </div>
          </form>
        </div>
      ),
    },
    {
      label: "Mas datos",
      content: (
        <div>
          <form onSubmit={handleSubmitStep}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
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
                  value={property.level || ""}
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
                  value={property.floors || ""}
                  onValueChange={handleNumericChange("floors")}
                  name="floors"
                  allowNegative={false}
                  customInput={TextField}
                  label="Pisos"
                  variant="standard"
                />
              </div>
              <div>
                <Button variant="contained" type="submit" sx={{ mt: 1, mr: 1 }}>
                  Siguiente
                </Button>
              </div>
            </div>
          </form>
        </div>
      ),
    },
    {
      label: "Imagenes",
      content: (
        <div>
          <div className="max-w-4xl mx-auto px-1 py-4">
            <div className="relative w-full h-[400px] rounded-2xl shadow-xl overflow-hidden bg-black flex items-center justify-center">
              {isDraggingOverWindow || images.length === 0 ? (
                <div>
                  <div {...getRootProps({ style })}>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p className="text-white">Suelta aqui tus imagenes...</p>
                    ) : (
                      <div className="grid grid-cols-12">
                        <div className="col-span-2">
                          <IoCameraOutline className="text-3xl" />
                        </div>
                        <div className="col-span-10">
                          <p className="text-white">
                            Selecciona o arrastra tus fotos
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <ImageGallery
                    items={imageGalleryItems}
                    showThumbnails={false}
                    showBullets={true}
                    showFullscreenButton={false}
                    showPlayButton={false}
                    renderLeftNav={(onClick, disabled) => (
                      <button
                        aria-label="Previous image"
                        onClick={onClick}
                        disabled={disabled}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 
        bg-white/80 hover:bg-white shadow-lg rounded-full p-2 z-20
        backdrop-blur-sm border border-gray-200 
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-105"}`}
                      >
                        <RiArrowLeftLine className="w-5 h-5 text-gray-800" />
                      </button>
                    )}
                    renderRightNav={(onClick, disabled) => (
                      <button
                        aria-label="Next image"
                        onClick={onClick}
                        disabled={disabled}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-200 
        bg-white/80 hover:bg-white shadow-lg rounded-full p-2 z-20
        backdrop-blur-sm border border-gray-200 
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-105"}`}
                      >
                        <RiArrowRightLine className="w-5 h-5 text-gray-800" />
                      </button>
                    )}
                    renderBullet={(index, className, isSelected, onClick) => (
                      <button
                        key={index}
                        aria-label={`Select image ${index + 1}`}
                        className={`w-3 h-3 mx-1 rounded-full transition-all duration-200 ${
                          isSelected
                            ? "bg-blue-600 scale-110 shadow"
                            : "bg-gray-300 hover:bg-gray-500"
                        }`}
                        onClick={() => onClick(index)}
                      />
                    )}
                  />
                </div>
              )}
            </div>
            <div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="images" direction="horizontal">
                  {(provided) => (
                    <div
                      className="grid grid-flow-col auto-cols-[minmax(80px,_1fr)] gap-4 mt-4 pb-2 overflow-x-auto"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {images.map((img, index) => (
                        <Draggable
                          key={img.id}
                          draggableId={String(img.id)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative aspect-square rounded overflow-hidden border-4 ${
                                index === coverIndex
                                  ? "border-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <img
                                src={`${baseUrl}${img.original || img.url}`}
                                alt="preview"
                                className="w-full h-full object-cover"
                                onClick={() => setCoverIndex(index)}
                              />
                              <button
                                onClick={() => removeImage(index)}
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
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              {/* <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="images" direction="horizontal">
                        {(provided) => (
                          <div
                            className="flex overflow-auto gap-4 mt-4 pb-2"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {images.map((img, index) => {
                              // console.log(img);

                              return (
                                <Draggable
                                  key={img.id}
                                  draggableId={String(img.id)}
                                  index={index}
                                >
                                  {(provided) => {
                                    return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`relative w-24 h-24 rounded overflow-hidden border-4 ${index === coverIndex
                                            ? "border-blue-500"
                                            : "border-gray-300"
                                          }`}
                                      >
                                        <img
                                          // src={`${baseUrl}${img.url}`}
                                          src={
                                            `${baseUrl}${img.preview}`
                                          } // Si tiene URL, usa esa; si no, la previsualización
                                          // src={img.preview}
                                          // onMouseDown={(e) => e.stopPropagation()} // evita conflicto con drag
                                          alt="preview"
                                          className="w-full h-full object-cover"
                                          onClick={() => setCoverIndex(index)}
                                        />
                                        <button
                                          onClick={() => {
                                            // e.stopPropagation();
                                            removeImage(index);
                                          }}
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
                                    );
                                  }}
                                </Draggable>
                              )
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext> */}
            </div>
          </div>
          {/* <div>
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
          </div> */}
          {/* <div>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="images" direction="horizontal">
                {(provided) => (
                  <div
                    className="flex overflow-auto gap-4 mt-4 pb-2"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {images.map((img, index) => (
                      <Draggable
                        key={img.id}
                        draggableId={String(img.id)}
                        index={index}
                      >
                        {(provided) => {
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`relative w-24 h-24 rounded overflow-hidden border-4 ${
                                index === coverIndex
                                  ? "border-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              <img
                                // src={`${baseUrl}${img.url}`}
                                src={
                                  `${baseUrl}${img.preview}`
                                } // Si tiene URL, usa esa; si no, la previsualización
                                // src={img.preview}
                                // onMouseDown={(e) => e.stopPropagation()} // evita conflicto con drag
                                alt="preview"
                                className="w-full h-full object-cover"
                                onClick={() => setCoverIndex(index)}
                              />
                              <button
                                onClick={() => {
                                  // e.stopPropagation();
                                  removeImage(index);
                                }}
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
                          );
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div> */}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* {property?.id && (
        <h2 className="text-xl text-gray-300">
          Update property: {property.name}
        </h2>
      )}
      {!property.id && <h2 className="text-xl text-gray-300">New property</h2>} */}

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
          <div className="grid grid-cols-2 grid-row-1 xs:px-0 sm:px-16 md:px-32">
            {/* ----------------------------------- */}
            <div className="col-span-2 sm:col-span-1 row-span-1">
              <Box sx={{ maxWidth: 400 }}>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        optional={
                          index === steps.length - 1 ? (
                            <Typography variant="caption">Last step</Typography>
                          ) : null
                        }
                      >
                        {step.label}
                      </StepLabel>
                      <StepContent>
                        <Box>{step.content}</Box>
                        <Box sx={{ mb: 2 }}>
                          <Button
                            disabled={index === 0}
                            onClick={handleBack}
                            sx={{ mt: 1, mr: 1 }}
                          >
                            Back
                          </Button>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </div>
            {/* --------------------------- */}
            <div className="col-span-2 sm:col-span-1 row-span-1">
              <Card
                id={0}
                img={imageGalleryItems}
                description={property.name}
                price={property.price}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                typeMode={property.typeMode}
                moodsBuy={property.moodsBuy}
                status={property.status}
                parkings={property.parkings}
                cleanrooms={property.cleanrooms}
                isInitiallyFavorited={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
