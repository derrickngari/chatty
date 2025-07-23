import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../srevices/authServices";
import registerSvg from "../assets/register.svg";
import { AuthContext } from "../context/authContext";
import { motion as Motion } from "framer-motion";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const user = await register(fullName, email, password);
      setUser(user);
      navigate("/onboard");
    } catch (error) {
      setError(error?.message || error.message || "Something went wrong");
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="min-h-screen  flex flex-col md:flex-row-reverse justify-between bg-neutral-800 text-gray-100">
        <div className="max-w-sm flex flex-col justify-center items-center h-screen mx-auto p-4 rounded-lg  mt-10">
          <h2 className="text-3xl font-semibold text-center mb-5">Register</h2>
          <form
            onSubmit={handleRegister}
            className="flex flex-col items-center justify-center"
          >
            <input
              type="text"
              placeholder="Enter Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border-1 border-sky-400 mb-6 py-3 w-full px-9 rounded-md text-gray-400"
            />
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-1 border-sky-400 mb-6 py-3 w-full px-9 rounded-md text-gray-400 "
            />
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-1 border-sky-400 mb-3 rounded-md py-3 w-full px-9 text-gray-400 "
            />
            <button
              type="submit"
              className="border-1 border-sky-400 mb-3 rounded-md bg-sky-800 text-sky-500 outline-none focus:outline-none font-bold py-3 w-full px-9"
            >
              Register
            </button>
          </form>
          <p className="text-xs">
            Already have an account?{" "}
            <Link className="text-sky-500 underline" to={"/login"}>
              login
            </Link>
          </p>
          {error && <p className="text-pink-500 text-xs">{error}</p>}
        </div>
        <div className="bg-sky-400 hidden md:flex justify-center items-center p-8 w-full md:w-1/2">
          <img
            src={registerSvg}
            alt="Login illustration"
            className="w-3/4 max-w-xs"
          />
        </div>
      </div>
    </Motion.div>
  );
};

export default RegisterPage;
