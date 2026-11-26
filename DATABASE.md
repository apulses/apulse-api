# Database schema workflow

The API uses only `DATABASE_URL` for PostgreSQL connections. Neon connections use TLS; local non-Neon PostgreSQL connections do not require it.

In development, TypeORM synchronizes missing schema only when `NODE_ENV=development`. Production synchronization is disabled. Do not use synchronization to change the production schema.

Generate and review a migration against the database represented by `DATABASE_URL`:

```sh
pnpm migration:generate -- src/database/migrations/DescribeSchemaChange
```

For a new, empty Neon database, generate and review the initial schema migration while `DATABASE_URL` points to that Neon database. Then build and apply it before deploying the API:

```sh
pnpm migration:build
pnpm migration:run:prod
```

For later changes, generate a migration after editing entities, review its SQL, commit it, build, and run pending migrations before deploying the application. To inspect migration status or revert the last migration, use `pnpm migration:show:prod` or `pnpm migration:revert:prod` after setting the deployment `DATABASE_URL` in the environment.

The migration commands do not run automatically during API startup, which avoids concurrent migration attempts from Vercel instances.
