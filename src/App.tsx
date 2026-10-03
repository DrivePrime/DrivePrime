import { BrowserRouter } from "react-router-dom";
import { AppProviders, AppRoutes } from "./AppRoutes";

const App = () => (
  <AppProviders>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  </AppProviders>
);

export default App;
