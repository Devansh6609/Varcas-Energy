import React, { useState } from 'react';
// FIX: Changed to named import to resolve module export errors.
import { Link } from 'react-router-dom';
import { SUCCESS_STORIES } from '../constants.tsx';
import { StorySegment, SuccessStory } from '../types.ts';
import AnimatedSection from '../components/AnimatedSection.tsx';

const StoryCard: React.FC<{ story: SuccessStory }> = ({ story }) => (
    <div className="bg-glass-surface backdrop-blur-sm border border-glass-border rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
        <img className="w-full h-40 md:h-56 object-cover" src={story.image} alt={story.title} />
        <div className="p-4 md:p-6 flex flex-col flex-grow">
            <span className="text-xs md:text-sm font-semibold text-primary-green">{story.segment}</span>
            <h3 className="mt-1 md:mt-2 text-lg md:text-xl font-bold text-text-primary leading-tight">{story.title}</h3>
            <p className="mt-2 md:mt-3 text-sm md:text-base text-text-secondary italic flex-grow">"{story.customerQuote}"</p>
            <div className="mt-3 md:mt-4 border-t border-glass-border pt-3 md:pt-4 space-y-1">
                {story.roiData.map(data => (
                    <div key={data.label} className="flex justify-between text-xs md:text-sm">
                        <span className="text-text-secondary">{data.label}</span>
                        <span className="font-medium text-text-primary">{data.value}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 md:mt-6 text-center">
                <Link to={`/success-stories/${story.id}`} className="text-sm md:text-base font-bold text-primary-green hover:text-green-300 transition-colors">
                    View Case Study &rarr;
                </Link>
            </div>
        </div>
    </div>
);


const SuccessStoriesPage: React.FC = () => {
    const [filter, setFilter] = useState<StorySegment | 'All'>('All');

    const filteredStories = filter === 'All' ? SUCCESS_STORIES : SUCCESS_STORIES.filter(story => story.segment === filter);
    const segments: ('All' | StorySegment)[] = ['All', StorySegment.Residential, StorySegment.Agricultural, StorySegment.Commercial];

    return (
        <div className="bg-transparent text-text-primary">
            <div className="max-w-7xl mx-auto py-8 md:py-16 px-4 sm:px-6 lg:px-8">
                <AnimatedSection>
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
                            Success Stories
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary">
                            Real results from real customers across India. Explore our interactive case studies.
                        </p>
                    </div>
                </AnimatedSection>

                <AnimatedSection delay="delay-100">
                    <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-2 sm:gap-4">
                        {segments.map(segment => (
                            <button
                                key={segment}
                                onClick={() => setFilter(segment)}
                                className={`px-3 py-1.5 md:px-4 md:py-2 text-sm sm:text-base font-medium rounded-full transition-all duration-300 transform hover:scale-105 ${filter === segment ? 'bg-primary-green text-white shadow-md' : 'bg-glass-surface text-text-secondary hover:bg-white/10'}`}
                            >
                                {segment}
                            </button>
                        ))}
                    </div>
                </AnimatedSection>

                <div className="mt-8 md:mt-12 grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredStories.map((story, index) => (
                        <AnimatedSection key={story.id} delay={`delay-${(index % 3) * 100 + 200}`}>
                            <StoryCard story={story} />
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SuccessStoriesPage;
