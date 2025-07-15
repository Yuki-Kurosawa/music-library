// 所有页面可视化字符串集中管理

// 公共字符串
const commonStrings = {
  previous: "Previous",
  next: "Next",
  page: "Page",
  untitled: "Untitled",
  retry: "Retry",
  noSongs: "No songs found",
  failedToLoad: "Failed to load songs. Please try again.",
  searchTypes: [
    { label: "标题", value: "title" },
    { label: "歌手", value: "artist" },
  ],
  searchPlaceholder: "请输入关键字",
  searchButton: "搜索",
  allCategories: "全部分类",
};

export const Strings = {
  // (tabs)/index.tsx
  home: {
    pageTitle: "Music Library",
    ...commonStrings,
  },
  adminLayout: {
    editSong: "Edit Song",
    createSong: "Create Song",	
    search: "Search",
  },
  // (tabs)/_layout.tsx
  tab: {
    home: "Home",
    admin: "Admin",
    about: "About",
  },
  // (tabs)/admin/edit.tsx & create.tsx
  songForm: {
    title: "Title",
    titleHiragana: "Title (Hiragana)",
    titleKatakana: "Title (Katakana)",
    titleRomaji: "Title (Romaji)",
    artist: "Artist",
    category: "Category",
    fromPlatform: "From Platform (Optional)",
    fromUrl: "From URL",
    imageUrl: "Image URL",
    songTitlePlaceholder: "Song Title",
    titleHiraganaPlaceholder: "Title in Hiragana",
    titleKatakanaPlaceholder: "Title in Katakana",
    titleRomajiPlaceholder: "Title in Romaji",
    artistPlaceholder: "Artist Name",
    sourceUrlPlaceholder: "Source URL",
    imageUrlPlaceholder: "Image URL",
    selectPlatform: "-- Select a Platform --",
    save: "Save",
    saving: "Saving...",
    delete: "Delete Song",
    deleting: "Deleting...",
    create: "Create Song",
    creating: "Creating...",
    loading: "Loading...",
    notFound: "Song not found.",
    success: "Success",
    songSaved: "Song details saved.",
    songDeleted: "Song deleted successfully.",
    songCreated: "Song created successfully.",
    error: "Error",
    failedToSave: "Failed to save song details.",
    failedToDelete: "Failed to delete song.",
    failedToCreate: "Failed to create song.",
    failedToLoad: "Failed to load categories and platforms.",
    deleteConfirmTitle: "Delete Song",
    deleteConfirmMessage: (title: string) => `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    cancel: "Cancel",
    ok: "OK",
    noPlatformOrTitle: "Please select a platform and enter a title before searching.",
  },
  searchPage: {
    title: "Search Result",
    platform: "Platform",
    platformPlaceholder: "Select a platform",
    titlePlaceholder: "Enter title to search",
    ...commonStrings,
  },
  api: {
    error: "Error",
    failedToLoad: "Failed to load data. Please try again.",
    authKeyRequired: "Authentication key required.",
    authKey: "api key",
    authKeyMessage: "Please enter api key to continute.",
  },
  // (tabs)/admin/index.tsx
  admin: {
    pageTitle: "Manage Songs",
    createNewSong: "Create New Song",
    ...commonStrings,
  },
  // (tabs)/admin/_layout.tsx
};