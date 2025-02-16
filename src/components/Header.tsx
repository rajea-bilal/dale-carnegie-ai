'use client';

import { SignInButton, SignUpButton, useUser, UserButton } from "@clerk/nextjs";
import { BookOpenText } from "lucide-react"; // Using Lucide icons
import Link from "next/link";
import { useAuth } from '@clerk/nextjs';

const Header = () => {
    const { isSignedIn } = useAuth();

    return (
        <header className="fixed top-0 left-0 w-full">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Left - Icon */}
                <div className="flex items-center">
                    <Link href="/">
                        <BookOpenText className="w-8 h-8 text-green-200 hover:text-green-300 transition-colors cursor-pointer" />
                    </Link>
                </div>

                {/* Middle - Title */}
                <div className="text-xl font-semibold text-white">
                    Chat With Carnegie
                </div>

                {/* Right - Auth Buttons */}
                <div className="flex items-center gap-4">
                    {!isSignedIn ? (
                        <>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 text-sm text-white font-bold border border-white hover:text-green-300 hover:border-green-300 rounded-md transition">
                                    Sign in
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="px-4 py-2 text-sm bg-green-400 font-bold text-white hover:bg-green-500 rounded-md transition">
                                    Sign up
                                </button>
                            </SignUpButton>
                        </>
                    ) : (
                        <UserButton />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header; 