/* English examples. SVGs are rendered from these Mermaid definitions. */
window.DIAGRAMS = [
  { id: 'flow', name: 'Flowchart', en: 'Flowchart', when: 'Steps, branches and loops', example: 'Research, planning approval or data cleaning',
    say: 'Draw my research workflow: define a question, review the literature, collect data, analyse it, then write the discussion. If the data is insufficient, return to collection. If the literature review shows the question is too broad, revise it. Return only Mermaid code with English labels.',
    tweak: 'Use a vertical layout; shorten labels; colour the return arrows red.',
    code: 'flowchart LR\n A[Define question] --> B[Read literature]\n B --> C{Too broad?}\n C -- Yes: revise --> A\n C -- No --> D[Collect data]\n D --> E[Analyse]\n E --> F{Enough data?}\n F -- No: collect more --> D\n F -- Yes --> G[Write discussion]'
  },
  { id: 'framework', name: 'Framework', en: 'Framework', when: 'Parts, levels and influences', example: 'A conceptual framework, governance levels or data sources',
    say: 'Draw a conceptual framework. On the left, group the factors into policy levels and local conditions. In the middle, show affordable housing supply; on the right, show housing affordability. Use arrows for the direction of influence. Return only Mermaid code with English labels.',
    tweak: 'Group related factors; keep only the main arrows; put the outcome on the right.',
    code: 'flowchart LR\n subgraph P[Policy levels]\n C[National housing policy] --> L[Local housing plan]\n end\n subgraph S[Local conditions]\n T[Transport access]\n J[Jobs]\n end\n L --> O[Affordable housing supply]\n T --> O\n J --> O\n O --> W[Housing affordability]'
  },
  { id: 'gantt', name: 'Gantt chart', en: 'Gantt chart', when: 'Schedules and dependencies', example: 'A dissertation schedule, research proposal or group project',
    say: 'Draw a dissertation Gantt chart starting in January, grouped into preparation, execution and writing. Allow two months for the literature review, one for research design, two for data collection, one for analysis, one for a draft and one for revision and submission. Each task follows the previous one. Return only Mermaid code with English labels.',
    tweak: 'Use actual dates; add an ethics review in parallel; change the scale to weeks.',
    code: 'gantt\n title Dissertation schedule (example)\n dateFormat YYYY-MM\n axisFormat %b\n section Prepare\n Literature review :a1, 2027-01, 2M\n Research design :a2, after a1, 1M\n section Execute\n Data collection :b1, after a2, 2M\n Analysis :b2, after b1, 1M\n section Write\n First draft :c1, after b2, 1M\n Revise and submit :c2, after c1, 1M'
  },
  { id: 'timeline', name: 'Timeline', en: 'Timeline', when: 'How something changes over time', example: 'Neighbourhood development, institutional change or a policy issue',
    say: 'Draw a timeline of a former industrial district in four stages: industry, decline, regeneration and today. Give two key points for each stage. Return only Mermaid code with English labels.',
    tweak: 'Keep one point per stage; use a vertical layout; add approximate dates.',
    code: 'timeline\n title Industrial district transition (example)\n Industry : Factories and warehouses : Rail freight\n Decline : Factory relocation : Vacant land\n Regeneration : Renewal plans : Housing and creative firms\n Today : Rising rents : Affordability for existing residents'
  },
  { id: 'mindmap', name: 'Mind map', en: 'Mind map', when: 'Explore aspects of a topic', example: 'Literature themes, breaking down an issue or seminar preparation',
    say: 'Organise affordable housing literature into a mind map with four branches: supply, demand, policy tools and measurement. Add two or three subtopics per branch. Return only Mermaid code with English labels.',
    tweak: 'Keep three branches; replace subtopics with my papers; add a research-gap branch.',
    code: 'mindmap\n root((Affordable housing literature))\n  Supply\n   Land and planning permission\n   Construction costs\n  Demand\n   Population and households\n   Income distribution\n  Policy tools\n   Rent control\n   Inclusionary zoning\n  Measurement\n   Rent to income ratio\n   Residual income'
  },
  { id: 'quadrant', name: 'Quadrant chart', en: 'Quadrant chart', when: 'Position items against two criteria', example: 'Stakeholder influence and interest, or impact and feasibility',
    say: 'Draw a stakeholder matrix with interest on the horizontal axis and influence on the vertical axis. Planning authorities have high influence and interest, developers are high on both, community groups have high interest and low influence, residents are lower on both, and university researchers are low to moderate on both. Label the quadrants: collaborate closely, keep satisfied, monitor and keep informed. Return only Mermaid code with English labels.',
    tweak: 'Use impact and feasibility instead; add two roles; use the quadrant labels from our course.',
    code: 'quadrantChart\n title Stakeholders (example)\n x-axis Low interest --> High interest\n y-axis Low influence --> High influence\n quadrant-1 Collaborate\n quadrant-2 Keep satisfied\n quadrant-3 Monitor\n quadrant-4 Keep informed\n Planning authority: [0.8, 0.9]\n Developers: [0.7, 0.75]\n Community groups: [0.85, 0.4]\n Residents: [0.5, 0.2]\n Researchers: [0.3, 0.35]'
  }
];
