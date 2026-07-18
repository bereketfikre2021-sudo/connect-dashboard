import { PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

/**
 * Shared DnD sensors — works on both desktop (pointer) and mobile (touch).
 * Uses a small activation distance/delay so taps don't accidentally trigger drags.
 */
export function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,      // hold 200ms before drag starts (prevents accidental drag on tap)
        tolerance: 8,    // allow 8px movement during delay
      },
    })
  );
}
