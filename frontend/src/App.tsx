import React, { useState } from 'react';
import './App.css';
import NoteList from './components/NoteList';
import NoteDetail from './components/NoteDetail';
import StagingArea from './components/StagingArea';
import { Note } from './types';

function App() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger re-renders

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  };

  const handleNoteUpdate = () => {
    // Increment key to force re-fetch in child components
    setRefreshKey(prevKey => prevKey + 1);
    setSelectedNote(null);
  }

  return (
    <div className="App">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Staging Area</h2>
        </div>
        <StagingArea onCommit={handleNoteUpdate} />
        
        <div className="sidebar-header">
          <h2>Committed Notes</h2>
        </div>
        <NoteList key={refreshKey} onNoteSelect={handleNoteSelect} />
      </div>
      <main className="main-content">
        <div className="main-header">
          <h2>Note Details</h2>
        </div>
        {selectedNote ? <NoteDetail noteId={selectedNote._id} /> : <div>Select a note to view details.</div>}
      </main>
    </div>
  );
}

export default App;