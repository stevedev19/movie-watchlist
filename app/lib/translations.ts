export type Language = 'en' | 'uz' | 'ko'

export interface Translations {
  // Common
  common: {
    add: string
    delete: string
    edit: string
    save: string
    cancel: string
    search: string
    filter: string
    login: string
    logout: string
    signup: string
    welcome: string
    back: string
    refresh: string
  }
  
  // Homepage
  home: {
    title: string
    subtitle: string
    eyebrow: string
    description: string
    addNewMovie: string
    watchedMovies: string
    viewAllMovies: string
    getStarted: string
    signIn: string
    recommendedMovies: string
    recommendedDescription: string
    noRecommendedMovies: string
    statsMoviesSaved: string
    statsWatched: string
    statsLastUpdated: string
  }
  
  // Dashboard
  dashboard: {
    title: string
    myWatchlist: string
    watchedMovies: string
    moviesToWatch: string
    allMovies: string
    addMovie: string
    searchPlaceholder: string
    filterAll: string
    filterWatched: string
    filterUnwatched: string
    statsTotal: string
    statsWatched: string
    statsToWatch: string
    statsLastUpdated: string
  }
  
  // Movie Card
  movieCard: {
    watched: string
    unwatch: string
    rateMovie: string
    addedOn: string
    watchedOn: string
    noPoster: string
  }
  
  // Admin
  admin: {
    title: string
    subtitle: string
    backToDashboard: string
    totalUsers: string
    adminUsers: string
    regularUsers: string
    users: string
    activityLogs: string
    allUsers: string
    searchByName: string
    allRoles: string
    name: string
    role: string
    userId: string
    lastLogin: string
    actions: string
    promote: string
    demote: string
    disable: string
    noUsers: string
    noUsersMessage: string
    noActivity: string
    noActivityMessage: string
  }
  
  // Auth
  auth: {
    loginTitle: string
    signupTitle: string
    name: string
    password: string
    confirmPassword: string
    switchToSignup: string
    switchToLogin: string
    loginSuccess: string
    signupSuccess: string
  }
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      add: 'Add',
      delete: 'Delete',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      search: 'Search',
      filter: 'Filter',
      login: 'Login',
      logout: 'Logout',
      signup: 'Sign Up',
      welcome: 'Welcome',
      back: 'Back',
      refresh: 'Refresh',
    },
    home: {
      title: 'Track Your',
      subtitle: 'Seen Movies',
      eyebrow: 'MOVIE WATCHLIST · PERSONAL DASHBOARD',
      description: 'Never forget a movie you want to watch. Organize your watchlist, rate what you\'ve seen, and discover your next favorite film.',
      addNewMovie: 'Add New Movie',
      watchedMovies: 'Watched Movies',
      viewAllMovies: 'View All Movies',
      getStarted: 'Get Started',
      signIn: 'Sign In',
      recommendedMovies: 'Recommended Movies',
      recommendedDescription: 'Discover the highest-rated movies from our community. These are the top picks that users have watched and loved.',
      noRecommendedMovies: 'No highly rated movies yet. Be the first to rate a movie 4+ stars!',
      statsMoviesSaved: 'movies saved',
      statsWatched: 'watched',
      statsLastUpdated: 'Last updated',
    },
    dashboard: {
      title: 'Track Your Watchlist',
      myWatchlist: 'My Watchlist',
      watchedMovies: 'Watched Movies',
      moviesToWatch: 'Movies To Watch',
      allMovies: 'All Movies',
      addMovie: 'Add Movie',
      searchPlaceholder: 'Search movies...',
      filterAll: 'All',
      filterWatched: 'Watched',
      filterUnwatched: 'To Watch',
      statsTotal: 'Movies Added',
      statsWatched: 'Watched',
      statsToWatch: 'To Watch',
      statsLastUpdated: 'Last Updated',
    },
    movieCard: {
      watched: 'Watched',
      unwatch: 'Unwatch',
      rateMovie: 'Rate this movie',
      addedOn: 'Added on',
      watchedOn: 'Watched on',
      noPoster: 'No poster',
    },
    admin: {
      title: 'Admin Panel',
      subtitle: 'Manage users, roles, and monitor activity across your watchlist app.',
      backToDashboard: 'Back to Dashboard',
      totalUsers: 'Total Users',
      adminUsers: 'Admin Users',
      regularUsers: 'Regular Users',
      users: 'Users',
      activityLogs: 'Activity Logs',
      allUsers: 'All Users',
      searchByName: 'Search by name...',
      allRoles: 'All Roles',
      name: 'Name',
      role: 'Role',
      userId: 'User ID',
      lastLogin: 'Last Login',
      actions: 'Actions',
      promote: 'Promote',
      demote: 'Demote',
      disable: 'Disable',
      noUsers: 'No users found',
      noUsersMessage: 'No users yet — users will appear here once they sign up.',
      noActivity: 'No activity yet',
      noActivityMessage: 'User actions will appear here.',
    },
    auth: {
      loginTitle: 'Login',
      signupTitle: 'Sign Up',
      name: 'Name',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      switchToSignup: 'Don\'t have an account? Sign up',
      switchToLogin: 'Already have an account? Login',
      loginSuccess: 'Login successful!',
      signupSuccess: 'Sign up successful!',
    },
  },
  uz: {
    common: {
      add: 'Qo\'shish',
      delete: 'O\'chirish',
      edit: 'Tahrirlash',
      save: 'Saqlash',
      cancel: 'Bekor qilish',
      search: 'Qidirish',
      filter: 'Filtrlash',
      login: 'Kirish',
      logout: 'Chiqish',
      signup: 'Ro\'yxatdan o\'tish',
      welcome: 'Xush kelibsiz',
      back: 'Orqaga',
      refresh: 'Yangilash',
    },
    home: {
      title: 'Kuzatib Boring',
      subtitle: 'Ko\'rilgan Filmlar',
      eyebrow: 'FILM RO\'YXATI · SHAXSIY BOSHQARUV PANELI',
      description: 'Ko\'rishni xohlagan filmlarni unutmang. Ro\'yxatingizni tartibga soling, ko\'rgan filmlaringizni baholang va keyingi sevimli filmingizni toping.',
      addNewMovie: 'Yangi Film Qo\'shish',
      watchedMovies: 'Ko\'rilgan Filmlar',
      viewAllMovies: 'Barcha Filmlarni Ko\'rish',
      getStarted: 'Boshlash',
      signIn: 'Kirish',
      recommendedMovies: 'Tavsiya Etilgan Filmlar',
      recommendedDescription: 'Jamiyatimizning eng yuqori baholangan filmlarini kashf eting. Bu foydalanuvchilar tomosha qilgan va yoqtirgan eng yaxshi filmlar.',
      noRecommendedMovies: 'Hali yuqori baholangan filmlar yo\'q. Birinchi bo\'lib filmni 4+ yulduz bilan baholang!',
      statsMoviesSaved: 'film saqlandi',
      statsWatched: 'ko\'rildi',
      statsLastUpdated: 'Oxirgi yangilanish',
    },
    dashboard: {
      title: 'Ro\'yxatingizni Kuzatib Boring',
      myWatchlist: 'Mening Ro\'yxatim',
      watchedMovies: 'Ko\'rilgan Filmlar',
      moviesToWatch: 'Ko\'rish Kerak',
      allMovies: 'Barcha Filmlar',
      addMovie: 'Film Qo\'shish',
      searchPlaceholder: 'Filmlarni qidirish...',
      filterAll: 'Barchasi',
      filterWatched: 'Ko\'rilgan',
      filterUnwatched: 'Ko\'rish Kerak',
      statsTotal: 'Qo\'shilgan Filmlar',
      statsWatched: 'Ko\'rilgan',
      statsToWatch: 'Ko\'rish Kerak',
      statsLastUpdated: 'Oxirgi Yangilanish',
    },
    movieCard: {
      watched: 'Ko\'rilgan',
      unwatch: 'Ko\'rilmagan',
      rateMovie: 'Filmini baholang',
      addedOn: 'Qo\'shilgan sana',
      watchedOn: 'Ko\'rilgan sana',
      noPoster: 'Poster yo\'q',
    },
    admin: {
      title: 'Admin Paneli',
      subtitle: 'Foydalanuvchilarni, rollarni boshqaring va watchlist ilovangizdagi faollikni kuzatib boring.',
      backToDashboard: 'Boshqaruv paneliga qaytish',
      totalUsers: 'Jami Foydalanuvchilar',
      adminUsers: 'Admin Foydalanuvchilar',
      regularUsers: 'Oddiy Foydalanuvchilar',
      users: 'Foydalanuvchilar',
      activityLogs: 'Faollik Jurnali',
      allUsers: 'Barcha Foydalanuvchilar',
      searchByName: 'Ism bo\'yicha qidirish...',
      allRoles: 'Barcha Rollar',
      name: 'Ism',
      role: 'Rol',
      userId: 'Foydalanuvchi ID',
      lastLogin: 'Oxirgi Kirish',
      actions: 'Harakatlar',
      promote: 'Ko\'tarish',
      demote: 'Pastlashtirish',
      disable: 'O\'chirish',
      noUsers: 'Foydalanuvchilar topilmadi',
      noUsersMessage: 'Hali foydalanuvchilar yo\'q — foydalanuvchilar ro\'yxatdan o\'tgandan keyin bu yerda paydo bo\'ladi.',
      noActivity: 'Hali faollik yo\'q',
      noActivityMessage: 'Foydalanuvchi harakatlari bu yerda paydo bo\'ladi.',
    },
    auth: {
      loginTitle: 'Kirish',
      signupTitle: 'Ro\'yxatdan O\'tish',
      name: 'Ism',
      password: 'Parol',
      confirmPassword: 'Parolni Tasdiqlash',
      switchToSignup: 'Hisobingiz yo\'qmi? Ro\'yxatdan o\'ting',
      switchToLogin: 'Allaqachon hisobingiz bormi? Kirish',
      loginSuccess: 'Muvaffaqiyatli kirildi!',
      signupSuccess: 'Muvaffaqiyatli ro\'yxatdan o\'tildi!',
    },
  },
  ko: {
    common: {
      add: '추가',
      delete: '삭제',
      edit: '편집',
      save: '저장',
      cancel: '취소',
      search: '검색',
      filter: '필터',
      login: '로그인',
      logout: '로그아웃',
      signup: '회원가입',
      welcome: '환영합니다',
      back: '뒤로',
      refresh: '새로고침',
    },
    home: {
      title: '추적하세요',
      subtitle: '본 영화',
      eyebrow: '영화 시청 목록 · 개인 대시보드',
      description: '보고 싶은 영화를 잊지 마세요. 시청 목록을 정리하고, 본 영화를 평가하며, 다음 좋아할 영화를 발견하세요.',
      addNewMovie: '새 영화 추가',
      watchedMovies: '본 영화',
      viewAllMovies: '모든 영화 보기',
      getStarted: '시작하기',
      signIn: '로그인',
      recommendedMovies: '추천 영화',
      recommendedDescription: '커뮤니티에서 가장 높은 평점을 받은 영화를 발견하세요. 사용자들이 시청하고 좋아한 최고의 선택입니다.',
      noRecommendedMovies: '아직 높은 평점의 영화가 없습니다. 첫 번째로 영화에 4점 이상을 평가해보세요!',
      statsMoviesSaved: '개 영화 저장됨',
      statsWatched: '개 시청함',
      statsLastUpdated: '마지막 업데이트',
    },
    dashboard: {
      title: '시청 목록 추적',
      myWatchlist: '내 시청 목록',
      watchedMovies: '본 영화',
      moviesToWatch: '볼 영화',
      allMovies: '모든 영화',
      addMovie: '영화 추가',
      searchPlaceholder: '영화 검색...',
      filterAll: '전체',
      filterWatched: '본 영화',
      filterUnwatched: '볼 영화',
      statsTotal: '추가된 영화',
      statsWatched: '본 영화',
      statsToWatch: '볼 영화',
      statsLastUpdated: '마지막 업데이트',
    },
    movieCard: {
      watched: '시청함',
      unwatch: '시청 취소',
      rateMovie: '이 영화 평가',
      addedOn: '추가된 날짜',
      watchedOn: '시청한 날짜',
      noPoster: '포스터 없음',
    },
    admin: {
      title: '관리자 패널',
      subtitle: '사용자와 역할을 관리하고 시청 목록 앱 전체의 활동을 모니터링하세요.',
      backToDashboard: '대시보드로 돌아가기',
      totalUsers: '전체 사용자',
      adminUsers: '관리자 사용자',
      regularUsers: '일반 사용자',
      users: '사용자',
      activityLogs: '활동 로그',
      allUsers: '모든 사용자',
      searchByName: '이름으로 검색...',
      allRoles: '모든 역할',
      name: '이름',
      role: '역할',
      userId: '사용자 ID',
      lastLogin: '마지막 로그인',
      actions: '작업',
      promote: '승격',
      demote: '강등',
      disable: '비활성화',
      noUsers: '사용자를 찾을 수 없습니다',
      noUsersMessage: '아직 사용자가 없습니다 — 사용자가 가입하면 여기에 표시됩니다.',
      noActivity: '아직 활동이 없습니다',
      noActivityMessage: '사용자 작업이 여기에 표시됩니다.',
    },
    auth: {
      loginTitle: '로그인',
      signupTitle: '회원가입',
      name: '이름',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      switchToSignup: '계정이 없으신가요? 회원가입',
      switchToLogin: '이미 계정이 있으신가요? 로그인',
      loginSuccess: '로그인 성공!',
      signupSuccess: '회원가입 성공!',
    },
  },
}

export default translations


