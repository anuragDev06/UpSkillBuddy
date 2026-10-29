import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FeatureAccessLimiter from '../components/FeatureAccessLimiter/FeatureAccessLimiter';
import { useAuth } from '../hooks/useAuth';

jest.mock('../hooks/useAuth');

describe('FeatureAccessLimiter Component - RTL Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders children directly when user is authenticated', () => {
        useAuth.mockReturnValue({ user: { username: 'testuser', email: 'test@example.com' } });

        render(
            <MemoryRouter>
                <FeatureAccessLimiter featureName="ATS Resume Scanner">
                    <div>Protected Content Area</div>
                </FeatureAccessLimiter>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content Area')).toBeInTheDocument();
        expect(screen.queryByText(/Unlock ATS Resume Scanner/i)).not.toBeInTheDocument();
    });

    test('renders unlock overlay when user is unauthenticated', () => {
        useAuth.mockReturnValue({ user: null });

        render(
            <MemoryRouter>
                <FeatureAccessLimiter featureName="Ai Job Search">
                    <div>Protected Content Area</div>
                </FeatureAccessLimiter>
            </MemoryRouter>
        );

        expect(screen.getByText(/Unlock Ai Job Search/i)).toBeInTheDocument();
        expect(screen.getByText(/Please Sign in or create a free account/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument();
    });
});
