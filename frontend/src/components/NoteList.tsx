import React, { useState, useEffect } from 'react';
import { getNotes } from '../api/apiClient';
import { Note } from '../types';

interface NoteListProps {
  onNoteSelect: (note: Note) => void;
}

const NoteList: React.FC<NoteListProps> = ({ onNoteSelect }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await getNotes('committed', searchTerm);
        console.log('fetched notes', response.data);
        setNotes(response.data);
      } catch (error) {
        console.error("Error fetching committed notes:", error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
        fetchNotes();
    }, 300);

    return () => clearTimeout(delayDebounceFn);

  }, [searchTerm]);

  return (
    <>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search committed notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="note-list-container">
        {notes.map((note) => (
          <div
            key={note._id}
            className="note-list-item"
            onClick={() => onNoteSelect(note)}
          >
            <h3>{note.title}</h3>
            <p>Category: {note.category}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default NoteList;