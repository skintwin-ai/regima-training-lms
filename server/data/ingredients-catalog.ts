/**
 * REGIMA Skincare Ingredients Catalog
 * 
 * This file contains detailed information on skincare ingredients used in REGIMA products,
 * their benefits, functions, and applications in professional treatments.
 */

export interface IngredientInfo {
  name: string;
  category: string;
  mainFunctions: string[];
  benefits: string[];
  concentration: string;
  notes: string;
}

export const ingredientsCatalog: IngredientInfo[] = [
  // Antioxidants
  {
    name: "Vitamin C (L-Ascorbic Acid)",
    category: "Antioxidant",
    mainFunctions: [
      "Neutralizes free radicals",
      "Brightens skin tone",
      "Boosts collagen synthesis"
    ],
    benefits: [
      "Reduces pigmentation",
      "Protects against UV damage",
      "Improves skin firmness"
    ],
    concentration: "5-20%",
    notes: "Unstable in water-based formulations; most effective at pH 3.5 or lower. REGIMA uses stabilized forms with ferulic acid and vitamin E for enhanced efficacy."
  },
  {
    name: "Vitamin E (Tocopherol)",
    category: "Antioxidant",
    mainFunctions: [
      "Neutralizes free radicals",
      "Moisturizes skin",
      "Enhances barrier function"
    ],
    benefits: [
      "Soothes inflammation",
      "Improves skin hydration",
      "Heals skin barrier"
    ],
    concentration: "0.5-1%",
    notes: "Oil-soluble antioxidant that works synergistically with vitamin C in REGIMA formulations. Helps stabilize products and extend shelf life."
  },
  
  // Exfoliants
  {
    name: "Glycolic Acid",
    category: "Alpha Hydroxy Acid (AHA)",
    mainFunctions: [
      "Exfoliates stratum corneum",
      "Improves skin texture",
      "Accelerates cell turnover"
    ],
    benefits: [
      "Reduces fine lines",
      "Brightens complexion",
      "Improves product penetration"
    ],
    concentration: "5-30%",
    notes: "Smallest AHA molecule for enhanced penetration. REGIMA professional treatments contain up to 30% concentration while retail products typically range from 5-10%."
  },
  {
    name: "Salicylic Acid",
    category: "Beta Hydroxy Acid (BHA)",
    mainFunctions: [
      "Exfoliates within pores",
      "Reduces sebum production",
      "Anti-inflammatory"
    ],
    benefits: [
      "Clears congestion",
      "Reduces acne lesions",
      "Refines pore appearance"
    ],
    concentration: "0.5-2%",
    notes: "Oil-soluble acid that penetrates sebum-filled follicles. REGIMA formulates with specialized delivery systems for enhanced penetration without irritation."
  },
  {
    name: "Lactic Acid",
    category: "Alpha Hydroxy Acid (AHA)",
    mainFunctions: [
      "Gentle exfoliation",
      "Hydration",
      "pH balancing"
    ],
    benefits: [
      "Improves skin texture",
      "Enhances moisture retention",
      "Reduces sensitivity"
    ],
    concentration: "5-10%",
    notes: "Larger molecule than glycolic acid, providing gentler exfoliation. Also functions as a humectant. Ideal for sensitive skin types in REGIMA sensitive skin protocols."
  },
  
  // Hydrators
  {
    name: "Hyaluronic Acid",
    category: "Humectant",
    mainFunctions: [
      "Attracts and binds water",
      "Plumps skin",
      "Creates moisture reservoir"
    ],
    benefits: [
      "Intense hydration",
      "Reduces appearance of fine lines",
      "Soothes irritation"
    ],
    concentration: "1-2%",
    notes: "REGIMA uses multi-molecular weight hyaluronic acid complexes for penetration at different skin levels. Can hold up to 1000x its weight in water."
  },
  {
    name: "Glycerin",
    category: "Humectant",
    mainFunctions: [
      "Attracts water to skin surface",
      "Improves barrier function",
      "Enhances product spreadability"
    ],
    benefits: [
      "Hydrates without oiliness",
      "Soothes sensitive skin",
      "Facilitates healing"
    ],
    concentration: "3-10%",
    notes: "Foundation humectant in many REGIMA formulations. Creates an ideal base for other active ingredients to perform optimally."
  },
  
  // Peptides
  {
    name: "Argireline (Acetyl Hexapeptide-8)",
    category: "Peptide",
    mainFunctions: [
      "Inhibits muscle contractions",
      "Reduces dynamic wrinkles",
      "Alternative to neurotoxins"
    ],
    benefits: [
      "Softens expression lines",
      "Non-invasive wrinkle reduction",
      "Prevents deepening of lines"
    ],
    concentration: "2-10%",
    notes: "REGIMA's signature peptide for expression line management. Particularly effective around eyes and forehead in the professional anti-aging protocols."
  },
  {
    name: "Matrixyl (Palmitoyl Pentapeptide-4)",
    category: "Peptide",
    mainFunctions: [
      "Stimulates collagen production",
      "Improves elasticity",
      "Strengthens dermal matrix"
    ],
    benefits: [
      "Reduces wrinkle depth",
      "Improves skin firmness",
      "Enhances skin resilience"
    ],
    concentration: "2-5%",
    notes: "Signal peptide that mimics the body's own mechanisms for healing and collagen synthesis. Core component in REGIMA's regenerative treatments."
  },
  
  // Retinoids
  {
    name: "Retinol",
    category: "Retinoid",
    mainFunctions: [
      "Accelerates cell turnover",
      "Stimulates collagen and elastin",
      "Regulates sebum production"
    ],
    benefits: [
      "Reduces fine lines and wrinkles",
      "Improves skin texture",
      "Helps clear acne"
    ],
    concentration: "0.1-1%",
    notes: "REGIMA uses encapsulated, time-release technology for reduced irritation. Always paired with soothing agents in professional formulations to minimize sensitivity."
  },
  {
    name: "Granactive Retinoid",
    category: "Retinoid",
    mainFunctions: [
      "Similar benefits to retinol",
      "Lower irritation potential",
      "Enhanced stability"
    ],
    benefits: [
      "Suitable for sensitive skin",
      "Reduces signs of aging",
      "Improves skin clarity"
    ],
    concentration: "0.5-2%",
    notes: "Next-generation retinoid used in REGIMA's sensitive skin protocols. Provides retinol-like benefits without the typical irritation."
  },
  
  // Calming & Soothing
  {
    name: "Centella Asiatica (Cica)",
    category: "Botanical Extract",
    mainFunctions: [
      "Anti-inflammatory",
      "Healing accelerator",
      "Antioxidant protection"
    ],
    benefits: [
      "Calms redness and irritation",
      "Strengthens skin barrier",
      "Promotes collagen synthesis"
    ],
    concentration: "2-5% extract",
    notes: "REGIMA uses a proprietary complex of purified centella compounds (madecassoside, asiaticoside, madecassic acid, and asiatic acid) for enhanced efficacy."
  },
  {
    name: "Niacinamide (Vitamin B3)",
    category: "Vitamin",
    mainFunctions: [
      "Regulates sebum production",
      "Anti-inflammatory",
      "Strengthens barrier function"
    ],
    benefits: [
      "Reduces redness",
      "Minimizes pore appearance",
      "Evens skin tone"
    ],
    concentration: "2-10%",
    notes: "Multi-functional ingredient used across many REGIMA formulations. Compatible with most other actives and suitable for all skin types."
  },
  
  // Plant Oils
  {
    name: "Arnica Montana Extract",
    category: "Botanical Extract",
    mainFunctions: [
      "Anti-inflammatory",
      "Improves circulation",
      "Reduces swelling"
    ],
    benefits: [
      "Reduces puffiness",
      "Accelerates healing",
      "Calms irritated skin"
    ],
    concentration: "1-3% extract",
    notes: "Key ingredient in REGIMA's lymphatic massage protocols. Used in specialized preparations for professional facial treatments."
  },
  {
    name: "Marula Oil",
    category: "Plant Oil",
    mainFunctions: [
      "Rich in antioxidants",
      "Deeply moisturizing",
      "Enhances barrier repair"
    ],
    benefits: [
      "Non-comedogenic hydration",
      "Protects against environmental damage",
      "Soothes inflammation"
    ],
    concentration: "3-100%",
    notes: "High in oleic acid (70-78%), making it particularly suitable for dry, mature skin types. REGIMA uses cold-pressed, unrefined oil for maximum nutrient retention."
  },
  
  // Specialty Ingredients
  {
    name: "Tranexamic Acid",
    category: "Synthetic Amino Acid Derivative",
    mainFunctions: [
      "Inhibits melanin production",
      "Anti-inflammatory",
      "Strengthens capillaries"
    ],
    benefits: [
      "Fades hyperpigmentation",
      "Reduces redness",
      "Prevents melasma recurrence"
    ],
    concentration: "2-5%",
    notes: "Core ingredient in REGIMA's brightening treatment protocols. Works synergistically with other brightening agents like niacinamide and vitamin C."
  },
  {
    name: "Snow Mushroom Extract",
    category: "Natural Polysaccharide",
    mainFunctions: [
      "Natural humectant",
      "Improves moisture retention",
      "Anti-inflammatory"
    ],
    benefits: [
      "Deep hydration",
      "Reduces fine lines",
      "Soothes sensitive skin"
    ],
    concentration: "1-5% extract",
    notes: "Natural alternative to hyaluronic acid with smaller particle size for deeper penetration. Used in REGIMA's premium hydrating formulations."
  }
];

// Export an organized list by category for educational modules
export const ingredientsByCategory = ingredientsCatalog.reduce((acc, ingredient) => {
  if (!acc[ingredient.category]) {
    acc[ingredient.category] = [];
  }
  acc[ingredient.category].push(ingredient);
  return acc;
}, {} as Record<string, IngredientInfo[]>);

// Helper function to look up ingredient details
export function getIngredientInfo(name: string): IngredientInfo | undefined {
  return ingredientsCatalog.find(ingredient => 
    ingredient.name.toLowerCase() === name.toLowerCase() ||
    ingredient.name.toLowerCase().includes(name.toLowerCase())
  );
}