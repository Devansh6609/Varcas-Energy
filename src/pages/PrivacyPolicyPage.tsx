import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * Privacy Policy Page
 */
const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header />
            <main className="flex-grow pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-poppins">Privacy Policy</h1>
                    <p className="text-sm text-gray-500 mb-8">Last Updated: January 25, 2026</p>

                    <div className="prose prose-lg text-gray-700 max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                            <p>
                                Welcome to SuryaKiran Solar Solutions ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information.
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
                            <p className="mb-2">We may collect personal information that you provide to us voluntarily, including but not limited to:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>Name, email address, phone number, and mailing address.</li>
                                <li>Property details relevant to solar installation (e.g., roof size, electricity usage).</li>
                                <li>Financial information for billing and subsidies (e.g., bank account details, passbook copies).</li>
                                <li>Documents required for government approvals (e.g., Aadhar card, electricity bills).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
                            <p className="mb-2">We use the information we collect for the following purposes:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>To provide, operate, and maintain our solar installation services.</li>
                                <li>To process your applications for subsidies (e.g., PM Surya Ghar Muft Bijli Yojana).</li>
                                <li>To communicate with you regarding updates, offers, and customer support.</li>
                                <li>To comply with legal obligations and government regulations.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Information Sharing</h2>
                            <p>
                                We do not sell or rent your personal information to third parties. We may share your information with:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                                <li><strong>Start-ups/Vendors:</strong> Authorized partners involving in installation and material dispatch.</li>
                                <li><strong>Government Agencies:</strong> For subsidy approvals and net metering applications.</li>
                                <li><strong>Service Providers:</strong> Third-party companies that perform services on our behalf (e.g., payment processing, hosting).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no data transmission over the Internet is completely secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
                            <p>
                                You have the right to access, update, or delete your personal information. If you wish to exercise these rights, please contact us at support@suryakiransolar.com.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us:
                            </p>
                            <p className="mt-2 font-medium">SuryaKiran Solar Solutions</p>
                            <p>Email: info@suryakiransolar.com</p>
                            <p>Phone: +91 98765 43210</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
