"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Smartphone,
  Video,
  Presentation,
  PenTool,
  Share2,
  BarChart3,
  UserPlus,
  Code,
  Gamepad2,
  SlidersHorizontal,
  Film,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function AcmeRubberBandGame() {
  const [stretch, setStretch] = useState(0);
  const [coyotePosition, setCoyotePosition] = useState(0);
  const [targetPosition, setTargetPosition] = useState(80);
  const [isLaunched, setIsLaunched] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const resetTarget = useCallback(() => {
    setTargetPosition(Math.floor(Math.random() * 40) + 60); // Random position between 60-100
  }, []);

  useEffect(() => {
    resetTarget();
  }, [resetTarget]);

  useEffect(() => {
    if (isLaunched) {
      const interval = setInterval(() => {
        setCoyotePosition((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsLaunched(false);
            setAttempts((a) => a + 1);
            if (Math.abs(prev - targetPosition) <= 5) {
              setScore((s) => s + 1);
            }
            if (attempts + 1 >= 5) {
              setGameOver(true);
            } else {
              resetTarget();
            }
            return 0;
          }
          return prev + 5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isLaunched, targetPosition, attempts, resetTarget]);

  const handleStretch = (value: number[]) => {
    setStretch(value[0]);
  };

  const handleLaunch = () => {
    setIsLaunched(true);
    setCoyotePosition(0);
  };

  const handleReset = () => {
    setStretch(0);
    setCoyotePosition(0);
    setIsLaunched(false);
    setScore(0);
    setAttempts(0);
    setGameOver(false);
    resetTarget();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center">
        Acme Inc. Giant Rubber Band v3
      </h3>
      <div className="relative h-48 bg-gradient-to-b from-blue-200 to-blue-400 rounded-lg overflow-hidden">
        <div
          className="absolute bottom-0 left-0 w-12 h-12 transition-all duration-300 ease-in-out"
          style={{ transform: `translateX(${coyotePosition}%)` }}
        >
          <Image
            src="/placeholder.svg?height=48&width=48"
            width={48}
            height={48}
            alt="Coyote"
            className="w-full h-full object-contain"
          />
        </div>
        <div
          className="absolute top-1/2 w-16 h-16 transform -translate-y-1/2"
          style={{ left: `${targetPosition}%` }}
        >
          <Image
            src="/placeholder.svg?height=64&width=64"
            width={64}
            height={64}
            alt="Target"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-brown-600 to-brown-400" />
      </div>
      <Slider
        value={[stretch]}
        onValueChange={handleStretch}
        max={100}
        step={1}
        disabled={isLaunched || gameOver}
      />
      <div className="flex justify-between">
        <Button
          onClick={handleLaunch}
          disabled={isLaunched || gameOver || stretch === 0}
        >
          Launch Coyote
        </Button>
        <Button onClick={handleReset} variant="outline">
          {gameOver ? "Play Again" : "Reset"}
        </Button>
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm">
          Stretch: {stretch}% | Target: {targetPosition}%
        </p>
        <p className="text-lg font-semibold">Score: {score} / 5</p>
        {gameOver && (
          <p className="text-xl font-bold text-primary">
            Game Over! Final Score: {score}
          </p>
        )}
      </div>
    </div>
  );
}

export function OverviewPage() {
  const getUser = async () => {
    const supabase = createClientComponentClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  };

  useEffect(() => {
    console.log("OverviewPage mounted");
    getUser();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Minigram Overview</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center space-x-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Minigram-B1qj7xdDD4HbyAb8AuPXNkoaHU6VX2.png"
              alt="Minigram Logo"
              width={64}
              height={64}
              className="rounded-full"
            />
            <CardTitle className="text-2xl">What is Minigram?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              Minigram is the app to{" "}
              <span className="font-bold text-primary">Amplify your Brand</span>
              . It empowers you to create engaging content that resonates with
              your audience and strengthens your brand identity.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-6 w-6 text-primary" />
                <span>Create interactive apps</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-6 w-6 text-primary" />
                <span>Design engaging games</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="h-6 w-6 text-primary" />
                <span>Produce captivating videos</span>
              </div>
              <div className="flex items-center space-x-2">
                <Presentation className="h-6 w-6 text-primary" />
                <span>Craft informative slides</span>
              </div>
            </div>
            <p>
              With Minigram, you can create content that not only interests your
              users but also effectively communicates your brand's message and
              values.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Brand Amplification</Badge>
              <Badge variant="outline">User Engagement</Badge>
              <Badge variant="outline">Content Creation</Badge>
              <Badge variant="outline">Interactive Media</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl">How Minigram Works</CardTitle>
            <CardDescription>
              Amplify your brand in three simple steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary rounded-full p-3">
                <PenTool className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">1. Create</h3>
                <p>
                  Use your favorite online editor to craft engaging content:
                </p>
                <ul className="list-disc list-inside pl-4">
                  <li>
                    <Link
                      href="https://v0.dev/"
                      className="text-primary hover:underline"
                    >
                      Vercel v0
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.perplexity.ai/hub/blog/perplexity-pages"
                      className="text-primary hover:underline"
                    >
                      Perplexity Pages
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://bolt.new/"
                      className="text-primary hover:underline"
                    >
                      Bolt.new
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary rounded-full p-3">
                <Share2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">2. Distribute</h3>
                <p>Share your content across popular social media channels:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>Instagram</li>
                  <li>Facebook</li>
                  <li>X (Twitter)</li>
                  <li>LinkedIn</li>
                  <li>Blogs</li>
                  <li>Email</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary rounded-full p-3">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">3. Measure</h3>
                <p>Track the performance of your content across channels:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>Views</li>
                  <li>Engagements</li>
                  <li>Shares</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl">Minigram Tutorial</CardTitle>
            <CardDescription>
              Get started with creating your first Minigram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary rounded-full p-3">
                <UserPlus className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Step 1: Create an Account
                </h3>
                <p>Sign up with one of these powerful online editors:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>
                    <Link
                      href="https://v0.dev/"
                      className="text-primary hover:underline"
                    >
                      Vercel v0
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.perplexity.ai/hub/blog/perplexity-pages"
                      className="text-primary hover:underline"
                    >
                      Perplexity Pages
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://bolt.new/"
                      className="text-primary hover:underline"
                    >
                      Bolt.new
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary rounded-full p-3">
                <Code className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Step 2: Choose Your Content Type
                </h3>
                <p>Select the type of content you want to create:</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <span>Interactive App</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                    <span>Engaging Game</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                    <span>Slide Show</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Film className="h-5 w-5 text-primary" />
                    <span>Animated Movie</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary rounded-full p-3">
                <PenTool className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Step 3: Design and Create
                </h3>
                <p>
                  Use the editor's tools to bring your vision to life. Add
                  interactivity, animations, and brand elements to make your
                  Minigram stand out.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary rounded-full p-3">
                <Share2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Step 4: Publish and Share
                </h3>
                <p>
                  Once you're satisfied with your creation, publish it and share
                  it across your chosen platforms to engage your audience and
                  amplify your brand.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl">Sample Minigram</CardTitle>
            <CardDescription>
              Interactive game showcasing Acme Inc.'s Giant Rubber Band v3
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AcmeRubberBandGame />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
