import React from 'react'


const ProductSS = () => {
    return (
        <section className="py-20 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Interface Preview</span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Visualizing Your Learning Journey</h2>
                    <p className="mt-4 text-slate-600">Explore the clean, structured interface built to optimize code assessments and monitor progress paths.</p>
                </div>

                {/* CSS Dashboard Screenshot Mockup */}
                <div className="border border-slate-200 rounded-3xl bg-slate-50 p-4 sm:p-6 shadow-md max-w-5xl mx-auto relative">
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm grid grid-cols-12 min-h-[360px]">

                        {/* Dashboard Mock Sidebar */}
                        <div className="col-span-3 border-r border-slate-200 bg-slate-50 p-4 space-y-4 hidden md:block">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-blue-600" />
                                <span className="text-xs font-bold text-slate-900 uppercase">Menu</span>
                            </div>
                            <div className="space-y-2">
                                <div className="h-7 bg-white border border-slate-200 rounded px-2 flex items-center text-[10px] font-bold text-blue-600">Overview</div>
                                <div className="h-7 hover:bg-white/50 rounded px-2 flex items-center text-[10px] text-slate-600 font-medium">Competency Tree</div>
                                <div className="h-7 hover:bg-white/50 rounded px-2 flex items-center text-[10px] text-slate-600 font-medium">Roadmaps</div>
                                <div className="h-7 hover:bg-white/50 rounded px-2 flex items-center text-[10px] text-slate-600 font-medium">History Log</div>
                            </div>
                        </div>

                        {/* Dashboard Mock Content */}
                        <div className="col-span-12 md:col-span-9 p-6 space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <div>
                                    <h4 className="text-base font-bold text-slate-950">Dev Dashboard Overview</h4>
                                    <p className="text-slate-500 text-xs mt-0.5">Track your operational targets and skill alignments.</p>
                                </div>
                                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full">Streak Count: 14</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Target Match</div>
                                    <div className="text-xl font-bold text-slate-900">89% Aligned</div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                                        <div className="bg-blue-600 h-full w-[89%]" />
                                    </div>
                                </div>

                                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Mock Interviews</div>
                                    <div className="text-xl font-bold text-slate-900">12 Practices</div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                                        <div className="bg-blue-600 h-full w-[70%]" />
                                    </div>
                                </div>

                                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">ATS Index</div>
                                    <div className="text-xl font-bold text-slate-900">92 / 100</div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                                        <div className="bg-green-500 h-full w-[92%]" />
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Competency Progression Chart</div>
                                <div className="h-28 bg-white border border-slate-150 rounded-lg flex items-end p-2 justify-between">
                                    <div className="w-8 bg-blue-600/30 rounded-t h-[40%]" />
                                    <div className="w-8 bg-blue-600/40 rounded-t h-[55%]" />
                                    <div className="w-8 bg-blue-600/50 rounded-t h-[70%]" />
                                    <div className="w-8 bg-blue-600/60 rounded-t h-[65%]" />
                                    <div className="w-8 bg-blue-600/70 rounded-t h-[80%]" />
                                    <div className="w-8 bg-blue-600/80 rounded-t h-[92%]" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}


export default ProductSS