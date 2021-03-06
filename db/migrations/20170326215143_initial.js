exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('profiles', function (table) {
      table.increments('id').unsigned().primary();
      table.string('first', 100).nullable();
      table.string('last', 100).nullable();
      table.string('display', 100).nullable();
      table.string('email', 100).nullable().unique();
      table.string('phone', 100).nullable();
      table.timestamps(true, true);
    }),
    knex.schema.createTableIfNotExists('auths', function(table) {
      table.increments('id').unsigned().primary();
      table.string('type', 8).notNullable();
      table.string('oauth_id', 30).nullable();
      table.string('password', 100).nullable();
      table.string('salt', 100).nullable();
      table.integer('profile_id').references('profiles.id').onDelete('CASCADE');
    }),
    knex.schema.createTableIfNotExists('users', function(table) {
      table.increments('id').unsigned().primary();
      table.string('email', 100).nullable();
      table.string('github_handle', 100).unique().notNullable();
      table.string('profile_photo', 200).nullable();
      table.integer('verified').notNullable().defaultTo(1);
    }),
    knex.schema.createTableIfNotExists('boards', function(table) {
      table.increments('id').unsigned().primary();
      table.string('board_name', 50).notNullable();
      table.string('repo_name', 100).nullable();
      table.string('repo_url', 200).nullable();
      table.integer('owner_id').references('users.id').onDelete('CASCADE');
      // owner id could be moved to boards_users
    }),
    knex.schema.createTableIfNotExists('boards_users', function(table) {
      table.increments('id').unsigned().primary();
      table.integer('user_id').references('users.id').onDelete('CASCADE');
      table.integer('board_id').references('boards.id').onDelete('CASCADE');
      // add ownership/privileges?
    }),
    knex.schema.createTableIfNotExists('boards_invites', function(table) {
      table.increments('id').unsigned().primary();
      table.string('invitee_handle').references('users.github_handle').onDelete('CASCADE');
      table.integer('board_id').references('boards.id').onDelete('CASCADE');
      table.timestamp('last_email').nullable();
    }),
    knex.schema.createTableIfNotExists('panels', function(table) {
      table.increments('id').unsigned().primary();
      table.string('name', 50).notNullable();
      table.date('due_date').nullable();
      table.integer('board_id').references('boards.id').onDelete('CASCADE');
    }),
    knex.schema.createTableIfNotExists('tickets', function(table) {
      table.increments('id').unsigned().primary();
      table.string('title', 100).notNullable();
      table.string('description', 200).nullable();
      table.string('status', 20).notNullable();
      table.integer('priority').notNullable();
      // TODO: type needs a char limit!
      table.string('type', 20).nullable();
      table.timestamps(true, true);
      table.integer('creator_id').references('users.id').onDelete('CASCADE');
      //table.integer('assignee_id').references('users.id').onDelete('CASCADE');
      //table.string('assignee_handle', 100).notNullable();
      table.string('assignee_handle').references('users.github_handle').onDelete('CASCADE');
      table.integer('panel_id').references('panels.id').onDelete('CASCADE');
      table.integer('board_id').references('boards.id').onDelete('CASCADE');
    })
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('tickets'),
    knex.schema.dropTable('panels'),
    knex.schema.dropTable('boards_invites'),
    knex.schema.dropTable('boards_users'),
    knex.schema.dropTable('boards'),
    knex.schema.dropTable('users'),
    knex.schema.dropTable('auths'),
    knex.schema.dropTable('profiles')
  ]);
};