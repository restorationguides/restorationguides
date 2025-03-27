const questions = [
    // Microbiology & Mold ID
    {
      question: "What type of mold is often called 'toxic black mold'?",
      options: ["Cladosporium", "Stachybotrys", "Penicillium", "Aspergillus"],
      correct: "Stachybotrys"
    },
    {
      question: "Which structure allows mold to spread and grow?",
      options: ["Spores", "Hyphae", "Mycotoxins", "Conidia"],
      correct: "Hyphae"
    },
    {
      question: "Which mold is blue-green and common on water-damaged wallpaper?",
      options: ["Aspergillus", "Stachybotrys", "Cladosporium", "Penicillium"],
      correct: "Penicillium"
    },
    {
      question: "Mold reproduces primarily through:",
      options: ["Spores", "Pollen", "Eggs", "Mycelium"],
      correct: "Spores"
    },
    {
      question: "Mycotoxins are:",
      options: [
        "Toxins produced by mold",
        "Spores that float in the air",
        "Mold food sources",
        "Byproducts of bacteria"
      ],
      correct: "Toxins produced by mold"
    },
  
    // Health & Safety
    {
      question: "What is the primary exposure route for mold spores?",
      options: ["Inhalation", "Ingestion", "Skin absorption", "Injection"],
      correct: "Inhalation"
    },
    {
      question: "Which group is most vulnerable to mold exposure?",
      options: ["Healthy adults", "Teenagers", "Construction workers", "Immunocompromised individuals"],
      correct: "Immunocompromised individuals"
    },
    {
      question: "Which symptom is commonly linked to mold exposure?",
      options: ["Nausea", "Shortness of breath", "Seizures", "Hair loss"],
      correct: "Shortness of breath"
    },
  
    // Moisture & Drying
    {
      question: "What does GPP stand for?",
      options: ["Grains Per Pound", "Gallons Per Pint", "Grams Per Particle", "Grain Pressure Percentage"],
      correct: "Grains Per Pound"
    },
    {
      question: "Which tool helps measure relative humidity?",
      options: ["Anemometer", "Psychrometer", "Thermometer", "Hygrometer"],
      correct: "Hygrometer"
    },
    {
      question: "What’s the minimum RH where mold is likely to grow?",
      options: ["30%", "40%", "60%", "80%"],
      correct: "60%"
    },
  
    // Containment & Work Practices
    {
      question: "What type of containment is used for small isolated spots?",
      options: ["Structural", "Full", "Source", "Negative"],
      correct: "Source"
    },
    {
      question: "Negative pressure helps:",
      options: ["Circulate fresh air", "Push air into the room", "Prevent cross-contamination", "Raise humidity"],
      correct: "Prevent cross-contamination"
    },
  
    // Cleaning & Remediation
    {
      question: "Which of these is a HEPA-compliant activity?",
      options: ["Dry sweeping", "HEPA vacuuming", "Using fans", "Blowing compressed air"],
      correct: "HEPA vacuuming"
    },
    {
      question: "Porous materials with visible mold should usually be:",
      options: ["Sealed", "Painted over", "Cleaned", "Removed"],
      correct: "Removed"
    },
    {
      question: "Which agent kills and prevents mold?",
      options: ["Bleach", "Biocide", "Water", "Baking soda"],
      correct: "Biocide"
    },
  
    // PPE & Decon
    {
      question: "What level of PPE includes a full-face respirator and Tyvek suit?",
      options: ["Level A", "Level B", "Level C", "Level D"],
      correct: "Level C"
    },
    {
      question: "Before exiting the containment area, workers should:",
      options: ["Eat a snack", "Remove PPE and decon", "Call their boss", "Change shoes"],
      correct: "Remove PPE and decon"
    },
  
    // Documentation & PRV
    {
      question: "What does PRV stand for?",
      options: ["Post Remediation Verification", "Pressure Release Valve", "Pre-Restoration Visual", "Personal Respirator Verification"],
      correct: "Post Remediation Verification"
    },
    {
      question: "Photos and moisture logs are examples of:",
      options: ["Billing", "Containment tools", "Documentation", "Waste"],
      correct: "Documentation"
    },
     // Microbiology
  {
    question: "Which mold commonly grows in HVAC systems?",
    options: ["Stachybotrys", "Penicillium", "Aspergillus", "Fusarium"],
    correct: "Aspergillus"
  },
  {
    question: "What condition is necessary for mold to colonize on drywall?",
    options: ["Low pH", "Sustained moisture", "Sunlight", "Wind exposure"],
    correct: "Sustained moisture"
  },

  // Health & Safety
  {
    question: "What should always be done before entering a mold-contaminated area?",
    options: ["Call your manager", "Eat a snack", "Don PPE", "Spray bleach"],
    correct: "Don PPE"
  },
  {
    question: "Prolonged mold exposure is most dangerous for individuals with:",
    options: ["Good immune systems", "Iron deficiency", "Allergies or asthma", "Low cholesterol"],
    correct: "Allergies or asthma"
  },

  // Moisture & Drying
  {
    question: "Which tool measures moisture in materials?",
    options: ["Anemometer", "Moisture meter", "Hygrometer", "Psychrometer"],
    correct: "Moisture meter"
  },
  {
    question: "What reading indicates dry standard in a wood floor?",
    options: ["8-12%", "20-25%", "0-2%", "15-18%"],
    correct: "8-12%"
  },
  {
    question: "High dew point means:",
    options: ["Cold air", "High moisture content", "Dry conditions", "No risk of mold"],
    correct: "High moisture content"
  },

  // Containment
  {
    question: "Which containment includes the full structure or room?",
    options: ["Source", "Partial", "Structural", "Full"],
    correct: "Full"
  },
  {
    question: "Zipper doors are commonly used for:",
    options: ["Access into containment", "Air circulation", "Drying chambers", "Waterproofing"],
    correct: "Access into containment"
  },

  // Cleaning & Remediation
  {
    question: "Which method is NOT recommended for mold cleanup?",
    options: ["HEPA vacuuming", "Wire brushing", "Dry sanding", "Damp wiping"],
    correct: "Dry sanding"
  },
  {
    question: "Which of the following is considered a porous material?",
    options: ["Metal", "Concrete", "Drywall", "Glass"],
    correct: "Drywall"
  },
  {
    question: "What must be done before applying antimicrobial products?",
    options: ["Blast the area with air", "Document the site", "Clean the surface of all visible mold", "Dry the surface completely"],
    correct: "Clean the surface of all visible mold"
  },

  // PPE & Decon
  {
    question: "Which class of respirator includes powered air-purifying respirators?",
    options: ["Class A", "Class C", "PAPR", "N95"],
    correct: "PAPR"
  },
  {
    question: "Tyvek suits are designed to:",
    options: ["Keep workers cool", "Resist moisture and particles", "Deflect UV rays", "Replace respirators"],
    correct: "Resist moisture and particles"
  },

  // Documentation
  {
    question: "Daily moisture readings help with:",
    options: ["Billing only", "Determining food safety", "Tracking drying progress", "Scheduling inspections"],
    correct: "Tracking drying progress"
  },
  {
    question: "Which form is typically used to document materials removed?",
    options: ["Dry log", "Scope sheet", "Inventory checklist", "Material removal log"],
    correct: "Material removal log"
  },

  // PRV
  {
    question: "Post Remediation Verification is usually performed by:",
    options: ["Homeowner", "Insurance agent", "Third party inspector", "Remediation team"],
    correct: "Third party inspector"
  },
  {
    question: "PRV often includes what type of test?",
    options: ["Air sampling", "Drywall tapping", "Noise level", "Odor detection"],
    correct: "Air sampling"
  },

  // Bonus
  {
    question: "How long should containment stay up after remediation?",
    options: ["Until PRV passes", "Immediately removed", "One week", "24 hours"],
    correct: "Until PRV passes"
  },
  {
    question: "What color typically indicates a clean HEPA filter?",
    options: ["Blue", "White", "Green", "Gray"],
    correct: "White"
  }
  ];