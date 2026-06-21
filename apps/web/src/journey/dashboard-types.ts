// Client-safe dashboard types (no pg). Members (Me/Family/Group) + passport scans per member.
export interface Member {
  memberId: string; // 'me' for the account holder
  name: string;
  relation: string; // 'Me' | 'Family' | 'Group'
}

export interface PassportFields {
  passportNumber: string;
  surname: string;
  givenNames: string;
  nationality: string;
  dob: string;
  expiry: string;
  sex: string;
}

export type PassportStatus = 'none' | 'uploaded' | 'confirmed';

export interface PassportScan {
  memberId: string;
  imageKey: string | null;
  extracted: PassportFields;
  status: PassportStatus;
}

export const EMPTY_PASSPORT: PassportFields = {
  passportNumber: '',
  surname: '',
  givenNames: '',
  nationality: '',
  dob: '',
  expiry: '',
  sex: '',
};

export interface DashboardStore {
  listMembers(ownerId: string): Promise<Member[]>;
  addMember(ownerId: string, name: string, relation: string): Promise<Member>;
  removeMember(ownerId: string, memberId: string): Promise<void>;
  getPassport(ownerId: string, memberId: string): Promise<PassportScan | undefined>;
  savePassport(ownerId: string, memberId: string, scan: Omit<PassportScan, 'memberId'>): Promise<void>;
}
