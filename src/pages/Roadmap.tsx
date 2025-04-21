import React from 'react';

const Roadmap: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Our Roadmap</h1>
        <p className="text-center text-muted-foreground mb-12">
          See what’s coming next for FiggyTales. We’re constantly working to improve your experience.
        </p>

        <div className="space-y-8">
          {/* Q2 2025 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Q2 2025 - Collaboration Enhancements</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li>Real-time collaboration for teams to work on user stories together.</li>
              <li>Commenting and feedback system for design mockups.</li>
              <li>Integration with Slack and Microsoft Teams for notifications.</li>
            </ul>
          </div>

          {/* Q3 2025 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Q3 2025 - Advanced AI Features</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li>AI-generated acceptance criteria for user stories.</li>
              <li>Improved mockup analysis with automated design suggestions.</li>
              <li>Export user stories to Jira and Trello directly.</li>
            </ul>
          </div>

          {/* Q4 2025 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Q4 2025 - Enterprise Solutions</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li>Single Sign-On (SSO) support for enterprise customers.</li>
              <li>Custom reporting and analytics dashboard.</li>
              <li>Dedicated support and training sessions.</li>
            </ul>
          </div>
        </div>

        <p className="text-center text-muted-foreground mt-12">
          Have a feature request? Let us know at support@figgytales.com.
        </p>
      </div>
    </div>
  );
};

export default Roadmap;
