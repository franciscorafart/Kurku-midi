import { useEffect, useCallback, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import SomaUI from "./components/SomaUI";
import { RecoilRoot, useRecoilState } from "recoil";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import NewVersionModal from "./components/NewVersionModal";
import ADI, { initializeADI } from "./localDB";
import { User } from "context";
import account from "./atoms/account";
import { TransactionResponse } from "./components/shared";
import { apiUrl } from "./constants";
import MobileWarning from "./components/MobileWarning";
import ResetPassword from "./pages/ResetPassword";
import ConfirmEmail from "./pages/ConfirmEmail";

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UIInitializer />}></Route>
          <Route path="/reset-password" element={<ResetPassword />}></Route>
          <Route path="/confirm-user" element={<ConfirmEmail />}></Route>
        </Routes>
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

  const connected = Boolean(userAccount.userId);
  const paidCustomer =
    userAccount.userId && userAccount.dateExpiry ? expiry > now : false;

  const onServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
    console.log("Service worker update", registration);
    setWaitingWorker(registration && registration.waiting);
    setNewVersion(true);
  };

  const updateServiceWorker = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    waitingWorker && waitingWorker.postMessage({ type: "SKIP_WAITING" });
    setNewVersion(false);
    window.location.reload();
  }, [waitingWorker]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = userAccount.userId;
      if (userId) {
        // Get encrypted date locally first (key: wallet, value: encrypted date)
        const jwt = localStorage.getItem("kurkuToken");

        try {
          const res = await fetch(`${apiUrl}/transactions/list`, {
            method: "GET",
            cache: "no-cache",
            headers: {
              "Content-Type": "application/json",
              Authorization: jwt || "",
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
          });
          const { data } = (await res.json()) as {
            data: TransactionResponse[];
          };

          // TODO: Do this in the backend and have endpoint return one transaction only
          const latest = data.length
            ? data.sort((t1, t2) =>
                new Date(t1.expiry) > new Date(t2.expiry) ? -1 : 1
              )[0]
            : null;

          if (latest) {
            setUserAccount({
              userId: latest.userId,
              dateExpiry: latest.expiry,
              email: userAccount.email,
            });

            localStorage.setItem("expiry", latest.expiry); // Reset date

            const now2 = new Date();
            if (new Date(latest.expiry) < now2) {
              // If expired, disable offline use
              serviceWorkerRegistration.unregister();
            }
          } else {
            // If no subscription data for user, unregister.
            serviceWorkerRegistration.unregister();
          }
        } catch (e) {
          console.error("Couldn't fetch user account, trying local storage", e);
          const exp = localStorage.getItem("expiry");
          if (exp) {
            // TODO: Decrypt
            setUserAccount({
              userId: userId,
              dateExpiry: exp,
              email: userAccount.email,
            });
          }
        }
      }
    };
    fetchUserData();
  }, [userAccount.userId, setUserAccount]);

  useEffect(() => {
    if (paidCustomer) {
      console.log("Registering Service Worker");
      serviceWorkerRegistration.register({
        onUpdate: onServiceWorkerUpdate,
      });
    }
    if (connected) {
      if (!ADI.isInitialized()) {
        initializeADI();
      }
    }
    setInitialized(true);
  }, [setInitialized, paidCustomer, connected]);

  return (
    <User.Provider value={paidCustomer}>
      {isMobile && <MobileWarning />}
      {!isMobile && initialized && <SomaUI />}
      <NewVersionModal open={newVersion} onClose={updateServiceWorker} />
    </User.Provider>
  );
};
