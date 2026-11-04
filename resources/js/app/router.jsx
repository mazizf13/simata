import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppShell from '../components/AppShell';

import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import AssignmentsPage from '../features/assignments/AssignmentsPage';
import AssignmentDetailPage from '../features/assignments/AssignmentDetailPage';
import MitrasPage from '../features/mitras/MitrasPage';
import MitraDetailPage from '../features/mitras/MitraDetailPage';
import TeamsPage from '../features/teams/TeamsPage';
import TasksPage from '../features/tasks/TasksPage';
import SpksPage from '../features/spks/SpksPage';
import SpkDetailPage from '../features/spks/SpkDetailPage';
import BastsPage from '../features/basts/BastsPage';
import BastDetailPage from '../features/basts/BastDetailPage';
import ReportsPage from '../features/reports/ReportsPage';
import SettingsPage from '../features/settings/SettingsPage';
import BudgetAccountsPage from '../features/budget-accounts/BudgetAccountsPage';
import TutorialPage from '../features/tutorial/TutorialPage';

export const AppRouter = () => {
    return (
        <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

            {/* Protected App Routes */}
            <Route path="/app" element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="assignments" element={<AssignmentsPage />} />
                    <Route path="assignments/:id" element={<AssignmentDetailPage />} />
                    <Route path="mitras" element={<MitrasPage />} />
                    <Route path="mitras/:id" element={<MitraDetailPage />} />
                    <Route path="teams" element={<TeamsPage />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="budget-accounts" element={<BudgetAccountsPage />} />
                    <Route path="spks" element={<SpksPage />} />
                    <Route path="spks/:id" element={<SpkDetailPage />} />
                    <Route path="basts" element={<BastsPage />} />
                    <Route path="basts/:id" element={<BastDetailPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="tutorial" element={<TutorialPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
    );
};

export default AppRouter;
