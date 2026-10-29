import { useAuth } from '../../hooks/useAuth'
import { Navigate } from 'react-router'
import React from 'react'
import Layout from '../../Layout'
import Home from '../../pages/Home'

const Protected = ({ children }) => {
    const { loading, user } = useAuth()


    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-white">
                <h1 className="text-xl font-semibold text-slate-600 animate-pulse">Loading...</h1>
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }
    return children



}

export default Protected