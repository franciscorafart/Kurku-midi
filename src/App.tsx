import { useEffect, useState } from "react";
import SomaUI from "./components/SomaUI";
import { RecoilRoot } from "recoil";
import "bootstrap/dist/css/bootstrap.min.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import NewVersionModal from "./components/NewVersionModal";
import ADI, { initializeADI } from "./localDB";
import { User } from "context";

export const PAID_CUSTOMER = true;

function App() {
  const [waitingWorker, setWaitingWorker] = useState<any>(null);
  const [newVersion, setNewVersion] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const onServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
    setWaitingWorker(registration && registration.waiting);
    setNewVersion(true);
  };

  const updateServiceWorker = () => {
    // eslint-disable-next-line no-unused-expressions
    waitingWorker && waitingWorker.postMessage({ type: "SKIP_WAITING" });
    setNewVersion(false);
    window.location.reload();
  };

  useEffect(() => {
    if (PAID_CUSTOMER) {
      console.log("Register Service Worker");
      serviceWorkerRegistration.register({
        onUpdate: onServiceWorkerUpdate,
      });

      if (!ADI.isInitialized()) {
        initializeADI();
      }
      setInitialized(true);
    } else {
      serviceWorkerRegistration.unregister();
      setInitialized(true);
    }
  }, [setInitialized]);

  return (
    <RecoilRoot>
      <User.Provider value={PAID_CUSTOMER}>
        {initialized && <SomaUI />}
        <NewVersionModal open={newVersion} onClose={updateServiceWorker} />
      </User.Provider>
    </RecoilRoot>
  );
}

export default App;
