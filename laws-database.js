// ═══════════════════════════════════════════════════════════════════════════
// SatLegal – Laws Database v3.0
// Comprehensive Indian Laws Coverage
// Special focus: Hindu Marriage Act, Child Custody, Divorce, Employment,
// IT Act, Cyber Frauds, Hindu & Indian Succession, Shop & Establishment,
// Transfer of Property, Livelihood, BNS, BNSS
// ═══════════════════════════════════════════════════════════════════════════

const LAWS_DATABASE = [

  // HINDU MARRIAGE ACT & DIVORCE
  {
    caseType: 'Family – Divorce (Contested)',
    lawCategory: 'Family',
    actName: 'Hindu Marriage Act, 1955 – Sec 13',
    keywords: {
      exact: ['file for divorce','want to get divorced','want divorce','i want divorce','want to divorce','divorce my husband','divorce my wife','husband wants divorce','wife wants divorce','seeking divorce','grounds for divorce','divorce petition','contested divorce','cruelty by husband','cruelty by wife','mental cruelty in marriage','husband abandoned me','wife abandoned me','desertion for two years','husband having affair','wife having affair','want to get out of marriage','get out of this marriage','end this marriage','leave this marriage'],
      strong: ['divorce','separation','cruelty','adultery','desertion','impotency','mental cruelty','physical cruelty','matrimonial home','marital discord','broken marriage','failed marriage','divorce petition','respondent spouse','matrimonial','conjugal rights','husband abusive','wife abusive','domestic violence','dowry harassment','mentally tortures','mentally torture','husband mentally','wife mentally','mentally harasses','marriage breakdown','irretrievably broken'],
      weak: ['marriage','husband','wife','spouse','marital','wed','separated','unhappy','fighting','abuse','problem','relationship','split']
    },
    sections: ['Sec 13 HMA (Grounds for Divorce)','Sec 9 (Restitution of Conjugal Rights)','Sec 10 (Judicial Separation)','Sec 24 (Maintenance pendente lite)','Sec 25 (Permanent Alimony)','Sec 26 (Custody of children)','Indian Divorce Act 1869 (Christian divorce)','Parsi Marriage and Divorce Act 1936 (Parsi matrimonial)','Muslim personal law (Muslim divorce)','Cheating fraud by spouse (bigamy)','Mutual consent divorce property division government pension','Adoption HAMA Hindu Adoptions and Maintenance Act','Judicial separation declaration marriage void','Alimony muslim maintenance after divorce','Consumer copra matrimonial website fraud misled (consumer copra)','NRI divorce from UK spouse in India (nri)','Wrongful termination job loss alongside divorce (wrongful termination)'],
    documents: [
      { name: 'Marriage Certificate / Registration', critical: true },
      { name: 'Proof of Cruelty (medical records, photos, FIR, messages)', critical: true },
      { name: 'Proof of Residence (Aadhaar / utility bills)', critical: true },
      { name: 'Wedding photographs and invitation', critical: false },
      { name: 'Income proof (salary slips / ITR) for maintenance', critical: false },
      { name: 'Bank statements', critical: false },
      { name: 'Evidence of adultery (if applicable)', critical: false }
    ],
    probingQuestions: [
      { q: 'What is the ground for divorce? (Cruelty/Adultery/Desertion/Conversion/Other)', tip: 'Each ground has specific evidence requirements. Cruelty is most commonly cited.' },
      { q: 'How long have you been married and how long separated?', tip: 'For desertion: must be 2+ years. Separation strengthens the case.' },
      { q: 'Have children been born of the marriage?', tip: 'Child custody and maintenance become key issues when children are involved.' },
      { q: 'Is there any ongoing domestic violence or FIR filed?', tip: 'FIR under DV Act or BNS greatly strengthens divorce grounds.' },
      { q: 'Is there a matrimonial home dispute or property involved?', tip: 'Property settlement is often linked to divorce proceedings.' },
      { q: 'Have you attempted mediation or marriage counselling?', tip: 'Courts often direct mediation first. Prior attempts help the petition.' }
    ],
    contextualQuestions: ['family'],
    limitation: 'No limitation – but file promptly',
    urgency: 'medium',
    multiLawCompatible: ['Family – Mutual Consent Divorce','Family – Maintenance / Alimony','Family – Child Custody / Guardianship']
  },

  {
    caseType: 'Family – Mutual Consent Divorce',
    lawCategory: 'Family',
    actName: 'Hindu Marriage Act Sec 13B / Special Marriage Act Sec 28',
    keywords: {
      exact: ['mutual consent divorce','both agree to divorce','we both want divorce','amicable divorce','friendly divorce','uncontested divorce','divorce by mutual agreement','both parties want to separate','joint petition for divorce','consensual divorce','we mutually agree to divorce how do we divide his government pension','we both want to separate and divide assets amicably','hum dono milkar divorce lena chahte hain','we have settled custody and alimony and want divorce by consent','divorce by consent'],
      strong: ['mutual divorce','both agree','no dispute','settlement agreement','divorce settlement','alimony agreed','custody agreed','cooling period divorce','first motion second motion','living separately one year','separated by agreement','consent divorce','both settled custody','both settled alimony','milkar divorce'],
      weak: ['divorce','agree','both','settlement','separated','marriage ended','together decide','no children issue','no property dispute']
    },
    sections: ['Sec 13B HMA (Mutual Consent Divorce)','Sec 28 Special Marriage Act','Sec 24 HMA (Maintenance pendente lite)'],
    documents: [
      { name: 'Marriage Certificate', critical: true },
      { name: 'Proof of Separation (affidavit / correspondence)', critical: true },
      { name: 'Divorce Settlement Agreement (signed by both)', critical: true },
      { name: 'Proof of Residence (both spouses)', critical: true },
      { name: 'Property / Asset list and agreed division', critical: false },
      { name: 'Children custody agreement (if applicable)', critical: false }
    ],
    probingQuestions: [
      { q: 'Have you been living separately for at least one year?', tip: 'Mandatory for Sec 13B HMA. The 1-year separation is a pre-condition.' },
      { q: 'Have you reached a settlement on alimony/property/custody?', tip: 'A signed settlement agreement greatly speeds the process.' },
      { q: 'Are there minor children? What is the agreed custody arrangement?', tip: 'Court will scrutinise the custody arrangement for the welfare of the child.' },
      { q: 'Are both spouses willing to appear in court twice (first + second motion)?', tip: 'Mutual consent divorce requires two court hearings 6 months apart (unless waived).' }
    ],
    contextualQuestions: ['family'],
    limitation: '1 year separation minimum',
    urgency: 'low',
    multiLawCompatible: ['Family – Divorce (Contested)','Family – Maintenance / Alimony','Family – Child Custody / Guardianship']
  },

  {
    caseType: 'Family – Child Custody / Guardianship',
    lawCategory: 'Family',
    actName: 'Guardians and Wards Act, 1890 + Hindu Minority and Guardianship Act, 1956',
    keywords: {
      exact: ['child custody dispute','custody of my child','want custody of children','husband taking away children','wife not letting me see children','visitation rights for child','guardian of child','custody battle','parental rights','access to child denied','child abducted by spouse','overseas child custody','husband took children and will not return them','father keeping children not returning to mother','bachon ko pita apne paas rakh ke nahi de raha','father withheld children from mother','husband took children to his house will not return them','husband took kids not returning','maa ne bacche liye aur ghar se chali gayi kuch pata nahi','wife ne bacche lekar ghar chhod diya pata nahi kahan hai',
        'we want to adopt a child what is the legal process','want to adopt a child legal process','how to adopt a child in india','adoption process india','legal adoption procedure','cara adoption','hindu adoption process','can we adopt a child','adoption eligibility','adopting a child from orphanage','hum baccha adopt karna chahte hain','baccha adopt karna hai kya process hai'],
      strong: ['custody','child custody','children custody','guardianship','minor child','visitation','visitation rights','access rights','parenting plan','child welfare','best interests of child','physical custody','legal custody','joint custody','sole custody','primary caregiver','custody order','custody petition','ward','guardian','child taken by father','child taken by mother','children withheld','parent withheld children'],
      weak: ['child','children','kids','son','daughter','minor','baby','separated','parent','father','mother','access','see']
    },
    sections: ['Guardians and Wards Act Sec 7, 8, 17, 25','Hindu Minority and Guardianship Act Sec 6, 13','Sec 26 Hindu Marriage Act','POCSO Act (if abuse involved)','BNS (if abduction)'],
    documents: [
      { name: "Child's Birth Certificate", critical: true },
      { name: 'Marriage Certificate of Parents', critical: true },
      { name: 'Proof of Income/Ability to Care for Child', critical: true },
      { name: 'Proof of Residence', critical: true },
      { name: 'School Records of Child', critical: false },
      { name: 'Medical Records (if health issue)', critical: false },
      { name: 'FIR Copy (if abduction or violence involved)', critical: false }
    ],
    probingQuestions: [
      { q: 'What is the age and gender of the child?', tip: 'For children below 5, courts typically prefer maternal custody.' },
      { q: 'Is there any allegation of abuse or neglect against either parent?', tip: 'POCSO or DV Act complaints change the nature of the case significantly.' },
      { q: 'What is the current living arrangement of the child?', tip: 'Courts prefer continuity and stability for the child.' },
      { q: 'Are you seeking interim (temporary) custody or permanent custody?', tip: 'Interim custody can be obtained quickly while the main case proceeds.' },
      { q: 'Is the other parent in a different city or country?', tip: 'If abroad, Hague Convention (if applicable) or NRI custody laws may apply.' },
      { q: 'Does the child express any preference? (for children above 9-10 years)', tip: "Courts consider child's preference when the child is old enough to express one." }
    ],
    contextualQuestions: ['family'],
    limitation: 'File at earliest – urgent for child welfare',
    urgency: 'high',
    multiLawCompatible: ['Family – Divorce (Contested)','Family – Mutual Consent Divorce','Family – Maintenance / Alimony']
  },

  {
    caseType: 'Family – Maintenance / Alimony',
    lawCategory: 'Family',
    actName: 'Hindu Marriage Act Sec 24 & 25 / BNSS Sec 144 (formerly CrPC Sec 125)',
    keywords: {
      exact: ['claiming maintenance from husband','wife claiming alimony','husband not paying maintenance','monthly maintenance order','interim maintenance','alimony not paid','child maintenance not given','maintenance under 125 crpc','permanent alimony','maintenance from ex husband','we had a live-in relationship for 5 years now he refuses to pay maintenance','i had a live-in relationship of 4 years partner now refuses all support','mera pati mujhe guzara bhatta nahi de raha','my adoptive father is not paying maintenance despite hama','i divorced my wife what is my obligation to pay maintenance to her','my adult disabled child needs maintenance from father','my nri husband is not paying child support ordered by indian court','husband refuses to give any money after separation','husband not giving money after we separated','daughter in law not being maintained by son what can she do','son not maintaining wife daughter in law','father of my child not paying child support after divorce','child support not paid after divorce'],
      strong: ['maintenance','alimony','interim maintenance','monthly support','financial support','not maintained','refusing maintenance','maintenance petition','maintenance order','neglected wife','dependent children','breadwinner','destitute','unable to maintain herself','live-in relationship maintenance','live-in maintenance','live-in partner refuse','guzara bhatta','hama maintenance','adoptive father maintenance','disabled child maintenance','nri husband child support','nafaqa','nafaqah','naan nafaqah','husband refuses to give money after separation','after separation husband not giving money','husband not providing after separation','daughter in law not maintained','son not maintaining daughter in law','father of child not paying child support','child support not paid','live-in partner refusing to maintain'],
      weak: ['money','support','husband','wife','children','financial','monthly','not giving','refusing','separated','abandoned','live-in','guzara','bhatta']
    },
    sections: ['BNSS Sec 144 (formerly CrPC Sec 125)','HMA Sec 24 (pendente lite)','HMA Sec 25 (permanent alimony)','DV Act Sec 20 (monetary relief)','Muslim Women Protection Act (for Muslim)','HAMA Hindu Adoptions and Maintenance Act 1956 (adoption hama)','Adoption rights HAMA adoptive parent maintenance obligation','Senior citizen maintenance welfare act','Muslim maintenance alimony mehr after divorce','Parsi maintenance christian divorce maintenance','Disabled adult child maintenance rights father (disabilit)','Senior citizen son not paying maintenance (senior citizen)'],
    documents: [
      { name: 'Marriage Certificate', critical: true },
      { name: "Proof of Income (salary / ITR of spouse)", critical: true },
      { name: "Proof of Applicant's Inability to Maintain (affidavit)", critical: true },
      { name: "Child's Birth Certificate (if claiming for children)", critical: false },
      { name: 'Bank statements (to show financial need)', critical: false }
    ],
    probingQuestions: [
      { q: 'Are you currently separated or divorced?', tip: 'Section 144 BNSS maintenance can be claimed even during marriage if desertion/cruelty proven.' },
      { q: 'Does your spouse have income / assets? What is approximate monthly income?', tip: 'Courts award maintenance as a % of spouse\'s income (typically 15-25%).' },
      { q: 'Do you have minor children who need support?', tip: "Children's maintenance is in addition to spousal maintenance." },
      { q: 'Has a maintenance order been passed before?', tip: 'You can apply to vary/enhance an earlier maintenance order.' }
    ],
    contextualQuestions: ['family'],
    limitation: 'File within 3 years from denial',
    urgency: 'high',
    multiLawCompatible: ['Family – Divorce (Contested)','Family – Child Custody / Guardianship','Family – Domestic Violence']
  },

  {
    caseType: 'Family – Domestic Violence',
    lawCategory: 'Family',
    actName: 'Protection of Women from Domestic Violence Act, 2005',
    keywords: {
      exact: ['husband beating me','husband has been beating me','husband beats me','husband physically abusing','physical violence by husband','domestic violence complaint','abused by husband','husband threatening to kill','in-laws harassing','protection order against husband','thrown out of home by husband','mental torture by in-laws','dowry demand','dowry harassment','dowry torture','we had a live-in relationship for 5 years now he refuses to pay maintenance','i had a live-in relationship of 4 years partner now refuses all support','my live-in partner who is my colleague is abusing me','my ex husband is using my private photos to blackmail me','my husband gives me no money for household expenses controls all finances','should i file fir or dv act complaint against my violent husband','i need immediate relief under dv act today','sasural wale dahej maang rahe hain aur maar peet karte hain','mera pati mujhe roz maarta hai kya karna chahiye','sasural wale roz maarte hain police nahi sun rahi','pati sharab peekar maarta hai ghar se nikaalne ki dhamki','pati sharab peekar maar ta hai','sasural mein maar peet ho rahi hai'],
      strong: ['domestic violence','physical abuse','mental abuse','emotional abuse','dowry','harassment','threatened','violence at home','beaten','beating','assault','shelter home','protection order','restraining order','in-laws','father-in-law','mother-in-law','marital rape','economic abuse','isolation','controlling behaviour','live-in relationship abuse','live-in partner abuse','private photos blackmail','intimate partner blackmail','no household money','financial control husband','economic violence','blackmail with photos','live-in partner refuse maintenance','husband hit in front of children','hit me in front of children','violence in front of children','husband hits children present','left matrimonial home due to violence','left home due to abuse','left because of violence rights','shared household rights after leaving'],
      weak: ['abuse','hurt','fear','safe','scared','husband','home','unsafe','cruel','live-in','threat','threatens'],
      hinglish: ['pati ne mara','pati maarta hai','sasural wale tang karte hain','ghar se nikal diya','pati ne peeta','mera pati mujhe pita hai','ghar wale maar rahe hain','dahej ke liye tang kar rahe hain','pati ne ghar se nikala','sasural me tang kar rahe hain','dahej de do warna maar denge','ghar wale torture kar rahe hain','pati roz maarta hai','sasural walo ne nikala','husband peeta hai','mujhe maar raha hai pati','in-laws ne ghar se nikala','husband ne mara','sasural walon ne ghar se nikaala','pati ne maara','sasural wale tang kar rahe hain eviction'],
      casual: ['my husband is hitting me','husband abuses me','in laws are harassing me','in laws kicked me out','thrown out by husband','husband beats me daily','scared of my husband','husband threatens me','my husband hits me when drunk','my husband is torturing me mentally','husband is being cruel to me','husband is abusing me','my in laws torture me','my husband controls everything','husband wont let me leave','im scared of my husband']
    },
    sections: ['DV Act Sec 12 (Application)','Sec 18 (Protection Order)','Sec 19 (Residence Order)','Sec 20 (Monetary Relief)','Sec 21 (Custody Order)','BNS Sec 85 (Dowry Demand)','BNS Sec 86 (Cruelty)'],
    documents: [
      { name: 'Medical reports (injuries)', critical: true },
      { name: 'Photographs of injuries / property damage', critical: true },
      { name: 'Police complaint / FIR copy', critical: false },
      { name: 'Domestic Incident Report (DIR)', critical: false },
      { name: 'Proof of Residence in matrimonial home', critical: true },
      { name: 'Messages/call logs showing threats', critical: false }
    ],
    probingQuestions: [
      { q: 'Is the violence ongoing or has it stopped?', tip: 'Ongoing violence: approach Protection Officer / Magistrate immediately for emergency relief.' },
      { q: 'What type of abuse? (Physical / Mental / Economic / Sexual)', tip: 'DV Act covers all forms of abuse including economic deprivation and verbal threats.' },
      { q: 'Do you have a place to stay safely right now?', tip: 'You have the right to remain in the matrimonial/shared household under Sec 19.' },
      { q: 'Have you filed an FIR or police complaint?', tip: 'FIR is optional but strengthens the DV case. You can also directly approach Magistrate.' },
      { q: 'Are children involved? Are they safe?', tip: 'Custody and protection of children can be sought simultaneously under DV Act.' }
    ],
    contextualQuestions: ['family'],
    limitation: 'No strict limitation – file as soon as possible',
    urgency: 'high',
    multiLawCompatible: ['Family – Divorce (Contested)','Family – Maintenance / Alimony','Criminal – BNS (Assault/Cruelty)']
  },

  {
    caseType: 'Family – Judicial Separation / Restitution of Conjugal Rights',
    lawCategory: 'Family',
    actName: 'Hindu Marriage Act Sec 9 & 10',
    keywords: {
      exact: ['restitution of conjugal rights','judicial separation petition','husband left matrimonial home','wife refusing to come back','wife refuses to come back','spouse not returning home','legal separation without divorce','petition for conjugal rights','wife refuses to return home','wife refuses to come back to matrimonial home','want to live separately from husband without divorce','live separately without divorce','legally separate without divorce','pati se alag rehna chahti hoon divorce nahi chahiye','alag rehna hai divorce nahi lena'],
      strong: ['judicial separation','conjugal rights','matrimonial home abandoned','refused to cohabit','refusing to live together','withdrawn from society','without reasonable excuse','separated but not divorced','wife refuses to return','wife not coming home','rcr petition','legally separate no divorce','separate without divorce','separation not divorce','live apart no divorce'],
      weak: ['separation','living apart','not coming home','refused','left home','separate maintenance','wife left','husband left']
    },
    sections: ['HMA Sec 9 (Restitution of Conjugal Rights)','HMA Sec 10 (Judicial Separation)','CPC Order 21 (Execution of decree)'],
    documents: [
      { name: 'Marriage Certificate', critical: true },
      { name: 'Proof of Last Residence Together', critical: true },
      { name: 'Correspondence / Messages showing refusal', critical: false },
      { name: 'Witness Affidavits', critical: false }
    ],
    probingQuestions: [
      { q: 'How long has the separation been going on?', tip: 'For Sec 9 (restitution): must show withdrawal without reasonable excuse.' },
      { q: 'Has the other spouse given any reason for not returning?', tip: 'Cruelty, adultery, or other reasonable cause is a defence to Sec 9 petition.' },
      { q: 'Are you seeking to continue the marriage or use this as a step toward divorce?', tip: 'Sec 9 decree can convert into divorce if not complied with within 1 year.' }
    ],
    contextualQuestions: ['family'],
    limitation: 'File promptly',
    urgency: 'medium',
    multiLawCompatible: ['Family – Divorce (Contested)','Family – Maintenance / Alimony']
  },

  // SUCCESSION LAWS
  {
    caseType: 'Property – Hindu Succession / Inheritance Dispute',
    lawCategory: 'Family & Succession',
    actName: 'Hindu Succession Act, 1956 (Amended 2005)',
    keywords: {
      exact: ['father died without a will','mother died without will','no will was left','died intestate','ancestral property dispute','daughter right in property','son refusing to give share','brothers not giving share','sisters not giving share','father passed away no will','inheritance dispute','coparcenary rights','equal share in property','hindu succession','property after father death','property after mother death','property after husband death'],
      strong: ['father died','mother died','husband died','parent died','passed away','no will','without will','died without','ancestral property','ancestral land','grandfather property','grandmother property','family property','joint family','inherited property','huf','hindu undivided family','coparcener','daughter share','daughter rights','legal heir','legal heirs','property distribution','property division after death','share in property','succession','inherit','inheritance','intestate','class i heir','brothers denying','relatives claiming','bhai zameen ka hissa','zameen ka hissa nahi de raha','baap ke jaane ke baad','maa ki maut ke baad bhai','sampatti nahi de raha bhai','bhai hissa nahi deta','baap ki maut zameen','baap ki maut ke baad bhai','baap ki maut ke baad zameen','maut ke baad zameen nahi de raha','bhai zameen nahi de raha'],
      weak: ['died','death','property','land','house','plot','share','family','father','mother','brother','sister','uncle','relative','dispute','claiming','right','entitled','unfair','not giving']
    },
    sections: ['Sec 6 (Daughter as Coparcener)','Sec 8 (General Rules of Succession)','Sec 14 (Property of Hindu Female)','Sec 15 (Female Intestate Succession)','Sec 30 (Testamentary Succession)','NRI inheritance UK father died without will (nri)','Oral will verbal declaration probate (will probate)','Adopted child HAMA equal rights (hama)','Street vendor vending zone designation (street vendor)','Banking joint account blocked after death (banking succession)','Housing society flat transfer after death (housing society)','Partition suit brothers after father death (partition)'],
    documents: [
      { name: 'Death Certificate of Deceased', critical: true },
      { name: 'Property Documents / Sale Deed / Title Deed', critical: true },
      { name: 'Family Tree / Succession Certificate', critical: true },
      { name: 'Proof of Relationship (Birth/Marriage Certificates)', critical: true },
      { name: 'Will (if any)', critical: false },
      { name: 'Mutation Records', critical: false },
      { name: 'Property Tax Receipts', critical: false }
    ],
    probingQuestions: [
      { q: 'Was the deceased Hindu (includes Buddhist, Jain, Sikh)?', tip: 'Hindu Succession Act applies to Hindus. Other religions have separate succession laws.' },
      { q: 'Did the deceased die without leaving a Will (intestate)?', tip: 'If no Will, intestate succession rules under HSA 1956 apply.' },
      { q: 'Is the property ancestral or self-acquired by the deceased?', tip: 'Post-2005: daughters have equal rights in ancestral (coparcenary) property as sons.' },
      { q: 'Who are the Class I legal heirs? (Sons, daughters, widow, mother)', tip: 'Class I heirs inherit equally.' },
      { q: 'Did the death occur before or after 9th September 2005?', tip: 'The 2005 Amendment gave daughters equal coparcenary rights.' },
      { q: 'Are you a daughter claiming equal share that brothers are denying?', tip: 'Under Sec 6 (post-2005), daughters are coparceners with the same rights as sons.' }
    ],
    contextualQuestions: ['property','succession'],
    limitation: '12 years from the date right to property accrues',
    urgency: 'medium',
    multiLawCompatible: ['Civil – Partition Suit','Succession – Will Dispute / Probate']
  },

  {
    caseType: 'Succession – Will Dispute / Probate',
    lawCategory: 'Succession',
    actName: 'Indian Succession Act, 1925 + Hindu Succession Act, 1956',
    keywords: {
      exact: ['will is being challenged','will is disputed','contesting the will','suspicious will','forged will','fake will','will probate','probate of will','letters of administration','executor of will','will not genuine','undue influence in will','will made under pressure','successor certificate','legal heir certificate'],
      strong: ['will','probate','executor','testator','bequest','inheritance','contested will','challenge will','letters of administration','succession certificate','legal heir','disputed will','forged','codicil','testamentary','intestate succession','grant of probate','undue influence','mental capacity','signature on will'],
      weak: ['property','death','died','estate','assets','left behind','father died','mother died','grandmother','grandfather','document']
    },
    sections: ['Indian Succession Act Sec 57 (Probate)','Sec 212 (Right to obtain certificate)','Sec 213 (Right as executor)','Hindu Succession Act Sec 30','CPC Sec 276–295 (Probate procedure)','Probate oral verbal will declaration before death (probate)','Succession certificate banking after death (banking succession)'],
    documents: [
      { name: 'Original Will', critical: true },
      { name: 'Death Certificate of Testator', critical: true },
      { name: 'Proof of Relationship to Deceased', critical: true },
      { name: 'Property Documents mentioned in Will', critical: true },
      { name: 'Medical records (testamentary capacity)', critical: false },
      { name: 'Witness statements (attesting witnesses)', critical: false },
      { name: 'Registration certificate of Will (if registered)', critical: false }
    ],
    probingQuestions: [
      { q: 'Is the will registered or unregistered?', tip: 'Registered wills are harder to challenge. Unregistered wills are still valid but easier to dispute.' },
      { q: 'On what ground is the will being challenged? (Forgery / Undue influence / Mental incapacity)', tip: 'Each ground requires specific evidence.' },
      { q: 'Were proper witnesses present when the will was signed?', tip: 'Two witnesses must attest the will under Indian Succession Act Sec 63.' },
      { q: 'Was the testator of sound mind at the time of making the will?', tip: 'Medical records, bank transactions, and witness testimony used to establish mental capacity.' },
      { q: 'Is probate required for this property?', tip: 'Probate is mandatory in some states (e.g., Maharashtra, West Bengal) for immovable property.' }
    ],
    contextualQuestions: ['succession','property'],
    limitation: '12 years from death of testator',
    urgency: 'medium',
    multiLawCompatible: ['Property – Hindu Succession / Inheritance Dispute','Civil – Partition Suit']
  },

  // EMPLOYMENT LAWS
  {
    caseType: 'Employment – Wrongful Termination / Illegal Dismissal',
    lawCategory: 'Labour & Employment',
    actName: 'Industrial Disputes Act, 1947 + Labour Codes 2020',
    keywords: {
      exact: ['fired without notice','terminated without cause','wrongful termination','illegal dismissal','unfair dismissal','dismissed without show cause notice','retrenchment without compensation','laid off without notice','forced to resign','constructive dismissal','terminated for raising complaint','whistleblower fired','terminated after maternity leave','employer made my work conditions so bad i had to resign','my manager forced me to resign and threatened me with false charges','company terminated me when i was 6 months pregnant that is illegal','my boss sexually harassed me and when i complained they fired me','i was terminated without notice and my pf was not deposited','i am a contract worker working for 5 years still treated as contract','company ne covid ke baad mujhe force resign karaya bina kisi settlement ke','employer breached my settlement agreement after termination','employer closed factory and locked out workers illegally','employer falsely accused me of misconduct to fire me','my startup employer is not giving me my esop despite agreement','contract not renewed after 5 years of continuous service','5 years continuous service contract not renewed','naukri se nikaal diya bina kisi notice ke 8 saal baad','management transferred me to remote location to force resignation','company ne covid ke baad job se nikala bina notice ke','employer firing me and not paying gratuity after 10 years','firing me without paying gratuity after 10 years service','fired without gratuity after many years'],
      strong: ['wrongful termination','illegal dismissal','unfair termination','dismissed','fired','retrenched','terminated','layoff','layoffs','termination letter','notice period not given','no severance','no retrenchment compensation','workman','industrial dispute','labour court','reinstatement','back wages','standing orders','show cause notice ignored','domestic enquiry','force resign','forced to resign','work conditions bad','pregnant fired','pregnancy termination employment','fired after pregnancy','esop not given','esop dispute','bond penalty employment','covid layoff no settlement','settlement agreement breach employment','false misconduct termination','factory lockout','esma strike','constructive dismissal','mujhe bina kisi kaaran ke naukri se nikaal diya','naukri se nikala','naukri chali gayi','naukri se nikal diya','job chali gayi','company asked me to resign','asked to resign or fired','resign or terminate','forced resignation','terminated during probation','probation termination no reason','dismissed probation period','contract not renewed service','contract renewal denied after years','continuous service contract renewal','transferred to force resignation','transfer to remote force resign','naukri se nikaal diya bina notice','bina notice naukri se nikaala'],
      weak: ['job lost','employment ended','let go','bond','factory','conditions bad','offer letter']
    },
    sections: ['IDA Sec 25F (Conditions for retrenchment)','Sec 25N (Prior permission for retrenchment >100 workers)','Sec 25G (Procedure)','IDA Sec 10 (Labour Court reference)','Industrial Employment Standing Orders Act','Specific performance of employment contract (contract breach)','Service law violation (government and public sector employees)','Minimum wages violation (Payment of Wages Act)','Shops and establishments act violation','PF gratuity ESIC non-payment remedy','POSH wrongful termination after harassment complaint','Police excess gender bias resignation service law (police excess)','Insurance employer removed mediclaim policy (insurance)'],
    documents: [
      { name: 'Appointment Letter / Offer Letter', critical: true },
      { name: 'Termination Letter', critical: true },
      { name: 'Pay slips (last 3-6 months)', critical: true },
      { name: 'Proof of Service Duration', critical: true },
      { name: 'Show Cause Notice (if any)', critical: false },
      { name: 'Domestic Enquiry Report (if any)', critical: false },
      { name: 'HR Communications / Emails', critical: false }
    ],
    probingQuestions: [
      { q: 'What is your designation and how many employees does your company have?', tip: 'IDA protections are stronger for "workmen". White-collar employees >₹18,000/month have limited IDA protection.' },
      { q: 'How long were you employed before termination?', tip: 'If employed for 1+ year: entitled to 1 month notice or pay. Retrenchment compensation = 15 days per year.' },
      { q: 'Was a domestic enquiry conducted before termination?', tip: 'No enquiry = violation of natural justice = strong ground for reinstatement.' },
      { q: 'Did you receive the legally required notice period and compensation?', tip: 'Without notice pay + retrenchment compensation (if applicable) = illegal termination.' },
      { q: 'Was the termination due to any complaint you raised (POSH/harassment)?', tip: 'Retaliatory termination has additional remedies under specific laws.' }
    ],
    contextualQuestions: ['employment'],
    limitation: '3 years from termination (Labour Court), must file quickly',
    urgency: 'high',
    multiLawCompatible: ['Employment – Salary Dues / PF / Gratuity','Employment – Harassment at Workplace (POSH)']
  },

  {
    caseType: 'Employment – Salary Dues / PF / Gratuity',
    lawCategory: 'Labour & Employment',
    actName: 'Payment of Wages Act, 1936 + EPF Act, 1952 + Gratuity Act, 1972',
    keywords: {
      exact: ['employer not paying salary','salary not paid for months','pending salary','pf not deposited','provident fund not deposited','epf money not given','gratuity not paid','gratuity withheld','bonus not paid','overtime not paid','salary deducted without reason','salary on hold','final settlement not given','full and final settlement pending','tds deducted from salary','tds deducted from salary but not deposited','tds from salary not deposited','tds not deposited with government salary','my company is not paying money to me for last 3 months','i am a daily wage worker have no written contract what are my rights','i am a swiggy delivery partner treated as employee but denied all benefits','i am forced to do overtime without extra pay regularly','i am an apprentice not being paid stipend as per apprentice act','factory is not following safety norms workers are being injured regularly','my employer has not credited salary for past 4 months','company deducted 3 months salary as notice pay wrongly','my employer calls me trainee but i am doing full time work for 2 years','employer cut 20% of my salary during covid without consent','company deducted 3 months salary as notice pay wrongly','mere employer ne 3 month ki salary nahi di aur ab mujhe fire kar diya','my ex employer owes me 6 months salary and pf dues'],
      strong: ['salary dues','unpaid salary','wage theft','esic','esic card','employee state insurance','salary pending','provident fund','pf','epfo','epf','gratuity','minimum wages','bonus','leave encashment','full and final settlement','notice period dues','payment default','employer defaulted','salary withheld','daily wage worker','daily wage rights','gig worker','delivery partner benefits','apprentice stipend','apprentice act','trainee full time work','salary cut covid','salary not credited','ex employer salary','6 months salary due','overtime wages not paid','overtime wages','overtime pay not given','tds deducted from salary not deposited','tds not deposited government','tds from salary not deposited','tax deducted salary not deposited'],
      weak: ['salary','wages','pay','payment','money','dues','owed','employer','company','unpaid','not given','deducted','daily wage','gig','delivery partner','stipend','apprentice','trainee','overtime','minimum wage']
    },
    sections: ['Payment of Wages Act Sec 3, 15','Minimum Wages Act Sec 22','EPF & MP Act Sec 7A','Payment of Gratuity Act Sec 7, 8, 9','Labour Codes 2020','Wrongful termination remedy (Labour Court)','Minimum wages violation redressal','Shops and establishments compliance','Service law government employees (CAT)','PF gratuity ESIC recovery','Industrial dispute factory safety workers (industrial dispute)','Cyber deepfake video online harassment (online harassment cyber)','NGT municipal noise pollution environmental (ngt municipal pil)'],
    documents: [
      { name: 'Appointment Letter', critical: true },
      { name: 'Salary Slips (all pending months)', critical: true },
      { name: 'Bank Statements (showing salary credited/not credited)', critical: true },
      { name: 'PF Account Statement (EPFO passbook)', critical: false },
      { name: 'Proof of 5+ years service (for gratuity)', critical: false },
      { name: 'Resignation / Termination Letter', critical: false },
      { name: 'HR Communications demanding dues', critical: false }
    ],
    probingQuestions: [
      { q: 'How many months of salary are pending and what is the amount?', tip: 'Claims up to ₹24,000/month wage: file with Labour Authority. Higher wages: Civil Court.' },
      { q: 'Have you completed 5 years of continuous service? (for gratuity)', tip: 'Gratuity is payable after 5 years. Formula: 15 days x basic salary x completed years.' },
      { q: 'Is your employer depositing PF as shown in salary slip?', tip: 'Check EPFO passbook online. Non-deposit is a criminal offence by employer.' },
      { q: 'Have you sent a legal notice to the employer?', tip: 'Send written demand before approaching Labour Authority. Creates a paper trail.' }
    ],
    contextualQuestions: ['employment'],
    limitation: '3 years for most claims',
    urgency: 'high',
    multiLawCompatible: ['Employment – Wrongful Termination / Illegal Dismissal','Shops & Establishments Act – Labour Compliance']
  },

  {
    caseType: 'Employment – Harassment at Workplace (POSH)',
    lawCategory: 'Labour & Employment',
    actName: 'Sexual Harassment of Women at Workplace Act, 2013',
    keywords: {
      exact: ['sexual harassment at work','sexual harassment by boss','boss sexually harassing','posh complaint','icc complaint','internal complaints committee','workplace harassment complaint','hostile work environment','sexually harassed at office','quid pro quo harassment','unwanted sexual advances at work'],
      strong: ['posh','sexual harassment','workplace harassment','office harassment','boss harassment','icc','internal complaints committee','unwanted advances','inappropriate behaviour at work','toxic workplace','gender discrimination','hostile environment','bullying at work','discrimination','maternity discrimination'],
      weak: ['harassment','bullying','workplace','office','boss','colleague','uncomfortable','hostile','discriminate','gender']
    },
    sections: ['POSH Act 2013 Sec 9 (Complaint)','Sec 11 (Inquiry)','Sec 13 (Action)','Sec 19 (Employer obligations)','BNS Sec 354A (Sexual harassment)','BNSS (Criminal procedure)','Wrongful termination after POSH complaint (retaliation)','Mental healthcare disability discrimination at workplace'],
    documents: [
      { name: 'Written Complaint to ICC', critical: true },
      { name: 'Screenshots/Emails of harassing communications', critical: true },
      { name: 'Witness Statements', critical: false },
      { name: 'Appointment Letter / HR Policies', critical: false },
      { name: 'Medical records (if psychological harm)', critical: false }
    ],
    probingQuestions: [
      { q: 'Has the organisation constituted an Internal Complaints Committee (ICC)?', tip: 'All organisations with 10+ employees must have an ICC. Absence is employer liability.' },
      { q: 'Was the harassment from a superior, peer, or subordinate?', tip: 'Power dynamics affect the nature of the inquiry and available remedies.' },
      { q: 'Do you have any documentary evidence (messages, emails, CCTV)?', tip: 'Electronic evidence greatly strengthens the complaint.' },
      { q: 'Have you already filed a complaint with the ICC?', tip: 'Mandatory first step. Deadline: 3 months from incident (extendable by further 3 months).' }
    ],
    contextualQuestions: ['employment'],
    limitation: '3 months from incident',
    urgency: 'high',
    multiLawCompatible: ['Employment – Wrongful Termination / Illegal Dismissal','Criminal – BNS (Assault/Cruelty)']
  },

  // SHOPS & ESTABLISHMENT
  {
    caseType: 'Shops & Establishments Act – Labour Compliance',
    lawCategory: 'Labour & Employment',
    actName: 'Shops and Commercial Establishments Acts (State-specific) + Labour Codes 2020',
    keywords: {
      exact: ['shop act registration','shops and establishment complaint','no appointment letter given','shop employee rights','working hours violation','no weekly off given','overtime not paid to shop worker','commercial establishment dispute','trade license not given','shop not registered','i am a daily wage worker have no written contract what are my rights','i am forced to do overtime without extra pay regularly','my employer makes me work 7 days a week under threat of termination','i am a contract worker for 8 years can i claim permanent status','i am a swiggy delivery partner treated as employee but denied benefits','my employer calls me trainee but i am doing full time work for 2 years','company not giving salary slip for 6 months','employer not giving payslip','no salary slip from employer','salary slip not provided','company not issuing payslip','no appointment letter no pf working 3 years','working years no appointment letter','no offer letter despite years of work'],
      strong: ['shops act','establishment act','commercial establishment','trade license','shop registration','working hours','weekly off','weekly holiday','overtime shop','shop worker','retail employee','commercial employee','appointment letter not given','no written employment terms','labour compliance','leave not given','dukan registration','kirana dukan','dukan ka registration','shop ka registration','dukan nahi register','dukan register karna hai','shops and establishments registration'],
      weak: ['shop','store','office','establishment','employer','employee','working','hours','leave','holiday','wages','overtime']
    },
    sections: ['Shops & Establishments Act (State-specific)','Labour Code on Occupational Safety 2020','Labour Code on Wages 2019','EPF Act 1952','ESI Act 1948','Minimum wages protection (daily wage workers)','Wrongful termination remedy for shop workers','Industrial dispute contractor worker benefits (wrongful termination industrial dispute)'],
    documents: [
      { name: 'Shop Registration Certificate', critical: true },
      { name: 'Appointment Letter / Employment Contract', critical: true },
      { name: 'Salary Slips', critical: true },
      { name: 'Proof of Overtime Hours (attendance records)', critical: false },
      { name: 'Any HR correspondence', critical: false }
    ],
    probingQuestions: [
      { q: 'Which state is the shop/establishment located in?', tip: 'Shops Act is state-specific. Different states have different rules and penalties.' },
      { q: 'Are you an employer or employee in this matter?', tip: 'Employers must register; employees have specific rights under working hours, wages, leave.' },
      { q: 'How many employees does the establishment have?', tip: 'EPF applicable to establishments with 20+ employees. ESI applicable if 10+.' },
      { q: 'What specific violation is alleged? (Hours/wages/leave/registration)', tip: 'Different violations have different remedies – some criminal, some civil.' }
    ],
    contextualQuestions: ['employment','business'],
    limitation: '3 years from violation',
    urgency: 'medium',
    multiLawCompatible: ['Employment – Salary Dues / PF / Gratuity','Employment – Wrongful Termination / Illegal Dismissal']
  },

  // LIVELIHOOD
  {
    caseType: 'Livelihood – MGNREGA / Right to Work / Government Schemes',
    lawCategory: 'Constitutional & Livelihood',
    actName: 'MGNREGA 2005 + Article 21 Constitution (Right to Livelihood)',
    keywords: {
      exact: ['mgnrega wages not paid','nrega work not given','job card not given','right to livelihood violated','denied work under mgnrega','panchayat not giving work','daily wages not paid mgnrega','government scheme benefit denied','ration card denied','pm awas yojana not given','social security benefit denied','street vendor harassment','hawker evicted illegally','my designated vending zone was changed without town vending committee approval','vending zone changed','town vending committee','my vending license is valid but bmc removed my cart illegally'],
      strong: ['mgnrega','nrega','job card','livelihood','right to work','minimum wages not paid','government scheme','social security','unemployment allowance','ration','food security','pm awas','street vendor','hawker rights','svs act','vendors act','article 21','constitutional right','panchayat','gram sabha','vending zone','town vending committee','bmc removed cart','hawker license','vending license'],
      weak: ['work','wages','livelihood','government','scheme','denied','village','rural','employment','entitlement']
    },
    sections: ['MGNREGA Sec 3 (Right to work)','Sec 6 (Wage rate)','Article 21 Constitution','Street Vendors Act 2014 (street vendor)','National Food Security Act 2013','Social Security Code 2020','Vending zone changed without town vending committee (street vendor)','BMC removed my vending cart illegally (street vendor)','Hawker evicted illegally vending license valid (street vendor)'],
    documents: [
      { name: 'MGNREGA Job Card', critical: true },
      { name: 'Application for Work (dated)', critical: true },
      { name: 'Proof of Non-payment / Part-payment', critical: true },
      { name: 'Aadhaar Card', critical: false },
      { name: 'Bank Passbook', critical: false }
    ],
    probingQuestions: [
      { q: 'Have you applied for work under MGNREGA in writing?', tip: 'Written application gives right to work within 15 days or unemployment allowance.' },
      { q: 'How many days of work were you denied / unpaid?', tip: 'MGNREGA guarantees 100 days per household per year at notified wage rates.' },
      { q: 'Have you complained to the Block Development Officer (BDO)?', tip: 'Escalate from Panchayat → BDO → District Programme Coordinator.' }
    ],
    contextualQuestions: ['employment','rural'],
    limitation: 'File promptly',
    urgency: 'high',
    multiLawCompatible: ['Consumer – Product Defect / Service Deficiency','Employment – Salary Dues / PF / Gratuity']
  },

  // IT ACT / CYBER FRAUDS
  {
    caseType: 'Cyber – Online Fraud / Financial Cyber Crime',
    lawCategory: 'Cyber & IT',
    actName: 'IT Act 2000 (Amended 2008) + BNS 2023',
    keywords: {
      exact: ['online fraud','cyber fraud','lost money online','cheated online','phishing attack','upi fraud','bank fraud online','otp fraud','job offer online paid registration fee','paid registration fee job offer','paid registration fee they disappeared','job offer paid fee disappeared','received call from fake police officer demanding money','fake police officer call demanding money','call saying police demanding money','police officer call asking money','mere bank khate se paise nikaale gaye','bank mein fraud hua','fake investment scheme','ponzi scheme online','online scam','crypto fraud','digital payment fraud','sim swapping fraud','vishing call fraud','aadhaar otp misused','money transferred by fraud','i paid for mobile on olx seller blocked me item never came','my sim was fraudulently swapped and all my bank accounts were drained','someone impersonating our ceo by email asked cfo to transfer funds','i got a call saying i won lottery they took fees but no prize came','fake investment app invest karake mere lakh le liye','my email and bank account was hacked someone changed my password','my whatsapp was hacked and used to ask money from all my contacts','i paid money to a consultancy for government job placement it was fraud','fake job agency ne paise le liye job nahi mili','someone used my credit card fraudulently online','i ordered product from a fake website it was not delivered','mere khate se bina meri marzi ke paise nikaale gaye','mere bank account se paise gaye',
        'unknown transactions on my credit card','unknown transactions credit card','fraudulent transactions on credit card','bank not reversing credit card fraud','credit card used without my knowledge','my credit card was used without permission','unauthorized credit card transaction','debit card used without my knowledge','unknown debit card transaction','card cloned and used','credit card details stolen and used','chit fund company closed not returning money','chit fund fraud','chit fund company ran away with money','chit fund operator absconded','chit fund scam','nidhi company fraud','collective investment scheme fraud','ponzi scheme chit fund','multi-level marketing scam','mlm scheme fraud'],
      strong: ['cyber fraud','online fraud','internet fraud','digital fraud','phishing','upi','bank hacked','account hacked','otp shared','scam','fake website','impersonation','identity theft','cloned card','card skimming','account drained','money stolen online','cybercrime','cyber police','national cyber crime helpline','olx fraud','olx seller blocked','sim swap','sim swapped','sim fraudulently swapped','whatsapp hacked','ceo fraud','business email compromise','lottery fraud','lottery call','fake job consultancy','investment app fraud','job placement fraud','google pay fraud','phonepe fraud','fake website order','credit card fraud','investment app','debit card fraud','debit card details','card details stolen','fake link money','link clicked money deducted','fake bill link','otp deke fraud','otp fraud online','fake electricity bill','online paisa gaya','job offer paid fee','online job fee fraud','paid registration online',
        'chit fund','chit fund fraud','chit fund closed','chit fund not returning','chit fund scam','nidhi company fraud','ponzi scheme','mlm fraud','multi level marketing fraud','collective investment fraud','get rich scheme','quick money scheme','dubious investment','suspicious investment scheme','investment scheme not returning'],
      weak: ['cheated','fraud','scam','stolen','lost money','online','internet','digital','bank','money','transfer','hack']
    },
    sections: ['IT Act Sec 43 (Damage to computer)','Sec 66 (Computer related offences)','Sec 66C (Identity theft)','Sec 66D (Cheating by impersonation)','BNS Sec 316 (Cheating)','BNS Sec 318 (Cheating by personation)','Online fraud banking fraud KYC loan PAN misuse (online fraud banking cyber)','Mere khate se paise nikaale gaye online fraud (online fraud banking)','Illegal loan app threatening harassment recovery (banking cyber)'],
    documents: [
      { name: 'Bank statements showing fraudulent transactions', critical: true },
      { name: 'Screenshots of fake website/messages/calls', critical: true },
      { name: 'Transaction ID / UTR number', critical: true },
      { name: 'Phone call logs', critical: false },
      { name: 'Cybercrime complaint acknowledgement (cybercrime.gov.in)', critical: false }
    ],
    probingQuestions: [
      { q: 'What amount was lost and through which platform (UPI/Bank/Crypto)?', tip: 'Different platforms have different reversal and complaint mechanisms.' },
      { q: 'When did the fraud occur? (Within 24 hours is critical)', tip: 'Report to bank and cybercrime within 24 hours for highest chance of reversal.' },
      { q: 'Have you reported at cybercrime.gov.in or helpline 1930?', tip: 'National Cyber Crime Reporting Portal (NCCRP) is the official channel. Helpline: 1930.' },
      { q: 'Did you share OTP/password voluntarily or was your device compromised?', tip: 'Voluntarily sharing OTP reduces bank\'s liability but still constitutes fraud by the caller.' },
      { q: 'Can you identify the fraudster (name/account number/phone)?', tip: 'Even partial details can help trace. Bank can freeze beneficiary account on complaint.' }
    ],
    contextualQuestions: ['cyber'],
    limitation: 'Report within 24 hours to bank; FIR within 3 years',
    urgency: 'high',
    multiLawCompatible: ['Criminal – BNS (Fraud / Cheating)','Consumer – Product Defect / Service Deficiency']
  },

  {
    caseType: 'Cyber – Online Harassment / Cyberstalking / Defamation',
    lawCategory: 'Cyber & IT',
    actName: 'IT Act 2000 Sec 66A, 67 + BNS 2023',
    keywords: {
      exact: ['online harassment','cyber bullying','cyberstalking','trolling harassment','morphed photos circulated','deepfake misuse','revenge porn','intimate images shared without consent','online defamation','fake news spread about me','impersonating me online','fake social media profile of me','threats on social media','a person is continuously messaging me harassing me on instagram despite blocking','someone created a fake account with my name and is posting false things','my ex husband is using my private photos to blackmail me','my child is being cyberbullied by classmates on instagram','i am getting rape threats and abusive tweets from anonymous accounts','edited screenshot of my conversation being circulated defaming me','kisi ne facebook par mujhare baare mein galat baatein likhi','someone posted defamatory statements about me on facebook','newspaper published false allegations about my business','someone is giving me life threatening calls and messages','my ex boyfriend is stalking me outside my house','deepfake video of me circulated on social media','sextortion demand money or will send intimate video','facebook pe meri photo meri marzi ke bina dali hai','meri photo bina marzi social media pe dali'],
      strong: ['cyberstalking','online harassment','cyber harassment','digital harassment','social media harassment','fake profile','impersonation online','defamation online','morphed images','intimate images','revenge porn','non-consensual sharing','obscene content','threatening messages online','bullying online','trolling','doxing','life threatening calls','threatening calls','threatening messages','stalking','eve teasing following','fake account name','false statements facebook','defamatory facebook','newspaper false allegation','private photos blackmail','blackmail photos','screenshot circulated'],
      weak: ['harassed','stalked','threatened','defamed','fake','images','social media','online','photos','messages','threatening']
    },
    sections: ['IT Act Sec 66A (Offensive messages)','Sec 67 (Obscene material)','Sec 67A (Sexually explicit)','BNS Sec 356(2) (Criminal intimidation)','BNS Sec 351 (Defamation)','BNS Sec 77 (Voyeurism)','POCSO (if minor)','Online harassment deepfake AI morphed video cyber (online harassment cyber)','Defamatory whatsapp group message online harassment (online harassment defamation)','Police notice twitter social media cyber (police excess cyber)'],
    documents: [
      { name: 'Screenshots of harassing messages/posts', critical: true },
      { name: 'URL links of defamatory content', critical: true },
      { name: 'Proof of Identity of Victim', critical: true },
      { name: 'Profile screenshots before deletion', critical: true },
      { name: 'Chat history / email threads', critical: false }
    ],
    probingQuestions: [
      { q: 'Is the harasser known to you or anonymous?', tip: 'If known: direct FIR possible. If anonymous: Cyber Cell can trace via IP address.' },
      { q: 'What is the nature of the content? (Defamatory/Obscene/Threatening)', tip: 'Different sections apply depending on the nature of content.' },
      { q: 'Have you preserved all evidence (screenshots, URLs)?', tip: 'Take screenshots immediately – content may be deleted. Note date/time stamps.' },
      { q: 'Has the content been reported to the platform (Facebook/Instagram/Google)?', tip: 'Platforms must take down content within 72 hours of government order.' }
    ],
    contextualQuestions: ['cyber'],
    limitation: '3 years',
    urgency: 'high',
    multiLawCompatible: ['Criminal – BNS (Assault/Cruelty)','Family – Domestic Violence']
  },

  {
    caseType: 'Cyber – Data Theft / Hacking / Corporate Espionage',
    lawCategory: 'Cyber & IT',
    actName: 'IT Act 2000 Sec 43, 66, 72 + BNS 2023',
    keywords: {
      exact: ['company data stolen','employee stole data','database hacked','server hacked','ransomware attack','malware attack','confidential data leaked','trade secrets stolen','intellectual property stolen online','unauthorized access to systems','ddos attack on website','it act complaint for theft of confidential business data','theft of confidential business data','confidential business data stolen','it act complaint data theft','data theft complaint it act','app developed by me stolen and relaunched','code stolen and relaunched','software stolen by partner','stolen and relaunched by','my app was copied and relaunched'],
      strong: ['hacking','hacked','data breach','data theft','ransomware','malware','corporate espionage','unauthorized access','computer crime','data leaked','trade secret','confidential info stolen','password hacked','network intrusion','cyber attack business','it act complaint','it act violation','section 43 it act','section 66 it act','intellectual property stolen digital','code theft','software theft','app stolen','app copied','source code stolen','source code copied','confidential data theft','business data stolen'],
      weak: ['hacked','breach','data','server','system','access','leaked','compromised','attack','intrusion']
    },
    sections: ['IT Act Sec 43 (Computer damage)','Sec 43A (Data protection)','Sec 66 (Hacking)','Sec 66B (Stolen computer resource)','Sec 72 (Breach of confidentiality)','BNS Sec 316 (Cheating)'],
    documents: [
      { name: 'IT Audit Report showing breach', critical: true },
      { name: 'Server logs / Access logs', critical: true },
      { name: 'Evidence of data stolen (file names, database records)', critical: true },
      { name: 'Forensic report from IT team', critical: false }
    ],
    probingQuestions: [
      { q: 'Is this an individual attack or organised cybercrime gang?', tip: 'Organised attacks may involve state actors or criminal networks – escalate to CERT-In.' },
      { q: 'Have you reported to CERT-In (Indian Computer Emergency Response Team)?', tip: 'CERT-In must be notified of all data breaches under IT Rules 2013.' },
      { q: 'Is there financial loss or reputational harm?', tip: 'Quantify the loss for claim under IT Act Sec 43A.' }
    ],
    contextualQuestions: ['cyber','business'],
    limitation: '3 years',
    urgency: 'high',
    multiLawCompatible: ['Criminal – BNS (Fraud / Cheating)']
  },

  // BNS / BNSS – CRIMINAL
  {
    caseType: 'Criminal – BNS (Fraud / Cheating)',
    lawCategory: 'Criminal',
    actName: 'Bharatiya Nyaya Sanhita, 2023 (Sec 316–318) – replaces IPC Sec 415–420',
    keywords: {
      exact: ['cheated by contractor','builder cheated me','fraud by company','cheating case','fraud case','section 420','section 316 bns','deceived me and took money','promised goods never delivered','took advance and ran away','fraudulent misrepresentation','fake investment scam','ponzi scheme','chit fund fraud','advance taken and no work done','contract fraud','man married me by hiding his previous marriage','my husband married another woman without divorcing me','i got a call saying i won lottery they took fees but no prize came','i paid money to a consultancy for government job placement it was fraud','fake job agency ne paise liye job nahi mili','bank manager misused my loan account and forged my signature','contractor took full advance and ran away','ek vyakti ne mujhse dhoka karke lakh rupaye liye','ek vyakti ne mujhse dhoka karke 1 lakh rupaye liye','man married me took jewellery and money and disappeared had previous wife','someone broke into my house at night and stole valuables','someone used my aadhar number to take a loan fraudulently','i discovered the property i bought was fraudulently sold to me by non-owner','hospital billed for medicines not given and procedures not done','i invested in real estate project developer ran away with money','kisi company ne paise lekar service nahi di aur dhoka diya','online thug ne 2 lakh le liya paisa wapas nahi kiya','online thug ne paise le liye wapas nahi kiye','company formed without my knowledge using my aadhaar and signature','kisi ne mera aadhaar use karke company bana li mere bina bataye'],
      strong: ['cheating','fraud','deceived','misrepresentation','false promise','dishonest','took money','no delivery','fake documents','forged signature','cheque bounce','bounced cheque','negotiable instrument','dishonoured cheque','ni act','bigamy','hidden previous marriage','previous wife husband','already married','second marriage illegal','job placement fraud','aadhar fraud','aadhar loan','contractor advance fraud','matrimonial website fraud','lottery fraud call','ceo email fraud','real estate developer fraud','hospital billing fraud','paisa leke bhaag gaya','paise leke bhag gaya','paisa diya tha woh bhaag gaya','bhaag gaya paisa lekar','dhoka karke paise liye'],
      weak: ['cheated','lied','fraud','scam','money taken','not returned','promise broken','fake','forged','dishonest','deceit']
    },
    sections: ['BNS Sec 316 (Cheating)','BNS Sec 317 (Cheating by false personation)','BNS Sec 318 (Cheating – enhanced punishment)','NI Act Sec 138 (Dishonoured cheque)','BNS Sec 303 (Theft)','BNS Sec 308 (Criminal Coercion)','Online fraud digital signature misused cyber cheating (cyber online fraud)','Consumer cheating matrimonial website fake profiles (consumer copra)','Contractor took advance and disappeared money recovery (cheating money recovery)','Court affidavit false statement cheating defamation','Car sold as new but was repainted accident car (cheating consumer)','Divorce cheating bigamy husband married again (cheating divorce)','House break-in burglary theft assault (assault)','Data theft cyber morphed docs fraudulent use (data theft cyber)'],
    documents: [
      { name: 'Agreement / Contract (written proof of promise)', critical: true },
      { name: 'Payment Receipts / Bank Transfer proof', critical: true },
      { name: 'Communications (emails/WhatsApp/letters)', critical: true },
      { name: 'Bounced Cheque + Bank Return Memo (if NI Act)', critical: false },
      { name: 'Witness statements', critical: false }
    ],
    probingQuestions: [
      { q: 'What was the fraudulent act? (False promise / Fake documents / Impersonation)', tip: 'BNS Sec 318: cheating with fraudulent intent to cause wrongful loss carries 7 years imprisonment.' },
      { q: 'What is the total amount of loss?', tip: 'Amount determines whether to go to Magistrate Court or Sessions Court.' },
      { q: 'Is there a cheque that has bounced?', tip: 'Dishonoured cheque: mandatory legal notice within 30 days; complaint within 1 month thereafter.' },
      { q: 'Do you have written evidence of the transaction?', tip: 'Written contract, receipts, and messages are critical for cheating cases.' }
    ],
    contextualQuestions: ['criminal'],
    limitation: '3 years (civil); no limitation for serious criminal cases',
    urgency: 'high',
    multiLawCompatible: ['Consumer – Product Defect / Service Deficiency','Cyber – Online Fraud / Financial Cyber Crime']
  },

  {
    caseType: 'Criminal – BNS (Assault / Hurt / Grievous Hurt)',
    lawCategory: 'Criminal',
    actName: 'Bharatiya Nyaya Sanhita, 2023 Sec 74, 115, 117, 118',
    keywords: {
      exact: ['physically assaulted','beaten up badly','grievous hurt','acid attack','stabbed','knife attack','gang attack','mob lynching','road rage attack','hit and run assault','communal violence','section 323','assault complaint','our watchman beat up my family member and broke his arm','boys are continuously eve teasing my daughter on the way to college','my ex boyfriend is stalking me outside my house and work','my colleague slapped me at workplace','unknown persons abducted my son and are demanding ransom','my neighbor threw acid on my face because i rejected him','a group of people attacked my family based on rumor','my sc colleague was beaten up by upper caste persons using casteist slurs','my neighbor dog attacked me and injured my child','padosi ne gali di aur mujhe thappa maar diya','padosi ne maara aur gaali di','padosi ne thappa maara galian di'],
      strong: ['assault','beaten','attacked','hurt','injury','fracture','grievous hurt','bodily harm','physical attack','violence','battered','acid','burn','stabbed','shot','threat of violence','eve teasing','stalking','following me','life threatening calls','abduction','kidnapping','ransom','watchman beat','dog attack','neighbor dog','acid thrown','mob violence','casteist slur violence','slapped colleague','workplace assault','hit me','punched','kicked','slapped','beat me','beating me','punched me','kicked me','slapped me','neighbor hit','neighbor beat','broke my arm','broken arm','broke my leg','broken leg','broke my nose','broken nose','broke his arm','broke her arm','broke his leg','broke her leg','broke my hand','broke my wrist','broken bone','physical injury','bodily injury','padosi ne mara','mujhe mara padosi ne','naak toot gayi','haath toot gaya','pair toot gaya','mujhe maara','unhone mujhe mara','mujhe maara unhone'],
      weak: ['attacked','hit','hurt','injured','pain','police complaint','fir','fight','altercation','eve tease','stalk','threatening','watchman','dog bite','ransom','abduction','broke','broken','punch','kick','slap','beat','thrash']
    },
    sections: ['BNS Sec 115 (Voluntarily causing hurt)','BNS Sec 117 (Voluntarily causing grievous hurt)','BNS Sec 118 (Grievous hurt by dangerous weapons)','BNS Sec 74 (Assault or criminal force)','BNS Sec 127 (Attempt to murder)','BNSS Sec 173 (FIR)','Domestic violence eve teasing assault stalking (domestic violence posh)','PIL public interest for mob lynching abduction ransom (pil)','SC/ST atrocity assault casteist violence (sc/st)','Municipal liability dog bite animal attack neighbor (municipal)'],
    documents: [
      { name: 'FIR Copy', critical: true },
      { name: 'Medical Certificate / Hospital Records', critical: true },
      { name: 'Photographs of injuries', critical: true },
      { name: 'Witness Names and Statements', critical: false },
      { name: 'CCTV footage (if available)', critical: false }
    ],
    probingQuestions: [
      { q: 'Has an FIR been registered? Which police station?', tip: 'FIR should be registered at the nearest police station. If refused, approach Magistrate.' },
      { q: 'What is the nature and severity of injuries?', tip: 'Grievous hurt (fracture, loss of sense, disfigurement) carries higher punishment up to 7 years.' },
      { q: 'Are the attackers known to you?', tip: 'Known attackers: Section 160 BNSS allows police to arrest. Unknown: investigation with CCTV etc.' },
      { q: 'Were there any witnesses to the attack?', tip: 'Eyewitness testimony combined with medical evidence is crucial.' }
    ],
    contextualQuestions: ['criminal'],
    limitation: 'File FIR immediately; limitation 3 years for civil claim',
    urgency: 'high',
    multiLawCompatible: ['Family – Domestic Violence','Criminal – BNS (Fraud / Cheating)']
  },

  // ── BNS MURDER / CULPABLE HOMICIDE / DEATH ────────────────────────────────
  {
    caseType: 'Criminal – BNS (Murder / Culpable Homicide / Unnatural Death)',
    lawCategory: 'Criminal',
    actName: 'Bharatiya Nyaya Sanhita, 2023 – Sec 101–106 (Murder, Culpable Homicide, Death by Negligence)',
    keywords: {
      exact: [
        'my friend was murdered','my relative was murdered','my husband was killed',
        'my wife was killed','my son was killed','my daughter was killed',
        'someone killed my friend','someone poisoned my friend','friend got poisoned and died',
        'friend is dead due to poison','found dead body','dead body found',
        'death due to poisoning','murder by poisoning','suspicious death',
        'mysterious death','killed by neighbor','killed by relative',
        'contract killing','supari killing','honour killing',
        'husband killed wife','wife killed husband','domestic murder',
        'found my friend dead','found my relative dead','death in custody',
        'died in police custody','dowry death','burned alive','burnt alive',
        'hanged to death','pushed from building','fell from building suspicious',
        'accident or murder','unnatural death','sudden unexplained death',
        'mera dost mar gaya zehr se','meri behen ko zahr diya','uski hatya ho gayi',
        'murder ho gaya','qatl ho gaya','usse mara gaya','hatya ki gayi',
        'laash mili','dead body mili','suspicious death neighbor',
        'my family member was killed','police killed my son','encounter killing',
        'fake encounter','wrongful death','culpable homicide',
      ],
      strong: [
        'murdered','murder','killed','killing','dead','death','poisoned','poison',
        'homicide','culpable homicide','manslaughter','dead body','deceased',
        'victim died','victim is dead','died due to','cause of death',
        'post mortem','autopsy','section 174','section 302','section 304',
        'fir for murder','murder complaint','killed by','death by negligence',
        'death in custody','custodial death','encounter','fake encounter',
        'dowry death','498a death','bride burning','dowry murder',
        'found hanging','found dead','mysterious death','unexplained death',
        'accident causing death','medical negligence death','doctor negligence death',
        'zehr','zehrila','zahr diya','zahr khilaya','mar diya','mardiya',
        'hatya','qatl','maut','dead','mara gaya','maar diya','maar daala',
        'laash','shav','body mili','dead body mili','suspicious maut',
      ],
      weak: [
        'dead','died','death','killed','murder','poison','fatal','deceased',
        'accident','negligence','body','post mortem','fir','police','complaint',
        'unnatural','suspicious','family member','friend dead','relative dead',
      ],
    },
    sections: [
      'BNS Sec 101 (Murder – life imprisonment / death penalty)',
      'BNS Sec 102 (Culpable homicide not amounting to murder – up to 10 yrs)',
      'BNS Sec 103 (Punishment for murder)',
      'BNS Sec 105 (Culpable homicide – 10 yrs to life)',
      'BNS Sec 106 (Causing death by negligence – 2 to 7 yrs)',
      'BNS Sec 80 (Dowry death – 7 yrs to life)',
      'BNSS Sec 174 (Police inquest into unnatural death)',
      'BNSS Sec 176 (Magistrate inquest)',
      'IPC 302 (Pre-BNS equivalent for pending cases)',
    ],
    documents: [
      { name: 'FIR Copy (Section 101/102 BNS)', critical: true },
      { name: 'Post-Mortem / Autopsy Report', critical: true },
      { name: 'Death Certificate', critical: true },
      { name: 'Medical / Toxicology Report (for poisoning)', critical: true },
      { name: 'Witness Statements', critical: false },
      { name: 'Photographs / CCTV evidence', critical: false },
      { name: 'Chemical Examiner Report (if poisoning suspected)', critical: false },
    ],
    probingQuestions: [
      { q: 'Has an FIR for murder (Sec 101 BNS) been filed?', tip: 'File FIR immediately at the nearest police station. If police refuse, approach the Magistrate.' },
      { q: 'Was a post-mortem/autopsy conducted?', tip: 'Post-mortem is mandatory for unnatural deaths. Insist on it — results are critical evidence.' },
      { q: 'Do you have any suspects or is the killer known?', tip: 'Named vs unknown accused changes investigation approach and sections applied.' },
      { q: 'What was the cause of death (poisoning, violence, strangulation, etc.)?', tip: 'Toxicology report is key for poisoning cases. Request a copy immediately.' },
    ],
    contextualQuestions: ['criminal'],
    limitation: 'No limitation for murder. File FIR immediately.',
    urgency: 'high',
    multiLawCompatible: ['Criminal – BNSS (Bail / Anticipatory Bail / Criminal Procedure)','Criminal – BNS (Assault / Hurt / Grievous Hurt)'],
  },

  // ── BNS THEFT / ROBBERY / BURGLARY / DACOITY ─────────────────────────────
  {
    caseType: 'Criminal – BNS (Theft / Robbery / Burglary / Dacoity)',
    lawCategory: 'Criminal',
    actName: 'Bharatiya Nyaya Sanhita 2023 Sec 303–331 – Theft, Robbery, Dacoity, Burglary, Snatching',
    keywords: {
      exact: [
        'my car got stolen','car got stolen','vehicle got stolen','bike got stolen','scooter got stolen',
        'my car was stolen','my bike was stolen','my vehicle was stolen','two wheeler stolen',
        'someone stole my car','someone stole my bike','someone stole my phone','someone stole my laptop',
        'phone got stolen','mobile phone stolen','phone snatched','mobile snatched',
        'gold chain snatched','chain snatched by biker','purse snatched','bag snatched',
        'house was burgled','house was broken into','someone broke into my house','house break in',
        'thieves broke into my shop','robbery at knifepoint','robbed at gunpoint',
        'robbed on road','mugged near','my cash was stolen','jewellery stolen from house',
        'mera phone chori ho gaya','mera mobile chori hua','meri bike chori ho gayi',
        'meri gaadi chori ho gayi','ghar mein chori ho gayi','chor ghar mein ghus gaya',
        'bike chor le gaya','car chor le gaya','phone chor le gaya','chain snatch ho gayi',
        'loot ho gayi','loota gaya','loot liya','dakaiti ho gayi','dacoity',
        'shoplifting at my store','goods stolen from my shop','office theft',
        'laptop stolen from office','bag stolen from office','warehouse theft',
        'cash stolen from office','theft at workplace','employee stole from company',
        'car stolen from parking','stolen from mall','stolen from theater','stolen from market',
        'stolen while i was away','house robbed while on vacation','domestic help stole',
        'servant stole jewelry','maid stole cash','driver stole from car',
      ],
      strong: [
        'stolen','theft','robbery','burglary','dacoity','snatching','snatch','mugging','mugged',
        'pickpocket','looting','loot','robbed','burglar','break in','broke into',
        'chori','chor','dakaiti','loot','chain snatch','mobile snatch',
        'fir theft','police complaint theft','complaint theft','theft fir',
        'stolen vehicle','vehicle theft','car theft','bike theft','auto theft',
        'stolen phone','phone theft','mobile theft','stolen laptop','stolen jewellery',
        'stolen gold','stolen cash','stolen property','missing valuables',
        'stolen goods','goods missing','missing belongings','stolen belongings',
        'robbery complaint','robbery fir','snatching complaint','snatching fir',
        'anti theft','insurance claim theft','insurance stolen vehicle',
        'stolen with documents','rc book stolen','documents stolen with car',
        'car stolen report','ncr report','ncrb report','theft report police',
        'bns 303','bns 304','bns 305','bns 306','bns 309','bns 310','bns 311',
        'house break in complaint','burglary complaint','burglar alarm','intruder entered',
        'stole from me','stole my','they stole','stolen from me','stolen from my',
      ],
      weak: [
        'stolen','stole','theft','thief','rob','robbed','missing','lost','disappeared',
        'chori','chor','dakaiti','valuables','fir','police','complaint','vehicle',
        'car','bike','phone','mobile','laptop','jewelry','gold','cash','purse','bag',
      ],
      hinglish: [
        'mera phone chori hua','meri bike chori hui','meri gaadi chori hui',
        'ghar mein chori','dukan mein chori','office mein chori',
        'chain snatch ho gayi','mobile snatch ho gaya','purse snatch ho gaya',
        'chor ghus gaya ghar mein','chori ki fir kaise karein','police mein chori ki shikayat',
        'ghar se sona chori gaya','bijli ka meter chori','scooter chori gaya parking se',
      ],
    },
    sections: [
      'BNS Sec 303 (Theft – up to 3 yrs / 7 yrs repeated)',
      'BNS Sec 304 (Theft in dwelling house – 7 yrs)',
      'BNS Sec 309 (Robbery – 10 yrs)',
      'BNS Sec 310 (Dacoity – 10 yrs / life)',
      'BNS Sec 305 (Theft of vehicle – 7 yrs)',
      'BNS Sec 331(6) (Snatching – 3 yrs)',
      'Motor Vehicles Act (for vehicle theft insurance claim)',
      'Consumer Protection Act (for insurance claim denial after theft)',
    ],
    documents: [
      { name: 'FIR Copy (filed at local police station)', critical: true },
      { name: 'Vehicle Registration Certificate / RC Book (for vehicle theft)', critical: false },
      { name: 'Insurance Policy (for insurance claim)', critical: false },
      { name: 'List of stolen items with approximate value', critical: true },
      { name: 'CCTV footage (if available from location)', critical: false },
      { name: 'Witness details (if any)', critical: false },
    ],
    probingQuestions: [
      { q: 'What was stolen and approximately what is its value?', tip: 'Higher value thefts (>₹1L) attract heavier BNS sections and stronger investigation priority.' },
      { q: 'When and where did the theft/robbery occur?', tip: 'Exact location and time is critical for FIR and police investigation.' },
      { q: 'Was violence or threat of violence used (robbery/snatching)?', tip: 'Simple theft vs robbery changes the BNS section and sentencing significantly.' },
      { q: 'Have you already filed an FIR? If not, at which police station?', tip: 'FIR must be filed at the police station having jurisdiction over the area where theft occurred.' },
      { q: 'Do you have insurance on the stolen vehicle/property?', tip: 'Insurance claim requires FIR copy within 24-48 hrs of theft for most policies.' },
    ],
    contextualQuestions: ['criminal'],
    limitation: 'File FIR immediately — delay weakens investigation. Insurance claim: within 24-48 hrs.',
    urgency: 'high',
    multiLawCompatible: ['Motor Accident Claims / Personal Injury','Consumer – Insurance Claim Dispute'],
  },

  {
    caseType: 'Criminal – BNSS (Bail / Anticipatory Bail / Criminal Procedure)',
    lawCategory: 'Criminal',
    actName: 'Bharatiya Nagarik Suraksha Sanhita, 2023 – replaces CrPC',
    keywords: {
      exact: ['anticipatory bail','regular bail','bail application','arrested by police','police arrested my relative','sent to judicial custody','remand extended','chargesheet filed against me','accused in criminal case','wrongly arrested','false case filed','bail hearing','i want to quash a false fir filed against me','my relative was taken by police and no one knows where he is','i am in jail under ndps case and need bail','i am accused of drug trafficking what are my rights','if i file case will police come to my house first','magistrate petition under 156 3 for police to register fir','a warrant has been issued in my name i was unaware of the case','court passed order in my favor opponent is ignoring it','police seized my vehicle after case was dismissed not returning it','my case might have crossed limitation period','i received legal notice from someone what do i do'],
      strong: ['bail','anticipatory bail','regular bail','arrested','police custody','judicial custody','remand','chargesheet','accused','fir filed','criminal case','trial','acquittal','bailable offence','non-bailable','sessions court','high court bail','police torture','illegal detention','quash fir','quashing petition','156 3 crpc','156 bnss','bnss 528','high court quash','false fir quash','legal notice received','limitation period','warrant issued','notarized document','bnss','ndps bail','drug case bail'],
      weak: ['arrested','jail','prison','police','case','court','criminal','accused','bail','charge','offence','custody']
    },
    sections: ['BNSS Sec 479 (Bail)','Sec 482 (Anticipatory Bail)','Sec 187 (Police custody limit 24h)','Sec 173 (FIR)','Sec 223 (Chargesheet)','Sec 528 (Inherent powers of HC)','Sec 360 (Discharge)','Sec 432 (Acquittal)','High Court writ petition quash FIR (writ pil)','Police excess illegal detention bail habeas corpus (pil)','RTI about FIR status refusing to register FIR (rti)','Cheque bounce legal notice money recovery response (cheque bounce money recovery)','Specific performance contempt PIL writ police excess (specific performance bnss police excess pil writ)','Consumer cheating succession insurance civil criminal (consumer cheating succession insurance criminal bns)'],
    documents: [
      { name: 'FIR Copy', critical: true },
      { name: 'Arrest Memo', critical: true },
      { name: 'Remand Order', critical: false },
      { name: 'Chargesheet (if filed)', critical: false },
      { name: 'Identity Proof of Accused', critical: true },
      { name: 'Character Certificates', critical: false },
      { name: 'Surety documents (for bail)', critical: false }
    ],
    probingQuestions: [
      { q: 'Is the person arrested or just summoned/noticed?', tip: 'If only summoned, anticipatory bail may still be sought as a precaution.' },
      { q: 'What is the offence alleged? Is it bailable or non-bailable?', tip: 'Bailable offences: bail as of right. Non-bailable: at court discretion.' },
      { q: 'Which court is handling the case?', tip: 'Regular bail: Magistrate Court. Anticipatory bail: Sessions Court or High Court.' },
      { q: 'Has the chargesheet been filed or is the investigation ongoing?', tip: 'Default bail available under BNSS Sec 479 if chargesheet not filed within 60/90 days.' }
    ],
    contextualQuestions: ['criminal'],
    limitation: 'Anticipatory bail: before arrest; Regular bail: no limitation',
    urgency: 'high',
    multiLawCompatible: ['Criminal – BNS (Fraud / Cheating)','Criminal – BNS (Assault / Hurt)']
  },

  // TRANSFER OF PROPERTY ACT
  {
    caseType: 'Property – Transfer of Property / Sale Deed Dispute',
    lawCategory: 'Property',
    actName: 'Transfer of Property Act, 1882 + Registration Act, 1908',
    keywords: {
      exact: ['sale deed dispute','property transfer cheated','unregistered sale deed','property sold without my consent','fraudulent property transfer','forged sale deed','signature forged on property document','power of attorney misused','property registered without payment','gift deed dispute','relinquishment deed challenged','specific performance of sale','seller backing out of deal','someone mutated my property in their name using forged documents','i am an nri living in usa my brother has sold my india property without my permission','i repaid my loan fully bank is not releasing mortgage on my property','my brother sold joint family property without my consent','i discovered the property i bought was fraudulently sold to me by non-owner','i deposited title deeds with bank for mortgage bank now claiming ownership','my son took property in his name promising to care for me now neglects me'],
      strong: ['sale deed','transfer of property','registration','property fraud','power of attorney','gift deed','property dispute','title deed','conveyance deed','possession not given','money paid property not transferred','property agreement','sale agreement','token money','token money dispute','advance money property','previous owner not vacating','seller not vacating','owner not vacating','seller refusing possession','property possession not handed over','specific performance','agreement to sell','seller defaulting','forged documents property','mutation forged','sold without consent','mortgage not released','mortgage release bank','bank claiming ownership deposit','property sold without permission','joint property sold','brother sold property','nri property sold','sale consideration','balance payment property','remaining payment property','buyer not paying balance','buyer not paying remaining amount','remaining sale consideration','buyer took possession not paying','mutation not done my name','mutation pending after purchase','mutation not transferred after purchase','patwari mutation not done','khata not transferred','name not transferred property','mutation of property not done in my name','mutation not done in my name after purchase','property mutation not done after purchase','mutation not done after buying property'],
      weak: ['property','land','plot','flat','house','transfer','sale','buy','registration','stamp duty','document','deed','agreement']
    },
    sections: ['TPA Sec 54 (Sale)','Sec 55 (Rights / Duties of Buyer & Seller)','Sec 58 (Mortgage)','Sec 105 (Lease)','Registration Act Sec 17 (Compulsory registration)','Specific Relief Act Sec 10 (Specific performance)','BNS Sec 316 (Cheating)','GST stamp duty property registration dispute (gst)','PMLA benami property transaction attachment (pmla)','Senior citizen son property fraud transfer (senior citizen)'],
    documents: [
      { name: 'Sale Agreement / Agreement to Sell', critical: true },
      { name: 'Title Deed / Mother Deed', critical: true },
      { name: 'Payment Receipts (tokens, installments)', critical: true },
      { name: 'Registration documents', critical: true },
      { name: 'Encumbrance Certificate', critical: false },
      { name: 'Khata / Patta records', critical: false },
      { name: 'Power of Attorney (if involved)', critical: false }
    ],
    probingQuestions: [
      { q: 'Was there a registered Sale Agreement / Agreement to Sell?', tip: 'Unregistered agreements: enforceable but weaker in court. Registration is crucial.' },
      { q: 'What portion of the sale price has been paid?', tip: 'Full payment with proof strengthens specific performance claim.' },
      { q: 'Has the sale deed been registered at Sub-Registrar\'s office?', tip: 'Transfer of immovable property above ₹100 must be registered to be valid (Sec 17).' },
      { q: 'Is there a Power of Attorney (PoA) involved?', tip: 'PoA can be revoked. Check if PoA is valid and not cancelled.' },
      { q: 'Is the title clear? Any prior encumbrances or loans on the property?', tip: 'Title search + Encumbrance Certificate (EC) from Sub-Registrar office is mandatory.' }
    ],
    contextualQuestions: ['property'],
    limitation: '3 years from breach (Specific Performance); 12 years (Possession)',
    urgency: 'high',
    multiLawCompatible: ['Property – Hindu Succession / Inheritance Dispute','Criminal – BNS (Fraud / Cheating)','Civil – Specific Performance / Declaration']
  },

  // PROPERTY
  {
    caseType: 'Property – Boundary Dispute / Encroachment',
    lawCategory: 'Property',
    actName: 'Transfer of Property Act, 1882 + CPC Order 39',
    keywords: {
      exact: ['neighbour encroached','neighbour built wall on my land','illegal construction on my land','boundary dispute with neighbour','encroachment on my property','land grabbing','neighbour crossed boundary','boundary wall dispute','my neighbor is blocking my access road claiming it is his property','mere padosi ne meri zameen par deewar bana li','my neighbor keeps crossing into my garden and damaging my plants','land mafia encroached government land and built illegal colony','main dubai mein rehta hoon mera ghar india mein kisi ne kabza kar liya','zameen ka vivaad hai padosi ke saath court jana chahta hoon','i need urgent injunction to stop sale of disputed property','i want to file complaint about illegal building construction by my neighbor','local politician has grabbed my agricultural land using muscle power','my neighbor built a tall building blocking all light and ventilation','my property has a right of way passage neighbor blocked it','mere padosi ne meri zameen par kabza kar liya'],
      strong: ['encroachment','encroached','boundary','boundary wall','neighbour dispute','trespassing','illegal construction','unauthorized construction','wall on my property','land grabbing','occupied my land','my land taken','disputed land','survey report','mutation','neighbour','boundary stone','padosi ne zameen','kabza liya','deewar bana li','blocking access road','access road blocked','garden crossing','right of way blocked','padosi building','illegal construction neighbor','light ventilation blocked','politician grabbing land','local politician land grab','agricultural land grabbed muscle','survey number mismatch','survey number conflict','land records mismatch','patwari records mismatch','land record conflict possession','survey mismatch records','boundary dispute land records','neighbour removed boundary markers'],
      weak: ['wall','construction','fence','property line','plot','land','neighbour','dispute','my land','my property','adjacent','next door','boundary','padosi','zameen','kabza','deewar','access road','right of way','injunction property']
    },
    sections: ['Sec 6 TPA','Order 39 Rule 1 & 2 CPC (Temporary Injunction)','Specific Relief Act Sec 38','Easements Act','Adverse possession 12-year continuous possession claim (adverse possession)','Specific performance injunction stop sale of disputed property (specific performance)','Land acquisition government diverted canal agriculture (agriculture boundary)','Municipal building regulations illegal construction boundary','Transfer of property injunction stop sale declaration (transfer of property declaration)','Co-owner refuses to sell jointly owned property (specific performance)'],
    documents: [
      { name: 'Property Deed / Sale Deed', critical: true },
      { name: 'Survey Report / Mutation Record', critical: true },
      { name: 'Photographs of Encroachment', critical: true },
      { name: 'Property Tax Receipts', critical: false },
      { name: 'Municipal Map / Approved Layout', critical: false }
    ],
    probingQuestions: [
      { q: 'Is the construction ongoing or already completed?', tip: 'Ongoing construction: emergency injunction possible under Order 39 CPC within days.' },
      { q: 'Do you have a recent survey report confirming boundaries?', tip: 'A survey report from a government-licensed surveyor is the strongest evidence.' },
      { q: 'Have you sent a legal notice to the neighbour?', tip: 'A legal notice is usually the first step before approaching the court.' }
    ],
    contextualQuestions: ['property'],
    limitation: '12 years from date of encroachment',
    urgency: 'high',
    multiLawCompatible: ['Property – Hindu Succession / Inheritance Dispute']
  },

  {
    caseType: 'Property – Rent Dispute / Tenant Eviction',
    lawCategory: 'Property',
    actName: 'Rent Control Acts (State-specific) + Transfer of Property Act',
    keywords: {
      exact: ['tenant not paying rent','tenant refusing to vacate','evict tenant','landlord not returning deposit','landlord harassing tenant','illegal eviction','rent agreement dispute','security deposit not returned','makan malik bina wajah kiraya ghar se nikaal raha hai','makan malik bina wajah nikaalne ki koshish kar raha hai kiraye par'],
      strong: ['tenant','landlord','eviction','rent arrears','rental agreement','lease agreement','lease violation','deposit','security deposit','rent not paid','illegal subletting','evict','notice to vacate','tenancy','tenant not vacating','landlord not allowing'],
      weak: ['flat','house','apartment','renting','rent','monthly','paying','not paying','vacate','not vacating','contract','notice','lease']
    },
    sections: ['State Rent Control Act','Sec 106 TPA (Notice of termination)','Order 21 Rule 35 CPC (Execution)','Senior citizen daughter-in-law eviction domestic violence (senior citizen domestic violence)'],
    documents: [
      { name: 'Rental Agreement / Lease Deed', critical: true },
      { name: 'Rent Receipts / Bank Statements', critical: true },
      { name: 'Notice to Vacate', critical: true },
      { name: 'Property Ownership Proof', critical: true }
    ],
    probingQuestions: [
      { q: 'How many months of rent are pending?', tip: 'Arrears strengthen the eviction case considerably.' },
      { q: 'Is there a written registered rental agreement?', tip: 'A registered agreement is the strongest evidence in court.' },
      { q: 'Have you sent a legal notice to vacate?', tip: 'Mandatory notice period (15–30 days) must be given before filing eviction suit.' }
    ],
    contextualQuestions: ['property'],
    limitation: '3 years from cause of action',
    urgency: 'medium',
    multiLawCompatible: ['Civil – Money Recovery / Debt Recovery','Property – RERA Disputes / Builder Fraud']
  },

  {
    caseType: 'Property – RERA Disputes / Builder Fraud',
    lawCategory: 'Property',
    actName: 'Real Estate (Regulation and Development) Act, 2016',
    keywords: {
      exact: ['builder not giving possession','flat not delivered on time','builder fraud','rera complaint','builder delaying construction','builder took money and disappeared','promised possession date not met','builder changed specifications','construction stopped','building collapsed due to builder negligence','my builder delayed flat','builder selling common area of housing project to outsiders','i invested in real estate project developer ran away with money','i am a homebuyer builder is insolvent how do i get my money back','builder agreed to register flat in my name is taking more money','bank gave loan for flat now builder fraud'],
      strong: ['builder','developer','rera','possession delay','flat not delivered','apartment not ready','construction delay','builder cheating','booking cancelled','refund from builder','under-construction','real estate fraud','allotment letter','builder-buyer agreement','builder delayed flat','building collapsed builder','builder selling common area','developer ran away','homebuyer builder insolvent','builder taking more money','builder fraud bank loan'],
      weak: ['apartment','flat','property','booking','advance','construction','project','real estate','delayed','cheated','payment made']
    },
    sections: ['RERA Sec 18 (Penalty for delay)','Sec 31 (Complaints to Authority)','Sec 71 (Penalty for fraud)','Consumer Protection Act Sec 35','Medical negligence building collapse builder negligence death (medical negligence consumer copra)','IBC insolvency homebuyer financial creditor (banking)','Money recovery cheating real estate developer fraud (cheating money recovery)','Specific performance builder register flat in my name (specific performance)','Banking loan builder fraud bank RERA (banking)','Divorce family dispute RERA homebuyer (divorce)','Wrongful termination job loss RERA dispute (wrongful termination)','Housing society common area misuse RERA (housing society)'],
    documents: [
      { name: 'Booking Receipt / Allotment Letter', critical: true },
      { name: 'Builder-Buyer Agreement', critical: true },
      { name: 'Payment Receipts / Bank Statements', critical: true },
      { name: 'RERA Registration Certificate of Project', critical: true }
    ],
    probingQuestions: [
      { q: 'Is the project registered under RERA?', tip: 'RERA jurisdiction requires project registration.' },
      { q: 'What is the agreed possession date vs actual delay?', tip: 'Delay >2 months: entitled to refund with 10.75% interest, or compensation.' },
      { q: 'Total amount paid so far?', tip: 'You can claim full refund + interest for delayed possession.' }
    ],
    contextualQuestions: ['property'],
    limitation: '3 years from cause of action',
    urgency: 'medium',
    multiLawCompatible: ['Consumer – Product Defect / Service Deficiency','Criminal – BNS (Fraud / Cheating)']
  },

  // CONSUMER
  {
    caseType: 'Consumer – Product Defect / Service Deficiency',
    lawCategory: 'Consumer',
    actName: 'Consumer Protection Act, 2019 (COPRA) – Consumer Protection Act 1986',
    keywords: {
      exact: ['consumer complaint','defective product','service deficiency','consumer court complaint','company not refunding','insurance claim rejected','bank service complaint','consumer forum','consumer commission','product damaged delivered','service not as promised','hospital negligence','medical negligence','file consumer complaint','consumer protection act','copra complaint','consumer court case','i bought a refrigerator which stopped working within 1 month','i ordered a phone on amazon and received an empty box','i paid 1 year gym membership but gym closed without refund','travel agency took money but did not arrange hotel or flights','supermarket sold me expired food which made me sick','i bought a new laptop the screen stopped working in 15 days','hotel cancelled my confirmed booking at the last minute','bank charged maintenance fees without informing me','i bought a brand new bike which broke down within 10 days','edtech platform deducted full fees for course but content was removed','packaged drinking water bottle contained insects','instagram influencer took money for promotion and blocked me','college is not giving my degree certificate asking more money','private coaching institute shut down mid-year no refund','my refrigerator stopped working in 2 months','solar panels installed by company are not working as promised','my prepaid gym membership ran for only 2 months gym closed','my landlord is not returning my security deposit after i vacated','driving school took fees but did not provide proper training','i ordered product from a fake website it was not delivered','my car has manufacturing defect dealer refuses to replace under warranty','the product did not work as advertised on tv it is misleading','my newly purchased washing machine broke down in 2 months warranty claim refused','my advocate took fees but did not file the case in time and i lost it','maine ek AC kharida jo chalu hi nahi hua company replace nahi kar rahi','mujhe kharab maal becha gaya aur company return nahi le rahi','kisi company ne paise lekar service nahi di aur dhoka diya','matrimonial website showed fake profiles i was cheated consumer copra','after i left review the company is threatening to sue me for defamation','building collapsed due to builder negligence my family member died','bank charged unnecessary fees without my consent for account','bank charging prepayment penalty on floating rate home loan','electricity board disconnected my supply without notice','my electricity bill is 10 times higher than usual without reason','i paid for online course platform shut down no refund',
        // ── Vehicle / Automotive service ────────────────────────────────────
        'my car service is troublesome','car service is troublesome','car keeps stopping after service','car keeps breaking down after service','car service station making me go around','service station not fixing my car','service center not resolving car complaint','authorized service center not fixing problem','car service center cheating','car workshop cheating','maruti service center complaint','honda service center complaint','hyundai service center complaint','tata service center complaint','two wheeler service center complaint','bike service center not fixing','scooter service center complaint','car dealer sold defective car','car dealer not replacing defective car','new car breaking down repeatedly','car under warranty but dealer refusing repair','warranty claim rejected car','car warranty not honored','service station gave wrong parts','wrong spare parts fitted in car','car service overcharged','service center charged for parts not replaced','ghost billing at service center','service center did not fix the problem','repeated visits to service center','car repaired multiple times same problem','same problem recurring after service','car stops on road after service','car not fixed despite multiple repairs','vehicle not repaired properly','my car is repaired but same issue keeps coming back','service centre keeps sending me back and forth',
        // ── Telecom / Utility ────────────────────────────────────────────────
        'internet not working despite paying','broadband not working complaint','jio airtel vi complaint','electricity bill wrong','water supply not provided','gas connection complaint','lpg not delivered','cylinder not delivered','piped gas problem',
      ],
      strong: ['consumer complaint','defective','service deficiency','washing machine','consumer court','unfair trade practice','misleading advertisement','refund denied','replacement denied','insurance rejected','bank dispute','telecom complaint','medical negligence','hospital','doctor negligence','product liability','e-commerce dispute','copra','consumer protection','consumer redressal','district forum','state commission','national commission','gym membership refund','gym closed no refund','travel agency cheated','travel agency took money','expired food','empty box online','empty box amazon','online order not delivered','bike broke down','laptop screen stopped','refrigerator stopped working','solar panels not working','coaching institute closed','edtech refund','degree certificate withheld','hotel booking cancelled','security deposit landlord not returned','influencer fraud','driving school fraud','fake website order','manufacturing defect','product fire','product caught fire','ac fire','hotel overcharge','hotel charged more','hotel cheated','overcharged hotel','defective air conditioner',
        // ── Vehicle service ──────────────────────────────────────────────────
        'car service','service center','service centre','service station','authorized service center','authorised service centre','car service center','car service centre','bike service','two wheeler service','vehicle service','car workshop','auto workshop','car mechanic','dealer service','service not satisfactory','car not fixed','vehicle not fixed','car repair complaint','vehicle repair complaint','warranty repair refused','warranty not honored','warranty rejected','car breakdown after service','vehicle breakdown after service','same problem recurring','not repaired properly','car keeps stopping','vehicle keeps stopping','ghost billing','overcharged service','wrong parts fitted','spare parts fraud','service center fraud','car service fraud','maruti complaint','honda complaint','hyundai complaint','tata motors complaint','mahindra complaint','bajaj complaint','tvs complaint','hero complaint','yamaha complaint','suzuki complaint',
        // ── Telecom / Utility ────────────────────────────────────────────────
        'broadband complaint','internet not working','telecom fraud','jio complaint','airtel complaint','electricity complaint','electricity bill wrong','utility complaint','gas complaint','lpg complaint',
      ],
      weak: ['complaint','defective','bad service','poor quality','cheated','consumer','refund','replacement','product','service','company','warranty','guarantee','gym','travel','hotel','online shopping','amazon','flipkart','institute','degree','certificate','solar','influencer']
    },
    sections: ['Consumer Protection Act Sec 2 (Definitions)','Sec 35 (Complaint to District Commission)','Sec 47 (Jurisdiction)','Sec 58 (Appeals)','Sec 88 (Product Liability)','COPRA consumer protection rights (copra)','Defamation consumer threat by company','Online fraud refund consumer platform shutdown','Medical negligence consumer COPRA claim','Advocate negligence consumer forum (copra)','Banking consumer RBI mandated relief','Telecom TRAI blocking calls consumer copra (consumer copra)'],
    documents: [
      { name: 'Purchase Receipt / Invoice', critical: true },
      { name: 'Product / Service Description / Contract', critical: true },
      { name: 'Photographs of Defective Product', critical: false },
      { name: 'Correspondence with Company (email/chat)', critical: true }
    ],
    probingQuestions: [
      { q: 'What is the value of goods/services in dispute?', tip: 'District Commission: up to ₹50 lakh. State: up to ₹2 crore. National: above ₹2 crore.' },
      { q: 'Have you sent a legal notice to the company / hospital?', tip: 'Sending a notice before filing is best practice and often results in settlement.' },
      { q: 'What redressal are you seeking? (Refund/Replacement/Compensation)', tip: 'Compensation can include mental agony, litigation costs, and consequential losses.' }
    ],
    contextualQuestions: ['consumer'],
    limitation: '2 years from cause of action',
    urgency: 'medium',
    multiLawCompatible: ['Property – RERA Disputes / Builder Fraud','Criminal – BNS (Fraud / Cheating)']
  },

  // CIVIL
  {
    caseType: 'Civil – Money Recovery / Debt Recovery',
    lawCategory: 'Civil',
    actName: 'Civil Procedure Code, 1908 + Recovery of Debts Act, 1993',
    keywords: {
      exact: ['money not returned','loan not repaid','friend borrowed money not returning','partner took money and left','debt recovery','personal loan not paid','promissory note not honoured','cheque bounced for loan','business partner took money','advance not refunded','not repaying my loan','he is not returning money','gave loan and not returning','gave money not returning','recover money from friend','lent money not returned','borrowed money refusing to pay','i completed a project for a client who is now refusing to pay my fees','my client owes me 2 lakhs for services but has not paid','i am a supplier i delivered goods worth 8 lakhs buyer not paying','i am an msme supplier large corporate has not paid for 120 days','my brother took 3 lakhs from me and not returning for 2 years','i gave security deposit to my office landlord who now refuses to return','i obtained money decree in court but person is not paying','my business partner left and owes me 5 lakhs from the partnership','the contractor i hired for work is not paying me my dues','my ex employer owes me 6 months salary and pf dues','my contractor is not paying me for work i completed','customer not paying invoice for services rendered 6 months ago','client not paying invoice for services','sold car to buyer took partial payment disappeared','car buyer partial payment disappeared','yaar ko paise diye the 2 saal ho gaye wapas nahi kiye','yaar ne 2 saal mein paise wapas nahi kiye'],
      strong: ['money recovery','debt recovery','loan recovery','unpaid loan','borrower defaulted','promissory note','money owed','cheque bounced','dishonoured cheque','emi default','principal not returned','guarantor liability','surety','recovery suit','recover money','not repaying','written agreement loan','lent money','friend borrowed','gave loan','repay loan','loan amount','return money','pay back','outstanding amount','money due','project fees not paid','client refusing to pay','professional fees due','overdue payment','delivered goods not paid','msme buyer not paying','invoice overdue','business partner owes','security deposit office not returned','money decree not paid','paisa wapas nahi','paise wapas nahi de raha','dost ne paisa nahi diya','paisa wapas kar','dost ka paise wapas','wapas nahi kar raha paise','money wapas nahi','dost ne paise nahi diye','dost ne paise nahi diye wapas','paise nahi diye wapas','contractor took payment','contractor took advance','contractor took money not doing work','contractor not returning money','contractor payment not refunded','yaar ko paise diye wapas nahi kiye','yaar ne paise nahi diye','dost ko paise diye wapas nahi aaye','2 saal ho gaye paise wapas nahi'],
      weak: ['money','loan','borrowed','lent','owe','debt','repay','default','not returned','not paid','recover','due','agreement','friend','amount']
    },
    sections: ['CPC Order 37 (Summary Suit for cheque)','CPC Sec 9 (Civil court jurisdiction)','NI Act Sec 138 (Cheque bounce)','Recovery of Debts Act Sec 19','Limitation Act Sec 3','Specific performance of decree enforcement (specific performance)','Cheating contractor advance fraud money recovery (cheating)','MSME partner co-founder equity money recovery (arbitration)','Criminal complaint money recovery fraud (bnss criminal)','Wrongful termination salary hike promise specific performance (wrongful termination)','Online fraud banking cyber (online fraud banking cyber)'],
    documents: [
      { name: 'Promissory Note / Loan Agreement', critical: true },
      { name: 'Bank Statements (showing loan transfer)', critical: true },
      { name: 'Bounced Cheque + Bank Return Memo', critical: false },
      { name: 'Messages/Emails acknowledging the debt', critical: false }
    ],
    probingQuestions: [
      { q: 'Is there a written agreement (promissory note / loan agreement)?', tip: 'Written evidence dramatically improves success. Oral loans require other proof.' },
      { q: 'What is the total amount including interest?', tip: 'Include interest at agreed rate or 6% per annum if not agreed.' },
      { q: 'Has a legal notice been sent?', tip: 'Legal notice is mandatory before filing for cheque bounce (NI Act Sec 138).' }
    ],
    contextualQuestions: ['civil'],
    limitation: '3 years from due date',
    urgency: 'medium',
    multiLawCompatible: ['Criminal – BNS (Fraud / Cheating)','Consumer – Product Defect / Service Deficiency']
  },

  {
    caseType: 'Civil – Partition Suit',
    lawCategory: 'Civil',
    actName: 'Partition Act, 1893 + Hindu Succession Act, 1956',
    keywords: {
      exact: ['partition of property','want my share of property','joint property division','co-owner wants partition','property to be divided','partition deed','partition among brothers','family property partition','ancestral property partition','we are 4 brothers we want to divide our father land equally through court','we need to divide ancestral gold jewellery and moveable assets','meri maa ki death ke baad bhai mere hisse ki zameen nahi de rahe','my brother sold joint family property without my consent','after my father died we want to divide property among 3 sons','my mother died leaving a house for all 4 of us how to divide','my co-owner is refusing to sell the property we jointly own','father died divide property sons court','bhai ne puri sampatti apne naam kara li baap ke marne ke baad','baap ke marne ke baad bhai ne sampatti apne naam kar li'],
      strong: ['partition','co-owner','joint ownership','share in property','divided','property distribution','equal share','co-heir','partition suit','physical partition','sale of joint property','joint family property','brothers divide land','4 brothers land','divide ancestral','ancestral jewellery divide','moveable assets divide','father land divide','family property divide','sold joint property without consent','batwara','zameen ka batwara','ghar ka batwara','zameen batwara','property batwara','batwara karna hai','batwara chahiye','bhai ne poori zameen apne naam kar li','bhai ne sari zameen le li','bhai ne zameen apne naam ki','baap ke marne ke baad bhai ne zameen li','sister claiming ancestral share','brother took entire property'],
      weak: ['share','property','divided','family','brothers','sisters','ownership','co-owner','relatives','jewellery divide','moveable assets','ancestral divide','divide equally']
    },
    sections: ['Partition Act 1893','Order 20 Rule 18 CPC','Hindu Succession Act Sec 6','Specific Relief Act','Co-owner refuses sale specific performance (specific performance)'],
    documents: [
      { name: 'Property Documents / Title Deeds', critical: true },
      { name: 'Proof of Co-ownership', critical: true },
      { name: 'Legal Heir Certificate / Family Tree', critical: true },
      { name: 'Mutation Records', critical: false }
    ],
    probingQuestions: [
      { q: 'How many co-owners / sharers are there?', tip: 'All co-owners must be made parties to the partition suit.' },
      { q: 'Is the property physically divisible or must it be sold?', tip: 'Court orders partition-in-kind if possible; else orders sale and division of proceeds.' },
      { q: 'Are all co-owners agreeable to partition?', tip: 'Mutual partition by registered deed is faster and cheaper than court partition.' }
    ],
    contextualQuestions: ['property'],
    limitation: '12 years',
    urgency: 'low',
    multiLawCompatible: ['Property – Hindu Succession / Inheritance Dispute','Succession – Will Dispute / Probate']
  },

  // MOTOR ACCIDENT
  {
    caseType: 'Motor Accident Claims / Personal Injury',
    lawCategory: 'Motor Accident',
    actName: 'Motor Vehicles Act, 1988 (Amended 2019)',
    keywords: {
      exact: ['motor accident claim','accident compensation','vehicle hit me','met with accident','road accident injury','motor accident tribunal','mact claim','insurance company not paying','third party claim','accident death compensation','permanent disability due to accident','hit and run compensation','a vehicle hit my child who was walking to school','vehicle hit my 8 year old child walking to school','a vehicle hit my 8 year old child who was walking to school','a car jumped divider and hit me','i was walking on footpath a car jumped divider and hit me','i was walking on footpath a car hit me','pedestrian hit by vehicle on road','a vehicle with another state registration hit me and driver fled','vehicle with another state registration hit me driver fled','pothole on road caused my accident','i was a pedestrian hit by a car','vehicle rammed into me while crossing road','a vehicle hit me while i was walking to school'],
      strong: ['accident','road accident','vehicle accident','compensation','injury','insurance claim','motor vehicle','mact','tribunal','death in accident','disability','permanent disability','medical expenses accident','hit and run','drunk driver','negligent driving'],
      weak: ['accident','injured','vehicle','car','bus','truck','bike','road','hit','compensation','insurance']
    },
    sections: ['MV Act Sec 140 (No-fault liability)','Sec 163A (Structured formula compensation)','Sec 166 (Application to Claims Tribunal)','Sec 185 (Driving under influence)','Motor accident pedestrian hit by vehicle on road or footpath','PIL for pothole road accident government liability','Hit and run vehicle identification inter-state vehicle','Disabled child school hit by vehicle disability education (disabilit education)','Road widening demolition land acquisition compensation (land acquisition municipal)','Cheating consumer car sold as repainted accident (cheating consumer)'],
    documents: [
      { name: 'FIR Copy (from police)', critical: true },
      { name: 'Medical Records / Hospital Bills', critical: true },
      { name: 'Insurance Policy of Offending Vehicle', critical: true },
      { name: 'Vehicle Registration Certificate', critical: false },
      { name: 'Disability Certificate (if applicable)', critical: false },
      { name: 'Income Proof (for loss of income claim)', critical: false },
      { name: 'Death Certificate (if fatality)', critical: false }
    ],
    probingQuestions: [
      { q: 'What is the nature and extent of injury? (Minor/Major/Permanent disability/Death)', tip: 'Compensation amount varies greatly based on injury severity and income.' },
      { q: 'Was the vehicle insured? (Third party / Comprehensive)', tip: 'Third party insurance is mandatory. Compensation from insurer even if driver unidentified.' },
      { q: 'Was an FIR registered? Was the driver arrested?', tip: 'FIR essential for MACT claim. Hit-and-run: solatium from government fund available.' },
      { q: 'What is your monthly income? (for loss of earning calculation)', tip: 'Structured compensation = income × multiplier factor based on age.' }
    ],
    contextualQuestions: ['criminal','civil'],
    limitation: '3 years from accident',
    urgency: 'high',
    multiLawCompatible: ['Consumer – Product Defect / Service Deficiency','Criminal – BNS (Assault / Hurt)']
  },

  // ── CHEQUE BOUNCE ───────────────────────────────────────────────────────────
  {
    caseType: 'Criminal – Cheque Bounce (NI Act Sec 138)',
    lawCategory: 'Criminal',
    actName: 'Negotiable Instruments Act, 1881 – Section 138 / Cheque Bounce / Dishonour of Cheque',
    keywords: {
      exact: ['cheque bounced','cheque dishonoured','cheque returned unpaid','cheque bounce complaint','cheque not cleared','my cheque bounced','cheque was bounced','cheque return memo','cheque bounce case','cheque bounce notice','ni act section 138','section 138 complaint','cheque bounce 138','my tenant gave me post dated cheque for rent which dishonoured','5 post dated cheques from my tenant all bounced','i am nri my business partner in india gave cheque which bounced','i am nri my tenant in india issued cheque for rent which bounced','my buyer being an msme issued me a cheque which bounced','person committed fraud and also owes me money through cheque'],
      strong: ['cheque bounce','dishonoured cheque','returned cheque','insufficient funds','cheque not honoured','cheque complaint','ni act','negotiable instruments act','sec 138','section 138','cheque return','bank returned cheque','bounce cheque','cheque case','cheque dishonour','post dated cheque','post-dated cheque','tenant cheque','rent cheque bounced','nri cheque bounce','business partner cheque','msme cheque bounce'],
      weak: ['cheque','bounce','dishonour','bank','returned','funds','payment','legal notice','demand notice','15 days','30 days']
    },
    sections: ['NI Act Sec 138 (Cheque Bounce – criminal complaint)','NI Act Sec 141 (Offence by companies)','NI Act Sec 142 (Cognizance of offence)','CrPC/BNSS (Summons, Trial)',],
    documents: [
      { name: 'Original Bounced Cheque', critical: true },
      { name: 'Bank Return Memo / Dishonour Memo', critical: true },
      { name: 'Legal Notice sent within 30 days', critical: true },
      { name: 'Proof of Notice delivery (postal/courier receipt)', critical: true },
      { name: 'Underlying transaction proof (agreement, invoice)', critical: false },
      { name: 'Bank statement showing cheque presentation', critical: false }
    ],
    probingQuestions: [
      { q: 'When was the cheque presented and when did it bounce?', tip: 'Complaint must be filed within 1 month of expiry of 15-day demand notice period.' },
      { q: 'Was a legal demand notice sent within 30 days of the bounce?', tip: 'Sending a demand notice is mandatory. If not done, the complaint may not be maintainable.' },
      { q: 'Did the drawer fail to pay within 15 days of receiving the notice?', tip: 'The cause of action arises if payment is not made within 15 days of receiving the notice.' },
      { q: 'What was the cheque given for? (Loan / goods / services / security)', tip: 'Cheque must be towards legally enforceable debt. Post-dated security cheques are also covered.' }
    ],
    contextualQuestions: ['criminal','civil'],
    limitation: '1 month after 15-day notice period expires',
    urgency: 'high',
    multiLawCompatible: ['Civil – Money Recovery / Debt Recovery','Criminal – BNS (Fraud / Cheating)']
  },

  // ── 498A / DOWRY PROHIBITION ─────────────────────────────────────────────
  {
    caseType: 'Criminal – Dowry Prohibition / 498A IPC (BNS Sec 85)',
    lawCategory: 'Criminal',
    actName: 'Dowry Prohibition Act, 1961 + BNS Sec 85 / IPC Sec 498A – Dowry Harassment / Cruelty by Husband',
    keywords: {
      exact: ['498a complaint','ipc 498a','bns 85','dowry case','dowry harassment complaint','dowry demand by in-laws','in-laws demanding dowry','husband harassing for dowry','filed 498a case','498a false case','false 498a','dowry prohibition act','dowry death','dowry related cruelty','dowry torture','my sister died suspiciously at in-laws house within 2 years of marriage','my in-laws are demanding gold and cash and threatening me','meri saas dahej maang rahi hai','man married me took jewellery and money and disappeared had previous wife','sasural wale dahej maang rahe hain aur maar peet karte hain','i am nri summoned to india for 498a case','my nri husband wife filed 498a case to trap him'],
      strong: ['dowry','498a','dowry harassment','dowry demand','dowry prohibition','in-laws cruelty','husband cruelty dowry','bns sec 85','cruelty by husband','streedhan not returned','streedhan','matrimonial cruelty','dowry related','anti-dowry','dowry dispute','sister died in-laws','suspicious death in-laws','2 years of marriage death','demanding gold cash','saas dahej','in-laws demanding jewellery','meri saas','nri 498a summoned','nri husband 498a','dahej ke liye tang','dahej ke liye maar','sasural walon ne dahej','dahej maanga aur maara','maar peet ki dahej','dahej ki maang','dahej le aaiye','dahej maang ke dhamki','dahej maang','dahej ki dhamki','dahej ke liye dhamki','dahej maangna','pita ji ko dhamki dahej'],
      weak: ['harassment','in-laws','cruelty','marriage','gifts','jewellery','demand','pressure','torture','husband','wife']
    },
    sections: ['BNS Sec 85 / IPC Sec 498A (Cruelty by husband / relatives)','Dowry Prohibition Act Sec 3 (Giving/taking dowry)','Dowry Prohibition Act Sec 4 (Demand for dowry)','BNS Sec 80 / IPC Sec 304B (Dowry Death)','DV Act Sec 18 (Protection Order)','Bail anticipatory bail 498A NRI husband (bail nri)','Muslim mehr dowry nicht paid (dowry)','Bigamy second marriage without divorce cheating (divorce cheating)'],
    documents: [
      { name: 'FIR Copy / Police Complaint', critical: true },
      { name: 'Medical Reports (injuries from cruelty)', critical: true },
      { name: 'Proof of Dowry Demand (messages, audio, witnesses)', critical: true },
      { name: 'List of Streedhan / Gifts given at marriage', critical: false },
      { name: 'Marriage Certificate', critical: false },
      { name: 'Witness statements', critical: false }
    ],
    probingQuestions: [
      { q: 'What specific demands are being made? (cash, gold, property, vehicle)', tip: 'Specific demands with amounts strengthen the complaint significantly.' },
      { q: 'Has any physical violence occurred along with the demands?', tip: 'Physical violence makes it 498A (criminal cruelty) + DV Act, which is more enforceable.' },
      { q: 'Is there any written proof or voice messages of the demand?', tip: 'WhatsApp messages, call recordings, emails are strong evidence of dowry demands.' },
      { q: 'Has a police complaint been filed?', tip: 'FIR can be filed at local police station. Women can also approach Mahila Thana.' }
    ],
    contextualQuestions: ['family','criminal'],
    limitation: 'FIR at any time; DV Act no strict limitation',
    urgency: 'high',
    multiLawCompatible: ['Family – Domestic Violence','Family – Divorce (Contested)']
  },

  // ── MUSLIM PERSONAL LAW ──────────────────────────────────────────────────
  {
    caseType: 'Family – Muslim Personal Law (Divorce / Mehr / Maintenance)',
    lawCategory: 'Family',
    actName: 'Muslim Personal Law (Shariat) Application Act, 1937 + Muslim Women Protection Act, 2019 (Triple Talaq) + CrPC Sec 125',
    keywords: {
      exact: ['triple talaq','instant talaq','talaq-e-biddat','talaq given over whatsapp','talaq over phone','husband gave talaq','nikah dissolution','nikah halala','mahr not paid','mehr not paid','meher not paid','iddat period','iddat maintenance','muslim divorce','divorce under muslim law','muslim personal law','dissolution of marriage muslim','khula','mubarat','talaq-ul-biddat','musl divorce','husband has taken second wife without first wife consent','husband took second wife no consent','doosri shadi without consent','pati ne doosri shadi kar li','pati ne doosri shadi kar li mujhe bataye bina','husband has taken second wife without first wifes consent','second wife without first wife consent','husband second wife without consent of first wife'],
      strong: ['talaq','mehr','mahr','meher','nikah','iddat','khul','mubarat','muslim marriage','muslim divorce','muslim maintenance','muslim personal law','shariat','muslim woman','dissolution of nikah','nikahnama','muslim husband','muslim wife','anti triple talaq','muslim women act','section 125 muslim','second wife without consent','second marriage without telling','doosri shadi','doosri wife','polygamy without consent'],
      weak: ['muslim','islamic','islam','divorce','marriage','husband','maintenance','nikah','religion','personal law','sharia']
    },
    sections: ['Muslim Women (Protection of Rights on Marriage) Act 2019 (Triple Talaq)','Muslim Women (Protection of Rights on Divorce) Act 1986','Muslim Personal Law (Shariat) Application Act 1937','CrPC Sec 125 / BNSS (Maintenance)','Dissolution of Muslim Marriages Act 1939 (Khula)','Muslim maintenance mehr after divorce (muslim maintenance alimony)','Muslim divorce khula talaq-e-ahsan (muslim divorce divorce)','POCSO minor child marriage muslim (pocso)','Dowry mehr nicht paid (dowry)'],
    documents: [
      { name: 'Nikahnama (Marriage Certificate)', critical: true },
      { name: 'Proof of Talaq / Divorce Communication', critical: true },
      { name: 'Proof of Mehr / Mahr amount agreed', critical: false },
      { name: 'Proof of Iddat period expenses', critical: false },
      { name: 'Birth certificates of children', critical: false }
    ],
    probingQuestions: [
      { q: 'What type of divorce? (Talaq / Khula / Mubarat / Court dissolution)', tip: 'Triple Talaq (instant) is now a criminal offence. Khula is wife-initiated dissolution.' },
      { q: 'Was the mehr (dower) amount paid? Is it outstanding?', tip: 'Mehr is a right of the wife. Unpaid mehr can be recovered as a money decree.' },
      { q: 'Is the wife claiming iddat maintenance or post-divorce maintenance?', tip: 'Iddat maintenance is mandatory. Post-iddat claim depends on personal law and Sec 125 CrPC.' },
      { q: 'Were there children? Is custody a concern?', tip: 'Muslim law gives mother custody of young children (hizanat) till a specific age.' }
    ],
    contextualQuestions: ['family'],
    limitation: 'Varies – file promptly',
    urgency: 'medium',
    multiLawCompatible: ['Family – Maintenance / Alimony','Family – Child Custody / Guardianship']
  },

  // ── PIL / CONSTITUTIONAL / WRIT ──────────────────────────────────────────
  {
    caseType: 'Constitutional – PIL / Writ Petition / Fundamental Rights',
    lawCategory: 'Constitutional',
    actName: 'Constitution of India – Articles 32, 226 / PIL / Writ / Fundamental Rights / RTI Act',
    keywords: {
      exact: ['file pil','public interest litigation','writ petition high court','writ petition supreme court','article 226 high court','article 32 supreme court','fundamental rights violated','file writ','habeas corpus','mandamus','certiorari','prohibition writ','quo warranto','right to information','rti application','rti appeal','right to information act','my relative was taken by police and no one knows','police killed my relative fake encounter','factory polluting river government doing nothing','illegal stone quarry near my village','government school building in dangerous condition','land mafia encroached government land built illegal colony','municipality allowing encroachment on public road','want to quash fir','quash false fir','rti information about status of fir','rti to get my answer sheet government exam','file complaint with lokpal','government hospital no doctors for months','private college discriminating in admissions','government hospital has no doctors for 6 months serving thousands of villagers','state hospital has no doctors since 6 months for 50000 patients','vote rigging happened in our ward election i want to challenge','election commission is not issuing voter id card despite multiple applications','my child was taken by ex husband and is being held away from me','i want information about cost and work on road construction in my area','i want to RTI about how my aadhar data is being used','my college affiliation was cancelled arbitrarily want writ','private college affiliated to university discriminating in admissions','factory chemical waste is contaminating our village water source','factory pollution is causing cancer in our village what law can i use','i found children working in a brick kiln factory','local politician has grabbed my agricultural land using muscle power','my maid was trafficked from another state by a placement agency','police is refusing to register FIR for cognizable offence','i went to police station to report crime but they refused to register FIR','my ration card application has been pending for 2 years','i want RTI to get my answer sheet for government exam evaluation','i want to RTI my answer sheet evaluation from state board'],
      strong: ['pil','writ','fundamental rights','constitutional right','article 21','article 14','article 19','article 32','article 226','right to life','right to equality','human rights','national human rights','state human rights','constitutional remedy','government accountability','public interest','corruption pil','rti','right to information','information commissioner','refuse to register fir','police refusing to file','magistrate 156','156 3 crpc','156 bnss','quash fir','fake encounter','relative taken by police','factory polluting','illegal quarry','land mafia encroach','illegal colony','illegal building government','government not acting','habeas corpus petition','lokpal complaint','lokayukta complaint','not giving information','not giving me information','denied information','information denied','refused information','government not providing information','not sharing information','information not given','applied for information','information request denied','government records denied','public records denied','file rti','want to file rti','apply for rti','government data','government documents denied','not providing information','refusing to give information','applied for information','information from government'],
      weak: ['government','authority','rights','constitution','public','fundamental','violation','court','petition','illegal','corruption','bureaucracy','official','rti','right to information','lokpal','lokayukta','nhrc','writ','fir refused']
    },
    sections: ['Constitution Art 32 (Supreme Court writ)','Constitution Art 226 (High Court writ)','RTI Act 2005 Sec 6, 7, 19','Constitution Art 12–35 (Fundamental Rights)','NHRC / SHRC (Human Rights Commission)','Police excess illegal detention fundamental rights violation','Police refusing FIR RTI writ habeas corpus','Education rights school building safety PIL','NGT municipal environment writ petition','Election commission voter id writ','Custody child habeas corpus writ','POCSO child labour writ PIL','Writ for government service ration card','SC/ST police excess fundamental rights violation','DPDP Aadhaar data RTI writ PIL (dpdp rti)','Wrongful termination specific performance salary hike promise (wrongful termination specific performance)','Boundary encroachment RTI property (rti)','Education board exam answer sheet recheck RTI (education rti)'],
    documents: [
      { name: 'Proof of fundamental right violation', critical: true },
      { name: 'Representations/Applications already made', critical: true },
      { name: 'Government orders / notices under challenge', critical: false },
      { name: 'RTI application and response (if RTI-related)', critical: false }
    ],
    probingQuestions: [
      { q: 'What fundamental right has been violated? (Art 14/19/21/other)', tip: 'Article 21 (right to life) is broadly interpreted. Most PIL grounds fall under it.' },
      { q: 'Is it a personal grievance or a public issue affecting many?', tip: 'PIL requires public interest element. Personal grievances are writ petitions, not PILs.' },
      { q: 'Have you already approached the relevant authority / department?', tip: 'Courts generally expect prior representation before entertaining a writ petition.' },
      { q: 'Is RTI involved? Has the PIO failed to respond?', tip: 'First appeal to PIO Head, then second appeal to CIC/SIC if still no response.' }
    ],
    contextualQuestions: ['criminal'],
    limitation: 'No limitation for fundamental rights violations; RTI appeal within 90 days',
    urgency: 'medium',
    multiLawCompatible: ['Criminal – Police Excess / Human Rights Violation']
  },

  // ── POLICE EXCESS / HUMAN RIGHTS ─────────────────────────────────────────
  {
    caseType: 'Criminal – Police Excess / Human Rights Violation',
    lawCategory: 'Criminal',
    actName: 'Protection of Human Rights Act, 1993 + Constitution Art 21 / NHRC / SHRC / Police Misconduct',
    keywords: {
      exact: ['police beating me','police brutality','police torture','illegal arrest by police','police not registering fir','police refusing to file fir','police harassment','police excess','police misconduct','unlawful detention by police','police threatening','police demanding bribe','illegal detention by police','wrongful arrest','false arrest','police killed my relative fake encounter','i went to police station to report crime but they refused to register fir','police refuse to file fir for road accident','i was arrested without fir and kept for 3 days illegally','police are refusing to file my fir','police planted drugs on me to frame me','police is harassing members of our sc st community','police filed false case against me because of my political affiliation','police seized my vehicle after case was dismissed not returning it','police raided my house without search warrant','police searched my house without warrant','raided house without warrant','police entered without search warrant','police held person for 7 days without producing before magistrate','held for 7 days without producing before magistrate','not produced before magistrate within 24 hours','detained without producing before magistrate','police kept person without magistrate production'],
      strong: ['police excess','police brutality','police torture','human rights violation','nhrc complaint','shrc complaint','illegal arrest','wrongful arrest','unlawful detention','custodial violence','police misconduct','false case by police','police threatening','police bribe','encounter','fake encounter','third degree','custodial death','police custody','magistrate habeas corpus','refuse to register','refusing to file fir','fir refused','police refusing','framed by police','drugs planted','ndps planted','police false case','vehicle not returned','police excess complaint','police station refused','police beat in custody','beat me in custody','beaten in custody','police beat without charge','police beat without reason','detention without arrest memo','no arrest memo given','detention no memo','illegal detention no memo','whereabouts not told police','relative taken police whereabouts','no information after arrest','police took relative no information','police raided house without warrant','police searched house no warrant','illegal search without warrant','search warrant not shown','police entered without warrant','woman arrested without female constable','female arrested no woman constable','arrested without female officer','woman police not present during arrest','held 7 days without magistrate','produced before magistrate not done','not produced before magistrate'],
      weak: ['police','arrested','detained','fir','complaint','threat','station','constable','officer','refusal fir','false fir','framed','ndps','vehicle seized']
    },
    sections: ['Protection of Human Rights Act Sec 12 (NHRC powers)','Constitution Art 21 (Right to life/liberty)','Constitution Art 22 (Protection against arbitrary arrest)','BNSS Sec 35 (Arrest procedure)','Habeas Corpus writ (Art 226/32)','PIL writ petition fundamental rights police excess (pil writ)','RTI about FIR status police refusing to register FIR (rti)','SC/ST atrocities police excess fundamental rights (sc/st)','Service law police constable forced resign gender bias','Journalist defamation police threat corruption media (defamation)'],
    documents: [
      { name: 'Arrest Memo / Detention record', critical: true },
      { name: 'Medical examination report (injury from police)', critical: true },
      { name: 'NHRC / SHRC complaint copy', critical: false },
      { name: 'Witness statements', critical: false },
      { name: 'FIR copy (if any)', critical: false }
    ],
    probingQuestions: [
      { q: 'Was there physical assault / torture by police in custody?', tip: 'Custodial violence is a serious human rights violation. Medical exam immediately.' },
      { q: 'Was the arrest made without warrant or valid grounds?', tip: 'Police can arrest without warrant only in cognizable offences or with magistrate order.' },
      { q: 'Did the police refuse to register your FIR?', tip: 'Refusal to register FIR can be challenged before SP, Magistrate, or High Court.' },
      { q: 'Was a lawyer allowed during questioning?', tip: 'Right to legal representation is a fundamental right even during police questioning.' }
    ],
    contextualQuestions: ['criminal'],
    limitation: '1 year for NHRC; no limitation for habeas corpus',
    urgency: 'high',
    multiLawCompatible: ['Constitutional – PIL / Writ Petition / Fundamental Rights','Criminal – BNSS (Bail / Anticipatory Bail / Criminal Procedure)']
  },

  // ── SPECIFIC PERFORMANCE / CONTRACT ──────────────────────────────────────
  {
    caseType: 'Civil – Specific Performance / Contract Breach',
    lawCategory: 'Civil',
    actName: 'Specific Relief Act, 1963 + Indian Contract Act, 1872 – Specific Performance / Breach of Contract',
    keywords: {
      exact: ['specific performance of contract','specific performance suit','breach of contract','contract not fulfilled','agreement not honoured','party refusing to execute agreement','suit for specific performance','specific relief','contract enforcement','agreement breached','other party not performing contract','seller refusing to register property','builder refusing to execute deed'],
      strong: ['specific performance','breach of contract','contract breach','agreement breach','contract enforcement','specific relief act','oral agreement','written agreement','agreement to sell','sale agreement','contract not fulfilled','party defaulted','enforcement of contract','damages for breach','injunction contract','contractual obligation'],
      weak: ['contract','agreement','breach','party','performance','obligation','fulfil','execute','deed','promise','refused','violated']
    },
    sections: ['Specific Relief Act Sec 10 (Specific performance of contracts)','Specific Relief Act Sec 14 (Non-enforceable contracts)','Indian Contract Act Sec 73 (Compensation for breach)','Indian Contract Act Sec 74 (Liquidated damages)','CPC Order 39 (Injunction)','Wrongful termination offer letter breach specific performance','Arbitration clause enforcement money recovery debt','Employment contract breach specific performance (wrongful termination arbitration)','MSME partnership co-founder dispute specific performance','Decree enforcement money decree court order not complied (money recovery)','Injunction stop property sale co-owner refusing sell (declaration)','Injunction business partner interference (specific performance)','Limitation period case overlap two courts same case (money recovery bnss)'],
    documents: [
      { name: 'Original Contract / Agreement (signed)', critical: true },
      { name: 'Proof of performance of your part', critical: true },
      { name: 'Legal notice demanding performance', critical: true },
      { name: 'Correspondence (emails/messages) about the agreement', critical: false },
      { name: 'Payment receipts (if advance paid)', critical: false }
    ],
    probingQuestions: [
      { q: 'Is the contract in writing and signed by both parties?', tip: 'Written contracts are easier to enforce. Oral contracts require strong witness evidence.' },
      { q: 'Have you performed or offered to perform your part of the contract?', tip: 'Specific performance is only available if you are ready and willing to perform your obligations.' },
      { q: 'What exactly has the other party failed to do?', tip: 'Be specific — transfer property, deliver goods, complete construction, etc.' },
      { q: 'Is monetary compensation sufficient or do you need actual performance?', tip: 'Specific performance is only granted if damages are inadequate (usually for unique property/assets).' }
    ],
    contextualQuestions: ['civil','property'],
    limitation: '3 years from date of refusal to perform',
    urgency: 'medium',
    multiLawCompatible: ['Property – Transfer of Property / Sale Deed Dispute','Civil – Money Recovery / Debt Recovery']
  },

  // ── MEDICAL NEGLIGENCE ───────────────────────────────────────────────────
  {
    caseType: 'Consumer – Medical Negligence / Hospital Deficiency',
    lawCategory: 'Consumer',
    actName: 'Consumer Protection Act 2019 (Medical Services) + Indian Medical Council Act / COPRA Medical Negligence',
    keywords: {
      exact: ['doctor negligence','hospital negligence','wrong surgery','wrong treatment given','doctor gave wrong medicine','wrong diagnosis','missed diagnosis','hospital refused treatment','death due to doctor negligence','medical error','botched surgery','doctor cut wrong organ','medical malpractice','medical negligence complaint','negligence by doctor','my mother had an operation and surgeon left a medical instrument inside her body','patient died during operation due to anaesthesia error','post surgery complications arose due to wrong surgical procedure','patient in icu was not attended for hours leading to death','i was included in a drug trial without proper informed consent','police arrested my relative and he died in custody','hospital billed for medicines not given and procedures not done','private hospital charged icu bills for room not icu','hospital charged for icu when patient was in normal room','icu billing fraud hospital','hospital billed icu but room was not icu','doctor ne operation mein galti ki ab dard ho raha hai','doctor ne operation mein galti ki','operation mein doctor ne galti ki patient ko takleef',
        'chemist gave wrong medicine','pharmacy gave wrong medicine which made me sick','chemist dispensed wrong drug','wrong medicine dispensed by chemist','pharmacist gave wrong medicine','medical shop gave wrong tablets','dentist pulled wrong tooth','dentist removed wrong tooth','dental negligence','dentist drilled wrong tooth','wrong tooth extraction','dental malpractice','dentist caused nerve damage','root canal on wrong tooth'],
      strong: ['medical negligence','doctor negligence','hospital negligence','wrong treatment','wrong diagnosis','missed diagnosis','medical error','botched operation','surgical error','treatment complication','hospital deficiency','medical malpractice','clinical negligence','informed consent','discharge without treatment','emergency treatment refused','icu negligence','instrument left inside','surgical instrument inside body','anaesthesia error','wrong surgery complications','custody death','died in police custody','drug trial without consent','icu not attended','hospital billing fraud','galat ilaj kiya','doctor ne galat dava di','galat operation','hospital ne galat treatment','doctor ki galti','ilaj se tabiyat bigdi','unnecessary procedures hospital','hospital overcharged unnecessary','unnecessary procedures','did unnecessary procedures','hospital did unnecessary','overcharged for unnecessary','unnecessary tests hospital','unnecessary surgery','hospital overcharged and did','caesarean refused baby died','nursing home refused caesarean','caesarean delivery refused','hospital refused caesarean section','fake icu billing','charged icu not icu','hospital fake icu charges','chemotherapy wrong patient','chemo given wrong patient','wrong patient given treatment','chemotherapy given to wrong patient','expired medicines given patient','expired medicine hospital'],
      weak: ['doctor','hospital','treatment','surgery','medicine','negligence','operation','health','patient','medical','clinic','nursing home']
    },
    sections: ['Consumer Protection Act 2019 Sec 2 (Service deficiency)','Indian Medical Council (Professional Conduct) Regulations 2002','CrPC/BNS (Criminal negligence – causing death)','NMC Act 2020 (Doctor registration complaints)','MTP drug trial without informed consent reproductive rights (mtp)'],
    documents: [
      { name: 'Hospital Discharge Summary / Medical Records', critical: true },
      { name: 'Treatment Bills and Receipts', critical: true },
      { name: 'Expert Medical Opinion on Negligence', critical: true },
      { name: 'Death Certificate (if death occurred)', critical: false },
      { name: 'Post-mortem Report (if applicable)', critical: false },
      { name: 'Prescription and Lab Reports', critical: false }
    ],
    probingQuestions: [
      { q: 'What specifically went wrong during treatment/surgery?', tip: 'Document the deviation from standard medical care as clearly as possible.' },
      { q: 'Did the doctor/hospital obtain informed consent before the procedure?', tip: 'Absence of informed consent is itself a ground for complaint.' },
      { q: 'What is the resulting injury/harm? (death / permanent disability / complications)', tip: 'Nature and extent of harm determines compensation amount in consumer court.' },
      { q: 'Has a complaint been filed with the Medical Council?', tip: 'File simultaneously with Consumer Forum and State Medical Council for maximum impact.' }
    ],
    contextualQuestions: ['consumer'],
    limitation: '2 years from date of negligence / death',
    urgency: 'high',
    multiLawCompatible: ['Consumer – Product Defect / Service Deficiency','Constitutional – PIL / Writ Petition / Fundamental Rights']
  },

  // ── CRIMINAL MEDICAL NEGLIGENCE (DEATH BY NEGLIGENCE) ─────────────────────
  {
    caseType: 'Criminal – Medical Negligence / Death by Negligence (BNS 106)',
    lawCategory: 'Criminal',
    actName: 'Bharatiya Nyaya Sanhita, 2023 – Sec 106 (Death by Negligence) + Indian Medical Council Act',
    keywords: {
      exact: [
        'patient died due to doctor negligence','patient died in hospital due to negligence',
        'doctor killed my father','doctor killed my mother','hospital killed my wife',
        'hospital killed my husband','died after wrong surgery','died after wrong treatment',
        'died due to wrong medicine','death due to anaesthesia error','anesthesia killed patient',
        'hospital refused emergency and patient died','patient died because hospital refused',
        'doctor performed wrong surgery and patient died','wrong surgery caused death',
        'death in icu due to negligence','icu negligence caused death','patient died in icu',
        'surgeon left instrument inside body patient died','instrument left inside body death',
        'overdose given by doctor patient died','wrong injection killed patient',
        'wrong blood transfusion caused death','blood group mismatch transfusion death',
        'hospital released patient without treatment who then died','discharged without treatment died',
        'my father died because of medical negligence','my mother died in hospital negligence',
        'patient died chemotherapy wrong dose','chemo overdose killed patient',
        'doctor ne meri maa ko maar diya galat ilaj se','hospital mein maa ki maut ho gayi galti se',
        'galat injection dene se patient ki maut','doctor ki galti se jaan gayi',
      ],
      strong: [
        'patient died hospital','died after surgery','death due to negligence','died due to wrong',
        'hospital caused death','doctor caused death','fatal medical error','fatal surgical error',
        'death in hospital','icu death negligence','anaesthesia death','anesthesia death',
        'post operative death','post-operative complication death','death after operation',
        'emergency refused patient died','BNS 106','section 106 bns','causing death by negligence',
        'rash negligent act causing death','medical death','wrongful death doctor','wrongful death hospital',
        'medicine overdose death','injection overdose death','wrong dose caused death',
        'blood mismatch death','transfusion error death','discharged prematurely death',
        'maternity death hospital','childbirth death negligence','delivery complication death',
      ],
      weak: [
        'died','death','hospital','doctor','surgery','treatment','negligence','operation','fatal','killed',
        'anaesthesia','icu','emergency','refused','wrong','patient','maut','mar gaya','galti',
      ],
    },
    sections: [
      'BNS Sec 106 (Causing death by rash or negligent act – 2 to 7 years)',
      'BNS Sec 106(2) (Medical negligence causing death – specifically)',
      'NMC Act 2020 – National Medical Commission (Doctor deregistration)',
      'Indian Medical Council (Professional Conduct) Regulations 2002',
      'Consumer Protection Act 2019 (civil compensation simultaneously)',
      'BNSS Sec 174 (Mandatory inquest for death in hospital / custody)',
    ],
    documents: [
      { name: 'Hospital Discharge Summary / Death Summary', critical: true },
      { name: 'Post-mortem / Autopsy Report', critical: true },
      { name: 'All Medical Records, Prescriptions, OT Notes', critical: true },
      { name: 'Death Certificate', critical: true },
      { name: 'Expert Medical Opinion confirming negligence', critical: true },
      { name: 'CCTV footage from hospital (request immediately)', critical: false },
      { name: 'Nursing notes / ICU chart / Monitor readings', critical: false },
    ],
    probingQuestions: [
      { q: 'Was an FIR filed under BNS Sec 106 (rash/negligent death)?', tip: 'Police are often reluctant — you can file a private complaint before a Magistrate under Sec 223 BNSS.' },
      { q: 'Was an BNSS Sec 174 inquest conducted by the local magistrate?', tip: 'Mandatory for all hospital deaths. Demand this from the police immediately.' },
      { q: 'Have you secured all medical records before the hospital destroys them?', tip: 'Hospital records must be preserved immediately. Send a registered legal notice within 24 hours.' },
      { q: 'Has an independent expert doctor confirmed the medical negligence?', tip: 'Expert opinion is essential for criminal prosecution and consumer court compensation.' },
    ],
    contextualQuestions: ['criminal'],
    limitation: '3 years (criminal) / 2 years (consumer court)',
    urgency: 'high',
    multiLawCompatible: [
      'Consumer – Medical Negligence / Hospital Deficiency',
      'Constitutional – PIL / Writ Petition / Fundamental Rights',
      'Criminal – BNS (Murder / Culpable Homicide / Unnatural Death)',
    ],
  },

  // ── INSURANCE CLAIM ──────────────────────────────────────────────────────
  {
    caseType: 'Consumer – Insurance Claim Dispute',
    lawCategory: 'Consumer',
    actName: 'Consumer Protection Act 2019 + Insurance Ombudsman Rules / IRDAI / Insurance Act 1938',
    keywords: {
      exact: ['insurance claim rejected','insurance not paying','mediclaim rejected','health insurance denied','life insurance claim denied','motor insurance claim rejected','home insurance claim denied','insurance company cheating','insurance ombudsman complaint','irdai complaint','insurance policy dispute','claim settlement denied','insurance fraud','my crop was damaged by flood insurance company is not paying','my crop insurance claim for flood damage was partially rejected','my pm fasal bima yojana insurance claim for crop loss was rejected','insurance company refusing to cover mental health treatment','my insurance agent misrepresented the policy and i was misled','my endowment plan matured 6 months ago company not paying','employer cancelled my medical insurance policy midway'],
      strong: ['insurance claim','insurance rejected','claim denied','insurance dispute','mediclaim','health insurance','life insurance','motor insurance','term insurance','claim settlement','insurance ombudsman','irdai','insurance company','policy lapsed','premature claim','nominee claim','insurance fraud','insurance deficiency','crop insurance','fasal bima','pmfby','pm fasal bima','pradhan mantri fasal bima','crop damage insurance','flood crop insurance','agriculture insurance claim','mental health insurance','insurance agent misrepresentation','endowment maturity','medical insurance cancelled employer'],
      weak: ['insurance','claim','policy','premium','rejected','denied','payment','cover','health','life','vehicle','accident','nominee']
    },
    sections: ['Consumer Protection Act 2019 (Insurance as service)','Insurance Ombudsman Rules 2017','Insurance Act 1938 Sec 45 (Policy repudiation)','IRDAI Regulations','Motor Vehicles Act (third party insurance)','Insurance agent misrepresentation cheating fraud (cheating)','Wrongful termination employer removed mediclaim (wrongful termination)','Money recovery specific performance BNSS succession criminal civil dispute (money recovery specific performance bnss bns succession criminal)'],
    documents: [
      { name: 'Insurance Policy Document', critical: true },
      { name: 'Claim Application submitted', critical: true },
      { name: 'Rejection Letter from Insurance Company', critical: true },
      { name: 'Medical Records / Hospital Bills (for health claims)', critical: false },
      { name: 'FIR / Surveyor Report (for motor/property claims)', critical: false },
      { name: 'Premium payment receipts', critical: false }
    ],
    probingQuestions: [
      { q: 'What type of insurance? (Life / Health / Motor / Property / Term)', tip: 'Each type has different forums — Insurance Ombudsman handles up to ₹50 lakh claims.' },
      { q: 'What reason did the insurer give for rejection?', tip: 'Common reasons: non-disclosure, pre-existing disease, policy lapse. Each can be contested.' },
      { q: 'Was the claim filed within the time limit mentioned in the policy?', tip: 'Delayed claims can be rejected. But if reasonable cause, courts have condoned delays.' },
      { q: 'Have you approached the Insurance Ombudsman?', tip: 'Free, fast, and effective for claims up to ₹50 lakh. Try before consumer court.' }
    ],
    contextualQuestions: ['consumer'],
    limitation: '2 years from cause of action; Ombudsman within 1 year of final reply',
    urgency: 'medium',
    multiLawCompatible: ['Consumer – Product Defect / Service Deficiency','Motor Accident Claims / Personal Injury']
  },

  // ── NRI LEGAL ISSUES ─────────────────────────────────────────────────────
  {
    caseType: 'NRI – Property / Family / Legal Issues (Non-Resident Indian)',
    lawCategory: 'NRI',
    actName: 'NRI Legal Issues – FEMA 1999 + Hindu Succession Act + IPC/BNS + CPC – Power of Attorney',
    keywords: {
      exact: ['nri property dispute','nri property rights','nri land grabbed','nri relatives took property','nri husband divorce','nri wife divorce','nri child custody','foreign divorce not valid india','divorce decree from abroad','power of attorney for nri','nri maintenance','nri investment legal issue','nri fema violation','nri oci card','nri legal help','overseas indian','nri husband has abandoned wife','nri husband abandoned wife in india','nri husband abandoned wife','nri husband left wife in india','my oci card application has been rejected without proper reason','my nre account funds are being blocked by bank without reason','my nro account was frozen by bank citing fema violation','i am nri my business partner in india gave cheque which bounced','i am an nri living in usa my brother has sold my india property without my permission','i am living in usa my relatives have grabbed my india property','main dubai mein rehta hoon mera ghar india mein kisi ne kabza kar liya','i am nri my tenant in india issued cheque for rent which bounced','my ex wife wants to take my daughter to canada permanently i object','my child is in us my husband will not return the child to india','NRI wife abandoned husband in india and left for USA','nri wife left for abroad abandoning husband','husband is nri left wife in india not returning'],
      strong: ['non resident indian','nri property','nri divorce','nri custody','nri inheritance','overseas citizen','nri investment','fema','foreign exchange','nri bank account','nri power of attorney','india from abroad','nri relatives','property from abroad','nri will','nri succession','foreign court decree','oci card','nri business partner','nre funds blocked','nro frozen','fema violation bank','usa india property','dubai india property','nri cheque bounce','nri rental','nri property grabbed','nri summoned india','power of attorney misused abroad','living abroad family property','nri husband abandoned','nri husband abandoned wife','nri abandoned wife','husband abandoned in india','nri husband left wife','nri want divorce','i am an nri want divorce','living abroad want divorce','abroad want divorce india','power of attorney misused by family','nre account blocked','nre account blocked by bank','nro account blocked','nre account frozen','nri bank account blocked','bank blocked nre account'],
      weak: ['abroad','foreign','usa','uk','canada','australia','overseas','nri','settled abroad','living abroad','foreign country','oci','pio','nro','nre','fema','dubai','property india from abroad','i am an nri','living abroad']
    },
    sections: ['FEMA 1999 (Foreign Exchange)','Hindu Succession Act (NRI inheritance)','CPC Sec 13-14 (Foreign judgment enforcement)','Power of Attorney Act','IT Act (NRI taxation)','NRI UK inheritance father death without will (nri)','NRI divorce from spouse in india from UK (nri)','NRI bank account NRE NRO blocked (banking)','Bail anticipatory bail NRI summoned 498A (bail)'],
    documents: [
      { name: 'Passport / OCI Card', critical: true },
      { name: 'Property documents (if property dispute)', critical: true },
      { name: 'Power of Attorney (if acting through representative)', critical: false },
      { name: 'Foreign court decree (if applicable)', critical: false },
      { name: 'Proof of NRI status (visa, residence)', critical: false }
    ],
    probingQuestions: [
      { q: 'Are you currently in India or abroad?', tip: 'NRIs can grant Power of Attorney to a trusted person in India to handle legal matters.' },
      { q: 'What is the nature of the dispute? (Property / Family / Investment)', tip: 'NRI property disputes are very common. Encroachment by relatives is frequent.' },
      { q: 'Is a foreign court order / divorce decree involved?', tip: 'Foreign decrees are not automatically enforceable in India. Must be recognised under CPC Sec 13.' },
      { q: 'Is FEMA / foreign investment compliance an issue?', tip: 'NRIs must comply with FEMA for property purchase and repatriation of funds.' }
    ],
    contextualQuestions: ['family','property'],
    limitation: 'Varies by dispute type',
    urgency: 'medium',
    multiLawCompatible: ['Property – Hindu Succession / Inheritance Dispute','Family – Divorce (Contested)','Property – Transfer of Property / Sale Deed Dispute']
  },

  // ── INTELLECTUAL PROPERTY ─────────────────────────────────────────────────
  {
    caseType: 'Intellectual Property – Trademark / Copyright / Patent Dispute',
    lawCategory: 'IP',
    actName: 'Trade Marks Act 1999 + Copyright Act 1957 + Patents Act 1970 + Designs Act 2000 – IP Rights / Trademark / Copyright / Patent',
    keywords: {
      exact: ['trademark infringement','copyright infringement','patent infringement','someone copied my logo','copied my logo','copied my tagline','copied my tag line','using my logo','using my brand name','someone using my brand name','copied my design','stolen my content','pirated my software','trademark registered','copyright registered','patent filed','trademark application','design registered','intellectual property','ip theft','copied my brand','stole my brand','using my tagline','copied our logo','copied our brand','my novel is being sold on amazon kindle without my permission','my book is being sold online without my permission','someone selling my novel without permission','my ebook pirated and sold online','my content is being published without permission','app developed by me stolen and relaunched by ex-partner','app stolen and relaunched','my app was copied and relaunched','my software was copied and sold','my code was stolen and relaunched','my application was copied','partner copied my app'],
      strong: ['trademark','copyright','patent','intellectual property','brand name','logo stolen','design stolen','content copied','piracy','plagiarism','infringement','trade secret','trade mark','registered trademark','copyright violation','passing off','counterfeit','fake products brand','brand protection','logo','tagline','tag line','copied my','copying my','brand copied','logo copied','brand infringement','unauthorized use of logo','my design copied','competitor copied'],
      weak: ['brand','name','design','content','music','book','software','invention','product','copied','stolen','fake','competition','competitor','imitation','duplicate']
    },
    sections: ['Trade Marks Act 1999 Sec 29 (Infringement)','Trade Marks Act Sec 134 (Suit for infringement)','Copyright Act 1957 Sec 51 (Infringement)','Patents Act 1970 Sec 108 (Infringement suit)','IT Act 2000 Sec 65 (Source code theft)','Copyright authorship moral rights removed from published work (copyright)','Online fraud domain name trademark infringement (online fraud)','Data theft software code copied ex-employee (data theft ip)'],
    documents: [
      { name: 'Trademark Registration Certificate / TM Application', critical: true },
      { name: 'Copyright registration / Published work proof', critical: true },
      { name: 'Evidence of infringement (photos, screenshots, website)', critical: true },
      { name: 'Cease and Desist Notice sent', critical: false },
      { name: 'Proof of prior use / first in market', critical: false }
    ],
    probingQuestions: [
      { q: 'Is your trademark/copyright/patent registered?', tip: 'Registered IP gives stronger legal protection. Unregistered rights can still be enforced (passing off).' },
      { q: 'What exactly is being copied? (Logo / product name / content / invention)', tip: 'Each type of IP has different protection laws. Correct identification is important.' },
      { q: 'Where is the infringement happening? (Online / physical / both)', tip: 'Online infringement: approach cybercrime cell + IPAB. Physical: civil suit + Anton Piller order.' },
      { q: 'What relief do you seek? (Injunction / damages / delivery up)', tip: 'Interim injunction stops infringement immediately while the main suit proceeds.' }
    ],
    contextualQuestions: ['cyber'],
    limitation: '3 years for copyright; trademark – 5 years from knowledge of infringement',
    urgency: 'high',
    multiLawCompatible: ['Cyber – Data Theft / Hacking / Corporate Espionage','Criminal – BNS (Fraud / Cheating)']
  },

  // ── TAX / GST DISPUTES ───────────────────────────────────────────────────
  {
    caseType: 'Tax – GST / Income Tax / Tax Dispute',
    lawCategory: 'Tax',
    actName: 'Income Tax Act 1961 + GST Act 2017 + Finance Act – Tax Disputes / GST Notice / Income Tax Notice',
    keywords: {
      exact: ['gst notice','income tax notice','income tax demand','gst demand notice','tax assessment order','tax evasion allegation','scrutiny assessment notice','gst registration cancelled','gst refund not received','income tax refund','tax appeal','income tax officer','tax raid','it department notice','gst department notice','gst return filed','income tax return'],
      strong: ['gst','income tax','tax notice','tax demand','tax assessment','tax appeal','income tax act','gst act','tax tribunal','itat','gst council','advance tax','tds','tax deducted','tax refund','tax evasion','tax scrutiny','tax officer','direct tax','indirect tax','customs duty','excise duty'],
      weak: ['tax','notice','demand','refund','return','assessment','it','gst','tds','income','revenue','department']
    },
    sections: ['Income Tax Act 1961 Sec 143, 144, 148 (Assessment)','Income Tax Act Sec 246A (Appeal to CIT)','GST Act 2017 Sec 73, 74 (Demand and recovery)','GST Act Sec 107 (Appeals)','ITAT / GST Appellate Authority','Income tax GST professional tax wrongful demand (income tax gst)','State stamp duty property registration wrongful demand (gst)','Online fraud PAN misuse fake income tax returns (online fraud cyber income tax)'],
    documents: [
      { name: 'Tax Notice / Demand Order received', critical: true },
      { name: 'Previous years ITR copies', critical: true },
      { name: 'Bank statements and books of accounts', critical: true },
      { name: 'GST registration certificate', critical: false },
      { name: 'Correspondence with tax department', critical: false }
    ],
    probingQuestions: [
      { q: 'What type of tax notice received? (Scrutiny / Demand / Refund / GST / TDS)', tip: 'Response timelines differ. Scrutiny notices require reply within 30 days usually.' },
      { q: 'What tax year / period is the dispute about?', tip: 'Old demands may be time-barred. Check limitation period carefully.' },
      { q: 'Is it income tax or GST? Or both?', tip: 'Income tax has ITAT as appellate authority; GST has GST appellate authority.' },
      { q: 'Has the tax been paid under protest?', tip: 'Paying under protest preserves your right to claim refund after winning the appeal.' }
    ],
    contextualQuestions: ['civil'],
    limitation: 'Varies: IT appeal within 30 days of order; GST appeal within 3 months',
    urgency: 'high',
    multiLawCompatible: ['Constitutional – PIL / Writ Petition / Fundamental Rights']
  },

  // ── POCSO / CHILD SEXUAL ABUSE ───────────────────────────────────────────
  {
    caseType: 'Criminal – POCSO / Child Sexual Abuse / Child Protection',
    lawCategory: 'Criminal',
    actName: 'Protection of Children from Sexual Offences Act, 2012 (POCSO) + BNS / Juvenile Justice Act',
    keywords: {
      exact: ['pocso complaint','child sexual abuse','child molested','child raped','pocso case','sexual assault on child','child sexually abused','teacher abused student','sexual harassment of child','pocso fir','child protection','minor sexually abused','juvenile justice','child labour complaint','child abuse complaint','i am a victim of acid attack','acid attack victim','acid attack'],
      strong: ['pocso','child sexual abuse','sexual assault minor','acid attack','acid','child molestation','child rape','minor abused','sexual offence child','child protection','child welfare committee','cwc','juvenile justice','jja','child trafficking','child labour','sexually abused child','pocso act','sexual offence against child','online grooming','child grooming online','groomed by predator','child predator online','online predator child','csam','child pornography','online sexual exploitation minor','neighbour touched child inappropriately','neighbour touched my daughter','neighbour inappropriate touch minor','inappropriate touch child','teacher abused minor student','school teacher abused','beti ko padosi ne haath lagaya','padosi ne galat niyat se haath lagaya',
        'eve teasing','eve teasing complaint','eve teasing fir','boys teasing girls','boys harassing girls','street harassment girls','teasing outside college','teasing outside school','teasing girls on road','boys passing comments girls','sexual comments girls street','girl teased on way to school','girl teased outside college','molestation outside school','boys harassing students','principal not acting eve teasing','ragging complaint','school ragging','college ragging','anti ragging'],
      weak: ['child','minor','abuse','sexual','assault','molest','school','teacher','relative','touching','harassment','victim','student','teasing','ragging']
    },
    sections: ['POCSO Act 2012 Sec 4, 6, 8, 10, 12 (Offences)','POCSO Sec 19 (Mandatory reporting)','BNS Sec 64, 70 (Rape / Sexual assault)','Juvenile Justice Act 2015','Child Welfare Committee (CWC) procedures','PIL writ petition child labour trafficking brick kiln (pil writ)','MTP minor rape victim abortion rights (mtp)','Muslim minor child marriage (pocso)'],
    documents: [
      { name: 'FIR Copy (filed at nearest police station)', critical: true },
      { name: 'Medical Examination Report (FSLO)', critical: true },
      { name: 'Statement of child victim (Section 164 CrPC)', critical: true },
      { name: 'School/Institutional records (if abuse at institution)', critical: false }
    ],
    probingQuestions: [
      { q: 'How old is the child victim?', tip: 'POCSO covers all persons below 18 years. Age is crucial.' },
      { q: 'Who is the alleged abuser? (Relative / Teacher / Neighbour / Stranger)', tip: 'Relationship to child affects bail, custody, and sentencing under POCSO.' },
      { q: 'Has a police complaint/FIR been filed?', tip: 'FIR is mandatory under POCSO. Any person with knowledge must report — it is a legal duty.' },
      { q: 'Is the child currently safe?', tip: 'Immediate removal from danger is the priority. Child Welfare Committee can provide shelter.' }
    ],
    contextualQuestions: ['criminal','family'],
    limitation: 'No limitation for POCSO cases',
    urgency: 'high',
    multiLawCompatible: ['Family – Child Custody / Guardianship','Constitutional – PIL / Writ Petition / Fundamental Rights']
  },

  // ── EMPLOYMENT – GOVERNMENT / SERVICE LAW ────────────────────────────────
  {
    caseType: 'Employment – Government Service / Service Law / Administrative Tribunal',
    lawCategory: 'Labour & Employment',
    actName: 'Administrative Tribunals Act, 1985 + Central Civil Services Rules + Service Law / Government Employment / CAT',
    keywords: {
      exact: ['government employee dispute','cat tribunal','central administrative tribunal','state administrative tribunal','service matter','government service rules','government job dispute','departmental inquiry','government promotion dispute','transfer dispute government','suspension government employee','government employee terminated','civil services rules','service tribunal','government pensioner dispute','i was wrongly suspended and acquitted i want back wages','i was transferred to a remote area as punishment for raising issues','government invoked esma to prevent us from going on strike','government employer not depositing national pension scheme contributions','female police constable was forced to resign citing gender bias','my disability pension was stopped by government without any notice'],
      strong: ['government employee','service law','administrative tribunal','cat tribunal','central civil services','state civil services','departmental inquiry','promotion blocked','wrongful suspension','transfer order','posting order','government service','civil servant','service rules','disciplinary proceedings','charge sheet government','government pensioner','gratuity government','government job'],
      weak: ['government','service','employee','tribunal','department','transfer','suspension','promotion','seniority','pension','posting','official']
    },
    sections: ['Administrative Tribunals Act 1985','Central Civil Services (CCA) Rules 1965','Article 311 (Dismissal of government employees)','Article 226 (HC writ for service matters)','Central Administrative Tribunal (CAT) jurisdiction','Wrongful termination reinstatement back wages','Service law back wages suspended acquitted government employee','ESMA Essential Services Maintenance Act','Disability pension service law (disabilit)','Police constable service law gender discrimination','NPS national pension scheme PF government employees (pf service law)','Writ petition service law (writ pil)','Professional tax income tax GST wrongly assessed (income tax gst)'],
    documents: [
      { name: 'Appointment / Joining Letter', critical: true },
      { name: 'Suspension / Termination / Transfer Order', critical: true },
      { name: 'Service Book / Employment Record', critical: false },
      { name: 'Departmental Inquiry Report', critical: false },
      { name: 'Representation / Appeal filed', critical: false }
    ],
    probingQuestions: [
      { q: 'Are you a Central or State Government employee?', tip: 'Central employees approach CAT; State employees approach State Administrative Tribunal or HC.' },
      { q: 'What is the specific grievance? (Transfer/Suspension/Termination/Promotion)', tip: 'Each type has specific procedures and timelines for challenge.' },
      { q: 'Was a departmental inquiry conducted? Was it fair?', tip: 'Procedural irregularities in departmental inquiry are strong grounds for challenge.' },
      { q: 'Have you exhausted the internal departmental appeal?', tip: 'CAT requires prior representation to the department before filing OA.' }
    ],
    contextualQuestions: ['employment'],
    limitation: '1 year from date of order at CAT',
    urgency: 'medium',
    multiLawCompatible: ['Constitutional – PIL / Writ Petition / Fundamental Rights','Employment – Wrongful Termination / Illegal Dismissal']
  },

  // ── HOUSING SOCIETY ──────────────────────────────────────────────────────
  {
    caseType: 'Property – Housing Society / Apartment Association Dispute',
    lawCategory: 'Property',
    actName: 'Cooperative Societies Act / Apartment Ownership Acts + RERA + MCS Act 1960 – Housing Society Disputes',
    keywords: {
      exact: ['housing society dispute','apartment association dispute','society not issuing noc','flat owner society dispute','maintenance charges dispute','housing society committee','cooperative housing society','apartment owner dispute','society refusing membership','society not giving documents','flat society dispute','housing society complaint','flat owners association','my father died flat is in his name society not transferring to me','my upstairs neighbor creates noise all night what legal remedy','society refusing to transfer flat after death of owner','noise pollution by neighbor in housing society','water leakage from flat above damaging my ceiling','flat above mine has water leakage','upstairs flat water seepage into my flat','water seeping from upstairs flat','water leaking from above flat','water damage from upstairs neighbor','neighbor upstairs water leakage','roof leakage from terrace flat','water dripping from ceiling neighbor above','seepage from upper floor flat','upar ki manzil se paani aa raha hai'],
      strong: ['housing society','apartment association','cooperative society','society maintenance','noc housing','flat owners','residents association','society committee','building society','apartment owners','society by-laws','society accounts','common area dispute','parking dispute society','society meeting','society funds misuse','registrar cooperative','resident welfare association','parking allocation dispute','rwa dispute','rwa complaint','society parking allocation','welfare association conflict','water leakage flat','water seepage flat','seepage upper floor','leakage from above','flat water damage','apartment water leaking','neighbour water leakage','upstairs water dripping','ceiling water damage'],
      weak: ['society','flat','apartment','building','maintenance','noc','parking','committee','members','association','cooperative','complex']
    },
    sections: ['Cooperative Societies Act (State-specific)','RERA 2016 (Common areas)','Apartment Ownership Acts (State-specific)','MCS Act 1960 (Maharashtra)','Dispute resolution before Registrar of Cooperative Societies','Succession after death – flat transfer to legal heir (succession housing society)','Noise pollution by neighbor in housing society (municipal)','Municipal rules for societies','Nomination vs legal heir flat society transfer'],
    documents: [
      { name: 'Sale Deed / Ownership Proof', critical: true },
      { name: 'Society Membership Certificate / Share Certificate', critical: true },
      { name: 'Society Bye-laws Copy', critical: false },
      { name: 'Maintenance receipts', critical: false },
      { name: 'Society meeting minutes (if relevant)', critical: false }
    ],
    probingQuestions: [
      { q: 'What is the specific dispute? (NOC / Maintenance / Parking / Management)', tip: 'NOC disputes: most common. Maintenance: must be paid even under protest.' },
      { q: 'Is the society a cooperative or condominium/apartments act?', tip: 'Different laws apply. Cooperative: Registrar. Condominium: Court/RERA.' },
      { q: 'Have you attended/requested the AGM to raise the issue?', tip: 'Society disputes are first resolved at AGM level before formal complaint.' },
      { q: 'Is the society refusing to transfer flat to you as buyer?', tip: 'Society cannot unreasonably refuse membership to a flat purchaser.' }
    ],
    contextualQuestions: ['property'],
    limitation: 'Varies by state cooperative act; generally 3 years',
    urgency: 'low',
    multiLawCompatible: ['Property – RERA Disputes / Builder Fraud','Property – Transfer of Property / Sale Deed Dispute']
  },

  // ── SARFAESI / BANKING RECOVERY ──────────────────────────────────────────
  {
    caseType: 'Civil – SARFAESI / Banking Recovery / DRT',
    lawCategory: 'Civil',
    actName: 'SARFAESI Act 2002 + DRT Act 1993 + RDB Act – Banking Recovery / Loan Default / Bank Auction',
    keywords: {
      exact: ['sarfaesi notice','drt case','bank notice for loan default','bank auctioning property','bank possession notice','bank took my property','loan default notice','bank auction','debt recovery tribunal','npa account','secured asset sarfaesi','bank recovery notice','13(2) notice sarfaesi','securitisation notice','bank seized property','nbfc people came to my house forcefully took my vehicle without notice','i repaid my loan fully bank is not releasing mortgage on my property','bank charged maintenance fees without informing me','bank manager misused my loan account and forged my signature for loan','bank charged unnecessary fees without my consent','i deposited title deeds with bank for mortgage bank now claiming ownership','bank reporting wrong default to cibil credit score damaged','someone used my credit card fraudulently online'],
      strong: ['sarfaesi','drt','debt recovery tribunal','bank loan default','npa','non performing asset','bank auction','bank possession','loan recovery','bank notice','secured creditor','bank recovery','drt application','rdb act','bank recovering loan','bank seizure property','one time settlement','ots bank','nbfc repossession','vehicle taken by bank','vehicle seized nbfc','mortgage not released','mortgage release bank','cibil credit score wrong','bank unauthorized charges','bank fees without consent','credit card fraud','credit card fraudulently used','bank manager forged','bank claiming ownership'],
      weak: ['bank','loan','default','notice','property','seized','auction','recovery','debt','emi','mortgage','pledge','nbfc','vehicle','cibil','credit card','bank fees','unauthorized']
    },
    sections: ['SARFAESI Act 2002 Sec 13 (Enforcement)','SARFAESI Sec 14 (Chief Metropolitan Magistrate)','DRT Act 1993 (Debt Recovery Tribunal)','Sec 17 SARFAESI (Appeal to DRT)','Sec 18 SARFAESI (Appeal to DRAT)','Agricultural land mortgage moneylender SARFAESI (agriculture sarfaesi)','Banking consumer RBI moratorium COVID loan (banking consumer copra)','CIBIL wrong credit report correction (banking)','Money recovery debt banking (money recovery debt)'],
    documents: [
      { name: 'SARFAESI Notice / Bank Notice (Sec 13(2) / 13(4))', critical: true },
      { name: 'Loan Agreement / Mortgage Documents', critical: true },
      { name: 'Bank statements showing loan account', critical: true },
      { name: 'Property documents (if property in dispute)', critical: false },
      { name: 'OTS proposal (if settlement attempted)', critical: false }
    ],
    probingQuestions: [
      { q: 'What type of notice has been received? (Sec 13(2) / 13(4) / Auction notice)', tip: 'Sec 13(2) = 60-day notice to repay. Sec 13(4) = bank takes physical possession. Both can be challenged at DRT.' },
      { q: 'Is the loan account classified as NPA?', tip: 'NPA classification can be challenged if the account was never in default or procedurally wrong.' },
      { q: 'Has the bank valued the property correctly for auction?', tip: 'Bank valuation can be contested at DRT if below market value.' },
      { q: 'Is a One-Time Settlement (OTS) being considered?', tip: 'OTS is faster and cheaper than DRT litigation. Banks usually prefer it for old NPAs.' }
    ],
    contextualQuestions: ['civil','property'],
    limitation: 'DRT appeal within 45 days of SARFAESI notice',
    urgency: 'high',
    multiLawCompatible: ['Property – Transfer of Property / Sale Deed Dispute','Civil – Money Recovery / Debt Recovery']
  },

  // ── EDUCATION / RTE / DISABILITY RIGHTS ──────────────────────────────────
  {
    caseType: 'Education – RTE / School / University / Disability Rights',
    lawCategory: 'Education',
    actName: 'Right to Education Act 2009 + RPWD Act 2016 + UGC Act + MCI Regulations – Education Rights',
    keywords: {
      exact: ['school refused admission rte','private school rte quota','rte admission complaint','school refusing admission disability','capitation fee for medical college','private medical college demanding donation','university withholding degree certificate','college certificate not given','school demanding bribe tc','government school building dangerous','my college discriminating caste','university professor discriminating sc student','private college affiliated to university discriminating admissions','private university degree unrecognized','edtech platform removed content after fees','private coaching institute shut down mid-year no refund','i want rechecking of my board exam answer sheet','board exam answer sheet recheck','board exam recheck rti','disability rights denied by school','disability rights denied school special needs','special needs child school denied','disability rights school for special needs child','school special needs disability denied','bhanji ko school mein admission se mana kar diya disability ke karan','bhanji admission denied disability school','niece denied school admission because of disability'],
      strong: ['rte','right to education','rte quota','25 percent rte','school admission','capitation fee','private school fees','excessive school fees','school discrimination','university discrimination','degree withheld','degree certificate held','tc withheld','transfer certificate','school bribe','education rights','disability school','rpwd act education','inclusive education','disabled child admission','scholarship denied','education board','university complaint','affiliation dispute','disability rights school','disability rights denied school','special needs child school','special needs school','school refused disability','school refusing disabled child','child with disability school','disability school refusal','school accommodation disability'],
      weak: ['school','college','university','admission','degree','education','student','academic','campus','institute','tuition','coaching','scholarship','certificate','tc']
    },
    sections: ['RTE Act 2009 Sec 12(1)(c) (25% reservation)','RPWD Act 2016 Sec 31 (Inclusive Education)','UGC Act 1956','Consumer Protection Act (education as service)','Agriculture government canal water diverted NGT (agriculture ngt)','Consumer cheating private university degree invalid (consumer cheating)','RTI education board exam recheck answer sheet (rti education)'],
    documents: [
      { name: 'Admission Application / Rejection Letter', critical: true },
      { name: "Child's Birth Certificate / Age Proof", critical: true },
      { name: 'Disability Certificate (if applicable)', critical: false },
      { name: 'EWS / BPL Certificate (for RTE quota)', critical: false },
      { name: 'Fee payment receipts', critical: false }
    ],
    probingQuestions: [
      { q: 'Which type of institution is involved? (Government school/Private school/University)', tip: 'RTE applies to private unaided schools. Universities are governed by UGC.' },
      { q: 'Is disability involved? What type of disability?', tip: 'RPWD Act 2016 mandates inclusive education and reasonable accommodation at all levels.' },
      { q: 'Is this about admission denial, fee issues, or certificate withholding?', tip: 'Different remedies: RTE authority for schools, consumer court for fee excess, Ombudsman for certificate.' }
    ],
    contextualQuestions: ['consumer'],
    limitation: '3 years generally',
    urgency: 'medium',
    multiLawCompatible: ['Consumer – Product Defect / Service Deficiency','Constitutional – PIL / Writ Petition / Fundamental Rights']
  },

  // ── MSME / SAMADHAN / DELAYED PAYMENT ────────────────────────────────────
  {
    caseType: 'MSME – Delayed Payment / MSME Samadhan / Partnership Dues',
    lawCategory: 'Commercial',
    actName: 'MSME Development Act 2006 (MSMED Act) + Facilitation Council + Partnership Act 1932 – MSME Payment Disputes',
    keywords: {
      exact: ['msme delayed payment','msme facilitation council','msme samadhan','buyer not paying msme','45 days payment msme','msme supplier dues','i am a small business owner my buyer is not paying my dues beyond 45 days','i am an msme unit buyer owes me 8 lakhs for over 3 months','large company has been delaying payment to my small business for 90 days','i am a supplier i delivered goods worth 8 lakhs buyer not paying','i am an msme supplier large corporate has not paid for 120 days','i want to file application before msme facilitation council for dues','buyer is taking 90 days to pay my invoice i am an msme','my business partner left and owes me 5 lakhs from the partnership','my co-founder quit before vesting cliff and claims 50% equity','bade company ne mera payment 6 mahine se rok rakha hai','badi company payment rok rahi hai chhote supplier ka'],
      strong: ['msme','msmed act','micro small medium enterprise','msme payment','facilitation council','msme samadhan portal','45 days payment','msme supplier','msme buyer','compound interest msme','delayed payment msme','partnership dues','partnership dispute','partnership dissolution','partner owes money','business partner dispute','startup equity','esop dispute','vesting cliff','co-founder dispute','udyam registration','msme certificate'],
      weak: ['small business','supplier','buyer','invoice','payment','dues','partner','business','delayed','overdue','enterprise','vendor','client dues','msme','facilitation','samadhan']
    },
    sections: ['MSMED Act 2006 Sec 15 (Payment within 45 days)','MSMED Act Sec 16 (Compound interest on delayed payment)','MSMED Act Sec 18 (Facilitation Council)','Partnership Act 1932 Sec 37 (Dissolution)','Money recovery debt collection from defaulting buyer','Co-founder startup equity dispute arbitration','Partnership dissolution money recovery','IBC insolvency proceedings for non-payment','Permanent injunction partner interference arbitration (arbitration specific performance)'],
    documents: [
      { name: 'Invoice / Purchase Order (with MSME registration of supplier)', critical: true },
      { name: 'MSME Registration Certificate (Udyam Registration)', critical: true },
      { name: 'Delivery challans / Proof of supply', critical: true },
      { name: 'Partnership Deed (for partnership disputes)', critical: false }
    ],
    probingQuestions: [
      { q: 'Is your business registered as MSME? (Udyam Registration)', tip: 'MSMED Act protection applies only if you have Udyam Registration.' },
      { q: 'How many days has the payment been pending?', tip: 'Buyer must pay within 45 days. Compound interest accrues from day 46.' },
      { q: 'Is this a partnership dispute? Do you have a partnership deed?', tip: 'Partnership Act governs dissolution, profit sharing, and liability between partners.' }
    ],
    contextualQuestions: ['civil'],
    limitation: '3 years',
    urgency: 'medium',
    multiLawCompatible: ['Civil – Money Recovery / Debt Recovery','Civil – Specific Performance / Contract Breach']
  },

  // ── SENIOR CITIZEN / MAINTENANCE OF PARENTS ──────────────────────────────
  {
    caseType: 'Senior Citizen – Maintenance / Protection / Eviction Prevention',
    lawCategory: 'Family',
    actName: 'Maintenance and Welfare of Parents and Senior Citizens Act 2007 + Amendment 2019 – Senior Citizens Rights',
    keywords: {
      exact: ['my children are not taking care of me i am an old person','my son took my property saying he will take care but now ignores me','i am 75 years old my children kicked me out how to get maintenance','mere bete meri dekh bhal nahi karte main 70 saal ka hoon','i am a widower my daughter refuses to maintain me despite my old age','my son wants to throw me out of my own house after taking property','i want to file complaint before senior citizen maintenance tribunal','mera beta mujhe ghar se nikaalna chahta hai main 70 saal ka hoon','senior citizen being harassed by children','my son took my property and now refuses to take care of me','son took my property and refuses to take care','i am 70 years old children not paying maintenance','70 years old children not paying maintenance','widowed mother not being maintained by sons','widowed mother not being maintained','widowed mother sons not maintaining','old parents living alone children abroad not sending money','gift deed given to son he now refuses to maintain me','gift deed revocation senior citizen','budhhe maa baap ko bete ne nikaala ghar se','budhhe maa baap ko nikaala','parents maintenance act complaint against son daughter','son not paying monthly maintenance to 80 year old parents','80 year old parents son not paying maintenance','daughter-in-law harassing mother-in-law for property transfer','bahu maa ko tang kar rahi hai property ke liye','daughter in law demanding property from in-laws harassing them'],
      strong: ['senior citizen','senior citizens act','maintenance of parents','parent maintenance','child not maintaining parent','children not taking care','old age neglect','maintenance tribunal senior','senior citizen complaint','eviction of elderly','property gift revocation','gift deed revocation','tribunal senior citizen','parents welfare act','elderly rights','maintenance of parents act','elderly parent evicted','son took my property i am old','son evicted elderly parent','elderly parent thrown out','old age children not paying','old age maintenance','children evicted old parents','son not taking care of me i am old','widowed mother sons maintenance','sons not maintaining widowed mother','umar 70 saal','umar 75 saal','umar 68 saal','umar 80 saal','mere bete ne ghar se nikaala','bete ne ghar se nikala','bete ne zameen le li','bete ne property le li dekh bhal nahi karte','mera beta dekh bhal nahi karta main budhha hoon','parents welfare act complaint','old parents living alone','children abroad not sending money','gift deed given son refuses maintenance','gift deed son ignoring parent','budhhe parents nikaale bete ne','senior citizen formal complaint tribunal','maintenance act parent complaint son'],
      weak: ['old','elderly','parent','senior','70 years','75 years','80 years','neglected','son not caring','daughter not caring','children neglecting','property taken son','house eviction elderly','budhha','budhhi','bujurg','bujurgo','umar','old person','old age','aged parent']
    },
    sections: ['Senior Citizens Act 2007 Sec 4 (Maintenance)','Sec 5 (Tribunal)','Sec 6 (Order for maintenance)','Sec 23 (Transfer of property by senior citizen)','Domestic violence eviction of senior citizen from house (domestic violence)','HAMA Hindu Adoptions Maintenance Act adopted child property (hama)','Transfer of property gift deed revocation (transfer of property)'],
    documents: [
      { name: 'Age Proof (Aadhaar / Birth Certificate)', critical: true },
      { name: 'Proof of relationship with children', critical: true },
      { name: 'Property documents (if property transferred)', critical: false },
      { name: 'Gift Deed (if property transferred to child)', critical: false }
    ],
    probingQuestions: [
      { q: 'Have you transferred any property to your children?', tip: 'That transfer can be cancelled under Sec 23 if they fail to maintain you.' },
      { q: 'Do you have any source of income?', tip: 'Tribunal can order maintenance up to ₹10,000/month.' },
      { q: 'Are you currently living in the house or have been evicted?', tip: 'Interim protection can be obtained quickly from the Maintenance Tribunal.' }
    ],
    contextualQuestions: ['family'],
    limitation: '1 year from cause of action',
    urgency: 'high',
    multiLawCompatible: ['Family – Maintenance / Alimony','Property – Transfer of Property / Sale Deed Dispute']
  },

  // ── NGT / ENVIRONMENTAL VIOLATION ────────────────────────────────────────
  {
    caseType: 'Environment – NGT / Pollution / Environmental Violation',
    lawCategory: 'Environment',
    actName: 'National Green Tribunal Act 2010 + Environment Protection Act 1986 + Water Act 1974 + Air Act 1981 – Environmental Rights',
    keywords: {
      exact: ['a factory near my house is releasing toxic smoke causing health issues','factory near my house releasing toxic smoke causing illness','factory near my house releasing toxic smoke','factory releasing toxic smoke causing illness','chemical plant is releasing effluents into our river polluting water','river near our village completely polluted by industrial effluent','illegal quarrying destroying hillside near our village','hospital is burning biomedical waste openly in residential area','real estate project destroying protected wetland area','nala se ganda paani aa raha hai bimari ho rahi hai village mein','a factory is polluting the river and government is doing nothing i want pil','an illegal stone quarry near my village is causing cracks in houses','illegal brick kiln near my house emitting smoke violating pollution norms','hospital is dumping bio-medical waste openly violating environment','factory pollution is causing cancer in our village what law can i use','factory near my house creates unbearable noise at night','real estate developer destroying wetland near our area','government diverted water from our agricultural canal','ngt complaint','ngt petition environment','illegal construction on river bank near our village','illegal construction river bank village','coal mine dust affecting our farmland crops dying','coal mine dust farmland crops dying'],
      strong: ['ngt','national green tribunal','environmental violation','pollution complaint','factory pollution','industrial pollution','air pollution','water pollution','noise pollution','effluent discharge','toxic waste','hazardous waste','bio-medical waste','environment protection','environmental clearance','cpcb complaint','spcb complaint','pollution control board','environmental damage','wetland destruction','factory smoke','factory near my house smoke','toxic smoke from factory','factory releasing smoke','factory dhuan','dhuan aa raha hai factory se','factory ke dhuen se bimari','factory causing illness smoke','river polluted industrial','river polluted effluent','industrial effluent river','illegal quarrying','quarrying destroying','stone quarry pollution','biomedical waste burning','hospital dumping waste','hospital waste open','wetland destruction project','wetland ecology destroyed','nala pollution','nala ganda paani','ganda paani bimari',
        'emitting black smoke','emitting smoke','black smoke from factory','factory emitting smoke','factory emitting black smoke','smoke from nearby factory','smoke residents sick','smoke making residents sick','smoke causing illness residents','pollution making people sick','factory causing sickness','industrial smoke residents','chimney smoke residents','factory chimney smoke'],
      weak: ['pollution','toxic','effluent','river polluted','noise','quarry','brick kiln','environment','ecology','waste','chemical','industrial waste','polluted water','air quality','ngt','dhuan','factory near house','smoke from factory','factory smoke','emitting','black smoke']
    },
    sections: ['NGT Act 2010 Sec 14 (Original jurisdiction)','NGT Act Sec 15 (Compensation)','Environment Protection Act 1986 Sec 5','Water Act 1974','Air Act 1981','PIL writ petition for environmental violation ngt (pil writ)','Municipal garbage disposal ngt noise pollution (municipal ngt)'],
    documents: [
      { name: 'Photographs/Videos of pollution/violation', critical: true },
      { name: 'Medical reports (if health affected)', critical: false },
      { name: 'Complaints to CPCB/SPCB (if already filed)', critical: false }
    ],
    probingQuestions: [
      { q: 'What type of pollution is involved? (Air/Water/Noise/Solid Waste)', tip: 'NGT has jurisdiction over all environmental disputes.' },
      { q: 'Is the factory/plant licensed and operating with environmental clearance?', tip: 'Unlicensed operation is an additional ground.' },
      { q: 'Have you complained to the Pollution Control Board?', tip: 'A complaint to SPCB/CPCB before NGT shows escalation and strengthens the petition.' }
    ],
    contextualQuestions: ['criminal'],
    limitation: 'NGT: 5 years from cause of action',
    urgency: 'medium',
    multiLawCompatible: ['Constitutional – PIL / Writ Petition / Fundamental Rights']
  },

  // ── MUNICIPAL / LOCAL BODY / BUILDING REGULATIONS ────────────────────────
  {
    caseType: 'Municipal – Building Regulations / Local Body / Demolition Notice',
    lawCategory: 'Municipal',
    actName: 'Municipal Corporation Acts (State-specific) + Building Bye-Laws + Noise Pollution Rules – Municipal Disputes',
    keywords: {
      exact: ['bmc issued demolition notice for my shop','municipality is refusing to give building permission for my house','municipal corporation demolished my legal house without notice or order','municipality is allowing encroachment on public road by private parties','i want to file complaint about illegal building construction by my neighbor','i want to convert my agricultural land to residential use','factory near my house creates unbearable noise at night','my upstairs neighbor creates noise all night what legal remedy','illegal building construction neighbor'],
      strong: ['municipal corporation','municipality','nagar palika','nagarpalika','panchayat','local body','building permission','building plan approval','demolition notice','building demolition','illegal construction','building bye-laws','floor space index','fsi violation','setback violation','unauthorized construction','building regularization','conversion of land','land use change','noise pollution municipal','neighbour construction illegal','nagarpalika ne giraya','municipality demolition without notice','noise from neighbour music','loud music noise complaint','noisy neighbour complaint','neighbour playing loud music'],
      weak: ['bmc','mcd','bbmp','municipal','building','construction','demolition','permission','noise','neighbour','local body','panchayat','ward office','complaint municipality','nagarpalika','loud music','noisy','music neighbor']
    },
    sections: ['Municipal Corporation Act (State-specific)','Building Bye-Laws','Town and Country Planning Acts','Noise Pollution (Regulation and Control) Rules 2000','NGT PIL garbage disposal municipal environment (ngt pil)','Agriculture land conversion residential use (agriculture)','Noise pollution municipal ngt pil writ (ngt pil municipal)'],
    documents: [
      { name: 'Property documents / Sale deed', critical: true },
      { name: 'Building Plan (if approved)', critical: true },
      { name: 'Demolition Notice (if received)', critical: true },
      { name: 'Photographs of construction/violation', critical: false }
    ],
    probingQuestions: [
      { q: 'Is this about demolition of your structure or illegal construction by others?', tip: 'If your structure: challenging demolition. If others: filing municipal complaint.' },
      { q: 'Was a proper show cause notice given before demolition?', tip: 'Law requires show cause notice before demolition. Without notice, demolition can be challenged in High Court.' }
    ],
    contextualQuestions: ['property'],
    limitation: '30–60 days for most municipal appeals',
    urgency: 'high',
    multiLawCompatible: ['Property – Boundary Dispute / Encroachment','Constitutional – PIL / Writ Petition / Fundamental Rights']
  },

  // ── IBC / INSOLVENCY AND BANKRUPTCY ──────────────────────────────────────
  {
    caseType: 'IBC – Insolvency / Bankruptcy / NCLT Proceedings',
    lawCategory: 'Commercial',
    actName: 'Insolvency and Bankruptcy Code 2016 (IBC) + IBBI Regulations – Corporate / Personal Insolvency',
    keywords: {
      exact: ['my company cannot pay its creditors we want to file for insolvency','i am an operational creditor company owes me money i want to file insolvency','i am a financial creditor company owes me 1 crore not paying for 6 months','i am a personal guarantor bank filed insolvency against me','my company filed insolvency what happens to pending lawsuits','i am a homebuyer builder is insolvent how do i get my money back','i am personally bankrupt unable to pay debts bank is seizing assets','ibc insolvency petition','nclt insolvency application','company divaliya ho gayi mujhe paise wapas nahi milenge','company divaliya ho gayi paise wapas kaise milenge'],
      strong: ['ibc','insolvency bankruptcy code','nclt','national company law tribunal','cirp','corporate insolvency resolution process','resolution plan','liquidation','ibc petition','financial creditor','operational creditor','section 7 ibc','section 9 ibc','personal insolvency','bankruptcy petition','resolution professional','moratorium ibc','homebuyer insolvency','builder insolvency','personal guarantor insolvency','debt discharge bankruptcy','personal guarantor','guarantor insolvency','bank filed insolvency'],
      weak: ['insolvency','bankrupt','nclt','creditor','liquidation','insolvent','debt cannot pay','company cannot pay','bank seizing assets','debts exceed assets']
    },
    sections: ['IBC 2016 Sec 7 (Application by Financial Creditor)','IBC Sec 9 (Application by Operational Creditor)','IBC Sec 94 (Application by Individual)','IBC Sec 179 (Personal Guarantor)','Banking SARFAESI recovery proceedings','Money recovery debt from insolvent company','NCLT companies act winding up corporate insolvency'],
    documents: [
      { name: 'Proof of debt (loan agreement, invoices)', critical: true },
      { name: 'Default notice to debtor', critical: true },
      { name: 'Financial statements of debtor company', critical: false }
    ],
    probingQuestions: [
      { q: 'Are you a creditor seeking to file against a defaulting company, or are you the defaulting company?', tip: 'Creditor (Sec 7 or Sec 9) vs debtor (voluntary insolvency) are completely different processes.' },
      { q: 'What is the amount of default?', tip: 'Minimum default threshold is ₹1 crore for corporate insolvency.' }
    ],
    contextualQuestions: ['civil'],
    limitation: '3 years from date of default',
    urgency: 'high',
    multiLawCompatible: ['Civil – SARFAESI / Banking Recovery / DRT','Civil – Money Recovery / Debt Recovery']
  },

  // ── CORRUPTION / PREVENTION OF CORRUPTION ACT ────────────────────────────
  {
    caseType: 'Criminal – Corruption / Bribery / Prevention of Corruption Act',
    lawCategory: 'Criminal',
    actName: 'Prevention of Corruption Act 1988 (Amended 2018) + BNS Sec 61 – Anti-Corruption',
    keywords: {
      exact: ['a government officer is demanding bribe to issue my certificate','a public servant took money from me to process my file','patwari is demanding bribe to correct my land records','passport officer demanding bribe to process my application','school principal demanding bribe for tc of my child','college hostel warden is harassing and extorting students','ration card ke liye patwari rishwat maang raha hai','i want to file complaint with lokpal against central government officer','government officer demanding bribe','public servant demanding bribe','patwari bribe','anti-corruption complaint','ration card nahi bana sarkari afsar paise maang raha','ration card nahi bana sarkari afsar paise maang raha hai','ration card sarkari afsar paise maang raha','sarkari afsar ration card ke liye paise maang raha'],
      strong: ['bribe','bribery','corruption','prevention of corruption act','pca','cbi anti-corruption','anti-corruption bureau','acb','public servant bribe','government official bribe','gratification demand','illegal gratification','trap case bribe','anti-corruption trap','lokpal complaint','lokayukta complaint','vigilance complaint','cvc complaint','cbi complaint corruption','rishwat','bhrashtachar','patwari bribe','inspector bribe','hafta','hafta maang raha','police hafta','hafta vasuli','sarkari babu paisa maang raha','babu paisa maang raha','paisa maang raha kaam ke liye','rishwat de raha','bribe de raha','kaam ke liye paisa maanga'],
      weak: ['government officer','public servant','bribe','demanding money','paying officer','patwari','corrupt','corruption','rishwat','official demanding','illegal demand','trap','vigilance']
    },
    sections: ['Prevention of Corruption Act 1988 Sec 7 (Bribe to public servant)','PCA Sec 13 (Criminal misconduct)','BNS Sec 61 (Public servant taking bribe)','Lokpal Act 2013','Lokayukta Acts (State)','Education school bribery TC certificate corruption (education)'],
    documents: [
      { name: 'Written complaint to ACB / CBI / Lokayukta', critical: true },
      { name: 'Evidence of demand (recordings, witnesses, WhatsApp)', critical: true },
      { name: 'Application submitted to the government office', critical: false }
    ],
    probingQuestions: [
      { q: 'Has the bribe been paid or is the demand ongoing?', tip: 'If demand is ongoing, a trap by ACB/CBI can be set. If paid, a post-bribe complaint is possible.' },
      { q: 'Is this a state or central government officer?', tip: 'Central officers: CBI/Lokpal. State officers: ACB/Lokayukta.' }
    ],
    contextualQuestions: ['criminal'],
    limitation: '4 years under PCA',
    urgency: 'high',
    multiLawCompatible: ['Constitutional – PIL / Writ Petition / Fundamental Rights']
  },

  // ── DPDP / DIGITAL PRIVACY ───────────────────────────────────────────────
  {
    caseType: 'Digital Privacy – DPDP Act / Data Breach / Aadhaar Misuse',
    lawCategory: 'Cyber',
    actName: 'Digital Personal Data Protection Act 2023 (DPDP) + IT Act 2000 Sec 43A + Aadhaar Act 2016 – Data Privacy Rights',
    keywords: {
      exact: ['my personal data was shared with third parties without my consent','app is collecting my location data even when not in use i did not consent','my employer is monitoring my personal device and accessing private data','someone used my aadhar number to take a loan fraudulently','my personal data including bank details appeared on dark web','user data leaked due to server breach customers are suing','my employer is monitoring my personal whatsapp on company phone','dpdp complaint','data breach complaint','aadhaar misuse complaint','data privacy violation','company selling my contact number without consent spam calls','company sold my phone number without consent getting spam','my contact number shared without my consent receiving spam calls','employer tracking my location via phone app without disclosure','employer tracking location via phone app without consent','employer tracking my location without informing me','location tracked by employer app without disclosure','bank ne mera number kisi aur ko diya ab calls aa rahi hain','bank ne phone number share kiya bina permission spam calls'],
      strong: ['dpdp','digital personal data protection','data privacy','data breach','personal data','data protection','data fiduciary','data principal','consent withdrawal','data erasure','right to correction','meity complaint','data processor','sensitive personal data','sec 43a it act','aadhaar fraud','aadhaar misuse','aadhaar data','biometric data misuse','employee monitoring illegal','workplace surveillance','aadhaar se loan fraud','aadhaar se loan liya','aadhaar se loan le liya','aadhar se loan','aadhaar number misuse','aadhaar se kisi ne loan liya','aadhaar se kisi ne loan le liya','aadhaar without consent loan','meri bina marzi aadhaar use','bina permission aadhaar use','bina permission ke aadhaar','aadhaar bina marzi loan','contact number sold without consent','phone number shared without permission','selling phone number without consent','spam calls personal data sold','location tracking app without consent','employer tracking location app','location data without consent','whatsapp personal photos shared','personal photos shared groups','photos shared without consent whatsapp','data breach medical records','medical records shared without consent','medical history leaked','hospital leaked medical records'],
      weak: ['data','privacy','personal information','consent','breach','data leaked','aadhar','aadhaar','monitoring','surveillance','tracking','location data','bank details','dark web']
    },
    sections: ['DPDP Act 2023 (Data Fiduciary obligations)','IT Act 2000 Sec 43A (Compensation for data breach)','Aadhaar Act 2016 Sec 29 (Sharing of identity information)','Data theft personal data dark web breach (data theft)','Cyber data breach consumer startup (cyber consumer)','Wrongful termination employer data DPDP (wrongful termination dpdp)','RTI UIDAI Aadhaar data usage (rti dpdp)'],
    documents: [
      { name: 'Evidence of data breach (screenshots, notifications)', critical: true },
      { name: 'Privacy policy/consent records', critical: false },
      { name: 'Aadhaar misuse evidence (loan taken, identity theft)', critical: false }
    ],
    probingQuestions: [
      { q: 'What type of data was affected? (Financial/Health/Biometric/Location)', tip: 'Sensitive personal data has stricter protection under DPDP Act and IT Act Sec 43A.' },
      { q: 'Has financial loss occurred due to data breach?', tip: 'If Aadhaar misused for loan, file police complaint + UIDAI + bank immediately.' }
    ],
    contextualQuestions: ['cyber'],
    limitation: '2 years under IT Act Sec 46',
    urgency: 'high',
    multiLawCompatible: ['Cyber – IT Act / Online Fraud / Cyber Crime']
  },

  // ── SPECIAL MARRIAGE ACT / INTER-RELIGION MARRIAGE ───────────────────────
  {
    caseType: 'Family – Special Marriage Act / Inter-Religion / Court Marriage',
    lawCategory: 'Family',
    actName: 'Special Marriage Act 1954 + Foreign Marriage Act 1969 – Inter-religion and Court Marriage',
    keywords: {
      exact: ['we are of different religions and want to do court marriage','we filed special marriage act notice but relatives are opposing it','hum dono alag religion ke hain court marriage karni hai','we had inter-religion court marriage now spouse died estate distribution','we are from different castes and our families are opposing our marriage','hindu girl marrying muslim boy what law applies for marriage registration','i want to register my nikah marriage in india','court marriage different religion','special marriage act registration','inter-caste marriage court marriage','hindu girl wants to marry muslim boy what law applies','hindu girl marry muslim boy what law','inter caste marriage family opposing want court marriage','inter-religion marriage family objecting court marriage'],
      strong: ['special marriage act','sma','court marriage','inter-religion marriage','inter-faith marriage','inter-caste marriage','interfaith couple','marriage registration district court','30 day notice marriage','marriage notice objection','civil marriage','secular marriage','love marriage court','nikah registration','register marriage india'],
      weak: ['court marriage','different religion','inter-religion','inter-caste','love marriage','nikah register','marriage registration','civil marriage','secular marriage','marriage notice']
    },
    sections: ['Special Marriage Act 1954 Sec 5 (Notice of intended marriage)','SMA Sec 7 (Publication of notice)','SMA Sec 11 (Solemnization of marriage)','Indian Succession Act 1925 (for inheritance)'],
    documents: [
      { name: 'Birth certificates of both parties (age proof)', critical: true },
      { name: 'Address proof (Aadhaar of both parties)', critical: true },
      { name: 'Affidavit of single/unmarried status', critical: true },
      { name: 'Two witnesses with ID proof', critical: true }
    ],
    probingQuestions: [
      { q: 'What are the religions of the two parties?', tip: 'SMA applies to all, regardless of religion. Both parties can retain their religion after SMA marriage.' },
      { q: 'Is there family opposition or threat from relatives?', tip: 'Many states have protection cells for inter-caste/inter-faith couples.' }
    ],
    contextualQuestions: ['family'],
    limitation: '30-day notice period before marriage',
    urgency: 'medium',
    multiLawCompatible: ['Family – Divorce (Contested)','Family – Maintenance / Alimony']
  },

  // ── ARBITRATION / ADR ─────────────────────────────────────────────────────
  {
    caseType: 'Civil – Arbitration / ADR / Enforcement of Award',
    lawCategory: 'Civil',
    actName: 'Arbitration and Conciliation Act 1996 (Amended 2021) – Arbitration Disputes and Enforcement',
    keywords: {
      exact: ['our contract has arbitration clause i want to invoke it against breach','i want to challenge an arbitration award passed against me','i won arbitration award but party is not complying how to enforce','other party breached contract i want to invoke arbitration','i have an arbitration award how do i enforce it as court decree','our contract says london arbitration applies to india dispute','arbitration clause in contract but other party refusing to go','arbitration award received want to enforce it in court','arbitrator is biased want to challenge appointment','international arbitration foreign company indian dispute','party refusing to arbitrate despite clause'],
      strong: ['arbitration','arbitration clause','arbitration agreement','invoke arbitration','arbitration award','challenge award','enforcement of award','arbitration petition','section 9 arbitration','section 11 arbitration','section 34 arbitration','section 36 arbitration','commercial arbitration','international commercial arbitration','arbitral tribunal','adr','alternative dispute resolution','mediation','conciliation','lok adalat'],
      weak: ['arbitration','award','arbitral','dispute resolution','conciliation','mediation','settle dispute','out of court','lok adalat','contract clause']
    },
    sections: ['Arbitration Act 1996 Sec 8 (Referral)','Sec 9 (Interim measures)','Sec 11 (Appointment of arbitrator)','Sec 34 (Setting aside award)','Sec 36 (Enforcement of award)'],
    documents: [
      { name: 'Contract with Arbitration Clause', critical: true },
      { name: 'Notice invoking arbitration', critical: true },
      { name: 'Arbitration Award (if challenging/enforcing)', critical: false }
    ],
    probingQuestions: [
      { q: 'Does your contract have an arbitration clause? What does it say?', tip: 'The arbitration clause determines: seat, venue, number of arbitrators, rules applicable.' },
      { q: 'Are you invoking arbitration or challenging an existing award?', tip: 'Invoking: serve notice, appoint arbitrator. Challenging award: Sec 34 petition within 90 days.' }
    ],
    contextualQuestions: ['civil'],
    limitation: 'Sec 34: 90 days from award to challenge',
    urgency: 'medium',
    multiLawCompatible: ['Civil – Specific Performance / Contract Breach','Civil – Money Recovery / Debt Recovery']
  },

  // ── LAND ACQUISITION / RFCTLARR ──────────────────────────────────────────
  {
    caseType: 'Property – Land Acquisition / Government Acquisition / Compensation Dispute',
    lawCategory: 'Property',
    actName: 'Right to Fair Compensation and Transparency in Land Acquisition Act 2013 (RFCTLARR) – Land Acquisition Disputes',
    keywords: {
      exact: ['government is acquiring my agricultural land for highway expansion','the compensation given by government for my land is too low','sarkar ne meri zameen le li muawaza nahi mila','sarkar ne meri zameen le li highway ke liye muawaza kam hai','revenue department says my land exceeds ceiling limit and will be acquired','government says my ancestral land falls under forest land act','government acquired part of my land leaving remaining unusable','government official came and said part of my land will be acquired for road','land ceiling limit exceeded','rfctlarr compensation dispute','land acquisition compensation challenge','government taking my land for highway inadequate compensation','government taking land for highway low compensation','land taken for highway compensation too low','my agricultural land acquired for industrial zone want higher rate','agricultural land acquired for industrial zone','land acquired for industrial zone higher compensation','government acquired agricultural land for industry','railway project taking my 2 acres compensation offered very low','railway project taking my land compensation low','government issued section 4 notification for my shop commercial area','section 4 notification land acquisition shop','land acquired but tribal rights exist under forest rights act','forest rights act tribal land acquisition'],
      strong: ['land acquisition','rfctlarr','fair compensation land','land acquisition act','government acquiring land','acquisition notification','section 4 land acquisition','land acquisition award','acquisition compensation','solatium land acquisition','rehabilitation resettlement','land ceiling','land ceiling act','bhumi adhigrahan','muawaza zameen','land acquisition arbitrator','reference court land','government acquiring my land','land for road project','land taken for highway','road project land','compensation too low land','enhanced compensation claim','compensation land dispute','sarkar ne zameen li','highway land compensation','highway compensation inadequate','government taking land for highway','agricultural land for highway','land acquired for highway','industrial zone land acquired','land for industrial area','government land for industrial zone','zameen sarkaar ne le li','zameen ka muaavza nahi mila','muaavza kam diya zameen ka'],
      weak: ['government acquiring','land taken','zameen le li','compensation low','highway expansion land','government land','forest land','ceiling limit land','sarkar zameen','acquisition','muawaza']
    },
    sections: ['RFCTLARR Act 2013 Sec 4 (Preliminary notification)','Sec 26 (Determination of compensation)','Sec 64 (Solatium 100%)','Sec 74 (Reference to court)','Land Ceiling Acts (State-specific)','Agriculture land acquisition compensation (agriculture)','Forest land tribal rights acquisition (forest tribal)','NGT environment PIL for land acquisition','Adverse possession 12 years agricultural land'],
    documents: [
      { name: 'Land Revenue Records (7/12 extract / Jamabandi)', critical: true },
      { name: 'Acquisition Notice / Notification', critical: true },
      { name: 'Compensation Award letter', critical: false },
      { name: 'Market value evidence (recent sale deeds in area)', critical: false }
    ],
    probingQuestions: [
      { q: 'Has a notification been issued? (Preliminary or final acquisition notice)', tip: 'Object within 30 days of Sec 4 notification. After award, file Reference Court within 6 weeks.' },
      { q: 'What compensation has been offered?', tip: 'Claimant is entitled to market value + 100% solatium + 12% additional.' }
    ],
    contextualQuestions: ['property'],
    limitation: '6 weeks from award to file Reference Court',
    urgency: 'high',
    multiLawCompatible: ['Property – Boundary Dispute / Encroachment','Constitutional – PIL / Writ Petition / Fundamental Rights']
  },

  // ── AGRICULTURE / CROP INSURANCE ─────────────────────────────────────────
  {
    caseType: 'Agriculture – Crop Insurance / Land Tenancy / Agricultural Disputes',
    lawCategory: 'Agriculture',
    actName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) + State Agricultural Acts + Agricultural Tenancy Laws – Farm Disputes',
    keywords: {
      exact: ['my crop was damaged by flood insurance company is not paying','local moneylender says he will take my agricultural land i mortgaged','revenue department says my land exceeds ceiling limit and will be acquired','my crop insurance claim for flood damage was partially rejected','power company disconnected my agricultural pump connection illegally','government diverted water from our agricultural canal','gram panchayat is claiming our land exceeds ceiling and should be distributed','heavy rains destroyed my entire crop state government not compensating','my pm fasal bima yojana insurance claim for crop loss was rejected','certified seeds did not germinate what compensation can i get','seed company sold hybrid seeds that failed no compensation','company sold seeds that failed to germinate no compensation given','seeds failed crop company not paying compensation','hybrid seeds failed company refusing compensation'],
      strong: ['crop insurance','fasal bima','pmfby','pradhan mantri fasal bima','crop damage compensation','agriculture insurance','crop loss','flood crop damage','agricultural tenancy','farm land tenancy','agricultural land tenancy','land ceiling agriculture','moneylender agricultural land','kisan credit','agricultural pump disconnection','irrigation canal diversion','certified seeds','seed failure compensation','gram panchayat land dispute','agricultural land tenancy dispute','agricultural tenancy landlord','fake pesticide','spurious pesticide','pesticide crop damage','crop destroyed pesticide','failed seeds crop','seeds did not germinate','seed company compensation','agricultural land converted','land use conversion agricultural','agricultural land use change','zameen par kabza khet','khet par kabza','khet jot raha hai koi aur','fasal barbad ki pesticide ne'],
      weak: ['crop','agriculture','farmer','kisan','zameen','agricultural','flood damage','seed','irrigation','tenancy','moneylender','farm','harvest loss']
    },
    sections: ['PMFBY Guidelines (Crop Insurance)','Consumer Protection Act (Defective Seeds)','Agricultural Tenancy Acts (State-specific)','Land Ceiling Acts (State-specific)','Electricity Act 2003 (Agricultural pump disconnection)','Agriculture land conversion residential use municipal (agriculture municipal)','Government canal water diverted from farm (agriculture ngt)','Tribal community forest land adverse possession (agriculture adverse possession forest)','Land acquisition agriculture (agriculture land acquisition)','SARFAESI moneylender agricultural land mortgage (sarfaesi)'],
    documents: [
      { name: 'Crop Insurance Policy Document', critical: true },
      { name: 'Land Records (7/12, Khasra)', critical: true },
      { name: 'Crop loss assessment document', critical: false },
      { name: 'Photographs of crop damage', critical: false }
    ],
    probingQuestions: [
      { q: 'What type of crop damage occurred? (Flood/Drought/Hailstorm/Pest)', tip: 'PMFBY covers notified calamities. Claim must be filed within 72 hours of damage for cut crop.' },
      { q: 'Is the crop insured under PMFBY or state scheme?', tip: 'If under PMFBY, approach the insurance company and then Agriculture Ombudsman.' }
    ],
    contextualQuestions: ['property'],
    limitation: '2 years for PMFBY claim disputes',
    urgency: 'high',
    multiLawCompatible: ['Property – Land Acquisition / Government Acquisition / Compensation Dispute','Consumer – Insurance Claim Dispute']
  },

  // ── SC/ST ATROCITIES / CASTE DISCRIMINATION ───────────────────────────────
  {
    caseType: 'Criminal – SC/ST Atrocities / Caste Discrimination',
    lawCategory: 'Criminal',
    actName: 'Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act 1989 (PoA Act) – SC/ST Rights',
    keywords: {
      exact: ['my college is discriminating against me on basis of caste','police is harassing members of our sc st community','university professor is discriminating against sc student','my supervisor called me by caste name and humiliated me in front of colleagues','our tribal community has been living on this forest land for generations','police refusing to register sc st atrocity case','sc student scholarship was wrongly denied by state govt','my sc colleague was beaten up by upper caste persons using casteist slurs','sc/st atrocity complaint','sc st discrimination complaint','mere saath jaati ke naam par bhedbhav hua aur gaali di','jaati ke naam par bhedbhav','caste discrimination hindi','landlord refused to rent house knowing i am sc','landlord refused house because i am sc','rent refused sc caste','house not given because sc','jati ke naam se dhamki di aur gaon se nikaala','company ne meri promotion rok di SC hoon isliye','company ne promotion rok di SC hoon isliye','promotion blocked because i am SC caste','employer denied promotion because of SC caste'],
      strong: ['sc st atrocities','poa act','scheduled caste','scheduled tribe','atrocity act','caste discrimination','casteism','untouchability','caste abuses','dalit rights','tribal rights','adivasi rights','sc st act','sc st fir','atrocity fir','special courts sc st','forest rights tribal','forest rights act','scholarship discrimination','caste harassment','jati ke naam se gaali','jaat ke naam se gaali','jaati ke naam par gaali','caste name abused','jati pe gaali','caste based humiliation','lower caste discrimination','sc st humiliated','dalit atyachar','dalit par atyachar','landlord refused rent sc','rent refused because sc','house not given sc caste','refused rent because of caste','promotion refused caste','caste promotion denied','crop destroyed caste enmity','jati ke naam se dhamki','jati ke naam dhamki gaon se nikaala','gaon se nikaala jati','scholarship denied sc','scholarship denied caste','scholarship denied sc st'],
      weak: ['caste','sc','st','dalit','tribal','adivasi','untouchability','discrimination caste','casteist','sc st','lower caste','upper caste','forest land']
    },
    sections: ['SC/ST (PoA) Act 1989 Sec 3 (Offences)','Sec 4 (Wilful neglect by public servant)','Sec 14 (Special courts)','Forest Rights Act 2006 (Tribal forest land)','Education discrimination SC/ST college university (education sc/st atrocit)','Police excess refusing SC/ST FIR (police excess)','Forest tribal land acquisition (forest tribal land acquisition)','Hinglish caste discrimination jaati bhedbhav gaali (sc/st atrocit)','Mere saath jaati ke naam par bhedbhav (sc/st)','Agriculture land adverse possession forest tribal community sc st (agriculture land acquisition adverse possession sc st atrocit sc/st)'],
    documents: [
      { name: 'Caste Certificate (SC/ST)', critical: true },
      { name: 'FIR or Complaint (if filed)', critical: true },
      { name: 'Evidence of discrimination/atrocity', critical: true }
    ],
    probingQuestions: [
      { q: 'Do you have a valid SC or ST caste certificate?', tip: 'PoA Act protection is available only if victim belongs to SC or ST.' },
      { q: 'Has a police complaint been filed?', tip: 'FIR under PoA Act must be registered by a police officer not below Deputy Superintendent.' }
    ],
    contextualQuestions: ['criminal'],
    limitation: '3 years',
    urgency: 'high',
    multiLawCompatible: ['Criminal – Police Excess / Human Rights Violation','Constitutional – PIL / Writ Petition / Fundamental Rights']
  },

  // ── POSH ACT / WORKPLACE SEXUAL HARASSMENT ────────────────────────────────
  {
    caseType: 'Employment – POSH / Workplace Sexual Harassment',
    lawCategory: 'Employment',
    actName: 'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act 2013 (POSH) – Workplace Harassment',
    keywords: {
      exact: ['my boss sexually harassed me and when i complained they fired me','boss harassed me and i was fired after complaining','manager sexually harassed me and fired me when i was 5 months pregnant','i was sexually harassed and fired after complaining to hr','my manager bullies me and uses abusive language daily','my colleague slapped me at workplace','my employer is discriminating because of my depression diagnosis','i am being harassed by someone daily'],
      strong: ['posh act','sexual harassment workplace','posh complaint','internal complaints committee','icc posh','local complaints committee','workplace harassment','sexual harassment at work','unwelcome sexual behaviour','hostile work environment','sexual favours work','sexual gesture workplace','sexual assault workplace','after complaint fired','retaliation harassment','retaliatory dismissal','bullying workplace','workplace discrimination','mental health discrimination employer','sexually harassing','sexually harassed at work','customer sexually harassing','client harassing employee','third party harassing employee','vendor harassing employee','customer harassing','client harassing'],
      weak: ['posh','harassed at work','workplace harassment','boss harassment','colleague harassment','icc complaint','sexual harassment','work environment hostile','unwelcome behaviour','workplace bully']
    },
    sections: ['POSH Act 2013 Sec 4 (Internal Complaints Committee)','Sec 11 (Inquiry)','Sec 13 (Action on report)','Sec 19 (Employer duties)','Sec 26 (Penalties for employer)','Domestic violence online harassment ambiguous harassment (domestic violence online harassment)','Minimum wages equal pay gender discrimination (minimum wages)','Copyright IP authorship moral rights employment (copyright ip)','Wrongful termination bullying abusive manager workplace harassment (wrongful termination)'],
    documents: [
      { name: 'Written complaint to ICC', critical: true },
      { name: 'Evidence of harassment (messages, emails, screenshots)', critical: true },
      { name: 'Termination letter (if fired after complaint)', critical: false }
    ],
    probingQuestions: [
      { q: 'Has the complaint been filed with the ICC?', tip: 'File with ICC within 3 months of the incident. If employer has no ICC, file with Local Complaints Committee.' },
      { q: 'Were you terminated or penalised after filing the complaint?', tip: 'Retaliation after POSH complaint is a serious violation.' }
    ],
    contextualQuestions: ['employment'],
    limitation: '3 months from incident',
    urgency: 'high',
    multiLawCompatible: ['Employment – Wrongful Termination / Illegal Dismissal','Criminal – BNS (Assault / Hurt / Grievous Hurt)']
  },

  // ── MATERNITY BENEFITS ACT ────────────────────────────────────────────────
  {
    caseType: 'Employment – Maternity Benefits / Pregnancy Rights',
    lawCategory: 'Employment',
    actName: 'Maternity Benefit Act 1961 (Amended 2017) – Maternity and Pregnancy Rights at Workplace',
    keywords: {
      exact: ['my employer denied me maternity leave and threatened to terminate me','company refused to pay me maternity benefit during my pregnancy leave','company terminated me when i was 6 months pregnant that is illegal','employer is giving me only 12 weeks maternity leave not 26 weeks','company ne mujhe pregnancy ke doran kaam se nikala jo galat hai','manager sexually harassed me and fired me when i was 5 months pregnant'],
      strong: ['maternity leave','maternity benefit','maternity benefit act','26 weeks maternity','pregnancy leave','maternity pay','nursing break','creche facility maternity','pregnant employee rights','fired during pregnancy','terminated pregnancy','pregnancy discrimination','dismissed pregnant','pregnancy termination employment','ante natal leave','post natal leave','fired when pregnant','fired while i was pregnant','fired 5 months pregnant','fired 6 months pregnant','company fired me pregnant','terminated when pregnant','laid off while pregnant'],
      weak: ['maternity','pregnancy','pregnant','nursing mother','creche','breast feeding','antenatal','postnatal','fired while pregnant','months pregnant','pregnant fired']
    },
    sections: ['Maternity Benefit Act 1961 Sec 5 (26 weeks maternity leave)','Sec 6 (Notice for maternity benefit)','Sec 12 (Dismissal during maternity – prohibited)','Sec 27 (Employer penalty)','Wrongful termination pregnancy maternity leave (wrongful termination)'],
    documents: [
      { name: 'Employment Contract / Offer Letter', critical: true },
      { name: 'Medical certificate confirming pregnancy', critical: true },
      { name: 'Termination letter (if terminated during pregnancy)', critical: false }
    ],
    probingQuestions: [
      { q: 'How many weeks pregnant are you / were you at the time of the issue?', tip: 'Maternity benefit is due from 8 weeks before delivery. Termination during pregnancy is prohibited.' },
      { q: 'How long have you worked with this employer?', tip: 'Minimum 80 days in 12 months preceding delivery is required to claim maternity benefits.' }
    ],
    contextualQuestions: ['employment'],
    limitation: '60 days to file complaint with Inspector',
    urgency: 'high',
    multiLawCompatible: ['Employment – Wrongful Termination / Illegal Dismissal','Employment – POSH / Workplace Sexual Harassment']
  },

  // ── SUCCESSION / INHERITANCE / WILL ──────────────────────────────────────
  {
    caseType: 'Civil – Succession / Inheritance / Will / Estate Disputes',
    lawCategory: 'Civil',
    actName: 'Hindu Succession Act 1956 + Indian Succession Act 1925 + Muslim Personal Law – Succession and Inheritance',
    keywords: {
      exact: ['we are 4 brothers we want to divide our father land equally through court','we need to divide ancestral gold jewellery and moveable assets','meri maa ki death ke baad bhai mere hisse ki zameen nahi de rahe','we had inter-religion court marriage now spouse died estate distribution','my husband nominated his mother for flat in society but i am his wife legal heir','my brother sold joint family property without my consent'],
      strong: ['succession','inheritance','will','estate','deceased','intestate','probate','legal heir','class i heirs','class ii heirs','ancestral property','coparcenary','hindu undivided family','huf','self acquired property','testamentary succession','intestate succession','nomination vs legal heir','indian succession act','hindu succession act','succession certificate','letter of administration','succession dispute','heir certificate'],
      weak: ['died','death','deceased','will','inheritance','estate','property after death','legal heir','family property','ancestral','jewellery divide','father land divide','brothers land divide','brothers property','family settle property']
    },
    sections: ['Hindu Succession Act 1956 Sec 6 (Coparcenary)','HSA Sec 8 (Class I heirs)','Indian Succession Act 1925 Sec 211 (Succession certificate)','CPC Order 20 Rule 13 (Partition decree)','Partition suit brothers after father death (partition)','Joint bank account blocked after husband death (banking succession)','Housing society flat transfer after death (housing society)','NRI inheritance UK father died without will (nri)','Oral will verbal declaration probate (will probate)','Adopted child HAMA equal rights (hama)','Divorce consumer copra wrongful termination edge case (divorce consumer wrongful termination)','Cheque bounce boundary online fraud custody (cheque bounce boundary online fraud custody)'],
    documents: [
      { name: 'Death Certificate of deceased', critical: true },
      { name: 'Proof of relationship to deceased', critical: true },
      { name: 'Will (if any)', critical: false },
      { name: 'Property documents', critical: false }
    ],
    probingQuestions: [
      { q: 'What was the religion of the deceased?', tip: 'Hindu: Hindu Succession Act. Muslim: Muslim Personal Law. Christian/Others: Indian Succession Act.' },
      { q: 'Did the deceased leave a Will?', tip: 'If Will exists, seek probate from court. If no Will (intestate), succession certificate needed for movables.' }
    ],
    contextualQuestions: ['succession','family'],
    limitation: '12 years for immovable property succession',
    urgency: 'low',
    multiLawCompatible: ['Civil – Partition Suit','Property – Transfer of Property / Sale Deed Dispute']
  },

  // ── DEFAMATION / REPUTATION ───────────────────────────────────────────────
  {
    caseType: 'Civil/Criminal – Defamation / False Statements / Reputation Damage',
    lawCategory: 'Criminal',
    actName: 'BNS Sec 356 (Criminal Defamation) + Civil Suit for Damages + IT Act Sec 67 – Defamation and Reputation',
    keywords: {
      exact: ['someone posted defamatory statements about me on facebook','a local newspaper published false allegations about my business','someone created a fake account with my name and is posting false things','after i left review the company is threatening to sue me for defamation','i want to file civil suit for damages for defamatory publications','kisi ne facebook par mujhare baare mein galat baatein likhi','police sent me notice based on my twitter post','edited screenshot of my conversation being circulated defaming me','defamation case against me','defamation suit','false facebook post','fake news about me','whatsapp message spread lie that i am a cheater in business','whatsapp lie spread that i am cheater in business','false message on whatsapp saying i am a cheater','lie spread on whatsapp group about my business'],
      strong: ['defamation','defamatory','libel','slander','false statement','false allegation','false publication','damage to reputation','reputation damage','defamation suit','civil defamation','criminal defamation','bns 356','ipc 499','ipc 500','defamation notice','newspaper false report','social media defamation','online defamation','fake review','negative review defamatory','company threatening defamation','spreading rumours','false rumours','rumours about me','spreading lies about me','baseless rumours','character assassination','izzat kharab ki','izzat barbad ki','jhooth bol kar izzat kharab','badnami ki','reputation kharab ki','fake negative reviews','competitor fake reviews','fake google reviews','competitor defaming my business','news channel false report','media false news','news channel aired false','whatsapp lie spread','lie spread on whatsapp','cheater rumour spread','reputation damaged by lie','meri reputation kharab ki','jhootha bolke reputation kharab'],
      weak: ['defamation','false statement','reputation','false allegation','fake news','spreading lies','baseless allegations','malicious complaint','facebook false','slander','libel']
    },
    sections: ['BNS Sec 356 (Criminal Defamation)','IPC Sec 499/500 (Defamation)','IT Act Sec 67 (Online defamation)','CPC (Civil suit for damages)','Online harassment WhatsApp group defamatory messages (online harassment)','Police excess cyber social media notice Twitter (police excess cyber)','Affidavit false statement cheating defamation (cheating)','Journalist police harassment defamation (defamation)'],
    documents: [
      { name: 'Screenshots/Recording of defamatory content', critical: true },
      { name: 'URL/Links to defamatory posts/articles', critical: true },
      { name: 'Evidence proving statements are false', critical: true }
    ],
    probingQuestions: [
      { q: 'Is the defamatory content online or in print/broadcast?', tip: 'Online: IT Act and BNS. Print/broadcast: Press Council Act + civil/criminal defamation.' },
      { q: 'Are you looking for criminal action or civil damages?', tip: 'Criminal defamation: complaint to magistrate. Civil defamation: suit in civil court.' }
    ],
    contextualQuestions: ['criminal','cyber'],
    limitation: '1 year for criminal defamation; 2 years for civil suit',
    urgency: 'medium',
    multiLawCompatible: ['Cyber – IT Act / Online Fraud / Cyber Crime','Cyber – Online Harassment / Cyberstalking / Defamation']
  },

  // ── BAIL / HABEAS CORPUS / BNSS ───────────────────────────────────────────
  {
    caseType: 'Criminal – Bail / Habeas Corpus / Criminal Procedure (BNSS)',
    lawCategory: 'Criminal',
    actName: 'Bharatiya Nagarik Suraksha Sanhita 2023 (BNSS) + Constitutional Art. 32/226 (Habeas Corpus) – Criminal Procedure and Bail',
    keywords: {
      exact: ['i want to quash a false fir filed against me','i was arrested under ndps act for alleged drug possession','my relative was taken by police and no one knows where he is','i am in jail under ndps case and need bail','i am accused of drug trafficking what are my rights','if i file case will police come to my house first','police station says they cannot register fir as area not in their jurisdiction','magistrate petition under 156 3 for police to register fir','a warrant has been issued in my name i was unaware of the case','court passed order in my favor opponent is ignoring it','anticipatory bail application','quash fir high court'],
      strong: ['bail','anticipatory bail','regular bail','default bail','bail application','bail plea','quash fir','quashing petition','habeas corpus','bnss','section 438 crpc','section 439 crpc','section 482 crpc','chargesheet filed','custody period','judicial custody','police custody','magistrate complaint','cognizable offence','non-cognizable','fir registration','challan filed','arrest without warrant','wrongful arrest','anticipatory bail rejected','warrant issued','legal notice received','limitation period','ndps bail','drug case bail','156 3 crpc','156 bnss','bnss 528','relative taken by police','relative taken police no information','taken by police whereabouts unknown','police took relative whereabouts','family member taken police','family taken police no information','whereabouts unknown police','no information about whereabouts','where is my relative police','where have police taken'],
      weak: ['bail','arrested','fir','quash','warrant','in custody','police station','magistrate','crpc','bnss','chargesheet','challan','custody','legal notice','limitation','anticipatory','ndps','drug case']
    },
    sections: ['BNSS Sec 173 (FIR)','BNSS Sec 479 (Bail)','BNSS Sec 482–483 (Anticipatory bail)','BNSS Sec 528 (Inherent powers of High Court)','CrPC Sec 438 (Anticipatory bail)','CrPC Sec 482 (Quashing)','Art. 226 Constitution (Habeas Corpus by HC)'],
    documents: [
      { name: 'FIR Copy (if filed)', critical: true },
      { name: 'Arrest memo (if arrested)', critical: false },
      { name: 'Chargesheet copy (if filed)', critical: false },
      { name: 'Surety documents', critical: false }
    ],
    probingQuestions: [
      { q: 'Is the person currently in police custody or judicial custody?', tip: 'Police custody: maximum 24 hours without magistrate order. Judicial custody: bail application before magistrate/sessions court.' },
      { q: 'What is the nature of the offence (bailable or non-bailable)?', tip: 'Bailable offences: bail is a right (Sec 436 BNSS). Non-bailable: bail is discretionary.' },
      { q: 'Is this about quashing an FIR or obtaining bail?', tip: 'Quashing: Sec 528 BNSS petition in High Court. Bail: apply before Sessions Court / High Court.' }
    ],
    contextualQuestions: ['criminal'],
    limitation: 'Anticipatory bail: file before arrest',
    urgency: 'critical',
    multiLawCompatible: ['Criminal – Police Excess / Human Rights Violation','Constitutional – PIL / Writ Petition / Fundamental Rights']
  },

  // ── COMPANIES ACT / NCLT / CORPORATE DISPUTES ─────────────────────────────
  {
    caseType: 'Corporate – Companies Act / NCLT / Shareholder Disputes',
    lawCategory: 'Corporate',
    actName: 'Companies Act 2013 + NCLT Rules + SEBI Regulations – Corporate and Shareholder Disputes',
    keywords: {
      exact: ['as minority shareholder directors are oppressing me and mismanaging company','there is a dispute between directors over management of our private company','company is not sharing annual report and audited accounts with shareholders','i want to apply for winding up of my defunct private company','company is not distributing dividend to shareholders despite profits','my startup employer is not giving me my esop despite agreement','my co-founder quit before vesting cliff and claims 50% equity','investor promised funding signed term sheet then backed out alleging fraud','minority shareholder oppression mismanagement nclt','company directors are siphoning funds from company','i am a shareholder company refused to give me share certificate','private limited company annual return not filed penalty','annual return not filed mca penalty','company annual compliance default mca','pvt ltd annual return default','director removed from board without resolution','minority shareholders squeezed out below fair value'],
      strong: ['companies act','nclt','national company law tribunal','oppression mismanagement','minority shareholder','shareholder rights','shareholder dispute','director dispute','board of directors','company winding up','voluntary winding up','compulsory winding up','company dissolution','annual report withheld','dividend not paid','esop dispute','vesting cliff','co-founder dispute','startup equity dispute','term sheet breach','investor dispute','companies act 2013','section 241 companies act','section 242 companies act','section 271 companies act','corporate governance','company law tribunal','nclat'],
      weak: ['company','shareholder','director','board','nclt','esop','equity','dividend','winding up','co-founder','startup','investor','corporate','share','annual report','accounts']
    },
    sections: ['Companies Act 2013 Sec 241 (Oppression and mismanagement)','Sec 242 (Powers of Tribunal)','Sec 244 (Right to apply)','Sec 271 (Winding up by Tribunal)','Sec 213 (Investigation)','SEBI LODR Regulations (Listed companies)','Money recovery debt from company','IBC insolvency winding up NCLT','MSME co-founder partnership equity dispute','Consumer copra Hindi product complaint telecom TRAI (consumer copra)','Startup equity investor fraud money recovery arbitration (cheating money recovery arbitration specific performance)','Salary hike promise specific performance (specific performance)'],
    documents: [
      { name: 'Company registration certificate / MoA / AoA', critical: true },
      { name: 'Share certificates', critical: true },
      { name: 'Board meeting minutes (if any)', critical: false },
      { name: 'Term sheet / Shareholder agreement', critical: false }
    ],
    probingQuestions: [
      { q: 'Is this a private limited company, public company, or LLP?', tip: 'Companies Act applies to companies. LLPs are governed by LLP Act 2008.' },
      { q: 'What percentage of shares do you hold?', tip: 'For oppression/mismanagement: need at least 10% (private) or 100 members (public).' }
    ],
    contextualQuestions: ['civil'],
    limitation: '3 years',
    urgency: 'medium',
    multiLawCompatible: ['IBC – Insolvency / Bankruptcy / NCLT Proceedings','Civil – Money Recovery / Debt Recovery']
  },

  // ── MENTAL HEALTHCARE ACT ─────────────────────────────────────────────────
  {
    caseType: 'Civil – Mental Healthcare Act / Psychiatric Rights / Disability',
    lawCategory: 'Civil',
    actName: 'Mental Healthcare Act 2017 + RPWD Act 2016 + BNS Sec 265 – Mental Healthcare Rights',
    keywords: {
      exact: ['my family wants to forcibly admit me to a mental health facility against my will','my relatives forcibly got me admitted to a mental hospital against my will','my employer is discriminating because of my depression diagnosis','i suffer from anxiety employer forcing me to resign citing mental health','insurance company refusing to cover mental health treatment','i am being admitted to mental hospital forcibly by relatives','my medical records were leaked by hospital to insurance company','mental health stigma workplace discrimination','forcible psychiatric admission against will','mental health hospital without consent','employer discriminating because of my depression diagnosis','employer discriminating because of depression','discriminating because of my depression','employer discriminating depression diagnosis','psychiatrist revealing my diagnosis to my employer','doctor revealed mental health diagnosis to employer','rpwd certificate not given for mental illness','rpwd certificate not given by hospital for mental illness','disability certificate not given for mental illness','hospital refusing rpwd certificate mental illness','disability pension denied for psychiatric condition','mujhe depression hai company ne nikaala','depression hai company ne nikaala bina wajah'],
      strong: ['mental healthcare act','mental health facility','mental hospital','psychiatric hospital','psychiatric admission','forced admission mental hospital','mental health treatment','mental health rights','voluntary mental health patient','mental healthcare review board','discharge from mental hospital','mental health legal aid','depression anxiety employer','mental health discrimination workplace','disability mental health employment','rpwd mental health','mental illness stigma','psychiatric rights','mental capacity','informed consent treatment','medical records privacy mental health','depression discrimination','anxiety discrimination employer','employer discriminating depression','mental illness workplace rights','depression diagnosis employer','psychiatric condition employer','forced to resign mental health','mental health stigma employment','rpwd certificate mental illness','rpwd disability certificate','disability pension psychiatric','disability pension mental illness','psychiatrist breached confidentiality','doctor leaked diagnosis','medical records leaked employer','doctor revealing diagnosis','mental health records leaked'],
      weak: ['mental health','mental hospital','psychiatric','depression','anxiety','forcibly admitted','mental illness','mental healthcare','mental facility','mental health rights','disability mental','mental disorder','treatment without consent']
    },
    sections: ['Mental Healthcare Act 2017 Sec 3 (Rights of persons with mental illness)','MHA 2017 Sec 86 (Supported admission)','MHA 2017 Sec 89 (Independent admission)','RPWD Act 2016 Sec 3 (Equality and non-discrimination)','RPWD Act Sec 20 (Right to work – disability)','Disability discrimination wrongful termination employment','DPDP medical records privacy breach','Insurance company refusing mental health treatment (IRDAI guidelines)'],
    documents: [
      { name: 'Admission papers (if forcibly admitted)', critical: true },
      { name: 'Medical records', critical: false },
      { name: 'Disability certificate (if applicable)', critical: false }
    ],
    probingQuestions: [
      { q: 'Is this about forcible admission to a mental hospital?', tip: 'Under MHA 2017, patients have the right to refuse treatment unless they pose a danger.' },
      { q: 'Is this about employment discrimination due to mental health condition?', tip: 'RPWD Act 2016 covers mental illness as a disability. Employer cannot discriminate.' }
    ],
    contextualQuestions: ['civil'],
    limitation: '3 years',
    urgency: 'high',
    multiLawCompatible: ['Employment – Wrongful Termination / Illegal Dismissal','Consumer – Insurance Claim Dispute']
  },

  // ── MTP ACT / ABORTION RIGHTS ─────────────────────────────────────────────
  {
    caseType: 'Civil – Medical Termination of Pregnancy (MTP) / Reproductive Rights',
    lawCategory: 'Civil',
    actName: 'Medical Termination of Pregnancy Act 1971 (Amended 2021) + POCSO Act – Abortion and Reproductive Rights',
    keywords: {
      exact: ['hospital is refusing to perform legal abortion i am within 20 weeks','i am 22 weeks pregnant and want to terminate due to foetal abnormality','i am a rape survivor 18 weeks pregnant and want abortion','my 14 year old rape victim daughter needs abortion hospital refusing','government hospital is refusing to conduct legal abortion without proper reason','hospital denying abortion despite court permission','doctor refusing mtp act','medical termination of pregnancy refused by hospital','abortion refused by hospital','i want to terminate my pregnancy hospital is refusing','doctor refused to perform mtp on unmarried woman','mtp refused unmarried woman','abortion refused unmarried','hospital refused abortion at 16 weeks','mtp needed due to fetal abnormality detected at 22 weeks','forced abortion by in-laws against will','20 week pregnancy with severe fetal defect hospital refusing mtp','20 weeks pregnant fetal defect hospital refusing termination','unmarried woman 10 weeks pregnant hospital demanding husband consent','unmarried pregnant woman hospital refuses without husband consent'],
      strong: ['mtp act','medical termination of pregnancy','abortion','terminate pregnancy','reproductive rights','foetal abnormality','rape survivor abortion','minor rape victim abortion','20 weeks termination','24 weeks termination','medical board mtp','mtp amendment 2021','right to abortion','pregnancy termination refusal','gestational limit mtp','statutory rape pregnancy','poc co abortion','unwanted pregnancy rape'],
      weak: ['mtp','abortion','terminate pregnancy','pregnant','foetal','rape survivor','rape victim pregnant','reproductive','medical termination','hospital refusing abortion','abortion rights']
    },
    sections: ['MTP Act 1971 Sec 3 (When pregnancy may be terminated)','MTP Amendment 2021 (24 weeks for special categories)','POCSO Act (Minor rape victim abortion)','Constitution Art 21 (Right to reproductive autonomy)','Supreme Court judgments on MTP','POCSO MTP medical negligence consumer rights'],
    documents: [
      { name: 'FIR (if pregnancy due to rape)', critical: false },
      { name: 'Medical reports (gestational age, foetal diagnosis)', critical: true },
      { name: 'Court order (if seeking permission beyond 24 weeks)', critical: false }
    ],
    probingQuestions: [
      { q: 'How many weeks pregnant is the person?', tip: 'Up to 20 weeks: single doctor. 20-24 weeks: two doctors needed. Beyond 24 weeks: Supreme Court or High Court order needed.' },
      { q: 'Is this pregnancy due to rape or sexual assault?', tip: 'Rape survivors are a special category eligible for termination up to 24 weeks without additional approvals.' }
    ],
    contextualQuestions: ['civil'],
    limitation: 'File immediately (time-sensitive)',
    urgency: 'critical',
    multiLawCompatible: ['Criminal – POCSO / Child Sexual Abuse / Child Protection','Consumer – Medical Negligence / Hospital Deficiency']
  },

  // ── PMLA / ENFORCEMENT DIRECTORATE ───────────────────────────────────────
  {
    caseType: 'Criminal – PMLA / Money Laundering / Enforcement Directorate',
    lawCategory: 'Criminal',
    actName: 'Prevention of Money Laundering Act 2002 (PMLA) + FEMA + ED Proceedings – Money Laundering Defence',
    keywords: {
      exact: ['ed has issued a notice to me for alleged money laundering','ed attached my property claiming it is proceeds of crime','enforcement directorate has attached my property under pmla','ed froze my bank account under pmla without prior notice','enforcement directorate is investigating me for money laundering','i received summons from enforcement directorate','ed notice money laundering','pmla arrest provisional attachment','ed investigation my company','pmla notice received','enforcement directorate froze accounts'],
      strong: ['pmla','money laundering','enforcement directorate','ed notice','ed summons','ed arrest','provisional attachment','proceeds of crime','scheduled offence','fema violation','ecir','fera','foreign exchange','hawala','ed proceedings','pmla tribunal','appellate tribunal pmla','money laundering defence','attachment challenge pmla','ed seizure','benami property','ed bank account freeze'],
      weak: ['pmla','money laundering','enforcement directorate','ed','proceeds','attachment','frozen account','hawala','fema','foreign exchange','benami','scheduled offence','ed notice']
    },
    sections: ['PMLA 2002 Sec 3 (Offence of money laundering)','PMLA Sec 4 (Punishment)','PMLA Sec 5 (Provisional attachment)','PMLA Sec 8 (Adjudicating authority)','PMLA Sec 45 (Bail conditions)','FEMA 1999 (Foreign exchange violations)','PMLA appellate tribunal challenge attachment','Money recovery debt banking connection PMLA'],
    documents: [
      { name: 'ED Summons / Notice (copy)', critical: true },
      { name: 'Provisional Attachment Order (if received)', critical: true },
      { name: 'Bank statements', critical: false },
      { name: 'Business records (source of funds)', critical: false }
    ],
    probingQuestions: [
      { q: 'Have you received a summons or a provisional attachment order?', tip: 'Summons: appear with lawyer. Provisional attachment: challenge within 30 days before Adjudicating Authority.' },
      { q: 'What is the predicate/scheduled offence?', tip: 'PMLA requires an underlying scheduled offence (e.g., cheating, corruption). Without this, there is no money laundering.' }
    ],
    contextualQuestions: ['criminal'],
    limitation: 'Challenge attachment: 30 days from order',
    urgency: 'critical',
    multiLawCompatible: ['Criminal – Corruption / Bribery / Prevention of Corruption Act','Civil – SARFAESI / Banking Recovery / DRT']
  },

  // ── FSSAI / FOOD SAFETY ───────────────────────────────────────────────────
  {
    caseType: 'Consumer – Food Safety / FSSAI / Restaurant / Adulteration',
    lawCategory: 'Consumer',
    actName: 'Food Safety and Standards Act 2006 (FSSAI) + Consumer Protection Act 2019 – Food Safety and Adulteration',
    keywords: {
      exact: ['packaged drinking water bottle contained insects','spices purchased at fair have artificial colors not food grade','supermarket sold me expired food which made me sick','flies and rodents in restaurant kitchen want to complain','the restaurant food had dead cockroaches in it i got food poisoning','after eating at a restaurant i got severe food poisoning 30 people affected','after eating at a restaurant i got severe food poisoning','i found insects in packaged food','food poisoning from restaurant','expired food sold by supermarket','restaurant food had cockroach','illegal food colors in food','fake branded food product adulterated','milk adulteration','milk adulterated','milk adulterated with harmful chemicals','water bottle insects','food safety complaint fssai','packaged snacks contained foreign object plastic found inside','snacks plastic found inside','plastic found in packaged snacks','plastic in snacks food','plastic in food packaged','foreign material in food','foreign material found in snack',
        'found dead cockroach in biscuit packet','cockroach in biscuit packet','cockroach in chips packet','cockroach in packaged food','pest in packaged food','worm in packaged food','found worm in food packet','found insect in sealed packet','insect in unopened packet','kirana shop sold me expired medicine','expired medicine sold by chemist','chemist sold expired medicine','medical shop sold expired tablets','shopkeeper sold expired goods','supermarket selling expired products','expired products on shelf','found mould in packaged food','mouldy bread sold','expired biscuits sold','kharab khana restaurant mein mila','expired food kirana shop'],
      strong: ['fssai','food safety','food safety act','food adulteration','adulterated food','food standards','expired food','food poisoning','restaurant hygiene','food contamination','cockroach in food','insects in food','food quality','misleading food label','false food claim','food recall','safe food complaint','food inspector','food license violation','unhygienic kitchen restaurant','food allergy misrepresentation','organic food fraud','food fraud','food standards authority','food grade standard','plastic in food','foreign object in food','plastic found in snacks','adulterated oil','adulterated cooking oil','oil adulteration','false organic claim','fake organic label','organic claim false','doodh mein paani','doodh mila hua','paani milaya doodh mein','milk mixed with water'],
      weak: ['food','restaurant','eating','food poisoning','expired','contaminated','adulterated','cockroach','insects','hygiene','food safety','fssai','kitchen','packaged food','food label']
    },
    sections: ['FSS Act 2006 Sec 51 (Penalty for sub-standard food)','FSS Act Sec 59 (Penalty for misleading advertisement)','Consumer Protection Act 2019 (Consumer rights)','Prevention of Food Adulteration Act','IPC Sec 272/273 (Adulteration of food or drink)','Food safety consumer complaint district commission'],
    documents: [
      { name: 'Photographs of contaminated/expired food', critical: true },
      { name: 'Purchase receipt (from restaurant/shop)', critical: true },
      { name: 'Medical records (if ill from food)', critical: false },
      { name: 'Sample of food (if preserved)', critical: false }
    ],
    probingQuestions: [
      { q: 'Is this about expired food, adulterated food, or unhygienic restaurant?', tip: 'All covered under FSS Act 2006. File complaint with FSSAI or consumer court.' },
      { q: 'Have you been hospitalized due to food poisoning?', tip: 'Serious cases with hospitalization: file FIR under IPC + consumer complaint for compensation.' }
    ],
    contextualQuestions: ['consumer'],
    limitation: '2 years (consumer court)',
    urgency: 'high',
    multiLawCompatible: ['Consumer – Product Defect / Service Deficiency','Consumer – Medical Negligence / Hospital Deficiency']
  },

  // ── ELECTRICITY ACT / UTILITY DISPUTES ────────────────────────────────────
  {
    caseType: 'Civil – Electricity / Utility Dispute / Consumer Grievance',
    lawCategory: 'Civil',
    actName: 'Electricity Act 2003 + Consumer Protection Act 2019 + CERC/SERC Regulations – Electricity Disputes',
    keywords: {
      exact: ['electricity company installed smart meter billing went up 5 times','electricity board disconnected my supply without notice what to do','my electricity bill is 10 times higher than usual without reason','electricity board denying new connection to my newly built house','electricity department replaced my meter wrongly billing for neighbor','power company disconnected my agricultural pump connection illegally','electricity board issued notice for unauthorized connection i did not do it','electricity meter tampered allegation but i did not do it','my electricity connection was given to my tenant builder has not transferred','power outage for weeks utility company not responding','electricity not restored for weeks company not responding','power cut for weeks no response from electricity company','prolonged power outage no response utility company'],
      strong: ['electricity act','electricity board','discom','electricity company','power company','electricity connection','electricity disconnection','electricity bill','smart meter','meter tamper','electricity complaint','electricity consumer','state electricity regulatory commission','serc','cerc','electricity ombudsman','electricity grievance','power supply disconnected','electricity new connection','electricity meter issue','billing error electricity','agricultural pump disconnection','electricity load enhancement','electricity theft allegation','bijli bill','bijli ka bill','bijli connection','bijli kata','bijli katne','bijli board','bijli wala','light bill bahut zyada','bijli bahut zyada aa rahi','meter galt hai bijli ka','power outage weeks','electricity not restored weeks','power supply not restored','prolonged power cut','electricity not coming days','bijli nahi aa rahi hai din se','bijli bahut dino se nahi aayi','bijli meter galat reading'],
      weak: ['electricity','power','meter','bill','connection','disconnection','electricity board','discom','billing','smart meter','electricity complaint','electricity supply','current','voltage','bijli','bijli bill','light bill','light connection','meter billing']
    },
    sections: ['Electricity Act 2003 Sec 135 (Theft of electricity)','Sec 42 (Duties of distribution licensee)','Sec 57 (Standards of performance)','Consumer Protection Act 2019 (Electricity as service)','SERC Regulations (State-specific)','Electricity Ombudsman','Agricultural pump disconnection consumer rights','Utility electricity municipality consumer complaint'],
    documents: [
      { name: 'Electricity bills (last 3-6 months)', critical: true },
      { name: 'Smart meter installation letter (if applicable)', critical: false },
      { name: 'Disconnection notice (if received)', critical: false },
      { name: 'Application for new connection (if denied)', critical: false }
    ],
    probingQuestions: [
      { q: 'Is this about excess billing, disconnection, or connection denial?', tip: 'Excess billing: meter inspection + consumer grievance. Disconnection without notice: Sec 42 violation.' },
      { q: 'Have you filed a complaint with the electricity company/DISCOM?', tip: 'Must first go to DISCOM. If unsatisfied: Electricity Ombudsman, then Consumer Commission.' }
    ],
    contextualQuestions: ['consumer'],
    limitation: '2 years (consumer court)',
    urgency: 'medium',
    multiLawCompatible: ['Consumer – Product Defect / Service Deficiency','Constitutional – PIL / Writ Petition / Fundamental Rights']
  },

];

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTUAL PRE-QUESTIONS ENGINE

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTUAL PRE-QUESTIONS ENGINE
// Returns targeted questions based on detected legal area BEFORE full law mapping
// ═══════════════════════════════════════════════════════════════════════════════

const CONTEXTUAL_QUESTION_SETS = {
  family: [
    { id: 'religion', question: 'What is your religion?', type: 'select', options: ['Hindu', 'Muslim', 'Christian', 'Sikh/Jain/Buddhist', 'Other/Not Sure'], tip: 'Different personal laws apply based on religion (Hindu Marriage Act, Muslim Personal Law, etc.)' },
    { id: 'marital_status', question: 'What is your current marital status?', type: 'select', options: ['Married', 'Separated (living apart)', 'Divorced', 'Never married', 'Widowed'], tip: 'This helps determine applicable matrimonial laws.' },
    { id: 'children', question: 'Are there minor children involved in this matter?', type: 'radio', options: ['Yes', 'No'], tip: 'Child custody and maintenance become primary considerations when children are involved.' },
    { id: 'duration', question: 'How long have you been married / together?', type: 'select', options: ['Less than 1 year', '1–3 years', '3–10 years', 'More than 10 years', 'Not applicable'], tip: 'Duration affects eligibility for certain grounds of divorce and maintenance.' }
  ],
  property: [
    { id: 'property_type', question: 'What type of property is involved?', type: 'select', options: ['Residential (house/flat)', 'Agricultural land', 'Commercial property', 'Plot/vacant land', 'Other'], tip: 'Residential, agricultural, and commercial properties have different legal frameworks.' },
    { id: 'ownership', question: 'What is your relationship to the property?', type: 'select', options: ['Owner with documents', 'Co-owner / Heir', 'Tenant / Occupant', 'Buyer (paid but not transferred)', 'Builder/Developer dispute'], tip: 'Your legal standing defines what remedies are available to you.' },
    { id: 'documents_held', question: 'Do you currently have the original property documents?', type: 'radio', options: ['Yes – with me', 'No – with other party', 'Documents are disputed/forged'], tip: 'Possession of original documents is key in property disputes.' }
  ],
  succession: [
    { id: 'religion', question: 'What was the religion of the deceased?', type: 'select', options: ['Hindu/Buddhist/Sikh/Jain', 'Muslim', 'Christian', 'Other'], tip: 'Hindu Succession Act / Indian Succession Act / Muslim Personal Law apply differently.' },
    { id: 'will_exists', question: 'Did the deceased leave a Will?', type: 'radio', options: ['Yes – known Will', 'No Will (died intestate)', 'Will existence is disputed'], tip: 'Presence/absence of a Will determines which succession rules apply.' },
    { id: 'relationship', question: 'What is your relationship to the deceased?', type: 'select', options: ['Spouse', 'Son/Daughter', 'Parent', 'Sibling', 'Other relative'], tip: 'Inheritance priority depends on your relationship to the deceased.' }
  ],
  employment: [
    { id: 'emp_type', question: 'Are you an employee or employer in this matter?', type: 'radio', options: ['Employee (I am affected)', 'Employer (my employee is affected)'], tip: 'Rights and remedies are different for employees vs employers.' },
    { id: 'company_size', question: 'How many employees does the organisation have?', type: 'select', options: ['Less than 10', '10–50', '50–100', 'More than 100', 'Government/PSU'], tip: 'EPF, ESI, POSH, and Industrial Disputes Act applicability depends on company size.' },
    { id: 'issue_type', question: 'What is the primary employment issue?', type: 'select', options: ['Unfair termination/dismissal', 'Unpaid salary/PF/gratuity', 'Workplace harassment', 'Discrimination', 'Work conditions / hours', 'Other'], tip: 'Different laws apply to different types of employment grievances.' }
  ],
  criminal: [
    { id: 'fir_status', question: 'Has an FIR been registered with the police?', type: 'radio', options: ['Yes – FIR filed', 'No – not yet', 'Police refused to file FIR'], tip: 'FIR is the starting point for criminal action. If refused, a Magistrate complaint is possible.' },
    { id: 'role', question: 'What is your role in the matter?', type: 'select', options: ['Victim / Complainant', 'Accused (need defence)', 'Witness', 'Family of victim/accused'], tip: 'Your role determines the type of legal assistance needed.' },
    { id: 'urgency', question: 'Is there immediate danger or is someone in custody?', type: 'radio', options: ['Yes – urgent help needed', 'No – can plan next steps'], tip: 'If someone is in custody: bail application is the first priority.' }
  ],
  cyber: [
    { id: 'cyber_type', question: 'What type of cyber incident occurred?', type: 'select', options: ['Online financial fraud (money lost)', 'Hacking/data breach', 'Online harassment/stalking', 'Identity theft', 'Fake social media profile', 'Ransomware/malware attack'], tip: 'Different sections of IT Act 2000 and BNS apply to different cyber offences.' },
    { id: 'reported', question: 'Have you reported to cybercrime.gov.in or called 1930?', type: 'radio', options: ['Yes – already reported', 'No – not yet'], tip: 'Report within 24 hours for financial fraud to maximise chances of fund recovery.' },
    { id: 'evidence', question: 'Have you preserved evidence (screenshots, transaction IDs, URLs)?', type: 'radio', options: ['Yes – evidence saved', 'No / Partially'], tip: 'Evidence preservation is critical – content may be deleted by fraudsters.' }
  ],
  consumer: [
    { id: 'dispute_value', question: 'What is the approximate value of your dispute?', type: 'select', options: ['Less than ₹1 lakh', '₹1–10 lakh', '₹10–50 lakh', '₹50 lakh – ₹2 crore', 'More than ₹2 crore'], tip: 'This determines which Consumer Commission has jurisdiction (District/State/National).' },
    { id: 'notice_sent', question: 'Have you sent a formal complaint to the company/hospital?', type: 'radio', options: ['Yes – sent notice/complaint', 'No – not yet'], tip: 'Send a written complaint first. Companies often resolve quickly to avoid Consumer Court.' }
  ],
  civil: [
    { id: 'dispute_type', question: 'What type of civil matter is this?', type: 'select', options: ['Money recovery / loan', 'Contract breach', 'Property dispute', 'Injunction needed', 'Other civil matter'], tip: 'Different civil remedies (money decree, injunction, specific performance) apply.' },
    { id: 'document_proof', question: 'Do you have written documentary evidence?', type: 'radio', options: ['Yes – written agreement/contract', 'Partial – some documents', 'No – only oral agreement'], tip: 'Written evidence significantly improves chances. Oral agreements are harder to prove.' }
  ]
};

function getContextualQuestions(description) {
  const input = description.toLowerCase();
  const detectedAreas = [];

  const detectors = {
    family: ['marriage','divorce','husband','wife','spouse','custody','child','maintenance','alimony','matrimon','conjugal','separation','in-laws','dowry'],
    property: ['property','land','house','flat','plot','tenant','landlord','rent','builder','rera','encroach','boundary','sale deed','transfer'],
    succession: ['died','death','will','inheritance','succession','heir','intestate','probate','estate','deceased'],
    employment: ['job','salary','employer','employee','work','fired','dismissed','office','boss','labour','workman','pf','gratuity','retrench','termination'],
    criminal: ['arrested','fir','police','bail','crime','assault','beaten','beating','attacked','attack','hurt','injured','fraud','cheated','cheque bounce','custody','chargesheet','accused','violence','hit me','hit by'],
    cyber: ['online fraud','cyber fraud','hacked','phishing','upi fraud','digital fraud','social media harass','cyberstalking','data breach'],
    consumer: ['product','hospital','doctor','insurance','refund','defective','consumer','e-commerce']
  };

  for (const [area, kws] of Object.entries(detectors)) {
    if (kws.some(k => input.includes(k))) detectedAreas.push(area);
  }

  if (detectedAreas.length === 0) {
    return {
      areas: [],
      questions: [
        { id: 'issue_area', question: 'What area does your legal issue fall under?', type: 'select', options: ['Family / Marriage / Divorce','Property / Land','Employment / Job','Criminal / Police','Cyber / Online','Consumer / Company','Other'], tip: 'Selecting the right area helps us identify the most relevant laws for your situation.' }
      ]
    };
  }

  const questions = [];
  const primaryArea = detectedAreas[0];
  const primaryQs = CONTEXTUAL_QUESTION_SETS[primaryArea] || [];
  questions.push(...primaryQs.slice(0, 3));

  if (detectedAreas.length > 1 && questions.length < 4) {
    const secondaryArea = detectedAreas[1];
    const secondaryQs = CONTEXTUAL_QUESTION_SETS[secondaryArea] || [];
    if (secondaryQs.length > 0) questions.push(secondaryQs[0]);
  }

  return { areas: detectedAreas, questions: questions.slice(0, 4) };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETECTION ENGINE v3.0
// ═══════════════════════════════════════════════════════════════════════════════

function analyzeMultipleLaws(userInput, contextualAnswers = {}) {
  const answerText = Object.values(contextualAnswers).filter(v => typeof v === 'string').join(' ');
  const input = (userInput + ' ' + answerText).toLowerCase()
    .replace(/['".,!?;:()\[\]]/g, ' ')
    .replace(/\s+/g, ' ').trim();

  const results = [];

  LAWS_DATABASE.forEach(law => {
    let confidence = 0;
    let exactHits = 0, strongHits = 0, weakHits = 0;

    for (const kw of law.keywords.exact) {
      if (input.includes(kw.toLowerCase())) {
        confidence += 50;
        exactHits++;
        if (exactHits >= 2) break;
      }
    }

    for (const kw of law.keywords.strong) {
      if (input.includes(kw.toLowerCase())) {
        confidence += 22;
        strongHits++;
      }
    }

    // hinglish + casual phrases are scored at strong tier (22pts)
    for (const kw of (law.keywords.hinglish || [])) {
      if (input.includes(kw.toLowerCase())) {
        confidence += 22;
        strongHits++;
      }
    }
    for (const kw of (law.keywords.casual || [])) {
      if (input.includes(kw.toLowerCase())) {
        confidence += 22;
        strongHits++;
      }
    }

    for (const kw of law.keywords.weak) {
      if (input.includes(kw.toLowerCase())) {
        confidence += 8;
        weakHits++;
      }
    }

    if (strongHits > 0 && weakHits > 1) confidence += 10;
    if (strongHits >= 3) confidence += 12;

    if (contextualAnswers.detectedAreas) {
      const areas = contextualAnswers.detectedAreas || [];
      if (law.contextualQuestions && law.contextualQuestions.some(a => areas.includes(a))) {
        confidence += 8;
      }
    }

    if (confidence >= 20) {
      const priority = confidence >= 85 ? 1 : confidence >= 55 ? 2 : 3;
      results.push({
        caseType: law.caseType,
        lawCategory: law.lawCategory,
        actName: law.actName,
        confidence: Math.min(97, Math.round(confidence)),
        matchType: exactHits > 0 ? 'exact' : strongHits > 0 ? 'strong' : 'weak',
        priority,
        lawSections: law.sections || [],
        documents: law.documents || [],
        probingQuestions: law.probingQuestions || [],
        limitation: law.limitation || '',
        urgency: law.urgency || 'medium'
      });
    }
  });

  const sorted = results.sort((a, b) => b.confidence - a.confidence);

  // If no results, do a "best effort" fallback with the top 3 partial matches
  if (sorted.length === 0) {
    const fallbackResults = [];
    LAWS_DATABASE.forEach(law => {
      let score = 0;
      const inp = input;
      // Check any word overlap
      [...law.keywords.strong, ...law.keywords.weak].forEach(kw => {
        if (kw.split(' ').some(w => w.length > 3 && inp.includes(w.toLowerCase()))) score++;
      });
      if (score > 0) fallbackResults.push({ ...law, _score: score });
    });
    return fallbackResults
      .sort((a,b) => b._score - a._score)
      .slice(0,3)
      .map((r,i) => ({
        caseType: r.caseType, lawCategory: r.lawCategory, actName: r.actName,
        confidence: Math.min(25, r._score * 5),
        matchType: 'partial', priority: i+1,
        lawSections: r.sections || [], documents: r.documents || [],
        probingQuestions: r.probingQuestions || [],
        limitation: r.limitation || '', urgency: r.urgency || 'medium',
        isFallback: true
      }));
  }

  return sorted.slice(0, 6).map((r, i) => ({ ...r, priority: i + 1 }));
}

module.exports = LAWS_DATABASE;
module.exports.analyzeMultipleLaws = analyzeMultipleLaws;
module.exports.getContextualQuestions = getContextualQuestions;
