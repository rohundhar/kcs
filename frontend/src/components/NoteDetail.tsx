import React, { useState, useEffect } from 'react';
import { getNoteById, getRelationshipTypes, updateNote } from "../api/apiClient"
import { Note, RelationshipType } from '../types';

interface NoteDetailProps {
  noteId: string;
}

const NoteDetail: React.FC<NoteDetailProps> = ({ noteId }) => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [relTypes, setRelTypes] = useState<RelationshipType[]>([]);

  useEffect(() => {
    const fetchNoteAndRelTypes = async () => {
      if (!noteId) return;
      setIsLoading(true);
      setError('');
      try {
        const noteResponse = await getNoteById(noteId);
        setNote(noteResponse.data);

        if (relTypes.length === 0) {
           const relTypesResponse = await getRelationshipTypes();
           setRelTypes(relTypesResponse.data);
        }

      } catch (err) {
        setError('Failed to fetch note details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNoteAndRelTypes();
  }, [noteId, relTypes.length]);

  const getRelTypeLabel = (id: string) => {
    return relTypes.find(rt => rt._id === id)?.label || 'unknown';
  }
  
  const handlePermanencyToggle = async () => {
      if (!note) return;
      try {
          const updatedIsPermanent = !note.isPermanent;
          await updateNote(note._id, { isPermanent: updatedIsPermanent });
          setNote({ ...note, isPermanent: updatedIsPermanent });
      } catch (error) {
          console.error("Failed to update permanency", error);
          alert("Could not update the note's permanency status.");
      }
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!note) return <div>No note selected.</div>;

  return (
    <div className="note-detail">
      <h1>{note.title}</h1>
      <div className="note-meta">
        <span>Category: {note.category}</span>
        <span>Status: {note.status}</span>
        <span>Last updated: {new Date(note.updatedAt).toLocaleString()}</span>
      </div>
       <div style={{ marginTop: '1rem' }}>
          <label>
              <input 
                  type="checkbox" 
                  checked={note.isPermanent} 
                  onChange={handlePermanencyToggle}
              />
              Mark as Permanent
          </label>
        </div>

      <p className="note-body">{note.body}</p>

      <div className="links-section">
        <h3>Outgoing Links</h3>
        {note.links.length > 0 ? (
          <ul>
            {note.links.map((link, index) => (
              <li key={index}>
                This note <strong>{getRelTypeLabel(link.relationshipTypeId)}</strong> note with ID {link.targetNoteId}
              </li>
            ))}
          </ul>
        ) : <p>No outgoing links.</p>}
      </div>
      
      <div className="links-section">
        <h3>Incoming Links (Backlinks)</h3>
        {note.backlinks && note.backlinks.length > 0 ? (
          <ul>
            {note.backlinks.map((backlink, index) => (
              <li key={index}>
                Note "<em>{backlink.sourceNoteTitle}</em>" <strong>{getRelTypeLabel(backlink.relationshipTypeId)}</strong> this note.
              </li>
            ))}
          </ul>
        ) : <p>No incoming links.</p>}
      </div>
      {note.reference && <div className="links-section">
          <h3>Reference Details</h3>
          {note.reference}
        </div>}
      </div>
  );
};

export default NoteDetail;