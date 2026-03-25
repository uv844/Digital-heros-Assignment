import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose prose-slate max-w-none">
        <p className="text-gray-600 mb-4">Last updated: March 25, 2026</p>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, such as your name, email address, and golf scores. If you log in via Google, we receive your basic profile information as permitted by Google's privacy settings.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
          <p>We use your information to manage your account, track your golf scores for the charity draws, and process your contributions to your selected charities.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
          <p>We use Supabase (a secure backend service) to protect your data. We do not sell your personal information to third parties.</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
