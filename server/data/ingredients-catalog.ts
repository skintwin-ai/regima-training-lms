
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
  imageUrl?: string;
}

export const ingredientsCatalog: IngredientInfo[] = [
  // REGIMA Proprietary Actives
  {
    name: "Inter-Penetrating Biopolymer",
    category: "REGIMA Proprietary Actives",
    mainFunctions: [
      "Kappaphycus Alvarezii Extract",
      "Caesalpinia Spinosa Fruit Extract",
      "Visible lifting and firming"
    ],
    benefits: [
      "Visible lifting effect",
      "Skin firming",
      "Elasticizing properties"
    ],
    concentration: "2-5%",
    notes: "Advanced biopolymer complex providing immediate lifting and firming effects. Key ingredient in REGIMA's premium lifting treatments.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_e5577efe327742e5a643645b4d2efa6f~mv2.png"
  },
  {
    name: "Hydrolyzed Candida Saitoana Extract",
    category: "REGIMA Biotechnology Actives",
    mainFunctions: [
      "Activates cutaneous autophagy system",
      "Rich in Candida saitoana α-glucans",
      "Cell detoxification"
    ],
    benefits: [
      "Improves skin radiance",
      "Limits signs of ageing",
      "Smooths microrelief and wrinkles",
      "Detoxifies tired skin"
    ],
    concentration: "1-3%",
    notes: "Obtained by biotechnology process, essential for activating the cutaneous autophagy system. Reinforces detoxifying cell systems for cell and tissue longevity.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_9747d3ecd5af4775860d1107bbe70533~mv2.png"
  },
  {
    name: "New Species of Yeast Extract (Pichia Heedii)",
    category: "REGIMA Desert Botanicals",
    mainFunctions: [
      "Isolated from Saguaro Cactus",
      "Rich in glucomannans",
      "Combat harmful environmental stress"
    ],
    benefits: [
      "Protects against urban stresses",
      "Optimizes complexion tone and radiance",
      "Treats hyperpigmentation",
      "Detox for smokers"
    ],
    concentration: "2-4%",
    notes: "New species from Sonoran Desert with sophisticated intracellular communication mechanism. Proven in human trials for all skin types.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_b0cdb18dde12419182084ae9c2480b06~mv2.png"
  },
  {
    name: "BV-OSC (Ascorbyl Tetraisopalmitate)",
    category: "Vitamin C Derivatives",
    mainFunctions: [
      "Oil soluble Vitamin C",
      "UV protection",
      "Collagen synthesis promotion"
    ],
    benefits: [
      "Protects cells from UV damage",
      "Improves skin tone",
      "Reduces melanin production",
      "Strengthens resilient complexion"
    ],
    concentration: "1-3%",
    notes: "Powerful oil soluble Vitamin C that won't oxidize. Multi-functional anti-ageing ingredient with impressive safety profile.",
    imageUrl: "https://static.wixstatic.com/media/66f2cc_392cf192fccb4c898aeb38236864473a~mv2.png"
  },

  // Mineral and Clay Actives
  {
    name: "Kaolin",
    category: "Mineral Clay",
    mainFunctions: [
      "Absorbent clay base",
      "Perfect partner for anti-pollutant actives",
      "Enhances circulation"
    ],
    benefits: [
      "Nourishes and soothes skin",
      "Chemical-free healing",
      "Detoxifies and purifies",
      "Reduces sebum in oily skin"
    ],
    concentration: "5-15%",
    notes: "Perfect base for detox active ingredients with essential phyto-nutrients. Therapeutic and smoothing for all skin types.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_740afe99efdb46f18a68a294e604de8a~mv2.png"
  },

  // Plant Extracts and Botanicals
  {
    name: "Bitter Orange Extract (Citrus Aurantium Amara)",
    category: "Anti-Cellulite Botanicals",
    mainFunctions: [
      "Lipolytic properties",
      "Decongesting action",
      "Activates microcirculation"
    ],
    benefits: [
      "Breaks down fat",
      "Improves silhouette",
      "Eliminates venous stasis",
      "Reduces spongy cellulite"
    ],
    concentration: "2-5%",
    notes: "Extracted from bitter orange tree petals. 79% of trial volunteers showed significant increase in dermal density.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_d3ef5980d3f849d29c6b6c46e199bdb6~mv2.png"
  },
  {
    name: "Sacred Lotus (Nelumbo Nucifera Leaf Extract)",
    category: "Anti-Cellulite Botanicals",
    mainFunctions: [
      "Rich in flavonols",
      "Triple action anti-cellulite",
      "Activates lipolysis"
    ],
    benefits: [
      "Activates fat breakdown",
      "Reduces fat storage",
      "Limits adipose tissue inflammation",
      "Inhibits fat cell differentiation"
    ],
    concentration: "1-3%",
    notes: "Ultra powerful aquatic plant targeting cellulite and drainage. Boosts synthesis of universal gene for caloric restriction: SIRT-1 Adiponectin.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_60fd3e46cf0843d28aefbbbb7cb2a4c7~mv2.png"
  },
  {
    name: "Nasturtium (Tropaeolum Majus Extract)",
    category: "Oxygenating Botanicals",
    mainFunctions: [
      "Rich in arabinogalactans",
      "Restores cellular response to hypoxic stress",
      "Promotes skin oxygenation"
    ],
    benefits: [
      "Smoothes skin surface",
      "Improves radiant complexion",
      "Brightens dull, lifeless skin",
      "Enhances oxygen diffusion"
    ],
    concentration: "1-2%",
    notes: "Promotes intracellular diffusion of oxygen resulting in improved radiance and smoothed skin texture.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_78d7f99076c84d08b7c0576567f7ef9d~mv2.png"
  },
  {
    name: "Hydrolyzed Celosia Cristata Flower/Seed Extract",
    category: "Slenderizing Botanicals",
    mainFunctions: [
      "Rich in polyphenols",
      "Dual action slenderizing",
      "Inhibits adipocyte differentiation"
    ],
    benefits: [
      "Limits development of fat masses",
      "Aids drainage of cellulitic regions",
      "Reduces oedema",
      "Firms body contours"
    ],
    concentration: "2-4%",
    notes: "Combined with Prunella Vulgaris Extract for synergistic slenderizing effects, particularly effective in abdomen and thighs.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_a312f6e5bcca4e6484e6a12b8f6a65ed~mv2.png"
  },
  {
    name: "Centella Asiatica",
    category: "Healing Botanicals",
    mainFunctions: [
      "Anti-inflammatory",
      "Healing accelerator",
      "Antioxidant protection"
    ],
    benefits: [
      "Promotes healing",
      "Improves collagen synthesis",
      "Anti-wrinkle effect",
      "Calms inflammation"
    ],
    concentration: "2-5%",
    notes: "REGIMA uses nano-encapsulation for enhanced dermal action with anti-bacterial and anti-fungal properties.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_afba9c0273a140f2b183054e6cd67f59~mv2.png"
  },

  // Premium Plant Oils
  {
    name: "Rosa Canina Fruit Oil (Rosehip)",
    category: "Premium Plant Oils",
    mainFunctions: [
      "Powerful antioxidant",
      "Rich in Vitamins A, B, C, D",
      "Diuretic properties"
    ],
    benefits: [
      "Protects from stress",
      "Reduces fine lines and wrinkles",
      "Reduces dark spots",
      "Similar activity to Vitamin A"
    ],
    concentration: "5-100%",
    notes: "80% essential fatty acids, proven effective for scarring, stretch marks, hyperpigmentation, and premature aging.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_9c6d24636a47493f860753d16b69390a~mv2.png"
  },
  {
    name: "Blackcurrant Seed Oil (Ribes Nigrum)",
    category: "Premium Plant Oils",
    mainFunctions: [
      "Anti-inflammatory and antioxidant",
      "Rich in Omega 3 and 6",
      "High in iron"
    ],
    benefits: [
      "Healing for psoriasis and eczema",
      "Retains moisture",
      "Reduces acne inflammation",
      "Dilutes accumulated pore fat"
    ],
    concentration: "3-50%",
    notes: "Micromolecular ingredients penetrate rapidly. Capability of diluting accumulated fat within pores, reducing blackheads and acne.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_09308a0f16944613a086acb380615e9e~mv2.png"
  },
  {
    name: "Shea Butter (Butyrospermum Parkii)",
    category: "Premium Plant Oils",
    mainFunctions: [
      "Rich in tocopherols (Vitamin E)",
      "Regulates moisture balance",
      "Contains essential fatty acids"
    ],
    benefits: [
      "Deeply moisturizing",
      "Stimulates collagen production",
      "Improves fine lines and wrinkles",
      "Reduces inflammation"
    ],
    concentration: "5-25%",
    notes: "Extracted from Shea-Karite tree kernels. Contains vitamins A, F, E, D, provitamin A, and allantoin for comprehensive skin repair.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_585d6ab848724cdfbe2c5a9c3c2b3387~mv2.png"
  },
  {
    name: "Camellia Sinensis Seed Oil",
    category: "Premium Plant Oils",
    mainFunctions: [
      "Secret of the Geishas",
      "Identical molecular weight to skin",
      "Rich in Omega 3, 6, 9"
    ],
    benefits: [
      "Anti-aging and anti-inflammatory",
      "Outstanding moisture retention",
      "Contains squalene",
      "Natural UV protection"
    ],
    concentration: "5-100%",
    notes: "From Japanese Goto Islands, treasured for centuries. Contains vitamins A, B, D, E and ensures rapid absorption due to molecular compatibility.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_ec5d4fd11ee2430c8b0717e1e81afc99~mv2.png"
  },
  {
    name: "Olive Fruit Oil (Olea Europaea)",
    category: "Premium Plant Oils",
    mainFunctions: [
      "Essential fatty acids",
      "Antioxidant action",
      "Rich in polyphenols"
    ],
    benefits: [
      "Skin conditioning and smoothing",
      "Moisturizing",
      "Prevents UV-induced damage",
      "Anti-aging properties"
    ],
    concentration: "5-50%",
    notes: "Rich in polyphenols and essential fatty acids. Provides comprehensive skin protection and conditioning.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_99dccc6d8b874f9680f60c38ed80c405~mv2.png"
  },
  {
    name: "Avocado Oil (Persea Gratissima)",
    category: "Premium Plant Oils",
    mainFunctions: [
      "Contains vitamins A, B, D, E",
      "Rich in beta-carotene",
      "Contains lecithin"
    ],
    benefits: [
      "Antioxidant action",
      "Moisturizing and soothing",
      "Softening properties",
      "Nourishing for dry skin"
    ],
    concentration: "5-50%",
    notes: "Rich in various vitamins and lecithin. Excellent for moisturizing, soothing, and softening all skin types.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_1c4231735b554de492ddb3d899364c97~mv2.png"
  },

  // Fruit Extracts and Enzymes
  {
    name: "Seeds of the Lupine Plant",
    category: "Plant Peptides",
    mainFunctions: [
      "Rich in lipophilized lupine peptides",
      "Promotes oxygenation",
      "Stimulates VEGF synthesis"
    ],
    benefits: [
      "Accentuates skin radiance",
      "Improves microcirculation",
      "Reduces skin roughness",
      "Increases cellular oxygenation"
    ],
    concentration: "1-3%",
    notes: "Increases renewal of human fibroblasts by 84%. Creates slightly pink effect from improved blood capillary reflection.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_f7ad12ed128a4d4590219f967a7ae158~mv2.png"
  },
  {
    name: "Phytelene of Pineapple Fruit Extract",
    category: "Fruit Enzymes",
    mainFunctions: [
      "Proteolytic enzyme bromelain",
      "Natural AHAs (citric, malic)",
      "Anti-inflammatory vitamins"
    ],
    benefits: [
      "Anti-aging, reduces wrinkles",
      "Improves lack-lustre skin",
      "Natural debridement",
      "Promotes radiance"
    ],
    concentration: "2-5%",
    notes: "Natural exfoliating with bromelain that breaks down proteins. Minerals are bio-activators of collagen and elastin synthesis.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_1a88f474358441999b366b3ceef8d250~mv2.png"
  },
  {
    name: "Phytelene of Papaya Fruit Extract",
    category: "Fruit Enzymes",
    mainFunctions: [
      "Proteolytic enzyme papain",
      "The 'Biological Scalpel'",
      "Natural debridement"
    ],
    benefits: [
      "Wound healing",
      "Soothes inflammation",
      "Relieves irritation",
      "Antioxidant action"
    ],
    concentration: "2-5%",
    notes: "Papain dissolves dead tissue without affecting living tissue. Contains vitamins A, C, E for comprehensive skin repair.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_0f2d2deab389422f89db3ea1fcb7c49d~mv2.png"
  },

  // Fermented Extracts
  {
    name: "Kombuchka Black Tea Ferment",
    category: "Fermented Extracts",
    mainFunctions: [
      "Known as 'Long-Life' Fungus",
      "Rich in organic acids",
      "Vitamin B group"
    ],
    benefits: [
      "Increases brightness and radiance",
      "Anti-glycation properties",
      "Re-densifying skin",
      "Anti-aging effects"
    ],
    concentration: "1-3%",
    notes: "From Russia and Bohemia, prevents hardening of elastin fibres and improves skin texture and quality.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_c66488f045ba41e8bccbcab6bc73d873~mv2.png"
  },

  // Detoxifying Actives
  {
    name: "Detoxifyer (Butyrospermum Parkii Seedcake Extract)",
    category: "Detoxifying Actives",
    mainFunctions: [
      "Natural detoxifying agent",
      "Rich in gallic acid",
      "Chelates metal ions"
    ],
    benefits: [
      "Fights chemical pollutants",
      "Anti-oxidant and anti-inflammatory",
      "Detoxifies cells",
      "Must-have for smokers"
    ],
    concentration: "1-2%",
    notes: "From shea butter, chelates iron and lead. Fights nicotine, chlorine, and heavy metals from urban pollution.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_2ea3a6abba48418e95c1f4722b1afd11~mv2.png"
  },

  // Specialty Actives
  {
    name: "Sodium Lactate",
    category: "Multi-Functional Acids",
    mainFunctions: [
      "Natural antibacterial",
      "Natural exfoliator and humectant",
      "Inhibits tyrosinase activity"
    ],
    benefits: [
      "Helps even skin color",
      "Reduces irritation",
      "Increases moisture content",
      "Antimicrobial action"
    ],
    concentration: "2-5%",
    notes: "Naturally derived from lactic acid fermentation. Makes other ingredients less greasy yet more moisturizing.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_89df4198331644beb3fbfe1f7b46e687~mv2.png"
  },
  {
    name: "Shii Take Mushrooms (Lentinus Edodes Extract)",
    category: "Mushroom Extracts",
    mainFunctions: [
      "Rich in oligosaccharides",
      "Protects extracellular matrix",
      "Anti-metalloproteinase action"
    ],
    benefits: [
      "Increases elasticity",
      "Improves tone",
      "Combats collagen degradation",
      "Supports tissues"
    ],
    concentration: "1-3%",
    notes: "Limits metalloproteinase activity that breaks down collagen. Significant reduction in skin fatigability.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_5bbe7ea827e64a51af23211e412e9bc1~mv2.png"
  },
  {
    name: "Hydrolysed Pepper Fruit Extract",
    category: "Firming Actives",
    mainFunctions: [
      "Rich in alpha-glucans",
      "Acts on deep dermal structure",
      "Stimulates contraction capacities"
    ],
    benefits: [
      "Reinforces photoaged dermis",
      "Improves skin firmness",
      "Limits ptosis (sagging)",
      "Essential for tissue regeneration"
    ],
    concentration: "1-2%",
    notes: "Purified from black peppercorns, creates and maintains skin integrity through enhanced cellular migration.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_c12b502b13e045d3bc052235a51eb909~mv2.png"
  },

  // Hydrating Complexes
  {
    name: "Polyacrylate Crosspolymer-6",
    category: "Texture Enhancers",
    mainFunctions: [
      "Provides rich, elegant touch",
      "Velvety sensation",
      "Enhanced spreadability"
    ],
    benefits: [
      "Luxurious skin feel",
      "Improved product texture",
      "Smooth application",
      "Enhanced sensory experience"
    ],
    concentration: "0.5-2%",
    notes: "Advanced polymer providing exceptional skin feel and product aesthetics.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_cff3daf254d2478b9a8c7269dc9cb03f~mv2.png"
  },
  {
    name: "Caesalpinia Spinosa Oligosaccharides",
    category: "Hydrating Complexes",
    mainFunctions: [
      "Hydrocolloidal matrix",
      "Sequential release system",
      "Rich in galactomannans"
    ],
    benefits: [
      "Immediate moisturization",
      "Cumulative hydration",
      "Long-lasting effects",
      "Smoother, more elastic skin"
    ],
    concentration: "2-5%",
    notes: "Extracted from Andean mountain seeds, resistant to extreme dryness. Regulates desquamation and restores cellular cohesion.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_1c9cbb8d131d40779e477364affc379b~mv2.png"
  },
  {
    name: "Wild Pansy (Hydrolyzed Viola Tricolor Extract)",
    category: "Hydrating Complexes",
    mainFunctions: [
      "Rich in oligosaccharides",
      "Regulates epidermal hydration",
      "Improves water circulation"
    ],
    benefits: [
      "Combats skin drying",
      "Increases water binding capacity",
      "Maintains ideal equilibrium",
      "Preserves suppleness and elasticity"
    ],
    concentration: "1-3%",
    notes: "Improves water circulation from dermis to epidermis via lipid layer irrigation channels. Renews epidermal hyaluronic acid.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_32bc13873c5e4a5e8f6c5b04500a250f~mv2.png"
  },
  {
    name: "Japanese Lilyturf (Ophiopogon Japonicus Root Extract)",
    category: "Hydrating Complexes",
    mainFunctions: [
      "Rich in fructosans",
      "Drought resistance mucilages",
      "Biological humectant"
    ],
    benefits: [
      "Reinforces epidermal cohesion",
      "Restructures barrier function",
      "Increases Natural Moisturizing Factors",
      "Limits water loss"
    ],
    concentration: "1-2%",
    notes: "From Japanese Lilyturf tubers. Plant resists droughts through water-trapping mucilages.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_ee3316f3177744caa1d6ad4d3591a6a3~mv2.png"
  },

  // Advanced Acids
  {
    name: "Hi Pure 90 Lactic Acid",
    category: "Alpha Hydroxy Acids",
    mainFunctions: [
      "Best therapeutic index",
      "Skin renewal vs irritation",
      "High concentration and purification"
    ],
    benefits: [
      "Stimulates exfoliation",
      "Cell renewal plus moisturization",
      "Anti-aging benefits",
      "Smoother, brighter skin"
    ],
    concentration: "5-25%",
    notes: "Specialized lactic acid providing optimal balance of renewal and moisturization. The AHA of choice for anti-aging.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_f89fddb71c4842e58fb988dfd9e6e6aa~mv2.png"
  },
  {
    name: "Prickly Pear Cactus (Hydrolyzed Opuntia Ficus Indica)",
    category: "Natural Exfoliants",
    mainFunctions: [
      "Rich in purified oligosaccharides",
      "Increases enzyme activity",
      "Facilitates natural desquamation"
    ],
    benefits: [
      "Stimulates natural exfoliation",
      "Kick starts peeling process",
      "Ensures skin health",
      "Accelerates cell renewal"
    ],
    concentration: "1-3%",
    notes: "Biological strategy that significantly increases enzymes responsible for natural exfoliation and cell renewal.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_8179bc5539c44e70a62975c82874f299~mv2.png"
  },

  // Barrier Repair Actives
  {
    name: "Chestnut (Castanea Sativa Seed Extract)",
    category: "Barrier Repair",
    mainFunctions: [
      "Rich in rhamnogalacturonans",
      "Stimulates keratinocyte differentiation",
      "Uronic acids from chestnuts"
    ],
    benefits: [
      "Normalizes cohesion/desquamation balance",
      "Restores epidermal lipid synthesis",
      "Combats dry or dehydrated skin",
      "Stimulates fatty acids and ceramides"
    ],
    concentration: "1-2%",
    notes: "Stimulates cell turnover and synthesis of fatty acids and ceramides to restore barrier function upset by aging and environmental stress.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_f8fbbef435ba4dc5a1a6b750cebf4419~mv2.png"
  },
  {
    name: "Biotechnology Vegetal Extract (Octyldodecyl Ester)",
    category: "Barrier Repair",
    mainFunctions: [
      "Amphiphilic molecule",
      "Bi-lipidic structure",
      "Resembles skin ceramides"
    ],
    benefits: [
      "Preserves skin integrity",
      "Strengthens cell cohesion",
      "Activates cell differentiation",
      "Stimulates epidermal lipid synthesis"
    ],
    concentration: "1-3%",
    notes: "Combined hydrophilic and lipophilic molecule with affinity for oil and water, closely resembling skin ceramides.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_c01516aaa836483dbca64ea49d421cba~mv2.png"
  },

  // Premium Seed Oils
  {
    name: "Argan Oil (Argania Spinosa Kernel Oil)",
    category: "Premium Seed Oils",
    mainFunctions: [
      "Contains rare plant sterols",
      "Unique phytosterol composition",
      "Reduces inflammation"
    ],
    benefits: [
      "Beneficial for acne",
      "Helps psoriasis and eczema",
      "Anti-inflammatory properties",
      "Unique sterol combination"
    ],
    concentration: "5-100%",
    notes: "Contains rare plant sterols not found in other oils. No other oils have comparable phytosterol composition.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_3f6749c7e763437ca757f531b02e94fc~mv2.png"
  },
  {
    name: "Apricot Kernel Oil (Prunus Armeniaca)",
    category: "Premium Seed Oils",
    mainFunctions: [
      "Similar lipid content to skin",
      "Rich in oleic and linoleic acids",
      "Contains vitamins A, B1, B2, B6, E"
    ],
    benefits: [
      "Soothes rough, damaged skin",
      "Rapid skin penetration",
      "Relieves itchy, irritated skin",
      "Beneficial for dry, mature skin"
    ],
    concentration: "5-50%",
    notes: "Fine texture allows rapid penetration. When skin's lipid content becomes too low, topical application helps repair damage.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_377be95d0747481889be26389ad7c570~mv2.png"
  },
  {
    name: "Hazelnut Seed Oil (Corylus Avellana)",
    category: "Premium Seed Oils",
    mainFunctions: [
      "High percentage linoleic acid",
      "Power of diffusion",
      "Rapid epidermal penetration"
    ],
    benefits: [
      "Softening and regenerating",
      "Restructuring properties",
      "No greasy feeling",
      "Effective skin tightening"
    ],
    concentration: "5-50%",
    notes: "Penetrates epidermis easily and rapidly. Contains high percentage of essential fatty acids, particularly linoleic acid.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_aaf922f41f3f4035a76c25a13f685f1e~mv2.png"
  },

  // Peptide Complexes
  {
    name: "Peptide Anti-Wrinkle Complex - Matrixyl® 3000",
    category: "Anti-Aging Peptides",
    mainFunctions: [
      "Peptides in synergy",
      "Restores youthful appearance",
      "Activates renewal genes"
    ],
    benefits: [
      "Anti-wrinkle effects",
      "Improves skin tone and elasticity",
      "Skin smoothing",
      "Activates natural repair"
    ],
    concentration: "3-8%",
    notes: "Peptides activate genes involved in extracellular matrix renewal and skin's natural repair processes.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_ff7bacfa3498414db41161a5e5a3bca1~mv2.png"
  },
  {
    name: "Palmitoyl Tripeptide-5",
    category: "Anti-Aging Peptides",
    mainFunctions: [
      "Anti-stretch marks",
      "Increased collagen synthesis",
      "Anti-wrinkle action"
    ],
    benefits: [
      "Helps repair damaged skin",
      "Skin firming and thickening",
      "Reduces stretch marks",
      "Enhanced collagen production"
    ],
    concentration: "2-5%",
    notes: "Powerful peptide for collagen synthesis and skin repair, particularly effective for damaged or aging skin.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_34e57e400bf34112b8df044e6afbecc5~mv2.png"
  },

  // Eye Care Complexes
  {
    name: "Tightening Complex - Chicory Root & Tara Tree",
    category: "Firming Complexes",
    mainFunctions: [
      "Moisturizing properties",
      "Rich in polysaccharides",
      "Galactomannans content"
    ],
    benefits: [
      "Tightening effects",
      "Enhanced moisture retention",
      "Improved skin firmness",
      "Polysaccharide nourishment"
    ],
    concentration: "2-5%",
    notes: "Natural tightening complex combining chicory root and tara tree extracts rich in galactomannans.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_9a41fefce5294114a96fbae4ffcaaaad~mv2.png"
  },
  {
    name: "Anti-Puffiness Complex",
    category: "Eye Care Complexes",
    mainFunctions: [
      "Hesperidin Methyl Chalcone",
      "Dipeptide-2 & Palmitoyl Tetrapeptide-3",
      "Stimulates skin drainage"
    ],
    benefits: [
      "Reduces and prevents eye puffiness",
      "Decongestant effect",
      "Anti-inflammatory",
      "Eye contour smoothing"
    ],
    concentration: "3-5%",
    notes: "Specialized complex targeting eye puffiness through drainage stimulation and capillary permeability reduction.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_b04cb2fb81af460c9cdb9b6f879cffeb~mv2.png"
  },
  {
    name: "Anti-Dark Circle Complex",
    category: "Eye Care Complexes",
    mainFunctions: [
      "Hydroxysuccinimide & Chrysin",
      "Palmitoyl Oligopeptide & Tetrapeptide-3",
      "Eliminates pigments"
    ],
    benefits: [
      "Chrysin stimulates bilirubin clearance",
      "Reinforces firmness and tone",
      "Anti-inflammatory effect",
      "Reduces dark circles"
    ],
    concentration: "3-5%",
    notes: "Advanced complex targeting pigments responsible for dark circles while reinforcing eye area firmness.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_16964ea0e71b41019b95e4e69550cf75~mv2.png"
  },
  {
    name: "Eye Contour Complex - Persian Silk Tree & St Paul's Wort",
    category: "Eye Care Complexes",
    mainFunctions: [
      "Persian Silk Tree Bark",
      "St Paul's Wort",
      "Strengthens dermis"
    ],
    benefits: [
      "Reduces crow's feet wrinkles",
      "Fades dark circles",
      "Reduces puffiness",
      "Evens skin color"
    ],
    concentration: "3-5%",
    notes: "Comprehensive eye care complex that reduces capillary leakages and stimulates detoxifying systems.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_16a02f0d3f6a450dbfdfc1df71f3e1ff~mv2.png"
  },

  // Marine and Algae Extracts
  {
    name: "Giant Kelp & Wheat Protein",
    category: "Marine Extracts",
    mainFunctions: [
      "Rich in glutamic acid",
      "Immediate skin lifting effect",
      "Rich in polysaccharides"
    ],
    benefits: [
      "Tightens and smoothes skin",
      "Improves skin radiance",
      "Marine and plant polysaccharides",
      "Instant lifting effect"
    ],
    concentration: "2-5%",
    notes: "Combination of marine kelp extract and hydrolyzed wheat protein for immediate lifting and smoothing effects.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_aee315f2e85b43169b5bb4271da605e0~mv2.png"
  },

  // Specialized Treatment Actives
  {
    name: "Bio Skin Up",
    category: "Specialized Treatment Actives",
    mainFunctions: [
      "Muira Puama Bark/Stem Extract",
      "Brazilian Ginseng Root Extract",
      "White Lily Flower Extract"
    ],
    benefits: [
      "Reduces periorbital hyperpigmentation",
      "Repairs microcirculation function",
      "Anti-inflammatory and anti-wrinkle",
      "Assists collagen and elastin synthesis"
    ],
    concentration: "2-4%",
    notes: "Complex blend for eye area targeting fat bags, oedema reduction, and vascular wall strengthening.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_afc0268cd0604a5691de98154ce48330~mv2.png"
  },
  {
    name: "AquaCacteen - Opuntia Ficus-Indica Stem Extract",
    category: "Cactus Extracts",
    mainFunctions: [
      "Rich in vitamins and minerals",
      "Vitamins A, B1, B2, B3, C",
      "Potassium, calcium, magnesium"
    ],
    benefits: [
      "Soothes and calms irritated skin",
      "Prolonged moisturizing effect",
      "Protects and firms skin",
      "Anti-oxidant effect"
    ],
    concentration: "1-3%",
    notes: "Cactus extract rich in essential vitamins and minerals for comprehensive skin protection and moisturization.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_4dbd855c537847968407c4b64619e022~mv2.png"
  },

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
    notes: "Oil-soluble antioxidant that works synergistically with vitamin C in REGIMA formulations. Helps stabilize products and extend shelf life.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_00d4f145e135495a8d74e73b565b2714~mv2.png"
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
    notes: "Larger molecule than glycolic acid, providing gentler exfoliation. Also functions as a humectant. Ideal for sensitive skin types in REGIMA sensitive skin protocols.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_0d03193c62734cc7a0e0f083d3728a1c~mv2.png"
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
    notes: "REGIMA uses multi-molecular weight hyaluronic acid complexes for penetration at different skin levels. Can hold up to 1000x its weight in water.",
    imageUrl: "https://static.wixstatic.com/media/8c20ed_2be27f03dc3e4856979291d316aab158~mv2.png"
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
  
  // Additional ingredients from your existing catalog would continue here...
  // Retinoids, Calming & Soothing, Plant Oils, Specialty Ingredients, etc.
  
  {
    name: "Retinol",
    category: "Vitamin A Derivative",
    mainFunctions: [
      "Accelerates cell turnover",
      "Stimulates collagen production",
      "Normalizes keratinization"
    ],
    benefits: [
      "Reduces fine lines and wrinkles",
      "Improves skin texture",
      "Minimizes pore appearance"
    ],
    concentration: "0.1-1%",
    notes: "Gold standard anti-aging ingredient. REGIMA uses encapsulated retinol for enhanced stability and reduced irritation in professional treatments."
  },
  {
    name: "Bakuchiol",
    category: "Natural Retinol Alternative",
    mainFunctions: [
      "Stimulates collagen production",
      "Antioxidant protection",
      "Anti-inflammatory action"
    ],
    benefits: [
      "Reduces signs of aging",
      "Suitable for sensitive skin",
      "Safe for pregnancy"
    ],
    concentration: "0.5-2%",
    notes: "Plant-based alternative to retinol derived from Psoralea corylifolia. REGIMA uses this in sensitive skin anti-aging formulations."
  },
  {
    name: "Ceramides",
    category: "Barrier Repair",
    mainFunctions: [
      "Strengthens skin barrier",
      "Prevents moisture loss",
      "Maintains lipid bilayer"
    ],
    benefits: [
      "Improves skin hydration",
      "Reduces sensitivity",
      "Repairs damaged barrier"
    ],
    concentration: "1-5%",
    notes: "Essential lipids that make up 50% of the skin's barrier. REGIMA uses a complex of ceramides 1, 3, and 6-II for optimal barrier repair."
  },
  {
    name: "Azelaic Acid",
    category: "Multi-Functional Acid",
    mainFunctions: [
      "Anti-inflammatory",
      "Antimicrobial",
      "Comedolytic action"
    ],
    benefits: [
      "Reduces acne and rosacea",
      "Brightens skin tone",
      "Minimizes pore appearance"
    ],
    concentration: "10-20%",
    notes: "Naturally occurring dicarboxylic acid with multiple benefits. REGIMA incorporates this in acne and rosacea treatment protocols."
  },
  {
    name: "Mandelic Acid",
    category: "Alpha Hydroxy Acid (AHA)",
    mainFunctions: [
      "Gentle exfoliation",
      "Antimicrobial properties",
      "Melanin dispersion"
    ],
    benefits: [
      "Suitable for sensitive skin",
      "Reduces hyperpigmentation",
      "Improves skin texture"
    ],
    concentration: "5-25%",
    notes: "Derived from bitter almonds, has the largest molecular size among AHAs. REGIMA uses this for gentle professional peels and sensitive skin protocols."
  },
  {
    name: "Zinc Oxide",
    category: "Mineral Sunscreen",
    mainFunctions: [
      "Broad-spectrum UV protection",
      "Anti-inflammatory",
      "Wound healing support"
    ],
    benefits: [
      "Physical sun protection",
      "Soothes irritated skin",
      "Non-comedogenic"
    ],
    concentration: "10-25%",
    notes: "Mineral UV filter that provides immediate protection. REGIMA uses micronized zinc oxide in daily protection formulations for all skin types."
  },
  {
    name: "Peptide Complex",
    category: "Anti-Aging Peptides",
    mainFunctions: [
      "Multi-target aging approach",
      "Collagen stimulation",
      "Cellular communication"
    ],
    benefits: [
      "Comprehensive anti-aging benefits",
      "Improved skin firmness",
      "Enhanced skin renewal"
    ],
    concentration: "3-8%",
    notes: "REGIMA's proprietary blend of signal peptides, carrier peptides, and neurotransmitter-affecting peptides for comprehensive anti-aging results."
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
