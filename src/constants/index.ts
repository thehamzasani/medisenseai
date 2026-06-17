export const ENGINE_DEFINITIONS = [
  {
    name: 'Neural Network',
    version: 'v5.0 DeepSense',
    accuracy: 99.2,
    icon: 'memory',
    falsePositiveRate: 0.12,
    reliabilityStars: 5,
    inferenceMs: 42,
    status: 'stable' as const,
    description: 'Multi-layer perceptron with deep pattern recognition and non-linear feature interactions',
  },
  {
    name: 'XGBoost',
    version: 'v4.1',
    accuracy: 97.8,
    icon: 'bolt',
    falsePositiveRate: 0.45,
    reliabilityStars: 4,
    inferenceMs: 12,
    status: 'stable' as const,
    description: 'Gradient boosted decision trees optimized for rapid iteration and high performance',
  },
  {
    name: 'LightGBM',
    version: 'v3.5',
    accuracy: 97.1,
    icon: 'speed',
    falsePositiveRate: 0.62,
    reliabilityStars: 4,
    inferenceMs: 8,
    status: 'stable' as const,
    description: 'Optimized for high speed and memory efficiency across large feature spaces',
  },
  {
    name: 'Random Forest',
    version: 'v4.2',
    accuracy: 96.4,
    icon: 'account_tree',
    falsePositiveRate: 0.81,
    reliabilityStars: 4,
    inferenceMs: 35,
    status: 'stable' as const,
    description: 'Ensemble learning method providing classification stability through tree aggregation',
  },
  {
    name: 'AdaBoost',
    version: 'v3.1',
    accuracy: 95.3,
    icon: 'auto_awesome',
    falsePositiveRate: 1.10,
    reliabilityStars: 4,
    inferenceMs: 28,
    status: 'stable' as const,
    description: 'Adaptive boosting to iteratively refine weak classification rules into strong predictors',
  },
  {
    name: 'SVM',
    version: 'v2.8',
    accuracy: 94.2,
    icon: 'grid_view',
    falsePositiveRate: 1.35,
    reliabilityStars: 4,
    inferenceMs: 55,
    status: 'stable' as const,
    description: 'Support Vector Machine for effective high-dimensional boundary mapping',
  },
  {
    name: 'Decision Tree',
    version: 'v3.0',
    accuracy: 92.9,
    icon: 'schema',
    falsePositiveRate: 1.82,
    reliabilityStars: 3,
    inferenceMs: 5,
    status: 'stable' as const,
    description: 'Hierarchical rule-based mapping optimized for explainability and transparency',
  },
  {
    name: 'KNN',
    version: 'v2.5',
    accuracy: 91.8,
    icon: 'groups',
    falsePositiveRate: 2.14,
    reliabilityStars: 3,
    inferenceMs: 18,
    status: 'stable' as const,
    description: 'K-Nearest Neighbors proximity classification for outlier detection with k=5',
  },
  {
    name: 'Logistic Regression',
    version: 'v1.9',
    accuracy: 89.5,
    icon: 'show_chart',
    falsePositiveRate: 2.91,
    reliabilityStars: 3,
    inferenceMs: 3,
    status: 'stable' as const,
    description: 'Baseline statistical model for binary outcome prediction using linear decision boundaries',
  },
  {
    name: 'Naive Bayes',
    version: 'v1.4',
    accuracy: 88.2,
    icon: 'functions',
    falsePositiveRate: 4.10,
    reliabilityStars: 2,
    inferenceMs: 2,
    status: 'deprecated' as const,
    description: 'Probabilistic classifier based on Bayes theorem — maintained for baseline comparison',
  },
] as const

// ─── Symptoms ─────────────────────────────────────────────────────────────────
export const SYMPTOMS = [
  { id: 'frequent_urination',  label: 'Frequent Urination',      icon: 'water_drop',      color: 'text-secondary' },
  { id: 'excessive_thirst',    label: 'Excessive Thirst',        icon: 'local_drink',     color: 'text-secondary' },
  { id: 'fatigue',             label: 'Fatigue',                 icon: 'bedtime',         color: 'text-secondary' },
  { id: 'blurred_vision',      label: 'Blurred Vision',          icon: 'visibility_off',  color: 'text-secondary' },
  { id: 'chest_pain',          label: 'Chest Pain',              icon: 'emergency_home',  color: 'text-error'     },
  { id: 'shortness_of_breath', label: 'Shortness of Breath',     icon: 'air',             color: 'text-error'     },
  { id: 'headache',            label: 'Headache',                icon: 'psychology_alt',  color: 'text-secondary' },
  { id: 'numbness',            label: 'Numbness / Tingling',     icon: 'touch_app',       color: 'text-secondary' },
  { id: 'slow_wound_healing',  label: 'Slow Wound Healing',      icon: 'healing',         color: 'text-secondary' },
  { id: 'weight_loss',         label: 'Unexplained Weight Loss', icon: 'monitor_weight',  color: 'text-error'     },
  { id: 'nausea',              label: 'Nausea',                  icon: 'sick',            color: 'text-secondary' },
] as const

// ─── Blood Type Options (User profile only — NOT part of Assessment) ──────────
export const BLOOD_TYPE_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

// ─── Risk Colors ──────────────────────────────────────────────────────────────
export const RISK_COLORS = {
  LOW:      { bg: 'bg-tertiary-fixed-dim/20', text: 'text-tertiary-fixed-dim', border: 'border-tertiary-fixed-dim/30' },
  MEDIUM:   { bg: 'bg-secondary/20',          text: 'text-secondary',          border: 'border-secondary/30'          },
  HIGH:     { bg: 'bg-error/20',              text: 'text-error',              border: 'border-error/30'              },
  CRITICAL: { bg: 'bg-error-container/40',    text: 'text-error',              border: 'border-error/50'              },
} as const

// ─── Urgency Config ───────────────────────────────────────────────────────────
export const URGENCY_CONFIG = {
  MONITOR: { label: 'Maintain healthy habits',           color: 'text-tertiary-fixed-dim', icon: 'check_circle' },
  WATCH:   { label: 'Monitor closely',                   color: 'text-secondary',          icon: 'visibility'   },
  SOON:    { label: 'Schedule checkup within 2–4 weeks', color: 'text-error',              icon: 'schedule'     },
  URGENT:  { label: 'See a doctor immediately',          color: 'text-error',              icon: 'emergency'    },
} as const

// ─── Nav Items ────────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { href: '/dashboard',       label: 'Dashboard',       icon: 'dashboard'      },
  { href: '/history',         label: 'History',         icon: 'history'        },
  { href: '/results',         label: 'AI Results',      icon: 'psychology'     },
  { href: '/engines',         label: 'Engine Results',  icon: 'biotech'        },
  { href: '/detection',       label: 'Early Detection', icon: 'radar'          },
  { href: '/trends',          label: 'Risk Trends',     icon: 'trending_up'    },
  { href: '/recommendations', label: 'Recommendation',  icon: 'clinical_notes' },
  { href: '/assessment/new',  label: 'New Assessment',  icon: 'add_circle'     },
]

// ─── Exercise Frequency Options ───────────────────────────────────────────────
export const EXERCISE_FREQUENCY_OPTIONS = [
  { value: 'none', label: 'None / Sedentary'   },
  { value: '1-2x', label: '1–2× per week'      },
  { value: '3-4x', label: '3–4× per week'      },
  { value: '5+x',  label: '5+ times per week'  },
] as const

// ─── Stress Level Options ─────────────────────────────────────────────────────
export const STRESS_LEVEL_OPTIONS = [
  { value: 'low',       label: 'Low',       description: 'Rarely stressed'       },
  { value: 'moderate',  label: 'Moderate',  description: 'Occasionally stressed' },
  { value: 'high',      label: 'High',      description: 'Frequently stressed'   },
  { value: 'very_high', label: 'Very High', description: 'Chronically stressed'  },
] as const

// ─── Sugar Intake Options ─────────────────────────────────────────────────────
export const SUGAR_INTAKE_OPTIONS = [
  { value: 'low',      label: 'Low',      description: '< 25g added sugar/day' },
  { value: 'moderate', label: 'Moderate', description: '25–50g/day'            },
  { value: 'high',     label: 'High',     description: '> 50g/day'             },
] as const