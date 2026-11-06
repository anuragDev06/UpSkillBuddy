import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
    const { user, handleLogout } = useAuth();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

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

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { to: "/atsScore", label: "ATS Scanner" },
        { to: "/matchScore", label: "Resume Match" },
        { to: "/mockInterview", label: "Mock Interview" },
        { to: "/dashboard", label: "Dashboard" },
    ];

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${
                isHomePage && !isScrolled
                    ? "bg-white border-b border-transparent shadow-none"
                    : "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200 shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg text-slate-900 tracking-tight truncate">UpSkillBuddy</span>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `text-sm font-medium transition-colors ${
                                    isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <div className="hidden lg:flex flex-col items-end text-xs mr-1">
                                <span className="font-semibold text-slate-900">{user.username || user.email}</span>
                                <span className="text-slate-500">Connected User</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="hidden sm:inline-flex px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/login"
                                className="hidden sm:inline-flex px-4 py-2 text-slate-600 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer"
                            >
                                Log In
                            </NavLink>
                            <NavLink
                                to="/register"
                                className="hidden sm:inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm shadow-blue-100 hover:shadow-md cursor-pointer"
                            >
                                Sign Up
                            </NavLink>
                        </>
                    )}

                    <button
                        type="button"
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="inline-flex md:hidden items-center justify-center w-11 h-11 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {menuOpen ? (
                                <>
                                    <path d="M6 6L18 18" />
                                    <path d="M18 6L6 18" />
                                </>
                            ) : (
                                <>
                                    <path d="M3 6H21" />
                                    <path d="M3 12H21" />
                                    <path d="M3 18H21" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            <div className={`${menuOpen ? "block" : "hidden"} md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md`}>
                <nav className="max-w-7xl mx-auto px-4 py-3 space-y-2">
                    {navLinks.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                                    isActive ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}

                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="w-full mt-2 px-3 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Log Out
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <NavLink
                                to="/login"
                                className="text-center px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Log In
                            </NavLink>
                            <NavLink
                                to="/register"
                                className="text-center px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Sign Up
                            </NavLink>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
