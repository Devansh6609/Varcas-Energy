import React from 'react';
import { Testimonial, SuccessStory, StorySegment, PipelineStage } from './types';
import logoUrl from './assets/suryakiran.png';
import sharmaResidenceImage from './assets/success-story-sharma-residence.png';
import patelFarmsImage from './assets/success-story-patel-farms.png';
import guptaTextilesImage from './assets/success-story-gupta-textiles.png';
import jaipurHomeImage from './assets/success-story-jaipur-smart-home.png';


export const NAV_LINKS = [
    { name: 'Home', path: '/' },
    { name: 'Rooftop Solar', path: '/rooftop-solar' },
    { name: 'Solar Pumps', path: '/solar-pumps' },
    { name: 'Success Stories', path: '/success-stories' },
    { name: 'Subsidies & Finance', path: '/subsidies' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
];

export const HERO_HEADLINES = [
    "Pioneering India's Green Revolution with End-to-End Solar Solutions.",
    "Secure Your Family's Future and Achieve Zero Electricity Bills.",
    "Empowering India's Farmers with Reliable, Cost-Effective Solar Water Pumps.",
    "Navigate Government Subsidies with Our Expert Guidance for Maximum Benefits.",
];

export const HERO_MARQUEE_TEXT = [
    "Achieve Zero Electricity Bills with Rooftop Solar.",
    "25-Year Performance Warranty on All Panels.",
    "Secure Your Farm's Future with a PM-KUSUM Solar Pump.",
    "MNRE Approved & ISO 9001 Certified Installer.",
    "Go Solar, Go Green: Save Money and the Planet.",
];

export const TESTIMONIALS: Testimonial[] = [
    {
        quote: "Our electricity bills have vanished! SuryaKiran's team handled the entire subsidy process flawlessly. Highly recommended for any homeowner.",
        name: 'Anjali & Rohan Mehta',
        segment: StorySegment.Residential,
        image: 'https://picsum.photos/seed/anjali/100/100',
    },
    {
        quote: "Switching to a solar pump has secured our irrigation and our future. We've saved over ₹40,000 on diesel in the first year alone. The crop yield has never been better.",
        name: 'Balwinder Singh',
        segment: StorySegment.Agricultural,
        image: 'https://picsum.photos/seed/balwinder/100/100',
    },
    {
        quote: "The professionalism and technical expertise of SuryaKiran are unmatched. Our commercial unit now runs on clean energy, and the ROI is even better than projected.",
        name: 'Priya Desai, Factory Manager',
        segment: StorySegment.Commercial,
        image: 'https://picsum.photos/seed/priya/100/100',
    },
];

export const SUCCESS_STORIES: SuccessStory[] = [
    {
        id: 1,
        title: "The Sharma Residence: Zero Bill Achievement",
        segment: StorySegment.Residential,
        image: sharmaResidenceImage,
        customerQuote: "We haven't paid an electricity bill in six months. The installation was quick, and the team educated us on how to maximize our savings. It feels great to be energy independent.",
        roiData: [
            { label: 'System Size', value: '5 kW' },
            { label: 'Annual Savings', value: '₹ 60,000' },
            { label: '25-Year Savings', value: '₹ 15 Lakhs' },
            { label: 'Payback Period', value: '4.5 Years' },
        ],
    },
    {
        id: 2,
        title: "Patel Farms: 30% Crop Yield Increase",
        segment: StorySegment.Agricultural,
        image: patelFarmsImage,
        customerQuote: "Consistent water supply from the solar pump transformed our farm. We're now able to grow a third crop cycle, which has increased our income significantly. No more diesel expenses!",
        roiData: [
            { label: 'Pump Capacity', value: '7.5 HP' },
            { label: 'Annual Diesel Savings', value: '₹ 42,000' },
            { label: 'Crop Yield Increase', value: '30%' },
            { label: 'PM-KUSUM Subsidy', value: '60%' },
        ],
    },
    {
        id: 3,
        title: "Gupta Textiles: Slashing Operational Costs",
        segment: StorySegment.Commercial,
        image: guptaTextilesImage,
        customerQuote: "Our factory's energy overhead was a major concern. The 50kW rooftop system from SuryaKiran has cut our power costs by over 70%, making us more competitive in the market.",
        roiData: [
            { label: 'System Size', value: '50 kW' },
            { label: 'Monthly Savings', value: '₹ 85,000' },
            { label: 'Carbon Footprint Reduction', value: '55 Tons/Year' },
            { label: 'Project ROI', value: '22%' },
        ],
    },
    {
        id: 4,
        title: "Jaipur Smart Home: Future-Proof Energy",
        segment: StorySegment.Residential,
        image: jaipurHomeImage,
        customerQuote: "Integrating solar with our smart home setup was a dream. SuryaKiran provided a seamless solution with high-efficiency panels. We even charge our EV for free!",
        roiData: [
            { label: 'System Size', value: '8 kW' },
            { label: 'Annual Savings', value: '₹ 96,000' },
            { label: 'Subsidy Availed', value: '₹ 78,000' },
            { label: 'Payback Period', value: '4 Years' },
        ],
    },
];

export const FAQ_DATA = [
    {
        question: "What is the average cost of a rooftop solar system?",
        answer: "The cost varies depending on the system size. For a typical 3 kW system, the cost is around ₹1,80,000 to ₹2,10,000. However, with the PM Surya Ghar subsidy of ₹78,000, the net cost to the customer is significantly lower. We also offer flexible EMI and loan options."
    },
    {
        question: "How much can I save on my electricity bills?",
        answer: "With a properly sized system, you can reduce your electricity bills to zero. Any surplus energy generated is exported to the grid, and you get credits for it, further reducing or eliminating your bill. On average, a 1 kW system saves you about ₹1,000 per month."
    },
    {
        question: "How does the PM-KUSUM subsidy for solar pumps work?",
        answer: "Under PM-KUSUM, farmers typically receive a total subsidy of 60% (30% from the Central Government and 30% from the State Government). You only need to pay 40% of the cost, and bank loans are available for up to 30% of the total cost, meaning your upfront contribution can be as low as 10%."
    },
    {
        question: "How long does the installation process take?",
        answer: "For a residential rooftop system, the physical installation usually takes only 2-3 days. The complete process, including subsidy application, DISCOM approval, and net meter installation, can take between 45 to 120 days. Our team handles all the paperwork to ensure a smooth process for you."
    },
    {
        question: "What is the lifespan of a solar panel system?",
        answer: "Our Tier-1 solar panels come with a 25-year performance warranty. The panels can continue to produce power for 30 years or more. The inverter typically has a warranty of 5-10 years and might need replacement once during the system's lifetime."
    }
];

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
    <img src={logoUrl} alt="SuryaKiran Solar Solutions Logo" className={`h-20 md:h-[150px] w-auto ${className}`} />
);

export const ADMIN_NAV_LINKS = [
    {
        name: 'Dashboard',
        path: '/admin',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-6 md:w-6"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Leads Pipeline',
        path: '/admin/leads',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-6 md:w-6"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Offline Entry',
        path: '/admin/leads/manual',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-6 md:w-6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Vendor Management',
        path: '/admin/vendors',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-6 md:w-6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
        roles: ['Master'],
    },
    {
        name: 'Admin Management',
        path: '/admin/admins',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-6 md:w-6"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>,
        roles: ['Master'],
    },
    {
        name: 'Data Explorer',
        path: '/admin/data-explorer',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-6 md:w-6"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>,
        roles: ['Master', 'Vendor'],
    },
    {
        name: 'Form Builder',
        path: '/admin/form-builder',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-6 md:w-6"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
        roles: ['Master'],
    },
    {
        name: 'Settings',
        path: '/admin/settings',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 md:h-6 md:w-6"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
        roles: ['Master'],
    }
];

export const PIPELINE_STAGES: PipelineStage[] = [
    PipelineStage.NewLead,
    PipelineStage.VerifiedLead,
    PipelineStage.Qualified,
    PipelineStage.SiteSurveyScheduled,
    PipelineStage.ProposalSent,
    PipelineStage.Negotiation,
    PipelineStage.ClosedWon,
    PipelineStage.ClosedLost,
];