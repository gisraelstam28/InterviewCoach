import { useEffect } from "react";
// import { useInterviewPrepStore } from "../../../../store/interview-prep-store"; // Old store hook
import { useInterviewPrepV3Store } from "../../../../store/interview-prep-v3-store"; // New V3 store
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { StarStoryBankSection as StarStoryModel, StarStory } from "../../../../types/interview-prep-v2";

interface StarStoryBankSectionProps {
  data: StarStoryModel;
}

export default function StarStoryBankSection({ data }: StarStoryBankSectionProps) {
  const { markStepComplete } = useInterviewPrepV3Store();
  useEffect(() => {
    markStepComplete(7);
  }, [markStepComplete]);
  useEffect(() => {
    console.log('StarStoryBankSection data:', data);
    console.log('StarStoryBankSection JSON:', JSON.stringify(data, null, 2));
  }, [data]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">STAR Story Bank</h1>
      <p className="text-gray-600">Behavioral stories organized by competency to structure your answers.</p>
      <div className="space-y-4">
        {data.stories.map((story: StarStory, idx: number) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle>{story.competency}</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold">Situation</h3>
              <p>{story.situation}</p>
              <h3 className="font-semibold mt-2">Task</h3>
              <p>{story.task}</p>
              <h3 className="font-semibold mt-2">Action</h3>
              <p>{story.action}</p>
              <h3 className="font-semibold mt-2">Result</h3>
              <p>{story.result}</p>
              {story.tags && story.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {story.tags?.map((tag: string, tIdx: number) => (
                    <span key={tIdx} className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
