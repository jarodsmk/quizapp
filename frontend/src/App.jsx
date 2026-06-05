import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import QuizEditor from './QuizEditor';
import AdminSession from './AdminSession';
import JoinQuiz from './JoinQuiz';
import QuizClient from './QuizClient';
const PrivateRoute = ({ children }) => localStorage.getItem('adminToken') ? children : <Navigate to="/login" />;
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/join" />} />
        <Route path="/join" element={<JoinQuiz />} />
        <Route path="/quiz/:roomId" element={<QuizClient />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/quiz/new" element={<PrivateRoute><QuizEditor /></PrivateRoute>} />
        <Route path="/admin/quiz/edit/:id" element={<PrivateRoute><QuizEditor /></PrivateRoute>} />
        <Route path="/admin/session/:roomId" element={<PrivateRoute><AdminSession /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}
export default App;
