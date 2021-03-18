import { useContext, useEffect } from "react";
import SocketContext from "../../lib/context/socket";
import { useIdentity } from "../../lib/withIdentity";

export default function Index() {
  const io = useContext(SocketContext);
  const identity = useIdentity();

  if (!identity) return null;

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
