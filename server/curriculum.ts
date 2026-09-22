import type { IStorage } from "./storage";

type LessonSeed = {
  moduleOrder: number;
  title: string;
  description: string;
  content: string;
  steps: { title: string; description: string }[];
  questions: {
    id: string;
    question: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
  }[];
};

const MODULES = [
  {
    title: "Skin Anatomy & Physiology",
    description:
      "Essential knowledge of skin structure, functions, and the science behind REGIMA treatments",
    estimatedTime: "45 minutes",
    order: 1,
  },
  {
    title: "Skin Types & Conditions",
    description:
      "Learn to identify different skin types, common conditions, and appropriate REGIMA solutions",
    estimatedTime: "60 minutes",
    order: 2,
  },
  {
    title: "Professional Skincare Analysis",
    description: "Advanced techniques for skin assessment using REGIMA diagnostic protocols",
    estimatedTime: "60 minutes",
    order: 3,
  },
  {
    title: "Skincare Ingredients & Formulations",
    description:
      "Comprehensive study of active ingredients, their functions, benefits, and application in REGIMA products",
    estimatedTime: "90 minutes",
    order: 4,
  },
  {
    title: "Cleansing & Preparation Techniques",
    description: "Master the REGIMA cleansing protocols for optimal treatment preparation",
    estimatedTime: "45 minutes",
    order: 5,
  },
  {
    title: "Exfoliation Methods",
    description:
      "Chemical, enzymatic, and mechanical exfoliation techniques using REGIMA professional products",
    estimatedTime: "60 minutes",
    order: 6,
  },
  {
    title: "Extraction & Clarifying Procedures",
    description: "Safe and effective extraction techniques for congested skin conditions",
    estimatedTime: "45 minutes",
    order: 7,
  },
  {
    title: "Facial Massage & Lymphatic Drainage",
    description:
      "REGIMA signature massage techniques for enhanced product penetration and detoxification",
    estimatedTime: "60 minutes",
    order: 8,
  },
  {
    title: "Treatment Masking Protocols",
    description: "Application techniques and timing for REGIMA's professional treatment masks",
    estimatedTime: "45 minutes",
    order: 9,
  },
  {
    title: "Advanced Anti-Aging Treatments",
    description:
      "Specialized REGIMA protocols for addressing fine lines, wrinkles, and loss of firmness",
    estimatedTime: "60 minutes",
    order: 10,
  },
  {
    title: "Acne & Problematic Skin Solutions",
    description:
      "Targeted treatment protocols for managing acne, congestion, and oily skin conditions",
    estimatedTime: "60 minutes",
    order: 11,
  },
  {
    title: "Hyperpigmentation & Brightening",
    description:
      "REGIMA approaches to treating hyperpigmentation, uneven skin tone, and sun damage",
    estimatedTime: "60 minutes",
    order: 12,
  },
  {
    title: "Sensitive & Reactive Skin Management",
    description:
      "Gentle yet effective protocols for sensitive, reactive, and compromised skin barriers",
    estimatedTime: "45 minutes",
    order: 13,
  },
  {
    title: "Client Consultation & Treatment Planning",
    description:
      "Professional consultation skills and creating customized REGIMA treatment plans",
    estimatedTime: "60 minutes",
    order: 14,
  },
  {
    title: "Home Care Recommendations",
    description: "Guidelines for prescribing effective home care regimens with REGIMA retail products",
    estimatedTime: "45 minutes",
    order: 15,
  },
  {
    title: "REGIMA Business Implementation",
    description:
      "Strategies for successfully integrating REGIMA treatments into your skincare business",
    estimatedTime: "60 minutes",
    order: 16,
  },
];

function protocolLesson(
  moduleOrder: number,
  title: string,
  description: string,
  content: string,
  focus: string
): LessonSeed {
  return {
    moduleOrder,
    title,
    description,
    content,
    steps: [
      {
        title: "Assess",
        description: `Screen contraindications and record the client email before ${focus}.`,
      },
      {
        title: "Treat",
        description: `Apply the REGIMA protocol for ${focus}. Do not invent a paid receipt.`,
      },
      {
        title: "Record",
        description:
          "Save notes against the canonical SkinTwin email so suite commission and clinic CRM stay aligned.",
      },
    ],
    questions: [
      {
        id: `m${moduleOrder}q1`,
        question: `What must be completed before starting ${title}?`,
        options: [
          { id: `m${moduleOrder}q1_a`, text: "A social media post" },
          {
            id: `m${moduleOrder}q1_b`,
            text: "Contraindication screen and client identity",
          },
          { id: `m${moduleOrder}q1_c`, text: "A restaurant menu" },
          { id: `m${moduleOrder}q1_d`, text: "A fake APT- receipt" },
        ],
        correctOptionId: `m${moduleOrder}q1_b`,
      },
      {
        id: `m${moduleOrder}q2`,
        question: "Where do SkinTwin notes attach after the protocol?",
        options: [
          { id: `m${moduleOrder}q2_a`, text: "A random room number" },
          { id: `m${moduleOrder}q2_b`, text: "The therapist's personal phone" },
          { id: `m${moduleOrder}q2_c`, text: "The client's canonical email" },
          { id: `m${moduleOrder}q2_d`, text: "A paper till slip only" },
        ],
        correctOptionId: `m${moduleOrder}q2_c`,
      },
    ],
  };
}

const FEATURED_LESSONS: LessonSeed[] = [
  {
    moduleOrder: 1,
    title: "Layers of the Skin",
    description: "Identify epidermis, dermis, and hypodermis and how REGIMA actives reach each layer.",
    content:
      "SkinTwin therapists must name the layers they treat. The epidermis is the barrier, the dermis holds collagen and vessels, and the hypodermis cushions. REGIMA serums are mapped to these layers so a facial is a clinical protocol, not a menu item.",
    steps: [
      {
        title: "Epidermis",
        description: "Name the barrier layer and why over-exfoliation breaks it.",
      },
      {
        title: "Dermis",
        description: "Connect collagen, elastin, and vascular supply to anti-aging claims.",
      },
      {
        title: "Treatment map",
        description: "Assign one REGIMA product to each layer before a consultation.",
      },
    ],
    questions: [
      {
        id: "a1",
        question: "Which layer is the primary skin barrier?",
        options: [
          { id: "a1_a", text: "Hypodermis" },
          { id: "a1_b", text: "Epidermis" },
          { id: "a1_c", text: "Muscle fascia" },
          { id: "a1_d", text: "Nail bed" },
        ],
        correctOptionId: "a1_b",
      },
      {
        id: "a2",
        question: "Collagen and elastin live primarily in the:",
        options: [
          { id: "a2_a", text: "Dermis" },
          { id: "a2_b", text: "Stratum corneum only" },
          { id: "a2_c", text: "Hair shaft" },
          { id: "a2_d", text: "Sebum film" },
        ],
        correctOptionId: "a2_a",
      },
    ],
  },
  {
    moduleOrder: 2,
    title: "Fitzpatrick and Treatment Choice",
    description: "Match skin type and condition to a safe first REGIMA protocol.",
    content:
      "A complete platform therapist records skin type before booking. Fitzpatrick scale, oil/dry balance, and active conditions decide whether the next step is a consult, a peel, or a home-care only plan.",
    steps: [
      {
        title: "Observe",
        description: "Record Fitzpatrick type and current barrier state.",
      },
      {
        title: "Contraindications",
        description: "Flag active infection, isotretinoin, and sunburn before any peel.",
      },
      {
        title: "Prescribe",
        description: "Choose a REGIMA starter protocol and a 4-week review.",
      },
    ],
    questions: [
      {
        id: "t1",
        question: "What must be recorded before a first chemical peel?",
        options: [
          { id: "t1_a", text: "Favorite scent" },
          { id: "t1_b", text: "Fitzpatrick type and contraindications" },
          { id: "t1_c", text: "Instagram handle" },
          { id: "t1_d", text: "Shoe size" },
        ],
        correctOptionId: "t1_b",
      },
    ],
  },
  {
    moduleOrder: 8,
    title: "Lymphatic Drainage Massage",
    description:
      "This lesson covers advanced techniques for facial lymphatic drainage massage, a core component of REGIMA's signature facial treatments.",
    content:
      "Lymphatic drainage massage is an essential technique in advanced skincare, targeting the lymphatic system to reduce puffiness and detoxify the skin. REGIMA's approach combines traditional methods with proprietary movements for optimal results.",
    steps: [
      {
        title: "Preparation",
        description:
          "Apply REGIMA Lymphatic Boost Oil to clean skin. Use 2-3 pumps and warm between palms before application.",
      },
      {
        title: "Initial Clearing",
        description:
          "Begin at the suboccipital release points behind the ears, using gentle stationary circles to open drainage pathways.",
      },
      {
        title: "Cheek Drainage",
        description:
          "Use gentle sweeping motions starting from the center of the face, moving outward toward the lymph nodes. Repeat 3-5 times on each side.",
      },
      {
        title: "REGIMA Signature Technique",
        description:
          'Apply the proprietary "butterfly flutter" technique along the zygomatic arch, using fingertips in a rapid, light-pressure pattern.',
      },
      {
        title: "Under-eye Drainage",
        description:
          "Use ring fingers only with extremely light pressure. Start at inner corner and sweep outward, repeating 5 times.",
      },
      {
        title: "Completion",
        description: "Finish with gentle pressure at the supraclavicular nodes to complete the drainage pathway.",
      },
    ],
    questions: [
      {
        id: "q1",
        question: "Which of the following best describes the proper pressure for facial lymphatic drainage?",
        options: [
          { id: "q1_a", text: "Firm pressure to stimulate circulation" },
          { id: "q1_b", text: "Medium pressure with occasional deep movements" },
          { id: "q1_c", text: "Very light pressure that barely moves the skin" },
          { id: "q1_d", text: "Variable pressure depending on the facial area" },
        ],
        correctOptionId: "q1_c",
      },
      {
        id: "q2",
        question: "Which movement direction is correct for facial lymphatic drainage?",
        options: [
          { id: "q2_a", text: "From the center of the face outward toward lymph nodes" },
          { id: "q2_b", text: "From the outside of the face toward the nose" },
          { id: "q2_c", text: "In circular motions all over the face" },
          { id: "q2_d", text: "From top to bottom in straight lines" },
        ],
        correctOptionId: "q2_a",
      },
      {
        id: "q3",
        question: "Which of these is a contraindication for lymphatic drainage massage?",
        options: [
          { id: "q3_a", text: "Dehydrated skin" },
          { id: "q3_b", text: "Mature skin" },
          { id: "q3_c", text: "Active skin infection" },
          { id: "q3_d", text: "Uneven skin tone" },
        ],
        correctOptionId: "q3_c",
      },
    ],
  },
  {
    moduleOrder: 14,
    title: "Consultation to Booking",
    description: "Turn a consult into a SkinTwin booking, LMS cert, and suite commission tier.",
    content:
      "Platform-complete therapists close the loop: consult notes become a client record, a booked treatment, and a certification event the suite can apply to commission policy.",
    steps: [
      {
        title: "Capture identity",
        description: "Save the client email as the canonical SkinTwin identity.",
      },
      {
        title: "Plan",
        description: "Select services and a review date. Do not invent a paid receipt.",
      },
      {
        title: "Certify",
        description: "When the module is complete, emit a certification to Regima Suite.",
      },
    ],
    questions: [
      {
        id: "c1",
        question: "What is the canonical SkinTwin identity across LMS, suite, and clinic?",
        options: [
          { id: "c1_a", text: "A random APT- booking id" },
          { id: "c1_b", text: "Normalized email address" },
          { id: "c1_c", text: "The salon room number" },
          { id: "c1_d", text: "Paystack customer CUS_soft6lhg8dhhjj6" },
        ],
        correctOptionId: "c1_b",
      },
    ],
  },
];

const featuredOrders = new Set(FEATURED_LESSONS.map((lesson) => lesson.moduleOrder));

const GENERATED_LESSONS: LessonSeed[] = MODULES.filter(
  (module) => !featuredOrders.has(module.order)
).map((module) =>
  protocolLesson(
    module.order,
    `${module.title} protocol`,
    module.description,
    `SkinTwin therapists complete ${module.title} before they treat. ${module.description} Record findings against the client email identity and never claim a booking is paid unless Stripe or Paystack reports paid.`,
    module.title.toLowerCase()
  )
);

const LESSONS: LessonSeed[] = [...FEATURED_LESSONS, ...GENERATED_LESSONS].sort(
  (left, right) => left.moduleOrder - right.moduleOrder
);

export async function ensureCurriculum(storage: IStorage) {
  let modules = await storage.getAllModules();
  if (modules.length === 0) {
    for (const moduleData of MODULES) {
      await storage.createModule(moduleData);
    }
    modules = await storage.getAllModules();
  }

  for (const seed of LESSONS) {
    const module = modules.find((item) => item.order === seed.moduleOrder);
    if (!module) continue;
    const existing = await storage.getLessonsByModuleId(module.id);
    if (existing.length > 0) continue;

    const lesson = await storage.createLesson({
      moduleId: module.id,
      title: seed.title,
      description: seed.description,
      content: seed.content,
      videoUrl: undefined,
      order: 1,
    });

    for (const [index, step] of seed.steps.entries()) {
      await storage.createStep({
        lessonId: lesson.id,
        title: step.title,
        description: step.description,
        order: index + 1,
      });
    }

    await storage.createQuiz({
      lessonId: lesson.id,
      questions: seed.questions,
    });
  }
}
