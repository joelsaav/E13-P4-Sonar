/**
 * @file main.tsx
 * @description Punto de entrada principal de la aplicación React.
 * Configura el enrutador del navegador, Redux Provider y renderiza el componente App.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import App from "./App";
import "./styles/index.css";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
