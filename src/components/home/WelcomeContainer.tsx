"use client";

import { Button } from "@/components/ui/button";
import AnimatedText from "@/components/ui/AnimatedText";
import AnimatedContainer from "../ui/AnimatedContainer";
import { ANIMATION_DELAYS } from "./constants";
import Link from "next/link";

export default function WelcomeContainer() {
  return (
    <div className="relative z-20 flex min-h-screen flex-col items-center justify-center text-center px-4">
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-purple-100">
          <AnimatedText text="Join Me for a Chat" delay={0} />
          <span className="block">
            <AnimatedText
              className="text-6xl"
              text="“ Dale Carnegie ”"
              variant="word"
              delay={ANIMATION_DELAYS.SECOND_ANIMATION_START}
            />
          </span>
        </h1>
        <AnimatedContainer
          delay={ANIMATION_DELAYS.THIRD_ANIMATION_START}
          className="text-xl text-gray-100 w-full sm:w-3/4 mx-auto font-medium"
        >
          <p style={{ textShadow: "#00000030 1px 0 1px" }}>
            Bring your questions, concerns, and dreams. Let's make them happen
            together.
          </p>
          <Link href="/chat" className="block mt-6">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-purple-100 text-black hover:bg-purple-200/80"
            >
              Get Started
            </Button>
          </Link>
        </AnimatedContainer>
      </div>
    </div>
  );
}
