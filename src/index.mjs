/**
 * node imports
 */
import fs from 'node:fs'
import path from 'node:path'

/**
 * unified imports
 */
import { unified } from 'unified'
import { read, write } from 'to-vfile'
import { visit } from 'unist-util-visit'

/**
 * remark imports
 */
import { toString } from 'mdast-util-to-string'
import remarkRehype from 'remark-rehype'
import remarkParse from 'remark-parse'
import remarkUnwrapImages from 'remark-unwrap-images'

/**
 * rehype imports
 */
import { h } from 'hastscript'
import { headingRank } from 'hast-util-heading-rank'
import rehypeStringify from 'rehype-stringify'
import rehypeDocument from 'rehype-document'
import rehypeFormat from 'rehype-format'

/**
 * npm imports
 */
import { slug } from 'github-slugger'
import fg from 'fast-glob'

/**
 * local imports
 */
import bookConfig from '../book.config.js'

const copyFile = async (src, dest) => {
  await fs.promises.copyFile(src, dest)
}

const readMarkdownFiles = async (filePaths, root) => {
  return await Promise.all(
    filePaths.map(async (filePath) => read(path.join(root, filePath)))
  )
}

const { title, author, tocTitle, root, entry, output } = bookConfig

const DEST_PATH = path.join(root, '..', '..', 'public')

// copy all images from `_book/` folder to `public/` folder
const images = fg.sync([`${root}/**/*.{jpg,png}`], {
  ignore: ['**/node_modules/**'],
})

images.forEach(async (image) => {
  const filename = image.split('/').pop()
  await copyFile(image, path.join(DEST_PATH, filename))
})

const files = await readMarkdownFiles(entry, root)

const markup = files.map((file) => file.value).join('\n\n')

const link = [
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Alegreya:wght@800&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter&display=swap',
  },
  {
    rel: 'stylesheet',
    href: './index.css',
  },
]

let lis = []
let n = 1

const processor = await unified()
  .use(remarkParse, { fragment: true })
  .use(remarkUnwrapImages)
  .use(remarkRehype)
  .use(rehypeDocument, {
    title,
    link,
  })
  .use(() => (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      const headers = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      if (headers.includes(node.tagName)) {
        const title = toString(node.children)
        const depth = headingRank(node)
        const noOfHastags = '#'.repeat(depth)
        lis.push({ title, depth })
        node.properties.id = slug(title)

        if (node.tagName === 'h1' && parent) {
          node.properties.className = ['chapter']
          parent.children.splice(index, 0, h('.page-break'))
          return index + 2
        }
      }
    })
  })
  .use(() => (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'img') {
        parent.children[index] = h('figure', [
          h('img', { ...node.properties }),
          h('figcaption', node.properties.alt),
        ])
      }
    })
  })
  .use(() => (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'body') {
        node.children = [
          h('.frontcover'),
          h('.page-break'),
          h('nav#toc', { role: 'doc-toc' }, [
            h('h1', tocTitle || 'table of contents'),
            h(
              'ol',
              lis.map((li) => {
                return h(
                  'li',
                  {
                    className:
                      li.depth > 1 ? [`ml-${(li.depth - 1) * 2}`] : ['chapter'],
                  },
                  [
                    h(
                      'a',
                      {
                        href: `#${slug(li.title)}`,
                      },
                      li.title
                    ),
                  ]
                )
              })
            ),
          ]),
          ...node.children,
        ]
      }
    })
  })
  .use(rehypeFormat)
  .use(rehypeStringify)

try {
  const file = await processor.process(markup)
  file.path = path.join(DEST_PATH, 'index.html')
  await fs.promises.mkdir(file.dirname, { recursive: true })
  await write(file)
} catch (error) {
  throw error
}
