import { promises as fs } from 'fs';
import path from 'path';
import { config } from '../config';
import {
  HealthProfile,
  HistoryEntry,
  HistoryEntryType
} from '../types';

const profileFile = path.join(config.dataDir, 'health_profile.json');
const historyFile = path.join(config.dataDir, 'history.json');

const ensureDataDir = async () => {
  await fs.mkdir(config.dataDir, { recursive: true });
};

const readJson = async <T>(filePath: string, fallback: T): Promise<T> => {
  await ensureDataDir();
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content) as T;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
};

const writeJson = async (filePath: string, data: unknown): Promise<void> => {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

export const getProfile = async (): Promise<HealthProfile | null> => {
  return readJson<HealthProfile | null>(profileFile, null);
};

export const saveProfile = async (profile: HealthProfile): Promise<void> => {
  await writeJson(profileFile, profile);
};

export const getHistory = async (): Promise<HistoryEntry[]> => {
  return readJson<HistoryEntry[]>(historyFile, []);
};

export const appendHistoryEntry = async (
  entry: HistoryEntry
): Promise<void> => {
  const history = await getHistory();
  history.push(entry);
  await writeJson(historyFile, history);
};

export const clearHistory = async (type?: HistoryEntryType): Promise<void> => {
  if (!type) {
    await writeJson(historyFile, []);
    return;
  }

  const history = await getHistory();
  const filtered = history.filter((entry) => entry.type !== type);
  await writeJson(historyFile, filtered);
};

