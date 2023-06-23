'use-strict'

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SplashScreen from './splashscreen';
import MainScreen from './main';
import CEVResult from './result';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/scan" element={<MainScreen />} />
        <Route path="/result" element={<CEVResult />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;