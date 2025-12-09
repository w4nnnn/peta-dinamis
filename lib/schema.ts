import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const locations = sqliteTable('locations', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
