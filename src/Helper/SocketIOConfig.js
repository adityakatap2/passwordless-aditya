import { io } from "socket.io-client";
const socket =io("https://home.passwordless.com.au:3115")
export default socket;