import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
export default function JoinQuiz() {
  const [searchParams] = useSearchParams();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) setRoomId(roomParam.toUpperCase());
  }, [searchParams]);
  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId && username) { localStorage.setItem('username', username); navigate(`/quiz/${roomId.toUpperCase()}`); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-600 p-4">
      <form onSubmit={handleJoin} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-black text-center mb-8 text-purple-800 italic">QuizApp</h1>
        <div className="space-y-4">
          <input type="text" placeholder="GAME PIN" className="w-full p-4 border-2 rounded text-center text-2xl font-bold uppercase" value={roomId} onChange={(e) => setRoomId(e.target.value)} required />
          <input type="text" placeholder="NICKNAME" className="w-full p-4 border-2 rounded text-center text-2xl font-bold" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <button type="submit" className="w-full bg-gray-800 text-white p-4 rounded text-xl font-bold">Enter</button>
        </div>
      </form>
    </div>
  );
}
