import React from 'react';
import AnimatedSection from '../components/AnimatedSection';

const CareerPage: React.FC = () => {
    return (
        <div className="bg-transparent text-text-primary">
            <div className="max-w-7xl mx-auto py-8 md:py-16 px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <div className="text-center mb-10 md:mb-16">
                        <h1 className="text-3xl font-extrabold text-accent-orange sm:text-5xl">
                            Be A Part of Our Team
                        </h1>
                    </div>
                </AnimatedSection>

                <AnimatedSection delay="delay-100">
                    <div className="prose prose-lg mx-auto text-text-secondary">
                        <p className="mb-6 text-base md:text-lg text-justify md:text-left leading-relaxed">
                            Varcas Energy firmly believes that talented professionals are among our most vital resources. Varcas Energy has for some time now been broadening its horizons and looking beyond India. Its companies are concentrating on global competitiveness, leveraging global opportunities and acquiring global capabilities.
                        </p>
                        <p className="mb-6 text-base md:text-lg text-justify md:text-left leading-relaxed">
                            With attractive compensation packages, positive and productive work environments and challenging assignments across the world, Varcas Energy is committed to being the employer of choice wherever it operates, attracting and retaining the best of professionals.
                        </p>
                        <p className="mb-10 text-base md:text-lg text-justify md:text-left leading-relaxed">
                            By developing a structure, systems and a workplace culture that provides challenging jobs, rewards performance and delivers opportunities continuously, the group is striving to get the best out of its most valuable asset — its people. Powering that quest is an entire range of human resource initiatives aimed at realizing the potential of Varcas Energy employees.
                        </p>
                    </div>
                </AnimatedSection>

                <AnimatedSection delay="delay-200">
                    <div className="mt-12 md:mt-16 bg-glass-surface backdrop-blur-sm border border-glass-border p-8 rounded-lg text-center max-w-4xl mx-auto">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                            If you think you are creative, passionate and hard working, please send your resume at
                        </h2>
                        <div className="flex flex-col gap-4 justify-center items-center">
                            <a href="mailto:careers@varcasenergy.com" className="text-lg md:text-xl font-medium text-primary-blue hover:text-accent-cyan transition-colors duration-300 break-all">
                                careers@varcasenergy.com
                            </a>
                            <a href="mailto:hr@varcasenergy.com" className="text-lg md:text-xl font-medium text-primary-green hover:text-accent-yellow transition-colors duration-300 break-all">
                                hr@varcasenergy.com
                            </a>
                        </div>
                    </div>
                </AnimatedSection>


            </div>
        </div>
    );
};

export default CareerPage;
