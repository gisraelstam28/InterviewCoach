"use client"

import { useEffect } from "react"
import CollapsibleCard from "@/components/interview-prep/ui/collapsible-card"
import { useInterviewPrepStore } from "../../../store/interview-prep-store"

interface StarStoryBankSectionProps {}

// Mock data
const mockData = {
  starStories: [
    {
      id: 1,
      competency: "Problem Solving",
      situation:
        "Our team was facing a critical performance issue with our main product page, loading times were exceeding 5 seconds.",
      task: "I was tasked with identifying the bottlenecks and improving the page load time to under 2 seconds.",
      action:
        "I conducted a thorough performance audit using Lighthouse and Chrome DevTools. I identified several issues including render-blocking resources, unoptimized images, and inefficient API calls. I implemented code splitting, lazy loading of components, image optimization, and restructured our API calls to be more efficient.",
      result:
        "The page load time was reduced to 1.8 seconds, a 64% improvement. This led to a 15% increase in conversion rate and significantly improved user experience metrics.",
    },
    {
      id: 2,
      competency: "Leadership",
      situation:
        "Our team was struggling with meeting sprint commitments and had accumulated significant technical debt.",
      task: "As the senior developer, I needed to help the team improve our delivery process and address the technical debt.",
      action:
        "I organized a series of workshops to identify pain points in our process. I introduced better estimation techniques, implemented a code review process, and allocated 20% of each sprint to technical debt reduction. I also mentored junior developers to improve their skills.",
      result:
        "Within three months, our sprint completion rate improved from 70% to 95%. We reduced our bug backlog by 40% and significantly improved code quality metrics.",
    },
    {
      id: 3,
      competency: "Adaptability",
      situation:
        "Midway through a major project, our client significantly changed their requirements, requiring us to pivot our approach.",
      task: "I needed to quickly adapt our existing work to meet the new requirements while minimizing delays.",
      action:
        "I conducted an impact analysis to identify which components could be reused and which needed to be rebuilt. I reorganized the team to focus on the highest priority changes first. I also negotiated with the client to phase some of the changes to allow for a more manageable transition.",
      result:
        "We successfully delivered the revised project with only a two-week delay from the original timeline. The client was extremely satisfied with our flexibility and the quality of the final product.",
    },
  ],
}

export default function StarStoryBankSection({}: StarStoryBankSectionProps) {
  const { markStepComplete } = useInterviewPrepStore()

  useEffect(() => {
    markStepComplete(5)
  }, [markStepComplete])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">STAR Story Bank</h1>
        <p className="text-gray-600 mb-6">
          Prepare structured stories using the Situation, Task, Action, Result format to showcase your competencies.
        </p>
      </div>

      <div className="space-y-4">
        {mockData.starStories.map((story) => (
          <CollapsibleCard key={story.id} title={`${story.competency} Story`} defaultOpen={story.id === 1}>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700">Situation</h4>
                <p>{story.situation}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700">Task</h4>
                <p>{story.task}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700">Action</h4>
                <p>{story.action}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700">Result</h4>
                <p>{story.result}</p>
              </div>
            </div>
          </CollapsibleCard>
        ))}
      </div>
    </div>
  )
}
