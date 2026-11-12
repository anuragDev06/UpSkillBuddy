const mongoose = require('mongoose');

const resumeScanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    fileName: {
        type: String,
        required: true,
        default: 'Uploaded_Resume.pdf',
    },
    fileSize: {
        type: Number,
        default: 0,
    },
    atsScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    status: {
        type: String,
        default: 'Average',
    },
    summary: {
        type: String,
        default: '',
    },
    breakdown: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    skillsFound: {
        technical: [String],
        soft: [String],
    },
    strengths: [String],
    improvements: [String],
}, {
    timestamps: true,
});

const ResumeScan = mongoose.model('ResumeScan', resumeScanSchema);

module.exports = ResumeScan;
