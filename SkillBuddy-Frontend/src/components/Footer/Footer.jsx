import React from 'react'


const Footer = () => {

    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Company Block */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm">
                                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="font-bold text-white text-base tracking-tight">UpSkillBuddy</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Level up your tech career utilizing structured alignment diagnostics, tailored roadmaps, and mock interview preparations.
                        </p>
                    </div>

                    {/* Navigation Links Column */}
                    <div>
                        <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest mb-4">Jump Routes</h4>
                        <ul className="space-y-2 text-xs">
                            <li><a href="#problem" className="hover:text-white transition-colors">Problem Statement</a></li>
                            <li><a href="#solution" className="hover:text-white transition-colors">Solution Overview</a></li>
                            <li><a href="#features" className="hover:text-white transition-colors">Interactive Tools</a></li>
                            <li><a href="#how-it-works" className="hover:text-white transition-colors">Hiring Process</a></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest mb-4">Legal Guidelines</h4>
                        <ul className="space-y-2 text-xs">
                            <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                            <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                            <li><span className="hover:text-white transition-colors cursor-pointer">Cookies Settings</span></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest mb-4">Get in Touch</h4>
                        <ul className="space-y-2 text-xs">
                            <li><span className="text-slate-400 font-medium">Support: support@upskillbuddy.com</span></li>
                            <li><span className="text-slate-400 font-medium">Sales: sales@upskillbuddy.com</span></li>
                            <li><span className="text-slate-400 font-medium">HQ: Bengaluru, India</span></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
                    <span>&copy; {new Date().getFullYear()} UpSkillBuddy. All rights reserved.</span>
                    <div className="flex gap-4 mt-4 sm:mt-0">
                        <span className="hover:text-slate-400 cursor-pointer">Documentation</span>
                        <span>&middot;</span>
                        <span className="hover:text-slate-400 cursor-pointer">System Status</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer