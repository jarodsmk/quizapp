import { useState, useEffect, useCallback } from 'react';
export default function useWebSocket(url) {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('connecting');
  useEffect(() => {
    const socket = new WebSocket(url);
    socket.onopen = () => setStatus('connected');
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };
    socket.onclose = () => setStatus('disconnected');
    setWs(socket);
    return () => socket.close();
  }, [url]);

  const sendMessage = useCallback((data) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, [ws]);
  return { sendMessage, messages, status, lastMessage: messages[messages.length - 1] };
}
