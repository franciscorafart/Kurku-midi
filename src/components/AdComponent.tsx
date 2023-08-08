import { useEffect, useContext, useRef, useState } from "react";
import { User } from "context";

const Ad = () => {
  const isPaidUser = useContext(User);
  const adRef = useRef<HTMLElement | null>(null);
  const adScriptRef = useRef<HTMLScriptElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");

    script.src = "//ophoacit.com/1?z=5884602";
    script.async = true;
    script.id = "adScript";
    document.head.appendChild(script);
    adScriptRef.current = script;

    script.onload = () => {
      // The script has loaded, so start observing for the dynamic element
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          // Check if the dynamic element has been added to the DOM
          if (mutation.type === "childList") {
            const dynamicElement = document.getElementById("p_5884602");

            if (dynamicElement) {
              adRef.current = dynamicElement;
              setAdLoaded(true);
              // Stop observing once the element is found
              observer.disconnect();
            }
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    };

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (adLoaded && isPaidUser) {
      adRef?.current?.remove();
      adScriptRef?.current?.remove();
    }
  }, [adLoaded, isPaidUser]);

  return <div></div>;
};

export default Ad;
