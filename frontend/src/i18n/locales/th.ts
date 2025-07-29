export const th = {
  // Navigation & General
  nav: {
    dashboard: 'แดชบอร์ด',
    workout: 'ออกกำลังกาย',
    coach: 'โค้ช',
    profile: 'โปรไฟล์',
    videos: 'วิดีโอ',
    logout: 'ออกจากระบบ',
    login: 'เข้าสู่ระบบ',
    signup: 'สมัครสมาชิก'
  },

  // Common UI Elements
  common: {
    loading: 'กำลังโหลด...',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    close: 'ปิด',
    edit: 'แก้ไข',
    delete: 'ลบ',
    confirm: 'ยืนยัน',
    back: 'กลับ',
    next: 'ถัดไป',
    previous: 'ก่อนหน้า',
    search: 'ค้นหา',
    filter: 'กรอง',
    clear: 'ล้าง',
    apply: 'ใช้',
    reset: 'รีเซ็ต',
    submit: 'ส่ง',
    success: 'สำเร็จ',
    error: 'ข้อผิดพลาด',
    warning: 'คำเตือน',
    info: 'ข้อมูล'
  },

  // Authentication
  auth: {
    welcome: 'ยินดีต้อนรับสู่ School of Sharks',
    loginTitle: 'เข้าสู่ระบบบัญชีของคุณ',
    signupTitle: 'สร้างบัญชีของคุณ',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    forgotPassword: 'ลืมรหัสผ่าน?',
    rememberMe: 'จดจำฉัน',
    signIn: 'เข้าสู่ระบบ',
    signUp: 'สมัครสมาชิก',
    alreadyHaveAccount: 'มีบัญชีอยู่แล้ว?',
    dontHaveAccount: 'ยังไม่มีบัญชี?',
    signingIn: 'กำลังเข้าสู่ระบบ...',
    signingUp: 'กำลังสร้างบัญชี...',
    loginSuccess: 'เข้าสู่ระบบสำเร็จ!',
    signupSuccess: 'สร้างบัญชีสำเร็จ!',
    loginError: 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลของคุณ',
    signupError: 'สร้างบัญชีไม่สำเร็จ กรุณาลองอีกครั้ง',
    invalidEmail: 'กรุณาใส่อีเมลที่ถูกต้อง',
    passwordTooShort: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    passwordMismatch: 'รหัสผ่านไม่ตรงกัน'
  },

// Dashboard
dashboard: {
  title: 'แดชบอร์ด',
  welcome: 'ยินดีต้อนรับกลับมา ฉลาม!',
  todaysWorkout: 'การออกกำลังกายวันนี้',
  weeklyProgress: 'ความคืบหน้าประจำสัปดาห์',
  upcomingSessions: 'เซสชั่นที่กำลังจะมาถึง',
  recentActivity: 'กิจกรรมล่าสุด',
  weeklyStats: 'สถิติประจำสัปดาห์',
  
  // Enhanced stats section with all dashboard metrics
  stats: {
    // Core workout metrics
    totalWorkouts: 'การออกกำลังกายทั้งหมด',
    weeklyHours: 'ชั่วโมงต่อสัปดาห์',
    avgPower: 'พลังงานเฉลี่ย',
    fitness: 'คะแนนความฟิต',
    
    // Dashboard specific stats
    totalRideTime: 'เวลาปั่นรวม',
    workoutsCompleted: 'คอร์สที่ทำแล้ว',
    ftp: 'FTP',
    upcomingWorkouts: 'คอร์สที่กำลังจะมาถึง',
    
    // Additional performance metrics
    weeklyDistance: 'ระยะทางประจำสัปดาห์',
    averageSpeed: 'ความเร็วเฉลี่ย',
    totalElevation: 'ความสูงรวม',
    trainingLoad: 'โหลดการฝึก',
    recoveryScore: 'คะแนนการฟื้นตัว',
    weeklyTSS: 'TSS ประจำสัปดาห์',
    
    // Progress indicators
    improvement: 'การปรับปรุง',
    decline: 'การลดลง',
    stable: 'คงที่',
    target: 'เป้าหมาย',
    achieved: 'บรรลุ',
    
    // Training zones
    zone1: 'โซน 1 - การฟื้นตัว',
    zone2: 'โซน 2 - ความอดทน',
    zone3: 'โซน 3 - เทมโป',
    zone4: 'โซน 4 - เกณฑ์',
    zone5: 'โซน 5 - VO2 สูงสุด',
    zone6: 'โซน 6 - ประสาทกล้ามเนื้อ',
    
    // Weekly summary
    thisWeek: 'สัปดาห์นี้',
    lastWeek: 'สัปดาห์ที่แล้ว',
    weeklyGoal: 'เป้าหมายสัปดาห์',
    weeklyCompletion: 'ความสมบูรณ์ประจำสัปดาห์'
  },
  
  // Dashboard cards and sections
  cards: {
    performance: 'ประสิทธิภาพ',
    training: 'การฝึก',
    recovery: 'การฟื้นตัว',
    goals: 'เป้าหมาย',
    analysis: 'การวิเคราะห์'
  },
  
  // Quick actions
  actions: {
    startWorkout: 'เริ่มการออกกำลังกาย',
    viewProgress: 'ดูความคืบหน้า',
    updateGoals: 'อัปเดตเป้าหมาย',
    viewCalendar: 'ดูปฏิทิน',
    syncDevices: 'ซิงค์อุปกรณ์'
  }
},

  // Workout
  workout: {
    title: 'การออกกำลังกาย',
    weeklySchedule: 'ตารางประจำสัปดาห์',
    workoutLibrary: 'คลังการออกกำลังกาย',
    assignedWorkouts: 'การออกกำลังกายที่ได้รับมอบหมาย',
    completedWorkouts: 'การออกกำลังกายที่เสร็จสิ้น',
    noWorkouts: 'ไม่มีการออกกำลังกายที่กำหนดไว้',
    workoutDetails: 'รายละเอียดการออกกำลังกาย',
    startWorkout: 'เริ่มการออกกำลังกาย',
    completeWorkout: 'ทำเครื่องหมายเสร็จสิ้น',
    pauseWorkout: 'หยุดชั่วคราว',
    resumeWorkout: 'ดำเนินต่อ',
    endWorkout: 'จบการออกกำลังกาย',
    workoutComplete: 'การออกกำลังกายเสร็จสิ้น!',
    duration: 'ระยะเวลา',
    difficulty: 'ความยาก',
    intensity: 'ความเข้มข้น',
    type: 'ประเภท',
    status: 'สถานะ',
    priority: 'ความสำคัญ',
    notes: 'หมายเหตุ',
    coachNotes: 'หมายเหตุโค้ช',
    instructions: 'คำแนะนำ',
    segmentsTitle: 'ส่วนการออกกำลังกาย',
    structure: 'โครงสร้างการออกกำลังกาย',
    noStructure: 'ไม่มีโครงสร้างการออกกำลังกายรายละเอียด',
    structureNote: 'การออกกำลังกายนี้จะถูกจัดโครงสร้างระหว่างการใช้งาน',
    
    // Workout Types
    types: {
      threshold: 'เกณฑ์',
      vo2max: 'VO2 สูงสุด',
      zone2: 'โซน 2',
      endurance: 'ความอดทน',
      sprint: 'สปรินต์',
      recovery: 'การฟื้นตัว',
      interval: 'อินเทอร์วัล',
      sweetspot: 'จุดหวาน'
    },

    // Workout Status
    statuses: {
      assigned: 'ได้รับมอบหมาย',
      in_progress: 'กำลังดำเนินการ',
      completed: 'เสร็จสิ้น',
      skipped: 'ข้าม',
      planned: 'วางแผนไว้'
    },

    // Priority Levels
    priorities: {
      low: 'ต่ำ',
      medium: 'ปานกลาง',
      high: 'สูง',
      critical: 'วิกฤต'
    },

    // Segment Types
    segments: {
      warmup: 'วอร์มอัพ',
      work: 'การทำงาน',
      rest: 'พัก',
      recovery: 'ฟื้นตัว',
      cooldown: 'คูลดาวน์',
      main: 'เซ็ตหลัก',
      interval: 'อินเทอร์วัล'
    },

    // Workout Descriptions
    descriptions: {
      threshold: 'การออกกำลังกายเกณฑ์แบบคลาสสิกเพื่อสร้างความสามารถในการบัฟเฟอร์แลคเตทและ FTP เหมาะสำหรับนักปั่นระดับกลางถึงขั้นสูงที่ต้องการปรับปรุงพลังงานอย่างต่อเนื่อง',
      vo2max: 'อินเทอร์วัลความเข้มข้นสูงเพื่อเพิ่มการดูดซึมออกซิเจนและพลังงานแบบไร้ออกซิเจนสูงสุด การออกแรงเหล่านี้จะผลักดันคุณถึงขีดจำกัดและปรับปรุงความฟิตระดับสูงอย่างมีนัยสำคัญ',
      zone2: 'การออกแรงแอโรบิกอย่างต่อเนื่องยาวนานเพื่อสร้างความฟิตพื้นฐานและความสามารถในการเผาผลาญไขมัน เป็นรากฐานของความฟิตในการปั่นจักรยานทั้งหมด',
      endurance: 'การออกแรงแอโรบิกอย่างต่อเนื่องยาวนานเพื่อสร้างความฟิตพื้นฐานและความสามารถในการเผาผลาญไขมัน เป็นรากฐานของความฟิตในการปั่นจักรยานทั้งหมด',
      sprint: 'การออกแรงระเบิดสั้น ๆ เพื่อพัฒนาพลังงานประสาทกล้ามเนื้อและความสามารถในการสปรินต์ เหมาะสำหรับการพัฒนาการเตะสุดท้าย',
      recovery: 'เซสชั่นการฟื้นตัวแบบแอคทีฟอย่างอ่อนโยนเพื่อส่งเสริมการไหลเวียนเลือดและช่วยในการฟื้นตัวระหว่างเซสชั่นการฝึกหนัก',
      default: 'การออกกำลังกายปั่นจักรยานที่มีโครงสร้างเพื่อปรับปรุงความฟิตและประสิทธิภาพของคุณ'
    },

    // Graph & Analytics
    graph: {
      title: 'โครงสร้างการออกกำลังกาย',
      timeAxis: 'เวลา (นาที)',
      intensityAxis: '% อัตราการเต้นหัวใจสูงสุด',
      powerAxis: '% FTP',
      heartRate: 'อัตราการเต้นหัวใจ (% สูงสุด)',
      power: 'พลังงาน (% FTP)',
      total: 'รวม',
      intensityLevels: {
        low: 'ต่ำ (<60%)',
        mid: 'ปานกลาง (60-74%)',
        high: 'สูง (75-89%)',
        veryHigh: 'สูงมาก (≥90%)',
        noData: 'ไม่มีข้อมูล'
      }
    }
  },

  // Profile
  profile: {
    title: 'โปรไฟล์',
    personalInfo: 'ข้อมูลส่วนตัว',
    trainingSettings: 'การตั้งค่าการฝึก',
    preferences: 'การตั้งค่า',
    statistics: 'สถิติ',
    name: 'ชื่อ',
    email: 'อีเมล',
    age: 'อายุ',
    weight: 'น้ำหนัก',
    height: 'ส่วนสูง',
    ftp: 'FTP (วัตต์)',
    maxHr: 'อัตราการเต้นหัวใจสูงสุด',
    restHr: 'อัตราการเต้นหัวใจขณะพัก',
    trainingZones: 'โซนการฝึก',
    language: 'ภาษา',
    units: 'หน่วย',
    notifications: 'การแจ้งเตือน',
    privacy: 'ความเป็นส่วนตัว',
    updateProfile: 'อัปเดตโปรไฟล์',
    changePassword: 'เปลี่ยนรหัสผ่าน',
    deleteAccount: 'ลบบัญชี'
  },

  // Videos
  videos: {
    title: 'วิดีโอการฝึก',
    categories: 'หมวดหมู่',
    featured: 'วิดีโอแนะนำ',
    recent: 'เพิ่มล่าสุด',
    popular: 'ยอดนิยม',
    myVideos: 'วิดีโอของฉัน',
    watchLater: 'ดูภายหลัง',
    completed: 'เสร็จสิ้น',
    duration: 'ระยะเวลา',
    views: 'การดู',
    uploadedBy: 'อัปโหลดโดย',
    description: 'คำอธิบาย',
    relatedVideos: 'วิดีโอที่เกี่ยวข้อง',
    noVideos: 'ไม่มีวิดีโอ',
    loading: 'กำลังโหลดวิดีโอ...'
  },

  // Language Selection
  language: {
    select: 'เลือกภาษา',
    english: 'English (อังกฤษ)',
    thai: 'ไทย',
    current: 'ภาษาปัจจุบัน'
  },

  // Error Messages
  errors: {
    general: 'มีบางอย่างผิดพลาด กรุณาลองอีกครั้ง',
    network: 'ข้อผิดพลาดเครือข่าย กรุณาตรวจสอบการเชื่อมต่อของคุณ',
    unauthorized: 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบอีกครั้ง',
    forbidden: 'การเข้าถึงถูกปฏิเสธ',
    notFound: 'ไม่พบทรัพยากร',
    validation: 'กรุณาตรวจสอบข้อมูลที่ป้อน',
    timeout: 'หมดเวลาคำขอ กรุณาลองอีกครั้ง',
    serverError: 'ข้อผิดพลาดเซิร์ฟเวอร์ กรุณาลองอีกครั้งในภายหลัง'
  },

  // Success Messages
  success: {
    saved: 'บันทึกการเปลี่ยนแปลงสำเร็จ',
    updated: 'อัปเดตสำเร็จ',
    deleted: 'ลบสำเร็จ',
    created: 'สร้างสำเร็จ',
    uploaded: 'อัปโหลดสำเร็จ',
    workoutStarted: 'เริ่มการออกกำลังกายสำเร็จ',
    workoutCompleted: 'เสร็จสิ้นการออกกำลังกายสำเร็จ'
  },

  // Time & Date
  time: {
    minutes: 'นาที',
    hours: 'ชั่วโมง',
    seconds: 'วินาที',
    days: 'วัน',
    weeks: 'สัปดาห์',
    months: 'เดือน',
    today: 'วันนี้',
    yesterday: 'เมื่อวาน',
    tomorrow: 'พรุ่งนี้',
    thisWeek: 'สัปดาห์นี้',
    lastWeek: 'สัปดาห์ที่แล้ว',
    nextWeek: 'สัปดาห์หน้า'
  },

  // Coach Dashboard
  coach: {
    title: 'แดชบอร์ดโค้ช',
    subtitle: 'จัดการนักกีฬาและติดตามความก้าวหน้าในการฝึกซ้อม',
    selectAthlete: 'เลือกนักกีฬา',
    noAthleteSelected: 'โปรดเลือกนักกีฬาเพื่อดูปฏิทินการฝึกซ้อม',
    athleteSearch: 'ค้นหานักกีฬา...',
    viewCalendar: 'ดูปฏิทินการฝึกซ้อม',
    athleteStats: 'สถิตินักกีฬา',
    totalAthletes: 'นักกีฬาทั้งหมด',
    activeWorkouts: 'การออกกำลังกายที่กำลังดำเนินการ',
    completedThisWeek: 'เสร็จสิ้นในสัปดาห์นี้',
    
    // Calendar View
    calendar: {
      title: 'ปฏิทินการฝึกซ้อม',
      monthView: 'มุมมองรายเดือน',
      weekView: 'มุมมองรายสัปดาห์',
      dayView: 'มุมมองรายวัน',
      plannedWorkouts: 'การออกกำลังกายที่วางแผนไว้',
      completedWorkouts: 'การออกกำลังกายที่เสร็จสิ้น',
      noWorkouts: 'ไม่มีการออกกำลังกายที่กำหนดไว้ในช่วงนี้',
      workoutDetails: 'รายละเอียดการออกกำลังกาย',
      assignWorkout: 'มอบหมายการออกกำลังกาย',
      editWorkout: 'แก้ไขการออกกำลังกาย',
      removeWorkout: 'ลบการออกกำลังกาย'
    },

    // Workout Status
    workoutStatus: {
      planned: 'วางแผนไว้',
      started: 'เริ่มแล้ว',
      in_progress: 'กำลังดำเนินการ',
      completed: 'เสร็จสิ้น',
      missed: 'พลาด',
      skipped: 'ข้าม'
    },

    // Athlete Profile
    athlete: {
      profile: 'โปรไฟล์นักกีฬา',
      personalInfo: 'ข้อมูลส่วนตัว',
      trainingZones: 'โซนการฝึกซ้อม',
      recentActivity: 'กิจกรรมล่าสุด',
      performance: 'ตัวชี้วัดประสิทธิภาพ',
      ftp: 'FTP (วัตต์)',
      maxHeartRate: 'อัตราการเต้นหัวใจสูงสุด',
      restHeartRate: 'อัตราการเต้นหัวใจขณะพัก',
      weight: 'น้ำหนัก (กก.)',
      height: 'ส่วนสูง (ซม.)',
      experience: 'ระดับประสบการณ์',
      joinedDate: 'วันที่เข้าร่วม',
      lastActivity: 'กิจกรรมล่าสุด'
    },

    // Actions
    actions: {
      assignWorkout: 'มอบหมายการออกกำลังกายใหม่',
      viewProgress: 'ดูความก้าวหน้า',
      sendMessage: 'ส่งข้อความ',
      scheduleSession: 'กำหนดตารางเซสชัน',
      exportData: 'ส่งออกข้อมูล',
      generateReport: 'สร้างรายงาน'
    }
  }
};
