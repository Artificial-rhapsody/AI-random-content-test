const fs = require('fs')
const path = require('path')

// ── 配置 ──────────────────────────────────────────────────
const CONTENT_DIR = './Content'        // 内容根目录
const OUTPUT_DIR  = './dist'           // 输出目录
const REPO_RAW_BASE = 'https://github.com/Artificial-rhapsody/AI-random-content-test/tree/main'
// ─────────────────────────────────────────────────────────

/**
 * 判断某个目录是否是一篇"文章目录"
 * 条件：目录下存在 article.md
 */
function isArticleDir(dirPath) {
  return fs.existsSync(path.join(dirPath, 'article.md'))
}

/**
 * 读取单篇文章的元数据
 * @param {string} articlePath  - 文章目录的本地路径
 * @param {string} repoRelPath  - 相对于仓库根目录的路径
 */
function readArticleMeta(articlePath, repoRelPath) {
  // 读摘要
  const abstractFile = path.join(articlePath, 'abstract.txt')
  const abstract = fs.existsSync(abstractFile)
    ? fs.readFileSync(abstractFile, 'utf-8').trim()
    : ''

  // 封面：找第一个叫 cover 的图片（支持 jpg/jpeg/png/webp）
  const coverExts = ['.jpg', '.jpeg', '.png', '.webp']
  let coverUrl = null
  for (const ext of coverExts) {
    if (fs.existsSync(path.join(articlePath, `cover${ext}`))) {
      coverUrl = `${REPO_RAW_BASE}/${repoRelPath}/cover${ext}`
      break
    }
  }

  return {
    abstract,
    coverUrl,
    articlePath: `${repoRelPath}/article.md`,
  }
}

/**
 * 解析一个板块目录
 * 结构：
 *   建筑学原理/
 *     头文章/
 *       abstract.txt  article.md  cover.jpg
 *     副文章/
 *       副文章1/
 *         abstract.txt  article.md  cover.jpg
 */
function parseTopic(topicPath, topicName) {
  const repoRelTopicPath = path.relative('.', topicPath).replace(/\\/g, '/')

  // 头文章：在板块根目录下的 头文章/ 子目录里
  const mainArticlePath = path.join(topicPath, '头文章')
  const mainArticleRepoRel = `${repoRelTopicPath}/头文章`

  if (!isArticleDir(mainArticlePath)) {
    console.warn(`[跳过] ${topicName}/头文章 下没有找到 article.md，跳过此板块`)
    return null
  }

  const mainArticle = {
    name: topicName,
    ...readArticleMeta(mainArticlePath, mainArticleRepoRel),
  }

  // 副文章：在 副文章/ 子目录里，每个子文件夹是一篇
  const subs = []
  const subsDir = path.join(topicPath, '副文章')

  if (fs.existsSync(subsDir) && fs.statSync(subsDir).isDirectory()) {
    const subEntries = fs.readdirSync(subsDir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name, 'zh'))

    for (const subEntry of subEntries) {
      const subPath = path.join(subsDir, subEntry.name)
      const subRepoRelPath = `${repoRelTopicPath}/副文章/${subEntry.name}`

      if (!isArticleDir(subPath)) {
        console.warn(`[跳过] 副文章 ${subEntry.name} 下没有找到 article.md`)
        continue
      }

      subs.push({
        name: subEntry.name,
        ...readArticleMeta(subPath, subRepoRelPath),
      })
    }
  }

  return {
    topicName,
    main: mainArticle,
    subs,
  }
}

/**
 * 主函数
 */
function build() {
  console.log('📦 开始生成 articles.json ...')

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`❌ 找不到内容目录：${CONTENT_DIR}`)
    process.exit(1)
  }

  const topicEntries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'))

  const topics = []

  for (const entry of topicEntries) {
    const topicPath = path.join(CONTENT_DIR, entry.name)
    const topic = parseTopic(topicPath, entry.name)
    if (topic) {
      topics.push(topic)
      console.log(`  ✅ ${entry.name}（副文章 ${topic.subs.length} 篇）`)
    }
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const output = {
    generatedAt: new Date().toISOString(),
    topics,
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'articles.json'),
    JSON.stringify(output, null, 2),
    'utf-8'
  )

  console.log(`\n✅ 生成完成：${OUTPUT_DIR}/articles.json`)
  console.log(`   共 ${topics.length} 个板块`)
}

build()