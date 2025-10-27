import { render, screen } from '@testing-library/react'
import { LoadingState } from '../loading-state'

describe('LoadingState', () => {
  it('renders with default props', () => {
    render(<LoadingState />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Please wait while we load your content.')).toBeInTheDocument()
  })

  it('renders with custom title and description', () => {
    render(
      <LoadingState
        title="Custom Loading Title"
        description="Custom loading description"
      />
    )

    expect(screen.getByText('Custom Loading Title')).toBeInTheDocument()
    expect(screen.getByText('Custom loading description')).toBeInTheDocument()
  })

  it('renders with spinner icon', () => {
    render(<LoadingState title="Test" description="Test" />)

    // Check if the spinner SVG is rendered
    const spinner = document.querySelector('svg.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<LoadingState className="custom-class" />)

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders spinner with correct size', () => {
    render(<LoadingState size="lg" />)

    // The spinner should be rendered with lg size class
    const spinner = document.querySelector('svg.animate-spin')
    expect(spinner).toHaveClass('size-12')
  })

  it('renders spinner with default size', () => {
    render(<LoadingState />)

    // The spinner should be rendered with default (md) size class
    const spinner = document.querySelector('svg.animate-spin')
    expect(spinner).toHaveClass('size-8')
    expect(spinner).toHaveClass('md:size-10')
  })
})
