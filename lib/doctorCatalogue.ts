export const DoctorCatalog = {
  specialties: {
    id: "specialties",
    label: "SPECIALTIES (DOCTOR PROFILE ONBOARDING)",
    items: [
      "Aesthetic doctor",
      "Plastic surgeon",
      "Reconstructive surgeon",
      "Dermatologist",
      "General practitioner",
      "Ophthalmologist",
      "Oculoplastic surgeon",
      "Dentist",
      "Maxillofacial surgeon",
      "ENT surgeon",
      "Orthodontist",
      "Longevity medicine doctor",
      "Nutritionist",
      "Hair transplant surgeon",
      "Other specialty",
    ],
  },

  categories: [
    {
      category: "NON-SURGICAL FACE",
      subcategories: [
        {
          subcategory: "Hyaluronic Acid Fillers",
          procedures: [
            { name: "Forehead Filler", id: "forehead_filler" },
            { name: "Temple Filler", id: "temple_filler" },
            { name: "Brow Filler", id: "brow_filler" },
            { name: "Tear Trough Filler", id: "tear_trough_filler" },
            { name: "Cheek Filler", id: "cheek_filler" },
            { name: "Midface Volumization", id: "midface_volumization" },
            { name: "Non-Surgical Rhinoplasty (Nose Filler)", id: "nose_filler" },
            { name: "Lip Filler", id: "lip_filler" },
            { name: "Perioral Lines Filler", id: "perioral_lines_filler" },
            { name: "Nasolabial Fold Filler", id: "nasolabial_fold_filler" },
            { name: "Marionette Lines Filler", id: "marionette_lines_filler" },
            { name: "Chin Filler", id: "chin_filler" },
            { name: "Jawline Filler", id: "jawline_filler" },
            { name: "Hyaluronic Acid Filler (General)", id: "ha_filler" },
            { name: "Hyaluronidase", id: "hyaluronidase" }
          ]
        },
        {
          subcategory: "Biostimulators & Skin Quality Injections",
          procedures: [
            { name: "Biostimulators / Collagen Stimulators", id: "biostimulators" },
            { name: "CaHA (Calcium Hydroxylapatite)", id: "caha" },
            { name: "PLLA (Poly-L-Lactic Acid)", id: "plla" },
            { name: "PCL (Polycaprolactone)", id: "pcl" },
            { name: "Skin Boosters", id: "skin_boosters" },
            { name: "Mesotherapy", id: "mesotherapy" },
            { name: "Polynucleotides / PDRN (Salmon DNA)", id: "polynucleotides" },
            { name: "Peptides", id: "peptides" },
            { name: "PRP Facial", id: "prp_facial" },
            { name: "PRF / PRP", id: "prf_prp" },
            { name: "Exosome Therapy", id: "exosome" }
          ]
        },
        {
          subcategory: "Botulinum Toxin",
          procedures: [
            { name: "Botulinum Toxin", id: "botulinum_toxin" },
            { name: "Lip Flip", id: "lip_flip" },
            { name: "Nose Botox", id: "nose_botox" },
            { name: "Masseter Botox", id: "masseter_botox" }
          ]
        },
        {
          subcategory: "Thread Lifting",
          procedures: [
            { name: "Thread Lifting (General)", id: "thread_lifting" },
            { name: "PDO Lifting Threads", id: "pdo_threads" },
            { name: "Permanent Threads", id: "permanent_threads" },
            { name: "Temporary Threads", id: "temporary_threads" }
          ]
        },
        {
          subcategory: "Radiofrequency & HIFU",
          procedures: [
            { name: "Microneedling Radiofrequency", id: "rf_microneedling" },
            { name: "Radiofrequency (Without Needles)", id: "rf_no_needles" },
            { name: "Topical RF", id: "topical_rf" },
            { name: "HIFU", id: "hifu" },
            { name: "Sofwave", id: "sofwave" },
            { name: "Ultrasound", id: "ultrasound" }
          ]
        },
        {
          subcategory: "Lasers & Light Devices",
          procedures: [
            { name: "Fractional Laser (Non-Ablative)", id: "fractional_laser_nonablative" },
            { name: "Fractional Laser (Ablative)", id: "fractional_laser_ablative" },
            { name: "CO2 Laser", id: "co2_laser" },
            { name: "Nd:YAG Laser", id: "nd_yag" },
            { name: "IPL (Intense Pulsed Light)", id: "ipl" },
            { name: "BroadBand Light (BBL)", id: "bbl" },
            { name: "Photorejuvenation", id: "photorejuvenation" },
            { name: "Picosecond Laser", id: "picosecond_laser" },
            { name: "LED Therapy", id: "led_therapy" }
          ]
        },
        {
          subcategory: "Peeling, Needling & Skin Resurfacing",
          procedures: [
            { name: "BioRePeel", id: "biorepeel" },
            { name: "Chemical Peel (Superficial)", id: "chemical_peel_superficial" },
            { name: "Chemical Peel (Medium)", id: "chemical_peel_medium" },
            { name: "Microdermabrasion", id: "microdermabrasion" },
            { name: "Microneedling", id: "microneedling" },
            { name: "HydraFacial", id: "hydrafacial" }
          ]
        },
        {
          subcategory: "Skin Diagnosis",
          procedures: [
            { name: "Skin Analysis / VISIA", id: "skin_analysis" }
          ]
        }
      ]
    },
    {
      category: "NON-SURGICAL BODY",
      subcategories: [
        {
          subcategory: "Fat Reduction & Body Contouring",
          procedures: [
            { name: "Non-Surgical BBL / Liquid BBL", id: "nonsurgical_bbl" },
            { name: "Sculptra Buttocks", id: "sculptra_buttocks" },
            { name: "Lipolytic Injection — Double Chin", id: "lipolytic_double_chin" },
            { name: "Cryolipolysis", id: "cryolipolysis" },
            { name: "Lipolysis (Body)", id: "body_lipolysis" },
            { name: "Endolift", id: "endolift" },
            { name: "Microneedling Radiofrequency (Body)", id: "body_rf_microneedling" }
          ]
        },
        {
          subcategory: "Weight Management & Nutrition",
          procedures: [
            { name: "Weight Loss Medication", id: "weight_loss_medication" },
            { name: "Weight Loss Consultation", id: "weight_loss_consultation" },
            { name: "Diet Consultation", id: "diet_consultation" },
            { name: "Body Composition Analysis", id: "body_composition_analysis" },
            { name: "Nutrition Program", id: "nutrition_program" }
          ]
        }
      ]
    },
    {
      category: "AESTHETIC DENTISTRY",
      subcategories: [
        {
          subcategory: "Veneers & Restoration",
          procedures: [
            { name: "Composite / Bonding", id: "composite_bonding" },
            { name: "Ceramic Veneers", id: "ceramic_veneers" },
            { name: "Whitening Veneers", id: "whitening_veneers" },
            { name: "Crowns", id: "crowns" }
          ]
        },
        {
          subcategory: "Whitening",
          procedures: [
            { name: "Whitening Treatment", id: "whitening_treatment" }
          ]
        },
        {
          subcategory: "Gum & Shape",
          procedures: [
            { name: "Gingival Contouring", id: "gingival_contouring" },
            { name: "Tooth Reshaping", id: "tooth_reshaping" },
            { name: "Diastema Closure", id: "diastema_closure" }
          ]
        }
      ]
    },
    {
      category: "HAIR MEDICINE",
      subcategories: [
        {
          subcategory: "Non-Surgical Hair Treatments",
          procedures: [
            { name: "PRP for Hair", id: "prp_hair" },
            { name: "Hair Mesotherapy", id: "hair_mesotherapy" },
            { name: "HydraFacial Scalp", id: "hydrafacial_scalp" },
            { name: "Hair Bleaching", id: "hair_bleaching" }
          ]
        },
        {
          subcategory: "Surgical Hair Procedures",
          procedures: [
            { name: "Forehead Reduction", id: "forehead_reduction" },
            { name: "Hairline Lowering", id: "hairline_lowering" },
            { name: "Hair Transplantation", id: "hair_transplantation" }
          ]
        }
      ]
    },
    {
      category: "MUSCLE TONE & EMS",
      subcategories: [
        {
          subcategory: "Face",
          procedures: [
            { name: "Facial Muscle Stimulation / EM Sculpt (Face)", id: "facial_ems" }
          ]
        },
        {
          subcategory: "Body",
          procedures: [
            { name: "EM Sculpt (Body)", id: "body_emsculpt" },
            { name: "Sport Coaching with EMS", id: "sport_coaching_ems" }
          ]
        }
      ]
    },
    {
      category: "IV THERAPY",
      subcategories: [
        {
          subcategory: "General & Hydration",
          procedures: [
            { name: "IV Therapy (General)", id: "iv_therapy" },
            { name: "IV Hydration", id: "iv_hydration" },
            { name: "IV Custom / Bespoke Drip", id: "iv_custom" }
          ]
        },
        {
          subcategory: "Vitamins & Antioxidants",
          procedures: [
            { name: "IV High-Dose Vitamin C", id: "iv_vitamin_c" },
            { name: "IV Glutathione", id: "iv_glutathione" },
            { name: "IV Myers' Cocktail", id: "iv_myers_cocktail" },
            { name: "IV Amino Acids", id: "iv_amino_acids" },
            { name: "IV Magnesium", id: "iv_magnesium" },
            { name: "IV Iron Infusion", id: "iv_iron" }
          ]
        },
        {
          subcategory: "Energy, Performance & Recovery",
          procedures: [
            { name: "IV Energy Boost", id: "iv_energy_boost" },
            { name: "IV Post-Workout Recovery", id: "iv_post_workout" },
            { name: "IV Hangover Recovery", id: "iv_hangover" },
            { name: "IV Anti-Stress / Relaxation", id: "iv_anti_stress" },
            { name: "IV NAD+", id: "iv_nad_plus" }
          ]
        },
        {
          subcategory: "Wellness & Beauty",
          procedures: [
            { name: "IV Skin Glow & Anti-Aging", id: "iv_skin_glow" },
            { name: "IV Immunity Boost", id: "iv_immunity_boost" },
            { name: "IV Weight Management / Fat Burn", id: "iv_weight_management" },
            { name: "IV Hair Growth", id: "iv_hair_growth" },
            { name: "IV Detox", id: "iv_detox" }
          ]
        }
      ]
    },
    {
      category: "WELLNESS & DRAINAGE",
      subcategories: [
        {
          subcategory: "Drainage & Circulation",
          procedures: [
            { name: "Lymphatic Drainage", id: "lymphatic_drainage" },
            { name: "Lymphatic Drainage (Legs)", id: "lymphatic_drainage_legs" },
            { name: "Sclerotherapy", id: "sclerotherapy" }
          ]
        },
        {
          subcategory: "Recovery & Relaxation",
          procedures: [
            { name: "Infrared Sauna", id: "infrared_sauna" },
            { name: "Wellness Analysis", id: "wellness_analysis" }
          ]
        }
      ]
    },
    {
      category: "SURGICAL FACE",
      subcategories: [
        {
          subcategory: "Facelifts & Lifting",
          procedures: [
            { name: "Mini Facelift", id: "mini_facelift" },
            { name: "Midface Lift", id: "midface_lift" },
            { name: "Facelift", id: "facelift" },
            { name: "Temporal Lift", id: "temporal_lift" },
            { name: "Ponytail Lift", id: "ponytail_lift" },
            { name: "Neck Lift", id: "neck_lift" },
            { name: "Lower Face & Neck Skin Tightening", id: "lower_face_neck_tightening" }
          ]
        },
        {
          subcategory: "Eyes & Brows",
          procedures: [
            { name: "Canthopexy / Cat Eye Surgery", id: "canthopexy" },
            { name: "Brow Lift", id: "brow_lift" },
            { name: "Upper Blepharoplasty", id: "upper_blepharoplasty" },
            { name: "Lower Blepharoplasty", id: "lower_blepharoplasty" }
          ]
        },
        {
          subcategory: "Nose",
          procedures: [
            { name: "Rhinoplasty", id: "rhinoplasty" },
            { name: "Ultrasonic Rhinoplasty", id: "ultrasonic_rhinoplasty" },
            { name: "Revision Rhinoplasty", id: "revision_rhinoplasty" }
          ]
        },
        {
          subcategory: "Face Contouring & Features",
          procedures: [
            { name: "Genioplasty", id: "genioplasty" },
            { name: "Otoplasty", id: "otoplasty" },
            { name: "Lip Lift / Bullhorn Lip Lift", id: "lip_lift" },
            { name: "Buccal Fat Removal / Bichectomy", id: "buccal_fat_removal" },
            { name: "Facial Feminization Surgery", id: "facial_feminization" }
          ]
        },
        {
          subcategory: "Lipofilling & Fat Transfer",
          procedures: [
            { name: "Facial Lipofilling (Tear Trough)", id: "lipofilling_tear_trough" },
            { name: "Facial Lipofilling (Lips)", id: "lipofilling_lips" },
            { name: "Facial Lipofilling (Cheeks)", id: "lipofilling_cheeks" }
          ]
        }
      ]
    },
    {
      category: "SURGICAL BODY",
      subcategories: [
        {
          subcategory: "Liposuction",
          procedures: [
            { name: "Liposuction (Abdomen)", id: "lipo_abdomen" },
            { name: "Liposuction (Arms)", id: "lipo_arms" },
            { name: "Liposuction (Thighs)", id: "lipo_thighs" },
            { name: "Liposuction (Neck)", id: "lipo_neck" },
            { name: "Liposuction (Knees / Other)", id: "lipo_knees" },
            { name: "Liposuction (Genitals)", id: "lipo_genitals" },
            { name: "Liposuction (Buttocks)", id: "lipo_buttocks" },
            { name: "Liposuction for Lipedema", id: "lipo_lipedema" },
            { name: "Abdominal Liposculpture", id: "liposculpture_abdomen" }
          ]
        },
        {
          subcategory: "Body Contouring & Lifting",
          procedures: [
            { name: "Body Lift", id: "body_lift" },
            { name: "Arm Lift (Brachioplasty)", id: "arm_lift" },
            { name: "Thigh Lift", id: "thigh_lift" },
            { name: "Abdominoplasty / Tummy Tuck", id: "abdominoplasty" },
            { name: "Rib Remodeling / Rib Removal", id: "rib_remodeling" }
          ]
        },
        {
          subcategory: "Buttocks",
          procedures: [
            { name: "Brazilian Butt Lift (BBL)", id: "bbl_surgical" },
            { name: "Buttocks Augmentation", id: "buttocks_augmentation" }
          ]
        },
        {
          subcategory: "Breast Surgery",
          procedures: [
            { name: "Breast Augmentation", id: "breast_augmentation" },
            { name: "Breast Augmentation (Lipofilling)", id: "breast_augmentation_lipofilling" },
            { name: "Breast Reduction", id: "breast_reduction" },
            { name: "Breast Implant Replacement", id: "breast_implant_replacement" },
            { name: "Breast Implant Removal", id: "breast_implant_removal" },
            { name: "Breast Lifting / Mastopexy", id: "mastopexy" },
            { name: "Inverted Nipple Correction", id: "nipple_correction" },
            { name: "Breast Reconstruction", id: "breast_reconstruction" },
            { name: "Correction of Breast Asymmetry", id: "breast_asymmetry" }
          ]
        },
        {
          subcategory: "Intimate & Genital Surgery",
          procedures: [
            { name: "Penis Enlargement", id: "penis_enlargement" },
            { name: "Penoplasty", id: "penoplasty" },
            { name: "Circumcision", id: "circumcision" },
            { name: "G-Spot Augmentation", id: "g_spot_augmentation" },
            { name: "Hymenoplasty", id: "hymenoplasty" },
            { name: "Mons Pubis Liposuction", id: "mons_pubis_liposuction" },
            { name: "Labiaplasty / Nymphoplasty", id: "labiaplasty" },
            { name: "Vaginoplasty", id: "vaginoplasty" },
            { name: "Perineoplasty", id: "perineoplasty" }
          ]
        },
        {
          subcategory: "Foot Surgery",
          procedures: [
            { name: "Forefoot Aesthetic Surgery", id: "forefoot_surgery" },
            { name: "Hallux Valgus Surgery", id: "hallux_valgus" },
            { name: "Hammer Toe Surgery", id: "hammer_toe" }
          ]
        }
      ]
    },
    {
      category: "LONGEVITY MEDICINE",
      subcategories: [
        {
          subcategory: "Biological Assessment & Diagnostics",
          procedures: [
            { name: "Biological Age Assessment", id: "biological_age_assessment" },
            { name: "Epigenetic Clock Test (DNA Methylation)", id: "epigenetic_clock_test" },
            { name: "Telomere Length Testing", id: "telomere_length_test" },
            { name: "Comprehensive Longevity Blood Panel", id: "comprehensive_blood_panel" },
            { name: "Gut Microbiome Analysis", id: "microbiome_analysis" },
            { name: "Continuous Glucose Monitoring (CGM)", id: "continuous_glucose_monitoring" },
            { name: "VO2 Max & Cardiovascular Fitness Assessment", id: "vo2max_cardio_assessment" },
            { name: "DEXA Body Composition Scan", id: "dexa_body_composition" }
          ]
        },
        {
          subcategory: "Cellular & Regenerative Therapies",
          procedures: [
            { name: "NAD+ IV Infusion", id: "nad_plus_iv" },
            { name: "NAD+ Precursors (NMN / NR) — Oral", id: "nad_plus_oral" },
            { name: "IV High-Dose Vitamin C (Longevity)", id: "iv_high_dose_vit_c_longevity" },
            { name: "Glutathione IV Therapy", id: "glutathione_therapy" },
            { name: "Exosome IV Therapy", id: "exosome_iv" },
            { name: "Regenerative PRP (Joints / Systemic)", id: "prp_regenerative" },
            { name: "Stem Cell Therapy (Mesenchymal)", id: "stem_cell_therapy" },
            { name: "Plasmapheresis / Plasma Exchange", id: "plasmapheresis" }
          ]
        },
        {
          subcategory: "Physical & Energy Therapies",
          procedures: [
            { name: "Hyperbaric Oxygen Therapy (HBOT)", id: "hyperbaric_oxygen" },
            { name: "Ozone Therapy (Major Autohemotherapy)", id: "ozone_therapy" },
            { name: "Photobiomodulation (Red Light / NIR)", id: "photobiomodulation" },
            { name: "Whole-Body Cryotherapy", id: "cryo_whole_body" }
          ]
        },
        {
          subcategory: "Pharmacological Protocols",
          procedures: [
            { name: "Metformin — Longevity Protocol", id: "metformin_longevity" },
            { name: "Low-Dose Rapamycin — Longevity Protocol", id: "rapamycin_longevity" },
            { name: "GLP-1 Agonist — Metabolic Longevity", id: "glp1_longevity" },
            { name: "Hormone Optimization Therapy (HRT/TRT)", id: "hormone_optimization" },
            { name: "Thyroid Optimization", id: "thyroid_optimization" },
            { name: "Senolytic Protocol (Dasatinib+Quercetin)", id: "senolytic_protocol" }
          ]
        },
        {
          subcategory: "Programs & Lifestyle",
          procedures: [
            { name: "Medically Supervised Fasting / FMD", id: "fasting_program" },
            { name: "Personalized Longevity Program", id: "personalized_longevity_program" },
            { name: "Longevity Consultation", id: "longevity_consultation" }
          ]
        }
      ]
    }
  ]
} as const;