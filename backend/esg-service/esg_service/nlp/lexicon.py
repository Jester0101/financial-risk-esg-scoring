ENVIRONMENTAL_POSITIVE = {
    "sustainability", "sustainable", "renewable", "renewables",
    "carbon neutral", "carbon negative", "recycling", "recycled",
    "environmental protection", "clean energy", "renewable energy",
    "solar", "wind", "hydroelectric", "biomass", "geothermal",
    "energy efficiency", "emissions reduction", "carbon footprint",
    "eco-friendly", "conservation", "biodiversity", "climate action",
    "net zero", "zero waste", "circular economy", "green technology",
    "clean technology", "science-based targets", "scope 1", "scope 2", "scope 3"
}

ENVIRONMENTAL_NEGATIVE = {
    "pollution", "polluting", "greenhouse gas", "carbon emissions",
    "hazardous waste", "contamination", "toxic", "hazardous", "spill",
    "oil spill", "environmental damage", "climate change denial",
    "fossil fuels", "coal", "oil drilling", "fracking",
    "illegal dumping", "regulatory breach", "environmental violation",
    "excess emissions", "emissions breach", "permit violation"
}

SOCIAL_POSITIVE = {
    "diversity", "diverse", "inclusion", "inclusive", "equity", "equitable",
    "social responsibility", "community", "communities", "employee wellbeing",
    "employee well-being", "safety", "workplace safety", "health", "wellness",
    "human rights", "fair trade", "stakeholder engagement", "philanthropy",
    "charitable", "work-life balance", "employee satisfaction", "training",
    "development", "education", "accessibility", "equal opportunity",
    "living wage", "employee engagement", "occupational health"
}

SOCIAL_NEGATIVE = {
    "exploitation", "exploitative", "discrimination", "discriminatory",
    "unsafe", "unsafe working conditions", "labor violation", "child labor",
    "forced labor", "sweatshop", "wage theft", "union busting",
    "human rights violation", "abuse", "harassment", "bullying",
    "workplace accident", "fatality", "injury", "retaliation"
}

GOVERNANCE_POSITIVE = {
    "governance", "good governance", "transparency", "transparent",
    "accountability", "accountable", "ethics", "ethical", "compliance",
    "regulatory compliance", "board independence", "independent board",
    "audit", "auditing", "oversight", "risk management", "internal controls",
    "whistleblower protection", "stakeholder", "stakeholder engagement",
    "corporate responsibility", "esg reporting", "code of conduct",
    "anti-corruption", "data privacy", "information security"
}

GOVERNANCE_NEGATIVE_INCIDENTS = {
    "scandal", "corruption", "corrupt", "bribery", "fraud", "fraudulent",
    "misconduct", "conflict of interest", "insider trading",
    "money laundering", "tax evasion", "kickback", "embezzlement"
}

GOVERNANCE_NEGATIVE_CONTEXTUAL = {
    "violation", "regulatory violation", "fine", "penalty", "sanction",
    "breach", "data breach", "security breach", "lawsuit", "litigation",
    "settlement", "investigation"
}

RISK_MANAGEMENT_POSITIVE = {
    "risk management", "risk monitoring", "risk assessment", "risk control",
    "compliance", "regulatory compliance", "compliance program",
    "audit", "auditing", "internal audit", "external audit",
    "monitoring", "oversight", "internal controls", "control framework",
    "governance framework", "risk framework", "compliance framework",
    "due diligence", "risk mitigation"
}

GOVERNANCE_NEGATIVE = GOVERNANCE_NEGATIVE_INCIDENTS | GOVERNANCE_NEGATIVE_CONTEXTUAL

RISK_FLAGS = {
    "lawsuit", "litigation", "fine", "penalty", "sanction", "violation",
    "breach", "data breach", "security breach", "scandal", "corruption",
    "fraud", "settlement", "contamination", "spill", "hazardous", "toxic",
    "illegal dumping", "environmental violation", "workplace accident",
    "fatality", "forced labor", "child labor"
}
