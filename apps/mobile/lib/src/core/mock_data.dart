// LifeKit Mobile Mock Data – Fallback dataset matching Web source of truth

class MockData {
  static final Map<String, dynamic> user = {
    'id': 'user-1',
    'fullName': 'Arjun Sharma',
    'email': 'arjun@example.com',
    'phone': '+91 98765 43210',
    'avatarUrl': null,
    'userType': 'professional',
    'location': 'Bengaluru, India',
    'bio':
        'Software engineer passionate about AI and building meaningful products.',
    'focusAreas': ['career', 'finance', 'health'],
    'skills': [
      {'name': 'JavaScript', 'level': 'advanced'},
      {'name': 'React', 'level': 'advanced'},
      {'name': 'Python', 'level': 'intermediate'},
    ],
    'interests': ['Technology', 'Startups', 'Fitness', 'Reading'],
    'careerInfo': {
      'currentRole': 'Software Engineer',
      'company': 'TechCorp',
      'industry': 'Technology',
      'yearsOfExperience': 3,
      'education': 'B.Tech Computer Science',
    },
    'preferences': {
      'learningStyle': 'hands-on',
      'weeklyAvailableHours': 15,
      'budgetRange': {'min': 0, 'max': 10000, 'currency': 'INR'},
      'notificationPreference': 'important',
      'theme': 'light',
      'language': 'en',
      'timezone': 'Asia/Kolkata',
      'dateFormat': 'DD/MM/YYYY',
      'aiResponseStyle': 'balanced',
      'recommendationFrequency': 'weekly',
      'planningDepth': 'standard',
      'memoryEnabled': true,
    },
    'personalGoals': [
      'Become an AI engineer',
      'Save ₹5 Lakh',
      'Run a half marathon'
    ],
    'isEmailVerified': true,
    'isTwoFactorEnabled': false,
    'createdAt': '2024-01-15T10:00:00Z',
    'updatedAt': '2025-07-20T08:00:00Z',
    'role': 'admin', // Enabled admin preview
    'subscriptionPlan': 'plus',
    'onboardingCompleted': true,
  };

  static final List<Map<String, dynamic>> missions = [
    {
      'id': 1,
      'title': 'Become a Software Engineer',
      'goal':
          'Master Python, DSA, System Design, and land a Sr. Engineer role.',
      'category': 'Career',
      'status': 'ACTIVE',
      'priority': 'high',
      'progress': 42.0,
      'targetDate': '2025-12-31T00:00:00Z',
      'milestones': [
        {
          'id': 101,
          'title': 'Learn Python & Data Structures',
          'status': 'COMPLETED'
        },
        {
          'id': 102,
          'title': 'Build 3 Fullstack AI Projects',
          'status': 'IN_PROGRESS'
        },
        {
          'id': 103,
          'title': 'Complete System Design Interview Prep',
          'status': 'PENDING'
        },
      ],
    },
    {
      'id': 2,
      'title': 'Save ₹5 Lakh Emergency & Investment Fund',
      'goal':
          'Automate monthly savings and build a diversified mutual fund portfolio.',
      'category': 'Finance',
      'status': 'ACTIVE',
      'priority': 'high',
      'progress': 28.0,
      'targetDate': '2025-10-31T00:00:00Z',
      'milestones': [
        {
          'id': 201,
          'title': 'Track monthly expenses & eliminate waste',
          'status': 'COMPLETED'
        },
        {
          'id': 202,
          'title': 'Setup SIP of ₹25,000/month',
          'status': 'IN_PROGRESS'
        },
      ],
    },
    {
      'id': 3,
      'title': 'Run Bengaluru Half Marathon (21K)',
      'goal':
          'Follow a 16-week endurance running plan and finish under 2h 15m.',
      'category': 'Health & Fitness',
      'status': 'ACTIVE',
      'priority': 'medium',
      'progress': 35.0,
      'targetDate': '2025-11-15T00:00:00Z',
      'milestones': [
        {
          'id': 301,
          'title': 'Reach 10K distance without walking',
          'status': 'COMPLETED'
        },
        {
          'id': 302,
          'title': 'Complete 15K long weekend runs',
          'status': 'PENDING'
        },
      ],
    },
  ];

  static final List<Map<String, dynamic>> tasks = [
    {
      'id': 1001,
      'missionId': 1,
      'title': 'Solve 2 LeetCode Medium Dynamic Programming problems',
      'description': 'Focus on knapsack & DP memory optimization',
      'status': 'PENDING',
      'priority': 'high',
      'estimatedDurationMinutes': 45,
      'dueDate': '2026-08-13T18:00:00Z',
    },
    {
      'id': 1002,
      'missionId': 1,
      'title': 'Read System Design chapter on Distributed Caching',
      'description': 'Understand Redis cluster eviction policies',
      'status': 'IN_PROGRESS',
      'priority': 'urgent',
      'estimatedDurationMinutes': 60,
      'dueDate': '2026-08-13T20:00:00Z',
    },
    {
      'id': 1003,
      'missionId': 2,
      'title': 'Review monthly SIP auto-debit confirmation',
      'description': 'Check bank balance for SIP deduction',
      'status': 'COMPLETED',
      'priority': 'medium',
      'estimatedDurationMinutes': 15,
      'dueDate': '2026-08-12T10:00:00Z',
    },
    {
      'id': 1004,
      'missionId': 3,
      'title': 'Evening 8K Tempo Run @ 5:45 min/km pace',
      'description': 'Stay hydrated and do post-run stretches',
      'status': 'PENDING',
      'priority': 'medium',
      'estimatedDurationMinutes': 50,
      'dueDate': '2026-08-13T19:30:00Z',
    },
    {
      'id': 1005,
      'missionId': 1,
      'title': 'Refactor Next.js authentication middleware',
      'description': 'Use JWT refresh token rotation',
      'status': 'COMPLETED',
      'priority': 'low',
      'estimatedDurationMinutes': 40,
      'dueDate': '2026-08-11T16:00:00Z',
    },
  ];

  static final List<Map<String, dynamic>> recommendations = [
    {
      'id': 1,
      'title': 'Optimize Study Schedule for High-Cognitive Peak',
      'description':
          'Your peak focus is between 9 AM and 11:30 AM. Move System Design study sessions to this window.',
      'category': 'Productivity',
      'status': 'ACTIVE',
      'impact': 'High',
    },
    {
      'id': 2,
      'title': 'Automate Debt Payoff Allocation',
      'description':
          'Setting up auto-sweep into high-yield liquid funds will boost annual savings by ~₹18,500.',
      'category': 'Finance',
      'status': 'ACTIVE',
      'impact': 'Medium',
    },
  ];

  static final List<Map<String, dynamic>> agents = [
    {
      'id': 'agent-coach',
      'name': 'AI Life Coach',
      'role': 'Holistic Goal Strategist',
      'avatar': '🧠',
      'rating': 4.9,
      'description':
          'Main AI assistant for goal tracking, accountability, daily check-ins, and actionable motivation.',
      'capabilities': [
        'Goal Decomposition',
        'Schedule Optimization',
        'Progress Review'
      ],
    },
    {
      'id': 'agent-tech',
      'name': 'Tech Career Mentor',
      'role': 'Software & AI Architect',
      'avatar': '💻',
      'rating': 4.8,
      'description':
          'Specialized mentor for code architecture, System Design, interview prep, and career roadmap.',
      'capabilities': ['Code Review', 'System Design', 'Interview Mocking'],
    },
    {
      'id': 'agent-wealth',
      'name': 'Wealth Architect',
      'role': 'Financial Planner',
      'avatar': '📈',
      'rating': 4.9,
      'description':
          'Personal finance expert focused on budgeting, SIP allocations, tax optimization, and wealth building.',
      'capabilities': ['SIP Calculator', 'Budget Audit', 'Asset Allocation'],
    },
    {
      'id': 'agent-fitness',
      'name': 'Endurance Coach',
      'role': 'Marathon & Nutrition Coach',
      'avatar': '🏃',
      'rating': 4.7,
      'description':
          'Personal trainer specializing in running progression, fatigue monitoring, and high-performance nutrition.',
      'capabilities': [
        'Run Pace Calculator',
        'Recovery Advice',
        'Meal Planning'
      ],
    },
  ];

  static final List<Map<String, dynamic>> marketplace = [
    {
      'id': 1,
      'title': 'AI System Design Mastery Blueprint',
      'author': 'Alex Chen (Ex-Google Lead)',
      'price': '₹499',
      'rating': 4.9,
      'category': 'Career & Code',
      'description':
          'Complete interactive roadmap with 25+ real-world system design cases, diagrams, and mock answers.',
      'tags': ['Architecture', 'System Design', 'Interview'],
      'unlocked': false,
    },
    {
      'id': 2,
      'title': 'Zero-Based Personal Budgeting Toolkit',
      'author': 'Priya Mehta (CFP)',
      'price': 'Free',
      'rating': 4.8,
      'category': 'Finance',
      'description':
          'Automated spreadsheet template and AI prompt pack for monthly cash flow planning and debt reduction.',
      'tags': ['Budgeting', 'Savings', 'Finance'],
      'unlocked': true,
    },
    {
      'id': 3,
      'title': '16-Week Half Marathon Training Protocol',
      'author': 'Coach David Miller',
      'price': '₹299',
      'rating': 4.7,
      'category': 'Health',
      'description':
          'Heart-rate zone training plan with daily workout audio prompts and injury prevention guides.',
      'tags': ['Running', 'Marathon', 'Fitness'],
      'unlocked': false,
    },
  ];

  static final List<Map<String, dynamic>> opportunities = [
    {
      'id': 101,
      'title': 'Senior AI Systems Engineer',
      'company': 'NexusAI Labs',
      'location': 'Bengaluru / Remote',
      'category': 'Jobs',
      'salary': '₹30 - 45 LPA',
      'deadline': 'In 5 days',
      'matchScore': 94,
      'description':
          'Build large-scale AI agent orchestration platforms using Python, FastAPI, vector DBs, and LLMs.',
    },
    {
      'id': 102,
      'title': 'Google Cloud AI Fellow Grant',
      'company': 'Google for Startups',
      'location': 'Global (Online)',
      'category': 'Grants',
      'salary': '\$10,000 Credits',
      'deadline': 'In 12 days',
      'matchScore': 88,
      'description':
          'Equity-free infrastructure grant for indie hackers and developers building AI productivity tools.',
    },
    {
      'id': 103,
      'title': 'Full-Stack Developer Internship',
      'company': 'LifeKit Open Source',
      'location': 'Remote',
      'category': 'Internships',
      'salary': '₹25,000 / mo',
      'deadline': 'In 3 days',
      'matchScore': 91,
      'description':
          'Work directly with core maintainers on Flutter mobile app and Next.js frontend.',
    },
  ];

  static final List<Map<String, dynamic>> memories = [
    {
      'id': 1,
      'content':
          'Prefers morning deep work between 8:00 AM and 11:30 AM without meetings.',
      'type': 'preference',
      'tags': ['productivity', 'schedule'],
      'createdAt': '2026-07-10T11:00:00Z',
    },
    {
      'id': 2,
      'content':
          'Targeting ₹5 Lakh emergency reserve in ICICI Liquid Mutual Fund.',
      'type': 'financial_goal',
      'tags': ['finance', 'savings'],
      'createdAt': '2026-07-15T14:30:00Z',
    },
    {
      'id': 3,
      'content':
          'Had right knee tendonitis in 2024; needs adequate warm-up before interval runs.',
      'type': 'health',
      'tags': ['fitness', 'injury'],
      'createdAt': '2026-07-22T09:15:00Z',
    },
  ];

  static final List<Map<String, dynamic>> notifications = [
    {
      'id': 1,
      'title': 'Daily Focus Task Ready',
      'message':
          'Your top priority task "Read System Design chapter" is scheduled for 8:00 PM today.',
      'type': 'reminder',
      'read': false,
      'createdAt': '2026-08-13T07:30:00Z',
    },
    {
      'id': 2,
      'title': 'AI Coach Recommendation',
      'message':
          'Coach suggested moving study window to morning based on your recent activity logs.',
      'type': 'ai_insight',
      'read': false,
      'createdAt': '2026-08-12T19:00:00Z',
    },
    {
      'id': 3,
      'title': 'Milestone Completed!',
      'message':
          'Congrats! You completed "Learn Python & Data Structures" milestone.',
      'type': 'achievement',
      'read': true,
      'createdAt': '2026-08-10T12:00:00Z',
    },
  ];

  static final List<Map<String, dynamic>> plans = [
    {
      'id': 1,
      'title': 'AI System Architect Sprint Plan',
      'goal': 'Master microservices & LLM app deployment in 30 days',
      'steps': [
        'Week 1: FastAPI + PostgreSQL schema design',
        'Week 2: Qdrant Vector search integration',
        'Week 3: Celery background worker setup',
        'Week 4: Docker & Kubernetes deployment',
      ],
      'status': 'ACTIVE',
      'createdAt': '2026-08-01T10:00:00Z',
    },
  ];

  static final Map<String, dynamic> analytics = {
    'missionCompletionRate': 33,
    'taskCompletionRate': 68,
    'activeMissions': 3,
    'completedMissions': 1,
    'completedMilestones': 4,
    'totalTasksCompleted': 47,
    'currentStreak': 5,
    'longestStreak': 12,
    'averageDelayDays': 1.8,
    'weeklyProductivity': [
      {'day': 'Mon', 'tasksCompleted': 3, 'minutesWorked': 90},
      {'day': 'Tue', 'tasksCompleted': 2, 'minutesWorked': 60},
      {'day': 'Wed', 'tasksCompleted': 4, 'minutesWorked': 120},
      {'day': 'Thu', 'tasksCompleted': 1, 'minutesWorked': 30},
      {'day': 'Fri', 'tasksCompleted': 3, 'minutesWorked': 90},
      {'day': 'Sat', 'tasksCompleted': 5, 'minutesWorked': 150},
      {'day': 'Sun', 'tasksCompleted': 2, 'minutesWorked': 60},
    ],
    'categoryProgress': [
      {
        'category': 'Career',
        'completedMissions': 0,
        'activeMissions': 1,
        'completionRate': 42
      },
      {
        'category': 'Finance',
        'completedMissions': 0,
        'activeMissions': 1,
        'completionRate': 28
      },
      {
        'category': 'Health',
        'completedMissions': 1,
        'activeMissions': 1,
        'completionRate': 35
      },
    ],
  };

  static final List<Map<String, dynamic>> adminUsers = [
    {
      'id': 'user-1',
      'name': 'Arjun Sharma',
      'email': 'arjun@example.com',
      'role': 'Admin',
      'plan': 'Plus',
      'status': 'Active',
      'registered': '15 Jan 2024',
    },
    {
      'id': 'user-2',
      'name': 'Sarah Jenkins',
      'email': 'sarah@example.com',
      'role': 'User',
      'plan': 'Pro',
      'status': 'Active',
      'registered': '02 Mar 2024',
    },
    {
      'id': 'user-3',
      'name': 'Vikram Malhotra',
      'email': 'vikram@example.com',
      'role': 'User',
      'plan': 'Free',
      'status': 'Active',
      'registered': '18 May 2024',
    },
  ];

  static final List<Map<String, dynamic>> adminAuditLogs = [
    {
      'id': 'log-101',
      'event': 'User Role Update',
      'actor': 'admin@lifekit.ai',
      'target': 'arjun@example.com',
      'ip': '192.168.1.1',
      'timestamp': '2026-08-13 10:15:22',
    },
    {
      'id': 'log-102',
      'event': 'Marketplace Listing Approved',
      'actor': 'moderator@lifekit.ai',
      'target': 'Listing #1',
      'ip': '192.168.1.45',
      'timestamp': '2026-08-13 09:30:10',
    },
  ];

  static final List<Map<String, dynamic>> adminSupportTickets = [
    {
      'id': 'TICK-901',
      'subject': 'Unable to connect Google Calendar integration',
      'user': 'arjun@example.com',
      'priority': 'Medium',
      'status': 'Open',
      'createdAt': '2026-08-13 08:20:00',
    },
    {
      'id': 'TICK-899',
      'subject': 'Billing receipt query for July subscription',
      'user': 'sarah@example.com',
      'priority': 'Low',
      'status': 'Resolved',
      'createdAt': '2026-08-10 14:10:00',
    },
  ];
}
