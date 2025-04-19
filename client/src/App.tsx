import './App.css';
import { Header } from './components/Header';
import { UserProvider } from './components/UserContext';
import { Route, Routes } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';

export default function App() {
  return (
    // <>
    //   {/* <Header /> */}
    //   <RegistrationForm />
    // </>
    <UserProvider>
      <Routes>
        <Route path="/" element={<Header />}>
          <Route
            index
            // path="/auth/sign-up"
            element={<AuthPage mode="sign-up" />}
          />
          <Route path="/auth/sign-in" element={<AuthPage mode="sign-in" />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}
