import React from 'react';
import AnimatedSection from '../components/AnimatedSection';
import aboutOverview from '../assets/about-us/about-overview.png';
import aboutMission from '../assets/about-us/about-mission.png';
import aboutVision from '../assets/about-us/about-vision.png';
import aboutSustainability from '../assets/about-us/about-sustainability.png';
import aboutQuality from '../assets/about-us/about-quality.png';
import ImageSlideshow from '../components/ImageSlideshow';

const TeamMemberCard: React.FC<{ name: string; title: string; description: string; image: string; nameColor: string; }> = ({ name, title, description, image, nameColor }) => (
    <div className="text-center transform hover:scale-105 transition-transform duration-300 min-w-[280px] md:min-w-0 p-4">
        <div className="bg-gray-200 aspect-[4/5] w-full max-w-[200px] mx-auto rounded-lg mb-4 overflow-hidden shadow-lg relative">
            <img className="w-full h-full object-cover" src={image} alt={name} />
        </div>
        <h3 className={`mt-4 text-xl md:text-2xl font-bold ${nameColor}`}>{name}</h3>
        <p className="font-bold text-sm md:text-base text-text-primary mt-1 min-h-[3rem] items-center flex justify-center">{title}</p>
        <p className="mt-4 text-sm md:text-base text-text-secondary text-center leading-relaxed px-2">
            {description}
        </p>
    </div>
);

const AboutUsPage: React.FC = () => {
    const slides = [
        {
            image: aboutOverview,
            title: "Pioneering Sustainable Energy",
            subtitle: "Illuminating a Brighter Future for India",
            features: [
                "Leading the Green Revolution",
                "Advanced Solar Technology",
                "Nationwide Impact"
            ],
            cta: "Discover Our Journey"
        },
        {
            image: aboutMission,
            title: "Our Mission",
            subtitle: "Simple, Affordable, Accessible Solar for Everyone",
            features: [
                "Empowering Communities",
                "Reducing Energy Costs",
                "Energy Independence"
            ],
            cta: "Join Our Mission"
        },
        {
            image: aboutVision,
            title: "Our Vision",
            subtitle: "Every Home a Power Plant, Every Farm Energy Independent",
            features: [
                "Self-Sufficient India",
                "Clean Energy for All",
                "Building a Resilient Future"
            ],
            cta: "See the Future"
        },
        {
            image: aboutSustainability,
            title: "Committed to Stewardship",
            subtitle: "Reducing Carbon Footprints, One System at a Time",
            features: [
                "Environmental Responsibility",
                "Sustainable Practices",
                "Preserving Nature"
            ]
        },
        {
            image: aboutQuality,
            title: "Uncompromising Quality",
            subtitle: "Innovation and Customer Satisfaction at Our Core",
            features: [
                "Expert Engineering",
                "Premium Materials",
                "Trusted by Thousands"
            ],
            cta: "Experience Excellence"
        }
    ];

    return (
        <div className="bg-transparent text-text-primary">
            <div className="max-w-7xl mx-auto py-8 md:py-16 px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
                            About Us
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary">
                            Pioneering India's transition to sustainable energy.
                        </p>
                    </div>
                </AnimatedSection>

                <div className="mt-10 md:mt-16 grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
                    <AnimatedSection>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-green">Suryakiran Green Wave Pvt. Ltd.</h2>
                            <p className="mt-4 text-base md:text-lg text-text-secondary text-justify md:text-left leading-relaxed">
                                Suryakiran Green Wave Pvt. Ltd. is a company that's passionate about harnessing the power of the sun to illuminate a brighter future. As a leading provider of solar solutions, our mission is to deliver top-quality products and services that meet the unique needs of our customers.
                            </p>
                            <p className="mt-4 text-base md:text-lg text-text-secondary text-justify md:text-left leading-relaxed">
                                With a strong commitment to sustainability and environmental stewardship, we're dedicated to helping individuals, businesses, and communities reduce their carbon footprint and contribute to a cleaner environment. By prioritizing innovation, quality, and customer satisfaction, we aim to make a positive impact on the world and create a more sustainable future for generations to come.
                            </p>
                        </div>
                    </AnimatedSection>
                    <AnimatedSection delay="delay-100">
                        <ImageSlideshow
                            slides={slides}
                            className="h-[500px] md:h-full min-h-[500px] !py-0 !px-0 rounded-lg shadow-xl overflow-hidden"
                        />
                    </AnimatedSection>
                </div>

                <div className="mt-10 md:mt-20 text-center">
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white">Meet Our Leadership</h2>
                    </AnimatedSection>
                    <div className="mt-8 md:mt-12 flex overflow-x-auto md:overflow-visible pb-6 md:pb-0 md:grid md:grid-cols-3 gap-8 snap-x snap-mandatory hide-scrollbar">
                        <div className="snap-center shrink-0 first:pl-4 last:pr-4 md:first:pl-0 md:last:pr-0 w-[85vw] md:w-auto">
                            <TeamMemberCard
                                name="Gautam Patel"
                                title="Visionary Leader (Founder & Managing Director)"
                                description="A dynamic and visionary leader, Gautam Patel has played a pivotal role in the success and growth of Suryakiran. His profound understanding of the market and ability to drive progress have been instrumental in the company's journey."
                                image="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                nameColor="text-accent-orange"
                            />
                        </div>
                        <div className="snap-center shrink-0 w-[85vw] md:w-auto">
                            <TeamMemberCard
                                name="Pankit Patel"
                                title="Inspirational Entrepreneur (Managing Director)"
                                description="As Managing Director, Pankit Patel is a remarkable entrepreneur and a source of inspiration. He has consistently demonstrated exceptional entrepreneurial skills and innovative thinking, guiding Suryakiran toward new horizons."
                                image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                nameColor="text-primary-blue"
                            />
                        </div>
                        <div className="snap-center shrink-0 w-[85vw] md:w-auto">
                            <TeamMemberCard
                                name="Uma Patel"
                                title="Inspirational Entrepreneur (Managing Director)"
                                description="Serving as Managing Director, Uma Patel is an inspiring figure for aspiring entrepreneurs. She combines courageous leadership with visionary thinking and strong capability in fostering entrepreneurial development."
                                image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                                nameColor="text-primary-green"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10 md:mt-20 text-center">
                    <AnimatedSection>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-primary-green">Our Mission & Vision</h2>
                        <p className="mt-4 max-w-4xl mx-auto text-base md:text-lg text-text-secondary leading-relaxed">
                            Our mission is to accelerate India's adoption of solar energy by making it simple, affordable, and accessible for everyone. We envision a future where every home is a power plant, and every farm is energy-independent, contributing to a cleaner, more prosperous nation.
                        </p>
                    </AnimatedSection>
                </div>

                <AnimatedSection>
                    <div className="mt-10 md:mt-20 bg-glass-surface backdrop-blur-sm border border-glass-border p-8 md:p-12 rounded-lg">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">Our Affiliations & Certifications</h2>
                        <div className="mt-8 flow-root">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 justify-items-center">
                                <div className="flex flex-col items-center text-center p-2">
                                    <span className="text-2xl md:text-4xl font-bold text-primary-green">MNRE</span>
                                    <p className="text-xs md:text-sm text-text-secondary mt-1 md:mt-2">Approved Installer</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-2">
                                    <span className="text-2xl md:text-4xl font-bold text-primary-green">ISO 9001</span>
                                    <p className="text-xs md:text-sm text-text-secondary mt-1 md:mt-2">Quality Management</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-2">
                                    <span className="text-2xl md:text-4xl font-bold text-primary-blue">DISCOM</span>
                                    <p className="text-xs md:text-sm text-text-secondary mt-1 md:mt-2">State Nodal Agency</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-2">
                                    <span className="text-2xl md:text-4xl font-bold text-green-500">NABARD</span>
                                    <p className="text-xs md:text-sm text-text-secondary mt-1 md:mt-2">Finance Partner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </div>
    );
};

export default AboutUsPage;
