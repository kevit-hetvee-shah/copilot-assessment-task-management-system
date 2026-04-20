/**
 * Root application component.
 * Renders the top-level layout; feature components will be composed here.
 */
import React from 'react'

function App(): React.ReactElement {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Management</h1>
      </header>
      <main className="app-main">
        {/* TaskTable, FilterBar, TaskModal will be mounted here */}
        <p>App is running — components coming soon.</p>
      </main>
    </div>
  )
}

export default App
