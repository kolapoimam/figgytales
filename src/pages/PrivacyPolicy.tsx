import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">
          Last updated: April 21, 2025
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p className="text-foreground">
            Welcome to FiggyTales. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our services.
          </p>

          <h2 className="text-xl font-semibold">2. Information We Collect</h2>
          <p className="text-foreground">
            We may collect the following types of information:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Personal Information: Name, email address, and payment information.</li>
              <li>Usage Data: Information about how you interact with our platform, such as IP address and browser type.</li>
              <li>Uploaded Content: Design mockups and user stories you create on our platform.</li>
            </ul>
          </p>

          <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
          <p className="text-foreground">
            We use your information to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Provide and improve our services.</li>
              <li>Process payments and manage subscriptions.</li>
              <li>Communicate with you about updates, promotions, and support.</li>
            </ul>
          </p>

          <h2 className="text-xl font-semibold">4. Data Security</h2>
          <p className="text-foreground">
            We implement industry-standard security measures to protect your data, including encryption and secure authentication protocols.
          </p>

          <h2 className="text-xl font-semibold">5. Contact Us</h2>
          <p className="text-foreground">
            If you have any questions about this Privacy Policy, please contact us at support@figgytales.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
