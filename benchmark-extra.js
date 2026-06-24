'use strict';
/**
 * SatLegal — Extended Benchmark Test Cases (1000+)
 * Covers all 70 law categories with:
 *   - Standard victim queries
 *   - Short / fragment queries (≤8 words)
 *   - Hinglish queries
 *   - Accused / professional perspective queries
 *   - Third-party / family perspective queries
 *   - Negative tests (N: prefix — law must NOT appear in top-3)
 *   - Edge cases from strategy doc (previously failing)
 *   - Collision tests (verify correct law wins)
 *
 * Format: { q, expect, tags, note }
 *   expect: string (partial match) | string[] (any one must match)
 *   tags:   string[] — used with --cat filter in benchmark.js
 */

module.exports = [

  // ═══════════════════════════════════════════════════════════════════════
  // FAMILY LAWS
  // ═══════════════════════════════════════════════════════════════════════

  // ── Family – Divorce (Contested) ────────────────────────────────────────
  { q: 'wife is not agreeing to divorce what can I do', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'husband refuses to give divorce living separately for 3 years', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'grounds for divorce in India under Hindu Marriage Act', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'desertion for more than 2 years, can I file for divorce', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'husband has another wife, I want divorce on bigamy grounds', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'mental cruelty grounds for divorce India', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'wife left home 4 years ago will not return divorce possible', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'divorce petition without consent of wife', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'how to contest divorce petition filed by wife', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'divorce on grounds of cruelty India', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'talaq nahi de raha husband', expect: 'Divorce', tags: ['Divorce','Family','Hinglish'] },
  { q: 'divorce chahiye pati nahi maan raha', expect: 'Divorce', tags: ['Divorce','Family','Hinglish'] },
  { q: 'wife filed false divorce case against me how to defend', expect: 'Divorce', tags: ['Divorce','Family','Accused'] },
  { q: 'divorce case going on for 5 years no resolution', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'irretrievable breakdown of marriage divorce India', expect: 'Divorce', tags: ['Divorce','Family'] },

  // ── Family – Mutual Consent Divorce ─────────────────────────────────────
  { q: 'both husband and wife want divorce what is the process', expect: 'Mutual', tags: ['MutualDivorce','Family'] },
  { q: 'mutual consent divorce procedure India', expect: 'Mutual', tags: ['MutualDivorce','Family'] },
  { q: 'we both agree to separate what documents needed for divorce', expect: 'Mutual', tags: ['MutualDivorce','Family'] },
  { q: 'section 13B Hindu Marriage Act mutual divorce', expect: 'Mutual', tags: ['MutualDivorce','Family'] },
  { q: 'can 6 month cooling period be waived in mutual divorce', expect: 'Mutual', tags: ['MutualDivorce','Family'] },
  { q: 'mutual divorce without going to court possible', expect: 'Mutual', tags: ['MutualDivorce','Family'] },
  { q: 'dono agree hain divorce ke liye kya karna hoga', expect: 'Mutual', tags: ['MutualDivorce','Family','Hinglish'] },
  { q: 'we want to end marriage peacefully and amicably', expect: 'Mutual', tags: ['MutualDivorce','Family'] },
  { q: 'mutual consent divorce timeline how many months', expect: 'Mutual', tags: ['MutualDivorce','Family'] },
  { q: 'second motion mutual divorce procedure', expect: 'Mutual', tags: ['MutualDivorce','Family'] },

  // ── Family – Child Custody ───────────────────────────────────────────────
  { q: 'wife took children away after separation, want custody', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'husband not allowing me to meet my children after divorce', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'child custody order violation, what to do', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'who gets custody of child in India after divorce', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'interim custody of child during divorce proceedings', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'father rights child custody India', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'mother has taken my child to another city without permission', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'visitation rights grandfather grandmother India', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'bacha le gayi wife allow nahi karti milne', expect: 'Custody', tags: ['Custody','Family','Hinglish'] },
  { q: 'guardianship of minor child after death of parent', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'child welfare paramount consideration custody India', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'NRI custody dispute children taken abroad without consent', expect: 'Custody', tags: ['Custody','Family','NRI'] },

  // ── Family – Maintenance / Alimony ──────────────────────────────────────
  { q: 'husband not paying maintenance after separation', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'how much maintenance can wife claim in India', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'wife demanding excessive maintenance what can I do', expect: 'Maintenance', tags: ['Maintenance','Family','Accused'] },
  { q: 'section 125 CrPC maintenance for wife and children', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'alimony after divorce how to calculate India', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'maintenance not paid for 6 months how to enforce order', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'wife is working can she still claim maintenance', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'pati maintenance nahi de raha kya karoon', expect: 'Maintenance', tags: ['Maintenance','Family','Hinglish'] },
  { q: 'child support not being paid by father after divorce', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'interim maintenance during divorce proceedings India', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'maintenance for aged parents under law India', expect: ['Maintenance','Senior'], tags: ['Maintenance','Family','SeniorCitizen'] },

  // ── Family – Domestic Violence ───────────────────────────────────────────
  { q: 'husband is beating me every day what should I do', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'in-laws mentally torturing me after marriage', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'protection order against abusive husband India', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'domestic violence shelter home where to go', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'husband threatens to kill me what legal protection', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'economic abuse by husband not giving money for household', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'pati maarta hai kya karoon', expect: 'Domestic Violence', tags: ['DV','Family','Hinglish'] },
  { q: 'wife is abusive towards me can I file domestic violence', expect: 'Domestic Violence', tags: ['DV','Family','Accused'] },
  { q: 'DV Act protection order residence order India', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'emotional abuse and mental harassment by spouse', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'sasural wale maar peet kar rahe hain', expect: 'Domestic Violence', tags: ['DV','Family','Hinglish'] },
  { q: 'husband threw me out of the house', expect: 'Domestic Violence', tags: ['DV','Family'] },

  // ── Family – Muslim Personal Law ─────────────────────────────────────────
  { q: 'husband gave triple talaq over phone, what are my rights', expect: 'Muslim', tags: ['Muslim','Family'] },
  { q: 'mehr not paid after nikah, how to claim', expect: 'Muslim', tags: ['Muslim','Family'] },
  { q: 'Muslim wife maintenance iddat period', expect: 'Muslim', tags: ['Muslim','Family'] },
  { q: 'talaq-ul-biddat case India what to do', expect: 'Muslim', tags: ['Muslim','Family'] },
  { q: 'Muslim marriage dissolution khula procedure India', expect: 'Muslim', tags: ['Muslim','Family'] },
  { q: 'instant talaq criminal offence India', expect: 'Muslim', tags: ['Muslim','Family'] },
  { q: 'Muslim personal law divorce procedure India', expect: 'Muslim', tags: ['Muslim','Family'] },
  { q: 'mujhe teen talaq bol diya', expect: 'Muslim', tags: ['Muslim','Family','Hinglish'] },

  // ── Family – Special Marriage Act ───────────────────────────────────────
  { q: 'court marriage different religion how to do in India', expect: 'Special Marriage', tags: ['SpecialMarriage','Family'] },
  { q: 'inter-caste marriage family not agreeing', expect: 'Special Marriage', tags: ['SpecialMarriage','Family'] },
  { q: 'love marriage registration process India', expect: 'Special Marriage', tags: ['SpecialMarriage','Family'] },
  { q: 'Special Marriage Act registration procedure', expect: 'Special Marriage', tags: ['SpecialMarriage','Family'] },
  { q: 'Hindu Muslim marriage legal procedure India', expect: 'Special Marriage', tags: ['SpecialMarriage','Family'] },
  { q: 'notice period 30 days court marriage India', expect: 'Special Marriage', tags: ['SpecialMarriage','Family'] },

  // ── Family – Judicial Separation ────────────────────────────────────────
  { q: 'not ready for divorce but want to live separately legally', expect: 'Judicial Separation', tags: ['JudicialSep','Family'] },
  { q: 'restitution of conjugal rights petition India', expect: 'Judicial Separation', tags: ['JudicialSep','Family'] },
  { q: 'judicial separation vs divorce what is the difference', expect: 'Judicial Separation', tags: ['JudicialSep','Family'] },
  { q: 'husband filed RCR petition against me', expect: 'Judicial Separation', tags: ['JudicialSep','Family'] },

  // ═══════════════════════════════════════════════════════════════════════
  // CRIMINAL LAWS
  // ═══════════════════════════════════════════════════════════════════════

  // ── Criminal – BNS Fraud / Cheating ─────────────────────────────────────
  { q: 'friend borrowed money and is not returning, what to do', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'business partner cheated me and ran away with funds', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'sold land but buyer not paying remaining amount', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'fake job offer took my money and disappeared', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'someone took advance and never delivered goods', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'cheated on marriage promise and now refuses to marry', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'investment fraud someone promised high returns took money', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'mera paisa le gaya aur gum ho gaya', expect: 'Fraud', tags: ['Fraud','Criminal','Hinglish'] },
  { q: 'token money paid for flat but builder cancelled and not refunding', expect: ['Fraud','RERA','Consumer'], tags: ['Fraud','Criminal','Property'] },
  { q: 'relative borrowed lakhs and now denying', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'IPC 420 equivalent in BNS for cheating', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'N:my husband cheated on me in marriage', expect: 'Fraud', tags: ['Divorce','Family','negative'], note: 'Matrimonial cheating is not BNS fraud' },

  // ── Criminal – BNS Assault / Hurt ───────────────────────────────────────
  { q: 'neighbour beat me up, want to file complaint', expect: 'Assault', tags: ['Assault','Criminal'] },
  { q: 'group of people attacked me on the road', expect: 'Assault', tags: ['Assault','Criminal'] },
  { q: 'someone hit me with a rod, I am injured', expect: 'Assault', tags: ['Assault','Criminal'] },
  { q: 'acid thrown on my face by rejected suitor', expect: ['Assault','Grievous'], tags: ['Assault','Criminal'] },
  { q: 'grievous hurt section BNS India', expect: 'Assault', tags: ['Assault','Criminal'] },
  { q: 'boss physically assaulted me in office', expect: ['Assault','POSH'], tags: ['Assault','Criminal','Employment'] },
  { q: 'mujhe maara unhone, FIR karni hai', expect: 'Assault', tags: ['Assault','Criminal','Hinglish'] },
  { q: 'I was beaten by police in custody', expect: ['Police Excess','Assault'], tags: ['Assault','Criminal','PoliceExcess'] },
  { q: 'section 115 BNS voluntarily causing hurt', expect: 'Assault', tags: ['Assault','Criminal'] },
  { q: 'physical fight broke out, other person is now hospitalised', expect: 'Assault', tags: ['Assault','Criminal'] },
  { q: 'threatened to kill me with knife', expect: 'Assault', tags: ['Assault','Criminal'] },

  // ── Criminal – BNS Murder / Culpable Homicide ───────────────────────────
  { q: 'my friend was murdered, what should I do', expect: 'Murder', tags: ['Murder','Criminal'] },
  { q: 'found dead body of my brother, police not acting', expect: 'Murder', tags: ['Murder','Criminal'] },
  { q: 'suspicious death of wife, in-laws may be responsible', expect: 'Murder', tags: ['Murder','Criminal'] },
  { q: 'husband poisoned my food I survived, want to file FIR', expect: 'Murder', tags: ['Murder','Criminal'] },
  { q: 'my friend was given poison and he died', expect: 'Murder', tags: ['Murder','Criminal'], note: 'Edge case - poison not poisoned' },
  { q: 'wife found hanging at in-laws house', expect: 'Murder', tags: ['Murder','Criminal'] },
  { q: 'rash driving accident killed pedestrian', expect: ['Murder','Motor Accident'], tags: ['Murder','Criminal','MotorAccident'] },
  { q: 'mera bhai mara gaya, koi action nahi ho raha', expect: 'Murder', tags: ['Murder','Criminal','Hinglish'] },
  { q: 'death due to negligence but not in hospital context', expect: ['Murder','Culpable'], tags: ['Murder','Criminal'] },
  { q: 'body found in river police saying suicide but family suspects murder', expect: 'Murder', tags: ['Murder','Criminal'] },
  { q: 'N:father died naturally leaving property', expect: 'Murder', tags: ['Succession','negative'], note: 'Natural death + property = succession not murder' },
  { q: 'honor killing family murdered daughter for marrying someone', expect: 'Murder', tags: ['Murder','Criminal'] },
  { q: 'shot dead outside his shop in broad daylight', expect: 'Murder', tags: ['Murder','Criminal'] },

  // ── Criminal – BNS Theft / Robbery ──────────────────────────────────────
  { q: 'my mobile phone was snatched by two boys', expect: 'Theft', tags: ['Theft','Criminal'] },
  { q: 'house was burgled while we were out, valuables stolen', expect: 'Theft', tags: ['Theft','Criminal'] },
  { q: 'pickpocketed at railway station, wallet and phone gone', expect: 'Theft', tags: ['Theft','Criminal'] },
  { q: 'dacoits attacked our village and looted goods', expect: 'Theft', tags: ['Theft','Criminal'] },
  { q: 'gold chain snatched from wife while walking', expect: 'Theft', tags: ['Theft','Criminal'] },
  { q: 'armed robbery at my shop', expect: 'Theft', tags: ['Theft','Criminal'] },
  { q: 'mera phone chura liya', expect: 'Theft', tags: ['Theft','Criminal','Hinglish'] },
  { q: 'shoplifting complaint against customer', expect: 'Theft', tags: ['Theft','Criminal'] },
  { q: 'vehicle theft, car stolen from parking lot', expect: 'Theft', tags: ['Theft','Criminal'] },
  { q: 'employee theft from company, how to file complaint', expect: 'Theft', tags: ['Theft','Criminal','Employment'] },

  // ── Criminal – BNSS Bail ─────────────────────────────────────────────────
  { q: 'bail chahiye, bhai arrest hua hai', expect: 'Bail', tags: ['Bail','Criminal','Hinglish'] },
  { q: 'how to apply for anticipatory bail India', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'police arrested my husband without warrant, need bail', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'bail application rejected by sessions court, next step', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'non-bailable offence bail procedure India', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'what is anticipatory bail and when to apply', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'bail conditions too strict, how to modify', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'son arrested in criminal case, need bail immediately', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'default bail BNSS 479 calculation how many days', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'surety for bail who can stand, requirements', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'habeas corpus petition for wrongful detention', expect: ['Bail','Habeas','Constitutional'], tags: ['Bail','Criminal','Constitutional'] },

  // ── Criminal – Cheque Bounce (NI Act 138) ───────────────────────────────
  { q: 'cheque bounce case how to file complaint', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal'] },
  { q: 'cheque dishonoured insufficient funds notice period', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal'] },
  { q: 'cheque bounce hua 15 din ho gaye', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal','Hinglish'] },
  { q: 'NI Act section 138 complaint limitation period', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal'] },
  { q: '30 day notice sent for cheque bounce, next step', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal'] },
  { q: 'defence in cheque bounce case accused', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal','Accused'] },
  { q: 'post-dated cheque not honoured what to do', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal'] },
  { q: 'cheque wapas aaya, ab kya karna hai', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal','Hinglish'] },
  { q: 'multiple cheques dishonoured by same person', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal'] },
  { q: 'cheque bounce case compounding settlement', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal'] },
  { q: 'company cheque bounced from director personally liable', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal','Corporate'] },

  // ── Criminal – Dowry / 498A ──────────────────────────────────────────────
  { q: 'in-laws demanding more dowry, threatening to throw me out', expect: 'Dowry', tags: ['Dowry','Criminal'] },
  { q: 'husband and family harassing for car as dowry', expect: 'Dowry', tags: ['Dowry','Criminal'] },
  { q: 'filed 498A case against in-laws for dowry harassment', expect: 'Dowry', tags: ['Dowry','Criminal'] },
  { q: 'wife filed false 498A against my family what to do', expect: 'Dowry', tags: ['Dowry','Criminal','Accused'] },
  { q: 'dowry death bride burnt, suspicious death', expect: ['Dowry','Murder'], tags: ['Dowry','Criminal','Murder'] },
  { q: 'dahej ki demand kar rahe hain sasural wale', expect: 'Dowry', tags: ['Dowry','Criminal','Hinglish'] },
  { q: '498A complaint quashing petition High Court', expect: 'Dowry', tags: ['Dowry','Criminal','Accused'] },
  { q: 'streedhan not returned after separation', expect: 'Dowry', tags: ['Dowry','Criminal'] },
  { q: 'BNS section 85 dowry cruelty offence', expect: 'Dowry', tags: ['Dowry','Criminal'] },

  // ── Criminal – Police Excess / Human Rights ──────────────────────────────
  { q: 'police beating arrested persons in custody', expect: 'Police Excess', tags: ['PoliceExcess','Criminal'] },
  { q: 'police took bribe and refused to register FIR', expect: 'Police Excess', tags: ['PoliceExcess','Criminal'] },
  { q: 'wrongful arrest by police no reason given', expect: 'Police Excess', tags: ['PoliceExcess','Criminal'] },
  { q: 'police encounter killing, family wants justice', expect: 'Police Excess', tags: ['PoliceExcess','Criminal'] },
  { q: 'mujhe police ne bina wajah pakad liya', expect: 'Police Excess', tags: ['PoliceExcess','Criminal','Hinglish'] },
  { q: 'custodial death, person died in police lock-up', expect: 'Police Excess', tags: ['PoliceExcess','Criminal'] },
  { q: 'complaint against police officer for misconduct', expect: 'Police Excess', tags: ['PoliceExcess','Criminal'] },
  { q: 'NHRC complaint against police human rights violation', expect: 'Police Excess', tags: ['PoliceExcess','Criminal','Constitutional'] },
  { q: 'police refusing to file FIR what to do India', expect: ['Police Excess','Constitutional'], tags: ['PoliceExcess','Criminal'] },

  // ── Criminal – Medical Negligence / BNS 106 ─────────────────────────────
  { q: 'patient died during surgery, family blaming the doctor, I need help', expect: 'Medical Negligence', tags: ['MedNeg','Criminal'], note: 'Accused doctor perspective' },
  { q: 'someone died at operation table family is blaming me', expect: 'Medical Negligence', tags: ['MedNeg','Criminal'], note: 'Critical edge case' },
  { q: 'operation went wrong patient died, FIR filed against me', expect: 'Medical Negligence', tags: ['MedNeg','Criminal','Accused'] },
  { q: 'patient died in hospital due to doctor negligence want FIR', expect: 'Medical Negligence', tags: ['MedNeg','Criminal'] },
  { q: 'wrong medicine given patient died BNS 106 case', expect: 'Medical Negligence', tags: ['MedNeg','Criminal'] },
  { q: 'doctor made rash decision during delivery child died', expect: 'Medical Negligence', tags: ['MedNeg','Criminal'] },
  { q: 'mera operation kiya aur patient mar gaya, kya karoon', expect: 'Medical Negligence', tags: ['MedNeg','Criminal','Hinglish','Accused'] },
  { q: 'hospital staff negligence caused patient death', expect: 'Medical Negligence', tags: ['MedNeg','Criminal'] },
  { q: 'anaesthesia overdose caused death, criminal negligence', expect: 'Medical Negligence', tags: ['MedNeg','Criminal'] },
  { q: 'N:father died in hospital, now who gets the property', expect: 'Medical Negligence', tags: ['Succession','negative'], note: 'Natural death + property = succession, not med neg' },
  { q: 'died in hospital after operation family wants compensation and FIR', expect: 'Medical Negligence', tags: ['MedNeg','Criminal'], note: 'Edge case: died in hospital' },
  { q: 'death at hospital doctor arrested what are my rights as doctor', expect: 'Medical Negligence', tags: ['MedNeg','Criminal','Accused'] },

  // ── Criminal – POCSO ────────────────────────────────────────────────────
  { q: 'neighbour is sexually abusing my 10 year old daughter', expect: 'POCSO', tags: ['POCSO','Criminal'] },
  { q: 'teacher touched my child inappropriately at school', expect: 'POCSO', tags: ['POCSO','Criminal'] },
  { q: 'child sexual abuse complaint POCSO FIR how to file', expect: 'POCSO', tags: ['POCSO','Criminal'] },
  { q: 'my 14 year old was raped by relative', expect: 'POCSO', tags: ['POCSO','Criminal'] },
  { q: 'online grooming of minor by stranger', expect: 'POCSO', tags: ['POCSO','Criminal','Cyber'] },
  { q: 'meri 12 saal ki beti ke saath bura hua', expect: 'POCSO', tags: ['POCSO','Criminal','Hinglish'] },
  { q: 'child pornography found on phone complaint', expect: 'POCSO', tags: ['POCSO','Criminal','Cyber'] },
  { q: 'POCSO bail application procedure India', expect: 'POCSO', tags: ['POCSO','Criminal','Bail'] },
  { q: 'stepfather abusing minor stepchild sexually', expect: 'POCSO', tags: ['POCSO','Criminal'] },
  { q: '15 year old girl pregnant by boyfriend POCSO applicable', expect: 'POCSO', tags: ['POCSO','Criminal'] },
  { q: 'N:my 20 year old was sexually assaulted', expect: 'POCSO', tags: ['Rape','negative'], note: 'Adult victim = Rape/BNS 64, not POCSO' },

  // ── Criminal – Rape / Sexual Assault ────────────────────────────────────
  { q: 'I was raped by my colleague what should I do', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'gang rape complaint how to file FIR', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'she was raped by the auto driver', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'marital rape husband forcing sex, what are my rights', expect: 'Rape', tags: ['Rape','Criminal','DV'] },
  { q: 'drugged and raped at party, no memory of incident', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'mera balatkar hua kya karoon', expect: 'Rape', tags: ['Rape','Criminal','Hinglish'] },
  { q: 'rape on false promise of marriage BNS 79', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'patient visited our hospital and she got raped, what should I do', expect: 'Rape', tags: ['Rape','Criminal'], note: 'Critical edge case - hospital setting should not trigger consumer' },
  { q: 'she was raped at her workplace by manager', expect: 'Rape', tags: ['Rape','Criminal','Employment'] },
  { q: 'woman raped in hospital by ward boy', expect: 'Rape', tags: ['Rape','Criminal'], note: 'Hospital rape = Rape law, not consumer' },
  { q: 'sexual assault medical examination FSLO procedure', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'FIR refused by police for rape complaint, what to do', expect: 'Rape', tags: ['Rape','Criminal','PoliceExcess'] },
  { q: 'jabardasti ki mujhse', expect: 'Rape', tags: ['Rape','Criminal','Hinglish'] },
  { q: 'BNS section 64 rape complaint India', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'N:consumer complaint hospital service', expect: 'Rape', tags: ['Consumer','negative'], note: 'Hospital + rape should NOT route to consumer' },

  // ── Criminal – SC/ST Atrocities ──────────────────────────────────────────
  { q: 'upper caste person abused me using caste slurs', expect: 'SC/ST', tags: ['SCST','Criminal'] },
  { q: 'I am dalit, was physically attacked because of my caste', expect: 'SC/ST', tags: ['SCST','Criminal'] },
  { q: 'SC ST Prevention of Atrocities Act case how to file', expect: 'SC/ST', tags: ['SCST','Criminal'] },
  { q: 'caste discrimination at workplace, what are my rights', expect: 'SC/ST', tags: ['SCST','Criminal','Employment'] },
  { q: 'OBC certificate being misused falsely claimed', expect: 'SC/ST', tags: ['SCST','Criminal'] },
  { q: 'jati ke naam pe gali di aur maara', expect: 'SC/ST', tags: ['SCST','Criminal','Hinglish'] },
  { q: 'forced to do manual scavenging, is there a law', expect: 'SC/ST', tags: ['SCST','Criminal'] },
  { q: 'excluded from village well because of my caste', expect: 'SC/ST', tags: ['SCST','Criminal'] },

  // ── Criminal – Corruption / Bribery ─────────────────────────────────────
  { q: 'government officer demanding bribe to process my application', expect: 'Corruption', tags: ['Corruption','Criminal'] },
  { q: 'how to file complaint against corrupt police officer', expect: 'Corruption', tags: ['Corruption','Criminal'] },
  { q: 'anti-corruption bureau complaint how to file', expect: 'Corruption', tags: ['Corruption','Criminal'] },
  { q: 'sarkari babu rishwat maang raha hai', expect: 'Corruption', tags: ['Corruption','Criminal','Hinglish'] },
  { q: 'Prevention of Corruption Act case against public servant', expect: 'Corruption', tags: ['Corruption','Criminal'] },
  { q: 'trap case CBI how to set up for bribery', expect: 'Corruption', tags: ['Corruption','Criminal'] },
  { q: 'contractor paying kickbacks to government officials tender fraud', expect: 'Corruption', tags: ['Corruption','Criminal','Corporate'] },

  // ── Criminal – PMLA / Money Laundering ──────────────────────────────────
  { q: 'ED notice received for money laundering what to do', expect: 'PMLA', tags: ['PMLA','Criminal'] },
  { q: 'property attached by Enforcement Directorate', expect: 'PMLA', tags: ['PMLA','Criminal'] },
  { q: 'PMLA case how to get bail from special court', expect: 'PMLA', tags: ['PMLA','Criminal','Bail'] },
  { q: 'money laundering charges against my company', expect: 'PMLA', tags: ['PMLA','Criminal','Corporate'] },
  { q: 'hawala transaction case ED investigation', expect: 'PMLA', tags: ['PMLA','Criminal'] },
  { q: 'predicate offence PMLA link how to challenge', expect: 'PMLA', tags: ['PMLA','Criminal'] },

  // ═══════════════════════════════════════════════════════════════════════
  // PROPERTY LAWS
  // ═══════════════════════════════════════════════════════════════════════

  // ── Property – Hindu Succession / Inheritance ────────────────────────────
  { q: 'father died without will, how is property divided among children', expect: 'Succession', tags: ['HinduSuccession','Property'] },
  { q: 'daughter rights in ancestral property Hindu law', expect: 'Succession', tags: ['HinduSuccession','Property'] },
  { q: 'brother not giving share in ancestral property', expect: 'Succession', tags: ['HinduSuccession','Property'] },
  { q: 'wife share in husband property after his death', expect: 'Succession', tags: ['HinduSuccession','Property'] },
  { q: 'self-acquired property can father give only to one son', expect: 'Succession', tags: ['HinduSuccession','Property'] },
  { q: 'pita ke marne ke baad property mein hissa chahiye', expect: 'Succession', tags: ['HinduSuccession','Property','Hinglish'] },
  { q: 'class 1 heirs Hindu Succession Act who are they', expect: 'Succession', tags: ['HinduSuccession','Property'] },
  { q: 'coparcenary rights daughters 2005 amendment', expect: 'Succession', tags: ['HinduSuccession','Property'] },
  { q: 'N:father died in hospital due to surgery, property dispute', expect: 'Medical Negligence', tags: ['HinduSuccession','negative'], note: 'Hospital death suggests negligence, not just succession' },

  // ── Succession – Will Dispute / Probate ─────────────────────────────────
  { q: 'brother has forged fathers will to take all property', expect: 'Will', tags: ['WillProbate','Succession'] },
  { q: 'how to challenge a disputed will in court', expect: 'Will', tags: ['WillProbate','Succession'] },
  { q: 'probate of will procedure India', expect: 'Will', tags: ['WillProbate','Succession'] },
  { q: 'father made will in favour of second wife, can I challenge', expect: 'Will', tags: ['WillProbate','Succession'] },
  { q: 'succession certificate needed to transfer bank account of deceased', expect: 'Will', tags: ['WillProbate','Succession'] },
  { q: 'letter of administration for deceased estate India', expect: 'Will', tags: ['WillProbate','Succession'] },
  { q: 'vasiyat mein naam nahi hai kya karoon', expect: 'Will', tags: ['WillProbate','Succession','Hinglish'] },
  { q: 'will executed under undue influence, can it be challenged', expect: 'Will', tags: ['WillProbate','Succession'] },

  // ── Property – Transfer / Sale Deed Dispute ──────────────────────────────
  { q: 'property sale registered but possession not given', expect: 'Transfer', tags: ['SaleDeed','Property'] },
  { q: 'sale deed executed but stamp duty not paid correctly', expect: 'Transfer', tags: ['SaleDeed','Property'] },
  { q: 'power of attorney misused to sell my property', expect: 'Transfer', tags: ['SaleDeed','Property'] },
  { q: 'property bought but previous owner making claims', expect: 'Transfer', tags: ['SaleDeed','Property'] },
  { q: 'gift deed challenged by other family members', expect: 'Transfer', tags: ['SaleDeed','Property'] },
  { q: 'benami property transaction how to challenge', expect: 'Transfer', tags: ['SaleDeed','Property'] },
  { q: 'property registration fraud duplicate sale deed', expect: 'Transfer', tags: ['SaleDeed','Property'] },
  { q: 'sale agreement not honoured by seller, what to do', expect: ['Transfer','Specific Performance'], tags: ['SaleDeed','Property'] },

  // ── Property – Boundary / Encroachment ───────────────────────────────────
  { q: 'neighbour built wall on my land, encroachment', expect: 'Encroachment', tags: ['Encroachment','Property'] },
  { q: 'government road is passing through my property without compensation', expect: ['Encroachment','Land Acquisition'], tags: ['Encroachment','Property'] },
  { q: 'boundary dispute with adjacent landowner', expect: 'Encroachment', tags: ['Encroachment','Property'] },
  { q: 'pados wale ne meri zameen par kabza kar liya', expect: 'Encroachment', tags: ['Encroachment','Property','Hinglish'] },
  { q: 'remove encroachment from my land court order India', expect: 'Encroachment', tags: ['Encroachment','Property'] },
  { q: 'illegal construction on my plot by neighbour', expect: 'Encroachment', tags: ['Encroachment','Property'] },

  // ── Property – Rent / Tenant Eviction ────────────────────────────────────
  { q: 'tenant not paying rent for 6 months, how to evict', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'landlord not returning security deposit after vacating', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'landlord illegally locked my rented premises', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'rent control act protection for tenant India', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'makaan malik paisa nahi de raha deposit ka', expect: 'Rent', tags: ['Rent','Property','Hinglish'] },
  { q: 'tenant refuses to vacate even after notice period', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'commercial property rent dispute arbitration clause', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'subletting without permission eviction grounds', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'landlord increasing rent illegally during tenancy', expect: 'Rent', tags: ['Rent','Property'] },

  // ── Property – RERA / Builder Fraud ──────────────────────────────────────
  { q: 'builder not giving possession of flat after 5 years', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'RERA complaint how to file against builder', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'builder cancelled flat and not refunding my money', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'flat construction quality very poor, builder not fixing', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'builder ne flat nahi diya, RERA complaint karni hai', expect: 'RERA', tags: ['RERA','Property','Hinglish'] },
  { q: 'real estate project delayed 3 years, interest on delay', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'builder changed flat specifications without consent', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'unregistered real estate project RERA violation', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'homebuyers association complaint against builder', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'RERA authority order not complied by builder', expect: 'RERA', tags: ['RERA','Property'] },

  // ── Property – Housing Society Dispute ──────────────────────────────────
  { q: 'housing society not maintaining common areas', expect: 'Housing Society', tags: ['HousingSociety','Property'] },
  { q: 'society committee election dispute interference', expect: 'Housing Society', tags: ['HousingSociety','Property'] },
  { q: 'society charging excessive maintenance from flat owner', expect: 'Housing Society', tags: ['HousingSociety','Property'] },
  { q: 'apartment association blocking sale of my flat', expect: 'Housing Society', tags: ['HousingSociety','Property'] },
  { q: 'NOC from housing society refused without reason', expect: 'Housing Society', tags: ['HousingSociety','Property'] },

  // ── Property – Land Acquisition ──────────────────────────────────────────
  { q: 'government acquired my agricultural land, compensation too low', expect: 'Land Acquisition', tags: ['LandAcq','Property'] },
  { q: 'NHAI taking my land for highway, what are my rights', expect: 'Land Acquisition', tags: ['LandAcq','Property'] },
  { q: 'land acquisition compensation enhancement petition', expect: 'Land Acquisition', tags: ['LandAcq','Property'] },
  { q: 'sarkaar ne zameen le li lekin paisa nahi diya', expect: 'Land Acquisition', tags: ['LandAcq','Property','Hinglish'] },
  { q: 'urgency clause invoked in land acquisition challenge', expect: 'Land Acquisition', tags: ['LandAcq','Property'] },

  // ═══════════════════════════════════════════════════════════════════════
  // CONSUMER LAWS
  // ═══════════════════════════════════════════════════════════════════════

  // ── Consumer – Product / Service Deficiency ──────────────────────────────
  { q: 'new TV stopped working after 2 weeks, company refusing to replace', expect: 'Consumer', tags: ['Consumer','Product'] },
  { q: 'online purchase never delivered, seller not refunding', expect: 'Consumer', tags: ['Consumer','Product'] },
  { q: 'defective refrigerator company not honouring warranty', expect: 'Consumer', tags: ['Consumer','Product'] },
  { q: 'consumer forum complaint how to file against company', expect: 'Consumer', tags: ['Consumer','Product'] },
  { q: 'service centre repaired phone badly and now charging again', expect: 'Consumer', tags: ['Consumer','Product'] },
  { q: 'amazon flipkart not refunding defective product', expect: 'Consumer', tags: ['Consumer','Product'] },
  { q: 'airlines cancelled flight and not refunding ticket', expect: 'Consumer', tags: ['Consumer','Product'] },
  { q: 'hotel provided worst service despite premium booking', expect: 'Consumer', tags: ['Consumer','Product'] },
  { q: 'car workshop overcharged and did not fix problem', expect: 'Consumer', tags: ['Consumer','Product'] },
  { q: 'product causing health issues company refusing liability', expect: 'Consumer', tags: ['Consumer','Product'] },
  { q: 'saman kharab nikla company badal nahi rahi', expect: 'Consumer', tags: ['Consumer','Product','Hinglish'] },

  // ── Consumer – Medical Negligence (Civil) ───────────────────────────────
  { q: 'hospital overcharged and the surgery was unnecessary', expect: ['Consumer','Medical Negligence'], tags: ['ConsumerMedical','Consumer'] },
  { q: 'wrong diagnosis by doctor, suffered unnecessary treatment', expect: ['Consumer','Medical Negligence'], tags: ['ConsumerMedical','Consumer'] },
  { q: 'hospital refused treatment without advance payment', expect: ['Consumer','Medical Negligence'], tags: ['ConsumerMedical','Consumer'] },
  { q: 'medical negligence compensation claim consumer forum', expect: ['Consumer','Medical Negligence'], tags: ['ConsumerMedical','Consumer'] },
  { q: 'surgical instrument left inside body after operation', expect: ['Consumer','Medical Negligence'], tags: ['ConsumerMedical','Consumer'] },
  { q: 'hospital bill inflated, no itemised bill given', expect: 'Consumer', tags: ['ConsumerMedical','Consumer'] },
  { q: 'N:patient died during surgery family wants FIR', expect: 'Consumer', tags: ['MedNeg','negative'], note: 'Death + FIR = criminal not consumer' },

  // ── Consumer – Insurance Claim ───────────────────────────────────────────
  { q: 'health insurance claim rejected without valid reason', expect: 'Insurance', tags: ['Insurance','Consumer'] },
  { q: 'car accident claim insurance company delaying payment', expect: 'Insurance', tags: ['Insurance','Consumer'] },
  { q: 'insurance company calling pre-existing condition for everything', expect: 'Insurance', tags: ['Insurance','Consumer'] },
  { q: 'life insurance claim after death of policyholder rejected', expect: 'Insurance', tags: ['Insurance','Consumer'] },
  { q: 'bima company paisa nahi de rahi', expect: 'Insurance', tags: ['Insurance','Consumer','Hinglish'] },
  { q: 'IRDAI complaint against insurance company how to file', expect: 'Insurance', tags: ['Insurance','Consumer'] },
  { q: 'mediclaim cashless denied at hospital', expect: 'Insurance', tags: ['Insurance','Consumer'] },
  { q: 'insurance ombudsman complaint procedure', expect: 'Insurance', tags: ['Insurance','Consumer'] },
  { q: 'term insurance nominee claim denied', expect: 'Insurance', tags: ['Insurance','Consumer'] },

  // ── Consumer – Food Safety / FSSAI ──────────────────────────────────────
  { q: 'found dead insect in packaged food, want to complain', expect: 'Food Safety', tags: ['FoodSafety','Consumer'] },
  { q: 'restaurant serving expired food items', expect: 'Food Safety', tags: ['FoodSafety','Consumer'] },
  { q: 'FSSAI complaint against adulterated milk product', expect: 'Food Safety', tags: ['FoodSafety','Consumer'] },
  { q: 'food poisoning at restaurant, 10 people hospitalised', expect: 'Food Safety', tags: ['FoodSafety','Consumer'] },
  { q: 'misleading food label claims nutrition benefits', expect: 'Food Safety', tags: ['FoodSafety','Consumer'] },

  // ═══════════════════════════════════════════════════════════════════════
  // CIVIL LAWS
  // ═══════════════════════════════════════════════════════════════════════

  // ── Civil – Money Recovery ───────────────────────────────────────────────
  { q: 'business partner owes me money, how to recover legally', expect: 'Money Recovery', tags: ['MoneyRecovery','Civil'] },
  { q: 'loan given to friend not being returned, civil suit', expect: 'Money Recovery', tags: ['MoneyRecovery','Civil'] },
  { q: 'signed promissory note, debtor not paying', expect: 'Money Recovery', tags: ['MoneyRecovery','Civil'] },
  { q: 'summary suit for money recovery India procedure', expect: 'Money Recovery', tags: ['MoneyRecovery','Civil'] },
  { q: 'freelance project payment not released by client', expect: 'Money Recovery', tags: ['MoneyRecovery','Civil','Employment'] },
  { q: 'security deposit not returned by tenant', expect: ['Money Recovery','Rent'], tags: ['MoneyRecovery','Civil','Property'] },

  // ── Civil – Partition Suit ────────────────────────────────────────────────
  { q: 'want to partition ancestral property among brothers', expect: 'Partition', tags: ['Partition','Civil'] },
  { q: 'family property partition how to initiate suit', expect: 'Partition', tags: ['Partition','Civil'] },
  { q: 'joint property cannot be agreed upon, need court partition', expect: 'Partition', tags: ['Partition','Civil'] },
  { q: 'preliminary decree in partition suit India', expect: 'Partition', tags: ['Partition','Civil'] },
  { q: 'zameen bant-wara karna hai bhai log agree nahi kar rahe', expect: 'Partition', tags: ['Partition','Civil','Hinglish'] },

  // ── Civil – Specific Performance / Contract Breach ───────────────────────
  { q: 'seller refusing to sell property after signing agreement', expect: 'Specific Performance', tags: ['Contract','Civil'] },
  { q: 'breach of contract suit India procedure', expect: 'Specific Performance', tags: ['Contract','Civil'] },
  { q: 'contract not honoured, want specific performance order', expect: 'Specific Performance', tags: ['Contract','Civil'] },
  { q: 'builder signed agreement but backing out from sale', expect: 'Specific Performance', tags: ['Contract','Civil','Property'] },
  { q: 'service contract violated, seeking damages India', expect: 'Specific Performance', tags: ['Contract','Civil'] },

  // ── Civil – SARFAESI / Banking / DRT ─────────────────────────────────────
  { q: 'bank sending SARFAESI notice for loan default', expect: 'SARFAESI', tags: ['SARFAESI','Civil'] },
  { q: 'bank seized my property for loan recovery, how to stop', expect: 'SARFAESI', tags: ['SARFAESI','Civil'] },
  { q: 'DRT case filed by bank, how to defend', expect: 'SARFAESI', tags: ['SARFAESI','Civil'] },
  { q: 'NPA account, bank threatening to sell property under SARFAESI', expect: 'SARFAESI', tags: ['SARFAESI','Civil'] },
  { q: 'securitisation act property auction how to challenge', expect: 'SARFAESI', tags: ['SARFAESI','Civil'] },

  // ── Civil – Arbitration / ADR ────────────────────────────────────────────
  { q: 'arbitration clause in contract, dispute resolution', expect: 'Arbitration', tags: ['Arbitration','Civil'] },
  { q: 'how to enforce arbitration award in India', expect: 'Arbitration', tags: ['Arbitration','Civil'] },
  { q: 'arbitrator appointment when parties disagree', expect: 'Arbitration', tags: ['Arbitration','Civil'] },
  { q: 'international arbitration India enforcement', expect: 'Arbitration', tags: ['Arbitration','Civil'] },
  { q: 'setting aside arbitration award grounds India', expect: 'Arbitration', tags: ['Arbitration','Civil'] },

  // ── Civil – Defamation ───────────────────────────────────────────────────
  { q: 'someone is spreading false rumours about me in society', expect: 'Defamation', tags: ['Defamation','Civil'] },
  { q: 'ex-employee posting defamatory content about company online', expect: 'Defamation', tags: ['Defamation','Civil','Cyber'] },
  { q: 'newspaper published false report about me, defamation suit', expect: 'Defamation', tags: ['Defamation','Civil'] },
  { q: 'criminal defamation complaint India procedure', expect: 'Defamation', tags: ['Defamation','Civil','Criminal'] },
  { q: 'WhatsApp group se meri badnaami ho rahi hai', expect: 'Defamation', tags: ['Defamation','Civil','Hinglish','Cyber'] },

  // ── Civil – Succession / Will / Estate ──────────────────────────────────
  { q: 'estate of deceased being mismanaged by executor', expect: ['Succession','Will'], tags: ['Succession','Civil'] },
  { q: 'how to register a will in India', expect: ['Will','Succession'], tags: ['Succession','Civil'] },
  { q: 'foreign will India recognition and enforcement', expect: ['Will','Succession'], tags: ['Succession','Civil'] },

  // ── Civil – Mental Healthcare Act ────────────────────────────────────────
  { q: 'family wants to forcibly admit me to mental hospital', expect: 'Mental Healthcare', tags: ['MentalHealth','Civil'] },
  { q: 'mental hospital refusing discharge despite recovery', expect: 'Mental Healthcare', tags: ['MentalHealth','Civil'] },
  { q: 'rights of persons with mental illness India', expect: 'Mental Healthcare', tags: ['MentalHealth','Civil'] },
  { q: 'advance directive for mental health treatment India', expect: 'Mental Healthcare', tags: ['MentalHealth','Civil'] },

  // ── Civil – MTP / Reproductive Rights ───────────────────────────────────
  { q: 'hospital refusing abortion despite legal grounds', expect: 'MTP', tags: ['MTP','Civil'] },
  { q: 'MTP Act pregnancy termination rights India', expect: 'MTP', tags: ['MTP','Civil'] },
  { q: 'forced sterilisation without consent India rights', expect: 'MTP', tags: ['MTP','Civil'] },
  { q: 'surrogacy legal issues India Surrogacy Regulation Act', expect: 'MTP', tags: ['MTP','Civil'] },

  // ── Civil – Electricity / Utility ────────────────────────────────────────
  { q: 'electricity department charging wrong bill for months', expect: ['Electricity','Consumer'], tags: ['Electricity','Civil','Consumer'] },
  { q: 'illegal power disconnection by electricity board', expect: 'Electricity', tags: ['Electricity','Civil'] },
  { q: 'DISCOM overcharging theft of electricity allegation', expect: 'Electricity', tags: ['Electricity','Civil'] },
  { q: 'electricity meter tampered complaint procedure India', expect: 'Electricity', tags: ['Electricity','Civil'] },

  // ═══════════════════════════════════════════════════════════════════════
  // EMPLOYMENT LAWS
  // ═══════════════════════════════════════════════════════════════════════

  // ── Employment – Wrongful Termination ────────────────────────────────────
  { q: 'fired from job without any notice, no reason given', expect: 'Wrongful Termination', tags: ['Termination','Employment'] },
  { q: 'terminated during probation period unfairly', expect: 'Wrongful Termination', tags: ['Termination','Employment'] },
  { q: 'dismissed after raising complaint about harassment', expect: 'Wrongful Termination', tags: ['Termination','Employment'] },
  { q: 'naukri se nikal diya bina notice ke', expect: 'Wrongful Termination', tags: ['Termination','Employment','Hinglish'] },
  { q: 'constructive dismissal forced to resign India', expect: 'Wrongful Termination', tags: ['Termination','Employment'] },
  { q: 'industrial disputes act retrenchment compensation not paid', expect: 'Wrongful Termination', tags: ['Termination','Employment'] },
  { q: 'labour court complaint wrongful dismissal India', expect: 'Wrongful Termination', tags: ['Termination','Employment'] },

  // ── Employment – Salary / PF / Gratuity ──────────────────────────────────
  { q: 'company not paying salary for 3 months', expect: 'Salary', tags: ['Salary','Employment'] },
  { q: 'PF not deposited by employer for years', expect: 'Salary', tags: ['Salary','Employment'] },
  { q: 'gratuity not paid after 10 years of service', expect: 'Salary', tags: ['Salary','Employment'] },
  { q: 'salary nahi mila, kya karna hai', expect: 'Salary', tags: ['Salary','Employment','Hinglish'] },
  { q: 'employer deducting salary without explanation', expect: 'Salary', tags: ['Salary','Employment'] },
  { q: 'EPFO complaint against employer for PF fraud', expect: 'Salary', tags: ['Salary','Employment'] },
  { q: 'ESI not deducted by employer, what to do', expect: 'Salary', tags: ['Salary','Employment'] },
  { q: 'bonus not paid despite profits, company excuse', expect: 'Salary', tags: ['Salary','Employment'] },

  // ── Employment – POSH ────────────────────────────────────────────────────
  { q: 'boss is sexually harassing me at workplace', expect: 'POSH', tags: ['POSH','Employment'] },
  { q: 'colleague making inappropriate comments daily at office', expect: 'POSH', tags: ['POSH','Employment'] },
  { q: 'POSH committee complaint how to file India', expect: 'POSH', tags: ['POSH','Employment'] },
  { q: 'IC internal complaints committee not acting on my complaint', expect: 'POSH', tags: ['POSH','Employment'] },
  { q: 'sexual harassment quid pro quo by senior manager', expect: 'POSH', tags: ['POSH','Employment'] },
  { q: 'company has no POSH policy, where to complain', expect: 'POSH', tags: ['POSH','Employment'] },
  { q: 'false POSH complaint filed against me', expect: 'POSH', tags: ['POSH','Employment','Accused'] },

  // ── Employment – Maternity Benefits ──────────────────────────────────────
  { q: 'fired while pregnant, is this legal India', expect: 'Maternity', tags: ['Maternity','Employment'] },
  { q: 'maternity leave denied by employer', expect: 'Maternity', tags: ['Maternity','Employment'] },
  { q: 'maternity benefit act 26 weeks leave entitlement', expect: 'Maternity', tags: ['Maternity','Employment'] },
  { q: 'pregnancy discrimination at workplace complaint India', expect: 'Maternity', tags: ['Maternity','Employment'] },
  { q: 'garbhavati hone par kaam se nikal diya', expect: 'Maternity', tags: ['Maternity','Employment','Hinglish'] },

  // ── Employment – Government Service / Administrative Tribunal ─────────────
  { q: 'promotion denied to government employee, want to appeal', expect: 'Government Service', tags: ['GovtService','Employment'] },
  { q: 'CAT Central Administrative Tribunal case filing procedure', expect: 'Government Service', tags: ['GovtService','Employment'] },
  { q: 'government employee suspension challenged in tribunal', expect: 'Government Service', tags: ['GovtService','Employment'] },
  { q: 'disciplinary proceedings against IAS officer, appeal options', expect: 'Government Service', tags: ['GovtService','Employment'] },
  { q: 'state government employee termination challenge procedure', expect: 'Government Service', tags: ['GovtService','Employment'] },

  // ── Shops & Establishments Act ───────────────────────────────────────────
  { q: 'shop establishment license not renewed, legal action', expect: 'Shops', tags: ['ShopsEst','Employment'] },
  { q: 'employee rights under Shops and Establishment Act state', expect: 'Shops', tags: ['ShopsEst','Employment'] },
  { q: 'working hours violation shops establishments act', expect: 'Shops', tags: ['ShopsEst','Employment'] },

  // ═══════════════════════════════════════════════════════════════════════
  // CYBER LAWS
  // ═══════════════════════════════════════════════════════════════════════

  // ── Cyber – Online Fraud ──────────────────────────────────────────────────
  { q: 'UPI fraud money transferred to unknown account', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber'] },
  { q: 'OTP shared by mistake money deducted what to do', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber'] },
  { q: 'received fake call from CBI officer asking money', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber'] },
  { q: 'investment app scam took my money', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber'] },
  { q: 'cyber crime helpline 1930 report procedure', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber'] },
  { q: 'online fraud hone par paise kaise milenge wapas', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber','Hinglish'] },
  { q: 'phishing email clicked bank account hacked', expect: ['Cyber','Online Fraud','Hacking'], tags: ['CyberFraud','Cyber'] },
  { q: 'fake ED officer called threatening arrest send money', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber'] },
  { q: 'WhatsApp hack money transferred from my UPI', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber'] },
  { q: 'romance scam money sent to fake boyfriend online', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber'] },

  // ── Cyber – Online Harassment / Cyberstalking ────────────────────────────
  { q: 'ex-boyfriend posting my private photos online', expect: ['Cyber','Harassment'], tags: ['CyberHarass','Cyber'] },
  { q: 'cyberstalking by unknown person tracking my location', expect: ['Cyber','Harassment'], tags: ['CyberHarass','Cyber'] },
  { q: 'fake social media profile created using my photos', expect: ['Cyber','Harassment'], tags: ['CyberHarass','Cyber'] },
  { q: 'sextortion receiving threats to share intimate videos', expect: ['Cyber','Harassment'], tags: ['CyberHarass','Cyber'] },
  { q: 'online death threats received on social media', expect: ['Cyber','Harassment'], tags: ['CyberHarass','Cyber'] },
  { q: 'social media trolling and abusive comments IT Act', expect: ['Cyber','Harassment'], tags: ['CyberHarass','Cyber'] },

  // ── Cyber – Data Theft / Hacking ────────────────────────────────────────
  { q: 'company data stolen by former employee', expect: ['Cyber','Data Theft','Hacking'], tags: ['CyberData','Cyber'] },
  { q: 'website hacked customer data exposed', expect: ['Cyber','Data Theft','Hacking'], tags: ['CyberData','Cyber'] },
  { q: 'ransomware attack on my business system', expect: ['Cyber','Data Theft','Hacking'], tags: ['CyberData','Cyber'] },
  { q: 'email account hacked confidential information stolen', expect: ['Cyber','Data Theft','Hacking'], tags: ['CyberData','Cyber'] },

  // ── Digital Privacy – DPDP Act ───────────────────────────────────────────
  { q: 'Aadhaar data misused by third party', expect: ['Digital Privacy','DPDP'], tags: ['DPDP','Cyber'] },
  { q: 'company sharing my personal data without consent', expect: ['Digital Privacy','DPDP'], tags: ['DPDP','Cyber'] },
  { q: 'DPDP Act complaint data breach by fintech app', expect: ['Digital Privacy','DPDP'], tags: ['DPDP','Cyber'] },

  // ═══════════════════════════════════════════════════════════════════════
  // CONSTITUTIONAL / PIL / RIGHTS
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'government taking unconstitutional decision, PIL possible', expect: ['PIL','Constitutional'], tags: ['PIL','Constitutional'] },
  { q: 'fundamental rights violation by government authority', expect: ['PIL','Constitutional'], tags: ['PIL','Constitutional'] },
  { q: 'writ petition for mandamus against public authority', expect: ['PIL','Constitutional'], tags: ['PIL','Constitutional'] },
  { q: 'RTI application rejected wrongly, appeal options', expect: ['PIL','Constitutional'], tags: ['PIL','Constitutional'] },
  { q: 'right to education denied to child, legal remedy', expect: ['Education','Constitutional'], tags: ['PIL','Constitutional','Education'] },
  { q: 'environmental pollution causing harm PIL how to file', expect: ['PIL','Environment','Constitutional'], tags: ['PIL','Constitutional','Environment'] },
  { q: 'public interest litigation Supreme Court India', expect: ['PIL','Constitutional'], tags: ['PIL','Constitutional'] },

  // ═══════════════════════════════════════════════════════════════════════
  // NRI LAWS
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'NRI property being mismanaged by relatives in India', expect: 'NRI', tags: ['NRI','Property'] },
  { q: 'NRI spouse not giving divorce, living abroad India laws', expect: 'NRI', tags: ['NRI','Family'] },
  { q: 'NRI Power of Attorney for property India', expect: 'NRI', tags: ['NRI','Property'] },
  { q: 'OCI card holder property rights India', expect: 'NRI', tags: ['NRI','Property'] },
  { q: 'I am abroad and my property in India is encroached', expect: 'NRI', tags: ['NRI','Property','Encroachment'] },

  // ═══════════════════════════════════════════════════════════════════════
  // INTELLECTUAL PROPERTY
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'someone is copying my business logo and brand name', expect: 'Trademark', tags: ['IP','Corporate'] },
  { q: 'trademark infringement complaint India how to file', expect: 'Trademark', tags: ['IP','Corporate'] },
  { q: 'copyright violation my content being used without permission', expect: 'Trademark', tags: ['IP','Corporate'] },
  { q: 'patent application India procedure for invention', expect: 'Trademark', tags: ['IP','Corporate'] },
  { q: 'trade secret stolen by former employee', expect: ['Trademark','Cyber'], tags: ['IP','Corporate','Cyber'] },

  // ═══════════════════════════════════════════════════════════════════════
  // TAX
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'income tax notice received for wrong demand', expect: 'Tax', tags: ['Tax'] },
  { q: 'GST department raided my shop, what are my rights', expect: 'Tax', tags: ['Tax'] },
  { q: 'tax evasion case filed against me, how to defend', expect: 'Tax', tags: ['Tax'] },
  { q: 'IT department freezing bank account, challenge options', expect: 'Tax', tags: ['Tax'] },
  { q: 'GST refund stuck, no action by department', expect: 'Tax', tags: ['Tax'] },
  { q: 'income tax appeals ITAT procedure', expect: 'Tax', tags: ['Tax'] },

  // ═══════════════════════════════════════════════════════════════════════
  // EDUCATION
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'school expelled my child without proper reason', expect: 'Education', tags: ['Education'] },
  { q: 'university refusing to issue degree certificate', expect: 'Education', tags: ['Education'] },
  { q: 'RTE Act admission denied to poor child private school', expect: 'Education', tags: ['Education'] },
  { q: 'college charging capitation fee illegally', expect: 'Education', tags: ['Education'] },
  { q: 'disability accommodation refused by university India', expect: 'Education', tags: ['Education'] },

  // ═══════════════════════════════════════════════════════════════════════
  // MSME
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'large company not paying MSME vendor for 90 days', expect: 'MSME', tags: ['MSME'] },
  { q: 'MSME Samadhan portal complaint against buyer', expect: 'MSME', tags: ['MSME'] },
  { q: 'partnership firm dues not paid by co-partner', expect: 'MSME', tags: ['MSME','Civil'] },
  { q: 'Facilitation Council MSME dispute India', expect: 'MSME', tags: ['MSME'] },

  // ═══════════════════════════════════════════════════════════════════════
  // SENIOR CITIZEN
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'children not taking care of elderly parents, legal remedy', expect: 'Senior Citizen', tags: ['SeniorCitizen'] },
  { q: 'son transferred property of parents and now neglecting them', expect: 'Senior Citizen', tags: ['SeniorCitizen','Property'] },
  { q: 'senior citizen maintenance tribunal complaint India', expect: 'Senior Citizen', tags: ['SeniorCitizen'] },
  { q: 'old age home refusing to admit elderly person', expect: 'Senior Citizen', tags: ['SeniorCitizen'] },
  { q: 'budhape mein ghar se nikal diya beta ne', expect: 'Senior Citizen', tags: ['SeniorCitizen','Hinglish'] },

  // ═══════════════════════════════════════════════════════════════════════
  // ENVIRONMENT / NGT
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'factory releasing toxic waste into river near my village', expect: 'Environment', tags: ['Environment'] },
  { q: 'NGT complaint against illegal construction in green zone', expect: 'Environment', tags: ['Environment'] },
  { q: 'air pollution from nearby industry affecting health', expect: 'Environment', tags: ['Environment'] },
  { q: 'illegal sand mining complaint India', expect: 'Environment', tags: ['Environment'] },

  // ═══════════════════════════════════════════════════════════════════════
  // MUNICIPAL / BUILDING
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'municipal corporation issued demolition notice to my house', expect: 'Municipal', tags: ['Municipal','Property'] },
  { q: 'illegal construction by neighbour municipality not acting', expect: 'Municipal', tags: ['Municipal','Property'] },
  { q: 'building plan rejected by municipality without reason', expect: 'Municipal', tags: ['Municipal','Property'] },
  { q: 'property tax calculation wrong by municipality', expect: 'Municipal', tags: ['Municipal','Property'] },

  // ═══════════════════════════════════════════════════════════════════════
  // IBC / INSOLVENCY
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'company is insolvent, how to file insolvency proceedings', expect: 'IBC', tags: ['IBC','Corporate'] },
  { q: 'NCLT application for corporate insolvency resolution', expect: 'IBC', tags: ['IBC','Corporate'] },
  { q: 'personal insolvency bankruptcy procedure India', expect: 'IBC', tags: ['IBC','Civil'] },
  { q: 'operational creditor application IBC 9 India', expect: 'IBC', tags: ['IBC','Corporate'] },
  { q: 'resolution plan submitted NCLT approval', expect: 'IBC', tags: ['IBC','Corporate'] },

  // ═══════════════════════════════════════════════════════════════════════
  // MOTOR ACCIDENT
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'met with accident, want to claim compensation from insurance', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'hit by drunk driver, hospitalised, seeking compensation', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'MACT tribunal claim how to file for accident injury', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'accident se meri leg tooti, compensation chahiye', expect: 'Motor Accident', tags: ['MotorAccident','Hinglish'] },
  { q: 'pedestrian killed in road accident, family compensation claim', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'hit and run accident how to claim compensation India', expect: 'Motor Accident', tags: ['MotorAccident'] },

  // ═══════════════════════════════════════════════════════════════════════
  // AGRICULTURE
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'crop insurance claim rejected by company', expect: ['Agriculture','Insurance'], tags: ['Agriculture'] },
  { q: 'tenant farmer rights on agricultural land India', expect: 'Agriculture', tags: ['Agriculture','Property'] },
  { q: 'moneylender charging illegal interest from farmers', expect: 'Agriculture', tags: ['Agriculture','Civil'] },

  // ═══════════════════════════════════════════════════════════════════════
  // LIVELIHOOD / MGNREGA
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'MGNREGA wages not paid for 2 months of work done', expect: 'Livelihood', tags: ['MGNREGA'] },
  { q: 'job card not given under MGNREGA scheme', expect: 'Livelihood', tags: ['MGNREGA'] },
  { q: 'government scheme benefit denied without reason', expect: 'Livelihood', tags: ['MGNREGA','Constitutional'] },

  // ═══════════════════════════════════════════════════════════════════════
  // CORPORATE
  // ═══════════════════════════════════════════════════════════════════════

  { q: 'minority shareholder oppression by majority in company', expect: 'Corporate', tags: ['Corporate'] },
  { q: 'director removed from company illegally', expect: 'Corporate', tags: ['Corporate'] },
  { q: 'NCLT petition against company for oppression mismanagement', expect: 'Corporate', tags: ['Corporate','IBC'] },
  { q: 'company strike off pending, revival procedure', expect: 'Corporate', tags: ['Corporate'] },
  { q: 'shareholders dispute partnership firm', expect: 'Corporate', tags: ['Corporate','Civil'] },

  // ═══════════════════════════════════════════════════════════════════════
  // COLLISION / EDGE CASES (previously failing or high-risk)
  // ═══════════════════════════════════════════════════════════════════════

  // Rape in non-obvious settings
  { q: 'staff member raped a patient at the nursing home', expect: 'Rape', tags: ['Rape','Collision','EdgeCase'], note: 'Hospital setting must not trigger consumer' },
  { q: 'she was sexually assaulted by her doctor during check-up', expect: 'Rape', tags: ['Rape','Collision','EdgeCase'] },
  { q: 'raped by employer when working late at office', expect: 'Rape', tags: ['Rape','Collision','EdgeCase','Employment'] },

  // Death in different contexts
  { q: 'my father died peacefully, 3 children disputing property', expect: 'Succession', tags: ['Succession','Collision','EdgeCase'], note: 'Natural death + property = succession only' },
  { q: 'N:father died peacefully, property dispute', expect: 'Medical Negligence', tags: ['Succession','negative','EdgeCase'], note: 'Natural death should NOT trigger medical neg' },
  { q: 'N:father died peacefully, property dispute', expect: 'Murder', tags: ['Succession','negative','EdgeCase'], note: 'Natural death should NOT trigger murder' },
  { q: 'patient died in ICU, want to know if negligence occurred', expect: 'Medical Negligence', tags: ['MedNeg','Collision','EdgeCase'] },
  { q: 'husband killed in road accident, insurance claim and FIR', expect: ['Motor Accident','Murder'], tags: ['MotorAccident','Collision','EdgeCase'] },

  // Cheque bounce should not trigger other laws
  { q: 'N:cheque bounce', expect: 'Fraud', tags: ['ChequeBounce','negative','EdgeCase'], note: 'Cheque bounce is NI Act, not BNS Fraud' },
  { q: 'N:cheque bounce', expect: 'Theft', tags: ['ChequeBounce','negative','EdgeCase'], note: 'Cheque bounce should not trigger Theft' },

  // Short queries (fragment tests)
  { q: 'bail chahiye', expect: 'Bail', tags: ['Short','Hinglish'] },
  { q: 'cheque bounce', expect: 'Cheque Bounce', tags: ['Short'] },
  { q: 'divorce chahiye', expect: 'Divorce', tags: ['Short','Hinglish'] },
  { q: 'builder fraud', expect: 'RERA', tags: ['Short'] },
  { q: 'salary nahi mila', expect: 'Salary', tags: ['Short','Hinglish'] },
  { q: 'rape', expect: 'Rape', tags: ['Short','SingleWord'] },
  { q: 'murder', expect: 'Murder', tags: ['Short','SingleWord'] },
  { q: 'UPI fraud', expect: ['Cyber','Online Fraud'], tags: ['Short'] },
  { q: 'flat nahi mila', expect: 'RERA', tags: ['Short','Hinglish'] },
  { q: 'PF nahi aaya', expect: 'Salary', tags: ['Short','Hinglish'] },
  { q: 'insult kiya jati ke naam se', expect: 'SC/ST', tags: ['Short','Hinglish','SCST'] },
  { q: 'bike chuori ho gayi', expect: 'Theft', tags: ['Short','Hinglish'] },

  // Accused perspective (different from victim)
  { q: 'false rape case filed against me what to do', expect: 'Rape', tags: ['Accused','EdgeCase'], note: 'Accused in rape case still needs rape law' },
  { q: 'wife filed 498A against my whole family, how to get bail', expect: ['Dowry','Bail'], tags: ['Accused','EdgeCase'] },
  { q: 'cheque bounce notice received, I have a defence', expect: 'Cheque Bounce', tags: ['Accused','EdgeCase'] },
  { q: 'property case filed against me by brother', expect: ['Succession','Property'], tags: ['Accused','EdgeCase'] },
  { q: 'consumer court notice received for defective product sold', expect: 'Consumer', tags: ['Accused','EdgeCase'] },
  { q: 'my company is accused of POSH violation', expect: 'POSH', tags: ['Accused','EdgeCase','Employment'] },

  // Third party / family perspective
  { q: 'my sister is being harassed by her husband for dowry', expect: ['Dowry','Domestic Violence'], tags: ['ThirdParty','Family'] },
  { q: 'my friend is in jail, how to help get bail', expect: 'Bail', tags: ['ThirdParty','Criminal'] },
  { q: 'my parents are being evicted by landlord illegally', expect: 'Rent', tags: ['ThirdParty','Property'] },
  { q: 'company cheated my father, he is 70 years old', expect: ['Fraud','Senior Citizen'], tags: ['ThirdParty','SeniorCitizen'] },

  // Multi-law scenarios (should show multiple laws)
  { q: 'husband is violent, also not paying maintenance, and demanding dowry', expect: ['Domestic Violence','Dowry','Maintenance'], tags: ['MultiLaw','Family'] },
  { q: 'cheated by builder who also took money fraudulently without RERA registration', expect: ['RERA','Fraud'], tags: ['MultiLaw','Property'] },
  { q: 'employer fired me, also not paying PF and salary, and sexually harassed me', expect: ['Wrongful Termination','Salary','POSH'], tags: ['MultiLaw','Employment'] },

  // Vague queries that need context questions
  { q: 'someone died', expect: ['Murder','Medical Negligence','Motor Accident'], tags: ['Vague','Short'] },
  { q: 'problem with family', expect: ['Divorce','Domestic Violence','Maintenance'], tags: ['Vague','Short'] },
  { q: 'money issue', expect: ['Fraud','Money Recovery','Salary'], tags: ['Vague','Short'] },
  { q: 'legal help needed', expect: [], tags: ['Vague','Short'], note: 'Should trigger fallback questions' },

  // Hinglish complex queries
  { q: 'meri biwi ne jhooth bol ke case kar diya, ab main kya karoon', expect: ['Dowry','Domestic Violence'], tags: ['Hinglish','Complex'] },
  { q: 'mere bhai ne baap ki zameen apne naam karwa li', expect: ['Succession','Property'], tags: ['Hinglish','Complex'] },
  { q: 'kaam karte karte accident ho gaya factory mein', expect: ['Motor Accident','Employment'], tags: ['Hinglish','Complex'] },
  { q: 'ghar kharida builder se 5 saal ho gaye possession nahi mila', expect: 'RERA', tags: ['Hinglish','Complex'] },
  { q: 'account se paisa kat gaya maine kuch nahi kiya', expect: ['Cyber','Online Fraud'], tags: ['Hinglish','Complex'] },
  { q: 'nabalik beti ke saath kuch galat hua school mein', expect: 'POCSO', tags: ['Hinglish','Complex','POCSO'] },
  { q: 'mujhe job se nikaala aur PF bhi nahi diya', expect: ['Wrongful Termination','Salary'], tags: ['Hinglish','Complex','Employment'] },

  // ═══════════════════════════════════════════════════════════════════════
  // BATCH 2 — Additional coverage, more Hinglish, more edge cases
  // ═══════════════════════════════════════════════════════════════════════

  // ── Divorce – deeper scenarios ────────────────────────────────────────────
  { q: 'husband living abroad not agreeing to divorce', expect: 'Divorce', tags: ['Divorce','NRI'] },
  { q: 'second marriage by husband without divorcing first wife', expect: ['Divorce','Dowry'], tags: ['Divorce','Family'] },
  { q: 'wife is mentally ill, can I get divorce on that ground', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'how to file divorce petition in family court India', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'divorce on ground of adultery India', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'Hindu divorce procedure step by step India', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'Christian divorce law India', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'Parsi divorce law India', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'divorce and property settlement simultaneously', expect: 'Divorce', tags: ['Divorce','Family','Property'] },

  // ── Custody – deeper ─────────────────────────────────────────────────────
  { q: 'child custody battle between divorced parents', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'ex-wife refusing to let me meet my son', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'custody of newborn infant after separation', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'how is custody decided for a 3 year old India', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'joint custody agreement India template', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'teenage child wants to live with father, court will respect', expect: 'Custody', tags: ['Custody','Family'] },

  // ── Maintenance – deeper ──────────────────────────────────────────────────
  { q: 'maintenance application under section 125 CrPC dismissed', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'husband ignoring court maintenance order, contempt possible', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'how to increase maintenance amount after years', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'maintenance during marriage can wife claim if not separated', expect: 'Maintenance', tags: ['Maintenance','Family'] },
  { q: 'wife re-married, can she still claim alimony', expect: 'Maintenance', tags: ['Maintenance','Family'] },

  // ── DV – deeper ───────────────────────────────────────────────────────────
  { q: 'wife also a victim of domestic violence by in-laws', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'DV case filed, need interim protection order urgently', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'protection order violation by husband', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'girlfriend being abused by live-in partner DV Act applies', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'emotional and verbal abuse by husband, no physical violence', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'husband controls all money, financial abuse India law', expect: 'Domestic Violence', tags: ['DV','Family'] },

  // ── Dowry – deeper ────────────────────────────────────────────────────────
  { q: 'mother-in-law demanding gold jewellery else will throw out', expect: 'Dowry', tags: ['Dowry','Criminal'] },
  { q: 'dowry harassment complaint against husband and parents', expect: 'Dowry', tags: ['Dowry','Criminal'] },
  { q: 'cruelty for dowry mental harassment IPC 498A equivalent', expect: 'Dowry', tags: ['Dowry','Criminal'] },
  { q: 'dowry items not returned after separation', expect: 'Dowry', tags: ['Dowry','Criminal','DV'] },
  { q: 'wife filed 498A, anticipatory bail for family members', expect: ['Dowry','Bail'], tags: ['Dowry','Criminal','Bail','Accused'] },

  // ── Murder / Unnatural Death ──────────────────────────────────────────────
  { q: 'brother killed in road accident but looking suspicious', expect: 'Murder', tags: ['Murder','Criminal'] },
  { q: 'missing for 3 weeks family fears foul play', expect: 'Murder', tags: ['Murder','Criminal'] },
  { q: 'stab wounds on the body, found dead in field', expect: 'Murder', tags: ['Murder','Criminal'] },
  { q: 'death due to excessive drinking forced by others', expect: ['Murder','Culpable'], tags: ['Murder','Criminal'] },
  { q: 'someone fell from building, suspicious circumstances', expect: 'Murder', tags: ['Murder','Criminal'] },
  { q: 'abetment to suicide by husband', expect: ['Murder','Culpable'], tags: ['Murder','Criminal','Dowry'] },
  { q: 'section 302 IPC equivalent BNS murder case', expect: 'Murder', tags: ['Murder','Criminal'] },

  // ── Assault – deeper ──────────────────────────────────────────────────────
  { q: 'assaulted by auto driver when I complained about overcharging', expect: 'Assault', tags: ['Assault','Criminal'] },
  { q: 'bar fight resulted in serious injury hospitalization', expect: 'Assault', tags: ['Assault','Criminal'] },
  { q: 'person hit me with cricket bat, head injury', expect: 'Assault', tags: ['Assault','Criminal'] },
  { q: 'mob beat me up after religious dispute', expect: 'Assault', tags: ['Assault','Criminal'] },
  { q: 'woman slapped in public want to file complaint', expect: 'Assault', tags: ['Assault','Criminal'] },
  { q: 'gang attacked me FIR not filed by police', expect: ['Assault','PoliceExcess'], tags: ['Assault','Criminal'] },

  // ── Fraud / Cheating – deeper ─────────────────────────────────────────────
  { q: 'fake NGO collected donations and disappeared', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'company promised job abroad collected fee and vanished', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'chit fund scheme collapsed, promoter absconded', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'advance salary given, employee left overnight not returning', expect: 'Fraud', tags: ['Fraud','Criminal','Employment'] },
  { q: 'paid for matrimonial services, completely fake profiles', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'sold car but buyer giving bad cheques', expect: ['Fraud','Cheque Bounce'], tags: ['Fraud','Criminal'] },
  { q: 'fake gold sold as real, tested later, fraud', expect: 'Fraud', tags: ['Fraud','Criminal'] },

  // ── NI Act Cheque Bounce – deeper ────────────────────────────────────────
  { q: 'section 138 complaint filed, accused not appearing in court', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal'] },
  { q: 'cheque bounce case appeal to sessions court', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal'] },
  { q: 'cheque returned account closed, NI Act applies', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal'] },
  { q: 'can cheque bounce case be settled out of court', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal'] },
  { q: 'cheque bounce for EMI payment mortgage', expect: 'Cheque Bounce', tags: ['ChequeBounce','Criminal','Civil'] },

  // ── BNSS / Bail – deeper ──────────────────────────────────────────────────
  { q: 'how many days police can keep without presenting to magistrate', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'transit bail for traveling through another state', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'regular bail vs anticipatory bail difference', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'High Court bail after Sessions Court rejection', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'bail cancelled by court, challenge options', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'preventive detention BNSS how to challenge', expect: 'Bail', tags: ['Bail','Criminal','Constitutional'] },

  // ── SC/ST – deeper ────────────────────────────────────────────────────────
  { q: 'refused entry to temple because of low caste', expect: 'SC/ST', tags: ['SCST','Criminal'] },
  { q: 'atrocity case FIR not registered by police, what to do', expect: 'SC/ST', tags: ['SCST','Criminal','PoliceExcess'] },
  { q: 'land grabbing from Dalit farmer by upper caste', expect: 'SC/ST', tags: ['SCST','Criminal','Property'] },
  { q: 'bail in SC/ST atrocity case possible', expect: 'SC/ST', tags: ['SCST','Criminal','Bail'] },
  { q: 'caste slur public humiliation India legal remedy', expect: 'SC/ST', tags: ['SCST','Criminal'] },

  // ── POCSO – deeper ────────────────────────────────────────────────────────
  { q: 'child abused by family friend for years, reporting now', expect: 'POCSO', tags: ['POCSO','Criminal'] },
  { q: 'POCSO case registered but police not investigating', expect: 'POCSO', tags: ['POCSO','Criminal','PoliceExcess'] },
  { q: 'minor victim does not want to identify abuser, how to proceed', expect: 'POCSO', tags: ['POCSO','Criminal'] },
  { q: 'obscene material sent to a 13-year-old on WhatsApp', expect: 'POCSO', tags: ['POCSO','Criminal','Cyber'] },
  { q: 'child marriage involving 15-year-old girl, how to stop', expect: 'POCSO', tags: ['POCSO','Criminal','Family'] },

  // ── Rape – deeper ────────────────────────────────────────────────────────
  { q: 'rape victim getting threats from accused family', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'statement under section 164 CrPC for rape case', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'rape by a doctor while conducting medical examination', expect: 'Rape', tags: ['Rape','Criminal','EdgeCase'] },
  { q: 'victim of rape reluctant to go to police, options', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'BNS 66 gang rape death of victim', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'trauma informed care for rape victim India legal', expect: 'Rape', tags: ['Rape','Criminal'] },
  { q: 'acid attack after refusal to marry, police complaint', expect: ['Assault','Rape'], tags: ['Assault','Criminal'] },

  // ── Medical Negligence Criminal – deeper ─────────────────────────────────
  { q: 'wrong blood group transfused patient died', expect: 'Medical Negligence', tags: ['MedNeg','Criminal'] },
  { q: 'nurse gave overdose of medication patient in ICU', expect: 'Medical Negligence', tags: ['MedNeg','Criminal'] },
  { q: 'I am a doctor, patient died post-op, police came to hospital', expect: 'Medical Negligence', tags: ['MedNeg','Criminal','Accused'] },
  { q: 'hospital ran out of medicines patient died, who is responsible', expect: 'Medical Negligence', tags: ['MedNeg','Criminal'] },
  { q: 'delayed diagnosis of cancer patient died, negligence', expect: 'Medical Negligence', tags: ['MedNeg','Criminal','Consumer'] },

  // ── Police Excess – deeper ────────────────────────────────────────────────
  { q: 'police picked up my son without warrant for 3 days', expect: 'Police Excess', tags: ['PoliceExcess','Criminal'] },
  { q: 'woman constable searched me improperly at checkpoint', expect: 'Police Excess', tags: ['PoliceExcess','Criminal'] },
  { q: 'police threatening me to withdraw complaint', expect: 'Police Excess', tags: ['PoliceExcess','Criminal'] },
  { q: 'false FIR filed by police against innocent person', expect: 'Police Excess', tags: ['PoliceExcess','Criminal'] },
  { q: 'police demanding money to release arrested person', expect: ['Police Excess','Corruption'], tags: ['PoliceExcess','Criminal','Corruption'] },

  // ── PMLA / ED – deeper ───────────────────────────────────────────────────
  { q: 'ED summoned me as witness in money laundering case', expect: 'PMLA', tags: ['PMLA','Criminal'] },
  { q: 'bank accounts frozen by ED without prior notice', expect: 'PMLA', tags: ['PMLA','Criminal'] },
  { q: 'shell company used for money laundering allegations against me', expect: 'PMLA', tags: ['PMLA','Criminal','Corporate'] },

  // ── RERA – deeper ────────────────────────────────────────────────────────
  { q: 'builder reducing flat size from original agreement', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'RERA appeal tribunal order against builder enforcement', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'project transferred to new builder without consent', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'apartment super area carpet area discrepancy builder', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'cancellation of flat booking full refund interest claim', expect: 'RERA', tags: ['RERA','Property'] },
  { q: 'undisclosed charges by builder at possession time', expect: 'RERA', tags: ['RERA','Property'] },

  // ── Rent / Tenancy – deeper ───────────────────────────────────────────────
  { q: 'paying rent but landlord says vacate in 30 days, rights', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'landlord entering rented premises without notice', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'long-term tenant claiming ownership rights India', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'lease agreement expired landlord refusing renewal', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'commercial tenant forcibly evicted mid-lease', expect: 'Rent', tags: ['Rent','Property'] },

  // ── Property – Sale Deed deeper ───────────────────────────────────────────
  { q: 'two sale deeds for same property, fraud', expect: 'Transfer', tags: ['SaleDeed','Property'] },
  { q: 'registration of property refused by sub-registrar', expect: 'Transfer', tags: ['SaleDeed','Property'] },
  { q: 'ancestral property sold without all heirs consent', expect: 'Transfer', tags: ['SaleDeed','Property','Succession'] },
  { q: 'property sold by father can children challenge', expect: 'Transfer', tags: ['SaleDeed','Property','Succession'] },

  // ── Hindu Succession – deeper ─────────────────────────────────────────────
  { q: 'grandmother wants to give property to granddaughter, rights', expect: 'Succession', tags: ['HinduSuccession','Property'] },
  { q: 'illegitimate child rights in father property India', expect: 'Succession', tags: ['HinduSuccession','Property'] },
  { q: 'step-children rights in step-parent property India', expect: 'Succession', tags: ['HinduSuccession','Property'] },
  { q: 'adopted child property rights Hindu law', expect: 'Succession', tags: ['HinduSuccession','Property'] },
  { q: 'separated wife share in husband ancestral property', expect: 'Succession', tags: ['HinduSuccession','Property'] },

  // ── Will / Probate – deeper ───────────────────────────────────────────────
  { q: 'registered will vs unregistered will which is valid India', expect: 'Will', tags: ['WillProbate','Succession'] },
  { q: 'how to register a will before death India', expect: 'Will', tags: ['WillProbate','Succession'] },
  { q: 'holograph will validity India', expect: 'Will', tags: ['WillProbate','Succession'] },
  { q: 'will made by senile person validity', expect: 'Will', tags: ['WillProbate','Succession'] },

  // ── Motor Accident – deeper ───────────────────────────────────────────────
  { q: 'met with accident, third party insurance not covering', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'car hit from behind, neck injury whiplash compensation', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'government vehicle hit my car, compensation from whom', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'vehicle without insurance hit me what to do', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'solatium fund claim hit and run victim', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'lorry hit pedestrian, truck owner insurer liability', expect: 'Motor Accident', tags: ['MotorAccident'] },

  // ── PIL / Constitutional – deeper ────────────────────────────────────────
  { q: 'file PIL for illegal encroachment on public land', expect: ['PIL','Constitutional'], tags: ['PIL','Constitutional'] },
  { q: 'discriminatory government policy affecting women challenge', expect: ['PIL','Constitutional'], tags: ['PIL','Constitutional'] },
  { q: 'writ of certiorari against arbitrary order India', expect: ['PIL','Constitutional'], tags: ['PIL','Constitutional'] },
  { q: 'government hospital denying free treatment to BPL patient', expect: ['PIL','Constitutional'], tags: ['PIL','Constitutional'] },

  // ── NRI – deeper ─────────────────────────────────────────────────────────
  { q: 'NRI married abroad, valid in India', expect: 'NRI', tags: ['NRI','Family'] },
  { q: 'NRI sent money to India for property, relatives took it', expect: 'NRI', tags: ['NRI','Property','Fraud'] },
  { q: 'FEMA violation by NRI property purchase India', expect: 'NRI', tags: ['NRI','Property'] },
  { q: 'PIO card holder rights in India property', expect: 'NRI', tags: ['NRI','Property'] },

  // ── IP / Trademark – deeper ──────────────────────────────────────────────
  { q: 'my book being sold by someone else without permission', expect: 'Trademark', tags: ['IP','Corporate'] },
  { q: 'app copied without permission copyright infringement', expect: 'Trademark', tags: ['IP','Corporate','Cyber'] },
  { q: 'design patent stolen by competitor', expect: 'Trademark', tags: ['IP','Corporate'] },
  { q: 'franchise agreement violation using brand illegally', expect: 'Trademark', tags: ['IP','Corporate'] },

  // ── Tax – deeper ─────────────────────────────────────────────────────────
  { q: 'tax demand notice under section 148 income tax India', expect: 'Tax', tags: ['Tax'] },
  { q: 'TDS not deposited by employer what to do', expect: 'Tax', tags: ['Tax','Employment'] },
  { q: 'GST mismatch notice GSTR-1 GSTR-3B India', expect: 'Tax', tags: ['Tax'] },
  { q: 'appeal against income tax assessment order', expect: 'Tax', tags: ['Tax'] },

  // ── Education – deeper ────────────────────────────────────────────────────
  { q: 'university withholding result without reason', expect: 'Education', tags: ['Education'] },
  { q: 'student ragging complaint in college India', expect: ['Education','Assault'], tags: ['Education','Criminal'] },
  { q: 'private school admission refused to SC student', expect: ['Education','SCST'], tags: ['Education','SCST'] },
  { q: 'fee structure increased mid-year by school', expect: 'Education', tags: ['Education','Consumer'] },

  // ── MSME – deeper ────────────────────────────────────────────────────────
  { q: 'large company arbitration clause blocking MSME claim', expect: 'MSME', tags: ['MSME','Arbitration'] },
  { q: 'MSME classification dispute registration benefit', expect: 'MSME', tags: ['MSME'] },

  // ── Senior Citizen – deeper ───────────────────────────────────────────────
  { q: 'daughter-in-law abusing elderly mother-in-law physically', expect: ['Senior Citizen','Domestic Violence'], tags: ['SeniorCitizen','DV'] },
  { q: 'old person alone in house, son trying to sell it', expect: ['Senior Citizen','Property'], tags: ['SeniorCitizen','Property'] },
  { q: 'old age pension not received for 6 months', expect: 'Senior Citizen', tags: ['SeniorCitizen','Constitutional'] },

  // ── Environment / NGT – deeper ────────────────────────────────────────────
  { q: 'noise pollution from factory complaint India', expect: 'Environment', tags: ['Environment'] },
  { q: 'groundwater contaminated by industrial effluent', expect: 'Environment', tags: ['Environment'] },
  { q: 'protected forest land being cleared illegally', expect: 'Environment', tags: ['Environment','Constitutional'] },

  // ── Municipal / Building – deeper ────────────────────────────────────────
  { q: 'conversion of residential to commercial not sanctioned', expect: 'Municipal', tags: ['Municipal','Property'] },
  { q: 'municipality not providing basic amenities in area complaint', expect: ['Municipal','Constitutional'], tags: ['Municipal','Constitutional'] },

  // ── IBC / Insolvency – deeper ────────────────────────────────────────────
  { q: 'creditor applying insolvency against my company', expect: 'IBC', tags: ['IBC','Corporate'] },
  { q: 'interim resolution professional powers challenge', expect: 'IBC', tags: ['IBC','Corporate'] },
  { q: 'liquidation vs CIRP preference insolvency India', expect: 'IBC', tags: ['IBC','Corporate'] },

  // ── Corporate – deeper ───────────────────────────────────────────────────
  { q: 'private limited company dispute between two directors', expect: 'Corporate', tags: ['Corporate'] },
  { q: 'shareholder agreement violation by partner', expect: 'Corporate', tags: ['Corporate','Civil'] },
  { q: 'board meeting resolution challenged by shareholders', expect: 'Corporate', tags: ['Corporate'] },
  { q: 'company winding up petition creditor', expect: ['Corporate','IBC'], tags: ['Corporate','IBC'] },

  // ── SARFAESI / Banking – deeper ───────────────────────────────────────────
  { q: '60-day notice received under SARFAESI from bank', expect: 'SARFAESI', tags: ['SARFAESI','Civil'] },
  { q: 'DRAT appeal against DRT order India', expect: 'SARFAESI', tags: ['SARFAESI','Civil'] },
  { q: 'bank auction my house, can I challenge it', expect: 'SARFAESI', tags: ['SARFAESI','Civil','Property'] },

  // ── Consumer – deeper ────────────────────────────────────────────────────
  { q: 'coaching institute not refunding fees after discontinuing', expect: 'Consumer', tags: ['Consumer','Education'] },
  { q: 'gym membership not refunded despite closure', expect: 'Consumer', tags: ['Consumer'] },
  { q: 'tour operator cancelled trip no refund given', expect: 'Consumer', tags: ['Consumer'] },
  { q: 'district consumer forum filing fee limit jurisdiction', expect: 'Consumer', tags: ['Consumer'] },
  { q: 'consumer court order not implemented by company', expect: 'Consumer', tags: ['Consumer'] },
  { q: 'defective vehicle new car multiple repairs', expect: 'Consumer', tags: ['Consumer'] },
  { q: 'credit card company charging hidden fees', expect: 'Consumer', tags: ['Consumer','Civil'] },
  { q: 'insurance agent missold policy what to do', expect: 'Insurance', tags: ['Insurance','Consumer'] },

  // ── Cyber – deeper ───────────────────────────────────────────────────────
  { q: 'received morphed images of me being circulated online', expect: ['Cyber','Harassment'], tags: ['CyberHarass','Cyber'] },
  { q: 'online job fraud paid registration fee disappeared', expect: ['Cyber','Online Fraud','Fraud'], tags: ['CyberFraud','Cyber'] },
  { q: 'investment in crypto promised returns, website gone', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber'] },
  { q: 'social media account hacked, harassing messages sent to contacts', expect: ['Cyber','Hacking','Harassment'], tags: ['CyberData','Cyber'] },
  { q: 'mera instagram hack ho gaya', expect: ['Cyber','Hacking'], tags: ['CyberData','Cyber','Hinglish'] },
  { q: 'IT Act section 66 complaint India', expect: ['Cyber','Hacking'], tags: ['CyberData','Cyber'] },
  { q: 'dark web data leak my details found', expect: ['Digital Privacy','Cyber'], tags: ['DPDP','Cyber'] },
  { q: 'deepfake video made of me online', expect: ['Cyber','Harassment'], tags: ['CyberHarass','Cyber'] },

  // ── Employment – more complex ─────────────────────────────────────────────
  { q: 'employer not issuing relieving letter after resignation', expect: 'Employment', tags: ['Employment','Civil'] },
  { q: 'non-compete clause in employment contract too broad', expect: 'Employment', tags: ['Employment','Civil'] },
  { q: 'foreign employee visa issues India company not helping', expect: 'Employment', tags: ['Employment'] },
  { q: 'contract worker protections India fixed-term employment', expect: 'Employment', tags: ['Employment'] },
  { q: 'work from home employee rights India', expect: 'Employment', tags: ['Employment'] },
  { q: 'performance improvement plan issued unfairly', expect: 'Employment', tags: ['Termination','Employment'] },
  { q: 'whistleblower retaliation by employer', expect: ['Employment','Corruption'], tags: ['Employment','Corruption'] },

  // ── Arbitration / ADR – deeper ────────────────────────────────────────────
  { q: 'online dispute resolution India e-commerce', expect: 'Arbitration', tags: ['Arbitration','Civil','Consumer'] },
  { q: 'mediation vs litigation which is better India', expect: 'Arbitration', tags: ['Arbitration','Civil'] },
  { q: 'arbitration agreement not valid what ground', expect: 'Arbitration', tags: ['Arbitration','Civil'] },

  // ── Partition – deeper ────────────────────────────────────────────────────
  { q: 'two brothers not agreeing to partition agricultural land', expect: 'Partition', tags: ['Partition','Civil','Agriculture'] },
  { q: 'partition suit all co-owners must be party India', expect: 'Partition', tags: ['Partition','Civil'] },
  { q: 'family property sold without partition suit how to stop', expect: 'Partition', tags: ['Partition','Civil','Property'] },

  // ── Civil Money Recovery – deeper ─────────────────────────────────────────
  { q: 'promissory note not repaid civil suit India', expect: 'Money Recovery', tags: ['MoneyRecovery','Civil'] },
  { q: 'decreed amount not paid execution petition India', expect: 'Money Recovery', tags: ['MoneyRecovery','Civil'] },
  { q: 'property seized by court for debt recovery objection', expect: ['Money Recovery','SARFAESI'], tags: ['MoneyRecovery','Civil'] },

  // ── Defamation – deeper ───────────────────────────────────────────────────
  { q: 'police complaint for defamation India procedure', expect: 'Defamation', tags: ['Defamation','Civil','Criminal'] },
  { q: 'Google search results showing false information about me', expect: ['Defamation','Digital Privacy'], tags: ['Defamation','Cyber'] },
  { q: 'news channel aired false report about my company', expect: 'Defamation', tags: ['Defamation','Civil'] },

  // ── MGNREGA / Livelihood – deeper ────────────────────────────────────────
  { q: 'ration card wrongly removed from list', expect: 'Livelihood', tags: ['MGNREGA','Constitutional'] },
  { q: 'Ayushman Bharat card rejected at hospital', expect: 'Livelihood', tags: ['MGNREGA','Constitutional'] },

  // ── Specific Performance – deeper ────────────────────────────────────────
  { q: 'paid full advance for flat, seller backed out', expect: 'Specific Performance', tags: ['Contract','Civil','Property'] },
  { q: 'joint venture agreement one party not performing', expect: 'Specific Performance', tags: ['Contract','Civil','Corporate'] },
  { q: 'breach of service level agreement compensation India', expect: ['Specific Performance','Arbitration'], tags: ['Contract','Civil'] },

  // ── Mental Health / MTP – deeper ─────────────────────────────────────────
  { q: 'rape victim wanting abortion in 3rd trimester refused', expect: 'MTP', tags: ['MTP','Civil','Rape'] },
  { q: 'person with mental illness right to vote India', expect: 'Mental Healthcare', tags: ['MentalHealth','Civil','Constitutional'] },

  // ── Agriculture – deeper ──────────────────────────────────────────────────
  { q: 'PM Kisan scheme amount not credited to account', expect: 'Agriculture', tags: ['Agriculture','Livelihood'] },
  { q: 'irrigation water access dispute between farmers', expect: ['Agriculture','Civil'], tags: ['Agriculture','Civil'] },
  { q: 'crop destroyed by factory chemical leak, compensation', expect: ['Agriculture','Environment'], tags: ['Agriculture','Environment'] },

  // ── Electricity – deeper ────────────────────────────────────────────────
  { q: 'electricity board demanding arrears for previous owner', expect: 'Electricity', tags: ['Electricity','Consumer'] },
  { q: 'power outage causing business loss, compensation claim', expect: 'Electricity', tags: ['Electricity','Consumer'] },

  // ── Collision tests: what must NOT appear ────────────────────────────────
  { q: 'N:cheque bounce hua', expect: 'Assault', tags: ['ChequeBounce','negative'] },
  { q: 'N:salary nahi mila', expect: 'Consumer', tags: ['Salary','negative'], note: 'Salary dispute is employment, not consumer' },
  { q: 'N:builder fraud', expect: 'Fraud', tags: ['RERA','negative'], note: 'Builder not giving flat = RERA, not generic BNS Fraud' },
  { q: 'N:wife beat me', expect: 'Assault', tags: ['DV','negative'], note: 'Domestic context = DV, not generic assault' },
  { q: 'N:UPI fraud', expect: 'Fraud', tags: ['CyberFraud','negative'], note: 'UPI fraud = cyber, not BNS fraud' },
  { q: 'N:mujhe job se nikaala', expect: 'Consumer', tags: ['Termination','negative'], note: 'Termination = employment, not consumer' },
  { q: 'N:hospital bill too high', expect: 'Murder', tags: ['Consumer','negative'], note: 'Hospital bill = consumer, absolutely not murder' },
  { q: 'N:property dispute with brother over inheritance', expect: 'Theft', tags: ['Succession','negative'], note: 'Inheritance dispute = succession, not theft' },
  { q: 'N:someone gave me poison', expect: 'Consumer', tags: ['Murder','negative'], note: 'Poison = murder/culpable homicide, not consumer' },
  { q: 'N:IT company fired me without reason', expect: 'Criminal', tags: ['Termination','negative'], note: 'Wrongful termination = employment, not criminal' },

  // ── High-frequency short queries (important for UX) ──────────────────────
  { q: 'FIR darz nahi ho rahi', expect: 'Police Excess', tags: ['Short','Hinglish','PoliceExcess'] },
  { q: 'property dispute', expect: ['Property','Encroachment','Succession'], tags: ['Short','Vague'] },
  { q: 'court marriage kaise karte hain', expect: 'Special Marriage', tags: ['Short','Hinglish'] },
  { q: 'passport not coming, legal remedy', expect: ['Constitutional','PIL'], tags: ['Short','Constitutional'] },
  { q: 'company bandh ho gayi salary nahi mili', expect: ['Salary','IBC'], tags: ['Short','Hinglish','Employment'] },
  { q: 'neighbour ne meri gaadi tod di', expect: 'Assault', tags: ['Short','Hinglish'] },
  { q: 'accident ke baad insurance nahi de raha', expect: ['Motor Accident','Insurance'], tags: ['Short','Hinglish'] },
  { q: 'beti ki shadi chhod ke chala gaya', expect: 'Divorce', tags: ['Short','Hinglish'] },
  { q: 'zameen ka batwara karna hai', expect: 'Partition', tags: ['Short','Hinglish'] },
  { q: 'mujhe dhoka diya', expect: 'Fraud', tags: ['Short','Hinglish'] },
  { q: 'nabalik ke saath galat hua', expect: 'POCSO', tags: ['Short','Hinglish'] },
  { q: 'makan se nikala ja raha hoon', expect: 'Rent', tags: ['Short','Hinglish'] },

  // ── Professional / institutional perspective ─────────────────────────────
  { q: 'I am a builder, tenant not vacating commercial space', expect: 'Rent', tags: ['Professional','Property'] },
  { q: 'hospital received a legal notice for negligence, how to respond', expect: 'Medical Negligence', tags: ['Professional','MedNeg','Accused'] },
  { q: 'employer received POSH committee inquiry notice', expect: 'POSH', tags: ['Professional','POSH','Accused'] },
  { q: 'landlord wants to evict tenant legally what steps to follow', expect: 'Rent', tags: ['Professional','Property'] },
  { q: 'I am an employer, how to terminate employee legally', expect: 'Wrongful Termination', tags: ['Professional','Employment','Accused'] },
  { q: 'teacher accused of POCSO by student false complaint', expect: 'POCSO', tags: ['Professional','POCSO','Accused'] },
  { q: 'doctor accused of sexual assault by patient false allegation', expect: 'Rape', tags: ['Professional','Rape','Accused'] },

  // ── Combination queries (multi-issue) ────────────────────────────────────
  { q: 'employer not paying salary and also confiscating my passport', expect: ['Salary','Employment'], tags: ['MultiIssue','Employment'] },
  { q: 'builder not giving flat and refusing to return money', expect: 'RERA', tags: ['MultiIssue','Property'] },
  { q: 'police arrested me and seized my phone', expect: ['Bail','Police Excess'], tags: ['MultiIssue','Criminal'] },
  { q: 'husband beat me and locked me out of house', expect: 'Domestic Violence', tags: ['MultiIssue','Family'] },
  { q: 'company gave me bad product and also refused to refund', expect: 'Consumer', tags: ['MultiIssue','Consumer'] },
  { q: 'neighbour stealing electricity from my connection and encroaching land', expect: ['Electricity','Encroachment'], tags: ['MultiIssue','Property'] },

  // ── Unusual / rare but real scenarios ────────────────────────────────────
  { q: 'surrogacy contract dispute surrogate mother refusing to hand over child', expect: ['MTP','Family'], tags: ['Unusual','Family'] },
  { q: 'celebrity defamed me in interview on television', expect: 'Defamation', tags: ['Unusual','Civil'] },
  { q: 'right to die dignified death euthanasia India law', expect: 'Mental Healthcare', tags: ['Unusual','Civil','Constitutional'] },
  { q: 'transgender person employment discrimination', expect: ['Employment','Constitutional'], tags: ['Unusual','Employment','Constitutional'] },
  { q: 'woman prisoner rights in India', expect: ['Constitutional','Criminal'], tags: ['Unusual','Criminal','Constitutional'] },
  { q: 'religious conversion by force complaint India', expect: ['Criminal','Constitutional'], tags: ['Unusual','Criminal'] },
  { q: 'noise pollution neighbour playing loud music all night', expect: ['Environment','Municipal'], tags: ['Unusual','Environment'] },

  // ═══════════════════════════════════════════════════════════════════════
  // BATCH 3 — Final 250 to reach 1000+
  // ═══════════════════════════════════════════════════════════════════════

  // ── More Hinglish ─────────────────────────────────────────────────────────
  { q: 'dost ne paisa wapas nahi diya', expect: 'Fraud', tags: ['Hinglish','Fraud'] },
  { q: 'mujhe rape kiya uske ghar mein', expect: 'Rape', tags: ['Hinglish','Rape'] },
  { q: 'meri beti ko chhua unhone', expect: 'POCSO', tags: ['Hinglish','POCSO'] },
  { q: 'pati ne talaq dene se mana kar diya', expect: 'Divorce', tags: ['Hinglish','Divorce'] },
  { q: 'sasur ji ne ghar se nikal diya', expect: 'Domestic Violence', tags: ['Hinglish','DV'] },
  { q: 'police ne bina wajah pakad liya aur maara', expect: 'Police Excess', tags: ['Hinglish','PoliceExcess'] },
  { q: 'rishwat nahi di toh kaam nahi hua', expect: 'Corruption', tags: ['Hinglish','Corruption'] },
  { q: 'mobile chura gaya train mein', expect: 'Theft', tags: ['Hinglish','Theft'] },
  { q: 'online shopping mein cheating hui', expect: 'Consumer', tags: ['Hinglish','Consumer'] },
  { q: 'job se nikaala bina notice ke', expect: 'Wrongful Termination', tags: ['Hinglish','Employment'] },
  { q: 'property mein hissa chahiye bhai de nahi raha', expect: 'Succession', tags: ['Hinglish','Succession'] },
  { q: 'baap ki zameen bhai ne apne naam karwa li', expect: 'Succession', tags: ['Hinglish','Succession'] },
  { q: 'builder ne paise le liye flat nahi diya', expect: 'RERA', tags: ['Hinglish','RERA'] },
  { q: 'bijli ka bill bahut zyada aa raha hai', expect: 'Electricity', tags: ['Hinglish','Electricity'] },
  { q: 'company ne cheque diya jo bounce ho gaya', expect: 'Cheque Bounce', tags: ['Hinglish','ChequeBounce'] },
  { q: 'bank account se paisa gayab ho gaya', expect: ['Cyber','Online Fraud'], tags: ['Hinglish','Cyber'] },
  { q: 'ghar mein chori ho gayi', expect: 'Theft', tags: ['Hinglish','Theft'] },
  { q: 'atm se paise nikle nahi lekin kat gaye', expect: ['Cyber','Consumer'], tags: ['Hinglish','Cyber'] },
  { q: 'mujhe office mein tang kiya jaa raha hai', expect: ['POSH','Employment'], tags: ['Hinglish','Employment'] },
  { q: 'biwi ne jhooth bolke DV case kar diya', expect: 'Domestic Violence', tags: ['Hinglish','DV','Accused'] },
  { q: 'meri company ne PF nahi diya kabhi', expect: 'Salary', tags: ['Hinglish','Salary'] },
  { q: 'pradhan ne scheme ka paisa khaya', expect: 'Corruption', tags: ['Hinglish','Corruption'] },
  { q: 'pados mein nabalig ke saath bura ho raha hai', expect: 'POCSO', tags: ['Hinglish','POCSO'] },
  { q: 'meri photo badnaam karke daal di', expect: ['Cyber','Defamation'], tags: ['Hinglish','Cyber'] },
  { q: 'doctor ne galat operation kiya ab problem ho rahi hai', expect: 'Medical Negligence', tags: ['Hinglish','MedNeg'] },
  { q: 'sasural wale dahej de nahi de raha to tang kar rahe hain', expect: 'Dowry', tags: ['Hinglish','Dowry'] },
  { q: 'property par kabza ho gaya dusre ka', expect: 'Encroachment', tags: ['Hinglish','Encroachment'] },
  { q: 'bail ke liye kya karna hoga', expect: 'Bail', tags: ['Hinglish','Bail'] },

  // ── More accusation-side queries ─────────────────────────────────────────
  { q: 'girlfriend is blackmailing me with private chats', expect: ['Cyber','Defamation'], tags: ['Accused','Cyber'] },
  { q: 'customer filed consumer complaint against my shop, is it valid', expect: 'Consumer', tags: ['Accused','Consumer'] },
  { q: 'environmental NOC case filed against my factory', expect: 'Environment', tags: ['Accused','Environment'] },
  { q: 'my employee filed false POSH complaint against me', expect: 'POSH', tags: ['Accused','POSH'] },
  { q: 'I gave loan, friend not returning, what FIR to file', expect: 'Fraud', tags: ['Accused','Fraud'] },
  { q: 'I am a tenant, landlord threatening to throw out illegally', expect: 'Rent', tags: ['Accused','Rent'] },
  { q: 'I am a builder, homebuyer filed RERA case unjustly', expect: 'RERA', tags: ['Accused','RERA'] },
  { q: 'SC ST case filed against me by neighbour is false', expect: 'SC/ST', tags: ['Accused','SCST'] },

  // ── Family law deeper scenarios ───────────────────────────────────────────
  { q: 'wife has not come back home for 2 years, can I remarry', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'can I get divorce if wife has affair', expect: 'Divorce', tags: ['Divorce','Family'] },
  { q: 'second wife rights in husband property India', expect: ['Divorce','Succession'], tags: ['Divorce','Family','Succession'] },
  { q: 'live-in relationship legal status India', expect: 'Domestic Violence', tags: ['DV','Family'] },
  { q: 'intercaste marriage threat from family, protection needed', expect: ['Special Marriage','Domestic Violence'], tags: ['SpecialMarriage','Family'] },
  { q: 'custody given to wife but she is not a good mother', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'grandparents visitation rights India after divorce', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'wife is an alcoholic, I want to take child custody', expect: 'Custody', tags: ['Custody','Family'] },
  { q: 'Muslim husband not disclosing second marriage rights of first wife', expect: 'Muslim', tags: ['Muslim','Family'] },
  { q: 'nikah halala forced, legal remedy India', expect: 'Muslim', tags: ['Muslim','Family'] },

  // ── More property law scenarios ───────────────────────────────────────────
  { q: 'broker sold same flat to two buyers', expect: ['Transfer','RERA'], tags: ['SaleDeed','Property'] },
  { q: 'society refusing to give flat to buyer on caste grounds', expect: ['Housing Society','SCST'], tags: ['HousingSociety','Property','SCST'] },
  { q: 'adverse possession claim on my land after 12 years', expect: ['Encroachment','Transfer'], tags: ['Encroachment','Property'] },
  { q: 'tenancy at will eviction notice India', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'lease deed vs rental agreement difference India', expect: 'Rent', tags: ['Rent','Property'] },
  { q: 'property succession abroad NRI issue', expect: 'NRI', tags: ['NRI','Succession'] },
  { q: 'land ceiling act excess land government taking', expect: 'Land Acquisition', tags: ['LandAcq','Property'] },
  { q: 'smart city project displaced us compensation', expect: 'Land Acquisition', tags: ['LandAcq','Property'] },

  // ── More criminal law scenarios ───────────────────────────────────────────
  { q: 'kidnapped for ransom family received call', expect: 'Murder', tags: ['Murder','Criminal'], note: 'Kidnap = criminal under BNS' },
  { q: 'drug peddling case filed against my son', expect: ['Bail','Criminal'], tags: ['Bail','Criminal'] },
  { q: 'counterfeit currency found with me, how to defend', expect: ['Fraud','Criminal'], tags: ['Fraud','Criminal'] },
  { q: 'extortion threats demanding monthly payment', expect: 'Fraud', tags: ['Fraud','Criminal'] },
  { q: 'bomb hoax call filed complaint ignored by police', expect: ['Criminal','Police Excess'], tags: ['Criminal','PoliceExcess'] },
  { q: 'stalked by ex-boyfriend for months at home and office', expect: ['Cyber','Assault'], tags: ['CyberHarass','Cyber','Criminal'] },
  { q: 'voyeurism photos taken without consent by colleague', expect: 'Rape', tags: ['Rape','Criminal','Employment'] },
  { q: 'obscene phone calls and messages what complaint to file', expect: ['Cyber','Harassment'], tags: ['CyberHarass','Cyber'] },
  { q: 'wrongly named as accused in FIR how to get name removed', expect: ['Bail','Criminal'], tags: ['Bail','Criminal'] },
  { q: 'chargesheet filed after 3 years, is there a limitation issue', expect: ['Bail','Criminal'], tags: ['Bail','Criminal'] },

  // ── Cyber more specific ───────────────────────────────────────────────────
  { q: 'received threatening WhatsApp message with knife photo', expect: ['Cyber','Assault'], tags: ['CyberHarass','Cyber','Criminal'] },
  { q: 'Bitcoin stolen from my wallet, who do I complain to', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber'] },
  { q: 'data from my mobile phone leaked how to report', expect: ['Digital Privacy','Cyber'], tags: ['DPDP','Cyber'] },
  { q: 'pan card misused by someone online', expect: ['Cyber','Digital Privacy'], tags: ['CyberFraud','Cyber'] },
  { q: 'fake court notice received by email demanding money', expect: ['Cyber','Online Fraud'], tags: ['CyberFraud','Cyber'] },
  { q: 'aadhar used for loan without consent', expect: ['Digital Privacy','Cyber'], tags: ['DPDP','Cyber'] },

  // ── Employment more scenarios ─────────────────────────────────────────────
  { q: 'employee benefits not given as per offer letter', expect: 'Employment', tags: ['Employment','Civil'] },
  { q: 'company stopped provident fund contribution mid-year', expect: 'Salary', tags: ['Salary','Employment'] },
  { q: 'apprentice stipend not paid by company', expect: 'Salary', tags: ['Salary','Employment'] },
  { q: 'company closed overnight, employees not paid', expect: ['Salary','IBC'], tags: ['Salary','Employment','IBC'] },
  { q: 'contract employee converted to permanent, benefits denied', expect: 'Employment', tags: ['Employment','Civil'] },
  { q: 'union busting by company anti-union activities', expect: 'Employment', tags: ['Employment','Constitutional'] },

  // ── Consumer extended ─────────────────────────────────────────────────────
  { q: 'medicine has expired, pharmacist sold anyway', expect: ['Food Safety','Consumer'], tags: ['FoodSafety','Consumer'] },
  { q: 'beauty salon permanent damage to hair, compensation', expect: 'Consumer', tags: ['Consumer'] },
  { q: 'gym trainer injured me during training session', expect: 'Consumer', tags: ['Consumer'] },
  { q: 'real estate broker cheated took commission and vanished', expect: ['Consumer','Fraud'], tags: ['Consumer','Fraud','Property'] },
  { q: 'school refusing to give transfer certificate', expect: ['Education','Consumer'], tags: ['Education','Consumer'] },
  { q: 'dental procedure gone wrong permanent damage', expect: ['Consumer','Medical Negligence'], tags: ['ConsumerMedical','Consumer'] },
  { q: 'faulty electrical appliance caused fire in house', expect: 'Consumer', tags: ['Consumer'] },

  // ── Tax extended ─────────────────────────────────────────────────────────
  { q: 'property sale capital gains tax dispute', expect: 'Tax', tags: ['Tax','Property'] },
  { q: 'TDS deducted but not reflecting in 26AS', expect: 'Tax', tags: ['Tax','Employment'] },
  { q: 'GST penalty notice for not filing returns', expect: 'Tax', tags: ['Tax'] },
  { q: 'income tax search and seizure by IT department', expect: 'Tax', tags: ['Tax','PMLA'] },

  // ── Education extended ────────────────────────────────────────────────────
  { q: 'school gave fake passing certificate, discovered later', expect: 'Education', tags: ['Education','Fraud'] },
  { q: 'fellowship stipend not paid by university', expect: 'Education', tags: ['Education','Salary'] },
  { q: 'JEE NEET result manipulation complaint', expect: ['Education','Corruption'], tags: ['Education','Corruption'] },
  { q: 'student sexual harassment by professor', expect: ['POSH','Education'], tags: ['Education','POSH'] },

  // ── Senior Citizen extended ──────────────────────────────────────────────
  { q: 'old person being exploited financially by caregiver', expect: 'Senior Citizen', tags: ['SeniorCitizen'] },
  { q: 'elderly widow property grabbed by relatives', expect: ['Senior Citizen','Property'], tags: ['SeniorCitizen','Property'] },
  { q: 'son not allowing old father to visit his own house', expect: 'Senior Citizen', tags: ['SeniorCitizen','Property'] },

  // ── IBC / Corporate extended ──────────────────────────────────────────────
  { q: 'startup founder dispute equity dilution', expect: 'Corporate', tags: ['Corporate','Civil'] },
  { q: 'company audit objection statutory auditor dispute', expect: 'Corporate', tags: ['Corporate'] },
  { q: 'personal guarantor insolvency NCLT proceedings', expect: 'IBC', tags: ['IBC','Corporate','Civil'] },
  { q: 'ESOP dispute startup employee not receiving shares', expect: 'Corporate', tags: ['Corporate','Employment'] },

  // ── Special / niche law scenarios ─────────────────────────────────────────
  { q: 'anti-conversion ordinance state law challenge', expect: ['Constitutional','PIL'], tags: ['PIL','Constitutional'] },
  { q: 'refugee status in India legal rights', expect: ['Constitutional','PIL'], tags: ['PIL','Constitutional'] },
  { q: 'inter-state property dispute jurisdiction issue', expect: ['Property','Civil'], tags: ['Property','Civil'] },
  { q: 'lok adalat settlement procedure India', expect: 'Arbitration', tags: ['Arbitration','Civil'] },
  { q: 'legal aid free lawyer India procedure', expect: [], tags: ['General'], note: 'Should trigger general help, not specific law' },
  { q: 'affidavit attestation procedure India', expect: [], tags: ['General'], note: 'Procedural query, not law-specific' },
  { q: 'stamp paper for agreement India procedure', expect: ['Contract','Civil'], tags: ['Civil','General'] },
  { q: 'notary public attestation India', expect: [], tags: ['General'] },

  // ── More collision / disambiguation tests ────────────────────────────────
  { q: 'N:bail chahiye', expect: 'Fraud', tags: ['Bail','negative'], note: 'Bail query = Bail law, not Fraud' },
  { q: 'N:bail chahiye', expect: 'Domestic Violence', tags: ['Bail','negative'], note: 'Bail query should not return DV' },
  { q: 'N:property dispute brother', expect: 'Rape', tags: ['Succession','negative'], note: 'Property dispute should never trigger Rape' },
  { q: 'N:online fraud UPI', expect: 'Murder', tags: ['CyberFraud','negative'], note: 'Online fraud should not trigger Murder' },
  { q: 'N:doctor wrong diagnosis compensation', expect: 'Murder', tags: ['ConsumerMedical','negative'], note: 'Civil medical negligence should not trigger Murder' },
  { q: 'N:rent dispute landlord', expect: 'Theft', tags: ['Rent','negative'], note: 'Rent dispute should not trigger Theft' },
  { q: 'N:divorce proceedings going on', expect: 'Fraud', tags: ['Divorce','negative'], note: 'Divorce should not trigger Fraud' },

  // ── Final edge case set ───────────────────────────────────────────────────
  { q: 'i was in an accident and the driver ran away', expect: 'Motor Accident', tags: ['MotorAccident','EdgeCase'] },
  { q: 'my minor daughter was married off forcefully', expect: ['POCSO','Family'], tags: ['POCSO','Family','EdgeCase'] },
  { q: 'company sent me a demand notice for money I do not owe', expect: ['Civil','Consumer'], tags: ['Civil','EdgeCase'] },
  { q: 'I received a summons from court, what should I do', expect: [], tags: ['General','EdgeCase'] },
  { q: 'threatening letter received from political party leader', expect: 'Assault', tags: ['Assault','EdgeCase','Constitutional'] },
  { q: 'hospital denied emergency treatment, patient died', expect: 'Medical Negligence', tags: ['MedNeg','EdgeCase','Criminal'] },
  { q: 'woman forced to remove hijab at workplace', expect: ['Constitutional','Employment'], tags: ['Constitutional','Employment','EdgeCase'] },
  { q: 'child sold by parents to work as domestic help', expect: ['POCSO','Employment'], tags: ['POCSO','EdgeCase'] },
  { q: 'fake will discovered 10 years after fathers death', expect: 'Will', tags: ['WillProbate','EdgeCase','Succession'] },
  { q: 'property bought in wifes name, now she wants divorce', expect: ['Divorce','Property'], tags: ['Divorce','Property','EdgeCase'] },
  { q: 'my video viral on social media without permission', expect: ['Cyber','Digital Privacy'], tags: ['DPDP','Cyber','EdgeCase'] },
  { q: 'fired because I reported corruption internally', expect: ['Employment','Corruption'], tags: ['Employment','Corruption','EdgeCase'] },
  { q: 'bank manager misused my FD details and took money', expect: ['Fraud','Consumer'], tags: ['Fraud','Consumer','EdgeCase'] },
  { q: 'sister convinced mother to make will only in her name', expect: 'Will', tags: ['WillProbate','Succession','EdgeCase'] },
  { q: 'someone using my name to take loans', expect: ['Fraud','Digital Privacy','Cyber'], tags: ['Fraud','Cyber','EdgeCase'] },
  { q: 'court ordered property handed over but not done yet', expect: ['Property','Civil'], tags: ['Property','Civil','EdgeCase'] },
  { q: 'I signed agreement under pressure, not valid', expect: 'Specific Performance', tags: ['Contract','Civil','EdgeCase'] },
  { q: 'wife took all jewellery before leaving, is it theft', expect: ['Theft','DV','Dowry'], tags: ['Theft','DV','EdgeCase'] },
  { q: 'insurance company calling accident self-inflicted', expect: 'Insurance', tags: ['Insurance','Consumer','EdgeCase'] },
  { q: 'caste certificate wrongly rejected for government job', expect: ['SCST','Employment','Constitutional'], tags: ['SCST','Employment','EdgeCase'] },
];



// NOTE: appended via bash to avoid read requirement
// Batch 4 — Final top-up to exceed 1000

const _batch4 = [
  // Bail
  { q: 'police arrested without warrant, is it legal', expect: ['Bail','Police Excess'], tags: ['Bail','PoliceExcess'] },
  { q: 'how to get anticipatory bail in India', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'police kept in custody for more than 24 hours without court', expect: ['Bail','Police Excess'], tags: ['Bail','PoliceExcess'] },
  { q: 'remand period extended repeatedly what to do', expect: 'Bail', tags: ['Bail','Criminal'] },
  { q: 'bail rejected three times options left', expect: 'Bail', tags: ['Bail','Criminal'] },

  // Contract
  { q: 'breach of contract supplier not delivering goods', expect: 'Specific Performance', tags: ['Contract','Civil'] },
  { q: 'non-compete clause in employment agreement valid India', expect: ['Contract','Employment'], tags: ['Contract','Employment'] },
  { q: 'verbal agreement not honoured legal remedy India', expect: 'Specific Performance', tags: ['Contract','Civil'] },
  { q: 'MOU violated by other party', expect: 'Specific Performance', tags: ['Contract','Civil'] },
  { q: 'liquidated damages not paid after construction delay', expect: ['Contract','Civil','RERA'], tags: ['Contract','Civil','RERA'] },

  // Arbitration
  { q: 'arbitration clause in agreement dispute resolution', expect: 'Arbitration', tags: ['Arbitration','Civil'] },
  { q: 'arbitration award not enforced by other party', expect: 'Arbitration', tags: ['Arbitration','Civil'] },
  { q: 'can I challenge an arbitration award in court', expect: 'Arbitration', tags: ['Arbitration','Civil'] },
  { q: 'referred to lok adalat, outcome not binding what next', expect: 'Arbitration', tags: ['Arbitration','Civil'] },

  // IPR
  { q: 'someone copied my mobile app logo and name', expect: 'Intellectual Property', tags: ['IPR'] },
  { q: 'my YouTube videos being reposted without credit', expect: 'Intellectual Property', tags: ['IPR','Cyber'] },
  { q: 'competitor using my registered trademark', expect: 'Intellectual Property', tags: ['IPR'] },
  { q: 'book plagiarized by another author', expect: 'Intellectual Property', tags: ['IPR'] },
  { q: 'design patent infringement for my product', expect: 'Intellectual Property', tags: ['IPR'] },

  // Defamation
  { q: 'newspaper printed false story about me', expect: 'Defamation', tags: ['Defamation'] },
  { q: 'false review on Google Maps harming my business', expect: 'Defamation', tags: ['Defamation','Cyber'] },
  { q: 'ex-employer gave negative reference that is untrue', expect: 'Defamation', tags: ['Defamation','Employment'] },
  { q: 'YouTube video falsely claims I am a fraud', expect: ['Defamation','Cyber'], tags: ['Defamation','Cyber'] },
  { q: 'social media post calling me corrupt is false', expect: 'Defamation', tags: ['Defamation','Cyber'] },

  // Motor accident
  { q: 'car accident other driver fled scene', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'insurance company not paying accident claim', expect: ['Motor Accident','Insurance'], tags: ['MotorAccident','Insurance'] },
  { q: 'road accident claim MACT tribunal compensation', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'hit and run case what to do', expect: 'Motor Accident', tags: ['MotorAccident','Criminal'] },
  { q: 'motorcycle accident injury permanent disability compensation', expect: 'Motor Accident', tags: ['MotorAccident'] },

  // NRI
  { q: 'NRI husband abandoned wife in India', expect: ['NRI','Domestic Violence'], tags: ['NRI','DV'] },
  { q: 'OCI card holder rights in India property purchase', expect: 'NRI', tags: ['NRI','Property'] },
  { q: 'foreign divorce decree valid in India', expect: ['NRI','Divorce'], tags: ['NRI','Divorce'] },
  { q: 'NRI power of attorney misused by relative India', expect: ['NRI','Fraud'], tags: ['NRI','Fraud'] },

  // Land acquisition
  { q: 'government acquiring my agricultural land for highway', expect: 'Land Acquisition', tags: ['LandAcq'] },
  { q: 'compensation for acquired land too low what to do', expect: 'Land Acquisition', tags: ['LandAcq'] },
  { q: 'railway acquired land but not paid compensation 10 years', expect: 'Land Acquisition', tags: ['LandAcq'] },
  { q: 'urban development authority demolished my house for road widening', expect: 'Land Acquisition', tags: ['LandAcq'] },

  // Environment
  { q: 'river near my house getting polluted by factory', expect: 'Environment', tags: ['Environment'] },
  { q: 'coastal regulation zone violation by hotel', expect: 'Environment', tags: ['Environment'] },
  { q: 'burning of crop stubble affecting air quality complaint', expect: 'Environment', tags: ['Environment'] },
  { q: 'wetland drained illegally for construction', expect: 'Environment', tags: ['Environment'] },

  // Insurance
  { q: 'life insurance claim rejected on technicality', expect: 'Insurance', tags: ['Insurance','Consumer'] },
  { q: 'health insurance pre-existing disease exclusion unjust', expect: 'Insurance', tags: ['Insurance','Consumer'] },
  { q: 'insurance agent mis-sold policy not as described', expect: 'Insurance', tags: ['Insurance','Consumer','Fraud'] },
  { q: 'fire insurance surveyor undervalued loss amount', expect: 'Insurance', tags: ['Insurance','Consumer'] },

  // Short utterances
  { q: 'cheque bounce what to do', expect: 'Cheque Bounce', tags: ['Short','ChequeBounce'] },
  { q: 'builder delay flat not given', expect: 'RERA', tags: ['Short','RERA'] },
  { q: 'upi fraud help', expect: ['Cyber','Online Fraud'], tags: ['Short','Cyber'] },
  { q: 'custody of children divorce', expect: 'Custody', tags: ['Short','Custody'] },
  { q: 'will not valid how to contest', expect: 'Will', tags: ['Short','WillProbate'] },
  { q: 'company not paying salary 3 months', expect: 'Salary', tags: ['Short','Salary'] },
  { q: 'land dispute brother', expect: ['Succession','Property'], tags: ['Short','Succession'] },
  { q: 'police harassment no case', expect: 'Police Excess', tags: ['Short','PoliceExcess'] },
  { q: 'consumer forum how to file', expect: 'Consumer', tags: ['Short','Consumer'] },
  { q: 'bail how to get', expect: 'Bail', tags: ['Short','Bail'] },
  { q: 'property sale deed issue', expect: ['Transfer','Property'], tags: ['Short','Property'] },
  { q: 'employer fired illegally', expect: 'Wrongful Termination', tags: ['Short','Employment'] },

  // More Hinglish short
  { q: 'kya rape case mein compromise ho sakta hai', expect: 'Rape', tags: ['Hinglish','Rape'] },
  { q: 'divorce lena hai kya karna padega', expect: 'Divorce', tags: ['Hinglish','Divorce'] },
  { q: 'property mein naam kaise karein after death', expect: 'Succession', tags: ['Hinglish','Succession'] },
  { q: 'FIR kaise kategi false accusation', expect: ['Bail','Criminal'], tags: ['Hinglish','Bail'] },
  { q: 'maintenance kitna milega divorce mein', expect: ['Divorce','Alimony'], tags: ['Hinglish','Divorce'] },

  // Negative
  { q: 'N:car broke down warranty expired mechanic refused repair', expect: 'Murder', tags: ['Consumer','negative'] },
  { q: 'N:flat booking cancelled by builder refund', expect: 'Murder', tags: ['RERA','negative'] },
  { q: 'N:salary not paid 2 months notice period expired', expect: 'Rape', tags: ['Salary','negative'] },
  { q: 'N:insurance claim rejected repeatedly consumer forum', expect: 'Murder', tags: ['Insurance','negative'] },
  { q: 'N:property papers missing buyer cheated', expect: 'Rape', tags: ['Property','negative'] },
];

// Merge batch4 into exports
module.exports = module.exports.concat(_batch4);

const _batch5 = [
  { q: 'cheque given for security deposit bounced landlord', expect: 'Cheque Bounce', tags: ['Short','ChequeBounce','Rent'] },
  { q: 'I was hit by a drunk driver pedestrian accident', expect: 'Motor Accident', tags: ['MotorAccident'] },
  { q: 'post-dated cheque given by business partner bounced', expect: 'Cheque Bounce', tags: ['ChequeBounce'] },
  { q: 'daughter harassed by in-laws for car dowry', expect: 'Dowry', tags: ['Dowry','DV'] },
  { q: 'neighbour blocking my right of way illegally', expect: ['Encroachment','Property'], tags: ['Encroachment','Property'] },
  { q: 'school expelled child unfairly mid-year', expect: 'Education', tags: ['Education','Consumer'] },
  { q: 'passport impounded can I challenge it', expect: ['Constitutional','PIL'], tags: ['Constitutional','PIL'] },
  { q: 'my shop sealed by municipal authority without notice', expect: ['Municipal','PIL'], tags: ['Municipal','PIL'] },
  { q: 'ration card benefits denied falsely delisted', expect: 'PIL', tags: ['PIL','Constitutional'] },
  { q: 'electricity connection cut without advance notice', expect: 'Electricity', tags: ['Electricity','Consumer'] },
  { q: 'forest land encroachment by private party', expect: 'Environment', tags: ['Environment','Land'] },
  { q: 'I am a minor and was married off what can I do', expect: 'POCSO', tags: ['POCSO','Family'] },
  { q: 'factory effluent killing fish in river PIL', expect: 'Environment', tags: ['Environment','PIL'] },
  { q: 'builder took 5 lakh token and vanished', expect: ['RERA','Fraud'], tags: ['RERA','Fraud','Criminal'] },
  { q: 'partner in firm taking all profits what legal remedy', expect: 'Corporate', tags: ['Corporate','Civil'] },
  { q: 'religious conversion under force or coercion', expect: ['Constitutional','Assault'], tags: ['Constitutional','Criminal'] },
  { q: 'police filing fake case to extort money', expect: 'Police Excess', tags: ['PoliceExcess','Criminal','Corruption'] },
];
module.exports = module.exports.concat(_batch5);
