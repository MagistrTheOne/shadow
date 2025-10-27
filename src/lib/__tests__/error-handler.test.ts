import { handleTRPCError, createErrorMessage, AppError } from '../error-handler'
import { TRPCError } from '@trpc/server'

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation()

describe('Error Handler', () => {
  beforeEach(() => {
    mockConsoleError.mockClear()
    // Mock toast - in real app this would be imported from sonner
    global.toast = { error: jest.fn(), success: jest.fn() }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('handleTRPCError', () => {
    it('should handle UNAUTHORIZED error', () => {
      const error = new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      })

      const result = handleTRPCError(error)

      expect(result.message).toBe('Not authenticated')
      expect(result.code).toBe('UNAUTHORIZED')
      expect(result.shouldRetry).toBe(false)
    })

    it('should handle TIMEOUT error as retryable', () => {
      const error = new TRPCError({
        code: 'TIMEOUT',
        message: 'Request timed out',
      })

      const result = handleTRPCError(error)

      expect(result.shouldRetry).toBe(true)
    })

    it('should handle NETWORK_ERROR as retryable', () => {
      const error = new TRPCError({
        code: 'NETWORK_ERROR',
        message: 'Network failed',
      })

      const result = handleTRPCError(error)

      expect(result.shouldRetry).toBe(true)
    })

    it('should handle AppError', () => {
      const error = new AppError('Custom error', 'VALIDATION_ERROR', 400)

      const result = handleTRPCError(error)

      expect(result.message).toBe('Custom error')
      expect(result.code).toBe('VALIDATION_ERROR')
      expect(result.shouldRetry).toBe(false)
    })

    it('should handle generic Error', () => {
      const error = new Error('Something went wrong')

      const result = handleTRPCError(error)

      expect(result.message).toBe('Something went wrong')
      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.shouldRetry).toBe(true)
    })
  })

  describe('createErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error')
      expect(createErrorMessage(error)).toBe('Test error')
    })

    it('should handle string error', () => {
      expect(createErrorMessage('String error')).toBe('String error')
    })

    it('should handle null/undefined', () => {
      expect(createErrorMessage(null)).toBe('An unexpected error occurred')
      expect(createErrorMessage(undefined)).toBe('An unexpected error occurred')
    })

    it('should use fallback for Error without message', () => {
      const error = new Error()
      expect(createErrorMessage(error, 'Custom fallback')).toBe('Custom fallback')
    })
  })

  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError('Test message', 'CUSTOM_CODE', 418)

      expect(error.message).toBe('Test message')
      expect(error.code).toBe('CUSTOM_CODE')
      expect(error.statusCode).toBe(418)
      expect(error.name).toBe('AppError')
    })

    it('should use default values', () => {
      const error = new AppError('Test message')

      expect(error.code).toBe('INTERNAL_SERVER_ERROR')
      expect(error.statusCode).toBe(500)
    })
  })
})
