import React from 'react';

interface KeyTerm {
  term: string;
  definition: string;
  related_terms?: string[];
}

interface TechnicalCasePrepData {
  key_concepts?: string[];
  sample_case_walkthrough?: string;
  key_terms_glossary?: KeyTerm[];
  // Add other fields from section_6_technical_case_prep if needed for basic display
}

interface SimpleTechCaseDisplayProps {
  data: TechnicalCasePrepData | null | undefined;
  viewMode?: string; // Included for consistency with other sections, not used here
}

const SimpleTechCaseDisplay: React.FC<SimpleTechCaseDisplayProps> = ({ data }) => {
  console.log('SimpleTechCaseDisplay rendering with data:', data);

  if (!data) {
    return <div>Loading Technical Case Prep data or data is not available...</div>;
  }

  const {
    key_concepts,
    sample_case_walkthrough,
    key_terms_glossary,
  } = data;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simplified Technical Case Prep View (DEBUG)</h1>
      
      <section style={{ marginBottom: '20px' }}>
        <h2>Key Technical Concepts</h2>
        {key_concepts && key_concepts.length > 0 ? (
          <ul>
            {key_concepts.map((concept, index) => (
              <li key={index}>{concept}</li>
            ))}
          </ul>
        ) : (
          <p>No key concepts provided.</p>
        )}
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>Sample Case Walkthrough</h2>
        {sample_case_walkthrough ? (
          // Using dangerouslySetInnerHTML for now to render potential markdown/HTML if present
          // In a real scenario, sanitize or use a proper markdown parser
          <div dangerouslySetInnerHTML={{ __html: sample_case_walkthrough.replace(/\n/g, '<br />') }} />
        ) : (
          <p>No sample case walkthrough provided.</p>
        )}
      </section>

      <section>
        <h2>Key Terms Glossary</h2>
        {key_terms_glossary && key_terms_glossary.length > 0 ? (
          <ul>
            {key_terms_glossary.map((item, index) => (
              <li key={index}>
                <strong>{item.term}:</strong> {item.definition}
                {item.related_terms && item.related_terms.length > 0 && (
                  <ul style={{ fontSize: '0.9em', color: 'gray' }}>
                    Related: {item.related_terms.join(', ')}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No key terms provided.</p>
        )}
      </section>
    </div>
  );
};

export default SimpleTechCaseDisplay;
