"use client"

import { useEffect } from "react"
import CollapsibleCard from "@/components/interview-prep/ui/collapsible-card"
import type { ViewMode } from "../../../store/interview-prep-store";
import { useInterviewPrepStore } from "../../../store/interview-prep-store";
import { StarStory } from '../../../../../../types/interview-prep-v2';

import type { StarStoryBankSection as StarStoryBankSectionType } from '../../../../../../types/interview-prep-v2'

interface StarStoryBankSectionProps {
  data: StarStoryBankSectionType
  viewMode: ViewMode
}

// Mock data
const mockData = {
  starStories: [
    {
      competency: "Problem Solving",
      behavioral_question: "Tell me about a time you identified a critical performance issue and what steps you took to resolve it.",
      situation:
        "Our team was facing a critical performance issue with our main product page, loading times were exceeding 5 seconds.",
      task: "I was tasked with identifying the bottlenecks and improving the page load time to under 2 seconds.",
      action:
        "I conducted a thorough performance audit using Lighthouse and Chrome DevTools. I identified several issues including render-blocking resources, unoptimized images, and inefficient API calls. I implemented code splitting, lazy loading of components, image optimization, and restructured our API calls to be more efficient.",
      result:
        "The page load time was reduced to 1.8 seconds, a 64% improvement. This led to a 15% increase in conversion rate and significantly improved user experience metrics.",
      interviewer_advice: "The interviewer is looking for your analytical skills, problem-solving approach, and ability to deliver measurable results. Highlight the tools you used and the impact of your actions.",
      tags: ["Performance Optimization", "Frontend", "Audit"]
    },
    {
      competency: "Leadership",
      behavioral_question: "Describe a situation where you took a leadership role to improve team performance or resolve a significant challenge.",
      situation:
        "Our team was struggling with meeting sprint commitments and had accumulated significant technical debt.",
      task: "As the senior developer, I needed to help the team improve our delivery process and address the technical debt.",
      action:
        "I organized a series of workshops to identify pain points in our process. I introduced better estimation techniques, implemented a code review process, and allocated 20% of each sprint to technical debt reduction. I also mentored junior developers to improve their skills.",
      result:
        "Within three months, our sprint completion rate improved from 70% to 95%. We reduced our bug backlog by 40% and significantly improved code quality metrics.",
      interviewer_advice: "Focus on how you influenced the team, the specific processes you implemented, and the positive outcomes of your leadership. Mentioning mentorship can also be a plus.",
      tags: ["Agile", "Process Improvement", "Mentorship"]
    },
    {
      competency: "Adaptability",
      behavioral_question: "Share an example of a time when you had to adapt to a significant change in project scope or requirements. How did you handle it?",
      situation:
        "Midway through a major project, our client significantly changed their requirements, requiring us to pivot our approach.",
      task: "I needed to quickly adapt our existing work to meet the new requirements while minimizing delays.",
      action:
        "I conducted an impact analysis to identify which components could be reused and which needed to be rebuilt. I reorganized the team to focus on the highest priority changes first. I also negotiated with the client to phase some of the changes to allow for a more manageable transition.",
      result:
        "We successfully delivered the revised project with only a two-week delay from the original timeline. The client was extremely satisfied with our flexibility and the quality of the final product.",
      interviewer_advice: "Highlight your analytical skills in assessing the change, your communication with stakeholders, and your ability to manage resources effectively to deliver under new constraints.",
      tags: ["Change Management", "Client Relations", "Project Management"]
    },
  ],
}

export default function StarStoryBankSection({ data }: StarStoryBankSectionProps) {
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
        {(data?.stories && data.stories.length > 0) ? (
          data.stories.map((story: StarStory, idx: number) => (
            <CollapsibleCard key={idx} title={`${story.competency ? story.competency : 'Achievement'} Story`}>
              <div className="p-4">
                {story.behavioral_question && (
                  <div className="mb-4 pb-2 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-700">Relevant Behavioral Question:</h4>
                    <p className="italic text-blue-600">{story.behavioral_question}</p>
                  </div>
                )}

                <div className="space-y-2 text-sm mb-4">
                  <div><span className="font-semibold">Situation:</span> {story.situation}</div>
                  <div><span className="font-semibold">Task:</span> {story.task}</div>
                  <div><span className="font-semibold">Action:</span> {story.action}</div>
                  <div><span className="font-semibold">Result:</span> {story.result}</div>
                </div>

                {Array.isArray(story.tags) && story.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-xs text-gray-500 uppercase mb-1">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {story.tags.map((tag: string, tagIdx: number) => (
                        <span key={tagIdx} className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {story.interviewer_advice && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700">Interviewer's Focus & Advice:</h4>
                    <p className="text-sm text-gray-600">{story.interviewer_advice}</p>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          ))
        ) : (
          <div className="text-gray-500">No STAR stories available.</div>
        )}
      </div>
    </div>
  )
}
