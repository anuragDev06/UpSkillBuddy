import React, { useState } from "react";
import FeatureAccesLimiter from "../components/FeatureAccessLimiter/FeatureAccessLimiter";
import { scanResumeFile, scanResumeText } from "../services/ats.api";

export default function ATSscore() {
    const [inputMode, setInputMode] = useState("file"); // "file" | "text"
    const [selectedFile, setSelectedFile] = useState(null);
    const [rawText, setRawText] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState("");
    const [scanResult, setScanResult] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Handle File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file) => {
        setScanError("");
        const validExtensions = ["pdf", "docx", "txt"];
        const ext = file.name.split(".").pop().toLowerCase();
        if (!validExtensions.includes(ext)) {
            setScanError("Please select a valid PDF, DOCX, or TXT file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setScanError("File size exceeds the 5MB limit.");
            return;
        }
        setSelectedFile(file);
    };

    // Drag & Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    // Submit Scan Request
    const handleScan = async () => {
        setScanError("");
        setScanResult(null);

        if (inputMode === "file" && !selectedFile) {
            setScanError("Please select or drop a resume file to scan.");
            return;
        }

        if (inputMode === "text" && !rawText.trim()) {
            setScanError("Please paste your resume content in the text box.");
            return;
        }

        setIsScanning(true);
        try {
            let response;
            if (inputMode === "file") {
                response = await scanResumeFile(selectedFile);
            } else {
                response = await scanResumeText(rawText);
            }

            if (response && response.success) {
                setScanResult(response.data);
            } else {
                setScanError(response?.message || "Failed to audit resume.");
            }
        } catch (err) {
            console.error("Scan error:", err);
            const serverMsg = err.response?.data?.message || "Error scanning resume. Please check your file and try again.";
            setScanError(serverMsg);
        } finally {
            setIsScanning(false);
        }
    };

    const handleReset = () => {
        setScanResult(null);
        setSelectedFile(null);
        setRawText("");
        setScanError("");
    };

    // Helper for score badge colors
    const getScoreColor = (score) => {
        if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
        if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
        return "text-amber-600 bg-amber-50 border-amber-200";
    };

    const getScoreGradient = (score) => {
        if (score >= 85) return "from-emerald-500 to-teal-600";
        if (score >= 70) return "from-blue-600 to-indigo-600";
        return "from-amber-500 to-orange-600";
    };

    return (
        <FeatureAccesLimiter featureName="ATS Scanner">
            <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
                {/* Header */}
                <div className="text-center sm:text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-600 tracking-wider uppercase mb-3">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ATS Auditing Engine
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        ATS Resume Compatibility Scanner
                    </h1>
                    <p className="text-slate-600 mt-2 text-base max-w-2xl">
                        Verify if your resume has structural formatting issues, missing keywords, contact details, or impact metrics before submitting to recruiters.
                    </p>
                </div>

                {!scanResult ? (
                    /* Scanner Input Card */
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                        {/* Mode Switcher Tabs */}
                        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl max-w-md">
                            <button
                                type="button"
                                onClick={() => { setInputMode("file"); setScanError(""); }}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                                    inputMode === "file"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                📄 Upload Resume File
                            </button>
                            <button
                                type="button"
                                onClick={() => { setInputMode("text"); setScanError(""); }}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                                    inputMode === "text"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                ✍️ Paste Plain Text
                            </button>
                        </div>

                        {/* File Upload Mode */}
                        {inputMode === "file" ? (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 ${
                                    isDragging
                                        ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
                                        : selectedFile
                                        ? "border-emerald-300 bg-emerald-50/30"
                                        : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
                                }`}
                            >
                                <input
                                    type="file"
                                    id="resume-file-input"
                                    accept=".pdf,.docx,.txt"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {selectedFile ? (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-slate-900">{selectedFile.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {(selectedFile.size / 1024).toFixed(1)} KB • Ready to audit
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFile(null)}
                                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                                        >
                                            Remove & choose another file
                                        </button>
                                    </div>
                                ) : (
                                    <label htmlFor="resume-file-input" className="cursor-pointer block space-y-3">
                                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm sm:text-base font-bold text-slate-800">
                                                Click to upload or drag & drop your resume
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Supports PDF, DOCX, or TXT (Max 5MB)
                                            </p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        ) : (
                            /* Text Area Mode */
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase block">
                                    Paste Plain Text Resume
                                </label>
                                <textarea
                                    rows="10"
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:bg-white outline-none focus:border-blue-600 transition-colors resize-y font-mono"
                                    placeholder="Paste your plain text resume contents here..."
                                />
                                <div className="text-right text-xs text-slate-400 font-medium">
                                    {rawText.trim() ? rawText.trim().split(/\s+/).length : 0} words
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {scanError && (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{scanError}</span>
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={handleScan}
                                disabled={isScanning}
                                className={`w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all duration-150 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                                    isScanning ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                            >
                                {isScanning ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Auditing Resume ATS Score...
                                    </>
                                ) : (
                                    <>
                                        <span>Scan & Audit Resume</span>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Audit Results Dashboard */
                    <div className="space-y-8 animate-fadeIn">
                        {/* Score Overview Card */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1 text-center md:text-left space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                                    Status: <span className="text-blue-600 font-extrabold">{scanResult.status}</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                                    Overall ATS Compatibility
                                </h2>
                                <p className="text-slate-600 text-sm leading-relaxed max-w-lg">
                                    {scanResult.summary}
                                </p>
                            </div>

                            {/* Score Meter Circle */}
                            <div className="flex flex-col items-center justify-center flex-shrink-0">
                                <div className={`w-36 h-36 rounded-full bg-gradient-to-tr ${getScoreGradient(scanResult.totalScore)} p-1 shadow-xl flex items-center justify-center`}>
                                    <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center text-center">
                                        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                            {scanResult.totalScore}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            / 100 PTS
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Category Score Breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Contact Info Card */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Details</span>
                                    <span className="text-sm font-extrabold text-slate-900">{scanResult.breakdown.contactInfo.score} / {scanResult.breakdown.contactInfo.max}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(scanResult.breakdown.contactInfo.score / scanResult.breakdown.contactInfo.max) * 100}%` }}
                                    />
                                </div>
                                <ul className="text-xs text-slate-600 space-y-1 pt-1">
                                    {scanResult.breakdown.contactInfo.details.map((detail, idx) => (
                                        <li key={idx} className="flex items-center gap-1.5">
                                            <span className="text-emerald-500">✓</span> {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Section Coverage Card */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Section Structure</span>
                                    <span className="text-sm font-extrabold text-slate-900">{scanResult.breakdown.sections.score} / {scanResult.breakdown.sections.max}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(scanResult.breakdown.sections.score / scanResult.breakdown.sections.max) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-600">
                                    Found {scanResult.breakdown.sections.details.length} standard sections.
                                </p>
                            </div>

                            {/* Skills Alignment Card */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills Keyword Match</span>
                                    <span className="text-sm font-extrabold text-slate-900">{scanResult.breakdown.skills.score} / {scanResult.breakdown.skills.max}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(scanResult.breakdown.skills.score / scanResult.breakdown.skills.max) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-600">
                                    Detected {scanResult.breakdown.skills.count} total tech & soft skill keywords.
                                </p>
                            </div>

                            {/* Action Verbs & Metrics Card */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Action Verbs & Impact</span>
                                    <span className="text-sm font-extrabold text-slate-900">{scanResult.breakdown.impactAndVerbs.score} / {scanResult.breakdown.impactAndVerbs.max}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(scanResult.breakdown.impactAndVerbs.score / scanResult.breakdown.impactAndVerbs.max) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-600">
                                    {scanResult.breakdown.impactAndVerbs.verbsCount} action verbs & {scanResult.breakdown.impactAndVerbs.metricsCount} metric figures.
                                </p>
                            </div>

                            {/* Formatting Card */}
                            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 sm:col-span-2 lg:col-span-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Formatting & Word Length</span>
                                    <span className="text-sm font-extrabold text-slate-900">{scanResult.breakdown.formatting.score} / {scanResult.breakdown.formatting.max}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-teal-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(scanResult.breakdown.formatting.score / scanResult.breakdown.formatting.max) * 100}%` }}
                                    />
                                </div>
                                <ul className="text-xs text-slate-600 space-y-1">
                                    {scanResult.breakdown.formatting.details.map((detail, idx) => (
                                        <li key={idx}>• {detail}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Extracted Skills Section */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span>🛠️ Extracted Resume Skills & Keywords</span>
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Technical Skills Detected</span>
                                    {scanResult.skillsFound.technical.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {scanResult.skillsFound.technical.map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-lg text-xs font-semibold uppercase tracking-wide">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No standard technical keywords detected.</p>
                                    )}
                                </div>

                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Soft Skills & Competencies</span>
                                    {scanResult.skillsFound.soft.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {scanResult.skillsFound.soft.map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-lg text-xs font-semibold capitalize">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No standard soft skills detected.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Strengths & Actionable Improvements Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Strengths Card */}
                            <div className="bg-white border border-emerald-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                                <h4 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                                    <span>✅ Resume Strengths</span>
                                </h4>
                                {scanResult.strengths.length > 0 ? (
                                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                                        {scanResult.strengths.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-slate-500">Add key sections to populate strengths.</p>
                                )}
                            </div>

                            {/* Improvements Card */}
                            <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                                <h4 className="text-base font-bold text-amber-800 flex items-center gap-2">
                                    <span>💡 Actionable Improvements</span>
                                </h4>
                                {scanResult.improvements.length > 0 ? (
                                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                                        {scanResult.improvements.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-amber-500 font-bold flex-shrink-0">!</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-emerald-600 font-semibold">Great job! No critical improvements required.</p>
                                )}
                            </div>
                        </div>

                        {/* Reset / Rescan Bar */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all duration-150 shadow-md cursor-pointer flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Scan Another Resume
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </FeatureAccesLimiter>
    );
}
