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
const getRandomStr = (length = 32) => {
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
}

/**
 * minify files
 */
const minify = async (cmd, buffer, extname) => {
  let files = getTmpFiles(extname);
  let opt = options[extname], args = formatArgs(opt.args, files);
  await writeFile(files.input, buffer);
  await execFile(opt.adapter, args);
  let ret = await readFile(files.output);
  // not await
  Promise.all([unlink(files.input), unlink(files.output)]);
  return ret.toString('binary');
}

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
        return this.minifyJpg(buffer);
      case 'png':
        return this.minifyPng(buffer);
      case 'gif':
        return this.minifyGif(buffer);
    }
  }

  /**
   * minify jpg files
   */
  async minifyJpg(buffer){
    return minify(jpegtran, buffer, 'jpg');
  }

  /**
   * minify png files
   */
  minifyPng(buffer){
    return minify(pngquant, buffer, 'png');
  }

  /**
   * minify gif files
   */
  minifyGif(buffer){
    return minify(gifsicle, buffer, 'gif');
  }

  async update(binary){
    this.setContent(binary);
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