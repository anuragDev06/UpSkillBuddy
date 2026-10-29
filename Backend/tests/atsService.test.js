const { calculateAtsScore, extractTextFromFile } = require('../services/atsService');

describe('ATS Service - Unit Tests', () => {

    describe('calculateAtsScore()', () => {
        test('should return score 0 and Critical status when resumeText is empty or missing', () => {
            const result = calculateAtsScore('');
            expect(result).toBeDefined();
            expect(result.totalScore).toBe(0);
            expect(result.status).toBe('Critical');
            expect(result.summary).toContain('No readable text content found');
            expect(result.improvements).toContain('Provide readable resume text or upload a valid file.');
        });

        test('should return score 0 for whitespace-only text', () => {
            const result = calculateAtsScore('   \n  \t ');
            expect(result.totalScore).toBe(0);
            expect(result.status).toBe('Critical');
        });

        test('should correctly parse and score a comprehensive high-quality resume', () => {
            // Generate a realistic resume (> 200 words) with contact info, sections, skills, and metrics
            const sampleResume = `
            John Doe
            Email: john.doe@example.com | Phone: +1-555-123-4567
            LinkedIn: linkedin.com/in/johndoe | Portfolio: github.com/johndoe

            Summary
            Passionate Senior Software Engineer with over 6 years of experience building scalable web applications.
            Skilled in full-stack JavaScript development, API design, cloud deployment, and team leadership.

            Experience
            Senior Full Stack Developer - TechCorp (2021 - Present)
            - Spearheaded the redesign of core microservices, improving system performance by 35%.
            - Developed and engineered responsive frontend components using React, Next.js, and TypeScript.
            - Optimized MongoDB database queries, reducing average API response times by 40%.
            - Integrated AWS cloud infrastructure and Docker containerization for automated CI/CD deployment pipelines.
            - Led a team of 5 engineers using Agile and Scrum methodologies to deliver project milestones on schedule.
            - Scaled application capacity to handle over 100000 active daily users seamlessly.

            Software Engineer - InnovateLabs (2018 - 2021)
            - Engineered REST API endpoints with Express and Node.js for high-throughput messaging system.
            - Built unit and integration tests using Jest, achieving 90% code coverage.
            - Automated deployment workflow, saving 15 hours of manual work weekly.
            - Implemented GraphQL endpoints and Redis caching layer to enhance data retrieval speeds.

            Education
            Bachelor of Science in Computer Science - University of Technology

            Skills
            Technical Skills: JavaScript, TypeScript, Python, React, Node.js, Express, MongoDB, PostgreSQL, SQL, Redis, AWS, Docker, Git, GitHub, GraphQL, REST API, Jest, CI/CD, HTML, CSS, Tailwind
            Soft Skills: Leadership, Communication, Problem Solving, Collaboration, Teamwork, Agile, Time Management

            Projects & Certifications
            - UpSkillBuddy: Built an AI-assisted ATS resume evaluation system.
            - AWS Certified Solutions Architect.
            `;

            const result = calculateAtsScore(sampleResume);

            expect(result.totalScore).toBeGreaterThanOrEqual(70);
            expect(['Good', 'Excellent']).toContain(result.status);

            // Verify breakdown structure
            expect(result.breakdown).toHaveProperty('contactInfo');
            expect(result.breakdown.contactInfo.score).toBe(15); // Email + Phone + LinkedIn + Portfolio

            expect(result.breakdown).toHaveProperty('sections');
            expect(result.breakdown.sections.score).toBe(25); // Summary, Experience, Education, Skills, Projects

            expect(result.breakdown).toHaveProperty('skills');
            expect(result.breakdown.skills.score).toBeGreaterThan(0);
            expect(result.skillsFound.technical).toContain('react');
            expect(result.skillsFound.technical).toContain('node.js');

            expect(result.breakdown).toHaveProperty('impactAndVerbs');
            expect(result.breakdown.impactAndVerbs.score).toBeGreaterThan(0);

            expect(result.breakdown).toHaveProperty('formatting');
            expect(result.breakdown.formatting.score).toBe(15);

            expect(result.strengths.length).toBeGreaterThan(0);
        });

        test('should apply penalty when resume word count is under 200 words', () => {
            const shortResume = 'John Doe. Email: john@example.com. Developer with React skills.';
            const result = calculateAtsScore(shortResume);

            expect(result.breakdown.formatting.score).toBeLessThan(15);
            expect(result.breakdown.formatting.details[0]).toContain('too short');
        });
    });

    describe('extractTextFromFile()', () => {
        test('should throw error if file object or buffer is missing', async () => {
            await expect(extractTextFromFile(null)).rejects.toThrow('Invalid file payload or missing file buffer.');
            await expect(extractTextFromFile({})).rejects.toThrow('Invalid file payload or missing file buffer.');
        });

        test('should extract text content from plain text file payload', async () => {
            const mockFile = {
                buffer: Buffer.from('Software Developer Resume Content'),
                originalname: 'my_resume.txt',
                mimetype: 'text/plain'
            };

            const extractedText = await extractTextFromFile(mockFile);
            expect(extractedText).toBe('Software Developer Resume Content');
        });

        test('should throw error for unsupported file extensions/mimetypes', async () => {
            const mockFile = {
                buffer: Buffer.from('fake image data'),
                originalname: 'avatar.png',
                mimetype: 'image/png'
            };

            await expect(extractTextFromFile(mockFile)).rejects.toThrow('Unsupported file format');
        });
    });

});
