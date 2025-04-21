import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-6">
          Last updated: April 21, 2025
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-foreground">
            By using FiggyTales, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
          </p>

          <h2 className="text-xl font-semibold">2. Use of Services</h2>
          <p className="text-foreground">
            You agree to use FiggyTales only for lawful purposes and in accordance with these terms. You are responsible for all content you upload to our platform.
          </p>

          <h2 className="text-xl font-semibold">3. Subscription and Payment</h2>
          <p className="text-foreground">
            Some features of FiggyTales require a paid subscription. You agree to provide accurate payment information and authorize us to charge your payment method for the applicable fees.
          </p>

          <h2 className="text-xl font-semibold">4. Termination</h2>
          <p className="text-foreground">
            We reserve the right to terminate or suspend your account at our discretion, including for violation of these terms.
          </p>

          <h2 className="text-xl font-semibold">5. Contact Us</h2>
          <p className="text-foreground">
            If you have any questions about these Terms of Service, please contact us at support@figgytales.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
