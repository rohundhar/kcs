export interface RelationshipType {
  _id: string;
  label: string;
  color?: string;
  isDefault: boolean;
}

export interface Link {
  targetNoteId: string;
  relationshipTypeId: string;
}

export interface Backlink {
    sourceNoteId: string;
    sourceNoteTitle: string;
    relationshipTypeId: string;
}

export interface Note {
  _id: string;
  title: string;
  body: string;
  category: "Fleeting" | "Literature" | "Deduction";
  isPermanent: boolean;
  status: "staged" | "committed";
  source?: string;
  links: Link[];
  backlinks?: Backlink[];
  createdAt: string;
  updatedAt: string;
}

// For the UI, we'll manage suggested links ephemerally
export interface SuggestedLink extends Link {
  // We need to store titles and labels for display purposes
  targetNoteTitle: string;
  relationshipTypeLabel: string;
}