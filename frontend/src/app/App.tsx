import { AppProviders } from "./provider";
import { AppRouter } from "./router";

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;