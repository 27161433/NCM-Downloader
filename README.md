# 網易雲音樂下載器

這是一個使用 Next.js 開發的網頁應用程式，用於搜尋網易雲音樂、查看歌曲詳細資訊以及下載音樂檔案（支援 MP3 和 FLAC 格式）。

## ✨ 功能特色

*   🎵 搜尋網易雲音樂歌曲
*   📄 查看歌曲詳細資訊（包含封面、ID3 標籤等）
*   💾 下載 MP3 和 FLAC 格式的音樂檔案
*   ⚙️ 可能包含設定管理功能 (透過 `config.json`)
*   🔌 可能使用 WebSocket 進行即時更新

## 🚀 技術棧

*   **框架:** [Next.js](https://nextjs.org/) (React)
*   **語言:** [TypeScript](https://www.typescriptlang.org/)
*   **樣式:** [Tailwind CSS](https://tailwindcss.com/)
*   **API 互動:** [Axios](https://axios-http.com/), [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
*   **音樂標籤:** [node-id3](https://github.com/Zazama/node-id3)
*   **圖像處理:** [Sharp](https://sharp.pixelplumbing.com/)
*   **WebSocket:** [ws](https://github.com/websockets/ws)
*   **FLAC 處理:** 內建 `flac.exe` 和 `metaflac.exe` (位於 `bin/` 目錄)

## 🛠️ 開始使用

1.  **安裝依賴:**
    ```bash
    npm install
    # 或
    # yarn install
    # 或
    # pnpm install
    ```

2.  **執行開發伺服器:**
    ```bash
    npm run dev
    # 或
    # yarn dev
    # 或
    # pnpm dev
    ```

3.  在瀏覽器中開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

## 📁 專案結構 (簡介)

*   `src/app/`: Next.js App Router 相關頁面和路由。
    *   `api/`: 後端 API 路由。
        *   `[filename]/route.ts`: 處理檔案下載。
        *   `getConfigId/route.ts`, `updateConfigId/route.ts`: 設定相關 API。
        *   `ws/route.ts`: WebSocket 路由。
*   `src/Components/`: React UI 元件。
*   `src/types/`: TypeScript 型別定義。
*   `public/`: 靜態資源檔案。
*   `bin/`: 包含 FLAC 處理工具。
*   `download/`: 預設的音樂下載目錄。
*   `config.json`: 專案設定檔。
*   `package.json`: 專案依賴和腳本。
*   `next.config.ts`: Next.js 設定檔。
*   `tsconfig.json`: TypeScript 設定檔。

---

_此 README.md 由 AI 產生，基於專案結構和依賴推斷。_
