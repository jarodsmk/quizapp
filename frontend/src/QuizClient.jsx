import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWebSocket from './useWebSocket';
export default function QuizClient() {
  const { roomId } = useParams();
  const username = localStorage.getItem('username');
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const { sendMessage, lastMessage, status: wsStatus } = useWebSocket(`${protocol}//${window.location.host}/ws`);
  const [status, setStatus] = useState('JOINING');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'JOINED': setStatus('LOBBY'); break;
        case 'REJOINED':
            setStatus(lastMessage.status === 'LOBBY' ? 'LOBBY' : (lastMessage.status === 'IN_PROGRESS' ? 'QUESTION' : lastMessage.status));
            setScore(lastMessage.score);
            if (lastMessage.question) setQuestion(lastMessage.question);
            break;
        case 'NEW_QUESTION': setQuestion(lastMessage.question); setStatus('QUESTION'); setAnswer(''); setIsCorrect(null); break;
        case 'ANSWER_RECEIVED':
            setIsCorrect(lastMessage.isCorrect);
            if (lastMessage.score !== undefined) setScore(lastMessage.score);
            setStatus('ANSWERED');
            break;
        case 'QUESTION_ENDED': setStatus('ENDED'); break;
        case 'QUIZ_FINISHED': setStatus('FINISHED'); break;
        case 'ERROR': alert(lastMessage.message); break;
      }
    }
  }, [lastMessage]);
  useEffect(() => {
    if (wsStatus === 'connected' && username) {
        sendMessage({ type: 'REJOIN', roomId, username });
    }
  }, [wsStatus, sendMessage, roomId, username]);
  const submitAnswer = (val) => { setAnswer(val); sendMessage({ type: 'SUBMIT_ANSWER', roomId, username, answer: val }); };
  if (status === 'JOINING') return <div className="p-8 text-center">Connecting...</div>;
  if (status === 'LOBBY') return <div className="min-h-screen flex flex-col items-center justify-center bg-purple-600 text-white"><h1 className="text-3xl font-bold mb-4">You're in!</h1><div className="font-mono text-2xl">{username}</div></div>;
  if (status === 'QUESTION' && question) return (
    <div className="min-h-screen flex flex-col bg-gray-100">
        <div className="bg-white p-4 flex justify-between font-bold"><span>{username}</span><span className="bg-purple-600 text-white px-3 py-1 rounded-full">{score}</span></div>
        <div className="p-4 flex-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-center">{question.questionText}</h2>
            {question.image && <img src={question.image} className="max-h-48 mx-auto mb-4" />}
            <div className="grid grid-cols-1 gap-3 mt-auto">
                {(question.type === 'multiple' ? question.options : (question.type === 'boolean' ? ['True', 'False'] : [])).map(opt => (
                    <button key={opt} onClick={() => submitAnswer(opt)} className="bg-white border-2 p-6 rounded-xl text-xl font-bold">{opt}</button>
                ))}
                {question.type === 'text' && <><input type="text" className="p-4 border-2 rounded-xl text-xl" value={answer} onChange={(e) => setAnswer(e.target.value)} /><button onClick={() => submitAnswer(answer)} className="bg-purple-600 text-white p-4 rounded-xl text-xl font-bold">Submit</button></>}
            </div>
        </div>
    </div>
  );
  if (status === 'ANSWERED') return <div className={`min-h-screen flex flex-col items-center justify-center text-white ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}><h1 className="text-4xl font-bold">{isCorrect ? 'CORRECT!' : 'WRONG'}</h1></div>;
  if (status === 'ENDED') return <div className="min-h-screen flex flex-col items-center justify-center bg-blue-500 text-white"><h1 className="text-4xl font-bold">Question Ended</h1></div>;
  if (status === 'FINISHED') return <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-500 text-white"><h1 className="text-4xl font-bold">Quiz Finished!</h1><p className="text-2xl">Score: {score}</p><button onClick={() => navigate('/')} className="mt-8 bg-white text-yellow-600 px-6 py-2 rounded-full font-bold">Close</button></div>;
  return null;
}
