import { Priority } from '@/common/constant';
import type { Pattern } from '../../lib/common/ac';
const DICT5: { [prop: string]: string } = {
  巴尔干半岛: 'bā ěr gàn bàn dǎo',
  巴尔喀什湖: 'bā ěr kā shí hú',
  不幸而言中: 'bù xìng ér yán zhòng',
  布尔什维克: 'bù ěr shí wéi kè',
  何乐而不为: 'hé lè ér bù wéi',
  苛政猛于虎: 'kē zhè měng yú hǔ',
  蒙得维的亚: 'méng de wéi de yà',
  民以食为天: 'mín yǐ shí wéi tiān',
  拧成一股绳: 'níng chéng yī gǔ shéng',
  事后诸葛亮: 'shì hòu zhū gé liàng',
  物以稀为贵: 'wù yǐ xī wéi guì',
  先下手为强: 'xiān xià shǒu wéi qiáng',
  行行出状元: 'háng háng chū zhuàng yuán',
  亚得里亚海: 'yà de lǐ yà hǎi',
  眼不见为净: 'yǎn bù jiàn wéi jìng',
  竹筒倒豆子: 'zhú tǒng dǎo dòu zi',
};
export default DICT5;
export const Pattern5: Pattern[] = Object.keys(DICT5).map((key) => ({
  zh: key,
  pinyin: DICT5[key],
  priority: Priority.DICT5,
  length: 5,
}));
