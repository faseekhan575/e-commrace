import axios from "axios";
 
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://e-commarce-v3jf.onrender.com";
 
export default axios;