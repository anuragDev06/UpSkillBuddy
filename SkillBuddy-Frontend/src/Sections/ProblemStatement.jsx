import React from 'react'


const ProblemStatement = () => {
    return (
        <section id="problem" className="py-20 bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">The Career Challenge</span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Why Job Searching in Tech is broken</h2>
                    <p className="mt-4 text-slate-600">Standard application methods often fail because automated software and preparation barriers stand between you and the hiring manager.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Problem Card 1 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12M4 7h16M4 7a3 3 0 000 6h2m12-6a3 3 0 010 6h-2m-8-6v8m0 0a4 4 0 008 0V7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">The ATS Filter Wall</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Over 75 percent of applications are filtered out by Applicant Tracking Systems before a human recruiter even looks. If your format is unreadable or keywords are missing, you get immediate rejection.
                        </p>
                    </div>

                    {/* Problem Card 2 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Undetected Skill Gaps</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Applying to roles without checking your profile against specific job metrics leads to low response rates. Identifying missing libraries, systems, or frameworks is hard to analyze manually.
                        </p>
                    </div>

                    {/* Problem Card 3 */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Cold Interview Anxiety</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Walking into technical interviews without practicing verbal answers to realistic role queries induces anxiety. Static coding questions do not prepare you for live communication assessments.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}


export default ProblemStatement