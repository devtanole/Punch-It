import './App.css';
import { Header } from './components/Header';
import { UserProvider } from './components/UserContext';
import { Route, Routes } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { PostForm } from './pages/PostForm';
import { PostFeed } from './pages/PostList';
import { NotFound } from './NotFound';
import { ProfilePage } from './pages/profile/UserProfile';
import { UserSearchBar } from './pages/Search';
import { FightHistoryForm } from './pages/FightHistoryForm';
import { MessagesInbox } from './pages/MessagesInbox';
import { ConversationThread } from './pages/ConversationThread';
import { LandingPage } from './pages/LandingPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Header />}>
          <Route index element={<LandingPage />} />
          <Route path="/auth/sign-up" element={<AuthPage mode="sign-up" />} />
          <Route path="/auth/sign-in" element={<AuthPage mode="sign-in" />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<PostFeed />} />
            <Route path="details/:postId" element={<PostForm />} />
            <Route path="/fights/:fightId" element={<FightHistoryForm />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/messages" element={<MessagesInbox />} />
            <Route
              path="/messages/:conversationId"
              element={<ConversationThread />}
            />
            <Route path="/search" element={<UserSearchBar />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}
