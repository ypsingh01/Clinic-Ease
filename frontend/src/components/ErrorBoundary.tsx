import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button, Card } from '@/components/ui'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ClinicEase UI error', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-bg flex min-h-dvh items-center justify-center px-6">
          <Card padding="lg" className="max-w-md text-center">
            <p className="text-primary text-sm font-medium">Something went wrong</p>
            <h1 className="font-display mt-2 text-xl font-medium">We hit an unexpected error</h1>
            <p className="text-text-secondary mt-2 text-sm leading-relaxed">
              Try reloading. If this keeps happening, sign out and back in.
            </p>
            {this.state.error.message ? (
              <p className="text-text-muted mt-3 break-words font-mono text-xs">
                {this.state.error.message}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button onClick={() => window.location.assign('/')}>Go home</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  this.setState({ error: null })
                  window.location.reload()
                }}
              >
                Reload
              </Button>
            </div>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
