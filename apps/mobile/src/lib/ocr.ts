import * as ImagePicker from 'expo-image-picker';
import { E, P, species } from '../store';
import { recognize } from '../../modules/raidwell-ocr';
export async function pickRaidScreenshot() {
  const selection = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: false });
  if (selection.canceled) return null;
  const image = selection.assets[0];
  if (image.fileSize && image.fileSize > 12 * 1024 * 1024) throw new Error('Choose a screenshot under 12 MB.');
  if (image.width * image.height > 40_000_000) throw new Error('Choose a smaller screenshot.');
  const result = await recognize(image.uri, species.map((x: any) => x.name));
  const parsed = E.parseOCR(result.text, species);
  const name = parsed.exact && !parsed.ambiguous && !parsed.sourceIsCompanion ? P.formatBoss(parsed.boss, parsed.detectedForm || (parsed.mega ? 'Mega' : '')) : '';
  return { uri: image.uri, parsed, name, engine: result.engine };
}
