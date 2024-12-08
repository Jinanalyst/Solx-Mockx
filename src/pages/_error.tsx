import { NextPage } from 'next'

interface ErrorProps {
  statusCode?: number
  message?: string
}

const Error: NextPage<ErrorProps> = ({ statusCode, message }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          {statusCode ? `${statusCode}` : 'Error'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          {message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  const message = err?.message || 'Something went wrong'
  return { statusCode, message }
}

export default Error
