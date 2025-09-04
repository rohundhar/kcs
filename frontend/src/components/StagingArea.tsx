import React, { useState, useEffect } from 'react';
import { createNote, getNotes } from '../api/apiClient';
import { Note, SuggestedLink } from '../types';
import LinkEditor from './LinkEditor';
import { commitNote } from '../api/apiClient';

interface StagingAreaProps {
  onCommit: () => void;
}

const StagingArea: React.FC<StagingAreaProps> = ({ onCommit }) => {
  const [stagedNotes, setStagedNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [reference, setReference] = useState('');
  const [category, setCategory] = useState<'Fleeting' | 'Literature' | 'Deduction'>('Fleeting');
  
  const [selectedStagedNote, setSelectedStagedNote] = useState<Note | null>(null);
  const [suggestedLinks, setSuggestedLinks] = useState<SuggestedLink[]>([]);

  const fetchStagedNotes = async () => {
    try {
      const response = await getNotes('staged');
      setStagedNotes(response.data);
    } catch (error) {
      console.error("Error fetching staged notes:", error);
    }
  };

  useEffect(() => {
    fetchStagedNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    try {
      await createNote({ title, body, category, reference});
      setTitle('');
      setBody('');
      setReference('');
      setCategory('Fleeting');
      fetchStagedNotes();
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleCommit = async () => {
    if (!selectedStagedNote) return;
    try {
        await commitNote(selectedStagedNote._id, suggestedLinks);
        alert("Note committed successfully!");
        setSelectedStagedNote(null);
        setSuggestedLinks([]);
        fetchStagedNotes();
        onCommit(); // Notify parent to refresh committed list
    } catch (error) {
        console.error("Error committing note:", error);
        alert("Failed to commit note.");
    }
  }

  const handleSelectStagedNote = (note: Note) => {
    setSelectedStagedNote(note);
    setSuggestedLinks([]); // Reset links when selecting a new note
  }

  return (
    <>
      <div className="staging-area-container">
        <h4>Create New Note</h4>
        <form onSubmit={handleCreateNote} className="new-note-form">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Body"
            value={body}
            rows={4}
            onChange={(e) => setBody(e.target.value)}
          ></textarea>
          {category === 'Literature' ? <input 
            type="text"
            placeholder='Reference Details'
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          /> : <></> }
          <select value={category} onChange={(e) => setCategory(e.target.value as any)}>
            <option value="Fleeting">Fleeting</option>
            <option value="Literature">Literature</option>
            <option value="Deduction">Deduction</option>
          </select>
          <button type="submit" className="button">Create Staged Note</button>
        </form>
      </div>
      <div className="note-list-container">
        {stagedNotes.map((note) => (
          <div 
            key={note._id} 
            className={`note-list-item ${selectedStagedNote?._id === note._id ? 'selected' : ''}`}
            onClick={() => handleSelectStagedNote(note)}
          >
            <h3>{note.title}</h3>
            <p>Category: {note.category}</p>
          </div>
        ))}
      </div>
       {selectedStagedNote && (
          <div className="staging-area-container">
              <h4>Linking: {selectedStagedNote.title}</h4>
              <LinkEditor
                suggestedLinks={suggestedLinks}
                setSuggestedLinks={setSuggestedLinks}
              />
              <button onClick={handleCommit} className="commit-button">Commit Note & Links</button>
          </div>
       )}
    </>
  );
};

export default StagingArea;