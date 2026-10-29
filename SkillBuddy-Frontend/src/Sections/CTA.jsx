import React from 'react'



const CTA = () => {

    return (
        <section className="py-20 bg-white border-b border-slate-100 text-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Are You Ready to Tailor Your Tech Career?</h2>
                <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium leading-relaxed">
                    Identify compatibility metrics, resolve missing skills, rewrite achievements, and secure optimal positions.
                </p>
                <div className="mt-8 flex justify-center">
                    <a
                        href="#features"
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-base transition-all duration-150 shadow-md hover:shadow-lg cursor-pointer"
                    >
                        Get Started
                    </a>
                </div>
            </div>
        </section>
    )
}

export default CTA