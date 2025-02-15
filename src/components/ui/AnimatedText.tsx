"use client";
import { motion, Variants } from "motion/react";
import { useEffect, useState } from "react";

type AnimationVariant = "letter" | "word";

const AnimatedText = ({
    text,
    className = "",
    variant = "letter",
    delay = 0,
}: {
    text: string;
    className?: string;
    variant?: AnimationVariant;
    delay?: number;
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [delay]);

    // Animation configuration for each element (letter or word)
    const elementVariants: Variants = {
        hidden: { 
            opacity: 0, 
            y: 20,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 260,
                damping: 14,
            }
        },
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: (variant: AnimationVariant) => ({
            opacity: 1,
            transition: {
                staggerChildren: variant === "letter" ? 0.025 : 0.12,
                type: "spring",
                stiffness: 260,
                damping: 14,
            }
        })
    };

    const renderContent = () => {
        switch (variant) {
            case "word":
                return (
                    <motion.span className="inline-block">
                        {text.split(" ").map((word, index) => (
                            <motion.span
                                key={word + "-" + index}
                                variants={elementVariants}
                                className="inline-block mr-[0.25em]"
                            >
                                {word}
                            </motion.span>
                        ))}
                    </motion.span>
                );
            default: // letter by letter
                return (
                    <motion.span className="inline-block">
                        {text.split("").map((char, index) => (
                            <motion.span
                                key={char + "-" + index}
                                variants={elementVariants}
                                className="inline-block"
                            >
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        ))}
                    </motion.span>
                );
        }
    };

    return (
        <motion.p
            className={`w-full mx-auto py-2 flex items-center justify-center text-center overflow-hidden ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            custom={variant}
        >
            {renderContent()}
        </motion.p>
    );
};

export default AnimatedText;