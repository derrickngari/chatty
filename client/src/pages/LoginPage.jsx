import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../srevices/authServices";
import loginSvg from "../assets/login.svg";
import { motion as Motion } from "framer-motion";
import { AuthContext } from "../context/authContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const user = await login(email, password);
      setUser(user);
      navigate("/");
    } catch (error) {
      setError(
        error?.res?.message || error.message || "Something went wrong"
      );
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="min-h-screen  flex flex-col md:flex-row justify-between bg-neutral-800 text-gray-100">
        <div className="max-w-sm flex flex-col justify-center items-center h-screen mx-auto p-4 rounded-lg  mt-10">
          <h2 className="text-3xl font-bold text-center mb-5">Login</h2>
          <form
            onSubmit={handleLogin}
            className="flex flex-col items-center justify-center"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-1 border-sky-400 mb-6 py-3 w-full px-9 rounded-md text-gray-300"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-1 border-sky-400 mb-3 rounded-md py-3 w-full px-9"
            />
            <button
              type="submit"
              className="border-1 border-sky-400 mb-3 rounded-md bg-sky-800 text-sky-500 outline-none focus:outline-none font-bold py-3 w-full px-9"
            >
              Login
            </button>
          </form>
          <p className="text-xs">
            Don't have an account?{" "}
            <Link className="text-sky-500 underline" to={"/register"}>
              Register
            </Link>
          </p>
          {error && <p className="text-pink-500 text-xs">{error}</p>}
        </div>
        <div className="bg-sky-400 hidden md:flex justify-center items-center p-8 w-full md:w-1/2">
          <img
            src={loginSvg}
            alt="Login illustration"
            className="w-3/4 max-w-xs"
          />
        </div>
      </div>
    </Motion.div>
  );
};

export default LoginPage;
