import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { getDashboardOverview } from "../services/ats.api";

export default function UserDashboard() {
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOverview = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getDashboardOverview();
            if (res && res.success && res.data) {
                setOverview(res.data);
            } else {
                setError(res?.message || "Failed to load dashboard overview.");
            }
        } catch (err) {
            console.error("Dashboard overview fetch error:", err);
            setError(err.response?.data?.message || "Failed to load your dashboard data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverview();
    }, []);

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return "";
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", ring: "stroke-emerald-500" };
        if (score >= 60) return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", ring: "stroke-blue-500" };
        if (score >= 40) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "stroke-amber-500" };
        return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", ring: "stroke-rose-500" };
    };

    // ── Skeleton Loader ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
                        <div className="h-4 w-96 bg-slate-100 rounded-lg" />
                    </div>
                    <div className="h-10 w-36 bg-slate-200 rounded-xl" />
                </div>

                {/* Quick stats skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
                    ))}
                </div>

                {/* Main cards skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-slate-100 rounded-3xl" />
                    <div className="h-80 bg-slate-100 rounded-3xl" />
                </div>
            </div>
        );
    }

    // ── Error State ──────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Unable to Load Dashboard</h3>
                <p className="text-sm text-slate-500">{error}</p>
                <button
                    onClick={fetchOverview}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry
                </button>
            </div>
        );
    }

    const user = overview?.user || {};
    const lastResume = overview?.lastResumeScan;
    const activeInterview = overview?.activeInterview;
    const stats = overview?.stats || {};

    const resumeScoreColors = lastResume ? getScoreColor(lastResume.atsScore) : null;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 space-y-8 animate-fade-in">
            {/* ── Top Header Banner ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
                <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[11px] font-bold text-indigo-700 tracking-wider uppercase mb-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        Personalized Career Hub
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Welcome back, {user.username || "Candidate"} 👋
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Track your resume performance and seamlessly continue your interview preparation.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/atsScore"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Scan Resume
                    </Link>
                    <Link
                        to="/mockInterview"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        New Interview
                    </Link>
                </div>
            </div>

            {/* ── Quick Stats Metric Strip ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <p className="text-xs font-medium text-slate-400">Total Interviews</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalInterviews ?? 0}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Sessions initiated</p>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <p className="text-xs font-medium text-slate-400">Completed</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completedInterviews ?? 0}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Fully evaluated</p>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <p className="text-xs font-medium text-slate-400">Average Interview Score</p>
                    <p className="text-2xl font-black text-indigo-600 mt-1">
                        {stats.averageInterviewScore !== null ? `${stats.averageInterviewScore}%` : "—"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Across completed rounds</p>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <p className="text-xs font-medium text-slate-400">Current ATS Score</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">
                        {lastResume ? `${lastResume.atsScore}/100` : "—"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Latest resume version</p>
                </div>
            </div>

            {/* ── Main Feature Grid (2 Cards) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* ── CARD 1: LAST UPLOADED RESUME & ATS SCORE ── */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Latest Resume & ATS Score</h2>
                                    <p className="text-xs text-slate-400">Applicant Tracking System audit breakdown</p>
                                </div>
                            </div>
                            {lastResume && (
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${resumeScoreColors.bg} ${resumeScoreColors.text} ${resumeScoreColors.border}`}>
                                    {lastResume.status || "Evaluated"}
                                </span>
                            )}
                        </div>

                        {lastResume ? (
                            <div className="mt-6 space-y-6">
                                {/* Resume file & Score badge */}
                                <div className="flex items-center justify-between p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate max-w-[220px]">
                                                {lastResume.fileName}
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {formatDate(lastResume.scannedAt)} {lastResume.fileSize ? `· ${formatFileSize(lastResume.fileSize)}` : ""}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Score display */}
                                    <div className="text-right flex-shrink-0">
                                        <span className={`text-2xl font-black ${resumeScoreColors.text}`}>
                                            {lastResume.atsScore}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-400">/100</span>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ATS Score</p>
                                    </div>
                                </div>

                                {/* Summary */}
                                {lastResume.summary && (
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Summary Assessment</p>
                                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                            {lastResume.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Strengths & Areas to Improve Preview */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {lastResume.strengths?.length > 0 && (
                                        <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1.5">
                                            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Top Strength</p>
                                            <p className="text-xs text-emerald-950 font-medium line-clamp-2">
                                                {lastResume.strengths[0]}
                                            </p>
                                        </div>
                                    )}
                                    {lastResume.improvements?.length > 0 && (
                                        <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl space-y-1.5">
                                            <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Key Recommendation</p>
                                            <p className="text-xs text-amber-950 font-medium line-clamp-2">
                                                {lastResume.improvements[0]}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="my-8 text-center space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800">No Resume Analyzed Yet</h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Upload your resume to check its ATS compatibility score and get tailored keyword & formatting tips.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                        <Link
                            to="/atsScore"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                        >
                            {lastResume ? "Audit Another Resume →" : "Scan Resume Now →"}
                        </Link>
                        {lastResume && (
                            <span className="text-[11px] text-slate-400">
                                Scanned {formatDate(lastResume.scannedAt)}
                            </span>
                        )}
                    </div>
                </div>

                {/* ── CARD 2: MOCK INTERVIEW JOURNEY (RESUME CAPABILITY) ── */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Mock Interview Journey</h2>
                                    <p className="text-xs text-slate-400">Continue right where you left off</p>
                                </div>
                            </div>
                            {activeInterview && (
                                <span
                                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                                        activeInterview.status === "in-progress"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    }`}
                                >
                                    {activeInterview.status === "in-progress" && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    )}
                                    {activeInterview.status === "in-progress" ? "In Progress" : "Completed"}
                                </span>
                            )}
                        </div>

                        {activeInterview ? (
                            <div className="mt-6 space-y-6">
                                {/* Title and details */}
                                <div className="p-4 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-slate-900">
                                            {activeInterview.title}
                                        </h3>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-200/60 text-slate-700 rounded-md">
                                            {activeInterview.difficulty}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {activeInterview.companyName ? `Targeting: ${activeInterview.companyName} · ` : ""}
                                        Round type: <span className="capitalize font-medium text-slate-700">{activeInterview.interviewType}</span>
                                    </p>
                                </div>

                                {/* Progress Bar & Status */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-slate-700">
                                            {activeInterview.status === "in-progress" ? "Current Step" : "Result"}
                                        </span>
                                        <span className="font-bold text-indigo-600">
                                            {activeInterview.answeredCount} of {activeInterview.totalQuestions} Questions Answered ({activeInterview.progressPercentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min(activeInterview.progressPercentage, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 flex items-center justify-between">
                                        <span>
                                            {activeInterview.status === "in-progress"
                                                ? `Paused at Question ${activeInterview.currentIndex + 1}`
                                                : `Final Score: ${activeInterview.overallScore ?? "—"}%`}
                                        </span>
                                        <span>Last active: {formatDate(activeInterview.lastActiveAt)}</span>
                                    </p>
                                </div>

                                {/* Big CTA Button */}
                                <div>
                                    {activeInterview.status === "in-progress" ? (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/mockInterview?session=${activeInterview.sessionId}`)}
                                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <span>Resume Interview</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/mockInterview?session=${activeInterview.sessionId}`)}
                                            className="w-full py-3 bg-white border border-indigo-200 hover:border-indigo-300 text-indigo-600 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <span>Review Session Feedback</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="my-8 text-center space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800">No Interview Journey Started</h3>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    Prepare for your dream role with tailored technical, behavioral, and HR questions with instant AI feedback.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                        <Link
                            to="/mockInterview"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                        >
                            Start New Interview →
                        </Link>
                        {activeInterview && (
                            <span className="text-[11px] text-slate-400">
                                Total: {activeInterview.totalQuestions} questions
                            </span>
                        )}
                    </div>
                </div>

            </div>

            {/* ── Quick Exploration Cards ── */}
            <div className="pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Other Career Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        to="/matchScore"
                        className="p-4 bg-white border border-slate-200/80 hover:border-indigo-200 rounded-2xl transition shadow-xs group flex items-center justify-between"
                    >
                        <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">Job Match Score</p>
                            <p className="text-xs text-slate-400 mt-0.5">Compare resume vs job description</p>
                        </div>
                        <span className="text-slate-300 group-hover:text-indigo-500 transition text-sm">→</span>
                    </Link>

                    <Link
                        to="/resumeEnhancer"
                        className="p-4 bg-white border border-slate-200/80 hover:border-indigo-200 rounded-2xl transition shadow-xs group flex items-center justify-between"
                    >
                        <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">Resume Enhancer</p>
                            <p className="text-xs text-slate-400 mt-0.5">Bullet point & summary AI rewriter</p>
                        </div>
                        <span className="text-slate-300 group-hover:text-indigo-500 transition text-sm">→</span>
                    </Link>

                    <Link
                        to="/aiJobSearch"
                        className="p-4 bg-white border border-slate-200/80 hover:border-indigo-200 rounded-2xl transition shadow-xs group flex items-center justify-between"
                    >
                        <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">AI Job Search</p>
                            <p className="text-xs text-slate-400 mt-0.5">Find jobs matching your exact skills</p>
                        </div>
                        <span className="text-slate-300 group-hover:text-indigo-500 transition text-sm">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
