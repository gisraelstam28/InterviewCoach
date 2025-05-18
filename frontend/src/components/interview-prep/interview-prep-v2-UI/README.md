# Interview Prep v2

This is a multi-step, content-rich guide for interview preparation built with Next.js (React + TypeScript).

## Getting Started

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000/interview-v2](http://localhost:3000/interview-v2) in your browser

## Feature Flag

The Interview Prep v2 feature can be enabled/disabled using the `NEXT_PUBLIC_INTERVIEW_PREP_V2_ENABLED` environment variable:

\`\`\`bash
# .env.local
NEXT_PUBLIC_INTERVIEW_PREP_V2_ENABLED=true
\`\`\`

## State Management

The application uses Zustand for global state management with localStorage persistence. The store is defined in `store/interview-prep-store.ts` and includes:

- User data (resume, job description)
- Progress tracking
- UI state (view mode)

## Project Structure

- `/app/interview-v2/step/[stepId]` - Dynamic routes for each step (0-10)
- `/app/interview-v2/export` - Export and share page
- `/components/interview-prep/sections` - Individual section components
- `/components/interview-prep/ui` - Reusable UI components

## Connecting to the API

To connect this UI to a real API:

1. Replace the mock data in each section component with actual API calls
2. Update the `fetchStepData` function in `step-content.tsx` to fetch data from your API
3. Implement the actual export functionality in `export-share-section.tsx`

## Premium Gating

Premium features are gated using the `PremiumGate` component. To enable/disable premium features:

1. Set the `premium_required` flag in your API response
2. Pass this flag to the `PremiumGate` component

## Storybook

To run Storybook:

\`\`\`bash
npm run storybook
\`\`\`

This will start Storybook on [http://localhost:6006](http://localhost:6006)

## Adding New Sections

To add a new section:

1. Create a new component in `/components/interview-prep/sections`
2. Add the component to the `renderStepContent` function in `step-content.tsx`
3. Update the step navigation logic if needed
