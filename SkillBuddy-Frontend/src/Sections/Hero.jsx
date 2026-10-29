import React from 'react'


const Hero = () => {
    return (
        <section className="relative bg-white pt-16 pb-20 border-b border-slate-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        AI Powered Career Platform
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                        Build the Skills Tech Recruiters Actually Demand
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
                        Identify resume gaps, scan ATS compatibility, generate impact-driven resume bullet points, practice realistic mock interviews, and locate personalized job matches.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="#features"
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base transition-all duration-150 text-center shadow-md hover:shadow-lg cursor-pointer"
                        >
                            Try Interactive Tools
                        </a>
                        <a
                            href="#how-it-works"
                            className="w-full sm:w-auto px-8 py-4 border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-base transition-all duration-150 text-center cursor-pointer"
                        >
                            Learn the Workflow
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}


export default Hero