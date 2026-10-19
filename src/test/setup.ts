import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { MotionGlobalConfig } from 'motion/react'

// Animations finish at once in tests, so screens settle before assertions run.
MotionGlobalConfig.skipAnimations = true
