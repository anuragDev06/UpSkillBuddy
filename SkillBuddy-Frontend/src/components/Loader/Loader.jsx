import React from 'react'

function Loader() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-500">
            {/* Glowing background blob */}
            <div className="absolute w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse-glow"></div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Modern Spinner */}
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                {/* Premium Brand/Logo Text */}
                <h2 className="mt-6 text-2xl font-bold tracking-wider bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-display animate-pulse">
                    Up-Skill-Buddy
                </h2>
                <p className="mt-2 text-sm text-slate-400 tracking-wide">
                    Getting things ready for you...
                </p>
            </div>
        </div>
    )
}

export default Loader
