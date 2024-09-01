const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');

// 递归获取所有 HTML 文件
function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(file));
    } else if (path.extname(file) === '.html') {
      results.push(file);
    }
  });
  return results;
}

// 生成 sitemap
async function generateSitemap() {
  const baseUrl = 'https://blog.qttao.net'; // 替换为你的网站 URL
  const publicDir = './public-dist';

  const htmlFiles = getHtmlFiles(publicDir);
  const links = htmlFiles.map(file => {
    return {
      url: '/' + path.relative(publicDir, file).replace(/\\/g, '/'),
      changefreq: 'weekly',
      priority: 0.8
    };
  });

  const stream = new SitemapStream({ hostname: baseUrl });
  const data = await streamToPromise(Readable.from(links).pipe(stream));
  fs.writeFileSync('./public-dist/sitemap.xml', data.toString());
}

generateSitemap().catch(console.error);