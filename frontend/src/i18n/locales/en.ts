export const en = {
  // Navigation & General
  nav: {
    dashboard: 'Dashboard',
    workout: 'Workout',
    coach: 'Coach',
    profile: 'Profile',
    videos: 'Videos',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up'
  },

  // Common UI Elements
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    apply: 'Apply',
    reset: 'Reset',
    submit: 'Submit',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information'
  },

  // Authentication
  auth: {
    welcome: 'Welcome to School of Sharks',
    loginTitle: 'Sign in to your account',
    signupTitle: 'Create your account',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot your password?',
    rememberMe: 'Remember me',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signingIn: 'Signing in...',
    signingUp: 'Creating account...',
    loginSuccess: 'Login successful!',
    signupSuccess: 'Account created successfully!',
    loginError: 'Login failed. Please check your credentials.',
    signupError: 'Account creation failed. Please try again.',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordMismatch: 'Passwords do not match'
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome back, Shark!',
    todaysWorkout: "Today's Workout",
    weeklyProgress: 'Weekly Progress',
    upcomingSessions: 'Upcoming Sessions',
    recentActivity: 'Recent Activity',
    weeklyStats: 'Weekly Stats',
    stats: {
      totalWorkouts: 'Total Workouts',
      weeklyHours: 'Weekly Hours',
      avgPower: 'Average Power',
      fitness: 'Fitness Score',
      totalRideTime: 'Total Ride Time',
      workoutsCompleted: 'Completed WO',
      ftp: 'FTP',
      upcomingWorkouts: 'Upcoming WO'
    }
  },

  // Workout
  workout: {
    title: 'Workout',
    weeklySchedule: 'Weekly Schedule',
    workoutLibrary: 'Workout Library',
    assignedWorkouts: 'Assigned Workouts',
    completedWorkouts: 'Completed Workouts',
    noWorkouts: 'No workouts scheduled',
    workoutDetails: 'Workout Details',
    startWorkout: 'Start Workout',
    completeWorkout: 'Mark Complete',
    pauseWorkout: 'Pause Workout',
    resumeWorkout: 'Resume Workout',
    endWorkout: 'End Workout',
    workoutComplete: 'Workout Complete!',
    duration: 'Duration',
    difficulty: 'Difficulty',
    intensity: 'Intensity',
    type: 'Type',
    status: 'Status',
    priority: 'Priority',
    notes: 'Notes',
    coachNotes: 'Coach Notes',
    instructions: 'Instructions',
    segmentsTitle: 'Segments',
    structure: 'Workout Structure',
    noStructure: 'Detailed workout structure not available',
    structureNote: 'This workout will be structured during execution',
    
    // Workout Types
    types: {
      threshold: 'Threshold',
      vo2max: 'VO2 Max',
      zone2: 'Zone 2',
      endurance: 'Endurance',
      sprint: 'Sprint',
      recovery: 'Recovery',
      interval: 'Interval',
      sweetspot: 'Sweet Spot'
    },

    // Workout Status
    statuses: {
      assigned: 'Assigned',
      in_progress: 'In Progress',
      completed: 'Completed',
      skipped: 'Skipped',
      planned: 'Planned'
    },

    // Priority Levels
    priorities: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    },

    // Segment Types
    segments: {
      warmup: 'Warmup',
      work: 'Work',
      rest: 'Rest',
      recovery: 'Recovery',
      cooldown: 'Cooldown',
      main: 'Main Set',
      interval: 'Interval'
    },

    // Workout Descriptions
    descriptions: {
      threshold: 'Classic threshold workout to build lactate buffering capacity and FTP. Perfect for intermediate to advanced cyclists looking to improve their sustained power output.',
      vo2max: 'High-intensity intervals to maximize oxygen uptake and anaerobic power. These efforts will push you to your limits and significantly improve your top-end fitness.',
      zone2: 'Long steady aerobic effort to build your base fitness and fat-burning capacity. The foundation of all cycling fitness.',
      endurance: 'Long steady aerobic effort to build your base fitness and fat-burning capacity. The foundation of all cycling fitness.',
      sprint: 'Short explosive efforts to develop neuromuscular power and sprint capacity. Perfect for developing your finishing kick.',
      recovery: 'Gentle active recovery session to promote blood flow and aid recovery between hard training sessions.',
      default: 'Structured cycling workout designed to improve your fitness and performance.'
    },

    // Graph & Analytics
    graph: {
      title: 'Workout Structure',
      timeAxis: 'Time (minutes)',
      intensityAxis: '% Max HR',
      powerAxis: '% FTP',
      heartRate: 'Heart Rate (% Max HR)',
      power: 'Power (% FTP)',
      total: 'Total',
      intensityLevels: {
        low: 'Low (<60%)',
        mid: 'Mid (60-74%)',
        high: 'High (75-89%)',
        veryHigh: 'Very High (≥90%)',
        noData: 'No Data'
      }
    }
  },

  // Profile
  profile: {
    title: 'Profile',
    personalInfo: 'Personal Information',
    trainingSettings: 'Training Settings',
    preferences: 'Preferences',
    statistics: 'Statistics',
    name: 'Name',
    email: 'Email',
    age: 'Age',
    weight: 'Weight',
    height: 'Height',
    ftp: 'FTP (Watts)',
    maxHr: 'Max Heart Rate',
    restHr: 'Resting Heart Rate',
    trainingZones: 'Training Zones',
    language: 'Language',
    units: 'Units',
    notifications: 'Notifications',
    privacy: 'Privacy',
    updateProfile: 'Update Profile',
    changePassword: 'Change Password',
    deleteAccount: 'Delete Account'
  },

  // Videos
  videos: {
    title: 'Training Videos',
    categories: 'Categories',
    featured: 'Featured Videos',
    recent: 'Recently Added',
    popular: 'Popular',
    myVideos: 'My Videos',
    watchLater: 'Watch Later',
    completed: 'Completed',
    duration: 'Duration',
    views: 'views',
    uploadedBy: 'Uploaded by',
    description: 'Description',
    relatedVideos: 'Related Videos',
    noVideos: 'No videos available',
    loading: 'Loading videos...'
  },

  // Language Selection
  language: {
    select: 'Select Language',
    english: 'English',
    thai: 'ไทย (Thai)',
    current: 'Current Language'
  },

  // Error Messages
  errors: {
    general: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    unauthorized: 'Unauthorized. Please log in again.',
    forbidden: 'Access denied.',
    notFound: 'Resource not found.',
    validation: 'Please check your input.',
    timeout: 'Request timeout. Please try again.',
    serverError: 'Server error. Please try again later.'
  },

  // Success Messages
  success: {
    saved: 'Changes saved successfully',
    updated: 'Updated successfully',
    deleted: 'Deleted successfully',
    created: 'Created successfully',
    uploaded: 'Uploaded successfully',
    workoutStarted: 'Workout started successfully',
    workoutCompleted: 'Workout completed successfully'
  },

  // Time & Date
  time: {
    minutes: 'min',
    hours: 'hr',
    seconds: 'sec',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    nextWeek: 'Next Week'
  },

  // Coach Dashboard
  coach: {
    title: 'Coach Dashboard',
    subtitle: 'Manage your athletes and monitor their training progress',
    selectAthlete: 'Select an Athlete',
    noAthleteSelected: 'Please select an athlete to view their training calendar',
    athleteSearch: 'Search athletes...',
    viewCalendar: 'View Training Calendar',
    athleteStats: 'Athlete Statistics',
    totalAthletes: 'Total Athletes',
    activeWorkouts: 'Active Workouts',
    completedThisWeek: 'Completed This Week',
    
    // Calendar View
    calendar: {
      title: 'Training Calendar',
      monthView: 'Month View',
      weekView: 'Week View',
      dayView: 'Day View',
      plannedWorkouts: 'Planned Workouts',
      completedWorkouts: 'Completed Workouts',
      noWorkouts: 'No workouts scheduled for this period',
      workoutDetails: 'Workout Details',
      assignWorkout: 'Assign Workout',
      editWorkout: 'Edit Workout',
      removeWorkout: 'Remove Workout'
    },

    // Workout Status
    workoutStatus: {
      planned: 'Planned',
      started: 'Started',
      in_progress: 'In Progress',
      completed: 'Completed',
      missed: 'Missed',
      skipped: 'Skipped'
    },

    // Athlete Profile
    athlete: {
      profile: 'Athlete Profile',
      personalInfo: 'Personal Information',
      trainingZones: 'Training Zones',
      recentActivity: 'Recent Activity',
      performance: 'Performance Metrics',
      ftp: 'FTP (Watts)',
      maxHeartRate: 'Max Heart Rate',
      restHeartRate: 'Rest Heart Rate',
      weight: 'Weight (kg)',
      height: 'Height (cm)',
      experience: 'Experience Level',
      joinedDate: 'Joined Date',
      lastActivity: 'Last Activity'
    },

    // Actions
    actions: {
      assignWorkout: 'Assign New Workout',
      viewProgress: 'View Progress',
      sendMessage: 'Send Message',
      scheduleSession: 'Schedule Session',
      exportData: 'Export Data',
      generateReport: 'Generate Report'
    }
  }
};

export type TranslationKeys = typeof en;
