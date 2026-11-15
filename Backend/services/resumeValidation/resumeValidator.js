const config = require('./config');
const { getTextMetrics } = require('./textNormalizer');

/**
 * Curated dictionary of common technical and professional skills for matching.
 */
const SKILL_CATALOG = new Set([
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'go', 'golang', 'rust',
    'ruby', 'php', 'swift', 'kotlin', 'dart', 'r', 'scala', 'sql', 'html', 'html5', 'css', 'css3',
    // Frameworks & Libraries
    'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'angular', 'vue', 'vue.js', 'vuejs',
    'node', 'node.js', 'nodejs', 'express', 'express.js', 'expressjs', 'django', 'flask',
    'fastapi', 'spring', 'spring boot', 'asp.net', '.net', 'laravel', 'redux', 'tailwind',
    'tailwindcss', 'bootstrap', 'jquery', 'graphql', 'rest api', 'restful api', 'api',
    // Databases
    'mongodb', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis', 'elasticsearch',
    'dynamodb', 'cassandra', 'oracle', 'firebase', 'supabase', 'prisma',
    // Cloud, DevOps & Tools
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'git',
    'github', 'gitlab', 'jenkins', 'terraform', 'ansible', 'linux', 'unix', 'nginx',
    'postman', 'jira', 'webpack', 'vite',
    // Methodologies & Concepts
    'agile', 'scrum', 'microservices', 'system design', 'oop', 'data structures',
    'algorithms', 'unit testing', 'jest', 'mocha', 'cypress', 'selenium', 'tdd',
]);

/**
 * Anti-cheat / non-resume markers for detecting tutorials, homework, and documentation.
 */
const NON_RESUME_PATTERNS = {
    tutorial: [
        /\b(?:in this tutorial|step-by-step guide|getting started with|how to install|prerequisites:)\b/i,
        /\b(?:follow these steps|in this article|in this post|table of contents|summary of chapters)\b/i,
        /\b(?:click on the|download the source code|clone the repository from)\b/i,
    ],
    assignment: [
        /\b(?:assignment\s*#?\d+|homework\s*#?\d+|problem set\s*#?\d+|lab exercise\s*#?\d+)\b/i,
        /\b(?:course syllabus|lecture notes|instructor\s*:|professor\s*:|due date\s*:)\b/i,
        /\b(?:submission deadline|grading rubric|total points\s*:|student id\s*:)\b/i,
        /\b(?:question \d+\s*:|answer the following questions|solve the following)\b/i,
    ],
    documentation: [
        /\b(?:software requirements specification|class diagram|use case specification)\b/i,
        /\b(?:sequence diagram|entity relationship diagram|api documentation|endpoint parameters)\b/i,
        /\b(?:request headers|response payload|status code 200|json schema)\b/i,
    ],
};

/**
 * Extracts sections from normalized resume text by matching known section headings.
 * Returns a map of sectionName -> sectionContent.
 *
 * @param {string} text
 * @returns {Object} Map of section name to text content
 */
function extractSections(text) {
    const lines = text.split('\n');
    const sections = {
        header: [],
        summary: [],
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        other: [],
    };

    let currentSection = 'header';

    // Build reverse map of heading alias -> canonical section
    const headingToSection = {};
    for (const [sectionKey, aliases] of Object.entries(config.headings)) {
        for (const alias of aliases) {
            headingToSection[alias.toLowerCase()] = sectionKey;
        }
    }

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Clean line to test if it's a standalone heading (e.g., "EDUCATION", "## Experience", "Skills:")
        const cleanedHeading = trimmed
            .toLowerCase()
            .replace(/^#+\s*/, '')
            .replace(/[:\-–—\s]+$/, '')
            .trim();

        if (headingToSection[cleanedHeading] && cleanedHeading.length < 35) {
            currentSection = headingToSection[cleanedHeading];
            continue;
        }

        if (sections[currentSection]) {
            sections[currentSection].push(line);
        } else {
            sections.other.push(line);
        }
    }

    // Convert arrays to joined string blocks
    const result = {};
    for (const [key, lineArr] of Object.entries(sections)) {
        result[key] = lineArr.join('\n').trim();
    }
    return result;
}

/**
 * Validates the contact information in the document.
 * Requires genuine contact details (email or phone, plus name or online profile).
 *
 * @param {string} text
 * @param {string} headerSection
 * @returns {Object} { isValid, details, score }
 */
function validateContactInfo(text, headerSection) {
    const combined = `${headerSection}\n${text.slice(0, 1000)}`;

    const emailMatch = combined.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = combined.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,14}/);
    const linkedInMatch = /(?:linkedin\.com\/in\/[\w-]+|github\.com\/[\w-]+|portfolio|gitlab\.com)/i.test(combined);

    // Look for a reasonable candidate name in top lines
    const topLines = headerSection.split('\n').slice(0, 4);
    let hasName = false;
    for (const line of topLines) {
        const cleanLine = line.trim();
        // A name is typically 2-4 words, alphabetic, without colons or common keywords
        if (
            /^[A-Z][a-zA-Z'.-]+(?:\s+[A-Z][a-zA-Z'.-]+){1,3}$/.test(cleanLine) &&
            !/resume|curriculum|profile|vitae|page|engineer|developer/i.test(cleanLine)
        ) {
            hasName = true;
            break;
        }
    }

    const hasContactChannel = Boolean(emailMatch || phoneMatch);
    const hasIdentifier = hasName || linkedInMatch;
    const isValid = hasContactChannel && hasIdentifier;

    return {
        isValid,
        hasEmail: Boolean(emailMatch),
        hasPhone: Boolean(phoneMatch),
        hasLinkedIn: linkedInMatch,
        hasName,
        details: {
            email: emailMatch ? emailMatch[0] : null,
            phone: phoneMatch ? phoneMatch[0] : null,
            linkedIn: linkedInMatch,
        },
    };
}

/**
 * Validates the education section.
 * Requires actual degrees, institutions, and academic timelines/metrics.
 *
 * @param {string} sectionText
 * @param {string} fullText
 * @returns {Object} { isValid, details }
 */
function validateEducation(sectionText, fullText) {
    const textToSearch = sectionText || fullText;

    const degreeRegex = /\b(?:bachelor|master|b\.?tech|btech|b\.?e\b|b\.?sc|m\.?tech|mtech|m\.?sc|m\.?s\b|m\.?b\.?a|ph\.?d|diploma|associate degree|higher secondary|high school|bca|mca|bba)\b/i;
    const institutionRegex = /\b(?:university|college|institute|school of|academy|polytechnic|campus)\b/i;
    const academicMetricRegex = /\b(?:cgpa|gpa|percentage|marks|grade|\b\d\.\d{1,2}\s*\/\s*\d|\b\d{2}%\b)\b/i;
    const yearRegex = /\b(?:20\d{2}|19\d{2})\b/;
    const majorRegex = /\b(?:computer science|engineering|information technology|electronics|mechanical|electrical|data science|mathematics|physics|commerce|arts|business)\b/i;

    const hasDegree = degreeRegex.test(textToSearch);
    const hasInstitution = institutionRegex.test(textToSearch);
    const hasAcademicMetric = academicMetricRegex.test(textToSearch);
    const hasYear = yearRegex.test(textToSearch);
    const hasMajor = majorRegex.test(textToSearch);

    // Contextual rule: A genuine education entry requires a degree OR
    // an institution combined with academic context (year, major, or GPA).
    const isValid = hasDegree || (hasInstitution && (hasYear || hasMajor || hasAcademicMetric));

    return {
        isValid,
        hasDegree,
        hasInstitution,
        hasAcademicMetric,
        hasYear,
        hasMajor,
    };
}

/**
 * Validates the work experience section.
 * Requires job titles or companies, employment dates, and action-oriented responsibilities.
 *
 * @param {string} sectionText
 * @param {string} fullText
 * @returns {Object} { isValid, details }
 */
function validateExperience(sectionText, fullText) {
    const textToSearch = sectionText || fullText;

    const jobTitleRegex = /\b(?:software engineer|frontend developer|backend developer|full stack|web developer|data scientist|data analyst|systems engineer|devops engineer|cloud architect|qa engineer|mobile developer|intern|software engineering intern|associate|consultant|manager|lead|architect|specialist|designer|administrator|analyst|programmer)\b/i;
    const dateRangeRegex = /\b(?:20\d{2}|19\d{2}|present|current|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})\b/i;
    const actionVerbRegex = /\b(?:developed|engineered|built|designed|implemented|spearheaded|led|managed|optimized|maintained|collaborated|automated|created|delivered|resolved|enhanced|scaled|reduced|increased)\b/i;
    const companyIndicatorRegex = /\b(?:inc|corp|corporation|technologies|solutions|labs|pvt|ltd|limited|services|company|firm)\b/i;

    const hasJobTitle = jobTitleRegex.test(textToSearch);
    const hasDateRange = dateRangeRegex.test(textToSearch);
    const hasActionVerb = actionVerbRegex.test(textToSearch);
    const hasCompany = companyIndicatorRegex.test(textToSearch);

    // Must have a job title or company combined with dates AND action verbs/responsibilities
    const isValid = (hasJobTitle || hasCompany) && hasDateRange && hasActionVerb;

    return {
        isValid,
        hasJobTitle,
        hasDateRange,
        hasActionVerb,
        hasCompany,
    };
}

/**
 * Validates the projects section.
 * Requires project titles and technical descriptions with tools/frameworks.
 *
 * @param {string} sectionText
 * @param {string} fullText
 * @returns {Object} { isValid, details }
 */
function validateProjects(sectionText, fullText) {
    const textToSearch = sectionText || fullText;

    const techUsedRegex = /\b(?:built with|using|technologies\s*:|stack\s*:|react|node|python|java|api|database|mongodb|sql|aws|docker|express|frontend|backend)\b/i;
    const projectVerbRegex = /\b(?:developed|created|built|designed|implemented|integrated|engineered|deployed)\b/i;
    const projectHeadingExists = Boolean(sectionText && sectionText.length > 30);

    const hasTechUsed = techUsedRegex.test(textToSearch);
    const hasProjectVerb = projectVerbRegex.test(textToSearch);

    // If section exists with tech + verbs, or fullText contains clear project descriptions
    const isValid = (projectHeadingExists && (hasTechUsed || hasProjectVerb)) || (hasTechUsed && hasProjectVerb);

    return {
        isValid,
        hasTechUsed,
        hasProjectVerb,
        hasDedicatedSection: projectHeadingExists,
    };
}

/**
 * Validates skills section.
 * Requires at least 3 recognizable skills from the curated skill catalog.
 *
 * @param {string} sectionText
 * @param {string} fullText
 * @returns {Object} { isValid, matchedSkills, count }
 */
function validateSkills(sectionText, fullText) {
    const textToSearch = (sectionText || fullText).toLowerCase();
    const matchedSkills = [];

    for (const skill of SKILL_CATALOG) {
        // Word boundary match
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
        if (regex.test(textToSearch)) {
            matchedSkills.push(skill);
        }
    }

    const isValid = matchedSkills.length >= 3;

    return {
        isValid,
        matchedSkills,
        count: matchedSkills.length,
        hasDedicatedSection: Boolean(sectionText && sectionText.length > 10),
    };
}

/**
 * Validates professional summary section.
 * Requires 1-4 sentences (>= 15 words) describing professional focus or background.
 *
 * @param {string} sectionText
 * @returns {Object} { isValid, wordCount }
 */
function validateSummary(sectionText) {
    if (!sectionText) {
        return { isValid: false, wordCount: 0 };
    }

    const words = sectionText.split(/\s+/).filter(Boolean);
    const summaryIndicator = /\b(?:experience|engineer|developer|passionate|background|skilled in|seeking|proven track record|motivated)\b/i;

    const isValid = words.length >= 15 && words.length <= 150 && summaryIndicator.test(sectionText);

    return {
        isValid,
        wordCount: words.length,
    };
}

/**
 * Validates certifications section.
 * Requires genuine certification credentials.
 *
 * @param {string} sectionText
 * @param {string} fullText
 * @returns {Object} { isValid, details }
 */
function validateCertifications(sectionText, fullText) {
    const textToSearch = sectionText || fullText;
    const certRegex = /\b(?:aws certified|certified kubernetes|azure certified|google cloud certified|ccna|comptia|pmp|certified scrum|oracle certified|coursera|udemy|hackerrank|deeplearning\.ai)\b/i;

    const isValid = certRegex.test(textToSearch);

    return {
        isValid,
        hasDedicatedSection: Boolean(sectionText && sectionText.length > 10),
    };
}

/**
 * Detects whether the document appears to be a tutorial, assignment, or technical doc.
 *
 * @param {string} text
 * @returns {Object} { isDisallowed, reason, category }
 */
function detectDisallowedDocumentType(text) {
    let tutorialMatches = 0;
    for (const regex of NON_RESUME_PATTERNS.tutorial) {
        if (regex.test(text)) tutorialMatches++;
    }

    let assignmentMatches = 0;
    for (const regex of NON_RESUME_PATTERNS.assignment) {
        if (regex.test(text)) assignmentMatches++;
    }

    let docMatches = 0;
    for (const regex of NON_RESUME_PATTERNS.documentation) {
        if (regex.test(text)) docMatches++;
    }

    // CLI commands check
    const cliMatches = (text.match(/\b(?:npm install|yarn add|pip install|brew install|docker run|curl -s|git clone)\b/gi) || []).length;

    if (tutorialMatches >= 2 || (tutorialMatches >= 1 && cliMatches >= 2)) {
        return {
            isDisallowed: true,
            category: 'tutorial',
            reason: 'The uploaded document appears to be a programming tutorial or technical guide.',
        };
    }

    if (assignmentMatches >= 2) {
        return {
            isDisallowed: true,
            category: 'assignment',
            reason: 'The uploaded document appears to be an academic assignment, homework, or exam.',
        };
    }

    if (docMatches >= 2) {
        return {
            isDisallowed: true,
            category: 'documentation',
            reason: 'The uploaded document appears to be technical specification or API documentation.',
        };
    }

    return { isDisallowed: false };
}

/**
 * Detects keyword stuffing where text contains mostly comma-separated skill lists
 * without narrative or structural sentences.
 *
 * @param {string} text
 * @param {Object} metrics
 * @param {Object} skills
 * @returns {boolean}
 */
function isKeywordOnlyDocument(text, metrics, skills) {
    if (metrics.wordCount < 150 && skills.count >= 8) {
        // Check if there are almost no complete sentences or action verbs
        const verbCount = (text.match(/\b(?:built|developed|designed|implemented|worked|graduated|managed|created|led)\b/gi) || []).length;
        if (verbCount <= 1) {
            return true;
        }
    }
    return false;
}

/**
 * Detects documents containing only contact info with no meaningful background.
 *
 * @param {Object} metrics
 * @param {Object} contact
 * @param {Object} education
 * @param {Object} experience
 * @param {Object} projects
 * @param {Object} skills
 * @returns {boolean}
 */
function isContactInfoOnlyDocument(metrics, contact, education, experience, projects, skills) {
    if (contact.isValid && !education.isValid && !experience.isValid && !projects.isValid && skills.count < 3) {
        return true;
    }
    return false;
}

/**
 * Performs complete structural and contextual analysis on normalized resume text.
 *
 * @param {string} normalizedText
 * @returns {Object} Comprehensive analysis report
 */
function analyzeResumeStructure(normalizedText) {
    const metrics = getTextMetrics(normalizedText);

    // Initial quality checks
    if (metrics.wordCount === 0) {
        return {
            isValidQuality: false,
            code: 'EMPTY_DOCUMENT',
            message: 'The resume content is empty.',
            statusCode: 400,
        };
    }

    if (metrics.wordCount < config.minWordCount) {
        return {
            isValidQuality: false,
            code: 'CONTENT_TOO_SHORT',
            message: `The document contains insufficient content (${metrics.wordCount} words; minimum ${config.minWordCount} required).`,
            statusCode: 422,
        };
    }

    if (metrics.wordCount >= 50 && metrics.lexicalDiversity < config.minLexicalDiversity) {
        return {
            isValidQuality: false,
            code: 'KEYWORD_STUFFING',
            message: 'Document contains excessively repetitive text or keyword stuffing.',
            statusCode: 422,
        };
    }

    if (metrics.unreadableCharRatio > config.maxUnreadableRatio) {
        return {
            isValidQuality: false,
            code: 'UNREADABLE_DOCUMENT',
            message: 'The extracted document contains mostly unreadable or corrupted characters.',
            statusCode: 422,
        };
    }

    // Extract sections
    const sections = extractSections(normalizedText);

    // Contextual section validations
    const contact = validateContactInfo(normalizedText, sections.header);
    const education = validateEducation(sections.education, normalizedText);
    const experience = validateExperience(sections.experience, normalizedText);
    const projects = validateProjects(sections.projects, normalizedText);
    const skills = validateSkills(sections.skills, normalizedText);
    const summary = validateSummary(sections.summary);
    const certifications = validateCertifications(sections.certifications, normalizedText);

    // Check disallowed document types (tutorials, assignments, etc.)
    const disallowedCheck = detectDisallowedDocumentType(normalizedText);
    if (disallowedCheck.isDisallowed) {
        // If it looks like a tutorial/assignment AND lacks genuine experience/education, reject
        if (!experience.isValid && !education.isValid) {
            return {
                isValidQuality: false,
                code: 'NOT_A_RESUME',
                message: disallowedCheck.reason,
                statusCode: 422,
            };
        }
    }

    // Check keyword-only document
    if (isKeywordOnlyDocument(normalizedText, metrics, skills) && !education.isValid && !experience.isValid) {
        return {
            isValidQuality: false,
            code: 'KEYWORD_STUFFING',
            message: 'The document contains only a list of keywords without meaningful professional or academic background.',
            statusCode: 422,
        };
    }

    // Check contact-only document
    if (isContactInfoOnlyDocument(metrics, contact, education, experience, projects, skills)) {
        return {
            isValidQuality: false,
            code: 'INSUFFICIENT_RESUME_CONTENT',
            message: 'The document contains only contact information without sufficient professional, project, or educational details.',
            statusCode: 422,
        };
    }

    // Evaluate matching resume profiles
    const profiles = {
        // Fresher: Education + Skills + Projects + Contact Info (Work experience is NOT required)
        fresher: education.isValid && skills.isValid && projects.isValid && contact.isValid,
        // Experienced: Work experience + Skills + Education + Contact Info
        experienced: experience.isValid && skills.isValid && education.isValid && contact.isValid,
        // Career Switcher: Summary + Skills + Projects + (Experience OR Education) + Contact Info
        careerSwitcher: summary.isValid && skills.isValid && projects.isValid && (experience.isValid || education.isValid) && contact.isValid,
        // Academic / Research CV: Education + (Projects OR Certifications) + Skills + Contact Info
        academic: education.isValid && (projects.isValid || certifications.isValid) && skills.isValid && contact.isValid,
    };

    return {
        isValidQuality: true,
        metrics,
        sections,
        context: {
            contact,
            education,
            experience,
            projects,
            skills,
            summary,
            certifications,
        },
        profiles,
    };
}

module.exports = {
    SKILL_CATALOG,
    extractSections,
    validateContactInfo,
    validateEducation,
    validateExperience,
    validateProjects,
    validateSkills,
    validateSummary,
    validateCertifications,
    detectDisallowedDocumentType,
    isKeywordOnlyDocument,
    isContactInfoOnlyDocument,
    analyzeResumeStructure,
};
