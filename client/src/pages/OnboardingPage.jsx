import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import onBoardingSvg from "../assets/onboard.svg";
import { motion as Motion } from "framer-motion";

const Onboarding = () => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleOnboard = async (e) => {
    e.preventDefault();

    if (!username || !bio || !location || !profileImage) {
      return setError("All fields are required");
    }

    // Convert image file to base64 if not already
    let base64Image = imagePreview;
    if (!base64Image && profileImage) {
      const reader = new FileReader();
      reader.readAsDataURL(profileImage);
      reader.onloadend = async () => {
        base64Image = reader.result;
        await submitOnboarding(base64Image);
      };
      return;
    }
    await submitOnboarding(base64Image);
  };

  const submitOnboarding = async (base64Image) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/onboarding`,
        {
          username,
          bio,
          location,
          profileImage: base64Image,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result)
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-h-screen  flex flex-col md:flex-row justify-between bg-neutral-800 text-gray-100">
        <div className="max-w-sm flex flex-col justify-center items-center min-h[80vh] mx-auto p-4 rounded-lg  mt-10">
          {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="h-24 w-24 rounded-full border-2 border-sky-400 object-cover mb-3"
                />
              )}
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
          
          <form
            onSubmit={handleOnboard}
            className="flex flex-col space-y-3 mt-4"
          >
            <input
              className="border-1 border-sky-400 mb-6 py-3 w-full px-9 rounded-md text-gray-400"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <textarea
              className="border-1 border-sky-400 mb-6 py-3 w-full px-9 rounded-md text-gray-400"
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <input
              className="border-1 border-sky-400 mb-6 py-3 w-full px-9 rounded-md text-gray-400"
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <div className="flex flex-col items-center space-y-2">
              <input
                className="border-1 border-sky-400 mb-6 py-3 w-full px-9 rounded-md text-gray-400"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              
            </div>

            <button
              className="border-1 border-sky-400 mb-3 rounded-md bg-sky-800 text-sky-500 outline-none focus:outline-none font-bold py-3 w-full px-9"
              type="submit"
            >
              Complete Onboarding
            </button>
            {error && <p className="text-red-600">{error}</p>}
          </form>
        </div>
        <div className="bg-sky-400 flex justify-center items-center p-8 w-full md:w-1/2">
          <img
            src={onBoardingSvg}
            alt="Login illustration"
            className="w-3/4 max-w-xs"
          />
        </div>
      </div>
    </Motion.div>
  );
};

export default Onboarding;
