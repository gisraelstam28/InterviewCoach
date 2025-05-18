"""
Sample data for Interview Prep v2 endpoint. This matches the InterviewPrepV2Guide schema.
"""
from interview_prep_v2_agent import InterviewPrepV2Guide, WelcomeSection, CompanyIndustrySection, IndustryDriver, DepartmentContextSection, RoleSuccessFactorsSection, FitMatrixRow, CandidateFitMatrixSection, StarStory, StarStoryBankSection, PracticePrompt, TechnicalCasePrepSection, MockInterviewFeedback, MockInterviewSection, InsiderCheatSheetSection, ThirtySixtyNinetySection, OfferNegotiationSection, ExportShareSection

def get_sample_v2_guide():
    return InterviewPrepV2Guide(
        section_0_welcome=WelcomeSection(
            intro="Welcome to Interview Prep v2! This guide will help you ace your interview.",
            quick_view_enabled=True,
            deep_dive_enabled=True,
            progress=0.0
        ),
        section_1_company_industry=CompanyIndustrySection(
            company_overview="Acme Corp is a leading innovator in AI-driven logistics.",
            recent_news=["Acme launches new AI platform (2024-03-01)", "Acme acquires BetaLogistics (2024-02-15)"],
            industry_drivers=[
                IndustryDriver(trend="AI automation in supply chain", citation="Gartner 2024"),
                IndustryDriver(trend="Sustainability mandates", citation="McKinsey 2024"),
                IndustryDriver(trend="E-commerce growth", citation="Statista 2024")
            ]
        ),
        section_2_department_context=DepartmentContextSection(
            org_chart_mermaid="graph TD; CEO-->CTO; CTO-->AI_Team; CTO-->Logistics_Team; AI_Team-->You;",
            okrs=["Reduce delivery time by 20%", "Expand AI coverage to 80% of routes"]
        ),
        section_3_role_success=RoleSuccessFactorsSection(
            must_haves=["Python expertise", "Experience with ML ops", "Strong communication skills"],
            nice_to_haves=["Startup experience (spin: agility)", "Public speaking (spin: leadership)", "Spanish fluency (spin: global reach)"]
        ),
        section_4_fit_matrix=CandidateFitMatrixSection(
            rows=[
                FitMatrixRow(job_requirement="Python", your_evidence="3 years at DataCorp", spin_or_gap_fix="Direct match", color_code="green"),
                FitMatrixRow(job_requirement="ML ops", your_evidence="Built CI/CD for ML at Acme", spin_or_gap_fix="Direct match", color_code="green"),
                FitMatrixRow(job_requirement="Public speaking", your_evidence="Led team demos", spin_or_gap_fix="Emphasize leadership", color_code="yellow")
            ]
        ),
        section_5_star_story_bank=StarStoryBankSection(
            stories=[
                StarStory(competency="Problem Solving", situation="Logistics delay at DataCorp", task="Reduce backlog", action="Automated routing", result="Cut delays by 40%", tags=["problem-solving", "automation"])
            ]
        ),
        section_6_technical_case_prep=TechnicalCasePrepSection(
            prompts=[
                PracticePrompt(prompt="How would you scale an ML pipeline?", gold_standard_answer="Discuss modular design, orchestration, monitoring.", resource_links=["https://mlops.org/guide"])
            ]
        ),
        section_7_mock_interview=MockInterviewSection(
            questions=["Tell me about a time you improved a process."],
            feedback=[
                MockInterviewFeedback(question="Tell me...", answer="I improved...", rubric={"clarity":4,"structure":4,"depth":4,"confidence":4}, score=4.0, feedback="Strong answer!")
            ],
            premium_required=True
        ),
        section_8_insider_cheat_sheet=InsiderCheatSheetSection(
            culture_cues=["Fast-paced", "Data-driven"],
            exec_quotes=["Innovation is our DNA."],
            financial_snapshot="$200M revenue, 20% YoY growth",
            glassdoor_pain_points=["Long hours", "Rapid change"],
            tailored_questions=["How does Acme support work-life balance?"]
        ),
        section_9_thirty_sixty_ninety=ThirtySixtyNinetySection(
            onboarding_checklist=["Meet team", "Set up dev environment"],
            milestone_goals=["30 days: Deploy first model", "60 days: Lead project"],
            premium_required=True
        ),
        section_10_offer_negotiation=OfferNegotiationSection(
            comp_range_benchmarks="$120k-$140k base", 
            alternative_levers=["Equity", "Signing bonus", "Remote flexibility"],
            premium_required=True
        ),
        export_share=ExportShareSection(
            pdf_export_enabled=True, notion_export_enabled=False, send_to_coach_enabled=True
        )
    )
