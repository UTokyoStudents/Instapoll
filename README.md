# Instapoll
誰の目にも分かる検証可能透明性を担保した再使用可能な投票システムの検討

## 考え方
安全性が誰の目にも分かる形で担保できる透明性があり，完全オープンソースによって不正不可能にすることで，高額かつ不透明な外部サーヴィスに頼らず投票を自主的に行えるというプランです．

- **ドキュメント付きであらかじめパッケージ化した製品にすることで，開発者が介入する可能性を排除する．**

## 目的
教養学部学生自治会の自治会長選挙を
- オンライン/オフライン併用可能な形で
- 誰の目にも分かる検証可能な不正防止の元で
行うためのシステムの検討です．

## 必要なもの
- 6時間人程度の開発費
- 自治会の Web サーヴァでの PHP 環境（他のオプションもあり）（暗号化されたストレージのみに使用）
- 自治会 GitHub Pages．
- 自治委員に投票用紙を郵送，~~同時に各メールアドレスに同じものを送信［必要？］~~
- Webカメラの監視の元でオフライン集計された用紙をスキャン（スマートフォン可）．これにかかる手間．

## 構成手順
UUIDは重複することがない予測不可能な文字列です．

~~非公開UUIDから一方向性関数で公開UUIDを作成する．~~
非公開UUIDは［投票選択肢数］（白票用を含む）個それぞれの有権者に対して作成し，有権者を一意に定める公開UUIDに対応づける．

### オプション1（公開鍵暗号）
公開鍵ペアを人数分作成，秘密鍵は非公開UUIDで暗号化し，公開鍵はそのまま，ペアで公開UUIDをキーとして保存する．

### オプション2（ハッシュ関数）
非公開UUIDを人数分作成，公開UUIDをキーとして人数分保存する．

### 投票用紙作成
非公開UUIDをURLのサーヴァに送信されない部分（`#` 以降）に含む投票アドレス（仮に `https://todaijichikai.org/poll/#<公開UUID>|<非公開UUID>` とする．）を

- QRコード
- 印字

にして全候補者分をまとめて一枚の紙に各有権者について印刷する．
各候補者部分は切り離し可能．

### 投票実行
人数分の投票用紙を自治委員に郵送する．

自治委員はクラスの各名に投票用紙を配る．配れない時は画像を送る．［要検討］※画像で送ったものを自治委員は誤用（使えない）を防ぐために破棄するものとする．

オフライン投票をする有権者は，投票をしたい候補者の部分を切り取って自治委員に返す．

自治委員は回収された切り取られた投票券をまとめて選管に返す．

### 投票操作
オンラインで行う場合は有権者が，オフラインで行う場合は Web カメラの監視のもと立ち会いの上で開票者が行う．

投票する QR コードをスマートフォンでスキャン，表示されるページに：

- 投票内容
- <kbd>投票実行</kbd> ボタン

ボタンを押すと，ブラウザ側で署名を行い，サーヴァに投げる．

サーヴァは検証し，受け付けると記録し，それ以降の同一公開UUIDによる投票を受け付けない．

## 検討事項
- 白票を投じて投票用紙を消費できる様にする必要
- 投票用紙の各葉及び各部分が視覚的に明示的に区別可能なデザイン
- 各端末でブラウザ内で署名を行い，サーヴァ側での不正を防ぐ．

