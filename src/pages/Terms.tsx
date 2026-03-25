import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-gray-600 mb-4">Last updated: March 25, 2026</p>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
          <p>By accessing Digital Heroes Golf Charity, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Eligibility</h2>
          <p>You must be at least 18 years old to participate in the charity draws. You agree to provide accurate information when submitting golf scores.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Charity Contributions</h2>
          <p>A percentage of all winnings is automatically contributed to your selected charity. These contributions are non-refundable.</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
