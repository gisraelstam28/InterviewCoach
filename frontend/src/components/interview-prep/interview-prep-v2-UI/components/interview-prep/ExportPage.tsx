import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useInterviewPrepV2Guide } from '../../../../../hooks/useInterviewPrepV2Guide';

export default function ExportPage() {
  const navigate = useNavigate();
  const guideQuery = useInterviewPrepV2Guide();

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log('Exporting to PDF...', guideQuery.data);
    // This would typically call an API endpoint to generate and download a PDF
  };

  const handleBack = () => {
    navigate('/interview-v2/step/10'); // Go back to Offer Negotiation step
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Interview Preparation Guide is Ready!</h1>
        <p className="mt-2 text-gray-600">
          Review your complete interview preparation guide below or export it for future reference.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-medium text-gray-900">Export Options</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">PDF Document</h3>
              <p className="mt-2 text-sm text-gray-500">
                Download a beautifully formatted PDF of your complete interview preparation guide.
              </p>
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleExportPDF}
                className="w-full"
              >
                Export as PDF
              </Button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Print</h3>
              <p className="mt-2 text-sm text-gray-500">
                Print your interview preparation guide directly from your browser.
              </p>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.print()}
              >
                Print Guide
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline"
          onClick={handleBack}
        >
          Back
        </Button>
        <div className="space-x-3">
          <Button 
            variant="secondary"
            onClick={() => navigate('/')}
          >
            Return to Dashboard
          </Button>
          <Button 
            onClick={handleExportPDF}
          >
            Export Guide
          </Button>
        </div>
      </div>
    </div>
  );
}
