import axios from "axios";

const newRequest = axios.create({
  baseURL: "https://api.renewedmindsglobalconsult.com/",
  withCredentials: true,
});

// Interceptor for token expiration
newRequest.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentUser");
        window.location.href = "/login"; // Redirect client-side
      }
    }
    return Promise.reject(err);
  },
);

export default newRequest;
