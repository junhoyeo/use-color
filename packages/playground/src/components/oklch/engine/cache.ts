export interface PlaneCache {
	get(key: string): ImageData | undefined;
	set(key: string, data: ImageData): void;
	clear(): void;
	size(): number;
}

export function createPlaneCache(maxSize: number): PlaneCache {
	if (maxSize < 1) {
		throw new Error("Cache maxSize must be at least 1");
	}

	const cache = new Map<string, ImageData>();

	function moveToEnd(key: string, value: ImageData): void {
		cache.delete(key);
		cache.set(key, value);
	}

	function evictLeastRecentlyUsed(): void {
		const oldestKey = cache.keys().next().value;
		if (oldestKey !== undefined) {
			cache.delete(oldestKey);
		}
	}

	return {
		get(key: string): ImageData | undefined {
			const value = cache.get(key);
			if (value !== undefined) {
				moveToEnd(key, value);
			}
			return value;
		},

		set(key: string, data: ImageData): void {
			if (cache.has(key)) {
				cache.delete(key);
			} else if (cache.size >= maxSize) {
				evictLeastRecentlyUsed();
			}
			cache.set(key, data);
		},

		clear(): void {
			cache.clear();
		},

		size(): number {
			return cache.size;
		},
	};
}

export type PlaneAxis = "LC" | "LH" | "CH";
export type GamutType = "srgb" | "p3";

export function buildCacheKey(
	axis: PlaneAxis,
	width: number,
	height: number,
	fixedValue: number,
	gamut: GamutType,
): string {
	const roundedValue = Math.round(fixedValue * 100) / 100;
	return `${axis}:${width}:${height}:${roundedValue}:${gamut}`;
}
