// TODO make a reactive model (application state), pass it as prop to the components used
import { createRoot } from "react-dom/client";
import './index.css'
import App from "./App";

const mountedApp = createRoot(document.getElementById('root')!)
mountedApp.render(<App />);