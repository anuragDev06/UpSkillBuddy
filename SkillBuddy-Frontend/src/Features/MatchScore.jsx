import React, { useState, useRef, useCallback } from "react";
import FeatureAccessLimiter from "../components/FeatureAccessLimiter/FeatureAccessLimiter";
import { analyzeResumeMatch } from "../services/ats.api";

// ─── File validation helper ────────────────────────────────────────────────
const VALID_EXTENSIONS = ["pdf", "docx", "txt"];
const MAX_SIZE_MB = 5;

function validateFile(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!VALID_EXTENSIONS.includes(ext)) {
        return `Invalid file type. Please upload a PDF, DOCX, or TXT file.`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        return `File size exceeds ${MAX_SIZE_MB}MB limit.`;
    }
    return null;
}

// ─── Upload dropzone component ─────────────────────────────────────────────
function ResumeDropzone({ file, onFile, onClear, error, isDragging, onDragOver, onDragLeave, onDrop, inputRef }) {
    return (
        <div className="flex flex-col h-full">
            {/* Dropzone */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`flex-1 border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 ${isDragging
                    ? "border-blue-500 bg-blue-50/60 scale-[1.01]"
                    : file
                        ? "border-emerald-300 bg-emerald-50/40"
                        : "border-slate-200 hover:border-blue-400 bg-slate-50/60"
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                    className="hidden"
                />

                {file ? (
                    <div className="space-y-3">
                        {/* File icon */}
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] mx-auto">{file.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB · Ready</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                        >
                            Remove & choose another
                        </button>
                    </div>
                ) : (
                    <label htmlFor="resume-upload-input" className="cursor-pointer block space-y-3">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Click to upload or drag & drop</p>
                            <p className="text-xs text-slate-500 mt-1">PDF, DOCX, or TXT · Max {MAX_SIZE_MB}MB</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all duration-150 shadow-sm cursor-pointer"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Browse File
                        </button>
                    </label>
                )}
            </div>

            {error && (
                <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Job description panel ─────────────────────────────────────────────────
function JobDescriptionPanel({ mode, setMode, text, setText, file, onFile, onClear, error, fileError,
    isDragging, onDragOver, onDragLeave, onDrop, inputRef }) {
    return (
        <div className="flex flex-col h-full gap-3">
            {/* Mode toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl max-w-xs">
                <button
                    type="button"
                    onClick={() => setMode("text")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${mode === "text"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                >
                    ✍️ Paste Text
                </button>
                <button
                    type="button"
                    onClick={() => setMode("file")}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${mode === "file"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                        }`}
                >
                    📄 Upload File
                </button>
            </div>

            {mode === "text" ? (
                <div className="flex flex-col flex-1 gap-1.5">
                    <textarea
                        rows={10}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:bg-white outline-none focus:border-blue-500 transition-colors resize-none font-mono"
                        placeholder="Paste the full job description here…&#10;&#10;Include requirements, responsibilities, and preferred qualifications for the best match analysis."
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            {text.trim() ? `${text.trim().split(/\s+/).length} words` : "0 words"}
                        </p>
                        {text.trim() && (
                            <button
                                type="button"
                                onClick={() => setText("")}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    {error && (
                        <p className="text-xs font-medium text-rose-600 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </p>
                    )}
                </div>
            ) : (
                /* File upload mode for JD */
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`flex-1 border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${isDragging
                        ? "border-blue-500 bg-blue-50/60 scale-[1.01]"
                        : file
                            ? "border-emerald-300 bg-emerald-50/40"
                            : "border-slate-200 hover:border-blue-400 bg-slate-50/60"
                        }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                        className="hidden"
                    />

                    {file ? (
                        <div className="space-y-3">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 truncate max-w-[200px] mx-auto">{file.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB · Loaded</p>
                            </div>
                            <button type="button" onClick={onClear} className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer">
                                Remove & choose another
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mx-auto">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Upload Job Description</p>
                                <p className="text-xs text-slate-500 mt-1">PDF, DOCX, or TXT · Max {MAX_SIZE_MB}MB</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-all duration-150 shadow-sm cursor-pointer"
                            >
                                Browse File
                            </button>
                        </div>
                    )}

                    {fileError && (
                        <p className="mt-2 text-xs font-medium text-rose-600">{fileError}</p>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main MatchScore page ──────────────────────────────────────────────────
export default function MatchScore() {
    // Resume state
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeError, setResumeError] = useState("");
    const [resumeIsDragging, setResumeIsDragging] = useState(false);
    const resumeInputRef = useRef(null);

    // Job description state
    const [jdMode, setJdMode] = useState("text"); // "text" | "file"
    const [jdText, setJdText] = useState("");
    const [jdFile, setJdFile] = useState(null);
    const [jdTextError, setJdTextError] = useState("");
    const [jdFileError, setJdFileError] = useState("");
    const [jdIsDragging, setJdIsDragging] = useState(false);
    const jdInputRef = useRef(null);

    // Submission state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [result, setResult] = useState(null);

    // ── Resume handlers ──
    const handleResumeFile = useCallback((file) => {
        const err = validateFile(file);
        if (err) { setResumeError(err); return; }
        setResumeError("");
        setResumeFile(file);
    }, []);

    const handleResumeDrop = useCallback((e) => {
        e.preventDefault(); setResumeIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleResumeFile(file);
    }, [handleResumeFile]);

    // ── JD file handlers ──
    const handleJdFile = useCallback((file) => {
        const err = validateFile(file);
        if (err) { setJdFileError(err); return; }
        setJdFileError("");
        setJdFile(file);
    }, []);

    const handleJdDrop = useCallback((e) => {
        e.preventDefault(); setJdIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleJdFile(file);
    }, [handleJdFile]);

    // ── Validate & submit ──
    const handleAnalyze = useCallback(async () => {
        let valid = true;

        if (!resumeFile) {
            setResumeError("Please upload your resume file.");
            valid = false;
        }

        if (jdMode === "text" && !jdText.trim()) {
            setJdTextError("Please paste a job description.");
            valid = false;
        }
        if (jdMode === "file" && !jdFile) {
            setJdFileError("Please upload a job description file.");
            valid = false;
        }

        if (!valid) return;

        setSubmitError("");
        setIsAnalyzing(true);
        setResult(null);

        try {
            const data = await analyzeResumeMatch(resumeFile, jdMode, jdText, jdFile);
            if (!data.success) throw new Error(data.message || 'Analysis failed.');
            setResult(data.data);
        } catch (err) {
            setSubmitError(err.response?.data?.message || err.message || 'Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [resumeFile, jdMode, jdText, jdFile]);

    const handleReset = () => {
        setResumeFile(null); setResumeError("");
        setJdText(""); setJdFile(null);
        setJdTextError(""); setJdFileError("");
        setSubmitError(""); setResult(null);
    };

    return (
        <FeatureAccessLimiter featureName="Match Score">
            <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">

                {/* Header */}
                <div className="text-center sm:text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-600 tracking-wider uppercase mb-3">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Resume Match Analyzer
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Resume ↔ Job Match Score
                    </h1>
                    <p className="text-slate-600 mt-2 text-base max-w-2xl">
                        Upload your resume and provide a job description to get an AI-powered compatibility score, skill gap analysis, and actionable recommendations.
                    </p>
                </div>

                {!result ? (
                    <div className="space-y-6">
                        {/* ── Two-column input grid ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                            {/* Left — Resume Upload */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Your Resume</p>
                                        <p className="text-xs text-slate-500">Upload your resume file to analyze</p>
                                    </div>
                                </div>

                                <ResumeDropzone
                                    file={resumeFile}
                                    onFile={handleResumeFile}
                                    onClear={() => { setResumeFile(null); setResumeError(""); }}
                                    error={resumeError}
                                    isDragging={resumeIsDragging}
                                    onDragOver={(e) => { e.preventDefault(); setResumeIsDragging(true); }}
                                    onDragLeave={() => setResumeIsDragging(false)}
                                    onDrop={handleResumeDrop}
                                    inputRef={resumeInputRef}
                                />
                            </div>

                            {/* Right — Job Description */}
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                                    <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Job Description</p>
                                        <p className="text-xs text-slate-500">Paste text or upload the JD file</p>
                                    </div>
                                </div>

                                <JobDescriptionPanel
                                    mode={jdMode}
                                    setMode={(m) => { setJdMode(m); setJdTextError(""); setJdFileError(""); }}
                                    text={jdText}
                                    setText={setJdText}
                                    file={jdFile}
                                    onFile={handleJdFile}
                                    onClear={() => { setJdFile(null); setJdFileError(""); }}
                                    error={jdTextError}
                                    fileError={jdFileError}
                                    isDragging={jdIsDragging}
                                    onDragOver={(e) => { e.preventDefault(); setJdIsDragging(true); }}
                                    onDragLeave={() => setJdIsDragging(false)}
                                    onDrop={handleJdDrop}
                                    inputRef={jdInputRef}
                                />
                            </div>
                        </div>

                        {/* Ready indicator */}
                        {(resumeFile && (jdText.trim() || jdFile)) && (
                            <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm font-semibold text-emerald-800">
                                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Both inputs ready — click Analyze Match to get your compatibility score.
                            </div>
                        )}

                        {/* Global submit error */}
                        {submitError && (
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
                                <svg className="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{submitError}</span>
                            </div>
                        )}

                        {/* Analyze CTA */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className={`w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all duration-150 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer ${isAnalyzing ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Analyzing Match…
                                    </>
                                ) : (
                                    <>
                                        <span>Analyze Match</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── Results Panel ── */
                    <div className="space-y-6">

                        {/* Score hero */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                {/* Circular score */}
                                <div className="relative flex-shrink-0">
                                    <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                                        <circle
                                            cx="60" cy="60" r="52" fill="none"
                                            stroke={result.matchScore >= 70 ? '#22c55e' : result.matchScore >= 50 ? '#f59e0b' : '#ef4444'}
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(result.matchScore / 100) * 327} 327`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-extrabold text-slate-900">{result.matchScore}</span>
                                        <span className="text-xs font-semibold text-slate-500">/ 100</span>
                                    </div>
                                </div>
                                {/* Verdict & summary */}
                                <div className="flex-1 text-center sm:text-left">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold mb-3 ${
                                        result.matchScore >= 85 ? 'bg-emerald-100 text-emerald-700' :
                                        result.matchScore >= 70 ? 'bg-blue-100 text-blue-700' :
                                        result.matchScore >= 50 ? 'bg-amber-100 text-amber-700' :
                                        'bg-rose-100 text-rose-700'
                                    }`}>{result.verdict}</span>
                                    <p className="text-slate-600 text-sm leading-relaxed">{result.summary}</p>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown bars */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <h2 className="text-base font-bold text-slate-900 mb-5">Score Breakdown</h2>
                            <div className="space-y-4">
                                {Object.entries(result.breakdown).map(([key, val]) => {
                                    const labels = { skills: 'Skills Match', experience: 'Experience', education: 'Education', keywords: 'Keyword Density', roleAlignment: 'Role Alignment' };
                                    const pct = Math.round((val.score / val.max) * 100);
                                    return (
                                        <div key={key}>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-sm font-semibold text-slate-700">{labels[key] || key}</span>
                                                <span className="text-sm font-bold text-slate-900">{val.score}<span className="text-slate-400 font-normal">/{val.max}</span></span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full transition-all duration-700 ${
                                                        pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                                    }`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            {val.details && <p className="text-xs text-slate-500 mt-1">{val.details}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Skills matched / missing */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span>
                                    Matched Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {result.breakdown.skills.matched.length > 0
                                        ? result.breakdown.skills.matched.map((s) => (
                                            <span key={s} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">{s}</span>
                                          ))
                                        : <p className="text-xs text-slate-400">No matched skills found.</p>
                                    }
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs">✕</span>
                                    Missing Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {result.breakdown.skills.missing.length > 0
                                        ? result.breakdown.skills.missing.map((s) => (
                                            <span key={s} className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">{s}</span>
                                          ))
                                        : <p className="text-xs text-slate-400">No skill gaps found.</p>
                                    }
                                </div>
                            </div>
                        </div>

                        {/* Strengths, Gaps, Recommendations */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {[
                                { label: 'Strengths', items: result.strengths, color: 'emerald', icon: '💪' },
                                { label: 'Gaps',      items: result.gaps,      color: 'rose',    icon: '⚠️' },
                                { label: 'Recommendations', items: result.recommendations, color: 'blue', icon: '💡' },
                            ].map(({ label, items, color, icon }) => (
                                <div key={label} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                    <h2 className="text-base font-bold text-slate-900 mb-4">{icon} {label}</h2>
                                    <ul className="space-y-2">
                                        {items.length > 0
                                            ? items.map((item, i) => (
                                                <li key={i} className={`flex items-start gap-2 text-xs text-slate-700 bg-${color}-50 border border-${color}-100 rounded-xl px-3 py-2`}>
                                                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full bg-${color}-400 flex-shrink-0`} />
                                                    {item}
                                                </li>
                                              ))
                                            : <li className="text-xs text-slate-400">None reported.</li>
                                        }
                                    </ul>
                                </div>
                            ))}
                        </div>

                        {/* Reset button */}
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all duration-150 shadow-md cursor-pointer flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Analyze Another
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </FeatureAccessLimiter>
    );
}
