"use strict";
// Copyright ©2025 Quinn A Michaels; All rights reserved. 
// Legal Signature Required For Lawful Use.
// Distributed under VLA:71227287749283770868 LICENSE.md

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
  VLA: pkg.VLA,
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
    get(opts) {      
      const id = this.uid();
      const {meta} = opts;
      const {key, method, params} = meta;
      const algo = params[1];
      const {personal} = this.owner();
      this.action('func', `get:${algo}:${id.uid}`);

      return new Promise((resolve, reject) => {
        const ret = {} // return object
        this.state('try',  `get:${algo}:${id.uid}`); // set state try
        try {
          const curAlgo = personal[algo];
          
          const text = [
            `${this.box.begin}:${key}:${algo}:${id.uid}`,
            `license: ${curAlgo.id}`,
            `key: #${curAlgo.key}`,
            `name: ${curAlgo.name}`,
            `help: ${curAlgo.help}`,
            `describe: ${curAlgo.describe}`,
            `===`,
            `uid: ${id.uid}`,
            `time: ${id.time}`,
            `date: ${id.date}`,
            `warning: ${id.warning}`,
            `fingerprint: ${id.fingerprint}`,
            `md5: ${id.md5}`,
            `sha256: ${id.sha256}`,
            `sha512: ${id.sha512}`,
            `copyright: ${curAlgo.copyright}`,
            `${this.box.end}:${key}:${algo}:${id.uid}`,
          ].join('\n');
          
          ret.text = text,
          ret.html = false;
          ret.data = curAlgo;
        } 
        catch (err) {
          this.state('catch', `get:${id.uid}`); // set state catch
          this.state('invalid', `get:${id.uid}`); // set state invalid
          this.intent('bad', `get:${id.uid}`); // set intent bad
          return this.err(err, opts, reject);
        }
        finally {
          this.action('resolve', `get:${algo}:${id.uid}`); // set action resolve
          this.state('valid', `get:${algo}${id.uid}`); // set state valid
          this.intent('good', `get:${algo}:${id.uid}`); // set intent good
          return resolve(ret);
        }
      });
      
      
      this.action('return', `algo:${algo}:${key}:${id.uid}`); // set action return
      this.state('await', `algo:${algo}:${key}:${id.uid}`); // set action return
      return true;      
    }
  },
  methods: {
    async algo(packet) {
      const {id, q} = packet;
      const {key, method, params} = q.meta;
      this.context(method, id.uid); // set context concept
      this.action('method', `${method}:${id.uid}`);
      
      this.state('await', `algo:${id.uid}`);
      return await this.func.get(packet.q);
    },
    
    menu(packet) {
      this.context('menu', packet.id.uid);
      this.action('method', `menu:${packet.id.uid}`);
      return new Promise((resolve, reject) => {
        try {
          const {personal} = this.owner();
          const text = personal.map(item => {
            return [
              `${this.box.begin}:algorithm:${item.key}:${item.id}`,
              `## ${item.name}`,
              `id: ${item.id}`,
              `describe: ${item.describe}`,
              `button[${item.name}]: ${this.askChr}algorithm help ${item.help}`,
              `${this.box.begin}:algorithm:${item.key}:${item.id}`,
            ].join('\n');
          }).join('\n');
          
          
          return resolve({
            text,
            html: `See Data`,
            data: personal,
          });
        } catch (err) {
          return this.err(err, packet, reject);          
        }
      });
    }
  },
  onInit(data, resolve) {
    const {personal} = this.license(); // get the license config
    const agent_license = this.info().VLA; // get agent license
    const license_check = this.license_check(personal, agent_license); // check license
    // return this.start if license_check passes otherwise stop.
    this.action('return', `onInit:${data.id.uid}`);
    return license_check ? this.start(data, resolve) : this.stop(data, resolve);
  },
  onReady(data, resolve) {
    const {VLA} = this.info();
    this.prompt(`${this.vars.messages.ready} > VLA:${VLA.uid}`);
    this.action('resolve', `onReady:${data.id.uid}`);
    return resolve(data);
  },
  onError(err, data, reject) {
    this.prompt(this.vars.messages.error);
    console.log(err);
    return reject(err);
  }
});
export default ALGORITHM
