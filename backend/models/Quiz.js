const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['boolean', 'multiple', 'text'], required: true },
  questionText: { type: String, required: true },
  image: { type: String },
  options: [{ type: String }],
  correctAnswers: [{ type: String, required: true }],
  timeLimit: { type: Number, default: 30 },
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [QuestionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Quiz', QuizSchema);
