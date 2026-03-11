import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import './index.css';
import App from "./App";
import { store } from "./store/store";

const mountedApp = createRoot(document.getElementById('root')!);
mountedApp.render(
    <Provider store={store}>
        <App />
    </Provider>
);