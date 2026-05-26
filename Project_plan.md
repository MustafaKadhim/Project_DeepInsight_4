# Project Plan v0.1

# Learning a Pre-treatment Anatomical Motion-Risk Phenotype for Personalized Prostate Radiotherapy

- **Working title:** Learning a pre-treatment anatomical motion-risk phenotype for personalized prostate radiotherapy
- **Project type:** Retrospective model development, validation, and virtual clinical triage study
- **Clinical domain:** Prostate cancer external beam radiotherapy
- **Core technologies and concepts:**
  - Planning CT and anatomical delineations
  - Geometric biomarkers (golden fiducials)
  - 3D deep learning
  - Foundation model-derived anatomical representations
  - Motion risk predictions

---

## 1. Executive Summary

Prostate radiotherapy is sensitive to intrafractional anatomical motion such as displacement of the prostate during treatment delivery. Current workflows often detect motion only after it has occurred rather than identifying patients who are anatomically predisposed to larger motion before treatment begins.

All patients in this study have gold fiducial markers implanted in the prostate. Intrafractional motion is extracted from **triggered kV imaging** acquired during treatment delivery, enabling reliable, direct measurement of prostate displacement.

This project will investigate whether **pre-treatment pelvic anatomy, as captured in the planning CT, contains information about motion-risk phenotypes**. The hypothesis is that clinically relevant intrafractional prostate motion is partly determined by patient-specific anatomical configuration: bladder filling capacity, rectal morphology, prostate-rectum coupling, seminal-vesicle geometry, and pelvic cavity shape. These features may be more richly encoded in deep anatomical representations than in conventional scalar measurements alone.

An AI-framework will be developed to predict patient-level intrafractional motion risk from planning CT images and anatomical structure masks. The model will compare conventional geometric biomarkers (tabular information about organ volume and locations), 3D CNN baselines, and foundation models (e.g. MAISI-v2, CTFM, etc.)-derived anatomical representations. A retrospective virtual triage analysis will evaluate whether the framework could have identified patients who would benefit from personlized motion management. The initial data will be collected from Skåne University Hospital.  

---

## 2. Clinical Motivation

### 2.1 Problem

In prostate radiotherapy, accurate target localization is essential for maintaining tumor coverage while limiting dose to adjacent organs at risk. The prostate can move significantly during treatment delivery due to bladder filling, rectal dynamics, pelvic floor activity, and individual anatomical variation.

Current clinical workflows address this through population-based margins, image guidance, and preparation protocols. However, not all patients carry the same motion risk. A key unmet need is to identify, before treatment, which patients are likely to be anatomically stable and which are likely to require more intensive motion management.

### 2.2 Clinical Opportunity

A pre-treatment motion-risk model could support personalized workflow decisions:

| Predicted risk | Possible clinical action |
| -------------- | ------------------------ |
| Low risk | Standard workflow, standard margins, routine preparation |
| Intermediate risk | More frequent verification, stricter preparation protocol |
| High risk | Adaptive workflow, real-time tracking, increased imaging frequency, individualized margins |

This reframes the project as a resource-allocation and decision-support problem, not only a technical classification task.

---

## 3. Central Scientific Hypothesis

Clinically relevant intrafractional prostate motion is partly determined by patient-specific pelvic anatomy present before treatment. Bladder filling capacity, rectal configuration, prostate-rectum coupling, seminal-vesicle shape, and pelvic cavity dimensions may together form a latent motion-risk phenotype that is not fully captured by simple volume measurements.

By combining planning CT, anatomical structure masks, conventional geometric biomarkers, and deep anatomical representations from foundation models, it may be possible to predict a calibrated patient-specific risk of clinically relevant intrafractional motion, and use this to triage patients toward standard or intensified motion management workflows.

---

## 4. Main Research Questions

1. Does pre-treatment pelvic anatomy contain information predictive of clinically relevant intrafractional prostate motion?
2. Do deep anatomical representations improve motion-risk prediction beyond conventional geometric features such as bladder volume, rectal volume, prostate volume, and organ centroid distances?
3. Can foundation model-derived features capture anatomy relevant to motion risk, and facilitate explainability for its decision making instead of being a "Black Box".?
4. Can such a framework be reliably used for clinical triage decision making for prostate cancer patients?

---

## 5. Study Objectives

### Aim 1: Define clinically meaningful motion-risk endpoints

Derive fraction-level and patient-level intrafractional motion endpoints from triggered imaging and fiducial tracking data using KIM (Hewson EA et. al. 2019).

- Define intrafractional motion as fiducial-derived prostate displacement during treatment delivery.
- Create binary, categorical (e.g. low, medium, high), or continuous motion-risk labels.
- Quantify class balance and robustness under alternative threshold definitions.

### Aim 2: Develop baseline geometric models

Build transparent models based on conventional anatomical features extracted from planning CT and structure masks.

- Extract organ volumes, centroid distances, surface distances, contact measures, and pelvic geometry descriptors.
- Train logistic regression, elastic-net, random forest, and gradient-boosting baselines.
- Use these as essential benchmarks for all deep learning models.

### Aim 3: Develop deep learning models using CT and anatomical masks

Train imaging-based models using planning CT and structure masks as multi-channel inputs.

- Develop 3D ResNet-18 or related CNN baselines.
- Compare CT-only, mask-only, and CT-plus-mask inputs.
- Evaluate whether learned image features outperform geometric descriptors in Aim 2.

### Aim 4: Investigate foundation model-derived anatomical representations

Evaluate whether MAISI-v2/CTFM/DINOv3 can provide motion-relevant anatomical representations or synthetic augmentation.

- Extract candidate latent features from model encoder components.
- Test whether embedded features correlate with motion endpoints beyond conventional features (cluster of nodes).

### Aim 5: Evaluate retrospective clinical utility through virtual triage

Simulate how the model would have influenced clinical decision-making.

- Estimate how many high-motion patients would have been flagged before treatment.
- Estimate how many low-risk patients could have avoided unnecessary intensified workflows (time/resource savings?).

---

## 6. Cohort and Data

### 6.1 Patient population

The cohort consists of prostate cancer patients treated with external beam radiotherapy. All patients have gold fiducial markers implanted in the prostate. Intrafractional motion data are derived from triggered kV imaging acquired during treatment delivery via KIM.

Wanted data per patient:
- Planning CT or MRI.
- Clinical structure delineations.
- Fiducial positions extracted from triggered kV images across treatment fractions.

**The data will be initially collected from Skåne University Hospital for a proof of concept, but we encourage collecting external data from other clinics in/outside of Sweden.**

### 6.2 Inclusion criteria

- Include the first 7 fractions of the treatment course. 
- Gold fiducial markers in the prostate.
- Available planning CT with clinical delineations.
- Triggered imaging-derived intrafractional motion data from multiple fractions.

### 6.3 Exclusion criteria

- Less than 7 treatment fractions. 
- Missing or corrupted CT imaging or triggered imaging data.
- Insufficient triggered imaging data for reliable motion endpoint derivation.

---

## 7. Motion Endpoint Definition

Endpoint definition is one of the most important methodological components of this project.

### 7.1 Primary endpoint: intrafractional motion

Intrafractional motion is the primary endpoint, derived from fiducial displacement measured via triggered kV imaging during treatment delivery. This provides a direct, patient-specific measurement of prostate position during each of the 7 fractions.

**Candidate primary binary endpoint:**

> **High intrafractional motion risk:** A patient is classified as high risk if they experience at least two fractions with fiducial-derived prostate displacement above a predefined threshold (e.g., 5 mm). the 5 mm is the radius of the monitoring circle for each fiducial in our clinical protocol. 

This endpoint will be tested under multiple threshold definitions (e.g. 5mm vs 3mm) to assess robustness and variations.

### 7.2 Secondary endpoints (cohort overview)

- Maximum observed intrafractional displacement per patient and cohort.
- Mean displacement across fractions per patient or across cohort.
- Percentage of fractions exceeding 3 mm.
- Percentage of fractions exceeding 5 mm.
- Time trend of motion across the treatment course. 

I believe it would be useful to publish this information as a reference and an overview of how intrafractional motion appears in other clinics and cohorts.

---

## 8. Input Data and Preprocessing

### 8.1 Imaging input

The inputs to the model will be originated from CT images and delineated structures (either coming from clinical delineated structures or using Totalsegmentator) depending on the task. 

### 8.2 Anatomical structure masks

- Prostate.
- Seminal vesicles (if clinically available).
- CTV / PTV (if clinically available).
- Bladder.
- Rectum.
- Femoral heads.
- Body contour.

### 8.3 Derived maps

- Signed distance map from prostate to rectum.
- Signed distance map from prostate to bladder.
- Rectum-prostate contact map.
- Bladder-prostate interface map.
- Femoral-L-and-Femoral-R distance map.
- etc. 

### 8.4 Preprocessing steps

1. Convert DICOM CT and RTSTRUCT data to research format.
2. Resample images and masks to a consistent voxel spacing.
4. Clip CT intensities to relevant HU range and normalize.
5. Use masks as binary channels or one unified mask channel.
6. Generate geometric features and distance maps.

---

## 9. Feature Engineering

### 9.1 Conventional geometric features

| Feature category | Example features |
| ---------------- | ---------------- |
| Organ volumes | Bladder, rectum, prostate, seminal vesicles, CTV, PTV |
| Centroid distances | Prostate-bladder, prostate-rectum, prostate-SV |
| Surface distances | Prostate-to-rectum, prostate-to-bladder |
| Shape descriptors | Elongation, compactness, surface area, eccentricity |
| Contact features | Rectum-prostate contact area, bladder-prostate interface |
| Pelvic geometry | Pelvic width, anterior-posterior diameter |
| Preparation proxies | Bladder filling state, rectal distension |

### 9.2 Foundation model-derived features

| Feature type | Description |
| ------------ | ----------- |
| Latent embeddings | Anatomical representation from MAISI-v2 encoder |


---

## 10. Model Development

### 10.1 Model ladder

| Step | Model | Input |
| ---- | ----- | ----- |
| 1 | Logistic regression | Geometric features |
| 2 | Gradient boosting | Geometric features |
| 3 | 3D CNN (CT only) | Planning CT |
| 4 | 3D CNN (mask only) | Structure masks |
| 5 | 3D CNN (CT + masks) | CT + masks |
| 6 | Hybrid model | Geometry + CT/masks |
| 7 | MAISI feature model | MAISI embeddings + geometry |
| 8 | Combined model | CT + masks + geometry + MAISI |

Each step must justify its added complexity over the previous.

### 10.2 Model output

The model should produce either:
- A binary high-risk vs low-risk label.
- A continuous probability of clinically relevant intrafractional motion.
- A cluster of nodes showing risk groups: low / intermediate / high.

### 10.3 Evaluation metrics

AUC, sensitivity, specificity, positive and negative predictive value, calibration slope and intercept, Brier score, decision-curve analysis, and continuous correlation with motion burden.

---

## 11. Validation Plan

- **Internal:** Nested or repeated stratified cross-validation, always splitting by patient.
- **Temporal:** If sufficient data, train on earlier patients and test on later patients.
- **External:** If feasible, validate on data from another institution; otherwise define as a future step.

---

## 12. Interpretability

- **Global:** Identify which feature groups (bladder, rectum, pelvic geometry, seminal vesicles) drive model predictions.
- **Local:** For individual patients, report predicted risk score, main anatomical contributors, and comparison to population distribution.
- **MAISI probing:** Test whether MAISI embeddings encode interpretable anatomical quantities (bladder volume, rectal volume, prostate-rectum distance) to understand what they represent.

---

## 13. Retrospective Virtual Triage Study

Simulate how the model would have influenced clinical decision-making:

| Predicted risk | Retrospective simulated action |
| -------------- | ------------------------------ |
| Low risk | Standard workflow (Triggered Imaging)|
| Intermediate risk | Additional verification (CBCT) & stricter Triggered Imaging settings |
| High risk | Real-time tracking (MR-Linac, Radixact, etc.), increased imaging, individualized margins |

**Key evaluation questions:**
- How many observed high-motion patients would have been flagged before treatment?
- How many low-motion patients could have been spared intensified workflows?
- What threshold gives acceptable sensitivity at clinically acceptable false-negative rates?
- Does the model outperform bladder/rectum volume alone?

---

## 14. Ethics and Implementation

This project is retrospective and non-interventional. The model should not influence treatment decisions during development.

- Use anonymized retrospective imaging and treatment data. Ethical agreement available as SUS. Additional Ethics applications shall be applied for if needed for other hospitals. 

---

## 15. Expected Scientific Contributions

1. A clinically grounded definition of patient-level intrafractional prostate motion risk using fiducial tracking.
2. A curated dataset linking pre-treatment planning CT/MR anatomy to measured intrafractional motion.
3. A benchmark comparison of geometric, CNN-based, and foundation-model-derived predictors.
4. Evidence for or against a pre-treatment anatomical motion-risk phenotype.
5. A calibrated AI model for motion-risk stratification from planning CT/MR information.
6. A retrospective virtual triage framework for evaluating clinical utility.

---

## 16. Open Decisions

- What is the final cohort size and how many patients have complete triggered imaging data? aiming around 1500-2000 patients. 
- Is external validation possible through collaboration?
- Are there any additional ideas we can investigate with this kind of data? :D 
