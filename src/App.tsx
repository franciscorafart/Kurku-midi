import { useEffect, useState } from "react";
import SomaUI from "./components/SomaUI";
import { RecoilRoot } from "recoil";
import "bootstrap/dist/css/bootstrap.min.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import NewVersionModal from "./components/NewVersionModal";

const PAID_CUSTOMER = false;

function App() {
  const [waitingWorker, setWaitingWorker] = useState<any>(null);
  const [newVersion, setNewVersion] = useState(false);
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
    } else {
      serviceWorkerRegistration.unregister();
    }
  }, []);
  return (
    <RecoilRoot>
      <SomaUI />
      <NewVersionModal open={newVersion} onClose={updateServiceWorker} />
    </RecoilRoot>
  );
}

export default App;
