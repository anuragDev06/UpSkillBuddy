import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth.jsx'



const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()

  const { handleRegister } = useAuth()


  const handleSubmit = async (e) => {

    e.preventDefault()


    const newErrors = {}

    if (!username) {
      newErrors.username = 'Username is required'
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    // Email check
    if (!email) {
      newErrors.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password check
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    // Call the actual API register handler
    const success = await handleRegister({ username, email, password })

    setLoading(false)
    if (success) {
      // Redirect to home/dashboard if registration succeeded
      navigate('/')
    } else {
      // Set an error message if the registration failed
      setErrors({ submit: 'Registration failed. Email or username might already be in use.' })
    }
  }


  return (
    <main className="flex min-h-screen w-full bg-[#f8fafc] overflow-hidden select-none font-sans">

      {/* LEFT PANEL - 50% split on desktop */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-[#0b0c13] bg-gradient-to-br from-[#0b0c13] via-[#121422] to-[#251940] flex-col justify-between p-12 overflow-hidden">

        {/* Ambient Pulsing Glows */}
        <div className="absolute top-[10%] left-[10%] w-[380px] h-[380px] rounded-full bg-blue-600/15 blur-[100px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[320px] h-[320px] rounded-full bg-purple-600/10 blur-[90px] animate-pulse-glow pointer-events-none" />
        <div className="absolute top-[40%] right-[30%] w-[200px] h-[200px] rounded-full bg-[#7c5cff]/10 blur-[85px] pointer-events-none" />

        {/* Floating Custom SVG Symbols */}
        {/* Code Brackets </> */}
        <div className="absolute top-[12%] left-[10%] opacity-25 animate-float-gentle text-blue-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        </div>

        {/* Floating Bracket Symbol { } */}
        <div className="absolute top-[52%] right-[8%] opacity-20 animate-float-delayed text-purple-400">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 8.25c0-1.242.417-2.383 1.116-3.3a.75.75 0 00-1.192-.916 5.975 5.975 0 00-1.424 4.216c0 1.258.388 2.425 1.053 3.393a5.98 5.98 0 00-.916 4.394 6.002 6.002 0 001.424 3.757.75.75 0 001.192-.916 4.5 4.5 0 01-1.116-3.17c0-1.396.485-2.678 1.294-3.684a.75.75 0 00-.012-1.026 4.498 4.498 0 01-1.282-3.758zm8 0c0-1.242-.417-2.383-1.116-3.3a.75.75 0 011.192-.916 5.975 5.975 0 011.424 4.216c0 1.258-.388 2.425-1.053 3.393a5.98 5.98 0 01.916 4.394 6.002 6.002 0 01-1.424 3.757.75.75 0 01-1.192-.916 4.5 4.5 0 001.116-3.17c0-1.396-.485-2.678-1.294-3.684a.75.75 0 01.012-1.026c.809-1.006 1.282-2.362 1.282-3.758z" />
          </svg>
        </div>

        {/* Database Icon */}
        <div className="absolute bottom-[16%] left-[8%] opacity-20 animate-float-slow text-indigo-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        </div>

        {/* Career Growth Arrow SVG */}
        <div className="absolute bottom-[42%] left-[45%] opacity-15 animate-float-delayed text-teal-400">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>

        {/* Trophy Icon */}
        <div className="absolute top-[8%] right-[16%] opacity-20 animate-float-slow text-yellow-400/80">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12M4 7h16M4 7a3 3 0 000 6h2m12-6a3 3 0 010 6h-2m-8-6v8m0 0a4 4 0 008 0V7" />
          </svg>
        </div>

        {/* Left Section Header Brand Tag */}
        <div className="flex items-center gap-2 z-10">
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-indigo-300 tracking-wide backdrop-blur-sm">
            ✨ Platform Release v2.4
          </span>
        </div>

        {/* CENTERPIECE: 3D Laptop Screen Mockup */}
        <div className="w-full max-w-[530px] mx-auto z-10 flex flex-col items-center justify-center my-auto py-4">

          {/* Laptop Screen with Custom skew, perspective & float animation */}
          <div className="w-full animate-laptop-levitate transition-all duration-300">

            {/* Screen Bezel / Frame */}
            <div className="w-full aspect-[16/10] bg-[#15161d] rounded-2xl p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] border border-gray-800/80 relative">

              {/* Webcam */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-green-500/80" />
                </div>
              </div>

              {/* Glossy Diagonal Reflection Overlays */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none rounded-xl z-20" />

              {/* Screen Display Content (Coding Dashboard) */}
              <div className="w-full h-full bg-[#090a0f] rounded-lg overflow-hidden flex text-gray-200 border border-gray-900 relative text-[10px]">

                {/* Dashboard Left Sidebar */}
                <div className="w-[12%] h-full bg-[#05060a]/90 border-r border-gray-900/60 flex flex-col items-center py-2.5 justify-between">
                  <div className="flex flex-col gap-3.5 items-center w-full">
                    {/* Logo Dot */}
                    <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                      U
                    </div>
                    {/* Menu items */}
                    <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </div>
                    <div className="w-5 h-5 rounded hover:bg-white/5 flex items-center justify-center text-indigo-400">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div className="w-5 h-5 rounded hover:bg-white/5 flex items-center justify-center text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
                    </div>
                    <div className="w-5 h-5 rounded hover:bg-white/5 flex items-center justify-center text-gray-500">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" /></svg>
                    </div>
                  </div>
                  <div className="w-5.5 h-5.5 rounded-full bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-[8px] font-bold text-indigo-300">
                    JD
                  </div>
                </div>

                {/* Dashboard Main Content */}
                <div className="flex-1 flex flex-col h-full bg-[#0a0b10] overflow-hidden">

                  {/* macOS Title Bar Header */}
                  <div className="h-6.5 bg-[#050609] px-3.5 flex items-center justify-between border-b border-gray-950/60 select-none">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/80" />
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/80" />
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500/80" />
                    </div>
                    <div className="bg-[#12141d] text-[8px] text-gray-500 py-0.5 px-3 rounded-full border border-gray-800/40 font-mono tracking-tight">
                      dashboard.upskillbuddy.com/java-prep
                    </div>
                    <div className="w-6" /> {/* spacer */}
                  </div>

                  {/* Dashboard Grid Workspace */}
                  <div className="flex-1 p-3 grid grid-cols-12 gap-2.5 overflow-y-auto custom-scrollbar">

                    {/* Welcome Card & Badges */}
                    <div className="col-span-7 bg-[#10121a]/90 border border-gray-800/40 rounded-xl p-2.5 flex flex-col justify-between h-[82px] shadow-sm">
                      <div className="flex flex-col">
                        <div className="text-[10px] font-bold text-white tracking-wide">Welcome, Java Dev #398</div>
                        <div className="text-[8px] text-teal-400 font-medium mt-0.5">Streak: 12 days 🔥 (Next Milestone: Day 15)</div>
                      </div>

                      {/* Skill Badges */}
                      <div className="flex gap-1.5">
                        <span className="bg-blue-500/10 text-[7px] text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-md font-semibold tracking-wide flex items-center gap-0.5">
                          🛡️ DSA Master
                        </span>
                        <span className="bg-purple-500/10 text-[7px] text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded-md font-semibold tracking-wide flex items-center gap-0.5">
                          ☕ Java Expert
                        </span>
                        <span className="bg-yellow-500/10 text-[7px] text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded-md font-semibold tracking-wide flex items-center gap-0.5">
                          ⚡ L300+
                        </span>
                      </div>
                    </div>

                    {/* Circular DSA Progress */}
                    <div className="col-span-5 bg-[#10121a]/90 border border-gray-800/40 rounded-xl p-2 flex items-center justify-around h-[82px] shadow-sm relative">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-13 h-13" viewBox="0 0 44 44">
                          <circle className="text-gray-800/70" strokeWidth="3" stroke="currentColor" fill="transparent" r="18" cx="22" cy="22" />
                          <circle
                            className="text-[#6366f1]"
                            strokeWidth="3.2"
                            strokeDasharray="113"
                            strokeDashoffset="29.3" // 74% completed
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="18"
                            cx="22"
                            cy="22"
                            transform="rotate(-90 22 22)"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-white leading-none">74%</span>
                          <span className="text-[6px] text-gray-500 font-semibold leading-none mt-0.5 uppercase tracking-wider">DSA</span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center gap-0.5">
                        <div className="text-[8px] font-semibold text-gray-400">Progress Chart</div>
                        <div className="text-[9px] font-bold text-emerald-400">148/200</div>
                        <div className="text-[6px] text-gray-500 uppercase font-medium">Problems</div>
                      </div>
                    </div>

                    {/* Coding Editor Panel */}
                    <div className="col-span-7 bg-[#07080b] border border-gray-900 rounded-xl flex flex-col h-[135px] overflow-hidden shadow-inner">

                      {/* Editor Tabs bar */}
                      <div className="bg-[#10121a] px-2.5 py-1 border-b border-gray-950/80 text-[8px] text-gray-400 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                          <span className="font-mono text-gray-300">📄 Solution.java</span>
                        </div>
                        <div className="text-[7px] bg-purple-950/60 text-purple-400 border border-purple-900/30 px-1 py-0.5 rounded font-mono">
                          Java SE 21
                        </div>
                      </div>

                      {/* Code Area */}
                      <div className="p-2.5 font-mono text-[7.5px] text-gray-300 overflow-y-auto custom-scrollbar flex-1 leading-relaxed">
                        <span className="text-purple-400">class</span> <span className="text-yellow-400">Solution</span> <span className="text-gray-400">&#123;</span>
                        <br />
                        &nbsp;&nbsp;<span className="text-purple-400">public</span> <span className="text-blue-400">int</span> <span className="text-green-400">maxProfit</span><span className="text-gray-400">(</span><span className="text-blue-400">int</span><span className="text-gray-300">[]</span> <span className="text-indigo-300">prices</span><span className="text-gray-400">) &#123;</span>
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">int</span> <span className="text-gray-300">minPrice</span> <span className="text-purple-400">=</span> <span className="text-indigo-400">Integer</span><span className="text-gray-300">.MAX_VALUE;</span>
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">int</span> <span className="text-gray-300">maxProfit</span> <span className="text-purple-400">=</span> <span className="text-teal-400 font-bold">0</span><span className="text-gray-300">;</span>
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">for</span> <span className="text-gray-400">(</span><span className="text-blue-400">int</span> <span className="text-gray-300">price : prices</span><span className="text-gray-400">) &#123;</span>
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-300">minPrice</span> <span className="text-purple-400">=</span> <span className="text-[#38bdf8]">Math</span><span className="text-gray-300">.min(minPrice, price);</span>
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-300">maxProfit</span> <span className="text-purple-400">=</span> <span className="text-[#38bdf8]">Math</span><span className="text-gray-300">.max(maxProfit, price - minPrice);</span>
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-400">&#125;</span>
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-gray-300">maxProfit;</span>
                        <br />
                        &nbsp;&nbsp;<span className="text-gray-400">&#125;</span>
                        <br />
                        <span className="text-gray-400">&#125;</span>
                      </div>
                    </div>

                    {/* Interview Statistics & Mini Trend Chart */}
                    <div className="col-span-5 bg-[#10121a]/90 border border-gray-800/40 rounded-xl p-2.5 flex flex-col justify-between h-[135px] shadow-sm">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-bold text-gray-300 uppercase tracking-wide">Interview Prep</span>
                          <span className="text-[7px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.2 rounded">L92%</span>
                        </div>
                        <div className="text-[9px] text-gray-400 mt-0.5">
                          Mock Sessions: <strong className="text-white">24 Completed</strong>
                        </div>
                        <div className="w-full bg-gray-800 h-1.2 rounded-full overflow-hidden mt-0.5">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[88%]" />
                        </div>
                      </div>

                      {/* Line Chart */}
                      <div className="w-full relative mt-1">
                        <svg className="w-full h-[46px]" viewBox="0 0 160 50">
                          <defs>
                            <linearGradient id="laptop-chart-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Grid guide */}
                          <line x1="0" y1="12" x2="160" y2="12" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
                          <line x1="0" y1="28" x2="160" y2="28" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
                          <line x1="0" y1="44" x2="160" y2="44" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
                          {/* Path background fill */}
                          <path
                            d="M 0 44 C 20 40, 40 28, 60 32 C 80 36, 100 16, 120 12 C 140 8, 150 4, 160 2 L 160 50 L 0 50 Z"
                            fill="url(#laptop-chart-grad)"
                          />
                          {/* Path stroke line */}
                          <path
                            d="M 0 44 C 20 40, 40 28, 60 32 C 80 36, 100 16, 120 12 C 140 8, 150 4, 160 2"
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          {/* Points */}
                          <circle cx="120" cy="12" r="2" fill="#818cf8" />
                          <circle cx="160" cy="2" r="2" fill="#a78bfa" />
                        </svg>
                        <div className="absolute top-0 left-1 text-[6px] text-gray-500 uppercase tracking-widest font-bold">Analytics</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Laptop Base Hinge */}
            <div className="w-[88%] h-2 bg-[#2d2e3b] border-t border-gray-700/40 rounded-t-sm mx-auto shadow-md relative z-10" />

            {/* Laptop Base Body */}
            <div className="w-[104%] h-3.5 bg-gradient-to-b from-[#343647] via-[#2a2c3a] to-[#161720] border-t border-gray-600/35 rounded-b-2xl relative shadow-[0_20px_35px_rgba(0,0,0,0.6)] z-10 -mt-[1px]">
              {/* Keyboard indent design lines */}
              <div className="absolute top-[1px] left-[15%] right-[15%] h-[2px] bg-[#222431] border-b border-gray-700/20" />
              {/* Trackpad */}
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-[24%] h-[75%] border-x border-b border-gray-800 bg-[#222330]/40 rounded-b-md" />
            </div>

            {/* Soft Shadow Underneath Base */}
            <div className="w-[98%] h-3 bg-black/45 blur-md rounded-full mx-auto -mt-1 opacity-80" />
          </div>
        </div>

        {/* Left Section Typography Content */}
        <div className="relative z-10 select-text max-w-lg mt-auto">
          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 font-display">
            Level Up Your Career
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent mb-4 font-display">
            Learn Skills. Build Projects. Get Hired.
          </p>

          {/* Supporting text */}
          <p className="text-sm text-slate-400 leading-relaxed font-normal">
            Master coding, prepare for interviews, track your progress, and achieve your dream tech career with UpskillBuddy.
          </p>
        </div>
      </section>

      {/* RIGHT PANEL - Clean card layout */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-gradient-to-tr from-[#f8fafc] to-[#f1f5f9] relative overflow-y-auto">

        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Glassmorphic border accent container for the card */}
        <div className="w-full max-w-[465px] bg-white border border-slate-100 rounded-[32px] shadow-[0_20px_50px_-12px_rgba(15,23,42,0.06),0_4px_12px_rgba(15,23,42,0.01)] p-8 sm:p-10 relative flex flex-col">

          {/* Top Row: Logo & Sign Up link */}
          <div className="flex items-center justify-between mb-10">
            {/* UpskillBuddy Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-sm shadow-indigo-200 transition-transform group-hover:scale-105 duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-display font-extrabold text-[17px] tracking-tight bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent">
                UpskillBuddy
              </span>
            </Link>

            {/* Link to Login */}
            <div className="text-xs sm:text-sm text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors duration-200 underline-offset-4 hover:underline">
                Sign In
              </Link>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8 select-text">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
              Create an Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal leading-relaxed">
              Start your learning journey and level up your tech career today.
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-username" className="text-xs font-semibold text-slate-700 tracking-wide uppercase select-none">
                Username
              </label>
              <div className="relative">
                {/* User SVG Icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="register-username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border ${errors.username ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
                    } rounded-2xl outline-none focus:ring-4 transition-all duration-200 text-[14px] text-slate-800 font-medium placeholder:text-slate-400`}
                />
              </div>
              {errors.username && (
                <span className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  {errors.username}
                </span>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-email" className="text-xs font-semibold text-slate-700 tracking-wide uppercase select-none">
                Email Address
              </label>
              <div className="relative">
                {/* Envelope SVG Icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="register-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
                    } rounded-2xl outline-none focus:ring-4 transition-all duration-200 text-[14px] text-slate-800 font-medium placeholder:text-slate-400`}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-password" className="text-xs font-semibold text-slate-700 tracking-wide uppercase select-none">
                Password
              </label>
              <div className="relative">
                {/* Lock SVG Icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12M4 7h16M4 7a3 3 0 000 6h2m12-6a3 3 0 010 6h-2m-8-6v8m0 0a4 4 0 008 0V7" />
                  </svg>
                </div>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-11 py-3 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
                    } rounded-2xl outline-none focus:ring-4 transition-all duration-200 text-[14px] text-slate-800 font-medium placeholder:text-slate-400`}
                />

                {/* Visibility Toggle Eye Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  {errors.password}
                </span>
              )}
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-center select-none">
              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 rounded cursor-pointer"
                />
                I agree to the Terms & Conditions
              </label>
            </div>

            {/* Register CTA Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold text-sm shadow-[0_8px_20px_-4px_rgba(99,102,241,0.35)] hover:shadow-[0_12px_24px_-2px_rgba(99,102,241,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <svg className="w-4.5 h-4.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            {/* Separator */}
            <div className="relative my-4 flex items-center select-none">
              <div className="flex-grow border-t border-slate-100" />
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase px-4 bg-white z-10">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-slate-100" />
            </div>

            {/* Social Authentication Buttons */}
            <div className="grid grid-cols-2 gap-3.5">

              {/* Google Button */}
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 w-full py-3 px-4 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 transition-all duration-150 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </button>

              {/* GitHub Button */}
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 w-full py-3 px-4 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 transition-all duration-150 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5 text-slate-900" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.024A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.293 2.747-1.024 2.747-1.024.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )

}

export default Register;