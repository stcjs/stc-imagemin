import Plugin from 'stc-plugin';
import os from 'os';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import {promisify} from 'stc-helper';
import pngquant from 'pngquant-bin';
import jpegtran from 'jpegtran-bin';
import gifsicle from 'gifsicle';

const tmpdir = os.tmpdir();
const execFile = promisify(child_process.execFile, child_process);
const writeFile = promisify(fs.writeFile, fs);
const readFile = promisify(fs.readFile, fs);
const unlink = promisify(fs.unlink, fs);

/**
 * default options
 */
const defaultOptions = {
  png: {adapter: pngquant, args: ['-o', 'outfile', 'inputfile']},
  gif: {adapter: gifsicle, args: ['-o', 'outfile', 'inputfile']},
  jpg: {adapter: jpegtran, args: ['-outfile', 'outfile', 'inputfile']}
}

let options = null;

/**
 * get random string
 */
const getRandomStr = (length = 64) => {
  let str = crypto.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
  return str.replace(/[\+\/]/g, '_');
};
/**
 * get temporary files
 */
const getTmpFiles = (extname = '') => {
  let str = getRandomStr();
  return {
    input: tmpdir + path.sep + 'input_' + str + '.' + extname,
    output: tmpdir + path.sep + 'output_' + str + '.' + extname
  }
};
/**
 * format args
 */
const formatArgs = (args, files) => {
  return args.map(item => {
    if(item === 'outfile'){
      return files.output;
    }else if(item === 'inputfile'){
      return files.input;
    }
    return item;
  })
};


export default class ImageMinPlugin extends Plugin {
  /**
   * run
   */
  async run(){
    if(!options){
      options = {...defaultOptions, ...this.options};
    }
    let extname = this.file.extname;
    let buffer = await this.getContent();
    switch(extname){
      case 'jpg':
      case 'jpeg':
        return this.minify(jpegtran, buffer, 'jpg');
      case 'png':
        return this.minify(pngquant, buffer, 'png');
      case 'gif':
        return this.minify(gifsicle, buffer, 'gif');
    }
    this.fatal(`imagemin only support PNG, JPEG, GIF files`);
  }
  /**
   * minify file
   */
  async minify(cmd, buffer, extname) {
    let files = getTmpFiles(extname);
    let opt = options[extname];
    let args = formatArgs(opt.args, files);
    fs.writeFileSync('/Users/welefen/Downloads/aaa.png', buffer);
    await writeFile(files.input, buffer);
    await this.parallelLimit(() => {
      return execFile(opt.adapter, args);
    }, err => {
      if(err.code === 'EAGAIN'){
        return true;
      }
    }, 100).catch(err => {
      return unlink(files.input).then(() => {
        return Promise.reject(err);
      })
    });
    let retBuf = await readFile(files.output);
    // not await
    await Promise.all([unlink(files.input), unlink(files.output)]);
    // ignore when optimize image large than source image
    if(retBuf.length >= buffer.length){
      return;
    }
    return retBuf.toString('base64');
  }
  /**
   * update
   */
  update(base64){
    if(!base64){
      return;
    }
    let buffer = new Buffer(base64, 'base64');
    this.setContent(buffer);
  }
  /**
   * default include patterns
   */
  static include(){
    return /\.(?:jpg|jpeg|png|gif)$/i;
  }
  /**
   * disable cluster
   */
  static cluster(){
    return false;
  }
  /**
   * use cache
   */
  static cache(){
    return true;
  }
}