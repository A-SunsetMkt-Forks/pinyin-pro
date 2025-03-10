import { stringLength } from "@/common/utils";
import { TokenizationAlgorithm } from "../../common/segmentit";
import type {
  SingleWordResult,
  PinyinMode,
  SurnameMode,
} from "../../common/type";
import { getPinyin } from "./handle";
import {
  validateType,
  middleWareNonZh,
  middlewareMultiple,
  middlewarePattern,
  middlewareToneType,
  middlewareV,
  middlewareType,
  middlewareToneSandhi,
} from "./middlewares";

export interface BasicOptions {
  /**
   * @description 返回的拼音音调类型
   * @value symbol：在字母上加音调 （默认值）
   * @value num：以数字格式展示音调，并跟在拼音后面
   * @value none：不展示音调
   */
  toneType?: "symbol" | "num" | "none";
  /**
   * @description 返回的拼音格式类型
   * @value pinyin：返回完整拼音 （默认值）
   * @value initial：返回声母
   * @value final：返回韵母
   * @value num：返回音调对应的数字
   * @value first：返回首字母
   * @value finalHead：返回韵头（介音）
   * @value finalBody：返回韵腹
   * @value finalTail：返回韵尾
   */
  pattern?:
    | "pinyin"
    | "initial"
    | "final"
    | "num"
    | "first"
    | "finalHead"
    | "finalBody"
    | "finalTail";
  /**
   * @description 是否返回单个汉字的所有多音，仅针对输入的 word 为单个汉字生效
   * @value false：返回最常用的一个拼音 （默认值）
   * @value true：返回所有读音
   */
  multiple?: boolean;
  /**
   * @description 优先的拼音匹配模式
   * @value normal：正常匹配模式 （默认值）
   * @value surname：姓氏模式，遇到姓氏表中的汉字时，优先匹配姓氏读音
   */
  mode?: PinyinMode;
  /**
   * @description surname 模式作用的范围
   * @value off：不启用 surname 模式（默认值为 off）
   * @value all：作用于整个汉语字符串（当设置了 `mode: surname` 时，默认值为 all）
   * @value head：作用于汉语字符串开头
   */
  surname?: SurnameMode;
  /**
   * @description 是否移除非汉字字符（推荐使用 removeNonZh: removed 代替）
   * @value false：返回结果保留非汉字字符 （默认值）
   * @value true：返回结果移除非汉字字符
   */
  removeNonZh?: boolean;
  /**
   * @description 非汉字字符的间距格式
   * @value spaced：连续非汉字字符之间用空格隔开 （默认值）
   * @value consecutive：连续非汉字字符无间距
   * @value removed：返回结果移除非汉字字符
   */
  nonZh?: "spaced" | "consecutive" | "removed";
  /**
   * @description nonZh 生效范围的正则表达式
   */
  nonZhScope?: RegExp;
  /**
   * @description 对于 ü 的返回是否转换成 v（仅在 toneType: none 启用时生效）
   * @value false：返回值中保留 ü （默认值）
   * @value true：返回值中 ü 转换成 v
   * @value string：返回值中 ü 转换成指定字符
   */
  v?: boolean | string;
  /**
   * @description 是否开启「一」和 「不」字的变调。默认开启。参考：https://zh.wiktionary.org/wiki/Appendix:%E2%80%9C%E4%B8%80%E2%80%9D%E5%8F%8A%E2%80%9C%E4%B8%8D%E2%80%9D%E7%9A%84%E5%8F%98%E8%B0%83
   * @value true：开启
   * @value false：不开启
   */
  toneSandhi?: boolean;
  /**
   * @description 要使用的分词算法。默认为逆向最大匹配分词
   * @value 1：逆向最大匹配分词(速度最快，准确率适中)
   * @value 2：最大概率分词(速度适中，准确率高)
   * @value 2：最少分词数分词(速度适中，准确率高)
   */
  segmentit?: TokenizationAlgorithm;
}

interface AllData {
  origin: string;
  pinyin: string;
  initial: string;
  final: string;
  num: number;
  first: string;
  finalHead: string;
  finalBody: string;
  finalTail: string;
  isZh: boolean;
  polyphonic: string[];
  inZhRange: boolean;
  result: string; // 3.24.0 新增
}

interface OptionsReturnString extends BasicOptions {
  /**
   * @description 返回结果的格式
   * @value string：以字符串格式返回，拼音之间用空格隔开 （默认值）
   * @value array：以数组格式返回
   * @value array: 返回全部信息数组
   */
  type?: "string";
  /**
   * @description 拼音之间的分隔符，默认为空格，仅在 type 为 'string' 时生效
   */
  separator?: string;
}

interface OptionsReturnArray extends BasicOptions {
  /**
   * @description 返回结果的格式
   * @value string：以字符串格式返回，拼音之间用空格隔开 （默认值）
   * @value array：以数组格式返回
   * @value array: 返回全部信息数组
   */
  type: "array";
}

interface OptionsReturnAll extends BasicOptions {
  /**
   * @description 返回结果的格式
   * @value string：以字符串格式返回，拼音之间用空格隔开 （默认值）
   * @value array：以数组格式返回
   * @value array: 返回全部信息数组
   */
  type: "all";
}

export interface CompleteOptions extends BasicOptions {
  /**
   * @description 返回结果的格式
   * @value string：以字符串格式返回，拼音之间用空格隔开 （默认值）
   * @value array：以数组格式返回
   * @value array: 返回全部信息数组
   */
  type?: "string" | "array" | "all";
  /**
   * @description 拼音之间的分隔符，默认为空格，仅在 type 为 'string' 时生效
   */
  separator?: string;
}

const DEFAULT_OPTIONS: CompleteOptions = {
  pattern: "pinyin",
  toneType: "symbol",
  type: "string",
  multiple: false,
  mode: "normal",
  removeNonZh: false,
  nonZh: "spaced",
  v: false,
  separator: " ",
  toneSandhi: true,
  segmentit: TokenizationAlgorithm.MaxProbability,
};

/**
 * @description: 获取汉语字符串的拼音
 * @param {string} word 要转换的汉语字符串
 * @param {OptionsReturnString=} options 配置项
 * @return {string | string[] | AllData[]} options.type 为 string 时，返回字符串，中间用空格隔开；为 array 时，返回拼音字符串数组；为 all 时返回全部信息的数组
 */
function pinyin(word: string, options?: OptionsReturnString): string;

/**
 * @description: 获取汉语字符串的拼音
 * @param {string} word 要转换的汉语字符串
 * @param {OptionsReturnArray=} options 配置项
 * @return {string | string[] | AllData[]} options.type 为 string 时，返回字符串，中间用空格隔开；为 array 时，返回拼音字符串数组；为 all 时返回全部信息的数组
 */
function pinyin(word: string, options?: OptionsReturnArray): string[];

/**
 * @description: 获取汉语字符串的拼音
 * @param {string} word 要转换的汉语字符串
 * @param {OptionsReturnAll=} options 配置项
 * @return {string | string[] | AllData[]} options.type 为 string 时，返回字符串，中间用空格隔开；为 array 时，返回拼音字符串数组；为 all 时返回全部信息的数组
 */
function pinyin(word: string, options?: OptionsReturnAll): AllData[];

/**
 * @description: 获取汉语字符串的拼音
 * @param {string} word 要转换的汉语字符串
 * @param {CompleteOptions=} options 配置项
 * @return {string | string[] | AllData[]} options.type 为 string 时，返回字符串，中间用空格隔开；为 array 时，返回拼音字符串数组；为 all 时返回全部信息的数组
 */
function pinyin(
  word: string,
  options?: CompleteOptions
): string | string[] | AllData[] {
  options = { ...DEFAULT_OPTIONS, ...(options || {}) };
  // 校验 word 类型是否正确
  const legal = validateType(word);
  if (!legal) {
    return word;
  }

  // 传入空字符串
  if (word === "") {
    return options.type === "array" || options.type === "all" ? [] : "";
  }

  if (options.surname === undefined) {
    if (options.mode === "surname") {
      options.surname = "all";
    } else {
      options.surname = "off";
    }
  }

  if (options.type === "all") {
    options.pattern = "pinyin";
  }

  if (options.pattern === "num") {
    options.toneType = "none";
  }

  if (options.removeNonZh) {
    options.nonZh = "removed";
  }

  let _list = Array(stringLength(word));

  let { list } = getPinyin(
    word,
    _list,
    options.surname as SurnameMode,
    options.segmentit as TokenizationAlgorithm
  );

  // 一和不变调处理
  list = middlewareToneSandhi(list, options.toneSandhi as boolean);

  // nonZh 参数及 removeNonZh 参数
  list = middleWareNonZh(list, options);

  // multiple 参数
  if (middlewareMultiple(word, options)) {
    list = middlewareMultiple(word, options) as SingleWordResult[];
  }

  // pattern 参数
  middlewarePattern(list, options);

  // toneType参数处理
  middlewareToneType(list, options);

  // v参数处理
  middlewareV(list, options);

  // type 参数处理
  return middlewareType(list, options, word);
}

export { pinyin };
