import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="dashboard-layout">
      {/* We can add dashboard-specific shared UI here later, like a sub-header or navigation specific to dashboard sections */}
      {children}
    </section>
  );
}
