# ADR-002: オンラインマルチプレイヤーの同期方式

## ステータス
採用

## 日付
（実装時期不明・コードから推定）

## 背景
オンライン4人対戦において、複数クライアントのゲーム状態を同期する必要がある。
Supabaseを使用しており、リアルタイム同期とデータ整合性を両立する方法を選択する必要があった。

## 検討した選択肢
- **A: サーバーサイドでターン処理**
  - Edge FunctionやAPIルートで手の検証・状態更新を行う
  - 信頼性は高いが実装コストが大きい

- **B: 楽観的ロック（turn_number）**
  - クライアントが `turn_number` を条件に `.update().eq('turn_number', current)` で更新
  - ゼロ行更新＝他プレイヤーが先に手を打ったと判定
  - Supabase Realtimeで全クライアントに変更を配信

## 決定
**B（楽観的ロック）を採用。**

Supabaseにはネイティブのトランザクションが使いにくく、
Edge Functionを使わずにクライアント側で完結させる方がシンプル。
`turn_number` によるロックで競合を検出し、`.select().single()` でゼロ行更新を判別する。

## 影響
- `useOnlineGame.ts`: 楽観的ロック実装
- `useRoom.ts`: Realtime購読・Presence管理
- `types/online.ts`: `RoomRow` に `turn_number` フィールド
- Supabaseスキーマ: `rooms` テーブルに `turn_number` カラム必須
