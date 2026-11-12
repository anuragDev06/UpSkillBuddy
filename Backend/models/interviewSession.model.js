const mongoose = require('mongoose');

const questionItemSchema = new mongoose.Schema({
    id: { type: Number },
    question: { type: String, required: true },
    type: { type: String, default: 'technical' },
    difficulty: { type: String, default: 'mid' },
    hint: { type: String, default: '' },
    userAnswer: { type: String, default: '' },
    evaluation: {
        score: { type: Number },
        grade: { type: String },
        feedback: { type: String },
        strengths: [String],
        improvements: [String],
        modelAnswer: { type: String },
    },
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        default: 'Mock Interview',
    },
    companyName: {
        type: String,
        default: '',
    },
    interviewType: {
        type: String,
        enum: ['technical', 'behavioral', 'hr', 'mixed'],
        default: 'technical',
    },
    difficulty: {
        type: String,
        enum: ['entry', 'mid', 'senior'],
        default: 'mid',
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    currentIndex: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'in-progress',
        index: true,
    },
    questions: [questionItemSchema],
    overallScore: {
        type: Number,
        default: null,
    },
    lastActiveAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

module.exports = InterviewSession;
