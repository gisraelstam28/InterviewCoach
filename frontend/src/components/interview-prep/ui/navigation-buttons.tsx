import { Button } from "@/components/ui/button"

interface NavigationButtonsProps {
  onBack: () => void
  onNext: () => void
  disableBack: boolean
  disableNext: boolean
  isLastStep?: boolean
}

export default function NavigationButtons({
  onBack,
  onNext,
  disableBack,
  disableNext,
  isLastStep = false,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between mt-8">
      <Button variant="outline" onClick={onBack} disabled={disableBack}>
        Back
      </Button>

      <Button onClick={onNext} disabled={disableNext}>
        {isLastStep ? "Finish & Export" : "Next"}
      </Button>
    </div>
  )
}
