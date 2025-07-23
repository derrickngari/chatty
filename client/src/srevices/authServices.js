import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export const register = async (fullName, email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, 
        { fullName, email, password },
        { withCredentials: true }
    );
    return res.data;
}

export const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, 
        { email, password },
        { withCredentials: true }
    );
    return res.data;
}

export const logout = async () => {
    const res = await axios.post(`${API_URL}/api/auth/logout`, {},
        { withCredentials: true }
    );
    return res.data;
}