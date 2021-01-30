const exec = require('child_process').exec;

function executeCommend (cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { encoding: 'utf-8' },
      function (error, stdout, stderr) {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      }
    )
  });
}

const DEFAULT_PACKAGE = {
  main: 'dist/index.min.js',
  license: 'MIT'
};

const WHITE_LIST_PACKAGE_KEY = [
  'name',
  'version',
  'description',
  'keywords',
  'author'
];

const SOURCE_MAP = {
  'index.min.js': 'dist/index.min.js',
  'moongaming-logo.png': 'moongaming-logo.png',
  'index.html': 'index.html',
  '../README.md': 'README.md'
};

const sourceFolder = __dirname + '/dist';
const targetFolder = __dirname + '/npm';

const init = async function () {
  const package = require('./package.json');
  let packageInfo = {
    ...DEFAULT_PACKAGE
  };

  WHITE_LIST_PACKAGE_KEY.forEach(key => {
    packageInfo[key] = package[key];
  });

  await executeCommend(`mkdir -p ${targetFolder}/dist`);
  await executeCommend(`echo '${JSON.stringify(packageInfo, null, 2)}' > ${targetFolder}/package.json`);

  const keys = Object.keys(SOURCE_MAP);
  for (let i = 0, len = keys.length; i < len; i++) {
    await executeCommend(`cp -rf ${sourceFolder}/${keys[i]} ${targetFolder}/${SOURCE_MAP[keys[i]]}`);
  }
  console.log('Generate npm files done!\n\n');
  console.log(`Start publishing ${packageInfo.name}: ${packageInfo.version}`);

  await executeCommend(`cd ${targetFolder} && npm publish`);

  console.log('Publish success!');
};

init();
