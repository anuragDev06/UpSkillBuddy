import React from 'react'


const Solution = () => {
    return (
        <section id="solution" className="py-20 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Our Solution</span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Continuous Career Growth Ecosystem</h2>
                    <p className="mt-4 text-slate-600">UpSkillBuddy provides five core instruments to audit your standing, improve your resume, practice interviews, and match jobs.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold text-sm">1</div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900">Precise Metric Diagnostics</h4>
                                <p className="text-slate-600 text-sm mt-1">Receive automated keyword audit scores showing you how well your resume matches target descriptions.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold text-sm">2</div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900">High-Impact Bullet Point Rewriting</h4>
                                <p className="text-slate-600 text-sm mt-1">Transform weak descriptions into active, metrics-focused achievements built for recruitment parsing.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold text-sm">3</div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900">Dynamic Practice Sessions</h4>
                                <p className="text-slate-600 text-sm mt-1">Conduct interactive Q&amp;A sessions built around your target tech stack with immediate scoring reports.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold text-sm">4</div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900">Tailored Job Matching</h4>
                                <p className="text-slate-600 text-sm mt-1">Locate active job openings matched directly to the exact competencies stored on your resume.</p>
                            </div>
                        </div>
                    </div>

                    {/* Interactive UI Mock Visual (Pure CSS) */}
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                                <div className="w-3 h-3 rounded-full bg-slate-200" />
                            </div>
                            <div className="text-xs text-slate-400 bg-white border border-slate-100 rounded-full px-4 py-1">
                                upskillbuddy.com/engine
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-500">ATS SCANNER STATUS</span>
                                    <span className="text-xs font-bold text-green-500">READY</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full w-[88%]" />
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                <div className="text-xs font-bold text-slate-500 mb-2">MATCH HIGHLIGHTS</div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">React</span>
                                    <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">JavaScript</span>
                                    <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">Tailwind</span>
                                    <span className="text-[10px] font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-200">Redux Toolkit</span>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
                                <div className="text-xs font-bold text-slate-500">IMPACT OPTIMIZATION</div>
                                <div className="text-[11px] text-slate-400 line-through">I built the frontend layout.</div>
                                <div className="text-[11px] text-slate-800 font-medium">Engineered responsive user interfaces using modular frontend assets.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}



export default Solution