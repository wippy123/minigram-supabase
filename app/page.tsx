import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to Minigram</h1>
      <p className="text-xl mb-8">
        Your AI-powered virtual assistant for seamless productivity and
        organization.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">What is Minigram?</h2>
          <p className="mb-4">
            Minigram is an innovative virtual assistant app designed to
            streamline your daily tasks, boost productivity, and help you stay
            organized. Powered by advanced AI technology, Minigram learns from
            your habits and preferences to provide personalized assistance
            tailored to your needs.
          </p>
          <Link href="/tasks" className="text-primary hover:underline">
            Explore Tasks &rarr;
          </Link>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Intelligent task management and prioritization</li>
            <li>Smart notifications and reminders</li>
            <li>Natural language processing for easy interaction</li>
            <li>Seamless integration with your calendar and email</li>
            <li>Customizable themes and settings</li>
            <li>Cross-platform synchronization</li>
          </ul>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            How Minigram Helps You
          </h2>
          <p className="mb-4">
            Minigram acts as your personal digital assistant, helping you manage
            your time more effectively, stay on top of your tasks, and reduce
            cognitive load. By analyzing your work patterns and preferences,
            Minigram provides intelligent suggestions and automates routine
            tasks, allowing you to focus on what truly matters.
          </p>
          <Link
            href="/account-settings"
            className="text-primary hover:underline"
          >
            Customize Your Experience &rarr;
          </Link>
        </div>

        <div className="bg-card rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
          <p className="mb-4">
            Ready to revolutionize your productivity? Start using Minigram today
            and experience the power of AI-assisted task management. Sign up for
            free and take the first step towards a more organized and efficient
            lifestyle.
          </p>
          <Link
            href="/login"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}
