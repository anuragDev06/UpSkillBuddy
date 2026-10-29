import React from 'react'


const FAQ = () => {
    return (<section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Questions Answers</span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Frequently Asked Queries</h2>
                <p className="mt-4 text-slate-600">Review answers detailing privacy compliance, scoring methods, and mock capabilities.</p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full px-6 py-4 flex items-center justify-between font-bold text-sm text-slate-900 text-left hover:bg-slate-50 cursor-pointer focus:outline-none"
                        >
                            <span>{faq.q}</span>
                            <span className="text-slate-400 font-normal">
                                {openFaqIndex === idx ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                )}
                            </span>
                        </button>
                        {openFaqIndex === idx && (
                            <div className="px-6 pb-5 pt-1 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </section>)

}

export default FAQ