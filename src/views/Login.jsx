import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";
import loginImage from "../assets/home.png"; // ruta según dónde la guardes

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const [errors, setErrors] = useState(null);
  const { setUser, setToken } = useStateContext();
  const navigate = useNavigate();

  const onSubmit = async (ev) => {
    ev.preventDefault();

    const payload = {
      username: emailRef.current.value,
      password: passwordRef.current.value,
    };
    setErrors(null);
    try {
      await axiosClient.post("/auth/login", payload, {
        withCredentials: true,
      });

      const { data } = await axiosClient.get("/auth/me", {
        withCredentials: true,
      });

      setUser(data);
      navigate("/dashboard");
    } catch (error) {
      const res = error.response;
      if (res && res.status === 401) {
        setErrors({ general: "Credenciales incorrectas" });
      } else {
        console.error("Error al iniciar sesión:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#252831] grid grid-cols-1 lg:grid-cols-2 bg-amber-500">
      <div className="text-white flex flex-col items-center justify-center gap-8 p-8 max-w-lg mx-auto">
        <div className="flex flex-col gap-1 w-full">
          <h1 className="text-4xl font-medium">Iniciar sesión</h1>
          <p className="text-gray-400">
            Ingresa al sistema con tus credenciales
          </p>
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
            <span className="ml-2">Ingresar con Google</span>
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
            <label htmlFor="email" className="text-gray-200">
              Correo electrónico *
            </label>
            <input
              ref={emailRef}
              type="email"
              id="email"
              autoComplete="off"
              className="w-full py-2 px-4 bg-transparent border rounded-full mt-2 outline-none focus:border-indigo-400"
              placeholder="Ingresa tu correo electrónico"
            />
          </div>

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

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 order-2 md:order-1">
            <span className="text-gray-400">
              ¿No tienes cuenta?{" "}
              <Link
                to={"/signup"}
                className="text-indigo-400 hover:text-indigo-500 transition-colors"
              >
                Registrate
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
              Iniciar sesión
            </button>
          </div>

          <p className="">
            Not registered?
            <Link to={"/signup"}>Create an account</Link>
          </p>
        </form>
      </div>
      <div className="relative hidden lg:block">
        {/* Imagen ocupando todo */}
        <img
          src={loginImage}
          alt="Login"
          className="w-full h-full object-cover"
        />
        {/* Difuminado de bordes */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#252831] via-transparent to-[#252831] pointer-events-none"></div>
      </div>
    </div>
  );
}
