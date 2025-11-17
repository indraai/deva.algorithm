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
    async aspect(opts) {
      const estr = `aspect:${opts.type}:${opts.key}:${opts.packet.id.uid}`;
      this.context(opts.key, opts.packet.id.uid);
      this.action('func', estr);
      
      const {key, name, warning} = this.vars[opts.type][opts.key];
      
      this.vars.status = key;
      this.vars.warning = warning;
      this.state('await', estr);
      const uid = await this.methods.uid(opts.packet);
    
      this.vars.status = false;
      this.vars.warning = false;
    
      this.action('return', estr); // set action return
      this.state('valid', estr);
      this.intent('good', estr);
      return uid;
    },

    async router(packet) {
      const {id} = packet;
      const key = packet.q.meta.params.pop();
      this.context(type, `router:${key}:${id.uid}`);
    
      const estr = `router:${type}:${key}:${id.uid}`;
      this.action('func', estr);
      
      this.state('data', `router:${type}:${key}:opts:${id.uid}`); // set state data
      const opts = {key, type, packet};
      
      this.action('return', `router:${type}:${key}:aspect:${id.uid}`); // set action return
      this.state('await', `router:${type}:${key}:aspect:${id.uid}`); // set action return
      return await this.func.aspect(opts);      
    }
  },
  methods: {
    async algo(packet) {
      const {id, q} = packet;
      const {meta, text} = q;
      const {key, method, params} = meta;
      
      console.log('q', q);
      // this.context('algo', id.uid); // set context concept
      // this.action('method', `algo:${id.uid}`);
      // this.state('await', `algo:${id.uid}`);
      // return await this.func.router(packet);
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
