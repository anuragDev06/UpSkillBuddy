import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AiJobSearch from '../Features/AiJobSearch';
import { useAuth } from '../hooks/useAuth';

jest.mock('../hooks/useAuth');

describe('AiJobSearch Component - RTL Tests', () => {
    test('renders job search interface when authenticated', () => {
        useAuth.mockReturnValue({ user: { username: 'testuser' } });

        render(
            <MemoryRouter>
                <AiJobSearch />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /ai job search/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter your job title here\.\.\./i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /scan resume formatting/i })).toBeInTheDocument();
    });
});
