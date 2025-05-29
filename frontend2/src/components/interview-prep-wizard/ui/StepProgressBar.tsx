// src/components/interview-prep-wizard/ui/StepProgressBar.tsx
import React from 'react';

interface Step {
  id: string;
  name: string;
}

interface StepProgressBarProps {
  steps: Step[];
  currentStepId: string;
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({ steps, currentStepId }) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);

  return (
    <div className="w-full px-4 sm:px-0 mb-8">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isLastStep = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-colors duration-300 ease-in-out
                    ${isCompleted ? 'bg-purple-600 text-white' : ''}
                    ${isCurrent ? 'bg-purple-600 text-white ring-2 ring-purple-300 ring-offset-2 ring-offset-purple-50' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-300 text-gray-700' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <p
                  className={`
                    mt-2 text-xs sm:text-sm text-center
                    transition-colors duration-300 ease-in-out
                    ${isCurrent ? 'text-purple-700 font-semibold' : 'text-gray-500'}
                    w-20 sm:w-24 
                  `}
                >
                  {step.name}
                </p>
              </div>
              {!isLastStep && (
                <div
                  className={`
                    flex-1 h-1 transition-colors duration-300 ease-in-out mt-4
                    ${isCompleted || isCurrent ? 'bg-purple-600' : 'bg-gray-300'}
                    mx-1 sm:mx-2 
                  `}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgressBar;
