import { io } from "socket.io-client";

const initSocket = async() =>{
  const options = {
    forceNew: true,
    reconnectionAttempts: Infinity,
    timeout: 10000,
    transports: ["websocket"],
  };

  console.log("Connecting to:", import.meta.env.VITE_APP_BACKEND_URL);

  return io(import.meta.env.VITE_APP_BACKEND_URL, options);
};

export { initSocket };
