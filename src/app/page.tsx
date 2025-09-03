"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image src="/logo.png" alt="Logo" width={40} height={40} />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 font-semibold px-6 py-2 rounded-lg">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="bg-black hover:bg-gray-800 text-white border-0 font-bold px-8 py-3 rounded-xl shadow-lg">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6">
        <div className="text-center py-24">
          <Badge className="mb-8 bg-gray-100 text-gray-700 border-gray-200 px-6 py-3 rounded-full font-semibold text-sm tracking-wide">
            AI-Powered Journaling
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black mb-8 leading-[0.9] tracking-tight font-playfair">
            Your Personal
            <span className="block text-gray-600">
              AI Journal
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Write your thoughts and get instant AI-powered mood analysis and emotional insights.
            Track your mental well-being with intelligent journaling.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white font-black px-10 py-5 text-xl rounded-2xl shadow-lg">
              <Link href="/signup" className="flex items-center">
                Start Journaling
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
              <span className="font-semibold">Simple & Easy</span>
            </div>
            <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
              <span className="font-semibold">AI Powered</span>
            </div>
            <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
              <span className="font-semibold">Track Progress</span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <Card className="bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-black text-black mb-4 tracking-tight font-playfair">
                Simple Journaling
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                Write your daily thoughts and experiences in a clean, distraction-free interface.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-black text-black mb-4 tracking-tight font-playfair">
                Date Organization
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                Keep your entries organized by date with easy navigation and search functionality.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-black text-black mb-4 tracking-tight font-playfair">
                AI Mood Analysis
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                Get instant AI-powered analysis of your emotional state and mood patterns.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Simple Demo Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-20 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-black mb-4 font-playfair">
              How It Works
            </h2>
            <p className="text-gray-600 font-medium">Simple steps to better self-awareness</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <span className="text-gray-700 font-semibold">Write Your Entry</span>
              </div>
              <p className="text-gray-600 text-sm">Share your thoughts, feelings, and daily experiences in your personal journal.</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <span className="text-gray-700 font-semibold">AI Analysis</span>
              </div>
              <p className="text-gray-600 text-sm">Our AI instantly analyzes your entry to understand your emotional state and mood.</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <span className="text-gray-700 font-semibold">Track Progress</span>
              </div>
              <p className="text-gray-600 text-sm">See your emotional patterns over time and gain insights into your mental well-being.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image src="/logo.png" alt="Logo" width={24} height={24} />
              <span className="text-gray-600 font-medium">© 2025 Personal Journal. Simple AI journaling.</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-black transition-colors duration-300 font-medium">Privacy</a>
              <a href="#" className="hover:text-black transition-colors duration-300 font-medium">Terms</a>
              <a href="#" className="hover:text-black transition-colors duration-300 font-medium">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}