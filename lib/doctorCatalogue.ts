export const DoctorCatalog = {
"specialties": {
"id": "specialties",
"label": "SPECIALTIES (DOCTOR PROFILE ONBOARDING)",
"items": [
"aesthetic_doctor",
"plastic_surgeon",
"reconstructive_surgeon",
"dermatologist",
"general_practitioner",
"ophthalmologist",
"oculoplastic_surgeon",
"dentist",
"maxillofacial_surgeon",
"ent_surgeon",
"orthodontist",
"other_specialty"
],
"groups": [
{
"titleKey": "groups.aesthetic",
"items": [
{
"id": "aesthetic_doctor",
"labelKey": "items.aesthetic_doctor.label",
"descriptionKey": "items.aesthetic_doctor.description",
"icon": "aesthetic_doctor.svg"
},
{
"id": "dermatologist",
"labelKey": "items.dermatologist.label",
"descriptionKey": "items.dermatologist.description",
"icon": "dermatologist.svg"
}
]
},
{
"titleKey": "groups.surgery",
"items": [
{
"id": "plastic_surgeon",
"labelKey": "items.plastic_surgeon.label",
"descriptionKey": "items.plastic_surgeon.description",
"icon": "plastic_surgeon.svg"
},
{
"id": "maxillofacial_surgeon",
"labelKey": "items.maxillofacial_surgeon.label",
"descriptionKey": "items.maxillofacial_surgeon.description",
"icon": "maxillofacial_surgeon.svg"
},
{
"id": "ent_surgeon",
"labelKey": "items.ent_surgeon.label",
"descriptionKey": "items.ent_surgeon.description",
"icon": "ent_surgeon.svg"
},
{
"id": "reconstructive_surgeon",
"labelKey": "items.reconstructive_surgeon.label",
"descriptionKey": "items.reconstructive_surgeon.description",
"icon": "reconstructive_surgeon.svg"
}
]
},
{
"titleKey": "groups.associatedSpecialties",
"items": [
{
"id": "ophthalmologist",
"labelKey": "items.ophthalmologist.label",
"descriptionKey": "items.ophthalmologist.description",
"icon": "ophthalmologist.svg"
},
{
"id": "dentist",
"labelKey": "items.dentist.label",
"descriptionKey": "items.dentist.description",
"icon": "dentist.svg"
},
{
"id": "orthodontist",
"labelKey": "items.orthodontist.label",
"descriptionKey": "items.orthodontist.description",
"icon": "orthodontist.svg"
}
]
},
{
"titleKey": "groups.other",
"items": [
{
"id": "general_practitioner",
"labelKey": "items.general_practitioner.label",
"descriptionKey": "items.general_practitioner.description",
"icon": "general_practitioner.svg"
},
{
"id": "oculoplastic_surgeon",
"labelKey": "items.oculoplastic_surgeon.label",
"descriptionKey": "items.oculoplastic_surgeon.description",
"icon": "oculoplastic_surgeon.svg"
},
{
"id": "other_specialty",
"labelKey": "items.other_specialty.label",
"descriptionKey": "items.other_specialty.description",
"icon": "other_specialty.svg"
}
]
}
]
},
"categories": [
{
"key": "SURGICAL FACE",
"id": "surgical_face",
"slug": "surgical-face",
"href": "/categories/surgical-face",
"homeImage": "/images/home/categories/surgical-face.png",
"dashboardImage": "/images/dashboard/categories/surgical-face.svg",
"icon": "/images/home/categories/icons/surgical-face.svg",
"category": "surgical_face",
"subcategories": [
{
"subcategory": "facelifts_and_lifting",
"procedures": [
{
"name": "Mini Facelift",
"id": "mini_facelift"
},
{
"name": "Midface Lift",
"id": "midface_lift"
},
{
"name": "Facelift",
"id": "facelift"
},
{
"name": "Temporal Lift",
"id": "temporal_lift"
},
{
"name": "Neck Lift",
"id": "neck_lift"
},
{
"name": "FaceTite skin tightening",
"id": "facetite_rf"
},
{
"name": "Lower Face & Neck Skin Tightening",
"id": "lower_face_neck_tightening"
},
{
"id": "deep_plane_facelift",
"name": "Deep Plane Facelift"
}
]
},
{
"subcategory": "eyes_and_brows",
"procedures": [
{
"name": "Canthopexy / Cat Eye Surgery",
"id": "canthopexy"
},
{
"name": "Brow Lift",
"id": "brow_lift"
},
{
"name": "Upper Blepharoplasty",
"id": "upper_blepharoplasty"
},
{
"name": "Lower Blepharoplasty",
"id": "lower_blepharoplasty"
},
{
"id": "conservative_blepharoplasty",
"name": "Conservative blepharoplasty"
}
]
},
{
"subcategory": "nose",
"procedures": [
{
"name": "Rhinoplasty",
"id": "rhinoplasty"
},
{
"name": "Rhinoseptoplasty (nose deviation)",
"id": "rhinoseptoplasty"
},
{
"name": "Ultrasonic Rhinoplasty",
"id": "ultrasonic_rhinoplasty"
},
{
"name": "Revision Rhinoplasty",
"id": "revision_rhinoplasty"
},
{
"name": "Preservation Rhinoplasty",
"id": "preservation_rhinoplasty"
},
{
"name": "Ethnic / Wide Nose Rhinoplasty",
"id": "ethnic_rhinoplasty"
}
]
},
{
"subcategory": "face_contouring_and_features",
"procedures": [
{
"name": "Genioplasty",
"id": "genioplasty"
},
{
"name": "Otoplasty",
"id": "otoplasty"
},
{
"name": "Lip Lift / Bullhorn Lip Lift",
"id": "lip_lift"
},
{
"name": "Buccal Fat Removal / Bichectomy",
"id": "buccal_fat_removal"
},
{
"name": "Facial Feminization Surgery",
"id": "facial_feminization"
},
{
"name": "Orthognathic Surgery",
"id": "orthognathic_surgery"
}
]
},
{
"subcategory": "lipofilling_and_fat_transfer",
"procedures": [
{
"name": "Facial Lipofilling (Tear Trough)",
"id": "lipofilling_tear_trough"
},
{
"name": "Facial Lipofilling (face)",
"id": "lipofilling_face"
}
]
}
]
},
{
"key": "SURGICAL BODY",
"id": "surgical_body",
"slug": "surgical-body",
"href": "/categories/surgical-body",
"homeImage": "/images/home/categories/surgical-body.png",
"dashboardImage": "/images/dashboard/categories/surgical-body.svg",
"icon": "/images/home/categories/icons/surgical-body.svg",
"category": "surgical_body",
"subcategories": [
{
"subcategory": "liposuction",
"procedures": [
{
"name": "Liposuction (Abdomen)",
"id": "lipo_abdomen"
},
{
"name": "Liposuction (Arms)",
"id": "lipo_arms"
},
{
"name": "Liposuction (Thighs)",
"id": "lipo_thighs"
},
{
"name": "Liposuction (Neck)",
"id": "lipo_neck"
},
{
"name": "Liposuction (Knees / Other)",
"id": "lipo_knees"
},
{
"name": "Liposuction (Genitals)",
"id": "lipo_genitals"
},
{
"name": "Liposuction (Buttocks)",
"id": "lipo_buttocks"
},
{
"name": "Liposuction for Lipedema",
"id": "lipo_lipedema"
},
{
"name": "Abdominal Liposculpture",
"id": "liposculpture_abdomen"
},
{
"name": "VASER Liposuction",
"id": "vaser_liposuction"
},
{
"name": "360° Liposuction",
"id": "liposuction_360"
}
]
},
{
"subcategory": "body_contouring_and_lifting",
"procedures": [
{
"name": "Body Lift",
"id": "body_lift"
},
{
"name": "Arm Lift (Brachioplasty)",
"id": "arm_lift"
},
{
"name": "Thigh Lift",
"id": "thigh_lift"
},
{
"name": "Abdominoplasty / Tummy Tuck",
"id": "abdominoplasty"
},
{
"name": "Rib Remodeling / Rib Removal",
"id": "rib_remodeling"
},
{
"name": "Bodytite",
"id": "bodytite"
},
{
"name": "J-Plasma Renuvion",
"id": "j_plasma_renuvion"
},
{
"name": "High-Definition Liposuction (HD Lipo)",
"id": "hd_liposuction"
},
{
"name": "Cellulite Surgery (Subcision)",
"id": "cellulite_subcision"
},
{
"name": "Quantum skin retraction",
"id": "Quantum_radiofrequency"
},
{
"id": "mommy_makeover",
"name": "Mommy Makeover"
}
]
},
{
"subcategory": "buttocks",
"procedures": [
{
"name": "Brazilian Butt Lift (BBL)",
"id": "bbl_surgical"
},
{
"name": "Buttocks implant Augmentation",
"id": "buttocks_implant_augmentation"
}
]
},
{
"subcategory": "breast_surgery",
"procedures": [
{
"name": "Breast Augmentation",
"id": "breast_augmentation"
},
{
"name": "Breast Augmentation (Lipofilling)",
"id": "breast_augmentation_lipofilling"
},
{
"name": "MIA Breast Augmentation",
"id": "mia_breast_augmentation"
},
{
"name": "Breast Reduction",
"id": "breast_reduction"
},
{
"name": "Breast Implant Replacement",
"id": "breast_implant_replacement"
},
{
"name": "Breast Implant Removal",
"id": "breast_implant_removal"
},
{
"name": "Breast Lifting / Mastopexy",
"id": "mastopexy"
},
{
"id": "preserved_internal_bra_lifting",
"name": "Breast augmentation without anaesthesia (Preservé by Motiva)"
},
{
"name": "Internal Bra Lifting",
"id": "internal_bra_lifting"
},
{
"name": "Inverted Nipple Correction",
"id": "nipple_correction"
},
{
"name": "Breast Reconstruction",
"id": "breast_reconstruction"
},
{
"name": "Correction of Breast Asymmetry",
"id": "breast_asymmetry"
},
{
"name": "Internal Bra Matrix",
"id": "internal_bra_matrix"
},
{
"name": "Breast Lift with Implants",
"id": "mastopexy_with_implants"
}
]
},
{
"subcategory": "intimate_and_genital_surgery",
"procedures": [
{
"name": "Penis Enlargement",
"id": "penis_enlargement"
},
{
"name": "Penoplasty",
"id": "penoplasty"
},
{
"name": "Circumcision",
"id": "circumcision"
},
{
"name": "G-Spot Augmentation",
"id": "g_spot_augmentation"
},
{
"name": "Hymenoplasty",
"id": "hymenoplasty"
},
{
"name": "Mons Pubis Liposuction",
"id": "mons_pubis_liposuction"
},
{
"name": "Labiaplasty / Nymphoplasty",
"id": "labiaplasty"
},
{
"name": "Vaginoplasty",
"id": "vaginoplasty"
},
{
"name": "Perineoplasty",
"id": "perineoplasty"
}
]
},
{
"subcategory": "foot_surgery",
"procedures": [
{
"name": "Forefoot Aesthetic Surgery",
"id": "forefoot_surgery"
},
{
"name": "Hallux Valgus Surgery",
"id": "hallux_valgus"
},
{
"name": "Hammer Toe Surgery",
"id": "hammer_toe"
}
]
}
]
},
{
"key": "AESTHETIC MEDICINE FACE",
"id": "aesthetic_medicine_face",
"slug": "non-surgical-face",
"href": "/categories/non-surgical-face",
"homeImage": "/images/home/categories/aesthetic_medicine_face.png",
"dashboardImage": "/images/dashboard/categories/aesthetic_medicine_face.svg",
"icon": "/images/home/categories/icons/aesthetic-medicine-face.svg",
"category": "aesthetic_medicine_face",
"subcategories": [
{
"subcategory": "hyaluronic_acid_fillers",
"procedures": [
{
"name": "Forehead Filler",
"id": "forehead_filler"
},
{
"name": "Temple Filler",
"id": "temple_filler"
},
{
"name": "Brow Filler",
"id": "brow_filler"
},
{
"name": "Tear Trough Filler",
"id": "tear_trough_filler"
},
{
"name": "Cheek Filler",
"id": "cheek_filler"
},
{
"name": "Midface Volumization",
"id": "midface_volumization"
},
{
"name": "Non-Surgical Rhinoplasty (Nose Filler)",
"id": "nose_filler"
},
{
"name": "Lip Filler",
"id": "lip_filler"
},
{
"name": "Perioral Lines Filler",
"id": "perioral_lines_filler"
},
{
"name": "Nasolabial Fold Filler",
"id": "nasolabial_fold_filler"
},
{
"name": "Marionette Lines Filler",
"id": "marionette_lines_filler"
},
{
"name": "Chin Filler",
"id": "chin_filler"
},
{
"name": "Jawline Filler",
"id": "jawline_filler"
},
{
"name": "Hyaluronic Acid Filler (General)",
"id": "ha_filler"
},
{
"name": "Hyaluronidase",
"id": "hyaluronidase"
},
{
"name": "Upper Eyelid Filler",
"id": "upper_eyelid_filler"
},
{
"name": "Eyebrow Filler",
"id": "eyebrow_filler"
},
{
"name": "Earlobe Filler",
"id": "earlobe_filler"
},
{
"name": "Skin Quality Hyaluronic Acid",
"id": "skin_quality_ha"
}
]
},
{
"subcategory": "biostimulators_and_skin_quality_injections",
"procedures": [
{
"name": "Biostimulators / Collagen Stimulators",
"id": "biostimulators"
},
{
"name": "Sculptra Injection",
"id": "sculptra_injection"
},
{
"name": "Radiesse Injection",
"id": "radiesse_injection"
},
{
"name": "CaHA (Calcium Hydroxylapatite)",
"id": "caha"
},
{
"name": "Harmonyca Injection",
"id": "harmonyca_injection"
},
{
"name": "PLLA (Poly-L-Lactic Acid)",
"id": "plla"
},
{
"name": "PCL (Polycaprolactone)",
"id": "pcl"
},
{
"name": "Skin Boosters",
"id": "skin_boosters"
},
{
"name": "Mesotherapy",
"id": "mesotherapy"
},
{
"name": "Polynucleotides",
"id": "polynucleotides"
},
{
"name": "Peptides",
"id": "peptides"
},
{
"name": "PRP Facial",
"id": "prp_facial"
},
{
"name": "PRF",
"id": "prf"
},
{
"name": "Exosome Therapy",
"id": "exosome"
},
{
"name": "Juvelook Injection",
"id": "juvelook_injection"
},
{
"name": "Profhilo",
"id": "profhilo"
},
{
"name": "Rejuran (Salmon Sperm)",
"id": "rejuran"
}
]
},
{
"subcategory": "thread_lifting",
"procedures": [
{
"name": "Thread Lifting (General)",
"id": "thread_lifting"
},
{
"name": "PDO Lifting Threads",
"id": "pdo_threads"
},
{
"name": "Permanent Threads",
"id": "permanent_threads"
},
{
"name": "Temporary Threads",
"id": "temporary_threads"
}
]
},
{
"subcategory": "radiofrequency_and_hifu",
"procedures": [
{
"name": "Microneedling Radiofrequency",
"id": "rf_microneedling"
},
{
"name": "Radiofrequency (Without Needles)",
"id": "rf_no_needles"
},
{
"name": "Topical RF",
"id": "topical_rf"
},
{
"name": "HIFU",
"id": "hifu"
},
{
"name": "Sofwave",
"id": "sofwave"
},
{
"name": "Ultrasound",
"id": "ultrasound"
},
{
"name": "Virtue RF",
"id": "virtue_rf"
},
{
"name": "Ultrasound with Radiofrequency",
"id": "ultrasound_rf"
},
{
"name": "Morpheus 8",
"id": "morpheus_8"
},
{
"name": "Subcutaneous Radiofrequency",
"id": "subcutaneous_rf"
},
{
"id": "renuvion_skin_resurfacing_face",
"name": "Renuvion Skin Resurfacing face"
}
]
},
{
"subcategory": "lasers_and_energy_devices",
"procedures": [
{
"name": "Fractional Laser (Non-Ablative)",
"id": "fractional_laser_nonablative"
},
{
"name": "Fractional Laser (Ablative)",
"id": "fractional_laser_ablative"
},
{
"name": "CO2 Laser",
"id": "co2_laser"
},
{
"name": "Nd:YAG Laser",
"id": "nd_yag"
},
{
"name": "IPL (Intense Pulsed Light)",
"id": "ipl"
},
{
"name": "BroadBand Light (BBL)",
"id": "bbl"
},
{
"name": "Photorejuvenation",
"id": "photorejuvenation"
},
{
"name": "Picosecond Laser",
"id": "picosecond_laser"
},
{
"name": "LED Therapy",
"id": "led_therapy"
},
{
"name": "Erbium:YAG Laser",
"id": "erbium_yag"
},
{
"name": "Fotona Laser",
"id": "fotona_laser"
},
{
"name": "Carboxytherapy",
"id": "carboxytherapy"
}
]
},
{
"subcategory": "peeling_needling_and_skin_resurfacing",
"procedures": [
{
"name": "BioRePeel",
"id": "biorepeel"
},
{
"name": "Chemical Peel (Superficial)",
"id": "chemical_peel_superficial"
},
{
"name": "Chemical Peel (Medium)",
"id": "chemical_peel_medium"
},
{
"name": "Chemical Peel (Deep Phenol)",
"id": "chemical_peel_deep_phenol"
},
{
"name": "Microdermabrasion",
"id": "microdermabrasion"
},
{
"name": "Microneedling",
"id": "microneedling"
},
{
"name": "HydraFacial",
"id": "hydrafacial"
}
]
},
{
"subcategory": "botulinum_toxin",
"procedures": [
{
"name": "Botulinum Toxin",
"id": "botulinum_toxin"
},
{
"name": "Lip Flip",
"id": "lip_flip"
},
{
"name": "Nose Botox",
"id": "nose_botox"
},
{
"name": "Masseter Botox",
"id": "masseter_botox"
},
{
"name": "Baby Botox",
"id": "baby_botox"
},
{
"name": "Full Face Botox",
"id": "full_face_botox"
},
{
"name": "DAO Botox",
"id": "dao_botox"
},
{
"name": "Neck lift Nefertiti",
"id": "Neck_lift_botox"
}
]
},
{
"subcategory": "skin_diagnosis",
"procedures": [
{
"name": "Skin Analysis / VISIA",
"id": "skin_analysis"
}
]
}
]
},
{
"key": "AESTHETIC MEDICINE BODY",
"id": "aesthetic_medicine_body",
"slug": "non-surgical-body",
"href": "/categories/non-surgical-body",
"homeImage": "/images/home/categories/aesthetic_medicine_body.png",
"dashboardImage": "/images/dashboard/categories/aesthetic_medicine_body.svg",
"icon": "/images/home/categories/icons/aesthetic-medicine-body.svg",
"category": "aesthetic_medicine_body",
"subcategories": [
{
"subcategory": "fat_reduction_and_body_contouring",
"procedures": [
{
"name": "Non-Surgical BBL / Liquid BBL",
"id": "nonsurgical_bbl"
},
{
"name": "Sculptra Buttocks",
"id": "sculptra_buttocks"
},
{
"name": "Cryolipolysis",
"id": "cryolipolysis"
},
{
"name": "Lipolysis (Body)",
"id": "body_lipolysis"
},
{
"name": "Endolift",
"id": "endolift"
},
{
"name": "Microneedling Radiofrequency (Body)",
"id": "body_rf_microneedling"
},
{
"name": "Bodytite Skin Tightening",
"id": "bodytite"
},
{
"name": "Sclerotherapy Injections",
"id": "sclerotherapy"
},
{
"name": "Ultrasound Fat Reduction",
"id": "ultrasound_fat_reduction"
}
]
},
{
"subcategory": "lasers_and_energy_devices_body",
"procedures": [
{
"name": "Laser Hair Removal",
"id": "laser_hair_removal"
},
{
"name": "Attiva",
"id": "attiva"
},
{
"name": "Subcutaneous Radiofrequency",
"id": "subcutaneous_rf"
},
{
"name": "Endolift (Body)",
"id": "endolift_body"
},
{
"name": "Ultrasound (Sofwave)",
"id": "sofwave_body"
}
]
},
{
"subcategory": "weight_management_and_nutrition",
"procedures": [
{
"name": "Weight Loss Medication",
"id": "weight_loss_medication"
},
{
"name": "Weight Loss Consultation",
"id": "weight_loss_consultation"
},
{
"name": "Diet Consultation",
"id": "diet_consultation"
},
{
"name": "Body Composition Analysis",
"id": "body_composition_analysis"
},
{
"name": "Nutrition Program",
"id": "nutrition_program"
}
]
}
]
},
{
"key": "AESTHETIC DENTISTRY",
"id": "aesthetic_dentistry",
"slug": "aesthetic-dentistry",
"href": "/categories/aesthetic-dentistry",
"homeImage": "/images/home/categories/aesthetic-dentistry.png",
"dashboardImage": "/images/dashboard/categories/aesthetic-dentistry.svg",
"icon": "/images/home/categories/icons/aesthetic-dentistry.svg",
"category": "aesthetic_dentistry",
"subcategories": [
{
"subcategory": "veneers_and_restoration",
"procedures": [
{
"name": "Composite / Bonding",
"id": "composite_bonding"
},
{
"name": "Ceramic Veneers",
"id": "ceramic_veneers"
},
{
"name": "Crowns",
"id": "crowns"
}
]
},
{
"subcategory": "whitening",
"procedures": [
{
"name": "Whitening Treatment",
"id": "whitening_treatment"
}
]
},
{
"subcategory": "gum_and_shape",
"procedures": [
{
"name": "Gingival Contouring",
"id": "gingival_contouring"
},
{
"name": "Tooth Reshaping",
"id": "tooth_reshaping"
},
{
"name": "Diastema Closure",
"id": "diastema_closure"
}
]
},
{
"subcategory": "orthodontics",
"procedures": [
{
"id": "clear_aligners",
"name": "Clear aligners"
},
{
"id": "traditional_braces",
"name": "Traditional Braces"
}
]
}
]
},
{
"key": "HAIR MEDICINE",
"id": "hair_medicine",
"slug": "hair-medicine",
"href": "/categories/hair-medicine",
"homeImage": "/images/home/categories/hair-medicine.png",
"dashboardImage": "/images/dashboard/categories/hair-medicine.svg",
"icon": "/images/home/categories/icons/hair-medicine.svg",
"category": "hair_medicine",
"subcategories": [
{
"subcategory": "non_surgical_hair_treatments",
"procedures": [
{
"name": "PRP for Hair",
"id": "prp_hair"
},
{
"name": "Hair Mesotherapy",
"id": "hair_mesotherapy"
},
{
"name": "HydraFacial Scalp",
"id": "hydrafacial_scalp"
},
{
"name": "Hair Bleaching",
"id": "hair_bleaching"
},
{
"name": "Hair Transplantation",
"id": "hair_transplantation"
}
]
},
{
"subcategory": "surgical_hair_procedures",
"procedures": [
{
"name": "Forehead Reduction",
"id": "forehead_reduction"
},
{
"name": "Hairline Lowering",
"id": "hairline_lowering"
}
]
}
]
},
{
"key": "MUSCLE TONE & EMS",
"id": "muscle_tone_and_ems",
"slug": "muscle-tone-ems",
"href": "/categories/muscle-tone-ems",
"homeImage": "/images/home/categories/muscle-tone-ems.png",
"dashboardImage": "/images/dashboard/categories/muscle-tone-ems.svg",
"icon": "/images/home/categories/icons/muscle-tone-ems.svg",
"category": "muscle_tone_and_ems",
"subcategories": [
{
"subcategory": "face",
"procedures": [
{
"name": "Facial Muscle Stimulation / EM Sculpt (Face)",
"id": "facial_ems"
}
]
},
{
"subcategory": "body",
"procedures": [
{
"name": "EM Sculpt (Body)",
"id": "body_emsculpt"
},
{
"name": "Sport Coaching with EMS",
"id": "sport_coaching_ems"
}
]
}
]
},
{
"key": "IV THERAPY",
"id": "iv_therapy",
"slug": "iv-therapy",
"href": "/categories/iv-therapy",
"homeImage": "/images/home/categories/iv-therapy.png",
"dashboardImage": "/images/dashboard/categories/iv-therapy.svg",
"icon": "/images/home/categories/icons/iv-therapy.svg",
"category": "iv_therapy",
"subcategories": [
{
"subcategory": "general_and_hydration",
"procedures": [
{
"name": "IV Therapy (General)",
"id": "iv_therapy"
},
{
"name": "IV Hydration",
"id": "iv_hydration"
},
{
"name": "IV Custom / Bespoke Drip",
"id": "iv_custom"
}
]
},
{
"subcategory": "vitamins_and_antioxidants",
"procedures": [
{
"name": "IV High-Dose Vitamin C",
"id": "iv_vitamin_c"
},
{
"name": "IV Glutathione",
"id": "iv_glutathione"
},
{
"name": "IV Myers' Cocktail",
"id": "iv_myers_cocktail"
},
{
"name": "IV Amino Acids",
"id": "iv_amino_acids"
},
{
"name": "IV Magnesium",
"id": "iv_magnesium"
},
{
"name": "IV Iron Infusion",
"id": "iv_iron"
}
]
},
{
"subcategory": "energy_performance_and_recovery",
"procedures": [
{
"name": "IV Energy Boost",
"id": "iv_energy_boost"
},
{
"name": "IV Post-Workout Recovery",
"id": "iv_post_workout"
},
{
"name": "IV Hangover Recovery",
"id": "iv_hangover"
},
{
"name": "IV Anti-Stress / Relaxation",
"id": "iv_anti_stress"
},
{
"name": "IV NAD+",
"id": "iv_nad_plus"
}
]
},
{
"subcategory": "wellness_and_beauty",
"procedures": [
{
"name": "IV Skin Glow & Anti-Aging",
"id": "iv_skin_glow"
},
{
"name": "IV Immunity Boost",
"id": "iv_immunity_boost"
},
{
"name": "IV Weight Management / Fat Burn",
"id": "iv_weight_management"
},
{
"name": "IV Hair Growth",
"id": "iv_hair_growth"
},
{
"name": "IV Detox",
"id": "iv_detox"
}
]
}
]
},
{
"key": "WELLNESS & POSTOPERATIVE",
"id": "wellness_and_postoperative",
"slug": "wellness-and-postoperative",
"href": "/categories/wellness-and-postoperative",
"homeImage": "/images/home/categories/wellness-and-postoperative.png",
"dashboardImage": "/images/dashboard/categories/wellness-and-postoperative.svg",
"icon": "/images/home/categories/icons/wellness-and-postoperative.svg",
"category": "wellness_and_postoperative",
"subcategories": [
{
"subcategory": "drainage_and_circulation",
"procedures": [
{
"name": "Lymphatic Drainage",
"id": "lymphatic_drainage"
},
{
"name": "Lymphatic Drainage (Legs)",
"id": "lymphatic_drainage_legs"
},
{
"name": "Sclerotherapy",
"id": "sclerotherapy"
}
]
},
{
"subcategory": "recovery_and_relaxation",
"procedures": [
{
"name": "Infrared Sauna",
"id": "infrared_sauna"
},
{
"name": "Wellness Analysis",
"id": "wellness_analysis"
}
]
}
]
},
{
"key": "LONGEVITY MEDICINE",
"id": "longevity_medicine",
"slug": "longevity-medicine",
"href": "/categories/longevity-medicine",
"homeImage": "/images/home/categories/longevity-medicine.png",
"dashboardImage": "/images/dashboard/categories/longevity-medicine.svg",
"icon": "/images/home/categories/icons/longevity-medicine.svg",
"category": "longevity_medicine",
"subcategories": [
{
"subcategory": "biological_assessment_and_diagnostics",
"procedures": [
{
"name": "Biological Age Assessment",
"id": "biological_age_assessment"
},
{
"name": "Epigenetic Clock Test (DNA Methylation)",
"id": "epigenetic_clock_test"
},
{
"name": "Telomere Length Testing",
"id": "telomere_length_test"
},
{
"name": "Comprehensive Longevity Blood Panel",
"id": "comprehensive_blood_panel"
},
{
"name": "Gut Microbiome Analysis",
"id": "microbiome_analysis"
},
{
"name": "Continuous Glucose Monitoring (CGM)",
"id": "continuous_glucose_monitoring"
},
{
"name": "VO2 Max & Cardiovascular Fitness Assessment",
"id": "vo2max_cardio_assessment"
},
{
"name": "DEXA Body Composition Scan",
"id": "dexa_body_composition"
}
]
},
{
"subcategory": "cellular_and_regenerative_therapies",
"procedures": [
{
"name": "NAD+ Precursors (NMN / NR) — Oral",
"id": "nad_plus_oral"
},
{
"name": "Regenerative PRP (Joints / Systemic)",
"id": "prp_regenerative"
},
{
"name": "Stem Cell Therapy (Mesenchymal)",
"id": "stem_cell_therapy"
},
{
"name": "Plasmapheresis / Plasma Exchange",
"id": "plasmapheresis"
}
]
},
{
"subcategory": "physical_and_energy_therapies",
"procedures": [
{
"name": "Hyperbaric Oxygen Therapy (HBOT)",
"id": "hyperbaric_oxygen"
},
{
"name": "Ozone Therapy (Major Autohemotherapy)",
"id": "ozone_therapy"
},
{
"name": "Photobiomodulation (Red Light / NIR)",
"id": "photobiomodulation"
},
{
"name": "Whole-Body Cryotherapy",
"id": "cryo_whole_body"
}
]
},
{
"subcategory": "pharmacological_protocols",
"procedures": [
{
"name": "Metformin — Longevity Protocol",
"id": "metformin_longevity"
},
{
"name": "Low-Dose Rapamycin — Longevity Protocol",
"id": "rapamycin_longevity"
},
{
"name": "GLP-1 Agonist — Metabolic Longevity",
"id": "glp1_longevity"
},
{
"name": "Hormone Optimization Therapy (HRT/TRT)",
"id": "hormone_optimization"
},
{
"name": "Thyroid Optimization",
"id": "thyroid_optimization"
},
{
"name": "Senolytic Protocol (Dasatinib+Quercetin)",
"id": "senolytic_protocol"
}
]
},
{
"subcategory": "programs_and_lifestyle",
"procedures": [
{
"name": "Medically Supervised Fasting / FMD",
"id": "fasting_program"
},
{
"name": "Personalized Longevity Program",
"id": "personalized_longevity_program"
},
{
"name": "Longevity Consultation",
"id": "longevity_consultation"
}
]
}
]
}
]
};