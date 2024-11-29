import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
export interface Job {
	id: string;
	created_at: string;
	updated_at: string;
	title: string;
	company: string;
	url: string;
	is_local: boolean;
	applied: boolean;
	email: string;
	location: string;
}

export interface AlertDialogueMsg {
	type: string;
	msg: string;
}

export type Query = PostgrestFilterBuilder<any, any, any[], 'jobs', unknown>;
export type SortType = 'all' | 'active' | 'applied';
export type FilterType = 'date' | 'local' | 'remote';
