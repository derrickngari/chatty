import { useContext} from 'react'
import { AuthContext } from '../context/authContext'
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';


const ProfilePage = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate();

  return (
    <div className='h-screen w-full flex flex-col items-center bg-neutral-900 relative '>
        <div className='absolute z-10 text-gray-600  top-3 left-4 rounded-full p-2 hover:bg-gray-600 flex items-center justify-center' onClick={() => navigate('/')}>
          <ChevronLeftIcon className="size-6 text-gray-300 cursor-pointer"/>
        </div>
      <div className="max-w-sm flex flex-col justify-center items-center min-h[80vh] mx-auto p-4 rounded-lg  mt-10">
                <img
                  src={user.profileImage}
                  alt="Profile Preview"
                  className="h-24 w-24 rounded-full border-2 border-sky-400 object-cover mb-3"
                />
          <h2 className="text-2xl text-gray-300 font-bold">{user.username}</h2>
          
          <form
            className="flex flex-col space-y-3 mt-4"
          >
            <input
              className="border-1 border-sky-400 mb-6 py-3 w-full px-9 rounded-md text-gray-400"
              type="text"
              placeholder="Username"
              defaultValue={user.fullName}
            />
            <input
              className="border-1 border-sky-400 mb-6 py-3 w-full px-9 rounded-md text-gray-400"
              type="text"
              placeholder="Username"
              defaultValue={user.email}
            />
            <input
              className="border-1 border-sky-400 mb-6 py-3 w-full px-9 rounded-md text-gray-400"
              placeholder="Bio"
              defaultValue={user.bio}
            />
            <input
              className="border-1 border-sky-400 mb-6 py-3 w-full px-9 rounded-md text-gray-400"
              type="text"
              placeholder="Location"
              defaultValue={user.location}
            />
            <p className='text-1xl text-gray-300'>Joined:  <span className='text-gray-500 text-sm'>{new Date(user.createdAt).toDateString()} {new Date(user.createdAt).toLocaleTimeString()}</span></p>
  

            <button
              className="border-1 border-sky-400 mb-3 rounded-md bg-sky-800 text-sky-500 outline-none focus:outline-none font-bold py-3 w-full px-9"
              type="submit"
            >
              Update Profile
            </button>
            {/* {error && <p className="text-red-600">{error}</p>} */}
          </form>
      </div>
    </div>
  )
}

export default ProfilePage