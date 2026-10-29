import React, { useState, useRef, useCallback } from 'react'

// ─── Design tokens (inline for single-source consistency) ─────────────────────
// Primary: #2563EB  Dark text: #0F172A  Secondary: #475569  Muted: #64748B
// BG: #F8FAFC  Card: #FFFFFF  Border: #E2E8F0
// Success: #16A34A  Warning: #D97706
// Button h: 40-44px  Button radius: rounded-[10px]
// Card radius: rounded-2xl (16px)  Control radius: rounded-[8px]

// ─── Icons (16×16 default — consistent icon sizing) ───────────────────────────
const IconArrow = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
)
const IconCheck = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
)
const IconRefresh = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
)
const IconUpload = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
)
const IconChart = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
)
const IconSearch = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
)
const IconMic = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
)
const IconAlert = ({ className = 'w-4 h-4' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
)
const IconXCircle = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)

// ─── Step-checklist loader ─────────────────────────────────────────────────────
const StepChecklist = ({ title, steps, currentStep }) => (
    <div className="flex flex-col items-center justify-center py-10 px-6 space-y-5 animate-fadeIn">
        <div className="text-center space-y-1.5">
            <div className="w-5 h-5 mx-auto border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
        </div>
        <div className="w-full max-w-[260px] bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {steps.map((label, idx) => {
                const done = idx < currentStep
                const active = idx === currentStep
                return (
                    <div
                        key={idx}
                        className={`flex items-center gap-2.5 text-xs font-medium transition-colors duration-200 ${done ? 'text-[#16A34A]' : active ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`}
                    >
                        <span className="w-4 text-center font-semibold flex-shrink-0">
                            {done ? '✓' : active ? '●' : '○'}
                        </span>
                        {label}
                    </div>
                )
            })}
        </div>
    </div>
)

// ─── Error state ───────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4 animate-fadeIn">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <IconXCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1 max-w-[260px]">
            <p className="text-sm font-semibold text-[#0F172A]">Something went wrong</p>
            <p className="text-xs text-[#64748B] leading-relaxed">{message}</p>
        </div>
        <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold rounded-[10px]
                hover:bg-[#F8FAFC] hover:border-slate-300 transition-colors duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        >
            <IconRefresh className="w-3.5 h-3.5" />
            Try Again
        </button>
    </div>
)

// ─── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon, title, description }) => (
    <div className="h-full flex flex-col items-center justify-center text-center py-12 px-6 space-y-2.5 animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] mb-1">
            {icon}
        </div>
        <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
        <p className="text-xs text-[#64748B] max-w-[260px] leading-relaxed">{description}</p>
    </div>
)

// ─── Inline warning notice ─────────────────────────────────────────────────────
const WarningNotice = ({ children }) => (
    <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-[10px] text-xs font-medium text-[#92400E]">
        <IconAlert className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0 mt-0.5" />
        <span>{children}</span>
    </div>
)

// ─── Skill badge ───────────────────────────────────────────────────────────────
const SkillBadge = ({ children, variant = 'default' }) => {
    const variants = {
        default: 'text-[#475569] bg-[#F8FAFC] border-[#E2E8F0]',
        blue: 'text-[#2563EB] bg-blue-50 border-blue-100',
        green: 'text-[#16A34A] bg-green-50 border-green-100',
        amber: 'text-[#D97706] bg-amber-50 border-amber-200',
        red: 'text-red-600 bg-red-50 border-red-100',
    }
    return (
        <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium border rounded-[6px] ${variants[variant]}`}>
            {children}
        </span>
    )
}

// ─── Section label (consistent caps micro-heading) ────────────────────────────
const SectionLabel = ({ children }) => (
    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
        {children}
    </span>
)

// ─── Shared data ──────────────────────────────────────────────────────────────
const SAMPLE_DATA = {
    ats: {
        candidateName: 'Alex Sharma',
        role: 'Frontend Developer',
        skills: ['React.js', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Git'],
        experience: [
            {
                title: 'Frontend Developer Intern',
                company: 'TechNova Solutions',
                period: '2023 – Present',
                bullets: [
                    'Developed responsive UI components using React.js and Tailwind CSS.',
                    'Integrated REST APIs for user dashboard and data management features.',
                ],
            },
        ],
    },
}

const MATCH_ROLES_DATA = {
    frontend: {
        roleName: 'Frontend Developer',
        resume: {
            title: 'Alex Sharma — Frontend Developer',
            skills: ['React.js', 'JavaScript', 'REST APIs', 'Git', 'HTML/CSS'],
            experience: 'Frontend Developer Intern at TechNova Solutions (1+ Yrs)',
            education: 'B.Tech in Computer Science (2024)',
            relevantTech: ['Tailwind CSS', 'Redux Toolkit', 'Axios'],
        },
        job: {
            title: 'Senior Frontend Developer',
            companyType: 'High-Growth FinTech SaaS',
            experienceReq: '2–4 Years Frontend Engineering',
            techReqs: ['React', 'JavaScript', 'REST APIs', 'TypeScript', 'Automated Testing'],
            preferredSkills: ['AWS Cloud Services', 'Performance Optimization'],
        },
        matchResult: {
            percent: 89,
            tier: 'Strong Match',
            matchedSkills: ['React', 'JavaScript', 'REST APIs', 'Git'],
            skillsToImprove: ['TypeScript', 'Testing'],
            missingSkills: ['AWS'],
            topGaps: ['AWS Cloud Services', 'Automated Testing', 'TypeScript'],
        },
    },
    java: {
        roleName: 'Java Developer',
        resume: {
            title: 'Rahul Verma — Junior Java Developer',
            skills: ['Java 17', 'Spring Boot', 'MySQL', 'REST APIs', 'Git'],
            experience: 'Software Engineer Trainee at CloudCode Systems (1 Yr)',
            education: 'B.E. in Information Technology (2024)',
            relevantTech: ['Hibernate/JPA', 'Maven', 'Postman'],
        },
        job: {
            title: 'Senior Java Backend Engineer',
            companyType: 'Enterprise Banking Fintech',
            experienceReq: '3+ Years Java/Spring Architecture',
            techReqs: ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'Microservices Architecture'],
            preferredSkills: ['Kafka Messaging', 'Docker & Kubernetes'],
        },
        matchResult: {
            percent: 84,
            tier: 'Good Match',
            matchedSkills: ['Java', 'Spring Boot', 'MySQL', 'REST APIs'],
            skillsToImprove: ['Microservices', 'Docker'],
            missingSkills: ['Kafka'],
            topGaps: ['Kafka Messaging', 'Microservices Architecture', 'Docker'],
        },
    },
    backend: {
        roleName: 'Backend Developer',
        resume: {
            title: 'Priya Nair — Backend Developer',
            skills: ['Node.js', 'Express.js', 'REST APIs', 'MongoDB', 'SQL'],
            experience: 'Backend Engineer at DataPulse Analytics (1.5 Yrs)',
            education: 'B.Tech in Computer Science (2023)',
            relevantTech: ['JWT Auth', 'PostgreSQL', 'Docker'],
        },
        job: {
            title: 'Senior Backend Engineer',
            companyType: 'Scalable Cloud Infrastructure Platform',
            experienceReq: '2–4 Years Server-side Architecture',
            techReqs: ['Node.js', 'Express.js', 'REST APIs', 'PostgreSQL', 'Redis Caching'],
            preferredSkills: ['Kubernetes', 'CI/CD Pipelines'],
        },
        matchResult: {
            percent: 82,
            tier: 'Good Match',
            matchedSkills: ['Node.js', 'Express.js', 'REST APIs', 'SQL'],
            skillsToImprove: ['PostgreSQL', 'Redis'],
            missingSkills: ['Kubernetes'],
            topGaps: ['Kubernetes', 'Redis Caching', 'PostgreSQL'],
        },
    },
    fullstack: {
        roleName: 'Full Stack Developer',
        resume: {
            title: 'Ankit Patel — Full Stack Developer',
            skills: ['React.js', 'Node.js', 'JavaScript', 'MongoDB', 'HTML/CSS'],
            experience: 'Full Stack Web Developer at WebSpark Studio (2 Yrs)',
            education: 'M.Sc in Software Engineering (2023)',
            relevantTech: ['Express.js', 'Tailwind CSS', 'Git'],
        },
        job: {
            title: 'Full Stack Cloud Engineer',
            companyType: 'Next-Gen AI Product Startup',
            experienceReq: '3+ Years Full Stack Web Engineering',
            techReqs: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'Next.js'],
            preferredSkills: ['AWS Cloud Services', 'GraphQL APIs'],
        },
        matchResult: {
            percent: 86,
            tier: 'Strong Match',
            matchedSkills: ['React', 'Node.js', 'JavaScript', 'MongoDB'],
            skillsToImprove: ['TypeScript', 'Next.js'],
            missingSkills: ['AWS'],
            topGaps: ['AWS Cloud Services', 'GraphQL APIs', 'TypeScript'],
        },
    },
}

const ENHANCER_EXAMPLES = [
    {
        id: 1,
        originalBullets: [
            'Built React components for the application.',
            'Worked on API integration.',
            'Made the website responsive.',
        ],
        enhancedBullets: [
            {
                text: 'Developed 20+ reusable React components, improving UI consistency and reducing duplicate code by 40%.',
                highlights: ['Developed 20+ reusable', 'reducing duplicate code by 40%'],
            },
            {
                text: 'Integrated REST APIs and optimized data fetching, improving application load speed by 28%.',
                highlights: ['Integrated REST APIs', 'improving application load speed by 28%'],
            },
            {
                text: 'Engineered fully responsive layouts across 5 breakpoints using Tailwind CSS, reducing mobile bounce rate by 22%.',
                highlights: ['5 breakpoints', 'reducing mobile bounce rate by 22%'],
            },
        ],
        aiImprovements: ['Stronger action verbs', 'Technical keywords', 'Quantifiable impact', 'ATS-friendly language', 'Improved clarity'],
        suggestionText: 'Add measurable impact — numbers and percentages boost ATS match by up to 35%.',
        warningText: 'Original bullets lack quantified metrics and use weak action verbs. ATS parsers may score this lower.',
    },
    {
        id: 2,
        originalBullets: [
            'Created backend endpoints in Node.js.',
            'Fixed database performance issues.',
            'Set up authentication for users.',
        ],
        enhancedBullets: [
            {
                text: 'Engineered 15+ secure RESTful endpoints in Node.js, scaling API throughput to 50k+ daily active users.',
                highlights: ['Engineered 15+ secure RESTful endpoints', 'scaling API throughput to 50k+'],
            },
            {
                text: 'Optimized PostgreSQL queries and indexes, decreasing query latency by 45%.',
                highlights: ['Optimized PostgreSQL queries', 'decreasing query latency by 45%'],
            },
            {
                text: 'Implemented JWT & OAuth2.0 authentication protocols, eliminating unauthorized access risks.',
                highlights: ['JWT & OAuth2.0', 'eliminating unauthorized access risks'],
            },
        ],
        aiImprovements: ['Stronger action verbs', 'Technical keywords', 'Quantifiable impact', 'ATS-friendly language', 'Improved clarity'],
        suggestionText: 'Quantify latency improvements and daily API throughput metrics for maximum ATS scoring.',
        warningText: 'Vague verbs like "Fixed" and "Created" score poorly in technical ATS keyword matching.',
    },
]

const MOCK_INTERVIEW_QUESTIONS = [
    {
        id: 1,
        questionNumber: 'Question 1 of 5',
        roleTag: 'Frontend Developer',
        questionText: 'What is the difference between useMemo and useCallback in React?',
        sampleAnswer: 'useMemo memoizes the returned result of a computation function, recalculating it only when dependencies change. useCallback memoizes the callback function instance itself across renders to prevent unnecessary re-creation when passed down to memoized child components.',
        evaluation: {
            score: '8.2 / 10',
            metrics: [
                { name: 'Technical Accuracy', score: '8.5' },
                { name: 'Clarity', score: '8.0' },
                { name: 'Completeness', score: '7.5' },
                { name: 'Confidence', score: '8.8' },
            ],
            feedbackGood: 'Correctly explained memoization and when each hook applies.',
            feedbackWarn: 'Clarify that useMemo memoizes a computed value while useCallback memoizes a function reference — a subtle but important distinction.',
            betterAnswer: 'useMemo memoizes the result of a computation (a value), recalculating it only when dependencies change. useCallback memoizes a function definition itself between renders to prevent re-creating callbacks passed to optimized child components.',
        },
    },
    {
        id: 2,
        questionNumber: 'Question 2 of 5',
        roleTag: 'Frontend Developer',
        questionText: 'How does the Virtual DOM work in React, and why is reconciliation efficient?',
        sampleAnswer: 'The Virtual DOM is an in-memory lightweight representation of the real DOM. When state changes, React creates a new Virtual DOM tree, performs a diffing algorithm against the previous tree, and batches minimal necessary updates to the real DOM.',
        evaluation: {
            score: '8.7 / 10',
            metrics: [
                { name: 'Technical Accuracy', score: '9.0' },
                { name: 'Clarity', score: '8.5' },
                { name: 'Completeness', score: '8.4' },
                { name: 'Confidence', score: '8.9' },
            ],
            feedbackGood: 'Accurately articulated the Virtual DOM diffing process and batch DOM updates.',
            feedbackWarn: 'Mention the O(n) heuristic diffing algorithm complexity vs naive O(n³) tree diffing.',
            betterAnswer: 'The Virtual DOM is an in-memory JS representation of the UI. React uses a heuristic O(n) diffing algorithm during reconciliation to compare tree nodes by key and component type, batching updates to minimize expensive real DOM mutations.',
        },
    },
]

const ATS_STEPS = ['Parsing document structure', 'Extracting skills & keywords', 'Comparing against ATS rules', 'Generating recommendations']
const MATCH_STEPS = ['Loading resume profile', 'Fetching job listing data', 'Comparing keywords & skills', 'Scoring match compatibility']
const ENHANCER_STEPS = ['Analyzing bullet structure', 'Detecting weak action verbs', 'Applying AI rewrites', 'Scoring impact improvements']
const INTERVIEW_STEPS = ['Analyzing technical accuracy', 'Checking concept coverage', 'Evaluating communication style', 'Computing final score']

// ─── Step loader hook ──────────────────────────────────────────────────────────
function useStepLoader(steps, onDone, delay = 320) {
    const [step, setStep] = useState(-1)
    const [running, setRunning] = useState(false)

    const start = useCallback(() => {
        setRunning(true)
        setStep(0)
        steps.forEach((_, idx) => {
            setTimeout(() => {
                setStep(idx + 1)
                if (idx === steps.length - 1) {
                    setTimeout(() => { setRunning(false); onDone() }, delay * 0.5)
                }
            }, delay * (idx + 1))
        })
    }, [steps, onDone, delay])

    const reset = useCallback(() => { setRunning(false); setStep(-1) }, [])
    return { step, running, start, reset }
}

// ─── Button style constants ────────────────────────────────────────────────────
// All primary buttons: h-10 (40px), rounded-[10px], text-sm/14px
// All secondary buttons: same height/radius, white bg
const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 h-10 px-4
    bg-[#2563EB] text-white text-sm font-semibold rounded-[10px]
    hover:bg-blue-700 transition-colors duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2
    disabled:opacity-50 disabled:pointer-events-none cursor-pointer
    shadow-[0_1px_2px_rgba(0,0,0,0.08)]`

const BTN_SECONDARY = `inline-flex items-center justify-center gap-2 h-10 px-4
    bg-white text-[#0F172A] text-sm font-semibold rounded-[10px]
    border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-slate-300 transition-colors duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2
    cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)]`

// Small inline button (inside cards / dropzone)
const BTN_SM_PRIMARY = `inline-flex items-center justify-center gap-1.5 h-8 px-3
    bg-[#2563EB] text-white text-xs font-semibold rounded-[8px]
    hover:bg-blue-700 transition-colors duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2
    cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.08)]`

const BTN_SM_SECONDARY = `inline-flex items-center justify-center gap-1.5 h-8 px-3
    bg-white text-[#475569] text-xs font-semibold rounded-[8px]
    border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-slate-300 transition-colors duration-200
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2
    cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)]`

// ─── Main component ────────────────────────────────────────────────────────────
const Features = () => {
    const [activeTab, setActiveTab] = useState('ats')

    // ATS Scanner
    const [atsHasAnalyzed, setAtsHasAnalyzed] = useState(false)
    const [atsError, setAtsError] = useState(false)
    const [atsCandidate, setAtsCandidate] = useState(SAMPLE_DATA.ats)
    const [uploadedFileName, setUploadedFileName] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)

    const handleAtsDone = useCallback(() => { setAtsHasAnalyzed(true); setAtsError(false) }, [])
    const atsLoader = useStepLoader(ATS_STEPS, handleAtsDone, 380)

    const handleRunAtsAnalysis = useCallback(() => {
        setAtsHasAnalyzed(false); setAtsError(false); atsLoader.start()
    }, [atsLoader])

    const handleAtsRetry = useCallback(() => {
        setAtsError(false); setAtsHasAnalyzed(false); atsLoader.reset()
    }, [atsLoader])

    const handleUseSampleResume = useCallback(() => {
        setUploadedFileName(null); setAtsCandidate(SAMPLE_DATA.ats); handleRunAtsAnalysis()
    }, [handleRunAtsAnalysis])

    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploadedFileName(file.name)
        setAtsCandidate({
            candidateName: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
            role: 'Uploaded Profile',
            skills: ['JavaScript', 'React', 'HTML/CSS', 'Git', 'Problem Solving'],
            experience: [{ title: 'Software Developer', company: 'Uploaded Resume', period: '2022 – Present', bullets: [`Extracted from ${file.name}.`, 'Parsed skills, work history, and formatting structure.'] }],
        })
        handleRunAtsAnalysis()
    }, [handleRunAtsAnalysis])

    const handleDrop = useCallback((e) => {
        e.preventDefault(); setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (!file) return
        setUploadedFileName(file.name)
        setAtsCandidate({
            candidateName: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
            role: 'Uploaded Profile',
            skills: ['React.js', 'JavaScript', 'Tailwind CSS', 'REST APIs'],
            experience: [{ title: 'Software Engineer', company: 'Parsed Document', period: '2023 – Present', bullets: ['Extracted resume experience and skills formatting.'] }],
        })
        handleRunAtsAnalysis()
    }, [handleRunAtsAnalysis])

    // Resume Match
    const [matchRoleKey, setMatchRoleKey] = useState('frontend')
    const [matchHasAnalyzed, setMatchHasAnalyzed] = useState(false)
    const [matchError, setMatchError] = useState(false)
    const currentMatchData = MATCH_ROLES_DATA[matchRoleKey]

    const handleMatchDone = useCallback(() => { setMatchHasAnalyzed(true); setMatchError(false) }, [])
    const matchLoader = useStepLoader(MATCH_STEPS, handleMatchDone, 350)

    const handleRunMatchAnalysis = useCallback(() => {
        setMatchHasAnalyzed(false); setMatchError(false); matchLoader.start()
    }, [matchLoader])

    const handleMatchRetry = useCallback(() => {
        setMatchError(false); setMatchHasAnalyzed(false); matchLoader.reset()
    }, [matchLoader])

    // Resume Enhancer
    const [enhancerExampleIndex, setEnhancerExampleIndex] = useState(0)
    const [enhancerApplied, setEnhancerApplied] = useState(false)
    const [enhancerError, setEnhancerError] = useState(false)
    const [enhancerLoading, setEnhancerLoading] = useState(false)
    const [enhancerStep, setEnhancerStep] = useState(-1)
    const currentEnhancerData = ENHANCER_EXAMPLES[enhancerExampleIndex]

    const handleApplyEnhancerSuggestions = useCallback(() => {
        setEnhancerError(false); setEnhancerApplied(false); setEnhancerLoading(true); setEnhancerStep(0)
        ENHANCER_STEPS.forEach((_, idx) => {
            setTimeout(() => {
                setEnhancerStep(idx + 1)
                if (idx === ENHANCER_STEPS.length - 1) {
                    setTimeout(() => { setEnhancerLoading(false); setEnhancerApplied(true); setTimeout(() => setEnhancerApplied(false), 2500) }, 200)
                }
            }, 300 * (idx + 1))
        })
    }, [])

    const handleTryAnotherEnhancerExample = useCallback(() => {
        setEnhancerExampleIndex(prev => (prev + 1) % ENHANCER_EXAMPLES.length)
        setEnhancerApplied(false); setEnhancerError(false); setEnhancerLoading(false); setEnhancerStep(-1)
    }, [])

    // Mock Interview
    const [interviewQuestionIndex, setInterviewQuestionIndex] = useState(0)
    const [interviewAnswerMode, setInterviewAnswerMode] = useState('type')
    const [userInterviewAnswer, setUserInterviewAnswer] = useState(MOCK_INTERVIEW_QUESTIONS[0].sampleAnswer)
    const [interviewEvaluated, setInterviewEvaluated] = useState(false)
    const [interviewError, setInterviewError] = useState(false)
    const currentQuestion = MOCK_INTERVIEW_QUESTIONS[interviewQuestionIndex]

    const handleInterviewDone = useCallback(() => { setInterviewEvaluated(true); setInterviewError(false) }, [])
    const interviewLoader = useStepLoader(INTERVIEW_STEPS, handleInterviewDone, 320)

    const handleRunInterviewEvaluation = useCallback(() => {
        setInterviewEvaluated(false); setInterviewError(false); interviewLoader.start()
    }, [interviewLoader])

    const handleInterviewRetry = useCallback(() => {
        setInterviewError(false); setInterviewEvaluated(false); interviewLoader.reset()
    }, [interviewLoader])

    const handleNextInterviewQuestion = useCallback(() => {
        const next = (interviewQuestionIndex + 1) % MOCK_INTERVIEW_QUESTIONS.length
        setInterviewQuestionIndex(next)
        setUserInterviewAnswer(MOCK_INTERVIEW_QUESTIONS[next].sampleAnswer)
        setInterviewEvaluated(false); interviewLoader.reset()
    }, [interviewQuestionIndex, interviewLoader])

    return (
        <section id="features" className="py-20 sm:py-28 bg-[#F8FAFC] border-b border-[#E2E8F0] scroll-mt-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section heading */}
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <span className="inline-block text-xs font-semibold text-[#2563EB] uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4">
                        Interactive Demo
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
                        Experience UpSkillBuddy
                    </h2>
                    <p className="mt-3 text-base text-[#475569]">
                        Try our AI-powered career tools instantly — no account required.
                    </p>
                </div>

                {/* Hidden file input */}
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="sr-only" onChange={handleFileChange} aria-label="Upload resume file" />

                {/* Workspace shell */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">

                    {/* Tab bar */}
                    <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Feature tools">
                            {[
                                { key: 'ats', label: 'ATS Scanner' },
                                { key: 'match', label: 'Resume Match' },
                                { key: 'interview', label: 'Mock Interview' },
                            ].map(tab => {
                                const active = activeTab === tab.key
                                return (
                                    <button
                                        key={tab.key}
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`px-3.5 py-1.5 text-sm font-semibold rounded-[8px] whitespace-nowrap cursor-pointer transition-colors duration-200
                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-1
                                            ${active ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'}`}
                                    >
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>
                        <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#D97706] bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-[6px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                            Demo Mode
                        </span>
                    </div>

                    {/* Workspace body */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">

                        {/* ═══════════════ ATS SCANNER ═══════════════ */}
                        {activeTab === 'ats' && (
                            <>
                                {/* Left: input panel */}
                                <div className="lg:col-span-6 p-5 sm:p-6 bg-[#F8FAFC] border-b lg:border-b-0 lg:border-r border-[#E2E8F0] flex flex-col gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-[#0F172A]">Resume Input</p>
                                        <p className="text-xs text-[#64748B] mt-0.5">Upload your resume or try our sample profile.</p>
                                    </div>

                                    {/* Drop zone */}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        aria-label="Upload resume — drop file here or click to browse"
                                        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors duration-200
                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2
                                            ${isDragging ? 'border-[#2563EB] bg-blue-50/50' : 'border-[#E2E8F0] bg-white hover:border-slate-300'}`}
                                    >
                                        <div className="w-9 h-9 mx-auto mb-2.5 rounded-full bg-blue-50 flex items-center justify-center text-[#2563EB]">
                                            <IconUpload className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs font-semibold text-[#0F172A]">
                                            {isDragging ? 'Drop to upload' : 'Drag and drop your resume here'}
                                        </p>
                                        <p className="text-[11px] text-[#64748B] mt-0.5">PDF or DOCX — max 5 MB</p>
                                        <div className="mt-3 flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => fileInputRef.current?.click()} className={BTN_SM_PRIMARY}>
                                                <IconUpload className="w-3.5 h-3.5" /> Upload Resume
                                            </button>
                                            <button onClick={handleUseSampleResume} className={BTN_SM_SECONDARY}>
                                                Use Sample
                                            </button>
                                        </div>
                                    </div>

                                    {/* Resume preview card */}
                                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
                                        <div className="flex items-start justify-between pb-2.5 border-b border-[#E2E8F0]">
                                            <div>
                                                <p className="text-sm font-semibold text-[#0F172A]">{atsCandidate.candidateName}</p>
                                                <p className="text-xs text-[#2563EB] font-medium mt-0.5">{atsCandidate.role}</p>
                                            </div>
                                            {uploadedFileName
                                                ? <SkillBadge variant="green">📄 {uploadedFileName}</SkillBadge>
                                                : <SkillBadge>Sample loaded</SkillBadge>
                                            }
                                        </div>
                                        <div>
                                            <SectionLabel>Skills</SectionLabel>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {atsCandidate.skills.map((s, i) => <SkillBadge key={i}>{s}</SkillBadge>)}
                                            </div>
                                        </div>
                                        <div>
                                            <SectionLabel>Experience</SectionLabel>
                                            {atsCandidate.experience.map((exp, i) => (
                                                <div key={i} className="mt-1.5 text-xs">
                                                    <p className="font-semibold text-[#0F172A]">{exp.title}</p>
                                                    <p className="text-[#64748B]">{exp.company} · {exp.period}</p>
                                                    <ul className="mt-1 space-y-0.5 text-[#64748B] list-disc list-inside">
                                                        {exp.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Analyze CTA */}
                                    <button
                                        onClick={handleRunAtsAnalysis}
                                        disabled={atsLoader.running}
                                        className={`${BTN_PRIMARY} w-full`}
                                    >
                                        {atsLoader.running
                                            ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing…</>
                                            : <>Analyze Resume <IconArrow /></>
                                        }
                                    </button>
                                </div>

                                {/* Right: result panel */}
                                <div className="lg:col-span-6 p-5 sm:p-6 bg-white flex flex-col min-h-[440px]">
                                    {!atsHasAnalyzed && !atsLoader.running && !atsError && (
                                        <EmptyState
                                            icon={<IconChart />}
                                            title="Your ATS report will appear here."
                                            description='Click "Analyze Resume" or use the sample to run the evaluation engine.'
                                        />
                                    )}

                                    {atsLoader.running && (
                                        <StepChecklist title="Analyzing your resume…" steps={ATS_STEPS} currentStep={atsLoader.step} />
                                    )}

                                    {atsError && !atsLoader.running && (
                                        <ErrorState message="Something went wrong while analyzing the document. Please try again." onRetry={handleAtsRetry} />
                                    )}

                                    {atsHasAnalyzed && !atsLoader.running && !atsError && (
                                        <div className="space-y-4 animate-fadeIn flex-1">
                                            {/* Score row */}
                                            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                                                <div>
                                                    <SectionLabel>ATS Score</SectionLabel>
                                                    <div className="flex items-baseline gap-1 mt-1">
                                                        <span className="text-3xl font-bold text-[#0F172A]">87</span>
                                                        <span className="text-sm text-[#64748B]">/ 100</span>
                                                    </div>
                                                    <span className="inline-flex items-center mt-1.5 text-xs font-semibold text-[#16A34A] bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                                                        Excellent compatibility
                                                    </span>
                                                </div>
                                                {/* Semi-circle gauge */}
                                                <div className="relative w-28 h-14 flex items-end justify-center overflow-hidden">
                                                    <svg className="w-28 h-28 -rotate-180" viewBox="0 0 100 100">
                                                        <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
                                                        <path d="M 10,50 A 40,40 0 0,1 90,50" fill="none" stroke="#2563EB" strokeWidth="8" strokeDasharray="125.6" strokeDashoffset="16.3" strokeLinecap="round" />
                                                    </svg>
                                                    <span className="absolute bottom-0 text-xs font-bold text-[#2563EB]">87%</span>
                                                </div>
                                            </div>

                                            {/* Compliance checks */}
                                            <div>
                                                <SectionLabel>Compliance checks</SectionLabel>
                                                <div className="mt-2 grid grid-cols-2 gap-1.5">
                                                    {[
                                                        { ok: true, label: 'Resume structure' },
                                                        { ok: true, label: 'Contact information' },
                                                        { ok: true, label: 'Keyword coverage' },
                                                        { ok: true, label: 'Section formatting' },
                                                        { ok: false, label: 'Quantified achievements' },
                                                        { ok: false, label: 'Technical skill coverage' },
                                                    ].map((item, idx) => (
                                                        <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs font-medium
                                                            ${item.ok ? 'bg-green-50 text-[#16A34A]' : 'bg-amber-50 text-[#D97706]'}`}>
                                                            <span className="font-bold">{item.ok ? '✓' : '⚠'}</span>
                                                            {item.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Improvements */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <SectionLabel>Improvements detected</SectionLabel>
                                                    <span className="text-[11px] font-semibold text-[#D97706] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">3</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {[
                                                        'Add quantitative metrics (e.g. %, $) to quantify impact in your TechNova internship.',
                                                        'Include key missing technical skills: Redux, Next.js, and Jest testing.',
                                                        'Expand on project scope and team collaboration details.',
                                                    ].map((text, i) => (
                                                        <WarningNotice key={i}><span className="font-semibold mr-1">{i + 1}.</span>{text}</WarningNotice>
                                                    ))}
                                                </div>
                                            </div>

                                            <a href="/register" className={`${BTN_PRIMARY} w-full`}>
                                                Improve My Resume <IconArrow />
                                            </a>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-[#E2E8F0] text-center">
                                        <p className="text-[11px] text-[#94A3B8]">Demo mode — results use sample career data.</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ═══════════════ RESUME MATCH ═══════════════ */}
                        {activeTab === 'match' && (
                            <div className="col-span-12 p-5 sm:p-6 space-y-5">
                                {/* Role selector */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                                    <p className="text-xs font-semibold text-[#0F172A] uppercase tracking-widest">Select a role demo</p>
                                    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Target role">
                                        {[
                                            { key: 'frontend', label: 'Frontend Dev' },
                                            { key: 'java', label: 'Java Dev' },
                                            { key: 'backend', label: 'Backend Dev' },
                                            { key: 'fullstack', label: 'Full Stack Dev' },
                                        ].map(role => {
                                            const sel = matchRoleKey === role.key
                                            return (
                                                <button
                                                    key={role.key}
                                                    role="radio"
                                                    aria-checked={sel}
                                                    onClick={() => { setMatchRoleKey(role.key); setMatchHasAnalyzed(false); matchLoader.reset() }}
                                                    className={`h-8 px-3 text-xs font-semibold rounded-[8px] transition-colors duration-200 cursor-pointer
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-1
                                                        ${sel ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:bg-slate-50'}`}
                                                >
                                                    {role.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Two-column comparison */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Resume */}
                                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
                                        <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0]">
                                            <p className="text-sm font-semibold text-[#0F172A]">Your Resume</p>
                                            <SkillBadge variant="blue">Profile loaded</SkillBadge>
                                        </div>
                                        <div className="space-y-2.5 text-xs">
                                            <div>
                                                <SectionLabel>Candidate</SectionLabel>
                                                <p className="mt-1 font-semibold text-[#0F172A]">{currentMatchData.resume.title}</p>
                                            </div>
                                            <div>
                                                <SectionLabel>Skills</SectionLabel>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {currentMatchData.resume.skills.map((s, i) => <SkillBadge key={i}>{s}</SkillBadge>)}
                                                </div>
                                            </div>
                                            <div>
                                                <SectionLabel>Experience</SectionLabel>
                                                <p className="mt-1 text-[#475569]">{currentMatchData.resume.experience}</p>
                                            </div>
                                            <div>
                                                <SectionLabel>Education</SectionLabel>
                                                <p className="mt-1 text-[#475569]">{currentMatchData.resume.education}</p>
                                            </div>
                                            <div>
                                                <SectionLabel>Technologies</SectionLabel>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {currentMatchData.resume.relevantTech.map((t, i) => <SkillBadge key={i} variant="blue">{t}</SkillBadge>)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Job */}
                                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
                                        <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0]">
                                            <p className="text-sm font-semibold text-[#0F172A]">Target Job</p>
                                            <SkillBadge variant="green">Verified listing</SkillBadge>
                                        </div>
                                        <div className="space-y-2.5 text-xs">
                                            <div>
                                                <SectionLabel>Job Title</SectionLabel>
                                                <p className="mt-1 font-semibold text-[#2563EB]">{currentMatchData.job.title}</p>
                                            </div>
                                            <div>
                                                <SectionLabel>Company Type</SectionLabel>
                                                <p className="mt-1 text-[#475569]">{currentMatchData.job.companyType}</p>
                                            </div>
                                            <div>
                                                <SectionLabel>Experience Required</SectionLabel>
                                                <p className="mt-1 text-[#475569]">{currentMatchData.job.experienceReq}</p>
                                            </div>
                                            <div>
                                                <SectionLabel>Technical Requirements</SectionLabel>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {currentMatchData.job.techReqs.map((r, i) => <SkillBadge key={i}>{r}</SkillBadge>)}
                                                </div>
                                            </div>
                                            <div>
                                                <SectionLabel>Preferred Skills</SectionLabel>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {currentMatchData.job.preferredSkills.map((p, i) => <SkillBadge key={i}>{p}</SkillBadge>)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Analyze button */}
                                <button onClick={handleRunMatchAnalysis} disabled={matchLoader.running} className={`${BTN_PRIMARY} w-full`}>
                                    {matchLoader.running
                                        ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Evaluating Match…</>
                                        : <>Analyze Match <IconArrow /></>
                                    }
                                </button>

                                {matchLoader.running && (
                                    <StepChecklist title="Comparing your profile to the job listing…" steps={MATCH_STEPS} currentStep={matchLoader.step} />
                                )}

                                {matchError && !matchLoader.running && (
                                    <ErrorState message="Something went wrong while running the match analysis. Please try again." onRetry={handleMatchRetry} />
                                )}

                                {/* Match results */}
                                {matchHasAnalyzed && !matchLoader.running && !matchError && (
                                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-5 animate-fadeIn">
                                        {/* Score */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <SectionLabel>Job match score</SectionLabel>
                                                <div className="mt-1 text-3xl font-bold text-[#0F172A]">{currentMatchData.matchResult.percent}%</div>
                                            </div>
                                            <span className="text-xs font-semibold text-[#16A34A] bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                                                {currentMatchData.matchResult.tier}
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-[#2563EB] h-full rounded-full transition-all duration-700"
                                                style={{ width: `${currentMatchData.matchResult.percent}%` }}
                                            />
                                        </div>

                                        {/* Skill breakdown */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-3 bg-green-50 border border-green-100 rounded-2xl space-y-1.5">
                                                <p className="text-xs font-semibold text-[#16A34A]">Matched</p>
                                                {currentMatchData.matchResult.matchedSkills.map((sk, i) => (
                                                    <p key={i} className="text-xs text-[#16A34A] flex items-center gap-1">
                                                        <span>✓</span> {sk}
                                                    </p>
                                                ))}
                                            </div>
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5">
                                                <p className="text-xs font-semibold text-[#D97706]">To Improve</p>
                                                {currentMatchData.matchResult.skillsToImprove.map((sk, i) => (
                                                    <p key={i} className="text-xs text-[#D97706] flex items-center gap-1">
                                                        <span>⚠</span> {sk}
                                                    </p>
                                                ))}
                                            </div>
                                            <div className="p-3 bg-red-50 border border-red-100 rounded-2xl space-y-1.5">
                                                <p className="text-xs font-semibold text-red-600">Missing</p>
                                                {currentMatchData.matchResult.missingSkills.map((sk, i) => (
                                                    <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                                                        <span>✕</span> {sk}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Top gaps */}
                                        <div>
                                            <SectionLabel>Top skill gaps to close</SectionLabel>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {currentMatchData.matchResult.topGaps.map((gap, i) => (
                                                    <span key={i} className="text-xs font-medium text-[#475569] bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-[8px]">
                                                        {i + 1}. {gap}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Next step */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                            <div>
                                                <p className="text-sm font-semibold text-[#0F172A]">Ready to close these gaps?</p>
                                                <p className="text-xs text-[#475569] mt-0.5">Build a personalized learning roadmap around the missing skills.</p>
                                            </div>
                                            <a href="/register" className={`${BTN_PRIMARY} whitespace-nowrap flex-shrink-0`}>
                                                Generate Roadmap <IconArrow />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Empty before analysis */}
                                {!matchHasAnalyzed && !matchLoader.running && !matchError && (
                                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl animate-fadeIn">
                                        <EmptyState
                                            icon={<IconSearch />}
                                            title="Select a role and run the analysis."
                                            description="Choose one of the demo profiles and click Analyze Match to see your compatibility score."
                                        />
                                    </div>
                                )}

                                <p className="text-center text-[11px] text-[#94A3B8]">Demo mode — no account required.</p>
                            </div>
                        )}

                        {/* ═══════════════ RESUME ENHANCER ═══════════════ */}
                        {activeTab === 'enhancer' && (
                            <div className="col-span-12 p-5 sm:p-6 space-y-5">
                                {/* Header bar */}
                                <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                                    <p className="text-xs font-semibold text-[#0F172A] uppercase tracking-widest">AI Bullet Point Optimizer</p>
                                    <span className="text-xs font-semibold text-[#16A34A] bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">+48% Impact Boost</span>
                                </div>

                                <WarningNotice>{currentEnhancerData.warningText}</WarningNotice>

                                {enhancerLoading && (
                                    <StepChecklist title="Enhancing your resume bullets…" steps={ENHANCER_STEPS} currentStep={enhancerStep} />
                                )}

                                {enhancerError && !enhancerLoading && (
                                    <ErrorState message="Something went wrong while enhancing the bullets. Please try again." onRetry={() => { setEnhancerError(false); setEnhancerLoading(false) }} />
                                )}

                                {!enhancerLoading && !enhancerError && (
                                    <>
                                        {/* Before / After */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                            {/* Original */}
                                            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
                                                <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0]">
                                                    <p className="text-sm font-semibold text-[#475569]">Original Resume</p>
                                                    <SkillBadge>Basic draft</SkillBadge>
                                                </div>
                                                <div className="space-y-2">
                                                    {currentEnhancerData.originalBullets.map((bullet, idx) => (
                                                        <div key={idx} className="px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-[10px] text-xs text-[#475569] leading-relaxed flex items-start gap-2">
                                                            <span className="text-[#94A3B8] flex-shrink-0">•</span>
                                                            <span>"{bullet}"</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Enhanced */}
                                            <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 space-y-3">
                                                <div className="flex items-center justify-between pb-2.5 border-b border-blue-100">
                                                    <p className="text-sm font-semibold text-[#2563EB]">AI Enhanced Version</p>
                                                    <SkillBadge variant="green">ATS optimized</SkillBadge>
                                                </div>
                                                <div className="space-y-2">
                                                    {currentEnhancerData.enhancedBullets.map((item, idx) => (
                                                        <div key={idx} className="px-3 py-2.5 bg-white border border-blue-100 rounded-[10px] text-xs text-[#0F172A] leading-relaxed space-y-1.5">
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-[#2563EB] flex-shrink-0">⚡</span>
                                                                <span>"{item.text}"</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 pl-4">
                                                                {item.highlights.map((hl, hi) => (
                                                                    <SkillBadge key={hi} variant="blue">+ {hl}</SkillBadge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI improvements + suggestion */}
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-fadeIn">
                                            <div className="md:col-span-7 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-2.5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <IconCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                                                    <SectionLabel>AI improvements applied</SectionLabel>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                                    {currentEnhancerData.aiImprovements.map((imp, idx) => (
                                                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-2 bg-white border border-[#E2E8F0] rounded-[8px] text-xs font-medium text-[#475569]">
                                                            <span className="text-[#16A34A] font-semibold">✓</span> {imp}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="md:col-span-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <span className="text-[#D97706]">💡</span>
                                                        <SectionLabel>Suggestion</SectionLabel>
                                                    </div>
                                                    <p className="text-xs text-[#92400E] leading-relaxed">"{currentEnhancerData.suggestionText}"</p>
                                                </div>
                                                <p className="text-[11px] text-[#B45309] italic">Auto-detected by UpSkillBuddy AI</p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={handleApplyEnhancerSuggestions} disabled={enhancerLoading} className={`${BTN_PRIMARY} w-full sm:flex-1`}>
                                        {enhancerApplied
                                            ? <><IconCheck />Suggestions Applied!</>
                                            : enhancerLoading
                                                ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Enhancing…</>
                                                : <>Apply Suggestions <IconCheck /></>
                                        }
                                    </button>
                                    <button onClick={handleTryAnotherEnhancerExample} className={`${BTN_SECONDARY} w-full sm:flex-1`}>
                                        Try Another Example <IconRefresh />
                                    </button>
                                </div>

                                <p className="text-center text-[11px] text-[#94A3B8]">Demo mode — no account required.</p>
                            </div>
                        )}

                        {/* ═══════════════ MOCK INTERVIEW ═══════════════ */}
                        {activeTab === 'interview' && (
                            <div className="col-span-12 p-5 sm:p-6 space-y-5">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-[6px]">
                                            Mock Interview
                                        </span>
                                        <span className="text-xs font-medium text-[#475569] bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-[6px]">
                                            {currentQuestion.roleTag}
                                        </span>
                                        <span className="text-xs text-[#64748B]">{currentQuestion.questionNumber}</span>
                                    </div>
                                    {/* Progress dots */}
                                    <div className="flex items-center gap-1.5" role="progressbar" aria-label="Question progress">
                                        {[0, 1, 2, 3, 4].map(idx => {
                                            const cur = idx === interviewQuestionIndex
                                            const done = idx < interviewQuestionIndex
                                            return (
                                                <React.Fragment key={idx}>
                                                    <span className={`w-2.5 h-2.5 rounded-full transition-all duration-200
                                                        ${cur ? 'bg-[#2563EB] ring-4 ring-blue-100' : done ? 'bg-[#16A34A]' : 'bg-[#E2E8F0]'}`}
                                                    />
                                                    {idx < 4 && <span className="w-4 h-px bg-[#E2E8F0]" />}
                                                </React.Fragment>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Question card */}
                                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                                    <div>
                                        <SectionLabel>Question prompt</SectionLabel>
                                        <p className="mt-2 text-base font-semibold text-[#0F172A] leading-snug">
                                            "{currentQuestion.questionText}"
                                        </p>
                                    </div>

                                    {/* Mode toggle */}
                                    <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                                        <div className="flex items-center gap-1.5" role="group" aria-label="Answer mode">
                                            {[
                                                { mode: 'type', label: 'Type Answer' },
                                                { mode: 'record', label: '🎤 Record' },
                                            ].map(({ mode, label }) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setInterviewAnswerMode(mode)}
                                                    aria-pressed={interviewAnswerMode === mode}
                                                    className={`h-8 px-3 text-xs font-semibold rounded-[8px] transition-colors duration-200 cursor-pointer
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-1
                                                        ${interviewAnswerMode === mode
                                                            ? 'bg-[#2563EB] text-white'
                                                            : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200'}`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-[11px] text-[#94A3B8]">Simulated response</span>
                                    </div>

                                    {/* Answer area */}
                                    {interviewAnswerMode === 'type' ? (
                                        <textarea
                                            value={userInterviewAnswer}
                                            onChange={e => setUserInterviewAnswer(e.target.value)}
                                            rows={4}
                                            aria-label="Your interview answer"
                                            placeholder="Type your response here…"
                                            className="w-full text-xs p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] text-[#0F172A]
                                                outline-none resize-none leading-relaxed
                                                hover:border-slate-300 transition-colors duration-200
                                                focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:border-transparent focus-visible:bg-white"
                                        />
                                    ) : (
                                        <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] text-center space-y-2">
                                            <div className="w-9 h-9 mx-auto rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center animate-pulse">
                                                <IconMic className="w-4 h-4" />
                                            </div>
                                            <p className="text-xs font-semibold text-[#0F172A]">Voice input simulated</p>
                                            <p className="text-[11px] text-[#64748B]">Click Submit to evaluate the pre-filled answer.</p>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <div className="flex justify-end">
                                        <button onClick={handleRunInterviewEvaluation} disabled={interviewLoader.running} className={BTN_PRIMARY}>
                                            {interviewLoader.running
                                                ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Evaluating…</>
                                                : <>Submit Answer <IconArrow /></>
                                            }
                                        </button>
                                    </div>
                                </div>

                                {interviewLoader.running && (
                                    <div className="bg-white border border-[#E2E8F0] rounded-2xl">
                                        <StepChecklist title="Evaluating your answer…" steps={INTERVIEW_STEPS} currentStep={interviewLoader.step} />
                                    </div>
                                )}

                                {interviewError && !interviewLoader.running && (
                                    <div className="bg-white border border-[#E2E8F0] rounded-2xl">
                                        <ErrorState message="Something went wrong while evaluating your answer. Please try again." onRetry={handleInterviewRetry} />
                                    </div>
                                )}

                                {interviewEvaluated && !interviewLoader.running && !interviewError && (
                                    <div className="space-y-4 animate-fadeIn">
                                        {/* Score */}
                                        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <SectionLabel>AI Interview Score</SectionLabel>
                                                    <div className="mt-1 text-3xl font-bold text-[#2563EB]">{currentQuestion.evaluation.score}</div>
                                                </div>
                                                <span className="text-xs font-semibold text-[#16A34A] bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                                                    Strong Performance
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                                {currentQuestion.evaluation.metrics.map((m, i) => (
                                                    <div key={i} className="p-3 bg-white border border-[#E2E8F0] rounded-[10px] text-center">
                                                        <span className="text-base font-bold text-[#0F172A] block">{m.score}</span>
                                                        <span className="text-[11px] text-[#64748B]">{m.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Feedback */}
                                        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2">
                                            <SectionLabel>AI Feedback</SectionLabel>
                                            <div className="mt-2 space-y-2 text-xs">
                                                <div className="flex items-start gap-2 px-3 py-2.5 bg-green-50 border border-green-100 rounded-[10px] text-[#16A34A] font-medium">
                                                    <span className="font-bold flex-shrink-0">✓</span>
                                                    <span>{currentQuestion.evaluation.feedbackGood}</span>
                                                </div>
                                                <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-[10px] text-[#92400E] font-medium">
                                                    <IconAlert className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0 mt-0.5" />
                                                    <span>{currentQuestion.evaluation.feedbackWarn}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Better answer */}
                                        <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 space-y-2">
                                            <SectionLabel>Suggested better answer</SectionLabel>
                                            <p className="mt-2 text-xs text-[#0F172A] leading-relaxed font-mono bg-white p-3 border border-blue-100 rounded-[8px]">
                                                "{currentQuestion.evaluation.betterAnswer}"
                                            </p>
                                        </div>

                                        {/* Nav */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button onClick={handleNextInterviewQuestion} className={`${BTN_SECONDARY} w-full sm:flex-1`}>
                                                Next Question <IconArrow />
                                            </button>
                                            <button onClick={() => { setInterviewEvaluated(false); interviewLoader.reset() }} className={`${BTN_SECONDARY} w-full sm:flex-1`}>
                                                <IconRefresh /> Try Again
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Bottom CTA */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                                    <div>
                                        <p className="text-sm font-semibold text-[#0F172A]">Want a complete interview session?</p>
                                        <p className="text-xs text-[#475569] mt-0.5">Practice full multi-turn AI interviews with real-time feedback.</p>
                                    </div>
                                    <a href="/register" className={`${BTN_PRIMARY} whitespace-nowrap flex-shrink-0`}>
                                        Start Full Session <IconArrow />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Features
