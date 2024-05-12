import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { useEffect, useState } from "react";
import { Button } from "./components";

import "firebase/firestore";

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // setShowModal(true);
    });
  }, []);

  const handleInstall = () => {
    // setShowModal(false);
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      setDeferredPrompt(null);
    });
  };

  // const handleCancel = () => {
  //   setShowModal(false);
  // };

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(
          function (registration) {
            console.log(
              "ServiceWorker registration successful with scope: ",
              registration.scope
            );
          },
          function (err) {
            console.log("🚀 ~ServiceWorker registration failed: ", err);
          }
        )
        .catch(function (err) {
          console.log("🚀 ~ error:", err);
        });
    });
  } else {
    console.log("🚀 ~Service workers are not supported.");
  }

  return (
    <>
      <div className="flex justify-center">
        <Button type="button" className="mt-10" onClick={handleInstall}>
          Download as PWA
        </Button>
      </div>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
