import React from 'react';
import { render, screen } from '@testing-library/react';
import Loader from '../components/Loader/Loader';

describe('Loader Component - RTL Tests', () => {
    test('renders brand title "Up-Skill-Buddy"', () => {
        render(<Loader />);
        const brandHeading = screen.getByRole('heading', { name: /up-skill-buddy/i });
        expect(brandHeading).toBeInTheDocument();
    });

    test('renders status text "Getting things ready for you..."', () => {
        render(<Loader />);
        const statusText = screen.getByText(/getting things ready for you/i);
        expect(statusText).toBeInTheDocument();
    });

    test('renders modern spinner container', () => {
        const { container } = render(<Loader />);
        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });
});
