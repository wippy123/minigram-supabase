import { usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'

export function usePostHogInit() {
  const posthog = usePostHog()

  useEffect(() => {
    if (!posthog.isFeatureEnabled("posthog-enabled")) {
      console.log("Initializing PostHog")
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") posthog.debug()
        },
      })
    }
  }, [posthog])

  return posthog
} 