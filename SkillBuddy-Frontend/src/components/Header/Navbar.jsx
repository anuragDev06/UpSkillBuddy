import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
    const { user, handleLogout } = useAuth();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    const isHomePage = location.pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (

        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${
                isHomePage && !isScrolled
                    ? "bg-white border-b border-transparent shadow-none"
                    : "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg text-slate-900 tracking-tight">UpSkillBuddy</span>
                </div>

                {/* Navigation Menu */}
                <nav className="hidden md:flex items-center gap-8">
                    <NavLink
                        to="/atsScore" className={({ isActive }) =>
                            `text-sm font-medium transition-colors ${isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`} >

                        ATS Scanner
                    </NavLink>
                    <NavLink
                        to="/matchScore" className={({ isActive }) =>
                            `text-sm font-medium transition-colors ${isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`} >

                        Resume Match
                    </NavLink>
                    <NavLink
                        to="/mockInterview" className={({ isActive }) =>
                            `text-sm font-medium transition-colors ${isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`} >

                        Mock Interview
                    </NavLink>
                    <NavLink
                        to="/dashboard" className={({ isActive }) =>
                            `text-sm font-medium transition-colors ${isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`} >

                        Dashboard
                    </NavLink>
                </nav>

                {/* User Session Info / Auth Buttons */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <div className="hidden lg:flex flex-col items-end text-xs mr-1">
                                <span className="font-semibold text-slate-900">{user.username || user.email}</span>
                                <span className="text-slate-500">Connected User</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/login"
                                className="px-4 py-2 text-slate-600 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
                            >
                                Log In
                            </NavLink>
                            <NavLink
                                to="/register"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm shadow-blue-100 hover:shadow-md cursor-pointer"
                            >
                                Sign Up
                            </NavLink>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navbar
