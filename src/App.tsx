import { useEffect, useMemo, useState } from "react";
import SomaUI from "./components/SomaUI";
import { RecoilRoot, useRecoilState } from "recoil";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import NewVersionModal from "./components/NewVersionModal";
import ADI, { initializeADI } from "./localDB";
import { User } from "context";
import { MetaMaskProvider } from "metamask-react";
import account from "./atoms/account";
import { TransactionResponse } from "./components/shared";
import { apiUrl } from "./constants";

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <MetaMaskProvider>
          <Routes>
            <Route path="/" element={<UIInitializer />}></Route>
          </Routes>
        </MetaMaskProvider>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;

const UIInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<any>(null);
  const [newVersion, setNewVersion] = useState(false);
  const [userAccount, setUserAccount] = useRecoilState(account);

  const now = new Date();
  const expiry = useMemo(() => new Date(userAccount.dateExpiry), [userAccount]);
  // TODO: Decrypt
  const paidCustomer =
    userAccount.walletAddress && userAccount.dateExpiry ? expiry > now : false;

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
    const fetchUserData = async () => {
      const walletAddress =
        userAccount.walletAddress || localStorage.getItem("walletId");

      if (walletAddress) {
        // Get encrypted date locally first (key: wallet, value: encrypted date)
        try {
          const res = await fetch(`${apiUrl}/getTransactions`, {
            method: "POST",
            cache: "no-cache",
            headers: {
              "Content-Type": "application/json",
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify({
              walletId: walletAddress,
            }),
          });
          const { data } = (await res.json()) as {
            data: TransactionResponse[];
          };
          const latest = data.length
            ? data.sort((t1, t2) =>
                new Date(t1.expiry) > new Date(t2.expiry) ? -1 : 1
              )[0]
            : null;

          if (latest) {
            setUserAccount({
              walletAddress: latest.walletId,
              dateExpiry: latest.expiry,
            });

            localStorage.setItem("expiry", latest.expiry); // Reset ls date

            const now2 = new Date();
            if (new Date(latest.expiry) < now2) {
              // If expired, disable offline use
              console.log("unregister 1");
              serviceWorkerRegistration.unregister();
            }
          } else {
            // If no subscription data for user, unregister.
            console.log("unregister 2");
            serviceWorkerRegistration.unregister();
          }
        } catch (e) {
          console.error("Couldn't fetch user account, trying local storage", e);
          const exp = localStorage.getItem("expiry");
          if (exp) {
            // TODO: Decrypt
            setUserAccount({
              walletAddress: walletAddress,
              dateExpiry: exp,
            });
          }
        }
      }
    };
    fetchUserData();
  }, [userAccount.walletAddress, setUserAccount]);

  useEffect(() => {
    if (paidCustomer) {
      console.log("Registering Service Worker");
      serviceWorkerRegistration.register({
        onUpdate: onServiceWorkerUpdate,
      });

      if (!ADI.isInitialized()) {
        initializeADI();
      }
      setInitialized(true);
    }
  }, [setInitialized, paidCustomer]);

  return (
    <User.Provider value={paidCustomer}>
      {initialized && <SomaUI />}
      <NewVersionModal open={newVersion} onClose={updateServiceWorker} />
    </User.Provider>
  );
};
