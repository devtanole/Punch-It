import './App.css';
import { Header } from './components/Header';
import { UserProvider } from './components/UserContext';
import { Route, Routes } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { PostForm } from './pages/PostForm';
import { PostFeed } from './pages/PostList';

// className = 'block border border-gray-600 rounded p-2 h-8 w-full mb-2';

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Header />}>
          {/* path="/auth/sign-up" */}
          <Route path="/auth/sign-up" element={<AuthPage mode="sign-up" />} />
          <Route path="/auth/sign-in" element={<AuthPage mode="sign-in" />} />
          <Route index element={<PostFeed />} />
          <Route path="details/:postId" element={<PostForm />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}
