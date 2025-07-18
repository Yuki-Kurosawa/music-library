// 所有页面可视化字符串集中管理

// 公共字符串
const commonStrings = {
  previous: "前へ",
  next: "次へ",
  page: "ページ",
  untitled: "",
  retry: "再試行",
  noSongs: "曲が見つかりません",
  failedToLoad: "曲の読み込みに失敗しました。もう一度お試しください。",
  searchTypes: [
    { label: "タイトル", value: "title" },
    { label: "アーティスト", value: "artist" },
  ],
  searchButton: "検索",
  allCategories: "すべて",
};

export const Strings = {
  // (tabs)/index.tsx
  home: {
    pageTitle: "ライブラリ",
    ...commonStrings,
  },
  adminLayout: {
    editSong: "編集",
    createSong: "追加",	
    search: "検索",
  },
  // (tabs)/_layout.tsx
  tab: {
    home: "ホーム",
    admin: "管理",
    about: "概要",
  },
  // (tabs)/admin/edit.tsx & create.tsx
  songForm: {
    title: "タイトル",
    titleHiragana: "タイトル (ひらがな)",
    titleKatakana: "タイトル (カタカナ)",
    titleRomaji: "タイトル (ローマ字)",
    artist: "アーティスト",
	description: "コメント",
    category: "カテゴリ",
    fromPlatform: "プラットフォーム",
    fromUrl: "ソースURL",
    imageUrl: "イメージURL",
    selectPlatform: "-- プラットフォームを選択 --",
    save: "セーブ",
    saving: "セーブ中...",
    delete: "削除",
    deleting: "削除中...",
    create: "追加",
    creating: "追加中...",
    loading: "読み込み中...",
    notFound: "曲が見つかりません。",
    success: "成功",
    songSaved: "曲の詳細が保存されました。",
    songDeleted: "曲が正常に削除されました。",
    songCreated: "曲が正常に追加されました。",
    artistNeeded: "アーティストが指定されていません",
    error: "エラー",
    failedToSave: "保存に失敗しました。",
    failedToDelete: "削除に失敗しました。",
    failedToCreate: "追加に失敗しました。",
    failedToLoad: "カテゴリとプラットフォームの読み込みに失敗しました。",
	deleteConfirmTitle: "",
    deleteConfirmMessage: (title: string) => `"${title}" を削除してもよろしいですか？この操作は取り消せません。`,
    cancel: "いいえ",
    ok: "はい",
    noPlatformOrTitle: "検索する前にプラットフォームを選択し、タイトルを入力してください。",
  },
  searchPage: {
    title: "検索結果",
    platform: "プラットフォーム",
    noResults: "結果が見つかりません",
    ...commonStrings,
  },
  api: {
    error: "エラー",
    failedToLoad: "データの読み込みに失敗しました。もう一度お試しください。",
    authKeyRequired: "認証キーが必要です。",
    authKey: "認証キー",
    authKeyMessage: "続行するには認証キーを入力してください。",
  },
  // (tabs)/admin/index.tsx
  admin: {
    pageTitle: "管理",
    createNewSong: "追加",
    ...commonStrings,
  },
  // (tabs)/admin/_layout.tsx
};