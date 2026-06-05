import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import useWebSocket from './useWebSocket';
export default function AdminSession() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get('quizId');
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const { sendMessage, lastMessage, status: wsStatus } = useWebSocket(`${protocol}//${window.location.host}/ws`);
  const [status, setStatus] = useState('LOBBY');
  const [participants, setParticipants] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [podium, setPodium] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'ROOM_CREATED':
            if (lastMessage.status) setStatus(lastMessage.status);
            if (lastMessage.participants) setParticipants(lastMessage.participants);
            break;
        case 'PARTICIPANT_LIST': setParticipants(lastMessage.participants); break;
        case 'NEW_QUESTION': setCurrentQuestion(lastMessage.question); setStatus('QUESTION'); setTimeLeft(lastMessage.question.timeLimit); break;
        case 'QUESTION_ENDED': setStatus('REVEALED'); setLeaderboard(lastMessage.leaderboard); break;
        case 'QUIZ_FINISHED': setStatus('FINISHED'); setPodium(lastMessage.podium); break;
      }
    }
  }, [lastMessage]);
  useEffect(() => {
    let t; if (status === 'QUESTION' && timeLeft > 0) t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [status, timeLeft]);
  useEffect(() => {
    if (wsStatus === 'connected' && quizId) {
        sendMessage({ type: 'CREATE_ROOM', roomId, quizId });
    }
  }, [wsStatus, sendMessage, roomId, quizId]);
  if (status === 'LOBBY') return (
    <div className="min-h-screen bg-purple-700 text-white p-8 flex flex-col items-center">
      <h1 className="text-5xl font-black mb-8 italic uppercase">Join the Quiz!</h1>
      <div className="flex gap-12 items-center bg-white p-12 rounded-3xl text-black">
        <div className="text-center"><p className="text-2xl font-bold">Go to {window.location.host}/join</p><p className="text-6xl font-black">{roomId}</p></div>
        <QRCodeSVG value={`${window.location.origin}/join?room=${roomId}`} size={200} />
      </div>
      <div className="mt-12 w-full max-w-4xl"><div className="flex justify-between items-end mb-4"><h2 className="text-3xl font-bold">{participants.length} Joined</h2><button onClick={() => sendMessage({ type: 'START_QUIZ', roomId })} className="bg-white text-purple-700 px-12 py-4 rounded-full text-3xl font-black">START</button></div><div className="grid grid-cols-4 gap-4">{participants.map((p, i) => (<div key={i} className="bg-purple-600 p-4 rounded text-center">{p}</div>))}</div></div>
    </div>
  );
  if (status === 'QUESTION' && currentQuestion) return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col">
        <div className="flex justify-between"><div className="bg-purple-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black">{timeLeft}</div><h1 className="text-4xl font-bold flex-1 text-center">{currentQuestion.questionText}</h1></div>
        {currentQuestion.image && <img src={currentQuestion.image} className="max-h-[50vh] mx-auto mt-8 rounded shadow" />}
        <div className="grid grid-cols-2 gap-6 mt-auto">{(currentQuestion.type === 'multiple' ? currentQuestion.options : (currentQuestion.type === 'boolean' ? ['True', 'False'] : [])).map((o, i) => (<div key={i} className={`p-8 rounded text-3xl font-bold text-white ${['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'][i % 4]}`}>{o}</div>))}</div>
    </div>
  );
  if (status === 'REVEALED') return (
    <div className="min-h-screen bg-purple-700 text-white p-8 flex flex-col">
        <div className="flex justify-between items-center mb-8"><h1 className="text-4xl font-bold">Leaderboard</h1><button onClick={() => sendMessage({ type: 'NEXT_QUESTION', roomId })} className="bg-white text-purple-700 px-8 py-3 rounded-full font-bold">Next</button></div>
        <div className="max-w-xl mx-auto w-full space-y-4">{leaderboard.slice(0, 5).map((e, i) => (<div key={i} className="bg-purple-600 p-6 rounded flex justify-between text-2xl font-bold"><span>{e.username}</span><span>{e.score}</span></div>))}</div>
    </div>
  );
  if (status === 'FINISHED') return (
    <div className="min-h-screen bg-purple-900 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-6xl font-black mb-16 uppercase text-yellow-400 italic">Podium</h1>
        <div className="flex items-end gap-8 h-80">
            {podium[1] && <div className="flex flex-col items-center"><div className="text-xl mb-2">{podium[1].username}</div><div className="bg-gray-400 w-32 h-48 rounded-t flex flex-col items-center justify-center text-4xl font-black">2<div className="text-sm font-bold mt-2">{podium[1].score}</div></div></div>}
            {podium[0] && <div className="flex flex-col items-center"><div className="text-2xl mb-2 text-yellow-400 font-bold">{podium[0].username}</div><div className="bg-yellow-500 w-32 h-64 rounded-t flex flex-col items-center justify-center text-6xl font-black">1<div className="text-xl font-bold mt-2">{podium[0].score}</div></div></div>}
            {podium[2] && <div className="flex flex-col items-center"><div className="text-lg mb-2">{podium[2].username}</div><div className="bg-orange-700 w-32 h-32 rounded-t flex flex-col items-center justify-center text-2xl font-black">3<div className="text-sm font-bold mt-2">{podium[2].score}</div></div></div>}
        </div>
        <button onClick={() => window.location.href = '/admin'} className="mt-16 bg-white text-purple-900 px-8 py-3 rounded-full font-bold">Return</button>
    </div>
  );
  return null;
}
