import { createBrowserRouter, createRoutesFromElements, Route } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Protected from "./components/Protected/protected"
import Layout from "./Layout";
import UserDashboard from "./pages/UserDashBoard";
import ATSscore from "./Features/ATSscore";
import MatchScore from "./Features/MatchScore";
import EnhanceResume from "./Features/EnhanceResume";
import AiJobSearch from "./Features/AiJobSearch";
import Interview from "./Features/Interview";



export const router = createBrowserRouter(
    createRoutesFromElements(
        <>

            <Route path="/" element={<Layout />} >
                <Route index element={<Home />} />
                <Route path='dashboard' element={<Protected><UserDashboard /></Protected>} />
                <Route path="atsScore" element={< ATSscore />} />
                <Route path="matchScore" element={<MatchScore />} />
                <Route path="resumeEnhancer" element={<EnhanceResume />} />
                <Route path="aiJobSearch" element={<AiJobSearch />} />
                <Route path="mockInterview" element={<Interview />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </>
    )
)


