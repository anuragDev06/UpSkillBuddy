const request = require('supertest');
const app = require('../src/app');

describe('ATS API Controller Endpoints - Integration Tests', () => {

    describe('POST /api/ats/scan', () => {
        test('should return 400 error when request body is empty and no file is attached', async () => {
            const res = await request(app)
                .post('/api/ats/scan')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Please upload a resume file (PDF, DOCX, TXT) or provide plain text resume content.');
        });

        test('should return 400 error when resumeText is whitespace only', async () => {
            const res = await request(app)
                .post('/api/ats/scan')
                .send({ resumeText: '   ' });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Could not extract text from the provided file');
        });

        test('should successfully scan resume text and return detailed evaluation report', async () => {
            const sampleResumeText = `
            Jane Smith
            Email: jane.smith@example.com | Phone: 555-987-6543
            LinkedIn: linkedin.com/in/janesmith | Portfolio: github.com/janesmith

            Summary
            Frontend Engineer specializing in React, TypeScript, and modern UI design.

            Experience
            Frontend Developer - WebTech (2022 - Present)
            - Developed responsive UI applications using React and Tailwind CSS.
            - Improved web performance metrics by 25% through lazy loading and asset optimization.
            - Built automated testing suites with Jest and React Testing Library.

            Education
            Bachelor of Science in Information Technology

            Skills
            Technical: JavaScript, TypeScript, React, HTML, CSS, Redux, Jest, Git, REST API
            Soft: Problem Solving, Teamwork, Communication
            `;

            const res = await request(app)
                .post('/api/ats/scan')
                .send({ resumeText: sampleResumeText });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Resume scanned and ATS score calculated successfully.');
            expect(res.body.data).toBeDefined();
            expect(typeof res.body.data.totalScore).toBe('number');
            expect(res.body.data.breakdown).toBeDefined();
            expect(res.body.data.skillsFound.technical).toContain('react');
        });
    });

});
