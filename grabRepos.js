const fetch = require('node-fetch');
const fs = require('fs');
const { argv } = require('yargs');

const URL = 'https://api.github.com/search/repositories?q=language:LANGUAGE&stars:%3E0&sort=stars&per_page=PER_PAGE';
const OUTPUT_FILE = 'LANGUAGE-results.txt';

const logger = fs.createWriteStream(OUTPUT_FILE.replace('LANGUAGE', argv.language || 'javascript'), {
  flags: 'a'
});

const get_html_urls = json_blob => {
    const { items } = json_blob;
    try {
      const just_html_urls = items.map(project => project.html_url)
      return just_html_urls;
    } catch (error) {
      console.log(error);
      console.log('\n\n*****\n\nyou probably typed in the language wrong\n\n*****\n\n');
      fs.unlinkSync(OUTPUT_FILE.replace('LANGUAGE', argv.language || 'javascript'));
      process.exit(1);
    }
}

const writeOutHTMLLinks = json => {
  try{
    jsonObject = get_html_urls(json)
    jsonObject.forEach(item => logger.write(item + '\n'))
  } catch (error) {
    console.log(error);
  }
}

const grabRepos = async url => {
  try {
    const full_url = URL.replace('LANGUAGE', argv.language || 'javascript')
                        .replace('PER_PAGE', argv.number || '25');
    const response = await fetch(full_url);
    const json = await response.json();
    writeOutHTMLLinks(json);
  } catch (error) {
    console.lot(error);
  }
};

if (argv.language === undefined) {
    console.log('no language specified, using javascript');
}

if (argv.number === undefined) {
    console.log('no number of repos specified, using 25 as the default')
}

grabRepos(URL);
