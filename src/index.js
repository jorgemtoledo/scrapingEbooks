const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const url = 'https://books.goalkicker.com/'
let listLinks = []
let downloadlinkList = []


// Busca links do site
const getLinks = async (url) => {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)
    $('div.bookContainer').each(function (i, lnk) {  
      let link = $(lnk).find('a').attr('href')
      listLinks.push(url+link)
    });
  } catch (error) {
    console.error(error)
  }
}

// Links para donwloads do ebooks
const downloadLinks = async (listLinks) => {
  for (const link of listLinks) {
    const response = await axios.get(link)
    const $ = cheerio.load(response.data)
    let name = $('.download').attr("onclick")
    name = name.match(/location\.href\s*=\s*['"]([^'"]*)['"]/)
    let dlink = link + name[1]
    downloadlinkList.push({
      name: name[1],
      dlink: dlink
    })
  }

}

// Gravar os ebooks no diretório downloads
const downloadFiles = async (downloadlinkList) => {
  for (const link of downloadlinkList) {
    let name = link.name
    let url = link.dlink
    const pathDownload = path.resolve(__dirname, 'downloads', name)
    let file = fs.createWriteStream(pathDownload)
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
    response.data.pipe(file)
  }
}

(async () => {
  await getLinks(url)
  await downloadLinks(listLinks)
  await downloadFiles(downloadlinkList)
})()