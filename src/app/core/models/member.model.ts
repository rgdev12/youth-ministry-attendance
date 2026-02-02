export interface Member {
  id?: number;
  name: string;
  gender: 'M' | 'F';
  group_id: number;
  created_at?: string;
}
