import fetch from 'node-fetch';
import fs from 'fs';
import { program } from 'commander';

program
  .option('-l, --language <language>', 'programming language', 'javascript')
  .option('-n, --number <number of results>', 'number of results', '25');

program.parse();
const options = program.opts();

let perPage;
let totalPages;
let remainder;
const totalResults = options.number;

if (totalResults > 100) {
  perPage = 100;
  remainder = totalResults % perPage
  if (remainder !== 0) {
     totalPages = Math.floor(totalResults / perPage) + 1
  } else {
    totalPages = Math.floor(totalResults / perPage)
  }
} else {
  totalPages = 1;
  perPage = options.number;
}

const URL = 'https://api.github.com/search/repositories?q=language:LANGUAGE&stars:%3E0&sort=stars&per_page=PER_PAGE&page=PAGE_NUMBER';
const OUTPUT_FILE = `LANGUAGE/repositories.txt`;

const logger = fs.createWriteStream(OUTPUT_FILE.replace('LANGUAGE', options.language || 'javascript'), {
  flags: 'w'
});

const get_html_urls = json_blob => {
    const { items } = json_blob;
    try {
      const just_html_urls = items.map(project => project.html_url)
      return just_html_urls;
    } catch (error) {
      console.log(error);
      console.log('\n\n*****\n\nyou probably typed in the language wrong\n\n*****\n\n');
      fs.unlinkSync(OUTPUT_FILE.replace('LANGUAGE', options.language || 'javascript'));
      process.exit(1);
    }
}

const writeOutHTMLLinks = json => {
  try{
    const jsonObject = get_html_urls(json)
    jsonObject.forEach(item => logger.write(item + '\n'))
  } catch (error) {
    console.log(error);
  }
}

const grabRepos = async (url, perPage, pageNumber) => {
  try {
    const full_url = URL.replace('LANGUAGE', options.language || 'javascript')
                        .replace('PER_PAGE', perPage)
                        .replace('PAGE_NUMBER', pageNumber);
    const response = await fetch(full_url);
    const json = await response.json();
    writeOutHTMLLinks(json);
  } catch (error) {
    console.log(error);
  }
};

for (let i = 0; i < totalPages ; i++) {
  grabRepos(URL, perPage, i + 1);
}
