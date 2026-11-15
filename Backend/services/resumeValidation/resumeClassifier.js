const config = require('./config');

/**
 * Calculates preliminary resume-confidence score using configurable weights.
 *
 * Contact: 10
 * Education: 20
 * Experience: 20
 * Projects: 20
 * Skills: 15
 * Summary: 10
 * Certifications: 5
 * Total: 100
 *
 * @param {Object} context - Section validation results from resumeValidator
 * @returns {Object} { totalScore, breakdown }
 */
function calculateConfidenceScore(context) {
    const weights = config.weights;
    const breakdown = {
        contact: context.contact.isValid ? weights.contact : (context.contact.hasEmail || context.contact.hasPhone ? 5 : 0),
        education: context.education.isValid ? weights.education : (context.education.hasDegree || context.education.hasInstitution ? 8 : 0),
        experience: context.experience.isValid ? weights.experience : (context.experience.hasJobTitle && context.experience.hasDateRange ? 10 : 0),
        projects: context.projects.isValid ? weights.projects : (context.projects.hasTechUsed || context.projects.hasProjectVerb ? 8 : 0),
        skills: context.skills.isValid ? weights.skills : (context.skills.count >= 2 ? 6 : 0),
        summary: context.summary.isValid ? weights.summary : 0,
        certifications: context.certifications.isValid ? weights.certifications : 0,
    };

    const totalScore = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    return {
        totalScore,
        breakdown,
    };
}

/**
 * Classifies the document based on weighted score, profile matches, and contextual integrity.
 *
 * Output states:
 * 1. VALID: Sufficient evidence of a genuine resume.
 * 2. UNCERTAIN: Ambiguous structure; requires secondary AI classification.
 * 3. INVALID: Definitively not a resume.
 *
 * @param {Object} analysis - Output from analyzeResumeStructure
 * @returns {Object} { status, score, breakdown, detectedProfile, reasons }
 */
function classifyResume(analysis) {
    if (!analysis.isValidQuality) {
        return {
            status: 'INVALID',
            score: 0,
            breakdown: {},
            detectedProfile: null,
            code: analysis.code || 'INVALID_RESUME',
            message: analysis.message || 'Document failed basic resume quality checks.',
            statusCode: analysis.statusCode || 422,
            reasons: [analysis.message],
        };
    }

    const { context, profiles } = analysis;
    const { totalScore, breakdown } = calculateConfidenceScore(context);
    const reasons = [];

    // Identify detected resume profile
    let detectedProfile = null;
    if (profiles.experienced) {
        detectedProfile = 'experienced';
        reasons.push('Matches Experienced Professional profile (Work Experience + Skills + Education + Contact).');
    } else if (profiles.fresher) {
        detectedProfile = 'fresher';
        reasons.push('Matches Fresher profile (Education + Skills + Projects + Contact).');
    } else if (profiles.careerSwitcher) {
        detectedProfile = 'career_switcher';
        reasons.push('Matches Career Switcher profile (Summary + Skills + Projects + Background).');
    } else if (profiles.academic) {
        detectedProfile = 'academic';
        reasons.push('Matches Academic/Research CV profile (Education + Projects/Certs + Skills).');
    }

    // Determine detected sections
    const detectedSections = [];
    if (context.contact.isValid) detectedSections.push('contact');
    if (context.education.isValid) detectedSections.push('education');
    if (context.experience.isValid) detectedSections.push('experience');
    if (context.projects.isValid) detectedSections.push('projects');
    if (context.skills.isValid) detectedSections.push('skills');
    if (context.summary.isValid) detectedSections.push('summary');
    if (context.certifications.isValid) detectedSections.push('certifications');

    const hasCoreAnchor = context.education.isValid || context.experience.isValid;
    const hasTechnicalAnchor = context.skills.isValid || context.projects.isValid;

    // Check VALID condition
    if (
        (totalScore >= config.thresholds.valid && detectedProfile) ||
        (totalScore >= 70 && hasCoreAnchor && hasTechnicalAnchor && context.contact.isValid)
    ) {
        return {
            status: 'VALID',
            score: totalScore,
            breakdown,
            detectedSections,
            detectedProfile,
            reasons: reasons.length > 0 ? reasons : ['Meets structural and contextual resume validation criteria.'],
        };
    }

    // Check INVALID condition
    if (totalScore < config.thresholds.uncertain || (!hasCoreAnchor && !hasTechnicalAnchor)) {
        return {
            status: 'INVALID',
            score: totalScore,
            breakdown,
            detectedSections,
            detectedProfile: null,
            code: 'INSUFFICIENT_RESUME_EVIDENCE',
            statusCode: 422,
            message: 'The document lacks sufficient evidence of a genuine resume (missing core education, experience, or project sections).',
            reasons: ['Score below threshold and missing core professional/academic anchors.'],
        };
    }

    // Otherwise, document has partial or ambiguous evidence -> UNCERTAIN
    reasons.push('Document exhibits ambiguous or partial resume structure. Secondary classification required.');
    return {
        status: 'UNCERTAIN',
        score: totalScore,
        breakdown,
        detectedSections,
        detectedProfile,
        reasons,
    };
}

module.exports = {
    calculateConfidenceScore,
    classifyResume,
};
