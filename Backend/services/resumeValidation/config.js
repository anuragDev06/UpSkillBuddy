/**
 * Production-Grade Resume Validation Configuration
 * Centralized thresholds, scoring weights, and detection dictionaries.
 */

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const RESUME_VALIDATION_CONFIG = {
    maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
    minWordCount: 40,
    minCharCount: 150,
    minLexicalDiversity: 0.22, // uniqueWords / totalWords
    maxUnreadableRatio: 0.30,

    // Classification scoring weights (Total = 100)
    weights: {
        contact: 10,
        education: 20,
        experience: 20,
        projects: 20,
        skills: 15,
        summary: 10,
        certifications: 5,
    },

    // Classification confidence thresholds
    thresholds: {
        valid: 65,      // >= 65 and passes profile constraints -> VALID
        uncertain: 35,  // 35 - 64 -> UNCERTAIN (invokes secondary Gemini classifier)
                        // < 35 -> INVALID
        geminiConfidenceMin: 0.70, // Minimum confidence from Gemini to accept
    },

    allowedExtensions: ['pdf', 'docx', 'txt'],
    allowedMimeTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
    ],

    // Known section headings and aliases
    headings: {
        summary: [
            'summary', 'professional summary', 'career summary', 'profile', 'personal profile',
            'about me', 'career objective', 'objective', 'executive summary'
        ],
        experience: [
            'experience', 'work experience', 'employment history', 'professional experience',
            'work history', 'internship', 'internships', 'experience & achievements', 'career history'
        ],
        education: [
            'education', 'academic background', 'educational qualifications', 'academics',
            'qualifications', 'education & training', 'academic profile', 'academic details'
        ],
        skills: [
            'skills', 'technical skills', 'core competencies', 'competencies', 'technologies',
            'tech stack', 'technical proficiencies', 'areas of expertise', 'key skills', 'tools & technologies'
        ],
        projects: [
            'projects', 'personal projects', 'key projects', 'selected projects',
            'academic projects', 'project work', 'technical projects', 'featured projects'
        ],
        certifications: [
            'certifications', 'certificates', 'licenses & certifications', 'credentials',
            'courses & certifications', 'professional certifications', 'accreditations'
        ],
    },
};

module.exports = RESUME_VALIDATION_CONFIG;
