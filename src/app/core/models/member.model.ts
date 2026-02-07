export interface Member {
  id?: number;
  name: string;
  gender: 'M' | 'F';
  group_id: number;
  is_active?: boolean;
  created_at?: string;
}
