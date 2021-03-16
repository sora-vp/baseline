import { useContext, useEffect } from "react";
import SocketContext from "../../context/socket";

export default function Index() {
  const io = useContext(SocketContext);

  useEffect(() => {
    const connect = () => {
      console.log("connect");
    };
    const disconnect = () => {
      console.log("disconnect");
    };
    const newUser = (data) => {
      console.log(data);
    };

    io.on("connect", connect);
    io.on("disconnect", disconnect);
    io.on("admin:new user", newUser);

    return () => {
      io.off("connect", connect);
      io.off("disconnect", disconnect);
      io.off("admin:new user", newUser);
    };
  }, []);

  return <></>;
}
