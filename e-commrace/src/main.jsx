import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import store from "./store/store";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: "4px", fontFamily: "Satoshi, sans-serif", fontSize: "14px" },
            success: { style: { background: "#141410", color: "#fff", border: "1px solid #3c3c30" } },
            error: { style: { background: "#141410", color: "#ef4444", border: "1px solid #dc2626" } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);