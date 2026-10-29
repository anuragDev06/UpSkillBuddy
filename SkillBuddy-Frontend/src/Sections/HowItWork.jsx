import React from 'react'


const HowItWork = () => {
    return (
        <section id="how-it-works" className="py-20 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Workflow Timeline</span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How Up-Skill-Buddy Assists You</h2>
                    <p className="mt-4 text-slate-600">A structured, cyclical path designed to transition you from skill assessment to final technical selection.</p>
                </div>

                <div className="relative">
                    {/* Connection Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 hidden md:block" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                        {/* Step 1 */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">1</div>
                            <h3 className="text-base font-bold text-slate-900 mb-2">Upload Profile</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">Paste your resume layout, target roles, and list current technical skills within our dashboard.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">2</div>
                            <h3 className="text-base font-bold text-slate-900 mb-2">Audit Compliance</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">Execute match score assessments and scanning diagnostics to map out keyword and formatting deficits.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">3</div>
                            <h3 className="text-base font-bold text-slate-900 mb-2">Enhance &amp; Practice</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">Optimize descriptions, follow custom course recommendations, and practice simulated mock interviews.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">4</div>
                            <h3 className="text-base font-bold text-slate-900 mb-2">Search &amp; Apply</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">Filter roles matched specifically to your verified skills, exporting your tailored credentials.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}


export default HowItWork
