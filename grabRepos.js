import fetch from 'node-fetch';
import fs from 'fs';
import { program } from 'commander';

program
  .option('-l, --language <language>', 'programming language', 'javascript')
  .option('-n, --number <number of results>', 'number of results', '25');

program.parse();
const options = program.opts();

const URL = 'https://api.github.com/search/repositories?q=language:LANGUAGE&stars:%3E0&sort=stars&per_page=PER_PAGE';
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

const grabRepos = async url => {
  try {
    const full_url = URL.replace('LANGUAGE', options.language || 'javascript')
                        .replace('PER_PAGE', options.number || '25');
    const response = await fetch(full_url);
    const json = await response.json();
    writeOutHTMLLinks(json);
  } catch (error) {
    console.log(error);
  }
};

grabRepos(URL);
