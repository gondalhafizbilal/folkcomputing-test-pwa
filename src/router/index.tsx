import { createBrowserRouter } from "react-router-dom";
import { Router } from "@remix-run/router";
import Login from "../views/login";
import { MainLayout } from "../layout";
import Onboarding from "../views/onboarding";
import Register from "../views/register";
import Chat from "../views/chat";
import * as firebase from "firebase/app";
import "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// import { MainLayout } from "@/layout";
// import Login from "@/views/login";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "folkcomp-aaf21.firebaseapp.com",
  projectId: "folkcomp-aaf21",
  storageBucket: "folkcomp-aaf21.appspot.com",
  messagingSenderId: "625115239958",
  appId: "1:625115239958:web:9774addb985c6f23ca8737",
  measurementId: "G-YN18F9TC7K",
};
const app = firebase.initializeApp(firebaseConfig);

const auth = getAuth(app);
const store = getFirestore(app);

const router: Router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Onboarding />,
      },
      {
        path: "login",
        element: <Login app={app} auth={auth} />,
      },
      {
        path: "register",
        element: <Register app={app} auth={auth} />,
      },
      {
        path: "chat",
        element: <Chat store={store} />,
      },
    ],
  },
]);

export default router;
