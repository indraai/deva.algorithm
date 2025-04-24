// Copyright (c)2025 Quinn Michaels
// Algorithm Deva
import Deva from '@indra.ai/deva';
import pkg from './package.json' with {type:'json'};
const {agent,vars} = pkg.data;

// set the __dirname
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';    
const __dirname = dirname(fileURLToPath(import.meta.url));

const info = {
  id: pkg.id,
  name: pkg.name,
  describe: pkg.description,
  version: pkg.version,
  url: pkg.homepage,
  dir: __dirname,
  git: pkg.repository.url,
  bugs: pkg.bugs.url,
  author: pkg.author,
  license: pkg.license,
  copyright: pkg.copyright,
};

const ALGORITHM = new Deva({
  info,
  agent,
  vars,
  utils: {
    translate(input) {return input.trim();},
    parse(input) {return input.trim();},
    process(input) {return input.trim();}
  },
  listeners: {},
  modules: {},
  deva: {},
  func: {
    async list(opts) {
      this.action('func', `list:${opts.id}`);
      let filedata = false;
      try {
        const filepath = this.lib.path.join(__dirname, 'data', 'algorithms.json');
        filedata = this.lib.fs.readFileSync(filepath, 'utf-8');
        filedata = JSON.parse(filedata, null, 2).data;
      }
      catch(e) {
        throw e;  
      }
      finally {
        return filedata;
      }
    }
  },
  methods: {
    list(packet) {
      this.context('list', packet.id);
      this.action('method', `list:${packet.id}`);
      return new Promise((resolve, reject) => {
        this.func.list(packet).then(data => {
          return resolve({
            text: `items in data`,
            html: `items in data`,
            data,
          })
        }).catch(err => {
          return this.error(err, packet, reject);
        })
      });
    }
  },
  onReady(data, resolve) {
    this.prompt(this.vars.messages.ready);
    return resolve(data);
  },
  onError(err, data, reject) {
    this.prompt(this.vars.messages.error);
    console.log(err);
    return reject(err);
  }
});
export default ALGORITHM
