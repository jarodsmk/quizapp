import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getQuizzes, deleteQuiz } from './api';
import { Plus, Play, Edit, Trash2, LogOut } from 'lucide-react';
export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();
  useEffect(() => { fetchQuizzes(); }, []);
  const fetchQuizzes = async () => {
    try { const { data } = await getQuizzes(); setQuizzes(data); } catch (err) { navigate('/login'); }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) { await deleteQuiz(id); fetchQuizzes(); }
  };
  const startQuiz = (quizId) => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      navigate(`/admin/session/${roomId}?quizId=${quizId}`);
  };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link to="/admin/quiz/new" className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={20} /> Create Quiz</Link>
            <button onClick={() => { localStorage.removeItem('adminToken'); navigate('/login'); }} className="bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"><LogOut size={20} /> Logout</button>
          </div>
        </div>
        <div className="grid gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white p-6 rounded shadow-sm flex justify-between items-center">
              <div><h2 className="text-xl font-semibold">{quiz.title}</h2><p className="text-gray-600">{quiz.questions.length} Questions</p></div>
              <div className="flex gap-3">
                <button onClick={() => startQuiz(quiz._id)} className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1"><Play size={18} /> Start</button>
                <Link to={`/admin/quiz/edit/${quiz._id}`} className="bg-yellow-500 text-white px-3 py-2 rounded flex items-center gap-1"><Edit size={18} /> Edit</Link>
                <button onClick={() => handleDelete(quiz._id)} className="bg-red-600 text-white px-3 py-2 rounded flex items-center gap-1"><Trash2 size={18} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
