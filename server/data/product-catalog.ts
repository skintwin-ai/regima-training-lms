/**
 * REGIMA SKIN TREATMENTS Product Catalog
 * 
 * This file contains a comprehensive list of REGIMA professional and retail products
 * with their key ingredients and recommended uses.
 */

export interface ProductInfo {
  id: number;
  name: string;
  category: string;
  type: "professional" | "retail";
  description: string;
  keyIngredients: string[];
  skinTypes: string[];
  size: string;
  usageInstructions: string;
}

export const productCatalog: ProductInfo[] = [
  // Cleansers
  {
    id: 1,
    name: "REGIMA Cream Cleanser",
    category: "Cleansers",
    type: "retail",
    description: "Gentle cream cleanser that removes impurities while maintaining skin barrier integrity. Perfect for normal to dry skin types.",
    keyIngredients: [
      "Glycerin",
      "Aloe Vera",
      "Avocado Oil",
      "Vitamin E"
    ],
    skinTypes: ["Normal", "Dry", "Sensitive"],
    size: "200ml",
    usageInstructions: "Apply to damp skin, massage gently, and rinse thoroughly. Use morning and evening."
  },
  {
    id: 2,
    name: "REGIMA Purifying Gel Cleanser",
    category: "Cleansers",
    type: "retail",
    description: "Clarifying gel cleanser that removes excess oil and unclogs pores without stripping the skin.",
    keyIngredients: [
      "Salicylic Acid",
      "Tea Tree Oil",
      "Witch Hazel",
      "Aloe Vera"
    ],
    skinTypes: ["Combination", "Oily", "Acne-Prone"],
    size: "200ml",
    usageInstructions: "Apply to damp skin, massage gently for 30-60 seconds, and rinse thoroughly. Use morning and evening."
  },
  {
    id: 3,
    name: "REGIMA Micellar Cleansing Water",
    category: "Cleansers",
    type: "retail",
    description: "No-rinse micellar water that gently removes makeup, oil, and impurities while maintaining skin hydration.",
    keyIngredients: [
      "Micelles",
      "Cucumber Extract",
      "Chamomile Extract",
      "Vitamin B5"
    ],
    skinTypes: ["All Skin Types", "Sensitive"],
    size: "250ml",
    usageInstructions: "Apply to cotton pad and gently wipe over face, eyes, and neck. No rinsing required. Ideal for makeup removal or quick cleansing."
  },

  // Exfoliants
  {
    id: 4,
    name: "REGIMA AHA/BHA Resurfacing Solution",
    category: "Exfoliants",
    type: "professional",
    description: "Professional-strength chemical exfoliant for clinic use. Contains a blend of AHAs and BHAs to deeply exfoliate and renew skin texture.",
    keyIngredients: [
      "Glycolic Acid (15%)",
      "Lactic Acid (5%)",
      "Salicylic Acid (2%)",
      "Niacinamide"
    ],
    skinTypes: ["All Skin Types", "Aging", "Acne-Prone", "Hyperpigmented"],
    size: "100ml",
    usageInstructions: "For professional use only. Apply evenly to clean, dry skin. Leave on for 1-5 minutes depending on skin type and sensitivity. Neutralize thoroughly."
  },
  {
    id: 5,
    name: "REGIMA Enzymatic Powder Exfoliant",
    category: "Exfoliants",
    type: "retail",
    description: "Water-activated powder exfoliant with fruit enzymes that dissolve dead skin cells and refine pores.",
    keyIngredients: [
      "Papain (Papaya Enzyme)",
      "Bromelain (Pineapple Enzyme)",
      "Rice Powder",
      "Colloidal Oatmeal"
    ],
    skinTypes: ["All Skin Types", "Sensitive"],
    size: "75g",
    usageInstructions: "Pour small amount into palm, add water to create paste. Massage gently onto damp skin for 30-60 seconds, then rinse. Use 2-3 times per week."
  },
  {
    id: 6,
    name: "REGIMA Overnight Resurfacing Peel",
    category: "Exfoliants",
    type: "retail",
    description: "Leave-on overnight peel that exfoliates and renews skin while you sleep for improved texture and radiance.",
    keyIngredients: [
      "Glycolic Acid (8%)",
      "Lactic Acid (5%)",
      "Hyaluronic Acid",
      "Peptide Complex"
    ],
    skinTypes: ["Normal", "Combination", "Oily", "Aging"],
    size: "50ml",
    usageInstructions: "Apply thin layer to clean, dry skin in the evening. Avoid eye area. Rinse thoroughly in the morning. Use 2-3 times per week."
  },

  // Serums
  {
    id: 7,
    name: "REGIMA Vitamin C + Ferulic Brightening Serum",
    category: "Serums",
    type: "retail",
    description: "Potent antioxidant serum that brightens skin tone, reduces dark spots, and protects against environmental damage.",
    keyIngredients: [
      "L-Ascorbic Acid (15%)",
      "Ferulic Acid",
      "Vitamin E",
      "Hyaluronic Acid"
    ],
    skinTypes: ["All Skin Types", "Hyperpigmented", "Dull"],
    size: "30ml",
    usageInstructions: "Apply 3-4 drops to clean face and neck in the morning before moisturizer and sunscreen. Store in cool, dark place."
  },
  {
    id: 8,
    name: "REGIMA Hyaluronic Acid Hydrating Serum",
    category: "Serums",
    type: "retail",
    description: "Multi-molecular weight hyaluronic acid serum that intensely hydrates all skin layers without greasiness.",
    keyIngredients: [
      "Multi-molecular Hyaluronic Acid",
      "Glycerin",
      "B5",
      "Snow Mushroom Extract"
    ],
    skinTypes: ["All Skin Types", "Dehydrated"],
    size: "30ml",
    usageInstructions: "Apply 3-4 drops to damp skin after cleansing. Follow with moisturizer. Can be used morning and evening."
  },
  {
    id: 9,
    name: "REGIMA Retinol Recovery Serum",
    category: "Serums",
    type: "retail",
    description: "Advanced retinol formula that reduces fine lines, refines texture, and improves clarity with minimal irritation.",
    keyIngredients: [
      "Encapsulated Retinol (0.5%)",
      "Granactive Retinoid",
      "Ceramide Complex",
      "Squalane"
    ],
    skinTypes: ["Normal", "Combination", "Aging", "Acne-Prone"],
    size: "30ml",
    usageInstructions: "Apply 1 pump to clean, dry face in the evening. Avoid eye area. Start with 2-3 nights per week, gradually increasing frequency. Always use SPF during the day."
  },
  {
    id: 10,
    name: "REGIMA Niacinamide + Zinc Clarifying Serum",
    category: "Serums",
    type: "retail",
    description: "Balancing serum that regulates oil production, minimizes pores, and reduces blemishes and redness.",
    keyIngredients: [
      "Niacinamide (10%)",
      "Zinc PCA",
      "Tea Tree Extract",
      "Licorice Root Extract"
    ],
    skinTypes: ["Combination", "Oily", "Acne-Prone", "Congested"],
    size: "30ml",
    usageInstructions: "Apply 3-4 drops to clean skin morning and evening before moisturizer. Can be used as a spot treatment on blemishes."
  },

  // Moisturizers
  {
    id: 11,
    name: "REGIMA Hydra-Lock Moisturizer",
    category: "Moisturizers",
    type: "retail",
    description: "Lightweight yet deeply hydrating moisturizer that locks in moisture for up to 72 hours.",
    keyIngredients: [
      "Hyaluronic Acid",
      "Ceramides",
      "Squalane",
      "Glycerin"
    ],
    skinTypes: ["All Skin Types", "Dehydrated"],
    size: "50ml",
    usageInstructions: "Apply to clean face and neck morning and evening. Can be layered over serums for enhanced hydration."
  },
  {
    id: 12,
    name: "REGIMA Ultra-Rich Repair Cream",
    category: "Moisturizers",
    type: "retail",
    description: "Luxurious cream that deeply nourishes and repairs extremely dry or compromised skin barriers.",
    keyIngredients: [
      "Shea Butter",
      "Peptide Complex",
      "Ceramides",
      "Niacinamide"
    ],
    skinTypes: ["Dry", "Very Dry", "Sensitive", "Mature"],
    size: "50ml",
    usageInstructions: "Apply to clean face and neck morning and evening. For extra dry skin, apply a second layer to areas of dryness."
  },
  {
    id: 13,
    name: "REGIMA Oil-Control Mattifying Lotion",
    category: "Moisturizers",
    type: "retail",
    description: "Oil-free, mattifying moisturizer that hydrates while controlling excess oil and shine throughout the day.",
    keyIngredients: [
      "Niacinamide",
      "Hyaluronic Acid",
      "Bamboo Extract",
      "Salicylic Acid"
    ],
    skinTypes: ["Combination", "Oily", "Acne-Prone"],
    size: "50ml",
    usageInstructions: "Apply to clean face and neck morning and evening. Can be used under makeup as a mattifying primer."
  },

  // Masks
  {
    id: 14,
    name: "REGIMA Purifying Clay Mask",
    category: "Masks",
    type: "retail",
    description: "Deep-cleansing clay mask that draws out impurities, absorbs excess oil, and refines pores.",
    keyIngredients: [
      "Kaolin Clay",
      "Bentonite Clay",
      "Charcoal Powder",
      "Tea Tree Oil"
    ],
    skinTypes: ["Combination", "Oily", "Congested", "Acne-Prone"],
    size: "100ml",
    usageInstructions: "Apply even layer to clean skin, avoiding eye area. Leave on for 10-15 minutes until nearly dry but not completely hardened. Rinse thoroughly. Use 1-2 times weekly."
  },
  {
    id: 15,
    name: "REGIMA Hydrating Gel Mask",
    category: "Masks",
    type: "professional",
    description: "Professional cooling gel mask that intensely hydrates, soothes, and reduces redness and irritation.",
    keyIngredients: [
      "Hyaluronic Acid",
      "Aloe Vera",
      "Centella Asiatica",
      "Cucumber Extract"
    ],
    skinTypes: ["All Skin Types", "Dehydrated", "Sensitive", "Post-Treatment"],
    size: "250ml",
    usageInstructions: "For professional use. Apply generous layer to face and neck after treatments. Leave on for 15-20 minutes. Remove with warm towels or rinse if desired."
  },
  {
    id: 16,
    name: "REGIMA Enzymatic Treatment Mask",
    category: "Masks",
    type: "professional",
    description: "Professional-strength enzyme mask that deeply exfoliates, brightens, and improves skin texture without abrasion.",
    keyIngredients: [
      "Papain",
      "Bromelain",
      "Pumpkin Enzyme",
      "Lactic Acid"
    ],
    skinTypes: ["All Skin Types", "Dull", "Congested", "Mature"],
    size: "250ml",
    usageInstructions: "For professional use. Apply even layer to clean skin. Increase activation with steam if desired. Leave on for 10-15 minutes, then rinse thoroughly."
  },

  // Treatment Products
  {
    id: 17,
    name: "REGIMA Intensive Brightening Treatment",
    category: "Treatments",
    type: "professional",
    description: "Professional-strength brightening treatment that targets hyperpigmentation, dark spots, and uneven skin tone.",
    keyIngredients: [
      "Tranexamic Acid",
      "Arbutin",
      "Kojic Acid",
      "Vitamin C"
    ],
    skinTypes: ["All Skin Types", "Hyperpigmented", "Melasma-Prone"],
    size: "100ml",
    usageInstructions: "For professional use only. Apply to affected areas after exfoliation. Leave on for 15-20 minutes, then neutralize and remove thoroughly."
  },
  {
    id: 18,
    name: "REGIMA Lymphatic Boost Oil",
    category: "Treatments",
    type: "professional",
    description: "Specialized facial massage oil that enhances lymphatic drainage, reduces puffiness, and detoxifies the skin.",
    keyIngredients: [
      "Arnica Montana Extract",
      "Cypress Essential Oil",
      "Juniper Berry Oil",
      "Marula Oil",
      "Grapeseed Oil"
    ],
    skinTypes: ["All Skin Types", "Puffy", "Congested"],
    size: "100ml",
    usageInstructions: "For professional use. Warm 2-3 pumps between palms and apply to face. Perform lymphatic drainage massage techniques following protocol guide."
  },
  {
    id: 19,
    name: "REGIMA Advanced Peptide Complex",
    category: "Treatments",
    type: "professional",
    description: "Concentrated peptide solution that firms, tightens, and improves elasticity, especially for mature skin.",
    keyIngredients: [
      "Argireline",
      "Matrixyl 3000",
      "Leuphasyl",
      "Copper Peptides"
    ],
    skinTypes: ["Mature", "Aging", "Loss of Firmness"],
    size: "50ml",
    usageInstructions: "For professional use. Apply to face and neck after cleansing and toning. Use with microcurrent or galvanic treatments for enhanced penetration."
  },
  {
    id: 20,
    name: "REGIMA Skin Recovery Booster",
    category: "Treatments",
    type: "retail",
    description: "Intensive treatment drops that accelerate skin healing, reduce redness, and restore barrier function after professional treatments.",
    keyIngredients: [
      "Centella Asiatica",
      "Madecassoside",
      "Ceramides",
      "Panthenol"
    ],
    skinTypes: ["All Skin Types", "Sensitive", "Compromised", "Post-Treatment"],
    size: "15ml",
    usageInstructions: "Apply 2-3 drops to clean skin morning and evening. Can be mixed with moisturizer or used alone. Ideal for use after professional treatments or when skin barrier is compromised."
  },

  // Sun Protection
  {
    id: 21,
    name: "REGIMA Daily Defense SPF 50",
    category: "Sun Protection",
    type: "retail",
    description: "Lightweight, broad-spectrum sunscreen that protects against UVA/UVB rays while providing antioxidant benefits.",
    keyIngredients: [
      "Zinc Oxide",
      "Titanium Dioxide",
      "Vitamin E",
      "Niacinamide"
    ],
    skinTypes: ["All Skin Types"],
    size: "50ml",
    usageInstructions: "Apply generously to face and neck as final step in morning skincare routine. Reapply every 2 hours when exposed to sun or after swimming/sweating."
  },
  {
    id: 22,
    name: "REGIMA Tinted Mineral Sunscreen SPF 30",
    category: "Sun Protection",
    type: "retail",
    description: "Tinted mineral sunscreen that provides sheer coverage while protecting against UV damage and blue light.",
    keyIngredients: [
      "Zinc Oxide",
      "Iron Oxides",
      "Hyaluronic Acid",
      "Vitamin C"
    ],
    skinTypes: ["All Skin Types", "Sensitive"],
    size: "50ml",
    usageInstructions: "Apply evenly to face and neck after moisturizer. Can be worn alone or under makeup. Reapply every 2 hours during sun exposure."
  },

  // Specialty Products
  {
    id: 23,
    name: "REGIMA Post-Microneedling Recovery Gel",
    category: "Specialty",
    type: "professional",
    description: "Sterile gel specifically formulated to soothe, cool, and accelerate healing after microneedling treatments.",
    keyIngredients: [
      "Hyaluronic Acid",
      "Copper Peptides",
      "Growth Factors",
      "Aloe Vera"
    ],
    skinTypes: ["All Skin Types", "Post-Microneedling"],
    size: "100ml",
    usageInstructions: "For professional use. Apply generous layer immediately after microneedling treatment. Can be left on the skin or removed after 30-60 minutes."
  },
  {
    id: 24,
    name: "REGIMA Cellular Renewal Concentrate",
    category: "Specialty",
    type: "professional",
    description: "Advanced anti-aging concentrate that stimulates collagen production, cellular turnover, and skin renewal.",
    keyIngredients: [
      "Stem Cell Extract",
      "EGF (Epidermal Growth Factor)",
      "Retinol",
      "Peptide Complex"
    ],
    skinTypes: ["Mature", "Aging", "Sun-Damaged"],
    size: "30ml",
    usageInstructions: "For professional use. Apply small amount after cleansing and exfoliation. May be used with microcurrent, ultrasound, or LED therapy for enhanced results."
  }
];

// Export an organized list by category
export const productsByCategory = productCatalog.reduce((acc, product) => {
  if (!acc[product.category]) {
    acc[product.category] = [];
  }
  acc[product.category].push(product);
  return acc;
}, {} as Record<string, ProductInfo[]>);

// Export an organized list by type (professional vs retail)
export const productsByType = productCatalog.reduce((acc, product) => {
  if (!acc[product.type]) {
    acc[product.type] = [];
  }
  acc[product.type].push(product);
  return acc;
}, {} as Record<string, ProductInfo[]>);

// Helper function to look up product details
export function getProductInfo(name: string): ProductInfo | undefined {
  return productCatalog.find(product => 
    product.name.toLowerCase() === name.toLowerCase() ||
    product.name.toLowerCase().includes(name.toLowerCase())
  );
}