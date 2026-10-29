import React from "react";
import { NavLink } from "react-router";

export default function AiJobSearch() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-20">
            <div className="max-w-lg w-full text-center">

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-200 mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Badge */}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    Coming Soon
                </span>

                {/* Heading */}
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-2">
                    AI Job Search
                </h1>
                <p className="mt-4 text-slate-500 text-base leading-relaxed max-w-sm mx-auto">
                    Smart, AI-powered job discovery is on the way. Enter a role and let our engine surface the best-matched opportunities tailored to your profile and skills.
                </p>

                {/* Features preview */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                    {[
                        { emoji: "🔍", label: "Smart Job Matching" },
                        { emoji: "🤖", label: "AI Role Filtering" },
                        { emoji: "📍", label: "Location-Aware" },
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
                    className="inline-flex items-center gap-2 mt-10 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm shadow-violet-200 hover:shadow-md"
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
