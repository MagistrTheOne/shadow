import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorState } from '../error-state'

describe('ErrorState', () => {
  it('renders with default props', () => {
    render(<ErrorState />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('We encountered an error. Please try again.')).toBeInTheDocument()
  })

  it('renders with custom title and description', () => {
    render(
      <ErrorState
        title="Custom Error Title"
        description="Custom error description"
      />
    )

    expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
    expect(screen.getByText('Custom error description')).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const mockOnRetry = jest.fn()
    render(<ErrorState onRetry={mockOnRetry} />)

    const retryButton = screen.getByRole('button', { name: /try again/i })
    expect(retryButton).toBeInTheDocument()

    fireEvent.click(retryButton)
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorState />)

    const retryButton = screen.queryByRole('button', { name: /try again/i })
    expect(retryButton).not.toBeInTheDocument()
  })

  it('renders error details when error is provided', () => {
    const testError = new Error('Test error message')
    render(<ErrorState error={testError} />)

    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('renders error stack trace when showStackTrace is true', () => {
    const testError = new Error('Test error')
    testError.stack = 'Error: Test error\n    at testFunction (test.js:1:1)'

    render(<ErrorState error={testError} showStackTrace={true} />)

    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument()
    expect(screen.getByText(/at testFunction/)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<ErrorState className="custom-error-class" />)

    expect(container.firstChild).toHaveClass('custom-error-class')
  })

  it('renders with icon by default', () => {
    render(<ErrorState />)

    // Check if the alert circle icon is rendered
    const icon = document.querySelector('svg.lucide-circle-alert')
    expect(icon).toBeInTheDocument()
  })

  it('handles different error types', () => {
    const networkError = new Error('Network Error: Failed to fetch')
    const validationError = new Error('Validation Error: Invalid input')

    const { rerender } = render(<ErrorState error={networkError} />)
    expect(screen.getByText('Network Error: Failed to fetch')).toBeInTheDocument()

    rerender(<ErrorState error={validationError} />)
    expect(screen.getByText('Validation Error: Invalid input')).toBeInTheDocument()
  })
})
