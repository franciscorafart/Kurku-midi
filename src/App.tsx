import { useEffect, useCallback, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import SomaUI from "./components/SomaUI";
import { RecoilRoot, useRecoilState, useSetRecoilState } from "recoil";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import NewVersionModal from "./components/NewVersionModal";
import ADI, { initializeADI } from "./localDB";
import { User } from "context";
import account from "./atoms/account";
import { SubscriptionActiveResponse } from "./components/shared";
import { apiUrl } from "./constants";
import MobileWarning from "./components/MobileWarning";
import ResetPassword from "./pages/ResetPassword";
import ConfirmEmail from "./pages/ConfirmEmail";
import initializedADI from "./atoms/initializedADI";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UIInitializer />}></Route>
          <Route path="/reset-password" element={<ResetPassword />}></Route>
          <Route path="/confirm-user" element={<ConfirmEmail />}></Route>
          <Route
            path="subscription-success"
            element={<SubscriptionSuccess />}
          />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;

const UIInitializer = () => {
  const setInitialized = useSetRecoilState(initializedADI);
  const [waitingWorker, setWaitingWorker] = useState<any>(null);
  const [newVersion, setNewVersion] = useState(false);
  const [userAccount, setUserAccount] = useRecoilState(account);

  const now = new Date();
  const expiry = useMemo(() => new Date(userAccount.dateExpiry), [userAccount]);

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
          const res = await fetch(`${apiUrl}/transactions/subscriptionActive`, {
            method: "GET",
            cache: "no-cache",
            headers: {
              "Content-Type": "application/json",
              Authorization: jwt || "",
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
          });
          const data = (await res.json()) as SubscriptionActiveResponse;

          if (data) {
            setUserAccount({
              ...userAccount,
              dateExpiry: data.expiry,
            });

            localStorage.setItem("expiry", data.expiry); // Reset date

            const now2 = new Date();
            if (new Date(data.expiry) < now2) {
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
            setUserAccount({
              ...userAccount,
              dateExpiry: exp,
            });
          }
        }
      }
    };
    fetchUserData();
  }, [userAccount.userId, setUserAccount]); // Don't user userAccount as dependency or else it goes on a loop

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
      setInitialized(true);
    }
  }, [setInitialized, paidCustomer, connected]);

  return (
    <User.Provider value={paidCustomer}>
      {isMobile ? <MobileWarning /> : <SomaUI />}
      <NewVersionModal open={newVersion} onClose={updateServiceWorker} />
    </User.Provider>
  );
};
