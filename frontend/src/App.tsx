import './styles/App.css';
import AppHeader from './components/AppHeader';
import AppBody from "./components/AppBody";
import AppFooter from "./components/AppFooter";

function App() {
  return (
    <div className="App">
        <AppHeader />
        <AppBody />
        <AppFooter />
    </div>
  );
}

export default App;
