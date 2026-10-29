import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
});

/**
 * Uploads a resume file (PDF, DOCX, TXT) to the backend for ATS auditing
 * @param {File} file 
 * @returns {Promise<Object>} Backend response with ATS analysis
 */
export async function scanResumeFile(file) {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await api.post('/api/ats/scan', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
}

/**
 * Submits raw plain text resume content for ATS auditing
 * @param {string} resumeText 
 * @returns {Promise<Object>} Backend response with ATS analysis
 */
export async function scanResumeText(resumeText) {
    const response = await api.post('/api/ats/scan', { resumeText });
    return response.data;
}


/**
 * Sends a resume file and job description (text or file) for Gemini-powered
 * match analysis.
 *
 * @param {File}   resumeFile          - The candidate's resume file
 * @param {'text'|'file'} jdMode       - Whether the JD is pasted text or a file
 * @param {string} [jdText]            - Pasted job description text (jdMode === 'text')
 * @param {File}   [jdFile]            - Uploaded JD file (jdMode === 'file')
 * @returns {Promise<Object>} Backend response with match analysis
 */
export async function analyzeResumeMatch(resumeFile, jdMode, jdText, jdFile) {
    const formData = new FormData();
    formData.append('resume', resumeFile);

    if (jdMode === 'file' && jdFile) {
        formData.append('jobDescription', jdFile);
    } else {
        formData.append('jobDescriptionText', jdText);
    }

    const response = await api.post('/api/match/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

/**
 * Starts a mock interview session — uploads resume + JD and returns AI-generated questions.
 *
 * @param {File}   resumeFile     - Candidate's resume
 * @param {'text'|'file'} jdMode  - JD input mode
 * @param {string} [jdText]       - Pasted JD text
 * @param {File}   [jdFile]       - Uploaded JD file
 * @param {Object} settings       - { interviewType, difficulty, questionCount, companyName }
 * @returns {Promise<Object>} Backend response with questions[]
 */
export async function startInterviewSession(resumeFile, jdMode, jdText, jdFile, settings) {
    const formData = new FormData();
    formData.append('resume', resumeFile);

    if (jdMode === 'file' && jdFile) {
        formData.append('jobDescription', jdFile);
    } else {
        formData.append('jobDescriptionText', jdText);
    }

    formData.append('interviewType',  settings.interviewType);
    formData.append('difficulty',     settings.difficulty);
    formData.append('questionCount',  String(settings.questionCount));
    formData.append('companyName',    settings.companyName || '');

    const response = await api.post('/api/interview/start', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

/**
 * Evaluates a single interview answer with Gemini.
 *
 * @param {string} question     - The question that was asked
 * @param {string} answer       - The candidate's answer
 * @param {string} questionType - "technical" | "behavioral" | "hr"
 * @param {string} difficulty   - "entry" | "mid" | "senior"
 * @returns {Promise<Object>} Backend response with score, grade, feedback, modelAnswer
 */
export async function evaluateInterviewAnswer(question, answer, questionType, difficulty) {
    const response = await api.post('/api/interview/evaluate', {
        question,
        answer,
        questionType,
        difficulty,
    });
    return response.data;
}

export default {
    scanResumeFile,
    scanResumeText,
    analyzeResumeMatch,
    startInterviewSession,
    evaluateInterviewAnswer,
};
