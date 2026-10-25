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
    description: string
    addNewMovie: string
    watchedMovies: string
    viewAllMovies: string
    getStarted: string
    signIn: string
    recommendedMovies: string
    recommendedDescription: string
    noRecommendedMovies: string
    heroTitleSeen: string
    heroTitleSoon: string
    heroDescription: string
    heroCta: string
    heroCtaSignedIn: string
    heroHowItWorks: string
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
  
  // Add movie (TMDB auto-fill)
  addMovie: {
    searchPlaceholder: string
    searching: string
    noResults: string
    searchError: string
    loadingDetails: string
    detailsError: string
    clearSelection: string
    directedBy: string
    runtime: string
    runtimeMinutes: string
    posterFromTmdb: string
    alreadyWatched: string
    yourRating: string
    duplicate: string
    tmdbAttribution: string
  }
  
  // Landing page ("The Program")
  landing: {
    reel: string
    reelNowShowing: string
    reelSeenSoon: string
    reelHowItWorks: string
    reelLanguages: string
    nowShowingTitle: string
    nowShowingCaption: string
    seenSoonTitle: string
    seenSoonCaption: string
    ticketSeen: string
    ticketSoon: string
    admitOne: string
    seenNote: string
    whereToWatch: string
    whereToWatchValue: string
    howTitle: string
    howCaption: string
    creditSearch: string
    creditSearchValue: string
    creditMark: string
    creditMarkValue: string
    creditRate: string
    creditRateValue: string
    creditDiscover: string
    creditDiscoverValue: string
    languagesTitle: string
    languagesCaption: string
    theEnd: string
    endCaption: string
    footerTmdb: string
    footerGithub: string
  }
  
  // Dashboard ("Your Shelf")
  shelf: {
    greetingMorning: string
    greetingAfternoon: string
    greetingEvening: string
    statsSeen: string
    statsSoon: string
    statsAvg: string
    tabSeen: string
    tabSoon: string
    showAll: string
    filterGenre: string
    allGenres: string
    filterYear: string
    allYears: string
    sortLabel: string
    sortRecent: string
    sortRating: string
    sortTitle: string
    sortYear: string
    upNext: string
    upNextCaption: string
    markSeen: string
    markSoon: string
    stampSeen: string
    stampSoon: string
    emptyTab: string
    noMatches: string
    clearFilters: string
    profile: string
    admin: string
    memberSince: string
    accountMenu: string
    rateTitle: string
    rateCaption: string
    rateSkip: string
    loading: string
    signInPrompt: string
    goHome: string
    close: string
  }
  
  // All movies page
  library: {
    navShelf: string
    navAllMovies: string
    title: string
    caption: string
    statsFilms: string
    addedBy: string
    filterRating: string
    anyRating: string
    ratingAtLeast: string
    emptyLibrary: string
    loading: string
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
    statsUsers: string
    statsAdmins: string
    statsRegular: string
    roleAdmin: string
    roleUser: string
    comingSoon: string
    accessDenied: string
    accessDeniedMessage: string
    loadingUsers: string
    loadingActivity: string
    fetchUsersError: string
    noUsersFiltered: string
    aMovie: string
    actAdd: string
    actUpdate: string
    actDelete: string
    actWatch: string
    actUnwatch: string
    actRate: string
    actLogin: string
    actSignup: string
    actAdmin: string
    actOther: string
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
      description: 'Never forget a movie you want to watch. Organize your watchlist, rate what you\'ve seen, and discover your next favorite film.',
      addNewMovie: 'Add New Movie',
      watchedMovies: 'Watched Movies',
      viewAllMovies: 'View All Movies',
      getStarted: 'Get Started',
      signIn: 'Sign In',
      recommendedMovies: 'Recommended Movies',
      recommendedDescription: 'Discover the highest-rated movies from our community. These are the top picks that users have watched and loved.',
      noRecommendedMovies: 'No highly rated movies yet. Be the first to rate a movie 4+ stars!',
      heroTitleSeen: "Movies you've seen.",
      heroTitleSoon: "Movies you'll see.",
      heroDescription: "One list for everything you've watched and everything you're saving for later.",
      heroCta: 'Start your watchlist',
      heroCtaSignedIn: 'Open your watchlist',
      heroHowItWorks: 'See how it works',
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
    addMovie: {
      searchPlaceholder: 'Search TMDB or type a title',
      searching: 'Searching…',
      noResults: 'No results',
      searchError: 'Movie search is unavailable right now. You can still type the details yourself.',
      loadingDetails: 'Loading movie details…',
      detailsError: "Couldn't load full details from TMDB.",
      clearSelection: 'Clear selection',
      directedBy: 'Directed by',
      runtime: '{h}h {m}m',
      runtimeMinutes: '{m}m',
      posterFromTmdb: 'The TMDB poster will be used unless you upload your own.',
      alreadyWatched: "I've already watched this",
      yourRating: 'Your rating',
      duplicate: 'This movie is already in your list.',
      tmdbAttribution: 'Results from TMDB',
    },
    landing: {
      reel: 'Reel',
      reelNowShowing: 'Now showing',
      reelSeenSoon: 'Seen / Soon',
      reelHowItWorks: 'How it works',
      reelLanguages: 'In three languages',
      nowShowingTitle: 'Now Showing',
      nowShowingCaption: 'rated 4★+ by our viewers',
      seenSoonTitle: 'Every film gets a ticket',
      seenSoonCaption: "Keep the stub once you've seen it. Hold on to the ticket until you do.",
      ticketSeen: 'Seen',
      ticketSoon: 'Soon',
      admitOne: 'Admit one',
      seenNote: 'Watched it twice. Still thinking about the staircase scene.',
      whereToWatch: 'Where to watch',
      whereToWatchValue: 'Streaming, or rent online',
      howTitle: 'Starring you',
      howCaption: 'in order of appearance',
      creditSearch: 'Search',
      creditSearchValue: 'any movie, auto-filled from TMDB',
      creditMark: 'Mark',
      creditMarkValue: 'Seen or Soon',
      creditRate: 'Rate',
      creditRateValue: 'stars and personal notes',
      creditDiscover: 'Discover',
      creditDiscoverValue: 'what others loved',
      languagesTitle: 'Subtitles included',
      languagesCaption: "Your watchlist speaks English, O'zbekcha and 한국어.",
      theEnd: 'The End',
      endCaption: 'Thanks for watching.',
      footerTmdb: 'This product uses the TMDB API but is not endorsed or certified by TMDB.',
      footerGithub: 'Source on GitHub',
    },
    shelf: {
      greetingMorning: 'Good morning, {name}',
      greetingAfternoon: 'Good afternoon, {name}',
      greetingEvening: 'Good evening, {name}',
      statsSeen: '{n} seen',
      statsSoon: '{n} soon',
      statsAvg: 'avg rating {x}★',
      tabSeen: 'Seen',
      tabSoon: 'Soon',
      showAll: 'Show all',
      filterGenre: 'Genre',
      allGenres: 'All genres',
      filterYear: 'Year',
      allYears: 'All years',
      sortLabel: 'Sort',
      sortRecent: 'Recently added',
      sortRating: 'Rating',
      sortTitle: 'Title',
      sortYear: 'Year',
      upNext: 'Up next',
      upNextCaption: 'the first four on your Soon list',
      markSeen: 'Mark as seen',
      markSoon: 'Move to Soon',
      stampSeen: 'Seen',
      stampSoon: 'Soon',
      emptyTab: 'Nothing here yet',
      noMatches: 'No movies match these filters',
      clearFilters: 'Clear filters',
      profile: 'Profile',
      admin: 'Admin',
      memberSince: 'Member since {date}',
      accountMenu: 'Account menu',
      rateTitle: 'How was it?',
      rateCaption: 'Rate it now, or skip and rate later.',
      rateSkip: 'Skip rating',
      loading: 'Loading your shelf…',
      signInPrompt: 'Log in to see your shelf.',
      goHome: 'Go to home page',
      close: 'Close',
    },
    library: {
      navShelf: 'My shelf',
      navAllMovies: 'All movies',
      title: 'All movies',
      caption: 'Every film on every shelf',
      statsFilms: '{n} films',
      addedBy: 'Added by {name}',
      filterRating: 'Rating',
      anyRating: 'Any rating',
      ratingAtLeast: '{n}★ and up',
      emptyLibrary: 'No movies on any shelf yet',
      loading: 'Loading movies…',
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
      statsUsers: '{n} users',
      statsAdmins: '{n} admins',
      statsRegular: '{n} regular',
      roleAdmin: 'Admin',
      roleUser: 'User',
      comingSoon: 'This action is coming soon.',
      accessDenied: 'Admins only',
      accessDeniedMessage: 'You need admin privileges to see this page.',
      loadingUsers: 'Loading users…',
      loadingActivity: 'Loading activity…',
      fetchUsersError: 'Could not load users.',
      noUsersFiltered: 'Try a different name or role.',
      aMovie: 'a movie',
      actAdd: '{user} added “{title}”',
      actUpdate: '{user} updated “{title}”',
      actDelete: '{user} deleted “{title}”',
      actWatch: '{user} marked “{title}” as seen',
      actUnwatch: '{user} moved “{title}” back to Soon',
      actRate: '{user} rated “{title}”',
      actLogin: '{user} logged in',
      actSignup: '{user} signed up',
      actAdmin: '{user} performed an admin action',
      actOther: '{user}: {action}',
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
      description: 'Ko\'rishni xohlagan filmlarni unutmang. Ro\'yxatingizni tartibga soling, ko\'rgan filmlaringizni baholang va keyingi sevimli filmingizni toping.',
      addNewMovie: 'Yangi Film Qo\'shish',
      watchedMovies: 'Ko\'rilgan Filmlar',
      viewAllMovies: 'Barcha Filmlarni Ko\'rish',
      getStarted: 'Boshlash',
      signIn: 'Kirish',
      recommendedMovies: 'Tavsiya Etilgan Filmlar',
      recommendedDescription: 'Jamiyatimizning eng yuqori baholangan filmlarini kashf eting. Bu foydalanuvchilar tomosha qilgan va yoqtirgan eng yaxshi filmlar.',
      noRecommendedMovies: 'Hali yuqori baholangan filmlar yo\'q. Birinchi bo\'lib filmni 4+ yulduz bilan baholang!',
      heroTitleSeen: 'Ko\'rgan filmlaringiz.',
      heroTitleSoon: 'Ko\'radigan filmlaringiz.',
      heroDescription: 'Ko\'rgan va keyinroq ko\'rmoqchi bo\'lgan barcha filmlaringiz uchun bitta ro\'yxat.',
      heroCta: 'Ro\'yxatingizni boshlang',
      heroCtaSignedIn: 'Ro\'yxatingizni oching',
      heroHowItWorks: 'Qanday ishlashini ko\'ring',
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
    addMovie: {
      searchPlaceholder: "TMDB'dan qidiring yoki nomini yozing",
      searching: 'Qidirilmoqda…',
      noResults: 'Hech narsa topilmadi',
      searchError: "Film qidiruvi hozir ishlamayapti. Ma'lumotlarni o'zingiz kiritishingiz mumkin.",
      loadingDetails: "Film ma'lumotlari yuklanmoqda…",
      detailsError: "TMDB'dan to'liq ma'lumot yuklab bo'lmadi.",
      clearSelection: 'Tanlovni bekor qilish',
      directedBy: 'Rejissyor',
      runtime: '{h} soat {m} daq.',
      runtimeMinutes: '{m} daq.',
      posterFromTmdb: "O'zingiz rasm yuklamasangiz, TMDB posteri ishlatiladi.",
      alreadyWatched: "Men buni allaqachon ko'rganman",
      yourRating: 'Sizning bahoyingiz',
      duplicate: "Bu film allaqachon ro'yxatingizda bor.",
      tmdbAttribution: "Natijalar TMDB'dan",
    },
    landing: {
      reel: 'Lenta',
      reelNowShowing: 'Hozir ekranda',
      reelSeenSoon: "Ko'rildi / Tez orada",
      reelHowItWorks: 'Qanday ishlaydi',
      reelLanguages: 'Uch tilda',
      nowShowingTitle: 'Hozir ekranda',
      nowShowingCaption: 'tomoshabinlarimiz 4★+ baholagan',
      seenSoonTitle: 'Har bir filmga chipta',
      seenSoonCaption: "Ko'rgan filmingiz chiptasining qoldig'ini saqlang, ko'rmaganingiz chiptasini esa asrab qo'ying.",
      ticketSeen: "Ko'rildi",
      ticketSoon: 'Tez orada',
      admitOne: 'Bir kishilik',
      seenNote: "Ikki marta ko'rdim. Zinapoya sahnasi hali ham yodimda.",
      whereToWatch: "Qayerda ko'rish mumkin",
      whereToWatchValue: 'Striming yoki onlayn ijara',
      howTitle: 'Bosh rolda — siz',
      howCaption: "paydo bo'lish tartibida",
      creditSearch: 'Qidiring',
      creditSearchValue: "istalgan film, TMDB orqali avtomatik to'ldiriladi",
      creditMark: 'Belgilang',
      creditMarkValue: "Ko'rildi yoki Tez orada",
      creditRate: 'Baholang',
      creditRateValue: 'yulduzlar va shaxsiy izohlar',
      creditDiscover: 'Kashf eting',
      creditDiscoverValue: 'boshqalar nimani yoqtirgani',
      languagesTitle: 'Subtitrlar bilan',
      languagesCaption: "Ro'yxatingiz English, O'zbekcha va 한국어 tillarida gapiradi.",
      theEnd: 'Tamom',
      endCaption: 'Tomosha uchun rahmat.',
      footerTmdb: "Ushbu mahsulot TMDB API'dan foydalanadi, lekin TMDB tomonidan tasdiqlanmagan yoki sertifikatlanmagan.",
      footerGithub: "GitHub'dagi manba kodi",
    },
    shelf: {
      greetingMorning: 'Xayrli tong, {name}',
      greetingAfternoon: 'Xayrli kun, {name}',
      greetingEvening: 'Xayrli kech, {name}',
      statsSeen: "{n} ta ko'rilgan",
      statsSoon: '{n} ta navbatda',
      statsAvg: "o'rtacha baho {x}★",
      tabSeen: "Ko'rildi",
      tabSoon: 'Tez orada',
      showAll: "Hammasini ko'rsatish",
      filterGenre: 'Janr',
      allGenres: 'Barcha janrlar',
      filterYear: 'Yil',
      allYears: 'Barcha yillar',
      sortLabel: 'Saralash',
      sortRecent: "Yaqinda qo'shilgan",
      sortRating: 'Baho',
      sortTitle: 'Nomi',
      sortYear: 'Yil',
      upNext: 'Navbatdagi',
      upNextCaption: "Tez orada ro'yxatingizdagi dastlabki to'rttasi",
      markSeen: "Ko'rildi deb belgilash",
      markSoon: "Tez oradaga o'tkazish",
      stampSeen: "Ko'rildi",
      stampSoon: 'Tez orada',
      emptyTab: "Hozircha bu yerda hech narsa yo'q",
      noMatches: 'Bu filtrlarga mos film topilmadi',
      clearFilters: 'Filtrlarni tozalash',
      profile: 'Profil',
      admin: 'Admin',
      memberSince: "{date} dan beri a'zo",
      accountMenu: 'Hisob menyusi',
      rateTitle: 'Qanday ekan?',
      rateCaption: "Hozir baholang yoki keyinroq baholash uchun o'tkazib yuboring.",
      rateSkip: "Baholamasdan o'tish",
      loading: 'Javoningiz yuklanmoqda…',
      signInPrompt: "Javoningizni ko'rish uchun tizimga kiring.",
      goHome: "Bosh sahifaga o'tish",
      close: 'Yopish',
    },
    library: {
      navShelf: 'Mening javonim',
      navAllMovies: 'Barcha filmlar',
      title: 'Barcha filmlar',
      caption: 'Har bir javondagi har bir film',
      statsFilms: '{n} ta film',
      addedBy: "{name} qo'shgan",
      filterRating: 'Baho',
      anyRating: 'Istalgan baho',
      ratingAtLeast: '{n}★ va undan yuqori',
      emptyLibrary: "Hali hech bir javonda film yo'q",
      loading: 'Filmlar yuklanmoqda…',
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
      statsUsers: '{n} ta foydalanuvchi',
      statsAdmins: '{n} ta admin',
      statsRegular: '{n} ta oddiy',
      roleAdmin: 'Admin',
      roleUser: 'Foydalanuvchi',
      comingSoon: "Bu amal tez orada qo'shiladi.",
      accessDenied: 'Faqat adminlar uchun',
      accessDeniedMessage: "Bu sahifani ko'rish uchun admin huquqlari kerak.",
      loadingUsers: 'Foydalanuvchilar yuklanmoqda…',
      loadingActivity: 'Faollik yuklanmoqda…',
      fetchUsersError: "Foydalanuvchilarni yuklab bo'lmadi.",
      noUsersFiltered: "Boshqa ism yoki rolni sinab ko'ring.",
      aMovie: 'film',
      actAdd: "{user} “{title}” filmini qo'shdi",
      actUpdate: '{user} “{title}” filmini tahrirladi',
      actDelete: "{user} “{title}” filmini o'chirdi",
      actWatch: "{user} “{title}” filmini ko'rildi deb belgiladi",
      actUnwatch: '{user} “{title}” filmini Tez oradaga qaytardi',
      actRate: '{user} “{title}” filmini baholadi',
      actLogin: '{user} tizimga kirdi',
      actSignup: "{user} ro'yxatdan o'tdi",
      actAdmin: '{user} admin amalini bajardi',
      actOther: '{user}: {action}',
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
      description: '보고 싶은 영화를 잊지 마세요. 시청 목록을 정리하고, 본 영화를 평가하며, 다음 좋아할 영화를 발견하세요.',
      addNewMovie: '새 영화 추가',
      watchedMovies: '본 영화',
      viewAllMovies: '모든 영화 보기',
      getStarted: '시작하기',
      signIn: '로그인',
      recommendedMovies: '추천 영화',
      recommendedDescription: '커뮤니티에서 가장 높은 평점을 받은 영화를 발견하세요. 사용자들이 시청하고 좋아한 최고의 선택입니다.',
      noRecommendedMovies: '아직 높은 평점의 영화가 없습니다. 첫 번째로 영화에 4점 이상을 평가해보세요!',
      heroTitleSeen: '이미 본 영화.',
      heroTitleSoon: '앞으로 볼 영화.',
      heroDescription: '본 영화와 나중에 볼 영화를 한 곳에 모아두세요.',
      heroCta: '시청 목록 만들기',
      heroCtaSignedIn: '내 시청 목록 열기',
      heroHowItWorks: '이용 방법 보기',
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
    addMovie: {
      searchPlaceholder: 'TMDB에서 검색하거나 제목을 입력하세요',
      searching: '검색 중…',
      noResults: '검색 결과가 없습니다',
      searchError: '지금은 영화 검색을 사용할 수 없습니다. 정보를 직접 입력할 수 있습니다.',
      loadingDetails: '영화 정보를 불러오는 중…',
      detailsError: 'TMDB에서 전체 정보를 불러오지 못했습니다.',
      clearSelection: '선택 해제',
      directedBy: '감독',
      runtime: '{h}시간 {m}분',
      runtimeMinutes: '{m}분',
      posterFromTmdb: '직접 업로드하지 않으면 TMDB 포스터가 사용됩니다.',
      alreadyWatched: '이미 본 영화예요',
      yourRating: '내 평점',
      duplicate: '이미 목록에 있는 영화입니다.',
      tmdbAttribution: 'TMDB 제공 결과',
    },
    landing: {
      reel: '릴',
      reelNowShowing: '상영 중',
      reelSeenSoon: '본 영화 / 볼 영화',
      reelHowItWorks: '이용 방법',
      reelLanguages: '세 가지 언어로',
      nowShowingTitle: '상영 중',
      nowShowingCaption: '관객 평점 4★ 이상',
      seenSoonTitle: '영화마다 티켓 한 장',
      seenSoonCaption: '본 영화는 반쪽을 간직하고, 볼 영화는 티켓을 아껴두세요.',
      ticketSeen: '봤어요',
      ticketSoon: '볼 예정',
      admitOne: '1인 입장',
      seenNote: '두 번 봤다. 계단 장면이 아직도 생각난다.',
      whereToWatch: '시청 가능한 곳',
      whereToWatchValue: '스트리밍 또는 온라인 대여',
      howTitle: '주연: 당신',
      howCaption: '등장 순서대로',
      creditSearch: '검색',
      creditSearchValue: '어떤 영화든, TMDB에서 자동 입력',
      creditMark: '표시',
      creditMarkValue: '봤어요 또는 볼 예정',
      creditRate: '평가',
      creditRateValue: '별점과 나만의 메모',
      creditDiscover: '발견',
      creditDiscoverValue: '다른 사람들이 사랑한 영화',
      languagesTitle: '자막 포함',
      languagesCaption: "내 시청 목록은 English, O'zbekcha, 한국어로 말합니다.",
      theEnd: '끝',
      endCaption: '관람해 주셔서 감사합니다.',
      footerTmdb: '이 제품은 TMDB API를 사용하지만 TMDB의 보증이나 인증을 받지 않았습니다.',
      footerGithub: 'GitHub 소스 코드',
    },
    shelf: {
      greetingMorning: '좋은 아침이에요, {name}님',
      greetingAfternoon: '좋은 오후예요, {name}님',
      greetingEvening: '좋은 저녁이에요, {name}님',
      statsSeen: '본 영화 {n}편',
      statsSoon: '볼 영화 {n}편',
      statsAvg: '평균 평점 {x}★',
      tabSeen: '봤어요',
      tabSoon: '볼 예정',
      showAll: '전체 보기',
      filterGenre: '장르',
      allGenres: '모든 장르',
      filterYear: '연도',
      allYears: '모든 연도',
      sortLabel: '정렬',
      sortRecent: '최근 추가순',
      sortRating: '평점순',
      sortTitle: '제목순',
      sortYear: '연도순',
      upNext: '다음 상영',
      upNextCaption: '볼 예정 목록의 첫 네 편',
      markSeen: '봤어요로 표시',
      markSoon: '볼 예정으로 이동',
      stampSeen: '봤어요',
      stampSoon: '볼 예정',
      emptyTab: '아직 아무것도 없어요',
      noMatches: '조건에 맞는 영화가 없어요',
      clearFilters: '필터 초기화',
      profile: '프로필',
      admin: '관리자',
      memberSince: '{date}부터 회원',
      accountMenu: '계정 메뉴',
      rateTitle: '어땠나요?',
      rateCaption: '지금 평가하거나 건너뛰고 나중에 평가하세요.',
      rateSkip: '평가 건너뛰기',
      loading: '내 서재를 불러오는 중…',
      signInPrompt: '내 서재를 보려면 로그인하세요.',
      goHome: '홈으로 가기',
      close: '닫기',
    },
    library: {
      navShelf: '내 서재',
      navAllMovies: '모든 영화',
      title: '모든 영화',
      caption: '모든 서재의 모든 영화',
      statsFilms: '영화 {n}편',
      addedBy: '{name}님이 추가',
      filterRating: '평점',
      anyRating: '모든 평점',
      ratingAtLeast: '{n}★ 이상',
      emptyLibrary: '아직 어떤 서재에도 영화가 없어요',
      loading: '영화를 불러오는 중…',
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
      statsUsers: '사용자 {n}명',
      statsAdmins: '관리자 {n}명',
      statsRegular: '일반 {n}명',
      roleAdmin: '관리자',
      roleUser: '사용자',
      comingSoon: '이 기능은 곧 제공됩니다.',
      accessDenied: '관리자 전용',
      accessDeniedMessage: '이 페이지를 보려면 관리자 권한이 필요합니다.',
      loadingUsers: '사용자를 불러오는 중…',
      loadingActivity: '활동을 불러오는 중…',
      fetchUsersError: '사용자를 불러오지 못했습니다.',
      noUsersFiltered: '다른 이름이나 역할로 검색해 보세요.',
      aMovie: '영화',
      actAdd: '{user}님이 “{title}”을(를) 추가했습니다',
      actUpdate: '{user}님이 “{title}”을(를) 수정했습니다',
      actDelete: '{user}님이 “{title}”을(를) 삭제했습니다',
      actWatch: '{user}님이 “{title}”을(를) 봤어요로 표시했습니다',
      actUnwatch: '{user}님이 “{title}”을(를) 볼 예정으로 옮겼습니다',
      actRate: '{user}님이 “{title}”을(를) 평가했습니다',
      actLogin: '{user}님이 로그인했습니다',
      actSignup: '{user}님이 가입했습니다',
      actAdmin: '{user}님이 관리자 작업을 수행했습니다',
      actOther: '{user}: {action}',
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



