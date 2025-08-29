import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import axios from "axios";
import axiosClient from "../axios-client";
import { useStateContext } from "../contexts/ContextProvider";

export default function Signup() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwrodConfirmationRef = useRef();
  const [errors, setErrors] = useState(null);
  const { setUser, setToken } = useStateContext();
  const navigate = useNavigate();
  const onSubmit = async (ev) => {
    ev.preventDefault();

    const payload = {
      username: nameRef.current.value,
      password: passwordRef.current.value,
      email: 'axel3@mail.com',
      birthdate: '1998-10-06'
    };

    try {
      const { data } = await axiosClient.post("/auth/register/", payload);
      // const token = data.access_token;

      // setToken(token);

      // ⚠️ Usa el token directamente, no el del estado
      // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const meRes = await axiosClient.get("/auth/me");
      setUser(meRes.data);

      navigate("/dashboard");
    } catch (err) {
      const response = err.response;
      if (response && response.status === 422) {
        setErrors(response.data.errors);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#252831] grid grid-cols-1 lg:grid-cols-2">
      <div className="text-white flex flex-col items-center justify-center gap-8 p-8 max-w-lg mx-auto">
        <div className="flex flex-col gap-1 w-full">
          <h1 className="text-4xl font-medium">Crear cuenta</h1>
          <p className="text-gray-400">Registrate en la plataforma</p>
        </div>

        {/* GOOGLE */}
        <div className="w-full">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border p-2 px-4 rounded-full"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
              width="20"
              height="20"
            />
            <span className="ml-2">Registrate con Google</span>
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {errors && (
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
                  <p className="text-white" key={key}>
                    {errors[key][0]}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="name" className="text-gray-200">
              Nombre completo *
            </label>
            <input
              ref={nameRef}
              type="text"
              id="username"
              autoComplete="off"
              className="w-full py-2 px-4 bg-transparent border rounded-full mt-2 outline-none focus:border-indigo-400"
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          {/* <div>
                    <label htmlFor="email" className="text-gray-200">
                        Correo electrónico *
                    </label>
                    <input ref={emailRef}
                        type="email"
                        id="email"
                        autoComplete="off"
                        className="w-full py-2 px-4 bg-transparent border rounded-full mt-2 outline-none focus:border-indigo-400"
                        placeholder="Ingresa tu correo electrónico"
                    />
                </div> */}
          <div>
            <label htmlFor="password" className="text-gray-200">
              Contraseña *
            </label>
            <input
              ref={passwordRef}
              type="password"
              id="password"
              autoComplete="off"
              className="w-full py-2 px-4 bg-transparent border rounded-full mt-2 outline-none focus:border-indigo-400"
              placeholder="Ingresa tu contraseña"
            />
          </div>
          {/* <div>
                    <label htmlFor="password" className="text-gray-200">
                         Confirma Contraseña *
                    </label>
                    <input ref={passwrodConfirmationRef}
                        type="password"
                        id="password"
                        autoComplete="off"
                        className="w-full py-2 px-4 bg-transparent border rounded-full mt-2 outline-none focus:border-indigo-400"
                        placeholder="Ingresa tu contraseña"
                    />
                </div> */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 order-2 md:order-1">
            <span className="text-gray-400">
              ¿Ya tienes cuenta?{" "}
              <Link
                to={"/login"}
                className="text-indigo-400 hover:text-indigo-500 transition-colors"
              >
                Sign in
              </Link>
            </span>
            <a
              href="#"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <div className="mt-4 order-1 md:order-2">
            <button
              type="submit"
              className="w-full bg-indigo-700 p-2 rounded-full hover:bg-indigo-800 transition-colors"
            >
              Crear cuenta
            </button>
          </div>
        </form>
      </div>
      <div className="bg hidden lg:block"></div>
    </div>
  );
}
