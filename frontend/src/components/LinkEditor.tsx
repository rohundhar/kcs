import React, { useState, useEffect } from 'react';
import { getNotes, getRelationshipTypes } from '../api/apiClient';
import { Note, RelationshipType, SuggestedLink } from '../types';

interface LinkEditorProps {
  suggestedLinks: SuggestedLink[];
  setSuggestedLinks: React.Dispatch<React.SetStateAction<SuggestedLink[]>>;
}

const LinkEditor: React.FC<LinkEditorProps> = ({ suggestedLinks, setSuggestedLinks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [relTypes, setRelTypes] = useState<RelationshipType[]>([]);
  const [selectedRelTypeId, setSelectedRelTypeId] = useState<string>('');

  useEffect(() => {
    const fetchRelTypes = async () => {
      try {
        const response = await getRelationshipTypes();
        setRelTypes(response.data);
        if (response.data.length > 0) {
          setSelectedRelTypeId(response.data[0]._id);
        }
      } catch (error) {
        console.error("Error fetching relationship types:", error);
      }
    };
    fetchRelTypes();
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const fetchResults = async () => {
      try {
        const response = await getNotes('committed', searchTerm);
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error searching notes:", error);
      }
    };
    
    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);

  }, [searchTerm]);

  const addLink = (targetNote: Note) => {
    if (!selectedRelTypeId) {
      alert("Please select a relationship type.");
      return;
    }
    const newLink: SuggestedLink = {
      targetNoteId: targetNote._id,
      relationshipTypeId: selectedRelTypeId,
      targetNoteTitle: targetNote.title,
      relationshipTypeLabel: relTypes.find(rt => rt._id === selectedRelTypeId)?.label || 'unknown'
    };

    // Prevent adding duplicate links
    if (!suggestedLinks.some(link => link.targetNoteId === newLink.targetNoteId)) {
        setSuggestedLinks(prev => [...prev, newLink]);
    }
    
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeLink = (targetNoteId: string) => {
    setSuggestedLinks(prev => prev.filter(link => link.targetNoteId !== targetNoteId));
  }

  return (
    <div className="link-editor-container">
      <h4>Add Links to Committed Notes</h4>
      <div className="add-link-form">
        <select value={selectedRelTypeId} onChange={e => setSelectedRelTypeId(e.target.value)}>
          {relTypes.map(rt => (
            <option key={rt._id} value={rt._id}>{rt.label}</option>
          ))}
        </select>
        <div style={{ position: 'relative', flexGrow: 1 }}>
          <input
            type="text"
            placeholder="Search for a note to link..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
          {searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map(note => (
                <li key={note._id} onClick={() => addLink(note)}>
                  {note.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div>
        <h5>Staged Links</h5>
        <ul>
            {suggestedLinks.map(link => (
                <li key={link.targetNoteId}>
                    This note <strong>{link.relationshipTypeLabel}</strong> "{link.targetNoteTitle}"
                    <button onClick={() => removeLink(link.targetNoteId)} style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>X</button>
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default LinkEditor;