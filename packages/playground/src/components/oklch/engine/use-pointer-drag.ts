"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UsePointerDragOptions {
	onDragStart?: () => void;
	onDrag: (x: number, y: number) => void;
	onDragEnd?: () => void;
}

export interface UsePointerDragReturn {
	isDragging: boolean;
}

function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value));
}

function getNormalizedCoordinates(
	event: PointerEvent,
	element: HTMLElement,
): { x: number; y: number } {
	const rect = element.getBoundingClientRect();
	const x = clamp01((event.clientX - rect.left) / rect.width);
	const y = clamp01((event.clientY - rect.top) / rect.height);
	return { x, y };
}

export function usePointerDrag(
	ref: React.RefObject<HTMLElement | null>,
	options: UsePointerDragOptions,
): UsePointerDragReturn {
	const { onDragStart, onDrag, onDragEnd } = options;

	const [isDragging, setIsDragging] = useState(false);

	const activePointerIdRef = useRef<number | null>(null);
	const originalCursorRef = useRef<string>("");

	const onDragStartRef = useRef(onDragStart);
	const onDragRef = useRef(onDrag);
	const onDragEndRef = useRef(onDragEnd);

	useEffect(() => {
		onDragStartRef.current = onDragStart;
		onDragRef.current = onDrag;
		onDragEndRef.current = onDragEnd;
	}, [onDragStart, onDrag, onDragEnd]);

	const handlePointerDown = useCallback(
		(event: PointerEvent) => {
			const element = ref.current;
			if (!element) return;

			event.preventDefault();

			element.setPointerCapture(event.pointerId);
			activePointerIdRef.current = event.pointerId;

			originalCursorRef.current = element.style.cursor;
			element.style.cursor = "grabbing";

			const { x, y } = getNormalizedCoordinates(event, element);
			onDragRef.current(x, y);

			setIsDragging(true);
			onDragStartRef.current?.();
		},
		[ref],
	);

	const handlePointerMove = useCallback(
		(event: PointerEvent) => {
			const element = ref.current;
			if (!element) return;

			if (activePointerIdRef.current !== event.pointerId) return;

			event.preventDefault();

			const { x, y } = getNormalizedCoordinates(event, element);
			onDragRef.current(x, y);
		},
		[ref],
	);

	const handlePointerUp = useCallback(
		(event: PointerEvent) => {
			const element = ref.current;
			if (!element) return;

			if (activePointerIdRef.current !== event.pointerId) return;

			if (element.hasPointerCapture(event.pointerId)) {
				element.releasePointerCapture(event.pointerId);
			}

			activePointerIdRef.current = null;
			element.style.cursor = originalCursorRef.current;

			setIsDragging(false);
			onDragEndRef.current?.();
		},
		[ref],
	);

	const handlePointerCancel = useCallback(
		(event: PointerEvent) => {
			handlePointerUp(event);
		},
		[handlePointerUp],
	);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const originalTouchAction = element.style.touchAction;
		element.style.touchAction = "none";

		element.addEventListener("pointerdown", handlePointerDown);
		element.addEventListener("pointermove", handlePointerMove);
		element.addEventListener("pointerup", handlePointerUp);
		element.addEventListener("pointercancel", handlePointerCancel);

		return () => {
			element.style.touchAction = originalTouchAction;

			if (activePointerIdRef.current !== null) {
				try {
					if (element.hasPointerCapture(activePointerIdRef.current)) {
						element.releasePointerCapture(activePointerIdRef.current);
					}
				} catch (_alreadyReleased) {}
			}

			if (originalCursorRef.current) {
				element.style.cursor = originalCursorRef.current;
			}

			element.removeEventListener("pointerdown", handlePointerDown);
			element.removeEventListener("pointermove", handlePointerMove);
			element.removeEventListener("pointerup", handlePointerUp);
			element.removeEventListener("pointercancel", handlePointerCancel);
		};
	}, [ref, handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel]);

	return { isDragging };
}
