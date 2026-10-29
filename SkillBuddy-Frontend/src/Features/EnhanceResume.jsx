import React from "react";
import { NavLink } from "react-router";

export default function EnhanceResume() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-20">
            <div className="max-w-lg w-full text-center">

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-200 mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>

                {/* Badge */}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Coming Soon
                </span>

                {/* Heading */}
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-2">
                    Resume Enhancer
                </h1>
                <p className="mt-4 text-slate-500 text-base leading-relaxed max-w-sm mx-auto">
                    Our AI-powered Resume Enhancer is currently under development. It will rewrite and supercharge your resume bullets with measurable impact and ATS-friendly language.
                </p>

                {/* Features preview */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    {[
                        { emoji: "✨", label: "AI-Powered Rewrites" },
                        { emoji: "📊", label: "Quantified Impact" },
                        { emoji: "🎯", label: "ATS Optimization" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                            <span className="text-lg">{item.emoji}</span>
                            <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Back button */}
                <NavLink
                    to="/"
                    className="inline-flex items-center gap-2 mt-10 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm shadow-blue-200 hover:shadow-md"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </NavLink>
            </div>
        </div>
    );
}
