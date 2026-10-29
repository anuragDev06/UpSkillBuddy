import React from "react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";



export const FeatureAccessLimiter = ({ children, featureName = "this tool" }) => {

    const { user } = useAuth();
    if (user) {
        return <>{children}</>;
    }

    return (

        <div className="relative min-h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-white">
            {/* The actual feature interface, but blurred */}

            <div className="absolute inset-0 filter blur-[4px] pointer-events-none select-none opacity-60">
                {children}
            </div>

            {/* Premium Glassmorphic Overlay */}

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-6 text-center transition-all duration-300">
                <div className="max-w-md w-full bg-white/95 border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-md transform scale-100 hover:scale-[1.01] transition-transform">

                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner mb-6">
                        <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12M4 7h16M4 7a3 3 0 000 6h2m12-6a3 3 0 010 6h-2m-8-6v8m0 0a4 4 0 008 0V7" />
                        </svg>
                    </div>

                    {/* Headline */}
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                        Unlock {featureName}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed mb-8">
                        Please Sign in or create a free account to access features without any limit.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm transition-all duration-150 shadow-md hover:shadow-lg text-center"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="w-full sm:w-auto px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all duration-150 text-center"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default FeatureAccessLimiter