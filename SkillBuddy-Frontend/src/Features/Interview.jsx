import React, { useState, useRef, useCallback } from "react";
import FeatureAccessLimiter from "../components/FeatureAccessLimiter/FeatureAccessLimiter";
import { startInterviewSession, evaluateInterviewAnswer } from "../services/ats.api.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const VALID_EXTENSIONS = ["pdf", "docx", "txt"];
const MAX_SIZE_MB = 5;

const INTERVIEW_TYPES = [
    { key: "technical",  label: "Technical",    emoji: "💻", desc: "DSA, system design, coding" },
    { key: "behavioral", label: "Behavioral",   emoji: "🧠", desc: "Situational, culture fit" },
    { key: "hr",         label: "HR Round",     emoji: "🤝", desc: "Background, goals, salary" },
    { key: "mixed",      label: "Mixed Round",  emoji: "⚡", desc: "Technical + behavioral blend" },
];

const DIFFICULTY_LEVELS = [
    { key: "entry",  label: "Entry Level",  color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { key: "mid",    label: "Mid Level",    color: "text-blue-600 bg-blue-50 border-blue-200" },
    { key: "senior", label: "Senior Level", color: "text-violet-600 bg-violet-50 border-violet-200" },
];

const GRADE_COLORS = {
    A: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
    B: { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-300" },
    C: { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-300" },
    D: { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-300" },
    F: { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-300" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function validateFile(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (!VALID_EXTENSIONS.includes(ext)) return `Invalid type. Use PDF, DOCX, or TXT.`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File exceeds ${MAX_SIZE_MB}MB limit.`;
    return null;
}

// ─── Shared Sub-components ────────────────────────────────────────────────────
function ColumnCard({ icon, iconBg, title, subtitle, required, children }) {
    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4 h-full">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-900">{title}</p>
                        {required && (
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-full">Required</span>
                        )}
                        {!required && (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full">Optional</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function FileDropzone({ file, onFile, onClear, error, isDragging, onDragOver, onDragLeave, onDrop, inputId, inputRef, accentColor = "blue" }) {
    const colors = {
        blue:  { ring: "border-blue-500 bg-blue-50/60", icon: "bg-blue-50 text-blue-600", btn: "bg-blue-600 hover:bg-blue-700" },
        green: { ring: "border-emerald-500 bg-emerald-50/60", icon: "bg-emerald-50 text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-600" },
    };
    const c = colors[accentColor];

    return (
        <div className="flex flex-col flex-1 gap-2">
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`flex-1 border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-200 ${
                    isDragging ? c.ring + " scale-[1.01]"
                    : file     ? "border-emerald-300 bg-emerald-50/40"
                               : "border-slate-200 hover:border-slate-300 bg-slate-50/60"
                }`}
            >
                <input ref={inputRef} id={inputId} type="file" accept=".pdf,.docx,.txt"
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
                            <p className="text-sm font-bold text-slate-800 truncate max-w-[160px] mx-auto">{file.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB · Ready</p>
                        </div>
                        <button type="button" onClick={onClear} className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer">
                            Remove file
                        </button>
                    </div>
                ) : (
                    <label htmlFor={inputId} className="cursor-pointer block space-y-2.5">
                        <div className={`w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center mx-auto shadow-sm`}>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">Drag & drop or click to upload</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">PDF, DOCX, TXT · Max {MAX_SIZE_MB}MB</p>
                        </div>
                        <button type="button" onClick={() => inputRef.current?.click()}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${c.btn} text-white rounded-lg text-xs font-semibold transition-all duration-150 shadow-sm cursor-pointer`}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Browse File
                        </button>
                    </label>
                )}
            </div>
            {error && (
                <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

// ─── Interview Session UI ─────────────────────────────────────────────────────
function InterviewSession({ session, onReset }) {
    const questions = session?.data?.questions || [];
    const totalQuestions = questions.length;

    const [currentIndex, setCurrentIndex]     = useState(0);
    const [answer, setAnswer]                 = useState("");
    const [isEvaluating, setIsEvaluating]     = useState(false);
    const [evalError, setEvalError]           = useState("");
    const [evaluations, setEvaluations]       = useState({}); // { [questionIndex]: evaluation }
    const [showHint, setShowHint]             = useState(false);
    const [interviewDone, setInterviewDone]   = useState(false);

    const currentQuestion = questions[currentIndex];
    const currentEval     = evaluations[currentIndex];
    const answeredCount   = Object.keys(evaluations).length;

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) { setEvalError("Please write your answer before submitting."); return; }
        setEvalError("");
        setIsEvaluating(true);
        try {
            const result = await evaluateInterviewAnswer(
                currentQuestion.question,
                answer,
                currentQuestion.type,
                currentQuestion.difficulty
            );
            setEvaluations(prev => ({ ...prev, [currentIndex]: result.data }));
        } catch (err) {
            setEvalError(err.response?.data?.message || "Failed to evaluate. Please try again.");
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(i => i + 1);
            setAnswer("");
            setShowHint(false);
            setEvalError("");
        } else {
            setInterviewDone(true);
        }
    };

    const avgScore = answeredCount > 0
        ? Math.round(Object.values(evaluations).reduce((s, e) => s + (e?.score || 0), 0) / answeredCount)
        : 0;

    // ── Results Screen ─────────────────────────────────────────────────────────
    if (interviewDone) {
        const gradeForScore = (s) => s >= 9 ? "A" : s >= 7 ? "B" : s >= 5 ? "C" : s >= 3 ? "D" : "F";
        const overallGrade = gradeForScore(avgScore);
        const gc = GRADE_COLORS[overallGrade] || GRADE_COLORS.F;

        return (
            <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-4 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900">Interview Complete! 🎉</h2>
                    <p className="text-slate-500 mt-2">Here's your performance summary across all {totalQuestions} questions.</p>
                </div>

                {/* Score summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                        <p className="text-3xl font-extrabold text-indigo-600">{avgScore}<span className="text-base text-slate-400">/10</span></p>
                        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Avg Score</p>
                    </div>
                    <div className={`border rounded-2xl p-5 text-center shadow-sm ${gc.bg} ${gc.border}`}>
                        <p className={`text-3xl font-extrabold ${gc.text}`}>{overallGrade}</p>
                        <p className={`text-xs font-semibold mt-1 uppercase tracking-wide ${gc.text} opacity-70`}>Overall Grade</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                        <p className="text-3xl font-extrabold text-emerald-600">{answeredCount}<span className="text-base text-slate-400">/{totalQuestions}</span></p>
                        <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">Answered</p>
                    </div>
                </div>

                {/* Per-question breakdown */}
                <div className="space-y-4">
                    <h3 className="text-base font-bold text-slate-800">Question-by-Question Breakdown</h3>
                    {questions.map((q, i) => {
                        const ev = evaluations[i];
                        const g  = ev ? (GRADE_COLORS[ev.grade] || GRADE_COLORS.F) : null;
                        return (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                        <p className="text-sm font-semibold text-slate-800 leading-snug">{q.question}</p>
                                    </div>
                                    {ev && (
                                        <span className={`px-3 py-1 rounded-xl text-xs font-bold flex-shrink-0 border ${g.bg} ${g.text} ${g.border}`}>
                                            {ev.score}/10 · {ev.grade}
                                        </span>
                                    )}
                                </div>
                                {ev && (
                                    <div className="pl-10 space-y-2">
                                        <p className="text-xs text-slate-600">{ev.feedback}</p>
                                        {ev.modelAnswer && (
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Model Answer</p>
                                                <p className="text-xs text-slate-700 leading-relaxed">{ev.modelAnswer}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {!ev && (
                                    <p className="pl-10 text-xs text-slate-400 italic">Not answered</p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center pt-2">
                    <button type="button" onClick={onReset}
                        className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-sm transition-all duration-150 shadow-lg cursor-pointer flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Start New Interview
                    </button>
                </div>
            </div>
        );
    }

    // ── Active Question Screen ─────────────────────────────────────────────────
    const progress = ((currentIndex) / totalQuestions) * 100;
    const gc2 = currentEval ? (GRADE_COLORS[currentEval.grade] || GRADE_COLORS.F) : null;

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6 animate-fade-in">
            {/* Progress bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Question {currentIndex + 1} of {totalQuestions}</span>
                    <span className="text-indigo-600">{answeredCount} answered</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {currentIndex + 1}
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                {currentQuestion?.type || "technical"}
                            </span>
                            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                {currentQuestion?.difficulty || "mid"}
                            </span>
                        </div>
                        <p className="text-base font-semibold text-slate-900 leading-relaxed">
                            {currentQuestion?.question}
                        </p>
                    </div>
                </div>

                {/* Hint toggle */}
                {currentQuestion?.hint && !currentEval && (
                    <div>
                        <button type="button" onClick={() => setShowHint(h => !h)}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline cursor-pointer flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            {showHint ? "Hide Hint" : "Show Hint"}
                        </button>
                        {showHint && (
                            <div className="mt-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 leading-relaxed">
                                💡 {currentQuestion.hint}
                            </div>
                        )}
                    </div>
                )}

                {/* Answer area — shown only if not yet evaluated */}
                {!currentEval && (
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Your Answer</label>
                        <textarea
                            rows={6}
                            value={answer}
                            onChange={(e) => { setAnswer(e.target.value); if (evalError) setEvalError(""); }}
                            disabled={isEvaluating}
                            placeholder="Type your answer here… Be specific, use examples, and explain your thinking."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:bg-white outline-none focus:border-indigo-400 transition-colors resize-none disabled:opacity-60"
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] text-slate-400">
                                {answer.trim() ? `${answer.trim().split(/\s+/).filter(Boolean).length} words` : "Write a detailed answer"}
                            </p>
                            {evalError && (
                                <p className="text-[11px] font-medium text-rose-600">{evalError}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleSubmitAnswer}
                            disabled={isEvaluating || !answer.trim()}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-sm transition-all duration-150 shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isEvaluating ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Evaluating your answer…
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Submit Answer
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Evaluation result */}
                {currentEval && gc2 && (
                    <div className="space-y-4 animate-fade-in">
                        {/* Score badge */}
                        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${gc2.bg} ${gc2.border}`}>
                            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 ${gc2.border} ${gc2.bg} flex-shrink-0`}>
                                <span className={`text-xl font-extrabold leading-none ${gc2.text}`}>{currentEval.grade}</span>
                                <span className={`text-[10px] font-bold ${gc2.text} opacity-70`}>{currentEval.score}/10</span>
                            </div>
                            <p className={`text-sm font-medium leading-relaxed ${gc2.text}`}>{currentEval.feedback}</p>
                        </div>

                        {/* Strengths */}
                        {currentEval.strengths?.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">✅ Strengths</p>
                                <ul className="space-y-1">
                                    {currentEval.strengths.map((s, i) => (
                                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Improvements */}
                        {currentEval.improvements?.length > 0 && (
                            <div>
                                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">⚡ Areas to Improve</p>
                                <ul className="space-y-1">
                                    {currentEval.improvements.map((s, i) => (
                                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Model answer */}
                        {currentEval.modelAnswer && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">💡 Model Answer</p>
                                <p className="text-xs text-slate-700 leading-relaxed">{currentEval.modelAnswer}</p>
                            </div>
                        )}

                        {/* Next button */}
                        <button
                            type="button"
                            onClick={handleNext}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-sm transition-all duration-150 shadow-md cursor-pointer flex items-center justify-center gap-2"
                        >
                            {currentIndex < totalQuestions - 1 ? (
                                <>
                                    Next Question
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    View Results
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Quit button */}
            <div className="flex justify-center">
                <button type="button" onClick={onReset}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline cursor-pointer transition-colors">
                    Quit & Start Over
                </button>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Interview() {
    // ── Resume ──
    const [resumeFile, setResumeFile]       = useState(null);
    const [resumeError, setResumeError]     = useState("");
    const [resumeDrag, setResumeDrag]       = useState(false);
    const resumeRef = useRef(null);

    // ── Job Description ──
    const [jdMode, setJdMode]               = useState("text");
    const [jdText, setJdText]               = useState("");
    const [jdFile, setJdFile]               = useState(null);
    const [jdTextError, setJdTextError]     = useState("");
    const [jdFileError, setJdFileError]     = useState("");
    const [jdDrag, setJdDrag]               = useState(false);
    const jdRef = useRef(null);

    // ── Settings ──
    const [companyName, setCompanyName]     = useState("");
    const [interviewType, setInterviewType] = useState("technical");
    const [difficulty, setDifficulty]       = useState("mid");
    const [questionCount, setQuestionCount] = useState(5);

    // ── Submit ──
    const [isStarting, setIsStarting]       = useState(false);
    const [submitError, setSubmitError]     = useState("");
    const [session, setSession]             = useState(null);

    // ── Resume handlers ──
    const handleResumeFile = useCallback((file) => {
        const err = validateFile(file);
        if (err) { setResumeError(err); return; }
        setResumeError(""); setResumeFile(file);
    }, []);

    const handleResumeDrop = useCallback((e) => {
        e.preventDefault(); setResumeDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleResumeFile(f);
    }, [handleResumeFile]);

    // ── JD handlers ──
    const handleJdFile = useCallback((file) => {
        const err = validateFile(file);
        if (err) { setJdFileError(err); return; }
        setJdFileError(""); setJdFile(file);
    }, []);

    const handleJdDrop = useCallback((e) => {
        e.preventDefault(); setJdDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleJdFile(f);
    }, [handleJdFile]);

    // ── Readiness check ──
    const isReady = resumeFile && (jdMode === "text" ? jdText.trim().length > 20 : jdFile);

    // ── Submit ──
    const handleStart = useCallback(async () => {
        let valid = true;
        if (!resumeFile) { setResumeError("Please upload your resume."); valid = false; }
        if (jdMode === "text" && jdText.trim().length < 20) { setJdTextError("Please enter at least 20 characters."); valid = false; }
        if (jdMode === "file" && !jdFile) { setJdFileError("Please upload a job description file."); valid = false; }
        if (!valid) return;

        setSubmitError(""); setIsStarting(true);
        try {
            const result = await startInterviewSession(
                resumeFile,
                jdMode,
                jdMode === "text" ? jdText : undefined,
                jdMode === "file" ? jdFile : undefined,
                { interviewType, difficulty, questionCount, companyName }
            );
            setSession(result);
        } catch (err) {
            setSubmitError(err.response?.data?.message || "Failed to start session. Please try again.");
        } finally {
            setIsStarting(false);
        }
    }, [resumeFile, jdMode, jdText, jdFile, companyName, interviewType, difficulty, questionCount]);

    const handleReset = () => {
        setResumeFile(null); setResumeError("");
        setJdText(""); setJdFile(null); setJdTextError(""); setJdFileError("");
        setCompanyName(""); setInterviewType("technical"); setDifficulty("mid"); setQuestionCount(5);
        setSubmitError(""); setSession(null);
    };

    // ── If session is active, show the Interview Session UI ──
    if (session) {
        return (
            <FeatureAccessLimiter featureName="Mock Interview">
                <InterviewSession session={session} onReset={handleReset} />
            </FeatureAccessLimiter>
        );
    }

    return (
        <FeatureAccessLimiter featureName="Mock Interview">
            <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">

                {/* ── Page Header ── */}
                <div className="text-center sm:text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold text-indigo-600 tracking-wider uppercase mb-3">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        AI Mock Interview
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Practice Your Interview
                    </h1>
                    <p className="text-slate-600 mt-2 text-base max-w-2xl">
                        Upload your resume and a job description to get AI-tailored interview questions with real-time evaluation and feedback.
                    </p>
                </div>

                {/* ── Progress Steps ── */}
                <div className="flex items-center gap-0 overflow-x-auto">
                    {[
                        { n: "1", label: "Upload Resume",     done: !!resumeFile },
                        { n: "2", label: "Job Description",   done: jdMode === "text" ? jdText.trim().length > 20 : !!jdFile },
                        { n: "3", label: "Configure Session", done: true },
                        { n: "4", label: "Start Interview",   done: false },
                    ].map((step, i, arr) => (
                        <React.Fragment key={i}>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                                    step.done
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : "bg-white border-slate-200 text-slate-400"
                                }`}>
                                    {step.done
                                        ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        : step.n
                                    }
                                </div>
                                <span className={`text-xs font-semibold whitespace-nowrap ${step.done ? "text-emerald-600" : "text-slate-400"}`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < arr.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 min-w-[24px] rounded-full transition-colors duration-300 ${step.done ? "bg-emerald-300" : "bg-slate-200"}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* ── Three-Column Input Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                    {/* ── Column 1: Resume Upload ── */}
                    <ColumnCard
                        required
                        title="Your Resume"
                        subtitle="Upload your latest resume"
                        iconBg="bg-blue-50"
                        icon={
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        }
                    >
                        <FileDropzone
                            file={resumeFile}
                            onFile={handleResumeFile}
                            onClear={() => { setResumeFile(null); setResumeError(""); }}
                            error={resumeError}
                            isDragging={resumeDrag}
                            onDragOver={(e) => { e.preventDefault(); setResumeDrag(true); }}
                            onDragLeave={() => setResumeDrag(false)}
                            onDrop={handleResumeDrop}
                            inputId="resume-upload"
                            inputRef={resumeRef}
                            accentColor="blue"
                        />
                        <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl mt-1">
                            <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-[11px] text-blue-700 leading-relaxed">
                                Questions will be tailored to your experience, skills, and projects.
                            </p>
                        </div>
                    </ColumnCard>

                    {/* ── Column 2: Job Description ── */}
                    <ColumnCard
                        required
                        title="Job Description"
                        subtitle="Paste text or upload JD file"
                        iconBg="bg-violet-50"
                        icon={
                            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                    >
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button type="button" onClick={() => { setJdMode("text"); setJdTextError(""); setJdFileError(""); }}
                                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${jdMode === "text" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                                ✍️ Paste Text
                            </button>
                            <button type="button" onClick={() => { setJdMode("file"); setJdTextError(""); setJdFileError(""); }}
                                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${jdMode === "file" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                                📄 Upload File
                            </button>
                        </div>

                        {jdMode === "text" ? (
                            <div className="flex flex-col gap-1.5 flex-1">
                                <textarea
                                    rows={8}
                                    value={jdText}
                                    onChange={(e) => { setJdText(e.target.value); if (jdTextError) setJdTextError(""); }}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white outline-none focus:border-violet-400 transition-colors resize-none font-mono"
                                    placeholder={"Paste the job description here…\n\nInclude role, responsibilities,\nrequired skills and qualifications\nfor best-tailored questions."}
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] text-slate-400">
                                        {jdText.trim() ? `${jdText.trim().split(/\s+/).filter(Boolean).length} words` : "Min. 20 characters"}
                                    </p>
                                    {jdText && (
                                        <button type="button" onClick={() => setJdText("")}
                                            className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 underline cursor-pointer">
                                            Clear
                                        </button>
                                    )}
                                </div>
                                {jdTextError && (
                                    <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                                        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {jdTextError}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <FileDropzone
                                file={jdFile}
                                onFile={handleJdFile}
                                onClear={() => { setJdFile(null); setJdFileError(""); }}
                                error={jdFileError}
                                isDragging={jdDrag}
                                onDragOver={(e) => { e.preventDefault(); setJdDrag(true); }}
                                onDragLeave={() => setJdDrag(false)}
                                onDrop={handleJdDrop}
                                inputId="jd-upload"
                                inputRef={jdRef}
                                accentColor="blue"
                            />
                        )}
                    </ColumnCard>

                    {/* ── Column 3: Interview Settings ── */}
                    <ColumnCard
                        title="Interview Settings"
                        subtitle="Configure your session"
                        iconBg="bg-amber-50"
                        icon={
                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                    >
                        <div className="space-y-5 flex-1">
                            {/* Company Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                                    Company Name
                                    <span className="text-[10px] font-normal text-slate-400 normal-case tracking-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. Google, Infosys, Startup..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white outline-none focus:border-amber-400 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Interview Type */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">Interview Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {INTERVIEW_TYPES.map((type) => (
                                        <button
                                            key={type.key}
                                            type="button"
                                            onClick={() => setInterviewType(type.key)}
                                            className={`p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                                                interviewType === type.key
                                                    ? "border-indigo-300 bg-indigo-50 shadow-sm"
                                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-base leading-none">{type.emoji}</span>
                                                <span className={`text-xs font-bold ${interviewType === type.key ? "text-indigo-700" : "text-slate-700"}`}>
                                                    {type.label}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 leading-tight">{type.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty Level */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">Difficulty Level</label>
                                <div className="flex gap-2">
                                    {DIFFICULTY_LEVELS.map((d) => (
                                        <button
                                            key={d.key}
                                            type="button"
                                            onClick={() => setDifficulty(d.key)}
                                            className={`flex-1 py-2 px-2 rounded-xl border text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                                difficulty === d.key ? d.color + " shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                            }`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Question Count */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Questions</label>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                                        {questionCount} Questions
                                    </span>
                                </div>
                                <input
                                    type="range" min={3} max={15} step={1} value={questionCount}
                                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                    <span>3 Quick</span>
                                    <span>15 Full</span>
                                </div>
                            </div>
                        </div>
                    </ColumnCard>
                </div>

                {/* ── Session Summary Card ── */}
                {isReady && (
                    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Session Ready</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="text-[11px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-medium capitalize">
                                        {INTERVIEW_TYPES.find(t => t.key === interviewType)?.emoji} {interviewType}
                                    </span>
                                    <span className="text-[11px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-medium capitalize">
                                        {DIFFICULTY_LEVELS.find(d => d.key === difficulty)?.label}
                                    </span>
                                    <span className="text-[11px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-medium">
                                        {questionCount} Questions
                                    </span>
                                    {companyName && (
                                        <span className="text-[11px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg font-medium">
                                            🏢 {companyName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Error ── */}
                {submitError && (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-800">
                        <svg className="w-5 h-5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{submitError}</span>
                    </div>
                )}

                {/* ── CTA ── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <button type="button" onClick={handleReset}
                        className="w-full sm:w-auto px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={handleStart}
                        disabled={isStarting}
                        className={`w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-sm transition-all duration-150 shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer ${isStarting ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {isStarting ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Generating Questions…
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                                Start Mock Interview
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </FeatureAccessLimiter>
    );
}
