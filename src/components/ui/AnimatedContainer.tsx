"use client";
import { motion, Variants } from "motion/react";
import { ReactNode } from "react";
import { useAnimationDelay } from "@/hooks/useAnimationDelay";

const AnimatedContainer = ({
    children,
    className = "",
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) => {
    const isVisible = useAnimationDelay(delay);

    const elementVariants: Variants = {
        hidden: { 
            opacity: 0, 
            y: 18,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 240,
                damping: 18,
            }
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 240,
                damping: 18,
            }
        }
    };

    return (
        <motion.div
            className={`w-full mx-auto py-2 flex items-center justify-center text-center overflow-hidden border-4 border-red-500 ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
        >
            <motion.div
                variants={elementVariants}
                className="inline-block"
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

export default AnimatedContainer;
