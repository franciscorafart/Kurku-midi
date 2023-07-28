import { useEffect, useContext } from "react";
import { User } from "context";

const Ad = () => {
  const isPaidUser = useContext(User);

  useEffect(() => {
    if (!isPaidUser) {
      const script = document.createElement("script");

      script.src = "//ophoacit.com/1?z=5884602";
      script.async = true;
      script.id = "adScript";
      document.head.appendChild(script);
    } else {
      // Find ad and remove ad and script
      const ad = document.getElementById("p_5884602");
      const adScript = document.getElementById("adScript");

      if (ad) {
        ad.remove();
      }
      if (adScript) {
        adScript.remove();
      }
    }
  }, [isPaidUser]);

  return <div></div>;
};

export default Ad;
