import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuiz, createQuiz, updateQuiz, uploadImage } from './api';
import { Plus, Trash2, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
export default function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  useEffect(() => { if (id) fetchQuiz(); }, [id]);
  const fetchQuiz = async () => {
    const { data } = await getQuiz(id);
    setTitle(data.title); setDescription(data.description); setQuestions(data.questions);
  };
  const addQuestion = () => {
    setQuestions([...questions, { type: 'multiple', questionText: '', options: ['', '', '', ''], correctAnswers: [''], timeLimit: 30, image: '' }]);
  };
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions]; newQuestions[index][field] = value; setQuestions(newQuestions);
  };
  const handleImageUpload = async (index, file) => {
    const formData = new FormData(); formData.append('image', file);
    try { const { data } = await uploadImage(formData); updateQuestion(index, 'image', data.imageUrl); } catch (err) { alert('Upload failed'); }
  };
  const handleSave = async () => {
    try { if (id) await updateQuiz(id, { title, description, questions }); else await createQuiz({ title, description, questions }); navigate('/admin'); } catch (err) { alert('Save failed'); }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8"><button onClick={() => navigate('/admin')}><ArrowLeft size={24} /></button><h1 className="text-3xl font-bold">{id ? 'Edit Quiz' : 'Create Quiz'}</h1></div>
        <div className="bg-white p-6 rounded mb-8">
          <div className="mb-4"><label className="block font-semibold">Title</label><input type="text" className="w-full p-2 border rounded" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="mb-4"><label className="block font-semibold">Description</label><textarea className="w-full p-2 border rounded" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <div className="space-y-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white p-6 rounded border-l-4 border-blue-500">
              <div className="flex justify-between mb-4"><h3 className="font-bold">Q{qIndex + 1}</h3><button onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} className="text-red-500"><Trash2 size={20} /></button></div>
              <div className="grid gap-4">
                <div className="flex gap-4">
                    <select className="p-2 border rounded flex-1" value={q.type} onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}>
                        <option value="multiple">Multiple Choice</option><option value="boolean">True/False</option><option value="text">Text Entry</option>
                    </select>
                    <input type="number" className="p-2 border rounded w-24" value={q.timeLimit} onChange={(e) => updateQuestion(qIndex, 'timeLimit', parseInt(e.target.value))} />
                </div>
                <input type="text" className="w-full p-2 border rounded" value={q.questionText} onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)} placeholder="Question" />
                <div><input type="file" onChange={(e) => handleImageUpload(qIndex, e.target.files[0])} />{q.image && <img src={q.image} className="h-20 mt-2" />}</div>
                {q.type === 'multiple' && <div className="grid grid-cols-2 gap-2">{q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex gap-2">
                        <input type="text" className="flex-1 p-2 border rounded" value={opt} onChange={(e) => { const n = [...q.options]; n[oIndex] = e.target.value; updateQuestion(qIndex, 'options', n); }} />
                        <input type="radio" checked={q.correctAnswers[0] === opt} onChange={() => updateQuestion(qIndex, 'correctAnswers', [opt])} />
                    </div>
                ))}</div>}
                {q.type === 'boolean' && <div className="flex gap-4">{['True', 'False'].map(v => <label key={v}><input type="radio" checked={q.correctAnswers[0] === v} onChange={() => updateQuestion(qIndex, 'correctAnswers', [v])} /> {v}</label>)}</div>}
                {q.type === 'text' && <input type="text" className="w-full p-2 border rounded" value={q.correctAnswers.join(',')} onChange={(e) => updateQuestion(qIndex, 'correctAnswers', e.target.value.split(',').map(s => s.trim()))} placeholder="Correct answers (comma separated)" />}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-between"><button onClick={addQuestion} className="bg-blue-100 text-blue-700 px-6 py-2 rounded font-bold">Add Question</button><button onClick={handleSave} className="bg-blue-600 text-white px-8 py-2 rounded font-bold">Save Quiz</button></div>
      </div>
    </div>
  );
}
