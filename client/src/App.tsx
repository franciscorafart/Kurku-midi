import { useEffect, useState } from "react";
import SomaUI from "./components/SomaUI";
import { RecoilRoot, useRecoilValue } from "recoil";
import "bootstrap/dist/css/bootstrap.min.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import NewVersionModal from "./components/NewVersionModal";
import ADI, { initializeADI } from "./localDB";
import { User } from "context";
import { MetaMaskProvider } from "metamask-react";
import account from "./atoms/account";

function App() {
  return (
    <RecoilRoot>
      <MetaMaskProvider>
        <UIInitializer />
      </MetaMaskProvider>
    </RecoilRoot>
  );
}

export default App;

const UIInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<any>(null);
  const [newVersion, setNewVersion] = useState(false);
  const userAccount = useRecoilValue(account);
  const now = new Date();
  const expiry = new Date(userAccount.dateExpiry);
  // TODO: Decrypt
  const paidCustomer =
    userAccount.walletAddress && userAccount.dateExpiry ? expiry < now : false;

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
    if (paidCustomer) {
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
  }, [setInitialized, paidCustomer]);
  console.log("paidCustomer", paidCustomer);
  return (
    <User.Provider value={paidCustomer}>
      {initialized && <SomaUI />}
      <NewVersionModal open={newVersion} onClose={updateServiceWorker} />
    </User.Provider>
  );
};
