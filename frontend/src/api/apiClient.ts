import axios from 'axios';
import { Note, RelationshipType, SuggestedLink } from '../types';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

// Notes API
export const getNotes = (status: 'staged' | 'committed', query: string = '') =>
  apiClient.get<Note[]>(`/notes?status=${status}&q=${query}`);

export const getNoteById = (id: string) => apiClient.get<Note>(`/notes/${id}`);

export const createNote = (noteData: Partial<Note>) =>
  apiClient.post<Note>('/notes', noteData);

export const updateNote = (id: string, noteData: Partial<Note>) =>
  apiClient.put(`/notes/${id}`, noteData);

export const commitNote = (id: string, links: SuggestedLink[]) => {
  const payload = {
    links: links.map(link => ({
        targetNoteId: link.targetNoteId,
        relationshipTypeId: link.relationshipTypeId
    }))
  };
  return apiClient.post(`/notes/${id}/commit`, payload);
};

// Relationship Types API
export const getRelationshipTypes = () =>
  apiClient.get<RelationshipType[]>('/relationship_types');