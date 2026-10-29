import React from 'react'


const Benefits = () => {
    return (
        <section id="benefits" className="py-20 bg-slate-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Platform Results</span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-2">What you achieve with our system</h2>
                    <p className="mt-4 text-slate-600">Elevate your job searching results by moving beyond unstructured applications.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center p-6">
                        <div className="text-3xl font-extrabold text-blue-600">3x</div>
                        <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1">Response Rate Growth</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Optimized resume formats and aligned keywords reduce initial filter rejection actions.</p>
                    </div>

                    <div className="text-center p-6">
                        <div className="text-3xl font-extrabold text-blue-600">40+</div>
                        <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1">Hours Saved Weekly</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Automate job compatibility checking and bypass tedious manually mapped matches.</p>
                    </div>

                    <div className="text-center p-6">
                        <div className="text-3xl font-extrabold text-blue-600">100%</div>
                        <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1">ATS Compatibility</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Confirm document layouts adhere strictly to digital parsing parameters.</p>
                    </div>

                    <div className="text-center p-6">
                        <div className="text-3xl font-extrabold text-blue-600">8.8/10</div>
                        <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1">Average Interview Rating</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">Refine technical expression and resolve concepts through simulated practices.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Benefits