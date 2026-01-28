import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, ArrowRight } from 'lucide-react';

interface SlideData {
    image: string;
    logo?: string;
    title?: string;
    subtitle?: string;
    features?: string[];
    cta?: string;
    ctaLink?: string;
    overlayColor?: string; // Optional custom overlay color/gradient
}

interface ImageSlideshowProps {
    slides: SlideData[] | string[]; // Support legacy string[] for backward compatibility
    autoSlide?: boolean;
    autoSlideInterval?: number;
    className?: string;
}

const ImageSlideshow: React.FC<ImageSlideshowProps> = ({
    slides,
    autoSlide = true,
    autoSlideInterval = 5000,
    className = ""
}) => {
    // Normalize input to SlideData[]
    const normalizedSlides: SlideData[] = typeof slides[0] === 'string'
        ? (slides as string[]).map(img => ({ image: img }))
        : (slides as SlideData[]);

    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? normalizedSlides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === normalizedSlides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };

    useEffect(() => {
        if (!autoSlide) return;

        const slideInterval = setInterval(() => {
            nextSlide();
        }, autoSlideInterval);

        return () => clearInterval(slideInterval);
    }, [currentIndex, autoSlide, autoSlideInterval]);

    return (
        <div className={`relative group w-full h-full overflow-hidden bg-black/90 ${className}`}>
            {/* Slides Stack */}
            {normalizedSlides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image */}
                    <img
                        src={slide.image}
                        alt={slide.title || `Slide ${index + 1}`}
                        className="w-full h-full object-cover" // Changed back to object-cover for full bleed banners, as per marketing examples
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center items-start text-white max-w-4xl">

                        {/* Text Content */}
                        <div className={`transition-all duration-700 delay-300 transform ${index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            {slide.title && (
                                <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 drop-shadow-lg uppercase text-white break-words max-w-full">
                                    {slide.title}
                                </h2>
                            )}

                            {slide.subtitle && (
                                <p className="text-lg md:text-2xl font-medium text-gray-100 mb-6 drop-shadow-md max-w-2xl bg-black/30 p-2 rounded-md backdrop-blur-sm inline-block">
                                    {slide.subtitle}
                                </p>
                            )}

                            {slide.features && (
                                <ul className="space-y-3 mb-8">
                                    {slide.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-base md:text-lg font-semibold text-white bg-black/20 p-1 px-3 rounded-full backdrop-blur-sm w-fit">
                                            <CheckCircle className="text-primary-green mr-2 fill-white" size={20} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {slide.cta && (
                                <button className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors shadow-xl flex items-center gap-2 transform hover:scale-105 active:scale-95 duration-200">
                                    {slide.cta}
                                    <ArrowRight size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Left Arrow */}
            <div className="hidden group-hover:block absolute top-[50%] -translate-y-[50%] left-5 z-20 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition-all backdrop-blur-sm">
                <ChevronLeft onClick={prevSlide} size={30} />
            </div>

            {/* Right Arrow */}
            <div className="hidden group-hover:block absolute top-[50%] -translate-y-[50%] right-5 z-20 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition-all backdrop-blur-sm">
                <ChevronRight onClick={nextSlide} size={30} />
            </div>
        </div>
    );
};

export default ImageSlideshow;
